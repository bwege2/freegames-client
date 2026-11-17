// KikiSound (src/sound/KikiSound.cpp): the sound ids, their files and volumes.
export const Snd = {
  BOT_MOVE: 0, BOT_JUMP: 1, BOT_LAND: 2, BOT_SPIKED: 3, BOT_HEALTH_ALERT: 4, BOT_DEATH: 5, BOT_NO_ENERGY: 6,
  BULLET_SHOT: 7, BULLET_HIT_WALL: 8, BULLET_HIT_OBJECT: 9, BULLET_HIT_PLAYER: 10, BULLET_HIT_MUTANT: 11,
  STONE_MOVE: 12, STONE_LAND: 13, SWITCH_ON: 14, SWITCH_OFF: 15, ATOM_BIRTH: 16, ATOM_DIGEST: 17,
  SPIKES_START: 18, MENU_FADE: 19, MENU_ITEM: 20, MENU_SELECT: 21, MENU_ABORT: 22, GATE_OPEN: 23,
  GATE_CLOSE: 24, GATE_WARP: 25, BOMB_EXPLODE: 26, BOMB_SPLITTER: 27, GEAR_ON: 28, GEAR_OFF: 29,
  GENERATOR_ON: 30, GENERATOR_OFF: 31, MOTOR: 32,
} as const;

/** KikiSounds[]: file and default volume per id */
export const SOUNDS: [string, number][] = [
  ['bot_move.wav', 0.2], ['bot_jump.wav', 0.7], ['bot_land.wav', 0.7], ['bot_move.wav', 1.0],
  ['bot_health_alert.wav', 1.0], ['bot_death.wav', 1.0], ['bot_no_energy.wav', 1.0], ['bullet_shot.wav', 1.0],
  ['bullet_hit_wall.wav', 1.0], ['bullet_hit_object.wav', 1.0], ['bullet_hit_player.wav', 1.0],
  ['bullet_hit_mutant.wav', 1.0], ['stone_move.wav', 1.0], ['stone_land.wav', 1.0], ['switch_on.wav', 1.0],
  ['switch_on.wav', 0.5], ['atom_digest.wav', 1.0], ['atom_digest.wav', 1.0], ['bot_move.wav', 1.0],
  ['menu_fade.wav', 1.0], ['menu_item.wav', 1.0], ['menu_select.wav', 1.0], ['menu_abort.wav', 1.0],
  ['gate_open.wav', 1.0], ['gate_close.wav', 1.0], ['gate_warp.wav', 1.0], ['bomb_explode.wav', 1.0],
  ['bomb_splitter.wav', 1.0], ['gear_on.wav', 1.0], ['gear_off.wav', 1.0], ['generator_on.wav', 1.0],
  ['generator_off.wav', 1.0], ['bomb_splitter.wav', 1.0],
];

export interface KikiSound {
  playSound(id: number, volume?: number, loops?: number): void;
  playSoundAtPos(id: number, pos: { x: number; y: number; z: number }, factor?: number): void;
  setMute(m: boolean): void;
  isMute(): boolean;
  setSoundVolume(v: number): void;
  getSoundVolume(): number;
}

/** a sound that only records what is played (headless runs, tests) */
export class SilentSound implements KikiSound {
  played: [number, number][] = [];
  private mute = false;
  private volume = 50;
  playSound(id: number, volume = -1): void { if (!this.mute) this.played.push([id, volume]); }
  playSoundAtPos(id: number): void { if (!this.mute) this.played.push([id, -2]); }
  setMute(m: boolean): void { this.mute = m; }
  isMute(): boolean { return this.mute; }
  setSoundVolume(v: number): void { this.volume = v; }
  getSoundVolume(): number { return this.volume; }
}
