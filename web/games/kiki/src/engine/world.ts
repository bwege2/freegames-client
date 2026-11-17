// KikiWorld and KikiCell (src/world/KikiWorld.cpp, KikiCell.cpp): the grid of cells, what occupies
// them, the temporary objects that reserve a cell while something moves into it, pushing, and the
// camera choice. The drawing part of KikiWorld is in ../render/.
import { Controller } from './global.ts';
import { KikiPos, KVector, kAbsMin, kMax, kMin, kRayPlaneIntersectionFactor } from './math.ts';
import {
  CAMERA_BEHIND, CAMERA_FOLLOW, CAMERA_INSIDE, KikiBot, KikiLight, KikiMotorGear, KikiObject, KikiPushable,
  KikiTmpObject,
} from './objects.ts';
import type { KikiProjection } from './projection.ts';
import { Snd } from './sound.ts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Cls = abstract new (...args: any[]) => KikiObject;

export class KikiCell {
  objects: KikiObject[] = [];

  getObjectsOfType(cls: Cls): KikiObject[] { return this.objects.filter((o) => o instanceof cls); }
  getObjectOfType(cls: Cls): KikiObject | null { return this.objects.find((o) => o instanceof cls) ?? null; }
  getRealObjectOfType(cls: Cls): KikiObject | null {
    for (const o of this.objects) {
      if (o instanceof cls) return o;
      const t: KikiObject = o;
      if (t instanceof KikiTmpObject && t.object instanceof cls) return t.object;
    }
    return null;
  }
  getOccupant(): KikiObject | null { return this.objects.find((o) => o.isSpaceEgoistic()) ?? null; }
  removeObject(object: KikiObject): void {
    const i = this.objects.indexOf(object);
    if (i >= 0) {
      for (const o of this.objects.slice()) if (o !== object) o.cellMateLeft(object);
      const j = this.objects.indexOf(object);
      if (j >= 0) this.objects.splice(j, 1);
    }
  }
  addObject(object: KikiObject): void {
    if (!this.objects.includes(object)) {
      for (const o of this.objects.slice()) o.newCellMate(object);
      this.objects.push(object);
    }
  }
  isEmpty(): boolean { return this.objects.length === 0; }
}

export class KikiWorld {
  objects: KikiObject[] = [];
  lights: KikiLight[] = [];
  cells: (KikiCell | null)[] = [];
  size = new KikiPos(0, 0, 0);
  name = '';
  max_distance = 0;
  raster_size = 0.1;
  moved_objects: KikiObject[] = [];
  camera_mode = CAMERA_BEHIND;
  projection: KikiProjection | null = null;
  display_border = true;
  display_raster = true;
  /** DISPLAY_DOTS (debug mode, key d): the temporary objects are drawn as dots */
  display_dots = false;
  /** bumped whenever the wall plates must be drawn again (the original's display list) */
  displayListVersion = 0;

  // ........................................................................... cells and objects
  getCellAtPos(pos: KikiPos): KikiCell | null {
    if (this.isValidPos(pos)) return this.cells[this.posToIndex(pos)];
    return null;
  }

  getBotAtPos(pos: KikiPos): KikiBot | null { return this.getObjectOfTypeAtPos(KikiBot, pos) as KikiBot | null; }

  getObjectsOfTypeAtPos(cls: Cls, pos: KikiPos): KikiObject[] {
    const cell = this.getCellAtPos(pos);
    return cell ? cell.getObjectsOfType(cls) : [];
  }

  getObjectsOfType(cls: Cls): KikiObject[] { return this.objects.filter((o) => o instanceof cls); }

  getObjectOfTypeAtPos(cls: Cls, pos: KikiPos): KikiObject | null {
    const cell = this.getCellAtPos(pos);
    return cell ? cell.getRealObjectOfType(cls) : null;
  }

