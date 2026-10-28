// view.cpp: a player's view (the camera, its input, weapons, the packets of the tick)
import { G, EDIT_MODE } from './globals.ts';
import { L } from './lglobals.ts';
import { W, figures, stopped, OFUN_CONSTRUCTOR } from './chars.ts';
import { create, object_node, object_to_number_in_list, type game_object } from './objects.ts';
import type { area_controller } from './level.ts';
import { sbar, DM } from './statbar.ts';
import { base, client_number, SCMD_CHAT_KEYPRESS, SCMD_DELETE_CLIENT, SCMD_END_OF_PACKET, SCMD_EXT_KEYPRESS,
  SCMD_EXT_KEYRELEASE, SCMD_KEYPRESS, SCMD_KEYRELEASE, SCMD_RELOAD, SCMD_SET_INPUT, SCMD_SYNC, SCMD_VIEW_RESIZE,
  SCMD_WEAPON_CHANGE } from './net.ts';
import { R } from './imlib/jrand.ts';
import { dprintf } from './imlib/dprint.ts';
import type { event } from './imlib/event.ts';
import { EV_KEY } from './imlib/event.ts';
import { JK_BACKSPACE, JK_CTRL_L, JK_CTRL_R, JK_ENTER, JK_HOME, JK_INSERT, JK_PAGEUP } from './imlib/keys.ts';
import { get_key_binding } from './sdlport/event.ts';
import { DEFINEDP, eval_function, eval_user_function, LString, push_onto_list, symbol_value, type LObj, type LSymbol } from './lisp/lisp.ts';

const SHIFT_DOWN_DEFAULT = 15, SHIFT_RIGHT_DEFAULT = 0;

/** game.cpp's chat console and the demo state (set by the game) */
export const view_hooks = {
  chat: null as { draw_user(s: string): void; put_all(s: string): void } | null,
  demo_playing: (): boolean => false,
  net_reload: (): void => {},
};

let cur_user_name = '';
/** get_login: the name set by set_login, else the login of the machine (the account's name in the port) */
export const login = { name: 'unknown' };
export function get_login(): string { return cur_user_name ? cur_user_name : login.name; }
export function set_login(name: string): void { cur_user_name = name.slice(0, 20); }

export class view {
  keymap = new Uint8Array(512 / 8);
  chat_buf = '';
  name = '';
  suggest = { cx1: 0, cy1: 0, cx2: 0, cy2: 0, shift_down: 0, shift_right: 0, pan_x: 0, pan_y: 0, new_weapon: 0, send_view: 0, send_weapon_change: 0 };
  cx1 = 0;
  cy1 = 0;
  cx2 = 100;
  cy2 = 100;
  shift_down = SHIFT_DOWN_DEFAULT;
  shift_right = SHIFT_RIGHT_DEFAULT;
  god = 0;
  player_number: number;
  _tint = 0;
  _team = 0;
  draw_solid = -1;
  weapons: Int32Array;
  last_weapons: Int32Array;
  current_weapon = 0;
  focus: game_object | null;
  x_suggestion = 0;
  y_suggestion = 0;
  b1_suggestion = 0;
  b2_suggestion = 0;
  b3_suggestion = 0;
  b4_suggestion = 0;
  pointer_x = 0;
  pointer_y = 0;
  freeze_time = 0;
  ambient = 32;
  pan_x = 0;
  pan_y = 0;
  no_xleft = 0;
  no_xright = 0;
  no_ytop = 0;
  no_ybottom = 0;
  last_x: number;
  last_y: number;
  last_last_x: number;
  last_last_y: number;
  view_percent = 0;
  last_left = 0;
  last_right = 0;
  last_up = 0;
  last_down = 0;
  last_b1 = 0;
  last_b2 = 0;
  last_b3 = 0;
  last_b4 = 0;
  last_hp = -1;
  last_ammo = -1;
  last_type = 0;
  secrets = 0;
  kills = 0;
  tsecrets = 0;
  tkills = 0;
  next: view | null;

