// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/BeamingRay.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { FlavourBuff } from '../../buffs/FlavourBuff.ts';

let Assets$Sounds, Dungeon, Actor, Char, Char$Alignment, Char$Property, Buff, Buff$buffType, LifeLink, HeroSubClass, Talent, PowerOfMany, GuidingLight$Illuminated, Stasis, Stasis$StasisBuff, Mob, DirectableAlly, Beam$SunRay, ScrollOfTeleportation, Ballistica, Messages, GameScene, DungeonTilemap, BuffIndicator, HeroIcon, GLog, Sample, PathFinder;

export class BeamingRay extends TargetedClericSpell {
  static INSTANCE: BeamingRay = null;
  _BeamingRay(): this {
    this._TargetedClericSpell();
    return this;
  }
  icon(): number {
    return HeroIcon.BEAMING_RAY;
  }
  desc(): string {
    return (Messages.get$Object$String$ObjectArr(this, 'desc', [Math.imul(4, Dungeon.hero.pointsInTalent(Talent.BEAMING_RAY)), (30 + Math.imul(5, Dungeon.hero.pointsInTalent(Talent.BEAMING_RAY))) | 0])) + '\n\n' + Messages.get$Object$String$ObjectArr(this, 'charge_cost', [$J.d2i(this.chargeUse(Dungeon.hero))]);
  }
  targetingFlags(): number {
    return Ballistica.STOP_TARGET;
  }
  canCast(hero: Hero): boolean {
    return super.canCast(hero) && hero.hasTalent(Talent.BEAMING_RAY) && (PowerOfMany.getPoweredAlly() != null || Stasis.getStasisAlly() != null);
  }
  onTargetSelected(tome: HolyTome, hero: Hero, target: number): void {
    if (target == null) {
      return;
    }
    let ally = PowerOfMany.getPoweredAlly();
    if (ally == null) {
      ally = Dungeon.hero;
    }
    let telePos = target;
    if (!Dungeon.level.insideMap(telePos)) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'no_space', []), []);
      return;
    }
    if (Dungeon.level.solid[telePos] || !Dungeon.level.heroFOV[telePos] || Actor.findChar(telePos) != null) {
      telePos = -1;
      for (let i of PathFinder.NEIGHBOURS8) {
        if ((Actor.findChar((target + i) | 0)) == null && Dungeon.level.heroFOV[(target + i) | 0] && (Dungeon.level.passable[(target + i) | 0] || (ally.flying && Dungeon.level.avoid[(target + i) | 0]))) {
          if (telePos === -1 || Dungeon.level.trueDistance(telePos, ally.pos) > Dungeon.level.trueDistance((target + i) | 0, ally.pos)) {
            telePos = (target + i) | 0;
          }
        }
      }
    }
    if (telePos === -1) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'no_space', []), []);
      return;
    }
    if (ally === Dungeon.hero) {
      ally = Stasis.getStasisAlly();
    }
    let range = Math.imul(4, hero.pointsInTalent(Talent.BEAMING_RAY));
    if (Char.hasProp(ally, Char$Property.IMMOVABLE)) {
      range = $J.idiv(range, 2);
    }
    if (Dungeon.level.distance(ally.pos, telePos) > range) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'out_of_range', []), []);
      return;
    }
    let chTarget = null;
    if (Actor.findChar(target) != null && Actor.findChar(target).alignment === Char$Alignment.ENEMY) {
      chTarget = Actor.findChar(target);
      if (hero.subClass === HeroSubClass.PRIEST) {
        Buff.affect$Char$Class(chTarget, $J.cls(GuidingLight$Illuminated));
      }
    }
    if (ally === Stasis.getStasisAlly()) {
      ally.pos = telePos;
      GameScene.add$Mob(ally);
      hero.buff($J.cls(Stasis$StasisBuff)).detach();
      hero.sprite_.parent.add$Gizmo(new Beam$SunRay()._Beam$SunRay(hero.sprite_.center$(), DungeonTilemap.raisedTileCenterToWorld(telePos)));
      Sample.INSTANCE.play$Object(Assets$Sounds.RAY);
      if (ally.buff($J.cls(LifeLink)) != null) {
        Buff.prolong(Dungeon.hero, $J.cls(LifeLink), ally.buff($J.cls(LifeLink)).cooldown()).object = ally.id();
      }
    } else {
      hero.sprite_.parent.add$Gizmo(new Beam$SunRay()._Beam$SunRay(ally.sprite_.center$(), DungeonTilemap.raisedTileCenterToWorld(telePos)));
      Sample.INSTANCE.play$Object(Assets$Sounds.RAY);
    }
    hero.sprite_.zap$int(telePos);
    ScrollOfTeleportation.appear(ally, telePos);
    if (chTarget == null) {
      for (const $it0 = Actor.chars().iterator(); $it0.hasNext(); ) {
        let ch = $it0.next();
        if (ch.alignment === Char$Alignment.ENEMY && Dungeon.level.distance(ch.pos, telePos) <= 4) {
          if (chTarget == null || Dungeon.level.trueDistance(chTarget.pos, ally.pos) < Dungeon.level.trueDistance(ch.pos, ally.pos)) {
            chTarget = ch;
          }
        }
      }
    }
    if (chTarget != null) {
      if (ally instanceof DirectableAlly) {
        (ally).targetChar(chTarget);
      } else if (ally instanceof Mob) {
        (ally).aggro(chTarget);
      }
      Buff.prolong(ally, $J.cls(BeamingRay$BeamingRayBoost), BeamingRay$BeamingRayBoost.DURATION).object = chTarget.id();
    } else {
      if (ally instanceof DirectableAlly) {
        (ally).clearDefensingPos();
      }
      Buff.prolong(ally, $J.cls(BeamingRay$BeamingRayBoost), BeamingRay$BeamingRayBoost.DURATION);
    }
    hero.spendAndNext(Actor.TICK);
    Dungeon.observe$();
    GameScene.updateFog$();
    this.onSpellCast(tome, hero);
  }
  static $clinit() {
    BeamingRay.INSTANCE = new BeamingRay()._BeamingRay();
  }
}

export class BeamingRay$BeamingRayBoost extends FlavourBuff {
  object: number = 0;
  static readonly DURATION: number = 10;
  static readonly OBJECT: string = 'object';
  _BeamingRay$BeamingRayBoost(): this {
    this._FlavourBuff();
    this.type_ = Buff$buffType.POSITIVE;
    this.object = 0;
    return this;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(BeamingRay$BeamingRayBoost.OBJECT, this.object);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.object = bundle.getInt(BeamingRay$BeamingRayBoost.OBJECT);
  }
  icon(): number {
    return BuffIndicator.HOLY_WEAPON;
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(BeamingRay$BeamingRayBoost.DURATION - this.visualcooldown())) / BeamingRay$BeamingRayBoost.DURATION));
  }
}

$J.define(BeamingRay, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.BeamingRay', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.TargetedClericSpell', ctors: { '': '_BeamingRay' }, clinit: true, lazy: ['INSTANCE'] });
$J.define(BeamingRay$BeamingRayBoost, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.BeamingRay$BeamingRayBoost', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_BeamingRay$BeamingRayBoost' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  LifeLink = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.LifeLink');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  PowerOfMany = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.PowerOfMany');
  GuidingLight$Illuminated = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.GuidingLight$Illuminated');
  Stasis = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Stasis');
  Stasis$StasisBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Stasis$StasisBuff');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  DirectableAlly = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.DirectableAlly');
  Beam$SunRay = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Beam$SunRay');
  ScrollOfTeleportation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTeleportation');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
});
