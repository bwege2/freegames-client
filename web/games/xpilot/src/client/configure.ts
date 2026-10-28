// x11/configure.c: the configure menu: pages of option widgets (CONFIG and COLORS buttons) with
// PREV/NEXT/CLOSE and "Save Configuration" (the xpilotrc in the player's storage).
import { G } from './G.ts';
import { XP_OPTFLAG_CONFIG_COLORS, XP_OPTFLAG_CONFIG_DEFAULT } from './consts.ts';
import { MAX, onReset } from './cutil.ts';
import * as X from '../xlib/xlib.ts';
import {
  NO_WIDGET, Widget_create_activate, Widget_create_arrow_left, Widget_create_arrow_right, Widget_create_bool, Widget_create_color,
  Widget_create_confirm, Widget_create_double, Widget_create_form, Widget_create_int, Widget_create_label, Widget_destroy, Widget_draw,
  Widget_map_sub, Widget_raise, Widget_unmap,
} from './widget.ts';
import type { BoolCallback, Callback, DoubleCallback, IntCallback } from './widget.ts';
import {
  Option_by_index, Set_bool_option, Set_double_option, Set_int_option, XPILOTRC, Xpilotrc_write, num_options, xp_bool_option,
  xp_double_option, xp_int_option, xp_option_origin_config,
} from './option.ts';
import type { xp_option_t, Ref } from './option.ts';

export const CONFIG_NONE = 0, CONFIG_DEFAULT = 1, CONFIG_COLORS = 2;

const C = {
  default_option_indices: [] as number[], color_option_indices: [] as number[],
  config_created: false, config_mapped: false, config_page: 0, config_x: 0, config_y: 0, config_width: 0, config_height: 0,
  config_space: 0, config_max: 0, config_button_space: 0, config_text_space: 0, config_text_height: 0, config_button_height: 0,
  config_entry_height: 0, config_bool_width: 0, config_bool_height: 0, config_int_width: 0, config_double_width: 0,
  config_arrow_width: 0, config_arrow_height: 0, config_widget_desc: [] as number[], config_save_confirm_desc: NO_WIDGET,
  config_widget_ids: [] as number[], config_what: CONFIG_NONE,
};
const Cdefaults = { ...C };
onReset(() => Object.assign(C, Cdefaults, { default_option_indices: [], color_option_indices: [], config_widget_desc: [], config_widget_ids: [] }));

function Nelem_config_creator(): number {
  if (C.config_what === CONFIG_DEFAULT) return C.default_option_indices.length + 1;
  if (C.config_what === CONFIG_COLORS) return C.color_option_indices.length + 1;
  return 0;
}

function Config_creator_option(i: number): xp_option_t | null {
  let ind = -1;
  if (C.config_what === CONFIG_DEFAULT && i >= 0 && i < C.default_option_indices.length) ind = C.default_option_indices[i];
  if (C.config_what === CONFIG_COLORS && i >= 0 && i < C.color_option_indices.length) ind = C.color_option_indices[i];
  return Option_by_index(ind);
}

const Update_bool_option: BoolCallback = (_w, data, val) => {
  Set_bool_option(data as xp_option_t, val.value, xp_option_origin_config);
  return 0;
};
const Update_int_option: IntCallback = (_w, data, val) => {
  Set_int_option(data as xp_option_t, val.get(), xp_option_origin_config);
  return 0;
};
const Update_double_option: DoubleCallback = (_w, data, val) => {
  Set_double_option(data as xp_option_t, val.get(), xp_option_origin_config);
  return 0;
};

