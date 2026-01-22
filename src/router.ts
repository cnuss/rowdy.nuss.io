import { Router, Request, Response, NextFunction } from 'express';

/**
 * Router factory that returns configured Express router
 */
export const router = () => {
  const r = Router();

  r.get('/stream', (req: Request, res: Response, next: NextFunction) => {
    try {
      const timeout = req.query.timeout ? Number(req.query.timeout) : 15;

      type ErrorType =
        | 'destroy'
        | 'error'
        | 'process'
        | 'socket'
        | 'fin'
        | 'hang';
      let error: ErrorType | undefined = undefined;
      let errorAt = Infinity;

      const errorType = req.query.error as string;
      if (
        ['destroy', 'error', 'process', 'socket', 'fin', 'hang'].includes(
          errorType,
        )
      ) {
        error = errorType as ErrorType;
        errorAt = timeout / 2;
      }

      // Watch mode: stream newline-delimited JSON events (like K8s)
      res.setHeader('Content-Type', 'application/x-ndjson');
      res.setHeader('Transfer-Encoding', 'chunked');
      res.setHeader('Cache-Control', 'no-cache, no-store, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
      res.setHeader('X-Content-Type-Options', 'nosniff');

      // Send initial ADDED event
      const sendEvent = (type: string, object: object) => {
        const success = res.write(JSON.stringify({ type, object }) + '\n');
        console.log(`Sent event: ${type}, success: ${success}`);
        if (!success) {
          res.destroy(new Error('Client too slow'));
        }
      };

      const sendError = (type: ErrorType) => {
        if (type === 'destroy') {
          console.log('Simulating stream destroy');
          res.destroy(new Error('Simulated stream destroy'));
          return;
        }
        if (type === 'error') {
          console.log('Simulating stream error');
          res.emit('error', new Error('Simulated stream error'));
          return;
        }
        if (type === 'process') {
          console.log('Simulating process error');
          process.nextTick(() => {
            throw new Error('Simulated process error');
          });
          return;
        }
        if (type === 'socket') {
          console.log('Simulating socket destroy');
          req.socket.destroy();
          return;
        }
        if (type === 'fin') {
          console.log('Simulating FIN from server');
          res.socket?.end();
          return;
        }
        if (type === 'hang') {
          console.log('Simulating hang (no more data)');
          clearInterval(interval);
          // Connection stays open, no more data sent
          return;
        }
      };

      sendEvent('ADDED', { now: new Date().toISOString() });

      // Send MODIFIED events periodically
      const interval = setInterval(() => {
        errorAt--;
        if (error && errorAt <= 0) {
          sendError(error);
          return;
        }
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
