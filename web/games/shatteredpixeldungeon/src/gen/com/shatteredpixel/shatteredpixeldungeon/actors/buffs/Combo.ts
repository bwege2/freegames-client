// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Combo.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JEnum, JObject } from '../../../../../../jre/index.ts';
import { Buff } from './Buff.ts';
import { FlavourBuff } from './FlavourBuff.ts';

let Assets$Sounds, Badges, Dungeon, Actor, Char, Char$Alignment, Buff$buffType, Corruption, HoldFast, Invisibility, Vertigo, Vulnerable, Talent, DwarfKing, BrokenSeal$WarriorShield, WandOfBlastWave, WandOfBlastWave$BlastWave, Ballistica, Messages, CellSelector$Listener, GameScene, PixelScene, CharSprite, ActionIndicator, AttackIndicator, BuffIndicator, HeroIcon, GLog, WndCombo, BitmapText, Sample, BArray, PathFinder;

export class Combo extends Buff {
  count_: number = 0;
  comboTime: number = 0;
  initialComboTime: number = 0;
  static readonly COUNT: string = 'count';
  static readonly TIME: string = 'combotime';
  static readonly INITIAL_TIME: string = 'initialComboTime';
  static readonly CLOBBER_USED: string = 'clobber_used';
  static readonly PARRY_USED: string = 'parry_used';
  clobberUsed: boolean = false;
  parryUsed: boolean = false;
  static moveBeingUsed: Combo$ComboMove = null;
  static furyHitsLeft: number = 0;
  listener: CellSelector$Listener = null;
  _Combo(): this {
    this._Buff();
    this.type_ = Buff$buffType.POSITIVE;
    this.count_ = 0;
    this.comboTime = 0;
    this.initialComboTime = 5;
    this.clobberUsed = false;
    this.parryUsed = false;
    this.listener = new (Combo$2())().$o(this)._CellSelector$Listener();
    return this;
  }
  icon(): number {
    return BuffIndicator.COMBO;
  }
  tintIcon(icon: Image): void {
    let move = this.getHighestMove();
    if (move != null) {
      icon.hardlight$int(move.tintColor);
    } else {
      icon.resetColor();
    }
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(this.initialComboTime - this.comboTime)) / this.initialComboTime));
  }
  iconTextDisplay(): string {
    return String($J.d2i(this.comboTime));
  }
  hit(enemy: Char): void {
    this.count_++;
    if (this.comboTime <= 5) {
      this.comboTime = Math.max(this.comboTime, 5);
      this.initialComboTime = 5;
    }
    if (!enemy.isAlive() || (enemy.buff($J.cls(Corruption)) != null && enemy.HP === enemy.HT)) {
      this.comboTime = Math.fround(15 + Math.fround(15 * (this.target).pointsInTalent(Talent.CLEAVE)));
      this.initialComboTime = this.comboTime;
    }
    if (this.getHighestMove() != null) {
      ActionIndicator.setAction(this);
      Badges.validateMasteryCombo(this.count_);
      GLog.p(Messages.get$Object$String$ObjectArr(this, 'combo', [this.count_]), []);
    }
    BuffIndicator.refreshHero();
  }
  addTime(time: number): void {
    this.comboTime = Math.fround(this.comboTime + time);
  }
  detach(): void {
    super.detach();
    ActionIndicator.clearAction$Action(this);
  }
  act(): boolean {
    this.comboTime = Math.fround(this.comboTime - Math.fround(Actor.TICK * HoldFast.buffDecayFactor(this.target)));
    this.spend(Actor.TICK);
    if (this.comboTime <= Math.fround(0)) {
      this.detach();
    }
    return true;
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [this.count_, this.dispTurns$float(this.comboTime)]);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(Combo.COUNT, this.count_);
    bundle.put$String$float(Combo.TIME, this.comboTime);
    bundle.put$String$float(Combo.INITIAL_TIME, this.initialComboTime);
    bundle.put$String$boolean(Combo.CLOBBER_USED, this.clobberUsed);
    bundle.put$String$boolean(Combo.PARRY_USED, this.parryUsed);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.count_ = bundle.getInt(Combo.COUNT);
    this.comboTime = bundle.getFloat(Combo.TIME);
    this.initialComboTime = bundle.getFloat(Combo.INITIAL_TIME);
    this.clobberUsed = bundle.getBoolean(Combo.CLOBBER_USED);
    this.parryUsed = bundle.getBoolean(Combo.PARRY_USED);
    if (this.getHighestMove() != null) {
      ActionIndicator.setAction(this);
    }
  }
  actionName(): string {
    return Messages.get$Object$String$ObjectArr(this, 'action_name', []);
  }
  actionIcon(): number {
    return HeroIcon.COMBO;
  }
  secondaryVisual(): Visual {
    let txt = new BitmapText()._BitmapText$Font(PixelScene.pixelFont);
    txt.text$String(String(this.count_));
    txt.hardlight$int(CharSprite.POSITIVE);
    txt.measure();
    return txt;
  }
  indicatorColor(): number {
    let best = this.getHighestMove();
    if (best == null) {
      return 14671839;
    } else {
      let r = $J.d2i((Math.fround((best.tintColor >> 16) * 0.875)));
      let g = $J.d2i((Math.fround(((best.tintColor >> 8) & 255) * 0.875)));
      let b = $J.d2i((Math.fround((best.tintColor & 255) * 0.875)));
      return ((r << 16) + (g << 8) + b) | 0;
    }
  }
  doAction(): void {
    GameScene.show(new WndCombo()._WndCombo(this));
  }
  getHighestMove(): Combo$ComboMove {
    let best = null;
    for (let move of Combo$ComboMove.values()) {
      if (this.count_ >= move.comboReq) {
        best = move;
      }
    }
    return best;
  }
  getComboCount(): number {
    return this.count_;
  }
  canUseMove(move: Combo$ComboMove): boolean {
    if (move === Combo$ComboMove.CLOBBER && this.clobberUsed) {
      return false;
    }
    if (move === Combo$ComboMove.PARRY && this.parryUsed) {
      return false;
    }
    return move.comboReq <= this.count_;
  }
  useMove(move: Combo$ComboMove): void {
    if (move === Combo$ComboMove.PARRY) {
      this.parryUsed = true;
      this.comboTime = Math.max(this.comboTime, 5);
      Invisibility.dispel$();
      Buff.affect$Char$Class$float(this.target, $J.cls(Combo$ParryTracker), Actor.TICK);
      (this.target).spendAndNext(Actor.TICK);
      Dungeon.hero.busy();
    } else {
      Combo.moveBeingUsed = move;
      GameScene.selectCell(this.listener);
    }
  }
  doAttack(enemy: Char): void {
    AttackIndicator.target(enemy);
    let wasAlly = enemy.alignment === this.target.alignment;
    let hero = this.target;
    let dmgMulti = 1;
    let dmgBonus = 0;
    switch (Combo.moveBeingUsed) {
      case Combo$ComboMove.CLOBBER:
        dmgMulti = 0;
        break;
      case Combo$ComboMove.SLAM:
        dmgBonus = $J.roundf(Math.fround(Math.imul(this.target.drRoll(), this.count_) / 5));
        break;
      case Combo$ComboMove.CRUSH:
        dmgMulti = Math.fround(0.25 * this.count_);
        break;
      case Combo$ComboMove.FURY:
        dmgMulti = Math.fround(0.6);
        break;
    }
    let oldPos = enemy.pos;
    if (hero.attack$Char$float$float$float(enemy, dmgMulti, Math.fround(dmgBonus), Math.fround(Char.INFINITE_ACCURACY))) {
      {
        let trajectory: Ballistica, dist: number;
        switch (Combo.moveBeingUsed) {
          case Combo$ComboMove.CLOBBER:
            trajectory = new Ballistica()._Ballistica(this.target.pos, enemy.pos, Ballistica.STOP_TARGET);
            trajectory = new Ballistica()._Ballistica(trajectory.collisionPos, trajectory.path.get((trajectory.path.size() - 1) | 0), Ballistica.PROJECTILE);
            dist = 2;
            if (enemy.isAlive() && this.count_ >= 7 && hero.pointsInTalent(Talent.ENHANCED_COMBO) >= 1) {
              dist++;
              Buff.prolong(enemy, $J.cls(Vertigo), 3);
            } else if (!enemy.flying) {
              while (dist > trajectory.dist || (dist > 0 && Dungeon.level.pit[trajectory.path.get(dist)])) {
                dist--;
              }
            }
            if (!wasAlly) {
              this.hit(enemy);
            }
            if (enemy.pos === oldPos) {
              WandOfBlastWave.throwChar(enemy, trajectory, dist, true, false, hero);
            }
            break;
          case Combo$ComboMove.PARRY:
            this.hit(enemy);
            break;
          case Combo$ComboMove.CRUSH:
            WandOfBlastWave$BlastWave.blast$int(enemy.pos);
            PathFinder.buildDistanceMap$int$booleanArr$int(this.target.pos, BArray.not(Dungeon.level.solid, null), 3);
            for (const $it0 = Actor.chars().iterator(); $it0.hasNext(); ) {
              let ch = $it0.next();
              if (ch !== enemy && ch.alignment === Char$Alignment.ENEMY && PathFinder.distance[ch.pos] < 2147483647) {
                let aoeHit = $J.roundf(Math.fround(Math.fround(this.target.damageRoll() * 0.25) * this.count_));
                aoeHit = $J.idiv(aoeHit, 2);
                aoeHit = (aoeHit - ch.drRoll()) | 0;
                if (ch.buff($J.cls(Vulnerable)) != null) {
                  aoeHit = $J.d2i(Math.fround(aoeHit * Math.fround(1.33)));
                }
                if (ch instanceof DwarfKing) {
                  ch.damage(aoeHit, this);
                } else {
                  ch.damage(aoeHit, this.target);
                }
                ch.sprite_.bloodBurstA(this.target.sprite_.center$(), aoeHit);
                ch.sprite_.flash();
                if (!ch.isAlive() && hero.hasTalent(Talent.LETHAL_DEFENSE)) {
                  Buff.affect$Char$Class(hero, $J.cls(BrokenSeal$WarriorShield)).reduceCooldown(Math.fround(hero.pointsInTalent(Talent.LETHAL_DEFENSE) / 3));
                }
              }
            }
            break;
          default:
            break;
        }
      }
    }
    Invisibility.dispel$();
    switch (Combo.moveBeingUsed) {
      case Combo$ComboMove.CLOBBER:
        this.clobberUsed = true;
        if (this.getHighestMove() == null) {
          ActionIndicator.clearAction$Action(this);
        }
        hero.spendAndNext(hero.attackDelay());
        break;
      case Combo$ComboMove.PARRY:
        break;
      case Combo$ComboMove.FURY:
        if (this.count_ > 0) {
          Combo.furyHitsLeft = this.count_;
          this.count_ = 0;
          this.detach();
          hero.spend(hero.attackDelay());
        }
        Combo.furyHitsLeft--;
        if (Combo.furyHitsLeft > 0 && enemy.isAlive() && hero.canAttack(enemy) && hero.paralysed === 0 && (wasAlly || enemy.alignment !== this.target.alignment)) {
          this.target.sprite_.attack$int$Callback(enemy.pos, new (Combo$1())().$o(this).$c(enemy));
        } else {
          Combo.furyHitsLeft = 0;
          Sample.INSTANCE.play$Object(Assets$Sounds.HIT_STRONG);
          ActionIndicator.clearAction$Action(this);
          hero.next();
        }
        break;
      default:
        this.detach();
        ActionIndicator.clearAction$Action(this);
        hero.spendAndNext(hero.attackDelay());
        break;
    }
    if (!enemy.isAlive() || (!wasAlly && enemy.alignment === this.target.alignment)) {
      if (hero.hasTalent(Talent.LETHAL_DEFENSE)) {
        Buff.affect$Char$Class(hero, $J.cls(BrokenSeal$WarriorShield)).reduceCooldown(Math.fround(hero.pointsInTalent(Talent.LETHAL_DEFENSE) / 3));
      }
    }
  }
  static $clinit() {
    Combo.furyHitsLeft = 0;
  }
}

