// OpenClonk in the browser: which of the original's content groups the page ships, and which Play waits for.
// (src/content.ts downloads them; this module has no build-time imports, so the tests can read it.)

/** the groups the engine loads for every scenario (C4Reloc's system data: C4CFN_System, Graphics, Material, Sound, Objects, Decoration) */
export const START_GROUPS = ['System.ocg', 'Graphics.ocg', 'Material.ocg', 'Sound.ocg', 'Objects.ocd', 'Decoration.ocd'] as const;
/** the scenario folders of planet/ the page offers: all of the original's release folders (CMakeLists.txt OC_C4GROUPS) */
export const SCENARIO_FOLDERS = ['Tutorials.ocf', 'Missions.ocf', 'Worlds.ocf', 'Parkour.ocf', 'Defense.ocf', 'Arena.ocf'] as const;
/** the music (C4MusicSystem plays it from Music.ocg) */
export const MUSIC_GROUP = 'Music.ocg';
/** every group re/openclonk/tools/pack.sh packs for the page */
export const ALL_GROUPS = [...START_GROUPS, ...SCENARIO_FOLDERS, MUSIC_GROUP] as const;
/**
 * what Play does not wait for (game.json "lazyAssets" names the same files, test/content.test.ts): the music and
 * the scenario folders beyond milestone 2's (Tutorials, Parkour). The page fetches them when it needs them.
 */
export const LAZY_GROUPS = ['Music.ocg', 'Missions.ocf', 'Worlds.ocf', 'Defense.ocf', 'Arena.ocf'] as const;
