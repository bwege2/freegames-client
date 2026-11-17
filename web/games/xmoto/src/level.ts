// X-Moto levels (.lvl): src/xmscene/Level.cpp (loadXML, addLimits, loadToPlay), Block.cpp, Entity.cpp,
// Zone.cpp. Coordinates are floats like the original's (atof → float).
import { parseXml, child, children, attr, type XNode } from './xml.ts';
import { f, v2, vadd, vsub, AABB, BoundingCircle, type Vec2 } from './vmath.ts';
import type { CollisionSystem, Line } from './collision.ts';
import type { Phys } from './bike.ts';

/** C's atof: the longest leading number, 0 if none */
export function atof(s: string): number {
  const m = /^\s*[+-]?(\d+\.?\d*([eE][+-]?\d+)?|\.\d+([eE][+-]?\d+)?|inf(inity)?|nan)/i.exec(s);
  if (!m) return 0;
  const t = m[0].trim().toLowerCase();
  if (t.endsWith('inf') || t.endsWith('infinity')) return t.startsWith('-') ? -Infinity : Infinity;
  return parseFloat(t);
}
export const atoi = (s: string): number => { const m = /^\s*[+-]?\d+/.exec(s); return m ? parseInt(m[0], 10) : 0; };

export interface EdgeMaterial { name: string; texture: string; color: [number, number, number, number]; scale: number; depth: number }

export class BlockVertex {
  pos: Vec2; edge: string; color: [number, number, number, number] | null = null;
  constructor(pos: Vec2, edge = '') { this.pos = pos; this.edge = edge; }
}

export class Block {
  id: string;
  initialPosition = v2(0, 0);
  initialRotation = 0;
  textureScale = f(1.0);
  background = false; dynamic = false; physics = false; isLayer = false; layer = -1;
  gripPer20 = f(20.0);
  mass = f(30.0); friction = f(0.5); elasticity = f(0.0);
  texture = 'default';
  blendColor: [number, number, number, number] = [255, 255, 255, 255];
  edgeDrawMethod: 'angle' | 'inside' | 'outside' = 'angle';
  edgeAngle = f(270.0);
  edgeMaterials: EdgeMaterial[] = [];
  collisionMethod = 'None'; collisionRadius = 0;
  vertices: BlockVertex[] = [];
  // play state
  dynamicPosition = v2(0, 0);
  dynamicRotation = 0;
  rotationCenter = v2(0, 0);
  positionCenter = v2(0, 0);
  collisionLines: Line[] = [];
  private bboxDirty = true;
  private bcircle = new BoundingCircle();
  private bbox = new AABB();
  constructor(id: string) { this.id = id; }

  isBackground(): boolean { return this.background; }
  isDynamic(): boolean { return this.dynamic; }

  /** Block::loadToPlay without the BSP (the renderer draws the polygon itself) and without chipmunk */
  loadToPlay(col: CollisionSystem, p: Phys): void {
    this.dynamicPosition = this.initialPosition;
    this.dynamicRotation = this.initialRotation;
    this.rotationCenter = v2(0, 0);
    this.positionCenter = v2(0, 0);
    this.collisionLines = [];
    this.bboxDirty = true;
    const grip = f(f(this.gripPer20 * p.bikeWheelBlockGrip) / 20.0);
    let tx = 0, ty = 0;
    const n = this.vertices.length;
    for (let i = 0; i < n; i++) {
      const inext = i + 1 === n ? 0 : i + 1;
      if (!this.background && !this.dynamic && this.layer === -1) {
        const a = vadd(this.dynamicPosition, this.vertices[i].pos);
        const b = vadd(this.dynamicPosition, this.vertices[inext].pos);
        col.defineLine(a.x, a.y, b.x, b.y, grip);
      }
      if (this.dynamic && this.layer === -1) {
        this.collisionLines.push({ x1: 0, y1: 0, x2: 0, y2: 0, grip });
      }
      if (this.physics) {
        tx = f(tx + this.vertices[i].pos.x);
        ty = f(ty + this.vertices[i].pos.y);
      }
    }
    if (this.physics && n > 0) {
      // physics blocks are recentred on their vertices' mean (chipmunk is not simulated in this port)
      const mdx = f(tx / n), mdy = f(ty / n);
      for (const v of this.vertices) v.pos = v2(f(v.pos.x - mdx), f(v.pos.y - mdy));
      this.dynamicPosition = v2(f(this.dynamicPosition.x + mdx), f(this.dynamicPosition.y + mdy));
    }
    if (this.dynamic && this.layer === -1) {
      this.updateCollisionLines(true, true);
      col.dynBlocks.add(this);
    }
    this.updateCollisionLines(true, false);
  }

