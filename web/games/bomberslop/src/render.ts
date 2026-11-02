// Bomberslop: GPL-3.0-or-later (web/games/bomberslop/LICENSE.md).
// Draws a match on the 320 x 240 pixel screen: the arena of 17 x 13 tiles of 16 px (the original's tiles are 40 px:
// positions are scaled by 0.4), its objects in the original's drawing order (ClanBomberApplication::show_all: by
// their z, the falling ones under the floor), the way the original shows flying, falling and sick things (the
// GameObject::show and Bomber::show scales), the clock and points above, and the score board between rounds.
import { Match } from './match.ts';
import {
  Bomb, Bomber, BomberCorpse, CorpsePart, Dir, Explosion, Extra, ExtraType, GameObject, MapTile, MapTileArrow,
  ObjType, TileType, MAP_HEIGHT, MAP_WIDTH,
} from './sim.ts';
import { Sprites, textWidth } from './sprites.ts';

export const SCREEN_W = 320;
export const SCREEN_H = 240;
export const AX = 24;
export const AY = 28;
const S = 0.4;

export const BLOB_NAMES = ['Gloop', 'Mush', 'Gruel', 'Sludge'];
export const BLOB_COLORS = ['#86cf55', '#ef85a9', '#ecc84b', '#8189e8'];
const DIRS = ['down', 'left', 'up', 'right'];
/** the original's 8 walk pictures (anim_count 1..8) on our three poses: stand, squash, hop */
const POSE = [0, 1, 1, 0, 0, 2, 2, 0, 0];
const EXTRA_NAME: Record<number, string> = {
  [ExtraType.BOMB]: 'extra_bomb', [ExtraType.POWER]: 'extra_power', [ExtraType.SKATEBOARD]: 'extra_skate',
  [ExtraType.KICK]: 'extra_kick', [ExtraType.GLOVE]: 'extra_glove', [ExtraType.JOINT]: 'extra_swirl',
  [ExtraType.VIAGRA]: 'extra_beans', [ExtraType.KOKS]: 'extra_soda',
};
export const EXTRA_TITLES: [string, string][] = [
  ['extra_bomb', 'Jelly bomb: one bomb more'], ['extra_power', 'Chili: the splash reaches further'],
  ['extra_skate', 'Sneaker: walk faster'], ['extra_kick', 'Spring: kick bombs away'],
  ['extra_glove', 'Oven mitt: throw your bomb'], ['extra_swirl', 'Swirl mushroom: keys reversed'],
  ['extra_beans', 'Hiccup beans: bombs pop out'], ['extra_soda', 'Jitter soda: far too fast'],
];

export function themeOf(map: string): string {
  if (map === 'Fridge') return 'fridge';
  if (map === 'Drain' || map === 'Pantry') return 'cellar';
  return 'canteen';
}

export function mapTitle(name: string): string {
  return name.replace(/_/g, ' ');
}

/** the original's z order (GameObject.h: Z_FALLING -1, CORPSE 100+y, EXTRA 1000, EXPLOSION 2000, BOMB 3000+y, BOMBER 4000+y, OBSERVER 5000, CORPSE_PART 7000, +9000 flying) */
function zOf(o: GameObject): number {
  if (o.falling) return -1;
  const fly = o.flying ? 9000 : 0;
  switch (o.type) {
    case ObjType.BOMBER_CORPSE: return 100 + o.y;
    case ObjType.EXTRA: return 1000 + fly;
    case ObjType.EXPLOSION: return 2000;
    case ObjType.BOMB: return 3000 + o.y + fly;
    case ObjType.BOMBER: return 4000 + o.y + fly;
    case ObjType.CORPSE_PART: return 7000 + fly;
    default: return 5000 + fly;
  }
}

export class Renderer {
  readonly sp: Sprites;
  private shakeX = 0;
  private shakeY = 0;

  constructor(sp: Sprites) {
    this.sp = sp;
  }

  /** the arena and everything on it, the clock and the players above */
  /** which players the computer plays (shown as CPU) */
  cpu: boolean[] = [];

