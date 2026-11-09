// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/traps/DistortionTrap.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Trap } from './Trap.ts';

let Dungeon, Actor, Char, Char$Alignment, Char$Property, Hero, Mimic, MobSpawner, Piranha, Statue, Wraith, RatKing, ScrollOfTeleportation, Bestiary, GameScene, PathFinder, Random, Reflection;

export class DistortionTrap extends Trap {
  static readonly DELAY: number = 2;
  _DistortionTrap(): this {
    this._Trap();
    this.color_ = Trap.TEAL;
    this.shape = Trap.LARGE_DOT;
    return this;
  }
  activate(): void {
    let nMobs = 3;
    if (Random.Int$int(2) === 0) {
      nMobs++;
      if (Random.Int$int(2) === 0) {
        nMobs++;
      }
    }
    let candidates = new ArrayList();
    for (let i = 0; i < PathFinder.NEIGHBOURS8.length; i++) {
      let p = (this.pos + PathFinder.NEIGHBOURS8[i]) | 0;
      if (Actor.findChar(p) == null && (Dungeon.level.passable[p] || Dungeon.level.avoid[p])) {
        candidates.add(p);
      }
    }
    let respawnPoints = new ArrayList();
    while (nMobs > 0 && candidates.size() > 0) {
      let index = Random.index(candidates);
      respawnPoints.add(candidates.removeAt(index));
      nMobs--;
    }
    let mobs = new ArrayList();
    let summoned = 0;
    for (const $it0 = respawnPoints.iterator(); $it0.hasNext(); ) {
      let point = $it0.next();
      summoned++;
      let mob: Mob;
      {
        let floor: number;
        switch (summoned) {
          case 1:
            if (Dungeon.depth !== 5 && Random.Int$int(100) === 0) {
              mob = new RatKing()._RatKing();
              break;
            }
          case 3:
          case 5:
          default:
            do {
              floor = Random.Int$int(25);
            } while (Dungeon.bossLevel$int(floor));
            mob = Reflection.newInstance(MobSpawner.getMobRotation(floor).get(0));
            break;
          case 2:
            switch (Random.Int$int(4)) {
              case 0:
              default:
                Wraith.spawnAt$int(point);
                continue;
              case 1:
                mob = Piranha.random();
                break;
              case 2:
                mob = Mimic.spawnAt$int$boolean$ItemArr(point, false, []);
                (mob).stopHiding();
                mob.alignment = Char$Alignment.ENEMY;
                break;
              case 3:
                mob = Statue.random$boolean(false);
                break;
            }
            break;
          case 4:
            mob = Reflection.newInstance(Random.element$Collection(MobSpawner.RARE_ALTS.values()));
            break;
        }
      }
      if (Char.hasProp(mob, Char$Property.LARGE) && !Dungeon.level.openSpace[point]) {
        continue;
      }
      mob.maxLvl = (Hero.MAX_LEVEL - 1) | 0;
      if (mob.state_ !== mob.PASSIVE) {
        mob.state_ = mob.WANDERING;
      }
      mob.pos = point;
      GameScene.add$Mob$float(mob, DistortionTrap.DELAY);
      mobs.add(mob);
    }
    let t: Trap;
    for (const $it1 = mobs.iterator(); $it1.hasNext(); ) {
      let mob = $it1.next();
      if ((t = Dungeon.level.traps.get(mob.pos)) != null && t.active) {
        if (t.disarmedByActivation) {
          t.disarm();
        }
        t.reveal();
        Bestiary.setSeen(t.getClass());
        Bestiary.countEncounter(t.getClass());
        t.activate();
      }
      ScrollOfTeleportation.appear(mob, mob.pos);
      Dungeon.level.occupyCell(mob);
    }
  }
}

$J.define(DistortionTrap, 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.DistortionTrap', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap', ctors: { '': '_DistortionTrap' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  Mimic = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mimic');
  MobSpawner = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.MobSpawner');
  Piranha = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Piranha');
  Statue = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Statue');
  Wraith = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Wraith');
  RatKing = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.RatKing');
  ScrollOfTeleportation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTeleportation');
  Bestiary = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Bestiary');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
