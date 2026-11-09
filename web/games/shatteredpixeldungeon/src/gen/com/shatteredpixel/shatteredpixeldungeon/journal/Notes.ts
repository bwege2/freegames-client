// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/journal/Notes.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections, JEnum, JObject } from '../../../../../jre/index.ts';

let Assets$Sprites, Dungeon, Foliage, SacrificialFire, WaterOfAwareness, WaterOfHealth, DemonSpawner, Statue, Blacksmith, Ghost, Imp, ImpShopkeeper, RatKing, Shopkeeper, Wandmaker, Generator$Category, LostBackpack, BeaconOfReturning, Catalog, Level, Level$Feeling, WeakFloorRoom$HiddenWell, Messages, PixelScene, BlacksmithSprite, GhostSprite, ImpSprite, ItemSprite, ItemSpriteSheet, ItemSpriteSheet$Icons, RatKingSprite, ShopkeeperSprite, SpawnerSprite, StatueSprite, WandmakerSprite, Icons, BitmapText, Image, Reflection;

export class Notes extends JObject {
  static records: ArrayList<Notes$Record> = null;
  static readonly RECORDS: string = 'records';
  static readonly NEXT_CUSTOM_ID: string = 'next_custom_id';
  static nextCustomID: number = 0;
  static comparator: Comparator<Notes$Record> = null;
  _Notes(): this {
    return this;
  }
  static reset(): void {
    Notes.records = new ArrayList();
  }
  static storeInBundle(bundle: Bundle): void {
    bundle.put$String$Collection(Notes.RECORDS, Notes.records);
    bundle.put$String$int(Notes.NEXT_CUSTOM_ID, Notes.nextCustomID);
  }
  static restoreFromBundle(bundle: Bundle): void {
    Notes.records = new ArrayList();
    Notes.nextCustomID = bundle.getInt(Notes.NEXT_CUSTOM_ID);
    for (const $it0 = bundle.getCollection(Notes.RECORDS).iterator(); $it0.hasNext(); ) {
      let rec = $it0.next();
      Notes.records.add(rec);
    }
  }
  static add$Landmark(landmark: Notes$Landmark): boolean {
    return Notes.add$Landmark$int(landmark, Dungeon.depth);
  }
  static add$Landmark$int(landmark: Notes$Landmark, depth: number): boolean {
    let l = new Notes$LandmarkRecord()._Notes$LandmarkRecord$Landmark$int(landmark, depth);
    if (!Notes.records.contains(l)) {
      let result = Notes.records.add(l);
      Collections.sort(Notes.records, Notes.comparator);
      return result;
    }
    return false;
  }
  static contains$Landmark(landmark: Notes$Landmark): boolean {
    return Notes.contains$Landmark$int(landmark, Dungeon.depth);
  }
  static contains$Landmark$int(landmark: Notes$Landmark, depth: number): boolean {
    return Notes.records.contains(new Notes$LandmarkRecord()._Notes$LandmarkRecord$Landmark$int(landmark, depth));
  }
  static remove$Landmark(landmark: Notes$Landmark): boolean {
    return Notes.remove$Landmark$int(landmark, Dungeon.depth);
  }
  static remove$Landmark$int(landmark: Notes$Landmark, depth: number): boolean {
    return Notes.records.remove(new Notes$LandmarkRecord()._Notes$LandmarkRecord$Landmark$int(landmark, depth));
  }
  static add$Key(key: Key): boolean {
    let k = new Notes$KeyRecord()._Notes$KeyRecord$Key(key);
    if (!Notes.records.contains(k)) {
      let result = Notes.records.add(k);
      Collections.sort(Notes.records, Notes.comparator);
      return result;
    } else {
      k = Notes.records.get(Notes.records.indexOf(k));
      k.quantity$int((k.quantity$() + key.quantity$()) | 0);
      return true;
    }
  }
  static remove$Key(key: Key): boolean {
    let k = new Notes$KeyRecord()._Notes$KeyRecord$Key(key);
    if (Notes.records.contains(k)) {
      Catalog.countUses(key.getClass(), key.quantity$());
      k = Notes.records.get(Notes.records.indexOf(k));
      k.quantity$int((k.quantity$() - key.quantity$()) | 0);
      if (k.quantity$() <= 0) {
        Notes.records.remove(k);
      }
      return true;
    }
    return false;
  }
  static keyCount(key: Key): number {
    let k = new Notes$KeyRecord()._Notes$KeyRecord$Key(key);
    if (Notes.records.contains(k)) {
      k = Notes.records.get(Notes.records.indexOf(k));
      return k.quantity$();
    } else {
      return 0;
    }
  }
  static add$CustomRecord(rec: Notes$CustomRecord): boolean {
    rec.assignID();
    if (!Notes.records.contains(rec)) {
      let result = Notes.records.add(rec);
      Collections.sort(Notes.records, Notes.comparator);
      return result;
    }
    return false;
  }
  static remove$CustomRecord(rec: Notes$CustomRecord): boolean {
    if (Notes.records.contains(rec)) {
      Notes.records.remove(rec);
      return true;
    }
    return false;
  }
  static getRecords$Class<T>(recordType: JClass<T>): ArrayList<T> {
    let filtered = new ArrayList();
    for (const $it1 = Notes.records.iterator(); $it1.hasNext(); ) {
      let rec = $it1.next();
      if (recordType.isInstance(rec)) {
        filtered.add(rec);
      }
    }
    return filtered;
  }
  static getRecords$int(depth: number): ArrayList<Notes$Record> {
    let filtered = new ArrayList();
    for (const $it2 = Notes.records.iterator(); $it2.hasNext(); ) {
      let rec = $it2.next();
      if (rec.depth() === depth && !(rec instanceof Notes$CustomRecord)) {
        filtered.add(rec);
      }
    }
    Collections.sort(filtered, Notes.comparator);
    return filtered;
  }
  static findCustomRecord$int(ID: number): Notes$CustomRecord {
    for (const $it3 = Notes.records.iterator(); $it3.hasNext(); ) {
      let rec = $it3.next();
      if (rec instanceof Notes$CustomRecord && (rec).ID_ === ID) {
        return rec;
      }
    }
    return null;
  }
  static findCustomRecord$Class(itemClass: JClass): Notes$CustomRecord {
    for (const $it4 = Notes.records.iterator(); $it4.hasNext(); ) {
      let rec = $it4.next();
      if (rec instanceof Notes$CustomRecord && (rec).type_ === Notes$CustomType.ITEM_TYPE && (rec).itemClass === itemClass) {
        return rec;
      }
    }
    return null;
  }
  static customRecordLimit(): number {
    return 5;
  }
  static $clinit() {
    Notes.nextCustomID = 0;
    Notes.comparator = (r1, r2) => {
      return (r1.order() - r2.order()) | 0;
    };
  }
}