  drawMatch(g: CanvasRenderingContext2D, m: Match, names: string[], now: number, note = ''): void {
    const game = m.game;
    g.fillStyle = '#1a1423';
    g.fillRect(0, 0, SCREEN_W, SCREEN_H);
    if (m.board > 0 && m.lastRound) {
      this.drawBoard(g, m, names, now);
      return;
    }
    if (game.shake > 0) {
      this.shakeX = Math.floor(Math.random() * 3) - 1;
      this.shakeY = Math.floor(Math.random() * 3) - 1;
    } else {
      this.shakeX = this.shakeY = 0;
    }
    const theme = themeOf(game.map.current.name);
    // the frame round the arena
    g.fillStyle = '#3a2f45';
    g.fillRect(AX - 3, AY - 3, MAP_WIDTH * 16 + 6, MAP_HEIGHT * 16 + 6);
    g.fillStyle = '#0d0a12';
    g.fillRect(AX - 1, AY - 1, MAP_WIDTH * 16 + 2, MAP_HEIGHT * 16 + 2);
    g.save();
    g.beginPath();
    g.rect(AX, AY, MAP_WIDTH * 16, MAP_HEIGHT * 16);
    g.clip();
    const objs: GameObject[] = [...game.objects, ...game.bomber_objects];
    const order = objs.map((o) => ({ o, z: zOf(o) })).sort((a, b) => a.z - b.z);
    // holes first, then what falls into them, then the floor and the rest
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const t = game.map.maptiles[x][y];
        if (t.type === TileType.NONE || t.vanishing) this.sp.draw(g, 'hole', AX + x * 16, AY + y * 16);
      }
    }
    for (const { o, z } of order) if (z < 0) this.drawObject(g, o, now);
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) this.drawTile(g, game.map.maptiles[x][y], theme, AX + x * 16 + this.shakeX, AY + y * 16 + this.shakeY);
    }
    for (const { o, z } of order) if (z >= 0) this.drawObject(g, o, now);
    const obs = game.observer;
    if (obs.round_time < 0) {
      const p = this.pos(obs);
      const frame = Math.floor(now / 120) % 2;
      if (obs.flying) {
        const s = Math.sin(obs.fly_progress * Math.PI) * (1.3 / obs.fly_speed) + 1;
        this.sp.drawScaled(g, `ladle_${frame}`, p.x + 8, p.y + 16, Math.min(s, 3), 9, 17);
      } else {
        this.sp.draw(g, `ladle_${frame}`, p.x - 1, p.y - 1);
      }
    }
    g.restore();
    // HURRY UP (Observer::show, between 21 and 18 s)
    if (obs.round_time < 21 && obs.round_time > 18 && (obs.round_time % 0.3) > 0.15) {
      g.fillStyle = 'rgba(0,0,0,0.5)';
      g.fillRect(100, 120, 120, 16);
      this.sp.text(g, 'HURRY UP!', 160, 124, '#ff6a3c', 0.5);
    }
    this.drawHud(g, m, names);
    if (note) {
      g.fillStyle = 'rgba(26,20,35,0.8)';
      const w = textWidth(note) + 10;
      g.fillRect(160 - w / 2, 226, w, 12);
      this.sp.text(g, note, 160, 228, '#ffe14d', 0.5);
    }
  }

  private pos(o: GameObject): { x: number; y: number } {
    return { x: AX + Math.round(o.x * S) + this.shakeX * 0, y: AY + Math.round(o.y * S) };
  }

  private drawTile(g: CanvasRenderingContext2D, t: MapTile, theme: string, x: number, y: number): void {
    let name: string;
    switch (t.type) {
      case TileType.NONE: return;
      case TileType.WALL: name = `wall_${theme}`; break;
      case TileType.BOX: name = t.destroyed ? `box_${theme}_burn` : `box_${theme}`; break;
      default: name = `floor_${theme}`; break;
    }
    if (t.vanishing) {
      // MapTile::draw: shrinking towards its middle as it vanishes
      const f = Math.max(0, t.vanish_countdown);
      this.sp.drawScaled(g, name, x + 8, y + 8, f, 8, 8, f);
      return;
    }
    this.sp.draw(g, name, x, y);
    if (t.type === TileType.ICE) this.sp.draw(g, 'ice', x, y);
    else if (t.type === TileType.ARROW) this.sp.draw(g, `arrow_${DIRS[(t as MapTileArrow).dir] ?? 'down'}`, x, y);
    else if (t.type === TileType.TRAP) this.sp.draw(g, 'trap', x, y);
  }

  private drawObject(g: CanvasRenderingContext2D, o: GameObject, now: number): void {
    const p = this.pos(o);
    const flyScale = (ax: number, ay: number, name: string, dx: number, dy: number, alpha = 1) => {
      if (o.falling) {
        const f = Math.max(0, o.fall_countdown);
        this.sp.drawScaled(g, name, p.x + 8, p.y + 8, f, ax, ay - 8, f);
      } else if (o.flying && o.fly_speed > 0) {
        const s = Math.min(3, Math.sin(o.fly_progress * Math.PI) * (1.3 / o.fly_speed) + 1);
        this.sp.drawScaled(g, name, p.x + 8, p.y + 16, s, ax, ay, alpha);
      } else {
        this.sp.draw(g, name, p.x + dx, p.y + dy, alpha);
      }
    };
    switch (o.type) {
      case ObjType.BOMBER: {
        const b = o as Bomber;
        if (b.dead || b.cur_dir === Dir.NONE) return;
        const pose = POSE[Math.max(0, Math.min(8, Math.floor(b.anim_count)))];
        const name = `p${b.color}_${DIRS[b.cur_dir]}_${pose}`;
        if (b.disease && !b.falling && !b.flying) {
          const s = Math.sin(now / 50) * 0.15 + 1;
          this.sp.drawScaled(g, name, p.x + 8, p.y + 16, s, 8, 17);
        } else {
          flyScale(8, 17, name, 0, -1);
        }
        return;
      }
      case ObjType.BOMB: {
        const b = o as Bomb;
        flyScale(8, 15, `bomb_${b.bomber.color}_${Math.floor(b.cur_scale) % 4}`, 0, 1);
        return;
      }
      case ObjType.EXPLOSION:
        this.drawExplosion(g, o as Explosion);
        return;
      case ObjType.EXTRA: {
        const e = o as Extra;
        const name = EXTRA_NAME[e.extra];
        if (e.destroyed) {
          // burning away: flickers with soup over it
          if (Math.floor(now / 60) % 2) flyScale(9, 17, name, -1, -1, 0.7);
          this.sp.draw(g, `ex_x_2`, p.x, p.y, 0.6);
        } else {
          flyScale(9, 17, name, -1, -1);
        }
        return;
      }
      case ObjType.BOMBER_CORPSE: {
        const c = o as BomberCorpse;
        flyScale(8, 16, `puddle_${c.color}`, -1, -1);
        return;
      }
      case ObjType.CORPSE_PART: {
        const c = o as CorpsePart;
        this.sp.draw(g, `drop_${c.color}_${c.sprite_nr}`, p.x + 6, p.y + 6, c.flying ? 1 : c.opacity / 255);
        return;
      }
    }
  }

  private drawExplosion(g: CanvasRenderingContext2D, e: Explosion): void {
    // Explosion::show: the picture by the time left (14 7 0 7 14 in the original's sheet: small, medium, full)
    const d = e.detonation_period;
    let ph = 2;
    if (d < 0.4) ph = 1;
    if (d < 0.3) ph = 0;
    if (d < 0.2) ph = 1;
    if (d < 0.1) ph = 2;
    const x0 = AX + e.X * 16 + this.shakeX, y0 = AY + e.Y * 16 + this.shakeY;
    this.sp.draw(g, `ex_x_${ph}`, x0, y0);
    for (let i = 1; i <= e.l_left; i++) this.sp.draw(g, `ex_${i === e.power ? 'l' : 'h'}_${ph}`, x0 - i * 16, y0);
    for (let i = 1; i <= e.l_right; i++) this.sp.draw(g, `ex_${i === e.power ? 'r' : 'h'}_${ph}`, x0 + i * 16, y0);
    for (let i = 1; i <= e.l_up; i++) this.sp.draw(g, `ex_${i === e.power ? 'u' : 'v'}_${ph}`, x0, y0 - i * 16);
    for (let i = 1; i <= e.l_down; i++) this.sp.draw(g, `ex_${i === e.power ? 'd' : 'v'}_${ph}`, x0, y0 + i * 16);
  }

  private drawHud(g: CanvasRenderingContext2D, m: Match, names: string[]): void {
    const game = m.game;
    this.sp.text(g, mapTitle(game.map.current.name), 4, 3, '#ffe14d');
    const t = game.observer.round_time;
    if (t > 0) {
      this.sp.draw(g, 'clock', 280, 2);
      this.sp.text(g, String(Math.floor(t)), 316, 3, t < 21 ? '#ff6a3c' : '#fbf7ef', 1);
    } else {
      this.sp.text(g, 'TIME!', 316, 3, Math.floor(-t * 4) % 2 ? '#ff6a3c' : '#ffe14d', 1);
    }
    const n = game.bomber_objects.length;
    const w = Math.floor(312 / n);
    game.bomber_objects.forEach((b, i) => {
      const x = 4 + i * w;
      const alive = !b.dead;
      this.sp.draw(g, `p${b.color}_down_0`, x, 10, alive ? 1 : 0.35);
      const name = (names[i] ?? BLOB_NAMES[b.color]).slice(0, Math.max(3, Math.floor((w - 40) / 6)));
      this.sp.text(g, name, x + 18, 12, alive ? BLOB_COLORS[b.color] : '#7a7088');
      this.sp.draw(g, 'crown', x + 18, 20);
      this.sp.text(g, String(b.points), x + 28, 20, '#fbf7ef');
      if (b.gone) this.sp.text(g, 'LEFT', x + 36, 20, '#7a7088');
      else if (this.cpu[i]) this.sp.text(g, 'CPU', x + 38, 20, '#7a7088');
    });
  }

  /** the score board between rounds (GameStatus) */
  drawBoard(g: CanvasRenderingContext2D, m: Match, names: string[], now: number, final = false, footer = ''): void {
    const game = m.game;
    const r = m.lastRound!;
    g.fillStyle = '#1a1423';
    g.fillRect(0, 0, SCREEN_W, SCREEN_H);
    // a floor of the next arena, dimmed
    const theme = themeOf(game.map.current.name);
    for (let y = 0; y < 15; y++) for (let x = 0; x < 20; x++) this.sp.draw(g, `floor_${theme}`, x * 16, y * 16, 0.18);
    const title = final ? 'MATCH OVER' : 'ROUND OVER';
    this.sp.text(g, title, 160, 14, '#ffe14d', 0.5, 2);
    const winner = r.winners.length === 1 ? r.winners[0] : -1;
    let line: string;
    if (final) {
      const champ = game.bomber_objects.findIndex((b) => b.points === game.config.points_to_win);
      line = champ >= 0 ? `${names[champ] ?? BLOB_NAMES[champ]} wins the match!` : 'Nobody wins the match';
    } else {
      line = winner >= 0 ? `${names[winner] ?? BLOB_NAMES[winner]} survived ${mapTitle(r.map)}` : `Nobody survived ${mapTitle(r.map)}`;
    }
    this.sp.text(g, line, 160, 38, '#fbf7ef', 0.5);
    const top = 58;
    game.bomber_objects.forEach((b, i) => {
      const y = top + i * 34;
      g.fillStyle = 'rgba(58,47,69,0.85)';
      g.fillRect(20, y, 280, 30);
      const won = final ? b.points === game.config.points_to_win : r.winners.includes(i);
      const pose = won ? POSE[Math.floor(now / 90) % 9] : 0;
      this.sp.draw(g, `p${b.color}_down_${pose}`, 26, y + 6);
      this.sp.text(g, (names[i] ?? BLOB_NAMES[b.color]) + (this.cpu[i] ? ' (CPU)' : ''), 48, y + 5, BLOB_COLORS[b.color]);
      this.sp.text(g, `KILLS ${b.kills}`, 48, y + 17, '#cfc8bb');
      for (let k = 0; k < game.config.points_to_win; k++) {
        const cx = 292 - (game.config.points_to_win - k) * 12;
        if (k < b.points) this.sp.draw(g, 'crown', cx, y + 10);
        else {
          g.fillStyle = '#4a3f58';
          g.fillRect(cx + 2, y + 13, 5, 3);
        }
      }
      if (b.gone) this.sp.text(g, 'LEFT', 140, y + 17, '#7a7088');
    });
    if (!final) {
      this.sp.text(g, `NEXT: ${mapTitle(game.map.current.name)}`, 160, 204, '#fbf7ef', 0.5);
      const left = m.board / 256;
      g.fillStyle = '#4a3f58';
      g.fillRect(110, 216, 100, 4);
      g.fillStyle = '#86cf55';
      g.fillRect(110, 216, Math.round(100 * left), 4);
    }
    if (footer) this.sp.text(g, footer, 160, 226, '#ffe14d', 0.5);
  }
}
