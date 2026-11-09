// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/quest/CeremonialCandle.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Item } from '../Item.ts';

let Assets$Sounds, Dungeon, Actor, Elemental$NewbornFireElemental, CellEmitter, ElmoParticle, Heap$Type, PrisonLevel, RegularLevel, RitualSiteRoom, GameScene, ItemSpriteSheet, Sample, Emitter, PathFinder, Random;

export class CeremonialCandle extends Item {
  static ritualPos: number = 0;
  aflame: boolean = false;
  static AFLAME: string = null;
  _CeremonialCandle(): this {
    this._Item();
    this.image_ = ItemSpriteSheet.CANDLE;
    this.defaultAction_ = Item.AC_THROW;
    this.unique = true;
    this.stackable = true;
    this.aflame = false;
    return this;
  }
  isUpgradable(): boolean {
    return false;
  }
  isIdentified(): boolean {
    return true;
  }
  doDrop(hero: Hero): void {
    super.doDrop(hero);
    this.aflame = false;
    CeremonialCandle.checkCandles();
  }
  onThrow(cell: number): void {
    super.onThrow(cell);
    this.aflame = false;
    CeremonialCandle.checkCandles();
  }
  doPickUp$Hero$int(hero: Hero, pos: number): boolean {
    if (super.doPickUp$Hero$int(hero, pos)) {
      this.aflame = false;
      return true;
    }
    return false;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$boolean(CeremonialCandle.AFLAME, this.aflame);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.aflame = bundle.getBoolean(CeremonialCandle.AFLAME);
  }
  emitter(): Emitter {
    if (this.aflame) {
      let emitter = new Emitter()._Emitter();
      emitter.pos$float$float(6, 0);
      emitter.fillTarget = false;
      emitter.pour(ElmoParticle.FACTORY, 0.25);
      return emitter;
    }
    return super.emitter();
  }
  static checkCandles(): void {
    if (!(Dungeon.level instanceof RegularLevel)) {
      return;
    }
    if (!((Dungeon.level).room$int(CeremonialCandle.ritualPos) instanceof RitualSiteRoom)) {
      return;
    }
    let candleHeaps = $J.newArray(4, null);
    candleHeaps[0] = Dungeon.level.heaps.get((CeremonialCandle.ritualPos - Dungeon.level.width()) | 0);
    candleHeaps[1] = Dungeon.level.heaps.get((CeremonialCandle.ritualPos + 1) | 0);
    candleHeaps[2] = Dungeon.level.heaps.get((CeremonialCandle.ritualPos + Dungeon.level.width()) | 0);
    candleHeaps[3] = Dungeon.level.heaps.get((CeremonialCandle.ritualPos - 1) | 0);
    let allCandles = true;
    for (let h of candleHeaps) {
      if (h != null && h.type_ === Heap$Type.HEAP) {
        let foundCandle = false;
        for (const $it0 = h.items_.iterator(); $it0.hasNext(); ) {
          let i = $it0.next();
          if (i instanceof CeremonialCandle) {
            if (!(i).aflame) {
              (i).aflame = true;
              h.sprite_.view$Heap(h).place(h.pos);
            }
            foundCandle = true;
          }
        }
        if (!foundCandle) {
          allCandles = false;
        }
      } else {
        allCandles = false;
      }
    }
    if (allCandles) {
      for (let h of candleHeaps) {
        for (let i of $J.toArrayInto(h.items_.toArray(), $J.newArray(0, null))) {
          if (i instanceof CeremonialCandle) {
            h.remove(i);
          }
        }
      }
      let elemental = new Elemental$NewbornFireElemental()._Elemental$NewbornFireElemental();
      let ch = Actor.findChar(CeremonialCandle.ritualPos);
      if (ch != null) {
        let candidates = new ArrayList();
        for (let n of PathFinder.NEIGHBOURS8) {
          let cell = (CeremonialCandle.ritualPos + n) | 0;
          if ((Dungeon.level.passable[cell] || Dungeon.level.avoid[cell]) && Actor.findChar(cell) == null) {
            candidates.add(cell);
          }
        }
        if (candidates.size() > 0) {
          elemental.pos = Random.element$Collection(candidates);
        } else {
          elemental.pos = CeremonialCandle.ritualPos;
        }
      } else {
        elemental.pos = CeremonialCandle.ritualPos;
      }
      elemental.state_ = elemental.HUNTING;
      GameScene.add$Mob$float(elemental, 1);
      if (Dungeon.level instanceof PrisonLevel) {
        (Dungeon.level).updateWandmakerQuestMusic();
      }
      for (let i of PathFinder.NEIGHBOURS9) {
        (CellEmitter.get((CeremonialCandle.ritualPos + i) | 0)).burst(ElmoParticle.FACTORY, 10);
      }
      Sample.INSTANCE.play$Object(Assets$Sounds.BURNING);
    }
  }
  static $clinit() {
    CeremonialCandle.AFLAME = 'aflame';
  }
}

$J.define(CeremonialCandle, 'com.shatteredpixel.shatteredpixeldungeon.items.quest.CeremonialCandle', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { '': '_CeremonialCandle' }, meths: { 'doPickUp(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,int)': 'doPickUp$Hero$int' }, clinit: true, lazy: ['ritualPos', 'AFLAME'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Elemental$NewbornFireElemental = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Elemental$NewbornFireElemental');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  ElmoParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ElmoParticle');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  PrisonLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.PrisonLevel');
  RegularLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.RegularLevel');
  RitualSiteRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.RitualSiteRoom');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Emitter = $J.load('com.watabou.noosa.particles.Emitter');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
