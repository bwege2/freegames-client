// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/Transmuting.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JEnum } from '../../../../../jre/index.ts';
import { Component } from '../../../watabou/noosa/ui/Component.ts';

let ItemSprite, TalentIcon, Game;

export class Transmuting extends Component {
  static readonly FADE_IN_TIME: number = Math.fround(0.2);
  static readonly TRANSMUTING_TIME: number = Math.fround(1.4);
  static readonly FADE_OUT_TIME: number = Math.fround(0.4);
  static readonly ALPHA: number = Math.fround(0.6);
  oldSprite: Image = null;
  newSprite: Image = null;
  target: Char = null;
  phase: Transmuting$Phase = null;
  duration: number = 0;
  passed: number = 0;
  _Transmuting$Item$Item(oldItem: Item, newItem: Item): this {
    this._Component();
    this.oldSprite = new ItemSprite()._ItemSprite$Item(oldItem);
    this.oldSprite.originToCenter();
    this.add$Gizmo(this.oldSprite);
    this.newSprite = new ItemSprite()._ItemSprite$Item(newItem);
    this.newSprite.originToCenter();
    this.add$Gizmo(this.newSprite);
    this.oldSprite.alpha$float(0);
    this.newSprite.alpha$float(0);
    this.phase = Transmuting$Phase.FADE_IN;
    this.duration = Transmuting.FADE_IN_TIME;
    this.passed = 0;
    return this;
  }
  _Transmuting$Talent$Talent(oldTalent: Talent, newTalent: Talent): this {
    this._Component();
    this.oldSprite = new TalentIcon()._TalentIcon$Talent(oldTalent);
    this.oldSprite.originToCenter();
    this.add$Gizmo(this.oldSprite);
    this.newSprite = new TalentIcon()._TalentIcon$Talent(newTalent);
    this.newSprite.originToCenter();
    this.add$Gizmo(this.newSprite);
    this.oldSprite.alpha$float(0);
    this.newSprite.alpha$float(0);
    this.phase = Transmuting$Phase.FADE_IN;
    this.duration = Transmuting.FADE_IN_TIME;
    this.passed = 0;
    return this;
  }
  update(): void {
    super.update();
    if (this.passed === Math.fround(0)) {
      this.oldSprite.x = Math.fround(this.target.sprite_.center$().x - Math.fround(this.oldSprite.width() / 2));
      this.oldSprite.y = Math.fround(this.target.sprite_.y - this.oldSprite.height());
      this.newSprite.x = Math.fround(this.target.sprite_.center$().x - Math.fround(this.newSprite.width() / 2));
      this.newSprite.y = Math.fround(this.target.sprite_.y - this.newSprite.height());
    }
    switch (this.phase) {
      case Transmuting$Phase.FADE_IN:
        this.oldSprite.alpha$float(Math.fround(Math.fround(this.passed / this.duration) * Transmuting.ALPHA));
        this.oldSprite.scale_.set$float(Math.fround(this.passed / this.duration));
        break;
      case Transmuting$Phase.TRANSMUTING:
        this.oldSprite.alpha$float(Math.fround(Math.fround((Math.fround(Transmuting.TRANSMUTING_TIME - this.passed)) / this.duration) * Transmuting.ALPHA));
        this.newSprite.alpha$float(Math.fround(Math.fround(this.passed / this.duration) * Transmuting.ALPHA));
        break;
      case Transmuting$Phase.FADE_OUT:
        this.newSprite.alpha$float(Math.fround((Math.fround(1 - Math.fround(this.passed / this.duration))) * Transmuting.ALPHA));
        this.newSprite.scale_.set$float(Math.fround(1 + Math.fround(this.passed / this.duration)));
        break;
    }
    if ((this.passed = Math.fround(this.passed + Game.elapsed)) > this.duration) {
      switch (this.phase) {
        case Transmuting$Phase.FADE_IN:
          this.phase = Transmuting$Phase.TRANSMUTING;
          this.duration = Transmuting.TRANSMUTING_TIME;
          break;
        case Transmuting$Phase.TRANSMUTING:
          this.phase = Transmuting$Phase.FADE_OUT;
          this.duration = Transmuting.FADE_OUT_TIME;
          break;
        case Transmuting$Phase.FADE_OUT:
          this.kill();
          break;
      }
      this.passed = 0;
    }
  }
  static show$Char$Item$Item(ch: Char, oldItem: Item, newItem: Item): void {
    if (!ch.sprite_.visible_) {
      return;
    }
    let sprite = new Transmuting()._Transmuting$Item$Item(oldItem, newItem);
    sprite.target = ch;
    ch.sprite_.parent.add$Gizmo(sprite);
  }
  static show$Char$Talent$Talent(ch: Char, oldTalent: Talent, newTalent: Talent): void {
    if (!ch.sprite_.visible_) {
      return;
    }
    let sprite = new Transmuting()._Transmuting$Talent$Talent(oldTalent, newTalent);
    sprite.target = ch;
    ch.sprite_.parent.add$Gizmo(sprite);
  }
}

export class Transmuting$Phase extends JEnum {
  static FADE_IN: Transmuting$Phase = null;
  static TRANSMUTING: Transmuting$Phase = null;
  static FADE_OUT: Transmuting$Phase = null;
  static $VALUES: Transmuting$Phase[] = null;
  _Transmuting$Phase($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Transmuting$Phase[] { return Transmuting$Phase.$VALUES.slice(); }
  static valueOf(name: string): Transmuting$Phase { return $J.enumValueOf(Transmuting$Phase, name); }
  static $clinit() {
    Transmuting$Phase.FADE_IN = new Transmuting$Phase()._Transmuting$Phase('FADE_IN', 0);
    Transmuting$Phase.TRANSMUTING = new Transmuting$Phase()._Transmuting$Phase('TRANSMUTING', 1);
    Transmuting$Phase.FADE_OUT = new Transmuting$Phase()._Transmuting$Phase('FADE_OUT', 2);
    Transmuting$Phase.$VALUES = [Transmuting$Phase.FADE_IN, Transmuting$Phase.TRANSMUTING, Transmuting$Phase.FADE_OUT];
  }
}

$J.define(Transmuting, 'com.shatteredpixel.shatteredpixeldungeon.effects.Transmuting', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent,com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent': '_Transmuting$Talent$Talent', 'com.shatteredpixel.shatteredpixeldungeon.items.Item,com.shatteredpixel.shatteredpixeldungeon.items.Item': '_Transmuting$Item$Item' }, meths: { 'show(com.shatteredpixel.shatteredpixeldungeon.actors.Char,com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent,com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent)': 'show$Char$Talent$Talent', 'show(com.shatteredpixel.shatteredpixeldungeon.actors.Char,com.shatteredpixel.shatteredpixeldungeon.items.Item,com.shatteredpixel.shatteredpixeldungeon.items.Item)': 'show$Char$Item$Item' } });
$J.define(Transmuting$Phase, 'com.shatteredpixel.shatteredpixeldungeon.effects.Transmuting$Phase', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Transmuting$Phase' }, clinit: true, lazy: ['$VALUES', 'FADE_IN', 'TRANSMUTING', 'FADE_OUT'] });
$J.module(() => {
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  TalentIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.TalentIcon');
  Game = $J.load('com.watabou.noosa.Game');
});
