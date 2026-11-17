// gengine/Scripter + ScriptState, plan/Planner, CommandQueue, ScriptCmd, DialogStack, PlannedDialog,
// Dialog, FishDialog: a Lua state that runs data scripts, and the plan and dialogs of a level or demo.
import { Lua, LuaError, LuaFunction, LuaTable, tostr, truthy, typeName, type LuaValue } from '../lua/interp.ts';
import { openLibs } from '../lua/lib.ts';
import { rng } from './random.ts';
import { cppSplit } from './anim.ts';
import type { Env } from './env.ts';

export class ScriptException extends Error {}

export const argStr = (a: LuaValue[], i: number, fname: string): string => {
  const s = tostr(a[i]);
  if (s === undefined) throw new LuaError(`bad argument #${i + 1} to \`${fname}' (string expected, got ${a[i] === undefined ? 'no value' : typeName(a[i])})`);
  return s;
};
export const argInt = (a: LuaValue[], i: number, fname: string): number => {
  const v = a[i];
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN;
  if (Number.isNaN(n) || (typeof v === 'string' && v.trim() === '')) throw new LuaError(`bad argument #${i + 1} to \`${fname}' (number expected, got ${v === undefined ? 'no value' : typeName(v)})`);
  return Math.trunc(n);
};
export const argNum = (a: LuaValue[], i: number, fname: string): number => {
  const v = a[i];
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN;
  if (Number.isNaN(n)) throw new LuaError(`bad argument #${i + 1} to \`${fname}' (number expected, got ${v === undefined ? 'no value' : typeName(v)})`);
  return n;
};
export const optInt = (a: LuaValue[], i: number, fname: string, d: number): number => (a[i] === undefined ? d : argInt(a, i, fname));
export const optStr = (a: LuaValue[], i: number, fname: string, d: string): string => (a[i] === undefined ? d : argStr(a, i, fname));

/** Scripter: a Lua state with file_include and file_exists */
export class Scripter {
  env: Env;
  lua = new Lua();
  constructor(env: Env) {
    this.env = env;
    openLibs(this.lua, { rand: rng.rand, print: (s) => env.log(s) });
    this.reg('file_include', (a) => { this.scriptInclude(argStr(a, 0, 'file_include')); });
    this.reg('file_exists', (a) => this.env.vfs.exists(argStr(a, 0, 'file_exists')));
  }

  reg(name: string, f: (a: LuaValue[]) => LuaValue[] | LuaValue | void): void {
    this.lua.setGlobal(name, f);
  }

  /** ScriptState::callStack: a failing script is a ScriptException */
  private guard<T>(f: () => T): T {
    try {
      return f();
    } catch (e) {
      if (e instanceof LuaError) throw new ScriptException(`script failure: ${e.message}`);
      throw e;
    }
  }

  scriptInclude(path: string): void {
    const text = this.env.vfs.readText(path);
    if (text === null) throw new ScriptException(`script failure: cannot open ${path}`);
    const chunk = this.guard(() => this.lua.load(text, path));
    this.guard(() => chunk.call([]));
  }

  scriptDo(input: string): void {
    this.guard(() => this.lua.run(input, input));
  }

  callCommand(fn: LuaFunction, param: number): boolean {
    const r = this.guard(() => fn.call([param]));
    if (typeof r[0] !== 'boolean') throw new ScriptException(`script command failure - boolean expected, got ${typeName(r[0])}`);
    return r[0];
  }
}

/** a planned command: a Lua function(count) -> bool */
class CommandQueue {
  commands: LuaFunction[] = [];
  count = 0;
  private readonly script: Scripter;
  constructor(script: Scripter) { this.script = script; }
  plan(f: LuaFunction): void { this.commands.push(f); }
  executeFirst(): boolean {
    if (this.commands.length === 0) return false;
    const cmd = this.commands[0];
    if (this.script.callCommand(cmd, this.count)) {
      // the command may have changed the queue (removeAll); remove it only if still first
      if (this.commands[0] === cmd) this.commands.shift();
      this.count = 0;
    } else {
      this.count++;
    }
    return true;
  }
  removeAll(): void { this.commands = []; this.count = 0; }
  empty(): boolean { return this.commands.length === 0; }
}

export { CommandQueue };