  getRealOccupantAtPos(pos: KikiPos): KikiObject | null {
    const occupant = this.getOccupantAtPos(pos);
    if (occupant instanceof KikiTmpObject) return occupant.object;
    return occupant;
  }

  getOccupantAtPos(pos: KikiPos): KikiObject | null {
    const cell = this.getCellAtPos(pos);
    return cell ? cell.getOccupant() : null;
  }

  setObjectAtPos(object: KikiObject, pos: KikiPos): void {
    if (this.isInvalidPos(pos)) {
      Controller.log(`KikiWorld::setObjectAtPos pos ${pos} is invalid!`);
      return;
    }
    let cell = this.getCellAtPos(pos);
    if (object.isSpaceEgoistic() && cell && cell.getOccupant()) {
      cell.getOccupant()!.destroy();
    }
    cell = this.getCellAtPos(pos);
    if (cell === null) {
      cell = new KikiCell();
      this.cells[this.posToIndex(pos)] = cell;
    }
    object.setPosition(pos.toVector());
    cell.addObject(object);
  }

  unsetObject(object: KikiObject): void {
    const pos = object.getPos();
    const cell = this.getCellAtPos(pos);
    if (cell) {
      cell.removeObject(object);
      if (cell.isEmpty()) this.cells[this.posToIndex(pos)] = null;
    }
  }

  addObject(object: KikiObject): void {
    if (object instanceof KikiLight) {
      if (!this.lights.includes(object)) this.lights.push(object);
    } else if (!this.objects.includes(object)) {
      this.objects.push(object);
    }
  }

  addObjectAtPos(object: KikiObject, pos: KikiPos): void {
    this.setObjectAtPos(object, pos);
    this.addObject(object);
  }

  removeObject(object: KikiObject): void {
    this.unsetObject(object);
    const li = this.lights.indexOf(object as KikiLight);
    if (li >= 0) {
      this.lights.splice(li, 1);
      return;
    }
    const oi = this.objects.indexOf(object);
    if (oi >= 0) this.objects.splice(oi, 1);
  }

  moveObjectToPos(object: KikiObject, pos: KikiPos): boolean {
    if (this.isInvalidPos(pos) || this.isOccupiedPos(pos)) return false;
    this.unsetObject(object);
    this.setObjectAtPos(object, pos);
    Controller.sound.playSound(Snd.BOT_LAND);
    return true;
  }

  deleteObject(object: KikiObject | null): void {
    if (object === null) return;
    this.removeObject(object);
    object.destroy();
  }

  deleteAllObjects(): void {
    this.moved_objects.length = 0;
    const player = Controller.player;
    if (player) {
      this.removeObject(player); // remove the player first, to keep its state
      Controller.timer_event.removeAllActions();
      Controller.removeKeyHandler(player); // prevent keyboard input while building world
      player.reset();
    }
    while (this.lights.length) {
      const n = this.lights.length;
      this.lights[n - 1].destroy();
      if (n === this.lights.length) this.lights.pop();
    }
    while (this.objects.length) {
      const n = this.objects.length;
      this.objects[n - 1].destroy();
      if (n === this.objects.length) this.objects.pop();
    }
  }

  getObjectWithName(objectName: string): KikiObject | null {
    for (const o of this.objects) if (objectName === o.getName()) return o;
    return null;
  }

  // ......................................................................................... moving
  objectMovedFromPos(object: KikiObject, pos: KVector): void {
    const cell = this.getCellAtPos(KikiPos.fromVector(pos));
    if (cell) {
      const tmp = cell.getObjectOfType(KikiTmpObject) as KikiTmpObject | null;
      if (tmp && tmp.object === object) tmp.destroy();
    }
    this.moved_objects.push(object);
  }

