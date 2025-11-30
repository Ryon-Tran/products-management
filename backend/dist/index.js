"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const setupDb_1 = __importDefault(require("./setupDb"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = __importDefault(require("./swagger"));
const products_1 = __importDefault(require("./routes/products"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const cartRoutes_1 = __importDefault(require("./routes/cartRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const addressRoutes_1 = __importDefault(require("./routes/addressRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Security middlewares
app.use((0, helmet_1.default)());
// CORS: allow origins from env or allow all in development
// Cho phép tất cả origin (universal CORS)
app.use((0, cors_1.default)());
// Rate limiter
const limiter = (0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(limiter);
app.use(express_1.default.json());
// Swagger UI
app.use('/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default));
app.get('/openapi.json', (_req, res) => res.json(swagger_1.default));
// Centralized error handler
app.use((err, _req, res, _next) => {
    console.error(err);
    if (err.message && err.message.indexOf('CORS') !== -1)
        return res.status(403).json({ error: 'CORS error' });
    res.status(500).json({ error: 'Server error' });
});
// Mount modular routers
app.use('/products', products_1.default);
app.use('/auth', authRoutes_1.default);
app.use('/cart', cartRoutes_1.default);
app.use('/orders', orderRoutes_1.default);
app.use('/categories', categoryRoutes_1.default);
app.use('/addresses', addressRoutes_1.default);
const port = process.env.PORT || 4000;
async function main() {
    try {
        await (0, setupDb_1.default)();
        app.listen(port, () => console.log(`Backend running on port ${port}`));
    }
    catch (err) {
        console.error('Server failed to start due to DB init error');
        process.exit(1);
    }
}
main();
