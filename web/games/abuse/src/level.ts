// level.cpp and collide.cpp: a level (maps, objects, lights, areas), its tick, collisions, loading and saving
import { bFILE, jFILE, open_file, SEEK_SET, spec_directory, spec_entry, SPEC_DATA_ARRAY, SPEC_GRUE_BGMAP,
  SPEC_GRUE_FGMAP, SPEC_IMAGE, get_save_filename_prefix } from './imlib/specs.ts';
import { dprintf } from './imlib/dprint.ts';
import { image } from './imlib/image.ts';
import { R, jrandom } from './imlib/jrand.ts';
import { figures, object_names, CFLAG_ADD_FRONT, CFLAG_NEED_CACHE_IN, CFLAG_CACHED_IN, OFUN_GET_CACHE_LIST, MAX_STATE,
  state_names, stopped, dead, dieing, W } from './chars.ts';
import { create, game_object, KNOWN_FLAG, FLAG_JUST_HIT, FLAG_JUST_BLOCKED, object_descriptions, object_node,
  object_to_number_in_list, number_to_object_in_list, RC_8, RC_16, RC_32, RC_type_size, TOTAL_OBJECT_VARS } from './objects.ts';
import { setback_intersect } from './intsect.ts';
import { LG, add_light_spec, delete_all_lights, delete_light, light_source, light_to_number, number_to_light, read_lights,
  write_lights } from './light.ts';
import { delete_panims, tick_panims } from './particle.ts';
import { cache } from './cache.ts';
import { CAR, CDR, DEFINEDP, eval_function, find_or_create, lisp_atan2, LNumber, lnumber_value, NILP,
  push_onto_list, symbol_name, symbol_value, type LObj, type LSymbol } from './lisp/lisp.ts';
import { G, SUSPEND_MODE, MAP_MODE } from './globals.ts';
import { L } from './lglobals.ts';
import { scale_put } from './scaleput.ts';
import { song, S } from './sdlport/sound.ts';
import type { view } from './view.ts';
import { make_player_onodes, total_view_vars, get_view_var_name, view as View, recalc_local_view_space } from './view.ts';
import { NeedInput } from './rt/needinput.ts';

import { platform } from './rt/platform.ts';

export const ASPECT = 4;
export const fgvalue = (y: number): number => y & 0x3fff;
export const above_tile = (y: number): number => y & 0x4000;
export const bgvalue = (y: number): number => y;

export class area_controller {
  x: number;
  y: number;
  w: number;
  h: number;
  active = 0;
  ambient = -1;
  view_xoff = -1;
  view_yoff = -1;
  ambient_speed = 2;
  view_xoff_speed = 4;
  view_yoff_speed = 4;
  next: area_controller | null;
  constructor(X: number, Y: number, W: number, H: number, Next: area_controller | null) {
    this.x = X | 0;
    this.y = Y | 0;
    this.w = W | 0;
    this.h = H | 0;
    this.next = Next;
  }
}

/** dev_cont->notify_deleted_object (the editor) */
export const level_hooks = { notify_deleted_object: null as ((o: game_object) => void) | null, symbol_str: (s: string): string => s };

export class level {
  map_fg: Uint16Array = new Uint16Array(0);
  map_bg: Uint16Array = new Uint16Array(0);
  bg_width = 0;
  bg_height = 0;
  fg_width = 0;
  fg_height = 0;
  Name: string | null = null;
  first_name: string | null = null;
  total_objs = 0;
  first: game_object | null = null;
  first_active: game_object | null = null;
  last: game_object | null = null;
  attack_list: game_object[] = [];
  attack_total = 0;
  target_list: game_object[] = [];
  target_total = 0;
  block_list: game_object[] = [];
  block_total = 0;
  all_block_list: game_object[] = [];
  all_block_total = 0;
  ctick = 0;
  area_list: area_controller | null = null;

  original_name(): string { return this.first_name ? this.first_name : this.Name!; }
  tick_counter(): number { return this.ctick; }
  set_tick_counter(x: number): void { this.ctick = x >>> 0; }
  clear_active_list(): void { this.first_active = null; }
  name(): string { return this.Name!; }
  first_object(): game_object | null { return this.first; }
  first_active_object(): game_object | null { return this.first_active; }
  foreground_width(): number { return this.fg_width; }
  foreground_height(): number { return this.fg_height; }
  background_width(): number { return this.bg_width; }
  background_height(): number { return this.bg_height; }
  load_failed(): boolean { return this.map_fg.length === 0; }
  set_name(name: string): void { this.Name = name; }

  fg_raised(x: number, y: number): number { return this.map_fg[x + y * this.fg_width] & 0x4000; }
  fg_set_raised(x: number, y: number, r: number): void {
    const v = this.map_fg[x + y * this.fg_width] & (0xffff - 0x4000);
    this.map_fg[x + y * this.fg_width] = r ? v | 0x4000 : v;
  }
  mark_seen(x: number, y: number): void { this.map_fg[x + y * this.fg_width] |= 0x8000; }
  clear_fg(x: number, y: number): void { this.map_fg[x + y * this.fg_width] &= 0x7fff; }
  get_fg(x: number, y: number): number {
    if (x >= 0 && y >= 0 && x < this.fg_width && y < this.fg_height) return fgvalue(this.map_fg[x + y * this.fg_width]);
    return 0;
  }
  get_bg(x: number, y: number): number {
    if (x >= 0 && y >= 0 && x < this.bg_width && y < this.bg_height) return this.map_bg[x + y * this.bg_width];
    return 0;
  }
  put_fg(x: number, y: number, tile: number): void { this.map_fg[x + y * this.fg_width] = tile; }
  put_bg(x: number, y: number, tile: number): void { this.map_bg[x + y * this.bg_width] = tile; }

  attacker(who: game_object): game_object {
    let d = 0x7fffffff;
    let c: game_object | null = null;
    for (let f = G.the_game.first_view; f; f = f.next) {
      if (f.focus) {
        const tmp_d = (Math.abs(f.focus.x - who.x) + Math.abs(f.focus.y - who.y)) | 0;
        if (tmp_d < d) {
          d = tmp_d;
          c = f.focus;
        }
      }
    }
    return c!;
  }

  is_attacker(who: game_object): number { return who.controller() !== null ? 1 : 0; }
  main_character(): game_object { return G.the_game.first_view!.focus!; }

  /** ~level and load_fail */
  load_fail(): void {
    this.map_fg = new Uint16Array(0);
    this.map_bg = new Uint16Array(0);
    this.Name = null;
    this.first_active = null;
    for (let f = L.player_list; f; f = f.next) if (f.focus) G.current_level.remove_object(f.focus);
    while (this.first) {
      this.first_active = this.first;
      this.first = this.first.next;
      if (level_hooks.notify_deleted_object) level_hooks.notify_deleted_object(this.first_active);
      this.first_active.clean_up();
    }
    this.area_list = null;
    this.last = null;
    delete_panims();
    delete_all_lights();
  }

  destroy(): void { this.load_fail(); }

  restart(): void {
    let f = G.the_game.first_view;
    let found: game_object | null = null;
    for (let o = this.first; f && o; o = o.next) {
      while (f && !f.focus) f = f.next;
      if (f) {
        if (object_names[o.otype] === 'START') {
          if (!found) found = o;
          f.focus!.x = o.x;
          f.focus!.y = o.y;
          f.focus!.set_hp(figures[f.focus!.otype].abil[0]);
          f.focus!.set_state(stopped);
          f = f.next;
        }
      }
    }
    while (f) {
      if (f.focus) {
        f.focus.x = found!.x;
        f.focus.y = found!.y;
        f.focus.set_hp(figures[f.focus.otype].abil[0]);
        f.focus.set_state(stopped);
      }
      f = f.next;
    }
  }

  unactivate_all(): void {
    this.first_active = null;
    this.attack_total = 0;
    this.target_total = 0;
    this.block_total = 0;
    this.all_block_total = 0;
    for (let o = this.first; o; o = o.next) o.active = 0;
  }

  /** pull_actives(o, last_active, t): the original passes o, not other, to the recursive call */
  private pull_actives(o: game_object, st: { last: game_object; t: number }): void {
    for (let i = o.total_objects(); i; i--) {
      const other = o.get_object(i - 1);
      if (!other.active) {
        other.active = 1;
        if (other.can_block()) {
          this.add_block(other);
          this.add_all_block(other);
        } else if (other.hurtable()) this.add_all_block(other);
        st.t++;
        st.last.next_active = other;
        st.last = other;
        this.pull_actives(o, st);
      }
    }
  }

  add_actives(x1: number, y1: number, x2: number, y2: number): number {
    let last_active: game_object | null = null;
    let t = 0;
    if (this.first_active) for (last_active = this.first_active; last_active.next_active; last_active = last_active.next_active);
    for (let o = this.first; o; o = o.next) {
      if (!o.active) {
        const xr = figures[o.otype].rangex, yr = figures[o.otype].rangey;
        if (o.x + xr >= x1 && o.x - xr <= x2 && o.y + yr >= y1 && o.y - yr <= y2) {
          if (o.can_block()) {
            this.add_block(o);
            this.add_all_block(o);
          } else if (o.hurtable()) this.add_all_block(o);
          o.active = 1;
          t++;
          if (!this.first_active) this.first_active = o;
          else last_active!.next_active = o;
          last_active = o;
          const st = { last: last_active, t };
          this.pull_actives(o, st);
          last_active = st.last;
          t = st.t;
        }
      }
    }
    if (last_active) last_active.next_active = null;
    return t;
  }

