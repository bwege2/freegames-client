// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/abilities/cleric/PowerOfMany.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../../jre/index.ts';
import { ArmorAbility } from '../ArmorAbility.ts';
import { FlavourBuff } from '../../../buffs/FlavourBuff.ts';
import { DirectableAlly } from '../../../mobs/npcs/DirectableAlly.ts';
import { MobSprite } from '../../../../sprites/MobSprite.ts';

let Assets$Sounds, Dungeon, Actor, Char$Alignment, Char$Property, AllyBuff, Barrier, Buff, Buff$buffType, Invisibility, PrismaticGuard, HeroClass, Talent, BeamingRay$BeamingRayBoost, ClericSpell, LifeLinkSpell$LifeLinkSpellBuff, Stasis, Speck, ShaftParticle, Item, ScrollOfTeleportation, WandOfLivingEarth$RockArmor, Messages, GameScene, CharSprite$State, HeroSprite, BuffIndicator, HeroIcon, GLog, MovieClip$Animation, TextureFilm, Sample, Random;

export class PowerOfMany extends ArmorAbility {
  _PowerOfMany(): this {
    this._ArmorAbility();
    return this;
  }
  chargeUse(hero: Hero): number {
    if (PowerOfMany.getPoweredAlly() instanceof PowerOfMany$LightAlly) {
      return 0;
    }
    return super.chargeUse(hero);
  }
  targetingPrompt(): string {
    let ally = PowerOfMany.getPoweredAlly();
    let allyExists = ally != null;
    if (Dungeon.hero.buff($J.cls(PrismaticGuard)) != null && Dungeon.hero.buff($J.cls(PrismaticGuard)).isEmpowered()) {
      allyExists = true;
    }
    if (Dungeon.hero.buff($J.cls(WandOfLivingEarth$RockArmor)) != null && Dungeon.hero.buff($J.cls(WandOfLivingEarth$RockArmor)).isEmpowered()) {
      allyExists = true;
    }
    if (Stasis.getStasisAlly() != null) {
      allyExists = true;
    }
    if (ally instanceof PowerOfMany$LightAlly) {
      return Messages.get$Object$String$ObjectArr(this, 'prompt_ally', []);
    } else if (!allyExists) {
      return Messages.get$Object$String$ObjectArr(this, 'prompt_default', []);
    } else {
      return null;
    }
  }
  useTargeting(): boolean {
    return false;
  }
  activate(armor: ClassArmor, hero: Hero, target: number): void {
    let ally = PowerOfMany.getPoweredAlly();
    let allyExists = ally != null;
    if (hero.buff($J.cls(PrismaticGuard)) != null && hero.buff($J.cls(PrismaticGuard)).isEmpowered()) {
      allyExists = true;
    }
    if (hero.buff($J.cls(WandOfLivingEarth$RockArmor)) != null && hero.buff($J.cls(WandOfLivingEarth$RockArmor)).isEmpowered()) {
      allyExists = true;
    }
    if (Stasis.getStasisAlly() != null) {
      allyExists = true;
    }
    if (ally instanceof PowerOfMany$LightAlly) {
      if (target == null) {
        return;
      } else {
        (ally).directTocell(target);
      }
    } else if (allyExists) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'ally_exists', []), []);
    } else {
      if (target == null) {
        return;
      }
      if (!Dungeon.level.heroFOV[target]) {
        GLog.w(Messages.get$Object$String$ObjectArr(this, 'no_vision', []), []);
        return;
      }
      let chargeUse = this.chargeUse(hero);
      let ch = Actor.findChar(target);
      if (ch != null) {
        if (ch.alignment !== Char$Alignment.ALLY || ch === Dungeon.hero) {
          GLog.w(Messages.get$Object$String$ObjectArr(this, 'only_allies', []), []);
          return;
        }
      } else {
        if (!Dungeon.level.passable[target] || Dungeon.level.avoid[target]) {
          GLog.w(Messages.get$Class$String$ObjectArr($J.cls(ClericSpell), 'invalid_target', []), []);
          return;
        }
        ch = new PowerOfMany$LightAlly()._PowerOfMany$LightAlly$int(hero.lvl);
        ch.pos = target;
        GameScene.add$Mob(ch);
        ScrollOfTeleportation.appear(ch, ch.pos);
      }
      Buff.affect$Char$Class$float(ch, $J.cls(PowerOfMany$PowerBuff), 100);
      Buff.affect$Char$Class(ch, $J.cls(Barrier)).setShield(25);
      armor.charge_ = Math.fround(armor.charge_ - chargeUse);
      Item.updateQuickslot();
      hero.sprite_.zap$int(target);
      Sample.INSTANCE.play$Object(Assets$Sounds.CHARGEUP);
      Invisibility.dispel$();
      hero.spendAndNext(Actor.TICK);
    }
  }
  icon(): number {
    return HeroIcon.POWER_OF_MANY;
  }
  talents(): Talent[] {
    return [Talent.BEAMING_RAY, Talent.LIFE_LINK, Talent.STASIS, Talent.HEROIC_ENERGY];
  }
  static getPoweredAlly(): Char {
    for (const $it0 = Actor.chars().iterator(); $it0.hasNext(); ) {
      let ch = $it0.next();
      if (ch.buff($J.cls(PowerOfMany$PowerBuff)) != null) {
        return ch;
      }
    }
    return null;
  }
}

