// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Mob.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections, HashSet, JClass, JObject } from '../../../../../../jre/index.ts';
import { Char } from '../Char.ts';

let Assets$Sounds, Badges, Challenges, Dungeon, Statistics, Actor, Char$Alignment, Char$Property, Adrenaline, AllyBuff, Amok, AscensionChallenge, Buff, Buff$buffType, ChampionEnemy, Charm, Corruption, Dread, GreaterHaste, Hunger, Invisibility, MindVision, MonkEnergy, Preparation, Sleep, SoulMark, SwarmIntelTracker, Terror, Hero, HeroClass, HeroSubClass, Talent, Talent$BountyHunterTracker, Talent$LethalHasteCooldown, Talent$LethalMomentumTracker, ArmorAbility, PowerOfMany, PowerOfMany$PowerBuff, Feint$AfterImage, Feint$AfterImage$FeintConfusion, ShadowClone$ShadowAlly, ClericSpell, GuidingLight$Illuminated, Stasis, Wraith, DirectableAlly, CellEmitter, FloatingText, Surprise, Wound, ShadowParticle, Generator, Generator$Category, MasterThievesArmband$StolenTracker, TalismanOfForesight$CharAwareness, TimekeepersHourglass$timeFreeze, ExoticPotion, Ring, RingOfWealth, RingOfWealth$Wealth, ExoticScroll, StoneOfAggression$Aggression, ExoticCrystals, ShardOfOblivion, Wand, SpiritBow$SpiritArrow, Weapon, Weapon$Enchantment, Lucky, Lucky$LuckProc, MissileWeapon, Dart, Bestiary, VaultLevel, Chasm, Trap$HazardAssistTracker, Messages, Swiftthistle$TimeBubble, GameScene, CharSprite, CharSprite$State, DungeonTilemap, GLog, Sample, AlphaTweener, GameMath, PathFinder, PointF, Random, Reflection;

