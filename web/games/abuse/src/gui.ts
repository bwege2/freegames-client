// gui.cpp: icon buttons (the main menu's, the save slots') and the switch button that cycles
// through a list of them (the difficulty icon)
import { ifield, InputManager } from './imlib/jwindow.ts';
import type { image } from './imlib/image.ts';
import { event, EV_KEY, EV_MOUSE_BUTTON } from './imlib/event.ts';
import { cache } from './cache.ts';
import { G } from './globals.ts';
import { S } from './sdlport/sound.ts';
import { symbol_str } from './clisp.ts';
import { S_BUTTON_PRESS_SND } from './compiled.ts';

export class ico_button extends ifield {
  up: number;
  act: number;
  u: number;
  d: number;
  ua: number;
  da: number;
  /** sent when not -1 when the object receives a draw active */
  activate_id: number;
  /** char key[16]: the help symbol, at most 15 characters ('' = none) */
  key: string;

  constructor(X: number, Y: number, ID: number, Up: number, down: number, upa: number, downa: number, Next: ifield | null,
    act_id = -1, help_key: string | null = null) {
    super();
    if (help_key !== null) {
      // strncpy(key, help_key, 15); key[15] = 0
      let k = help_key.slice(0, 15);
      const z = k.indexOf('\0');
      if (z >= 0) k = k.slice(0, z);
      this.key = k;
    } else this.key = '';
    this.up = 1;
    this.x = X;
    this.y = Y;
    this.id = ID;
    this.u = Up;
    this.d = down;
    this.ua = upa;
    this.da = downa;
    this.next = Next;
    this.activate_id = act_id;
    this.act = 0;
  }

  set_act_id(id: number): void {
    this.activate_id = id;
  }

  area(): [number, number, number, number] {
    const x1 = this.x, y1 = this.y;
    const x2 = this.x + cache.img(this.u).Size().x - 1;
    const y2 = this.y + cache.img(this.u).Size().y - 1;
    return [x1, y1, x2, y2];
  }

  draw_first(screen: image): void { this.draw(0, screen); }

  draw(active: number, screen: image): void {
    const [x1, y1] = this.area();

    if (active !== this.act && this.activate_id !== -1 && active) G.wm.push_event(event.msg(this.activate_id, null));

    if (this.up && !active) cache.img(this.u).put_image(screen, x1, y1);
    else if (this.up && active) cache.img(this.ua).put_image(screen, x1, y1);
    else if (!this.up && !active) cache.img(this.d).put_image(screen, x1, y1);
    else cache.img(this.da).put_image(screen, x1, y1);

    // the same test again: the original pushes the activate message twice
    if (this.act !== active && active && this.activate_id !== -1) G.wm.push_event(event.msg(this.activate_id, null));
    this.act = active;

    if (active && this.key.length) {
      const g = 80;
      screen.bar(0, 0, 144, 20, 0);
      G.wm.font().put_string(screen, 0, 0, symbol_str(this.key), G.color_table.Lookup(g >> 3, g >> 3, g >> 3));
    } else if (!active && this.key.length) {
      screen.bar(0, 0, 144, 20, 0);
    }
  }

  handle_event(ev: event, screen: image, _im: InputManager): void {
    if ((ev.type === EV_KEY && ev.key === 13) || (ev.type === EV_MOUSE_BUTTON && ev.mouse_button)) {
      this.area(); // int x1, y1, x2, y2; area(x1, y1, x2, y2): computed and not used
      this.up = this.up ? 0 : 1;
      this.draw(this.act, screen);
      G.wm.push_event(event.msg(this.id, this));
      if (S_BUTTON_PRESS_SND) cache.sfx(S_BUTTON_PRESS_SND).play(S.sfx_volume);
    }
  }

  /** char *read() { return (char *)&up; }: nobody reads it; the button stands for its state */
  read(): unknown { return this; }
  set_xy(X: number, Y: number): void {
    this.x = X;
    this.y = Y;
  }
  X(): number { return this.x; }
  Y(): number { return this.y; }
  status(): number { return this.up; }
}

export class ico_switch_button extends ifield {
  blist: ifield | null;
  cur_but: ifield | null;
  act: number;

  constructor(X: number, Y: number, ID: number, start_on: number, butts: ifield | null, Next: ifield | null) {
    super();
    this.x = X;
    this.y = Y;
    this.id = ID;
    this.next = Next;
    this.blist = this.cur_but = butts;
    this.act = 0;
    for (let b = this.blist; b; b = b.next) {
      b.x = this.x;
      b.y = this.y;
    }
    while (this.cur_but && start_on--) this.cur_but = this.cur_but.next;
    if (!this.cur_but) this.cur_but = this.blist;
  }

  area(): [number, number, number, number] {
    let x1 = 10000, y1 = 10000, x2 = -10000, y2 = -10000;
    for (let b = this.blist; b; b = b.next) {
      const [X1, Y1, X2, Y2] = b.area();
      if (X1 < x1) x1 = X1;
      if (Y1 < y1) y1 = Y1;
      if (X2 > x2) x2 = X2;
      if (Y2 > y2) y2 = Y2;
    }
    if (!this.blist) {
      x1 = x2 = this.x;
      y1 = y2 = this.y;
    }
    return [x1, y1, x2, y2];
  }

  draw_first(screen: image): void { this.cur_but!.draw_first(screen); }
  draw(active: number, screen: image): void {
    this.cur_but!.draw(active, screen);
    this.act = active;
  }

  unlink(id: number): ifield | null {
    let last: ifield | null = null;
    for (let b = this.blist; b; b = b.next) {
      if (b.id === id) {
        if (last) last.next = b.next;
        else this.blist = b.next;
        if (this.cur_but === b) this.cur_but = this.blist;
        return b;
      }
      const x = b.unlink(id);
      if (x) return x;
      last = b;
    }
    return null;
  }

  handle_event(ev: event, screen: image, im: InputManager): void {
    if ((ev.type === EV_KEY && ev.key === 13) || (ev.type === EV_MOUSE_BUTTON && ev.mouse_button)) {
      this.cur_but = this.cur_but!.next;
      if (!this.cur_but) this.cur_but = this.blist;
      this.cur_but!.draw(this.act, screen);
      this.cur_but!.handle_event(ev, screen, im);
    }
  }

  read(): unknown { return this.cur_but!.read(); }
}
