// @ts-nocheck
// OpenClonk 36de799: src/gui/C4Menu.cpp, src/gui/C4Menu.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { Dialog, Element } from './C4Gui.ts';
import { $spawn } from '../../rt/coro.ts';
import { $u64n, ftoi32 } from '../../rt/int.ts';
import { c$strlen } from '../../rt/libc.ts';
import { $rd, $wr, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $max, $min } from '../../rt/std.ts';

export class C4MenuItem extends Element {
  Caption = new Int8Array(513);
  Command = new Int8Array(286);
  Command2 = new Int8Array(286);
  InfoCaption = new Int8Array(1025);
  Count = 0;
  id = new $.C4ID().init$v();
  Object = null;
  Symbol = new $.C4FacetSurface().init();
  pSymbolObj = null;
  pSymbolGraphics = null;
  dwSymbolClr = 0;
  fOwnValue = false;
  iValue = 0;
  fSelected = false;
  iStyle = 0;
  pMenu = null;
  iIndex = 0;
  IsSelectable = false;
  TextDisplayProgress = 0;

  $dtor() {
    $.C4FacetSurface.prototype.Clear.call(this.Symbol);
    super.$dtor();
  }

  IsDragElement() {
    let pDef = $.C4Id2Def(this.id.$clone());
    return pDef != null && pDef.Constructable !== 0;
  }

  GetSymbolWidth(iForHeight) {
    if (this.iStyle === 1 || this.iStyle === 3 && this.Symbol.Surface != null) {
      return ftoi32($max(Math.fround(Math.fround(this.Symbol.Wdt * Math.fround(iForHeight)) / $max(this.Symbol.Hgt, 1)), Math.fround(iForHeight)));
    }
    if (this.iStyle === 2 && this.Symbol.Surface != null && this.Symbol.Wdt !== 0) {
      return ftoi32(this.Symbol.Wdt);
    }
    return 0;
  }

