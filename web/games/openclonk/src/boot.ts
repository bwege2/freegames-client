// OpenClonk in the browser: the engine's setup, from its packed content groups to a running game, without any
// presentation. What the original does in C4Application::Init / C4Game::OpenScenario / C4Game::InitGame for a
// single local player is here in the same order; test/boot.test.ts runs it headlessly against the original's
// groups (re/openclonk/tools/pack.sh), the page runs it after downloading the same files.
import { initGlobals } from './sim/index.ts';
import { $ } from './rt/registry.ts';
import { P, S, $cs, $str } from './rt/ptr.ts';
import { addFile, c$mkdir, resetFs } from './rt/fs.ts';
import { C4Group, unpackGroupFile } from './rt/group.ts';
import { prepareHeadless } from './rt/headless.ts';
import { NONCOMMERCIAL_FILES, NONCOMMERCIAL_PATHS } from './settings.ts';
import { startDebugRec, type DbgChunk } from './rt/debugrec.ts';

/**
 * where the engine finds the content (Config.General.SystemDataPath): the planet folder where the original's Linux
 * build installs it. A path below the root matters: C4GroupSet::RegisterParentFolders, tracing the scenario's
 * path back to its first folder that is not a .ocf, never checks a first component right below the root, so
 * /planet/Missions.ocf/... would make it open "planet" as a group.
 */
export const SYSTEM_DATA = '/usr/share/games/openclonk/';

/** one content group of the original's planet folder (packed by re/openclonk/tools/pack.sh) */
export interface ContentGroup {
  /** file name in the planet folder, e.g. "Objects.ocd" */
  name: string;
  data: Uint8Array;
}

/** one file of the planet folder that ships outside its packed group (the non-commercial files, settings.ts) */
export interface ContentFile {
  /** path in the planet folder, e.g. "Sound.ocg/Environment.ocg/WindLoop.ogg" */
  path: string;
  data: Uint8Array;
}

export interface BootOptions {
  /** the groups the game loads: System.ocg, Graphics.ocg, Material.ocg, Objects.ocd, ... */
  groups: ContentGroup[];
  /** single files put into the unpacked groups at their planet paths (tools/pack.sh keeps them beside the groups) */
  files?: ContentFile[];
  /** NONCOMMERCIAL_FILES of settings.ts; tests set it to run both states */
  noncommercial?: boolean;
  /** scenario group path in the system data folder, e.g. "Missions.ocf/AcidDrilling.ocs" */
  scenario: string;
  /** the synchronized random seed (C4Game::RandomSeed); a fixed one makes a game reproducible */
  seed: number;
  /**
   * where the engine writes its files (config, logs, savegames, records): a folder in the in-memory file system,
   * by default where the original keeps it on Linux, /home/player/.clonk/openclonk/
   */
  userDataPath?: string;
  /** the original's progress and error log (C4Game::SetInitProgress, Log/LogF); silent by default */
  log?: (line: string) => void;
  /**
   * the local player's crew (the original's player selection dialog writes such a file, `Clonk.ocp`, and puts it
   * in Config.General.Participants): its name, and so the name in the HUD and the clonk's name. Without one the
   * scenario runs without a clonk, as the original does.
   */
  playerName?: string;
  /** no local player at all, as the original's headless server runs a scenario (the debug-record oracle) */
  noPlayer?: boolean;
  /** turns the debug record on (Config.General.DebugRec) and gets every chunk, from the definitions' loading on */
  onDebugRec?: (c: DbgChunk) => void;
  /**
   * a record of the original (a packed scenario group with Replay=true and the control, CtrlRec.ocb, as its
   * `--record` writes it into Records.ocf): the game replays it, as the original's `openclonk <record>` does; the
   * scenario, seed and players are the record's. `scenario` and `seed` are not used then.
   */
  replay?: { name: string; data: Uint8Array };
  /**
   * records the game, as the original's `--record` does (C4Application: Game.Record): C4Record writes the scenario
   * and the control (CtrlRec.ocb) to Records.ocf/<nnn>-<scenario>.ocs in the user folder, packed when the record
   * stops (C4GameControl::StopRecord, which C4Game::Evaluate and C4Game::Clear call).
   */
  record?: boolean;
}

