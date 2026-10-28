// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: engine/shared/console.cpp and engine/shared/config.cpp (the client's console: commands, config
// variables, binds' command lines, the settings file) of Teeworlds 0.7.5 in TypeScript.
import { CONFIG_VARS, CFGFLAG_CLIENT, CFGFLAG_SAVE, CFGFLAG_BASICACCESS, type CConfig, defaultConfig } from '../../generated/config.ts';
import {
  str_comp, str_comp_nocase, str_copy, str_format, str_toint, str_tofloat, str_utf8_check, str_utf8_encode,
  str_utf8_trim_whitespaces_right, str_find_nocase,
} from '../../base/system.ts';
import { GAME_VERSION } from '../../engine/shared/protocol.ts';

export const OUTPUT_LEVEL_STANDARD = 0, OUTPUT_LEVEL_ADDINFO = 1, OUTPUT_LEVEL_DEBUG = 2;
export const ACCESS_LEVEL_ADMIN = 0, ACCESS_LEVEL_MOD = 1;
const CONSOLE_MAX_STR_LENGTH = 1024;

export class CResult {
  m_aStringStorage = '';
  m_pArgsStart = 0;
  m_pCommand = '';
  m_apArgs: string[] = [];
  NumArguments(): number { return this.m_apArgs.length; }
  GetString(i: number): string { return i < this.m_apArgs.length ? this.m_apArgs[i] : ''; }
  GetInteger(i: number): number { return i < this.m_apArgs.length ? str_toint(this.m_apArgs[i]) : 0; }
  GetFloat(i: number): number { return i < this.m_apArgs.length ? str_tofloat(this.m_apArgs[i]) : 0; }
}

export type FCommandCallback = (r: CResult, user: unknown) => void;
export type FChainCommandCallback = (r: CResult, user: unknown, cb: FCommandCallback, cbUser: unknown) => void;

interface CCommand {
  m_pName: string;
  m_pHelp: string;
  m_pParams: string;
  m_Flags: number;
  m_Temp: boolean;
  m_AccessLevel: number;
  m_pfnCallback: FCommandCallback;
  m_pUserData: unknown;
  /** chain: the original callback it wraps */
  chain?: { fn: FChainCommandCallback; user: unknown; cb: FCommandCallback; cbUser: unknown };
}

const isSpace = (c: string): boolean => c === ' ' || c === '\t' || c === '\n' || c === '\r';

export class CConsole {
  m_FlagMask: number;
  m_AccessLevel = ACCESS_LEVEL_ADMIN;
  private commands: CCommand[] = [];
  private printCB: ((line: string, level: number) => void)[] = [];
  m_pConfig: CConfig;
  /** the stroke direction tokens */
  private readonly stroke = ['0', '1'];

  constructor(FlagMask: number, config: CConfig = defaultConfig()) {
    this.m_FlagMask = FlagMask;
    this.m_pConfig = config;
    this.Register('echo', 'r[text]', CFGFLAG_CLIENT, (r) => this.Print(OUTPUT_LEVEL_STANDARD, 'Console', r.GetString(0)), null, 'Echo the text');
    this.Register('toggle', 's[config-option] i[value1] i[value2]', CFGFLAG_CLIENT, (r) => this.ConToggle(r), null, 'Toggle config value');
    this.Register('+toggle', 's[config-option] i[value1] i[value2]', CFGFLAG_CLIENT, (r) => this.ConToggleStroke(r), null, 'Toggle config value via keypress');
  }

  /** CConsole::Init: every config variable is a command */
  Init(): void {
    const cfg = this.m_pConfig as unknown as Record<string, number | string>;
    for (const v of CONFIG_VARS) {
      if (v.kind === 'int') {
        const data = { name: 'm_' + v.name, min: v.min!, max: v.max! };
        this.Register(v.script, '?i', v.flags, (r) => this.IntVariableCommand(r, data), { intvar: data }, v.desc);
      } else {
        const data = { name: 'm_' + v.name, len: v.len! };
        this.Register(v.script, '?r', v.flags, (r) => this.StrVariableCommand(r, data), { strvar: data }, v.desc);
      }
    }
    void cfg;
  }

