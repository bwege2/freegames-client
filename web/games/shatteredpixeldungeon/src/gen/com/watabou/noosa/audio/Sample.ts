// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/noosa/audio/Sample.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
/*
 * Pixel Dungeon
 * Copyright (C) 2012-2015 Oleg Dolya
 *
 * Shattered Pixel Dungeon
 * Copyright (C) 2014-2026 Evan Debenham
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 */
import { $J, Exception, Gdx, HashMap, HashSet, JEnum, JObject, LinkedList } from '../../../../../jre/index.ts';

let Game;

export class Sample extends JEnum {
  ids: HashMap<any, Sound> = null;
  enabled_: boolean = false;
  globalVolume: number = 0;
  static loadingQueue: LinkedList<string> = null;
  static delayedSFX: HashSet<Sample$DelayedSoundEffect> = null;
  static INSTANCE: Sample = null;
  static $VALUES: Sample[] = null;
  _Sample($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    this.ids = new HashMap();
    this.enabled_ = true;
    this.globalVolume = 1;
    return this;
  }
  reset(): void {
    for (const $it0 = this.ids.values().iterator(); $it0.hasNext(); ) {
      let sound = $it0.next();
      sound.dispose();
    }
    this.ids.clear();
    Sample.delayedSFX.clear();
  }
  pause(): void {
    for (const $it1 = this.ids.values().iterator(); $it1.hasNext(); ) {
      let sound = $it1.next();
      sound.pause();
    }
  }
  resume(): void {
    for (const $it2 = this.ids.values().iterator(); $it2.hasNext(); ) {
      let sound = $it2.next();
      sound.resume();
    }
  }
  load$String(asset: string): void {
    if (asset != null) {
      try {
        let newSound = Gdx.audio.newSound(Gdx.files.internal(asset));
        this.ids.put(asset, newSound);
      } catch ($e3) {
        if ($J.isa($e3, Exception)) {
          let e = $J.exc($e3);
          Game.reportException(e);
        } else {
          throw $e3;
        }
      }
    }
  }
  load$StringArr(assets: string[]): void {
    {
      for (let asset of assets) {
        if (!this.ids.containsKey(asset) && !Sample.loadingQueue.contains(asset)) {
          Sample.loadingQueue.add(asset);
        }
      }
    }
  }
  unload(src: any): void {
    if (this.ids.containsKey(src)) {
      this.ids.get(src).dispose();
      this.ids.remove(src);
    }
  }
  play$Object(id: any): bigint {
    return this.play$Object$float(id, 1);
  }
  play$Object$float(id: any, volume: number): bigint {
    return this.play$Object$float$float$float(id, volume, volume, 1);
  }
  play$Object$float$float(id: any, volume: number, pitch: number): bigint {
    return this.play$Object$float$float$float(id, volume, volume, pitch);
  }
  play$Object$float$float$float(id: any, leftVolume: number, rightVolume: number, pitch: number): bigint {
    let volume = Math.max(leftVolume, rightVolume);
    let pan = Math.fround(rightVolume - leftVolume);
    if (this.enabled_ && this.ids.containsKey(id)) {
      return this.ids.get(id).play(Math.fround(this.globalVolume * volume), pitch, pan);
    } else {
      return -1n;
    }
  }
  playDelayed$Object$float(id: any, delay: number): void {
    this.playDelayed$Object$float$float(id, delay, 1);
  }
  playDelayed$Object$float$float(id: any, delay: number, volume: number): void {
    this.playDelayed$Object$float$float$float$float(id, delay, volume, volume, 1);
  }
  playDelayed$Object$float$float$float(id: any, delay: number, volume: number, pitch: number): void {
    this.playDelayed$Object$float$float$float$float(id, delay, volume, volume, pitch);
  }
  playDelayed$Object$float$float$float$float(id: any, delay: number, leftVolume: number, rightVolume: number, pitch: number): void {
    if (delay <= Math.fround(0)) {
      this.play$Object$float$float$float(id, leftVolume, rightVolume, pitch);
      return;
    }
    let sfx = new Sample$DelayedSoundEffect().$o(this)._Sample$DelayedSoundEffect();
    sfx.id_ = id;
    sfx.delay_ = delay;
    sfx.leftVol = leftVolume;
    sfx.rightVol = rightVolume;
    sfx.pitch = pitch;
    {
      Sample.delayedSFX.add(sfx);
    }
  }
  update(): void {
    {
      if (!Sample.loadingQueue.isEmpty()) {
        this.load$String(Sample.loadingQueue.poll());
      }
    }
    {
      if (Sample.delayedSFX.isEmpty()) {
        return;
      }
      for (let sfx of $J.toArrayInto(Sample.delayedSFX.toArray(), $J.newArray(0, null))) {
        sfx.delay_ = Math.fround(sfx.delay_ - Game.elapsed);
        if (sfx.delay_ <= Math.fround(0)) {
          Sample.delayedSFX.remove(sfx);
          this.play$Object$float$float$float(sfx.id_, sfx.leftVol, sfx.rightVol, sfx.pitch);
        }
      }
    }
  }
  enable(value: boolean): void {
    this.enabled_ = value;
  }
  volume(value: number): void {
    this.globalVolume = value;
  }
  isEnabled(): boolean {
    return this.enabled_;
  }
  static values(): Sample[] { return Sample.$VALUES.slice(); }
  static valueOf(name: string): Sample { return $J.enumValueOf(Sample, name); }
  static $clinit() {
    Sample.INSTANCE = new Sample()._Sample('INSTANCE', 0);
    Sample.$VALUES = [Sample.INSTANCE];
    Sample.loadingQueue = new LinkedList();
    Sample.delayedSFX = new HashSet();
  }
}

export class Sample$DelayedSoundEffect extends JObject {
  id_: any = null;
  delay_: number = 0;
  leftVol: number = 0;
  rightVol: number = 0;
  pitch: number = 0;
  _Sample$DelayedSoundEffect(): this {
    return this;
  }
}

$J.define(Sample, 'com.watabou.noosa.audio.Sample', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Sample' }, meths: { 'playDelayed(java.lang.Object,float,float,float,float)': 'playDelayed$Object$float$float$float$float', 'playDelayed(java.lang.Object,float,float,float)': 'playDelayed$Object$float$float$float', 'playDelayed(java.lang.Object,float,float)': 'playDelayed$Object$float$float', 'playDelayed(java.lang.Object,float)': 'playDelayed$Object$float', 'play(java.lang.Object,float,float,float)': 'play$Object$float$float$float', 'play(java.lang.Object,float,float)': 'play$Object$float$float', 'play(java.lang.Object,float)': 'play$Object$float', 'play(java.lang.Object)': 'play$Object', 'load(java.lang.String[])': 'load$StringArr', 'load(java.lang.String)': 'load$String' }, clinit: true, lazy: ['$VALUES', 'INSTANCE', 'loadingQueue', 'delayedSFX'] });
$J.define(Sample$DelayedSoundEffect, 'com.watabou.noosa.audio.Sample$DelayedSoundEffect', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Sample$DelayedSoundEffect' }, inner: true });
$J.module(() => {
  Game = $J.load('com.watabou.noosa.Game');
});
