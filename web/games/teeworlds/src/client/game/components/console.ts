// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: game/client/components/console.h and console.cpp of Teeworlds 0.7.5 in TypeScript. The backlog and
// the history are arrays capped at the original's 64 KiB; dump_*_console has no file to write to.
import { v4, str_format, str_find_nocase, Localize, ImageTex } from './common.ts';
import * as C from '../../../generated/content.ts';
import { CFGFLAG_CLIENT, CFGFLAG_SERVER } from '../../../generated/config.ts';
import { CQuadItem } from '../../engine/graphics.ts';
import { STATE_LOADING, STATE_OFFLINE, STATE_ONLINE } from '../../engine/client.ts';
import { CTextCursor, TEXTFLAG_RENDER } from '../../engine/text.ts';
import { FLAG_PRESS, FLAG_TEXT, type CEvent } from '../../engine/input.ts';
import * as K from '../../engine/keys.ts';
import { OUTPUT_LEVEL_STANDARD } from '../../engine/console.ts';
import { CUIRect } from '../ui.ts';
import { CLineInput } from '../lineinput.ts';
import { CComponent } from '../component.ts';

const CONSOLE_CLOSED = 0, CONSOLE_OPENING = 1, CONSOLE_OPEN = 2, CONSOLE_CLOSING = 3;
export const CONSOLETYPE_LOCAL = 0, CONSOLETYPE_REMOTE = 1;
const RING = 64 * 1024;

interface CBacklogEntry { m_YOffset: number; m_Highlighted: boolean; m_aText: string }

class CInstance {
  m_Backlog: CBacklogEntry[] = [];
  m_History: string[] = [];
  m_pHistoryEntry = -1;
  m_Input = new CLineInput();
  m_pName: string;
  m_Type: number;
  m_BacklogActPage = 0;
  m_pGameConsole!: CGameConsole;
  m_aCompletionBuffer = '';
  m_CompletionChosen = -1;
  m_CompletionFlagmask: number;
  m_CompletionEnumerationCount = 0;
  m_CompletionRenderOffset = 0;
  m_IsCommand = false;
  m_aCommandName = '';
  m_aCommandHelp = '';
  m_aCommandParams = '';

  constructor(Type: number) {
    this.m_Type = Type;
    this.m_pName = Type === CONSOLETYPE_LOCAL ? 'local_console' : 'remote_console';
    this.m_CompletionFlagmask = Type === CONSOLETYPE_LOCAL ? CFGFLAG_CLIENT : CFGFLAG_SERVER;
  }
  Init(g: CGameConsole): void {
    this.m_pGameConsole = g;
    this.m_Input.Init(g.Input());
  }
  ClearBacklog(): void {
    this.m_Backlog = [];
    this.m_BacklogActPage = 0;
  }
  ClearHistory(): void {
    this.m_History = [];
    this.m_pHistoryEntry = -1;
  }
  Reset(): void { this.m_CompletionRenderOffset = 0; }
  GetString(): string { return this.m_Input.GetString(); }

  ExecuteLine(pLine: string): void {
    const Cl = this.m_pGameConsole.Client();
    if (this.m_Type === CONSOLETYPE_LOCAL) this.m_pGameConsole.Console().ExecuteLine(pLine);
    else if (Cl.RconAuthed()) Cl.Rcon(pLine);
    else Cl.RconAuth('', pLine);
  }

