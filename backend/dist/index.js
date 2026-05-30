"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const collegeRoutes_1 = __importDefault(require("./routes/collegeRoutes"));
const savedCollegeRoutes_1 = __importDefault(require("./routes/savedCollegeRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const allowedOrigins = Array.from(new Set([
    ...(process.env.FRONTEND_URL ?? "")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
    "http://localhost:3000",
]));
app.use((0, cors_1.default)({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
}));
app.use(express_1.default.json());
app.get("/", (_req, res) => {
    res.json({
        success: true,
        message: "College Discovery API is running.",
    });
});
app.use("/api/auth", authRoutes_1.default);
app.use("/api/colleges", collegeRoutes_1.default);
app.use("/api/saved-colleges", savedCollegeRoutes_1.default);
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});
app.use((error, _req, res, _next) => {
    console.error(error);
    res.status(500).json({
        success: false,
        message: "Something went wrong on the server.",
    });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
