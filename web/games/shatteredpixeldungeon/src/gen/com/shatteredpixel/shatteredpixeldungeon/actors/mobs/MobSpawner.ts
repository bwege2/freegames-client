// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/MobSpawner.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Arrays, HashMap } from '../../../../../../jre/index.ts';
import { Actor } from '../Actor.ts';

let Dungeon, Acidic, Albino, ArmoredBrute, Bandit, Bat, Brute, CausticSlime, Crab, DM100, DM200, DM201, Elemental, Elemental$ChaosElemental, Eye, Ghoul, Gnoll, GnollExile, Golem, Guard, HermitCrab, Monk, Necromancer, Rat, Scorpio, Senior, Shaman, Skeleton, Slime, Snake, SpectralNecromancer, Spinner, Succubus, Swarm, Thief, Warlock, RatSkull, Random;

export class MobSpawner extends Actor {
  static RARE_ALTS: HashMap<JClass<Mob>, JClass<Mob>> = null;
  _MobSpawner(): this {
    this._Actor();
    this.actPriority = Actor.BUFF_PRIO;
    return this;
  }
  act(): boolean {
    if (Dungeon.level.mobCount() < Dungeon.level.mobLimit()) {
      if (Dungeon.level.spawnMob(12)) {
        this.spend(Dungeon.level.respawnCooldown());
      } else {
        this.spend(Actor.TICK);
      }
    } else {
      this.spend(Dungeon.level.respawnCooldown());
    }
    return true;
  }
  resetCooldown(): void {
    this.spend(Math.fround(-this.cooldown()));
    this.spend(Dungeon.level.respawnCooldown());
  }
  static getMobRotation(depth: number): ArrayList<JClass<Mob>> {
    let mobs = MobSpawner.standardMobRotation(depth);
    MobSpawner.addRareMobs(depth, mobs);
    MobSpawner.swapMobAlts(mobs);
    Random.shuffle$List(mobs);
    return mobs;
  }
  static standardMobRotation(depth: number): ArrayList<JClass<Mob>> {
    switch (depth) {
      case 1:
      default:
        return new ArrayList(Arrays.asList($J.cls(Rat), $J.cls(Rat), $J.cls(Rat), $J.cls(Snake)));
      case 2:
        return new ArrayList(Arrays.asList($J.cls(Rat), $J.cls(Rat), $J.cls(Snake), $J.cls(Gnoll), $J.cls(Gnoll)));
      case 3:
        return new ArrayList(Arrays.asList($J.cls(Rat), $J.cls(Snake), $J.cls(Gnoll), $J.cls(Gnoll), $J.cls(Gnoll), $J.cls(Swarm), $J.cls(Crab)));
      case 4:
      case 5:
        return new ArrayList(Arrays.asList($J.cls(Gnoll), $J.cls(Swarm), $J.cls(Crab), $J.cls(Crab), $J.cls(Slime), $J.cls(Slime)));
      case 6:
        return new ArrayList(Arrays.asList($J.cls(Skeleton), $J.cls(Skeleton), $J.cls(Skeleton), $J.cls(Thief), $J.cls(Swarm)));
      case 7:
        return new ArrayList(Arrays.asList($J.cls(Skeleton), $J.cls(Skeleton), $J.cls(Skeleton), $J.cls(Thief), $J.cls(DM100), $J.cls(Guard)));
      case 8:
        return new ArrayList(Arrays.asList($J.cls(Skeleton), $J.cls(Skeleton), $J.cls(Thief), $J.cls(DM100), $J.cls(DM100), $J.cls(Guard), $J.cls(Guard), $J.cls(Necromancer)));
      case 9:
      case 10:
        return new ArrayList(Arrays.asList($J.cls(Skeleton), $J.cls(Thief), $J.cls(DM100), $J.cls(DM100), $J.cls(Guard), $J.cls(Guard), $J.cls(Necromancer), $J.cls(Necromancer)));
      case 11:
        return new ArrayList(Arrays.asList($J.cls(Bat), $J.cls(Bat), $J.cls(Bat), $J.cls(Brute), Shaman.random()));
      case 12:
        return new ArrayList(Arrays.asList($J.cls(Bat), $J.cls(Bat), $J.cls(Brute), $J.cls(Brute), Shaman.random(), $J.cls(Spinner)));
      case 13:
        return new ArrayList(Arrays.asList($J.cls(Bat), $J.cls(Brute), $J.cls(Brute), Shaman.random(), Shaman.random(), $J.cls(Spinner), $J.cls(Spinner), $J.cls(DM200)));
      case 14:
      case 15:
        return new ArrayList(Arrays.asList($J.cls(Bat), $J.cls(Brute), Shaman.random(), Shaman.random(), $J.cls(Spinner), $J.cls(Spinner), $J.cls(DM200), $J.cls(DM200)));
      case 16:
        return new ArrayList(Arrays.asList($J.cls(Ghoul), $J.cls(Ghoul), $J.cls(Ghoul), Elemental.random(), $J.cls(Warlock)));
      case 17:
        return new ArrayList(Arrays.asList($J.cls(Ghoul), Elemental.random(), Elemental.random(), $J.cls(Warlock), $J.cls(Monk)));
      case 18:
        return new ArrayList(Arrays.asList($J.cls(Ghoul), Elemental.random(), $J.cls(Warlock), $J.cls(Warlock), $J.cls(Monk), $J.cls(Monk), $J.cls(Golem)));
      case 19:
      case 20:
        return new ArrayList(Arrays.asList(Elemental.random(), $J.cls(Warlock), $J.cls(Warlock), $J.cls(Monk), $J.cls(Monk), $J.cls(Golem), $J.cls(Golem), $J.cls(Golem)));
      case 21:
        return new ArrayList(Arrays.asList($J.cls(Succubus), $J.cls(Succubus), $J.cls(Eye)));
      case 22:
        return new ArrayList(Arrays.asList($J.cls(Succubus), $J.cls(Eye)));
      case 23:
        return new ArrayList(Arrays.asList($J.cls(Succubus), $J.cls(Eye), $J.cls(Eye), $J.cls(Scorpio)));
      case 24:
      case 25:
      case 26:
        return new ArrayList(Arrays.asList($J.cls(Succubus), $J.cls(Eye), $J.cls(Eye), $J.cls(Scorpio), $J.cls(Scorpio), $J.cls(Scorpio)));
    }
  }
  static addRareMobs(depth: number, rotation: ArrayList<JClass<Mob>>): void {
    switch (depth) {
      default:
        return;
      case 4:
        if (Random.Float$() < Math.fround(0.025)) {
          rotation.add($J.cls(Thief));
        }
        return;
      case 9:
        if (Random.Float$() < Math.fround(0.025)) {
          rotation.add($J.cls(Bat));
        }
        return;
      case 14:
        if (Random.Float$() < Math.fround(0.025)) {
          rotation.add($J.cls(Ghoul));
        }
        return;
      case 19:
        if (Random.Float$() < Math.fround(0.025)) {
          rotation.add($J.cls(Succubus));
        }
        return;
    }
  }
  static swapMobAlts(rotation: ArrayList<JClass<Mob>>): void {
    let altChance = Math.fround(Math.fround(1 / 50) * RatSkull.exoticChanceMultiplier$());
    for (let i = 0; i < rotation.size(); i++) {
      if (Random.Float$() < altChance) {
        let cl = rotation.get(i);
        let alt = MobSpawner.RARE_ALTS.get(cl);
        if (alt != null) {
          rotation.set(i, alt);
        }
      }
    }
  }
  static $clinit() {
    MobSpawner.RARE_ALTS = new HashMap();
    MobSpawner.RARE_ALTS.put($J.cls(Rat), $J.cls(Albino));
    MobSpawner.RARE_ALTS.put($J.cls(Gnoll), $J.cls(GnollExile));
    MobSpawner.RARE_ALTS.put($J.cls(Crab), $J.cls(HermitCrab));
    MobSpawner.RARE_ALTS.put($J.cls(Slime), $J.cls(CausticSlime));
    MobSpawner.RARE_ALTS.put($J.cls(Thief), $J.cls(Bandit));
    MobSpawner.RARE_ALTS.put($J.cls(Necromancer), $J.cls(SpectralNecromancer));
    MobSpawner.RARE_ALTS.put($J.cls(Brute), $J.cls(ArmoredBrute));
    MobSpawner.RARE_ALTS.put($J.cls(DM200), $J.cls(DM201));
    MobSpawner.RARE_ALTS.put($J.cls(Monk), $J.cls(Senior));
    MobSpawner.RARE_ALTS.put($J.cls(Elemental), $J.cls(Elemental$ChaosElemental));
    MobSpawner.RARE_ALTS.put($J.cls(Scorpio), $J.cls(Acidic));
  }
}

