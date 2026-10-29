// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/sound/SoundPlayer.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, AudioSystem, Collections, DataLine_Info, Exception, FloatControl_Type, IOException, IllegalArgumentException, JObject, JString, Level, LineUnavailableException, List, Logger, SecurityException, SourceDataLine, Thread, UnsupportedAudioFileException } from '../../../../../../jre/index.ts';

let FreeCol, OggVorbisDecoderFactory, Utils;

/**
 * Stripped down class for playing sound.
 *
 * The sound player depends on getting a usable value for its mixer, which
 * does not necessarily happen.  It has been hacked to just refuse to play
 * anything in this case, in the hope that a valid mixer will eventually be
 * specified.
 */
export class SoundPlayer extends JObject {
  static logger: Logger = null;
  /**
   * The mixer to write to.
   */
  mixer: Mixer = null;
  /**
   * The current volume.
   */
  volume: number = 0;
  /**
   * The subthread that actually writes sound data to the mixer.
   */
  soundPlayerThread: SoundPlayer$SoundPlayerThread = null;
  defaultPlayList: List<File> = null;
  volumeOption: PercentageOption = null;
  /**
   * Creates a sound player.
   *
   * @param mixerOption The option for setting the mixer to use.
   * @param volumeOption The volume option to use when playing audio.
   */
  _SoundPlayer(mixerOption: AudioMixerOption, volumeOption: PercentageOption): this {
    this.defaultPlayList = new ArrayList();
    this.setMixer(mixerOption.getValue$());
    mixerOption.addPropertyChangeListener$PropertyChangeListener((e) => {
      this.setMixer(e.getNewValue());
    });
    this.setVolume(volumeOption.getValue$());
    this.volumeOption = volumeOption;
    this.soundPlayerThread = new SoundPlayer$SoundPlayerThread().$o(this)._SoundPlayer$SoundPlayerThread();
    this.soundPlayerThread.setPriority(10);
    this.soundPlayerThread.start();
    return this;
  }
  /**
   * Gets the mixer.
   *
   * @return The current mixer.
   */
  getMixer(): Mixer {
    return this.mixer;
  }
  /**
   * Sets the mixer.
   *
   * Note: This can throw SecurityException and IllegalArgumentException
   * in various circumstances.  We used to catch this in the constructor
   * above, but now we let it go through to the caller.
   *
   * @param mw The new mixer.
   */
  setMixer(mw: AudioMixerOption$MixerWrapper): void {
    try {
      this.mixer = AudioSystem.getMixer(mw.getMixerInfo());
      SoundPlayer.logger.info('Mixer ' + $J.str(mw) + ' selected');
    } catch ($e0) {
      if ($J.isa($e0, Exception)) {
        let e = $J.exc($e0);
        this.mixer = null;
        SoundPlayer.logger.log(Level.WARNING, 'Bad mixer: ' + $J.str(mw) + ', sound suspended', e);
      } else {
        throw $e0;
      }
    }
  }
  /**
   * Gets the volume.
   *
   * @return The current volume.
   */
  getVolume(): number {
    return this.volume;
  }
  /**
   * Set the volume.
   *
   * @param volume The new volume.
   */
  setVolume(volume: number): void {
    this.volume = volume;
  }
  /**
   * Plays a file once.
   *
   * @param file The {@code File} to be played.
   * @return True if the file was queued to play.
   */
  playOnce(file: File): boolean {
    if (this.getMixer() == null) {
      return false;
    }
    this.soundPlayerThread.add(file);
    return true;
  }
  /**
   * Defines the default playlist.
   *
   * @param file The {@code File}s to be played when
   *      nothing else is being played.
   */
  setDefaultPlaylist(files: File[]): void {
    let newDefaultPlayList = new ArrayList(List.of(...files));
    this.defaultPlayList = newDefaultPlayList;
  }
  /**
   * Stop any playing sound.
   */
  stop(): void {
    this.soundPlayerThread.stopPlaying();
  }
  /**
   * Gets an audio input stream given a file, hopefully containing
   * audio data.
   *
   * Public so the file can be tested at load time for suitability for
   * use as audio.
   *
   * @param file The {@code File} to examine.
   * @return An {@code AudioInputStream}, or null on failure.
   * @exception IOException if the file does not contain valid audio.
   */
  static getAudioInputStream(file: File): AudioInputStream {
    let in$: AudioInputStream;
    if (file.getName().endsWith('.ogg')) {
      in$ = new OggVorbisDecoderFactory()._OggVorbisDecoderFactory().getOggStream(file);
    } else {
      try {
        in$ = AudioSystem.getAudioInputStream(file);
      } catch ($e1) {
        if ($J.isa($e1, UnsupportedAudioFileException)) {
          let uafe = $J.exc($e1);
          throw new IOException(uafe);
        } else {
          throw $e1;
        }
      }
    }
    return in$;
  }
  /**
   * Change the volume on a line.
   *
   * @param line The {@code SourceDataLine} to change the volume on.
   * @param vol The new volume.
   */
  static changeVolume(line: SourceDataLine, vol: number): void {
    let type$ = (line.isControlSupported(FloatControl_Type.VOLUME)) ? FloatControl_Type.VOLUME : (line.isControlSupported(FloatControl_Type.MASTER_GAIN)) ? FloatControl_Type.MASTER_GAIN : null;
    if (type$ == null) {
      SoundPlayer.logger.warning('No volume or master gain controls.');
      return;
    }
    let control: FloatControl;
    try {
      control = line.getControl(type$);
    } catch ($e2) {
      if ($J.isa($e2, IllegalArgumentException)) {
        let e = $J.exc($e2);
        return;
      } else {
        throw $e2;
      }
    }
    let min = control.getMinimum();
    let max = control.getMaximum();
    let gain = (vol <= 0) ? min : (vol >= 100) ? max : Math.fround(min + Math.fround(Math.fround(0.5 * (Math.fround(max - min))) * Math.fround(Math.log10(vol))));
    try {
      control.setValue(gain);
      SoundPlayer.logger.finest('Using volume ' + vol + '%, ' + control.getUnits() + '=' + $J.fstr(gain) + ' control=' + $J.str(type$));
    } catch ($e3) {
      if ($J.isa($e3, IllegalArgumentException)) {
        let ie = $J.exc($e3);
        SoundPlayer.logger.log(Level.WARNING, 'Could not set volume  (control=' + $J.str(type$) + ' in [' + $J.fstr(min) + ',' + $J.fstr(max) + ']) to ' + $J.fstr(gain) + control.getUnits(), ie);
      } else {
        throw $e3;
      }
    }
  }
  /**
   * Open a line to the mixer for a given format.
   *
   * @param audioFormat The {@code AudioFormat} to write.
   * @param mixer The {@code Mixer} to write to.
   * @param len The size of buffer to expect.
   * @return The newly opened {@code SourceDataLine} or null on error.
   */
  static openLine(audioFormat: AudioFormat, mixer: Mixer, len: number): SourceDataLine {
    let info = new DataLine_Info($J.cls(SourceDataLine), audioFormat);
    if (mixer == null) {
      SoundPlayer.logger.log(Level.WARNING, 'Null mixer');
      return null;
    }
    if (!mixer.isLineSupported(info)) {
      SoundPlayer.logger.log(Level.WARNING, 'Mixer does not support ' + $J.str(info));
      return null;
    }
    let line = null;
    try {
      line = mixer.getLine(info);
      line.open(audioFormat, len);
    } catch ($e4) {
      if ($J.isa($e4, LineUnavailableException) || $J.isa($e4, IllegalArgumentException) || $J.isa($e4, SecurityException)) {
        let e = $J.exc($e4);
        SoundPlayer.logger.log(Level.WARNING, 'Can not open SourceDataLine', e);
        return null;
      } else {
        throw $e4;
      }
    }
    line.start();
    return line;
  }
  static $clinit() {
    SoundPlayer.logger = Logger.getLogger($J.cls(SoundPlayer).getName());
  }
}

