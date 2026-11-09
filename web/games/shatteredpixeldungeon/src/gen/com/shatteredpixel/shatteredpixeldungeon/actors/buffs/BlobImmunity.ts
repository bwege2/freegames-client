// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/BlobImmunity.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../jre/index.ts';
import { FlavourBuff } from './FlavourBuff.ts';

let Blizzard, ConfusionGas, CorrosiveGas, Electricity, Fire, Freezing, Inferno, ParalyticGas, Regrowth, SmokeScreen, StenchGas, StormCloud, ToxicGas, VaultFlameTraps, Web, Buff$buffType, Tengu$FireAbility$FireBlob, MagicalFireRoom$EternalFire, BuffIndicator;

export class BlobImmunity extends FlavourBuff {
  static readonly DURATION: number = 20;
  _BlobImmunity(): this {
    this._FlavourBuff();
    this.type_ = Buff$buffType.POSITIVE;
    this.immunities_.add($J.cls(Blizzard));
    this.immunities_.add($J.cls(ConfusionGas));
    this.immunities_.add($J.cls(CorrosiveGas));
    this.immunities_.add($J.cls(Electricity));
    this.immunities_.add($J.cls(Fire));
    this.immunities_.add($J.cls(MagicalFireRoom$EternalFire));
    this.immunities_.add($J.cls(Freezing));
    this.immunities_.add($J.cls(Inferno));
    this.immunities_.add($J.cls(ParalyticGas));
    this.immunities_.add($J.cls(Regrowth));
    this.immunities_.add($J.cls(SmokeScreen));
    this.immunities_.add($J.cls(StenchGas));
    this.immunities_.add($J.cls(StormCloud));
    this.immunities_.add($J.cls(ToxicGas));
    this.immunities_.add($J.cls(Web));
    this.immunities_.add($J.cls(Tengu$FireAbility$FireBlob));
    this.immunities_.add($J.cls(VaultFlameTraps));
    return this;
  }
  icon(): number {
    return BuffIndicator.IMMUNITY;
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(BlobImmunity.DURATION - this.visualcooldown())) / BlobImmunity.DURATION));
  }
}

$J.define(BlobImmunity, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.BlobImmunity', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_BlobImmunity' } });
$J.module(() => {
  Blizzard = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blizzard');
  ConfusionGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.ConfusionGas');
  CorrosiveGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.CorrosiveGas');
  Electricity = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Electricity');
  Fire = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Fire');
  Freezing = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Freezing');
  Inferno = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Inferno');
  ParalyticGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.ParalyticGas');
  Regrowth = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Regrowth');
  SmokeScreen = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.SmokeScreen');
  StenchGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.StenchGas');
  StormCloud = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.StormCloud');
  ToxicGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.ToxicGas');
  VaultFlameTraps = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.VaultFlameTraps');
  Web = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Web');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Tengu$FireAbility$FireBlob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Tengu$FireAbility$FireBlob');
  MagicalFireRoom$EternalFire = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.MagicalFireRoom$EternalFire');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
});