  objectWillMoveToPos(object: KikiObject, pos: KikiPos, duration: number): void {
    const cell = this.getCellAtPos(pos);
    if (this.isInvalidPos(pos)) Controller.log(`KikiWorld::objectWillMoveToPos invalid pos ${pos}`);
    if (object.getPos().equals(pos)) {
      Controller.log(`WARNING KikiWorld::objectWillMoveToPos equal pos ${pos}`);
      return;
    }
    if (cell) {
      const objectAtNewPos = cell.getOccupant();
      if (objectAtNewPos) {
        if (objectAtNewPos instanceof KikiTmpObject) {
          if (objectAtNewPos.time < 0 && -objectAtNewPos.time <= duration) {
            objectAtNewPos.destroy(); // temporary object at new pos will vanish before object will arrive
          } else {
            Controller.log(`KikiWorld::objectWillMoveToPos timing conflict at pos ${pos}`);
          }
        } else {
          Controller.log(`KikiWorld::objectWillMoveToPos pos ${pos} already occupied`);
        }
      }
    }
    this.unsetObject(object); // remove object from cell grid
    let tmp = new KikiTmpObject(object); // insert temporary objects at new pos
    tmp.setPosition(pos.toVector());
    tmp.time = +duration;
    this.addObjectAtPos(tmp, pos);
    tmp = new KikiTmpObject(object); // insert temporary objects at old pos
    tmp.setPosition(object.getPosition());
    tmp.time = -duration;
    this.addObjectAtPos(tmp, object.getPos());
  }

  /** replaces temporary objects with moved objects (once per frame, after the timer actions) */
  updateStatus(): void {
    while (this.moved_objects.length) {
      const moved = this.moved_objects[this.moved_objects.length - 1];
      const pos = KikiPos.fromVector(moved.position);
      if (this.isInvalidPos(pos)) {
        Controller.log('KikiWorld::updateStatus invalid new pos');
        return;
      }
      const tmp = this.getObjectOfTypeAtPos(KikiTmpObject, pos) as KikiTmpObject | null;
      if (tmp) {
        if (tmp.object === moved) tmp.destroy();
        else Controller.log(`KikiWorld::updateStatus wrong tmp object at pos ${pos}`);
      } else if (this.isOccupiedPos(pos)) {
        Controller.log(`KikiWorld::updateStatus object moved to occupied pos ${pos}`);
      }
      this.setObjectAtPos(moved, pos);
      this.moved_objects.pop();
    }
  }

  /** returns true if a pushable object is at pos and may be pushed (and pushes it) */
  mayObjectPushToPos(object: KikiObject, pos: KikiPos, duration: number): boolean {
    if (this.isInvalidPos(pos)) return false;
    const direction = pos.sub(object.getPos());
    if (this.isInvalidPos(pos.add(direction))) return false;
    const objectAtNewPos = this.getOccupantAtPos(pos.add(direction));
    if (objectAtNewPos) {
      if (objectAtNewPos instanceof KikiTmpObject) {
        if (objectAtNewPos.time < 0 && -objectAtNewPos.time <= duration) objectAtNewPos.destroy();
        else return false;
      } else {
        return false;
      }
    }
    const pushable = this.getOccupantAtPos(pos);
    if (pushable instanceof KikiPushable && !(pushable instanceof KikiMotorGear)) { // (sic: "bad")
      pushable.pushedByObjectInDirection(object, direction.toVector(), duration);
      return true;
    }
    return false;
  }

  // ........................................................................................ size
  setSize(x: number, y: number, z: number): void {
    this.deleteAllObjects();
    this.displayListVersion++;
    this.size = new KikiPos(x, y, z);
    this.cells = new Array(x * y * z).fill(null);
    this.max_distance = kMax(x, kMax(y, z));
  }
  getSize(): KikiPos { return this.size.clone(); }
  getMaxDistance(): number { return this.max_distance; }
  setName(n: string): void { this.name = n; }
  getName(): string { return this.name; }
  setDisplayBorder(b: boolean | number): void { this.display_border = !!b; this.displayListVersion++; }

  init(): void {
    if (Controller.player) {
      Controller.addKeyHandler(Controller.player);
      Controller.timer_event.addAction(Controller.player.getActionWithId(KikiBot.ACTION_NOOP));
    }
  }

