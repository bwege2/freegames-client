// OpenClonk port: the one setting of the port that is not the original's.

/**
 * NONCOMMERCIAL_FILES: whether the port ships and uses the four files of the original whose sources are
 * non-commercial today (`LICENSE.md`, "Non-commercial files"; `re/openclonk/NOTES.md`, "Licences").
 *
 * - `true` (what the operator chose on 14.11.2026 while the site was non-commercial): the four files are part of the
 *   game, unchanged, as in the original.
 * - `false` (the shipped build): they are neither built nor shipped. The game runs without them: no wind sound
 *   (`Environment::WindLoop`) and no glass-shatter sound (`Hits::Materials::Glass::GlassShatter`), and the start
 *   menu has no parchment (`StartupDlgPaper`, `StartupPlrPropBG`): the original refuses to open its start menu without
 *   the two images, so the page puts plain images of the same sizes in one colour in their place (`src/app.ts`
 *   PARCHMENT_STANDINS).
 *
 * The site's rule is that every asset it ships is free for any use, commercial use included; the four sources are not
 * (CC BY-NC 4.0 and the artist's non-commercial terms), so the shipped build uses `false` and the four files are not
 * committed (`LICENSE.md`, "Non-commercial files"; `README.md`, "The setting NONCOMMERCIAL_FILES"). The setting is
 * kept as the mechanism the operator asked for: `true` still builds and runs them for a non-commercial build, and the
 * tests run both states.
 *
 * `re/openclonk/tools/pack.sh` keeps the four files out of the packed groups, so this setting alone decides.
 */
export const NONCOMMERCIAL_FILES: boolean = false;

/** the four files, as paths in the original's planet folder (the same list as re/openclonk/tools/noncommercial.txt) */
export const NONCOMMERCIAL_PATHS: readonly string[] = [
  'Sound.ocg/Environment.ocg/WindLoop.ogg',
  'Sound.ocg/Hits.ocg/Materials.ocg/Glass.ocg/GlassShatter.ogg',
  'Graphics.ocg/StartupDlgPaper.png',
  'Graphics.ocg/StartupPlrPropBG.png',
];
