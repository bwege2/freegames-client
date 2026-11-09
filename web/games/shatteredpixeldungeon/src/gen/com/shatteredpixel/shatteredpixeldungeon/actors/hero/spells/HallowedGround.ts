// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/HallowedGround.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../../jre/index.ts';
import { TargetedClericSpell } from './TargetedClericSpell.ts';
import { Blob } from '../../blobs/Blob.ts';
import { CounterBuff } from '../../buffs/CounterBuff.ts';

let Assets$Sounds, Dungeon, Actor, Char$Alignment, Fire, Barrier, Buff, Cripple, Regeneration, Roots, Talent, PowerOfMany, GuidingLight$Illuminated, LifeLinkSpell$LifeLinkSpellBuff, CellEmitter, FloatingText, LeafParticle, ShaftParticle, Level, Terrain, Ballistica, Messages, GameScene, CharSprite, HeroIcon, GLog, Sample, BArray, PathFinder, Random;

export class HallowedGround extends TargetedClericSpell {
  static INSTANCE: HallowedGround = null;
  _HallowedGround(): this {
    this._TargetedClericSpell();
    return this;
  }
  icon(): number {
    return HeroIcon.HALLOWED_GROUND;
  }
  chargeUse(hero: Hero): number {
    return 2;
  }
  targetingFlags(): number {
    return Ballistica.STOP_TARGET;
  }
  canCast(hero: Hero): boolean {
    return super.canCast(hero) && hero.hasTalent(Talent.HALLOWED_GROUND);
  }
  onTargetSelected(tome: HolyTome, hero: Hero, target: number): void {
    if (target == null) {
      return;
    }
    if (Dungeon.level.solid[target] || !Dungeon.level.heroFOV[target]) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'invalid_target', []), []);
      return;
    }
    let affected = new ArrayList();
    PathFinder.buildDistanceMap$int$booleanArr$int(target, BArray.not(Dungeon.level.solid, null), hero.pointsInTalent(Talent.HALLOWED_GROUND));
    for (let i = 0; i < Dungeon.level.length(); i++) {
      if (PathFinder.distance[i] !== 2147483647) {
        let c = Dungeon.level.map_[i];
        if (c === Terrain.EMPTY || c === Terrain.EMBERS || c === Terrain.EMPTY_DECO) {
          Level.set$int$int(i, Terrain.GRASS);
          GameScene.updateMap$int(i);
          CellEmitter.get(i).burst(LeafParticle.LEVEL_SPECIFIC, 2);
        }
        GameScene.add$Blob(Blob.seed$int$int$Class(i, 20, $J.cls(HallowedGround$HallowedTerrain)));
        CellEmitter.get(i).burst(ShaftParticle.FACTORY, 2);
        let ch = Actor.findChar(i);
        if (ch != null) {
          affected.add(ch);
        }
      }
    }
    let ally = PowerOfMany.getPoweredAlly();
    if (ally != null && ally.buff($J.cls(LifeLinkSpell$LifeLinkSpellBuff)) != null) {
      if (affected.contains(hero) && !affected.contains(ally)) {
        affected.add(ally);
      } else if (!affected.contains(hero) && affected.contains(ally)) {
        affected.add(hero);
      }
    }
    for (const $it0 = affected.iterator(); $it0.hasNext(); ) {
      let ch = $it0.next();
      this.affectChar(ch);
    }
    Sample.INSTANCE.play$Object(Assets$Sounds.MELD);
    hero.sprite_.zap$int(target);
    hero.spendAndNext(1);
    this.onSpellCast(tome, hero);
  }
  affectChar(ch: Char): void {
    if (ch.alignment === Char$Alignment.ALLY) {
      if (ch === Dungeon.hero || ch.HP === ch.HT) {
        let barrierToGive = Math.min(15, (30 - ch.shielding()) | 0);
        Buff.affect$Char$Class(ch, $J.cls(Barrier)).incShield$int(barrierToGive);
        ch.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(barrierToGive), FloatingText.SHIELDING, []);
      } else {
        let barrier = (15 - (ch.HT - ch.HP)) | 0;
        barrier = Math.max(barrier, 0);
        ch.HP = (ch.HP + (15 - barrier)) | 0;
        ch.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String((15 - barrier) | 0), FloatingText.HEALING, []);
        if (barrier > 0) {
          Buff.affect$Char$Class(ch, $J.cls(Barrier)).incShield$int(barrier);
          ch.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(barrier), FloatingText.SHIELDING, []);
        }
      }
    } else if (!ch.flying) {
      Buff.affect$Char$Class(ch, $J.cls(GuidingLight$Illuminated));
      Buff.affect$Char$Class$float(ch, $J.cls(Roots), 2);
    }
  }
  desc(): string {
    let area = (1 + Math.imul(2, Dungeon.hero.pointsInTalent(Talent.HALLOWED_GROUND))) | 0;
    return Messages.get$Object$String$ObjectArr(this, 'desc', [area]) + '\n\n' + Messages.get$Object$String$ObjectArr(this, 'charge_cost', [$J.d2i(this.chargeUse(Dungeon.hero))]);
  }
  static $clinit() {
    HallowedGround.INSTANCE = new HallowedGround()._HallowedGround();
  }
}

