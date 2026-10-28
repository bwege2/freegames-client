// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: game/client/render.h, render.cpp, render_map.cpp, animstate.h and animstate.cpp of Teeworlds 0.7.5
// in TypeScript. The rendering is the original's; it computes in doubles where only the picture depends on it.
import { vec2, f, angle, fx2f, mix, clamp, bezier, pi, type vec4 } from '../../base/vmath.ts';
import { str_format } from '../../base/system.ts';
import type { CConfig } from '../../generated/config.ts';
import { g_pData, type CAnimation, type CAnimKeyframe, type CAnimSequence, type CDataSprite } from '../../generated/content.ts';
import * as C from '../../generated/content.ts';
import { NUM_SKINPARTS, SKINPART_BODY, SKINPART_DECORATION, SKINPART_EYES, SKINPART_FEET, SKINPART_HANDS, SKINPART_MARKING,
  EMOTE_ANGRY, EMOTE_BLINK, EMOTE_HAPPY, EMOTE_PAIN, EMOTE_SURPRISE } from '../../generated/protocol.ts';
import * as MI from '../../game/mapitems.ts';
import { CGraphics, CQuadItem, CFreeformItem, CTextureHandle, WRAP_CLAMP, WRAP_REPEAT, type CColorVertex } from '../engine/graphics.ts';
import { CTextCursor, TEXTFLAG_ALLOW_NEWLINE, TEXTFLAG_STOP_AT_END, type CTextRender } from '../engine/text.ts';
import { CUI, CUIRect, CORNER_ALL } from './ui.ts';

export const SPRITE_FLAG_FLIP_Y = 1, SPRITE_FLAG_FLIP_X = 2, LAYERRENDERFLAG_OPAQUE = 1, LAYERRENDERFLAG_TRANSPARENT = 2, TILERENDERFLAG_EXTEND = 4;

export const v4 = (r: number, g: number, b: number, a: number): vec4 => ({ r, g, b, a });

export class CTeeRenderInfo {
  m_aTextures: CTextureHandle[] = Array.from({ length: NUM_SKINPARTS }, () => new CTextureHandle());
  m_HatTexture = new CTextureHandle();
  m_BotTexture = new CTextureHandle();
  m_HatSpriteIndex = 0;
  m_BotColor: vec4 = v4(0, 0, 0, 0);
  m_aColors: vec4[] = Array.from({ length: NUM_SKINPARTS }, () => v4(1, 1, 1, 1));
  m_Size = 1;
  m_GotAirJump = 1;
  copy(): CTeeRenderInfo {
    const r = new CTeeRenderInfo();
    r.m_aTextures = this.m_aTextures.slice();
    r.m_HatTexture = this.m_HatTexture;
    r.m_BotTexture = this.m_BotTexture;
    r.m_HatSpriteIndex = this.m_HatSpriteIndex;
    r.m_BotColor = { ...this.m_BotColor };
    r.m_aColors = this.m_aColors.map((c) => ({ ...c }));
    r.m_Size = this.m_Size;
    r.m_GotAirJump = this.m_GotAirJump;
    return r;
  }
}

// ---------------------------------------------------------------- animstate
const zeroFrame = (): CAnimKeyframe => ({ m_Time: 0, m_X: 0, m_Y: 0, m_Angle: 0 });

function AnimSeqEval(pSeq: CAnimSequence, Time: number, pFrame: CAnimKeyframe): void {
  if (pSeq.m_NumFrames === 0) {
    pFrame.m_Time = 0;
    pFrame.m_X = 0;
    pFrame.m_Y = 0;
    pFrame.m_Angle = 0;
  } else if (pSeq.m_NumFrames === 1) Object.assign(pFrame, pSeq.m_aFrames[0]);
  else {
    for (let i = 1; i < pSeq.m_NumFrames; i++) {
      const f1 = pSeq.m_aFrames[i - 1], f2 = pSeq.m_aFrames[i];
      if (f1.m_Time <= Time && f2.m_Time >= Time) {
        const Blend = (Time - f1.m_Time) / (f2.m_Time - f1.m_Time);
        pFrame.m_Time = Time;
        pFrame.m_X = mix(f1.m_X, f2.m_X, Blend);
        pFrame.m_Y = mix(f1.m_Y, f2.m_Y, Blend);
        pFrame.m_Angle = mix(f1.m_Angle, f2.m_Angle, Blend);
        break;
      }
    }
  }
}

export class CAnimState {
  m_Body = zeroFrame();
  m_BackFoot = zeroFrame();
  m_FrontFoot = zeroFrame();
  m_Attach = zeroFrame();
  GetBody(): CAnimKeyframe { return this.m_Body; }
  GetBackFoot(): CAnimKeyframe { return this.m_BackFoot; }
  GetFrontFoot(): CAnimKeyframe { return this.m_FrontFoot; }
  GetAttach(): CAnimKeyframe { return this.m_Attach; }
  Set(pAnim: CAnimation, Time: number): void {
    AnimSeqEval(pAnim.m_Body, Time, this.m_Body);
    AnimSeqEval(pAnim.m_BackFoot, Time, this.m_BackFoot);
    AnimSeqEval(pAnim.m_FrontFoot, Time, this.m_FrontFoot);
    AnimSeqEval(pAnim.m_Attach, Time, this.m_Attach);
  }
  Add(pAnim: CAnimation, Time: number, Amount: number): void {
    const a = new CAnimState();
    a.Set(pAnim, Time);
    const add = (s: CAnimKeyframe, p: CAnimKeyframe): void => {
      s.m_X += p.m_X * Amount;
      s.m_Y += p.m_Y * Amount;
      s.m_Angle += p.m_Angle * Amount;
    };
    add(this.m_Body, a.m_Body);
    add(this.m_BackFoot, a.m_BackFoot);
    add(this.m_FrontFoot, a.m_FrontFoot);
    add(this.m_Attach, a.m_Attach);
  }
  private static s_Idle: CAnimState | null = null;
  static GetIdle(): CAnimState {
    if (!CAnimState.s_Idle) {
      const s = new CAnimState();
      s.Set(g_pData.m_aAnimations[C.ANIM_BASE], 0);
      s.Add(g_pData.m_aAnimations[C.ANIM_IDLE], 0, 1);
      CAnimState.s_Idle = s;
    }
    return CAnimState.s_Idle;
  }
}

