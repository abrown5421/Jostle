import { createCrudService, CrudService } from '@inithium/api-core';
import type { BaseGameState, Session, SessionPlayer } from '@inithium/types';
import { SessionModel } from './sessions.model.js';

export interface SessionsService extends CrudService<Session> {
  readonly hostSession: (
    hostId: string,
    lobbyId: string,
    payload: Omit<Session<BaseGameState>, '_id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<Session<BaseGameState>>;
  readonly joinSession: (
    sessionId: string,
    player: SessionPlayer,
  ) => Promise<Session<BaseGameState> | null>;
}

export const sessionsService: SessionsService = {
  ...createCrudService<Session>(SessionModel),
  hostSession: async (hostId, lobbyId, payload) => {
    const doc = await SessionModel.findOneAndUpdate(
      { hostId, lobbyId },
      { $setOnInsert: payload },
      { upsert: true, new: true, lean: true },
    ).exec();

    return doc as Session<BaseGameState>;
  },

  joinSession: async (sessionId, player) => {
    const existing = await SessionModel.findOne(
      { _id: sessionId, 'players.playerId': player.playerId },
      { _id: 1 },
    )
      .lean()
      .exec();

    if (existing) {
      return SessionModel.findOneAndUpdate(
        { _id: sessionId, 'players.playerId': player.playerId },
        {
          $set: {
            'players.$.displayName': player.displayName,
            'players.$.isConnected': true,
          },
        },
        { new: true, lean: true },
      ).exec() as Promise<Session<BaseGameState> | null>;
    }

    return SessionModel.findByIdAndUpdate(
      sessionId,
      { $push: { players: player } },
      { new: true, lean: true },
    ).exec() as Promise<Session<BaseGameState> | null>;
  },
};