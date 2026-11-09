// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/TargetedClericSpell.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../jre/index.ts';
import { ClericSpell } from './ClericSpell.ts';

let Ballistica, Messages, CellSelector$Listener, GameScene;

export class TargetedClericSpell extends ClericSpell {
  _TargetedClericSpell(): this {
    this._ClericSpell();
    return this;
  }
  onCast(tome: HolyTome, hero: Hero): void {
    GameScene.selectCell(new (TargetedClericSpell$1())().$o(this).$c(tome, hero)._CellSelector$Listener());
  }
  targetingFlags(): number {
    return Ballistica.MAGIC_BOLT;
  }
  targetingPrompt(): string {
    return Messages.get$Object$String$ObjectArr(this, 'prompt', []);
  }
}

let $TargetedClericSpell$1: any = null;
/** An anonymous class (TargetedClericSpell.java:35). */
function TargetedClericSpell$1(): any {
  return $TargetedClericSpell$1 ??= $J.local(class extends CellSelector$Listener {
    onSelect(cell: number): void {
      this.$outer.onTargetSelected(this.$cv_tome, this.$cv_hero, cell);
    }
    prompt(): string {
      return this.$outer.targetingPrompt();
    }
    $c($tome, $hero): this {
      this.$cv_tome = $tome; this.$cv_hero = $hero;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.TargetedClericSpell$1', []);
}

$J.define(TargetedClericSpell, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.TargetedClericSpell', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.ClericSpell', ctors: { '': '_TargetedClericSpell' } });
$J.module(() => {
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CellSelector$Listener = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.CellSelector$Listener');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
});
