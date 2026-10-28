// The sound chip in the audio thread (psg.c's SDL audio callback): register writes arrive from the game
// as messages (batches of PsgWrite), the samples go out at the AudioContext's rate.
import { PsgPlayer, type PsgWrite } from './psg.ts';

declare const sampleRate: number;
declare function registerProcessor(name: string, ctor: unknown): void;
declare class AudioWorkletProcessor {
  readonly port: MessagePort;
  constructor(options?: unknown);
}

class BallerburgPsg extends AudioWorkletProcessor {
  private readonly player = new PsgPlayer(sampleRate);

  constructor(options?: unknown) {
    super(options);
    this.port.onmessage = (e: MessageEvent<PsgWrite[]>) => {
      for (const w of e.data) this.player.apply(w);
    };
  }

  process(_inputs: Float32Array[][], outputs: Float32Array[][]): boolean {
    const out = outputs[0];
    this.player.render(out[0]);
    for (let c = 1; c < out.length; c++) out[c].set(out[0]);
    return true;
  }
}

registerProcessor('ballerburg-psg', BallerburgPsg);
