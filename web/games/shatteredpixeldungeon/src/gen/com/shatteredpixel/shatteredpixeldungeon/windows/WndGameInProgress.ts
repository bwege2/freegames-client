// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndGameInProgress.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JString, Locale } from '../../../../../jre/index.ts';
import { Window } from '../ui/Window.ts';

let Dungeon, GamesInProgress, ShatteredPixelDungeon, Hero, HeroSubClass, Messages, InterlevelScene, InterlevelScene$Mode, PixelScene, StartScene, HeroSprite, ActionIndicator, Icons, RedButton, DungeonSeed, IconTitle, WndChallenges, WndOptions, Game;

export class WndGameInProgress extends Window {
  static readonly WIDTH: number = 120;
  GAP: number = 0;
  pos: number = 0;
  _WndGameInProgress(slot: number): this {
    this._Window$();
    this.GAP = 6;
    let info = GamesInProgress.check(slot);
    let className = null;
    if (info.subClass !== HeroSubClass.NONE) {
      className = info.subClass.title();
    } else {
      className = info.heroClass.title();
    }
    let title = new IconTitle()._IconTitle$();
    title.icon(HeroSprite.avatar$HeroClass$int(info.heroClass, info.armorTier));
    title.label$String((Messages.get$Object$String$ObjectArr(this, 'title', [info.level_, className])).toUpperCase());
    title.color(Window.TITLE_COLOR);
    title.setRect(0, 0, Math.fround(WndGameInProgress.WIDTH), 0);
    this.add$Gizmo(title);
    if (info.challenges > 0) {
      this.GAP = (this.GAP - 2) | 0;
    }
    this.pos = Math.fround(title.bottom() + this.GAP);
    if (info.challenges > 0) {
      let btnChallenges = new (WndGameInProgress$1())().$o(this).$c(info)._RedButton$String(Messages.get$Object$String$ObjectArr(this, 'challenges', []));
      btnChallenges.icon$Image(Icons.get$Icons(Icons.CHALLENGE_COLOR));
      let btnW = Math.fround(btnChallenges.reqWidth() + 2);
      btnChallenges.setRect(Math.fround((Math.fround(WndGameInProgress.WIDTH - btnW)) / 2), this.pos, btnW, 18);
      this.add$Gizmo(btnChallenges);
      this.pos = Math.fround(btnChallenges.bottom() + this.GAP);
    }
    this.pos = Math.fround(this.pos + this.GAP);
    let strBonus = info.strBonus;
    if (strBonus > 0) {
      this.statSlot$String$String$WndGameInProgress(Messages.get$Object$String$ObjectArr(this, 'str', []), info.str + ' + ' + strBonus);
    } else if (strBonus < 0) {
      this.statSlot$String$String$WndGameInProgress(Messages.get$Object$String$ObjectArr(this, 'str', []), info.str + ' - ' + -strBonus);
    } else {
      this.statSlot$String$int$WndGameInProgress(Messages.get$Object$String$ObjectArr(this, 'str', []), info.str);
    }
    if (info.shld > 0) {
      this.statSlot$String$String$WndGameInProgress(Messages.get$Object$String$ObjectArr(this, 'health', []), info.hp + '+' + info.shld + '/' + info.ht);
    } else {
      this.statSlot$String$String$WndGameInProgress(Messages.get$Object$String$ObjectArr(this, 'health', []), (info.hp) + '/' + info.ht);
    }
    this.statSlot$String$String$WndGameInProgress(Messages.get$Object$String$ObjectArr(this, 'exp', []), info.exp + '/' + Hero.maxExp(info.level_));
    this.pos = Math.fround(this.pos + this.GAP);
    this.statSlot$String$int$WndGameInProgress(Messages.get$Object$String$ObjectArr(this, 'gold', []), info.goldCollected);
    this.statSlot$String$int$WndGameInProgress(Messages.get$Object$String$ObjectArr(this, 'depth', []), info.maxDepth);
    if (info.daily) {
      if (info.dailyReplay) {
        this.statSlot$String$String$WndGameInProgress(Messages.get$Object$String$ObjectArr(this, 'replay_for', []), '_' + info.customSeed + '_');
      } else {
        this.statSlot$String$String$WndGameInProgress(Messages.get$Object$String$ObjectArr(this, 'daily_for', []), '_' + info.customSeed + '_');
      }
    } else if (!(info.customSeed.length === 0)) {
      this.statSlot$String$String$WndGameInProgress(Messages.get$Object$String$ObjectArr(this, 'custom_seed', []), '_' + info.customSeed + '_');
    } else {
      this.statSlot$String$String$WndGameInProgress(Messages.get$Object$String$ObjectArr(this, 'dungeon_seed', []), DungeonSeed.convertToCode(info.seed_));
    }
    this.pos = Math.fround(this.pos + this.GAP);
    let cont = new (WndGameInProgress$2())().$o(this).$c(slot)._RedButton$String(Messages.get$Object$String$ObjectArr(this, 'continue', []));
    let erase = new (WndGameInProgress$3())().$o(this).$c(slot)._RedButton$String(Messages.get$Object$String$ObjectArr(this, 'erase', []));
    cont.icon$Image(Icons.get$Icons(Icons.ENTER));
    cont.setRect(0, this.pos, Math.fround(($J.idiv(WndGameInProgress.WIDTH, 2) - 1) | 0), 20);
    this.add$Gizmo(cont);
    erase.icon$Image(Icons.get$Icons(Icons.CLOSE));
    erase.setRect(Math.fround(($J.idiv(WndGameInProgress.WIDTH, 2) + 1) | 0), this.pos, Math.fround(($J.idiv(WndGameInProgress.WIDTH, 2) - 1) | 0), 20);
    this.add$Gizmo(erase);
    this.resize(WndGameInProgress.WIDTH, ($J.d2i(cont.bottom()) + 1) | 0);
    return this;
  }
  statSlot$String$String$WndGameInProgress(label: string, value: string): void {
    let size = 8;
    let txt: RenderedTextBlock;
    do {
      txt = PixelScene.renderTextBlock$String$int(label, size);
      size--;
    } while (txt.width() >= Math.fround(WndGameInProgress.WIDTH * Math.fround(0.55)));
    txt.setPos(0, Math.fround(this.pos + Math.fround((Math.fround(6 - txt.height())) / 2)));
    PixelScene.align$Component(txt);
    this.add$Gizmo(txt);
    size = 8;
    do {
      txt = PixelScene.renderTextBlock$String$int(value, size);
      size--;
    } while (txt.width() >= Math.fround(WndGameInProgress.WIDTH * Math.fround(0.45)));
    txt.setPos(Math.fround(WndGameInProgress.WIDTH * Math.fround(0.55)), Math.fround(this.pos + Math.fround((Math.fround(6 - txt.height())) / 2)));
    PixelScene.align$Component(txt);
    this.add$Gizmo(txt);
    this.pos = Math.fround(this.pos + Math.fround(this.GAP + txt.height()));
  }
  statSlot$String$int$WndGameInProgress(label: string, value: number): void {
    this.statSlot$String$String$WndGameInProgress(label, String(value));
  }
}