// ---------------------------------------------------------------- render_map helpers
function CubicRoot(x: number): number {
  if (x === 0) return 0;
  if (x < 0) return -Math.exp(Math.log(-x) / 3);
  return Math.exp(Math.log(x) / 3);
}

function SolveBezier(x: number, p0: number, p1: number, p2: number, p3: number): number {
  const x3 = -p0 + 3 * p1 - 3 * p2 + p3;
  const x2 = 3 * p0 - 6 * p1 + 3 * p2;
  const x1 = -3 * p0 + 3 * p1;
  const x0 = p0 - x;
  if (x3 === 0 && x2 === 0) {
    if (x1 === 0) return 0;
    return -x0 / x1;
  } else if (x3 === 0) {
    const b = x1 / x2, c = x0 / x2;
    if (c === 0) return 0;
    const D = b * b - 4 * c;
    const t = (-b + Math.sqrt(D)) / 2;
    if (t >= 0 && t <= 1.0001) return t;
    return (-b - Math.sqrt(D)) / 2;
  }
  const a = x2 / x3, b = x1 / x3, c = x0 / x3;
  const sub = a / 3;
  const p = b / 3 - (a * a) / 9;
  const q = ((2 * a * a * a) / 27 - (a * b) / 3 + c) / 2;
  const D = q * q + p * p * p;
  if (D > 0) {
    const s = Math.sqrt(D);
    return CubicRoot(s - q) - CubicRoot(s + q) - sub;
  } else if (D === 0) {
    const s = CubicRoot(-q);
    const t = 2 * s - sub;
    if (t >= 0 && t <= 1.0001) return t;
    return -s - sub;
  }
  const phi = Math.acos(-q / Math.sqrt(-(p * p * p))) / 3;
  const s = 2 * Math.sqrt(-p);
  let t = s * Math.cos(phi) - sub;
  if (t >= 0 && t <= 1.0001) return t;
  t = -s * Math.cos(phi + pi / 3) - sub;
  if (t >= 0 && t <= 1.0001) return t;
  return -s * Math.cos(phi - pi / 3) - sub;
}

/** the env points of a map as an int array; point i starts at i*Stride (CEnvPoint) */
export interface CEnvPoints { d: Int32Array; stride: number }
const EP_TIME = 0, EP_CURVETYPE = 1, EP_VALUES = 2, EP_IN_DX = 6, EP_IN_DY = 10, EP_OUT_DX = 14, EP_OUT_DY = 18;

export type ENVELOPE_EVAL = (TimeOffset: number, Env: number, pChannels: number[]) => void;

export class CRenderTools {
  private m_pConfig!: CConfig;
  private m_pGraphics!: CGraphics;
  private m_pUI!: CUI;
  private gs_SpriteWScale = 0;
  private gs_SpriteHScale = 0;

  Init(pConfig: CConfig, pGraphics: CGraphics, pUI: CUI): void {
    this.m_pConfig = pConfig;
    this.m_pGraphics = pGraphics;
    this.m_pUI = pUI;
  }
  Graphics(): CGraphics { return this.m_pGraphics; }
  UI(): CUI { return this.m_pUI; }

  SelectSprite(Id: number | CDataSprite, Flags = 0, sx = 0, sy = 0): void {
    let pSpr: CDataSprite;
    if (typeof Id === 'number') {
      if (Id < 0 || Id >= g_pData.m_NumSprites) return;
      pSpr = g_pData.m_aSprites[Id];
    } else pSpr = Id;
    const x = pSpr.m_X + sx, y = pSpr.m_Y + sy, w = pSpr.m_W, h = pSpr.m_H;
    const cx = pSpr.m_pSet.m_Gridx, cy = pSpr.m_pSet.m_Gridy;
    const fl = Math.sqrt(h * h + w * w);
    this.gs_SpriteWScale = w / fl;
    this.gs_SpriteHScale = h / fl;
    let x1 = x / cx, x2 = (x + w - 1 / 32) / cx, y1 = y / cy, y2 = (y + h - 1 / 32) / cy;
    if (Flags & SPRITE_FLAG_FLIP_Y) [y1, y2] = [y2, y1];
    if (Flags & SPRITE_FLAG_FLIP_X) [x1, x2] = [x2, x1];
    this.Graphics().QuadsSetSubset(x1, y1, x2, y2);
  }

  DrawSprite(x: number, y: number, Size: number): void {
    this.Graphics().QuadsDraw([new CQuadItem(x, y, Size * this.gs_SpriteWScale, Size * this.gs_SpriteHScale)], 1);
  }

