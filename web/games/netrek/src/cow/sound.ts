// @ts-nocheck
// COW 3.3.3 sound.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { ExitSound, InitSound, SoundPlaying, StartSound, StopSound } from './audio.ts';
import { getdefault } from './defaults.ts';
import { W_MapWindow, W_UnmapWindow, W_WriteText } from './x11window.ts';
import { struct_Sound, struct_event, struct_stat } from './structs.ts';
import { $cast, $sarrOf, G, P, R, S, fprintf, getenv, memccpy, snprintf, stat, strcat, strcpy, strlen } from '../rt/index.ts';
import { MESSAGE1_SOUND, MESSAGE9_SOUND, MESSAGE_SOUND, NO_SOUND, NUM_SOUNDS, OTHER_SOUND_OFFSET, SOUND_DONE, SOUND_INIT, SOUND_OTHER, SOUND_TOGGLE } from './consts.ts';

let sounds: any;
let sound_prefix: any;
let current_sound: number;
let soundOther: number;

function isDirectory(dir: Ptr | null): number {
  let buf = new struct_stat();
  if (stat(dir, buf) < 0) {
    return 0;
  }
  return (buf.st_mode & 61440) >>> 0 === 16384 ? 1 : 0;
}

export function Exit_Sound(): void {
  if (G.sound_init) {
    ExitSound();
  }
  G.sound_init = 0;
  G.sound_toggle = 0;
}

export async function Init_Sound(): Promise<void> {
  let sd = null;
  let buf = new Int8Array(4096);
  if (G.sound_init) {
    if (!(G.sounddir = getdefault(S("sounddir")))) {
      if (!!(sd = getenv(S("SOUNDDIR")))) {
        G.sounddir = sd;
      } else {
        G.sounddir = S("/usr/share/sounds/netrek-client-cow");
      }
    }
    if (!isDirectory(G.sounddir)) {
      G.sounddir = S("sounds");
      if (!isDirectory(G.sounddir)) {
        fprintf(R.stderr, S("sound directory %s missing\n"), G.sounddir);
        return;
      }
    }
  }
  if (await InitSound() === -1) {
    G.sound_toggle = 0;
    G.sound_init = 0;
  } else {
    G.sound_init = 1;
    G.sound_toggle = 1;
  }
  strcpy(P(sound_prefix), G.sounddir);
  strcat(P(sound_prefix), S("/"));
  if (G.sound_toggle) {
    strcpy(P(buf), G.sounddir);
    strcat(P(buf), S("/nt_intro"));
    StartSound(P(buf));
  }
}

export function Play_Sound(type: number): void {
  let buf = new Int8Array(4096);
  if (type > OTHER_SOUND_OFFSET && !soundOther) {
    return;
  }
  if (G.sound_toggle && sounds[type].flag && (sounds[type].priority >= sounds[current_sound].priority || !SoundPlaying())) {
    memccpy(P(buf), P(sound_prefix), 0, 4096);
    strcat(P(buf), sounds[type].name);
    StartSound(P(buf));
    current_sound = type;
  }
  if (!G.sound_toggle) {
    current_sound = NO_SOUND;
  }
}

export function Abort_Sound(type: number): void {
  if (current_sound !== NO_SOUND && type === current_sound) {
    StopSound();
  }
}

export function sound_window_height(): number {
  return MESSAGE_SOUND + 4;
}

export function soundwindow(): void {
  let i = 0;
  for (i = 0; i <= SOUND_DONE; ++i) {
    soundrefresh(i);
  }
  W_MapWindow(G.soundWin);
}

function soundrefresh(i: number): void {
  let buf = new Int8Array(200);
  let flag = null;
  if (i === SOUND_TOGGLE) {
    snprintf(P(buf), 200, S("Sound is turned %s"), G.sound_toggle === 1 ? S("ON") : S("OFF"));
  } else if (i < SOUND_OTHER) {
    flag = sounds[i].flag === 1 ? S("ON") : S("OFF");
    switch (i) {
    case 1:
      snprintf(P(buf), 200, S("Fire torp sound is %s"), flag);
      break;
    case 2:
      snprintf(P(buf), 200, S("Phaser sound is %s"), flag);
      break;
    case 3:
      snprintf(P(buf), 200, S("Fire plasma sound is %s"), flag);
      break;
    case 4:
      snprintf(P(buf), 200, S("Explosion sound is %s"), flag);
      break;
    case 6:
      snprintf(P(buf), 200, S("Cloak sound is %s"), flag);
      break;
    case 7:
      snprintf(P(buf), 200, S("Uncloak sound is %s"), flag);
      break;
    case 8:
      snprintf(P(buf), 200, S("Shield down  sound is %s"), flag);
      break;
    case 9:
      snprintf(P(buf), 200, S("Shield up sound is %s"), flag);
      break;
    case 10:
      snprintf(P(buf), 200, S("Torp hit sound is %s"), flag);
      break;
    case 11:
      snprintf(P(buf), 200, S("Red alert sound is %s"), flag);
      break;
    case 13:
      snprintf(P(buf), 200, S("Engine sound is not supported"));
      break;
    case 15:
      snprintf(P(buf), 200, S("Enter ship sound is %s"), flag);
      break;
    case 16:
      snprintf(P(buf), 200, S("Self destruct sound is %s"), flag);
      break;
    case 17:
      snprintf(P(buf), 200, S("Plasma hit sound is %s"), flag);
      break;
    case 18:
      snprintf(P(buf), 200, S("Message sound is %s"), flag);
      break;
    }
  } else if (i === SOUND_OTHER) {
    snprintf(P(buf), 200, S("Other ship's sound is %s"), soundOther === 1 ? S("ON") : S("OFF"));
  } else if (i === SOUND_INIT) {
    snprintf(P(buf), 200, G.sound_init ? S("Restart external sound player") : S("Initialize external sound player"));
  } else if (i === SOUND_DONE) {
    snprintf(P(buf), 200, S("Done"));
  } else {
    fprintf(R.stderr, S("Uh oh, bogus refresh number in soundrefresh\n"));
  }
  W_WriteText(G.soundWin, 0, i, G.textColor, P(buf), strlen(P(buf)) | 0, null);
}