  DrawElement(cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4MenuItem && C4MenuItem.prototype instanceof $c) return $c.prototype.DrawElement.apply(this, arguments); }
    let cgoOut = new $.C4Facet().init$pC4Surface$f32$f32$f32$f32(cgo.Surface, Math.fround(cgo.TargetX + Math.fround(this.rcBounds.x)), Math.fround(cgo.TargetY + Math.fround(this.rcBounds.y)), Math.fround(this.rcBounds.Wdt), Math.fround(this.rcBounds.Hgt));
    if (this.iStyle !== 2) {
      if (this.fSelected && this.TextDisplayProgress !== 0) {
        $.pDraw.DrawBoxDw(cgo.Surface, ftoi32(cgoOut.X), ftoi32(cgoOut.Y), ftoi32(Math.fround(Math.fround(cgoOut.X + cgoOut.Wdt) - Math.fround(1))), ftoi32(Math.fround(Math.fround(cgoOut.Y + cgoOut.Hgt) - Math.fround(1))), 0xffca0000);
      }
    }
    let cgoItemSymbol = new $.C4Facet().init$v();
    let cgoItemText = new $.C4Facet().init$v();
    cgoItemSymbol.$assign(cgoItemText.$assign(cgoOut));
    let iSymWidth = 0;
    if ((iSymWidth = this.GetSymbolWidth(ftoi32(cgoItemText.Hgt))) !== 0) {
      cgoItemSymbol.$assign(cgoItemText.Truncate(1, iSymWidth));
    }
    let cgoSymbolOut = new $.C4Facet().init$pC4Surface$f32$f32$f32$f32(cgoItemSymbol.Surface, cgoItemSymbol.X, cgoItemSymbol.Y, cgoItemSymbol.Wdt, cgoItemSymbol.Wdt);
    if (this.pSymbolObj != null && this.TextDisplayProgress !== 0) {
      this.pSymbolObj.DrawPicture(cgoSymbolOut, false, null);
    } else if (this.pSymbolGraphics != null && this.TextDisplayProgress !== 0) {
      this.pSymbolGraphics.Draw(cgoSymbolOut, this.dwSymbolClr !== 0 ? this.dwSymbolClr : 0xffffffff, null, 0, 0, null);
    } else if (this.Symbol.Surface != null && this.TextDisplayProgress !== 0) {
      this.Symbol.DrawClr(cgoItemSymbol, true, this.dwSymbolClr);
    }
    $.pDraw.StorePrimaryClipper();
    $.pDraw.SubPrimaryClipper(ftoi32(cgoItemText.X), ftoi32(cgoItemText.Y), ftoi32(Math.fround(Math.fround(cgoItemText.X + cgoItemText.Wdt) - Math.fround(1))), ftoi32(Math.fround(Math.fround(cgoItemText.Y + cgoItemText.Hgt) - Math.fround(1))));
    switch (this.iStyle) {
      case 1:
        $.pDraw.TextOut(P(this.Caption, 0), $.GraphicsResource.FontRegular, Math.fround(1), cgoItemText.Surface, cgoItemText.X, cgoItemText.Y, 0xffffffff, 0);
        break;
      case 2:
        {
          let sText = new $.StdStrBuf();
          $.GraphicsResource.FontRegular.BreakMessage$pi8$i32$pStdStrBuf$b$f32(P(this.InfoCaption, 0), ftoi32(cgoItemText.Wdt), sText, true);
          $.pDraw.TextOut(sText.getData(), $.GraphicsResource.FontRegular, Math.fround(1), cgoItemText.Surface, cgoItemText.X, cgoItemText.Y);
          break;
        }
      case 3:
        {
          let cXChg = 0;
          let iStopPos = 0;
          if (this.TextDisplayProgress > -1) {
            iStopPos = $min(this.TextDisplayProgress, c$strlen(P(this.Caption, 0)) | 0);
            cXChg = this.Caption[iStopPos];
            this.Caption[iStopPos] = 0;
          }
          let sText = new $.StdStrBuf();
          $.GraphicsResource.FontRegular.BreakMessage$pi8$i32$pStdStrBuf$b$f32(P(this.Caption, 0), ftoi32(cgoItemText.Wdt), sText, true);
          $.pDraw.TextOut(sText.getData(), $.GraphicsResource.FontRegular, Math.fround(1), cgoItemText.Surface, cgoItemText.X, cgoItemText.Y);
          if (cXChg !== 0) {
            this.Caption[iStopPos] = cXChg;
          }
          break;
        }
    }
    $.pDraw.RestorePrimaryClipper();
    if (this.Count !== 0xbc614e) {
      const szCount = new Int8Array(11);
      $.ssprintf$5(szCount, S("%ix"), this.Count);
      $.pDraw.TextOut(P(szCount, 0), $.GraphicsResource.FontRegular, Math.fround(1), cgoItemText.Surface, Math.fround(Math.fround(cgoItemText.X + cgoItemText.Wdt) - Math.fround(1)), Math.fround(Math.fround(Math.fround(cgoItemText.Y + cgoItemText.Hgt) - Math.fround(1)) - Math.fround($.GraphicsResource.FontRegular.GetLineHeight())), 0xffffffff, 2);
    }
  }

  init(pMenu, iIndex, szCaption, szCommand, iCount, pObject, szInfoCaption, idID, szCommand2, fOwnValue, iValue, iStyle, fIsSelectable) {
    super.init();
    this.Count = iCount;
    this.id = idID.$clone();
    this.Object = pObject;
    this.Symbol = new $.C4FacetSurface().init();
    this.pSymbolObj = null;
    this.pSymbolGraphics = null;
    this.dwSymbolClr = 0;
    this.fOwnValue = fOwnValue;
    this.iValue = iValue;
    this.fSelected = false;
    this.iStyle = iStyle;
    this.pMenu = pMenu;
    this.iIndex = iIndex;
    this.IsSelectable = fIsSelectable;
    this.TextDisplayProgress = -1;
    this.$dyn = C4MenuItem;
    $wr(P(this.Caption, 0), 0, $wr(P(this.Command, 0), 0, $wr(P(this.Command2, 0), 0, $wr(P(this.InfoCaption, 0), 0, 0))));
    $.C4FacetSurface.prototype.Default.call(this.Symbol);
    $.SCopy$pi8$pi8$u64(szCaption, P(this.Caption, 0), 512);
    $.SCopy$pi8$pi8$u64(szCommand, P(this.Command, 0), 285);
    $.SCopy$pi8$pi8$u64(szCommand2, P(this.Command2, 0), 285);
    $.SCopy$pi8$pi8$u64(szInfoCaption, P(this.InfoCaption, 0), 512);
    $.SReplaceChar(P(this.InfoCaption, 0), 10, 32);
    $.SReplaceChar(P(this.InfoCaption, 0), 13, 124);
    this.SetToolTip(P(this.InfoCaption, 0));
    return this;
  }

  GrabSymbol(fctSymbol) {
    this.Symbol.GrabFrom(fctSymbol);
    if (this.Symbol.Surface != null) {
      this.dwSymbolClr = this.Symbol.Surface.GetClr();
    }
  }

  SetGraphics$pC4Object(pObj) {
    this.pSymbolObj = pObj;
  }

  SetGraphics$pC4DefGraphics(pGfx) {
    this.pSymbolGraphics = pGfx;
  }

  RefSymbol(fctSymbol) {
    this.Symbol.Set$C4Facet(fctSymbol);
    if (this.Symbol.Surface != null) {
      this.dwSymbolClr = this.Symbol.Surface.GetClr();
    }
  }

  SetSelected(fToVal) {
    this.fSelected = fToVal;
  }

  DoTextProgress(riByVal) {
    if (this.TextDisplayProgress < 0) {
      return;
    }
    if (this.IsSelectable || !($rd(P(this.Caption, 0)) !== 0)) {
      this.TextDisplayProgress = -1;
      return;
    }
    let sText = new $.StdStrBuf().init$pi8$b(P(this.Caption, 0));
    let MarkupChecker = new $.C4Markup().init(false);
    const szPos = [sText.getPtr($u64n($min(this.TextDisplayProgress, sText.getLength() | 0)))];
    while (riByVal.a[riByVal.o] !== 0 && szPos[0].a[szPos[0].o] !== 0) {
      MarkupChecker.SkipTags(P(szPos, 0));
      if (szPos[0].a[szPos[0].o] === 0) {
        break;
      }
      riByVal.a[riByVal.o] = riByVal.a[riByVal.o] - 1 | 0;
      let c = $.GetNextCharacter(P(szPos, 0));
      if (c === 123 && szPos[0].a[szPos[0].o] === 123) {
        let end = $.SCharPos(125, szPos[0]);
        if (end > 0 && szPos[0].a[szPos[0].o + (end + 1 | 0)] === 125) {
          szPos[0] = szPos[0].add(end + 2 | 0);
        }
      }
    }
    if (szPos[0].a[szPos[0].o] === 0) {
      this.TextDisplayProgress = -1;
    } else {
      this.TextDisplayProgress = szPos[0].o - P(this.Caption, 0).o | 0;
    }
  }

  GetC4ID() {
    return this.id.$clone();
  }

  GetValue() {
    return this.iValue;
  }

  GetObject() {
    return this.Object;
  }

  GetCommand() {
    return P(this.Command, 0);
  }

  ClearPointers(pObj) {
    if (pObj === this.Object) {
      this.Object = null;
    }
    if (pObj === this.pSymbolObj) {
      this.pSymbolObj = null;
    }
  }

  MouseInput$rCMouse$i32$i32$i32$u32(rMouse, iButton, iX, iY, dwKeyParam) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4MenuItem && C4MenuItem.prototype instanceof $c) return $c.prototype.MouseInput$rCMouse$i32$i32$i32$u32.apply(this, arguments); }
    if (iButton === 1) {
      if (this.IsDragElement()) {
        this.StartDragging(rMouse, iX, iY, dwKeyParam);
      }
    } else if (iButton === 2) {
      this.pMenu.UserEnter($.MouseControl.GetPlayer(), this, false);
      return;
    } else if (iButton === 4) {
      this.pMenu.UserEnter($.MouseControl.GetPlayer(), this, true);
      return;
    }
    $spawn($.Element.prototype.MouseInput$rCMouse$i32$i32$i32$u32.call(this, rMouse, iButton, iX, iY, dwKeyParam));
  }

  MouseEnter(rMouse) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4MenuItem && C4MenuItem.prototype instanceof $c) return $c.prototype.MouseEnter.apply(this, arguments); }
    this.pMenu.UserSelectItem($.MouseControl.GetPlayer(), this);
    $.Element.prototype.MouseEnter.call(this, rMouse);
  }

  $clone() { return new C4MenuItem().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Caption = o.Caption.slice();
    this.Command = o.Command.slice();
    this.Command2 = o.Command2.slice();
    this.InfoCaption = o.InfoCaption.slice();
    this.Count = o.Count;
    this.id.$assign(o.id);
    this.Object = o.Object;
    this.Symbol.$assign(o.Symbol);
    this.pSymbolObj = o.pSymbolObj;
    this.pSymbolGraphics = o.pSymbolGraphics;
    this.dwSymbolClr = o.dwSymbolClr;
    this.fOwnValue = o.fOwnValue;
    this.iValue = o.iValue;
    this.fSelected = o.fSelected;
    this.iStyle = o.iStyle;
    this.pMenu = o.pMenu;
    this.iIndex = o.iIndex;
    this.IsSelectable = o.IsSelectable;
    this.TextDisplayProgress = o.TextDisplayProgress;
    return this;
  }
}

export class C4Menu extends Dialog {
  LocationSet = false;
  Permanent = false;
  NeedRefill = false;
  Style = 0;
  Selection = 0;
  TimeOnSelection = 0;
  ItemCount = 0;
  ItemWidth = 0;
  ItemHeight = 0;
  Extra = 0;
  ExtraData = 0;
  Identification = 0;
  Columns = 0;
  Lines = 0;
  Alignment = 0;
  VisibleCount = 0;
  CloseCommand = new $.StdStrBuf();
  Caption = new Int8Array(513);
  Symbol = new $.C4FacetSurface().init();
  pClientWindow = null;
  fHasPortrait = false;
  fTextProgressing = false;
  fEqualIconItemHeight = false;
  fActive = false;

