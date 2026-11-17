// No Gravity port (GPL-3.0-or-later; translated in 2026 by the freegames project from realtech VR's
// No Gravity 2.0, GPL-2.0-or-later; LICENSE.md): the sound driver of the Linux build, SDL_mixer
// (rlx32/src/linux/snd_sdlmixer.c): 16 reserved channels with a volume and a panning each
// (Mix_SetPanning(left = 127 - 127 * pan, right = 127 + 127 * pan)), samples that loop when their
// loopend is set, no change of sampling rate (ChannelSetSamplingRate does nothing there), and one
// music stream (the OGG tracks, looping except the intro) with its own volume.

export interface Sample { buffer: AudioBuffer | null; loopend: number; sampleID: number }

interface Channel { play: boolean; sam: Sample | null; src: AudioBufferSourceNode | null; gain: GainNode; panL: GainNode; panR: GainNode; vol: number }

export class Mixer {
  private readonly ctx: AudioContext | null;
  private readonly out: GainNode | null;
  private channels: Channel[] = [];
  private music: { src: AudioBufferSourceNode; gain: GainNode } | null = null;
  musicVolume = 1;

  constructor(ctx: AudioContext | null) {
    this.ctx = ctx;
    this.out = ctx ? ctx.createGain() : null;
    if (ctx && this.out) this.out.connect(ctx.destination);
  }

  /** ChannelOpen(0, n) */
  open(n: number): void {
    const ctx = this.ctx;
    for (let i = 0; i < n; i++) {
      if (!ctx || !this.out) { this.channels.push({ play: false, sam: null, src: null, gain: null as unknown as GainNode, panL: null as unknown as GainNode, panR: null as unknown as GainNode, vol: 1 }); continue; }
      const gain = ctx.createGain();
      gain.channelCount = 2; gain.channelCountMode = 'explicit'; gain.channelInterpretation = 'speakers'; // mono -> both sides
      const split = ctx.createChannelSplitter(2), merge = ctx.createChannelMerger(2);
      const panL = ctx.createGain(), panR = ctx.createGain();
      gain.connect(split);
      split.connect(panL, 0); split.connect(panR, 1);
      panL.connect(merge, 0, 0); panR.connect(merge, 0, 1);
      merge.connect(this.out);
      this.channels.push({ play: false, sam: null, src: null, gain, panL, panR, vol: 1 });
    }
  }
  get count(): number { return this.channels.length; }

  /** SetVolume: Mix_Volume(-1, v) sets every channel */
  setVolume(v: number): void { for (let i = 0; i < this.channels.length; i++) this.channelSetVolume(i, v); }
  channelSetVolume(ch: number, v: number): void {
    const c = this.channels[ch];
    if (!c) return;
    // Mix_Volume takes an int 0..128
    c.vol = Math.max(0, Math.min(128, Math.trunc(v * 128))) / 128;
    if (c.gain) c.gain.gain.value = c.vol;
  }
  channelSetPanning(ch: number, pan: number): void {
    const c = this.channels[ch];
    if (!c || !c.panL) return;
    // Uint8 arguments: 127 -/+ 127 * pan, truncated to a byte
    const l = (Math.trunc(127 - 127 * pan) & 255) / 255, r = (Math.trunc(127 + 127 * pan) & 255) / 255;
    // SDL_mixer's panning effect scales each side by its value / 255 (so the centre is at half volume)
    c.panL.gain.value = l; c.panR.gain.value = r;
  }
  channelPlay(ch: number, vol: number, pan: number, sam: Sample): void {
    const c = this.channels[ch];
    if (!c) return;
    this.channelStop(ch);
    c.play = true; c.sam = sam;
    this.channelSetVolume(ch, vol);
    this.channelSetPanning(ch, pan);
    if (!this.ctx || !sam.buffer) return;
    const src = this.ctx.createBufferSource();
    src.buffer = sam.buffer;
    src.loop = sam.loopend !== 0;
    src.connect(c.gain);
    src.onended = () => { if (c.src === src) { c.play = false; c.src = null; } };
    src.start();
    c.src = src;
  }
  channelStop(ch: number): void {
    const c = this.channels[ch];
    if (!c) return;
    const s = c.src;
    c.src = null;
    c.play = false;
    if (s) { try { s.stop(); } catch { /* not started */ } s.disconnect(); }
  }
  channelGetStatus(ch: number): boolean { return !!this.channels[ch]?.play; }
  channelGetFree(): number {
    for (let i = 0; i < this.channels.length; i++) if (!this.channels[i].play) return i;
    return -1;
  }
  flushAll(): void { for (let i = 0; i < this.channels.length; i++) this.channelStop(i); }

  playMusic(buffer: AudioBuffer | null, loop: boolean): void {
    this.stopMusic();
    if (!this.ctx || !this.out || !buffer) return;
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = loop;
    const gain = this.ctx.createGain();
    gain.gain.value = this.musicVolume;
    src.connect(gain); gain.connect(this.out);
    src.start();
    this.music = { src, gain };
  }
  setMusicVolume(v: number): void {
    this.musicVolume = v;
    if (this.music) this.music.gain.gain.value = v;
  }
  stopMusic(): void {
    if (!this.music) return;
    try { this.music.src.stop(); } catch { /* */ }
    this.music.src.disconnect(); this.music.gain.disconnect();
    this.music = null;
  }
  get musicPlaying(): boolean { return !!this.music; }
  close(): void { this.flushAll(); this.stopMusic(); }
}