  private DrawRoundRectExt(x: number, y: number, w: number, h: number, r: number, Corners: number): void {
    const ArrayF: CFreeformItem[] = [];
    const Num = 8;
    for (let i = 0; i < Num; i += 2) {
      const a1 = (i / Num) * pi / 2, a2 = ((i + 1) / Num) * pi / 2, a3 = ((i + 2) / Num) * pi / 2;
      const Ca1 = Math.cos(a1), Ca2 = Math.cos(a2), Ca3 = Math.cos(a3), Sa1 = Math.sin(a1), Sa2 = Math.sin(a2), Sa3 = Math.sin(a3);
      if (Corners & 1) ArrayF.push(new CFreeformItem(x + r, y + r, x + (1 - Ca1) * r, y + (1 - Sa1) * r, x + (1 - Ca3) * r, y + (1 - Sa3) * r, x + (1 - Ca2) * r, y + (1 - Sa2) * r));
      if (Corners & 2) ArrayF.push(new CFreeformItem(x + w - r, y + r, x + w - r + Ca1 * r, y + (1 - Sa1) * r, x + w - r + Ca3 * r, y + (1 - Sa3) * r, x + w - r + Ca2 * r, y + (1 - Sa2) * r));
      if (Corners & 4) ArrayF.push(new CFreeformItem(x + r, y + h - r, x + (1 - Ca1) * r, y + h - r + Sa1 * r, x + (1 - Ca3) * r, y + h - r + Sa3 * r, x + (1 - Ca2) * r, y + h - r + Sa2 * r));
      if (Corners & 8) ArrayF.push(new CFreeformItem(x + w - r, y + h - r, x + w - r + Ca1 * r, y + h - r + Sa1 * r, x + w - r + Ca3 * r, y + h - r + Sa3 * r, x + w - r + Ca2 * r, y + h - r + Sa2 * r));
      if (Corners & 16) ArrayF.push(new CFreeformItem(x, y, x + (1 - Ca1) * r, y - r + Sa1 * r, x + (1 - Ca3) * r, y - r + Sa3 * r, x + (1 - Ca2) * r, y - r + Sa2 * r));
      if (Corners & 32) ArrayF.push(new CFreeformItem(x + w, y, x + w - r + Ca1 * r, y - r + Sa1 * r, x + w - r + Ca3 * r, y - r + Sa3 * r, x + w - r + Ca2 * r, y - r + Sa2 * r));
      if (Corners & 64) ArrayF.push(new CFreeformItem(x, y + h, x + (1 - Ca1) * r, y + h + (1 - Sa1) * r, x + (1 - Ca3) * r, y + h + (1 - Sa3) * r, x + (1 - Ca2) * r, y + h + (1 - Sa2) * r));
      if (Corners & 128) ArrayF.push(new CFreeformItem(x + w, y + h, x + w - r + Ca1 * r, y + h + (1 - Sa1) * r, x + w - r + Ca3 * r, y + h + (1 - Sa3) * r, x + w - r + Ca2 * r, y + h + (1 - Sa2) * r));
    }
    this.Graphics().QuadsDrawFreeform(ArrayF);
    const ArrayQ = [
      new CQuadItem(x + r, y + r, w - r * 2, h - r * 2), new CQuadItem(x + r, y, w - r * 2, r), new CQuadItem(x + r, y + h - r, w - r * 2, r),
      new CQuadItem(x, y + r, r, h - r * 2), new CQuadItem(x + w - r, y + r, r, h - r * 2),
    ];
    if (!(Corners & 1)) ArrayQ.push(new CQuadItem(x, y, r, r));
    if (!(Corners & 2)) ArrayQ.push(new CQuadItem(x + w, y, -r, r));
    if (!(Corners & 4)) ArrayQ.push(new CQuadItem(x, y + h, r, -r));
    if (!(Corners & 8)) ArrayQ.push(new CQuadItem(x + w, y + h, -r, -r));
    this.Graphics().QuadsDrawTL(ArrayQ);
  }

