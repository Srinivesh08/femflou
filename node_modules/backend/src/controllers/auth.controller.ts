import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

const generateToken = (user: { id: string; email: string; role: string }) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, role } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({
        error: {
          message: 'User with this email already exists',
          code: 'USER_EXISTS'
        }
      });
      return;
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user (and PatientProfile if role is PATIENT)
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role,
        ...(role === 'PATIENT' && {
          patientProfile: {
            create: {} // Create an empty patient profile attached to this user
          }
        })
      }
    });

    // Generate JWT
    const token = generateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({
        error: {
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        }
      });
      return;
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        error: {
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        }
      });
      return;
    }

    // Generate JWT
    const token = generateToken(user);

    res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: { message: 'Authentication token missing', code: 'UNAUTHORIZED' }
      });
      return;
    }

    const oldToken = authHeader.split(' ')[1];
    
    // Verify the old token. If we want to allow refreshing expired tokens, 
    // we would handle TokenExpiredError explicitly, but here we require a valid token.
    let decoded;
    try {
      decoded = jwt.verify(oldToken, process.env.JWT_SECRET as string) as { id: string };
    } catch (err) {
      res.status(401).json({
        error: { message: 'Token is invalid or expired', code: 'UNAUTHORIZED' }
      });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      res.status(404).json({
        error: { message: 'User no longer exists', code: 'USER_NOT_FOUND' }
      });
      return;
    }

    const token = generateToken(user);
    res.status(200).json({ token });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: { message: 'Not authenticated', code: 'UNAUTHORIZED' } });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        // Include patient profile if they have one
        patientProfile: true
      }
    });

    if (!user) {
      res.status(404).json({
        error: { message: 'User not found', code: 'NOT_FOUND' }
      });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