function Create_config(): void {
  C.config_x = 0;
  C.config_y = G.RadarHeight + G.ButtonHeight + 2;
  C.config_width = 256;
  C.config_height = G.top_height - C.config_y;
  C.config_text_space = 3;
  C.config_text_height = 2 * 1 + G.textFont.ascent + G.textFont.descent;
  C.config_button_space = 3;
  C.config_button_height = G.buttonFont.ascent + G.buttonFont.descent + 2 * 1;
  C.config_entry_height = MAX(C.config_text_height, C.config_button_height);
  C.config_space = 6;
  C.config_bool_width = X.XTextWidth(G.buttonFont, 'Yes', 3) + 2 * C.config_button_space;
  C.config_bool_height = C.config_button_height;
  C.config_arrow_height = C.config_text_height;
  C.config_arrow_width = C.config_text_height;
  C.config_int_width = 4 + X.XTextWidth(G.buttonFont, '10000', 5);
  C.config_double_width = 4 + X.XTextWidth(G.buttonFont, '0.222', 5);
  C.config_max = Nelem_config_creator();
  C.config_widget_desc = new Array<number>(C.config_max).fill(0);
  let num = -1;
  let full = true;
  const height = { value: 0 };
  let i;
  for (i = 0; i < Nelem_config_creator(); i++) {
    const opt = Config_creator_option(i);
    if (full) {
      full = false;
      num++;
      C.config_widget_desc[num] = Widget_create_form(NO_WIDGET, G.topWindow, C.config_x, C.config_y, C.config_width, C.config_height, 0);
      if (C.config_widget_desc[num] === 0) break;
      height.value = C.config_height - C.config_space - C.config_button_height;
      let width = 2 * C.config_button_space + X.XTextWidth(G.buttonFont, 'PREV', 4);
      let offset = Math.trunc((C.config_width - width) / 2);
      if (Widget_create_activate(C.config_widget_desc[num], offset, height.value, width, C.config_button_height, 0, 'PREV', Config_prev, num) === 0) break;
      width = 2 * C.config_button_space + X.XTextWidth(G.buttonFont, 'NEXT', 4);
      offset = C.config_width - width - C.config_space;
      if (Widget_create_activate(C.config_widget_desc[num], offset, height.value, width, C.config_button_height, 0, 'NEXT', Config_next, num) === 0) break;
      width = 2 * C.config_button_space + X.XTextWidth(G.buttonFont, 'CLOSE', 5);
      offset = C.config_space;
      if (Widget_create_activate(C.config_widget_desc[num], offset, height.value, width, C.config_button_height, 0, 'CLOSE', Config_close, num) === 0) break;
      height.value = C.config_space;
    }
    if ((C.config_widget_ids[i] = Config_creator(opt, C.config_widget_desc[num], height)) === 0) {
      i--;
      full = true;
      if (height.value === C.config_space) break;
      continue;
    }
  }
  if (i < Nelem_config_creator()) {
    for (; num >= 0; num--) if (C.config_widget_desc[num] !== 0) Widget_destroy(C.config_widget_desc[num]);
    C.config_created = false;
    C.config_mapped = false;
  } else {
    C.config_max = num + 1;
    C.config_widget_desc.length = C.config_max;
    C.config_page = 0;
    for (let k = 0; k < C.config_max; k++) Widget_map_sub(C.config_widget_desc[k]);
    C.config_created = true;
    C.config_mapped = false;
  }
}

const Config_close: Callback = () => {
  Widget_unmap(C.config_widget_desc[C.config_page]);
  C.config_mapped = false;
  return 0;
};

const Config_next: Callback = () => {
  const prev_page = C.config_page;
  if (C.config_max > 1) {
    C.config_page = (C.config_page + 1) % C.config_max;
    Widget_raise(C.config_widget_desc[C.config_page]);
    Widget_unmap(C.config_widget_desc[prev_page]);
    C.config_mapped = true;
  }
  return 0;
};

const Config_prev: Callback = () => {
  const prev_page = C.config_page;
  if (C.config_max > 1) {
    C.config_page = (C.config_page - 1 + C.config_max) % C.config_max;
    Widget_raise(C.config_widget_desc[C.config_page]);
    Widget_unmap(C.config_widget_desc[prev_page]);
    C.config_mapped = true;
  }
  return 0;
};

/** the label of an entry, on its own line when it does not fit left of the input */
function entry_label(widget_desc: number, height: { value: number }, str: string, offset: number): boolean {
  if (height.value + 2 * C.config_entry_height + 2 * C.config_space >= C.config_height) return false;
  const label_width = X.XTextWidth(G.textFont, str, str.length) + 2 * C.config_text_space;
  if (C.config_space + label_width > offset) {
    if (height.value + 3 * C.config_entry_height + 2 * C.config_space >= C.config_height) return false;
  }
  Widget_create_label(widget_desc, C.config_space, height.value + Math.trunc((C.config_entry_height - C.config_text_height) / 2),
    label_width, C.config_text_height, true, 0, str);
  if (C.config_space + label_width > offset) height.value += C.config_entry_height;
  return true;
}

