// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/blobs/WaterOfAwareness.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { WellWater } from './WellWater.ts';

let Assets$Sounds, Dungeon, Awareness, Buff, Identification, Speck, ScrollOfIdentify, Notes$Landmark, Terrain, Messages, GameScene, DungeonTilemap, GLog, Sample;

export class WaterOfAwareness extends WellWater {
  _WaterOfAwareness(): this {
    this._WellWater();
    return this;
  }
  affectHero(hero: Hero): boolean {
    Sample.INSTANCE.play$Object(Assets$Sounds.DRINK);
    this.emitter_.parent.add$Gizmo(new Identification()._Identification(hero.sprite_.center$()));
    hero.belongings.observe();
    for (let i = 0; i < Dungeon.level.length(); i++) {
      let terr = Dungeon.level.map_[i];
      if ((Terrain.flags[terr] & Terrain.SECRET) !== 0) {
        Dungeon.level.discover(i);
        if (Dungeon.level.heroFOV[i]) {
          GameScene.discoverTile(i, terr);
        }
      }
    }
    Buff.affect$Char$Class$float(hero, $J.cls(Awareness), Awareness.DURATION);
    Dungeon.observe$();
    Dungeon.hero.interrupt();
    GLog.p(Messages.get$Object$String$ObjectArr(this, 'procced', []), []);
    return true;
  }
  affectItem(item: Item, pos: number): Item {
    if (item.isIdentified()) {
      return null;
    } else {
      ScrollOfIdentify.IDItem(item);
      Sample.INSTANCE.play$Object(Assets$Sounds.DRINK);
      this.emitter_.parent.add$Gizmo(new Identification()._Identification(DungeonTilemap.tileCenterToWorld(pos)));
      return item;
    }
  }
  landmark(): Notes$Landmark {
    return Notes$Landmark.WELL_OF_AWARENESS;
  }
  use(emitter: BlobEmitter): void {
    super.use(emitter);
    emitter.pour(Speck.factory$int(Speck.QUESTION), Math.fround(0.3));
  }
  tileDesc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', []);
  }
}

$J.define(WaterOfAwareness, 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.WaterOfAwareness', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.WellWater', ctors: { '': '_WaterOfAwareness' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Awareness = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Awareness');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Identification = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Identification');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  ScrollOfIdentify = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfIdentify');
  Notes$Landmark = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes$Landmark');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
