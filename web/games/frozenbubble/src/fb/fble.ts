// FBLE.pm, the level editor of Frozen Bubble 2.2.0 (Kim and David Joham, integrated by Guillaume
// Cottenceau), line by line, with SDL_perl 2.1.2's SFont (Karl Bartel's SFont 1.x) for its bitmap
// font. Levelsets live in ~/.frozen-bubble/levels/ (account storage).
import { Rect } from '../sdl/app.ts';
import { KEYDOWN, MOUSEBUTTONDOWN, MOUSEBUTTONUP, MOUSEMOTION, QUIT, SDLK, type SDLEvent } from '../sdl/events.ts';
import { blitSurface, mapRGB, setAlpha, setColorKey, SRCALPHA, SRCCOLORKEY, type Surface } from '../sdl/video.ts';
import { newSurface } from '../sdl/app.ts';
import { POS_1P, BUBBLE_SIZE0 as BUBBLE_SIZE, ROW_SIZE0 as ROW_SIZE } from './data.ts';
import { difference2, even, int, member, odd, oddn, pnum, sqr } from './perl.ts';
import { KEYSYMS, type FrozenBubble } from './game.ts';

const NUM_ROWS = 10;
const P1 = POS_1P.p1!;
const BOTTOM_LIMIT = P1.top_limit + NUM_ROWS * ROW_SIZE;
POS_1P.bottom_limit = BOTTOM_LIMIT;
const NUM_BUBBLES_AVAIL = 8;
const BUBBLES_PER_ROW = 3;
const BUBBLE_OPTION_SEPARATION = 8;
const BUBBLE_OPTION_INIT_X = 18;
const ALPHA_BUBBLE_NO = 0, ALPHA_BUBBLE_YES = 1;
const WOOD_WIDTH = 150, WOOD_PLANK_HEIGHT = 40;
const LEFT_WOOD_X = 2, RIGHT_WOOD_X = 488;
const BUBBLE_WOOD_Y = 33, NAV_WOOD_Y = 209, LEVELSET_WOOD_Y = 30, LEVEL_WOOD_Y = 249, HELP_WOOD_Y = 428;
const floor = Math.floor, ceil = Math.ceil;

type Level = Record<number, Record<number, string>>;
type LevelSet = Record<number, Level>;

/** SFont: the bitmap font of SDL_perl (the last loaded font is the current one) */
class SFont {
  surface: Surface;
  charPos: number[] = [];
  constructor(surface: Surface) {
    this.surface = surface;
    const s = surface;
    const pink = mapRGB(s.format, 255, 0, 255);
    let x = 0;
    const get = (X: number, Y: number): number => {
      const bpp = s.format.BytesPerPixel;
      if (bpp === 1) return s.pixels[Y * s.pitch + X];
      if (bpp === 4) return s.u32[(Y * s.pitch + X * 4) >> 2];
      const o = Y * s.pitch + X * 3;
      return mapRGB(s.format, s.pixels[o + (s.format.Rshift >> 3)], s.pixels[o + (s.format.Gshift >> 3)], s.pixels[o + (s.format.Bshift >> 3)]);
    };
    while (x < s.w) {
      if (get(x, 0) === pink) {
        this.charPos.push(x);
        while (x < s.w - 1 && get(x, 0) === pink) x++;
        this.charPos.push(x);
      }
      x++;
    }
    setColorKey(s, SRCCOLORKEY, get(0, s.h - 1));
  }
  cp(i: number): number { return this.charPos[i] ?? 0; }
  putString(dst: Surface, x: number, y: number, text: string): void {
    for (let i = 0; i < text.length; i++) {
      const ch = text.charCodeAt(i);
      if (ch === 32) { x += this.cp(2) - this.cp(1); continue; }
      const sc = ch > 127 ? ch - 256 : ch; // C's signed char
      const ofs = (sc - 33) * 2 + 1;
      const w = ((this.cp(ofs + 2) + this.cp(ofs + 1)) >> 1) - ((this.cp(ofs) + this.cp(ofs - 1)) >> 1);
      const src = new Rect(((this.cp(ofs) + this.cp(ofs - 1)) >> 1), 1, w, this.surface.h - 1);
      const dst2 = new Rect(x - (this.cp(ofs) - this.cp(ofs - 1)) / 2, y, w, this.surface.h - 1);
      blitSurface(this.surface, src, dst, dst2);
      x += this.cp(ofs + 1) - this.cp(ofs);
    }
  }
  textWidth(text: string): number {
    let x = 0;
    for (let i = 0; i < text.length; i++) {
      const ch = text.charCodeAt(i);
      if (ch === 32) x += this.cp(2) - this.cp(1);
      else { const ofs = ((ch > 127 ? ch - 256 : ch) - 33) * 2 + 1; x += this.cp(ofs + 1) - this.cp(ofs); }
    }
    return x;
  }
}

export class FBLE {
  private readonly g: FrozenBubble;
  private font!: SFont;
  private bubble_rects: Map<number, Map<number, Rect>> = new Map();
  private bubble_hash: LevelSet = {};
  private color = 1;
  private action = 'add';
  private previousx = -1;
  private previousy = -1;
  private background!: Surface;
  private highlight!: Surface;
  private highlighted_option = '';
  curr_level = 1;
  private displaying_dialog = '';
  private new_ls_name_text = '';
  private surface_dialog!: Surface;
  levelset_name = 'default-levelset';
  private list_browser_file_start_offset = -1;
  private list_browser_highlight_offset = -1;
  private file_browser_levelsets: Record<string, LevelSet> = {};
  private file_browser_levelsets_num_levels: number[] = [];
  private deleted_current_levelset = 0;
  private jump_to_level_value = '';
  private modified_levelset = 0;
  private modified_levelset_action = '';
  private button_hold = 0;
  private rect: Record<string, Rect> = {};
  private start_level: number | null = null;
  private shrinks = new Map<string, Map<number, Surface>>();
  private s_save: Surface | null = null;

  constructor(g: FrozenBubble) { this.g = g; }

  private get app(): Surface { return this.g.app.screen; }
  private img(path: string): Surface { return this.g.host.data.image(`gfx/${path}`); }
  private print(x: number, y: number, text: string): void {
    this.g.host.textHook?.('sfont', this.app, int(x), int(y), text, -1, 'left');
    this.font.putString(this.app, int(x), int(y), text);
  }
  private setFont(name: string): void { this.font = new SFont(this.img(name)); }
  private update(...r: Rect[]): void { this.g.app.update(r); }
  private flip(): void { this.g.app.flip(); }
  private nlevels(): number { return Object.keys(this.bubble_hash).length; }
  private cell(lev: number, col: number, row: number): string | undefined { return this.bubble_hash[lev]?.[col]?.[row]; }
  private setCell(lev: number, col: number, row: number, v: string): void {
    ((this.bubble_hash[lev] ??= {})[col] ??= {})[row] = v;
  }
  private bubbleRect(x: number, y: number): Rect | undefined { return this.bubble_rects.get(x)?.get(y); }
  private setBubbleRect(x: number, y: number, r: Rect): void {
    if (!this.bubble_rects.has(x)) this.bubble_rects.set(x, new Map());
    this.bubble_rects.get(x)!.set(y, r);
  }

  // ------------------------------------------------------------------------- bubbles

  bubble_optionx(col: number): number { return BUBBLE_OPTION_INIT_X + col * (BUBBLE_SIZE + BUBBLE_OPTION_SEPARATION); }
  bubble_optiony(row: number): number { return BUBBLE_WOOD_Y + WOOD_PLANK_HEIGHT + row * (BUBBLE_SIZE + BUBBLE_OPTION_SEPARATION); }

  get_col(x: number, y: number): number {
    if (even(this.get_row(y))) return floor((x - P1.left_limit) / BUBBLE_SIZE);
    if (P1.left_limit + BUBBLE_SIZE / 2 <= x && x < P1.right_limit - BUBBLE_SIZE / 2) return floor((x - (P1.left_limit + BUBBLE_SIZE / 2)) / BUBBLE_SIZE);
    return -1;
  }
  get_row(y: number): number { return floor((y - P1.top_limit) / ROW_SIZE); }

  draw_bubble(id: number, x: number, y: number, alpha: number, surface?: Surface, ignore_update?: number): void {
    const target = surface ?? this.app;
    const bubble = this.img(`balls/bubble-${this.g.colourblind ? 'colourblind-' : ''}${id}.gif`);
    const r = new Rect(x, y, bubble.w, bubble.h);
    this.setBubbleRect(x, y, r);
    if (alpha) setAlpha(bubble, SRCALPHA, 0x66);
    blitSurface(bubble, null, target, r);
    if (!ignore_update && target === this.app) this.update(r);
  }

  erase_bubble(x: number, y: number): void {
    const r = this.bubbleRect(x, y)!;
    blitSurface(this.background, r, this.app, r);
    const D = sqr(BUBBLE_SIZE * 1.1);
    // %bubble_rects's key order (Perl's hash order) is unspecified: numeric order here and in the oracle
    for (const x_ of [...this.bubble_rects.keys()].sort((a, b) => a - b)) {
      for (const y_ of [...this.bubble_rects.get(x_)!.keys()].sort((a, b) => a - b)) {
        if (!(y !== y_ && sqr(x - x_) + sqr(y - y_) <= D)) continue;
        const col = this.get_col(x_, y_), row = this.get_row(y_);
        const v = this.cell(this.curr_level, col, row);
        if (v !== undefined && /^\d+$/.test(v)) this.draw_bubble(pnum(v) + 1, x_, y_, ALPHA_BUBBLE_NO, undefined, 1);
      }
    }
    this.update(this.bubbleRect(x, y)!);
  }

