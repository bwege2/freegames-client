// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndImpOld.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../jre/index.ts';
import { Window } from '../ui/Window.ts';

let Dungeon, Imp$Quest, Messages, PixelScene, ItemSprite, RedButton, GLog, IconTitle;

export class WndImpOld extends Window {
  static readonly WIDTH: number = 120;
  static readonly BTN_HEIGHT: number = 20;
  static readonly GAP: number = 2;
  _WndImpOld(imp: Imp, tokens: DwarfToken): this {
    this._Window$();
    let titlebar = new IconTitle()._IconTitle$();
    titlebar.icon(new ItemSprite()._ItemSprite$int$Glowing(tokens.image(), null));
    titlebar.label$String(Messages.titleCase(tokens.name()));
    titlebar.setRect(0, 0, Math.fround(WndImpOld.WIDTH), 0);
    this.add$Gizmo(titlebar);
    let message = PixelScene.renderTextBlock$String$int(Messages.get$Object$String$ObjectArr(this, 'message', []), 6);
    message.maxWidth$int(WndImpOld.WIDTH);
    message.setPos(0, Math.fround(titlebar.bottom() + WndImpOld.GAP));
    this.add$Gizmo(message);
    let btnReward = new (WndImpOld$1())().$o(this).$c(imp, tokens)._RedButton$String(Messages.get$Object$String$ObjectArr(this, 'reward', []));
    btnReward.setRect(0, Math.fround(Math.fround(message.top() + message.height()) + WndImpOld.GAP), Math.fround(WndImpOld.WIDTH), Math.fround(WndImpOld.BTN_HEIGHT));
    this.add$Gizmo(btnReward);
    this.resize(WndImpOld.WIDTH, $J.d2i(btnReward.bottom()));
    return this;
  }
  takeReward(imp: Imp, tokens: DwarfToken, reward: Item): void {
    this.hide();
    tokens.detachAll(Dungeon.hero.belongings.backpack);
    if (reward == null) {
      return;
    }
    reward.identify$boolean(false);
    if (reward.doPickUp$Hero(Dungeon.hero)) {
      GLog.i(Messages.capitalize(Messages.get$Object$String$ObjectArr(Dungeon.hero, 'you_now_have', [reward.name()])), []);
    } else {
      Dungeon.level.drop(reward, imp.pos).sprite_.drop$();
    }
    imp.flee();
    Imp$Quest.oldComplete();
  }
}

let $WndImpOld$1: any = null;
/** An anonymous class (WndImpOld.java:57). */
function WndImpOld$1(): any {
  return $WndImpOld$1 ??= $J.local(class extends RedButton {
    onClick(): void {
      this.$outer.takeReward(this.$cv_imp, this.$cv_tokens, Imp$Quest.reward);
    }
    $c($imp, $tokens): this {
      this.$cv_imp = $imp; this.$cv_tokens = $tokens;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndImpOld$1', []);
}

$J.define(WndImpOld, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndImpOld', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Imp,com.shatteredpixel.shatteredpixeldungeon.items.quest.DwarfToken': '_WndImpOld' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Imp$Quest = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Imp$Quest');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  RedButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RedButton');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  IconTitle = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.IconTitle');
});
