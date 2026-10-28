// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: game/client/components/chat.h, chat.cpp and game/commands.h of Teeworlds 0.7.5 in TypeScript.
import {
  vec2, clamp, mix, v4, str_comp, str_format, str_find_nocase, str_utf8_decode, str_utf8_is_whitespace, utf8Encode, Localize, ImageTex,
  type vec4,
} from './common.ts';
import * as C from '../../../generated/content.ts';
import * as P from '../../../generated/protocol.ts';
import { CFGFLAG_CLIENT } from '../../../generated/config.ts';
import { MAX_CLIENTS, MSGFLAG_VITAL } from '../../../engine/shared/protocol.ts';
import { TIME_FREQ } from '../../../engine/shared/network.ts';
import { CQuadItem } from '../../engine/graphics.ts';
import { STATE_CONNECTING, STATE_DEMOPLAYBACK, STATE_LOADING, STATE_OFFLINE, STATE_ONLINE } from '../../engine/client.ts';
import { CTextCursor, TEXTFLAG_RENDER, TEXTFLAG_STOP_AT_END } from '../../engine/text.ts';
import { FLAG_PRESS, FLAG_RELEASE, type CEvent } from '../../engine/input.ts';
import * as K from '../../engine/keys.ts';
import { OUTPUT_LEVEL_STANDARD, type CResult } from '../../engine/console.ts';
import { CUIRect, CORNER_ALL, CORNER_R } from '../ui.ts';
import { CLineInput } from '../lineinput.ts';
import { CComponent } from '../component.ts';
import type { CNetMsg } from '../gameclient.ts';
import { CHN_GUI } from './sounds.ts';

export const CHAT_CLIENT_MSG = -2, CHAT_SERVER_MSG = -1;
const MAX_LINES = 250, MAX_CHAT_PAGES = 10, MAX_LINE_LENGTH = 512;
const CHAT_SERVER = 0, CHAT_HIGHLIGHT = 1, CHAT_CLIENT = 2;

interface CLine {
  m_Time: number;
  m_Size: { x: number; y: number };
  m_ClientID: number;
  m_TargetID: number;
  m_Mode: number;
  m_NameColor: number;
  m_aName: string;
  m_aText: string;
  m_Highlighted: boolean;
}

type ComCallback = (r: CResult, ctx: { m_pCommand: string; m_pArgs: string }) => void;
interface CCommand { m_aName: string; m_aHelpText: string; m_aArgsFormat: string; m_pfnCallback: ComCallback; server: boolean }

const span = (s: string, set: string): number => {
  let i = 0;
  while (i < s.length && !set.includes(s[i])) i++;
  return i;
};
const skipWs = (s: string): string => s.replace(/^[ \t\n\r]+/, '');
const skipToWs = (s: string): string => {
  const i = s.search(/[ \t\n\r]/);
  return i < 0 ? '' : s.slice(i);
};

export class CChat extends CComponent {
  private m_Input = new CLineInput();
  private m_aLines: CLine[] = Array.from({ length: MAX_LINES }, () => ({ m_Time: 0, m_Size: { x: 0, y: -1 }, m_ClientID: 0, m_TargetID: 0, m_Mode: 0, m_NameColor: 0, m_aName: '', m_aText: '', m_Highlighted: false }));
  private m_CurrentLine = 0;
  private m_Mode = P.CHAT_NONE;
  private m_WhisperTarget = 0;
  private m_LastWhisperFrom = -1;
  private m_Show = false;
  private m_BacklogPage = 0;
  private m_InputUpdate = false;
  private m_ChatStringOffset = 0;
  private m_OldChatStringLength = 0;
  private m_CompletionChosen = -1;
  private m_CompletionFav = -1;
  private m_aCompletionBuffer = '';
  private m_PlaceholderOffset = 0;
  private m_PlaceholderLength = 0;
  private m_ReverseCompletion = false;
  private m_FirstMap = true;
  private m_CurrentLineWidth = -1;
  private m_ChatBufferMode = P.CHAT_NONE;
  private m_ChatBuffer = '';
  private m_History: { m_Mode: number; m_aText: string }[] = [];
  private m_pHistoryEntry = -1;
  private m_PendingChatCounter = 0;
  private m_LastChatSend = 0;
  private m_aLastSoundPlayed = [0, 0, 0];
  private m_IgnoreCommand = false;
  private m_SelectedCommand = 0;
  private m_CommandStart = 0;
  private m_aFilter: boolean[] = [];
  private m_FilteredCount = 0;
  private m_aCommands: CCommand[] = [];
  private MarkerOffset: number | null = null;
  private DotWidth: number | null = null;

  IsActive(): boolean { return this.m_Mode !== P.CHAT_NONE; }

  // ---------------------------------------------------------------- CCommandManager
  private GetCommand(n: string | number): CCommand | null {
    if (typeof n === 'number') return n >= 0 && n < this.m_aCommands.length ? this.m_aCommands[n] : null;
    return this.m_aCommands.find((c) => !str_comp(c.m_aName, n)) ?? null;
  }
  private AddCommand(pName: string, pHelp: string, pArgs: string, fn: ComCallback, server = false): number {
    if (this.GetCommand(pName)) return 1;
    if (!this.Console().ArgStringIsValid(pArgs)) return 1;
    this.m_aCommands.push({ m_aName: pName.slice(0, 15), m_aHelpText: pHelp.slice(0, 63), m_aArgsFormat: pArgs.slice(0, 63), m_pfnCallback: fn, server });
    return 0;
  }
  private RemoveCommand(pName: string): number {
    const i = this.m_aCommands.findIndex((c) => !str_comp(c.m_aName, pName));
    if (i < 0) return 1;
    this.m_aCommands.splice(i, 1);
    return 0;
  }
  private OnCommand(pCommand: string, pArgs: string): number {
    const pCom = this.GetCommand(pCommand);
    if (!pCom) return 1;
    const ctx = { m_pCommand: pCom.m_aName, m_pArgs: pArgs };
    return this.Console().ParseCommandArgs(pArgs, pCom.m_aArgsFormat, (r) => pCom.m_pfnCallback(r, ctx), ctx);
  }
  private Filter(pStr: string, Exact: boolean): number {
    this.m_aFilter = this.m_aCommands.map(() => false);
    if (!pStr) return 0;
    let Filtered = 0;
    for (let i = 0; i < this.m_aCommands.length; i++) {
      const f = Exact ? str_comp(this.m_aCommands[i].m_aName, pStr) !== 0 : str_find_nocase(this.m_aCommands[i].m_aName, pStr) !== 0;
      this.m_aFilter[i] = f;
      if (f) Filtered++;
    }
    return Filtered;
  }

