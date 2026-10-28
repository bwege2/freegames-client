// demo.cpp: recording and playing demos (the main menu plays levels/demo*.dat after 10 seconds), and
// the input layer every part of the game reads events through (get_event)
import { G, EDIT_MODE } from './globals.ts';
import { L } from './lglobals.ts';
import { DM } from './statbar.ts';
import { base, INPUT_PROCESSING, SCMD_SYNC } from './net.ts';
import { event, EV_KEY } from './imlib/event.ts';
import { JK_ENTER } from './imlib/keys.ts';
import { open_file, latin1, type bFILE } from './imlib/specs.ts';
import { DEFINEDP, symbol_value, type LSymbol } from './lisp/lisp.ts';
import { R } from './imlib/jrand.ts';
import { make_sync, process_packet_commands } from './view.ts';

export const MENU_STATE_ = 6, RUN_STATE_ = 0;
export const ID_NULL = 0;

export class demo_manager {
  static readonly NORMAL = 0;
  static readonly RECORDING = 1;
  static readonly PLAYING = 2;
  initial_difficulty: LSymbol | null = null;
  record_file: bFILE | null = null;
  skip_next = 0;
  state = demo_manager.NORMAL;

  current_state(): number { return this.state; }

  start_recording(filename: string): number {
    if (!G.current_level) return 0;
    const rf = open_file(filename, 'wb');
    if (rf.open_failure()) {
      rf.close();
      return 0;
    }
    this.record_file = rf;
    const name = G.current_level.name();
    G.the_game.load_level(name);
    const sig = 'DEMO,VERSION:2';
    rf.write(Array.from(sig, (c) => c.charCodeAt(0)), 14);
    rf.write_uint8(name.length + 1);
    rf.write([...Array.from(name, (c) => c.charCodeAt(0) & 0xff), 0], name.length + 1);
    const d = symbol_value(L.l_difficulty);
    if (DEFINEDP(d)) {
      if (d === L.l_easy) rf.write_uint8(0);
      else if (d === L.l_medium) rf.write_uint8(1);
      else if (d === L.l_hard) rf.write_uint8(2);
      else rf.write_uint8(3);
    } else rf.write_uint8(3);
    this.state = demo_manager.RECORDING;
    this.reset_game();
    return 1;
  }

  do_inputs(): void {
    switch (this.state) {
      case demo_manager.RECORDING: {
        base.packet.packet_reset();
        for (let p = L.player_list; p; p = p.next) if (p.local_player()) p.get_input();
        base.packet.write_uint8(SCMD_SYNC);
        base.packet.write_uint16(make_sync());
        this.save_packet(base.packet.packet_data(), base.packet.packet_size());
        process_packet_commands(base.packet.packet_data(), base.packet.packet_size());
        break;
      }
      case demo_manager.PLAYING: {
        const pk = this.get_packet();
        if (pk) {
          process_packet_commands(pk, pk.length);
          const pl = L.player_list!;
          const [mx, my] = G.the_game.game_to_mouse(pl.pointer_x, pl.pointer_y, pl);
          G.wm.set_mouse_position(mx, my);
        } else {
          this.set_state(demo_manager.NORMAL);
          return;
        }
        break;
      }
    }
  }

  reset_game(): void {
    if (G.dev & EDIT_MODE) throw new Error('the editor is not ported');
    G.the_game.set_state(RUN_STATE_);
    R.rand_on = 0;
    for (let v = L.player_list; v; v = v.next) if (v.focus) v.reset_player();
    DM.last_demo_mx = DM.last_demo_my = DM.last_demo_mbut = 0;
    G.current_level.set_tick_counter(0);
  }

