"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../auth");
const orders_1 = require("../orders");
const router = (0, express_1.Router)();
// Admin cập nhật trạng thái đơn hàng
router.put('/admin/:id/status', auth_1.authMiddleware, auth_1.adminMiddleware, orders_1.updateOrderStatus);
router.post('/', auth_1.authMiddleware, orders_1.createOrder);
router.get('/', auth_1.authMiddleware, orders_1.listOrders);
router.get('/admin', auth_1.authMiddleware, auth_1.adminMiddleware, orders_1.listAllOrders);
router.get('/:id', auth_1.authMiddleware, orders_1.getOrder);
exports.default = router;