  init() {
    super.init(100, 100, null, true);
    this.CloseCommand = new $.StdStrBuf();
    this.Symbol = new $.C4FacetSurface().init();
    this.$dyn = C4Menu;
    C4Menu.prototype.Default.call(this);
    $.Container.prototype.AddElement$pElement.call(this, this.pClientWindow = new $.ScrollWindow().init(this));
    this.SetVisibility(false);
    return this;
  }

  $dtor() {
    C4Menu.prototype.Clear$v.call(this);
    super.$dtor();
  }

  Clear$v() {
    this.Close$b(false);
    $.C4FacetSurface.prototype.Clear.call(this.Symbol);
    this.ClearItems();
    this.ClearFrameDeco();
    this.fActive = false;
  }

  Default() {
    this.Selection = -1;
    this.Style = 0;
    this.ItemCount = 0;
    this.ItemWidth = this.ItemHeight = 35;
    this.NeedRefill = false;
    $.C4FacetSurface.prototype.Default.call(this.Symbol);
    this.Caption[0] = 0;
    this.Permanent = false;
    this.Extra = 0;
    this.ExtraData = 0;
    this.TimeOnSelection = 0;
    this.Identification = 0;
    this.LocationSet = false;
    this.Columns = this.Lines = 0;
    this.Alignment = 10;
    this.VisibleCount = 0;
    this.fHasPortrait = false;
    this.fTextProgressing = false;
    this.fEqualIconItemHeight = false;
    this.CloseCommand.Clear();
    this.fActive = false;
  }

  ClearPointers(pObj) {
    let pItem = null;
    for (let i = 0; (pItem = this.GetItem(i)) != null; i = i + 1 | 0) {
      pItem.ClearPointers(pObj);
    }
  }

  Refill() {
    if (!this.IsActive$v()) {
      return false;
    }
    if (!this.RefillInternal()) {
      this.Close$b(false);
      return false;
    }
    return true;
  }

  Execute$v() {
    if (!this.IsActive$v()) {
      return;
    }
    if ($.Game.iTick35 === 0 || this.NeedRefill) {
      if (!this.RefillInternal()) {
        this.Close$b(false);
      }
    }
    if (this.fTextProgressing) {
      this.SetTextProgress(1, true);
    }
  }

  SetPermanent(fPermanent) {
    this.Permanent = fPermanent;
  }

  SetAlignment(iAlignment) {
    this.Alignment = iAlignment;
  }

  GetIdentification() {
    return this.Identification;
  }

  GetItemCount() {
    return this.ItemCount;
  }

  GetSelection$v() {
    return this.Selection;
  }

  IsContextMenu() {
    return this.Style === 1;
  }

  GetSymbolSize() {
    return this.Style === 3 ? 64 : 35;
  }

  GetItemHeight() {
    return this.ItemHeight;
  }

  GetSelectedItem() {
    return this.GetItem(this.Selection);
  }

  GetItem(iIndex) {
    return this.pClientWindow.GetElementByIndex(iIndex);
  }

  GetParentObject() {
    return null;
  }

  MoveSelection(iBy, fAdjustPosition, fDoCalls) {
    if (iBy === 0) {
      return false;
    }
    let iNewSel = this.Selection;
    for (; ; ) {
      iNewSel = iNewSel + iBy | 0;
      if (!$.Inside$i32$i32$i32$3(iNewSel, 0, this.ItemCount - 1 | 0)) {
        return false;
      }
      let pNewSel = this.GetItem(iNewSel);
      if (pNewSel == null || !pNewSel.IsSelectable) {
        continue;
      }
      break;
    }
    return !!this.SetSelection$i32$b$b(iNewSel, fAdjustPosition, fDoCalls);
  }

  SetSelection$i32$b$b(iSelection, fAdjustPosition, fDoCalls) {
    if (!this.IsActive$v()) {
      return false;
    }
    let pNewSel = this.GetItem(iSelection);
    if (iSelection === -1 && this.ItemCount === 0 || pNewSel != null && pNewSel.IsSelectable) {
      if (iSelection !== this.Selection) {
        let pSel = this.GetSelectedItem();
        if (pSel != null) {
          pSel.SetSelected(false);
        }
        this.Selection = iSelection;
        this.TimeOnSelection = 0;
      }
      let pSel = this.GetSelectedItem();
      if (pSel != null) {
        pSel.SetSelected(true);
      }
      if (this.Style === 0) {
        if (pSel != null) {
          this.SetTitle$pi8$b($rd(P(pSel.Caption, 0)) !== 0 ? P(pSel.Caption, 0) : S(" "), this.HasMouse());
        } else {
          this.SetTitle$pi8$b($rd(P(this.Caption, 0)) !== 0 ? P(this.Caption, 0) : S(" "), this.HasMouse());
        }
      }
    }
    if (fAdjustPosition) {
      this.AdjustPosition();
    }
    if (fDoCalls) {
      this.OnSelectionChanged(this.Selection);
    }
    return true;
  }

  SetPosition(iPosition) {
    if (!this.IsActive$v()) {
      return false;
    }
    if (this.IsVisible() && this.pClientWindow != null) {
      this.pClientWindow.SetScroll(Math.imul(iPosition / this.Columns | 0, this.ItemHeight));
    }
    return true;
  }

  SetSize(iToWdt, iToHgt) {
    if (iToWdt !== 0) {
      this.Columns = iToWdt;
    }
    if (iToHgt !== 0) {
      this.Lines = iToHgt;
    }
    this.InitSize();
  }

  Enter(fRight = false) {
    if (!this.IsActive$v()) {
      return false;
    }
    if (this.Style === 2) {
      return false;
    }
    let pItem = this.GetSelectedItem();
    if (pItem == null) {
      if (this.Style === 3) {
        this.TryClose(false, true);
      }
      return true;
    }
    const szCommand = new Int8Array(286);
    $.SCopy$pi8$pi8(P(pItem.Command, 0), P(szCommand, 0));
    if (fRight && pItem.Command2[0] !== 0) {
      $.SCopy$pi8$pi8(P(pItem.Command2, 0), P(szCommand, 0));
    }
    if (!this.Permanent) {
      this.Close$b(true);
      this.fActive = false;
    }
    this.MenuCommand(P(szCommand, 0), false);
    return true;
  }

  IsActive$v() {
    return this.fActive;
  }

