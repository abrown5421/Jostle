import { Router } from 'express';
import { createCrudRouter } from '@inithium/api-core';
import { usersService } from './users.service.js';
import { CreateUserSchema, UpdateUserSchema } from './users.validators.js';

export const usersRouter: Router = createCrudRouter(usersService, {
  onCreate: CreateUserSchema,
  onUpdate: UpdateUserSchema,
});
