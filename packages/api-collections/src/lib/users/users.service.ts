import bcrypt from 'bcryptjs';
import type { User } from '@inithium/types';
import { createCrudService, CrudService } from '@inithium/api-core';
import { UserModel } from './users.model.js';

export interface UsersService extends CrudService<User> {}

const base = createCrudService<User>(UserModel);

const createDefaultAvatar = (firstName: string, lastName: string): NonNullable<User['user_avatar']> => {
  const f = firstName.trim() || 'U';
  const l = lastName.trim() || 'User';
  const initials = `${f[0]}${l[0]}`.toUpperCase();

  return {
    src: '',
    alt: `${firstName} ${lastName}`.trim().toLowerCase(),
    fallback: initials,
    size: 'md',
    status: 'offline',
    shape: 'circle',
    background: 'linear-gradient(135deg, #0f5066, #e2e8f0)',
  };
};

const createDefaultBanner = (): NonNullable<User['user_banner']> => ({
  variance: 0.75,
  cell_size: 40,
  x_colors: ['#0f5066', '#115e7a', '#1e293b'],
  y_colors: ['#1e293b', '#64748b', '#e2e8f0'],
});

export const usersService: UsersService = {
  ...base,

  createOne: async (data) => {
    const rawInput = data as Partial<User>;

    const hashedPassword = rawInput.password 
      ? await bcrypt.hash(rawInput.password, 12) 
      : '';

    const normalizedPayload: Partial<User> = {
      ...rawInput,
      password: hashedPassword,
      role: rawInput.role ?? 'user',
      dark_mode: rawInput.dark_mode ?? false,
      bio: rawInput.bio ?? '',
      phone_number: rawInput.phone_number ?? '',
      dob: rawInput.dob ?? '',
      gender: rawInput.gender ?? { type: 'Prefer Not to Say' },
      address: rawInput.address ?? {
        street: '',
        city: '',
        state: '',
        zip: '',
        country: ''
      },
      user_avatar: rawInput.user_avatar ?? createDefaultAvatar(rawInput.first_name ?? '', rawInput.last_name ?? ''),
      user_banner: rawInput.user_banner ?? createDefaultBanner(),
    };

    return base.createOne(normalizedPayload);
  },
  updateOne: async (id, data) => {
    const rawInput = data as Partial<User>;

    if (rawInput.password) {
      (rawInput as any).password = await bcrypt.hash(rawInput.password, 12);
    }

    return base.updateOne(id, rawInput);
  },
};