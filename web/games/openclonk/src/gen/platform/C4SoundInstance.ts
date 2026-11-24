// @ts-nocheck
// OpenClonk 36de799: src/platform/C4SoundInstance.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { al$alBufferData, al$alDeleteBuffers, al$alDeleteSources, al$alGenBuffers, al$alGenSources, al$alGetSourcei, al$alSource3f, al$alSource3i, al$alSourcePlay, al$alSourceStop, al$alSourcef, al$alSourcei } from '../../rt/al.ts';
import { ftoi32 } from '../../rt/int.ts';
import { $rd, $reinterpVoid, $wr, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $max } from '../../rt/std.ts';

export class C4SoundEffect {
  Name = new Int8Array(101);
  Instances = 0;
  SampleRate = 0;
  Length = 0;
  pSample = 0;
  FirstInst = null;
  Next = null;

  init() {
    this.Instances = 0;
    this.pSample = 0;
    this.FirstInst = null;
    this.Next = null;
    this.Name[0] = 0;
    return this;
  }

  $dtor() {
    C4SoundEffect.prototype.Clear.call(this);
  }

  Clear() {
    while (this.FirstInst != null) {
      this.RemoveInst(this.FirstInst);
    }
    if (this.pSample !== 0) {
      al$alDeleteBuffers(1, P(this, "pSample"));
    }
    this.pSample = 0;
  }

  Load$pi8$rC4Group$pi8(szFileName, hGroup, namespace_prefix) {
    if ($.Config.Sound.RXSound === 0) {
      return false;
    }
    let WaveBuffer = new $.StdBuf();
    if (!hGroup.LoadEntry$pi8$pStdBuf(szFileName, WaveBuffer)) {
      return false;
    }
    if (!this.Load$pu8$u64$b($reinterpVoid($.StdBuf.prototype.getMData.call(WaveBuffer), "u8"), $.StdBuf.prototype.getSize.call(WaveBuffer))) {
      return false;
    }
    if (namespace_prefix != null) {
      $.SAppend(namespace_prefix, P(this.Name, 0), 100);
      $.SAppend(S("::"), P(this.Name, 0), 100);
      $.SAppend(szFileName, P(this.Name, 0), 100);
    } else {
      $.SCopy$pi8$pi8$u64(szFileName, P(this.Name, 0), 100);
    }
    return true;
  }

  Load$pu8$u64$b(pData, iDataLen, fRaw = false) {
    if ($.Config.Sound.RXSound === 0) {
      return false;
    }
    let info = new $.SoundInfo().init();
    let options = 0;
    if (fRaw) {
      options |= 1;
    }
    for (let loader = $.SoundLoader.first_loader; loader != null; loader = loader.next) {
      if (loader.ReadInfo(info, pData, iDataLen)) {
        if (info.final_handle !== 0) {
          this.pSample = info.final_handle;
        } else {
          $.Application.MusicSystem.SelectContext();
          al$alGenBuffers(1, P(this, "pSample"));
          al$alBufferData(this.pSample, info.format, P(info.sound_data, 0), info.sound_data.length | 0, info.sample_rate | 0);
        }
        this.SampleRate = info.sample_rate | 0;
        this.Length = ftoi32(info.sample_length * 1000);
        break;
      }
    }
    $wr(P(this.Name, 0), 0, 0);
    return !(this.pSample === 0);
  }

  Execute() {
    for (let pInst = this.FirstInst; pInst != null; ) {
      let pNext = pInst.pNext;
      if (!pInst.Playing()) {
        this.RemoveInst(pInst);
      } else {
        pInst.Execute();
      }
      pInst = pNext;
    }
  }

  New(fLoop = false, iVolume = 100, pObj = null, iCustomFalloffDistance = 0, iPitch = 0, modifier = null) {
    if (!fLoop && this.Instances >= 20) {
      return null;
    }
    let pInst = new C4SoundInstance().init();
    if (!pInst.Create(this, fLoop, iVolume, pObj, 0, iCustomFalloffDistance, iPitch, modifier)) {
      $delete(pInst);
      return null;
    }
    this.AddInst(pInst);
    return pInst;
  }

