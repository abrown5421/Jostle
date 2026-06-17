import { Router, Request, Response, RequestHandler } from 'express';
import { ZodSchema } from 'zod';
import { CrudService } from '../service/base-crud-service.js';

const asyncHandler = (fn: RequestHandler): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export const validate = (schema: ZodSchema): RequestHandler =>
  (req: Request, res: Response, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ errors: result.error.flatten() });
      return;
    }
    req.body = result.data;
    next();
  };

export interface CrudRouterHooks {
  onCreate?: ZodSchema;
  onUpdate?: ZodSchema;
}

export const createCrudRouter = <T>(
  service: CrudService<T>,
  hooks: CrudRouterHooks = {}
): Router => {
  const router = Router();

  router.post(
    '/batch-read',
    asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const { ids } = req.body as { ids: readonly string[] };
      const records = await service.readMany(ids || []);
      res.status(200).json(records);
    })
  );

  router.post(
    '/batch-delete',
    asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const { ids } = req.body as { ids: readonly string[] };
      const outcome = await service.deleteMany(ids || []);
      res.status(200).json(outcome);
    })
  );

  router.get(
    '/',
    asyncHandler(async (_req: Request, res: Response): Promise<void> => {
      const records = await service.readAll();
      res.status(200).json(records);
    })
  );

  router.post(
    '/',
    ...(hooks.onCreate ? [validate(hooks.onCreate)] : []),
    asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const record = await service.createOne(req.body);
      res.status(201).json(record);
    })
  );

  router.get(
    '/:id',
    asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const record = await service.readOne(req.params.id);
      if (!record) {
        res.status(404).end();
        return;
      }
      res.status(200).json(record);
    })
  );

  router.put(
    '/:id',
    ...(hooks.onUpdate ? [validate(hooks.onUpdate)] : []),
    asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const record = await service.updateOne(req.params.id, req.body);
      if (!record) {
        res.status(404).end();
        return;
      }
      res.status(200).json(record);
    })
  );

  router.delete(
    '/:id',
    asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const record = await service.deleteOne(req.params.id);
      if (!record) {
        res.status(404).end();
        return;
      }
      res.status(200).json(record);
    })
  );

  return router;
};