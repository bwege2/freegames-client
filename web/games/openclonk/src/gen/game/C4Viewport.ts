// @ts-nocheck
// OpenClonk 36de799: src/game/C4Viewport.cpp, src/game/C4Viewport.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n, ftoi32 } from '../../rt/int.ts';
import { c$pow, c$sqrt } from '../../rt/libc.ts';
import { S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $max, $min, $missing } from '../../rt/std.ts';

export class C4Viewport {
  ViewWdt = 0;
  ViewHgt = 0;
  BorderLeft = 0;
  BorderTop = 0;
  BorderRight = 0;
  BorderBottom = 0;
  DrawX = 0;
  DrawY = 0;
  last_game_draw_cgo = new $.C4TargetFacet().init();
  last_gui_draw_cgo = new $.C4TargetFacet().init();
  fIsNoOwnerViewport = false;
  viewX = 0;
  viewY = 0;
  targetViewX = 0;
  targetViewY = 0;
  viewOffsX = 0;
  viewOffsY = 0;
  Zoom = 0;
  ZoomTarget = 0;
  ZoomLimitMin = 0;
  ZoomLimitMax = 0;
  ViewportOpenFrame = 0;
  Player = 0;
  PlayerLock = false;
  OutX = 0;
  OutY = 0;
  ResetMenuPositions = false;
  Next = null;
  pWindow = null;
  pFoW = null;

  init() {
    this.last_game_draw_cgo = new $.C4TargetFacet().init();
    this.last_gui_draw_cgo = new $.C4TargetFacet().init();
    this.pWindow = null;
    this.pFoW = null;
    this.Player = 0;
    this.viewX = this.viewY = Math.fround(0);
    this.targetViewX = this.targetViewY = Math.fround(0);
    this.ViewWdt = this.ViewHgt = 0;
    this.BorderLeft = this.BorderTop = this.BorderRight = this.BorderBottom = Math.fround(0);
    this.OutX = this.OutY = this.ViewWdt = this.ViewHgt = 0;
    this.DrawX = this.DrawY = 0;
    this.Zoom = Math.fround(1);
    this.ZoomTarget = Math.fround(0);
    this.ViewportOpenFrame = 0;
    this.ZoomLimitMin = this.ZoomLimitMax = Math.fround(0);
    this.Next = null;
    this.PlayerLock = true;
    this.ResetMenuPositions = false;
    this.viewOffsX = this.viewOffsY = 0;
    this.fIsNoOwnerViewport = false;
    return this;
  }

  $dtor() {
    C4Viewport.prototype.DisableFoW.call(this);
    if (this.pWindow != null) {
      $delete(this.pWindow.pSurface);
      this.pWindow.Clear();
    }
  }

  GetZoom$v() {
    return this.Zoom;
  }

  SetZoom$f32(zoom_value) {
    this.Zoom = zoom_value;
    this.ZoomTarget = zoom_value;
  }

  GetGUIZoom() {
    return $.Clamp$f32$f32$f32(Math.fround(Math.fround(this.ViewWdt) / Math.fround(1280)), 0.5, 1);
  }

  Execute() {
    this.AdjustZoomAndPosition();
    let cgo = new $.C4TargetFacet().init();
    let target = this.pWindow != null ? this.pWindow.pSurface : $.FullScreen.pSurface;
    cgo.Set$pC4Surface$f32$f32$f32$f32$f32$f32$f32(target, Math.fround(this.DrawX), Math.fround(this.DrawY), Math.fround(Math.fround(this.ViewWdt) / this.Zoom), Math.fround(Math.fround(this.ViewHgt) / this.Zoom), this.GetViewX(), this.GetViewY(), this.Zoom);
    $.pDraw.PrepareRendering(target);
    let uniform_pop = $.pDraw.scriptUniform.Push($.GameScript.ScenPropList.getPropList());
    try {
      let draw_game = true;
      if (this.Player === -1) {
        if ($.Application.isEditor === 0 && !$.Game.DebugMode) {
          if (!$.Network.isEnabled() || !($.Network.Clients.GetLocal() != null) || !$.Network.Clients.GetLocal().isObserver()) {
            if ($.Game.PlayerInfos.GetJoinIssuedPlayerCount() > 0) {
              if ($.Game.C4S.Landscape.Secret) {
                draw_game = false;
              }
            }
          }
        }
      }
      this.Draw(cgo, draw_game, true);
      this.BlitOutput();
    } finally { uniform_pop && uniform_pop.$dtor(); }
  }

  ClearPointers(_obj) {
  }

  SetOutputSize(draw_x, draw_y, out_x, out_y, out_wdt, out_hgt) {
    let deltaWidth = this.ViewWdt - out_wdt | 0;
    let deltaHeight = this.ViewHgt - out_hgt | 0;
    this.DrawX = draw_x;
    this.DrawY = draw_y;
    this.OutX = out_x;
    this.OutY = out_y;
    this.ViewWdt = out_wdt;
    this.ViewHgt = out_hgt;
    this.ScrollView(Math.fround(deltaWidth / 2 | 0), Math.fround(deltaHeight / 2 | 0));
    this.CalculateZoom();
    this.ResetMenuPositions = true;
    let player = null;
    if ((player = $.Players.Get(this.Player)) != null) {
      if (player.MouseControl !== 0) {
        $.MouseControl.UpdateClip();
        $.pGUI.SetPreferredDlgRect(new $.C4Rect().init$i32$i32$i32$i32(out_x, out_y, out_wdt, out_hgt));
      }
    }
  }

  CalculateZoom() {
    if (this.ViewportOpenFrame >= $.Game.FrameCounter) {
      this.InitZoom();
    }
    let player = $.Players.Get(this.Player);
    if (player != null) {
      player.ZoomLimitsToViewport(this);
    } else {
      this.SetZoomLimits(Math.fround(0.8 * $min(Math.fround(Math.fround(this.ViewWdt) / Math.fround($.Landscape.GetWidth())), Math.fround(Math.fround(this.ViewHgt) / Math.fround($.Landscape.GetHeight())))), Math.fround(8));
    }
  }

  ChangeZoom(by_factor) {
    this.ZoomTarget = Math.fround(this.ZoomTarget * by_factor);
    if (this.ZoomLimitMin !== 0 && this.ZoomTarget < this.ZoomLimitMin) {
      this.ZoomTarget = this.ZoomLimitMin;
    }
    if (this.ZoomLimitMax !== 0 && this.ZoomTarget > this.ZoomLimitMax) {
      this.ZoomTarget = this.ZoomLimitMax;
    }
  }

  SetZoom$f32$b(to_value, direct = false) {
    this.ZoomTarget = to_value;
    if (this.Player !== -1 || $.Application.isEditor === 0) {
      if (this.ZoomLimitMin !== 0 && this.ZoomTarget < this.ZoomLimitMin) {
        this.ZoomTarget = this.ZoomLimitMin;
      }
      if (this.ZoomLimitMax !== 0 && this.ZoomTarget > this.ZoomLimitMax) {
        this.ZoomTarget = this.ZoomLimitMax;
      }
    }
    if (direct) {
      this.Zoom = this.ZoomTarget;
    }
  }