  private DrawRoundRectExt4(x: number, y: number, w: number, h: number, TL: vec4, TR: vec4, BL: vec4, BR: vec4, r: number, Corners: number): void {
    const G = this.Graphics();
    const Num = 8;
    const ff = (c: vec4, it: CFreeformItem): void => {
      G.SetColor(c.r, c.g, c.b, c.a);
      G.QuadsDrawFreeform([it], 1);
    };
    for (let i = 0; i < Num; i += 2) {
      const a1 = (i / Num) * pi / 2, a2 = ((i + 1) / Num) * pi / 2, a3 = ((i + 2) / Num) * pi / 2;
      const Ca1 = Math.cos(a1), Ca2 = Math.cos(a2), Ca3 = Math.cos(a3), Sa1 = Math.sin(a1), Sa2 = Math.sin(a2), Sa3 = Math.sin(a3);
      if (Corners & 1) ff(TL, new CFreeformItem(x + r, y + r, x + (1 - Ca1) * r, y + (1 - Sa1) * r, x + (1 - Ca3) * r, y + (1 - Sa3) * r, x + (1 - Ca2) * r, y + (1 - Sa2) * r));
      if (Corners & 2) ff(TR, new CFreeformItem(x + w - r, y + r, x + w - r + Ca1 * r, y + (1 - Sa1) * r, x + w - r + Ca3 * r, y + (1 - Sa3) * r, x + w - r + Ca2 * r, y + (1 - Sa2) * r));
      if (Corners & 4) ff(BL, new CFreeformItem(x + r, y + h - r, x + (1 - Ca1) * r, y + h - r + Sa1 * r, x + (1 - Ca3) * r, y + h - r + Sa3 * r, x + (1 - Ca2) * r, y + h - r + Sa2 * r));
      if (Corners & 8) ff(BR, new CFreeformItem(x + w - r, y + h - r, x + w - r + Ca1 * r, y + h - r + Sa1 * r, x + w - r + Ca3 * r, y + h - r + Sa3 * r, x + w - r + Ca2 * r, y + h - r + Sa2 * r));
      if (Corners & 16) ff(TL, new CFreeformItem(x, y, x + (1 - Ca1) * r, y - r + Sa1 * r, x + (1 - Ca3) * r, y - r + Sa3 * r, x + (1 - Ca2) * r, y - r + Sa2 * r));
      if (Corners & 32) ff(TR, new CFreeformItem(x + w, y, x + w - r + Ca1 * r, y - r + Sa1 * r, x + w - r + Ca3 * r, y - r + Sa3 * r, x + w - r + Ca2 * r, y - r + Sa2 * r));
      if (Corners & 64) ff(BL, new CFreeformItem(x, y + h, x + (1 - Ca1) * r, y + h + (1 - Sa1) * r, x + (1 - Ca3) * r, y + h + (1 - Sa3) * r, x + (1 - Ca2) * r, y + h + (1 - Sa2) * r));
      if (Corners & 128) ff(BR, new CFreeformItem(x + w, y + h, x + w - r + Ca1 * r, y + h + (1 - Sa1) * r, x + w - r + Ca3 * r, y + h + (1 - Sa3) * r, x + w - r + Ca2 * r, y + h + (1 - Sa2) * r));
    }
    G.SetColor4(TL, TR, BL, BR);
    G.QuadsDrawTL([new CQuadItem(x + r, y + r, w - r * 2, h - r * 2)], 1);
    G.SetColor4(TL, TR, TL, TR);
    G.QuadsDrawTL([new CQuadItem(x + r, y, w - r * 2, r)], 1);
    G.SetColor4(BL, BR, BL, BR);
    G.QuadsDrawTL([new CQuadItem(x + r, y + h - r, w - r * 2, r)], 1);
    G.SetColor4(TL, TL, BL, BL);
    G.QuadsDrawTL([new CQuadItem(x, y + r, r, h - r * 2)], 1);
    G.SetColor4(TR, TR, BR, BR);
    G.QuadsDrawTL([new CQuadItem(x + w - r, y + r, r, h - r * 2)], 1);
    const q = (c: vec4, it: CQuadItem): void => {
      G.SetColor(c.r, c.g, c.b, c.a);
      G.QuadsDrawTL([it], 1);
    };
    if (!(Corners & 1)) q(TL, new CQuadItem(x, y, r, r));
    if (!(Corners & 2)) q(TR, new CQuadItem(x + w, y, -r, r));
    if (!(Corners & 4)) q(BL, new CQuadItem(x, y + h, r, -r));
    if (!(Corners & 8)) q(BR, new CQuadItem(x + w, y + h, -r, -r));
  }

  DrawRoundRect(r: CUIRect, Color: vec4, Rounding: number): void { this.DrawUIRect(r, Color, CORNER_ALL, Rounding); }

  DrawUIRect(r: CUIRect, Color: vec4, Corners: number, Rounding: number): void {
    const G = this.Graphics();
    G.TextureClear();
    G.QuadsBegin();
    G.SetColor(Color.r * Color.a, Color.g * Color.a, Color.b * Color.a, Color.a);
    this.DrawRoundRectExt(r.x, r.y, r.w, r.h, Rounding, Corners);
    G.QuadsEnd();
  }

  DrawUIRect4(r: CUIRect, TL: vec4, TR: vec4, BL: vec4, BR: vec4, Corners: number, Rounding: number): void {
    const G = this.Graphics();
    G.TextureClear();
    G.QuadsBegin();
    this.DrawRoundRectExt4(r.x, r.y, r.w, r.h, TL, TR, BL, BR, Rounding, Corners);
    G.QuadsEnd();
  }

