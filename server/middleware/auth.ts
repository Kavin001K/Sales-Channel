import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  companyId: string;
  userId: string;
  role: 'company' | 'employee' | 'admin';
  employeeId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not configured');
      return res.status(500).json({
        error: 'Server configuration error'
      });
    }

    const decoded = jwt.verify(token, jwtSecret) as AuthUser;

    // Attach user info to request
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token'
      });
    }

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token expired'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
};

/**
 * Middleware to verify that the authenticated user has access to the requested company
 */
export const verifyCompanyAccess = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { companyId } = req.params;

  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }

  // Admin can access all companies
  if (req.user.role === 'admin') {
    return next();
  }

  // Regular users can only access their own company
  if (req.user.companyId !== companyId) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'You do not have access to this company\'s data'
    });
  }

  next();
};

/**
 * Middleware to require admin role
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Admin access required'
    });
  }

  next();
};
