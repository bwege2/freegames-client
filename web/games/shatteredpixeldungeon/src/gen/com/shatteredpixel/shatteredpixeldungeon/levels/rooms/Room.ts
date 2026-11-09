// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/Room.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, JEnum, LinkedHashMap } from '../../../../../../jre/index.ts';
import { Rect } from '../../../../watabou/utils/Rect.ts';
import { Point } from '../../../../watabou/utils/Point.ts';

let Painter, Random;

export class Room extends Rect {
  neigbours: ArrayList<Room> = null;
  connected_: LinkedHashMap<Room, Room$Door> = null;
  distance_: number = 0;
  price: number = 0;
  static readonly ALL: number = 0;
  static readonly LEFT: number = 1;
  static readonly TOP: number = 2;
  static readonly RIGHT: number = 3;
  static readonly BOTTOM: number = 4;
  $init_Room() {
    this.neigbours = new ArrayList();
    this.connected_ = new LinkedHashMap();
    this.price = 1;
  }
  _Room$(): this {
    this._Rect$();
    this.$init_Room();
    return this;
  }
  _Room$Rect(other: Rect): this {
    this._Rect$Rect(other);
    this.$init_Room();
    return this;
  }
  set$Room(other: Room): Room {
    super.set$Rect(other);
    for (const $it0 = other.neigbours.iterator(); $it0.hasNext(); ) {
      let r = $it0.next();
      this.neigbours.add(r);
      r.neigbours.remove(other);
      r.neigbours.add(this);
    }
    for (const $it1 = other.connected_.keySet().iterator(); $it1.hasNext(); ) {
      let r = $it1.next();
      let d = other.connected_.get(r);
      r.connected_.remove(other);
      r.connected_.put(this, d);
      this.connected_.put(r, d);
    }
    return this;
  }
  minWidth(): number {
    return -1;
  }
  maxWidth(): number {
    return -1;
  }
  minHeight(): number {
    return -1;
  }
  maxHeight(): number {
    return -1;
  }
  setSize$(): boolean {
    return this.setSize$int$int$int$int(this.minWidth(), this.maxWidth(), this.minHeight(), this.maxHeight());
  }
  forceSize(w: number, h: number): boolean {
    return this.setSize$int$int$int$int(w, w, h, h);
  }
  setSizeWithLimit(w: number, h: number): boolean {
    if (w < this.minWidth() || h < this.minHeight()) {
      return false;
    } else {
      this.setSize$();
      if (this.width() > w || this.height() > h) {
        this.resize((Math.min(this.width(), w) - 1) | 0, (Math.min(this.height(), h) - 1) | 0);
      }
      return true;
    }
  }
  setSize$int$int$int$int(minW: number, maxW: number, minH: number, maxH: number): boolean {
    if (minW < this.minWidth() || maxW > this.maxWidth() || minH < this.minHeight() || maxH > this.maxHeight() || minW > maxW || minH > maxH) {
      return false;
    } else {
      this.resize((Random.NormalIntRange(minW, maxW) - 1) | 0, (Random.NormalIntRange(minH, maxH) - 1) | 0);
      return true;
    }
  }
  pointInside(from: Point, n: number): Point {
    let step = new Point()._Point$Point(from);
    if (from.x === this.left_) {
      step.offset$int$int(+n, 0);
    } else if (from.x === this.right_) {
      step.offset$int$int(-n, 0);
    } else if (from.y === this.top_) {
      step.offset$int$int(0, +n);
    } else if (from.y === this.bottom_) {
      step.offset$int$int(0, -n);
    }
    return step;
  }
  width(): number {
    return (super.width() + 1) | 0;
  }
  height(): number {
    return (super.height() + 1) | 0;
  }
  random$(): Point {
    return this.random$int(1);
  }
  random$int(m: number): Point {
    return new Point()._Point$int$int(Random.IntRange((this.left_ + m) | 0, (this.right_ - m) | 0), Random.IntRange((this.top_ + m) | 0, (this.bottom_ - m) | 0));
  }
  inside$Point(p: Point): boolean {
    return p.x > this.left_ && p.y > this.top_ && p.x < this.right_ && p.y < this.bottom_;
  }
  center(): Point {
    return new Point()._Point$int$int(($J.idiv(((this.left_ + this.right_) | 0), 2) + ((((this.right_ - this.left_) | 0) % 2) === 1 ? Random.Int$int(2) : 0)) | 0, ($J.idiv(((this.top_ + this.bottom_) | 0), 2) + ((((this.bottom_ - this.top_) | 0) % 2) === 1 ? Random.Int$int(2) : 0)) | 0);
  }
  minConnections(direction: number): number {
    if (direction === Room.ALL) {
      return 1;
    } else {
      return 0;
    }
  }
  curConnections(direction: number): number {
    if (direction === Room.ALL) {
      return this.connected_.size();
    } else {
      let total = 0;
      for (const $it2 = this.connected_.keySet().iterator(); $it2.hasNext(); ) {
        let r = $it2.next();
        let i = this.intersect(r);
        if (direction === Room.LEFT && i.width() === 0 && i.left_ === this.left_) {
          total++;
        } else if (direction === Room.TOP && i.height() === 0 && i.top_ === this.top_) {
          total++;
        } else if (direction === Room.RIGHT && i.width() === 0 && i.right_ === this.right_) {
          total++;
        } else if (direction === Room.BOTTOM && i.height() === 0 && i.bottom_ === this.bottom_) {
          total++;
        }
      }
      return total;
    }
  }
  remConnections(direction: number): number {
    if (this.curConnections(Room.ALL) >= this.maxConnections(Room.ALL)) {
      return 0;
    } else {
      return (this.maxConnections(direction) - this.curConnections(direction)) | 0;
    }
  }
  maxConnections(direction: number): number {
    if (direction === Room.ALL) {
      return 16;
    } else {
      return 4;
    }
  }
  canConnect$Point(p: Point): boolean {
    return (p.x === this.left_ || p.x === this.right_) !== (p.y === this.top_ || p.y === this.bottom_);
  }
  canConnect$int(direction: number): boolean {
    return this.remConnections(direction) > 0;
  }
  canConnect$Room(r: Room): boolean {
    if (this.isExit() && r.isEntrance() || this.isEntrance() && r.isExit()) {
      return false;
    }
    let i = this.intersect(r);
    let foundPoint = false;
    for (const $it3 = i.getPoints().iterator(); $it3.hasNext(); ) {
      let p = $it3.next();
      if (this.canConnect$Point(p) && r.canConnect$Point(p)) {
        foundPoint = true;
        break;
      }
    }
    if (!foundPoint) {
      return false;
    }
    if (i.width() === 0 && i.left_ === this.left_) {
      return this.canConnect$int(Room.LEFT) && r.canConnect$int(Room.RIGHT);
    } else if (i.height() === 0 && i.top_ === this.top_) {
      return this.canConnect$int(Room.TOP) && r.canConnect$int(Room.BOTTOM);
    } else if (i.width() === 0 && i.right_ === this.right_) {
      return this.canConnect$int(Room.RIGHT) && r.canConnect$int(Room.LEFT);
    } else if (i.height() === 0 && i.bottom_ === this.bottom_) {
      return this.canConnect$int(Room.BOTTOM) && r.canConnect$int(Room.TOP);
    } else {
      return false;
    }
  }
  canMerge(l: Level, other: Room, p: Point, mergeTerrain: number): boolean {
    return false;
  }
  merge(l: Level, other: Room, merge: Rect, mergeTerrain: number): void {
    Painter.fill$Level$Rect$int(l, merge, mergeTerrain);
  }
  addNeigbour(other: Room): boolean {
    if (this.neigbours.contains(other)) {
      return true;
    }
    let i = this.intersect(other);
    if ((i.width() === 0 && i.height() >= 2) || (i.height() === 0 && i.width() >= 2)) {
      this.neigbours.add(other);
      other.neigbours.add(this);
      return true;
    }
    return false;
  }
  connect(room: Room): boolean {
    if ((this.neigbours.contains(room) || this.addNeigbour(room)) && !this.connected_.containsKey(room) && this.canConnect$Room(room)) {
      this.connected_.put(room, null);
      room.connected_.put(this, null);
      return true;
    }
    return false;
  }
  clearConnections(): void {
    for (const $it4 = this.neigbours.iterator(); $it4.hasNext(); ) {
      let r = $it4.next();
      r.neigbours.remove(this);
    }
    this.neigbours.clear();
    for (const $it5 = this.connected_.keySet().iterator(); $it5.hasNext(); ) {
      let r = $it5.next();
      r.connected_.remove(this);
    }
    this.connected_.clear();
  }
  isEntrance(): boolean {
    return false;
  }
  isExit(): boolean {
    return false;
  }
  canPlaceWater(p: Point): boolean {
    return true;
  }
  waterPlaceablePoints(): ArrayList<Point> {
    let points = new ArrayList();
    for (let i = this.left_; i <= this.right_; i++) {
      for (let j = this.top_; j <= this.bottom_; j++) {
        let p = new Point()._Point$int$int(i, j);
        if (this.canPlaceWater(p)) {
          points.add(p);
        }
      }
    }
    return points;
  }
  canPlaceGrass(p: Point): boolean {
    return true;
  }
  grassPlaceablePoints(): ArrayList<Point> {
    let points = new ArrayList();
    for (let i = this.left_; i <= this.right_; i++) {
      for (let j = this.top_; j <= this.bottom_; j++) {
        let p = new Point()._Point$int$int(i, j);
        if (this.canPlaceGrass(p)) {
          points.add(p);
        }
      }
    }
    return points;
  }
  canPlaceTrap(p: Point): boolean {
    return true;
  }
  trapPlaceablePoints(): ArrayList<Point> {
    let points = new ArrayList();
    for (let i = this.left_; i <= this.right_; i++) {
      for (let j = this.top_; j <= this.bottom_; j++) {
        let p = new Point()._Point$int$int(i, j);
        if (this.canPlaceTrap(p)) {
          points.add(p);
        }
      }
    }
    return points;
  }
  canPlaceItem(p: Point, l: Level): boolean {
    return this.inside$Point(p);
  }
  itemPlaceablePoints(l: Level): ArrayList<Point> {
    let points = new ArrayList();
    for (let i = this.left_; i <= this.right_; i++) {
      for (let j = this.top_; j <= this.bottom_; j++) {
        let p = new Point()._Point$int$int(i, j);
        if (this.canPlaceItem(p, l)) {
          points.add(p);
        }
      }
    }
    return points;
  }
  canPlaceCharacter(p: Point, l: Level): boolean {
    return this.inside$Point(p);
  }
  charPlaceablePoints(l: Level): ArrayList<Point> {
    let points = new ArrayList();
    for (let i = this.left_; i <= this.right_; i++) {
      for (let j = this.top_; j <= this.bottom_; j++) {
        let p = new Point()._Point$int$int(i, j);
        if (this.canPlaceCharacter(p, l)) {
          points.add(p);
        }
      }
    }
    return points;
  }
  distance$(): number {
    return this.distance_;
  }
  distance$int(value: number): void {
    this.distance_ = value;
  }
  price$(): number {
    return this.price;
  }
  price$int(value: number): void {
    this.price = value;
  }
  edges(): Collection<Room> {
    let edges = new ArrayList();
    for (const $it6 = this.connected_.keySet().iterator(); $it6.hasNext(); ) {
      let r = $it6.next();
      let d = this.connected_.get(r);
      if (d.type_ === Room$Door$Type.EMPTY || d.type_ === Room$Door$Type.TUNNEL || d.type_ === Room$Door$Type.UNLOCKED || d.type_ === Room$Door$Type.REGULAR) {
        edges.add(r);
      }
    }
    return edges;
  }
  storeInBundle(bundle: Bundle): void {
    bundle.put$String$int('left', this.left_);
    bundle.put$String$int('top', this.top_);
    bundle.put$String$int('right', this.right_);
    bundle.put$String$int('bottom', this.bottom_);
  }
  restoreFromBundle(bundle: Bundle): void {
    this.left_ = bundle.getInt('left');
    this.top_ = bundle.getInt('top');
    this.right_ = bundle.getInt('right');
    this.bottom_ = bundle.getInt('bottom');
  }
  onLevelLoad(level: Level): void {
  }
}

