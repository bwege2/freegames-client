// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/Bones.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, IOException, JObject, JString } from '../../../../jre/index.ts';

let Dungeon, Statistics, HeroClass, Generator, Gold, Artifact, RemainsItem, MissileWeapon, Game, Bundle, FileUtils, Random, Reflection;

export class Bones extends JObject {
  static readonly BONES_FILE: string = 'bones.dat';
  static readonly LEVEL: string = 'level';
  static readonly BRANCH: string = 'branch';
  static readonly ITEM: string = 'item';
  static readonly HERO_CLASS: string = 'hero_class';
  static depth: number = 0;
  static branch: number = 0;
  static item: Item = null;
  static heroClass: HeroClass = null;
  _Bones(): this {
    return this;
  }
  static leave(): void {
    Bones.depth = Math.max(Dungeon.depth, (Statistics.deepestFloor - 5) | 0);
    Bones.branch = Dungeon.branch;
    if (Dungeon.daily) {
      Bones.depth = Bones.branch = -1;
      return;
    }
    Bones.item = Bones.pickItem(Dungeon.hero);
    Bones.heroClass = Dungeon.hero.heroClass;
    let bundle = new Bundle()._Bundle$();
    bundle.put$String$int(Bones.LEVEL, Bones.depth);
    bundle.put$String$int(Bones.BRANCH, Bones.branch);
    bundle.put$String$Bundlable(Bones.ITEM, Bones.item);
    bundle.put$String$Enum(Bones.HERO_CLASS, Bones.heroClass);
    try {
      FileUtils.bundleToFile(Bones.BONES_FILE, bundle);
    } catch ($e0) {
      if ($J.isa($e0, IOException)) {
        let e = $J.exc($e0);
        Game.reportException(e);
      } else {
        throw $e0;
      }
    }
  }
  static pickItem(hero: Hero): Item {
    let item = null;
    if (!(Dungeon.customSeedText.length === 0)) {
      return null;
    }
    if (Random.Int$int(3) !== 0) {
      switch (Random.Int$int(7)) {
        case 0:
          item = hero.belongings.weapon_;
          if (hero.belongings.secondWep_ != null && (item == null || hero.belongings.secondWep_.trueLevel() > item.trueLevel())) {
            item = hero.belongings.secondWep_;
            break;
          }
          break;
        case 1:
          item = hero.belongings.armor_;
          break;
        case 2:
          item = hero.belongings.artifact_;
          break;
        case 3:
          item = hero.belongings.misc_;
          break;
        case 4:
          item = hero.belongings.ring_;
          break;
        case 5:
        case 6:
          item = Dungeon.quickslot.randomNonePlaceholder();
          break;
      }
      if (item == null || !item.bones) {
        return Bones.pickItem(hero);
      }
    } else {
      let iterator = hero.belongings.backpack.iterator();
      let curItem: Item;
      let items = new ArrayList();
      while (iterator.hasNext()) {
        curItem = iterator.next();
        if (curItem.bones) {
          items.add(curItem);
        }
      }
      if (Random.Int$int(3) < items.size()) {
        item = Random.element$Collection(items);
        if (item.stackable) {
          item.quantity$int(Random.NormalIntRange(1, $J.idiv(((item.quantity$() + 1) | 0), 2)));
          if (item.quantity$() > 3) {
            item.quantity$int(3);
          }
        }
      } else {
        item = null;
      }
    }
    return item;
  }
  static get(): ArrayList<Item> {
    if (Dungeon.daily) {
      return null;
    }
    if (Bones.depth === -1) {
      try {
        let bundle = FileUtils.bundleFromFile(Bones.BONES_FILE);
        Bones.depth = bundle.getInt(Bones.LEVEL);
        Bones.branch = bundle.getInt(Bones.BRANCH);
        if (Bones.depth > 0) {
          if (bundle.contains(Bones.ITEM)) {
            Bones.item = bundle.get$String(Bones.ITEM);
          } else {
            Bones.item = null;
          }
          if (bundle.contains(Bones.HERO_CLASS)) {
            Bones.heroClass = bundle.getEnum(Bones.HERO_CLASS, $J.cls(HeroClass));
          } else {
            Bones.heroClass = null;
          }
        }
        return Bones.get();
      } catch ($e1) {
        if ($J.isa($e1, IOException)) {
          let e = $J.exc($e1);
          return null;
        } else {
          throw $e1;
        }
      }
    } else {
      if (Bones.lootAtCurLevel()) {
        let emptyBones = new Bundle()._Bundle$();
        emptyBones.put$String$int(Bones.LEVEL, 0);
        try {
          FileUtils.bundleToFile(Bones.BONES_FILE, emptyBones);
        } catch ($e2) {
          if ($J.isa($e2, IOException)) {
            let e = $J.exc($e2);
            Game.reportException(e);
          } else {
            throw $e2;
          }
        }
        Bones.depth = 0;
        if (Dungeon.challenges !== 0 || !(Dungeon.customSeedText.length === 0)) {
          Bones.item = null;
        }
        if (Bones.item instanceof Artifact) {
          if (Generator.removeArtifact((Bones.item).getClass())) {
            let artifact = Reflection.newInstance((Bones.item).getClass());
            if (artifact != null) {
              artifact.cursed = true;
              artifact.cursedKnown = true;
            }
            Bones.item = artifact;
          } else {
            Bones.item = new Gold()._Gold$int(Bones.item.value());
          }
        }
        if (Bones.item != null) {
          if (Bones.item.isUpgradable() && !(Bones.item instanceof MissileWeapon)) {
            Bones.item.cursed = true;
            Bones.item.cursedKnown = true;
          }
          if (Bones.item.isUpgradable()) {
            if (Bones.item.level$() > 3) {
              Bones.item.degrade$int((Bones.item.level$() - 3) | 0);
            }
            Bones.item.levelKnown = Bones.item instanceof MissileWeapon;
          }
          Bones.item.reset();
        }
        let result = new ArrayList();
        if (Bones.heroClass != null) {
          result.add(RemainsItem.get(Bones.heroClass));
          if (Dungeon.bossLevel$()) {
            Statistics.qualifiedForBossRemainsBadge = true;
          }
        }
        if (Bones.item != null) {
          result.add(Bones.item);
        }
        return result.isEmpty() ? null : result;
      } else {
        return null;
      }
    }
  }
  static lootAtCurLevel(): boolean {
    if (Bones.branch === Dungeon.branch) {
      if (Bones.branch === 0) {
        return Bones.depth === Dungeon.depth;
      } else if (Bones.branch === 1) {
        return $J.idiv(Bones.depth, 5) === $J.idiv(Dungeon.depth, 5);
      }
    }
    return false;
  }
  static $clinit() {
    Bones.depth = -1;
    Bones.branch = -1;
  }
}

$J.define(Bones, 'com.shatteredpixel.shatteredpixeldungeon.Bones', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Bones' }, clinit: true, lazy: ['depth', 'branch', 'item', 'heroClass'] });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  HeroClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Gold = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Gold');
  Artifact = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact');
  RemainsItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.remains.RemainsItem');
  MissileWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon');
  Game = $J.load('com.watabou.noosa.Game');
  Bundle = $J.load('com.watabou.utils.Bundle');
  FileUtils = $J.load('com.watabou.utils.FileUtils');
  Random = $J.load('com.watabou.utils.Random');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