export class Mob extends Char {
  SLEEPING: Mob$AiState = null;
  HUNTING: Mob$AiState = null;
  INVESTIGATING: Mob$AiState = null;
  WANDERING: Mob$AiState = null;
  FLEEING: Mob$AiState = null;
  PASSIVE: Mob$AiState = null;
  state_: Mob$AiState = null;
  spriteClass: JClass<CharSprite> = null;
  target: number = 0;
  defenseSkill_: number = 0;
  EXP: number = 0;
  maxLvl: number = 0;
  enemy: Char = null;
  enemyID: number = 0;
  enemySeen: boolean = false;
  alerted: boolean = false;
  static readonly TIME_TO_WAKE_UP: number = 1;
  firstAdded: boolean = false;
  static readonly STATE: string = 'state';
  static readonly SEEN: string = 'seen';
  static readonly TARGET: string = 'target';
  static readonly MAX_LVL: string = 'max_lvl';
  static readonly ENEMY_ID: string = 'enemy_id';
  static readonly SWARM_TIME: string = 'swarm_time';
  static readonly USING_STEALTH: string = 'using_stealth';
  static readonly INVEST_TURNS: string = 'invest_turns';
  static readonly WANDER_POSITIONS: string = 'wander_positions';
  static readonly WANDER_POS_IDX: string = 'wander_pos_idx';
  timeSeenAt: number = 0;
  intelligentAlly: boolean = false;
  movementShadow: CharSprite = null;
  shadowFade: AlphaTweener = null;
  loot: any = null;
  lootChance_: number = 0;
  recentlyAttackedBy: ArrayList<Char> = null;
  usingStealthGamePlay: boolean = false;
  investigatingTurns: number = 0;
  wanderPosIdx: number = 0;
  wanderPositions: number[] = null;
  static heldAllies: ArrayList<Mob> = null;
  _Mob(): this {
    this._Char();
    this.actPriority = Actor.MOB_PRIO;
    this.alignment = Char$Alignment.ENEMY;
    this.SLEEPING = new Mob$Sleeping().$o(this)._Mob$Sleeping();
    this.HUNTING = new Mob$Hunting().$o(this)._Mob$Hunting();
    this.INVESTIGATING = new Mob$Investigating().$o(this)._Mob$Investigating();
    this.WANDERING = new Mob$Wandering().$o(this)._Mob$Wandering();
    this.FLEEING = new Mob$Fleeing().$o(this)._Mob$Fleeing();
    this.PASSIVE = new Mob$Passive().$o(this)._Mob$Passive();
    this.state_ = this.SLEEPING;
    this.target = -1;
    this.defenseSkill_ = 0;
    this.EXP = 1;
    this.maxLvl = (Hero.MAX_LEVEL - 1) | 0;
    this.enemyID = -1;
    this.alerted = false;
    this.firstAdded = true;
    this.timeSeenAt = Math.fround(3.4028235E38);
    this.intelligentAlly = false;
    this.loot = null;
    this.lootChance_ = 0;
    this.recentlyAttackedBy = new ArrayList();
    this.wanderPosIdx = 0;
    return this;
  }
  onAdd(): void {
    if (this.firstAdded) {
      let percent = Math.fround(this.HP / Math.fround(this.HT));
      this.HT = $J.roundf(Math.fround(this.HT * AscensionChallenge.statModifier(this)));
      this.HP = $J.roundf(Math.fround(this.HT * percent));
      this.firstAdded = false;
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    if (this.state_ === this.SLEEPING) {
      bundle.put$String$String(Mob.STATE, Mob$Sleeping.TAG);
    } else if (this.state_ === this.WANDERING) {
      bundle.put$String$String(Mob.STATE, Mob$Wandering.TAG);
    } else if (this.state_ === this.INVESTIGATING) {
      bundle.put$String$String(Mob.STATE, Mob$Investigating.TAG);
    } else if (this.state_ === this.HUNTING) {
      bundle.put$String$String(Mob.STATE, Mob$Hunting.TAG);
    } else if (this.state_ === this.FLEEING) {
      bundle.put$String$String(Mob.STATE, Mob$Fleeing.TAG);
    } else if (this.state_ === this.PASSIVE) {
      bundle.put$String$String(Mob.STATE, Mob$Passive.TAG);
    }
    bundle.put$String$boolean(Mob.SEEN, this.enemySeen);
    bundle.put$String$int(Mob.TARGET, this.target);
    bundle.put$String$int(Mob.MAX_LVL, this.maxLvl);
    if (this.enemy != null) {
      bundle.put$String$int(Mob.ENEMY_ID, this.enemy.id());
    }
    bundle.put$String$float(Mob.SWARM_TIME, this.timeSeenAt);
    bundle.put$String$boolean(Mob.USING_STEALTH, this.usingStealthGamePlay);
    if (this.usingStealthGamePlay) {
      bundle.put$String$int(Mob.INVEST_TURNS, this.investigatingTurns);
      if (this.wanderPositions != null) {
        bundle.put$String$intArr(Mob.WANDER_POSITIONS, this.wanderPositions);
        bundle.put$String$int(Mob.WANDER_POS_IDX, this.wanderPosIdx);
      }
    }
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    if (bundle.getBoolean(Mob.USING_STEALTH)) {
      this.activateSteathGameplayBehaviour();
      this.investigatingTurns = bundle.getInt(Mob.INVEST_TURNS);
      if (bundle.contains(Mob.WANDER_POSITIONS)) {
        this.wanderPositions = bundle.getIntArray(Mob.WANDER_POSITIONS);
        this.wanderPosIdx = bundle.getInt(Mob.WANDER_POS_IDX);
      }
    }
    let state = bundle.getString(Mob.STATE);
    if ($J.equals(state, Mob$Sleeping.TAG)) {
      this.state_ = this.SLEEPING;
    } else if ($J.equals(state, Mob$Wandering.TAG)) {
      this.state_ = this.WANDERING;
    } else if ($J.equals(state, Mob$Investigating.TAG)) {
      this.state_ = this.INVESTIGATING;
    } else if ($J.equals(state, Mob$Hunting.TAG)) {
      this.state_ = this.HUNTING;
    } else if ($J.equals(state, Mob$Fleeing.TAG)) {
      this.state_ = this.FLEEING;
    } else if ($J.equals(state, Mob$Passive.TAG)) {
      this.state_ = this.PASSIVE;
    }
    this.enemySeen = bundle.getBoolean(Mob.SEEN);
    this.target = bundle.getInt(Mob.TARGET);
    this.maxLvl = bundle.getInt(Mob.MAX_LVL);
    if (bundle.contains(Mob.ENEMY_ID)) {
      this.enemyID = bundle.getInt(Mob.ENEMY_ID);
    }
    this.timeSeenAt = bundle.getFloat(Mob.SWARM_TIME);
    this.firstAdded = false;
  }
  restoreEnemy(): void {
    if (this.enemyID !== -1 && this.enemy == null) {
      this.enemy = Actor.findById(this.enemyID);
    }
  }
  sprite(): CharSprite {
    return Reflection.newInstance(this.spriteClass);
  }
  act(): boolean {
    super.act();
    let justAlerted = this.alerted;
    this.alerted = false;
    if (justAlerted) {
      this.sprite_.showAlert();
    } else {
      this.sprite_.hideAlert();
      this.sprite_.hideLost();
      this.sprite_.hideInvestigate();
    }
    if (this.paralysed > 0) {
      this.enemySeen = false;
      this.processSwarmIntel(false);
      this.spend(Actor.TICK);
      return true;
    }
    if (this.buff($J.cls(Terror)) != null || this.buff($J.cls(Dread)) != null) {
      this.state_ = this.FLEEING;
    }
    this.enemy = this.chooseEnemy();
    let enemyInFOV = this.enemy != null && this.enemy.isAlive() && this.fieldOfView[this.enemy.pos] && this.enemy.invisible <= 0;
    if (this.buff($J.cls(Feint$AfterImage$FeintConfusion)) != null) {
      this.enemySeen = enemyInFOV;
      this.spend(Actor.TICK);
      return true;
    }
    let curState = this.state_;
    let result = this.state_.act(enemyInFOV, justAlerted);
    this.processSwarmIntel(enemyInFOV && this.state_ === curState);
    if (this.buff($J.cls(PowerOfMany$PowerBuff)) != null) {
      Dungeon.level.updateFieldOfView(this, this.fieldOfView);
      GameScene.updateFog$int$int(this.pos, (this.viewDistance + $J.d2i(Math.ceil(this.speed()))) | 0);
    }
    return result;
  }
  processSwarmIntel(enemyInFOV: boolean): void {
    if (this.alignment === Char$Alignment.ENEMY && this.state_ === this.HUNTING && Dungeon.isChallenged(Challenges.SWARM_INTELLIGENCE) && enemyInFOV && this.enemy != null && this.enemy.alignment === Char$Alignment.ALLY) {
      if (this.timeSeenAt >= Actor.now()) {
        this.timeSeenAt = Math.fround(Actor.now() - 1);
      }
      let range = this.swarmAlertRange();
      for (const $it0 = Dungeon.level.mobs.iterator(); $it0.hasNext(); ) {
        let mob = $it0.next();
        if (mob.alignment === Char$Alignment.ENEMY && mob.paralysed <= 0 && Dungeon.level.distance(this.pos, mob.pos) <= range && mob.state_ !== mob.HUNTING) {
          mob.beckon(this.enemy.pos);
        }
      }
      Buff.affect$Char$Class(Dungeon.hero, $J.cls(SwarmIntelTracker));
    } else {
      this.timeSeenAt = Math.fround(3.4028235E38);
    }
  }
  swarmAlertRange(): number {
    let range = Math.imul(2, $J.d2i(Math.max(Math.fround(Actor.now() - this.timeSeenAt), 0)));
    return $J.d2i(GameMath.gate(0, Math.fround(range), 12));
  }
  fixTime(decrement: number): void {
    if (this.swarmAlertRange() > 0) {
      this.timeSeenAt = Math.fround(this.timeSeenAt - decrement);
    }
    super.fixTime(decrement);
  }
  chooseEnemy(): Char {
    let dread = this.buff($J.cls(Dread));
    if (dread != null) {
      let source = Actor.findById(dread.object);
      if (source != null) {
        return source;
      }
    }
    let terror = this.buff($J.cls(Terror));
    if (terror != null) {
      let source = Actor.findById(terror.object);
      if (source != null) {
        return source;
      }
    }
    if ((this.alignment === Char$Alignment.ENEMY || this.buff($J.cls(Amok)) != null) && this.state_ !== this.PASSIVE && this.state_ !== this.SLEEPING) {
      if (this.enemy != null && this.enemy.buff($J.cls(StoneOfAggression$Aggression)) != null) {
        this.state_ = this.HUNTING;
        return this.enemy;
      }
      for (const $it1 = Actor.chars().iterator(); $it1.hasNext(); ) {
        let ch = $it1.next();
        if (ch !== this && this.fieldOfView[ch.pos] && ch.buff($J.cls(StoneOfAggression$Aggression)) != null) {
          this.state_ = this.HUNTING;
          return ch;
        }
      }
    }
    let newEnemy = false;
    if (this.enemy == null || !this.enemy.isAlive() || !Actor.chars().contains(this.enemy) || this.state_ === this.WANDERING) {
      newEnemy = true;
    } else if (this.buff($J.cls(Amok)) != null && this.enemy === Dungeon.hero) {
      newEnemy = true;
    } else if (this.buff($J.cls(Charm)) != null && this.buff($J.cls(Charm)).object === this.enemy.id()) {
      newEnemy = true;
    }
    if (!newEnemy && this.alignment === Char$Alignment.ALLY) {
      if (this.enemy.alignment === Char$Alignment.ALLY) {
        newEnemy = true;
      } else if (this.enemy.isInvulnerable($J.getClass(this))) {
        newEnemy = true;
      }
    }
    if (newEnemy) {
      let enemies = new HashSet();
      if (this.buff($J.cls(Amok)) != null) {
        for (const $it2 = Dungeon.level.mobs.iterator(); $it2.hasNext(); ) {
          let mob = $it2.next();
          if (mob.alignment === Char$Alignment.ENEMY && mob !== this && this.fieldOfView[mob.pos] && mob.invisible <= 0) {
            enemies.add(mob);
          }
        }
        if (enemies.isEmpty()) {
          for (const $it3 = Dungeon.level.mobs.iterator(); $it3.hasNext(); ) {
            let mob = $it3.next();
            if (mob.alignment === Char$Alignment.ALLY && mob !== this && this.fieldOfView[mob.pos] && mob.invisible <= 0) {
              enemies.add(mob);
            }
          }
          if (enemies.isEmpty()) {
            if (this.fieldOfView[Dungeon.hero.pos] && Dungeon.hero.invisible <= 0) {
              enemies.add(Dungeon.hero);
            }
          }
        }
      } else if (this.alignment === Char$Alignment.ALLY) {
        for (const $it4 = Dungeon.level.mobs.iterator(); $it4.hasNext(); ) {
          let mob = $it4.next();
          if (mob.alignment === Char$Alignment.ENEMY && this.fieldOfView[mob.pos] && mob.invisible <= 0 && !mob.isInvulnerable($J.getClass(this))) {
            if (mob.state_ !== mob.PASSIVE && (!this.intelligentAlly || (mob.state_ !== mob.SLEEPING && mob.state_ !== mob.WANDERING))) {
              enemies.add(mob);
            }
          }
        }
      } else if (this.alignment === Char$Alignment.ENEMY) {
        for (const $it5 = Dungeon.level.mobs.iterator(); $it5.hasNext(); ) {
          let mob = $it5.next();
          if (mob.alignment === Char$Alignment.ALLY && this.fieldOfView[mob.pos] && mob.invisible <= 0) {
            enemies.add(mob);
          }
        }
        if (this.fieldOfView[Dungeon.hero.pos] && Dungeon.hero.invisible <= 0) {
          enemies.add(Dungeon.hero);
        }
      }
      let charm = this.buff($J.cls(Charm));
      if (charm != null) {
        let source = Actor.findById(charm.object);
        if (source != null && enemies.contains(source) && enemies.size() > 1) {
          enemies.remove(source);
        }
      }
      if (enemies.isEmpty()) {
        return null;
      } else {
        PathFinder.buildDistanceMap$int$booleanArr(this.pos, Dungeon.findPassable$Char$booleanArr$booleanArr$boolean(this, Dungeon.level.passable, this.fieldOfView, true));
        let closest = null;
        let closestDist = 2147483647;
        for (const $it6 = enemies.iterator(); $it6.hasNext(); ) {
          let curr = $it6.next();
          let currDist = 2147483647;
          for (let i of PathFinder.NEIGHBOURS8) {
            if ((PathFinder.distance[(curr.pos + i) | 0]) < currDist) {
              currDist = PathFinder.distance[(curr.pos + i) | 0];
            }
          }
          if (closest == null) {
            closest = curr;
            closestDist = currDist;
          } else if (this.canAttack(closest) && !this.canAttack(curr)) {
            continue;
          } else if ((this.canAttack(curr) && !this.canAttack(closest)) || (currDist < closestDist)) {
            closest = curr;
          } else if (curr === Dungeon.hero && (currDist === closestDist) || (this.canAttack(curr) && this.canAttack(closest))) {
            closest = curr;
          }
        }
        if (closest === Dungeon.hero) {
          for (const $it7 = enemies.iterator(); $it7.hasNext(); ) {
            let ch = $it7.next();
            if (ch instanceof Feint$AfterImage) {
              closest = ch;
              break;
            }
          }
        }
        return closest;
      }
    } else {
      return this.enemy;
    }
  }
  add(buff: Buff): boolean {
    if (super.add(buff)) {
      if (buff instanceof Amok || buff instanceof AllyBuff) {
        this.state_ = this.HUNTING;
      } else if (buff instanceof Terror || buff instanceof Dread) {
        this.state_ = this.FLEEING;
      } else if (buff instanceof Sleep) {
        this.state_ = this.SLEEPING;
        this.postpone(Sleep.SWS);
      }
      return true;
    }
    return false;
  }
  remove$Buff(buff: Buff): boolean {
    if (super.remove$Buff(buff)) {
      if (this.state_ === this.FLEEING && ((buff instanceof Terror && this.buff($J.cls(Dread)) == null) || (buff instanceof Dread && this.buff($J.cls(Terror)) == null))) {
        if (this.enemySeen) {
          this.sprite_.showStatus(CharSprite.WARNING, Messages.get$Object$String$ObjectArr(this, 'rage', []), []);
          this.state_ = this.HUNTING;
        } else {
          this.state_ = this.WANDERING;
        }
      }
      return true;
    }
    return false;
  }
  canAttack(enemy: Char): boolean {
    if (Dungeon.level.adjacent(this.pos, enemy.pos)) {
      return true;
    }
    for (const $it8 = this.buffs$Class($J.cls(ChampionEnemy)).iterator(); $it8.hasNext(); ) {
      let buff = $it8.next();
      if (buff.canAttackWithExtraReach(enemy)) {
        return true;
      }
    }
    return false;
  }
  cellIsPathable(cell: number): boolean {
    if (!Dungeon.level.passable[cell]) {
      if (this.flying || this.buff($J.cls(Amok)) != null) {
        if (!Dungeon.level.avoid[cell]) {
          return false;
        }
      } else {
        return false;
      }
    }
    if (Char.hasProp(this, Char$Property.LARGE) && !Dungeon.level.openSpace[cell]) {
      return false;
    }
    if (Actor.findChar(cell) != null) {
      return false;
    }
    return true;
  }
  getCloser(target: number): boolean {
    if (this.rooted || target === this.pos || !Dungeon.level.insideMap(target)) {
      return false;
    }
    let step = -1;
    if (Dungeon.level.adjacent(this.pos, target)) {
      this.path = null;
      if (this.cellIsPathable(target)) {
        step = target;
      }
    } else {
      let newPath = false;
      let longFactor = this.state_ === this.WANDERING ? 2 : Math.fround(1.33);
      if (this.path == null || this.path.isEmpty() || !Dungeon.level.adjacent(this.pos, this.path.getFirst()) || Math.fround(this.path.size()) > Math.fround(longFactor * Dungeon.level.distance(this.pos, target))) {
        newPath = true;
      } else if (this.path.getLast() !== target) {
        if (Dungeon.level.adjacent(target, this.path.getLast())) {
          let last = this.path.removeLast();
          if (this.path.isEmpty()) {
            if (Dungeon.level.adjacent(target, this.pos)) {
              this.path.add(target);
            } else {
              this.path.add(last);
              this.path.add(target);
            }
          } else {
            if (this.path.getLast() === target) {
            } else if (Dungeon.level.adjacent(target, this.path.getLast())) {
              this.path.add(target);
            } else {
              this.path.add(last);
              this.path.add(target);
            }
          }
        } else {
          newPath = true;
        }
      }
      if (!newPath) {
        let nextCell = this.path.removeFirst();
        if (!this.cellIsPathable(nextCell)) {
          newPath = true;
          if (!this.path.isEmpty()) {
            for (let i of PathFinder.NEIGHBOURS8) {
              if (Dungeon.level.adjacent(this.pos, (nextCell + i) | 0) && Dungeon.level.adjacent((nextCell + i) | 0, this.path.getFirst())) {
                if (this.cellIsPathable((nextCell + i) | 0)) {
                  this.path.addFirst((nextCell + i) | 0);
                  newPath = false;
                  break;
                }
              }
            }
          }
        } else {
          this.path.addFirst(nextCell);
        }
      }
      if (newPath) {
        let full = Dungeon.findPath(this, target, Dungeon.level.passable, this.fieldOfView, true);
        if (this.state_ !== this.HUNTING && this.state_ !== this.INVESTIGATING) {
          this.path = full;
        } else {
          let ignoreChars = Dungeon.findPath(this, target, Dungeon.level.passable, this.fieldOfView, false);
          if (ignoreChars != null && (full == null || full.size() > Math.imul(2, ignoreChars.size()))) {
            this.path = ignoreChars;
            if (!this.cellIsPathable(ignoreChars.getFirst())) {
              return false;
            }
          } else {
            this.path = full;
          }
        }
      }
      if (this.path != null) {
        step = this.path.removeFirst();
      } else {
        return false;
      }
    }
    if (step !== -1) {
      this.move$int(step);
      return true;
    } else {
      return false;
    }
  }
  getFurther(target: number): boolean {
    if (this.rooted || target === this.pos) {
      return false;
    }
    let step = Dungeon.flee(this, target, Dungeon.level.passable, this.fieldOfView, true);
    if (step !== -1) {
      this.move$int(step);
      return true;
    } else {
      return false;
    }
  }
  move$int$boolean(step: number, travelling: boolean): void {
    let from = this.pos;
    super.move$int$boolean(step, travelling);
    if (this.usingStealthGamePlay && travelling && this.sprite_ != null && !this.sprite_.visible_ && Dungeon.level.distance(this.pos, Dungeon.hero.pos) <= 6) {
      if (!Dungeon.level.visited[this.pos] && !Dungeon.level.mapped[this.pos]) {
        PathFinder.buildDistanceMap$int$booleanArr$int(Dungeon.hero.pos, Dungeon.level.passable, 6);
        if (PathFinder.distance[this.pos] !== 2147483647) {
          Dungeon.level.visited[this.pos] = true;
          GameScene.updateFog$int$int(this.pos, 1);
        }
      }
      if (this.movementShadow == null || this.movementShadow.parent == null) {
        this.movementShadow = this.sprite();
        this.sprite_.parent.add$Gizmo(this.movementShadow);
      }
      this.movementShadow.point$PointF(DungeonTilemap.raisedTileCenterToWorld(from));
      this.movementShadow.x = Math.fround(this.movementShadow.x - Math.fround(this.movementShadow.width() / 2));
      this.movementShadow.y = Math.fround(this.movementShadow.y - Math.fround(this.movementShadow.height() / 2));
      this.movementShadow.move(from, this.pos);
      this.movementShadow.alpha$float(this.sprite_.alpha$());
      if (this.shadowFade == null) {
        this.shadowFade = new (Mob$1())().$o(this)._AlphaTweener(this.movementShadow, 0, 1);
        this.sprite_.parent.add$Gizmo(this.shadowFade);
      } else {
        this.shadowFade.elapsed = 0;
      }
    }
  }
  updateSpriteState(): void {
    super.updateSpriteState();
    if (Dungeon.hero.buff($J.cls(TimekeepersHourglass$timeFreeze)) != null || Dungeon.hero.buff($J.cls(Swiftthistle$TimeBubble)) != null) {
      this.sprite_.add(CharSprite$State.PARALYSED);
    }
  }
  attackDelay(): number {
    let delay = 1;
    if (this.buff($J.cls(Adrenaline)) != null) {
      delay = Math.fround(delay / 1.5);
    }
    return delay;
  }
  doAttack(enemy: Char): boolean {
    if (this.sprite_ != null && (this.sprite_.visible_ || enemy.sprite_.visible_)) {
      this.sprite_.attack$int(enemy.pos);
      return false;
    } else {
      this.attack$Char(enemy);
      Invisibility.dispel$Char(this);
      this.spend(this.attackDelay());
      return true;
    }
  }
  onAttackComplete(): void {
    this.attack$Char(this.enemy);
    Invisibility.dispel$Char(this);
    this.spend(this.attackDelay());
    super.onAttackComplete();
  }
  defenseSkill(enemy: Char): number {
    if (this.buff($J.cls(GuidingLight$Illuminated)) != null && Dungeon.hero.heroClass === HeroClass.CLERIC) {
      if (enemy instanceof Hero) {
        let h = enemy;
        if (!(h.belongings.attackingWeapon() instanceof Weapon) || (h.belongings.attackingWeapon()).STRReq$() <= h.STR()) {
          return 0;
        }
      } else {
        return 0;
      }
    }
    if (!this.surprisedBy$Char(enemy) && this.paralysed === 0 && !(this.alignment === Char$Alignment.ALLY && enemy === Dungeon.hero)) {
      return this.defenseSkill_;
    } else {
      return 0;
    }
  }
  defenseProc(enemy: Char, damage: number): number {
    if (enemy instanceof Hero && (enemy).belongings.attackingWeapon() instanceof MissileWeapon) {
      Statistics.thrownAttacks++;
      Badges.validateHuntressUnlock();
    }
    if (this.surprisedBy$Char(enemy)) {
      Statistics.sneakAttacks++;
      Badges.validateRogueUnlock();
      if (Dungeon.hero.belongings.attackingWeapon() instanceof SpiritBow$SpiritArrow || Dungeon.hero.belongings.attackingWeapon() instanceof Dart) {
        Sample.INSTANCE.playDelayed$Object$float(Assets$Sounds.HIT_STRONG, 0.125);
      } else {
        Sample.INSTANCE.play$Object(Assets$Sounds.HIT_STRONG);
      }
      if (enemy.buff($J.cls(Preparation)) != null) {
        Wound.hit$Char(this);
      } else {
        Surprise.hit$Char(this);
      }
    }
    if (this.state_ !== this.FLEEING) {
      if (this.state_ !== this.HUNTING) {
        this.aggro(enemy);
        this.target = enemy.pos;
      } else {
        this.recentlyAttackedBy.add(enemy);
      }
    }
    if (this.buff($J.cls(SoulMark)) != null) {
      let restoration = Math.min(damage, (this.HP + this.shielding()) | 0);
      if (enemy !== Dungeon.hero) {
        restoration = $J.roundf(Math.fround(Math.fround(Math.fround(restoration * Math.fround(0.4)) * Dungeon.hero.pointsInTalent(Talent.SOUL_SIPHON)) / 3));
      }
      if (restoration > 0) {
        Buff.affect$Char$Class(Dungeon.hero, $J.cls(Hunger)).affectHunger$float(Math.fround(Math.imul(restoration, Dungeon.hero.pointsInTalent(Talent.SOUL_EATER)) / 3));
        if (Dungeon.hero.HP < Dungeon.hero.HT) {
          let heal = $J.d2i(Math.ceil(Math.fround(restoration * Math.fround(0.4))));
          Dungeon.hero.HP = Math.min(Dungeon.hero.HT, (Dungeon.hero.HP + heal) | 0);
          Dungeon.hero.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(heal), FloatingText.HEALING, []);
        }
      }
    }
    return super.defenseProc(enemy, damage);
  }
  speed(): number {
    return Math.fround(super.speed() * AscensionChallenge.enemySpeedModifier(this));
  }
  surprisedBy$Char(enemy: Char): boolean {
    return this.surprisedBy$Char$boolean(enemy, true);
  }
  surprisedBy$Char$boolean(enemy: Char, attacking: boolean): boolean {
    return enemy === Dungeon.hero && (enemy.invisible > 0 || !this.enemySeen || (this.fieldOfView != null && this.fieldOfView.length === Dungeon.level.length() && !this.fieldOfView[enemy.pos])) && (!attacking || enemy.canSurpriseAttack());
  }
  heroShouldInteract(): boolean {
    return this.alignment !== Char$Alignment.ENEMY && this.buff($J.cls(Amok)) == null;
  }
  aggro(ch: Char): void {
    this.enemy = ch;
    if (this.state_ !== this.PASSIVE) {
      this.state_ = this.HUNTING;
    }
  }
  clearEnemy(): void {
    this.enemy = null;
    this.enemySeen = false;
    if (this.state_ === this.HUNTING) {
      this.state_ = this.WANDERING;
    }
  }
  isTargeting(ch: Char): boolean {
    return this.enemy === ch;
  }
  damage(dmg: number, src: any): void {
    if (!this.isInvulnerable($J.getClass(src))) {
      if (this.state_ === this.SLEEPING) {
        this.state_ = this.WANDERING;
      }
      if (!(src instanceof Corruption) && this.state_ !== this.FLEEING) {
        if (this.state_ !== this.HUNTING) {
          this.alerted = true;
          if (src instanceof Wand || src instanceof ClericSpell || src instanceof ArmorAbility) {
            this.aggro(Dungeon.hero);
            this.target = Dungeon.hero.pos;
          }
        } else {
          if (src instanceof Wand || src instanceof ClericSpell || src instanceof ArmorAbility) {
            this.recentlyAttackedBy.add(Dungeon.hero);
          }
        }
      }
    }
    super.damage(dmg, src);
  }
  destroy(): void {
    super.destroy();
    Dungeon.level.mobs.remove(this);
    if (Dungeon.hero.buff($J.cls(MindVision)) != null) {
      Dungeon.observe$();
      GameScene.updateFog$int$int(this.pos, 2);
    }
    if (Dungeon.hero.isAlive()) {
      if (this.alignment === Char$Alignment.ENEMY) {
        Statistics.enemiesSlain++;
        Badges.validateMonstersSlain();
        Statistics.qualifiedForNoKilling = false;
        Bestiary.setSeen($J.getClass(this));
        Bestiary.countEncounter($J.getClass(this));
        AscensionChallenge.processEnemyKill(this);
        let exp = Dungeon.hero.lvl <= this.maxLvl ? this.EXP : 0;
        if (Dungeon.hero.buff($J.cls(AscensionChallenge)) != null && exp === 0 && this.maxLvl > 0 && this.EXP > 0 && Dungeon.hero.lvl < Hero.MAX_LEVEL) {
          exp = $J.roundf(Math.fround(10 * this.spawningWeight()));
        }
        if (exp > 0) {
          Dungeon.hero.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(exp), FloatingText.EXPERIENCE, []);
        }
        Dungeon.hero.earnExp(exp, $J.getClass(this));
        if (exp === 0 && Dungeon.level instanceof VaultLevel) {
          let ring = Dungeon.hero.belongings.ring();
          if (ring != null) {
            ring.onHeroGainExp(Math.fround(0.2), Dungeon.hero);
          }
          let misc = Dungeon.hero.belongings.misc();
          if (misc instanceof Ring) {
            misc.onHeroGainExp(Math.fround(0.2), Dungeon.hero);
          }
        }
        if (Dungeon.hero.subClass === HeroSubClass.MONK) {
          Buff.affect$Char$Class(Dungeon.hero, $J.cls(MonkEnergy)).gainEnergy(this);
        }
      }
    }
  }
  die(cause: any): void {
    if (cause === $J.cls(Chasm)) {
      if (this.EXP % 2 === 1) {
        this.EXP = (this.EXP + Random.Int$int(2)) | 0;
      }
      this.EXP = $J.idiv(this.EXP, 2);
    }
    if (this.alignment === Char$Alignment.ENEMY) {
      if (this.buff($J.cls(Trap$HazardAssistTracker)) != null) {
        Statistics.hazardAssistedKills++;
        Badges.validateHazardAssists();
      }
      this.rollToDropLoot();
      if (cause === Dungeon.hero || cause instanceof Weapon || cause instanceof Weapon$Enchantment) {
        if (Dungeon.hero.hasTalent(Talent.LETHAL_MOMENTUM) && Random.Float$() < Math.fround(Math.fround(0.34) + Math.fround(Math.fround(0.33) * Dungeon.hero.pointsInTalent(Talent.LETHAL_MOMENTUM)))) {
          Buff.affect$Char$Class$float(Dungeon.hero, $J.cls(Talent$LethalMomentumTracker), 0);
        }
        if (Dungeon.hero.heroClass !== HeroClass.DUELIST && Dungeon.hero.hasTalent(Talent.LETHAL_HASTE) && Dungeon.hero.buff($J.cls(Talent$LethalHasteCooldown)) == null) {
          Buff.affect$Char$Class$float(Dungeon.hero, $J.cls(Talent$LethalHasteCooldown), 100);
          Buff.affect$Char$Class(Dungeon.hero, $J.cls(GreaterHaste)).set((2 + Math.imul(2, Dungeon.hero.pointsInTalent(Talent.LETHAL_HASTE))) | 0);
        }
      }
    }
    if (Dungeon.hero.isAlive() && !Dungeon.level.heroFOV[this.pos]) {
      GLog.i(Messages.get$Object$String$ObjectArr(this, 'died', []), []);
    }
    let soulMarked = this.buff($J.cls(SoulMark)) != null;
    super.die(cause);
    if (!(this instanceof Wraith) && soulMarked && Random.Float$() < (Math.fround(Math.fround(Math.fround(0.4) * Dungeon.hero.pointsInTalent(Talent.NECROMANCERS_MINIONS)) / 3))) {
      let w = Wraith.spawnAt$int$Class(this.pos, $J.cls(Wraith));
      if (w != null) {
        Buff.affect$Char$Class(w, $J.cls(Corruption));
        if (Dungeon.level.heroFOV[this.pos]) {
          CellEmitter.get(this.pos).burst(ShadowParticle.CURSE, 6);
          Sample.INSTANCE.play$Object(Assets$Sounds.CURSED);
        }
      }
    }
  }
  lootChance(): number {
    let lootChance = this.lootChance_;
    let dropBonus = RingOfWealth.dropChanceMultiplier(Dungeon.hero);
    let bhTracker = Dungeon.hero.buff($J.cls(Talent$BountyHunterTracker));
    if (bhTracker != null) {
      let prep = Dungeon.hero.buff($J.cls(Preparation));
      if (prep != null) {
        let bhBonus = Math.fround(Math.fround(0.02) * Math.fround($J.pow(2, (prep.attackLevel() - 1) | 0)));
        bhBonus = Math.fround(bhBonus * Dungeon.hero.pointsInTalent(Talent.BOUNTY_HUNTER));
        dropBonus = Math.fround(dropBonus + bhBonus);
      }
    }
    dropBonus = Math.fround(dropBonus + Math.fround(ShardOfOblivion.lootChanceMultiplier$() - 1));
    return Math.fround(lootChance * dropBonus);
  }
  rollToDropLoot(): void {
    if (Dungeon.hero.lvl > ((this.maxLvl + 2) | 0)) {
      return;
    }
    let stolen = this.buff($J.cls(MasterThievesArmband$StolenTracker));
    if (stolen == null || !stolen.itemWasStolen()) {
      if (Random.Float$() < this.lootChance()) {
        let loot = this.createLoot();
        if (loot != null) {
          Dungeon.level.drop(loot, this.pos).sprite_.drop$();
        }
      }
    }
    if (Ring.getBuffedBonus(Dungeon.hero, $J.cls(RingOfWealth$Wealth)) > 0) {
      let rolls = 1;
      if (this.properties_.contains(Char$Property.BOSS)) {
        rolls = 15;
      } else if (this.properties_.contains(Char$Property.MINIBOSS)) {
        rolls = 5;
      }
      let bonus = RingOfWealth.tryForBonusDrop(Dungeon.hero, rolls);
      if (bonus != null && !bonus.isEmpty()) {
        for (const $it9 = bonus.iterator(); $it9.hasNext(); ) {
          let b = $it9.next();
          Dungeon.level.drop(b, this.pos).sprite_.drop$();
        }
        RingOfWealth.showFlareForBonusDrop(this.sprite_);
      }
    }
    if (this.buff($J.cls(Lucky$LuckProc)) != null) {
      Dungeon.level.drop(this.buff($J.cls(Lucky$LuckProc)).genLoot(), this.pos).sprite_.drop$();
      Lucky.showFlare(this.sprite_);
    }
    if (this.buff($J.cls(SoulMark)) != null && Random.Int$int(10) < Dungeon.hero.pointsInTalent(Talent.SOUL_EATER)) {
      Talent.onFoodEaten(Dungeon.hero, 0, null);
    }
  }
  createLoot(): Item {
    let item: Item;
    if (this.loot instanceof Generator$Category) {
      item = Generator.randomUsingDefaults$Category(this.loot);
    } else if ($J.isa(this.loot, JClass)) {
      if (ExoticPotion.regToExo.containsKey(this.loot)) {
        if (Random.Float$() < ExoticCrystals.consumableExoticChance$()) {
          return Generator.random$Class(ExoticPotion.regToExo.get(this.loot));
        }
      } else if (ExoticScroll.regToExo.containsKey(this.loot)) {
        if (Random.Float$() < ExoticCrystals.consumableExoticChance$()) {
          return Generator.random$Class(ExoticScroll.regToExo.get(this.loot));
        }
      }
      item = Generator.random$Class(this.loot);
    } else {
      item = this.loot;
    }
    return item;
  }
  spawningWeight(): number {
    return 1;
  }
  reset(): boolean {
    return false;
  }
  beckon(cell: number): void {
    this.notice();
    if (this.state_ !== this.HUNTING && this.state_ !== this.FLEEING) {
      this.state_ = this.WANDERING;
    }
    this.target = cell;
  }
  description(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', []);
  }
  info(): string {
    let desc = this.description();
    for (const $it10 = this.buffs$Class($J.cls(ChampionEnemy)).iterator(); $it10.hasNext(); ) {
      let b = $it10.next();
      desc += '\n\n_' + Messages.titleCase(b.name()) + '_\n' + b.desc();
    }
    return desc;
  }
  notice(): void {
    this.sprite_.showAlert();
  }
  yell(str: string): void {
    GLog.newLine();
    GLog.n('%s: "%s" ', [Messages.titleCase(this.name()), str]);
  }
  landmark(): Notes$Landmark {
    return null;
  }
  activateSteathGameplayBehaviour(): void {
    if (!this.usingStealthGamePlay) {
      this.usingStealthGamePlay = true;
      let oldInvestigate = this.INVESTIGATING;
      this.INVESTIGATING = new Mob$StealthGameplayInvestigating().$o(this)._Mob$StealthGameplayInvestigating();
      if (this.state_ === oldInvestigate) {
        this.state_ = this.INVESTIGATING;
      }
      let oldWander = this.WANDERING;
      this.WANDERING = new Mob$StealthGameplayWandering().$o(this)._Mob$StealthGameplayWandering();
      if (this.state_ === oldWander) {
        this.state_ = this.WANDERING;
      }
      let oldSleep = this.SLEEPING;
      this.SLEEPING = new Mob$StealthGameplaySleeping().$o(this)._Mob$StealthGameplaySleeping();
      if (this.state_ === oldSleep) {
        this.state_ = this.SLEEPING;
      }
    }
  }
  setupStealthGameplayWanderPositions(wanderPositions: number[], startingIdx: number): void {
    this.wanderPositions = wanderPositions;
    this.wanderPosIdx = startingIdx;
  }
  static holdAllies$Level(level: Level): void {
    Mob.holdAllies$Level$int(level, Dungeon.hero.pos);
  }
  static holdAllies$Level$int(level: Level, holdFromPos: number): void {
    Mob.heldAllies.clear();
    for (let mob of $J.toArrayInto(level.mobs.toArray(), $J.newArray(0, null))) {
      if (mob instanceof DirectableAlly || (mob.intelligentAlly && PowerOfMany.getPoweredAlly() === mob)) {
        if (mob instanceof DirectableAlly) {
          (mob).clearDefensingPos();
        }
        level.mobs.remove(mob);
        Mob.heldAllies.add(mob);
      } else if (mob.alignment === Char$Alignment.ALLY && mob.intelligentAlly && Dungeon.level.distance(holdFromPos, mob.pos) <= 5) {
        level.mobs.remove(mob);
        Mob.heldAllies.add(mob);
      }
    }
  }
  static restoreAllies$Level$int(level: Level, pos: number): void {
    Mob.restoreAllies$Level$int$int(level, pos, -1);
  }
  static restoreAllies$Level$int$int(level: Level, pos: number, gravitatePos: number): void {
    if (!Mob.heldAllies.isEmpty()) {
      let candidatePositions = new ArrayList();
      for (let i of PathFinder.NEIGHBOURS8) {
        if (!(Dungeon.level.solid[(i + pos) | 0]) && !(Dungeon.level.avoid[(i + pos) | 0]) && level.findMob((i + pos) | 0) == null) {
          candidatePositions.add((i + pos) | 0);
        }
      }
      if (gravitatePos === -1) {
        Collections.shuffle(candidatePositions);
      } else {
        Collections.sort(candidatePositions, (t1, t2) => {
          return (Dungeon.level.distance(gravitatePos, t1) - Dungeon.level.distance(gravitatePos, t2)) | 0;
        });
      }
      if (Stasis.getStasisAlly() != null) {
        for (let mob of $J.toArrayInto(level.mobs.toArray(), $J.newArray(0, null))) {
          if (mob.buff($J.cls(PowerOfMany$PowerBuff)) != null) {
            mob.buff($J.cls(PowerOfMany$PowerBuff)).detach();
          }
        }
      }
      for (const $it11 = Mob.heldAllies.iterator(); $it11.hasNext(); ) {
        let ally = $it11.next();
        if (ally.buff($J.cls(PowerOfMany$PowerBuff)) != null) {
          for (let mob of $J.toArrayInto(level.mobs.toArray(), $J.newArray(0, null))) {
            if (mob.buff($J.cls(PowerOfMany$PowerBuff)) != null) {
              mob.buff($J.cls(PowerOfMany$PowerBuff)).detach();
            }
          }
        }
        level.mobs.add(ally);
        ally.state_ = ally.WANDERING;
        if (!candidatePositions.isEmpty()) {
          ally.pos = candidatePositions.removeAt(0);
        } else {
          ally.pos = pos;
        }
        if (ally.sprite_ != null) {
          ally.sprite_.place(ally.pos);
        }
        if (ally.fieldOfView == null || ally.fieldOfView.length !== level.length()) {
          ally.fieldOfView = $J.newArray(level.length(), false);
        }
        Dungeon.level.updateFieldOfView(ally, ally.fieldOfView);
      }
    }
    Mob.heldAllies.clear();
  }
  static clearHeldAllies(): void {
    Mob.heldAllies.clear();
  }
  static $clinit() {
    Mob.heldAllies = new ArrayList();
  }
}

