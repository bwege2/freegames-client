// One Lugaru map: the terrain heightmap, the objects, the people and the level rules
// (kill everyone, main campaign, the map's opening dialogue).
import { vec3, type Vec3, distsqflat, distance, doRotation } from '../data/math.ts';
import { type HeightMap, heightAt } from '../data/heightmap.ts';
import { OBJECT_TYPE, type MapData, type MapDialog } from '../data/map.ts';
import type { AnimationData } from '../data/animation.ts';
import type { CreatureData } from './creatures.ts';
import { Person, type Collider, type PersonInput, type WorldLike } from './person.ts';
import type { AudioBank } from '../load.ts';

export interface WorldObject {
  type: number;
  position: Vec3;
  yaw: number;
  pitch: number;
  scale: number;
  /** horizontal collision radius (0 for decorative bushes/leaves) */
  radius: number;
  /** collision height above position.y */
  height: number;
}

export interface DialogueState {
  scenes: MapDialog['scenes'];
  index: number;
  time: number;
  /** seconds per scene; the original shows each line for a few seconds */
  perScene: number;
}

export interface BloodEvent {
  position: Vec3;
  amount: number;
  time: number;
}

export interface WorldOptions {
  map: MapData;
  heightmap: HeightMap;
  creatures: [CreatureData, CreatureData];
  animations: (id: string) => AnimationData;
  audio: AudioBank;
}

export class World implements WorldLike {
  readonly map: MapData;
  readonly heightmap: HeightMap;
  readonly creatures: [CreatureData, CreatureData];
  readonly persons: Person[] = [];
  readonly player: Person;
  readonly objects: WorldObject[] = [];
  readonly colliders: Collider[] = [];
  readonly audio: AudioBank;
  readonly bloodEvents: BloodEvent[] = [];
  readonly levelName: string;
  time = 0;
  cameraYaw: number;
  cameraPitch = -12;
  dialogue: DialogueState | null = null;
  won = false;
  lost = false;
  private readonly animations: (id: string) => AnimationData;
  private readonly spawnCoords: Vec3;
  private readonly spawnYaw: number;

  constructor(name: string, opts: WorldOptions) {
    this.levelName = name;
    this.map = opts.map;
    this.heightmap = opts.heightmap;
    this.creatures = opts.creatures;
    this.animations = opts.animations;
    this.audio = opts.audio;

    const m = opts.map.map;
    let lastScale = 1;
    for (const o of m.objects) {
      const [type, yaw, pitch, rawScale, position] = o;
      // Object::LoadObjectsFromJson: tree leaves inherit the previous object's scale.
      const scale = type === OBJECT_TYPE.treeLeaves ? lastScale : (rawScale || 1);
      lastScale = scale;
      const [x, rawY, z] = position;
      // Object::Object lowers bushes onto the terrain by .3
      const y = type === OBJECT_TYPE.bush ? heightAt(this.heightmap, x, z) - 0.3 : rawY;
      let radius = 0;
      let height = 0;
      // Model extents from Data/Models, after Object::Object's .3 * scale. The collider is a
      // cylinder around the object; the original uses the model's bounding sphere.
      if (type === OBJECT_TYPE.box || type === OBJECT_TYPE.weird || type === OBJECT_TYPE.cool) {
        radius = 7.5 * scale; height = 7.5 * scale;
      } else if (type === OBJECT_TYPE.wall) {
        radius = 16.8 * scale; height = 4.2 * scale;
      } else if (type === OBJECT_TYPE.platform) {
        radius = 15 * scale; height = 3 * scale;
      } else if (type === OBJECT_TYPE.rock) {
        radius = 8.25 * scale; height = 13.2 * scale;
      } else if (type === OBJECT_TYPE.treeTrunk) {
        radius = 0.75 * scale; height = 14.7 * scale;
      } else if (type === OBJECT_TYPE.tunnel) {
        radius = 7.8 * scale; height = 90 * scale;
      } else if (type === OBJECT_TYPE.chimney) {
        radius = 6 * scale; height = 20 * scale;
      } else if (type === OBJECT_TYPE.spike) {
        radius = 6.75 * scale; height = 13.8 * scale;
      }
      const obj: WorldObject = { type, position: vec3(x, y, z), yaw, pitch, scale, radius, height };
      this.objects.push(obj);
      if (radius > 0) this.colliders.push({ position: obj.position, radius, height });
    }

    this.player = this.spawn(m.players[0], 0);
    this.spawnCoords = { ...this.player.coords };
    this.spawnYaw = this.player.yaw;
    for (let i = 1; i < m.players.length; i++) this.spawn(m.players[i], i);
    this.cameraYaw = this.player.yaw;
    const dialogs = m.dialogs ?? [];
    if (dialogs.length > 0 && dialogs[0].scenes.length > 0) {
      this.dialogue = { scenes: dialogs[0].scenes, index: 0, time: 0, perScene: 3.4 };
      this.applyDialogPose(dialogs[0]);
    }
  }

  private spawn(mp: MapData['map']['players'][number], id: number): Person {
    const data = this.creatures[mp.creature === 1 ? 1 : 0];
    const person = new Person({
      id,
      creature: mp.creature === 1 ? 1 : 0,
      data,
      mapPlayer: mp,
      animations: this.animations,
      hostile: this.map.map.hostile === 1 && id !== 0,
    });
    // The original places everyone at the map coordinate; y is the terrain height.
    person.coords.y = Math.max(person.coords.y, heightAt(this.heightmap, person.coords.x, person.coords.z));
    this.persons.push(person);
    return person;
  }