  place_bubble(x: number, y: number, alpha: number, button: number): void {
    const col = this.get_col(x, y), row = this.get_row(y);
    y = row * ROW_SIZE + P1.top_limit;
    if (col === -1) return;
    x = even(row) ? this.get_col(x, y) * BUBBLE_SIZE + P1.left_limit : col * BUBBLE_SIZE + P1.left_limit + BUBBLE_SIZE / 2;
    const prev = (): string | undefined => this.cell(this.curr_level, this.get_col(this.previousx, this.previousy), this.get_row(this.previousy));
    if (this.action === 'erase' || button >= 3) {
      if ((this.previousx !== x || this.previousy !== y) && this.previousx !== -1 && this.previousy !== -1 && prev() !== '-') {
        this.draw_bubble(pnum(prev()) + 1, this.previousx, this.previousy, ALPHA_BUBBLE_NO);
      }
      if (this.bubbleRect(x, y)) {
        if (alpha && this.cell(this.curr_level, col, row) !== '-') {
          if (this.previousx !== x || this.previousy !== y) {
            this.erase_bubble(x, y);
            this.draw_bubble(pnum(this.cell(this.curr_level, col, row)) + 1, x, y, alpha);
          }
          this.previousx = x;
          this.previousy = y;
        } else {
          this.setCell(this.curr_level, col, row, '-');
          this.erase_bubble(x, y);
        }
      }
    } else if (this.action === 'add') {
      if (alpha) {
        if (this.previousx !== x || this.previousy !== y) {
          if (this.previousx !== -1 && this.previousy !== -1) {
            if (prev() === '-') this.erase_bubble(this.previousx, this.previousy);
            else this.draw_bubble(pnum(prev()) + 1, this.previousx, this.previousy, ALPHA_BUBBLE_NO);
          }
          this.draw_bubble(this.color, x, y, alpha);
          this.previousx = x;
          this.previousy = y;
        }
      } else {
        this.setCell(this.curr_level, col, row, String(this.color - 1));
        this.draw_bubble(this.color, x, y, alpha);
      }
    }
  }

  // ------------------------------------------------------------------------- actions routing

  change_color(c: number): void {
    this.color = c;
    this.action = 'add';
    this.draw_bubble(this.color, P1.next_bubble.x + P1.left_limit, P1.next_bubble.y, ALPHA_BUBBLE_NO);
  }

  private printOption(name: string, h: number): void {
    const m = /^(list_arrow_up|list_arrow_down|select_level_arrow_up_more|select_level_arrow_down_more|select_level_arrow_up|select_level_arrow_down)$/.exec(name);
    if (m) {
      if (name.startsWith('list_arrow')) this.print_dialog_list_arrow(h, name === 'list_arrow_up' ? 'up' : 'down');
      else this.print_dialog_select_level_arrow(h, name.replace('select_level_arrow_', ''));
      return;
    }
    const f = (this as unknown as Record<string, (h: number) => void>)[`print_${name}_text`];
    if (f) f.call(this, h);
  }

  highlight_option(option: string, x?: number, y?: number): void {
    this.unhighlight_option(option);
    if (option !== this.highlighted_option) {
      this.highlighted_option = option;
      option = option.replace(/bubble-(\d+)/, '$1');
      const n = /^\d+$/.test(option) ? pnum(option) : 0;
      if (0 < n && n <= NUM_BUBBLES_AVAIL) {
        blitSurface(this.highlight, this.rect.bubble_option_highlight, this.app, this.bubbleRect(x!, y!)!);
        this.update(this.bubbleRect(x!, y!)!);
      } else if (option === 'erase') {
        blitSurface(this.highlight, this.rect.bubble_option_highlight, this.app, this.rect.erase);
        this.update(this.rect.erase);
      } else if (/arrow/.test(option)) {
        this.printOption(option.replace(/^/, ''), 1);
      } else {
        this.printOption(option, 1);
      }
    }
  }

  unhighlight_option(no_highlight?: string): void {
    if (this.highlighted_option !== '' && this.highlighted_option !== no_highlight) {
      this.highlighted_option = this.highlighted_option.replace(/bubble-(\d+)/, '$1');
      const h = this.highlighted_option;
      const n = /^\d+$/.test(h) ? pnum(h) : 0;
      if (0 < n && n <= NUM_BUBBLES_AVAIL) {
        const col = (n - 1) % BUBBLES_PER_ROW, row = floor((n - 1) / BUBBLES_PER_ROW);
        const r = this.bubbleRect(this.bubble_optionx(col), this.bubble_optiony(row))!;
        blitSurface(this.background, r, this.app, r);
        this.update(r);
        this.add_bubble_option(n, col, row);
      } else if (h === 'erase') {
        blitSurface(this.background, this.rect.erase, this.app, this.rect.erase);
        this.update(this.rect.erase);
        this.add_erase_option();
      } else this.printOption(h, 0);
      this.highlighted_option = '';
    }
  }

  async choose_action(x: number, y: number, caller: string, button: number): Promise<void> {
    if (P1.left_limit <= x && x < P1.right_limit && P1.top_limit <= y && y < BOTTOM_LIMIT) {
      if (caller === 'motion' && this.button_hold === 0) this.place_bubble(x, y, ALPHA_BUBBLE_YES, button);
      else { this.place_bubble(x, y, ALPHA_BUBBLE_NO, button); this.modified_levelset = 1; }
    } else if (this.previousx !== -1 && this.previousy !== -1) {
      const v = this.cell(this.curr_level, this.get_col(this.previousx, this.previousy), this.get_row(this.previousy));
      if (v === '-') this.erase_bubble(this.previousx, this.previousy);
      else this.draw_bubble(pnum(v) + 1, this.previousx, this.previousy, ALPHA_BUBBLE_NO);
      this.previousx = -1;
      this.previousy = -1;
    }

    const r = this.rect;
    if (y >= BUBBLE_WOOD_Y + WOOD_PLANK_HEIGHT && y <= BUBBLE_WOOD_Y + 4 * WOOD_PLANK_HEIGHT
        && x > BUBBLE_OPTION_INIT_X - BUBBLE_OPTION_SEPARATION / 2
        && x <= BUBBLE_OPTION_INIT_X + BUBBLES_PER_ROW * (BUBBLE_SIZE + BUBBLE_OPTION_SEPARATION) - BUBBLE_OPTION_SEPARATION / 2) {
      const col = ceil((x - BUBBLE_OPTION_INIT_X + BUBBLE_OPTION_SEPARATION / 2) / (BUBBLE_SIZE + BUBBLE_OPTION_SEPARATION));
      const row = ceil((y - (BUBBLE_WOOD_Y + WOOD_PLANK_HEIGHT) + BUBBLE_OPTION_SEPARATION / 2) / (BUBBLE_SIZE + BUBBLE_OPTION_SEPARATION));
      const c = BUBBLES_PER_ROW * (row - 1) + col;
      if (0 < c && c <= NUM_BUBBLES_AVAIL) {
        this.highlight_option(`bubble-${c}`, this.bubble_optionx(col - 1), this.bubble_optiony(row - 1));
        if (caller === 'button') this.change_color(c);
      } else if (c === NUM_BUBBLES_AVAIL + 1) {
        this.highlight_option('erase');
        if (caller === 'button') {
          this.action = 'erase';
          this.erase_bubble(P1.next_bubble.x + P1.left_limit, P1.next_bubble.y);
        }
      }
    } else if (LEFT_WOOD_X <= x && x <= WOOD_WIDTH && r.prev.y <= y && y <= r.last.y + r.last.h) {
      const n = this.nlevels();
      const nav = [
        { name: 'prev', un: this.curr_level === 1, act: () => { if (this.curr_level !== 1) { this.prev_level(); if (this.curr_level === 1) this.unhighlight_option(); } } },
        { name: 'next', un: this.curr_level === n, act: () => { if (this.curr_level !== this.nlevels()) { this.next_level(); if (this.curr_level === this.nlevels()) this.unhighlight_option(); } } },
        { name: 'first', un: this.curr_level === 1, act: () => { if (this.curr_level !== 1) { this.first_level(); this.unhighlight_option(); } } },
        { name: 'last', un: this.curr_level === n, act: () => { if (this.curr_level !== this.nlevels()) { this.last_level(); this.unhighlight_option(); } } },
      ];
      for (const o of nav) {
        if (r[o.name].y <= y && y <= r[o.name].y + r[o.name].h) {
          if (o.un) this.unhighlight_option(); else this.highlight_option(o.name);
          if (caller === 'button') o.act();
        }
      }
    } else if (RIGHT_WOOD_X <= x && x <= RIGHT_WOOD_X + WOOD_WIDTH && y >= r.ls_new.y && y <= r.ls_delete.y + r.ls_delete.h) {
      const ls: [string, () => void][] = [['ls_new', () => this.create_new_levelset_dialog()], ['ls_open', () => this.create_open_levelset_dialog()],
        ['ls_save', () => this.save_file()], ['ls_delete', () => this.create_delete_levelset_dialog()]];
      for (const [name, act] of ls) {
        if (y >= r[name].y && y <= r[name].y + r[name].h) { this.highlight_option(name); if (caller === 'button') act(); }
      }
    } else if (RIGHT_WOOD_X <= x && x <= RIGHT_WOOD_X + WOOD_WIDTH && y >= r.lvl_insert.y && y <= r.lvl_delete.y + r.lvl_delete.h) {
      const lv: [string, () => void][] = [['lvl_insert', () => this.insert_level()], ['lvl_append', () => this.append_level()],
        ['lvl_delete', () => { this.delete_level(); this.load_level(); }]];
      for (const [name, act] of lv) {
        if (y >= r[name].y && y <= r[name].y + r[name].h) { this.highlight_option(name); if (caller === 'button') act(); }
      }
    } else if (RIGHT_WOOD_X <= x && x <= RIGHT_WOOD_X + WOOD_WIDTH && y >= r.help.y && y <= r.help.y + r.help.h) {
      if (caller === 'button') this.create_help_dialog(); else this.highlight_option('help');
    } else {
      this.unhighlight_option();
    }
  }