  /** Block::updateCollisionLines */
  updateCollisionLines(setDirty: boolean, forceUpdate: boolean): void {
    if (!this.dynamic || this.collisionLines.length === 0) return;
    if (!forceUpdate && this.background) return;
    if (setDirty) this.bboxDirty = true;
    const r = this.dynamicRotation;
    const R0 = f(Math.cos(r)), R1 = f(-f(Math.sin(r))), R2 = f(Math.sin(r)), R3 = f(Math.cos(r));
    const c = this.rotationCenter;
    const n = this.vertices.length;
    for (let j = 0; j < n; j++) {
      const jn = j === n - 1 ? 0 : j + 1;
      const tv = (v: Vec2): Vec2 => {
        const dx = f(v.x - c.x), dy = f(v.y - c.y);
        let t = v2(f(f(dx * R0) + f(dy * R1)), f(f(dx * R2) + f(dy * R3)));
        t = vadd(t, vadd(this.dynamicPosition, c));
        return t;
      };
      const a = tv(this.vertices[j].pos), b = tv(this.vertices[jn].pos);
      const l = this.collisionLines[j];
      l.x1 = a.x; l.y1 = a.y; l.x2 = b.x; l.y2 = b.y;
    }
  }
  private translateCollisionLines(x: number, y: number): void {
    if (!this.dynamic || this.collisionLines.length === 0 || this.background) return;
    for (const l of this.collisionLines) {
      l.x1 = f(l.x1 + x); l.x2 = f(l.x2 + x); l.y1 = f(l.y1 + y); l.y2 = f(l.y2 + y);
    }
  }
  translate(x: number, y: number): void {
    this.dynamicPosition = v2(f(this.dynamicPosition.x + x), f(this.dynamicPosition.y + y));
    this.bcircle.translate(x, y);
    this.translateCollisionLines(x, y);
  }
  setDynamicPositionAccordingToCenter(p: Vec2): void {
    const np = vsub(p, this.positionCenter);
    const diff = vsub(np, this.dynamicPosition);
    this.dynamicPosition = np;
    this.bcircle.translate(diff.x, diff.y);
    this.translateCollisionLines(diff.x, diff.y);
  }
  setCenter(c: Vec2): void {
    this.rotationCenter = c;
    this.positionCenter = c;
    this.bboxDirty = true;
  }
  /** returns whether the collision grid must be updated */
  setDynamicRotation(a: number): boolean {
    this.dynamicRotation = f(a);
    const s = vadd(this.rotationCenter, this.dynamicPosition);
    if (s.x === this.bcircle.cx && s.y === this.bcircle.cy) {
      this.updateCollisionLines(false, false);
      return false;
    }
    this.updateCollisionLines(true, true);
    return true;
  }
  getAABB(): AABB {
    if (this.dynamic) {
      if (this.bboxDirty) {
        this.bcircle.reset();
        for (const l of this.collisionLines) this.bcircle.addPoint(l.x1, l.y1);
        this.bcircle.calculate();
        this.bboxDirty = false;
      }
      return this.bcircle.aabb;
    }
    if (this.bboxDirty) {
      this.bbox.reset();
      for (const v of this.vertices) {
        const p = vadd(this.dynamicPosition, v.pos);
        this.bbox.addPoint(p.x, p.y);
      }
      this.bboxDirty = false;
    }
    return this.bbox;
  }
}