  private applyDialogPose(dialog: MapDialog): void {
    for (let i = 0; i < dialog.participant.length && i < this.persons.length; i++) {
      const p = dialog.participant[i];
      if (p.pos[0] === 0 && p.pos[1] === 0 && p.pos[2] === 0) continue;
      this.persons[i].coords = vec3(p.pos[0], p.pos[1], p.pos[2]);
      this.persons[i].yaw = p.yaw;
      this.persons[i].targetYaw = p.yaw;
    }
  }

  sound(name: string, at: Vec3, gain = 1): void {
    const d = distance(at, this.player.coords);
    const attenuation = Math.max(0, 1 - d / 30);
    const dx = at.x - this.player.coords.x;
    const dz = at.z - this.player.coords.z;
    const pan = Math.max(-1, Math.min(1, dx / Math.max(1, Math.abs(dx) + Math.abs(dz))));
    void this.audio.play(name, gain * attenuation, pan);
  }

  blood(at: Vec3, amount: number): void {
    this.bloodEvents.push({ position: { ...at }, amount, time: this.time });
    if (this.bloodEvents.length > 120) this.bloodEvents.shift();
  }

  get inDialogue(): boolean {
    return this.dialogue !== null;
  }

  advanceDialogue(): void {
    if (!this.dialogue) return;
    this.dialogue.index++;
    this.dialogue.time = 0;
    if (this.dialogue.index >= this.dialogue.scenes.length) {
      this.dialogue = null;
      // The dialogue staged the participants; put the player back at the map spawn.
      this.player.coords = { ...this.spawnCoords };
      this.player.yaw = this.spawnYaw;
      this.player.targetYaw = this.spawnYaw;
    }
  }

  update(dt: number, input: PersonInput): void {
    this.time += dt;
    if (this.dialogue) {
      this.player.play(this.player.kind === 'wolf' ? 'wolfidle' : 'talkidleanim', true, 1);
      return;
    }
    this.player.update(dt, this, input);
    for (const p of this.persons) if (p !== this.player) p.update(dt, this);

    // Level rules: maptype 0 (kill everyone) is the main campaign's only type.
    if (!this.won && !this.lost) {
      if (this.player.dead >= 2) {
        this.lost = true;
      } else {
        let alive = false;
        for (const p of this.persons) {
          if (p.id !== 0 && !p.dead && !p.down) alive = true;
        }
        if (!alive) this.won = true;
      }
    }
    // keep the camera's target on the player
    if (Number.isFinite(this.player.coords.x)) {
      this.player.coords.y = Math.max(this.player.coords.y, heightAt(this.heightmap, this.player.coords.x, this.player.coords.z));
    }
  }

  nearestPerson(to: Vec3, except?: Person): Person | null {
    let best: Person | null = null;
    let bestD = Infinity;
    for (const p of this.persons) {
      if (p === except || p.dead >= 2) continue;
      const d = distsqflat(to, p.coords);
      if (d < bestD) { bestD = d; best = p; }
    }
    return best;
  }

  /** The camera's world position: behind the player, looking at the chest, pulled in by walls. */
  cameraPosition(): Vec3 {
    if (this.dialogue) {
      const c = this.dialogueCamera();
      if (c) return c.pos;
    }
    const yaw = (this.cameraYaw * Math.PI) / 180;
    const pitch = (this.cameraPitch * Math.PI) / 180;
    const dist = 6.0;
    const target = { x: this.player.coords.x, y: this.player.coords.y + 1.25, z: this.player.coords.z };
    const dir = {
      x: Math.sin(yaw) * Math.cos(pitch),
      y: Math.sin(pitch) + 0.09,
      z: Math.cos(yaw) * Math.cos(pitch),
    };
    let t = 1;
    // The original's camera line-checks the terrain and the objects (Game::TickOnceAfter).
    for (let s = 0.12; s <= 1.0001; s += 0.04) {
      const p = { x: target.x + dir.x * dist * s, y: target.y + dir.y * dist * s, z: target.z + dir.z * dist * s };
      if (heightAt(this.heightmap, p.x, p.z) > p.y - 0.35 || this.insideCollider(p)) {
        t = Math.max(0.12, s - 0.05);
        break;
      }
    }
    const pos = { x: target.x + dir.x * dist * t, y: target.y + dir.y * dist * t, z: target.z + dir.z * dist * t };
    pos.y = Math.max(pos.y, heightAt(this.heightmap, pos.x, pos.z) + 0.55);
    return pos;
  }

  private insideCollider(p: Vec3): boolean {
    for (const o of this.colliders) {
      if (p.y < o.position.y - 0.2 || p.y > o.position.y + o.height) continue;
      const dx = p.x - o.position.x, dz = p.z - o.position.z;
      if (dx * dx + dz * dz < o.radius * o.radius) return true;
    }
    return false;
  }

  cameraTarget(): Vec3 {
    if (this.dialogue) {
      const c = this.dialogueCamera();
      if (c) return c.target;
    }
    return { x: this.player.coords.x, y: this.player.coords.y + 1.25, z: this.player.coords.z };
  }

  private dialogueCamera(): { pos: Vec3; target: Vec3 } | null {
    const d = this.dialogue;
    if (!d) return null;
    const scene = d.scenes[d.index];
    if (!scene) return null;
    const original = vec3(scene.camera.pos[0], scene.camera.pos[1], scene.camera.pos[2]);
    let f = doRotation(vec3(0, 0, -1), -scene.camera.pitch, 0, 0);
    f = doRotation(f, 0, -scene.camera.yaw, 0);
    const target = { x: original.x + f.x * 6, y: original.y + f.y * 6, z: original.z + f.z * 6 };
    // pull back a little so both speakers fit in the 62 degree view
    const pos = { x: original.x - f.x * 1.6, y: original.y + 0.15, z: original.z - f.z * 1.6 };
    return { pos, target };
  }
}