  start_playing(filename: string): number {
    const rf = open_file(filename, 'rb');
    if (rf.open_failure()) {
      rf.close();
      return 0;
    }
    const sig = rf.read_bytes(14);
    if (sig.length !== 14 || latin1(sig) !== 'DEMO,VERSION:2') {
      rf.close();
      return 0;
    }
    const ns = rf.read_bytes(1);
    if (ns.length !== 1) {
      rf.close();
      return 0;
    }
    const nsize = (ns[0] << 24) >> 24;
    const nameb = rf.read_bytes(Math.max(0, nsize));
    const db = rf.read_bytes(1);
    if (nameb.length !== nsize || db.length !== 1) {
      rf.close();
      return 0;
    }
    const diff = (db[0] << 24) >> 24;
    let tname = latin1(nameb);
    const z = tname.indexOf('\0');
    if (z >= 0) tname = tname.slice(0, z);
    tname = tname.replace(/\\/g, '/');
    const probe = open_file(tname, 'rb');
    if (probe.open_failure()) {
      rf.close();
      probe.close();
      return 0;
    }
    probe.close();
    this.record_file = rf;
    G.the_game.load_level(tname);
    this.initial_difficulty = L.l_difficulty as LSymbol;
    const sym = L.l_difficulty as LSymbol;
    switch (diff) {
      case 0: sym.value = L.l_easy; break;
      case 1: sym.value = L.l_medium; break;
      case 2: sym.value = L.l_hard; break;
      case 3: sym.value = L.l_extreme; break;
    }
    this.state = demo_manager.PLAYING;
    this.reset_game();
    return 1;
  }

  set_state(new_state: number, filename: string | null = null): number {
    if (new_state === this.state) return 1;
    switch (this.state) {
      case demo_manager.RECORDING:
        this.record_file?.close();
        this.record_file = null;
        break;
      case demo_manager.PLAYING: {
        this.record_file?.close();
        this.record_file = null;
        // l_difficulty = initial_difficulty: the same symbol, so the demo's difficulty stays
        L.l_difficulty = this.initial_difficulty;
        G.the_game.set_state(MENU_STATE_);
        G.wm.push_event(event.msg(ID_NULL, null));
        for (let v = L.player_list; v; v = v.next) {
          if (v.focus) {
            v.reset_player();
            v.focus.set_aistate(0);
          }
        }
        if (G.current_level) G.current_level.destroy();
        G.current_level = null as never;
        G.the_game.reset_keymap();
        base.input_state = INPUT_PROCESSING;
        break;
      }
    }
    switch (new_state) {
      case demo_manager.RECORDING: return this.start_recording(filename!);
      case demo_manager.PLAYING: return this.start_playing(filename!);
      case demo_manager.NORMAL: this.state = demo_manager.NORMAL; break;
    }
    return 1;
  }

  save_packet(packet: Uint8Array, packet_size: number): number {
    if (this.state === demo_manager.RECORDING) {
      const rf = this.record_file!;
      rf.write_uint16(packet_size);
      if (rf.write(packet, packet_size) !== packet_size) {
        this.set_state(demo_manager.NORMAL);
        return 0;
      }
      return 1;
    }
    return 0;
  }

  /** get_packet: the next packet, or null at the end (the demo then stops) */
  get_packet(): Uint8Array | null {
    if (this.state === demo_manager.PLAYING) {
      const rf = this.record_file!;
      const b = rf.read_bytes(2);
      if (b.length !== 2) {
        this.set_state(demo_manager.NORMAL);
        return null;
      }
      const ps = b[0] | (b[1] << 8);
      const pk = rf.read_bytes(ps);
      if (pk.length !== ps) {
        this.set_state(demo_manager.NORMAL);
        return null;
      }
      return pk;
    }
    return null;
  }
}

export const demo_man = new demo_manager();

/** demo.cpp get_event: every event of the game goes through here */
export async function get_event(ev: event): Promise<void> {
  await G.wm.get_event(ev);
  if (ev.type === EV_KEY) {
    if (demo_man.state === demo_manager.PLAYING) demo_man.set_state(demo_manager.NORMAL);
    else if (ev.key === JK_ENTER && demo_man.state === demo_manager.RECORDING) {
      demo_man.set_state(demo_manager.NORMAL);
      G.the_game.show_help('Finished recording');
    }
  }
  DM.last_demo_mx = ev.mouse_move.x;
  DM.last_demo_my = ev.mouse_move.y;
  DM.last_demo_mbut = ev.mouse_button;
  G.idle_ticks = 0;
}

export function event_waiting(): number { return G.wm.event_waiting(); }