  override OnReset(): void {
    const st = this.Client().State();
    if (st === STATE_OFFLINE || st === STATE_DEMOPLAYBACK) {
      for (const l of this.m_aLines) {
        l.m_Time = 0;
        l.m_Size.y = -1;
        l.m_aText = '';
        l.m_aName = '';
      }
      this.m_Mode = P.CHAT_NONE;
      this.m_LastWhisperFrom = -1;
      this.m_ReverseCompletion = false;
      this.m_Show = false;
      this.m_BacklogPage = 0;
      this.m_InputUpdate = false;
      this.m_ChatStringOffset = 0;
      this.m_CompletionChosen = -1;
      this.m_CompletionFav = -1;
      this.m_aCompletionBuffer = '';
      this.m_PlaceholderOffset = 0;
      this.m_PlaceholderLength = 0;
      this.m_pHistoryEntry = -1;
      this.m_PendingChatCounter = 0;
      this.m_LastChatSend = 0;
      this.m_IgnoreCommand = false;
      this.m_SelectedCommand = 0;
      this.m_CommandStart = 0;
      this.m_aFilter = new Array(8).fill(false);
      this.m_FilteredCount = 0;
      this.m_aLastSoundPlayed = [0, 0, 0];
    } else for (const l of this.m_aLines) l.m_Size.y = -1;
    this.m_CurrentLineWidth = -1;
    this.m_aCommands = [];
    this.AddCommand('all', 'Switch to all chat', '?r[message]', (r) => this.Com_Mode(r, P.CHAT_ALL));
    this.AddCommand('friend', 'Add player as friend', 's[name]', (r) => this.Com_Befriend(r));
    this.AddCommand('m', 'Mute a player', 's[name]', (r) => this.Com_Mute(r));
    this.AddCommand('mute', 'Mute a player', 's[name]', (r) => this.Com_Mute(r));
    this.AddCommand('r', 'Reply to a whisper', '?r[message]', (r) => this.Com_Reply(r));
    this.AddCommand('team', 'Switch to team chat', '?r[message]', (r) => this.Com_Mode(r, P.CHAT_TEAM));
    this.AddCommand('w', 'Whisper another player', 's[name]', (r) => this.Com_Whisper(r));
    this.AddCommand('whisper', 'Whisper another player', 's[name]', (r) => this.Com_Whisper(r));
  }

  override OnMapLoad(): void {
    if (this.Client().State() === STATE_LOADING) {
      if (this.m_FirstMap) this.m_FirstMap = false;
      else this.AddLine(str_format(256, Localize("Map changed to '%s'"), this.Client().CurrentMap()), CHAT_CLIENT_MSG, P.CHAT_ALL);
    }
  }

  override OnRelease(): void { this.m_Show = false; }

  override OnStateChange(_NewState: number, OldState: number): void {
    if (OldState <= STATE_CONNECTING) {
      this.m_Mode = P.CHAT_NONE;
      for (const l of this.m_aLines) l.m_Time = 0;
      this.m_CurrentLine = 0;
      this.ClearChatBuffer();
      this.m_FirstMap = true;
    }
  }

  override OnInit(): void { this.m_Input.Init(this.Input()); }

  override OnConsoleInit(): void {
    const Co = this.Console();
    Co.Register('say', 'r[text]', CFGFLAG_CLIENT, (r) => this.Say(P.CHAT_ALL, r.GetString(0)), this, 'Say in chat');
    Co.Register('say_team', 'r[text]', CFGFLAG_CLIENT, (r) => this.Say(P.CHAT_TEAM, r.GetString(0)), this, 'Say in team chat');
    Co.Register('say_self', 'r[text]', CFGFLAG_CLIENT, (r) => this.AddLine(r.GetString(0), CHAT_CLIENT_MSG), this, 'Say message just for yourself');
    Co.Register('whisper', 'i[target] r[text]', CFGFLAG_CLIENT, (r) => {
      const Target = r.GetInteger(0);
      if (Target < 0 || Target >= MAX_CLIENTS || !this.m_pClient.m_aClients[Target].m_Active || this.m_pClient.m_LocalClientID === Target)
        Co.Print(OUTPUT_LEVEL_STANDARD, 'console', 'please enter a valid ClientID');
      else {
        this.m_WhisperTarget = Target;
        this.Say(P.CHAT_WHISPER, r.GetString(1));
      }
    }, this, 'Whisper to a client in chat');
    Co.Register('chat', 's[text] ?i[whisper-target]', CFGFLAG_CLIENT, (r) => this.ConChat(r), this, 'Enable chat with all/team/whisper mode');
    Co.Register('+show_chat', '', CFGFLAG_CLIENT, (r) => { this.m_Show = r.GetInteger(0) !== 0; }, this, 'Show chat');
  }

  private ConChat(r: CResult): void {
    const pMode = r.GetString(0);
    const gc = this.m_pClient;
    if (str_comp(pMode, 'all') === 0) this.EnableMode(P.CHAT_ALL);
    else if (str_comp(pMode, 'team') === 0) this.EnableMode(P.CHAT_TEAM);
    else if (str_comp(pMode, 'whisper') === 0) {
      let Target = this.m_WhisperTarget;
      if (r.NumArguments() === 2) Target = r.GetInteger(1);
      else {
        for (let i = 0; i < MAX_CLIENTS; i++) {
          const ClientID = (Target + i) % MAX_CLIENTS;
          if (gc.m_aClients[ClientID].m_Active && gc.m_LocalClientID !== ClientID) {
            Target = ClientID;
            break;
          }
        }
      }
      if (Target < 0 || Target >= MAX_CLIENTS || !gc.m_aClients[Target].m_Active || gc.m_LocalClientID === Target) {
        if (r.NumArguments() === 2) this.Console().Print(OUTPUT_LEVEL_STANDARD, 'console', 'please enter a valid ClientID');
      } else {
        this.m_WhisperTarget = Target;
        this.EnableMode(P.CHAT_WHISPER);
      }
    } else this.Console().Print(OUTPUT_LEVEL_STANDARD, 'console', 'expected all, team or whisper as mode');
  }

  ClearChatBuffer(): void {
    this.m_ChatBuffer = '';
    this.m_ChatBufferMode = P.CHAT_NONE;
  }

