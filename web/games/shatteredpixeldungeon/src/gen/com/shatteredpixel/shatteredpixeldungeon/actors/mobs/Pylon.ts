// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Pylon.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Mob } from './Mob.ts';

let Assets$Sounds, Challenges, Dungeon, Statistics, Actor, Char$Alignment, Char$Property, Electricity, LockedFloor, DM300, CellEmitter, Lightning, SparkParticle, Messages, PylonSprite, DungeonTilemap, GLog, Sample, PathFinder, Random;

export class Pylon extends Mob {
  targetNeighbor: number = 0;
  static readonly ALIGNMENT: string = 'alignment';
  static readonly TARGET_NEIGHBOUR: string = 'target_neighbour';
  _Pylon(): this {
    this._Mob();
    this.spriteClass = $J.cls(PylonSprite);
    this.HP = this.HT = Dungeon.isChallenged(Challenges.STRONGER_BOSSES) ? 80 : 50;
    this.maxLvl = -2;
    this.properties_.add(Char$Property.MINIBOSS);
    this.properties_.add(Char$Property.BOSS_MINION);
    this.properties_.add(Char$Property.INORGANIC);
    this.properties_.add(Char$Property.ELECTRIC);
    this.properties_.add(Char$Property.IMMOVABLE);
    this.properties_.add(Char$Property.STATIC);
    this.state_ = this.PASSIVE;
    this.alignment = Char$Alignment.NEUTRAL;
    this.targetNeighbor = Random.Int$int(8);
    return this;
  }
  act(): boolean {
    if (this.fieldOfView == null || this.fieldOfView.length !== Dungeon.level.length()) {
      this.fieldOfView = $J.newArray(Dungeon.level.length(), false);
    }
    Dungeon.level.updateFieldOfView(this, this.fieldOfView);
    this.throwItems();
    this.sprite_.hideAlert();
    this.sprite_.hideLost();
    this.enemy = this.chooseEnemy();
    this.enemySeen = this.enemy != null && this.enemy.isAlive() && this.fieldOfView[this.enemy.pos] && this.enemy.invisible <= 0;
    if (this.alignment === Char$Alignment.NEUTRAL) {
      this.spend(Actor.TICK);
      return true;
    }
    let shockCells = new ArrayList();
    shockCells.add((this.pos + PathFinder.CIRCLE8[this.targetNeighbor]) | 0);
    if (Dungeon.isChallenged(Challenges.STRONGER_BOSSES)) {
      shockCells.add((this.pos + PathFinder.CIRCLE8[((this.targetNeighbor + 3) | 0) % 8]) | 0);
      shockCells.add((this.pos + PathFinder.CIRCLE8[((this.targetNeighbor + 5) | 0) % 8]) | 0);
    } else {
      shockCells.add((this.pos + PathFinder.CIRCLE8[((this.targetNeighbor + 4) | 0) % 8]) | 0);
    }
    this.sprite_.flash();
    let visible = Dungeon.level.heroFOV[this.pos];
    for (const $it0 = shockCells.iterator(); $it0.hasNext(); ) {
      let cell = $it0.next();
      if (Dungeon.level.heroFOV[cell]) {
        visible = true;
      }
    }
    if (visible) {
      for (const $it1 = shockCells.iterator(); $it1.hasNext(); ) {
        let cell = $it1.next();
        this.sprite_.parent.add$Gizmo(new Lightning()._Lightning$PointF$PointF$Callback(this.sprite_.center$(), DungeonTilemap.raisedTileCenterToWorld(cell), null));
        CellEmitter.get(cell).burst(SparkParticle.FACTORY, 3);
      }
      Sample.INSTANCE.play$Object(Assets$Sounds.LIGHTNING);
    }
    for (const $it2 = shockCells.iterator(); $it2.hasNext(); ) {
      let cell = $it2.next();
      this.shockChar(Actor.findChar(cell));
    }
    this.targetNeighbor = ((this.targetNeighbor + 1) | 0) % 8;
    this.spend(Actor.TICK);
    return true;
  }
  shockChar(ch: Char): void {
    if (ch != null && !(ch instanceof DM300)) {
      ch.sprite_.flash();
      ch.damage(Random.NormalIntRange(10, 20), new Electricity()._Electricity());
      if (ch === Dungeon.hero) {
        Statistics.qualifiedForBossChallengeBadge = false;
        Statistics.bossScores[2] = (Statistics.bossScores[2] - 100) | 0;
        if (!ch.isAlive()) {
          Dungeon.fail($J.cls(DM300));
          GLog.n(Messages.get$Class$String$ObjectArr($J.cls(Electricity), 'ondeath', []), []);
        }
      }
    }
  }
  activate(): void {
    this.alignment = Char$Alignment.ENEMY;
    this.state_ = this.HUNTING;
    (this.sprite_).activate();
  }
  sprite(): CharSprite {
    let p = super.sprite();
    if (this.alignment !== Char$Alignment.NEUTRAL) {
      p.activate();
    }
    return p;
  }
  beckon(cell: number): void {
  }
  description(): string {
    if (this.alignment === Char$Alignment.NEUTRAL) {
      return Messages.get$Object$String$ObjectArr(this, 'desc_inactive', []);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'desc_active', []);
    }
  }
  interact(c: Char): boolean {
    return true;
  }
  add(buff: Buff): boolean {
    if (this.alignment !== Char$Alignment.NEUTRAL) {
      return super.add(buff);
    }
    return false;
  }
  isInvulnerable(effect: JClass): boolean {
    return this.alignment === Char$Alignment.NEUTRAL || super.isInvulnerable(effect);
  }
  damage(dmg: number, src: any): void {
    if (dmg >= 15) {
      dmg = (14 + $J.idiv($J.d2i(((Math.sqrt((Math.imul(8, ((dmg - 14) | 0)) + 1) | 0)) - 1)), 2)) | 0;
    }
    let lock = Dungeon.hero.buff($J.cls(LockedFloor));
    if (lock != null && !this.isImmune($J.getClass(src)) && !this.isInvulnerable($J.getClass(src))) {
      if (Dungeon.isChallenged(Challenges.STRONGER_BOSSES)) {
        lock.addTime(Math.fround(dmg / 2));
      } else {
        lock.addTime(Math.fround(dmg));
      }
    }
    super.damage(dmg, src);
  }
  die(cause: any): void {
    super.die(cause);
    (Dungeon.level).eliminatePylon();
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$Enum(Pylon.ALIGNMENT, this.alignment);
    bundle.put$String$int(Pylon.TARGET_NEIGHBOUR, this.targetNeighbor);
  }
  restoreFromBundle(bundle: Bundle): void {
    this.alignment = bundle.getEnum(Pylon.ALIGNMENT, $J.cls(Char$Alignment));
    super.restoreFromBundle(bundle);
    this.targetNeighbor = bundle.getInt(Pylon.TARGET_NEIGHBOUR);
  }
}

$J.define(Pylon, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Pylon', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_Pylon' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Electricity = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Electricity');
  LockedFloor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.LockedFloor');
  DM300 = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DM300');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Lightning = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Lightning');
  SparkParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.SparkParticle');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  PylonSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.PylonSprite');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
