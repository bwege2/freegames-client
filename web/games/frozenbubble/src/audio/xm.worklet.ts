// The XM player (xm.ts) in the audio thread: the module's bytes arrive once; "volume" and "playing"
// messages follow the mixer (fades, pause, F11/F12).
import { parseXM, XMPlayer } from './xm.ts';

declare const sampleRate: number;
declare function registerProcessor(name: string, ctor: unknown): void;
declare class AudioWorkletProcessor {
  readonly port: MessagePort;
  constructor(options?: unknown);
}

class FbXM extends AudioWorkletProcessor {
  private player: XMPlayer | null = null;
  private playing = false;

  constructor(options?: unknown) {
    super(options);
    this.port.onmessage = (e: MessageEvent<{ t: string; data?: ArrayBuffer; v?: number; on?: boolean }>) => {
      const m = e.data;
      if (m.t === 'load' && m.data) this.player = new XMPlayer(parseXM(new Uint8Array(m.data)), sampleRate);
      else if (m.t === 'volume' && this.player) this.player.volume = m.v ?? 1;
      else if (m.t === 'playing') this.playing = !!m.on;
      else if (m.t === 'restart' && this.player) { const v = this.player.volume; this.player = new XMPlayer(this.player.s, sampleRate); this.player.volume = v; }
    };
  }

  process(_inputs: Float32Array[][], outputs: Float32Array[][]): boolean {
    const out = outputs[0];
    if (this.player && this.playing && out.length >= 2) this.player.render(out[0], out[1]);
    return true;
  }
}

registerProcessor('fb-xm', FbXM);
