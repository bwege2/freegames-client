// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: game/client/lineinput.h and lineinput.cpp of Teeworlds 0.7.5 in TypeScript (byte strings).
import { str_utf8_forward, str_utf8_rewind } from '../../base/system.ts';
import { FLAG_PRESS, FLAG_TEXT, type CEvent, type CInput } from '../engine/input.ts';
import * as K from '../engine/keys.ts';

const MAX_SIZE = 512, MAX_CHARS = MAX_SIZE / 4 - 1;

/** the state Manipulate edits (pStr, pStrLenPtr, pCursorPosPtr, pNumCharsPtr) */
export interface CLineState { str: string; len: number; cursor: number; numChars: number }

function countChars(s: string): { count: number; size: number } {
  let CharCount = 0, CharSize = 0;
  while (CharSize < s.length) {
    const n = str_utf8_forward(s, CharSize);
    if (n !== CharSize) {
      ++CharCount;
      CharSize = n;
    } else break;
  }
  return { count: CharCount, size: CharSize };
}

export class CLineInput {
  private m_Str = '';
  private m_CursorPos = 0;
  private m_NumChars = 0;
  private m_pInput: CInput | null = null;

  Init(pInput: CInput): void { this.m_pInput = pInput; }
  Clear(): void {
    this.m_Str = '';
    this.m_CursorPos = 0;
    this.m_NumChars = 0;
  }
  Set(pString: string): void {
    this.m_Str = pString.slice(0, MAX_SIZE - 1);
    this.m_CursorPos = this.m_Str.length;
    this.m_NumChars = countChars(pString).count;
  }
  GetString(): string { return this.m_Str; }
  GetLength(): number { return this.m_Str.length; }
  GetCursorOffset(): number { return this.m_CursorPos; }
  SetCursorOffset(Offset: number): void { this.m_CursorPos = Offset > this.m_Str.length ? this.m_Str.length : Offset < 0 ? 0 : Offset; }

  static MoveWordStop(c: string): boolean {
    const n = c.charCodeAt(0) << 24 >> 24;
    return (n >= 32 && n <= 47) || (n >= 58 && n <= 64) || (n >= 91 && n <= 96);
  }

  static Manipulate(Event: CEvent, s: CLineState, StrMaxSize: number, StrMaxChars: number, pInput: CInput | null): boolean {
    let { str, numChars: NumChars, cursor: CursorPos } = s;
    let Len = str.length;
    let Changes = false;
    if (CursorPos > Len) CursorPos = Len;
    const insert = (t: string): void => {
      const { count: CharCount, size: CharSize } = countChars(t);
      if (CharCount && Len + CharSize < StrMaxSize && CursorPos + CharSize < StrMaxSize && NumChars + CharCount < StrMaxChars) {
        str = str.slice(0, CursorPos) + t.slice(0, CharSize) + str.slice(CursorPos);
        CursorPos += CharSize;
        Len += CharSize;
        NumChars += CharCount;
        Changes = true;
      }
    };
    if (Event.m_Flags & FLAG_TEXT && !(K.KEY_LCTRL <= Event.m_Key && Event.m_Key <= K.KEY_RGUI)) insert(Event.m_aText);
    if (Event.m_Flags & FLAG_PRESS) {
      const Key = Event.m_Key;
      const MoveWord = !!pInput && (pInput.KeyIsPressed(K.KEY_LCTRL) || pInput.KeyIsPressed(K.KEY_RCTRL));
      if (Key === K.KEY_BACKSPACE && CursorPos > 0) {
        let NewCursorPos = CursorPos;
        do {
          NewCursorPos = str_utf8_rewind(str, NewCursorPos);
          NumChars -= 1;
        } while (MoveWord && NewCursorPos > 0 && !CLineInput.MoveWordStop(str[NewCursorPos - 1]));
        str = str.slice(0, NewCursorPos) + str.slice(CursorPos);
        Len -= CursorPos - NewCursorPos;
        CursorPos = NewCursorPos;
        Changes = true;
      } else if (Key === K.KEY_DELETE && CursorPos < Len) {
        let EndCursorPos = CursorPos;
        do {
          EndCursorPos = str_utf8_forward(str, EndCursorPos);
          NumChars -= 1;
        } while (MoveWord && EndCursorPos < Len && !CLineInput.MoveWordStop(str[EndCursorPos - 1]));
        str = str.slice(0, CursorPos) + str.slice(EndCursorPos);
        Len -= EndCursorPos - CursorPos;
        Changes = true;
      } else if (Key === K.KEY_LEFT && CursorPos > 0) {
        do CursorPos = str_utf8_rewind(str, CursorPos);
        while (MoveWord && CursorPos > 0 && !CLineInput.MoveWordStop(str[CursorPos - 1]));
      } else if (Key === K.KEY_RIGHT && CursorPos < Len) {
        do CursorPos = str_utf8_forward(str, CursorPos);
        while (MoveWord && CursorPos < Len && !CLineInput.MoveWordStop(str[CursorPos - 1]));
      } else if (Key === K.KEY_HOME) CursorPos = 0;
      else if (Key === K.KEY_END) CursorPos = Len;
      else if (pInput && (pInput.KeyIsPressed(K.KEY_LCTRL) || pInput.KeyIsPressed(K.KEY_RCTRL)) && Key === K.KEY_V) {
        const t = pInput.GetClipboardText();
        if (t) insert(t);
      }
    }
    s.str = str;
    s.len = Len;
    s.cursor = CursorPos;
    s.numChars = NumChars;
    return Changes;
  }

  ProcessInput(e: CEvent): boolean {
    const s: CLineState = { str: this.m_Str, len: this.m_Str.length, cursor: this.m_CursorPos, numChars: this.m_NumChars };
    const r = CLineInput.Manipulate(e, s, MAX_SIZE, MAX_CHARS, this.m_pInput);
    this.m_Str = s.str;
    this.m_CursorPos = s.cursor;
    this.m_NumChars = s.numChars;
    return r;
  }
}
