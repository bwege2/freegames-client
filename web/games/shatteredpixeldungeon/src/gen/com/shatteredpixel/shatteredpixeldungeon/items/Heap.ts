// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/Heap.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, Collections, JEnum, JObject, LinkedList } from '../../../../../jre/index.ts';

let Assets$Sounds, Dungeon, Char, Wraith, Shopkeeper, CellEmitter, Speck, ElmoParticle, ShadowParticle, Dewdrop, EquipableItem, Honeypot$ShatteredPot, LostBackpack, Artifact, Bomb, ChargrilledMeat, FrozenCarpaccio, MysteryMeat, DocumentPage, Guidebook, Potion, RingOfWealth, Scroll, Wand, Dart, TippedDart, Document, Messages, GLog, Sample;

export class Heap extends JObject {
  type_: Heap$Type = null;
  pos: number = 0;
  sprite_: ItemSprite = null;
  seen: boolean = false;
  haunted: boolean = false;
  autoExplored: boolean = false;
  hidden: boolean = false;
  items_: LinkedList<Item> = null;
  static readonly POS: string = 'pos';
  static readonly SEEN: string = 'seen';
  static readonly TYPE: string = 'type';
  static readonly ITEMS: string = 'items';
  static readonly HAUNTED: string = 'haunted';
  static readonly AUTO_EXPLORED: string = 'auto_explored';
  static readonly HIDDEN: string = 'hidden';
  _Heap(): this {
    this.type_ = Heap$Type.HEAP;
    this.pos = 0;
    this.seen = false;
    this.haunted = false;
    this.autoExplored = false;
    this.hidden = false;
    this.items_ = new LinkedList();
    return this;
  }
  open(hero: Hero): void {
    switch (this.type_) {
      case Heap$Type.TOMB:
        Wraith.spawnAround$int(hero.pos);
        break;
      case Heap$Type.REMAINS:
      case Heap$Type.SKELETON:
        CellEmitter.center(this.pos).start(Speck.factory$int(Speck.RATTLE), Math.fround(0.1), 3);
        break;
      default:
    }
    if (this.haunted) {
      if (Wraith.spawnAt$int(this.pos) == null) {
        hero.sprite_.emitter().burst(ShadowParticle.CURSE, 6);
        hero.damage($J.idiv(hero.HP, 2), this);
        if (!hero.isAlive()) {
          Dungeon.fail($J.cls(Wraith));
          GLog.n(Messages.capitalize(Messages.get$Class$String$ObjectArr($J.cls(Char), 'kill', [Messages.get$Class$String$ObjectArr($J.cls(Wraith), 'name', [])])), []);
        }
      }
      Sample.INSTANCE.play$Object(Assets$Sounds.CURSED);
    }
    this.type_ = Heap$Type.HEAP;
    let bonus = RingOfWealth.tryForBonusDrop(hero, 1);
    if (bonus != null && !bonus.isEmpty()) {
      this.items_.addAll(0, bonus);
      RingOfWealth.showFlareForBonusDrop(this.sprite_);
    }
    this.sprite_.link$();
    this.sprite_.drop$();
  }
  setHauntedIfCursed(): Heap {
    for (const $it0 = this.items_.iterator(); $it0.hasNext(); ) {
      let item = $it0.next();
      if (item.cursed) {
        this.haunted = true;
        item.cursedKnown = true;
        break;
      }
    }
    return this;
  }
  size(): number {
    return this.items_.size();
  }
  pickUp(): Item {
    if (this.items_.isEmpty()) {
      this.destroy();
      return null;
    }
    let item = this.items_.removeFirst();
    if (this.items_.isEmpty()) {
      this.destroy();
    } else if (this.sprite_ != null) {
      this.sprite_.view$Heap(this).place(this.pos);
    }
    return item;
  }
  peek(): Item {
    return this.items_.peek();
  }
  drop(item: Item): void {
    this.hidden = false;
    if (item.stackable && this.type_ !== Heap$Type.FOR_SALE) {
      for (const $it1 = this.items_.iterator(); $it1.hasNext(); ) {
        let i = $it1.next();
        if (i.isSimilar(item)) {
          item = i.merge(item);
          break;
        }
      }
      this.items_.remove(item);
    }
    if (item.dropsDownHeap && this.type_ !== Heap$Type.FOR_SALE) {
      this.items_.add(item);
    } else if (this.peek() instanceof LostBackpack) {
      this.items_.add(1, item);
    } else {
      this.items_.addFirst(item);
    }
    if (this.sprite_ != null) {
      this.sprite_.view$Heap(this).place(this.pos);
    }
    if (TippedDart.lostDarts > 0) {
      let d = new Dart()._Dart();
      d.quantity$int(TippedDart.lostDarts);
      TippedDart.lostDarts = 0;
      this.drop(d);
    }
  }
  replace(a: Item, b: Item): void {
    this.hidden = false;
    let index = this.items_.indexOf(a);
    if (index !== -1) {
      this.items_.removeAt(index);
      for (const $it2 = this.items_.iterator(); $it2.hasNext(); ) {
        let i = $it2.next();
        if (i.isSimilar(b)) {
          i.merge(b);
          return;
        }
      }
      this.items_.add(index, b);
    }
  }
  remove(a: Item): void {
    this.hidden = false;
    this.items_.remove(a);
    if (this.items_.isEmpty()) {
      this.destroy();
    } else if (this.sprite_ != null) {
      this.sprite_.view$Heap(this).place(this.pos);
    }
  }
  burn(): void {
    this.hidden = false;
    if (this.type_ !== Heap$Type.HEAP) {
      return;
    }
    let burnt = false;
    let evaporated = false;
    for (let item of $J.toArrayInto(this.items_.toArray(), $J.newArray(0, null))) {
      if (item instanceof Scroll && !item.unique) {
        this.items_.remove(item);
        burnt = true;
      } else if (item instanceof Dewdrop) {
        this.items_.remove(item);
        evaporated = true;
      } else if (item instanceof MysteryMeat || item instanceof FrozenCarpaccio) {
        this.replace(item, ChargrilledMeat.cook(item.quantity));
        burnt = true;
      } else if (item instanceof Bomb) {
        this.items_.remove(item);
        (item).explode(this.pos);
        if ((item).explodesDestructively()) {
          return;
        } else {
          burnt = true;
        }
      }
    }
    if (burnt || evaporated) {
      if (Dungeon.level.heroFOV[this.pos]) {
        if (burnt) {
          Heap.burnFX(this.pos);
        } else {
          Heap.evaporateFX(this.pos);
        }
      }
      if (this.isEmpty()) {
        this.destroy();
      } else if (this.sprite_ != null) {
        this.sprite_.view$Heap(this).place(this.pos);
      }
    }
  }
  explode(): void {
    this.hidden = false;
    if (this.type_ === Heap$Type.CHEST || this.type_ === Heap$Type.SKELETON) {
      this.type_ = Heap$Type.HEAP;
      this.sprite_.link$();
      this.sprite_.drop$();
      return;
    }
    if (this.type_ !== Heap$Type.HEAP) {
      return;
    } else {
      for (let item of $J.toArrayInto(this.items_.toArray(), $J.newArray(0, null))) {
        if (item.unique || item.isUpgradable() || item instanceof EquipableItem) {
          continue;
        }
        if (item instanceof Potion) {
          this.items_.remove(item);
          (item).shatter(this.pos);
        } else if (item instanceof Honeypot$ShatteredPot) {
          this.items_.remove(item);
          (item).destroyPot(this.pos);
        } else if (item instanceof Bomb) {
          this.items_.remove(item);
          (item).explode(this.pos);
          if ((item).explodesDestructively()) {
            return;
          }
        } else {
          this.items_.remove(item);
        }
      }
      if (this.isEmpty()) {
        this.destroy();
      } else if (this.sprite_ != null) {
        this.sprite_.view$Heap(this).place(this.pos);
      }
    }
  }
  freeze(): void {
    if (this.type_ !== Heap$Type.HEAP) {
      return;
    }
    let frozen = false;
    for (let item of $J.toArrayInto(this.items_.toArray(), $J.newArray(0, null))) {
      if (item instanceof MysteryMeat) {
        this.replace(item, FrozenCarpaccio.cook(item));
        frozen = true;
      } else if (item instanceof Potion && !item.unique) {
        this.items_.remove(item);
        (item).shatter(this.pos);
        frozen = true;
      } else if (item instanceof Bomb && (item).fuse != null) {
        frozen = frozen || (item).fuse.freeze();
      }
    }
    if (frozen) {
      if (this.isEmpty()) {
        this.destroy();
      } else if (this.sprite_ != null) {
        this.sprite_.view$Heap(this).place(this.pos);
      }
    }
  }
  static burnFX(pos: number): void {
    CellEmitter.get(pos).burst(ElmoParticle.FACTORY, 6);
    Sample.INSTANCE.play$Object(Assets$Sounds.BURNING);
  }
  static evaporateFX(pos: number): void {
    CellEmitter.get(pos).burst(Speck.factory$int(Speck.STEAM), 5);
  }
  isEmpty(): boolean {
    return this.items_ == null || this.items_.size() === 0;
  }
  destroy(): void {
    Dungeon.level.heaps.remove(this.pos);
    if (this.sprite_ != null) {
      this.sprite_.kill();
    }
    this.items_.clear();
  }
  title(): string {
    {
      let i: Item;
      switch (this.type_) {
        case Heap$Type.FOR_SALE:
          i = this.peek();
          if (this.size() === 1) {
            return Messages.get$Object$String$ObjectArr(this, 'for_sale', [Shopkeeper.sellPrice(i), i.title()]);
          } else {
            return i.title();
          }
        case Heap$Type.CHEST:
          return Messages.get$Object$String$ObjectArr(this, 'chest', []);
        case Heap$Type.LOCKED_CHEST:
          return Messages.get$Object$String$ObjectArr(this, 'locked_chest', []);
        case Heap$Type.CRYSTAL_CHEST:
          return Messages.get$Object$String$ObjectArr(this, 'crystal_chest', []);
        case Heap$Type.TOMB:
          return Messages.get$Object$String$ObjectArr(this, 'tomb', []);
        case Heap$Type.SKELETON:
          return Messages.get$Object$String$ObjectArr(this, 'skeleton', []);
        case Heap$Type.REMAINS:
          return Messages.get$Object$String$ObjectArr(this, 'remains', []);
        default:
          return this.peek().title();
      }
    }
  }
  info(): string {
    switch (this.type_) {
      case Heap$Type.CHEST:
        return Messages.get$Object$String$ObjectArr(this, 'chest_desc', []);
      case Heap$Type.LOCKED_CHEST:
        return Messages.get$Object$String$ObjectArr(this, 'locked_chest_desc', []);
      case Heap$Type.CRYSTAL_CHEST:
        if (this.peek() instanceof Artifact) {
          return Messages.get$Object$String$ObjectArr(this, 'crystal_chest_desc', [Messages.get$Object$String$ObjectArr(this, 'artifact', [])]);
        } else if (this.peek() instanceof Wand) {
          return Messages.get$Object$String$ObjectArr(this, 'crystal_chest_desc', [Messages.get$Object$String$ObjectArr(this, 'wand', [])]);
        } else {
          return Messages.get$Object$String$ObjectArr(this, 'crystal_chest_desc', [Messages.get$Object$String$ObjectArr(this, 'ring', [])]);
        }
      case Heap$Type.TOMB:
        return Messages.get$Object$String$ObjectArr(this, 'tomb_desc', []);
      case Heap$Type.SKELETON:
        return Messages.get$Object$String$ObjectArr(this, 'skeleton_desc', []);
      case Heap$Type.REMAINS:
        return Messages.get$Object$String$ObjectArr(this, 'remains_desc', []);
      default:
        return this.peek().info();
    }
  }
  restoreFromBundle(bundle: Bundle): void {
    this.pos = bundle.getInt(Heap.POS);
    this.seen = bundle.getBoolean(Heap.SEEN);
    this.type_ = Heap$Type.valueOf(bundle.getString(Heap.TYPE));
    this.items_ = new LinkedList((bundle.getCollection(Heap.ITEMS)));
    this.items_.removeAll(Collections.singleton(null));
    for (let item of $J.toArrayInto(this.items_.toArray(), $J.newArray(0, null))) {
      if (item instanceof DocumentPage && (!(item).document().pageNames().contains((item).page$()) || (item).document().isPageFound$String((item).page$()))) {
        this.items_.remove(item);
      }
      if (item instanceof Guidebook && Document.ADVENTURERS_GUIDE.isPageRead$int(0)) {
        this.items_.remove(item);
      }
    }
    this.haunted = bundle.getBoolean(Heap.HAUNTED);
    this.autoExplored = bundle.getBoolean(Heap.AUTO_EXPLORED);
    this.hidden = bundle.getBoolean(Heap.HIDDEN);
  }
  storeInBundle(bundle: Bundle): void {
    bundle.put$String$int(Heap.POS, this.pos);
    bundle.put$String$boolean(Heap.SEEN, this.seen);
    bundle.put$String$Enum(Heap.TYPE, this.type_);
    bundle.put$String$Collection(Heap.ITEMS, this.items_);
    bundle.put$String$boolean(Heap.HAUNTED, this.haunted);
    bundle.put$String$boolean(Heap.AUTO_EXPLORED, this.autoExplored);
    bundle.put$String$boolean(Heap.HIDDEN, this.hidden);
  }
}