export class Notes$Record extends JObject {
  depth_: number = 0;
  static readonly DEPTH: string = 'depth';
  _Notes$Record(): this {
    return this;
  }
  depth(): number {
    return this.depth_;
  }
  icon(): Image {
    return Icons.STAIRS.get();
  }
  secondIcon(): Visual {
    return null;
  }
  quantity$(): number {
    return 1;
  }
  compareTo(another: Notes$Record): number {
    return (another.depth() - this.depth()) | 0;
  }
  restoreFromBundle(bundle: Bundle): void {
    this.depth_ = bundle.getInt(Notes$Record.DEPTH);
  }
  storeInBundle(bundle: Bundle): void {
    bundle.put$String$int(Notes$Record.DEPTH, this.depth_);
  }
}

export class Notes$Landmark extends JEnum {
  static CHASM_FLOOR: Notes$Landmark = null;
  static WATER_FLOOR: Notes$Landmark = null;
  static GRASS_FLOOR: Notes$Landmark = null;
  static DARK_FLOOR: Notes$Landmark = null;
  static LARGE_FLOOR: Notes$Landmark = null;
  static TRAPS_FLOOR: Notes$Landmark = null;
  static SECRETS_FLOOR: Notes$Landmark = null;
  static SHOP: Notes$Landmark = null;
  static ALCHEMY: Notes$Landmark = null;
  static GARDEN: Notes$Landmark = null;
  static DISTANT_WELL: Notes$Landmark = null;
  static WELL_OF_HEALTH: Notes$Landmark = null;
  static WELL_OF_AWARENESS: Notes$Landmark = null;
  static SACRIFICIAL_FIRE: Notes$Landmark = null;
  static STATUE: Notes$Landmark = null;
  static LOST_PACK: Notes$Landmark = null;
  static BEACON_LOCATION: Notes$Landmark = null;
  static GHOST: Notes$Landmark = null;
  static RAT_KING: Notes$Landmark = null;
  static WANDMAKER: Notes$Landmark = null;
  static TROLL: Notes$Landmark = null;
  static IMP: Notes$Landmark = null;
  static DEMON_SPAWNER: Notes$Landmark = null;
  static $VALUES: Notes$Landmark[] = null;
  _Notes$Landmark($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Notes$Landmark[] { return Notes$Landmark.$VALUES.slice(); }
  static valueOf(name: string): Notes$Landmark { return $J.enumValueOf(Notes$Landmark, name); }
  static $clinit() {
    Notes$Landmark.CHASM_FLOOR = new Notes$Landmark()._Notes$Landmark('CHASM_FLOOR', 0);
    Notes$Landmark.WATER_FLOOR = new Notes$Landmark()._Notes$Landmark('WATER_FLOOR', 1);
    Notes$Landmark.GRASS_FLOOR = new Notes$Landmark()._Notes$Landmark('GRASS_FLOOR', 2);
    Notes$Landmark.DARK_FLOOR = new Notes$Landmark()._Notes$Landmark('DARK_FLOOR', 3);
    Notes$Landmark.LARGE_FLOOR = new Notes$Landmark()._Notes$Landmark('LARGE_FLOOR', 4);
    Notes$Landmark.TRAPS_FLOOR = new Notes$Landmark()._Notes$Landmark('TRAPS_FLOOR', 5);
    Notes$Landmark.SECRETS_FLOOR = new Notes$Landmark()._Notes$Landmark('SECRETS_FLOOR', 6);
    Notes$Landmark.SHOP = new Notes$Landmark()._Notes$Landmark('SHOP', 7);
    Notes$Landmark.ALCHEMY = new Notes$Landmark()._Notes$Landmark('ALCHEMY', 8);
    Notes$Landmark.GARDEN = new Notes$Landmark()._Notes$Landmark('GARDEN', 9);
    Notes$Landmark.DISTANT_WELL = new Notes$Landmark()._Notes$Landmark('DISTANT_WELL', 10);
    Notes$Landmark.WELL_OF_HEALTH = new Notes$Landmark()._Notes$Landmark('WELL_OF_HEALTH', 11);
    Notes$Landmark.WELL_OF_AWARENESS = new Notes$Landmark()._Notes$Landmark('WELL_OF_AWARENESS', 12);
    Notes$Landmark.SACRIFICIAL_FIRE = new Notes$Landmark()._Notes$Landmark('SACRIFICIAL_FIRE', 13);
    Notes$Landmark.STATUE = new Notes$Landmark()._Notes$Landmark('STATUE', 14);
    Notes$Landmark.LOST_PACK = new Notes$Landmark()._Notes$Landmark('LOST_PACK', 15);
    Notes$Landmark.BEACON_LOCATION = new Notes$Landmark()._Notes$Landmark('BEACON_LOCATION', 16);
    Notes$Landmark.GHOST = new Notes$Landmark()._Notes$Landmark('GHOST', 17);
    Notes$Landmark.RAT_KING = new Notes$Landmark()._Notes$Landmark('RAT_KING', 18);
    Notes$Landmark.WANDMAKER = new Notes$Landmark()._Notes$Landmark('WANDMAKER', 19);
    Notes$Landmark.TROLL = new Notes$Landmark()._Notes$Landmark('TROLL', 20);
    Notes$Landmark.IMP = new Notes$Landmark()._Notes$Landmark('IMP', 21);
    Notes$Landmark.DEMON_SPAWNER = new Notes$Landmark()._Notes$Landmark('DEMON_SPAWNER', 22);
    Notes$Landmark.$VALUES = [Notes$Landmark.CHASM_FLOOR, Notes$Landmark.WATER_FLOOR, Notes$Landmark.GRASS_FLOOR, Notes$Landmark.DARK_FLOOR, Notes$Landmark.LARGE_FLOOR, Notes$Landmark.TRAPS_FLOOR, Notes$Landmark.SECRETS_FLOOR, Notes$Landmark.SHOP, Notes$Landmark.ALCHEMY, Notes$Landmark.GARDEN, Notes$Landmark.DISTANT_WELL, Notes$Landmark.WELL_OF_HEALTH, Notes$Landmark.WELL_OF_AWARENESS, Notes$Landmark.SACRIFICIAL_FIRE, Notes$Landmark.STATUE, Notes$Landmark.LOST_PACK, Notes$Landmark.BEACON_LOCATION, Notes$Landmark.GHOST, Notes$Landmark.RAT_KING, Notes$Landmark.WANDMAKER, Notes$Landmark.TROLL, Notes$Landmark.IMP, Notes$Landmark.DEMON_SPAWNER];
  }
}

export class Notes$LandmarkRecord extends Notes$Record {
  landmark_: Notes$Landmark = null;
  static readonly LANDMARK: string = 'landmark';
  _Notes$LandmarkRecord$(): this {
    this._Notes$Record();
    return this;
  }
  _Notes$LandmarkRecord$Landmark$int(landmark: Notes$Landmark, depth: number): this {
    this._Notes$Record();
    this.landmark_ = landmark;
    this.depth_ = depth;
    return this;
  }
  icon(): Image {
    switch (this.landmark_) {
      default:
        return Icons.STAIRS.get();
      case Notes$Landmark.CHASM_FLOOR:
        return Icons.STAIRS_CHASM.get();
      case Notes$Landmark.WATER_FLOOR:
        return Icons.STAIRS_WATER.get();
      case Notes$Landmark.GRASS_FLOOR:
        return Icons.STAIRS_GRASS.get();
      case Notes$Landmark.DARK_FLOOR:
        return Icons.STAIRS_DARK.get();
      case Notes$Landmark.LARGE_FLOOR:
        return Icons.STAIRS_LARGE.get();
      case Notes$Landmark.TRAPS_FLOOR:
        return Icons.STAIRS_TRAPS.get();
      case Notes$Landmark.SECRETS_FLOOR:
        return Icons.STAIRS_SECRETS.get();
      case Notes$Landmark.SHOP:
        if (this.depth_ === 20) {
          return new Image()._Image$Image(new ImpSprite()._ImpSprite());
        } else {
          return new Image()._Image$Image(new ShopkeeperSprite()._ShopkeeperSprite());
        }
      case Notes$Landmark.ALCHEMY:
        return Icons.get$Icons(Icons.ALCHEMY);
      case Notes$Landmark.GARDEN:
        return Icons.get$Icons(Icons.GRASS);
      case Notes$Landmark.DISTANT_WELL:
        return Icons.get$Icons(Icons.DISTANT_WELL);
      case Notes$Landmark.WELL_OF_HEALTH:
        return Icons.get$Icons(Icons.WELL_HEALTH);
      case Notes$Landmark.WELL_OF_AWARENESS:
        return Icons.get$Icons(Icons.WELL_AWARENESS);
      case Notes$Landmark.SACRIFICIAL_FIRE:
        return Icons.get$Icons(Icons.SACRIFICE_ALTAR);
      case Notes$Landmark.STATUE:
        return new Image()._Image$Image(new StatueSprite()._StatueSprite());
      case Notes$Landmark.LOST_PACK:
        return Icons.get$Icons(Icons.BACKPACK_LRG);
      case Notes$Landmark.BEACON_LOCATION:
        return new ItemSprite()._ItemSprite$int(ItemSpriteSheet.RETURN_BEACON);
      case Notes$Landmark.GHOST:
        return new Image()._Image$Image(new GhostSprite()._GhostSprite());
      case Notes$Landmark.RAT_KING:
        return new Image()._Image$Image(new RatKingSprite()._RatKingSprite());
      case Notes$Landmark.WANDMAKER:
        return new Image()._Image$Image(new WandmakerSprite()._WandmakerSprite());
      case Notes$Landmark.TROLL:
        return new Image()._Image$Image(new BlacksmithSprite()._BlacksmithSprite());
      case Notes$Landmark.IMP:
        return new Image()._Image$Image(new ImpSprite()._ImpSprite());
      case Notes$Landmark.DEMON_SPAWNER:
        return new Image()._Image$Image(new SpawnerSprite()._SpawnerSprite());
    }
  }
  title(): string {
    switch (this.landmark_) {
      default:
        return Messages.get$Class$String$ObjectArr($J.cls(Notes$Landmark), this.landmark_.name(), []);
      case Notes$Landmark.CHASM_FLOOR:
        return Messages.get$Class$String$ObjectArr($J.cls(Level$Feeling), 'chasm_title', []);
      case Notes$Landmark.WATER_FLOOR:
        return Messages.get$Class$String$ObjectArr($J.cls(Level$Feeling), 'water_title', []);
      case Notes$Landmark.GRASS_FLOOR:
        return Messages.get$Class$String$ObjectArr($J.cls(Level$Feeling), 'grass_title', []);
      case Notes$Landmark.DARK_FLOOR:
        return Messages.get$Class$String$ObjectArr($J.cls(Level$Feeling), 'dark_title', []);
      case Notes$Landmark.LARGE_FLOOR:
        return Messages.get$Class$String$ObjectArr($J.cls(Level$Feeling), 'large_title', []);
      case Notes$Landmark.TRAPS_FLOOR:
        return Messages.get$Class$String$ObjectArr($J.cls(Level$Feeling), 'traps_title', []);
      case Notes$Landmark.SECRETS_FLOOR:
        return Messages.get$Class$String$ObjectArr($J.cls(Level$Feeling), 'secrets_title', []);
      case Notes$Landmark.LOST_PACK:
        return Messages.get$Class$String$ObjectArr($J.cls(LostBackpack), 'name', []);
      case Notes$Landmark.BEACON_LOCATION:
        return Messages.get$Class$String$ObjectArr($J.cls(BeaconOfReturning), 'name', []);
    }
  }
  desc(): string {
    switch (this.landmark_) {
      default:
        return '';
      case Notes$Landmark.CHASM_FLOOR:
        return Messages.get$Class$String$ObjectArr($J.cls(Level$Feeling), 'chasm_desc', []);
      case Notes$Landmark.WATER_FLOOR:
        return Messages.get$Class$String$ObjectArr($J.cls(Level$Feeling), 'water_desc', []);
      case Notes$Landmark.GRASS_FLOOR:
        return Messages.get$Class$String$ObjectArr($J.cls(Level$Feeling), 'grass_desc', []);
      case Notes$Landmark.DARK_FLOOR:
        return Messages.get$Class$String$ObjectArr($J.cls(Level$Feeling), 'dark_desc', []);
      case Notes$Landmark.LARGE_FLOOR:
        return Messages.get$Class$String$ObjectArr($J.cls(Level$Feeling), 'large_desc', []);
      case Notes$Landmark.TRAPS_FLOOR:
        return Messages.get$Class$String$ObjectArr($J.cls(Level$Feeling), 'traps_desc', []);
      case Notes$Landmark.SECRETS_FLOOR:
        return Messages.get$Class$String$ObjectArr($J.cls(Level$Feeling), 'secrets_desc', []);
      case Notes$Landmark.SHOP:
        if (this.depth_ === 20) {
          return Messages.get$Class$String$ObjectArr($J.cls(ImpShopkeeper), 'desc', []);
        } else {
          return Messages.get$Class$String$ObjectArr($J.cls(Shopkeeper), 'desc', []);
        }
      case Notes$Landmark.ALCHEMY:
        return Messages.get$Class$String$ObjectArr($J.cls(Level), 'alchemy_desc', []);
      case Notes$Landmark.GARDEN:
        return Messages.get$Class$String$ObjectArr($J.cls(Foliage), 'desc', []);
      case Notes$Landmark.DISTANT_WELL:
        return Messages.get$Class$String$ObjectArr($J.cls(WeakFloorRoom$HiddenWell), 'desc', []);
      case Notes$Landmark.WELL_OF_HEALTH:
        return Messages.get$Class$String$ObjectArr($J.cls(WaterOfHealth), 'desc', []);
      case Notes$Landmark.WELL_OF_AWARENESS:
        return Messages.get$Class$String$ObjectArr($J.cls(WaterOfAwareness), 'desc', []);
      case Notes$Landmark.SACRIFICIAL_FIRE:
        return Messages.get$Class$String$ObjectArr($J.cls(SacrificialFire), 'desc', []);
      case Notes$Landmark.STATUE:
        return Messages.get$Class$String$ObjectArr($J.cls(Statue), 'desc', []);
      case Notes$Landmark.LOST_PACK:
        return Messages.get$Class$String$ObjectArr($J.cls(LostBackpack), 'desc', []);
      case Notes$Landmark.BEACON_LOCATION:
        return Messages.get$Class$String$ObjectArr($J.cls(BeaconOfReturning), 'desc', []);
      case Notes$Landmark.GHOST:
        return Messages.get$Class$String$ObjectArr($J.cls(Ghost), 'desc', []);
      case Notes$Landmark.RAT_KING:
        return new RatKing()._RatKing().description();
      case Notes$Landmark.WANDMAKER:
        return Messages.get$Class$String$ObjectArr($J.cls(Wandmaker), 'desc', []);
      case Notes$Landmark.TROLL:
        return Messages.get$Class$String$ObjectArr($J.cls(Blacksmith), 'desc', []);
      case Notes$Landmark.IMP:
        return Messages.get$Class$String$ObjectArr($J.cls(Imp), 'desc', []);
      case Notes$Landmark.DEMON_SPAWNER:
        return Messages.get$Class$String$ObjectArr($J.cls(DemonSpawner), 'desc', []);
    }
  }
  order(): number {
    return this.landmark_.ordinal();
  }
  equals(obj: any): boolean {
    return (obj instanceof Notes$LandmarkRecord) && this.landmark_ === (obj).landmark_ && this.depth() === (obj).depth();
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.landmark_ = Notes$Landmark.valueOf(bundle.getString(Notes$LandmarkRecord.LANDMARK));
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$String(Notes$LandmarkRecord.LANDMARK, this.landmark_.name());
  }
}

export class Notes$KeyRecord extends Notes$Record {
  key: Key = null;
  static readonly KEY: string = 'key';
  _Notes$KeyRecord$(): this {
    this._Notes$Record();
    return this;
  }
  _Notes$KeyRecord$Key(key: Key): this {
    this._Notes$Record();
    this.key = key;
    return this;
  }
  depth(): number {
    return this.key.depth_;
  }
  icon(): Image {
    return new ItemSprite()._ItemSprite$Item(this.key);
  }
  secondIcon(): Visual {
    if (this.quantity$() > 1) {
      let text = new BitmapText()._BitmapText$String$Font(String(this.quantity$()), PixelScene.pixelFont);
      text.measure();
      return text;
    } else {
      return null;
    }
  }
  title(): string {
    return this.key.title();
  }
  desc(): string {
    return this.key.desc();
  }
  type(): JClass<Key> {
    return this.key.getClass();
  }
  order(): number {
    return (1000 + Generator$Category.order(this.key)) | 0;
  }
  quantity$(): number {
    return this.key.quantity$();
  }
  quantity$int(num: number): void {
    this.key.quantity$int(num);
  }
  equals(obj: any): boolean {
    return (obj instanceof Notes$KeyRecord) && this.key.isSimilar((obj).key);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.key = bundle.get$String(Notes$KeyRecord.KEY);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$Bundlable(Notes$KeyRecord.KEY, this.key);
  }
}

export class Notes$CustomType extends JEnum {
  static TEXT: Notes$CustomType = null;
  static DEPTH: Notes$CustomType = null;
  static ITEM_TYPE: Notes$CustomType = null;
  static SPECIFIC_ITEM: Notes$CustomType = null;
  static $VALUES: Notes$CustomType[] = null;
  _Notes$CustomType($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Notes$CustomType[] { return Notes$CustomType.$VALUES.slice(); }
  static valueOf(name: string): Notes$CustomType { return $J.enumValueOf(Notes$CustomType, name); }
  static $clinit() {
    Notes$CustomType.TEXT = new Notes$CustomType()._Notes$CustomType('TEXT', 0);
    Notes$CustomType.DEPTH = new Notes$CustomType()._Notes$CustomType('DEPTH', 1);
    Notes$CustomType.ITEM_TYPE = new Notes$CustomType()._Notes$CustomType('ITEM_TYPE', 2);
    Notes$CustomType.SPECIFIC_ITEM = new Notes$CustomType()._Notes$CustomType('SPECIFIC_ITEM', 3);
    Notes$CustomType.$VALUES = [Notes$CustomType.TEXT, Notes$CustomType.DEPTH, Notes$CustomType.ITEM_TYPE, Notes$CustomType.SPECIFIC_ITEM];
  }
}

export class Notes$CustomRecord extends Notes$Record {
  type_: Notes$CustomType = null;
  ID_: number = 0;
  itemClass: JClass = null;
  title_: string = null;
  body: string = null;
  static readonly TYPE: string = 'type';
  static readonly ID_NUMBER: string = 'id_number';
  static readonly ITEM_CLASS: string = 'item_class';
  static readonly TITLE: string = 'title';
  static readonly BODY: string = 'body';
  $init_Notes_CustomRecord() {
    this.ID_ = -1;
  }
  _Notes$CustomRecord$(): this {
    this._Notes$Record();
    this.$init_Notes_CustomRecord();
    return this;
  }
  _Notes$CustomRecord$String$String(title: string, desc: string): this {
    this._Notes$Record();
    this.$init_Notes_CustomRecord();
    this.type_ = Notes$CustomType.TEXT;
    this.title_ = title;
    this.body = desc;
    return this;
  }
  _Notes$CustomRecord$int$String$String(depth: number, title: string, desc: string): this {
    this._Notes$Record();
    this.$init_Notes_CustomRecord();
    this.type_ = Notes$CustomType.DEPTH;
    this.depth_ = depth;
    this.title_ = title;
    this.body = desc;
    return this;
  }
  _Notes$CustomRecord$Class$String$String(itemCls: JClass, title: string, desc: string): this {
    this._Notes$Record();
    this.$init_Notes_CustomRecord();
    this.type_ = Notes$CustomType.ITEM_TYPE;
    this.itemClass = itemCls;
    this.title_ = title;
    this.body = desc;
    return this;
  }
  _Notes$CustomRecord$Item$String$String(item: Item, title: string, desc: string): this {
    this._Notes$Record();
    this.$init_Notes_CustomRecord();
    this.type_ = Notes$CustomType.SPECIFIC_ITEM;
    this.itemClass = item.getClass();
    this.title_ = title;
    this.body = desc;
    return this;
  }
  assignID(): void {
    if (this.ID_ === -1) {
      this.ID_ = Notes.nextCustomID++;
    }
  }
  ID(): number {
    return this.ID_;
  }
  depth(): number {
    if (this.type_ === Notes$CustomType.DEPTH) {
      return this.depth_;
    } else {
      return 0;
    }
  }
  icon(): Image {
    {
      let i: Item;
      switch (this.type_) {
        case Notes$CustomType.TEXT:
        default:
          return Icons.SCROLL_COLOR.get();
        case Notes$CustomType.DEPTH:
          return Icons.STAIRS.get();
        case Notes$CustomType.ITEM_TYPE:
        case Notes$CustomType.SPECIFIC_ITEM:
          i = Reflection.newInstance(this.itemClass);
          return new ItemSprite()._ItemSprite$Item(i);
      }
    }
  }
  secondIcon(): Visual {
    {
      let text: BitmapText, item: Item;
      switch (this.type_) {
        case Notes$CustomType.TEXT:
        default:
          return null;
        case Notes$CustomType.DEPTH:
          text = new BitmapText()._BitmapText$String$Font(String(this.depth()), PixelScene.pixelFont);
          text.measure();
          return text;
        case Notes$CustomType.ITEM_TYPE:
        case Notes$CustomType.SPECIFIC_ITEM:
          item = Reflection.newInstance(this.itemClass);
          if (item.isIdentified() && item.icon_ !== -1) {
            let secondIcon = new Image()._Image$Object(Assets$Sprites.ITEM_ICONS);
            secondIcon.frame$RectF(ItemSpriteSheet$Icons.film.get$Object(item.icon_));
            return secondIcon;
          }
          return null;
      }
    }
  }
  order(): number {
    return (2000 + this.ID_) | 0;
  }
  editText(title: string, desc: string): void {
    this.title_ = title;
    this.body = desc;
  }
  title(): string {
    return this.title_;
  }
  desc(): string {
    return this.body;
  }
  equals(obj: any): boolean {
    return obj instanceof Notes$CustomRecord && (obj).ID_ === this.ID_;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$Enum(Notes$CustomRecord.TYPE, this.type_);
    bundle.put$String$int(Notes$CustomRecord.ID_NUMBER, this.ID_);
    if (this.itemClass != null) {
      bundle.put$String$Class(Notes$CustomRecord.ITEM_CLASS, this.itemClass);
    }
    bundle.put$String$String(Notes$CustomRecord.TITLE, this.title_);
    bundle.put$String$String(Notes$CustomRecord.BODY, this.body);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.type_ = bundle.getEnum(Notes$CustomRecord.TYPE, $J.cls(Notes$CustomType));
    this.ID_ = bundle.getInt(Notes$CustomRecord.ID_NUMBER);
    if (bundle.contains(Notes$CustomRecord.ITEM_CLASS)) {
      this.itemClass = bundle.getClass$String(Notes$CustomRecord.ITEM_CLASS);
    }
    this.title_ = bundle.getString(Notes$CustomRecord.TITLE);
    this.body = bundle.getString(Notes$CustomRecord.BODY);
  }
}

$J.define(Notes, 'com.shatteredpixel.shatteredpixeldungeon.journal.Notes', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Notes' }, meths: { 'findCustomRecord(java.lang.Class)': 'findCustomRecord$Class', 'findCustomRecord(int)': 'findCustomRecord$int', 'getRecords(int)': 'getRecords$int', 'getRecords(java.lang.Class)': 'getRecords$Class', 'remove(com.shatteredpixel.shatteredpixeldungeon.journal.Notes$CustomRecord)': 'remove$CustomRecord', 'add(com.shatteredpixel.shatteredpixeldungeon.journal.Notes$CustomRecord)': 'add$CustomRecord', 'remove(com.shatteredpixel.shatteredpixeldungeon.items.keys.Key)': 'remove$Key', 'add(com.shatteredpixel.shatteredpixeldungeon.items.keys.Key)': 'add$Key', 'remove(com.shatteredpixel.shatteredpixeldungeon.journal.Notes$Landmark,int)': 'remove$Landmark$int', 'remove(com.shatteredpixel.shatteredpixeldungeon.journal.Notes$Landmark)': 'remove$Landmark', 'contains(com.shatteredpixel.shatteredpixeldungeon.journal.Notes$Landmark,int)': 'contains$Landmark$int', 'contains(com.shatteredpixel.shatteredpixeldungeon.journal.Notes$Landmark)': 'contains$Landmark', 'add(com.shatteredpixel.shatteredpixeldungeon.journal.Notes$Landmark,int)': 'add$Landmark$int', 'add(com.shatteredpixel.shatteredpixeldungeon.journal.Notes$Landmark)': 'add$Landmark' }, clinit: true, lazy: ['records', 'nextCustomID', 'comparator'] });
$J.define(Notes$Record, 'com.shatteredpixel.shatteredpixeldungeon.journal.Notes$Record', { kind: 'class', ifaces: ['java.lang.Comparable', 'com.watabou.utils.Bundlable'], sup: 'java.lang.Object', ctors: { '': '_Notes$Record' }, meths: { 'quantity()': 'quantity$' } });
$J.define(Notes$Landmark, 'com.shatteredpixel.shatteredpixeldungeon.journal.Notes$Landmark', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Notes$Landmark' }, clinit: true, lazy: ['$VALUES', 'CHASM_FLOOR', 'WATER_FLOOR', 'GRASS_FLOOR', 'DARK_FLOOR', 'LARGE_FLOOR', 'TRAPS_FLOOR', 'SECRETS_FLOOR', 'SHOP', 'ALCHEMY', 'GARDEN', 'DISTANT_WELL', 'WELL_OF_HEALTH', 'WELL_OF_AWARENESS', 'SACRIFICIAL_FIRE', 'STATUE', 'LOST_PACK', 'BEACON_LOCATION', 'GHOST', 'RAT_KING', 'WANDMAKER', 'TROLL', 'IMP', 'DEMON_SPAWNER'] });
$J.define(Notes$LandmarkRecord, 'com.shatteredpixel.shatteredpixeldungeon.journal.Notes$LandmarkRecord', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.journal.Notes$Record', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.journal.Notes$Landmark,int': '_Notes$LandmarkRecord$Landmark$int', '': '_Notes$LandmarkRecord$' } });
$J.define(Notes$KeyRecord, 'com.shatteredpixel.shatteredpixeldungeon.journal.Notes$KeyRecord', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.journal.Notes$Record', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.items.keys.Key': '_Notes$KeyRecord$Key', '': '_Notes$KeyRecord$' }, meths: { 'quantity(int)': 'quantity$int', 'quantity()': 'quantity$' } });
$J.define(Notes$CustomType, 'com.shatteredpixel.shatteredpixeldungeon.journal.Notes$CustomType', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Notes$CustomType' }, clinit: true, lazy: ['$VALUES', 'TEXT', 'DEPTH', 'ITEM_TYPE', 'SPECIFIC_ITEM'] });
$J.define(Notes$CustomRecord, 'com.shatteredpixel.shatteredpixeldungeon.journal.Notes$CustomRecord', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.journal.Notes$Record', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.items.Item,java.lang.String,java.lang.String': '_Notes$CustomRecord$Item$String$String', 'java.lang.Class,java.lang.String,java.lang.String': '_Notes$CustomRecord$Class$String$String', 'int,java.lang.String,java.lang.String': '_Notes$CustomRecord$int$String$String', 'java.lang.String,java.lang.String': '_Notes$CustomRecord$String$String', '': '_Notes$CustomRecord$' } });
$J.module(() => {
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Foliage = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Foliage');
  SacrificialFire = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.SacrificialFire');
  WaterOfAwareness = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.WaterOfAwareness');
  WaterOfHealth = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.WaterOfHealth');
  DemonSpawner = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DemonSpawner');
  Statue = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Statue');
  Blacksmith = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Blacksmith');
  Ghost = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Ghost');
  Imp = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Imp');
  ImpShopkeeper = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.ImpShopkeeper');
  RatKing = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.RatKing');
  Shopkeeper = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Shopkeeper');
  Wandmaker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Wandmaker');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  LostBackpack = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.LostBackpack');
  BeaconOfReturning = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.spells.BeaconOfReturning');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Level = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level');
  Level$Feeling = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level$Feeling');
  WeakFloorRoom$HiddenWell = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.WeakFloorRoom$HiddenWell');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  BlacksmithSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.BlacksmithSprite');
  GhostSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.GhostSprite');
  ImpSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ImpSprite');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  ItemSpriteSheet$Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet$Icons');
  RatKingSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.RatKingSprite');
  ShopkeeperSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ShopkeeperSprite');
  SpawnerSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.SpawnerSprite');
  StatueSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.StatueSprite');
  WandmakerSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.WandmakerSprite');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  BitmapText = $J.load('com.watabou.noosa.BitmapText');
  Image = $J.load('com.watabou.noosa.Image');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
