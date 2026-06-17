import { Router } from 'express';
import { createCrudRouter } from '@inithium/api-core';
import { assetsService } from './assets.service.js';
import { CreateAssetSchema, UpdateAssetSchema } from './assets.validators.js';

export const assetsRouter: Router = createCrudRouter(assetsService, {
  onCreate: CreateAssetSchema,
  onUpdate: UpdateAssetSchema,
});
