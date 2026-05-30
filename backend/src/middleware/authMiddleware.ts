import type { NextFunction, Request, Response } from "express";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { users } from "../db/schema";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
  };
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
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
    const decoded = jwt.verify(token, secret) as {
      userId: number;
      email: string;
    };
    db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1)
      .then((rows) => {
        const user = rows[0];

        if (!user) {
          res.status(401).json({
            success: false,
            message: "Authentication token is no longer valid. Please log in again.",
          });
          return;
        }

        req.user = {
          userId: user.id,
          email: user.email,
        };

        next();
      })
      .catch((error) => {
        console.error("Auth middleware lookup error", error);
        res.status(500).json({
          success: false,
          message: "Unable to verify authentication right now.",
        });
      });

    return;
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }
};