  add_drawables(x1: number, y1: number, x2: number, y2: number): number {
    let t = 0, ft = 0;
    let last_active: game_object | null = null;
    if (this.first_active) {
      for (last_active = this.first_active; last_active.next_active; last_active = last_active.next_active);
    } else ft = 1;
    for (let o = this.first; o; o = o.next) {
      if (ft || !o.active) {
        const xr = figures[o.otype].draw_rangex, yr = figures[o.otype].draw_rangey;
        if (o.x + xr >= x1 && o.x - xr <= x2 && o.y + yr >= y1 && o.y - yr <= y2) {
          t++;
          if (!this.first_active) this.first_active = o;
          else last_active!.next_active = o;
          last_active = o;
          o.active = 1;
        } else if (ft) o.active = 0;
      }
    }
    if (last_active) last_active.next_active = null;
    return t;
  }

  make_view_list(nplayers: number): view | null {
    let f: view | null = null;
    const use_type = L.current_start_type;
    figures[use_type].cache_in();
    let last_start: game_object | null = null;
    let num = 0, j = 0;
    for (let o = this.first; o && j < nplayers; o = o.next) {
      if (object_names[o.otype] === 'START') {
        f = new View(create(use_type, o.x, o.y), f, num);
        num++;
        f.focus!.set_controller(f);
        this.add_object_after(f.focus!, o);
        j++;
        last_start = o;
      }
    }
    const startable = j;
    for (; j < nplayers; j++) {
      if (startable) {
        const o = create(use_type, f!.focus!.x, f!.focus!.y);
        f = new View(o, f, num);
        num++;
        f.focus!.set_controller(f);
        this.add_object_after(o, last_start);
      } else {
        f = new View(null, f, num);
        num++;
      }
    }
    return f;
  }

  wall_push(): void {
    for (let o = this.first_active; o; o = o.next_active) {
      if (o.pushable()) {
        const [sx1, , sx2] = o.picture_space();
        let xv = sx1 - o.x, yv = 0;
        [, xv, yv] = o.try_move(o.x, o.y - 1, xv, yv, 1);
        if (xv !== sx1 - o.x) {
          xv = -xv;
          [, xv, yv] = o.try_move(o.x, o.y - 1, xv, yv, 1);
          o.x = o.x + xv;
        } else {
          xv = sx2 - o.x;
          [, xv, yv] = o.try_move(o.x, o.y - 1, xv, yv, 1);
          if (xv !== sx2 - o.x) {
            xv = -xv;
            [, xv, yv] = o.try_move(o.x, o.y - 1, xv, yv, 1);
            o.x = o.x + xv;
          }
        }
      }
    }
  }

  try_pushback(subject: game_object, target: game_object): void {
    if (subject.pushable() && target.pushable() && subject.state !== dead && target.state !== dead &&
        subject.state !== dieing && target.state !== dieing) {
      const b1 = subject.push_range(), b2 = target.push_range();
      if (Math.abs(subject.x - target.x) < b1 + b2) {
        const tmove = (b1 + b2 - Math.abs(subject.x - target.x)) | 0;
        let xv: number, yv = 0;
        if (subject.x > target.x) xv = (tmove / 2) | 0;
        else xv = -((tmove / 2) | 0);
        let xv2 = -xv;
        [, xv, yv] = subject.try_move(subject.x, subject.y, xv, yv, 3);
        subject.x = subject.x + xv;
        yv = 0;
        [, xv2, yv] = target.try_move(target.x, target.y, xv2, yv, 3);
        target.x = target.x + xv2;
      }
    }
  }

  /** collide.cpp level::check_collisions */
  check_collisions(): void {
    for (let l = 0; l < this.attack_total; l++) {
      const subject = this.attack_list[l];
      const [sx1, sy1, sx2, sy2] = subject.picture_space();
      let rec: game_object | null = null;
      let hitx = 0, hity = 0;
      for (let j = 0; j < this.target_total && !rec; j++) {
        const target = this.target_list[j];
        const [tx1, ty1, tx2, ty2] = target.picture_space();
        if (!(sx2 < tx1 || sy2 < ty1 || sx1 > tx2 || sy1 > ty2)) {
          this.try_pushback(subject, target);
          if (subject.can_hurt(target)) {
            target.x_center();
            const s_hit = subject.current_figure().hit;
            const t_damage = target.direction > 0 ? target.current_figure().f_damage : target.current_figure().b_damage;
            const sd = s_hit.data, td = t_damage.data;
            let s = 0;
            for (let i = s_hit.tot - 1; i > 0 && !rec; i--) {
              let t = 0;
              for (let jj = t_damage.tot - 1; jj > 0 && !rec; jj--) {
                const xp1 = (target.x + target.tx(td[t])) | 0;
                t++;
                const yp1 = (target.y + target.ty(td[t])) | 0;
                t++;
                const xp2 = (target.x + target.tx(td[t])) | 0;
                const yp2 = (target.y + target.ty(td[t + 1])) | 0;
                const x1 = (subject.x + subject.tx(sd[s])) | 0;
                const y1 = (subject.y + subject.ty(sd[s + 1])) | 0;
                let x2 = (subject.x + subject.tx(sd[s + 2])) | 0;
                let y2 = (subject.y + subject.ty(sd[s + 3])) | 0;
                const _x2 = x2, _y2 = y2;
                [, x2, y2] = setback_intersect(x1, y1, x2, y2, xp1, yp1, xp2, yp2, 0);
                if (x2 !== _x2 || _y2 !== y2) {
                  rec = target;
                  hitx = (((((x1 + x2) / 2) | 0) + (((xp1 + xp2) / 2) | 0)) / 2) | 0;
                  hity = (((((y1 + y1) / 2) | 0) + (((yp1 + yp2) / 2) | 0)) / 2) | 0;
                }
              }
              s += 2;
            }
          }
        }
      }
      if (rec) {
        rec.do_damage(subject.current_figure().hit_damage, subject, hitx, hity, 0, 0);
        subject.note_attack(rec);
      }
    }
  }

  private setback(list: game_object[], total: number, subject: game_object | null, x1: number, y1: number, x2: number, y2: number): [game_object | null, number, number] {
    let l: game_object | null = null;
    for (let n = 0; n < total; n++) {
      const target = list[n];
      if (target !== subject && (target.total_objects() === 0 || target.get_object(0) !== subject)) {
        const [tx1, ty1, tx2, ty2] = target.picture_space();
        if (!((x2 < tx1 && x1 < tx1) || (x1 > tx2 && x2 > tx2) || (y1 > ty2 && y2 > ty2) || (y1 < ty1 && y2 < ty1))) {
          target.x_center();
          const t_damage = target.direction > 0 ? target.current_figure().f_damage : target.current_figure().b_damage;
          const td = t_damage.data, ins = t_damage.inside;
          let t = 0, ii = 0;
          let iter = t_damage.tot - 1;
          while (iter-- > 0) {
            const xp1 = (target.x + target.tx(td[t])) | 0;
            t++;
            const yp1 = (target.y + target.ty(td[t])) | 0;
            t++;
            const xp2 = (target.x + target.tx(td[t])) | 0;
            const yp2 = (target.y + target.ty(td[t + 1])) | 0;
            let hit: number;
            [hit, x2, y2] = setback_intersect(x1, y1, x2, y2, xp1, yp1, xp2, yp2, ins[ii] ? 1 : -1);
            if (hit) l = target;
            ii++;
          }
        }
      }
    }
    return [l, x2, y2];
  }

  /** boundary_setback(subject, x1, y1, &x2, &y2): returns [last hit, x2, y2] */
  boundary_setback(subject: game_object | null, x1: number, y1: number, x2: number, y2: number): [game_object | null, number, number] {
    return this.setback(this.block_list, this.block_total, subject, x1, y1, x2, y2);
  }
  all_boundary_setback(subject: game_object | null, x1: number, y1: number, x2: number, y2: number): [game_object | null, number, number] {
    return this.setback(this.all_block_list, this.all_block_total, subject, x1, y1, x2, y2);
  }

  interpolate_draw_objects(v: view): void {
    L.current_view = v;
    for (let o = this.first_active; o; o = o.next_active) {
      const old_x = o.x, old_y = o.y;
      o.x = ((o.last_x + o.x) / 2) | 0;
      o.y = ((o.last_y + o.y) / 2) | 0;
      o.last_x = old_x;
      o.last_y = old_y;
    }
    for (let o = this.first_active; o; o = o.next_active) o.draw();
    for (let o = this.first_active; o; o = o.next_active) {
      o.x = o.last_x;
      o.y = o.last_y;
    }
  }

