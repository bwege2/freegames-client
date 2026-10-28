// The SID in the audio thread: register writes arrive from the program with their 6502 time (batches
// of SidWrite), samples go out at the AudioContext's rate (sid.ts).
import { SidPlayer, type SidWrite } from './sid.ts';

declare const sampleRate: number;
declare function registerProcessor(name: string, ctor: unknown): void;
declare class AudioWorkletProcessor {
  readonly port: MessagePort;
  constructor(options?: unknown);
}

class WormsSid extends AudioWorkletProcessor {
  private readonly player = new SidPlayer(sampleRate);

  constructor(options?: unknown) {
    super(options);
    this.port.onmessage = (e: MessageEvent<SidWrite[]>) => this.player.push(e.data);
  }

  process(_inputs: Float32Array[][], outputs: Float32Array[][]): boolean {
    const out = outputs[0];
    this.player.render(out[0]);
    for (let c = 1; c < out.length; c++) out[c].set(out[0]);
    return true;
  }
}

registerProcessor('worms-sid', WormsSid);