export class Mob$AiState {
}

export class Mob$Sleeping extends JObject {
  static readonly TAG: string = 'SLEEPING';
  _Mob$Sleeping(): this {
    return this;
  }
  act(enemyInFOV: boolean, justAlerted: boolean): boolean {
    for (const $it12 = this.$outer.buffs$().iterator(); $it12.hasNext(); ) {
      let b = $it12.next();
      if (b.type_ === Buff$buffType.NEGATIVE) {
        this.awaken(enemyInFOV);
        if (this.$outer.state_ === this.$outer.SLEEPING) {
          this.$outer.spend(Actor.TICK);
        }
        return true;
      }
    }
    if (enemyInFOV || (this.$outer.enemy != null && this.$outer.enemy.invisible > 0)) {
      let highestChance = Infinity;
      let closestHostile = null;
      for (const $it13 = Actor.chars().iterator(); $it13.hasNext(); ) {
        let ch = $it13.next();
        if (this.$outer.fieldOfView[ch.pos] && ch.invisible === 0 && ch.alignment !== this.$outer.alignment && ch.alignment !== Char$Alignment.NEUTRAL) {
          let bestChance = this.detectionChance(ch);
          if ((ch instanceof Hero || ch instanceof ShadowClone$ShadowAlly) && Dungeon.hero.hasTalent(Talent.SILENT_STEPS)) {
            if (this.$outer.distance(ch) >= ((4 - Dungeon.hero.pointsInTalent(Talent.SILENT_STEPS)) | 0)) {
              bestChance = Infinity;
            }
          }
          if (ch.flying && this.$outer.distance(ch) >= 2) {
            bestChance = Infinity;
          }
          if (bestChance < highestChance) {
            highestChance = bestChance;
            closestHostile = ch;
          }
        }
      }
      if (closestHostile != null && Random.Float$() < this.detectionChance(closestHostile)) {
        this.awaken(enemyInFOV);
        if (this.$outer.state_ === this.$outer.SLEEPING) {
          this.$outer.spend(Actor.TICK);
        }
        return true;
      }
    }
    this.$outer.enemySeen = false;
    this.$outer.spend(Actor.TICK);
    return true;
  }
  detectionChance(enemy: Char): number {
    return Math.fround(1 / (Math.fround(this.$outer.distance(enemy) + enemy.stealth())));
  }
  awaken(enemyInFOV: boolean): void {
    if (enemyInFOV) {
      this.$outer.enemySeen = true;
      this.$outer.notice();
      this.$outer.state_ = this.$outer.HUNTING;
      this.$outer.target = this.$outer.enemy.pos;
    } else {
      this.$outer.notice();
      this.$outer.state_ = this.$outer.WANDERING;
      this.$outer.target = Dungeon.level.randomDestination(this.$outer);
    }
    this.$outer.spend(Mob.TIME_TO_WAKE_UP);
  }
}