export class HallowedGround$HallowedTerrain extends Blob {
  _HallowedGround$HallowedTerrain(): this {
    this._Blob();
    return this;
  }
  evolve(): void {
    let cell: number;
    let fire = Dungeon.level.blobs.get($J.cls(Fire));
    let affected = new ArrayList();
    let chance = (10 + Math.imul(10, Dungeon.hero.pointsInTalent(Talent.HALLOWED_GROUND))) | 0;
    for (let i = (this.area.left_ - 1) | 0; i <= this.area.right_; i++) {
      for (let j = (this.area.top_ - 1) | 0; j <= this.area.bottom_; j++) {
        cell = (i + Math.imul(j, Dungeon.level.width())) | 0;
        if (this.cur[cell] > 0) {
          if (fire != null && fire.volume_ > 0 && fire.cur[cell] > 0) {
            this.off[cell] = this.cur[cell] = 0;
            continue;
          }
          let c = Dungeon.level.map_[cell];
          if (c === Terrain.GRASS && Dungeon.level.plants.get(c) == null) {
            if (Random.Int$int(chance) === 0) {
              if (!Regeneration.regenOn() || (Dungeon.hero.buff($J.cls(HallowedGround$HallowedFurrowTracker)) != null && Dungeon.hero.buff($J.cls(HallowedGround$HallowedFurrowTracker)).count() > Math.fround(100))) {
                Level.set$int$int(cell, Terrain.FURROWED_GRASS);
              } else {
                Level.set$int$int(cell, Terrain.HIGH_GRASS);
              }
              GameScene.updateMap$int(cell);
              CellEmitter.get(cell).burst(LeafParticle.LEVEL_SPECIFIC, 5);
            }
          } else if (c === Terrain.EMPTY || c === Terrain.EMBERS || c === Terrain.EMPTY_DECO) {
            Level.set$int$int(cell, Terrain.GRASS);
            GameScene.updateMap$int(cell);
            CellEmitter.get(cell).burst(LeafParticle.LEVEL_SPECIFIC, 2);
          }
          let ch = Actor.findChar(cell);
          if (ch != null) {
            affected.add(ch);
          }
          this.off[cell] = (this.cur[cell] - 1) | 0;
          this.volume_ = (this.volume_ + this.off[cell]) | 0;
        } else {
          this.off[cell] = 0;
        }
      }
    }
    if (this.volume_ > 0) {
      Buff.count(Dungeon.hero, $J.cls(HallowedGround$HallowedFurrowTracker), 1);
    }
    let ally = PowerOfMany.getPoweredAlly();
    if (ally != null && ally.buff($J.cls(LifeLinkSpell$LifeLinkSpellBuff)) != null) {
      if (affected.contains(Dungeon.hero) && !affected.contains(ally)) {
        affected.add(ally);
      } else if (!affected.contains(Dungeon.hero) && affected.contains(ally)) {
        affected.add(Dungeon.hero);
      }
    }
    for (const $it1 = affected.iterator(); $it1.hasNext(); ) {
      let ch = $it1.next();
      this.affectChar(ch);
    }
  }
  affectChar(ch: Char): void {
    if (ch.alignment === Char$Alignment.ALLY) {
      if (ch === Dungeon.hero || ch.HP === ch.HT) {
        Buff.affect$Char$Class(ch, $J.cls(Barrier)).incShield$int(1);
        ch.sprite_.showStatusWithIcon(CharSprite.POSITIVE, '1', FloatingText.SHIELDING, []);
      } else {
        ch.HP++;
        ch.sprite_.showStatusWithIcon(CharSprite.POSITIVE, '1', FloatingText.HEALING, []);
      }
    } else if (!ch.flying && ch.buff($J.cls(Roots)) == null) {
      Buff.prolong(ch, $J.cls(Cripple), 1);
    }
  }
  use(emitter: BlobEmitter): void {
    super.use(emitter);
    emitter.pour(ShaftParticle.FACTORY, 1);
  }
  tileDesc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', []);
  }
}

export class HallowedGround$HallowedFurrowTracker extends CounterBuff {
  _HallowedGround$HallowedFurrowTracker(): this {
    this._CounterBuff();
    this.revivePersists = true;
    return this;
  }
}

$J.define(HallowedGround, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.HallowedGround', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.TargetedClericSpell', ctors: { '': '_HallowedGround' }, clinit: true, lazy: ['INSTANCE'] });
$J.define(HallowedGround$HallowedTerrain, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.HallowedGround$HallowedTerrain', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob', ctors: { '': '_HallowedGround$HallowedTerrain' } });
$J.define(HallowedGround$HallowedFurrowTracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.HallowedGround$HallowedFurrowTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.CounterBuff', ctors: { '': '_HallowedGround$HallowedFurrowTracker' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Fire = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Fire');
  Barrier = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Barrier');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Cripple = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Cripple');
  Regeneration = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Regeneration');
  Roots = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Roots');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  PowerOfMany = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.PowerOfMany');
  GuidingLight$Illuminated = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.GuidingLight$Illuminated');
  LifeLinkSpell$LifeLinkSpellBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.LifeLinkSpell$LifeLinkSpellBuff');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  LeafParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.LeafParticle');
  ShaftParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShaftParticle');
  Level = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