  SetZoomLimits(to_min_zoom, to_max_zoom) {
    this.ZoomLimitMin = to_min_zoom;
    this.ZoomLimitMax = to_max_zoom;
    if (this.ZoomLimitMax !== 0 && this.ZoomLimitMax < this.ZoomLimitMin) {
      this.ZoomLimitMax = this.ZoomLimitMin;
    }
    this.ChangeZoom(Math.fround(1));
  }

  GetZoomByViewRange(size_x, size_y) {
    let zoom_by_y = false;
    if (size_x !== 0 && size_y !== 0) {
      zoom_by_y = Math.imul(size_y, this.ViewWdt) > Math.imul(size_x, this.ViewHgt);
    } else if (size_y !== 0) {
      zoom_by_y = true;
    } else {
      if (size_x === 0) {
        size_x = 600;
      }
      zoom_by_y = false;
    }
    if (zoom_by_y) {
      return Math.fround(Math.fround(this.ViewHgt) / Math.fround(size_y));
    } else {
      return Math.fround(Math.fround(this.ViewWdt) / Math.fround(size_x));
    }
  }

  GetZoomLimitMin() {
    return this.ZoomLimitMin;
  }

  GetZoomLimitMax() {
    return this.ZoomLimitMax;
  }

  GetZoomTarget() {
    return this.ZoomTarget;
  }

  Init(for_player, set_temporary_only) {
    if (!($.ValidPlr(for_player) !== 0)) {
      for_player = -1;
    }
    this.Player = for_player;
    this.ViewportOpenFrame = $.Game.FrameCounter;
    if (!set_temporary_only) {
      this.fIsNoOwnerViewport = for_player === -1;
    }
    if ($.Application.isEditor !== 0) {
      this.pWindow = new $.C4ViewportWindow().init(this);
      if (!(this.pWindow.Init$i32(this.Player) != null)) {
        return false;
      }
      this.UpdateOutputSize();
      if (!($.ValidPlr(this.Player) !== 0)) {
        this.TogglePlayerLock();
      }
    } else {
      if ($.ValidPlr(for_player) !== 0) {
        $.GraphicsSystem.FlashMessage(S(""));
      }
    }
    this.EnableFoW();
    return true;
  }

  DropFile(filename, x, y) {
    $.Game.DropFile(filename, Math.fround(this.GetViewX() + Math.fround(x / this.Zoom)), Math.fround(this.GetViewY() + Math.fround(y / this.Zoom)));
  }

  TogglePlayerLock(..._) { return $missing("C4Viewport::TogglePlayerLock"); }

  GetPlayerLock() {
    return this.PlayerLock;
  }

  NextPlayer() {
    let player = null;
    let player_nr = 0;
    if (!((player = $.Players.Get(this.Player)) != null)) {
      if (!((player = $.Players.First) != null)) {
        return;
      }
    } else if (!((player = player.Next) != null)) {
      if ($.Game.C4S.Head.Film !== 0 && $.Game.C4S.Head.Replay) {
        player = $.Players.First;
      }
    }
    if (player != null) {
      player_nr = player.Number;
    } else {
      player_nr = -1;
    }
    if (player_nr !== this.Player) {
      this.Init(player_nr, true);
    }
  }

  GetOutputRect() {
    return new $.C4Rect().init$i32$i32$i32$i32(this.OutX, this.OutY, this.ViewWdt, this.ViewHgt);
  }

  IsViewportMenu(menu) {
    let player = $.Players.Get(this.Player);
    if (player != null && player.Eliminated !== 0) {
      return false;
    }
    if (player != null && player.Cursor.op_C4Object_() != null && player.Cursor.op_arrow().Menu === menu) {
      return true;
    }
    if (player != null && player.Menu.IsActive$v() && player.Menu === menu) {
      return true;
    }
    if ($.FullScreen.MainMenu != null && $.FullScreen.MainMenu.IsActive$v() && $.FullScreen.MainMenu === menu) {
      return true;
    }
    return false;
  }

  GetNext() {
    return this.Next;
  }

  GetPlayer() {
    return this.Player;
  }

  CenterPosition() {
    this.SetViewX(Math.fround(Math.fround($.Landscape.GetWidth() / 2 | 0) + Math.fround(Math.fround(Math.fround(this.ViewWdt) / this.Zoom) / Math.fround(2))));
    this.SetViewY(Math.fround(Math.fround($.Landscape.GetHeight() / 2 | 0) + Math.fround(Math.fround(Math.fround(this.ViewHgt) / this.Zoom) / Math.fround(2))));
  }

  DisableFoW() {
    this.pFoW = null;
  }

  EnableFoW() {
    if ($.Landscape.HasFoW() && this.Player !== -1) {
      this.pFoW = new $.C4FoWRegion().init($.Landscape.GetFoW(), $.Players.Get(this.Player));
    } else {
      this.DisableFoW();
    }
  }

  GetViewX() {
    return this.viewX;
  }

  GetViewY() {
    return this.viewY;
  }

  GetViewCenterX() {
    return Math.fround(this.viewX + Math.fround(Math.fround(Math.fround(this.ViewWdt) / this.Zoom) / Math.fround(2)));
  }

  GetViewCenterY() {
    return Math.fround(this.viewY + Math.fround(Math.fround(Math.fround(this.ViewHgt) / this.Zoom) / Math.fround(2)));
  }

  WindowToGameX(win_x) {
    return Math.fround(this.GetViewX() + Math.fround(Math.fround(win_x) / this.Zoom));
  }

  WindowToGameY(win_y) {
    return Math.fround(this.GetViewY() + Math.fround(Math.fround(win_y) / this.Zoom));
  }

  ScrollView(by_x, by_y) {
    this.SetViewX(Math.fround(this.viewX + by_x));
    this.SetViewY(Math.fround(this.viewY + by_y));
  }

  SetViewX(x) {
    this.viewX = x;
    if (this.fIsNoOwnerViewport) {
      if (Math.fround($.Landscape.GetWidth()) < Math.fround(Math.fround(this.ViewWdt) / this.Zoom)) {
        this.viewX = Math.fround(Math.fround($.Landscape.GetWidth() / 2 | 0) - Math.fround(Math.fround(Math.fround(this.ViewWdt) / this.Zoom) / Math.fround(2)));
      } else {
        this.viewX = $.Clamp$f32$f32$f32(x, 0, Math.fround(Math.fround($.Landscape.GetWidth()) - Math.fround(Math.fround(this.ViewWdt) / this.Zoom)));
      }
    }
    this.UpdateBordersX();
  }