  constructor(Focus: game_object | null, Next: view | null, number: number) {
    if (Focus) {
      this.last_x = Focus.x;
      this.last_y = Focus.y;
    } else this.last_x = this.last_y = 0;
    this.last_last_x = this.last_x;
    this.last_last_y = this.last_y;
    this.name = get_login();
    this.player_number = number;
    this.focus = Focus;
    this.next = Next;
    this.weapons = new Int32Array(W.total_weapons).fill(-1);
    this.last_weapons = new Int32Array(W.total_weapons).fill(-1);
    if (W.total_weapons) this.weapons[0] = 0;
    if (this.local_player()) sbar.associate(this);
    this.set_tint(number);
    this.set_team(-1);
    sbar.need_refresh();
  }

  /** ~view */
  destroy(): void {
    if (this.local_player()) sbar.associate(null);
  }

  key_down(key: number): number { return this.keymap[key >> 3] & (1 << (key & 7)); }
  set_key_down(key: number, x: number): void {
    if (x) this.keymap[key >> 3] |= 1 << (key & 7);
    else this.keymap[key >> 3] &= ~(1 << (key & 7));
  }
  reset_keymap(): void { this.keymap.fill(0); }
  has_weapon(t: number): number { return this.god || this.weapons[t] !== -1 ? 1 : 0; }
  view_changed(): number { return this.suggest.send_view; }
  weapon_changed(): number { return this.suggest.send_weapon_change; }
  receive_failed(): boolean { return this.focus === null; }

  add_ammo(weapon_type: number, total: number): void {
    if (weapon_type >= W.total_weapons || weapon_type < 0) {
      dprintf('weapon out of range\n');
      return;
    }
    if (this.weapons[weapon_type] === -1) return;
    this.weapons[weapon_type] += total;
    if (this.weapons[weapon_type] < 0) this.weapons[weapon_type] = 0;
    if (this.weapons[weapon_type] > 999) this.weapons[weapon_type] = 999;
    if (this.weapon_total(this.current_weapon) === 0 && this.current_weapon) {
      this.suggest.send_weapon_change = 1;
      const stp = symbol_value(L.l_switch_to_powerful);
      if (DEFINEDP(stp) && stp) {
        let x = W.total_weapons - 1;
        while (x > 0 && (x === 3 || this.weapons[x] <= 0)) x--;
        this.suggest.new_weapon = x;
      } else this.suggest.new_weapon = 0;
    }
  }

  give_weapon(type: number): void {
    if (type >= W.total_weapons || type < 0) {
      dprintf('weapon out of range\n');
      return;
    }
    if (this.weapons[type] === -1) {
      this.weapons[type] = 0;
      sbar.need_refresh();
    }
  }

  weapon_total(type: number): number {
    if (type >= W.total_weapons || type < 0) {
      dprintf('weapon out of range\n');
      return 0;
    }
    if (this.god) return 100;
    if (this.weapons[type] === -1) return 0;
    return this.weapons[type];
  }

  xoff(): number {
    if (this.focus) {
      const x = (this.last_x - (((this.cx2 - this.cx1 + 1) / 2) | 0) + this.shift_right + this.pan_x) | 0;
      return x < 0 ? 0 : x;
    }
    return this.pan_x;
  }
  interpolated_xoff(): number {
    if (this.focus) {
      const x = ((((this.last_last_x + this.last_x) / 2) | 0) - (((this.cx2 - this.cx1 + 1) / 2) | 0) + this.shift_right + this.pan_x) | 0;
      return x < 0 ? 0 : x;
    }
    return this.pan_x;
  }
  yoff(): number {
    if (this.focus) {
      const y = (this.last_y - (((this.cy2 - this.cy1 + 1) / 2) | 0) - this.shift_down + this.pan_y) | 0;
      return y < 0 ? 0 : y;
    }
    return this.pan_y;
  }
  interpolated_yoff(): number {
    if (this.focus) {
      const y = ((((this.last_y + this.last_last_y) / 2) | 0) - (((this.cy2 - this.cy1 + 1) / 2) | 0) - this.shift_down + this.pan_y) | 0;
      return y < 0 ? 0 : y;
    }
    return this.pan_y;
  }

  update_scroll(): void {
    const f = this.focus;
    if (f) {
      this.last_last_x = this.last_x;
      this.last_last_y = this.last_y;
      if (f.x > this.last_x) {
        if (f.x - this.last_x >= this.no_xright) this.last_x = f.x - this.no_xright;
      } else if (f.x < this.last_x) {
        if (this.last_x - f.x >= this.no_xleft) this.last_x = f.x + this.no_xleft;
      }
      if (f.y > this.last_y) {
        if (f.y - this.last_y >= this.no_ybottom) this.last_y = f.y - this.no_ybottom;
      } else if (f.y < this.last_y) {
        if (this.last_y - f.y >= this.no_ytop) this.last_y = f.y + this.no_ytop;
      }
    }
  }