  get_levelset_list(): string[] {
    let l = this.g.host.home.list('levels').sort();
    if (this.displaying_dialog === 'ls_delete') l = difference2(l, ['default-levelset']);
    return l;
  }

  private betw(v: number, min: number, max: number): boolean { return v > min && v < max; }

  async choose_dialog_action(x: number, y: number, caller: string, event?: SDLEvent): Promise<number | undefined> {
    const tmp = this.img('list_arrow_up.png');
    const r = this.rect;
    r.middle = this.get_dialog_rect();
    const dd = this.displaying_dialog;
    const okOnly = ['help', 'ls_play', 'ls_play_choose_level', 'ls_nothing_to_delete', 'ls_open_ok_only', 'ls_new_ok_only'];
    if (this.betw(x, r.middle.x, r.middle.x + r.middle.w / 2) && this.betw(y, r.middle.y + 6 * WOOD_PLANK_HEIGHT, r.middle.y + r.middle.h)) {
      if (member(dd, okOnly)) { this.unhighlight_option(); return 1; }
      if (dd === 'jump') {
        if (this.is_ok_jump_value() === 1) this.highlight_option('ok'); else { this.unhighlight_option('ok'); return 1; }
      }
      if (dd === 'ls_new') {
        if (this.is_ok_filename() === 1) this.highlight_option('ok'); else { this.unhighlight_option('ok'); return 1; }
      }
      if (this.displaying_dialog !== 'ls_new') this.highlight_option('ok');
      if (caller === 'button') {
        if (this.displaying_dialog === 'ls_new' && this.is_ok_filename() === 1) { this.remove_dialog(); this.create_new_levelset(); }
        else if (this.displaying_dialog === 'jump' && this.is_ok_jump_value() === 1) { this.remove_dialog(); this.jump_to_level(pnum(this.jump_to_level_value)); }
        else if (this.displaying_dialog === 'ls_open') this.open_levelset();
        else if (this.displaying_dialog === 'ls_delete') this.delete_levelset();
        else if (this.displaying_dialog === 'ls_deleted_current') this.create_open_levelset_dialog_ok_only();
        else if (this.displaying_dialog === 'ls_save_changes') { this.save_file(); this.displaying_dialog = ''; this.evalAction(); }
      }
    } else if (this.betw(x, r.middle.x + r.middle.w / 2, r.middle.x + r.middle.w) && this.betw(y, r.middle.y + 6 * WOOD_PLANK_HEIGHT, r.middle.y + r.middle.h)) {
      if (member(this.displaying_dialog, okOnly)) {
        if (this.displaying_dialog === 'ls_new_ok_only' && this.is_ok_filename() === 1) this.highlight_option('ok_right');
        else this.unhighlight_option('ok_right');
        if (this.displaying_dialog === 'ls_nothing_to_delete') {
          this.highlight_option('ok_right');
          if (caller === 'button') { this.displaying_dialog = ''; this.remove_dialog(); }
        }
        if (this.displaying_dialog !== 'ls_new_ok_only') this.highlight_option('ok_right');
        if (caller === 'button') {
          if (this.displaying_dialog === 'help') { this.displaying_dialog = ''; this.remove_dialog(); }
          if (member(this.displaying_dialog, ['ls_play', 'ls_play_choose_level'])) {
            const l = this.get_levelset_list();
            this.modified_levelset_action = `return ${l[this.list_browser_highlight_offset]}`;
            return 1;
          } else if (this.displaying_dialog === 'ls_open_ok_only') {
            this.remove_dialog();
            this.displaying_dialog = '';
            this.open_levelset();
          } else if (this.displaying_dialog === 'ls_new_ok_only' && this.is_ok_filename() === 1) {
            this.remove_dialog();
            this.create_new_levelset();
          }
        }
      } else {
        this.highlight_option('cancel');
        if (caller === 'button') {
          if (this.displaying_dialog === 'ls_open' && this.deleted_current_levelset === 1) {
            this.remove_dialog();
            this.create_deleted_current_levelset_dialog();
          } else if (this.displaying_dialog === 'ls_deleted_current') {
            this.levelset_name = 'default-levelset';
            this.bubble_hash = this.read_file(this.levelset_name);
            this.curr_level = 1;
            this.displaying_dialog = '';
            this.remove_dialog();
            this.load_level();
            this.print_levelset_name();
            this.deleted_current_levelset = 0;
          } else if (this.displaying_dialog === 'ls_save_changes') {
            this.displaying_dialog = '';
            this.evalAction();
          } else this.remove_dialog();
        }
      }
    } else if (member(this.displaying_dialog, ['ls_open_ok_only', 'ls_open', 'ls_delete', 'ls_play', 'ls_play_choose_level'])) {
      if (this.betw(x, r.middle.x + 4 * r.middle.w / 6, r.middle.x + 4 * r.middle.w / 6 + tmp.w)) {
        const arrows = [r.dialog_file_list.y + 2, r.dialog_file_list.y + r.dialog_file_list.h - tmp.h - 2];
        if (this.betw(y, arrows[0], arrows[0] + tmp.h)) {
          if (caller === 'button') this.display_levelset_list_browser(this.list_browser_file_start_offset - 1, this.list_browser_highlight_offset);
          this.highlight_option('list_arrow_up');
        } else if (this.betw(y, arrows[1], arrows[1] + tmp.h)) {
          if (caller === 'button') this.display_levelset_list_browser(this.list_browser_file_start_offset + 1, this.list_browser_highlight_offset);
          this.highlight_option('list_arrow_down');
        } else this.unhighlight_option();
      } else if (this.betw(x, r.dialog_file_list.x, r.dialog_file_list.x + r.dialog_file_list.w)
          && this.betw(y, r.dialog_file_list.y, r.dialog_file_list.y + r.dialog_file_list.h)) {
        if (caller === 'button') {
          const s = this.list_browser_file_start_offset;
          if (y < r.dialog_file_list.y + 25) this.display_levelset_list_browser(s, s);
          else if (y < r.dialog_file_list.y + 2 * 25) this.display_levelset_list_browser(s, s + 1);
          else if (y < r.dialog_file_list.y + 3 * 25) this.display_levelset_list_browser(s, s + 2);
          else this.display_levelset_list_browser(s, s + 3);
          if (this.displaying_dialog === 'ls_play_choose_level') {
            if (this.is_ok_select_start_value(this.start_level) === 0) {
              this.start_level = this.file_browser_levelsets_num_levels[this.list_browser_highlight_offset];
              this.show_selected_level();
            }
          }
        }
      } else if (this.displaying_dialog === 'ls_play_choose_level' && this.betw(x, 435, 470)) {
        const more = x > 452 ? '_more' : '';
        if (this.betw(y, r.middle.y + 180, r.middle.y + 200)) {
          this.highlight_option(`select_level_arrow_up${more}`);
          if (caller === 'button') await this.modify_selected_level(event!, `up${more}`);
        } else if (this.betw(y, r.middle.y + 202, r.middle.y + 222)) {
          this.highlight_option(`select_level_arrow_down${more}`);
          if (caller === 'button') await this.modify_selected_level(event!, `down${more}`);
        } else this.unhighlight_option();
      } else this.unhighlight_option();
    } else this.unhighlight_option();
    return undefined;
  }

  /** eval($modified_levelset_action) */
  private evalAction(): void {
    const a = this.modified_levelset_action;
    if (a === 'create_new_levelset_dialog_ok_only()') this.create_new_levelset_dialog_ok_only();
    else if (a === 'create_open_levelset_dialog_ok_only()') this.create_open_levelset_dialog_ok_only();
    else if (a === '$modified_levelset_action = "return 1"') this.modified_levelset_action = 'return 1';
  }

