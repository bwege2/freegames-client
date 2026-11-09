// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/wands/WandOfWarding.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../../jre/index.ts';
import { Wand } from './Wand.ts';
import { NPC } from '../../actors/mobs/npcs/NPC.ts';

let Assets$Sounds, Badges, Dungeon, Actor, Char$Alignment, Char$Property, AllyBuff, Dread, Sleep, Terror, Vertigo, Hero, Stasis, FloatingText, MagicMissile, MagicMissile$WardParticle, Item, Wand$Charger, Bestiary, Ballistica, Messages, GameScene, CharSprite, ItemSpriteSheet, WardSprite, GLog, WndOptions, Game, Sample, PointF, Random;

export class WandOfWarding extends Wand {
  wardAvailable: boolean = false;
  _WandOfWarding(): this {
    this._Wand();
    this.image_ = ItemSpriteSheet.WAND_WARDING;
    this.usesTargeting_ = false;
    this.wardAvailable = true;
    return this;
  }
  collisionProperties(target: number): number {
    if (this.cursed) {
      return super.collisionProperties(target);
    } else if (!Dungeon.level.heroFOV[target]) {
      return Ballistica.PROJECTILE;
    } else {
      return Ballistica.STOP_TARGET;
    }
  }
  execute$Hero$String(hero: Hero, action: string): void {
    this.usesTargeting_ = this.cursed && this.cursedKnown;
    super.execute$Hero$String(hero, action);
  }
  tryToZap(owner: Hero, target: number): boolean {
    if (this.cursed) {
      return super.tryToZap(owner, target);
    }
    let currentWardEnergy = 0;
    for (const $it0 = Actor.chars().iterator(); $it0.hasNext(); ) {
      let ch = $it0.next();
      if (ch instanceof WandOfWarding$Ward) {
        currentWardEnergy = (currentWardEnergy + (ch).tier_) | 0;
      }
    }
    if (Stasis.getStasisAlly() instanceof WandOfWarding$Ward) {
      currentWardEnergy = (currentWardEnergy + (Stasis.getStasisAlly()).tier_) | 0;
    }
    let maxWardEnergy = 0;
    for (const $it1 = Item.curUser.buffs$().iterator(); $it1.hasNext(); ) {
      let buff = $it1.next();
      if (buff instanceof Wand$Charger) {
        if ((buff).wand() instanceof WandOfWarding) {
          maxWardEnergy = (maxWardEnergy + (2 + (buff).wand().level$())) | 0;
        }
      }
    }
    this.wardAvailable = (currentWardEnergy < maxWardEnergy);
    let ch = Actor.findChar(target);
    if (ch instanceof WandOfWarding$Ward) {
      if (!this.wardAvailable && (ch).tier_ <= 3) {
        GLog.w(Messages.get$Object$String$ObjectArr(this, 'no_more_wards', []), []);
        return false;
      }
    } else {
      if (((currentWardEnergy + 1) | 0) > maxWardEnergy) {
        GLog.w(Messages.get$Object$String$ObjectArr(this, 'no_more_wards', []), []);
        return false;
      }
    }
    return super.tryToZap(owner, target);
  }
  onZap(bolt: Ballistica): void {
    let target = bolt.collisionPos;
    let ch = Actor.findChar(target);
    if (ch != null && !(ch instanceof WandOfWarding$Ward)) {
      if (bolt.dist > 1) {
        target = bolt.path.get((bolt.dist - 1) | 0);
      }
      ch = Actor.findChar(target);
      if (ch != null && !(ch instanceof WandOfWarding$Ward)) {
        GLog.w(Messages.get$Object$String$ObjectArr(this, 'bad_location', []), []);
        Dungeon.level.pressCell$int(bolt.collisionPos);
        return;
      }
    }
    if (ch != null) {
      if (ch instanceof WandOfWarding$Ward) {
        if (this.wardAvailable) {
          (ch).upgrade(this.buffedLvl());
        } else {
          (ch).wandHeal$int(this.buffedLvl());
        }
        ch.sprite_.emitter().burst(MagicMissile$WardParticle.UP, (ch).tier_);
      } else {
        GLog.w(Messages.get$Object$String$ObjectArr(this, 'bad_location', []), []);
        Dungeon.level.pressCell$int(target);
      }
    } else if (!Dungeon.level.passable[target]) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'bad_location', []), []);
      Dungeon.level.pressCell$int(target);
    } else {
      let ward = new WandOfWarding$Ward()._WandOfWarding$Ward();
      ward.pos = target;
      ward.wandLevel = this.buffedLvl();
      GameScene.add$Mob$float(ward, 1);
      Dungeon.level.occupyCell(ward);
      ward.sprite_.emitter().burst(MagicMissile$WardParticle.UP, ward.tier_);
      Dungeon.level.pressCell$int(target);
    }
  }
  fx(bolt: Ballistica, callback: Callback): void {
    let m = MagicMissile.boltFromChar(Item.curUser.sprite_.parent, MagicMissile.WARD, Item.curUser.sprite_, bolt.collisionPos, callback);
    if (bolt.dist > 10) {
      m.setSpeed(Math.fround(Math.imul(bolt.dist, 20)));
    }
    Sample.INSTANCE.play$Object(Assets$Sounds.ZAP);
  }
  onHit(staff: MagesStaff, attacker: Char, defender: Char, damage: number): void {
    let level = Math.max(0, staff.buffedLvl());
    let procChance = Math.fround(Math.fround((Math.fround(level + 1)) / (Math.fround(level + 5))) * Wand.procChanceMultiplier(attacker));
    if (Random.Float$() < procChance) {
      let powerMulti = Math.max(1, procChance);
      for (const $it2 = Actor.chars().iterator(); $it2.hasNext(); ) {
        let ch = $it2.next();
        if (ch instanceof WandOfWarding$Ward) {
          (ch).wandHeal$int$float(staff.buffedLvl(), powerMulti);
          ch.sprite_.emitter().burst(MagicMissile$WardParticle.UP, (ch).tier_);
        }
      }
    }
  }
  staffFx(particle: MagesStaff$StaffParticle): void {
    particle.color$int(8921855);
    particle.am = Math.fround(0.3);
    particle.setLifespan(3);
    particle.speed_.polar(Random.Float$float(PointF.PI2), Math.fround(0.3));
    particle.setSize(1, 2);
    particle.radiateXY(2.5);
  }
  statsDesc(): string {
    if (this.levelKnown) {
      return Messages.get$Object$String$ObjectArr(this, 'stats_desc', [(this.level$() + 2) | 0]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'stats_desc', [2]);
    }
  }
  upgradeStat1(level: number): string {
    return ((2 + level) | 0) + '-' + ((8 + Math.imul(4, level)) | 0);
  }
  upgradeStat2(level: number): string {
    return String((level + 2) | 0);
  }
}

