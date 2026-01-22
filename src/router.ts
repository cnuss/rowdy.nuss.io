import { Router, Request, Response, NextFunction } from 'express';

/**
 * Router factory that returns configured Express router
 */
export const router = () => {
  const r = Router();

  r.get('/stream', (req: Request, res: Response, next: NextFunction) => {
    try {
      const timeout = req.query.timeout ? Number(req.query.timeout) : 30;

      // Watch mode: stream newline-delimited JSON events (like K8s)
      res.setHeader('Content-Type', 'application/x-ndjson');
      res.setHeader('Transfer-Encoding', 'chunked');
      res.setHeader('Cache-Control', 'no-cache, no-store, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
      res.setHeader('X-Content-Type-Options', 'nosniff');

      // Send initial ADDED event
      const sendEvent = (type: string, object: object) => {
        res.write(JSON.stringify({ type, object }) + '\n');
      };

      sendEvent('ADDED', { now: new Date().toISOString() });

      // Send MODIFIED events periodically
      const interval = setInterval(() => {
        sendEvent('MODIFIED', { now: new Date().toISOString() });
      }, 1000);

      // Clean up on timeout
      const timeoutId = setTimeout(() => {
        sendEvent('DELETED', { now: new Date().toISOString() });
        clearInterval(interval);
        res.end();
      }, timeout * 1000);

      // Clean up if client disconnects
      req.on('close', () => {
        clearInterval(interval);
        clearTimeout(timeoutId);
      });
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
