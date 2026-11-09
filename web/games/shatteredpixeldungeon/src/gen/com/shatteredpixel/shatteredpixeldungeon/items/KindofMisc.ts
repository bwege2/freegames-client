// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/KindofMisc.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { EquipableItem } from './EquipableItem.ts';

let Dungeon, HeroClass, Talent, Item, Artifact, Ring, Messages, GameScene, ItemSprite, GLog, WndOptions, Random;

export class KindofMisc extends EquipableItem {
  _KindofMisc(): this {
    this._EquipableItem();
    return this;
  }
  doEquip(hero: Hero): boolean {
    let equipFull = false;
    if (this instanceof Artifact && hero.belongings.artifact_ != null && hero.belongings.misc_ != null) {
      if (hero.belongings.misc_ instanceof Ring && hero.belongings.ring_ == null) {
        hero.belongings.ring_ = hero.belongings.misc_;
        hero.belongings.misc_ = null;
      } else {
        equipFull = true;
      }
    } else if (this instanceof Ring && hero.belongings.misc_ != null && hero.belongings.ring_ != null) {
      if (hero.belongings.misc_ instanceof Artifact && hero.belongings.artifact_ == null) {
        hero.belongings.artifact_ = hero.belongings.misc_;
        hero.belongings.misc_ = null;
      } else {
        equipFull = true;
      }
    }
    if (equipFull) {
      let miscs = $J.newArray(3, null);
      miscs[0] = hero.belongings.artifact_;
      miscs[1] = hero.belongings.misc_;
      miscs[2] = hero.belongings.ring_;
      let enabled = $J.newArray(3, false);
      enabled[0] = miscs[0] != null;
      enabled[1] = miscs[1] != null;
      enabled[2] = miscs[2] != null;
      if (this instanceof Ring && hero.belongings.misc_ instanceof Ring) {
        enabled[0] = false;
      } else if (this instanceof Artifact && hero.belongings.misc_ instanceof Artifact) {
        enabled[2] = false;
      }
      GameScene.show(new (KindofMisc$1())().$o(this).$c(miscs, hero, enabled)._WndOptions$Image$String$String$StringArr(new ItemSprite()._ItemSprite$Item(this), Messages.get$Class$String$ObjectArr($J.cls(KindofMisc), 'unequip_title', []), Messages.get$Class$String$ObjectArr($J.cls(KindofMisc), 'unequip_message', []), [miscs[0] == null ? '---' : Messages.titleCase(miscs[0].title()), miscs[1] == null ? '---' : Messages.titleCase(miscs[1].title()), miscs[2] == null ? '---' : Messages.titleCase(miscs[2].title())]));
      return false;
    } else {
      if (hero.heroClass !== HeroClass.CLERIC && hero.hasTalent(Talent.HOLY_INTUITION) && this.cursed && !this.cursedKnown && Random.Int$int(20) < ((1 + Math.imul(2, hero.pointsInTalent(Talent.HOLY_INTUITION))) | 0)) {
        this.cursedKnown = true;
        GLog.p(Messages.get$Object$String$ObjectArr(this, 'curse_detected', []), []);
        return false;
      }
      if (this instanceof Artifact) {
        if (hero.belongings.artifact_ == null) {
          hero.belongings.artifact_ = this;
        } else {
          hero.belongings.misc_ = this;
        }
      } else if (this instanceof Ring) {
        if (hero.belongings.ring_ == null) {
          hero.belongings.ring_ = this;
        } else {
          hero.belongings.misc_ = this;
        }
      }
      this.detach(hero.belongings.backpack);
      Talent.onItemEquipped(hero, this);
      this.activate(hero);
      this.cursedKnown = true;
      if (this.cursed) {
        EquipableItem.equipCursed(hero);
        GLog.n(Messages.get$Object$String$ObjectArr(this, 'equip_cursed', [this]), []);
      }
      hero.spendAndNext(this.timeToEquip(hero));
      return true;
    }
  }
  doUnequip$Hero$boolean$boolean(hero: Hero, collect: boolean, single: boolean): boolean {
    if (super.doUnequip$Hero$boolean$boolean(hero, collect, single)) {
      if (hero.belongings.artifact_ === this) {
        hero.belongings.artifact_ = null;
      } else if (hero.belongings.misc_ === this) {
        hero.belongings.misc_ = null;
      } else if (hero.belongings.ring_ === this) {
        hero.belongings.ring_ = null;
      }
      return true;
    } else {
      return false;
    }
  }
  isEquipped(hero: Hero): boolean {
    return hero != null && (hero.belongings.artifact() === this || hero.belongings.misc() === this || hero.belongings.ring() === this);
  }
}

let $KindofMisc$1: any = null;
/** An anonymous class (KindofMisc.java:93). */
function KindofMisc$1(): any {
  return $KindofMisc$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      let equipped = this.$cv_miscs[index];
      let slot = Dungeon.quickslot.getSlot(this.$outer);
      EquipableItem.slotOfUnequipped = -1;
      Dungeon.hero.belongings.backpack.items_.remove(this.$outer);
      if (equipped.doUnequip$Hero$boolean$boolean(this.$cv_hero, true, false)) {
        if (index === 0 && this.$outer instanceof Ring) {
          this.$cv_hero.belongings.artifact_ = this.$cv_hero.belongings.misc_;
          this.$cv_hero.belongings.misc_ = null;
        } else if (index === 2 && this.$outer instanceof Artifact) {
          this.$cv_hero.belongings.ring_ = this.$cv_hero.belongings.misc_;
          this.$cv_hero.belongings.misc_ = null;
        }
        Dungeon.hero.belongings.backpack.items_.add(this.$outer);
        this.$outer.doEquip(this.$cv_hero);
      } else {
        Dungeon.hero.belongings.backpack.items_.add(this.$outer);
      }
      if (slot !== -1) {
        Dungeon.quickslot.setSlot(slot, this.$outer);
      } else if (EquipableItem.slotOfUnequipped !== -1 && this.$outer.defaultAction() != null) {
        Dungeon.quickslot.setSlot(EquipableItem.slotOfUnequipped, this.$outer);
      }
      Item.updateQuickslot();
    }
    enabled(index: number): boolean {
      return this.$cv_enabled[index];
    }
    $c($miscs, $hero, $enabled): this {
      this.$cv_miscs = $miscs; this.$cv_hero = $hero; this.$cv_enabled = $enabled;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.KindofMisc$1', []);
}

$J.define(KindofMisc, 'com.shatteredpixel.shatteredpixeldungeon.items.KindofMisc', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.EquipableItem', ctors: { '': '_KindofMisc' }, meths: { 'doUnequip(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,boolean,boolean)': 'doUnequip$Hero$boolean$boolean' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  HeroClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Artifact = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact');
  Ring = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.Ring');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  Random = $J.load('com.watabou.utils.Random');
});