  /** tick(): the objects' AI and physics; async because an AI may open a dialog (rt/needinput.ts) */
  async tick(): Promise<number> {
    let cur: game_object | null;
    for (let o = this.first_active; o;) {
      o.last_x = o.x;
      o.last_y = o.y;
      cur = o;
      const c = o.controller();
      if (!(G.dev & SUSPEND_MODE) || c) {
        o.set_flags(o.flags() & (0xff - FLAG_JUST_HIT - FLAG_JUST_BLOCKED));
        if (c) {
          let smallest: area_controller | null = null;
          // int32_t smallest_size = 0xffffffff is -1: no area is ever smaller
          let smallest_size = -1;
          for (let a = this.area_list; a; a = a.next) {
            if (o.x >= a.x && o.y >= a.y && o.x <= a.x + a.w && o.y <= a.y + a.h) {
              const size = Math.imul(a.w, a.h);
              if (size < smallest_size) {
                smallest = a;
                smallest_size = size;
              }
            }
          }
          if (c.local_player()) {
            if (!LG.shutdown_lighting) {
              if (G.massive_frame_panic > 30) {
                LG.shutdown_lighting = 100;
                LG.shutdown_lighting_value = c.ambient;
              }
            } else if (G.massive_frame_panic) {
              if (LG.shutdown_lighting_value < 63) LG.shutdown_lighting_value++;
            } else if (LG.shutdown_lighting > 1) LG.shutdown_lighting--;
            else if (LG.shutdown_lighting_value !== c.ambient) {
              if (Math.abs(LG.shutdown_lighting_value - c.ambient) < 4) LG.shutdown_lighting_value = c.ambient;
              else if (LG.shutdown_lighting_value < c.ambient) LG.shutdown_lighting_value += 4;
              else if (LG.shutdown_lighting_value > c.ambient) LG.shutdown_lighting_value -= 4;
            } else LG.shutdown_lighting = 0;
          }
          if (smallest) c.configure_for_area(smallest);
          o.move(c.x_suggestion, c.y_suggestion, c.b1_suggestion | (c.b2_suggestion << 1) | (c.b3_suggestion << 2));
          if (o.otype !== L.current_start_type) {
            let fmp = o.fmp();
            const reduce = figures[o.otype].morph_power;
            if (reduce) {
              fmp -= reduce;
              o.add_power(fmp >> 16);
              o.set_fmp(fmp & 0xffff);
              if (o.mp() <= 0) o.morph_into(L.current_start_type, -1, 9);
            }
          }
          o = o.next_active;
        } else {
          let alive: number;
          for (;;) {
            try {
              alive = o.decide();
              break;
            } catch (e) {
              if (e instanceof NeedInput) {
                await e.run();
                continue;
              }
              throw e;
            }
          }
          if (!alive) {
            const p = o;
            o = o.next_active;
            this.delete_object(p);
            cur = null;
          } else o = o.next_active;
        }
      } else o = o.next_active;
      if (cur) {
        const p = cur.current_figure().hit;
        if (p && p.tot) this.add_attacker(cur);
        if (cur.hurtable()) this.add_target(cur);
      }
    }
    tick_panims();
    this.check_collisions();
    this.set_tick_counter(this.tick_counter() + 1);
    return 1;
  }

  draw_areas(v: view): void {
    for (let a = this.area_list; a; a = a.next) {
      let c1: number, c2: number;
      if (a.active) {
        c1 = G.the_game.morph_sel_frame_color;
        c2 = G.wm.bright_color();
      } else {
        c2 = G.the_game.morph_sel_frame_color;
        c1 = G.wm.bright_color();
      }
      const [sx1, sy1] = G.the_game.game_to_mouse(a.x, a.y, v);
      const [sx2, sy2] = G.the_game.game_to_mouse(a.x + a.w, a.y + a.h, v);
      G.screen.rectangle(sx1, sy1, sx2, sy2, c1);
      G.screen.bar(sx1 - 1, sy1 - 1, sx1 + 1, sy1 + 1, c2);
      G.screen.bar(sx2 - 1, sy2 - 1, sx2 + 1, sy2 + 1, c2);
    }
  }

  draw_objects(v: view): void {
    L.current_view = v;
    if (G.dev & MAP_MODE) for (let o = this.first_active; o; o = o.next_active) o.map_draw();
    else for (let o = this.first_active; o; o = o.next_active) o.draw();
  }

  // ------------------------------------------------------------------ loading
  private old_load_objects(sd: spec_directory, _fp: bFILE): void {
    this.total_objs = 0;
    this.first = this.last = this.first_active = null;
    const se = sd.find('objects');
    if (!se) return;
    dprintf('old style level objects are not supported\n');
  }

  private load_objects(sd: spec_directory, fp: bFILE): void {
    let se = sd.find('object_descripitions');
    this.total_objs = 0;
    this.first = this.last = this.first_active = null;
    if (!se) {
      this.old_load_objects(sd, fp);
      return;
    }
    fp.seek(se.offset, 0);
    const old_tot = (fp.read_uint16() << 16) >> 16;
    se = sd.find('describe_names');
    if (!se || !old_tot) return;
    const total_objects = figures.length;
    const o_remap = new Uint16Array(old_tot);
    const o_backmap = new Uint16Array(total_objects).fill(0xffff);
    for (let i = 0; i < old_tot; i++) {
      const old_name = read_cstr(fp, fp.read_uint8());
      o_remap[i] = 0xffff;
      for (let j = 0; j < total_objects; j++) {
        if (old_name === object_names[j]) {
          o_remap[i] = j;
          o_backmap[j] = i;
        }
      }
    }
    se = sd.find('describe_states');
    if (!se) return;
    const s_remap: Int16Array[] = [];
    fp.seek(se.offset, 0);
    for (let i = 0; i < old_tot; i++) {
      const t = (fp.read_uint16() << 16) >> 16;
      s_remap[i] = new Int16Array(Math.max(t, 0)).fill(stopped);
      for (let j = 0; j < t; j++) {
        const old_name = read_cstr(fp, fp.read_uint8());
        const new_type = o_remap[i];
        if (new_type < total_objects) {
          for (let k = 0; k < figures[new_type].ts; k++)
            if (figures[new_type].seq[k] && symbol_name(figures[new_type].seq_syms[k]) === old_name) s_remap[i][j] = k;
        }
      }
    }
    const v_remap: Int16Array[] = [];
    let load_vars = 1;
    se = sd.find('describe_lvars');
    if (se) {
      fp.seek(se.offset, 0);
      for (let i = 0; i < old_tot; i++) {
        const t = (fp.read_uint16() << 16) >> 16;
        v_remap[i] = new Int16Array(Math.max(t, 0)).fill(-1);
        for (let j = 0; j < t; j++) {
          const old_name = read_cstr(fp, fp.read_uint8());
          const new_type = o_remap[i];
          if (new_type !== 0xffff) {
            for (let k = 0; k < figures[new_type].tiv; k++)
              if (figures[new_type].vars[k] && symbol_name(figures[new_type].vars[k]) === old_name)
                v_remap[i][j] = figures[new_type].var_index[k];
          }
        }
      }
      load_vars = 1;
    }
    se = sd.find('object_list');
    if (se) {
      this.total_objs = fp.read_uint32() | 0;
      se = sd.find('type');
      if (se) {
        fp.seek(se.offset, 0);
        this.last = null;
        if (fp.read_uint8() === RC_16) {
          for (let i = 0; i < this.total_objs; i++) {
            const t = fp.read_uint16();
            const p = new game_object(o_remap[t], 1);
            if (!this.first) this.first = p;
            else this.last!.next = p;
            this.last = p;
            p.next = null;
          }
          se = sd.find('state');
          if (se) {
            fp.seek(se.offset, 0);
            if (fp.read_uint8() === RC_16) {
              let l = this.first;
              for (let i = 0; i < this.total_objs; i++, l = l!.next) {
                const st = fp.read_uint16();
                if (l!.otype === 0xffff) l!.state = stopped;
                else {
                  const s = s_remap[o_backmap[l!.otype]][st];
                  if (l!.has_sequence(s)) l!.state = s;
                  else l!.state = stopped;
                  l!.current_frame = 0;
                }
              }
            }
          }
          se = sd.find('lvars');
          if (se && load_vars) {
            fp.seek(se.offset, 0);
            let abort = 0;
            for (let o = this.first; o && !abort; o = o.next) {
              const ot = (fp.read_uint16() << 16) >> 16;
              for (let k = 0; k < ot; k++) {
                if (fp.read_uint8() !== RC_32) abort = 1;
                else {
                  const v = fp.read_uint32() | 0;
                  if (o.otype !== 0xffff) {
                    const vr = v_remap[o_backmap[o.otype]];
                    const remap = vr && k < vr.length ? vr[k] : -1;
                    if (remap !== -1 && figures[o.otype].tiv >= k) o.lvars![remap] = v;
                  }
                }
              }
            }
          }
          const frame_var = 24;
          for (let j = 0; j < TOTAL_OBJECT_VARS; j++) {
            const se2 = sd.find(object_descriptions[j].name);
            if (se2) {
              fp.seek(se2.offset, 0);
              const t = object_descriptions[j].type;
              if (fp.read_uint8() !== t) dprintf("Warning : load level -> var '%s' size changed\n");
              else {
                for (let f = this.first; f; f = f.next) {
                  switch (t) {
                    case RC_8: f.set_var(j, fp.read_uint8()); break;
                    case RC_16: f.set_var(j, fp.read_uint16()); break;
                    case RC_32: f.set_var(j, fp.read_uint32()); break;
                  }
                  if (j === frame_var) {
                    if (f.otype !== 0xffff && f.current_frame >= figures[f.otype].get_sequence(f.state).length()) f.current_frame = 0;
                  }
                }
              }
            } else dprintf(`Warning : load level -> no previous var ${object_descriptions[j].name}\n`);
          }
        }
      }
    }
  }

