// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/LiquidMetal.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Recipe } from './Recipe.ts';

let Assets$Sounds, Dungeon, Buff, Speck, Splash, MagicalHolster, Potion, MissileWeapon, MissileWeapon$UpgradedSetTracker, Dart, Catalog, Terrain, Messages, GameScene, ItemSpriteSheet, GLog, WndBag$ItemSelector, Sample;

export class LiquidMetal extends Item {
  static readonly AC_APPLY: string = 'APPLY';
  itemSelector: WndBag$ItemSelector = null;
  _LiquidMetal(): this {
    this._Item();
    this.image_ = ItemSpriteSheet.LIQUID_METAL;
    this.stackable = true;
    this.defaultAction_ = LiquidMetal.AC_APPLY;
    this.bones = true;
    this.itemSelector = new (LiquidMetal$1())().$o(this)._WndBag$ItemSelector();
    return this;
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    actions.add(LiquidMetal.AC_APPLY);
    return actions;
  }
  execute$Hero$String(hero: Hero, action: string): void {
    super.execute$Hero$String(hero, action);
    if ($J.equals(action, LiquidMetal.AC_APPLY)) {
      Item.curUser = hero;
      GameScene.selectItem(this.itemSelector);
    }
  }
  onThrow(cell: number): void {
    if (Dungeon.level.map_[cell] === Terrain.WELL || Dungeon.level.pit[cell]) {
      super.onThrow(cell);
    } else {
      Dungeon.level.pressCell$int(cell);
      if (Dungeon.level.heroFOV[cell]) {
        GLog.i(Messages.get$Class$String$ObjectArr($J.cls(Potion), 'shatter', []), []);
        Sample.INSTANCE.play$Object(Assets$Sounds.SHATTER);
        Splash.at$int$int$int(cell, 12566463, 5);
      }
    }
  }
  isUpgradable(): boolean {
    return false;
  }
  isIdentified(): boolean {
    return true;
  }
  value(): number {
    return this.quantity;
  }
}

export class LiquidMetal$Recipe extends Recipe {
  _LiquidMetal$Recipe(): this {
    this._Recipe();
    return this;
  }
  testIngredients(ingredients: ArrayList<Item>): boolean {
    return ingredients.size() === 1 && ingredients.get(0) instanceof MissileWeapon && ingredients.get(0).cursedKnown && !ingredients.get(0).cursed;
  }
  cost(ingredients: ArrayList<Item>): number {
    return 3;
  }
  brew(ingredients: ArrayList<Item>): Item {
    let result = this.sampleOutput(ingredients);
    let m = ingredients.get(0);
    if (!m.levelKnown) {
      result.quantity$int(this.metalQuantity(m));
    }
    m.quantity$int(0);
    Buff.affect$Char$Class(Dungeon.hero, $J.cls(MissileWeapon$UpgradedSetTracker)).levelThresholds.put(m.setID, 2147483647);
    return result;
  }
  sampleOutput(ingredients: ArrayList<Item>): Item {
    let m = ingredients.get(0);
    if (m.levelKnown) {
      return new LiquidMetal()._LiquidMetal().quantity$int(this.metalQuantity(m));
    } else {
      return new LiquidMetal()._LiquidMetal();
    }
  }
  metalQuantity(m: MissileWeapon): number {
    let quantityPerWeapon = Math.fround(Math.imul(5, ((m.tier_ + 1) | 0)));
    if (m.defaultQuantity() !== 3) {
      quantityPerWeapon = Math.fround(3 / m.defaultQuantity());
    }
    quantityPerWeapon = Math.fround(quantityPerWeapon * $J.pow(Math.fround(1.35), Math.min(5, m.level$())));
    let quantity = Math.fround((m.quantity$() - 1) | 0);
    quantity = Math.fround(quantity + Math.fround(0.25 + Math.fround(Math.fround(0.0075) * m.durabilityLeft())));
    return $J.roundf(Math.fround(quantity * quantityPerWeapon));
  }
}

