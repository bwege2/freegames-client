// Dungeon Crawl Stone Soup 0.34.1 on freegames.stream. The page is the game's own 80x24 screen; Play
// opens the title menu, character creation and the Dungeon. Saves live in the account's server storage,
// the morgue files next to them, and the high-score list is the account's `scores.json`.
import { playerName, type GameContext, type StartGame } from '../../../src/sdk/index.ts';
import { CanvasSurface } from './ui.ts';
import { Game } from './game/game.ts';
import { decodeGame, encodeGame, addScore, type SavedGame, type ScoreEntry } from './game/save.ts';
import { SCREEN_H } from './game/model.ts';
import { gzipSync, gunzipSync } from 'fflate';

declare global {
  interface Window { __crawl?: { text(): string; game(): Game | null } }
}

const SAVE = 'savegame';
const SCORES = 'scores.json';

function randomSeed(): bigint {
  const a = new Uint32Array(2);
  crypto.getRandomValues(a);
  return (BigInt(a[0]) << 32n) | BigInt(a[1]) || 1n;
}

async function readSave(ctx: GameContext): Promise<SavedGame | null> {
  try {
    const bytes = await ctx.storage.get(SAVE);
    if (!bytes || !bytes.length) return null;
    const plain = bytes[0] === 0x1f && bytes[1] === 0x8b ? gunzipSync(bytes) : bytes;
    return JSON.parse(new TextDecoder().decode(plain)) as SavedGame;
  } catch (e) {
    console.warn('crawl: the save could not be read', e);
    return null;
  }
}

async function writeSave(ctx: GameContext, game: Game): Promise<void> {
  if (!game.player || game.dead || game.won) return;
  try {
    if (game.tutorial) return;
    const s = game.snapshot();
    const data = encodeGame(s.world, s.player, s.log, s.hasOrb, s.dead, s.won, game.rng);
    await ctx.storage.put(SAVE, gzipSync(new TextEncoder().encode(JSON.stringify(data)), { level: 6 }));
  } catch (e) {
    console.warn('crawl: the save could not be written', e);
  }
}

async function readScores(ctx: GameContext): Promise<ScoreEntry[]> {
  try {
    const bytes = await ctx.storage.get(SCORES);
    if (!bytes || !bytes.length) return [];
    return JSON.parse(new TextDecoder().decode(bytes)) as ScoreEntry[];
  } catch { return []; }
}

async function writeScores(ctx: GameContext, list: ScoreEntry[]): Promise<void> {
  try { await ctx.storage.put(SCORES, new TextEncoder().encode(JSON.stringify(list))); }
  catch (e) { console.warn('crawl: the score list could not be written', e); }
}

function drawTitle(s: CanvasSurface, hasSave: boolean): void {
  s.clear();
  const title = [
    '  ____                     _                   ____            _ _   ',
    ' |  _ \\ _   _ _ __   __ _  ___  ___  _ __     / ___|_ __ __ _| | |_ ',
    ' | | | | | | | \'_ \\ / _` |/ _ \\/ _ \\| \'_ \\   | |   | \'__/ _` | | | |',
    ' | |_| | |_| | | | | (_| |  __/ (_) | | | |  | |___| | | (_| | | | |',
    ' |____/ \\__,_|_| |_|\\__, |\\___|\\___/|_| |_|   \\____|_|  \\__,_|_|_|_|',
    '                    |___/                                            ',
  ];
  for (let i = 0; i < title.length; i++) s.put(5, 2 + i, title[i], 'LIGHTGREY');
  s.put(19, 9, 'Dungeon Crawl Stone Soup', 'WHITE');
  s.put(28, 10, '0.34.1', 'LIGHTGREY');
  s.put(25, 12, hasSave ? 'a) Continue' : 'a) Play', 'LIGHTGREEN');
  if (hasSave) s.put(25, 13, 'b) New game', 'LIGHTGREY');
  s.put(25, hasSave ? 14 : 13, `${hasSave ? 'c' : 'b'}) Tutorial`, 'LIGHTGREY');
  s.put(25, hasSave ? 15 : 14, `${hasSave ? 'd' : 'c'}) High scores`, 'LIGHTGREY');
  s.put(25, hasSave ? 16 : 15, `${hasSave ? 'e' : 'd'}) Quit`, 'LIGHTGREY');
  s.put(23, 20, 'Press ? in the game for the commands.', 'DARKGREY');
  s.flush();
}

async function titleMenu(s: CanvasSurface, hasSave: boolean): Promise<string> {
  for (;;) {
    drawTitle(s, hasSave);
    const k = await s.readKey();
    if (k === 'a' || k === 'A' || k === '\r') return hasSave ? 'continue' : 'play';
    if (hasSave && (k === 'b' || k === 'B')) return 'new';
    if ((!hasSave && (k === 'b' || k === 'B')) || (hasSave && (k === 'c' || k === 'C'))) return 'tutorial';
    if ((!hasSave && (k === 'c' || k === 'C')) || (hasSave && (k === 'd' || k === 'D'))) return 'scores';
    if ((!hasSave && (k === 'd' || k === 'D')) || (hasSave && (k === 'e' || k === 'E'))) return 'quit';
    if (k === 'q' || k === '\x1b') return 'quit';
  }
}

