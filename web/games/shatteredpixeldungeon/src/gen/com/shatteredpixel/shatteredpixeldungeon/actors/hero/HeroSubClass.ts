// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/HeroSubClass.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JEnum, JString } from '../../../../../../jre/index.ts';

let Dungeon, MagesStaff, Messages, GameScene, HeroIcon, Game;

export class HeroSubClass extends JEnum {
  icon_: number = 0;
  static NONE: HeroSubClass = null;
  static BERSERKER: HeroSubClass = null;
  static GLADIATOR: HeroSubClass = null;
  static BATTLEMAGE: HeroSubClass = null;
  static WARLOCK: HeroSubClass = null;
  static ASSASSIN: HeroSubClass = null;
  static FREERUNNER: HeroSubClass = null;
  static SNIPER: HeroSubClass = null;
  static WARDEN: HeroSubClass = null;
  static CHAMPION: HeroSubClass = null;
  static MONK: HeroSubClass = null;
  static PRIEST: HeroSubClass = null;
  static PALADIN: HeroSubClass = null;
  static $VALUES: HeroSubClass[] = null;
  _HeroSubClass($name: string, $ordinal: number, icon: number): this {
    this._JEnum($name, $ordinal);
    this.icon_ = icon;
    return this;
  }
  title(): string {
    return Messages.get$Object$String$ObjectArr(this, this.name(), []);
  }
  shortDesc(): string {
    return Messages.get$Object$String$ObjectArr(this, this.name() + '_short_desc', []);
  }
  desc(): string {
    if (this === HeroSubClass.BATTLEMAGE) {
      let desc = Messages.get$Object$String$ObjectArr(this, this.name() + '_desc', []);
      if (Game.scene() instanceof GameScene) {
        let staff = Dungeon.hero.belongings.getItem($J.cls(MagesStaff));
        if (staff != null && staff.wandClass() != null) {
          desc += '\n\n' + Messages.get$Class$String$ObjectArr(staff.wandClass(), 'bmage_desc', []);
          desc = JString.replaceAll(desc, '_', '');
        }
      }
      return desc;
    } else {
      return Messages.get$Object$String$ObjectArr(this, this.name() + '_desc', []);
    }
  }
  icon(): number {
    return this.icon_;
  }
  static values(): HeroSubClass[] { return HeroSubClass.$VALUES.slice(); }
  static valueOf(name: string): HeroSubClass { return $J.enumValueOf(HeroSubClass, name); }
  static $clinit() {
    HeroSubClass.NONE = new HeroSubClass()._HeroSubClass('NONE', 0, HeroIcon.NONE);
    HeroSubClass.BERSERKER = new HeroSubClass()._HeroSubClass('BERSERKER', 1, HeroIcon.BERSERKER);
    HeroSubClass.GLADIATOR = new HeroSubClass()._HeroSubClass('GLADIATOR', 2, HeroIcon.GLADIATOR);
    HeroSubClass.BATTLEMAGE = new HeroSubClass()._HeroSubClass('BATTLEMAGE', 3, HeroIcon.BATTLEMAGE);
    HeroSubClass.WARLOCK = new HeroSubClass()._HeroSubClass('WARLOCK', 4, HeroIcon.WARLOCK);
    HeroSubClass.ASSASSIN = new HeroSubClass()._HeroSubClass('ASSASSIN', 5, HeroIcon.ASSASSIN);
    HeroSubClass.FREERUNNER = new HeroSubClass()._HeroSubClass('FREERUNNER', 6, HeroIcon.FREERUNNER);
    HeroSubClass.SNIPER = new HeroSubClass()._HeroSubClass('SNIPER', 7, HeroIcon.SNIPER);
    HeroSubClass.WARDEN = new HeroSubClass()._HeroSubClass('WARDEN', 8, HeroIcon.WARDEN);
    HeroSubClass.CHAMPION = new HeroSubClass()._HeroSubClass('CHAMPION', 9, HeroIcon.CHAMPION);
    HeroSubClass.MONK = new HeroSubClass()._HeroSubClass('MONK', 10, HeroIcon.MONK);
    HeroSubClass.PRIEST = new HeroSubClass()._HeroSubClass('PRIEST', 11, HeroIcon.PRIEST);
    HeroSubClass.PALADIN = new HeroSubClass()._HeroSubClass('PALADIN', 12, HeroIcon.PALADIN);
    HeroSubClass.$VALUES = [HeroSubClass.NONE, HeroSubClass.BERSERKER, HeroSubClass.GLADIATOR, HeroSubClass.BATTLEMAGE, HeroSubClass.WARLOCK, HeroSubClass.ASSASSIN, HeroSubClass.FREERUNNER, HeroSubClass.SNIPER, HeroSubClass.WARDEN, HeroSubClass.CHAMPION, HeroSubClass.MONK, HeroSubClass.PRIEST, HeroSubClass.PALADIN];
  }
}

$J.define(HeroSubClass, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass', { kind: 'enum', sup: 'java.lang.Enum', ctors: { 'int': '_HeroSubClass' }, clinit: true, lazy: ['$VALUES', 'NONE', 'BERSERKER', 'GLADIATOR', 'BATTLEMAGE', 'WARLOCK', 'ASSASSIN', 'FREERUNNER', 'SNIPER', 'WARDEN', 'CHAMPION', 'MONK', 'PRIEST', 'PALADIN'] });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  MagesStaff = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MagesStaff');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  Game = $J.load('com.watabou.noosa.Game');
});
