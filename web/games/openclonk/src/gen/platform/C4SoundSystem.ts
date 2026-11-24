// @ts-nocheck
// OpenClonk 36de799: src/platform/C4SoundSystem.cpp, src/platform/C4SoundSystem.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { c$strlen } from '../../rt/libc.ts';
import { UnsyncedRandom$u32 } from '../../rt/native.ts';
import { P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete } from '../../rt/std.ts';

export class C4SoundSystem {
  Modifiers = new $.C4SoundModifierList().init();
  SoundFile = new $.C4Group().init();
  FirstSound = null;
  initialized = false;

  init() {
    this.Modifiers = new $.C4SoundModifierList().init();
    this.SoundFile = new $.C4Group().init();
    this.FirstSound = null;
    this.initialized = false;
    return this;
  }

  Clear() {
    this.initialized = false;
    this.ClearEffects();
    this.Modifiers.Clear();
    this.SoundFile.Close$v();
  }

  Execute() {
    $.Application.MusicSystem.SelectContext();
    let csfx = null;
    for (csfx = this.FirstSound; csfx != null; csfx = csfx.Next) {
      csfx.Execute();
    }
  }

  LoadEffects(hGroup, namespace_prefix, group_is_root) {
    if (group_is_root && hGroup.FindEntry$pi8$pStdStrBuf$pu64(S("Sound.ocg"))) {
      let g = new $.C4Group().init();
      g.OpenAsChild(hGroup, S("Sound.ocg"), false, false);
      return this.LoadEffects(g, namespace_prefix, false);
    }
    let iNum = 0;
    const szFilename = new Int8Array(256);
    const szFileType = new Int8Array(256);
    let nsfx = null;
    for (let i = 0; $.SCopySegment(S("*.wav|*.ogg"), i, P(szFileType, 0), 124, 255); i = i + 1 | 0) {
      hGroup.ResetSearch();
      while (hGroup.FindNextEntry$pi8$pi8$pu64$b(P(szFileType, 0), P(szFilename, 0))) {
        if ((nsfx = new $.C4SoundEffect().init()) != null) {
          if (nsfx.Load$pi8$rC4Group$pi8(P(szFilename, 0), hGroup, namespace_prefix)) {
            this.RemoveEffect(P(nsfx.Name, 0));
            nsfx.Next = this.FirstSound;
            this.FirstSound = nsfx;
            iNum = iNum + 1 | 0;
          } else {
            $delete(nsfx);
          }
        }
      }
    }
    if (!group_is_root) {
      hGroup.ResetSearch();
      while (hGroup.FindNextEntry$pi8$pi8$pu64$b(S("*.ocg"), P(szFilename, 0))) {
        let sub_namespace = new $.StdStrBuf();
        if (namespace_prefix != null) {
          sub_namespace.Copy$pi8(namespace_prefix);
          sub_namespace.Append$pi8(S("::"));
        }
        sub_namespace.Append$pi8$u64(P(szFilename, 0), c$strlen(P(szFilename, 0)) - c$strlen(S("*.ocg")) + 1);
        let subgroup = new $.C4Group().init();
        if (subgroup.OpenAsChild(hGroup, P(szFilename, 0), false, false)) {
          iNum = iNum + this.LoadEffects(subgroup, sub_namespace.getData(), false) | 0;
        }
      }
    }
    return iNum;
  }

  NewEffect(szSndName, fLoop = false, iVolume = 100, pObj = null, iCustomFalloffDistance = 0, iPitch = 0, modifier = null) {
    if (!this.initialized || $.Config.Sound.RXSound === 0) {
      return null;
    }
    let csfx = null;
    if (!((csfx = this.GetEffect(szSndName)) != null)) {
      $.DebugLogF(S("Warning: could not find sound matching '%s'"), szSndName);
      return null;
    }
    return csfx.New(fLoop, iVolume, pObj, iCustomFalloffDistance, iPitch, modifier);
  }

  FindInstance(szSndName, pObj) {
    const szName = new Int8Array(103);
    $.SCopy$pi8$pi8$u64(szSndName, P(szName, 0), 100);
    $.DefaultExtension$pi8$pi8(P(szName, 0), S("*"));
    for (let csfx = this.FirstSound; csfx != null; csfx = csfx.Next) {
      if ($.WildcardMatch(P(szName, 0), P(csfx.Name, 0))) {
        let pInst = csfx.GetInstance(pObj);
        if (pInst != null) {
          return pInst;
        }
      }
    }
    return null;
  }

  GetFirstInstance() {
    for (let pSfx = this.FirstSound; pSfx != null; pSfx = pSfx.Next) {
      if (pSfx.FirstInst != null) {
        return pSfx.FirstInst;
      }
    }
    return null;
  }

  GetNextInstance(prev) {
    0;
    if (prev.pNext != null) {
      return prev.pNext;
    }
    for (let pSfx = prev.pEffect.Next; pSfx != null; pSfx = pSfx.Next) {
      if (pSfx.FirstInst != null) {
        return pSfx.FirstInst;
      }
    }
    return null;
  }

  Init() {
    if (!$.Application.MusicSystem.MODInitialized && !$.Application.MusicSystem.InitializeMOD()) {
      return false;
    }
    this.ClearEffects();
    this.Modifiers.Init();
    if (!this.SoundFile.IsOpen()) {
      if (!$.Reloc.Open(this.SoundFile, S("Sound.ocg"))) {
        return false;
      }
    }
    this.LoadEffects(this.SoundFile, null, false);
    this.initialized = true;
    return true;
  }

