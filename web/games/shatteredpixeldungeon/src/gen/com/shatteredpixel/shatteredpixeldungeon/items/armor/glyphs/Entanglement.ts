// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/armor/glyphs/Entanglement.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../jre/index.ts';
import { Armor$Glyph } from '../Armor.ts';

let Dungeon, Buff, CellEmitter, EarthParticle, Earthroot$Armor, PixelScene, ItemSprite$Glowing, Random;

export class Entanglement extends Armor$Glyph {
  static BROWN: ItemSprite$Glowing = null;
  _Entanglement(): this {
    this._Armor$Glyph();
    return this;
  }
  proc(armor: Armor, attacker: Char, defender: Char, damage: number): number {
    let level = Math.max(0, armor.buffedLvl());
    let procChance = Math.fround(Math.fround(1 / 4) * this.procChanceMultiplier(defender));
    if (Random.Float$() < procChance) {
      let powerMulti = Math.max(1, procChance);
      Buff.affect$Char$Class(defender, $J.cls(Earthroot$Armor)).level($J.roundf(Math.fround(((5 + Math.imul(2, level)) | 0) * powerMulti)));
      CellEmitter.bottom(defender.pos).start(EarthParticle.FACTORY, Math.fround(0.05), 8);
      if (defender === Dungeon.hero) {
        PixelScene.shake(1, Math.fround(0.4));
      }
    }
    return damage;
  }
  glowing(): ItemSprite$Glowing {
    return Entanglement.BROWN;
  }
  static $clinit() {
    Entanglement.BROWN = new ItemSprite$Glowing()._ItemSprite$Glowing$int(6697728);
  }
}

$J.define(Entanglement, 'com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Entanglement', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor$Glyph', ctors: { '': '_Entanglement' }, clinit: true, lazy: ['BROWN'] });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  EarthParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.EarthParticle');
  Earthroot$Armor = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Earthroot$Armor');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  Random = $J.load('com.watabou.utils.Random');
});