export const ET_NONE = 0, ET_ISSTART = 1, ET_MAKEWIN = 2, ET_KILL = 3, ET_ISTOTAKE = 4, ET_PARTICLES_SOURCE = 5, ET_JOINT = 6, ET_CHECKPOINT = 7;
const SPECIALITY: Record<string, number> = { PlayerStart: ET_ISSTART, EndOfLevel: ET_MAKEWIN, Wrecker: ET_KILL, Strawberry: ET_ISTOTAKE, ParticleSource: ET_PARTICLES_SOURCE, Joint: ET_JOINT, Checkpoint: ET_CHECKPOINT };

export class Entity {
  id: string; typeId: string; speciality: number;
  initialPosition: Vec2; dynamicPosition: Vec2;
  size: number; width = -1; height = -1; drawAngle = 0; drawReversed = false; z: number;
  spriteName: string;
  alive = true;
  private bboxDirty = true;
  private bc = new BoundingCircle();
  constructor(id: string, typeId: string, pos: Vec2, size: number, z: number, spriteName: string) {
    this.id = id; this.typeId = typeId; this.speciality = SPECIALITY[typeId] ?? ET_NONE;
    this.initialPosition = pos; this.dynamicPosition = pos; this.size = size; this.z = z; this.spriteName = spriteName;
  }
  isToTake(): boolean { return this.speciality === ET_ISTOTAKE; }
  doesKill(): boolean { return this.speciality === ET_KILL; }
  doesMakeWin(): boolean { return this.speciality === ET_MAKEWIN; }
  isCheckpoint(): boolean { return this.speciality === ET_CHECKPOINT; }
  loadToPlay(): void { this.dynamicPosition = this.initialPosition; this.alive = true; this.bboxDirty = true; }
  setDynamicPosition(p: Vec2): void { this.dynamicPosition = p; this.bboxDirty = true; }
  translate(x: number, y: number): void {
    this.setDynamicPosition(vadd(this.dynamicPosition, v2(x, y)));
    this.bc.translate(x, y);
  }
  getAABB(): AABB {
    if (this.bboxDirty) {
      this.bc.reset();
      this.bc.init(this.dynamicPosition.x, this.dynamicPosition.y, this.size);
      this.bboxDirty = false;
    }
    return this.bc.aabb;
  }
}

export interface ZoneBox { left: number; right: number; top: number; bottom: number }
export class Zone {
  id: string; boxes: ZoneBox[] = [];
  constructor(id: string) { this.id = id; }
  /** ZonePrimBox::doesCircleTouch */
  doesCircleTouch(cp: Vec2, cr: number): boolean {
    for (const b of this.boxes) {
      const cminx = f(cp.x - cr), cminy = f(cp.y - cr), cmaxx = f(cp.x + cr), cmaxy = f(cp.y + cr);
      const fminx = cminx < b.left ? cminx : b.left, fminy = cminy < b.bottom ? cminy : b.bottom;
      const fmaxx = cmaxx > b.right ? cmaxx : b.right, fmaxy = cmaxy > b.top ? cmaxy : b.top;
      if (f(fmaxx - fminx) < f(f(f(cmaxx - cminx) + b.right) - b.left) && f(fmaxy - fminy) < f(f(f(cmaxy - cminy) + b.top) - b.bottom)) return true;
    }
    return false;
  }
}

export interface Sky { texture: string; zoom: number; offset: number; color: [number, number, number, number]; drifted: boolean; driftZoom: number; driftColor: [number, number, number, number]; blendTexture: string }