  x_center(): number { return !this.focus ? ((this.cx1 + this.cx2) / 2) | 0 : this.focus.x; }
  y_center(): number { return !this.focus ? ((this.cy1 + this.cy2) / 2) | 0 : this.focus.y; }

  draw_character_damage(): void {
    if (this.focus && this.drawable()) {
      if (this.last_hp !== this.focus.hp()) this.draw_hp();
      for (let i = 0; i < W.total_weapons; i++)
        if (this.weapons[i] !== this.last_weapons[i]) {
          this.last_weapons[i] = this.weapons[i];
          sbar.draw_ammo(G.screen, i, this.weapons[i], this.current_weapon === i ? 1 : 0);
        }
    }
  }

  /** get_input: the local player's input of this tick, as packet commands */
  get_input(): void {
    let sug_px: number, sug_py: number;
    const [sug_x, sug_y, sug_b1v, sug_b2v, sug_b3, sug_b4] = get_movement(0);
    let sug_b1 = sug_b1v, sug_b2 = sug_b2v;
    if (this.focus) {
      [sug_px, sug_py] = G.the_game.mouse_to_game(DM.last_demo_mx, DM.last_demo_my, this);
      if (DM.last_demo_mbut & 1) sug_b2 = 1;
      if (DM.last_demo_mbut & 2) sug_b1 = 1;
    } else sug_px = sug_py = 0;
    const p = base.packet;
    if (this.view_changed()) {
      p.write_uint8(SCMD_VIEW_RESIZE);
      p.write_uint8(this.player_number);
      p.write_uint32(this.suggest.cx1);
      p.write_uint32(this.suggest.cy1);
      p.write_uint32(this.suggest.cx2);
      p.write_uint32(this.suggest.cy2);
      p.write_uint32(this.suggest.pan_x);
      p.write_uint32(this.suggest.pan_y);
      p.write_uint32(this.suggest.shift_down);
      p.write_uint32(this.suggest.shift_right);
    }
    if (this.weapon_changed()) {
      p.write_uint8(SCMD_WEAPON_CHANGE);
      p.write_uint8(this.player_number);
      p.write_uint32(this.suggest.new_weapon);
    }
    p.write_uint8(SCMD_SET_INPUT);
    p.write_uint8(this.player_number);
    let mflags = 0;
    if (sug_x > 0) mflags |= 1;
    else if (sug_x < 0) mflags |= 2;
    if (sug_y > 0) mflags |= 4;
    else if (sug_y < 0) mflags |= 8;
    if (sug_b1) mflags |= 16;
    if (sug_b2) mflags |= 32;
    if (sug_b3) mflags |= 64;
    if (sug_b4) mflags |= 128;
    p.write_uint8(mflags);
    p.write_uint16(sug_px & 0xffff);
    p.write_uint16(sug_py & 0xffff);
  }

  add_chat_key(key: number): void {
    const len = this.chat_buf.length;
    if (key === JK_BACKSPACE) {
      if (len) {
        this.chat_buf = this.chat_buf.slice(0, -1);
        if (this.local_player() && view_hooks.chat) view_hooks.chat.draw_user(this.chat_buf);
      }
    } else if (key !== JK_ENTER) {
      this.chat_buf += String.fromCharCode(key & 0xff);
      if (this.local_player() && view_hooks.chat) view_hooks.chat.draw_user(this.chat_buf);
    }
    if (len > 38 || key === JK_ENTER) {
      const ci = L.l_chat_input as unknown as { function: LObj };
      if (DEFINEDP(ci.function)) {
        const o = L.current_object;
        L.current_object = this.focus!;
        const list = { v: null as LObj };
        push_onto_list(new LString(this.chat_buf), list);
        eval_function(L.l_chat_input, list.v);
        L.current_object = o;
      } else if (view_hooks.chat) view_hooks.chat.put_all(this.chat_buf);
      this.chat_buf = '';
      if (this.local_player() && view_hooks.chat) view_hooks.chat.draw_user(this.chat_buf);
    }
  }

