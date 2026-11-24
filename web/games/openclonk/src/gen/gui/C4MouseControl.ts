// @ts-nocheck
// OpenClonk 36de799: src/gui/C4MouseControl.cpp, src/gui/C4MouseControl.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { ftoi32 } from '../../rt/int.ts';
import { P } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $min } from '../../rt/std.ts';

export class C4MouseControl {
  Active = false;
  fMouseOwned = false;
  Player = 0;
  pPlayer = null;
  Viewport = null;
  Cursor = 0;
  VpX = 0;
  VpY = 0;
  ViewX = 0;
  ViewY = 0;
  GameX = 0;
  GameY = 0;
  GuiX = 0;
  GuiY = 0;
  fctViewport = new $.C4Facet().init$v();
  fctViewportGame = new $.C4Facet().init$v();
  fctViewportGUI = new $.C4Facet().init$v();
  DownX = 0;
  DownY = 0;
  ScrollSpeed = 0;
  Drag = 0;
  LeftButtonDown = false;
  RightButtonDown = false;
  LeftDoubleIgnoreUp = false;
  ButtonDownOnSelection = false;
  ControlDown = false;
  ShiftDown = false;
  AltDown = false;
  Scrolling = false;
  InitCentered = false;
  FogOfWar = false;
  Visible = false;
  Selection = new $.C4ObjectList().init();
  DragObject = null;
  DragID = new $.C4ID().init$v();
  DragImageDef = null;
  DragImageObject = null;
  Caption = new $.StdCopyStrBuf();
  TooltipText = new $.StdCopyStrBuf();
  CaptionBottomY = 0;
  KeepCaption = 0;
  TimeInTooltipRectangle = 0;
  ToolTipRectangle = new $.C4Rect();
  TargetObject = null;
  DownTarget = null;

  init() {
    this.fctViewport = new $.C4Facet().init$v();
    this.fctViewportGame = new $.C4Facet().init$v();
    this.fctViewportGUI = new $.C4Facet().init$v();
    this.Selection = new $.C4ObjectList().init();
    this.DragID = new $.C4ID().init$v();
    this.Caption = new $.StdCopyStrBuf();
    this.TooltipText = new $.StdCopyStrBuf();
    this.ToolTipRectangle = new $.C4Rect();
    C4MouseControl.prototype.Default.call(this);
    return this;
  }

  $dtor() {
    C4MouseControl.prototype.Clear.call(this);
  }

  Default() {
    this.Active = false;
    this.Player = -1;
    this.pPlayer = null;
    this.Viewport = null;
    this.Cursor = 0;
    this.Caption.Clear();
    this.CaptionBottomY = 0;
    this.VpX = this.VpY = 0;
    this.DownX = this.DownY = Math.fround(0);
    this.ViewX = this.ViewY = Math.fround(0);
    this.GuiX = this.GuiY = this.GameX = this.GameY = Math.fround(0);
    this.LeftButtonDown = this.RightButtonDown = false;
    this.LeftDoubleIgnoreUp = false;
    this.ButtonDownOnSelection = false;
    this.Visible = true;
    this.InitCentered = false;
    this.FogOfWar = false;
    this.DragID.$assign($.C4ID.None);
    this.DragObject = null;
    this.KeepCaption = 0;
    this.Drag = 0;
    this.Selection.Default();
    this.TargetObject = this.DownTarget = null;
    this.ControlDown = false;
    this.ShiftDown = false;
    this.AltDown = false;
    this.Scrolling = false;
    this.ScrollSpeed = 10;
    this.DragImageDef = null;
    this.DragImageObject = null;
    this.fMouseOwned = true;
    $.C4Facet.prototype.Default.call(this.fctViewport);
  }

  Clear() {
    this.Active = false;
    this.Selection.Clear$v();
    this.UpdateClip();
  }

  Init(iPlayer) {
    this.Clear();
    this.Default();
    this.Active = true;
    this.Player = iPlayer;
    this.InitCentered = false;
    this.UpdateClip();
    return true;
  }

  Execute() {
    if (!this.Active || !this.fMouseOwned) {
      return;
    }
    if (this.Scrolling || $.Game.iTick5 === 0) {
      let wKeyState = 0;
      if (this.ControlDown) {
        wKeyState = (wKeyState | (64 /*KMOD_LCTRL*/ | 128 /*KMOD_RCTRL*/)) & 0xffff;
      }
      if (this.ShiftDown) {
        wKeyState = (wKeyState | (1 /*KMOD_LSHIFT*/ | 2 /*KMOD_RSHIFT*/)) & 0xffff;
      }
      if (this.AltDown) {
        wKeyState = (wKeyState | (256 /*KMOD_LALT*/ | 512 /*KMOD_RALT*/)) & 0xffff;
      }
      this.Move(0, this.VpX, this.VpY, wKeyState);
    }
  }

