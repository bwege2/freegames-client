// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/Item.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections, JObject, JString } from '../../../../../jre/index.ts';

let Assets$Sounds, Badges, Dungeon, Statistics, Actor, Blindness, Buff, Degrade, Belongings, Talent, Talent$ImprovisedProjectileCooldown, Talent$LethalMomentumTracker, Speck, Generator$Category, Bag, MissileWeapon, Dart, TippedDart, Catalog, Notes, Ballistica, Messages, CellSelector$Listener, GameScene, MissileSprite, QuickSlotButton, Sample, Bundle, Reflection;

export class Item extends JObject {
  static readonly TXT_TO_STRING_LVL: string = '%s %+d';
  static readonly TXT_TO_STRING_X: string = '%s x%d';
  static readonly TIME_TO_THROW: number = 1;
  static readonly TIME_TO_PICK_UP: number = 1;
  static readonly TIME_TO_DROP: number = 1;
  static readonly AC_DROP: string = 'DROP';
  static readonly AC_THROW: string = 'THROW';
  defaultAction_: string = null;
  usesTargeting_: boolean = false;
  image_: number = 0;
  icon_: number = 0;
  stackable: boolean = false;
  quantity: number = 0;
  dropsDownHeap: boolean = false;
  level_: number = 0;
  levelKnown: boolean = false;
  cursed: boolean = false;
  cursedKnown: boolean = false;
  unique: boolean = false;
  keptThoughLostInvent: boolean = false;
  bones: boolean = false;
  customNoteID: number = 0;
  static itemComparator: Comparator<Item> = null;
  static readonly QUANTITY: string = 'quantity';
  static readonly LEVEL: string = 'level';
  static readonly LEVEL_KNOWN: string = 'levelKnown';
  static readonly CURSED: string = 'cursed';
  static readonly CURSED_KNOWN: string = 'cursedKnown';
  static readonly QUICKSLOT: string = 'quickslotpos';
  static readonly KEPT_LOST: string = 'kept_lost';
  static readonly CUSTOM_NOTE_ID: string = 'custom_note_id';
  static curUser: Hero = null;
  static curItem: Item = null;
  static thrower: CellSelector$Listener = null;
  _Item(): this {
    this.image_ = 0;
    this.icon_ = -1;
    this.stackable = false;
    this.quantity = 1;
    this.dropsDownHeap = false;
    this.level_ = 0;
    this.levelKnown = false;
    this.unique = false;
    this.keptThoughLostInvent = false;
    this.bones = false;
    this.customNoteID = -1;
    return this;
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = new ArrayList();
    actions.add(Item.AC_DROP);
    actions.add(Item.AC_THROW);
    return actions;
  }
  actionName(action: string, hero: Hero): string {
    return Messages.get$Object$String$ObjectArr(this, 'ac_' + action, []);
  }
  doPickUp$Hero(hero: Hero): boolean {
    return this.doPickUp$Hero$int(hero, hero.pos);
  }
  doPickUp$Hero$int(hero: Hero, pos: number): boolean {
    if (this.collect$Bag(hero.belongings.backpack)) {
      GameScene.pickUp(this, pos);
      Sample.INSTANCE.play$Object(Assets$Sounds.ITEM);
      hero.spendAndNext(this.pickupDelay());
      return true;
    } else {
      return false;
    }
  }
  doDrop(hero: Hero): void {
    hero.spendAndNext(Item.TIME_TO_DROP);
    let pos = hero.pos;
    Dungeon.level.drop(this.detachAll(hero.belongings.backpack), pos).sprite_.drop$int(pos);
  }
  reset(): void {
    this.keptThoughLostInvent = false;
  }
  keptThroughLostInventory(): boolean {
    return this.keptThoughLostInvent;
  }
  doThrow(hero: Hero): void {
    GameScene.selectCell(Item.thrower);
  }
  execute$Hero$String(hero: Hero, action: string): void {
    GameScene.cancel();
    Item.curUser = hero;
    Item.curItem = this;
    if ($J.equals(action, Item.AC_DROP)) {
      if (hero.belongings.backpack.contains(this) || this.isEquipped(hero)) {
        this.doDrop(hero);
      }
    } else if ($J.equals(action, Item.AC_THROW)) {
      if (hero.belongings.backpack.contains(this) || this.isEquipped(hero)) {
        this.doThrow(hero);
      }
    }
  }
  defaultAction(): string {
    return this.defaultAction_;
  }
  execute$Hero(hero: Hero): void {
    let action = this.defaultAction();
    if (action != null) {
      this.execute$Hero$String(hero, this.defaultAction());
    }
  }
  onThrow(cell: number): void {
    let heap = Dungeon.level.drop(this, cell);
    if (!heap.isEmpty()) {
      heap.sprite_.drop$int(cell);
    }
  }
  merge(other: Item): Item {
    if (this.isSimilar(other)) {
      this.quantity = (this.quantity + other.quantity) | 0;
      other.quantity = 0;
    }
    return this;
  }
  collect$Bag(container: Bag): boolean {
    if (this.quantity <= 0) {
      return true;
    }
    let items = container.items_;
    if (items.contains(this)) {
      return true;
    }
    for (const $it0 = items.iterator(); $it0.hasNext(); ) {
      let item = $it0.next();
      if (item instanceof Bag && (item).canHold(this)) {
        if (this.collect$Bag(item)) {
          return true;
        }
      }
    }
    if (!container.canHold(this)) {
      return false;
    }
    if (this.stackable) {
      for (const $it1 = items.iterator(); $it1.hasNext(); ) {
        let item = $it1.next();
        if (this.isSimilar(item)) {
          item.merge(this);
          Item.updateQuickslot();
          if (Dungeon.hero != null && Dungeon.hero.isAlive()) {
            Badges.validateItemLevelAquired(this);
            Talent.onItemCollected(Dungeon.hero, item);
            if (this.isIdentified()) {
              Catalog.setSeen($J.getClass(this));
              Statistics.itemTypesDiscovered.add($J.getClass(this));
            }
          }
          if (TippedDart.lostDarts > 0) {
            let d = new Dart()._Dart();
            d.quantity$int(TippedDart.lostDarts);
            TippedDart.lostDarts = 0;
            if (!d.collect$()) {
              Actor.add$Actor(new (Item$2())().$o(this).$c(d)._Actor().$init_anon());
            }
          }
          return true;
        }
      }
    }
    if (Dungeon.hero != null && Dungeon.hero.isAlive()) {
      Badges.validateItemLevelAquired(this);
      Talent.onItemCollected(Dungeon.hero, this);
      if (this.isIdentified()) {
        Catalog.setSeen($J.getClass(this));
        Statistics.itemTypesDiscovered.add($J.getClass(this));
      }
    }
    items.add(this);
    Dungeon.quickslot.replacePlaceholder(this);
    Collections.sort(items, Item.itemComparator);
    Item.updateQuickslot();
    return true;
  }
  collect$(): boolean {
    return this.collect$Bag(Dungeon.hero.belongings.backpack);
  }
  split(amount: number): Item {
    if (amount <= 0 || amount >= this.quantity$()) {
      return null;
    } else {
      let split = Reflection.newInstance($J.getClass(this));
      if (split == null) {
        return null;
      }
      let copy = new Bundle()._Bundle$();
      this.storeInBundle(copy);
      split.restoreFromBundle(copy);
      split.quantity$int(amount);
      this.quantity = (this.quantity - amount) | 0;
      return split;
    }
  }
  duplicate(): Item {
    let dupe = Reflection.newInstance($J.getClass(this));
    if (dupe == null) {
      return null;
    }
    let copy = new Bundle()._Bundle$();
    this.storeInBundle(copy);
    dupe.restoreFromBundle(copy);
    return dupe;
  }
  detach(container: Bag): Item {
    if (this.quantity <= 0) {
      return null;
    } else if (this.quantity === 1) {
      if (this.stackable) {
        Dungeon.quickslot.convertToPlaceholder(this);
      }
      return this.detachAll(container);
    } else {
      let detached = this.split(1);
      Item.updateQuickslot();
      if (detached != null) {
        detached.onDetach();
      }
      return detached;
    }
  }
  detachAll(container: Bag): Item {
    Dungeon.quickslot.clearItem(this);
    for (const $it2 = container.items_.iterator(); $it2.hasNext(); ) {
      let item = $it2.next();
      if (item === this) {
        container.items_.remove(this);
        item.onDetach();
        container.grabItems$();
        Item.updateQuickslot();
        return this;
      } else if (item instanceof Bag) {
        let bag = item;
        if (bag.contains(this)) {
          return this.detachAll(bag);
        }
      }
    }
    Item.updateQuickslot();
    return this;
  }
  isSimilar(item: Item): boolean {
    return $J.getClass(this) === item.getClass();
  }
  onDetach(): void {
  }
  trueLevel(): number {
    return this.level_;
  }
  level$(): number {
    return this.level_;
  }
  buffedLvl(): number {
    if (Dungeon.hero != null && Dungeon.hero.buff($J.cls(Degrade)) != null && (this.isEquipped(Dungeon.hero) || Dungeon.hero.belongings.contains(this))) {
      return Degrade.reduceLevel(this.level$());
    } else {
      return this.level$();
    }
  }
  level$int(value: number): Item {
    this.level_ = value;
    Item.updateQuickslot();
    return this;
  }
  upgrade$(): Item {
    this.level_++;
    Item.updateQuickslot();
    return this;
  }
  upgrade$int(n: number): Item {
    for (let i = 0; i < n; i++) {
      this.upgrade$();
    }
    return this;
  }
  degrade$(): Item {
    this.level_--;
    return this;
  }
  degrade$int(n: number): Item {
    for (let i = 0; i < n; i++) {
      this.degrade$();
    }
    return this;
  }
  visiblyUpgraded(): number {
    return this.levelKnown ? this.level$() : 0;
  }
  buffedVisiblyUpgraded(): number {
    return this.levelKnown ? this.buffedLvl() : 0;
  }
  visiblyCursed(): boolean {
    return this.cursed && this.cursedKnown;
  }
  isUpgradable(): boolean {
    return true;
  }
  isIdentified(): boolean {
    return this.levelKnown && this.cursedKnown;
  }
  isEquipped(hero: Hero): boolean {
    return false;
  }
  identify$(): Item {
    return this.identify$boolean(true);
  }
  identify$boolean(byHero: boolean): Item {
    if (byHero && Dungeon.hero != null && Dungeon.hero.isAlive()) {
      Catalog.setSeen($J.getClass(this));
      Statistics.itemTypesDiscovered.add($J.getClass(this));
    }
    this.levelKnown = true;
    this.cursedKnown = true;
    Item.updateQuickslot();
    return this;
  }
  onHeroGainExp(levelPercent: number, hero: Hero): void {
  }
  static evoke(hero: Hero): void {
    hero.sprite_.emitter().burst(Speck.factory$int(Speck.EVOKE), 5);
  }
  title(): string {
    let name = this.name();
    if (this.visiblyUpgraded() !== 0) {
      name = Messages.format(Item.TXT_TO_STRING_LVL, [name, this.visiblyUpgraded()]);
    }
    if (this.quantity > 1) {
      name = Messages.format(Item.TXT_TO_STRING_X, [name, this.quantity]);
    }
    return name;
  }
  name(): string {
    return this.trueName();
  }
  trueName(): string {
    return Messages.get$Object$String$ObjectArr(this, 'name', []);
  }
  image(): number {
    return this.image_;
  }
  glowing(): ItemSprite$Glowing {
    return null;
  }
  emitter(): Emitter {
    return null;
  }
  info(): string {
    if (Dungeon.hero != null) {
      let note = Notes.findCustomRecord$int(this.customNoteID);
      if (note != null) {
        return Messages.get$Object$String$ObjectArr(this, 'custom_note', [JString.replaceChar(note.title(), 95 /* '_' */, 717 /* \u02cd */)]) + '\n\n' + this.desc();
      } else {
        note = Notes.findCustomRecord$Class($J.getClass(this));
        if (note != null) {
          return Messages.get$Object$String$ObjectArr(this, 'custom_note_type', [JString.replaceChar(note.title(), 95 /* '_' */, 717 /* \u02cd */)]) + '\n\n' + this.desc();
        }
      }
    }
    return this.desc();
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', []);
  }
  quantity$(): number {
    return this.quantity;
  }
  quantity$int(value: number): Item {
    this.quantity = value;
    return this;
  }
  value(): number {
    return 0;
  }
  energyVal(): number {
    return 0;
  }
  virtual(): Item {
    let item = Reflection.newInstance($J.getClass(this));
    if (item == null) {
      return null;
    }
    item.quantity = 0;
    item.level_ = this.level_;
    return item;
  }
  random(): Item {
    return this;
  }
  status(): string {
    return this.quantity !== 1 ? String(this.quantity) : null;
  }
  static updateQuickslot(): void {
    GameScene.updateItemDisplays = true;
  }
  storeInBundle(bundle: Bundle): void {
    bundle.put$String$int(Item.QUANTITY, this.quantity);
    bundle.put$String$int(Item.LEVEL, this.level_);
    bundle.put$String$boolean(Item.LEVEL_KNOWN, this.levelKnown);
    bundle.put$String$boolean(Item.CURSED, this.cursed);
    bundle.put$String$boolean(Item.CURSED_KNOWN, this.cursedKnown);
    if (Dungeon.quickslot.contains(this)) {
      bundle.put$String$int(Item.QUICKSLOT, Dungeon.quickslot.getSlot(this));
    }
    bundle.put$String$boolean(Item.KEPT_LOST, this.keptThoughLostInvent);
    if (this.customNoteID !== -1) {
      bundle.put$String$int(Item.CUSTOM_NOTE_ID, this.customNoteID);
    }
  }
  restoreFromBundle(bundle: Bundle): void {
    this.quantity = bundle.getInt(Item.QUANTITY);
    this.levelKnown = bundle.getBoolean(Item.LEVEL_KNOWN);
    this.cursedKnown = bundle.getBoolean(Item.CURSED_KNOWN);
    let level = bundle.getInt(Item.LEVEL);
    if (level > 0) {
      this.upgrade$int(level);
    } else if (level < 0) {
      this.degrade$int(-level);
    }
    this.cursed = bundle.getBoolean(Item.CURSED);
    if (Belongings.bundleRestoring) {
      if (bundle.contains(Item.QUICKSLOT)) {
        Dungeon.quickslot.setSlot(bundle.getInt(Item.QUICKSLOT), this);
      }
    }
    this.keptThoughLostInvent = bundle.getBoolean(Item.KEPT_LOST);
    if (bundle.contains(Item.CUSTOM_NOTE_ID)) {
      this.customNoteID = bundle.getInt(Item.CUSTOM_NOTE_ID);
    }
  }
  targetingPos(user: Hero, dst: number): number {
    return this.throwPos(user, dst);
  }
  throwPos(user: Hero, dst: number): number {
    return new Ballistica()._Ballistica(user.pos, dst, Ballistica.PROJECTILE).collisionPos;
  }
  throwSound(): void {
    Sample.INSTANCE.play$Object$float$float$float(Assets$Sounds.MISS, Math.fround(0.6), Math.fround(0.6), 1.5);
  }
  cast(user: Hero, dst: number): void {
    let cell = this.throwPos(user, dst);
    user.sprite_.zap$int(cell);
    user.busy();
    this.throwSound();
    let enemy = Actor.findChar(cell);
    QuickSlotButton.target(enemy);
    let delay = this.castDelay(user, cell);
    if (enemy != null) {
      (user.sprite_.parent.recycle($J.cls(MissileSprite))).reset$Visual$Visual$Item$Callback(user.sprite_, enemy.sprite_, this, new (Item$3())().$o(this).$c(user, cell, enemy, delay));
    } else {
      (user.sprite_.parent.recycle($J.cls(MissileSprite))).reset$Visual$int$Item$Callback(user.sprite_, cell, this, new (Item$4())().$o(this).$c(user, delay, cell));
    }
  }
  castDelay(user: Char, cell: number): number {
    return Item.TIME_TO_THROW;
  }
  pickupDelay(): number {
    return Item.TIME_TO_PICK_UP;
  }
  setCurrent(hero: Hero): void {
    Item.curUser = hero;
    Item.curItem = this;
  }
  static $clinit() {
    Item.itemComparator = (lhs, rhs) => {
      return (Generator$Category.order(lhs) - Generator$Category.order(rhs)) | 0;
    };
    Item.curUser = null;
    Item.curItem = null;
    Item.thrower = new (Item$5())()._CellSelector$Listener();
  }
}