  Control(byCom, iData) {
    if (!this.IsActive$v()) {
      return false;
    }
    switch (byCom) {
      case 38:
        this.Enter();
        break;
      case 39:
        this.Enter(true);
        break;
      case 40:
        this.TryClose(false, true);
        break;
      case 52:
        if ((this.Selection - 1 | 0) < 0) {
          this.MoveSelection((this.ItemCount - 1 | 0) - this.Selection | 0, true, true);
        } else {
          this.MoveSelection(-1, true, true);
        }
        break;
      case 53:
        if ((this.Selection + 1 | 0) >= this.ItemCount) {
          this.MoveSelection(-this.Selection | 0, true, true);
        } else {
          this.MoveSelection(1, true, true);
        }
        break;
      case 54:
        iData = -this.Columns | 0;
        if ((this.Selection + iData | 0) < 0) {
          while (((this.Selection + iData | 0) + this.Columns | 0) < this.ItemCount) {
            iData = iData + this.Columns | 0;
          }
        }
        this.MoveSelection(iData, true, true);
        break;
      case 55:
        iData = this.Columns;
        if ((this.Selection + iData | 0) >= this.ItemCount) {
          while (((this.Selection + iData | 0) - this.Columns | 0) >= 0) {
            iData = iData - this.Columns | 0;
          }
        }
        this.MoveSelection(iData, true, true);
        break;
      case 60:
        if (this.ItemCount !== 0) {
          this.SetSelection$i32$b$b(iData & 0x7fffffff, !!((iData & -0x80000000) !== 0), true);
        }
        break;
      case 42:
        this.SetTextProgress(-1, false);
        break;
    }
    return true;
  }

  KeyControl(byCom) {
    if (!this.IsActive$v()) {
      return false;
    }
    return !!this.Control(byCom, 0);
  }

  AddRefSym(szCaption, fctSymbol, szCommand, iCount = 0xbc614e, pObject = null, szInfoCaption = null, idID = $.C4ID.None.$clone(), szCommand2 = null, fOwnValue = false, iValue = 0, fIsSelectable = true) {
    if (!this.IsActive$v()) {
      return false;
    }
    let pNew = new C4MenuItem().init(this, this.ItemCount, szCaption, szCommand, iCount, pObject, szInfoCaption, idID.$clone(), szCommand2, fOwnValue, iValue, this.Style, fIsSelectable);
    pNew.RefSymbol(fctSymbol);
    return this.AddItem$pC4MenuItem$pi8$pi8$i32$pC4Object$pi8$C4ID$pi8$b$i32$b(pNew, szCaption, szCommand, iCount, pObject, szInfoCaption, idID.$clone(), szCommand2, fOwnValue, iValue, fIsSelectable);
  }

  Add$pi8$rC4FacetSurface$pi8$i32$pC4Object$pi8$C4ID$pi8$b$i32$b(szCaption, fctSymbol, szCommand, iCount = 0xbc614e, pObject = null, szInfoCaption = null, idID = $.C4ID.None.$clone(), szCommand2 = null, fOwnValue = false, iValue = 0, fIsSelectable = true) {
    if (!this.IsActive$v()) {
      return false;
    }
    let pNew = new C4MenuItem().init(this, this.ItemCount, szCaption, szCommand, iCount, pObject, szInfoCaption, idID.$clone(), szCommand2, fOwnValue, iValue, this.Style, fIsSelectable);
    pNew.GrabSymbol(fctSymbol);
    return this.AddItem$pC4MenuItem$pi8$pi8$i32$pC4Object$pi8$C4ID$pi8$b$i32$b(pNew, szCaption, szCommand, iCount, pObject, szInfoCaption, idID.$clone(), szCommand2, fOwnValue, iValue, fIsSelectable);
  }

  Add$pi8$pC4Object$pi8$i32$pC4Object$pi8$C4ID$pi8$b$i32$b(szCaption, pGfxObj, szCommand, iCount = 0xbc614e, pObject = null, szInfoCaption = null, idID = $.C4ID.None.$clone(), szCommand2 = null, fOwnValue = false, iValue = 0, fIsSelectable = true) {
    if (!this.IsActive$v()) {
      return false;
    }
    let pNew = new C4MenuItem().init(this, this.ItemCount, szCaption, szCommand, iCount, pObject, szInfoCaption, idID.$clone(), szCommand2, fOwnValue, iValue, this.Style, fIsSelectable);
    pNew.SetGraphics$pC4Object(pGfxObj);
    return this.AddItem$pC4MenuItem$pi8$pi8$i32$pC4Object$pi8$C4ID$pi8$b$i32$b(pNew, szCaption, szCommand, iCount, pObject, szInfoCaption, idID.$clone(), szCommand2, fOwnValue, iValue, fIsSelectable);
  }

  Add$pi8$pC4DefGraphics$pi8$i32$pC4Object$pi8$C4ID$pi8$b$i32$b(szCaption, pGfx, szCommand, iCount = 0xbc614e, pObject = null, szInfoCaption = null, idID = $.C4ID.None.$clone(), szCommand2 = null, fOwnValue = false, iValue = 0, fIsSelectable = true) {
    if (!this.IsActive$v()) {
      return false;
    }
    let pNew = new C4MenuItem().init(this, this.ItemCount, szCaption, szCommand, iCount, pObject, szInfoCaption, idID.$clone(), szCommand2, fOwnValue, iValue, this.Style, fIsSelectable);
    pNew.SetGraphics$pC4DefGraphics(pGfx);
    return this.AddItem$pC4MenuItem$pi8$pi8$i32$pC4Object$pi8$C4ID$pi8$b$i32$b(pNew, szCaption, szCommand, iCount, pObject, szInfoCaption, idID.$clone(), szCommand2, fOwnValue, iValue, fIsSelectable);
  }

  ClearItems() {
    let pItem = null;
    while ((pItem = this.GetItem(0)) != null) {
      $delete(pItem);
    }
    this.ItemCount = 0;
    this.UpdateScrollBar();
  }

  ResetLocation() {
    this.LocationSet = false;
  }

  SetLocation(iX, iY) {
    this.SetPos(iX, iY);
    return true;
  }

  SetTextProgress(iToProgress$, fAdd) {
    const iToProgress = [iToProgress$];
    if (!this.IsActive$v()) {
      return false;
    }
    if (!fAdd) {
      this.fTextProgressing = iToProgress[0] >= 0;
    } else {
      if (!this.fTextProgressing) {
        return false;
      }
    }
    let pItem = null;
    let fAnyItemUnfinished = false;
    for (let i = this.HasPortrait() ? 1 : 0; (pItem = this.GetItem(i)) != null; i = i + 1 | 0) {
      if (!this.fTextProgressing) {
        pItem.TextDisplayProgress = -1;
        continue;
      }
      if (!fAdd) {
        pItem.TextDisplayProgress = 0;
      }
      if (iToProgress[0] !== 0) {
        pItem.DoTextProgress(P(iToProgress, 0));
      }
      if (pItem.TextDisplayProgress > -1) {
        fAnyItemUnfinished = true;
      }
    }
    this.fTextProgressing = fAnyItemUnfinished;
    return true;
  }

  SetEqualItemHeight(fToVal) {
    this.fEqualIconItemHeight = fToVal;
  }

  TryClose(fOK, fControl) {
    if (!fOK) {
      if (this.IsCloseDenied()) {
        return false;
      }
    }
    this.Close$b(fOK);
    this.Clear$v();
    $.pGUI.RemoveElement(this);
    if (fControl && this.CloseCommand.getData() != null) {
      this.MenuCommand(this.CloseCommand.getData(), true);
    }
    return true;
  }

