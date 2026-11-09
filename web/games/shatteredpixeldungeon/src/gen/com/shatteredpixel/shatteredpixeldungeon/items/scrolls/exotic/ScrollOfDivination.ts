// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/scrolls/exotic/ScrollOfDivination.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../../jre/index.ts';
import { ExoticScroll } from './ExoticScroll.ts';
import { Window } from '../../../ui/Window.ts';

let Assets$Sounds, Identification, Item, Potion, Ring, Scroll, Messages, GameScene, PixelScene, ItemSprite, ItemSpriteSheet$Icons, GLog, IconTitle, Sample, Random, Reflection;

export class ScrollOfDivination extends ExoticScroll {
  _ScrollOfDivination(): this {
    this._ExoticScroll();
    this.icon_ = ItemSpriteSheet$Icons.SCROLL_DIVINATE;
    return this;
  }
  doRead(): void {
    this.detach(Item.curUser.belongings.backpack);
    Item.curUser.sprite_.parent.add$Gizmo(new Identification()._Identification(Item.curUser.sprite_.center$().offset$float$float(0, -16)));
    Sample.INSTANCE.play$Object(Assets$Sounds.READ);
    let potions = Potion.getUnknown();
    let scrolls = Scroll.getUnknown();
    let rings = Ring.getUnknown();
    let total = (potions.size() + scrolls.size() + rings.size()) | 0;
    let IDed = new ArrayList();
    let left = 4;
    let baseProbs = [3, 3, 3];
    let probs = baseProbs.slice();
    while (left > 0 && total > 0) {
      {
        let p: Potion, s: Scroll, r: Ring;
        switch (Random.chances$floatArr(probs)) {
          default:
            probs = baseProbs.slice();
            continue;
          case 0:
            if (potions.isEmpty()) {
              probs[0] = 0;
              continue;
            }
            probs[0]--;
            p = Reflection.newInstance(Random.element$Collection(potions));
            p.identify$();
            IDed.add(p);
            potions.remove(p.getClass());
            break;
          case 1:
            if (scrolls.isEmpty()) {
              probs[1] = 0;
              continue;
            }
            probs[1]--;
            s = Reflection.newInstance(Random.element$Collection(scrolls));
            s.identify$();
            IDed.add(s);
            scrolls.remove(s.getClass());
            break;
          case 2:
            if (rings.isEmpty()) {
              probs[2] = 0;
              continue;
            }
            probs[2]--;
            r = Reflection.newInstance(Random.element$Collection(rings));
            r.setKnown();
            IDed.add(r);
            rings.remove(r.getClass());
            break;
        }
      }
      left--;
      total--;
    }
    if (left === 4) {
      GLog.n(Messages.get$Object$String$ObjectArr(this, 'nothing_left', []), []);
    } else {
      GameScene.show(new ScrollOfDivination$WndDivination().$o(this)._ScrollOfDivination$WndDivination(IDed));
    }
    this.readAnimation();
    this.identify$();
  }
}

export class ScrollOfDivination$WndDivination extends Window {
  static readonly WIDTH: number = 120;
  _ScrollOfDivination$WndDivination(IDed: ArrayList<Item>): this {
    this._Window$();
    let cur = new IconTitle()._IconTitle$Image$String(new ItemSprite()._ItemSprite$Item(this.$outer), Messages.titleCase(Messages.get$Class$String$ObjectArr($J.cls(ScrollOfDivination), 'name', [])));
    cur.setRect(0, 0, Math.fround(ScrollOfDivination$WndDivination.WIDTH), 0);
    this.add$Gizmo(cur);
    let msg = PixelScene.renderTextBlock$String$int(Messages.get$Object$String$ObjectArr(this, 'desc', []), 6);
    msg.maxWidth$int(120);
    msg.setPos(0, Math.fround(cur.bottom() + 2));
    this.add$Gizmo(msg);
    let pos = Math.fround(msg.bottom() + 10);
    for (const $it0 = IDed.iterator(); $it0.hasNext(); ) {
      let i = $it0.next();
      cur = new IconTitle()._IconTitle$Item(i);
      cur.setRect(0, pos, Math.fround(ScrollOfDivination$WndDivination.WIDTH), 0);
      this.add$Gizmo(cur);
      pos = Math.fround(cur.bottom() + 2);
    }
    this.resize(ScrollOfDivination$WndDivination.WIDTH, $J.d2i(pos));
    return this;
  }
}

$J.define(ScrollOfDivination, 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfDivination', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ExoticScroll', ctors: { '': '_ScrollOfDivination' } });
$J.define(ScrollOfDivination$WndDivination, 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfDivination$WndDivination', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { 'java.util.ArrayList': '_ScrollOfDivination$WndDivination' }, inner: true });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Identification = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Identification');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Potion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.Potion');
  Ring = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.Ring');
  Scroll = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.Scroll');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  ItemSpriteSheet$Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet$Icons');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  IconTitle = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.IconTitle');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Random = $J.load('com.watabou.utils.Random');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
