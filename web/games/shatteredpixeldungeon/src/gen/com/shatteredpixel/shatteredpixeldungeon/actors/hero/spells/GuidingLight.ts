// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/GuidingLight.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { FlavourBuff } from '../../buffs/FlavourBuff.ts';
import { Buff } from '../../buffs/Buff.ts';

let Assets$Sounds, Dungeon, Actor, Buff$buffType, Hero, HeroClass, HeroSubClass, MagicMissile, Wand, Ballistica, Messages, CharSprite$State, ActionIndicator, BuffIndicator, HeroIcon, QuickSlotButton, GLog, Sample, Random;

export class GuidingLight extends TargetedClericSpell {
  static INSTANCE: GuidingLight = null;
  _GuidingLight(): this {
    this._TargetedClericSpell();
    return this;
  }
  icon(): number {
    return HeroIcon.GUIDING_LIGHT;
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
    hero.busy();
    Sample.INSTANCE.play$Object(Assets$Sounds.ZAP);
    hero.sprite_.zap$int(target);
    MagicMissile.boltFromChar(hero.sprite_.parent, MagicMissile.LIGHT_MISSILE, hero.sprite_, aim.collisionPos, new (GuidingLight$1())().$o(this).$c(aim, hero, tome));
  }
  chargeUse(hero: Hero): number {
    if (hero.subClass === HeroSubClass.PRIEST && hero.buff($J.cls(GuidingLight$GuidingLightPriestCooldown)) == null) {
      return 0;
    } else {
      return 1;
    }
  }
  desc(): string {
    let desc = Messages.get$Object$String$ObjectArr(this, 'desc', []);
    if (Dungeon.hero.subClass === HeroSubClass.PRIEST) {
      desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_priest', []);
    }
    return desc + '\n\n' + Messages.get$Object$String$ObjectArr(this, 'charge_cost', [$J.d2i(this.chargeUse(Dungeon.hero))]);
  }
  static $clinit() {
    GuidingLight.INSTANCE = new GuidingLight()._GuidingLight();
  }
}

export class GuidingLight$GuidingLightPriestCooldown extends FlavourBuff {
  _GuidingLight$GuidingLightPriestCooldown(): this {
    this._FlavourBuff();
    return this;
  }
  icon(): number {
    return BuffIndicator.ILLUMINATED;
  }
  tintIcon(icon: Image): void {
    icon.brightness(0.5);
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround(this.visualcooldown() / 50));
  }
  detach(): void {
    super.detach();
    ActionIndicator.refresh();
  }
}

export class GuidingLight$Illuminated extends Buff {
  _GuidingLight$Illuminated(): this {
    this._Buff();
    this.type_ = Buff$buffType.NEGATIVE;
    return this;
  }
  icon(): number {
    return BuffIndicator.ILLUMINATED;
  }
  fx(on: boolean): void {
    if (on) {
      this.target.sprite_.add(CharSprite$State.ILLUMINATED);
    } else {
      this.target.sprite_.remove$State(CharSprite$State.ILLUMINATED);
    }
  }
  desc(): string {
    let desc = super.desc();
    if (Dungeon.hero.subClass === HeroSubClass.PRIEST) {
      desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_priest', []);
    } else if (Dungeon.hero.heroClass !== HeroClass.CLERIC) {
      desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_generic', []);
    }
    return desc;
  }
}

export class GuidingLight$WasIlluminatedTracker extends Buff {
  _GuidingLight$WasIlluminatedTracker(): this {
    this._Buff();
    return this;
  }
}

let $GuidingLight$1: any = null;
/** An anonymous class (GuidingLight.java:80). */
function GuidingLight$1(): any {
  return $GuidingLight$1 ??= $J.local(class extends JObject {
    call(): void {
      let ch = Actor.findChar(this.$cv_aim.collisionPos);
      if (ch != null) {
        ch.damage(Hero.heroDamageIntRange(2, 8), this.$outer);
        Sample.INSTANCE.play$Object$float$float(Assets$Sounds.HIT_MAGIC, 1, Random.Float$float$float(Math.fround(0.87), Math.fround(1.15)));
        ch.sprite_.burst(-188, 3);
        if (ch.isAlive()) {
          Buff.affect$Char$Class(ch, $J.cls(GuidingLight$Illuminated));
          Buff.affect$Char$Class(ch, $J.cls(GuidingLight$WasIlluminatedTracker));
        }
      } else {
        Dungeon.level.pressCell$int(this.$cv_aim.collisionPos);
      }
      this.$cv_hero.spend(1);
      this.$cv_hero.next();
      this.$outer.onSpellCast(this.$cv_tome, this.$cv_hero);
      if (this.$cv_hero.subClass === HeroSubClass.PRIEST && this.$cv_hero.buff($J.cls(GuidingLight$GuidingLightPriestCooldown)) == null) {
        Buff.prolong(this.$cv_hero, $J.cls(GuidingLight$GuidingLightPriestCooldown), 50);
        ActionIndicator.refresh();
      }
    }
    $c($aim, $hero, $tome): this {
      this.$cv_aim = $aim; this.$cv_hero = $hero; this.$cv_tome = $tome;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.GuidingLight$1', ['com.watabou.utils.Callback']);
}

$J.define(GuidingLight, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.GuidingLight', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.TargetedClericSpell', ctors: { '': '_GuidingLight' }, clinit: true, lazy: ['INSTANCE'] });
$J.define(GuidingLight$GuidingLightPriestCooldown, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.GuidingLight$GuidingLightPriestCooldown', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_GuidingLight$GuidingLightPriestCooldown' } });
$J.define(GuidingLight$Illuminated, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.GuidingLight$Illuminated', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_GuidingLight$Illuminated' } });
$J.define(GuidingLight$WasIlluminatedTracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.GuidingLight$WasIlluminatedTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_GuidingLight$WasIlluminatedTracker' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  HeroClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  MagicMissile = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CharSprite$State = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite$State');
  ActionIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ActionIndicator');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  QuickSlotButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.QuickSlotButton');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Random = $J.load('com.watabou.utils.Random');
});
