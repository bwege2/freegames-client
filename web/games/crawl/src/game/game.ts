// The game: character creation, the turn loop, commands, level changes, save and the morgue. It follows
// the original's order of play (a turn is 10 energy; the player acts, then each monster with enough energy),
// its messages and its menus as far as the port implements them.
import type { Rng } from './rng.ts';
import { Rng as RngClass } from './rng.ts';
import type { Surface } from '../ui.ts';
import {
  FEATURE, type Item, type Level, type Monster, W, H, VIEW_W, VIEW_H, SCREEN_W, SCREEN_H, DIRS,
  idx, xy, inBounds, dist,
} from './model.ts';
import { DESCRIPT, JOBS, MONSTER_BY_ID, PLAYABLE, SPECIES, SPECIES_BY_NAME, SPELL_BY_ID, TUTORIAL } from './data.ts';
import { findLanding, getLevel, itemsAt, makeWorld, monsterAt, placeAtEntry, updateFov, branchName, levelPlace, type World } from './world.ts';
import {
  canEquip, createPlayer, equipIfPossible, equipSlot, evasion, armourClass, shieldClass, playerTitle, recalc,
  skillLevel, skillProgress, speciesApt, strength, intelligence, dexterity, startingWeaponChoices,
  gainXp, expNeeded, hasMutation, unequip, type Gear, type Player, SLOT_NAMES,
} from './player.ts';
import {
  itemColour, itemDescription, itemGlyph, itemName, stackable, weaponDef,
} from './items.ts';
import { playerAttack, monsterAttack, type CombatCtx } from './combat.ts';
import { castSpell, monsterCast, rawSpellFail, spellManaCost, spellName } from './magic.ts';
import { morgueText, type ScoreEntry, type SavedGame } from './save.ts';
import { SKILLS } from './data.ts';

const DUNGEON = 'BRANCH_DUNGEON';
const KEY_DIRS: Record<string, [number, number]> = {
  h: [-1, 0], j: [0, 1], k: [0, -1], l: [1, 0], y: [-1, -1], u: [1, -1], b: [-1, 1], n: [1, 1],
  '\x1b[D': [-1, 0], '\x1b[B': [0, 1], '\x1b[A': [0, -1], '\x1b[C': [1, 0],
  '1': [-1, 1], '2': [0, 1], '3': [1, 1], '4': [-1, 0], '5': [0, 0], '6': [1, 0],
  '7': [-1, -1], '8': [0, -1], '9': [1, -1], '.': [0, 0], s: [0, 0],
};
const RUN_DIRS: Record<string, [number, number]> = {
  H: [-1, 0], J: [0, 1], K: [0, -1], L: [1, 0], Y: [-1, -1], U: [1, -1], B: [-1, 1], N: [1, 1],
  '\x1b[1;2D': [-1, 0], '\x1b[1;2B': [0, 1], '\x1b[1;2A': [0, -1], '\x1b[1;2C': [1, 0],
};

export interface GameResult {
  kind: 'saved' | 'dead' | 'quit' | 'won' | 'tutorial';
  game: Game;
}

export interface GameOptions {
  surface: Surface;
  seed: number | bigint;
  name?: string;
  tutorial?: boolean;
  interactive?: boolean;
}

export class Game {
  surface: Surface;
  rng: Rng;
  world!: World;
  player!: Player;
  level!: Level;
  log: { text: string; colour: string }[] = [];
  hasOrb = false;
  dead = false;
  won = false;
  cause = '';
  seed: bigint;
  tutorial: boolean;
  quit = false;
  saved = false;
  private tutorialMarkers = new Map<number, string>();
  private tutorialExit = -1;
  private autoExploring = false;
  onCheckpoint: (() => void) | null = null;

  constructor(o: GameOptions) {
    this.surface = o.surface;
    this.seed = BigInt(o.seed);
    this.rng = new RngClass(this.seed);
    this.tutorial = !!o.tutorial;
  }

  async start(o: GameOptions): Promise<GameResult> {
    if (this.tutorial) {
      this.startTutorialPlayer(o.name ?? 'Tutorial');
      this.msg('Welcome to the tutorial.', 'WHITE');
      const intro = DESCRIPT.tutorial['tutorial intro'];
      if (intro) this.msg(intro.replace(/\s+/g, ' ').trim(), 'LIGHTGREY');
      this.msg('Press ? for a list of commands.', 'LIGHTGREY');
    } else {
      const made = await this.newCharacter(o.name);
      if (!made) return { kind: 'quit', game: this };
      this.msg(`Welcome, ${this.player.name} the ${this.player.species.name} ${this.player.job.name}.`);
      this.msg(`Game seed: ${this.seed} (custom seed);`);
      this.msg('Press ? for a list of commands and other information.');
      this.msg('Found a staircase leading out of the dungeon.');
    }
    return this.playLoop();
  }

  static fromSave(o: GameOptions, saved: SavedGame, decoded: ReturnType<typeof import('./save.ts').decodeGame>): Game {
    const g = new Game({ ...o, seed: BigInt(saved.seed) });
    g.world = decoded.world;
    g.player = decoded.player;
    g.log = decoded.log.map((l) => ({ text: l.text, colour: l.colour ?? 'LIGHTGREY' }));
    g.hasOrb = decoded.hasOrb;
    g.rng = decoded.rng;
    g.level = decoded.world.levels[decoded.world.current];
    return g;
  }

  async resume(): Promise<GameResult> {
    updateFov(this.level, this.player.x, this.player.y);
    this.msg('Welcome back.', 'LIGHTGREY');
    return this.playLoop();
  }

  private async playLoop(): Promise<GameResult> {
    updateFov(this.level, this.player.x, this.player.y);
    while (!this.dead && !this.won && !this.quit) {
      this.render();
      const key = await this.surface.readKey();
      if (this.dead || this.won || this.quit) break;
      await this.command(key);
    }
    this.render();
    if (this.dead) {
      this.drawDeath();
    } else if (this.won) {
      this.drawWin();
    }
    if (this.dead || this.won) {
      this.flush();
      await this.surface.readKey().catch(() => {});
    }
    return { kind: this.dead ? 'dead' : this.won ? 'won' : this.saved ? 'saved' : 'quit', game: this };
  }

  // ------------------------------------------------------------------------------------------- setup
  private async newCharacter(defaultName?: string): Promise<boolean> {
    const speciesList = PLAYABLE.species.map((s) => SPECIES_BY_NAME.get(s.name.toLowerCase())).filter((s): s is (typeof SPECIES)[number] => !!s);
    if (!speciesList.length) return false;
    const spIdx = await this.menu('Choose a species', speciesList.map((s) => ({ label: s.name, desc: s.description })));
    if (spIdx < 0) return false;
    const species = speciesList[spIdx];
    const jobs = this.allowedJobs(species);
    if (!jobs.length) { this.msg('No backgrounds are available for that species.'); return false; }
    const jobIdx = await this.menu('Choose a background', jobs.map((j) => ({ label: j.name, desc: j.description })));
    if (jobIdx < 0) return false;
    const job = jobs[jobIdx];
    const weapons = startingWeaponChoices(species, job);
    let weaponId = 'WPN_UNARMED';
    if (weapons.length) {
      const wi = await this.menu('You have a choice of weapons.', weapons.map((id) => {
        if (id === 'WPN_UNARMED') return { label: 'unarmed', desc: 'Fight with your hands.' };
        const w = weaponDef(id);
        return { label: w?.name ?? id, desc: w?.description ?? '', letter: undefined };
      }));
      if (wi < 0) return false;
      weaponId = weapons[wi];
    }
    const entered = await this.promptLine('Enter your name:', '');
    const name = entered || defaultName || 'Adventurer';
    this.player = createPlayer(species, job, weaponId, name, this.rng);
    this.world = makeWorld(this.rng, this.seed.toString());
    this.level = getLevel(this.world, this.rng, DUNGEON, 1);
    this.enterLevel(this.level, this.level.entry);
    this.player.place = levelPlace(DUNGEON, 1);
    this.msg(`You are a ${species.name} ${job.name}.`);
    return true;
  }