  /** process_input(cmd, pk): reads the command's data at pk.i */
  process_input(cmd: number, pk: { d: Uint8Array; i: number }): number {
    const d = pk.d;
    const u32 = (): number => {
      const v = d[pk.i] | (d[pk.i + 1] << 8) | (d[pk.i + 2] << 16) | (d[pk.i + 3] << 24);
      pk.i += 4;
      return v;
    };
    switch (cmd) {
      case SCMD_CHAT_KEYPRESS:
        this.add_chat_key(d[pk.i++]);
        break;
      case SCMD_VIEW_RESIZE:
        this.cx1 = u32();
        this.cy1 = u32();
        this.cx2 = u32();
        this.cy2 = u32();
        this.pan_x = u32();
        this.pan_y = u32();
        this.shift_down = u32();
        this.shift_right = u32();
        this.suggest.send_view = 0;
        if (this.local_player()) G.the_game.draw();
        return 1;
      case SCMD_WEAPON_CHANGE:
        this.current_weapon = u32();
        if (this.local_player()) sbar.need_refresh();
        this.suggest.send_weapon_change = 0;
        return 1;
      case SCMD_SET_INPUT: {
        const x = d[pk.i++];
        this.x_suggestion = x & 1 ? 1 : x & 2 ? -1 : 0;
        this.y_suggestion = x & 4 ? 1 : x & 8 ? -1 : 0;
        this.b1_suggestion = x & 16 ? 1 : 0;
        this.b2_suggestion = x & 32 ? 1 : 0;
        this.b3_suggestion = x & 64 ? 1 : 0;
        this.b4_suggestion = x & 128 ? 1 : 0;
        this.pointer_x = ((d[pk.i] | (d[pk.i + 1] << 8)) << 16) >> 16;
        this.pointer_y = ((d[pk.i + 2] | (d[pk.i + 3] << 8)) << 16) >> 16;
        pk.i += 4;
        return 1;
      }
      case SCMD_KEYPRESS: this.set_key_down(d[pk.i++], 1); break;
      case SCMD_EXT_KEYPRESS: this.set_key_down(d[pk.i++] + 256, 1); break;
      case SCMD_KEYRELEASE: this.set_key_down(d[pk.i++], 0); break;
      case SCMD_EXT_KEYRELEASE: this.set_key_down(d[pk.i++] + 256, 0); break;
    }
    return 1;
  }

  local_player(): number { return this.player_number === client_number() ? 1 : 0; }

  next_weapon(): void {
    let c = this.current_weapon;
    while (c < W.total_weapons - 1) {
      c++;
      if (this.weapon_total(c) > 0) {
        this.suggest.send_weapon_change = 1;
        this.suggest.new_weapon = c;
        return;
      }
    }
    c = 0;
    while (c !== this.current_weapon) {
      if (this.weapon_total(c) > 0) {
        this.suggest.send_weapon_change = 1;
        this.suggest.new_weapon = c;
        return;
      }
      c++;
    }
  }

  last_weapon(): void {
    let c = this.current_weapon;
    while (c >= 1) {
      c--;
      if (this.weapon_total(c) > 0 || c === 0) {
        this.suggest.send_weapon_change = 1;
        this.suggest.new_weapon = c;
        return;
      }
    }
    c = W.total_weapons - 1;
    while (c !== this.current_weapon) {
      if (this.weapon_total(c) > 0 || c === 0) {
        this.suggest.send_weapon_change = 1;
        this.suggest.new_weapon = c;
        return;
      }
      c--;
    }
  }

  handle_event(ev: event): number {
    if (ev.type === EV_KEY) {
      if (ev.key === 44) {
        if (W.total_weapons) this.last_weapon();
        return 1;
      } else if (ev.key === 46) {
        if (W.total_weapons) this.next_weapon();
        return 1;
      } else if (ev.key === get_key_binding('b3')) {
        if (W.total_weapons) this.last_weapon();
        return 1;
      } else if (ev.key === get_key_binding('b4')) {
        if (W.total_weapons) this.next_weapon();
        return 1;
      }
      switch (ev.key) {
        case 49: case 50: case 51: case 52: case 53: case 54: case 55:
          if ((G.dev & EDIT_MODE) === 0 && this.weapon_total(ev.key - 49) > 0) {
            this.suggest.send_weapon_change = 1;
            this.suggest.new_weapon = ev.key - 49;
          }
          break;
        case JK_HOME:
        case JK_CTRL_L:
        case JK_CTRL_R:
          if (W.total_weapons) this.last_weapon();
          return 1;
        case JK_PAGEUP:
        case JK_INSERT:
          if (W.total_weapons) this.next_weapon();
          return 1;
      }
    }
    return 0;
  }