export class Room$Door extends Point {
  type_: Room$Door$Type = null;
  typeLocked: boolean = false;
  $init_Room_Door() {
    this.type_ = Room$Door$Type.EMPTY;
    this.typeLocked = false;
  }
  _Room$Door$(): this {
    this._Point$();
    this.$init_Room_Door();
    return this;
  }
  _Room$Door$Point(p: Point): this {
    this._Point$Point(p);
    this.$init_Room_Door();
    return this;
  }
  _Room$Door$int$int(x: number, y: number): this {
    this._Point$int$int(x, y);
    this.$init_Room_Door();
    return this;
  }
  lockTypeChanges(lock: boolean): void {
    this.typeLocked = lock;
  }
  set$Type(type$: Room$Door$Type): void {
    if (!this.typeLocked && type$.compareTo(this.type_) > 0) {
      this.type_ = type$;
    }
  }
  storeInBundle(bundle: Bundle): void {
    bundle.put$String$int('x', this.x);
    bundle.put$String$int('y', this.y);
    bundle.put$String$Enum('type', this.type_);
    bundle.put$String$boolean('type_locked', this.typeLocked);
  }
  restoreFromBundle(bundle: Bundle): void {
    this.x = bundle.getInt('x');
    this.y = bundle.getInt('y');
    this.type_ = bundle.getEnum('type', $J.cls(Room$Door$Type));
    this.typeLocked = bundle.getBoolean('type_locked');
  }
}