export class PowerOfMany$PowerBuff extends FlavourBuff {
  static DURATION: number = 0;
  _PowerOfMany$PowerBuff(): this {
    this._FlavourBuff();
    this.type_ = Buff$buffType.POSITIVE;
    this.announced = true;
    return this;
  }
  icon(): number {
    return BuffIndicator.MANY_POWER;
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(PowerOfMany$PowerBuff.DURATION - this.visualcooldown())) / PowerOfMany$PowerBuff.DURATION));
  }
  fx(on: boolean): void {
    if (on) {
      this.target.sprite_.add(CharSprite$State.GLOWING);
    } else {
      this.target.sprite_.remove$State(CharSprite$State.GLOWING);
    }
  }
  act(): boolean {
    if (this.target.buff($J.cls(BeamingRay$BeamingRayBoost)) != null || this.target.buff($J.cls(LifeLinkSpell$LifeLinkSpellBuff)) != null) {
      this.spend(Actor.TICK);
      return true;
    }
    return super.act();
  }
  detach(): void {
    super.detach();
    Dungeon.observe$();
    GameScene.updateFog$();
  }
  static $clinit() {
    PowerOfMany$PowerBuff.DURATION = 100;
  }
}

export class PowerOfMany$LightAlly extends DirectableAlly {
  cls: HeroClass = null;
  static readonly HERO_CLS: string = 'hero_cls';
  static readonly DEF_SKILL: string = 'def_skill';
  $init_PowerOfMany_LightAlly() {
    this.spriteClass = $J.cls(PowerOfMany$LightAllySprite);
    this.HP = this.HT = 80;
    this.immunities_.add($J.cls(AllyBuff));
    this.properties_.add(Char$Property.INORGANIC);
  }
  _PowerOfMany$LightAlly$(): this {
    this._DirectableAlly();
    this.$init_PowerOfMany_LightAlly();
    this.cls = HeroClass.values()[Random.Int$int(5)];
    return this;
  }
  _PowerOfMany$LightAlly$int(heroLevel: number): this {
    this._PowerOfMany$LightAlly$();
    this.defenseSkill_ = (heroLevel + 4) | 0;
    return this;
  }
  act(): boolean {
    if (this.buff($J.cls(PowerOfMany$PowerBuff)) == null) {
      this.die(null);
      return true;
    }
    let oldPos = this.pos;
    let result = super.act();
    if ((this.pos === this.target || oldPos === this.pos) && this.sprite_.looping()) {
      this.sprite_.idle();
    }
    return result;
  }
  defendPos(cell: number): void {
    GLog.i(Messages.get$Object$String$ObjectArr(this, 'direct_defend', []), []);
    super.defendPos(cell);
  }
  followHero(): void {
    GLog.i(Messages.get$Object$String$ObjectArr(this, 'direct_follow', []), []);
    super.followHero();
  }
  targetChar(ch: Char): void {
    GLog.i(Messages.get$Object$String$ObjectArr(this, 'direct_attack', []), []);
    super.targetChar(ch);
  }
  attackSkill(target: Char): number {
    return (this.defenseSkill_ + 5) | 0;
  }
  damageRoll(): number {
    return Random.NormalIntRange(5, 30);
  }
  drRoll(): number {
    return (super.drRoll() + Random.NormalIntRange(1, 5)) | 0;
  }
  speed(): number {
    let speed = super.speed();
    if (this.state_ === this.WANDERING && this.defendingPos === -1 && Dungeon.level.distance(this.pos, Dungeon.hero.pos) > 1) {
      speed = Math.fround(speed * 2);
    }
    return speed;
  }
  sprite(): CharSprite {
    let sprite = super.sprite();
    (sprite).setup(this.cls);
    return sprite;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$Enum(PowerOfMany$LightAlly.HERO_CLS, this.cls);
    bundle.put$String$int(PowerOfMany$LightAlly.DEF_SKILL, this.defenseSkill_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.cls = bundle.getEnum(PowerOfMany$LightAlly.HERO_CLS, $J.cls(HeroClass));
    this.defenseSkill_ = bundle.getInt(PowerOfMany$LightAlly.DEF_SKILL);
  }
}

export class PowerOfMany$LightAllySprite extends MobSprite {
  _PowerOfMany$LightAllySprite(): this {
    this._MobSprite();
    this.setup(HeroClass.values()[Random.Int$int(5)]);
    return this;
  }
  setup(cls: HeroClass): void {
    this.texture(cls.spritesheet());
    let film = new TextureFilm()._TextureFilm$TextureFilm$Object$int$int(HeroSprite.tiers(), 6, 12, 15);
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(1, true);
    this.idle_.frames$TextureFilm$ObjectArr(film, [0, 0, 0, 1, 0, 0, 1, 1]);
    this.run_ = new MovieClip$Animation()._MovieClip$Animation(20, true);
    this.run_.frames$TextureFilm$ObjectArr(film, [2, 3, 4, 5, 6, 7]);
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(20, false);
    this.die_.frames$TextureFilm$ObjectArr(film, [0]);
    this.attack = new MovieClip$Animation()._MovieClip$Animation(15, false);
    this.attack.frames$TextureFilm$ObjectArr(film, [13, 14, 15, 0]);
    this.play$Animation$boolean(this.idle_, true);
    this.resetColor();
  }
  link(ch: Char): void {
    super.link(ch);
    if (ch instanceof PowerOfMany$LightAlly) {
      this.setup((ch).cls);
    }
  }
  resetColor(): void {
    super.resetColor();
    this.alpha$float(Math.fround(0.8));
    this.tint$float$float$float$float(Math.fround(1.33), Math.fround(1.33), Math.fround(0.8), Math.fround(0.6));
    this.rm = this.gm = this.bm = 0;
  }
  die(): void {
    super.die();
    this.emitter().start(ShaftParticle.FACTORY, Math.fround(0.3), 4);
    this.emitter().start(Speck.factory$int(Speck.LIGHT), Math.fround(0.2), 3);
  }
  draw(): void {
    if (this.alpha$() >= Math.fround(0.8)) {
      this.alpha$float(Math.fround(0.8));
    }
    this.rm = this.gm = this.bm = 0;
    super.draw();
  }
}

$J.define(PowerOfMany, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.PowerOfMany', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.ArmorAbility', ctors: { '': '_PowerOfMany' } });
$J.define(PowerOfMany$PowerBuff, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.PowerOfMany$PowerBuff', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_PowerOfMany$PowerBuff' }, clinit: true, lazy: ['DURATION'] });
$J.define(PowerOfMany$LightAlly, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.PowerOfMany$LightAlly', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.DirectableAlly', ctors: { 'int': '_PowerOfMany$LightAlly$int', '': '_PowerOfMany$LightAlly$' } });
$J.define(PowerOfMany$LightAllySprite, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.PowerOfMany$LightAllySprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_PowerOfMany$LightAllySprite' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  AllyBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AllyBuff');
  Barrier = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Barrier');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  PrismaticGuard = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.PrismaticGuard');
  HeroClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  BeamingRay$BeamingRayBoost = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.BeamingRay$BeamingRayBoost');
  ClericSpell = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.ClericSpell');
  LifeLinkSpell$LifeLinkSpellBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.LifeLinkSpell$LifeLinkSpellBuff');
  Stasis = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Stasis');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  ShaftParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShaftParticle');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  ScrollOfTeleportation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTeleportation');
  WandOfLivingEarth$RockArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfLivingEarth$RockArmor');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  CharSprite$State = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite$State');
  HeroSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.HeroSprite');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Random = $J.load('com.watabou.utils.Random');
});