  SetCloseCommand(strCommand) {
    this.CloseCommand.Copy$pi8(strCommand);
  }

  IsTextProgressing() {
    return this.fTextProgressing;
  }

  AddItem$pC4MenuItem$pi8$pi8$i32$pC4Object$pi8$C4ID$pi8$b$i32$b(pNew, szCaption, szCommand, iCount, pObject, _szInfoCaption, idID, szCommand2, fOwnValue, iValue, fIsSelectable) {
    if (true && $.Config.General.DebugRec !== 0) {
      if (pObject != null) {
        let rc = ((($o) => ($o.iObjNum = pObject != null ? pObject.Number : -1, $o.iCount = iCount, $o.idID = idID.$clone(), $o.fOwnValue = fOwnValue, $o.iValue = iValue, $o.fIsSelectable = fIsSelectable, $o))(new $.C4RCMenuAdd()));
        $.AddDbgRec(161 /*RCT_MenuAdd*/, rc, 22);
        if (szCommand != null) {
          $.AddDbgRec(162 /*RCT_MenuAddC*/, szCommand, c$strlen(szCommand) + 1 | 0);
        }
        if (szCommand2 != null) {
          $.AddDbgRec(162 /*RCT_MenuAddC*/, szCommand2, c$strlen(szCommand2) + 1 | 0);
        }
      }
    }
    $.Container.prototype.AddElement$pElement.call(this.pClientWindow, pNew);
    if (this.ItemCount === 0 && (szCaption == null || szCaption.a[szCaption.o] === 0)) {
      this.fHasPortrait = true;
    }
    this.ItemCount = this.ItemCount + 1 | 0;
    if (!this.pClientWindow.IsFrozen()) {
      this.UpdateElementPositions();
    }
    if (this.Selection === -1 && fIsSelectable && !this.pClientWindow.IsFrozen()) {
      this.SetSelection$i32$b$b(this.ItemCount - 1 | 0, false, false);
    }
    if (this.fTextProgressing) {
      pNew.TextDisplayProgress = 0;
    }
    this.UpdateScrollBar();
    return true;
  }

  InitMenu(szEmpty, iExtra, iExtraData, iId, iStyle) {
    $.SCopy$pi8$pi8$u64(szEmpty, P(this.Caption, 0), 512);
    this.Extra = iExtra;
    this.ExtraData = iExtraData;
    this.Identification = iId;
    if ($rd(P(this.Caption, 0)) !== 0 || iStyle === 3) {
      this.SetTitle$pi8$b(P(this.Caption, 0), this.HasMouse());
    } else {
      this.SetTitle$pi8$b(S(" "), this.HasMouse());
    }
    if (this.pTitle != null) {
      this.pTitle.SetIcon$C4Facet(this.Symbol);
    }
    this.Style = iStyle & 127;
    if (this.Style === 0) {
      this.Columns = 5;
    } else {
      this.Columns = 1;
    }
    if ((iStyle & 128) !== 0) {
      this.SetEqualItemHeight(true);
    }
    if (this.Style === 3) {
      this.Alignment = 4;
    }
    $.pGUI.ShowDialog(this, false);
    this.fTextProgressing = false;
    this.fActive = true;
    return true;
  }

  DoInitRefSym(fctSymbol, szEmpty, iExtra = 0, iExtraData = 0, iId = 0, iStyle = 0) {
    this.Clear$v();
    this.Default();
    this.Symbol.Set$C4Facet(fctSymbol);
    return this.InitMenu(szEmpty, iExtra, iExtraData, iId, iStyle);
  }

  DoInit$rC4FacetSurface$pi8$i32$i32$i32$i32(fctSymbol, szEmpty, iExtra = 0, iExtraData = 0, iId = 0, iStyle = 0) {
    this.Clear$v();
    this.Default();
    this.Symbol.GrabFrom(fctSymbol);
    return this.InitMenu(szEmpty, iExtra, iExtraData, iId, iStyle);
  }

  AdjustSelection() {
    let pSelection = this.GetItem(this.Selection);
    let iSel = this.Selection;
    if (pSelection == null || !pSelection.IsSelectable) {
      iSel = this.Selection;
      while ((iSel = iSel - 1 | 0) >= 0) {
        if ((pSelection = this.GetItem(iSel)) != null) {
          if (pSelection.IsSelectable) {
            break;
          }
        }
      }
      if (iSel < 0) {
        for (iSel = this.Selection + 1 | 0; (pSelection = this.GetItem(iSel)) != null; iSel = iSel + 1 | 0) {
          if (pSelection.IsSelectable) {
            break;
          }
        }
      }
    }
    if (pSelection == null) {
      this.SetSelection$i32$b$b(-1, this.Selection >= 0, false);
    } else {
      this.SetSelection$i32$b$b(iSel, iSel !== this.Selection, true);
    }
  }

  AdjustPosition() {
    if (this.Lines > 1 && this.Columns !== 0) {
      let pSel = this.GetSelectedItem();
      if (pSel != null) {
        this.pClientWindow.ScrollRangeInView(pSel.GetBounds().y, pSel.GetBounds().Hgt);
      }
    }
  }

  RefillInternal() {
    this.NeedRefill = false;
    let iLastItemCount = this.ItemCount;
    const fRefilled = [false];
    this.pClientWindow.Freeze();
    let fSuccess = this.DoRefillInternal(P(fRefilled, 0));
    this.pClientWindow.UnFreeze();
    this.UpdateElementPositions();
    if (!fSuccess) {
      return false;
    }
    if (fRefilled[0]) {
      this.AdjustSelection();
      if (this.ItemCount > iLastItemCount) {
        this.LocationSet = false;
      }
      if (this.ItemCount < iLastItemCount && this.IsContextMenu()) {
        this.LocationSet = false;
      }
    }
    return true;
  }

  DrawFrame(sfcSurface, iX, iY, iWdt, iHgt) {
    $.pDraw.DrawFrameDw(sfcSurface, iX + 1 | 0, iY + 1 | 0, (iX + iWdt | 0) - 1 | 0, (iY + iHgt | 0) - 1 | 0, 0xff440000);
  }

