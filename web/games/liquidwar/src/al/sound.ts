// al/sound.ts: Allegro's play_sample, play_midi and set_volume as Liquid War calls them. Every call goes
// to the trace (the oracle logs the same calls, oracle.c) and to the page's player (al/audio.ts), which
// mixes the samples and plays the MIDI music with the Web Audio API.

import type { Midi, Sample } from './datafile.ts';
import { sys } from './sys.ts';

export interface SoundSink {
  play_sample(s: Sample, vol: number, pan: number, freq: number, loop: number): void;
  play_midi(m: Midi | null, loop: number): void;
  set_volume(digi: number, midi: number): void;
}

export const soundHooks = {
  trace: null as ((line: string) => void) | null,
  sink: null as SoundSink | null,
  /** index of a MIDI in the game's list, for the trace */
  midiIndex: (m: Midi): number => {
    void m;
    return -1;
  },
};

function ms(): number {
  return Math.floor(sys.vt / 1000);
}

export function play_sample(s: Sample, vol: number, pan: number, freq: number, loop: number): number {
  soundHooks.trace?.(`S ${ms()} ${s.name ?? '?'} ${vol} ${pan} ${freq} ${loop}`);
  soundHooks.sink?.play_sample(s, vol, pan, freq, loop);
  return 0;
}

export function play_midi(m: Midi | null, loop: number): number {
  soundHooks.trace?.(`M ${ms()} ${m ? soundHooks.midiIndex(m) : -1} ${loop}`);
  soundHooks.sink?.play_midi(m, loop);
  return 0;
}

export function set_volume(digi: number, midi: number): void {
  soundHooks.trace?.(`V ${ms()} ${digi} ${midi}`);
  soundHooks.sink?.set_volume(digi, midi);
}