  OnInput(Event: CEvent): void {
    let Handled = false;
    const Cl = this.m_pGameConsole.Client(), Co = this.m_pGameConsole.Console();
    if (Event.m_Flags & FLAG_PRESS) {
      if (Event.m_Key === K.KEY_RETURN || Event.m_Key === K.KEY_KP_ENTER) {
        if (this.m_Input.GetString()) {
          if (this.m_Type === CONSOLETYPE_LOCAL || Cl.RconAuthed()) {
            this.m_History.push(this.m_Input.GetString());
            let size = this.m_History.reduce((n, e) => n + e.length + 1, 0);
            while (size > RING && this.m_History.length > 1) size -= this.m_History.shift()!.length + 1;
          }
          this.ExecuteLine(this.m_Input.GetString());
          this.m_Input.Clear();
          this.m_pHistoryEntry = -1;
        }
        Handled = true;
      } else if (Event.m_Key === K.KEY_UP) {
        if (this.m_pHistoryEntry >= 0) {
          if (this.m_pHistoryEntry > 0) this.m_pHistoryEntry--;
        } else this.m_pHistoryEntry = this.m_History.length - 1;
        if (this.m_pHistoryEntry >= 0) this.m_Input.Set(this.m_History[this.m_pHistoryEntry]);
        Handled = true;
      } else if (Event.m_Key === K.KEY_DOWN) {
        if (this.m_pHistoryEntry >= 0) this.m_pHistoryEntry = this.m_pHistoryEntry + 1 < this.m_History.length ? this.m_pHistoryEntry + 1 : -1;
        if (this.m_pHistoryEntry >= 0) this.m_Input.Set(this.m_History[this.m_pHistoryEntry]);
        else this.m_Input.Clear();
        Handled = true;
      } else if (Event.m_Key === K.KEY_TAB) {
        if (this.m_Type === CONSOLETYPE_LOCAL || Cl.RconAuthed()) {
          this.m_CompletionChosen++;
          const complete = (): void => {
            this.m_CompletionEnumerationCount = 0;
            Co.PossibleCommands(this.m_aCompletionBuffer, this.m_CompletionFlagmask, (s) => {
              if (this.m_CompletionChosen === this.m_CompletionEnumerationCount) this.m_Input.Set(s);
              this.m_CompletionEnumerationCount++;
            });
          };
          complete();
          if (this.m_CompletionEnumerationCount && this.m_CompletionChosen >= this.m_CompletionEnumerationCount) {
            this.m_CompletionChosen %= this.m_CompletionEnumerationCount;
            complete();
          }
        }
      } else if (Event.m_Key === K.KEY_PAGEUP) ++this.m_BacklogActPage;
      else if (Event.m_Key === K.KEY_PAGEDOWN) {
        --this.m_BacklogActPage;
        if (this.m_BacklogActPage < 0) this.m_BacklogActPage = 0;
      }
    }
    if (!Handled) this.m_Input.ProcessInput(Event);
    if (Event.m_Flags & (FLAG_PRESS | FLAG_TEXT)) {
      if (Event.m_Key !== K.KEY_TAB) {
        this.m_CompletionChosen = -1;
        this.m_aCompletionBuffer = this.m_Input.GetString().slice(0, 127);
      }
      const s = this.GetString();
      let i = 0;
      while (i < 63 && i < s.length && s[i] !== ' ') i++;
      const pCommand = Co.FindCommand(s.slice(0, i), this.m_CompletionFlagmask);
      if (pCommand && this.m_Type === CONSOLETYPE_LOCAL) {
        this.m_IsCommand = true;
        this.m_aCommandName = pCommand.m_pName;
        this.m_aCommandHelp = pCommand.m_pHelp;
        this.m_aCommandParams = pCommand.m_pParams;
      } else this.m_IsCommand = false;
    }
  }

  PrintLine(pLine: string, Highlighted: boolean): void {
    this.m_Backlog.push({ m_YOffset: -1, m_Highlighted: Highlighted, m_aText: pLine.slice(0, 255) });
    let size = this.m_Backlog.reduce((n, e) => n + e.m_aText.length + 12, 0);
    while (size > RING && this.m_Backlog.length > 1) size -= this.m_Backlog.shift()!.m_aText.length + 12;
  }
}

export class CGameConsole extends CComponent {
  private m_LocalConsole = new CInstance(CONSOLETYPE_LOCAL);
  private m_RemoteConsole = new CInstance(CONSOLETYPE_REMOTE);
  private m_ConsoleType = CONSOLETYPE_LOCAL;
  private m_ConsoleState = CONSOLE_CLOSED;
  private m_StateChangeEnd = 0;
  private m_StateChangeDuration = 0.1;
  private s_TimeStart: number | null = null;
  private MarkerOffset: number | null = null;

  private TimeNow(): number {
    const now = this.Client().time_get();
    if (this.s_TimeStart === null) this.s_TimeStart = now;
    return (now - this.s_TimeStart) / 1e6;
  }
  private CurrentConsole(): CInstance { return this.m_ConsoleType === CONSOLETYPE_REMOTE ? this.m_RemoteConsole : this.m_LocalConsole; }

  override OnReset(): void { this.m_RemoteConsole.Reset(); }