function Config_create_bool(widget_desc: number, height: { value: number }, str: string, val: boolean, callback: BoolCallback, data: unknown): number {
  const offset = C.config_width - (C.config_space + C.config_bool_width);
  if (!entry_label(widget_desc, height, str, offset)) return 0;
  const boolw = Widget_create_bool(widget_desc, offset, height.value + Math.trunc((C.config_entry_height - C.config_bool_height) / 2),
    C.config_bool_width, C.config_bool_height, 0, val, callback, data);
  height.value += C.config_entry_height + C.config_space;
  return boolw;
}

function arrows(widget_desc: number, height: { value: number }, offset: number, w: number): void {
  const ay = height.value + Math.trunc((C.config_entry_height - C.config_arrow_height) / 2);
  Widget_create_arrow_left(widget_desc, offset, ay, C.config_arrow_width, C.config_arrow_height, 0, w);
  offset += C.config_arrow_width;
  Widget_create_arrow_right(widget_desc, offset, ay, C.config_arrow_width, C.config_arrow_height, 0, w);
  height.value += C.config_entry_height + C.config_space;
}

function Config_create_int(widget_desc: number, height: { value: number }, str: string, val: Ref<number>, min: number, max: number,
  callback: IntCallback, data: unknown): number {
  let offset = C.config_width - (C.config_space + 2 * C.config_arrow_width + C.config_int_width);
  if (!entry_label(widget_desc, height, str, offset)) return 0;
  const intw = Widget_create_int(widget_desc, offset, height.value + Math.trunc((C.config_entry_height - C.config_text_height) / 2),
    C.config_int_width, C.config_text_height, 0, val, min, max, callback, data);
  offset += C.config_int_width;
  arrows(widget_desc, height, offset, intw);
  return intw;
}

function Config_create_color(widget_desc: number, height: { value: number }, color: number, str: string, val: Ref<number>, min: number,
  max: number, callback: IntCallback, data: unknown): number {
  let offset = C.config_width - (C.config_space + 2 * C.config_arrow_width + C.config_int_width);
  if (!entry_label(widget_desc, height, str, offset)) return 0;
  const colw = Widget_create_color(widget_desc, color, offset, height.value + Math.trunc((C.config_entry_height - C.config_text_height) / 2),
    C.config_int_width, C.config_text_height, 0, val, min, max, callback, data);
  offset += C.config_int_width;
  arrows(widget_desc, height, offset, colw);
  return colw;
}

function Config_create_double(widget_desc: number, height: { value: number }, str: string, val: Ref<number>, min: number, max: number,
  callback: DoubleCallback, data: unknown): number {
  let offset = C.config_width - (C.config_space + 2 * C.config_arrow_width + C.config_double_width);
  if (!entry_label(widget_desc, height, str, offset)) return 0;
  const doublew = Widget_create_double(widget_desc, offset, height.value + Math.trunc((C.config_entry_height - C.config_text_height) / 2),
    C.config_double_width, C.config_text_height, 0, val, min, max, callback, data);
  offset += C.config_double_width;
  arrows(widget_desc, height, offset, doublew);
  return doublew;
}

const save_str = 'Save Configuration';

function Config_create_save(widget_desc: number, height: { value: number }): number {
  const width = 2 * C.config_button_space + X.XTextWidth(G.buttonFont, save_str, save_str.length);
  const space = C.config_height - (height.value + 2 * C.config_entry_height + 2 * C.config_space);
  if (space < 0) return 0;
  const button_desc = Widget_create_activate(widget_desc, Math.trunc((C.config_width - width) / 2), height.value + Math.trunc(space / 2),
    width, C.config_button_height, 0, save_str, Config_save, save_str);
  if (button_desc === NO_WIDGET) return 0;
  height.value += C.config_entry_height + C.config_space + space;
  return 1;
}

