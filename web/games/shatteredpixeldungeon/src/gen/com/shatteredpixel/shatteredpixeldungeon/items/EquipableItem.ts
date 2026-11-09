// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/EquipableItem.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Item } from './Item.ts';

let Assets$Sounds, Dungeon, MagicImmune, ShadowParticle, Document, Messages, GameScene, GLog, Sample;

export class EquipableItem extends Item {
  static readonly AC_EQUIP: string = 'EQUIP';
  static readonly AC_UNEQUIP: string = 'UNEQUIP';
  static slotOfUnequipped: number = 0;
  _EquipableItem(): this {
    this._Item();
    this.bones = true;
    return this;
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    actions.add(this.isEquipped(hero) ? EquipableItem.AC_UNEQUIP : EquipableItem.AC_EQUIP);
    return actions;
  }
  doPickUp$Hero$int(hero: Hero, pos: number): boolean {
    if (super.doPickUp$Hero$int(hero, pos)) {
      if (!this.isIdentified() && !Document.ADVENTURERS_GUIDE.isPageRead$String(Document.GUIDE_IDING)) {
        GameScene.flashForDocument(Document.ADVENTURERS_GUIDE, Document.GUIDE_IDING);
      }
      return true;
    } else {
      return false;
    }
  }
  execute$Hero$String(hero: Hero, action: string): void {
    super.execute$Hero$String(hero, action);
    if ($J.equals(action, EquipableItem.AC_EQUIP)) {
      let slot = Dungeon.quickslot.getSlot(this);
      EquipableItem.slotOfUnequipped = -1;
      this.doEquip(hero);
      if (slot !== -1) {
        Dungeon.quickslot.setSlot(slot, this);
        Item.updateQuickslot();
      } else if (EquipableItem.slotOfUnequipped !== -1 && this.defaultAction() != null) {
        Dungeon.quickslot.setSlot(EquipableItem.slotOfUnequipped, this);
        Item.updateQuickslot();
      }
    } else if ($J.equals(action, EquipableItem.AC_UNEQUIP)) {
      this.doUnequip$Hero$boolean(hero, true);
    }
  }
  doDrop(hero: Hero): void {
    if (!this.isEquipped(hero) || this.doUnequip$Hero$boolean$boolean(hero, false, false)) {
      super.doDrop(hero);
    }
  }
  cast(user: Hero, dst: number): void {
    if (this.isEquipped(user)) {
      if (this.quantity === 1 && !this.doUnequip$Hero$boolean$boolean(user, false, false)) {
        return;
      }
    }
    super.cast(user, dst);
  }
  static equipCursed(hero: Hero): void {
    hero.sprite_.emitter().burst(ShadowParticle.CURSE, 6);
    Sample.INSTANCE.play$Object(Assets$Sounds.CURSED);
  }
  timeToEquip(hero: Hero): number {
    return 1;
  }
  doUnequip$Hero$boolean$boolean(hero: Hero, collect: boolean, single: boolean): boolean {
    if (this.cursed && hero.buff($J.cls(MagicImmune)) == null && (!hero.belongings.lostInventory$() || this.keptThroughLostInventory())) {
      GLog.w(Messages.get$Class$String$ObjectArr($J.cls(EquipableItem), 'unequip_cursed', []), []);
      return false;
    }
    if (single) {
      hero.spendAndNext(this.timeToEquip(hero));
    } else {
      hero.spend(this.timeToEquip(hero));
    }
    EquipableItem.slotOfUnequipped = Dungeon.quickslot.getSlot(this);
    let wasKept = this.keptThoughLostInvent;
    this.keptThoughLostInvent = true;
    if (!collect || !this.collect$Bag(hero.belongings.backpack)) {
      this.onDetach();
      Dungeon.quickslot.clearItem(this);
      Item.updateQuickslot();
      if (collect) {
        Dungeon.level.drop(this, hero.pos).sprite_.drop$();
      }
    }
    this.keptThoughLostInvent = wasKept;
    return true;
  }
  doUnequip$Hero$boolean(hero: Hero, collect: boolean): boolean {
    return this.doUnequip$Hero$boolean$boolean(hero, collect, true);
  }
  activate(ch: Char): void {
  }
  static $clinit() {
    EquipableItem.slotOfUnequipped = -1;
  }
}

$J.define(EquipableItem, 'com.shatteredpixel.shatteredpixeldungeon.items.EquipableItem', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { '': '_EquipableItem' }, meths: { 'doUnequip(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,boolean)': 'doUnequip$Hero$boolean', 'doUnequip(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,boolean,boolean)': 'doUnequip$Hero$boolean$boolean', 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String', 'doPickUp(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,int)': 'doPickUp$Hero$int' }, clinit: true, lazy: ['slotOfUnequipped'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  MagicImmune = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MagicImmune');
  ShadowParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShadowParticle');
  Document = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Document');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