  private IntVariableCommand(r: CResult, d: { name: string; min: number; max: number }): void {
    const cfg = this.m_pConfig as unknown as Record<string, number>;
    if (r.NumArguments()) {
      let Val = r.GetInteger(0);
      if (d.min !== d.max) {
        if (Val < d.min) Val = d.min;
        if (d.max !== 0 && Val > d.max) Val = d.max;
      }
      cfg[d.name] = Val;
    } else this.Print(OUTPUT_LEVEL_STANDARD, 'Console', str_format(1024, 'Value: %d', cfg[d.name]));
  }

  private StrVariableCommand(r: CResult, d: { name: string; len: number }): void {
    const cfg = this.m_pConfig as unknown as Record<string, string>;
    if (r.NumArguments()) {
      const s = r.GetString(0);
      if (!str_utf8_check(s)) {
        let out = '';
        for (let i = 0; i < s.length; i++) {
          const e = str_utf8_encode(s.charCodeAt(i) & 0xff);
          if (out.length + e.length < d.len) out += e;
          else break;
        }
        cfg[d.name] = out;
      } else cfg[d.name] = str_copy(s, d.len);
    } else this.Print(OUTPUT_LEVEL_STANDARD, 'Console', str_format(1024, 'Value: %s', cfg[d.name]));
  }

  private intVarOf(c: CCommand): { name: string } | null {
    const u = (c.chain ? c.chain.cbUser : c.m_pUserData) as { intvar?: { name: string } } | null;
    return u && u.intvar ? u.intvar : null;
  }

  private ConToggle(r: CResult): void {
    const c = this.FindCommand(r.GetString(0), this.m_FlagMask);
    if (!c) return this.Print(OUTPUT_LEVEL_STANDARD, 'Console', str_format(128, "No such command: '%s'.", r.GetString(0)));
    const iv = this.intVarOf(c);
    if (!iv) return this.Print(OUTPUT_LEVEL_STANDARD, 'Console', str_format(128, "Invalid command: '%s'.", r.GetString(0)));
    const cfg = this.m_pConfig as unknown as Record<string, number>;
    const Val = cfg[iv.name] === r.GetInteger(1) ? r.GetInteger(2) : r.GetInteger(1);
    this.ExecuteLine(str_format(128, '%s %i', r.GetString(0), Val));
  }

  private ConToggleStroke(r: CResult): void {
    const c = this.FindCommand(r.GetString(1), this.m_FlagMask);
    if (!c) return this.Print(OUTPUT_LEVEL_STANDARD, 'Console', str_format(128, "No such command: '%s'.", r.GetString(1)));
    if (!this.intVarOf(c)) return this.Print(OUTPUT_LEVEL_STANDARD, 'Console', str_format(128, "Invalid command: '%s'.", r.GetString(1)));
    const Val = r.GetInteger(0) === 0 ? r.GetInteger(3) : r.GetInteger(2);
    this.ExecuteLine(str_format(128, '%s %i', r.GetString(1), Val));
  }

  RegisterPrintCallback(fn: (line: string, level: number) => void): void { this.printCB.push(fn); }

  Print(Level: number, pFrom: string, pStr: string): void {
    for (const cb of this.printCB) cb(`[${pFrom}]: ${pStr}`, Level);
  }

  Register(pName: string, pParams: string, Flags: number, fn: FCommandCallback, pUser: unknown, pHelp: string): void {
    let c = this.FindCommand(pName, Flags);
    const add = !c;
    if (!c) c = { m_pName: pName, m_pHelp: pHelp, m_pParams: pParams, m_Flags: Flags, m_Temp: false, m_AccessLevel: Flags & CFGFLAG_BASICACCESS ? ACCESS_LEVEL_MOD : ACCESS_LEVEL_ADMIN, m_pfnCallback: fn, m_pUserData: pUser };
    c.m_pfnCallback = fn;
    c.m_pUserData = pUser;
    c.m_pName = pName;
    c.m_pHelp = pHelp;
    c.m_pParams = pParams;
    c.m_Flags = Flags;
    if (add) {
      // AddCommandSorted
      let i = 0;
      while (i < this.commands.length && str_comp(this.commands[i].m_pName, pName) < 0) i++;
      this.commands.splice(i, 0, c);
    }
  }

