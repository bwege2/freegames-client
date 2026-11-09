// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/KingsCrown.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Actor, Talent, Ratmogrify, Speck, ClassArmor, Catalog, Messages, GameScene, ItemSpriteSheet, GLog, WndChooseAbility, Sample;

export class KingsCrown extends Item {
  static readonly AC_WEAR: string = 'WEAR';
  _KingsCrown(): this {
    this._Item();
    this.image_ = ItemSpriteSheet.CROWN;
    this.defaultAction_ = KingsCrown.AC_WEAR;
    this.unique = true;
    return this;
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    actions.add(KingsCrown.AC_WEAR);
    return actions;
  }
  execute$Hero$String(hero: Hero, action: string): void {
    super.execute$Hero$String(hero, action);
    if ($J.equals(action, KingsCrown.AC_WEAR)) {
      Item.curUser = hero;
      if (hero.belongings.armor() != null) {
        GameScene.show(new WndChooseAbility()._WndChooseAbility(this, hero.belongings.armor(), hero));
      } else {
        GLog.w(Messages.get$Object$String$ObjectArr(this, 'naked', []), []);
      }
    }
  }
  isUpgradable(): boolean {
    return false;
  }
  isIdentified(): boolean {
    return true;
  }
  upgradeArmor(hero: Hero, armor: Armor, ability: ArmorAbility): void {
    this.detach(hero.belongings.backpack);
    Catalog.countUse($J.getClass(this));
    hero.sprite_.emitter().burst(Speck.factory$int(Speck.CROWN), 12);
    hero.spend(Actor.TICK);
    hero.busy();
    if (armor != null) {
      if (ability instanceof Ratmogrify) {
        GLog.p(Messages.get$Object$String$ObjectArr(this, 'ratgraded', []), []);
      } else {
        GLog.p(Messages.get$Object$String$ObjectArr(this, 'upgraded', []), []);
      }
      let classArmor = ClassArmor.upgrade(hero, armor);
      if (hero.belongings.armor_ === armor) {
        hero.belongings.armor_ = classArmor;
        (hero.sprite_).updateArmor();
        classArmor.activate(hero);
      } else {
        armor.detach(hero.belongings.backpack);
        classArmor.collect$Bag(hero.belongings.backpack);
      }
    }
    hero.armorAbility = ability;
    Talent.initArmorTalents$Hero(hero);
    hero.sprite_.operate$int(hero.pos);
    Sample.INSTANCE.play$Object(Assets$Sounds.MASTERY);
  }
}

$J.define(KingsCrown, 'com.shatteredpixel.shatteredpixeldungeon.items.KingsCrown', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { '': '_KingsCrown' }, meths: { 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Ratmogrify = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.Ratmogrify');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  ClassArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.ClassArmor');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndChooseAbility = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndChooseAbility');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
