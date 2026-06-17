import { Router } from 'express';
import { createCrudRouter } from '@inithium/api-core';
import { gamesService } from './games.service.js';
import { CreateGameSchema, UpdateGameSchema } from './games.validators.js';

export const gamesRouter: Router = createCrudRouter(gamesService, {
  onCreate: CreateGameSchema,
  onUpdate: UpdateGameSchema,
});