export class Dialog {
  lang: string;
  soundfile: string;
  subtitle: string;
  fontname: string;
  /** the loaded sound: the resolved path, or null when there is none */
  sound: string | null | undefined = undefined;
  constructor(lang: string, soundfile: string, subtitle: string, fontname: string) {
    this.lang = lang;
    this.soundfile = soundfile;
    this.subtitle = subtitle;
    this.fontname = fontname;
  }
  isSpeechless(): boolean { return this.soundfile === ''; }
  getFormatedSubtitle(args: string[]): string {
    let buffer = this.subtitle;
    for (let i = 1; i < args.length; i++) buffer = buffer.split('%' + i).join(args[i]);
    return buffer;
  }
  getMinTime(): number {
    let n = 0;
    for (let i = 0; i < this.subtitle.length; i++) if ((this.subtitle.charCodeAt(i) & 0xc0) !== 0x80) n++;
    return Math.min(180, n);
  }
}

class PlannedDialog {
  channel = -1;
  endtime = 0;
  actor: number;
  dialog: Dialog;
  minTime: number;
  private env: Env;
  constructor(actor: number, dialog: Dialog, minTime: number, env: Env) {
    this.actor = actor;
    this.dialog = dialog;
    this.minTime = minTime;
    this.env = env;
  }
  talk(volume: number, loops: number): void {
    const d = this.dialog;
    if (d.sound === undefined) {
      d.sound = null;
      if (d.soundfile !== '' && this.env.options.getAsBool('sound', true)) {
        const p = this.env.vfs.dataPath(d.soundfile);
        if (this.env.vfs.exists(d.soundfile)) d.sound = p;
      }
    }
    this.channel = this.env.sound.playSound(d.sound, volume, loops);
    this.endtime = loops === -1 ? 1 << 30 : this.minTime * (loops + 1) + this.env.cycles;
  }
  killTalk(): void { if (this.isPlaying()) this.env.sound.halt(this.channel); }
  isPlaying(): boolean {
    return this.channel > -1 && this.dialog.sound != null && this.env.sound.isPlaying(this.channel, this.dialog.sound);
  }
  isTalking(): boolean {
    if (this.channel > -1) return this.isPlaying();
    return this.endtime > this.env.cycles;
  }
}

export class DialogStack {
  /** ResDialogPack: a multimap name -> dialogs in insertion order */
  dialogs = new Map<string, Dialog[]>();
  running: PlannedDialog[] = [];
  cycling: PlannedDialog[] = [];
  activeDialog: PlannedDialog | null = null;
  private env: Env;
  constructor(env: Env) { this.env = env; }

  updateStack(): void {
    const i = this.running.findIndex((d) => !d.isTalking());
    if (i >= 0) {
      this.releaseDialog(this.running[i]);
      this.running.splice(i, 1);
    }
  }

  addDialog(name: string, d: Dialog): void {
    let l = this.dialogs.get(name);
    if (!l) this.dialogs.set(name, (l = []));
    l.push(d);
  }

  private findDialog(name: string, lang: string): Dialog | null {
    let bestScore = 0;
    let best: Dialog | null = null;
    for (const d of this.dialogs.get(name) ?? []) {
      const score = matchScore(lang, d.lang);
      if (bestScore < score) { bestScore = score; best = d; }
    }
    return bestScore < 2 ? null : best;
  }

  findDialogHard(name: string): Dialog | null {
    const lang = this.env.options.getParam('lang');
    let d = this.findDialog(name, lang);
    if (!d) {
      d = this.findDialog(name, 'en');
      if (!d) this.env.log(`cannot find dialog: ${name}`);
    }
    return d;
  }

  findDialogSpeech(name: string): Dialog | null {
    const speech = this.env.options.getParam('speech', this.env.options.getParam('lang'));
    let d = this.findDialog(name, speech);
    if (!d || d.isSpeechless()) {
      d = this.findDialog(name, 'en');
      if (!d) this.env.log(`cannot find speech: ${name}`);
    }
    return d;
  }

  actorTalk(actor: number, name: string, volume: number, loops: number, dialogFlag: boolean): void {
    const args = cppSplit(name, '@');
    const subtitle = this.findDialogHard(args[0] ?? '');
    if (subtitle) {
      if (subtitle.fontname !== '') {
        const text = subtitle.getFormatedSubtitle(args);
        if (text !== '') this.env.subtitles.newSubtitle(text, subtitle.fontname);
      }
      const dialog = this.findDialogSpeech(args[0]);
      if (dialog) {
        const talker = new PlannedDialog(actor, dialog, subtitle.getMinTime(), this.env);
        talker.talk(volume, loops);
        if (loops === -1) this.cycling.push(talker);
        else this.running.push(talker);
        if (dialogFlag) this.activeDialog = talker;
      }
    }
  }