export class Mob$Wandering extends JObject {
  static readonly TAG: string = 'WANDERING';
  _Mob$Wandering(): this {
    return this;
  }
  act(enemyInFOV: boolean, justAlerted: boolean): boolean {
    if (enemyInFOV && (justAlerted || Random.Float$() < this.detectionChance(this.$outer.enemy))) {
      return this.noticeEnemy();
    } else {
      return this.continueWandering();
    }
  }
  detectionChance(enemy: Char): number {
    return Math.fround(1 / (Math.fround(Math.fround(this.$outer.distance(enemy) / 2) + enemy.stealth())));
  }
  noticeEnemy(): boolean {
    this.$outer.enemySeen = true;
    this.$outer.notice();
    this.$outer.alerted = true;
    this.$outer.state_ = this.$outer.HUNTING;
    this.$outer.target = this.$outer.enemy.pos;
    return true;
  }
  continueWandering(): boolean {
    this.$outer.enemySeen = false;
    let oldPos = this.$outer.pos;
    if (this.$outer.target !== -1 && this.$outer.getCloser(this.$outer.target)) {
      this.$outer.spend(Math.fround(1 / this.$outer.speed()));
      return this.$outer.moveSprite(oldPos, this.$outer.pos);
    } else {
      this.$outer.target = this.randomDestination();
      this.$outer.spend(Actor.TICK);
    }
    return true;
  }
  randomDestination(): number {
    return Dungeon.level.randomDestination(this.$outer);
  }
}

