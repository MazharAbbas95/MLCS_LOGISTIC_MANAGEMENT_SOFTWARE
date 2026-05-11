import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.issues.map(e => ({
        path: e.path.join('.'),
        message: e.message
      }))
    });
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const statusCode = err.statusCode || 500;
  
  const response = {
    success: false,
    message: isProduction && statusCode === 500 
      ? 'An internal server error occurred' 
      : err.message || 'Internal Server Error',
    ...(isProduction ? {} : { stack: err.stack })
  };

  res.status(statusCode).json(response);
};