  override OnRender(): void {
    const Screen = this.UI().Screen(), G = this.Graphics(), T = this.TextRender(), Cl = this.Client();
    const ConsoleMaxHeight = (Screen.h * 3) / 5;
    let Progress = (this.TimeNow() - (this.m_StateChangeEnd - this.m_StateChangeDuration)) / this.m_StateChangeDuration;
    if (Progress >= 1) {
      if (this.m_ConsoleState === CONSOLE_CLOSING) this.m_ConsoleState = CONSOLE_CLOSED;
      else if (this.m_ConsoleState === CONSOLE_OPENING) this.m_ConsoleState = CONSOLE_OPEN;
      Progress = 1;
    }
    if (this.m_ConsoleState === CONSOLE_CLOSED) return;
    if (this.m_ConsoleState === CONSOLE_OPEN) this.Input().MouseModeAbsolute();
    const ScaleFunc = (t: number): number => Math.sin(Math.acos(1 - t));
    const ConsoleHeightScale = this.m_ConsoleState === CONSOLE_OPENING ? ScaleFunc(Progress) : this.m_ConsoleState === CONSOLE_CLOSING ? ScaleFunc(1 - Progress) : ScaleFunc(1);
    let ConsoleHeight = ConsoleHeightScale * ConsoleMaxHeight;
    G.MapScreen(Screen.x, Screen.y, Screen.w, Screen.h);
    const cv = (a0: number, a1: number, a2: number, a3: number) => [a0, a1, a2, a3].map((a, i) => ({ m_Index: i, m_R: 0, m_G: 0, m_B: 0, m_A: a }));
    G.TextureClear();
    G.QuadsBegin();
    G.SetColorVertex(cv(0.5, 0.5, 0, 0), 4);
    G.QuadsDrawTL([new CQuadItem(0, ConsoleHeight, Screen.w, 10)], 1);
    G.QuadsEnd();
    G.TextureSet(ImageTex(C.IMAGE_CONSOLE_BG));
    G.QuadsBegin();
    G.SetColor(0.2, 0.2, 0.2, 0.9);
    if (this.m_ConsoleType === CONSOLETYPE_REMOTE) G.SetColor(0.4, 0.2, 0.2, 0.9);
    G.QuadsSetSubset(0, -ConsoleHeight * 0.075, Screen.w * 0.075 * 0.5, 0);
    G.QuadsDrawTL([new CQuadItem(0, 0, Screen.w, ConsoleHeight)], 1);
    G.QuadsEnd();
    G.TextureClear();
    G.QuadsBegin();
    G.SetColorVertex(cv(0, 0, 0.25, 0.25), 4);
    G.QuadsDrawTL([new CQuadItem(0, ConsoleHeight - 20, Screen.w, 10)], 1);
    G.QuadsEnd();
    G.TextureSet(ImageTex(C.IMAGE_CONSOLE_BAR));
    G.QuadsBegin();
    G.SetColor(1, 1, 1, 0.9);
    G.QuadsSetSubset(0, 0.1, Screen.w * 0.015, 1 - 0.1);
    G.QuadsDrawTL([new CQuadItem(0, ConsoleHeight - 10, Screen.w, 10)], 1);
    G.QuadsEnd();
    ConsoleHeight -= 22;
    const pConsole = this.CurrentConsole();
    const FontSize = 10, RowHeight = FontSize * 1.25;
    let x = 3;
    let y = ConsoleHeight - RowHeight - 5;
    const Info = { m_Cursor: new CTextCursor(), m_WantedCompletion: pConsole.m_CompletionChosen, m_EnumCount: 0, m_Offset: pConsole.m_CompletionRenderOffset, m_Width: Screen.w, m_pCurrentCmd: pConsole.m_aCompletionBuffer };
    T.SetCursor(Info.m_Cursor, x + Info.m_Offset, y + RowHeight + 2, FontSize, TEXTFLAG_RENDER);
    const Cursor = new CTextCursor();
    T.SetCursor(Cursor, x, y, FontSize, TEXTFLAG_RENDER);
    let pPrompt = '> ';
    const connected = Cl.State() === STATE_ONLINE || Cl.State() === STATE_LOADING;
    if (this.m_ConsoleType === CONSOLETYPE_REMOTE) pPrompt = connected ? (Cl.RconAuthed() ? 'rcon> ' : 'ENTER PASSWORD> ') : 'NOT CONNECTED> ';
    T.TextEx(Cursor, pPrompt, -1);
    x = Cursor.m_X;
    let aInputString = pConsole.m_Input.GetString().slice(0, 255);
    if (this.m_ConsoleType === CONSOLETYPE_REMOTE && connected && !Cl.RconAuthed()) aInputString = '*'.repeat(aInputString.length);
    const co = pConsole.m_Input.GetCursorOffset();
    T.SetCursor(Cursor, x, y, FontSize, 0);
    Cursor.m_LineWidth = Screen.w - 10 - x;
    T.TextEx(Cursor, aInputString, co);
    T.TextEx(Cursor, aInputString.slice(co), -1);
    const Lines = Cursor.m_LineCount;
    y -= (Lines - 1) * FontSize;
    T.SetCursor(Cursor, x, y, FontSize, TEXTFLAG_RENDER);
    Cursor.m_LineWidth = Screen.w - 10 - x;
    T.TextEx(Cursor, aInputString, co);
    if (this.MarkerOffset === null) this.MarkerOffset = T.TextWidth(0, FontSize, '|', -1, -1) / 3;
    const Marker = Cursor.copy();
    Marker.m_X -= this.MarkerOffset;
    Marker.m_LineWidth = -1;
    T.TextEx(Marker, '|', -1);
    T.TextEx(Cursor, aInputString.slice(co), -1);
    if (this.m_ConsoleType === CONSOLETYPE_LOCAL || Cl.RconAuthed()) {
      if (pConsole.m_Input.GetString()) {
        this.Console().PossibleCommands(pConsole.m_aCompletionBuffer, pConsole.m_CompletionFlagmask, (pStr) => {
          const IC = Info.m_Cursor;
          if (Info.m_EnumCount === Info.m_WantedCompletion) {
            const tw = T.TextWidth(0, IC.m_FontSize, pStr, -1, -1);
            this.RenderTools().DrawRoundRect(new CUIRect(IC.m_X - 3, IC.m_Y, tw + 5, IC.m_FontSize + 4), v4(229 / 255, 185 / 255, 4 / 255, 0.85), IC.m_FontSize / 3);
            if (IC.m_X < 3) Info.m_Offset = 0;
            else if (IC.m_X + tw > Info.m_Width) Info.m_Offset -= Info.m_Width / 2;
            T.TextColor(0.05, 0.05, 0.05, 1);
            T.TextEx(IC, pStr, -1);
          } else {
            const m = str_find_nocase(pStr, Info.m_pCurrentCmd);
            if (m >= 0) {
              T.TextColor(0.5, 0.5, 0.5, 1);
              T.TextEx(IC, pStr, m);
              T.TextColor(229 / 255, 185 / 255, 4 / 255, 1);
              T.TextEx(IC, pStr.slice(m), Info.m_pCurrentCmd.length);
              T.TextColor(0.5, 0.5, 0.5, 1);
              T.TextEx(IC, pStr.slice(m + Info.m_pCurrentCmd.length), -1);
            } else {
              T.TextColor(0.75, 0.75, 0.75, 1);
              T.TextEx(IC, pStr, -1);
            }
          }
          Info.m_EnumCount++;
          IC.m_X += 7;
        });
        pConsole.m_CompletionRenderOffset = Info.m_Offset;
        if (Info.m_EnumCount <= 0 && pConsole.m_IsCommand) {
          T.TextEx(Info.m_Cursor, str_format(512, 'Help: %s ', pConsole.m_aCommandHelp), -1);
          T.TextColor(0.75, 0.75, 0.75, 1);
          T.TextEx(Info.m_Cursor, str_format(512, 'Syntax: %s %s', pConsole.m_aCommandName, pConsole.m_aCommandParams), -1);
        }
      }
    }
    T.TextColor(1, 1, 1, 1);
    const BL = pConsole.m_Backlog;
    let e = BL.length - 1;
    let OffsetY = 0;
    const LineOffset = 1;
    for (let Page = 0; Page <= pConsole.m_BacklogActPage; ++Page, OffsetY = 0) {
      while (e >= 0) {
        const pEntry = BL[e];
        if (pEntry.m_YOffset < 0) {
          T.SetCursor(Cursor, 0, 0, FontSize, 0);
          Cursor.m_LineWidth = Screen.w - 10;
          T.TextEx(Cursor, pEntry.m_aText, -1);
          pEntry.m_YOffset = Cursor.m_Y + Cursor.m_FontSize + LineOffset;
        }
        OffsetY += pEntry.m_YOffset;
        if (y - OffsetY <= RowHeight) break;
        if (Page === pConsole.m_BacklogActPage) {
          T.SetCursor(Cursor, 0, y - OffsetY, FontSize, TEXTFLAG_RENDER);
          Cursor.m_LineWidth = Screen.w - 10;
          if (pEntry.m_Highlighted) T.TextColor(1, 0.75, 0.75, 1);
          T.TextEx(Cursor, pEntry.m_aText, -1);
          T.TextColor(1, 1, 1, 1);
        }
        e--;
      }
      if (e < 0 && Page < pConsole.m_BacklogActPage) {
        pConsole.m_BacklogActPage = Page;
        let f = 0;
        while (OffsetY > 0 && f < BL.length) {
          T.SetCursor(Cursor, 0, y - OffsetY, FontSize, TEXTFLAG_RENDER);
          Cursor.m_LineWidth = Screen.w - 10;
          T.TextEx(Cursor, BL[f].m_aText, -1);
          OffsetY -= BL[f].m_YOffset;
          f++;
        }
        break;
      }
    }
    T.Text(0, 10, 0, FontSize, str_format(128, Localize('-Page %d-'), pConsole.m_BacklogActPage + 1), -1);
    const aBuf = 'v0.7.5';
    T.Text(0, Screen.w - T.TextWidth(0, FontSize, aBuf, -1, -1) - 10, 0, FontSize, aBuf, -1);
  }

