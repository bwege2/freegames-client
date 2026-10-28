// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: game/client/components/broadcast.h and broadcast.cpp of Teeworlds 0.7.5 in TypeScript.
import { vec2, mix, cosf, sinf, pi, v4, str_utf8_decode } from './common.ts';
import * as P from '../../../generated/protocol.ts';
import { CFreeformItem } from '../../engine/graphics.ts';
import { STATE_ONLINE } from '../../engine/client.ts';
import { CTextCursor, TEXTFLAG_RENDER, TEXTFLAG_STOP_AT_END } from '../../engine/text.ts';
import { CUIRect } from '../ui.ts';
import { CComponent } from '../component.ts';
import type { CNetMsg } from '../gameclient.ts';

const BROADCAST_FONTSIZE_BIG = 11, BROADCAST_FONTSIZE_SMALL = 6.5;
const MAX_BROADCAST_COLORS = 128, MAX_BROADCAST_MSG_LENGTH = 127, MAX_BROADCAST_LINES = 3;

interface CBcColor { m_R: number; m_G: number; m_B: number; m_CharPos: number }
/** a line: its start in the message, its length in bytes, its width */
interface CBcLineInfo { m_Start: number; m_StrLen: number; m_Width: number }

const IsCharANum = (c: string): boolean => c >= '0' && c <= '9';

export class CBroadcast extends CComponent {
  private m_aBroadcastText = '';
  private m_BroadcastTime = 0;
  private m_BroadcastRenderOffset = 0;
  private m_aSrvBroadcastColorList: CBcColor[] = [];
  private m_aSrvBroadcastLines: CBcLineInfo[] = [];
  private m_aSrvBroadcastMsg = '';
  private m_SrvBroadcastReceivedTime = 0;
  private m_SrvBroadcastFontSize = 0;

  /** WordLengthBack: from pos backwards, the chars up to a whitespace (0 if none within MaxChars) */
  private WordLengthBack(pos: number, MaxChars: number): number {
    let s = 0;
    while (MaxChars--) {
      const c = this.m_aSrvBroadcastMsg[pos] ?? '\0';
      if (c === '\n' || c === '\t' || c === ' ') return s;
      pos--;
      s++;
    }
    return 0;
  }

