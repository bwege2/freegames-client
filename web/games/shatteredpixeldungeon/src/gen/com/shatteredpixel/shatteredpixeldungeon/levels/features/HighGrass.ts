// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/features/HighGrass.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Actor, Barkskin, Buff, Hero, HeroClass, Talent, Talent$NatureBerriesDropped, Blacksmith$Quest, CellEmitter, LeafParticle, Dewdrop, Generator, Generator$Category, Camouflage, SandalsOfNature$Naturalism, Berry, PetrifiedSeed, Level, Level$Feeling, MiningLevel, Terrain, VaultLevel, GameScene, Game, Random;

export class HighGrass extends JObject {
  static freezeTrample: boolean = false;
  _HighGrass(): this {
    return this;
  }
  static trample(level: Level, pos: number): void {
    if (HighGrass.freezeTrample) {
      return;
    }
    let ch = Actor.findChar(pos);
    if (level.map_[pos] === Terrain.FURROWED_GRASS) {
      if (ch instanceof Hero && (ch).heroClass === HeroClass.HUNTRESS) {
        HighGrass.freezeTrample = true;
      } else {
        Level.set$int$int(pos, Terrain.GRASS);
      }
    } else {
      if (ch instanceof Hero && (ch).heroClass === HeroClass.HUNTRESS) {
        if ((ch).hasTalent(Talent.BARKSKIN)) {
          Barkskin.conditionallyAppend(ch, $J.idiv((Math.imul((ch).lvl, (ch).pointsInTalent(Talent.BARKSKIN))), 3), 1);
        }
        Level.set$int$int(pos, Terrain.FURROWED_GRASS);
        HighGrass.freezeTrample = true;
      } else {
        Level.set$int$int(pos, Terrain.GRASS);
      }
      let naturalismLevel = 0;
      if (ch != null) {
        let naturalism = ch.buff($J.cls(SandalsOfNature$Naturalism));
        if (naturalism != null) {
          if (!naturalism.isCursed()) {
            naturalismLevel = (naturalism.itemLevel() + 1) | 0;
            naturalism.charge$();
          } else {
            naturalismLevel = -1;
          }
        }
        if (ch instanceof Hero && (ch).hasTalent(Talent.NATURES_BOUNTY)) {
          let berriesAvailable = (2 + Math.imul(2, (ch).pointsInTalent(Talent.NATURES_BOUNTY))) | 0;
          let dropped = Buff.affect$Char$Class(ch, $J.cls(Talent$NatureBerriesDropped));
          berriesAvailable = $J.d2i(Math.fround(berriesAvailable - dropped.count()));
          if (berriesAvailable > 0) {
            let targetFloor = (2 + Math.imul(2, (ch).pointsInTalent(Talent.NATURES_BOUNTY))) | 0;
            targetFloor = (targetFloor - berriesAvailable) | 0;
            targetFloor = (targetFloor + ((targetFloor >= 5) ? 3 : 2)) | 0;
            let droppingBerry = false;
            if (Dungeon.depth > targetFloor) {
              droppingBerry = Random.Int$int(10) === 0;
            } else if (Dungeon.depth === targetFloor) {
              droppingBerry = Random.Int$int(30) === 0;
            } else if (Dungeon.depth < targetFloor) {
              droppingBerry = Random.Int$int(90) === 0;
            }
            if (droppingBerry) {
              dropped.countUp(1);
              level.drop(new Berry()._Berry(), pos).sprite_.drop$();
            }
          }
        }
      }
      if (Dungeon.level instanceof MiningLevel && Blacksmith$Quest.Type() === Blacksmith$Quest.FUNGI && Random.Int$int(3) !== 0) {
        naturalismLevel = -1;
      }
      if (naturalismLevel >= 0) {
        let lootChance = Math.fround(1 / (Math.fround(25 - Math.fround(naturalismLevel * 4))));
        lootChance = Math.fround(lootChance * PetrifiedSeed.grassLootMultiplier$());
        if (Dungeon.level instanceof VaultLevel) {
          lootChance = Math.fround(lootChance / 3);
        }
        if (Random.Float$() < lootChance) {
          if (Random.Float$() < PetrifiedSeed.stoneInsteadOfSeedChance$()) {
            level.drop(Generator.randomUsingDefaults$Category(Generator$Category.STONE), pos).sprite_.drop$();
          } else {
            level.drop(Generator.random$Category(Generator$Category.SEED), pos).sprite_.drop$();
          }
        }
        lootChance = Math.fround(1 / (Math.fround(6 - Math.fround(naturalismLevel / 2))));
        if (Dungeon.level != null && Dungeon.level.feeling === Level$Feeling.GRASS) {
          lootChance = Math.fround(lootChance / 2);
        }
        if (Random.Float$() < lootChance) {
          level.drop(new Dewdrop()._Dewdrop(), pos).sprite_.drop$();
        }
      }
      if (ch != null) {
        Camouflage.activate(ch, ch.glyphLevel($J.cls(Camouflage)));
      }
    }
    HighGrass.freezeTrample = false;
    if (Game.scene() instanceof GameScene) {
      GameScene.updateMap$int(pos);
      CellEmitter.get(pos).burst(LeafParticle.LEVEL_SPECIFIC, 4);
      if (Dungeon.level.heroFOV[pos]) {
        Dungeon.observe$();
      }
    }
  }
  static $clinit() {
    HighGrass.freezeTrample = false;
  }
}

$J.define(HighGrass, 'com.shatteredpixel.shatteredpixeldungeon.levels.features.HighGrass', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_HighGrass' }, clinit: true, lazy: ['freezeTrample'] });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Barkskin = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Barkskin');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  HeroClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Talent$NatureBerriesDropped = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$NatureBerriesDropped');
  Blacksmith$Quest = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Blacksmith$Quest');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  LeafParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.LeafParticle');
  Dewdrop = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Dewdrop');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  Camouflage = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Camouflage');
  SandalsOfNature$Naturalism = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.SandalsOfNature$Naturalism');
  Berry = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.Berry');
  PetrifiedSeed = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.PetrifiedSeed');
  Level = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level');
  Level$Feeling = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level$Feeling');
  MiningLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.MiningLevel');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  VaultLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.VaultLevel');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  Game = $J.load('com.watabou.noosa.Game');
  Random = $J.load('com.watabou.utils.Random');
});