  HideCursor() {
    this.Visible = false;
  }

  ShowCursor() {
    this.Visible = true;
  }

  Draw(cgo, GameZoom) {
    let iOffsetX = 0;
    let iOffsetY = 0;
    let wdt = $.GraphicsResource.fctMouseCursor.Wdt;
    let hgt = $.GraphicsResource.fctMouseCursor.Hgt;
    let zoom = Math.fround(Math.fround($.Config.Graphics.MouseCursorSize) / hgt);
    hgt = Math.fround(hgt * zoom);
    wdt = Math.fround(wdt * zoom);
    let GuiZoom = new $.ZoomData();
    $.pDraw.GetZoom(GuiZoom);
    if (!this.Visible || !this.fMouseOwned) {
      return;
    }
    if (!this.IsPassive()) {
      this.Selection.DrawSelectMark(cgo);
    }
    switch (this.Drag) {
      case 0:
      case 6:
      case 7:
        iOffsetX = ftoi32(Math.fround(wdt / Math.fround(2)));
        iOffsetY = ftoi32(Math.fround(hgt / Math.fround(2)));
        switch (this.Cursor) {
          case 3:
            iOffsetY = ftoi32(Math.fround(Math.fround(iOffsetY) + Math.fround(-hgt / Math.fround(2))));
            break;
          case 4:
            iOffsetY = ftoi32(Math.fround(Math.fround(iOffsetY) + Math.fround(hgt / Math.fround(2))));
            break;
          case 5:
            iOffsetX = ftoi32(Math.fround(Math.fround(iOffsetX) + Math.fround(-wdt / Math.fround(2))));
            break;
          case 6:
            iOffsetX = ftoi32(Math.fround(Math.fround(iOffsetX) + Math.fround(wdt / Math.fround(2))));
            break;
          case 7:
            iOffsetX = ftoi32(Math.fround(Math.fround(iOffsetX) + Math.fround(-wdt / Math.fround(2))));
            iOffsetY = ftoi32(Math.fround(Math.fround(iOffsetY) + Math.fround(-hgt / Math.fround(2))));
            break;
          case 8:
            iOffsetX = ftoi32(Math.fround(Math.fround(iOffsetX) + Math.fround(wdt / Math.fround(2))));
            iOffsetY = ftoi32(Math.fround(Math.fround(iOffsetY) + Math.fround(-hgt / Math.fround(2))));
            break;
          case 9:
            iOffsetX = ftoi32(Math.fround(Math.fround(iOffsetX) + Math.fround(-wdt / Math.fround(2))));
            iOffsetY = ftoi32(Math.fround(Math.fround(iOffsetY) + Math.fround(hgt / Math.fround(2))));
            break;
          case 10:
            iOffsetX = ftoi32(Math.fround(Math.fround(iOffsetX) + Math.fround(wdt / Math.fround(2))));
            iOffsetY = ftoi32(Math.fround(Math.fround(iOffsetY) + Math.fround(hgt / Math.fround(2))));
            break;
        }
        if (this.DragImageObject != null || this.DragImageDef != null) {
          let pGfx = null;
          if (this.DragImageObject != null) {
            pGfx = this.DragImageObject.GetGraphics();
          } else {
            pGfx = this.DragImageDef.Graphics;
          }
          let ImageWdt = 0;
          let ImageHgt = 0;
          if (pGfx.Type === 1) {
            let Def = this.DragImageObject != null ? this.DragImageObject.Def : this.DragImageDef;
            ImageWdt = Math.fround(Def.PictureRect.Wdt);
            ImageHgt = Math.fround(Def.PictureRect.Hgt);
          } else if (pGfx.Type === 2) {
            ImageWdt = Math.fround(pGfx.$u1.Mesh.GetBoundingBox().y2 - pGfx.$u1.Mesh.GetBoundingBox().y1);
            ImageHgt = Math.fround(pGfx.$u1.Mesh.GetBoundingBox().z2 - pGfx.$u1.Mesh.GetBoundingBox().z1);
          } else {
            ImageWdt = ImageHgt = 1;
          }
          let fIsGameZoom = true;
          if (this.Drag === 6 && this.DragObject != null && (this.DragObject.Category & 32768) !== 0) {
            fIsGameZoom = false;
          }
          let XDraw = 0;
          let YDraw = 0;
          let ZoomDraw = 0;
          if (fIsGameZoom) {
            $.pDraw.SetZoom$ZoomData(GameZoom);
            XDraw = this.GameX;
            YDraw = this.GameY;
            ZoomDraw = 1;
          } else {
            ZoomDraw = $min(Math.fround(64 / ImageWdt), Math.fround(64 / ImageHgt));
            XDraw = this.GuiX;
            YDraw = this.GuiY;
          }
          iOffsetX = ftoi32(Math.fround(Math.fround(ZoomDraw * ImageWdt) / Math.fround(2)));
          iOffsetY = ftoi32(Math.fround(Math.fround(ZoomDraw * ImageHgt) / Math.fround(2)));
          let ccgo = new $.C4TargetFacet().init();
          ccgo.Set$pC4Surface$f32$f32$f32$f32$f32$f32$f32(cgo.Surface, Math.fround(Math.fround(XDraw + cgo.X) - Math.fround(iOffsetX)), Math.fround(Math.fround(YDraw + cgo.Y) - Math.fround(iOffsetY)), Math.fround(ImageWdt * ZoomDraw), Math.fround(ImageHgt * ZoomDraw));
          if (this.DragImageObject != null) {
            let ColorMod = this.DragImageObject.ColorMod;
            let BlitMode = this.DragImageObject.BlitMode;
            this.DragImageObject.ColorMod = this.Drag === 6 ? 0x7fffffff : 0x1f007f00;
            this.DragImageObject.BlitMode = 2;
            this.DragImageObject.DrawPicture(ccgo, false, null);
            this.DragImageObject.ColorMod = ColorMod;
            this.DragImageObject.BlitMode = BlitMode;
          } else {
            $.pDraw.SetBlitMode(2);
            $.pDraw.ActivateBlitModulation(this.Drag === 6 ? 0x7fffffff : 0x1f007f00);
            this.DragImageDef.Draw$rC4Facet$b$u32$pC4Object$i32$i32$pC4DrawTransform$pi8(ccgo, false, this.pPlayer != null ? this.pPlayer.ColorDw : 0xff0000ff, null, 0, 0, null);
            $.pDraw.DeactivateBlitModulation();
            $.pDraw.SetBlitMode(0);
          }
          if (fIsGameZoom) {
            $.pDraw.SetZoom$ZoomData(GuiZoom);
          }
          iOffsetX = ftoi32(Math.fround(wdt / Math.fround(2)));
          iOffsetY = ftoi32(Math.fround(hgt / Math.fround(2)));
        }
        if (this.DragImageDef == null && this.DragImageObject == null || this.Drag === 6) {
          $.GraphicsResource.fctMouseCursor.DrawX(cgo.Surface, Math.fround(Math.fround(cgo.X + this.GuiX) - Math.fround(iOffsetX)), Math.fround(Math.fround(cgo.Y + this.GuiY) - Math.fround(iOffsetY)), wdt, hgt, this.Cursor);
        }
        break;
    }
    if (this.Caption.op_const_void_() != null && $.pGUI != null) {
      let cgoTip = new $.C4TargetFacet().init();
      cgoTip.op_assign$C4Facet(cgo);
      $.Screen.DrawToolTip(this.Caption.getData(), cgoTip, Math.fround(cgo.X + this.GuiX), Math.fround(cgo.Y + this.GuiY));
    }
  }

