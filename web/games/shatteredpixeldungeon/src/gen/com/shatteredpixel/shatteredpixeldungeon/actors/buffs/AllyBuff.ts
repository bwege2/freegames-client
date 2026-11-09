// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/AllyBuff.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Buff } from './Buff.ts';

let Badges, Statistics, Char$Alignment, AscensionChallenge, MonkEnergy, PinCushion, HeroSubClass, Mimic, FloatingText, Bestiary, CharSprite;

export class AllyBuff extends Buff {
  _AllyBuff(): this {
    this._Buff();
    this.revivePersists = true;
    return this;
  }
  attachTo(target: Char): boolean {
    if (super.attachTo(target)) {
      target.alignment = Char$Alignment.ALLY;
      if (target.buff($J.cls(PinCushion)) != null) {
        target.buff($J.cls(PinCushion)).detach();
      }
      return true;
    } else {
      return false;
    }
  }
  static affectAndLoot(enemy: Mob, hero: Hero, buffCls: JClass<AllyBuff>): void {
    let wasEnemy = enemy.alignment === Char$Alignment.ENEMY || enemy instanceof Mimic;
    Buff.affect$Char$Class(enemy, buffCls);
    if (enemy.buff(buffCls) != null && wasEnemy) {
      enemy.rollToDropLoot();
      Statistics.enemiesSlain++;
      Badges.validateMonstersSlain();
      Statistics.qualifiedForNoKilling = false;
      Bestiary.setSeen(enemy.getClass());
      Bestiary.countEncounter(enemy.getClass());
      AscensionChallenge.processEnemyKill(enemy);
      let exp = hero.lvl <= enemy.maxLvl ? enemy.EXP : 0;
      if (exp > 0) {
        hero.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(exp), FloatingText.EXPERIENCE, []);
      }
      hero.earnExp(exp, enemy.getClass());
      if (hero.subClass === HeroSubClass.MONK) {
        Buff.affect$Char$Class(hero, $J.cls(MonkEnergy)).gainEnergy(enemy);
      }
    }
  }
}

$J.define(AllyBuff, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AllyBuff', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_AllyBuff' } });
$J.module(() => {
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  AscensionChallenge = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AscensionChallenge');
  MonkEnergy = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MonkEnergy');
  PinCushion = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.PinCushion');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  Mimic = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mimic');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  Bestiary = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Bestiary');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
});
