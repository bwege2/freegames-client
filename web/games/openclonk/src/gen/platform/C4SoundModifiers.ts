// @ts-nocheck
// OpenClonk 36de799: src/platform/C4SoundModifiers.cpp, src/platform/C4SoundModifiers.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { al$alGetError, al$alGetProcAddress, al$alGetString, al$alSource3i, al$alcIsExtensionPresent } from '../../rt/al.ts';
import { $u64n, ftoi32 } from '../../rt/int.ts';
import { $own, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $begin, $delete, $end, resize, seq_remove, std_find_if } from '../../rt/std.ts';

export class C4SoundModifier {
  props = new $.C4Value().init$v();
  instance_count = 0;
  released = false;
  effect = 0;
  slot = 0;

  init(in_props) {
    this.props = new $.C4Value().init$v();
    this.instance_count = 0;
    this.effect = 0;
    this.slot = 0;
    this.props.SetPropList(in_props);
    $.Application.SoundSystem.Modifiers.Add(this);
    $.Application.MusicSystem.SelectContext();
    $.alGenEffects$C4SoundModifiers(1, P(this, "effect"));
    $.alGenAuxiliaryEffectSlots$C4SoundModifiers(1, P(this, "slot"));
    return this;
  }

  $dtor() {
    if ($.alIsEffect$C4SoundModifiers(this.effect) !== 0) {
      $.alDeleteEffects$C4SoundModifiers(1, P(this, "effect"));
    }
    if ($.alIsAuxiliaryEffectSlot$C4SoundModifiers(this.slot) !== 0) {
      $.alDeleteAuxiliaryEffectSlots$C4SoundModifiers(1, P(this, "slot"));
    }
    $.Application.SoundSystem.Modifiers.Remove(this);
  }

  GetFloatProp(key, ratio, default_value) {
    let p = this.props._getPropList();
    return Math.fround(Math.fround(p.GetPropertyInt(key, ftoi32(Math.fround(default_value * ratio)))) / ratio);
  }

  GetBoolProp(key, default_value) {
    let p = this.props._getPropList();
    return p.GetPropertyInt(key, default_value ? 1 : 0) !== 0;
  }

  Update() {
    if (this.slot !== 0) {
      $.alAuxiliaryEffectSloti$C4SoundModifiers(this.slot, 1, this.effect | 0);
    }
    this.released = false;
  }

  Release() {
    if (this.instance_count === 0) {
      $delete(this);
    } else {
      this.released = true;
      this.props.Set0();
    }
  }

  AddRef() {
    this.instance_count = this.instance_count + 1 | 0;
  }

  DelRef() {
    if (!((this.instance_count = this.instance_count - 1 | 0) !== 0) && this.released) {
      $delete(this);
    }
  }

  GetRefCount() {
    return this.instance_count;
  }

  GetProps() {
    return this.props._getPropList();
  }

  ApplyTo(source) {
    if (this.slot !== 0) {
      al$alSource3i(source, 131078, this.slot | 0, 0, 0);
    }
  }

  $clone() { return new C4SoundModifier().$assign(this); }
  $assign(o) {
    this.props.$assign(o.props);
    this.instance_count = o.instance_count;
    this.released = o.released;
    this.effect = o.effect;
    this.slot = o.slot;
    return this;
  }
}

export class C4SoundModifierList {
  is_initialized = false;
  is_effect_available = new Array(13).fill(false);
  sound_modifiers = [];
  global_modifiers = [];

  init() {
    this.sound_modifiers = [];
    this.global_modifiers = [];
    for (let i = 0; i <= 12; i = i + 1 | 0) {
      this.is_effect_available[i] = false;
    }
    return this;
  }