/** unpacks a packed group (and the child groups in it) into the in-memory file system */
function mountGroup(path: string, data: Uint8Array, depth = 0): void {
  if (depth > 8) throw new Error(`group nesting too deep at ${path}`);
  // a child group is stored unpacked inside its parent (header, entries, data), only the file is gzipped
  const group = new C4Group(path, depth === 0 ? unpackGroupFile(data) : data);
  for (const e of group.entries) {
    if (e.deleted) continue;
    const entry = path + '/' + e.name;
    const bytes = group.LoadEntry(e.name);
    if (!bytes) continue;
    if (e.ChildGroup) mountGroup(entry, bytes, depth + 1);
    else addFile(entry, bytes);
  }
}

export interface Game {
  /** advances one frame (C4Game::Execute); false when the game is over */
  tick(): boolean;
  /** the engine's globals, for the presentation (landscape, objects, players) */
  readonly engine: any;
  /** the scenario's C4S (title, map size, ...) */
  readonly scenario: any;
}

/** the engine's log output goes to `log`, not to the browser console */
function routeLog(log: (line: string) => void): void {
  /** C4Game's Log/LogF take a format string and its arguments (FormatString in rt/printf.ts) */
  const formatted = (msg: any, args: any[]): any => {
    if (!args.length) return msg;
    try { return ($ as any).FormatString(msg, ...args); } catch { return msg; }
  };
  const out = (msg: any) => {
    let text = '';
    try {
      if (typeof msg === 'string') text = msg;
      else if (msg && typeof msg.getData === 'function') text = $str(msg.getData());
      else if (msg && msg.a) text = $str(msg);
      else text = String(msg);
    } catch { /* not printable */ }
    log(text.replace(/\n$/, ''));
  };
  for (const n of ['Log', 'LogF', 'DebugLog', 'DebugLogF', 'LogSilentF']) {
    ($ as any)[n] = (msg: any, ...args: any[]) => out(formatted(msg, args));
  }
  ($ as any).LogFatal = (msg: any, ...args: any[]) => {
    const text = (() => {
      try {
        const f = formatted(msg, args);
        return f && f.getData ? $str(f.getData()) : f && f.a !== undefined ? $str(f) : String(f);
      } catch { return 'fatal'; }
    })();
    out(formatted(msg, args));
    throw new Error('LogFatal: ' + text);
  };
}

/**
 * Sets the engine up and starts a scenario, like the original's "start game": the content groups, the system
 * group, the player controls, the scenario and its definitions/scripts/landscape, the local player and the
 * scenario's Initialize callback. Throws when one of those steps fails (with the engine's log in `lines`).
 */