export class Combo$ComboMove extends JEnum {
  comboReq: number = 0;
  tintColor: number = 0;
  static CLOBBER: Combo$ComboMove = null;
  static SLAM: Combo$ComboMove = null;
  static PARRY: Combo$ComboMove = null;
  static CRUSH: Combo$ComboMove = null;
  static FURY: Combo$ComboMove = null;
  static $VALUES: Combo$ComboMove[] = null;
  _Combo$ComboMove($name: string, $ordinal: number, comboReq: number, tintColor: number): this {
    this._JEnum($name, $ordinal);
    this.comboReq = comboReq;
    this.tintColor = tintColor;
    return this;
  }
  title(): string {
    return Messages.get$Object$String$ObjectArr(this, this.name() + '.name', []);
  }
  desc(count: number): string {
    switch (this) {
      case Combo$ComboMove.CLOBBER:
      default:
        if (count >= 7 && Dungeon.hero.pointsInTalent(Talent.ENHANCED_COMBO) >= 1) {
          return Messages.get$Object$String$ObjectArr(this, this.name() + '.empower_desc', []);
        } else {
          return Messages.get$Object$String$ObjectArr(this, this.name() + '.desc', []);
        }
      case Combo$ComboMove.SLAM:
        if (count >= 3 && Dungeon.hero.pointsInTalent(Talent.ENHANCED_COMBO) >= 3) {
          return Messages.get$Object$String$ObjectArr(this, this.name() + '.empower_desc', [$J.idiv(count, 3), Math.imul(count, 20)]);
        } else {
          return Messages.get$Object$String$ObjectArr(this, this.name() + '.desc', [Math.imul(count, 20)]);
        }
      case Combo$ComboMove.PARRY:
        if (count >= 9 && Dungeon.hero.pointsInTalent(Talent.ENHANCED_COMBO) >= 2) {
          return Messages.get$Object$String$ObjectArr(this, this.name() + '.empower_desc', []);
        } else {
          return Messages.get$Object$String$ObjectArr(this, this.name() + '.desc', []);
        }
      case Combo$ComboMove.CRUSH:
        if (count >= 3 && Dungeon.hero.pointsInTalent(Talent.ENHANCED_COMBO) >= 3) {
          return Messages.get$Object$String$ObjectArr(this, this.name() + '.empower_desc', [$J.idiv(count, 3), Math.imul(count, 25)]);
        } else {
          return Messages.get$Object$String$ObjectArr(this, this.name() + '.desc', [Math.imul(count, 25)]);
        }
      case Combo$ComboMove.FURY:
        if (count >= 3 && Dungeon.hero.pointsInTalent(Talent.ENHANCED_COMBO) >= 3) {
          return Messages.get$Object$String$ObjectArr(this, this.name() + '.empower_desc', [$J.idiv(count, 3)]);
        } else {
          return Messages.get$Object$String$ObjectArr(this, this.name() + '.desc', []);
        }
    }
  }
  static values(): Combo$ComboMove[] { return Combo$ComboMove.$VALUES.slice(); }
  static valueOf(name: string): Combo$ComboMove { return $J.enumValueOf(Combo$ComboMove, name); }
  static $clinit() {
    Combo$ComboMove.CLOBBER = new Combo$ComboMove()._Combo$ComboMove('CLOBBER', 0, 2, 65280);
    Combo$ComboMove.SLAM = new Combo$ComboMove()._Combo$ComboMove('SLAM', 1, 4, 13434624);
    Combo$ComboMove.PARRY = new Combo$ComboMove()._Combo$ComboMove('PARRY', 2, 6, 16776960);
    Combo$ComboMove.CRUSH = new Combo$ComboMove()._Combo$ComboMove('CRUSH', 3, 8, 16763904);
    Combo$ComboMove.FURY = new Combo$ComboMove()._Combo$ComboMove('FURY', 4, 10, 16711680);
    Combo$ComboMove.$VALUES = [Combo$ComboMove.CLOBBER, Combo$ComboMove.SLAM, Combo$ComboMove.PARRY, Combo$ComboMove.CRUSH, Combo$ComboMove.FURY];
  }
}

