// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/traps/CursingTrap.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections } from '../../../../../../jre/index.ts';
import { Trap } from './Trap.ts';

let Assets$Sounds, Dungeon, CellEmitter, ShadowParticle, EquipableItem, Item, Armor, Armor$Glyph, Weapon, Weapon$Enchantment, MagesStaff, MissileWeapon, Messages, GLog, Sample;

export class CursingTrap extends Trap {
  _CursingTrap(): this {
    this._Trap();
    this.color_ = Trap.VIOLET;
    this.shape = Trap.WAVES;
    return this;
  }
  activate(): void {
    if (Dungeon.level.heroFOV[this.pos]) {
      CellEmitter.get(this.pos).burst(ShadowParticle.UP, 5);
      Sample.INSTANCE.play$Object(Assets$Sounds.CURSED);
    }
    let heap = Dungeon.level.heaps.get(this.pos);
    if (heap != null) {
      for (const $it0 = heap.items_.iterator(); $it0.hasNext(); ) {
        let item = $it0.next();
        if (item.isUpgradable() && !(item instanceof MissileWeapon)) {
          CursingTrap.curse$Item(item);
        }
      }
    }
    if (Dungeon.hero.pos === this.pos && !Dungeon.hero.flying) {
      CursingTrap.curse$Hero(Dungeon.hero);
    }
  }
  static curse$Hero(hero: Hero): void {
    let priorityCurse = new ArrayList();
    let canCurse = new ArrayList();
    let weapon = hero.belongings.weapon();
    if (weapon instanceof Weapon && !(weapon instanceof MagesStaff)) {
      if ((weapon).enchantment == null) {
        priorityCurse.add(weapon);
      } else {
        canCurse.add(weapon);
      }
    }
    weapon = hero.belongings.secondWep();
    if (weapon instanceof Weapon && !(weapon instanceof MagesStaff)) {
      if ((weapon).enchantment == null) {
        priorityCurse.add(weapon);
      } else {
        canCurse.add(weapon);
      }
    }
    let armor = hero.belongings.armor();
    if (armor != null) {
      if (armor.glyph_ == null) {
        priorityCurse.add(armor);
      } else {
        canCurse.add(armor);
      }
    }
    if (!priorityCurse.isEmpty()) {
      Collections.shuffle(priorityCurse);
      CursingTrap.curse$Item(priorityCurse.removeAt(0));
    } else if (!canCurse.isEmpty()) {
      Collections.shuffle(canCurse);
      CursingTrap.curse$Item(canCurse.removeAt(0));
    }
    EquipableItem.equipCursed(hero);
    GLog.n(Messages.get$Class$String$ObjectArr($J.cls(CursingTrap), 'curse', []), []);
  }
  static curse$Item(item: Item): void {
    item.cursed = item.cursedKnown = true;
    if (item instanceof Weapon) {
      let w = item;
      if (w.enchantment == null) {
        w.enchant$Enchantment(Weapon$Enchantment.randomCurse([]));
      }
    }
    if (item instanceof Armor) {
      let a = item;
      if (a.glyph_ == null) {
        a.inscribe$Glyph(Armor$Glyph.randomCurse([]));
      }
    }
    Item.updateQuickslot();
  }
}

$J.define(CursingTrap, 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.CursingTrap', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap', ctors: { '': '_CursingTrap' }, meths: { 'curse(com.shatteredpixel.shatteredpixeldungeon.items.Item)': 'curse$Item', 'curse(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero)': 'curse$Hero' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  ShadowParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShadowParticle');
  EquipableItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.EquipableItem');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Armor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor');
  Armor$Glyph = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor$Glyph');
  Weapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon');
  Weapon$Enchantment = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment');
  MagesStaff = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MagesStaff');
  MissileWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
