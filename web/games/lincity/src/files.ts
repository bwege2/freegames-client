// Which of the program's files are kept in the account's storage, and under what name: ~/.lincityrc as
// "lincityrc", the scene ~/.lincity/<n>_<comment> as "scene-<n>" (the comment stays in the file name
// gzip keeps in the scene's header, which is how save_city() writes it). The rest of ~/.lincity
// (res.tmp, results, the temporary save) is the program's scratch space and not kept.
import { HOME } from './lc/stdio.ts';

/** the name gzip keeps in a file's header (FNAME), or null */
export function gzipName(d: Uint8Array): string | null {
  if (d.length < 10 || d[0] !== 0x1f || d[1] !== 0x8b || !(d[3] & 8)) return null;
  let o = 10;
  if (d[3] & 4) o += 2 + (d[10] | (d[11] << 8));
  let s = '';
  while (o < d.length && d[o] !== 0) s += String.fromCharCode(d[o++]);
  return s;
}

/** a path in the home directory -> the storage name, or null when it is not kept */
export function storageName(path: string): string | null {
  if (path === `${HOME}/.lincityrc`) return 'lincityrc';
  const m = /^\/([1-9])_[^/]*$/.exec(path.startsWith(`${HOME}/.lincity`) ? path.slice(HOME.length + 9) : '');
  return m ? `scene-${m[1]}` : null;
}

/** a stored file -> its path in the home directory, or null */
export function homePath(name: string, data: Uint8Array): string | null {
  if (name === 'lincityrc') return `${HOME}/.lincityrc`;
  const m = /^scene-([1-9])$/.exec(name);
  if (!m) return null;
  const file = gzipName(data);
  if (file !== null && file.startsWith(`${m[1]}_`) && !file.includes('/')) return `${HOME}/.lincity/${file}`;
  return `${HOME}/.lincity/${m[1]}_`;
}
