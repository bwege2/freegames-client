// SDL_mixer 1.2.12 as the game sees it: chunks, channels, one music. The state the program can query
// (Mix_PlayingMusic, Mix_FadingMusic, volumes) follows the program's clock (SDL_GetTicks): a fade-out
// of 500 ms ends 500 ms later in game time, in the page and in the tests alike (the oracle's shim has
// the same model, re/frozenbubble/oracle/shim.c). What is heard is the sink's business (Web Audio in
// the page); `log` gets the lines the oracle writes to its trace.

export const MIX_MAX_VOLUME = 128;
export const MIX_NO_FADING = 0, MIX_FADING_OUT = 1, MIX_FADING_IN = 2;
const MIX_CHANNELS = 8;

export interface Chunk { name: string; volume: number }
export interface Music { name: string }

/** what is heard (the page's Web Audio) */
export interface MixerSink {
  playChannel(chunk: Chunk, channel: number, loops: number): void;
  playMusic(music: Music, loops: number): void;
  fadeOutMusic(ms: number): void;
  haltMusic(): void;
  pauseMusic(): void;
  resumeMusic(): void;
  musicVolume(v: number): void;
  channelVolume(channel: number, v: number): void;
}

export class Mixer {
  private cur: Music | null = null;
  private fading = MIX_NO_FADING;
  private fadeEnd = 0;
  private paused = 0;
  private musicVol = MIX_MAX_VOLUME;
  private readonly chanVol = new Array<number>(MIX_CHANNELS).fill(MIX_MAX_VOLUME);
  private nextChannel = 0;
  private readonly ticks: () => number;
  private readonly sink: MixerSink;
  private readonly log: (line: string) => void;

  constructor(ticks: () => number, sink: MixerSink, log: (line: string) => void = () => {}) {
    this.ticks = ticks;
    this.sink = sink;
    this.log = log;
  }

  private update(): void {
    if (!this.cur) return;
    if (this.fading !== MIX_NO_FADING && this.ticks() >= this.fadeEnd) {
      if (this.fading === MIX_FADING_OUT) {
        this.cur = null;
        this.log(`M ${this.fadeEnd} stopped`);
      }
      this.fading = MIX_NO_FADING;
    }
  }

  private opened = false;

  openAudio(frequency: number, format: number, channels: number, chunksize: number): void {
    this.log(`A ${this.ticks()} open ${frequency} ${format} ${channels} ${chunksize}`);
    this.opened = true;
  }

  /** Mix_CloseAudio (when the program ends, SDL::Mixer's object goes) */
  closeAudio(): void {
    if (!this.opened) return;
    this.log(`A ${this.ticks()} close`);
    this.opened = false;
  }

  loadWAV(name: string): Chunk { return { name: name.replace(/.*\//, ''), volume: MIX_MAX_VOLUME }; }
  loadMUS(name: string): Music { return { name: name.replace(/.*\//, '') }; }

  volumeChunk(c: Chunk, v: number): number {
    const prev = c.volume;
    if (v >= 0) {
      if (v > MIX_MAX_VOLUME) v = MIX_MAX_VOLUME;
      c.volume = v;
      this.log(`V ${this.ticks()} chunk ${c.name} ${v}`);
    }
    return prev;
  }

  volume(ch: number, v: number): number {
    if (ch === -1) {
      let prev = 0;
      for (let i = 0; i < MIX_CHANNELS; i++) prev += this.volume(i, v);
      return Math.trunc(prev / MIX_CHANNELS);
    }
    if (ch < 0 || ch >= MIX_CHANNELS) return 0;
    const prev = this.chanVol[ch];
    if (v >= 0) {
      if (v > MIX_MAX_VOLUME) v = MIX_MAX_VOLUME;
      this.chanVol[ch] = v;
      this.log(`V ${this.ticks()} channel ${ch} ${v}`);
      this.sink.channelVolume(ch, v);
    }
    return prev;
  }

  volumeMusic(v: number): number {
    const prev = this.musicVol;
    if (v >= 0) {
      if (v > MIX_MAX_VOLUME) v = MIX_MAX_VOLUME;
      this.musicVol = v;
      this.log(`M ${this.ticks()} volume ${v}`);
      this.sink.musicVolume(v);
    }
    return prev;
  }

  /** Mix_PlayChannel(ch, chunk, loops) */
  playChannel(ch: number, c: Chunk, loops: number): number {
    this.log(`S ${this.ticks()} ${c.name} ${ch} ${loops}`);
    let used = ch;
    if (ch < 0) { used = this.nextChannel % MIX_CHANNELS; this.nextChannel++; }
    this.sink.playChannel(c, used, loops);
    return used;
  }

  /** Mix_PlayMusic: waits (100 ms steps of SDL_Delay) for a fade-out to end, as SDL_mixer does */
  async playMusic(m: Music, loops: number, delay: (ms: number) => Promise<void>): Promise<number> {
    this.update();
    while (this.cur && this.fading === MIX_FADING_OUT) { await delay(100); this.update(); }
    this.log(`M ${this.ticks()} play ${m.name} ${loops}`);
    this.cur = m;
    this.paused = 0;
    this.fading = MIX_NO_FADING;
    this.fadeEnd = this.ticks();
    this.sink.playMusic(m, loops);
    return 0;
  }

  fadeOutMusic(ms: number): number {
    this.update();
    if (!this.cur) return 0;
    if (ms <= 0) { this.haltMusic(); return 1; }
    this.log(`M ${this.ticks()} fadeout ${ms}`);
    if (this.fading !== MIX_FADING_OUT) {
      this.fading = MIX_FADING_OUT;
      this.fadeEnd = this.ticks() + ms;
      this.sink.fadeOutMusic(ms);
    }
    return 1;
  }

  haltMusic(): number {
    this.update();
    this.log(`M ${this.ticks()} halt`);
    this.cur = null;
    this.fading = MIX_NO_FADING;
    this.sink.haltMusic();
    return 0;
  }

  fadingMusic(): number { this.update(); return this.cur ? this.fading : MIX_NO_FADING; }
  playingMusic(): number { this.update(); return this.cur ? 1 : 0; }
  pauseMusic(): void { this.log(`M ${this.ticks()} pause`); this.paused = 1; this.sink.pauseMusic(); }
  resumeMusic(): void { this.log(`M ${this.ticks()} resume`); this.paused = 0; this.sink.resumeMusic(); }
  pausedMusic(): number { return this.paused; }
}
