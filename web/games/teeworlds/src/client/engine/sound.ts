// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: engine/sound.h and engine/client/sound.cpp of Teeworlds 0.7.5 in TypeScript. The mixer is the
// original's (64 voices, 16 channels, the positional falloff and panning, the master volume, the nearest-sample
// rate conversion to the mixing rate, 16-bit clamping); it runs in a ScriptProcessorNode of the page's
// AudioContext instead of SDL's audio callback, at the context's sample rate. LoadWV decodes the release's .wv
// files with the WavPack port (wavpack.ts).
import { f, sqrtf } from '../../base/vmath.ts';
import type { CConfig } from '../../generated/config.ts';
import { decodeWV } from './wavpack.ts';
import type { CStorage } from './storage.ts';

const NUM_SAMPLES = 512, NUM_VOICES = 64, NUM_CHANNELS = 16;
export const FLAG_LOOP = 1, FLAG_POS = 2, FLAG_ALL = 3;

interface CSample { m_pData: Int16Array | null; m_NumFrames: number; m_Rate: number; m_Channels: number; m_LoopStart: number; m_LoopEnd: number; m_PausedAt: number }
interface CVoice { m_pSample: CSample | null; m_pChannel: { m_Vol: number }; m_Tick: number; m_Vol: number; m_Flags: number; m_X: number; m_Y: number }

export class CSampleHandle {
  m_Id: number;
  constructor(id = -1) { this.m_Id = id; }
  IsValid(): boolean { return this.m_Id >= 0; }
  Id(): number { return this.m_Id; }
}

function Int2Short(i: number): number {
  if (i > 0x7fff) return 0x7fff;
  if (i < -0x7fff) return -0x7fff;
  return i;
}

export class CSound {
  private m_aSamples: CSample[] = [];
  private m_aVoices: CVoice[] = [];
  private m_aChannels = Array.from({ length: NUM_CHANNELS }, () => ({ m_Vol: 255 }));
  private m_CenterX = 0;
  private m_CenterY = 0;
  private m_MaxDistance = f(1500);
  private m_MixingRate = 48000;
  private m_SoundVolume = 100;
  private m_NextVoice = 0;
  private m_pMixBuffer = new Int32Array(0);
  private m_MaxFrames = 0;
  private m_SoundEnabled = 0;
  private m_pConfig: CConfig;
  private m_pStorage: CStorage | null;
  private audio: AudioContext | null;
  private node: ScriptProcessorNode | null = null;
  private windowActive: () => boolean;

  constructor(config: CConfig, storage: CStorage | null, audio: AudioContext | null, windowActive: () => boolean) {
    this.m_pConfig = config;
    this.m_pStorage = storage;
    this.audio = audio;
    this.windowActive = windowActive;
    for (let i = 0; i < NUM_SAMPLES; i++) this.m_aSamples.push({ m_pData: null, m_NumFrames: 0, m_Rate: 0, m_Channels: 0, m_LoopStart: -1, m_LoopEnd: -1, m_PausedAt: 0 });
    for (let i = 0; i < NUM_VOICES; i++) this.m_aVoices.push({ m_pSample: null, m_pChannel: this.m_aChannels[0], m_Tick: 0, m_Vol: 0, m_Flags: 0, m_X: 0, m_Y: 0 });
  }