  private allowedJobs(species: (typeof SPECIES)[number]) {
    const combos = new Set(PLAYABLE.combos);
    return JOBS.filter((j) => combos.has(`${species.abbr}${j.abbr}`));
  }

  private startTutorialPlayer(name: string): void {
    const species = SPECIES_BY_NAME.get('human')!;
    const job = JOBS.find((j) => j.name === 'Fighter')!;
    this.player = createPlayer(species, job, 'WPN_RAPIER', name, this.rng);
    this.world = makeWorld(this.rng, this.seed.toString());
    const t = (awaitTutorial())[0];
    const level = this.makeTutorialLevel(t);
    this.level = level;
    this.world.levels[level.key] = level;
    this.world.current = level.key;
    this.player.place = 'Tutorial';
    this.enterLevel(level, level.entry);
  }

  private makeTutorialLevel(t: { name: string; map: string; kfeat: [string, string][]; markers: [string, string][] }): Level {
    const cells = Array.from({ length: W * H }, () => ({ feat: 'DNGN_ROCK_WALL', known: false, visible: false }));
    const lines = t.map.split('\n');
    const mh = lines.length, mw = Math.max(...lines.map((l) => l.length));
    const ox = Math.max(0, Math.floor((W - mw) / 2)), oy = Math.max(0, Math.floor((H - mh) / 2));
    for (let y = 0; y < mh; y++) {
      for (let x = 0; x < lines[y].length; x++) {
        const ch = lines[y][x];
        let feat = 'DNGN_ROCK_WALL';
        if (ch === '.' || ch === 't' || ch === 'l' || ch === 'W') feat = 'DNGN_FLOOR';
        else if (ch === "'") feat = 'DNGN_OPEN_DOOR';
        else if (ch === ')' || ch === '>') feat = 'DNGN_STONE_STAIRS_DOWN_I';
        else if (ch === '{' || ch === '<') feat = 'DNGN_STONE_STAIRS_UP_I';
        else if (ch === '[') feat = 'DNGN_EXIT_DUNGEON';
        else if (ch === 'x' || ch === 'v' || ch === 'w') feat = 'DNGN_ROCK_WALL';
        if (ch === 'A' || ch === 'B' || ch === 'C' || ch === 'D' || ch === 'E' || ch === 'F' || ch === '}') feat = 'DNGN_FLOOR';
        const at = idx(ox + x, oy + y);
        if (inBounds(ox + x, oy + y)) cells[at].feat = feat;
      }
    }
    const level: Level = {
      key: 'TUTORIAL:1', branch: 'TUTORIAL', depth: 1, absDepth: 1, cells, monsters: [], items: [],
      up: [], down: [], branches: [], visited: true, entry: 0, layout: 'tutorial',
    };
    for (const [glyph, lua] of t.markers) {
      // marker cells become floor/stairs and are kept for the tutorial messages
      for (let y = 0; y < mh; y++) for (let x = 0; x < lines[y].length; x++) {
        if (lines[y][x] !== glyph) continue;
        const at = idx(ox + x, oy + y);
        if (glyph === ')' || glyph === '>') cells[at].feat = 'DNGN_STONE_STAIRS_DOWN_I';
        else if (glyph === '[') { cells[at].feat = 'DNGN_EXIT_DUNGEON'; this.tutorialExit = at; }
        else cells[at].feat = 'DNGN_FLOOR';
        const m = /tutorial1\.msg\("([^"]+)"\)/.exec(lua);
        if (m) this.tutorialMarkers.set(at, `tutorial1 ${m[1]}`);
      }
    }
    // find the A marker for the start
    for (let y = 0; y < mh; y++) for (let x = 0; x < lines[y].length; x++) {
      if (lines[y][x] === 'A') level.entry = idx(ox + x, oy + y);
    }
    if (!level.entry) level.entry = idx(ox + 2, oy + 2);
    level.cells[level.entry].feat = 'DNGN_FLOOR';
    return level;
  }

  private enterLevel(level: Level, at: number, announce = true): void {
    this.level = level;
    const p = xy(at);
    this.player.x = p.x; this.player.y = p.y;
    this.player.place = level.branch === 'TUTORIAL' ? 'Tutorial' : levelPlace(level.branch, level.depth);
    this.player.turns = Math.max(this.player.turns, 0);
    updateFov(level, p.x, p.y);
    this.world.current = level.key;
    this.player.place = level.branch === 'TUTORIAL' ? 'Tutorial' : levelPlace(level.branch, level.depth);
    if (announce && level.branch !== 'TUTORIAL') this.msg(`You enter ${level.branch === DUNGEON ? 'the Dungeon' : branchName(level.branch)}${level.branch === 'BRANCH_TEMPLE' ? '' : `:${level.depth}`}.`, 'LIGHTGREY');
    this.onCheckpoint?.();
  }

  // ------------------------------------------------------------------------------------------- messages
  msg(text: string, colour = 'LIGHTGREY'): void {
    for (const part of String(text).split('\n')) this.log.push({ text: part, colour });
    if (this.log.length > 240) this.log.splice(0, this.log.length - 240);
  }

  flush(): void { this.surface.flush(); }

  // ------------------------------------------------------------------------------------------- drawing
  render(): void {
    const s = this.surface;
    s.clear();
    this.drawMap();
    this.drawHud();
    this.drawMessages();
    s.flush();
  }

  private drawMap(): void {
    const p = this.player;
    const left = Math.max(0, Math.min(W - VIEW_W, p.x - Math.floor(VIEW_W / 2)));
    const top = Math.max(0, Math.min(H - VIEW_H, p.y - Math.floor(VIEW_H / 2)));
    for (let sy = 0; sy < VIEW_H; sy++) {
      for (let sx = 0; sx < VIEW_W; sx++) {
        const x = left + sx, y = top + sy;
        if (!inBounds(x, y)) continue;
        const c = this.level.cells[idx(x, y)];
        if (!c.known) continue;
        const f = FEATURE[c.feat];
        let glyph = f?.glyph ?? ' ';
        let colour = f?.colour ?? 'LIGHTGREY';
        if (!c.visible) colour = 'DARKGREY';
        const mon = c.visible ? monsterAt(this.level, x, y) : undefined;
        if (mon && !(mon.invisible > 0)) {
          const d = MONSTER_BY_ID.get(mon.def);
          if (d) { glyph = d.glyph; colour = d.colour; }
        } else if (c.visible) {
          const it = itemsAt(this.level, idx(x, y));
          if (it.length) { glyph = itemGlyph(it[0].item); colour = itemColour(it[0].item); }
        }
        if (x === p.x && y === p.y) { glyph = '@'; colour = 'WHITE'; }
        this.surface.put(sx, sy, glyph, colour);
      }
    }
  }

  private drawHud(): void {
    const p = this.player;
    const x = 37;
    const title = `${p.name} the ${playerTitle(p, false)}`;
    this.surface.put(x, 0, title, 'WHITE');
    this.surface.put(x, 1, p.species.name, 'LIGHTGREY');
    const hp = `Health: ${p.hp}/${p.hpMax}`;
    this.surface.put(x, 2, hp, p.hp * 2 < p.hpMax ? 'LIGHTRED' : 'LIGHTGREY');
    this.surface.put(x, 3, `Magic:  ${p.mp}/${p.mpMax}`, 'LIGHTGREY');
    this.surface.put(x + 19, 2, '========================', 'DARKGREY');
    this.surface.put(x + 19, 3, '========================', 'DARKGREY');
    this.surface.put(x, 4, `AC:  ${armourClass(p)}`, 'LIGHTGREY');
    this.surface.put(x, 5, `EV:  ${evasion(p)}`, 'LIGHTGREY');
    this.surface.put(x, 6, `SH:  ${shieldClass(p)}`, 'LIGHTGREY');
    this.surface.put(x + 19, 4, `Str: ${strength(p)}`, 'LIGHTGREY');
    this.surface.put(x + 19, 5, `Int: ${intelligence(p)}`, 'LIGHTGREY');
    this.surface.put(x + 19, 6, `Dex: ${dexterity(p)}`, 'LIGHTGREY');
    let next = '';
    if (p.xl < 27) {
      const need = Math.max(1, expNeeded(p.xl + 1) - expNeeded(p.xl));
      const pct = Math.max(0, Math.min(99, Math.floor((p.xp - expNeeded(p.xl)) * 100 / need)));
      next = `${pct}%`;
    }
    this.surface.put(x, 7, `XL: ${String(p.xl).padStart(2)} Next: ${next.padStart(3)}  Place: ${p.place}`, 'LIGHTGREY');
    this.surface.put(x, 8, `Noise: ---------  Time: ${(p.elapsed / 10).toFixed(1)} (0.0)`, 'LIGHTGREY');
    const wpn = p.gear.weapon ? itemName(p.gear.weapon) : 'unarmed';
    this.surface.put(x, 9, `a) ${wpn}`, 'LIGHTGREY');
    this.surface.put(x, 10, 'Nothing quivered', 'DARKGREY');
    const status: string[] = [];
    if ((p.status.DUR_POISONING ?? 0) > 0) status.push('Poison');
    if ((p.status.DUR_CONF ?? 0) > 0) status.push('Confused');
    if ((p.status.DUR_SLOW ?? 0) > 0) status.push('Slowed');
    if ((p.status.DUR_HASTE ?? 0) > 0) status.push('Hasted');
    if (hasMutation(p, 'MUT_REGENERATION')) status.push('Regen');
    if (this.hasOrb) status.push('Orb');
    if (status.length) this.surface.put(x, 11, status.join(', '), 'YELLOW');
  }

  private drawMessages(): void {
    const lines: { text: string; colour: string }[] = [];
    for (const m of this.log) {
      const text = m.text.replace(/\s+$/, '');
      if (!text) continue;
      for (let i = 0; i < text.length; i += SCREEN_W) lines.push({ text: text.slice(i, i + SCREEN_W), colour: m.colour });
    }
    const last = lines.slice(-4);
    for (let i = 0; i < last.length; i++) this.surface.put(0, 17 + i, last[i].text, last[i].colour);
  }

  private drawDeath(): void {
    this.surface.clear();
    const lines = [
      '',
      '                    You die...',
      '',
      `      ${this.player.name} the ${playerTitle(this.player, false)}`,
      '',
      `      ${this.cause || 'killed'}`,
      '',
      '      Press any key to return to the game page.',
    ];
    for (let i = 0; i < lines.length; i++) this.surface.put(0, 8 + i, lines[i], i === 1 ? 'LIGHTRED' : 'LIGHTGREY');
    this.surface.flush();
  }

  private drawWin(): void {
    this.surface.clear();
    const lines = this.tutorial ? [
      '',
      '                 You have completed the tutorial.',
      '',
      `      ${this.player.name} the ${playerTitle(this.player, false)}`,
      '',
      '      You know how to move, explore and use the stairs. The Dungeon awaits.',
      '',
      '      Press any key to return to the title screen.',
    ] : [
      '',
      '                 You escaped with the Orb of Zot!',
      '',
      `      ${this.player.name} the ${playerTitle(this.player, false)}`,
      '',
      '      The Orb is yours. The dungeon is behind you.',
      '',
      '      Press any key to return to the game page.',
    ];
    for (let i = 0; i < lines.length; i++) this.surface.put(0, 8 + i, lines[i], i === 1 ? 'YELLOW' : 'LIGHTGREY');
    this.surface.flush();
  }

  // ------------------------------------------------------------------------------------------- menus
  private async menu(title: string, entries: { label: string; desc?: string; colour?: string }[]): Promise<number> {
    const s = this.surface;
    let sel = 0;
    for (;;) {
      s.clear();
      s.put(0, 0, title, 'WHITE');
      const rows = Math.min(18, Math.max(1, Math.ceil(entries.length / 2)));
      for (let i = 0; i < entries.length; i++) {
        const col = Math.floor(i / rows), row = i % rows;
        const letter = i < 26 ? String.fromCharCode(97 + i) : i < 52 ? String.fromCharCode(65 + i - 26) : '?';
        const line = `${letter} - ${entries[i].label}`;
        s.put(1 + col * 38, 2 + row, line, i === sel ? 'WHITE' : (entries[i].colour ?? 'LIGHTGREY'), i === sel ? 'BLUE' : 'BLACK');
      }
      const desc = entries[sel]?.desc ?? '';
      const wrapped = wrap(desc, SCREEN_W - 2).slice(0, 5);
      for (let i = 0; i < wrapped.length; i++) s.put(1, 21 + i - Math.max(0, wrapped.length - 3), wrapped[i], 'LIGHTGREY');
      s.put(0, 23, 'Letter to choose, arrows + Enter, Esc to cancel.', 'DARKGREY');
      s.flush();
      const key = await s.readKey();
      if (key === '\x1b') return -1;
      if (key === '\r') return sel;
      if (key === '\x1b[A') { sel = (sel + entries.length - 1) % entries.length; continue; }
      if (key === '\x1b[B') { sel = (sel + 1) % entries.length; continue; }
      if (key.length === 1) {
        const code = key.charCodeAt(0);
        let i = -1;
        if (code >= 97 && code <= 122) i = code - 97;
        else if (code >= 65 && code <= 90) i = 26 + code - 65;
        if (i >= 0 && i < entries.length) return i;
      }
    }
  }

  private async promptLine(prompt: string, initial = ''): Promise<string> {
    const s = this.surface;
    let text = initial;
    for (;;) {
      if (this.player) this.render(); else s.clear();
      s.put(0, 22, ' '.repeat(SCREEN_W), 'LIGHTGREY');
      s.put(0, 22, prompt, 'WHITE');
      s.put(prompt.length + 1, 22, text, 'WHITE');
      s.put(prompt.length + 1 + text.length, 22, '_', 'WHITE');
      s.flush();
      const key = await s.readKey();
      if (key === '\r') return text.trim();
      if (key === '\x1b') return '';
      if (key === '\x7f') { text = text.slice(0, -1); continue; }
      if (key.length === 1 && key >= ' ' && key <= '~' && text.length < 30) text += key;
    }
  }

  private async showText(title: string, text: string): Promise<void> {
    const s = this.surface;
    s.clear();
    s.put(0, 0, title, 'WHITE');
    const lines = wrap(text, SCREEN_W - 2);
    for (let i = 0; i < Math.min(lines.length, SCREEN_H - 3); i++) s.put(1, 1 + i, lines[i], 'LIGHTGREY');
    s.put(0, SCREEN_H - 1, '-- press any key --', 'DARKGREY');
    s.flush();
    await s.readKey().catch(() => {});
  }

  // ------------------------------------------------------------------------------------------- commands
  async command(key: string): Promise<void> {
    if (this.dead || this.won || this.quit) return;
    if (key === '?') { await this.help(); return; }
    if (key === 'i') { await this.inventoryScreen(); return; }
    if (key === 'e' || key === 'w') { await this.equipScreen(); return; }
    if (key === 'c') { await this.unequipScreen(); return; }
    if (key === 'd') { await this.dropScreen(); return; }
    if (key === 'q') { await this.quaffScreen(); return; }
    if (key === 'r') { await this.readScreen(); return; }
    if (key === 'z') { await this.castScreen(); return; }
    if (key === 'M') { await this.memoriseScreen(); return; }
    if (key === 'm') { await this.skillsScreen(); return; }
    if (key === 'C' || key === '@') { await this.characterScreen(); return; }
    if (key === 'V') { await this.wandScreen(); return; }
    if (key === 'x') { await this.look(); return; }
    if (key === 'o') { await this.autoExplore(); return; }
    if (key === 'S') { this.saved = true; this.quit = true; return; }
    if (key === 'Q') {
      if (await this.confirm('Really quit? Your game will not be saved.')) this.quit = true;
      return;
    }
    if (key === 'g' || key === ',') { await this.pickup(); return; }
    if (key === '>' || key === '<') { await this.useStairs(key === '>'); return; }
    if (key === 'R') { await this.rest(); return; }
    if (key === 'a') { this.msg('You have no abilities.'); return; }
    if (key === 'f' || key === 't') { this.msg('You have nothing to throw.'); return; }
    const run = RUN_DIRS[key];
    if (run) { await this.run(run[0], run[1]); return; }
    const dir = KEY_DIRS[key];
    if (dir) { await this.move(dir[0], dir[1]); return; }
    if (key === '\x1b') return;
  }

  private async move(dx: number, dy: number): Promise<void> {
    if (dx === 0 && dy === 0) { await this.wait(); return; }
    const p = this.player;
    const nx = p.x + dx, ny = p.y + dy;
    if (!inBounds(nx, ny)) return;
    const mon = monsterAt(this.level, nx, ny);
    if (mon) {
      if (mon.attitude === 'friendly') { this.msg(`You and the ${mon.name} trade places.`); p.x = nx; p.y = ny; this.takeTurn(); return; }
      const ctx = this.combat();
      playerAttack(ctx, mon);
      this.takeTurn();
      return;
    }
    const c = this.level.cells[idx(nx, ny)];
    const f = FEATURE[c.feat];
    if (c.feat === 'DNGN_CLOSED_DOOR') {
      c.feat = 'DNGN_OPEN_DOOR';
      this.msg('You open the door.');
      this.takeTurn();
      return;
    }
    if (!f || f.solid) {
      if (c.feat === 'DNGN_ROCK_WALL' || c.feat === 'DNGN_STONE_WALL') this.msg('You cannot move into a wall.');
      return;
    }
    if (c.feat === 'DNGN_LAVA') { this.msg('You would burn in the lava.'); return; }
    if (c.feat === 'DNGN_DEEP_WATER') { this.msg('You cannot swim through deep water.'); return; }
    if (c.feat === 'DNGN_TREE') { this.msg('You cannot move through the tree.'); return; }
    p.x = nx; p.y = ny;
    updateFov(this.level, nx, ny);
    this.onStep();
    this.takeTurn();
  }

  private async run(dx: number, dy: number): Promise<void> {
    const start = { x: this.player.x, y: this.player.y };
    for (let i = 0; i < 20; i++) {
      const nx = this.player.x + dx, ny = this.player.y + dy;
      if (!inBounds(nx, ny)) break;
      const mon = monsterAt(this.level, nx, ny);
      if (mon) { await this.move(dx, dy); break; }
      const c = this.level.cells[idx(nx, ny)];
      if (!FEATURE[c.feat] || FEATURE[c.feat].solid) break;
      this.player.x = nx; this.player.y = ny;
      updateFov(this.level, nx, ny);
      this.onStep();
      this.takeTurn();
      if (this.dead || this.won) break;
      if (this.visibleInterest()) break;
    }
    if (this.player.x === start.x && this.player.y === start.y) this.msg('You cannot move that way.');
  }

  private async wait(): Promise<void> { this.takeTurn(); }

  private async rest(): Promise<void> {
    for (let i = 0; i < 20 && this.player.hp < this.player.hpMax; i++) {
      this.takeTurn();
      if (this.dead) return;
    }
    this.msg('You rest.');
  }

  private onStep(): void {
    const at = idx(this.player.x, this.player.y);
    const marker = this.tutorialMarkers.get(at);
    if (marker) {
      const text = DESCRIPT.tutorial[marker];
      if (text) this.msg(text.replace(/\s+/g, ' ').trim(), 'LIGHTBLUE');
      this.tutorialMarkers.delete(at);
    }
    if (this.tutorial && at === this.tutorialExit) {
      this.won = true;
      this.cause = 'completed the tutorial';
      return;
    }
    if (this.hasOrb && this.level.branch === DUNGEON && this.level.depth === 1 && at === this.level.entry) {
      this.msg('You see here the staircase leading out of the dungeon.', 'YELLOW');
    }
  }

  private takeTurn(): void {
    if (this.dead || this.won) return;
    const p = this.player;
    p.turns++;
    p.elapsed++;
    this.tickStatuses();
    if (!this.dead && p.hp <= 0) { this.die('killed'); return; }
    this.monstersAct();
    if (!this.dead && p.hp <= 0) { this.die('killed'); return; }
    if (p.turns % 10 === 0) {
      let regen = 1 + Math.trunc(p.xl / 10);
      if (hasMutation(p, 'MUT_REGENERATION')) regen += 1;
      p.hp = Math.min(p.hpMax, p.hp + regen);
      if (p.mpMax > 0) p.mp = Math.min(p.mpMax, p.mp + 1);
    }
    updateFov(this.level, p.x, p.y);
    if (p.turns % 20 === 0) this.onCheckpoint?.();
  }

  private tickStatuses(): void {
    const p = this.player;
    for (const k of Object.keys(p.status)) {
      p.status[k]--;
      if (p.status[k] <= 0) delete p.status[k];
    }
    if ((p.status.DUR_POISONING ?? 0) > 0 && p.turns % 5 === 0) {
      p.hp -= 1;
      this.msg('You feel sick.', 'LIGHTGREEN');
    }
  }

  private monstersAct(): void {
    if (this.level.branch === 'TUTORIAL') return;
    for (const m of [...this.level.monsters]) {
      if (m.hp <= 0) continue;
      m.energy += m.speed;
      while (m.energy >= 10 && m.hp > 0 && !this.dead) {
        m.energy -= 10;
        this.monsterTurn(m);
      }
    }
    this.level.monsters = this.level.monsters.filter((m) => m.hp > 0);
  }

  private monsterTurn(m: Monster): void {
    const p = this.player;
    if (m.cooldown > 0) m.cooldown--;
    if (m.confused > 0) m.confused--;
    if (m.poisoned > 0) {
      if (this.rng.oneChanceIn(3)) { m.hp -= 1; if (m.hp <= 0) { m.hp = 0; this.msg(`The ${m.name} dies of poison.`, 'LIGHTGREEN'); this.awardXp(MONSTER_BY_ID.get(m.def)?.exp ?? 1); return; } }
    }
    const d = dist(m, p);
    const visible = this.level.cells[idx(p.x, p.y)].visible && this.canSee(m);
    if (m.attitude === 'friendly') {
      const foe = this.level.monsters.find((x) => x.hp > 0 && x.attitude === 'hostile' && dist(x, m) <= 1);
      if (foe) { playerAttack({ ...this.combat(), player: this.player }, foe); return; }
      this.stepToward(m, p.x, p.y, false);
      return;
    }
    if (m.asleep) {
      if (d <= 7 && visible) { m.asleep = false; this.msg(`The ${m.name} wakes.`); }
      return;
    }
    if (!visible && d > 1) {
      if (this.rng.oneChanceIn(3)) this.stepToward(m, p.x, p.y, true);
      return;
    }
    if (d <= 1) { monsterAttack(this.combat(), m); return; }
    const def = MONSTER_BY_ID.get(m.def);
    const spell = def?.spellList?.length ? this.rng.weighted(def.spellList.map((s) => [s.weight, s] as [number, { spell: string; weight: number; flags: string }])) : null;
    if (spell && m.cooldown <= 0 && d <= 7 && def) {
      m.cooldown = 3 + this.rng.int(4);
      monsterCast(this.magic(), m, spell.spell);
      return;
    }
    if (m.hp * 3 < m.hpMax && def?.intelligence !== 'human' && this.rng.oneChanceIn(2)) {
      this.stepToward(m, p.x, p.y, true);
      return;
    }
    this.stepToward(m, p.x, p.y, false);
  }

  private stepToward(m: Monster, tx: number, ty: number, away: boolean): void {
    const options: [number, number][] = [];
    const dx = Math.sign(tx - m.x), dy = Math.sign(ty - m.y);
    const tryDirs: [number, number][] = away ? [[-dx, -dy], [-dx, 0], [0, -dy]] : [[dx, dy], [dx, 0], [0, dy]];
    for (const [ox, oy] of [...tryDirs, ...DIRS]) {
      const x = m.x + ox, y = m.y + oy;
      if (!inBounds(x, y) || (ox === 0 && oy === 0)) continue;
      if (!this.canMonsterEnter(m, x, y)) continue;
      options.push([x, y]);
    }
    if (!options.length) return;
    const [x, y] = this.rng.choose(options);
    m.x = x; m.y = y;
    if (this.tutorial) return;
    // a monster opening a door
    const c = this.level.cells[idx(x, y)];
    if (c.feat === 'DNGN_CLOSED_DOOR') c.feat = 'DNGN_OPEN_DOOR';
  }

  private canMonsterEnter(m: Monster, x: number, y: number): boolean {
    const c = this.level.cells[idx(x, y)];
    const f = FEATURE[c.feat];
    if (!f || f.solid) return false;
    if (c.feat === 'DNGN_LAVA' || c.feat === 'DNGN_DEEP_WATER') {
      const def = MONSTER_BY_ID.get(m.def);
      if (def?.habitat !== 'amphibious' && def?.habitat !== 'water') return false;
    }
    if (this.player.x === x && this.player.y === y) return false;
    return !monsterAt(this.level, x, y);
  }

  private canSee(m: Monster): boolean {
    if (m.invisible > 0) return false;
    return true;
  }

  private visibleInterest(): boolean {
    for (const m of this.level.monsters) {
      if (m.hp > 0 && this.level.cells[idx(m.x, m.y)].visible) return true;
    }
    for (const i of this.level.items) if (this.level.cells[i.at].visible) return true;
    for (const s of [...this.level.down, ...this.level.branches]) if (this.level.cells[s.at].visible) return true;
    return false;
  }

  private die(cause: string): void {
    if (this.dead) return;
    this.dead = true;
    this.cause = cause;
    this.player.hp = 0;
    this.msg('You die...', 'LIGHTRED');
  }

  private awardXp(amount: number): void {
    const leveled = gainXp(this.player, amount);
    if (leveled) {
      this.msg(`Welcome to level ${this.player.xl}.`, 'YELLOW');
      this.msg('You feel more experienced.');
      // the original lets the player choose a stat; the port follows levelup_stats
      this.statGain();
    }
  }

  private statGain(): void {
    const p = this.player;
    const stats = p.species.levelup;
    if (!stats.length) return;
    const chosen = stats[(p.xl - 2) % stats.length] ?? stats[0];
    const i = chosen === 'str' ? 0 : chosen === 'int' ? 1 : 2;
    p.baseStats[i]++;
    recalc(p);
    this.msg(`Your ${chosen.toUpperCase()} increases.`, 'LIGHTGREEN');
  }

  private combat(): CombatCtx {
    return {
      rng: this.rng, player: this.player, level: this.level,
      msg: (t, c) => this.msg(t, c),
      onMonsterKilled: (m) => {
        this.awardXp(MONSTER_BY_ID.get(m.def)?.exp ?? 1);
        if (m.unique) this.msg(`You have slain ${m.name}!`, 'YELLOW');
      },
      onPlayerDamaged: () => { /* hit points already reduced */ },
      onPlayerKilled: (m) => this.die(`killed by ${m.name}`),
    };
  }

  private magic() { return { ...this.combat(), direction: undefined as [number, number] | undefined }; }

  // ------------------------------------------------------------------------------------------- actions
  private async pickup(): Promise<void> {
    const at = idx(this.player.x, this.player.y);
    const items = itemsAt(this.level, at);
    if (!items.length) { this.msg('There is nothing here to pick up.'); return; }
    for (const entry of items) {
      const item = entry.item;
      this.level.items = this.level.items.filter((i) => i !== entry);
      if (item.id === 'Orb of Zot') {
        this.hasOrb = true;
        this.msg('You pick up the Orb of Zot!', 'YELLOW');
        this.msg('A terrible power fills the air. You must escape the dungeon!', 'LIGHTRED');
        continue;
      }
      if (item.cls === 'gold') {
        this.player.gold += item.qty;
        this.msg(`You pick up ${item.qty} gold piece${item.qty === 1 ? '' : 's'}.`, 'YELLOW');
        continue;
      }
      const existing = this.player.inventory.find((i) => stackable(i) && i.cls === item.cls && i.id === item.id);
      if (existing) { existing.qty += item.qty; this.msg(`You pick up ${itemName(item)}.`); }
      else {
        item.uid = this.player.nextUid++;
        this.player.inventory.push(item);
        this.msg(`You pick up ${itemName(item)}.`);
      }
    }
    this.takeTurn();
  }

  private async useStairs(down: boolean): Promise<void> {
    const at = idx(this.player.x, this.player.y);
    const branch = this.level.branches.find((s) => s.at === at);
    if (down && branch) {
      const target = getLevel(this.world, this.rng, branch.branch, branch.depth);
      const landing = target.up[0]?.at ?? target.entry;
      this.enterLevel(target, placeAtEntry(target) || landing);
      this.takeTurn();
      return;
    }
    if (down) {
      const stair = this.level.down.find((s) => s.at === at);
      if (!stair) { this.msg('There is no staircase leading down here.'); return; }
      const target = getLevel(this.world, this.rng, stair.branch, stair.depth);
      this.enterLevel(target, placeAtEntry(target));
      this.takeTurn();
      return;
    }
    const up = this.level.up.find((s) => s.at === at);
    if (!up) {
      if (this.level.branch === DUNGEON && this.level.depth === 1 && at === this.level.entry) {
        if (this.hasOrb) { this.won = true; this.cause = 'escaped with the Orb of Zot'; }
        else this.msg('You cannot leave the dungeon without the Orb of Zot.');
        return;
      }
      this.msg('There is no staircase leading up here.');
      return;
    }
    const target = getLevel(this.world, this.rng, up.branch, up.depth);
    let landing = placeAtEntry(target);
    if (this.level.depth === 1 && up.branch !== this.level.branch) {
      const back = target.branches.find((s) => s.branch === this.level.branch);
      if (back) landing = findLanding(target, back.at);
    }
    this.enterLevel(target, landing);
    this.takeTurn();
  }

  private async quaffScreen(): Promise<void> {
    const items = this.player.inventory.filter((i) => i.cls === 'potion');
    if (!items.length) { this.msg('You have nothing to quaff.'); return; }
    const idxSel = await this.pickFromInventory('Quaff which potion?', items, true);
    if (idxSel < 0) return;
    const item = items[idxSel];
    this.usePotion(item);
    this.consume(item);
    this.takeTurn();
  }

  private usePotion(item: Item): void {
    const p = this.player;
    const name = item.id;
    if (name === 'potion of might') { p.status.DUR_MIGHT = 35 + this.rng.int(40); this.msg('You feel very mighty all of a sudden.', 'LIGHTGREEN'); }
    else if (name === 'potion of heal wounds') { const amount = 10 + this.rng.intAvg(28, 3); p.hp = Math.min(p.hpMax, p.hp + amount); this.msg('You feel much better.', 'LIGHTGREEN'); }
    else if (name === 'potion of curing') { p.status.DUR_POISONING = 0; p.status.DUR_CONF = 0; p.hp = Math.min(p.hpMax, p.hp + 5 + this.rng.int(8)); this.msg('You feel better.', 'LIGHTGREEN'); }
    else if (name === 'potion of magic') { p.mp = Math.min(p.mpMax, p.mp + 10 + this.rng.intAvg(28, 3)); this.msg('Magic courses through your body.', 'LIGHTBLUE'); }
    else if (name === 'potion of haste') { p.status.DUR_HASTE = 26 + this.rng.int(15); this.msg('You feel yourself speed up.', 'LIGHTGREEN'); }
    else if (name === 'potion of berserk rage') { p.status.DUR_MIGHT = 30; p.status.DUR_HASTE = 30; this.msg('You go berserk!', 'LIGHTRED'); }
    else if (name === 'potion of brilliance') { p.status.DUR_BRILLIANCE = 30 + this.rng.int(20); this.msg('Your magic feels stronger.', 'LIGHTBLUE'); }
    else if (name === 'potion of agility') { p.status.DUR_AGILITY = 20 + this.rng.int(20); this.msg('You feel agile.', 'LIGHTGREEN'); }
    else if (name === 'potion of flight') { p.status.DUR_FLIGHT = 20 + this.rng.int(20); this.msg('You feel lighter than air.', 'LIGHTBLUE'); }
    else this.msg(`You quaff ${name}.`, 'LIGHTGREY');
  }

  private consume(item: Item): void {
    item.qty--;
    if (item.qty <= 0) this.player.inventory = this.player.inventory.filter((i) => i !== item);
  }

  private async readScreen(): Promise<void> {
    const items = this.player.inventory.filter((i) => i.cls === 'scroll');
    if (!items.length) { this.msg('You have nothing to read.'); return; }
    const sel = await this.pickFromInventory('Read which scroll?', items, true);
    if (sel < 0) return;
    this.readScroll(items[sel]);
    this.consume(items[sel]);
    this.takeTurn();
  }

  private readScroll(item: Item): void {
    const p = this.player;
    const n = item.id;
    if (n === 'scroll of blinking') { this.blink(); this.msg('You blink.', 'LIGHTBLUE'); }
    else if (n === 'scroll of teleportation') { this.teleport(); this.msg('You feel strangely unstable.', 'LIGHTBLUE'); }
    else if (n === 'scroll of magic mapping') {
      for (const c of this.level.cells) c.known = true;
      this.msg('The dungeon is revealed.', 'LIGHTBLUE');
    } else if (n === 'scroll of remove curse') {
      for (const i of p.inventory) i.ego = i.ego === 'cursed' ? 'normal' : i.ego;
      this.msg('Your equipment feels lighter.', 'LIGHTGREEN');
    } else if (n === 'scroll of fear') {
      for (const m of this.level.monsters) if (m.hp > 0 && this.level.cells[idx(m.x, m.y)].visible) { m.fleeing = 10; this.msg(`The ${m.name} turns to flee.`); }
    } else if (n === 'scroll of fog') this.msg('A thick fog rises.', 'LIGHTGREY');
    else if (n === 'scroll of immolation') this.msg('You feel a surge of heat.', 'LIGHTRED');
    else this.msg(`You read ${item.id}.`, 'LIGHTGREY');
  }

  private blink(): void {
    const spots: number[] = [];
    for (let y = this.player.y - 4; y <= this.player.y + 4; y++) for (let x = this.player.x - 4; x <= this.player.x + 4; x++) {
      if (!inBounds(x, y)) continue;
      const f = FEATURE[this.level.cells[idx(x, y)].feat];
      if (f && !f.solid && !monsterAt(this.level, x, y)) spots.push(idx(x, y));
    }
    if (spots.length) { const at = this.rng.choose(spots); const p = xy(at); this.player.x = p.x; this.player.y = p.y; updateFov(this.level, p.x, p.y); }
  }
  private teleport(): void {
    const spots: number[] = [];
    for (let i = 0; i < this.level.cells.length; i++) {
      if (this.level.cells[i].feat === 'DNGN_FLOOR') spots.push(i);
    }
    if (spots.length) { const at = this.rng.choose(spots); const p = xy(at); if (!monsterAt(this.level, p.x, p.y)) { this.player.x = p.x; this.player.y = p.y; updateFov(this.level, p.x, p.y); } }
  }

  private async wandScreen(): Promise<void> {
    const items = this.player.inventory.filter((i) => i.cls === 'wand');
    if (!items.length) { this.msg('You have no wands.'); return; }
    const sel = await this.pickFromInventory('Zap which wand?', items, true);
    if (sel < 0) return;
    const item = items[sel];
    if (item.charges <= 0) { this.msg('That wand has no charges left.'); return; }
    const dir = await this.readDirection('Zap where?');
    if (!dir) return;
    item.charges--;
    let x = this.player.x, y = this.player.y;
    for (let i = 0; i < 8; i++) {
      x += dir[0]; y += dir[1];
      if (!inBounds(x, y) || FEATURE[this.level.cells[idx(x, y)].feat]?.opaque) break;
      const mon = monsterAt(this.level, x, y);
      if (mon) {
        const dmg = 3 + this.rng.int(4) + (item.id === 'wand of flame' ? 3 : 0);
        mon.hp -= dmg; mon.asleep = false; mon.known = true;
        this.msg(`The ${item.id} hits the ${mon.name}.`, 'LIGHTRED');
        if (mon.hp <= 0) { mon.hp = 0; this.msg(`You kill the ${mon.name}!`, 'LIGHTGREEN'); this.awardXp(MONSTER_BY_ID.get(mon.def)?.exp ?? 1); }
        break;
      }
    }
    this.takeTurn();
  }

  private async castScreen(): Promise<void> {
    const p = this.player;
    if (!p.memorised.length) { this.msg('You know no spells.'); return; }
    const entries = p.memorised.map((id) => ({ label: `${spellName(id)} (${spellManaCost(id)} MP, ${rawSpellFail(p, id)}% fail)`, desc: SPELL_BY_ID.get(id)?.description ?? '' }));
    const sel = await this.menu('Cast which spell?', entries);
    if (sel < 0) return;
    const id = p.memorised[sel];
    const spell = SPELL_BY_ID.get(id);
    if (!spell) return;
    let dir: [number, number] | undefined;
    if (!spell.flags.includes('selfench') && !spell.flags.includes('escape') && spell.rangeMax > 0) {
      dir = await this.readDirection('Cast where?') ?? undefined;
      if (!dir) return;
    }
    const before = p.turns;
    const ctx = this.magic();
    ctx.direction = dir;
    const err = castSpell(ctx, id);
    if (err) { this.msg(err); return; }
    if (p.hp <= 0) { this.die('killed by a miscast'); return; }
    if (p.turns === before) this.takeTurn();
  }

  private async readDirection(prompt: string): Promise<[number, number] | null> {
    this.render();
    this.surface.put(0, 22, prompt, 'WHITE');
    this.surface.flush();
    const k = await this.surface.readKey();
    if (k === '\x1b') return null;
    return KEY_DIRS[k] ?? null;
  }

  private async memoriseScreen(): Promise<void> {
    const p = this.player;
    const known = p.knownSpells.filter((id) => !p.memorised.includes(id));
    if (!known.length) { this.msg('You have no new spells to memorise.'); return; }
    const entries = known.map((id) => ({ label: `${spellName(id)} (level ${SPELL_BY_ID.get(id)?.level ?? '?'})`, desc: SPELL_BY_ID.get(id)?.description ?? '' }));
    const sel = await this.menu('Memorise which spell?', entries);
    if (sel < 0) return;
    const id = known[sel];
    const level = SPELL_BY_ID.get(id)?.level ?? 1;
    if (p.xl < level * 2) { this.msg(`You need to reach XL ${level * 2} to memorise that spell.`); return; }
    p.memorised.push(id);
    this.msg(`You memorise ${spellName(id)}.`, 'LIGHTGREEN');
    this.takeTurn();
  }

  private async dropScreen(): Promise<void> {
    if (!this.player.inventory.length) { this.msg('Your pack is empty.'); return; }
    const sel = await this.pickFromInventory('Drop which item?', this.player.inventory, true);
    if (sel < 0) return;
    const item = this.player.inventory[sel];
    for (const slot of Object.keys(this.player.gear) as (keyof Gear)[]) {
      if (this.player.gear[slot] === item) this.player.gear[slot] = null;
    }
    this.player.inventory = this.player.inventory.filter((i) => i !== item);
    this.level.items.push({ at: idx(this.player.x, this.player.y), item });
    this.msg(`You drop ${itemName(item)}.`);
    recalc(this.player);
    this.takeTurn();
  }

  private async equipScreen(): Promise<void> {
    const candidates = this.player.inventory.filter((i) => (i.cls === 'weapon' || i.cls === 'armour' || i.cls === 'ring' || i.cls === 'amulet') && canEquip(this.player, i));
    if (!candidates.length) { this.msg('You have nothing to equip.'); return; }
    const sel = await this.pickFromInventory('Equip which item?', candidates, true);
    if (sel < 0) return;
    const item = candidates[sel];
    if (!equipIfPossible(this.player, item)) { this.msg('You cannot equip that.'); return; }
    const slot = equipSlot(item);
    this.msg(slot === 'weapon' ? `You wield ${itemName(item)}.` : `You wear ${itemName(item)}.`);
    this.takeTurn();
  }

  private async unequipScreen(): Promise<void> {
    const slots = (Object.keys(this.player.gear) as (keyof Gear)[]).filter((k) => this.player.gear[k]);
    if (!slots.length) { this.msg('You are not wearing anything.'); return; }
    const entries = slots.map((k) => ({ label: `${SLOT_NAMES[k]}: ${this.player.gear[k] ? itemName(this.player.gear[k]!) : ''}` }));
    const sel = await this.menu('Take off which item?', entries);
    if (sel < 0) return;
    const item = unequip(this.player, slots[sel]);
    this.msg(`You take off ${item ? itemName(item) : 'it'}.`);
    this.takeTurn();
  }

  private async pickFromInventory(title: string, items: Item[], allowCancel: boolean): Promise<number> {
    const s = this.surface;
    let sel = 0;
    for (;;) {
      s.clear();
      s.put(0, 0, title, 'WHITE');
      for (let i = 0; i < items.length && i < 23; i++) {
        const letter = i < 26 ? String.fromCharCode(97 + i) : String.fromCharCode(65 + i - 26);
        const eq = (Object.keys(this.player.gear) as (keyof Gear)[]).find((k) => this.player.gear[k] === items[i]);
        const suffix = eq ? ` (${SLOT_NAMES[eq]})` : '';
        s.put(1, 2 + i, `${letter} - ${itemName(items[i])}${items[i].qty > 1 ? ` x${items[i].qty}` : ''}${suffix}`, i === sel ? 'WHITE' : 'LIGHTGREY', i === sel ? 'BLUE' : 'BLACK');
      }
      const desc = itemDescription(items[sel]) || '';
      const wrapped = wrap(desc, SCREEN_W - 2).slice(0, 5);
      for (let i = 0; i < wrapped.length; i++) s.put(1, 18 + i, wrapped[i], 'LIGHTGREY');
      s.put(0, 23, allowCancel ? 'Letter to choose, arrows + Enter, Esc to cancel.' : 'Letter to choose.', 'DARKGREY');
      s.flush();
      const key = await s.readKey();
      if (key === '\x1b' && allowCancel) return -1;
      if (key === '\r') return sel;
      if (key === '\x1b[A') { sel = (sel + items.length - 1) % items.length; continue; }
      if (key === '\x1b[B') { sel = (sel + 1) % items.length; continue; }
      if (key.length === 1) {
        const code = key.charCodeAt(0);
        let i = -1;
        if (code >= 97 && code <= 122) i = code - 97;
        else if (code >= 65 && code <= 90) i = 26 + code - 65;
        if (i >= 0 && i < items.length) return i;
      }
    }
  }

  private async inventoryScreen(): Promise<void> {
    const s = this.surface;
    s.clear();
    s.put(0, 0, 'Inventory', 'WHITE');
    const items = this.player.inventory;
    for (let i = 0; i < items.length && i < 24; i++) {
      const letter = i < 26 ? String.fromCharCode(97 + i) : String.fromCharCode(65 + i - 26);
      const eq = (Object.keys(this.player.gear) as (keyof Gear)[]).find((k) => this.player.gear[k] === items[i]);
      s.put(1, 1 + i, `${letter} - ${itemName(items[i])}${eq ? ` (${SLOT_NAMES[eq]})` : ''}`, eq ? 'LIGHTGREEN' : 'LIGHTGREY');
    }
    s.put(0, 23, 'Esc to return.', 'DARKGREY');
    s.flush();
    const key = await s.readKey();
    if (key === '\x1b' || key === 'i') return;
    const code = key.length === 1 ? key.charCodeAt(0) : -1;
    const i = code >= 97 && code <= 122 ? code - 97 : code >= 65 && code <= 90 ? 26 + code - 65 : -1;
    if (i >= 0 && i < items.length) {
      await this.showText(itemName(items[i]), itemDescription(items[i]) || 'You see nothing special.');
    }
  }

  private async characterScreen(): Promise<void> {
    const p = this.player;
    const skills = SKILLS.map((sk) => {
      const lvl = skillLevel(p, sk.key);
      const apt = speciesApt(p, sk.key);
      return `${sk.name}: ${lvl}${apt === 0 ? '' : ` (${apt > 0 ? '+' : ''}${apt})`}`;
    }).join('   ');
    const text = [
      `${p.name} the ${p.species.name} ${p.job.name}`,
      `Title: ${playerTitle(p, false)}`,
      `XL: ${p.xl}  XP: ${p.xp}  Place: ${p.place}`,
      `Health: ${p.hp}/${p.hpMax}  Magic: ${p.mp}/${p.mpMax}`,
      `AC: ${armourClass(p)}  EV: ${evasion(p)}  SH: ${shieldClass(p)}`,
      `Str: ${strength(p)}  Int: ${intelligence(p)}  Dex: ${dexterity(p)}`,
      `Gold: ${p.gold}`,
      '',
      'Skills:',
      ...wrap(skills, SCREEN_W - 2),
      '',
      'Spells:',
      ...(p.memorised.length ? p.memorised.map((id) => `  ${spellName(id)}`) : ['  none']),
    ].join('\n');
    await this.showText('Character sheet', text);
  }

  private async skillsScreen(): Promise<void> {
    const s = this.surface;
    s.clear();
    s.put(0, 0, 'Skills', 'WHITE');
    s.put(1, 1, 'Skill', 'WHITE');
    s.put(26, 1, 'Level', 'WHITE');
    s.put(34, 1, 'Apt', 'WHITE');
    s.put(40, 1, 'Progress', 'WHITE');
    let row = 2;
    for (const sk of SKILLS) {
      if (row >= 22) break;
      const lvl = skillLevel(this.player, sk.key);
      const apt = speciesApt(this.player, sk.key);
      s.put(1, row, sk.name, 'LIGHTGREY');
      s.put(26, row, String(lvl), 'WHITE');
      s.put(34, row, apt === -99 ? '--' : (apt >= 0 ? `+${apt}` : String(apt)), apt < 0 ? 'LIGHTRED' : 'LIGHTGREEN');
      s.put(40, row, `${skillProgress(this.player, sk.key)}%`, 'DARKGREY');
      row++;
    }
    s.put(0, 23, 'Esc to return.', 'DARKGREY');
    s.flush();
    await s.readKey().catch(() => {});
  }

  private async help(): Promise<void> {
    await this.showText('Commands', [
      'h j k l y u b n, arrow keys, 1-9   move or attack',
      'H J K L Y U B N                     run',
      'g or ,                              pick up',
      'i                                   inventory',
      'e or w                              wield / wear / put on',
      'c                                   take off',
      'd                                   drop',
      'q                                   quaff a potion',
      'r                                   read a scroll',
      'z                                   cast a spell',
      'M                                   memorise a spell',
      'V                                   zap a wand',
      'm                                   skills',
      'C or @                              character sheet',
      'x                                   look around',
      'o                                   auto-explore',
      '> and <                             stairs down / up',
      'R                                   rest',
      'S                                   save and leave',
      'Q                                   quit without saving',
      '?                                   this help',
    ].join('\n'));
  }

  private async look(): Promise<void> {
    let x = this.player.x, y = this.player.y;
    for (;;) {
      this.render();
      this.surface.put(x - Math.max(0, Math.min(W - VIEW_W, this.player.x - Math.floor(VIEW_W / 2))), y - Math.max(0, Math.min(H - VIEW_H, this.player.y - Math.floor(VIEW_H / 2))), 'x', 'WHITE', 'BLUE');
      const c = this.level.cells[idx(x, y)];
      const f = FEATURE[c.feat];
      let text = f?.name ?? 'unexplored';
      if (!c.known) text = 'unexplored';
      const mon = c.known ? monsterAt(this.level, x, y) : undefined;
      if (mon) text = `the ${mon.name}`;
      else {
        const its = itemsAt(this.level, idx(x, y));
        if (its.length) text = `a ${itemName(its[0].item)}`;
      }
      this.surface.put(0, 22, `${text}`, 'WHITE');
      this.surface.put(0, 23, 'Move the cursor, Esc to return.', 'DARKGREY');
      this.surface.flush();
      const key = await this.surface.readKey();
      if (key === '\x1b') return;
      const d = KEY_DIRS[key];
      if (d) {
        const nx = x + d[0], ny = y + d[1];
        if (inBounds(nx, ny)) { x = nx; y = ny; }
      }
    }
  }

  private async autoExplore(): Promise<void> {
    if (this.autoExploring) return;
    this.autoExploring = true;
    try {
      for (let steps = 0; steps < 500; steps++) {
        if (this.visibleInterest()) break;
        const target = this.findUnexplored();
        if (target < 0) { this.msg('There are no unexplored areas on this level.'); break; }
        if (target === idx(this.player.x, this.player.y)) break;
        const next = this.firstStepToward(target);
        if (next < 0) { this.msg('You cannot find a path there.'); break; }
        const p = xy(next);
        const dx = p.x - this.player.x, dy = p.y - this.player.y;
        await this.move(dx, dy);
        if (this.dead || this.won) break;
        if (this.visibleInterest()) break;
      }
    } finally {
      this.autoExploring = false;
    }
  }

  private findUnexplored(): number {
    const start = idx(this.player.x, this.player.y);
    const seen = new Uint8Array(W * H);
    const queue = [start];
    seen[start] = 1;
    while (queue.length) {
      const at = queue.shift()!;
      const q = xy(at);
      for (const [dx, dy] of DIRS) {
        const nx = q.x + dx, ny = q.y + dy;
        if (!inBounds(nx, ny)) continue;
        if (!this.level.cells[idx(nx, ny)].known && this.walkableHere(idx(nx, ny))) return at;
      }
      for (const [dx, dy] of DIRS) {
        const nx = q.x + dx, ny = q.y + dy;
        if (!inBounds(nx, ny)) continue;
        const n = idx(nx, ny);
        if (seen[n] || !this.level.cells[n].known || !this.walkableHere(n)) continue;
        seen[n] = 1;
        queue.push(n);
      }
    }
    return -1;
  }

  private walkableHere(at: number): boolean {
    const f = FEATURE[this.level.cells[at].feat];
    return !!f && !f.solid && at !== this.tutorialExit;
  }

  private firstStepToward(target: number): number {
    const start = idx(this.player.x, this.player.y);
    const prev = new Int32Array(W * H).fill(-1);
    const seen = new Uint8Array(W * H);
    const queue = [start];
    seen[start] = 1;
    while (queue.length) {
      const at = queue.shift()!;
      if (at === target) break;
      const q = xy(at);
      for (const [dx, dy] of DIRS) {
        const nx = q.x + dx, ny = q.y + dy;
        if (!inBounds(nx, ny)) continue;
        const n = idx(nx, ny);
        if (seen[n] || !this.level.cells[n].known || !this.walkableHere(n)) continue;
        if (monsterAt(this.level, nx, ny)) continue;
        seen[n] = 1;
        prev[n] = at;
        queue.push(n);
      }
    }
    if (!seen[target]) return -1;
    let at = target;
    while (prev[at] !== start && prev[at] !== -1) at = prev[at];
    return at;
  }

  private async confirm(text: string): Promise<boolean> {
    this.render();
    this.surface.put(0, 22, `${text} (y/n)`, 'WHITE');
    this.surface.flush();
    const k = await this.surface.readKey();
    return k === 'y' || k === 'Y';
  }

  // ------------------------------------------------------------------------------------------- end
  result(): { morgue: string; score: ScoreEntry | null } {
    if (!this.player || this.tutorial) return { morgue: '', score: null };
    const morgue = this.dead || this.won ? morgueText(this.player, this.cause, this.won) : '';
    const score: ScoreEntry | null = this.dead || this.won ? {
      name: this.player.name, species: this.player.species.name, job: this.player.job.name,
      xl: this.player.xl, xp: this.player.xp, place: this.player.place, won: this.won,
      when: Date.now(), cause: this.cause,
    } : null;
    return { morgue, score };
  }
  snapshot(): { world: World; player: Player; log: { text: string; colour?: string }[]; hasOrb: boolean; dead: boolean; won: boolean } {
    return { world: this.world, player: this.player, log: this.log, hasOrb: this.hasOrb, dead: this.dead, won: this.won };
  }
}

function wrap(text: string, width: number): string[] {
  const out: string[] = [];
  for (const paragraph of text.split('\n')) {
    if (!paragraph) { out.push(''); continue; }
    let line = '';
    for (const word of paragraph.split(/\s+/)) {
      if (!line) line = word;
      else if (line.length + 1 + word.length <= width) line += ` ${word}`;
      else { out.push(line); line = word; }
    }
    if (line) out.push(line);
  }
  return out;
}

function awaitTutorial() {
  // the extractor writes dat/des/tutorial/lesson1.des's two maps; the first is lesson 1
  return TUTORIAL;
}