  InitLocation(cgoArea) {
    switch (this.Style) {
      case 0:
        this.ItemWidth = this.ItemHeight = 35;
        break;
      case 1:
        {
          this.ItemHeight = $max(16, $.GraphicsResource.FontRegular.GetLineHeight());
          const iWdt = [0];
          const iHgt = [0];
          $.GraphicsResource.FontRegular.GetTextExtent(P(this.Caption, 0), P(this, "ItemWidth"), P(iHgt, 0), true);
          this.ItemWidth = this.ItemWidth + (this.ItemHeight + 16 | 0) | 0;
          let pItem = null;
          for (let i = 0; (pItem = this.GetItem(i)) != null; i = i + 1 | 0) {
            $.GraphicsResource.FontRegular.GetTextExtent(P(pItem.Caption, 0), P(iWdt, 0), P(iHgt, 0), true);
            this.ItemWidth = $max(this.ItemWidth, iWdt[0] + pItem.GetSymbolWidth(this.ItemHeight) | 0);
          }
          this.ItemWidth = this.ItemWidth + 3 | 0;
          break;
        }
      case 2:
        {
          const iWdt = [0];
          const iHgt = [0];
          let iLargestTextWdt = 0;
          $.GraphicsResource.FontRegular.GetTextExtent(P(this.Caption, 0), P(iWdt, 0), P(iHgt, 0), true);
          iLargestTextWdt = (iWdt[0] + 32 | 0) + 2 | 0;
          this.ItemWidth = $min(ftoi32(Math.fround(cgoArea.Wdt - Math.fround(4))), $max(iLargestTextWdt, $.C4MN_DefInfoWdt$C4Menu));
          this.ItemHeight = 0;
          let sText = new $.StdStrBuf();
          let pItem = null;
          for (let i = 0; (pItem = this.GetItem(i)) != null; i = i + 1 | 0) {
            $.GraphicsResource.FontRegular.BreakMessage$pi8$i32$pStdStrBuf$b$f32(P(pItem.InfoCaption, 0), this.ItemWidth, sText, true);
            $.GraphicsResource.FontRegular.GetTextExtent(sText.getData(), P(iWdt, 0), P(iHgt, 0), true);
            0;
            this.ItemWidth = $max(this.ItemWidth, iWdt[0]);
            this.ItemHeight = $max(this.ItemHeight, iHgt[0]);
            iLargestTextWdt = $max(iLargestTextWdt, iWdt[0]);
          }
          this.ItemWidth = $min(this.ItemWidth, iLargestTextWdt);
          this.ItemWidth = this.ItemWidth + 3 | 0;
          this.ItemWidth = this.ItemWidth + 64 | 0;
          this.ItemHeight = $max(this.ItemHeight, $.C4PictureSize$C4Constants);
          break;
        }
      case 3:
        {
          const iWdt = [0];
          const iHgt = [0];
          $.GraphicsResource.FontRegular.GetTextExtent(P(this.Caption, 0), P(iWdt, 0), P(iHgt, 0), true);
          this.ItemWidth = $min(ftoi32(Math.fround(cgoArea.Wdt - Math.fround(4))), $max((iWdt[0] + 32 | 0) + 2 | 0, $.C4MN_DlgWdt$C4Menu));
          this.ItemHeight = iHgt[0];
          if (this.HasPortrait()) {
            if (this.ItemWidth > 128 && cgoArea.Hgt > cgoArea.Wdt) {
              this.ItemWidth = $max((this.ItemWidth - 64 | 0) - 5 | 0, 40);
            }
          }
        }
    }
    let DisplayedItemCount = this.ItemCount - (this.HasPortrait() ? 1 : 0) | 0;
    if (this.Style === 3) {
      this.Lines = 5;
    } else {
      this.Lines = (DisplayedItemCount / this.Columns | 0) + $min(DisplayedItemCount % this.Columns, 1) | 0;
    }
    this.Lines = $max($min(ftoi32(Math.fround(Math.fround(cgoArea.Hgt - Math.fround(100)) / Math.fround($max(this.ItemHeight, 1)))), this.Lines), 1);
    this.InitSize();
    let X = 0;
    let Y = 0;
    if ((this.Alignment & 16) !== 0) {
      X = this.rcBounds.x;
      Y = this.rcBounds.y;
    } else {
      X = ftoi32(Math.fround(Math.fround(cgoArea.Wdt - Math.fround(this.rcBounds.Wdt)) / Math.fround(2)));
      Y = ftoi32(Math.fround(Math.fround(cgoArea.Hgt - Math.fround(this.rcBounds.Hgt)) / Math.fround(2)));
    }
    if ((this.Alignment & 1) !== 0) {
      X = 35;
    }
    if ((this.Alignment & 2) !== 0) {
      X = ftoi32(Math.fround(Math.fround(cgoArea.Wdt - Math.fround(70)) - Math.fround(this.rcBounds.Wdt)));
    }
    if ((this.Alignment & 4) !== 0) {
      Y = 35;
    }
    if ((this.Alignment & 8) !== 0) {
      Y = ftoi32(Math.fround(Math.fround(cgoArea.Hgt - Math.fround(35)) - Math.fround(this.rcBounds.Hgt)));
    }
    if ((this.Alignment & 16) !== 0) {
      X = $.Clamp$i32$i32$i32(X, 0, ftoi32(Math.fround(cgoArea.Wdt - Math.fround(this.rcBounds.Wdt))));
      Y = $.Clamp$i32$i32$i32(Y, 0, ftoi32(Math.fround(cgoArea.Hgt - Math.fround(this.rcBounds.Hgt))));
    }
    if (Math.fround(this.rcBounds.Wdt) > Math.fround(cgoArea.Wdt - Math.fround(70))) {
      X = ftoi32(Math.fround(Math.fround(cgoArea.Wdt - Math.fround(this.rcBounds.Wdt)) / Math.fround(2)));
    }
    if (Math.fround(this.rcBounds.Hgt) > Math.fround(cgoArea.Hgt - Math.fround(70))) {
      Y = ftoi32(Math.fround(Math.fround(cgoArea.Hgt - Math.fround(this.rcBounds.Hgt)) / Math.fround(2)));
    }
    this.SetPos(X, Y);
    this.SetVisibility(true);
    this.UpdateElementPositions();
    this.UpdateScrollBar();
    this.AdjustPosition();
  }

  InitSize() {
    let pLast = $.Container.prototype.GetLast.call(this.pClientWindow);
    let Width = 0;
    let Height = 0;
    Width = Math.imul(this.Columns, this.ItemWidth);
    Height = Math.imul(this.Lines, this.ItemHeight);
    this.VisibleCount = Math.imul(this.Columns, this.Lines);
    let fBarNeeded = false;
    if (this.HasPortrait()) {
      Width = Width + 69 | 0;
    }
    if (pLast != null && this.Style === 3) {
      Height = $max(Height, (pLast.GetBounds().y + pLast.GetBounds().Hgt | 0) + 5 | 0);
      fBarNeeded = false;
    } else {
      fBarNeeded = pLast != null && (pLast.GetBounds().y + pLast.GetBounds().Hgt | 0) > this.pClientWindow.GetBounds().Hgt;
    }
    Width = Width + (((this.GetMarginLeft() + this.GetMarginRight() | 0) + this.pClientWindow.GetMarginLeft() | 0) + this.pClientWindow.GetMarginRight() | 0) | 0;
    Height = Height + (((this.GetMarginTop() + this.GetMarginBottom() | 0) + this.pClientWindow.GetMarginTop() | 0) + this.pClientWindow.GetMarginBottom() | 0) | 0;
    if (fBarNeeded) {
      Width = Width + 16 | 0;
    }
    this.SetBounds(new $.C4Rect().init$i32$i32$i32$i32(this.rcBounds.x, this.rcBounds.y, Width, Height));
    this.pClientWindow.SetScrollBarEnabled(fBarNeeded);
    this.UpdateOwnPos();
  }