  GetInstance(pObj) {
    for (let pInst = this.FirstInst; pInst != null; pInst = pInst.pNext) {
      if (pInst.getObj() === pObj) {
        return pInst;
      }
    }
    return null;
  }

  ClearPointers(pObj) {
    for (let pInst = this.FirstInst; pInst != null; pInst = pInst.pNext) {
      pInst.ClearPointers(pObj);
    }
  }

  GetStartedInstanceCount$i32$i32$i32(iX, iY, iRad) {
    let cnt = 0;
    for (let pInst = this.FirstInst; pInst != null; pInst = pInst.pNext) {
      if (pInst.isStarted() && pInst.getObj() != null && pInst.Inside(iX, iY, iRad)) {
        cnt = cnt + 1 | 0;
      }
    }
    return cnt;
  }

  GetStartedInstanceCount$v() {
    let cnt = 0;
    for (let pInst = this.FirstInst; pInst != null; pInst = pInst.pNext) {
      if (pInst.isStarted() && pInst.Playing() && !(pInst.getObj() != null)) {
        cnt = cnt + 1 | 0;
      }
    }
    return cnt;
  }

  GetFullName() {
    return P(this.Name, 0);
  }

  AddInst(pInst) {
    pInst.pNext = this.FirstInst;
    this.FirstInst = pInst;
    this.Instances = this.Instances + 1 | 0;
  }

  RemoveInst(pInst) {
    if (pInst === this.FirstInst) {
      this.FirstInst = pInst.pNext;
    } else {
      let pPos = this.FirstInst;
      while (pPos != null && pPos.pNext !== pInst) {
        pPos = pPos.pNext;
      }
      if (pPos != null) {
        pPos.pNext = pInst.pNext;
      }
    }
    $delete(pInst);
    this.Instances = this.Instances - 1 | 0;
  }

  $clone() { return new C4SoundEffect().$assign(this); }
  $assign(o) {
    this.Name = o.Name.slice();
    this.Instances = o.Instances;
    this.SampleRate = o.SampleRate;
    this.Length = o.Length;
    this.pSample = o.pSample;
    this.FirstInst = o.FirstInst;
    this.Next = o.Next;
    return this;
  }
}

export class C4SoundInstance {
  pEffect = null;
  iVolume = 0;
  iPan = 0;
  iPitch = 0;
  iChannel = -1;
  pitch_dirty = false;
  tStarted = new $.C4TimeMilliseconds();
  iNearInstanceMax = 0;
  fLooping = false;
  pObj = null;
  iFalloffDistance = 0;
  modifier = null;
  has_local_modifier = false;
  pNext = null;
  player = 0;

  init() {
    this.pEffect = null;
    this.iVolume = 0;
    this.iPan = 0;
    this.iPitch = 0;
    this.iChannel = -1;
    this.pitch_dirty = false;
    this.tStarted = new $.C4TimeMilliseconds();
    this.modifier = null;
    this.has_local_modifier = false;
    this.pNext = null;
    this.player = -1;
    return this;
  }

  $dtor() {
    C4SoundInstance.prototype.Clear.call(this);
  }

  getObj() {
    return this.pObj;
  }

  isStarted() {
    return this.iChannel !== -1;
  }

  Clear() {
    this.Stop();
    this.iChannel = -1;
    if (this.modifier != null) {
      this.modifier.DelRef();
      this.modifier = null;
      this.has_local_modifier = false;
    }
  }