  Chain(pName: string, fn: FChainCommandCallback, pUser: unknown): void {
    const c = this.FindCommand(pName, this.m_FlagMask);
    if (!c) {
      this.Print(OUTPUT_LEVEL_DEBUG, 'console', str_format(256, "failed to chain '%s'", pName));
      return;
    }
    const prev = c.m_pfnCallback, prevUser = c.m_pUserData;
    c.chain = { fn, user: pUser, cb: prev, cbUser: prevUser };
    c.m_pfnCallback = (r) => fn(r, pUser, prev, prevUser);
  }

  FindCommand(pName: string, FlagMask: number): CCommand | null {
    for (const c of this.commands) if (c.m_Flags & FlagMask && str_comp_nocase(c.m_pName, pName) === 0) return c;
    return null;
  }

  /** PossibleCommands: names that contain the string */
  PossibleCommands(pStr: string, FlagMask: number, fn: (name: string) => void): void {
    for (const c of this.commands) if (c.m_Flags & FlagMask && str_find_nocase(c.m_pName, pStr) >= 0) fn(c.m_pName);
  }

  /** ParseStart: splits the command name off */
  private ParseStart(r: CResult, pString: string, Length: number): void {
    const Len = Math.min(CONSOLE_MAX_STR_LENGTH + 1, Length);
    const s = str_copy(pString, Len);
    r.m_aStringStorage = s;
    let i = 0;
    while (i < s.length && isSpace(s[i])) i++;
    const start = i;
    while (i < s.length && s[i] !== ' ' && s[i] !== '\t' && s[i] !== '\n') i++;
    r.m_pCommand = s.slice(start, i);
    if (i < s.length) i++;
    r.m_pArgsStart = i;
  }

  private static NextParam(fmt: string, p: number): { c: string; p: number; err: boolean } {
    if (p < fmt.length) {
      p++;
      if (fmt[p] === '[') {
        while (p < fmt.length && fmt[p] !== ']') p++;
        if (p >= fmt.length) return { c: '', p, err: true };
        p++;
      }
      while (p < fmt.length && isSpace(fmt[p])) p++;
    }
    return { c: p < fmt.length ? fmt[p] : '', p, err: false };
  }

  /** ParseArgs: 0, or 1 on an error */
  private ParseArgs(r: CResult, pFormat: string): number {
    let fp = 0;
    let Command = pFormat.length ? pFormat[0] : '';
    let Optional = false;
    let Error = 0;
    const s = r.m_aStringStorage;
    let i = r.m_pArgsStart;
    r.m_apArgs = [];
    while (!Error) {
      if (!Command) break;
      if (Command === '?') Optional = true;
      else {
        while (i < s.length && isSpace(s[i])) i++;
        if (i >= s.length) {
          if (!Optional) Error = 1;
          break;
        }
        if (s[i] === '"') {
          i++;
          let arg = '';
          for (;;) {
            if (i >= s.length) return 1;
            if (s[i] === '"') break;
            if (s[i] === '\\' && (s[i + 1] === '\\' || s[i + 1] === '"')) i++;
            arg += s[i];
            i++;
          }
          r.m_apArgs.push(arg);
          i++;
        } else {
          if (Command === 'r') {
            r.m_apArgs.push(str_utf8_trim_whitespaces_right(s.slice(i)));
            break;
          }
          const st = i;
          while (i < s.length && s[i] !== ' ' && s[i] !== '\t' && s[i] !== '\n') i++;
          r.m_apArgs.push(s.slice(st, i));
          if (i < s.length) i++;
        }
      }
      const n = CConsole.NextParam(pFormat, fp);
      fp = n.p;
      Command = n.c;
      Error = n.err ? 1 : 0;
    }
    return Error;
  }

  ArgStringIsValid(pFormat: string): boolean {
    let fp = 0;
    let Command = pFormat[0] ?? '';
    let Last = false;
    for (;;) {
      if (!Command) break;
      if (Last && fp < pFormat.length) return false;
      if (Command === '?') {
        if (fp + 1 >= pFormat.length) return false;
      } else if (Command === 'r') Last = true;
      else if (Command !== 'i' && Command !== 'f' && Command !== 's') return false;
      const n = CConsole.NextParam(pFormat, fp);
      if (n.err) return false;
      fp = n.p;
      Command = n.c;
    }
    return true;
  }

