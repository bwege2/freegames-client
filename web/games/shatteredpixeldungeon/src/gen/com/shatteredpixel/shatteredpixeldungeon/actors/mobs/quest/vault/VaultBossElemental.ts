// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/quest/vault/VaultBossElemental.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections, HashSet, JEnum } from '../../../../../../../../jre/index.ts';
import { Mob } from '../../Mob.ts';
import { Buff } from '../../../buffs/Buff.ts';

let Assets$Sounds, Badges, Dungeon, Statistics, Actor, Char, Char$Property, Blob, Electricity, Fire, Burning, Chill, Frost, Invisibility, Paralysis, PinCushion, Hero, ClericSpell, CellEmitter, Lightning, MagicMissile$MagicParticle, MagicMissile$WhiteParticle, FlameParticle, SnowParticle, SparkParticle, AntiMagic, Wand, WandOfLightning, Shocking, MeleeWeapon, MissileWeapon, Ballistica, ConeAOE, Messages, GameScene, PixelScene, VaultBossElementalSprite, AttackIndicator, BossHealthBar, GLog, Sample, GameMath, PathFinder, PointF, Random;

export class VaultBossElemental extends Mob {
  form: VaultBossElemental$ElementalForm = null;
  formChances: number[] = null;
  envAttackCooldown: number = 0;
  spAttackCooldown: number = 0;
  spTargetCell: number = 0;
  lastEnemyPos: number = 0;
  weakAnnounced: boolean = false;
  static readonly FORM: string = 'elemental_form';
  static readonly ENV_ATK_COOLDOWN: string = 'env_atk_cooldown';
  static readonly SP_ATK_COOLDOWN: string = 'sp_atk_cooldown';
  static readonly SP_TARGET_CELL: string = 'sp_target_cell';
  static readonly LAST_ENEMY_POS: string = 'last_enemy_pos';
  static readonly LIGHTNING_OFS: string = 'lightning_ofs';
  /**
   * Shock Form Abilities ***
   */
  lightningOfs: number = 0;
  _VaultBossElemental(): this {
    this._Mob();
    this.HP = this.HT = 600;
    this.spriteClass = $J.cls(VaultBossElementalSprite);
    this.EXP = 30;
    this.defenseSkill_ = 20;
    this.properties_.add(Char$Property.BOSS);
    this.form = null;
    this.formChances = [2, 2, 2];
    this.envAttackCooldown = Random.NormalIntRange(10, 15);
    this.spAttackCooldown = Random.NormalIntRange(6, 10);
    this.spTargetCell = -1;
    this.lastEnemyPos = -1;
    this.weakAnnounced = false;
    this.form = VaultBossElemental$ElementalForm.values()[Random.Int$int(3)];
    this.formChances[this.form.ordinal()]--;
    return this;
  }
  damageRoll(): number {
    if (this.form === VaultBossElemental$ElementalForm.FROST) {
      return Random.NormalIntRange(15, 20);
    } else {
      return Random.NormalIntRange(20, 25);
    }
  }
  attackSkill(target: Char): number {
    return 28;
  }
  drRoll(): number {
    return (super.drRoll() + Random.NormalIntRange(0, 10)) | 0;
  }
  defenseSkill(enemy: Char): number {
    if (this.form === VaultBossElemental$ElementalForm.FIRE && enemy instanceof Hero && (enemy).belongings.attackingWeapon() instanceof MissileWeapon && !Dungeon.level.adjacent(this.pos, enemy.pos)) {
      return 0;
    } else if (this.form === VaultBossElemental$ElementalForm.FROST && enemy instanceof Hero && (enemy).belongings.attackingWeapon() instanceof MeleeWeapon) {
      return $J.idiv(super.defenseSkill(enemy), 2);
    } else {
      return super.defenseSkill(enemy);
    }
  }
  changeForm(): void {
    let newForm: VaultBossElemental$ElementalForm;
    do {
      newForm = VaultBossElemental$ElementalForm.values()[Random.chances$floatArr(this.formChances)];
    } while (newForm === this.form);
    this.formChances[newForm.ordinal()]--;
    this.setElementalForm(newForm);
  }
  curForm(): VaultBossElemental$ElementalForm {
    return this.form;
  }
  setElementalForm(form: VaultBossElemental$ElementalForm): void {
    Buff.affect$Char$Class(this, $J.cls(VaultBossElemental$PinCushionRemover)).preferGrouping = this.form === VaultBossElemental$ElementalForm.FIRE;
    this.form = form;
    let wasTurned = this.sprite_.flipHorizontal_;
    (this.sprite_).updateForm();
    AttackIndicator.target(this);
    let e = this.sprite_.emitter();
    e.fillTarget = false;
    e.pos$Visual$float$float$float$float(this.sprite_, 4, 4, 24, 24);
    if (form === VaultBossElemental$ElementalForm.FIRE) {
      e.burst(FlameParticle.FACTORY, 50);
      Sample.INSTANCE.play$Object$float(Assets$Sounds.BURNING, 2);
      for (const $it0 = this.buffs$().iterator(); $it0.hasNext(); ) {
        let b = $it0.next();
        if (b instanceof Chill || b instanceof Frost) {
          b.detach();
        }
      }
    } else if (form === VaultBossElemental$ElementalForm.FROST) {
      e.burst(MagicMissile$MagicParticle.FACTORY, 50);
      Sample.INSTANCE.play$Object$float(Assets$Sounds.SHATTER, 2);
      for (const $it1 = this.buffs$().iterator(); $it1.hasNext(); ) {
        let b = $it1.next();
        if (b instanceof Burning) {
          b.detach();
        }
      }
    } else if (form === VaultBossElemental$ElementalForm.SHOCK) {
      e.burst(SparkParticle.FACTORY, 50);
      Sample.INSTANCE.play$Object$float(Assets$Sounds.LIGHTNING, 2);
    }
    if (this.spTargetCell !== -1) {
      this.spTargetCell = -1;
      this.spAttackCooldown = 0;
    }
    this.envAttackCooldown = $J.idiv(this.envAttackCooldown, 2);
    this.sprite_.flipHorizontal_ = wasTurned;
    BossHealthBar.assignBoss$Mob$boolean(this, true);
    this.weakAnnounced = false;
  }
  aggro(ch: Char): void {
    super.aggro(ch);
    this.enemySeen = true;
  }
  act(): boolean {
    if (this.enemy == null) {
      if (this.fieldOfView == null || this.fieldOfView.length !== Dungeon.level.length()) {
        this.fieldOfView = $J.newArray(Dungeon.level.length(), false);
        Dungeon.level.updateFieldOfView(this, this.fieldOfView);
      }
      this.chooseEnemy();
    }
    if (this.spTargetCell !== -1 && this.paralysed === 0 && this.enemy != null) {
      if (this.sprite_ != null && (this.sprite_.visible_ || this.enemy.sprite_.visible_)) {
        this.sprite_.zap$int(this.spTargetCell);
        this.lastEnemyPos = this.enemy.pos;
        return false;
      } else {
        this.zap();
        this.lastEnemyPos = this.enemy.pos;
        return true;
      }
    }
    this.spAttackCooldown--;
    this.envAttackCooldown--;
    if (this.state_ === this.HUNTING && this.paralysed === 0 && this.enemy != null) {
      if (this.spAttackCooldown <= 0) {
        this.spend(GameMath.gate(this.attackDelay(), Math.fround($J.d2i(Math.ceil(Dungeon.hero.cooldown()))), Math.fround(3 * this.attackDelay())));
        if (this.form === VaultBossElemental$ElementalForm.FIRE) {
          this.setupFireBall(this.enemy);
        } else if (this.form === VaultBossElemental$ElementalForm.FROST) {
          this.setupFrostCone(this.enemy);
        } else if (this.form === VaultBossElemental$ElementalForm.SHOCK) {
          this.setupLightningBolt(this.enemy);
        }
        Dungeon.hero.interrupt();
        this.lastEnemyPos = this.enemy.pos;
        return true;
      } else if (this.envAttackCooldown <= 0) {
        this.spend(Actor.TICK);
        if (this.form === VaultBossElemental$ElementalForm.FIRE) {
          this.setupFireWall();
        } else if (this.form === VaultBossElemental$ElementalForm.FROST) {
          this.setupFrostVortex();
        } else if (this.form === VaultBossElemental$ElementalForm.SHOCK) {
          this.setupLightningChase();
        }
        this.sprite_.operate$int(this.enemy.pos);
        this.envAttackCooldown = Random.NormalIntRange(10, 15);
        if (this.form === VaultBossElemental$ElementalForm.SHOCK) {
          this.envAttackCooldown = $J.d2i((Math.fround(this.envAttackCooldown * Math.fround(0.67))));
        }
        Dungeon.hero.interrupt();
        this.lastEnemyPos = this.enemy.pos;
        return true;
      }
    }
    let lastState = this.state_;
    let result = super.act();
    if (!(lastState === this.WANDERING && this.state_ === this.HUNTING)) {
      if (this.enemy != null) {
        this.lastEnemyPos = this.enemy.pos;
      } else {
        this.lastEnemyPos = Dungeon.hero.pos;
      }
    }
    return result;
  }
  zap(): void {
    this.spend(Actor.TICK);
    Invisibility.dispel$Char(this);
    if (this.form === VaultBossElemental$ElementalForm.FIRE) {
      this.doFireBall(this.spTargetCell);
    } else if (this.form === VaultBossElemental$ElementalForm.FROST) {
      this.doFrostCone(this.spTargetCell);
    } else if (this.form === VaultBossElemental$ElementalForm.SHOCK) {
      this.doLightningBolt(this.spTargetCell);
    }
    this.spAttackCooldown = Random.NormalIntRange(6, 10);
    if (this.form === VaultBossElemental$ElementalForm.SHOCK) {
      this.spAttackCooldown = $J.d2i((Math.fround(this.spAttackCooldown * Math.fround(0.67))));
    }
    this.spTargetCell = -1;
  }
  onZapComplete(): void {
    this.zap();
    this.next();
  }
  defenseProc(enemy: Char, damage: number): number {
    if (this.form === VaultBossElemental$ElementalForm.SHOCK && enemy === Dungeon.hero && !(Dungeon.hero.belongings.attackingWeapon() instanceof MissileWeapon)) {
      enemy.sprite_.parent.addToFront(new Lightning()._Lightning$PointF$PointF$Callback(this.sprite_.center$(), enemy.sprite_.center$(), null));
      enemy.damage(Random.IntRange(5, 10), new Shocking()._Shocking());
      Sample.INSTANCE.play$Object(Assets$Sounds.LIGHTNING);
      PixelScene.shake(2, Math.fround(0.3));
      enemy.sprite_.centerEmitter().burst(SparkParticle.FACTORY, 3);
      enemy.sprite_.flash();
      if (!enemy.isAlive()) {
        Badges.validateDeathFromEnemyMagic();
        Dungeon.fail(this);
      } else {
        GLog.w(Messages.get$Object$String$ObjectArr(this, 'shock_resist', []), []);
      }
    }
    return super.defenseProc(enemy, damage);
  }
  damage(dmg: number, src: any): void {
    if (this.form === VaultBossElemental$ElementalForm.FIRE) {
      if (AntiMagic.RESISTS.contains($J.getClass(src))) {
        dmg = $J.idiv(dmg, 4);
        if (src instanceof Wand || src instanceof ClericSpell) {
          GLog.w(Messages.get$Object$String$ObjectArr(this, 'fire_resist', []), []);
          this.spAttackCooldown = (this.spAttackCooldown - 3) | 0;
          this.envAttackCooldown = (this.envAttackCooldown - 5) | 0;
        }
      } else if (src === Dungeon.hero && Dungeon.hero.belongings.attackingWeapon() instanceof MissileWeapon) {
        if (!this.weakAnnounced) {
          GLog.p(Messages.get$Object$String$ObjectArr(this, 'fire_weak', []), []);
          this.weakAnnounced = true;
        }
        Sample.INSTANCE.play$Object(Assets$Sounds.HIT_STRONG);
        dmg = (dmg + 10) | 0;
      }
    } else if (this.form === VaultBossElemental$ElementalForm.FROST) {
      if (src === Dungeon.hero && Dungeon.hero.belongings.attackingWeapon() instanceof MissileWeapon) {
        GLog.w(Messages.get$Object$String$ObjectArr(this, 'frost_resist', []), []);
        dmg = $J.idiv(dmg, 4);
      } else if (src === Dungeon.hero && !(Dungeon.hero.belongings.attackingWeapon() instanceof MissileWeapon)) {
        if (!this.weakAnnounced) {
          GLog.p(Messages.get$Object$String$ObjectArr(this, 'frost_weak', []), []);
          this.weakAnnounced = true;
        }
        Sample.INSTANCE.play$Object(Assets$Sounds.HIT_STRONG);
        dmg = (dmg + 10) | 0;
      }
    } else if (this.form === VaultBossElemental$ElementalForm.SHOCK) {
      if (AntiMagic.RESISTS.contains($J.getClass(src))) {
        if (!this.weakAnnounced) {
          GLog.p(Messages.get$Object$String$ObjectArr(this, 'shock_weak', []), []);
          this.weakAnnounced = true;
        }
        if (src instanceof Wand || src instanceof ClericSpell) {
          Dungeon.hero.belongings.charge(Math.fround(0.2));
        }
        Sample.INSTANCE.play$Object(Assets$Sounds.HIT_STRONG);
        dmg = (dmg + 10) | 0;
      } else if (src instanceof Char && !(src === Dungeon.hero && Dungeon.hero.belongings.attackingWeapon() instanceof MissileWeapon)) {
        dmg = $J.idiv(dmg, 4);
      }
    }
    let hpBracket = $J.idiv(this.HT, 5);
    let curbracket = $J.d2i(Math.ceil(Math.fround(this.HP / Math.fround(hpBracket))));
    let preHP = this.HP;
    super.damage(dmg, src);
    let dmgTaken = (preHP - this.HP) | 0;
    if (dmgTaken > 0) {
      this.envAttackCooldown = $J.d2i(Math.fround(this.envAttackCooldown - Math.fround(dmgTaken / 24)));
      this.spAttackCooldown = $J.d2i(Math.fround(this.spAttackCooldown - Math.fround(dmgTaken / 12)));
    }
    if (this.HP <= Math.imul(((curbracket - 1) | 0), hpBracket)) {
      if (this.isAlive()) {
        this.HP = Math.max(this.HP, Math.imul(((curbracket - 2) | 0), hpBracket));
        let newForm: VaultBossElemental$ElementalForm;
        do {
          newForm = VaultBossElemental$ElementalForm.values()[Random.Int$int(3)];
        } while (newForm === this.form);
        this.changeForm();
        this.spend(Actor.TICK);
      }
    }
  }
  die(cause: any): void {
    super.die(cause);
    Dungeon.level.unseal();
    GameScene.bossSlain();
  }
  sprite(): CharSprite {
    if (this.form == null) {
      this.changeForm();
    }
    let sprite = super.sprite();
    if (this.form != null) {
      (sprite).setForm(this.form);
    }
    return sprite;
  }
  add(buff: Buff): boolean {
    if (buff instanceof PinCushion && this.form !== VaultBossElemental$ElementalForm.FROST) {
      Buff.affect$Char$Class(this, $J.cls(VaultBossElemental$PinCushionRemover)).preferGrouping = this.form === VaultBossElemental$ElementalForm.FIRE;
    }
    let harmful = false;
    if (this.form === VaultBossElemental$ElementalForm.FIRE) {
      harmful = buff instanceof Frost || buff instanceof Chill;
    } else if (this.form === VaultBossElemental$ElementalForm.FROST) {
      harmful = buff instanceof Burning;
    }
    if (harmful) {
      this.damage(Random.NormalIntRange(5, 10), buff);
      return false;
    }
    return super.add(buff);
  }
  properties(): HashSet<Char$Property> {
    let props = new HashSet(this.properties_);
    if (this.form === VaultBossElemental$ElementalForm.FIRE) {
      props.add(Char$Property.FIERY);
    } else if (this.form === VaultBossElemental$ElementalForm.FROST) {
      props.add(Char$Property.ICY);
    } else if (this.form === VaultBossElemental$ElementalForm.SHOCK) {
      props.add(Char$Property.ELECTRIC);
    }
    return props;
  }
  resist(effect: JClass): number {
    if (this.form === VaultBossElemental$ElementalForm.SHOCK && effect === $J.cls(WandOfLightning)) {
      return 1;
    }
    return super.resist(effect);
  }
  description(): string {
    let desc = super.description();
    if (this.form != null) {
      switch (this.form) {
        default:
        case VaultBossElemental$ElementalForm.FIRE:
          return desc + '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_fire', []);
        case VaultBossElemental$ElementalForm.FROST:
          return desc + '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_frost', []);
        case VaultBossElemental$ElementalForm.SHOCK:
          return desc + '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_shock', []);
      }
    } else {
      return desc;
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$Enum(VaultBossElemental.FORM, this.form);
    bundle.put$String$int(VaultBossElemental.ENV_ATK_COOLDOWN, this.envAttackCooldown);
    bundle.put$String$int(VaultBossElemental.SP_ATK_COOLDOWN, this.spAttackCooldown);
    bundle.put$String$int(VaultBossElemental.SP_TARGET_CELL, this.spTargetCell);
    bundle.put$String$int(VaultBossElemental.LAST_ENEMY_POS, this.lastEnemyPos);
    bundle.put$String$int(VaultBossElemental.LIGHTNING_OFS, this.lightningOfs);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.form = bundle.getEnum(VaultBossElemental.FORM, $J.cls(VaultBossElemental$ElementalForm));
    this.envAttackCooldown = bundle.getInt(VaultBossElemental.ENV_ATK_COOLDOWN);
    this.spAttackCooldown = bundle.getInt(VaultBossElemental.SP_ATK_COOLDOWN);
    this.spTargetCell = bundle.getInt(VaultBossElemental.SP_TARGET_CELL);
    this.lastEnemyPos = bundle.getInt(VaultBossElemental.LAST_ENEMY_POS);
    this.lightningOfs = bundle.getInt(VaultBossElemental.LIGHTNING_OFS);
    BossHealthBar.assignBoss$Mob(this);
  }
  /**
   * Fire Form Abilities ***
   */
  setupFireBall(enemy: Char): void {
    if (Dungeon.level.adjacent(enemy.pos, this.lastEnemyPos)) {
      this.spTargetCell = (enemy.pos + (enemy.pos - this.lastEnemyPos)) | 0;
    } else {
      this.spTargetCell = (enemy.pos + PathFinder.NEIGHBOURS8[Random.Int$int(8)]) | 0;
    }
    let wall = this.buff($J.cls(VaultBossElemental$FireWall));
    if (wall != null) {
      let ofs = 0;
      let valid: boolean;
      do {
        valid = true;
        for (let i of wall.cells) {
          if (i === ((this.spTargetCell + ofs) | 0)) {
            do {
              ofs = PathFinder.NEIGHBOURS8[Random.Int$int(4)];
            } while (Actor.findChar(ofs) != null);
            valid = false;
            break;
          }
        }
      } while (!valid);
      this.spTargetCell = (this.spTargetCell + ofs) | 0;
    }
    for (let i of PathFinder.NEIGHBOURS9) {
      if (!(Dungeon.level.solid[(this.spTargetCell + i) | 0])) {
        GameScene.targetedCell$int$float((this.spTargetCell + i) | 0, this.cooldown());
      }
    }
  }
  doFireBall(cell: number): void {
    Sample.INSTANCE.play$Object(Assets$Sounds.BURNING);
    for (let i of PathFinder.NEIGHBOURS9) {
      if (Dungeon.level.solid[(cell + i) | 0]) {
        continue;
      }
      (CellEmitter.get((cell + i) | 0)).burst(FlameParticle.FACTORY, 10);
      GameScene.add$Blob(Blob.seed$int$int$Class((cell + i) | 0, 2, $J.cls(Fire)));
      let ch = Actor.findChar((cell + i) | 0);
      if (ch != null && !(ch instanceof VaultBossElemental)) {
        Buff.affect$Char$Class(ch, $J.cls(Burning)).reignite$Char(ch);
        if (ch === Dungeon.hero) {
          Statistics.questScores[3] = (Statistics.questScores[3] - 100) | 0;
        }
      }
    }
  }
  setupFireWall(): void {
    let wall = Buff.append$Char$Class(this, $J.cls(VaultBossElemental$FireWall));
    wall.cells = $J.newArray(10, 0);
    let r = (Dungeon.level).room$int(this.pos);
    let c = r.center();
    let i = 0;
    let wallDistances = new ArrayList();
    let heroPos = Dungeon.level.cellToPoint(Dungeon.hero.pos);
    wallDistances.add(0, (heroPos.x - (c.x - 6)) | 0);
    wallDistances.add(1, (heroPos.y - (c.y - 6)) | 0);
    wallDistances.add(2, (c.x + 6 - heroPos.x) | 0);
    wallDistances.add(3, (c.y + 6 - heroPos.y) | 0);
    let sortedDistances = wallDistances.clone();
    Collections.shuffle(sortedDistances);
    Collections.sort(sortedDistances);
    let wallFrom = 0;
    let minSkipDist: number;
    let maxSkipDist: number;
    if (this.HP > $J.idiv(this.HT, 2)) {
      minSkipDist = 1;
      maxSkipDist = 3;
      do {
        wallFrom = Random.Int$int(4);
      } while (wallDistances.get(wallFrom) < sortedDistances.get(1));
    } else {
      minSkipDist = 4;
      maxSkipDist = 6;
      if ($J.equals(sortedDistances.get(0), sortedDistances.get(1)) && $J.equals(sortedDistances.get(2), sortedDistances.get(3))) {
        wallFrom = Random.Int$int(4);
      } else {
        do {
          wallFrom = Random.Int$int(4);
        } while ($J.equals(wallDistances.get(wallFrom), sortedDistances.get(0)) || $J.equals(wallDistances.get(wallFrom), sortedDistances.get(3)));
      }
    }
    if (wallFrom === 1 || wallFrom === 3) {
      let y: number;
      if (wallFrom === 1) {
        y = (c.y - 6) | 0;
        wall.direction = Dungeon.level.width();
      } else {
        y = (c.y + 6) | 0;
        wall.direction = -Dungeon.level.width();
      }
      let skip: number;
      do {
        skip = Random.IntRange((c.x - 5) | 0, (c.x + 5) | 0);
      } while ((Math.abs((skip - heroPos.x) | 0)) > maxSkipDist || (Math.abs((skip - heroPos.x) | 0)) < minSkipDist);
      for (let x = (c.x - 5) | 0; x <= ((c.x + 5) | 0); x++) {
        if (x === skip) {
          continue;
        }
        wall.cells[i] = (x + (Math.imul(y, Dungeon.level.width()))) | 0;
        i++;
      }
    } else {
      let x: number;
      if (wallFrom === 0) {
        x = (c.x - 6) | 0;
        wall.direction = 1;
      } else {
        x = (c.x + 6) | 0;
        wall.direction = -1;
      }
      let skip: number;
      do {
        skip = Random.IntRange((c.y - 5) | 0, (c.y + 5) | 0);
      } while ((Math.abs((skip - heroPos.y) | 0)) > maxSkipDist || (Math.abs((skip - heroPos.y) | 0)) < minSkipDist);
      for (let y = (c.y - 5) | 0; y <= ((c.y + 5) | 0); y++) {
        if (y === skip) {
          continue;
        }
        wall.cells[i] = (x + (Math.imul(y, Dungeon.level.width()))) | 0;
        i++;
      }
    }
  }
  /**
   * Frost Form Abilities ***
   */
  setupFrostCone(enemy: Char): void {
    this.spTargetCell = enemy.pos;
    let core = new Ballistica()._Ballistica(this.pos, enemy.pos, Ballistica.WONT_STOP);
    let cone = new ConeAOE()._ConeAOE$Ballistica$float$float$int(core, 10, 50, Ballistica.STOP_SOLID);
    for (const $it2 = cone.cells.iterator(); $it2.hasNext(); ) {
      let cell = $it2.next();
      if (Dungeon.level.trueDistance(cell, this.pos) <= Math.fround(2)) {
        GameScene.targetedCell$int$float(cell, this.cooldown());
      }
    }
  }
  doFrostCone(cell: number): void {
    let cone = Buff.append$Char$Class(this, $J.cls(VaultBossElemental$FrostCone));
    let core = new Ballistica()._Ballistica(this.pos, cell, Ballistica.WONT_STOP);
    cone.cells = new ConeAOE()._ConeAOE$Ballistica$float$float$int(core, 10, 50, Ballistica.STOP_SOLID).cells;
    cone.startPos = this.pos;
  }
  setupFrostVortex(): void {
    let vortex = Buff.append$Char$Class(this, $J.cls(VaultBossElemental$FrostVortex));
    vortex.targetCell = Dungeon.hero.pos;
  }
  setupLightningBolt(enemy: Char): void {
    this.spTargetCell = enemy.pos;
    this.lightningOfs = Random.Int$int(2);
    let bolt = new Ballistica()._Ballistica(this.pos, this.spTargetCell, Ballistica.STOP_SOLID);
    for (const $it3 = bolt.subPath(0, bolt.dist).iterator(); $it3.hasNext(); ) {
      let cell = $it3.next();
      GameScene.targetedCell$int$float(cell, this.cooldown());
    }
    for (let i = this.lightningOfs % 2; i < PathFinder.CIRCLE8.length; i = (i + 2) | 0) {
      GameScene.targetedCell$int$float((this.spTargetCell + PathFinder.CIRCLE8[i]) | 0, this.cooldown());
    }
  }
  doLightningBolt(cell: number): void {
    let affectedCells = new HashSet();
    let bolt = new Ballistica()._Ballistica(this.pos, cell, Ballistica.STOP_SOLID);
    for (const $it4 = bolt.subPath(0, bolt.dist).iterator(); $it4.hasNext(); ) {
      let c = $it4.next();
      CellEmitter.get(c).burst(SparkParticle.FACTORY, 5);
      affectedCells.add(c);
    }
    for (let i = this.lightningOfs % 2; i < PathFinder.CIRCLE8.length; i = (i + 2) | 0) {
      (CellEmitter.get((cell + PathFinder.CIRCLE8[i]) | 0)).burst(SparkParticle.FACTORY, 5);
      affectedCells.add((cell + PathFinder.CIRCLE8[i]) | 0);
    }
    for (const $it5 = affectedCells.iterator(); $it5.hasNext(); ) {
      let c = $it5.next();
      let ch = Actor.findChar(c);
      if (ch != null && !(ch instanceof VaultBossElemental) && ch.buff($J.cls(VaultBossElemental$ShockResist)) == null) {
        ch.damage(Random.NormalIntRange(20, 30), new Electricity()._Electricity());
        Buff.prolong(ch, $J.cls(Paralysis), 1);
        Buff.affect$Char$Class(ch, $J.cls(VaultBossElemental$ShockResist));
        ch.sprite_.centerEmitter().burst(SparkParticle.FACTORY, 3);
        ch.sprite_.flash();
        if (ch === Dungeon.hero) {
          Sample.INSTANCE.play$Object(Assets$Sounds.LIGHTNING);
          PixelScene.shake(2, Math.fround(0.3));
          Statistics.questScores[3] = (Statistics.questScores[3] - 100) | 0;
          if (!ch.isAlive()) {
            Badges.validateDeathFromEnemyMagic();
            Dungeon.fail(this);
          }
        }
      }
    }
    this.sprite_.parent.add$Gizmo(new Lightning()._Lightning$int$int$Callback((cell + PathFinder.CIRCLE8[this.lightningOfs]) | 0, (cell + (PathFinder.CIRCLE8[(this.lightningOfs + 4) | 0])) | 0, null));
    this.sprite_.parent.add$Gizmo(new Lightning()._Lightning$int$int$Callback((cell + (PathFinder.CIRCLE8[(this.lightningOfs + 2) | 0])) | 0, (cell + (PathFinder.CIRCLE8[(this.lightningOfs + 6) | 0])) | 0, null));
  }
  setupLightningChase(): void {
    let r = (Dungeon.level).room$int(this.pos);
    let c = r.center();
    let alt = Random.Int$int(2) === 0;
    if (alt || this.HP <= $J.idiv(this.HT, 2)) {
      let chase = Buff.append$Char$Class(this, $J.cls(VaultBossElemental$LightningChase));
      chase.curCell = (c.x + Math.imul(((c.y - 5) | 0), Dungeon.level.width())) | 0;
      chase = Buff.append$Char$Class(this, $J.cls(VaultBossElemental$LightningChase));
      chase.curCell = (c.x + Math.imul(((c.y + 5) | 0), Dungeon.level.width())) | 0;
    }
    if (!alt || this.HP <= $J.idiv(this.HT, 2)) {
      let chase = Buff.append$Char$Class(this, $J.cls(VaultBossElemental$LightningChase));
      chase.curCell = (c.x - 5 + Math.imul((c.y), Dungeon.level.width())) | 0;
      chase = Buff.append$Char$Class(this, $J.cls(VaultBossElemental$LightningChase));
      chase.curCell = (c.x + 5 + Math.imul((c.y), Dungeon.level.width())) | 0;
    }
  }
}

