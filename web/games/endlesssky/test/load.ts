// Shared loader for the headless tests: the data files the port ships.
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseData } from '../src/data/node.ts';
import { GameData } from '../src/data/gamedata.ts';

export function loadData(): GameData {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'data');
  const files: { path: string; text: string }[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.name.endsWith('.txt')) files.push({ path, text: readFileSync(path, 'utf8') });
    }
  };
  walk(root);
  const data = new GameData();
  data.load(files, parseData);
  return data;
}