  override OnInput(Event: CEvent): boolean {
    if (this.Client().State() !== STATE_ONLINE) return false;
    const gc = this.m_pClient;
    if (this.m_Show && Event.m_Flags & FLAG_PRESS && (Event.m_Key === K.KEY_PAGEUP || Event.m_Key === K.KEY_PAGEDOWN)) {
      if (Event.m_Key === K.KEY_PAGEUP) {
        ++this.m_BacklogPage;
        if (this.m_BacklogPage >= MAX_CHAT_PAGES) this.m_BacklogPage = MAX_CHAT_PAGES - 1;
      } else {
        --this.m_BacklogPage;
        if (this.m_BacklogPage < 0) this.m_BacklogPage = 0;
      }
      return this.m_Mode !== P.CHAT_NONE;
    }
    if (this.m_Mode === P.CHAT_NONE) return false;
    const activeCmds = (): number => this.m_aCommands.length - this.m_FilteredCount;
    if (Event.m_Flags & FLAG_PRESS && (Event.m_Key === K.KEY_ESCAPE || Event.m_Key === K.KEY_MOUSE_1 || Event.m_Key === K.KEY_MOUSE_2)) {
      if (this.IsTypingCommand() && activeCmds()) this.m_IgnoreCommand = true;
      else {
        this.m_Mode = P.CHAT_NONE;
        gc.OnRelease();
      }
    } else if (Event.m_Flags & FLAG_PRESS && (Event.m_Key === K.KEY_RETURN || Event.m_Key === K.KEY_KP_ENTER)) {
      let AddEntry = false;
      if (this.IsTypingCommand() && activeCmds()) {
        if (this.ExecuteCommand()) AddEntry = true;
      } else {
        if (this.m_Input.GetString()) {
          const now = this.Client().time_get();
          if (this.m_PendingChatCounter === 0 && this.m_LastChatSend + TIME_FREQ < now) {
            this.Say(this.m_Mode, this.m_Input.GetString());
            AddEntry = true;
          } else if (this.m_PendingChatCounter < 3) {
            ++this.m_PendingChatCounter;
            AddEntry = true;
          }
        }
        this.m_pHistoryEntry = -1;
        this.m_Mode = P.CHAT_NONE;
        gc.OnRelease();
      }
      if (AddEntry) {
        this.m_History.push({ m_Mode: this.m_Mode, m_aText: this.m_Input.GetString() });
        // the original's ring buffer holds 64 KiB of entries
        let size = this.m_History.reduce((n, e) => n + e.m_aText.length + 8, 0);
        while (size > 64 * 1024 && this.m_History.length > 1) size -= this.m_History.shift()!.m_aText.length + 8;
      }
    }
    if (Event.m_Flags & FLAG_PRESS && Event.m_Key === K.KEY_TAB) {
      if (this.IsTypingCommand() && this.CompleteCommand()) {
        // everything is handled within
      } else if (this.m_Mode === P.CHAT_WHISPER) {
        for (let i = 0; i < MAX_CLIENTS; i++) {
          const ClientID = this.Input().KeyIsPressed(K.KEY_LCTRL) || this.Input().KeyIsPressed(K.KEY_RCTRL)
            ? (this.m_WhisperTarget + MAX_CLIENTS - i) % MAX_CLIENTS : (this.m_WhisperTarget + i) % MAX_CLIENTS;
          if (gc.m_aClients[ClientID].m_Active && this.m_WhisperTarget !== ClientID && gc.m_LocalClientID !== ClientID) {
            this.m_WhisperTarget = ClientID;
            break;
          }
        }
      } else {
        const s = this.m_Input.GetString();
        if (this.m_CompletionChosen < 0) {
          let pCursor = this.m_Input.GetCursorOffset();
          for (let Count = 0; Count < this.m_Input.GetCursorOffset() && s[pCursor - 1] !== ' '; --pCursor, ++Count);
          this.m_PlaceholderOffset = pCursor;
          for (this.m_PlaceholderLength = 0; pCursor < s.length && s[pCursor] !== ' '; ++pCursor) ++this.m_PlaceholderLength;
          this.m_aCompletionBuffer = s.slice(this.m_PlaceholderOffset, this.m_PlaceholderOffset + this.m_PlaceholderLength).slice(0, 255);
        }
        let pCompletionString: string | null = null;
        if (this.m_CompletionChosen < 0 && this.m_CompletionFav >= 0) this.m_CompletionChosen = this.m_CompletionFav;
        else if (this.m_ReverseCompletion) this.m_CompletionChosen = (this.m_CompletionChosen - 1 + 2 * MAX_CLIENTS) % (2 * MAX_CLIENTS);
        else this.m_CompletionChosen = (this.m_CompletionChosen + 1) % (2 * MAX_CLIENTS);
        const startsNoCase = (a: string, b: string): boolean => a.toLowerCase().startsWith(b.toLowerCase());
        for (let i = 0; i < 2 * MAX_CLIENTS; ++i) {
          let SearchType: number, Index: number;
          if (this.m_ReverseCompletion) {
            SearchType = Math.trunc(((this.m_CompletionChosen - i + 2 * MAX_CLIENTS) % (2 * MAX_CLIENTS)) / MAX_CLIENTS);
            Index = (this.m_CompletionChosen - i + MAX_CLIENTS) % MAX_CLIENTS;
          } else {
            SearchType = Math.trunc(((this.m_CompletionChosen + i) % (2 * MAX_CLIENTS)) / MAX_CLIENTS);
            Index = (this.m_CompletionChosen + i) % MAX_CLIENTS;
          }
          if (Index < 0 || !gc.m_aClients[Index].m_Active) continue;
          const name = gc.m_aClients[Index].m_aName;
          let Found = false;
          if (SearchType === 1) {
            if (!startsNoCase(name, this.m_aCompletionBuffer) && str_find_nocase(name, this.m_aCompletionBuffer) >= 0) Found = true;
          } else if (startsNoCase(name, this.m_aCompletionBuffer)) Found = true;
          if (Found) {
            pCompletionString = name;
            this.m_CompletionChosen = Index + SearchType * MAX_CLIENTS;
            this.m_CompletionFav = this.m_CompletionChosen % MAX_CLIENTS;
            break;
          }
        }
        if (pCompletionString) {
          let aBuf = s.slice(0, this.m_PlaceholderOffset) + pCompletionString;
          let pSeparator = '';
          const after = s[this.m_PlaceholderOffset + this.m_PlaceholderLength];
          if (after !== ' ') pSeparator = this.m_PlaceholderOffset === 0 ? ': ' : ' ';
          else if (this.m_PlaceholderOffset === 0) pSeparator = ':';
          aBuf += pSeparator + s.slice(this.m_PlaceholderOffset + this.m_PlaceholderLength);
          aBuf = aBuf.slice(0, 255);
          this.m_PlaceholderLength = pSeparator.length + pCompletionString.length;
          this.m_OldChatStringLength = this.m_Input.GetLength();
          this.m_Input.Set(aBuf);
          this.m_Input.SetCursorOffset(this.m_PlaceholderOffset + this.m_PlaceholderLength);
          this.m_InputUpdate = true;
        }
      }
    } else {
      this.m_OldChatStringLength = this.m_Input.GetLength();
      if (this.m_Input.ProcessInput(Event)) {
        this.m_InputUpdate = true;
        this.m_CompletionChosen = -1;
      }
    }
    if (Event.m_Flags & FLAG_PRESS && Event.m_Key === K.KEY_LCTRL) this.m_ReverseCompletion = true;
    else if (Event.m_Flags & FLAG_RELEASE && Event.m_Key === K.KEY_LCTRL) this.m_ReverseCompletion = false;
    if (Event.m_Flags & FLAG_PRESS && Event.m_Key === K.KEY_UP) {
      if (this.IsTypingCommand()) {
        this.m_SelectedCommand = this.PreviousActiveCommand(this.m_SelectedCommand);
        if (this.m_SelectedCommand < 0) this.m_SelectedCommand = 0;
      } else {
        if (this.m_pHistoryEntry >= 0) {
          if (this.m_pHistoryEntry > 0) this.m_pHistoryEntry--;
        } else this.m_pHistoryEntry = this.m_History.length - 1;
        if (this.m_pHistoryEntry >= 0) this.m_Input.Set(this.m_History[this.m_pHistoryEntry].m_aText);
      }
    } else if (Event.m_Flags & FLAG_PRESS && Event.m_Key === K.KEY_DOWN) {
      if (this.IsTypingCommand()) {
        this.m_SelectedCommand = this.NextActiveCommand(this.m_SelectedCommand);
        if (this.m_SelectedCommand >= this.m_aCommands.length) this.m_SelectedCommand = this.m_aCommands.length - 1;
      } else {
        if (this.m_pHistoryEntry >= 0) this.m_pHistoryEntry = this.m_pHistoryEntry + 1 < this.m_History.length ? this.m_pHistoryEntry + 1 : -1;
        if (this.m_pHistoryEntry >= 0) this.m_Input.Set(this.m_History[this.m_pHistoryEntry].m_aText);
        else this.m_Input.Clear();
      }
    }
    if ((Event.m_Flags & FLAG_PRESS && (Event.m_Key === K.KEY_RETURN || Event.m_Key === K.KEY_KP_ENTER)) || !this.m_Input.GetLength()) this.ClearChatBuffer();
    else if (Event.m_Key !== K.KEY_MOUSE_1 && Event.m_Key !== K.KEY_MOUSE_2) {
      this.m_ChatBufferMode = this.m_Mode;
      this.m_ChatBuffer = this.m_Input.GetString().slice(0, MAX_LINE_LENGTH - 1);
    }
    return true;
  }

