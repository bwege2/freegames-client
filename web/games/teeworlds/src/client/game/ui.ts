// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: game/client/ui.h and ui.cpp of Teeworlds 0.7.5 in TypeScript. The ids of the widgets are objects
// (or strings) compared by identity, as the original compares addresses.
import { clamp } from '../../base/vmath.ts';
import type { CConfig } from '../../generated/config.ts';
import type { CGraphics } from '../engine/graphics.ts';
import type { CTextRender } from '../engine/text.ts';

export type UIID = unknown;

export class CUIRect {
  x: number;
  y: number;
  w: number;
  h: number;
  constructor(x = 0, y = 0, w = 0, h = 0) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }
  copy(): CUIRect { return new CUIRect(this.x, this.y, this.w, this.h); }
  private static set(p: CUIRect | null, x: number, y: number, w: number, h: number): void {
    if (!p) return;
    p.x = x;
    p.y = y;
    p.w = w;
    p.h = h;
  }
  HSplitMid(pTop: CUIRect | null, pBottom: CUIRect | null, Spacing = 0): void {
    const r = this.copy();
    const Cut = r.h / 2, HalfSpacing = Spacing / 2;
    CUIRect.set(pTop, r.x, r.y, r.w, Cut - HalfSpacing);
    CUIRect.set(pBottom, r.x, r.y + Cut + HalfSpacing, r.w, r.h - Cut - HalfSpacing);
  }
  HSplitTop(Cut: number, pTop: CUIRect | null, pBottom: CUIRect | null): void {
    const r = this.copy();
    CUIRect.set(pTop, r.x, r.y, r.w, Cut);
    CUIRect.set(pBottom, r.x, r.y + Cut, r.w, r.h - Cut);
  }
  HSplitBottom(Cut: number, pTop: CUIRect | null, pBottom: CUIRect | null): void {
    const r = this.copy();
    CUIRect.set(pTop, r.x, r.y, r.w, r.h - Cut);
    CUIRect.set(pBottom, r.x, r.y + r.h - Cut, r.w, Cut);
  }
  VSplitMid(pLeft: CUIRect | null, pRight: CUIRect | null, Spacing = 0): void {
    const r = this.copy();
    const Cut = r.w / 2, HalfSpacing = Spacing / 2;
    CUIRect.set(pLeft, r.x, r.y, Cut - HalfSpacing, r.h);
    CUIRect.set(pRight, r.x + Cut + HalfSpacing, r.y, r.w - Cut - HalfSpacing, r.h);
  }
  VSplitLeft(Cut: number, pLeft: CUIRect | null, pRight: CUIRect | null): void {
    const r = this.copy();
    CUIRect.set(pLeft, r.x, r.y, Cut, r.h);
    CUIRect.set(pRight, r.x + Cut, r.y, r.w - Cut, r.h);
  }
  VSplitRight(Cut: number, pLeft: CUIRect | null, pRight: CUIRect | null): void {
    const r = this.copy();
    CUIRect.set(pLeft, r.x, r.y, r.w - Cut, r.h);
    CUIRect.set(pRight, r.x + r.w - Cut, r.y, Cut, r.h);
  }
  Margin(Cut: number, pOtherRect: CUIRect): void {
    const r = this.copy();
    CUIRect.set(pOtherRect, r.x + Cut, r.y + Cut, r.w - 2 * Cut, r.h - 2 * Cut);
  }
  VMargin(Cut: number, pOtherRect: CUIRect): void {
    const r = this.copy();
    CUIRect.set(pOtherRect, r.x + Cut, r.y, r.w - 2 * Cut, r.h);
  }
  HMargin(Cut: number, pOtherRect: CUIRect): void {
    const r = this.copy();
    CUIRect.set(pOtherRect, r.x, r.y + Cut, r.w, r.h - 2 * Cut);
  }
}

export const CORNER_TL = 1, CORNER_TR = 2, CORNER_BL = 4, CORNER_BR = 8, CORNER_ITL = 16, CORNER_ITR = 32, CORNER_IBL = 64, CORNER_IBR = 128;
export const CORNER_T = CORNER_TL | CORNER_TR, CORNER_B = CORNER_BL | CORNER_BR, CORNER_R = CORNER_TR | CORNER_BR, CORNER_L = CORNER_TL | CORNER_BL;
export const CORNER_IT = CORNER_ITL | CORNER_ITR, CORNER_IB = CORNER_IBL | CORNER_IBR, CORNER_IR = CORNER_ITR | CORNER_IBR, CORNER_IL = CORNER_ITL | CORNER_IBL;
export const CORNER_ALL = CORNER_T | CORNER_B, CORNER_INV_ALL = CORNER_IT | CORNER_IB;
export const ALIGN_LEFT = 0, ALIGN_CENTER = 1, ALIGN_RIGHT = 2;

