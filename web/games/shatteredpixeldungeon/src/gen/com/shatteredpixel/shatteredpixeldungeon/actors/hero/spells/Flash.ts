// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/Flash.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { TargetedClericSpell } from './TargetedClericSpell.ts';

let Dungeon, Talent, AscendedForm$AscendBuff, ScrollOfTeleportation, Messages, HeroIcon, GLog;

export class Flash extends TargetedClericSpell {
  static INSTANCE: Flash = null;
  _Flash(): this {
    this._TargetedClericSpell();
    return this;
  }
  icon(): number {
    return HeroIcon.FLASH;
  }
  chargeUse(hero: Hero): number {
    if (hero.buff($J.cls(AscendedForm$AscendBuff)) != null) {
      return Math.fround((2 + hero.buff($J.cls(AscendedForm$AscendBuff)).flashCasts) | 0);
    } else {
      return 2;
    }
  }
  canCast(hero: Hero): boolean {
    return super.canCast(hero) && hero.hasTalent(Talent.FLASH) && hero.buff($J.cls(AscendedForm$AscendBuff)) != null;
  }
  targetingFlags(): number {
    return -1;
  }
  onTargetSelected(tome: HolyTome, hero: Hero, target: number): void {
    if (target == null) {
      return;
    }
    if (Dungeon.level.solid[target] || (!Dungeon.level.mapped[target] && !Dungeon.level.visited[target]) || Dungeon.level.distance(hero.pos, target) > ((2 + hero.pointsInTalent(Talent.FLASH)) | 0)) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'invalid_target', []), []);
      return;
    }
    if (ScrollOfTeleportation.teleportToLocation(hero, target)) {
      hero.spendAndNext(1);
      this.onSpellCast(tome, hero);
      hero.buff($J.cls(AscendedForm$AscendBuff)).flashCasts++;
    }
  }
  static $clinit() {
    Flash.INSTANCE = new Flash()._Flash();
  }
}

$J.define(Flash, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Flash', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.TargetedClericSpell', ctors: { '': '_Flash' }, clinit: true, lazy: ['INSTANCE'] });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  AscendedForm$AscendBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.AscendedForm$AscendBuff');
  ScrollOfTeleportation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTeleportation');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
});
