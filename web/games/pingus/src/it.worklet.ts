// The IT player (it.ts) in the audio thread: "play" brings a module's bytes and whether it loops, "stop"
// silences it.
import { ITPlayer, parseIT } from './it.ts';

declare const sampleRate: number;
declare function registerProcessor(name: string, ctor: unknown): void;
declare class AudioWorkletProcessor {
  readonly port: MessagePort;
  constructor(options?: unknown);
}

class PingusIT extends AudioWorkletProcessor {
  private player: ITPlayer | null = null;

  constructor(options?: unknown) {
    super(options);
    this.port.onmessage = (e: MessageEvent<{ t: string; data?: ArrayBuffer; loop?: boolean }>) => {
      const m = e.data;
      if (m.t === 'play' && m.data) {
        try { this.player = new ITPlayer(parseIT(new Uint8Array(m.data)), sampleRate, m.loop ?? true); } catch { this.player = null; }
      } else if (m.t === 'stop') {
        this.player = null;
      }
    };
  }

  process(_inputs: Float32Array[][], outputs: Float32Array[][]): boolean {
    const out = outputs[0];
    if (this.player && out.length >= 2) {
      this.player.render(out[0], out[1]);
      if (this.player.ended) this.player = null;
    }
    return true;
  }
}

registerProcessor('pingus-it', PingusIT);