export class Level {
  id = ''; name = ''; author = ''; description = ''; date = ''; pack = ''; packNum = ''; music = '';
  requiredVersion = '';
  sky: Sky = { texture: 'sky1', zoom: f(1.0), offset: f(0.015), color: [255, 255, 255, 255], drifted: false, driftZoom: f(1.0), driftColor: [255, 255, 255, 255], blendTexture: 'sky1' };
  borderTexture = '';
  leftLimit = f(-50); rightLimit = f(50); topLimit = f(50); bottomLimit = f(-50);
  playerStart = v2(0, 0);
  scriptSource = ''; scriptFile = ''; scriptLibraries: string[] = [];
  isScripted = false; isPhysics = false;
  layerOffsets: Vec2[] = []; layerFront: boolean[] = [];
  blocks: Block[] = [];
  zones: Zone[] = [];
  entities: Entity[] = [];
  entitiesDestroyed: Entity[] = [];
  joints: Entity[] = [];
  spriteReplacements: Record<string, string> = {};
  soundReplacements: Record<string, string> = {};
  nbEntitiesToTake = 0;

  getBlockById(id: string): Block {
    const b = this.blocks.find((x) => x.id === id);
    if (!b) throw new Error(`Block '${id}' doesn't exist`);
    return b;
  }
  getEntityById(id: string): Entity {
    const e = this.entities.find((x) => x.id === id) ?? this.entitiesDestroyed.find((x) => x.id === id);
    if (!e) throw new Error(`Entity '${id}' doesn't exist`);
    return e;
  }
  getZoneById(id: string): Zone {
    const z = this.zones.find((x) => x.id === id);
    if (!z) throw new Error(`Zone '${id}' doesn't exist`);
    return z;
  }
  killEntity(id: string): void {
    const i = this.entities.findIndex((e) => e.id === id);
    if (i < 0) throw new Error(`Entity '${id}' can't be killed`);
    const e = this.entities[i];
    if (e.isToTake()) this.nbEntitiesToTake--;
    e.alive = false;
    this.entitiesDestroyed.push(e);
    this.entities.splice(i, 1);
  }

  /** Level::loadToPlay (blocks and entities) */
  loadToPlay(col: CollisionSystem, p: Phys): void {
    for (const b of this.blocks) b.loadToPlay(col, p);
    for (const e of this.entities) {
      e.loadToPlay();
      col.entities.add(e);
      if (e.isToTake()) this.nbEntitiesToTake++;
    }
  }
}

