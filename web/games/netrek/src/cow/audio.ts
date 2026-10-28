// @ts-nocheck
// COW 3.3.3 audio.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { getdefault } from './defaults.ts';
import { struct_shm_sound, struct_shmid_ds } from './structs.ts';
import { $cast, P, R, S, _exit, execvp, fflush, getpid, getuid, kill, pause, perror, shmat, shmctl, shmget, signal, sprintf, strcpy, vfork } from '../rt/index.ts';
import { IPC_CREAT, IPC_PRIVATE, IPC_RMID, IPC_SET, IPC_STAT, SIGINT, SIGUSR1, SIGUSR2 } from './consts.ts';

let snd_pid: number;
let SoundRet: number;
let shmid: number;
let shared_data: struct_shm_sound | null;

function RetOk(_dummy: number): void {
  SoundRet = 0;
}

function RetErr(_dummy: number): void {
  SoundRet = -1;
}

export function ExitSound(): void {
  kill(snd_pid, SIGINT);
  shmctl(shmid, IPC_RMID, null);
}

export async function InitSound(): Promise<number> {
  let argv = new Array(5).fill(null);
  let shmids = new Int8Array(10);
  let mypid = new Int8Array(10);
  let sound_player = null;
  let argc = 0;
  let pid = 0;
  let shmKey = IPC_PRIVATE;
  let smbuf = new struct_shmid_ds();
  if ((shmid = shmget(shmKey, 4100, IPC_CREAT | 511)) < 0) {
    perror(S("Can't open Sound Shared Memory\n"));
    return -1;
  }
  shmctl(shmid, IPC_STAT, smbuf);
  smbuf.shm_perm.uid = getuid();
  smbuf.shm_perm.mode = 511;
  shmctl(shmid, IPC_SET, smbuf);
  if ((shared_data = $cast(struct_shm_sound, shmat(shmid, null, 0))) === $cast(struct_shm_sound, -1)) {
    perror(S("shm attach failed"));
    return -1;
  }
  SoundRet = 1;
  signal(10, RetOk);
  signal(12, RetErr);
  signal(17, RetErr);
  sprintf(P(shmids), S("%i"), shmid);
  sprintf(P(mypid), S("%i"), getpid());
  if ((pid = vfork()) === 0) {
    if (!(sound_player = getdefault(S("soundplayer")))) {
      sound_player = S("bgsndplay");
    }
    argv[argc++] = sound_player;
    argv[argc++] = P(shmids);
    argv[argc++] = P(mypid);
    argv[argc] = null;
    signal(2, null);
    execvp(sound_player, P(argv));
    perror(sound_player);
    fflush(R.stderr);
    SoundRet = -2;
    _exit(-1);
  }
  if (pid === -1) {
    perror(S("forking"));
    return -1;
  }
  snd_pid = pid;
  if (SoundRet > 0) {
    await pause();
  }
  if (SoundRet) {
    ExitSound();
  }
  return SoundRet;
}

export function StopSound(): void {
  kill(snd_pid, SIGUSR1);
}

export function StartSound(name: Ptr | null): number {
  strcpy(P(shared_data.name), name);
  kill(snd_pid, SIGUSR2);
  return 0;
}

export function SoundPlaying(): number {
  return shared_data.play_sound;
}

export function $init(): void {
  snd_pid = 0;
  SoundRet = -1;
  shmid = 0;
  shared_data = null;
}