  /** level(spec_directory *sd, bFILE *fp, char const *lev_name) */
  static load(sd: spec_directory, fp: bFILE, lev_name: string): level {
    const lv = new level();
    G.the_game.need_refresh();
    const stat = level_status;
    stat.push(level_hooks.symbol_str('loading').replace('%s', lev_name));
    lv.Name = lev_name;
    let e = sd.find('first name');
    if (e) {
      fp.seek(e.offset, 0);
      const len = fp.read_uint8();
      lv.first_name = read_cstr(fp, len);
    } else lv.first_name = lv.Name;
    let no_fg = 0, no_bg = 0;
    e = sd.find('fgmap');
    if (e) {
      fp.seek(e.offset, 0);
      lv.fg_width = fp.read_uint32() & 0xffff;
      lv.fg_height = fp.read_uint32() & 0xffff;
      lv.map_fg = read_map(fp, lv.fg_width * lv.fg_height);
    } else {
      G.the_game.show_help('Warning foreground map missing');
      no_fg = 1;
    }
    stat.update(5);
    e = sd.find('bgmap');
    if (e) {
      fp.seek(e.offset, 0);
      lv.bg_width = fp.read_uint32() & 0xffff;
      lv.bg_height = fp.read_uint32() & 0xffff;
      lv.map_bg = read_map(fp, lv.bg_width * lv.bg_height);
    } else {
      G.the_game.show_help('Warning background map missing');
      no_bg = 1;
    }
    if (no_fg && !no_bg) {
      lv.fg_width = lv.bg_width;
      lv.fg_height = lv.bg_height;
      lv.map_fg = new Uint16Array(lv.fg_width * lv.fg_height);
    }
    if (no_bg) {
      lv.bg_width = ((lv.fg_width / 8) | 0) + 8;
      lv.bg_height = ((lv.fg_height / 8) | 0) + 8;
      lv.map_bg = new Uint16Array(lv.bg_width * lv.bg_height);
    }
    stat.update(10);
    const load_all = sd.find('player_info');
    for (let i = 0, w = lv.fg_width * lv.fg_height; i < w; i++) {
      if (!load_all) lv.map_fg[i] &= ~0x8000 & 0xffff;
      const v = fgvalue(lv.map_fg[i]);
      if (v >= G.nforetiles || G.foretiles[v] < 0) lv.map_fg[i] = 0;
    }
    for (let i = 0, w = lv.bg_width * lv.bg_height; i < w; i++) {
      const v = bgvalue(lv.map_bg[i]);
      if (v >= G.nbacktiles || G.backtiles[v] < 0) lv.map_bg[i] = 0;
    }
    lv.load_options(sd, fp);
    stat.update(15);
    lv.load_objects(sd, fp);
    stat.update(25);
    const players = make_player_onodes();
    const objs = lv.make_not_list(players);
    read_lights(sd, fp);
    lv.load_links(fp, sd, objs, players);
    const players_got_loaded = lv.load_player_info(fp, sd, objs);
    for (let l = lv.first; l;) {
      const p = l;
      l = l.next;
      if (p.otype === 0xffff || p.x < 0 || p.y < 0) lv.delete_object(p);
    }
    lv.load_cache_info();
    if (!players_got_loaded) {
      const old = G.current_level;
      G.current_level = lv;
      const list = lv.make_not_list(null);
      for (let ln = list; ln; ln = ln.next) ln.me.reload_notify();
      G.current_level = old;
      lv.insert_players();
    }
    stat.pop();
    return lv;
  }

  /** level(int width, int height, char const *name) */
  static blank(width: number, height: number, name: string): level {
    const lv = new level();
    G.the_game.need_refresh();
    lv.set_tick_counter(0);
    lv.set_name(name);
    lv.fg_width = width;
    lv.fg_height = height;
    [lv.bg_width, lv.bg_height] = calc_bgsize(width, height);
    lv.map_bg = new Uint16Array(lv.bg_width * lv.bg_height);
    lv.map_fg = new Uint16Array(lv.fg_width * lv.fg_height);
    for (let i = 0; i < lv.fg_width; i++) {
      lv.map_fg[i] = 1;
      lv.map_fg[lv.fg_width * (lv.fg_height - 1) + i] = 1;
    }
    for (let i = 0; i < lv.fg_height; i++) {
      lv.map_fg[lv.fg_width * i] = 1;
      lv.map_fg[lv.fg_width * i + lv.fg_width - 1] = 1;
    }
    lv.total_objs = 0;
    lv.insert_players();
    return lv;
  }

  load_player_info(fp: bFILE, sd: spec_directory, save_list: object_node | null): number {
    let ret: number;
    let se = sd.find('player_info');
    if (se) {
      fp.seek(se.offset, 0);
      let set_first_view = 0;
      if (G.the_game.first_view === L.player_list) set_first_view = 1;
      for (let v = L.player_list; v; v = v.next) {
        v.suggest.send_view = 0;
        v.suggest.send_weapon_change = 0;
      }
      while (L.player_list) {
        const v = L.player_list;
        if (v.focus) {
          if (v.focus.controller()) v.focus.set_controller(null);
          v.focus.clean_up();
        }
        L.player_list = L.player_list.next;
        v.destroy();
      }
      const total_players = fp.read_uint32() | 0;
      let last: view | null = null;
      for (let i = 0; i < total_players; i++) {
        const o = number_to_object_in_list(fp.read_uint32() | 0, save_list);
        const v = new View(o, null, 0);
        if (o) o.set_controller(v);
        if (L.player_list) last!.next = v;
        else L.player_list = v;
        last = v;
      }
      if (set_first_view) G.the_game.first_view = L.player_list;
      for (let i = 0; i < total_view_vars(); i++) {
        se = sd.find(get_view_var_name(i));
        if (se) {
          fp.seek(se.offset, 0);
          if (fp.read_uint8() === RC_32) for (let v = L.player_list; v; v = v.next) v.set_view_var_value(i, fp.read_uint32() | 0);
        } else for (let v = L.player_list; v; v = v.next) v.set_view_var_value(i, 0);
      }
      se = sd.find('random_start');
      if (se) {
        fp.seek(se.offset, 0);
        if (fp.read_uint8() === RC_32) R.rand_on = fp.read_uint32() & 0xffff;
      } else R.rand_on = 0;
      se = sd.find('weapon_array');
      if (se) {
        fp.seek(se.offset, 0);
        if (fp.read_uint8() === RC_32) {
          const m = fp.read_uint32() | 0;
          for (let v = L.player_list; v; v = v.next) {
            for (let i = 0; i < m; i++) {
              const x = fp.read_uint32() | 0;
              if (i < W.total_weapons) {
                v.weapons[i] = x;
                v.last_weapons[i] = x;
              }
            }
          }
        }
      } else {
        for (let v = L.player_list; v; v = v.next) {
          v.last_weapons.fill(-1);
          v.weapons.fill(-1);
        }
      }
      se = sd.find('player_names');
      if (se) {
        fp.seek(se.offset, 0);
        for (let v = L.player_list; v; v = v.next) {
          const len = fp.read_uint8();
          v.name = read_cstr(fp, len);
        }
      }
      ret = 1;
      recalc_local_view_space();
    } else {
      const fun = find_or_create('set_player_defaults');
      if (DEFINEDP(fun.function)) {
        const o = L.current_object;
        for (let f = L.player_list; f; f = f.next) {
          if (f.focus) {
            L.current_object = f.focus;
            eval_function(fun, null);
          }
        }
        L.current_object = o;
      }
      ret = 0;
    }
    for (let vw = L.player_list; vw; vw = vw.next) {
      if (W.total_weapons && !vw.has_weapon(vw.current_weapon)) {
        vw.suggest.send_weapon_change = 1;
        vw.suggest.new_weapon = 0;
      }
    }
    return ret;
  }

