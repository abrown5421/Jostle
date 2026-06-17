import { Schema, model } from 'mongoose';
import type { BaseGameState, Session } from '@inithium/types';

const trianglifyOptionsSchema = new Schema(
  {
    variance: { type: Number },
    cell_size: { type: Number },
    x_colors: { type: Schema.Types.Mixed },
    y_colors: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const avatarPropsSchema = new Schema(
  {
    src: { type: String },
    alt: { type: String },
    fallback: { type: String },
    size: { type: String, enum: ['sm', 'md', 'lg', 'xl'] },
    status: { type: String, enum: ['online', 'offline', 'away'] },
    shape: { type: String, enum: ['circle', 'square'] },
    background: { type: String },
    fontColor: { type: String },
  },
  { _id: false }
);

const genderSchema = new Schema(
  {
    type: { type: String, enum: ['Male', 'Female', 'Prefer Not to Say', 'Other'], required: true },
    custom: { type: String },
  },
  { _id: false }
);

const embeddedUserSchema = new Schema(
  {
    _id: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    role: { type: String, enum: ['super-admin', 'admin', 'editor', 'writer', 'user'], required: true },
    user_banner: { type: trianglifyOptionsSchema },
    user_avatar: { type: avatarPropsSchema },
    bio: { type: String },
    gender: { type: genderSchema },
    phone_number: { type: String },
    dob: { type: String },
    dark_mode: { type: Boolean, required: true },
  },
  { _id: false }
);

// Core Session Sub-schemas
const sessionPlayerSchema = new Schema(
  {
    playerId: { type: String, required: true },
    registeredUser: { type: embeddedUserSchema, default: null },
    displayName: { type: String, required: true },
    secret: { type: String }, 
    joinedAt: { type: Date, required: true, default: () => new Date() },
    isHost: { type: Boolean, required: true, default: false },
    isConnected: { type: Boolean, required: true, default: true },
  },
  { _id: false }
);

const sessionTeamSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    color: { type: String },
    playerIds: { type: [String], default: [] },
  },
  { _id: false }
);

const roundScoreSchema = new Schema(
  {
    roundIndex: { type: Number, required: true },
    points: { type: Number, required: true },
    meta: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const playerScoreSchema = new Schema(
  {
    playerId: { type: String, required: true },
    roundScores: { type: [roundScoreSchema], default: [] },
    totalPoints: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const teamScoreSchema = new Schema(
  {
    teamId: { type: String, required: true },
    roundScores: { type: [roundScoreSchema], default: [] },
    totalPoints: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const gameSettingValueSchema = new Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ['boolean', 'number', 'select', 'range'], required: true },
    default: { type: Schema.Types.Mixed, required: true },
    options: { type: Schema.Types.Mixed },
    min: { type: Number },
    max: { type: Number },
    step: { type: Number },
    required: { type: Boolean, required: true },
    value: { type: Schema.Types.Mixed, required: true },
  },
  { _id: false }
);

const sessionConfigSnapshotSchema = new Schema(
  {
    gameId: { type: String, required: true },
    gameKey: { type: String, required: true },
    gameName: { type: String, required: true },
    settings: { type: [gameSettingValueSchema], default: [] },
  },
  { _id: false }
);

const sessionSchema = new Schema<Session<BaseGameState>>(
  {
    lobbyId: { type: String, required: true, index: true },
    hostId: { type: String, required: true, index: true },
    config: { type: sessionConfigSnapshotSchema, required: true },
    players: { type: [sessionPlayerSchema], default: [] },
    teams: { type: [sessionTeamSchema], default: [] },
    playerScores: { type: [playerScoreSchema], default: [] },
    teamScores: { type: [teamScoreSchema], default: [] },
    gameState: { type: Schema.Types.Mixed, required: true },
    status: { type: String, enum: ['configuring', 'active', 'paused', 'completed', 'abandoned'], required: true, default: 'configuring' },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    winnerId: { type: String, default: null },
    winnerTeamId: { type: String, default: null },
  },
  { timestamps: true }
);

export const SessionModel = model<Session<BaseGameState>>('Session', sessionSchema);