export class VaultBossElemental$ElementalForm extends JEnum {
  static FIRE: VaultBossElemental$ElementalForm = null;
  static FROST: VaultBossElemental$ElementalForm = null;
  static SHOCK: VaultBossElemental$ElementalForm = null;
  static UNSTABLE: VaultBossElemental$ElementalForm = null;
  static $VALUES: VaultBossElemental$ElementalForm[] = null;
  _VaultBossElemental$ElementalForm($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): VaultBossElemental$ElementalForm[] { return VaultBossElemental$ElementalForm.$VALUES.slice(); }
  static valueOf(name: string): VaultBossElemental$ElementalForm { return $J.enumValueOf(VaultBossElemental$ElementalForm, name); }
  static $clinit() {
    VaultBossElemental$ElementalForm.FIRE = new VaultBossElemental$ElementalForm()._VaultBossElemental$ElementalForm('FIRE', 0);
    VaultBossElemental$ElementalForm.FROST = new VaultBossElemental$ElementalForm()._VaultBossElemental$ElementalForm('FROST', 1);
    VaultBossElemental$ElementalForm.SHOCK = new VaultBossElemental$ElementalForm()._VaultBossElemental$ElementalForm('SHOCK', 2);
    VaultBossElemental$ElementalForm.UNSTABLE = new VaultBossElemental$ElementalForm()._VaultBossElemental$ElementalForm('UNSTABLE', 3);
    VaultBossElemental$ElementalForm.$VALUES = [VaultBossElemental$ElementalForm.FIRE, VaultBossElemental$ElementalForm.FROST, VaultBossElemental$ElementalForm.SHOCK, VaultBossElemental$ElementalForm.UNSTABLE];
  }
}