export class Room$Door$Type extends JEnum {
  static EMPTY: Room$Door$Type = null;
  static TUNNEL: Room$Door$Type = null;
  static WATER: Room$Door$Type = null;
  static REGULAR: Room$Door$Type = null;
  static UNLOCKED: Room$Door$Type = null;
  static HIDDEN: Room$Door$Type = null;
  static BARRICADE: Room$Door$Type = null;
  static LOCKED: Room$Door$Type = null;
  static CRYSTAL: Room$Door$Type = null;
  static WALL: Room$Door$Type = null;
  static $VALUES: Room$Door$Type[] = null;
  _Room$Door$Type($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Room$Door$Type[] { return Room$Door$Type.$VALUES.slice(); }
  static valueOf(name: string): Room$Door$Type { return $J.enumValueOf(Room$Door$Type, name); }
  static $clinit() {
    Room$Door$Type.EMPTY = new Room$Door$Type()._Room$Door$Type('EMPTY', 0);
    Room$Door$Type.TUNNEL = new Room$Door$Type()._Room$Door$Type('TUNNEL', 1);
    Room$Door$Type.WATER = new Room$Door$Type()._Room$Door$Type('WATER', 2);
    Room$Door$Type.REGULAR = new Room$Door$Type()._Room$Door$Type('REGULAR', 3);
    Room$Door$Type.UNLOCKED = new Room$Door$Type()._Room$Door$Type('UNLOCKED', 4);
    Room$Door$Type.HIDDEN = new Room$Door$Type()._Room$Door$Type('HIDDEN', 5);
    Room$Door$Type.BARRICADE = new Room$Door$Type()._Room$Door$Type('BARRICADE', 6);
    Room$Door$Type.LOCKED = new Room$Door$Type()._Room$Door$Type('LOCKED', 7);
    Room$Door$Type.CRYSTAL = new Room$Door$Type()._Room$Door$Type('CRYSTAL', 8);
    Room$Door$Type.WALL = new Room$Door$Type()._Room$Door$Type('WALL', 9);
    Room$Door$Type.$VALUES = [Room$Door$Type.EMPTY, Room$Door$Type.TUNNEL, Room$Door$Type.WATER, Room$Door$Type.REGULAR, Room$Door$Type.UNLOCKED, Room$Door$Type.HIDDEN, Room$Door$Type.BARRICADE, Room$Door$Type.LOCKED, Room$Door$Type.CRYSTAL, Room$Door$Type.WALL];
  }
}

$J.define(Room, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room', { kind: 'class', ifaces: ['com.watabou.utils.Graph$Node', 'com.watabou.utils.Bundlable'], sup: 'com.watabou.utils.Rect', ctors: { 'com.watabou.utils.Rect': '_Room$Rect', '': '_Room$' }, meths: { 'price(int)': 'price$int', 'price()': 'price$', 'distance(int)': 'distance$int', 'distance()': 'distance$', 'canConnect(com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room)': 'canConnect$Room', 'canConnect(int)': 'canConnect$int', 'canConnect(com.watabou.utils.Point)': 'canConnect$Point', 'inside(com.watabou.utils.Point)': 'inside$Point', 'random(int)': 'random$int', 'random()': 'random$', 'setSize(int,int,int,int)': 'setSize$int$int$int$int', 'setSize()': 'setSize$', 'set(com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room)': 'set$Room' } });
$J.define(Room$Door, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door', { kind: 'class', ifaces: ['com.watabou.utils.Bundlable'], sup: 'com.watabou.utils.Point', ctors: { 'int,int': '_Room$Door$int$int', 'com.watabou.utils.Point': '_Room$Door$Point', '': '_Room$Door$' }, meths: { 'set(com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type)': 'set$Type' } });
$J.define(Room$Door$Type, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Room$Door$Type' }, clinit: true, lazy: ['$VALUES', 'EMPTY', 'TUNNEL', 'WATER', 'REGULAR', 'UNLOCKED', 'HIDDEN', 'BARRICADE', 'LOCKED', 'CRYSTAL', 'WALL'] });
$J.module(() => {
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Random = $J.load('com.watabou.utils.Random');
});
