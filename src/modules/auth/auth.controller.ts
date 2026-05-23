import { type Request, type Response, type NextFunction } from 'express';
import { StatusCodes } from "http-status-codes";
import { AuthService } from "./auth.service.js";
import { AppError } from "../../utils/appError.js";
import bcrypt from "bcrypt";
import jwt, { type SignOptions } from 'jsonwebtoken';

const signOptions = {
  expiresIn: process.env.JWT_EXPIRES_IN || '1d'
} as SignOptions;

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Validation errors: name, email, and password are required",
      );
    }

    if (role && role !== "contributor" && role !== "maintainer") {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Validation errors: role must be contributor or maintainer",
      );
    }

    const existingUser = await AuthService.findByEmail(email);
    if (existingUser) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Duplicate resource: Email already exists",
      );
    }

    const newUser = await AuthService.createUser({
      name,
      email,
      password,
      role,
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "User registered successfully",
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Email and password are required",
      );
    }

    const user = await AuthService.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password!))) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Invalid credentials");
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      process.env.JWT_SECRET as string,
      signOptions,
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
