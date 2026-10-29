// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/option/AudioMixerOption.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/**
 *  Copyright (C) 2002-2022   The FreeCol Team
 *
 *  This file is part of FreeCol.
 *
 *  FreeCol is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  FreeCol is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with FreeCol.  If not, see <http://www.gnu.org/licenses/>.
 */
import { $J, ArrayList, AudioSystem, Comparator, IllegalArgumentException, JObject, Level, Logger, StringBuilder } from '../../../../../../jre/index.ts';
import { AbstractOption } from './AbstractOption.ts';

let Messages, FreeColObject, CollectionUtils;

/**
 * Option for selecting an audio mixer.
 */
export class AudioMixerOption extends AbstractOption {
  static logger: Logger = null;
  static readonly TAG: string = 'audioMixerOption';
  /**
   * Autodetect the mixer?
   */
  static AUTO_NAME: string = null;
  /**
   * The autodetected mixer.
   */
  static AUTODETECTED_MIXER: Mixer = null;
  /**
   * The default mixer wrapper around the autodetected mixer.
   */
  static DEFAULT_MIXER_WRAPPER: AudioMixerOption$MixerWrapper = null;
  /**
   * The available audio mixers.
   */
  static audioMixers: List<AudioMixerOption$MixerWrapper> = null;
  /**
   * The value of this option.
   */
  value_: AudioMixerOption$MixerWrapper = null;
  /**
   * Creates a new {@code AudioMixerOption}.
   *
   * @param specification The {@code Specification} to refer to.
   */
  _AudioMixerOption(specification: Specification): this {
    this._AbstractOption$Specification(specification);
    this.value_ = null;
    return this;
  }
  /**
   * Gets a mixer wrapper by name.
   *
   * @param name The mixer wrapper name.
   * @return The mixer wrapper with the name given, or null if none.
   */
  getMixerWrapperByName(name: string): AudioMixerOption$MixerWrapper {
    return CollectionUtils.find$Collection$Predicate(AudioMixerOption.audioMixers, (mw) => $J.equals(mw.getKey(), name));
  }
  /**
   * Gets a list of the available audio mixers.
   *
   * @return The available mixers.
   */
  getChoices(): List<AudioMixerOption$MixerWrapper> {
    return new ArrayList(AudioMixerOption.audioMixers);
  }
  /**
   * {@inheritDoc}
   */
  cloneOption(): AudioMixerOption {
    let result = new AudioMixerOption()._AudioMixerOption(this.getSpecification());
    result.setValues(this);
    return result;
  }
  /**
   * {@inheritDoc}
   */
  getValue$(): AudioMixerOption$MixerWrapper {
    return this.value_;
  }
  /**
   * {@inheritDoc}
   */
  setValue$Object(newValue: AudioMixerOption$MixerWrapper): void {
    let oldValue = this.value_;
    if (newValue == null) {
      newValue = AudioMixerOption.DEFAULT_MIXER_WRAPPER;
    }
    this.value_ = newValue;
    if (!newValue.equals(oldValue)) {
      this.firePropertyChange$String$Object$Object(FreeColObject.VALUE_TAG, oldValue, this.value_);
    }
  }
  /**
   * {@inheritDoc}
   */
  setValue$String$String(valueString: string, defaultValueString: string): void {
    let mw = null;
    if (mw == null && valueString != null) {
      mw = this.getMixerWrapperByName(valueString);
    }
    if (mw == null && defaultValueString != null) {
      mw = this.getMixerWrapperByName(defaultValueString);
    }
    if (mw == null) {
      mw = AudioMixerOption.DEFAULT_MIXER_WRAPPER;
    }
    this.setValue$Object(mw);
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    if (this.value_ != null) {
      xw.writeAttribute(FreeColObject.VALUE_TAG, this.value_.getKey());
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return AudioMixerOption.TAG;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(16);
    sb.append(String.fromCharCode(91 /* '[' */)).append(this.getId()).append(String.fromCharCode(32 /* ' ' */)).append($J.str(this.getValue$())).append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
  static $clinit() {
    AudioMixerOption.logger = Logger.getLogger($J.cls(AudioMixerOption).getName());
    AudioMixerOption.AUTO_NAME = Messages.message$String('clientOptions.audio.audioMixer.automatic');
    let mixer = null;
    try {
      mixer = AudioSystem.getMixer(null);
    } catch ($e0) {
      if ($J.isa($e0, IllegalArgumentException)) {
        let e = $J.exc($e0);
        AudioMixerOption.logger.log(Level.FINE, 'No Audio Mixer installed on the system.', e);
      } else {
        throw $e0;
      }
    }
    AudioMixerOption.AUTODETECTED_MIXER = mixer;
    AudioMixerOption.DEFAULT_MIXER_WRAPPER = new AudioMixerOption$MixerWrapper()._AudioMixerOption$MixerWrapper(AudioMixerOption.AUTO_NAME, (AudioMixerOption.AUTODETECTED_MIXER == null) ? null : AudioMixerOption.AUTODETECTED_MIXER.getMixerInfo());
    AudioMixerOption.audioMixers = new ArrayList();
    AudioMixerOption.audioMixers.addAll(CollectionUtils.transform$ObjectArr$Predicate$Function$Comparator(AudioSystem.getMixerInfo(), CollectionUtils.alwaysTrue(), (mi) => new AudioMixerOption$MixerWrapper()._AudioMixerOption$MixerWrapper(mi.getName(), mi), Comparator.naturalOrder()));
    AudioMixerOption.audioMixers.add(0, AudioMixerOption.DEFAULT_MIXER_WRAPPER);
  }
}

/**
 * A wrapper for the mixer, including the Mixer.Info including a
 * potentially null value.
 */
export class AudioMixerOption$MixerWrapper extends JObject {
  /**
   * The name for this wrapper.
   */
  name: string = null;
  /**
   * The mixer info for a mixer.
   */
  mixerInfo: Mixer_Info = null;
  _AudioMixerOption$MixerWrapper(name: string, mixerInfo: Mixer_Info): this {
    this.name = name;
    this.mixerInfo = mixerInfo;
    return this;
  }
  getKey(): string {
    return this.name;
  }
  getMixerInfo(): Mixer_Info {
    return this.mixerInfo;
  }
  compareTo(mw: AudioMixerOption$MixerWrapper): number {
    return $J.compareTo(this.getKey(), mw.getKey());
  }
  /**
   * {@inheritDoc}
   */
  equals(o: any): boolean {
    if (this === o) {
      return true;
    }
    if (o instanceof AudioMixerOption$MixerWrapper) {
      return $J.equals((o).getKey(), this.getKey());
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    return $J.hashCode(this.getKey());
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(32);
    sb.append(this.name).append(String.fromCharCode(47 /* \u002f */)).append((this.mixerInfo == null) ? 'null' : this.mixerInfo.toString());
    return sb.toString();
  }
}

$J.define(AudioMixerOption, 'net.sf.freecol.common.option.AudioMixerOption', { kind: 'class', sup: 'net.sf.freecol.common.option.AbstractOption', ctors: { 'net.sf.freecol.common.model.Specification': '_AudioMixerOption' }, returns: { 'getXMLTagName': 'java.lang.String', 'getValue$': 'net.sf.freecol.common.option.AudioMixerOption$MixerWrapper', 'getChoices': 'java.util.List' }, meths: { 'setValue(java.lang.String,java.lang.String)': 'setValue$String$String', 'setValue(net.sf.freecol.common.option.AudioMixerOption$MixerWrapper)': 'setValue$Object', 'getValue()': 'getValue$' }, clinit: true, lazy: ['logger', 'AUTO_NAME', 'AUTODETECTED_MIXER', 'DEFAULT_MIXER_WRAPPER', 'audioMixers'] });
$J.define(AudioMixerOption$MixerWrapper, 'net.sf.freecol.common.option.AudioMixerOption$MixerWrapper', { kind: 'class', ifaces: ['java.lang.Comparable'], sup: 'java.lang.Object', ctors: { 'java.lang.String,javax.sound.sampled.Mixer$Info': '_AudioMixerOption$MixerWrapper' }, returns: { 'hashCode': 'int', 'getMixerInfo': 'javax.sound.sampled.Mixer$Info', 'getKey': 'java.lang.String' } });
$J.module(() => {
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