export class Mob$Hunting extends JObject {
  static readonly TAG: string = 'HUNTING';
  recursing: boolean = false;
  _Mob$Hunting(): this {
    this.recursing = false;
    return this;
  }
  act(enemyInFOV: boolean, justAlerted: boolean): boolean {
    this.$outer.enemySeen = enemyInFOV;
    if (enemyInFOV && !this.$outer.isCharmedBy(this.$outer.enemy) && this.$outer.canAttack(this.$outer.enemy)) {
      this.$outer.recentlyAttackedBy.clear();
      this.$outer.target = this.$outer.enemy.pos;
      return this.$outer.doAttack(this.$outer.enemy);
    } else {
      if (this.handleRecentAttackers()) {
        return this.act(true, justAlerted);
      }
      if (enemyInFOV) {
        this.$outer.target = this.$outer.enemy.pos;
      } else if (this.$outer.enemy == null) {
        this.$outer.sprite_.showLost();
        this.$outer.state_ = this.$outer.WANDERING;
        this.$outer.target = (this.$outer.WANDERING).randomDestination();
        this.$outer.spend(Actor.TICK);
        return true;
      }
      let oldPos = this.$outer.pos;
      if (this.$outer.target !== -1 && this.$outer.getCloser(this.$outer.target)) {
        this.$outer.spend(Math.fround(1 / this.$outer.speed()));
        return this.$outer.moveSprite(oldPos, this.$outer.pos);
      } else {
        return this.handleUnreachableTarget(enemyInFOV, justAlerted);
      }
    }
  }
  handleRecentAttackers(): boolean {
    let swapped = false;
    if (!this.$outer.recentlyAttackedBy.isEmpty()) {
      for (const $it14 = this.$outer.recentlyAttackedBy.iterator(); $it14.hasNext(); ) {
        let ch = $it14.next();
        if (ch != null && ch.isActive() && Actor.chars().contains(ch) && this.$outer.alignment !== ch.alignment && this.$outer.fieldOfView[ch.pos] && ch.invisible === 0 && !this.$outer.isCharmedBy(ch)) {
          if (this.$outer.canAttack(ch) || this.$outer.enemy == null || Dungeon.level.distance(this.$outer.pos, ch.pos) < Dungeon.level.distance(this.$outer.pos, this.$outer.enemy.pos)) {
            this.$outer.enemy = ch;
            this.$outer.target = ch.pos;
            swapped = true;
          }
        }
      }
      this.$outer.recentlyAttackedBy.clear();
    }
    return swapped;
  }
  handleUnreachableTarget(enemyInFOV: boolean, justAlerted: boolean): boolean {
    if (!this.recursing) {
      let oldEnemy = this.$outer.enemy;
      this.$outer.enemy = null;
      this.$outer.enemy = this.$outer.chooseEnemy();
      if (this.$outer.enemy != null && this.$outer.enemy !== oldEnemy) {
        this.recursing = true;
        let result = this.act(enemyInFOV, justAlerted);
        this.recursing = false;
        return result;
      }
    }
    this.$outer.spend(Actor.TICK);
    if (!enemyInFOV) {
      this.$outer.sprite_.showLost();
      this.$outer.state_ = this.$outer.WANDERING;
      this.$outer.target = (this.$outer.WANDERING).randomDestination();
    }
    return true;
  }
}