  EnableMode(Mode: number, pText: string | null = null): void {
    this.ClearInput();
    if (Mode === P.CHAT_WHISPER && this.Config().m_ClDisableWhisper) return;
    this.m_Mode = Mode;
    if (pText !== null) {
      this.m_Input.Set(pText);
      this.m_Input.SetCursorOffset(pText.length);
      this.m_InputUpdate = true;
    } else if (this.m_Mode === this.m_ChatBufferMode) {
      this.m_Input.Set(this.m_ChatBuffer);
      this.m_Input.SetCursorOffset(this.m_ChatBuffer.length);
      this.m_InputUpdate = true;
    }
  }

  private ClearInput(): void {
    this.m_Input.Clear();
    this.Input().Clear();
    this.m_CompletionChosen = -1;
    this.m_IgnoreCommand = false;
    this.m_SelectedCommand = 0;
  }

  override OnMessage(MsgType: number, pRawMsg: CNetMsg): void {
    if (MsgType === P.NETMSGTYPE_SV_CHAT) {
      const pMsg = pRawMsg as P.CNetMsg_Sv_Chat;
      if (pMsg.m_Mode === P.CHAT_WHISPER && this.Config().m_ClDisableWhisper) return;
      this.AddLine(pMsg.m_pMessage, pMsg.m_ClientID, pMsg.m_Mode, pMsg.m_TargetID);
    } else if (MsgType === P.NETMSGTYPE_SV_COMMANDINFO) {
      const pMsg = pRawMsg as P.CNetMsg_Sv_CommandInfo;
      this.AddCommand(pMsg.m_Name, pMsg.m_HelpText, pMsg.m_ArgsFormat, (_r, ctx) => {
        this.Client().SendPackMsg(P.NETMSGTYPE_CL_COMMAND, (p) => P.pack_CNetMsg_Cl_Command({ m_Name: ctx.m_pCommand, m_Arguments: ctx.m_pArgs }, p), MSGFLAG_VITAL);
        this.m_Mode = P.CHAT_NONE;
        this.m_pClient.OnRelease();
      }, true);
    } else if (MsgType === P.NETMSGTYPE_SV_COMMANDINFOREMOVE) {
      this.RemoveCommand((pRawMsg as P.CNetMsg_Sv_CommandInfoRemove).m_Name);
    }
  }

  AddLine(pLine: string, ClientID = CHAT_SERVER_MSG, Mode = P.CHAT_NONE, TargetID = -1): void {
    const gc = this.m_pClient, cfg = this.Config();
    const cl = gc.m_aClients;
    if (!pLine || (ClientID >= 0 && (!cfg.m_ClShowsocial || !cl[ClientID].m_Active || cl[ClientID].m_ChatIgnore || cfg.m_ClFilterchat === 2 ||
      (gc.m_LocalClientID !== ClientID && cfg.m_ClFilterchat === 1 && !cl[ClientID].m_Friend))))
      return;
    if (Mode === P.CHAT_WHISPER) {
      if (ClientID < 0 || !cl[ClientID].m_Active || TargetID < 0 || !cl[TargetID].m_Active) return;
      if (ClientID !== gc.m_LocalClientID && TargetID !== gc.m_LocalClientID) return;
      if (cl[TargetID].m_ChatIgnore || cfg.m_ClFilterchat === 2 || (gc.m_LocalClientID !== TargetID && cfg.m_ClFilterchat === 1 && !cl[TargetID].m_Friend)) return;
    }
    // trim right and set maximum length to 128 utf8-characters
    {
      let Length = 0;
      const p = { i: 0 };
      let pEnd = -1;
      while (p.i < pLine.length) {
        const old = p.i;
        const Code = str_utf8_decode(pLine, p);
        if (!str_utf8_is_whitespace(Code)) pEnd = -1;
        else if (pEnd === -1) pEnd = old;
        if (++Length >= 127) {
          pLine = pLine.slice(0, p.i);
          break;
        }
      }
      if (pEnd !== -1) pLine = pLine.slice(0, pEnd);
    }
    let Highlighted = false;
    const segs = pLine.split('\n');
    if (segs[segs.length - 1] === '') segs.pop();
    for (const part of segs) {
      this.m_CurrentLine = (this.m_CurrentLine + 1) % MAX_LINES;
      const L = this.m_aLines[this.m_CurrentLine];
      L.m_Time = this.Client().time_get();
      L.m_Size.y = -1;
      L.m_ClientID = ClientID;
      L.m_TargetID = TargetID;
      L.m_Mode = Mode;
      L.m_NameColor = -2;
      Highlighted = false;
      if (Mode !== P.CHAT_WHISPER && ClientID >= 0 && ClientID !== gc.m_LocalClientID && gc.m_LocalClientID >= 0) {
        const me = cl[gc.m_LocalClientID].m_aName;
        const hl = str_find_nocase(part, me);
        if (hl >= 0) {
          const n = me.length;
          if (hl === 0 || part[hl - 1] === ' ') {
            const a = part[hl + n];
            if (a === undefined || a === ' ') Highlighted = true;
            if (a === ':' && (part[hl + n + 1] === undefined || part[hl + n + 1] === ' ')) Highlighted = true;
          }
          this.m_CompletionFav = ClientID;
        }
      }
      L.m_Highlighted = Highlighted;
      let NameCID = ClientID;
      if (Mode === P.CHAT_WHISPER && ClientID === gc.m_LocalClientID && TargetID >= 0) NameCID = TargetID;
      if (ClientID === CHAT_SERVER_MSG) {
        L.m_aName = '';
        L.m_aText = ('*** ' + part).slice(0, MAX_LINE_LENGTH - 1);
      } else if (ClientID === CHAT_CLIENT_MSG) {
        L.m_aName = '';
        L.m_aText = (utf8Encode('— ') + part).slice(0, MAX_LINE_LENGTH - 1);
      } else {
        if (cl[ClientID].m_Team === P.TEAM_SPECTATORS) L.m_NameColor = P.TEAM_SPECTATORS;
        if (gc.m_GameInfo.m_GameFlags & P.GAMEFLAG_TEAMS) {
          if (cl[ClientID].m_Team === P.TEAM_RED) L.m_NameColor = P.TEAM_RED;
          else if (cl[ClientID].m_Team === P.TEAM_BLUE) L.m_NameColor = P.TEAM_BLUE;
        }
        L.m_aName = cl[NameCID].m_aName;
        L.m_aText = part.slice(0, MAX_LINE_LENGTH - 1);
      }
      const aBufMode = Mode === P.CHAT_WHISPER ? 'whisper' : Mode === P.CHAT_TEAM ? 'teamchat' : 'chat';
      this.Console().Print(OUTPUT_LEVEL_STANDARD, aBufMode, str_format(1024, '%2d: %s: %s', NameCID, L.m_aName, L.m_aText));
      this.onLine?.(L.m_aName, L.m_aText, ClientID, Mode);
    }
    if (Mode === P.CHAT_WHISPER && gc.m_LocalClientID !== ClientID) this.m_LastWhisperFrom = ClientID;
    const Now = this.Client().time_get();
    const snd = (k: number, s: number): void => {
      if (Now - this.m_aLastSoundPlayed[k] >= (TIME_FREQ * 3) / 10) {
        gc.m_pSounds.Play(CHN_GUI, s, 0);
        this.m_aLastSoundPlayed[k] = Now;
      }
    };
    if (ClientID < 0) snd(CHAT_SERVER, P.SOUND_CHAT_SERVER);
    else if (Highlighted || Mode === P.CHAT_WHISPER) snd(CHAT_HIGHLIGHT, P.SOUND_CHAT_HIGHLIGHT);
    else snd(CHAT_CLIENT, P.SOUND_CHAT_CLIENT);
  }