  isValidPos(pos: KikiPos): boolean {
    return pos.x >= 0 && pos.x < this.size.x && pos.y >= 0 && pos.y < this.size.y && pos.z >= 0 && pos.z < this.size.z;
  }
  isInvalidPos(pos: KikiPos): boolean { return !this.isValidPos(pos); }
  posToIndex(pos: KikiPos): number { return pos.x * this.size.z * this.size.y + pos.y * this.size.z + pos.z; }
  getNearestValidPos(pos: KikiPos): KikiPos {
    return new KikiPos(kMin(this.size.x - 1, kMax(pos.x, 0)), kMin(this.size.y - 1, kMax(pos.y, 0)), kMin(this.size.z - 1, kMax(pos.z, 0)));
  }
  isUnoccupiedPos(pos: KikiPos): boolean {
    if (this.isInvalidPos(pos)) return false;
    return this.getOccupantAtPos(pos) === null;
  }
  isOccupiedPos(pos: KikiPos): boolean { return !this.isUnoccupiedPos(pos); }

  // ...................................................................................... camera
  setCameraMode(mode: number): void { this.camera_mode = Math.max(CAMERA_INSIDE, Math.min(CAMERA_FOLLOW, mode)); }
  changeCameraMode(): void { this.camera_mode = (this.camera_mode + 1) % (CAMERA_FOLLOW + 1); }
  getCameraMode(): number { return this.camera_mode; }

  getProjection(): KikiProjection {
    if (this.projection === null) this.projection = this.cameraProjection();
    return this.projection;
  }

  private cameraProjection(): KikiProjection {
    const p = Controller.player!;
    switch (this.camera_mode) {
      case CAMERA_INSIDE: return p.getProjection();
      case CAMERA_BEHIND: return p.getBehindProjection();
      default: return p.getFollowProjection();
    }
  }

  /** the first part of KikiWorld::display: the camera of this frame (it moves smoothly, so once per frame) */
  updateCamera(): KikiProjection {
    this.projection = this.cameraProjection();
    return this.projection;
  }

  private static readonly normals = [
    new KVector(1, 0, 0), new KVector(0, 1, 0), new KVector(0, 0, 1),
    new KVector(-1, 0, 0), new KVector(0, -1, 0), new KVector(0, 0, -1)];

  getInsideWallPosWithDelta(pos: KVector, delta: number): KVector {
    let inside = pos.clone();
    for (let w = 0; w < 6; w++) {
      let planePos = new KVector(-0.5, -0.5, -0.5);
      if (w >= 3) planePos = planePos.add(this.size.toVector());
      const n = KikiWorld.normals[w];
      const f = kRayPlaneIntersectionFactor(pos, n.neg(), planePos, n);
      if (f < delta) inside = inside.add(n.mul(delta - f));
    }
    return inside;
  }

  getWallDistanceForPos(pos: KVector): number {
    let min_f = 10000;
    for (let w = 0; w < 6; w++) {
      let planePos = new KVector(-0.5, -0.5, -0.5);
      if (w >= 3) planePos = planePos.add(this.size.toVector());
      const n = KikiWorld.normals[w];
      const f = kRayPlaneIntersectionFactor(pos, n.neg(), planePos, n);
      min_f = kAbsMin(min_f, f);
    }
    return min_f;
  }

  getWallDistanceForRay(rayPos: KVector, rayDirection: KVector): number {
    let min_f = 10000;
    for (let w = 0; w < 6; w++) {
      let planePos = new KVector(-0.5, -0.5, -0.5);
      if (w >= 3) planePos = planePos.add(this.size.toVector());
      const f = kRayPlaneIntersectionFactor(rayPos, rayDirection, planePos, KikiWorld.normals[w]);
      if (f >= 0.0 && f < min_f) min_f = f;
    }
    return min_f;
  }
}