export class Mob$Investigating extends Mob$Wandering {
  static readonly TAG: string = 'INVESTIGATING';
  _Mob$Investigating(): this {
    this._Mob$Wandering();
    return this;
  }
  act(enemyInFOV: boolean, justAlerted: boolean): boolean {
    if (enemyInFOV) {
      this.$outer.target = this.$outer.enemy.pos;
    } else {
      if (Dungeon.level.distance(this.$outer.pos, this.$outer.target) <= 1) {
        this.$outer.sprite_.showLost();
        this.$outer.state_ = this.$outer.WANDERING;
        this.$outer.target = (this.$outer.WANDERING).randomDestination();
        this.$outer.spend(Actor.TICK);
        return true;
      }
    }
    return super.act(enemyInFOV, justAlerted);
  }
}

export class Mob$Fleeing extends JObject {
  static readonly TAG: string = 'FLEEING';
  _Mob$Fleeing(): this {
    return this;
  }
  act(enemyInFOV: boolean, justAlerted: boolean): boolean {
    this.$outer.enemySeen = enemyInFOV;
    if (this.$outer.enemy == null || !enemyInFOV && ((1 + Random.Int$int(Dungeon.level.distance(this.$outer.pos, this.$outer.target))) | 0) >= 6) {
      this.escaped();
      if (this.$outer.state_ !== this.$outer.FLEEING) {
        this.$outer.spend(Actor.TICK);
        return true;
      }
    } else if (enemyInFOV) {
      this.$outer.target = this.$outer.enemy.pos;
    }
    let oldPos = this.$outer.pos;
    if (this.$outer.target !== -1 && this.$outer.getFurther(this.$outer.target)) {
      this.$outer.spend(Math.fround(1 / this.$outer.speed()));
      return this.$outer.moveSprite(oldPos, this.$outer.pos);
    } else {
      this.$outer.spend(Actor.TICK);
      this.nowhereToRun();
      return true;
    }
  }
  escaped(): void {
  }
  nowhereToRun(): void {
    if (this.$outer.buff($J.cls(Terror)) == null && this.$outer.buff($J.cls(Dread)) == null) {
      if (this.$outer.enemySeen) {
        this.$outer.sprite_.showStatus(CharSprite.WARNING, Messages.get$Class$String$ObjectArr($J.cls(Mob), 'rage', []), []);
        this.$outer.state_ = this.$outer.HUNTING;
      } else {
        this.$outer.state_ = this.$outer.WANDERING;
      }
    }
  }
}

