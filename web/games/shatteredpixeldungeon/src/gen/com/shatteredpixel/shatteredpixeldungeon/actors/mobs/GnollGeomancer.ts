// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/GnollGeomancer.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Mob$Sleeping } from './Mob.ts';
import { Mob$Hunting } from './Mob.ts';
import { Item } from '../../items/Item.ts';
import { DelayedRockFall } from './DelayedRockFall.ts';
import { ShieldBuff } from '../buffs/ShieldBuff.ts';

let Assets$Sounds, Badges, Dungeon, Statistics, Actor, Char$Property, Buff, Invisibility, Paralysis, GnollGuard, GnollSapper, Blacksmith$Quest, CellEmitter, Pushing, Speck, Splash, DarkGold, Pickaxe, ScrollOfTeleportation, WandOfBlastWave, Level, Terrain, Ballistica, Messages, GameScene, PixelScene, GnollGeomancerSprite, ItemSpriteSheet, MissileSprite, BossHealthBar, GLog, Game, Music, Sample, GameMath, PathFinder, Random;

export class GnollGeomancer extends Mob {
  abilityCooldown: number = 0;
  lastAbilityWasRockfall: boolean = false;
  throwingRocksFromPos: number[] = null;
  throwingRockToPos: number = 0;
  sapperID: number = 0;
  sapperSpawns: number[] = null;
  hits: number = 0;
  inFinalBracket: boolean = false;
  static rocksInFlight: number = 0;
  static knockedChars: ArrayList<Char> = null;
  static readonly HITS: string = 'hits';
  static readonly ABILITY_COOLDOWN: string = 'ability_cooldown';
  static readonly LAST_ABILITY_WAS_ROCKFALL: string = 'last_ability_was_rockfall';
  static readonly ROCK_FROM_POS: string = 'rock_from_pos';
  static readonly ROCK_TO_POS: string = 'rock_to_pos';
  static readonly SAPPER_ID: string = 'sapper_id';
  static readonly SAPPER_SPAWNS: string = 'sapper_spawns';
  _GnollGeomancer(): this {
    this._Mob();
    this.HP = this.HT = 150;
    this.spriteClass = $J.cls(GnollGeomancerSprite);
    this.EXP = 20;
    this.actPriority = (Actor.MOB_PRIO - 1) | 0;
    this.SLEEPING = new GnollGeomancer$Sleeping().$o(this)._GnollGeomancer$Sleeping();
    this.HUNTING = new GnollGeomancer$Hunting().$o(this)._GnollGeomancer$Hunting();
    this.state_ = this.SLEEPING;
    this.viewDistance = 12;
    this.properties_.add(Char$Property.BOSS);
    this.properties_.add(Char$Property.IMMOVABLE);
    this.abilityCooldown = Random.NormalIntRange(3, 5);
    this.throwingRocksFromPos = null;
    this.throwingRockToPos = -1;
    this.sapperID = -1;
    this.sapperSpawns = null;
    this.hits = 0;
    this.inFinalBracket = false;
    return this;
  }
  act(): boolean {
    if (this.sapperSpawns == null) {
      this.sapperSpawns = $J.newArray(3, 0);
      let i = 0;
      for (const $it0 = Dungeon.level.mobs.iterator(); $it0.hasNext(); ) {
        let m = $it0.next();
        if (m instanceof GnollSapper) {
          this.sapperSpawns[i] = (m).spawnPos;
          i++;
        }
        if (i === 3) {
          break;
        }
      }
    }
    if (this.throwingRocksFromPos != null) {
      let attacked = false;
      for (let rock of this.throwingRocksFromPos) {
        if (rock !== -1 && Dungeon.level.map_[rock] === Terrain.MINE_BOULDER) {
          attacked = true;
          GnollGeomancer.doRockThrowAttack(this, rock, this.throwingRockToPos);
        }
      }
      this.throwingRocksFromPos = null;
      this.throwingRockToPos = -1;
      this.spend(Actor.TICK);
      return !attacked;
    } else {
      return super.act();
    }
  }
  isInvulnerable(effect: JClass): boolean {
    return super.isInvulnerable(effect) || (this.buff($J.cls(GnollGeomancer$RockArmor)) != null && effect !== $J.cls(Pickaxe)) || this.hasSapper();
  }
  add(buff: Buff): boolean {
    if (this.state_ === this.SLEEPING && !(buff instanceof GnollGeomancer$RockArmor || buff instanceof DelayedRockFall)) {
      return false;
    } else {
      return super.add(buff);
    }
  }
  damageRoll(): number {
    return Random.NormalIntRange(3, 6);
  }
  attackSkill(target: Char): number {
    return 20;
  }
  drRoll(): number {
    return (super.drRoll() + Random.NormalIntRange(0, 6)) | 0;
  }
  reset(): boolean {
    return true;
  }
  spawningWeight(): number {
    return 0;
  }
  heroShouldInteract(): boolean {
    return super.heroShouldInteract() || this.buff($J.cls(GnollGeomancer$RockArmor)) != null;
  }
  getCloser(target: number): boolean {
    return false;
  }
  getFurther(target: number): boolean {
    return false;
  }
  interact(c: Char): boolean {
    if (c !== Dungeon.hero || this.buff($J.cls(GnollGeomancer$RockArmor)) == null) {
      return super.interact(c);
    } else {
      let p = Dungeon.hero.belongings.getItem($J.cls(Pickaxe));
      if (p == null) {
        return true;
      }
      Dungeon.hero.sprite_.attack$int$Callback(this.pos, new (GnollGeomancer$1())().$o(this).$c(p));
      return false;
    }
  }
  damage(dmg: number, src: any): void {
    let hpBracket = $J.idiv(this.HT, 3);
    let curbracket = $J.idiv(this.HP, hpBracket);
    if (curbracket === 3) {
      curbracket--;
    }
    this.inFinalBracket = curbracket === 0;
    super.damage(dmg, src);
    this.abilityCooldown = $J.d2i(Math.fround(this.abilityCooldown - Math.fround(dmg / 10)));
    let newBracket = $J.idiv(this.HP, hpBracket);
    if (newBracket === 3) {
      newBracket--;
    }
    if (newBracket !== curbracket) {
      if (this.HP <= Math.imul(((curbracket - 1) | 0), hpBracket)) {
        this.HP = (Math.imul(((curbracket - 1) | 0), hpBracket) + 1) | 0;
      }
      BossHealthBar.bleed(newBracket <= 0);
      this.carveRockAndDash();
      Buff.affect$Char$Class(this, $J.cls(GnollGeomancer$RockArmor)).setShield(25);
    }
  }
  isAlive(): boolean {
    return super.isAlive() || !this.inFinalBracket;
  }
  linkSapper(sapper: GnollSapper): void {
    this.sapperID = sapper.id();
    if (this.sprite_ instanceof GnollGeomancerSprite) {
      (this.sprite_).setupArmor();
    }
  }
  hasSapper(): boolean {
    return this.sapperID !== -1 && Actor.findById(this.sapperID) instanceof GnollSapper && (Actor.findById(this.sapperID)).isAlive();
  }
  loseSapper(): void {
    if (this.sapperID !== -1) {
      this.sapperID = -1;
      if (this.sprite_ instanceof GnollGeomancerSprite) {
        (this.sprite_).loseArmor();
      }
    }
  }
  carveRockAndDash(): void {
    let closestSapperPos = -1;
    let closestisAlive = false;
    for (let i = 0; i < this.sapperSpawns.length; i++) {
      if (this.sapperSpawns[i] === -1) {
        continue;
      }
      if (closestSapperPos === -1) {
        closestSapperPos = this.sapperSpawns[i];
        for (const $it2 = Dungeon.level.mobs.iterator(); $it2.hasNext(); ) {
          let m = $it2.next();
          if (m instanceof GnollSapper && (m).spawnPos === closestSapperPos) {
            closestisAlive = true;
            break;
          }
        }
        continue;
      }
      let sapperAlive = false;
      for (const $it3 = Dungeon.level.mobs.iterator(); $it3.hasNext(); ) {
        let m = $it3.next();
        if (m instanceof GnollSapper && (m).spawnPos === this.sapperSpawns[i]) {
          sapperAlive = true;
          break;
        }
      }
      if ((sapperAlive && !closestisAlive && Dungeon.level.distance(this.pos, this.sapperSpawns[i]) <= 16) || Dungeon.level.trueDistance(this.pos, this.sapperSpawns[i]) < Dungeon.level.trueDistance(this.pos, closestSapperPos)) {
        closestSapperPos = this.sapperSpawns[i];
        closestisAlive = sapperAlive;
      }
    }
    let dashPos = closestSapperPos;
    if (dashPos === -1) {
      return;
    }
    let path = new Ballistica()._Ballistica(this.pos, dashPos, Ballistica.STOP_TARGET);
    if (path.dist > 12) {
      dashPos = path.path.get(12);
    }
    if (Actor.findChar(dashPos) != null || Dungeon.level.traps.get(dashPos) != null) {
      let candidates = new ArrayList();
      for (let i of PathFinder.NEIGHBOURS8) {
        if ((Actor.findChar((dashPos + i) | 0)) == null && Dungeon.level.traps.get((dashPos + i) | 0) == null) {
          candidates.add((dashPos + i) | 0);
        }
      }
      if (!candidates.isEmpty()) {
        dashPos = Random.element$Collection(candidates);
      }
    }
    for (let i = 0; i < this.sapperSpawns.length; i++) {
      if (this.sapperSpawns[i] === closestSapperPos) {
        this.sapperSpawns[i] = -1;
      }
    }
    path = new Ballistica()._Ballistica(this.pos, dashPos, Ballistica.STOP_TARGET);
    let cells = new ArrayList(path.subPath(0, path.dist));
    cells.addAll(this.spreadDiamondAOE(cells));
    cells.addAll(this.spreadDiamondAOE(cells));
    cells.addAll(this.spreadDiamondAOE(cells));
    let exteriorCells = this.spreadDiamondAOE(cells);
    for (const $it4 = cells.iterator(); $it4.hasNext(); ) {
      let i = $it4.next();
      if (Dungeon.level.map_[i] === Terrain.WALL_DECO) {
        Dungeon.level.drop(new DarkGold()._DarkGold(), i).sprite_.drop$();
        Dungeon.level.map_[i] = Terrain.EMPTY_DECO;
      } else if (Dungeon.level.solid[i]) {
        if (Random.Int$int(3) === 0) {
          Dungeon.level.map_[i] = Terrain.MINE_BOULDER;
        } else {
          Dungeon.level.map_[i] = Terrain.EMPTY_DECO;
        }
      } else if (Dungeon.level.map_[i] === Terrain.HIGH_GRASS || Dungeon.level.map_[i] === Terrain.FURROWED_GRASS) {
        Dungeon.level.map_[i] = Terrain.GRASS;
      }
      (CellEmitter.get((i - Dungeon.level.width()) | 0)).start(Speck.factory$int(Speck.ROCK), Math.fround(0.07), 10);
    }
    for (const $it5 = exteriorCells.iterator(); $it5.hasNext(); ) {
      let i = $it5.next();
      if (!Dungeon.level.solid[i] && Dungeon.level.map_[i] !== Terrain.EMPTY_SP && !Dungeon.level.adjacent(i, Dungeon.level.entrance()) && Dungeon.level.traps.get(i) == null && Dungeon.level.plants.get(i) == null && Actor.findChar(i) == null) {
        Dungeon.level.map_[i] = Terrain.MINE_BOULDER;
      }
    }
    if (Dungeon.level.solid[dashPos]) {
      Dungeon.level.map_[dashPos] = Terrain.EMPTY_DECO;
    }
    Dungeon.level.buildFlagMaps();
    Dungeon.level.cleanWalls();
    GameScene.updateMap$();
    GameScene.updateFog$();
    Dungeon.observe$();
    PixelScene.shake(3, Math.fround(0.7));
    Sample.INSTANCE.play$Object(Assets$Sounds.ROCKS);
    let oldpos = this.pos;
    this.pos = dashPos;
    this.spend(Actor.TICK);
    this.abilityCooldown = 1;
    Actor.add$Actor(new Pushing()._Pushing$Char$int$int(this, oldpos, this.pos));
    if (closestisAlive) {
      let closest = null;
      for (const $it6 = Dungeon.level.mobs.iterator(); $it6.hasNext(); ) {
        let m = $it6.next();
        if (m instanceof GnollSapper && (m).spawnPos === closestSapperPos) {
          closest = m;
          break;
        }
      }
      if (closest != null) {
        let guard = closest.getPartner();
        closest.linkPartner(this);
        if (Dungeon.level.distance(closest.pos, dashPos) > 3) {
          let candidates = new ArrayList();
          for (let i of PathFinder.NEIGHBOURS8) {
            if (!(Dungeon.level.solid[(dashPos + i) | 0]) && Dungeon.level.traps.get((dashPos + i) | 0) == null && Dungeon.level.plants.get((dashPos + i) | 0) == null && (Actor.findChar((dashPos + i) | 0)) == null) {
              candidates.add((dashPos + i) | 0);
            }
          }
          if (!candidates.isEmpty()) {
            let newSapperPos = Random.element$Collection(candidates);
            ScrollOfTeleportation.appear(closest, newSapperPos);
            closest.spawnPos = newSapperPos;
            candidates.remove(newSapperPos);
            if (guard instanceof GnollGuard && !candidates.isEmpty()) {
              ScrollOfTeleportation.appear(guard, Random.element$Collection(candidates));
            }
          }
        }
      }
    }
  }
  spreadDiamondAOE(currentCells: ArrayList<number>): ArrayList<number> {
    let spreadCells = new ArrayList();
    for (const $it7 = currentCells.iterator(); $it7.hasNext(); ) {
      let i = $it7.next();
      for (let j of PathFinder.NEIGHBOURS4) {
        if (Dungeon.level.insideMap((i + j) | 0) && !spreadCells.contains((i + j) | 0) && !currentCells.contains((i + j) | 0)) {
          spreadCells.add((i + j) | 0);
        }
      }
    }
    return spreadCells;
  }
  description(): string {
    if (this.state_ === this.SLEEPING) {
      return Messages.get$Object$String$ObjectArr(this, 'desc_sleeping', []);
    } else {
      let desc = super.description();
      if (this.buff($J.cls(GnollGeomancer$RockArmor)) != null) {
        if (this.hasSapper()) {
          desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_armor_sapper', []);
        } else {
          desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_armor', []);
        }
      }
      return desc;
    }
  }
  die(cause: any): void {
    super.die(cause);
    Blacksmith$Quest.beatBoss();
    Sample.INSTANCE.playDelayed$Object$float(Assets$Sounds.ROCKS, Math.fround(0.1));
    PixelScene.shake(3, Math.fround(0.7));
    GameScene.bossSlain();
    Game.runOnRenderThread(new (GnollGeomancer$2())().$o(this));
    for (let i = 0; i < Dungeon.level.length(); i++) {
      if (Dungeon.level.map_[i] === Terrain.MINE_BOULDER && Dungeon.level.trueDistance(i, this.pos) <= Math.fround(6)) {
        Level.set$int$int(i, Terrain.EMPTY_DECO);
        GameScene.updateMap$int(i);
        Splash.at$int$int$int(i, 5592405, 15);
      }
    }
  }
  beckon(cell: number): void {
    if (this.state_ === this.SLEEPING) {
    } else {
      super.beckon(cell);
    }
  }
  static prepRockThrowAttack(target: Char, source: Char): Ballistica {
    let candidateRocks = new ArrayList();
    for (let i = 0; i < Dungeon.level.length(); i++) {
      if (source.fieldOfView[i] && Dungeon.level.map_[i] === Terrain.MINE_BOULDER) {
        if (new Ballistica()._Ballistica(i, target.pos, Ballistica.PROJECTILE).collisionPos === target.pos) {
          candidateRocks.add(i);
        }
      }
    }
    for (const $it8 = Actor.chars().iterator(); $it8.hasNext(); ) {
      let ch = $it8.next();
      if (ch instanceof GnollGeomancer && (ch).throwingRocksFromPos != null) {
        for (let i of (ch).throwingRocksFromPos) {
          candidateRocks.remove(i);
        }
      } else if (ch instanceof GnollSapper) {
        candidateRocks.remove((ch).throwingRockFromPos);
      }
    }
    if (candidateRocks.isEmpty()) {
      return null;
    } else {
      let throwingFromPos = candidateRocks.get(0);
      for (const $it9 = candidateRocks.iterator(); $it9.hasNext(); ) {
        let i = $it9.next();
        if (Dungeon.level.trueDistance(i, target.pos) < Dungeon.level.trueDistance(throwingFromPos, target.pos)) {
          throwingFromPos = i;
        }
      }
      let throwingToPos = target.pos;
      return new Ballistica()._Ballistica(throwingFromPos, throwingToPos, Ballistica.PROJECTILE);
    }
  }
  static doRockThrowAttack(source: Char, from: number, to: number): void {
    Level.set$int$int(from, Terrain.EMPTY);
    GameScene.updateMap$int(from);
    source.sprite_.attack$int$Callback(from, new (GnollGeomancer$3())().$c(source));
    let rockPath = new Ballistica()._Ballistica(from, to, Ballistica.MAGIC_BOLT);
    Sample.INSTANCE.play$Object(Assets$Sounds.MISS);
    (source.sprite_.parent.recycle($J.cls(MissileSprite))).reset$int$int$Item$Callback(from, rockPath.collisionPos, new GnollGeomancer$Boulder()._GnollGeomancer$Boulder(), new (GnollGeomancer$4())().$c(rockPath, source));
    GnollGeomancer.rocksInFlight++;
  }
  static prepRockFallAttack(target: Char, source: Char, range: number, avoidBarricades: boolean): boolean {
    let rockCenter = target.pos;
    let safeCell: number;
    do {
      safeCell = (rockCenter + PathFinder.NEIGHBOURS8[Random.Int$int(8)]) | 0;
    } while (safeCell === source.pos || (Dungeon.level.solid[safeCell] && Random.Int$int(5) !== 0) || (Dungeon.level.traps.containsKey(safeCell) && Random.Int$int(5) !== 0));
    let rockCells = new ArrayList();
    let start = (rockCenter - Math.imul(Dungeon.level.width(), range) - range) | 0;
    let pos: number;
    for (let y = 0; y < ((1 + Math.imul(2, range)) | 0); y++) {
      pos = (start + Math.imul(Dungeon.level.width(), y)) | 0;
      for (let x = 0; x < ((1 + Math.imul(2, range)) | 0); x++) {
        if (!Dungeon.level.insideMap(pos)) {
          pos++;
          continue;
        }
        if (avoidBarricades) {
          let barricade = false;
          for (let j of PathFinder.NEIGHBOURS9) {
            if ((Dungeon.level.map_[(pos + j) | 0]) === Terrain.BARRICADE || (Dungeon.level.map_[(pos + j) | 0]) === Terrain.ENTRANCE) {
              barricade = true;
            }
          }
          if (barricade) {
            pos++;
            continue;
          }
        }
        if (!Dungeon.level.solid[pos] && pos !== safeCell && !(Actor.findChar(pos) instanceof GnollGeomancer) && !(source instanceof GnollGeomancer && Actor.findChar(pos) instanceof GnollSapper) && (Random.Int$int((1 + $J.idiv(Dungeon.level.distance(rockCenter, pos), 2)) | 0)) === 0) {
          rockCells.add(pos);
        }
        pos++;
      }
    }
    let delay = GameMath.gate(Actor.TICK, Math.fround($J.d2i(Math.ceil(target.cooldown()))), Math.fround(3 * Actor.TICK));
    for (const $it10 = rockCells.iterator(); $it10.hasNext(); ) {
      let i = $it10.next();
      GameScene.targetedCell$int$float(i, delay);
    }
    Buff.append$Char$Class$float(source, $J.cls(GnollGeomancer$GnollRockFall), delay).setRockPositions(rockCells);
    source.sprite_.attack$int$Callback(target.pos, new (GnollGeomancer$5())().$c(source));
    return true;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(GnollGeomancer.HITS, this.hits);
    bundle.put$String$int(GnollGeomancer.ABILITY_COOLDOWN, this.abilityCooldown);
    bundle.put$String$boolean(GnollGeomancer.LAST_ABILITY_WAS_ROCKFALL, this.lastAbilityWasRockfall);
    if (this.throwingRocksFromPos != null) {
      bundle.put$String$intArr(GnollGeomancer.ROCK_FROM_POS, this.throwingRocksFromPos);
    }
    bundle.put$String$int(GnollGeomancer.ROCK_TO_POS, this.throwingRockToPos);
    bundle.put$String$int(GnollGeomancer.SAPPER_ID, this.sapperID);
    if (this.sapperSpawns != null) {
      bundle.put$String$intArr(GnollGeomancer.SAPPER_SPAWNS, this.sapperSpawns);
    }
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.hits = bundle.getInt(GnollGeomancer.HITS);
    this.abilityCooldown = bundle.getInt(GnollGeomancer.ABILITY_COOLDOWN);
    this.lastAbilityWasRockfall = bundle.getBoolean(GnollGeomancer.LAST_ABILITY_WAS_ROCKFALL);
    if (bundle.contains(GnollGeomancer.ROCK_FROM_POS)) {
      this.throwingRocksFromPos = bundle.getIntArray(GnollGeomancer.ROCK_FROM_POS);
    }
    this.throwingRockToPos = bundle.getInt(GnollGeomancer.ROCK_TO_POS);
    this.sapperID = bundle.getInt(GnollGeomancer.SAPPER_ID);
    if (bundle.contains(GnollGeomancer.SAPPER_SPAWNS)) {
      this.sapperSpawns = bundle.getIntArray(GnollGeomancer.SAPPER_SPAWNS);
    }
    if (this.hits >= 3) {
      BossHealthBar.assignBoss$Mob(this);
    }
  }
  static $clinit() {
    GnollGeomancer.rocksInFlight = 0;
    GnollGeomancer.knockedChars = new ArrayList();
  }
}