export async function soundaction(data: struct_event | null): Promise<void> {
  data = $cast(struct_event, data);
  let i = 0;
  let j = 0;
  i = data.y;
  if (i === SOUND_TOGGLE) {
    if (G.sound_init) {
      G.sound_toggle = G.sound_toggle === 1 ? 0 : 1;
    }
    soundrefresh(SOUND_TOGGLE);
  } else if (i < SOUND_OTHER) {
    sounds[i].flag = sounds[i].flag === 1 ? 0 : 1;
    if (i + OTHER_SOUND_OFFSET <= NUM_SOUNDS) {
      sounds[i + OTHER_SOUND_OFFSET].flag = sounds[i].flag;
    }
    soundrefresh(i);
    Play_Sound(i);
    if (i === MESSAGE_SOUND) {
      for (j = MESSAGE1_SOUND; j <= MESSAGE9_SOUND; ++j) {
        sounds[j].flag = sounds[MESSAGE_SOUND].flag;
      }
    }
  } else if (i === SOUND_OTHER) {
    soundOther = !soundOther ? 1 : 0;
    soundrefresh(SOUND_OTHER);
  } else if (i === SOUND_INIT) {
    Exit_Sound();
    G.sound_init = 1;
    await Init_Sound();
    soundrefresh(SOUND_INIT);
    soundrefresh(SOUND_TOGGLE);
  } else {
    sounddone();
  }
}

export function sounddone(): void {
  W_UnmapWindow(G.soundWin);
  return;
}

export function $init(): void {
  sounds = $sarrOf([struct_Sound.$of(S("")),
struct_Sound.$of(S("nt_fire_torp"), 7, 1),
struct_Sound.$of(S("nt_phaser"), 9, 1),
struct_Sound.$of(S("nt_fire_plasma"), 9, 1),
struct_Sound.$of(S("nt_explosion"), 10, 1),
struct_Sound.$of(S("nt_cloaked"), 7, 1),
struct_Sound.$of(S("nt_uncloak"), 7, 1),
struct_Sound.$of(S("nt_shield_down"), 3, 1),
struct_Sound.$of(S("nt_shield_up"), 3, 1),
struct_Sound.$of(S("nt_torp_hit"), 8, 1),
struct_Sound.$of(S("nt_warning"), 5, 1),
struct_Sound.$of(S("nt_engine")),
struct_Sound.$of(S("nt_enter_ship"), 4, 1),
struct_Sound.$of(S("nt_self_destruct"), 6, 1),
struct_Sound.$of(S("nt_plasma_hit"), 8, 1),
struct_Sound.$of(S("nt_message"), 4, 1),
struct_Sound.$of(S("nt_message1"), 4, 1),
struct_Sound.$of(S("nt_message2"), 4, 1),
struct_Sound.$of(S("nt_message3"), 4, 1),
struct_Sound.$of(S("nt_message4"), 4, 1),
struct_Sound.$of(S("nt_message5"), 4, 1),
struct_Sound.$of(S("nt_message6"), 4, 1),
struct_Sound.$of(S("nt_message7"), 4, 1),
struct_Sound.$of(S("nt_message8"), 4, 1),
struct_Sound.$of(S("nt_message9"), 4, 1),
struct_Sound.$of(S("nt_fire_torp_other"), 3, 1),
struct_Sound.$of(S("nt_phaser_other"), 3, 1),
struct_Sound.$of(S("nt_fire_plasma_other"), 3, 1),
struct_Sound.$of(S("nt_explosion_other"), 10, 1),
new struct_Sound(),
new struct_Sound(),
new struct_Sound(),
new struct_Sound()]);
  sound_prefix = new Int8Array(4096);
  current_sound = NO_SOUND;
  soundOther = 1;
}
