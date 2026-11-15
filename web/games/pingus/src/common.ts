// Small shared pieces of the game logic: float arithmetic as C++ float does it, Vector3f, the ground types
// (groundtype.hpp), the action names (action_name.cpp), the pingu constants (pingu_enums.hpp), globals
// (globals.cpp) and the sound calls (engine/sound/sound.cpp), which the browser connects to its mixer.

export const f32 = Math.fround;

/** Vector3f with float components; every operation rounds to float as the C++ code does */
export class Vec3 {
  x: number;
  y: number;
  z: number;
  constructor(x = 0, y = 0, z = 0) { this.x = f32(x); this.y = f32(y); this.z = f32(z); }
  clone() { return new Vec3(this.x, this.y, this.z); }
  add(v: Vec3) { return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z); }
  sub(v: Vec3) { return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z); }
  mul(m: number) { return new Vec3(f32(m) * this.x, f32(m) * this.y, f32(m) * this.z); }
  addTo(v: Vec3) { this.x = f32(this.x + v.x); this.y = f32(this.y + v.y); this.z = f32(this.z + v.z); return this; }
  subFrom(v: Vec3) { this.x = f32(this.x - v.x); this.y = f32(this.y - v.y); this.z = f32(this.z - v.z); return this; }
  length() { return f32(Math.sqrt(f32(f32(f32(this.x * this.x) + f32(this.y * this.y)) + f32(this.z * this.z)))); }
  normalize() {
    const f = this.length();
    if (f) { this.x = f32(this.x / f); this.y = f32(this.y / f); this.z = f32(this.z / f); }
  }
}

export const GP_NOTHING = 0, GP_SOLID = 1, GP_TRANSPARENT = 2, GP_GROUND = 3, GP_BRIDGE = 4, GP_WATER = 5,
  GP_LAVA = 6, GP_REMOVE = 7, GP_OUTOFSCREEN = 8;

export function groundtypeFromString(s: string): number {
  switch (s) {
    case 'solid': return GP_SOLID;
    case 'transparent': return GP_TRANSPARENT;
    case 'ground': return GP_GROUND;
    case 'bridge': return GP_BRIDGE;
    case 'water': return GP_WATER;
    case 'lava': return GP_LAVA;
    case 'remove': return GP_REMOVE;
    default: return GP_GROUND;
  }
}

/** ActionName::Enum, in its order (ActionHolder's std::map sorts by it: the button panel's order) */
export const ACTIONS = ['angel', 'basher', 'blocker', 'boarder', 'bomber', 'bridger', 'climber', 'digger', 'drown',
  'exiter', 'faller', 'floater', 'jumper', 'laserkill', 'miner', 'slider', 'smashed', 'splashed', 'superman',
  'teleported', 'waiter', 'walker'] as const;
export type ActionName = typeof ACTIONS[number];
export const actionIndex = (a: ActionName) => ACTIONS.indexOf(a);
/** ActionName::from_string: unknown names are walkers */
export const actionFromString = (s: string): ActionName => ((ACTIONS as readonly string[]).includes(s) ? s as ActionName : 'walker');
const SCREEN_NAMES: Record<ActionName, string> = {
  angel: 'Angel', basher: 'Basher', blocker: 'Blocker', boarder: 'Boarder', bomber: 'Bomber', bridger: 'Bridger',
  climber: 'Climber', digger: 'Digger', drown: 'Drown', exiter: 'Exiter', faller: 'Faller', floater: 'Floater',
  jumper: 'Jumper', laserkill: 'Laserkill', miner: 'Miner', slider: 'Slider', smashed: 'Smashed', splashed: 'Splashed',
  superman: 'Superman', teleported: 'Teleported', waiter: 'Waiter', walker: 'Walker',
};
export const actionScreenName = (a: ActionName) => SCREEN_NAMES[a];

export const DEADLY_VELOCITY = f32(10.4);
export const TERMINAL_VELOCITY = f32(11.0);
export const PINGU_HEIGHT = 26;

export const LEFT = -1, RIGHT = 1;

export const globals = {
  gameSpeed: 20,
  fastForwardTimeScale: 4,
  developerMode: false,
  tileSize: 32,
  defaultScreenWidth: 800,
  defaultScreenHeight: 600,
  autoScrolling: true,
  staticGraphics: false,
  musicEnabled: true,
  soundEnabled: true,
};

export interface SoundOut {
  playSound(name: string, volume: number, panning: number): void;
  playMusic(name: string, volume: number, loop: boolean): void;
  stopMusic(): void;
}
let soundOut: SoundOut | null = null;
export function setSoundOut(s: SoundOut | null) { soundOut = s; }
/** Sound::PingusSound::play_sound ("ohno" → sounds/ohno.wav) */
export function playSound(name: string, volume = 1, panning = 0) { soundOut?.playSound(name, volume, panning); }
export function playMusic(name: string, volume = 1, loop = true) { soundOut?.playMusic(name, volume, loop); }
export function stopMusic() { soundOut?.stopMusic(); }
