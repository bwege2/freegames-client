// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/HolyLance.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../../../jre/index.ts';
import { TargetedClericSpell } from './TargetedClericSpell.ts';
import { Item } from '../../../items/Item.ts';
import { FlavourBuff } from '../../buffs/FlavourBuff.ts';

let Assets$Sounds, Dungeon, Actor, Char, Char$Property, Buff, Hero, Talent, GuidingLight$Illuminated, Splash, SparkParticle, Wand, Ballistica, Messages, ItemSprite$Glowing, ItemSpriteSheet, MissileSprite, BuffIndicator, HeroIcon, QuickSlotButton, GLog, Sample, Emitter, Random;

export class HolyLance extends TargetedClericSpell {
  static INSTANCE: HolyLance = null;
  _HolyLance(): this {
    this._TargetedClericSpell();
    return this;
  }
  icon(): number {
    return HeroIcon.HOLY_LANCE;
  }
  desc(): string {
    let min = (15 + Math.imul(15, Dungeon.hero.pointsInTalent(Talent.HOLY_LANCE))) | 0;
    let max = $J.roundf(Math.fround(27.5 + Math.fround(27.5 * Dungeon.hero.pointsInTalent(Talent.HOLY_LANCE))));
    return Messages.get$Object$String$ObjectArr(this, 'desc', [min, max]) + '\n\n' + Messages.get$Object$String$ObjectArr(this, 'charge_cost', [$J.d2i(this.chargeUse(Dungeon.hero))]);
  }
  canCast(hero: Hero): boolean {
    return super.canCast(hero) && hero.hasTalent(Talent.HOLY_LANCE) && hero.buff($J.cls(HolyLance$LanceCooldown)) == null;
  }
  chargeUse(hero: Hero): number {
    return 4;
  }
  targetingFlags(): number {
    return Ballistica.PROJECTILE;
  }
  onTargetSelected(tome: HolyTome, hero: Hero, target: number): void {
    if (target == null) {
      return;
    }
    let aim = new Ballistica()._Ballistica(hero.pos, target, this.targetingFlags());
    if (Actor.findChar(aim.collisionPos) === hero) {
      GLog.i(Messages.get$Class$String$ObjectArr($J.cls(Wand), 'self_target', []), []);
      return;
    }
    if (Actor.findChar(aim.collisionPos) != null) {
      QuickSlotButton.target(Actor.findChar(aim.collisionPos));
    } else {
      QuickSlotButton.target(Actor.findChar(target));
    }
    hero.sprite_.zap$int(target);
    hero.busy();
    Sample.INSTANCE.play$Object(Assets$Sounds.ZAP);
    let enemy = Actor.findChar(aim.collisionPos);
    if (enemy != null) {
      (hero.sprite_.parent.recycle($J.cls(MissileSprite))).reset$Visual$Visual$Item$Callback(hero.sprite_, enemy.sprite_, new HolyLance$HolyLanceVFX()._HolyLance$HolyLanceVFX(), new (HolyLance$1())().$o(this).$c(enemy, hero, tome));
    } else {
      (hero.sprite_.parent.recycle($J.cls(MissileSprite))).reset$Visual$int$Item$Callback(hero.sprite_, target, new HolyLance$HolyLanceVFX()._HolyLance$HolyLanceVFX(), new (HolyLance$2())().$o(this).$c(target, aim, hero, tome));
    }
  }
  static $clinit() {
    HolyLance.INSTANCE = new HolyLance()._HolyLance();
  }
}

export class HolyLance$HolyLanceVFX extends Item {
  _HolyLance$HolyLanceVFX(): this {
    this._Item();
    this.image_ = ItemSpriteSheet.THROWING_SPIKE;
    return this;
  }
  glowing(): ItemSprite$Glowing {
    return new ItemSprite$Glowing()._ItemSprite$Glowing$int$float(16777215, Math.fround(0.1));
  }
  emitter(): Emitter {
    let emitter = new Emitter()._Emitter();
    emitter.pos$float$float$float$float(5, 5, 0, 0);
    emitter.fillTarget = false;
    emitter.pour(SparkParticle.FACTORY, Math.fround(0.025));
    return emitter;
  }
}