export class GnollGeomancer$Sleeping extends Mob$Sleeping {
  _GnollGeomancer$Sleeping(): this {
    this._Mob$Sleeping();
    return this;
  }
  awaken(enemyInFOV: boolean): void {
  }
}

export class GnollGeomancer$Hunting extends Mob$Hunting {
  _GnollGeomancer$Hunting(): this {
    this._Mob$Hunting();
    return this;
  }
  act(enemyInFOV: boolean, justAlerted: boolean): boolean {
    if (!enemyInFOV) {
      this.$outer.enemy = null;
      this.$outer.enemy = this.$outer.chooseEnemy();
      if (this.$outer.enemy != null) {
        return this.act(true, justAlerted);
      } else {
        this.$outer.spend(Actor.TICK);
        return true;
      }
    } else {
      this.$outer.enemySeen = true;
      if ((Dungeon.level.distance(this.$outer.pos, this.$outer.enemy.pos) > 2 || this.$outer.hasSapper()) && this.$outer.buff($J.cls(GnollGeomancer$RockArmor)) != null && this.$outer.enemy.buff($J.cls(Paralysis)) == null) {
        this.$outer.abilityCooldown = $J.d2i(Math.fround(this.$outer.abilityCooldown - 1));
      }
      if (this.$outer.hasSapper()) {
        (Actor.findById(this.$outer.sapperID)).aggro(this.$outer.enemy);
      }
      if (this.$outer.abilityCooldown-- <= 0) {
        let targetNextToBarricade = false;
        for (let i of PathFinder.NEIGHBOURS8) {
          if ((Dungeon.level.map_[(this.$outer.enemy.pos + i) | 0]) === Terrain.BARRICADE || (Dungeon.level.map_[(this.$outer.enemy.pos + i) | 0]) === Terrain.ENTRANCE) {
            targetNextToBarricade = true;
            break;
          }
        }
        let hpBracket = $J.idiv(this.$outer.HT, 3);
        let curbracket = $J.idiv(this.$outer.HP, hpBracket);
        if (curbracket === 3) {
          curbracket--;
        }
        let aim = GnollGeomancer.prepRockThrowAttack(this.$outer.enemy, this.$outer);
        if (aim != null && (targetNextToBarricade || this.$outer.lastAbilityWasRockfall || Random.Int$int(2) === 0)) {
          this.$outer.lastAbilityWasRockfall = false;
          this.$outer.throwingRocksFromPos = [-1, -1, -1];
          this.$outer.throwingRockToPos = aim.collisionPos;
          let delay = GameMath.gate(Actor.TICK, Math.fround($J.d2i(Math.ceil(this.$outer.enemy.cooldown()))), Math.fround(3 * Actor.TICK));
          for (let i = 0; i < ((3 - curbracket) | 0); i++) {
            if (aim == null) {
              break;
            }
            this.$outer.throwingRocksFromPos[i] = aim.sourcePos;
            let warnPath = new Ballistica()._Ballistica(aim.sourcePos, aim.collisionPos, Ballistica.STOP_SOLID);
            for (const $it11 = warnPath.subPath(0, warnPath.dist).iterator(); $it11.hasNext(); ) {
              let j = $it11.next();
              GameScene.targetedCell$int$float(j, delay);
            }
            aim = GnollGeomancer.prepRockThrowAttack(this.$outer.enemy, this.$outer);
          }
          Dungeon.hero.interrupt();
          this.$outer.abilityCooldown = Random.NormalIntRange(3, 5);
          this.$outer.spend(delay);
          return true;
        } else if (GnollGeomancer.prepRockFallAttack(this.$outer.enemy, this.$outer, (6 - Math.imul(2, curbracket)) | 0, true)) {
          this.$outer.lastAbilityWasRockfall = true;
          Dungeon.hero.interrupt();
          this.$outer.spend(GameMath.gate(Actor.TICK, Math.fround($J.d2i(Math.ceil(this.$outer.enemy.cooldown()))), Math.fround(3 * Actor.TICK)));
          this.$outer.abilityCooldown = Random.NormalIntRange(3, 5);
          return true;
        }
      }
      this.$outer.spend(Actor.TICK);
      return true;
    }
  }
}

