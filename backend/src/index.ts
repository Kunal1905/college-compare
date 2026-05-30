import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import authRoutes from "./routes/authRoutes";
import collegeRoutes from "./routes/collegeRoutes";
import savedCollegeRoutes from "./routes/savedCollegeRoutes";

dotenv.config();

const app = express();
const allowedOrigins = Array.from(
  new Set([
    ...(process.env.FRONTEND_URL ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
    "http://localhost:3000",
  ])
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "College Discovery API is running.",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/colleges", collegeRoutes);
app.use("/api/saved-colleges", savedCollegeRoutes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(
  (
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong on the server.",
    });
  }
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
