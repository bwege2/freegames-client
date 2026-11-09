// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/wands/WandOfFireblast.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../jre/index.ts';
import { DamageWand } from './DamageWand.ts';

let Assets$Sounds, Dungeon, Actor, Char$Alignment, Blob, Fire, Buff, Burning, Cripple, Paralysis, Hero, WildMagic$WildMagicTracker, CellEmitter, MagicMissile, BlastParticle, SmokeParticle, Item, Wand, Level, Terrain, Ballistica, ConeAOE, Messages, GameScene, ItemSpriteSheet, Sample, GameMath, PathFinder, Random;

export class WandOfFireblast extends DamageWand {
  cone: ConeAOE = null;
  _WandOfFireblast(): this {
    this._DamageWand();
    this.image_ = ItemSpriteSheet.WAND_FIREBOLT;
    this.collisionProperties_ = Ballistica.WONT_STOP;
    return this;
  }
  min$int(lvl: number): number {
    return Math.imul(((1 + lvl) | 0), this.chargesPerCast());
  }
  max$int(lvl: number): number {
    switch (this.chargesPerCast()) {
      case 1:
      default:
        return (2 + Math.imul(2, lvl)) | 0;
      case 2:
        return Math.imul(2, ((4 + Math.imul(2, lvl)) | 0));
      case 3:
        return Math.imul(3, ((6 + Math.imul(2, lvl)) | 0));
    }
  }
  onZap(bolt: Ballistica): void {
    let affectedChars = new ArrayList();
    let adjacentCells = new ArrayList();
    for (const $it0 = this.cone.cells.iterator(); $it0.hasNext(); ) {
      let cell = $it0.next();
      if (cell === bolt.sourcePos) {
        continue;
      }
      if (Dungeon.level.map_[cell] === Terrain.DOOR) {
        Level.set$int$int(cell, Terrain.OPEN_DOOR);
        GameScene.updateMap$int(cell);
      }
      if (Dungeon.level.adjacent(bolt.sourcePos, cell) && !(Dungeon.level.flamable[cell] || Dungeon.level.solid[cell])) {
        adjacentCells.add(cell);
        if (Dungeon.level.heaps.get(cell) != null) {
          Dungeon.level.heaps.get(cell).burn();
        }
      } else {
        GameScene.add$Blob(Blob.seed$int$int$Class(cell, (1 + this.chargesPerCast()) | 0, $J.cls(Fire)));
      }
      let ch = Actor.findChar(cell);
      if (ch != null) {
        affectedChars.add(ch);
      }
    }
    if (this.cone.cells.isEmpty()) {
      adjacentCells.add(bolt.sourcePos);
    }
    for (const $it1 = adjacentCells.iterator(); $it1.hasNext(); ) {
      let cell = $it1.next();
      for (let i of PathFinder.NEIGHBOURS8) {
        if (Dungeon.level.trueDistance((cell + i) | 0, bolt.collisionPos) < Dungeon.level.trueDistance(cell, bolt.collisionPos) && Dungeon.level.flamable[(cell + i) | 0] && Blob.volumeAt((cell + i) | 0, $J.cls(Fire)) === 0) {
          GameScene.add$Blob(Blob.seed$int$int$Class((cell + i) | 0, (1 + this.chargesPerCast()) | 0, $J.cls(Fire)));
        }
      }
    }
    for (const $it2 = affectedChars.iterator(); $it2.hasNext(); ) {
      let ch = $it2.next();
      this.wandProc(ch, this.chargesPerCast());
      ch.damage(this.damageRoll$(), this);
      if (ch.isActive()) {
        Buff.affect$Char$Class(ch, $J.cls(Burning)).reignite$Char(ch);
        switch (this.chargesPerCast()) {
          case 1:
            break;
          case 2:
            Buff.affect$Char$Class$float(ch, $J.cls(Cripple), 4);
            break;
          case 3:
            Buff.affect$Char$Class$float(ch, $J.cls(Paralysis), 4);
            break;
        }
      }
    }
  }
  onHit(staff: MagesStaff, attacker: Char, defender: Char, damage: number): void {
    let procChance = 0;
    for (let i of PathFinder.NEIGHBOURS9) {
      if ((Actor.findChar((defender.pos + i) | 0)) != null && (Actor.findChar((defender.pos + i) | 0)).buff($J.cls(Burning)) != null) {
        procChance = Math.fround(procChance + 0.25);
      } else if (Blob.volumeAt((defender.pos + i) | 0, $J.cls(Fire)) > 0) {
        procChance = Math.fround(procChance + Math.fround(0.05));
      }
    }
    procChance = Math.min(1, procChance);
    procChance = Math.fround(procChance * Wand.procChanceMultiplier(attacker));
    if (Random.Float$() < procChance) {
      let powerMulti = Math.max(1, procChance);
      let fire = Dungeon.level.blobs.get($J.cls(Fire));
      CellEmitter.center(defender.pos).burst(BlastParticle.FACTORY, 30);
      if (fire != null) {
        for (let i of PathFinder.NEIGHBOURS9) {
          (CellEmitter.get((defender.pos + i) | 0)).burst(SmokeParticle.FACTORY, 4);
          if (Blob.volumeAt((defender.pos + i) | 0, $J.cls(Fire)) > 0) {
            Dungeon.level.destroy((defender.pos + i) | 0);
            GameScene.updateMap$int((defender.pos + i) | 0);
            fire.clear((defender.pos + i) | 0);
          }
          let ch = Actor.findChar((defender.pos + i) | 0);
          if (ch != null) {
            if (ch.buff($J.cls(Burning)) != null) {
              ch.buff($J.cls(Burning)).detach();
            }
            if (ch.alignment === Char$Alignment.ENEMY) {
              ch.damage($J.roundf(Math.fround(powerMulti * (Hero.heroDamageIntRange((2 + Math.imul(2, this.buffedLvl())) | 0, (8 + Math.imul(4, this.buffedLvl())) | 0)))), this);
            }
          }
        }
      }
      Sample.INSTANCE.play$Object(Assets$Sounds.BLAST);
    }
  }
  fx(bolt: Ballistica, callback: Callback): void {
    let maxDist = (3 + Math.imul(2, this.chargesPerCast())) | 0;
    this.cone = new ConeAOE()._ConeAOE$Ballistica$float$float$int(bolt, Math.fround(maxDist), Math.fround((30 + Math.imul(20, this.chargesPerCast())) | 0), Ballistica.STOP_TARGET | Ballistica.STOP_SOLID | Ballistica.IGNORE_SOFT_SOLID);
    let longestRay = null;
    for (const $it3 = this.cone.outerRays.iterator(); $it3.hasNext(); ) {
      let ray = $it3.next();
      if (longestRay == null || ray.dist > longestRay.dist) {
        longestRay = ray;
      }
      (Item.curUser.sprite_.parent.recycle($J.cls(MagicMissile))).reset$int$Visual$int$Callback(MagicMissile.FIRE_CONE, Item.curUser.sprite_, ray.path.get(ray.dist), null);
    }
    MagicMissile.boltFromChar(Item.curUser.sprite_.parent, MagicMissile.FIRE_CONE, Item.curUser.sprite_, longestRay.path.get($J.idiv(longestRay.dist, 2)), callback);
    Sample.INSTANCE.play$Object(Assets$Sounds.ZAP);
    Sample.INSTANCE.play$Object(Assets$Sounds.BURNING);
  }
  chargesPerCast(): number {
    if (this.cursed || (this.charger != null && this.charger.target != null && this.charger.target.buff($J.cls(WildMagic$WildMagicTracker)) != null)) {
      return 1;
    }
    return $J.d2i(GameMath.gate(1, Math.fround($J.d2i(Math.ceil(Math.fround(this.curCharges * Math.fround(0.3))))), 3));
  }
  statsDesc(): string {
    if (this.levelKnown) {
      return Messages.get$Object$String$ObjectArr(this, 'stats_desc', [this.chargesPerCast(), this.min$(), this.max$()]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'stats_desc', [this.chargesPerCast(), this.min$int(0), this.max$int(0)]);
    }
  }
  upgradeStat1(level: number): string {
    return ((1 + level) | 0) + '-' + ((2 + Math.imul(2, level)) | 0);
  }
  upgradeStat2(level: number): string {
    return ((2 + Math.imul(2, level)) | 0) + '-' + Math.imul(2, ((4 + Math.imul(2, level)) | 0));
  }
  upgradeStat3(level: number): string {
    return ((3 + Math.imul(3, level)) | 0) + '-' + Math.imul(3, ((6 + Math.imul(2, level)) | 0));
  }
  staffFx(particle: MagesStaff$StaffParticle): void {
    particle.color$int(15628066);
    particle.am = 0.5;
    particle.setLifespan(Math.fround(0.6));
    particle.acc.set$float$float(0, -40);
    particle.setSize(0, 3);
    particle.shuffleXY(1.5);
  }
}

$J.define(WandOfFireblast, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfFireblast', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.DamageWand', ctors: { '': '_WandOfFireblast' }, meths: { 'max(int)': 'max$int', 'min(int)': 'min$int' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Blob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob');
  Fire = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Fire');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Burning = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Burning');
  Cripple = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Cripple');
  Paralysis = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Paralysis');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  WildMagic$WildMagicTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.mage.WildMagic$WildMagicTracker');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  MagicMissile = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile');
  BlastParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.BlastParticle');
  SmokeParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.SmokeParticle');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  Level = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  ConeAOE = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.ConeAOE');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  GameMath = $J.load('com.watabou.utils.GameMath');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
