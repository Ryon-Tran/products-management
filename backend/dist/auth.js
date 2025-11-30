"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.me = me;
exports.authMiddleware = authMiddleware;
exports.adminMiddleware = adminMiddleware;
const db_1 = require("./db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
async function register(req, res) {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ error: 'Thiếu trường bắt buộc' });
        if (typeof email !== 'string' || !email.includes('@'))
            return res.status(400).json({ error: 'Email không hợp lệ' });
        if (typeof password !== 'string' || password.length < 6)
            return res.status(400).json({ error: 'Mật khẩu quá ngắn (tối thiểu 6 ký tự)' });
        // accept optional address fields
        const { address_line1, address_line2, city, state, postal_code, country, phone } = req.body;
        const hash = await bcryptjs_1.default.hash(password, 10);
        const result = await (0, db_1.query)('INSERT INTO users (name, email, password_hash, address_line1, address_line2, city, state, postal_code, country, phone) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id, name, email, created_at', [name, email, hash, address_line1 || null, address_line2 || null, city || null, state || null, postal_code || null, country || null, phone || null]);
        res.status(201).json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        if (err.code === '23505')
            return res.status(409).json({ error: 'Email đã được sử dụng' });
        res.status(500).json({ error: 'Đăng ký thất bại' });
    }
}
async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: 'Thiếu trường bắt buộc' });
        const result = await (0, db_1.query)('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0)
            return res.status(401).json({ error: 'Thông tin đăng nhập không hợp lệ' });
        const user = result.rows[0];
        const valid = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!valid)
            return res.status(401).json({ error: 'Thông tin đăng nhập không hợp lệ' });
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Đăng nhập thất bại' });
    }
}
async function me(req, res) {
    try {
        const user = req.user;
        if (!user || !user.id)
            return res.status(401).json({ error: 'Chưa xác thực' });
        const u = await (0, db_1.query)('SELECT id, name, email, created_at FROM users WHERE id = $1', [user.id]);
        if (u.rows.length === 0)
            return res.status(404).json({ error: 'Không tìm thấy người dùng' });
        const r = await (0, db_1.query)('SELECT r.name FROM roles r JOIN user_roles ur ON ur.role_id = r.id WHERE ur.user_id = $1', [user.id]);
        const roles = r.rows.map((row) => row.name);
        res.json({ user: u.rows[0], roles });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lấy thông tin người dùng thất bại' });
    }
}
function authMiddleware(req, res, next) {
    const header = req.headers.authorization;
    if (!header)
        return res.status(401).json({ error: 'Thiếu header Authorization' });
    const parts = header.split(' ');
    if (parts.length !== 2)
        return res.status(401).json({ error: 'Header Authorization không hợp lệ' });
    const token = parts[1];
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // attach user id to request
        req.user = { id: payload.userId, email: payload.email };
        next();
    }
    catch (err) {
        return res.status(401).json({ error: 'Token không hợp lệ' });
    }
}
async function adminMiddleware(req, res, next) {
    try {
        const user = req.user;
        if (!user || !user.id)
            return res.status(401).json({ error: 'Chưa xác thực' });
        const r = await (0, db_1.query)(`SELECT r.name FROM roles r JOIN user_roles ur ON ur.role_id = r.id WHERE ur.user_id = $1`, [user.id]);
        const roles = r.rows.map((row) => row.name);
        if (roles.includes('admin'))
            return next();
        return res.status(403).json({ error: 'Cần quyền admin' });
    }
    catch (err) {
        console.error('adminMiddleware error', err);
        return res.status(500).json({ error: 'Lỗi máy chủ' });
    }
}
