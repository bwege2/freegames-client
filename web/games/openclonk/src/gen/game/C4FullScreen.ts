// @ts-nocheck
// OpenClonk 36de799: src/game/C4FullScreen.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { C4Window } from '../platform/C4Window.ts';
import { S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $missing } from '../../rt/std.ts';

export class C4FullScreen extends C4Window {
  MainMenu = null;

  init() {
    super.init();
    this.MainMenu = null;
    return this;
  }

  $dtor() {
    if (this.MainMenu != null) {
      $delete(this.MainMenu);
    }
    if (this.pSurface != null) {
      $delete(this.pSurface);
    }
    super.$dtor();
  }

  Execute() {
    if (this.MainMenu != null) {
      $.C4Menu.prototype.Execute$v.call(this.MainMenu);
    }
    this.RequestUpdate();
  }

  ViewportCheck() {
    if (!this.Active) {
      return false;
    }
    let is_film_mode = $.Game.C4S.Head.Replay && $.Game.C4S.Head.Film !== 0;
    let player = null;
    switch ($.Viewports.GetViewportCount()) {
      case 0:
        {
          let player_count = -1;
          if (is_film_mode) {
            if ((player = $.Players.First) != null) {
              player_count = player.Number;
            }
          }
          $.Viewports.CreateViewport(player_count, player_count === -1);
          if (!is_film_mode) {
            $.MouseControl.Init(player_count);
            let key = new $.StdStrBuf();
            key.Format(S("<c ffff00><%s></c>"), $.Game.KeyboardInput.GetKeyCodeNameByKeyName(S("FullscreenMenuOpen"), false).getData());
            $.GraphicsSystem.FlashMessage($.FormatString($.LoadResStr(S("IDS_MSG_PRESSORPUSHANYGAMEPADBUTT")), key.getData()).getData());
          }
        }
        break;
      case 1:
        break;
      default:
        $.Viewports.CloseViewport$i32$b(-1, true);
        break;
    }
    let no_owner_viewport = $.Viewports.GetViewport(-1);
    if (no_owner_viewport == null) {
      this.CloseMenu();
    } else {
      if ($.Game.C4S.Head.Replay && $.Game.C4S.Head.Film !== 0 && (player = $.Players.First) != null) {
        no_owner_viewport.Init(player.Number, true);
      }
    }
    return true;
  }

  ShowAbortDlg() {
    if ($.C4AbortGameDialog.IsShown()) {
      return false;
    }
    if ($.C4GameOverDlg.IsShown()) {
      return false;
    }
    return $.pGUI.ShowRemoveDlg(new $.C4AbortGameDialog().init());
  }

  ActivateMenuMain() {
    if ($.C4GameOverDlg.IsShown()) {
      return false;
    }
    this.CloseMenu();
    this.MainMenu = new $.C4MainMenu().init();
    return this.MainMenu.ActivateMain(-1);
  }

  CloseMenu() {
    if (this.MainMenu != null) {
      if (this.MainMenu.IsActive$v()) {
        this.MainMenu.Close$b(false);
      }
      $delete(this.MainMenu);
      this.MainMenu = null;
    }
  }

  MenuKeyControl(command) {
    if (this.MainMenu != null) {
      return this.MainMenu.KeyControl(command);
    }
    return false;
  }

  Init$pC4AbstractApp(application) {
    let r = new $.C4Rect().init$i32$i32$i32$i32(0, 0, $.Application.GetConfigWidth(), $.Application.GetConfigHeight());
    return this.Init$i32$pC4AbstractApp$pi8$pC4Rect(3 /*W_Fullscreen*/, application, S("OpenClonk"), r);
  }

  Close() {
    if ($.Game.IsRunning) {
      this.ShowAbortDlg();
    } else {
      $.Application.Quit$v();
    }
  }

  Clear() {
    if (this.pSurface != null) {
      $delete(this.pSurface);
    }
    this.pSurface = null;
    $.C4Window.prototype.Clear.call(this);
  }

  CharIn(c) {
    $.pGUI.CharIn(c);
  }

  PerformUpdate() {
    $.GraphicsSystem.Execute();
  }

  $clone() { return new C4FullScreen().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.MainMenu = o.MainMenu;
    return this;
  }
}

export function IsKeyDown(..._) { return $missing("IsKeyDown"); }

export function $init(): void {
}

Object.assign($, { C4FullScreen, IsKeyDown });