const MAX_CLIP_NESTING_DEPTH = 16;

export class CUI {
  private m_pHotItem: UIID = null;
  private m_pActiveItem: UIID = null;
  private m_pLastActiveItem: UIID = null;
  private m_pBecommingHotItem: UIID = null;
  private m_ActiveItemValid = false;
  private m_MouseX = 0;
  private m_MouseY = 0;
  private m_MouseWorldX = 0;
  private m_MouseWorldY = 0;
  private m_MouseButtons = 0;
  private m_LastMouseButtons = 0;
  private m_Screen = new CUIRect(0, 0, 848, 480);
  private m_aClips: CUIRect[] = [];
  private m_pConfig!: CConfig;
  private m_pGraphics!: CGraphics;
  private m_pTextRender!: CTextRender;
  private static ButtonUsed = 0;

  Init(pConfig: CConfig, pGraphics: CGraphics, pTextRender: CTextRender): void {
    this.m_pConfig = pConfig;
    this.m_pGraphics = pGraphics;
    this.m_pTextRender = pTextRender;
  }
  Config(): CConfig { return this.m_pConfig; }
  Graphics(): CGraphics { return this.m_pGraphics; }
  TextRender(): CTextRender { return this.m_pTextRender; }

  Update(Mx: number, My: number, Mwx: number, Mwy: number, Buttons: number): number {
    this.m_MouseX = Mx;
    this.m_MouseY = My;
    this.m_MouseWorldX = Mwx;
    this.m_MouseWorldY = Mwy;
    this.m_LastMouseButtons = this.m_MouseButtons;
    this.m_MouseButtons = Buttons;
    this.m_pHotItem = this.m_pBecommingHotItem;
    if (this.m_pActiveItem) this.m_pHotItem = this.m_pActiveItem;
    this.m_pBecommingHotItem = null;
    return 0;
  }
  MouseX(): number { return this.m_MouseX; }
  MouseY(): number { return this.m_MouseY; }
  MouseWorldX(): number { return this.m_MouseWorldX; }
  MouseWorldY(): number { return this.m_MouseWorldY; }
  MouseButton(Index: number): number { return (this.m_MouseButtons >> Index) & 1; }
  MouseButtonClicked(Index: number): boolean { return !!this.MouseButton(Index) && !((this.m_LastMouseButtons >> Index) & 1); }
  SetHotItem(pID: UIID): void { this.m_pBecommingHotItem = pID; }
  SetActiveItem(pID: UIID): void {
    this.m_ActiveItemValid = true;
    this.m_pActiveItem = pID;
    if (pID) this.m_pLastActiveItem = pID;
  }
  CheckActiveItem(pID: UIID): boolean {
    if (this.m_pActiveItem === pID) {
      this.m_ActiveItemValid = true;
      return true;
    }
    return false;
  }
  ClearLastActiveItem(): void { this.m_pLastActiveItem = null; }
  HotItem(): UIID { return this.m_pHotItem; }
  NextHotItem(): UIID { return this.m_pBecommingHotItem; }
  GetActiveItem(): UIID { return this.m_pActiveItem; }
  LastActiveItem(): UIID { return this.m_pLastActiveItem; }
  StartCheck(): void { this.m_ActiveItemValid = false; }
  FinishCheck(): void { if (!this.m_ActiveItemValid) this.SetActiveItem(null); }

  MouseInside(r: CUIRect): boolean {
    return this.m_MouseX >= r.x && this.m_MouseX < r.x + r.w && this.m_MouseY >= r.y && this.m_MouseY < r.y + r.h;
  }
  MouseInsideClip(): boolean { return !this.IsClipped() || this.MouseInside(this.ClipArea()); }
  ConvertMouseMove(p: { x: number; y: number }): void {
    const Fac = this.m_pConfig.m_UiMousesens / this.m_pConfig.m_InpMousesens;
    p.x *= Fac;
    p.y *= Fac;
  }
  Screen(): CUIRect {
    const Aspect = this.Graphics().ScreenAspect();
    const h = 600;
    this.m_Screen.w = Aspect * h;
    this.m_Screen.h = h;
    return this.m_Screen;
  }
  PixelSize(): number { return this.Screen().w / this.Graphics().ScreenWidth(); }