  UpdateScrollBar() {
    let pLast = $.Container.prototype.GetLast.call(this.pClientWindow);
    let fBarNeeded = pLast != null && (pLast.GetBounds().y + pLast.GetBounds().Hgt | 0) > this.pClientWindow.GetBounds().Hgt;
    if ((this.pClientWindow.IsScrollBarEnabled() ? 1 : 0) === (fBarNeeded ? 1 : 0)) {
      return;
    }
    this.InitSize();
  }

  UserSelectItem(Player, pItem) {
    if (this.IsReadOnly()) {
      return;
    }
    if (pItem == null || !pItem.IsSelectable) {
      return;
    }
    this.OnUserSelectItem(Player, pItem.iIndex);
  }

  UserEnter(Player, pItem, fRight) {
    if (this.IsReadOnly()) {
      return;
    }
    if (pItem == null || !pItem.IsSelectable) {
      return;
    }
    this.OnUserEnter(Player, pItem.iIndex, fRight);
  }

  HasMouse() {
    let iPlayer = this.GetControllingPlayer();
    if (iPlayer === -1) {
      return true;
    }
    let pPlr = $.Players.Get(iPlayer);
    if (pPlr != null && pPlr.MouseControl !== 0) {
      return true;
    }
    return false;
  }

  DoRefillInternal(_rfRefilled) {
    return true;
  }

  MenuCommand(_szCommand, _fIsCloseCommand) {
    return true;
  }

  OnSelectionChanged(_iNewSelection) {
  }

  IsCloseDenied() {
    return false;
  }

  OnUserSelectItem(_Player, _iIndex) {
  }

  OnUserEnter(_Player, _iIndex, _fRight) {
  }

  OnUserClose$v() {
  }

  IsReadOnly() {
    return false;
  }

  GetControllingPlayer() {
    return -1;
  }