  /** handle_events: the editor's loop; returns what the original's returned (1, a levelset, [levelset, level], or nothing) */
  async handle_events(): Promise<unknown> {
    const ev = this.g.app.events;
    const app = this.g.app;
    for (;;) {
      ev.pumpEvents();
      const e = ev.pollEvent();
      if (e) {
        const dd = (): string => this.displaying_dialog;
        if (e.type === MOUSEMOTION) {
          if (dd() === '') await this.choose_action(e.x, e.y, 'motion', e.button);
          else await this.choose_dialog_action(e.x, e.y, 'motion');
          this.flip();
        } else if (e.type === MOUSEBUTTONDOWN) {
          this.button_hold = 1;
          if (dd() === '') await this.choose_action(e.x, e.y, 'button', e.button);
          else await this.choose_dialog_action(e.x, e.y, 'button', e);
          this.flip();
        } else if (e.type === MOUSEBUTTONUP) {
          this.button_hold = 0;
        } else if (e.type === KEYDOWN) {
          const k = e.sym;
          if (dd() === '') {
            if (k === SDLK.ESCAPE || k === SDLK.q) {
              if (this.modified_levelset === 1) {
                this.modified_levelset_action = '$modified_levelset_action = "return 1"';
                this.create_save_changes_dialog();
              } else return 1;
            }
            if (k === SDLK.LEFT) this.prev_level();
            if (k === SDLK.RIGHT) this.next_level();
            if (k === SDLK.UP) this.first_level();
            if (k === SDLK.DOWN) this.last_level();
            if (k === SDLK.a) this.append_level();
            if (k === SDLK.d) { this.delete_level(); this.load_level(); }
            if (k === SDLK.f) app.fullscreen();
            if (k === SDLK.h) this.prev_level();
            if (k === SDLK.i) this.insert_level();
            if (k === SDLK.l) this.next_level();
            if (k === SDLK.n) this.next_level();
            if (k === SDLK.o) this.create_open_levelset_dialog();
            if (k === SDLK.p) this.prev_level();
            if (k === SDLK.s) this.save_file();
            if (k === SDLK.RIGHTBRACKET) this.move_level_right();
            if (k === SDLK.LEFTBRACKET) this.move_level_left();
            if (k === SDLK.F1) this.create_help_dialog();
            if (k === SDLK.j) this.create_jump_to_level_dialog();
            const h = this.highlighted_option;
            if (((h === 'prev' || h === 'first') && this.curr_level === 1) || ((h === 'next' || h === 'last') && this.curr_level === this.nlevels())) {
              this.unhighlight_option();
            }
          } else if (member(dd(), ['ls_new', 'ls_new_ok_only'])) {
            await this.print_new_ls_name(k);
          } else if (dd() === 'jump') {
            await this.print_jump_to_level_value(k);
          } else if (dd() === 'ls_open') {
            if (k === SDLK.RETURN || k === SDLK.KP_ENTER) { this.highlight_option('ok'); await app.delay(200); this.open_levelset(); }
            else if (k === SDLK.ESCAPE) {
              this.highlight_option('cancel');
              await app.delay(200);
              this.remove_dialog();
              if (this.deleted_current_levelset === 1) this.create_deleted_current_levelset_dialog();
            } else if (k === SDLK.DOWN) this.display_levelset_list_browser(this.list_browser_file_start_offset + 1, this.list_browser_highlight_offset + 1);
            else if (k === SDLK.UP) this.display_levelset_list_browser(this.list_browser_file_start_offset - 1, this.list_browser_highlight_offset - 1);
          } else if (dd() === 'ls_open_ok_only') {
            if (k === SDLK.RETURN || k === SDLK.KP_ENTER) { this.highlight_option('ok_right'); await app.delay(200); this.open_levelset(); }
            else if (k === SDLK.DOWN) this.display_levelset_list_browser(this.list_browser_file_start_offset + 1, this.list_browser_highlight_offset + 1);
            else if (k === SDLK.UP) this.display_levelset_list_browser(this.list_browser_file_start_offset - 1, this.list_browser_highlight_offset - 1);
          } else if (dd() === 'help') {
            if (k === SDLK.RETURN || k === SDLK.KP_ENTER) { this.highlight_option('ok_right'); await app.delay(200); this.remove_dialog(); }
          } else if (member(dd(), ['ls_play', 'ls_play_choose_level'])) {
            if (k === SDLK.ESCAPE || k === SDLK.q) { this.displaying_dialog = ''; return undefined; }
            if (k === SDLK.RETURN || k === SDLK.KP_ENTER) {
              this.highlight_option('ok_right');
              await app.delay(200);
              const l = this.get_levelset_list();
              this.displaying_dialog = '';
              return [l[this.list_browser_highlight_offset], this.start_level];
            } else if (k === SDLK.DOWN || k === SDLK.UP) {
              const d = k === SDLK.DOWN ? 1 : -1;
              this.display_levelset_list_browser(this.list_browser_file_start_offset + d, this.list_browser_highlight_offset + d);
              if (this.is_ok_select_start_value(this.start_level) === 0) {
                this.start_level = this.file_browser_levelsets_num_levels[this.list_browser_highlight_offset];
                if (this.displaying_dialog === 'ls_play_choose_level') this.show_selected_level();
              }
            } else if (k === SDLK.LEFT) await this.modify_selected_level(e, 'down');
            else if (k === SDLK.RIGHT) await this.modify_selected_level(e, 'up');
          } else if (dd() === 'ls_delete') {
            if (k === SDLK.RETURN || k === SDLK.KP_ENTER) { this.highlight_option('ok'); await app.delay(200); this.delete_levelset(); }
            else if (k === SDLK.ESCAPE) { this.highlight_option('cancel'); await app.delay(200); this.remove_dialog(); }
            else if (k === SDLK.DOWN) this.display_levelset_list_browser(this.list_browser_file_start_offset + 1, this.list_browser_highlight_offset + 1);
            else if (k === SDLK.UP) this.display_levelset_list_browser(this.list_browser_file_start_offset - 1, this.list_browser_highlight_offset - 1);
          } else if (dd() === 'ls_deleted_current') {
            if (k === SDLK.RETURN || k === SDLK.KP_ENTER) { this.highlight_option('ok'); await app.delay(200); this.remove_dialog(); this.create_open_levelset_dialog_ok_only(); }
            else if (k === SDLK.ESCAPE) {
              this.highlight_option('cancel');
              await app.delay(200);
              this.levelset_name = 'default-levelset';
              this.bubble_hash = this.read_file(this.levelset_name);
              this.curr_level = 1;
              this.displaying_dialog = '';
              this.remove_dialog();
              this.load_level();
              this.print_levelset_name();
              this.deleted_current_levelset = 0;
            }
          } else if (dd() === 'ls_nothing_to_delete') {
            if (k === SDLK.RETURN || k === SDLK.KP_ENTER) { this.highlight_option('ok_right'); await app.delay(200); this.displaying_dialog = ''; this.remove_dialog(); }
          } else if (dd() === 'ls_save_changes') {
            if (k === SDLK.RETURN || k === SDLK.KP_ENTER) { this.highlight_option('ok'); await app.delay(200); this.save_file(); this.displaying_dialog = ''; this.evalAction(); }
            else if (k === SDLK.ESCAPE) { this.highlight_option('cancel'); await app.delay(200); this.displaying_dialog = ''; this.evalAction(); }
          }
          this.flip();
        } else if (e.type === QUIT) {
          if (this.displaying_dialog === '') {
            if (this.modified_levelset === 1) {
              this.modified_levelset_action = '$modified_levelset_action = "return 1"';
              this.create_save_changes_dialog();
              this.flip();
            } else return 1;
          }
        }
        const m = /return (\S*)/.exec(this.modified_levelset_action);
        if (m && this.displaying_dialog !== 'ls_save_changes') {
          this.modified_levelset_action = '';
          if (this.displaying_dialog === 'ls_play_choose_level') { this.displaying_dialog = ''; return [m[1], this.start_level]; }
          this.displaying_dialog = '';
          return m[1];
        }
      } else {
        await app.delay(1);
      }
    }
  }

  // ------------------------------------------------------------------------- dialogs

  get_dialog_rect(): Rect {
    return new Rect(this.background.w / 2 - this.surface_dialog.w / 2, this.background.h / 2 - this.surface_dialog.h / 2, this.surface_dialog.w, this.surface_dialog.h);
  }

  create_dialog_base(title: string): void {
    this.unhighlight_option();
    this.surface_dialog = this.img(this.displaying_dialog === 'help' ? 'key_shortcuts.png' : 'menu/void_panel.png');
    this.rect.dialog = new Rect(0, 0, this.surface_dialog.w, this.surface_dialog.h);
    this.rect.middle = this.get_dialog_rect();
    blitSurface(this.surface_dialog, this.rect.dialog, this.app, this.rect.middle);
    this.print(this.rect.middle.x + this.rect.middle.w / 2 - 12 * title.length / 2, this.rect.middle.y + 5, title.toUpperCase());
  }

  create_dialog(title: string): void {
    this.create_dialog_base(title);
    this.print_cancel_text(0);
    this.print_ok_text(0);
  }

  remove_dialog(): void {
    this.rect.middle = new Rect(this.background.w / 2 - this.surface_dialog.w / 2, this.background.h / 2 - this.surface_dialog.h / 2, this.surface_dialog.w, this.surface_dialog.h);
    blitSurface(this.background, this.rect.middle, this.app, this.rect.middle);
    this.flip();
    this.load_level();
    this.displaying_dialog = '';
  }

  create_deleted_current_levelset_dialog(): void {
    this.displaying_dialog = 'ls_deleted_current';
    this.deleted_current_levelset = 1;
    this.create_dialog('DELETED CURRENT LEVELSET');
    const m = this.rect.middle = this.get_dialog_rect();
    this.print(m.x + 25, m.y + 15 + WOOD_PLANK_HEIGHT, 'PRESS "OK" TO CHOOSE');
    this.print(m.x + 25, m.y + 35 + WOOD_PLANK_HEIGHT, 'ANOTHER LEVELSET TO OPEN');
    this.print(m.x + 25, m.y + 3 * WOOD_PLANK_HEIGHT, 'PRESS "CANCEL" TO OPEN');
    this.print(m.x + 25, m.y + 25 + 3 * WOOD_PLANK_HEIGHT, 'THE DEFAULT LEVELSET');
  }

  create_delete_levelset_dialog(): void {
    if (this.g.host.home.list('levels').length > 1) {
      this.displaying_dialog = 'ls_delete';
      this.create_dialog('SELECT LEVELSET TO DELETE');
      this.list_browser_highlight_offset = -1;
      this.list_browser_file_start_offset = -1;
      this.display_levelset_list_browser(0, 0);
    } else {
      this.displaying_dialog = 'ls_nothing_to_delete';
      this.create_ok_dialog('NO LEVELSET TO DELETE');
      const m = this.rect.middle = this.get_dialog_rect();
      this.print(m.x + 50, m.y + 30 + WOOD_PLANK_HEIGHT, 'THERE ARE NO CUSTOM');
      this.print(m.x + 50, m.y + 55 + WOOD_PLANK_HEIGHT, 'LEVELSETS TO DELETE.');
      this.print(m.x + 40, m.y + 125 + WOOD_PLANK_HEIGHT, 'PRESS "OK" TO CONTINUE');
    }
  }

