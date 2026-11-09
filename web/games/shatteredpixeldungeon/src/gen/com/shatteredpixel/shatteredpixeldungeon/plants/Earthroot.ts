// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/plants/Earthroot.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Barkskin, Buff$buffType, Hero, HeroSubClass, CellEmitter, EarthParticle, Messages, PixelScene, ItemSpriteSheet, BuffIndicator;

export class Earthroot extends Plant {
  _Earthroot(): this {
    this._Plant();
    this.image_ = 8;
    this.seedClass = $J.cls(Earthroot$Seed);
    return this;
  }
  activate(ch: Char): void {
    if (ch != null) {
      if (ch instanceof Hero && (ch).subClass === HeroSubClass.WARDEN) {
        Barkskin.conditionallyAppend(Dungeon.hero, (Dungeon.hero.lvl + 5) | 0, 5);
      } else {
        Buff.affect$Char$Class(ch, $J.cls(Earthroot$Armor)).level(ch.HT);
      }
    }
    if (Dungeon.level.heroFOV[this.pos]) {
      CellEmitter.bottom(this.pos).start(EarthParticle.FACTORY, Math.fround(0.05), 8);
      PixelScene.shake(1, Math.fround(0.4));
    }
  }
}

export class Earthroot$Seed extends Plant$Seed {
  _Earthroot$Seed(): this {
    this._Plant$Seed();
    this.image_ = ItemSpriteSheet.SEED_EARTHROOT;
    this.plantClass = $J.cls(Earthroot);
    this.bones = true;
    return this;
  }
}

export class Earthroot$Armor extends Buff {
  static readonly STEP: number = 1;
  pos: number = 0;
  level_: number = 0;
  static readonly POS: string = 'pos';
  static readonly LEVEL: string = 'level';
  _Earthroot$Armor(): this {
    this._Buff();
    this.type_ = Buff$buffType.POSITIVE;
    this.announced = true;
    return this;
  }
  act(): boolean {
    if (this.target.pos !== this.pos) {
      this.detach();
    }
    this.spend(Earthroot$Armor.STEP);
    return true;
  }
  static blocking(): number {
    return $J.idiv(((Dungeon.scalingDepth() + 5) | 0), 2);
  }
  absorb(damage: number): number {
    if (this.pos !== this.target.pos) {
      this.detach();
      return damage;
    }
    let block = Math.min(damage, Earthroot$Armor.blocking());
    if (this.level_ <= block) {
      this.detach();
      return (damage - block) | 0;
    } else {
      this.level_ = (this.level_ - block) | 0;
      return (damage - block) | 0;
    }
  }
  level(value: number): void {
    if (this.target != null) {
      if (this.level_ < value) {
        this.level_ = value;
      }
      this.pos = this.target.pos;
    }
  }
  icon(): number {
    return BuffIndicator.ARMOR;
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround(((this.target.HT - this.level_) | 0) / Math.fround(this.target.HT)));
  }
  iconTextDisplay(): string {
    return String(this.level_);
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [Earthroot$Armor.blocking(), this.level_]);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(Earthroot$Armor.POS, this.pos);
    bundle.put$String$int(Earthroot$Armor.LEVEL, this.level_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.pos = bundle.getInt(Earthroot$Armor.POS);
    this.level_ = bundle.getInt(Earthroot$Armor.LEVEL);
  }
}

$J.define(Earthroot, 'com.shatteredpixel.shatteredpixeldungeon.plants.Earthroot', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.plants.Plant', ctors: { '': '_Earthroot' } });
$J.define(Earthroot$Seed, 'com.shatteredpixel.shatteredpixeldungeon.plants.Earthroot$Seed', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.plants.Plant$Seed', ctors: { '': '_Earthroot$Seed' } });
$J.define(Earthroot$Armor, 'com.shatteredpixel.shatteredpixeldungeon.plants.Earthroot$Armor', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Earthroot$Armor' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Barkskin = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Barkskin');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  EarthParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.EarthParticle');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
});
