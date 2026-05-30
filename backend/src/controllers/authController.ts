import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { users } from "../db/schema";
import { loginSchema, signupSchema } from "../validations/authValidation";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return secret;
};

const getValidationErrors = (fieldErrors: Record<string, string[] | undefined>) =>
  Object.entries(fieldErrors).map(([field, errors]) => ({
    field,
    message: errors?.[0] ?? "Invalid value",
  }));

const createToken = (payload: { userId: number; email: string }) =>
  jwt.sign(payload, getJwtSecret(), {
    expiresIn: "7d",
  });

export const signup = async (req: Request, res: Response) => {
  try {
    const parsedBody = signupSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: getValidationErrors(parsedBody.error.flatten().fieldErrors),
      });
    }

    const { name, email, password } = parsedBody.data;

    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [createdUser] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      });

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: createdUser,
    });
  } catch (error) {
    console.error("Signup error", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create account right now.",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const parsedBody = loginSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: getValidationErrors(parsedBody.error.flatten().fieldErrors),
      });
    }

    const { email, password } = parsedBody.data;

    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        password: users.password,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

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
  } catch (error) {
    console.error("Login error", error);
    return res.status(500).json({
      success: false,
      message: "Unable to log in right now.",
    });
  }
};