  RenderTee(pAnim: CAnimState, pInfo: CTeeRenderInfo, Emote: number, Dir: vec2, Pos: vec2): void {
    const G = this.Graphics();
    const Direction = Dir, Position = Pos;
    const IsBot = pInfo.m_BotTexture.IsValid();
    const col = (c: vec4): void => G.SetColor(c.r, c.g, c.b, c.a);
    for (let p = 0; p < 2; p++) {
      const OutLine = p === 0;
      for (let fi = 0; fi < 2; fi++) {
        const AnimScale = (pInfo.m_Size * 1) / 64;
        const BaseSize = pInfo.m_Size;
        if (fi === 1) {
          const body = pAnim.GetBody();
          const BodyPos = { x: Position.x + body.m_X * AnimScale, y: Position.y + body.m_Y * AnimScale };
          const BodyItem = (): CQuadItem => new CQuadItem(BodyPos.x, BodyPos.y, BaseSize, BaseSize);
          const BotItem = (): CQuadItem => new CQuadItem(BodyPos.x + (2 / 3) * AnimScale, BodyPos.y + (-16 + 2 / 3) * AnimScale, BaseSize, BaseSize);
          const rot = body.m_Angle * pi * 2;
          if (IsBot && !OutLine) {
            G.TextureSet(pInfo.m_BotTexture);
            G.QuadsBegin();
            G.SetColor(1, 1, 1, 1);
            this.SelectSprite(C.SPRITE_TEE_BOT_BACKGROUND, 0, 0, 0);
            G.QuadsDraw([BotItem()], 1);
            G.QuadsEnd();
            G.TextureSet(pInfo.m_BotTexture);
            G.QuadsBegin();
            G.SetColor(1, 1, 1, 1);
            this.SelectSprite(C.SPRITE_TEE_BOT_FOREGROUND, 0, 0, 0);
            G.QuadsDraw([BotItem()], 1);
            col(pInfo.m_BotColor);
            this.SelectSprite(C.SPRITE_TEE_BOT_GLOW, 0, 0, 0);
            G.QuadsDraw([BotItem()], 1);
            G.QuadsEnd();
          }
          if (pInfo.m_aTextures[SKINPART_DECORATION].IsValid()) {
            G.TextureSet(pInfo.m_aTextures[2]);
            G.QuadsBegin();
            G.QuadsSetRotation(rot);
            col(pInfo.m_aColors[SKINPART_DECORATION]);
            this.SelectSprite(OutLine ? C.SPRITE_TEE_DECORATION_OUTLINE : C.SPRITE_TEE_DECORATION, 0, 0, 0);
            G.QuadsDraw([BodyItem()], 1);
            G.QuadsEnd();
          }
          G.TextureSet(pInfo.m_aTextures[SKINPART_BODY]);
          G.QuadsBegin();
          G.QuadsSetRotation(rot);
          if (OutLine) {
            G.SetColor(1, 1, 1, 1);
            this.SelectSprite(C.SPRITE_TEE_BODY_OUTLINE, 0, 0, 0);
          } else {
            col(pInfo.m_aColors[SKINPART_BODY]);
            this.SelectSprite(C.SPRITE_TEE_BODY, 0, 0, 0);
          }
          G.QuadsDraw([BodyItem()], 1);
          G.QuadsEnd();
          if (pInfo.m_aTextures[SKINPART_MARKING].IsValid() && !OutLine) {
            const m = pInfo.m_aColors[SKINPART_MARKING];
            G.TextureSet(pInfo.m_aTextures[SKINPART_MARKING]);
            G.QuadsBegin();
            G.QuadsSetRotation(rot);
            G.SetColor(m.r * m.a, m.g * m.a, m.b * m.a, m.a);
            this.SelectSprite(C.SPRITE_TEE_MARKING, 0, 0, 0);
            G.QuadsDraw([BodyItem()], 1);
            G.QuadsEnd();
          }
          if (!OutLine) {
            G.TextureSet(pInfo.m_aTextures[SKINPART_BODY]);
            G.QuadsBegin();
            G.QuadsSetRotation(rot);
            G.SetColor(1, 1, 1, 1);
            for (let t = 0; t < 2; t++) {
              this.SelectSprite(t === 0 ? C.SPRITE_TEE_BODY_SHADOW : C.SPRITE_TEE_BODY_UPPER_OUTLINE, 0, 0, 0);
              G.QuadsDraw([BodyItem()], 1);
            }
            G.QuadsEnd();
          }
          G.TextureSet(pInfo.m_aTextures[SKINPART_EYES]);
          G.QuadsBegin();
          G.QuadsSetRotation(rot);
          if (IsBot) {
            col(pInfo.m_BotColor);
            Emote = EMOTE_SURPRISE;
          } else col(pInfo.m_aColors[SKINPART_EYES]);
          if (p === 1) {
            switch (Emote) {
              case EMOTE_PAIN: this.SelectSprite(C.SPRITE_TEE_EYES_PAIN, 0, 0, 0); break;
              case EMOTE_HAPPY: this.SelectSprite(C.SPRITE_TEE_EYES_HAPPY, 0, 0, 0); break;
              case EMOTE_SURPRISE: this.SelectSprite(C.SPRITE_TEE_EYES_SURPRISE, 0, 0, 0); break;
              case EMOTE_ANGRY: this.SelectSprite(C.SPRITE_TEE_EYES_ANGRY, 0, 0, 0); break;
              default: this.SelectSprite(C.SPRITE_TEE_EYES_NORMAL, 0, 0, 0); break;
            }
            const EyeScale = BaseSize * 0.6;
            const h = Emote === EMOTE_BLINK ? (BaseSize * 0.15) / 2 : EyeScale / 2;
            const ox = Direction.x * 0.125 * BaseSize, oy = (-0.05 + Direction.y * 0.1) * BaseSize;
            G.QuadsDraw([new CQuadItem(BodyPos.x + ox, BodyPos.y + oy, EyeScale, h)], 1);
          }
          G.QuadsEnd();
          if (!OutLine && pInfo.m_HatTexture.IsValid()) {
            G.TextureSet(pInfo.m_HatTexture);
            G.QuadsBegin();
            G.QuadsSetRotation(rot);
            G.SetColor(1, 1, 1, 1);
            const Flag = Direction.x < 0 ? SPRITE_FLAG_FLIP_X : 0;
            switch (pInfo.m_HatSpriteIndex) {
              case 0: this.SelectSprite(C.SPRITE_TEE_HATS_TOP1, Flag, 0, 0); break;
              case 1: this.SelectSprite(C.SPRITE_TEE_HATS_TOP2, Flag, 0, 0); break;
              case 2: this.SelectSprite(C.SPRITE_TEE_HATS_SIDE1, Flag, 0, 0); break;
              case 3: this.SelectSprite(C.SPRITE_TEE_HATS_SIDE2, Flag, 0, 0); break;
            }
            G.QuadsDraw([BodyItem()], 1);
            G.QuadsEnd();
          }
        }
        G.TextureSet(pInfo.m_aTextures[SKINPART_FEET]);
        G.QuadsBegin();
        const pFoot = fi ? pAnim.GetFrontFoot() : pAnim.GetBackFoot();
        const w = BaseSize / 2.1, h = w;
        G.QuadsSetRotation(pFoot.m_Angle * pi * 2);
        if (OutLine) {
          G.SetColor(1, 1, 1, 1);
          this.SelectSprite(C.SPRITE_TEE_FOOT_OUTLINE, 0, 0, 0);
        } else {
          const Indicate = !pInfo.m_GotAirJump && this.m_pConfig.m_ClAirjumpindicator;
          const cs = Indicate ? 0.5 : 1;
          const c = pInfo.m_aColors[SKINPART_FEET];
          G.SetColor(c.r * cs, c.g * cs, c.b * cs, c.a);
          this.SelectSprite(C.SPRITE_TEE_FOOT, 0, 0, 0);
        }
        G.QuadsDraw([new CQuadItem(Position.x + pFoot.m_X * AnimScale, Position.y + pFoot.m_Y * AnimScale, w, h)], 1);
        G.QuadsEnd();
      }
    }
  }