  Init() {
    this.is_initialized = false;
    $.Application.MusicSystem.SelectContext();
    if (!(al$alcIsExtensionPresent($.Application.MusicSystem.GetDevice(), S("ALC_EXT_EFX")) !== 0)) {
      $.LogF(S("ALExt: No efx extensions available. Sound modifications disabled."));
      return;
    }
    $.alGenEffects$C4SoundModifiers = al$alGetProcAddress(S("alGenEffects"));
    $.alDeleteEffects$C4SoundModifiers = al$alGetProcAddress(S("alDeleteEffects"));
    $.alIsEffect$C4SoundModifiers = al$alGetProcAddress(S("alIsEffect"));
    $.alEffecti$C4SoundModifiers = al$alGetProcAddress(S("alEffecti"));
    $.alEffectiv$C4SoundModifiers = al$alGetProcAddress(S("alEffectiv"));
    $.alEffectf$C4SoundModifiers = al$alGetProcAddress(S("alEffectf"));
    $.alEffectfv$C4SoundModifiers = al$alGetProcAddress(S("alEffectfv"));
    $.alGetEffecti$C4SoundModifiers = al$alGetProcAddress(S("alGetEffecti"));
    $.alGetEffectiv$C4SoundModifiers = al$alGetProcAddress(S("alGetEffectiv"));
    $.alGetEffectf$C4SoundModifiers = al$alGetProcAddress(S("alGetEffectf"));
    $.alGetEffectfv$C4SoundModifiers = al$alGetProcAddress(S("alGetEffectfv"));
    $.alGenAuxiliaryEffectSlots$C4SoundModifiers = al$alGetProcAddress(S("alGenAuxiliaryEffectSlots"));
    $.alDeleteAuxiliaryEffectSlots$C4SoundModifiers = al$alGetProcAddress(S("alDeleteAuxiliaryEffectSlots"));
    $.alIsAuxiliaryEffectSlot$C4SoundModifiers = al$alGetProcAddress(S("alIsAuxiliaryEffectSlot"));
    $.alAuxiliaryEffectSloti$C4SoundModifiers = al$alGetProcAddress(S("alAuxiliaryEffectSloti"));
    $.alAuxiliaryEffectSlotiv$C4SoundModifiers = al$alGetProcAddress(S("alAuxiliaryEffectSlotiv"));
    $.alAuxiliaryEffectSlotf$C4SoundModifiers = al$alGetProcAddress(S("alAuxiliaryEffectSlotf"));
    $.alAuxiliaryEffectSlotfv$C4SoundModifiers = al$alGetProcAddress(S("alAuxiliaryEffectSlotfv"));
    $.alGetAuxiliaryEffectSloti$C4SoundModifiers = al$alGetProcAddress(S("alGetAuxiliaryEffectSloti"));
    $.alGetAuxiliaryEffectSlotiv$C4SoundModifiers = al$alGetProcAddress(S("alGetAuxiliaryEffectSlotiv"));
    $.alGetAuxiliaryEffectSlotf$C4SoundModifiers = al$alGetProcAddress(S("alGetAuxiliaryEffectSlotf"));
    $.alGetAuxiliaryEffectSlotfv$C4SoundModifiers = al$alGetProcAddress(S("alGetAuxiliaryEffectSlotfv"));
    if ($.alGenEffects$C4SoundModifiers == null) {
      $.LogF(S("ALExt: Error loading efx extensions. Sound modifications disabled."));
      return;
    }
    let sAvailableEffects = new $.StdStrBuf().init$pi8$b(S(""));
    let sUnavailableEffects = new $.StdStrBuf().init$pi8$b(S(""));
    if (!('C4SoundModifierList$Init$test_effects' in $)) $.C4SoundModifierList$Init$test_effects = $own([{ effect: 1, name: S("AL_EFFECT_REVERB") }, { effect: 4, name: S("AL_EFFECT_ECHO") }, { effect: 12, name: S("AL_EFFECT_EQUALIZER") }]);
    const effect = [0];
    $.alGenEffects$C4SoundModifiers(1, P(effect, 0));
    let err = al$alGetError();
    if (err !== 0) {
      $.LogF(S("OpenAL alGenEffects Error: %s"), al$alGetString(err));
    }
    for (const test_effect of $.C4SoundModifierList$Init$test_effects) {
      $.alEffecti$C4SoundModifiers(effect[0], 32769, test_effect.effect);
      err = al$alGetError();
      let is_ok = err === 0;
      this.is_effect_available[test_effect.effect] = is_ok;
      let target_string = null;
      if (!is_ok) {
        target_string = sUnavailableEffects;
      } else {
        target_string = sAvailableEffects;
      }
      if (target_string.getLength() !== 0) {
        target_string.Append$pi8(S(", "));
      }
      target_string.Append$pi8(test_effect.name);
      if (!is_ok) {
        target_string.AppendFormat(S(" (%s)"), al$alGetString(err));
      }
    }
    if ($.alIsEffect$C4SoundModifiers(effect[0]) !== 0) {
      $.alDeleteEffects$C4SoundModifiers(1, P(effect, 0));
    }
    if (sAvailableEffects.getLength() === 0) {
      $.StdStrBuf.prototype.op_assign$pi8.call(sAvailableEffects, S("(none)"));
    }
    if (sUnavailableEffects.getLength() === 0) {
      $.StdStrBuf.prototype.op_assign$pi8.call(sUnavailableEffects, S("(none)"));
    }
    $.LogF(S("OpenAL extensions loaded. Available: %s. Unavailable: %s."), sAvailableEffects.getData(), sUnavailableEffects.getData());
    this.is_initialized = true;
  }