  Move(iButton, iX, iY, dwKeyFlags, fCenter = false) {
    this.ControlDown = false;
    if ((dwKeyFlags & (64 /*KMOD_LCTRL*/ | 128 /*KMOD_RCTRL*/) >>> 0) >>> 0 !== 0) {
      this.ControlDown = true;
    }
    this.ShiftDown = false;
    if ((dwKeyFlags & (1 /*KMOD_LSHIFT*/ | 2 /*KMOD_RSHIFT*/) >>> 0) >>> 0 !== 0) {
      this.ShiftDown = true;
    }
    this.AltDown = false;
    if ((dwKeyFlags & (256 /*KMOD_LALT*/ | 512 /*KMOD_RALT*/) >>> 0) >>> 0 !== 0) {
      this.AltDown = true;
    }
    if (!this.Active || !this.fMouseOwned) {
      return;
    }
    if (this.KeepCaption !== 0) {
      this.KeepCaption = this.KeepCaption - 1 | 0;
    } else {
      this.Caption.Clear();
      this.CaptionBottomY = 0;
    }
    if (this.Player > -1) {
      this.pPlayer = $.Players.Get(this.Player);
      if (this.pPlayer == null) {
        this.Active = false;
        return;
      }
    } else {
      this.pPlayer = null;
    }
    if (!((this.Viewport = $.Viewports.GetViewport(this.Player)) != null)) {
      return;
    }
    let rcViewport = this.Viewport.GetOutputRect();
    this.fctViewport.Set$pC4Surface$f32$f32$f32$f32(null, Math.fround(rcViewport.x), Math.fround(rcViewport.y), Math.fround(rcViewport.Wdt), Math.fround(rcViewport.Hgt));
    this.ViewX = this.Viewport.GetViewX();
    this.ViewY = this.Viewport.GetViewY();
    this.fctViewportGame.$assign(this.Viewport.last_game_draw_cgo);
    this.fctViewportGUI.$assign(this.Viewport.last_gui_draw_cgo);
    if (!this.InitCentered || fCenter) {
      iX = this.Viewport.ViewWdt / 2 | 0;
      iY = this.Viewport.ViewHgt / 2 | 0;
      this.InitCentered = true;
    }
    if (this.IsPassive()) {
      if (iButton !== 7) {
        this.VpX = iX;
        this.VpY = iY;
        this.GameX = Math.fround(this.ViewX + Math.fround(Math.fround(this.VpX) / this.Viewport.Zoom));
        this.GameY = Math.fround(this.ViewY + Math.fround(Math.fround(this.VpY) / this.Viewport.Zoom));
        this.GuiX = Math.fround(Math.fround(this.VpX) / this.Viewport.GetGUIZoom());
        this.GuiY = Math.fround(Math.fround(this.VpY) / this.Viewport.GetGUIZoom());
      }
      this.UpdateScrolling();
      if (iButton === 1) {
        this.LeftDown();
      } else if (iButton === 2) {
        this.LeftUp();
      } else {
        this.UpdateCursorTarget();
      }
      return;
    }
    if (iButton !== 7) {
      this.VpX = iX;
      this.VpY = iY;
      this.GameX = Math.fround(this.ViewX + Math.fround(Math.fround(this.VpX) / this.Viewport.Zoom));
      this.GameY = Math.fround(this.ViewY + Math.fround(Math.fround(this.VpY) / this.Viewport.Zoom));
      this.GuiX = Math.fround(Math.fround(this.VpX) / this.Viewport.GetGUIZoom());
      this.GuiY = Math.fround(Math.fround(this.VpY) / this.Viewport.GetGUIZoom());
      this.UpdateScrolling();
      this.UpdateFogOfWar();
      if (this.FogOfWar && this.Drag === 0) {
        if (iButton === 2) {
          this.LeftButtonDown = false;
          this.Drag = 0;
        }
        if (iButton === 4) {
          this.RightButtonDown = false;
        }
      }
    }
    switch (iButton) {
      case 0:
        switch (this.Drag) {
          case 7:
            break;
          case 0:
            this.DragNone();
            break;
          case 6:
            this.DragScript();
            break;
        }
        break;
      case 1:
        this.LeftDown();
        break;
      case 2:
        this.LeftUp();
        break;
      case 5:
        this.LeftDouble();
        break;
      case 3:
        this.RightDown();
        break;
      case 4:
        this.RightUp();
        break;
      case 7:
        this.Wheel(dwKeyFlags);
        break;
    }
    let menuProcessed = false;
    if (this.pPlayer != null) {
      menuProcessed = $.Game.ScriptGuiRoot.MouseInput$i32$i32$i32$u32(iButton, iX, iY, dwKeyFlags);
    }
    if (menuProcessed) {
      this.Cursor = 0;
    }
    if (!menuProcessed) {
      if (iButton !== 0) {
        if (this.TargetObject == null) {
          if (this.pPlayer != null && this.pPlayer.ControlSet != null) {
            if (!menuProcessed && this.pPlayer.ControlSet.IsMouseControlAssigned(iButton)) {
              this.pPlayer.Control.DoMouseInput(0, iButton, this.GameX, this.GameY, this.GuiX, this.GuiY, dwKeyFlags);
            }
          }
        }
      }
    }
  }