  private RenderServerBroadcast(): void {
    const cfg = this.Config(), gc = this.m_pClient, G = this.Graphics(), T = this.TextRender();
    if (!cfg.m_ClShowServerBroadcast || gc.m_MuteServerBroadcast) return;
    const Height = 300, Width = Height * G.ScreenAspect();
    const DisplayDuration = 10, DisplayStartFade = 9;
    const DeltaTime = this.Client().LocalTime() - this.m_SrvBroadcastReceivedTime;
    if (!this.m_aSrvBroadcastMsg || DeltaTime > DisplayDuration) return;
    if (gc.m_pChat.IsActive() || this.Client().State() !== STATE_ONLINE) return;
    G.MapScreen(0, 0, Width, Height);
    const Fade = 1 - Math.max(0, (DeltaTime - DisplayStartFade) / (DisplayDuration - DisplayStartFade));
    const BcView = new CUIRect(Width * 0.25, Height * 0.8, Width * 0.5, Height * 0.2);
    const ColorTop = v4(0, 0, 0, 0), ColorBot = v4(0, 0, 0, 0.4 * Fade);
    const BgRect = new CUIRect();
    BcView.HSplitBottom(10, null, BgRect);
    BcView.HSplitBottom(6, BcView, null);
    const CornerWidth = 10, CornerHeight = BgRect.h;
    BgRect.VMargin(CornerWidth, BgRect);
    G.TextureClear();
    G.QuadsBegin();
    const CORNER_MAX_QUADS = 4;
    const L: CFreeformItem[] = [], R: CFreeformItem[] = [];
    const AngleStep = (pi * 0.5) / (CORNER_MAX_QUADS * 2);
    for (let q = 0; q < CORNER_MAX_QUADS; q++) {
      const Angle = AngleStep * q * 2;
      const ca = cosf(Angle), ca1 = cosf(Angle + AngleStep), ca2 = cosf(Angle + AngleStep * 2);
      const sa = sinf(Angle), sa1 = sinf(Angle + AngleStep), sa2 = sinf(Angle + AngleStep * 2);
      const yb = BgRect.y + CornerHeight;
      L.push(new CFreeformItem(BgRect.x + ca * -CornerWidth, yb + sa * -CornerHeight, BgRect.x, yb, BgRect.x + ca1 * -CornerWidth, yb + sa1 * -CornerHeight,
        BgRect.x + ca2 * -CornerWidth, yb + sa2 * -CornerHeight));
      const xr = BgRect.x + BgRect.w;
      R.push(new CFreeformItem(xr + ca * CornerWidth, yb + sa * -CornerHeight, xr, yb, xr + ca1 * CornerWidth, yb + sa1 * -CornerHeight, xr + ca2 * CornerWidth, yb + sa2 * -CornerHeight));
    }
    G.SetColorVertex([{ m_Index: 0, m_R: 0, m_G: 0, m_B: 0, m_A: 0 }, { m_Index: 1, m_R: 0, m_G: 0, m_B: 0, m_A: 0.4 * Fade },
      { m_Index: 2, m_R: 0, m_G: 0, m_B: 0, m_A: 0 }, { m_Index: 3, m_R: 0, m_G: 0, m_B: 0, m_A: 0 }], 4);
    G.QuadsDrawFreeform(L);
    G.QuadsDrawFreeform(R);
    G.QuadsEnd();
    this.RenderTools().DrawUIRect4(BgRect, ColorTop, ColorTop, ColorBot, ColorBot, 0, 0);
    BcView.VMargin(5, BcView);
    BcView.HSplitBottom(2, BcView, null);
    const FontSize = this.m_SrvBroadcastFontSize;
    const LineCount = this.m_aSrvBroadcastLines.length;
    const msg = this.m_aSrvBroadcastMsg;
    const Cursor = new CTextCursor();
    const ShadowOff = new vec2(1, 2);
    const ShadowColorBlack = v4(0, 0, 0, 0.9 * Fade), TextColorWhite = v4(1, 1, 1, Fade);
    let y = BcView.y + BcView.h - LineCount * FontSize;
    for (const Line of this.m_aSrvBroadcastLines) {
      T.SetCursor(Cursor, BcView.x + (BcView.w - Line.m_Width) * 0.5, y, FontSize, TEXTFLAG_RENDER | TEXTFLAG_STOP_AT_END);
      Cursor.m_LineWidth = BcView.w;
      if (cfg.m_ClColoredBroadcast) {
        let DrawnStrLen = 0;
        const ThisCharPos = Line.m_Start;
        const cl = this.m_aSrvBroadcastColorList;
        while (DrawnStrLen < Line.m_StrLen) {
          let StartColorID = -1, ColorStrLen = -1;
          for (let j = 0; j < cl.length; j++) {
            if (ThisCharPos + DrawnStrLen >= cl[j].m_CharPos) StartColorID = j;
            else if (StartColorID >= 0) {
              ColorStrLen = cl[j].m_CharPos - Math.max(cl[StartColorID].m_CharPos, ThisCharPos);
              break;
            }
          }
          if (ColorStrLen < 0) ColorStrLen = Line.m_StrLen - DrawnStrLen;
          ColorStrLen = Math.min(ColorStrLen, Line.m_StrLen - DrawnStrLen);
          const TC = cl[Math.max(0, StartColorID)];
          const r = TC.m_R / 255, g = TC.m_G / 255, b = TC.m_B / 255;
          const AvgLum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          const part = msg.slice(Line.m_Start + DrawnStrLen);
          if (AvgLum < 0.25) {
            T.TextOutlineColor(1, 1, 1, 0.6);
            T.TextColor(r, g, b, Fade);
            T.TextEx(Cursor, part, ColorStrLen);
          } else T.TextShadowed(Cursor, part, ColorStrLen, ShadowOff, v4(r * 0.15, g * 0.15, b * 0.15, 0.9 * Fade), v4(r, g, b, Fade));
          DrawnStrLen += ColorStrLen;
        }
      } else T.TextShadowed(Cursor, msg.slice(Line.m_Start), Line.m_StrLen, ShadowOff, ShadowColorBlack, TextColorWhite);
      y += FontSize;
    }
    T.TextColor(1, 1, 1, 1);
    T.TextOutlineColor(0, 0, 0, 0.3);
  }