  Add(new_modifier) {
    this.sound_modifiers.push(new_modifier);
  }

  Remove(prev_modifier) {
    seq_remove(this.sound_modifiers, prev_modifier);
  }

  Get(props, create_if_not_found) {
    let iter = std_find_if($begin(this.sound_modifiers), $end(this.sound_modifiers), ((mod) => {
  return mod.GetProps() === props;
}));
    if (!iter.eq($end(this.sound_modifiers))) {
      return iter.v;
    }
    if (!create_if_not_found) {
      return null;
    }
    let modifier = null;
    let effect_type = props.GetPropertyInt(145 /*P_Type*/);
    if (!this.is_effect_available[effect_type]) {
      return null;
    }
    switch (effect_type) {
      case 1:
        modifier = new C4SoundModifierReverb().init(props);
        break;
      case 4:
        modifier = new C4SoundModifierEcho().init(props);
        break;
      case 12:
        modifier = new C4SoundModifierEqualizer().init(props);
        break;
      default:
        return null;
    }
    modifier.Update();
    return modifier;
  }

  Clear() {
    for (let iter = $begin(this.sound_modifiers); !iter.eq($end(this.sound_modifiers)); ) {
      let modifier = iter.v;
      iter.inc();
      0;
      modifier.Release();
    }
  }

  SetGlobalModifier(new_modifier, player_number) {
    let global_modifier_index = player_number + 1 | 0;
    if (global_modifier_index < 0) {
      return;
    }
    let index = $u64n(global_modifier_index);
    if (index >= this.global_modifiers.length) {
      resize(this.global_modifiers, index + 1, () => null);
    }
    if (new_modifier !== this.global_modifiers[index]) {
      let old_modifier = this.global_modifiers[index];
      this.global_modifiers[index] = new_modifier;
      for (let pInst = $.Application.SoundSystem.GetFirstInstance(); pInst != null; pInst = $.Application.SoundSystem.GetNextInstance(pInst)) {
        if (pInst.GetModifier() === old_modifier) {
          pInst.SetModifier(new_modifier, true);
        }
      }
      if (new_modifier != null) {
        new_modifier.AddRef();
      }
      if (old_modifier != null) {
        old_modifier.DelRef();
      }
    }
  }

  GetGlobalModifier(player_index) {
    let list_index = player_index + 1 | 0;
    if (list_index < 0 || $u64n(list_index) >= this.global_modifiers.length) {
      return null;
    }
    let result = this.global_modifiers[$u64n(list_index)];
    if (result == null && list_index !== 0) {
      result = this.global_modifiers[0];
    }
    return result;
  }

  $clone() { return new C4SoundModifierList().$assign(this); }
  $assign(o) {
    this.is_initialized = o.is_initialized;
    this.is_effect_available = o.is_effect_available.slice();
    this.sound_modifiers = o.sound_modifiers.slice();
    this.global_modifiers = o.global_modifiers.slice();
    return this;
  }
}