async function scoreScreen(s: CanvasSurface, scores: ScoreEntry[]): Promise<void> {
  s.clear();
  s.put(0, 0, 'High scores', 'WHITE');
  s.put(1, 2, 'Name', 'WHITE');
  s.put(26, 2, 'Species', 'WHITE');
  s.put(38, 2, 'Background', 'WHITE');
  s.put(56, 2, 'XL', 'WHITE');
  s.put(62, 2, 'Place', 'WHITE');
  for (let i = 0; i < scores.length && i < 18; i++) {
    const e = scores[i];
    s.put(1, 3 + i, e.name.slice(0, 20), e.won ? 'YELLOW' : 'LIGHTGREY');
    s.put(26, 3 + i, e.species.slice(0, 11), 'LIGHTGREY');
    s.put(38, 3 + i, e.job.slice(0, 17), 'LIGHTGREY');
    s.put(56, 3 + i, String(e.xl), 'LIGHTGREY');
    s.put(62, 3 + i, e.place, 'LIGHTGREY');
  }
  if (!scores.length) s.put(1, 3, 'No games recorded yet.', 'DARKGREY');
  s.put(0, SCREEN_H - 1, '-- press any key --', 'DARKGREY');
  s.flush();
  await s.readKey().catch(() => {});
}

async function confirm(s: CanvasSurface, text: string): Promise<boolean> {
  s.clear();
  s.put(1, 10, text, 'WHITE');
  s.put(1, 11, '(y/n)', 'LIGHTGREY');
  s.flush();
  const k = await s.readKey();
  return k === 'y' || k === 'Y';
}

async function runGame(s: CanvasSurface, ctx: GameContext, seed: bigint, setActive: (g: Game | null) => void, loaded?: SavedGame): Promise<Game> {
  let game: Game;
  if (loaded) {
    const decoded = decodeGame(loaded);
    game = Game.fromSave({ surface: s, seed: BigInt(loaded.seed), name: playerName() }, loaded, decoded);
  } else {
    game = new Game({ surface: s, seed, name: playerName() || 'Adventurer' });
  }
  setActive(game);
  let saving = Promise.resolve();
  const queueSave = () => {
    if (!game || game.dead || game.won) return;
    saving = saving.then(() => writeSave(ctx, game)).catch(() => {});
  };
  game.onCheckpoint = queueSave;
  const result = loaded ? await game.resume() : await game.start({ surface: s, seed, name: playerName() || 'Adventurer' });
  await saving;
  const { morgue, score } = game.result();
  if (score && morgue) {
    try {
      const name = game.player.name.replace(/[^A-Za-z0-9._-]/g, '_').slice(0, 24) || 'crawl';
      const file = `morgue-${name}-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
      await ctx.storage.put(file, new TextEncoder().encode(morgue));
    } catch (e) { console.warn('crawl: the morgue file could not be written', e); }
    const scores = addScore(await readScores(ctx), score);
    await writeScores(ctx, scores);
  }
  if (result.kind === 'saved') await writeSave(ctx, game);
  return game;
}

export const start: StartGame = (host, ctx) => {
  const surface = new CanvasSurface(host, ctx.signal);
  let active: Game | null = null;
  window.__crawl = { text: () => surface.text(), game: () => active };
  let stopped = false;

  const run = async (): Promise<void> => {
    for (;;) {
      const saved = await readSave(ctx);
      const choice = await titleMenu(surface, !!saved);
      if (choice === 'quit' || ctx.signal.aborted) break;
      if (choice === 'scores') { await scoreScreen(surface, await readScores(ctx)); continue; }
      if (choice === 'tutorial') {
        const tseed = randomSeed();
        active = new Game({ surface, seed: tseed, name: playerName() || 'Adventurer', tutorial: true });
        await active.start({ surface, seed: tseed, tutorial: true });
        active = null;
        break;
      }
      if (choice === 'new' && saved) {
        if (!await confirm(surface, 'Overwrite the saved game?')) continue;
        try { await ctx.storage.delete(SAVE); } catch { /* ignore */ }
      }
      if (choice === 'continue' && saved) {
        try {
          const loadedGame = await runGame(surface, ctx, BigInt(saved.seed), (g) => { active = g; }, saved);
          active = loadedGame;
        } catch (e) {
          console.warn('crawl: the save could not be continued', e);
          try { await ctx.storage.delete(SAVE); } catch { /* ignore */ }
          continue;
        }
      } else {
        const fresh = await runGame(surface, ctx, randomSeed(), (g) => { active = g; });
        active = fresh;
      }
      active = null;
      if (ctx.signal.aborted) break;
      // a dead/quit game returns to the title screen, as the original returns to its menu
    }
    if (!ctx.signal.aborted) ctx.exit();
  };

  void run().catch((e) => { if (!ctx.signal.aborted) console.error('crawl:', e); });
  return {
    stop: async () => {
      if (stopped) return;
      stopped = true;
      if (active && !active.dead && !active.won) {
        try { await writeSave(ctx, active); } catch { /* the connection may already be gone */ }
      }
      surface.destroy();
      delete window.__crawl;
    },
  };
};
