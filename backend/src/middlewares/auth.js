import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from './errorHandler.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.cookies.token) {
      token = req.cookies.token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('No token provided. Please log in to access this resource', 401);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new AppError('Invalid token. Please log in again', 401);
      }
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Token expired. Please log in again', 401);
      }
      throw error;
    }

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      throw new AppError('User no longer exists', 401);
    }

    if (!user.isActive) {
      throw new AppError('User account is deactivated', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