export function boot(opts: BootOptions): Game {
  const lines: string[] = [];
  const log = (line: string) => { lines.push(line); opts.log?.(line); };

  initGlobals(true);
  prepareHeadless();
  routeLog(log);
  if (opts.onDebugRec) startDebugRec(opts.onDebugRec, !!opts.replay);

  resetFs();
  // the page downloads the original's packed groups; the engine reads them as folders (C4Group::Open on a
  // directory), so they are unpacked here once. A group entry that is itself a group (a scenario, an object
  // definition) stays a folder, as in planet/.
  for (const g of opts.groups) mountGroup(SYSTEM_DATA + g.name, g.data);
  // the non-commercial files only while the setting is on; without them the original's lookups find nothing
  const noncommercial = opts.noncommercial ?? NONCOMMERCIAL_FILES;
  for (const f of opts.files ?? []) {
    if (!noncommercial && NONCOMMERCIAL_PATHS.includes(f.path)) continue;
    addFile(SYSTEM_DATA + f.path, f.data);
  }
  const user = opts.userDataPath ?? '/home/player/.clonk/openclonk/';
  const userPath = $cs(S(user), 4096);
  c$mkdir(P(userPath, 0));
  // a record lives in the user's Records.ocf, where the original writes it
  const replay = opts.replay ? `${user}Records.ocf/${opts.replay.name}` : null;
  if (opts.replay) {
    c$mkdir(P($cs(S(`${user}Records.ocf`), 4096), 0));
    mountGroup(replay!, opts.replay.data);
  }

  const G = $.Config.General;
  G.ExePath = new $.StdCopyStrBuf().init$pi8$b(S('/'), true);
  G.SystemDataPath = $cs(S(SYSTEM_DATA), 4096);
  G.ModsDataPath = $cs(S(SYSTEM_DATA + 'mods/'), 4096);
  G.UserDataPath = userPath;
  G.LanguageEx = $cs(S('US'), 32);
  // the temporary folder (C4Config::General.TempPath; on Linux the system's, /tmp/): packed player files for a join
  G.TempPath = $cs(S('/tmp/'), 4096);
  c$mkdir(P(G.TempPath, 0), 0);

  const fail = (what: string): never => {
    throw new Error(`${what} failed:\n${lines.slice(-20).join('\n')}`);
  };

  $.Reloc.Init();
  if ($.Reloc.Paths.length === 0) fail('Reloc.Init (the content groups)');
  if (!$.Application.OpenSystemGroup()) fail('Application.OpenSystemGroup (System.ocg)');
  if (!$.Game.InitPlayerControlSettings()) fail('Game.InitPlayerControlSettings (PlayerControls.txt)');

  // the original's start menu writes a crew file for the local player (C4PlayerInfoCore::Save) and passes it in
  // Config.General.Participants (C4Game::Init copies that into Game.PlayerFilenames, which InitLocal joins)
  const crewFile = 'Clonk.ocp';
  {
    // a crew is a group with Player.txt (C4PlayerInfoCore, C4InfoCore.cpp); the engine reads groups as folders
    const name = (opts.playerName ?? 'Clonk').replace(/[\\/:*?"<>|]/g, '_').slice(0, 30);
    const playerTxt = `[Player]\nName=${name}\n[Preferences]\nColor=0\nColorDw=4286845440\nColorDw2=0\nMouse=1\nControlSet=Mouse\n`;
    c$mkdir(P($cs(S(user + crewFile + '/'), 4096), 0));
    addFile(user + crewFile + '/Player.txt', new TextEncoder().encode(playerTxt));
  }
  if (!opts.noPlayer) $.SCopy$pi8$pi8$u64(S(crewFile), P($.Game.PlayerFilenames, 0), 4096);

  // the scenario's full path, as the original gets it (its start menu, or the command line: debugrec.sh passes
  // planet/<scenario>); C4GameSave copies the scenario from there into a record
  const scenarioPath = replay ?? SYSTEM_DATA + opts.scenario;
  $.Game.SetScenarioFilename(S(scenarioPath));
  if (!$.Game.OpenScenario()) fail(`Game.OpenScenario (${scenarioPath})`);
  if (!$.Game.InitNetworkHost()) fail('Game.InitNetworkHost');
  if (!$.Game.Extra.Init()) fail('Game.Extra.Init');

  // C4Application's command line (`--record`) sets it before the game is initialized; C4Game::InitControl starts it
  if (opts.record) $.Game.Record = true;
  $.Game.RandomSeed = opts.seed | 0;
  const numbers = new $.C4ValueNumbers().init();
  if (!$.Game.InitGame($.Game.ScenarioFile, 0, true, numbers)) fail('Game.InitGame (definitions, scripts, landscape)');
  // the original's C4Game::Init synchronizes a non-network game before the players join
  $.Game.SyncClearance();
  $.Game.Synchronize(false);
  if (!$.Game.InitPlayers(numbers)) fail('Game.InitPlayers');
  if (!$.Game.InitGameFinal(0)) fail('Game.InitGameFinal (scenario Initialize)');
  $.Game.IsRunning = true;

  return {
    engine: $,
    scenario: $.Game.C4S,
    tick: () => $.Game.Execute(),
  };
}