/** Level::loadXML */
export function parseLevel(xml: string): Level {
  const root = parseXml(xml);
  const L = child(root, 'level');
  if (!L) throw new Error('unable to analyze xml file');
  const lvl = new Level();
  lvl.id = attr(L, 'id');
  if (!lvl.id) throw new Error('no ID specified in level XML');
  lvl.requiredVersion = attr(L, 'rversion');
  lvl.name = lvl.id;
  lvl.pack = attr(L, 'levelpack');
  lvl.packNum = attr(L, 'levelpackNum');
  const info = child(L, 'info');
  if (info) {
    const t = (n: string): string | undefined => { const c = child(info, n); return c ? c.text : undefined; };
    lvl.name = t('name') ?? lvl.name;
    lvl.author = t('author') ?? '';
    lvl.description = t('description') ?? '';
    lvl.date = t('date') ?? '';
    const skyEl = child(info, 'sky');
    let advanced = false;
    if (skyEl) {
      if (skyEl.text) { lvl.sky.texture = skyEl.text; lvl.sky.blendTexture = skyEl.text; }
      const o = (n: string) => attr(skyEl, n);
      if (o('zoom')) { lvl.sky.zoom = f(atof(o('zoom'))); advanced = true; }
      if (o('offset')) { lvl.sky.offset = f(atof(o('offset'))); advanced = true; }
      const rgba = (pre: string): [number, number, number, number] | null => {
        const v = ['r', 'g', 'b', 'a'].map((c) => o(`${pre}_${c}`));
        if (v.every((x) => x === '')) return null;
        return v.map((x) => (x === '' ? 0 : atoi(x))) as [number, number, number, number];
      };
      const c = rgba('color');
      if (c) { lvl.sky.color = c; advanced = true; }
      if (o('drifted') === 'true') {
        lvl.sky.drifted = true; advanced = true;
        if (o('driftZoom')) lvl.sky.driftZoom = f(atof(o('driftZoom')));
        const dc = rgba('driftColor');
        if (dc) lvl.sky.driftColor = dc;
      }
      if (o('BlendTexture')) { lvl.sky.blendTexture = o('BlendTexture'); advanced = true; }
    }
    if (!advanced) oldSkyValues(lvl.sky);
    const border = child(info, 'border');
    if (border) lvl.borderTexture = attr(border, 'texture');
    const music = child(info, 'music');
    if (music) { lvl.music = attr(music, 'name'); if (lvl.music === 'None') lvl.music = ''; }
  }
  const lo = child(L, 'layeroffsets');
  if (lo) {
    for (const o of children(lo, 'layeroffset')) {
      lvl.layerOffsets.push(v2(atof(attr(o, 'x')), atof(attr(o, 'y'))));
      lvl.layerFront.push(attr(o, 'frontlayer', 'false') === 'true');
    }
  }
  const tr = child(L, 'theme_replacements');
  if (tr) {
    for (const s of children(tr, 'sprite_replacement')) if (attr(s, 'new_name')) lvl.spriteReplacements[attr(s, 'old_name')] = attr(s, 'new_name');
    for (const s of children(tr, 'sound_replacement')) lvl.soundReplacements[attr(s, 'old_name')] = attr(s, 'new_name');
  }
  const script = child(L, 'script');
  if (script) {
    lvl.isScripted = true;
    lvl.scriptFile = attr(script, 'source');
    for (const r of children(script, 'require_library')) lvl.scriptLibraries.push(attr(r, 'name'));
    lvl.scriptSource = script.text;
  }
  const lim = child(L, 'limits');
  if (lim) {
    lvl.bottomLimit = f(atof(attr(lim, 'bottom', '-50')));
    lvl.leftLimit = f(atof(attr(lim, 'left', '-50')));
    lvl.topLimit = f(atof(attr(lim, 'top', '50')));
    lvl.rightLimit = f(atof(attr(lim, 'right', '50')));
  }
  for (const z of children(L, 'zone')) {
    const zone = new Zone(attr(z, 'id'));
    for (const b of children(z, 'box')) {
      zone.boxes.push({ left: f(atof(attr(b, 'left', '0'))), right: f(atof(attr(b, 'right', '0'))), top: f(atof(attr(b, 'top', '0'))), bottom: f(atof(attr(b, 'bottom', '0'))) });
    }
    lvl.zones.push(zone);
  }
  for (const b of children(L, 'block')) {
    const block = readBlock(b);
    if (block.physics) lvl.isPhysics = true;
    lvl.blocks.push(block);
  }
  for (const e of children(L, 'entity')) {
    const ent = readEntity(e);
    if (ent.speciality === ET_JOINT) lvl.joints.push(ent);
    else lvl.entities.push(ent);
  }
  const start = lvl.entities.find((e) => e.spriteName === 'PlayerStart');
  lvl.playerStart = start ? start.initialPosition : v2(0, 0);
  for (const b of lvl.blocks) {
    if (b.layer !== -1 && (lvl.layerOffsets.length === 0 || b.layer >= lvl.layerOffsets.length)) {
      throw new Error('the block has a layer but the level is without layers');
    }
  }
  addLimits(lvl);
  return lvl;
}