  SetViewY(y) {
    this.viewY = y;
    if (this.fIsNoOwnerViewport) {
      if (Math.fround($.Landscape.GetHeight()) < Math.fround(Math.fround(this.ViewHgt) / this.Zoom)) {
        this.viewY = Math.fround(Math.fround($.Landscape.GetHeight() / 2 | 0) - Math.fround(Math.fround(Math.fround(this.ViewHgt) / this.Zoom) / Math.fround(2)));
      } else {
        this.viewY = $.Clamp$f32$f32$f32(y, 0, Math.fround(Math.fround($.Landscape.GetHeight()) - Math.fround(Math.fround(this.ViewHgt) / this.Zoom)));
      }
    }
    this.UpdateBordersY();
  }

  SetViewOffset(x, y) {
    this.viewOffsX = x;
    this.viewOffsY = y;
  }

  UpdateBordersX() {
    this.BorderLeft = $max(Math.fround(-this.GetViewX() * this.Zoom), 0);
    this.BorderRight = $max(Math.fround(Math.fround(Math.fround(this.ViewWdt) - Math.fround(Math.fround($.Landscape.GetWidth()) * this.Zoom)) + Math.fround(this.GetViewX() * this.Zoom)), 0);
  }

  UpdateBordersY() {
    this.BorderTop = $max(Math.fround(-this.GetViewY() * this.Zoom), 0);
    this.BorderBottom = $max(Math.fround(Math.fround(Math.fround(this.ViewHgt) - Math.fround(Math.fround($.Landscape.GetHeight()) * this.Zoom)) + Math.fround(this.GetViewY() * this.Zoom)), 0);
  }

  DrawPlayerStartup(cgo) {
    let player = null;
    if (!((player = $.Players.Get(this.Player)) != null)) {
      return;
    }
    if (!player.LocalControl || !player.ShowStartup) {
      return;
    }
    let name_height_offset = 0;
    if (player != null && player.ControlSet != null) {
      let controlset_facet = player.ControlSet.GetPicture();
      if (controlset_facet.Wdt !== 0) {
        controlset_facet.Draw$pC4Surface$f32$f32$i32$i32(cgo.Surface, Math.fround(cgo.X + Math.fround(Math.fround(cgo.Wdt - controlset_facet.Wdt) / Math.fround(2))), Math.fround(Math.fround(cgo.Y + Math.fround(Math.fround(cgo.Hgt * Math.fround(2)) / Math.fround(3))) + Math.fround($.DrawMessageOffset)), 0, 0);
      }
      name_height_offset = ftoi32($.GraphicsResource.fctKeyboard.Hgt);
    }
    $.pDraw.TextOut(player.GetName(), $.GraphicsResource.FontRegular, Math.fround(1), cgo.Surface, Math.fround(cgo.X + Math.fround(cgo.Wdt / Math.fround(2))), Math.fround(Math.fround(Math.fround(cgo.Y + Math.fround(Math.fround(cgo.Hgt * Math.fround(2)) / Math.fround(3))) + Math.fround(name_height_offset)) + Math.fround($.DrawMessageOffset)), (player.ColorDw | 0xff000000) >>> 0, 1);
  }