let $LiquidMetal$1: any = null;
/** An anonymous class (LiquidMetal.java:115). */
function LiquidMetal$1(): any {
  return $LiquidMetal$1 ??= $J.local(class extends WndBag$ItemSelector {
    textPrompt(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(LiquidMetal), 'prompt', []);
    }
    preferredBag(): JClass<Bag> {
      return $J.cls(MagicalHolster);
    }
    itemSelectable(item: Item): boolean {
      return item instanceof MissileWeapon && !(item instanceof Dart);
    }
    onSelect(item: Item): void {
      if (item != null && item instanceof MissileWeapon) {
        let m = item;
        let maxToUse = Math.fround(Math.imul(5, ((m.tier_ + 1) | 0)));
        maxToUse = Math.fround(maxToUse * $J.pow(Math.fround(1.35), m.level$()));
        let durabilityPerMetal = Math.fround(100 / maxToUse);
        let percentDurabilityLost = Math.fround(Math.fround(0.999) - (Math.fround(m.durabilityLeft() / 100)));
        let toUse = $J.d2i(Math.ceil(Math.fround(maxToUse * percentDurabilityLost)));
        if (toUse === 0 || Math.ceil(Math.fround(m.durabilityLeft() / m.durabilityPerUse$())) >= Math.ceil(Math.fround(MissileWeapon.MAX_DURABILITY / m.durabilityPerUse$()))) {
          if (m.quantity$() < m.defaultQuantity()) {
            if (Math.fround(this.$outer.quantity$() * durabilityPerMetal) >= m.durabilityPerUse$()) {
              m.quantity$int((m.quantity$() + 1) | 0);
              if (Math.ceil(maxToUse) < this.$outer.quantity$()) {
                Catalog.countUses($J.cls(LiquidMetal), $J.d2i(Math.ceil(maxToUse)));
                GLog.i(Messages.get$Class$String$ObjectArr($J.cls(LiquidMetal), 'apply', [$J.d2i(Math.ceil(maxToUse))]), []);
                this.$outer.quantity = (this.$outer.quantity - $J.d2i(Math.ceil(maxToUse))) | 0;
              } else {
                Catalog.countUses($J.cls(LiquidMetal), this.$outer.quantity$());
                m.damage(100);
                m.repair(Math.fround(Math.fround(this.$outer.quantity$() * durabilityPerMetal) - 1));
                GLog.i(Messages.get$Class$String$ObjectArr($J.cls(LiquidMetal), 'apply', [this.$outer.quantity$()]), []);
                this.$outer.detachAll(Dungeon.hero.belongings.backpack);
              }
            } else {
              GLog.w(Messages.get$Class$String$ObjectArr($J.cls(LiquidMetal), 'already_fixed', []), []);
              return;
            }
          } else {
            GLog.w(Messages.get$Class$String$ObjectArr($J.cls(LiquidMetal), 'already_fixed', []), []);
            return;
          }
        } else if (toUse < this.$outer.quantity$()) {
          Catalog.countUses($J.cls(LiquidMetal), toUse);
          m.repair(Math.fround(maxToUse * durabilityPerMetal));
          this.$outer.quantity$int((this.$outer.quantity$() - toUse) | 0);
          GLog.i(Messages.get$Class$String$ObjectArr($J.cls(LiquidMetal), 'apply', [toUse]), []);
        } else {
          Catalog.countUses($J.cls(LiquidMetal), this.$outer.quantity$());
          m.repair(Math.fround(this.$outer.quantity$() * durabilityPerMetal));
          GLog.i(Messages.get$Class$String$ObjectArr($J.cls(LiquidMetal), 'apply', [this.$outer.quantity$()]), []);
          this.$outer.detachAll(Dungeon.hero.belongings.backpack);
        }
        Item.curUser.sprite_.operate$int(Item.curUser.pos);
        Sample.INSTANCE.play$Object(Assets$Sounds.DRINK);
        Item.updateQuickslot();
        Item.curUser.sprite_.emitter().start(Speck.factory$int(Speck.LIGHT), Math.fround(0.1), 10);
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.LiquidMetal$1', []);
}

$J.define(LiquidMetal, 'com.shatteredpixel.shatteredpixeldungeon.items.LiquidMetal', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { '': '_LiquidMetal' }, meths: { 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' } });
$J.define(LiquidMetal$Recipe, 'com.shatteredpixel.shatteredpixeldungeon.items.LiquidMetal$Recipe', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Recipe', ctors: { '': '_LiquidMetal$Recipe' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Splash = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Splash');
  MagicalHolster = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bags.MagicalHolster');
  Potion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.Potion');
  MissileWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon');
  MissileWeapon$UpgradedSetTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon$UpgradedSetTracker');
  Dart = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.Dart');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndBag$ItemSelector = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndBag$ItemSelector');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
