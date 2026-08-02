import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: {
        message: 'Authentication token missing or invalid',
        code: 'UNAUTHORIZED'
      }
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      email: string;
      role: Role;
    };

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({
      error: {
        message: 'Invalid or expired token',
        code: 'UNAUTHORIZED'
      }
    });
    return;
  }
};

export const requireRole = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        error: {
          message: 'Not authenticated',
          code: 'UNAUTHORIZED'
        }
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: {
          message: 'You do not have permission to perform this action',
          code: 'FORBIDDEN'
        }
      });
      return;
    }

    next();
  };
};
