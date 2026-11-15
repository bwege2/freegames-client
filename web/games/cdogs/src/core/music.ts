// C-Dogs SDL 2.5.0, translated: the music player (music.c). The general tracks of a kind are kept in the order
// the data directory lists them; MusicPlayGeneral shuffles them with rand() until another track is first, so the
// music takes part in the game's random numbers. Play() returns true without playing while the player is not
// initialised: SoundInitialize clears it after SoundReopen, and only the SDL_AUDIODEVICEADDED event that SDL sends
// for every device on the first event poll (events.c) initialises it again. The oracle never polls events, so its
// music is never initialised (musicPlayer.initialised = false in the tests). A campaign's custom songs
// (MusicPlayFromChunk) are empty for every shipped campaign, so those screens are silent.
// GPL-2.0-or-later / BSD-2-Clause (web/games/cdogs/LICENSE.md).
import { CArrayShuffle } from './base.ts';

export const MUSIC_MENU = 0;
export const MUSIC_BRIEFING = 1;
export const MUSIC_GAME = 2;
export const MUSIC_END = 3;
export const MUSIC_LOSE = 4;
export const MUSIC_VICTORY = 5;
export const MUSIC_TYPE_DIRS = ['menu', 'briefing', 'game', 'end', 'lose', 'victory'];
const MUSIC_EXTS = ['.it', '.IT', '.mod', '.MOD', '.ogg', '.OGG', '.s3m', '.S3M', '.xm', '.XM'];

/** what plays: the path of a general track below the data directory, or null */
export const musicPlayer = {
  generalTracks: [[], [], [], [], [], []] as string[][],
  current: null as string | null,
  initialised: true,
  /** does a file exist below the data directory */
  exists: (_path: string): boolean => false,
  /** the platform plays (or stops, null) */
  onPlay: (_path: string | null): void => {},
};

/** MusicPlayerInit: files: the paths below music/<kind>/ in the directory's order */
export function MusicPlayerInit(list: (dir: string) => string[]): void {
  musicPlayer.generalTracks = MUSIC_TYPE_DIRS.map((d) =>
    list(`music/${d}`).filter((p) => {
      const dot = p.lastIndexOf('.');
      return p.indexOf('/', `music/${d}/`.length) < 0 && dot >= 0 && MUSIC_EXTS.includes(p.slice(dot));
    }));
}
export function MusicStop(): void {
  musicPlayer.current = null;
  musicPlayer.onPlay(null);
}
export function MusicPlayGeneral(type: number): void {
  MusicStop();
  const tracks = musicPlayer.generalTracks[type];
  if (tracks.length === 0) return;
  const general = tracks[0];
  if (tracks.length > 1) {
    while (general === tracks[0]) CArrayShuffle(tracks);
  }
  Play(general);
}
/** songs of the original's missions that are not shipped (no license, LICENSE.md): the original plays them, so no
 * general track is shuffled; the port stays silent */
const UNSHIPPED_SONGS = new Set(['missions/devhell1.xm', 'missions/devhell2.ogg', 'missions/graveintent1.xm']);
function Play(path: string): boolean {
  if (!musicPlayer.initialised) return true;
  if (path.length === 0) return false;
  if (UNSHIPPED_SONGS.has(path)) return true;
  if (!musicPlayer.exists(path)) return false;
  musicPlayer.current = path;
  musicPlayer.onPlay(path);
  return true;
}
function dirname(p: string): string {
  const i = p.lastIndexOf('/');
  return i < 0 ? '' : p.slice(0, i + 1);
}
export function MusicPlayFile(type: number, missionPath: string, music: string | null): void {
  MusicStop();
  let played = false;
  if (music != null && music.length !== 0) {
    played = Play(`${missionPath}/${music}`);
    if (!played) played = Play(dirname(missionPath) + music);
  }
  if (!played) MusicPlayGeneral(type);
}
/** MusicPlayFromChunk with a campaign's custom song: empty for every shipped campaign, so it only stops the music */
export function MusicPlayFromChunk(_type: number): void {
  MusicStop();
}