  RenderTeeHand(pInfo: CTeeRenderInfo, CenterPos: vec2, Dir: vec2, AngleOffset: number, PostRotOffset: vec2): void {
    const G = this.Graphics();
    const BaseSize = 15 * (pInfo.m_Size / 64);
    let hx = CenterPos.x + Dir.x, hy = CenterPos.y + Dir.y;
    let Angle = angle(Dir);
    if (Dir.x < 0) Angle -= AngleOffset;
    else Angle += AngleOffset;
    let dyx = -Dir.y, dyy = Dir.x;
    if (Dir.x < 0) {
      dyx = -dyx;
      dyy = -dyy;
    }
    hx += Dir.x * PostRotOffset.x + dyx * PostRotOffset.y;
    hy += Dir.y * PostRotOffset.x + dyy * PostRotOffset.y;
    const Color = pInfo.m_aColors[SKINPART_HANDS];
    G.TextureSet(pInfo.m_aTextures[SKINPART_HANDS]);
    G.QuadsBegin();
    G.SetColor(Color.r, Color.g, Color.b, Color.a);
    G.QuadsSetRotation(Angle);
    this.SelectSprite(C.SPRITE_TEE_HAND_OUTLINE, 0, 0, 0);
    G.QuadsDraw([new CQuadItem(hx, hy, 2 * BaseSize, 2 * BaseSize)], 1);
    this.SelectSprite(C.SPRITE_TEE_HAND, 0, 0, 0);
    G.QuadsDraw([new CQuadItem(hx, hy, 2 * BaseSize, 2 * BaseSize)], 1);
    G.QuadsSetRotation(0);
    G.QuadsEnd();
  }

  static RenderEvalEnvelope(pts: CEnvPoints, Start: number, NumPoints: number, Channels: number, Time: number, pResult: number[]): void {
    const d = pts.d, S = pts.stride;
    const at = (i: number, k: number): number => d[(Start + i) * S + k];
    if (NumPoints === 0) {
      pResult[0] = pResult[1] = pResult[2] = pResult[3] = 0;
      return;
    }
    if (NumPoints === 1) {
      for (let c = 0; c < 4; c++) pResult[c] = fx2f(at(0, EP_VALUES + c));
      return;
    }
    Time = f(f(f(Time) % f(at(NumPoints - 1, EP_TIME) / 1000)) * 1000);
    for (let i = 0; i < NumPoints - 1; i++) {
      if (Time >= at(i, EP_TIME) && Time <= at(i + 1, EP_TIME)) {
        const Delta = at(i + 1, EP_TIME) - at(i, EP_TIME);
        let a = (Time - at(i, EP_TIME)) / Delta;
        switch (at(i, EP_CURVETYPE)) {
          case MI.CURVETYPE_STEP: a = 0; break;
          case MI.CURVETYPE_SMOOTH: a = -2 * a * a * a + 3 * a * a; break;
          case MI.CURVETYPE_SLOW: a = a * a * a; break;
          case MI.CURVETYPE_FAST:
            a = 1 - a;
            a = 1 - a * a * a;
            break;
          case MI.CURVETYPE_BEZIER:
            for (let c = 0; c < Channels; c++) {
              const p0 = { x: at(i, EP_TIME) / 1000, y: fx2f(at(i, EP_VALUES + c)) };
              const p3 = { x: at(i + 1, EP_TIME) / 1000, y: fx2f(at(i + 1, EP_VALUES + c)) };
              const outT = { x: S > EP_OUT_DY ? at(i, EP_OUT_DX + c) / 1000 : 0, y: S > EP_OUT_DY ? fx2f(at(i, EP_OUT_DY + c)) : 0 };
              const inT = { x: S > EP_IN_DY ? -at(i + 1, EP_IN_DX + c) / 1000 : 0, y: S > EP_IN_DY ? -fx2f(at(i + 1, EP_IN_DY + c)) : 0 };
              const p1 = { x: clamp(p0.x + outT.x, p0.x, p3.x), y: p0.y + outT.y };
              const p2 = { x: clamp(p3.x - inT.x, p0.x, p3.x), y: p3.y - inT.y };
              a = clamp(SolveBezier(Time / 1000, p0.x, p1.x, p2.x, p3.x), 0, 1);
              pResult[c] = bezier(p0.y, p1.y, p2.y, p3.y, a);
            }
            return;
          case MI.CURVETYPE_LINEAR: break;
        }
        for (let c = 0; c < Channels; c++) pResult[c] = mix(fx2f(at(i, EP_VALUES + c)), fx2f(at(i + 1, EP_VALUES + c)), a);
        return;
      }
    }
    for (let c = 0; c < 4; c++) pResult[c] = fx2f(at(NumPoints - 1, EP_VALUES + c));
  }

