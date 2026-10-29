// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/control/SoundController.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Exception, JObject, Logger } from '../../../../../../jre/index.ts';

let ClientOptions, Messages, AudioMixerOption, PercentageOption, ResourceManager, SoundPlayer;

/**
 * Controls the SoundPlayer.
 */
export class SoundController extends JObject {
  static logger: Logger = null;
  /**
   * The internal sound player for sound effects.
   */
  soundPlayer: SoundPlayer = null;
  /**
   * The internal sound player for music.
   */
  musicPlayer: SoundPlayer = null;
  /**
   * Prepare the sound system.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param sound Enable sound if true.
   */
  _SoundController(freeColClient: FreeColClient, sound: boolean): this {
    let opts = freeColClient.getClientOptions();
    this.soundPlayer = null;
    if (sound) {
      let amo = null;
      try {
        amo = opts.getOption$String$Class(ClientOptions.AUDIO_MIXER, $J.cls(AudioMixerOption));
      } catch ($e0) {
        if ($J.isa($e0, Exception)) {
          let ex = $J.exc($e0);
          SoundController.logger.warning(ex.getMessage());
        } else {
          throw $e0;
        }
      }
      if (amo == null) {
        return this;
      }
      SoundController.logger.info('Create sound player with ' + $J.str(amo));
      this.soundPlayer = new SoundPlayer()._SoundPlayer(amo, opts.getOption$String$Class(ClientOptions.SOUND_EFFECTS_VOLUME, $J.cls(PercentageOption)));
      this.musicPlayer = new SoundPlayer()._SoundPlayer(amo, opts.getOption$String$Class(ClientOptions.MUSIC_VOLUME, $J.cls(PercentageOption)));
    }
    return this;
  }
  /**
   * Can this client play sounds?
   *
   * @return True if there is a sound player with a valid mixer present.
   */
  canPlaySound(): boolean {
    return this.soundPlayer != null && this.soundPlayer.getMixer() != null;
  }
  /**
   * Play as a sound effect.
   *
   * @param sound The sound resource to play, or if null stop playing.
   */
  playSound(sound: string): void {
    this.play(this.soundPlayer, sound);
  }
  /**
   * Play as music.
   *
   * @param sound The sound resource to play, or if null stop playing.
   */
  playMusic(sound: string): void {
    this.play(this.musicPlayer, sound);
  }
  play(sp: SoundPlayer, sound: string): void {
    if (!this.canPlaySound()) {
      return;
    }
    sp.stop();
    if (sound == null) {
      return;
    }
    let file = ResourceManager.getAudio(sound);
    if (file == null) {
      return;
    }
    let playing = sp.playOnce(file);
    SoundController.logger.finest(((playing) ? 'Queued' : 'Fail on') + ' sound: ' + sound);
  }
  /**
   * Defines the default playlist.
   *
   * @param files The {@code File}s to be played when
   *      nothing else is being played.
   */
  setDefaultPlaylist(files: List<File>): void {
    if (this.musicPlayer != null) {
      this.musicPlayer.setDefaultPlaylist($J.toArrayInto(files.toArray(), $J.newArray(0, null)));
    }
  }
  /**
   * Get the label text for the sound player mixer.
   *
   * Needed by the audio mixer option UI.
   *
   * @return The text.
   */
  getSoundMixerLabelText(): string {
    let mixer: Mixer;
    let text = (this.soundPlayer == null) ? Messages.message$String('nothing') : ((mixer = this.soundPlayer.getMixer()) == null) ? Messages.message$String('none') : mixer.getMixerInfo().getName();
    return Messages.message$String('current') + ':  ' + text;
  }
  static $clinit() {
    SoundController.logger = Logger.getLogger($J.cls(SoundController).getName());
  }
}

$J.define(SoundController, 'net.sf.freecol.client.control.SoundController', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.client.FreeColClient,boolean': '_SoundController' }, returns: { 'getSoundMixerLabelText': 'java.lang.String' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  ClientOptions = $J.load('net.sf.freecol.client.ClientOptions');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  AudioMixerOption = $J.load('net.sf.freecol.common.option.AudioMixerOption');
  PercentageOption = $J.load('net.sf.freecol.common.option.PercentageOption');
  ResourceManager = $J.load('net.sf.freecol.common.resources.ResourceManager');
  SoundPlayer = $J.load('net.sf.freecol.common.sound.SoundPlayer');
});