export class GnollGeomancer$Boulder extends Item {
  _GnollGeomancer$Boulder(): this {
    this._Item();
    this.image_ = ItemSpriteSheet.GEO_BOULDER;
    return this;
  }
}

export class GnollGeomancer$GnollRockFall extends DelayedRockFall {
  _GnollGeomancer$GnollRockFall(): this {
    this._DelayedRockFall();
    return this;
  }
  affectChar(ch: Char): void {
    ch.damage(Random.NormalIntRange(6, 12), this);
    if (ch === Dungeon.hero) {
      Statistics.questScores[2] = (Statistics.questScores[2] - 100) | 0;
    }
    if (ch.isAlive()) {
      Buff.prolong(ch, $J.cls(Paralysis), Math.fround(ch instanceof GnollGuard ? 10 : 3));
    } else if (ch === Dungeon.hero) {
      Dungeon.fail(this.target);
      GLog.n(Messages.get$Class$String$ObjectArr($J.cls(GnollGeomancer), 'rockfall_kill', []), []);
    }
  }
  affectCell(cell: number): void {
    if (Dungeon.level.map_[cell] !== Terrain.EMPTY_SP && !Dungeon.level.adjacent(cell, Dungeon.level.entrance()) && Random.Int$int(3) === 0) {
      Level.set$int$int(cell, Terrain.MINE_BOULDER);
      GameScene.updateMap$int(cell);
    }
  }
}

