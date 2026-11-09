// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndGame.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
/*
 * Pixel Dungeon
 * Copyright (C) 2012-2015 Oleg Dolya
 *
 * Shattered Pixel Dungeon
 * Copyright (C) 2014-2026 Evan Debenham
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 */
import { $J, IOException } from '../../../../../jre/index.ts';
import { Window } from '../ui/Window.ts';

let Dungeon, GamesInProgress, SPDSettings, Messages, GameScene, HeroSelectScene, InterlevelScene, InterlevelScene$Mode, RankingsScene, TitleScene, Icons, RedButton, WndChallenges, WndSettings, Game;

export class WndGame extends Window {
  static readonly WIDTH: number = 120;
  static readonly BTN_HEIGHT: number = 20;
  static readonly GAP: number = 2;
  pos: number = 0;
  _WndGame(): this {
    this._Window$();
    let curBtn: RedButton;
    this.addButton(curBtn = new (WndGame$1())().$o(this)._RedButton$String(Messages.get$Object$String$ObjectArr(this, 'settings', [])));
    curBtn.icon$Image(Icons.get$Icons(Icons.PREFS));
    if (Dungeon.challenges > 0) {
      this.addButton(curBtn = new (WndGame$2())().$o(this)._RedButton$String(Messages.get$Object$String$ObjectArr(this, 'challenges', [])));
      curBtn.icon$Image(Icons.get$Icons(Icons.CHALLENGE_COLOR));
    }
    if (Dungeon.hero == null || !Dungeon.hero.isAlive()) {
      this.addButton(curBtn = new (WndGame$3())().$o(this)._RedButton$String(Messages.get$Object$String$ObjectArr(this, 'start', [])));
      curBtn.icon$Image(Icons.get$Icons(Icons.ENTER));
      curBtn.textColor(Window.TITLE_COLOR);
      this.addButton(curBtn = new (WndGame$4())().$o(this)._RedButton$String(Messages.get$Object$String$ObjectArr(this, 'rankings', [])));
      curBtn.icon$Image(Icons.get$Icons(Icons.RANKINGS));
    }
    this.addButton(curBtn = new (WndGame$5())().$o(this)._RedButton$String(Messages.get$Object$String$ObjectArr(this, 'menu', [])));
    curBtn.icon$Image(Icons.get$Icons(Icons.DISPLAY));
    if (SPDSettings.intro$()) {
      curBtn.enable(false);
    }
    this.resize(WndGame.WIDTH, this.pos);
    return this;
  }
  addButton(btn: RedButton): void {
    this.add$Gizmo(btn);
    btn.setRect(0, Math.fround(this.pos > 0 ? (this.pos = (this.pos + WndGame.GAP) | 0) : 0), Math.fround(WndGame.WIDTH), Math.fround(WndGame.BTN_HEIGHT));
    this.pos = (this.pos + WndGame.BTN_HEIGHT) | 0;
  }
  addButtons(btn1: RedButton, btn2: RedButton): void {
    this.add$Gizmo(btn1);
    btn1.setRect(0, Math.fround(this.pos > 0 ? (this.pos = (this.pos + WndGame.GAP) | 0) : 0), Math.fround($J.idiv(((WndGame.WIDTH - WndGame.GAP) | 0), 2)), Math.fround(WndGame.BTN_HEIGHT));
    this.add$Gizmo(btn2);
    btn2.setRect(Math.fround(btn1.right() + WndGame.GAP), btn1.top(), Math.fround(Math.fround(WndGame.WIDTH - btn1.right()) - WndGame.GAP), Math.fround(WndGame.BTN_HEIGHT));
    this.pos = (this.pos + WndGame.BTN_HEIGHT) | 0;
  }
}

let $WndGame$1: any = null;
/** An anonymous class (WndGame.java:55). */
function WndGame$1(): any {
  return $WndGame$1 ??= $J.local(class extends RedButton {
    onClick(): void {
      this.$outer.hide();
      GameScene.show(new WndSettings()._WndSettings());
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndGame$1', []);
}

let $WndGame$2: any = null;
/** An anonymous class (WndGame.java:66). */
function WndGame$2(): any {
  return $WndGame$2 ??= $J.local(class extends RedButton {
    onClick(): void {
      this.$outer.hide();
      GameScene.show(new WndChallenges()._WndChallenges(Dungeon.challenges, false));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndGame$2', []);
}

let $WndGame$3: any = null;
/** An anonymous class (WndGame.java:79). */
function WndGame$3(): any {
  return $WndGame$3 ??= $J.local(class extends RedButton {
    onClick(): void {
      GamesInProgress.selectedClass = Dungeon.hero.heroClass;
      GamesInProgress.curSlot = GamesInProgress.firstEmpty();
      Game.switchScene$Class($J.cls(HeroSelectScene));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndGame$3', []);
}

let $WndGame$4: any = null;
/** An anonymous class (WndGame.java:90). */
function WndGame$4(): any {
  return $WndGame$4 ??= $J.local(class extends RedButton {
    onClick(): void {
      InterlevelScene.mode = InterlevelScene$Mode.DESCEND;
      Game.switchScene$Class($J.cls(RankingsScene));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndGame$4', []);
}

let $WndGame$5: any = null;
/** An anonymous class (WndGame.java:101). */
function WndGame$5(): any {
  return $WndGame$5 ??= $J.local(class extends RedButton {
    onClick(): void {
      try {
        Dungeon.saveAll();
      } catch ($e0) {
        if ($J.isa($e0, IOException)) {
          let e = $J.exc($e0);
          Game.reportException(e);
        } else {
          throw $e0;
        }
      }
      Game.switchScene$Class($J.cls(TitleScene));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndGame$5', []);
}

$J.define(WndGame, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndGame', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { '': '_WndGame' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  GamesInProgress = $J.load('com.shatteredpixel.shatteredpixeldungeon.GamesInProgress');
  SPDSettings = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDSettings');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  HeroSelectScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.HeroSelectScene');
  InterlevelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene');
  InterlevelScene$Mode = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene$Mode');
  RankingsScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.RankingsScene');
  TitleScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.TitleScene');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  RedButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RedButton');
  WndChallenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndChallenges');
  WndSettings = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings');
  Game = $J.load('com.watabou.noosa.Game');
});
