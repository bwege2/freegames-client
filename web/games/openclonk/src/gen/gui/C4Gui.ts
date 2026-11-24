// @ts-nocheck
// OpenClonk 36de799: src/gui/C4Gui.cpp, src/gui/C4Gui.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { C4KeyCB$Button, C4KeyCB$C4ChatInputDialog, C4KeyCB$C4FileSelDlg, C4KeyCB$C4StartupAboutDlg, C4KeyCB$C4StartupMainDlg, C4KeyCB$C4StartupOptionsDlg, C4KeyCB$C4StartupPlrSelDlg, C4KeyCB$C4StartupScenSelDlg, C4KeyCB$CheckBox, C4KeyCB$ComboBox, C4KeyCB$ContextButton, C4KeyCB$Control, C4KeyCB$Dialog, C4KeyCB$Edit, C4KeyCB$ListBox, C4KeyCB$ListItem, C4KeyCB$ListItem$2, C4KeyCB$MessageDialog, C4KeyCB$RenameEdit, C4KeyCB$Tabular, C4KeyCBEx$C4ChatInputDialog$b, C4KeyCBEx$C4StartupMainDlg$b, C4KeyCBEx$Dialog$b, C4KeyCBExPassKey$Edit$i32, C4KeyCBPassKey$C4ChatInputDialog, C4KeyCBPassKey$Dialog, C4KeyCBPassKey$KeySelDialog } from './C4KeyboardInput.ts';
import { C4Window } from '../platform/C4Window.ts';
import { $spawn } from '../../rt/coro.ts';
import { gl$glClear } from '../../rt/gl.ts';
import { $u64n, ftoi32 } from '../../rt/int.ts';
import { c$memmove, c$strlen, c$toupper } from '../../rt/libc.ts';
import { $padd, $rd, $wr, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $max, $min, $mixin, $throw, $vpush, StdString, std_sort } from '../../rt/std.ts';

export class DlgCallback$ClientListItem$2 {

  $clone() { return new DlgCallback$ClientListItem$2().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class DlgCallback$ScriptPlayersListItem {

  $clone() { return new DlgCallback$ScriptPlayersListItem().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class DlgCallback$C4StartupPlrSelDlg {

  $clone() { return new DlgCallback$C4StartupPlrSelDlg().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class MenuHandler {

  $clone() { return new MenuHandler().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ContextHandler {
  iRefs = 0;

  Ref() {
    this.iRefs = this.iRefs + 1 | 0;
  }

  DeRef() {
    if (!((this.iRefs = this.iRefs - 1 | 0) !== 0)) {
      $delete(this);
    }
  }

  $clone() { return new ContextHandler().$assign(this); }
  $assign(o) {
    this.iRefs = o.iRefs;
    return this;
  }
}

export class BaseCallbackHandler {
  iRefs = 0;

  Ref() {
    this.iRefs = this.iRefs + 1 | 0;
  }

  DeRef() {
    if (!((this.iRefs = this.iRefs - 1 | 0) !== 0)) {
      $delete(this);
    }
  }

  $clone() { return new BaseCallbackHandler().$assign(this); }
  $assign(o) {
    this.iRefs = o.iRefs;
    return this;
  }
}

export class DynBarFacet {
  fctBegin = new $.C4Facet().init$v();
  fctMiddle = new $.C4Facet().init$v();
  fctEnd = new $.C4Facet().init$v();

  SetHorizontal$rC4Surface$i32$i32(rBySfc, iHeight = 0, iBorderWidth = 0) {
    if (iHeight === 0) {
      iHeight = rBySfc.Hgt;
    }
    if (iBorderWidth === 0) {
      iBorderWidth = iHeight;
    }
    this.fctBegin.Set$pC4Surface$f32$f32$f32$f32(rBySfc, Math.fround(0), Math.fround(0), Math.fround(iBorderWidth), Math.fround(iHeight));
    this.fctMiddle.Set$pC4Surface$f32$f32$f32$f32(rBySfc, Math.fround(iBorderWidth), Math.fround(0), Math.fround(rBySfc.Wdt - Math.imul(2, iBorderWidth) | 0), Math.fround(iHeight));
    this.fctEnd.Set$pC4Surface$f32$f32$f32$f32(rBySfc, Math.fround(rBySfc.Wdt - iBorderWidth | 0), Math.fround(0), Math.fround(iBorderWidth), Math.fround(iHeight));
  }

  SetHorizontal$rC4Facet$i32(rByFct, iBorderWidth = 0) {
    if (iBorderWidth === 0) {
      iBorderWidth = ftoi32(rByFct.Hgt);
    }
    this.fctBegin.Set$pC4Surface$f32$f32$f32$f32(rByFct.Surface, rByFct.X, rByFct.Y, Math.fround(iBorderWidth), rByFct.Hgt);
    this.fctMiddle.Set$pC4Surface$f32$f32$f32$f32(rByFct.Surface, rByFct.Hgt, rByFct.X, Math.fround(Math.fround(rByFct.Y + rByFct.Wdt) - Math.fround(Math.imul(2, iBorderWidth))), rByFct.Hgt);
    this.fctEnd.Set$pC4Surface$f32$f32$f32$f32(rByFct.Surface, Math.fround(Math.fround(rByFct.X + rByFct.Wdt) - Math.fround(iBorderWidth)), rByFct.Y, Math.fround(iBorderWidth), rByFct.Hgt);
  }

  Clear() {
    $.C4Facet.prototype.Default.call(this.fctBegin);
    $.C4Facet.prototype.Default.call(this.fctMiddle);
    $.C4Facet.prototype.Default.call(this.fctEnd);
  }

  None() {
    this.fctBegin = new $.C4Facet().init$v();
    this.fctMiddle = new $.C4Facet().init$v();
    this.fctEnd = new $.C4Facet().init$v();
    return this;
  }

  $clone() { return new DynBarFacet().$assign(this); }
  $assign(o) {
    this.fctBegin.$assign(o.fctBegin);
    this.fctMiddle.$assign(o.fctMiddle);
    this.fctEnd.$assign(o.fctEnd);
    return this;
  }
}

export class ScrollBarFacets {
  barScroll = new DynBarFacet().None();
  fctScrollDTop = new $.C4Facet().init$v();
  fctScrollPin = new $.C4Facet().init$v();
  fctScrollDBottom = new $.C4Facet().init$v();

  Set(rByFct, iPinIndex = 0) {
    this.barScroll.fctBegin.Set$pC4Surface$f32$f32$f32$f32(rByFct.Surface, Math.fround(0), Math.fround(0), Math.fround(16), Math.fround(16));
    this.barScroll.fctMiddle.Set$pC4Surface$f32$f32$f32$f32(rByFct.Surface, Math.fround(0), Math.fround(16), Math.fround(16), Math.fround(16));
    this.barScroll.fctEnd.Set$pC4Surface$f32$f32$f32$f32(rByFct.Surface, Math.fround(0), Math.fround(32), Math.fround(16), Math.fround(16));
    this.fctScrollDTop.Set$pC4Surface$f32$f32$f32$f32(rByFct.Surface, Math.fround(16), Math.fround(0), Math.fround(16), Math.fround(16));
    if (iPinIndex !== 0) {
      this.fctScrollPin.Set$pC4Surface$f32$f32$f32$f32(rByFct.Surface, Math.fround(32), Math.fround(Math.imul(16, iPinIndex - 1 | 0)), Math.fround(16), Math.fround(16));
    } else {
      this.fctScrollPin.Set$pC4Surface$f32$f32$f32$f32(rByFct.Surface, Math.fround(16), Math.fround(16), Math.fround(16), Math.fround(16));
    }
    this.fctScrollDBottom.Set$pC4Surface$f32$f32$f32$f32(rByFct.Surface, Math.fround(16), Math.fround(32), Math.fround(16), Math.fround(16));
  }

  Clear() {
    this.barScroll.Clear();
    $.C4Facet.prototype.Default.call(this.fctScrollDTop);
    $.C4Facet.prototype.Default.call(this.fctScrollPin);
    $.C4Facet.prototype.Default.call(this.fctScrollDBottom);
  }

  None() {
    this.barScroll = new DynBarFacet().None();
    this.fctScrollDTop = new $.C4Facet().init$v();
    this.fctScrollPin = new $.C4Facet().init$v();
    this.fctScrollDBottom = new $.C4Facet().init$v();
    return this;
  }

  $clone() { return new ScrollBarFacets().$assign(this); }
  $assign(o) {
    this.barScroll.$assign(o.barScroll);
    this.fctScrollDTop.$assign(o.fctScrollDTop);
    this.fctScrollPin.$assign(o.fctScrollPin);
    this.fctScrollDBottom.$assign(o.fctScrollDBottom);
    return this;
  }
}

export class Element {
  ToolTip = new $.StdStrBuf();
  is_immediate_tooltip = false;
  pParent = null;
  pPrev = null;
  pNext = null;
  pDragTarget = null;
  iDragX = 0;
  iDragY = 0;
  fDragging = false;
  pContextHandler = null;
  fVisible = true;
  rcBounds = new $.C4Rect();

  Draw$rC4TargetFacet(cgo) {
    this.DrawElement(cgo);
  }

  DrawElement(_cgo) {
  }

  RemoveElement(pChild) {
    if (this.pParent != null) {
      this.pParent.RemoveElement(pChild);
    } else if (this !== Screen.GetScreenS()) {
      if (!this.IsMenu()) {
        Screen.GetScreenS().RemoveElement(pChild);
      }
    }
  }

  UpdateSize() {
    this.UpdateOwnPos();
    if (this.pParent != null) {
      this.pParent.ElementSizeChanged(this);
    }
  }

  UpdatePos() {
    this.UpdateOwnPos();
    if (this.pParent != null) {
      this.pParent.ElementPosChanged(this);
    }
  }

  Draw3DFrame(cgo, _fUp = false, _iIndent = 1, byAlpha = 79, fDrawTop = true, iTopOff = 0, fDrawLeft = true, iLeftOff = 0) {
    let dwAlpha = (byAlpha << 24 | 0) >>> 0;
    let x0 = ftoi32(Math.fround(Math.fround(cgo.TargetX + Math.fround(this.rcBounds.x)) + Math.fround(iLeftOff)));
    let y0 = ftoi32(Math.fround(Math.fround(cgo.TargetY + Math.fround(this.rcBounds.y)) + Math.fround(iTopOff)));
    let x1 = ftoi32(Math.fround(Math.fround(Math.fround(cgo.TargetX + Math.fround(this.rcBounds.x)) + Math.fround(this.rcBounds.Wdt)) - Math.fround(1)));
    let y1 = ftoi32(Math.fround(Math.fround(Math.fround(cgo.TargetY + Math.fround(this.rcBounds.y)) + Math.fround(this.rcBounds.Hgt)) - Math.fround(1)));
    if (fDrawTop) {
      $.pDraw.DrawLineDw(cgo.Surface, Math.fround(x0), Math.fround(y0), Math.fround(x1), Math.fround(y0), (0x772200 | dwAlpha) >>> 0);
    }
    if (fDrawLeft) {
      $.pDraw.DrawLineDw(cgo.Surface, Math.fround(x0), Math.fround(y0), Math.fround(x0), Math.fround(y1), (0x772200 | dwAlpha) >>> 0);
    }
    if (fDrawTop) {
      $.pDraw.DrawLineDw(cgo.Surface, Math.fround(x0 + 1 | 0), Math.fround(y0 + 1 | 0), Math.fround(x1 - 1 | 0), Math.fround(y0 + 1 | 0), (0x331100 | dwAlpha) >>> 0);
    }
    if (fDrawLeft) {
      $.pDraw.DrawLineDw(cgo.Surface, Math.fround(x0 + 1 | 0), Math.fround(y0 + 1 | 0), Math.fround(x0 + 1 | 0), Math.fround(y1 - 1 | 0), (0x331100 | dwAlpha) >>> 0);
    }
    $.pDraw.DrawLineDw(cgo.Surface, Math.fround(x0), Math.fround(y1), Math.fround(x1), Math.fround(y1), (0xaa4400 | dwAlpha) >>> 0);
    $.pDraw.DrawLineDw(cgo.Surface, Math.fround(x1), Math.fround(y0), Math.fround(x1), Math.fround(y1), (0xaa4400 | dwAlpha) >>> 0);
    $.pDraw.DrawLineDw(cgo.Surface, Math.fround(x0 + 1 | 0), Math.fround(y1 - 1 | 0), Math.fround(x1 - 1 | 0), Math.fround(y1 - 1 | 0), (0x772200 | dwAlpha) >>> 0);
    $.pDraw.DrawLineDw(cgo.Surface, Math.fround(x1 - 1 | 0), Math.fround(y0 + 1 | 0), Math.fround(x1 - 1 | 0), Math.fround(y1 - 1 | 0), (0x772200 | dwAlpha) >>> 0);
  }

  DrawBar(cgo, rFacets) {
    if (Math.fround(this.rcBounds.Hgt) === rFacets.fctMiddle.Hgt) {
      let x0 = ftoi32(Math.fround(cgo.TargetX + Math.fround(this.rcBounds.x)));
      let y0 = ftoi32(Math.fround(cgo.TargetY + Math.fround(this.rcBounds.y)));
      let iX = ftoi32(rFacets.fctBegin.Wdt);
      let w = ftoi32(rFacets.fctMiddle.Wdt);
      let wLeft = ftoi32(rFacets.fctBegin.Wdt);
      let wRight = ftoi32(rFacets.fctEnd.Wdt);
      let iRightShowLength = wRight / 3 | 0;
      let fOverflow = wLeft > this.rcBounds.Wdt;
      if (fOverflow) {
        rFacets.fctBegin.Wdt = Math.fround(this.rcBounds.Wdt);
      }
      rFacets.fctBegin.Draw$pC4Surface$f32$f32$i32$i32(cgo.Surface, Math.fround(x0), Math.fround(y0));
      if (fOverflow) {
        rFacets.fctBegin.Wdt = Math.fround(wLeft);
      }
      while (iX < (this.rcBounds.Wdt - iRightShowLength | 0)) {
        let w2 = $min(w, (this.rcBounds.Wdt - iRightShowLength | 0) - iX | 0);
        rFacets.fctMiddle.Wdt = Math.fround(w2);
        rFacets.fctMiddle.Draw$pC4Surface$f32$f32$i32$i32(cgo.Surface, Math.fround(x0 + iX | 0), Math.fround(y0));
        iX = iX + w | 0;
      }
      rFacets.fctMiddle.Wdt = Math.fround(w);
      fOverflow = wRight > this.rcBounds.Wdt;
      if (fOverflow) {
        rFacets.fctEnd.X = Math.fround(rFacets.fctEnd.X + Math.fround(wRight - this.rcBounds.Wdt | 0));
        rFacets.fctEnd.Wdt = Math.fround(this.rcBounds.Wdt);
      }
      rFacets.fctEnd.Draw$pC4Surface$f32$f32$i32$i32(cgo.Surface, Math.fround(Math.fround(x0 + this.rcBounds.Wdt | 0) - rFacets.fctEnd.Wdt), Math.fround(y0));
      if (fOverflow) {
        rFacets.fctEnd.X = Math.fround(rFacets.fctEnd.X - Math.fround(wRight - this.rcBounds.Wdt | 0));
        rFacets.fctEnd.Wdt = Math.fround(wRight);
      }
    } else {
      let fZoom = Math.fround(Math.fround(this.rcBounds.Hgt) / rFacets.fctMiddle.Hgt);
      let x0 = ftoi32(Math.fround(cgo.TargetX + Math.fround(this.rcBounds.x)));
      let y0 = ftoi32(Math.fround(cgo.TargetY + Math.fround(this.rcBounds.y)));
      let iX = ftoi32(Math.fround(fZoom * rFacets.fctBegin.Wdt));
      let w = ftoi32(Math.fround(fZoom * rFacets.fctMiddle.Wdt));
      let wOld = ftoi32(rFacets.fctMiddle.Wdt);
      let iRightShowLength = ftoi32(Math.fround(rFacets.fctEnd.Wdt / Math.fround(3)));
      rFacets.fctBegin.DrawX(cgo.Surface, Math.fround(x0), Math.fround(y0), Math.fround(ftoi32(Math.fround(fZoom * rFacets.fctBegin.Wdt))), Math.fround(this.rcBounds.Hgt));
      while (Math.fround(iX) < Math.fround(Math.fround(this.rcBounds.Wdt) - Math.fround(fZoom * Math.fround(iRightShowLength)))) {
        let w2 = $min(w, (this.rcBounds.Wdt - ftoi32(Math.fround(fZoom * Math.fround(iRightShowLength))) | 0) - iX | 0);
        rFacets.fctMiddle.Wdt = Math.fround(Math.trunc(Math.fround(Math.fround(w2) / fZoom)));
        rFacets.fctMiddle.DrawX(cgo.Surface, Math.fround(x0 + iX | 0), Math.fround(y0), Math.fround(w2), Math.fround(this.rcBounds.Hgt));
        iX = iX + w | 0;
      }
      rFacets.fctMiddle.Wdt = Math.fround(wOld);
      rFacets.fctEnd.DrawX(cgo.Surface, Math.fround((x0 + this.rcBounds.Wdt | 0) - ftoi32(Math.fround(fZoom * rFacets.fctEnd.Wdt)) | 0), Math.fround(y0), Math.fround(ftoi32(Math.fround(fZoom * rFacets.fctEnd.Wdt))), Math.fround(this.rcBounds.Hgt));
    }
  }

  DrawVBar(cgo, rFacets) {
    let trf = new $.C4DrawTransform().init$i32(1);
    this.DrawHVBar(cgo, rFacets, trf, this.rcBounds.Hgt);
  }

  DrawHBarByVGfx(cgo, rFacets) {
    let trf = new $.C4DrawTransform().init$v();
    let fOffX = Math.fround(Math.fround(cgo.TargetX + Math.fround(this.rcBounds.x)) + Math.fround(this.rcBounds.Hgt / 2 | 0));
    let fOffY = Math.fround(Math.fround(cgo.TargetY + Math.fround(this.rcBounds.y)) + Math.fround(this.rcBounds.Hgt / 2 | 0));
    trf.SetRotate(-90, fOffX, fOffY);
    this.DrawHVBar(cgo, rFacets, trf, this.rcBounds.Wdt);
  }

  DrawHVBar(cgo, rFacets, trf, iMiddleLength) {
    let y0 = ftoi32(Math.fround(cgo.TargetY + Math.fround(this.rcBounds.y)));
    let x0 = ftoi32(Math.fround(cgo.TargetX + Math.fround(this.rcBounds.x)));
    rFacets.fctBegin.DrawT$pC4Surface$f32$f32$i32$i32$pC4DrawTransform(cgo.Surface, Math.fround(x0), Math.fround(y0), 0, 0, trf.op_and());
    let h = ftoi32(rFacets.fctMiddle.Hgt);
    let barHeight = ftoi32(Math.fround(Math.fround(iMiddleLength) - Math.fround(rFacets.fctBegin.Hgt + rFacets.fctEnd.Hgt)));
    for (let iY = 0; iY <= barHeight; iY = iY + h | 0) {
      let h2 = $min(h, barHeight - iY | 0);
      rFacets.fctMiddle.Hgt = Math.fround(h2);
      rFacets.fctMiddle.DrawT$pC4Surface$f32$f32$i32$i32$pC4DrawTransform(cgo.Surface, Math.fround(x0), Math.fround(Math.fround(Math.fround(y0) + rFacets.fctBegin.Hgt) + Math.fround(iY)), 0, 0, trf.op_and());
    }
    rFacets.fctMiddle.Hgt = Math.fround(h);
    rFacets.fctEnd.DrawT$pC4Surface$f32$f32$i32$i32$pC4DrawTransform(cgo.Surface, Math.fround(x0), Math.fround(Math.fround(y0 + iMiddleLength | 0) - rFacets.fctEnd.Hgt), 0, 0, trf.op_and());
  }

  IsOwnPtrElement() {
    return false;
  }

  IsExternalDrawDialog() {
    return false;
  }

  IsMenu() {
    return false;
  }

  GetDialogWindow() {
    return null;
  }

  CheckNameHotkey(_0) {
    return false;
  }

  GetContainer() {
    return this.pParent;
  }

  MouseInput$rCMouse$i32$i32$i32$u32(rMouse, iButton, iX, iY, dwKeyParam) {
    rMouse.pMouseOverElement = this;
    if (this.pDragTarget != null && iButton === 1 && rMouse.pDragElement == null) {
      this.StartDragging(rMouse, iX, iY, dwKeyParam);
    }
    if (iButton === 3) {
      let pCtx = this.GetContextHandler();
      if (pCtx != null) {
        pCtx.OnContext(this, iX, iY);
      }
    }
  }

  MouseEnter(_rMouse) {
  }

  MouseLeave(_rMouse) {
  }

  StartDragging(rMouse, iX, iY, _dwKeyParam) {
    this.fDragging = true;
    this.iDragX = iX;
    this.iDragY = iY;
    rMouse.pDragElement = this;
  }

  DoDragging(_rMouse, iX, iY, _dwKeyParam) {
    if (this.pDragTarget != null && (iX !== this.iDragX || iY !== this.iDragY)) {
      this.pDragTarget.rcBounds.x = this.pDragTarget.rcBounds.x + (iX - this.iDragX | 0) | 0;
      this.pDragTarget.rcBounds.y = this.pDragTarget.rcBounds.y + (iY - this.iDragY | 0) | 0;
      this.pDragTarget.UpdatePos();
    }
  }

  StopDragging(rMouse, iX, iY, dwKeyParam) {
    this.DoDragging(rMouse, iX, iY, dwKeyParam);
  }

  OnHotkey(_cHotkey) {
    return false;
  }

  DoContext$v() {
    if (this.pContextHandler == null) {
      return false;
    }
    return this.pContextHandler.OnContext(this, this.rcBounds.Wdt / 2 | 0, this.rcBounds.Hgt / 2 | 0);
  }

  init() {
    this.ToolTip = new $.StdStrBuf();
    this.is_immediate_tooltip = false;
    this.pParent = null;
    this.pDragTarget = null;
    this.fDragging = false;
    this.pContextHandler = null;
    this.fVisible = true;
    this.rcBounds = new $.C4Rect();
    this.$dyn = Element;
    this.rcBounds.Set$i32$i32$i32$i32(0, 0, 0, 0);
    return this;
  }

  $dtor() {
    if (this.pContextHandler != null) {
      this.pContextHandler.DeRef();
      this.pContextHandler = null;
    }
    if (this.pParent != null) {
      this.pParent.RemoveElement(this);
    } else if (this !== Screen.GetScreenS() && Screen.GetScreenS() != null) {
      Screen.GetScreenS().RemoveElement(this);
    }
  }

  GetParent() {
    return this.pParent;
  }

  GetDlg() {
    if (this.pParent != null) {
      return this.pParent.GetDlg();
    }
    return null;
  }

  GetScreen() {
    if (this.pParent != null) {
      return this.pParent.GetScreen();
    }
    return null;
  }

  IsFocusElement() {
    return null;
  }

  UpdateOwnPos() {
  }

  ScreenPos2ClientPos(riX, riY) {
    let pCont = this.pParent;
    while (pCont != null) {
      pCont.ApplyElementOffset(riX, riY);
      pCont = pCont.GetParent();
    }
    riX.a[riX.o] = riX.a[riX.o] - this.rcBounds.x | 0;
    riY.a[riY.o] = riY.a[riY.o] - this.rcBounds.y | 0;
  }

  ClientPos2ScreenPos(riX, riY) {
    let pCont = this.pParent;
    while (pCont != null) {
      pCont.ApplyInvElementOffset(riX, riY);
      pCont = pCont.GetParent();
    }
    riX.a[riX.o] = riX.a[riX.o] + this.rcBounds.x | 0;
    riY.a[riY.o] = riY.a[riY.o] + this.rcBounds.y | 0;
  }

  SetToolTip(szNewTooltip, is_immediate = false) {
    if (szNewTooltip != null) {
      this.ToolTip.Copy$pi8(szNewTooltip);
    } else {
      this.ToolTip.Clear();
    }
    this.is_immediate_tooltip = is_immediate;
  }

  GetToolTip() {
    return this.pParent == null || !this.ToolTip.isNull() ? this.ToolTip.getData() : this.pParent.GetToolTip();
  }

  GetOwnToolTip() {
    return this.ToolTip.getData();
  }

  IsImmediateToolTip() {
    return this.is_immediate_tooltip;
  }

  GetWidth() {
    return this.rcBounds.Wdt;
  }

  GetHeight() {
    return this.rcBounds.Hgt;
  }

  GetBounds() {
    return this.rcBounds;
  }

  SetBounds(rcNewBound) {
    this.rcBounds.$assign(rcNewBound);
    this.UpdatePos();
    this.UpdateSize();
  }

  GetClientRect() {
    return this.rcBounds;
  }

  GetContainedClientRect() {
    let rc = this.GetClientRect().$clone();
    rc.x = rc.y = 0;
    return rc;
  }

  GetNext$v$c() {
    return this.pNext;
  }

  GetPrev() {
    return this.pPrev;
  }

  GetFirstNestedElement(_fBackwards) {
    return this;
  }

  GetFirstContained() {
    return null;
  }

  IsInActiveDlg(fForKeyboard) {
    let pDlg = this.GetDlg();
    if (pDlg == null) {
      return false;
    }
    return pDlg.IsActive$b(fForKeyboard);
  }

  IsParentOf(_pEl) {
    return false;
  }

  GetToprightCornerRect(iWidth = 16, iHeight = 16, iHIndent = 4, iVIndent = 4, iIndexX = 0) {
    let rtBounds = this.GetContainer() !== this ? this.GetClientRect().$clone() : this.GetContainedClientRect();
    rtBounds.x = rtBounds.x + (rtBounds.Wdt - Math.imul(iWidth + iHIndent | 0, iIndexX + 1 | 0) | 0) | 0;
    rtBounds.y = rtBounds.y + iVIndent | 0;
    rtBounds.Wdt = rtBounds.Hgt = iHeight;
    return rtBounds;
  }

  IsVisible() {
    return this.fVisible && (this.pParent == null || this.pParent.IsVisible());
  }

  SetVisibility(fToValue) {
    this.fVisible = fToValue;
    if (!this.fVisible) {
      let pScreen = this.GetScreen();
      if (pScreen != null) {
        pScreen.Mouse.OnElementGetsInvisible(this);
      }
    }
  }

  GetListItemTopSpacing() {
    return 1;
  }

  GetListItemTopSpacingBar() {
    return false;
  }

  SetDragTarget(pToWindow) {
    this.pDragTarget = pToWindow;
  }

  SetContextHandler(pNewHd) {
    if (this.pContextHandler != null) {
      this.pContextHandler.DeRef();
    }
    if ((this.pContextHandler = pNewHd) != null) {
      pNewHd.Ref();
    }
  }

  GetContextHandler() {
    return this.pParent == null || this.pContextHandler != null ? this.pContextHandler : this.pParent.GetContextHandler();
  }

  $clone() { return new Element().$assign(this); }
  $assign(o) {
    this.ToolTip.$assign(o.ToolTip);
    this.is_immediate_tooltip = o.is_immediate_tooltip;
    this.pParent = o.pParent;
    this.pPrev = o.pPrev;
    this.pNext = o.pNext;
    this.pDragTarget = o.pDragTarget;
    this.iDragX = o.iDragX;
    this.iDragY = o.iDragY;
    this.fDragging = o.fDragging;
    this.pContextHandler = o.pContextHandler;
    this.fVisible = o.fVisible;
    this.rcBounds.$assign(o.rcBounds);
    return this;
  }
}

export class Container$Iterator {
  current = null;

  init(element = null) {
    this.current = element;
    return this;
  }

  op_mul() {
    return this.current;
  }

  op_inc$v() {
    this.current = Element.prototype.GetNext$v$c.call(this.current);
  }

  op_eq(other) {
    return this.current === other.current;
  }

  op_ne(other) {
    return !this.op_eq(other);
  }

  $clone() { return new Container$Iterator().$assign(this); }
  $assign(o) {
    this.current = o.current;
    return this;
  }
}

export class Container$ReverseIterator {
  current = null;

  init(element = null) {
    this.current = element;
    return this;
  }

  op_mul() {
    return this.current;
  }

  op_inc$v() {
    this.current = this.current.GetPrev();
  }

  op_eq(other) {
    return this.current === other.current;
  }

  op_ne(other) {
    return !this.op_eq(other);
  }

  $clone() { return new Container$ReverseIterator().$assign(this); }
  $assign(o) {
    this.current = o.current;
    return this;
  }
}

export class DlgCallback$C4GameOptionButtons {

  $clone() { return new DlgCallback$C4GameOptionButtons().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class DlgCallback$C4GameOverDlg {

  $clone() { return new DlgCallback$C4GameOverDlg().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class DlgCallback$ClientListItem {

  $clone() { return new DlgCallback$ClientListItem().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class DlgCallback$ConnectionListItem {

  $clone() { return new DlgCallback$ConnectionListItem().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class DlgCallback$PlayerListItem {

  $clone() { return new DlgCallback$PlayerListItem().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class DlgCallback$C4StartupAboutDlg {

  $clone() { return new DlgCallback$C4StartupAboutDlg().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class DlgCallback$C4StartupLegalDlg {

  $clone() { return new DlgCallback$C4StartupLegalDlg().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class DlgCallback$C4StartupMainDlg {

  $clone() { return new DlgCallback$C4StartupMainDlg().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class DlgCallback$ControlConfigArea {

  $clone() { return new DlgCallback$ControlConfigArea().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class DlgCallback$C4StartupOptionsDlg {

  $clone() { return new DlgCallback$C4StartupOptionsDlg().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class DlgCallback$C4StartupPlrPropertiesDlg {

  $clone() { return new DlgCallback$C4StartupPlrPropertiesDlg().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class DlgCallback$CrewListItem {

  $clone() { return new DlgCallback$CrewListItem().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class DlgCallback$ListItem {

  $clone() { return new DlgCallback$ListItem().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class DlgCallback$C4StartupScenSelDlg {

  $clone() { return new DlgCallback$C4StartupScenSelDlg().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class DlgCallback$Dialog {

  $clone() { return new DlgCallback$Dialog().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class DlgCallback$Edit {

  $clone() { return new DlgCallback$Edit().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class DlgCallbackEx$PlayerListItem$i32 {

  $clone() { return new DlgCallbackEx$PlayerListItem$i32().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class DlgCallbackEx$C4StartupMainDlg$StdCopyStrBuf {

  $clone() { return new DlgCallbackEx$C4StartupMainDlg$StdCopyStrBuf().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class DlgCallbackEx$C4StartupMainDlg$i32 {

  $clone() { return new DlgCallbackEx$C4StartupMainDlg$i32().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class DlgCallbackEx$ComboBox$ComboMenuCBStruct {

  $clone() { return new DlgCallbackEx$ComboBox$ComboMenuCBStruct().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class ComboBox_FillCB {
  pCombo = null;
  pDrop = null;

  FillDropDown(pComboBox, pDropdownList) {
    this.pCombo = pComboBox;
    this.pDrop = pDropdownList;
    this.FillDropDownCB();
  }

  AddEntry(szText, id) {
    if (szText == null) {
      szText = S("");
    }
    let pHandler = new CBMenuHandlerEx$ComboBox$ComboMenuCBStruct().init$pComboBox$x(this.pCombo, "OnCtxComboSelect");
    pHandler.SetExtra$ComboBox$ComboMenuCBStruct(new ComboBox$ComboMenuCBStruct().init$pi8$i32(szText, id));
    this.pDrop.AddItem$pi8$pi8$i32$pMenuHandler$pContextHandler(szText, $.FormatString($.LoadResStr(S("IDS_MSG_SELECT")), szText).getData(), -2 /*Ico_Empty*/, pHandler);
  }

  FindEntry(szText) {
    let $t1;
    let pEntry = null;
    let idx = 0;
    while ((pEntry = this.pDrop.GetIndexedEntry(($t1 = idx, idx = idx + 1 | 0, $t1))) != null) {
      if ($.SEqual(pEntry.GetText$v(), szText)) {
        return true;
      }
    }
    return false;
  }

  ClearEntries() {
    Container.prototype.Clear$v.call(this.pDrop);
  }

  SelectEntry(iEntry) {
    this.pDrop.SelectItem$i32(iEntry);
  }

  $clone() { return new ComboBox_FillCB().$assign(this); }
  $assign(o) {
    this.pCombo = o.pCombo;
    this.pDrop = o.pDrop;
    return this;
  }
}

export class ComboBox$ComboMenuCBStruct {
  sText = new $.StdCopyStrBuf();
  id = 0;

  init$v() {
    this.sText = new $.StdCopyStrBuf();
    this.id = 0;
    return this;
  }

  init$pi8$i32(szText, id) {
    this.sText = new $.StdCopyStrBuf().init$pi8$b(szText);
    this.id = id;
    return this;
  }

  $clone() { return new ComboBox$ComboMenuCBStruct().$assign(this); }
  $assign(o) {
    this.sText.$assign(o.sText);
    this.id = o.id;
    return this;
  }
}

export class FrameDecoration {
  iRefCount = 0;
  pSourceDef = null;
  idSourceDef = new $.C4ID().init$v();
  dwBackClr = 0;
  fctTop = new $.C4TargetFacet().init();
  fctTopRight = new $.C4TargetFacet().init();
  fctRight = new $.C4TargetFacet().init();
  fctBottomRight = new $.C4TargetFacet().init();
  fctBottom = new $.C4TargetFacet().init();
  fctBottomLeft = new $.C4TargetFacet().init();
  fctLeft = new $.C4TargetFacet().init();
  fctTopLeft = new $.C4TargetFacet().init();
  iBorderTop = 0;
  iBorderLeft = 0;
  iBorderRight = 0;
  iBorderBottom = 0;
  fHasGfxOutsideClientArea = false;

  SetFacetByAction(pOfDef, rfctTarget, szFacetName) {
    let sActName = new $.StdStrBuf();
    sActName.Format(S("FrameDeco%s"), szFacetName);
    let act = pOfDef.GetActionByName$pi8(sActName.getData());
    if (act == null) {
      return false;
    }
    let x = act.GetPropertyInt(31 /*P_X*/);
    let y = act.GetPropertyInt(32 /*P_Y*/);
    let wdt = act.GetPropertyInt(35 /*P_Wdt*/);
    let hgt = act.GetPropertyInt(36 /*P_Hgt*/);
    let tx = act.GetPropertyInt(42 /*P_OffX*/);
    let ty = act.GetPropertyInt(43 /*P_OffY*/);
    if (wdt === 0 || hgt === 0) {
      return false;
    }
    rfctTarget.Set$pC4Surface$f32$f32$f32$f32$f32$f32$f32(pOfDef.Graphics.GetBitmap(), Math.fround(x), Math.fround(y), Math.fround(wdt), Math.fround(hgt), Math.fround(tx), Math.fround(ty));
    return true;
  }

  init() {
    this.iRefCount = 0;
    this.idSourceDef = new $.C4ID().init$v();
    this.fctTop = new $.C4TargetFacet().init();
    this.fctTopRight = new $.C4TargetFacet().init();
    this.fctRight = new $.C4TargetFacet().init();
    this.fctBottomRight = new $.C4TargetFacet().init();
    this.fctBottom = new $.C4TargetFacet().init();
    this.fctBottomLeft = new $.C4TargetFacet().init();
    this.fctLeft = new $.C4TargetFacet().init();
    this.fctTopLeft = new $.C4TargetFacet().init();
    FrameDecoration.prototype.Clear.call(this);
    return this;
  }

  Clear() {
    this.pSourceDef = null;
    this.idSourceDef.$assign($.C4ID.None);
    this.dwBackClr = 0x9f000000;
    this.iBorderTop = this.iBorderLeft = this.iBorderRight = this.iBorderBottom = 0;
    this.fHasGfxOutsideClientArea = false;
    this.fctTop.Default();
    this.fctTopRight.Default();
    this.fctRight.Default();
    this.fctBottomRight.Default();
    this.fctBottom.Default();
    this.fctBottomLeft.Default();
    this.fctLeft.Default();
    this.fctTopLeft.Default();
  }

  SetByDef$pC4Def(pSrcDef) {
    if (pSrcDef == null) {
      return false;
    }
    if (!pSrcDef.Script.IsReady()) {
      return false;
    }
    this.Clear();
    this.pSourceDef = pSrcDef;
    this.idSourceDef.$assign(pSrcDef.id);
    this.dwBackClr = pSrcDef.Call$pi8$pC4AulParSet$b($.FormatString(S("~FrameDecoration%s"), S("BackClr")).getData()).getInt() >>> 0;
    this.iBorderTop = pSrcDef.Call$pi8$pC4AulParSet$b($.FormatString(S("~FrameDecoration%s"), S("BorderTop")).getData()).getInt();
    this.iBorderLeft = pSrcDef.Call$pi8$pC4AulParSet$b($.FormatString(S("~FrameDecoration%s"), S("BorderLeft")).getData()).getInt();
    this.iBorderRight = pSrcDef.Call$pi8$pC4AulParSet$b($.FormatString(S("~FrameDecoration%s"), S("BorderRight")).getData()).getInt();
    this.iBorderBottom = pSrcDef.Call$pi8$pC4AulParSet$b($.FormatString(S("~FrameDecoration%s"), S("BorderBottom")).getData()).getInt();
    this.SetFacetByAction(pSrcDef, this.fctTop, S("Top"));
    this.SetFacetByAction(pSrcDef, this.fctTopRight, S("TopRight"));
    this.SetFacetByAction(pSrcDef, this.fctRight, S("Right"));
    this.SetFacetByAction(pSrcDef, this.fctBottomRight, S("BottomRight"));
    this.SetFacetByAction(pSrcDef, this.fctBottom, S("Bottom"));
    this.SetFacetByAction(pSrcDef, this.fctBottomLeft, S("BottomLeft"));
    this.SetFacetByAction(pSrcDef, this.fctLeft, S("Left"));
    this.SetFacetByAction(pSrcDef, this.fctTopLeft, S("TopLeft"));
    this.fHasGfxOutsideClientArea = this.fctTopLeft.TargetY < Math.fround(0) || this.fctTop.TargetY < Math.fround(0) || this.fctTopRight.TargetY < Math.fround(0) || this.fctTopLeft.TargetX < Math.fround(0) || this.fctLeft.TargetX < Math.fround(0) || this.fctBottomLeft.TargetX < Math.fround(0) || Math.fround(this.fctTopRight.TargetX + this.fctTopRight.Wdt) > Math.fround(this.iBorderRight) || Math.fround(this.fctRight.TargetX + this.fctRight.Wdt) > Math.fround(this.iBorderRight) || Math.fround(this.fctBottomRight.TargetX + this.fctBottomRight.Wdt) > Math.fround(this.iBorderRight) || Math.fround(this.fctBottomLeft.TargetY + this.fctBottomLeft.Hgt) > Math.fround(this.iBorderBottom) || Math.fround(this.fctBottom.TargetY + this.fctBottom.Hgt) > Math.fround(this.iBorderBottom) || Math.fround(this.fctBottomRight.TargetY + this.fctBottomRight.Hgt) > Math.fround(this.iBorderBottom);
    return true;
  }

  SetByDef$C4ID(idSourceDef) {
    return this.SetByDef$pC4Def($.C4Id2Def(idSourceDef.$clone()));
  }

  UpdateGfx() {
    return this.SetByDef$C4ID(this.idSourceDef.$clone());
  }

  Ref() {
    this.iRefCount = this.iRefCount + 1 | 0;
  }

  Deref() {
    if (!((this.iRefCount = this.iRefCount - 1 | 0) !== 0)) {
      $delete(this);
    }
  }

  Draw(cgo, rcBounds) {
    let ox = ftoi32(Math.fround(cgo.TargetX + Math.fround(rcBounds.x)));
    let oy = ftoi32(Math.fround(cgo.TargetY + Math.fround(rcBounds.y)));
    $.pDraw.DrawBoxDw(cgo.Surface, ox, oy, (ox + rcBounds.Wdt | 0) - 1 | 0, (oy + rcBounds.Hgt | 0) - 1 | 0, this.dwBackClr);
    let x = 0;
    let y = 0;
    let Q = 0;
    if ((Q = ftoi32(this.fctTop.Wdt)) !== 0) {
      for (x = this.iBorderLeft; x < (rcBounds.Wdt - this.iBorderRight | 0); x = ftoi32(Math.fround(Math.fround(x) + this.fctTop.Wdt))) {
        let w = $min(ftoi32(this.fctTop.Wdt), (rcBounds.Wdt - this.iBorderRight | 0) - x | 0);
        this.fctTop.Wdt = Math.fround(w);
        this.fctTop.Draw$pC4Surface$f32$f32$i32$i32(cgo.Surface, Math.fround(ox + x | 0), Math.fround(Math.fround(oy) + this.fctTop.TargetY));
      }
      this.fctTop.Wdt = Math.fround(Q);
    }
    if ((Q = ftoi32(this.fctLeft.Hgt)) !== 0) {
      for (y = this.iBorderTop; y < (rcBounds.Hgt - this.iBorderBottom | 0); y = ftoi32(Math.fround(Math.fround(y) + this.fctLeft.Hgt))) {
        let h = $min(ftoi32(this.fctLeft.Hgt), (rcBounds.Hgt - this.iBorderBottom | 0) - y | 0);
        this.fctLeft.Hgt = Math.fround(h);
        this.fctLeft.Draw$pC4Surface$f32$f32$i32$i32(cgo.Surface, Math.fround(Math.fround(ox) + this.fctLeft.TargetX), Math.fround(oy + y | 0));
      }
      this.fctLeft.Hgt = Math.fround(Q);
    }
    if ((Q = ftoi32(this.fctRight.Hgt)) !== 0) {
      for (y = this.iBorderTop; y < (rcBounds.Hgt - this.iBorderBottom | 0); y = ftoi32(Math.fround(Math.fround(y) + this.fctRight.Hgt))) {
        let h = $min(ftoi32(this.fctRight.Hgt), (rcBounds.Hgt - this.iBorderBottom | 0) - y | 0);
        this.fctRight.Hgt = Math.fround(h);
        this.fctRight.Draw$pC4Surface$f32$f32$i32$i32(cgo.Surface, Math.fround(Math.fround((ox + rcBounds.Wdt | 0) - this.iBorderRight | 0) + this.fctRight.TargetX), Math.fround(oy + y | 0));
      }
      this.fctRight.Hgt = Math.fround(Q);
    }
    if ((Q = ftoi32(this.fctBottom.Wdt)) !== 0) {
      for (x = this.iBorderLeft; x < (rcBounds.Wdt - this.iBorderRight | 0); x = ftoi32(Math.fround(Math.fround(x) + this.fctBottom.Wdt))) {
        let w = $min(ftoi32(this.fctBottom.Wdt), (rcBounds.Wdt - this.iBorderRight | 0) - x | 0);
        this.fctBottom.Wdt = Math.fround(w);
        this.fctBottom.Draw$pC4Surface$f32$f32$i32$i32(cgo.Surface, Math.fround(ox + x | 0), Math.fround(Math.fround((oy + rcBounds.Hgt | 0) - this.iBorderBottom | 0) + this.fctBottom.TargetY));
      }
      this.fctBottom.Wdt = Math.fround(Q);
    }
    this.fctTopLeft.Draw$pC4Surface$f32$f32$i32$i32(cgo.Surface, Math.fround(Math.fround(ox) + this.fctTopLeft.TargetX), Math.fround(Math.fround(oy) + this.fctTopLeft.TargetY));
    this.fctTopRight.Draw$pC4Surface$f32$f32$i32$i32(cgo.Surface, Math.fround(Math.fround((ox + rcBounds.Wdt | 0) - this.iBorderRight | 0) + this.fctTopRight.TargetX), Math.fround(Math.fround(oy) + this.fctTopRight.TargetY));
    this.fctBottomLeft.Draw$pC4Surface$f32$f32$i32$i32(cgo.Surface, Math.fround(Math.fround(ox) + this.fctBottomLeft.TargetX), Math.fround(Math.fround((oy + rcBounds.Hgt | 0) - this.iBorderBottom | 0) + this.fctBottomLeft.TargetY));
    this.fctBottomRight.Draw$pC4Surface$f32$f32$i32$i32(cgo.Surface, Math.fround(Math.fround((ox + rcBounds.Wdt | 0) - this.iBorderRight | 0) + this.fctBottomRight.TargetX), Math.fround(Math.fround((oy + rcBounds.Hgt | 0) - this.iBorderBottom | 0) + this.fctBottomRight.TargetY));
  }

  $clone() { return new FrameDecoration().$assign(this); }
  $assign(o) {
    this.iRefCount = o.iRefCount;
    this.pSourceDef = o.pSourceDef;
    this.idSourceDef.$assign(o.idSourceDef);
    this.dwBackClr = o.dwBackClr;
    this.fctTop.$assign(o.fctTop);
    this.fctTopRight.$assign(o.fctTopRight);
    this.fctRight.$assign(o.fctRight);
    this.fctBottomRight.$assign(o.fctBottomRight);
    this.fctBottom.$assign(o.fctBottom);
    this.fctBottomLeft.$assign(o.fctBottomLeft);
    this.fctLeft.$assign(o.fctLeft);
    this.fctTopLeft.$assign(o.fctTopLeft);
    this.iBorderTop = o.iBorderTop;
    this.iBorderLeft = o.iBorderLeft;
    this.iBorderRight = o.iBorderRight;
    this.iBorderBottom = o.iBorderBottom;
    this.fHasGfxOutsideClientArea = o.fHasGfxOutsideClientArea;
    return this;
  }
}

export class BaseInputCallback {

  $clone() { return new BaseInputCallback().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class CMouse {
  x = 0;
  y = 0;
  LDown = false;
  MDown = false;
  RDown = false;
  LDownX = 0;
  LDownY = 0;
  dwKeys = 0;
  fActive = false;
  tLastMovementTime = new $.C4TimeMilliseconds();
  fActiveInput = false;
  pMouseOverElement = null;
  pPrevMouseOverElement = null;
  pDragElement = null;

  init(iX, iY) {
    this.fActive = true;
    this.tLastMovementTime = new $.C4TimeMilliseconds();
    this.fActiveInput = false;
    this.x = iX;
    this.y = iY;
    this.LDown = this.MDown = this.RDown = false;
    this.dwKeys = 0;
    this.pMouseOverElement = this.pPrevMouseOverElement = null;
    this.pDragElement = null;
    CMouse.prototype.ResetToolTipTime.call(this);
    return this;
  }

  Draw(cgo, draw_tool_tips) {
    if (!this.fActive) {
      return;
    }
    let GuiZoom = new $.ZoomData();
    $.pDraw.GetZoom(GuiZoom);
    let oldZoom = GuiZoom.Zoom;
    GuiZoom.Zoom = Math.fround(1);
    $.pDraw.SetZoom$ZoomData(GuiZoom);
    let iOffsetX = ftoi32(Math.fround(-$.GraphicsResource.fctMouseCursor.Wdt / Math.fround(2)));
    let iOffsetY = ftoi32(Math.fround(-$.GraphicsResource.fctMouseCursor.Hgt / Math.fround(2)));
    $.GraphicsResource.fctMouseCursor.Draw$pC4Surface$f32$f32$i32$i32(cgo.Surface, Math.fround(this.x + iOffsetX | 0), Math.fround(this.y + iOffsetY | 0), 0);
    if (this.pMouseOverElement != null && draw_tool_tips !== 0) {
      if (draw_tool_tips === 2 || this.pMouseOverElement.IsImmediateToolTip()) {
        let szTip = this.pMouseOverElement.GetToolTip();
        if (szTip != null && szTip.a[szTip.o] !== 0) {
          let cgoTip = new $.C4TargetFacet().init();
          cgoTip.Set$pC4Surface$f32$f32$f32$f32$f32$f32$f32(cgo.Surface, cgo.X, cgo.Y, cgo.Wdt, cgo.Hgt);
          Screen.DrawToolTip(szTip, cgoTip, Math.fround(this.x), Math.fround(this.y));
        }
      }
    }
    GuiZoom.Zoom = oldZoom;
    $.pDraw.SetZoom$ZoomData(GuiZoom);
  }

  Input(iButton, iX, iY, dwKeyParam) {
    if (iButton !== 0 || iX !== this.x || iY !== this.y) {
      this.ResetToolTipTime();
      this.fActiveInput = true;
    }
    this.x = iX;
    this.y = iY;
    this.dwKeys = dwKeyParam;
    switch (iButton) {
      case 1:
        this.LDown = true;
        this.LDownX = this.x;
        this.LDownY = this.y;
        break;
      case 2:
        this.LDown = false;
        break;
      case 3:
        this.RDown = true;
        break;
      case 4:
        this.RDown = false;
        break;
    }
  }

  IsLDown() {
    return this.LDown;
  }

  GetLastXY(rX, rY, rdwKeys) {
    rX.a[rX.o] = this.x;
    rY.a[rY.o] = this.y;
    rdwKeys.a[rdwKeys.o] = this.dwKeys;
  }

  ResetElements() {
    this.pMouseOverElement = this.pPrevMouseOverElement = this.pDragElement = null;
  }

  ReleaseElements() {
    if (this.pMouseOverElement != null) {
      this.pMouseOverElement.MouseLeave(this);
    }
    if (this.pDragElement != null) {
      const iX = [0];
      const iY = [0];
      const dwKeys = [0];
      this.GetLastXY(P(iX, 0), P(iY, 0), P(dwKeys, 0));
      this.pDragElement.ScreenPos2ClientPos(P(iX, 0), P(iY, 0));
      this.pDragElement.StopDragging(this, iX[0], iY[0], dwKeys[0]);
    }
    this.pPrevMouseOverElement = this.pMouseOverElement = this.pDragElement = null;
  }

  OnElementGetsInvisible(pChild) {
    this.RemoveElement(pChild);
  }

  RemoveElement(pChild) {
    if (this.pMouseOverElement === pChild) {
      this.pMouseOverElement.MouseLeave(this);
      this.pMouseOverElement = null;
    }
    if (this.pPrevMouseOverElement === pChild) {
      this.pPrevMouseOverElement = null;
    }
    if (this.pDragElement === pChild) {
      this.pDragElement = null;
    }
  }

  SetOwnedMouse(fToVal) {
    this.fActive = fToVal;
  }

  ResetToolTipTime() {
    this.tLastMovementTime.$assign($.C4TimeMilliseconds.Now());
  }

  IsMouseStill() {
    return $.op_sub$C4TimeMilliseconds$C4TimeMilliseconds($.C4TimeMilliseconds.Now(), this.tLastMovementTime) >= 500;
  }

  ResetActiveInput() {
    this.fActiveInput = false;
  }

  IsActiveInput() {
    return this.fActiveInput;
  }

  ReleaseButtons() {
    this.LDown = this.RDown = this.MDown = false;
  }

  $clone() { return new CMouse().$assign(this); }
  $assign(o) {
    this.x = o.x;
    this.y = o.y;
    this.LDown = o.LDown;
    this.MDown = o.MDown;
    this.RDown = o.RDown;
    this.LDownX = o.LDownX;
    this.LDownY = o.LDownY;
    this.dwKeys = o.dwKeys;
    this.fActive = o.fActive;
    this.tLastMovementTime.$assign(o.tLastMovementTime);
    this.fActiveInput = o.fActiveInput;
    this.pMouseOverElement = o.pMouseOverElement;
    this.pPrevMouseOverElement = o.pPrevMouseOverElement;
    this.pDragElement = o.pDragElement;
    return this;
  }
}

export class ComponentAligner {
  static $layout = [["rcClientArea.x", 0, "i32", 0], ["rcClientArea.y", 4, "i32", 0], ["rcClientArea.Wdt", 8, "i32", 0], ["rcClientArea.Hgt", 12, "i32", 0], ["iMarginX", 16, "i32", 0], ["iMarginY", 20, "i32", 0]];
  static $size = 24;
  static rcTemp;
  rcClientArea = new $.C4Rect();
  iMarginX = 0;
  iMarginY = 0;

  init(rcArea, iMarginX, iMarginY, fZeroAreaXY = false) {
    this.rcClientArea = rcArea.$clone();
    this.iMarginX = iMarginX;
    this.iMarginY = iMarginY;
    if (fZeroAreaXY) {
      this.rcClientArea.x = this.rcClientArea.y = 0;
    }
    return this;
  }

  GetFromTop$i32$i32$rC4Rect(iHgt, iWdt, rcOut) {
    rcOut.x = this.rcClientArea.x + this.iMarginX | 0;
    rcOut.y = this.rcClientArea.y + this.iMarginY | 0;
    rcOut.Wdt = this.rcClientArea.Wdt - Math.imul(this.iMarginX, 2) | 0;
    rcOut.Hgt = iHgt;
    let d = iHgt + Math.imul(this.iMarginY, 2) | 0;
    this.rcClientArea.y = this.rcClientArea.y + d | 0;
    this.rcClientArea.Hgt = this.rcClientArea.Hgt - d | 0;
    if (iWdt >= 0) {
      rcOut.x = rcOut.x + ((rcOut.Wdt - iWdt | 0) / 2 | 0) | 0;
      rcOut.Wdt = iWdt;
    }
    return this.rcClientArea.Hgt >= 0;
  }

  GetFromLeft$i32$i32$rC4Rect(iWdt, iHgt, rcOut) {
    rcOut.x = this.rcClientArea.x + this.iMarginX | 0;
    rcOut.y = this.rcClientArea.y + this.iMarginY | 0;
    rcOut.Wdt = iWdt;
    rcOut.Hgt = this.rcClientArea.Hgt - Math.imul(this.iMarginY, 2) | 0;
    let d = iWdt + Math.imul(this.iMarginX, 2) | 0;
    this.rcClientArea.x = this.rcClientArea.x + d | 0;
    this.rcClientArea.Wdt = this.rcClientArea.Wdt - d | 0;
    if (iHgt >= 0) {
      rcOut.y = rcOut.y + ((rcOut.Hgt - iHgt | 0) / 2 | 0) | 0;
      rcOut.Hgt = iHgt;
    }
    return this.rcClientArea.Wdt >= 0;
  }

  GetFromRight$i32$i32$rC4Rect(iWdt, iHgt, rcOut) {
    rcOut.x = ((this.rcClientArea.x + this.rcClientArea.Wdt | 0) - iWdt | 0) - this.iMarginX | 0;
    rcOut.y = this.rcClientArea.y + this.iMarginY | 0;
    rcOut.Wdt = iWdt;
    rcOut.Hgt = this.rcClientArea.Hgt - Math.imul(this.iMarginY, 2) | 0;
    this.rcClientArea.Wdt = this.rcClientArea.Wdt - (iWdt + Math.imul(this.iMarginX, 2) | 0) | 0;
    if (iHgt >= 0) {
      rcOut.y = rcOut.y + ((rcOut.Hgt - iHgt | 0) / 2 | 0) | 0;
      rcOut.Hgt = iHgt;
    }
    return this.rcClientArea.Wdt >= 0;
  }

  GetFromBottom$i32$i32$rC4Rect(iHgt, iWdt, rcOut) {
    rcOut.x = this.rcClientArea.x + this.iMarginX | 0;
    rcOut.y = ((this.rcClientArea.y + this.rcClientArea.Hgt | 0) - iHgt | 0) - this.iMarginY | 0;
    rcOut.Wdt = this.rcClientArea.Wdt - Math.imul(this.iMarginX, 2) | 0;
    rcOut.Hgt = iHgt;
    this.rcClientArea.Hgt = this.rcClientArea.Hgt - (iHgt + Math.imul(this.iMarginY, 2) | 0) | 0;
    if (iWdt >= 0) {
      rcOut.x = rcOut.x + ((rcOut.Wdt - iWdt | 0) / 2 | 0) | 0;
      rcOut.Wdt = iWdt;
    }
    return this.rcClientArea.Hgt >= 0;
  }

  GetAll$rC4Rect(rcOut) {
    rcOut.x = this.rcClientArea.x + this.iMarginX | 0;
    rcOut.y = this.rcClientArea.y + this.iMarginY | 0;
    rcOut.Wdt = this.rcClientArea.Wdt - Math.imul(this.iMarginX, 2) | 0;
    rcOut.Hgt = this.rcClientArea.Hgt - Math.imul(this.iMarginY, 2) | 0;
  }

  GetCentered$i32$i32$rC4Rect(iWdt, iHgt, rcOut) {
    rcOut.x = this.rcClientArea.GetMiddleX() - (iWdt / 2 | 0) | 0;
    rcOut.y = this.rcClientArea.GetMiddleY() - (iHgt / 2 | 0) | 0;
    rcOut.Wdt = iWdt;
    rcOut.Hgt = iHgt;
    return (rcOut.Wdt + Math.imul(this.iMarginX, 2) | 0) <= this.rcClientArea.Wdt && (rcOut.Hgt + Math.imul(this.iMarginY, 2) | 0) <= this.rcClientArea.Hgt;
  }

  GetFromTop$i32$i32(iHgt, iWdt = -1) {
    this.GetFromTop$i32$i32$rC4Rect(iHgt, iWdt, ComponentAligner.rcTemp);
    return ComponentAligner.rcTemp;
  }

  GetFromLeft$i32$i32(iWdt, iHgt = -1) {
    this.GetFromLeft$i32$i32$rC4Rect(iWdt, iHgt, ComponentAligner.rcTemp);
    return ComponentAligner.rcTemp;
  }

  GetFromRight$i32$i32(iWdt, iHgt = -1) {
    this.GetFromRight$i32$i32$rC4Rect(iWdt, iHgt, ComponentAligner.rcTemp);
    return ComponentAligner.rcTemp;
  }

  GetFromBottom$i32$i32(iHgt, iWdt = -1) {
    this.GetFromBottom$i32$i32$rC4Rect(iHgt, iWdt, ComponentAligner.rcTemp);
    return ComponentAligner.rcTemp;
  }

  GetAll$v() {
    this.GetAll$rC4Rect(ComponentAligner.rcTemp);
    return ComponentAligner.rcTemp;
  }

  GetCentered$i32$i32(iWdt, iHgt) {
    this.GetCentered$i32$i32$rC4Rect(iWdt, iHgt, ComponentAligner.rcTemp);
    return ComponentAligner.rcTemp;
  }

  GetGridCell(iSectX, iSectXMax, iSectY, iSectYMax, iSectSizeX = -1, iSectSizeY = -1, fCenterPos = false, iSectNumX = 1, iSectNumY = 1) {
    let iSectSizeXO = iSectSizeX;
    let iSectSizeYO = iSectSizeY;
    let iSectSizeXMax = ((this.rcClientArea.Wdt - this.iMarginX | 0) / iSectXMax | 0) - this.iMarginX | 0;
    let iSectSizeYMax = ((this.rcClientArea.Hgt - this.iMarginY | 0) / iSectYMax | 0) - this.iMarginY | 0;
    if (iSectSizeX < 0 || fCenterPos) {
      iSectSizeX = iSectSizeXMax;
    } else {
      iSectSizeX = $min(iSectSizeX, iSectSizeXMax);
    }
    if (iSectSizeY < 0 || fCenterPos) {
      iSectSizeY = iSectSizeYMax;
    } else {
      iSectSizeY = $min(iSectSizeY, iSectSizeYMax);
    }
    ComponentAligner.rcTemp.x = (Math.imul(iSectX, iSectSizeX + this.iMarginX | 0) + this.iMarginX | 0) + this.rcClientArea.x | 0;
    ComponentAligner.rcTemp.y = (Math.imul(iSectY, iSectSizeY + this.iMarginY | 0) + this.iMarginY | 0) + this.rcClientArea.y | 0;
    ComponentAligner.rcTemp.Wdt = Math.imul(iSectSizeX, iSectNumX) + Math.imul(this.iMarginX, iSectNumX - 1 | 0) | 0;
    ComponentAligner.rcTemp.Hgt = Math.imul(iSectSizeY, iSectNumY) + Math.imul(this.iMarginY, iSectNumY - 1 | 0) | 0;
    if (iSectSizeXO >= 0 && fCenterPos) {
      ComponentAligner.rcTemp.x = ComponentAligner.rcTemp.x + ((iSectSizeX - iSectSizeXO | 0) / 2 | 0) | 0;
      ComponentAligner.rcTemp.Wdt = iSectSizeXO;
    }
    if (iSectSizeYO >= 0 && fCenterPos) {
      ComponentAligner.rcTemp.y = ComponentAligner.rcTemp.y + ((iSectSizeY - iSectSizeYO | 0) / 2 | 0) | 0;
      ComponentAligner.rcTemp.Hgt = iSectSizeYO;
    }
    return ComponentAligner.rcTemp;
  }

  GetWidth() {
    return this.rcClientArea.Wdt;
  }

  GetHeight() {
    return this.rcClientArea.Hgt;
  }

  GetHMargin() {
    return this.iMarginX;
  }

  GetVMargin() {
    return this.iMarginY;
  }

  GetInnerWidth() {
    return this.rcClientArea.Wdt - Math.imul(2, this.iMarginX) | 0;
  }

  GetInnerHeight() {
    return this.rcClientArea.Hgt - Math.imul(2, this.iMarginY) | 0;
  }

  ExpandTop(iByHgt) {
    this.rcClientArea.y = this.rcClientArea.y - iByHgt | 0;
    this.rcClientArea.Hgt = this.rcClientArea.Hgt + iByHgt | 0;
  }

  ExpandLeft(iByWdt) {
    this.rcClientArea.x = this.rcClientArea.x - iByWdt | 0;
    this.rcClientArea.Wdt = this.rcClientArea.Wdt + iByWdt | 0;
  }

  ExpandRight(iByWdt) {
    this.rcClientArea.Wdt = this.rcClientArea.Wdt + iByWdt | 0;
  }

  ExpandBottom(iByHgt) {
    this.rcClientArea.Hgt = this.rcClientArea.Hgt + iByHgt | 0;
  }

  LogIt(szName) {
    $.LogF(S("ComponentAligner %s: (%d,%d)+(%d,%d), Margin (%d,%d)"), szName, this.rcClientArea.x, this.rcClientArea.y, this.rcClientArea.Wdt, this.rcClientArea.Hgt, this.iMarginX, this.iMarginY);
  }

  $clone() { return new ComponentAligner().$assign(this); }
  $assign(o) {
    this.rcClientArea.$assign(o.rcClientArea);
    this.iMarginX = o.iMarginX;
    this.iMarginY = o.iMarginY;
    return this;
  }
}

export class CBContextHandler$ClientListItem extends ContextHandler {
  pCBTarget = null;
  pCallbackFn = null;

  init(pCBTarget, pCallbackFn) {
    this.pCBTarget = pCBTarget;
    this.pCallbackFn = pCallbackFn;
    return this;
  }

  OnContext(pOnElement, iX, iY) {
    new DlgCallback$ClientListItem$2();
    if (this.pCBTarget == null) {
      return false;
    }
    let pScreen = pOnElement.GetScreen();
    if (pScreen == null) {
      return false;
    }
    let pNewMenu = this.pCBTarget[this.pCallbackFn](pOnElement, iX, iY);
    if (pNewMenu == null) {
      return false;
    }
    pScreen.DoContext$pContextMenu$pElement$i32$i32(pNewMenu, pOnElement, iX, iY);
    return true;
  }

  OnSubcontext(pOnElement) {
    return this.pCBTarget[this.pCallbackFn](pOnElement, 0, 0);
  }

  $clone() { return new CBContextHandler$ClientListItem().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCBTarget = o.pCBTarget;
    this.pCallbackFn = o.pCallbackFn;
    return this;
  }
}

export class CBMenuHandler$ClientListItem extends MenuHandler {
  pCBTarget = null;
  pCallbackFn = null;

  init(pCBTarget, pCallbackFn, _iaExtra = 0) {
    this.pCBTarget = pCBTarget;
    this.pCallbackFn = pCallbackFn;
    return this;
  }

  OnOK(pTargetElement) {
    if (this.pCBTarget == null) {
      return;
    }
    this.pCBTarget[this.pCallbackFn](pTargetElement);
  }

  $clone() { return new CBMenuHandler$ClientListItem().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCBTarget = o.pCBTarget;
    this.pCallbackFn = o.pCallbackFn;
    return this;
  }
}

export class CBMenuHandler$CrewListItem extends MenuHandler {
  pCBTarget = null;
  pCallbackFn = null;

  init(pCBTarget, pCallbackFn, _iaExtra = 0) {
    this.pCBTarget = pCBTarget;
    this.pCallbackFn = pCallbackFn;
    return this;
  }

  OnOK(pTargetElement) {
    if (this.pCBTarget == null) {
      return;
    }
    $spawn(this.pCBTarget[this.pCallbackFn](pTargetElement));
  }

  $clone() { return new CBMenuHandler$CrewListItem().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCBTarget = o.pCBTarget;
    this.pCallbackFn = o.pCallbackFn;
    return this;
  }
}

export class CBMenuHandlerEx$C4StartupMainDlg$i32 extends MenuHandler {
  pCBTarget = null;
  pCallbackFn = null;
  Extra = 0;

  init$pC4StartupMainDlg$x$i32(pCBTarget, pCallbackFn, aExtra) {
    this.pCBTarget = pCBTarget;
    this.pCallbackFn = pCallbackFn;
    this.Extra = aExtra;
    return this;
  }

  OnOK(pTargetElement) {
    if (this.pCBTarget == null || this.pCallbackFn == null) {
      return;
    }
    $spawn(this.pCBTarget[this.pCallbackFn](pTargetElement, this.Extra));
  }

  $clone() { return new CBMenuHandlerEx$C4StartupMainDlg$i32().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCBTarget = o.pCBTarget;
    this.pCallbackFn = o.pCallbackFn;
    this.Extra = o.Extra;
    return this;
  }
}

export class CallbackHandler$BoolConfig extends BaseCallbackHandler {
  pCBClass = null;
  CBFunc = null;

  DoCall$pElement(pElement) {
    this.pCBClass[this.CBFunc](pElement);
  }

  init(pTarget, rFunc) {
    this.pCBClass = pTarget;
    this.CBFunc = rFunc;
    return this;
  }

  $clone() { return new CallbackHandler$BoolConfig().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCBClass = o.pCBClass;
    this.CBFunc = o.CBFunc;
    return this;
  }
}

export class CallbackHandler$NetworkServerAddressConfig extends BaseCallbackHandler {
  pCBClass = null;
  CBFunc = null;

  DoCall$pElement(pElement) {
    this.pCBClass[this.CBFunc](pElement);
  }

  init(pTarget, rFunc) {
    this.pCBClass = pTarget;
    this.CBFunc = rFunc;
    return this;
  }

  $clone() { return new CallbackHandler$NetworkServerAddressConfig().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCBClass = o.pCBClass;
    this.CBFunc = o.CBFunc;
    return this;
  }
}

export class CallbackHandler$C4StartupOptionsDlg extends BaseCallbackHandler {
  pCBClass = null;
  CBFunc = null;

  DoCall$pElement(pElement) {
    $spawn(this.pCBClass[this.CBFunc](pElement));
  }

  init(pTarget, rFunc) {
    this.pCBClass = pTarget;
    this.CBFunc = rFunc;
    return this;
  }

  $clone() { return new CallbackHandler$C4StartupOptionsDlg().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCBClass = o.pCBClass;
    this.CBFunc = o.CBFunc;
    return this;
  }
}

export class CallbackHandler$C4FileSelDlg extends BaseCallbackHandler {
  pCBClass = null;
  CBFunc = null;

  DoCall$pElement(pElement) {
    $spawn(this.pCBClass[this.CBFunc](pElement));
  }

  init(pTarget, rFunc) {
    this.pCBClass = pTarget;
    this.CBFunc = rFunc;
    return this;
  }

  $clone() { return new CallbackHandler$C4FileSelDlg().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCBClass = o.pCBClass;
    this.CBFunc = o.CBFunc;
    return this;
  }
}

export class CallbackHandler$C4PlayerInfoListBox extends BaseCallbackHandler {
  pCBClass = null;
  CBFunc = null;

  DoCall$pElement(pElement) {
    this.pCBClass[this.CBFunc](pElement);
  }

  init(pTarget, rFunc) {
    this.pCBClass = pTarget;
    this.CBFunc = rFunc;
    return this;
  }

  $clone() { return new CallbackHandler$C4PlayerInfoListBox().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCBClass = o.pCBClass;
    this.CBFunc = o.CBFunc;
    return this;
  }
}

export class CallbackHandler$NetworkPortConfig extends BaseCallbackHandler {
  pCBClass = null;
  CBFunc = null;

  DoCall$pElement(pElement) {
    this.pCBClass[this.CBFunc](pElement);
  }

  init(pTarget, rFunc) {
    this.pCBClass = pTarget;
    this.CBFunc = rFunc;
    return this;
  }

  $clone() { return new CallbackHandler$NetworkPortConfig().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCBClass = o.pCBClass;
    this.CBFunc = o.CBFunc;
    return this;
  }
}

export class CallbackHandler$C4StartupPlrSelDlg extends BaseCallbackHandler {
  pCBClass = null;
  CBFunc = null;

  DoCall$pElement(pElement) {
    $spawn(this.pCBClass[this.CBFunc](pElement));
  }

  init(pTarget, rFunc) {
    this.pCBClass = pTarget;
    this.CBFunc = rFunc;
    return this;
  }

  $clone() { return new CallbackHandler$C4StartupPlrSelDlg().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCBClass = o.pCBClass;
    this.CBFunc = o.CBFunc;
    return this;
  }
}

export class CallbackHandler$C4StartupScenSelDlg extends BaseCallbackHandler {
  pCBClass = null;
  CBFunc = null;

  DoCall$pElement(pElement) {
    $spawn(this.pCBClass[this.CBFunc](pElement));
  }

  init(pTarget, rFunc) {
    this.pCBClass = pTarget;
    this.CBFunc = rFunc;
    return this;
  }

  $clone() { return new CallbackHandler$C4StartupScenSelDlg().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCBClass = o.pCBClass;
    this.CBFunc = o.CBFunc;
    return this;
  }
}

export class CallbackHandler$MessageDialog extends BaseCallbackHandler {
  pCBClass = null;
  CBFunc = null;

  DoCall$pElement(pElement) {
    $spawn(this.pCBClass[this.CBFunc](pElement));
  }

  init(pTarget, rFunc) {
    this.pCBClass = pTarget;
    this.CBFunc = rFunc;
    return this;
  }

  $clone() { return new CallbackHandler$MessageDialog().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCBClass = o.pCBClass;
    this.CBFunc = o.CBFunc;
    return this;
  }
}

export class CallbackHandlerExPar$C4StartupPlrSelDlg$pListItem extends BaseCallbackHandler {
  pCBClass = null;
  par = null;
  CBFunc = null;

  DoCall$pElement(_pElement) {
    $spawn(this.pCBClass[this.CBFunc](this.par));
  }

  init(pTarget, rFunc, par) {
    this.pCBClass = pTarget;
    this.par = par;
    this.CBFunc = rFunc;
    return this;
  }

  $clone() { return new CallbackHandlerExPar$C4StartupPlrSelDlg$pListItem().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCBClass = o.pCBClass;
    this.par = o.par;
    this.CBFunc = o.CBFunc;
    return this;
  }
}

export class CallbackHandlerExPar$C4StartupScenSelDlg$pScenListItem extends BaseCallbackHandler {
  pCBClass = null;
  par = null;
  CBFunc = null;

  DoCall$pElement(_pElement) {
    $spawn(this.pCBClass[this.CBFunc](this.par));
  }

  init(pTarget, rFunc, par) {
    this.pCBClass = pTarget;
    this.par = par;
    this.CBFunc = rFunc;
    return this;
  }

  $clone() { return new CallbackHandlerExPar$C4StartupScenSelDlg$pScenListItem().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCBClass = o.pCBClass;
    this.par = o.par;
    this.CBFunc = o.CBFunc;
    return this;
  }
}

export class BaseParCallbackHandler$i32 extends BaseCallbackHandler {

  DoCall$pElement(_pElement) {
    0;
  }

  $clone() { return new BaseParCallbackHandler$i32().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class Label extends Element {
  sText = new $.StdStrBuf();
  dwFgClr = 0;
  x0 = 0;
  iAlign = 0;
  pFont = null;
  cHotkey = 0;
  fAutosize = false;
  fMarkup = false;
  pClickFocusControl = null;

  DrawElement(cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Label && Label.prototype instanceof $c) return $c.prototype.DrawElement.apply(this, arguments); }
    $.pDraw.TextOut(this.sText.getData(), this.pFont, 1, cgo.Surface, Math.fround(Math.fround(this.x0) + cgo.TargetX), Math.fround(Math.fround(this.rcBounds.y) + cgo.TargetY), this.dwFgClr, this.iAlign & 0xff, this.fMarkup);
  }

  UpdateOwnPos() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Label && Label.prototype instanceof $c) return $c.prototype.UpdateOwnPos.apply(this, arguments); }
    switch (this.iAlign) {
      case 0:
        this.x0 = this.rcBounds.x + this.GetLeftIndent() | 0;
        break;
      case 1:
        this.x0 = this.rcBounds.x + (this.rcBounds.Wdt / 2 | 0) | 0;
        break;
      case 2:
        this.x0 = this.rcBounds.x + this.rcBounds.Wdt | 0;
        break;
    }
  }

  OnHotkey(cHotkey) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Label && Label.prototype instanceof $c) return $c.prototype.OnHotkey.apply(this, arguments); }
    if (this.cHotkey === cHotkey && this.pClickFocusControl != null) {
      this.GetDlg().SetFocus(this.pClickFocusControl, false);
      return true;
    } else {
      return false;
    }
  }

  GetLeftIndent() {
    return 0;
  }

  init$pi8$i32$i32$i32$u32$pCStdFont$b$b(szLblText, iX0, iTop, iAlign = 0, dwFClr = 0xffffffff, pFont = null, fMakeReadableOnBlack = true, fMarkup = true) {
    super.init();
    this.sText = new $.StdStrBuf();
    this.dwFgClr = dwFClr;
    this.x0 = iX0;
    this.iAlign = iAlign;
    this.pFont = pFont;
    this.cHotkey = 0;
    this.fAutosize = true;
    this.fMarkup = fMarkup;
    this.pClickFocusControl = null;
    this.$dyn = Label;
    if (fMakeReadableOnBlack) {
      MakeColorReadableOnBlack(P(this, "dwFgClr"));
    }
    if (this.pFont == null) {
      this.pFont = $.GraphicsResource.TextFont;
    }
    this.rcBounds.y = iTop;
    Label.prototype.SetText$pi8$b.call(this, szLblText);
    return this;
  }

  init$pi8$C4Rect$i32$u32$pCStdFont$b$b$b(szLblText, rcBounds, iAlign = 0, dwFClr = 0xffffffff, pFont = null, fMakeReadableOnBlack = true, fAutosize = true, fMarkup = true) {
    super.init();
    this.sText = new $.StdStrBuf();
    this.dwFgClr = dwFClr;
    this.iAlign = iAlign;
    this.pFont = pFont;
    this.cHotkey = 0;
    this.fAutosize = fAutosize;
    this.fMarkup = fMarkup;
    this.pClickFocusControl = null;
    this.$dyn = Label;
    if (fMakeReadableOnBlack) {
      MakeColorReadableOnBlack(P(this, "dwFgClr"));
    }
    this.rcBounds.$assign(rcBounds);
    if (this.pFont == null) {
      this.pFont = $.GraphicsResource.TextFont;
    }
    Label.prototype.UpdateOwnPos.call(this);
    Label.prototype.SetText$pi8$b.call(this, szLblText);
    return this;
  }

  MouseInput$rCMouse$i32$i32$i32$u32(rMouse, iButton, iX, iY, dwKeyParam) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Label && Label.prototype instanceof $c) return $c.prototype.MouseInput$rCMouse$i32$i32$i32$u32.apply(this, arguments); }
    if (this.pClickFocusControl != null && iButton === 1) {
      this.GetDlg().SetFocus(this.pClickFocusControl, true);
    }
    $spawn(Element.prototype.MouseInput$rCMouse$i32$i32$i32$u32.call(this, rMouse, iButton, iX, iY, dwKeyParam));
  }

  SetText$pi8$b(szToText, fAllowHotkey = true) {
    if (szToText != null) {
      this.sText.Copy$pi8(szToText);
      if (fAllowHotkey && this.fMarkup) {
        ExpandHotkeyMarkup(this.sText, P(this, "cHotkey"));
      }
    } else {
      $.StdStrBuf.prototype.op_assign$pi8.call(this.sText, S(""));
      this.cHotkey = 0;
    }
    if (!this.fAutosize) {
      return;
    }
    this.pFont.GetTextExtent(this.sText.getData(), P(this.rcBounds, "Wdt"), P(this.rcBounds, "Hgt"), this.fMarkup);
    this.SetX0(this.x0);
  }

  GetText$v() {
    return this.sText.getData();
  }

  SetClickFocusControl(pToCtrl) {
    this.pClickFocusControl = pToCtrl;
  }

  SetColor$u32$b(dwToClr$, fMakeReadableOnBlack = true) {
    const dwToClr = [dwToClr$];
    this.dwFgClr = fMakeReadableOnBlack ? MakeColorReadableOnBlack(P(dwToClr, 0)) : dwToClr[0];
  }

  SetX0(iToX0) {
    this.x0 = iToX0;
    switch (this.iAlign) {
      case 0:
        this.rcBounds.x = this.x0;
        break;
      case 1:
        this.rcBounds.x = this.x0 - (this.rcBounds.Wdt / 2 | 0) | 0;
        break;
      case 2:
        this.rcBounds.x = this.x0 - this.rcBounds.Wdt | 0;
        break;
    }
    this.UpdateSize();
  }

  SetAutosize(fToVal) {
    this.fAutosize = fToVal;
  }

  $clone() { return new Label().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.sText.$assign(o.sText);
    this.dwFgClr = o.dwFgClr;
    this.x0 = o.x0;
    this.iAlign = o.iAlign;
    this.pFont = o.pFont;
    this.cHotkey = o.cHotkey;
    this.fAutosize = o.fAutosize;
    this.fMarkup = o.fMarkup;
    this.pClickFocusControl = o.pClickFocusControl;
    return this;
  }
}

export class MultilineLabel extends Element {
  Lines = new $.C4LogBuffer();
  fMarkup = false;

  DrawElement(cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== MultilineLabel && MultilineLabel.prototype instanceof $c) return $c.prototype.DrawElement.apply(this, arguments); }
    const iClipX = [0];
    const iClipY = [0];
    const iClipX2 = [0];
    const iClipY2 = [0];
    $.pDraw.GetPrimaryClipper(P(iClipX, 0), P(iClipY, 0), P(iClipX2, 0), P(iClipY2, 0));
    let iIndex = 0;
    let szLine = null;
    let iY = ftoi32(Math.fround(Math.fround(this.rcBounds.y) + cgo.TargetY));
    const pLineFont = [null];
    const dwLineClr = [0];
    const fNewParagraph = [false];
    while ((szLine = this.Lines.GetLine(iIndex, P(pLineFont, 0), P(dwLineClr, 0), P(fNewParagraph, 0))) != null) {
      let iFontLineHeight = pLineFont[0].GetLineHeight();
      if (fNewParagraph[0] && iIndex !== 0) {
        iY = iY + (iFontLineHeight / 3 | 0) | 0;
      }
      if (iY > iClipY2[0]) {
        break;
      }
      if (iY >= (iClipY[0] - iFontLineHeight | 0)) {
        $.pDraw.TextOut(szLine, pLineFont[0], 1, cgo.Surface, Math.fround(Math.fround(this.rcBounds.x) + cgo.TargetX), Math.fround(iY), dwLineClr[0], 0, this.fMarkup);
      }
      iY = iY + iFontLineHeight | 0;
      iIndex = iIndex + 1 | 0;
    }
  }

  UpdateHeight() {
    let iIndex = 0;
    let szLine = null;
    let iHgt = 0;
    const pLineFont = [null];
    const fNewPar = [false];
    while ((szLine = this.Lines.GetLine(iIndex, P(pLineFont, 0), null, P(fNewPar, 0))) != null) {
      let iFontLineHeight = pLineFont[0].GetLineHeight();
      if (fNewPar[0] && iIndex !== 0) {
        iHgt = iHgt + (iFontLineHeight / 3 | 0) | 0;
      }
      iHgt = iHgt + iFontLineHeight | 0;
      iIndex = iIndex + 1 | 0;
    }
    this.rcBounds.Hgt = $max(iHgt, 5);
    Element.prototype.UpdateSize.call(this);
  }

  UpdateSize() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== MultilineLabel && MultilineLabel.prototype instanceof $c) return $c.prototype.UpdateSize.apply(this, arguments); }
    this.Lines.SetLBWidth(this.rcBounds.Wdt);
    this.UpdateHeight();
  }

  init(rcBounds, iMaxLines, iMaxBuf, szIndentChars, fAutoGrow, fMarkup) {
    super.init();
    this.Lines = new $.C4LogBuffer().init(iMaxBuf, iMaxLines, rcBounds.Wdt, szIndentChars, fAutoGrow, fMarkup);
    this.fMarkup = fMarkup;
    this.$dyn = MultilineLabel;
    this.rcBounds.$assign(rcBounds);
    this.UpdateOwnPos();
    return this;
  }

  AddLine$pi8$pCStdFont$u32$b$b$pCStdFont(szLine, pFont, dwClr$, fDoUpdate, fMakeReadableOnBlack, pCaptionFont) {
    const dwClr = [dwClr$];
    if (fMakeReadableOnBlack) {
      MakeColorReadableOnBlack(P(dwClr, 0));
    }
    if (szLine != null) {
      this.Lines.AppendLines(szLine, pFont, dwClr[0], pCaptionFont);
    }
    if (fDoUpdate) {
      this.UpdateSize();
    }
  }

  Clear$b(fDoUpdate) {
    this.Lines.Clear();
    if (fDoUpdate) {
      this.UpdateSize();
    }
  }

  $clone() { return new MultilineLabel().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Lines.$assign(o.Lines);
    this.fMarkup = o.fMarkup;
    return this;
  }
}

export class ProgressBar extends Element {
  iProgress = 0;
  iMax = 0;

  DrawElement(cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ProgressBar && ProgressBar.prototype instanceof $c) return $c.prototype.DrawElement.apply(this, arguments); }
    if (this.iProgress < 0) {
      return;
    }
    const rFont = $.GraphicsResource.TextFont;
    this.Draw3DFrame(cgo);
    let iProgressWdt = Math.imul(this.rcBounds.Wdt - 4 | 0, this.iProgress) / this.iMax | 0;
    $.GraphicsResource.fctProgressBar.DrawX(cgo.Surface, Math.fround(Math.fround(cgo.TargetX + Math.fround(this.rcBounds.x)) + Math.fround(2)), Math.fround(Math.fround(cgo.TargetY + Math.fround(this.rcBounds.y)) + Math.fround(2)), Math.fround(iProgressWdt), Math.fround(this.rcBounds.Hgt - 2 | 0));
    const szPrg = new Int8Array(33);
    $.ssprintf$15(szPrg, S("%i%%"), Math.imul(100, this.iProgress) / this.iMax | 0);
    $.pDraw.TextOut(P(szPrg, 0), rFont, 1, cgo.Surface, Math.fround(cgo.TargetX + Math.fround(this.rcBounds.GetMiddleX())), Math.fround(Math.fround(Math.fround(Math.fround(this.rcBounds.y) + cgo.TargetY) + Math.fround((this.rcBounds.Hgt - rFont.GetLineHeight() | 0) / 2 | 0)) - Math.fround(1)), 0xffffffff, 1);
  }

  init(rrcBounds, iMaxProgress = 100) {
    super.init();
    this.iProgress = 0;
    this.iMax = iMaxProgress;
    this.$dyn = ProgressBar;
    this.rcBounds.$assign(rrcBounds);
    this.UpdatePos();
    return this;
  }

  SetProgress(iToProgress) {
    this.iProgress = iToProgress;
  }

  $clone() { return new ProgressBar().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.iProgress = o.iProgress;
    this.iMax = o.iMax;
    return this;
  }
}

export class HorizontalLine extends Element {
  dwClr = 0;
  dwShadowClr = 0;

  DrawElement(cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== HorizontalLine && HorizontalLine.prototype instanceof $c) return $c.prototype.DrawElement.apply(this, arguments); }
    let iX1 = ftoi32(Math.fround(Math.fround(this.rcBounds.x) + cgo.TargetX));
    let iX2 = iX1 + this.rcBounds.Wdt | 0;
    let iY = ftoi32(Math.fround(Math.fround(this.rcBounds.y) + cgo.TargetY));
    $.pDraw.DrawLineDw(cgo.Surface, Math.fround(iX1 + 1 | 0), Math.fround(iY + 1 | 0), Math.fround(iX2 - 1 | 0), Math.fround(iY + 1 | 0), this.dwShadowClr);
    $.pDraw.DrawLineDw(cgo.Surface, Math.fround(iX1), Math.fround(iY), Math.fround(iX2 - 2 | 0), Math.fround(iY), this.dwClr);
  }

  init(rrcBounds, dwClr = 0, dwShadowClr = 0xaf7f7f7f) {
    super.init();
    this.dwClr = dwClr;
    this.dwShadowClr = dwShadowClr;
    this.$dyn = HorizontalLine;
    this.SetBounds(rrcBounds);
    return this;
  }

  $clone() { return new HorizontalLine().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.dwClr = o.dwClr;
    this.dwShadowClr = o.dwShadowClr;
    return this;
  }
}

export class Picture extends Element {
  Facet = new $.C4FacetSurface().init();
  fAspect = false;
  fCustomDrawClr = false;
  dwDrawClr = 0;
  fAnimate = false;
  iPhaseTime = 0;
  iAnimationPhase = 0;
  iDelay = 0;

  DrawElement(cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Picture && Picture.prototype instanceof $c) return $c.prototype.DrawElement.apply(this, arguments); }
    let pDrawFacet = null;
    let DrawFacet = new $.C4Facet().init$v();
    if (this.fAnimate) {
      if ((this.iPhaseTime = this.iPhaseTime + 1 | 0) > this.iDelay) {
        const iPhasesX = [1];
        const iPhasesY = [1];
        this.Facet.GetPhaseNum(P(iPhasesX, 0), P(iPhasesY, 0));
        if ((this.iAnimationPhase = this.iAnimationPhase + 1 | 0) >= iPhasesX[0]) {
          this.iAnimationPhase = 0;
        }
        this.iPhaseTime = 0;
      }
      DrawFacet.$assign(this.Facet.GetPhase(this.iAnimationPhase));
      pDrawFacet = DrawFacet;
    } else {
      pDrawFacet = this.Facet;
    }
    let cgo2 = cgo.$clone();
    cgo2.X = Math.fround(Math.fround(this.rcBounds.x) + cgo.TargetX);
    cgo2.Y = Math.fround(Math.fround(this.rcBounds.y) + cgo.TargetY);
    cgo2.Wdt = Math.fround(this.rcBounds.Wdt);
    cgo2.Hgt = Math.fround(this.rcBounds.Hgt);
    if (this.fCustomDrawClr) {
      pDrawFacet.DrawClr(cgo2, this.fAspect, this.dwDrawClr);
    } else {
      pDrawFacet.Draw$rC4Facet$b$i32$i32$b(cgo2, this.fAspect);
    }
  }

  init(rcBounds, fAspect) {
    super.init();
    this.Facet = new $.C4FacetSurface().init();
    this.fCustomDrawClr = false;
    this.fAnimate = false;
    this.$dyn = Picture;
    this.fAspect = fAspect;
    this.rcBounds.$assign(rcBounds);
    return this;
  }

  GetFacet() {
    return this.Facet;
  }

  GetMFacet() {
    return this.Facet;
  }

  SetFacet$C4Facet(fct) {
    $.C4FacetSurface.prototype.Clear.call(this.Facet);
    this.Facet.Set$C4Facet(fct);
  }

  EnsureOwnSurface() {
    if (this.Facet.Surface == null) {
      return false;
    }
    if (this.Facet.Surface === this.Facet.GetFace()) {
      return true;
    }
    let cgo = this.Facet.$clone();
    if (!this.Facet.Create(ftoi32(cgo.Wdt), ftoi32(cgo.Hgt))) {
      return false;
    }
    cgo.Draw$rC4Facet$b$i32$i32$b(this.Facet);
    return true;
  }

  SetDrawColor(dwToClr) {
    this.dwDrawClr = dwToClr;
    this.fCustomDrawClr = true;
  }

  SetAnimated(fEnabled, iDelay) {
    if (this.fAnimate = fEnabled) {
      this.iAnimationPhase = this.iPhaseTime = 0;
      this.iDelay = iDelay;
    }
  }

  $clone() { return new Picture().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Facet.$assign(o.Facet);
    this.fAspect = o.fAspect;
    this.fCustomDrawClr = o.fCustomDrawClr;
    this.dwDrawClr = o.dwDrawClr;
    this.fAnimate = o.fAnimate;
    this.iPhaseTime = o.iPhaseTime;
    this.iAnimationPhase = o.iAnimationPhase;
    this.iDelay = o.iDelay;
    return this;
  }
}

export class Container extends Element {
  pFirst = null;
  pLast = null;

  Draw$rC4TargetFacet(cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Container && Container.prototype instanceof $c) return $c.prototype.Draw$rC4TargetFacet.apply(this, arguments); }
    if (!this.IsVisible()) {
      return;
    }
    for (let pEl = this.pFirst; pEl != null; pEl = pEl.pNext) {
      if (pEl.fVisible) {
        if (!pEl.IsExternalDrawDialog()) {
          if (pEl.GetDialogWindow() != null) {
            pEl.GetDialogWindow().RequestUpdate();
          } else {
            pEl.Draw$rC4TargetFacet(cgo);
          }
        }
      }
    }
  }

  ElementSizeChanged(_pOfElement) {
  }

  ElementPosChanged(_pOfElement) {
  }

  AfterElementRemoval() {
    if (this.pParent != null) {
      this.pParent.AfterElementRemoval();
    }
  }

  OnHotkey(cHotkey) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Container && Container.prototype instanceof $c) return $c.prototype.OnHotkey.apply(this, arguments); }
    if (!this.IsVisible()) {
      return false;
    }
    for (let pEl = this.pFirst; pEl != null; pEl = pEl.pNext) {
      if (pEl.fVisible) {
        if (pEl.OnHotkey(cHotkey)) {
          return true;
        }
      }
    }
    return false;
  }

  init() {
    super.init();
    this.$dyn = Container;
    this.pFirst = this.pLast = null;
    return this;
  }

  $dtor() {
    Container.prototype.Clear$v.call(this);
    super.$dtor();
  }

  Clear$v() {
    this.ClearChildren$v();
  }

  ClearChildren$v() {
    while (this.pFirst != null) {
      if (this.pFirst.IsOwnPtrElement()) {
        let pANext = this.pFirst.pNext;
        this.pFirst.pPrev = this.pFirst.pNext = null;
        this.pFirst.pParent = null;
        if ((this.pFirst = pANext) != null) {
          this.pFirst.pPrev = null;
        } else {
          this.pLast = null;
        }
      } else {
        $delete(this.pFirst);
      }
    }
  }

  RemoveElement(pChild) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Container && Container.prototype instanceof $c) return $c.prototype.RemoveElement.apply(this, arguments); }
    if (pChild == null) {
      return;
    }
    Element.prototype.RemoveElement.call(this, pChild);
    if (pChild.pParent !== this) {
      return;
    }
    if (pChild.pPrev != null) {
      pChild.pPrev.pNext = pChild.pNext;
    } else {
      this.pFirst = pChild.pNext;
    }
    if (pChild.pNext != null) {
      pChild.pNext.pPrev = pChild.pPrev;
    } else {
      this.pLast = pChild.pPrev;
    }
    pChild.pParent = null;
    this.AfterElementRemoval();
  }

  MakeLastElement(pChild) {
    if (pChild.pParent !== this) {
      return;
    }
    if (pChild.pPrev != null) {
      pChild.pPrev.pNext = pChild.pNext;
    } else {
      this.pFirst = pChild.pNext;
    }
    if (pChild.pNext != null) {
      pChild.pNext.pPrev = pChild.pPrev;
    } else {
      this.pLast = pChild.pPrev;
    }
    if (this.pLast != null) {
      this.pLast.pNext = pChild;
    } else {
      this.pFirst = pChild;
    }
    pChild.pPrev = this.pLast;
    pChild.pNext = null;
    this.pLast = pChild;
  }

  AddElement$pElement(pChild) {
    if (pChild == null) {
      return;
    }
    if (pChild.pParent != null) {
      pChild.pParent.RemoveElement(pChild);
    }
    if (this.pLast != null) {
      this.pLast.pNext = pChild;
    } else {
      this.pFirst = pChild;
    }
    pChild.pPrev = this.pLast;
    pChild.pNext = null;
    this.pLast = pChild;
    pChild.pParent = this;
    0;
    0;
    0;
  }

  ReaddElement(pChild) {
    if (pChild == null || pChild.pParent !== this) {
      return;
    }
    if (pChild.pPrev != null) {
      pChild.pPrev.pNext = pChild.pNext;
    } else {
      this.pFirst = pChild.pNext;
    }
    if (pChild.pNext != null) {
      pChild.pNext.pPrev = pChild.pPrev;
    } else {
      this.pLast = pChild.pPrev;
    }
    if (this.pLast != null) {
      this.pLast.pNext = pChild;
    } else {
      this.pFirst = pChild;
    }
    pChild.pPrev = this.pLast;
    pChild.pNext = null;
    this.pLast = pChild;
    0;
    0;
    0;
  }

  InsertElement$pElement$pElement(pChild, pInsertBefore) {
    if (pInsertBefore == null) {
      Container.prototype.AddElement$pElement.call(this, pChild);
      return;
    }
    if (pChild == null || pInsertBefore.pParent !== this) {
      return;
    }
    if (pChild.pParent != null) {
      pChild.pParent.RemoveElement(pChild);
    }
    if ((pChild.pPrev = pInsertBefore.pPrev) != null) {
      pInsertBefore.pPrev.pNext = pChild;
    } else {
      this.pFirst = pChild;
    }
    pChild.pNext = pInsertBefore;
    pInsertBefore.pPrev = pChild;
    pChild.pParent = this;
    0;
    0;
    0;
  }

  GetNextNestedElement(pPrevElement, fBackwards) {
    if (fBackwards) {
      if (pPrevElement === this) {
        return null;
      }
      if (pPrevElement == null) {
        return this.GetFirstNestedElement(true);
      }
      if (pPrevElement.pPrev != null) {
        return pPrevElement.pPrev.GetFirstNestedElement(true);
      }
      return pPrevElement.pParent;
    } else {
      if (pPrevElement == null) {
        return this;
      }
      let pEl = null;
      if ((pEl = pPrevElement.GetFirstContained()) != null) {
        return pEl;
      }
      while (pPrevElement != null && pPrevElement !== this) {
        if ((pEl = pPrevElement.pNext) != null) {
          return pEl;
        }
        pPrevElement = pPrevElement.pParent;
      }
    }
    return null;
  }

  GetFirstContained() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Container && Container.prototype instanceof $c) return $c.prototype.GetFirstContained.apply(this, arguments); }
    return this.pFirst;
  }

  GetLastContained() {
    return this.pLast;
  }

  GetFirstNestedElement(fBackwards) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Container && Container.prototype instanceof $c) return $c.prototype.GetFirstNestedElement.apply(this, arguments); }
    if (this.pFirst != null) {
      return (fBackwards ? this.pLast : this.pFirst).GetFirstNestedElement(fBackwards);
    }
    return this;
  }

  begin() {
    return new Container$Iterator().init(this.pFirst);
  }

  end() {
    return new Container$Iterator().init(null);
  }

  rbegin() {
    return new Container$ReverseIterator().init(this.pLast);
  }

  rend() {
    return new Container$ReverseIterator().init(null);
  }

  GetFirst() {
    return this.pFirst;
  }

  GetLast() {
    return this.pLast;
  }

  GetContainer() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Container && Container.prototype instanceof $c) return $c.prototype.GetContainer.apply(this, arguments); }
    return this;
  }

  GetElementByIndex(i) {
    let $t1;
    let pEl = null;
    for (pEl = this.pFirst; ($t1 = i, i = i - 1 | 0, $t1) !== 0 && pEl != null; pEl = pEl.pNext) {
    }
    return pEl;
  }

  GetElementCount() {
    let cnt = 0;
    for (let pEl = this.pFirst; pEl != null; pEl = pEl.pNext) {
      cnt = cnt + 1 | 0;
    }
    return cnt;
  }

  SetVisibility(fToValue) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Container && Container.prototype instanceof $c) return $c.prototype.SetVisibility.apply(this, arguments); }
    Element.prototype.SetVisibility.call(this, fToValue);
    if (!fToValue) {
      let pDlg = this.GetDlg();
      if (pDlg != null) {
        let pFocus = pDlg.GetFocus();
        if (pFocus != null) {
          if (this.IsParentOf(pFocus)) {
            pDlg.SetFocus(null, false);
          }
        }
      }
    }
  }

  IsFocused(pCtrl) {
    return this.pParent != null ? this.pParent.IsFocused(pCtrl) : false;
  }

  IsSelectedChild(pChild) {
    return this.pParent != null ? this.pParent.IsSelectedChild(pChild) : true;
  }

  IsParentOf(pEl) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Container && Container.prototype instanceof $c) return $c.prototype.IsParentOf.apply(this, arguments); }
    for (let pC = pEl.GetParent(); pC != null; pC = pC.GetParent()) {
      if (pC === this) {
        return true;
      }
    }
    return false;
  }

  ApplyElementOffset(_riX, _riY) {
  }

  ApplyInvElementOffset(_riX, _riY) {
  }

  $clone() { return new Container().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFirst = o.pFirst;
    this.pLast = o.pLast;
    return this;
  }
}

export class ScrollBar extends Element {
  fScrolling = false;
  fAutoHide = false;
  iScrollThumbSize = 0;
  iScrollPos = 0;
  fTopDown = false;
  fBottomDown = false;
  fHorizontal = false;
  iCBMaxRange = 0;
  pScrollWindow = null;
  pScrollCallback = null;
  pCustomGfx = null;

  Update$v() {
    if (this.pScrollWindow != null) {
      let iVisHgt = this.pScrollWindow.GetBounds().Hgt;
      let iClientHgt = this.pScrollWindow.GetClientRect().Hgt;
      if (this.fScrolling = iVisHgt < iClientHgt) {
        let iMaxWinScroll = iClientHgt - iVisHgt | 0;
        let iMaxBarScroll = (this.GetBounds().Hgt - 32 | 0) - this.iScrollThumbSize | 0;
        let iWinScroll = this.pScrollWindow.iScrollY;
        this.iScrollPos = $.Clamp$i32$i32$i32(Math.imul(iMaxBarScroll, iWinScroll) / iMaxWinScroll | 0, 0, iMaxBarScroll);
      }
    } else {
      this.fScrolling = !(this.pScrollCallback == null);
    }
    if (!this.fScrolling) {
      this.fTopDown = this.fBottomDown = false;
    }
    if (this.fAutoHide) {
      this.SetVisibility(this.fScrolling);
    }
  }

  OnPosChanged() {
    let iMaxBarScroll = this.GetMaxScroll();
    if (iMaxBarScroll === 0) {
      iMaxBarScroll = 1;
    }
    if (this.pScrollCallback != null) {
      this.pScrollCallback.DoCall$i32($.Clamp$i32$i32$i32(Math.imul(this.iScrollPos, this.iCBMaxRange - 1 | 0) / iMaxBarScroll | 0, 0, this.iCBMaxRange - 1 | 0));
    }
    if (this.pScrollWindow == null || !this.fScrolling) {
      return;
    }
    0;
    let iVisHgt = this.pScrollWindow.GetBounds().Hgt;
    let iClientHgt = this.pScrollWindow.GetClientRect().Hgt;
    let iMaxWinScroll = iClientHgt - iVisHgt | 0;
    let iWinScroll = this.pScrollWindow.iScrollY;
    let iNewWinScroll = $.Clamp$i32$i32$i32(Math.imul(iMaxWinScroll, this.iScrollPos) / iMaxBarScroll | 0, 0, iMaxWinScroll);
    if (iWinScroll !== iNewWinScroll) {
      this.pScrollWindow.SetScroll(iNewWinScroll);
    }
  }

  DrawElement(cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ScrollBar && ScrollBar.prototype instanceof $c) return $c.prototype.DrawElement.apply(this, arguments); }
    if (this.fTopDown && this.fScrolling && this.iScrollPos > 0) {
      this.iScrollPos = this.iScrollPos - 1 | 0;
      this.OnPosChanged();
    }
    if (this.fBottomDown && this.fScrolling) {
      if (this.iScrollPos < this.GetMaxScroll()) {
        this.iScrollPos = this.iScrollPos + 1 | 0;
        this.OnPosChanged();
      }
    }
    const rUseGfx = this.pCustomGfx != null ? this.pCustomGfx : $.GraphicsResource.sfctScroll;
    let bar = rUseGfx.barScroll.$clone();
    if (this.fTopDown) {
      bar.fctBegin.$assign(rUseGfx.fctScrollDTop);
    }
    if (this.fBottomDown) {
      bar.fctEnd.$assign(rUseGfx.fctScrollDBottom);
    }
    if (this.fHorizontal) {
      this.DrawHBarByVGfx(cgo, bar);
    } else {
      this.DrawVBar(cgo, bar);
    }
    if (this.fScrolling && this.HasPin()) {
      if (this.fHorizontal) {
        rUseGfx.fctScrollPin.Draw$pC4Surface$f32$f32$i32$i32(cgo.Surface, Math.fround(Math.fround(Math.fround(cgo.TargetX + Math.fround(this.rcBounds.x)) + Math.fround(16)) + Math.fround(this.iScrollPos)), Math.fround(cgo.TargetY + Math.fround(this.rcBounds.y)));
      } else {
        rUseGfx.fctScrollPin.Draw$pC4Surface$f32$f32$i32$i32(cgo.Surface, Math.fround(cgo.TargetX + Math.fround(this.rcBounds.x)), Math.fround(Math.fround(Math.fround(cgo.TargetY + Math.fround(this.rcBounds.y)) + Math.fround(16)) + Math.fround(this.iScrollPos)));
      }
    }
  }

  HasPin() {
    if (this.fHorizontal) {
      return this.rcBounds.Wdt > 48;
    } else {
      return this.rcBounds.Hgt > 48;
    }
  }

  GetMaxScroll() {
    if (this.fHorizontal) {
      return this.HasPin() ? (this.GetBounds().Wdt - 32 | 0) - this.iScrollThumbSize | 0 : 100;
    } else {
      return this.HasPin() ? (this.GetBounds().Hgt - 32 | 0) - this.iScrollThumbSize | 0 : 100;
    }
  }

  GetScrollByPos(iX, iY) {
    return $.Clamp$i32$i32$i32((this.fHorizontal ? iX - 16 | 0 : iY - 16 | 0) - (this.iScrollThumbSize / 2 | 0) | 0, 0, this.GetMaxScroll());
  }

  IsScrolling() {
    return this.fScrolling;
  }

  init$rC4Rect$pScrollWindow(rcBounds, pWin) {
    super.init();
    this.fAutoHide = false;
    this.fHorizontal = false;
    this.iCBMaxRange = 100;
    this.pScrollCallback = null;
    this.pCustomGfx = null;
    this.$dyn = ScrollBar;
    this.rcBounds.$assign(rcBounds);
    this.pScrollWindow = pWin;
    this.fScrolling = false;
    this.iScrollThumbSize = 16;
    this.iScrollPos = 0;
    this.fTopDown = this.fBottomDown = false;
    ScrollBar.prototype.Update$v.call(this);
    return this;
  }

  init$rC4Rect$b$pBaseParCallbackHandler$i32(rcBounds, fHorizontal, pCB, iCBMaxRange = 256) {
    super.init();
    this.fAutoHide = false;
    this.fHorizontal = fHorizontal;
    this.iCBMaxRange = iCBMaxRange;
    this.pScrollWindow = null;
    this.pCustomGfx = null;
    this.$dyn = ScrollBar;
    this.rcBounds.$assign(rcBounds);
    if ((this.pScrollCallback = pCB) != null) {
      this.pScrollCallback.Ref();
    }
    this.fScrolling = true;
    this.iScrollThumbSize = fHorizontal ? 16 : 16;
    this.iScrollPos = 0;
    this.fTopDown = this.fBottomDown = false;
    return this;
  }

  $dtor() {
    if (this.pScrollWindow != null) {
      this.pScrollWindow.pScrollBar = null;
    }
    if (this.pScrollCallback != null) {
      this.pScrollCallback.DeRef();
    }
    super.$dtor();
  }

  MouseInput$rCMouse$i32$i32$i32$u32(rMouse, iButton, iX, iY, dwKeyParam) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ScrollBar && ScrollBar.prototype instanceof $c) return $c.prototype.MouseInput$rCMouse$i32$i32$i32$u32.apply(this, arguments); }
    $spawn(Element.prototype.MouseInput$rCMouse$i32$i32$i32$u32.call(this, rMouse, iButton, iX, iY, dwKeyParam));
    if (!this.fScrolling) {
      return;
    }
    let fPrevDown = this.fTopDown || this.fBottomDown;
    this.fTopDown = this.fBottomDown = false;
    if (rMouse.pDragElement != null) {
      return;
    }
    if (rMouse.IsLDown()) {
      if (this.fHorizontal ? $.Inside$i32$i32$i32$3(iY, 0, 16) : $.Inside$i32$i32$i32$3(iX, 0, 16)) {
        if (this.fHorizontal ? $.Inside$i32$i32$i32$3(iX, 0, 15) : $.Inside$i32$i32$i32$3(iY, 0, 15)) {
          this.fTopDown = true;
        } else if (this.fHorizontal ? $.Inside$i32$i32$i32$3(iX, this.GetBounds().Wdt - 16 | 0, this.GetBounds().Wdt - 1 | 0) : $.Inside$i32$i32$i32$3(iY, this.GetBounds().Hgt - 16 | 0, this.GetBounds().Hgt - 1 | 0)) {
          this.fBottomDown = true;
        } else if (this.HasPin() && (this.fHorizontal ? $.Inside$i32$i32$i32$3(iX, 16, (this.GetBounds().Wdt - 16 | 0) - 1 | 0) : $.Inside$i32$i32$i32$3(iY, 16, (this.GetBounds().Hgt - 16 | 0) - 1 | 0))) {
          this.iScrollPos = this.GetScrollByPos(iX, iY);
          this.OnPosChanged();
          rMouse.pDragElement = this;
          GUISound(S("UI::Select"));
        }
      }
    }
    if ((this.fTopDown || this.fBottomDown ? 1 : 0) !== (fPrevDown ? 1 : 0)) {
      GUISound(S("UI::Tick"));
    }
  }

  DoDragging(_rMouse, iX, iY, _dwKeyParam) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ScrollBar && ScrollBar.prototype instanceof $c) return $c.prototype.DoDragging.apply(this, arguments); }
    this.iScrollPos = this.GetScrollByPos(iX, iY);
    this.OnPosChanged();
  }

  MouseLeave(rMouse) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ScrollBar && ScrollBar.prototype instanceof $c) return $c.prototype.MouseLeave.apply(this, arguments); }
    Element.prototype.MouseLeave.call(this, rMouse);
    this.fTopDown = this.fBottomDown = false;
  }

  SetDecoration$pScrollBarFacets$b(pToGfx, fAutoHide) {
    this.pCustomGfx = pToGfx;
    this.fAutoHide = fAutoHide;
  }

  SetScrollPos(iToPos) {
    this.iScrollPos = Math.imul(iToPos, this.GetMaxScroll()) / (this.iCBMaxRange - 1 | 0) | 0;
  }

  $clone() { return new ScrollBar().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.fScrolling = o.fScrolling;
    this.fAutoHide = o.fAutoHide;
    this.iScrollThumbSize = o.iScrollThumbSize;
    this.iScrollPos = o.iScrollPos;
    this.fTopDown = o.fTopDown;
    this.fBottomDown = o.fBottomDown;
    this.fHorizontal = o.fHorizontal;
    this.iCBMaxRange = o.iCBMaxRange;
    this.pScrollWindow = o.pScrollWindow;
    this.pScrollCallback = o.pScrollCallback;
    this.pCustomGfx = o.pCustomGfx;
    return this;
  }
}

export class ContextMenu$Entry extends Element {
  sText = new $.StdStrBuf();
  cHotkey = 0;
  icoIcon = 0;
  pMenuHandler = null;
  pSubmenuHandler = null;

  GetIconIndent() {
    return this.icoIcon === -1 ? 0 : this.rcBounds.Hgt + 2 | 0;
  }

  DrawElement(cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ContextMenu$Entry && ContextMenu$Entry.prototype instanceof $c) return $c.prototype.DrawElement.apply(this, arguments); }
    if (this.icoIcon > -1) {
      const iXMax = [0];
      const iYMax = [0];
      $.GraphicsResource.fctIcons.GetPhaseNum(P(iXMax, 0), P(iYMax, 0));
      if (iXMax[0] === 0) {
        iXMax[0] = 6;
      }
      const rfctIcon = $.GraphicsResource.fctIcons.GetPhase(this.icoIcon % iXMax[0], this.icoIcon / iXMax[0] | 0);
      rfctIcon.DrawX(cgo.Surface, Math.fround(Math.fround(this.rcBounds.x) + cgo.TargetX), Math.fround(Math.fround(this.rcBounds.y) + cgo.TargetY), Math.fround(this.rcBounds.Hgt), Math.fround(this.rcBounds.Hgt));
    }
    if (!this.sText.op_not()) {
      $.pDraw.TextOut(this.sText.getData(), $.GraphicsResource.TextFont, 1, cgo.Surface, Math.fround(Math.fround(cgo.TargetX + Math.fround(this.rcBounds.x)) + Math.fround(this.GetIconIndent())), Math.fround(Math.fround(this.rcBounds.y) + cgo.TargetY), 0xffffffff, 0);
    }
    if (this.pSubmenuHandler != null) {
      const rSubFct = $.GraphicsResource.fctSubmenu;
      rSubFct.Draw$pC4Surface$f32$f32$i32$i32(cgo.Surface, Math.fround(Math.fround(Math.fround(cgo.TargetX + Math.fround(this.rcBounds.x)) + Math.fround(this.rcBounds.Wdt)) - rSubFct.Wdt), Math.fround(Math.fround(cgo.TargetY + Math.fround(this.rcBounds.y)) + Math.fround(Math.fround(Math.fround(this.rcBounds.Hgt) - rSubFct.Hgt) / Math.fround(2))));
    }
  }

  GetAndZeroCallback() {
    let pMH = this.pMenuHandler;
    this.pMenuHandler = null;
    return pMH;
  }

  MouseLeave(rMouse) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ContextMenu$Entry && ContextMenu$Entry.prototype instanceof $c) return $c.prototype.MouseLeave.apply(this, arguments); }
    if (this.GetParent() != null) {
      this.GetParent().MouseLeaveEntry(rMouse, this);
    }
  }

  OnHotkey(cKey) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ContextMenu$Entry && ContextMenu$Entry.prototype instanceof $c) return $c.prototype.OnHotkey.apply(this, arguments); }
    return cKey === this.cHotkey;
  }

  IsMenu() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ContextMenu$Entry && ContextMenu$Entry.prototype instanceof $c) return $c.prototype.IsMenu.apply(this, arguments); }
    return true;
  }

  init(szText, icoIcon = -1 /*Ico_None*/, pMenuHandler = null, pSubmenuHandler = null) {
    super.init();
    this.sText = new $.StdStrBuf();
    this.cHotkey = 0;
    this.icoIcon = icoIcon;
    this.pMenuHandler = pMenuHandler;
    this.pSubmenuHandler = pSubmenuHandler;
    this.$dyn = ContextMenu$Entry;
    if (szText != null) {
      this.sText.Copy$pi8(szText);
      ExpandHotkeyMarkup(this.sText, P(this, "cHotkey"));
      $.GraphicsResource.TextFont.GetTextExtent(this.sText.getData(), P(this.rcBounds, "Wdt"), P(this.rcBounds, "Hgt"), true);
    } else {
      this.rcBounds.Wdt = 40;
      this.rcBounds.Hgt = $.GraphicsResource.TextFont.GetLineHeight();
    }
    this.rcBounds.Wdt = this.rcBounds.Wdt + ContextMenu$Entry.prototype.GetIconIndent.call(this) | 0;
    if (pSubmenuHandler != null) {
      this.rcBounds.Wdt = ftoi32(Math.fround(Math.fround(this.rcBounds.Wdt) + Math.fround($.GraphicsResource.fctSubmenu.Wdt + Math.fround(2))));
    }
    return this;
  }

  $dtor() {
    if (this.pMenuHandler != null) {
      $delete(this.pMenuHandler);
    }
    if (this.pSubmenuHandler != null) {
      $delete(this.pSubmenuHandler);
    }
    super.$dtor();
  }

  GetText$v() {
    return this.sText.getData();
  }

  $clone() { return new ContextMenu$Entry().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.sText.$assign(o.sText);
    this.cHotkey = o.cHotkey;
    this.icoIcon = o.icoIcon;
    this.pMenuHandler = o.pMenuHandler;
    this.pSubmenuHandler = o.pSubmenuHandler;
    return this;
  }
}

export class ComboBox_FillCallback$C4FileSelDlg extends ComboBox_FillCB {
  pCBClass = null;
  FillFunc = null;
  SelFunc = null;

  FillDropDownCB() {
    if (this.pCBClass != null && this.FillFunc != null) {
      $spawn(this.pCBClass[this.FillFunc](this));
    }
  }

  OnComboSelChange(pForCombo, idNewSelection) {
    if (this.pCBClass != null && this.SelFunc != null) {
      return $spawn(this.pCBClass[this.SelFunc](pForCombo, idNewSelection));
    } else {
      return false;
    }
  }

  init(pCBClass, FillFunc, SelFunc) {
    this.pCBClass = pCBClass;
    this.FillFunc = FillFunc;
    this.SelFunc = SelFunc;
    return this;
  }

  $clone() { return new ComboBox_FillCallback$C4FileSelDlg().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCBClass = o.pCBClass;
    this.FillFunc = o.FillFunc;
    this.SelFunc = o.SelFunc;
    return this;
  }
}

export class ComboBox_FillCallback$OptionDropdown extends ComboBox_FillCB {
  pCBClass = null;
  FillFunc = null;
  SelFunc = null;

  FillDropDownCB() {
    if (this.pCBClass != null && this.FillFunc != null) {
      this.pCBClass[this.FillFunc](this);
    }
  }

  OnComboSelChange(pForCombo, idNewSelection) {
    if (this.pCBClass != null && this.SelFunc != null) {
      return this.pCBClass[this.SelFunc](pForCombo, idNewSelection);
    } else {
      return false;
    }
  }

  init(pCBClass, FillFunc, SelFunc) {
    this.pCBClass = pCBClass;
    this.FillFunc = FillFunc;
    this.SelFunc = SelFunc;
    return this;
  }

  $clone() { return new ComboBox_FillCallback$OptionDropdown().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCBClass = o.pCBClass;
    this.FillFunc = o.FillFunc;
    this.SelFunc = o.SelFunc;
    return this;
  }
}

export class ComboBox_FillCallback$PlayerListItem extends ComboBox_FillCB {
  pCBClass = null;
  FillFunc = null;
  SelFunc = null;

  FillDropDownCB() {
    if (this.pCBClass != null && this.FillFunc != null) {
      this.pCBClass[this.FillFunc](this);
    }
  }

  OnComboSelChange(pForCombo, idNewSelection) {
    if (this.pCBClass != null && this.SelFunc != null) {
      return this.pCBClass[this.SelFunc](pForCombo, idNewSelection);
    } else {
      return false;
    }
  }

  init(pCBClass, FillFunc, SelFunc) {
    this.pCBClass = pCBClass;
    this.FillFunc = FillFunc;
    this.SelFunc = SelFunc;
    return this;
  }

  $clone() { return new ComboBox_FillCallback$PlayerListItem().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCBClass = o.pCBClass;
    this.FillFunc = o.FillFunc;
    this.SelFunc = o.SelFunc;
    return this;
  }
}

export class ComboBox_FillCallback$C4StartupOptionsDlg extends ComboBox_FillCB {
  pCBClass = null;
  FillFunc = null;
  SelFunc = null;

  FillDropDownCB() {
    if (this.pCBClass != null && this.FillFunc != null) {
      $spawn(this.pCBClass[this.FillFunc](this));
    }
  }

  OnComboSelChange(pForCombo, idNewSelection) {
    if (this.pCBClass != null && this.SelFunc != null) {
      return $spawn(this.pCBClass[this.SelFunc](pForCombo, idNewSelection));
    } else {
      return false;
    }
  }

  init(pCBClass, FillFunc, SelFunc) {
    this.pCBClass = pCBClass;
    this.FillFunc = FillFunc;
    this.SelFunc = SelFunc;
    return this;
  }

  $clone() { return new ComboBox_FillCallback$C4StartupOptionsDlg().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCBClass = o.pCBClass;
    this.FillFunc = o.FillFunc;
    this.SelFunc = o.SelFunc;
    return this;
  }
}

export class DialogWindow extends C4Window {
  pDialog = null;

  init() {
    super.init();
    this.pDialog = null;
    return this;
  }

  Init$pC4AbstractApp$pi8$C4Rect$pi8(pApp, Title, rcBounds, szID) {
    let result = $.C4Window.prototype.Init$i32$pC4AbstractApp$pi8$pC4Rect.call(this, 0 /*W_GuiWindow*/, pApp, Title, rcBounds);
    if (result != null) {
      if (szID != null && szID.a[szID.o] !== 0) {
        this.RestorePosition($.FormatString(S("ConsoleGUI_%s"), szID).getData(), $.Config.GetSubkeyPath(S("Console")), false);
      } else {
        this.SetSize(rcBounds.Wdt >>> 0, rcBounds.Hgt >>> 0);
      }
    }
    return result;
  }

  Close() {
  }

  PerformUpdate() {
    if (this.pDialog == null) {
      return;
    }
    let r = new $.C4Rect();
    this.GetSize(r);
    if (this.pSurface != null) {
      this.pSurface.Wdt = r.Wdt;
      this.pSurface.Hgt = r.Hgt;
      $.pGL.PrepareRendering(this.pSurface);
      gl$glClear(16384);
    }
    let cgo = new $.C4TargetFacet().init();
    cgo.Set$pC4Surface$f32$f32$f32$f32$f32$f32$f32(null, Math.fround(0), Math.fround(0), Math.fround(r.Wdt), Math.fround(r.Hgt), Math.fround(0), Math.fround(0));
    this.pDialog.Draw$rC4TargetFacet(cgo);
  }

  $clone() { return new DialogWindow().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pDialog = o.pDialog;
    return this;
  }
}

export class InputCallback$C4GameOptionButtons extends BaseInputCallback {
  pTarget = null;
  pCBFunc = null;

  init(pTarget, pCBFunc) {
    this.pTarget = pTarget;
    this.pCBFunc = pCBFunc;
    return this;
  }

  OnOK(sText) {
    this.pTarget[this.pCBFunc](sText);
  }

  $clone() { return new InputCallback$C4GameOptionButtons().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pTarget = o.pTarget;
    this.pCBFunc = o.pCBFunc;
    return this;
  }
}

export class InputCallback$CrewListItem extends BaseInputCallback {
  pTarget = null;
  pCBFunc = null;

  init(pTarget, pCBFunc) {
    this.pTarget = pTarget;
    this.pCBFunc = pCBFunc;
    return this;
  }

  OnOK(sText) {
    $spawn(this.pTarget[this.pCBFunc](sText));
  }

  $clone() { return new InputCallback$CrewListItem().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pTarget = o.pTarget;
    this.pCBFunc = o.pCBFunc;
    return this;
  }
}

export class InputCallback$C4StartupScenSelDlg extends BaseInputCallback {
  pTarget = null;
  pCBFunc = null;

  init(pTarget, pCBFunc) {
    this.pTarget = pTarget;
    this.pCBFunc = pCBFunc;
    return this;
  }

  OnOK(sText) {
    $spawn(this.pTarget[this.pCBFunc](sText));
  }

  $clone() { return new InputCallback$C4StartupScenSelDlg().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pTarget = o.pTarget;
    this.pCBFunc = o.pCBFunc;
    return this;
  }
}

export class CBMenuHandler$PlayerListItem extends MenuHandler {
  pCBTarget = null;
  pCallbackFn = null;

  init(pCBTarget, pCallbackFn, _iaExtra = 0) {
    this.pCBTarget = pCBTarget;
    this.pCallbackFn = pCallbackFn;
    return this;
  }

  OnOK(pTargetElement) {
    if (this.pCBTarget == null) {
      return;
    }
    this.pCBTarget[this.pCallbackFn](pTargetElement);
  }

  $clone() { return new CBMenuHandler$PlayerListItem().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCBTarget = o.pCBTarget;
    this.pCallbackFn = o.pCallbackFn;
    return this;
  }
}

export class CBMenuHandler$C4StartupPlrSelDlg extends MenuHandler {
  pCBTarget = null;
  pCallbackFn = null;

  init(pCBTarget, pCallbackFn, _iaExtra = 0) {
    this.pCBTarget = pCBTarget;
    this.pCallbackFn = pCallbackFn;
    return this;
  }

  OnOK(pTargetElement) {
    if (this.pCBTarget == null) {
      return;
    }
    $spawn(this.pCBTarget[this.pCallbackFn](pTargetElement));
  }

  $clone() { return new CBMenuHandler$C4StartupPlrSelDlg().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCBTarget = o.pCBTarget;
    this.pCallbackFn = o.pCallbackFn;
    return this;
  }
}

export class CBMenuHandler$Edit extends MenuHandler {
  pCBTarget = null;
  pCallbackFn = null;

  init(pCBTarget, pCallbackFn, _iaExtra = 0) {
    this.pCBTarget = pCBTarget;
    this.pCallbackFn = pCallbackFn;
    return this;
  }

  OnOK(pTargetElement) {
    if (this.pCBTarget == null) {
      return;
    }
    this.pCBTarget[this.pCallbackFn](pTargetElement);
  }

  $clone() { return new CBMenuHandler$Edit().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCBTarget = o.pCBTarget;
    this.pCallbackFn = o.pCallbackFn;
    return this;
  }
}

export class CBMenuHandlerEx$PlayerListItem$i32 extends MenuHandler {
  pCBTarget = null;
  pCallbackFn = null;
  Extra = 0;

  init$pPlayerListItem$x$i32(pCBTarget, pCallbackFn, aExtra) {
    this.pCBTarget = pCBTarget;
    this.pCallbackFn = pCallbackFn;
    this.Extra = aExtra;
    return this;
  }

  OnOK(pTargetElement) {
    if (this.pCBTarget == null || this.pCallbackFn == null) {
      return;
    }
    this.pCBTarget[this.pCallbackFn](pTargetElement, this.Extra);
  }

  $clone() { return new CBMenuHandlerEx$PlayerListItem$i32().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCBTarget = o.pCBTarget;
    this.pCallbackFn = o.pCallbackFn;
    this.Extra = o.Extra;
    return this;
  }
}

export class CBMenuHandlerEx$C4StartupMainDlg$StdCopyStrBuf extends MenuHandler {
  pCBTarget = null;
  pCallbackFn = null;
  Extra = new $.StdCopyStrBuf();

  init$pC4StartupMainDlg$x$StdCopyStrBuf(pCBTarget, pCallbackFn, aExtra) {
    this.pCBTarget = pCBTarget;
    this.pCallbackFn = pCallbackFn;
    this.Extra = aExtra.$clone();
    return this;
  }

  OnOK(pTargetElement) {
    if (this.pCBTarget == null || this.pCallbackFn == null) {
      return;
    }
    $spawn(this.pCBTarget[this.pCallbackFn](pTargetElement, this.Extra));
  }

  $clone() { return new CBMenuHandlerEx$C4StartupMainDlg$StdCopyStrBuf().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCBTarget = o.pCBTarget;
    this.pCallbackFn = o.pCallbackFn;
    this.Extra.$assign(o.Extra);
    return this;
  }
}

export class CBMenuHandlerEx$ComboBox$ComboMenuCBStruct extends MenuHandler {
  pCBTarget = null;
  pCallbackFn = null;
  Extra = new ComboBox$ComboMenuCBStruct().init$v();

  init$pComboBox$x(pCBTarget, pCallbackFn) {
    this.pCBTarget = pCBTarget;
    this.pCallbackFn = pCallbackFn;
    this.Extra = new ComboBox$ComboMenuCBStruct().init$v();
    return this;
  }

  SetExtra$ComboBox$ComboMenuCBStruct(e) {
    this.Extra.$assign(e);
  }

  OnOK(pTargetElement) {
    if (this.pCBTarget == null || this.pCallbackFn == null) {
      return;
    }
    this.pCBTarget[this.pCallbackFn](pTargetElement, this.Extra);
  }

  $clone() { return new CBMenuHandlerEx$ComboBox$ComboMenuCBStruct().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCBTarget = o.pCBTarget;
    this.pCallbackFn = o.pCallbackFn;
    this.Extra.$assign(o.Extra);
    return this;
  }
}

export class CBContextHandler$PlayerListItem extends ContextHandler {
  pCBTarget = null;
  pCallbackFn = null;

  init(pCBTarget, pCallbackFn) {
    this.pCBTarget = pCBTarget;
    this.pCallbackFn = pCallbackFn;
    return this;
  }

  OnContext(pOnElement, iX, iY) {
    new DlgCallback$PlayerListItem();
    if (this.pCBTarget == null) {
      return false;
    }
    let pScreen = pOnElement.GetScreen();
    if (pScreen == null) {
      return false;
    }
    let pNewMenu = this.pCBTarget[this.pCallbackFn](pOnElement, iX, iY);
    if (pNewMenu == null) {
      return false;
    }
    pScreen.DoContext$pContextMenu$pElement$i32$i32(pNewMenu, pOnElement, iX, iY);
    return true;
  }

  OnSubcontext(pOnElement) {
    return this.pCBTarget[this.pCallbackFn](pOnElement, 0, 0);
  }

  $clone() { return new CBContextHandler$PlayerListItem().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCBTarget = o.pCBTarget;
    this.pCallbackFn = o.pCallbackFn;
    return this;
  }
}

export class CBContextHandler$C4StartupMainDlg extends ContextHandler {
  pCBTarget = null;
  pCallbackFn = null;

  init(pCBTarget, pCallbackFn) {
    this.pCBTarget = pCBTarget;
    this.pCallbackFn = pCallbackFn;
    return this;
  }

  OnContext(pOnElement, iX, iY) {
    new DlgCallback$C4StartupMainDlg();
    if (this.pCBTarget == null) {
      return false;
    }
    let pScreen = pOnElement.GetScreen();
    if (pScreen == null) {
      return false;
    }
    let pNewMenu = $spawn(this.pCBTarget[this.pCallbackFn](pOnElement, iX, iY));
    if (pNewMenu == null) {
      return false;
    }
    pScreen.DoContext$pContextMenu$pElement$i32$i32(pNewMenu, pOnElement, iX, iY);
    return true;
  }

  OnSubcontext(pOnElement) {
    return $spawn(this.pCBTarget[this.pCallbackFn](pOnElement, 0, 0));
  }

  $clone() { return new CBContextHandler$C4StartupMainDlg().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCBTarget = o.pCBTarget;
    this.pCallbackFn = o.pCallbackFn;
    return this;
  }
}

export class CBContextHandler$ListItem extends ContextHandler {
  pCBTarget = null;
  pCallbackFn = null;

  init(pCBTarget, pCallbackFn) {
    this.pCBTarget = pCBTarget;
    this.pCallbackFn = pCallbackFn;
    return this;
  }

  OnContext(pOnElement, iX, iY) {
    new DlgCallback$ListItem();
    if (this.pCBTarget == null) {
      return false;
    }
    let pScreen = pOnElement.GetScreen();
    if (pScreen == null) {
      return false;
    }
    let pNewMenu = $spawn(this.pCBTarget[this.pCallbackFn](pOnElement, iX, iY));
    if (pNewMenu == null) {
      return false;
    }
    pScreen.DoContext$pContextMenu$pElement$i32$i32(pNewMenu, pOnElement, iX, iY);
    return true;
  }

  OnSubcontext(pOnElement) {
    return $spawn(this.pCBTarget[this.pCallbackFn](pOnElement, 0, 0));
  }

  $clone() { return new CBContextHandler$ListItem().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCBTarget = o.pCBTarget;
    this.pCallbackFn = o.pCallbackFn;
    return this;
  }
}

export class CBContextHandler$Edit extends ContextHandler {
  pCBTarget = null;
  pCallbackFn = null;

  init(pCBTarget, pCallbackFn) {
    this.pCBTarget = pCBTarget;
    this.pCallbackFn = pCallbackFn;
    return this;
  }

  OnContext(pOnElement, iX, iY) {
    new DlgCallback$Edit();
    if (this.pCBTarget == null) {
      return false;
    }
    let pScreen = pOnElement.GetScreen();
    if (pScreen == null) {
      return false;
    }
    let pNewMenu = this.pCBTarget[this.pCallbackFn](pOnElement, iX, iY);
    if (pNewMenu == null) {
      return false;
    }
    pScreen.DoContext$pContextMenu$pElement$i32$i32(pNewMenu, pOnElement, iX, iY);
    return true;
  }

  OnSubcontext(pOnElement) {
    return this.pCBTarget[this.pCallbackFn](pOnElement, 0, 0);
  }

  $clone() { return new CBContextHandler$Edit().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCBTarget = o.pCBTarget;
    this.pCallbackFn = o.pCallbackFn;
    return this;
  }
}

export class ControlKeyCB$RenameEdit extends C4KeyCB$RenameEdit {

  init(rTarget, pFuncDown, pFuncUp = null, pFuncPressed = null) {
    super.init(rTarget, pFuncDown, pFuncUp, pFuncPressed);
    return this;
  }

  CheckCondition() {
    return this.rTarget.HasDrawFocus();
  }

  $clone() { return new ControlKeyCB$RenameEdit().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class DlgKeyCB$C4ChatInputDialog extends C4KeyCB$C4ChatInputDialog {

  init(rTarget, pFuncDown, pFuncUp = null, pFuncPressed = null) {
    super.init(rTarget, pFuncDown, pFuncUp, pFuncPressed);
    return this;
  }

  CheckCondition() {
    return this.rTarget.IsInActiveDlg(true) && this.rTarget.IsVisible();
  }

  $clone() { return new DlgKeyCB$C4ChatInputDialog().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class DlgKeyCB$MessageDialog extends C4KeyCB$MessageDialog {

  init(rTarget, pFuncDown, pFuncUp = null, pFuncPressed = null) {
    super.init(rTarget, pFuncDown, pFuncUp, pFuncPressed);
    return this;
  }

  CheckCondition() {
    return this.rTarget.IsInActiveDlg(true) && this.rTarget.IsVisible();
  }

  $clone() { return new DlgKeyCB$MessageDialog().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class ParCallbackHandler$C4StartupOptionsDlg$i32 extends BaseParCallbackHandler$i32 {
  pCBClass = null;
  CBFunc = null;

  DoCall$i32(par) {
    $spawn(this.pCBClass[this.CBFunc](par));
  }

  init(pTarget, rFunc) {
    this.pCBClass = pTarget;
    this.CBFunc = rFunc;
    return this;
  }

  $clone() { return new ParCallbackHandler$C4StartupOptionsDlg$i32().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCBClass = o.pCBClass;
    this.CBFunc = o.CBFunc;
    return this;
  }
}

export class WoodenLabel extends Label {
  iAutoScrollDelay = 0;
  tLastChangeTime = new $.C4TimeMilliseconds();
  iScrollPos = 0;
  iScrollDir = 0;
  iRightIndent = 0;
  fctIcon = new $.C4Facet().init$v();

  DrawElement(cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== WoodenLabel && WoodenLabel.prototype instanceof $c) return $c.prototype.DrawElement.apply(this, arguments); }
    this.DrawBar(cgo, $.GraphicsResource.barCaption);
    if (this.fctIcon.Surface != null) {
      let cgoSymbol = new $.C4Facet().init$pC4Surface$f32$f32$f32$f32(cgo.Surface, Math.fround(Math.fround(cgo.TargetX + Math.fround(this.rcBounds.x)) + Math.fround(1)), Math.fround(Math.fround(cgo.TargetY + Math.fround(this.rcBounds.y)) + Math.fround(1)), Math.fround(this.rcBounds.Hgt - 2 | 0), Math.fround(this.rcBounds.Hgt - 2 | 0));
      this.fctIcon.Draw$rC4Facet$b$i32$i32$b(cgoSymbol);
    }
    let iXOff = 0;
    if (this.iAlign === 0) {
      iXOff = iXOff + 5 | 0;
    }
    if (this.iAutoScrollDelay !== 0) {
      let tNow = $.C4TimeMilliseconds.Now();
      if ($.op_ge(tNow, $.op_add$C4TimeMilliseconds$u32(this.tLastChangeTime.$clone(), this.iAutoScrollDelay))) {
        if (this.iScrollDir === 0) {
          this.iScrollDir = 1;
        }
        let iMaxScroll = $max((((this.pFont.GetTextWidth(this.sText.getData(), true) + (this.x0 - this.rcBounds.x | 0) | 0) + iXOff | 0) + this.GetRightIndent() | 0) - this.rcBounds.Wdt | 0, 0);
        if (iMaxScroll !== 0) {
          this.iScrollPos = this.iScrollPos + this.iScrollDir | 0;
          if (this.iScrollPos >= iMaxScroll || this.iScrollPos < 0) {
            this.iScrollDir = -this.iScrollDir | 0;
            this.iScrollPos = this.iScrollPos + this.iScrollDir | 0;
            this.tLastChangeTime.$assign(tNow);
          }
        }
      }
      iXOff = iXOff - this.iScrollPos | 0;
    }
    $.pDraw.StorePrimaryClipper();
    $.pDraw.SetPrimaryClipper(ftoi32(Math.fround(Math.fround(this.rcBounds.x + this.GetLeftIndent() | 0) + cgo.TargetX)), ftoi32(Math.fround(Math.fround(this.rcBounds.y) + cgo.TargetY)), ftoi32(Math.fround(Math.fround((this.rcBounds.x + this.rcBounds.Wdt | 0) - this.GetRightIndent() | 0) + cgo.TargetX)), ftoi32(Math.fround(Math.fround(this.rcBounds.y + this.rcBounds.Hgt | 0) + cgo.TargetY)));
    $.pDraw.TextOut(this.sText.getData(), this.pFont, 1, cgo.Surface, Math.fround(Math.fround(Math.fround(this.x0) + cgo.TargetX) + Math.fround(iXOff)), Math.fround(Math.fround(Math.fround(Math.fround(this.rcBounds.y) + cgo.TargetY) + Math.fround((this.rcBounds.Hgt - this.pFont.GetLineHeight() | 0) / 2 | 0)) - Math.fround(1)), this.dwFgClr, this.iAlign & 0xff);
    $.pDraw.RestorePrimaryClipper();
  }

  GetLeftIndent() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== WoodenLabel && WoodenLabel.prototype instanceof $c) return $c.prototype.GetLeftIndent.apply(this, arguments); }
    return this.fctIcon.Surface != null ? this.rcBounds.Hgt : 0;
  }

  GetRightIndent() {
    return this.iRightIndent;
  }

  init(szLblText, rcBounds, dwFClr = 0xffffffff, pFont = null, iAlign = 1, fMarkup = true) {
    super.init$pi8$C4Rect$i32$u32$pCStdFont$b$b$b(szLblText, rcBounds, iAlign, dwFClr, pFont, true, true, fMarkup);
    this.iAutoScrollDelay = 0;
    this.tLastChangeTime = $.C4TimeMilliseconds.Now();
    this.iScrollPos = 0;
    this.iScrollDir = 0;
    this.iRightIndent = 0;
    this.fctIcon = new $.C4Facet().init$v();
    this.$dyn = WoodenLabel;
    this.SetAutosize(false);
    this.rcBounds.$assign(rcBounds);
    return this;
  }

  static GetDefaultHeight$pCStdFont(pUseFont = null) {
    if (pUseFont == null) {
      pUseFont = $.GraphicsResource.TextFont;
    }
    return $max(pUseFont.GetLineHeight(), 23);
  }

  SetIcon$C4Facet(rfctIcon) {
    this.fctIcon.$assign(rfctIcon);
    if (this.fctIcon.Surface != null) {
      this.iAlign = 0;
    } else {
      this.iAlign = 1;
    }
    this.UpdateOwnPos();
  }

  SetAutoScrollTime(tDelay) {
    this.iAutoScrollDelay = tDelay;
    this.ResetAutoScroll();
  }

  ResetAutoScroll() {
    this.iScrollPos = this.iScrollDir = 0;
  }

  SetRightIndent(iNewIndent) {
    this.iRightIndent = iNewIndent;
  }

  $clone() { return new WoodenLabel().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.iAutoScrollDelay = o.iAutoScrollDelay;
    this.tLastChangeTime.$assign(o.tLastChangeTime);
    this.iScrollPos = o.iScrollPos;
    this.iScrollDir = o.iScrollDir;
    this.iRightIndent = o.iRightIndent;
    this.fctIcon.$assign(o.fctIcon);
    return this;
  }
}

export class OverlayPicture extends Picture {
  iBorderSize = 0;
  OverlayImage = new $.C4Facet().init$v();

  DrawElement(cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== OverlayPicture && OverlayPicture.prototype instanceof $c) return $c.prototype.DrawElement.apply(this, arguments); }
    let cgo2 = cgo.$clone();
    cgo2.X = Math.fround(Math.fround(Math.fround(this.rcBounds.x) + cgo.TargetX) + Math.fround(Math.imul(this.iBorderSize, this.rcBounds.Wdt) / $max(ftoi32(this.OverlayImage.Wdt), 1) | 0));
    cgo2.Y = Math.fround(Math.fround(Math.fround(this.rcBounds.y) + cgo.TargetY) + Math.fround(Math.imul(this.iBorderSize, this.rcBounds.Hgt) / $max(ftoi32(this.OverlayImage.Hgt), 1) | 0));
    cgo2.Wdt = Math.fround(this.rcBounds.Wdt - (Math.imul(Math.imul(2, this.iBorderSize), this.rcBounds.Wdt) / $max(ftoi32(this.OverlayImage.Wdt), 1) | 0) | 0);
    cgo2.Hgt = Math.fround(this.rcBounds.Hgt - (Math.imul(Math.imul(2, this.iBorderSize), this.rcBounds.Hgt) / $max(ftoi32(this.OverlayImage.Hgt), 1) | 0) | 0);
    this.Facet.Draw$rC4Facet$b$i32$i32$b(cgo2, this.fAspect);
    cgo2.X = Math.fround(Math.fround(this.rcBounds.x) + cgo.TargetX);
    cgo2.Y = Math.fround(Math.fround(this.rcBounds.y) + cgo.TargetY);
    cgo2.Wdt = Math.fround(this.rcBounds.Wdt);
    cgo2.Hgt = Math.fround(this.rcBounds.Hgt);
    this.OverlayImage.Draw$rC4Facet$b$i32$i32$b(cgo2, this.fAspect);
  }

  init(rcBounds, fAspect, rOverlayImage, iBorderSize) {
    super.init(rcBounds, fAspect);
    this.iBorderSize = iBorderSize;
    this.OverlayImage = rOverlayImage.$clone();
    this.$dyn = OverlayPicture;
    return this;
  }

  $clone() { return new OverlayPicture().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.iBorderSize = o.iBorderSize;
    this.OverlayImage.$assign(o.OverlayImage);
    return this;
  }
}

export class Icon extends Picture {

  init(rcBounds, icoIconIndex) {
    super.init(rcBounds, true);
    this.$dyn = Icon;
    Icon.prototype.SetIcon$i32.call(this, icoIconIndex);
    return this;
  }

  SetIcon$i32(icoNewIconIndex) {
    this.SetFacet$C4Facet(Icon.GetIconFacet$i32(icoNewIconIndex));
  }

  static GetIconFacet$i32(icoIconIndex) {
    if (icoIconIndex === -1) {
      return new $.C4Facet().init$v();
    }
    let rFacet = null;
    switch (icoIconIndex & -256) {
      case 256:
        rFacet = $.GraphicsResource.fctIconsEx;
        break;
      case 512:
        rFacet = $.GraphicsResource.fctControllerIcons;
        break;
      default:
        rFacet = $.GraphicsResource.fctIcons;
    }
    icoIconIndex = icoIconIndex & 255;
    const iXMax = [0];
    const iYMax = [0];
    rFacet.GetPhaseNum(P(iXMax, 0), P(iYMax, 0));
    if (iXMax[0] === 0) {
      iXMax[0] = 6;
    }
    return rFacet.GetPhase(icoIconIndex % iXMax[0], icoIconIndex / iXMax[0] | 0);
  }

  $clone() { return new Icon().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class Window extends Container {
  rcClientRect = new $.C4Rect();

  Draw$rC4TargetFacet(cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Window && Window.prototype instanceof $c) return $c.prototype.Draw$rC4TargetFacet.apply(this, arguments); }
    if (!this.IsVisible()) {
      return;
    }
    this.DrawElement(cgo);
    const rcClientRect = this.GetClientRect();
    const rcClipArea = this.IsComponentOutsideClientArea() ? this.GetBounds() : this.GetClientRect();
    const clx1 = [0];
    const cly1 = [0];
    const clx2 = [0];
    const cly2 = [0];
    $.pDraw.GetPrimaryClipper(P(clx1, 0), P(cly1, 0), P(clx2, 0), P(cly2, 0));
    const nclx1 = [Math.fround(cgo.TargetX + Math.fround(rcClipArea.x))];
    const ncly1 = [Math.fround(cgo.TargetY + Math.fround(rcClipArea.y))];
    const nclx2 = [Math.fround(Math.fround(Math.fround(cgo.TargetX + Math.fround(rcClipArea.x)) + Math.fround(rcClipArea.Wdt)) - Math.fround(1))];
    const ncly2 = [Math.fround(Math.fround(Math.fround(cgo.TargetY + Math.fround(rcClipArea.y)) + Math.fround(rcClipArea.Hgt)) - Math.fround(1))];
    $.pDraw.ApplyZoom(P(nclx1, 0), P(ncly1, 0));
    $.pDraw.ApplyZoom(P(nclx2, 0), P(ncly2, 0));
    $.pDraw.SubPrimaryClipper(ftoi32(nclx1[0]), ftoi32(ncly1[0]), ftoi32(nclx2[0]), ftoi32(ncly2[0]));
    cgo.TargetX = Math.fround(cgo.TargetX + Math.fround(rcClientRect.x));
    cgo.TargetY = Math.fround(cgo.TargetY + Math.fround(rcClientRect.y));
    Container.prototype.Draw$rC4TargetFacet.call(this, cgo);
    cgo.TargetX = Math.fround(cgo.TargetX - Math.fround(rcClientRect.x));
    cgo.TargetY = Math.fround(cgo.TargetY - Math.fround(rcClientRect.y));
    $.pDraw.SetPrimaryClipper(clx1[0], cly1[0], clx2[0], cly2[0]);
  }

  init() {
    super.init();
    this.rcClientRect = new $.C4Rect();
    this.$dyn = Window;
    Window.prototype.UpdateOwnPos.call(this);
    return this;
  }

  MouseInput$rCMouse$i32$i32$i32$u32(rMouse, iButton, iX, iY, dwKeyParam) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Window && Window.prototype instanceof $c) return $c.prototype.MouseInput$rCMouse$i32$i32$i32$u32.apply(this, arguments); }
    if (!this.IsVisible()) {
      return;
    }
    $spawn(Element.prototype.MouseInput$rCMouse$i32$i32$i32$u32.call(this, rMouse, iButton, iX, iY, dwKeyParam));
    const rcClientRect = this.GetClientRect();
    const rcBounds = this.GetBounds();
    iX = iX - (rcClientRect.x - rcBounds.x | 0) | 0;
    iY = iY - (rcClientRect.y - rcBounds.y | 0) | 0;
    for (let pChild = this.pLast; pChild != null; pChild = pChild.GetPrev()) {
      if (pChild.fVisible && pChild.GetBounds().Contains$i32$i32(iX, iY)) {
        $spawn(pChild.MouseInput$rCMouse$i32$i32$i32$u32(rMouse, iButton, iX - pChild.GetBounds().x | 0, iY - pChild.GetBounds().y | 0, dwKeyParam));
        break;
      }
    }
  }

  SetPos(iXPos, iYPos) {
    this.rcBounds.x = iXPos;
    this.rcBounds.y = iYPos;
    this.UpdatePos();
  }

  UpdateOwnPos() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Window && Window.prototype instanceof $c) return $c.prototype.UpdateOwnPos.apply(this, arguments); }
    Element.prototype.UpdateOwnPos.call(this);
    let iMarginL = this.GetMarginLeft();
    let iMarginT = this.GetMarginTop();
    this.rcClientRect.Set$i32$i32$i32$i32(this.rcBounds.x + iMarginL | 0, this.rcBounds.y + iMarginT | 0, $max((this.rcBounds.Wdt - iMarginL | 0) - this.GetMarginRight() | 0, 0), $max((this.rcBounds.Hgt - iMarginT | 0) - this.GetMarginBottom() | 0, 0));
  }

  GetClientRect() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Window && Window.prototype instanceof $c) return $c.prototype.GetClientRect.apply(this, arguments); }
    return this.rcClientRect;
  }

  ApplyElementOffset(riX, riY) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Window && Window.prototype instanceof $c) return $c.prototype.ApplyElementOffset.apply(this, arguments); }
    riX.a[riX.o] = riX.a[riX.o] - this.rcClientRect.x | 0;
    riY.a[riY.o] = riY.a[riY.o] - this.rcClientRect.y | 0;
  }

  ApplyInvElementOffset(riX, riY) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Window && Window.prototype instanceof $c) return $c.prototype.ApplyInvElementOffset.apply(this, arguments); }
    riX.a[riX.o] = riX.a[riX.o] + this.rcClientRect.x | 0;
    riY.a[riY.o] = riY.a[riY.o] + this.rcClientRect.y | 0;
  }

  IsComponentOutsideClientArea() {
    return false;
  }

  GetMarginTop() {
    return 0;
  }

  GetMarginLeft() {
    return 0;
  }

  GetMarginRight() {
    return 0;
  }

  GetMarginBottom() {
    return 0;
  }

  $clone() { return new Window().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.rcClientRect.$assign(o.rcClientRect);
    return this;
  }
}

export class DlgKeyCB$C4FileSelDlg extends C4KeyCB$C4FileSelDlg {

  init(rTarget, pFuncDown, pFuncUp = null, pFuncPressed = null) {
    super.init(rTarget, pFuncDown, pFuncUp, pFuncPressed);
    return this;
  }

  CheckCondition() {
    return this.rTarget.IsInActiveDlg(true) && this.rTarget.IsVisible();
  }

  $clone() { return new DlgKeyCB$C4FileSelDlg().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class DlgKeyCB$C4StartupAboutDlg extends C4KeyCB$C4StartupAboutDlg {

  init(rTarget, pFuncDown, pFuncUp = null, pFuncPressed = null) {
    super.init(rTarget, pFuncDown, pFuncUp, pFuncPressed);
    return this;
  }

  CheckCondition() {
    return this.rTarget.IsInActiveDlg(true) && this.rTarget.IsVisible();
  }

  $clone() { return new DlgKeyCB$C4StartupAboutDlg().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class DlgKeyCB$C4StartupMainDlg extends C4KeyCB$C4StartupMainDlg {

  init(rTarget, pFuncDown, pFuncUp, pFuncPressed = null) {
    super.init(rTarget, pFuncDown, pFuncUp, pFuncPressed);
    return this;
  }

  CheckCondition() {
    return this.rTarget.IsInActiveDlg(true) && this.rTarget.IsVisible();
  }

  $clone() { return new DlgKeyCB$C4StartupMainDlg().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class DlgKeyCB$C4StartupOptionsDlg extends C4KeyCB$C4StartupOptionsDlg {

  init(rTarget, pFuncDown, pFuncUp = null, pFuncPressed = null) {
    super.init(rTarget, pFuncDown, pFuncUp, pFuncPressed);
    return this;
  }

  CheckCondition() {
    return this.rTarget.IsInActiveDlg(true) && this.rTarget.IsVisible();
  }

  $clone() { return new DlgKeyCB$C4StartupOptionsDlg().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class DlgKeyCB$C4StartupPlrSelDlg extends C4KeyCB$C4StartupPlrSelDlg {

  init(rTarget, pFuncDown, pFuncUp = null, pFuncPressed = null) {
    super.init(rTarget, pFuncDown, pFuncUp, pFuncPressed);
    return this;
  }

  CheckCondition() {
    return this.rTarget.IsInActiveDlg(true) && this.rTarget.IsVisible();
  }

  $clone() { return new DlgKeyCB$C4StartupPlrSelDlg().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class DlgKeyCB$C4StartupScenSelDlg extends C4KeyCB$C4StartupScenSelDlg {

  init(rTarget, pFuncDown, pFuncUp = null, pFuncPressed = null) {
    super.init(rTarget, pFuncDown, pFuncUp, pFuncPressed);
    return this;
  }

  CheckCondition() {
    return this.rTarget.IsInActiveDlg(true) && this.rTarget.IsVisible();
  }

  $clone() { return new DlgKeyCB$C4StartupScenSelDlg().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class DlgKeyCB$Dialog extends C4KeyCB$Dialog {

  init(rTarget, pFuncDown, pFuncUp = null, pFuncPressed = null) {
    super.init(rTarget, pFuncDown, pFuncUp, pFuncPressed);
    return this;
  }

  CheckCondition() {
    return this.rTarget.IsInActiveDlg(true) && this.rTarget.IsVisible();
  }

  $clone() { return new DlgKeyCB$Dialog().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class DlgKeyCB$Tabular extends C4KeyCB$Tabular {

  init(rTarget, pFuncDown, pFuncUp = null, pFuncPressed = null) {
    super.init(rTarget, pFuncDown, pFuncUp, pFuncPressed);
    return this;
  }

  CheckCondition() {
    return this.rTarget.IsInActiveDlg(true) && this.rTarget.IsVisible();
  }

  $clone() { return new DlgKeyCB$Tabular().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class DlgKeyCBPassKey$C4ChatInputDialog extends C4KeyCBPassKey$C4ChatInputDialog {

  init(rTarget, pFuncDown, pFuncUp = null, pFuncPressed = null) {
    super.init(rTarget, pFuncDown, pFuncUp, pFuncPressed);
    return this;
  }

  CheckCondition() {
    return this.rTarget.IsInActiveDlg(true) && this.rTarget.IsVisible();
  }

  $clone() { return new DlgKeyCBPassKey$C4ChatInputDialog().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class DlgKeyCBPassKey$KeySelDialog extends C4KeyCBPassKey$KeySelDialog {

  init(rTarget, pFuncDown, pFuncUp, pFuncPressed = null) {
    super.init(rTarget, pFuncDown, pFuncUp, pFuncPressed);
    return this;
  }

  CheckCondition() {
    return this.rTarget.IsInActiveDlg(true) && this.rTarget.IsVisible();
  }

  $clone() { return new DlgKeyCBPassKey$KeySelDialog().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class DlgKeyCBPassKey$Dialog extends C4KeyCBPassKey$Dialog {

  init(rTarget, pFuncDown, pFuncUp = null, pFuncPressed = null) {
    super.init(rTarget, pFuncDown, pFuncUp, pFuncPressed);
    return this;
  }

  CheckCondition() {
    return this.rTarget.IsInActiveDlg(true) && this.rTarget.IsVisible();
  }

  $clone() { return new DlgKeyCBPassKey$Dialog().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class DlgKeyCBEx$C4ChatInputDialog$b extends C4KeyCBEx$C4ChatInputDialog$b {

  init(rTarget, par, pFuncDown, pFuncUp = null, pFuncPressed = null) {
    super.init(rTarget, par, pFuncDown, pFuncUp, pFuncPressed);
    return this;
  }

  CheckCondition() {
    return this.rTarget.IsInActiveDlg(true) && this.rTarget.IsVisible();
  }

  $clone() { return new DlgKeyCBEx$C4ChatInputDialog$b().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class DlgKeyCBEx$C4StartupMainDlg$b extends C4KeyCBEx$C4StartupMainDlg$b {

  init(rTarget, par, pFuncDown, pFuncUp = null, pFuncPressed = null) {
    super.init(rTarget, par, pFuncDown, pFuncUp, pFuncPressed);
    return this;
  }

  CheckCondition() {
    return this.rTarget.IsInActiveDlg(true) && this.rTarget.IsVisible();
  }

  $clone() { return new DlgKeyCBEx$C4StartupMainDlg$b().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class DlgKeyCBEx$Dialog$b extends C4KeyCBEx$Dialog$b {

  init(rTarget, par, pFuncDown, pFuncUp = null, pFuncPressed = null) {
    super.init(rTarget, par, pFuncDown, pFuncUp, pFuncPressed);
    return this;
  }

  CheckCondition() {
    return this.rTarget.IsInActiveDlg(true) && this.rTarget.IsVisible();
  }

  $clone() { return new DlgKeyCBEx$Dialog$b().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class ControlKeyCB$Button extends C4KeyCB$Button {

  init(rTarget, pFuncDown, pFuncUp, pFuncPressed = null) {
    super.init(rTarget, pFuncDown, pFuncUp, pFuncPressed);
    return this;
  }

  CheckCondition() {
    return this.rTarget.HasDrawFocus();
  }

  $clone() { return new ControlKeyCB$Button().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class ControlKeyCB$ListItem extends C4KeyCB$ListItem {

  init(rTarget, pFuncDown, pFuncUp = null, pFuncPressed = null) {
    super.init(rTarget, pFuncDown, pFuncUp, pFuncPressed);
    return this;
  }

  CheckCondition() {
    return this.rTarget.HasDrawFocus();
  }

  $clone() { return new ControlKeyCB$ListItem().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class ControlKeyCB$ListItem$2 extends C4KeyCB$ListItem$2 {

  init(rTarget, pFuncDown, pFuncUp = null, pFuncPressed = null) {
    super.init(rTarget, pFuncDown, pFuncUp, pFuncPressed);
    return this;
  }

  CheckCondition() {
    return this.rTarget.HasDrawFocus();
  }

  $clone() { return new ControlKeyCB$ListItem$2().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class ControlKeyCB$CheckBox extends C4KeyCB$CheckBox {

  init(rTarget, pFuncDown, pFuncUp = null, pFuncPressed = null) {
    super.init(rTarget, pFuncDown, pFuncUp, pFuncPressed);
    return this;
  }

  CheckCondition() {
    return this.rTarget.HasDrawFocus();
  }

  $clone() { return new ControlKeyCB$CheckBox().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class ControlKeyCB$ComboBox extends C4KeyCB$ComboBox {

  init(rTarget, pFuncDown, pFuncUp = null, pFuncPressed = null) {
    super.init(rTarget, pFuncDown, pFuncUp, pFuncPressed);
    return this;
  }

  CheckCondition() {
    return this.rTarget.HasDrawFocus();
  }

  $clone() { return new ControlKeyCB$ComboBox().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class ControlKeyCB$ContextButton extends C4KeyCB$ContextButton {

  init(rTarget, pFuncDown, pFuncUp = null, pFuncPressed = null) {
    super.init(rTarget, pFuncDown, pFuncUp, pFuncPressed);
    return this;
  }

  CheckCondition() {
    return this.rTarget.HasDrawFocus();
  }

  $clone() { return new ControlKeyCB$ContextButton().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class ControlKeyCB$Control extends C4KeyCB$Control {

  init(rTarget, pFuncDown, pFuncUp = null, pFuncPressed = null) {
    super.init(rTarget, pFuncDown, pFuncUp, pFuncPressed);
    return this;
  }

  CheckCondition() {
    return this.rTarget.HasDrawFocus();
  }

  $clone() { return new ControlKeyCB$Control().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class ControlKeyCB$Edit extends C4KeyCB$Edit {

  init(rTarget, pFuncDown, pFuncUp = null, pFuncPressed = null) {
    super.init(rTarget, pFuncDown, pFuncUp, pFuncPressed);
    return this;
  }

  CheckCondition() {
    return this.rTarget.HasDrawFocus();
  }

  $clone() { return new ControlKeyCB$Edit().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class ControlKeyCB$ListBox extends C4KeyCB$ListBox {

  init(rTarget, pFuncDown, pFuncUp = null, pFuncPressed = null) {
    super.init(rTarget, pFuncDown, pFuncUp, pFuncPressed);
    return this;
  }

  CheckCondition() {
    return this.rTarget.HasDrawFocus();
  }

  $clone() { return new ControlKeyCB$ListBox().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class ControlKeyCB$Tabular extends C4KeyCB$Tabular {

  init(rTarget, pFuncDown, pFuncUp = null, pFuncPressed = null) {
    super.init(rTarget, pFuncDown, pFuncUp, pFuncPressed);
    return this;
  }

  CheckCondition() {
    return this.rTarget.HasDrawFocus();
  }

  $clone() { return new ControlKeyCB$Tabular().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class ControlKeyCBExPassKey$Edit$i32 extends C4KeyCBExPassKey$Edit$i32 {

  init(rTarget, rPar, pFuncDown, pFuncUp = null, pFuncPressed = null) {
    super.init(rTarget, rPar, pFuncDown, pFuncUp, pFuncPressed);
    return this;
  }

  CheckCondition() {
    return this.rTarget.HasDrawFocus();
  }

  $clone() { return new ControlKeyCBExPassKey$Edit$i32().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class ControlKeyDlgCB$C4StartupPlrSelDlg extends C4KeyCB$C4StartupPlrSelDlg {
  pCtrl = null;

  init(pCtrl, rTarget, pFuncDown, pFuncUp = null, pFuncPressed = null) {
    super.init(rTarget, pFuncDown, pFuncUp, pFuncPressed);
    this.pCtrl = pCtrl;
    return this;
  }

  CheckCondition() {
    return this.pCtrl != null && this.pCtrl.IsInActiveDlg(true) && this.pCtrl.IsVisible();
  }

  $clone() { return new ControlKeyDlgCB$C4StartupPlrSelDlg().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCtrl = o.pCtrl;
    return this;
  }
}

export class ControlKeyDlgCB$C4StartupScenSelDlg extends C4KeyCB$C4StartupScenSelDlg {
  pCtrl = null;

  init(pCtrl, rTarget, pFuncDown, pFuncUp = null, pFuncPressed = null) {
    super.init(rTarget, pFuncDown, pFuncUp, pFuncPressed);
    this.pCtrl = pCtrl;
    return this;
  }

  CheckCondition() {
    return this.pCtrl != null && this.pCtrl.IsInActiveDlg(true) && this.pCtrl.IsVisible();
  }

  $clone() { return new ControlKeyDlgCB$C4StartupScenSelDlg().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCtrl = o.pCtrl;
    return this;
  }
}

export class ScrollWindow extends Window {
  pScrollBar = null;
  iScrollY = 0;
  iClientHeight = 0;
  fHasBar = false;
  iFrozen = 0;

  ElementSizeChanged(pOfElement) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ScrollWindow && ScrollWindow.prototype instanceof $c) return $c.prototype.ElementSizeChanged.apply(this, arguments); }
    Container.prototype.ElementSizeChanged.call(this, pOfElement);
    if (this.pParent != null) {
      this.pParent.ElementSizeChanged(pOfElement);
    }
  }

  ElementPosChanged(pOfElement) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ScrollWindow && ScrollWindow.prototype instanceof $c) return $c.prototype.ElementPosChanged.apply(this, arguments); }
    Container.prototype.ElementPosChanged.call(this, pOfElement);
    if (this.pParent != null) {
      this.pParent.ElementPosChanged(pOfElement);
    }
  }

  init(pParentWindow) {
    super.init();
    this.pScrollBar = null;
    this.iScrollY = 0;
    this.iClientHeight = 0;
    this.fHasBar = true;
    this.iFrozen = 0;
    this.$dyn = ScrollWindow;
    let rtBounds = pParentWindow.GetClientRect().$clone();
    rtBounds.x = rtBounds.y = 0;
    rtBounds.Wdt = rtBounds.Wdt - 16 | 0;
    this.SetBounds(rtBounds);
    rtBounds.x = rtBounds.x + rtBounds.Wdt | 0;
    rtBounds.Wdt = 16;
    this.pScrollBar = new ScrollBar().init$rC4Rect$pScrollWindow(rtBounds, this);
    if (pParentWindow !== this) {
      Container.prototype.AddElement$pElement.call(pParentWindow, this);
      Container.prototype.AddElement$pElement.call(pParentWindow, this.pScrollBar);
    }
    return this;
  }

  $dtor() {
    if (this.pScrollBar != null) {
      this.pScrollBar.pScrollWindow = null;
    }
    super.$dtor();
  }

  MouseInput$rCMouse$i32$i32$i32$u32(rMouse, iButton, iX, iY, dwKeyParam) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ScrollWindow && ScrollWindow.prototype instanceof $c) return $c.prototype.MouseInput$rCMouse$i32$i32$i32$u32.apply(this, arguments); }
    if (iButton === 7) {
      let iDelta = (dwKeyParam >>> 16) << 16 >> 16;
      this.ScrollBy(-iDelta | 0);
      return;
    }
    Window.prototype.MouseInput$rCMouse$i32$i32$i32$u32.call(this, rMouse, iButton, iX, iY, dwKeyParam);
  }

  IsComponentOutsideClientArea() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ScrollWindow && ScrollWindow.prototype instanceof $c) return $c.prototype.IsComponentOutsideClientArea.apply(this, arguments); }
    return true;
  }

  Update$v() {
    if (this.iFrozen !== 0) {
      return;
    }
    this.iScrollY = $.Clamp$i32$i32$i32(this.iScrollY, 0, $max(this.iClientHeight - this.GetBounds().Hgt | 0, 0));
    this.rcClientRect.x = 0;
    this.rcClientRect.y = -this.iScrollY | 0;
    this.rcClientRect.Wdt = this.rcBounds.Wdt;
    this.rcClientRect.Hgt = this.iClientHeight;
    if (this.pScrollBar != null) {
      this.pScrollBar.Update$v();
    }
  }

  UpdateOwnPos() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ScrollWindow && ScrollWindow.prototype instanceof $c) return $c.prototype.UpdateOwnPos.apply(this, arguments); }
    if (!(this.GetParent() != null)) {
      this.Update$v();
      return;
    }
    let rtBounds = this.GetParent().GetContainedClientRect();
    rtBounds.x = rtBounds.y = 0;
    if (this.fHasBar) {
      rtBounds.Wdt = rtBounds.Wdt - 16 | 0;
    }
    if (this.GetBounds().op_ne(rtBounds)) {
      this.SetBounds(rtBounds);
      if (this.fHasBar) {
        rtBounds.x = rtBounds.x + rtBounds.Wdt | 0;
        rtBounds.Wdt = 16;
        this.pScrollBar.SetBounds(rtBounds);
      }
    }
    this.Update$v();
  }

  Freeze() {
    this.iFrozen = this.iFrozen + 1 | 0;
  }

  UnFreeze() {
    if (!((this.iFrozen = this.iFrozen - 1 | 0) !== 0)) {
      this.Update$v();
    }
  }

  IsFrozen() {
    return !(this.iFrozen === 0);
  }

  SetClientHeight(iToHgt) {
    this.iClientHeight = iToHgt;
    this.Update$v();
  }

  SetDecoration$pScrollBarFacets$b(pToGfx, fAutoScroll) {
    if (this.pScrollBar != null) {
      this.pScrollBar.SetDecoration$pScrollBarFacets$b(pToGfx, fAutoScroll);
    }
  }

  SetScroll(iToScroll) {
    this.rcClientRect.y = -(this.iScrollY = iToScroll) | 0;
  }

  ScrollToBottom() {
    let iVisHgt = this.GetBounds().Hgt;
    let iClientHgt = this.GetClientRect().Hgt;
    let iMaxScroll = iClientHgt - iVisHgt | 0;
    if (this.iScrollY < iMaxScroll) {
      this.iScrollY = iMaxScroll;
      this.Update$v();
    }
  }

  ScrollPages(iPageCount) {
    let iVisHgt = this.GetBounds().Hgt;
    this.ScrollBy(Math.imul(iPageCount, iVisHgt));
  }

  ScrollBy(iAmount) {
    let iVisHgt = this.GetBounds().Hgt;
    let iClientHgt = this.GetClientRect().Hgt;
    let iMaxScroll = iClientHgt - iVisHgt | 0;
    let iNewScrollY = $.Clamp$i32$i32$i32(this.iScrollY + iAmount | 0, 0, iMaxScroll);
    if (this.iScrollY !== iNewScrollY) {
      this.iScrollY = iNewScrollY;
      this.Update$v();
    }
  }

  ScrollRangeInView(iY, iHgt) {
    if (iY < 0) {
      iY = 0;
    }
    let iClientHgt = this.GetClientRect().Hgt;
    if ((iY + iHgt | 0) > iClientHgt) {
      this.ScrollToBottom();
      return;
    }
    if (this.iScrollY > iY) {
      this.iScrollY = iY;
      this.Update$v();
    } else {
      let iVisHgt = this.GetBounds().Hgt;
      if (iHgt === 0) {
        iHgt = iVisHgt;
      }
      if ((this.iScrollY + iVisHgt | 0) < (iY + iHgt | 0)) {
        this.iScrollY = (iY + iHgt | 0) - iVisHgt | 0;
        this.Update$v();
      }
    }
  }

  IsRangeInView(iY, iHgt) {
    if (this.iScrollY > iY) {
      return false;
    }
    return (this.iScrollY + this.GetBounds().Hgt | 0) >= (iY + iHgt | 0);
  }

  GetScrollY() {
    return this.iScrollY;
  }

  SetScrollBarEnabled(fToVal, noAutomaticPositioning = false) {
    if ((this.fHasBar ? 1 : 0) === (fToVal ? 1 : 0)) {
      return;
    }
    this.pScrollBar.SetVisibility(this.fHasBar = fToVal);
    if (!noAutomaticPositioning) {
      this.UpdateOwnPos();
    }
  }

  IsScrollBarEnabled() {
    return this.fHasBar;
  }

  IsScrollingActive() {
    return this.fHasBar && this.pScrollBar != null && this.pScrollBar.IsScrolling();
  }

  IsScrollingNecessary() {
    return this.iClientHeight > this.rcBounds.Hgt;
  }

  $clone() { return new ScrollWindow().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pScrollBar = o.pScrollBar;
    this.iScrollY = o.iScrollY;
    this.iClientHeight = o.iClientHeight;
    this.fHasBar = o.fHasBar;
    this.iFrozen = o.iFrozen;
    return this;
  }
}

export class GroupBox extends Window {
  sTitle = new $.StdStrBuf();
  pFont = null;
  dwFrameClr = 0;
  dwTitleClr = 0;
  dwBackClr = 0;
  iMargin = 0;

  GetTitleFont() {
    return this.pFont != null ? this.pFont : $.GraphicsResource.CaptionFont;
  }

  init(rtBounds) {
    super.init();
    this.sTitle = new $.StdStrBuf();
    this.pFont = null;
    this.dwFrameClr = 0;
    this.dwTitleClr = 0xffffffff;
    this.dwBackClr = 0xffffffff;
    this.iMargin = 4;
    this.$dyn = GroupBox;
    this.SetBounds(rtBounds);
    return this;
  }

  SetFont$pCStdFont(pToFont) {
    this.pFont = pToFont;
  }

  SetColors(dwFrameClr, dwTitleClr, dwBackClr = 0xffffffff) {
    this.dwFrameClr = dwFrameClr;
    this.dwTitleClr = dwTitleClr;
    this.dwBackClr = dwBackClr;
  }

  SetTitle$pi8(szToTitle) {
    if (szToTitle != null && szToTitle.a[szToTitle.o] !== 0) {
      this.sTitle.Copy$pi8(szToTitle);
    } else {
      this.sTitle.Clear();
    }
    this.UpdateOwnPos();
  }

  SetMargin(iNewMargin) {
    this.iMargin = iNewMargin;
    this.UpdateOwnPos();
  }

  HasTitle() {
    return !!(this.sTitle.getLength() !== 0);
  }

  DrawElement(cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== GroupBox && GroupBox.prototype instanceof $c) return $c.prototype.DrawElement.apply(this, arguments); }
    if (this.dwBackClr !== 0xffffffff) {
      $.pDraw.DrawBoxDw(cgo.Surface, ftoi32(Math.fround(cgo.TargetX + Math.fround(this.rcBounds.x))), ftoi32(Math.fround(cgo.TargetY + Math.fround(this.rcBounds.y))), ftoi32(Math.fround(Math.fround(Math.fround(cgo.TargetX + Math.fround(this.rcBounds.x)) + Math.fround(this.rcBounds.Wdt)) - Math.fround(1))), ftoi32(Math.fround(Math.fround(Math.fround(cgo.TargetY + Math.fround(this.rcBounds.y)) + Math.fround(this.rcBounds.Hgt)) - Math.fround(1))), this.dwBackClr);
    }
    let iBorderYOff = 0;
    const iTitleGapX = [0];
    const iTitleGapWdt = [0];
    if (this.HasTitle()) {
      let pTitleFont = this.GetTitleFont();
      iBorderYOff = pTitleFont.GetLineHeight() / 2 | 0;
      pTitleFont.GetTextExtent(this.sTitle.getData(), P(iTitleGapWdt, 0), P(iTitleGapX, 0), true);
      iTitleGapX[0] = 7;
      iTitleGapWdt[0] = iTitleGapWdt[0] + 4 | 0;
      $.pDraw.TextOut(this.sTitle.getData(), pTitleFont, 1, cgo.Surface, Math.fround(Math.fround(Math.fround(cgo.TargetX + Math.fround(this.rcBounds.x)) + Math.fround(iTitleGapX[0])) + Math.fround(2)), Math.fround(cgo.TargetY + Math.fround(this.rcBounds.y)), this.dwTitleClr);
    }
    if (this.dwFrameClr !== 0) {
      let x1 = ftoi32(Math.fround(cgo.TargetX + Math.fround(this.rcBounds.x)));
      let y1 = ftoi32(Math.fround(Math.fround(cgo.TargetY + Math.fround(this.rcBounds.y)) + Math.fround(iBorderYOff)));
      let x2 = x1 + this.rcBounds.Wdt | 0;
      let y2 = (y1 + this.rcBounds.Hgt | 0) - iBorderYOff | 0;
      if (iTitleGapWdt[0] !== 0) {
        for (let i = 0; i < 2; i = i + 1 | 0) {
          $.pDraw.DrawLineDw(cgo.Surface, Math.fround(Math.fround(x1) + Math.fround(i)), Math.fround(y1), Math.fround(x1 + i | 0), Math.fround(y2 - 1 | 0), this.dwFrameClr);
          $.pDraw.DrawLineDw(cgo.Surface, Math.fround(x1 + 2 | 0), Math.fround(y1 + i | 0), Math.fround(x1 + iTitleGapX[0] | 0), Math.fround(y1 + i | 0), this.dwFrameClr);
          $.pDraw.DrawLineDw(cgo.Surface, Math.fround((x1 + iTitleGapX[0] | 0) + iTitleGapWdt[0] | 0), Math.fround(y1 + i | 0), Math.fround(x2 - 3 | 0), Math.fround(y1 + i | 0), this.dwFrameClr);
          $.pDraw.DrawLineDw(cgo.Surface, Math.fround((x2 - 1 | 0) - i | 0), Math.fround(y1), Math.fround((x2 - 1 | 0) - i | 0), Math.fround(y2 - 1 | 0), this.dwFrameClr);
          $.pDraw.DrawLineDw(cgo.Surface, Math.fround(x1 + 2 | 0), Math.fround((y2 - 1 | 0) - i | 0), Math.fround(x2 - 3 | 0), Math.fround((y2 - 1 | 0) - i | 0), this.dwFrameClr);
        }
      } else {
        $.pDraw.DrawFrameDw(cgo.Surface, x1, y1, x2, y2 - 1 | 0, this.dwFrameClr);
        $.pDraw.DrawFrameDw(cgo.Surface, x1 + 1 | 0, y1 + 1 | 0, x2 - 1 | 0, y2 - 2 | 0, this.dwFrameClr);
      }
    } else {
      this.Draw3DFrame(cgo);
    }
  }

  GetMarginTop() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== GroupBox && GroupBox.prototype instanceof $c) return $c.prototype.GetMarginTop.apply(this, arguments); }
    return this.HasTitle() ? this.iMargin + this.GetTitleFont().GetLineHeight() | 0 : this.iMargin;
  }

  GetMarginLeft() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== GroupBox && GroupBox.prototype instanceof $c) return $c.prototype.GetMarginLeft.apply(this, arguments); }
    return this.iMargin;
  }

  GetMarginRight() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== GroupBox && GroupBox.prototype instanceof $c) return $c.prototype.GetMarginRight.apply(this, arguments); }
    return this.iMargin;
  }

  GetMarginBottom() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== GroupBox && GroupBox.prototype instanceof $c) return $c.prototype.GetMarginBottom.apply(this, arguments); }
    return this.iMargin;
  }

  $clone() { return new GroupBox().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.sTitle.$assign(o.sTitle);
    this.pFont = o.pFont;
    this.dwFrameClr = o.dwFrameClr;
    this.dwTitleClr = o.dwTitleClr;
    this.dwBackClr = o.dwBackClr;
    this.iMargin = o.iMargin;
    return this;
  }
}

export class PaintBox extends Window {
  fctPaint = new $.C4FacetSurface().init();

  DrawElement(cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== PaintBox && PaintBox.prototype instanceof $c) return $c.prototype.DrawElement.apply(this, arguments); }
    this.fctPaint.Draw$pC4Surface$f32$f32$i32$i32(cgo.Surface, Math.fround(Math.fround(this.rcBounds.x) + cgo.TargetX), Math.fround(Math.fround(this.rcBounds.y) + cgo.TargetY));
  }

  init(rtBounds, iSfcWdt = -1, iSfcHgt = -1) {
    super.init();
    this.fctPaint = new $.C4FacetSurface().init();
    this.$dyn = PaintBox;
    if (iSfcWdt < 0) {
      iSfcWdt = rtBounds.Wdt;
    }
    if (iSfcHgt < 0) {
      iSfcHgt = rtBounds.Hgt;
    }
    if (iSfcWdt <= 0 || iSfcHgt <= 0) {
      return this;
    }
    this.fctPaint.Create(iSfcWdt, iSfcHgt);
    return this;
  }

  $dtor() {
    super.$dtor();
  }

  MouseInput$rCMouse$i32$i32$i32$u32(_rMouse, _iButton, _iX, _iY, _dwKeyParam) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== PaintBox && PaintBox.prototype instanceof $c) return $c.prototype.MouseInput$rCMouse$i32$i32$i32$u32.apply(this, arguments); }
  }

  $clone() { return new PaintBox().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.fctPaint.$assign(o.fctPaint);
    return this;
  }
}

export class Control extends Window {
  pKeyContext = null;

  CharIn(_0) {
    return false;
  }

  DisableFocus() {
    if (!this.HasFocus()) {
      return;
    }
    let pDlg = this.GetDlg();
    if (pDlg == null) {
      return;
    }
    pDlg.AdvanceFocus(true);
  }

  IsFocusOnClick() {
    return true;
  }

  IsFocusElement() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Control && Control.prototype instanceof $c) return $c.prototype.IsFocusElement.apply(this, arguments); }
    return this;
  }

  OnGetFocus(_fByMouse) {
  }

  OnLooseFocus() {
  }

  KeyContext() {
    return this.DoContext$v();
  }

  init(rtBounds) {
    super.init();
    this.$dyn = Control;
    this.SetBounds(rtBounds);
    this.pKeyContext = new $.C4KeyBinding().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(127), S("GUIContext"), 2 /*KEYSCOPE_Gui*/, new ControlKeyCB$Control().init(this, "KeyContext"), 3);
    return this;
  }

  $dtor() {
    $delete(this.pKeyContext);
    super.$dtor();
  }

  MouseInput$rCMouse$i32$i32$i32$u32(rMouse, iButton, iX, iY, dwKeyParam) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Control && Control.prototype instanceof $c) return $c.prototype.MouseInput$rCMouse$i32$i32$i32$u32.apply(this, arguments); }
    if (!this.IsVisible()) {
      return;
    }
    if (this.IsFocusOnClick() && this.IsFocusElement() != null) {
      if (iButton === 1 && !this.HasFocus()) {
        let pParentDlg = this.GetDlg();
        if (pParentDlg != null) {
          let pActiveCtrl = pParentDlg.GetFocus();
          if (pActiveCtrl == null || !this.IsParentOf(pActiveCtrl)) {
            pParentDlg.SetFocus(this, true);
          }
        }
      }
    }
    Window.prototype.MouseInput$rCMouse$i32$i32$i32$u32.call(this, rMouse, iButton, iX, iY, dwKeyParam);
  }

  HasFocus() {
    return this.pParent != null && this.pParent.IsFocused(this);
  }

  HasDrawFocus() {
    if (!this.HasFocus()) {
      return false;
    }
    if (this.GetScreen() != null && this.GetScreen().HasContext()) {
      return false;
    }
    let pDlg = this.GetDlg();
    if (pDlg == null) {
      return true;
    }
    return pDlg.IsActive$b(true);
  }

  $clone() { return new Control().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pKeyContext = o.pKeyContext;
    return this;
  }
}

export class LabeledEdit extends Window {
  pEdit = null;

  init(rcBounds, szName, fMultiline, szPrefText = null, pUseFont = null, dwTextClr = 0xffffffff) {
    super.init();
    this.$dyn = LabeledEdit;
    if (pUseFont == null) {
      pUseFont = $.GraphicsResource.TextFont;
    }
    this.SetBounds(rcBounds);
    let caMain = new ComponentAligner().init(this.GetClientRect(), 0, 0, true);
    const iLabelWdt = [100];
    const iLabelHgt = [24];
    pUseFont.GetTextExtent(szName, P(iLabelWdt, 0), P(iLabelHgt, 0), true);
    let rcLabel = new $.C4Rect();
    let rcEdit = new $.C4Rect();
    if (fMultiline) {
      rcLabel.$assign(caMain.GetFromTop$i32$i32(iLabelHgt[0]));
      caMain.ExpandLeft(-2);
      caMain.ExpandTop(-2);
      rcEdit.$assign(caMain.GetAll$v());
    } else {
      rcLabel.$assign(caMain.GetFromLeft$i32$i32(iLabelWdt[0]));
      caMain.ExpandLeft(-2);
      rcEdit.$assign(caMain.GetAll$v());
    }
    Container.prototype.AddElement$pElement.call(this, new Label().init$pi8$C4Rect$i32$u32$pCStdFont$b$b$b(szName, rcLabel, 0, dwTextClr, pUseFont, false));
    Container.prototype.AddElement$pElement.call(this, this.pEdit = new Edit().init(rcEdit, false));
    this.pEdit.SetFont$pCStdFont(pUseFont);
    if (szPrefText != null) {
      this.pEdit.InsertText(szPrefText, false);
    }
    return this;
  }

  GetText$v$c() {
    return this.pEdit.GetText$v();
  }

  GetEdit() {
    return this.pEdit;
  }

  static GetControlSize$pi32$pi32$pi8$pCStdFont$b(piWdt, piHgt, szForText, pForFont, fMultiline) {
    let pUseFont = pForFont != null ? pForFont : $.GraphicsResource.TextFont;
    const iLabelWdt = [100];
    const iLabelHgt = [24];
    pUseFont.GetTextExtent(szForText, P(iLabelWdt, 0), P(iLabelHgt, 0), true);
    let iEditWdt = 100;
    let iEditHgt = Edit.GetCustomEditHeight(pUseFont);
    if (fMultiline) {
      iEditWdt = iEditWdt + 2 | 0;
      if (piWdt != null) {
        piWdt.a[piWdt.o] = $max(iLabelWdt[0], iEditWdt);
      }
      if (piHgt != null) {
        piHgt.a[piHgt.o] = (iLabelHgt[0] + iEditHgt | 0) + 2 | 0;
      }
    } else {
      iLabelWdt[0] = iLabelWdt[0] + 2 | 0;
      if (piWdt != null) {
        piWdt.a[piWdt.o] = iLabelWdt[0] + iEditWdt | 0;
      }
      if (piHgt != null) {
        piHgt.a[piHgt.o] = $max(iLabelHgt[0], iEditHgt);
      }
    }
    return true;
  }

  $clone() { return new LabeledEdit().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pEdit = o.pEdit;
    return this;
  }
}

export class Tabular$Sheet extends Window {
  sTitle = new $.StdStrBuf();
  icoTitle = 0;
  cHotkey = 0;
  dwCaptionClr = 0;
  fHasCloseButton = false;
  fCloseButtonHighlighted = false;
  fTitleMarkup = false;

  init(szTitle, rcBounds, icoTitle = -1, fHasCloseButton = false, fTitleMarkup = true) {
    super.init();
    this.sTitle = new $.StdStrBuf();
    this.icoTitle = icoTitle;
    this.cHotkey = 0;
    this.dwCaptionClr = 0;
    this.fHasCloseButton = fHasCloseButton;
    this.fCloseButtonHighlighted = false;
    this.fTitleMarkup = fTitleMarkup;
    this.$dyn = Tabular$Sheet;
    if (szTitle != null) {
      this.sTitle.Copy$pi8(szTitle);
      if (fTitleMarkup) {
        ExpandHotkeyMarkup(this.sTitle, P(this, "cHotkey"));
      }
    }
    this.SetBounds(rcBounds);
    return this;
  }

  DrawCaption(cgo, x, y, iMaxWdt, fLarge, fActive, fFocus, pfctClip, pfctIcon, pUseFont) {
    const iTxtHgt = [0];
    const iTxtWdt = [0];
    this.GetCaptionSize(P(iTxtWdt, 0), P(iTxtHgt, 0), fLarge, fActive, pfctClip, pfctIcon, pUseFont);
    if (pfctClip != null) {
      iMaxWdt = iTxtWdt[0];
    }
    const rUseFont = pUseFont != null ? pUseFont : fLarge ? $.GraphicsResource.CaptionFont : $.GraphicsResource.TextFont;
    if (pfctClip != null && pfctIcon != null) {
      pfctClip.Draw$pC4Surface$f32$f32$i32$i32(cgo.Surface, Math.fround(x), Math.fround(y));
      let xCenter = x + (iTxtWdt[0] / 2 | 0) | 0;
      let yCenter = y + (iTxtHgt[0] / 2 | 0) | 0;
      let iLabelHgt = rUseFont.GetLineHeight();
      let iIconLabelSpacing = 2;
      let yTop = ftoi32(Math.fround(Math.fround(yCenter) - Math.fround(Math.fround(Math.fround(pfctIcon.Hgt + Math.fround(iIconLabelSpacing)) + Math.fround(iLabelHgt)) / Math.fround(2))));
      pfctIcon.Draw$pC4Surface$f32$f32$i32$i32(cgo.Surface, Math.fround(Math.fround(xCenter) - Math.fround(pfctIcon.Wdt / Math.fround(2))), Math.fround(yTop), this.icoTitle);
      $.pDraw.TextOut(this.sTitle.getData(), rUseFont, 1, cgo.Surface, Math.fround(xCenter), Math.fround(Math.fround(Math.fround(yTop) + pfctIcon.Hgt) + Math.fround(iIconLabelSpacing)), fActive ? 0xff000000 : 0xff000000, 1);
    }
    if (fFocus) {
      $.pDraw.SetBlitMode(1);
      $.GraphicsResource.fctButtonHighlightRound.DrawX(cgo.Surface, Math.fround((fLarge ? x : x - (iTxtWdt[0] / 2 | 0) | 0) + 5 | 0), Math.fround(y + 3 | 0), Math.fround((fLarge ? iMaxWdt : iTxtWdt[0]) - 10 | 0), Math.fround(iTxtHgt[0] - 6 | 0));
      $.pDraw.ResetBlitMode();
    }
    if (!(pfctClip != null && pfctIcon != null)) {
      let xo = x;
      if (this.icoTitle >= 0) {
        let cgoIcon = new $.C4Facet().init$pC4Surface$f32$f32$f32$f32(cgo.Surface, Math.fround(x), Math.fround(y + 1 | 0), Math.fround(iTxtHgt[0] - 2 | 0), Math.fround(iTxtHgt[0] - 2 | 0));
        if (fLarge) {
          x = x + (iTxtHgt[0] + 2 | 0) | 0;
        } else {
          cgoIcon.X = Math.fround(cgoIcon.X - Math.fround(iTxtWdt[0] / 2 | 0));
          x = x + (iTxtHgt[0] / 2 | 0) | 0;
        }
        Icon.GetIconFacet$i32(this.icoTitle).Draw$rC4Facet$b$i32$i32$b(cgoIcon);
      }
      if (!fLarge && this.fHasCloseButton) {
        x = x - (iTxtHgt[0] / 2 | 0) | 0;
      }
      let dwClr = this.dwCaptionClr;
      if (dwClr === 0) {
        dwClr = fActive ? 0xffffffff : 0xffafafaf;
      }
      $.pDraw.TextOut(this.sTitle.getData(), rUseFont, fLarge ? Math.fround(1.20000005) : 1, cgo.Surface, Math.fround(x), Math.fround(y), dwClr, (fLarge ? $.ALeft$C4Surface : $.ACenter$C4Surface) & 0xff, this.fTitleMarkup);
      if (this.fHasCloseButton) {
        xo = xo + (((iTxtWdt[0] / (2 - (fLarge ? 1 : 0) | 0) | 0) - iTxtHgt[0] | 0) + 1 | 0) | 0;
        let cgoCloseBtn = new $.C4Facet().init$pC4Surface$f32$f32$f32$f32(cgo.Surface, Math.fround(xo), Math.fround(y + 1 | 0), Math.fround(iTxtHgt[0] - 2 | 0), Math.fround(iTxtHgt[0] - 2 | 0));
        if (!this.fCloseButtonHighlighted) {
          $.pDraw.ActivateBlitModulation(0x7f7f7f);
        }
        Icon.GetIconFacet$i32(34 /*Ico_Close*/).Draw$rC4Facet$b$i32$i32$b(cgoCloseBtn);
        if (!this.fCloseButtonHighlighted) {
          $.pDraw.DeactivateBlitModulation();
        }
      }
    }
  }

  GetCaptionSize(piWdt, piHgt, fLarge, _fActive, pfctClip, pfctIcon, pUseFont) {
    if (pfctClip != null && pfctIcon != null) {
      if (piWdt != null) {
        piWdt.a[piWdt.o] = Tabular.GetLeftClipSize(pfctClip);
      }
      if (piHgt != null) {
        piHgt.a[piHgt.o] = ftoi32(pfctClip.Hgt);
      }
      return;
    }
    const iWdt = [0];
    const iHgt = [0];
    const rUseFont = pUseFont != null ? pUseFont : fLarge ? $.GraphicsResource.CaptionFont : $.GraphicsResource.TextFont;
    if (!rUseFont.GetTextExtent(this.sTitle.getData(), P(iWdt, 0), P(iHgt, 0), this.fTitleMarkup)) {
      iWdt[0] = 70;
      iHgt[0] = rUseFont.GetLineHeight();
    }
    if (fLarge) {
      iWdt[0] = Math.imul(iWdt[0], 6) / 5 | 0;
      iHgt[0] = Math.imul(iHgt[0], 6) / 5 | 0;
    }
    if (this.icoTitle >= 0) {
      iWdt[0] = iWdt[0] + (iHgt[0] + Math.imul(fLarge ? 1 : 0, 2) | 0) | 0;
    }
    if (this.fHasCloseButton) {
      iWdt[0] = iWdt[0] + (iHgt[0] + Math.imul(fLarge ? 1 : 0, 2) | 0) | 0;
    }
    if (piWdt != null) {
      piWdt.a[piWdt.o] = iWdt[0];
    }
    if (piHgt != null) {
      piHgt.a[piHgt.o] = iHgt[0];
    }
  }

  OnShown$b(_fByUser) {
  }

  SetCloseButtonHighlight(fToVal) {
    this.fCloseButtonHighlighted = fToVal;
  }

  IsPosOnCloseButton(x, y, iCaptWdt, iCaptHgt, _fLarge) {
    return this.fHasCloseButton && $.Inside$i32$i32$i32$3(x, (iCaptWdt - iCaptHgt | 0) + 1 | 0, iCaptWdt - 2 | 0) && $.Inside$i32$i32$i32$3(y, 1, iCaptHgt - 2 | 0);
  }

  UserClose$v() {
    $delete(this);
  }

  HasCloseButton() {
    return this.fHasCloseButton;
  }

  $clone() { return new Tabular$Sheet().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.sTitle.$assign(o.sTitle);
    this.icoTitle = o.icoTitle;
    this.cHotkey = o.cHotkey;
    this.dwCaptionClr = o.dwCaptionClr;
    this.fHasCloseButton = o.fHasCloseButton;
    this.fCloseButtonHighlighted = o.fCloseButtonHighlighted;
    this.fTitleMarkup = o.fTitleMarkup;
    return this;
  }
}

export class ContextMenu extends Window {
  static iGlobalMenuIndex;
  pKeySelUp = null;
  pKeySelDown = null;
  pKeySubmenu = null;
  pKeyBack = null;
  pKeyAbort = null;
  pKeyConfirm = null;
  pKeyHotkey = null;
  iMenuIndex = 0;
  pTarget = null;
  pSelectedItem = null;
  pSubmenu = null;

  KeySelUp() {
    if (this.pSubmenu != null) {
      return false;
    }
    let pPrevSelectedItem = this.pSelectedItem;
    if (this.pSelectedItem != null) {
      this.pSelectedItem = this.pSelectedItem.GetPrev();
    }
    if (this.pSelectedItem == null) {
      this.pSelectedItem = this.GetLastContained();
    }
    if (this.pSelectedItem !== pPrevSelectedItem) {
      this.SelectionChanged(true);
    }
    return true;
  }

  KeySelDown() {
    if (this.pSubmenu != null) {
      return false;
    }
    let pPrevSelectedItem = this.pSelectedItem;
    if (this.pSelectedItem != null) {
      this.pSelectedItem = Element.prototype.GetNext$v$c.call(this.pSelectedItem);
    }
    if (this.pSelectedItem == null) {
      this.pSelectedItem = this.GetFirstContained();
    }
    if (this.pSelectedItem !== pPrevSelectedItem) {
      this.SelectionChanged(true);
    }
    return true;
  }

  KeySubmenu() {
    if (this.pSubmenu != null) {
      return false;
    }
    this.CheckOpenSubmenu();
    return true;
  }

  KeyBack() {
    if (this.pSubmenu != null) {
      return false;
    }
    if (this.IsSubmenu()) {
      this.Abort$b(true);
      return true;
    }
    return false;
  }

  KeyAbort() {
    if (this.pSubmenu != null) {
      return false;
    }
    this.Abort$b(true);
    return true;
  }

  KeyConfirm() {
    if (this.pSubmenu != null) {
      return false;
    }
    this.CheckOpenSubmenu();
    this.DoOK();
    return true;
  }

  KeyHotkey(key) {
    if (this.pSubmenu != null) {
      return false;
    }
    let pPrevSelectedItem = this.pSelectedItem;
    let sKey = $.C4KeyCodeEx.KeyCode2String(key.Key, true, true);
    if (sKey.getLength() !== 1) {
      return false;
    }
    let wKey = $rd(sKey.getData()) & 0xffff;
    if ($.Inside$u64$u64$u64(wKey, 65, 90) || $.Inside$u64$u64$u64(wKey, 48, 57)) {
      let ch = wKey;
      for (let pCurr = Container.prototype.GetFirst.call(this); pCurr != null; pCurr = Element.prototype.GetNext$v$c.call(pCurr)) {
        if (pCurr.OnHotkey(ch)) {
          this.pSelectedItem = pCurr;
          if (this.pSelectedItem !== pPrevSelectedItem) {
            this.SelectionChanged(true);
          }
          this.CheckOpenSubmenu();
          this.DoOK();
          return true;
        }
      }
      return false;
    }
    return false;
  }

  UpdateElementPositions() {
    let pCurr = Container.prototype.GetFirst.call(this);
    if (pCurr == null) {
      return;
    }
    pCurr.GetBounds().y = 0;
    let iMinWdt = $max(20, pCurr.GetBounds().Wdt);
    ;
    let iOverallHgt = pCurr.GetBounds().Hgt;
    while ((pCurr = Element.prototype.GetNext$v$c.call(pCurr)) != null) {
      iMinWdt = $max(iMinWdt, pCurr.GetBounds().Wdt);
      let iYSpace = pCurr.GetListItemTopSpacing();
      let iNewY = iOverallHgt + iYSpace | 0;
      iOverallHgt = iOverallHgt + (pCurr.GetBounds().Hgt + iYSpace | 0) | 0;
      if (iNewY !== pCurr.GetBounds().y) {
        pCurr.GetBounds().y = iNewY;
        pCurr.UpdateOwnPos();
      }
    }
    iMinWdt = $max(iMinWdt, (this.rcBounds.Wdt - this.GetMarginLeft() | 0) - this.GetMarginRight() | 0);
    for (pCurr = Container.prototype.GetFirst.call(this); pCurr != null; pCurr = Element.prototype.GetNext$v$c.call(pCurr)) {
      if (pCurr.GetBounds().Wdt !== iMinWdt) {
        pCurr.GetBounds().Wdt = iMinWdt;
        pCurr.UpdateOwnPos();
      }
    }
    this.rcBounds.Wdt = (iMinWdt + this.GetMarginLeft() | 0) + this.GetMarginRight() | 0;
    this.rcBounds.Hgt = ($max(iOverallHgt, 8) + this.GetMarginTop() | 0) + this.GetMarginBottom() | 0;
    this.UpdateSize();
  }

  AddElement$pElement(pChild) {
    Container.prototype.AddElement$pElement.call(this, pChild);
    this.UpdateElementPositions();
    return true;
  }

  InsertElement$pElement$pElement(pChild, pInsertBefore) {
    Container.prototype.InsertElement$pElement$pElement.call(this, pChild, pInsertBefore);
    this.UpdateElementPositions();
    return true;
  }

  CtxMouseInput(rMouse, iButton, iScreenX, iScreenY, dwKeyParam) {
    if (this.pSubmenu != null) {
      if (this.pSubmenu.CtxMouseInput(rMouse, iButton, iScreenX, iScreenY, dwKeyParam)) {
        return true;
      }
    }
    if (!this.rcBounds.Contains$i32$i32(iScreenX, iScreenY)) {
      return false;
    }
    this.MouseInput$rCMouse$i32$i32$i32$u32(rMouse, iButton, iScreenX - this.rcBounds.x | 0, iScreenY - this.rcBounds.y | 0, dwKeyParam);
    return true;
  }

  RemoveElement(pChild) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ContextMenu && ContextMenu.prototype instanceof $c) return $c.prototype.RemoveElement.apply(this, arguments); }
    Container.prototype.RemoveElement.call(this, pChild);
    if (pChild === this.pTarget) {
      this.Abort$b(false);
      return;
    }
    if (pChild === this.pSubmenu) {
      this.pSubmenu = null;
    }
    if (pChild === this.pSelectedItem) {
      this.pSelectedItem = null;
      this.SelectionChanged(false);
    }
    if (this.pSubmenu != null) {
      this.pSubmenu.RemoveElement(pChild);
    }
    if (this.GetScreen() != null) {
      this.GetScreen().Mouse.RemoveElement(pChild);
    }
    this.UpdateElementPositions();
  }

  CharIn(c) {
    if (this.pSubmenu != null) {
      return this.pSubmenu.CharIn(c);
    }
    return false;
  }

  MouseLeaveEntry(_rMouse, pOldEntry) {
    if (pOldEntry === this.pSelectedItem && this.pSubmenu == null) {
      this.pSelectedItem = null;
      this.SelectionChanged(true);
    }
  }

  DrawElement(cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ContextMenu && ContextMenu.prototype instanceof $c) return $c.prototype.DrawElement.apply(this, arguments); }
    $.pDraw.DrawBoxDw(cgo.Surface, ftoi32(Math.fround(Math.fround(this.rcBounds.x) + cgo.TargetX)), ftoi32(Math.fround(Math.fround(this.rcBounds.y) + cgo.TargetY)), ftoi32(Math.fround(Math.fround(Math.fround(this.rcBounds.x + this.rcBounds.Wdt | 0) + cgo.TargetX) - Math.fround(1))), ftoi32(Math.fround(Math.fround(Math.fround(this.rcBounds.y + this.rcBounds.Hgt | 0) + cgo.TargetY) - Math.fround(1))), 0xaf3f1a00);
    if (this.pSelectedItem != null) {
      let rcSelArea = this.pSelectedItem.GetBounds().$clone();
      rcSelArea.x = rcSelArea.x + this.GetClientRect().x | 0;
      rcSelArea.y = rcSelArea.y + this.GetClientRect().y | 0;
      $.pDraw.DrawBoxDw(cgo.Surface, ftoi32(Math.fround(Math.fround(rcSelArea.x) + cgo.TargetX)), ftoi32(Math.fround(Math.fround(rcSelArea.y) + cgo.TargetY)), ftoi32(Math.fround(Math.fround(Math.fround(rcSelArea.x + rcSelArea.Wdt | 0) + cgo.TargetX) - Math.fround(1))), ftoi32(Math.fround(Math.fround(Math.fround(rcSelArea.y + rcSelArea.Hgt | 0) + cgo.TargetY) - Math.fround(1))), 0x4faf0000);
    }
    this.Draw3DFrame(cgo);
  }

  Draw$rC4TargetFacet(cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ContextMenu && ContextMenu.prototype instanceof $c) return $c.prototype.Draw$rC4TargetFacet.apply(this, arguments); }
    if (cgo.Surface == null) {
      return;
    }
    Window.prototype.Draw$rC4TargetFacet.call(this, cgo);
    if (this.pSubmenu != null) {
      this.pSubmenu.Draw$rC4TargetFacet(cgo);
    }
  }

  IsMenu() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ContextMenu && ContextMenu.prototype instanceof $c) return $c.prototype.IsMenu.apply(this, arguments); }
    return true;
  }

  GetScreen() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ContextMenu && ContextMenu.prototype instanceof $c) return $c.prototype.GetScreen.apply(this, arguments); }
    return Screen.GetScreenS();
  }

  GetMarginTop() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ContextMenu && ContextMenu.prototype instanceof $c) return $c.prototype.GetMarginTop.apply(this, arguments); }
    return 5;
  }

  GetMarginLeft() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ContextMenu && ContextMenu.prototype instanceof $c) return $c.prototype.GetMarginLeft.apply(this, arguments); }
    return 5;
  }

  GetMarginRight() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ContextMenu && ContextMenu.prototype instanceof $c) return $c.prototype.GetMarginRight.apply(this, arguments); }
    return 5;
  }

  GetMarginBottom() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ContextMenu && ContextMenu.prototype instanceof $c) return $c.prototype.GetMarginBottom.apply(this, arguments); }
    return 5;
  }

  SelectionChanged(fByUser) {
    if (this.pSelectedItem != null) {
      if (fByUser) {
        GUISound(S("UI::Select"));
      }
    }
    if (this.pSubmenu != null) {
      this.pSubmenu.Abort$b(true);
    }
  }

  ElementSizeChanged(pOfElement) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ContextMenu && ContextMenu.prototype instanceof $c) return $c.prototype.ElementSizeChanged.apply(this, arguments); }
    Container.prototype.ElementSizeChanged.call(this, pOfElement);
    this.UpdateElementPositions();
  }

  ElementPosChanged(pOfElement) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ContextMenu && ContextMenu.prototype instanceof $c) return $c.prototype.ElementPosChanged.apply(this, arguments); }
    Container.prototype.ElementSizeChanged.call(this, pOfElement);
    this.UpdateElementPositions();
  }

  CheckOpenSubmenu() {
    if (!(this.GetScreen() != null)) {
      return;
    }
    if (this.pSelectedItem == null) {
      return;
    }
    let pSelEntry = this.pSelectedItem;
    let pSubmenuHandler = pSelEntry.pSubmenuHandler;
    if (pSubmenuHandler == null) {
      return;
    }
    if (this.pSubmenu != null) {
      this.pSubmenu.Abort$b(false);
    }
    this.pSubmenu = pSubmenuHandler.OnSubcontext(this.pTarget);
    let iX = (this.GetClientRect().x + pSelEntry.GetBounds().x | 0) + pSelEntry.GetBounds().Wdt | 0;
    let iY = (this.GetClientRect().y + pSelEntry.GetBounds().y | 0) + (pSelEntry.GetBounds().Hgt / 2 | 0) | 0;
    let iScreenWdt = this.GetScreen().GetBounds().Wdt;
    let iScreenHgt = this.GetScreen().GetBounds().Hgt;
    if ((iY + this.pSubmenu.GetBounds().Hgt | 0) >= iScreenHgt) {
      if (iY < this.pSubmenu.GetBounds().Hgt) {
        iY = iScreenHgt;
      }
      iY = iY - this.pSubmenu.GetBounds().Hgt | 0;
    }
    if ((iX + this.pSubmenu.GetBounds().Wdt | 0) >= iScreenWdt) {
      if (this.GetClientRect().x < this.pSubmenu.GetBounds().Wdt) {
        iX = iScreenWdt;
      } else {
        iX = this.GetClientRect().x;
      }
      iX = iX - this.pSubmenu.GetBounds().Wdt | 0;
    }
    this.pSubmenu.Open(this.pTarget, iX, iY);
  }

  IsSubmenu() {
    return this.GetScreen() != null && this.GetScreen().pContext !== this;
  }

  DoOK() {
    if (!(this.GetScreen() != null)) {
      return;
    }
    if (this.pSelectedItem == null) {
      return;
    }
    let pSelEntry = this.pSelectedItem;
    let pCallback = pSelEntry.GetAndZeroCallback();
    let pTarget = this.pTarget;
    if (pCallback == null) {
      return;
    }
    this.GetScreen().AbortContext(false);
    GUISound(S("UI::Click"));
    pCallback.OnOK(pTarget);
    $delete(pCallback);
  }

  init() {
    super.init();
    this.pTarget = null;
    this.pSelectedItem = null;
    this.pSubmenu = null;
    this.$dyn = ContextMenu;
    this.iMenuIndex = (ContextMenu.iGlobalMenuIndex = ContextMenu.iGlobalMenuIndex + 1 | 0);
    this.rcBounds.Wdt = 40;
    this.rcBounds.Hgt = 7;
    let Keys = [];
    $vpush(Keys, new $.C4KeyCodeEx().init(103));
    if ($.Config.Controls.GamepadGuiControl !== 0) {
      $.Up(Keys);
    }
    this.pKeySelUp = new $.C4KeyBinding().init$vector$pi8$i32$pC4KeyboardCallbackInterface$u32(Keys, S("GUIContextSelUp"), 2 /*KEYSCOPE_Gui*/, new $.C4KeyCB$ContextMenu().init(this, "KeySelUp"), 6);
    Keys.length = 0;
    $vpush(Keys, new $.C4KeyCodeEx().init(108));
    if ($.Config.Controls.GamepadGuiControl !== 0) {
      $.Down(Keys);
    }
    this.pKeySelDown = new $.C4KeyBinding().init$vector$pi8$i32$pC4KeyboardCallbackInterface$u32(Keys, S("GUIContextSelDown"), 2 /*KEYSCOPE_Gui*/, new $.C4KeyCB$ContextMenu().init(this, "KeySelDown"), 6);
    Keys.length = 0;
    $vpush(Keys, new $.C4KeyCodeEx().init(106));
    if ($.Config.Controls.GamepadGuiControl !== 0) {
      $.Right(Keys);
    }
    this.pKeySubmenu = new $.C4KeyBinding().init$vector$pi8$i32$pC4KeyboardCallbackInterface$u32(Keys, S("GUIContextSubmenu"), 2 /*KEYSCOPE_Gui*/, new $.C4KeyCB$ContextMenu().init(this, "KeySubmenu"), 6);
    Keys.length = 0;
    $vpush(Keys, new $.C4KeyCodeEx().init(105));
    if ($.Config.Controls.GamepadGuiControl !== 0) {
      $.Left(Keys);
    }
    this.pKeyBack = new $.C4KeyBinding().init$vector$pi8$i32$pC4KeyboardCallbackInterface$u32(Keys, S("GUIContextBack"), 2 /*KEYSCOPE_Gui*/, new $.C4KeyCB$ContextMenu().init(this, "KeyBack"), 6);
    Keys.length = 0;
    $vpush(Keys, new $.C4KeyCodeEx().init(1));
    if ($.Config.Controls.GamepadGuiControl !== 0) {
      $.Cancel(Keys);
    }
    this.pKeyAbort = new $.C4KeyBinding().init$vector$pi8$i32$pC4KeyboardCallbackInterface$u32(Keys, S("GUIContextAbort"), 2 /*KEYSCOPE_Gui*/, new $.C4KeyCB$ContextMenu().init(this, "KeyAbort"), 6);
    Keys.length = 0;
    $vpush(Keys, new $.C4KeyCodeEx().init(28));
    if ($.Config.Controls.GamepadGuiControl !== 0) {
      $.Ok(Keys);
    }
    this.pKeyConfirm = new $.C4KeyBinding().init$vector$pi8$i32$pC4KeyboardCallbackInterface$u32(Keys, S("GUIContextConfirm"), 2 /*KEYSCOPE_Gui*/, new $.C4KeyCB$ContextMenu().init(this, "KeyConfirm"), 6);
    this.pKeyHotkey = new $.C4KeyBinding().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(0xffffffffffffffff), S("GUIContextHotkey"), 2 /*KEYSCOPE_Gui*/, new $.C4KeyCBPassKey$ContextMenu().init(this, "KeyHotkey"), 6);
    return this;
  }

  $dtor() {
    if (this.pSubmenu != null) {
      $delete(this.pSubmenu);
      this.pSubmenu = null;
    }
    let pScreen = ContextMenu.prototype.GetScreen.call(this);
    if (pScreen != null) {
      pScreen.RemoveElement(this);
    }
    $delete(this.pKeySelUp);
    $delete(this.pKeySelDown);
    $delete(this.pKeySubmenu);
    $delete(this.pKeyBack);
    $delete(this.pKeyAbort);
    $delete(this.pKeyConfirm);
    $delete(this.pKeyHotkey);
    Container.prototype.Clear$v.call(this);
    super.$dtor();
  }

  MouseInput$rCMouse$i32$i32$i32$u32(rMouse, iButton, iX, iY, dwKeyParam) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ContextMenu && ContextMenu.prototype instanceof $c) return $c.prototype.MouseInput$rCMouse$i32$i32$i32$u32.apply(this, arguments); }
    Window.prototype.MouseInput$rCMouse$i32$i32$i32$u32.call(this, rMouse, iButton, iX, iY, dwKeyParam);
    if (this.GetClientRect().Contains$i32$i32(iX + this.rcBounds.x | 0, iY + this.rcBounds.y | 0)) {
      let pPrevSelectedItem = this.pSelectedItem;
      this.pSelectedItem = null;
      iX = iX - this.GetMarginLeft() | 0;
      iY = iY - this.GetMarginTop() | 0;
      for (let pCurr = Container.prototype.GetFirst.call(this); pCurr != null; pCurr = Element.prototype.GetNext$v$c.call(pCurr)) {
        if (pCurr.GetBounds().Contains$i32$i32(iX, iY)) {
          this.pSelectedItem = pCurr;
        }
      }
      if (this.pSelectedItem !== pPrevSelectedItem) {
        this.SelectionChanged(true);
        this.CheckOpenSubmenu();
      }
      if (iButton === 1) {
        this.DoOK();
        return;
      }
    }
  }

  Open(pTarget, iScreenX, iScreenY) {
    this.rcBounds.x = iScreenX;
    this.rcBounds.y = iScreenY;
    this.UpdatePos();
    this.pTarget = pTarget;
    GUISound(S("UI::Open"));
  }

  Abort$b(fByUser) {
    if (fByUser) {
      GUISound(S("UI::Close"));
    }
    $delete(this);
  }

  AddItem$pi8$pi8$i32$pMenuHandler$pContextHandler(szText, szToolTip = null, icoIcon = -1 /*Ico_None*/, pMenuHandler = null, pSubmenuHandler = null) {
    let pNew = new ContextMenu$Entry().init(szText, icoIcon, pMenuHandler, pSubmenuHandler);
    this.AddElement$pElement(pNew);
    pNew.SetToolTip(szToolTip);
  }

  GetIndexedEntry(iIndex) {
    return this.GetElementByIndex(iIndex);
  }

  SelectItem$i32(iIndex) {
    let pNewSelElement = this.GetElementByIndex(iIndex);
    if (pNewSelElement !== this.pSelectedItem) {
      return;
    }
    this.pSelectedItem = pNewSelElement;
    this.SelectionChanged(false);
  }

  GetMenuIndex() {
    return this.iMenuIndex;
  }

  static GetLastMenuIndex() {
    return ContextMenu.iGlobalMenuIndex;
  }

  GetTargetDialog() {
    return this.pTarget != null ? this.pTarget.GetDlg() : null;
  }

  $clone() { return new ContextMenu().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pKeySelUp = o.pKeySelUp;
    this.pKeySelDown = o.pKeySelDown;
    this.pKeySubmenu = o.pKeySubmenu;
    this.pKeyBack = o.pKeyBack;
    this.pKeyAbort = o.pKeyAbort;
    this.pKeyConfirm = o.pKeyConfirm;
    this.pKeyHotkey = o.pKeyHotkey;
    this.iMenuIndex = o.iMenuIndex;
    this.pTarget = o.pTarget;
    this.pSelectedItem = o.pSelectedItem;
    this.pSubmenu = o.pSubmenu;
    return this;
  }
}

export class Dialog extends Window {
  pKeyAdvanceControl = null;
  pKeyAdvanceControlB = null;
  pKeyHotkey = null;
  pKeyEnter = null;
  pKeyEscape = null;
  pKeyFocusDefControl = null;
  pTitle = null;
  pCloseBtn = null;
  pActiveCtrl = null;
  fShow = false;
  fOK = false;
  iFade = 0;
  eFade = 0;
  fDelOnClose = false;
  TitleString = new $.StdStrBuf();
  fViewportDlg = false;
  pWindow = null;
  pFrameDeco = null;

  CreateConsoleWindow() {
    if (this.pWindow != null) {
      return true;
    }
    this.pWindow = new DialogWindow().init();
    if (!(this.pWindow.Init$pC4AbstractApp$pi8$C4Rect$pi8($.Application, this.TitleString.getData(), this.rcBounds, this.GetID$v()) != null)) {
      $delete(this.pWindow);
      this.pWindow = null;
      return false;
    }
    this.pWindow.pSurface = new $.C4Surface().init$pC4AbstractApp$pC4Window($.Application, this.pWindow);
    this.pWindow.pDialog = this;
    return true;
  }

  DestroyConsoleWindow() {
    if (this.pWindow != null) {
      $delete(this.pWindow.pSurface);
      this.pWindow.Clear();
      $delete(this.pWindow);
      this.pWindow = null;
    }
  }

  UpdateSize() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Dialog && Dialog.prototype instanceof $c) return $c.prototype.UpdateSize.apply(this, arguments); }
    if (this.pTitle != null) {
      let iTextHgt = WoodenLabel.GetDefaultHeight$pCStdFont($.GraphicsResource.TextFont);
      this.pTitle.SetBounds(new $.C4Rect().init$i32$i32$i32$i32(-this.GetMarginLeft() | 0, -iTextHgt | 0, this.rcBounds.Wdt, iTextHgt));
      if (this.pCloseBtn != null) {
        this.pCloseBtn.SetBounds(this.pTitle.GetToprightCornerRect(16, 16, 4, 4, 0));
      }
    }
    Element.prototype.UpdateSize.call(this);
    if (this.pWindow != null) {
      this.pWindow.SetSize(this.rcBounds.Wdt >>> 0, this.rcBounds.Hgt >>> 0);
    }
  }

  UpdatePos() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Dialog && Dialog.prototype instanceof $c) return $c.prototype.UpdatePos.apply(this, arguments); }
    if (this.pWindow != null) {
      this.rcBounds.x = 0;
      this.rcBounds.y = 0;
    }
    Element.prototype.UpdatePos.call(this);
  }

  init(iWdt, iHgt, szTitle, fViewportDlg) {
    super.init();
    this.pTitle = null;
    this.pCloseBtn = null;
    this.fDelOnClose = false;
    this.TitleString = new $.StdStrBuf();
    this.fViewportDlg = fViewportDlg;
    this.pWindow = null;
    this.pFrameDeco = null;
    this.$dyn = Dialog;
    this.pActiveCtrl = null;
    this.fShow = this.fOK = false;
    this.iFade = 100;
    this.eFade = 0 /*eFadeNone*/;
    this.rcBounds.Wdt = iWdt;
    Dialog.prototype.SetTitle$pi8$b.call(this, szTitle);
    this.SetBounds(new $.C4Rect().init$i32$i32$i32$i32(0, 0, iWdt, iHgt));
    let Keys = [];
    $vpush(Keys, new $.C4KeyCodeEx().init(15));
    if ($.Config.Controls.GamepadGuiControl !== 0) {
      $.Right(Keys);
    }
    this.pKeyAdvanceControl = new $.C4KeyBinding().init$vector$pi8$i32$pC4KeyboardCallbackInterface$u32(Keys, S("GUIAdvanceFocus"), 2 /*KEYSCOPE_Gui*/, new DlgKeyCBEx$Dialog$b().init(this, false, "KeyAdvanceFocus"), 2);
    Keys.length = 0;
    $vpush(Keys, new $.C4KeyCodeEx().init(15, 4 /*KEYS_Shift*/));
    if ($.Config.Controls.GamepadGuiControl !== 0) {
      $.Left(Keys);
    }
    this.pKeyAdvanceControlB = new $.C4KeyBinding().init$vector$pi8$i32$pC4KeyboardCallbackInterface$u32(Keys, S("GUIAdvanceFocusBack"), 2 /*KEYSCOPE_Gui*/, new DlgKeyCBEx$Dialog$b().init(this, true, "KeyAdvanceFocus"), 2);
    Keys.length = 0;
    $vpush(Keys, new $.C4KeyCodeEx().init($.KEY_Any$C4KeyboardInput, 1 /*KEYS_Alt*/));
    $vpush(Keys, new $.C4KeyCodeEx().init($.KEY_Any$C4KeyboardInput, 5));
    this.pKeyHotkey = new $.C4KeyBinding().init$vector$pi8$i32$pC4KeyboardCallbackInterface$u32(Keys, S("GUIHotkey"), 2 /*KEYSCOPE_Gui*/, new DlgKeyCBPassKey$Dialog().init(this, "KeyHotkey"), 3);
    Keys.length = 0;
    $vpush(Keys, new $.C4KeyCodeEx().init(28));
    if ($.Config.Controls.GamepadGuiControl !== 0) {
      $.Ok(Keys);
    }
    this.pKeyEnter = new $.C4KeyBinding().init$vector$pi8$i32$pC4KeyboardCallbackInterface$u32(Keys, S("GUIDialogOkay"), 2 /*KEYSCOPE_Gui*/, new DlgKeyCB$Dialog().init(this, "KeyEnter"), 2);
    Keys.length = 0;
    $vpush(Keys, new $.C4KeyCodeEx().init(1));
    if ($.Config.Controls.GamepadGuiControl !== 0) {
      $.Cancel(Keys);
    }
    this.pKeyEscape = new $.C4KeyBinding().init$vector$pi8$i32$pC4KeyboardCallbackInterface$u32(Keys, S("GUIDialogAbort"), 2 /*KEYSCOPE_Gui*/, new DlgKeyCB$Dialog().init(this, "KeyEscape"), 2);
    Keys.length = 0;
    $vpush(Keys, new $.C4KeyCodeEx().init($.KEY_Any$C4KeyboardInput));
    $vpush(Keys, new $.C4KeyCodeEx().init($.KEY_Any$C4KeyboardInput, 4 /*KEYS_Shift*/));
    this.pKeyFocusDefControl = new $.C4KeyBinding().init$vector$pi8$i32$pC4KeyboardCallbackInterface$u32(Keys, S("GUIFocusDefault"), 2 /*KEYSCOPE_Gui*/, new DlgKeyCB$Dialog().init(this, "KeyFocusDefault"), 2);
    return this;
  }

  $dtor() {
    $delete(this.pKeyAdvanceControl);
    $delete(this.pKeyAdvanceControlB);
    $delete(this.pKeyHotkey);
    $delete(this.pKeyEscape);
    $delete(this.pKeyEnter);
    $delete(this.pKeyFocusDefControl);
    Dialog.prototype.DestroyConsoleWindow.call(this);
    this.fDelOnClose = false;
    if (this.pFrameDeco != null) {
      this.pFrameDeco.Deref();
    }
    super.$dtor();
  }

  RemoveElement(pChild) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Dialog && Dialog.prototype instanceof $c) return $c.prototype.RemoveElement.apply(this, arguments); }
    Container.prototype.RemoveElement.call(this, pChild);
    if (pChild === this.pActiveCtrl) {
      this.pActiveCtrl = null;
    }
  }

  Draw$rC4TargetFacet(cgo0) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Dialog && Dialog.prototype instanceof $c) return $c.prototype.Draw$rC4TargetFacet.apply(this, arguments); }
    let cgo = new $.C4TargetFacet().init();
    cgo.Set$C4TargetFacet(cgo0);
    if (this.pWindow != null) {
      cgo.Surface = this.pWindow.pSurface;
      cgo.X = Math.fround(0);
      cgo.Y = Math.fround(0);
      cgo.Wdt = Math.fround(this.rcBounds.Wdt);
      cgo.Hgt = Math.fround(this.rcBounds.Hgt);
    }
    let pScreen = null;
    switch (this.eFade) {
      case 0:
        break;
      case 2:
        if ((this.iFade = this.iFade + 10 | 0) >= 100) {
          if ((pScreen = this.GetScreen()) != null) {
            if (pScreen.GetTopDialog() === this) {
              pScreen.ActivateDialog(this);
            }
          }
          this.eFade = 0 /*eFadeNone*/;
        }
        break;
      case 1:
        if ((this.iFade = this.iFade - 10 | 0) <= 0) {
          this.fVisible = this.fShow = false;
          if ((pScreen = this.GetScreen()) != null) {
            pScreen.RecheckActiveDialog();
          }
          this.eFade = 0 /*eFadeNone*/;
        }
    }
    if (this.iFade < 100) {
      if (this.iFade <= 0) {
        return;
      }
      $.pDraw.ActivateBlitModulation(((Math.imul(this.iFade, 255) / 100 | 0) << 24 | 0 | 0xffffff) >>> 0);
    }
    if (this.pWindow != null) {
      $.pDraw.DrawBoxDw(cgo.Surface, this.rcBounds.x, this.rcBounds.y, this.rcBounds.Wdt - 1 | 0, this.rcBounds.Hgt - 1 | 0, 0xff000000);
    }
    Window.prototype.Draw$rC4TargetFacet.call(this, cgo);
    if (this.iFade < 100) {
      $.pDraw.DeactivateBlitModulation();
    }
    if (this.pWindow != null) {
      let menu = null;
      if ((menu = this.GetScreen().pContext) != null) {
        if (menu.GetTargetDialog() === this) {
          menu.Draw$rC4TargetFacet(cgo);
        }
      }
      let rtSrc = new $.C4Rect();
      let rtDst = new $.C4Rect();
      rtSrc.x = this.rcBounds.x;
      rtSrc.y = this.rcBounds.y;
      rtSrc.Wdt = this.rcBounds.Wdt;
      rtSrc.Hgt = this.rcBounds.Hgt;
      rtDst.x = 0;
      rtDst.y = 0;
      rtDst.Wdt = this.rcBounds.Wdt;
      rtDst.Hgt = this.rcBounds.Hgt;
      this.pWindow.pSurface.PageFlip(rtSrc, rtDst);
    }
  }

  DrawElement(cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Dialog && Dialog.prototype instanceof $c) return $c.prototype.DrawElement.apply(this, arguments); }
    if (this.pFrameDeco != null) {
      this.pFrameDeco.Draw(cgo, this.rcBounds);
    } else {
      $.pDraw.DrawBoxDw(cgo.Surface, ftoi32(Math.fround(cgo.TargetX + Math.fround(this.rcBounds.x))), ftoi32(Math.fround(cgo.TargetY + Math.fround(this.rcBounds.y))), ftoi32(Math.fround(Math.fround((this.rcBounds.x + this.rcBounds.Wdt | 0) - 1 | 0) + cgo.TargetX)), ftoi32(Math.fround(Math.fround((this.rcBounds.y + this.rcBounds.Hgt | 0) - 1 | 0) + cgo.TargetY)), 0x9f000000);
      this.Draw3DFrame(cgo);
    }
  }

  IsComponentOutsideClientArea() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Dialog && Dialog.prototype instanceof $c) return $c.prototype.IsComponentOutsideClientArea.apply(this, arguments); }
    return !(this.pTitle == null);
  }

  GetID$v() {
    return null;
  }

  ApplyElementOffset(riX, riY) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Dialog && Dialog.prototype instanceof $c) return $c.prototype.ApplyElementOffset.apply(this, arguments); }
    Window.prototype.ApplyElementOffset.call(this, riX, riY);
    let pVP = this.GetViewport();
    if (pVP != null) {
      let rcVP = pVP.GetOutputRect();
      riX.a[riX.o] = riX.a[riX.o] - rcVP.x | 0;
      riY.a[riY.o] = riY.a[riY.o] - rcVP.y | 0;
    }
  }

  ApplyInvElementOffset(riX, riY) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Dialog && Dialog.prototype instanceof $c) return $c.prototype.ApplyInvElementOffset.apply(this, arguments); }
    Window.prototype.ApplyInvElementOffset.call(this, riX, riY);
    let pVP = this.GetViewport();
    if (pVP != null) {
      let rcVP = pVP.GetOutputRect();
      riX.a[riX.o] = riX.a[riX.o] + rcVP.x | 0;
      riY.a[riY.o] = riY.a[riY.o] + rcVP.y | 0;
    }
  }

  IsFocused(pCtrl) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Dialog && Dialog.prototype instanceof $c) return $c.prototype.IsFocused.apply(this, arguments); }
    return pCtrl === this.pActiveCtrl;
  }

  SetFocus(pCtrl, fByMouse) {
    if (pCtrl === this.pActiveCtrl) {
      return;
    }
    if (this.pActiveCtrl != null) {
      let pC = this.pActiveCtrl;
      this.pActiveCtrl = null;
      pC.OnLooseFocus();
      if (this.pActiveCtrl != null) {
        return;
      }
    }
    if ((this.pActiveCtrl = pCtrl) != null) {
      pCtrl.OnGetFocus(fByMouse);
    }
  }

  GetFocus() {
    return this.pActiveCtrl;
  }

  GetDlg() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Dialog && Dialog.prototype instanceof $c) return $c.prototype.GetDlg.apply(this, arguments); }
    return this;
  }

  GetDialogWindow() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Dialog && Dialog.prototype instanceof $c) return $c.prototype.GetDialogWindow.apply(this, arguments); }
    return this.pWindow;
  }

  CharIn(c) {
    if (this.pActiveCtrl != null && this.pActiveCtrl.CharIn(c)) {
      return true;
    }
    let pDefCtrl = this.GetDefaultControl();
    if (pDefCtrl != null && pDefCtrl !== this.pActiveCtrl && (c == null || c.a[c.o] !== 32)) {
      this.SetFocus(pDefCtrl, false);
      if (this.pActiveCtrl != null && this.pActiveCtrl.CharIn(c)) {
        return true;
      }
    }
    return false;
  }

  KeyHotkey(key) {
    let sKey = $.C4KeyCodeEx.KeyCode2String(key.Key, true, true);
    if (sKey.getLength() !== 1) {
      return false;
    }
    let wKey = $rd(sKey.getData()) & 0xffff;
    if ($.Inside$u16$i8$i8(c$toupper(wKey) & 0xffff, 65, 90)) {
      if (this.OnHotkey((c$toupper(wKey) << 24 >> 24) >>> 0)) {
        return true;
      }
    }
    if ($.Inside$u16$i8$i8(c$toupper(wKey) & 0xffff, 48, 57)) {
      if (this.OnHotkey((c$toupper(wKey) << 24 >> 24) >>> 0)) {
        return true;
      }
    }
    return false;
  }

  KeyFocusDefault() {
    let pDefCtrl = this.GetDefaultControl();
    if (pDefCtrl != null && pDefCtrl !== this.pActiveCtrl) {
      this.SetFocus(pDefCtrl, false);
    }
    return false;
  }

  MouseInput$rCMouse$i32$i32$i32$u32(rMouse, iButton, iX, iY, dwKeyParam) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Dialog && Dialog.prototype instanceof $c) return $c.prototype.MouseInput$rCMouse$i32$i32$i32$u32.apply(this, arguments); }
    Window.prototype.MouseInput$rCMouse$i32$i32$i32$u32.call(this, rMouse, iButton, iX, iY, dwKeyParam);
  }

  GetDefaultControl() {
    return null;
  }

  OnEnter() {
    $spawn(this.UserClose$b(true));
    return true;
  }

  KeyEnter() {
    return $spawn(this.OnEnter());
  }

  OnEscape() {
    $spawn(this.UserClose$b(false));
    return true;
  }

  KeyEscape() {
    return this.OnEscape();
  }

  AdvanceFocus(fBackwards) {
    let pCurrElement = this.pActiveCtrl;
    for (; ; ) {
      pCurrElement = this.GetNextNestedElement(pCurrElement, fBackwards);
      if (pCurrElement == null && this.pActiveCtrl != null) {
        if (!((pCurrElement = this.GetNextNestedElement(null, fBackwards)) != null)) {
          return;
        }
      }
      if (pCurrElement === this.pActiveCtrl) {
        if (pCurrElement != null && !(pCurrElement.IsFocusElement() != null)) {
          this.SetFocus(null, false);
        }
        return;
      }
      if (pCurrElement.GetParent() != null && !pCurrElement.GetParent().IsSelectedChild(pCurrElement)) {
        continue;
      }
      let pFocusCtrl = pCurrElement.IsFocusElement();
      if (pFocusCtrl != null && pFocusCtrl !== this.pActiveCtrl && pFocusCtrl.IsVisible()) {
        this.SetFocus(pFocusCtrl, false);
        return;
      }
    }
  }

  KeyAdvanceFocus(fBackwards) {
    this.AdvanceFocus(fBackwards);
    return true;
  }

  GetMarginTop() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Dialog && Dialog.prototype instanceof $c) return $c.prototype.GetMarginTop.apply(this, arguments); }
    return (this.pTitle != null ? this.pTitle.GetBounds().Hgt : 0) + (this.pFrameDeco != null ? this.pFrameDeco.iBorderTop : Window.prototype.GetMarginTop.call(this)) | 0;
  }

  GetMarginLeft() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Dialog && Dialog.prototype instanceof $c) return $c.prototype.GetMarginLeft.apply(this, arguments); }
    return this.pFrameDeco != null ? this.pFrameDeco.iBorderLeft : Window.prototype.GetMarginLeft.call(this);
  }

  GetMarginRight() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Dialog && Dialog.prototype instanceof $c) return $c.prototype.GetMarginRight.apply(this, arguments); }
    return this.pFrameDeco != null ? this.pFrameDeco.iBorderRight : Window.prototype.GetMarginRight.call(this);
  }

  GetMarginBottom() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Dialog && Dialog.prototype instanceof $c) return $c.prototype.GetMarginBottom.apply(this, arguments); }
    return this.pFrameDeco != null ? this.pFrameDeco.iBorderBottom : Window.prototype.GetMarginBottom.call(this);
  }

  static GetDefaultTitleHeight() {
    return $min($.GraphicsResource.TextFont.GetLineHeight(), 23);
  }

  IsShown() {
    return this.fShow;
  }

  IsOK() {
    return this.fOK;
  }

  IsAborted() {
    return !this.fShow && !this.fOK;
  }

  IsActive$b(fForKeyboard) {
    if (!Dialog.prototype.IsShown.call(this) || this.IsFading()) {
      return false;
    }
    let pScreen = this.GetScreen();
    if (pScreen == null) {
      return false;
    }
    if (fForKeyboard && pScreen.HasContext()) {
      return false;
    }
    if (!pScreen.IsExclusive() && !fForKeyboard) {
      return true;
    }
    return pScreen.pActiveDlg === this;
  }

  IsFading() {
    return this.eFade !== 0;
  }

  IsFullscreenDialog() {
    return false;
  }

  HasBackground() {
    return false;
  }

  IsFreePlaceDialog() {
    return false;
  }

  IsBottomPlacementDialog() {
    return false;
  }

  IsExclusiveDialog() {
    return false;
  }

  IsMouseControlled() {
    return true;
  }

  GetViewport() {
    return null;
  }

  IsViewportDialog() {
    return this.fViewportDlg;
  }

  DoPlacement(_pOnScreen, _rPreferredDlgRect) {
    return false;
  }

  IsExternalDrawDialog() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Dialog && Dialog.prototype instanceof $c) return $c.prototype.IsExternalDrawDialog.apply(this, arguments); }
    return false;
  }

  GetZOrdering() {
    return 0;
  }

  Show(pOnScreen, fCB) {
    if (this.fShow) {
      return false;
    }
    if (pOnScreen == null) {
      if (!((pOnScreen = Screen.GetScreenS()) != null)) {
        return false;
      }
    }
    pOnScreen.ShowDialog(this, false);
    this.fVisible = true;
    if ($.Application.isEditor !== 0 && !this.IsViewportDialog()) {
      if (!this.CreateConsoleWindow()) {
        return false;
      }
    }
    if (fCB) {
      $spawn(this.OnShown$v());
    }
    return true;
  }

  Close$b(fOK) {
    if (!this.fShow) {
      return;
    }
    this.fOK = fOK;
    let pScreen = this.GetScreen();
    if (pScreen != null) {
      pScreen.CloseDialog(this, false);
    } else {
      this.fShow = false;
    }
    if (this.pWindow != null) {
      this.DestroyConsoleWindow();
    }
    this.OnClosed(fOK);
  }

  FadeIn(pOnScreen) {
    if (pOnScreen == null) {
      pOnScreen = Screen.GetScreenS();
    }
    pOnScreen.ShowDialog(this, true);
    this.iFade = 0;
    this.eFade = 2 /*eFadeIn*/;
    this.fVisible = true;
    $spawn(this.OnShown$v());
    return true;
  }

  FadeOut(fCloseWithOK) {
    if (!Dialog.prototype.IsShown.call(this) && (!this.fVisible || this.eFade !== 2)) {
      return;
    }
    this.fOK = fCloseWithOK;
    let pOnScreen = this.GetScreen();
    if (pOnScreen == null) {
      return;
    }
    pOnScreen.CloseDialog(this, true);
    this.eFade = 1 /*eFadeOut*/;
    this.OnClosed(fCloseWithOK);
  }

  *DoModal() {
    if ($.Application.IsQuittingGame()) {
      return false;
    }
    while (this.fShow) {
      this.OnIdle();
      let fGameWasRunning = $.Game.IsRunning;
      $.Game.IsRunning = false;
      if (!(yield, $.Application.ScheduleProcs())) {
        return false;
      }
      if (fGameWasRunning) {
        $.Game.IsRunning = true;
      }
    }
    return this.fOK;
  }

  Execute$v() {
    if (!$.Application.ScheduleProcs(0)) {
      return false;
    }
    if (!this.fShow) {
      return false;
    }
    return true;
  }

  Execute2() {
    if (Dialog.prototype.Execute$v.call(this)) {
      return true;
    }
    $delete(this);
    return false;
  }

  SetDelOnClose(fToVal = true) {
    this.fDelOnClose = fToVal;
  }

  SetTitle$pi8$b(szTitle, fShowCloseButton = true) {
    this.TitleString.Copy$pi8(szTitle);
    if ($.Application.isEditor !== 0 && !this.IsViewportDialog()) {
      if (this.pWindow != null) {
        this.pWindow.SetTitle(szTitle != null ? szTitle : S(""));
      }
      return;
    }
    if (szTitle != null && szTitle.a[szTitle.o] !== 0) {
      let iTextHgt = WoodenLabel.GetDefaultHeight$pCStdFont($.GraphicsResource.TextFont);
      if (this.pTitle != null) {
        this.pTitle.GetBounds().$assign(new $.C4Rect().init$i32$i32$i32$i32(-this.GetMarginLeft() | 0, -iTextHgt | 0, this.rcBounds.Wdt, iTextHgt));
        if ($.SEqual(this.pTitle.GetText$v(), szTitle)) {
          return;
        }
        this.pTitle.SetText$pi8$b(szTitle);
      } else {
        Container.prototype.AddElement$pElement.call(this, this.pTitle = new WoodenLabel().init(szTitle, new $.C4Rect().init$i32$i32$i32$i32(-this.GetMarginLeft() | 0, -iTextHgt | 0, this.rcBounds.Wdt, iTextHgt), 0xffffffff, $.GraphicsResource.TextFont, 0, false));
      }
      this.pTitle.SetToolTip(szTitle);
      this.pTitle.SetDragTarget(this);
      this.pTitle.SetAutoScrollTime(3000);
      if (fShowCloseButton) {
        this.pTitle.SetRightIndent(20);
        if (this.pCloseBtn == null) {
          Container.prototype.AddElement$pElement.call(this, this.pCloseBtn = new CallbackButton$Dialog$IconButton().init$i32$C4Rect$i8$x$pDialog(34 /*Ico_Close*/, this.pTitle.GetToprightCornerRect(16, 16, 4, 4, 0), 0, "OnUserClose$pControl"));
          this.pCloseBtn.SetToolTip($.LoadResStr(S("IDS_MNU_CLOSE")));
        } else {
          this.pCloseBtn.GetBounds().$assign(this.pTitle.GetToprightCornerRect(16, 16, 4, 4, 0));
        }
      }
    } else {
      if (this.pTitle != null) {
        $delete(this.pTitle);
        this.pTitle = null;
      }
      if (this.pCloseBtn != null) {
        $delete(this.pCloseBtn);
        this.pCloseBtn = null;
      }
    }
  }

  SetFrameDeco(pNewDeco) {
    if (this.pFrameDeco != null) {
      this.pFrameDeco.Deref();
    }
    if ((this.pFrameDeco = pNewDeco) != null) {
      pNewDeco.Ref();
    }
    this.UpdateOwnPos();
  }

  ClearFrameDeco() {
    if (this.pFrameDeco != null) {
      this.pFrameDeco.Deref();
    }
    this.pFrameDeco = null;
  }

  GetFrameDecoration() {
    return this.pFrameDeco;
  }

  SetClientSize(iToWdt, iToHgt) {
    iToWdt = iToWdt + (this.GetMarginLeft() + this.GetMarginRight() | 0) | 0;
    iToHgt = iToHgt + (this.GetMarginTop() + this.GetMarginBottom() | 0) | 0;
    this.rcBounds.x = this.rcBounds.x + ((this.rcBounds.Wdt - iToWdt | 0) / 2 | 0) | 0;
    this.rcBounds.y = this.rcBounds.y + ((this.rcBounds.Hgt - iToHgt | 0) / 2 | 0) | 0;
    this.rcBounds.Wdt = iToWdt;
    this.rcBounds.Hgt = iToHgt;
    this.UpdatePos();
  }

  OnUserClose$pControl(_btn) {
    $spawn(this.UserClose$b(false));
  }

  UserClose$b(fOK) {
    this.Close$b(fOK);
  }

  OnClosed(_fOK) {
    if (this.pWindow != null) {
      this.DestroyConsoleWindow();
    }
    if (this.fDelOnClose) {
      this.fDelOnClose = false;
      $delete(this);
    }
  }

  OnShown$v() {
  }

  OnIdle() {
  }

  GetContextHandler() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Dialog && Dialog.prototype instanceof $c) return $c.prototype.GetContextHandler.apply(this, arguments); }
    return this.pContextHandler;
  }

  $clone() { return new Dialog().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pKeyAdvanceControl = o.pKeyAdvanceControl;
    this.pKeyAdvanceControlB = o.pKeyAdvanceControlB;
    this.pKeyHotkey = o.pKeyHotkey;
    this.pKeyEnter = o.pKeyEnter;
    this.pKeyEscape = o.pKeyEscape;
    this.pKeyFocusDefControl = o.pKeyFocusDefControl;
    this.pTitle = o.pTitle;
    this.pCloseBtn = o.pCloseBtn;
    this.pActiveCtrl = o.pActiveCtrl;
    this.fShow = o.fShow;
    this.fOK = o.fOK;
    this.iFade = o.iFade;
    this.eFade = o.eFade;
    this.fDelOnClose = o.fDelOnClose;
    this.TitleString.$assign(o.TitleString);
    this.fViewportDlg = o.fViewportDlg;
    this.pWindow = o.pWindow;
    this.pFrameDeco = o.pFrameDeco;
    return this;
  }
}

export class Screen extends Window {
  static pScreen;
  Mouse = new CMouse();
  pActiveDlg = null;
  pContext = null;
  fExclusive = true;
  PreferredDlgRect = new $.C4Rect();
  fZoom = 1;

  RemoveElement(pChild) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Screen && Screen.prototype instanceof $c) return $c.prototype.RemoveElement.apply(this, arguments); }
    Container.prototype.RemoveElement.call(this, pChild);
    if (this.pActiveDlg === pChild) {
      this.pActiveDlg = null;
      this.Mouse.ResetElements();
    }
    this.Mouse.RemoveElement(pChild);
    if (this.pContext != null) {
      if (this.pContext === pChild) {
        this.pContext = null;
      } else {
        this.pContext.RemoveElement(pChild);
      }
    }
  }

  GetPreferredDlgRect() {
    return this.PreferredDlgRect;
  }

  Draw$rC4TargetFacet$b(cgo, fDoBG) {
    if (fDoBG) {
      let pFSDlg = this.GetFullscreenDialog(false);
      if (pFSDlg == null || !pFSDlg.HasBackground()) {
        if ($.GraphicsSystem.pLoaderScreen != null) {
          $.GraphicsSystem.pLoaderScreen.Draw(cgo, 1 /*BACKGROUND*/);
        } else {
          $.pDraw.DrawBoxDw(cgo.Surface, 0, 0, ftoi32(Math.fround(cgo.Wdt + Math.fround(1))), ftoi32(Math.fround(cgo.Hgt + Math.fround(1))), 0);
        }
      }
    }
    if (this.IsVisible() && $.GraphicsResource.IsInitialized()) {
      Window.prototype.Draw$rC4TargetFacet.call(this, cgo);
      if (this.pContext != null) {
        this.pContext.Draw$rC4TargetFacet(cgo);
      }
    }
    if ($.Application.isEditor === 0) {
      this.RenderMouse(cgo);
    }
  }

  ElementPosChanged(_pOfElement) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Screen && Screen.prototype instanceof $c) return $c.prototype.ElementPosChanged.apply(this, arguments); }
    if (!this.IsExclusive()) {
      $.GraphicsSystem.InvalidateBg();
    }
  }

  ShowDialog(pDlg, fFade) {
    0;
    if ($.Application.isEditor === 0 || pDlg.IsViewportDialog()) {
      if (!pDlg.DoPlacement(this, this.PreferredDlgRect)) {
        if (pDlg.IsFreePlaceDialog()) {
          pDlg.SetPos((this.GetWidth() - pDlg.GetWidth() | 0) / 2 | 0, ((this.GetHeight() - pDlg.GetHeight() | 0) / 2 | 0) + (Math.imul(pDlg.IsBottomPlacementDialog() ? 1 : 0, this.GetHeight()) / 3 | 0) | 0);
        } else if (this.IsExclusive()) {
          pDlg.SetPos((this.GetWidth() - pDlg.GetWidth() | 0) / 2 | 0, (this.GetHeight() - pDlg.GetHeight() | 0) / 2 | 0);
        } else {
          pDlg.SetPos(this.PreferredDlgRect.x + 30 | 0, this.PreferredDlgRect.y + 30 | 0);
        }
      }
    }
    let iNewZ = pDlg.GetZOrdering();
    let pEl = null;
    let pOtherDlg = null;
    for (pEl = Container.prototype.GetFirst.call(this); pEl != null; pEl = Element.prototype.GetNext$v$c.call(pEl)) {
      if ((pOtherDlg = pEl.GetDlg()) != null) {
        if (pOtherDlg.GetZOrdering() > iNewZ) {
          break;
        }
      }
    }
    Container.prototype.InsertElement$pElement$pElement.call(this, pDlg, pEl);
    if (!fFade && pEl == null) {
      if (!pDlg.IsExternalDrawDialog()) {
        this.pActiveDlg = pDlg;
      }
    }
    pDlg.fOK = false;
    pDlg.fShow = true;
    this.UpdateMouseFocus();
  }

  CloseDialog(pDlg, fFade) {
    if (!fFade) {
      pDlg.fShow = false;
    }
    if (this.pActiveDlg === pDlg) {
      this.Mouse.ReleaseElements();
      this.AbortContext(false);
      this.pActiveDlg = this.GetTopDialog();
      if (this.pActiveDlg != null && this.pActiveDlg.IsFading()) {
        this.pActiveDlg = null;
      }
    }
    $.GraphicsSystem.InvalidateBg();
    this.UpdateMouseFocus();
  }

  ActivateDialog(pDlg) {
    if (this.pActiveDlg === pDlg) {
      return;
    }
    if (this.IsExclusive()) {
      this.Mouse.ReleaseElements();
    }
    this.AbortContext(false);
    this.pActiveDlg = pDlg;
    if (!(pDlg.GetZOrdering() !== 0) && Element.prototype.GetNext$v$c.call(pDlg) != null) {
      this.MakeLastElement(pDlg);
    }
  }

  RecheckActiveDialog() {
    let pNewTop = this.GetTopDialog();
    if (this.pActiveDlg === pNewTop) {
      return;
    }
    this.Mouse.ReleaseElements();
    if (this.pActiveDlg != null && this.pActiveDlg.IsFading()) {
      this.pActiveDlg = null;
    }
  }

  GetTopDialog() {
    let pDlg = null;
    for (let pEl = this.pLast; pEl != null; pEl = pEl.GetPrev()) {
      if ((pDlg = pEl.GetDlg()) != null) {
        if (Dialog.prototype.IsShown.call(pDlg)) {
          return pDlg;
        }
      }
    }
    return null;
  }

  init() {
    super.init();
    this.Mouse = new CMouse().init(0, 0);
    this.pContext = null;
    this.fExclusive = true;
    this.PreferredDlgRect = new $.C4Rect();
    this.fZoom = 1;
    this.$dyn = Screen;
    this.pActiveDlg = null;
    Screen.pScreen = this;
    return this;
  }

  $dtor() {
    if (this === Screen.pScreen) {
      Screen.pScreen = null;
    }
    super.$dtor();
  }

  Init$i32$i32$i32$i32(tx, ty, twdt, thgt) {
    this.Mouse.x = tx + (twdt / 2 | 0) | 0;
    this.Mouse.y = ty + (thgt / 2 | 0) | 0;
    this.fZoom = 1;
    this.SetBounds(new $.C4Rect().init$i32$i32$i32$i32(tx, ty, twdt, thgt));
    this.SetPreferredDlgRect(new $.C4Rect().init$i32$i32$i32$i32(0, 0, twdt, thgt));
  }

  Clear$v() {
    Container.prototype.Clear$v.call(this);
    this.AbortContext(false);
    this.fExclusive = true;
    this.fZoom = 1;
  }

  Render(fDoBG) {
    let cgo = new $.C4TargetFacet().init();
    cgo.Set$pC4Surface$C4Rect$f32$f32$f32($.FullScreen.pSurface, this.rcBounds);
    this.Draw$rC4TargetFacet$b(cgo, fDoBG);
  }

  RenderMouse(cgo) {
    this.Mouse.Draw(cgo, this.Mouse.IsActiveInput() ? this.Mouse.IsMouseStill() ? 2 /*TTST_All*/ : 1 /*TTST_Immediate*/ : 0 /*TTST_None*/);
  }

  GetScreen() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Screen && Screen.prototype instanceof $c) return $c.prototype.GetScreen.apply(this, arguments); }
    return this;
  }

  static GetScreenS() {
    return Screen.pScreen;
  }

  GetZoom() {
    return this.fZoom;
  }

  IsActive$v() {
    return !!(this.GetTopDialog() != null);
  }

  KeyAny() {
    this.Mouse.ResetActiveInput();
    return false;
  }

  CharIn(c) {
    if (c.a[c.o + 0] === 9) {
      return false;
    }
    this.Mouse.ResetActiveInput();
    if (!this.HasKeyboardFocus()) {
      return false;
    }
    let fResult = this.IsExclusive();
    if (this.pContext != null) {
      return this.pContext.CharIn(c) || fResult;
    }
    if (this.pActiveDlg == null || !this.pActiveDlg.IsVisible()) {
      return fResult;
    }
    return this.pActiveDlg.CharIn(c) || fResult;
  }

  MouseInput$i32$i32$i32$u32$pDialog$pC4Viewport(iButton, iPxX, iPxY, dwKeyParam, pForDlg, pForVP) {
    let fZoom = pForDlg != null ? 1 : this.GetZoom();
    let fX = Math.fround(Math.fround(iPxX) / fZoom);
    let fY = Math.fround(Math.fround(iPxY) / fZoom);
    this.Mouse.Input(iButton, ftoi32(fX), ftoi32(fY), dwKeyParam);
    if (this.Mouse.pDragElement != null) {
      const iX2 = [ftoi32(fX)];
      const iY2 = [ftoi32(fY)];
      this.Mouse.pDragElement.ScreenPos2ClientPos(P(iX2, 0), P(iY2, 0));
      if (!this.Mouse.IsLDown()) {
        this.Mouse.pDragElement.StopDragging(this.Mouse, iX2[0], iY2[0], dwKeyParam);
        this.Mouse.pDragElement = null;
      } else {
        this.Mouse.pDragElement.DoDragging(this.Mouse, iX2[0], iY2[0], dwKeyParam);
      }
    }
    this.Mouse.pPrevMouseOverElement = this.Mouse.pMouseOverElement;
    this.Mouse.pMouseOverElement = null;
    let fProcessed = false;
    if (pForVP == null && this.pContext != null && this.pContext.CtxMouseInput(this.Mouse, iButton, ftoi32(fX), ftoi32(fY), dwKeyParam)) {
    } else if (this.rcBounds.Contains$i32$i32(ftoi32(fX), ftoi32(fY)) || pForDlg != null || pForVP != null) {
      if (this.pContext != null && (iButton === 1 || iButton === 3)) {
        this.AbortContext(true);
      }
      if (pForDlg == null && pForVP == null) {
        const rcClientArea = this.GetClientRect();
        fX = Math.fround(fX - Math.fround(rcClientArea.x));
        fY = Math.fround(fY - Math.fround(rcClientArea.y));
      }
      if (this.IsExclusive() && pForDlg == null && pForVP == null) {
        if (this.pActiveDlg != null && this.pActiveDlg.IsVisible() && !this.pActiveDlg.IsFading()) {
          const rcDlgBounds = this.pActiveDlg.GetBounds();
          if (this.Mouse.IsLDown() || rcDlgBounds.Contains$i32$i32(ftoi32(fX), ftoi32(fY))) {
            this.pActiveDlg.MouseInput$rCMouse$i32$i32$i32$u32(this.Mouse, iButton, ftoi32(Math.fround(fX - Math.fround(rcDlgBounds.x))), ftoi32(Math.fround(fY - Math.fround(rcDlgBounds.y))), dwKeyParam);
          } else {
            this.Mouse.pMouseOverElement = null;
          }
        } else {
          Window.prototype.MouseInput$rCMouse$i32$i32$i32$u32.call(this, this.Mouse, iButton, ftoi32(fX), ftoi32(fY), dwKeyParam);
        }
      } else {
        let pDlg = null;
        for (let pEl = this.pLast; pEl != null; pEl = pEl.GetPrev()) {
          if ((pDlg = pEl.GetDlg()) != null) {
            if (Dialog.prototype.IsShown.call(pDlg)) {
              if (pForDlg != null && pDlg !== pForDlg) {
                continue;
              }
              let fIsExternalDrawDialog = pDlg.IsExternalDrawDialog();
              let pVP = fIsExternalDrawDialog ? pDlg.GetViewport() : null;
              if (pForVP != null && pForVP !== pVP) {
                continue;
              }
              const rcDlgBounds = pDlg.GetBounds();
              let iOffX = 0;
              let iOffY = 0;
              if (fIsExternalDrawDialog) {
                if (pVP == null) {
                  continue;
                }
                let rcOut = pVP.GetOutputRect();
                if (!rcOut.Contains$i32$i32(ftoi32(Math.fround(fX + Math.fround(this.rcBounds.x))), ftoi32(Math.fround(fY + Math.fround(this.rcBounds.y))))) {
                  continue;
                }
                iOffX = rcOut.x;
                iOffY = rcOut.y;
              }
              if (rcDlgBounds.Contains$i32$i32(ftoi32(Math.fround(fX - Math.fround(iOffX))), ftoi32(Math.fround(fY - Math.fround(iOffY)))) || pDlg === this.pActiveDlg && this.Mouse.pDragElement != null && this.Mouse.pDragElement.GetDlg() === pDlg) {
                pDlg.MouseInput$rCMouse$i32$i32$i32$u32(this.Mouse, iButton, ftoi32(Math.fround(Math.fround(fX - Math.fround(rcDlgBounds.x)) - Math.fround(iOffX))), ftoi32(Math.fround(Math.fround(fY - Math.fround(rcDlgBounds.y)) - Math.fround(iOffY))), dwKeyParam);
                fProcessed = true;
                if (this.Mouse.IsLDown() && pDlg !== this.pActiveDlg) {
                  if (!pDlg.IsExternalDrawDialog()) {
                    this.ActivateDialog(pDlg);
                  }
                }
                break;
              }
            }
          }
        }
      }
    }
    if (this.Mouse.pPrevMouseOverElement !== this.Mouse.pMouseOverElement) {
      if (this.Mouse.pPrevMouseOverElement != null) {
        this.Mouse.pPrevMouseOverElement.MouseLeave(this.Mouse);
      }
      if (this.Mouse.pMouseOverElement != null) {
        this.Mouse.pMouseOverElement.MouseEnter(this.Mouse);
      }
    }
    return fProcessed || this.Mouse.pDragElement != null || this.Mouse.pMouseOverElement != null && this.Mouse.pMouseOverElement !== this || this.pContext != null;
  }

  MouseMove(iButton, iX, iY, dwKeyParam, pVP) {
    if (this.IsActive$v() && !$.MouseControl.IsDragging()) {
      let fResult = this.MouseInput$i32$i32$i32$u32$pDialog$pC4Viewport(iButton, iX, iY, dwKeyParam, null, pVP);
      if (this.HasMouseFocus()) {
        this.SetMouseInGUI(true, true);
        return;
      }
      this.SetMouseInGUI(fResult, true);
      if (fResult) {
        return;
      }
    } else {
      this.SetMouseInGUI(false, true);
    }
    if (!$.MouseControl.IsActive()) {
      if (this.GetMouseControlledDialogCount() !== 0) {
        this.SetMouseInGUI(true, true);
      }
      return;
    }
    $.Viewports.MouseMoveToViewport(iButton, iX, iY, dwKeyParam);
  }

  SetMouseInGUI(fInGUI, fByMouse) {
    this.Mouse.SetOwnedMouse(fInGUI);
    if (!$.MouseControl.IsMouseOwned() && !fInGUI && !fByMouse) {
      $.MouseControl.SetOwnedMouse(true);
      $.Viewports.MouseMoveToViewport(0, ftoi32(Math.fround(Math.fround($.pGUI.Mouse.x) * GetZoom())), ftoi32(Math.fround(Math.fround($.pGUI.Mouse.y) * GetZoom())), $.pGUI.Mouse.dwKeys);
    }
    $.MouseControl.SetOwnedMouse(!fInGUI);
  }

  RecheckMouseInput() {
    return this.MouseInput$i32$i32$i32$u32$pDialog$pC4Viewport(0, this.Mouse.x, this.Mouse.y, this.Mouse.dwKeys, null, null);
  }

  ShowMessage(szMessage, szCaption, icoIcon, piConfigDontShowAgainSetting = null) {
    $.LogSilentF(S("[Msg] %s: %s"), szCaption, szMessage);
    if (piConfigDontShowAgainSetting != null && piConfigDontShowAgainSetting.a[piConfigDontShowAgainSetting.o] !== 0) {
      return true;
    }
    return this.ShowRemoveDlg(new MessageDialog().init(szMessage, szCaption, 1, icoIcon, 500 /*dsRegular*/, piConfigDontShowAgainSetting));
  }

  ShowErrorMessage(szMessage) {
    return this.ShowMessage(szMessage, $.LoadResStr(S("IDS_DLG_ERROR")), 11 /*Ico_Error*/);
  }

  *ShowMessageModal(szMessage, szCaption, dwButtons, icoIcon, piConfigDontShowAgainSetting = null) {
    $.LogSilentF(S("[Modal] %s: %s"), szCaption, szMessage);
    if (piConfigDontShowAgainSetting != null && piConfigDontShowAgainSetting.a[piConfigDontShowAgainSetting.o] !== 0) {
      return true;
    }
    return (yield* this.ShowModalDlg(new MessageDialog().init(szMessage, szCaption, dwButtons, icoIcon, 500 /*dsRegular*/, piConfigDontShowAgainSetting)));
  }

  ShowProgressDlg(szMessage, szCaption, iMaxProgress = 100, iInitialProgress = 0, icoIcon = 2 /*Ico_Wait*/) {
    let pDlg = new ProgressDialog().init(szMessage, szCaption, iMaxProgress, iInitialProgress, icoIcon);
    if (!pDlg.Show(this, true)) {
      $delete(pDlg);
      return null;
    }
    return pDlg;
  }

  *ShowModalDlg(pDlg, fDestruct = true) {
    if (pDlg == null) {
      return false;
    }
    if (!pDlg.Show(this, true)) {
      $delete(pDlg);
      return false;
    }
    let fResult = (yield* pDlg.DoModal());
    if (fDestruct) {
      $delete(pDlg);
    }
    return fResult;
  }

  ShowRemoveDlg(pDlg) {
    if (pDlg == null) {
      return false;
    }
    pDlg.SetDelOnClose();
    if (!pDlg.Show(this, true)) {
      $delete(pDlg);
      return false;
    }
    return true;
  }

  CloseAllDialogs(fWithOK) {
    while (this.pActiveDlg != null) {
      this.pActiveDlg.Close$b(fWithOK);
    }
  }

  SetPreferredDlgRect(rtNewPref) {
    this.PreferredDlgRect.$assign(rtNewPref);
  }

  GetDialog(pWindow) {
    let pDlg = null;
    for (let pEl = this.pLast; pEl != null; pEl = pEl.GetPrev()) {
      if ((pDlg = pEl.GetDlg()) != null) {
        if (pDlg.pWindow === pWindow) {
          return pDlg;
        }
      }
    }
    return null;
  }

  DoContext$pContextMenu$pElement$i32$i32(pNewCtx, pAtElement, iX$, iY$) {
    const iX = [iX$];
    const iY = [iY$];
    0;
    0;
    this.AbortContext(false);
    if (pAtElement != null) {
      pAtElement.ClientPos2ScreenPos(P(iX, 0), P(iY, 0));
    }
    if ((iY[0] + pNewCtx.GetBounds().Hgt | 0) >= this.GetBounds().Hgt) {
      if (iY[0] < pNewCtx.GetBounds().Hgt) {
        iY[0] = this.GetBounds().Hgt;
      }
      iY[0] = iY[0] - pNewCtx.GetBounds().Hgt | 0;
    }
    if ((iX[0] + pNewCtx.GetBounds().Wdt | 0) >= this.GetBounds().Wdt) {
      if (iX[0] < pNewCtx.GetBounds().Wdt) {
        iX[0] = this.GetBounds().Wdt;
      }
      iX[0] = iX[0] - pNewCtx.GetBounds().Wdt | 0;
    }
    (this.pContext = pNewCtx).Open(pAtElement, iX[0], iY[0]);
  }

  AbortContext(fByUser) {
    if (this.pContext != null) {
      this.pContext.Abort$b(fByUser);
    }
  }

  GetContextMenuIndex() {
    return this.pContext != null ? this.pContext.GetMenuIndex() : 0;
  }

  GetLastContextMenuIndex() {
    return ContextMenu.GetLastMenuIndex();
  }

  HasContext() {
    return !(this.pContext == null);
  }

  HasFullscreenDialog(fIncludeFading) {
    return !!(this.GetFullscreenDialog(fIncludeFading) != null);
  }

  GetFullscreenDialog(fIncludeFading) {
    let pDlg = null;
    for (let pEl = Container.prototype.GetFirst.call(this); pEl != null; pEl = Element.prototype.GetNext$v$c.call(pEl)) {
      if ((pDlg = pEl.GetDlg()) != null) {
        if (pDlg.IsVisible()) {
          if (pDlg.IsFullscreenDialog()) {
            if (fIncludeFading || !pDlg.IsFading()) {
              return pDlg;
            }
          }
        }
      }
    }
    return null;
  }

  SetExclusive(fToState) {
    this.fExclusive = fToState;
    this.Mouse.SetOwnedMouse(this.fExclusive);
    this.UpdateMouseFocus();
  }

  IsExclusive() {
    return this.fExclusive;
  }

  HasKeyboardFocus() {
    if (this.IsExclusive()) {
      return true;
    }
    let pDlg = this.GetTopDialog();
    return pDlg != null && pDlg.IsExclusiveDialog();
  }

  HasMouseFocus() {
    return this.HasKeyboardFocus();
  }

  GetMouseControlledDialogCount() {
    let pDlg = null;
    let iResult = 0;
    for (let pEl = Container.prototype.GetFirst.call(this); pEl != null; pEl = Element.prototype.GetNext$v$c.call(pEl)) {
      if ((pDlg = pEl.GetDlg()) != null) {
        if (Dialog.prototype.IsShown.call(pDlg) && pDlg.IsMouseControlled()) {
          iResult = iResult + 1 | 0;
        }
      }
    }
    return iResult;
  }

  UpdateMouseFocus() {
    $.MouseControl.UpdateClip();
  }

  static DrawToolTip(szTip, cgo, x, y) {
    let pUseFont = $.GraphicsResource.TooltipFont;
    let sText = new $.StdStrBuf();
    pUseFont.BreakMessage$pi8$i32$pStdStrBuf$b$f32(szTip, $min(500, $max(ftoi32(cgo.Wdt), 50)), sText, true);
    const tWdt = [0];
    const tHgt = [0];
    if (pUseFont.GetTextExtent(sText.getData(), P(tWdt, 0), P(tHgt, 0), true)) {
      tWdt[0] = tWdt[0] + 6 | 0;
      tHgt[0] = tHgt[0] + 4 | 0;
      let tX = 0;
      let tY = 0;
      if (y < Math.fround(Math.fround(Math.fround(cgo.Y + cgo.TargetY) + Math.fround(tHgt[0])) + Math.fround(5))) {
        tY = $min(ftoi32(Math.fround(y + Math.fround(5))), ftoi32(Math.fround(Math.fround(cgo.TargetY + cgo.Hgt) - Math.fround(tHgt[0]))));
      } else {
        tY = ftoi32(Math.fround(Math.fround(y - Math.fround(tHgt[0])) - Math.fround(5)));
      }
      tX = $.Clamp$i32$i32$i32(ftoi32(Math.fround(x - Math.fround(tWdt[0] / 2 | 0))), ftoi32(Math.fround(cgo.TargetX + cgo.X)), ftoi32(Math.fround(Math.fround(cgo.TargetX + cgo.Wdt) - Math.fround(tWdt[0]))));
      $.pDraw.DrawBoxDw(cgo.Surface, tX, tY, (tX + tWdt[0] | 0) - 1 | 0, (tY + tHgt[0] | 0) - 2 | 0, 0xfff1ea78);
      $.pDraw.DrawFrameDw(cgo.Surface, tX, tY, (tX + tWdt[0] | 0) - 1 | 0, (tY + tHgt[0] | 0) - 1 | 0, 0x7f000000);
      $.pDraw.TextOut(sText.getData(), pUseFont, 1, cgo.Surface, Math.fround(tX + 3 | 0), Math.fround(tY + 1 | 0), 0xff483222, 0);
      $.GraphicsSystem.InvalidateBg();
    }
  }

  UpdateGamepadGUIControlEnabled() {
  }

  $clone() { return new Screen().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Mouse.$assign(o.Mouse);
    this.pActiveDlg = o.pActiveDlg;
    this.pContext = o.pContext;
    this.fExclusive = o.fExclusive;
    this.PreferredDlgRect.$assign(o.PreferredDlgRect);
    this.fZoom = o.fZoom;
    return this;
  }
}

export class Button extends Control {
  pKeyButton = null;
  pCustomGfx = null;
  pCustomGfxDown = null;
  sText = new $.StdStrBuf();
  pCustomFont = null;
  dwCustomFontClr = 0;
  fDown = false;
  fMouseOver = false;
  cHotkey = 0;
  fEnabled = false;

  IsFocusOnClick() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Button && Button.prototype instanceof $c) return $c.prototype.IsFocusOnClick.apply(this, arguments); }
    return false;
  }

  DrawElement(cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Button && Button.prototype instanceof $c) return $c.prototype.DrawElement.apply(this, arguments); }
    if (this.fDown) {
      this.DrawBar(cgo, this.pCustomGfxDown != null ? this.pCustomGfxDown : $.GraphicsResource.barButtonD);
    } else {
      this.DrawBar(cgo, this.pCustomGfx != null ? this.pCustomGfx : $.GraphicsResource.barButton);
    }
    let x0 = ftoi32(Math.fround(cgo.TargetX + Math.fround(this.rcBounds.x)));
    let y0 = ftoi32(Math.fround(cgo.TargetY + Math.fround(this.rcBounds.y)));
    let x1 = ftoi32(Math.fround(Math.fround(Math.fround(cgo.TargetX + Math.fround(this.rcBounds.x)) + Math.fround(this.rcBounds.Wdt)) - Math.fround(1)));
    let y1 = ftoi32(Math.fround(Math.fround(Math.fround(cgo.TargetY + Math.fround(this.rcBounds.y)) + Math.fround(this.rcBounds.Hgt)) - Math.fround(1)));
    let iTxtOff = this.fDown ? 1 : 0;
    if (this.fEnabled) {
      if (this.HasDrawFocus() || this.fMouseOver && this.IsInActiveDlg(false)) {
        $.pDraw.SetBlitMode(1);
        $.GraphicsResource.fctButtonHighlight.DrawX(cgo.Surface, Math.fround(x0 + 5 | 0), Math.fround(y0 + 3 | 0), Math.fround(this.rcBounds.Wdt - 10 | 0), Math.fround(this.rcBounds.Hgt - 6 | 0));
        $.pDraw.ResetBlitMode();
      }
    }
    let iTextHgt = this.rcBounds.Hgt - 2 | 0;
    const rUseFont = $.GraphicsResource.TitleFont.GetLineHeight() > iTextHgt ? $.GraphicsResource.CaptionFont.GetLineHeight() > iTextHgt ? $.GraphicsResource.TextFont : $.GraphicsResource.CaptionFont : $.GraphicsResource.TitleFont;
    iTextHgt = rUseFont.GetLineHeight();
    $.pDraw.TextOut(this.sText.getData(), rUseFont, 1, cgo.Surface, Math.fround(((x0 + x1 | 0) / 2 | 0) + iTxtOff | 0), Math.fround((((y0 + y1 | 0) - iTextHgt | 0) / 2 | 0) + iTxtOff | 0), 0xffffff00, 1, true);
  }

  OnPress() {
  }

  KeyButtonDown() {
    if (!this.fEnabled) {
      return false;
    }
    this.SetDown();
    return true;
  }

  KeyButtonUp() {
    if (!this.fDown) {
      return false;
    }
    this.SetUp(true);
    if (this.fEnabled) {
      this.OnPress();
    }
    return true;
  }

  SetDown() {
    if (this.fDown) {
      return;
    }
    GUISound(S("UI::Tick"));
    this.fDown = true;
  }

  SetUp(fPress) {
    if (!this.fDown) {
      return;
    }
    GUISound(fPress ? S("UI::Click") : S("UI::Tick"));
    this.fDown = false;
  }

  OnHotkey(cHotkey) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Button && Button.prototype instanceof $c) return $c.prototype.OnHotkey.apply(this, arguments); }
    if (this.cHotkey === cHotkey && this.fEnabled) {
      this.OnPress();
      return true;
    } else {
      return false;
    }
  }

  init(szBtnText, rtBounds) {
    super.init(rtBounds);
    this.pCustomGfx = null;
    this.pCustomGfxDown = null;
    this.sText = new $.StdStrBuf();
    this.pCustomFont = null;
    this.dwCustomFontClr = 0;
    this.fDown = false;
    this.fMouseOver = false;
    this.fEnabled = true;
    this.$dyn = Button;
    let keys = [];
    $vpush(keys, new $.C4KeyCodeEx().init(57));
    $vpush(keys, new $.C4KeyCodeEx().init(28));
    if ($.Config.Controls.GamepadGuiControl !== 0) {
      $.Ok(keys);
    }
    this.pKeyButton = new $.C4KeyBinding().init$vector$pi8$i32$pC4KeyboardCallbackInterface$u32(keys, S("GUIButtonPress"), 2 /*KEYSCOPE_Gui*/, new ControlKeyCB$Button().init(this, "KeyButtonDown", "KeyButtonUp"), 3);
    $.StdStrBuf.prototype.op_assign$pi8.call(this.sText, S(""));
    Button.prototype.SetText$pi8.call(this, szBtnText);
    return this;
  }

  $dtor() {
    $delete(this.pKeyButton);
    super.$dtor();
  }

  MouseInput$rCMouse$i32$i32$i32$u32(rMouse, iButton, iX, iY, dwKeyParam) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Button && Button.prototype instanceof $c) return $c.prototype.MouseInput$rCMouse$i32$i32$i32$u32.apply(this, arguments); }
    Control.prototype.MouseInput$rCMouse$i32$i32$i32$u32.call(this, rMouse, iButton, iX, iY, dwKeyParam);
    if (this.fEnabled) {
      switch (iButton) {
        case 1:
          this.SetDown();
          if (rMouse.pDragElement == null) {
            rMouse.pDragElement = this;
          }
          break;
        case 2:
          if (this.fDown) {
            this.SetUp(true);
            this.OnPress();
          }
          break;
      }
    }
    ;
  }

  MouseEnter(rMouse) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Button && Button.prototype instanceof $c) return $c.prototype.MouseEnter.apply(this, arguments); }
    Element.prototype.MouseEnter.call(this, rMouse);
    this.fMouseOver = true;
    if (rMouse.pDragElement === this) {
      if (this.fEnabled) {
        this.SetDown();
      }
    }
  }

  MouseLeave(rMouse) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Button && Button.prototype instanceof $c) return $c.prototype.MouseLeave.apply(this, arguments); }
    Element.prototype.MouseLeave.call(this, rMouse);
    this.fMouseOver = false;
    if (rMouse.pDragElement === this) {
      if (this.fEnabled) {
        this.SetUp(false);
      }
    }
  }

  SetText$pi8(szToText) {
    if (szToText != null) {
      this.sText.Copy$pi8(szToText);
      ExpandHotkeyMarkup(this.sText, P(this, "cHotkey"));
    } else {
      $.StdStrBuf.prototype.op_assign$pi8.call(this.sText, S(""));
      this.cHotkey = 0;
    }
  }

  SetCustomGraphics(pCustomGfx, pCustomGfxDown) {
    this.pCustomGfx = pCustomGfx;
    this.pCustomGfxDown = pCustomGfxDown;
  }

  SetEnabled(fToVal) {
    this.fEnabled = fToVal;
    if (!this.fEnabled) {
      this.fDown = false;
    }
  }

  SetFont$pCStdFont$u32(pFont, dwCustomFontClr = 0xffffffff) {
    this.pCustomFont = pFont;
    this.dwCustomFontClr = dwCustomFontClr;
  }

  $clone() { return new Button().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pKeyButton = o.pKeyButton;
    this.pCustomGfx = o.pCustomGfx;
    this.pCustomGfxDown = o.pCustomGfxDown;
    this.sText.$assign(o.sText);
    this.pCustomFont = o.pCustomFont;
    this.dwCustomFontClr = o.dwCustomFontClr;
    this.fDown = o.fDown;
    this.fMouseOver = o.fMouseOver;
    this.cHotkey = o.cHotkey;
    this.fEnabled = o.fEnabled;
    return this;
  }
}

export class Edit extends Control {
  static CursorRepresentation;
  pKeyCursorBack = null;
  pKeyCursorDel = null;
  pKeyCursorLeft = null;
  pKeyCursorRight = null;
  pKeyCursorHome = null;
  pKeyCursorEnd = null;
  pKeyEnter = null;
  pKeyCopy = null;
  pKeyPaste = null;
  pKeyCut = null;
  pKeySelAll = null;
  pFont = null;
  Text = null;
  dwBGClr = 0;
  dwFontClr = 0;
  dwBorderColor = 0;
  iBufferSize = 0;
  iCursorPos = 0;
  iSelectionStart = 0;
  iSelectionEnd = 0;
  iMaxTextLength = 0;
  tLastInputTime = new $.C4TimeMilliseconds();
  iXScroll = 0;
  cPasswordMask = 0;
  fLeftBtnDown = false;

  init(rtBounds, fFocusEdit = false) {
    super.init(rtBounds);
    this.iCursorPos = 0;
    this.iSelectionStart = 0;
    this.iSelectionEnd = 0;
    this.tLastInputTime = new $.C4TimeMilliseconds();
    this.fLeftBtnDown = false;
    this.$dyn = Edit;
    this.Text = P(new Int8Array(256), 0);
    this.iBufferSize = 256;
    this.Text.a[this.Text.o] = 0;
    this.iMaxTextLength = 255;
    this.iCursorPos = this.iSelectionStart = this.iSelectionEnd = 0;
    this.iXScroll = 0;
    this.pFont = $.GraphicsResource.TextFont;
    this.dwBGClr = 0x7f000000;
    this.dwFontClr = 0xffffffff;
    this.dwBorderColor = 0;
    this.cPasswordMask = 0;
    this.UpdateOwnPos();
    this.SetContextHandler(new CBContextHandler$Edit().init(this, "OnContext"));
    let eKeyPrio = fFocusEdit ? 5 /*PRIO_FocusCtrl*/ : 3 /*PRIO_Ctrl*/;
    this.pKeyCursorBack = Edit.prototype.RegisterCursorOp.call(this, 0 /*COP_BACK*/, 14, S("GUIEditCursorBack"), eKeyPrio);
    this.pKeyCursorDel = Edit.prototype.RegisterCursorOp.call(this, 1 /*COP_DELETE*/, 111, S("GUIEditCursorDel"), eKeyPrio);
    this.pKeyCursorLeft = Edit.prototype.RegisterCursorOp.call(this, 2 /*COP_LEFT*/, 105, S("GUIEditCursorLeft"), eKeyPrio);
    this.pKeyCursorRight = Edit.prototype.RegisterCursorOp.call(this, 3 /*COP_RIGHT*/, 106, S("GUIEditCursorRight"), eKeyPrio);
    this.pKeyCursorHome = Edit.prototype.RegisterCursorOp.call(this, 4 /*COP_HOME*/, 102, S("GUIEditCursorHome"), eKeyPrio);
    this.pKeyCursorEnd = Edit.prototype.RegisterCursorOp.call(this, 5 /*COP_END*/, 107, S("GUIEditCursorEnd"), eKeyPrio);
    this.pKeyEnter = new $.C4KeyBinding().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(28), S("GUIEditConfirm"), 2 /*KEYSCOPE_Gui*/, new ControlKeyCB$Edit().init(this, "KeyEnter"), eKeyPrio >>> 0);
    this.pKeyCopy = new $.C4KeyBinding().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(46, 2), S("GUIEditCopy"), 2 /*KEYSCOPE_Gui*/, new ControlKeyCB$Edit().init(this, "KeyCopy"), eKeyPrio >>> 0);
    this.pKeyPaste = new $.C4KeyBinding().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(47, 2), S("GUIEditPaste"), 2 /*KEYSCOPE_Gui*/, new ControlKeyCB$Edit().init(this, "KeyPaste"), eKeyPrio >>> 0);
    this.pKeyCut = new $.C4KeyBinding().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(45, 2), S("GUIEditCut"), 2 /*KEYSCOPE_Gui*/, new ControlKeyCB$Edit().init(this, "KeyCut"), eKeyPrio >>> 0);
    this.pKeySelAll = new $.C4KeyBinding().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(30, 2), S("GUIEditSelAll"), 2 /*KEYSCOPE_Gui*/, new ControlKeyCB$Edit().init(this, "KeySelectAll"), eKeyPrio >>> 0);
    return this;
  }

  $dtor() {
    $delete(this.Text);
    $delete(this.pKeyCursorBack);
    $delete(this.pKeyCursorDel);
    $delete(this.pKeyCursorLeft);
    $delete(this.pKeyCursorRight);
    $delete(this.pKeyCursorHome);
    $delete(this.pKeyCursorEnd);
    $delete(this.pKeyEnter);
    $delete(this.pKeyCopy);
    $delete(this.pKeyPaste);
    $delete(this.pKeyCut);
    $delete(this.pKeySelAll);
    super.$dtor();
  }

  KeyCursorOp(key, op) {
    let fShift = !!((key.dwShift & 4) >>> 0 !== 0);
    let fCtrl = !!((key.dwShift & 2) >>> 0 !== 0);
    if (this.iSelectionStart !== this.iSelectionEnd) {
      if (op === 0 || op === 1) {
        this.DeleteSelection();
        return true;
      }
      if (!fShift) {
        this.Deselect();
      }
    }
    let iMoveDir = 0;
    let iMoveLength = 0;
    if (op === 2 && this.iCursorPos !== 0) {
      iMoveDir = -1;
    } else if (op === 3 && this.iCursorPos >>> 0 < $.SLen(this.Text)) {
      iMoveDir = 1;
    } else if (op === 0 && this.iCursorPos !== 0 && !fShift) {
      iMoveDir = -1;
    } else if (op === 1 && this.iCursorPos >>> 0 < $.SLen(this.Text) && !fShift) {
      iMoveDir = 1;
    } else if (op === 4) {
      iMoveLength = -this.iCursorPos | 0;
    } else if (op === 5) {
      iMoveLength = $.SLen(this.Text) - $u64n(this.iCursorPos) | 0;
    }
    if (iMoveDir !== 0 || iMoveLength !== 0) {
      if (iMoveDir !== 0) {
        if (fCtrl) {
          iMoveLength = 0;
          let fNoneSpaceFound = false;
          let fSpaceFound = false;
          ;
          while (((this.iCursorPos + iMoveLength | 0) + iMoveDir | 0) >= 0 && ((this.iCursorPos + iMoveLength | 0) + iMoveDir | 0) >>> 0 <= $.SLen(this.Text)) {
            if ($.IsWholeWordSpacer(this.Text.a[this.Text.o + ((this.iCursorPos + iMoveLength | 0) + ((iMoveDir - 1 | 0) / 2 | 0) | 0)] & 0xff)) {
              if (fNoneSpaceFound && iMoveDir < 0) {
                break;
              }
              fSpaceFound = true;
              iMoveLength = iMoveLength + iMoveDir | 0;
            } else {
              if (fSpaceFound && iMoveDir > 0) {
                break;
              }
              fNoneSpaceFound = true;
              iMoveLength = iMoveLength + iMoveDir | 0;
            }
          }
        } else {
          iMoveLength = iMoveDir;
          while ($.IsUtf8ContinuationByte(this.Text.a[this.Text.o + (this.iCursorPos + iMoveLength | 0)])) {
            iMoveLength = iMoveLength + $.Sign$i32(iMoveLength) | 0;
          }
        }
      }
      if (op === 0 || op === 1) {
        if (op === 1) {
          this.iCursorPos = this.iCursorPos + iMoveLength | 0;
          iMoveLength = -iMoveLength | 0;
        }
        let c = null;
        for (c = $padd(this.Text, this.iCursorPos); c.a[c.o] !== 0; c = c.add(1)) {
          $wr($padd(c, iMoveLength), 0, c.a[c.o]);
        }
        $wr($padd(c, iMoveLength), 0, 0);
        0;
      } else if (fShift) {
        if (this.iSelectionStart === this.iSelectionEnd) {
          this.iSelectionStart = this.iCursorPos;
        }
        this.iSelectionEnd = this.iCursorPos + iMoveLength | 0;
      } else if (this.iSelectionStart !== this.iSelectionEnd) {
        this.Deselect();
      }
      this.iCursorPos = this.iCursorPos + iMoveLength | 0;
    }
    this.tLastInputTime.$assign($.C4TimeMilliseconds.Now());
    this.ScrollCursorInView();
    return true;
  }

  KeyEnter() {
    this.DoFinishInput(false, false);
    return true;
  }

  KeyCopy() {
    this.Copy$v();
    return true;
  }

  KeyPaste() {
    this.Paste$v();
    return true;
  }

  KeyCut() {
    this.Cut();
    return true;
  }

  KeySelectAll() {
    this.SelectAll();
    return true;
  }

  RegisterCursorOp(op, key, szName, eKeyPrio) {
    let KeyList = [];
    $vpush(KeyList, new $.C4KeyCodeEx().init(key));
    $vpush(KeyList, new $.C4KeyCodeEx().init(key, 4 /*KEYS_Shift*/));
    $vpush(KeyList, new $.C4KeyCodeEx().init(key, 2 /*KEYS_Control*/));
    $vpush(KeyList, new $.C4KeyCodeEx().init(key, 6));
    return new $.C4KeyBinding().init$vector$pi8$i32$pC4KeyboardCallbackInterface$u32(KeyList, szName, 2 /*KEYSCOPE_Gui*/, new ControlKeyCBExPassKey$Edit$i32().init(this, op, "KeyCursorOp"), eKeyPrio >>> 0);
  }

  OnContext(_pListItem, _iX, _iY) {
    if (this.Text == null) {
      return null;
    }
    let pCtx = new ContextMenu().init();
    let iSelBegin = $min(this.iSelectionStart, this.iSelectionEnd) >>> 0;
    let iSelEnd = $max(this.iSelectionStart, this.iSelectionEnd) >>> 0;
    let fAnythingSelected = iSelBegin !== iSelEnd;
    if (fAnythingSelected) {
      pCtx.AddItem$pi8$pi8$i32$pMenuHandler$pContextHandler($.LoadResStr(S("IDS_DLG_CUT")), $.LoadResStr(S("IDS_DLGTIP_CUT")), -1 /*Ico_None*/, new CBMenuHandler$Edit().init(this, "OnCtxCut"));
      pCtx.AddItem$pi8$pi8$i32$pMenuHandler$pContextHandler($.LoadResStr(S("IDS_DLG_COPY")), $.LoadResStr(S("IDS_DLGTIP_COPY")), -1 /*Ico_None*/, new CBMenuHandler$Edit().init(this, "OnCtxCopy"));
    }
    if ($.Application.IsClipboardFull()) {
      pCtx.AddItem$pi8$pi8$i32$pMenuHandler$pContextHandler($.LoadResStr(S("IDS_DLG_PASTE")), $.LoadResStr(S("IDS_DLGTIP_PASTE")), -1 /*Ico_None*/, new CBMenuHandler$Edit().init(this, "OnCtxPaste"));
    }
    if (fAnythingSelected) {
      pCtx.AddItem$pi8$pi8$i32$pMenuHandler$pContextHandler($.LoadResStr(S("IDS_DLG_CLEAR")), $.LoadResStr(S("IDS_DLGTIP_CLEAR")), -1 /*Ico_None*/, new CBMenuHandler$Edit().init(this, "OnCtxClear"));
    }
    if (this.Text.a[this.Text.o] !== 0 && (iSelBegin !== 0 || iSelEnd !== $.SLen(this.Text))) {
      pCtx.AddItem$pi8$pi8$i32$pMenuHandler$pContextHandler($.LoadResStr(S("IDS_DLG_SELALL")), $.LoadResStr(S("IDS_DLGTIP_SELALL")), -1 /*Ico_None*/, new CBMenuHandler$Edit().init(this, "OnCtxSelAll"));
    }
    return pCtx;
  }

  OnCtxCopy(_pThis) {
    this.Copy$v();
  }

  OnCtxPaste(_pThis) {
    this.Paste$v();
  }

  OnCtxCut(_pThis) {
    this.Cut();
  }

  OnCtxClear(_pThis) {
    this.DeleteSelection();
  }

  OnCtxSelAll(_pThis) {
    this.SelectAll();
  }

  Deselect() {
    this.iSelectionStart = this.iSelectionEnd = 0;
    this.tLastInputTime.$assign($.C4TimeMilliseconds.Now());
  }

  InsertText(szText, fUser) {
    if (this.iSelectionStart !== this.iSelectionEnd) {
      this.DeleteSelection();
    }
    let iTextLen = $.SLen(szText) | 0;
    let iTextEnd = $.SLen(this.Text) | 0;
    let fBufferOK = (iTextLen + iTextEnd | 0) <= (this.iMaxTextLength - 1 | 0);
    if (!fBufferOK) {
      iTextLen = iTextLen - ((iTextEnd + iTextLen | 0) - (this.iMaxTextLength - 1 | 0) | 0) | 0;
    }
    if (iTextLen <= 0) {
      return false;
    }
    this.EnsureBufferSize((iTextEnd + iTextLen | 0) + 1 | 0);
    let i = 0;
    for (i = iTextEnd; i >= this.iCursorPos; i = i - 1 | 0) {
      this.Text.a[this.Text.o + (i + iTextLen | 0)] = this.Text.a[this.Text.o + i];
    }
    for (i = iTextLen; i !== 0; i = i - 1 | 0) {
      this.Text.a[this.Text.o + ((this.iCursorPos + i | 0) - 1 | 0)] = szText.a[szText.o + (i - 1 | 0)];
    }
    if (fUser) {
      this.iCursorPos = this.iCursorPos + iTextLen | 0;
      this.tLastInputTime.$assign($.C4TimeMilliseconds.Now());
      this.ScrollCursorInView();
    }
    return fBufferOK;
  }

  ClearText$v() {
    if (this.iBufferSize > 256) {
      $delete(this.Text);
      this.Text = P(new Int8Array(256), 0);
      this.iBufferSize = 256;
    }
    this.Text.a[this.Text.o] = 0;
    this.iCursorPos = this.iSelectionStart = this.iSelectionEnd = 0;
    this.iXScroll = 0;
  }

  DeleteSelection() {
    let iSelBegin = $min(this.iSelectionStart, this.iSelectionEnd);
    let iSelEnd = $max(this.iSelectionStart, this.iSelectionEnd);
    if (this.iSelectionStart === this.iSelectionEnd) {
      return;
    }
    c$memmove($padd(this.Text, iSelBegin), $padd(this.Text, iSelEnd), c$strlen($padd(this.Text, iSelEnd)) + 1);
    if (this.iCursorPos > iSelBegin) {
      this.iCursorPos = $max(iSelBegin, (this.iCursorPos - iSelEnd | 0) + iSelBegin | 0);
    }
    this.tLastInputTime.$assign($.C4TimeMilliseconds.Now());
    this.iSelectionStart = this.iSelectionEnd = iSelBegin;
  }

  SetText$pi8$b(szText, fUser) {
    this.ClearText$v();
    return this.InsertText(szText, fUser);
  }

  SetPasswordMask(cNewPasswordMask) {
    this.cPasswordMask = cNewPasswordMask;
  }

  GetCharPos(iControlXPos) {
    iControlXPos = iControlXPos - ((this.rcClientRect.x - this.rcBounds.x | 0) - this.iXScroll | 0) | 0;
    if (this.cPasswordMask !== 0) {
      const w = [0];
      const h = [0];
      const strMask = new Int8Array([this.cPasswordMask, 0]);
      this.pFont.GetTextExtent(P(strMask, 0), P(w, 0), P(h, 0), false);
      return $.Clamp$i32$i32$i32((iControlXPos + (w[0] / 2 | 0) | 0) / $max(1, w[0]) | 0, 0, $.SLen(this.Text) | 0);
    }
    let i = 0;
    {
      let iLastW = 0;
      const w = [0];
      const h = [0];
      for (; this.Text.a[this.Text.o + i] !== 0; i = i + 1 | 0) {
        let oldi = i;
        if ($.IsUtf8StartByte(this.Text.a[this.Text.o + oldi])) {
          while ($.IsUtf8ContinuationByte(this.Text.a[this.Text.o + ((i = i + 1 | 0) + 1 | 0)])) {
            ;
          }
        }
        let c = this.Text.a[this.Text.o + (i + 1 | 0)];
        this.Text.a[this.Text.o + (i + 1 | 0)] = 0;
        this.pFont.GetTextExtent(this.Text, P(w, 0), P(h, 0), false);
        this.Text.a[this.Text.o + (i + 1 | 0)] = c;
        if ((w[0] - ((w[0] - iLastW | 0) / 2 | 0) | 0) >= iControlXPos) {
          return oldi;
        }
        iLastW = w[0];
      }
    }
    return i;
  }

  EnsureBufferSize(iMinBufferSize) {
    if (this.iBufferSize < iMinBufferSize) {
      iMinBufferSize = ((iMinBufferSize - 1 | 0) & -256) + 256 | 0;
      let pNewBuffer = P(new Int8Array($u64n(iMinBufferSize)), 0);
      $.SCopy$pi8$pi8(this.Text, pNewBuffer);
      $delete(this.Text);
      this.Text = pNewBuffer;
      this.iBufferSize = iMinBufferSize;
    }
  }

  ScrollCursorInView() {
    if (this.rcClientRect.Wdt < 5) {
      return;
    }
    let iScrollOff = $min(20, this.rcClientRect.Wdt / 3 | 0);
    const w = [0];
    const h = [0];
    if (this.cPasswordMask === 0) {
      let c = this.Text.a[this.Text.o + this.iCursorPos];
      this.Text.a[this.Text.o + this.iCursorPos] = 0;
      this.pFont.GetTextExtent(this.Text, P(w, 0), P(h, 0), false);
      this.Text.a[this.Text.o + this.iCursorPos] = c;
    } else {
      let Buf = new $.StdStrBuf();
      Buf.AppendChars(this.cPasswordMask, $u64n(this.iCursorPos));
      this.pFont.GetTextExtent(Buf.getData(), P(w, 0), P(h, 0), false);
    }
    while ((w[0] - this.iXScroll | 0) < (this.rcClientRect.Wdt / 5 | 0) && w[0] < (iScrollOff + this.iXScroll | 0) && this.iXScroll > 0) {
      this.iXScroll = $max(this.iXScroll - $min(100, this.rcClientRect.Wdt / 4 | 0) | 0, 0);
    }
    while ((w[0] - this.iXScroll | 0) >= (this.rcClientRect.Wdt / 5 | 0) && w[0] >= ((this.rcClientRect.Wdt - iScrollOff | 0) + this.iXScroll | 0)) {
      this.iXScroll = this.iXScroll + $min(100, this.rcClientRect.Wdt / 4 | 0) | 0;
    }
  }

  DoFinishInput(fPasting, fPastingMore) {
    let eResult = this.OnFinishInput(fPasting, fPastingMore);
    switch (eResult) {
      case 0:
        return true;
      case 1:
        {
          let pDlg = this.GetDlg();
          if (pDlg != null) {
            $spawn(pDlg.UserClose$b(true));
          }
          break;
        }
      case 2:
        $delete(this);
        break;
      case 3:
        break;
    }
    return false;
  }

  Copy$v() {
    let iSelBegin = $min(this.iSelectionStart, this.iSelectionEnd);
    let iSelEnd = $max(this.iSelectionStart, this.iSelectionEnd);
    if (iSelBegin === iSelEnd) {
      return false;
    }
    let buf = StdString.of($padd(this.Text, iSelBegin), $u64n(iSelEnd - iSelBegin | 0));
    if (this.cPasswordMask !== 0) {
      buf.assign(buf.size(), this.cPasswordMask);
    }
    return $.Application.Copy$string$b(buf);
  }

  Cut() {
    if (!this.Copy$v()) {
      return false;
    }
    this.DeleteSelection();
    return true;
  }

  Paste$v() {
    let fSuccess = false;
    if (!$.Application.IsClipboardFull()) {
      return false;
    }
    let text = new $.StdCopyStrBuf().init$pi8$b($.Application.Paste$b().c_str());
    let szText = text.getMData();
    if (text.op_const_void_() != null) {
      fSuccess = !(szText.a[szText.o] === 0);
      let iLBPos = 0;
      let iLBPos2 = 0;
      iLBPos = 0;
      for (; ; ) {
        iLBPos = $.SCharPos(13, szText);
        iLBPos2 = $.SCharPos(10, szText);
        if (iLBPos < 0 && iLBPos2 < 0) {
          break;
        }
        if (iLBPos2 >= 0 && (iLBPos2 < iLBPos || iLBPos < 0)) {
          iLBPos = iLBPos2;
        }
        if (iLBPos === 0) {
          szText = szText.add(1);
          continue;
        }
        szText.a[szText.o + iLBPos] = 0;
        if (!this.InsertText(szText, true)) {
          fSuccess = false;
        }
        szText = szText.add(iLBPos + 1 | 0);
        iLBPos = 0;
        if (!this.DoFinishInput(true, !(szText.a[szText.o] === 0))) {
          return true;
        }
      }
      if (szText.a[szText.o] !== 0) {
        fSuccess = fSuccess && this.InsertText(szText, true);
      }
    }
    return fSuccess;
  }

  CharIn(c) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Edit && Edit.prototype instanceof $c) return $c.prototype.CharIn.apply(this, arguments); }
    if ((c.a[c.o + 0] & 0xff) < 32 || c.a[c.o + 0] === 127) {
      return false;
    }
    if (c.a[c.o + 0] === 124) {
      return false;
    }
    return this.InsertText(c, true);
  }

  DoDragging(_rMouse, iX, _iY, _dwKeyParam) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Edit && Edit.prototype instanceof $c) return $c.prototype.DoDragging.apply(this, arguments); }
    let iPrevCursorPos = this.iCursorPos;
    this.iCursorPos = this.iSelectionEnd = this.GetCharPos(iX);
    if (iPrevCursorPos !== this.iCursorPos) {
      this.ScrollCursorInView();
    }
  }

  IsFocusOnClick() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Edit && Edit.prototype instanceof $c) return $c.prototype.IsFocusOnClick.apply(this, arguments); }
    return true;
  }

  OnGetFocus(fByMouse) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Edit && Edit.prototype instanceof $c) return $c.prototype.OnGetFocus.apply(this, arguments); }
    Control.prototype.OnGetFocus.call(this, fByMouse);
    this.iSelectionStart = 0;
    this.iSelectionEnd = this.iCursorPos = $.SLen(this.Text) | 0;
    this.tLastInputTime.$assign($.C4TimeMilliseconds.Now());
  }

  OnLooseFocus() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Edit && Edit.prototype instanceof $c) return $c.prototype.OnLooseFocus.apply(this, arguments); }
    this.iSelectionStart = this.iSelectionEnd = 0;
    Control.prototype.OnLooseFocus.call(this);
  }

  DrawElement(cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Edit && Edit.prototype instanceof $c) return $c.prototype.DrawElement.apply(this, arguments); }
    $.pDraw.DrawBoxDw(cgo.Surface, ftoi32(Math.fround(cgo.TargetX + Math.fround(this.rcBounds.x))), ftoi32(Math.fround(cgo.TargetY + Math.fround(this.rcBounds.y))), ftoi32(Math.fround(Math.fround(Math.fround(this.rcBounds.x + this.rcBounds.Wdt | 0) + cgo.TargetX) - Math.fround(1))), ftoi32(Math.fround(Math.fround(this.rcClientRect.y + this.rcClientRect.Hgt | 0) + cgo.TargetY)), this.dwBGClr);
    if (this.dwBorderColor !== 0) {
      let x1 = ftoi32(Math.fround(cgo.TargetX + Math.fround(this.rcBounds.x)));
      let y1 = ftoi32(Math.fround(cgo.TargetY + Math.fround(this.rcBounds.y)));
      let x2 = x1 + this.rcBounds.Wdt | 0;
      let y2 = y1 + this.rcBounds.Hgt | 0;
      $.pDraw.DrawFrameDw(cgo.Surface, x1, y1, x2, y2 - 1 | 0, this.dwBorderColor);
      $.pDraw.DrawFrameDw(cgo.Surface, x1 + 1 | 0, y1 + 1 | 0, x2 - 1 | 0, y2 - 2 | 0, this.dwBorderColor);
    } else {
      this.Draw3DFrame(cgo);
    }
    const cx0 = [0];
    const cy0 = [0];
    const cx1 = [0];
    const cy1 = [0];
    let fClip = false;
    let fOwnClip = false;
    fClip = $.pDraw.GetPrimaryClipper(P(cx0, 0), P(cy0, 0), P(cx1, 0), P(cy1, 0));
    const nclx1 = [Math.fround(Math.fround(Math.fround(this.rcClientRect.x) + cgo.TargetX) - Math.fround(2))];
    const ncly1 = [Math.fround(Math.fround(this.rcClientRect.y) + cgo.TargetY)];
    const nclx2 = [Math.fround(Math.fround(Math.fround(this.rcClientRect.x + this.rcClientRect.Wdt | 0) + cgo.TargetX) + Math.fround(1))];
    const ncly2 = [Math.fround(Math.fround(this.rcClientRect.y + this.rcClientRect.Hgt | 0) + cgo.TargetY)];
    $.pDraw.ApplyZoom(P(nclx1, 0), P(ncly1, 0));
    $.pDraw.ApplyZoom(P(nclx2, 0), P(ncly2, 0));
    fOwnClip = $.pDraw.SetPrimaryClipper(ftoi32(nclx1[0]), ftoi32(ncly1[0]), ftoi32(nclx2[0]), ftoi32(ncly2[0]));
    let iHgt = this.pFont.GetLineHeight();
    let iY0 = 0;
    if (this.rcClientRect.Hgt <= iHgt) {
      iHgt = this.rcClientRect.Hgt;
      iY0 = this.rcClientRect.y;
    } else {
      iY0 = (this.rcClientRect.y + ((this.rcClientRect.Hgt - iHgt | 0) / 2 | 0) | 0) + 1 | 0;
      iHgt = iHgt - 2 | 0;
    }
    let Buf = new $.StdStrBuf();
    let pDrawText = null;
    if (this.cPasswordMask !== 0) {
      Buf.AppendChars(this.cPasswordMask, $.SLen(this.Text));
      pDrawText = Buf.getMData();
    } else {
      pDrawText = this.Text;
    }
    if (this.iSelectionStart !== this.iSelectionEnd) {
      let iSelBegin = $min(this.iSelectionStart, this.iSelectionEnd);
      let iSelEnd = $max(this.iSelectionStart, this.iSelectionEnd);
      const iSelX1 = [0];
      const iSelX2 = [0];
      const h = [0];
      let c = pDrawText.a[pDrawText.o + iSelBegin];
      pDrawText.a[pDrawText.o + iSelBegin] = 0;
      this.pFont.GetTextExtent(pDrawText, P(iSelX1, 0), P(h, 0), false);
      pDrawText.a[pDrawText.o + iSelBegin] = c;
      c = pDrawText.a[pDrawText.o + iSelEnd];
      pDrawText.a[pDrawText.o + iSelEnd] = 0;
      this.pFont.GetTextExtent(pDrawText, P(iSelX2, 0), P(h, 0), false);
      pDrawText.a[pDrawText.o + iSelEnd] = c;
      iSelX1[0] = iSelX1[0] - this.iXScroll | 0;
      iSelX2[0] = iSelX2[0] - this.iXScroll | 0;
      $.pDraw.DrawBoxDw(cgo.Surface, ftoi32(Math.fround(Math.fround(cgo.TargetX + Math.fround(this.rcClientRect.x)) + Math.fround(iSelX1[0]))), ftoi32(Math.fround(cgo.TargetY + Math.fround(iY0))), ftoi32(Math.fround(Math.fround((this.rcClientRect.x + iSelX2[0] | 0) - 1 | 0) + cgo.TargetX)), ftoi32(Math.fround(Math.fround((iY0 + iHgt | 0) - 1 | 0) + cgo.TargetY)), 0x7f7f7f00);
    }
    $.pDraw.TextOut(pDrawText, this.pFont, 1, cgo.Surface, Math.fround(Math.fround(Math.fround(this.rcClientRect.x) + cgo.TargetX) - Math.fround(this.iXScroll)), Math.fround(Math.fround(Math.fround(iY0) + cgo.TargetY) - Math.fround(1)), this.dwFontClr, 0, false);
    let fBlink = ($.op_sub$C4TimeMilliseconds$C4TimeMilliseconds(this.tLastInputTime, $.C4TimeMilliseconds.Now()) / 500 | 0) % 2 === 0;
    if (this.HasDrawFocus() && fBlink) {
      let cAtCursor = pDrawText.a[pDrawText.o + this.iCursorPos];
      pDrawText.a[pDrawText.o + this.iCursorPos] = 0;
      const w = [0];
      const h = [0];
      const wc = [0];
      this.pFont.GetTextExtent(pDrawText, P(w, 0), P(h, 0), false);
      pDrawText.a[pDrawText.o + this.iCursorPos] = cAtCursor;
      this.pFont.GetTextExtent(Edit.CursorRepresentation, P(wc, 0), P(h, 0), false);
      wc[0] = wc[0] / 2 | 0;
      $.pDraw.TextOut(Edit.CursorRepresentation, this.pFont, 1.5, cgo.Surface, Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(this.rcClientRect.x) + cgo.TargetX) + Math.fround(w[0])) - Math.fround(wc[0])) - Math.fround(this.iXScroll)), Math.fround(Math.fround(Math.fround(iY0) + cgo.TargetY) - Math.fround(h[0] / 3 | 0)), this.dwFontClr, 0, false);
    }
    if (fOwnClip) {
      if (fClip) {
        $.pDraw.SetPrimaryClipper(cx0[0], cy0[0], cx1[0], cy1[0]);
      } else {
        $.pDraw.NoPrimaryClipper();
      }
    }
  }

  OnFinishInput(_fPasting, _fPastingMore) {
    return 1 /*IR_CloseDlg*/;
  }

  OnAbortInput() {
  }

  GetMarginTop() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Edit && Edit.prototype instanceof $c) return $c.prototype.GetMarginTop.apply(this, arguments); }
    return 2;
  }

  GetMarginLeft() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Edit && Edit.prototype instanceof $c) return $c.prototype.GetMarginLeft.apply(this, arguments); }
    return 4;
  }

  GetMarginRight() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Edit && Edit.prototype instanceof $c) return $c.prototype.GetMarginRight.apply(this, arguments); }
    return 4;
  }

  GetMarginBottom() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Edit && Edit.prototype instanceof $c) return $c.prototype.GetMarginBottom.apply(this, arguments); }
    return 2;
  }

  MouseInput$rCMouse$i32$i32$i32$u32(rMouse, iButton, iX, iY, dwKeyParam) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Edit && Edit.prototype instanceof $c) return $c.prototype.MouseInput$rCMouse$i32$i32$i32$u32.apply(this, arguments); }
    Control.prototype.MouseInput$rCMouse$i32$i32$i32$u32.call(this, rMouse, iButton, iX, iY, dwKeyParam);
    let iPrevCursorPos = this.iCursorPos;
    switch (iButton) {
      case 1:
        this.fLeftBtnDown = true;
        this.iSelectionStart = this.iSelectionEnd = this.GetCharPos(iX);
        this.iCursorPos = this.iSelectionStart;
        if (rMouse.pDragElement == null) {
          rMouse.pDragElement = this;
        }
        break;
      case 2:
        if (this.fLeftBtnDown) {
          this.fLeftBtnDown = false;
          this.iCursorPos = this.iSelectionEnd;
        }
        break;
      case 5:
        {
          let iCharPos = this.GetCharPos(iX);
          if ($.IsWholeWordSpacer(this.Text.a[this.Text.o + iCharPos] & 0xff)) {
            if (iCharPos === 0) {
              break;
            }
            if ($.IsWholeWordSpacer(this.Text.a[this.Text.o + (iCharPos = iCharPos - 1 | 0)] & 0xff)) {
              break;
            }
          }
          this.iSelectionStart = iCharPos;
          this.iSelectionEnd = iCharPos + 1 | 0;
          while (this.iSelectionStart > 0 && !$.IsWholeWordSpacer(this.Text.a[this.Text.o + (this.iSelectionStart - 1 | 0)] & 0xff)) {
            this.iSelectionStart = this.iSelectionStart - 1 | 0;
          }
          while (!$.IsWholeWordSpacer(this.Text.a[this.Text.o + this.iSelectionEnd] & 0xff)) {
            this.iSelectionEnd = this.iSelectionEnd + 1 | 0;
          }
          this.iCursorPos = this.iSelectionEnd;
          this.fLeftBtnDown = false;
        }
        break;
      case 8:
        this.iSelectionStart = this.iSelectionEnd = this.GetCharPos(iX);
        this.iCursorPos = this.iSelectionStart;
        this.InsertText($.Application.Paste$b(false).c_str(), true);
        break;
    }
    ;
    if (iPrevCursorPos !== this.iCursorPos) {
      this.ScrollCursorInView();
    }
  }

  GetText$v() {
    return this.Text;
  }

  SelectAll() {
    if (this.Text == null) {
      return;
    }
    this.iSelectionStart = 0;
    this.iSelectionEnd = this.iCursorPos = $.SLen(this.Text) | 0;
  }

  static GetDefaultEditHeight() {
    return Edit.GetCustomEditHeight($.GraphicsResource.TextFont);
  }

  static GetCustomEditHeight(pUseFont) {
    return $max(pUseFont.GetLineHeight() + 3 | 0, 23);
  }

  GetCurrentWord(szTargetBuf, iMaxTargetBufLen) {
    if (this.Text == null || this.iCursorPos <= 0) {
      return false;
    }
    let iPos = this.iCursorPos;
    while (iPos > 0) {
      if ($.IsWholeWordSpacer(this.Text.a[this.Text.o + (iPos - 1 | 0)] & 0xff)) {
        break;
      } else {
        iPos = iPos - 1 | 0;
      }
    }
    $.SCopy$pi8$pi8$u64($padd(this.Text, iPos), szTargetBuf, $u64n($min(this.iCursorPos - iPos | 0, iMaxTargetBufLen)));
    return !(szTargetBuf.a[szTargetBuf.o] === 0);
  }

  SetFont$pCStdFont(pToFont) {
    this.pFont = pToFont;
    this.ScrollCursorInView();
  }

  SetColors(dwNewBGClr, dwNewFontClr, dwNewBorderColor) {
    this.dwBGClr = dwNewBGClr;
    this.dwFontClr = dwNewFontClr;
    this.dwBorderColor = dwNewBorderColor;
  }

  SetMaxText(iTo) {
    this.iMaxTextLength = iTo;
  }

  $clone() { return new Edit().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pKeyCursorBack = o.pKeyCursorBack;
    this.pKeyCursorDel = o.pKeyCursorDel;
    this.pKeyCursorLeft = o.pKeyCursorLeft;
    this.pKeyCursorRight = o.pKeyCursorRight;
    this.pKeyCursorHome = o.pKeyCursorHome;
    this.pKeyCursorEnd = o.pKeyCursorEnd;
    this.pKeyEnter = o.pKeyEnter;
    this.pKeyCopy = o.pKeyCopy;
    this.pKeyPaste = o.pKeyPaste;
    this.pKeyCut = o.pKeyCut;
    this.pKeySelAll = o.pKeySelAll;
    this.pFont = o.pFont;
    this.Text = o.Text;
    this.dwBGClr = o.dwBGClr;
    this.dwFontClr = o.dwFontClr;
    this.dwBorderColor = o.dwBorderColor;
    this.iBufferSize = o.iBufferSize;
    this.iCursorPos = o.iCursorPos;
    this.iSelectionStart = o.iSelectionStart;
    this.iSelectionEnd = o.iSelectionEnd;
    this.iMaxTextLength = o.iMaxTextLength;
    this.tLastInputTime.$assign(o.tLastInputTime);
    this.iXScroll = o.iXScroll;
    this.cPasswordMask = o.cPasswordMask;
    this.fLeftBtnDown = o.fLeftBtnDown;
    return this;
  }
}

export class CheckBox extends Control {
  fChecked = false;
  pKeyCheck = null;
  sCaption = new $.StdStrBuf();
  fMouseOn = false;
  pCBHandler = null;
  fEnabled = false;
  pFont = null;
  dwEnabledClr = 0;
  dwDisabledClr = 0;
  cHotkey = 0;

  init(rtBounds, szCaption, fChecked) {
    super.init(rtBounds);
    this.fChecked = fChecked;
    this.sCaption = new $.StdStrBuf();
    this.fMouseOn = false;
    this.fEnabled = true;
    this.pFont = null;
    this.dwEnabledClr = 0xffffffff;
    this.dwDisabledClr = 0xffafafaf;
    this.cHotkey = 0;
    this.$dyn = CheckBox;
    if (szCaption != null) {
      this.sCaption.Copy$pi8(szCaption);
      ExpandHotkeyMarkup(this.sCaption, P(this, "cHotkey"));
    }
    let Keys = [];
    $vpush(Keys, new $.C4KeyCodeEx().init(57));
    if ($.Config.Controls.GamepadGuiControl !== 0) {
      $.Ok(Keys);
    }
    this.pKeyCheck = new $.C4KeyBinding().init$vector$pi8$i32$pC4KeyboardCallbackInterface$u32(Keys, S("GUICheckboxToggle"), 2 /*KEYSCOPE_Gui*/, new ControlKeyCB$CheckBox().init(this, "KeyCheck"), 3);
    this.pCBHandler = null;
    return this;
  }

  $dtor() {
    $delete(this.pKeyCheck);
    if (this.pCBHandler != null) {
      this.pCBHandler.DeRef();
    }
    super.$dtor();
  }

  KeyCheck() {
    this.ToggleCheck(true);
    return true;
  }

  ToggleCheck(fByUser) {
    if (fByUser && !this.fEnabled) {
      return;
    }
    if (fByUser) {
      GUISound(S("UI::Tick"));
    }
    this.fChecked = !this.fChecked;
    if (this.pCBHandler != null) {
      this.pCBHandler.DoCall$pElement(this);
    }
  }

  UpdateOwnPos() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== CheckBox && CheckBox.prototype instanceof $c) return $c.prototype.UpdateOwnPos.apply(this, arguments); }
  }

  IsFocusOnClick() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== CheckBox && CheckBox.prototype instanceof $c) return $c.prototype.IsFocusOnClick.apply(this, arguments); }
    return false;
  }

  IsFocusElement() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== CheckBox && CheckBox.prototype instanceof $c) return $c.prototype.IsFocusElement.apply(this, arguments); }
    return this.fEnabled ? Control.prototype.IsFocusElement.call(this) : null;
  }

  DrawElement(cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== CheckBox && CheckBox.prototype instanceof $c) return $c.prototype.DrawElement.apply(this, arguments); }
    let x0 = ftoi32(Math.fround(Math.fround(this.rcBounds.x) + cgo.TargetX));
    let y0 = ftoi32(Math.fround(Math.fround(this.rcBounds.y) + cgo.TargetY));
    $.GraphicsResource.fctCheckbox.GetPhase((this.fChecked ? 1 : 0) + Math.imul(2, !this.fEnabled ? 1 : 0) | 0).DrawX(cgo.Surface, Math.fround(x0), Math.fround(y0), Math.fround(this.rcBounds.Hgt), Math.fround(this.rcBounds.Hgt));
    let pUseFont = this.pFont != null ? this.pFont : $.GraphicsResource.TextFont;
    let yOff = 0;
    let fZoom = 0;
    if (pUseFont.GetLineHeight() <= this.rcBounds.Hgt) {
      yOff = $max(this.rcBounds.Hgt - pUseFont.GetLineHeight() | 0, 0) / 2 | 0;
      fZoom = 1;
    } else {
      yOff = 0;
      fZoom = Math.fround(Math.fround(this.rcBounds.Hgt) / Math.fround($max(pUseFont.GetLineHeight(), 1)));
    }
    $.pDraw.TextOut(this.sCaption.getData(), pUseFont, fZoom, cgo.Surface, Math.fround((x0 + this.rcBounds.Hgt | 0) + 4 | 0), Math.fround(y0 + yOff | 0), this.fEnabled ? this.dwEnabledClr : this.dwDisabledClr, 0, true);
    if (this.fMouseOn && this.IsInActiveDlg(false) || this.HasDrawFocus()) {
      $.pDraw.SetBlitMode(1);
      $.GraphicsResource.fctButtonHighlightRound.DrawX(cgo.Surface, Math.fround(x0 + (Math.imul(this.rcBounds.Hgt, 1) / 4 | 0) | 0), Math.fround(y0 + (Math.imul(this.rcBounds.Hgt, 1) / 4 | 0) | 0), Math.fround(Math.imul(this.rcBounds.Hgt, 1) / 2 | 0), Math.fround(Math.imul(this.rcBounds.Hgt, 1) / 2 | 0));
      $.pDraw.ResetBlitMode();
    }
  }

  OnHotkey(cHotkey) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== CheckBox && CheckBox.prototype instanceof $c) return $c.prototype.OnHotkey.apply(this, arguments); }
    if (cHotkey !== this.cHotkey) {
      return false;
    }
    this.ToggleCheck(true);
    return true;
  }

  MouseInput$rCMouse$i32$i32$i32$u32(rMouse, iButton, iX, iY, dwKeyParam) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== CheckBox && CheckBox.prototype instanceof $c) return $c.prototype.MouseInput$rCMouse$i32$i32$i32$u32.apply(this, arguments); }
    if (this.fEnabled) {
      this.fMouseOn = $.Inside$i32$i32$i32$3(iX, 0, this.rcBounds.Hgt) && $.Inside$i32$i32$i32$3(iY, 0, this.rcBounds.Hgt);
      if (iButton === 1 && this.fMouseOn) {
        this.ToggleCheck(true);
        return;
      }
    }
    Control.prototype.MouseInput$rCMouse$i32$i32$i32$u32.call(this, rMouse, iButton, iX, iY, dwKeyParam);
  }

  MouseEnter(rMouse) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== CheckBox && CheckBox.prototype instanceof $c) return $c.prototype.MouseEnter.apply(this, arguments); }
    Element.prototype.MouseEnter.call(this, rMouse);
  }

  MouseLeave(rMouse) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== CheckBox && CheckBox.prototype instanceof $c) return $c.prototype.MouseLeave.apply(this, arguments); }
    this.fMouseOn = false;
    Element.prototype.MouseLeave.call(this, rMouse);
  }

  SetChecked(fToVal) {
    this.fChecked = fToVal;
  }

  GetChecked() {
    return this.fChecked;
  }

  SetOnChecked(pCB) {
    if (this.pCBHandler != null) {
      this.pCBHandler.DeRef();
    }
    if ((this.pCBHandler = pCB) != null) {
      pCB.Ref();
    }
  }

  SetEnabled(fToVal) {
    if (!(this.fEnabled = fToVal)) {
      this.DisableFocus();
    }
  }

  GetText$v() {
    return this.sCaption.getData();
  }

  SetFont$pCStdFont$u32$u32(pFont, dwEnabledClr, dwDisabledClr) {
    this.pFont = pFont;
    this.dwEnabledClr = dwEnabledClr;
    this.dwDisabledClr = dwDisabledClr;
  }

  static GetStandardCheckBoxSize(piWdt, piHgt, szForCaptionText, pUseFont) {
    if (pUseFont == null) {
      pUseFont = $.GraphicsResource.TextFont;
    }
    const iWdt = [100];
    const iHgt = [32];
    pUseFont.GetTextExtent(szForCaptionText, P(iWdt, 0), P(iHgt, 0), true);
    if (piWdt != null) {
      piWdt.a[piWdt.o] = (iWdt[0] + iHgt[0] | 0) + 4 | 0;
    }
    if (piHgt != null) {
      piHgt.a[piHgt.o] = iHgt[0];
    }
    return true;
  }

  $clone() { return new CheckBox().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.fChecked = o.fChecked;
    this.pKeyCheck = o.pKeyCheck;
    this.sCaption.$assign(o.sCaption);
    this.fMouseOn = o.fMouseOn;
    this.pCBHandler = o.pCBHandler;
    this.fEnabled = o.fEnabled;
    this.pFont = o.pFont;
    this.dwEnabledClr = o.dwEnabledClr;
    this.dwDisabledClr = o.dwDisabledClr;
    this.cHotkey = o.cHotkey;
    return this;
  }
}

export class ListBox extends Control {
  pKeyContext$ListBox = null;
  pKeyUp = null;
  pKeyDown = null;
  pKeyPageUp = null;
  pKeyPageDown = null;
  pKeyHome = null;
  pKeyEnd = null;
  pKeyActivate = null;
  pKeyLeft = null;
  pKeyRight = null;
  iMultiColItemWidth = 0;
  iColCount = 0;
  pClientWindow = null;
  pSelectedItem = null;
  pSelectionChangeHandler = null;
  pSelectionDblClickHandler = null;
  fDrawBackground = false;
  fDrawBorder = false;
  fSelectionDisabled = false;

  KeyContext() {
    if (this.pSelectedItem != null && this.pSelectedItem.DoContext$v()) {
      return true;
    }
    return false;
  }

  KeyUp$v() {
    let $t1;
    let pPrevSelectedItem = this.pSelectedItem;
    if (this.pSelectedItem == null) {
      this.pSelectedItem = this.pClientWindow.GetLastContained();
    } else {
      let cnt = this.iColCount;
      while (this.pSelectedItem != null && ($t1 = cnt, cnt = cnt - 1 | 0, $t1) !== 0) {
        this.pSelectedItem = this.pSelectedItem.GetPrev();
      }
      if (this.pSelectedItem == null) {
        this.pSelectedItem = pPrevSelectedItem;
      }
    }
    if (this.pSelectedItem !== pPrevSelectedItem) {
      this.SelectionChanged(true);
    }
    return true;
  }

  KeyDown$v() {
    let $t1;
    let pPrevSelectedItem = this.pSelectedItem;
    if (this.pSelectedItem == null) {
      this.pSelectedItem = this.pClientWindow.GetFirstContained();
    } else {
      let cnt = this.iColCount;
      while (this.pSelectedItem != null && ($t1 = cnt, cnt = cnt - 1 | 0, $t1) !== 0) {
        this.pSelectedItem = Element.prototype.GetNext$v$c.call(this.pSelectedItem);
      }
      if (this.pSelectedItem == null) {
        this.pSelectedItem = pPrevSelectedItem;
      }
    }
    if (this.pSelectedItem !== pPrevSelectedItem) {
      this.SelectionChanged(true);
    }
    return true;
  }

  KeyLeft() {
    if (!this.IsMultiColumn()) {
      return false;
    }
    let pPrevSelectedItem = this.pSelectedItem;
    if (this.pSelectedItem == null) {
      this.pSelectedItem = this.pClientWindow.GetLastContained();
    } else {
      if (this.pSelectedItem.GetPrev() != null) {
        this.pSelectedItem = this.pSelectedItem.GetPrev();
      }
    }
    if (this.pSelectedItem !== pPrevSelectedItem) {
      this.SelectionChanged(true);
    }
    return true;
  }

  KeyRight() {
    if (!this.IsMultiColumn()) {
      return false;
    }
    let pPrevSelectedItem = this.pSelectedItem;
    if (this.pSelectedItem == null) {
      this.pSelectedItem = this.pClientWindow.GetFirstContained();
    } else {
      if (Element.prototype.GetNext$v$c.call(this.pSelectedItem) != null) {
        this.pSelectedItem = Element.prototype.GetNext$v$c.call(this.pSelectedItem);
      }
    }
    if (this.pSelectedItem !== pPrevSelectedItem) {
      this.SelectionChanged(true);
    }
    return true;
  }

  KeyPageUp() {
    let pNextSelectedItem = this.pSelectedItem != null ? this.pSelectedItem : this.pClientWindow.GetLastContained();
    let pNext = null;
    if (pNextSelectedItem == null) {
      return false;
    }
    if ((pNext = pNextSelectedItem.GetPrev()) != null) {
      pNextSelectedItem = pNext;
      if (this.pClientWindow.IsRangeInView(pNextSelectedItem.GetBounds().y, pNextSelectedItem.GetBounds().Hgt)) {
        while ((pNext = pNextSelectedItem.GetPrev()) != null) {
          if (this.pClientWindow.IsRangeInView(pNext.GetBounds().y, pNext.GetBounds().Hgt)) {
            pNextSelectedItem = pNext;
          } else {
            break;
          }
        }
      } else {
        this.pClientWindow.ScrollPages(-1);
        pNextSelectedItem = this.pClientWindow.GetFirstContained();
        while (!this.pClientWindow.IsRangeInView(pNextSelectedItem.GetBounds().y, pNextSelectedItem.GetBounds().Hgt)) {
          if ((pNext = Element.prototype.GetNext$v$c.call(pNextSelectedItem)) != null) {
            pNextSelectedItem = pNext;
          } else {
            break;
          }
        }
      }
    }
    if (this.pSelectedItem !== pNextSelectedItem) {
      this.pSelectedItem = pNextSelectedItem;
      this.SelectionChanged(true);
    }
    return true;
  }

  KeyPageDown() {
    let pNextSelectedItem = this.pSelectedItem != null ? this.pSelectedItem : this.pClientWindow.GetFirstContained();
    let pNext = null;
    if (pNextSelectedItem == null) {
      return false;
    }
    if ((pNext = Element.prototype.GetNext$v$c.call(pNextSelectedItem)) != null) {
      pNextSelectedItem = pNext;
      if (this.pClientWindow.IsRangeInView(pNextSelectedItem.GetBounds().y, pNextSelectedItem.GetBounds().Hgt)) {
        while ((pNext = Element.prototype.GetNext$v$c.call(pNextSelectedItem)) != null) {
          if (this.pClientWindow.IsRangeInView(pNext.GetBounds().y, pNext.GetBounds().Hgt)) {
            pNextSelectedItem = pNext;
          } else {
            break;
          }
        }
      } else {
        this.pClientWindow.ScrollPages(1);
        pNextSelectedItem = this.pClientWindow.GetLastContained();
        while (!this.pClientWindow.IsRangeInView(pNextSelectedItem.GetBounds().y, pNextSelectedItem.GetBounds().Hgt)) {
          if ((pNext = pNextSelectedItem.GetPrev()) != null) {
            pNextSelectedItem = pNext;
          } else {
            break;
          }
        }
      }
    }
    if (this.pSelectedItem !== pNextSelectedItem) {
      this.pSelectedItem = pNextSelectedItem;
      this.SelectionChanged(true);
    }
    return true;
  }

  KeyHome() {
    let pPrevSelectedItem = this.pSelectedItem;
    this.pSelectedItem = this.pClientWindow.GetFirstContained();
    if (this.pSelectedItem !== pPrevSelectedItem) {
      this.SelectionChanged(true);
    }
    return true;
  }

  KeyEnd() {
    let pPrevSelectedItem = this.pSelectedItem;
    this.pSelectedItem = this.pClientWindow.GetLastContained();
    if (this.pSelectedItem !== pPrevSelectedItem) {
      this.SelectionChanged(true);
    }
    return true;
  }

  KeyActivate() {
    if (this.pSelectedItem != null && this.pSelectionDblClickHandler != null) {
      this.pSelectionDblClickHandler.DoCall$pElement(this.pSelectedItem);
      return true;
    }
    return false;
  }

  DrawElement(cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ListBox && ListBox.prototype instanceof $c) return $c.prototype.DrawElement.apply(this, arguments); }
    if (this.fDrawBackground) {
      $.pDraw.DrawBoxDw(cgo.Surface, ftoi32(Math.fround(cgo.TargetX + Math.fround(this.rcBounds.x))), ftoi32(Math.fround(cgo.TargetY + Math.fround(this.rcBounds.y))), ftoi32(Math.fround(Math.fround(Math.fround(cgo.TargetX + Math.fround(this.rcBounds.x)) + Math.fround(this.rcBounds.Wdt)) - Math.fround(1))), ftoi32(Math.fround(Math.fround(Math.fround(cgo.TargetY + Math.fround(this.rcBounds.y)) + Math.fround(this.rcBounds.Hgt)) - Math.fround(1))), 0x7f000000);
    }
    if (this.fDrawBorder) {
      this.Draw3DFrame(cgo);
    }
    if (this.pClientWindow == null) {
      return;
    }
    if (this.pSelectedItem != null) {
      let rcSelArea = this.pSelectedItem.GetBounds().$clone();
      rcSelArea.x = rcSelArea.x + this.GetClientRect().x | 0;
      rcSelArea.y = rcSelArea.y + (this.GetClientRect().y + this.pClientWindow.GetClientRect().y | 0) | 0;
      if (rcSelArea.y < this.GetClientRect().y) {
        rcSelArea.Hgt = rcSelArea.Hgt - (this.GetClientRect().y - rcSelArea.y | 0) | 0;
        rcSelArea.y = this.GetClientRect().y;
      }
      rcSelArea.Hgt = $min(rcSelArea.Hgt, (this.GetClientRect().y + this.GetClientRect().Hgt | 0) - rcSelArea.y | 0);
      if (rcSelArea.Hgt >= 0) {
        $.pDraw.DrawBoxDw(cgo.Surface, ftoi32(Math.fround(Math.fround(rcSelArea.x) + cgo.TargetX)), ftoi32(Math.fround(Math.fround(rcSelArea.y) + cgo.TargetY)), ftoi32(Math.fround(Math.fround(Math.fround(rcSelArea.x + rcSelArea.Wdt | 0) + cgo.TargetX) - Math.fround(1))), ftoi32(Math.fround(Math.fround(Math.fround(rcSelArea.y + rcSelArea.Hgt | 0) + cgo.TargetY) - Math.fround(1))), (this.HasDrawFocus() ? 0x4faf0000 : 0x4f7f7f7f) >>> 0);
      }
    }
    let pCurr = Container.prototype.GetFirst.call(this.pClientWindow);
    if (pCurr == null) {
      return;
    }
    while ((pCurr = Element.prototype.GetNext$v$c.call(pCurr)) != null) {
      if (pCurr.GetListItemTopSpacingBar()) {
        let iYSpace = pCurr.GetListItemTopSpacing();
        let iY = ((pCurr.GetBounds().y + this.GetClientRect().y | 0) + this.pClientWindow.GetClientRect().y | 0) - (iYSpace / 2 | 0) | 0;
        let iX0 = (pCurr.GetBounds().x + this.GetClientRect().x | 0) + 10 | 0;
        let iX1 = (iX0 + this.pClientWindow.GetClientRect().Wdt | 0) - 20 | 0;
        if (iY < this.GetClientRect().y || iY >= (this.GetClientRect().y + this.GetClientRect().Hgt | 0)) {
          continue;
        }
        $.pDraw.DrawLineDw(cgo.Surface, Math.fround(Math.fround(iX0) + cgo.TargetX), Math.fround(Math.fround(iY) + cgo.TargetY), Math.fround(Math.fround(iX1) + cgo.TargetX), Math.fround(Math.fround(iY) + cgo.TargetY), 0x7f772200);
      }
    }
  }

  IsFocused(pCtrl) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ListBox && ListBox.prototype instanceof $c) return $c.prototype.IsFocused.apply(this, arguments); }
    return Container.prototype.IsFocused.call(this, pCtrl) || this.HasFocus() && this.pSelectedItem === pCtrl;
  }

  IsFocusOnClick() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ListBox && ListBox.prototype instanceof $c) return $c.prototype.IsFocusOnClick.apply(this, arguments); }
    return true;
  }

  IsFocusElement() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ListBox && ListBox.prototype instanceof $c) return $c.prototype.IsFocusElement.apply(this, arguments); }
    return this;
  }

  OnGetFocus(fByMouse) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ListBox && ListBox.prototype instanceof $c) return $c.prototype.OnGetFocus.apply(this, arguments); }
    Control.prototype.OnGetFocus.call(this, fByMouse);
    if (this.pSelectedItem == null && this.pClientWindow != null && !fByMouse) {
      this.pSelectedItem = this.pClientWindow.GetFirstContained();
      this.SelectionChanged(false);
    }
  }

  CharIn(c) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ListBox && ListBox.prototype instanceof $c) return $c.prototype.CharIn.apply(this, arguments); }
    let pSel = this.GetSelectedItem();
    let pStartCheck = pSel;
    if (pSel != null) {
      pSel = Element.prototype.GetNext$v$c.call(pSel);
    }
    if (pSel == null) {
      pSel = this.GetFirst();
      if (pSel == null) {
        return false;
      }
    }
    while (pSel !== pStartCheck && !pSel.CheckNameHotkey(c)) {
      if (!((pSel = Element.prototype.GetNext$v$c.call(pSel)) != null)) {
        if (pStartCheck != null) {
          pSel = this.GetFirst();
        }
      }
    }
    if (pSel != null) {
      this.SelectEntry(pSel, true);
      return true;
    }
    return Control.prototype.CharIn.call(this, c);
  }

  AfterElementRemoval() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ListBox && ListBox.prototype instanceof $c) return $c.prototype.AfterElementRemoval.apply(this, arguments); }
    Container.prototype.AfterElementRemoval.call(this);
    this.UpdateElementPositions();
  }

  UpdateColumnCount() {
    if (this.iMultiColItemWidth !== 0 && this.pClientWindow != null) {
      this.iColCount = $max(this.pClientWindow.GetClientRect().Wdt / this.iMultiColItemWidth | 0, 1);
    } else {
      this.iColCount = 1;
    }
  }

  init(rtBounds, iMultiColItemWidth = 0) {
    super.init(rtBounds);
    this.iMultiColItemWidth = iMultiColItemWidth;
    this.iColCount = 1;
    this.pSelectedItem = null;
    this.pSelectionChangeHandler = null;
    this.pSelectionDblClickHandler = null;
    this.fDrawBackground = true;
    this.fDrawBorder = false;
    this.fSelectionDisabled = false;
    this.$dyn = ListBox;
    this.UpdateOwnPos();
    this.pClientWindow = new ScrollWindow().init(this);
    ListBox.prototype.UpdateColumnCount.call(this);
    this.pKeyContext$ListBox = new $.C4KeyBinding().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(127), S("GUIListBoxContext"), 2 /*KEYSCOPE_Gui*/, new ControlKeyCB$ListBox().init(this, "KeyContext"), 3);
    let keys = [];
    $vpush(keys, new $.C4KeyCodeEx().init(103));
    if ($.Config.Controls.GamepadGuiControl !== 0) {
      $.Up(keys);
    }
    this.pKeyUp = new $.C4KeyBinding().init$vector$pi8$i32$pC4KeyboardCallbackInterface$u32(keys, S("GUIListBoxUp"), 2 /*KEYSCOPE_Gui*/, new ControlKeyCB$ListBox().init(this, "KeyUp$v"), 3);
    keys.length = 0;
    $vpush(keys, new $.C4KeyCodeEx().init(108));
    if ($.Config.Controls.GamepadGuiControl !== 0) {
      $.Down(keys);
    }
    this.pKeyDown = new $.C4KeyBinding().init$vector$pi8$i32$pC4KeyboardCallbackInterface$u32(keys, S("GUIListBoxDown"), 2 /*KEYSCOPE_Gui*/, new ControlKeyCB$ListBox().init(this, "KeyDown$v"), 3);
    keys.length = 0;
    $vpush(keys, new $.C4KeyCodeEx().init(105));
    if ($.Config.Controls.GamepadGuiControl !== 0) {
      $.Left(keys);
    }
    this.pKeyLeft = new $.C4KeyBinding().init$vector$pi8$i32$pC4KeyboardCallbackInterface$u32(keys, S("GUIListBoxLeft"), 2 /*KEYSCOPE_Gui*/, new ControlKeyCB$ListBox().init(this, "KeyLeft"), 3);
    keys.length = 0;
    $vpush(keys, new $.C4KeyCodeEx().init(106));
    if ($.Config.Controls.GamepadGuiControl !== 0) {
      $.Right(keys);
    }
    this.pKeyRight = new $.C4KeyBinding().init$vector$pi8$i32$pC4KeyboardCallbackInterface$u32(keys, S("GUIListBoxRight"), 2 /*KEYSCOPE_Gui*/, new ControlKeyCB$ListBox().init(this, "KeyRight"), 3);
    this.pKeyPageUp = new $.C4KeyBinding().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(104), S("GUIListBoxPageUp"), 2 /*KEYSCOPE_Gui*/, new ControlKeyCB$ListBox().init(this, "KeyPageUp"), 3);
    this.pKeyPageDown = new $.C4KeyBinding().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(109), S("GUIListBoxPageDown"), 2 /*KEYSCOPE_Gui*/, new ControlKeyCB$ListBox().init(this, "KeyPageDown"), 3);
    this.pKeyHome = new $.C4KeyBinding().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(102), S("GUIListBoxHome"), 2 /*KEYSCOPE_Gui*/, new ControlKeyCB$ListBox().init(this, "KeyHome"), 3);
    this.pKeyEnd = new $.C4KeyBinding().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(107), S("GUIListBoxEnd"), 2 /*KEYSCOPE_Gui*/, new ControlKeyCB$ListBox().init(this, "KeyEnd"), 3);
    keys.length = 0;
    $vpush(keys, new $.C4KeyCodeEx().init(28));
    $vpush(keys, new $.C4KeyCodeEx().init(28, 1 /*KEYS_Alt*/));
    if ($.Config.Controls.GamepadGuiControl !== 0) {
      $.Ok(keys);
    }
    this.pKeyActivate = new $.C4KeyBinding().init$vector$pi8$i32$pC4KeyboardCallbackInterface$u32(keys, S("GUIListActivate"), 2 /*KEYSCOPE_Gui*/, new ControlKeyCB$ListBox().init(this, "KeyActivate"), 3);
    return this;
  }

  $dtor() {
    $delete(this.pKeyActivate);
    $delete(this.pKeyEnd);
    $delete(this.pKeyHome);
    $delete(this.pKeyPageDown);
    $delete(this.pKeyPageUp);
    $delete(this.pKeyRight);
    $delete(this.pKeyLeft);
    $delete(this.pKeyDown);
    $delete(this.pKeyUp);
    $delete(this.pKeyContext$ListBox);
    if (this.pSelectionDblClickHandler != null) {
      this.pSelectionDblClickHandler.DeRef();
    }
    if (this.pSelectionChangeHandler != null) {
      this.pSelectionChangeHandler.DeRef();
    }
    super.$dtor();
  }

  MouseInput$rCMouse$i32$i32$i32$u32(rMouse, iButton, iX, iY, dwKeyParam) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ListBox && ListBox.prototype instanceof $c) return $c.prototype.MouseInput$rCMouse$i32$i32$i32$u32.apply(this, arguments); }
    Control.prototype.MouseInput$rCMouse$i32$i32$i32$u32.call(this, rMouse, iButton, iX, iY, dwKeyParam);
    if (this.pClientWindow != null) {
      if (this.pClientWindow.GetBounds().Contains$i32$i32(iX, iY)) {
        if (iButton === 1 || iButton === 5) {
          let pPrevSelectedItem = this.pSelectedItem;
          this.pSelectedItem = null;
          iX = iX - this.GetMarginLeft() | 0;
          iY = iY - this.GetMarginTop() | 0;
          iY = iY + this.pClientWindow.GetScrollY() | 0;
          for (let pCurr = Container.prototype.GetFirst.call(this.pClientWindow); pCurr != null; pCurr = Element.prototype.GetNext$v$c.call(pCurr)) {
            if (pCurr.GetBounds().Contains$i32$i32(iX, iY)) {
              this.pSelectedItem = pCurr;
            }
          }
          if (this.pSelectedItem !== pPrevSelectedItem) {
            this.SelectionChanged(true);
          }
          if (iButton === 5 && this.pSelectedItem != null) {
            if (this.pSelectionDblClickHandler != null) {
              this.pSelectionDblClickHandler.DoCall$pElement(this.pSelectedItem);
            }
          }
        }
      }
    }
  }

  RemoveElement(pChild) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ListBox && ListBox.prototype instanceof $c) return $c.prototype.RemoveElement.apply(this, arguments); }
    Container.prototype.RemoveElement.call(this, pChild);
    if (pChild === this.pSelectedItem) {
      this.pSelectedItem = null;
      this.SelectionChanged(false);
    }
  }

  AddElement$pElement$i32(pChild, iIndent = 0) {
    let $t1;
    if (this.pClientWindow == null) {
      return false;
    }
    Container.prototype.AddElement$pElement.call(this.pClientWindow, pChild);
    const rcChildBounds = pChild.GetBounds();
    rcChildBounds.x = iIndent;
    rcChildBounds.Wdt = this.GetItemWidth() - iIndent | 0;
    if (pChild.GetPrev() != null) {
      if (this.iMultiColItemWidth !== 0) {
        rcChildBounds.y = pChild.GetPrev().GetBounds().y;
        let col = (pChild.GetPrev().GetBounds().x / this.iMultiColItemWidth | 0) + 1 | 0;
        if (col >= this.iColCount) {
          col = 0;
          let cnt = this.iColCount;
          let iPrevLineHgt = 0;
          let pPrevChild = pChild.GetPrev();
          while (($t1 = cnt, cnt = cnt - 1 | 0, $t1) !== 0 && pPrevChild != null) {
            iPrevLineHgt = $max(iPrevLineHgt, pPrevChild.GetBounds().Hgt);
            pPrevChild = pPrevChild.GetPrev();
          }
          rcChildBounds.y = rcChildBounds.y + iPrevLineHgt | 0;
        }
        rcChildBounds.x = Math.imul(col, this.iMultiColItemWidth);
      } else {
        rcChildBounds.y = (pChild.GetPrev().GetBounds().y + pChild.GetPrev().GetBounds().Hgt | 0) + pChild.GetListItemTopSpacing() | 0;
      }
    } else {
      rcChildBounds.y = 0;
    }
    pChild.UpdateOwnPos();
    this.pClientWindow.SetClientHeight(rcChildBounds.y + rcChildBounds.Hgt | 0);
    return true;
  }

  InsertElement$pElement$pElement$i32(pChild, pInsertBefore, iIndent = 0) {
    if (this.pClientWindow == null) {
      return false;
    }
    Container.prototype.InsertElement$pElement$pElement.call(this.pClientWindow, pChild, pInsertBefore);
    const rcChildBounds = pChild.GetBounds();
    rcChildBounds.x = iIndent;
    rcChildBounds.Wdt = this.GetItemWidth() - iIndent | 0;
    pChild.UpdateOwnPos();
    this.UpdateElementPositions();
    return true;
  }

  ElementSizeChanged(pOfElement) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ListBox && ListBox.prototype instanceof $c) return $c.prototype.ElementSizeChanged.apply(this, arguments); }
    if (pOfElement.GetParent() === this) {
      Container.prototype.ElementSizeChanged.call(this, pOfElement);
      this.UpdateColumnCount();
    }
    this.UpdateElementPositions();
  }

  ElementPosChanged(pOfElement) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ListBox && ListBox.prototype instanceof $c) return $c.prototype.ElementPosChanged.apply(this, arguments); }
    if (pOfElement.GetParent() === this) {
      Container.prototype.ElementSizeChanged.call(this, pOfElement);
    }
    this.UpdateElementPositions();
  }

  GetItemWidth() {
    return this.iMultiColItemWidth !== 0 ? this.iMultiColItemWidth : this.pClientWindow.GetClientRect().Wdt;
  }

  SelectionChanged(fByUser) {
    if (this.fSelectionDisabled) {
      this.pSelectedItem = null;
      return;
    }
    if (this.pSelectedItem != null) {
      if (fByUser) {
        GUISound(S("UI::Select"));
      }
    }
    if (this.pSelectionChangeHandler != null) {
      this.pSelectionChangeHandler.DoCall$pElement(this.pSelectedItem);
    }
    if (this.pSelectedItem != null) {
      this.ScrollItemInView(this.pSelectedItem);
    }
  }

  SetSelectionChangeCallbackFn(pToHandler) {
    if (this.pSelectionChangeHandler != null) {
      this.pSelectionChangeHandler.DeRef();
    }
    if ((this.pSelectionChangeHandler = pToHandler) != null) {
      pToHandler.Ref();
    }
  }

  SetSelectionDblClickFn(pToHandler) {
    if (this.pSelectionDblClickHandler != null) {
      this.pSelectionDblClickHandler.DeRef();
    }
    if ((this.pSelectionDblClickHandler = pToHandler) != null) {
      this.pSelectionDblClickHandler.Ref();
    }
  }

  ScrollToBottom() {
    if (this.pClientWindow != null) {
      this.pClientWindow.ScrollToBottom();
    }
  }

  ScrollItemInView(pItem) {
    if (pItem == null) {
      return;
    }
    this.pClientWindow.ScrollRangeInView(pItem.GetBounds().y, pItem.GetBounds().Hgt);
  }

  FreezeScrolling() {
    this.pClientWindow.Freeze();
  }

  UnFreezeScrolling() {
    this.pClientWindow.UnFreeze();
  }

  SetDecoration$b$pScrollBarFacets$b$b(fDrawBG, pToGfx, fAutoScroll, fDrawBorder = false) {
    this.fDrawBackground = fDrawBG;
    this.fDrawBorder = fDrawBorder;
    if (this.pClientWindow != null) {
      this.pClientWindow.SetDecoration$pScrollBarFacets$b(pToGfx, fAutoScroll);
    }
  }

  SetSelectionDiabled(fToVal = true) {
    this.fSelectionDisabled = fToVal;
  }

  GetFirst() {
    return this.pClientWindow != null ? Container.prototype.GetFirst.call(this.pClientWindow) : null;
  }

  GetLast() {
    return this.pClientWindow != null ? Container.prototype.GetLast.call(this.pClientWindow) : null;
  }

  GetMarginTop() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ListBox && ListBox.prototype instanceof $c) return $c.prototype.GetMarginTop.apply(this, arguments); }
    return 3;
  }

  GetMarginLeft() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ListBox && ListBox.prototype instanceof $c) return $c.prototype.GetMarginLeft.apply(this, arguments); }
    return 3;
  }

  GetMarginRight() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ListBox && ListBox.prototype instanceof $c) return $c.prototype.GetMarginRight.apply(this, arguments); }
    return 3;
  }

  GetMarginBottom() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ListBox && ListBox.prototype instanceof $c) return $c.prototype.GetMarginBottom.apply(this, arguments); }
    return 3;
  }

  GetSelectedItem() {
    return this.pSelectedItem;
  }

  IsScrollingActive() {
    return this.pClientWindow != null && this.pClientWindow.IsScrollingActive();
  }

  IsScrollingNecessary() {
    return this.pClientWindow != null && this.pClientWindow.IsScrollingNecessary();
  }

  SelectEntry(pNewSel, fByUser) {
    0;
    if (this.pSelectedItem === pNewSel) {
      return;
    }
    this.pSelectedItem = pNewSel;
    this.SelectionChanged(fByUser);
  }

  SelectFirstEntry(fByUser) {
    this.SelectEntry(this.GetFirst(), fByUser);
  }

  SelectNone(fByUser) {
    this.SelectEntry(null, fByUser);
  }

  IsMultiColumn() {
    return this.iColCount > 1;
  }

  ContractToElementHeight() {
    if (this.pClientWindow == null) {
      return 0;
    }
    let iExtraSpace = this.pClientWindow.GetBounds().Hgt - this.pClientWindow.GetClientRect().Hgt | 0;
    if (iExtraSpace <= 0) {
      return 0;
    }
    let rcNewBounds = this.GetBounds().$clone();
    rcNewBounds.Hgt = rcNewBounds.Hgt - iExtraSpace | 0;
    this.SetBounds(rcNewBounds);
    return iExtraSpace;
  }

  UpdateElementPositions() {
    if (this.pClientWindow == null) {
      return;
    }
    let pCurr = Container.prototype.GetFirst.call(this.pClientWindow);
    let iOverallHgt = 0;
    if (pCurr != null) {
      if (this.iMultiColItemWidth === 0) {
        if (pCurr.GetBounds().y !== 0) {
          pCurr.GetBounds().y = 0;
          pCurr.UpdateOwnPos();
        }
        if (pCurr.fVisible) {
          iOverallHgt = pCurr.GetBounds().Hgt;
        } else {
          iOverallHgt = 0;
        }
        while ((pCurr = Element.prototype.GetNext$v$c.call(pCurr)) != null) {
          if (!pCurr.fVisible) {
            continue;
          }
          let iYSpace = pCurr.GetListItemTopSpacing();
          let iNewY = iOverallHgt + iYSpace | 0;
          iOverallHgt = iOverallHgt + (pCurr.GetBounds().Hgt + iYSpace | 0) | 0;
          if (iNewY !== pCurr.GetBounds().y) {
            pCurr.GetBounds().y = iNewY;
            pCurr.UpdateOwnPos();
          }
        }
      } else {
        let y = 0;
        let iLineHgt = 0;
        let col = 0;
        for (; pCurr != null; pCurr = Element.prototype.GetNext$v$c.call(pCurr)) {
          const rcCurrBounds = pCurr.GetBounds();
          iLineHgt = $max(rcCurrBounds.Hgt, iLineHgt);
          let x = Math.imul(col, this.iMultiColItemWidth);
          if (rcCurrBounds.x !== x || rcCurrBounds.y !== y || rcCurrBounds.Wdt !== this.iMultiColItemWidth) {
            pCurr.SetBounds(new $.C4Rect().init$i32$i32$i32$i32(x, y, this.iMultiColItemWidth, rcCurrBounds.Hgt));
          }
          if ((col = col + 1 | 0) >= this.iColCount) {
            col = 0;
            y = y + iLineHgt | 0;
          }
        }
        iOverallHgt = y + iLineHgt | 0;
      }
    } else {
      iOverallHgt = 0;
    }
    this.pClientWindow.SetClientHeight(iOverallHgt);
  }

  UpdateElementPosition(pOfElement, iIndent) {
    const rcChildBounds = pOfElement.GetBounds();
    rcChildBounds.x = iIndent;
    rcChildBounds.Wdt = this.GetItemWidth() - iIndent | 0;
    pOfElement.UpdateOwnPos();
    this.UpdateElementPositions();
  }

  UpdateSize() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ListBox && ListBox.prototype instanceof $c) return $c.prototype.UpdateSize.apply(this, arguments); }
    Element.prototype.UpdateSize.call(this);
    if (this.pClientWindow != null) {
      this.pClientWindow.UpdateSize();
      this.UpdateElementPositions();
    }
  }

  IsSelectedChild(pChild) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ListBox && ListBox.prototype instanceof $c) return $c.prototype.IsSelectedChild.apply(this, arguments); }
    return pChild === this.pSelectedItem || this.pSelectedItem != null && this.pSelectedItem.IsParentOf(pChild);
  }

  SortElements(SortFunc, par) {
    let $t1;
    if (this.pClientWindow == null) {
      return;
    }
    let iElemCount = this.pClientWindow.GetElementCount();
    if (iElemCount <= 1) {
      return;
    }
    let ppElements = P(new Array($u64n(iElemCount)).fill(null), 0);
    try {
      let i = 0;
      for (let pEl = Container.prototype.GetFirst.call(this.pClientWindow); pEl != null; pEl = Element.prototype.GetNext$v$c.call(pEl)) {
        ppElements.a[ppElements.o + ($t1 = i, i = i + 1 | 0, $t1)] = pEl;
      }
      std_sort(ppElements, $padd(ppElements, iElemCount), new $.SortCompareElements().init(SortFunc, par));
      for (i = 0; i < iElemCount; i = i + 1 | 0) {
        this.pClientWindow.ReaddElement(ppElements.a[ppElements.o + i]);
      }
    } catch ($e1) {
      {
        $delete(ppElements);
        $throw($e1);
      }
    }
    $delete(ppElements);
    this.UpdateElementPositions();
  }

  $clone() { return new ListBox().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pKeyContext$ListBox = o.pKeyContext$ListBox;
    this.pKeyUp = o.pKeyUp;
    this.pKeyDown = o.pKeyDown;
    this.pKeyPageUp = o.pKeyPageUp;
    this.pKeyPageDown = o.pKeyPageDown;
    this.pKeyHome = o.pKeyHome;
    this.pKeyEnd = o.pKeyEnd;
    this.pKeyActivate = o.pKeyActivate;
    this.pKeyLeft = o.pKeyLeft;
    this.pKeyRight = o.pKeyRight;
    this.iMultiColItemWidth = o.iMultiColItemWidth;
    this.iColCount = o.iColCount;
    this.pClientWindow = o.pClientWindow;
    this.pSelectedItem = o.pSelectedItem;
    this.pSelectionChangeHandler = o.pSelectionChangeHandler;
    this.pSelectionDblClickHandler = o.pSelectionDblClickHandler;
    this.fDrawBackground = o.fDrawBackground;
    this.fDrawBorder = o.fDrawBorder;
    this.fSelectionDisabled = o.fSelectionDisabled;
    return this;
  }
}

export class Tabular extends Control {
  pActiveSheet = null;
  eTabPos = 0;
  iMaxTabWidth = 0;
  iSheetSpacing = 0;
  iSheetOff = 0;
  iCaptionLengthTotal = 0;
  iCaptionScrollPos = 0;
  fScrollingLeft = false;
  fScrollingRight = false;
  fScrollingLeftDown = false;
  fScrollingRightDown = false;
  tLastScrollTime = new $.C4TimeMilliseconds();
  iSheetMargin = 0;
  fDrawSelf = false;
  pfctBack = null;
  pfctClip = null;
  pfctIcons = null;
  pSheetCaptionFont = null;
  pKeySelUp = null;
  pKeySelDown = null;
  pKeySelUp2 = null;
  pKeySelDown2 = null;
  pKeyCloseTab = null;

  SelectionChanged(fByUser) {
    let pFocusCtrl = null;
    let pDlg = this.GetDlg();
    if (pDlg != null) {
      pFocusCtrl = pDlg.GetFocus();
    }
    if (this.pActiveSheet != null) {
      if (fByUser) {
        GUISound(S("UI::Select"));
      }
      this.pActiveSheet.OnShown$b(fByUser);
    }
    for (let pSheet = Container.prototype.GetFirst.call(this); pSheet != null; pSheet = Element.prototype.GetNext$v$c.call(pSheet)) {
      pSheet.SetVisibility(pSheet === this.pActiveSheet);
    }
    if (pFocusCtrl != null && !(pDlg.GetFocus() != null)) {
      pDlg.SetFocus(pDlg.GetDefaultControl(), fByUser);
    }
  }

  SheetsChanged() {
    let $t1;
    let pSheet = null;
    if (this.eTabPos !== 0) {
      this.iSheetOff = 20;
      this.iMaxTabWidth = 20;
      this.iSheetSpacing = this.eTabPos === 2 ? -10 : 20;
      let iSheetNum = 0;
      let iTotalHgt = this.iSheetOff;
      this.iCaptionLengthTotal = this.iSheetOff;
      for (pSheet = Container.prototype.GetFirst.call(this); pSheet != null; pSheet = Element.prototype.GetNext$v$c.call(pSheet)) {
        const iTabWidth = [0];
        const iTabHeight = [0];
        pSheet.GetCaptionSize(P(iTabWidth, 0), P(iTabHeight, 0), this.HasLargeCaptions(), pSheet === this.pActiveSheet, this.pfctClip, this.pfctIcons, this.pSheetCaptionFont);
        iTabWidth[0] = iTabWidth[0] + (this.eTabPos === 2 ? 20 : this.iSheetSpacing) | 0;
        this.iMaxTabWidth = $max(iTabWidth[0], this.iMaxTabWidth);
        if (this.eTabPos === 2) {
          iTotalHgt = iTotalHgt + iTabHeight[0] | 0;
          if (($t1 = iSheetNum, iSheetNum = iSheetNum + 1 | 0, $t1) !== 0) {
            iTotalHgt = iTotalHgt + this.iSheetSpacing | 0;
          }
        } else {
          this.iCaptionLengthTotal = this.iCaptionLengthTotal + iTabWidth[0] | 0;
        }
      }
      if (this.eTabPos === 2 && iTotalHgt > (this.rcBounds.Hgt - this.GetMarginBottom() | 0)) {
        this.iSheetSpacing = this.iSheetSpacing - ((((iTotalHgt - this.rcBounds.Hgt | 0) + this.GetMarginBottom() | 0) - this.iSheetOff | 0) / iSheetNum | 0) | 0;
        this.iSheetOff = 0;
      } else if (this.eTabPos === 1) {
      }
    }
    this.UpdateSize();
    this.UpdateScrolling();
  }

  UpdateScrolling() {
    let iAvailableTabSpace = this.rcBounds.Wdt;
    let iScrollPinSize = this.GetTopSize();
    if (this.eTabPos !== 1 || this.iCaptionLengthTotal <= iAvailableTabSpace || iAvailableTabSpace <= Math.imul(iScrollPinSize, 2)) {
      this.fScrollingLeft = this.fScrollingRight = this.fScrollingLeftDown = this.fScrollingRightDown = false;
      this.iCaptionScrollPos = 0;
    } else {
      this.fScrollingLeft = !(this.iCaptionScrollPos === 0);
      if (!this.fScrollingLeft) {
        this.fScrollingRight = true;
        this.fScrollingLeftDown = false;
      } else {
        iAvailableTabSpace = iAvailableTabSpace - iScrollPinSize | 0;
        this.fScrollingRight = (this.iCaptionLengthTotal - this.iCaptionScrollPos | 0) > iAvailableTabSpace;
        if (!this.fScrollingRight) {
          this.iCaptionScrollPos = this.iCaptionLengthTotal - iAvailableTabSpace | 0;
          this.fScrollingRightDown = false;
        }
      }
    }
  }

  DoCaptionScroll(iDir) {
    this.tLastScrollTime.$assign($.C4TimeMilliseconds.Now());
    let iAvailableTabSpace = this.rcBounds.Wdt;
    let iScrollPinSize = this.GetTopSize();
    this.iCaptionScrollPos = $.Clamp$i32$i32$i32(this.iCaptionScrollPos + (Math.imul(iDir, iAvailableTabSpace) / 2 | 0) | 0, 0, (this.iCaptionLengthTotal - iAvailableTabSpace | 0) + iScrollPinSize | 0);
    this.UpdateScrolling();
  }

  HasGfx() {
    return this.pfctBack != null && this.pfctClip != null && this.pfctIcons != null;
  }

  KeySelUp() {
    let iNewSel = this.GetActiveSheetIndex() - 1 | 0;
    if (iNewSel < 0) {
      iNewSel = this.GetSheetCount() - 1 | 0;
    }
    if (iNewSel < 0) {
      return false;
    }
    this.SelectSheet$i32$b(iNewSel, true);
    return true;
  }

  KeySelDown() {
    let iNewSel = this.GetActiveSheetIndex() + 1 | 0;
    let iSheetCount = this.GetSheetCount();
    if (iNewSel >= iSheetCount) {
      if (iSheetCount === 0) {
        return false;
      } else {
        iNewSel = 0;
      }
    }
    this.SelectSheet$i32$b(iNewSel, true);
    return true;
  }

  KeyCloseTab() {
    let pCurrentSheet = this.GetActiveSheet();
    if (pCurrentSheet == null) {
      return false;
    }
    if (!pCurrentSheet.HasCloseButton()) {
      return false;
    }
    pCurrentSheet.UserClose$v();
    return true;
  }

  DrawElement(cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Tabular && Tabular.prototype instanceof $c) return $c.prototype.DrawElement.apply(this, arguments); }
    if (!this.fDrawSelf) {
      return;
    }
    let fGfx = this.HasGfx();
    let fCaptionScrollDelayOver = $.op_sub$C4TimeMilliseconds$C4TimeMilliseconds($.C4TimeMilliseconds.Now(), this.tLastScrollTime) >= 500;
    if ((this.fScrollingLeftDown || this.fScrollingRightDown) && fCaptionScrollDelayOver) {
      this.DoCaptionScroll((this.fScrollingRightDown ? 1 : 0) - (this.fScrollingLeftDown ? 1 : 0) | 0);
    }
    if (!fGfx) {
      this.Draw3DFrame(cgo, false, 1, 175, this.eTabPos !== 1, this.GetTopSize(), this.eTabPos !== 2, this.GetLeftSize());
    }
    let x0 = ftoi32(Math.fround(Math.fround(cgo.TargetX + Math.fround(this.rcBounds.x)) + Math.fround(this.GetLeftSize())));
    let y0 = ftoi32(Math.fround(Math.fround(cgo.TargetY + Math.fround(this.rcBounds.y)) + Math.fround(this.GetTopSize())));
    let x1 = ftoi32(Math.fround(Math.fround(Math.fround(cgo.TargetX + Math.fround(this.rcBounds.x)) + Math.fround(this.rcBounds.Wdt)) - Math.fround(1)));
    let y1 = ftoi32(Math.fround(Math.fround(Math.fround(cgo.TargetY + Math.fround(this.rcBounds.y)) + Math.fround(this.rcBounds.Hgt)) - Math.fround(1)));
    if (!fGfx) {
      $.pDraw.DrawBoxDw(cgo.Surface, x0, y0, x1, y1, 0x9f000000);
    }
    if (this.eTabPos === 0) {
      if (fGfx) {
        this.pfctBack.DrawX(cgo.Surface, Math.fround(x0), Math.fround(y0), Math.fround((x1 - x0 | 0) + 1 | 0), Math.fround((y1 - y0 | 0) + 1 | 0));
      }
      return;
    }
    let fLeft = this.eTabPos === 2;
    let d = (fLeft ? y0 : x0) + this.iSheetOff | 0;
    let ad0 = 0;
    let ad1 = 0;
    let aCptTxX = 0;
    let aCptTxY = 0;
    let iScrollSize = this.GetTopSize();
    if (this.fScrollingLeft) {
      d = d - (this.iCaptionScrollPos + iScrollSize | 0) | 0;
    }
    for (let pSheet = Container.prototype.GetFirst.call(this); pSheet != null; pSheet = Element.prototype.GetNext$v$c.call(pSheet)) {
      const iTabWidth = [0];
      const iTabHeight = [0];
      pSheet.GetCaptionSize(P(iTabWidth, 0), P(iTabHeight, 0), this.HasLargeCaptions(), pSheet === this.pActiveSheet, this.pfctClip, this.pfctIcons, this.pSheetCaptionFont);
      iTabWidth[0] = iTabWidth[0] + (fLeft ? 20 : this.iSheetSpacing) | 0;
      iTabHeight[0] = iTabHeight[0] + (fLeft ? this.iSheetSpacing : 10) | 0;
      if (!fGfx) {
        const vtx = new Float32Array(8);
        if (fLeft) {
          vtx[0] = Math.fround(x0);
          vtx[1] = Math.fround(d);
          vtx[2] = Math.fround(x0 - this.GetLeftSize() | 0);
          vtx[3] = Math.fround(d);
          vtx[4] = Math.fround(x0 - this.GetLeftSize() | 0);
          vtx[5] = Math.fround(d + iTabHeight[0] | 0);
          vtx[6] = Math.fround(x0);
          vtx[7] = Math.fround(d + iTabHeight[0] | 0);
        } else {
          vtx[0] = Math.fround(d + 1 | 0);
          vtx[1] = Math.fround(y0);
          vtx[2] = Math.fround((d + 4 | 0) + 1 | 0);
          vtx[3] = Math.fround(y0 - this.GetTopSize() | 0);
          vtx[4] = Math.fround((d + iTabWidth[0] | 0) - 4 | 0);
          vtx[5] = Math.fround(y0 - this.GetTopSize() | 0);
          vtx[6] = Math.fround(d + iTabWidth[0] | 0);
          vtx[7] = Math.fround(y0);
        }
        let dwClr = pSheet === this.pActiveSheet ? 0x9f000000 : 0x9f000000;
        $.pDraw.DrawQuadDw(cgo.Surface, P(vtx, 0), dwClr, dwClr, dwClr, dwClr, null);
        $.pDraw.DrawLineDw(cgo.Surface, Math.fround(vtx[0] - Math.fround(1)), vtx[1], Math.fround(vtx[2] - Math.fround(1)), vtx[3], 0x4f772200);
        $.pDraw.DrawLineDw(cgo.Surface, Math.fround(vtx[2] - Math.fround(1)), vtx[3], Math.fround(vtx[4] - Math.fround(fLeft ? 1 : 0)), vtx[5], 0x4f772200);
        $.pDraw.DrawLineDw(cgo.Surface, vtx[4], vtx[5], vtx[6], vtx[7], 0x4f772200);
        $.pDraw.DrawLineDw(cgo.Surface, vtx[0], Math.fround(vtx[1] + Math.fround(fLeft ? 1 : 0)), vtx[2], Math.fround(vtx[3] + Math.fround(fLeft ? 1 : 0)), 0x4f331100);
        $.pDraw.DrawLineDw(cgo.Surface, Math.fround(vtx[2] - Math.fround(!fLeft ? 1 : 0)), Math.fround(vtx[3] + Math.fround(1)), vtx[4], Math.fround(vtx[5] + Math.fround(!fLeft ? 1 : 0)), 0x4f331100);
        $.pDraw.DrawLineDw(cgo.Surface, Math.fround(vtx[4] + Math.fround(1)), Math.fround(vtx[5] + Math.fround(fLeft ? 1 : 0)), vtx[6], Math.fround(vtx[7] + Math.fround(fLeft ? 1 : 0)), 0x4f331100);
      }
      let iCptTextX = fLeft ? (x0 - this.GetLeftSize() | 0) + 10 | 0 : d + (iTabWidth[0] / 2 | 0) | 0;
      let iCptTextY = fLeft ? d + (this.iSheetSpacing / 2 | 0) | 0 : (y0 - this.GetTopSize() | 0) + 2 | 0;
      if (pSheet === this.pActiveSheet) {
        ad0 = d;
        ad1 = d + (fLeft ? iTabHeight[0] : iTabWidth[0]) | 0;
        aCptTxX = iCptTextX;
        aCptTxY = iCptTextY;
        if (!fGfx) {
          pSheet.DrawCaption(cgo, iCptTextX, iCptTextY, this.iMaxTabWidth, fLeft, true, this.HasDrawFocus(), null, null, null);
        }
      } else {
        pSheet.DrawCaption(cgo, iCptTextX, iCptTextY, this.iMaxTabWidth, fLeft, false, false, this.pfctClip, this.pfctIcons, this.pSheetCaptionFont);
      }
      d = d + ((fLeft ? iTabHeight[0] : iTabWidth[0]) + 2 | 0) | 0;
    }
    if (!fGfx) {
      if (ad0 !== 0 || ad1 !== 0) {
        $.pDraw.DrawLineDw(cgo.Surface, Math.fround(x0), Math.fround(y0), Math.fround(fLeft ? x0 : ad0), Math.fround(fLeft ? ad0 : y0), 0x4f772200);
        $.pDraw.DrawLineDw(cgo.Surface, Math.fround(x0 + 1 | 0), Math.fround(y0 + 1 | 0), Math.fround((fLeft ? x0 : ad0) + 1 | 0), Math.fround((fLeft ? ad0 : y0) + 1 | 0), 0x4f331100);
        $.pDraw.DrawLineDw(cgo.Surface, Math.fround(fLeft ? x0 : ad1), Math.fround(fLeft ? ad1 : y0), Math.fround(fLeft ? x0 : x1), Math.fround(fLeft ? y1 : y0), 0x4f772200);
        $.pDraw.DrawLineDw(cgo.Surface, Math.fround((fLeft ? x0 : ad1) + 1 | 0), Math.fround((fLeft ? ad1 : y0) + 1 | 0), Math.fround((fLeft ? x0 : x1) + 1 | 0), Math.fround((fLeft ? y1 : y0) + 1 | 0), 0x4f331100);
      }
    }
    if (fGfx) {
      this.pfctBack.DrawX(cgo.Surface, Math.fround(x0), Math.fround(y0), Math.fround((x1 - x0 | 0) + 1 | 0), Math.fround((y1 - y0 | 0) + 1 | 0));
      if (this.pActiveSheet != null) {
        this.pActiveSheet.DrawCaption(cgo, aCptTxX, aCptTxY, this.iMaxTabWidth, fLeft, true, this.HasDrawFocus(), this.pfctClip, this.pfctIcons, this.pSheetCaptionFont);
      }
    }
    if (this.fScrollingLeft) {
      $.GraphicsResource.fctBigArrows.DrawX(cgo.Surface, Math.fround(x0 + this.iSheetOff | 0), Math.fround(y0 - iScrollSize | 0), Math.fround(iScrollSize), Math.fround(iScrollSize), Math.imul(this.fScrollingLeftDown ? 1 : 0, 2));
    }
    if (this.fScrollingRight) {
      $.GraphicsResource.fctBigArrows.DrawX(cgo.Surface, Math.fround(x1 - iScrollSize | 0), Math.fround(y0 - iScrollSize | 0), Math.fround(iScrollSize), Math.fround(iScrollSize), 1 + Math.imul(this.fScrollingRightDown ? 1 : 0, 2) | 0);
    }
  }

  MouseLeaveCaptionArea() {
    for (let pSheet = Container.prototype.GetFirst.call(this); pSheet != null; pSheet = Element.prototype.GetNext$v$c.call(pSheet)) {
      pSheet.SetCloseButtonHighlight(false);
    }
    if (this.fScrollingLeftDown || this.fScrollingRightDown) {
      GUISound(S("UI::Select"));
      this.fScrollingLeftDown = this.fScrollingRightDown = false;
    }
  }

  MouseLeave(rMouse) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Tabular && Tabular.prototype instanceof $c) return $c.prototype.MouseLeave.apply(this, arguments); }
    this.MouseLeaveCaptionArea();
    Element.prototype.MouseLeave.call(this, rMouse);
  }

  OnGetFocus(fByMouse) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Tabular && Tabular.prototype instanceof $c) return $c.prototype.OnGetFocus.apply(this, arguments); }
    Control.prototype.OnGetFocus.call(this, fByMouse);
  }

  IsFocusElement() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Tabular && Tabular.prototype instanceof $c) return $c.prototype.IsFocusElement.apply(this, arguments); }
    return this.eTabPos !== 0 ? this : null;
  }

  IsFocusOnClick() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Tabular && Tabular.prototype instanceof $c) return $c.prototype.IsFocusOnClick.apply(this, arguments); }
    return false;
  }

  GetTopSize() {
    return this.eTabPos === 1 ? 20 : 0;
  }

  GetLeftSize() {
    return this.eTabPos === 2 ? this.HasGfx() ? Tabular.GetLeftClipSize(this.pfctClip) : 20 + this.iMaxTabWidth | 0 : 0;
  }

  HasLargeCaptions() {
    return this.eTabPos === 2;
  }

  GetMarginTop() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Tabular && Tabular.prototype instanceof $c) return $c.prototype.GetMarginTop.apply(this, arguments); }
    return (this.iSheetMargin + this.GetTopSize() | 0) + (this.HasGfx() ? Math.imul(this.rcBounds.Hgt - this.GetTopSize() | 0, 30) / 483 | 0 : 0) | 0;
  }

  GetMarginLeft() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Tabular && Tabular.prototype instanceof $c) return $c.prototype.GetMarginLeft.apply(this, arguments); }
    return (this.iSheetMargin + this.GetLeftSize() | 0) + (this.HasGfx() ? Math.imul(this.rcBounds.Wdt - this.GetLeftSize() | 0, 13) / 628 | 0 : 0) | 0;
  }

  GetMarginRight() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Tabular && Tabular.prototype instanceof $c) return $c.prototype.GetMarginRight.apply(this, arguments); }
    return this.iSheetMargin + (this.HasGfx() ? Math.imul(this.rcBounds.Wdt - this.GetLeftSize() | 0, 30) / 628 | 0 : 0) | 0;
  }

  GetMarginBottom() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Tabular && Tabular.prototype instanceof $c) return $c.prototype.GetMarginBottom.apply(this, arguments); }
    return this.iSheetMargin + (this.HasGfx() ? Math.imul(this.rcBounds.Hgt - this.GetTopSize() | 0, 32) / 483 | 0 : 0) | 0;
  }

  UpdateSize() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Tabular && Tabular.prototype instanceof $c) return $c.prototype.UpdateSize.apply(this, arguments); }
    Element.prototype.UpdateSize.call(this);
    for (let pSheet = Container.prototype.GetFirst.call(this); pSheet != null; pSheet = Element.prototype.GetNext$v$c.call(pSheet)) {
      pSheet.SetBounds(this.GetContainedClientRect());
    }
  }

  IsSelectedChild(pChild) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Tabular && Tabular.prototype instanceof $c) return $c.prototype.IsSelectedChild.apply(this, arguments); }
    return pChild === this.pActiveSheet || this.pActiveSheet != null && this.pActiveSheet.IsParentOf(pChild);
  }

  init(rtBounds, eTabPos) {
    super.init(rtBounds);
    this.pActiveSheet = null;
    this.eTabPos = eTabPos;
    this.iMaxTabWidth = 0;
    this.iCaptionLengthTotal = 0;
    this.iCaptionScrollPos = 0;
    this.fScrollingLeft = false;
    this.fScrollingRight = false;
    this.fScrollingLeftDown = false;
    this.fScrollingRightDown = false;
    this.tLastScrollTime = new $.C4TimeMilliseconds();
    this.iSheetMargin = 4;
    this.fDrawSelf = true;
    this.pfctBack = null;
    this.pfctClip = null;
    this.pfctIcons = null;
    this.pSheetCaptionFont = null;
    this.$dyn = Tabular;
    this.UpdateOwnPos();
    if (eTabPos !== 0) {
      let Keys = [];
      $vpush(Keys, new $.C4KeyCodeEx().init(103));
      if ($.Config.Controls.GamepadGuiControl !== 0) {
        $.Up(Keys);
      }
      this.pKeySelUp = new $.C4KeyBinding().init$vector$pi8$i32$pC4KeyboardCallbackInterface$u32(Keys, S("GUITabularSelUp"), 2 /*KEYSCOPE_Gui*/, new ControlKeyCB$Tabular().init(this, "KeySelUp"), 3);
      Keys.length = 0;
      $vpush(Keys, new $.C4KeyCodeEx().init(108));
      if ($.Config.Controls.GamepadGuiControl !== 0) {
        $.Down(Keys);
      }
      this.pKeySelDown = new $.C4KeyBinding().init$vector$pi8$i32$pC4KeyboardCallbackInterface$u32(Keys, S("GUITabularSelDown"), 2 /*KEYSCOPE_Gui*/, new ControlKeyCB$Tabular().init(this, "KeySelDown"), 3);
      this.pKeySelUp2 = new $.C4KeyBinding().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(15, 6), S("GUITabularSelUp2"), 2 /*KEYSCOPE_Gui*/, new DlgKeyCB$Tabular().init(this, "KeySelUp"), 3);
      this.pKeySelDown2 = new $.C4KeyBinding().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(15, 2), S("GUITabularSelDown2"), 2 /*KEYSCOPE_Gui*/, new DlgKeyCB$Tabular().init(this, "KeySelDown"), 3);
      this.pKeyCloseTab = new $.C4KeyBinding().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(62, 2), S("GUITabularCloseTab"), 2 /*KEYSCOPE_Gui*/, new DlgKeyCB$Tabular().init(this, "KeyCloseTab"), 3);
    } else {
      this.pKeySelUp = this.pKeySelDown = this.pKeySelUp2 = this.pKeySelDown2 = this.pKeyCloseTab = null;
    }
    Tabular.prototype.SheetsChanged.call(this);
    return this;
  }

  $dtor() {
    if (this.pKeyCloseTab != null) {
      $delete(this.pKeyCloseTab);
    }
    if (this.pKeySelDown2 != null) {
      $delete(this.pKeySelDown2);
    }
    if (this.pKeySelUp2 != null) {
      $delete(this.pKeySelUp2);
    }
    if (this.pKeySelDown != null) {
      $delete(this.pKeySelDown);
    }
    if (this.pKeySelUp != null) {
      $delete(this.pKeySelUp);
    }
    super.$dtor();
  }

  MouseInput$rCMouse$i32$i32$i32$u32(rMouse, iButton, iX, iY, dwKeyParam) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Tabular && Tabular.prototype instanceof $c) return $c.prototype.MouseInput$rCMouse$i32$i32$i32$u32.apply(this, arguments); }
    if (this.eTabPos !== 0) {
      let fLeft = this.eTabPos === 2;
      let fInCaptionArea = !fLeft && $.Inside$i32$i32$i32$3(iY, 0, this.GetTopSize()) || fLeft && $.Inside$i32$i32$i32$3(iX, 0, this.GetLeftSize());
      if (!fInCaptionArea || iButton === 2) {
        this.MouseLeaveCaptionArea();
      } else if ((iButton === 1 || iButton === 0) && fInCaptionArea) {
        let d = this.iSheetOff;
        let fProcessed = false;
        if (this.fScrollingLeft || this.fScrollingRight) {
          let iScrollSize = this.GetTopSize();
          if (iButton === 1 && this.fScrollingRight && $.Inside$i32$i32$i32$3(iX, this.rcBounds.Wdt - iScrollSize | 0, this.rcBounds.Wdt)) {
            fProcessed = this.fScrollingRightDown = true;
            GUISound(S("UI::Select"));
            this.DoCaptionScroll(1);
          } else if (this.fScrollingLeft) {
            if (iButton === 1 && $.Inside$i32$i32$i32$3(iX, d, d + iScrollSize | 0)) {
              fProcessed = this.fScrollingLeftDown = true;
              GUISound(S("UI::Select"));
              this.DoCaptionScroll(-1);
            }
            d = d - (this.iCaptionScrollPos + iScrollSize | 0) | 0;
          }
        }
        if (!fProcessed) {
          for (let pSheet = Container.prototype.GetFirst.call(this); pSheet != null; pSheet = Element.prototype.GetNext$v$c.call(pSheet)) {
            pSheet.SetCloseButtonHighlight(false);
            const iCaptWidth = [0];
            const iCaptHeight = [0];
            let iTabWidth = 0;
            let iTabHeight = 0;
            pSheet.GetCaptionSize(P(iCaptWidth, 0), P(iCaptHeight, 0), this.HasLargeCaptions(), pSheet === this.pActiveSheet, this.pfctClip, this.pfctIcons, this.pSheetCaptionFont);
            iTabWidth = iCaptWidth[0] + (fLeft ? 20 : this.iSheetSpacing) | 0;
            iTabHeight = iCaptHeight[0] + (fLeft ? this.iSheetSpacing : 10) | 0;
            if (!fLeft && $.Inside$i32$i32$i32$3(iX, d, d + iTabWidth | 0) || fLeft && $.Inside$i32$i32$i32$3(iY, d, d + iTabHeight | 0)) {
              if (pSheet.IsPosOnCloseButton((iX - Math.imul(d, !fLeft ? 1 : 0) | 0) - ((iTabWidth - iCaptWidth[0] | 0) / 2 | 0) | 0, iY - Math.imul(d, fLeft ? 1 : 0) | 0, iCaptWidth[0], iCaptHeight[0], this.HasLargeCaptions())) {
                if (iButton === 1) {
                  pSheet.UserClose$v();
                } else {
                  pSheet.SetCloseButtonHighlight(true);
                }
              } else if (iButton === 1) {
                if (pSheet !== this.pActiveSheet) {
                  this.pActiveSheet = pSheet;
                  this.SelectionChanged(true);
                }
              }
              break;
            }
            d = d + ((fLeft ? iTabHeight : iTabWidth) + 2 | 0) | 0;
          }
        }
      }
    }
    Control.prototype.MouseInput$rCMouse$i32$i32$i32$u32.call(this, rMouse, iButton, iX, iY, dwKeyParam);
  }

  RemoveElement(pChild) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== Tabular && Tabular.prototype instanceof $c) return $c.prototype.RemoveElement.apply(this, arguments); }
    Container.prototype.RemoveElement.call(this, pChild);
    if (pChild === this.pActiveSheet) {
      this.pActiveSheet = Container.prototype.GetFirst.call(this);
      this.SelectionChanged(false);
    }
    this.SheetsChanged();
  }

  AddSheet(szTitle, icoTitle = -1) {
    let pNewSheet = new Tabular$Sheet().init(szTitle, this.GetContainedClientRect(), icoTitle);
    this.AddCustomSheet(pNewSheet);
    return pNewSheet;
  }

  AddCustomSheet(pAddSheet) {
    Container.prototype.AddElement$pElement.call(this, pAddSheet);
    pAddSheet.SetVisibility(this.pActiveSheet == null);
    if (this.pActiveSheet == null) {
      this.pActiveSheet = pAddSheet;
    }
    this.SheetsChanged();
  }

  ClearSheets() {
    let pSheet = null;
    while ((pSheet = this.GetSheet(0)) != null) {
      $delete(pSheet);
    }
    this.SheetsChanged();
  }

  SelectSheet$i32$b(iIndex, fByUser) {
    this.pActiveSheet = this.GetSheet(iIndex);
    this.SelectionChanged(fByUser);
  }

  SelectSheet$pSheet$b(pSelSheet, fByUser) {
    this.pActiveSheet = pSelSheet;
    this.SelectionChanged(fByUser);
  }

  GetSheet(iIndex) {
    return this.GetElementByIndex(iIndex);
  }

  GetActiveSheet() {
    return this.pActiveSheet;
  }

  GetActiveSheetIndex() {
    let i = -1;
    let pSheet = null;
    while ((pSheet = this.GetSheet((i = i + 1 | 0))) != null) {
      if (pSheet === this.pActiveSheet) {
        return i;
      }
    }
    return -1;
  }

  GetSheetCount() {
    return this.GetElementCount();
  }

  SetGfx(pafctBack, pafctClip, pafctIcons, paSheetCaptionFont, fResizeByAspect) {
    this.pfctBack = pafctBack;
    this.pfctClip = pafctClip;
    this.pfctIcons = pafctIcons;
    this.pSheetCaptionFont = paSheetCaptionFont;
    if (this.pfctBack != null && fResizeByAspect) {
      let iEffWdt = this.rcBounds.Wdt - this.GetLeftSize() | 0;
      let iEffHgt = this.rcBounds.Hgt - this.GetTopSize() | 0;
      if (Math.fround(Math.fround(iEffWdt) * this.pfctBack.Hgt) > Math.fround(this.pfctBack.Wdt * Math.fround(iEffHgt))) {
        let iOversize = ftoi32(Math.fround(Math.fround(iEffWdt) - Math.fround(Math.fround(this.pfctBack.Wdt * Math.fround(iEffHgt)) / this.pfctBack.Hgt)));
        let rtBounds = this.GetBounds().$clone();
        rtBounds.x = rtBounds.x + (iOversize / 2 | 0) | 0;
        rtBounds.Wdt = rtBounds.Wdt - iOversize | 0;
        this.SetBounds(rtBounds);
      } else {
        let iOversize = ftoi32(Math.fround(Math.fround(iEffHgt) - Math.fround(Math.fround(this.pfctBack.Hgt * Math.fround(iEffWdt)) / this.pfctBack.Wdt)));
        let rtBounds = this.GetBounds().$clone();
        rtBounds.y = rtBounds.y + iOversize | 0;
        rtBounds.Hgt = rtBounds.Hgt - iOversize | 0;
        this.SetBounds(rtBounds);
      }
    }
    this.SheetsChanged();
  }

  static GetLeftClipSize(pfctForClip) {
    return ftoi32(Math.fround(Math.fround(pfctForClip.Wdt * Math.fround(95)) / Math.fround(120)));
  }

  SetSheetMargin(iMargin) {
    this.iSheetMargin = iMargin;
    this.UpdateOwnPos();
  }

  SetDrawDecoration(fToVal) {
    this.fDrawSelf = fToVal;
  }

  $clone() { return new Tabular().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pActiveSheet = o.pActiveSheet;
    this.eTabPos = o.eTabPos;
    this.iMaxTabWidth = o.iMaxTabWidth;
    this.iSheetSpacing = o.iSheetSpacing;
    this.iSheetOff = o.iSheetOff;
    this.iCaptionLengthTotal = o.iCaptionLengthTotal;
    this.iCaptionScrollPos = o.iCaptionScrollPos;
    this.fScrollingLeft = o.fScrollingLeft;
    this.fScrollingRight = o.fScrollingRight;
    this.fScrollingLeftDown = o.fScrollingLeftDown;
    this.fScrollingRightDown = o.fScrollingRightDown;
    this.tLastScrollTime.$assign(o.tLastScrollTime);
    this.iSheetMargin = o.iSheetMargin;
    this.fDrawSelf = o.fDrawSelf;
    this.pfctBack = o.pfctBack;
    this.pfctClip = o.pfctClip;
    this.pfctIcons = o.pfctIcons;
    this.pSheetCaptionFont = o.pSheetCaptionFont;
    this.pKeySelUp = o.pKeySelUp;
    this.pKeySelDown = o.pKeySelDown;
    this.pKeySelUp2 = o.pKeySelUp2;
    this.pKeySelDown2 = o.pKeySelDown2;
    this.pKeyCloseTab = o.pKeyCloseTab;
    return this;
  }
}

export class TextWindow extends Control {
  pClientWindow = null;
  pTitlePicture = null;
  pLogBuffer = null;
  fDrawBackground = false;
  fDrawFrame = false;
  iPicPadding = 0;

  DrawElement(cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== TextWindow && TextWindow.prototype instanceof $c) return $c.prototype.DrawElement.apply(this, arguments); }
    if (this.fDrawBackground) {
      $.pDraw.DrawBoxDw(cgo.Surface, ftoi32(Math.fround(cgo.TargetX + Math.fround(this.rcBounds.x))), ftoi32(Math.fround(cgo.TargetY + Math.fround(this.rcBounds.y))), ftoi32(Math.fround(Math.fround((this.rcBounds.x + this.rcBounds.Wdt | 0) - 1 | 0) + cgo.TargetX)), ftoi32(Math.fround(Math.fround((this.rcBounds.y + this.rcBounds.Hgt | 0) - 1 | 0) + cgo.TargetY)), 0x7f000000);
    }
    if (this.fDrawFrame) {
      this.Draw3DFrame(cgo);
    }
  }

  ElementSizeChanged(pOfElement) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== TextWindow && TextWindow.prototype instanceof $c) return $c.prototype.ElementSizeChanged.apply(this, arguments); }
    if (pOfElement.GetParent() === this) {
      Container.prototype.ElementSizeChanged.call(this, pOfElement);
    }
    if (this.pClientWindow != null && this.pLogBuffer != null) {
      this.pClientWindow.SetClientHeight(this.pLogBuffer.GetBounds().y + this.pLogBuffer.GetBounds().Hgt | 0);
    }
  }

  ElementPosChanged(pOfElement) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== TextWindow && TextWindow.prototype instanceof $c) return $c.prototype.ElementPosChanged.apply(this, arguments); }
    if (pOfElement.GetParent() === this) {
      Container.prototype.ElementSizeChanged.call(this, pOfElement);
    }
    if (this.pClientWindow != null && this.pLogBuffer != null) {
      this.pClientWindow.SetClientHeight(this.pLogBuffer.GetBounds().y + this.pLogBuffer.GetBounds().Hgt | 0);
    }
  }

  UpdateSize() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== TextWindow && TextWindow.prototype instanceof $c) return $c.prototype.UpdateSize.apply(this, arguments); }
    Element.prototype.UpdateSize.call(this);
    this.pClientWindow.SetBounds(this.GetContainedClientRect());
    let rcChildBounds = this.pLogBuffer.GetBounds().$clone();
    rcChildBounds.x = 0;
    rcChildBounds.y = (this.pTitlePicture != null && this.pTitlePicture.IsVisible() ? $u64n(this.pTitlePicture.GetBounds().Hgt) + this.iPicPadding : 0) | 0;
    rcChildBounds.Wdt = this.pClientWindow.GetClientRect().Wdt;
    this.pLogBuffer.SetBounds(rcChildBounds);
  }

  IsFocusElement() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== TextWindow && TextWindow.prototype instanceof $c) return $c.prototype.IsFocusElement.apply(this, arguments); }
    return null;
  }

  init(rtBounds, iPicWdt = 0, iPicHgt = 0, iPicPadding = 0, iMaxLines = 100, iMaxTextLen = 4096, szIndentChars = S("    "), fAutoGrow = false, pOverlayPic = null, iOverlayBorder = 0, fMarkup = false) {
    super.init(rtBounds);
    this.pLogBuffer = null;
    this.fDrawBackground = true;
    this.fDrawFrame = true;
    this.iPicPadding = iPicPadding;
    this.$dyn = TextWindow;
    this.UpdateOwnPos();
    this.pClientWindow = new ScrollWindow().init(this);
    this.pClientWindow.SetBounds(this.GetContainedClientRect());
    this.pLogBuffer = new MultilineLabel().init(this.pClientWindow.GetContainedClientRect(), iMaxLines | 0, iMaxTextLen | 0, szIndentChars, fAutoGrow, fMarkup);
    Container.prototype.AddElement$pElement.call(this.pClientWindow, this.pLogBuffer);
    this.pClientWindow.SetClientHeight(1);
    let rcContentSize = this.pClientWindow.GetClientRect().$clone();
    if (iPicWdt !== 0 && iPicHgt !== 0) {
      let rcImage = new $.C4Rect();
      rcImage.x = $max($u64n(rcContentSize.GetMiddleX()) - Math.trunc(iPicWdt / 2) | 0, 0);
      rcImage.y = 0;
      rcImage.Wdt = $min(iPicWdt, $u64n(rcContentSize.Wdt)) | 0;
      rcImage.Hgt = Math.trunc(iPicHgt * $u64n(rcImage.Wdt) / iPicWdt) | 0;
      rcContentSize.y = $u64n(rcContentSize.y) + ($u64n(rcImage.Hgt) + iPicPadding) | 0;
      if (pOverlayPic != null) {
        this.pTitlePicture = new OverlayPicture().init(rcImage, false, pOverlayPic, iOverlayBorder);
      } else {
        this.pTitlePicture = new Picture().init(rcImage, false);
      }
      Container.prototype.AddElement$pElement.call(this.pClientWindow, this.pTitlePicture);
    } else {
      this.pTitlePicture = null;
    }
    TextWindow.prototype.UpdateSize.call(this);
    return this;
  }

  AddTextLine$pi8$pCStdFont$u32$b$b$pCStdFont(szText, pFont, dwClr, fDoUpdate, fMakeReadableOnBlack, pCaptionFont = null) {
    if (this.pLogBuffer != null) {
      this.pLogBuffer.AddLine$pi8$pCStdFont$u32$b$b$pCStdFont(szText, pFont, dwClr, fDoUpdate, fMakeReadableOnBlack, pCaptionFont);
    }
  }

  ScrollToBottom() {
    if (this.pClientWindow != null) {
      this.pClientWindow.ScrollToBottom();
    }
  }

  ClearText$b(fDoUpdate) {
    if (this.pLogBuffer != null) {
      this.pLogBuffer.Clear$b(fDoUpdate);
    }
  }

  GetScrollPos() {
    return this.pClientWindow != null ? this.pClientWindow.GetScrollY() : 0;
  }

  SetScrollPos(iPos) {
    if (this.pClientWindow != null) {
      this.pClientWindow.ScrollRangeInView(iPos, 0);
    }
  }

  UpdateHeight() {
    if (this.pLogBuffer != null) {
      this.pLogBuffer.UpdateHeight();
    }
  }

  SetDecoration$b$b$pScrollBarFacets$b(fDrawBG, fDrawFrame, pToGfx, fAutoScroll) {
    this.fDrawBackground = fDrawBG;
    this.fDrawFrame = fDrawFrame;
    if (this.pClientWindow != null) {
      this.pClientWindow.SetDecoration$pScrollBarFacets$b(pToGfx, fAutoScroll);
    }
  }

  SetPicture(rNewPic) {
    if (this.pTitlePicture == null) {
      return;
    }
    this.pTitlePicture.SetFacet$C4Facet(rNewPic);
    this.pLogBuffer.GetBounds().y = (rNewPic.Surface != null ? $u64n(this.pTitlePicture.GetBounds().Hgt) + this.iPicPadding : 0) | 0;
    this.pLogBuffer.UpdateOwnPos();
    this.pTitlePicture.SetVisibility(!(rNewPic.Surface == null));
  }

  GetMarginTop() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== TextWindow && TextWindow.prototype instanceof $c) return $c.prototype.GetMarginTop.apply(this, arguments); }
    return 8;
  }

  GetMarginLeft() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== TextWindow && TextWindow.prototype instanceof $c) return $c.prototype.GetMarginLeft.apply(this, arguments); }
    return 10;
  }

  GetMarginRight() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== TextWindow && TextWindow.prototype instanceof $c) return $c.prototype.GetMarginRight.apply(this, arguments); }
    return 5;
  }

  GetMarginBottom() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== TextWindow && TextWindow.prototype instanceof $c) return $c.prototype.GetMarginBottom.apply(this, arguments); }
    return 8;
  }

  $clone() { return new TextWindow().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pClientWindow = o.pClientWindow;
    this.pTitlePicture = o.pTitlePicture;
    this.pLogBuffer = o.pLogBuffer;
    this.fDrawBackground = o.fDrawBackground;
    this.fDrawFrame = o.fDrawFrame;
    this.iPicPadding = o.iPicPadding;
    return this;
  }
}

export class ContextButton extends Control {
  pKeyContext$ContextButton = null;
  iOpenMenu = 0;
  fMouseOver = false;

  init$rC4Rect(rtBounds) {
    super.init(rtBounds);
    this.iOpenMenu = 0;
    this.fMouseOver = false;
    this.$dyn = ContextButton;
    ContextButton.prototype.RegisterContextKey.call(this);
    return this;
  }

  init$pElement$b$i32$i32(pForEl, fAdd, iHIndent = 4, iVIndent = 4) {
    super.init(new $.C4Rect().init$i32$i32$i32$i32(0, 0, 0, 0));
    this.iOpenMenu = 0;
    this.fMouseOver = false;
    this.$dyn = ContextButton;
    this.SetBounds(pForEl.GetToprightCornerRect(16, 16, iHIndent, iVIndent));
    this.SetContextHandler(pForEl.GetContextHandler());
    let pCont = null;
    if (fAdd) {
      if ((pCont = pForEl.GetContainer()) != null) {
        Container.prototype.AddElement$pElement.call(pCont, this);
      }
    }
    ContextButton.prototype.RegisterContextKey.call(this);
    return this;
  }

  $dtor() {
    $delete(this.pKeyContext$ContextButton);
    super.$dtor();
  }

  DoContext$i32$i32(iX = -1, iY = -1) {
    if (iX < 0) {
      iX = this.rcBounds.Wdt / 2 | 0;
      iY = this.rcBounds.Hgt / 2 | 0;
    }
    let pCtx = this.GetContextHandler();
    if (pCtx == null) {
      return false;
    }
    if (!pCtx.OnContext(this, iX, iY)) {
      return false;
    }
    let pScr = this.GetScreen();
    if (pScr == null) {
      return false;
    }
    this.iOpenMenu = pScr.GetContextMenuIndex();
    return !(this.iOpenMenu === 0);
  }

  KeyContext() {
    return this.DoContext$i32$i32();
  }

  RegisterContextKey() {
    let ContextKeys = [];
    $vpush(ContextKeys, new $.C4KeyCodeEx().init(106));
    $vpush(ContextKeys, new $.C4KeyCodeEx().init(108));
    $vpush(ContextKeys, new $.C4KeyCodeEx().init(57));
    $vpush(ContextKeys, new $.C4KeyCodeEx().init(106, 1 /*KEYS_Alt*/));
    $vpush(ContextKeys, new $.C4KeyCodeEx().init(108, 1 /*KEYS_Alt*/));
    $vpush(ContextKeys, new $.C4KeyCodeEx().init(57, 1 /*KEYS_Alt*/));
    this.pKeyContext$ContextButton = new $.C4KeyBinding().init$vector$pi8$i32$pC4KeyboardCallbackInterface$u32(ContextKeys, S("GUIContextButtonPress"), 2 /*KEYSCOPE_Gui*/, new ControlKeyCB$ContextButton().init(this, "KeyContext"), 3);
  }

  DrawElement(cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ContextButton && ContextButton.prototype instanceof $c) return $c.prototype.DrawElement.apply(this, arguments); }
    let pScr = this.GetScreen();
    if (pScr == null || this.iOpenMenu !== pScr.GetContextMenuIndex()) {
      this.iOpenMenu = 0;
    }
    let x0 = ftoi32(Math.fround(cgo.TargetX + Math.fround(this.rcBounds.x)));
    let y0 = ftoi32(Math.fround(cgo.TargetY + Math.fround(this.rcBounds.y)));
    $.GraphicsResource.fctContext.Draw$pC4Surface$f32$f32$i32$i32(cgo.Surface, Math.fround(x0), Math.fround(y0), this.iOpenMenu !== 0 ? 1 : 0);
    if (this.HasDrawFocus() || this.fMouseOver && this.IsInActiveDlg(false) || this.iOpenMenu !== 0) {
      $.pDraw.SetBlitMode(1);
      $.GraphicsResource.fctButtonHighlight.DrawX(cgo.Surface, Math.fround(x0), Math.fround(y0), Math.fround(this.rcBounds.Wdt), Math.fround(this.rcBounds.Hgt));
      $.pDraw.ResetBlitMode();
    }
  }

  IsFocusOnClick() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ContextButton && ContextButton.prototype instanceof $c) return $c.prototype.IsFocusOnClick.apply(this, arguments); }
    return false;
  }

  MouseInput$rCMouse$i32$i32$i32$u32(rMouse, iButton, iX, iY, dwKeyParam) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ContextButton && ContextButton.prototype instanceof $c) return $c.prototype.MouseInput$rCMouse$i32$i32$i32$u32.apply(this, arguments); }
    if (iButton === 1 || iButton === 3) {
      if (this.DoContext$i32$i32()) {
        return;
      }
    }
    Control.prototype.MouseInput$rCMouse$i32$i32$i32$u32.call(this, rMouse, iButton, iX, iY, dwKeyParam);
  }

  MouseEnter(rMouse) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ContextButton && ContextButton.prototype instanceof $c) return $c.prototype.MouseEnter.apply(this, arguments); }
    Element.prototype.MouseEnter.call(this, rMouse);
    this.fMouseOver = true;
  }

  MouseLeave(rMouse) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ContextButton && ContextButton.prototype instanceof $c) return $c.prototype.MouseLeave.apply(this, arguments); }
    Element.prototype.MouseLeave.call(this, rMouse);
    this.fMouseOver = false;
  }

  $clone() { return new ContextButton().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pKeyContext$ContextButton = o.pKeyContext$ContextButton;
    this.iOpenMenu = o.iOpenMenu;
    this.fMouseOver = o.fMouseOver;
    return this;
  }
}

export class ComboBox extends Control {
  pKeyOpenCombo = null;
  pKeyCloseCombo = null;
  iOpenMenu = 0;
  pFillCallback = null;
  Text = new Int8Array(513);
  fReadOnly = false;
  fSimple = false;
  fMouseOver = false;
  pUseFont = null;
  dwFontClr = 0;
  dwBGClr = 0;
  dwBorderClr = 0;
  pFctSideArrow = null;

  DoDropdown() {
    if (this.fReadOnly) {
      return false;
    }
    let iX = 0;
    let iY = this.rcBounds.Hgt;
    let pScreen = this.GetScreen();
    if (pScreen == null) {
      return false;
    }
    if (this.pFillCallback == null) {
      return false;
    }
    let pNewMenu = new ContextMenu().init();
    pNewMenu.GetBounds().Wdt = $max(this.rcBounds.Wdt, pNewMenu.GetBounds().Wdt);
    this.pFillCallback.FillDropDown(this, pNewMenu);
    pScreen.DoContext$pContextMenu$pElement$i32$i32(pNewMenu, this, iX, iY);
    this.iOpenMenu = pNewMenu.GetMenuIndex();
    return true;
  }

  KeyDropDown() {
    return this.DoDropdown();
  }

  KeyAbortDropDown() {
    return this.AbortDropdown(true);
  }

  AbortDropdown(fByUser) {
    let pScr = this.GetScreen();
    if (pScr == null || this.iOpenMenu !== pScr.GetLastContextMenuIndex()) {
      this.iOpenMenu = 0;
    }
    if (this.iOpenMenu === 0) {
      return false;
    }
    pScr.AbortContext(fByUser);
    return true;
  }

  DrawElement(cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ComboBox && ComboBox.prototype instanceof $c) return $c.prototype.DrawElement.apply(this, arguments); }
    let pUseFont = this.pUseFont != null ? this.pUseFont : $.GraphicsResource.TextFont;
    let pScr = this.GetScreen();
    if (pScr == null || this.iOpenMenu !== pScr.GetContextMenuIndex()) {
      this.iOpenMenu = 0;
    }
    let x0 = ftoi32(Math.fround(cgo.TargetX + Math.fround(this.rcBounds.x)));
    let y0 = ftoi32(Math.fround(cgo.TargetY + Math.fround(this.rcBounds.y)));
    let iRightTextEnd = ftoi32(Math.fround(Math.fround(Math.fround(x0 + this.rcBounds.Wdt | 0) - $.GraphicsResource.fctContext.Wdt) - Math.fround(1)));
    if (!this.fReadOnly && !this.fSimple) {
      $.pDraw.DrawBoxDw(cgo.Surface, x0, y0, (x0 + this.rcBounds.Wdt | 0) - 1 | 0, (y0 + this.rcBounds.Hgt | 0) - 1 | 0, this.dwBGClr);
      if (this.dwBorderClr !== 0) {
        let x1 = ftoi32(Math.fround(cgo.TargetX + Math.fround(this.rcBounds.x)));
        let y1 = ftoi32(Math.fround(cgo.TargetY + Math.fround(this.rcBounds.y)));
        let x2 = x1 + this.rcBounds.Wdt | 0;
        let y2 = y1 + this.rcBounds.Hgt | 0;
        $.pDraw.DrawFrameDw(cgo.Surface, x1, y1, x2, y2 - 1 | 0, this.dwBorderClr);
        $.pDraw.DrawFrameDw(cgo.Surface, x1 + 1 | 0, y1 + 1 | 0, x2 - 1 | 0, y2 - 2 | 0, this.dwBorderClr);
      } else {
        this.Draw3DFrame(cgo);
      }
      (this.pFctSideArrow != null ? this.pFctSideArrow : $.GraphicsResource.fctContext).Draw$pC4Surface$f32$f32$i32$i32(cgo.Surface, Math.fround(iRightTextEnd), Math.fround(Math.fround(y0) + Math.fround(Math.fround(Math.fround(this.rcBounds.Hgt) - $.GraphicsResource.fctContext.Hgt) / Math.fround(2))), this.iOpenMenu !== 0 ? 1 : 0);
    } else if (!this.fReadOnly) {
      (this.pFctSideArrow != null ? this.pFctSideArrow : $.GraphicsResource.fctContext).Draw$pC4Surface$f32$f32$i32$i32(cgo.Surface, Math.fround(x0), Math.fround(Math.fround(y0) + Math.fround(Math.fround(Math.fround(this.rcBounds.Hgt) - $.GraphicsResource.fctContext.Hgt) / Math.fround(2))), this.iOpenMenu !== 0 ? 1 : 0);
    }
    if ($rd(P(this.Text, 0)) !== 0) {
      $.pDraw.StorePrimaryClipper();
      $.pDraw.SubPrimaryClipper(x0, y0, iRightTextEnd - 1 | 0, (y0 + this.rcBounds.Hgt | 0) - 1 | 0);
      $.pDraw.TextOut(P(this.Text, 0), pUseFont, 1, cgo.Surface, Math.fround(Math.fround(Math.fround(x0) + $.GraphicsResource.fctContext.Wdt) + Math.fround(2)), Math.fround(y0 + ((this.rcBounds.Hgt - pUseFont.GetLineHeight() | 0) / 2 | 0) | 0), this.dwFontClr, 0);
      $.pDraw.RestorePrimaryClipper();
    }
    if ((this.HasDrawFocus() || this.iOpenMenu !== 0 || this.fMouseOver) && !this.fReadOnly) {
      $.pDraw.SetBlitMode(1);
      $.GraphicsResource.fctButtonHighlightRound.DrawX(cgo.Surface, Math.fround(x0), Math.fround(y0), Math.fround(this.rcBounds.Wdt), Math.fround(this.rcBounds.Hgt));
      $.pDraw.ResetBlitMode();
    }
  }

  IsFocusOnClick() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ComboBox && ComboBox.prototype instanceof $c) return $c.prototype.IsFocusOnClick.apply(this, arguments); }
    return false;
  }

  IsFocusElement() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ComboBox && ComboBox.prototype instanceof $c) return $c.prototype.IsFocusElement.apply(this, arguments); }
    return this.fReadOnly ? null : this;
  }

  OnCtxComboSelect(_pListItem, rNewSel) {
    if (this.fReadOnly) {
      return;
    }
    if (this.pFillCallback == null || !this.pFillCallback.OnComboSelChange(this, rNewSel.id)) {
      this.SetText$pi8(rNewSel.sText.getData());
    }
  }

  init(rtBounds) {
    super.init(rtBounds);
    this.iOpenMenu = 0;
    this.pFillCallback = null;
    this.fReadOnly = false;
    this.fSimple = false;
    this.fMouseOver = false;
    this.pUseFont = null;
    this.dwFontClr = 0xffffffff;
    this.dwBGClr = 0x9f000000;
    this.dwBorderClr = 0;
    this.pFctSideArrow = null;
    this.$dyn = ComboBox;
    $wr(P(this.Text, 0), 0, 0);
    let cbKeys = [];
    $vpush(cbKeys, new $.C4KeyCodeEx().init(108));
    $vpush(cbKeys, new $.C4KeyCodeEx().init(57));
    $vpush(cbKeys, new $.C4KeyCodeEx().init(108, 1 /*KEYS_Alt*/));
    $vpush(cbKeys, new $.C4KeyCodeEx().init(57, 1 /*KEYS_Alt*/));
    if ($.Config.Controls.GamepadGuiControl !== 0) {
      $.Ok(cbKeys);
      $.Down(cbKeys);
    }
    this.pKeyOpenCombo = new $.C4KeyBinding().init$vector$pi8$i32$pC4KeyboardCallbackInterface$u32(cbKeys, S("GUIComboOpen"), 2 /*KEYSCOPE_Gui*/, new ControlKeyCB$ComboBox().init(this, "KeyDropDown"), 3);
    cbKeys.length = 0;
    $vpush(cbKeys, new $.C4KeyCodeEx().init(1));
    if ($.Config.Controls.GamepadGuiControl !== 0) {
      $.Cancel(cbKeys);
    }
    this.pKeyCloseCombo = new $.C4KeyBinding().init$vector$pi8$i32$pC4KeyboardCallbackInterface$u32(cbKeys, S("GUIComboClose"), 2 /*KEYSCOPE_Gui*/, new ControlKeyCB$ComboBox().init(this, "KeyAbortDropDown"), 3);
    return this;
  }

  $dtor() {
    $delete(this.pKeyCloseCombo);
    $delete(this.pKeyOpenCombo);
    if (this.pFillCallback != null) {
      $delete(this.pFillCallback);
    }
    super.$dtor();
  }

  MouseInput$rCMouse$i32$i32$i32$u32(rMouse, iButton, iX, iY, dwKeyParam) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ComboBox && ComboBox.prototype instanceof $c) return $c.prototype.MouseInput$rCMouse$i32$i32$i32$u32.apply(this, arguments); }
    if (!this.fReadOnly) {
      if (iButton === 1) {
        let pScr = this.GetScreen();
        if (pScr == null || this.iOpenMenu !== pScr.GetLastContextMenuIndex()) {
          this.iOpenMenu = 0;
        }
        if (this.iOpenMenu !== 0) {
          return;
        } else if (this.DoDropdown()) {
          return;
        }
      }
    }
    Control.prototype.MouseInput$rCMouse$i32$i32$i32$u32.call(this, rMouse, iButton, iX, iY, dwKeyParam);
  }

  MouseEnter(rMouse) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ComboBox && ComboBox.prototype instanceof $c) return $c.prototype.MouseEnter.apply(this, arguments); }
    this.fMouseOver = true;
    Element.prototype.MouseEnter.call(this, rMouse);
  }

  MouseLeave(rMouse) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ComboBox && ComboBox.prototype instanceof $c) return $c.prototype.MouseLeave.apply(this, arguments); }
    this.fMouseOver = false;
    Element.prototype.MouseLeave.call(this, rMouse);
  }

  SetComboCB(pNewFillCallback) {
    if (this.pFillCallback != null) {
      $delete(this.pFillCallback);
    }
    this.pFillCallback = pNewFillCallback;
  }

  static GetDefaultHeight$v() {
    return $.GraphicsResource.TextFont.GetLineHeight() + 4 | 0;
  }

  SetText$pi8(szToText) {
    if (szToText != null) {
      let sTxt = new $.StdStrBuf().init$pi8$b(szToText);
      sTxt.Replace(S("&"), S(""));
      $.SCopy$pi8$pi8$u64(sTxt.getData(), P(this.Text, 0), 512);
    } else {
      $wr(P(this.Text, 0), 0, 0);
    }
  }

  SetReadOnly(fToVal) {
    if (this.fReadOnly = fToVal) {
      this.AbortDropdown(false);
    }
  }

  SetSimple(fToVal) {
    this.fSimple = fToVal;
  }

  GetText$v() {
    return new $.StdStrBuf().init$pi8$b(P(this.Text, 0), false);
  }

  SetFont$pCStdFont(pToFont) {
    this.pUseFont = pToFont;
  }

  SetColors(dwFontClr, dwBGClr, dwBorderClr) {
    this.dwFontClr = dwFontClr;
    this.dwBGClr = dwBGClr;
    this.dwBorderClr = dwBorderClr;
  }

  SetDecoration$pC4Facet(pFctSideArrow) {
    this.pFctSideArrow = pFctSideArrow;
  }

  $clone() { return new ComboBox().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pKeyOpenCombo = o.pKeyOpenCombo;
    this.pKeyCloseCombo = o.pKeyCloseCombo;
    this.iOpenMenu = o.iOpenMenu;
    this.pFillCallback = o.pFillCallback;
    this.Text = o.Text.slice();
    this.fReadOnly = o.fReadOnly;
    this.fSimple = o.fSimple;
    this.fMouseOver = o.fMouseOver;
    this.pUseFont = o.pUseFont;
    this.dwFontClr = o.dwFontClr;
    this.dwBGClr = o.dwBGClr;
    this.dwBorderClr = o.dwBorderClr;
    this.pFctSideArrow = o.pFctSideArrow;
    return this;
  }
}

export class FullscreenDialog extends Dialog {
  pFullscreenTitle = null;
  pSubTitle = null;
  iDlgMarginX = 0;
  iDlgMarginY = 0;

  GetID$v() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== FullscreenDialog && FullscreenDialog.prototype instanceof $c) return $c.prototype.GetID$v.apply(this, arguments); }
    return null;
  }

  init(szTitle, szSubtitle) {
    super.init(Screen.GetScreenS().GetClientRect().Wdt, Screen.GetScreenS().GetClientRect().Hgt, null, false);
    this.pFullscreenTitle = null;
    this.$dyn = FullscreenDialog;
    let iScreenX = Screen.GetScreenS().GetClientRect().Wdt;
    let iScreenY = Screen.GetScreenS().GetClientRect().Hgt;
    if (iScreenX < 500) {
      this.iDlgMarginX = 2;
    } else {
      this.iDlgMarginX = iScreenX / 50 | 0;
    }
    if (iScreenY < 320) {
      this.iDlgMarginY = 2;
    } else {
      this.iDlgMarginY = Math.imul(iScreenY, 2) / 75 | 0;
    }
    this.SetBounds(new $.C4Rect().init$i32$i32$i32$i32(0, 0, iScreenX, iScreenY));
    FullscreenDialog.prototype.SetTitle$pi8.call(this, szTitle);
    if (szSubtitle != null && szSubtitle.a[szSubtitle.o] !== 0 && FullscreenDialog.prototype.HasUpperBoard.call(this)) {
      Container.prototype.AddElement$pElement.call(this, this.pSubTitle = new Label().init$pi8$i32$i32$i32$u32$pCStdFont$b$b(szSubtitle, this.rcClientRect.Wdt, ((50 - ($.GraphicsResource.CaptionFont.GetLineHeight() / 2 | 0) | 0) - 25 | 0) - FullscreenDialog.prototype.GetMarginTop.call(this) | 0, 2, 0xffffffff, $.GraphicsResource.TextFont));
      this.pSubTitle.SetToolTip(szTitle);
    } else {
      this.pSubTitle = null;
    }
    return this;
  }

  SetTitle$pi8(szTitle) {
    if (this.pFullscreenTitle != null) {
      $delete(this.pFullscreenTitle);
      this.pFullscreenTitle = null;
    }
    if (szTitle != null && szTitle.a[szTitle.o] !== 0) {
      if (this.HasUpperBoard()) {
        this.pFullscreenTitle = new Label().init$pi8$i32$i32$i32$u32$pCStdFont$b$b(szTitle, 0, (25 - ($.GraphicsResource.TitleFont.GetLineHeight() / 2 | 0) | 0) - this.GetMarginTop() | 0, 0, 0xffffffff, $.GraphicsResource.TitleFont);
      } else {
        this.pFullscreenTitle = new Label().init$pi8$i32$i32$i32$u32$pCStdFont$b$b(szTitle, this.GetClientRect().Wdt / 2 | 0, (25 - ($.GraphicsResource.TitleFont.GetLineHeight() / 2 | 0) | 0) - this.GetMarginTop() | 0, 1, 0xffffff00, $.GraphicsResource.TitleFont);
      }
      Container.prototype.AddElement$pElement.call(this, this.pFullscreenTitle);
      this.pFullscreenTitle.SetToolTip(szTitle);
    }
  }

  DrawElement(cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== FullscreenDialog && FullscreenDialog.prototype instanceof $c) return $c.prototype.DrawElement.apply(this, arguments); }
    if (this.HasUpperBoard()) {
      $.pDraw.BlitSurfaceTile($.GraphicsResource.fctUpperBoard.Surface, cgo.Surface, Math.fround(0), Math.fround($min(ftoi32(Math.fround(Math.fround(this.iFade) - $.GraphicsResource.fctUpperBoard.Hgt)), 0)), cgo.Wdt, $.GraphicsResource.fctUpperBoard.Hgt, Math.fround(0), Math.fround(0), null);
    }
  }

  OnEnter() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== FullscreenDialog && FullscreenDialog.prototype instanceof $c) return $c.prototype.OnEnter.apply(this, arguments); }
    return false;
  }

  IsComponentOutsideClientArea() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== FullscreenDialog && FullscreenDialog.prototype instanceof $c) return $c.prototype.IsComponentOutsideClientArea.apply(this, arguments); }
    return true;
  }

  HasUpperBoard() {
    return false;
  }

  IsFullscreenDialog() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== FullscreenDialog && FullscreenDialog.prototype instanceof $c) return $c.prototype.IsFullscreenDialog.apply(this, arguments); }
    return true;
  }

  DoPlacement(_pOnScreen, _rPreferredDlgRect) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== FullscreenDialog && FullscreenDialog.prototype instanceof $c) return $c.prototype.DoPlacement.apply(this, arguments); }
    return true;
  }

  GetMarginTop() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== FullscreenDialog && FullscreenDialog.prototype instanceof $c) return $c.prototype.GetMarginTop.apply(this, arguments); }
    return (this.HasUpperBoard() ? $.C4UpperBoardHeight$C4Constants : $.C4UpperBoardHeight$C4Constants) + this.iDlgMarginY | 0;
  }

  GetMarginLeft() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== FullscreenDialog && FullscreenDialog.prototype instanceof $c) return $c.prototype.GetMarginLeft.apply(this, arguments); }
    return this.iDlgMarginX;
  }

  GetMarginRight() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== FullscreenDialog && FullscreenDialog.prototype instanceof $c) return $c.prototype.GetMarginRight.apply(this, arguments); }
    return this.iDlgMarginX;
  }

  GetMarginBottom() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== FullscreenDialog && FullscreenDialog.prototype instanceof $c) return $c.prototype.GetMarginBottom.apply(this, arguments); }
    return this.iDlgMarginY;
  }

  UpdateOwnPos() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== FullscreenDialog && FullscreenDialog.prototype instanceof $c) return $c.prototype.UpdateOwnPos.apply(this, arguments); }
    Window.prototype.UpdateOwnPos.call(this);
  }

  DrawBackground(cgo, rFromFct) {
    rFromFct.DrawFullScreen(cgo);
  }

  $clone() { return new FullscreenDialog().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pFullscreenTitle = o.pFullscreenTitle;
    this.pSubTitle = o.pSubTitle;
    this.iDlgMarginX = o.iDlgMarginX;
    this.iDlgMarginY = o.iDlgMarginY;
    return this;
  }
}

export class MessageDialog extends Dialog {
  fHasOK = false;
  piConfigDontShowAgainSetting = null;
  pKeyCopy = null;
  sCopyText = new StdString();

  init(szMessage, szCaption, dwButtons, icoIcon, eSize = 500 /*dsRegular*/, piConfigDontShowAgainSetting = null, fDefaultNo = false) {
    super.init(eSize, 100, szCaption, false);
    this.piConfigDontShowAgainSetting = piConfigDontShowAgainSetting;
    this.pKeyCopy = null;
    this.sCopyText = new StdString();
    this.$dyn = MessageDialog;
    const rUseFont = $.GraphicsResource.TextFont;
    let caMain = new ComponentAligner().init(this.GetClientRect(), 10, 10, true);
    let rcIcon = caMain.GetFromLeft$i32$i32(40).$clone();
    rcIcon.Hgt = 40;
    let pIcon = new Icon().init(rcIcon, icoIcon);
    Container.prototype.AddElement$pElement.call(this, pIcon);
    let fTextCentered = false;
    if (eSize !== 500) {
      fTextCentered = true;
    } else {
      const iMsgWdt = [0];
      const iMsgHgt = [0];
      rUseFont.GetTextExtent(szMessage, P(iMsgWdt, 0), P(iMsgHgt, 0));
      fTextCentered = iMsgWdt[0] <= ((caMain.GetInnerWidth() - 40 | 0) - 20 | 0) && iMsgHgt[0] <= rUseFont.GetLineHeight();
    }
    if (fTextCentered) {
      caMain.GetFromRight$i32$i32(40);
    }
    let sMsgBroken = new $.StdStrBuf();
    let iMsgHeight = rUseFont.BreakMessage$pi8$i32$pStdStrBuf$b$f32(szMessage, caMain.GetInnerWidth(), sMsgBroken, true);
    let pLblMessage = new Label().init$pi8$C4Rect$i32$u32$pCStdFont$b$b$b(S(""), caMain.GetFromTop$i32$i32(iMsgHeight), fTextCentered ? $.ACenter$C4Surface : $.ALeft$C4Surface, 0xffffffff, rUseFont, false);
    pLblMessage.SetText$pi8$b(sMsgBroken.getData(), false);
    Container.prototype.AddElement$pElement.call(this, pLblMessage);
    if (piConfigDontShowAgainSetting != null) {
      const w = [100];
      const h = [20];
      let szCheckText = $.LoadResStr(S("IDS_MSG_DONTSHOW"));
      CheckBox.GetStandardCheckBoxSize(P(w, 0), P(h, 0), szCheckText, null);
      let pCheck = new CheckBox().init(caMain.GetFromTop$i32$i32(h[0], w[0]), szCheckText, !(piConfigDontShowAgainSetting.a[piConfigDontShowAgainSetting.o] === 0));
      pCheck.SetOnChecked(new CallbackHandler$MessageDialog().init(this, "OnDontShowAgainCheck"));
      Container.prototype.AddElement$pElement.call(this, pCheck);
    }
    if (!fTextCentered) {
      caMain.ExpandLeft(60);
    }
    let caButtonArea = new ComponentAligner().init(caMain.GetFromTop$i32$i32(40), 0, 0);
    let iButtonCount = 0;
    let i = 1;
    while (i !== 0) {
      if ((dwButtons & i >>> 0) >>> 0 !== 0) {
        iButtonCount = iButtonCount + 1 | 0;
      }
      i = i << 1 | 0;
    }
    this.fHasOK = !!((dwButtons & 1) >>> 0 !== 0) || !!((dwButtons & 4) >>> 0 !== 0);
    let btnFocus = null;
    if (iButtonCount !== 0) {
      let rcBtn = caButtonArea.GetCentered$i32$i32(Math.imul(iButtonCount, 120) + Math.imul(iButtonCount - 1 | 0, 10) | 0, 32).$clone();
      rcBtn.Wdt = 120;
      if ((dwButtons & 1) >>> 0 !== 0) {
        let pBtnOK = new OKButton().init(rcBtn);
        Container.prototype.AddElement$pElement.call(this, pBtnOK);
        rcBtn.x = rcBtn.x + 130 | 0;
        if (!fDefaultNo) {
          btnFocus = pBtnOK;
        }
      }
      if ((dwButtons & 16) >>> 0 !== 0) {
        let pBtnRetry = new RetryButton().init(rcBtn);
        Container.prototype.AddElement$pElement.call(this, pBtnRetry);
        rcBtn.x = rcBtn.x + 130 | 0;
        if (btnFocus == null) {
          btnFocus = pBtnRetry;
        }
      }
      if ((dwButtons & 2) >>> 0 !== 0) {
        let pBtnAbort = new CancelButton().init(rcBtn);
        Container.prototype.AddElement$pElement.call(this, pBtnAbort);
        rcBtn.x = rcBtn.x + 130 | 0;
        if (btnFocus == null) {
          btnFocus = pBtnAbort;
        }
      }
      if ((dwButtons & 4) >>> 0 !== 0) {
        let pBtnYes = new YesButton().init(rcBtn);
        Container.prototype.AddElement$pElement.call(this, pBtnYes);
        rcBtn.x = rcBtn.x + 130 | 0;
        if (btnFocus == null && !fDefaultNo) {
          btnFocus = pBtnYes;
        }
      }
      if ((dwButtons & 8) >>> 0 !== 0) {
        let pBtnNo = new NoButton().init(rcBtn);
        Container.prototype.AddElement$pElement.call(this, pBtnNo);
        if (btnFocus == null) {
          btnFocus = pBtnNo;
        }
      }
      if ((dwButtons & 32) >>> 0 !== 0) {
        let pBtnReset = new ResetButton().init(rcBtn);
        Container.prototype.AddElement$pElement.call(this, pBtnReset);
        rcBtn.x = rcBtn.x + 130 | 0;
        if (btnFocus == null) {
          btnFocus = pBtnReset;
        }
      }
    }
    if (btnFocus != null) {
      this.SetFocus(btnFocus, false);
    }
    this.SetClientSize(this.GetClientRect().Wdt, this.GetClientRect().Hgt - caMain.GetHeight() | 0);
    this.sCopyText.assign($.strprintf(S("[%s] %s"), szCaption != null ? szCaption : S(""), szMessage != null ? szMessage : S("")));
    this.pKeyCopy = new $.C4KeyBinding().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(46, 2), S("GUIEditCopy"), 2 /*KEYSCOPE_Gui*/, new DlgKeyCB$MessageDialog().init(this, "KeyCopy"), 4);
    return this;
  }

  $dtor() {
    $delete(this.pKeyCopy);
    super.$dtor();
  }

  OnEnter() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== MessageDialog && MessageDialog.prototype instanceof $c) return $c.prototype.OnEnter.apply(this, arguments); }
    if (!this.fHasOK) {
      return false;
    }
    this.Close$b(true);
    return true;
  }

  OnDontShowAgainCheck(pCheckBox) {
    if (this.piConfigDontShowAgainSetting != null) {
      this.piConfigDontShowAgainSetting.a[this.piConfigDontShowAgainSetting.o] = pCheckBox.GetChecked() ? 1 : 0;
    }
  }

  KeyCopy() {
    $.Application.Copy$string$b(this.sCopyText);
    return true;
  }

  GetID$v() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== MessageDialog && MessageDialog.prototype instanceof $c) return $c.prototype.GetID$v.apply(this, arguments); }
    return S("MessageDialog");
  }

  GetZOrdering() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== MessageDialog && MessageDialog.prototype instanceof $c) return $c.prototype.GetZOrdering.apply(this, arguments); }
    return 1;
  }

  $clone() { return new MessageDialog().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.fHasOK = o.fHasOK;
    this.piConfigDontShowAgainSetting = o.piConfigDontShowAgainSetting;
    this.pKeyCopy = o.pKeyCopy;
    this.sCopyText = o.sCopyText.$clone();
    return this;
  }
}

export class ProgressDialog extends Dialog {
  pBar = null;
  pLblMessage = null;

  GetID$v() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ProgressDialog && ProgressDialog.prototype instanceof $c) return $c.prototype.GetID$v.apply(this, arguments); }
    return S("ProgressDialog");
  }

  init(szMessage, szCaption, iMaxProgress, iInitialProgress, icoIcon) {
    super.init(500, $max($.GraphicsResource.TextFont.BreakMessage$pi8$i32$pi8$i32$b$f32(szMessage, 430, null, 0, true), 40) + 150 | 0, szCaption, false);
    this.$dyn = ProgressDialog;
    let caMain = new ComponentAligner().init(this.GetClientRect(), 10, 10, true);
    let caButtonArea = new ComponentAligner().init(caMain.GetFromBottom$i32$i32(40), 0, 0);
    let rtProgressBar = caMain.GetFromBottom$i32$i32(30).$clone();
    let rcIcon = caMain.GetFromLeft$i32$i32(40).$clone();
    rcIcon.Hgt = 40;
    let pIcon = new Icon().init(rcIcon, icoIcon);
    Container.prototype.AddElement$pElement.call(this, pIcon);
    let str = new $.StdStrBuf();
    $.GraphicsResource.TextFont.BreakMessage$pi8$i32$pStdStrBuf$b$f32(szMessage, 430, str, true);
    this.pLblMessage = new Label().init$pi8$i32$i32$i32$u32$pCStdFont$b$b(str.getData(), caMain.GetAll$v().GetMiddleX(), caMain.GetAll$v().y, 1, 0xffffffff, $.GraphicsResource.TextFont);
    Container.prototype.AddElement$pElement.call(this, this.pLblMessage);
    this.pBar = new ProgressBar().init(rtProgressBar, iMaxProgress);
    this.pBar.SetProgress(iInitialProgress);
    this.pBar.SetToolTip($.LoadResStr(S("IDS_DLGTIP_PROGRESS")));
    Container.prototype.AddElement$pElement.call(this, this.pBar);
    let pBtnAbort = new CancelButton().init(caButtonArea.GetCentered$i32$i32(140, 32));
    Container.prototype.AddElement$pElement.call(this, pBtnAbort);
    return this;
  }

  SetProgress(iToProgress) {
    this.pBar.SetProgress(iToProgress);
  }

  OnEnter() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ProgressDialog && ProgressDialog.prototype instanceof $c) return $c.prototype.OnEnter.apply(this, arguments); }
    return false;
  }

  SetMessage(szMessage) {
    let str = new $.StdStrBuf();
    $.GraphicsResource.TextFont.BreakMessage$pi8$i32$pStdStrBuf$b$f32(szMessage, 430, str, true);
    this.pLblMessage.SetText$pi8$b(szMessage);
  }

  $clone() { return new ProgressDialog().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pBar = o.pBar;
    this.pLblMessage = o.pLblMessage;
    return this;
  }
}

export class InputDialog extends Dialog {
  pEdit = null;
  pCB = null;
  rcEditBounds = new $.C4Rect();
  fChatLayout = false;
  pChatLbl = null;

  GetID$v() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== InputDialog && InputDialog.prototype instanceof $c) return $c.prototype.GetID$v.apply(this, arguments); }
    return S("InputDialog");
  }

  init(szMessage, szCaption, icoIcon, pCB, fChatLayout = false) {
    super.init(fChatLayout ? Math.imul(GetScreenWdt(), 4) / 5 | 0 : 300, fChatLayout ? Edit.GetDefaultEditHeight() + 2 | 0 : $max($.GraphicsResource.TextFont.BreakMessage$pi8$i32$pi8$i32$b$f32(szMessage, 230, null, 0, true), 40) + 150 | 0, szCaption, false);
    this.pEdit = null;
    this.pCB = pCB;
    this.rcEditBounds = new $.C4Rect();
    this.fChatLayout = fChatLayout;
    this.pChatLbl = null;
    this.$dyn = InputDialog;
    if (fChatLayout) {
      let caChat = new ComponentAligner().init(this.GetContainedClientRect(), 1, 1);
      const w = [40];
      const h = [0];
      $.GraphicsResource.TextFont.GetTextExtent(szMessage, P(w, 0), P(h, 0), true);
      this.pChatLbl = new WoodenLabel().init(szMessage, caChat.GetFromLeft$i32$i32(w[0] + 4 | 0), 0xffffffff, $.GraphicsResource.TextFont);
      caChat.ExpandLeft(2);
      this.rcEditBounds.$assign(caChat.GetAll$v());
      InputDialog.prototype.SetCustomEdit.call(this, new Edit().init(this.rcEditBounds));
      this.pChatLbl.SetToolTip($.LoadResStr(S("IDS_DLGTIP_CHAT")));
      Container.prototype.AddElement$pElement.call(this, this.pChatLbl);
    } else {
      let caMain = new ComponentAligner().init(this.GetClientRect(), 10, 10, true);
      let caButtonArea = new ComponentAligner().init(caMain.GetFromBottom$i32$i32(40), 0, 0);
      this.rcEditBounds.$assign(caMain.GetFromBottom$i32$i32(Edit.GetDefaultEditHeight()));
      let rcIcon = caMain.GetFromLeft$i32$i32(40).$clone();
      rcIcon.Hgt = 40;
      let pIcon = new Icon().init(rcIcon, icoIcon);
      Container.prototype.AddElement$pElement.call(this, pIcon);
      let str = new $.StdStrBuf();
      $.GraphicsResource.TextFont.BreakMessage$pi8$i32$pStdStrBuf$b$f32(szMessage, 230, str, true);
      let pLblMessage = new Label().init$pi8$i32$i32$i32$u32$pCStdFont$b$b(str.getData(), caMain.GetAll$v().GetMiddleX(), caMain.GetAll$v().y, 1, 0xffffffff, $.GraphicsResource.TextFont);
      Container.prototype.AddElement$pElement.call(this, pLblMessage);
      InputDialog.prototype.SetCustomEdit.call(this, new Edit().init(this.rcEditBounds));
      let rcBtn = caButtonArea.GetCentered$i32$i32(250, 32).$clone();
      rcBtn.Wdt = 120;
      let pBtnOK = new OKButton().init(rcBtn);
      Container.prototype.AddElement$pElement.call(this, pBtnOK);
      rcBtn.x = rcBtn.x + (rcBtn.Wdt + 10 | 0) | 0;
      let pBtnAbort = new CancelButton().init(rcBtn);
      Container.prototype.AddElement$pElement.call(this, pBtnAbort);
      rcBtn.x = rcBtn.x + (rcBtn.Wdt + 10 | 0) | 0;
    }
    this.SetDelOnClose();
    return this;
  }

  $dtor() {
    if (this.pCB != null) {
      $delete(this.pCB);
    }
    super.$dtor();
  }

  OnClosed(fOK) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== InputDialog && InputDialog.prototype instanceof $c) return $c.prototype.OnClosed.apply(this, arguments); }
    if (this.pCB != null && fOK) {
      this.pCB.OnOK(new $.StdStrBuf().init$pi8$b(this.pEdit.GetText$v()));
    }
    Dialog.prototype.OnClosed.call(this, fOK);
  }

  SetMaxText(iMaxLen) {
    this.pEdit.SetMaxText(iMaxLen);
  }

  SetInputText(szToText) {
    this.pEdit.SelectAll();
    this.pEdit.DeleteSelection();
    if (szToText != null) {
      this.pEdit.InsertText(szToText, false);
      this.pEdit.SelectAll();
    }
  }

  GetInputText() {
    return this.pEdit.GetText$v();
  }

  SetCustomEdit(pCustomEdit) {
    if (this.pEdit != null) {
      $delete(this.pEdit);
    }
    this.pEdit = pCustomEdit;
    this.pEdit.SetBounds(this.rcEditBounds);
    if (this.fChatLayout) {
      this.pEdit.SetToolTip($.LoadResStr(S("IDS_DLGTIP_CHAT")));
      this.pChatLbl.SetClickFocusControl(this.pEdit);
    }
    Container.prototype.AddElement$pElement.call(this, this.pEdit);
    this.SetFocus(this.pEdit, false);
  }

  $clone() { return new InputDialog().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pEdit = o.pEdit;
    this.pCB = o.pCB;
    this.rcEditBounds.$assign(o.rcEditBounds);
    this.fChatLayout = o.fChatLayout;
    this.pChatLbl = o.pChatLbl;
    return this;
  }
}

export class InfoDialog extends Dialog {
  iScroll = 0;
  pTextWin = null;
  tLastTimer = new $.C4TimeMilliseconds();
  iDelay = 0;
  scheduler = null;

  CreateSubComponents() {
    let caMain = new ComponentAligner().init(this.GetClientRect(), 10, 10, true);
    let caButtonArea = new ComponentAligner().init(caMain.GetFromBottom$i32$i32(40), 0, 0);
    this.pTextWin = new TextWindow().init(caMain.GetAll$v(), 0, 0, 0, 100, 4096, S("  "), true, null, 0);
    Container.prototype.AddElement$pElement.call(this, this.pTextWin);
    let pBtnClose = new DlgCloseButton().init(caButtonArea.GetCentered$i32$i32(140, 32));
    Container.prototype.AddElement$pElement.call(this, pBtnClose);
    pBtnClose.SetToolTip($.LoadResStr(S("IDS_MNU_CLOSE")));
  }

  AddLine$pi8(szText) {
    if (this.pTextWin == null) {
      return;
    }
    this.pTextWin.AddTextLine$pi8$pCStdFont$u32$b$b$pCStdFont(szText, $.GraphicsResource.TextFont, 0xffffffff, false, true);
  }

  AddLineFmt(szFmtString, ...$va) {
    let lst = null;
    lst = { a: $va, i: 0 };
    let buf = new $.StdStrBuf();
    buf.FormatV(szFmtString, lst);
    this.AddLine$pi8(buf.getData());
  }

  BeginUpdateText() {
    if (this.pTextWin == null) {
      return;
    }
    this.iScroll = this.pTextWin.GetScrollPos();
    this.pTextWin.ClearText$b(false);
  }

  EndUpdateText() {
    if (this.pTextWin == null) {
      return;
    }
    this.pTextWin.UpdateHeight();
    this.pTextWin.SetScrollPos(this.iScroll);
  }

  UpdateText() {
  }

  OnSec1Timer() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== InfoDialog && InfoDialog.prototype instanceof $c) return $c.prototype.OnSec1Timer.apply(this, arguments); }
    this.UpdateText();
  }

  init$pi8$i32(szCaption, iLineCount) {
    super.init(620, Math.imul($.GraphicsResource.TextFont.GetLineHeight(), iLineCount) + 100 | 0, szCaption, false);
    $.C4ApplicationSec1Timer.prototype.init.call(this);
    this.iScroll = 0;
    this.$dyn = InfoDialog;
    $.StdScheduler.prototype.Add$pStdSchedulerProc.call($.Application, this);
    InfoDialog.prototype.CreateSubComponents.call(this);
    return this;
  }

  init$pi8$i32$StdStrBuf(szCaption, iLineCount, sText) {
    super.init(620, Math.imul($.GraphicsResource.TextFont.GetLineHeight(), iLineCount) + 100 | 0, szCaption, false);
    $.C4ApplicationSec1Timer.prototype.init.call(this);
    this.iScroll = 0;
    this.$dyn = InfoDialog;
    InfoDialog.prototype.CreateSubComponents.call(this);
    for (let i = 0; i < sText.getLength(); i = i + 1) {
      let i0 = i;
      while (sText.op_index(i) !== 124 && sText.op_index(i) !== 0) {
        i = i + 1;
      }
      let sLine = sText.copyPart(i0, i - i0);
      this.pTextWin.AddTextLine$pi8$pCStdFont$u32$b$b$pCStdFont(sLine.getData(), $.GraphicsResource.TextFont, 0xffffffff, false, true);
    }
    this.pTextWin.UpdateHeight();
    return this;
  }

  $dtor() {
    $.StdScheduler.prototype.Remove.call($.Application, this);
    super.$dtor();
  }

  $clone() { return new InfoDialog().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.iScroll = o.iScroll;
    this.pTextWin = o.pTextWin;
    this.tLastTimer.$assign(o.tLastTimer);
    this.iDelay = o.iDelay;
    this.scheduler = o.scheduler;
    return this;
  }
}

export class CallbackButton$C4StartupOptionsDlg$Button extends Button {
  pCB = null;
  pCallbackFn = null;

  OnPress() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== CallbackButton$C4StartupOptionsDlg$Button && CallbackButton$C4StartupOptionsDlg$Button.prototype instanceof $c) return $c.prototype.OnPress.apply(this, arguments); }
    if (this.pCallbackFn != null) {
      let pC = this.pCB;
      if (pC == null) {
        if (!((pC = Element.prototype.GetDlg.call(this)) != null)) {
          return;
        }
      }
      $spawn(pC[this.pCallbackFn](this));
    }
  }

  init$pi8$rC4Rect$x$pC4StartupOptionsDlg(szBtnText, rtBounds, pFn, pCB = null) {
    super.init(szBtnText, rtBounds);
    this.pCB = pCB;
    this.pCallbackFn = pFn;
    this.$dyn = CallbackButton$C4StartupOptionsDlg$Button;
    return this;
  }

  $clone() { return new CallbackButton$C4StartupOptionsDlg$Button().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCB = o.pCB;
    this.pCallbackFn = o.pCallbackFn;
    return this;
  }
}

export class IconButton extends Button {
  fctIcon = new $.C4Facet().init$v();
  dwClr = 0;
  fHasClr = false;
  fHighlight = false;

  DrawElement(cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== IconButton && IconButton.prototype instanceof $c) return $c.prototype.DrawElement.apply(this, arguments); }
    let x0 = ftoi32(Math.fround(cgo.TargetX + Math.fround(this.rcBounds.x)));
    let y0 = ftoi32(Math.fround(cgo.TargetY + Math.fround(this.rcBounds.y)));
    if (this.fEnabled) {
      if (this.fHighlight || this.HasDrawFocus() || this.fMouseOver && this.IsInActiveDlg(false)) {
        $.pDraw.SetBlitMode(1);
        $.GraphicsResource.fctButtonHighlightRound.DrawX(cgo.Surface, Math.fround(x0), Math.fround(y0), Math.fround(this.rcBounds.Wdt), Math.fround(this.rcBounds.Hgt));
        $.pDraw.ResetBlitMode();
      }
    }
    if (this.fHasClr && this.fctIcon.Surface != null) {
      this.fctIcon.Surface.SetClr(this.dwClr);
    }
    this.fctIcon.DrawX(cgo.Surface, Math.fround(x0), Math.fround(y0), Math.fround(this.rcBounds.Wdt), Math.fround(this.rcBounds.Hgt));
    if (this.fEnabled) {
      if (this.fDown || this.fHighlight) {
        $.pDraw.SetBlitMode(1);
        $.GraphicsResource.fctButtonHighlightRound.DrawX(cgo.Surface, Math.fround(x0), Math.fround(y0), Math.fround(this.rcBounds.Wdt), Math.fround(this.rcBounds.Hgt));
        $.pDraw.ResetBlitMode();
      }
    }
    if (this.sText.getLength() !== 0) {
      const rUseFont = this.pCustomFont != null ? this.pCustomFont : $.GraphicsResource.TextFont;
      $.pDraw.TextOut(this.sText.getData(), rUseFont, 1, cgo.Surface, Math.fround(x0 + (this.rcBounds.Wdt / 2 | 0) | 0), Math.fround(y0 + this.rcBounds.Hgt | 0), this.pCustomFont != null ? this.dwCustomFontClr : 0xffffffff, 1);
    }
  }

  init(eUseIcon, rtBounds, caHotkey = 0, tooltip_text = null) {
    super.init(S(""), rtBounds);
    this.fctIcon = new $.C4Facet().init$v();
    this.dwClr = 0;
    this.fHasClr = false;
    this.fHighlight = false;
    this.$dyn = IconButton;
    this.cHotkey = caHotkey >>> 0;
    IconButton.prototype.SetIcon$i32.call(this, eUseIcon);
    if (tooltip_text != null) {
      let tooltip_text_buf = new $.StdStrBuf().init$pi8$b(tooltip_text);
      if (this.cHotkey === 0) {
        ExpandHotkeyMarkup(tooltip_text_buf, P(this, "cHotkey"), true);
      }
      this.SetToolTip(tooltip_text_buf.getData(), true);
    }
    return this;
  }

  SetIcon$i32(eUseIcon) {
    if (eUseIcon >= 0) {
      this.fctIcon.$assign(Icon.GetIconFacet$i32(eUseIcon));
    } else {
      this.fctIcon.Surface = null;
    }
  }

  SetFacet$C4Facet$u32(rCpy, _dwClr = 0) {
    this.fctIcon.$assign(rCpy);
  }

  SetColor$u32(dwClr) {
    this.fHasClr = true;
    this.dwClr = dwClr;
  }

  SetHighlight(fToVal) {
    this.fHighlight = fToVal;
  }

  GetHighlight() {
    return this.fHighlight;
  }

  $clone() { return new IconButton().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.fctIcon.$assign(o.fctIcon);
    this.dwClr = o.dwClr;
    this.fHasClr = o.fHasClr;
    this.fHighlight = o.fHighlight;
    return this;
  }
}

export class ArrowButton extends Button {
  eDir = 0;

  DrawElement(cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ArrowButton && ArrowButton.prototype instanceof $c) return $c.prototype.DrawElement.apply(this, arguments); }
    let x0 = ftoi32(Math.fround(cgo.TargetX + Math.fround(this.rcBounds.x)));
    let y0 = ftoi32(Math.fround(cgo.TargetY + Math.fround(this.rcBounds.y)));
    if (this.fEnabled) {
      if (this.HasDrawFocus() || this.fMouseOver && this.IsInActiveDlg(false)) {
        $.pDraw.SetBlitMode(1);
        $.GraphicsResource.fctButtonHighlightRound.DrawX(cgo.Surface, Math.fround(x0), Math.fround(y0), Math.fround(this.rcBounds.Wdt), Math.fround(this.rcBounds.Hgt));
        $.pDraw.ResetBlitMode();
      }
    }
    let iFctIdx = this.eDir;
    if (this.fDown) {
      iFctIdx = iFctIdx + 2 | 0;
    }
    $.GraphicsResource.fctBigArrows.GetPhase(iFctIdx).DrawX(cgo.Surface, Math.fround(x0), Math.fround(y0), Math.fround(this.rcBounds.Wdt), Math.fround(this.rcBounds.Hgt));
  }

  init(eDir, rtBounds, cHotkey = 0) {
    super.init(S(""), rtBounds);
    this.eDir = eDir;
    this.$dyn = ArrowButton;
    this.cHotkey = cHotkey >>> 0;
    return this;
  }

  static GetDefaultWidth() {
    return ftoi32($.GraphicsResource.fctBigArrows.Wdt);
  }

  static GetDefaultHeight$v() {
    return ftoi32($.GraphicsResource.fctBigArrows.Hgt);
  }

  $clone() { return new ArrowButton().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.eDir = o.eDir;
    return this;
  }
}

export class FacetButton extends Button {
  fctBase = new $.C4Facet().init$v();
  fctHighlight = new $.C4Facet().init$v();
  dwTextClrInact = 0;
  dwTextClrAct = 0;
  rcfDrawBounds = new $.FLOAT_RECT();
  iTxtOffX = 0;
  iTxtOffY = 0;
  byTxtAlign = 0;
  pFont = null;
  fFontZoom = 0;

  DrawElement(cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== FacetButton && FacetButton.prototype instanceof $c) return $c.prototype.DrawElement.apply(this, arguments); }
    let x0 = Math.fround(this.rcfDrawBounds.left + cgo.TargetX);
    let y0 = Math.fround(this.rcfDrawBounds.top + cgo.TargetY);
    let dwTextClr = 0;
    if ((this.HasDrawFocus() || this.fMouseOver && this.IsInActiveDlg(false)) && this.fEnabled) {
      this.fctHighlight.DrawXFloat(cgo.Surface, x0, y0, Math.fround(this.rcfDrawBounds.right - this.rcfDrawBounds.left), Math.fround(this.rcfDrawBounds.bottom - this.rcfDrawBounds.top));
      dwTextClr = this.dwTextClrAct;
    } else {
      this.fctBase.DrawXFloat(cgo.Surface, x0, y0, Math.fround(this.rcfDrawBounds.right - this.rcfDrawBounds.left), Math.fround(this.rcfDrawBounds.bottom - this.rcfDrawBounds.top));
      dwTextClr = this.dwTextClrInact;
    }
    if (this.sText.getLength() > 0) {
      let pUseFont = this.pFont != null ? this.pFont : $.GraphicsResource.GetFontByHeight(this.rcBounds.Hgt, P(this, "fFontZoom"));
      $.pDraw.TextOut(this.sText.getData(), pUseFont, this.fFontZoom, cgo.Surface, Math.fround(ftoi32(Math.fround(x0 + Math.fround(this.iTxtOffX)))), Math.fround(ftoi32(Math.fround(y0 + Math.fround(this.iTxtOffY)))), dwTextClr, this.byTxtAlign, true);
    }
  }

  init(rBaseFct, rHighlightFct, rtfBounds, cHotkey) {
    super.init(S(""), new $.C4Rect().init$FLOAT_RECT(rtfBounds));
    this.fctBase = rBaseFct.$clone();
    this.fctHighlight = rHighlightFct.$clone();
    this.dwTextClrInact = 0x7f000000;
    this.dwTextClrAct = 0xff000000;
    this.rcfDrawBounds = rtfBounds.$clone();
    this.pFont = null;
    this.fFontZoom = 1;
    this.$dyn = FacetButton;
    this.cHotkey = cHotkey >>> 0;
    this.iTxtOffX = this.iTxtOffY = 0;
    this.byTxtAlign = 0;
    return this;
  }

  SetTextColors(dwClrInact, dwClrAct) {
    this.dwTextClrInact = dwClrInact;
    this.dwTextClrAct = dwClrAct;
  }

  SetTextPos(iOffX, iOffY, byAlign = 1) {
    this.iTxtOffX = iOffX;
    this.iTxtOffY = iOffY;
    this.byTxtAlign = byAlign;
  }

  SetTextFont(pFont, fFontZoom = 1) {
    this.pFont = pFont;
    this.fFontZoom = fFontZoom;
  }

  $clone() { return new FacetButton().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.fctBase.$assign(o.fctBase);
    this.fctHighlight.$assign(o.fctHighlight);
    this.dwTextClrInact = o.dwTextClrInact;
    this.dwTextClrAct = o.dwTextClrAct;
    this.rcfDrawBounds.$assign(o.rcfDrawBounds);
    this.iTxtOffX = o.iTxtOffX;
    this.iTxtOffY = o.iTxtOffY;
    this.byTxtAlign = o.byTxtAlign;
    this.pFont = o.pFont;
    this.fFontZoom = o.fFontZoom;
    return this;
  }
}

export class CallbackButton$C4GameOverDlg$Button extends Button {
  pCB = null;
  pCallbackFn = null;

  OnPress() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== CallbackButton$C4GameOverDlg$Button && CallbackButton$C4GameOverDlg$Button.prototype instanceof $c) return $c.prototype.OnPress.apply(this, arguments); }
    if (this.pCallbackFn != null) {
      let pC = this.pCB;
      if (pC == null) {
        if (!((pC = Element.prototype.GetDlg.call(this)) != null)) {
          return;
        }
      }
      $spawn(pC[this.pCallbackFn](this));
    }
  }

  init$pi8$rC4Rect$x$pC4GameOverDlg(szBtnText, rtBounds, pFn, pCB = null) {
    super.init(szBtnText, rtBounds);
    this.pCB = pCB;
    this.pCallbackFn = pFn;
    this.$dyn = CallbackButton$C4GameOverDlg$Button;
    return this;
  }

  $clone() { return new CallbackButton$C4GameOverDlg$Button().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCB = o.pCB;
    this.pCallbackFn = o.pCallbackFn;
    return this;
  }
}

export class CallbackButton$C4StartupAboutDlg$Button extends Button {
  pCB = null;
  pCallbackFn = null;

  OnPress() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== CallbackButton$C4StartupAboutDlg$Button && CallbackButton$C4StartupAboutDlg$Button.prototype instanceof $c) return $c.prototype.OnPress.apply(this, arguments); }
    if (this.pCallbackFn != null) {
      let pC = this.pCB;
      if (pC == null) {
        if (!((pC = Element.prototype.GetDlg.call(this)) != null)) {
          return;
        }
      }
      $spawn(pC[this.pCallbackFn](this));
    }
  }

  init$pi8$rC4Rect$x$pC4StartupAboutDlg(szBtnText, rtBounds, pFn, pCB = null) {
    super.init(szBtnText, rtBounds);
    this.pCB = pCB;
    this.pCallbackFn = pFn;
    this.$dyn = CallbackButton$C4StartupAboutDlg$Button;
    return this;
  }

  $clone() { return new CallbackButton$C4StartupAboutDlg$Button().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCB = o.pCB;
    this.pCallbackFn = o.pCallbackFn;
    return this;
  }
}

export class CallbackButton$C4StartupLegalDlg$Button extends Button {
  pCB = null;
  pCallbackFn = null;

  OnPress() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== CallbackButton$C4StartupLegalDlg$Button && CallbackButton$C4StartupLegalDlg$Button.prototype instanceof $c) return $c.prototype.OnPress.apply(this, arguments); }
    if (this.pCallbackFn != null) {
      let pC = this.pCB;
      if (pC == null) {
        if (!((pC = Element.prototype.GetDlg.call(this)) != null)) {
          return;
        }
      }
      $spawn(pC[this.pCallbackFn](this));
    }
  }

  init$pi8$rC4Rect$x$pC4StartupLegalDlg(szBtnText, rtBounds, pFn, pCB = null) {
    super.init(szBtnText, rtBounds);
    this.pCB = pCB;
    this.pCallbackFn = pFn;
    this.$dyn = CallbackButton$C4StartupLegalDlg$Button;
    return this;
  }

  $clone() { return new CallbackButton$C4StartupLegalDlg$Button().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCB = o.pCB;
    this.pCallbackFn = o.pCallbackFn;
    return this;
  }
}

export class CallbackButton$C4StartupMainDlg$Button extends Button {
  pCB = null;
  pCallbackFn = null;

  OnPress() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== CallbackButton$C4StartupMainDlg$Button && CallbackButton$C4StartupMainDlg$Button.prototype instanceof $c) return $c.prototype.OnPress.apply(this, arguments); }
    if (this.pCallbackFn != null) {
      let pC = this.pCB;
      if (pC == null) {
        if (!((pC = Element.prototype.GetDlg.call(this)) != null)) {
          return;
        }
      }
      $spawn(pC[this.pCallbackFn](this));
    }
  }

  init$pi8$rC4Rect$x$pC4StartupMainDlg(szBtnText, rtBounds, pFn, pCB = null) {
    super.init(szBtnText, rtBounds);
    this.pCB = pCB;
    this.pCallbackFn = pFn;
    this.$dyn = CallbackButton$C4StartupMainDlg$Button;
    return this;
  }

  $clone() { return new CallbackButton$C4StartupMainDlg$Button().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCB = o.pCB;
    this.pCallbackFn = o.pCallbackFn;
    return this;
  }
}

export class CallbackButton$C4StartupPlrSelDlg$Button extends Button {
  pCB = null;
  pCallbackFn = null;

  OnPress() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== CallbackButton$C4StartupPlrSelDlg$Button && CallbackButton$C4StartupPlrSelDlg$Button.prototype instanceof $c) return $c.prototype.OnPress.apply(this, arguments); }
    if (this.pCallbackFn != null) {
      let pC = this.pCB;
      if (pC == null) {
        if (!((pC = Element.prototype.GetDlg.call(this)) != null)) {
          return;
        }
      }
      $spawn(pC[this.pCallbackFn](this));
    }
  }

  init$pi8$rC4Rect$x$pC4StartupPlrSelDlg(szBtnText, rtBounds, pFn, pCB = null) {
    super.init(szBtnText, rtBounds);
    this.pCB = pCB;
    this.pCallbackFn = pFn;
    this.$dyn = CallbackButton$C4StartupPlrSelDlg$Button;
    return this;
  }

  $clone() { return new CallbackButton$C4StartupPlrSelDlg$Button().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCB = o.pCB;
    this.pCallbackFn = o.pCallbackFn;
    return this;
  }
}

export class CallbackButton$C4StartupScenSelDlg$Button extends Button {
  pCB = null;
  pCallbackFn = null;

  OnPress() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== CallbackButton$C4StartupScenSelDlg$Button && CallbackButton$C4StartupScenSelDlg$Button.prototype instanceof $c) return $c.prototype.OnPress.apply(this, arguments); }
    if (this.pCallbackFn != null) {
      let pC = this.pCB;
      if (pC == null) {
        if (!((pC = Element.prototype.GetDlg.call(this)) != null)) {
          return;
        }
      }
      $spawn(pC[this.pCallbackFn](this));
    }
  }

  init$pi8$rC4Rect$x$pC4StartupScenSelDlg(szBtnText, rtBounds, pFn, pCB = null) {
    super.init(szBtnText, rtBounds);
    this.pCB = pCB;
    this.pCallbackFn = pFn;
    this.$dyn = CallbackButton$C4StartupScenSelDlg$Button;
    return this;
  }

  $clone() { return new CallbackButton$C4StartupScenSelDlg$Button().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCB = o.pCB;
    this.pCallbackFn = o.pCallbackFn;
    return this;
  }
}

export class CallbackEdit$C4ChatInputDialog extends Edit {
  pCBCtrl = null;
  pCBFunc = null;
  pCBAbortFunc = null;

  OnFinishInput(fPasting, fPastingMore) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== CallbackEdit$C4ChatInputDialog && CallbackEdit$C4ChatInputDialog.prototype instanceof $c) return $c.prototype.OnFinishInput.apply(this, arguments); }
    if (this.pCBFunc != null && this.pCBCtrl != null) {
      return $spawn(this.pCBCtrl[this.pCBFunc](this, fPasting, fPastingMore));
    } else {
      return 1 /*IR_CloseDlg*/;
    }
  }

  OnAbortInput() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== CallbackEdit$C4ChatInputDialog && CallbackEdit$C4ChatInputDialog.prototype instanceof $c) return $c.prototype.OnAbortInput.apply(this, arguments); }
    if (this.pCBAbortFunc != null && this.pCBCtrl != null) {
      $spawn(this.pCBCtrl[this.pCBAbortFunc]());
    }
  }

  init(rtBounds, pCBCtrl, pCBFunc, pCBAbortFunc) {
    super.init(rtBounds);
    this.pCBCtrl = pCBCtrl;
    this.pCBFunc = pCBFunc;
    this.pCBAbortFunc = pCBAbortFunc;
    this.$dyn = CallbackEdit$C4ChatInputDialog;
    return this;
  }

  $clone() { return new CallbackEdit$C4ChatInputDialog().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCBCtrl = o.pCBCtrl;
    this.pCBFunc = o.pCBFunc;
    this.pCBAbortFunc = o.pCBAbortFunc;
    return this;
  }
}

export class CallbackEdit$C4StartupScenSelDlg extends Edit {
  pCBCtrl = null;
  pCBFunc = null;
  pCBAbortFunc = null;

  OnFinishInput(fPasting, fPastingMore) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== CallbackEdit$C4StartupScenSelDlg && CallbackEdit$C4StartupScenSelDlg.prototype instanceof $c) return $c.prototype.OnFinishInput.apply(this, arguments); }
    if (this.pCBFunc != null && this.pCBCtrl != null) {
      return $spawn(this.pCBCtrl[this.pCBFunc](this, fPasting, fPastingMore));
    } else {
      return 1 /*IR_CloseDlg*/;
    }
  }

  OnAbortInput() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== CallbackEdit$C4StartupScenSelDlg && CallbackEdit$C4StartupScenSelDlg.prototype instanceof $c) return $c.prototype.OnAbortInput.apply(this, arguments); }
    if (this.pCBAbortFunc != null && this.pCBCtrl != null) {
      $spawn(this.pCBCtrl[this.pCBAbortFunc]());
    }
  }

  init(rtBounds, pCBCtrl, pCBFunc, pCBAbortFunc = null) {
    super.init(rtBounds);
    this.pCBCtrl = pCBCtrl;
    this.pCBFunc = pCBFunc;
    this.pCBAbortFunc = pCBAbortFunc;
    this.$dyn = CallbackEdit$C4StartupScenSelDlg;
    return this;
  }

  $clone() { return new CallbackEdit$C4StartupScenSelDlg().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCBCtrl = o.pCBCtrl;
    this.pCBFunc = o.pCBFunc;
    this.pCBAbortFunc = o.pCBAbortFunc;
    return this;
  }
}

export class RenameEdit extends Edit {
  pKeyAbort = null;
  fFinishing = false;
  pForLabel = null;
  pPrevFocusCtrl = null;

  init(pLabel) {
    super.init(pLabel.GetBounds(), true);
    this.fFinishing = false;
    this.pForLabel = pLabel;
    this.$dyn = RenameEdit;
    0;
    this.pForLabel.SetVisibility(false);
    this.InsertText(this.pForLabel.GetText$v(), true);
    let pCont = this.pForLabel.GetParent();
    0;
    Container.prototype.AddElement$pElement.call(pCont, this);
    let pDlg = this.GetDlg();
    if (pDlg != null) {
      this.pPrevFocusCtrl = pDlg.GetFocus();
      pDlg.SetFocus(this, false);
    } else {
      this.pPrevFocusCtrl = null;
    }
    let keys = [];
    $vpush(keys, new $.C4KeyCodeEx().init(1));
    if ($.Config.Controls.GamepadGuiControl !== 0) {
      $.Cancel(keys);
    }
    this.pKeyAbort = new $.C4KeyBinding().init$vector$pi8$i32$pC4KeyboardCallbackInterface$u32(keys, S("GUIRenameEditAbort"), 2 /*KEYSCOPE_Gui*/, new ControlKeyCB$RenameEdit().init(this, "KeyAbort"), 5);
    return this;
  }

  $dtor() {
    $delete(this.pKeyAbort);
    super.$dtor();
  }

  Abort$v() {
    this.OnCancelRename();
    this.FinishRename();
  }

  FinishRename() {
    this.fFinishing = true;
    this.pForLabel.SetVisibility(true);
    let pDlg = this.GetDlg();
    if (pDlg != null && this.pPrevFocusCtrl != null) {
      pDlg.SetFocus(this.pPrevFocusCtrl, false);
    }
    $delete(this);
  }

  KeyAbort() {
    this.Abort$v();
    return true;
  }

  OnFinishInput(_fPasting, _fPastingMore) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== RenameEdit && RenameEdit.prototype instanceof $c) return $c.prototype.OnFinishInput.apply(this, arguments); }
    if (this.Text == null || this.Text.a[this.Text.o] === 0) {
      this.OnCancelRename();
      this.FinishRename();
    } else {
      switch (this.OnOKRename(this.Text)) {
        case 0:
          {
            let pDlg = this.GetDlg();
            if (pDlg != null) {
              if (pDlg.GetFocus() !== this) {
                pDlg.SetFocus(this, false);
              }
            }
            this.SelectAll();
            break;
          }
        case 1:
          this.FinishRename();
          break;
        case 2:
          break;
      }
    }
    return 3 /*IR_Abort*/;
  }

  OnLooseFocus() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== RenameEdit && RenameEdit.prototype instanceof $c) return $c.prototype.OnLooseFocus.apply(this, arguments); }
    Edit.prototype.OnLooseFocus.call(this);
    if (!this.fFinishing) {
      this.OnFinishInput(false, false);
    }
  }

  OnCancelRename() {
  }

  $clone() { return new RenameEdit().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pKeyAbort = o.pKeyAbort;
    this.fFinishing = o.fFinishing;
    this.pForLabel = o.pForLabel;
    this.pPrevFocusCtrl = o.pPrevFocusCtrl;
    return this;
  }
}

export class CloseButton extends Button {
  fCloseResult = false;

  OnPress() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== CloseButton && CloseButton.prototype instanceof $c) return $c.prototype.OnPress.apply(this, arguments); }
    let pDlg = null;
    if ((pDlg = this.GetDlg()) != null) {
      $spawn(pDlg.UserClose$b(this.fCloseResult));
    }
  }

  init(szBtnText, rtBounds, fResult) {
    super.init(szBtnText, rtBounds);
    this.fCloseResult = fResult;
    this.$dyn = CloseButton;
    return this;
  }

  $clone() { return new CloseButton().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.fCloseResult = o.fCloseResult;
    return this;
  }
}

export class ConfirmationDialog extends MessageDialog {
  pCB = null;

  init(szMessage, szCaption, pCB, dwButtons = 3, fSmall = false, icoIcon = 18 /*Ico_Confirm*/) {
    super.init(szMessage, szCaption, dwButtons, icoIcon, fSmall ? 300 /*dsSmall*/ : 500 /*dsRegular*/);
    this.$dyn = ConfirmationDialog;
    if ((this.pCB = pCB) != null) {
      pCB.Ref();
    }
    $.LogSilentF(S("[Cnf] %s: %s"), szCaption, szMessage);
    this.SetDelOnClose();
    return this;
  }

  $dtor() {
    if (this.pCB != null) {
      this.pCB.DeRef();
    }
    super.$dtor();
  }

  OnClosed(fOK) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== ConfirmationDialog && ConfirmationDialog.prototype instanceof $c) return $c.prototype.OnClosed.apply(this, arguments); }
    let pStackCB = fOK ? this.pCB : null;
    if (pStackCB != null) {
      pStackCB.Ref();
    }
    Dialog.prototype.OnClosed.call(this, fOK);
    if (pStackCB != null) {
      pStackCB.DoCall$pElement(null);
      pStackCB.DeRef();
    }
  }

  $clone() { return new ConfirmationDialog().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCB = o.pCB;
    return this;
  }
}

export class CallbackButton$ScriptPlayersListItem$IconButton extends IconButton {
  pCB = null;
  pCallbackFn = null;

  OnPress() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== CallbackButton$ScriptPlayersListItem$IconButton && CallbackButton$ScriptPlayersListItem$IconButton.prototype instanceof $c) return $c.prototype.OnPress.apply(this, arguments); }
    if (this.pCallbackFn != null) {
      let pC = this.pCB;
      if (pC == null) {
        if (!((pC = Element.prototype.GetDlg.call(this)) != null)) {
          return;
        }
      }
      pC[this.pCallbackFn](this);
    }
  }

  init$i32$C4Rect$i8$x$pScriptPlayersListItem(eUseIcon, rtBounds, cHotkey, pFn, pCB) {
    super.init(eUseIcon, rtBounds, cHotkey);
    this.pCB = pCB;
    this.pCallbackFn = pFn;
    this.$dyn = CallbackButton$ScriptPlayersListItem$IconButton;
    return this;
  }

  $clone() { return new CallbackButton$ScriptPlayersListItem$IconButton().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCB = o.pCB;
    this.pCallbackFn = o.pCallbackFn;
    return this;
  }
}

export class CallbackButton$C4StartupPlrPropertiesDlg$ArrowButton extends ArrowButton {
  pCB = null;
  pCallbackFn = null;

  OnPress() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== CallbackButton$C4StartupPlrPropertiesDlg$ArrowButton && CallbackButton$C4StartupPlrPropertiesDlg$ArrowButton.prototype instanceof $c) return $c.prototype.OnPress.apply(this, arguments); }
    if (this.pCallbackFn != null) {
      let pC = this.pCB;
      if (pC == null) {
        if (!((pC = Element.prototype.GetDlg.call(this)) != null)) {
          return;
        }
      }
      $spawn(pC[this.pCallbackFn](this));
    }
  }

  init$i32$C4Rect$x$pC4StartupPlrPropertiesDlg(eDir, rtBounds, pFn, pCB = null) {
    super.init(eDir, rtBounds, 0);
    this.pCB = pCB;
    this.pCallbackFn = pFn;
    this.$dyn = CallbackButton$C4StartupPlrPropertiesDlg$ArrowButton;
    return this;
  }

  $clone() { return new CallbackButton$C4StartupPlrPropertiesDlg$ArrowButton().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCB = o.pCB;
    this.pCallbackFn = o.pCallbackFn;
    return this;
  }
}

export class CallbackButton$C4StartupPlrPropertiesDlg$IconButton extends IconButton {
  pCB = null;
  pCallbackFn = null;

  OnPress() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== CallbackButton$C4StartupPlrPropertiesDlg$IconButton && CallbackButton$C4StartupPlrPropertiesDlg$IconButton.prototype instanceof $c) return $c.prototype.OnPress.apply(this, arguments); }
    if (this.pCallbackFn != null) {
      let pC = this.pCB;
      if (pC == null) {
        if (!((pC = Element.prototype.GetDlg.call(this)) != null)) {
          return;
        }
      }
      $spawn(pC[this.pCallbackFn](this));
    }
  }

  init$i32$C4Rect$i8$x$pC4StartupPlrPropertiesDlg(eUseIcon, rtBounds, cHotkey, pFn, pCB = null) {
    super.init(eUseIcon, rtBounds, cHotkey);
    this.pCB = pCB;
    this.pCallbackFn = pFn;
    this.$dyn = CallbackButton$C4StartupPlrPropertiesDlg$IconButton;
    return this;
  }

  $clone() { return new CallbackButton$C4StartupPlrPropertiesDlg$IconButton().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCB = o.pCB;
    this.pCallbackFn = o.pCallbackFn;
    return this;
  }
}

export class CallbackButtonEx$ConnectionListItem$IconButton extends IconButton {
  pCBTarget = null;
  pCallbackFn = null;

  OnPress() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== CallbackButtonEx$ConnectionListItem$IconButton && CallbackButtonEx$ConnectionListItem$IconButton.prototype instanceof $c) return $c.prototype.OnPress.apply(this, arguments); }
    this.pCBTarget[this.pCallbackFn](this);
  }

  init$i32$C4Rect$i8$pConnectionListItem$x(eUseIcon, rtBounds, cHotkey, pCBTarget, pFn) {
    super.init(eUseIcon, rtBounds, cHotkey);
    this.pCBTarget = pCBTarget;
    this.pCallbackFn = pFn;
    this.$dyn = CallbackButtonEx$ConnectionListItem$IconButton;
    return this;
  }

  $clone() { return new CallbackButtonEx$ConnectionListItem$IconButton().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCBTarget = o.pCBTarget;
    this.pCallbackFn = o.pCallbackFn;
    return this;
  }
}

export class CallbackButton$C4GameOptionButtons$IconButton extends IconButton {
  pCB = null;
  pCallbackFn = null;

  OnPress() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== CallbackButton$C4GameOptionButtons$IconButton && CallbackButton$C4GameOptionButtons$IconButton.prototype instanceof $c) return $c.prototype.OnPress.apply(this, arguments); }
    if (this.pCallbackFn != null) {
      let pC = this.pCB;
      if (pC == null) {
        if (!((pC = Element.prototype.GetDlg.call(this)) != null)) {
          return;
        }
      }
      pC[this.pCallbackFn](this);
    }
  }

  init$i32$C4Rect$pi8$x$pC4GameOptionButtons(eUseIcon, rtBounds, tooltip_text, pFn, pCB) {
    super.init(eUseIcon, rtBounds, 0, tooltip_text);
    this.pCB = pCB;
    this.pCallbackFn = pFn;
    this.$dyn = CallbackButton$C4GameOptionButtons$IconButton;
    return this;
  }

  $clone() { return new CallbackButton$C4GameOptionButtons$IconButton().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCB = o.pCB;
    this.pCallbackFn = o.pCallbackFn;
    return this;
  }
}

export class CallbackButton$ClientListItem$IconButton extends IconButton {
  pCB = null;
  pCallbackFn = null;

  OnPress() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== CallbackButton$ClientListItem$IconButton && CallbackButton$ClientListItem$IconButton.prototype instanceof $c) return $c.prototype.OnPress.apply(this, arguments); }
    if (this.pCallbackFn != null) {
      let pC = this.pCB;
      if (pC == null) {
        if (!((pC = Element.prototype.GetDlg.call(this)) != null)) {
          return;
        }
      }
      pC[this.pCallbackFn](this);
    }
  }

  init$i32$C4Rect$i8$x$pClientListItem(eUseIcon, rtBounds, cHotkey, pFn, pCB) {
    super.init(eUseIcon, rtBounds, cHotkey);
    this.pCB = pCB;
    this.pCallbackFn = pFn;
    this.$dyn = CallbackButton$ClientListItem$IconButton;
    return this;
  }

  $clone() { return new CallbackButton$ClientListItem$IconButton().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCB = o.pCB;
    this.pCallbackFn = o.pCallbackFn;
    return this;
  }
}

export class CallbackButton$ControlConfigArea$IconButton extends IconButton {
  pCB = null;
  pCallbackFn = null;

  OnPress() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== CallbackButton$ControlConfigArea$IconButton && CallbackButton$ControlConfigArea$IconButton.prototype instanceof $c) return $c.prototype.OnPress.apply(this, arguments); }
    if (this.pCallbackFn != null) {
      let pC = this.pCB;
      if (pC == null) {
        if (!((pC = Element.prototype.GetDlg.call(this)) != null)) {
          return;
        }
      }
      pC[this.pCallbackFn](this);
    }
  }

  init$i32$C4Rect$i8$x$pControlConfigArea(eUseIcon, rtBounds, cHotkey, pFn, pCB) {
    super.init(eUseIcon, rtBounds, cHotkey);
    this.pCB = pCB;
    this.pCallbackFn = pFn;
    this.$dyn = CallbackButton$ControlConfigArea$IconButton;
    return this;
  }

  $clone() { return new CallbackButton$ControlConfigArea$IconButton().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCB = o.pCB;
    this.pCallbackFn = o.pCallbackFn;
    return this;
  }
}

export class CallbackButton$Dialog$IconButton extends IconButton {
  pCB = null;
  pCallbackFn = null;

  OnPress() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== CallbackButton$Dialog$IconButton && CallbackButton$Dialog$IconButton.prototype instanceof $c) return $c.prototype.OnPress.apply(this, arguments); }
    if (this.pCallbackFn != null) {
      let pC = this.pCB;
      if (pC == null) {
        if (!((pC = Element.prototype.GetDlg.call(this)) != null)) {
          return;
        }
      }
      $spawn(pC[this.pCallbackFn](this));
    }
  }

  init$i32$C4Rect$i8$x$pDialog(eUseIcon, rtBounds, cHotkey, pFn, pCB = null) {
    super.init(eUseIcon, rtBounds, cHotkey);
    this.pCB = pCB;
    this.pCallbackFn = pFn;
    this.$dyn = CallbackButton$Dialog$IconButton;
    return this;
  }

  $clone() { return new CallbackButton$Dialog$IconButton().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCB = o.pCB;
    this.pCallbackFn = o.pCallbackFn;
    return this;
  }
}

export class CallbackButtonEx$ClientListItem$IconButton extends IconButton {
  pCBTarget = null;
  pCallbackFn = null;

  OnPress() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== CallbackButtonEx$ClientListItem$IconButton && CallbackButtonEx$ClientListItem$IconButton.prototype instanceof $c) return $c.prototype.OnPress.apply(this, arguments); }
    this.pCBTarget[this.pCallbackFn](this);
  }

  init$i32$C4Rect$i8$pClientListItem$x(eUseIcon, rtBounds, cHotkey, pCBTarget, pFn) {
    super.init(eUseIcon, rtBounds, cHotkey);
    this.pCBTarget = pCBTarget;
    this.pCallbackFn = pFn;
    this.$dyn = CallbackButtonEx$ClientListItem$IconButton;
    return this;
  }

  $clone() { return new CallbackButtonEx$ClientListItem$IconButton().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCBTarget = o.pCBTarget;
    this.pCallbackFn = o.pCallbackFn;
    return this;
  }
}

export class CallbackButtonEx$C4StartupScenSelDlg$FacetButton extends FacetButton {
  pCBTarget = null;
  pCallbackFn = null;

  OnPress() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== CallbackButtonEx$C4StartupScenSelDlg$FacetButton && CallbackButtonEx$C4StartupScenSelDlg$FacetButton.prototype instanceof $c) return $c.prototype.OnPress.apply(this, arguments); }
    $spawn(this.pCBTarget[this.pCallbackFn](this));
  }

  init$C4Facet$C4Facet$FLOAT_RECT$i8$pC4StartupScenSelDlg$x(fctBase, fctHighlight, rtfBounds, cHotkey, pCBTarget, pFn) {
    super.init(fctBase, fctHighlight, rtfBounds, cHotkey);
    this.pCBTarget = pCBTarget;
    this.pCallbackFn = pFn;
    this.$dyn = CallbackButtonEx$C4StartupScenSelDlg$FacetButton;
    return this;
  }

  $clone() { return new CallbackButtonEx$C4StartupScenSelDlg$FacetButton().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCBTarget = o.pCBTarget;
    this.pCallbackFn = o.pCallbackFn;
    return this;
  }
}

export class CallbackRenameEdit$CrewListItem$RenameParams extends RenameEdit {
  pCBCancelFunc = null;
  pCBOKFunc = null;
  pDlg = null;
  par = new $.C4StartupPlrSelDlg$CrewListItem$RenameParams();

  OnCancelRename() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== CallbackRenameEdit$CrewListItem$RenameParams && CallbackRenameEdit$CrewListItem$RenameParams.prototype instanceof $c) return $c.prototype.OnCancelRename.apply(this, arguments); }
    if (this.pDlg != null && this.pCBCancelFunc != null) {
      $spawn(this.pDlg[this.pCBCancelFunc](this.par.$clone()));
    }
  }

  OnOKRename(szNewName) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== CallbackRenameEdit$CrewListItem$RenameParams && CallbackRenameEdit$CrewListItem$RenameParams.prototype instanceof $c) return $c.prototype.OnOKRename.apply(this, arguments); }
    return this.pDlg != null && this.pCBOKFunc != null ? $spawn(this.pDlg[this.pCBOKFunc](this.par.$clone(), szNewName)) : 1 /*RR_Accepted*/;
  }

  init(pForLabel, pDlg, par, pCBOKFunc, pCBCancelFunc) {
    super.init(pForLabel);
    this.pCBCancelFunc = pCBCancelFunc;
    this.pCBOKFunc = pCBOKFunc;
    this.pDlg = pDlg;
    this.par = par.$clone();
    this.$dyn = CallbackRenameEdit$CrewListItem$RenameParams;
    return this;
  }

  $clone() { return new CallbackRenameEdit$CrewListItem$RenameParams().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCBCancelFunc = o.pCBCancelFunc;
    this.pCBOKFunc = o.pCBOKFunc;
    this.pDlg = o.pDlg;
    this.par.$assign(o.par);
    return this;
  }
}

export class CallbackRenameEdit$ScenListItem$RenameParams extends RenameEdit {
  pCBCancelFunc = null;
  pCBOKFunc = null;
  pDlg = null;
  par = new $.C4StartupScenSelDlg$ScenListItem$RenameParams();

  OnCancelRename() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== CallbackRenameEdit$ScenListItem$RenameParams && CallbackRenameEdit$ScenListItem$RenameParams.prototype instanceof $c) return $c.prototype.OnCancelRename.apply(this, arguments); }
    if (this.pDlg != null && this.pCBCancelFunc != null) {
      $spawn(this.pDlg[this.pCBCancelFunc](this.par.$clone()));
    }
  }

  OnOKRename(szNewName) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== CallbackRenameEdit$ScenListItem$RenameParams && CallbackRenameEdit$ScenListItem$RenameParams.prototype instanceof $c) return $c.prototype.OnOKRename.apply(this, arguments); }
    return this.pDlg != null && this.pCBOKFunc != null ? $spawn(this.pDlg[this.pCBOKFunc](this.par.$clone(), szNewName)) : 1 /*RR_Accepted*/;
  }

  init(pForLabel, pDlg, par, pCBOKFunc, pCBCancelFunc) {
    super.init(pForLabel);
    this.pCBCancelFunc = pCBCancelFunc;
    this.pCBOKFunc = pCBOKFunc;
    this.pDlg = pDlg;
    this.par = par.$clone();
    this.$dyn = CallbackRenameEdit$ScenListItem$RenameParams;
    return this;
  }

  $clone() { return new CallbackRenameEdit$ScenListItem$RenameParams().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCBCancelFunc = o.pCBCancelFunc;
    this.pCBOKFunc = o.pCBOKFunc;
    this.pDlg = o.pDlg;
    this.par.$assign(o.par);
    return this;
  }
}

export class CloseIconButton extends IconButton {
  fCloseResult = false;

  OnPress() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== CloseIconButton && CloseIconButton.prototype instanceof $c) return $c.prototype.OnPress.apply(this, arguments); }
    let pDlg = null;
    if ((pDlg = this.GetDlg()) != null) {
      $spawn(pDlg.UserClose$b(this.fCloseResult));
    }
  }

  init(rtBounds, eIcon, fResult) {
    super.init(eIcon, rtBounds, 0);
    this.fCloseResult = fResult;
    this.$dyn = CloseIconButton;
    return this;
  }

  $clone() { return new CloseIconButton().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.fCloseResult = o.fCloseResult;
    return this;
  }
}

export class OKButton extends CloseButton {

  init(rtBounds) {
    super.init($.LoadResStr(S("IDS_DLG_OK")), rtBounds, true);
    this.$dyn = OKButton;
    return this;
  }

  $clone() { return new OKButton().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class CancelButton extends CloseButton {

  init(rtBounds) {
    super.init($.LoadResStr(S("IDS_DLG_CANCEL")), rtBounds, false);
    this.$dyn = CancelButton;
    return this;
  }

  $clone() { return new CancelButton().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class DlgCloseButton extends CloseButton {

  init(rtBounds) {
    super.init($.LoadResStr(S("IDS_DLG_CLOSE")), rtBounds, true);
    this.$dyn = DlgCloseButton;
    return this;
  }

  $clone() { return new DlgCloseButton().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class YesButton extends CloseButton {

  init(rtBounds) {
    super.init($.LoadResStr(S("IDS_DLG_YES")), rtBounds, true);
    this.$dyn = YesButton;
    return this;
  }

  $clone() { return new YesButton().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class NoButton extends CloseButton {

  init(rtBounds) {
    super.init($.LoadResStr(S("IDS_DLG_NO")), rtBounds, false);
    this.$dyn = NoButton;
    return this;
  }

  $clone() { return new NoButton().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class RetryButton extends CloseButton {

  init(rtBounds) {
    super.init($.LoadResStr(S("IDS_BTN_RETRY")), rtBounds, true);
    this.$dyn = RetryButton;
    return this;
  }

  $clone() { return new RetryButton().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class ResetButton extends CloseButton {

  init(rtBounds) {
    super.init($.LoadResStr(S("IDS_BTN_RESET")), rtBounds, true);
    this.$dyn = ResetButton;
    return this;
  }

  $clone() { return new ResetButton().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class OKIconButton extends CloseIconButton {

  init(rtBounds, eIcon) {
    super.init(rtBounds, eIcon, true);
    this.$dyn = OKIconButton;
    return this;
  }

  $clone() { return new OKIconButton().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class CancelIconButton extends CloseIconButton {

  init(rtBounds, eIcon) {
    super.init(rtBounds, eIcon, false);
    this.$dyn = CancelIconButton;
    return this;
  }

  $clone() { return new CancelIconButton().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export function ExpandHotkeyMarkup(sText, rcHotkey, for_tooltip = false) {
  let $t1;
  let HotkeyMarkup = P(for_tooltip ? S("<c ff800000>%s</c>") : S("<c ffffff7f>%s</c>"), 0);
  let output = new $.StdStrBuf();
  const input = [sText.getData()];
  rcHotkey.a[rcHotkey.o] = 0;
  while (input[0] != null && input[0].a[input[0].o] !== 0) {
    if (input[0].a[input[0].o] !== 38) {
      output.AppendChar($rd(($t1 = input[0], input[0] = input[0].add(1), $t1)));
    } else {
      input[0] = input[0].add(1);
      if (input[0].a[input[0].o] === 0 || input[0].a[input[0].o] === 38) {
        output.AppendChar(input[0].a[input[0].o]);
      } else {
        let accel_start = input[0];
        rcHotkey.a[rcHotkey.o] = $.GetNextCharacter(P(input, 0));
        let accel = StdString.of(accel_start, input[0]);
        output.AppendFormat(HotkeyMarkup, accel.c_str());
        if ($.Inside$u32$u32$u32(rcHotkey.a[rcHotkey.o], 97, 122)) {
          rcHotkey.a[rcHotkey.o] = rcHotkey.a[rcHotkey.o] + 0xffffffe0 >>> 0;
        } else if (!$.Inside$u32$u32$u32(rcHotkey.a[rcHotkey.o], 65, 90)) {
          $.LogF($.LoadResStr(S("IDS_ERR_UNSUPPORTED_ACCELERATOR")), accel.c_str(), sText.getData());
        }
      }
    }
  }
  if (rcHotkey.a[rcHotkey.o] === 0) {
    return false;
  }
  sText.Take$rStdStrBuf(output);
  return true;
}

export function MakeColorReadableOnBlack(rdwClr) {
  let dwAlpha = ($max((rdwClr.a[rdwClr.o] >>> 24 & 255) >>> 0, 255) << 24) >>> 0;
  rdwClr.a[rdwClr.o] = (rdwClr.a[rdwClr.o] & 0xffffff) >>> 0;
  let r = (rdwClr.a[rdwClr.o] >>> 16 & 255) >>> 0;
  let g = (rdwClr.a[rdwClr.o] >>> 8 & 255) >>> 0;
  let b = (rdwClr.a[rdwClr.o] & 255) >>> 0;
  let iLightness = ((Math.imul(r, 50) >>> 0) + (Math.imul(g, 87) >>> 0) >>> 0) + (Math.imul(b, 27) >>> 0) >>> 0 | 0;
  if (iLightness < 16575) {
    let iInc = (16575 - iLightness | 0) / 164 | 0;
    rdwClr.a[rdwClr.o] = ((($min(r + (iInc >>> 0) >>> 0, 255) << 16) >>> 0 | ($min(g + (iInc >>> 0) >>> 0, 255) << 8) >>> 0) >>> 0 | $min(b + (iInc >>> 0) >>> 0, 255)) >>> 0;
  }
  rdwClr.a[rdwClr.o] = (rdwClr.a[rdwClr.o] | dwAlpha) >>> 0;
  return rdwClr.a[rdwClr.o];
}


export function GUISound(szSound) {
  if ($.Config.Sound.FESamples !== 0) {
    $.StartSoundEffect(szSound);
  }
}

export function IsActive() {
  return Screen.GetScreenS().IsActive$v();
}

export function IsExclusive() {
  return Screen.GetScreenS().IsExclusive();
}

export function GetScreenWdt() {
  return Screen.GetScreenS().GetBounds().Wdt;
}

export function GetScreenHgt() {
  return Screen.GetScreenS().GetBounds().Hgt;
}

export function GetZoom() {
  return Screen.GetScreenS().GetZoom();
}

export function MouseMove(iButton, iX, iY, dwKeyParam, pVP) {
  Screen.GetScreenS().MouseMove(iButton, iX, iY, dwKeyParam, pVP);
}


export function $init(): void {
  ComponentAligner.rcTemp = new $.C4Rect();
  ContextMenu.iGlobalMenuIndex = 0;
  Edit.CursorRepresentation = S("¦");
  $mixin(InfoDialog, $.C4ApplicationSec1Timer);
  Screen.pScreen = null;
  $.TheScreen = new Screen(); $.TheScreen.init();
  $.pGUI = $.TheScreen;
}

Object.assign($, { ArrowButton, BaseCallbackHandler, BaseInputCallback, BaseParCallbackHandler$i32, Button, CBContextHandler$C4StartupMainDlg, CBContextHandler$ClientListItem, CBContextHandler$Edit, CBContextHandler$ListItem, CBContextHandler$PlayerListItem, CBMenuHandler$C4StartupPlrSelDlg, CBMenuHandler$ClientListItem, CBMenuHandler$CrewListItem, CBMenuHandler$Edit, CBMenuHandler$PlayerListItem, CBMenuHandlerEx$C4StartupMainDlg$StdCopyStrBuf, CBMenuHandlerEx$C4StartupMainDlg$i32, CBMenuHandlerEx$ComboBox$ComboMenuCBStruct, CBMenuHandlerEx$PlayerListItem$i32, CMouse, CallbackButton$C4GameOptionButtons$IconButton, CallbackButton$C4GameOverDlg$Button, CallbackButton$C4StartupAboutDlg$Button, CallbackButton$C4StartupLegalDlg$Button, CallbackButton$C4StartupMainDlg$Button, CallbackButton$C4StartupOptionsDlg$Button, CallbackButton$C4StartupPlrPropertiesDlg$ArrowButton, CallbackButton$C4StartupPlrPropertiesDlg$IconButton, CallbackButton$C4StartupPlrSelDlg$Button, CallbackButton$C4StartupScenSelDlg$Button, CallbackButton$ClientListItem$IconButton, CallbackButton$ControlConfigArea$IconButton, CallbackButton$Dialog$IconButton, CallbackButton$ScriptPlayersListItem$IconButton, CallbackButtonEx$C4StartupScenSelDlg$FacetButton, CallbackButtonEx$ClientListItem$IconButton, CallbackButtonEx$ConnectionListItem$IconButton, CallbackEdit$C4ChatInputDialog, CallbackEdit$C4StartupScenSelDlg, CallbackHandler$BoolConfig, CallbackHandler$C4FileSelDlg, CallbackHandler$C4PlayerInfoListBox, CallbackHandler$C4StartupOptionsDlg, CallbackHandler$C4StartupPlrSelDlg, CallbackHandler$C4StartupScenSelDlg, CallbackHandler$MessageDialog, CallbackHandler$NetworkPortConfig, CallbackHandler$NetworkServerAddressConfig, CallbackHandlerExPar$C4StartupPlrSelDlg$pListItem, CallbackHandlerExPar$C4StartupScenSelDlg$pScenListItem, CallbackRenameEdit$CrewListItem$RenameParams, CallbackRenameEdit$ScenListItem$RenameParams, CancelButton, CancelIconButton, CheckBox, CloseButton, CloseIconButton, ComboBox, ComboBox$ComboMenuCBStruct, ComboBox_FillCB, ComboBox_FillCallback$C4FileSelDlg, ComboBox_FillCallback$C4StartupOptionsDlg, ComboBox_FillCallback$OptionDropdown, ComboBox_FillCallback$PlayerListItem, ComponentAligner, ConfirmationDialog, Container, Container$Iterator, Container$ReverseIterator, ContextButton, ContextHandler, ContextMenu, ContextMenu$Entry, Control, ControlKeyCB$Button, ControlKeyCB$CheckBox, ControlKeyCB$ComboBox, ControlKeyCB$ContextButton, ControlKeyCB$Control, ControlKeyCB$Edit, ControlKeyCB$ListBox, ControlKeyCB$ListItem, ControlKeyCB$ListItem$2, ControlKeyCB$RenameEdit, ControlKeyCB$Tabular, ControlKeyCBExPassKey$Edit$i32, ControlKeyDlgCB$C4StartupPlrSelDlg, ControlKeyDlgCB$C4StartupScenSelDlg, Dialog, DialogWindow, DlgCallback$C4GameOptionButtons, DlgCallback$C4GameOverDlg, DlgCallback$C4StartupAboutDlg, DlgCallback$C4StartupLegalDlg, DlgCallback$C4StartupMainDlg, DlgCallback$C4StartupOptionsDlg, DlgCallback$C4StartupPlrPropertiesDlg, DlgCallback$C4StartupPlrSelDlg, DlgCallback$C4StartupScenSelDlg, DlgCallback$ClientListItem, DlgCallback$ClientListItem$2, DlgCallback$ConnectionListItem, DlgCallback$ControlConfigArea, DlgCallback$CrewListItem, DlgCallback$Dialog, DlgCallback$Edit, DlgCallback$ListItem, DlgCallback$PlayerListItem, DlgCallback$ScriptPlayersListItem, DlgCallbackEx$C4StartupMainDlg$StdCopyStrBuf, DlgCallbackEx$C4StartupMainDlg$i32, DlgCallbackEx$ComboBox$ComboMenuCBStruct, DlgCallbackEx$PlayerListItem$i32, DlgCloseButton, DlgKeyCB$C4ChatInputDialog, DlgKeyCB$C4FileSelDlg, DlgKeyCB$C4StartupAboutDlg, DlgKeyCB$C4StartupMainDlg, DlgKeyCB$C4StartupOptionsDlg, DlgKeyCB$C4StartupPlrSelDlg, DlgKeyCB$C4StartupScenSelDlg, DlgKeyCB$Dialog, DlgKeyCB$MessageDialog, DlgKeyCB$Tabular, DlgKeyCBEx$C4ChatInputDialog$b, DlgKeyCBEx$C4StartupMainDlg$b, DlgKeyCBEx$Dialog$b, DlgKeyCBPassKey$C4ChatInputDialog, DlgKeyCBPassKey$Dialog, DlgKeyCBPassKey$KeySelDialog, DynBarFacet, Edit, Element, ExpandHotkeyMarkup, FacetButton, FrameDecoration, FullscreenDialog, GUISound, GetScreenHgt, GetScreenWdt, GetZoom, GroupBox, HorizontalLine, Icon, IconButton, InfoDialog, InputCallback$C4GameOptionButtons, InputCallback$C4StartupScenSelDlg, InputCallback$CrewListItem, InputDialog, IsActive, IsExclusive, Label, LabeledEdit, ListBox, MakeColorReadableOnBlack, MenuHandler, MessageDialog, MouseMove, MultilineLabel, NoButton, OKButton, OKIconButton, OverlayPicture, PaintBox, ParCallbackHandler$C4StartupOptionsDlg$i32, Picture, ProgressBar, ProgressDialog, RenameEdit, ResetButton, RetryButton, Screen, ScrollBar, ScrollBarFacets, ScrollWindow, Tabular, Tabular$Sheet, TextWindow, Window, WoodenLabel, YesButton });