  write_objects(fp: bFILE, save_list: object_node | null): void {
    const total_objects = figures.length;
    fp.write_uint16(total_objects);
    for (let i = 0; i < total_objects; i++) write_cstr(fp, object_names[i]);
    for (let i = 0; i < total_objects; i++) {
      let total = 0;
      for (let j = 0; j < figures[i].ts; j++) if (figures[i].seq[j]) total++;
      fp.write_uint16(total);
      for (let j = 0; j < figures[i].ts; j++) if (figures[i].seq[j]) write_cstr(fp, symbol_name(figures[i].seq_syms[j]));
    }
    for (let i = 0; i < total_objects; i++) {
      fp.write_uint16(figures[i].tv);
      for (let x = 0; x < figures[i].tv; x++)
        for (let j = 0; j < figures[i].tiv; j++)
          if (figures[i].vars[j] && figures[i].var_index[j] === x) write_cstr(fp, symbol_name(figures[i].vars[j]));
    }
    let t = 0;
    for (let o = save_list; o; o = o.next) t++;
    fp.write_uint32(t);
    fp.write_uint8(RC_16);
    for (let o = save_list; o; o = o.next) fp.write_uint16(o.me.type());
    fp.write_uint8(RC_16);
    for (let o = save_list; o; o = o.next) fp.write_uint16(o.me.reduced_state());
    for (let o = save_list; o; o = o.next) {
      fp.write_uint16(figures[o.me.otype].tv);
      for (let i = 0; i < figures[o.me.otype].tv; i++) {
        fp.write_uint8(RC_32);
        fp.write_uint32(o.me.lvars![i]);
      }
    }
    for (let i = 0; i < TOTAL_OBJECT_VARS; i++) {
      const tt = object_descriptions[i].type;
      fp.write_uint8(tt);
      for (let o = save_list; o; o = o.next) {
        if (tt === RC_8) fp.write_uint8(o.me.get_var(i));
        else if (tt === RC_16) fp.write_uint16(o.me.get_var(i));
        else fp.write_uint32(o.me.get_var(i));
      }
    }
  }

  total_object_links(list: object_node | null): number {
    let tl = 0;
    for (let o = list; o; o = o.next) tl += o.me.total_objects();
    return tl;
  }
  total_light_links(list: object_node | null): number {
    let tl = 0;
    for (let o = list; o; o = o.next) tl += o.me.total_lights();
    return tl;
  }

  write_links(fp: bFILE, save_list: object_node | null, exclude_list: object_node | null): void {
    fp.write_uint8(RC_32);
    fp.write_uint32(this.total_object_links(save_list));
    let x = 1;
    for (let o = save_list; o; o = o.next, x++) {
      for (let i = 0; i < o.me.total_objects(); i++) {
        fp.write_uint32(x);
        const xx = object_to_number_in_list(o.me.get_object(i), save_list);
        if (xx) fp.write_uint32(xx);
        else fp.write_uint32(-object_to_number_in_list(o.me, exclude_list));
      }
    }
    fp.write_uint8(RC_32);
    fp.write_uint32(this.total_light_links(save_list));
    x = 1;
    for (let o = save_list; o; o = o.next, x++) {
      for (let i = 0; i < o.me.total_lights(); i++) {
        fp.write_uint32(x);
        fp.write_uint32(light_to_number(o.me.get_light(i)));
      }
    }
  }

  load_links(fp: bFILE, sd: spec_directory, save_list: object_node | null, exclude_list: object_node | null): void {
    let se = sd.find('object_links');
    if (se) {
      fp.seek(se.offset, 0);
      if (fp.read_uint8() === RC_32) {
        let t = fp.read_uint32() | 0;
        while (t) {
          const x1 = fp.read_uint32() | 0;
          const x2 = fp.read_uint32() | 0;
          const q = number_to_object_in_list(x1, save_list);
          const p = x2 > 0 ? number_to_object_in_list(x2, save_list) : number_to_object_in_list(-x2, exclude_list);
          if (q) q.add_object(p);
          else dprintf('bad object link\n');
          t--;
        }
      }
    }
    se = sd.find('light_links');
    if (se) {
      fp.seek(se.offset, 0);
      if (fp.read_uint8() === RC_32) {
        let t = fp.read_uint32() | 0;
        while (t) {
          const x1 = fp.read_uint32() | 0;
          const x2 = fp.read_uint32() | 0;
          const p = number_to_object_in_list(x1, save_list);
          if (p) p.add_light(number_to_light(x2));
          else dprintf('bad object/light link\n');
          t--;
        }
      }
    }
  }

  write_options(fp: bFILE): void {
    fp.write_uint8(RC_32);
    fp.write_uint32(G.bg_xmul);
    fp.write_uint32(G.bg_xdiv);
    fp.write_uint32(G.bg_ymul);
    fp.write_uint32(G.bg_ydiv);
    fp.write_uint8(RC_32);
    let ta = 0;
    for (let a = this.area_list; a; a = a.next) ta++;
    fp.write_uint32(ta);
    for (let a = this.area_list; a; a = a.next) {
      for (const v of [a.x, a.y, a.w, a.h, a.active, a.ambient, a.view_xoff, a.view_yoff, a.ambient_speed, a.view_xoff_speed, a.view_yoff_speed])
        fp.write_uint32(v);
    }
    fp.write_uint8(RC_32);
    fp.write_uint32(this.tick_counter());
  }

  load_options(sd: spec_directory, fp: bFILE): void {
    let se = sd.find('bg_scroll_rate');
    if (se) {
      fp.seek(se.offset, 0);
      if (fp.read_uint8() !== RC_32) {
        G.bg_xmul = G.bg_ymul = 1;
        G.bg_xdiv = G.bg_ydiv = 8;
      } else {
        G.bg_xmul = fp.read_uint32() | 0;
        G.bg_xdiv = fp.read_uint32() | 0;
        G.bg_ymul = fp.read_uint32() | 0;
        G.bg_ydiv = fp.read_uint32() | 0;
      }
    } else {
      G.bg_xmul = G.bg_ymul = 1;
      G.bg_xdiv = G.bg_ydiv = 8;
    }
    se = sd.find('area_list.v1');
    if (se) {
      fp.seek(se.offset, 0);
      if (fp.read_uint8() === RC_32) {
        let l: area_controller | null = null;
        const ta = fp.read_uint32() | 0;
        for (let i = 0; i < ta; i++) {
          const x = fp.read_uint32() | 0, y = fp.read_uint32() | 0, w = fp.read_uint32() | 0, h = fp.read_uint32() | 0;
          const p = new area_controller(x, y, w, h, null);
          if (l) l.next = p;
          else this.area_list = p;
          l = p;
          p.active = fp.read_uint32() | 0;
          p.ambient = fp.read_uint32() | 0;
          p.view_xoff = fp.read_uint32() | 0;
          p.view_yoff = fp.read_uint32() | 0;
          p.ambient_speed = fp.read_uint32() | 0;
          p.view_xoff_speed = fp.read_uint32() | 0;
          p.view_yoff_speed = fp.read_uint32() | 0;
        }
      }
    }
    se = sd.find('tick_counter');
    if (se) {
      fp.seek(se.offset, 0);
      if (fp.read_uint8() === RC_32) this.set_tick_counter(fp.read_uint32());
      else this.set_tick_counter(0);
    } else this.set_tick_counter(0);
  }

  load_cache_info(): void {
    const ec = symbol_value(L.l_empty_cache);
    if (!DEFINEDP(ec) || !ec) {
      const pf_name = get_prof_assoc_filename(this.first_name ? this.first_name : this.Name!);
      cache.load_cache_prof_info(pf_name, {
        clear_need: () => { for (const f of figures) f.set_cflag(CFLAG_NEED_CACHE_IN, 0); },
        object_types: () => { const t: number[] = []; for (let f = this.first; f; f = f.next) t.push(f.otype); return t; },
        fun_of: (t) => figures[t].get_fun(OFUN_GET_CACHE_LIST),
        set_need: (t) => {
          if (figures[t].get_cflag(CFLAG_NEED_CACHE_IN)) return false;
          figures[t].set_cflag(CFLAG_NEED_CACHE_IN, 1);
          return true;
        },
        total_objects: () => figures.length,
        eval_fun: (f, args) => eval_function(f, args),
        new_args: (t) => { const l = { v: null as LObj }; push_onto_list(new LNumber(t), l); return l.v; },
        tile_ids: () => {
          const ids: number[] = [];
          for (let i = 0; i < this.fg_width * this.fg_height; i++) {
            const id = G.foretiles[fgvalue(this.map_fg[i])];
            if (id >= 0 && id < G.nforetiles) ids.push(id);
          }
          for (let i = 0; i < this.bg_width * this.bg_height; i++) {
            const id = G.backtiles[bgvalue(this.map_bg[i])];
            if (id >= 0 && id < G.nbacktiles) ids.push(id);
          }
          return ids;
        },
        load_chars: () => {
          for (const f of figures) {
            if (f.get_cflag(CFLAG_NEED_CACHE_IN)) {
              f.set_cflag(CFLAG_CACHED_IN, 0);
              f.cache_in();
              f.set_cflag(CFLAG_NEED_CACHE_IN, 0);
            }
          }
        },
      });
    }
  }

  level_loaded_notify(): void {
    const n = this.first_name ? this.first_name : this.name();
    if (n.indexOf('levels/level') >= 0) {
      const nm = `music/abuse${n[12] ?? '\0'}${n[13] ?? '\0'}.hmi`;
      const fp = open_file(nm, 'rb');
      if (fp.open_failure()) fp.close();
      else {
        if (G.current_song) {
          G.current_song.stop();
          G.current_song.destroy();
        }
        fp.close();
        G.current_song = new song(nm);
        G.current_song.play(S.music_volume);
      }
    }
  }

