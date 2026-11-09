// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/spells/Spell.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let MagicImmune, Messages, GLog;

export class Spell extends Item {
  static readonly AC_CAST: string = 'CAST';
  talentFactor: number = 0;
  talentChance: number = 0;
  _Spell(): this {
    this._Item();
    this.talentFactor = 1;
    this.talentChance = 1;
    this.stackable = true;
    this.defaultAction_ = Spell.AC_CAST;
    return this;
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    actions.add(Spell.AC_CAST);
    return actions;
  }
  execute$Hero$String(hero: Hero, action: string): void {
    super.execute$Hero$String(hero, action);
    if ($J.equals(action, Spell.AC_CAST)) {
      if (Item.curUser.buff($J.cls(MagicImmune)) != null) {
        GLog.w(Messages.get$Object$String$ObjectArr(this, 'no_magic', []), []);
        return;
      }
      this.onCast(hero);
    }
  }
  isIdentified(): boolean {
    return true;
  }
  isUpgradable(): boolean {
    return false;
  }
}

$J.define(Spell, 'com.shatteredpixel.shatteredpixeldungeon.items.spells.Spell', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { '': '_Spell' }, meths: { 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' } });
$J.module(() => {
  MagicImmune = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MagicImmune');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
});
