import { type Request, type Response, type NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

interface CustomError extends Error {
  statusCode?: number;
  errors?: Record<string, unknown> | unknown[]; 
}

export const errorMiddleware = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(err.errors && typeof err.errors === 'object' ? { errors: err.errors } : {}),
  });
};