let $Item$2: any = null;
/** An anonymous class (Item.java:249). */
function Item$2(): any {
  return $Item$2 ??= $J.local(class extends Actor {
    $init_anon() {
      this.actPriority = Actor.VFX_PRIO;
      return this;
    }
    act(): boolean {
      Dungeon.level.drop(this.$cv_d, Dungeon.hero.pos).sprite_.drop$();
      Actor.remove(this);
      return true;
    }
    $c($d): this {
      this.$cv_d = $d;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.Item$2', []);
}

let $Item$3: any = null;
/** An anonymous class (Item.java:659). */
function Item$3(): any {
  return $Item$3 ??= $J.local(class extends JObject {
    call(): void {
      Item.curUser = this.$cv_user;
      let i = this.$outer.detach(this.$cv_user.belongings.backpack);
      if (i != null) {
        i.onThrow(this.$cv_cell);
      }
      if (Item.curUser.hasTalent(Talent.IMPROVISED_PROJECTILES) && !(this.$outer instanceof MissileWeapon) && Item.curUser.buff($J.cls(Talent$ImprovisedProjectileCooldown)) == null) {
        if (this.$cv_enemy != null && this.$cv_enemy.alignment !== Item.curUser.alignment) {
          Sample.INSTANCE.play$Object(Assets$Sounds.HIT);
          Buff.affect$Char$Class$float(this.$cv_enemy, $J.cls(Blindness), Math.fround(1 + Item.curUser.pointsInTalent(Talent.IMPROVISED_PROJECTILES)));
          Buff.affect$Char$Class$float(Item.curUser, $J.cls(Talent$ImprovisedProjectileCooldown), 50);
        }
      }
      if (this.$cv_user.buff($J.cls(Talent$LethalMomentumTracker)) != null) {
        this.$cv_user.buff($J.cls(Talent$LethalMomentumTracker)).detach();
        this.$cv_user.next();
      } else {
        this.$cv_user.spendAndNext(this.$cv_delay);
      }
    }
    $c($user, $cell, $enemy, $delay): this {
      this.$cv_user = $user; this.$cv_cell = $cell; this.$cv_enemy = $enemy; this.$cv_delay = $delay;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.Item$3', ['com.watabou.utils.Callback']);
}

let $Item$4: any = null;
/** An anonymous class (Item.java:687). */
function Item$4(): any {
  return $Item$4 ??= $J.local(class extends JObject {
    call(): void {
      Item.curUser = this.$cv_user;
      let i = this.$outer.detach(this.$cv_user.belongings.backpack);
      this.$cv_user.spend(this.$cv_delay);
      if (i != null) {
        i.onThrow(this.$cv_cell);
      }
      this.$cv_user.next();
    }
    $c($user, $delay, $cell): this {
      this.$cv_user = $user; this.$cv_delay = $delay; this.$cv_cell = $cell;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.Item$4', ['com.watabou.utils.Callback']);
}

let $Item$5: any = null;
/** An anonymous class (Item.java:715). */
function Item$5(): any {
  return $Item$5 ??= $J.local(class extends CellSelector$Listener {
    onSelect(target: number): void {
      if (target != null) {
        Item.curItem.cast(Item.curUser, target);
      }
    }
    prompt(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(Item), 'prompt', []);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.Item$5', []);
}

$J.define(Item, 'com.shatteredpixel.shatteredpixeldungeon.items.Item', { kind: 'class', ifaces: ['com.watabou.utils.Bundlable'], sup: 'java.lang.Object', ctors: { '': '_Item' }, meths: { 'quantity(int)': 'quantity$int', 'quantity()': 'quantity$', 'identify(boolean)': 'identify$boolean', 'identify()': 'identify$', 'degrade(int)': 'degrade$int', 'degrade()': 'degrade$', 'upgrade(int)': 'upgrade$int', 'upgrade()': 'upgrade$', 'level(int)': 'level$int', 'level()': 'level$', 'collect()': 'collect$', 'collect(com.shatteredpixel.shatteredpixeldungeon.items.bags.Bag)': 'collect$Bag', 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero)': 'execute$Hero', 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String', 'doPickUp(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,int)': 'doPickUp$Hero$int', 'doPickUp(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero)': 'doPickUp$Hero' }, clinit: true, lazy: ['itemComparator', 'curUser', 'curItem', 'thrower'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Blindness = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Blindness');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Degrade = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Degrade');
  Belongings = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Belongings');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Talent$ImprovisedProjectileCooldown = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$ImprovisedProjectileCooldown');
  Talent$LethalMomentumTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$LethalMomentumTracker');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  Bag = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bags.Bag');
  MissileWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon');
  Dart = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.Dart');
  TippedDart = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.TippedDart');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Notes = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CellSelector$Listener = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.CellSelector$Listener');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  MissileSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.MissileSprite');
  QuickSlotButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.QuickSlotButton');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Bundle = $J.load('com.watabou.utils.Bundle');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