  GetID$v() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4Menu && C4Menu.prototype instanceof $c) return $c.prototype.GetID$v.apply(this, arguments); }
    return null;
  }

  HasPortrait() {
    return this.fHasPortrait;
  }

  GetViewport() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4Menu && C4Menu.prototype instanceof $c) return $c.prototype.GetViewport.apply(this, arguments); }
    for (let pVP = $.Viewports.GetFirstViewport(); pVP != null; pVP = pVP.GetNext()) {
      if (pVP.IsViewportMenu(this)) {
        return pVP;
      }
    }
    return null;
  }

  IsExternalDrawDialog() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4Menu && C4Menu.prototype instanceof $c) return $c.prototype.IsExternalDrawDialog.apply(this, arguments); }
    return true;
  }

  IsMouseControlled() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4Menu && C4Menu.prototype instanceof $c) return $c.prototype.IsMouseControlled.apply(this, arguments); }
    return false;
  }

  UpdateOwnPos() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4Menu && C4Menu.prototype instanceof $c) return $c.prototype.UpdateOwnPos.apply(this, arguments); }
    $.Window.prototype.UpdateOwnPos.call(this);
    this.UpdateElementPositions();
  }

  UpdateElementPositions() {
    if (!this.IsVisible() || this.pClientWindow == null) {
      return;
    }
    this.pClientWindow.SetBounds(this.GetContainedClientRect());
    let xOff = 0;
    let yOff = 0;
    let pCurr = $.Container.prototype.GetFirst.call(this.pClientWindow);
    let pPrev = null;
    if (this.HasPortrait() && pCurr != null) {
      xOff = 69;
      const fctPortrait = pCurr.Symbol;
      let rcPortraitBounds = new $.C4Rect().init$i32$i32$i32$i32(0, 0, 69, ftoi32(Math.fround(Math.fround(fctPortrait.Hgt * Math.fround(64)) / Math.fround($max(ftoi32(fctPortrait.Wdt), 1)))));
      if (pCurr.GetBounds().op_ne(rcPortraitBounds)) {
        pCurr.GetBounds().$assign(rcPortraitBounds);
        pCurr.UpdateOwnPos();
      }
      pCurr = $.Element.prototype.GetNext$v$c.call(pCurr);
    } else {
      xOff = 0;
    }
    let iMaxDlgOptionHeight = -1;
    let iIndex = 0;
    let rcNewBounds = new $.C4Rect().init$i32$i32$i32$i32(0, 0, this.ItemWidth, this.ItemHeight);
    let pFirstStack = pCurr;
    let pNext = pFirstStack;
    while ((pCurr = pNext) != null) {
      pNext = $.Element.prototype.GetNext$v$c.call(pCurr);
      if (this.Style === 3) {
        if (pPrev == null || (!pPrev.IsSelectable || !pCurr.IsSelectable)) {
          yOff = yOff + 5 | 0;
        } else {
          yOff = yOff + 3 | 0;
        }
        let sText = new $.StdStrBuf();
        let iAssumedItemHeight = $.GraphicsResource.FontRegular.GetLineHeight();
        const iWdt = [0];
        let iAvailWdt = this.ItemWidth;
        let iSymWdt = 0;
        for (; ; ) {
          iSymWdt = $min(pCurr.GetSymbolWidth(iAssumedItemHeight), iAvailWdt / 2 | 0);
          iAvailWdt = this.ItemWidth - iSymWdt | 0;
          $.GraphicsResource.FontRegular.BreakMessage$pi8$i32$pStdStrBuf$b$f32(P(pCurr.Caption, 0), iAvailWdt, sText, true);
          $.GraphicsResource.FontRegular.GetTextExtent(sText.getData(), P(iWdt, 0), P(rcNewBounds, "Hgt"), true);
          if (iSymWdt === 0 || rcNewBounds.Hgt <= iAssumedItemHeight) {
            break;
          }
          iAssumedItemHeight = rcNewBounds.Hgt;
        }
        if (this.fEqualIconItemHeight && iSymWdt !== 0) {
          if (iMaxDlgOptionHeight < 0) {
            iMaxDlgOptionHeight = rcNewBounds.Hgt;
          } else if (rcNewBounds.Hgt <= iMaxDlgOptionHeight) {
            rcNewBounds.Hgt = iMaxDlgOptionHeight;
          } else {
            iMaxDlgOptionHeight = rcNewBounds.Hgt;
            pNext = pFirstStack;
            pPrev = null;
            yOff = 0;
            iIndex = 0;
            continue;
          }
        }
        0;
        rcNewBounds.x = 0;
        rcNewBounds.y = yOff;
        yOff = yOff + rcNewBounds.Hgt | 0;
      } else {
        rcNewBounds.x = Math.imul(iIndex % $max(this.Columns, 1), this.ItemWidth);
        rcNewBounds.y = Math.imul(iIndex / $max(this.Columns, 1) | 0, this.ItemHeight);
      }
      rcNewBounds.x = rcNewBounds.x + xOff | 0;
      if (pCurr.GetBounds().op_ne(rcNewBounds)) {
        pCurr.GetBounds().$assign(rcNewBounds);
        pCurr.UpdateOwnPos();
      }
      iIndex = iIndex + 1 | 0;
      pPrev = pCurr;
    }
    this.pClientWindow.SetClientHeight(rcNewBounds.y + rcNewBounds.Hgt | 0);
    let pSel = this.GetSelectedItem();
    let szCapt = null;
    if (pSel != null && this.Style === 0) {
      szCapt = P(pSel.Caption, 0);
    } else {
      szCapt = P(this.Caption, 0);
    }
    this.SetTitle$pi8$b(szCapt.a[szCapt.o] !== 0 || this.Style === 3 ? szCapt : S(" "), this.HasMouse());
  }

  GetZOrdering() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4Menu && C4Menu.prototype instanceof $c) return $c.prototype.GetZOrdering.apply(this, arguments); }
    return -1;
  }

  Draw$rC4TargetFacet(cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4Menu && C4Menu.prototype instanceof $c) return $c.prototype.Draw$rC4TargetFacet.apply(this, arguments); }
    if (!this.IsActive$v()) {
      return;
    }
    if (!this.LocationSet) {
      this.InitLocation(cgo);
      this.LocationSet = true;
    }
    this.SetVisibility(true);
    $.Dialog.prototype.Draw$rC4TargetFacet.call(this, cgo);
    if (!this.fTextProgressing) {
      this.TimeOnSelection = this.TimeOnSelection + 1 | 0;
    }
    if (this.TimeOnSelection >= 90) {
      if (this.Style !== 2) {
        if (!$.Control$2.isReplay()) {
          if (!$.pGUI.Mouse.IsActiveInput()) {
            let pSel = this.GetSelectedItem();
            if (pSel != null && $rd(P(pSel.InfoCaption, 0)) !== 0) {
              const iX = [0];
              const iY = [0];
              pSel.ClientPos2ScreenPos(P(iX, 0), P(iY, 0));
              $.Screen.DrawToolTip(P(pSel.InfoCaption, 0), cgo, Math.fround(iX[0]), Math.fround(iY[0]));
            }
          }
        }
      }
    }
  }

  DrawElement(cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4Menu && C4Menu.prototype instanceof $c) return $c.prototype.DrawElement.apply(this, arguments); }
    $.Dialog.prototype.DrawElement.call(this, cgo);
    let idSelected = new $.C4ID().init$v();
    let pItem = null;
    if ((pItem = this.GetSelectedItem()) != null) {
      idSelected.$assign(pItem.id);
    } else {
      idSelected.$assign($.C4ID.None);
    }
    let pDef = $.C4Id2Def(idSelected.$clone());
    let iValue = 0;
    if (pDef != null) {
      if (pItem != null && pItem.fOwnValue) {
        iValue = pItem.iValue;
      } else {
        iValue = pDef.GetValue(null, -1);
      }
    }
    let cgoExtra = new $.C4Facet().init$pC4Surface$f32$f32$f32$f32(cgo.Surface, Math.fround(Math.fround(cgo.TargetX + Math.fround(this.rcBounds.x)) + Math.fround(1)), Math.fround(Math.fround(Math.fround(Math.fround(cgo.TargetY + Math.fround(this.rcBounds.y)) + Math.fround(this.rcBounds.Hgt)) - Math.fround(16)) - Math.fround(1)), Math.fround(this.rcBounds.Wdt - 2 | 0), Math.fround(16 /*C4MN_SymbolSize*/));
    if (this.Extra !== 0) {
      this.DrawFrame(cgoExtra.Surface, ftoi32(Math.fround(cgoExtra.X - Math.fround(1))), ftoi32(Math.fround(cgoExtra.Y - Math.fround(1))), ftoi32(Math.fround(cgoExtra.Wdt + Math.fround(1))), ftoi32(Math.fround(cgoExtra.Hgt + Math.fround(1))));
    }
    switch (this.Extra) {
      case 2:
        {
          if (pDef != null) {
            $.GraphicsResource.fctWealth.DrawValue(cgoExtra, iValue, 0, 0, 2);
          }
        }
        break;
    }
  }

  IsOwnPtrElement() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4Menu && C4Menu.prototype instanceof $c) return $c.prototype.IsOwnPtrElement.apply(this, arguments); }
    return true;
  }

  UserClose$b(_fOK) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4Menu && C4Menu.prototype instanceof $c) return $c.prototype.UserClose$b.apply(this, arguments); }
    if (this.IsReadOnly()) {
      return;
    }
    this.OnUserClose$v();
  }

  GetMarginBottom() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4Menu && C4Menu.prototype instanceof $c) return $c.prototype.GetMarginBottom.apply(this, arguments); }
    return ((this.Extra !== 0 ? 16 : 0) + 2 | 0) + $.Dialog.prototype.GetMarginBottom.call(this) | 0;
  }

  GetMarginLeft() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4Menu && C4Menu.prototype instanceof $c) return $c.prototype.GetMarginLeft.apply(this, arguments); }
    return 2 + $.Dialog.prototype.GetMarginLeft.call(this) | 0;
  }

  GetMarginRight() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4Menu && C4Menu.prototype instanceof $c) return $c.prototype.GetMarginRight.apply(this, arguments); }
    return 2 + $.Dialog.prototype.GetMarginRight.call(this) | 0;
  }

  $clone() { return new C4Menu().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.LocationSet = o.LocationSet;
    this.Permanent = o.Permanent;
    this.NeedRefill = o.NeedRefill;
    this.Style = o.Style;
    this.Selection = o.Selection;
    this.TimeOnSelection = o.TimeOnSelection;
    this.ItemCount = o.ItemCount;
    this.ItemWidth = o.ItemWidth;
    this.ItemHeight = o.ItemHeight;
    this.Extra = o.Extra;
    this.ExtraData = o.ExtraData;
    this.Identification = o.Identification;
    this.Columns = o.Columns;
    this.Lines = o.Lines;
    this.Alignment = o.Alignment;
    this.VisibleCount = o.VisibleCount;
    this.CloseCommand.$assign(o.CloseCommand);
    this.Caption = o.Caption.slice();
    this.Symbol.$assign(o.Symbol);
    this.pClientWindow = o.pClientWindow;
    this.fHasPortrait = o.fHasPortrait;
    this.fTextProgressing = o.fTextProgressing;
    this.fEqualIconItemHeight = o.fEqualIconItemHeight;
    this.fActive = o.fActive;
    return this;
  }
}









export function $init(): void {
  $.C4MN_DefInfoWdt$C4Menu = 270;
  $.C4MN_DlgWdt$C4Menu = 270;
  $.C4MN_DlgLines$C4Menu = 5;
  $.C4MN_DlgLineMargin$C4Menu = 5;
  $.C4MN_DlgOptionLineMargin$C4Menu = 3;
  $.C4MN_DlgPortraitWdt$C4Menu = 64;
  $.C4MN_DlgPortraitIndent$C4Menu = 5;
  $.C4MN_InfoCaption_Delay$C4Menu = 90;
}

Object.assign($, { C4Menu, C4MenuItem });
