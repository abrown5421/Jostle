import { Game } from '@inithium/types';
import { Schema, model } from 'mongoose';

const gameSettingOptionSchema = new Schema(
  {
    label: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true },
  },
  { _id: false }
);

const gameSettingSchema = new Schema(
  {
    key:         { type: String, required: true },
    label:       { type: String, required: true },
    description: { type: String },
    type:        { type: String, enum: ['boolean', 'number', 'select', 'range'], required: true },
    default:     { type: Schema.Types.Mixed, required: true },
    options:     { type: [gameSettingOptionSchema], default: undefined },
    min:         { type: Number },
    max:         { type: Number },
    step:        { type: Number },
    required:    { type: Boolean, required: true, default: false },
  },
  { _id: false }
);

const gameRequiredAccountSchema = new Schema(
  {
    provider:    { type: String, required: true },
    label:       { type: String, required: true },
    isPremium:   { type: Boolean },
    description: { type: String },
  },
  { _id: false }
);

const gameCategoryValues  = ['music', 'trivia', 'drawing', 'word', 'social', 'party'];
const gameStatusValues    = ['active', 'inactive', 'coming_soon'];

const gameSchema = new Schema<Game>(
  {
    key:              { type: String, required: true, unique: true, trim: true },
    name:             { type: String, required: true, trim: true },
    description:      { type: String, required: true, trim: true },
    category:         { type: String, enum: gameCategoryValues, required: true },
    minPlayers:       { type: Number, required: true, min: 1 },
    maxPlayers:       { type: Number, required: true, min: 1 },
    estimatedMinutes: { type: Number, required: true, min: 1 },
    thumbnailAsset: { type: String },
    bannerAsset:    { type: String },
    settings:         { type: [gameSettingSchema], default: [] },
    requiredAccounts: { type: [gameRequiredAccountSchema], default: [] },
    status:           { type: String, enum: gameStatusValues, required: true, default: 'active' },
    version:          { type: String, required: true, default: '1.0.0' },
    isOfficial:       { type: Boolean, required: true, default: true },
    createdBy:        { type: String, default: null },
    tags:             { type: [String], default: [] },
  },
  { timestamps: true }
);

export const GameModel = model<Game>('Game', gameSchema);