export class C4SoundModifierReverb extends C4SoundModifier {

  init(in_props) {
    super.init(in_props);
    $.alEffecti$C4SoundModifiers(this.effect, 32769, 1);
    return this;
  }

  Update() {
    $.Application.MusicSystem.SelectContext();
    $.alEffectf$C4SoundModifiers(this.effect, 1, this.GetFloatProp(146 /*P_Reverb_Density*/, Math.fround(1000), 1));
    $.alEffectf$C4SoundModifiers(this.effect, 2, this.GetFloatProp(147 /*P_Reverb_Diffusion*/, Math.fround(1000), 1));
    $.alEffectf$C4SoundModifiers(this.effect, 3, this.GetFloatProp(148 /*P_Reverb_Gain*/, Math.fround(1000), Math.fround(0.316000015)));
    $.alEffectf$C4SoundModifiers(this.effect, 4, this.GetFloatProp(149 /*P_Reverb_GainHF*/, Math.fround(1000), 1));
    $.alEffectf$C4SoundModifiers(this.effect, 5, this.GetFloatProp(150 /*P_Reverb_Decay_Time*/, Math.fround(1000), Math.fround(2.91000009)));
    $.alEffectf$C4SoundModifiers(this.effect, 6, this.GetFloatProp(151 /*P_Reverb_Decay_HFRatio*/, Math.fround(1000), Math.fround(1.29999995)));
    $.alEffectf$C4SoundModifiers(this.effect, 7, this.GetFloatProp(152 /*P_Reverb_Reflections_Gain*/, Math.fround(1000), 0.5));
    $.alEffectf$C4SoundModifiers(this.effect, 8, this.GetFloatProp(153 /*P_Reverb_Reflections_Delay*/, Math.fround(1000), Math.fround(0.0149999997)));
    $.alEffectf$C4SoundModifiers(this.effect, 9, this.GetFloatProp(154 /*P_Reverb_Late_Reverb_Gain*/, Math.fround(1000), Math.fround(0.70599997)));
    $.alEffectf$C4SoundModifiers(this.effect, 10, this.GetFloatProp(155 /*P_Reverb_Late_Reverb_Delay*/, Math.fround(1000), Math.fround(0.0219999999)));
    $.alEffectf$C4SoundModifiers(this.effect, 11, this.GetFloatProp(156 /*P_Reverb_Air_Absorption_GainHF*/, Math.fround(1000), Math.fround(0.994000017)));
    $.alEffectf$C4SoundModifiers(this.effect, 12, this.GetFloatProp(157 /*P_Reverb_Room_Rolloff_Factor*/, Math.fround(1000), 0));
    $.alEffecti$C4SoundModifiers(this.effect, 13, this.GetBoolProp(158 /*P_Reverb_Decay_HFLimit*/, true) ? 1 : 0);
    C4SoundModifier.prototype.Update.call(this);
  }