  create_help_dialog(): void { this.displaying_dialog = 'help'; this.create_ok_dialog('HELP - KEY SHORTCUTS'); }

  create_jump_to_level_dialog(): void {
    this.jump_to_level_value = '';
    this.displaying_dialog = 'jump';
    this.create_dialog('ENTER LEVEL TO JUMP TO');
  }

  create_new_levelset_dialog(): void {
    if (this.modified_levelset === 1) {
      this.modified_levelset_action = 'create_new_levelset_dialog_ok_only()';
      this.create_save_changes_dialog();
    } else {
      this.displaying_dialog = 'ls_new';
      this.create_dialog('ENTER NEW LEVELSET NAME');
      this.new_ls_name_text = '';
    }
  }

  create_new_levelset_dialog_ok_only(): void {
    this.displaying_dialog = 'ls_new_ok_only';
    this.create_ok_dialog('ENTER NEW LEVELSET NAME');
    this.new_ls_name_text = '';
  }

  create_ok_dialog(title: string): void { this.create_dialog_base(title); this.print_ok_right_text(0); }

  create_open_levelset_dialog(): void {
    this.start_level = null;
    if (this.modified_levelset === 1) {
      this.modified_levelset_action = 'create_open_levelset_dialog_ok_only()';
      this.create_save_changes_dialog();
    } else {
      this.displaying_dialog = 'ls_open';
      this.create_dialog('SELECT LEVELSET TO OPEN');
      this.list_browser_highlight_offset = -1;
      this.list_browser_file_start_offset = -1;
      this.display_levelset_list_browser(0, 0);
    }
  }

  create_open_levelset_dialog_ok_only(): void {
    this.displaying_dialog = 'ls_open_ok_only';
    this.create_ok_dialog('SELECT LEVELSET TO OPEN');
    this.list_browser_highlight_offset = -1;
    this.list_browser_file_start_offset = -1;
    this.display_levelset_list_browser(0, 0);
  }

  iter_rowscols(f: (row: number, col: number) => void): void {
    for (let row = 0; row <= NUM_ROWS - 1; row++) {
      for (let col = 0; col <= (P1.right_limit - P1.left_limit) / BUBBLE_SIZE - 1 - oddn(row); col++) f(row, col);
    }
  }

  save_file(): void {
    const contents: string[] = [];
    for (let lev = 1; lev <= this.nlevels(); lev++) {
      this.iter_rowscols((row, col) => {
        if (col === 0) {
          if (!(lev === 1 && row === 0)) contents.push('\n');
          if (odd(row)) contents.push('  ');
        }
        contents.push(this.cell(lev, col, row) ?? '');
        if (col + oddn(row) < 7) contents.push('   ');
      });
      contents.push('\n');
    }
    this.g.host.home.write(`levels/${this.levelset_name}`, contents.join(''));
    this.modified_levelset = 0;
  }

  async create_play_levelset_dialog(choose: number, defaultLevel: number | string | null): Promise<void> {
    this.start_level = defaultLevel === null ? null : pnum(defaultLevel);
    this.displaying_dialog = choose === 1 ? 'ls_play_choose_level' : 'ls_play';
    this.create_ok_dialog('SELECT LEVELSET TO PLAY');
    this.list_browser_highlight_offset = -1;
    this.list_browser_file_start_offset = -1;
    this.display_levelset_list_browser(0, 0);
    if (choose === 1) this.display_level_selector();
  }

  create_save_changes_dialog(): void {
    this.modified_levelset = 0;
    this.displaying_dialog = 'ls_save_changes';
    this.create_dialog('SAVE CHANGES?');
    const m = this.rect.middle = this.get_dialog_rect();
    this.print(m.x + 25, m.y + WOOD_PLANK_HEIGHT, 'THERE ARE UNSAVED CHANGES');
    this.print(m.x + 22, m.y + 35 + WOOD_PLANK_HEIGHT, 'PRESS "OK" TO SAVE');
    this.print(m.x + 22, m.y + 55 + WOOD_PLANK_HEIGHT, 'CHANGES AND CONTINUE');
    this.print(m.x + 22, m.y + 95 + WOOD_PLANK_HEIGHT, 'PRESS "CANCEL" TO CONTINUE');
    this.print(m.x + 22, m.y + 115 + WOOD_PLANK_HEIGHT, 'WITHOUT SAVING');
  }

  display_level_selector(): void {
    const m = this.rect.middle = this.get_dialog_rect();
    this.print(m.x + 15, m.y + 190, 'START LEVEL:');
    this.update(m);
    this.show_selected_level();
    this.print_dialog_select_level_arrow(0, 'down');
    this.print_dialog_select_level_arrow(0, 'up');
    this.print_dialog_select_level_arrow(0, 'down_more');
    this.print_dialog_select_level_arrow(0, 'up_more');
  }

  is_ok_modify_selected_level(mod: string): number {
    const s = this.start_level ?? 0;
    return (/up/.test(mod) && this.is_ok_select_start_value(s + 1)) || (/down/.test(mod) && this.is_ok_select_start_value(s - 1)) ? 1 : 0;
  }

  async modify_selected_level(event: SDLEvent, mod: string): Promise<void> {
    void event;
    let loops = 0;
    const ev = this.g.app.events;
    const app = this.g.app;
    for (;;) {
      ev.pumpEvents();
      const e = ev.pollEvent();
      if (!e) {
        if (this.is_ok_modify_selected_level(mod)) {
          const n = this.file_browser_levelsets_num_levels[this.list_browser_highlight_offset];
          if (mod === 'up') this.start_level!++;
          if (mod === 'down') this.start_level!--;
          if (mod === 'up_more') this.start_level = this.is_ok_select_start_value(this.start_level! + 10) ? this.start_level! + 10 : n;
          if (mod === 'down_more') this.start_level = this.is_ok_select_start_value(this.start_level! - 10) ? this.start_level! - 10 : 1;
          this.show_selected_level();
          if ((/up/.test(mod) && this.start_level === n) || (/down/.test(mod) && this.start_level === 1)) this.unhighlight_option();
        }
        if (loops <= 5) {
          await app.delay(100);
          ev.pumpEvents();
          const e2 = ev.pollEvent();
          if (!e2 || e2.type === MOUSEMOTION) await app.delay(300);
          else return;
        } else if (loops <= 10) await app.delay(150);
        else if (loops <= 20) await app.delay(80);
        else await app.delay(35);
        loops++;
      } else if (e.type === MOUSEMOTION) {
        if (!this.betw(e.x, 435, 470)) return;
        const r = this.rect.middle;
        if (/up/.test(mod)) { if (!this.betw(e.y, r.y + 180, r.y + 200)) return; } else if (!this.betw(e.y, r.y + 202, r.y + 222)) return;
      } else return;
    }
  }

  show_selected_level(): void {
    const bg = this.img('select_level_background.png');
    this.rect.select_level_background_src = new Rect(0, 0, bg.w, bg.h);
    this.rect.select_level_background_dest = new Rect(305, this.rect.middle.y + 190, bg.w, bg.h);
    blitSurface(bg, this.rect.select_level_background_src, this.app, this.rect.select_level_background_dest);
    this.setFont('font-hi.png');
    const txt = this.start_level === null ? '' : String(this.start_level);
    this.print(427 - this.font.textWidth(txt), this.rect.middle.y + 190, txt);
    this.setFont('font.png');
    this.update(this.rect.select_level_background_dest);
    this.display_levelset_screenshot();
  }