  Create(pnEffect, fLoop = false, inVolume = 100, pnObj = null, inNearInstanceMax = 0, iFalloffDistance = 0, inPitch = 0, modifier = null) {
    if ($.Config.Sound.RXSound === 0 || pnEffect == null) {
      return false;
    }
    if (this.Playing()) {
      this.Stop();
      return false;
    }
    this.pEffect = pnEffect;
    this.tStarted.$assign($.C4TimeMilliseconds.Now());
    this.iVolume = inVolume;
    this.iPan = 0;
    this.iChannel = -1;
    this.iPitch = inPitch;
    this.pitch_dirty = this.iPitch !== 0;
    this.iNearInstanceMax = inNearInstanceMax;
    this.iFalloffDistance = iFalloffDistance;
    this.pObj = pnObj;
    this.fLooping = fLoop;
    if ((this.modifier = modifier) != null) {
      modifier.AddRef();
      this.has_local_modifier = true;
    }
    this.SetPlayer(-1);
    this.Execute();
    return true;
  }

  CheckStart() {
    if (this.isStarted()) {
      return true;
    }
    if ($.op_gt($.C4TimeMilliseconds.Now(), $.op_add$C4TimeMilliseconds$u32(this.tStarted.$clone(), (this.pEffect.Length / 2 | 0) >>> 0)) && !this.fLooping) {
      return false;
    }
    let iNearInstances = this.pObj != null ? this.pEffect.GetStartedInstanceCount$i32$i32$i32(this.pObj.GetX(), this.pObj.GetY(), 50) : this.pEffect.GetStartedInstanceCount$v();
    if (iNearInstances > this.iNearInstanceMax) {
      return false;
    }
    return this.Start();
  }

  Start() {
    $.Application.MusicSystem.SelectContext();
    al$alGenSources(1, P(this, "iChannel"));
    al$alSourcei(this.iChannel >>> 0, 4105, this.pEffect.pSample | 0);
    al$alSourcei(this.iChannel >>> 0, 4103, this.fLooping ? 1 : 0);
    if (this.modifier != null) {
      this.modifier.ApplyTo(this.iChannel >>> 0);
    }
    al$alSourcePlay(this.iChannel >>> 0);
    if (!this.isStarted()) {
      return false;
    }
    this.Execute();
    return true;
  }

  Stop() {
    if (this.pEffect == null) {
      return false;
    }
    let fRet = true;
    if (this.iChannel !== -1) {
      if (this.Playing()) {
        al$alSourceStop(this.iChannel >>> 0);
      }
      const c = [this.iChannel >>> 0];
      al$alDeleteSources(1, P(c, 0));
    }
    this.iChannel = -1;
    this.tStarted.$assign(new $.C4TimeMilliseconds().init$u32(0));
    this.fLooping = false;
    return fRet;
  }

  Playing() {
    if (this.pEffect == null) {
      return false;
    }
    if (this.fLooping) {
      return true;
    }
    if (this.iChannel === -1) {
      return false;
    } else {
      const state = [0];
      al$alGetSourcei(this.iChannel >>> 0, 4112, P(state, 0));
      return state[0] === 4114;
    }
    return false;
  }

  Execute() {
    if (this.pObj != null && this.pObj.Status === 0) {
      this.ClearPointers(this.pObj);
    }
    let iVol = Math.imul(Math.imul(this.iVolume, 256), $.Config.Sound.SoundVolume) / 100 | 0;
    let iPan = this.iPan;
    if (this.pObj != null) {
      let iAudibility = this.pObj.Audible;
      if (this.pObj.AudiblePlayer !== this.player) {
        this.SetPlayer(this.pObj.AudiblePlayer);
      }
      if (this.iFalloffDistance !== 0) {
        iAudibility = $.Clamp$i32$i32$i32(100 + (Math.imul(iAudibility - 100 | 0, 700) / this.iFalloffDistance | 0) | 0, 0, 100);
      }
      iVol = Math.imul(iVol, iAudibility) / 100 | 0;
      iPan = iPan + this.pObj.AudiblePan | 0;
    }
    if (iVol === 0) {
      if (this.isStarted()) {
        al$alDeleteSources(1, P(this, "iChannel"));
        this.iChannel = -1;
      }
    } else {
      if (!this.isStarted()) {
        if (!this.CheckStart()) {
          return;
        }
      }
      al$alSource3f(this.iChannel >>> 0, 4100, $.Clamp$f32$f32$f32(Math.fround(Math.fround(iPan) / 100), -1, 1), Math.fround(0), -Math.fround(0.699999988));
      al$alSourcef(this.iChannel >>> 0, 4106, Math.fround(Math.fround(iVol) / Math.fround(100 * 256)));
      if (this.pitch_dirty) {
        al$alSourcef(this.iChannel >>> 0, 4099, $max(Math.fround(Math.fround(this.iPitch + 100 | 0) / 100), Math.fround(0.100000001)));
        this.pitch_dirty = false;
      }
    }
  }