  Draw(cgo0, draw_game, draw_overlay) {
    let cgo = new $.C4TargetFacet().init();
    cgo.Set$C4TargetFacet(cgo0);
    let GameZoom = new $.ZoomData();
    GameZoom.X = cgo.X;
    GameZoom.Y = cgo.Y;
    GameZoom.Zoom = cgo.Zoom;
    if (this.BorderLeft > 0) {
      $.pDraw.BlitSurfaceTile($.GraphicsResource.fctBackground.Surface, cgo.Surface, Math.fround(this.DrawX), Math.fround(this.DrawY), this.BorderLeft, Math.fround(this.ViewHgt), Math.fround(-this.DrawX | 0), Math.fround(-this.DrawY | 0), null);
    }
    if (this.BorderTop > 0) {
      $.pDraw.BlitSurfaceTile($.GraphicsResource.fctBackground.Surface, cgo.Surface, Math.fround(Math.fround(this.DrawX) + this.BorderLeft), Math.fround(this.DrawY), Math.fround(Math.fround(Math.fround(this.ViewWdt) - this.BorderLeft) - this.BorderRight), this.BorderTop, Math.fround(Math.fround(-this.DrawX | 0) - this.BorderLeft), Math.fround(-this.DrawY | 0), null);
    }
    if (this.BorderRight > 0) {
      $.pDraw.BlitSurfaceTile($.GraphicsResource.fctBackground.Surface, cgo.Surface, Math.fround(Math.fround(this.DrawX + this.ViewWdt | 0) - this.BorderRight), Math.fround(this.DrawY), this.BorderRight, Math.fround(this.ViewHgt), Math.fround(Math.fround((-this.DrawX | 0) - this.ViewWdt | 0) + this.BorderRight), Math.fround(-this.DrawY | 0), null);
    }
    if (this.BorderBottom > 0) {
      $.pDraw.BlitSurfaceTile($.GraphicsResource.fctBackground.Surface, cgo.Surface, Math.fround(Math.fround(this.DrawX) + this.BorderLeft), Math.fround(Math.fround(this.DrawY + this.ViewHgt | 0) - this.BorderBottom), Math.fround(Math.fround(Math.fround(this.ViewWdt) - this.BorderLeft) - this.BorderRight), this.BorderBottom, Math.fround(Math.fround(-this.DrawX | 0) - this.BorderLeft), Math.fround(Math.fround((-this.DrawY | 0) - this.ViewHgt | 0) + this.BorderBottom), null);
    }
    cgo.X = Math.fround(cgo.X + this.BorderLeft);
    cgo.Y = Math.fround(cgo.Y + this.BorderTop);
    cgo.Wdt = Math.fround(cgo.Wdt - Math.fround(Math.fround(this.BorderLeft + this.BorderRight) / cgo.Zoom));
    cgo.Hgt = Math.fround(cgo.Hgt - Math.fround(Math.fround(this.BorderTop + this.BorderBottom) / cgo.Zoom));
    cgo.TargetX = Math.fround(cgo.TargetX + Math.fround(this.BorderLeft / this.Zoom));
    cgo.TargetY = Math.fround(cgo.TargetY + Math.fround(this.BorderTop / this.Zoom));
    GameZoom.X = cgo.X;
    GameZoom.Y = cgo.Y;
    $.pDraw.SetZoom$ZoomData(GameZoom);
    let clipRect = ((($o) => ($o.left = Math.fround(Math.fround(this.DrawX) + this.BorderLeft), $o.right = Math.fround(Math.fround(this.DrawX + this.ViewWdt | 0) - this.BorderRight), $o.top = Math.fround(Math.fround(this.DrawY) + this.BorderTop), $o.bottom = Math.fround(Math.fround(this.DrawY + this.ViewHgt | 0) - this.BorderBottom), $o))(new $.FLOAT_RECT()));
    const clipRectInt = new $.C4Rect().init$FLOAT_RECT(clipRect);
    $.pDraw.SetPrimaryClipper(clipRectInt.x, clipRectInt.y, (clipRectInt.x + clipRectInt.Wdt | 0) - 1 | 0, (clipRectInt.y + clipRectInt.Hgt | 0) - 1 | 0);
    this.last_game_draw_cgo.$assign(cgo);
    if (draw_game) {
      let player = $.Players.Get(this.Player);
      let FoW = null;
      if (player != null && player.fFogOfWar) {
        FoW = this.pFoW;
      }
      if (FoW != null) {
        let vpRect = ((($o) => ($o.left = cgo.TargetX, $o.right = Math.fround(cgo.TargetX + cgo.Wdt), $o.top = cgo.TargetY, $o.bottom = Math.fround(cgo.TargetY + cgo.Hgt), $o))(new $.FLOAT_RECT()));
        let lightRect = new $.C4Rect().init$FLOAT_RECT(vpRect);
        if (lightRect.Wdt === 0 || lightRect.Hgt === 0) {
          FoW = null;
        } else {
          FoW.Update(lightRect.$clone(), vpRect);
          if (!FoW.Render()) {
            FoW = null;
          }
        }
      }
      $.pDraw.SetFoW(FoW);
      $.Landscape.GetSky().Draw(cgo);
      $.Objects.Draw(cgo, this.Player, -0x80000000, 0);
      $.Landscape.Draw(cgo, FoW);
      $.PXS.Draw(cgo);
      let particlePlane = 900;
      $.Objects.Draw(cgo, this.Player, 1, 900);
      $.Particles.DrawGlobalParticles(cgo.$clone());
      $.Objects.Draw(cgo, this.Player, 901, 0x7fffffff);
      $.pDraw.SetFoW(null);
    } else {
      $.pDraw.DrawBoxDw(cgo.Surface, ftoi32(cgo.X), ftoi32(cgo.Y), ftoi32(Math.fround(cgo.X + cgo.Wdt)), ftoi32(Math.fround(cgo.Y + cgo.Hgt)), 0xff000000);
    }
    if ($.GraphicsSystem.ShowPathfinder) {
      $.Game.PathFinder.Draw(cgo);
    }
    if ($.Game.C4S.Head.Film === 0 || !$.Game.C4S.Head.Replay) {
      $.Game.DrawCrewOverheadText(cgo, this.Player);
    }
    if ($.GraphicsSystem.ShowLights && this.pFoW != null) {
      this.pFoW.Render(cgo);
    }
    if (draw_overlay) {
      let gui_zoom = this.GetGUIZoom();
      $.pDraw.SetZoom$f32$f32$f32(Math.fround(this.DrawX), Math.fround(this.DrawY), gui_zoom);
      $.pDraw.SetPrimaryClipper(this.DrawX, this.DrawY, this.DrawX + (this.ViewWdt - 1 | 0) | 0, this.DrawY + (this.ViewHgt - 1 | 0) | 0);
      let gui_cgo = new $.C4TargetFacet().init();
      gui_cgo.Set$C4TargetFacet(cgo0);
      gui_cgo.X = Math.fround(this.DrawX);
      gui_cgo.Y = Math.fround(this.DrawY);
      gui_cgo.Zoom = gui_zoom;
      gui_cgo.Wdt = Math.fround(ftoi32(Math.fround(Math.fround(this.ViewWdt) / gui_zoom)));
      gui_cgo.Hgt = Math.fround(ftoi32(Math.fround(Math.fround(this.ViewHgt) / gui_zoom)));
      gui_cgo.TargetX = this.GetViewX();
      gui_cgo.TargetY = this.GetViewY();
      this.last_gui_draw_cgo.$assign(gui_cgo);
      $.Objects.ForeObjects.DrawIfCategory(gui_cgo, this.Player, 32768, false);
      if ($.Application.isEditor !== 0) {
        $.Console.EditCursor.Draw(cgo);
      }
      $.pDraw.SetZoom$f32$f32$f32(Math.fround(0), Math.fround(0), Math.fround(1));
      $.Messages.Draw(gui_cgo, cgo, this.Player);
      $.pDraw.SetZoom$f32$f32$f32(Math.fround(0), Math.fround(0), Math.fround(1));
      $.Game.ScriptGuiRoot.DrawAll(gui_cgo, this.Player);
      this.DrawOverlay(gui_cgo, GameZoom);
      if ($.GraphicsSystem.ShowNetstatus) {
        $.Network.DrawStatus(gui_cgo);
      }
    }
    $.pDraw.SetZoom$f32$f32$f32(Math.fround(0), Math.fround(0), Math.fround(1));
    $.pDraw.NoPrimaryClipper();
  }

  DrawOverlay(cgo, GameZoom) {
    if ($.Game.C4S.Head.Film === 0 || !$.Game.C4S.Head.Replay) {
      this.DrawPlayerInfo(cgo);
      this.DrawMenu(cgo);
    }
    if ($.Game.C4S.Head.Film === 0 || !$.Game.C4S.Head.Replay) {
      if ($.MouseControl.IsViewport(this)) {
        $.MouseControl.Draw(cgo, GameZoom);
        if (this.pWindow != null) {
          $.pGUI.RenderMouse(cgo);
        }
      }
    }
  }

  DrawMenu(cgo0) {
    let player = $.Players.Get(this.Player);
    let cgo = new $.C4TargetFacet().init();
    cgo.Set$C4TargetFacet(cgo0);
    cgo.X = Math.fround(0);
    cgo.Y = Math.fround(0);
    cgo.Wdt = Math.fround(cgo0.Wdt * cgo0.Zoom);
    cgo.Hgt = Math.fround(cgo0.Hgt * cgo0.Zoom);
    cgo.TargetX = cgo0.X;
    cgo.TargetY = cgo0.Y;
    cgo.Zoom = Math.fround(1);
    $.pDraw.SetZoom$f32$f32$f32(cgo.X, cgo.Y, cgo.Zoom);
    if (player != null && player.Eliminated !== 0) {
      $.pDraw.TextOut($.FormatString($.LoadResStr(player.Surrendered !== 0 ? S("IDS_PLR_SURRENDERED") : S("IDS_PLR_ELIMINATED")), player.GetName()).getData(), $.GraphicsResource.FontRegular, Math.fround(1), cgo.Surface, Math.fround(cgo.TargetX + Math.fround(cgo.Wdt / Math.fround(2))), Math.fround(cgo.TargetY + Math.fround(Math.fround(Math.fround(2) * cgo.Hgt) / Math.fround(3))), 0xfaff0000, 1);
      return;
    }
    if (player != null && player.Cursor.op_C4Object_() != null && player.Cursor.op_arrow().Menu != null) {
      if (this.ResetMenuPositions) {
        player.Cursor.op_arrow().Menu.ResetLocation();
      }
      let mouse_dragging = false;
      if ($.MouseControl.IsDragging() && $.MouseControl.IsViewport(this)) {
        mouse_dragging = true;
        $.pDraw.ActivateBlitModulation(0x4fffffff);
      }
      player.Cursor.op_arrow().Menu.Draw$rC4TargetFacet(cgo);
      if (mouse_dragging) {
        $.pDraw.DeactivateBlitModulation();
      }
    }
    if (player != null && player.Menu.IsActive$v()) {
      if (this.ResetMenuPositions) {
        player.Menu.ResetLocation();
      }
      player.Menu.Draw$rC4TargetFacet(cgo);
    }
    if ($.FullScreen.MainMenu != null && $.FullScreen.MainMenu.IsActive$v()) {
      if (this.ResetMenuPositions) {
        $.FullScreen.MainMenu.ResetLocation();
      }
      $.FullScreen.MainMenu.Draw$rC4TargetFacet(cgo);
    }
    this.ResetMenuPositions = false;
    $.pDraw.SetZoom$f32$f32$f32(cgo0.X, cgo0.Y, cgo0.Zoom);
  }

