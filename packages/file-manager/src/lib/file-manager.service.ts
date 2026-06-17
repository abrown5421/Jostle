import fs from 'fs/promises';
import path from 'path';

export interface CreatePageComponentOptions {
  componentName: string;
  slug: string;
  pagesLibDir: string;
  pagesBarrelIndex: string;
}

export interface DeletePageComponentOptions {
  slug: string;
  pagesLibDir: string;
  pagesBarrelIndex: string;
}

function componentTemplate(componentName: string): string {
  return `import React from 'react';

const ${componentName}: React.FC = () => {
  return <div>${componentName}</div>;
};

export default ${componentName};
`;
}

function barrelTemplate(slug: string): string {
  return `export * from './${slug}';\n`;
}

function barrelExportLine(slug: string): string {
  return `\nexport * from './lib/${slug}/index';\n`;
}

async function readFileText(filePath: string): Promise<string> {
  return fs.readFile(filePath, 'utf-8');
}

async function writeFileText(filePath: string, content: string): Promise<void> {
  await fs.writeFile(filePath, content, 'utf-8');
}

export async function createPageComponent(options: CreatePageComponentOptions): Promise<void> {
  const { componentName, slug, pagesLibDir, pagesBarrelIndex } = options;

  const componentDir = path.join(pagesLibDir, slug);
  const componentFile = path.join(componentDir, `${slug}.tsx`);
  const indexFile = path.join(componentDir, 'index.ts');

  const dirExists = await fs
    .access(componentDir)
    .then(() => true)
    .catch(() => false);

  if (dirExists) {
    throw new Error(`Component directory already exists: ${componentDir}`);
  }

  await fs.mkdir(componentDir, { recursive: true });

  await writeFileText(componentFile, componentTemplate(componentName));

  await writeFileText(indexFile, barrelTemplate(slug));

  const currentBarrel = await readFileText(pagesBarrelIndex);
  const newExportLine = barrelExportLine(slug);

  if (!currentBarrel.includes(newExportLine.trim())) {
    await writeFileText(pagesBarrelIndex, currentBarrel + newExportLine);
  }
}

export async function deletePageComponent(options: DeletePageComponentOptions): Promise<void> {
  const { slug, pagesLibDir, pagesBarrelIndex } = options;

  const componentDir = path.join(pagesLibDir, slug);

  const dirExists = await fs
    .access(componentDir)
    .then(() => true)
    .catch(() => false);

  if (!dirExists) {
    throw new Error(`Component directory does not exist: ${componentDir}`);
  }

  await fs.rm(componentDir, { recursive: true, force: true });

  const currentBarrel = await readFileText(pagesBarrelIndex);
  const exportLine = barrelExportLine(slug);
  const updatedBarrel = currentBarrel.split('\n').filter((line) => line.trim() !== exportLine.trim()).join('\n');

  await writeFileText(pagesBarrelIndex, updatedBarrel.trimEnd() + '\n');
}