  display_levelset_list_browser(file_start: number, file_highlight: number): void {
    const levelsets = this.get_levelset_list();
    const do_scroll = file_start !== this.list_browser_file_start_offset;
    if (file_highlight > levelsets.length - 1 || (file_highlight === this.list_browser_highlight_offset && !do_scroll)) return;
    if (file_start < levelsets.length && file_start >= 0) this.list_browser_file_start_offset = file_start;
    else return;
    const r = this.rect;
    r.middle = this.get_dialog_rect();
    this.setFont('font-hi.png');
    const listbg = this.img('file_list_background.png');
    r.list_box_src = new Rect(0, 0, listbg.w, 3 * WOOD_PLANK_HEIGHT);
    const widgetMove = this.displaying_dialog === 'ls_play_choose_level' ? -25 : 0;
    r.dialog_file_list = new Rect(r.middle.x + 9, r.middle.y + WOOD_PLANK_HEIGHT + 37 + widgetMove, r.list_box_src.w, r.list_box_src.h);
    const purple = this.img('purple_hover.gif');
    r.purple_highlight_src = new Rect(0, 0, purple.w, purple.h);
    if (this.list_browser_highlight_offset === -1) {
      const scroll = this.img('scroll_list_background.png');
      // -width => $surf_scroll_list_background: a surface object in numeric context (its address); the Rect keeps 16 bits of it
      r.scroll_list_background_src = new Rect(0, 0, 0, 3 * WOOD_PLANK_HEIGHT);
      r.scroll_list_background_src.w = scroll.w; // see NOTES.md: the width is a surface's address; the blit clips it to the image
      r.scroll_list_background_dest = new Rect(r.dialog_file_list.x + r.dialog_file_list.w, r.dialog_file_list.y, r.scroll_list_background_src.w, r.scroll_list_background_src.h);
      blitSurface(scroll, r.scroll_list_background_src, this.app, r.scroll_list_background_dest);
      this.update(r.scroll_list_background_dest);
      this.print_dialog_list_arrow(0, 'down');
      this.print_dialog_list_arrow(0, 'up');
    }
    if (do_scroll) {
      blitSurface(listbg, r.list_box_src, this.app, r.dialog_file_list);
      this.update(r.dialog_file_list);
      for (let cnt = file_start; cnt < file_start + 4; cnt++) {
        if (file_highlight === cnt) {
          r.purple_highlight_dest = new Rect(r.middle.x + 12, r.dialog_file_list.y + 10 + 25 * (cnt - file_start), purple.w, purple.h);
          blitSurface(purple, r.purple_highlight_src, this.app, r.purple_highlight_dest);
          this.update(r.purple_highlight_dest);
        }
        this.print(r.middle.x + 19, r.dialog_file_list.y + 8 + 25 * (cnt - file_start), (levelsets[cnt] ?? '').toUpperCase());
      }
    } else {
      r.old_highlight = new Rect(r.middle.x + 12, r.dialog_file_list.y + 10 + 25 * (this.list_browser_highlight_offset - this.list_browser_file_start_offset), purple.w, purple.h);
      r.erase_highlight = new Rect(r.old_highlight.x - r.dialog_file_list.x, r.old_highlight.y - r.dialog_file_list.y, purple.w, purple.h);
      if (this.list_browser_highlight_offset >= this.list_browser_file_start_offset && this.list_browser_highlight_offset <= this.list_browser_file_start_offset + 3) {
        blitSurface(listbg, r.erase_highlight, this.app, r.old_highlight);
        this.update(r.old_highlight);
        this.print(r.middle.x + 19, r.dialog_file_list.y + 8 + 25 * (this.list_browser_highlight_offset - this.list_browser_file_start_offset),
          (levelsets[this.list_browser_highlight_offset] ?? '').toUpperCase());
      }
      r.purple_highlight_dest = new Rect(r.middle.x + 12, r.dialog_file_list.y + 10 + 25 * (file_highlight - file_start), purple.w, purple.h);
      blitSurface(purple, r.purple_highlight_src, this.app, r.purple_highlight_dest);
      this.update(r.purple_highlight_dest);
      this.print(r.middle.x + 19, r.dialog_file_list.y + 8 + 25 * (file_highlight - file_start), (levelsets[file_highlight] ?? '').toUpperCase());
    }
    this.unhighlight_option();
    this.update(r.middle);
    if (file_highlight !== this.list_browser_highlight_offset) {
      if (this.list_browser_highlight_offset === -1) {
        this.list_browser_highlight_offset = 0;
        this.file_browser_levelsets = {};
        this.file_browser_levelsets_num_levels = [];
        for (const ls of this.get_levelset_list()) {
          const l = this.read_file(ls);
          this.file_browser_levelsets[ls] = l;
          this.file_browser_levelsets_num_levels.push(Object.keys(l).length);
        }
      }
      this.list_browser_highlight_offset = file_highlight;
      this.display_levelset_screenshot();
    } else this.list_browser_highlight_offset = file_highlight;
    this.setFont('font.png');
    this.flip();
  }

  display_levelset_screenshot(): void {
    const levelsets = this.get_levelset_list();
    const name = levelsets[this.list_browser_highlight_offset];
    const r = this.rect;
    r.middle = this.get_dialog_rect();
    r.screenshot = new Rect(P1.left_limit - 40, 0, P1.right_limit - P1.left_limit + 80, BOTTOM_LIMIT - P1.top_limit + 190);
    const widgetMove = this.displaying_dialog === 'ls_play_choose_level' ? -25 : 0;
    const x = r.middle.x + r.middle.w - r.screenshot.w / 4 - 12;
    const y = r.middle.y + r.middle.h / 2 - r.screenshot.h / 8 - 3 + widgetMove;
    const current_nb = this.start_level || 1;
    if (!this.shrinks.get(name)?.has(current_nb)) {
      const pw = this.img('menu/please_wait.png');
      blitSurface(pw, new Rect(0, 0, pw.w, pw.h), this.app,
        new Rect(r.scroll_list_background_dest.x + r.scroll_list_background_dest.w + 7, r.scroll_list_background_dest.y + 20, pw.w, pw.w));
      this.update(r.middle);
      if (!this.s_save) this.s_save = this.img('level_editor.png');
      const ahead = this.start_level ? [current_nb - 10, ...Array.from({ length: 14 }, (_, i) => current_nb - 3 + i), current_nb + 20] : [current_nb];
      if (!this.shrinks.has(name)) this.shrinks.set(name, new Map());
      const cache = this.shrinks.get(name)!;
      for (const nb of ahead) {
        if (nb < 1 || cache.has(nb)) continue;
        const ls = this.file_browser_levelsets[name];
        if (!ls?.[nb]) break;
        const s = newSurface(this.s_save.w, this.s_save.h, 32, true);
        const full = new Rect(0, 0, 640, 480);
        blitSurface(this.s_save, full, s, full);
        this.load_level(s, nb, ls);
        const dest = newSurface(r.screenshot.w / 4, r.screenshot.h / 4, 32, true);
        this.g.c.shrink(dest, s, 0, 0, r.screenshot, 4);
        cache.set(nb, dest);
      }
    }
    const image = this.shrinks.get(name)!.get(current_nb)!;
    blitSurface(image, new Rect(0, 0, image.w, image.h), this.app, new Rect(x, y, image.w, image.h));
    this.update(r.middle);
  }

  // ------------------------------------------------------------------------- levels and levelsets

  load_level(surface?: Surface, lvl?: number, b?: LevelSet): void {
    let target: Surface | undefined = surface;
    if (!surface) {
      lvl = this.curr_level;
      b = this.bubble_hash;
      this.clear_level();
      this.print_level_nb();
    }
    this.iter_rowscols((row, col) => {
      const level = (b![lvl!] ??= {});
      const column = (level[col] ??= {});
      if (column[row] === undefined) column[row] = '-';
      if (column[row] !== '-') {
        this.draw_bubble(pnum(column[row]) + 1, col * BUBBLE_SIZE + P1.left_limit + oddn(row) * BUBBLE_SIZE / 2, row * ROW_SIZE + P1.top_limit,
          ALPHA_BUBBLE_NO, target);
      }
    });
    void target;
    this.flip();
  }

  clear_level(): void {
    this.rect.clear = new Rect(P1.left_limit, P1.top_limit, P1.right_limit - P1.left_limit, BOTTOM_LIMIT - P1.top_limit + BUBBLE_SIZE);
    blitSurface(this.background, this.rect.clear, this.app, this.rect.clear);
  }

  delete_level(): void {
    delete this.bubble_hash[this.curr_level];
    if (this.curr_level - 1 === this.nlevels()) {
      this.curr_level--;
      if (this.curr_level === 0) this.append_level();
    } else {
      for (let lev = this.curr_level; lev <= this.nlevels(); lev++) this.bubble_hash[lev] = this.bubble_hash[lev + 1];
      delete this.bubble_hash[this.nlevels()];
    }
    this.modified_levelset = 1;
  }

  create_new_levelset(): void {
    this.levelset_name = this.new_ls_name_text.toLowerCase();
    this.bubble_hash = {};
    this.curr_level = 0;
    this.append_level();
    this.print_levelset_name();
    this.load_level();
    this.modified_levelset = 0;
  }

  delete_levelset(): void {
    const l = this.get_levelset_list();
    const name = l[this.list_browser_highlight_offset];
    if (!this.g.host.home.remove(`levels/${name}`)) throw new Error(`Can't remove ${name}`);
    this.remove_dialog();
    if (this.levelset_name === name) this.create_deleted_current_levelset_dialog();
  }

  read_file(name: string): LevelSet {
    const text = this.g.host.home.read(`levels/${name}`) ?? '';
    let row = 0, lev = 1;
    const h: LevelSet = {};
    const lines = text.split('\n');
    if (lines[lines.length - 1] === '') lines.pop();
    for (const line of lines) {
      if (!/\S/.test(line)) {
        if (row) { lev++; row = 0; }
      } else {
        let col = 0;
        for (const tok of line.trim().split(/\s+/)) { ((h[lev] ??= {})[col] ??= {})[row] = tok; col++; }
        row++;
      }
    }
    return h;
  }

  open_levelset(): void {
    this.deleted_current_levelset = 0;
    const l = this.get_levelset_list();
    this.levelset_name = l[this.list_browser_highlight_offset];
    this.bubble_hash = this.read_file(this.levelset_name);
    this.print_levelset_name();
    this.curr_level = 1;
    this.remove_dialog();
    this.modified_levelset = 0;
  }

  prev_level(): void { if (this.curr_level > 1) this.curr_level--; this.load_level(); }
  next_level(): void { if (this.curr_level < this.nlevels()) this.curr_level++; this.load_level(); }
  first_level(): void { this.curr_level = 1; this.load_level(); }
  last_level(): void { this.curr_level = this.nlevels(); this.load_level(); }
  jump_to_level(n: number): void { if (n >= 1 && n <= this.nlevels()) { this.curr_level = n; this.load_level(); } }

  insert_level(): void {
    for (let lev = 1 + this.nlevels(); lev > this.curr_level; lev--) this.bubble_hash[lev] = this.bubble_hash[lev - 1];
    delete this.bubble_hash[this.curr_level];
    this.iter_rowscols((row, col) => this.setCell(this.curr_level, col, row, '-'));
    this.load_level();
    this.modified_levelset = 1;
  }

  append_level(): void { this.curr_level++; this.insert_level(); }

  move_level_left(): void {
    if (!(this.curr_level > 1)) return;
    [this.bubble_hash[this.curr_level - 1], this.bubble_hash[this.curr_level]] = [this.bubble_hash[this.curr_level], this.bubble_hash[this.curr_level - 1]];
    this.curr_level--;
    this.load_level();
    this.modified_levelset = 1;
  }

  move_level_right(): void {
    if (!(this.curr_level < this.nlevels())) return;
    [this.bubble_hash[this.curr_level + 1], this.bubble_hash[this.curr_level]] = [this.bubble_hash[this.curr_level], this.bubble_hash[this.curr_level + 1]];
    this.curr_level++;
    this.load_level();
    this.modified_levelset = 1;
  }