/** SkyApparence::setOldXmotoValuesFromTextureName */
function oldSkyValues(sky: Sky): void {
  if (sky.texture === 'sky1') {
    sky.zoom = f(2.0); sky.offset = f(0.015); sky.driftZoom = f(1.0); sky.drifted = false; sky.color = [255, 255, 255, 255];
  }
  if (sky.texture === 'sky2') {
    sky.zoom = f(1.53); sky.offset = f(0.015); sky.driftZoom = f(1.0); sky.drifted = false; sky.color = [255, 255, 255, 255];
    return;
  }
  if (sky.texture === 'Sky2Drift') {
    sky.zoom = f(1.53); sky.offset = f(0.015); sky.driftZoom = f(1.17); sky.drifted = true;
    sky.color = [128, 128, 128, 128]; sky.driftColor = [255, 128, 128, 128];
  }
}

function readBlock(el: XNode): Block {
  const pos = child(el, 'position');
  const ut = child(el, 'usetexture');
  const ph = child(el, 'physics');
  const edges = child(el, 'edges');
  const colEl = child(el, 'collision');
  const b = new Block(attr(el, 'id'));
  b.texture = 'default';
  if (ut) {
    b.texture = attr(ut, 'id', 'default');
    b.textureScale = f(atof(attr(ut, 'scale', '1')));
    const c = (n: string) => { const v = attr(ut, n); return v !== '' ? atoi(v) : 255; };
    b.blendColor = [c('color_r'), c('color_g'), c('color_b'), c('color_a')];
  }
  if (pos) {
    b.initialPosition = v2(atof(attr(pos, 'x', '0')), atof(attr(pos, 'y', '0')));
    b.background = attr(pos, 'background', 'false') === 'true';
    b.dynamic = attr(pos, 'dynamic', 'false') === 'true';
    b.physics = attr(pos, 'physics', 'false') === 'true';
    if (b.physics) b.dynamic = true;
    b.isLayer = attr(pos, 'islayer', 'false') === 'true';
    b.layer = atoi(attr(pos, 'layerid', '-1'));
  }
  if (ph) {
    b.gripPer20 = f(atof(attr(ph, 'grip', '20.0')));
    const m = attr(ph, 'mass', '30.000000');
    b.mass = m === 'INFINITY' ? f(5000000000000000.0) : f(atof(m));
    b.friction = f(atof(attr(ph, 'friction', '0.500000')));
    b.elasticity = f(atof(attr(ph, 'elasticity', '0.000000')));
  }
  if (edges) {
    const m = attr(edges, 'drawmethod', 'angle');
    b.edgeDrawMethod = m === 'inside' ? 'inside' : m === 'outside' ? 'outside' : 'angle';
    b.edgeAngle = f(atof(attr(edges, 'angle', '270.0')));
    for (const mat of children(edges, 'material')) {
      b.edgeMaterials.push({
        name: attr(mat, 'name', 'not_used'), texture: attr(mat, 'edge', ''),
        color: [atoi(attr(mat, 'color_r', '255')), atoi(attr(mat, 'color_g', '255')), atoi(attr(mat, 'color_b', '255')), atoi(attr(mat, 'color_a', '255'))],
        scale: f(atof(attr(mat, 'scale', '-1.0f'))), depth: f(atof(attr(mat, 'depth', '-1.0f'))),
      });
    }
  }
  if (colEl) {
    b.collisionMethod = attr(colEl, 'type', 'None');
    b.collisionRadius = f(atof(attr(colEl, 'radius', '0.0')));
  }
  let first = true, lastX = 0, lastY = 0;
  for (const v of children(el, 'vertex')) {
    const vx = new BlockVertex(v2(atof(attr(v, 'x', '0')), atof(attr(v, 'y', '0'))), attr(v, 'edge', ''));
    const r = attr(v, 'color_r'), g = attr(v, 'color_g'), bb = attr(v, 'color_b'), a = attr(v, 'color_a');
    if (r || g || bb || a) vx.color = [atoi(r || '255'), atoi(g || '255'), atoi(bb || '255'), atoi(a || '255')];
    if (first) first = false;
    else if (lastX === vx.pos.x && lastY === vx.pos.y) continue;
    b.vertices.push(vx);
    lastX = vx.pos.x; lastY = vx.pos.y;
  }
  return b;
}

