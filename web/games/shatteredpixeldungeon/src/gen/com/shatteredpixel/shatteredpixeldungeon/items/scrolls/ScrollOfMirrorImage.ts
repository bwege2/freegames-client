// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/scrolls/ScrollOfMirrorImage.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../jre/index.ts';
import { Scroll } from './Scroll.ts';

let Assets$Sounds, Dungeon, Actor, MirrorImage, Item, ScrollOfTeleportation, Messages, GameScene, ItemSpriteSheet$Icons, GLog, Sample, PathFinder, Random;

export class ScrollOfMirrorImage extends Scroll {
  static readonly NIMAGES: number = 2;
  _ScrollOfMirrorImage(): this {
    this._Scroll();
    this.icon_ = ItemSpriteSheet$Icons.SCROLL_MIRRORIMG;
    return this;
  }
  doRead(): void {
    this.detach(Item.curUser.belongings.backpack);
    if (ScrollOfMirrorImage.spawnImages$Hero$int(Item.curUser, ScrollOfMirrorImage.NIMAGES) > 0) {
      GLog.i(Messages.get$Object$String$ObjectArr(this, 'copies', []), []);
    } else {
      GLog.i(Messages.get$Object$String$ObjectArr(this, 'no_copies', []), []);
    }
    this.identify$();
    Sample.INSTANCE.play$Object(Assets$Sounds.READ);
    this.readAnimation();
  }
  static spawnImages$Hero$int(hero: Hero, nImages: number): number {
    return ScrollOfMirrorImage.spawnImages$Hero$int$int(hero, hero.pos, nImages);
  }
  static spawnImages$Hero$int$int(hero: Hero, pos: number, nImages: number): number {
    let respawnPoints = new ArrayList();
    for (let i = 0; i < PathFinder.NEIGHBOURS9.length; i++) {
      let p = (pos + PathFinder.NEIGHBOURS9[i]) | 0;
      if (Actor.findChar(p) == null && Dungeon.level.passable[p]) {
        respawnPoints.add(p);
      }
    }
    let spawned = 0;
    while (nImages > 0 && respawnPoints.size() > 0) {
      let index = Random.index(respawnPoints);
      let mob = new MirrorImage()._MirrorImage();
      mob.duplicate(hero);
      GameScene.add$Mob(mob);
      ScrollOfTeleportation.appear(mob, respawnPoints.get(index));
      respawnPoints.removeAt(index);
      nImages--;
      spawned++;
    }
    return spawned;
  }
  value(): number {
    return this.isKnown() ? Math.imul(30, this.quantity) : super.value();
  }
}

$J.define(ScrollOfMirrorImage, 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfMirrorImage', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.Scroll', ctors: { '': '_ScrollOfMirrorImage' }, meths: { 'spawnImages(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,int,int)': 'spawnImages$Hero$int$int', 'spawnImages(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,int)': 'spawnImages$Hero$int' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  MirrorImage = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.MirrorImage');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  ScrollOfTeleportation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTeleportation');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet$Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet$Icons');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
