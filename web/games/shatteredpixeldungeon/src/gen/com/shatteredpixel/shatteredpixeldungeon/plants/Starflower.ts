// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/plants/Starflower.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Bless, Buff, Recharging, Hero, HeroSubClass, Flare, SpellSprite, ItemSpriteSheet;

export class Starflower extends Plant {
  _Starflower(): this {
    this._Plant();
    this.image_ = 9;
    this.seedClass = $J.cls(Starflower$Seed);
    return this;
  }
  activate(ch: Char): void {
    if (ch != null) {
      Buff.prolong(ch, $J.cls(Bless), Bless.DURATION);
      if (Dungeon.level.heroFOV[ch.pos]) {
        new Flare()._Flare(6, 32).color$int$boolean(16776960, true).show$Visual$float(ch.sprite_, 2);
      }
      if (ch instanceof Hero && (ch).subClass === HeroSubClass.WARDEN) {
        Buff.prolong(ch, $J.cls(Recharging), Recharging.DURATION);
        SpellSprite.show$Char$int(ch, SpellSprite.CHARGE);
      }
    }
  }
}

export class Starflower$Seed extends Plant$Seed {
  _Starflower$Seed(): this {
    this._Plant$Seed();
    this.image_ = ItemSpriteSheet.SEED_STARFLOWER;
    this.plantClass = $J.cls(Starflower);
    return this;
  }
  value(): number {
    return Math.imul(30, this.quantity);
  }
  energyVal(): number {
    return Math.imul(3, this.quantity);
  }
}

$J.define(Starflower, 'com.shatteredpixel.shatteredpixeldungeon.plants.Starflower', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.plants.Plant', ctors: { '': '_Starflower' } });
$J.define(Starflower$Seed, 'com.shatteredpixel.shatteredpixeldungeon.plants.Starflower$Seed', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.plants.Plant$Seed', ctors: { '': '_Starflower$Seed' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Bless = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Bless');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Recharging = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Recharging');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  Flare = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Flare');
  SpellSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.SpellSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
