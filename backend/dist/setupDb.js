"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDb = initDb;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const db_1 = require("./db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function initDb() {
    try {
        const sqlPath = path_1.default.resolve(__dirname, '..', 'init.sql');
        const sql = fs_1.default.readFileSync(sqlPath, 'utf8');
        // run the SQL file (it contains multiple CREATE TABLE IF NOT EXISTS statements)
        await db_1.pool.query(sql);
        // seed default roles
        await db_1.pool.query("INSERT INTO roles (name) VALUES ('admin') ON CONFLICT (name) DO NOTHING");
        await db_1.pool.query("INSERT INTO roles (name) VALUES ('user') ON CONFLICT (name) DO NOTHING");
        // seed default categories
        await db_1.pool.query("INSERT INTO categories (name) VALUES ('Electronics') ON CONFLICT (name) DO NOTHING");
        await db_1.pool.query("INSERT INTO categories (name) VALUES ('Clothing') ON CONFLICT (name) DO NOTHING");
        await db_1.pool.query("INSERT INTO categories (name) VALUES ('Books') ON CONFLICT (name) DO NOTHING");
        // optionally create ADMIN account if env vars provided
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (adminEmail && adminPassword) {
            const existing = await db_1.pool.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
            let userId;
            if (existing.rows.length === 0) {
                const hash = await bcryptjs_1.default.hash(adminPassword, 10);
                const r = await db_1.pool.query('INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id', ['Administrator', adminEmail, hash]);
                userId = r.rows[0].id;
                console.log(`Created admin user ${adminEmail}`);
            }
            else {
                userId = existing.rows[0].id;
                console.log(`Admin user ${adminEmail} already exists`);
            }
            const roleRes = await db_1.pool.query('SELECT id FROM roles WHERE name = $1', ['admin']);
            if (roleRes.rows.length > 0) {
                const roleId = roleRes.rows[0].id;
                await db_1.pool.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, roleId]);
                console.log(`Assigned 'admin' role to ${adminEmail}`);
            }
        }
        console.log('Database initialized (init.sql applied + seeded roles/admin)');
    }
    catch (err) {
        console.error('Failed to initialize DB:', err);
        throw err;
    }
}
exports.default = initDb;