  /** ParseCommandArgs (chat commands) */
  ParseCommandArgs(pArgs: string, pFormat: string, fn: FCommandCallback, ctx: unknown): number {
    const r = new CResult();
    r.m_aStringStorage = str_copy(pArgs, CONSOLE_MAX_STR_LENGTH + 1);
    r.m_pArgsStart = 0;
    const e = this.ParseArgs(r, pFormat);
    if (e) return e;
    fn(r, ctx);
    return 0;
  }

  private splitParts(pStr: string): string[] {
    const parts: string[] = [];
    let p: string | null = pStr;
    while (p !== null && p.length) {
      let end = 0;
      let next: string | null = null;
      let inString = false;
      while (end < p.length) {
        const c = p[end];
        if (c === '"') inString = !inString;
        else if (c === '\\') {
          if (p[end + 1] === '"') end++;
        } else if (!inString) {
          if (c === ';') {
            next = p.slice(end + 1);
            break;
          } else if (c === '#') break;
        }
        end++;
      }
      parts.push(p.slice(0, end));
      p = next;
    }
    return parts;
  }

  LineIsValid(pStr: string): boolean {
    if (!pStr) return false;
    for (const part of this.splitParts(pStr)) {
      const r = new CResult();
      this.ParseStart(r, part, part.length + 1);
      const c = this.FindCommand(r.m_pCommand, this.m_FlagMask);
      if (!c || this.ParseArgs(r, c.m_pParams)) return false;
    }
    return true;
  }

  ExecuteLineStroked(Stroke: number, pStr: string): void {
    for (const part of this.splitParts(pStr)) {
      const r = new CResult();
      this.ParseStart(r, part, part.length + 1);
      if (!r.m_pCommand) return;
      const c = this.FindCommand(r.m_pCommand, this.m_FlagMask);
      if (c) {
        if (c.m_AccessLevel >= this.m_AccessLevel) {
          let isStroke = false;
          if (r.m_pCommand[0] === '+') isStroke = true;
          if (Stroke || isStroke) {
            if (this.ParseArgs(r, c.m_pParams)) {
              this.Print(OUTPUT_LEVEL_STANDARD, 'Console', str_format(256, 'Invalid arguments... Usage: %s %s', c.m_pName, c.m_pParams));
            } else {
              // the stroke token is the first argument of a + command
              if (isStroke) r.m_apArgs.unshift(this.stroke[Stroke]);
              c.m_pfnCallback(r, c.m_pUserData);
            }
          }
        } else if (Stroke) this.Print(OUTPUT_LEVEL_STANDARD, 'Console', str_format(256, 'Access for command %s denied.', r.m_pCommand));
      } else if (Stroke) this.Print(OUTPUT_LEVEL_STANDARD, 'Console', str_format(256, 'No such command: %s.', r.m_pCommand));
    }
  }

  ExecuteLine(pStr: string): void {
    this.ExecuteLineStroked(1, pStr);
    this.ExecuteLineStroked(0, pStr);
  }

  /** CConfigManager::Save: the settings file's text (the CFGFLAG_SAVE|CFGFLAG_CLIENT variables that differ) */
  SaveConfig(extra: (line: (s: string) => void) => void): string {
    const lines = ['# Teeworlds ' + GAME_VERSION];
    const cfg = this.m_pConfig as unknown as Record<string, number | string>;
    for (const v of CONFIG_VARS) {
      if (!(v.flags & CFGFLAG_SAVE) || !(v.flags & CFGFLAG_CLIENT)) continue;
      const val = cfg['m_' + v.name];
      if (v.kind === 'int') {
        if (val !== v.def) lines.push(`${v.script} ${val}`);
      } else if (str_comp(val as string, v.def as string)) {
        let e = '';
        for (const ch of val as string) e += ch === '"' || ch === '\\' ? '\\' + ch : ch;
        lines.push(`${v.script} "${e}"`);
      }
    }
    extra((s) => lines.push(s));
    return lines.join('\n') + '\n';
  }

  /** ExecuteFile: every line of a config file */
  ExecuteText(text: string): void {
    for (const line of text.split(/\r?\n/)) if (line) this.ExecuteLine(line);
  }
}