  DrawPlayerInfo(cgo) {
    let ccgo = new $.C4Facet().init$v();
    if (!($.ValidPlr(this.Player) !== 0)) {
      return;
    }
    this.DrawPlayerStartup(cgo);
  }

  InitZoom() {
    let player = $.Players.Get(this.Player);
    if (player != null) {
      player.ZoomToViewport(this, true);
    } else {
      this.ZoomTarget = $max(Math.fround(Math.fround(this.ViewWdt) / Math.fround($.Landscape.GetWidth())), 1);
      this.Zoom = this.ZoomTarget;
    }
  }

  BlitOutput() {
    if (this.pWindow != null) {
      let src = new $.C4Rect();
      let dst = new $.C4Rect();
      src.x = this.DrawX;
      src.y = this.DrawY;
      src.Wdt = this.ViewWdt;
      src.Hgt = this.ViewHgt;
      dst.x = this.OutX;
      dst.y = this.OutY;
      dst.Wdt = this.ViewWdt;
      dst.Hgt = this.ViewHgt;
      this.pWindow.pSurface.PageFlip(src, dst);
    }
  }

  AdjustZoomAndPosition() {
    if (this.ZoomTarget < Math.fround(9.99999997e-07)) {
      this.CalculateZoom();
    }
    if (this.Zoom !== this.ZoomTarget) {
      let DeltaZoom = Math.fround(this.Zoom / this.ZoomTarget);
      if (DeltaZoom < Math.fround(1)) {
        DeltaZoom = Math.fround(Math.fround(1) / DeltaZoom);
      }
      if (!('C4Viewport$AdjustZoomAndPosition$Z0' in $)) $.C4Viewport$AdjustZoomAndPosition$Z0 = Math.fround(c$pow($.C4GFX_ZoomStep$C4PlayerControl, Math.fround(1 / 8)));
      let ZoomAdjustFactor = Math.fround($.C4Viewport$AdjustZoomAndPosition$Z0 * Math.fround(c$pow(DeltaZoom, Math.fround(1 / 8))));
      if (this.Zoom === Math.fround(0)) {
        this.Zoom = this.ZoomTarget;
      } else {
        let view_mid_x = Math.fround(this.viewX + Math.fround(Math.fround(Math.fround(this.ViewWdt) / this.Zoom) / 2));
        let view_mid_y = Math.fround(this.viewY + Math.fround(Math.fround(Math.fround(this.ViewHgt) / this.Zoom) / 2));
        if (this.Zoom < this.ZoomTarget) {
          this.Zoom = $min(Math.fround(this.Zoom * ZoomAdjustFactor), this.ZoomTarget);
        }
        if (this.Zoom > this.ZoomTarget) {
          this.Zoom = $max(Math.fround(this.Zoom / ZoomAdjustFactor), this.ZoomTarget);
        }
        this.viewX = Math.fround(view_mid_x - Math.fround(Math.fround(Math.fround(this.ViewWdt) / this.Zoom) / 2));
        this.viewY = Math.fround(view_mid_y - Math.fround(Math.fround(Math.fround(this.ViewHgt) / this.Zoom) / 2));
      }
    }
    this.AdjustPosition(false);
  }

  GetZoom$v$c() {
    return this.Zoom;
  }