export class WandOfWarding$Ward extends NPC {
  tier_: number = 0;
  wandLevel: number = 0;
  totalZaps: number = 0;
  static readonly TIER: string = 'tier';
  static readonly WAND_LEVEL: string = 'wand_level';
  static readonly TOTAL_ZAPS: string = 'total_zaps';
  _WandOfWarding$Ward(): this {
    this._NPC();
    this.tier_ = 1;
    this.wandLevel = 1;
    this.totalZaps = 0;
    this.spriteClass = $J.cls(WardSprite);
    this.alignment = Char$Alignment.ALLY;
    this.properties_.add(Char$Property.IMMOVABLE);
    this.properties_.add(Char$Property.INORGANIC);
    this.viewDistance = 4;
    this.state_ = this.WANDERING;
    this.immunities_.add($J.cls(Sleep));
    this.immunities_.add($J.cls(Terror));
    this.immunities_.add($J.cls(Dread));
    this.immunities_.add($J.cls(Vertigo));
    this.immunities_.add($J.cls(AllyBuff));
    return this;
  }
  name(): string {
    return Messages.get$Object$String$ObjectArr(this, 'name_' + this.tier_, []);
  }
  upgrade(wandLevel: number): void {
    if (this.wandLevel < wandLevel) {
      this.wandLevel = wandLevel;
    }
    switch (this.tier_) {
      case 1:
      case 2:
      default:
        break;
      case 3:
        this.HT = 35;
        this.HP = (15 + Math.imul(((5 - this.totalZaps) | 0), 4)) | 0;
        break;
      case 4:
        this.HT = 54;
        this.HP = (this.HP + 19) | 0;
        break;
      case 5:
        this.HT = 84;
        this.HP = (this.HP + 30) | 0;
        break;
      case 6:
        this.wandHeal$int(wandLevel);
        break;
    }
    if (Actor.chars().contains(this) && this.tier_ >= 3) {
      Bestiary.setSeen($J.cls(WandOfWarding$Ward$WardSentry));
    }
    if (this.tier_ < 6) {
      this.tier_++;
      this.viewDistance++;
      if (this.sprite_ != null) {
        (this.sprite_).updateTier(this.tier_);
        this.sprite_.place(this.pos);
      }
      GameScene.updateFog$int$int(this.pos, (this.viewDistance + 1) | 0);
    }
  }
  wandHeal$int(wandLevel: number): void {
    this.wandHeal$int$float(wandLevel, 1);
  }
  wandHeal$int$float(wandLevel: number, healFactor: number): void {
    if (this.wandLevel < wandLevel) {
      this.wandLevel = wandLevel;
    }
    let heal: number;
    switch (this.tier_) {
      default:
        return;
      case 2:
        heal = $J.roundf(Math.fround(1 * healFactor));
        break;
      case 3:
        heal = $J.roundf(Math.fround(Random.IntRange(1, 2) * healFactor));
        break;
      case 4:
        heal = $J.roundf(Math.fround(9 * healFactor));
        break;
      case 5:
        heal = $J.roundf(Math.fround(12 * healFactor));
        break;
      case 6:
        heal = $J.roundf(Math.fround(16 * healFactor));
        break;
    }
    if (this.tier_ <= 3) {
      this.totalZaps = (Math.max(0, (this.totalZaps - heal) | 0));
    } else {
      this.HP = Math.min(this.HT, (this.HP + heal) | 0);
    }
    if (this.sprite_ != null) {
      this.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(heal), FloatingText.HEALING, []);
    }
  }
  defenseSkill(enemy: Char): number {
    if (this.tier_ > 3) {
      this.defenseSkill_ = (4 + Dungeon.scalingDepth()) | 0;
    }
    return super.defenseSkill(enemy);
  }
  drRoll(): number {
    let dr = super.drRoll();
    if (this.tier_ > 3) {
      return (dr + $J.roundf(Math.fround((Random.NormalIntRange(0, (3 + $J.idiv(Dungeon.scalingDepth(), 2)) | 0)) / (Math.fround(7 - this.tier_))))) | 0;
    } else {
      return dr;
    }
  }
  canAttack(enemy: Char): boolean {
    return new Ballistica()._Ballistica(this.pos, enemy.pos, Ballistica.MAGIC_BOLT).collisionPos === enemy.pos;
  }
  doAttack(enemy: Char): boolean {
    let visible = this.fieldOfView[this.pos] || this.fieldOfView[enemy.pos];
    if (visible) {
      this.sprite_.zap$int(enemy.pos);
    } else {
      this.zap();
    }
    return !visible;
  }
  zap(): void {
    this.spend(1);
    let dmg = Hero.heroDamageIntRange((2 + this.wandLevel) | 0, (8 + Math.imul(4, this.wandLevel)) | 0);
    let enemy = this.enemy;
    enemy.damage(dmg, this);
    if (enemy.isAlive()) {
      Wand.wandProc(enemy, this.wandLevel, 1);
    }
    if (!enemy.isAlive() && enemy === Dungeon.hero) {
      Badges.validateDeathFromFriendlyMagic();
      GLog.n(Messages.capitalize(Messages.get$Object$String$ObjectArr(this, 'kill', [this.name()])), []);
      Dungeon.fail($J.cls(WandOfWarding));
    }
    this.totalZaps++;
    switch (this.tier_) {
      case 1:
      case 2:
      case 3:
      default:
        if (this.totalZaps >= ((Math.imul(2, this.tier_) - 1) | 0)) {
          this.die(this);
        }
        break;
      case 4:
        this.damage(5, this);
        break;
      case 5:
        this.damage(6, this);
        break;
      case 6:
        this.damage(7, this);
        break;
    }
  }
  onZapComplete(): void {
    this.zap();
    this.next();
  }
  getCloser(target: number): boolean {
    return false;
  }
  getFurther(target: number): boolean {
    return false;
  }
  sprite(): CharSprite {
    let sprite = super.sprite();
    sprite.linkVisuals(this);
    return sprite;
  }
  updateSpriteState(): void {
    super.updateSpriteState();
    (this.sprite_).updateTier(this.tier_);
    this.sprite_.place(this.pos);
  }
  destroy(): void {
    super.destroy();
    Dungeon.observe$();
    GameScene.updateFog$int$int(this.pos, (this.viewDistance + 1) | 0);
  }
  canInteract(c: Char): boolean {
    return true;
  }
  interact(c: Char): boolean {
    if (c !== Dungeon.hero) {
      return true;
    }
    Game.runOnRenderThread(new (WandOfWarding$Ward$1())().$o(this));
    return true;
  }
  description(): string {
    if (!Actor.chars().contains(this)) {
      if (this.tier_ < 4) {
        return Messages.get$Object$String$ObjectArr(this, 'desc_generic_ward', []);
      } else {
        return Messages.get$Object$String$ObjectArr(this, 'desc_generic_sentry', []);
      }
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'desc_' + this.tier_, [(2 + this.wandLevel) | 0, (8 + Math.imul(4, this.wandLevel)) | 0, this.tier_]);
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(WandOfWarding$Ward.TIER, this.tier_);
    bundle.put$String$int(WandOfWarding$Ward.WAND_LEVEL, this.wandLevel);
    bundle.put$String$int(WandOfWarding$Ward.TOTAL_ZAPS, this.totalZaps);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.tier_ = bundle.getInt(WandOfWarding$Ward.TIER);
    this.viewDistance = (3 + this.tier_) | 0;
    this.wandLevel = bundle.getInt(WandOfWarding$Ward.WAND_LEVEL);
    this.totalZaps = bundle.getInt(WandOfWarding$Ward.TOTAL_ZAPS);
  }
}

