"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.signup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const drizzle_orm_1 = require("drizzle-orm");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const authValidation_1 = require("../validations/authValidation");
const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not configured.");
    }
    return secret;
};
const getValidationErrors = (fieldErrors) => Object.entries(fieldErrors).map(([field, errors]) => ({
    field,
    message: errors?.[0] ?? "Invalid value",
}));
const createToken = (payload) => jsonwebtoken_1.default.sign(payload, getJwtSecret(), {
    expiresIn: "7d",
});
const signup = async (req, res) => {
    try {
        const parsedBody = authValidation_1.signupSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: getValidationErrors(parsedBody.error.flatten().fieldErrors),
            });
        }
        const { name, email, password } = parsedBody.data;
        const [existingUser] = await db_1.db
            .select({ id: schema_1.users.id })
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.email, email))
            .limit(1);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists.",
            });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const [createdUser] = await db_1.db
            .insert(schema_1.users)
            .values({
            name,
            email,
            password: hashedPassword,
        })
            .returning({
            id: schema_1.users.id,
            name: schema_1.users.name,
            email: schema_1.users.email,
            createdAt: schema_1.users.createdAt,
        });
        return res.status(201).json({
            success: true,
            message: "Account created successfully.",
            data: createdUser,
        });
    }
    catch (error) {
        console.error("Signup error", error);
        return res.status(500).json({
            success: false,
            message: "Unable to create account right now.",
        });
    }
};
exports.signup = signup;
const login = async (req, res) => {
    try {
        const parsedBody = authValidation_1.loginSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: getValidationErrors(parsedBody.error.flatten().fieldErrors),
            });
        }
        const { email, password } = parsedBody.data;
        const [user] = await db_1.db
            .select({
            id: schema_1.users.id,
            name: schema_1.users.name,
            email: schema_1.users.email,
            password: schema_1.users.password,
            createdAt: schema_1.users.createdAt,
        })
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.email, email))
            .limit(1);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }
        const token = createToken({
            userId: user.id,
            email: user.email,
        });
        return res.status(200).json({
            success: true,
            message: "Logged in successfully.",
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    createdAt: user.createdAt,
                },
            },
        });
    }
    catch (error) {
        console.error("Login error", error);
        return res.status(500).json({
            success: false,
            message: "Unable to log in right now.",
        });
    }
};
exports.login = login;
