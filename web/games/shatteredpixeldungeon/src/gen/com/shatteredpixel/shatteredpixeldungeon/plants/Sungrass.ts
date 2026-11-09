// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/plants/Sungrass.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../jre/index.ts';
import { Plant } from './Plant.ts';
import { Plant$Seed } from './Plant.ts';
import { Buff } from '../actors/buffs/Buff.ts';

let Dungeon, Buff$buffType, Healing, Hero, HeroSubClass, CellEmitter, FloatingText, ShaftParticle, Messages, CharSprite, ItemSpriteSheet, BuffIndicator;

export class Sungrass extends Plant {
  _Sungrass(): this {
    this._Plant();
    this.image_ = 3;
    this.seedClass = $J.cls(Sungrass$Seed);
    return this;
  }
  activate(ch: Char): void {
    if (ch != null) {
      if (ch instanceof Hero && (ch).subClass === HeroSubClass.WARDEN) {
        Buff.affect$Char$Class(ch, $J.cls(Healing)).setHeal$int$float$int(ch.HT, 0, 1);
      } else {
        Buff.affect$Char$Class(ch, $J.cls(Sungrass$Health)).boost(ch.HT);
      }
    }
    if (Dungeon.level.heroFOV[this.pos]) {
      CellEmitter.get(this.pos).start(ShaftParticle.FACTORY, Math.fround(0.2), 3);
    }
  }
}

export class Sungrass$Seed extends Plant$Seed {
  _Sungrass$Seed(): this {
    this._Plant$Seed();
    this.image_ = ItemSpriteSheet.SEED_SUNGRASS;
    this.plantClass = $J.cls(Sungrass);
    this.bones = true;
    return this;
  }
}

export class Sungrass$Health extends Buff {
  static readonly STEP: number = 1;
  pos: number = 0;
  partialHeal: number = 0;
  level_: number = 0;
  static readonly POS: string = 'pos';
  static readonly PARTIAL: string = 'partial_heal';
  static readonly LEVEL: string = 'level';
  _Sungrass$Health(): this {
    this._Buff();
    this.type_ = Buff$buffType.POSITIVE;
    this.announced = true;
    return this;
  }
  act(): boolean {
    if (this.target.pos !== this.pos) {
      this.detach();
    }
    this.partialHeal = Math.fround(this.partialHeal + Math.fround(((40 + this.target.HT) | 0) / 150));
    if (this.partialHeal > Math.fround(1)) {
      let healThisTurn = $J.d2i(this.partialHeal);
      this.partialHeal = Math.fround(this.partialHeal - healThisTurn);
      this.level_ = (this.level_ - healThisTurn) | 0;
      if (this.target.HP < this.target.HT) {
        this.target.HP = (this.target.HP + healThisTurn) | 0;
        this.target.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(healThisTurn), FloatingText.HEALING, []);
        if (this.target.HP >= this.target.HT) {
          this.target.HP = this.target.HT;
          if (this.target instanceof Hero) {
            (this.target).resting = false;
          }
        }
      }
    }
    if (this.level_ <= 0) {
      this.detach();
      if (this.target instanceof Hero) {
        (this.target).resting = false;
      }
    }
    this.spend(Sungrass$Health.STEP);
    return true;
  }
  boost(amount: number): void {
    if (this.target != null) {
      this.level_ = (this.level_ + amount) | 0;
      this.pos = this.target.pos;
    }
  }
  icon(): number {
    return BuffIndicator.HERB_HEALING;
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround(((this.target.HT - this.level_) | 0) / Math.fround(this.target.HT)));
  }
  iconTextDisplay(): string {
    return String(this.level_);
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [this.level_]);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(Sungrass$Health.POS, this.pos);
    bundle.put$String$float(Sungrass$Health.PARTIAL, this.partialHeal);
    bundle.put$String$int(Sungrass$Health.LEVEL, this.level_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.pos = bundle.getInt(Sungrass$Health.POS);
    this.partialHeal = bundle.getFloat(Sungrass$Health.PARTIAL);
    this.level_ = bundle.getInt(Sungrass$Health.LEVEL);
  }
}

$J.define(Sungrass, 'com.shatteredpixel.shatteredpixeldungeon.plants.Sungrass', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.plants.Plant', ctors: { '': '_Sungrass' } });
$J.define(Sungrass$Seed, 'com.shatteredpixel.shatteredpixeldungeon.plants.Sungrass$Seed', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.plants.Plant$Seed', ctors: { '': '_Sungrass$Seed' } });
$J.define(Sungrass$Health, 'com.shatteredpixel.shatteredpixeldungeon.plants.Sungrass$Health', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Sungrass$Health' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Healing = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Healing');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  ShaftParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShaftParticle');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
});
