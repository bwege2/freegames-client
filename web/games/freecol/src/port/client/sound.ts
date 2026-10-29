// FreeCol's sound (common/sound): the original decodes Ogg Vorbis with JOrbis and writes it to a Java Sound line
// from a thread per player (the music, the effects), which plays its queue one file after the other and, when
// the queue is empty, the default playlist shuffled. Here the page plays the files (Web Audio, decoded by the
// browser): SoundPlayer keeps the original's queue, playlist and volume, and starts the next file when the
// page says the last one ended. The mixer is the browser's ("Web Audio").
import { $J, FileNotFoundException, Collections, ArrayList } from '../../jre/index.ts';

export const sound: any = {
  /** Plays a file (its path in the virtual file system) on a player's channel at a volume 0-100; the page does it. */
  play: (_player: number, _path: string, _volume: number) => {},
  /** Stops a player's channel. */
  stop: (_player: number) => {},
  /** Changes a player's volume (0-100). */
  volume: (_player: number, _volume: number) => {},
};

const players = new Map<number, any>();

/** The page's message that a player's file ended (or could not be played). */
export function soundEnded(player: number) {
  const p = players.get(player);
  if (!p) return;
  p.$playing = false;
  pump(p);
}

/** As SoundPlayerThread.run: the next of the queue, else the default playlist shuffled. */
function pump(p: any) {
  if (p.$playing) return;
  let file = p.$queue.length ? p.$queue.shift() : null;
  if (file == null && !p.defaultPlayList.isEmpty()) {
    const list = new ArrayList();
    list.addAll(p.defaultPlayList);
    Collections.shuffle(list);
    for (let i = 0; i < list.size(); i++) p.$queue.push(list.get(i));
    file = p.$queue.shift();
  }
  if (file == null) return;
  p.$playing = true;
  p.setVolume(p.volumeOption.getValue$());
  sound.play(p.$id, file.getAbsolutePath(), p.getVolume());
}

const MIXER_INFO = {
  getName: () => 'Web Audio',
  getVendor: () => 'Browser',
  getDescription: () => 'The browser\'s audio output',
  getVersion: () => '1',
  toString: () => 'Web Audio',
  equals(o: any) { return o === this; },
  hashCode: () => 1,
};
const MIXER = { getMixerInfo: () => MIXER_INFO, isLineSupported: () => true };

export function installSound(java: (n: string) => any) {
  const AudioSystem = java('javax.sound.sampled.AudioSystem');
  AudioSystem.getMixerInfo = () => [MIXER_INFO];
  AudioSystem.getMixer = (_info: any) => MIXER;
  const SoundPlayer = java('net.sf.freecol.common.sound.SoundPlayer');
  // the audio resource checks that its file is audio: here, that the file exists
  $J.replaceStatic(SoundPlayer, 'getAudioInputStream', (file: any) => {
    if (!file.exists()) throw new FileNotFoundException(file.getPath());
    return { $file: file, getFormat: () => null, close() {}, read: () => -1 };
  });
  const P = SoundPlayer.prototype;
  let nextId = 1;
  // SoundPlayer(mixerOption, volumeOption), without its thread
  $J.replaceCtor(SoundPlayer, 'net.sf.freecol.common.option.AudioMixerOption,net.sf.freecol.common.option.PercentageOption', function (this: any, mixerOption: any, volumeOption: any) {
    this.defaultPlayList = new ArrayList();
    this.setMixer(mixerOption.getValue$());
    mixerOption.addPropertyChangeListener$PropertyChangeListener((e: any) => this.setMixer(e.getNewValue()));
    this.setVolume(volumeOption.getValue$());
    this.volumeOption = volumeOption;
    this.$id = nextId++;
    this.$queue = [];
    this.$playing = false;
    volumeOption.addPropertyChangeListener$PropertyChangeListener((e: any) => {
      this.setVolume(e.getNewValue());
      sound.volume(this.$id, this.getVolume());
    });
    players.set(this.$id, this);
    return this;
  });
  P.playOnce = function (this: any, file: any) {
    if (this.getMixer() == null) return false;
    this.$queue.push(file);
    pump(this);
    return true;
  };
  P.setDefaultPlaylist = function (this: any, ...files: any[]) {
    const list = new ArrayList();
    for (const f of files.length === 1 && Array.isArray(files[0]) ? files[0] : files) list.add(f);
    this.defaultPlayList = list;
    pump(this);
  };
  // stopPlaying: the queue is emptied and the file playing ends (the default playlist goes on, as the original's
  // thread goes on to it)
  P.stop = function (this: any) {
    this.$queue.length = 0;
    if (this.$playing) sound.stop(this.$id);
  };
}