export class Heap$Type extends JEnum {
  static HEAP: Heap$Type = null;
  static FOR_SALE: Heap$Type = null;
  static CHEST: Heap$Type = null;
  static LOCKED_CHEST: Heap$Type = null;
  static CRYSTAL_CHEST: Heap$Type = null;
  static TOMB: Heap$Type = null;
  static SKELETON: Heap$Type = null;
  static REMAINS: Heap$Type = null;
  static $VALUES: Heap$Type[] = null;
  _Heap$Type($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Heap$Type[] { return Heap$Type.$VALUES.slice(); }
  static valueOf(name: string): Heap$Type { return $J.enumValueOf(Heap$Type, name); }
  static $clinit() {
    Heap$Type.HEAP = new Heap$Type()._Heap$Type('HEAP', 0);
    Heap$Type.FOR_SALE = new Heap$Type()._Heap$Type('FOR_SALE', 1);
    Heap$Type.CHEST = new Heap$Type()._Heap$Type('CHEST', 2);
    Heap$Type.LOCKED_CHEST = new Heap$Type()._Heap$Type('LOCKED_CHEST', 3);
    Heap$Type.CRYSTAL_CHEST = new Heap$Type()._Heap$Type('CRYSTAL_CHEST', 4);
    Heap$Type.TOMB = new Heap$Type()._Heap$Type('TOMB', 5);
    Heap$Type.SKELETON = new Heap$Type()._Heap$Type('SKELETON', 6);
    Heap$Type.REMAINS = new Heap$Type()._Heap$Type('REMAINS', 7);
    Heap$Type.$VALUES = [Heap$Type.HEAP, Heap$Type.FOR_SALE, Heap$Type.CHEST, Heap$Type.LOCKED_CHEST, Heap$Type.CRYSTAL_CHEST, Heap$Type.TOMB, Heap$Type.SKELETON, Heap$Type.REMAINS];
  }
}

$J.define(Heap, 'com.shatteredpixel.shatteredpixeldungeon.items.Heap', { kind: 'class', ifaces: ['com.watabou.utils.Bundlable'], sup: 'java.lang.Object', ctors: { '': '_Heap' } });
$J.define(Heap$Type, 'com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Heap$Type' }, clinit: true, lazy: ['$VALUES', 'HEAP', 'FOR_SALE', 'CHEST', 'LOCKED_CHEST', 'CRYSTAL_CHEST', 'TOMB', 'SKELETON', 'REMAINS'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Wraith = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Wraith');
  Shopkeeper = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Shopkeeper');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  ElmoParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ElmoParticle');
  ShadowParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShadowParticle');
  Dewdrop = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Dewdrop');
  EquipableItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.EquipableItem');
  Honeypot$ShatteredPot = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Honeypot$ShatteredPot');
  LostBackpack = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.LostBackpack');
  Artifact = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact');
  Bomb = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bombs.Bomb');
  ChargrilledMeat = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.ChargrilledMeat');
  FrozenCarpaccio = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.FrozenCarpaccio');
  MysteryMeat = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.MysteryMeat');
  DocumentPage = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.journal.DocumentPage');
  Guidebook = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.journal.Guidebook');
  Potion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.Potion');
  RingOfWealth = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfWealth');
  Scroll = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.Scroll');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  Dart = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.Dart');
  TippedDart = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.TippedDart');
  Document = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Document');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
