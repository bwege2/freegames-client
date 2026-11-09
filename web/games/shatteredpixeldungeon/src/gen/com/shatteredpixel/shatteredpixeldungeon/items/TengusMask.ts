// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/TengusMask.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../jre/index.ts';
import { Item } from './Item.ts';

let Assets$Sounds, Badges, Actor, Buff, Preparation, HeroSubClass, Talent, Speck, Catalog, Messages, GameScene, ItemSpriteSheet, GLog, WndChooseSubclass, Sample;

export class TengusMask extends Item {
  static readonly AC_WEAR: string = 'WEAR';
  _TengusMask(): this {
    this._Item();
    this.stackable = false;
    this.image_ = ItemSpriteSheet.MASK;
    this.defaultAction_ = TengusMask.AC_WEAR;
    this.unique = true;
    return this;
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    actions.add(TengusMask.AC_WEAR);
    return actions;
  }
  execute$Hero$String(hero: Hero, action: string): void {
    super.execute$Hero$String(hero, action);
    if ($J.equals(action, TengusMask.AC_WEAR)) {
      Item.curUser = hero;
      GameScene.show(new WndChooseSubclass()._WndChooseSubclass(this, hero));
    }
  }
  doPickUp$Hero$int(hero: Hero, pos: number): boolean {
    Badges.validateMastery();
    return super.doPickUp$Hero$int(hero, pos);
  }
  isUpgradable(): boolean {
    return false;
  }
  isIdentified(): boolean {
    return true;
  }
  choose(way: HeroSubClass): void {
    this.detach(Item.curUser.belongings.backpack);
    Catalog.countUse($J.getClass(this));
    Item.curUser.spend(Actor.TICK);
    Item.curUser.busy();
    Item.curUser.subClass = way;
    Talent.initSubclassTalents$Hero(Item.curUser);
    if (way === HeroSubClass.ASSASSIN && Item.curUser.invisible > 0) {
      Buff.affect$Char$Class(Item.curUser, $J.cls(Preparation));
    }
    Item.curUser.sprite_.operate$int(Item.curUser.pos);
    Sample.INSTANCE.play$Object(Assets$Sounds.MASTERY);
    let e = Item.curUser.sprite_.centerEmitter();
    e.pos$float$float$float$float(Math.fround(e.x - 2), Math.fround(e.y - 6), 4, 4);
    e.start(Speck.factory$int(Speck.MASK), Math.fround(0.05), 20);
    GLog.p(Messages.get$Object$String$ObjectArr(this, 'used', []), []);
  }
}

$J.define(TengusMask, 'com.shatteredpixel.shatteredpixeldungeon.items.TengusMask', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { '': '_TengusMask' }, meths: { 'doPickUp(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,int)': 'doPickUp$Hero$int', 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Preparation = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Preparation');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndChooseSubclass = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndChooseSubclass');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
