// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/trinkets/TrinketCatalyst.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, IOException, RuntimeException } from '../../../../../../jre/index.ts';
import { Item } from '../Item.ts';
import { Recipe } from '../Recipe.ts';
import { Window } from '../../ui/Window.ts';
import { WndInfoItem } from '../../windows/WndInfoItem.ts';

let Assets$Sounds, Badges, Dungeon, Statistics, Hero, Generator, Generator$Category, Trinket$PlaceHolder, Catalog, Document, Messages, AlchemyScene, GameScene, PixelScene, ItemSprite, ItemSpriteSheet, ItemButton, RedButton, GLog, IconTitle, WndSadGhost, Game, Sample;

export class TrinketCatalyst extends Item {
  rolledTrinkets: ArrayList<Trinket> = null;
  static readonly ROLLED_TRINKETS: string = 'rolled_trinkets';
  _TrinketCatalyst(): this {
    this._Item();
    this.image_ = ItemSpriteSheet.TRINKET_CATA;
    this.unique = true;
    this.rolledTrinkets = new ArrayList();
    return this;
  }
  isIdentified(): boolean {
    return true;
  }
  isUpgradable(): boolean {
    return false;
  }
  doPickUp$Hero$int(hero: Hero, pos: number): boolean {
    if (super.doPickUp$Hero$int(hero, pos)) {
      if (!Document.ADVENTURERS_GUIDE.isPageRead$String(Document.GUIDE_ALCHEMY)) {
        GameScene.flashForDocument(Document.ADVENTURERS_GUIDE, Document.GUIDE_ALCHEMY);
      }
      return true;
    } else {
      return false;
    }
  }
  hasRolledTrinkets(): boolean {
    return !this.rolledTrinkets.isEmpty();
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    if (!this.rolledTrinkets.isEmpty()) {
      bundle.put$String$Collection(TrinketCatalyst.ROLLED_TRINKETS, this.rolledTrinkets);
    }
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.rolledTrinkets.clear();
    if (bundle.contains(TrinketCatalyst.ROLLED_TRINKETS)) {
      this.rolledTrinkets.addAll((bundle.getCollection(TrinketCatalyst.ROLLED_TRINKETS)));
    }
  }
}

export class TrinketCatalyst$Recipe extends Recipe {
  _TrinketCatalyst$Recipe(): this {
    this._Recipe();
    return this;
  }
  testIngredients(ingredients: ArrayList<Item>): boolean {
    return ingredients.size() === 1 && ingredients.get(0) instanceof TrinketCatalyst;
  }
  cost(ingredients: ArrayList<Item>): number {
    return 6;
  }
  brew(ingredients: ArrayList<Item>): Item {
    let newCata = ingredients.get(0).duplicate();
    newCata.collect$();
    ingredients.get(0).quantity$int(0);
    Game.scene().addToFront(new TrinketCatalyst$WndTrinket()._TrinketCatalyst$WndTrinket(newCata));
    try {
      Dungeon.saveAll();
    } catch ($e0) {
      if ($J.isa($e0, IOException)) {
        let e = $J.exc($e0);
        throw new RuntimeException(e);
      } else {
        throw $e0;
      }
    }
    return null;
  }
  sampleOutput(ingredients: ArrayList<Item>): Item {
    return new Trinket$PlaceHolder()._Trinket$PlaceHolder();
  }
}

export class TrinketCatalyst$RandomTrinket extends Item {
  _TrinketCatalyst$RandomTrinket(): this {
    this._Item();
    this.image_ = ItemSpriteSheet.SOMETHING;
    return this;
  }
}

