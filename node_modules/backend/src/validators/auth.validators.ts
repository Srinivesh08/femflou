import { z } from 'zod';
import { Role } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';

// Reusable middleware for validating request bodies
export const validateRequest = (schema: z.AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: error.errors
          }
        });
        return;
      }
      next(error);
    }
  };
};

// Zod schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().min(1, 'Name is required'),
  role: z.nativeEnum(Role, {
    errorMap: () => ({ message: 'Invalid role provided' })
  })
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});
