// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/Sunray.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Buff } from '../../buffs/Buff.ts';
import { FlavourBuff } from '../../buffs/FlavourBuff.ts';

let Assets$Sounds, Dungeon, Actor, Char, Char$Property, Blindness, Paralysis, Hero, HeroSubClass, Talent, GuidingLight$Illuminated, Beam$SunRay, Wand, Ballistica, Messages, DungeonTilemap, HeroIcon, QuickSlotButton, GLog, Sample;

export class Sunray extends TargetedClericSpell {
  static INSTANCE: Sunray = null;
  _Sunray(): this {
    this._TargetedClericSpell();
    return this;
  }
  icon(): number {
    return HeroIcon.SUNRAY;
  }
  desc(): string {
    let min = Dungeon.hero.pointsInTalent(Talent.SUNRAY) === 2 ? 6 : 4;
    let max = Dungeon.hero.pointsInTalent(Talent.SUNRAY) === 2 ? 12 : 8;
    let dur = Dungeon.hero.pointsInTalent(Talent.SUNRAY) === 2 ? 6 : 4;
    return Messages.get$Object$String$ObjectArr(this, 'desc', [min, max, dur]) + '\n\n' + Messages.get$Object$String$ObjectArr(this, 'charge_cost', [$J.d2i(this.chargeUse(Dungeon.hero))]);
  }
  canCast(hero: Hero): boolean {
    return super.canCast(hero) && hero.hasTalent(Talent.SUNRAY);
  }
  onTargetSelected(tome: HolyTome, hero: Hero, target: number): void {
    if (target == null) {
      return;
    }
    let aim = new Ballistica()._Ballistica(hero.pos, target, this.targetingFlags());
    if (Actor.findChar(aim.collisionPos) === hero) {
      GLog.i(Messages.get$Class$String$ObjectArr($J.cls(Wand), 'self_target', []), []);
      return;
    }
    if (Actor.findChar(aim.collisionPos) != null) {
      QuickSlotButton.target(Actor.findChar(aim.collisionPos));
    } else {
      QuickSlotButton.target(Actor.findChar(target));
    }
    hero.busy();
    Sample.INSTANCE.play$Object(Assets$Sounds.RAY);
    hero.sprite_.zap$int(target);
    hero.sprite_.parent.add$Gizmo(new Beam$SunRay()._Beam$SunRay(hero.sprite_.center$(), DungeonTilemap.raisedTileCenterToWorld(aim.collisionPos)));
    Sample.INSTANCE.play$Object(Assets$Sounds.RAY);
    let ch = Actor.findChar(aim.collisionPos);
    if (ch != null) {
      ch.sprite_.burst(-188, 5);
      if (Char.hasProp(ch, Char$Property.UNDEAD) || Char.hasProp(ch, Char$Property.DEMONIC)) {
        if (hero.pointsInTalent(Talent.SUNRAY) === 2) {
          ch.damage(12, this);
        } else {
          ch.damage(8, this);
        }
      } else {
        if (hero.pointsInTalent(Talent.SUNRAY) === 2) {
          ch.damage(Hero.heroDamageIntRange(6, 12), this);
        } else {
          ch.damage(Hero.heroDamageIntRange(4, 8), this);
        }
      }
      if (ch.isAlive()) {
        if (ch.buff($J.cls(Blindness)) != null && ch.buff($J.cls(Sunray$SunRayRecentlyBlindedTracker)) != null) {
          Buff.prolong(ch, $J.cls(Paralysis), Math.fround(2 + Math.fround(2 * hero.pointsInTalent(Talent.SUNRAY))));
          ch.buff($J.cls(Sunray$SunRayRecentlyBlindedTracker)).detach();
        } else if (ch.buff($J.cls(Sunray$SunRayUsedTracker)) == null) {
          Buff.prolong(ch, $J.cls(Blindness), Math.fround(2 + Math.fround(2 * hero.pointsInTalent(Talent.SUNRAY))));
          Buff.prolong(ch, $J.cls(Sunray$SunRayRecentlyBlindedTracker), Math.fround(2 + Math.fround(2 * hero.pointsInTalent(Talent.SUNRAY))));
          Buff.affect$Char$Class(ch, $J.cls(Sunray$SunRayUsedTracker));
        }
        if (hero.subClass === HeroSubClass.PRIEST) {
          Buff.affect$Char$Class(ch, $J.cls(GuidingLight$Illuminated));
        }
      }
    }
    hero.spend(1);
    hero.next();
    this.onSpellCast(tome, hero);
  }
  static $clinit() {
    Sunray.INSTANCE = new Sunray()._Sunray();
  }
}

export class Sunray$SunRayUsedTracker extends Buff {
  _Sunray$SunRayUsedTracker(): this {
    this._Buff();
    return this;
  }
}

export class Sunray$SunRayRecentlyBlindedTracker extends FlavourBuff {
  _Sunray$SunRayRecentlyBlindedTracker(): this {
    this._FlavourBuff();
    return this;
  }
}

$J.define(Sunray, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Sunray', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.TargetedClericSpell', ctors: { '': '_Sunray' }, clinit: true, lazy: ['INSTANCE'] });
$J.define(Sunray$SunRayUsedTracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Sunray$SunRayUsedTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Sunray$SunRayUsedTracker' } });
$J.define(Sunray$SunRayRecentlyBlindedTracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Sunray$SunRayRecentlyBlindedTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Sunray$SunRayRecentlyBlindedTracker' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Blindness = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Blindness');
  Paralysis = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Paralysis');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  GuidingLight$Illuminated = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.GuidingLight$Illuminated');
  Beam$SunRay = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Beam$SunRay');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  QuickSlotButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.QuickSlotButton');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