  // ------------------------------------------------------------------ saving
  private create_dir(filename: string, save_all: number, save_list: object_node | null): bFILE | null {
    const sd = new spec_directory();
    const add = (type: number, name: string, size: number): void => sd.add_by_hand(new spec_entry(type, name, null, size, 0));
    add(SPEC_DATA_ARRAY, 'Copyright 1995 Crack dot Com, All Rights reserved', 0);
    if (this.first_name) add(SPEC_DATA_ARRAY, 'first name', this.first_name.length + 2);
    add(SPEC_GRUE_FGMAP, 'fgmap', 4 + 4 + this.fg_width * this.fg_height * 2);
    add(SPEC_GRUE_BGMAP, 'bgmap', 4 + 4 + this.bg_width * this.bg_height * 2);
    add(SPEC_DATA_ARRAY, 'bg_scroll_rate', 1 + 4 * 4);
    let ta = 0;
    for (let a = this.area_list; a; a = a.next) ta++;
    add(SPEC_DATA_ARRAY, 'area_list.v1', 1 + ta * (4 * 11) + 4);
    add(SPEC_DATA_ARRAY, 'tick_counter', 1 + 4);
    add(SPEC_DATA_ARRAY, 'object_descripitions', 2);
    const total_objects = figures.length;
    let size = 0;
    for (let i = 0; i < total_objects; i++) size += 1 + object_names[i].length + 1;
    add(SPEC_DATA_ARRAY, 'describe_names', size);
    size = 0;
    for (let i = 0; i < total_objects; i++) {
      size += 2;
      for (let j = 0; j < figures[i].ts; j++) if (figures[i].seq[j]) size += 1 + symbol_name(figures[i].seq_syms[j]).length + 1;
    }
    add(SPEC_DATA_ARRAY, 'describe_states', size);
    size = 0;
    for (let i = 0; i < total_objects; i++) {
      size += 2;
      for (let j = 0; j < figures[i].tiv; j++) if (figures[i].vars[j]) size += 1 + symbol_name(figures[i].vars[j]).length + 1;
    }
    add(SPEC_DATA_ARRAY, 'describe_lvars', size);
    add(SPEC_DATA_ARRAY, 'object_list', 4);
    let t = 0;
    for (let o = save_list; o; o = o.next) t++;
    add(SPEC_DATA_ARRAY, 'type', 1 + 2 * t);
    add(SPEC_DATA_ARRAY, 'state', 1 + 2 * t);
    size = 0;
    for (let o = save_list; o; o = o.next) size += figures[o.me.otype].tv * 5 + 2;
    add(SPEC_DATA_ARRAY, 'lvars', size);
    for (let i = 0; i < TOTAL_OBJECT_VARS; i++)
      add(SPEC_DATA_ARRAY, object_descriptions[i].name, 1 + RC_type_size(object_descriptions[i].type) * t);
    add_light_spec(sd);
    add(SPEC_DATA_ARRAY, 'object_links', 1 + 4 + this.total_object_links(save_list) * 8);
    add(SPEC_DATA_ARRAY, 'light_links', 1 + 4 + this.total_light_links(save_list) * 8);
    if (save_all) {
      t = 0;
      for (let v = L.player_list; v; v = v.next) t++;
      add(SPEC_DATA_ARRAY, 'player_info', t * 4 + 4);
      for (let i = 0; i < total_view_vars(); i++) add(SPEC_DATA_ARRAY, get_view_var_name(i), 1 + 4 * t);
      add(SPEC_DATA_ARRAY, 'random_start', 5);
      add(SPEC_DATA_ARRAY, 'weapon_array', 1 + 4 + W.total_weapons * 4 * t);
      let name_len = 0;
      for (let v = L.player_list; v; v = v.next) name_len += v.name.length + 2;
      add(SPEC_DATA_ARRAY, 'player_names', name_len);
      add(SPEC_IMAGE, 'thumb nail', 4 + 160 * (100 + G.wm.font().height() * 2));
    }
    sd.calc_offsets();
    return sd.write_file(filename);
  }

  private write_thumb_nail(fp: bFILE, im: image): void {
    const i = new image(160, 100 + G.wm.font().height() * 2);
    i.clear();
    scale_put(im, i, 0, 0, 160, 100);
    const fnt = G.wm.font();
    if (this.first_name) fnt.put_string(i, 80 - ((this.first_name.length * fnt.width()) / 2 | 0), 100, this.first_name);
    const buf = thumb_time();
    fnt.put_string(i, 80 - ((buf.length * fnt.width()) / 2 | 0), 100 + fnt.height(), buf);
    fp.write_uint16(i.w);
    fp.write_uint16(i.h);
    fp.write(i.m_data, i.w * i.h);
  }

  private write_player_info(fp: bFILE, save_list: object_node | null): void {
    let t = 0;
    for (let v = L.player_list; v; v = v.next) t++;
    fp.write_uint32(t);
    for (let v = L.player_list; v; v = v.next) fp.write_uint32(object_to_number_in_list(v.focus, save_list));
    for (let i = 0; i < total_view_vars(); i++) {
      fp.write_uint8(RC_32);
      for (let v = L.player_list; v; v = v.next) fp.write_uint32(v.get_view_var_value(i));
    }
    fp.write_uint8(RC_32);
    fp.write_uint32(R.rand_on);
    fp.write_uint8(RC_32);
    fp.write_uint32(W.total_weapons);
    for (let v = L.player_list; v; v = v.next) for (let i = 0; i < W.total_weapons; i++) fp.write_uint32(v.weapons[i]);
    for (let v = L.player_list; v; v = v.next) write_cstr(fp, v.name);
  }

  save(filename: string, save_all: number): number {
    const name = `${get_save_filename_prefix()}${filename}`;
    const bkname = `${get_save_filename_prefix()}levsave.bak`;
    const kb = symbol_value(L.l_keep_backup);
    if (!save_all && DEFINEDP(kb) && kb) {
      const fp = open_file(name, 'rb');
      if (!fp.open_failure()) {
        const bk = open_file(bkname, 'wb');
        if (bk.open_failure()) dprintf(`unable to open backup file ${bkname}\n`);
        else bk.write(fp.read_bytes(fp.file_size()));
        bk.close();
      }
      fp.close();
    }
    if (!save_all) this.first_name = name;
    const players = save_all ? null : make_player_onodes();
    const objs = this.make_not_list(players);
    const fp = this.create_dir(name, save_all, objs);
    if (fp) {
      if (this.first_name) write_cstr(fp, this.first_name);
      else {
        fp.write_uint8(1);
        fp.write_uint8(0);
      }
      fp.write_uint32(this.fg_width);
      fp.write_uint32(this.fg_height);
      write_map(fp, this.map_fg);
      fp.write_uint32(this.bg_width);
      fp.write_uint32(this.bg_height);
      write_map(fp, this.map_bg);
      this.write_options(fp);
      this.write_objects(fp, objs);
      write_lights(fp);
      this.write_links(fp, objs, players);
      if (save_all) {
        this.write_player_info(fp, objs);
        this.write_thumb_nail(fp, G.screen);
      }
      fp.close();
    } else {
      G.the_game.show_help('Unable to open file for saving.\n');
      return 0;
    }
    return 1;
  }

  // ------------------------------------------------------------------ the object list
  add_object(new_guy: game_object): void {
    this.total_objs++;
    new_guy.next = null;
    if (figures[new_guy.otype].get_cflag(CFLAG_ADD_FRONT)) {
      if (!this.first) this.first = new_guy;
      else this.last!.next = new_guy;
      this.last = new_guy;
    } else {
      if (!this.first) this.last = this.first = new_guy;
      else {
        new_guy.next = this.first;
        this.first = new_guy;
      }
    }
  }

  add_object_after(new_guy: game_object, who: game_object | null): void {
    if (!who) this.add_object(new_guy);
    else {
      this.total_objs++;
      if (who === this.last) this.last = new_guy;
      new_guy.next = who.next;
      who.next = new_guy;
    }
  }

  delete_object(who: game_object): void {
    this.remove_object(who);
    who.clean_up();
  }

  remove_block(who: game_object): void {
    // the original steps its pointer past the entry it removes and so skips the next one
    let o = 0;
    for (let i = 0; i < this.block_total; i++) {
      if (this.block_list[o] === who) {
        this.block_total--;
        o++;
        for (let j = i; j < this.block_total; j++) this.block_list[j] = this.block_list[j + 1];
      } else o++;
    }
  }

  remove_all_block(who: game_object): void {
    let o = 0;
    for (let i = 0; i < this.all_block_total; i++) {
      if (this.all_block_list[o] === who) {
        this.all_block_total--;
        o++;
        for (let j = i; j < this.all_block_total; j++) this.all_block_list[j] = this.all_block_list[j + 1];
      } else o++;
    }
  }