  draw_hp(): void {
    if (this.focus) {
      this.last_hp = this.focus.hp();
      sbar.draw_health(G.screen, this.focus.hp());
    } else sbar.draw_health(G.screen, 0);
  }

  drawable(): number { return this.local_player(); }

  resize_view(Cx1: number, Cy1: number, Cx2: number, Cy2: number): void {
    if (this.cx1 !== Cx1 || this.cx2 !== Cx2 || this.cy1 !== Cy1 || this.cy2 !== Cy2) {
      this.cx1 = Cx1;
      this.cy1 = Cy1;
      this.cx2 = Cx2;
      this.cy2 = Cy2;
      if (G.the_game.playing_state(G.the_game.state) && this.local_player()) G.the_game.draw(0);
    }
  }

  set_input(cx: number, cy: number, b1: number, b2: number, b3: number, b4: number, px: number, py: number): void {
    this.x_suggestion = cx;
    this.y_suggestion = cy;
    this.b1_suggestion = b1;
    this.b2_suggestion = b2;
    this.b3_suggestion = b3;
    this.b4_suggestion = b4;
    this.pointer_x = px;
    this.pointer_y = py;
  }

  reset_player(): void {
    const focus = this.focus;
    if (focus) {
      const start = G.current_level ? G.current_level.get_random_start(320, focus.controller()) : null;
      focus.defaults();
      if (start) {
        focus.x = start.x;
        focus.y = start.y;
        dprintf(`reset player position to ${start.x} ${start.y}\n`);
      }
      focus.set_state(stopped);
      focus.set_tint(this._tint);
      focus.set_team(this._team);
      this.weapons.fill(-1);
      this.last_weapons.fill(-1);
      this.shift_down = SHIFT_DOWN_DEFAULT;
      this.shift_right = SHIFT_RIGHT_DEFAULT;
      if (W.total_weapons) this.weapons[0] = 0;
      this.current_weapon = 0;
      focus.lvars?.fill(0, 0, figures[focus.otype].tv);
      focus.set_aistate(0);
      const c = figures[focus.otype].get_fun(OFUN_CONSTRUCTOR);
      if (c) {
        const o = L.current_object;
        L.current_object = focus;
        eval_user_function(c as LSymbol, null);
        L.current_object = o;
      }
      sbar.redraw(G.screen);
      for (let i = 0; i < focus.total_objects(); i++) {
        const o = focus.get_object(i);
        o.lvars?.fill(0, 0, figures[o.otype].tv);
      }
    }
  }

  get_view_var_value(num: number): number {
    switch (num) {
      case 0: return this.cx1;
      case 1: return this.cy1;
      case 2: return this.cx2;
      case 3: return this.cy2;
      case 4: return this.shift_down;
      case 5: return this.shift_right;
      case 6: return this.god;
      case 7: return this.player_number;
      case 8: return this.draw_solid;
      case 10: return this.current_weapon;
      case 11: return this.x_suggestion;
      case 12: return this.y_suggestion;
      case 13: return this.b1_suggestion;
      case 14: return this.b2_suggestion;
      case 15: return this.b3_suggestion;
      case 16: return this.b4_suggestion;
      case 17: return this.pan_x;
      case 18: return this.pan_y;
      case 19: return this.no_xleft;
      case 20: return this.no_xright;
      case 21: return this.no_ytop;
      case 22: return this.no_ybottom;
      case 23: return this.last_x;
      case 24: return this.last_y;
      case 25: return this.last_left;
      case 26: return this.last_right;
      case 27: return this.last_up;
      case 28: return this.last_down;
      case 29: return this.last_b1;
      case 30: return this.last_b2;
      case 31: return this.last_b3;
      case 32: return this.last_b4;
      case 33: return this.last_hp;
      case 34: return this.secrets;
      case 35: return this.kills;
      case 36: return this.tsecrets;
      case 37: return this.tkills;
      case 38: return this.ambient;
      case 39: return this.pointer_x;
      case 40: return this.pointer_y;
      case 41: return this.last_last_x;
      case 42: return this.last_last_y;
      case 43: return this.freeze_time;
    }
    return 0;
  }

