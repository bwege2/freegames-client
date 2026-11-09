// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/Stylus.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Belongings$Backpack, Enchanting, PurpleParticle, Armor, Catalog, Messages, GameScene, ItemSpriteSheet, GLog, WndBag$ItemSelector, Sample;

export class Stylus extends Item {
  static readonly TIME_TO_INSCRIBE: number = 2;
  static readonly AC_INSCRIBE: string = 'INSCRIBE';
  itemSelector: WndBag$ItemSelector = null;
  _Stylus(): this {
    this._Item();
    this.image_ = ItemSpriteSheet.STYLUS;
    this.stackable = true;
    this.defaultAction_ = Stylus.AC_INSCRIBE;
    this.bones = true;
    this.itemSelector = new (Stylus$1())().$o(this)._WndBag$ItemSelector();
    return this;
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    actions.add(Stylus.AC_INSCRIBE);
    return actions;
  }
  execute$Hero$String(hero: Hero, action: string): void {
    super.execute$Hero$String(hero, action);
    if ($J.equals(action, Stylus.AC_INSCRIBE)) {
      Item.curUser = hero;
      GameScene.selectItem(this.itemSelector);
    }
  }
  isUpgradable(): boolean {
    return false;
  }
  isIdentified(): boolean {
    return true;
  }
  inscribe(armor: Armor): void {
    if (!armor.cursedKnown) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'identify', []), []);
      return;
    } else if (armor.cursed || armor.hasCurseGlyph()) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'cursed', []), []);
      return;
    }
    this.detach(Item.curUser.belongings.backpack);
    Catalog.countUse($J.getClass(this));
    GLog.w(Messages.get$Object$String$ObjectArr(this, 'inscribed', []), []);
    armor.inscribe$();
    Item.curUser.sprite_.operate$int(Item.curUser.pos);
    Item.curUser.sprite_.centerEmitter().start(PurpleParticle.BURST, Math.fround(0.05), 10);
    Enchanting.show(Item.curUser, armor);
    Sample.INSTANCE.play$Object(Assets$Sounds.BURNING);
    Item.curUser.spend(Stylus.TIME_TO_INSCRIBE);
    Item.curUser.busy();
  }
  value(): number {
    return Math.imul(30, this.quantity);
  }
}

let $Stylus$1: any = null;
/** An anonymous class (Stylus.java:118). */
function Stylus$1(): any {
  return $Stylus$1 ??= $J.local(class extends WndBag$ItemSelector {
    textPrompt(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(Stylus), 'prompt', []);
    }
    preferredBag(): JClass<Bag> {
      return $J.cls(Belongings$Backpack);
    }
    itemSelectable(item: Item): boolean {
      return item instanceof Armor;
    }
    onSelect(item: Item): void {
      if (item != null) {
        this.$outer.inscribe(item);
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.Stylus$1', []);
}

$J.define(Stylus, 'com.shatteredpixel.shatteredpixeldungeon.items.Stylus', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { '': '_Stylus' }, meths: { 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Belongings$Backpack = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Belongings$Backpack');
  Enchanting = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Enchanting');
  PurpleParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.PurpleParticle');
  Armor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndBag$ItemSelector = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndBag$ItemSelector');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
