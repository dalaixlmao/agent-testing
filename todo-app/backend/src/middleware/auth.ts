import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Define interface for JWT payload
interface JwtPayload {
  id: string;
}

// Middleware to protect routes
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token;

  // Check if authorization header exists and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'default_jwt_secret'
      ) as JwtPayload;

      // Add user from payload to request object
      (req as any).user = { id: decoded.id };

      next();
    } catch (error) {
      console.error(`Error verifying token: ${error}`);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};