  AdjustPosition(immediate = false) {
    if (this.ViewWdt === 0 || this.ViewHgt === 0) {
      return;
    }
    0;
    0;
    let ViewportScrollBorder = this.fIsNoOwnerViewport ? Math.fround(0) : Math.fround(40);
    let player = $.Players.Get(this.Player);
    if (this.PlayerLock && $.ValidPlr(this.Player) !== 0) {
      let scrollRange = Math.fround(0);
      let extraBoundsX = Math.fround(0);
      let extraBoundsY = Math.fround(0);
      let targetCenterViewX = $.fixtof(player.ViewX);
      let targetCenterViewY = $.fixtof(player.ViewY);
      if (player.ViewMode === 2) {
        extraBoundsX = extraBoundsY = ViewportScrollBorder;
      } else {
        scrollRange = $min(Math.fround(Math.fround(this.ViewWdt) / Math.fround(Math.fround(10) * this.Zoom)), Math.fround(Math.fround(this.ViewHgt) / Math.fround(Math.fround(10) * this.Zoom)));
        if (targetCenterViewX < ViewportScrollBorder) {
          extraBoundsX = $min(Math.fround(ViewportScrollBorder - targetCenterViewX), ViewportScrollBorder);
        } else if (targetCenterViewX >= Math.fround(Math.fround($.Landscape.GetWidth()) - ViewportScrollBorder)) {
          extraBoundsX = Math.fround($min(Math.fround(targetCenterViewX - Math.fround($.Landscape.GetWidth())), Math.fround(0)) + ViewportScrollBorder);
        }
        if (targetCenterViewY < ViewportScrollBorder) {
          extraBoundsY = $min(Math.fround(ViewportScrollBorder - targetCenterViewY), ViewportScrollBorder);
        } else if (targetCenterViewY >= Math.fround(Math.fround($.Landscape.GetHeight()) - ViewportScrollBorder)) {
          extraBoundsY = Math.fround($min(Math.fround(targetCenterViewY - Math.fround($.Landscape.GetHeight())), Math.fround(0)) + ViewportScrollBorder);
        }
      }
      extraBoundsX = $max(extraBoundsX, Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(this.ViewWdt) / this.Zoom) - Math.fround($.Landscape.GetWidth())) / Math.fround(2)) + Math.fround(1)));
      extraBoundsY = $max(extraBoundsY, Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(this.ViewHgt) / this.Zoom) - Math.fround($.Landscape.GetHeight())) / Math.fround(2)) + Math.fround(1)));
      if (player.MouseControl !== 0 && $.MouseControl.InitCentered && $.Config.Controls.MouseAutoScroll !== 0) {
        let strength = Math.fround(Math.fround($.Config.Controls.MouseAutoScroll) / 100);
        targetCenterViewX = Math.fround(targetCenterViewX + Math.fround(Math.fround(strength * Math.fround(Math.fround($.MouseControl.VpX) - Math.fround(Math.fround(this.ViewWdt) / 2))) / this.Zoom));
        targetCenterViewY = Math.fround(targetCenterViewY + Math.fround(Math.fround(strength * Math.fround(Math.fround($.MouseControl.VpY) - Math.fround(Math.fround(this.ViewHgt) / 2))) / this.Zoom));
      }
      if (!immediate) {
        targetCenterViewX = $.Clamp$f32$f32$f32(targetCenterViewX, Math.fround(targetCenterViewX - scrollRange), Math.fround(targetCenterViewX + scrollRange));
        targetCenterViewY = $.Clamp$f32$f32$f32(targetCenterViewY, Math.fround(targetCenterViewY - scrollRange), Math.fround(targetCenterViewY + scrollRange));
      }
      targetCenterViewX = $.Clamp$f32$f32$f32(targetCenterViewX, Math.fround(Math.fround(Math.fround(Math.fround(this.ViewWdt) / this.Zoom) / Math.fround(2)) - extraBoundsX), Math.fround(Math.fround(Math.fround($.Landscape.GetWidth()) - Math.fround(Math.fround(Math.fround(this.ViewWdt) / this.Zoom) / Math.fround(2))) + extraBoundsX));
      targetCenterViewY = $.Clamp$f32$f32$f32(targetCenterViewY, Math.fround(Math.fround(Math.fround(Math.fround(this.ViewHgt) / this.Zoom) / Math.fround(2)) - extraBoundsY), Math.fround(Math.fround(Math.fround($.Landscape.GetHeight()) - Math.fround(Math.fround(Math.fround(this.ViewHgt) / this.Zoom) / Math.fround(2))) + extraBoundsY));
      this.targetViewX = Math.fround(Math.fround(targetCenterViewX - Math.fround(Math.fround(Math.fround(this.ViewWdt) / this.Zoom) / Math.fround(2))) + Math.fround(this.viewOffsX));
      this.targetViewY = Math.fround(Math.fround(targetCenterViewY - Math.fround(Math.fround(Math.fround(this.ViewHgt) / this.Zoom) / Math.fround(2))) + Math.fround(this.viewOffsY));
      if (immediate) {
        this.SetViewX(this.targetViewX);
        this.SetViewY(this.targetViewY);
      } else {
        let smooth = $.Clamp$i32$i32$i32($.Config.General.ScrollSmooth, 1, 50);
        this.ScrollView(Math.fround(Math.fround(this.targetViewX - this.viewX) / Math.fround(smooth)), Math.fround(Math.fround(this.targetViewY - this.viewY) / Math.fround(smooth)));
      }
    }
    this.UpdateBordersX();
    this.UpdateBordersY();
    if (this.fIsNoOwnerViewport) {
      this.viewOffsX = 0;
      this.viewOffsY = 0;
    }
  }

  GetWindow() {
    return this.pWindow;
  }

  UpdateOutputSize(new_width = 0, new_height = 0) {
    if (this.pWindow == null) {
      return false;
    }
    let rect = new $.C4Rect();
    if (new_width !== 0) {
      rect.x = rect.y = 0;
      rect.Wdt = new_width;
      rect.Hgt = new_height;
    } else {
      if (!this.pWindow.GetSize(rect)) {
        return false;
      }
    }
    this.OutX = rect.x;
    this.OutY = rect.y;
    this.ViewWdt = rect.Wdt;
    this.ViewHgt = rect.Hgt;
    this.ScrollView(Math.fround(0), Math.fround(0));
    this.ScrollBarsByViewPosition();
    this.ResetMenuPositions = true;
    if (this.pWindow != null && this.pWindow.pSurface != null) {
      this.pWindow.pSurface.UpdateSize(this.ViewWdt, this.ViewHgt);
    }
    let player = $.Players.Get(this.Player);
    if (player != null) {
      player.ZoomLimitsToViewport(this);
    }
    return true;
  }

  ScrollBarsByViewPosition(..._) { return $missing("C4Viewport::ScrollBarsByViewPosition"); }

  $clone() { return new C4Viewport().$assign(this); }
  $assign(o) {
    this.ViewWdt = o.ViewWdt;
    this.ViewHgt = o.ViewHgt;
    this.BorderLeft = o.BorderLeft;
    this.BorderTop = o.BorderTop;
    this.BorderRight = o.BorderRight;
    this.BorderBottom = o.BorderBottom;
    this.DrawX = o.DrawX;
    this.DrawY = o.DrawY;
    this.last_game_draw_cgo.$assign(o.last_game_draw_cgo);
    this.last_gui_draw_cgo.$assign(o.last_gui_draw_cgo);
    this.fIsNoOwnerViewport = o.fIsNoOwnerViewport;
    this.viewX = o.viewX;
    this.viewY = o.viewY;
    this.targetViewX = o.targetViewX;
    this.targetViewY = o.targetViewY;
    this.viewOffsX = o.viewOffsX;
    this.viewOffsY = o.viewOffsY;
    this.Zoom = o.Zoom;
    this.ZoomTarget = o.ZoomTarget;
    this.ZoomLimitMin = o.ZoomLimitMin;
    this.ZoomLimitMax = o.ZoomLimitMax;
    this.ViewportOpenFrame = o.ViewportOpenFrame;
    this.Player = o.Player;
    this.PlayerLock = o.PlayerLock;
    this.OutX = o.OutX;
    this.OutY = o.OutY;
    this.ResetMenuPositions = o.ResetMenuPositions;
    this.Next = o.Next;
    this.pWindow = o.pWindow;
    this.pFoW = o.pFoW;
    return this;
  }
}

export class C4ViewportList {
  FirstViewport = null;
  ViewportArea = new $.C4Facet().init$v();
  BackgroundAreas = new $.C4RectList();

  init() {
    this.FirstViewport = null;
    this.ViewportArea = new $.C4Facet().init$v();
    this.BackgroundAreas = new $.C4RectList();
    $.C4Facet.prototype.Default.call(this.ViewportArea);
    return this;
  }

  Clear() {
    let next = null;
    while (this.FirstViewport != null) {
      next = this.FirstViewport.Next;
      $delete(this.FirstViewport);
      this.FirstViewport = next;
    }
    this.FirstViewport = null;
  }

  ClearPointers(obj) {
    for (let viewport = this.FirstViewport; viewport != null; viewport = viewport.Next) {
      viewport.ClearPointers(obj);
    }
  }

  Execute(draw_background) {
    if (draw_background) {
      this.DrawFullscreenBackground();
    }
    for (let viewport = this.FirstViewport; viewport != null; viewport = viewport.Next) {
      if (viewport.GetWindow() != null) {
        viewport.GetWindow().RequestUpdate();
      } else {
        viewport.Execute();
      }
    }
  }