export class HolyLance$LanceCooldown extends FlavourBuff {
  _HolyLance$LanceCooldown(): this {
    this._FlavourBuff();
    return this;
  }
  icon(): number {
    return BuffIndicator.TIME;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(Math.fround(0.67), Math.fround(0.67), 0);
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround(this.visualcooldown() / 30));
  }
}

let $HolyLance$1: any = null;
/** An anonymous class (HolyLance.java:115). */
function HolyLance$1(): any {
  return $HolyLance$1 ??= $J.local(class extends JObject {
    call(): void {
      let min = (15 + Math.imul(15, Dungeon.hero.pointsInTalent(Talent.HOLY_LANCE))) | 0;
      let max = $J.roundf(Math.fround(27.5 + Math.fround(27.5 * Dungeon.hero.pointsInTalent(Talent.HOLY_LANCE))));
      if (Char.hasProp(this.$cv_enemy, Char$Property.UNDEAD) || Char.hasProp(this.$cv_enemy, Char$Property.DEMONIC)) {
        min = max;
      }
      this.$cv_enemy.damage(Hero.heroDamageIntRange(min, max), this.$outer);
      Sample.INSTANCE.play$Object$float$float(Assets$Sounds.HIT_MAGIC, 1, Random.Float$float$float(Math.fround(0.8), 1));
      Sample.INSTANCE.play$Object$float$float(Assets$Sounds.HIT_STAB, 1, Random.Float$float$float(Math.fround(0.8), 1));
      if (this.$cv_enemy.isActive()) {
        Buff.affect$Char$Class(this.$cv_enemy, $J.cls(GuidingLight$Illuminated));
      }
      this.$cv_enemy.sprite_.burst(-1, 10);
      this.$cv_hero.spendAndNext(1);
      this.$outer.onSpellCast(this.$cv_tome, this.$cv_hero);
      Buff.affect$Char$Class$float(this.$cv_hero, $J.cls(HolyLance$LanceCooldown), 30);
    }
    $c($enemy, $hero, $tome): this {
      this.$cv_enemy = $enemy; this.$cv_hero = $hero; this.$cv_tome = $tome;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.HolyLance$1', ['com.watabou.utils.Callback']);
}

let $HolyLance$2: any = null;
/** An anonymous class (HolyLance.java:142). */
function HolyLance$2(): any {
  return $HolyLance$2 ??= $J.local(class extends JObject {
    call(): void {
      Splash.at$int$int$int(this.$cv_target, -1, 10);
      Dungeon.level.pressCell$int(this.$cv_aim.collisionPos);
      this.$cv_hero.spendAndNext(1);
      this.$outer.onSpellCast(this.$cv_tome, this.$cv_hero);
      Buff.affect$Char$Class$float(this.$cv_hero, $J.cls(HolyLance$LanceCooldown), 30);
    }
    $c($target, $aim, $hero, $tome): this {
      this.$cv_target = $target; this.$cv_aim = $aim; this.$cv_hero = $hero; this.$cv_tome = $tome;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.HolyLance$2', ['com.watabou.utils.Callback']);
}

$J.define(HolyLance, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.HolyLance', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.TargetedClericSpell', ctors: { '': '_HolyLance' }, clinit: true, lazy: ['INSTANCE'] });
$J.define(HolyLance$HolyLanceVFX, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.HolyLance$HolyLanceVFX', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { '': '_HolyLance$HolyLanceVFX' } });
$J.define(HolyLance$LanceCooldown, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.HolyLance$LanceCooldown', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_HolyLance$LanceCooldown' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  GuidingLight$Illuminated = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.GuidingLight$Illuminated');
  Splash = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Splash');
  SparkParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.SparkParticle');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  MissileSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.MissileSprite');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  QuickSlotButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.QuickSlotButton');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Emitter = $J.load('com.watabou.noosa.particles.Emitter');
  Random = $J.load('com.watabou.utils.Random');
});
