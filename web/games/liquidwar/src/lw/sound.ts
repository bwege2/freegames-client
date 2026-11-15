// lw/sound.ts: src/sound.c (the sound effects and the water sounds, a timer every 2 s playing one of the
// water samples left or right, chosen from a table of random numbers made at start) and src/music.c.

import { play_midi, play_sample, set_volume } from '../al/sound.ts';
import type { Sample } from '../al/datafile.ts';
import { sys } from '../al/sys.ts';
import { random } from '../glibc.ts';
import { G } from './state.ts';

const HASARD_SIZE = 1024;
const HASARD_VALUE = new Int32Array(HASARD_SIZE);
let HASARD_INDEX = 0;
const SOUND_VOLUME_VALUES = [0, 8, 10, 13, 16, 20, 25, 32, 40, 51, 64, 81, 101, 128, 161, 204, 255];
const WATER_DELAY = 2000;

function water_handler(): void {
  HASARD_INDEX++;
  HASARD_INDEX = HASARD_INDEX % HASARD_SIZE;
  if (G.WATER_VOLUME > 0) {
    const pan = HASARD_INDEX % 2 ? 192 : 64;
    const hasard = HASARD_VALUE[HASARD_INDEX]! % G.SAMPLE_WATER_NUMBER;
    play_sample(G.SAMPLE_WATER[hasard]!, SOUND_VOLUME_VALUES[G.WATER_VOLUME]!, pan, 1000, 0);
  }
}

export function start_water(): void {
  for (let i = 0; i < HASARD_SIZE; ++i) HASARD_VALUE[i] = (random() + i) | 0;
  if (G.LOADED_WATER) {
    G.WATER_VOLUME = G.CONFIG_WATER_VOLUME_MENU;
    // install_int_ex(water_handler, MSEC_TO_TIMER(2000)): the oracle runs it every 2000 ms of its clock
    sys.installTimer(water_handler, WATER_DELAY * 1000);
    water_handler();
  }
}

export function stop_water(): void {
  sys.removeTimer(water_handler);
}

function my_play_sample(s: Sample | null, vol: number): void {
  if (vol > 0 && s) play_sample(s, SOUND_VOLUME_VALUES[vol - 1]!, 128, 1000, 0);
}

export function play_click(): void {
  if (G.LOADED_SFX) my_play_sample(G.SAMPLE_SFX_CLICK, G.CONFIG_CLICK_VOLUME);
}

export function play_go(): void {
  if (G.LOADED_SFX) my_play_sample(G.SAMPLE_SFX_GO, G.CONFIG_SFX_VOLUME);
}

export function play_win(): void {
  if (G.LOADED_SFX) my_play_sample(G.SAMPLE_SFX_WIN, G.CONFIG_SFX_VOLUME);
}

export function play_time(): void {
  if (G.LOADED_SFX) my_play_sample(G.SAMPLE_SFX_TIME, G.CONFIG_SFX_VOLUME);
}

export function play_loose(): void {
  if (G.LOADED_SFX) my_play_sample(G.SAMPLE_SFX_LOOSE, G.CONFIG_SFX_VOLUME);
}

export function play_connect(): void {
  if (G.LOADED_SFX) my_play_sample(G.SAMPLE_SFX_CONNECT, G.CONFIG_SFX_VOLUME);
}

// ---- music.c ----

const MUSIC_VOLUME_VALUES = [0, 16, 32, 48, 64, 80, 96, 112, 128, 144, 160, 176, 192, 208, 224, 240, 255];
let last_volume = -1;
let last_file = -1;

export function start_music(): void {
  if (G.STARTUP_MUSIC_STATE && G.MIDI_MUSIC_NUMBER >= 0) {
    let i;
    if (G.MIDI_MUSIC_NUMBER >= 2) {
      do i = random() % G.MIDI_MUSIC_NUMBER;
      while (i === last_file);
    } else i = 0;
    last_file = i;
    if (G.CONFIG_MUSIC_VOLUME !== last_volume) {
      set_volume(-1, MUSIC_VOLUME_VALUES[G.CONFIG_MUSIC_VOLUME]!);
      last_volume = G.CONFIG_MUSIC_VOLUME;
    }
    play_midi(G.MIDI_MUSIC[i] ?? null, -1);
  }
}

export function stop_music(): void {
  if (G.STARTUP_MUSIC_STATE) play_midi(null, 0);
}
