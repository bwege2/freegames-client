// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/Amulet.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, IOException, JObject } from '../../../../../jre/index.ts';
import { Item } from './Item.ts';

let Badges, Challenges, Dungeon, Statistics, Actor, AscensionChallenge, Messages, AmuletScene, ItemSpriteSheet, Game;

export class Amulet extends Item {
  static readonly AC_END: string = 'END';
  _Amulet(): this {
    this._Item();
    this.image_ = ItemSpriteSheet.AMULET;
    this.unique = true;
    return this;
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    if (hero.buff($J.cls(AscensionChallenge)) != null) {
      actions.clear();
    } else {
      actions.add(Amulet.AC_END);
    }
    return actions;
  }
  execute$Hero$String(hero: Hero, action: string): void {
    super.execute$Hero$String(hero, action);
    if ($J.equals(action, Amulet.AC_END)) {
      this.showAmuletScene(false);
    }
  }
  doPickUp$Hero$int(hero: Hero, pos: number): boolean {
    if (super.doPickUp$Hero$int(hero, pos)) {
      if (!Statistics.amuletObtained) {
        Statistics.amuletObtained = true;
        hero.spend(Math.fround(-hero.cooldown()));
        Actor.add$Actor(new (Amulet$1())().$o(this)._Actor().$init_anon());
      }
      return true;
    } else {
      return false;
    }
  }
  showAmuletScene(showText: boolean): void {
    AmuletScene.noText = !showText;
    Game.switchScene$Class$SceneChangeCallback($J.cls(AmuletScene), new (Amulet$2())().$o(this));
  }
  isIdentified(): boolean {
    return true;
  }
  isUpgradable(): boolean {
    return false;
  }
  desc(): string {
    let desc = super.desc();
    if (Dungeon.hero == null || Dungeon.hero.buff($J.cls(AscensionChallenge)) == null) {
      desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_origins', []);
    } else {
      desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_ascent', []);
    }
    return desc;
  }
}

let $Amulet$1: any = null;
/** An anonymous class (Amulet.java:80). */
function Amulet$1(): any {
  return $Amulet$1 ??= $J.local(class extends Actor {
    $init_anon() {
      this.actPriority = Actor.VFX_PRIO;
      return this;
    }
    act(): boolean {
      Actor.remove(this);
      this.$outer.showAmuletScene(true);
      return false;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.Amulet$1', []);
}

let $Amulet$2: any = null;
/** An anonymous class (Amulet.java:103). */
function Amulet$2(): any {
  return $Amulet$2 ??= $J.local(class extends JObject {
    beforeCreate(): void {
    }
    afterCreate(): void {
      Badges.validateVictory();
      Badges.validateChampion(Challenges.activeChallenges$());
      try {
        Dungeon.saveAll();
        Badges.saveGlobal$();
      } catch ($e0) {
        if ($J.isa($e0, IOException)) {
          let e = $J.exc($e0);
          Game.reportException(e);
        } else {
          throw $e0;
        }
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.Amulet$2', ['com.watabou.noosa.Game$SceneChangeCallback']);
}

$J.define(Amulet, 'com.shatteredpixel.shatteredpixeldungeon.items.Amulet', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { '': '_Amulet' }, meths: { 'doPickUp(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,int)': 'doPickUp$Hero$int', 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' } });
$J.module(() => {
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  AscensionChallenge = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AscensionChallenge');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  AmuletScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.AmuletScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Game = $J.load('com.watabou.noosa.Game');
});
