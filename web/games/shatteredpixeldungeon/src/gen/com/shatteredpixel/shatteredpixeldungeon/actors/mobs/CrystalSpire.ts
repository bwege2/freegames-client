// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/CrystalSpire.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Mob } from './Mob.ts';

let Assets$Sounds, Dungeon, Statistics, Actor, Char, Char$Alignment, Char$Property, Blindness, Buff, Cripple, Haste, Invisibility, Paralysis, CrystalGuardian, CrystalWisp, Blacksmith$Quest, Pushing, Splash, Pickaxe, Bestiary, Level, Terrain, Ballistica, Messages, GameScene, PixelScene, CrystalSpireSprite, CrystalSpireSprite$Blue, CrystalSpireSprite$Green, CrystalSpireSprite$Red, BossHealthBar, GLog, Game, Music, Sample, GameMath, PathFinder, Random;

export class CrystalSpire extends Mob {
  abilityCooldown: number = 0;
  static readonly ABILITY_CD: number = 15;
  targetedCells: ArrayList<ArrayList<number>> = null;
  hits: number = 0;
  static readonly SPRITE: string = 'sprite';
  static readonly HITS: string = 'hits';
  static readonly ABILITY_COOLDOWN: string = 'ability_cooldown';
  static readonly TARGETED_CELLS: string = 'targeted_cells';
  _CrystalSpire(): this {
    this._Mob();
    this.HP = this.HT = 300;
    this.spriteClass = $J.cls(CrystalSpireSprite);
    this.EXP = 20;
    this.actPriority = (Actor.MOB_PRIO - 1) | 0;
    this.state_ = this.PASSIVE;
    this.alignment = Char$Alignment.NEUTRAL;
    this.properties_.add(Char$Property.IMMOVABLE);
    this.properties_.add(Char$Property.BOSS);
    this.properties_.add(Char$Property.INORGANIC);
    this.properties_.add(Char$Property.STATIC);
    this.targetedCells = new ArrayList();
    this.hits = 0;
    this.immunities_.add($J.cls(Blindness));
    switch (Random.Int$int(3)) {
      case 0:
      default:
        this.spriteClass = $J.cls(CrystalSpireSprite$Blue);
        break;
      case 1:
        this.spriteClass = $J.cls(CrystalSpireSprite$Green);
        break;
      case 2:
        this.spriteClass = $J.cls(CrystalSpireSprite$Red);
        break;
    }
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
    this.enemy = Dungeon.hero;
    this.enemySeen = this.enemy.isAlive() && this.fieldOfView[this.enemy.pos];
    if (!this.targetedCells.isEmpty()) {
      let cellsToAttack = this.targetedCells.removeAt(0);
      for (const $it0 = cellsToAttack.iterator(); $it0.hasNext(); ) {
        let i = $it0.next();
        let ch = Actor.findChar(i);
        if (ch instanceof CrystalSpire) {
          continue;
        }
        Level.set$int$int(i, Terrain.MINE_CRYSTAL);
        GameScene.updateMap$int(i);
        Splash.at$int$int$int(i, 16777215, 5);
      }
      for (const $it1 = cellsToAttack.iterator(); $it1.hasNext(); ) {
        let i = $it1.next();
        let ch = Actor.findChar(i);
        if (ch != null && !(ch instanceof CrystalWisp || ch instanceof CrystalSpire)) {
          let dmg = Random.NormalIntRange(6, 15);
          if (ch instanceof CrystalGuardian) {
            dmg = (dmg + 12) | 0;
            Buff.prolong(ch, $J.cls(Cripple), 30);
          } else if (ch === Dungeon.hero) {
            Statistics.questScores[2] = (Statistics.questScores[2] - 100) | 0;
          }
          ch.damage(dmg, new CrystalSpire$SpireSpike()._CrystalSpire$SpireSpike());
          let movePos = i;
          if (ch instanceof CrystalGuardian) {
            for (let j of PathFinder.NEIGHBOURS8) {
              if (!(Dungeon.level.solid[(i + j) | 0]) && (Actor.findChar((i + j) | 0)) == null && Dungeon.level.trueDistance((i + j) | 0, Dungeon.hero.pos) > Dungeon.level.trueDistance(movePos, Dungeon.hero.pos)) {
                movePos = (i + j) | 0;
              }
            }
          } else if (!Char.hasProp(ch, Char$Property.IMMOVABLE)) {
            for (let j of PathFinder.NEIGHBOURS8) {
              if (!(Dungeon.level.solid[(i + j) | 0]) && (Actor.findChar((i + j) | 0)) == null && Dungeon.level.trueDistance((i + j) | 0, this.pos) > Dungeon.level.trueDistance(movePos, this.pos)) {
                movePos = (i + j) | 0;
              }
            }
          }
          if (ch.isAlive()) {
            if (movePos !== i) {
              Actor.add$Actor(new Pushing()._Pushing$Char$int$int(ch, i, movePos));
              ch.pos = movePos;
              Dungeon.level.occupyCell(ch);
            }
          } else if (ch === Dungeon.hero) {
            GLog.n(Messages.capitalize(Messages.get$Class$String$ObjectArr($J.cls(Char), 'kill', [this.name()])), []);
            Dungeon.fail(this);
          }
        }
      }
      PixelScene.shake(1, Math.fround(0.7));
      Sample.INSTANCE.play$Object(Assets$Sounds.SHATTER);
      if (!this.targetedCells.isEmpty()) {
        for (const $it2 = this.targetedCells.get(0).iterator(); $it2.hasNext(); ) {
          let i = $it2.next();
          GameScene.targetedCell$int$float(i, Actor.TICK);
        }
      }
    }
    if (this.hits < 3 || !this.enemySeen) {
      this.spend(Actor.TICK);
      return true;
    } else {
      if (this.abilityCooldown <= Math.fround(0)) {
        if (Random.Int$int(2) === 0) {
          this.diamondAOEAttack();
        } else {
          this.lineAttack();
        }
        let delay = GameMath.gate(Actor.TICK, Math.fround($J.d2i(Math.ceil(Dungeon.hero.cooldown()))), Math.fround(3 * Actor.TICK));
        for (const $it3 = this.targetedCells.get(0).iterator(); $it3.hasNext(); ) {
          let i = $it3.next();
          GameScene.targetedCell$int$float(i, delay);
        }
        this.abilityCooldown = Math.fround(this.abilityCooldown + CrystalSpire.ABILITY_CD);
        this.spend(delay);
        Dungeon.hero.interrupt();
      } else {
        this.abilityCooldown = Math.fround(this.abilityCooldown - 1);
        this.spend(Actor.TICK);
      }
    }
    return true;
  }
  diamondAOEAttack(): void {
    this.targetedCells.clear();
    let aoeCells = new ArrayList();
    aoeCells.add(Dungeon.hero.pos);
    aoeCells.addAll(this.spreadDiamondAOE(aoeCells));
    this.targetedCells.add(new ArrayList(aoeCells));
    if (Math.fround(this.HP) < Math.fround(Math.imul(2, this.HT) / 3)) {
      aoeCells.addAll(this.spreadDiamondAOE(aoeCells));
      this.targetedCells.add(new ArrayList(aoeCells));
      if (Math.fround(this.HP) < Math.fround(this.HT / 3)) {
        aoeCells.addAll(this.spreadDiamondAOE(aoeCells));
        this.targetedCells.add(aoeCells);
      }
    }
  }
  spreadDiamondAOE(currentCells: ArrayList<number>): ArrayList<number> {
    let spreadCells = new ArrayList();
    for (const $it4 = currentCells.iterator(); $it4.hasNext(); ) {
      let i = $it4.next();
      for (let j of PathFinder.NEIGHBOURS4) {
        if ((!(Dungeon.level.solid[(i + j) | 0]) || (Dungeon.level.map_[(i + j) | 0]) === Terrain.MINE_CRYSTAL) && !spreadCells.contains((i + j) | 0) && !currentCells.contains((i + j) | 0)) {
          spreadCells.add((i + j) | 0);
        }
      }
    }
    return spreadCells;
  }
  lineAttack(): void {
    this.targetedCells.clear();
    let lineCells = new ArrayList();
    let aim = new Ballistica()._Ballistica(this.pos, Dungeon.hero.pos, Ballistica.WONT_STOP);
    for (const $it5 = aim.subPath(1, 7).iterator(); $it5.hasNext(); ) {
      let i = $it5.next();
      if (!Dungeon.level.solid[i] || Dungeon.level.map_[i] === Terrain.MINE_CRYSTAL) {
        lineCells.add(i);
      } else {
        break;
      }
    }
    this.targetedCells.add(new ArrayList(lineCells));
    if (Math.fround(this.HP) < Math.fround(Math.imul(2, this.HT) / 3)) {
      lineCells.addAll(this.spreadDiamondAOE(lineCells));
      this.targetedCells.add(new ArrayList(lineCells));
      if (Math.fround(this.HP) < Math.fround(this.HT / 3)) {
        lineCells.addAll(this.spreadDiamondAOE(lineCells));
        this.targetedCells.add(lineCells);
      }
    }
  }
  spreadAOE(currentCells: ArrayList<number>): ArrayList<number> {
    let spreadCells = new ArrayList();
    for (const $it6 = currentCells.iterator(); $it6.hasNext(); ) {
      let i = $it6.next();
      for (let j of PathFinder.NEIGHBOURS8) {
        if ((!(Dungeon.level.solid[(i + j) | 0]) || (Dungeon.level.map_[(i + j) | 0]) === Terrain.MINE_CRYSTAL) && !spreadCells.contains((i + j) | 0) && !currentCells.contains((i + j) | 0)) {
          spreadCells.add((i + j) | 0);
        }
      }
    }
    return spreadCells;
  }
  beckon(cell: number): void {
  }
  reset(): boolean {
    return true;
  }
  damage(dmg: number, src: any): void {
    if (!(src instanceof Pickaxe)) {
      dmg = 0;
    }
    super.damage(dmg, src);
  }
  isInvulnerable(effect: JClass): boolean {
    return super.isInvulnerable(effect) || effect !== $J.cls(Pickaxe);
  }
  add(buff: Buff): boolean {
    return false;
  }
  interact(c: Char): boolean {
    if (c === Dungeon.hero) {
      let p = Dungeon.hero.belongings.getItem($J.cls(Pickaxe));
      if (p == null) {
        return true;
      }
      Dungeon.hero.sprite_.attack$int$Callback(this.pos, new (CrystalSpire$1())().$o(this).$c(p));
      return false;
    }
    return true;
  }
  spawningWeight(): number {
    return 0;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$Class(CrystalSpire.SPRITE, this.spriteClass);
    bundle.put$String$int(CrystalSpire.HITS, this.hits);
    bundle.put$String$float(CrystalSpire.ABILITY_COOLDOWN, this.abilityCooldown);
    for (let i = 0; i < this.targetedCells.size(); i++) {
      let bundleArr = $J.newArray(this.targetedCells.get(i).size(), 0);
      for (let j = 0; j < this.targetedCells.get(i).size(); j++) {
        bundleArr[j] = this.targetedCells.get(i).get(j);
      }
      bundle.put$String$intArr(CrystalSpire.TARGETED_CELLS + i, bundleArr);
    }
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.spriteClass = bundle.getClass$String(CrystalSpire.SPRITE);
    this.hits = bundle.getInt(CrystalSpire.HITS);
    if (this.hits >= 3) {
      BossHealthBar.assignBoss$Mob(this);
    }
    this.abilityCooldown = bundle.getFloat(CrystalSpire.ABILITY_COOLDOWN);
    this.targetedCells.clear();
    let i = 0;
    while (bundle.contains(CrystalSpire.TARGETED_CELLS + i)) {
      let targets = new ArrayList();
      for (let j of bundle.getIntArray(CrystalSpire.TARGETED_CELLS + i)) {
        targets.add(j);
      }
      this.targetedCells.add(targets);
      i++;
    }
  }
}