export class WandOfWarding$Ward$WardSentry extends WandOfWarding$Ward {
  _WandOfWarding$Ward$WardSentry(): this {
    this._WandOfWarding$Ward();
    return this;
  }
}

let $WandOfWarding$Ward$1$1: any = null;
/** An anonymous class (WandOfWarding.java:464). */
function WandOfWarding$Ward$1$1(): any {
  return $WandOfWarding$Ward$1$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      if (index === 0) {
        this.$outer.$outer.die(null);
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfWarding$Ward$1$1', []);
}

let $WandOfWarding$Ward$1: any = null;
/** An anonymous class (WandOfWarding.java:457). */
function WandOfWarding$Ward$1(): any {
  return $WandOfWarding$Ward$1 ??= $J.local(class extends JObject {
    call(): void {
      GameScene.show(new (WandOfWarding$Ward$1$1())().$o(this)._WndOptions$Image$String$String$StringArr(this.$outer.sprite(), Messages.get$Object$String$ObjectArr(this.$outer, 'dismiss_title', []), Messages.get$Object$String$ObjectArr(this.$outer, 'dismiss_body', []), [Messages.get$Object$String$ObjectArr(this.$outer, 'dismiss_confirm', []), Messages.get$Object$String$ObjectArr(this.$outer, 'dismiss_cancel', [])]));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfWarding$Ward$1', ['com.watabou.utils.Callback']);
}

$J.define(WandOfWarding, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfWarding', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand', ctors: { '': '_WandOfWarding' }, meths: { 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' } });
$J.define(WandOfWarding$Ward, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfWarding$Ward', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.NPC', ctors: { '': '_WandOfWarding$Ward' }, meths: { 'wandHeal(int,float)': 'wandHeal$int$float', 'wandHeal(int)': 'wandHeal$int' } });
$J.define(WandOfWarding$Ward$WardSentry, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfWarding$Ward$WardSentry', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfWarding$Ward', ctors: { '': '_WandOfWarding$Ward$WardSentry' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  AllyBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AllyBuff');
  Dread = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Dread');
  Sleep = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Sleep');
  Terror = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Terror');
  Vertigo = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Vertigo');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  Stasis = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Stasis');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  MagicMissile = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile');
  MagicMissile$WardParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$WardParticle');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Wand$Charger = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand$Charger');
  Bestiary = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Bestiary');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  WardSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.WardSprite');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  Game = $J.load('com.watabou.noosa.Game');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  PointF = $J.load('com.watabou.utils.PointF');
  Random = $J.load('com.watabou.utils.Random');
});
