"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Authentication token is missing.",
        });
    }
    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        return res.status(500).json({
            success: false,
            message: "JWT_SECRET is not configured.",
        });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        const [user] = await db_1.db
            .select({ id: schema_1.users.id, email: schema_1.users.email })
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, decoded.userId))
            .limit(1);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Authentication token is no longer valid. Please log in again.",
            });
        }
        req.user = {
            userId: user.id,
            email: user.email,
        };
        return next();
    }
    catch {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired authentication token.",
        });
    }
};
exports.authMiddleware = authMiddleware;