  DoMoveInput() {
    if (!this.Active || !this.fMouseOwned) {
      return;
    }
    if (!((this.pPlayer = $.Players.Get(this.Player)) != null)) {
      return;
    }
    if (this.pPlayer.ControlSet == null) {
      return;
    }
    if (!this.pPlayer.ControlSet.IsMouseControlAssigned(0)) {
      return;
    }
    this.pPlayer.Control.DoMouseInput(0, 0, this.GameX, this.GameY, this.GuiX, this.GuiY, ((this.ControlDown && (64 /*KMOD_LCTRL*/ | 128 /*KMOD_RCTRL*/) !== 0 ? 1 : 0) | (this.ShiftDown && (1 /*KMOD_LSHIFT*/ | 2 /*KMOD_RSHIFT*/) !== 0 ? 1 : 0) | (this.AltDown && (256 /*KMOD_LALT*/ | 512 /*KMOD_RALT*/) !== 0 ? 1 : 0)) >>> 0);
  }

  IsViewport(pViewport) {
    return this.Viewport === pViewport;
  }

  ClearPointers(pObj) {
    if (this.TargetObject === pObj) {
      this.TargetObject = null;
    }
    if (this.DownTarget === pObj) {
      this.DownTarget = null;
    }
    if (this.DragObject === pObj) {
      this.DragObject = null;
      this.Drag = 0;
      this.DragImageDef = null;
      this.DragImageObject = null;
    }
    this.Selection.ClearPointers(pObj);
  }

