import { Router, Request, Response, NextFunction } from 'express';

/**
 * Router factory that returns configured Express router
 */
export const router = () => {
  const r = Router();

  r.get('/stream', (req: Request, res: Response, next: NextFunction) => {
    try {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.send('TODO: Implement streaming endpoint\n');
    } catch (error) {
      next(error);
    }
  });

  r.get('/', (req: Request, res: Response, next: NextFunction) => {
    try {
      res.setHeader('Content-Type', 'application/json');
      res.send({ now: new Date().toISOString() });
    } catch (error) {
      next(error);
    }
  });

  return r;
};
