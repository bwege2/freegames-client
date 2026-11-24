// Test helpers: the content as the page gets it, from re/openclonk/tools/pack.sh (re/openclonk/work/pack): the
// original's groups packed by the original's c4group tool, and the four non-commercial files beside them.
import fs from 'node:fs';
import path from 'node:path';
import { re } from './oracle.ts';
import { NONCOMMERCIAL_PATHS } from '../src/settings.ts';
import type { ContentFile, ContentGroup } from '../src/boot.ts';

export const pack = path.join(re, 'work/pack');

/** why the packed content is missing here, or false */
export function packMissing(groups: string[]): string | false {
  const missing = [...groups.map((g) => path.join(pack, g)), ...NONCOMMERCIAL_PATHS.map((p) => path.join(pack, 'noncommercial', p))]
    .find((p) => !fs.existsSync(p));
  return missing ? `packed content missing (re/openclonk/tools/pack.sh): ${path.relative(pack, missing)}` : false;
}

export function packedGroups(groups: string[]): ContentGroup[] {
  return groups.map((name) => ({ name, data: new Uint8Array(fs.readFileSync(path.join(pack, name))) }));
}

/** the non-commercial files that pack.sh keeps beside the groups */
export function noncommercialFiles(): ContentFile[] {
  return NONCOMMERCIAL_PATHS.map((p) => ({ path: p, data: new Uint8Array(fs.readFileSync(path.join(pack, 'noncommercial', p))) }));
}