  ClipEnable(pRect: CUIRect): void {
    if (this.IsClipped()) {
      if (this.m_aClips.length >= MAX_CLIP_NESTING_DEPTH) throw new Error('max clip nesting depth exceeded');
      const pOldRect = this.ClipArea();
      const x = Math.max(pRect.x, pOldRect.x), y = Math.max(pRect.y, pOldRect.y);
      this.m_aClips.push(new CUIRect(x, y, Math.min(pRect.x + pRect.w, pOldRect.x + pOldRect.w) - pRect.x, Math.min(pRect.y + pRect.h, pOldRect.y + pOldRect.h) - pRect.y));
    } else this.m_aClips.push(pRect.copy());
    this.UpdateClipping();
  }
  ClipDisable(): void {
    this.m_aClips.pop();
    this.UpdateClipping();
  }
  ClipArea(): CUIRect { return this.m_aClips[this.m_aClips.length - 1]; }
  IsClipped(): boolean { return this.m_aClips.length > 0; }
  private UpdateClipping(): void {
    if (this.IsClipped()) {
      const pRect = this.ClipArea();
      const XScale = this.Graphics().ScreenWidth() / this.Screen().w;
      const YScale = this.Graphics().ScreenHeight() / this.Screen().h;
      this.Graphics().ClipEnable(Math.trunc(pRect.x * XScale), Math.trunc(pRect.y * YScale), Math.trunc(pRect.w * XScale), Math.trunc(pRect.h * YScale));
    } else this.Graphics().ClipDisable();
  }

  DoButtonLogic(pID: UIID, pRect: CUIRect): number {
    let ReturnValue = 0;
    const Inside = this.MouseInside(pRect) && this.MouseInsideClip();
    if (this.CheckActiveItem(pID)) {
      if (!this.MouseButton(CUI.ButtonUsed)) {
        if (Inside) ReturnValue = 1 + CUI.ButtonUsed;
        this.SetActiveItem(null);
      }
    } else if (this.HotItem() === pID) {
      if (this.MouseButton(0)) {
        this.SetActiveItem(pID);
        CUI.ButtonUsed = 0;
      }
      if (this.MouseButton(1)) {
        this.SetActiveItem(pID);
        CUI.ButtonUsed = 1;
      }
    }
    if (Inside) this.SetHotItem(pID);
    return ReturnValue;
  }

  /** DoPickerLogic: the position in the rect (null if the picker is not active) */
  DoPickerLogic(pID: UIID, pRect: CUIRect): { x: number; y: number } | null {
    const Inside = this.MouseInside(pRect);
    if (this.CheckActiveItem(pID)) {
      if (!this.MouseButton(0)) this.SetActiveItem(null);
    } else if (this.HotItem() === pID) {
      if (this.MouseButton(0)) this.SetActiveItem(pID);
    }
    if (Inside) this.SetHotItem(pID);
    if (!this.CheckActiveItem(pID)) return null;
    return { x: clamp(this.m_MouseX - pRect.x, 0, pRect.w), y: clamp(this.m_MouseY - pRect.y, 0, pRect.h) };
  }

  DoLabel(r: CUIRect, pText: string, Size: number, Align: number, LineWidth = -1, MultiLine = true): void {
    switch (Align) {
      case ALIGN_CENTER: {
        const tw = this.TextRender().TextWidth(0, Size, pText, -1, LineWidth);
        this.TextRender().Text(0, r.x + r.w / 2 - tw / 2, r.y - Size / 10, Size, pText, LineWidth, MultiLine);
        break;
      }
      case ALIGN_LEFT:
        this.TextRender().Text(0, r.x, r.y - Size / 10, Size, pText, LineWidth, MultiLine);
        break;
      case ALIGN_RIGHT: {
        const tw = this.TextRender().TextWidth(0, Size, pText, -1, LineWidth);
        this.TextRender().Text(0, r.x + r.w - tw, r.y - Size / 10, Size, pText, LineWidth, MultiLine);
        break;
      }
    }
  }
}
