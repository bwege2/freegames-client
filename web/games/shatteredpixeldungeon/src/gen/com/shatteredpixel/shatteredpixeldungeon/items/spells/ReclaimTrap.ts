// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/spells/ReclaimTrap.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Buff } from '../../actors/buffs/Buff.ts';

let Assets$Sounds, Dungeon, Invisibility, Item, MetalShard, ScrollOfMagicMapping, ScrollOfRecharging, Bestiary, Catalog, Messages, ItemSprite$Glowing, ItemSpriteSheet, GLog, Sample, Reflection;

export class ReclaimTrap extends TargetedSpell {
  static COLORS: ItemSprite$Glowing[] = null;
  _ReclaimTrap(): this {
    this._TargetedSpell();
    this.image_ = ItemSpriteSheet.RECLAIM_TRAP;
    this.talentChance = Math.fround(1 / Math.fround(ReclaimTrap$Recipe.OUT_QUANTITY));
    return this;
  }
  affectTarget(bolt: Ballistica, hero: Hero): void {
    let storedTrap = null;
    if (hero.buff($J.cls(ReclaimTrap$ReclaimedTrap)) != null) {
      storedTrap = hero.buff($J.cls(ReclaimTrap$ReclaimedTrap)).trap;
      hero.buff($J.cls(ReclaimTrap$ReclaimedTrap)).detach();
    }
    if (storedTrap == null) {
      let t = Dungeon.level.traps.get(bolt.collisionPos);
      if (t != null && t.active && t.visible_) {
        t.disarm();
        Sample.INSTANCE.play$Object(Assets$Sounds.LIGHTNING);
        ScrollOfRecharging.charge(hero);
        Buff.affect$Char$Class(hero, $J.cls(ReclaimTrap$ReclaimedTrap)).trap = t.getClass();
        Bestiary.setSeen(t.getClass());
      } else {
        GLog.w(Messages.get$Object$String$ObjectArr(this, 'no_trap', []), []);
      }
      Invisibility.dispel$();
      Item.curUser.spendAndNext(this.timeToCast());
    } else {
      let t = Reflection.newInstance(storedTrap);
      t.pos = bolt.collisionPos;
      t.reclaimed = true;
      Bestiary.countEncounter(t.getClass());
      t.activate();
      this.onSpellused();
    }
  }
  desc(): string {
    let desc = super.desc();
    if (Dungeon.hero != null && Dungeon.hero.belongings.contains(this) && Dungeon.hero.buff($J.cls(ReclaimTrap$ReclaimedTrap)) != null) {
      desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_trap', [Messages.get$Class$String$ObjectArr(Dungeon.hero.buff($J.cls(ReclaimTrap$ReclaimedTrap)).trap, 'name', [])]);
    }
    return desc;
  }
  glowing(): ItemSprite$Glowing {
    if (Dungeon.hero != null && Dungeon.hero.belongings.contains(this) && Dungeon.hero.buff($J.cls(ReclaimTrap$ReclaimedTrap)) != null) {
      return ReclaimTrap.COLORS[Reflection.newInstance(Dungeon.hero.buff($J.cls(ReclaimTrap$ReclaimedTrap)).trap).color_];
    }
    return null;
  }
  value(): number {
    return $J.d2i((Math.fround(60 * (Math.fround(this.quantity / Math.fround(ReclaimTrap$Recipe.OUT_QUANTITY))))));
  }
  energyVal(): number {
    return $J.d2i((Math.fround(12 * (Math.fround(this.quantity / Math.fround(ReclaimTrap$Recipe.OUT_QUANTITY))))));
  }
  static $clinit() {
    ReclaimTrap.COLORS = [new ItemSprite$Glowing()._ItemSprite$Glowing$int(16711680), new ItemSprite$Glowing()._ItemSprite$Glowing$int(16744448), new ItemSprite$Glowing()._ItemSprite$Glowing$int(16776960), new ItemSprite$Glowing()._ItemSprite$Glowing$int(65280), new ItemSprite$Glowing()._ItemSprite$Glowing$int(65535), new ItemSprite$Glowing()._ItemSprite$Glowing$int(8388863), new ItemSprite$Glowing()._ItemSprite$Glowing$int(16777215), new ItemSprite$Glowing()._ItemSprite$Glowing$int(8421504), new ItemSprite$Glowing()._ItemSprite$Glowing$int(0)];
  }
}

export class ReclaimTrap$Recipe extends Recipe$SimpleRecipe {
  static readonly OUT_QUANTITY: number = 5;
  _ReclaimTrap$Recipe(): this {
    this._Recipe$SimpleRecipe();
    this.inputs = [$J.cls(ScrollOfMagicMapping), $J.cls(MetalShard)];
    this.inQuantity = [1, 1];
    this.cost_ = 8;
    this.output = $J.cls(ReclaimTrap);
    this.outQuantity = ReclaimTrap$Recipe.OUT_QUANTITY;
    return this;
  }
  brew(ingredients: ArrayList<Item>): Item {
    Catalog.countUse($J.cls(MetalShard));
    return super.brew(ingredients);
  }
}

export class ReclaimTrap$ReclaimedTrap extends Buff {
  trap: JClass<Trap> = null;
  static readonly TRAP: string = 'trap';
  _ReclaimTrap$ReclaimedTrap(): this {
    this._Buff();
    this.revivePersists = true;
    return this;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$Class(ReclaimTrap$ReclaimedTrap.TRAP, this.trap);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.trap = bundle.getClass$String(ReclaimTrap$ReclaimedTrap.TRAP);
  }
}

$J.define(ReclaimTrap, 'com.shatteredpixel.shatteredpixeldungeon.items.spells.ReclaimTrap', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.spells.TargetedSpell', ctors: { '': '_ReclaimTrap' }, clinit: true, lazy: ['COLORS'] });
$J.define(ReclaimTrap$Recipe, 'com.shatteredpixel.shatteredpixeldungeon.items.spells.ReclaimTrap$Recipe', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Recipe$SimpleRecipe', ctors: { '': '_ReclaimTrap$Recipe' } });
$J.define(ReclaimTrap$ReclaimedTrap, 'com.shatteredpixel.shatteredpixeldungeon.items.spells.ReclaimTrap$ReclaimedTrap', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_ReclaimTrap$ReclaimedTrap' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  MetalShard = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.MetalShard');
  ScrollOfMagicMapping = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfMagicMapping');
  ScrollOfRecharging = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRecharging');
  Bestiary = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Bestiary');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