  UpdateClip() {
  }

  SetOwnedMouse(fToVal) {
    this.fMouseOwned = fToVal;
  }

  IsMouseOwned() {
    return this.fMouseOwned;
  }

  IsActive() {
    return !!this.Active;
  }

  GetLastCursorPos(x_out_gui, y_out_gui, x_out_game, y_out_game) {
    if (!this.Active || !this.fMouseOwned) {
      return false;
    }
    x_out_gui.a[x_out_gui.o] = ftoi32(this.GuiX);
    y_out_gui.a[y_out_gui.o] = ftoi32(this.GuiY);
    x_out_game.a[x_out_game.o] = ftoi32(this.GameX);
    y_out_game.a[y_out_game.o] = ftoi32(this.GameY);
    return true;
  }

  GetCaption() {
    return this.Caption.getData();
  }

  SetTooltipText(text) {
    this.TooltipText.op_assign$StdStrBuf(text);
  }

  SetTooltipRectangle(rectangle) {
    this.ToolTipRectangle.$assign(new $.C4Rect().init$i32$i32$i32$i32(rectangle.x - 2 | 0, rectangle.y - 2 | 0, rectangle.Wdt + 4 | 0, rectangle.Hgt + 4 | 0));
    this.TimeInTooltipRectangle = 0;
  }

  UpdateFogOfWar() {
    this.FogOfWar = false;
    if (this.GameX < Math.fround(0) || this.GameY < Math.fround(0) || ftoi32(this.GameX) >= $.Landscape.GetWidth() || ftoi32(this.GameY) >= $.Landscape.GetHeight()) {
      this.FogOfWar = true;
      if (!this.Scrolling && (this.TargetObject == null || !((this.TargetObject.Category & 131072) !== 0))) {
        this.Cursor = 11;
      }
    }
  }

  RightUpDragNone() {
    this.Drag = 0;
    if (this.Cursor === 0 && !this.IsPassive() && this.Selection.GetObject() === this.DownTarget) {
      $.Game.Input.Add$i32$pC4ControlPacket(160 /*CID_PlrSelect*/, new $.C4ControlPlayerSelect().init$i32$C4ObjectList$b(this.Player, this.Selection, true));
    }
  }

  ButtonUpDragScript() {
    this.UpdateCursorTarget();
    this.Drag = 0;
    this.DragID.$assign($.C4ID.None);
    this.DragImageObject = null;
    this.DragImageDef = null;
    let DragObject = this.DragObject;
    this.DragObject = null;
    let DropObject = this.TargetObject;
    if (DragObject == null) {
      return;
    }
    if (DropObject != null && (~DropObject.GetPropertyInt(65 /*P_MouseDrag*/) & 2) !== 0) {
      DropObject = null;
    }
    let pPlr = $.Players.Get(this.Player);
    if (pPlr == null || pPlr.Eliminated !== 0) {
      return;
    }
    $.Game.Input.Add$i32$pC4ControlPacket(165 /*CID_PlrMouseMove*/, $.C4ControlPlayerMouse.DragDrop($.Players.Get(this.Player), DropObject, DragObject));
  }

  LeftUpDragNone() {
    this.Drag = 0;
    switch (this.Cursor) {
      case 0:
        if (!this.IsPassive() && this.Selection.GetObject() === this.DownTarget) {
          $.Game.Input.Add$i32$pC4ControlPacket(160 /*CID_PlrSelect*/, new $.C4ControlPlayerSelect().init$i32$C4ObjectList$b(this.Player, this.Selection, false));
        }
        break;
      default:
        break;
    }
    this.Selection.Clear$v();
  }

  DragScript() {
    this.UpdateCursorTarget();
    this.UpdateSingleSelection();
    this.Cursor = 2;
  }

  Wheel(_dwFlags) {
  }

  RightUp() {
    switch (this.Drag) {
      case 7:
      case 0:
        this.RightUpDragNone();
        break;
      case 6:
        this.ButtonUpDragScript();
        break;
    }
    this.RightButtonDown = false;
    if (!this.LeftButtonDown) {
      this.DownTarget = null;
    }
  }

  RightDown() {
    this.RightButtonDown = true;
    this.DownX = this.GameX;
    this.DownY = this.GameY;
    this.DownTarget = this.TargetObject;
  }

  LeftDouble() {
    this.LeftButtonDown = false;
    this.LeftDoubleIgnoreUp = true;
    switch (this.Drag) {
      case 0:
        break;
    }
  }

