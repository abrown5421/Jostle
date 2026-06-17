import { createCrudService, CrudService } from '@inithium/api-core';
import type { Game } from '@inithium/types';
import { GameModel } from './games.model.js';

export interface GamesService extends CrudService<Game> {
  // Extend here with games-specific methods as needed
}

export const gamesService: GamesService = {
  ...createCrudService<Game>(GameModel),
};