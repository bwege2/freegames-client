#!/usr/bin/env node
// Drive the pinned OpenTTD 15.3 dedicated server to generate reference maps
// with a fixed configuration, and save them. This is the oracle: the port's
// maps are compared with these savegames, never with hand-written numbers.
//
// Usage: node re/openttd/tools/oracle.mjs --seed 12345 --out fixtures/seed-12345.sav
// Needs orig/openttd-15.3-linux-generic-amd64 (fetch-binary.sh) and the base
// sets in orig/ (fetch.sh). The binary is not committed.
import { spawn } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const orig = join(here, '..', 'orig');
const binary = join(orig, 'openttd-15.3-linux-generic-amd64', 'openttd');

export const ORACLE_SETTINGS = {
  landscape: 'temperate',
  map_x: 8,
  map_y: 8,
  tgen_smoothness: 1,
  variety: 0,
  quantity_sea_lakes: 0,
  amount_of_rivers: 0,
  tree_placer: 0,
  number_towns: 4, // custom
  custom_town_number: 0,
  industry_density: 0, // fund only: no industries at start
  freeform_edges: 'true',
  water_borders: 16,
  map_height_limit: 0,
  // No post-generation tree growth or spread: the fixture must be the
  // generated map, not a map a few game ticks old.
  extra_tree_placement: 3,
  savegame_format: 'none',
};

export function oracleConfig(settings = ORACLE_SETTINGS) {
  return `[misc]
savegame_format = ${settings.savegame_format}
[difficulty]
number_towns = ${settings.number_towns}
industry_density = ${settings.industry_density}
[game_creation]
landscape = ${settings.landscape}
map_x = ${settings.map_x}
map_y = ${settings.map_y}
tgen_smoothness = ${settings.tgen_smoothness}
variety = ${settings.variety}
quantity_sea_lakes = ${settings.quantity_sea_lakes}
amount_of_rivers = ${settings.amount_of_rivers}
tree_placer = ${settings.tree_placer}
custom_town_number = ${settings.custom_town_number}
water_borders = ${settings.water_borders}
[construction]
freeform_edges = ${settings.freeform_edges}
map_height_limit = ${settings.map_height_limit}
extra_tree_placement = ${settings.extra_tree_placement}
`;
}

function prepare() {
  if (!existsSync(binary)) throw new Error(`missing ${binary}; run re/openttd/tools/fetch-binary.sh`);
  const home = join(orig, 'oracle-home');
  const base = join(home, '.openttd', 'baseset');
  mkdirSync(base, { recursive: true });
  for (const dir of ['opengfx-8.0', 'opensfx-1.0.3', 'openmsx-0.4.2']) {
    for (const f of readdirSync(join(orig, dir))) {
      if (/\.(grf|obg|cat|obs|obm|mid)$/.test(f)) copyFileSync(join(orig, dir, f), join(base, f));
    }
  }
  return { bin: binary, home };
}

/** Run one seed and return the saved file's path, size and SHA-256. */
export async function runSeed(seed, out, settings = ORACLE_SETTINGS, binary = binary, stages = null) {
  const { home } = prepare();
  const cfg = join(home, 'oracle.cfg');
  writeFileSync(cfg, oracleConfig(settings));
  mkdirSync(dirname(out), { recursive: true });
  const save = out.replace(/\.sav$/, '');

  const child = spawn(binary, ['-D', '-c', cfg, '-x'], {
    cwd: dirname(binary),
    env: { ...process.env, HOME: home, ...(stages === null ? {} : { OTTD_ORACLE_STAGES: stages }) },
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  let log = '';
  let consoleReady = false;
  let newgameSent = false;
  let baseGenerated = 0;
  let saveSent = false;
  let quitSent = false;
  const generated = () => (log.match(/Map generated, starting game/g) ?? []).length;

  const maybeSend = () => {
    if (!consoleReady && log.includes('OpenTTD Game Console Revision')) consoleReady = true;
    // The dedicated server generates a default map on start-up; wait for it,
    // then ask for the requested seed and wait for the second generation.
    if (consoleReady && !newgameSent && generated() >= 1) {
      newgameSent = true;
      baseGenerated = generated();
      child.stdin.write(`newgame ${seed}\n`);
    }
    if (newgameSent && !saveSent && generated() > baseGenerated) {
      saveSent = true;
      child.stdin.write(`save ${save}\n`);
    }
    if (saveSent && !quitSent && log.includes('Map successfully saved')) {
      quitSent = true;
      child.stdin.write('quit\n');
    }
  };
  child.stdout.on('data', (d) => { log += d; maybeSend(); });
  child.stderr.on('data', (d) => { log += d; maybeSend(); });
  const code = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => { child.kill('SIGKILL'); reject(new Error(`oracle timeout\n${log.slice(-3000)}`)); }, 180000);
    child.on('exit', (c) => { clearTimeout(timer); resolve(c); });
  });
  if (code !== 0) throw new Error(`openttd exited ${code}\n${log.slice(-3000)}`);
  if (!quitSent) throw new Error(`oracle did not save\n${log.slice(-3000)}`);
  if (process.env.OTTD_ORACLE_TRACE) writeFileSync(out + '.log', log);
  const file = save + '.sav';
  const data = readFileSync(file);
  return { seed, file, bytes: data.length, sha256: createHash('sha256').update(data).digest('hex'), settings, binary, stages };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = process.argv.slice(2);
  const seed = Number(args[args.indexOf('--seed') + 1]);
  const out = args[args.indexOf('--out') + 1];
  const bin = args.includes('--binary') ? args[args.indexOf('--binary') + 1] : binary;
  const stages = args.includes('--stages') ? args[args.indexOf('--stages') + 1] : null;
  let settings = ORACLE_SETTINGS;
  if (args.includes('--variety')) settings = { ...settings, variety: Number(args[args.indexOf('--variety') + 1]) };
  if (args.includes('--rivers')) settings = { ...settings, amount_of_rivers: Number(args[args.indexOf('--rivers') + 1]) };
  if (args.includes('--landscape')) settings = { ...settings, landscape: args[args.indexOf('--landscape') + 1] };
  if (args.includes('--smoothness')) settings = { ...settings, tgen_smoothness: Number(args[args.indexOf('--smoothness') + 1]) };
  if (args.includes('--tree-placer')) settings = { ...settings, tree_placer: Number(args[args.indexOf('--tree-placer') + 1]) };
  if (args.includes('--tree-placement')) settings = { ...settings, extra_tree_placement: Number(args[args.indexOf('--tree-placement') + 1]) };
  if (!Number.isInteger(seed) || !out) {
    console.error('usage: node oracle.mjs --seed <n> --out <file.sav> [--binary B] [--stages S] [--variety V] [--rivers R] [--landscape L] [--smoothness S] [--tree-placer N] [--tree-placement N]');
    process.exit(1);
  }
  const r = await runSeed(seed, out, settings, bin, stages);
  console.log(JSON.stringify(r));
}