export class GnollGeomancer$RockArmor extends ShieldBuff {
  _GnollGeomancer$RockArmor(): this {
    this._ShieldBuff();
    return this;
  }
}

let $GnollGeomancer$1: any = null;
/** An anonymous class (GnollGeomancer.java:203). */
function GnollGeomancer$1(): any {
  return $GnollGeomancer$1 ??= $J.local(class extends JObject {
    call(): void {
      let dmg = this.$cv_p.damageRoll(this.$outer);
      let wasSleeping = this.$outer.state_ === this.$outer.SLEEPING;
      if (wasSleeping) {
        dmg = Math.min(dmg, 15);
      }
      dmg = Math.min(dmg, this.$outer.buff($J.cls(GnollGeomancer$RockArmor)).shielding());
      this.$outer.damage(dmg, this.$cv_p);
      this.$outer.sprite_.bloodBurstA(Dungeon.hero.sprite_.center$(), dmg);
      this.$outer.sprite_.flash();
      this.$outer.hits++;
      if (this.$outer.hits === 1) {
        GLog.w(Messages.get$Object$String$ObjectArr(this.$outer, 'warning', []), []);
      }
      if (this.$outer.hits === 3) {
        GLog.n(Messages.get$Object$String$ObjectArr(this.$outer, 'alert', []), []);
        wasSleeping = false;
        this.$outer.spend(Actor.TICK);
        this.$outer.sprite_.idle();
        this.$outer.carveRockAndDash();
        this.$outer.state_ = this.$outer.HUNTING;
        this.$outer.enemy = Dungeon.hero;
        BossHealthBar.assignBoss$Mob(this.$outer);
        for (const $it1 = Dungeon.level.mobs.iterator(); $it1.hasNext(); ) {
          let m = $it1.next();
          if (m instanceof GnollGuard) {
            m.aggro(Dungeon.hero);
            if (!(m).hasSapper()) {
              m.beckon(this.$outer.pos);
            }
          } else if (m instanceof GnollSapper) {
            m.aggro(Dungeon.hero);
          }
        }
      }
      if (wasSleeping) {
        this.$outer.state_ = this.$outer.SLEEPING;
        this.$outer.alerted = false;
      }
      if (this.$outer.buff($J.cls(GnollGeomancer$RockArmor)) == null) {
        Splash.around(this.$outer.sprite_, 5592405, 30);
        this.$outer.sprite_.idle();
      }
      Sample.INSTANCE.play$Object$float$float(Assets$Sounds.MINE, 1, Random.Float$float$float(Math.fround(0.85), Math.fround(1.15)));
      Invisibility.dispel$Char(Dungeon.hero);
      Dungeon.hero.spendAndNext(this.$cv_p.delayFactor(this.$outer));
    }
    $c($p): this {
      this.$cv_p = $p;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollGeomancer$1', ['com.watabou.utils.Callback']);
}

let $GnollGeomancer$2$1: any = null;
/** An anonymous class (GnollGeomancer.java:527). */
function GnollGeomancer$2$1(): any {
  return $GnollGeomancer$2$1 ??= $J.local(class extends JObject {
    call(): void {
      Music.INSTANCE.end();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollGeomancer$2$1', ['com.watabou.utils.Callback']);
}

let $GnollGeomancer$2: any = null;
/** An anonymous class (GnollGeomancer.java:524). */
function GnollGeomancer$2(): any {
  return $GnollGeomancer$2 ??= $J.local(class extends JObject {
    call(): void {
      Music.INSTANCE.fadeOut(5, new (GnollGeomancer$2$1())().$o(this));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollGeomancer$2', ['com.watabou.utils.Callback']);
}

let $GnollGeomancer$3: any = null;
/** An anonymous class (GnollGeomancer.java:704). */
function GnollGeomancer$3(): any {
  return $GnollGeomancer$3 ??= $J.local(class extends JObject {
    call(): void {
      this.$cv_source.sprite_.idle();
    }
    $c($source): this {
      this.$cv_source = $source;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollGeomancer$3', ['com.watabou.utils.Callback']);
}

let $GnollGeomancer$4: any = null;
/** An anonymous class (GnollGeomancer.java:716). */
function GnollGeomancer$4(): any {
  return $GnollGeomancer$4 ??= $J.local(class extends JObject {
    call(): void {
      Splash.at$int$int$int(this.$cv_rockPath.collisionPos, 5592405, 15);
      Sample.INSTANCE.play$Object(Assets$Sounds.ROCKS);
      let ch = Actor.findChar(this.$cv_rockPath.collisionPos);
      if (ch === Dungeon.hero) {
        PixelScene.shake(3, Math.fround(0.7));
      } else {
        PixelScene.shake(0.5, 0.5);
      }
      if (ch != null && !(ch instanceof GnollGeomancer)) {
        ch.damage(Random.NormalIntRange(6, 12), new GnollGeomancer$Boulder()._GnollGeomancer$Boulder());
        if (ch === Dungeon.hero) {
          Statistics.questScores[2] = (Statistics.questScores[2] - 100) | 0;
        }
        if (ch.isAlive()) {
          Buff.prolong(ch, $J.cls(Paralysis), Math.fround(ch instanceof GnollGuard ? 10 : 3));
        } else if (!ch.isAlive() && ch === Dungeon.hero) {
          Badges.validateDeathFromEnemyMagic();
          Dungeon.fail(this.$cv_source.getClass());
          GLog.n(Messages.get$Class$String$ObjectArr($J.cls(GnollGeomancer), 'rock_kill', []), []);
        }
        if (!GnollGeomancer.knockedChars.contains(ch) && this.$cv_rockPath.path.size() > ((this.$cv_rockPath.dist + 1) | 0)) {
          let trajectory = new Ballistica()._Ballistica(ch.pos, this.$cv_rockPath.path.get((this.$cv_rockPath.dist + 1) | 0), Ballistica.MAGIC_BOLT);
          WandOfBlastWave.throwChar(ch, trajectory, 1, false, false, this.$cv_source);
          GnollGeomancer.knockedChars.add(ch);
        }
      } else if (ch == null) {
        Dungeon.level.pressCell$int(this.$cv_rockPath.collisionPos);
      }
      GnollGeomancer.rocksInFlight--;
      if (GnollGeomancer.rocksInFlight <= 0) {
        GnollGeomancer.rocksInFlight = 0;
        this.$cv_source.next();
        GnollGeomancer.knockedChars.clear();
      }
    }
    $c($rockPath, $source): this {
      this.$cv_rockPath = $rockPath; this.$cv_source = $source;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollGeomancer$4', ['com.watabou.utils.Callback']);
}

let $GnollGeomancer$5: any = null;
/** An anonymous class (GnollGeomancer.java:825). */
function GnollGeomancer$5(): any {
  return $GnollGeomancer$5 ??= $J.local(class extends JObject {
    call(): void {
      this.$cv_source.sprite_.idle();
    }
    $c($source): this {
      this.$cv_source = $source;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollGeomancer$5', ['com.watabou.utils.Callback']);
}

$J.define(GnollGeomancer, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollGeomancer', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_GnollGeomancer' }, clinit: true, lazy: ['rocksInFlight', 'knockedChars'] });
$J.define(GnollGeomancer$Sleeping, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollGeomancer$Sleeping', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Sleeping', ctors: { '': '_GnollGeomancer$Sleeping' }, inner: true });
$J.define(GnollGeomancer$Hunting, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollGeomancer$Hunting', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Hunting', ctors: { '': '_GnollGeomancer$Hunting' }, inner: true });
$J.define(GnollGeomancer$Boulder, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollGeomancer$Boulder', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { '': '_GnollGeomancer$Boulder' } });
$J.define(GnollGeomancer$GnollRockFall, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollGeomancer$GnollRockFall', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DelayedRockFall', ctors: { '': '_GnollGeomancer$GnollRockFall' } });
$J.define(GnollGeomancer$RockArmor, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollGeomancer$RockArmor', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ShieldBuff', ctors: { '': '_GnollGeomancer$RockArmor' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Paralysis = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Paralysis');
  GnollGuard = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollGuard');
  GnollSapper = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollSapper');
  Blacksmith$Quest = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Blacksmith$Quest');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Pushing = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Pushing');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Splash = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Splash');
  DarkGold = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.DarkGold');
  Pickaxe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.Pickaxe');
  ScrollOfTeleportation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTeleportation');
  WandOfBlastWave = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfBlastWave');
  Level = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  GnollGeomancerSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.GnollGeomancerSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  MissileSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.MissileSprite');
  BossHealthBar = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BossHealthBar');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Game = $J.load('com.watabou.noosa.Game');
  Music = $J.load('com.watabou.noosa.audio.Music');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  GameMath = $J.load('com.watabou.utils.GameMath');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