  SortViewportsByPlayerControl() {
    let is_sorted = false;
    let player_a = null;
    let player_b = null;
    let viewport = null;
    let next = null;
    let prev = null;
    do {
      is_sorted = true;
      for (prev = null, viewport = this.FirstViewport; viewport != null && (next = viewport.Next) != null; viewport = next) {
        player_a = $.Players.Get(viewport.Player);
        player_b = $.Players.Get(next.Player);
        if (player_a != null && player_b != null && player_a.ControlSet != null && player_b.ControlSet != null && player_a.ControlSet.GetLayoutOrder() > player_b.ControlSet.GetLayoutOrder()) {
          if (prev != null) {
            prev.Next = next;
          } else {
            this.FirstViewport = next;
          }
          viewport.Next = next.Next;
          next.Next = viewport;
          prev = next;
          next = viewport;
          is_sorted = false;
        } else {
          prev = viewport;
        }
      }
    } while (!is_sorted);
  }

  RecalculateViewports() {
    if ($.Application.isEditor !== 0) {
      return;
    }
    this.SortViewportsByPlayerControl();
    let border_top = 0;
    if ($.Config.Graphics.UpperBoard !== 0) {
      border_top = 50;
    }
    this.ViewportArea.Set$pC4Surface$f32$f32$f32$f32($.FullScreen.pSurface, Math.fround(0), Math.fround(border_top), Math.fround($.GetScreenWdt()), Math.fround($.GetScreenHgt() - border_top | 0));
    $.GraphicsSystem.InvalidateBg();
    $.pGUI.SetPreferredDlgRect(new $.C4Rect().init$i32$i32$i32$i32(ftoi32(this.ViewportArea.X), ftoi32(this.ViewportArea.Y), ftoi32(this.ViewportArea.Wdt), ftoi32(this.ViewportArea.Hgt)));
    this.BackgroundAreas.Clear();
    this.BackgroundAreas.AddRect(new $.C4Rect().init$i32$i32$i32$i32(ftoi32(this.ViewportArea.X), ftoi32(this.ViewportArea.Y), ftoi32(this.ViewportArea.Wdt), ftoi32(this.ViewportArea.Hgt)));
    let viewport = null;
    let view_count = 0;
    for (viewport = this.FirstViewport; viewport != null; viewport = viewport.Next) {
      view_count = view_count + 1 | 0;
    }
    if (view_count === 0) {
      return;
    }
    let iViewsH = ftoi32(Math.fround(c$sqrt(Math.fround(view_count))));
    let iViewsX = view_count / iViewsH | 0;
    let iViewsL = view_count % iViewsH;
    let cViewH = 0;
    let cViewX = 0;
    let ciViewsX = 0;
    let cViewWdt = 0;
    let cViewHgt = 0;
    let cOffWdt = 0;
    let cOffHgt = 0;
    let cOffX = 0;
    let cOffY = 0;
    viewport = this.FirstViewport;
    for (cViewH = 0; cViewH < iViewsH; cViewH = cViewH + 1 | 0) {
      ciViewsX = iViewsX;
      if (cViewH < iViewsL) {
        ciViewsX = ciViewsX + 1 | 0;
      }
      for (cViewX = 0; cViewX < ciViewsX; cViewX = cViewX + 1 | 0) {
        cViewWdt = ftoi32(Math.fround(this.ViewportArea.Wdt / Math.fround(ciViewsX)));
        cViewHgt = ftoi32(Math.fround(this.ViewportArea.Hgt / Math.fround(iViewsH)));
        cOffX = ftoi32(this.ViewportArea.X);
        cOffY = ftoi32(this.ViewportArea.Y);
        cOffWdt = cOffHgt = 0;
        if (Math.fround(Math.imul(ciViewsX, cViewWdt)) < this.ViewportArea.Wdt) {
          cOffX = ftoi32(Math.fround(Math.fround(this.ViewportArea.Wdt - Math.fround(Math.imul(ciViewsX, cViewWdt))) / Math.fround(2)));
        }
        if (Math.fround(Math.imul(iViewsH, cViewHgt)) < this.ViewportArea.Hgt) {
          cOffY = ftoi32(Math.fround(Math.fround(Math.fround(this.ViewportArea.Hgt - Math.fround(Math.imul(iViewsH, cViewHgt))) / Math.fround(2)) + this.ViewportArea.Y));
        }
        if ($.Config.Graphics.SplitscreenDividers !== 0) {
          if (cViewX < (ciViewsX - 1 | 0)) {
            cOffWdt = 4;
          }
          if (cViewH < (iViewsH - 1 | 0)) {
            cOffHgt = 4;
          }
        }
        let coViewWdt = cViewWdt - cOffWdt | 0;
        let coViewHgt = cViewHgt - cOffHgt | 0;
        let rcOut = new $.C4Rect().init$i32$i32$i32$i32(cOffX + Math.imul(cViewX, cViewWdt) | 0, cOffY + Math.imul(cViewH, cViewHgt) | 0, coViewWdt, coViewHgt);
        viewport.SetOutputSize(rcOut.x, rcOut.y, rcOut.x, rcOut.y, rcOut.Wdt, rcOut.Hgt);
        viewport = viewport.Next;
        this.BackgroundAreas.ClipByRect(rcOut);
      }
    }
    if ($.Game.ScriptGuiRoot != null) {
      $.Game.ScriptGuiRoot.RequestLayoutUpdate();
    }
  }

  DisableFoW() {
    for (let viewport = this.FirstViewport; viewport != null; viewport = viewport.Next) {
      viewport.DisableFoW();
    }
  }

  EnableFoW() {
    for (let viewport = this.FirstViewport; viewport != null; viewport = viewport.Next) {
      viewport.EnableFoW();
    }
  }

  CreateViewport(player_nr, silent = false) {
    let last_count = this.GetViewportCount();
    let viewport = new C4Viewport().init();
    let is_okay = viewport.Init(player_nr, false);
    if (!is_okay) {
      $delete(viewport);
      return false;
    }
    let last = null;
    for (last = this.FirstViewport; last != null && last.Next != null; last = last.Next) {
    }
    if (last != null) {
      last.Next = viewport;
    } else {
      this.FirstViewport = viewport;
    }
    this.RecalculateViewports();
    viewport.CenterPosition();
    let player = $.Players.Get(player_nr);
    if (player != null) {
      player.ZoomToViewport(viewport, true, false, false);
      player.ZoomLimitsToViewport(viewport);
    }
    if (!silent && this.GetViewportCount() !== last_count) {
      $.StartSoundEffect(S("UI::CloseViewport"));
    }
    return true;
  }