  isTalking(actor: number): boolean {
    return this.running.some((d) => d.actor === actor && d.isTalking()) || this.cycling.some((d) => d.actor === actor && d.isTalking());
  }

  killSound(actor: number): void {
    for (const list of [this.running, this.cycling]) {
      for (let i = 0; i < list.length;) {
        if (list[i].actor === actor) { this.releaseDialog(list[i]); list.splice(i, 1); } else i++;
      }
    }
  }

  killTalks(): void {
    for (const d of this.running) this.releaseDialog(d);
    for (const d of this.cycling) this.releaseDialog(d);
    this.running = [];
    this.cycling = [];
  }

  private releaseDialog(d: PlannedDialog): void {
    if (d === this.activeDialog) this.activeDialog = null;
    d.killTalk();
  }

  removeAll(): void {
    this.killTalks();
    this.dialogs.clear();
  }

  isDialog(): boolean { return this.activeDialog !== null && this.activeDialog.isTalking(); }
  areRunning(): boolean { return this.running.length > 0; }
}

function matchScore(a: string, b: string): number {
  let score = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    if (a[i] === b[i]) score++;
    else return 0;
  }
  return score;
}

/** Planner: a script with a plan of commands and dialogs */
export class Planner extends Scripter {
  plan: CommandQueue;
  dialogs: DialogStack;
  constructor(env: Env) {
    super(env);
    this.plan = new CommandQueue(this);
    this.dialogs = new DialogStack(env);
    this.reg('game_planAction', (a) => {
      if (!(a[0] instanceof LuaFunction)) throw new LuaError('bad argument #1 (function expected)');
      this.plan.plan(a[0]);
    });
    this.reg('game_isPlanning', () => !this.plan.empty());
    this.reg('game_killPlan', () => { this.interruptPlan(); });
    this.reg('dialog_isDialog', () => this.dialogs.isDialog());
    this.reg('dialog_addFont', (a) => {
      this.env.subtitles.addFont(argStr(a, 0, 'dialog_addFont'), argInt(a, 1, 'dialog_addFont'), argInt(a, 2, 'dialog_addFont'), argInt(a, 3, 'dialog_addFont'));
    });
    this.reg('dialog_addDialog', (a) => {
      const name = argStr(a, 0, 'dialog_addDialog');
      const lang = argStr(a, 1, 'dialog_addDialog');
      const soundfile = argStr(a, 2, 'dialog_addDialog');
      const fontname = optStr(a, 3, 'dialog_addDialog', '');
      const subtitle = optStr(a, 4, 'dialog_addDialog', '');
      this.dialogs.addDialog(name, new Dialog(lang, soundfile, subtitle, fontname));
    });
    this.reg('model_isTalking', (a) => this.dialogs.isTalking(argInt(a, 0, 'model_isTalking')));
    this.reg('model_talk', (a) => {
      this.dialogs.actorTalk(argInt(a, 0, 'model_talk'), argStr(a, 1, 'model_talk'), optInt(a, 2, 'model_talk', 75), optInt(a, 3, 'model_talk', 0), truthy(a[4]));
    });
    this.reg('model_killSound', (a) => { this.dialogs.killSound(argInt(a, 0, 'model_killSound')); });
    this.reg('sound_playMusic', (a) => { this.env.sound.playMusic(this.env.vfs.dataPath(argStr(a, 0, 'sound_playMusic'))); });
    this.reg('sound_stopMusic', () => { this.env.sound.stopMusic(); });
    this.reg('options_getParam', (a) => {
      const v = this.env.options.getParam(argStr(a, 0, 'options_getParam'));
      return v === '' ? undefined : v;
    });
  }

  /** Planner::satisfyPlan: true when the plan is finished */
  satisfyPlan(): boolean {
    this.dialogs.updateStack();
    this.plan.executeFirst();
    return this.plan.empty();
  }

  killPlan(): void {
    this.dialogs.killTalks();
    this.env.subtitles.killTalks();
    this.interruptPlan();
  }

  interruptPlan(): void { this.plan.removeAll(); }
}

export { LuaTable };