  set_view_var_value(num: number, x: number): number {
    switch (num) {
      case 0: this.cx1 = x; break;
      case 1: this.cy1 = x; break;
      case 2: this.cx2 = x; break;
      case 3: this.cy2 = x; break;
      case 4: this.shift_down = x; break;
      case 5: this.shift_right = x; break;
      case 6: this.god = x; break;
      case 7:
        this.player_number = x;
        if (this.local_player()) sbar.associate(this);
        break;
      case 8: this.draw_solid = x; break;
      case 10:
        this.current_weapon = x;
        sbar.need_refresh();
        break;
      case 11: this.x_suggestion = x; break;
      case 12: this.y_suggestion = x; break;
      case 13: this.b1_suggestion = x; break;
      case 14: this.b2_suggestion = x; break;
      case 15: this.b3_suggestion = x; break;
      case 16: this.b4_suggestion = x; break;
      case 17: this.pan_x = x; break;
      case 18: this.pan_y = x; break;
      case 19: this.no_xleft = x; break;
      case 20: this.no_xright = x; break;
      case 21: this.no_ytop = x; break;
      case 22: this.no_ybottom = x; break;
      case 23: this.last_x = x; break;
      case 24: this.last_y = x; break;
      case 25: this.last_left = x; break;
      case 26: this.last_right = x; break;
      case 27: this.last_up = x; break;
      case 28: this.last_down = x; break;
      case 29: this.last_b1 = x; break;
      case 30: this.last_b2 = x; break;
      case 31: this.last_b3 = x; break;
      case 32: this.last_b4 = x; break;
      case 33: this.last_hp = x; break;
      case 34: this.secrets = x; break;
      case 35: this.kills = x; break;
      case 36: this.tsecrets = x; break;
      case 37: this.tkills = x; break;
      case 38: this.ambient = (x << 16) >> 16; break;
      case 39: this.pointer_x = x; break;
      case 40: this.pointer_y = x; break;
      case 41: this.last_last_x = x; break;
      case 42: this.last_last_y = x; break;
      case 43: this.freeze_time = x; break;
    }
    return 1;
  }

  configure_for_area(a: area_controller): void {
    if (a.ambient >= 0 && a.ambient !== this.ambient) {
      if (this.ambient > a.ambient) {
        this.ambient = ((this.ambient - a.ambient_speed) << 16) >> 16;
        if (this.ambient < a.ambient) this.ambient = a.ambient;
      } else {
        this.ambient = ((this.ambient + a.ambient_speed) << 16) >> 16;
        if (this.ambient > a.ambient) this.ambient = a.ambient;
      }
    }
    if (!G.view_shift_disabled) {
      if (a.view_xoff !== this.pan_x) {
        if (this.pan_x > a.view_xoff) {
          this.pan_x -= a.view_xoff_speed;
          if (this.pan_x < a.view_xoff) this.pan_x = a.view_xoff;
        } else {
          this.pan_x += a.view_xoff_speed;
          if (this.pan_x > a.view_xoff) this.pan_x = a.view_xoff;
        }
      }
      if (a.view_yoff !== this.pan_y) {
        if (this.pan_y > a.view_yoff) {
          this.pan_y -= a.view_yoff_speed;
          if (this.pan_y < a.view_yoff) this.pan_y = a.view_yoff;
        } else {
          this.pan_y += a.view_yoff_speed;
          if (this.pan_y > a.view_yoff) this.pan_y = a.view_yoff;
        }
      }
    }
  }

  set_tint(tint: number): void {
    if (tint < 0) tint = 0;
    this._tint = tint;
    this.focus!.set_tint(tint);
  }
  get_tint(): number { return this._tint; }
  set_team(team: number): void {
    if (team < 0) team = 0;
    this._team = team;
    this.focus!.set_team(team);
  }
  get_team(): number { return this._team; }
}