  DragNone() {
    this.UpdateCursorTarget();
    this.UpdateSingleSelection();
    if ((this.LeftButtonDown || this.RightButtonDown) && ($.Abs$f32(Math.fround(this.GameX - this.DownX)) > Math.fround(5) || $.Abs$f32(Math.fround(this.GameY - this.DownY)) > Math.fround(5))) {
      let fAllowDrag = true;
      if (fAllowDrag && this.DownTarget != null && (!this.FogOfWar || (this.DownTarget.Category & 131072) !== 0)) {
        const drag_image_obj = [null];
        const drag_image_def = [null];
        if ((this.DownTarget.GetPropertyInt(65 /*P_MouseDrag*/) & 1) !== 0 && this.DownTarget.GetDragImage(P(drag_image_obj, 0), P(drag_image_def, 0))) {
          this.Drag = 6;
          if (drag_image_obj[0] != null) {
            this.DragImageObject = drag_image_obj[0];
          } else {
            this.DragImageDef = drag_image_def[0];
          }
          this.DragObject = this.DownTarget;
        }
      }
      if (this.Drag === 0) {
        this.Drag = 7;
      }
    }
  }

  LeftUp() {
    if (this.LeftDoubleIgnoreUp) {
      this.LeftDoubleIgnoreUp = false;
    } else {
      switch (this.Drag) {
        case 7:
        case 0:
          this.LeftUpDragNone();
          break;
        case 6:
          this.ButtonUpDragScript();
          break;
      }
    }
    this.LeftButtonDown = false;
    if (!this.RightButtonDown) {
      this.DownTarget = null;
    }
  }

  LeftDown() {
    this.LeftButtonDown = true;
    this.DownX = this.GameX;
    this.DownY = this.GameY;
    this.DownTarget = this.TargetObject;
  }

  UpdateScrolling() {
    this.Scrolling = false;
    if (this.pPlayer != null) {
      if (this.pPlayer.IsViewLocked()) {
        return;
      }
    }
    if (this.VpX === 0) {
      this.Cursor = 5;
      this.ScrollView(Math.fround(Math.fround(-this.ScrollSpeed | 0) / this.Viewport.Zoom), Math.fround(0), Math.fround(Math.fround(this.Viewport.ViewWdt) / this.Viewport.Zoom), Math.fround(Math.fround(this.Viewport.ViewHgt) / this.Viewport.Zoom));
      this.Scrolling = true;
    }
    if (this.VpY === 0) {
      this.Cursor = 3;
      this.ScrollView(Math.fround(0), Math.fround(Math.fround(-this.ScrollSpeed | 0) / this.Viewport.Zoom), Math.fround(Math.fround(this.Viewport.ViewWdt) / this.Viewport.Zoom), Math.fround(Math.fround(this.Viewport.ViewHgt) / this.Viewport.Zoom));
      this.Scrolling = true;
    }
    if (this.VpX === (this.Viewport.ViewWdt - 1 | 0)) {
      this.Cursor = 6;
      this.ScrollView(Math.fround(Math.fround(this.ScrollSpeed) / this.Viewport.Zoom), Math.fround(0), Math.fround(Math.fround(this.Viewport.ViewWdt) / this.Viewport.Zoom), Math.fround(Math.fround(this.Viewport.ViewHgt) / this.Viewport.Zoom));
      this.Scrolling = true;
    }
    if (this.VpY === (this.Viewport.ViewHgt - 1 | 0)) {
      this.Cursor = 4;
      this.ScrollView(Math.fround(0), Math.fround(Math.fround(this.ScrollSpeed) / this.Viewport.Zoom), Math.fround(Math.fround(this.Viewport.ViewWdt) / this.Viewport.Zoom), Math.fround(Math.fround(this.Viewport.ViewHgt) / this.Viewport.Zoom));
      this.Scrolling = true;
    }
    if (this.VpX === 0 && this.VpY === 0) {
      this.Cursor = 7;
    }
    if (this.VpX === (this.Viewport.ViewWdt - 1 | 0) && this.VpY === 0) {
      this.Cursor = 8;
    }
    if (this.VpX === 0 && this.VpY === (this.Viewport.ViewHgt - 1 | 0)) {
      this.Cursor = 9;
    }
    if (this.VpX === (this.Viewport.ViewWdt - 1 | 0) && this.VpY === (this.Viewport.ViewHgt - 1 | 0)) {
      this.Cursor = 10;
    }
  }

