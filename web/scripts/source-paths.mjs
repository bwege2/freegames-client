// freegames.stream website and game SDK: GPL-3.0-or-later, with an additional permission and additional terms under its section 7 (web/LICENSE.md).
// What the public source repository holds: the source of everything the site sends to browsers, one commit and tag
// per release (web/scripts/publish-source.mjs puts it there, web/scripts/legal.mjs links it on "Licenses & source").
// The game server is not distributed and must never be in it: the paths are an explicit list, checked against NEVER.

export const SOURCE_REPO = 'bwege2/freegames-client';
export const SOURCE_REMOTE = `git@github.com:${SOURCE_REPO}.git`;
export const SOURCE_URL = `https://github.com/${SOURCE_REPO}`;

/**
 * what the public repository holds (paths in this repository). re/nethack: NetHack's port is TypeScript
 * translated from the C source by its tools, and its data (assets/nhdat) is built by the original's
 * tools from the pinned upstream source; the scripts that do both belong to its source. re/abuse: the
 * scripts that build Abuse's data pack (assets/abuse-data.bin) and fonts (src/fontdata.ts) from the
 * pinned release. re/frozenbubble: the script that packs Frozen Bubble's data (assets/fb-data.bin) from the pinned
 * release, and its test oracle. re/freecol: the Java-to-TypeScript translator (j2ts) that wrote FreeCol's
 * port (src/gen) from the pinned release, and its test oracle.
 */
export const SOURCE_PATHS = ['web', 'protocol', 'tools/gen-protocol.sh', 'docs/GAME-INTEGRATION.md', 'server/src/main/resources/xpilot/lib/maps',
  're/nethack', 're/abuse', 're/teeworlds', 're/frozenbubble', 're/freecol'];
/** what it may never hold: the game server and the operations files */
export const NEVER = [/^server\/(?!src\/main\/resources\/xpilot\/lib\/maps\/)/, /^slipstream\//, /^tools\/deploy/, /^docs\/(SERVER|DEPLOY)\.md$/, /^pom\.xml$/,
  /^re\/(?!nethack\/|abuse\/|teeworlds\/|frozenbubble\/|freecol\/)/];

/** The ids of the closed games at `commit`: those whose web/games/<id>/game.json says "closed": true. */
export function closedGames(git, commit) {
  const manifests = git('ls-tree', '-r', '--name-only', commit, '--', 'web/games').split('\n').filter((f) => /^web\/games\/[^/]+\/game\.json$/.test(f));
  const ids = [];
  for (const f of manifests) {
    const m = JSON.parse(git('show', `${commit}:${f}`));
    if (m.closed === true) ids.push(f.split('/')[2]);
  }
  for (const id of ids) if (!/^[a-z0-9-]+$/.test(id)) throw new Error(`a closed game's id must be plain: ${id}`);
  return ids;
}

/**
 * What a closed game (freegames-exclusive, not open source) keeps out of the public repository: its folder
 * web/games/<id>/ (code, art, music, texts, tests, its generated TypeScript binding), its schema
 * protocol/games/<id>.capnp, its icons web/icons/<id>.png and <id>-*.png, and its server module and tests (which the
 * game server rule, NEVER, keeps out anyway).
 */
export function closedPaths(id) {
  return [new RegExp(`^web/games/${id}/`), new RegExp(`^protocol/games/${id}\\.capnp$`), new RegExp(`^web/icons/${id}(-[^/]*)?\\.[a-z]+$`),
    new RegExp(`^server/src/(main|test)/java/net/slop/freegames/games/${id}/`)];
}

/**
 * The files of SOURCE_PATHS at `commit` (git(...args) runs git in this repository), without the closed games'
 * (closedPaths); throws if one must not go public.
 */
export function sourceFiles(git, commit) {
  const closed = closedGames(git, commit).flatMap(closedPaths);
  const files = git('ls-tree', '-r', '--name-only', commit, '--', ...SOURCE_PATHS).split('\n').filter(Boolean)
    .filter((f) => !closed.some((r) => r.test(f)));
  const bad = files.filter((f) => NEVER.some((r) => r.test(f)));
  if (bad.length) throw new Error(`the public source would hold files it must not: ${bad.slice(0, 5).join(', ')}`);
  if (!files.some((f) => f.startsWith('web/src/')) || !files.includes('web/package.json')) throw new Error('the public source misses the website');
  return files;
}
