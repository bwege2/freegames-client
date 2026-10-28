// What the client asks of its platform: the clock, waiting for input (the original's select()), the
// server connection, files, rooms, sound. The browser provides it (../xpilot.ts) on the SDK; the test
// harness provides it (test/harness.ts) as the client oracle did, a virtual clock in lockstep with the
// recorded server stream.
import type { Display } from '../xlib/xlib.ts';

/** a room as the welcome screen lists it (the meta server's server_info_t, from our room list) */
export interface RoomEntry {
  id: number;
  /** the room's name (the server's host name in the original list) */
  name: string;
  users: number;
  maxUsers: number;
  map: string;
  /** "Name=host" of the players, as the meta server's playlist */
  players: string[];
  /** the room's server options as name = value */
  options: [string, string][];
}

export interface RoomService {
  /** the running rooms; null when the server cannot be reached (the meta server did not answer) */
  list(): Promise<RoomEntry[] | null>;
  /** the maps a new room can play (lib/maps) */
  maps(): Promise<string[]>;
  /** creates a room with the map and options and enters it; false when that failed */
  create(map: string, options: [string, string][]): Promise<boolean>;
  /** enters a running room; false when that failed */
  join(id: number): Promise<boolean>;
}

export interface XpSys {
  /** gettimeofday(): microseconds since the epoch */
  nowUs(): number;
  /** time(): seconds since the epoch */
  time(): number;
  /** localtime(): the hour and minute of a time() in the player's time zone */
  localtime(t: number): { hour: number; min: number };
  /** select() on the X connection and/or the server connection; null timeout waits for ever */
  select(x: boolean, net: boolean, timeoutUs: number | null): Promise<{ x: boolean; net: boolean }>;
  /** sock_readable() on the server connection with a timeout */
  waitNet(timeoutUs: number): Promise<boolean>;
  /** XNextEvent on an empty queue: wait for X input */
  waitX(): Promise<void>;
  /** the server's next message, taken (recv) or looked at (peek); null when none */
  recv(): Uint8Array | null;
  peek(): Uint8Array | null;
  send(data: Uint8Array): void;
  /** the contact stage (Contact_servers with -join): resolves when the server takes us (true) */
  contact(): Promise<boolean>;
  rooms: RoomService | null;
  /** files of the player (xpilotrc): account storage in the browser */
  readFile(name: string): Promise<string | null>;
  writeFile(name: string, text: string): Promise<boolean>;
  /** files of the installation (lib/: textures, shipshapes.txt), loaded before the client starts */
  libFile(path: string): Uint8Array | null;
  /** the X server */
  display: Display;
  pid: number;
  login: string;
  hostname: string;
  /** the client was built with SOUND (the oracle was not) */
  sound: boolean;
  /** the audio device (oalaudio.c): a source plays a file of lib/ with a gain, once or looping */
  playSound(source: number, file: string, gain: number, loop: boolean): void;
  setSoundGain(source: number, gain: number): void;
  stopSound(source: number): void;
  /** exit(): the game ends (back to the website) */
  exit(status: number): void;
  /** printf/warn/error output */
  log(line: string): void;
  /** the text to paste with the middle button when the client owns no selection (the X cut buffer) */
  clipboard?: () => string | null;
  /** Pointer Lock on or off (the original grabs and warps the pointer) */
  pointerControl?: (on: boolean) => void;
  /** told when a frame starts (client.c Handle_start), before anything of it is handled */
  onFrame?: (loops: number) => void;
  /** a frame was read, before it is painted (tests read the ships here; painting forgets them) */
  onFrameEnd?: (loops: number) => void;
}

/** the platform of the running client (set before main) */
export let sys: XpSys = null as unknown as XpSys;

export function setSys(s: XpSys): void {
  sys = s;
}

/** the client's exit(): unwinds main through this error */
export class ClientExit extends Error {
  readonly status: number;
  constructor(status: number) {
    super(`exit(${status})`);
    this.status = status;
  }
}