  // ------------------------------------------------------------------------- printing

  print_cancel_text(h: number): void {
    if (this.displaying_dialog === '') return;
    const m = this.rect.middle = this.get_dialog_rect();
    this.rect.cancel_src = new Rect(m.w - this.rect.option_highlight.w, 6 * WOOD_PLANK_HEIGHT - 4, m.w / 2, WOOD_PLANK_HEIGHT);
    this.rect.cancel = new Rect(m.x + m.w - this.rect.option_highlight.w, m.y + 6 * WOOD_PLANK_HEIGHT - 4, m.w / 2, WOOD_PLANK_HEIGHT);
    blitSurface(this.surface_dialog, this.rect.cancel_src, this.app, this.rect.cancel);
    this.update(this.rect.cancel);
    this.print(m.x + m.w - 120, m.y + 6 * WOOD_PLANK_HEIGHT, 'CANCEL');
    if (h) { blitSurface(this.highlight, this.rect.option_highlight, this.app, this.rect.cancel); this.update(this.rect.cancel); }
  }

  print_dialog_list_arrow(h: number, type: string): void {
    this.rect.middle = this.get_dialog_rect();
    const arrow = this.img(`list_arrow_${type}.png`);
    const r = this.rect;
    r.list_arrow_src = new Rect(0, 0, arrow.w, arrow.h);
    r.list_arrow_dest = new Rect(r.middle.x + 4 * r.middle.w / 6 + 2,
      type === 'up' ? r.dialog_file_list.y + 2 : r.dialog_file_list.y + r.dialog_file_list.h - arrow.h - 2, arrow.w, arrow.h);
    const scroll = this.img('scroll_list_background.png');
    r.erase_arrow = new Rect(r.list_arrow_dest.x - r.scroll_list_background_dest.x, r.list_arrow_dest.y - r.scroll_list_background_dest.y, arrow.w, arrow.h);
    blitSurface(scroll, r.erase_arrow, this.app, r.list_arrow_dest);
    this.update(r.list_arrow_dest);
    blitSurface(arrow, r.list_arrow_src, this.app, r.list_arrow_dest);
    this.update(r.list_arrow_dest);
    if (h) { blitSurface(this.highlight, r.list_arrow_src, this.app, r.list_arrow_dest); this.update(r.list_arrow_dest); }
  }

  print_dialog_select_level_arrow(h: number, type: string): void {
    this.rect.middle = this.get_dialog_rect();
    const r = this.rect;
    const arrow = this.img(`list_arrow_${type}.png`);
    r.list_arrow_src = new Rect(0, 0, arrow.w, arrow.h);
    const x = /more/.test(type) ? 457 : 437;
    r.list_arrow_dest = new Rect(x, /up/.test(type) ? r.middle.y + 180 : r.middle.y + 202, arrow.w, arrow.h);
    const bg = this.img('menu/void_panel.png');
    r.erase_arrow = new Rect(x - r.middle.x, /up/.test(type) ? 180 : 202, arrow.w, arrow.h);
    blitSurface(bg, r.erase_arrow, this.app, r.list_arrow_dest);
    this.update(r.list_arrow_dest);
    blitSurface(arrow, r.list_arrow_src, this.app, r.list_arrow_dest);
    this.update(r.list_arrow_dest);
    if (h && this.is_ok_modify_selected_level(type)) { blitSurface(this.highlight, r.list_arrow_src, this.app, r.list_arrow_dest); this.update(r.list_arrow_dest); }
  }

  print_levelset_name(): void {
    this.rect.ls_name_erase = new Rect(195, 0, 445 - 195, 35);
    blitSurface(this.background, this.rect.ls_name_erase, this.app, this.rect.ls_name_erase);
    this.print((this.background.w - this.font.textWidth(this.levelset_name.toUpperCase())) / 2 - 6, 7, this.levelset_name.toUpperCase());
    this.flip();
  }

  print_text_generic(h: number, name: string, x: number, y: number, text?: string): void {
    blitSurface(this.background, this.rect[name], this.app, this.rect[name]);
    this.update(this.rect[name]);
    this.print(x, y, text || name.toUpperCase());
    if (h) { blitSurface(this.highlight, this.rect.option_highlight, this.app, this.rect[name]); this.update(this.rect[name]); }
  }

  print_first_text(h: number): void { this.print_text_generic(h, 'first', WOOD_WIDTH / 2, this.rect.first.y + 6); }
  print_last_text(h: number): void { this.print_text_generic(h, 'last', 20, this.rect.last.y + 6); }
  print_prev_text(h: number): void { this.print_text_generic(h, 'prev', WOOD_WIDTH / 2, this.rect.prev.y + 6); }
  print_next_text(h: number): void { this.print_text_generic(h, 'next', 20, this.rect.next.y + 6); }
  print_ls_delete_text(h: number): void { this.print_text_generic(h, 'ls_delete', this.rect.ls_delete.x + 12, this.rect.ls_delete.y + 6, 'DELETE'); }
  print_ls_new_text(h: number): void { this.print_text_generic(h, 'ls_new', this.rect.ls_new.x + WOOD_WIDTH / 2, this.rect.ls_new.y + 6, 'NEW'); }
  print_ls_open_text(h: number): void { this.print_text_generic(h, 'ls_open', this.rect.ls_open.x + 35, this.rect.ls_open.y + 6, 'OPEN'); }
  print_ls_save_text(h: number): void { this.print_text_generic(h, 'ls_save', this.rect.ls_save.x + WOOD_WIDTH / 2, this.rect.ls_save.y + 6, 'SAVE'); }
  print_lvl_append_text(h: number): void { this.print_text_generic(h, 'lvl_append', this.rect.lvl_append.x + 20, this.rect.lvl_append.y + 6, 'APPEND'); }
  print_lvl_delete_text(h: number): void { this.print_text_generic(h, 'lvl_delete', this.rect.lvl_delete.x + WOOD_WIDTH / 2, this.rect.lvl_delete.y + 6, 'DELETE'); }
  print_lvl_insert_text(h: number): void { this.print_text_generic(h, 'lvl_insert', this.rect.lvl_insert.x + WOOD_WIDTH / 2 - 5, this.rect.lvl_insert.y + 6, 'INSERT'); }
  print_help_text(h: number): void { this.print_text_generic(h, 'help', this.rect.help.x + 20, this.rect.help.y + 6, 'HELP!'); }

  is_ok_filename(): number {
    if (this.new_ls_name_text.length === 0) return 0;
    for (const l of this.get_levelset_list()) if (this.new_ls_name_text.toLowerCase() === l.toLowerCase()) return 0;
    return 1;
  }

  is_ok_jump_value(): number {
    const v = this.jump_to_level_value;
    return v.length === 0 || pnum(v) === 0 || pnum(v) > this.nlevels() ? 0 : 1;
  }

  is_ok_select_start_value(p: number | null): number {
    const v = p ?? 0;
    return v >= 1 && v <= (this.file_browser_levelsets_num_levels[this.list_browser_highlight_offset] ?? 0) ? 1 : 0;
  }

  keysym_to_char(key: number): string {
    for (const [name, v] of KEYSYMS) if (v === key) return name.toUpperCase();
    return '';
  }

  async print_jump_to_level_value(key: number): Promise<void> {
    if (key === SDLK.ESCAPE) { this.highlight_option('cancel'); await this.g.app.delay(200); this.remove_dialog(); }
    else if ((key === SDLK.RETURN || key === SDLK.KP_ENTER) && this.jump_to_level_value.length > 0) {
      this.highlight_option('ok');
      await this.g.app.delay(200);
      this.remove_dialog();
      this.jump_to_level(pnum(this.jump_to_level_value));
    } else if (key === SDLK.BACKSPACE || (key >= SDLK['0'] && key <= SDLK['9']) || (key >= SDLK.KP0 && key <= SDLK.KP9)) {
      if (key >= SDLK.KP0 && key <= SDLK.KP9) key = key - SDLK.KP0 + SDLK['0'];
      this.erase_dialog_text();
      if (key === SDLK.BACKSPACE) this.jump_to_level_value = this.jump_to_level_value.slice(0, -1);
      else {
        this.jump_to_level_value += this.keysym_to_char(key);
        if (!this.is_ok_jump_value()) { this.jump_to_level_value = this.jump_to_level_value.slice(0, -1); this.unhighlight_option(); }
      }
      this.print(this.rect.dialog_new.x + this.rect.dialog_new.w / 2 - 12 * this.jump_to_level_value.length / 2, 210, this.jump_to_level_value);
    }
  }

  private erase_dialog_text(): void {
    const sd = this.surface_dialog;
    this.rect.dialog_blank = new Rect(0, 2 * WOOD_PLANK_HEIGHT, sd.w, sd.h - 3 * WOOD_PLANK_HEIGHT);
    this.rect.dialog_new = new Rect(this.background.w / 2 - sd.w / 2, this.background.h / 2 - sd.h / 2 + 2 * WOOD_PLANK_HEIGHT, sd.w, sd.h - 3 * WOOD_PLANK_HEIGHT);
    blitSurface(sd, this.rect.dialog_blank, this.app, this.rect.dialog_new);
    this.flip();
  }