  /** every chat line as it is added (name, text, client id, mode): the e2e test hook */
  onLine: ((name: string, text: string, ClientID: number, Mode: number) => void) | null = null;

  GetCommandName(Mode: number): string {
    switch (Mode) {
      case P.CHAT_ALL: return 'chat all';
      case P.CHAT_WHISPER: return 'chat whisper';
      case P.CHAT_TEAM: return 'chat team';
      default: return '';
    }
  }

  override OnRender(): void {
    const Cl = this.Client(), gc = this.m_pClient, G = this.Graphics(), T = this.TextRender(), RT = this.RenderTools();
    if (Cl.State() < STATE_ONLINE) return;
    if (this.m_PendingChatCounter > 0 && this.m_LastChatSend + TIME_FREQ < Cl.time_get()) {
      const idx = this.m_History.length - this.m_PendingChatCounter;
      if (idx >= 0) this.Say(this.m_History[idx].m_Mode, this.m_History[idx].m_aText);
      --this.m_PendingChatCounter;
    }
    const Height = 300, Width = Height * G.ScreenAspect();
    G.MapScreen(0, 0, Width, Height);
    const x = 12;
    let y = Height - 20;
    let LineWidth = 200;
    let CategoryWidth = 0;
    if (this.m_Mode === P.CHAT_WHISPER && !gc.m_aClients[this.m_WhisperTarget].m_Active) this.m_Mode = P.CHAT_NONE;
    else if (this.m_Mode !== P.CHAT_NONE || this.m_ChatBufferMode !== P.CHAT_NONE) {
      let ChatMode = this.m_Mode, Blend = 1;
      if (this.m_Mode === P.CHAT_NONE) {
        ChatMode = this.m_ChatBufferMode;
        Blend = 0.5;
      }
      const IconOffsetX = ChatMode === P.CHAT_WHISPER ? 6 : 0;
      const CategoryFontSize = 8, InputFontSize = 8;
      let aCatText: string;
      let CategoryHeight: number;
      {
        const Cursor = new CTextCursor();
        T.SetCursor(Cursor, x, y, CategoryFontSize, 0);
        if (ChatMode === P.CHAT_ALL) aCatText = Localize('All');
        else if (ChatMode === P.CHAT_TEAM) aCatText = gc.m_LocalClientID >= 0 && gc.m_aClients[gc.m_LocalClientID].m_Team === P.TEAM_SPECTATORS ? Localize('Spectators') : Localize('Team');
        else if (ChatMode === P.CHAT_WHISPER) {
          CategoryWidth += RT.GetClientIdRectSize(CategoryFontSize);
          aCatText = gc.m_aClients[this.m_WhisperTarget].m_aName;
        } else aCatText = Localize('Chat');
        T.TextEx(Cursor, aCatText, -1);
        CategoryWidth += Cursor.m_X - Cursor.m_StartX;
        CategoryHeight = Cursor.m_FontSize;
      }
      let CatRectColor = v4(1, 1, 1, 0.25 * Blend);
      if (ChatMode === P.CHAT_TEAM) CatRectColor = v4(0.4, 1, 0.4, 0.4 * Blend);
      else if (ChatMode === P.CHAT_WHISPER) CatRectColor = v4(0, 0.5, 1, 0.5 * Blend);
      const CatRect = new CUIRect(0, y, CategoryWidth + x + 2 + IconOffsetX, CategoryHeight + 4);
      RT.DrawUIRect(CatRect, CatRectColor, CORNER_R, 2);
      G.WrapClamp();
      let QuadIcon: CQuadItem;
      if (ChatMode === P.CHAT_WHISPER) {
        G.TextureSet(ImageTex(C.IMAGE_CHATWHISPER));
        G.QuadsBegin();
        G.QuadsSetSubset(1, 0, 0, 1);
        QuadIcon = new CQuadItem(1.5, y + (CatRect.h - 8) * 0.5, 16, 8);
      } else {
        G.TextureSet(ImageTex(C.IMAGE_EMOTICONS));
        G.QuadsBegin();
        RT.SelectSprite(C.SPRITE_DOTDOT);
        QuadIcon = new CQuadItem(1, y, 10, 10);
      }
      G.SetColor(1, 1, 1, Blend);
      G.QuadsDrawTL([QuadIcon], 1);
      G.QuadsEnd();
      G.WrapNormal();
      const Cursor = new CTextCursor();
      T.SetCursor(Cursor, x + IconOffsetX, y, CategoryFontSize, TEXTFLAG_RENDER);
      Cursor.m_LineWidth = Width - 190;
      Cursor.m_MaxLines = 2;
      T.TextColor(1, 1, 1, Blend);
      if (ChatMode === P.CHAT_WHISPER) RT.DrawClientID(T, Cursor, this.m_WhisperTarget);
      T.TextEx(Cursor, aCatText, -1);
      Cursor.m_X += 4;
      Cursor.m_Y -= (InputFontSize - CategoryFontSize) * 0.5;
      Cursor.m_StartX = Cursor.m_X;
      Cursor.m_FontSize = InputFontSize;
      const s = this.m_Input.GetString(), co = this.m_Input.GetCursorOffset();
      if (this.m_InputUpdate) {
        if (this.m_ChatStringOffset > 0 && this.m_Input.GetLength() < this.m_OldChatStringLength)
          this.m_ChatStringOffset = Math.max(0, this.m_ChatStringOffset - (this.m_OldChatStringLength - this.m_Input.GetLength()));
        if (this.m_ChatStringOffset > co) this.m_ChatStringOffset -= this.m_ChatStringOffset - co;
        else {
          const measure = (): number => {
            const Temp = Cursor.copy();
            Temp.m_Flags = 0;
            T.TextEx(Temp, s.slice(this.m_ChatStringOffset), co - this.m_ChatStringOffset);
            T.TextEx(Temp, '|', -1);
            return Temp.m_LineCount;
          };
          while (measure() > 2 && this.m_ChatStringOffset < co) ++this.m_ChatStringOffset;
        }
        this.m_InputUpdate = false;
      }
      if (this.m_Mode === P.CHAT_NONE) {
        const WidthLimit = LineWidth + x + 3 - Cursor.m_X;
        const TextWidth = T.TextWidth(0, Cursor.m_FontSize, s, -1, -1);
        T.TextColor(1, 1, 1, Blend);
        if (TextWidth > WidthLimit) {
          if (this.DotWidth === null) this.DotWidth = T.TextWidth(0, Cursor.m_FontSize, '...', -1, -1);
          Cursor.m_Flags |= TEXTFLAG_STOP_AT_END;
          Cursor.m_LineWidth = WidthLimit - this.DotWidth;
          T.TextEx(Cursor, s, -1);
          Cursor.m_LineWidth = LineWidth;
          T.TextEx(Cursor, '...', -1);
        } else T.TextEx(Cursor, s, -1);
        const InfoCursor = new CTextCursor();
        T.SetCursor(InfoCursor, 2, y + 12, CategoryFontSize * 0.75, TEXTFLAG_RENDER);
        const k = gc.m_pBinds.GetKeyID(this.GetCommandName(this.m_ChatBufferMode));
        if (k.KeyID < K.KEY_LAST) {
          const aKeyName = gc.m_pBinds.GetKey(this.GetCommandName(this.m_ChatBufferMode), k.KeyID, k.Modifier);
          T.TextEx(InfoCursor, str_format(128, Localize('Press %s to resume chatting'), aKeyName), -1);
        }
      } else {
        T.TextEx(Cursor, s.slice(this.m_ChatStringOffset), co - this.m_ChatStringOffset);
        if (this.MarkerOffset === null) this.MarkerOffset = T.TextWidth(0, 8, '|', -1, -1) / 3;
        const Marker = Cursor.copy();
        Marker.m_X -= this.MarkerOffset;
        T.TextEx(Marker, '|', -1);
        T.TextEx(Cursor, s.slice(co), -1);
        if (this.IsTypingCommand() && this.m_aCommands.length - this.m_FilteredCount && this.m_SelectedCommand >= 0) {
          const pCommand = this.GetCommand(this.m_SelectedCommand);
          if (pCommand && pCommand.m_aName.length + 1 > s.length) {
            T.TextColor(1, 1, 1, 0.5);
            T.TextEx(Cursor, pCommand.m_aName.slice(s.length - 1), -1);
          }
        }
        if (ChatMode === P.CHAT_WHISPER) {
          const InfoCursor = new CTextCursor();
          T.SetCursor(InfoCursor, 2, y + 12, CategoryFontSize * 0.75, TEXTFLAG_RENDER);
          T.TextColor(1, 1, 1, 0.5);
          T.TextEx(InfoCursor, Localize("Press Tab to cycle chat recipients. Whispers aren't encrypted and might be logged by the server."), -1);
        }
      }
    }
    y -= 8;
    this.m_Show ||= this.m_Mode !== P.CHAT_NONE;
    const Now = Cl.time_get();
    const IsScoreboardActive = gc.m_pScoreboard.IsActive();
    const ScoreboardRect = gc.m_pScoreboard.GetScoreboardRect();
    const SS = this.UI().Screen();
    const SRF = new CUIRect((ScoreboardRect.x / SS.w) * Width, (ScoreboardRect.y / SS.h) * Height, (ScoreboardRect.w / SS.w) * Width, (ScoreboardRect.h / SS.h) * Height);
    let HeightLimit = this.m_Show ? 90 : 200;
    if (IsScoreboardActive) {
      const ReducedLineWidth = Math.min(SRF.x - 5 - x, LineWidth);
      const ReducedHeightLimit = Math.max(SRF.y + SRF.h + 5, HeightLimit);
      const Area1 = ReducedLineWidth * ((Height - HeightLimit) * 0.5);
      const Area2 = LineWidth * ((Height - ReducedHeightLimit) * 0.5);
      if (Area1 >= Area2) LineWidth = ReducedLineWidth;
      else HeightLimit = ReducedHeightLimit;
    }
    if (this.m_CurrentLineWidth !== LineWidth) {
      for (const l of this.m_aLines) l.m_Size.y = -1;
      this.m_CurrentLineWidth = LineWidth;
    }
    const Begin = x, FontSize = 6;
    const Cursor = new CTextCursor();
    for (let i = 0; i < MAX_LINES; i++) {
      const L = this.m_aLines[(this.m_CurrentLine - i + MAX_LINES) % MAX_LINES];
      if (!L.m_aText) break;
      if (L.m_Size.y < 0) {
        T.SetCursor(Cursor, Begin, 0, FontSize, 0);
        Cursor.m_LineWidth = LineWidth;
        let aBuf = '';
        if (L.m_Mode === P.CHAT_WHISPER) Cursor.m_X += 12.5;
        if (L.m_ClientID >= 0) {
          Cursor.m_X += RT.GetClientIdRectSize(Cursor.m_FontSize);
          aBuf = L.m_aName + ': ';
        }
        aBuf = (aBuf + L.m_aText).slice(0, 767);
        T.TextEx(Cursor, aBuf, -1);
        L.m_Size.y = Cursor.m_LineCount * Cursor.m_FontSize;
        L.m_Size.x = Cursor.m_LineCount === 1 ? Cursor.m_X - Cursor.m_StartX : LineWidth;
      }
    }
    if (this.m_Show) {
      const Rect = new CUIRect(0, HeightLimit - 2, LineWidth + x + 3, Height - HeightLimit - 22);
      RT.DrawUIRect4(Rect, v4(0, 0, 0, 0.85), v4(0, 0, 0, 0.05), v4(0, 0, 0, 0.85), v4(0, 0, 0, 0.05), CORNER_R, 3);
    }
    let StartLine = 0;
    if (this.m_Show) {
      let Page: number;
      let l = 0;
      for (Page = 0; Page < MAX_CHAT_PAGES; Page++) {
        let PageY = Math.trunc(y);
        let endReached = false;
        for (; l < MAX_LINES; l++) {
          const L = this.m_aLines[(this.m_CurrentLine - l + MAX_LINES) % MAX_LINES];
          if (!L.m_aText) {
            endReached = true;
            break;
          }
          if (L.m_ClientID >= 0 && gc.m_aClients[L.m_ClientID].m_ChatIgnore) continue;
          if (PageY < HeightLimit) break;
          PageY = Math.trunc(PageY - L.m_Size.y);
        }
        if (endReached) break;
        if (Page < this.m_BacklogPage) StartLine = l - 1;
      }
      if (Page === MAX_CHAT_PAGES) Page--;
      if (Page < this.m_BacklogPage) this.m_BacklogPage = Page;
      if (Page > 0) {
        T.TextColor(1, 1, 1, 0.6);
        T.Text(0, 6, HeightLimit - 3, FontSize - 1, str_format(128, Localize('-Page %d/%d-'), this.m_BacklogPage + 1, Page + 1), -1);
        T.TextColor(1, 1, 1, 1);
      }
    }
    for (let i = StartLine; i < MAX_LINES; i++) {
      const L = this.m_aLines[(this.m_CurrentLine - i + MAX_LINES) % MAX_LINES];
      if (!L.m_aText) break;
      if (L.m_ClientID >= 0 && gc.m_aClients[L.m_ClientID].m_ChatIgnore) continue;
      if (Now > L.m_Time + 16 * TIME_FREQ && !this.m_Show) break;
      y -= L.m_Size.y;
      if (y < HeightLimit) break;
      const Blend = Now > L.m_Time + 14 * TIME_FREQ && !this.m_Show ? 1 - (Now - L.m_Time - 14 * TIME_FREQ) / (2 * TIME_FREQ) : 1;
      const Delta = (Now - L.m_Time) / TIME_FREQ;
      const HighlightBlend = 1 - clamp(Delta - 1, 0, 1) / 1;
      T.SetCursor(Cursor, Begin, y, FontSize, TEXTFLAG_RENDER);
      Cursor.m_LineWidth = LineWidth;
      const ShadowOffset = new vec2(0.8, 1.5);
      const ShadowWhisper = v4(0.09, 0, 0.26, Blend * 0.9);
      const ShadowColor = L.m_Mode === P.CHAT_WHISPER ? ShadowWhisper : v4(0, 0, 0, Blend * 0.9);
      const ColorSystem = v4(1, 1, 0.5, Blend), ColorWhisper = v4(0.4, 1, 1, Blend), ColorRed = v4(1, 0.5, 0.5, Blend), ColorBlue = v4(0.7, 0.7, 1, Blend);
      const ColorSpec = v4(0.75, 0.5, 0.75, Blend), ColorAllPre = v4(0.8, 0.8, 0.8, Blend), ColorAllText = v4(1, 1, 1, Blend);
      const ColorTeamPre = v4(0.45, 0.9, 0.45, Blend), ColorTeamText = v4(0.6, 1, 0.6, Blend);
      const ColorHighlightBg = v4(0, 0.27, 0.9, 0.5 * HighlightBlend);
      const ColorHighlightOutline = v4(0, 0.4, 1, mix(L.m_Mode === P.CHAT_TEAM ? 0.6 : 0.5, 1, HighlightBlend));
      let TextColor: vec4;
      if (L.m_Highlighted && ColorHighlightBg.a > 0.001) {
        const BgRect = new CUIRect(Cursor.m_X, Cursor.m_Y + 2, L.m_Size.x - 2, L.m_Size.y);
        const a = ColorHighlightBg.a;
        const LeftColor = v4(ColorHighlightBg.r * a, ColorHighlightBg.g * a, ColorHighlightBg.b * a, a);
        const RightColor = v4(ColorHighlightBg.r * 0.1, ColorHighlightBg.g * 0.1, ColorHighlightBg.b * 0.1, a * 0.1);
        RT.DrawUIRect4(BgRect, LeftColor, RightColor, LeftColor, RightColor, CORNER_R, 2);
      }
      if (L.m_Mode === P.CHAT_WHISPER) {
        const LineBaseY = T.TextGetLineBaseY(Cursor);
        const qw = 10, qh = 5, qx = Cursor.m_X + 2, qy = LineBaseY - qh - 0.5;
        G.TextureSet(ImageTex(C.IMAGE_CHATWHISPER));
        G.WrapClamp();
        G.QuadsBegin();
        if (L.m_ClientID === gc.m_LocalClientID && L.m_TargetID >= 0) G.QuadsSetSubset(1, 0, 0, 1);
        else G.QuadsSetSubset(0, 0, 1, 1);
        G.SetColor(ShadowWhisper.r * ShadowWhisper.a * Blend, ShadowWhisper.g * ShadowWhisper.a * Blend, ShadowWhisper.b * ShadowWhisper.a * Blend, ShadowWhisper.a * Blend);
        G.QuadsDrawTL([new CQuadItem(qx + 0.2, qy + 0.5, qw, qh)], 1);
        G.SetColor(ColorWhisper.r * Blend, ColorWhisper.g * Blend, ColorWhisper.b * Blend, Blend);
        G.QuadsDrawTL([new CQuadItem(qx, qy, qw, qh)], 1);
        G.QuadsEnd();
        G.WrapNormal();
        Cursor.m_X += 12.5;
      }
      if (L.m_ClientID < 0) TextColor = ColorSystem;
      else if (L.m_Mode === P.CHAT_WHISPER) TextColor = ColorWhisper;
      else if (L.m_Mode === P.CHAT_TEAM) TextColor = ColorTeamPre;
      else if (L.m_NameColor === P.TEAM_RED) TextColor = ColorRed;
      else if (L.m_NameColor === P.TEAM_BLUE) TextColor = ColorBlue;
      else if (L.m_NameColor === P.TEAM_SPECTATORS) TextColor = ColorSpec;
      else TextColor = ColorAllPre;
      if (L.m_ClientID >= 0) {
        let NameCID = L.m_ClientID;
        if (L.m_Mode === P.CHAT_WHISPER && L.m_ClientID === gc.m_LocalClientID && L.m_TargetID >= 0) NameCID = L.m_TargetID;
        RT.DrawClientID(T, Cursor, NameCID, v4(TextColor.r, TextColor.g, TextColor.b, 0.5 * Blend), v4(0.1 * Blend, 0.1 * Blend, 0.1 * Blend, Blend));
        T.TextShadowed(Cursor, (L.m_aName + ': ').slice(0, 47), -1, ShadowOffset, ShadowColor, TextColor);
      }
      if (L.m_ClientID < 0) TextColor = ColorSystem;
      else if (L.m_Mode === P.CHAT_WHISPER) TextColor = ColorWhisper;
      else if (L.m_Mode === P.CHAT_TEAM) TextColor = ColorTeamText;
      else TextColor = ColorAllText;
      if (L.m_Highlighted) {
        T.TextColor(TextColor);
        T.TextOutlineColor(ColorHighlightOutline);
        T.TextEx(Cursor, L.m_aText, -1);
      } else T.TextShadowed(Cursor, L.m_aText, -1, ShadowOffset, ShadowColor, TextColor);
    }
    T.TextColor(1, 1, 1, 1);
    T.TextOutlineColor(0, 0, 0, 0.3);
    this.HandleCommands(x + CategoryWidth, Height - 24, 200 - CategoryWidth);
  }

