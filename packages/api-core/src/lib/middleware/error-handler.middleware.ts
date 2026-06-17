import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error & { status?: number },
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const status = err.status ?? 500;
  const message = status < 500 ? err.message : 'Internal server error';
  res.status(status).json({ message });
};