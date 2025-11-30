"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categories_1 = require("../categories");
const auth_1 = require("../auth");
const router = (0, express_1.Router)();
router.get('/', categories_1.listCategories);
router.post('/', auth_1.authMiddleware, auth_1.adminMiddleware, categories_1.createCategory);
exports.default = router;