  override OnInput(Event: CEvent): boolean {
    if (this.m_ConsoleState === CONSOLE_CLOSED) return false;
    if ((Event.m_Key >= K.KEY_F1 && Event.m_Key <= K.KEY_F12) || (Event.m_Key >= K.KEY_F13 && Event.m_Key <= K.KEY_F24)) return false;
    if (Event.m_Key === K.KEY_ESCAPE && Event.m_Flags & FLAG_PRESS) this.Toggle(this.m_ConsoleType);
    else this.CurrentConsole().OnInput(Event);
    return true;
  }

  Toggle(Type: number): void {
    if (this.m_ConsoleType !== Type && (this.m_ConsoleState === CONSOLE_OPEN || this.m_ConsoleState === CONSOLE_OPENING)) {
      // don't toggle console, just switch what console to use
    } else {
      if (this.m_ConsoleState === CONSOLE_CLOSED || this.m_ConsoleState === CONSOLE_OPEN) this.m_StateChangeEnd = this.TimeNow() + this.m_StateChangeDuration;
      else {
        const Progress = this.m_StateChangeEnd - this.TimeNow();
        this.m_StateChangeEnd = this.TimeNow() + (this.m_StateChangeDuration - Progress);
      }
      if (this.m_ConsoleState === CONSOLE_CLOSED || this.m_ConsoleState === CONSOLE_CLOSING) {
        this.Input().MouseModeAbsolute();
        this.m_pClient.m_pMenus.UseMouseButtons(false);
        this.m_ConsoleState = CONSOLE_OPENING;
        this.m_pClient.m_pControls.OnReset();
      } else {
        this.Input().MouseModeRelative();
        this.m_pClient.m_pMenus.UseMouseButtons(true);
        this.m_pClient.OnRelease();
        this.m_ConsoleState = CONSOLE_CLOSING;
      }
    }
    this.m_ConsoleType = Type;
  }