// ------------------------------------------------------------------ configuration.cpp
/** key bindings of player 0 (get_key_bindings) */
const key_map = { left: 0, right: 0, up: 0, down: 0, b1: 0, b2: 0, b3: 0, b4: 0 };
export function get_key_bindings(): void {
  key_map.left = get_key_binding('left');
  key_map.right = get_key_binding('right');
  key_map.up = get_key_binding('up');
  key_map.down = get_key_binding('down');
  key_map.b4 = get_key_binding('b4');
  key_map.b3 = get_key_binding('b3');
  key_map.b2 = get_key_binding('b2');
  key_map.b1 = get_key_binding('b1');
}

/** get_movement(player): [x, y, b1, b2, b3, b4] from the keys held down */
export function get_movement(_player: number): [number, number, number, number, number, number] {
  const p = (k: number): number => G.the_game.key_down(k);
  const x = p(key_map.left) ? -1 : p(key_map.right) ? 1 : 0;
  const y = p(key_map.up) ? -1 : p(key_map.down) ? 1 : 0;
  return [x, y, p(key_map.b1) ? 1 : 0, p(key_map.b2) ? 1 : 0, p(key_map.b3) ? 1 : 0, p(key_map.b4) ? 1 : 0];
}

// ------------------------------------------------------------------ the list of views
export function make_sync(): number {
  let x = 0;
  if (!G.current_level) return 0;
  for (let f = L.player_list; f; f = f.next) {
    if (f.focus) {
      x ^= f.focus.x & 0xffff;
      x ^= f.focus.y & 0xffff;
    }
  }
  x ^= R.rand_on;
  return x & 0xffff;
}

export function recalc_local_view_space(): void {
  if (G.screen) {
    const t = total_local_players();
    if (!t) return;
    const Xres = G.xres, Yres = G.yres;
    const h = (Yres / t) | 0;
    let w = ((h * 320) / 200) | 0;
    let y = 5;
    if (w < 300) w = 300;
    for (let f = L.player_list; f; f = f.next) {
      if (f.local_player()) {
        f.suggest.cx1 = ((Xres / 2) | 0) - ((w / 2) | 0);
        f.suggest.cx2 = ((Xres / 2) | 0) + ((w / 2) | 0);
        if (f.suggest.cx1 < 2) f.suggest.cx1 = 2;
        if (f.suggest.cx2 > Xres - 2) f.suggest.cx2 = Xres - 2;
        f.suggest.cy1 = y;
        f.suggest.cy2 = h - (W.total_weapons ? 33 : 0);
        f.suggest.shift_down = f.shift_down;
        f.suggest.shift_right = f.shift_right;
        f.suggest.pan_x = f.pan_x;
        f.suggest.pan_y = f.pan_y;
        f.suggest.send_view = 1;
        if (!L.player_list!.next) {
          f.cx1 = f.suggest.cx1;
          f.cy1 = f.suggest.cy1;
          f.cx2 = f.suggest.cx2;
          f.cy2 = f.suggest.cy2;
          f.suggest.send_view = 0;
        }
        y += h;
      }
    }
  }
}

export function set_local_players(total: number): void {
  let rdw = 0;
  if (total < 1) return;
  let last: view | null = null;
  for (let f = L.player_list; f; f = f.next) {
    if (total && f.local_player()) total--;
    else if (!total && f.local_player()) {
      let n = last!.next;
      while (n && !n.local_player()) n = n.next;
      if (last) last.next = n;
      else if (n) L.player_list = n;
      last = f;
      rdw = 1;
    }
  }
  while (total) {
    const o = create(L.current_start_type, 50, 50);
    let v: view;
    if (!L.player_list) {
      L.player_list = new view(o, null, 0);
      v = L.player_list;
    } else {
      let f = L.player_list;
      for (; f && f.next; f = f.next);
      f.next = new view(o, null, f.player_number + 1);
      v = f.next;
    }
    v.cx1 = 160 - 155;
    v.cy1 = 100 - 95;
    v.cx2 = 160 + 155;
    v.cy2 = 100 + (W.total_weapons ? 60 : 95);
    v.focus!.set_controller(v);
    total--;
    rdw = 1;
  }
  if (rdw) recalc_local_view_space();
}

export function total_local_players(): number {
  let t = 0;
  for (let f = L.player_list; f; f = f.next) if (f.local_player()) t++;
  return t;
}