  CloseViewport$i32$b(player_nr, silent) {
    let last_count = this.GetViewportCount();
    let next = null;
    let prev = null;
    for (let viewport = this.FirstViewport; viewport != null; viewport = next) {
      next = viewport.Next;
      if (viewport.Player === player_nr || player_nr === -1 && viewport.fIsNoOwnerViewport) {
        $delete(viewport);
        if (prev != null) {
          prev.Next = next;
        } else {
          this.FirstViewport = next;
        }
      } else {
        prev = viewport;
      }
    }
    if (this.GetViewportCount() !== last_count) {
      this.RecalculateViewports();
      if (!silent) {
        $.StartSoundEffect(S("UI::CloseViewport"));
      }
    }
    return true;
  }

  GetViewportCount() {
    let amount = 0;
    for (let viewport = this.FirstViewport; viewport != null; viewport = viewport.Next) {
      amount = amount + 1 | 0;
    }
    return amount;
  }

  GetViewport(player, prev = null) {
    for (let viewport = prev != null ? prev.Next : this.FirstViewport; viewport != null; viewport = viewport.Next) {
      if (viewport.Player === player || player === -1 && viewport.fIsNoOwnerViewport) {
        return viewport;
      }
    }
    return null;
  }

  GetFirstViewport() {
    return this.FirstViewport;
  }

  CloseViewport$pC4Viewport(viewport) {
    if (viewport == null) {
      return false;
    }
    if (this.FirstViewport === viewport) {
      this.FirstViewport = viewport.Next;
      $delete(viewport);
      $.StartSoundEffect(S("UI::CloseViewport"));
    } else {
      for (let prev = this.FirstViewport; prev != null; prev = prev.Next) {
        if (prev.Next === viewport) {
          prev.Next = viewport.Next;
          $delete(viewport);
          $.StartSoundEffect(S("UI::CloseViewport"));
        }
      }
    }
    if ($.pDraw != null) {
      $.pDraw.EnsureMainContextSelected();
    }
    this.RecalculateViewports();
    return true;
  }

  GetAudibility(x, y, pan, audibility_radius = 0, out_player = null) {
    if (audibility_radius === 0) {
      audibility_radius = 700;
    }
    let audible = 0;
    pan.a[pan.o] = 0;
    for (let viewport = this.FirstViewport; viewport != null; viewport = viewport.Next) {
      let distanceToCenterOfViewport = Math.fround($.Distance(ftoi32(viewport.GetViewCenterX()), ftoi32(viewport.GetViewCenterY()), x, y));
      let audibility = $.Clamp$i32$i32$i32(ftoi32(Math.fround(Math.fround(100) - Math.fround(Math.fround(Math.fround(100) * distanceToCenterOfViewport) / Math.fround(700)))), 0, 100);
      if (audibility > audible) {
        audible = audibility;
        if (out_player != null) {
          out_player.a[out_player.o] = viewport.Player;
        }
      }
      pan.a[pan.o] = ftoi32(Math.fround(Math.fround(pan.a[pan.o]) + Math.fround(Math.fround(Math.fround(x) - viewport.GetViewCenterX()) / Math.fround(5))));
    }
    pan.a[pan.o] = $.Clamp$i32$i32$i32(pan.a[pan.o], -100, 100);
    return audible;
  }

  ViewportNextPlayer() {
    if (($.Game.C4S.Head.Film === 0 || !$.Game.C4S.Head.Replay) && !(this.GetViewport(-1) != null)) {
      return false;
    }
    let viewport = this.GetFirstViewport();
    if (viewport == null) {
      return false;
    }
    viewport.NextPlayer();
    return true;
  }

  FreeScroll(scroll_by) {
    if ((!$.Game.C4S.Head.Replay || $.Game.C4S.Head.Film === 0) && !(this.GetViewport(-1) != null)) {
      return false;
    }
    let viewport = this.GetFirstViewport();
    if (viewport == null) {
      return false;
    }
    if (!('C4ViewportList$FreeScroll$vp_vx' in $)) $.C4ViewportList$FreeScroll$vp_vx = 0;
    if (!('C4ViewportList$FreeScroll$vp_vy' in $)) $.C4ViewportList$FreeScroll$vp_vy = 0;
    if (!('C4ViewportList$FreeScroll$vp_vf' in $)) $.C4ViewportList$FreeScroll$vp_vf = 0;
    let dx = scroll_by.x;
    let dy = scroll_by.y;
    if (($.Game.FrameCounter - $.C4ViewportList$FreeScroll$vp_vf | 0) < 5) {
      dx = dx + $.C4ViewportList$FreeScroll$vp_vx | 0;
      dy = dy + $.C4ViewportList$FreeScroll$vp_vy | 0;
    }
    $.C4ViewportList$FreeScroll$vp_vx = dx;
    $.C4ViewportList$FreeScroll$vp_vy = dy;
    $.C4ViewportList$FreeScroll$vp_vf = $.Game.FrameCounter;
    viewport.ScrollView(Math.fround(dx), Math.fround(dy));
    return true;
  }

  ViewportZoomOut() {
    for (let viewport = this.FirstViewport; viewport != null; viewport = viewport.Next) {
      viewport.ChangeZoom(Math.fround(1 / $.C4GFX_ZoomStep$C4PlayerControl));
    }
    return true;
  }

  ViewportZoomIn() {
    for (let viewport = this.FirstViewport; viewport != null; viewport = viewport.Next) {
      viewport.ChangeZoom($.C4GFX_ZoomStep$C4PlayerControl);
    }
    return true;
  }

  MouseMoveToViewport(button, x, y, key_param) {
    for (let viewport = this.FirstViewport; viewport != null; viewport = viewport.Next) {
      if ($.MouseControl.IsViewport(viewport)) {
        $.MouseControl.Move(button, $.Clamp$i32$i32$i32(x - viewport.OutX | 0, 0, viewport.ViewWdt - 1 | 0), $.Clamp$i32$i32$i32(y - viewport.OutY | 0, 0, viewport.ViewHgt - 1 | 0), key_param);
      }
    }
  }

  DrawFullscreenBackground() {
    for (let i = 0, num = this.BackgroundAreas.GetCount() | 0; i < num; i = i + 1 | 0) {
      const rc = this.BackgroundAreas.Get($u64n(i));
      $.pDraw.BlitSurfaceTile($.GraphicsResource.fctBackground.Surface, $.FullScreen.pSurface, Math.fround(rc.x), Math.fround(rc.y), Math.fround(rc.Wdt), Math.fround(rc.Hgt), Math.fround(-rc.x | 0), Math.fround(-rc.y | 0), null);
    }
  }

  $clone() { return new C4ViewportList().$assign(this); }
  $assign(o) {
    this.FirstViewport = o.FirstViewport;
    this.ViewportArea.$assign(o.ViewportArea);
    this.BackgroundAreas.$assign(o.BackgroundAreas);
    return this;
  }
}


export function $init(): void {
  $.Viewports = new C4ViewportList(); $.Viewports.init();
}

Object.assign($, { C4Viewport, C4ViewportList });
