// Level files (lev/Proxy.cc) and the server's level life cycle (server.cc): loading a level (PrepareLevel,
// PrepareLua with api2init.lua and security.lua, libraries, the level's luamain, WorldInitLevel) and the
// game tick with its states (running, finishing, finished, restarting).
import { parseXml, findAll, findFirst, type XmlElement } from '../util/xml.ts';
import { toBytes, fromBytes } from '../lua/lib.ts';
import { LuaError } from '../lua/interp.ts';
import { LevelLua } from './api.ts';
import {
  server, player, world, display, host, resetServerForLevel, worldPrepareLevel, worldInitLevel, XLevelRuntime,
  type GameObject, type Value,
} from './core.ts';

export interface LevelInfo {
  title: string; subtitle: string; id: string; author: string; compatibility: number; status: string;
  strings: Map<string, string>; luamain: string; deps: { path: string; id: string; release: number; preload: boolean }[];
  easy: boolean; scoreEasy: string; scoreDifficult: string;
}

export function parseLevel(xml: string): LevelInfo {
  const doc = parseXml(xml);
  const ident = findFirst(doc, 'el:identity');
  const ver = findFirst(doc, 'el:version');
  const author = findFirst(doc, 'el:author');
  const comp = findFirst(doc, 'el:compatibility');
  const modes = findFirst(doc, 'el:modes');
  const score = findFirst(doc, 'el:score');
  const strings = new Map<string, string>();
  for (const s of findAll(doc, 'el:string')) {
    const key = s.attrs['el:key'];
    const en = findFirst(s, 'el:english');
    if (en && en.text.trim() !== '' && !strings.has(key)) strings.set(key, en.text);
  }
  const deps: LevelInfo['deps'] = [];
  if (comp) for (const d of findAll(comp, 'el:dependency')) {
    deps.push({ path: d.attrs['el:path'], id: d.attrs['el:id'], release: parseInt(d.attrs['el:release'] ?? '1', 10), preload: d.attrs['el:preload'] === 'true' });
  }
  const main = findFirst(doc, 'el:luamain');
  return {
    title: ident?.attrs['el:title'] ?? '', subtitle: ident?.attrs['el:subtitle'] ?? '', id: ident?.attrs['el:id'] ?? '',
    author: author?.attrs['el:name'] ?? '', compatibility: parseFloat(comp?.attrs['el:enigma'] ?? '0'),
    status: ver?.attrs['el:status'] ?? 'released', strings, luamain: main?.text ?? '', deps,
    easy: modes?.attrs['el:easy'] === 'true', scoreEasy: score?.attrs['el:easy'] ?? '-', scoreDifficult: score?.attrs['el:difficult'] ?? '-',
  };
}
export type { XmlElement };

/** the libraries by "path_release" and "path" (lib/libmap.xml ...) */
export interface LibrarySource { get(path: string, release: number): string | null }

export class LevelSession {
  info: LevelInfo;
  api!: LevelLua;
  libs: LibrarySource;
  difficult: boolean;
  loadedLibs = new Set<string>();
  registeredLibs = new Map<string, { path: string; release: number }>();
  /** the level's first error (load or runtime) */
  error: string | null = null;

  constructor(xml: string, libs: LibrarySource, difficult: boolean) {
    this.info = parseLevel(xml);
    this.libs = libs;
    this.difficult = difficult;
  }

  localized(key: string): string { return this.info.strings.get(key) ?? key; }

  /** server.cc load_level + Proxy::loadLevel + WorldInitLevel */
  load(isRestart: boolean) {
    // PrepareLevel
    resetServerForLevel();
    server.IsLevelRestart = isRestart;
    worldPrepareLevel();
    player.prepareLevel();
    // NewGame: clear inventory, two extra lives
    player.newGame();
    // Proxy::loadDoc
    server.EnigmaCompatibility = this.info.compatibility;
    server.TwoPlayerGame = false;
    if (server.EnigmaCompatibility < 1.10) { server.AllowSingleOxyds = true; server.SurviveFinish = false; }
    server.IsDifficult = this.difficult;
    this.api = new LevelLua(this.difficult ? 2 : 1);
    this.api.loadLib = (id) => this.loadDependency(id);
    host.setDefaultFloor = (x, y) => this.api.setDefaultFloor(x, y);
    host.callLua = (f: string, arg: Value, obj: GameObject | null, expect: boolean) => this.api.callFunc(f, arg, obj, expect);
    const dropAsserts = this.info.status === 'released' || this.info.status === 'stable';
    this.runFile('api2init.lua', fileText('api2init.lua'), false);
    this.runFile('security.lua', fileText('security.lua'), false);
    // dependencies: registered for LoadLib, the preloaded ones run now
    for (const d of this.info.deps) {
      if (this.loadedLibs.has(d.id)) continue;
      if (d.preload) this.loadLib(d.id, d.path, d.release, dropAsserts);
      else this.registeredLibs.set(d.id, { path: d.path, release: d.release });
    }
    this.runFile('level', toBytes(this.info.luamain), dropAsserts);
    worldInitLevel();
    if (this.api.isFunc('postinit')) this.api.callFunc('postinit', null, null, true);
    player.onInventory();
  }

