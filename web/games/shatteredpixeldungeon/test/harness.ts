// Test helpers: the translated game booted headless in node, as the oracle runs the original
// (re/shatteredpixeldungeon/oracle/OracleMain.java): libGDX's headless backend with the game's assets as
// internal files, its own files in memory, Messages set up in English.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const gameDir = path.resolve(here, '..');
export const repo = path.resolve(gameDir, '../../..');
export const re = path.join(repo, 're', path.basename(gameDir));
export const goldenDir = path.join(here, 'oracle');

/** The game's assets: the game's assets folder (the original's, tools/assets.sh), else the original's (fetch.sh), else null. */
export function assetsDir(): string | null {
  for (const d of [path.join(gameDir, 'assets'), path.join(re, 'orig/spd/core/src/main/assets')]) {
    if (fs.existsSync(path.join(d, 'messages'))) return d;
  }
  return null;
}

/** A read-only file store over a directory (libGDX's internal files). */
export function dirStore(root: string) {
  const f = (p: string) => path.join(root, p.replace(/^\/+/, ''));
  return {
    read(p: string) {
      try {
        const s = fs.statSync(f(p));
        return s.isFile() ? new Uint8Array(fs.readFileSync(f(p))) : null;
      } catch {
        return null;
      }
    },
    list(p: string) {
      try {
        return fs.readdirSync(f(p));
      } catch {
        return null;
      }
    },
    isDirectory(p: string) {
      try {
        return fs.statSync(f(p)).isDirectory();
      } catch {
        return false;
      }
    },
  };
}

/** The golden output of the oracle: { meta, text } from test/oracle/NAME.txt.gz. */
export function golden(name: string): { meta: Record<string, string>; text: string } {
  const raw = zlib.gunzipSync(fs.readFileSync(path.join(goldenDir, name + '.txt.gz'))).toString('utf8');
  const nl = raw.indexOf('\n');
  const meta: Record<string, string> = {};
  for (const kv of raw.substring(0, nl).replace(/^# /, '').split(' ')) {
    const i = kv.indexOf('=');
    if (i > 0) meta[kv.substring(0, i)] = kv.substring(i + 1);
  }
  return { meta, text: raw.substring(nl + 1) };
}

let booted: any = null;

/**
 * The port, booted once: the runtime's clock fixed to `clock` (milliseconds: the game reads the date,
 * utils/Holiday.java, though the levels do not depend on it), the time zone UTC (goldens.sh runs the oracle
 * with TZ=UTC), identity hashes 1 (the runtime's, as the oracle's -XX:hashCode=2), the headless backend, and
 * what OracleMain does before it calls the driver.
 */
export async function bootPort(clock: number) {
  const rt = await import('../src/jre/index.ts');
  rt.$J.clock = () => clock;
  if (booted) return booted;
  rt.$J.properties.set('user.timezone', 'UTC');
  const dir = assetsDir();
  if (!dir) throw new Error('no assets');
  rt.installHeadless({ internal: dirStore(dir) });
  await import('../src/gen/index.ts');
  const J = rt.$J;
  const Game = J.load('com.watabou.noosa.Game');
  Game.version = '4.0.2';
  Game.versionCode = 922;
  J.load('com.watabou.utils.FileUtils').setDefaultFileProperties(rt.Files_FileType.Absolute, '/spd/');
  const Languages = J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Languages');
  J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages').setup(Languages.ENGLISH);
  booted = { rt, J, Oracle: J.load('freegames.spd.Oracle') };
  return booted;
}

/**
 * The gameplay oracle in the port (OracleMain's "play" mode): the headless backend with the oracle's screen
 * (800x600, 1/60 s frames), the log printed as libGDX's headless logger prints it, the game made by
 * WebLauncher, created and resized as the oracle does; then Oracle.play. Returns what the oracle prints on
 * stdout: the log's lines (as they come) and then the transcript. One game per process: the game's state is
 * static, as on the JVM, where each run is a new process.
 */
export async function playPort(clock: number, seed: bigint, heroClass: number, script: string, mutation?: string): Promise<string> {
  const rt = await import('../src/jre/index.ts');
  rt.$J.clock = () => clock;
  rt.$J.properties.set('user.timezone', 'UTC');
  const dir = assetsDir();
  if (!dir) throw new Error('no assets');
  const out: string[] = [];
  rt.installHeadless({ internal: dirStore(dir), screen: { width: 800, height: 600 }, log: (l) => out.push(l + '\n'), err: (l) => { if (process.env.SPD_ERR) process.stderr.write(l + '\n'); } });
  await import('../src/gen/index.ts');
  const J = rt.$J;
  if (mutation) mutate(J, mutation);
  const Game = J.load('com.watabou.noosa.Game');
  Game.version = '4.0.2';
  Game.versionCode = 922;
  const FileUtils = J.load('com.watabou.utils.FileUtils');
  FileUtils.setDefaultFileProperties(rt.Files_FileType.Absolute, '/spd/');
  const Languages = J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Languages');
  J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages').setup(Languages.ENGLISH);
  const game = J.load('freegames.spd.WebLauncher').create();
  FileUtils.setDefaultFileProperties(rt.Files_FileType.Absolute, '/spd/');
  game.create();
  game.resize(800, 600);
  const transcript = J.load('freegames.spd.Oracle').play(game, seed, heroClass, script);
  return out.join('') + transcript;
}

/**
 * Changes one rule of the translated game (the mutation checks): 'rat-damage' (a rat hits 1 harder),
 * 'hero-accuracy' (the hero's attack skill an eighth).
 */
export function mutate(J: any, name: string) {
  const wrap = (cls: string, m: string, f: (orig: any) => any) => {
    const C = J.load(cls);
    J.initClass(C);
    C.prototype[m] = f(C.prototype[m]);
  };
  if (name === 'rat-damage') {
    wrap('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Rat', 'damageRoll', (o) => function (this: any) { return (o.call(this) + 1) | 0; });
  } else if (name === 'save-hp') {
    // the hero saved with 1 HP less than he has
    wrap('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero', 'storeInBundle', (o) => function (this: any, b: any) {
      o.call(this, b);
      b.put$String$int('HP', (this.HP - 1) | 0);
    });
  } else if (name === 'hero-accuracy') {
    wrap('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero', 'attackSkill', (o) => function (this: any, t: any) { return o.call(this, t) >> 3; });
  } else {
    throw new Error('unknown mutation ' + name);
  }
}

/** What the comparison of play transcripts ignores: the controller library's lines, the save time. */
export function normalizePlay(s: string): string {
  return s.split('\n').filter((l) => !l.startsWith('[Controllers]')).join('\n').replace(/"last_played":\d+/g, '"last_played":0');
}

/** Where two outputs first differ: the line (a depth), the character, and both texts around it. */
export function firstDiff(mine: string, theirs: string): string | null {
  if (mine === theirs) return null;
  const a = mine.split('\n'), b = theirs.split('\n');
  for (let l = 0; l < Math.max(a.length, b.length); l++) {
    const x = a[l] ?? '<missing>', y = b[l] ?? '<missing>';
    if (x === y) continue;
    let i = 0;
    while (i < x.length && i < y.length && x[i] === y[i]) i++;
    const from = Math.max(0, i - 150);
    const what = /^depth \d+/.exec(y)?.[0] ?? /^depth \d+/.exec(x)?.[0] ?? 'line ' + (l + 1);
    return `${what} (line ${l + 1}), character ${i}:\n  port:     …${x.substring(from, i + 150)}\n  original: …${y.substring(from, i + 150)}`;
  }
  return 'they differ in length only';
}