  UpdateCursorTarget() {
    let OldTargetObject = this.TargetObject;
    if (this.Scrolling) {
      this.TargetObject = null;
    } else {
      this.TargetObject = this.GetTargetObject();
      if (this.TargetObject != null && this.FogOfWar && !((this.TargetObject.Category & 131072) !== 0)) {
        this.TargetObject = null;
      }
      if (!this.FogOfWar && !this.IsPassive()) {
        this.Cursor = 1;
      }
      if (this.TargetObject != null && !this.IsPassive()) {
        this.Cursor = 1;
        let CanSelect = false;
        if (this.Drag === 6) {
          CanSelect = (this.TargetObject.GetPropertyInt(65 /*P_MouseDrag*/) & 2) !== 0;
        } else {
          CanSelect = (this.TargetObject.GetPropertyInt(65 /*P_MouseDrag*/) & 4) === 0;
        }
        if ((this.TargetObject.Category & 16384) !== 0 && CanSelect) {
          this.Cursor = 0;
        } else {
          this.TargetObject = null;
        }
      }
      if (this.IsPassive()) {
        this.Cursor = 11;
      }
      if (OldTargetObject !== this.TargetObject) {
        let newTooltip = null;
        if (this.TargetObject != null && this.Cursor === 0 && (this.TargetObject.Category & 16384) !== 0 && (newTooltip = this.TargetObject.GetPropertyStr(82 /*P_Tooltip*/)) != null) {
          const objX = [0];
          const objY = [0];
          this.TargetObject.GetViewPos(P(objX, 0), P(objY, 0), -this.fctViewportGUI.X, -this.fctViewportGUI.Y, this.fctViewportGUI);
          objX[0] = Math.fround(objX[0] + Math.fround(this.TargetObject.Shape.x));
          objY[0] = Math.fround(objY[0] + Math.fround(this.TargetObject.Shape.y - this.TargetObject.addtop() | 0));
          this.SetTooltipRectangle(new $.C4Rect().init$i32$i32$i32$i32(ftoi32(objX[0]), ftoi32(objY[0]), this.TargetObject.Shape.Wdt, this.TargetObject.Shape.Hgt + this.TargetObject.addtop() | 0));
          this.SetTooltipText(new $.StdStrBuf().init$pi8$b(newTooltip.GetCStr()));
        } else {
          this.SetTooltipRectangle(new $.C4Rect().init$i32$i32$i32$i32(0, 0, 0, 0));
        }
      }
      if (this.KeepCaption === 0 && this.ToolTipRectangle.Wdt !== 0 && $.Inside$f32$i32$i32(this.GuiX, this.ToolTipRectangle.x, this.ToolTipRectangle.x + this.ToolTipRectangle.Wdt | 0) && $.Inside$f32$i32$i32(this.GuiY, this.ToolTipRectangle.y, this.ToolTipRectangle.y + this.ToolTipRectangle.Hgt | 0)) {
        this.TimeInTooltipRectangle = this.TimeInTooltipRectangle + 1 | 0;
        if (this.TimeInTooltipRectangle >= 20) {
          this.Caption.$assign(this.TooltipText);
        }
      } else {
        this.TimeInTooltipRectangle = 0;
        this.ToolTipRectangle.Wdt = 0;
      }
    }
    if (!this.IsPassive() && OldTargetObject !== this.TargetObject) {
      $.Game.Input.Add$i32$pC4ControlPacket(165 /*CID_PlrMouseMove*/, $.C4ControlPlayerMouse.Hover($.Players.Get(this.Player), this.TargetObject, OldTargetObject, this.DragObject));
    }
  }

  UpdateSingleSelection() {
    if (this.TargetObject != null && this.Cursor === 0) {
      this.Selection.Clear$v();
      this.Selection.Add$pC4Object$i32$pC4ObjectList(this.TargetObject, 0 /*stNone*/);
    } else if (this.Selection.GetObject() != null) {
      if ($.Players.Get(this.Player).ObjectInCrew(this.Selection.GetObject()) || (this.Selection.GetObject().Category & 16384) !== 0) {
        this.Selection.Clear$v();
      }
    }
    return this.Selection.ObjectCount();
  }

  GetTargetObject() {
    let pObj = $.Game.FindVisObject(this.ViewX, this.ViewY, this.Player, this.fctViewportGame, this.fctViewportGUI, this.GameX, this.GameY, 16384, Math.fround(this.GuiX - this.fctViewportGUI.X), Math.fround(this.GuiY - this.fctViewportGUI.Y));
    if (pObj == null) {
      return null;
    }
    return pObj;
  }

  IsPassive() {
    return $.Control$2.isReplay() || this.Player <= -1;
  }

  ScrollView(iX, iY, ViewWdt, ViewHgt) {
    if (this.pPlayer != null) {
      this.pPlayer.ScrollView(iX, iY, ViewWdt, ViewHgt);
    } else if (this.Viewport != null) {
      this.Viewport.ScrollView(iX, iY);
    }
  }

  IsDragging() {
    return this.Active && this.Drag === 6;
  }

  IsLeftDown() {
    return this.LeftButtonDown;
  }

  GetPlayer() {
    return this.Player;
  }