/**
 * Thread for playing sound files.
 */
export class SoundPlayer$SoundPlayerThread extends Thread {
  /**
   * How long to sleep when idle.
   */
  static readonly WAIT_TIMEOUT: number = 100;
  /**
   * A buffer to hold data to be written to the mixer.
   */
  data: number[] = null;
  /**
   * A playlist of files queued to be played.
   */
  playList: List<File> = null;
  /**
   * Flag to allow a sound that is being played to be cancelled.
   * Volatile to allow asynchronous update from SoundPlayer.
   */
  playDone: boolean = false;
  /**
   * Create a new sound player thread.
   */
  _SoundPlayer$SoundPlayerThread(): this {
    this._Thread(FreeCol.CLIENT_THREAD + 'SoundPlayer');
    this.data = $J.newArray(16384, 0);
    this.playList = new ArrayList();
    this.playDone = true;
    return this;
  }
  /**
   * Signal that a sound that is being played should stop.
   */
  stopPlaying(): void {
    this.playDone = true;
    {
      this.playList.clear();
    }
  }
  /**
   * Queue a sound to be played.
   *
   * @param sound The new sound {@code File}.
   */
  add(sound: File): void {
    {
      this.playList.add(sound);
    }
  }
  /**
   * Dequeue the next file to be played.
   *
   * @return A {@code File} to be played, or null if none present.
   */
  remove(): File {
    {
      return (this.playList.isEmpty()) ? null : this.playList.removeAt(0);
    }
  }
  /**
   * Play a sound.
   *
   * @param sound The {@code File} to play.
   * @return True if the sound was played without incident.
   * @exception IOException if unable to read or write the sound data.
   */
  playSound(sound: File): boolean {
    this.$outer.setVolume(this.$outer.volumeOption.getValue$());
    let ret = false;
    let volumeListener = null;
    {
      try {
        const in$ = SoundPlayer.getAudioInputStream(sound);
        try {
          let line = SoundPlayer.openLine(in$.getFormat(), this.$outer.getMixer(), this.data.length);
          if (line == null) {
            return false;
          }
          volumeListener = (e) => {
            this.$outer.setVolume(e.getNewValue());
            SoundPlayer.changeVolume(line, this.$outer.getVolume());
          };
          this.$outer.volumeOption.addPropertyChangeListener$PropertyChangeListener(volumeListener);
          SoundPlayer.changeVolume(line, this.$outer.getVolume());
          try {
            this.playDone = false;
            let rd: number;
            while (!this.playDone && (rd = in$.read(this.data)) > 0) {
              line.write(this.data, 0, rd);
            }
            ret = true;
          } finally {
            this.playDone = true;
            line.drain();
            line.stop();
            line.close();
          }
        } finally {
          if (in$ != null) in$.close();
        }
      } catch ($e5) {
        if ($J.isa($e5, IOException)) {
          let ioe = $J.exc($e5);
          SoundPlayer.logger.log(Level.WARNING, 'Can not open ' + $J.str(sound) + ' as audio stream', ioe);
          return false;
        } else {
          throw $e5;
        }
      } finally {
        if (volumeListener != null) {
          this.$outer.volumeOption.removePropertyChangeListener$PropertyChangeListener(volumeListener);
        }
      }
    }
    return ret;
  }
  /**
   * {@inheritDoc}
   */
  run(): void {
    for (; ; ) {
      let sound = this.remove();
      if (sound == null) {
        if (!this.$outer.defaultPlayList.isEmpty()) {
          {
            this.playList.addAll(this.$outer.defaultPlayList);
            Collections.shuffle(this.playList);
          }
          sound = this.remove();
        } else {
          Utils.delay(SoundPlayer$SoundPlayerThread.WAIT_TIMEOUT, null);
        }
      }
      if (sound != null) {
        try {
          this.playSound(sound);
        } catch ($e6) {
          if ($J.isa($e6, IOException)) {
            let e = $J.exc($e6);
            SoundPlayer.logger.log(Level.WARNING, 'Failure playing audio.', e);
          } else {
            throw $e6;
          }
        }
      }
    }
  }
}

$J.define(SoundPlayer, 'net.sf.freecol.common.sound.SoundPlayer', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.common.option.AudioMixerOption,net.sf.freecol.common.option.PercentageOption': '_SoundPlayer' }, returns: { 'getVolume': 'int', 'getMixer': 'javax.sound.sampled.Mixer' }, clinit: true, lazy: ['logger'] });
$J.define(SoundPlayer$SoundPlayerThread, 'net.sf.freecol.common.sound.SoundPlayer$SoundPlayerThread', { kind: 'class', sup: 'java.lang.Thread', ctors: { '': '_SoundPlayer$SoundPlayerThread' }, inner: true });
$J.module(() => {
  FreeCol = $J.load('net.sf.freecol.FreeCol');
  OggVorbisDecoderFactory = $J.load('net.sf.freecol.common.sound.OggVorbisDecoderFactory');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
});