  ClearPointers(pObj) {
    for (let pEff = this.FirstSound; pEff != null; pEff = pEff.Next) {
      pEff.ClearPointers(pObj);
    }
  }

  GetFirstSound() {
    return this.FirstSound;
  }

  ClearEffects() {
    let csfx = null;
    let next = null;
    for (csfx = this.FirstSound; csfx != null; csfx = next) {
      next = csfx.Next;
      $delete(csfx);
    }
    this.FirstSound = null;
  }

  GetEffect(szSndName) {
    let bRandomSound = $.IsWildcardString(szSndName);
    const szName = new Int8Array(103);
    $.SCopy$pi8$pi8$u64(szSndName, P(szName, 0), 100);
    $.DefaultExtension$pi8$pi8(P(szName, 0), S("*"));
    let iNumber = 1;
    if (bRandomSound) {
      iNumber = 0;
      for (let pSfx = this.FirstSound; pSfx != null; pSfx = pSfx.Next) {
        if ($.WildcardMatch(P(szName, 0), P(pSfx.Name, 0))) {
          iNumber = iNumber + 1 | 0;
        }
      }
      if (iNumber === 0) {
        return null;
      }
      iNumber = UnsyncedRandom$u32(iNumber >>> 0) + 1 >>> 0 | 0;
    }
    let pSfx = null;
    for (pSfx = this.FirstSound; pSfx != null; pSfx = pSfx.Next) {
      if ($.WildcardMatch(P(szName, 0), P(pSfx.Name, 0))) {
        if (!((iNumber = iNumber - 1 | 0) !== 0)) {
          break;
        }
      }
    }
    return pSfx;
  }

  RemoveEffect(szFilename) {
    let iResult = 0;
    let pNext = null;
    let pPrev = null;
    for (let pSfx = this.FirstSound; pSfx != null; pSfx = pNext) {
      pNext = pSfx.Next;
      if ($.WildcardMatch(szFilename, P(pSfx.Name, 0))) {
        $delete(pSfx);
        if (pPrev != null) {
          pPrev.Next = pNext;
        } else {
          this.FirstSound = pNext;
        }
        iResult = iResult + 1 | 0;
      } else {
        pPrev = pSfx;
      }
    }
    return iResult;
  }

  $clone() { return new C4SoundSystem().$assign(this); }
  $assign(o) {
    this.Modifiers.$assign(o.Modifiers);
    this.SoundFile.$assign(o.SoundFile);
    this.FirstSound = o.FirstSound;
    this.initialized = o.initialized;
    return this;
  }
}







export function StartSoundEffect(szSndName, fLoop = false, iVolume = 100, pObj = null, iCustomFalloffDistance = 0, iPitch = 0, modifier = null) {
  if ($.Config.Sound.RXSound === 0) {
    return null;
  }
  return $.Application.SoundSystem.NewEffect(szSndName, fLoop, iVolume, pObj, iCustomFalloffDistance, iPitch, modifier);
}

export function StartSoundEffectAt(szSndName, iX, iY, iVolume = 100, iCustomFallofDistance = 0, iPitch = 0, modifier = null) {
  if ($.Config.Sound.RXSound === 0) {
    return null;
  }
  let pInst = StartSoundEffect(szSndName, false, iVolume, null, iCustomFallofDistance, iPitch, modifier);
  if (pInst != null) {
    pInst.SetVolumeByPos(iX, iY, iVolume);
  }
  return pInst;
}

export function GetSoundInstance(szSndName, pObj) {
  return $.Application.SoundSystem.FindInstance(szSndName, pObj);
}

export function StopSoundEffect(szSndName, pObj) {
  let pInst = $.Application.SoundSystem.FindInstance(szSndName, pObj);
  if (pInst == null) {
    return;
  }
  pInst.Stop();
}

export function SoundLevel(szSndName, pObj, iLevel) {
  if (iLevel === 0) {
    StopSoundEffect(szSndName, pObj);
    return;
  }
  let pInst = $.Application.SoundSystem.FindInstance(szSndName, pObj);
  if (pInst == null) {
    pInst = StartSoundEffect(szSndName, true, iLevel, pObj);
  }
  if (pInst == null) {
    return;
  }
  pInst.SetVolume(iLevel);
  pInst.Execute();
}

export function SoundPan(szSndName, pObj, iPan) {
  let pInst = $.Application.SoundSystem.FindInstance(szSndName, pObj);
  if (pInst == null) {
    return;
  }
  pInst.SetPan(iPan);
  pInst.Execute();
}

export function SoundPitch(szSndName, pObj, iPitch) {
  let pInst = $.Application.SoundSystem.FindInstance(szSndName, pObj);
  if (pInst == null) {
    return;
  }
  pInst.SetPitch(iPitch);
  pInst.Execute();
}

export function SoundUpdate(pInst, iLevel, iPitch) {
  pInst.SetVolume(iLevel);
  pInst.SetPitch(iPitch);
  pInst.Execute();
}

export function $init(): void {
  $.C4MaxSoundName$C4SoundSystem = 100;
  $.C4MaxSoundInstances$C4SoundSystem = 20;
  $.C4NearSoundRadius$C4SoundSystem = 50;
  $.C4AudibilityRadius$C4SoundSystem = 700;
  $.SoundUnloadTime$C4SoundSystem = 60;
  $.SoundMaxUnloadSize$C4SoundSystem = 100000;
}

Object.assign($, { C4SoundSystem, GetSoundInstance, SoundLevel, SoundPan, SoundPitch, SoundUpdate, StartSoundEffect, StartSoundEffectAt, StopSoundEffect });