export class TrinketCatalyst$WndTrinket extends Window {
  static readonly WIDTH: number = 120;
  static readonly BTN_SIZE: number = 24;
  static readonly BTN_GAP: number = 4;
  static readonly GAP: number = 2;
  static readonly NUM_TRINKETS: number = 4;
  _TrinketCatalyst$WndTrinket(cata: TrinketCatalyst): this {
    this._Window$();
    let titlebar = new IconTitle()._IconTitle$();
    titlebar.icon(new ItemSprite()._ItemSprite$Item(cata));
    titlebar.label$String(Messages.titleCase(Messages.get$Class$String$ObjectArr($J.cls(TrinketCatalyst), 'window_title', [])));
    titlebar.setRect(0, 0, Math.fround(TrinketCatalyst$WndTrinket.WIDTH), 0);
    this.add$Gizmo(titlebar);
    let message = PixelScene.renderTextBlock$String$int(Messages.get$Class$String$ObjectArr($J.cls(TrinketCatalyst), 'window_text', []), 6);
    message.maxWidth$int(TrinketCatalyst$WndTrinket.WIDTH);
    message.setPos(0, Math.fround(titlebar.bottom() + TrinketCatalyst$WndTrinket.GAP));
    this.add$Gizmo(message);
    while (cata.rolledTrinkets.size() < TrinketCatalyst$WndTrinket.NUM_TRINKETS) {
      cata.rolledTrinkets.add(Generator.random$Category(Generator$Category.TRINKET));
    }
    for (let i = 0; i < TrinketCatalyst$WndTrinket.NUM_TRINKETS; i++) {
      let btnReward = new (TrinketCatalyst$WndTrinket$1())().$o(this)._ItemButton();
      btnReward.item$Item(cata.rolledTrinkets.get(i));
      btnReward.setRect(Math.fround(($J.idiv(Math.imul(((i + 1) | 0), ((TrinketCatalyst$WndTrinket.WIDTH - TrinketCatalyst$WndTrinket.BTN_GAP) | 0)), TrinketCatalyst$WndTrinket.NUM_TRINKETS) - TrinketCatalyst$WndTrinket.BTN_SIZE) | 0), Math.fround(Math.fround(message.top() + message.height()) + TrinketCatalyst$WndTrinket.BTN_GAP), Math.fround(TrinketCatalyst$WndTrinket.BTN_SIZE), Math.fround(TrinketCatalyst$WndTrinket.BTN_SIZE));
      this.add$Gizmo(btnReward);
    }
    this.resize(TrinketCatalyst$WndTrinket.WIDTH, $J.d2i((Math.fround(Math.fround(Math.fround(message.top() + message.height()) + Math.imul(2, TrinketCatalyst$WndTrinket.BTN_GAP)) + TrinketCatalyst$WndTrinket.BTN_SIZE))));
    return this;
  }
  onBackPressed(): void {
  }
}

export class TrinketCatalyst$WndTrinket$RewardWindow extends WndInfoItem {
  _TrinketCatalyst$WndTrinket$RewardWindow(item: Item): this {
    this._WndInfoItem$Item(item);
    let btnConfirm = new (TrinketCatalyst$WndTrinket$RewardWindow$1())().$o(this).$c(item)._RedButton$String(Messages.get$Class$String$ObjectArr($J.cls(WndSadGhost), 'confirm', []));
    btnConfirm.setRect(0, Math.fround((this.height_ + 2) | 0), Math.fround(($J.idiv(this.width_, 2) - 1) | 0), 16);
    this.add$Gizmo(btnConfirm);
    let btnCancel = new (TrinketCatalyst$WndTrinket$RewardWindow$2())().$o(this)._RedButton$String(Messages.get$Class$String$ObjectArr($J.cls(WndSadGhost), 'cancel', []));
    btnCancel.setRect(Math.fround(btnConfirm.right() + 2), Math.fround((this.height_ + 2) | 0), btnConfirm.width(), 16);
    this.add$Gizmo(btnCancel);
    this.resize(this.width_, $J.d2i(btnCancel.bottom()));
    return this;
  }
}

