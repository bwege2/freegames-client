// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: game/client/components/sounds.h and sounds.cpp of Teeworlds 0.7.5 in TypeScript. The sounds are
// loaded as with snd_async_loading: the loading job is a few files per frame, and until it is done no sound plays.
import type { vec2 } from './common.ts';
import { g_pData } from '../../../generated/content.ts';
import { SOUND_MENU } from '../../../generated/protocol.ts';
import { TIME_FREQ } from '../../../engine/shared/network.ts';
import { CSampleHandle, FLAG_LOOP } from '../../engine/sound.ts';
import { STATE_DEMOPLAYBACK, STATE_ONLINE } from '../../engine/client.ts';
import { CComponent } from '../component.ts';

export const CHN_GUI = 0, CHN_MUSIC = 1, CHN_WORLD = 2, CHN_GLOBAL = 3;
const QUEUE_SIZE = 32;

export class CSounds extends CComponent {
  private m_aQueue: { m_Channel: number; m_SetId: number }[] = [];
  private m_QueueWaitTime = 0;
  private m_WaitForSoundJob = false;
  private jobNext = 0;
  private ids: CSampleHandle[][] = [];

  private GetSampleId(SetId: number): CSampleHandle {
    if (!this.Config().m_SndEnable || !this.Sound().IsSoundEnabled() || this.m_WaitForSoundJob || SetId < 0 || SetId >= g_pData.m_NumSounds) return new CSampleHandle();
    const pSet = g_pData.m_aSounds[SetId];
    if (!pSet.m_NumSounds) return new CSampleHandle();
    if (pSet.m_NumSounds === 1) return this.ids[SetId][0];
    let Id: number;
    do Id = Math.floor(Math.random() * 0x7fffffff) % pSet.m_NumSounds;
    while (Id === pSet.m_Last);
    pSet.m_Last = Id;
    return this.ids[SetId][Id];
  }

  override GetInitAmount(): number { return 0; }

  override OnInit(): void {
    this.Sound().SetChannelVolume(CHN_GUI, 1);
    this.Sound().SetChannelVolume(CHN_MUSIC, 1);
    this.Sound().SetChannelVolume(CHN_WORLD, 0.9);
    this.Sound().SetChannelVolume(CHN_GLOBAL, 1);
    this.Sound().SetListenerPos(0, 0);
    this.ClearQueue();
    this.ids = g_pData.m_aSounds.map((s) => s.m_aSounds.map(() => new CSampleHandle()));
    this.jobNext = 0;
    this.m_WaitForSoundJob = true;
  }

  /** the loading job: sound sets for up to 4 ms per frame. The menu music (SOUND_MENU) is not loaded: only the
   * main menu, which the port does not have, plays it, and it is a long file. */
  private RunSoundJob(): void {
    const order = [...g_pData.m_aSounds.keys()].filter((s) => s !== SOUND_MENU);
    const t0 = performance.now();
    while (this.jobNext < order.length && performance.now() - t0 < 4) {
      const s = order[this.jobNext++];
      const set = g_pData.m_aSounds[s];
      for (let i = 0; i < set.m_NumSounds; i++) {
        this.ids[s][i] = this.Sound().LoadWV(set.m_aSounds[i].m_pFilename);
        set.m_aSounds[i].m_Id = this.ids[s][i].Id();
      }
    }
    if (this.jobNext >= order.length) this.m_WaitForSoundJob = false;
  }

  override OnReset(): void {
    if (this.Client().State() >= STATE_ONLINE) {
      this.Sound().StopAll();
      this.ClearQueue();
    }
  }

  override OnStateChange(NewState: number): void {
    if (NewState === STATE_ONLINE || NewState === STATE_DEMOPLAYBACK) this.OnReset();
  }

  override OnRender(): void {
    if (this.m_WaitForSoundJob) {
      this.RunSoundJob();
      if (this.m_WaitForSoundJob) return;
    }
    const Pos = this.m_pClient.m_pCamera.GetCenter();
    this.Sound().SetListenerPos(Pos.x, Pos.y);
    if (this.m_aQueue.length > 0) {
      const Now = this.Client().time_get();
      if (this.m_QueueWaitTime <= Now) {
        this.Play(this.m_aQueue[0].m_Channel, this.m_aQueue[0].m_SetId, 1);
        this.m_QueueWaitTime = Now + (TIME_FREQ * 3) / 10;
        this.m_aQueue.shift();
      }
    }
  }

  ClearQueue(): void {
    this.m_aQueue = [];
    this.m_QueueWaitTime = this.Client().time_get();
  }

  Enqueue(Channel: number, SetId: number): void {
    if (this.m_aQueue.length < QUEUE_SIZE && (Channel === CHN_MUSIC || !this.Config().m_ClEditor)) this.m_aQueue.push({ m_Channel: Channel, m_SetId: SetId });
  }

  Play(Chn: number, SetId: number, _Vol: number): void {
    if (Chn === CHN_MUSIC && !this.Config().m_SndMusic) return;
    const SampleId = this.GetSampleId(SetId);
    if (!SampleId.IsValid()) return;
    this.Sound().Play(Chn, SampleId, Chn === CHN_MUSIC ? FLAG_LOOP : 0);
  }

  PlayAt(Chn: number, SetId: number, _Vol: number, Pos: vec2): void {
    if (Chn === CHN_MUSIC && !this.Config().m_SndMusic) return;
    const SampleId = this.GetSampleId(SetId);
    if (!SampleId.IsValid()) return;
    this.Sound().PlayAt(Chn, SampleId, Chn === CHN_MUSIC ? FLAG_LOOP : 0, Pos.x, Pos.y);
  }

  Stop(SetId: number): void {
    if (this.m_WaitForSoundJob || SetId < 0 || SetId >= g_pData.m_NumSounds) return;
    for (const h of this.ids[SetId]) this.Sound().Stop(h);
  }

  IsPlaying(SetId: number): boolean {
    if (this.m_WaitForSoundJob || SetId < 0 || SetId >= g_pData.m_NumSounds) return false;
    return this.ids[SetId].some((h) => h.IsValid() && this.Sound().IsPlaying(h));
  }
}