  /** RenderQuads: the quads of a layer (CQuad ints from the map) */
  RenderQuads(pQuads: Int32Array, NumQuads: number, _RenderFlags: number, pfnEval: ENVELOPE_EVAL): void {
    const G = this.Graphics();
    G.QuadsBegin();
    const Conv = 1 / 255;
    const ch = [0, 0, 0, 0];
    for (let i = 0; i < NumQuads; i++) {
      const q = i * MI.QUAD_INTS;
      let r = 1, g = 1, b = 1, a = 1;
      if (pQuads[q + MI.QUAD_COLOR_ENV] >= 0) {
        pfnEval(pQuads[q + MI.QUAD_COLOR_ENV_OFFSET] / 1000, pQuads[q + MI.QUAD_COLOR_ENV], ch);
        [r, g, b, a] = ch;
      }
      const tc: number[] = [];
      for (let k = 0; k < 4; k++) tc.push(fx2f(pQuads[q + MI.QUAD_TEXCOORDS + k * 2]), fx2f(pQuads[q + MI.QUAD_TEXCOORDS + k * 2 + 1]));
      let RepeatU = false, RepeatV = false;
      for (let k = 0; k < 4; k++) {
        if (tc[k * 2] < 0 || tc[k * 2] > 1) RepeatU = true;
        if (tc[k * 2 + 1] < 0 || tc[k * 2 + 1] > 1) RepeatV = true;
      }
      G.WrapMode(RepeatU ? WRAP_REPEAT : WRAP_CLAMP, RepeatV ? WRAP_REPEAT : WRAP_CLAMP);
      G.QuadsSetSubsetFree(tc[0], tc[1], tc[2], tc[3], tc[4], tc[5], tc[6], tc[7]);
      let OffsetX = 0, OffsetY = 0, Rot = 0;
      if (pQuads[q + MI.QUAD_POS_ENV] >= 0) {
        pfnEval(pQuads[q + MI.QUAD_POS_ENV_OFFSET] / 1000, pQuads[q + MI.QUAD_POS_ENV], ch);
        OffsetX = ch[0];
        OffsetY = ch[1];
        Rot = (ch[2] / 360) * pi * 2;
      }
      const arr: CColorVertex[] = [];
      for (let k = 0; k < 4; k++) {
        const c = q + MI.QUAD_COLORS + k * 4;
        const al = pQuads[c + 3] * Conv * a;
        arr.push({ m_Index: k, m_R: pQuads[c] * Conv * r * al, m_G: pQuads[c + 1] * Conv * g * al, m_B: pQuads[c + 2] * Conv * b * al, m_A: al });
      }
      G.SetColorVertex(arr, 4);
      const px: number[] = [], py: number[] = [];
      for (let k = 0; k < 4; k++) {
        px.push(pQuads[q + MI.QUAD_POINTS + k * 2]);
        py.push(pQuads[q + MI.QUAD_POINTS + k * 2 + 1]);
      }
      if (Rot !== 0) {
        const cx = pQuads[q + MI.QUAD_POINTS + 8], cy = pQuads[q + MI.QUAD_POINTS + 9];
        const c = Math.cos(Rot), s = Math.sin(Rot);
        for (let k = 0; k < 4; k++) {
          const x = px[k] - cx, y = py[k] - cy;
          px[k] = Math.trunc(x * c - y * s + cx);
          py[k] = Math.trunc(x * s + y * c + cy);
        }
      }
      G.QuadsDrawFreeform([new CFreeformItem(fx2f(px[0]) + OffsetX, fx2f(py[0]) + OffsetY, fx2f(px[1]) + OffsetX, fx2f(py[1]) + OffsetY,
        fx2f(px[2]) + OffsetX, fx2f(py[2]) + OffsetY, fx2f(px[3]) + OffsetX, fx2f(py[3]) + OffsetY)], 1);
    }
    G.QuadsEnd();
    G.WrapNormal();
  }

  /** RenderTilemap: pTiles are the CTile bytes (index, flags, skip, reserved) */
  RenderTilemap(pTiles: Uint8Array, w: number, h: number, Scale: number, Color: vec4, RenderFlags: number, pfnEval: ENVELOPE_EVAL, ColorEnv: number, ColorEnvOffset: number): void {
    const G = this.Graphics();
    const [ScreenX0, ScreenY0, ScreenX1, ScreenY1] = G.GetScreen();
    let r = 1, g = 1, b = 1, a = 1;
    if (ColorEnv >= 0) {
      const ch = [0, 0, 0, 0];
      pfnEval(ColorEnvOffset / 1000, ColorEnv, ch);
      [r, g, b, a] = ch;
    }
    G.QuadsBegin();
    const Alpha = Color.a * a;
    G.SetColor(Color.r * r * Alpha, Color.g * g * Alpha, Color.b * b * Alpha, Alpha);
    const StartY = Math.trunc(ScreenY0 / Scale) - 1, StartX = Math.trunc(ScreenX0 / Scale) - 1;
    const EndY = Math.trunc(ScreenY1 / Scale) + 1, EndX = Math.trunc(ScreenX1 / Scale) + 1;
    for (let y = StartY; y < EndY; y++)
      for (let x = StartX; x < EndX; x++) {
        let mx = x, my = y;
        if (RenderFlags & TILERENDERFLAG_EXTEND) {
          if (mx < 0) mx = 0;
          if (mx >= w) mx = w - 1;
          if (my < 0) my = 0;
          if (my >= h) my = h - 1;
        } else if (mx < 0 || mx >= w || my < 0 || my >= h) continue;
        const c = (mx + my * w) * 4;
        const Index = pTiles[c];
        if (Index) {
          const Flags = pTiles[c + 1];
          let Render = false;
          if (Flags & MI.TILEFLAG_OPAQUE && Color.a * a > 254 / 255) {
            if (RenderFlags & LAYERRENDERFLAG_OPAQUE) Render = true;
          } else if (RenderFlags & LAYERRENDERFLAG_TRANSPARENT) Render = true;
          if (Render) {
            let x0 = 0, y0 = 0, x1 = 1, y1 = 0, x2 = 1, y2 = 1, x3 = 0, y3 = 1;
            if (Flags & MI.TILEFLAG_VFLIP) {
              x0 = x2;
              x1 = x3;
              x2 = x3;
              x3 = x0;
            }
            if (Flags & MI.TILEFLAG_HFLIP) {
              y0 = y3;
              y2 = y1;
              y3 = y1;
              y1 = y0;
            }
            if (Flags & MI.TILEFLAG_ROTATE) {
              let Tmp = x0;
              x0 = x3; x3 = x2; x2 = x1; x1 = Tmp;
              Tmp = y0;
              y0 = y3; y3 = y2; y2 = y1; y1 = Tmp;
            }
            G.QuadsSetSubsetFree(x0, y0, x1, y1, x2, y2, x3, y3, Index);
            G.QuadsDrawTL([new CQuadItem(x * Scale, y * Scale, Scale, Scale)], 1);
          }
        }
        x += pTiles[c + 2];
      }
    G.QuadsEnd();
    G.MapScreen(ScreenX0, ScreenY0, ScreenX1, ScreenY1);
  }

