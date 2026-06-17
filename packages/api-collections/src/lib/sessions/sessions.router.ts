import { Router, Request, Response } from 'express';
import { createCrudRouter, validate } from '@inithium/api-core';
import { sessionsService } from './sessions.service.js';
import {
  CreateSessionSchema,
  UpdateSessionSchema,
  HostSessionSchema,
  JoinSessionSchema,
} from './sessions.validators.js';

const asyncHandler = (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: (...args: unknown[]) => void) =>
    Promise.resolve(fn(req, res)).catch(next);

export const sessionsRouter: Router = (() => {
  const router = Router();

  router.post(
    '/host',
    validate(HostSessionSchema),
    asyncHandler(async (req, res) => {
      const session = await sessionsService.hostSession(
        req.body.hostId,
        req.body.lobbyId,
        req.body,
      );
      res.status(200).json(session);
    }),
  );

  router.post(
    '/:id/join',
    validate(JoinSessionSchema),
    asyncHandler(async (req, res) => {
      const session = await sessionsService.joinSession(req.params.id, req.body);
      if (!session) {
        res.status(404).json({ error: 'Session not found.' });
        return;
      }
      res.status(200).json(session);
    }),
  );

  router.use(
    createCrudRouter(sessionsService, {
      onCreate: CreateSessionSchema,
      onUpdate: UpdateSessionSchema,
    }),
  );

  return router;
})();