  DoBroadcast(pText: string): void {
    this.m_aBroadcastText = pText.slice(0, 127);
    const Cursor = new CTextCursor();
    this.TextRender().SetCursor(Cursor, 0, 0, 12, TEXTFLAG_STOP_AT_END);
    Cursor.m_LineWidth = 300 * this.Graphics().ScreenAspect();
    this.TextRender().TextEx(Cursor, this.m_aBroadcastText, -1);
    this.m_BroadcastRenderOffset = 150 * this.Graphics().ScreenAspect() - Cursor.m_X / 2;
    this.m_BroadcastTime = this.Client().LocalTime() + 10;
  }

  override OnReset(): void {
    this.m_BroadcastTime = 0;
    this.m_SrvBroadcastReceivedTime = 0;
  }

  override OnMessage(MsgType: number, pRawMsg: CNetMsg): void {
    if (MsgType !== P.NETMSGTYPE_SV_BROADCAST || !this.Config().m_ClShowServerBroadcast || this.m_pClient.m_MuteServerBroadcast) return;
    const m = (pRawMsg as P.CNetMsg_Sv_Broadcast).m_pMessage;
    const RcvMsgLen = m.length;
    let out = '';
    this.m_SrvBroadcastReceivedTime = this.Client().LocalTime();
    this.m_aSrvBroadcastColorList = [{ m_R: 255, m_G: 255, m_B: 255, m_CharPos: 0 }];
    const UserLines: CBcLineInfo[] = [];
    let LastUserLineStartPoint = 0;
    for (let i = 0; i < RcvMsgLen; i++) {
      const c = m[i];
      const pTmp = { i };
      const CharUtf8 = str_utf8_decode(m, pTmp);
      const Utf8Len = pTmp.i - i;
      const cc = m.charCodeAt(i) << 24 >> 24;
      if (cc === CharUtf8 && c === '^') {
        if (i + 3 < RcvMsgLen && IsCharANum(m[i + 1]) && IsCharANum(m[i + 2]) && IsCharANum(m[i + 3])) {
          const col = (k: number): number => ((m.charCodeAt(i + k) - 48) * 24 + 39) & 0xff;
          if (this.m_aSrvBroadcastColorList.length < MAX_BROADCAST_COLORS) this.m_aSrvBroadcastColorList.push({ m_R: col(1), m_G: col(2), m_B: col(3), m_CharPos: out.length });
          i += 3;
          continue;
        }
      }
      if (cc === CharUtf8 && c === '\\') {
        if (i + 1 < RcvMsgLen && m[i + 1] === 'n' && UserLines.length < MAX_BROADCAST_LINES) {
          const Line = { m_Start: LastUserLineStartPoint, m_StrLen: out.length - LastUserLineStartPoint, m_Width: 0 };
          if (Line.m_StrLen > 0) UserLines.push(Line);
          LastUserLineStartPoint = out.length;
          i++;
          continue;
        }
      }
      if (c === '\n') {
        const Line = { m_Start: LastUserLineStartPoint, m_StrLen: out.length - LastUserLineStartPoint, m_Width: 0 };
        if (Line.m_StrLen > 0) UserLines.push(Line);
        LastUserLineStartPoint = out.length;
        continue;
      }
      if (out.length + Utf8Len < MAX_BROADCAST_MSG_LENGTH) out += c;
    }
    if (LastUserLineStartPoint > 0 && UserLines.length < 3) {
      const Line = { m_Start: LastUserLineStartPoint, m_StrLen: out.length - LastUserLineStartPoint, m_Width: 0 };
      if (Line.m_StrLen > 0) UserLines.push(Line);
    }
    this.m_aSrvBroadcastMsg = out;
    const G = this.Graphics(), T = this.TextRender();
    const Height = 300, Width = Height * G.ScreenAspect();
    const LineMaxWidth = Width * 0.5 - 10;
    const MsgLen = out.length;
    const Cursor = new CTextCursor();
    G.MapScreen(0, 0, Width, Height);
    this.m_aSrvBroadcastLines = [];
    let FontSize = BROADCAST_FONTSIZE_BIG;
    if (UserLines.length <= 1) {
      T.SetCursor(Cursor, 0, 0, FontSize, 0);
      Cursor.m_LineWidth = LineMaxWidth;
      T.TextEx(Cursor, out, MsgLen);
      Cursor.m_LineCount = Math.min(Cursor.m_LineCount, MAX_BROADCAST_LINES);
      FontSize = mix(BROADCAST_FONTSIZE_BIG, BROADCAST_FONTSIZE_SMALL, Cursor.m_LineCount / MAX_BROADCAST_LINES);
      let CurCharCount = 0;
      while (CurCharCount < MsgLen && this.m_aSrvBroadcastLines.length < MAX_BROADCAST_LINES) {
        const Remaining = out.slice(CurCharCount);
        T.SetCursor(Cursor, 0, 0, FontSize, TEXTFLAG_STOP_AT_END);
        Cursor.m_LineWidth = LineMaxWidth;
        T.TextEx(Cursor, Remaining, -1);
        let StrLen = Cursor.m_CharCount;
        if (CurCharCount + StrLen < MsgLen) {
          const WorldLen = this.WordLengthBack(CurCharCount + StrLen, StrLen);
          if (WorldLen > 0 && WorldLen < StrLen) {
            StrLen -= WorldLen;
            T.SetCursor(Cursor, 0, 0, FontSize, TEXTFLAG_STOP_AT_END);
            Cursor.m_LineWidth = LineMaxWidth;
            T.TextEx(Cursor, Remaining, StrLen);
          }
        }
        this.m_aSrvBroadcastLines.push({ m_Start: CurCharCount, m_StrLen: StrLen, m_Width: Cursor.m_X - Cursor.m_StartX });
        if (StrLen <= 0) break;
        CurCharCount += StrLen;
      }
    } else {
      FontSize = mix(BROADCAST_FONTSIZE_BIG, BROADCAST_FONTSIZE_SMALL, UserLines.length / MAX_BROADCAST_LINES);
      for (let i = 0; i < UserLines.length && this.m_aSrvBroadcastLines.length < MAX_BROADCAST_LINES; i++) {
        T.SetCursor(Cursor, 0, 0, FontSize, TEXTFLAG_STOP_AT_END);
        Cursor.m_LineWidth = LineMaxWidth;
        T.TextEx(Cursor, out.slice(UserLines[i].m_Start), UserLines[i].m_StrLen);
        this.m_aSrvBroadcastLines.push({ m_Start: UserLines[i].m_Start, m_StrLen: Cursor.m_CharCount, m_Width: Cursor.m_X - Cursor.m_StartX });
      }
    }
    this.m_SrvBroadcastFontSize = FontSize;
  }

  override OnRender(): void {
    if (this.Client().State() < STATE_ONLINE) return;
    this.RenderServerBroadcast();
    if (this.m_pClient.m_pScoreboard.IsActive() || this.m_pClient.m_pMotd.IsActive()) return;
    const G = this.Graphics();
    G.MapScreen(0, 0, 300 * G.ScreenAspect(), 300);
    if (this.Client().LocalTime() < this.m_BroadcastTime) {
      const Cursor = new CTextCursor();
      this.TextRender().SetCursor(Cursor, this.m_BroadcastRenderOffset, 40, 12, TEXTFLAG_RENDER | TEXTFLAG_STOP_AT_END);
      Cursor.m_LineWidth = 300 * G.ScreenAspect() - this.m_BroadcastRenderOffset;
      this.TextRender().TextEx(Cursor, this.m_aBroadcastText, -1);
    }
  }
}