export class VaultBossElemental$PinCushionRemover extends Buff {
  preferGrouping: boolean = false;
  _VaultBossElemental$PinCushionRemover(): this {
    this._Buff();
    this.actPriority = Actor.VFX_PRIO;
    this.preferGrouping = false;
    return this;
  }
  act(): boolean {
    if (this.target.buff($J.cls(PinCushion)) == null) {
      this.detach();
      return true;
    }
    PathFinder.buildDistanceMap$int$booleanArr$int(this.target.pos, Dungeon.level.passable, 2);
    let candidates = new ArrayList();
    let furthestDist = 1;
    let closestDist = 100;
    for (let i = 0; i < Dungeon.level.length(); i++) {
      if (PathFinder.distance[i] === 2) {
        let dist = Dungeon.level.distance(i, Dungeon.hero.pos);
        if (dist > 1) {
          if (dist < closestDist) {
            closestDist = dist;
          }
          if (dist > furthestDist) {
            furthestDist = dist;
          }
          candidates.add(i);
        }
      }
    }
    if ((Math.abs((furthestDist - closestDist) | 0)) <= 1) {
      furthestDist++;
      closestDist--;
    }
    let existingStacks = new ArrayList();
    for (let i of $J.toArrayInto(candidates.toArray(), $J.newArray(0, null))) {
      let dist = Dungeon.level.distance(i, Dungeon.hero.pos);
      if (dist <= closestDist || dist >= furthestDist) {
        candidates.remove(i);
      } else {
        if (Dungeon.level.heaps.get(i) != null) {
          existingStacks.add(i);
        }
      }
    }
    if (this.preferGrouping && !existingStacks.isEmpty()) {
      candidates = existingStacks;
    }
    while (this.target.buff($J.cls(PinCushion)) != null) {
      let item = this.target.buff($J.cls(PinCushion)).grabOne();
      Dungeon.level.drop(item, Random.element$Collection(candidates)).sprite_.drop$int(this.target.pos);
    }
    this.detach();
    return true;
  }
}

