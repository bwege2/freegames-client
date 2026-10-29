// The player's files (what the original keeps in the user's directories: client options, saved games, autosaves,
// maps) in the site's storage, per player (account scope). A file's storage name is its path under one of
// FreeCol's user directories, with a prefix for the directory and every character a storage name cannot hold
// written as _xx (or _uxxxx): "d.save_2fmy_20game.fsg" is .local/share/freecol/save/my game.fsg. The cache
// directory (logs) is not kept.

/** FreeCol's user directories as the port sets them up (user.home /home/player, XDG layout), by prefix. */
export const USER_ROOTS: [string, string][] = [
  ['c', '/home/player/.config/freecol/'],
  ['d', '/home/player/.local/share/freecol/'],
];

/** The storage name of a file, or null if it is not one of the player's files (or its name is too long). */
export function storageName(path: string): string | null {
  for (const [prefix, root] of USER_ROOTS) {
    if (!path.startsWith(root)) continue;
    let s = prefix + '.';
    for (const ch of path.substring(root.length)) {
      const c = ch.codePointAt(0)!;
      if (/[A-Za-z0-9.-]/.test(ch)) s += ch;
      else if (c < 256) s += '_' + c.toString(16).padStart(2, '0');
      else if (c < 0x10000) s += '_u' + c.toString(16).padStart(4, '0');
      else return null;
    }
    return s.length <= 64 ? s : null;
  }
  return null;
}

/** The path of a storage name (storageName's inverse), or null. */
export function storagePath(name: string): string | null {
  const root = USER_ROOTS.find(([p]) => name.startsWith(p + '.'));
  if (!root) return null;
  let s = '';
  const body = name.substring(root[0].length + 1);
  for (let i = 0; i < body.length; i++) {
    if (body[i] !== '_') {
      s += body[i];
    } else if (body[i + 1] === 'u') {
      s += String.fromCharCode(parseInt(body.substring(i + 2, i + 6), 16));
      i += 5;
    } else {
      s += String.fromCharCode(parseInt(body.substring(i + 1, i + 3), 16));
      i += 2;
    }
  }
  return root[1] + s;
}