  IsConsoleActive(): boolean { return this.m_ConsoleState !== CONSOLE_CLOSED; }

  PrintLine(Type: number, pLine: string): void {
    if (Type === CONSOLETYPE_LOCAL) this.m_LocalConsole.PrintLine(pLine, false);
    else if (Type === CONSOLETYPE_REMOTE) this.m_RemoteConsole.PrintLine(pLine, false);
  }

  override OnConsoleInit(): void {
    this.m_LocalConsole.Init(this);
    this.m_RemoteConsole.Init(this);
    this.Console().RegisterPrintCallback((line, level) => {
      if (level <= this.Config().m_ConsoleOutputLevel) this.m_LocalConsole.PrintLine(line, false);
    });
    const Co = this.Console();
    Co.Register('toggle_local_console', '', CFGFLAG_CLIENT, () => this.Toggle(CONSOLETYPE_LOCAL), this, 'Toggle local console');
    Co.Register('toggle_remote_console', '', CFGFLAG_CLIENT, () => this.Toggle(CONSOLETYPE_REMOTE), this, 'Toggle remote console');
    Co.Register('clear_local_console', '', CFGFLAG_CLIENT, () => this.m_LocalConsole.ClearBacklog(), this, 'Clear local console');
    Co.Register('clear_remote_console', '', CFGFLAG_CLIENT, () => this.m_RemoteConsole.ClearBacklog(), this, 'Clear remote console');
    const dump = (t: number): void => Co.Print(OUTPUT_LEVEL_STANDARD, 'console', `Failed to open 'dumps/${t === CONSOLETYPE_LOCAL ? 'local' : 'remote'}_console_dump.txt'`);
    Co.Register('dump_local_console', '', CFGFLAG_CLIENT, () => dump(CONSOLETYPE_LOCAL), this, 'Write local console contents to a text file');
    Co.Register('dump_remote_console', '', CFGFLAG_CLIENT, () => dump(CONSOLETYPE_REMOTE), this, 'Write remote console contents to a text file');
  }

  override OnStateChange(NewState: number): void {
    if (NewState === STATE_OFFLINE) this.m_RemoteConsole.ClearHistory();
  }
}