export class VaultBossElemental$FireWall extends Buff {
  cells: number[] = null;
  direction: number = 0;
  left_: number = 0;
  emitters: ArrayList<Emitter> = null;
  static CELLS: string = null;
  static DIRECTION: string = null;
  static LEFT: string = null;
  _VaultBossElemental$FireWall(): this {
    this._Buff();
    this.cells = $J.newArray(0, 0);
    this.left_ = 11;
    this.emitters = new ArrayList();
    return this;
  }
  act(): boolean {
    for (let i = 0; i < this.cells.length; i++) {
      for (let j = 0; j < 2; j++) {
        if (Dungeon.level.insideMap((this.cells[i] + Math.imul(j, this.direction)) | 0) && !(Dungeon.level.solid[(this.cells[i] + Math.imul(j, this.direction)) | 0])) {
          (CellEmitter.get((this.cells[i] + Math.imul(j, this.direction)) | 0)).burst(FlameParticle.FACTORY, 10);
          let ch = Actor.findChar((this.cells[i] + Math.imul(j, this.direction)) | 0);
          if (ch != null && !(ch instanceof VaultBossElemental)) {
            Buff.affect$Char$Class(ch, $J.cls(Burning)).reignite$Char$float(ch, 5);
            if (ch === Dungeon.hero) {
              Sample.INSTANCE.play$Object(Assets$Sounds.BURNING);
              Statistics.questScores[3] = (Statistics.questScores[3] - 100) | 0;
            }
          }
        }
      }
      this.cells[i] = (this.cells[i] + this.direction) | 0;
    }
    Sample.INSTANCE.play$Object$float(Assets$Sounds.BURNING, 0.5);
    if (this.left_-- <= 0) {
      this.detach();
    } else {
      this.updateFX();
    }
    this.spend(Actor.TICK);
    return true;
  }
  updateFX(): void {
    for (const $it6 = this.emitters.iterator(); $it6.hasNext(); ) {
      let e = $it6.next();
      e.on = false;
    }
    this.emitters.clear();
    for (let cell of this.cells) {
      let oneOpen = false;
      for (let j = 0; j < 2; j++) {
        if (Dungeon.level.insideMap((cell + Math.imul(j, this.direction)) | 0) && !(Dungeon.level.solid[(cell + Math.imul(j, this.direction)) | 0])) {
          let pour = CellEmitter.get((cell + Math.imul(j, this.direction)) | 0);
          pour.pour(FlameParticle.FACTORY, Math.fround(0.1));
          this.emitters.add(pour);
          oneOpen = true;
        }
      }
      if (!oneOpen) {
        for (let j = 1; j <= this.left_; j++) {
          if (Dungeon.level.insideMap((cell + Math.imul(j, this.direction)) | 0) && !(Dungeon.level.solid[(cell + Math.imul(this.direction, j)) | 0])) {
            let pour = CellEmitter.center((cell + Math.imul(this.direction, j)) | 0);
            pour.pour(FlameParticle.FACTORY, 0.5);
            this.emitters.add(pour);
            break;
          }
        }
      }
    }
  }
  fx(on: boolean): void {
    if (on) {
      this.updateFX();
    } else {
      for (const $it7 = this.emitters.iterator(); $it7.hasNext(); ) {
        let e = $it7.next();
        e.on = false;
      }
      this.emitters.clear();
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$intArr(VaultBossElemental$FireWall.CELLS, this.cells);
    bundle.put$String$int(VaultBossElemental$FireWall.DIRECTION, this.direction);
    bundle.put$String$int(VaultBossElemental$FireWall.LEFT, this.left_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.cells = bundle.getIntArray(VaultBossElemental$FireWall.CELLS);
    this.direction = bundle.getInt(VaultBossElemental$FireWall.DIRECTION);
    this.left_ = bundle.getInt(VaultBossElemental$FireWall.LEFT);
  }
  static $clinit() {
    VaultBossElemental$FireWall.CELLS = 'cells';
    VaultBossElemental$FireWall.DIRECTION = 'direction';
    VaultBossElemental$FireWall.LEFT = 'left';
  }
}

export class VaultBossElemental$FrostResist extends Buff {
  _VaultBossElemental$FrostResist(): this {
    this._Buff();
    this.actPriority = (Actor.BUFF_PRIO - 1) | 0;
    return this;
  }
  act(): boolean {
    if (this.target.buff($J.cls(Frost)) != null) {
      this.spend(this.target.cooldown());
      return true;
    } else {
      this.detach();
      return true;
    }
  }
}

export class VaultBossElemental$FrostCone extends Buff {
  startPos: number = 0;
  cells: HashSet<number> = null;
  distance_: number = 0;
  emitters: HashSet<Emitter> = null;
  static readonly START_POS: string = 'start_pos';
  static readonly CELLS: string = 'cells';
  static readonly DISTANCE: string = 'distance';
  _VaultBossElemental$FrostCone(): this {
    this._Buff();
    this.cells = new HashSet();
    this.distance_ = 2;
    this.emitters = new HashSet();
    return this;
  }
  act(): boolean {
    for (let cell of $J.toArrayInto(this.cells.toArray(), $J.newArray(0, null))) {
      if (Dungeon.level.trueDistance(cell, this.startPos) <= Math.fround(this.distance_)) {
        CellEmitter.get(cell).burst(MagicMissile$WhiteParticle.FACTORY, 10);
        let ch = Actor.findChar(cell);
        if (ch != null && !(ch instanceof VaultBossElemental) && ch.buff($J.cls(VaultBossElemental$FrostResist)) == null) {
          ch.damage(Random.NormalIntRange(10, 15), new Frost()._Frost());
          Buff.affect$Char$Class$float(ch, $J.cls(Frost), 5);
          Buff.affect$Char$Class(ch, $J.cls(VaultBossElemental$FrostResist));
          if (ch === Dungeon.hero) {
            Statistics.questScores[3] = (Statistics.questScores[3] - 100) | 0;
            Sample.INSTANCE.play$Object(Assets$Sounds.SHATTER);
            if (!ch.isAlive()) {
              Badges.validateDeathFromEnemyMagic();
              Dungeon.fail(this.target);
            }
          }
        }
        if (Dungeon.level.trueDistance(cell, this.startPos) <= Math.fround((this.distance_ - 4) | 0)) {
          this.cells.remove(cell);
        }
      }
    }
    this.updateFX();
    this.distance_ = (this.distance_ + 2) | 0;
    if (this.cells.isEmpty()) {
      this.detach();
    } else {
      this.spend(Actor.TICK);
      for (const $it8 = this.cells.iterator(); $it8.hasNext(); ) {
        let cell = $it8.next();
        if (Dungeon.level.trueDistance(cell, this.startPos) <= Math.fround(this.distance_) && Dungeon.level.trueDistance(cell, this.startPos) > Math.fround((this.distance_ - 2) | 0)) {
          GameScene.targetedCell$int$float(cell, this.cooldown());
        }
      }
    }
    return true;
  }
  updateFX(): void {
    for (const $it9 = this.emitters.iterator(); $it9.hasNext(); ) {
      let e = $it9.next();
      e.on = false;
    }
    this.emitters.clear();
    for (const $it10 = this.cells.iterator(); $it10.hasNext(); ) {
      let cell = $it10.next();
      if (Dungeon.level.trueDistance(cell, this.startPos) <= Math.fround(this.distance_)) {
        let e = CellEmitter.get(cell);
        e.pour(SnowParticle.FACTORY, Math.fround(0.1));
        this.emitters.add(e);
      }
    }
  }
  fx(on: boolean): void {
    if (on) {
      this.updateFX();
    } else {
      for (const $it11 = this.emitters.iterator(); $it11.hasNext(); ) {
        let e = $it11.next();
        e.on = false;
      }
      this.emitters.clear();
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(VaultBossElemental$FrostCone.START_POS, this.startPos);
    let bundleCells = $J.newArray(this.cells.size(), 0);
    let i = 0;
    for (const $it12 = this.cells.iterator(); $it12.hasNext(); ) {
      let cell = $it12.next();
      bundleCells[i] = cell;
      i++;
    }
    bundle.put$String$intArr(VaultBossElemental$FrostCone.CELLS, bundleCells);
    bundle.put$String$int(VaultBossElemental$FrostCone.DISTANCE, this.distance_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.startPos = bundle.getInt(VaultBossElemental$FrostCone.START_POS);
    for (let cell of bundle.getIntArray(VaultBossElemental$FrostCone.CELLS)) {
      this.cells.add(cell);
    }
    this.distance_ = bundle.getInt(VaultBossElemental$FrostCone.DISTANCE);
  }
}

export class VaultBossElemental$FrostVortex extends Buff {
  targetCell: number = 0;
  distance_: number = 0;
  fullVortex: boolean = false;
  altDirection: boolean = false;
  emitters: ArrayList<Emitter> = null;
  static TARGET_CELL: string = null;
  static DISTANCE: string = null;
  static FULL_VORTEX: string = null;
  static ALT_DIR: string = null;
  _VaultBossElemental$FrostVortex(): this {
    this._Buff();
    this.targetCell = -1;
    this.distance_ = -1000;
    this.fullVortex = false;
    this.altDirection = false;
    this.emitters = new ArrayList();
    return this;
  }
  act(): boolean {
    if (this.distance_ === -1000) {
      let furthestDist = 0;
      let valid = true;
      let dist = this.getFurthestValid(this.targetCell, -1, -1);
      if (dist > furthestDist) {
        furthestDist = dist;
      }
      dist = this.getFurthestValid(this.targetCell, -1, 1);
      if (dist > furthestDist) {
        furthestDist = dist;
      }
      dist = this.getFurthestValid(this.targetCell, 1, 1);
      if (dist > furthestDist) {
        furthestDist = dist;
      }
      dist = this.getFurthestValid(this.targetCell, 1, -1);
      if (dist > furthestDist) {
        furthestDist = dist;
      }
      this.distance_ = Math.min(furthestDist, 5);
      this.fullVortex = this.target.HP <= $J.idiv(this.target.HT, 2);
      this.altDirection = Random.Int$int(2) === 0;
    }
    let cells = new HashSet();
    if (this.fullVortex) {
      cells.addAll(this.getCells(this.targetCell, this.distance_, -1, -1));
      cells.addAll(this.getCells(this.targetCell, this.distance_, -1, 1));
      cells.addAll(this.getCells(this.targetCell, this.distance_, 1, 1));
      cells.addAll(this.getCells(this.targetCell, this.distance_, 1, -1));
    } else {
      if (this.altDirection) {
        cells.addAll(this.getCells(this.targetCell, this.distance_, -1, -1));
        cells.addAll(this.getCells(this.targetCell, this.distance_, 1, 1));
      } else {
        cells.addAll(this.getCells(this.targetCell, this.distance_, -1, 1));
        cells.addAll(this.getCells(this.targetCell, this.distance_, 1, -1));
      }
    }
    this.distance_--;
    this.updateFX();
    if (cells.isEmpty()) {
      this.detach();
      return true;
    } else {
      for (const $it13 = cells.iterator(); $it13.hasNext(); ) {
        let cell = $it13.next();
        CellEmitter.get(cell).burst(MagicMissile$WhiteParticle.FACTORY, 10);
        let ch = Actor.findChar(cell);
        if (ch != null && !(ch instanceof VaultBossElemental) && ch.buff($J.cls(VaultBossElemental$FrostResist)) == null) {
          Buff.affect$Char$Class$float(ch, $J.cls(Frost), 5);
          Buff.affect$Char$Class(ch, $J.cls(VaultBossElemental$FrostResist));
          if (ch === Dungeon.hero) {
            Sample.INSTANCE.play$Object(Assets$Sounds.SHATTER);
            Statistics.questScores[3] = (Statistics.questScores[3] - 100) | 0;
          }
        }
      }
      Sample.INSTANCE.play$Object$float(Assets$Sounds.GAS, 0.25);
      this.spend(Actor.TICK);
      return true;
    }
  }
  updateFX(): void {
    for (const $it14 = this.emitters.iterator(); $it14.hasNext(); ) {
      let e = $it14.next();
      e.on = false;
    }
    this.emitters.clear();
    if (this.targetCell !== -1) {
      let cells = new HashSet();
      if (this.fullVortex) {
        cells.addAll(this.getCells(this.targetCell, this.distance_, -1, -1));
        cells.addAll(this.getCells(this.targetCell, this.distance_, -1, 1));
        cells.addAll(this.getCells(this.targetCell, this.distance_, 1, 1));
        cells.addAll(this.getCells(this.targetCell, this.distance_, 1, -1));
      } else {
        if (this.altDirection) {
          cells.addAll(this.getCells(this.targetCell, this.distance_, -1, -1));
          cells.addAll(this.getCells(this.targetCell, this.distance_, 1, 1));
        } else {
          cells.addAll(this.getCells(this.targetCell, this.distance_, -1, 1));
          cells.addAll(this.getCells(this.targetCell, this.distance_, 1, -1));
        }
      }
      for (const $it15 = cells.iterator(); $it15.hasNext(); ) {
        let cell = $it15.next();
        let pour = CellEmitter.get(cell);
        pour.pour(SnowParticle.FACTORY, Math.fround(0.1));
        this.emitters.add(pour);
      }
    }
  }
  fx(on: boolean): void {
    if (on) {
      this.updateFX();
    } else {
      for (const $it16 = this.emitters.iterator(); $it16.hasNext(); ) {
        let e = $it16.next();
        e.on = false;
      }
      this.emitters.clear();
    }
  }
  getFurthestValid(start: number, dirX: number, dirY: number): number {
    let dist = 0;
    if (Dungeon.level.solid[start]) {
      return dist;
    }
    do {
      if (dist % 2 === 0) {
        start = (start + dirX) | 0;
      } else {
        start = (start + Math.imul(dirY, Dungeon.level.width())) | 0;
      }
      dist++;
    } while (Dungeon.level.insideMap(start) && !Dungeon.level.solid[start]);
    return dist;
  }
  getCells(start: number, dist: number, dirX: number, dirY: number): HashSet<number> {
    dist = Math.abs(dist);
    if (this.getFurthestValid(start, dirX, dirY) < dist) {
      return new HashSet();
    }
    let xOfs = ($J.idiv(Math.imul(dirX, ((dist + 1) | 0)), 2));
    let yOfs = Math.imul(($J.idiv(Math.imul(dirY, dist), 2)), Dungeon.level.width());
    let initialOfsCell = (start + xOfs + yOfs) | 0;
    let cells = new HashSet();
    let cell = initialOfsCell;
    do {
      cells.add(cell);
      cell = (cell + (-dirX + Math.imul(dirY, Dungeon.level.width()))) | 0;
    } while (Dungeon.level.insideMap(cell) && !Dungeon.level.solid[cell]);
    cell = initialOfsCell;
    do {
      cells.add(cell);
      cell = (cell + (+dirX - Math.imul(dirY, Dungeon.level.width()))) | 0;
    } while (Dungeon.level.insideMap(cell) && !Dungeon.level.solid[cell]);
    return cells;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(VaultBossElemental$FrostVortex.TARGET_CELL, this.targetCell);
    bundle.put$String$int(VaultBossElemental$FrostVortex.DISTANCE, this.distance_);
    bundle.put$String$boolean(VaultBossElemental$FrostVortex.FULL_VORTEX, this.fullVortex);
    bundle.put$String$boolean(VaultBossElemental$FrostVortex.ALT_DIR, this.altDirection);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.targetCell = bundle.getInt(VaultBossElemental$FrostVortex.TARGET_CELL);
    this.distance_ = bundle.getInt(VaultBossElemental$FrostVortex.DISTANCE);
    this.fullVortex = bundle.getBoolean(VaultBossElemental$FrostVortex.FULL_VORTEX);
    this.altDirection = bundle.getBoolean(VaultBossElemental$FrostVortex.ALT_DIR);
  }
  static $clinit() {
    VaultBossElemental$FrostVortex.TARGET_CELL = 'target_cell';
    VaultBossElemental$FrostVortex.DISTANCE = 'distance';
    VaultBossElemental$FrostVortex.FULL_VORTEX = 'full_vortex';
    VaultBossElemental$FrostVortex.ALT_DIR = 'alt_direction';
  }
}

export class VaultBossElemental$ShockResist extends Buff {
  _VaultBossElemental$ShockResist(): this {
    this._Buff();
    this.actPriority = (Actor.BUFF_PRIO - 1) | 0;
    return this;
  }
  act(): boolean {
    if (this.target.buff($J.cls(Paralysis)) != null) {
      this.spend(this.target.cooldown());
      return true;
    } else {
      this.detach();
      return true;
    }
  }
}

export class VaultBossElemental$LightningChase extends Buff {
  static lastSFXTime: number = 0;
  direction: number = 0;
  curCell: number = 0;
  midCell: number = 0;
  endCell: number = 0;
  emitters: ArrayList<Emitter> = null;
  static DIRECTION: string = null;
  static CUR_CELL: string = null;
  static MID_CELL: string = null;
  static END_CELL: string = null;
  _VaultBossElemental$LightningChase(): this {
    this._Buff();
    this.direction = -1;
    this.curCell = -1;
    this.midCell = -1;
    this.endCell = -1;
    this.emitters = new ArrayList();
    return this;
  }
  act(): boolean {
    let curPos: PointF;
    if (this.direction === Math.fround(-1)) {
      curPos = new PointF()._PointF$Point(Dungeon.level.cellToPoint(this.curCell));
      curPos.x = Math.fround(curPos.x + 0.5);
      curPos.y = Math.fround(curPos.y + 0.5);
      this.direction = PointF.angle$PointF$PointF(curPos, new PointF()._PointF$Point(Dungeon.level.cellToPoint(Dungeon.hero.pos)));
      let curCell = Dungeon.level.pointToCell(curPos.floor());
      CellEmitter.get(curCell).burst(SparkParticle.FACTORY, 10);
    } else {
      CellEmitter.get(this.curCell).burst(SparkParticle.FACTORY, 10);
      let ch = Actor.findChar(this.curCell);
      if (ch != null && !(ch instanceof VaultBossElemental) && ch.buff($J.cls(VaultBossElemental$ShockResist)) == null) {
        this.shockChar(ch);
      }
      if (Dungeon.level.insideMap(this.midCell) && !Dungeon.level.solid[this.midCell]) {
        CellEmitter.get(this.midCell).burst(SparkParticle.FACTORY, 10);
        ch = Actor.findChar(this.midCell);
        if (ch != null && !(ch instanceof VaultBossElemental) && ch.buff($J.cls(VaultBossElemental$ShockResist)) == null) {
          this.shockChar(ch);
        }
        if (Dungeon.level.insideMap(this.endCell) && !Dungeon.level.solid[this.endCell]) {
          CellEmitter.get(this.endCell).burst(SparkParticle.FACTORY, 10);
          ch = Actor.findChar(this.endCell);
          if (ch != null && !(ch instanceof VaultBossElemental) && ch.buff($J.cls(VaultBossElemental$ShockResist)) == null) {
            this.shockChar(ch);
          }
        } else {
          this.detach();
          return true;
        }
      } else {
        this.detach();
        return true;
      }
      curPos = new PointF()._PointF$Point(Dungeon.level.cellToPoint(this.endCell));
      curPos.x = Math.fround(curPos.x + 0.5);
      curPos.y = Math.fround(curPos.y + 0.5);
      let targetAngle = PointF.angle$PointF$PointF(curPos, new PointF()._PointF$Point(Dungeon.level.cellToPoint(Dungeon.hero.pos)));
      if (Math.fround(Math.abs(Math.fround(this.direction - targetAngle))) > PointF.PI) {
        if (this.direction > targetAngle) {
          targetAngle = Math.fround(targetAngle + PointF.PI2);
        } else {
          targetAngle = Math.fround(targetAngle - PointF.PI2);
        }
      }
      let maxMove = Random.Float$float$float(Math.fround(PointF.PI / 8), Math.fround(PointF.PI / 6));
      if (this.direction > targetAngle) {
        this.direction = Math.fround(this.direction - Math.min(Math.fround(this.direction - targetAngle), maxMove));
      } else {
        this.direction = Math.fround(this.direction + Math.min(Math.fround(targetAngle - this.direction), maxMove));
      }
      if (this.direction > PointF.PI) {
        this.direction = Math.fround(this.direction - PointF.PI2);
      } else if (this.direction < Math.fround(-PointF.PI)) {
        this.direction = Math.fround(this.direction + PointF.PI2);
      }
    }
    let endPos = new PointF()._PointF$PointF(curPos);
    endPos.offset$PointF(new PointF()._PointF$PointF(curPos).polar(this.direction, 2));
    endPos.x = Math.fround($J.roundf(Math.fround(2 * endPos.x)) / 2);
    endPos.y = Math.fround($J.roundf(Math.fround(2 * endPos.y)) / 2);
    let midPos = PointF.inter(curPos, endPos, 0.5);
    this.endCell = Dungeon.level.pointToCell(endPos.floor());
    this.midCell = Dungeon.level.pointToCell(midPos.floor());
    this.curCell = Dungeon.level.pointToCell(curPos.floor());
    if (Actor.now() > VaultBossElemental$LightningChase.lastSFXTime) {
      Sample.INSTANCE.play$Object$float(Assets$Sounds.LIGHTNING, 0.5);
      VaultBossElemental$LightningChase.lastSFXTime = Actor.now();
    }
    this.updateFX();
    this.spend(Actor.TICK);
    return true;
  }
  shockChar(ch: Char): void {
    ch.damage(Random.NormalIntRange(10, 15), new Electricity()._Electricity());
    Buff.prolong(ch, $J.cls(Paralysis), 1);
    Buff.affect$Char$Class(ch, $J.cls(VaultBossElemental$ShockResist));
    ch.sprite_.centerEmitter().burst(SparkParticle.FACTORY, 3);
    ch.sprite_.flash();
    if (ch === Dungeon.hero) {
      Sample.INSTANCE.play$Object(Assets$Sounds.LIGHTNING);
      PixelScene.shake(2, Math.fround(0.3));
      Statistics.questScores[3] = (Statistics.questScores[3] - 100) | 0;
      if (!ch.isAlive()) {
        Badges.validateDeathFromEnemyMagic();
        Dungeon.fail(this.target);
      }
    }
  }
  updateFX(): void {
    for (const $it17 = this.emitters.iterator(); $it17.hasNext(); ) {
      let e = $it17.next();
      e.on = false;
    }
    this.emitters.clear();
    if (this.endCell !== -1 && Dungeon.level.insideMap(this.endCell) && !Dungeon.level.solid[this.endCell]) {
      let e = CellEmitter.get(this.endCell);
      e.pour(SparkParticle.STATIC, Math.fround(0.1));
      this.emitters.add(e);
    }
    if (this.midCell !== -1 && Dungeon.level.insideMap(this.midCell) && !Dungeon.level.solid[this.midCell]) {
      let e = CellEmitter.get(this.midCell);
      e.pour(SparkParticle.STATIC, Math.fround(0.1));
      this.emitters.add(e);
    }
    if (this.curCell !== -1 && Dungeon.level.insideMap(this.curCell) && !Dungeon.level.solid[this.curCell]) {
      let e = CellEmitter.get(this.curCell);
      e.pour(SparkParticle.STATIC, Math.fround(0.1));
      this.emitters.add(e);
    }
  }
  fx(on: boolean): void {
    if (on) {
      this.updateFX();
    } else {
      for (const $it18 = this.emitters.iterator(); $it18.hasNext(); ) {
        let e = $it18.next();
        e.on = false;
      }
      this.emitters.clear();
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$float(VaultBossElemental$LightningChase.DIRECTION, this.direction);
    bundle.put$String$int(VaultBossElemental$LightningChase.CUR_CELL, this.curCell);
    bundle.put$String$int(VaultBossElemental$LightningChase.MID_CELL, this.midCell);
    bundle.put$String$int(VaultBossElemental$LightningChase.END_CELL, this.endCell);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.direction = Math.fround(bundle.getInt(VaultBossElemental$LightningChase.DIRECTION));
    this.curCell = bundle.getInt(VaultBossElemental$LightningChase.CUR_CELL);
    this.midCell = bundle.getInt(VaultBossElemental$LightningChase.MID_CELL);
    this.endCell = bundle.getInt(VaultBossElemental$LightningChase.END_CELL);
    VaultBossElemental$LightningChase.lastSFXTime = -1;
  }
  static $clinit() {
    VaultBossElemental$LightningChase.lastSFXTime = -1;
    VaultBossElemental$LightningChase.DIRECTION = 'direction';
    VaultBossElemental$LightningChase.CUR_CELL = 'cur_cell';
    VaultBossElemental$LightningChase.MID_CELL = 'mid_cell';
    VaultBossElemental$LightningChase.END_CELL = 'end_cell';
  }
}

$J.define(VaultBossElemental, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultBossElemental', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_VaultBossElemental' } });
$J.define(VaultBossElemental$ElementalForm, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultBossElemental$ElementalForm', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_VaultBossElemental$ElementalForm' }, clinit: true, lazy: ['$VALUES', 'FIRE', 'FROST', 'SHOCK', 'UNSTABLE'] });
$J.define(VaultBossElemental$PinCushionRemover, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultBossElemental$PinCushionRemover', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_VaultBossElemental$PinCushionRemover' } });
$J.define(VaultBossElemental$FireWall, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultBossElemental$FireWall', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_VaultBossElemental$FireWall' }, clinit: true, lazy: ['CELLS', 'DIRECTION', 'LEFT'] });
$J.define(VaultBossElemental$FrostResist, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultBossElemental$FrostResist', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_VaultBossElemental$FrostResist' } });
$J.define(VaultBossElemental$FrostCone, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultBossElemental$FrostCone', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_VaultBossElemental$FrostCone' } });
$J.define(VaultBossElemental$FrostVortex, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultBossElemental$FrostVortex', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_VaultBossElemental$FrostVortex' }, clinit: true, lazy: ['TARGET_CELL', 'DISTANCE', 'FULL_VORTEX', 'ALT_DIR'] });
$J.define(VaultBossElemental$ShockResist, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultBossElemental$ShockResist', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_VaultBossElemental$ShockResist' } });
$J.define(VaultBossElemental$LightningChase, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultBossElemental$LightningChase', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_VaultBossElemental$LightningChase' }, clinit: true, lazy: ['lastSFXTime', 'DIRECTION', 'CUR_CELL', 'MID_CELL', 'END_CELL'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Blob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob');
  Electricity = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Electricity');
  Fire = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Fire');
  Burning = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Burning');
  Chill = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Chill');
  Frost = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Frost');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Paralysis = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Paralysis');
  PinCushion = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.PinCushion');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  ClericSpell = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.ClericSpell');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Lightning = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Lightning');
  MagicMissile$MagicParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$MagicParticle');
  MagicMissile$WhiteParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$WhiteParticle');
  FlameParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.FlameParticle');
  SnowParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.SnowParticle');
  SparkParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.SparkParticle');
  AntiMagic = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.AntiMagic');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  WandOfLightning = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfLightning');
  Shocking = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Shocking');
  MeleeWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon');
  MissileWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  ConeAOE = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.ConeAOE');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  VaultBossElementalSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.VaultBossElementalSprite');
  AttackIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.AttackIndicator');
  BossHealthBar = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BossHealthBar');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  GameMath = $J.load('com.watabou.utils.GameMath');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  PointF = $J.load('com.watabou.utils.PointF');
  Random = $J.load('com.watabou.utils.Random');
});
