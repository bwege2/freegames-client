// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/Honeypot.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../jre/index.ts';
import { Item } from './Item.ts';

let Assets$Sounds, Dungeon, Actor, Char$Alignment, Bee, Pushing, Splash, Catalog, GameScene, ItemSpriteSheet, Sample, AlphaTweener, PathFinder, Random;

export class Honeypot extends Item {
  static readonly AC_SHATTER: string = 'SHATTER';
  _Honeypot(): this {
    this._Item();
    this.image_ = ItemSpriteSheet.HONEYPOT;
    this.defaultAction_ = Item.AC_THROW;
    this.usesTargeting_ = true;
    this.stackable = true;
    return this;
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    actions.add(Honeypot.AC_SHATTER);
    return actions;
  }
  execute$Hero$String(hero: Hero, action: string): void {
    super.execute$Hero$String(hero, action);
    if ($J.equals(action, Honeypot.AC_SHATTER)) {
      hero.sprite_.zap$int(hero.pos);
      this.detach(hero.belongings.backpack);
      Catalog.countUse($J.getClass(this));
      let item = this.shatter(hero, hero.pos);
      if (!item.collect$()) {
        Dungeon.level.drop(item, hero.pos);
        if (item instanceof Honeypot$ShatteredPot) {
          (item).dropPot(hero, hero.pos);
        }
      }
      hero.next();
    }
  }
  onThrow(cell: number): void {
    if (Dungeon.level.pit[cell]) {
      super.onThrow(cell);
    } else {
      Catalog.countUse($J.getClass(this));
      Dungeon.level.drop(this.shatter(null, cell), cell);
    }
  }
  shatter(owner: Char, pos: number): Item {
    if (Dungeon.level.heroFOV[pos]) {
      Sample.INSTANCE.play$Object(Assets$Sounds.SHATTER);
      Splash.at$int$int$int(pos, 16766208, 5);
    }
    let newPos = pos;
    if (Actor.findChar(pos) != null) {
      let candidates = new ArrayList();
      for (let n of PathFinder.NEIGHBOURS4) {
        let c = (pos + n) | 0;
        if (!Dungeon.level.solid[c] && Actor.findChar(c) == null) {
          candidates.add(c);
        }
      }
      newPos = candidates.size() > 0 ? Random.element$Collection(candidates) : -1;
    }
    if (newPos !== -1) {
      let bee = new Bee()._Bee();
      bee.spawn(Dungeon.scalingDepth());
      bee.setPotInfo(pos, owner);
      bee.HP = bee.HT;
      bee.pos = newPos;
      GameScene.add$Mob(bee);
      if (newPos !== pos) {
        Actor.add$Actor(new Pushing()._Pushing$Char$int$int(bee, pos, newPos));
      }
      bee.sprite_.alpha$float(0);
      bee.sprite_.parent.add$Gizmo(new AlphaTweener()._AlphaTweener(bee.sprite_, 1, Math.fround(0.15)));
      Sample.INSTANCE.play$Object(Assets$Sounds.BEE);
      return new Honeypot$ShatteredPot()._Honeypot$ShatteredPot();
    } else {
      return this;
    }
  }
  isUpgradable(): boolean {
    return false;
  }
  isIdentified(): boolean {
    return true;
  }
  value(): number {
    return Math.imul(30, this.quantity);
  }
}

export class Honeypot$ShatteredPot extends Item {
  _Honeypot$ShatteredPot(): this {
    this._Item();
    this.image_ = ItemSpriteSheet.SHATTPOT;
    this.stackable = true;
    return this;
  }
  doPickUp$Hero$int(hero: Hero, pos: number): boolean {
    if (super.doPickUp$Hero$int(hero, pos)) {
      this.pickupPot(hero);
      return true;
    } else {
      return false;
    }
  }
  doDrop(hero: Hero): void {
    super.doDrop(hero);
    this.dropPot(hero, hero.pos);
  }
  onThrow(cell: number): void {
    super.onThrow(cell);
    this.dropPot(Item.curUser, cell);
  }
  pickupPot(holder: Char): void {
    for (const $it0 = this.findBees$int$Honeypot_ShatteredPot(holder.pos).iterator(); $it0.hasNext(); ) {
      let bee = $it0.next();
      this.updateBee(bee, -1, holder);
    }
  }
  dropPot(holder: Char, dropPos: number): void {
    for (const $it1 = this.findBees$Char$Honeypot_ShatteredPot(holder).iterator(); $it1.hasNext(); ) {
      let bee = $it1.next();
      this.updateBee(bee, dropPos, null);
    }
  }
  movePot(oldpos: number, movePos: number): void {
    for (const $it2 = this.findBees$int$Honeypot_ShatteredPot(oldpos).iterator(); $it2.hasNext(); ) {
      let bee = $it2.next();
      this.updateBee(bee, movePos, null);
    }
  }
  destroyPot(potPos: number): void {
    for (const $it3 = this.findBees$int$Honeypot_ShatteredPot(potPos).iterator(); $it3.hasNext(); ) {
      let bee = $it3.next();
      this.updateBee(bee, -1, null);
    }
  }
  updateBee(bee: Bee, cell: number, holder: Char): void {
    if (bee != null && bee.alignment === Char$Alignment.ENEMY) {
      bee.setPotInfo(cell, holder);
    }
  }
  findBees$int$Honeypot_ShatteredPot(potPos: number): ArrayList<Bee> {
    let bees = new ArrayList();
    for (const $it4 = Actor.chars().iterator(); $it4.hasNext(); ) {
      let c = $it4.next();
      if (c instanceof Bee && (c).potPos() === potPos) {
        bees.add(c);
        if (bees.size() >= this.quantity) {
          break;
        }
      }
    }
    return bees;
  }
  findBees$Char$Honeypot_ShatteredPot(potHolder: Char): ArrayList<Bee> {
    let bees = new ArrayList();
    for (const $it5 = Actor.chars().iterator(); $it5.hasNext(); ) {
      let c = $it5.next();
      if (c instanceof Bee && (c).potHolderID() === potHolder.id()) {
        bees.add(c);
        if (bees.size() >= this.quantity) {
          break;
        }
      }
    }
    return bees;
  }
  isUpgradable(): boolean {
    return false;
  }
  isIdentified(): boolean {
    return true;
  }
  value(): number {
    return Math.imul(5, this.quantity);
  }
}

$J.define(Honeypot, 'com.shatteredpixel.shatteredpixeldungeon.items.Honeypot', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { '': '_Honeypot' }, meths: { 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' } });
$J.define(Honeypot$ShatteredPot, 'com.shatteredpixel.shatteredpixeldungeon.items.Honeypot$ShatteredPot', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { '': '_Honeypot$ShatteredPot' }, meths: { 'findBees(com.shatteredpixel.shatteredpixeldungeon.actors.Char)': 'findBees$Char$Honeypot_ShatteredPot', 'findBees(int)': 'findBees$int$Honeypot_ShatteredPot', 'doPickUp(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,int)': 'doPickUp$Hero$int' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Bee = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Bee');
  Pushing = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Pushing');
  Splash = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Splash');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  AlphaTweener = $J.load('com.watabou.noosa.tweeners.AlphaTweener');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
