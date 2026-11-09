// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/LostBackpack.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, LostInventory, Talent, EquipableItem, CloakOfShadows, HolyTome, MagicalHolster, Wand, MagesStaff, Notes, Notes$Landmark, GameScene, ItemSpriteSheet, Sample;

export class LostBackpack extends Item {
  _LostBackpack(): this {
    this._Item();
    this.image_ = ItemSpriteSheet.BACKPACK;
    this.unique = true;
    return this;
  }
  doPickUp$Hero$int(hero: Hero, pos: number): boolean {
    if (hero.buff($J.cls(LostInventory)) != null) {
      hero.buff($J.cls(LostInventory)).detach();
    }
    let holster = hero.belongings.getItem($J.cls(MagicalHolster));
    for (const $it0 = hero.belongings.iterator(); $it0.hasNext(); ) {
      let i = $it0.next();
      if (i.keptThroughLostInventory()) {
        i.keptThoughLostInvent = false;
      } else {
        if (i instanceof EquipableItem && i.isEquipped(hero)) {
          (i).activate(hero);
        } else if (i instanceof CloakOfShadows && hero.hasTalent(Talent.LIGHT_CLOAK)) {
          (i).activate(hero);
        } else if (i instanceof HolyTome && hero.hasTalent(Talent.LIGHT_READING)) {
          (i).activate(hero);
        } else if (i instanceof Wand) {
          if (holster != null && holster.contains(i)) {
            (i).charge$Char$float(hero, MagicalHolster.HOLSTER_SCALE_FACTOR);
          } else {
            (i).charge$Char(hero);
          }
        } else if (i instanceof MagesStaff) {
          (i).applyWandChargeBuff(hero);
        }
      }
    }
    hero.updateHT(false);
    Item.updateQuickslot();
    Sample.INSTANCE.play$Object(Assets$Sounds.DEWDROP);
    hero.spendAndNext(this.pickupDelay());
    GameScene.pickUp(this, pos);
    (hero.sprite_).updateArmor();
    Notes.remove$Landmark(Notes$Landmark.LOST_PACK);
    return true;
  }
}

$J.define(LostBackpack, 'com.shatteredpixel.shatteredpixeldungeon.items.LostBackpack', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { '': '_LostBackpack' }, meths: { 'doPickUp(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,int)': 'doPickUp$Hero$int' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  LostInventory = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.LostInventory');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  EquipableItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.EquipableItem');
  CloakOfShadows = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.CloakOfShadows');
  HolyTome = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.HolyTome');
  MagicalHolster = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bags.MagicalHolster');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  MagesStaff = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MagesStaff');
  Notes = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes');
  Notes$Landmark = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes$Landmark');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
