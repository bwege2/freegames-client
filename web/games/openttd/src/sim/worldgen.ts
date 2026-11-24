// The new-game pipeline of src/genworld.cpp: _GenerateWorld seeds Random()
// with the generation seed, StartupEconomy() draws one value, then
// GenerateLandscape() builds the terrain. Towns, industries, objects and
// trees follow in later stages.
import { RandomContext } from './random.ts';
import { generateHeightMap } from './tgp.ts';
import { generateLandscape } from './landscape.ts';
import { generateTrees } from './trees.ts';
import { World } from './world.ts';
import type { GenerationSettings } from './settings.ts';

export interface GeneratedWorld {
  world: World;
  rng: RandomContext;
  /** _economy.fluct, the first Random() draw after seeding. */
  economyFluct: number;
  maxHeight: number;
  mapHeightLimit: number;
  snowLine: number;
  /** StartupEngines' engine-aging seed. */
  engineSeed: number;
  /** StartupDisasters' first disaster delay. */
  disasterDelay: number;
}

export function generateWorld(settings: GenerationSettings): GeneratedWorld {
  const rng = new RandomContext();
  rng.setSeed(settings.generationSeed);

  // StartupEconomy: _economy.fluct = GB(Random(), 0, 8) + 168.
  const economyFluct = (rng.next() & 0xff) + 168;

  const { heightMap, maxHeight, mapHeightLimit } = generateHeightMap(settings, rng);
  const world = new World(1 << settings.mapXLog, 1 << settings.mapYLog);
  const { snowLine, runner } = generateLandscape(world, heightMap, maxHeight, mapHeightLimit, settings, rng);
  // _GenerateWorld: GenerateClearTile (inside GenerateLandscape), then towns,
  // industries, objects and trees. Only trees are ported so far.
  generateTrees(world, settings, rng, mapHeightLimit, snowLine);
  // StartupEngines draws one seed; StartupDisasters resets its delay.
  const engineSeed = rng.next();
  const disasterDelay = (rng.next() & 0x1ff) + 730;
  // _GenerateWorld: 0x500 tile-loop ticks after all generation stages.
  runner.run(world, snowLine, 0x500, true);
  return { world, rng, economyFluct, maxHeight, mapHeightLimit, snowLine, engineSeed, disasterDelay };
}
