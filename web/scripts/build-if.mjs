// freegames.stream website and game SDK: GPL-3.0-or-later, with an additional permission and additional terms under its section 7 (web/LICENSE.md).
// Build-time switches of a game (docs/GAME-INTEGRATION.md, "Build-time switches"). The lines between
//
//   // build-if ./settings.ts SOME_SETTING
//   ...
//   // build-end
//
// are part of the build only while SOME_SETTING, an `export const SOME_SETTING: boolean = true;` (or `false`) of the
// named module (a path relative to the file), is true. Vite resolves every import it sees (`import.meta.glob`, `?url`,
// `new URL(..., import.meta.url)`) and emits the files it names even when the code around it is dead (`if (false)`,
// a constant `false ? ... : ...`); a switched-off block is removed before Vite looks at it, so the files it names are
// not built at all. The removed lines become empty lines (line numbers stay). TypeScript sees the whole file.
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const BEGIN = /^\s*\/\/ build-if (\S+) ([A-Za-z_$][\w$]*)\s*$/;
const END = /^\s*\/\/ build-end\s*$/;

/** the value of `export const NAME: boolean = true|false;` in the module at path */
export function settingValue(path, name, readFile = (p) => readFileSync(p, 'utf8')) {
  const text = readFile(path);
  const m = new RegExp(`^export const ${name.replace(/\$/g, '\\$')}(?:\\s*:\\s*boolean)?\\s*=\\s*(true|false)\\s*;`, 'm').exec(text);
  if (!m) throw new Error(`build-if: ${path} has no "export const ${name}: boolean = true|false;"`);
  return m[1] === 'true';
}

/**
 * The code of the module at `id` with its switched-off blocks removed (`null` when it has none).
 * `readFile` reads a module's text (the tests pass their own).
 */
export function applyBuildIf(code, id, readFile) {
  if (!code.includes('// build-if ')) return null;
  const lines = code.split('\n');
  let open = null;
  let changed = false;
  for (let i = 0; i < lines.length; i++) {
    const begin = BEGIN.exec(lines[i]);
    if (begin) {
      if (open) throw new Error(`build-if: ${id}:${i + 1}: nested build-if (the one of line ${open.line + 1} is open)`);
      open = { line: i, on: settingValue(resolve(dirname(id), begin[1]), begin[2], readFile) };
      continue;
    }
    if (END.test(lines[i])) {
      if (!open) throw new Error(`build-if: ${id}:${i + 1}: build-end without build-if`);
      if (!open.on) {
        for (let k = open.line + 1; k < i; k++) lines[k] = '';
        changed = true;
      }
      open = null;
    }
  }
  if (open) throw new Error(`build-if: ${id}:${open.line + 1}: build-if without build-end`);
  return changed ? lines.join('\n') : null;
}

/** the Vite plugin (web/vite.config.ts): runs before every other transform */
export function buildIf() {
  return {
    name: 'freegames:build-if',
    enforce: 'pre',
    transform(code, id) {
      if (id.includes('/node_modules/') || !/\.[cm]?[jt]sx?(\?|$)/.test(id)) return null;
      const out = applyBuildIf(code, id.replace(/\?.*$/, ''));
      return out === null ? null : { code: out, map: null };
    },
  };
}
