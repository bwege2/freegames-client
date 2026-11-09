// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/TormentedSpirit.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Wraith } from './Wraith.ts';

let Assets$Sounds, Dungeon, Speck, ShaftParticle, Generator, Messages, TormentedSpiritSprite, Sample, Random;

export class TormentedSpirit extends Wraith {
  _TormentedSpirit(): this {
    this._Wraith();
    this.spriteClass = $J.cls(TormentedSpiritSprite);
    return this;
  }
  damageRoll(): number {
    return Random.NormalIntRange((1 + $J.idiv($J.roundf(Math.fround(1.5 * this.level_)), 2)) | 0, (2 + $J.roundf(Math.fround(1.5 * this.level_))) | 0);
  }
  attackSkill(target: Char): number {
    return (10 + $J.roundf(Math.fround(1.5 * this.level_))) | 0;
  }
  cleanse(): void {
    Sample.INSTANCE.play$Object(Assets$Sounds.GHOST);
    this.yell(Messages.get$Object$String$ObjectArr(this, 'thank_you', []));
    let prize: Item;
    if (Random.Int$int(2) === 0) {
      prize = Generator.randomWeapon$boolean(true);
      (prize).enchant$();
    } else {
      prize = Generator.randomArmor$();
      (prize).inscribe$();
    }
    prize.cursed = false;
    prize.cursedKnown = true;
    if (prize.level$() === 0 && Random.Int$int(2) === 0) {
      prize.upgrade$();
    }
    Dungeon.level.drop(prize, this.pos).sprite_.drop$();
    this.destroy();
    this.sprite_.die();
    this.sprite_.tint$float$float$float$float(1, 1, 1, 1);
    this.sprite_.emitter().start(ShaftParticle.FACTORY, Math.fround(0.3), 4);
    this.sprite_.emitter().start(Speck.factory$int(Speck.LIGHT), Math.fround(0.2), 3);
  }
}

$J.define(TormentedSpirit, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.TormentedSpirit', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Wraith', ctors: { '': '_TormentedSpirit' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  ShaftParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShaftParticle');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  TormentedSpiritSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.TormentedSpiritSprite');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Random = $J.load('com.watabou.utils.Random');
});