function readEntity(el: XNode): Entity {
  const id = attr(el, 'id'), typeId = attr(el, 'typeid');
  let pos = v2(0, 0), angle = -1, reversed = false, size = f(0.2), width = -1, height = -1, z = f(0.5);
  let spriteName = '', typeName = '';
  const p = child(el, 'position');
  if (p) {
    pos = v2(atof(attr(p, 'x', '0')), atof(attr(p, 'y', '0')));
    angle = f(atof(attr(p, 'angle', '-1.0')));
    reversed = attr(p, 'reversed', 'false') === 'true';
  }
  const s = child(el, 'size');
  if (s) {
    size = f(atof(attr(s, 'r', '0.2')));
    width = f(atof(attr(s, 'width', '-1.0')));
    height = f(atof(attr(s, 'height', '-1.0')));
  }
  for (const prm of children(el, 'param')) {
    const n = attr(prm, 'name'), v = attr(prm, 'value');
    if (n === 'z') z = f(atof(v));
    else if (n === 'name') spriteName = v;
    else if (n === 'type') typeName = v;
  }
  const sp = SPECIALITY[typeId] ?? ET_NONE;
  const name = sp === ET_NONE ? spriteName : sp === ET_PARTICLES_SOURCE ? typeName : typeId;
  const e = new Entity(id, typeId, pos, size, z, name);
  if (width > 0) e.width = width;
  if (height > 0) e.height = height;
  if (angle > 0) e.drawAngle = angle;
  e.drawReversed = reversed;
  return e;
}

/** Level::addLimits: the four border blocks (static, drawn in the second layer) */
function addLimits(l: Level): void {
  const m = 20;
  const add = (id: string, pts: [number, number][]): void => {
    const b = new Block(id);
    if (l.borderTexture) b.texture = l.borderTexture;
    for (const [x, y] of pts) b.vertices.push(new BlockVertex(v2(x, y)));
    b.isLayer = true;
    l.blocks.push(b);
  };
  const L = l.leftLimit, R = l.rightLimit, T = l.topLimit, B = l.bottomLimit;
  add('LEVEL_TOP', [[f(L - m), f(T + m)], [f(R + m), f(T + m)], [R, T], [L, T]]);
  add('LEVEL_BOTTOM', [[R, B], [f(R + m), f(B - m)], [f(L - m), f(B - m)], [L, B]]);
  add('LEVEL_LEFT', [[L, T], [L, B], [f(L - m), f(B - m)], [f(L - m), f(T + m)]]);
  add('LEVEL_RIGHT', [[R, T], [f(R + m), f(T + m)], [f(R + m), f(B - m)], [R, B]]);
}

/** Scene::_GenerateLevel: the collision grid's bounds and the four limit lines */
export function generateLevel(l: Level, col: CollisionSystem, p: Phys): void {
  let minX = l.leftLimit, maxX = l.rightLimit, minY = l.bottomLimit, maxY = l.topLimit;
  for (const b of l.blocks) {
    for (const v of b.vertices) {
      const x = f(b.initialPosition.x + v.pos.x), y = f(b.initialPosition.y + v.pos.y);
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  col.reset();
  col.setDims(minX, minY, maxX, maxY);
  l.loadToPlay(col, p);
  const g = p.bikeWheelBlockGrip;
  col.defineLine(l.leftLimit, l.topLimit, l.leftLimit, l.bottomLimit, g);
  col.defineLine(l.leftLimit, l.bottomLimit, l.rightLimit, l.bottomLimit, g);
  col.defineLine(l.rightLimit, l.bottomLimit, l.rightLimit, l.topLimit, g);
  col.defineLine(l.rightLimit, l.topLimit, l.leftLimit, l.topLimit, g);
}
