// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/Radiance.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { ClericSpell } from './ClericSpell.ts';

let Assets$Sounds, Challenges, Dungeon, Char$Alignment, Buff, Light, Paralysis, HeroSubClass, GuidingLight, GuidingLight$Illuminated, GuidingLight$WasIlluminatedTracker, GameScene, HeroIcon, Sample;

export class Radiance extends ClericSpell {
  static INSTANCE: Radiance = null;
  _Radiance(): this {
    this._ClericSpell();
    return this;
  }
  icon(): number {
    return HeroIcon.RADIANCE;
  }
  chargeUse(hero: Hero): number {
    return 2;
  }
  canCast(hero: Hero): boolean {
    return super.canCast(hero) && hero.subClass === HeroSubClass.PRIEST;
  }
  onCast(tome: HolyTome, hero: Hero): void {
    GameScene.flash$int(-2130706433);
    Sample.INSTANCE.play$Object(Assets$Sounds.BLAST);
    if (Dungeon.level.viewDistance < 6) {
      Buff.prolong(hero, $J.cls(Light), Math.fround(Dungeon.isChallenged(Challenges.DARKNESS) ? 20 : 100));
    }
    for (let mob of $J.toArrayInto(Dungeon.level.mobs.toArray(), $J.newArray(0, null))) {
      if (mob.alignment !== Char$Alignment.ALLY && Dungeon.level.heroFOV[mob.pos]) {
        if (mob.buff($J.cls(GuidingLight$Illuminated)) != null) {
          mob.damage((hero.lvl + 5) | 0, GuidingLight.INSTANCE);
        } else {
          Buff.affect$Char$Class(mob, $J.cls(GuidingLight$Illuminated));
          Buff.affect$Char$Class(mob, $J.cls(GuidingLight$WasIlluminatedTracker));
        }
        if (mob.isActive()) {
          Buff.affect$Char$Class$float(mob, $J.cls(Paralysis), 3);
        }
      }
    }
    hero.spend(1);
    hero.busy();
    hero.sprite_.operate$int(hero.pos);
    this.onSpellCast(tome, hero);
  }
  static $clinit() {
    Radiance.INSTANCE = new Radiance()._Radiance();
  }
}

$J.define(Radiance, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Radiance', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.ClericSpell', ctors: { '': '_Radiance' }, clinit: true, lazy: ['INSTANCE'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Light = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Light');
  Paralysis = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Paralysis');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  GuidingLight = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.GuidingLight');
  GuidingLight$Illuminated = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.GuidingLight$Illuminated');
  GuidingLight$WasIlluminatedTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.GuidingLight$WasIlluminatedTracker');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