  $clone() { return new C4SoundModifierReverb().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class C4SoundModifierEcho extends C4SoundModifier {

  init(in_props) {
    super.init(in_props);
    $.alEffecti$C4SoundModifiers(this.effect, 32769, 4);
    return this;
  }

  Update() {
    $.Application.MusicSystem.SelectContext();
    $.alEffectf$C4SoundModifiers(this.effect, 1, this.GetFloatProp(159 /*P_Echo_Delay*/, Math.fround(1000), Math.fround(0.100000001)));
    $.alEffectf$C4SoundModifiers(this.effect, 2, this.GetFloatProp(160 /*P_Echo_LRDelay*/, Math.fround(1000), Math.fround(0.100000001)));
    $.alEffectf$C4SoundModifiers(this.effect, 3, this.GetFloatProp(161 /*P_Echo_Damping*/, Math.fround(1000), 0.5));
    $.alEffectf$C4SoundModifiers(this.effect, 4, this.GetFloatProp(162 /*P_Echo_Feedback*/, Math.fround(1000), 0.5));
    $.alEffectf$C4SoundModifiers(this.effect, 5, this.GetFloatProp(163 /*P_Echo_Spread*/, Math.fround(1000), -1));
    C4SoundModifier.prototype.Update.call(this);
  }

  $clone() { return new C4SoundModifierEcho().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class C4SoundModifierEqualizer extends C4SoundModifier {

  init(in_props) {
    super.init(in_props);
    $.alEffecti$C4SoundModifiers(this.effect, 32769, 12);
    return this;
  }

  Update() {
    $.Application.MusicSystem.SelectContext();
    $.alEffectf$C4SoundModifiers(this.effect, 1, this.GetFloatProp(164 /*P_Equalizer_Low_Gain*/, Math.fround(1000), 1));
    $.alEffectf$C4SoundModifiers(this.effect, 2, this.GetFloatProp(165 /*P_Equalizer_Low_Cutoff*/, Math.fround(1000), 200));
    $.alEffectf$C4SoundModifiers(this.effect, 3, this.GetFloatProp(166 /*P_Equalizer_Mid1_Gain*/, Math.fround(1000), 1));
    $.alEffectf$C4SoundModifiers(this.effect, 4, this.GetFloatProp(167 /*P_Equalizer_Mid1_Center*/, Math.fround(1000), 500));
    $.alEffectf$C4SoundModifiers(this.effect, 5, this.GetFloatProp(168 /*P_Equalizer_Mid1_Width*/, Math.fround(1000), 1));
    $.alEffectf$C4SoundModifiers(this.effect, 6, this.GetFloatProp(169 /*P_Equalizer_Mid2_Gain*/, Math.fround(1000), 1));
    $.alEffectf$C4SoundModifiers(this.effect, 7, this.GetFloatProp(170 /*P_Equalizer_Mid2_Center*/, Math.fround(1000), 3000));
    $.alEffectf$C4SoundModifiers(this.effect, 8, this.GetFloatProp(171 /*P_Equalizer_Mid2_Width*/, Math.fround(1000), 1));
    $.alEffectf$C4SoundModifiers(this.effect, 9, this.GetFloatProp(172 /*P_Equalizer_High_Gain*/, Math.fround(1000), 1));
    $.alEffectf$C4SoundModifiers(this.effect, 10, this.GetFloatProp(173 /*P_Equalizer_High_Cutoff*/, Math.fround(1000), 6000));
    C4SoundModifier.prototype.Update.call(this);
  }

  $clone() { return new C4SoundModifierEqualizer().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}























export function $init(): void {
  $.alGenEffects$C4SoundModifiers = null;
  $.alDeleteEffects$C4SoundModifiers = null;
  $.alIsEffect$C4SoundModifiers = null;
  $.alEffecti$C4SoundModifiers = null;
  $.alEffectiv$C4SoundModifiers = null;
  $.alEffectf$C4SoundModifiers = null;
  $.alEffectfv$C4SoundModifiers = null;
  $.alGetEffecti$C4SoundModifiers = null;
  $.alGetEffectiv$C4SoundModifiers = null;
  $.alGetEffectf$C4SoundModifiers = null;
  $.alGetEffectfv$C4SoundModifiers = null;
  $.alGenAuxiliaryEffectSlots$C4SoundModifiers = null;
  $.alDeleteAuxiliaryEffectSlots$C4SoundModifiers = null;
  $.alIsAuxiliaryEffectSlot$C4SoundModifiers = null;
  $.alAuxiliaryEffectSloti$C4SoundModifiers = null;
  $.alAuxiliaryEffectSlotiv$C4SoundModifiers = null;
  $.alAuxiliaryEffectSlotf$C4SoundModifiers = null;
  $.alAuxiliaryEffectSlotfv$C4SoundModifiers = null;
  $.alGetAuxiliaryEffectSloti$C4SoundModifiers = null;
  $.alGetAuxiliaryEffectSlotiv$C4SoundModifiers = null;
  $.alGetAuxiliaryEffectSlotf$C4SoundModifiers = null;
  $.alGetAuxiliaryEffectSlotfv$C4SoundModifiers = null;
}

Object.assign($, { C4SoundModifier, C4SoundModifierEcho, C4SoundModifierEqualizer, C4SoundModifierList, C4SoundModifierReverb });
