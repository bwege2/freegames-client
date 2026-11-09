// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/DemonSpawner.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Statistics, Actor, Char$Property, AscensionChallenge, RipperDemon, Pushing, PotionOfHealing, Notes, Notes$Landmark, Messages, GameScene, SpawnerSprite, GLog, PathFinder, Random;

export class DemonSpawner extends Mob {
  spawnCooldown: number = 0;
  spawnRecorded: boolean = false;
  static readonly SPAWN_COOLDOWN: string = 'spawn_cooldown';
  static readonly SPAWN_RECORDED: string = 'spawn_recorded';
  _DemonSpawner(): this {
    this._Mob();
    this.spriteClass = $J.cls(SpawnerSprite);
    this.HP = this.HT = 120;
    this.defenseSkill_ = 0;
    this.EXP = 15;
    this.maxLvl = 29;
    this.state_ = this.PASSIVE;
    this.loot = $J.cls(PotionOfHealing);
    this.lootChance_ = 1;
    this.properties_.add(Char$Property.IMMOVABLE);
    this.properties_.add(Char$Property.MINIBOSS);
    this.properties_.add(Char$Property.DEMONIC);
    this.properties_.add(Char$Property.STATIC);
    this.spawnCooldown = 0;
    this.spawnRecorded = false;
    return this;
  }
  drRoll(): number {
    return (super.drRoll() + Random.NormalIntRange(0, 12)) | 0;
  }
  beckon(cell: number): void {
  }
  reset(): boolean {
    return true;
  }
  act(): boolean {
    if (!this.spawnRecorded) {
      Statistics.spawnersAlive++;
      this.spawnRecorded = true;
    }
    if (Dungeon.hero.buff($J.cls(AscensionChallenge)) != null && this.spawnCooldown > Math.fround(20)) {
      this.spawnCooldown = 20;
    }
    this.spawnCooldown--;
    if (this.spawnCooldown <= Math.fround(0)) {
      if (this.spawnCooldown < Math.fround(-20)) {
        this.spawnCooldown = -20;
      }
      let candidates = new ArrayList();
      for (let n of PathFinder.NEIGHBOURS8) {
        if (Dungeon.level.passable[(this.pos + n) | 0] && (Actor.findChar((this.pos + n) | 0)) == null) {
          candidates.add((this.pos + n) | 0);
        }
      }
      if (!candidates.isEmpty()) {
        let spawn = new RipperDemon()._RipperDemon();
        spawn.pos = Random.element$Collection(candidates);
        spawn.state_ = spawn.HUNTING;
        GameScene.add$Mob$float(spawn, 1);
        Dungeon.level.occupyCell(spawn);
        if (this.sprite_.visible_) {
          Actor.add$Actor(new Pushing()._Pushing$Char$int$int(spawn, this.pos, spawn.pos));
        }
        this.spawnCooldown = Math.fround(this.spawnCooldown + 60);
        if (Dungeon.depth > 21) {
          this.spawnCooldown = Math.fround(this.spawnCooldown - Math.min(20, ((Dungeon.depth - 21) | 0) * 6.67));
        }
      }
    }
    this.alerted = false;
    return super.act();
  }
  damage(dmg: number, src: any): void {
    if (dmg >= 20) {
      dmg = (19 + $J.idiv($J.d2i(((Math.sqrt((Math.imul(8, ((dmg - 19) | 0)) + 1) | 0)) - 1)), 2)) | 0;
    }
    this.spawnCooldown = Math.fround(this.spawnCooldown - dmg);
    super.damage(dmg, src);
  }
  landmark(): Notes$Landmark {
    return Notes$Landmark.DEMON_SPAWNER;
  }
  die(cause: any): void {
    if (this.spawnRecorded) {
      Statistics.spawnersAlive--;
      Notes.remove$Landmark(this.landmark());
    }
    GLog.h(Messages.get$Object$String$ObjectArr(this, 'on_death', []), []);
    super.die(cause);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$float(DemonSpawner.SPAWN_COOLDOWN, this.spawnCooldown);
    bundle.put$String$boolean(DemonSpawner.SPAWN_RECORDED, this.spawnRecorded);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.spawnCooldown = bundle.getFloat(DemonSpawner.SPAWN_COOLDOWN);
    this.spawnRecorded = bundle.getBoolean(DemonSpawner.SPAWN_RECORDED);
  }
}

$J.define(DemonSpawner, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DemonSpawner', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_DemonSpawner' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  AscensionChallenge = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AscensionChallenge');
  RipperDemon = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.RipperDemon');
  Pushing = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Pushing');
  PotionOfHealing = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfHealing');
  Notes = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes');
  Notes$Landmark = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes$Landmark');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  SpawnerSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.SpawnerSprite');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
