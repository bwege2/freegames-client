// A headless Fish Fillets: the port's engine with the original data from assets/, no screen, a
// recording sound player. Used by the tests.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { Env, type DataFiles, type SoundPlayer } from '../src/engine/env.ts';
import { Level, LevelStatus, type LevelHost } from '../src/engine/level.ts';
import { GameState, StateManager } from '../src/engine/state.ts';
import { rng } from '../src/engine/random.ts';

export const ASSETS = join(import.meta.dirname, '..', 'assets');

let scripts: Record<string, string> | null = null;
export function dataFiles(): DataFiles {
  scripts ??= JSON.parse(readFileSync(join(ASSETS, 'scripts.json'), 'utf8')) as Record<string, string>;
  const s = scripts;
  return {
    has: (p) => p in s || existsSync(join(ASSETS, 'data', p)),
    text: (p) => s[p] ?? null,
  };
}

export class RecordingSound implements SoundPlayer {
  log: string[] = [];
  playSound(file: string | null, volume: number, loops: number): number {
    this.log.push(`sound ${file} ${volume} ${loops}`);
    return -1;
  }
  isPlaying(): boolean { return false; }
  halt(): void {}
  playMusic(file: string): void { this.log.push(`music ${file}`); }
  stopMusic(): void { this.log.push('stopmusic'); }
  setVolumes(): void {}
}

class NullState extends GameState {
  readonly name = 'null';
}

export interface Run {
  env: Env;
  manager: StateManager;
  level: Level;
  status: LevelStatus;
  sound: RecordingSound;
  errors: string[];
  /** one game cycle: draw (advances anims), timer, subtitles, game */
  cycle(): void;
}

/** starts the level `codename` like WorldMap::runSelected does, under a placeholder state */
export function runLevel(codename: string, opts: { seed?: number; lang?: string; options?: Record<string, string> } = {}): Run {
  rng.init(opts.seed ?? 1);
  const sound = new RecordingSound();
  const errors: string[] = [];
  const env = new Env(dataFiles(), sound, { width: (t) => t.length * 9 }, () => {});
  env.options.setParam('lang', opts.lang ?? 'en');
  env.options.setParam('speech', 'cs');
  env.options.setParam('screen_width', 640);
  env.options.setParam('screen_height', 480);
  for (const [k, v] of Object.entries(opts.options ?? {})) env.options.setParam(k, v);
  const host: LevelHost = {
    findDesc: (c) => c,
    findLevelName: (c) => c,
    createDemo: () => new NullState(env),
    setScreenSize: () => {},
  };
  const manager = new StateManager();
  const status = new LevelStatus(env);
  status.prepareRun(codename, '', -1, '');
  const level = new Level(env, host, codename, `script/${codename}/init.lua`, 1);
  level.fillStatus(status);
  const base = new NullState(env);
  manager.pushState(null, base);
  base.pushState(level);
  const run: Run = {
    env, manager, level, status, sound, errors,
    cycle() {
      Level.guard(() => {
        if (level.isRunning() && level.script.isRoom()) level.room.draw(null);
        env.cycles++;
        env.subtitles.update();
        manager.updateGame();
      }, (e) => errors.push(e.message));
    },
  };
  return run;
}

/** the models of the room as one line each */
export function snapshot(level: Level): string[] {
  return level.room.models.map((m) => `${m.index} ${m.loc.x},${m.loc.y} ${m.alive ? 'alive' : 'dead'}${m.out ? ' out' : ''}${m.lost ? ' lost' : ''} ${m.lookLeft ? 'L' : 'R'}`);
}