export function make_player_onodes(player_num = -1): object_node | null {
  let first: object_node | null = null, last: object_node | null = null;
  for (let o = L.player_list; o; o = o.next) {
    if (o.focus && (player_num === -1 || o.player_number === player_num)) {
      if (!object_to_number_in_list(o.focus, first)) {
        const q = new object_node(o.focus, null);
        if (first) last!.next = q;
        else first = q;
        last = q;
      }
      for (let i = 0; i < o.focus.total_objects(); i++) {
        const p = o.focus.get_object(i);
        if (!object_to_number_in_list(p, first)) {
          const q = new object_node(p, null);
          if (first) last!.next = q;
          else first = q;
          last = q;
        }
      }
    }
  }
  return first;
}

const vv_names = ['view.cx1', 'view.cy1', 'view.cx2', 'view.cy2', 'view.shift_down', 'view.shift_right', 'view.god',
  'view.player_number', 'view.draw_solid', 'view.lives', 'view.current_weapon', 'view.x_suggestion',
  'view.y_suggestion', 'view.b1_suggestion', 'view.b2_suggestion', 'view.b3_suggestion', 'view.b4_suggestion',
  'view.pan_x', 'view.pan_y', 'view.no_xleft', 'view.no_xright', 'view.no_ytop', 'view.no_ybottom', 'view.last_x',
  'view.last_y', 'view.last_left', 'view.last_right', 'view.last_up', 'view.last_down', 'view.last_b1', 'view.last_b2',
  'view.last_b3', 'view.last_b4', 'view.last_hp', 'view.secrets', 'view.kills', 'view.tsecrets', 'view.tkills',
  'view.ambient', 'view.pointer_x', 'view.pointer_y', 'view.last_last_x', 'view.last_last_y', 'view.freeze_time'];
export function total_view_vars(): number { return vv_names.length; }
export function get_view_var_name(num: number): string { return vv_names[num]; }

/** process_packet_commands(pk, size) */
export function process_packet_commands(data: Uint8Array, size: number): void {
  let sync_uint16 = -1;
  if (!size) return;
  const d = new Uint8Array(size + 1);
  d.set(data.subarray(0, size));
  d[size] = SCMD_END_OF_PACKET;
  const pk = { d, i: 0 };
  let already_reloaded = 0;
  let cmd: number;
  do {
    cmd = d[pk.i++];
    switch (cmd) {
      case SCMD_WEAPON_CHANGE: case SCMD_SET_INPUT: case SCMD_VIEW_RESIZE: case SCMD_KEYPRESS: case SCMD_KEYRELEASE:
      case SCMD_EXT_KEYPRESS: case SCMD_EXT_KEYRELEASE: case SCMD_CHAT_KEYPRESS: {
        const player_num = d[pk.i++];
        let v = L.player_list;
        for (; v && v.player_number !== player_num; v = v.next);
        if (v) v.process_input(cmd, pk);
        else {
          dprintf('Evil error : bad player number in packet\n');
          return;
        }
        break;
      }
      case SCMD_RELOAD:
        if (!already_reloaded) {
          view_hooks.net_reload();
          already_reloaded = 1;
        }
        break;
      case SCMD_SYNC: {
        const x = d[pk.i] | (d[pk.i + 1] << 8);
        pk.i += 2;
        if (view_hooks.demo_playing()) sync_uint16 = make_sync();
        if (sync_uint16 === -1) sync_uint16 = x;
        else if (x !== sync_uint16 && !already_reloaded) {
          dprintf(`out of sync ${G.current_level.tick_counter()} (packet=${x}, calced=${sync_uint16})\n`);
          if (!view_hooks.demo_playing()) view_hooks.net_reload();
          already_reloaded = 1;
        }
        break;
      }
      case SCMD_DELETE_CLIENT: {
        const player_num = d[pk.i++];
        let v = L.player_list, last: view | null = null;
        for (; v && v.player_number !== player_num; v = v.next) last = v;
        if (!v) dprintf('evil : delete client, but no such client\n');
        else {
          let on = make_player_onodes(player_num);
          while (on) {
            G.current_level.delete_object(on.me);
            on = on.next;
          }
          v.focus = null;
          if (last) last.next = v.next;
          else L.player_list = L.player_list!.next;
          v.destroy();
        }
        break;
      }
      default:
        dprintf(`Unknown net command ${cmd}\n`);
    }
  } while (cmd !== SCMD_END_OF_PACKET);
}