  remove_object(who: game_object): void {
    if (level_hooks.notify_deleted_object) level_hooks.notify_deleted_object(who);
    if (who === this.first) {
      if (who === this.last) this.last = null;
      this.first = this.first.next;
    } else {
      let o = this.first;
      for (; o && o.next !== who; o = o.next);
      if (o) {
        o.next = who.next;
        if (!o.next) this.last = o;
      } else return;
    }
    this.total_objs--;
    if (this.first_active === who) this.first_active = who.next_active;
    else {
      let o = this.first_active;
      for (; o && o.next_active !== who; o = o.next_active);
      if (o) o.next_active = who.next_active;
    }
    if (who.flags() & KNOWN_FLAG) {
      for (let o = this.first; o; o = o.next) {
        let t = o.total_objects();
        for (let i = 0; i < t; i++)
          if (o.get_object(i) === who) {
            o.remove_object(who);
            t = o.total_objects();
          }
      }
    }
    if (who.otype < 0xffff) {
      if (who.can_block()) {
        this.remove_block(who);
        this.remove_all_block(who);
      } else if (who.hurtable()) this.remove_all_block(who);
    }
    let t = who.total_objects();
    while (t) {
      who.remove_object(who.get_object(0));
      t--;
    }
    t = who.total_lights();
    while (t) {
      who.remove_light(who.get_light(0));
      t--;
    }
  }

  to_front(o: game_object): void {
    if (o === this.last) return;
    this.first_active = null;
    if (o === this.first) this.first = this.first.next;
    else {
      let w = this.first;
      for (; w && w.next !== o; w = w.next);
      if (!w) return;
      w.next = o.next;
    }
    this.last!.next = o;
    o.next = null;
    this.last = o;
  }

  to_back(o: game_object): void {
    if (o === this.first) return;
    this.first_active = null;
    let w = this.first;
    for (; w && w.next !== o; w = w.next);
    if (!w) return;
    if (this.last === o) this.last = w;
    w.next = o.next;
    o.next = this.first;
    this.first = o;
  }

  find_object(x: number, y: number): game_object | null {
    for (let o = this.first; o; o = o.next) {
      const [x1, y1, x2, y2] = o.picture_space();
      if (x < x2 && x >= x1 && y < y2 && y >= y1) return o;
    }
    return null;
  }

  /** foreground_intersect(x1, y1, &x2, &y2): returns [x2, y2] */
  foreground_intersect(x1: number, y1: number, x2: number, y2: number): [number, number] {
    const tl = G.f_wid, th = G.f_hi;
    const remapx = (x: number): number => (x === 0 ? -1 : x === tl - 1 ? tl + 1 : x);
    const remapy = (y: number): number => (y === 0 ? -1 : y === th - 1 ? th + 1 : y);
    let blockx1 = x1, blocky1 = y1, blockx2 = x2, blocky2 = y2, swap: number;
    if (blockx1 > blockx2) { swap = blockx1; blockx1 = blockx2; blockx2 = swap; }
    if (blocky1 > blocky2) { swap = blocky1; blocky1 = blocky2; blocky2 = swap; }
    blockx1 = (((blockx1 - 2) / tl) | 0) - 1;
    blockx2 = (((blockx2 + tl + 2) / tl) | 0) + 1;
    blocky1 = (((blocky1 - 2) / th) | 0) - 1;
    blocky2 = (((blocky2 + th + 2) / th) | 0) + 1;
    if (blockx2 >= this.fg_width) x2 = tl * this.fg_width - 1;
    if (blocky2 >= this.fg_height) y2 = th * this.fg_height - 1;
    blockx1 = Math.max(blockx1, 0);
    blocky1 = Math.max(blocky1, 0);
    if (blockx1 > blockx2 || blocky1 > blocky2) return [x2, y2];
    for (let bx = blockx1; bx <= blockx2; bx++) {
      for (let by = blocky1; by <= blocky2; by++) {
        const block = this.get_fg(bx, by);
        if (block > 0) {
          const f = G.the_game.get_fg(block);
          const bl = f.points;
          const total = bl.tot;
          const bd = bl.data, ins = bl.inside;
          const xo = bx * tl, yo = by * th;
          for (let j = 0, b = 0; j < total - 1; j++) {
            const xp1 = xo + remapx(bd[b]);
            b++;
            const yp1 = yo + remapy(bd[b]);
            b++;
            const xp2 = xo + remapx(bd[b]);
            const yp2 = yo + remapy(bd[b + 1]);
            const ox2 = x2, oy2 = y2;
            [, x2, y2] = setback_intersect(x1, y1, x2, y2, xp1, yp1, xp2, yp2, ins[j] ? 1 : -1);
            if (ox2 !== x2 || oy2 !== y2) {
              L.last_tile_hit_x = bx;
              L.last_tile_hit_y = by;
            }
          }
        }
      }
    }
    return [x2, y2];
  }

  send_signal(_signal: number): void {}

  crush(by_who: game_object, xamount: number, yamount: number): number {
    let crushed = 0;
    for (let o = this.first_active; o; o = o.next_active) {
      if (o.hurtable() && o !== by_who) {
        let xv = -xamount, yv = -yamount;
        let hit: game_object | null;
        [hit, xv, yv] = o.try_move(o.x, o.y, xv, yv, 3);
        if (hit === by_who) {
          xv = xamount;
          yv = yamount;
          [, xv, yv] = o.try_move(o.x, o.y, xv, yv, 3);
          if (xv === 0 && yv === 0) {
            if (o.state !== dead && o.state !== dieing) o.do_damage(by_who.current_figure().hit_damage, by_who, o.x, o.y, 0, 0);
            crushed = 1;
          }
        }
      }
    }
    return crushed;
  }

  platform_push(by_who: game_object, xamount: number, yamount: number): number {
    let failed = 0;
    for (let o = this.first_active; o; o = o.next_active) {
      if (o.is_playable() && o.state !== dieing && o.state !== dead) {
        if (yamount < 0) {
          let tvx = -xamount, tvy = -yamount;
          let hit: game_object | null;
          [hit, tvx, tvy] = o.try_move(o.x, o.y, tvx, tvy, 1);
          if (hit === by_who) {
            o.x = o.x + tvx;
            o.y = o.y + tvy;
          }
        }
        let xv = 0, yv = 2;
        let hit: game_object | null;
        [hit, xv, yv] = o.try_move(o.x, o.y, xv, yv, 1);
        if (hit === by_who) {
          by_who.x = -by_who.x;
          xv = xamount;
          yv = yamount;
          [, xv, yv] = o.try_move(o.x, o.y, xv, yv, 3);
          if (xv !== xamount || yv !== yamount) failed = 1;
          o.x = o.x + xv;
          o.y = o.y + yv;
          by_who.x = -by_who.x;
        }
      }
    }
    return failed ? 0 : 1;
  }

  push_characters(by_who: game_object, xamount: number, yamount: number): number {
    let failed = 0;
    for (let o = this.first_active; o; o = o.next_active) {
      if ((o.is_playable() || o.pushable()) && o.state !== dieing && o.state !== dead) {
        let xv = -xamount, yv = -yamount;
        let tvx: number, tvy = 0;
        if (xv > 0) tvx = xv + 1;
        else if (xv < 0) tvx = xv - 1;
        else tvx = 0;
        if (yv > 0) tvy = yv + 1;
        else if (yv < 0) tvx = yv - 1;
        else tvy = 0;
        let hit: game_object | null;
        [hit, tvx, tvy] = o.try_move(o.x + xamount, o.y + yamount, tvx, tvy, 3);
        if (hit === by_who) {
          xv = xamount - tvx;
          yv = yamount - tvy;
          [, xv, yv] = o.try_move(o.x, o.y, xv, yv, 3);
          o.x = o.x + xv;
          o.y = o.y + yv;
          if (xv !== xamount - tvx || yv !== yamount - tvy) failed = 1;
        }
      }
    }
    return failed ? 0 : 1;
  }

  find_xrange(x: number, y: number, type: number, xd: number): game_object | null {
    let find_ydist = 100000;
    let find: game_object | null = null;
    for (let o = this.first_active; o; o = o.next_active) {
      if (o.otype === type) {
        const x_dist = Math.abs(x - o.x), y_dist = Math.abs(y - o.y);
        if (x_dist < xd && y_dist < find_ydist) {
          find_ydist = y_dist;
          find = o;
        }
      }
    }
    return find;
  }

  find_xclosest(x: number, y: number, type: number, who: game_object | null): game_object | null {
    let find_ydist = 100000, find_xdist = 0xffffff;
    let find: game_object | null = null;
    for (let o = this.first_active; o; o = o.next_active) {
      if (o.otype === type && o !== who) {
        const x_dist = Math.abs(x - o.x);
        if (x_dist < find_xdist) {
          find_xdist = x_dist;
          find_ydist = Math.abs(y - o.y);
          find = o;
        } else if (x_dist === find_xdist) {
          const y_dist = Math.abs(y - o.y);
          if (y_dist < find_ydist) {
            find_ydist = y_dist;
            find = o;
          }
        }
      }
    }
    return find;
  }

  find_closest(x: number, y: number, type: number, who: game_object | null): game_object | null {
    let find_dist = 100000;
    let find: game_object | null = null;
    for (let o = this.first_active; o; o = o.next_active) {
      if (o.otype === type && o !== who) {
        const d = (Math.imul(x - o.x, x - o.x) + Math.imul(y - o.y, y - o.y)) | 0;
        if (d < find_dist) {
          find = o;
          find_dist = d;
        }
      }
    }
    return find;
  }