export class Mob$Passive extends JObject {
  static readonly TAG: string = 'PASSIVE';
  _Mob$Passive(): this {
    return this;
  }
  act(enemyInFOV: boolean, justAlerted: boolean): boolean {
    this.$outer.enemySeen = enemyInFOV;
    this.$outer.spend(Actor.TICK);
    return true;
  }
}

export class Mob$StealthGameplayInvestigating extends Mob$Investigating {
  _Mob$StealthGameplayInvestigating(): this {
    this._Mob$Investigating();
    return this;
  }
  act(enemyInFOV: boolean, justAlerted: boolean): boolean {
    if (enemyInFOV) {
      this.$outer.investigatingTurns++;
    } else {
      this.$outer.investigatingTurns = 0;
    }
    return super.act(enemyInFOV, justAlerted);
  }
  detectionChance(enemy: Char): number {
    let chance = Math.fround(1 / (Math.fround(Math.fround(this.$outer.distance(enemy) / 2) + enemy.stealth())));
    if (this.$outer.investigatingTurns === 1 && chance <= Math.fround(1)) {
      chance = Math.fround(chance - Math.fround(0.33));
    }
    return chance;
  }
}

export class Mob$StealthGameplayWandering extends Mob$Wandering {
  _Mob$StealthGameplayWandering(): this {
    this._Mob$Wandering();
    return this;
  }
  act(enemyInFOV: boolean, justAlerted: boolean): boolean {
    return super.act(enemyInFOV, justAlerted);
  }
  detectionChance(enemy: Char): number {
    if (!Dungeon.level.adjacent(this.$outer.pos, this.$outer.previousPos)) {
      return Math.fround(1 / (Math.fround(this.$outer.distance(enemy) + enemy.stealth())));
    }
    let movementDir = Math.fround(PointF.angle$Point$Point(Dungeon.level.cellToPoint(this.$outer.previousPos), Dungeon.level.cellToPoint(this.$outer.pos)) / PointF.G2R);
    let enemyDir = Math.fround(PointF.angle$Point$Point(Dungeon.level.cellToPoint(this.$outer.pos), Dungeon.level.cellToPoint(enemy.pos)) / PointF.G2R);
    if (Math.fround(Math.abs(Math.fround(enemyDir - movementDir))) <= 37.5 && Dungeon.level.distance(this.$outer.pos, enemy.pos) <= 6) {
      return Math.fround(1 / (Math.fround(Math.fround(this.$outer.distance(enemy) / 2) + enemy.stealth())));
    } else if (Math.fround(Math.abs(Math.fround(enemyDir - movementDir))) <= 75) {
      return Math.fround(1 / (Math.fround(this.$outer.distance(enemy) + enemy.stealth())));
    } else {
      let chance = Math.fround(1 / Math.fround($J.pow((Math.fround(this.$outer.distance(enemy) + enemy.stealth())), 3)));
      if (chance < Math.fround(0.1)) {
        return 0;
      } else {
        return chance;
      }
    }
  }
  noticeEnemy(): boolean {
    super.noticeEnemy();
    this.$outer.alerted = false;
    this.$outer.state_ = this.$outer.INVESTIGATING;
    this.$outer.investigatingTurns = 0;
    this.$outer.sprite_.showInvestigate();
    this.$outer.spend(Actor.TICK);
    if (!Dungeon.level.heroFOV[this.$outer.pos]) {
      Buff.affect$Char$Class$float(Dungeon.hero, $J.cls(TalismanOfForesight$CharAwareness), 1).charID = this.$outer.id();
    }
    return true;
  }
  randomDestination(): number {
    if (this.$outer.wanderPositions == null) {
      this.$outer.wanderPositions = $J.newArray(1, 0);
      this.$outer.wanderPositions[0] = this.$outer.pos;
    }
    let wanderPos = this.$outer.wanderPositions[this.$outer.wanderPosIdx];
    if (wanderPos === this.$outer.pos) {
      if (this.$outer.wanderPositions.length > 1) {
        this.$outer.wanderPosIdx++;
        if (this.$outer.wanderPosIdx === this.$outer.wanderPositions.length) {
          this.$outer.wanderPosIdx = 0;
        }
        wanderPos = this.$outer.wanderPositions[this.$outer.wanderPosIdx];
      } else {
        this.$outer.previousPos = this.$outer.pos;
        this.$outer.sprite_.idle();
      }
    }
    return wanderPos;
  }
}

