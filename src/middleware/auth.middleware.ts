import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../utils/appError.js';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'Missing, expired, or invalid JWT token');
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

    if (!token) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'Missing, expired, or invalid JWT token');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    
    (req as any).user = { 
      id: decoded.id, 
      name: decoded.name, 
      role: decoded.role 
    };
    next();
  } catch (error) {
    next(new AppError(StatusCodes.UNAUTHORIZED, 'Missing, expired, or invalid JWT token'));
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      return next(new AppError(StatusCodes.FORBIDDEN, 'Valid token but insufficient role/permissions'));
    }
    next();
  };
};