  Say(Mode: number, pLine: string): void {
    this.m_LastChatSend = this.Client().time_get();
    this.m_pClient.SendMsg(P.NETMSGTYPE_CL_SAY, P.pack_CNetMsg_Cl_Say, { m_Mode: Mode, m_Target: Mode === P.CHAT_WHISPER ? this.m_WhisperTarget : -1, m_pMessage: pLine }, MSGFLAG_VITAL);
  }

  private IsTypingCommand(): boolean { return this.m_Input.GetString()[0] === '/' && !this.m_IgnoreCommand; }

  private HandleCommands(x: number, y: number, w: number): void {
    if (this.m_Mode === P.CHAT_NONE || !this.IsTypingCommand()) return;
    const RT = this.RenderTools(), T = this.TextRender();
    const Alpha = 0.9, ScrollBarW = 6, LineHeight = 8;
    let LineWidth = w;
    this.FilterChatCommands(this.m_Input.GetString());
    const ActiveCount = this.m_aCommands.length - this.m_FilteredCount;
    const DisplayCount = Math.min(ActiveCount, 16);
    if (DisplayCount && this.m_aFilter[this.m_SelectedCommand]) this.m_SelectedCommand = this.NextActiveCommand(-1);
    if (DisplayCount && this.m_aFilter[this.m_CommandStart]) this.m_CommandStart = this.NextActiveCommand(this.m_CommandStart);
    if (DisplayCount <= 0) return;
    const Rect = new CUIRect(x, y - (DisplayCount + 1) * LineHeight, LineWidth, (DisplayCount + 1) * LineHeight);
    RT.DrawUIRect(Rect, v4(0.125, 0.125, 0.125, Alpha), CORNER_ALL, 3);
    let End = this.m_CommandStart;
    for (let i = 0; i < DisplayCount - 1; i++) End = this.NextActiveCommand(End);
    if (End >= this.m_aCommands.length) for (let i = End - this.m_aCommands.length; i >= 0; i--) this.m_CommandStart = this.PreviousActiveCommand(this.m_CommandStart);
    while (this.m_SelectedCommand < this.m_CommandStart) this.m_CommandStart = this.PreviousActiveCommand(this.m_CommandStart);
    while (this.m_SelectedCommand > End) {
      this.m_CommandStart = this.NextActiveCommand(this.m_CommandStart);
      End = this.NextActiveCommand(End);
    }
    if (ActiveCount > DisplayCount) {
      LineWidth -= ScrollBarW;
      const SR = new CUIRect(x + LineWidth, y - (DisplayCount + 1) * LineHeight, ScrollBarW, (DisplayCount + 1) * LineHeight);
      RT.DrawUIRect(SR, v4(0.125, 0.125, 0.125, Alpha), CORNER_R, 3);
      const h = SR.h;
      SR.h *= DisplayCount / ActiveCount;
      SR.y += (h * this.GetActiveCountRange(this.GetFirstActiveCommand(), this.m_CommandStart)) / ActiveCount;
      RT.DrawUIRect(SR, v4(0.5, 0.5, 0.5, Alpha), CORNER_R, 3);
    }
    y -= (DisplayCount + 2) * LineHeight;
    for (let i = this.m_CommandStart, j = 0; j < DisplayCount && i < this.m_aCommands.length; i++) {
      if (this.m_aFilter[i]) continue;
      const pCommand = this.m_aCommands[i];
      j++;
      y += LineHeight;
      const HighlightRect = new CUIRect(Rect.x, y, LineWidth, LineHeight - 1);
      if (pCommand.server) RT.DrawUIRect(HighlightRect, v4(0, 0.6, 0.6, 0.2), CORNER_ALL, 0);
      if (i === this.m_SelectedCommand) RT.DrawUIRect(HighlightRect, v4(0.25, 0.25, 0.6, Alpha), CORNER_ALL, 2);
      const Cursor = new CTextCursor();
      T.SetCursor(Cursor, Rect.x + 5, y, 5, TEXTFLAG_RENDER);
      Cursor.m_LineWidth = LineWidth;
      Cursor.m_MaxLines = 1;
      T.TextColor(1, 1, 1, 1);
      T.TextEx(Cursor, pCommand.m_aName, -1);
      T.TextEx(Cursor, ' ', -1);
      T.TextColor(0, 0.5, 0.5, 1);
      let c = pCommand.m_aArgsFormat;
      while (c.length) {
        let Optional = false;
        if (c[0] === '?') {
          Optional = true;
          c = c.slice(1);
        }
        let pDesc: string;
        if (c[1] === '[') {
          pDesc = c.slice(2, 2 + span(c.slice(2), ']')).slice(0, 31);
          c = c.slice(span(c, ']') + 1);
        } else {
          if (c[0] === 'i') pDesc = 'number';
          else if (c[0] === 'f') pDesc = 'float';
          else if (c[0] === 'r' || c[0] === 's') pDesc = 'string';
          else break;
          c = c.slice(1);
        }
        const aBuf = (Optional ? `[${pDesc}] ` : `<${pDesc}> `).slice(0, 31);
        c = skipWs(c);
        T.TextEx(Cursor, aBuf, -1);
      }
      T.TextColor(0.5, 0.5, 0.5, 1);
      T.TextEx(Cursor, pCommand.m_aHelpText, -1);
      T.TextColor(1, 1, 1, 1);
    }
    y += LineHeight;
    const Cursor = new CTextCursor();
    T.SetCursor(Cursor, Rect.x + 5, y, 5, TEXTFLAG_RENDER);
    T.TextColor(0.5, 0.5, 0.5, 1);
    const sel = this.m_SelectedCommand >= 0 ? this.GetCommand(this.m_SelectedCommand) : null;
    if (sel && this.m_Input.GetString().slice(1).startsWith(sel.m_aName)) T.TextEx(Cursor, Localize('Press Enter to confirm or Esc to cancel'), -1);
    else T.TextEx(Cursor, Localize('Press Tab to select or Esc to cancel'), -1);
    T.TextColor(1, 1, 1, 1);
  }

