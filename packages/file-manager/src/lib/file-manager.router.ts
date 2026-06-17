import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createPageComponent, deletePageComponent } from './file-manager.service';

const createPageSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z][a-z0-9-]*$/, 'slug must be lowercase letters, numbers, and hyphens'),
  componentName: z
    .string()
    .min(1)
    .regex(/^[A-Z][A-Za-z0-9]+$/, 'componentName must be PascalCase'),
});

const deletePageSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z][a-z0-9-]*$/, 'slug must be lowercase letters, numbers, and hyphens'),
});

export interface FileManagerRouterOptions {
  pagesLibDir: string;
  pagesBarrelIndex: string;
  onAfterScaffold?: () => Promise<void>;
}

export function createFileManagerRouter(options: FileManagerRouterOptions): Router {
  const { pagesLibDir, pagesBarrelIndex, onAfterScaffold } = options;
  const router = Router();

  router.post('/pages', async (req: Request, res: Response, next: NextFunction) => {
    const parsed = createPageSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    try {
      await createPageComponent({
        slug: parsed.data.slug,
        componentName: parsed.data.componentName,
        pagesLibDir,
        pagesBarrelIndex,
      });

      res.status(201).json({
        message: `Page component "${parsed.data.componentName}" created successfully.`,
        slug: parsed.data.slug,
      });

      onAfterScaffold?.().catch((err) =>
        console.error('[file-manager] onAfterScaffold error:', err),
      );
    } catch (err) {
      console.error('[file-manager] error:', err);
      next(err);
    }
  });

  router.delete('/pages/:slug', async (req: Request, res: Response, next: NextFunction) => {
    const parsed = deletePageSchema.safeParse({ slug: req.params['slug'] });
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    try {
      await deletePageComponent({
        slug: parsed.data.slug,
        pagesLibDir,
        pagesBarrelIndex,
      });

      res.status(200).json({
        message: `Page component "${parsed.data.slug}" deleted successfully.`,
        slug: parsed.data.slug,
      });

      onAfterScaffold?.().catch((err) =>
        console.error('[file-manager] onAfterScaffold error:', err),
      );
    } catch (err) {
      next(err);
    }
  });

  return router;
}