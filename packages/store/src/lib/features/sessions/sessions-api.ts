import { createCrudEndpoints } from '../../base/crud-api-factory.js';
import { baseApi } from '../../base/base-api.js';
import type { Session, BaseGameState, SessionPlayer } from '@inithium/types';

export type { Session };

const crudEndpoints = createCrudEndpoints<
  Session<BaseGameState>,
  Omit<Session<BaseGameState>, '_id'>,
  Partial<Omit<Session<BaseGameState>, '_id'>>
>('sessions', 'Session');

export const sessionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    ...crudEndpoints(builder),

    readAllSessions: builder.query<Session<BaseGameState>[], void>({
      query: () => '/sessions',
      providesTags: ['Session'],
    }),

    readActiveSessions: builder.query<Session<BaseGameState>[], void>({
      query: () => '/sessions?status=active',
      providesTags: ['Session'],
    }),

    hostSession: builder.mutation<
      Session<BaseGameState>,
      Omit<Session<BaseGameState>, '_id' | 'createdAt' | 'updatedAt'>
    >({
      query: (body) => ({
        url: '/sessions/host',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Session'],
    }),

    joinSession: builder.mutation<
      Session<BaseGameState>,
      { sessionId: string; player: SessionPlayer }
    >({
      query: ({ sessionId, player }) => ({
        url: `/sessions/${sessionId}/join`,
        method: 'POST',
        body: player,
      }),
      invalidatesTags: (_res, _err, { sessionId }) => [
        { type: 'Session', id: sessionId },
        'Session',
      ],
    }),

    findSessionByLobbyId: builder.query<Session<BaseGameState> | null, string>({
      query: (lobbyId) => `/sessions?lobbyId=${lobbyId}`,
      transformResponse: (res: Session<BaseGameState>[]) => res[0] ?? null,
      providesTags: (res) =>
        res ? [{ type: 'Session', id: res._id }, 'Session'] : ['Session'],
    }),
  }),
  overrideExisting: false,
});

const {
  useCreateSessionMutation,
  useReadOneSessionQuery: useSessionQuery,
  useReadManySessionQuery: useSessionsBatchQuery,
  useUpdateOneSessionMutation: useUpdateSessionMutation,
  useDeleteOneSessionMutation: useDeleteSessionMutation,
  useDeleteManySessionMutation: useDeleteSessionsBatchMutation,
  useReadAllSessionsQuery,
  useReadActiveSessionsQuery,
  useHostSessionMutation,
  useJoinSessionMutation,
  useFindSessionByLobbyIdQuery,
} = sessionsApi as any;

export {
  useCreateSessionMutation,
  useSessionQuery,
  useSessionsBatchQuery,
  useUpdateSessionMutation,
  useDeleteSessionMutation,
  useDeleteSessionsBatchMutation,
  useReadAllSessionsQuery,
  useReadActiveSessionsQuery,
  useHostSessionMutation,
  useJoinSessionMutation,
  useFindSessionByLobbyIdQuery,
};