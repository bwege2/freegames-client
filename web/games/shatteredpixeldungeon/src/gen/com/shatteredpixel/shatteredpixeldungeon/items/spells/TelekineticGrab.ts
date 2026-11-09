// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/spells/TelekineticGrab.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../jre/index.ts';
import { TargetedSpell } from './TargetedSpell.ts';
import { Recipe$SimpleRecipe } from '../Recipe.ts';

let Assets$Sounds, Dungeon, Actor, PinCushion, DwarfKing, MagicMissile, Heap$Type, Item, LiquidMetal, Messages, ItemSpriteSheet, GLog, Sample;

export class TelekineticGrab extends TargetedSpell {
  _TelekineticGrab(): this {
    this._TargetedSpell();
    this.image_ = ItemSpriteSheet.TELE_GRAB;
    this.talentChance = Math.fround(1 / Math.fround(TelekineticGrab$Recipe.OUT_QUANTITY));
    return this;
  }
  fx(bolt: Ballistica, callback: Callback): void {
    MagicMissile.boltFromChar(Item.curUser.sprite_.parent, MagicMissile.BEACON, Item.curUser.sprite_, bolt.collisionPos, callback);
    Sample.INSTANCE.play$Object(Assets$Sounds.ZAP);
  }
  timeToCast(): number {
    return 0;
  }
  affectTarget(bolt: Ballistica, hero: Hero): void {
    let ch = Actor.findChar(bolt.collisionPos);
    if (ch == null && bolt.path.size() > ((bolt.dist + 1) | 0)) {
      ch = Actor.findChar(bolt.path.get((bolt.dist + 1) | 0));
      if (!(ch instanceof DwarfKing && Dungeon.level.solid[ch.pos])) {
        ch = null;
      }
    }
    let totalpickupTime = 0;
    if (ch != null && ch.buff($J.cls(PinCushion)) != null) {
      while (ch.buff($J.cls(PinCushion)) != null) {
        let item = ch.buff($J.cls(PinCushion)).grabOne();
        if (item.doPickUp$Hero$int(hero, ch.pos)) {
          totalpickupTime = Math.fround(totalpickupTime + item.pickupDelay());
          GLog.i(Messages.capitalize(Messages.get$Object$String$ObjectArr(hero, 'you_now_have', [item.name()])), []);
        } else {
          GLog.w(Messages.get$Object$String$ObjectArr(this, 'cant_grab', []), []);
          Dungeon.level.drop(item, ch.pos).sprite_.drop$();
          break;
        }
      }
      if (totalpickupTime > Math.fround(1)) {
        hero.spend(Math.fround(-(Math.fround(totalpickupTime - 1))));
      }
    } else if (Dungeon.level.heaps.get(bolt.collisionPos) != null) {
      let h = Dungeon.level.heaps.get(bolt.collisionPos);
      if (h.type_ !== Heap$Type.HEAP) {
        GLog.w(Messages.get$Object$String$ObjectArr(this, 'cant_grab', []), []);
        hero.spend(Actor.TICK);
        h.sprite_.drop$();
      } else {
        while (!h.isEmpty()) {
          let item = h.peek();
          if (item.doPickUp$Hero$int(hero, h.pos)) {
            h.pickUp();
            totalpickupTime = Math.fround(totalpickupTime + item.pickupDelay());
            GLog.i(Messages.capitalize(Messages.get$Object$String$ObjectArr(hero, 'you_now_have', [item.name()])), []);
          } else {
            GLog.w(Messages.get$Object$String$ObjectArr(this, 'cant_grab', []), []);
            h.sprite_.drop$();
            break;
          }
        }
        if (totalpickupTime > Math.fround(1)) {
          hero.spend(Math.fround(-(Math.fround(totalpickupTime - 1))));
        }
      }
    } else {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'no_target', []), []);
      hero.spend(Actor.TICK);
    }
    this.onSpellused();
  }
  value(): number {
    return $J.d2i((Math.fround(50 * (Math.fround(this.quantity / Math.fround(TelekineticGrab$Recipe.OUT_QUANTITY))))));
  }
  energyVal(): number {
    return $J.d2i((Math.fround(10 * (Math.fround(this.quantity / Math.fround(TelekineticGrab$Recipe.OUT_QUANTITY))))));
  }
}

export class TelekineticGrab$Recipe extends Recipe$SimpleRecipe {
  static readonly OUT_QUANTITY: number = 8;
  _TelekineticGrab$Recipe(): this {
    this._Recipe$SimpleRecipe();
    this.inputs = [$J.cls(LiquidMetal)];
    this.inQuantity = [10];
    this.cost_ = 10;
    this.output = $J.cls(TelekineticGrab);
    this.outQuantity = TelekineticGrab$Recipe.OUT_QUANTITY;
    return this;
  }
}

$J.define(TelekineticGrab, 'com.shatteredpixel.shatteredpixeldungeon.items.spells.TelekineticGrab', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.spells.TargetedSpell', ctors: { '': '_TelekineticGrab' } });
$J.define(TelekineticGrab$Recipe, 'com.shatteredpixel.shatteredpixeldungeon.items.spells.TelekineticGrab$Recipe', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Recipe$SimpleRecipe', ctors: { '': '_TelekineticGrab$Recipe' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  PinCushion = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.PinCushion');
  DwarfKing = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DwarfKing');
  MagicMissile = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  LiquidMetal = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.LiquidMetal');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
