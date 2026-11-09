// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/plants/Fadeleaf.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Char$Property, Buff, Hero, HeroSubClass, Mob, CellEmitter, Speck, ScrollOfTeleportation, Level, Trap$HazardAssistTracker, InterlevelScene, InterlevelScene$Mode, ItemSpriteSheet, Game;

export class Fadeleaf extends Plant {
  _Fadeleaf(): this {
    this._Plant();
    this.image_ = 10;
    this.seedClass = $J.cls(Fadeleaf$Seed);
    return this;
  }
  activate(ch: Char): void {
    if (ch instanceof Hero) {
      (ch).curAction = null;
      if ((ch).subClass === HeroSubClass.WARDEN && Dungeon.interfloorTeleportAllowed()) {
        Level.beforeTransition();
        InterlevelScene.mode = InterlevelScene$Mode.RETURN;
        InterlevelScene.returnDepth = Math.max(1, ((Dungeon.depth - 1) | 0));
        InterlevelScene.returnBranch = 0;
        InterlevelScene.returnPos = -2;
        Game.switchScene$Class($J.cls(InterlevelScene));
      } else {
        ScrollOfTeleportation.teleportChar$Char$Class(ch, $J.cls(Fadeleaf));
      }
    } else if (ch instanceof Mob && !ch.properties().contains(Char$Property.IMMOVABLE)) {
      Buff.prolong(ch, $J.cls(Trap$HazardAssistTracker), Trap$HazardAssistTracker.DURATION);
      ScrollOfTeleportation.teleportChar$Char$Class(ch, $J.cls(Fadeleaf));
    }
    if (Dungeon.level.heroFOV[this.pos]) {
      CellEmitter.get(this.pos).start(Speck.factory$int(Speck.LIGHT), Math.fround(0.2), 3);
    }
  }
}

export class Fadeleaf$Seed extends Plant$Seed {
  _Fadeleaf$Seed(): this {
    this._Plant$Seed();
    this.image_ = ItemSpriteSheet.SEED_FADELEAF;
    this.plantClass = $J.cls(Fadeleaf);
    return this;
  }
}

$J.define(Fadeleaf, 'com.shatteredpixel.shatteredpixeldungeon.plants.Fadeleaf', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.plants.Plant', ctors: { '': '_Fadeleaf' } });
$J.define(Fadeleaf$Seed, 'com.shatteredpixel.shatteredpixeldungeon.plants.Fadeleaf$Seed', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.plants.Plant$Seed', ctors: { '': '_Fadeleaf$Seed' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  ScrollOfTeleportation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTeleportation');
  Level = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level');
  Trap$HazardAssistTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap$HazardAssistTracker');
  InterlevelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene');
  InterlevelScene$Mode = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene$Mode');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Game = $J.load('com.watabou.noosa.Game');
});
