// Test helpers: FreeCol's data from the reference release (re/freecol/fetch.sh) or the game's assets,
// the oracle programs (re/freecol/oracle/run.sh) and savegame comparison.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { unzipSync } from 'fflate';

export const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
export const re = path.join(repo, 're/freecol');
export const work = path.join(re, 'work/test');
export const origData = path.join(re, 'orig/src/freecol/data');
export const assetsData = path.join(repo, 'web/games/freecol/assets/data');

/** A JDK: JAVA_HOME, ~/tools/jdk-21*, or java on PATH. */
export function javaHome(): string | null {
  if (process.env.JAVA_HOME && fs.existsSync(path.join(process.env.JAVA_HOME, 'bin/javac'))) return process.env.JAVA_HOME;
  const tools = path.join(process.env.HOME ?? '', 'tools');
  if (fs.existsSync(tools)) {
    for (const d of fs.readdirSync(tools).sort().reverse()) {
      if (d.startsWith('jdk-21') && fs.existsSync(path.join(tools, d, 'bin/javac'))) return path.join(tools, d);
    }
  }
  const r = spawnSync('javac', ['-version']);
  return r.status === 0 ? '' : null;
}

/** Why the oracle cannot run here, or null. */
export function oracleMissing(): string | null {
  if (!fs.existsSync(path.join(re, 'orig/bin/freecol/FreeCol.jar'))) return 'no reference release (run re/freecol/fetch.sh)';
  if (javaHome() == null) return 'no JDK 21 (set JAVA_HOME)';
  return null;
}

export function runOracle(args: string[]): string {
  const jh = javaHome();
  const env = { ...process.env };
  if (jh) env.JAVA_HOME = jh;
  return execFileSync(path.join(re, 'oracle/run.sh'), args, { env, encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'pipe'] });
}

/** A file provider for the virtual file system: /data from a directory. */
export function dataProvider(root: string) {
  const map = (p: string) => (p === '/data' || p.startsWith('/data/') ? path.join(root, p.substring(5)) : null);
  return {
    read(p: string) {
      const f = map(p);
      if (!f) return null;
      try {
        if (fs.statSync(f).isDirectory()) return null;
        return new Uint8Array(fs.readFileSync(f));
      } catch {
        return null;
      }
    },
    list(p: string) {
      const f = map(p);
      if (!f) return null;
      try {
        return fs.readdirSync(f);
      } catch {
        return null;
      }
    },
    isDir(p: string) {
      const f = map(p);
      if (!f) return false;
      try {
        return fs.statSync(f).isDirectory();
      } catch {
        return false;
      }
    },
    has(p: string) {
      const f = map(p);
      if (!f) return false;
      try {
        return fs.statSync(f).isFile();
      } catch {
        return false;
      }
    },
  };
}

let booted = false;

/** The port, set up as the oracle runs the original: the reference data, this user's name (the save's owner). */
export async function bootPort() {
  const fc = await import('../src/freecol.ts');
  if (!booted) {
    fc.vfs.provider = dataProvider(fs.existsSync(path.join(assetsData, 'rules')) ? assetsData : origData);
    fc.$J.properties.set('user.name', os.userInfo().username);
    fc.bootFreeCol();
    booted = true;
  }
  return fc;
}

/** Oracle output, made once and kept in re/freecol/work/test/KEY (the oracle is slow to start). */
export function oracleOutput(key: string, expect: string[], make: (dir: string) => void): string {
  const dir = path.join(work, key);
  if (!expect.every((f) => fs.existsSync(path.join(dir, f)))) {
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
    make(dir);
  }
  return dir;
}

/** savegame.xml of a .fsg, without the configuration comment (paths and the JVM of the machine). */
export function savegameXml(fsg: Uint8Array | string): string {
  const bytes = typeof fsg === 'string' ? new Uint8Array(fs.readFileSync(fsg)) : fsg;
  const xml = new TextDecoder().decode(unzipSync(bytes)['savegame.xml']);
  return xml.replace(/<!--Configuration:[\s\S]*?-->/, '');
}

/** Where two texts first differ, for messages. */
export function firstDiff(a: string, b: string): string {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  const from = Math.max(0, a.lastIndexOf('<', i));
  return `at ${i}:\n  port:     ${a.substring(from, i + 120)}\n  original: ${b.substring(from, i + 120)}`;
}
