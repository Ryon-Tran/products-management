"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = void 0;
// This file re-exports the product router which lives under `src/routes`
var products_1 = require("./routes/products");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return __importDefault(products_1).default; } });
