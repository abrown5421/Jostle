import { z } from 'zod';
import type { Game } from '@inithium/types';

const GameSettingOptionSchema = z.object({
  label: z.string().min(1),
  value: z.union([z.string(), z.number(), z.boolean()]),
});

const GameSettingSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['boolean', 'number', 'select', 'range']),
  default: z.union([z.string(), z.number(), z.boolean()]),
  options: z.array(GameSettingOptionSchema).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  required: z.boolean(),
});

const GameRequiredAccountSchema = z.object({
  provider: z.string().min(1),
  label: z.string().min(1),
  isPremium: z.boolean().optional(),
  description: z.string().optional(),
});

export const CreateGameSchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(['music', 'trivia', 'drawing', 'word', 'social', 'party']),
  minPlayers: z.number().int().min(1),
  maxPlayers: z.number().int().min(1),
  estimatedMinutes: z.number().int().min(1),
  thumbnailAsset: z.string().optional(),
  bannerAsset: z.string().optional(),
  settings: z.array(GameSettingSchema).default([]),
  requiredAccounts: z.array(GameRequiredAccountSchema).default([]),
  status: z.enum(['active', 'inactive', 'coming_soon']).default('active'),
  version: z.string().default('1.0.0'),
  isOfficial: z.boolean().default(true),
  createdBy: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
}).refine(
  (data) => data.maxPlayers >= data.minPlayers,
  { message: 'maxPlayers must be greater than or equal to minPlayers', path: ['maxPlayers'] }
) satisfies z.ZodType<Omit<Game, '_id' | 'createdAt' | 'updatedAt'>>; //error here

export const UpdateGameSchema = z.object({
  key: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  category: z.enum(['music', 'trivia', 'drawing', 'word', 'social', 'party']).optional(),
  minPlayers: z.number().int().min(1).optional(),
  maxPlayers: z.number().int().min(1).optional(),
  estimatedMinutes: z.number().int().min(1).optional(),
  thumbnailAssetId: z.string().optional(),
  bannerAssetId: z.string().optional(),
  settings: z.array(GameSettingSchema).optional(),
  requiredAccounts: z.array(GameRequiredAccountSchema).optional(),
  status: z.enum(['active', 'inactive', 'coming_soon']).optional(),
  version: z.string().optional(),
  isOfficial: z.boolean().optional(),
  createdBy: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

export type CreateGameDto = z.infer<typeof CreateGameSchema>;
export type UpdateGameDto = z.infer<typeof UpdateGameSchema>;