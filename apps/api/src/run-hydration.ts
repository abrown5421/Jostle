import path from 'path';
import fs from 'fs';
import { Model } from 'mongoose';

type SeedPolicy = 'assert' | 'once';

interface SeedRecord {
  seedPolicy: SeedPolicy;
  [key: string]: unknown;
}

interface CollectionConfig {
  name: string;
  model: Model<any>;
  seedFile: string;
  naturalKey: string;
}

async function hydrateCollection(config: CollectionConfig): Promise<void> {
  const { name, model, seedFile, naturalKey } = config;

  if (!fs.existsSync(seedFile)) {
    console.warn(`[hydration] Seed file not found, skipping: ${seedFile}`);
    return;
  }

  const seeds: SeedRecord[] = JSON.parse(fs.readFileSync(seedFile, 'utf-8'));

  let asserted = 0;
  let inserted = 0;
  let skipped  = 0;

  for (const seed of seeds) {
    const { seedPolicy, ...doc } = seed;
    const filter = { [naturalKey]: doc[naturalKey] };

    if (seedPolicy === 'assert') {
      await model.findOneAndUpdate(filter, { $set: doc }, { upsert: true, returnDocument: 'after' });
      asserted++;
    } else {
      const exists = await model.findOne(filter).lean();
      if (!exists) {
        await model.create(doc);
        inserted++;
      } else {
        skipped++;
      }
    }
  }

  console.log(
    `[hydration] ${name}: ${asserted} asserted | ${inserted} inserted | ${skipped} skipped`
  );
}

export async function runHydration(models: {
  PageModel:     Model<any>;
  SettingModel:  Model<any>;
  UserModel:     Model<any>;
  AssetModel:    Model<any>;
}): Promise<void> {
  console.log('[hydration] Starting seed hydration...');

  const seedDir = path.resolve(__dirname, 'seed');

  const collections: CollectionConfig[] = [
    {
      name:       'settings',
      model:      models.SettingModel,
      seedFile:   path.join(seedDir, 'settings.seed.json'),
      naturalKey: 'key',
    },
    {
      name:       'users',
      model:      models.UserModel,
      seedFile:   path.join(seedDir, 'users.seed.json'),
      naturalKey: 'email',
    },
    {
      name:       'pages',
      model:      models.PageModel,
      seedFile:   path.join(seedDir, 'pages.seed.json'),
      naturalKey: 'key',
    },
    {
      name:       'assets',
      model:      models.AssetModel,
      seedFile:   path.join(seedDir, 'assets.seed.json'),
      naturalKey: 'storage_key',
    },
  ];

  for (const config of collections) {
    await hydrateCollection(config);
  }

  console.log('[hydration] Seed hydration complete.');
}