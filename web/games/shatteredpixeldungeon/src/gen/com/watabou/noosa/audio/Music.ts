// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/noosa/audio/Music.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections, Exception, Gdx, HashMap, JEnum, JObject, JString } from '../../../../../jre/index.ts';

let Game, DeviceCompat, Random;

export class Music extends JEnum {
  player: Music = null;
  lastPlayed: string = null;
  looping_: boolean = false;
  enabled_: boolean = false;
  volume_: number = 0;
  fadeTime: number = 0;
  fadeTotal: number = 0;
  onFadeOut: Callback = null;
  trackList: string[] = null;
  trackChances: number[] = null;
  trackQueue: ArrayList<string> = null;
  trackPlayers: HashMap<string, Music> = null;
  shuffle_: boolean = false;
  trackLooper: Music_OnCompletionListener = null;
  paused_: boolean = false;
  static INSTANCE: Music = null;
  static $VALUES: Music[] = null;
  _Music($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    this.enabled_ = true;
    this.volume_ = 1;
    this.fadeTime = Math.fround(-1);
    this.fadeTotal = Math.fround(-1);
    this.onFadeOut = null;
    this.trackQueue = new ArrayList();
    this.trackPlayers = new HashMap();
    this.shuffle_ = false;
    this.trackLooper = new (Music$1())().$o(this);
    this.paused_ = false;
    return this;
  }
  play$String$boolean(assetName: string, looping: boolean): void {
    if (assetName != null && DeviceCompat.isiOS()) {
      assetName = JString.replace(assetName, '.ogg', '.mp3');
    }
    if (this.player != null && this.lastPlayed != null && $J.equals(this.lastPlayed, assetName)) {
      this.player.setVolume(this.volumeWithFade());
      if (!this.isPlaying()) {
        this.player.play();
      }
      return;
    }
    this.reset();
    this.lastPlayed = assetName;
    this.trackList = null;
    this.looping_ = looping;
    this.shuffle_ = false;
    if (!this.enabled_ || assetName == null) {
      return;
    }
    this.play$String$OnCompletionListener$Music(assetName, null);
  }
  playTracks(tracks: string[], chances: number[], shuffle: boolean): void {
    if (tracks == null || tracks.length === 0 || tracks.length !== chances.length) {
      this.stop();
      return;
    }
    if (tracks != null && DeviceCompat.isiOS()) {
      for (let i = 0; i < tracks.length; i++) {
        tracks[i] = JString.replace(tracks[i], '.ogg', '.mp3');
      }
    }
    if (this.player != null && this.trackList != null && tracks.length === this.trackList.length) {
      let sameList = false;
      for (let ofs = 0; ofs < tracks.length; ofs++) {
        sameList = true;
        for (let j = 0; j < tracks.length; j++) {
          let i = ((j + ofs) | 0) % tracks.length;
          if (!$J.equals(tracks[i], this.trackList[j]) || chances[i] !== this.trackChances[j]) {
            sameList = false;
            break;
          }
        }
        if (sameList) {
          break;
        }
      }
      if (sameList) {
        this.player.setVolume(this.volumeWithFade());
        if (!this.isPlaying()) {
          this.player.play();
        }
        return;
      }
    }
    this.reset();
    this.lastPlayed = null;
    this.trackList = tracks;
    this.trackChances = chances;
    this.trackQueue.clear();
    try {
      for (let i = 0; i < this.trackList.length; i++) {
        this.createPlayer(this.trackList[i]);
        if (Random.Float$() < this.trackChances[i]) {
          this.trackQueue.add(this.trackList[i]);
        }
      }
    } catch ($e0) {
      if ($J.isa($e0, Exception)) {
        let e = $J.exc($e0);
        Game.reportException(e);
        this.reset();
        this.trackQueue.clear();
      } else {
        throw $e0;
      }
    }
    this.looping_ = false;
    this.shuffle_ = shuffle;
    if (!this.enabled_ || this.trackQueue.isEmpty()) {
      return;
    }
    this.play$String$OnCompletionListener$Music(this.trackQueue.removeAt(0), this.trackLooper);
  }
  fadeOut(duration: number, onComplete: Callback): void {
    if (this.fadeTotal === Math.fround(-1)) {
      this.fadeTotal = duration;
      this.fadeTime = 0;
    } else {
      this.fadeTime = Math.fround((Math.fround(this.fadeTime / this.fadeTotal)) * duration);
      this.fadeTotal = duration;
    }
    this.onFadeOut = onComplete;
  }
  update(): void {
    if (this.fadeTotal > 0 && !this.paused_) {
      this.fadeTime = Math.fround(this.fadeTime + Game.elapsed);
      if (this.player != null) {
        this.player.setVolume(this.volumeWithFade());
      }
      if (this.fadeTime >= this.fadeTotal) {
        this.fadeTime = this.fadeTotal = Math.fround(-1);
        if (this.onFadeOut != null) {
          this.onFadeOut.call();
        }
      }
    }
  }
  playNextTrack(music: Music): void {
    if (this.trackList == null || this.trackList.length === 0 || music !== this.player || this.player.isLooping()) {
      return;
    }
    this.stop();
    if (this.trackQueue.isEmpty()) {
      for (let i = 0; i < this.trackList.length; i++) {
        if (Random.Float$() < this.trackChances[i]) {
          this.trackQueue.add(this.trackList[i]);
        }
      }
      if (this.shuffle_) {
        Collections.shuffle(this.trackQueue);
      }
    }
    if (!this.enabled_ || this.trackQueue.isEmpty()) {
      return;
    }
    this.play$String$OnCompletionListener$Music(this.trackQueue.removeAt(0), this.trackLooper);
  }
  play$String$OnCompletionListener$Music(track: string, listener: Music_OnCompletionListener): void {
    try {
      this.fadeTime = this.fadeTotal = -1;
      this.player = this.createPlayer(track);
      this.player.setLooping(this.looping_);
      this.player.setVolume(this.volumeWithFade());
      if (!this.paused_) {
        this.player.play();
      }
      if (listener != null) {
        this.player.setOnCompletionListener(listener);
      } else {
        this.player.setOnCompletionListener(null);
      }
    } catch ($e1) {
      if ($J.isa($e1, Exception)) {
        let e = $J.exc($e1);
        Game.reportException(e);
        this.player = null;
      } else {
        throw $e1;
      }
    }
  }
  end(): void {
    this.lastPlayed = null;
    this.trackList = null;
    this.stop();
  }
  paused(): boolean {
    return this.paused_;
  }
  pause(): void {
    this.paused_ = true;
    if (this.player != null) {
      this.player.pause();
    }
  }
  resume(): void {
    this.paused_ = false;
    if (this.player != null) {
      this.player.play();
      this.player.setLooping(this.looping_);
    }
  }
  stop(): void {
    if (this.player != null) {
      this.player.stop();
      this.player = null;
    }
  }
  reset(): void {
    if (this.player != null) {
      this.player.stop();
      this.player = null;
    }
    for (const $it2 = this.trackPlayers.values().iterator(); $it2.hasNext(); ) {
      let cached = $it2.next();
      cached.dispose();
    }
    this.trackPlayers.clear();
  }
  createPlayer(asset: string): Music {
    if (this.trackPlayers.containsKey(asset)) {
      return this.trackPlayers.get(asset);
    } else {
      let player = Gdx.audio.newMusic(Gdx.files.internal(asset));
      this.trackPlayers.put(asset, player);
      return player;
    }
  }
  volume(value: number): void {
    this.volume_ = value;
    if (this.player != null) {
      this.player.setVolume(this.volumeWithFade());
    }
  }
  volumeWithFade(): number {
    if (this.fadeTotal > 0) {
      return Math.max(0, Math.fround(this.volume_ * (Math.fround((Math.fround(this.fadeTotal - this.fadeTime)) / this.fadeTotal))));
    } else {
      return this.volume_;
    }
  }
  isPlaying(): boolean {
    return this.player != null && this.player.isPlaying();
  }
  enable(value: boolean): void {
    this.enabled_ = value;
    if (this.isPlaying() && !value) {
      this.stop();
    } else if (!this.isPlaying() && value) {
      if (this.trackList != null) {
        this.playTracks(this.trackList, this.trackChances, this.shuffle_);
      } else if (this.lastPlayed != null) {
        this.play$String$boolean(this.lastPlayed, this.looping_);
      }
    }
  }
  isEnabled(): boolean {
    return this.enabled_;
  }
  static values(): Music[] { return Music.$VALUES.slice(); }
  static valueOf(name: string): Music { return $J.enumValueOf(Music, name); }
  static $clinit() {
    Music.INSTANCE = new Music()._Music('INSTANCE', 0);
    Music.$VALUES = [Music.INSTANCE];
  }
}

let $Music$1: any = null;
/** An anonymous class (Music.java:186). */
function Music$1(): any {
  return $Music$1 ??= $J.local(class extends JObject {
    onCompletion(music: Music): void {
      if (this.$outer.fadeTotal === Math.fround(-1)) {
        this.$outer.playNextTrack(music);
      }
    }
  }, 'com.watabou.noosa.audio.Music$1', ['com.badlogic.gdx.audio.Music$OnCompletionListener']);
}

$J.define(Music, 'com.watabou.noosa.audio.Music', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Music' }, meths: { 'play(java.lang.String,com.badlogic.gdx.audio.Music$OnCompletionListener)': 'play$String$OnCompletionListener$Music', 'play(java.lang.String,boolean)': 'play$String$boolean' }, clinit: true, lazy: ['$VALUES', 'INSTANCE'] });
$J.module(() => {
  Game = $J.load('com.watabou.noosa.Game');
  DeviceCompat = $J.load('com.watabou.utils.DeviceCompat');
  Random = $J.load('com.watabou.utils.Random');
});