  private loadLib(id: string, path: string, release: number, dropAsserts: boolean) {
    this.loadedLibs.add(id);
    const text = this.libs.get(path, release);
    if (!text) throw new XLevelRuntime(`Level library '${path}' is not available`);
    const lib = parseLevel(text);
    for (const d of lib.deps) {
      if (this.loadedLibs.has(d.id) || this.registeredLibs.has(d.id)) continue;
      if (d.preload) this.loadLib(d.id, d.path, d.release, dropAsserts);
      else this.registeredLibs.set(d.id, { path: d.path, release: d.release });
    }
    this.runFile(path, toBytes(lib.luamain), dropAsserts);
  }
  loadDependency(id: string) {
    if (this.loadedLibs.has(id)) return;
    const r = this.registeredLibs.get(id);
    if (!r) throw new XLevelRuntime('load attempt of undeclared library');
    this.registeredLibs.delete(id);
    this.loadLib(id, r.path, r.release, this.info.status === 'released' || this.info.status === 'stable');
  }
  private runFile(name: string, code: string, dropAsserts: boolean) {
    try {
      const f = this.api.L.load(code, '@' + name, { dropAsserts });
      this.api.L.call(f, []);
    } catch (e) {
      if (e instanceof LuaError) throw new XLevelRuntime(`${name}: ${typeof e.value === 'string' ? fromBytes(e.value) : String(e.value)}`);
      throw e;
    }
  }
}

let fileSource: (name: string) => string = () => '';
export function setDataFiles(f: (name: string) => string) { fileSource = f; }
function fileText(name: string) { return fileSource(name); }

// ------------------------------------------------------------------ the game tick (server.cc, game.cc)

export const SV = { running: 0, finishing: 1, finished: 2, restartLevel: 3, restartGame: 4, idle: 5 };

export class GameLoop {
  state = SV.idle;
  timeAccu = 0;
  stateTime = 0;
  session: LevelSession;
  /** called when the level was solved (after the 2.5 s of the finished state) */
  onFinished: () => void = () => {};
  /** called after a finish was decided (the level counts as solved) */
  onSolved: (time: number) => void = () => {};
  /** reload request (restart level or game) */
  onReload: (isRestart: boolean) => void = () => {};
  /** the mouse force of this tick, set by the input */
  constructor(session: LevelSession) {
    this.session = session;
    host.finishLevel = () => { if (this.state === SV.running) this.state = SV.finishing; };
    player.restartLevel = () => this.restartLevel();
    player.restartGame = () => { if (this.state === SV.running || this.state === SV.finished || this.state === SV.finishing) { this.state = SV.restartGame; this.stateTime = 0; } };
    player.isRestarting = () => this.state === SV.restartLevel;
  }
  start() { this.state = SV.running; this.timeAccu = 0; }
  restartLevel() {
    if (this.state === SV.running || this.state === SV.finished || this.state === SV.finishing) { this.state = SV.restartLevel; this.stateTime = 0; }
  }
  private gametick(dtime: number) {
    const timestep = 0.01;
    this.timeAccu += dtime;
    if (this.timeAccu > 1.0) this.timeAccu = 1.0;
    player.tick(this.timeAccu);
    let count = 0;
    for (; this.timeAccu >= timestep; this.timeAccu -= timestep, count++) {
      server.LevelTime += timestep;
      world.tick(timestep);
    }
    for (const a of world.actorlist) a.move_screen();
    for (const o of world.others) o.tick(count * timestep);
  }
  /** one pass of the game loop: client tick (the display), then server tick */
  tick(dtime: number) {
    display.tick(dtime);
    switch (this.state) {
      case SV.running: this.gametick(dtime); break;
      case SV.restartLevel: case SV.restartGame:
        this.stateTime += dtime;
        if (this.stateTime >= 1.0) { const r = this.state === SV.restartLevel; this.state = SV.idle; this.onReload(r); }
        else this.gametick(dtime);
        break;
      case SV.finishing:
        if (server.SurviveFinish) { player.levelFinished(0); player.checkDeadActors(); }
        if (this.state === SV.finishing) {
          this.state = SV.finished;
          this.stateTime = 0;
          player.levelFinished(1);
          this.onSolved(server.LevelTime);
        }
        break;
      case SV.finished:
        this.stateTime += dtime;
        if (this.stateTime <= 2.5) this.gametick(dtime);
        else { this.state = SV.idle; this.onFinished(); }
        break;
    }
  }
}