export class Mob$StealthGameplaySleeping extends Mob$Sleeping {
  _Mob$StealthGameplaySleeping(): this {
    this._Mob$Sleeping();
    return this;
  }
  act(enemyInFOV: boolean, justAlerted: boolean): boolean {
    if (this.$outer.wanderPositions == null) {
      this.$outer.wanderPositions = $J.newArray(1, 0);
      this.$outer.wanderPositions[0] = this.$outer.pos;
    }
    return super.act(enemyInFOV, justAlerted);
  }
  awaken(enemyInFOV: boolean): void {
    super.awaken(enemyInFOV);
    if (this.$outer.state_ === this.$outer.HUNTING) {
      this.$outer.alerted = false;
      this.$outer.state_ = this.$outer.INVESTIGATING;
      this.$outer.investigatingTurns = 0;
      this.$outer.sprite_.showInvestigate();
      if (!Dungeon.level.heroFOV[this.$outer.pos]) {
        Buff.affect$Char$Class$float(Dungeon.hero, $J.cls(TalismanOfForesight$CharAwareness), 1).charID = this.$outer.id();
      }
    }
  }
  detectionChance(enemy: Char): number {
    let chance = Math.fround(1 / Math.fround($J.pow((Math.fround(this.$outer.distance(enemy) + enemy.stealth())), 2)));
    if (chance < Math.fround(0.1)) {
      return 0;
    } else {
      return chance;
    }
  }
}

let $Mob$1: any = null;
/** An anonymous class (Mob.java:760). */
function Mob$1(): any {
  return $Mob$1 ??= $J.local(class extends AlphaTweener {
    updateValues(progress: number): void {
      if (this.$outer.sprite_.visible_) {
        this.elapsed = progress = 1;
      }
      progress = Math.fround($J.pow(progress, 2));
      super.updateValues(progress);
    }
    onComplete(): void {
      this.$outer.shadowFade = null;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$1', []);
}

$J.define(Mob, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.Char', ctors: { '': '_Mob' }, meths: { 'restoreAllies(com.shatteredpixel.shatteredpixeldungeon.levels.Level,int,int)': 'restoreAllies$Level$int$int', 'restoreAllies(com.shatteredpixel.shatteredpixeldungeon.levels.Level,int)': 'restoreAllies$Level$int', 'holdAllies(com.shatteredpixel.shatteredpixeldungeon.levels.Level,int)': 'holdAllies$Level$int', 'holdAllies(com.shatteredpixel.shatteredpixeldungeon.levels.Level)': 'holdAllies$Level', 'surprisedBy(com.shatteredpixel.shatteredpixeldungeon.actors.Char,boolean)': 'surprisedBy$Char$boolean', 'surprisedBy(com.shatteredpixel.shatteredpixeldungeon.actors.Char)': 'surprisedBy$Char', 'move(int,boolean)': 'move$int$boolean', 'remove(com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff)': 'remove$Buff' }, clinit: true, lazy: ['heldAllies'] });
$J.define(Mob$AiState, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$AiState', { kind: 'interface' });
$J.define(Mob$Sleeping, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Sleeping', { kind: 'class', ifaces: ['com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$AiState'], sup: 'java.lang.Object', ctors: { '': '_Mob$Sleeping' }, inner: true });
$J.define(Mob$Wandering, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Wandering', { kind: 'class', ifaces: ['com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$AiState'], sup: 'java.lang.Object', ctors: { '': '_Mob$Wandering' }, inner: true });
$J.define(Mob$Hunting, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Hunting', { kind: 'class', ifaces: ['com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$AiState'], sup: 'java.lang.Object', ctors: { '': '_Mob$Hunting' }, inner: true });
$J.define(Mob$Investigating, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Investigating', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Wandering', ctors: { '': '_Mob$Investigating' }, inner: true });
$J.define(Mob$Fleeing, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Fleeing', { kind: 'class', ifaces: ['com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$AiState'], sup: 'java.lang.Object', ctors: { '': '_Mob$Fleeing' }, inner: true });
$J.define(Mob$Passive, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Passive', { kind: 'class', ifaces: ['com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$AiState'], sup: 'java.lang.Object', ctors: { '': '_Mob$Passive' }, inner: true });
$J.define(Mob$StealthGameplayInvestigating, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$StealthGameplayInvestigating', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Investigating', ctors: { '': '_Mob$StealthGameplayInvestigating' }, inner: true });
$J.define(Mob$StealthGameplayWandering, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$StealthGameplayWandering', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Wandering', ctors: { '': '_Mob$StealthGameplayWandering' }, inner: true });
$J.define(Mob$StealthGameplaySleeping, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$StealthGameplaySleeping', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Sleeping', ctors: { '': '_Mob$StealthGameplaySleeping' }, inner: true });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Adrenaline = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Adrenaline');
  AllyBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AllyBuff');
  Amok = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Amok');
  AscensionChallenge = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AscensionChallenge');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  ChampionEnemy = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ChampionEnemy');
  Charm = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Charm');
  Corruption = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Corruption');
  Dread = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Dread');
  GreaterHaste = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.GreaterHaste');
  Hunger = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Hunger');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  MindVision = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MindVision');
  MonkEnergy = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MonkEnergy');
  Preparation = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Preparation');
  Sleep = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Sleep');
  SoulMark = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.SoulMark');
  SwarmIntelTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.SwarmIntelTracker');
  Terror = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Terror');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  HeroClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Talent$BountyHunterTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$BountyHunterTracker');
  Talent$LethalHasteCooldown = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$LethalHasteCooldown');
  Talent$LethalMomentumTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$LethalMomentumTracker');
  ArmorAbility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.ArmorAbility');
  PowerOfMany = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.PowerOfMany');
  PowerOfMany$PowerBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.PowerOfMany$PowerBuff');
  Feint$AfterImage = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.duelist.Feint$AfterImage');
  Feint$AfterImage$FeintConfusion = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.duelist.Feint$AfterImage$FeintConfusion');
  ShadowClone$ShadowAlly = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.rogue.ShadowClone$ShadowAlly');
  ClericSpell = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.ClericSpell');
  GuidingLight$Illuminated = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.GuidingLight$Illuminated');
  Stasis = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Stasis');
  Wraith = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Wraith');
  DirectableAlly = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.DirectableAlly');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  Surprise = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Surprise');
  Wound = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Wound');
  ShadowParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShadowParticle');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  MasterThievesArmband$StolenTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.MasterThievesArmband$StolenTracker');
  TalismanOfForesight$CharAwareness = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.TalismanOfForesight$CharAwareness');
  TimekeepersHourglass$timeFreeze = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.TimekeepersHourglass$timeFreeze');
  ExoticPotion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.ExoticPotion');
  Ring = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.Ring');
  RingOfWealth = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfWealth');
  RingOfWealth$Wealth = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfWealth$Wealth');
  ExoticScroll = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ExoticScroll');
  StoneOfAggression$Aggression = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfAggression$Aggression');
  ExoticCrystals = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.ExoticCrystals');
  ShardOfOblivion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.ShardOfOblivion');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  SpiritBow$SpiritArrow = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.SpiritBow$SpiritArrow');
  Weapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon');
  Weapon$Enchantment = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment');
  Lucky = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Lucky');
  Lucky$LuckProc = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Lucky$LuckProc');
  MissileWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon');
  Dart = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.Dart');
  Bestiary = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Bestiary');
  VaultLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.VaultLevel');
  Chasm = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.Chasm');
  Trap$HazardAssistTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap$HazardAssistTracker');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  Swiftthistle$TimeBubble = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Swiftthistle$TimeBubble');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  CharSprite$State = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite$State');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  AlphaTweener = $J.load('com.watabou.noosa.tweeners.AlphaTweener');
  GameMath = $J.load('com.watabou.utils.GameMath');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  PointF = $J.load('com.watabou.utils.PointF');
  Random = $J.load('com.watabou.utils.Random');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