export class CrystalSpire$SpireSpike extends JObject {
  _CrystalSpire$SpireSpike(): this {
    return this;
  }
}

let $CrystalSpire$1$1$1: any = null;
/** An anonymous class (CrystalSpire.java:350). */
function CrystalSpire$1$1$1(): any {
  return $CrystalSpire$1$1$1 ??= $J.local(class extends JObject {
    call(): void {
      Music.INSTANCE.end();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.CrystalSpire$1$1$1', ['com.watabou.utils.Callback']);
}

let $CrystalSpire$1$1: any = null;
/** An anonymous class (CrystalSpire.java:347). */
function CrystalSpire$1$1(): any {
  return $CrystalSpire$1$1 ??= $J.local(class extends JObject {
    call(): void {
      Music.INSTANCE.fadeOut(5, new (CrystalSpire$1$1$1())().$o(this));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.CrystalSpire$1$1', ['com.watabou.utils.Callback']);
}

let $CrystalSpire$1: any = null;
/** An anonymous class (CrystalSpire.java:323). */
function CrystalSpire$1(): any {
  return $CrystalSpire$1 ??= $J.local(class extends JObject {
    call(): void {
      let dmg = this.$cv_p.damageRoll(this.$outer);
      this.$outer.damage(dmg, this.$cv_p);
      this.$outer.abilityCooldown = Math.fround(this.$outer.abilityCooldown - Math.fround(dmg / 10));
      this.$outer.sprite_.bloodBurstA(Dungeon.hero.sprite_.center$(), dmg);
      this.$outer.sprite_.flash();
      BossHealthBar.bleed(this.$outer.HP <= $J.idiv(this.$outer.HT, 3));
      if (this.$outer.isAlive()) {
        Sample.INSTANCE.play$Object$float$float(Assets$Sounds.SHATTER, 1, Random.Float$float$float(Math.fround(1.15), 1.25));
        (this.$outer.sprite_).updateIdle();
      } else {
        Sample.INSTANCE.play$Object(Assets$Sounds.SHATTER);
        Sample.INSTANCE.playDelayed$Object$float(Assets$Sounds.ROCKS, Math.fround(0.1));
        PixelScene.shake(3, Math.fround(0.7));
        Blacksmith$Quest.beatBoss();
        GameScene.bossSlain();
        Game.runOnRenderThread(new (CrystalSpire$1$1())().$o(this));
        Bestiary.setSeen($J.cls(CrystalSpire));
        Bestiary.countEncounter($J.cls(CrystalSpire));
        if (this.$outer.fieldOfView == null || this.$outer.fieldOfView.length !== Dungeon.level.length()) {
          this.$outer.fieldOfView = $J.newArray(Dungeon.level.length(), false);
          Dungeon.level.updateFieldOfView(this.$outer, this.$outer.fieldOfView);
        }
        for (let i = 0; i < Dungeon.level.length(); i++) {
          if (this.$outer.fieldOfView[i] && Dungeon.level.map_[i] === Terrain.MINE_CRYSTAL) {
            Level.set$int$int(i, Terrain.EMPTY);
            GameScene.updateMap$int(i);
            Splash.at$int$int$int(i, 16777215, 5);
          }
        }
        Bestiary.skipCountingEncounters = true;
        for (const $it7 = Actor.chars().iterator(); $it7.hasNext(); ) {
          let ch = $it7.next();
          if (this.$outer.fieldOfView[ch.pos]) {
            if (ch instanceof CrystalGuardian) {
              ch.damage(ch.HT, new CrystalSpire$SpireSpike()._CrystalSpire$SpireSpike());
            }
            if (ch instanceof CrystalWisp) {
              Buff.affect$Char$Class$float(ch, $J.cls(Blindness), 5);
            }
          }
        }
        Bestiary.skipCountingEncounters = false;
      }
      this.$outer.hits++;
      if (this.$outer.hits === 1) {
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(CrystalSpire), 'warning', []), []);
        PixelScene.shake(1, Math.fround(0.7));
        Sample.INSTANCE.play$Object(Assets$Sounds.MINE);
      } else if (this.$outer.hits >= 3) {
        if (this.$outer.hits === 3) {
          Sample.INSTANCE.play$Object(Assets$Sounds.ROCKS);
          PixelScene.shake(3, Math.fround(0.7));
          GLog.n(Messages.get$Class$String$ObjectArr($J.cls(CrystalSpire), 'alert', []), []);
          BossHealthBar.assignBoss$Mob(this.$outer);
          this.$outer.abilityCooldown = 1;
        }
        let affectingGuardians = false;
        for (const $it8 = Actor.chars().iterator(); $it8.hasNext(); ) {
          let ch = $it8.next();
          if (ch instanceof CrystalWisp) {
            if ((ch).state_ !== (ch).HUNTING && (ch).target !== this.$outer.pos) {
              (ch).beckon(this.$outer.pos);
            }
          } else if (ch instanceof CrystalGuardian) {
            if ((ch).state_ !== (ch).HUNTING && (ch).target !== this.$outer.pos) {
              affectingGuardians = true;
            }
          }
        }
        if (affectingGuardians) {
          let passable = $J.newArray(Dungeon.level.length(), false);
          for (let i = 0; i < Dungeon.level.length(); i++) {
            if (Dungeon.level.map_[i] === Terrain.MINE_CRYSTAL) {
              passable[i] = true;
            } else {
              passable[i] = (Terrain.flags[Dungeon.level.map_[i]] & Terrain.PASSABLE) !== 0;
            }
          }
          PathFinder.buildDistanceMap$int$booleanArr(this.$outer.pos, passable);
          for (const $it9 = Actor.chars().iterator(); $it9.hasNext(); ) {
            let ch = $it9.next();
            if (ch instanceof CrystalGuardian) {
              if ((ch).state_ === (ch).SLEEPING) {
                (ch).aggro(Dungeon.hero);
                (ch).beckon(this.$outer.pos);
                if (PathFinder.distance[ch.pos] < 20) {
                  Buff.affect$Char$Class$float(ch, $J.cls(Paralysis), Math.fround((20 - PathFinder.distance[ch.pos]) | 0));
                }
              } else if ((ch).state_ !== (ch).HUNTING && (ch).target !== this.$outer.pos) {
                (ch).beckon(this.$outer.pos);
                if ((ch).state_ !== this.$outer.HUNTING) {
                  (ch).aggro(Dungeon.hero);
                }
                if (PathFinder.distance[ch.pos] > 8) {
                  Buff.affect$Char$Class$float(ch, $J.cls(Haste), Math.fround(Math.max(15, $J.roundf(Math.fround(((PathFinder.distance[ch.pos] - 8) | 0) / 2)))));
                }
              }
            }
          }
        }
      }
      Invisibility.dispel$Char(Dungeon.hero);
      Dungeon.hero.spendAndNext(this.$cv_p.delayFactor(this.$outer));
    }
    $c($p): this {
      this.$cv_p = $p;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.CrystalSpire$1', ['com.watabou.utils.Callback']);
}

$J.define(CrystalSpire, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.CrystalSpire', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_CrystalSpire' } });
$J.define(CrystalSpire$SpireSpike, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.CrystalSpire$SpireSpike', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_CrystalSpire$SpireSpike' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Blindness = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Blindness');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Cripple = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Cripple');
  Haste = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Haste');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Paralysis = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Paralysis');
  CrystalGuardian = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.CrystalGuardian');
  CrystalWisp = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.CrystalWisp');
  Blacksmith$Quest = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Blacksmith$Quest');
  Pushing = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Pushing');
  Splash = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Splash');
  Pickaxe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.Pickaxe');
  Bestiary = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Bestiary');
  Level = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  CrystalSpireSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CrystalSpireSprite');
  CrystalSpireSprite$Blue = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CrystalSpireSprite$Blue');
  CrystalSpireSprite$Green = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CrystalSpireSprite$Green');
  CrystalSpireSprite$Red = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CrystalSpireSprite$Red');
  BossHealthBar = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BossHealthBar');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Game = $J.load('com.watabou.noosa.Game');
  Music = $J.load('com.watabou.noosa.audio.Music');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  GameMath = $J.load('com.watabou.utils.GameMath');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