function Config_creator(opt: xp_option_t | null, widget_desc: number, height: { value: number }): number {
  if (opt === null) return Config_create_save(widget_desc, height);
  if (opt.flags & XP_OPTFLAG_CONFIG_COLORS) {
    return Config_create_color(widget_desc, height, opt.int_ptr!.get(), opt.name, opt.int_ptr!, opt.int_minval!, opt.int_maxval!, Update_int_option, opt);
  }
  if (opt.flags & XP_OPTFLAG_CONFIG_DEFAULT) {
    switch (opt.type) {
      case xp_bool_option:
        return Config_create_bool(widget_desc, height, opt.name, opt.bool_ptr!.get(), Update_bool_option, opt);
      case xp_int_option:
        return Config_create_int(widget_desc, height, opt.name, opt.int_ptr!, opt.int_minval!, opt.int_maxval!, Update_int_option, opt);
      case xp_double_option:
        return Config_create_double(widget_desc, height, opt.name, opt.dbl_ptr!, opt.dbl_minval!, opt.dbl_maxval!, Update_double_option, opt);
      default:
        return 0;
    }
  }
  return 0;
}

function Config_save_failed(reason: string, str: { value: string }): void {
  if (C.config_save_confirm_desc !== NO_WIDGET) Widget_destroy(C.config_save_confirm_desc);
  C.config_save_confirm_desc = Widget_create_confirm(reason, Config_save_confirm_callback);
  if (C.config_save_confirm_desc !== NO_WIDGET) Widget_raise(C.config_save_confirm_desc);
  str.value = 'Saving failed...';
}

const Config_save: Callback = async (widget_desc, button_str, str) => {
  str.value = 'Saving...';
  Widget_draw(widget_desc);
  X.XFlush(G.dpy);
  const retval = await Xpilotrc_write(XPILOTRC);
  if (retval === -1) {
    Config_save_failed("Can't find .xpilotrc file", str);
    return 1;
  }
  if (retval === -2) {
    Config_save_failed("Can't open file to save to.", str);
    return 1;
  }
  if (C.config_save_confirm_desc !== NO_WIDGET) {
    Widget_destroy(C.config_save_confirm_desc);
    C.config_save_confirm_desc = NO_WIDGET;
  }
  str.value = button_str as string;
  return 1;
};

const Config_save_confirm_callback: Callback = (_w, popup_desc) => {
  if (C.config_save_confirm_desc !== NO_WIDGET) {
    Widget_destroy(popup_desc as number);
    C.config_save_confirm_desc = NO_WIDGET;
  }
  return 0;
};

export function Config(doit: boolean, what: number): boolean {
  Config_destroy();
  if (doit === false) return false;
  C.config_what = what;
  Create_config();
  if (C.config_created === false) return false;
  Widget_raise(C.config_widget_desc[C.config_page]);
  C.config_mapped = true;
  return true;
}

export function Config_destroy(): void {
  if (C.config_created) {
    if (C.config_mapped) {
      Widget_unmap(C.config_widget_desc[C.config_page]);
      C.config_mapped = false;
    }
    for (let i = 0; i < C.config_max; i++) Widget_destroy(C.config_widget_desc[i]);
    C.config_created = false;
    C.config_widget_desc = [];
    C.config_max = 0;
    C.config_page = 0;
  }
}

export function Config_resize(): void {
  const mapped = C.config_mapped;
  if (C.config_created) {
    Config_destroy();
    if (mapped) Config(mapped, C.config_what);
  }
}

export function Config_redraw(): void {
  if (!C.config_mapped) return;
  for (let i = 0; i < Nelem_config_creator(); i++) Widget_draw(C.config_widget_ids[i] ?? 0);
}

export function Config_init(): void {
  C.color_option_indices = [];
  C.default_option_indices = [];
  for (let i = 0; i < num_options(); i++) {
    const opt = Option_by_index(i)!;
    if (opt.flags & XP_OPTFLAG_CONFIG_COLORS) C.color_option_indices.push(i);
    else if (opt.flags & XP_OPTFLAG_CONFIG_DEFAULT) C.default_option_indices.push(i);
  }
  C.config_widget_ids = new Array<number>(MAX(C.color_option_indices.length, C.default_option_indices.length) + 1).fill(0);
}
