// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/quest/CorpseDust.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, JObject } from '../../../../../../jre/index.ts';
import { Item } from '../Item.ts';
import { Buff } from '../../actors/buffs/Buff.ts';
import { Wraith } from '../../actors/mobs/Wraith.ts';

let Assets$Sounds, Dungeon, Statistics, Actor, Hero, Messages, ItemSpriteSheet, GLog, Game, Music, Sample, Random;

export class CorpseDust extends Item {
  _CorpseDust(): this {
    this._Item();
    this.image_ = ItemSpriteSheet.DUST;
    this.cursed = true;
    this.cursedKnown = true;
    this.unique = true;
    return this;
  }
  actions(hero: Hero): ArrayList<string> {
    return new ArrayList();
  }
  isUpgradable(): boolean {
    return false;
  }
  isIdentified(): boolean {
    return true;
  }
  doPickUp$Hero$int(hero: Hero, pos: number): boolean {
    if (super.doPickUp$Hero$int(hero, pos)) {
      GLog.n(Messages.get$Object$String$ObjectArr(this, 'chill', []), []);
      Buff.affect$Char$Class(hero, $J.cls(CorpseDust$DustGhostSpawner));
      return true;
    }
    return false;
  }
  onDetach(): void {
    let spawner = Dungeon.hero.buff($J.cls(CorpseDust$DustGhostSpawner));
    if (spawner != null) {
      spawner.dispel();
    }
  }
}

export class CorpseDust$DustGhostSpawner extends Buff {
  spawnPower: number = 0;
  static SPAWNPOWER: string = null;
  _CorpseDust$DustGhostSpawner(): this {
    this._Buff();
    this.spawnPower = 0;
    this.revivePersists = true;
    return this;
  }
  act(): boolean {
    if (this.target instanceof Hero && (this.target).belongings.getItem($J.cls(CorpseDust)) == null) {
      this.spawnPower = 0;
      this.spend(Actor.TICK);
      return true;
    }
    this.spawnPower++;
    let wraiths = 1;
    for (const $it0 = Dungeon.level.mobs.iterator(); $it0.hasNext(); ) {
      let mob = $it0.next();
      if (mob instanceof CorpseDust$DustWraith) {
        wraiths++;
      }
    }
    let powerNeeded = Math.min(49, Math.imul(wraiths, wraiths));
    if (powerNeeded <= this.spawnPower) {
      let candidates = new ArrayList();
      let minDist = $J.roundf(Math.fround(Dungeon.hero.viewDistance / 3));
      for (let i = 0; i < Dungeon.level.length(); i++) {
        if (Dungeon.level.heroFOV[i] && !Dungeon.level.solid[i] && Actor.findChar(i) == null && Dungeon.level.distance(i, Dungeon.hero.pos) > minDist) {
          candidates.add(i);
        }
      }
      if (!candidates.isEmpty()) {
        Wraith.spawnAt$int$Class(Random.element$Collection(candidates), $J.cls(CorpseDust$DustWraith));
        Sample.INSTANCE.play$Object(Assets$Sounds.CURSED);
        this.spawnPower = (this.spawnPower - powerNeeded) | 0;
      } else {
        this.spawnPower = Math.min(this.spawnPower, Math.imul(2, wraiths));
      }
    }
    this.spend(Actor.TICK);
    return true;
  }
  dispel(): void {
    this.detach();
    for (let mob of $J.toArrayInto(Dungeon.level.mobs.toArray(), $J.newArray(0, null))) {
      if (mob instanceof CorpseDust$DustWraith) {
        mob.die(null);
      }
    }
    Game.runOnRenderThread(new (CorpseDust$DustGhostSpawner$1())().$o(this));
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(CorpseDust$DustGhostSpawner.SPAWNPOWER, this.spawnPower);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.spawnPower = bundle.getInt(CorpseDust$DustGhostSpawner.SPAWNPOWER);
  }
  static $clinit() {
    CorpseDust$DustGhostSpawner.SPAWNPOWER = 'spawnpower';
  }
}

export class CorpseDust$DustWraith extends Wraith {
  atkCount: number = 0;
  static readonly ATK_COUNT: string = 'atk_count';
  _CorpseDust$DustWraith(): this {
    this._Wraith();
    this.atkCount = 0;
    return this;
  }
  attack$Char$float$float$float(enemy: Char, dmgMulti: number, dmgBonus: number, accMulti: number): boolean {
    if (enemy === Dungeon.hero) {
      this.atkCount++;
      if (this.atkCount === 2 || this.atkCount === 3) {
        Statistics.questScores[1] = (Statistics.questScores[1] - 100) | 0;
      }
    }
    return super.attack$Char$float$float$float(enemy, dmgMulti, dmgBonus, accMulti);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(CorpseDust$DustWraith.ATK_COUNT, this.atkCount);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.atkCount = bundle.getInt(CorpseDust$DustWraith.ATK_COUNT);
  }
}

let $CorpseDust$DustGhostSpawner$1$1: any = null;
/** An anonymous class (CorpseDust.java:158). */
function CorpseDust$DustGhostSpawner$1$1(): any {
  return $CorpseDust$DustGhostSpawner$1$1 ??= $J.local(class extends JObject {
    call(): void {
      if (Dungeon.level != null) {
        Dungeon.level.playLevelMusic();
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.quest.CorpseDust$DustGhostSpawner$1$1', ['com.watabou.utils.Callback']);
}

let $CorpseDust$DustGhostSpawner$1: any = null;
/** An anonymous class (CorpseDust.java:155). */
function CorpseDust$DustGhostSpawner$1(): any {
  return $CorpseDust$DustGhostSpawner$1 ??= $J.local(class extends JObject {
    call(): void {
      Music.INSTANCE.fadeOut(1, new (CorpseDust$DustGhostSpawner$1$1())().$o(this));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.quest.CorpseDust$DustGhostSpawner$1', ['com.watabou.utils.Callback']);
}

$J.define(CorpseDust, 'com.shatteredpixel.shatteredpixeldungeon.items.quest.CorpseDust', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { '': '_CorpseDust' }, meths: { 'doPickUp(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,int)': 'doPickUp$Hero$int' } });
$J.define(CorpseDust$DustGhostSpawner, 'com.shatteredpixel.shatteredpixeldungeon.items.quest.CorpseDust$DustGhostSpawner', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_CorpseDust$DustGhostSpawner' }, clinit: true, lazy: ['SPAWNPOWER'] });
$J.define(CorpseDust$DustWraith, 'com.shatteredpixel.shatteredpixeldungeon.items.quest.CorpseDust$DustWraith', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Wraith', ctors: { '': '_CorpseDust$DustWraith' }, meths: { 'attack(com.shatteredpixel.shatteredpixeldungeon.actors.Char,float,float,float)': 'attack$Char$float$float$float' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Game = $J.load('com.watabou.noosa.Game');
  Music = $J.load('com.watabou.noosa.audio.Music');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Random = $J.load('com.watabou.utils.Random');
});
