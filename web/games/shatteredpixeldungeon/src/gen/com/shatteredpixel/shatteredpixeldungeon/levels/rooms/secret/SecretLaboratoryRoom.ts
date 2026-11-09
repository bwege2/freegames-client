// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/secret/SecretLaboratoryRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, HashMap } from '../../../../../../../jre/index.ts';
import { SecretRoom } from './SecretRoom.ts';

let Alchemy, Blob, EnergyCrystal, PotionOfExperience, PotionOfFrost, PotionOfHaste, PotionOfHealing, PotionOfInvisibility, PotionOfLevitation, PotionOfLiquidFlame, PotionOfMindVision, PotionOfParalyticGas, PotionOfPurity, PotionOfToxicGas, ExoticPotion, ExoticCrystals, Terrain, Painter, Room$Door$Type, Random, Reflection;

export class SecretLaboratoryRoom extends SecretRoom {
  static potionChances: HashMap<JClass<Potion>, number> = null;
  _SecretLaboratoryRoom(): this {
    this._SecretRoom();
    return this;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY_SP);
    this.entrance().set$Type(Room$Door$Type.HIDDEN);
    let pot = this.center();
    Painter.set$Level$Point$int(level, pot, Terrain.ALCHEMY);
    Blob.seed$int$int$Class$Level((pot.x + Math.imul(level.width(), pot.y)) | 0, 1, $J.cls(Alchemy), level);
    let pos: number;
    do {
      pos = level.pointToCell(this.random$());
    } while (level.map_[pos] !== Terrain.EMPTY_SP || level.heaps.get(pos) != null);
    level.drop(new EnergyCrystal()._EnergyCrystal$().quantity$int(Random.IntRange(3, 5)), pos);
    do {
      pos = level.pointToCell(this.random$());
    } while (level.map_[pos] !== Terrain.EMPTY_SP || level.heaps.get(pos) != null);
    level.drop(new EnergyCrystal()._EnergyCrystal$().quantity$int(Random.IntRange(3, 5)), pos);
    let n = Random.IntRange(2, 3);
    let chances = new HashMap(SecretLaboratoryRoom.potionChances);
    for (let i = 0; i < n; i++) {
      do {
        pos = level.pointToCell(this.random$());
      } while (level.map_[pos] !== Terrain.EMPTY_SP || level.heaps.get(pos) != null);
      let potionCls = Random.chances$HashMap(chances);
      $J.boxF(chances.put(potionCls, $J.boxF(0)));
      if (ExoticPotion.regToExo.containsKey(potionCls)) {
        if (Random.Float$() < ExoticCrystals.consumableExoticChance$()) {
          potionCls = ExoticPotion.regToExo.get(potionCls);
        }
      }
      level.drop(Reflection.newInstance(potionCls), pos);
    }
  }
  static $clinit() {
    SecretLaboratoryRoom.potionChances = new HashMap();
    $J.boxF(SecretLaboratoryRoom.potionChances.put($J.cls(PotionOfHealing), $J.boxF(1)));
    $J.boxF(SecretLaboratoryRoom.potionChances.put($J.cls(PotionOfMindVision), $J.boxF(2)));
    $J.boxF(SecretLaboratoryRoom.potionChances.put($J.cls(PotionOfFrost), $J.boxF(3)));
    $J.boxF(SecretLaboratoryRoom.potionChances.put($J.cls(PotionOfLiquidFlame), $J.boxF(3)));
    $J.boxF(SecretLaboratoryRoom.potionChances.put($J.cls(PotionOfToxicGas), $J.boxF(3)));
    $J.boxF(SecretLaboratoryRoom.potionChances.put($J.cls(PotionOfHaste), $J.boxF(4)));
    $J.boxF(SecretLaboratoryRoom.potionChances.put($J.cls(PotionOfInvisibility), $J.boxF(4)));
    $J.boxF(SecretLaboratoryRoom.potionChances.put($J.cls(PotionOfLevitation), $J.boxF(4)));
    $J.boxF(SecretLaboratoryRoom.potionChances.put($J.cls(PotionOfParalyticGas), $J.boxF(4)));
    $J.boxF(SecretLaboratoryRoom.potionChances.put($J.cls(PotionOfPurity), $J.boxF(4)));
    $J.boxF(SecretLaboratoryRoom.potionChances.put($J.cls(PotionOfExperience), $J.boxF(6)));
  }
}

$J.define(SecretLaboratoryRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretLaboratoryRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretRoom', ctors: { '': '_SecretLaboratoryRoom' }, clinit: true, lazy: ['potionChances'] });
$J.module(() => {
  Alchemy = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Alchemy');
  Blob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob');
  EnergyCrystal = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.EnergyCrystal');
  PotionOfExperience = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfExperience');
  PotionOfFrost = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfFrost');
  PotionOfHaste = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfHaste');
  PotionOfHealing = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfHealing');
  PotionOfInvisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfInvisibility');
  PotionOfLevitation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfLevitation');
  PotionOfLiquidFlame = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfLiquidFlame');
  PotionOfMindVision = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfMindVision');
  PotionOfParalyticGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfParalyticGas');
  PotionOfPurity = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfPurity');
  PotionOfToxicGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfToxicGas');
  ExoticPotion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.ExoticPotion');
  ExoticCrystals = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.ExoticCrystals');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Random = $J.load('com.watabou.utils.Random');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
