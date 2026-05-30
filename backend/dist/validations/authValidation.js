"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.signupSchema = void 0;
const zod_1 = require("zod");
exports.signupSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters long.")
        .max(80, "Name must be under 80 characters."),
    email: zod_1.z.email("Enter a valid email address.").trim().toLowerCase(),
    password: zod_1.z
        .string()
        .min(6, "Password must be at least 6 characters long.")
        .max(128, "Password must be under 128 characters."),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.email("Enter a valid email address.").trim().toLowerCase(),
    password: zod_1.z
        .string()
        .min(6, "Password must be at least 6 characters long.")
        .max(128, "Password must be under 128 characters."),
});
