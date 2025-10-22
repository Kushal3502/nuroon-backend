import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../lib/generateTokens';
import { ApiError, asyncHandler } from '../utils';

export const authMiddleware = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token =
        req.header('Authorization')?.split(' ')[1] || req.cookies?.accessToken;

      if (!token) throw new ApiError(400, 'Unauthorized access');

      const decodedToken = verifyToken(
        token,
        String(process.env.ACCESS_TOKEN_SECRET),
      ) as { _id: string; email?: string };

      req.user = {
        _id: decodedToken._id,
        email: decodedToken.email,
      };

      next();
    } catch (error: any) {
      throw new ApiError(500, error.message);
    }
  },
);