  private ExecuteCommand(): boolean {
    const s = this.m_Input.GetString();
    const aCommand = s.slice(1, 1 + span(s.slice(1), ' ')).slice(0, 15);
    const pCommand = this.GetCommand(aCommand);
    if (!pCommand) return false;
    return !this.OnCommand(pCommand.m_aName, skipWs(skipToWs(s)));
  }

  private CompleteCommand(): boolean {
    if (this.m_aCommands.length - this.m_FilteredCount === 0) return false;
    const pCommand = this.GetCommand(this.m_SelectedCommand);
    if (!pCommand || this.m_Input.GetString().includes(' ')) return false;
    const aBuf = `/${pCommand.m_aName} `;
    this.m_Input.Set(aBuf);
    this.m_Input.SetCursorOffset(aBuf.length);
    this.m_InputUpdate = true;
    return true;
  }

  private Com_Mode(r: CResult, Mode: number): void { this.EnableMode(Mode, r.NumArguments() ? r.GetString(0).slice(0, 1023) : ''); }

  private Com_Reply(r: CResult): void {
    if (this.Config().m_ClDisableWhisper) return this.ClearInput();
    if (this.m_LastWhisperFrom === -1) this.ClearInput();
    else {
      this.m_WhisperTarget = this.m_LastWhisperFrom;
      this.EnableMode(P.CHAT_WHISPER, r.NumArguments() ? r.GetString(0).slice(0, 1023) : '');
    }
  }