  SetVolume(inVolume) {
    this.iVolume = inVolume;
  }

  SetPan(inPan) {
    this.iPan = inPan;
  }

  SetPitch(inPitch) {
    this.iPitch = inPitch;
    this.pitch_dirty = true;
  }

  SetVolumeByPos(x, y, relative_vol = 100) {
    const vol_player = [-1];
    this.iVolume = ftoi32(Math.fround(Math.fround(Math.imul($.Viewports.GetAudibility(x, y, P(this, "iPan"), 0, P(vol_player, 0)), relative_vol)) / 100));
    if (vol_player[0] !== this.player) {
      this.SetPlayer(vol_player[0]);
    }
  }

  SetObj(pnObj) {
    this.pObj = pnObj;
  }

  ClearPointers(pDelete) {
    if (!this.Playing()) {
      this.Stop();
      return;
    }
    if (this.pObj === pDelete) {
      if (this.fLooping) {
        this.Stop();
      } else {
        this.SetVolumeByPos(this.pObj.GetX(), this.pObj.GetY());
      }
      this.pObj = null;
    }
  }

  Inside(iX, iY, iRad) {
    return this.pObj != null && (Math.imul(this.pObj.GetX() - iX | 0, this.pObj.GetX() - iX | 0) + Math.imul(this.pObj.GetY() - iY | 0, this.pObj.GetY() - iY | 0) | 0) <= Math.imul(iRad, iRad);
  }

  GetModifier() {
    return this.modifier;
  }

  SetModifier(new_modifier, is_global) {
    if (is_global) {
      if (this.has_local_modifier) {
        return;
      }
    } else {
      this.has_local_modifier = new_modifier != null;
    }
    if (new_modifier !== this.modifier) {
      let old_modifier = this.modifier;
      this.modifier = new_modifier;
      if (this.modifier != null) {
        this.modifier.AddRef();
      }
      if (old_modifier != null) {
        old_modifier.DelRef();
      }
      if (this.isStarted()) {
        if (this.modifier != null) {
          this.modifier.ApplyTo(this.iChannel >>> 0);
        } else {
          al$alSource3i(this.iChannel >>> 0, 131078, 0, 0, 0);
        }
      }
    }
  }

  SetPlayer(new_player) {
    this.player = new_player;
    this.SetModifier($.Application.SoundSystem.Modifiers.GetGlobalModifier(this.player), true);
  }

  $clone() { return new C4SoundInstance().$assign(this); }
  $assign(o) {
    this.pEffect = o.pEffect;
    this.iVolume = o.iVolume;
    this.iPan = o.iPan;
    this.iPitch = o.iPitch;
    this.iChannel = o.iChannel;
    this.pitch_dirty = o.pitch_dirty;
    this.tStarted.$assign(o.tStarted);
    this.iNearInstanceMax = o.iNearInstanceMax;
    this.fLooping = o.fLooping;
    this.pObj = o.pObj;
    this.iFalloffDistance = o.iFalloffDistance;
    this.modifier = o.modifier;
    this.has_local_modifier = o.has_local_modifier;
    this.pNext = o.pNext;
    this.player = o.player;
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4SoundEffect, C4SoundInstance });
