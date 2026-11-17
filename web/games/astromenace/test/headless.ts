// The AstroMenace port run without a renderer (the tests' helper): load the assets, run the menu and a mission.
// node headless.ts <seed> <mission> <seconds> prints the state at the end.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rng } from '../src/core/math.ts';
import { loadModel3D, MODEL3D_ASSETS } from '../src/core/model3d.ts';
import { models } from '../src/object3d/object3d.ts';
import { scriptFiles } from '../src/game/script.ts';
import { clock, vw_GetTimeThread, vw_InitText, vw_InitTimeThread } from '../src/engine/core.ts';
import {
  Config, Cur, GameConfig, LoadXMLConfigFile, PilotProfile, FirstStartSettings,
  syncObjectConfig,
} from '../src/game/config.ts';
import { world, playerFighter } from '../src/object3d/world.ts';
import { G } from '../src/game/globals.ts';
import { GS } from '../src/object3d/collisions.ts';
import { initParticleSystems, particleSystems, releaseAllParticleSystems, releaseAllLights } from '../src/core/particles.ts';
import { ReleaseAllObject3D, StarSystemRelease } from '../src/game/starsystem.ts';
import { MissionListInit } from '../src/menu/menus.ts';
import { InitMenu, Loop_Proc, MN, MenuStatus } from '../src/menu/menu.ts';
import { InitDialogBoxes } from '../src/menu/dialog.ts';
import { GM } from '../src/game/game.ts';
import '../src/menu/workshop.ts';
import '../src/menu/options.ts';

const ASSETS = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets');
export const haveAssets = existsSync(join(ASSETS, 'models'));
const walk = (d: string): string[] => readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)]));
const buf = (f: string): ArrayBuffer => {
  const b = readFileSync(f);
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.length);
};

let loaded = false;
export function loadAll(): void {
  if (loaded) return;
  loaded = true;
  for (const f of walk(join(ASSETS, 'models')).filter((x) => x.endsWith('.vw3d'))) {
    const name = f.slice(ASSETS.length + 1);
    models.set(name, loadModel3D(buf(f), name, MODEL3D_ASSETS[name] ?? -1));
  }
  for (const f of walk(join(ASSETS, 'script')).filter((x) => x.endsWith('.xml'))) {
    scriptFiles.set(f.slice(ASSETS.length + 1), readFileSync(f, 'utf8'));
  }
  vw_InitText(new Uint8Array(readFileSync(join(ASSETS, 'lang', 'text.csv'))));
}

/** runs the program (menu, then a mission) headless with a fixed seed and a 1/60 s clock */
export function runMission(seed: number, mission: number, seconds: number): string {
  loadAll();
  MissionListInit();
  // command.cpp PrepareToSwitchStatus: nothing of an earlier run stays
  ReleaseAllObject3D();
  releaseAllParticleSystems();
  releaseAllLights();
  StarSystemRelease();
  LoadXMLConfigFile(null, null);
  FirstStartSettings();
  syncObjectConfig();
  const p = new PilotProfile();
  p.Used = true;
  p.Name = 'Headless';
  p.OpenLevelNum = 14;
  Config.Profile[0] = p;
  Cur.CurrentProfile = 0;
  Cur.CurrentMission = mission;
  rng.seed(seed);
  clock.ticks = 0;
  vw_InitTimeThread(0);
  initParticleSystems(GameConfig().VisualEffectsQuality + 1);
  InitDialogBoxes();
  InitMenu(MenuStatus.MAIN_MENU);
  for (let i = 0; i < 60; i++) {
    clock.ticks += 16;
    Loop_Proc();
  }
  MN.command = 13; // SWITCH_FROM_MENU_TO_GAME
  Loop_Proc();
  assert.equal(MN.MenuStatus, MenuStatus.GAME);
  let maxShips = 0;
  for (let t = 0; t < seconds * 60; t++) {
    clock.ticks += 16;
    Loop_Proc();
    maxShips = Math.max(maxShips, world.ShipList.length);
  }
  const f = playerFighter();
  return JSON.stringify({
    time: vw_GetTimeThread(1).toFixed(3),
    ships: world.ShipList.length,
    maxShips,
    ground: world.GroundObjectList.length,
    space: world.SpaceObjectList.length,
    projectiles: world.ProjectileList.length,
    particles: particleSystems.length,
    armor: f ? f.ArmorCurrentStatus.toFixed(3) : 'dead',
    loc: f ? [f.Location.x, f.Location.y, f.Location.z].map((x) => x.toFixed(3)) : null,
    money: G.GameMoney,
    exp: G.GameExperience.toFixed(3),
    kills: [GS.AlienShipsKillQuant, GS.PirateShipsKillQuant, GS.AsteroidsKillQuant],
    complete: GM.GameMissionCompleteStatus,
  });
}


if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.stdout.write(`${runMission(Number(process.argv[2]), Number(process.argv[3]), Number(process.argv[4]))}\n`);
}
