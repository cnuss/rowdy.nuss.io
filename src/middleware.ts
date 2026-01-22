import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  // Check if debug mode is enabled
  const debug = req.header('x-debug') === 'true';

  if (debug) {
    res.status(500).json({
      message: err.message,
      stack: err.stack,
    });
  } else {
    res.status(500).json({
      message: 'Internal Server Error',
    });
  }
};
