import { createCrudEndpoints } from '../../base/crud-api-factory.js';
import { baseApi } from '../../base/base-api.js';
import type { Game } from '@inithium/types';

export type { Game };

const crudEndpoints = createCrudEndpoints<Game, Omit<Game, '_id'>, Partial<Omit<Game, '_id'>>>('games', 'Game');

export const gamesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    ...crudEndpoints(builder),
    readAllGames: builder.query<Game[], void>({
      query: () => '/games',
      providesTags: ['Game'],
    }),
    readActiveGames: builder.query<Game[], void>({
      query: () => '/games?status=active',
      providesTags: ['Game'],
    }),
  }),
  overrideExisting: false,
});

const {
  useCreateGameMutation,
  useReadOneGameQuery:       useGameQuery,
  useReadManyGameQuery:      useGamesBatchQuery,
  useUpdateOneGameMutation:  useUpdateGameMutation,
  useDeleteOneGameMutation:  useDeleteGameMutation,
  useDeleteManyGameMutation: useDeleteGamesBatchMutation,
  useReadAllGamesQuery,
  useReadActiveGamesQuery,
} = gamesApi as any;

export {
  useCreateGameMutation,
  useGameQuery,
  useGamesBatchQuery,
  useUpdateGameMutation,
  useDeleteGameMutation,
  useDeleteGamesBatchMutation,
  useReadAllGamesQuery,
  useReadActiveGamesQuery,
};