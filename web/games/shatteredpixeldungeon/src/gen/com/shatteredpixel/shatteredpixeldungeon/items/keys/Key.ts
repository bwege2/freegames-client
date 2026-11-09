// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/keys/Key.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Item } from '../Item.ts';

let Assets$Sounds, Statistics, SkeletonKey$KeyReplacementTracker, Catalog, Notes, GameScene, WndJournal, Sample;

export class Key extends Item {
  static readonly TIME_TO_UNLOCK: number = 1;
  depth_: number = 0;
  static readonly DEPTH: string = 'depth';
  _Key(): this {
    this._Item();
    this.stackable = true;
    this.unique = true;
    return this;
  }
  isSimilar(item: Item): boolean {
    return super.isSimilar(item) && (item).depth_ === this.depth_;
  }
  doPickUp$Hero$int(hero: Hero, pos: number): boolean {
    Catalog.setSeen($J.getClass(this));
    Statistics.itemTypesDiscovered.add($J.getClass(this));
    GameScene.pickUpJournal(this, pos);
    WndJournal.last_index = 0;
    Notes.add$Key(this);
    Sample.INSTANCE.play$Object(Assets$Sounds.ITEM);
    hero.spendAndNext(this.pickupDelay());
    GameScene.updateKeyDisplay();
    if (hero.buff($J.cls(SkeletonKey$KeyReplacementTracker)) != null) {
      hero.buff($J.cls(SkeletonKey$KeyReplacementTracker)).processExcessKeys();
    }
    return true;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(Key.DEPTH, this.depth_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.depth_ = bundle.getInt(Key.DEPTH);
  }
  isUpgradable(): boolean {
    return false;
  }
  isIdentified(): boolean {
    return true;
  }
}

$J.define(Key, 'com.shatteredpixel.shatteredpixeldungeon.items.keys.Key', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { '': '_Key' }, meths: { 'doPickUp(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,int)': 'doPickUp$Hero$int' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  SkeletonKey$KeyReplacementTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.SkeletonKey$KeyReplacementTracker');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Notes = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  WndJournal = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndJournal');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
