// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/armor/curses/Multiplicity.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../../jre/index.ts';
import { Armor$Glyph } from '../Armor.ts';

let Dungeon, Actor, Char, Char$Property, PinCushion, Hero, Ratmogrify$TransmogRat, DwarfKing$KingDamager, Ghoul$GhoulLifeLink, Mimic, Mob, Statue, Thief, MirrorImage, NPC, ScrollOfTeleportation, GameScene, ItemSprite$Glowing, Bundle, PathFinder, Random, Reflection;

export class Multiplicity extends Armor$Glyph {
  static BLACK: ItemSprite$Glowing = null;
  _Multiplicity(): this {
    this._Armor$Glyph();
    return this;
  }
  proc(armor: Armor, attacker: Char, defender: Char, damage: number): number {
    let procChance = Math.fround(Math.fround(1 / 20) * this.procChanceMultiplier(defender));
    if (Random.Float$() < procChance) {
      let spawnPoints = new ArrayList();
      for (let i = 0; i < PathFinder.NEIGHBOURS8.length; i++) {
        let p = (defender.pos + PathFinder.NEIGHBOURS8[i]) | 0;
        if (Actor.findChar(p) == null && (Dungeon.level.passable[p] || Dungeon.level.avoid[p])) {
          spawnPoints.add(p);
        }
      }
      if (spawnPoints.size() > 0) {
        let m = null;
        if (Random.Int$int(2) === 0 && defender instanceof Hero) {
          m = new MirrorImage()._MirrorImage();
          (m).duplicate(defender);
        } else {
          let toDuplicate = attacker;
          if (toDuplicate instanceof Ratmogrify$TransmogRat) {
            toDuplicate = (attacker).getOriginal();
          }
          if (!(toDuplicate instanceof Mob) || toDuplicate.properties().contains(Char$Property.BOSS) || toDuplicate.properties().contains(Char$Property.MINIBOSS) || toDuplicate instanceof Mimic || toDuplicate instanceof Statue || toDuplicate instanceof NPC) {
            m = Dungeon.level.createMob();
          } else {
            m = Multiplicity.duplicate(toDuplicate);
          }
        }
        if (m != null) {
          if (Char.hasProp(m, Char$Property.LARGE)) {
            for (let i of $J.toArrayInto(spawnPoints.toArray(), $J.newArray(0, null))) {
              if (!Dungeon.level.openSpace[i]) {
                spawnPoints.remove(i);
              }
            }
          }
          if (!spawnPoints.isEmpty()) {
            m.pos = Random.element$Collection(spawnPoints);
            GameScene.add$Mob(m);
            ScrollOfTeleportation.appear(m, m.pos);
          }
        }
      }
    }
    return damage;
  }
  static duplicate(toDuplicate: Mob): Mob {
    if (toDuplicate instanceof Ratmogrify$TransmogRat) {
      toDuplicate = (toDuplicate).getOriginal();
    }
    Actor.fixTime();
    let m = Reflection.newInstance(toDuplicate.getClass());
    if (m != null) {
      let store = new Bundle()._Bundle$();
      toDuplicate.storeInBundle(store);
      m.restoreFromBundle(store);
      m.pos = 0;
      m.HP = m.HT;
      m.remove$Class($J.cls(PinCushion));
      m.remove$Class($J.cls(DwarfKing$KingDamager));
      m.remove$Class($J.cls(Ghoul$GhoulLifeLink));
      if (m instanceof Thief) {
        (m).item_ = null;
      }
    }
    return m;
  }
  glowing(): ItemSprite$Glowing {
    return Multiplicity.BLACK;
  }
  curse(): boolean {
    return true;
  }
  static $clinit() {
    Multiplicity.BLACK = new ItemSprite$Glowing()._ItemSprite$Glowing$int(0);
  }
}

$J.define(Multiplicity, 'com.shatteredpixel.shatteredpixeldungeon.items.armor.curses.Multiplicity', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor$Glyph', ctors: { '': '_Multiplicity' }, clinit: true, lazy: ['BLACK'] });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  PinCushion = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.PinCushion');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  Ratmogrify$TransmogRat = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.Ratmogrify$TransmogRat');
  DwarfKing$KingDamager = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DwarfKing$KingDamager');
  Ghoul$GhoulLifeLink = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Ghoul$GhoulLifeLink');
  Mimic = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mimic');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  Statue = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Statue');
  Thief = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Thief');
  MirrorImage = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.MirrorImage');
  NPC = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.NPC');
  ScrollOfTeleportation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTeleportation');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  Bundle = $J.load('com.watabou.utils.Bundle');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
