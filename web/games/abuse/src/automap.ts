// automap.cpp: the map window ('a' while playing): the seen foreground tiles around the player
import type { Jwindow } from './imlib/jwindow.ts';
import { event, EV_CLOSE_WINDOW, EV_KEY } from './imlib/event.ts';
import type { level } from './level.ts';
import { AUTOTILE_HEIGHT, AUTOTILE_WIDTH } from './items.ts';
import { cache } from './cache.ts';
import { G } from './globals.ts';

/** C division of longs (truncates toward zero) */
const div = (a: number, b: number): number => Math.trunc(a / b);

export class automap {
  automap_window: Jwindow | null;
  cur_lev: level;
  /** used to draw your position as a blinking spot */
  tick: number;
  w: number;
  h: number;
  old_dx = 0;
  old_dy = 0;

  constructor(l: level, width: number, height: number) {
    this.w = width;
    this.h = height;
    this.tick = 0;
    this.cur_lev = l;
    this.automap_window = null;
    this.toggle_window();
  }

  /** ~automap */
  destroy(): void {
    if (this.automap_window) this.toggle_window();
  }

  draw(): void {
    if (!this.automap_window) return;
    const aw = this.automap_window;
    const screen = aw.screen;
    const f_wid = G.f_wid, f_hi = G.f_hi;

    let x = G.the_game.first_view!.x_center();
    let y = G.the_game.first_view!.y_center();

    const window_xstart = aw.x1();
    const window_ystart = aw.y1();
    const window_xend = aw.x2();
    const window_yend = aw.y2();
    const centerx = div(window_xstart + window_xend, 2);
    const centery = div(window_ystart + window_yend, 2);

    let sx = div(x, f_wid) - div(this.w, 2); // start drawing with this foretile
    let sy = div(y, f_hi) - div(this.h, 2);
    let ex = sx + this.w;
    let ey = sy + this.h;
    let draw_xstart: number, draw_ystart: number;

    if (sx < 0) { // does the map scroll past the left side ?
      sx = 0; // yes, start drawing at 0
      draw_xstart = centerx - div(x * AUTOTILE_WIDTH, f_wid);
    } else draw_xstart = centerx - (div(x * AUTOTILE_WIDTH, f_wid) - sx * AUTOTILE_WIDTH);

    if (sy < 0) {
      sy = 0;
      draw_ystart = centery - div(y * AUTOTILE_HEIGHT, f_hi);
    } else draw_ystart = centery - (div(y * AUTOTILE_HEIGHT, f_hi) - sy * AUTOTILE_HEIGHT);

    // if view position hasn't changed, only update the blinking dot and return
    if (draw_xstart === this.old_dx && draw_ystart === this.old_dy) {
      // Lock()
      aw.screen.AddDirty(centerx, centery, centerx + 1, centery + 1);
      if ((this.tick++) & 4) aw.screen.PutPixel(centerx, centery, 255);
      else aw.screen.PutPixel(centerx, centery, 27);
      // Unlock()
      return;
    }

    this.old_dx = draw_xstart;
    this.old_dy = draw_ystart;

    if (ex >= this.cur_lev.foreground_width()) ex = this.cur_lev.foreground_width() - 1;
    if (ey >= this.cur_lev.foreground_height()) ey = this.cur_lev.foreground_height() - 1;

    screen.bar(window_xstart, window_ystart, draw_xstart, window_yend, 0);
    screen.bar(window_xstart, window_ystart, window_xend, draw_ystart, 0);

    // we are going to redraw the whole map, so make the dirty rect work easier by marking
    // everything dirty
    screen.AddDirty(window_xstart, window_ystart, window_xend + 1, window_yend + 1);

    // the original's put_image calls clip to the window's inside
    screen.SetClip(window_xstart, window_ystart, window_xend + 1, window_yend + 1);

    const map = this.cur_lev.map_fg;
    const fw = this.cur_lev.foreground_width();
    let i: number, j: number;
    for (j = draw_ystart, y = sy; y <= ey; j += AUTOTILE_HEIGHT, y++) {
      let fgline = y * fw + sx; // cur_lev->get_fgline(y) + sx
      for (i = draw_xstart, x = sx; x <= ex; i += AUTOTILE_WIDTH, x++, fgline++) {
        const t = map[fgline];
        if (t & 0x8000) {
          const id = G.foretiles[t & 0x7fff];
          if (id >= 0) cache.foret(id).micro_image.put_image(screen, i, j, 0);
          else cache.foret(G.foretiles[0]).micro_image.put_image(screen, i, j, 0);
        } else screen.bar(i, j, i + AUTOTILE_WIDTH - 1, j + AUTOTILE_HEIGHT - 1, 0);
      }
    }

    // draw the person as a dot, no need to add a dirty because we marked the
    // whole screen already
    if ((this.tick++) & 4) aw.screen.PutPixel(centerx, centery, 255);
    else aw.screen.PutPixel(centerx, centery, 27);

    // set the clip back to full window size because soemthing else could mess with the area
    aw.screen.SetClip(0, 0, screen.Size().x, screen.Size().y);
  }

  toggle_window(): void {
    if (this.automap_window) {
      G.wm.close_window(this.automap_window);
      this.automap_window = null;
    } else {
      this.old_dx = -1000; // make sure the map gets drawn the first time
      this.old_dy = -1000;

      this.automap_window = G.wm.new_window(0, 0, this.w * AUTOTILE_WIDTH, this.h * AUTOTILE_HEIGHT, null, 'Map');
      this.automap_window.screen.bar(17, 1, 17 + 8 * 6 + 3, 6, G.wm.medium_color());
      G.wm.font().put_string(this.automap_window.screen, 20, 2, 'Automap', G.wm.dark_color());
      this.draw();
    }
  }

  handle_event(ev: event): void {
    //only respond to stuff in our window or on the main screen
    if (ev.window === null || ev.window === this.automap_window) {
      switch (ev.type) {
        case EV_KEY:
          switch (ev.key) {
            case 65: // 'A'
            case 97: // 'a'
              this.toggle_window();
              break;
          }
          break;
        case EV_CLOSE_WINDOW:
          // close_window(NULL) is delete NULL in the original: nothing happens
          if (this.automap_window) G.wm.close_window(this.automap_window);
          this.automap_window = null;
          break;
      }
    }
  }
}

/** automap *current_automap (game.cpp sets it to NULL; clisp.cpp makes one) */
export const AM = { current_automap: null as automap | null };