let $WndGameInProgress$1: any = null;
/** An anonymous class (WndGameInProgress.java:75). */
function WndGameInProgress$1(): any {
  return $WndGameInProgress$1 ??= $J.local(class extends RedButton {
    onClick(): void {
      Game.scene().add$Gizmo(new WndChallenges()._WndChallenges(this.$cv_info.challenges, false));
    }
    $c($info): this {
      this.$cv_info = $info;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndGameInProgress$1', []);
}

let $WndGameInProgress$2: any = null;
/** An anonymous class (WndGameInProgress.java:116). */
function WndGameInProgress$2(): any {
  return $WndGameInProgress$2 ??= $J.local(class extends RedButton {
    onClick(): void {
      super.onClick();
      GamesInProgress.curSlot = this.$cv_slot;
      Dungeon.hero = null;
      Dungeon.daily = Dungeon.dailyReplay = false;
      ActionIndicator.clearAction$();
      InterlevelScene.mode = InterlevelScene$Mode.CONTINUE;
      Game.switchScene$Class($J.cls(InterlevelScene));
    }
    $c($slot): this {
      this.$cv_slot = $slot;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndGameInProgress$2', []);
}

let $WndGameInProgress$3$1: any = null;
/** An anonymous class (WndGameInProgress.java:140). */
function WndGameInProgress$3$1(): any {
  return $WndGameInProgress$3$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      if (index === 0) {
        Dungeon.deleteGame(this.$cv_slot, true);
        ShatteredPixelDungeon.switchNoFade$Class($J.cls(StartScene));
      }
    }
    $c($slot): this {
      this.$cv_slot = $slot;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndGameInProgress$3$1', []);
}

let $WndGameInProgress$3: any = null;
/** An anonymous class (WndGameInProgress.java:131). */
function WndGameInProgress$3(): any {
  return $WndGameInProgress$3 ??= $J.local(class extends RedButton {
    onClick(): void {
      super.onClick();
      Game.scene().add$Gizmo(new (WndGameInProgress$3$1())().$o(this).$c(this.$cv_slot)._WndOptions$Image$String$String$StringArr(Icons.get$Icons(Icons.WARNING), Messages.get$Class$String$ObjectArr($J.cls(WndGameInProgress), 'erase_warn_title', []), Messages.get$Class$String$ObjectArr($J.cls(WndGameInProgress), 'erase_warn_body', []), [Messages.get$Class$String$ObjectArr($J.cls(WndGameInProgress), 'erase_warn_yes', []), Messages.get$Class$String$ObjectArr($J.cls(WndGameInProgress), 'erase_warn_no', [])]));
    }
    $c($slot): this {
      this.$cv_slot = $slot;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndGameInProgress$3', []);
}

$J.define(WndGameInProgress, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndGameInProgress', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { 'int': '_WndGameInProgress' }, meths: { 'statSlot(java.lang.String,int)': 'statSlot$String$int$WndGameInProgress', 'statSlot(java.lang.String,java.lang.String)': 'statSlot$String$String$WndGameInProgress' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  GamesInProgress = $J.load('com.shatteredpixel.shatteredpixeldungeon.GamesInProgress');
  ShatteredPixelDungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ShatteredPixelDungeon');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  InterlevelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene');
  InterlevelScene$Mode = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene$Mode');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  StartScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.StartScene');
  HeroSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.HeroSprite');
  ActionIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ActionIndicator');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  RedButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RedButton');
  DungeonSeed = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.DungeonSeed');
  IconTitle = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.IconTitle');
  WndChallenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndChallenges');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  Game = $J.load('com.watabou.noosa.Game');
});
