// The music in the audio thread: the original callback (music.ts) behind a resampler. Messages:
// { loudness } (setMusicLoudness) and { restart: true } (restartMusic).
import { MusicPlayer, Resampler } from './music.ts';
import type { Image } from './assets.ts';

declare const sampleRate: number;
declare function registerProcessor(name: string, ctor: unknown): void;
declare class AudioWorkletProcessor {
  readonly port: MessagePort;
  constructor(options?: unknown);
}

class PassageMusic extends AudioWorkletProcessor {
  private readonly player: MusicPlayer;
  private readonly resampler: Resampler;

  constructor(options: { processorOptions: { music: Image; loudness: number } }) {
    super(options);
    this.player = new MusicPlayer(options.processorOptions.music);
    this.player.loudness = options.processorOptions.loudness;
    this.resampler = new Resampler(this.player, sampleRate);
    this.port.onmessage = (e: MessageEvent<{ loudness?: number; restart?: boolean }>) => {
      if (e.data.loudness !== undefined) this.player.loudness = e.data.loudness;
      if (e.data.restart) {
        this.player.restart();
        this.resampler.reset();
      }
    };
  }

  process(_inputs: Float32Array[][], outputs: Float32Array[][]): boolean {
    const [l, r] = outputs[0];
    this.resampler.render(l, r ?? new Float32Array(l.length));
    return true;
  }
}

registerProcessor('passage-music', PassageMusic);
