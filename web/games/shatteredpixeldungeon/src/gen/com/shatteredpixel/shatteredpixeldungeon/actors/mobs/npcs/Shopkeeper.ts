// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/npcs/Shopkeeper.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, JObject, JString } from '../../../../../../../jre/index.ts';
import { NPC } from './NPC.ts';

let Dungeon, Statistics, Actor, Char$Property, AscensionChallenge, BlobImmunity, Buff, Buff$buffType, CellEmitter, Speck, ElmoParticle, Heap, Heap$Type, Armor, MissileWeapon, MissileWeapon$UpgradedSetTracker, Notes, Notes$Landmark, Messages, GameScene, PixelScene, ItemSprite, ShopkeeperSprite, CurrencyIndicator, GLog, WndBag$ItemSelector, WndOptions, WndTitledMessage, WndTradeItem, Game, BArray, PathFinder;

export class Shopkeeper extends NPC {
  static MAX_BUYBACK_HISTORY: number = 0;
  buybackItems: ArrayList<Item> = null;
  turnsSinceHarmed: number = 0;
  static itemSelector: WndBag$ItemSelector = null;
  static BUYBACK_ITEMS: string = null;
  static TURNS_SINCE_HARMED: string = null;
  _Shopkeeper(): this {
    this._NPC();
    this.spriteClass = $J.cls(ShopkeeperSprite);
    this.properties_.add(Char$Property.IMMOVABLE);
    this.buybackItems = new ArrayList();
    this.turnsSinceHarmed = -1;
    return this;
  }
  landmark(): Notes$Landmark {
    return Notes$Landmark.SHOP;
  }
  act(): boolean {
    if (this.turnsSinceHarmed >= 0) {
      this.turnsSinceHarmed++;
    }
    this.sprite_.turnTo(this.pos, Dungeon.hero.pos);
    this.spend(Actor.TICK);
    return super.act();
  }
  damage(dmg: number, src: any): void {
    this.processHarm();
  }
  add(buff: Buff): boolean {
    if (buff.type_ === Buff$buffType.NEGATIVE) {
      this.processHarm();
    }
    return false;
  }
  processHarm(): void {
    if (!Dungeon.level.heroFOV[this.pos]) {
      return;
    }
    if (this.turnsSinceHarmed === -1) {
      this.turnsSinceHarmed = 0;
      this.yell(Messages.get$Object$String$ObjectArr(this, 'warn', []));
      Actor.add$Actor(new (Shopkeeper$1())().$o(this)._Actor().$init_anon());
    } else if (this.turnsSinceHarmed >= 1) {
      this.flee();
    }
  }
  flee(): void {
    this.destroy();
    Notes.remove$Landmark(this.landmark());
    GLog.newLine();
    GLog.n(Messages.get$Object$String$ObjectArr(this, 'flee', []), []);
    if (this.sprite_ != null) {
      this.sprite_.killAndErase();
      CellEmitter.get(this.pos).burst(ElmoParticle.FACTORY, 6);
    }
  }
  destroy(): void {
    super.destroy();
    for (const $it2 = Dungeon.level.heaps.valueList().iterator(); $it2.hasNext(); ) {
      let heap = $it2.next();
      if (heap.type_ === Heap$Type.FOR_SALE) {
        if (Game.scene() instanceof GameScene) {
          CellEmitter.get(heap.pos).burst(ElmoParticle.FACTORY, 4);
        }
        if (heap.size() === 1) {
          heap.destroy();
        } else {
          heap.items_.removeAt((heap.size() - 1) | 0);
          heap.type_ = Heap$Type.HEAP;
        }
      }
    }
  }
  reset(): boolean {
    return true;
  }
  static sellPrice(item: Item): number {
    return Math.imul(Math.imul(item.value(), 5), (($J.idiv(Dungeon.depth, 5) + 1) | 0));
  }
  static sell(): WndBag {
    return GameScene.selectItem(Shopkeeper.itemSelector);
  }
  static canSell(item: Item): boolean {
    if (item.value() <= 0) {
      return false;
    }
    if (item.unique && !item.stackable) {
      return false;
    }
    if (item instanceof Armor && (item).checkSeal() != null) {
      return false;
    }
    if (item.isEquipped(Dungeon.hero) && item.cursed) {
      return false;
    }
    return true;
  }
  interact(c: Char): boolean {
    if (c !== Dungeon.hero) {
      return true;
    }
    Game.runOnRenderThread(new (Shopkeeper$3())().$o(this));
    return true;
  }
  chatText(): string {
    if (Dungeon.hero.buff($J.cls(AscensionChallenge)) != null) {
      return Messages.get$Object$String$ObjectArr(this, 'talk_ascent', []);
    }
    switch (Dungeon.depth) {
      case 6:
      default:
        return Messages.get$Object$String$ObjectArr(this, 'talk_prison_intro', []) + '\n\n' + (Messages.get$Object$String$ObjectArr(this, 'talk_prison_' + Dungeon.hero.heroClass.name(), []));
      case 11:
        return Messages.get$Object$String$ObjectArr(this, 'talk_caves', []);
      case 16:
        return Messages.get$Object$String$ObjectArr(this, 'talk_city', []);
      case 20:
        return Messages.get$Object$String$ObjectArr(this, 'talk_halls', []);
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$Collection(Shopkeeper.BUYBACK_ITEMS, this.buybackItems);
    bundle.put$String$int(Shopkeeper.TURNS_SINCE_HARMED, this.turnsSinceHarmed);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.buybackItems.clear();
    if (bundle.contains(Shopkeeper.BUYBACK_ITEMS)) {
      for (const $it4 = bundle.getCollection(Shopkeeper.BUYBACK_ITEMS).iterator(); $it4.hasNext(); ) {
        let i = $it4.next();
        this.buybackItems.add(i);
      }
    }
    this.turnsSinceHarmed = bundle.contains(Shopkeeper.TURNS_SINCE_HARMED) ? bundle.getInt(Shopkeeper.TURNS_SINCE_HARMED) : -1;
  }
  static $clinit() {
    Shopkeeper.MAX_BUYBACK_HISTORY = 3;
    Shopkeeper.itemSelector = new (Shopkeeper$2())()._WndBag$ItemSelector();
    Shopkeeper.BUYBACK_ITEMS = 'buyback_items';
    Shopkeeper.TURNS_SINCE_HARMED = 'turns_since_harmed';
  }
}

let $Shopkeeper$1: any = null;
/** An anonymous class (Shopkeeper.java:117). */
function Shopkeeper$1(): any {
  return $Shopkeeper$1 ??= $J.local(class extends Actor {
    $init_anon() {
      this.actPriority = Actor.VFX_PRIO;
      return this;
    }
    act(): boolean {
      let blobs = new ArrayList();
      for (const $it0 = new BlobImmunity()._BlobImmunity().immunities().iterator(); $it0.hasNext(); ) {
        let c = $it0.next();
        let b = Dungeon.level.blobs.get(c);
        if (b != null && b.volume_ > 0) {
          blobs.add(b);
        }
      }
      PathFinder.buildDistanceMap$int$booleanArr$int(this.$outer.pos, BArray.not(Dungeon.level.solid, null), 4);
      for (let i = 0; i < Dungeon.level.length(); i++) {
        if (PathFinder.distance[i] < 2147483647) {
          let affected = false;
          for (const $it1 = blobs.iterator(); $it1.hasNext(); ) {
            let blob = $it1.next();
            if (blob.cur[i] > 0) {
              blob.clear(i);
              affected = true;
            }
          }
          if (affected && Dungeon.level.heroFOV[i]) {
            CellEmitter.get(i).burst(Speck.factory$int(Speck.DISCOVER), 2);
          }
        }
      }
      Actor.remove(this);
      return true;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Shopkeeper$1', []);
}

let $Shopkeeper$3$1: any = null;
/** An anonymous class (Shopkeeper.java:256). */
function Shopkeeper$3$1(): any {
  return $Shopkeeper$3$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      super.onSelect(index);
      if (index === 0) {
        Shopkeeper.sell();
      } else if (index === 1) {
        GameScene.show(new WndTitledMessage()._WndTitledMessage$Image$String$String(this.$outer.$outer.sprite(), Messages.titleCase(this.$outer.$outer.name()), this.$outer.$outer.chatText()));
      } else if (index > 1) {
        GLog.i(Messages.get$Object$String$ObjectArr(this.$outer.$outer, 'buyback', []), []);
        let returned = this.$outer.$outer.buybackItems.removeAt((index - 2) | 0);
        Dungeon.gold = (Dungeon.gold - returned.value()) | 0;
        Statistics.goldCollected = (Statistics.goldCollected - returned.value()) | 0;
        if (returned instanceof MissileWeapon && returned.isUpgradable()) {
          Buff.affect$Char$Class(Dungeon.hero, $J.cls(MissileWeapon$UpgradedSetTracker)).levelThresholds.put((returned).setID, returned.level$());
        }
        if (!returned.doPickUp$Hero(Dungeon.hero)) {
          Dungeon.level.drop(returned, Dungeon.hero.pos);
        }
      }
    }
    enabled(index: number): boolean {
      if (index > 1) {
        return Dungeon.gold >= this.$outer.$outer.buybackItems.get((index - 2) | 0).value();
      } else {
        return super.enabled(index);
      }
    }
    hasIcon(index: number): boolean {
      return index > 1;
    }
    getIcon(index: number): Image {
      if (index > 1) {
        return new ItemSprite()._ItemSprite$Item(this.$outer.$outer.buybackItems.get((index - 2) | 0));
      }
      return null;
    }
    hide(): void {
      super.hide();
      CurrencyIndicator.showGold = false;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Shopkeeper$3$1', []);
}

let $Shopkeeper$3: any = null;
/** An anonymous class (Shopkeeper.java:242). */
function Shopkeeper$3(): any {
  return $Shopkeeper$3 ??= $J.local(class extends JObject {
    call(): void {
      let options = $J.newArray((2 + this.$outer.buybackItems.size()) | 0, null);
      let maxLen = PixelScene.landscape() ? 30 : 25;
      let i = 0;
      options[i++] = Messages.get$Object$String$ObjectArr(this.$outer, 'sell', []);
      options[i++] = Messages.get$Object$String$ObjectArr(this.$outer, 'talk', []);
      for (const $it3 = this.$outer.buybackItems.iterator(); $it3.hasNext(); ) {
        let item = $it3.next();
        options[i] = Messages.get$Class$String$ObjectArr($J.cls(Heap), 'for_sale', [item.value(), Messages.titleCase(item.title())]);
        if (options[i].length > maxLen) {
          options[i] = options[i].substring(0, (maxLen - 3) | 0) + '...';
        }
        i++;
      }
      CurrencyIndicator.showGold = true;
      GameScene.show(new (Shopkeeper$3$1())().$o(this)._WndOptions$Image$String$String$StringArr(this.$outer.sprite(), Messages.titleCase(this.$outer.name()), this.$outer.description(), options));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Shopkeeper$3', ['com.watabou.utils.Callback']);
}

let $Shopkeeper$2: any = null;
/** An anonymous class (Shopkeeper.java:217). */
function Shopkeeper$2(): any {
  return $Shopkeeper$2 ??= $J.local(class extends WndBag$ItemSelector {
    textPrompt(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(Shopkeeper), 'sell', []);
    }
    itemSelectable(item: Item): boolean {
      return Shopkeeper.canSell(item);
    }
    onSelect(item: Item): void {
      if (item != null && Dungeon.hero != null && Dungeon.hero.isAlive()) {
        let parentWnd = Shopkeeper.sell();
        GameScene.show(new WndTradeItem()._WndTradeItem$Item$WndBag(item, parentWnd));
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Shopkeeper$2', []);
}

$J.define(Shopkeeper, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Shopkeeper', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.NPC', ctors: { '': '_Shopkeeper' }, clinit: true, lazy: ['MAX_BUYBACK_HISTORY', 'itemSelector', 'BUYBACK_ITEMS', 'TURNS_SINCE_HARMED'] });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  AscensionChallenge = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AscensionChallenge');
  BlobImmunity = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.BlobImmunity');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  ElmoParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ElmoParticle');
  Heap = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  Armor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor');
  MissileWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon');
  MissileWeapon$UpgradedSetTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon$UpgradedSetTracker');
  Notes = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes');
  Notes$Landmark = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes$Landmark');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  ShopkeeperSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ShopkeeperSprite');
  CurrencyIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.CurrencyIndicator');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndBag$ItemSelector = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndBag$ItemSelector');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  WndTitledMessage = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndTitledMessage');
  WndTradeItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndTradeItem');
  Game = $J.load('com.watabou.noosa.Game');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
});