  static CalcScreenParams(Amount: number, WMax: number, HMax: number, Aspect: number): { w: number; h: number } {
    const fl = Math.sqrt(Amount) / Math.sqrt(Aspect);
    let w = fl * Aspect, h = fl;
    if (w > WMax) {
      w = WMax;
      h = w / Aspect;
    }
    if (h > HMax) {
      h = HMax;
      w = h * Aspect;
    }
    return { w, h };
  }

  MapScreenToWorld(CenterX: number, CenterY: number, ParallaxX: number, ParallaxY: number, OffsetX: number, OffsetY: number, Aspect: number, Zoom: number): number[] {
    let { w: Width, h: Height } = CRenderTools.CalcScreenParams(1150 * 1000, 1500, 1050, Aspect);
    CenterX *= ParallaxX;
    CenterY *= ParallaxY;
    Width *= Zoom;
    Height *= Zoom;
    const p0 = OffsetX + CenterX - Width / 2, p1 = OffsetY + CenterY - Height / 2;
    return [p0, p1, p0 + Width, p1 + Height];
  }

  /** MapScreenToGroup: pGroup is the group item's offset in the map's items */
  MapScreenToGroup(CenterX: number, CenterY: number, items: Int32Array, pGroup: number, Zoom: number): void {
    const p = this.MapScreenToWorld(CenterX, CenterY, items[pGroup + MI.GROUP_PARALLAX_X] / 100, items[pGroup + MI.GROUP_PARALLAX_Y] / 100,
      items[pGroup + MI.GROUP_OFFSET_X], items[pGroup + MI.GROUP_OFFSET_Y], this.Graphics().ScreenAspect(), Zoom);
    this.Graphics().MapScreen(p[0], p[1], p[2], p[3]);
  }

  DrawClientID(pTextRender: CTextRender, pCursor: CTextCursor, ID: number, BgColor: vec4 = v4(1, 1, 1, 0.5), TextColor: vec4 = v4(0.1, 0.1, 0.1, 1)): void {
    if (!this.m_pConfig.m_ClShowUserId) return;
    const aBuff = str_format(4, '%2d ', ID);
    const LinebaseY = pTextRender.TextGetLineBaseY(pCursor);
    const [, ScreenY0, , ScreenY1] = this.Graphics().GetScreen();
    const FakeToScreenY = this.Graphics().ScreenHeight() / (ScreenY1 - ScreenY0);
    const FontSize = Math.trunc(pCursor.m_FontSize * FakeToScreenY) / FakeToScreenY;
    const Width = 1.4 * FontSize;
    let OffsetY = 0;
    if (pCursor.m_Flags & (TEXTFLAG_ALLOW_NEWLINE | TEXTFLAG_STOP_AT_END) && pCursor.m_LineWidth > 0 && pCursor.m_LineWidth + pCursor.m_StartX < pCursor.m_X + Width) {
      pCursor.m_X = pCursor.m_StartX;
      pCursor.m_Y += FontSize;
      pCursor.m_LineCount += 1;
      OffsetY += FontSize;
    }
    if (pCursor.m_MaxLines > 0 && pCursor.m_LineCount > pCursor.m_MaxLines) return;
    const Rect = new CUIRect(pCursor.m_X, LinebaseY - FontSize + 0.025 * FontSize + OffsetY, Width, FontSize);
    this.DrawRoundRect(Rect, BgColor, 0.25 * FontSize);
    const PrevX = pCursor.m_X;
    pCursor.m_X += (ID < 10 ? 0.04 : 0) * FontSize;
    pTextRender.TextShadowed(pCursor, aBuff, -1, new vec2(0, 0), v4(0, 0, 0, 0), TextColor);
    pCursor.m_X = PrevX + Rect.w + 0.2 * FontSize;
  }

  GetClientIdRectSize(FontSize: number): number {
    if (!this.m_pConfig.m_ClShowUserId) return 0;
    return 1.4 * FontSize + 0.2 * FontSize;
  }
}

export { CTextCursor };
