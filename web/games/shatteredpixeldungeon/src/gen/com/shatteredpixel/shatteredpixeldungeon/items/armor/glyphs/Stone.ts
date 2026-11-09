// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/armor/glyphs/Stone.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Char$Alignment, AscensionChallenge, Bless, ChampionEnemy, Daze, Hex, HeroClass, Talent, FerretTuft, ItemSprite$Glowing, GameMath;

export class Stone extends Armor$Glyph {
  static GREY: ItemSprite$Glowing = null;
  static testing: boolean = false;
  _Stone(): this {
    this._Armor$Glyph();
    return this;
  }
  proc(armor: Armor, attacker: Char, defender: Char, damage: number): number {
    Stone.testing = true;
    let accuracy = Math.fround(attacker.attackSkill(defender));
    let evasion = Math.fround(defender.defenseSkill(attacker));
    Stone.testing = false;
    if (attacker.buff($J.cls(Bless)) != null) {
      accuracy = Math.fround(accuracy * 1.25);
    }
    if (attacker.buff($J.cls(Hex)) != null) {
      accuracy = Math.fround(accuracy * Math.fround(0.8));
    }
    if (attacker.buff($J.cls(Daze)) != null) {
      accuracy = Math.fround(accuracy * 0.5);
    }
    for (const $it0 = attacker.buffs$Class($J.cls(ChampionEnemy)).iterator(); $it0.hasNext(); ) {
      let buff = $it0.next();
      accuracy = Math.fround(accuracy * buff.evasionAndAccuracyFactor());
    }
    accuracy = Math.fround(accuracy * AscensionChallenge.statModifier(attacker));
    if (Dungeon.hero.heroClass !== HeroClass.CLERIC && Dungeon.hero.hasTalent(Talent.BLESS) && attacker.alignment === Char$Alignment.ALLY) {
      accuracy = Math.fround(accuracy * Math.fround(Math.fround(1.01) + Math.fround(Math.fround(0.02) * Dungeon.hero.pointsInTalent(Talent.BLESS))));
    }
    if (defender.buff($J.cls(Bless)) != null) {
      evasion = Math.fround(evasion * 1.25);
    }
    if (defender.buff($J.cls(Hex)) != null) {
      evasion = Math.fround(evasion * Math.fround(0.8));
    }
    if (defender.buff($J.cls(Daze)) != null) {
      evasion = Math.fround(evasion * 0.5);
    }
    for (const $it1 = defender.buffs$Class($J.cls(ChampionEnemy)).iterator(); $it1.hasNext(); ) {
      let buff = $it1.next();
      evasion = Math.fround(evasion * buff.evasionAndAccuracyFactor());
    }
    evasion = Math.fround(evasion * AscensionChallenge.statModifier(defender));
    if (Dungeon.hero.heroClass !== HeroClass.CLERIC && Dungeon.hero.hasTalent(Talent.BLESS) && defender.alignment === Char$Alignment.ALLY) {
      evasion = Math.fround(evasion * Math.fround(Math.fround(1.01) + Math.fround(Math.fround(0.02) * Dungeon.hero.pointsInTalent(Talent.BLESS))));
    }
    evasion = Math.fround(evasion * FerretTuft.evasionMultiplier$());
    evasion = Math.fround(evasion * Armor$Glyph.genericProcChanceMultiplier(defender));
    let hitChance: number;
    if (evasion >= accuracy) {
      hitChance = Math.fround((Math.fround(accuracy / evasion)) / 2);
    } else {
      hitChance = Math.fround(1 - Math.fround((Math.fround(evasion / accuracy)) / 2));
    }
    hitChance = GameMath.gate(0.25, Math.fround((Math.fround(1 + Math.fround(3 * hitChance))) / 4), 1);
    damage = $J.d2i(Math.ceil(Math.fround(damage * hitChance)));
    return damage;
  }
  static testingEvasion(): boolean {
    return Stone.testing;
  }
  glowing(): ItemSprite$Glowing {
    return Stone.GREY;
  }
  static $clinit() {
    Stone.GREY = new ItemSprite$Glowing()._ItemSprite$Glowing$int(2236962);
    Stone.testing = false;
  }
}

$J.define(Stone, 'com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Stone', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor$Glyph', ctors: { '': '_Stone' }, clinit: true, lazy: ['GREY', 'testing'] });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  AscensionChallenge = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AscensionChallenge');
  Bless = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Bless');
  ChampionEnemy = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ChampionEnemy');
  Daze = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Daze');
  Hex = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Hex');
  HeroClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  FerretTuft = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.FerretTuft');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  GameMath = $J.load('com.watabou.utils.GameMath');
});