export class Combo$ParryTracker extends FlavourBuff {
  parried: boolean = false;
  _Combo$ParryTracker(): this {
    this._FlavourBuff();
    this.actPriority = (Actor.HERO_PRIO + 1) | 0;
    return this;
  }
  detach(): void {
    if (!this.parried && this.target.buff($J.cls(Combo)) != null) {
      this.target.buff($J.cls(Combo)).detach();
    }
    super.detach();
  }
}

export class Combo$RiposteTracker extends Buff {
  enemy: Char = null;
  _Combo$RiposteTracker(): this {
    this._Buff();
    this.actPriority = Actor.VFX_PRIO;
    return this;
  }
  act(): boolean {
    if (this.target.buff($J.cls(Combo)) != null) {
      Combo.moveBeingUsed = Combo$ComboMove.PARRY;
      this.target.sprite_.attack$int$Callback(this.enemy.pos, new (Combo$RiposteTracker$1())().$o(this));
      this.detach();
      return false;
    } else {
      this.detach();
      return true;
    }
  }
}

let $Combo$2$1$1: any = null;
/** An anonymous class (Combo.java:516). */
function Combo$2$1$1(): any {
  return $Combo$2$1$1 ??= $J.local(class extends JObject {
    call(): void {
      this.$outer.$outer.$outer.doAttack(this.$cv_enemy);
    }
    $c($enemy): this {
      this.$cv_enemy = $enemy;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Combo$2$1$1', ['com.watabou.utils.Callback']);
}

let $Combo$2$1: any = null;
/** An anonymous class (Combo.java:509). */
function Combo$2$1(): any {
  return $Combo$2$1 ??= $J.local(class extends JObject {
    call(): void {
      this.$outer.$outer.target.move$int(this.$cv_leapPos);
      Dungeon.level.occupyCell(this.$outer.$outer.target);
      Dungeon.observe$();
      GameScene.updateFog$();
      this.$outer.$outer.target.sprite_.attack$int$Callback(this.$cv_cell, new (Combo$2$1$1())().$o(this).$c(this.$cv_enemy));
    }
    $c($leapPos, $cell, $enemy): this {
      this.$cv_leapPos = $leapPos; this.$cv_cell = $cell; this.$cv_enemy = $enemy;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Combo$2$1', ['com.watabou.utils.Callback']);
}

let $Combo$2$2: any = null;
/** An anonymous class (Combo.java:532). */
function Combo$2$2(): any {
  return $Combo$2$2 ??= $J.local(class extends JObject {
    call(): void {
      this.$outer.$outer.doAttack(this.$cv_enemy);
    }
    $c($enemy): this {
      this.$cv_enemy = $enemy;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Combo$2$2', ['com.watabou.utils.Callback']);
}

let $Combo$2: any = null;
/** An anonymous class (Combo.java:482). */
function Combo$2(): any {
  return $Combo$2 ??= $J.local(class extends CellSelector$Listener {
    onSelect(cell: number): void {
      if (cell == null) {
        return;
      }
      let enemy = Actor.findChar(cell);
      if (enemy == null || enemy === this.$outer.target || !Dungeon.level.heroFOV[cell] || this.$outer.target.isCharmedBy(enemy)) {
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(Combo), 'bad_target', []), []);
      } else if (!(this.$outer.target).canAttack(enemy)) {
        if ((this.$outer.target).pointsInTalent(Talent.ENHANCED_COMBO) < 3 || Dungeon.level.distance(this.$outer.target.pos, enemy.pos) > ((1 + $J.idiv(this.$outer.target.buff($J.cls(Combo)).count_, 3)) | 0)) {
          GLog.w(Messages.get$Class$String$ObjectArr($J.cls(Combo), 'bad_target', []), []);
        } else {
          let c = new Ballistica()._Ballistica(this.$outer.target.pos, enemy.pos, Ballistica.PROJECTILE);
          if (c.collisionPos === enemy.pos) {
            let leapPos = c.path.get((c.dist - 1) | 0);
            if (!Dungeon.level.passable[leapPos] && !(this.$outer.target.flying && Dungeon.level.avoid[leapPos])) {
              GLog.w(Messages.get$Class$String$ObjectArr($J.cls(Combo), 'bad_target', []), []);
            } else if (Dungeon.hero.rooted) {
              PixelScene.shake(1, 1);
              GLog.w(Messages.get$Class$String$ObjectArr($J.cls(Combo), 'bad_target', []), []);
            } else {
              Dungeon.hero.busy();
              this.$outer.target.sprite_.jump$int$int$Callback(this.$outer.target.pos, leapPos, new (Combo$2$1())().$o(this).$c(leapPos, cell, enemy));
            }
          } else {
            GLog.w(Messages.get$Class$String$ObjectArr($J.cls(Combo), 'bad_target', []), []);
          }
        }
      } else {
        Dungeon.hero.busy();
        this.$outer.target.sprite_.attack$int$Callback(cell, new (Combo$2$2())().$o(this).$c(enemy));
      }
    }
    prompt(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(Combo), 'prompt', []);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Combo$2', []);
}

let $Combo$1: any = null;
/** An anonymous class (Combo.java:453). */
function Combo$1(): any {
  return $Combo$1 ??= $J.local(class extends JObject {
    call(): void {
      this.$outer.doAttack(this.$cv_enemy);
    }
    $c($enemy): this {
      this.$cv_enemy = $enemy;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Combo$1', ['com.watabou.utils.Callback']);
}

let $Combo$RiposteTracker$1: any = null;
/** An anonymous class (Combo.java:324). */
function Combo$RiposteTracker$1(): any {
  return $Combo$RiposteTracker$1 ??= $J.local(class extends JObject {
    call(): void {
      this.$outer.target.buff($J.cls(Combo)).doAttack(this.$outer.enemy);
      this.$outer.next();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Combo$RiposteTracker$1', ['com.watabou.utils.Callback']);
}

$J.define(Combo, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Combo', { kind: 'class', ifaces: ['com.shatteredpixel.shatteredpixeldungeon.ui.ActionIndicator$Action'], sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Combo' }, clinit: true, lazy: ['moveBeingUsed', 'furyHitsLeft'] });
$J.define(Combo$ComboMove, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Combo$ComboMove', { kind: 'enum', sup: 'java.lang.Enum', ctors: { 'int,int': '_Combo$ComboMove' }, clinit: true, lazy: ['$VALUES', 'CLOBBER', 'SLAM', 'PARRY', 'CRUSH', 'FURY'] });
$J.define(Combo$ParryTracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Combo$ParryTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Combo$ParryTracker' } });
$J.define(Combo$RiposteTracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Combo$RiposteTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Combo$RiposteTracker' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Corruption = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Corruption');
  HoldFast = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.HoldFast');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Vertigo = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Vertigo');
  Vulnerable = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Vulnerable');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  DwarfKing = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DwarfKing');
  BrokenSeal$WarriorShield = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.BrokenSeal$WarriorShield');
  WandOfBlastWave = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfBlastWave');
  WandOfBlastWave$BlastWave = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfBlastWave$BlastWave');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CellSelector$Listener = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.CellSelector$Listener');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  ActionIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ActionIndicator');
  AttackIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.AttackIndicator');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndCombo = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndCombo');
  BitmapText = $J.load('com.watabou.noosa.BitmapText');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
});