  /** Mix: Frames stereo frames into pFinalOut (interleaved 16-bit values) */
  Mix(pFinalOut: Int16Array, Frames: number): void {
    this.m_pMixBuffer.fill(0);
    Frames = Math.min(Frames, this.m_MaxFrames);
    const MasterVol = this.m_SoundVolume;
    for (let i = 0; i < NUM_VOICES; i++) {
      const v = this.m_aVoices[i];
      const smp = v.m_pSample;
      if (!smp || !smp.m_pData) continue;
      const data = smp.m_pData;
      const Step = smp.m_Channels;
      let pInL = v.m_Tick * Step;
      let pInR = v.m_Tick * Step + 1;
      let End = smp.m_NumFrames - v.m_Tick;
      let Rvol = v.m_pChannel.m_Vol;
      let Lvol = v.m_pChannel.m_Vol;
      if (Frames < End) End = Frames;
      if (smp.m_Channels === 1) pInR = pInL;
      if (v.m_Flags & FLAG_POS) {
        const dx = v.m_X - this.m_CenterX;
        const dy = v.m_Y - this.m_CenterY;
        const Dist = sqrtf(f(f(f(dx) * dx) + f(dy * dy)));
        if (Dist >= 0 && Dist < this.m_MaxDistance) {
          const Falloff = f(1 - f(Dist / this.m_MaxDistance));
          const FalloffAmp = f(v.m_pChannel.m_Vol * Falloff);
          const Lpan = f(0.5 - f(f(dx / this.m_MaxDistance) / 2));
          const Rpan = f(1 - Lpan);
          const LampFactor = Math.sqrt(Lpan);
          const RampFactor = Math.sqrt(Rpan);
          Lvol = Math.trunc(FalloffAmp * LampFactor);
          Rvol = Math.trunc(FalloffAmp * RampFactor);
        } else {
          Lvol = 0;
          Rvol = 0;
        }
      }
      const out = this.m_pMixBuffer;
      let o = 0;
      for (let s = 0; s < End; s++) {
        out[o++] += data[pInL] * Lvol;
        out[o++] += data[pInR] * Rvol;
        pInL += Step;
        pInR += Step;
        v.m_Tick++;
      }
      if (v.m_Tick === smp.m_NumFrames) {
        if (v.m_Flags & FLAG_LOOP) v.m_Tick = 0;
        else v.m_pSample = null;
      }
    }
    for (let i = 0; i < Frames; i++) {
      const j = i << 1;
      const vl = Math.trunc((this.m_pMixBuffer[j] * MasterVol) / 101) >> 8;
      const vr = Math.trunc((this.m_pMixBuffer[j + 1] * MasterVol) / 101) >> 8;
      pFinalOut[j] = Int2Short(vl);
      pFinalOut[j + 1] = Int2Short(vr);
    }
  }

  Init(): number {
    for (let i = 0; i < NUM_CHANNELS; ++i) this.m_aChannels[i].m_Vol = 255;
    this.m_SoundEnabled = 0;
    if (!this.m_pConfig.m_SndInit) return 0;
    const audio = this.audio;
    this.m_MixingRate = audio ? audio.sampleRate : this.m_pConfig.m_SndRate;
    // the buffer: snd_buffer_size frames rounded up to a size the browser accepts
    let bs = 256;
    while (bs < this.m_pConfig.m_SndBufferSize && bs < 16384) bs <<= 1;
    this.m_MaxFrames = bs * 2;
    this.m_pMixBuffer = new Int32Array(this.m_MaxFrames * 2);
    if (audio) {
      const node = audio.createScriptProcessor(bs, 0, 2);
      const tmp = new Int16Array(bs * 2);
      node.onaudioprocess = (e) => {
        const L = e.outputBuffer.getChannelData(0), R = e.outputBuffer.getChannelData(1);
        this.Mix(tmp, L.length);
        for (let i = 0; i < L.length; i++) {
          L[i] = tmp[i * 2] / 32768;
          R[i] = tmp[i * 2 + 1] / 32768;
        }
      };
      node.connect(audio.destination);
      this.node = node;
    }
    this.m_SoundEnabled = 1;
    this.Update();
    return 0;
  }

  Update(): number {
    let WantedVolume = this.m_pConfig.m_SndVolume;
    if (!this.windowActive() && this.m_pConfig.m_SndNonactiveMute) WantedVolume = 0;
    this.m_SoundVolume = WantedVolume;
    return 0;
  }

  Shutdown(): number {
    if (this.node) {
      this.node.onaudioprocess = null;
      this.node.disconnect();
      this.node = null;
    }
    this.m_SoundEnabled = 0;
    return 0;
  }

  IsSoundEnabled(): boolean { return this.m_SoundEnabled !== 0; }

  private AllocID(): number {
    for (let SampleID = 0; SampleID < NUM_SAMPLES; SampleID++) if (!this.m_aSamples[SampleID].m_pData) return SampleID;
    return -1;
  }

