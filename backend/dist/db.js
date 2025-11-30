"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.query = query;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/productdb';
const pool = new pg_1.Pool({ connectionString });
exports.pool = pool;
async function query(text, params) {
    return pool.query(text, params);
}