  remove_light(which: light_source): void {
    if (which.known) {
      for (let o = this.first; o; o = o.next) {
        const t = o.total_lights();
        for (let i = 0; i < t; i++) if (o.lights[i] === which) o.remove_light(o.lights[i]);
      }
    }
    delete_light(which);
  }

  find_type(type: number, skip: number): game_object | null {
    let l: game_object | null = null;
    for (let o = this.first; o; o = o.next) {
      if (o.otype === type) {
        if (!skip) return o;
        skip--;
        l = o;
      }
    }
    return l;
  }

  hurt_radius(x: number, y: number, r: number, m: number, from: game_object, exclude: game_object | null, max_push: number): void {
    if (r < 1) return;
    for (let o = this.first_active; o; o = o.next_active) {
      if (o !== exclude && o.hurtable()) {
        const y1 = o.y, y2 = (o.y - o.picture().h) | 0;
        const cx = Math.abs(o.x - x), cy1 = Math.abs(y1 - y), cy2 = Math.abs(y2 - y);
        let d1 = cx < cy1 ? cx + cy1 - (cx >> 1) : cx + cy1 - (cy1 >> 1);
        const d2 = cx < cy2 ? cx + cy2 - (cx >> 1) : cx + cy2 - (cy2 >> 1);
        if (d2 < d1) d1 = d2;
        if (d1 < r) {
          let px = (Math.imul(r - cx, max_push) / r) | 0, py = (Math.imul(r - cy1, max_push) / r) | 0;
          if (o.x < x) px = -px;
          if (o.y < y) py = -py;
          o.do_damage((Math.imul(r - d1, m) / r) | 0, from, x, y1, px, py);
        }
      }
    }
  }

  get_random_start(min_player_dist: number, exclude: view | null): game_object | null {
    let t = 0;
    let o: game_object | null = this.first;
    for (; o; o = o.next) if (o.otype === L.start_position_type) t++;
    if (t === 0) return null;
    let retries = t;
    do {
      let ctry = jrandom(t) + 1;
      for (let n = this.first; ctry && n; n = n.next) {
        if (n.otype === L.start_position_type) {
          o = n;
          ctry--;
        }
      }
      let too_close = 0;
      for (let v = L.player_list; v; v = v.next) {
        if (v !== exclude) {
          const cx = Math.abs(v.x_center() - o!.x), cy = Math.abs(v.y_center() - o!.y);
          const d = cx < cy ? cx + cy - (cx >> 1) : cx + cy - (cy >> 1);
          if (d < min_player_dist) too_close = 1;
        }
      }
      if (too_close) retries--;
      else retries = 0;
    } while (retries);
    return o;
  }

  insert_players(): void {
    let start = 0;
    for (let i = 0; i < figures.length; i++) if (object_names[i] === 'START') start = i;
    for (let f = L.player_list; f; f = f.next) {
      const st = this.find_type(start, f.player_number);
      if (st) {
        f.focus!.x = st.x;
        f.focus!.y = st.y;
      }
      this.add_object_after(f.focus!, st);
    }
  }

  add_attacker(who: game_object): void { this.attack_list[this.attack_total++] = who; }
  add_target(who: game_object): void { this.target_list[this.target_total++] = who; }
  add_block(who: game_object): void { this.block_list[this.block_total++] = who; }
  add_all_block(who: game_object): void { this.all_block_list[this.all_block_total++] = who; }

  find_object_in_area(x: number, y: number, x1: number, y1: number, x2: number, y2: number, list: LObj, exclude: game_object | null): game_object | null {
    let closest: game_object | null = null;
    let closest_distance = 0xfffffff;
    for (let o = this.first_active; o; o = o.next_active) {
      const [xp1, yp1, xp2, yp2] = o.picture_space();
      if (!(xp1 > x2 || xp2 < x1 || yp1 > y2 || yp2 < y1) && o !== exclude) {
        let v = list;
        for (; !NILP(v) && lnumber_value(CAR(v)) !== o.otype; v = CDR(v));
        if (!NILP(v)) {
          const xo = Math.abs(o.x - x), yo = Math.abs(o.y - y);
          const distance = (Math.imul(xo, xo) + Math.imul(yo, yo)) | 0;
          if (distance < closest_distance) {
            closest_distance = distance;
            closest = o;
          }
        }
      }
    }
    return closest;
  }

  find_object_in_angle(x: number, y: number, start_angle: number, end_angle: number, list: LObj, exclude: game_object | null): game_object | null {
    let closest: game_object | null = null;
    let closest_distance = 0xfffffff;
    for (let o = this.first_active; o; o = o.next_active) {
      const angle = lisp_atan2((o.y - y) | 0, (o.x - x) | 0);
      if (((start_angle <= end_angle && angle >= start_angle && angle <= end_angle) ||
           (start_angle > end_angle && (angle >= start_angle || angle <= end_angle))) && o !== exclude) {
        let v = list;
        for (; !NILP(v) && lnumber_value(CAR(v)) !== o.otype; v = CDR(v));
        if (!NILP(v)) {
          const xo = Math.abs(o.x - x), yo = Math.abs(o.y - y);
          const distance = (Math.imul(xo, xo) + Math.imul(yo, yo)) | 0;
          if (distance < closest_distance) {
            closest_distance = distance;
            closest = o;
          }
        }
      }
    }
    return closest;
  }

  make_not_list(list: object_node | null): object_node | null {
    let f: object_node | null = null, l: object_node | null = null;
    for (let o = this.first; o; o = o.next) {
      if (!object_to_number_in_list(o, list)) {
        const q = new object_node(o, null);
        if (f) l!.next = q;
        else f = q;
        l = q;
      }
    }
    return f;
  }

  set_size(w: number, h: number): void {
    if (w * h > 200000) {
      G.the_game.show_help(level_hooks.symbol_str('too_big'));
      return;
    }
    const new_fg = new Uint16Array(w * h);
    const miny = h < this.fg_height ? h : this.fg_height, minx = w < this.fg_width ? w : this.fg_width;
    const [nbw, nbh] = calc_bgsize(w, h);
    const new_bg = new Uint16Array(nbw * nbh);
    for (let y = 0; y < miny; y++) for (let x = 0; x < minx; x++) new_fg[x + y * w] = this.get_fg(x, y);
    const mby = nbh < this.bg_height ? nbh : this.bg_height, mbx = nbw < this.bg_width ? nbw : this.bg_width;
    for (let y = 0; y < mby; y++) for (let x = 0; x < mbx; x++) new_bg[x + y * nbw] = this.get_bg(x, y);
    this.map_fg = new_fg;
    this.map_bg = new_bg;
    this.fg_width = w;
    this.fg_height = h;
    this.bg_height = nbh;
    this.bg_width = nbw;
    G.the_game.show_help(`Level ${this.name()} size now ${w} ${h}\n`);
  }
}

/** the status manager while a level loads (level.cpp's stack_stat / stat_man) */
export const level_status = { push: (_s: string): void => {}, update: (_p: number): void => {}, pop: (): void => {} };

export function calc_bgsize(fgw: number, fgh: number): [number, number] {
  return [((fgw / ASPECT) | 0) + 8, ((fgh / ASPECT) | 0) + 8];
}

function read_cstr(fp: bFILE, len: number): string {
  const b = fp.read_bytes(len);
  let s = '';
  for (let i = 0; i < b.length && b[i]; i++) s += String.fromCharCode(b[i]);
  return s;
}

function write_cstr(fp: bFILE, s: string): void {
  fp.write_uint8((s.length + 1) & 0xff);
  const b = new Uint8Array(s.length + 1);
  for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i) & 0xff;
  fp.write(b, b.length);
}

function read_map(fp: bFILE, n: number): Uint16Array {
  const b = fp.read_bytes(n * 2);
  const m = new Uint16Array(n);
  for (let i = 0; i < n; i++) m[i] = (b[i * 2] ?? 0) | ((b[i * 2 + 1] ?? 0) << 8);
  return m;
}

function write_map(fp: bFILE, m: Uint16Array): void {
  const b = new Uint8Array(m.length * 2);
  for (let i = 0; i < m.length; i++) {
    b[i * 2] = m[i] & 0xff;
    b[i * 2 + 1] = m[i] >> 8;
  }
  fp.write(b, b.length);
}

/** get_prof_assoc_filename: the name with its extension replaced by "cpf" */
export function get_prof_assoc_filename(filename: string): string {
  const dot = filename.lastIndexOf('.');
  return (dot >= 0 ? filename.slice(0, dot + 1) : filename) + 'cpf';
}

/** strftime("%T %A %B %d", localtime(time(NULL))): the save's time */
export const thumb_clock = { now: (): Date => new Date(platform().time() * 1000) };
function thumb_time(): string {
  const d = thumb_clock.now();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const p = (n: number): string => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())} ${days[d.getDay()]} ${months[d.getMonth()]} ${p(d.getDate())}`;
}

export { jFILE, MAX_STATE, state_names, find_or_create, SEEK_SET };
export type { LSymbol };