  private Com_Whisper(r: CResult): void {
    if (this.Config().m_ClDisableWhisper) return this.ClearInput();
    const TargetID = this.m_pClient.GetClientID(r.GetString(0));
    if (TargetID !== -1) {
      this.m_WhisperTarget = TargetID;
      this.EnableMode(P.CHAT_WHISPER);
    }
  }

  private Com_Mute(r: CResult): void {
    const gc = this.m_pClient;
    const TargetID = gc.GetClientID(r.GetString(0));
    if (TargetID !== -1) {
      const c = gc.m_aClients[TargetID];
      const isMuted = c.m_ChatIgnore;
      if (isMuted) gc.Blacklist().RemoveIgnoredPlayer(c.m_aName, c.m_aClan);
      else gc.Blacklist().AddIgnoredPlayer(c.m_aName, c.m_aClan);
      c.m_ChatIgnore = !c.m_ChatIgnore;
      this.ClearInput();
      this.AddLine(str_format(128, !isMuted ? Localize("'%s' was muted") : Localize("'%s' was unmuted"), c.m_aName), CHAT_CLIENT_MSG, P.CHAT_ALL);
    }
    this.m_Mode = P.CHAT_NONE;
    gc.OnRelease();
  }

  private Com_Befriend(r: CResult): void {
    const gc = this.m_pClient;
    const TargetID = gc.GetClientID(r.GetString(0));
    if (TargetID !== -1) {
      const c = gc.m_aClients[TargetID];
      const isFriend = c.m_Friend;
      if (isFriend) gc.Friends().RemoveFriend(c.m_aName, c.m_aClan);
      else gc.Friends().AddFriend(c.m_aName, c.m_aClan);
      c.m_Friend = !c.m_Friend;
      this.ClearInput();
      this.AddLine(str_format(128, !isFriend ? Localize("'%s' was added as a friend") : Localize("'%s' was removed as a friend"), c.m_aName), CHAT_CLIENT_MSG, P.CHAT_ALL);
    }
    this.m_Mode = P.CHAT_NONE;
    gc.OnRelease();
  }

  private FilterChatCommands(pLine: string): number {
    const aCommand = pLine.slice(1, 1 + span(pLine.slice(1), ' ')).slice(0, 15);
    this.m_FilteredCount = this.Filter(aCommand, pLine.includes(' '));
    return this.m_FilteredCount;
  }
  private GetFirstActiveCommand(): number {
    for (let i = 0; i < this.m_aCommands.length; i++) if (!this.m_aFilter[i]) return i;
    return -1;
  }
  private NextActiveCommand(Index: number): number {
    Index++;
    while (Index < this.m_aFilter.length && this.m_aFilter[Index]) Index++;
    return Index;
  }
  private PreviousActiveCommand(Index: number): number {
    Index--;
    while (Index >= 0 && this.m_aFilter[Index]) Index--;
    return Index;
  }
  private GetActiveCountRange(i: number, j: number): number {
    let Count = 0;
    while (i < j) if (!this.m_aFilter[i++]) Count++;
    return Count;
  }
}