$J.define(MobSpawner, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.MobSpawner', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.Actor', ctors: { '': '_MobSpawner' }, clinit: true, lazy: ['RARE_ALTS'] });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Acidic = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Acidic');
  Albino = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Albino');
  ArmoredBrute = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.ArmoredBrute');
  Bandit = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Bandit');
  Bat = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Bat');
  Brute = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Brute');
  CausticSlime = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.CausticSlime');
  Crab = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Crab');
  DM100 = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DM100');
  DM200 = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DM200');
  DM201 = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DM201');
  Elemental = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Elemental');
  Elemental$ChaosElemental = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Elemental$ChaosElemental');
  Eye = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Eye');
  Ghoul = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Ghoul');
  Gnoll = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Gnoll');
  GnollExile = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollExile');
  Golem = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Golem');
  Guard = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Guard');
  HermitCrab = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.HermitCrab');
  Monk = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Monk');
  Necromancer = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Necromancer');
  Rat = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Rat');
  Scorpio = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Scorpio');
  Senior = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Senior');
  Shaman = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Shaman');
  Skeleton = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Skeleton');
  Slime = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Slime');
  Snake = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Snake');
  SpectralNecromancer = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.SpectralNecromancer');
  Spinner = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Spinner');
  Succubus = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Succubus');
  Swarm = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Swarm');
  Thief = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Thief');
  Warlock = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Warlock');
  RatSkull = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.RatSkull');
  Random = $J.load('com.watabou.utils.Random');
});