  private RateConvert(SampleID: number): void {
    const pSample = this.m_aSamples[SampleID];
    if (!pSample.m_pData || pSample.m_Rate === this.m_MixingRate) return;
    const NumFrames = Math.trunc(f(f(pSample.m_NumFrames / pSample.m_Rate) * this.m_MixingRate));
    const pNewData = new Int16Array(NumFrames * pSample.m_Channels);
    for (let i = 0; i < NumFrames; i++) {
      const a = f(i / NumFrames);
      let fr = Math.trunc(f(a * pSample.m_NumFrames));
      if (fr >= pSample.m_NumFrames) fr = pSample.m_NumFrames - 1;
      if (pSample.m_Channels === 1) pNewData[i] = pSample.m_pData[fr];
      else if (pSample.m_Channels === 2) {
        pNewData[i * 2] = pSample.m_pData[fr * 2];
        pNewData[i * 2 + 1] = pSample.m_pData[fr * 2 + 1];
      }
    }
    pSample.m_pData = pNewData;
    pSample.m_NumFrames = NumFrames;
  }

  LoadWV(pFilename: string): CSampleHandle {
    if (this.m_pConfig.m_DbgStress) return new CSampleHandle();
    if (!this.m_SoundEnabled) return new CSampleHandle();
    const file = this.m_pStorage?.ReadFile(pFilename);
    if (!file) return new CSampleHandle();
    const SampleID = this.AllocID();
    if (SampleID < 0) return new CSampleHandle();
    const pSample = this.m_aSamples[SampleID];
    const d = decodeWV(file);
    if (d) {
      pSample.m_Channels = d.channels;
      pSample.m_Rate = d.rate;
      pSample.m_pData = Int16Array.from(d.samples);
      pSample.m_NumFrames = d.numSamples;
      pSample.m_LoopStart = -1;
      pSample.m_LoopEnd = -1;
      pSample.m_PausedAt = 0;
    }
    this.RateConvert(SampleID);
    return new CSampleHandle(SampleID);
  }

  UnloadSample(SampleID: CSampleHandle): void {
    if (!SampleID.IsValid()) return;
    this.Stop(SampleID);
    this.m_aSamples[SampleID.Id()].m_pData = null;
  }

  SetListenerPos(x: number, y: number): void {
    this.m_CenterX = Math.trunc(x);
    this.m_CenterY = Math.trunc(y);
  }
  SetMaxDistance(Distance: number): void { this.m_MaxDistance = f(Distance); }
  SetChannelVolume(ChannelID: number, Vol: number): void { this.m_aChannels[ChannelID].m_Vol = Math.trunc(f(Vol * 255)); }

  PlayAt(ChannelID: number, SampleID: CSampleHandle, Flags: number, x: number, y: number): number {
    return this.Play(ChannelID, SampleID, Flags | FLAG_POS, x, y);
  }

  Play(ChannelID: number, SampleID: CSampleHandle, Flags: number, x = 0, y = 0): number {
    if (!SampleID.IsValid()) return -1;
    let VoiceID = -1;
    for (let i = 0; i < NUM_VOICES; i++) {
      const id = (this.m_NextVoice + i) % NUM_VOICES;
      if (!this.m_aVoices[id].m_pSample) {
        VoiceID = id;
        this.m_NextVoice = id + 1;
        break;
      }
    }
    if (VoiceID !== -1) {
      const v = this.m_aVoices[VoiceID];
      const s = this.m_aSamples[SampleID.Id()];
      v.m_pSample = s;
      v.m_pChannel = this.m_aChannels[ChannelID];
      v.m_Tick = Flags & FLAG_LOOP ? s.m_PausedAt : 0;
      v.m_Vol = 255;
      v.m_Flags = Flags;
      v.m_X = Math.trunc(x);
      v.m_Y = Math.trunc(y);
    }
    return VoiceID;
  }

  Stop(SampleID: CSampleHandle): void {
    const pSample = this.m_aSamples[SampleID.Id()];
    for (const v of this.m_aVoices) {
      if (v.m_pSample === pSample) {
        pSample.m_PausedAt = v.m_Flags & FLAG_LOOP ? v.m_Tick : 0;
        v.m_pSample = null;
      }
    }
  }

  StopAll(): void {
    for (const v of this.m_aVoices) {
      if (v.m_pSample) v.m_pSample.m_PausedAt = v.m_Flags & FLAG_LOOP ? v.m_Tick : 0;
      v.m_pSample = null;
    }
  }

  IsPlaying(SampleID: CSampleHandle): boolean {
    const pSample = this.m_aSamples[SampleID.Id()];
    return this.m_aVoices.some((v) => v.m_pSample === pSample);
  }
}