  $clone() { return new C4MouseControl().$assign(this); }
  $assign(o) {
    this.Active = o.Active;
    this.fMouseOwned = o.fMouseOwned;
    this.Player = o.Player;
    this.pPlayer = o.pPlayer;
    this.Viewport = o.Viewport;
    this.Cursor = o.Cursor;
    this.VpX = o.VpX;
    this.VpY = o.VpY;
    this.ViewX = o.ViewX;
    this.ViewY = o.ViewY;
    this.GameX = o.GameX;
    this.GameY = o.GameY;
    this.GuiX = o.GuiX;
    this.GuiY = o.GuiY;
    this.fctViewport.$assign(o.fctViewport);
    this.fctViewportGame.$assign(o.fctViewportGame);
    this.fctViewportGUI.$assign(o.fctViewportGUI);
    this.DownX = o.DownX;
    this.DownY = o.DownY;
    this.ScrollSpeed = o.ScrollSpeed;
    this.Drag = o.Drag;
    this.LeftButtonDown = o.LeftButtonDown;
    this.RightButtonDown = o.RightButtonDown;
    this.LeftDoubleIgnoreUp = o.LeftDoubleIgnoreUp;
    this.ButtonDownOnSelection = o.ButtonDownOnSelection;
    this.ControlDown = o.ControlDown;
    this.ShiftDown = o.ShiftDown;
    this.AltDown = o.AltDown;
    this.Scrolling = o.Scrolling;
    this.InitCentered = o.InitCentered;
    this.FogOfWar = o.FogOfWar;
    this.Visible = o.Visible;
    this.Selection.$assign(o.Selection);
    this.DragObject = o.DragObject;
    this.DragID.$assign(o.DragID);
    this.DragImageDef = o.DragImageDef;
    this.DragImageObject = o.DragImageObject;
    this.Caption.$assign(o.Caption);
    this.TooltipText.$assign(o.TooltipText);
    this.CaptionBottomY = o.CaptionBottomY;
    this.KeepCaption = o.KeepCaption;
    this.TimeInTooltipRectangle = o.TimeInTooltipRectangle;
    this.ToolTipRectangle.$assign(o.ToolTipRectangle);
    this.TargetObject = o.TargetObject;
    this.DownTarget = o.DownTarget;
    return this;
  }
}







































export function $init(): void {
  $.C4MC_Button_None$C4MouseControl = 0;
  $.C4MC_Button_LeftDown$C4MouseControl = 1;
  $.C4MC_Button_LeftUp$C4MouseControl = 2;
  $.C4MC_Button_RightDown$C4MouseControl = 3;
  $.C4MC_Button_RightUp$C4MouseControl = 4;
  $.C4MC_Button_LeftDouble$C4MouseControl = 5;
  $.C4MC_Button_RightDouble$C4MouseControl = 6;
  $.C4MC_Button_Wheel$C4MouseControl = 7;
  $.C4MC_Drag_None$C4MouseControl = 0;
  $.C4MC_Button_MiddleDown$C4MouseControl = 8;
  $.C4MC_Drag_Script$C4MouseControl = 6;
  $.C4MC_Button_MiddleUp$C4MouseControl = 9;
  $.C4MC_Drag_Unhandled$C4MouseControl = 7;
  $.C4MC_Button_MiddleDouble$C4MouseControl = 10;
  $.C4MC_Tooltip_Delay$C4MouseControl = 20;
  $.C4MC_Button_X1Down$C4MouseControl = 11;
  $.C4MC_Button_X1Up$C4MouseControl = 12;
  $.C4MC_Button_X1Double$C4MouseControl = 13;
  $.C4MC_Button_X2Down$C4MouseControl = 14;
  $.C4MC_Button_X2Up$C4MouseControl = 15;
  $.C4MC_Button_X2Double$C4MouseControl = 16;
  $.C4MC_DragSensitivity$C4MouseControl = 5;
  $.C4MC_MD_DragSource$C4MouseControl = 1;
  $.C4MC_MD_DropTarget$C4MouseControl = 2;
  $.C4MC_MD_NoClick$C4MouseControl = 4;
  $.C4MC_Cursor_Select$C4MouseControl = 0;
  $.C4MC_Cursor_Crosshair$C4MouseControl = 1;
  $.C4MC_Cursor_DragDrop$C4MouseControl = 2;
  $.C4MC_Cursor_Up$C4MouseControl = 3;
  $.C4MC_Cursor_Down$C4MouseControl = 4;
  $.C4MC_Cursor_Left$C4MouseControl = 5;
  $.C4MC_Cursor_Right$C4MouseControl = 6;
  $.C4MC_Cursor_UpLeft$C4MouseControl = 7;
  $.C4MC_Cursor_UpRight$C4MouseControl = 8;
  $.C4MC_Cursor_DownLeft$C4MouseControl = 9;
  $.C4MC_Cursor_DownRight$C4MouseControl = 10;
  $.C4MC_Cursor_Passive$C4MouseControl = 11;
  $.C4MC_Cursor_DropInto$C4MouseControl = 12;
}

Object.assign($, { C4MouseControl });
