// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/HeroAction.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

export class HeroAction extends JObject {
  dst: number = 0;
  _HeroAction(): this {
    return this;
  }
}

export class HeroAction$Move extends HeroAction {
  _HeroAction$Move(dst: number): this {
    this._HeroAction();
    this.dst = dst;
    return this;
  }
}

export class HeroAction$PickUp extends HeroAction {
  _HeroAction$PickUp(dst: number): this {
    this._HeroAction();
    this.dst = dst;
    return this;
  }
}

export class HeroAction$OpenChest extends HeroAction {
  _HeroAction$OpenChest(dst: number): this {
    this._HeroAction();
    this.dst = dst;
    return this;
  }
}

export class HeroAction$Buy extends HeroAction {
  _HeroAction$Buy(dst: number): this {
    this._HeroAction();
    this.dst = dst;
    return this;
  }
}

export class HeroAction$Interact extends HeroAction {
  ch: Char = null;
  _HeroAction$Interact(ch: Char): this {
    this._HeroAction();
    this.ch = ch;
    return this;
  }
}

export class HeroAction$Unlock extends HeroAction {
  _HeroAction$Unlock(door: number): this {
    this._HeroAction();
    this.dst = door;
    return this;
  }
}

export class HeroAction$LvlTransition extends HeroAction {
  _HeroAction$LvlTransition(stairs: number): this {
    this._HeroAction();
    this.dst = stairs;
    return this;
  }
}

export class HeroAction$Mine extends HeroAction {
  _HeroAction$Mine(wall: number): this {
    this._HeroAction();
    this.dst = wall;
    return this;
  }
}

export class HeroAction$Alchemy extends HeroAction {
  _HeroAction$Alchemy(pot: number): this {
    this._HeroAction();
    this.dst = pot;
    return this;
  }
}

export class HeroAction$Attack extends HeroAction {
  target: Char = null;
  _HeroAction$Attack(target: Char): this {
    this._HeroAction();
    this.target = target;
    return this;
  }
}

$J.define(HeroAction, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroAction', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_HeroAction' } });
$J.define(HeroAction$Move, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroAction$Move', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroAction', ctors: { 'int': '_HeroAction$Move' } });
$J.define(HeroAction$PickUp, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroAction$PickUp', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroAction', ctors: { 'int': '_HeroAction$PickUp' } });
$J.define(HeroAction$OpenChest, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroAction$OpenChest', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroAction', ctors: { 'int': '_HeroAction$OpenChest' } });
$J.define(HeroAction$Buy, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroAction$Buy', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroAction', ctors: { 'int': '_HeroAction$Buy' } });
$J.define(HeroAction$Interact, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroAction$Interact', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroAction', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.actors.Char': '_HeroAction$Interact' } });
$J.define(HeroAction$Unlock, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroAction$Unlock', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroAction', ctors: { 'int': '_HeroAction$Unlock' } });
$J.define(HeroAction$LvlTransition, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroAction$LvlTransition', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroAction', ctors: { 'int': '_HeroAction$LvlTransition' } });
$J.define(HeroAction$Mine, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroAction$Mine', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroAction', ctors: { 'int': '_HeroAction$Mine' } });
$J.define(HeroAction$Alchemy, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroAction$Alchemy', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroAction', ctors: { 'int': '_HeroAction$Alchemy' } });
$J.define(HeroAction$Attack, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroAction$Attack', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroAction', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.actors.Char': '_HeroAction$Attack' } });