  async print_new_ls_name(key: number): Promise<void> {
    if (key === SDLK.ESCAPE) {
      if (this.displaying_dialog === 'ls_new') { this.highlight_option('cancel'); await this.g.app.delay(200); this.remove_dialog(); }
    } else if ((key === SDLK.RETURN || key === SDLK.KP_ENTER) && this.new_ls_name_text.length > 0 && this.is_ok_filename()) {
      if (this.displaying_dialog === 'ls_new') this.highlight_option('ok');
      else if (this.displaying_dialog === 'ls_new_ok_only') this.highlight_option('ok_right');
      await this.g.app.delay(200);
      this.remove_dialog();
      this.create_new_levelset();
    } else if (key === SDLK.BACKSPACE || (this.new_ls_name_text.length < 14 && (key === SDLK.KP_MINUS || (key >= SDLK.KP0 && key <= SDLK.KP9)
        || (key >= SDLK.a && key <= SDLK.z) || key === SDLK.MINUS || (key >= SDLK['0'] && key <= SDLK['9'])))) {
      this.erase_dialog_text();
      if (key === SDLK.BACKSPACE) this.new_ls_name_text = this.new_ls_name_text.slice(0, -1);
      else if (key === SDLK.MINUS || key === SDLK.KP_MINUS) this.new_ls_name_text += '-';
      else if (key >= SDLK.KP0 && key <= SDLK.KP9) this.new_ls_name_text += String(key - SDLK.KP0);
      else this.new_ls_name_text += this.keysym_to_char(key);
      this.print(this.rect.dialog_new.x + this.rect.dialog_new.w / 2 - 12 * this.new_ls_name_text.length / 2, 210, this.new_ls_name_text);
    }
    if (this.is_ok_filename() === 0) this.unhighlight_option();
  }

  print_ok_right_text(h: number): void {
    if (this.displaying_dialog === '') return;
    const m = this.rect.middle = this.get_dialog_rect();
    this.rect.cancel_src = new Rect(m.w - this.rect.option_highlight.w, 6 * WOOD_PLANK_HEIGHT - 4, m.w / 2, WOOD_PLANK_HEIGHT);
    this.rect.cancel = new Rect(m.x + m.w - this.rect.option_highlight.w, m.y + 6 * WOOD_PLANK_HEIGHT - 4, m.w / 2, WOOD_PLANK_HEIGHT);
    blitSurface(this.surface_dialog, this.rect.cancel_src, this.app, this.rect.cancel);
    this.update(this.rect.cancel);
    this.print(m.x + m.w - 80, m.y + 6 * WOOD_PLANK_HEIGHT, 'OK');
    if (h) { blitSurface(this.highlight, this.rect.option_highlight, this.app, this.rect.cancel); this.update(this.rect.cancel); }
  }

  print_ok_text(h: number): void {
    if (this.displaying_dialog === '') return;
    const m = this.rect.middle = this.get_dialog_rect();
    this.rect.ok_src = new Rect(0, 6 * WOOD_PLANK_HEIGHT - 4, m.w / 2, WOOD_PLANK_HEIGHT);
    this.rect.ok = new Rect(m.x, m.y + 6 * WOOD_PLANK_HEIGHT - 4, m.w / 2, WOOD_PLANK_HEIGHT);
    blitSurface(this.surface_dialog, this.rect.ok_src, this.app, this.rect.ok);
    this.update(this.rect.ok);
    this.print(m.x + 60, m.y + 6 * WOOD_PLANK_HEIGHT, 'OK');
    if (h) { blitSurface(this.highlight, this.rect.option_highlight, this.app, this.rect.ok); this.update(this.rect.ok); }
  }

  print_level_nb(): void {
    const posx = 183, posy = 421;
    const r = new Rect(posx - 50, posy, 100, 25);
    blitSurface(this.background, r, this.app, r);
    const text = `${this.curr_level}/${this.nlevels()}`;
    this.print(posx - 12 * text.length / 2, posy, text);
    this.update(r);
  }

  // ------------------------------------------------------------------------- initialization

  add_bubble_option(id: number, col: number, row: number): void { this.draw_bubble(id, this.bubble_optionx(col), this.bubble_optiony(row), ALPHA_BUBBLE_NO); }

  add_bubble_options(): void {
    let count = 0;
    while (count < NUM_BUBBLES_AVAIL) {
      let colc = 0;
      while (colc < BUBBLES_PER_ROW && count < NUM_BUBBLES_AVAIL) {
        this.add_bubble_option(count + 1, colc, floor(count / BUBBLES_PER_ROW));
        colc++;
        count++;
      }
    }
  }

  add_erase_option(): void {
    const erase = this.img('balls/stick_effect_6.png');
    blitSurface(erase, null, this.app, this.rect.erase);
    this.update(this.rect.erase);
  }

  async init_setup(caller: string): Promise<void> {
    this.init_app(caller);
    blitSurface(this.background, null, this.app, this.rect.background);
    this.update(this.rect.background);
    this.add_bubble_options();
    this.add_erase_option();
    this.setFont('font.png');
    this.print(5, BUBBLE_WOOD_Y + 3, 'CHOOSE BUBBLE');
    this.print(20, NAV_WOOD_Y + 8, 'NAVIGATION');
    this.print_prev_text(0);
    this.print_next_text(0);
    this.print_first_text(0);
    this.print_last_text(0);
    this.print(RIGHT_WOOD_X + 30, LEVELSET_WOOD_Y + 8, 'LEVELSET');
    this.print_ls_new_text(0);
    this.print_ls_open_text(0);
    this.print_ls_save_text(0);
    this.print_ls_delete_text(0);
    this.print(RIGHT_WOOD_X + 45, LEVEL_WOOD_Y + 8, 'LEVEL');
    this.print_lvl_insert_text(0);
    this.print_lvl_append_text(0);
    this.print_lvl_delete_text(0);
    this.print_help_text(0);
    this.change_color(1);
    this.modified_levelset = 0;
    const home = this.g.host.home;
    if (!home.exists('levels/default-levelset')) home.write('levels/default-levelset', new TextDecoder().decode(this.g.host.data.file('data/levels')));
    this.bubble_hash = this.read_file(this.levelset_name);
    if (this.curr_level > this.nlevels()) this.curr_level = 1;
    this.load_level();
    this.g.app.platform.log?.(`W ${this.g.app.ticks()} warp 320 240`);
    this.g.app.events.warpMouse(320, 240);
    this.print_levelset_name();
    this.flip();
    this.button_hold = 0;
  }

  init_app(caller: string): void {
    if (caller !== 'stand-alone') {
      this.levelset_name = 'default-levelset';
      this.curr_level = 1;
    }
    this.setFont('font.png');
    this.background = this.img('level_editor.png');
    const r = (name: string, x: number, y: number, w: number, h: number): void => { this.rect[name] = new Rect(x, y, w, h); };
    r('background', 0, 0, this.background.w, this.background.h);
    r('bubble_wood', LEFT_WOOD_X, BUBBLE_WOOD_Y + WOOD_PLANK_HEIGHT, WOOD_WIDTH, WOOD_PLANK_HEIGHT * (NUM_BUBBLES_AVAIL + 1) / BUBBLES_PER_ROW);
    r('erase', this.bubble_optionx(NUM_BUBBLES_AVAIL % BUBBLES_PER_ROW), this.bubble_optiony(floor(NUM_BUBBLES_AVAIL / BUBBLES_PER_ROW)), BUBBLE_SIZE, BUBBLE_SIZE);
    r('prev', LEFT_WOOD_X, NAV_WOOD_Y + WOOD_PLANK_HEIGHT, WOOD_WIDTH, WOOD_PLANK_HEIGHT);
    r('next', LEFT_WOOD_X, NAV_WOOD_Y + 2 * WOOD_PLANK_HEIGHT, WOOD_WIDTH, WOOD_PLANK_HEIGHT);
    r('first', LEFT_WOOD_X, NAV_WOOD_Y + 3 * WOOD_PLANK_HEIGHT, WOOD_WIDTH, WOOD_PLANK_HEIGHT);
    r('last', LEFT_WOOD_X, NAV_WOOD_Y + 4 * WOOD_PLANK_HEIGHT, WOOD_WIDTH, WOOD_PLANK_HEIGHT);
    r('ls_new', RIGHT_WOOD_X, LEVELSET_WOOD_Y + WOOD_PLANK_HEIGHT, WOOD_WIDTH, WOOD_PLANK_HEIGHT);
    r('ls_open', RIGHT_WOOD_X, LEVELSET_WOOD_Y + 2 * WOOD_PLANK_HEIGHT, WOOD_WIDTH, WOOD_PLANK_HEIGHT);
    r('ls_save', RIGHT_WOOD_X, LEVELSET_WOOD_Y + 3 * WOOD_PLANK_HEIGHT, WOOD_WIDTH, WOOD_PLANK_HEIGHT);
    r('ls_delete', RIGHT_WOOD_X, LEVELSET_WOOD_Y + 4 * WOOD_PLANK_HEIGHT, WOOD_WIDTH, WOOD_PLANK_HEIGHT);
    r('lvl_insert', RIGHT_WOOD_X, LEVEL_WOOD_Y + WOOD_PLANK_HEIGHT, WOOD_WIDTH, WOOD_PLANK_HEIGHT);
    r('lvl_append', RIGHT_WOOD_X, LEVEL_WOOD_Y + 2 * WOOD_PLANK_HEIGHT, WOOD_WIDTH, WOOD_PLANK_HEIGHT);
    r('lvl_delete', RIGHT_WOOD_X, LEVEL_WOOD_Y + 3 * WOOD_PLANK_HEIGHT, WOOD_WIDTH, WOOD_PLANK_HEIGHT);
    r('help', RIGHT_WOOD_X, HELP_WOOD_Y, WOOD_WIDTH, WOOD_PLANK_HEIGHT);
    r('bubble_option_highlight', 0, 0, BUBBLE_SIZE, BUBBLE_SIZE);
    r('option_highlight', 0, 0, WOOD_WIDTH, WOOD_PLANK_HEIGHT);
    this.highlight = this.img('hover.gif');
    setAlpha(this.highlight, SRCALPHA, 0x44);
  }
}