let $TrinketCatalyst$WndTrinket$1: any = null;
/** An anonymous class (TrinketCatalyst.java:182). */
function TrinketCatalyst$WndTrinket$1(): any {
  return $TrinketCatalyst$WndTrinket$1 ??= $J.local(class extends ItemButton {
    onClick(): void {
      Game.scene().addToFront(new TrinketCatalyst$WndTrinket$RewardWindow().$o(this.$outer)._TrinketCatalyst$WndTrinket$RewardWindow(this.item$()));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.TrinketCatalyst$WndTrinket$1', []);
}

let $TrinketCatalyst$WndTrinket$RewardWindow$1: any = null;
/** An anonymous class (TrinketCatalyst.java:208). */
function TrinketCatalyst$WndTrinket$RewardWindow$1(): any {
  return $TrinketCatalyst$WndTrinket$RewardWindow$1 ??= $J.local(class extends RedButton {
    onClick(): void {
      this.$outer.hide();
      this.$outer.$outer.hide();
      let result = this.$cv_item;
      if (result instanceof TrinketCatalyst$RandomTrinket) {
        result = Generator.random$Category(Generator$Category.TRINKET);
      }
      let cata = Dungeon.hero.belongings.getItem($J.cls(TrinketCatalyst));
      if (cata != null) {
        cata.detach(Dungeon.hero.belongings.backpack);
        Catalog.countUse(cata.getClass());
        result.identify$();
        if (Game.scene() instanceof AlchemyScene) {
          (Game.scene()).craftItem(null, result);
        } else {
          Sample.INSTANCE.play$Object(Assets$Sounds.PUFF);
          if (result.doPickUp$Hero(Dungeon.hero)) {
            GLog.p(Messages.capitalize(Messages.get$Class$String$ObjectArr($J.cls(Hero), 'you_now_have', [this.$cv_item.name()])), []);
          } else {
            Dungeon.level.drop(result, Dungeon.hero.pos);
          }
          Statistics.itemsCrafted++;
          Badges.validateItemsCrafted();
          try {
            Dungeon.saveAll();
          } catch ($e1) {
            if ($J.isa($e1, IOException)) {
              let e = $J.exc($e1);
              Game.reportException(e);
            } else {
              throw $e1;
            }
          }
        }
      }
    }
    $c($item): this {
      this.$cv_item = $item;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.TrinketCatalyst$WndTrinket$RewardWindow$1', []);
}

let $TrinketCatalyst$WndTrinket$RewardWindow$2: any = null;
/** An anonymous class (TrinketCatalyst.java:251). */
function TrinketCatalyst$WndTrinket$RewardWindow$2(): any {
  return $TrinketCatalyst$WndTrinket$RewardWindow$2 ??= $J.local(class extends RedButton {
    onClick(): void {
      this.$outer.hide();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.TrinketCatalyst$WndTrinket$RewardWindow$2', []);
}

$J.define(TrinketCatalyst, 'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.TrinketCatalyst', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { '': '_TrinketCatalyst' }, meths: { 'doPickUp(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,int)': 'doPickUp$Hero$int' } });
$J.define(TrinketCatalyst$Recipe, 'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.TrinketCatalyst$Recipe', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Recipe', ctors: { '': '_TrinketCatalyst$Recipe' } });
$J.define(TrinketCatalyst$RandomTrinket, 'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.TrinketCatalyst$RandomTrinket', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { '': '_TrinketCatalyst$RandomTrinket' } });
$J.define(TrinketCatalyst$WndTrinket, 'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.TrinketCatalyst$WndTrinket', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.TrinketCatalyst': '_TrinketCatalyst$WndTrinket' } });
$J.define(TrinketCatalyst$WndTrinket$RewardWindow, 'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.TrinketCatalyst$WndTrinket$RewardWindow', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.windows.WndInfoItem', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.items.Item': '_TrinketCatalyst$WndTrinket$RewardWindow' }, inner: true });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  Trinket$PlaceHolder = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.Trinket$PlaceHolder');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Document = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Document');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  AlchemyScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.AlchemyScene');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  ItemButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ItemButton');
  RedButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RedButton');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  IconTitle = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.IconTitle');
  WndSadGhost = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndSadGhost');
  Game = $J.load('com.watabou.noosa.Game');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
