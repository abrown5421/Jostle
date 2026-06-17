import { z } from 'zod';

const TrianglifyOptionsSchema = z.object({
  variance: z.number().optional(),
  cell_size: z.number().optional(),
  x_colors: z.union([z.string(), z.array(z.string())]).optional(),
  y_colors: z.union([z.string(), z.array(z.string())]).optional(),
});

const AvatarPropsSchema = z.object({
  src: z.string().optional(),
  alt: z.string().optional(),
  fallback: z.string().optional(),
  size: z.enum(['sm', 'md', 'lg', 'xl']).optional(),
  status: z.enum(['online', 'offline', 'away']).optional(),
  shape: z.enum(['circle', 'square']).optional(),
  background: z.string().optional(),
  fontColor: z.string().optional(),
});

const GenderSchema = z.union([
  z.object({ type: z.enum(['Male', 'Female', 'Prefer Not to Say']), custom: z.string().optional() }),
  z.object({ type: z.literal('Other'), custom: z.string().min(1) }),
]);

const UserValidatorSchema = z.object({
  _id: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(1),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  role: z.enum(['super-admin', 'admin', 'editor', 'writer', 'user']),
  user_banner: TrianglifyOptionsSchema.optional(),
  user_avatar: AvatarPropsSchema.optional(),
  bio: z.string().optional(),
  gender: GenderSchema.optional(),
  phone_number: z.string().optional(),
  dob: z.string().optional(),
  dark_mode: z.boolean(),
});

const RoundScoreSchema = z.object({
  roundIndex: z.number().int().min(0),
  points: z.number(),
  meta: z.record(z.string(), z.unknown()).optional(),
});

const PlayerScoreSchema = z.object({
  playerId: z.string().min(1),
  roundScores: z.array(RoundScoreSchema).default([]),
  totalPoints: z.number().default(0),
});

const TeamScoreSchema = z.object({
  teamId: z.string().min(1),
  roundScores: z.array(RoundScoreSchema).default([]),
  totalPoints: z.number().default(0),
});

const SessionPlayerSchema = z.object({
  playerId: z.string().min(1),
  registeredUser: UserValidatorSchema.nullable().optional(),
  displayName: z.string().min(1),
  secret: z.string().optional(),
  joinedAt: z.coerce.date().default(() => new Date()),
  isHost: z.boolean().default(false),
  isConnected: z.boolean().default(true),
});

const SessionTeamSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  color: z.string().optional(),
  playerIds: z.array(z.string()).default([]),
});

const GameSettingValueSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['boolean', 'number', 'select', 'range']),
  default: z.union([z.string(), z.number(), z.boolean()]),
  options: z.unknown().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  required: z.boolean(),
  value: z.union([z.string(), z.number(), z.boolean()]),
});

const SessionConfigSnapshotSchema = z.object({
  gameId: z.string().min(1),
  gameKey: z.string().min(1),
  gameName: z.string().min(1),
  settings: z.array(GameSettingValueSchema).default([]),
});

const GameStateSchema = z.object({
  game: z.string().min(1),
  phase: z.string().min(1),
}).passthrough();

export const CreateSessionSchema = z.object({
  lobbyId: z.string().min(1),
  hostId: z.string().min(1),
  config: SessionConfigSnapshotSchema,
  players: z.array(SessionPlayerSchema).default([]),
  teams: z.array(SessionTeamSchema).default([]),
  playerScores: z.array(PlayerScoreSchema).default([]),
  teamScores: z.array(TeamScoreSchema).default([]),
  gameState: GameStateSchema,
  status: z.enum(['configuring', 'active', 'paused', 'completed', 'abandoned']).default('configuring'),
  startedAt: z.coerce.date().nullable().default(null),
  completedAt: z.coerce.date().nullable().default(null),
  winnerId: z.string().nullable().default(null),
  winnerTeamId: z.string().nullable().default(null),
});

export const UpdateSessionSchema = z.object({
  lobbyId: z.string().min(1).optional(),
  hostId: z.string().min(1).optional(),
  config: SessionConfigSnapshotSchema.optional(),
  players: z.array(SessionPlayerSchema).optional(),
  teams: z.array(SessionTeamSchema).optional(),
  playerScores: z.array(PlayerScoreSchema).optional(),
  teamScores: z.array(TeamScoreSchema).optional(),
  gameState: GameStateSchema.optional(),
  status: z.enum(['configuring', 'active', 'paused', 'completed', 'abandoned']).optional(),
  startedAt: z.coerce.date().nullable().optional(),
  completedAt: z.coerce.date().nullable().optional(),
  winnerId: z.string().nullable().optional(),
  winnerTeamId: z.string().nullable().optional(),
});

export type CreateSessionDto = z.infer<typeof CreateSessionSchema>;
export type UpdateSessionDto = z.infer<typeof UpdateSessionSchema>;
export const HostSessionSchema = CreateSessionSchema;
export type HostSessionDto = CreateSessionDto;
export const JoinSessionSchema = SessionPlayerSchema;
export type JoinSessionDto = z.infer<typeof SessionPlayerSchema>;