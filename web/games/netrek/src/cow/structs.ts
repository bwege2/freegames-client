// @ts-nocheck
// The structs and unions of COW 3.3.3, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { $sarr, $arr, $cparr, $cpvals, $mem, $uget, $uset, $mcopy } from '../rt/index.ts';

/** struct (anonymous): 296 bytes */
export class anon_Xlib_h_489 {
  ext_data: struct__XExtData | null = null;
  private1: any = null;
  fd: number = 0;
  private2: number = 0;
  proto_major_version: number = 0;
  proto_minor_version: number = 0;
  vendor: any = null;
  private3: number = 0;
  private4: number = 0;
  private5: number = 0;
  private6: number = 0;
  resource_alloc: any = null;
  byte_order: number = 0;
  bitmap_unit: number = 0;
  bitmap_pad: number = 0;
  bitmap_bit_order: number = 0;
  nformats: number = 0;
  pixmap_format: struct_ScreenFormat | null = null;
  private8: number = 0;
  release: number = 0;
  private9: any = null;
  private10: any = null;
  qlen: number = 0;
  last_request_read: number = 0;
  request: number = 0;
  private11: any = null;
  private12: any = null;
  private13: any = null;
  private14: any = null;
  max_request_size: number = 0;
  db: any = null;
  private15: any = null;
  display_name: any = null;
  default_screen: number = 0;
  nscreens: number = 0;
  screens: struct_Screen | null = null;
  motion_buffer: number = 0;
  private16: number = 0;
  min_keycode: number = 0;
  max_keycode: number = 0;
  private17: any = null;
  private18: any = null;
  private19: number = 0;
  xdefaults: any = null;
  static $of(...a: any[]): anon_Xlib_h_489 {
    const o = new anon_Xlib_h_489();
    const n = a.length;
    if (n > 0) o.ext_data = a[0];
    if (n > 1) o.private1 = a[1];
    if (n > 2) o.fd = a[2];
    if (n > 3) o.private2 = a[3];
    if (n > 4) o.proto_major_version = a[4];
    if (n > 5) o.proto_minor_version = a[5];
    if (n > 6) o.vendor = a[6];
    if (n > 7) o.private3 = a[7];
    if (n > 8) o.private4 = a[8];
    if (n > 9) o.private5 = a[9];
    if (n > 10) o.private6 = a[10];
    if (n > 11) o.resource_alloc = a[11];
    if (n > 12) o.byte_order = a[12];
    if (n > 13) o.bitmap_unit = a[13];
    if (n > 14) o.bitmap_pad = a[14];
    if (n > 15) o.bitmap_bit_order = a[15];
    if (n > 16) o.nformats = a[16];
    if (n > 17) o.pixmap_format = a[17];
    if (n > 18) o.private8 = a[18];
    if (n > 19) o.release = a[19];
    if (n > 20) o.private9 = a[20];
    if (n > 21) o.private10 = a[21];
    if (n > 22) o.qlen = a[22];
    if (n > 23) o.last_request_read = a[23];
    if (n > 24) o.request = a[24];
    if (n > 25) o.private11 = a[25];
    if (n > 26) o.private12 = a[26];
    if (n > 27) o.private13 = a[27];
    if (n > 28) o.private14 = a[28];
    if (n > 29) o.max_request_size = a[29];
    if (n > 30) o.db = a[30];
    if (n > 31) o.private15 = a[31];
    if (n > 32) o.display_name = a[32];
    if (n > 33) o.default_screen = a[33];
    if (n > 34) o.nscreens = a[34];
    if (n > 35) o.screens = a[35];
    if (n > 36) o.motion_buffer = a[36];
    if (n > 37) o.private16 = a[37];
    if (n > 38) o.min_keycode = a[38];
    if (n > 39) o.max_keycode = a[39];
    if (n > 40) o.private17 = a[40];
    if (n > 41) o.private18 = a[41];
    if (n > 42) o.private19 = a[42];
    if (n > 43) o.xdefaults = a[43];
    return o;
  }
  $cp(s: anon_Xlib_h_489): this {
    this.ext_data = s.ext_data;
    this.private1 = s.private1;
    this.fd = s.fd;
    this.private2 = s.private2;
    this.proto_major_version = s.proto_major_version;
    this.proto_minor_version = s.proto_minor_version;
    this.vendor = s.vendor;
    this.private3 = s.private3;
    this.private4 = s.private4;
    this.private5 = s.private5;
    this.private6 = s.private6;
    this.resource_alloc = s.resource_alloc;
    this.byte_order = s.byte_order;
    this.bitmap_unit = s.bitmap_unit;
    this.bitmap_pad = s.bitmap_pad;
    this.bitmap_bit_order = s.bitmap_bit_order;
    this.nformats = s.nformats;
    this.pixmap_format = s.pixmap_format;
    this.private8 = s.private8;
    this.release = s.release;
    this.private9 = s.private9;
    this.private10 = s.private10;
    this.qlen = s.qlen;
    this.last_request_read = s.last_request_read;
    this.request = s.request;
    this.private11 = s.private11;
    this.private12 = s.private12;
    this.private13 = s.private13;
    this.private14 = s.private14;
    this.max_request_size = s.max_request_size;
    this.db = s.db;
    this.private15 = s.private15;
    this.display_name = s.display_name;
    this.default_screen = s.default_screen;
    this.nscreens = s.nscreens;
    this.screens = s.screens;
    this.motion_buffer = s.motion_buffer;
    this.private16 = s.private16;
    this.min_keycode = s.min_keycode;
    this.max_keycode = s.max_keycode;
    this.private17 = s.private17;
    this.private18 = s.private18;
    this.private19 = s.private19;
    this.xdefaults = s.xdefaults;
    return this;
  }
  $clone(): anon_Xlib_h_489 { return new anon_Xlib_h_489().$cp(this); }
  static $size = 296;
  static $layout(): any[] { return [['ext_data', 0, ['p']], ['private1', 8, ['p']], ['fd', 16, ['i', 4, 1]], ['private2', 20, ['i', 4, 1]], ['proto_major_version', 24, ['i', 4, 1]], ['proto_minor_version', 28, ['i', 4, 1]], ['vendor', 32, ['p']], ['private3', 40, ['i', 8, 0]], ['private4', 48, ['i', 8, 0]], ['private5', 56, ['i', 8, 0]], ['private6', 64, ['i', 4, 1]], ['resource_alloc', 72, ['p']], ['byte_order', 80, ['i', 4, 1]], ['bitmap_unit', 84, ['i', 4, 1]], ['bitmap_pad', 88, ['i', 4, 1]], ['bitmap_bit_order', 92, ['i', 4, 1]], ['nformats', 96, ['i', 4, 1]], ['pixmap_format', 104, ['p']], ['private8', 112, ['i', 4, 1]], ['release', 116, ['i', 4, 1]], ['private9', 120, ['p']], ['private10', 128, ['p']], ['qlen', 136, ['i', 4, 1]], ['last_request_read', 144, ['i', 8, 0]], ['request', 152, ['i', 8, 0]], ['private11', 160, ['p']], ['private12', 168, ['p']], ['private13', 176, ['p']], ['private14', 184, ['p']], ['max_request_size', 192, ['i', 4, 0]], ['db', 200, ['p']], ['private15', 208, ['p']], ['display_name', 216, ['p']], ['default_screen', 224, ['i', 4, 1]], ['nscreens', 228, ['i', 4, 1]], ['screens', 232, ['p']], ['motion_buffer', 240, ['i', 8, 0]], ['private16', 248, ['i', 8, 0]], ['min_keycode', 256, ['i', 4, 1]], ['max_keycode', 260, ['i', 4, 1]], ['private17', 264, ['p']], ['private18', 272, ['p']], ['private19', 280, ['i', 4, 1]], ['xdefaults', 288, ['p']]]; }
}

/** union (anonymous): 40 bytes */
export class anon_Xlib_h_901 {
  $m: any;
  $o: number;
  constructor(m: any = null, o = 0) { this.$m = m || $mem(40); this.$o = o; }
  get b(): Int8Array { return $uget(this, 0, ['a', ['i', 1, 1], 20]); }
  set b(v: Int8Array) { $uset(this, 0, ['a', ['i', 1, 1], 20], v); }
  get s(): Int16Array { return $uget(this, 0, ['a', ['i', 2, 1], 10]); }
  set s(v: Int16Array) { $uset(this, 0, ['a', ['i', 2, 1], 10], v); }
  get l(): Float64Array { return $uget(this, 0, ['a', ['i', 8, 1], 5]); }
  set l(v: Float64Array) { $uset(this, 0, ['a', ['i', 8, 1], 5], v); }
  static $of_b(v: any): anon_Xlib_h_901 { const o = new anon_Xlib_h_901(); o.b = v; return o; }
  static $of_s(v: any): anon_Xlib_h_901 { const o = new anon_Xlib_h_901(); o.s = v; return o; }
  static $of_l(v: any): anon_Xlib_h_901 { const o = new anon_Xlib_h_901(); o.l = v; return o; }
  $cp(s: anon_Xlib_h_901): this { $mcopy(this, s, 40); return this; }
  $clone(): anon_Xlib_h_901 { return new anon_Xlib_h_901().$cp(this); }
  static $size = 40;
  static $union = true;
  static $layout(): any[] { return [['b', 0, ['a', ['i', 1, 1], 20]], ['s', 0, ['a', ['i', 2, 1], 10]], ['l', 0, ['a', ['i', 8, 1], 5]]]; }
}

/** struct (anonymous): 24 bytes */
export class anon_defwin_c_53 {
  i_value: number = 0;
  s_value: any = null;
  desc: any = null;
  static $of(...a: any[]): anon_defwin_c_53 {
    const o = new anon_defwin_c_53();
    const n = a.length;
    if (n > 0) o.i_value = a[0];
    if (n > 1) o.s_value = a[1];
    if (n > 2) o.desc = a[2];
    return o;
  }
  $cp(s: anon_defwin_c_53): this {
    this.i_value = s.i_value;
    this.s_value = s.s_value;
    this.desc = s.desc;
    return this;
  }
  $clone(): anon_defwin_c_53 { return new anon_defwin_c_53().$cp(this); }
  static $size = 24;
  static $layout(): any[] { return [['i_value', 0, ['i', 4, 1]], ['s_value', 8, ['p']], ['desc', 16, ['p']]]; }
}

/** struct Depth: 16 bytes */
export class struct_Depth {
  depth: number = 0;
  nvisuals: number = 0;
  visuals: struct_Visual | null = null;
  static $of(...a: any[]): struct_Depth {
    const o = new struct_Depth();
    const n = a.length;
    if (n > 0) o.depth = a[0];
    if (n > 1) o.nvisuals = a[1];
    if (n > 2) o.visuals = a[2];
    return o;
  }
  $cp(s: struct_Depth): this {
    this.depth = s.depth;
    this.nvisuals = s.nvisuals;
    this.visuals = s.visuals;
    return this;
  }
  $clone(): struct_Depth { return new struct_Depth().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['depth', 0, ['i', 4, 1]], ['nvisuals', 4, ['i', 4, 1]], ['visuals', 8, ['p']]]; }
}

/** struct LocPacketInfo: 8 bytes */
export class struct_LocPacketInfo {
  prev: number = 0;
  diskpos: number = 0;
  static $of(...a: any[]): struct_LocPacketInfo {
    const o = new struct_LocPacketInfo();
    const n = a.length;
    if (n > 0) o.prev = a[0];
    if (n > 1) o.diskpos = a[1];
    return o;
  }
  $cp(s: struct_LocPacketInfo): this {
    this.prev = s.prev;
    this.diskpos = s.diskpos;
    return this;
  }
  $clone(): struct_LocPacketInfo { return new struct_LocPacketInfo().$cp(this); }
  static $size = 8;
  static $layout(): any[] { return [['prev', 0, ['i', 4, 1]], ['diskpos', 4, ['i', 4, 0]]]; }
}

/** struct S_Object: 56 bytes */
export class struct_S_Object {
  drawable: number = 0;
  gc: any = null;
  view: number = 0;
  nviews: number = 0;
  width: number = 0;
  height: number = 0;
  cloak: number = 0;
  image: number = 0;
  shape: number = 0;
  static $of(...a: any[]): struct_S_Object {
    const o = new struct_S_Object();
    const n = a.length;
    if (n > 0) o.drawable = a[0];
    if (n > 1) o.gc = a[1];
    if (n > 2) o.view = a[2];
    if (n > 3) o.nviews = a[3];
    if (n > 4) o.width = a[4];
    if (n > 5) o.height = a[5];
    if (n > 6) o.cloak = a[6];
    if (n > 7) o.image = a[7];
    if (n > 8) o.shape = a[8];
    return o;
  }
  $cp(s: struct_S_Object): this {
    this.drawable = s.drawable;
    this.gc = s.gc;
    this.view = s.view;
    this.nviews = s.nviews;
    this.width = s.width;
    this.height = s.height;
    this.cloak = s.cloak;
    this.image = s.image;
    this.shape = s.shape;
    return this;
  }
  $clone(): struct_S_Object { return new struct_S_Object().$cp(this); }
  static $size = 56;
  static $layout(): any[] { return [['drawable', 0, ['i', 8, 0]], ['gc', 8, ['p']], ['view', 16, ['i', 4, 1]], ['nviews', 20, ['i', 4, 1]], ['width', 24, ['i', 4, 1]], ['height', 28, ['i', 4, 1]], ['cloak', 32, ['i', 4, 1]], ['image', 40, ['i', 8, 0]], ['shape', 48, ['i', 8, 0]]]; }
}

/** struct Screen: 128 bytes */
export class struct_Screen {
  ext_data: struct__XExtData | null = null;
  display: any = null;
  root: number = 0;
  width: number = 0;
  height: number = 0;
  mwidth: number = 0;
  mheight: number = 0;
  ndepths: number = 0;
  depths: struct_Depth | null = null;
  root_depth: number = 0;
  root_visual: struct_Visual | null = null;
  default_gc: any = null;
  cmap: number = 0;
  white_pixel: number = 0;
  black_pixel: number = 0;
  max_maps: number = 0;
  min_maps: number = 0;
  backing_store: number = 0;
  save_unders: number = 0;
  root_input_mask: number = 0;
  static $of(...a: any[]): struct_Screen {
    const o = new struct_Screen();
    const n = a.length;
    if (n > 0) o.ext_data = a[0];
    if (n > 1) o.display = a[1];
    if (n > 2) o.root = a[2];
    if (n > 3) o.width = a[3];
    if (n > 4) o.height = a[4];
    if (n > 5) o.mwidth = a[5];
    if (n > 6) o.mheight = a[6];
    if (n > 7) o.ndepths = a[7];
    if (n > 8) o.depths = a[8];
    if (n > 9) o.root_depth = a[9];
    if (n > 10) o.root_visual = a[10];
    if (n > 11) o.default_gc = a[11];
    if (n > 12) o.cmap = a[12];
    if (n > 13) o.white_pixel = a[13];
    if (n > 14) o.black_pixel = a[14];
    if (n > 15) o.max_maps = a[15];
    if (n > 16) o.min_maps = a[16];
    if (n > 17) o.backing_store = a[17];
    if (n > 18) o.save_unders = a[18];
    if (n > 19) o.root_input_mask = a[19];
    return o;
  }
  $cp(s: struct_Screen): this {
    this.ext_data = s.ext_data;
    this.display = s.display;
    this.root = s.root;
    this.width = s.width;
    this.height = s.height;
    this.mwidth = s.mwidth;
    this.mheight = s.mheight;
    this.ndepths = s.ndepths;
    this.depths = s.depths;
    this.root_depth = s.root_depth;
    this.root_visual = s.root_visual;
    this.default_gc = s.default_gc;
    this.cmap = s.cmap;
    this.white_pixel = s.white_pixel;
    this.black_pixel = s.black_pixel;
    this.max_maps = s.max_maps;
    this.min_maps = s.min_maps;
    this.backing_store = s.backing_store;
    this.save_unders = s.save_unders;
    this.root_input_mask = s.root_input_mask;
    return this;
  }
  $clone(): struct_Screen { return new struct_Screen().$cp(this); }
  static $size = 128;
  static $layout(): any[] { return [['ext_data', 0, ['p']], ['display', 8, ['p']], ['root', 16, ['i', 8, 0]], ['width', 24, ['i', 4, 1]], ['height', 28, ['i', 4, 1]], ['mwidth', 32, ['i', 4, 1]], ['mheight', 36, ['i', 4, 1]], ['ndepths', 40, ['i', 4, 1]], ['depths', 48, ['p']], ['root_depth', 56, ['i', 4, 1]], ['root_visual', 64, ['p']], ['default_gc', 72, ['p']], ['cmap', 80, ['i', 8, 0]], ['white_pixel', 88, ['i', 8, 0]], ['black_pixel', 96, ['i', 8, 0]], ['max_maps', 104, ['i', 4, 1]], ['min_maps', 108, ['i', 4, 1]], ['backing_store', 112, ['i', 4, 1]], ['save_unders', 116, ['i', 4, 1]], ['root_input_mask', 120, ['i', 8, 1]]]; }
}

/** struct ScreenFormat: 24 bytes */
export class struct_ScreenFormat {
  ext_data: struct__XExtData | null = null;
  depth: number = 0;
  bits_per_pixel: number = 0;
  scanline_pad: number = 0;
  static $of(...a: any[]): struct_ScreenFormat {
    const o = new struct_ScreenFormat();
    const n = a.length;
    if (n > 0) o.ext_data = a[0];
    if (n > 1) o.depth = a[1];
    if (n > 2) o.bits_per_pixel = a[2];
    if (n > 3) o.scanline_pad = a[3];
    return o;
  }
  $cp(s: struct_ScreenFormat): this {
    this.ext_data = s.ext_data;
    this.depth = s.depth;
    this.bits_per_pixel = s.bits_per_pixel;
    this.scanline_pad = s.scanline_pad;
    return this;
  }
  $clone(): struct_ScreenFormat { return new struct_ScreenFormat().$cp(this); }
  static $size = 24;
  static $layout(): any[] { return [['ext_data', 0, ['p']], ['depth', 8, ['i', 4, 1]], ['bits_per_pixel', 12, ['i', 4, 1]], ['scanline_pad', 16, ['i', 4, 1]]]; }
}

/** struct Sound: 16 bytes */
export class struct_Sound {
  name: any = null;
  priority: number = 0;
  flag: number = 0;
  static $of(...a: any[]): struct_Sound {
    const o = new struct_Sound();
    const n = a.length;
    if (n > 0) o.name = a[0];
    if (n > 1) o.priority = a[1];
    if (n > 2) o.flag = a[2];
    return o;
  }
  $cp(s: struct_Sound): this {
    this.name = s.name;
    this.priority = s.priority;
    this.flag = s.flag;
    return this;
  }
  $clone(): struct_Sound { return new struct_Sound().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['name', 0, ['p']], ['priority', 8, ['i', 4, 1]], ['flag', 12, ['i', 4, 1]]]; }
}

/** struct Visual: 56 bytes */
export class struct_Visual {
  ext_data: struct__XExtData | null = null;
  visualid: number = 0;
  class: number = 0;
  red_mask: number = 0;
  green_mask: number = 0;
  blue_mask: number = 0;
  bits_per_rgb: number = 0;
  map_entries: number = 0;
  static $of(...a: any[]): struct_Visual {
    const o = new struct_Visual();
    const n = a.length;
    if (n > 0) o.ext_data = a[0];
    if (n > 1) o.visualid = a[1];
    if (n > 2) o.class = a[2];
    if (n > 3) o.red_mask = a[3];
    if (n > 4) o.green_mask = a[4];
    if (n > 5) o.blue_mask = a[5];
    if (n > 6) o.bits_per_rgb = a[6];
    if (n > 7) o.map_entries = a[7];
    return o;
  }
  $cp(s: struct_Visual): this {
    this.ext_data = s.ext_data;
    this.visualid = s.visualid;
    this.class = s.class;
    this.red_mask = s.red_mask;
    this.green_mask = s.green_mask;
    this.blue_mask = s.blue_mask;
    this.bits_per_rgb = s.bits_per_rgb;
    this.map_entries = s.map_entries;
    return this;
  }
  $clone(): struct_Visual { return new struct_Visual().$cp(this); }
  static $size = 56;
  static $layout(): any[] { return [['ext_data', 0, ['p']], ['visualid', 8, ['i', 8, 0]], ['class', 16, ['i', 4, 1]], ['red_mask', 24, ['i', 8, 0]], ['green_mask', 32, ['i', 8, 0]], ['blue_mask', 40, ['i', 8, 0]], ['bits_per_rgb', 48, ['i', 4, 1]], ['map_entries', 52, ['i', 4, 1]]]; }
}

/** struct XAnyEvent: 40 bytes */
export class struct_XAnyEvent {
  type: number = 0;
  serial: number = 0;
  send_event: number = 0;
  display: any = null;
  window: number = 0;
  static $of(...a: any[]): struct_XAnyEvent {
    const o = new struct_XAnyEvent();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.serial = a[1];
    if (n > 2) o.send_event = a[2];
    if (n > 3) o.display = a[3];
    if (n > 4) o.window = a[4];
    return o;
  }
  $cp(s: struct_XAnyEvent): this {
    this.type = s.type;
    this.serial = s.serial;
    this.send_event = s.send_event;
    this.display = s.display;
    this.window = s.window;
    return this;
  }
  $clone(): struct_XAnyEvent { return new struct_XAnyEvent().$cp(this); }
  static $size = 40;
  static $layout(): any[] { return [['type', 0, ['i', 4, 1]], ['serial', 8, ['i', 8, 0]], ['send_event', 16, ['i', 4, 1]], ['display', 24, ['p']], ['window', 32, ['i', 8, 0]]]; }
}

/** struct XButtonEvent: 96 bytes */
export class struct_XButtonEvent {
  type: number = 0;
  serial: number = 0;
  send_event: number = 0;
  display: any = null;
  window: number = 0;
  root: number = 0;
  subwindow: number = 0;
  time: number = 0;
  x: number = 0;
  y: number = 0;
  x_root: number = 0;
  y_root: number = 0;
  state: number = 0;
  button: number = 0;
  same_screen: number = 0;
  static $of(...a: any[]): struct_XButtonEvent {
    const o = new struct_XButtonEvent();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.serial = a[1];
    if (n > 2) o.send_event = a[2];
    if (n > 3) o.display = a[3];
    if (n > 4) o.window = a[4];
    if (n > 5) o.root = a[5];
    if (n > 6) o.subwindow = a[6];
    if (n > 7) o.time = a[7];
    if (n > 8) o.x = a[8];
    if (n > 9) o.y = a[9];
    if (n > 10) o.x_root = a[10];
    if (n > 11) o.y_root = a[11];
    if (n > 12) o.state = a[12];
    if (n > 13) o.button = a[13];
    if (n > 14) o.same_screen = a[14];
    return o;
  }
  $cp(s: struct_XButtonEvent): this {
    this.type = s.type;
    this.serial = s.serial;
    this.send_event = s.send_event;
    this.display = s.display;
    this.window = s.window;
    this.root = s.root;
    this.subwindow = s.subwindow;
    this.time = s.time;
    this.x = s.x;
    this.y = s.y;
    this.x_root = s.x_root;
    this.y_root = s.y_root;
    this.state = s.state;
    this.button = s.button;
    this.same_screen = s.same_screen;
    return this;
  }
  $clone(): struct_XButtonEvent { return new struct_XButtonEvent().$cp(this); }
  static $size = 96;
  static $layout(): any[] { return [['type', 0, ['i', 4, 1]], ['serial', 8, ['i', 8, 0]], ['send_event', 16, ['i', 4, 1]], ['display', 24, ['p']], ['window', 32, ['i', 8, 0]], ['root', 40, ['i', 8, 0]], ['subwindow', 48, ['i', 8, 0]], ['time', 56, ['i', 8, 0]], ['x', 64, ['i', 4, 1]], ['y', 68, ['i', 4, 1]], ['x_root', 72, ['i', 4, 1]], ['y_root', 76, ['i', 4, 1]], ['state', 80, ['i', 4, 0]], ['button', 84, ['i', 4, 0]], ['same_screen', 88, ['i', 4, 1]]]; }
}

/** struct XCharStruct: 12 bytes */
export class struct_XCharStruct {
  lbearing: number = 0;
  rbearing: number = 0;
  width: number = 0;
  ascent: number = 0;
  descent: number = 0;
  attributes: number = 0;
  static $of(...a: any[]): struct_XCharStruct {
    const o = new struct_XCharStruct();
    const n = a.length;
    if (n > 0) o.lbearing = a[0];
    if (n > 1) o.rbearing = a[1];
    if (n > 2) o.width = a[2];
    if (n > 3) o.ascent = a[3];
    if (n > 4) o.descent = a[4];
    if (n > 5) o.attributes = a[5];
    return o;
  }
  $cp(s: struct_XCharStruct): this {
    this.lbearing = s.lbearing;
    this.rbearing = s.rbearing;
    this.width = s.width;
    this.ascent = s.ascent;
    this.descent = s.descent;
    this.attributes = s.attributes;
    return this;
  }
  $clone(): struct_XCharStruct { return new struct_XCharStruct().$cp(this); }
  static $size = 12;
  static $layout(): any[] { return [['lbearing', 0, ['i', 2, 1]], ['rbearing', 2, ['i', 2, 1]], ['width', 4, ['i', 2, 1]], ['ascent', 6, ['i', 2, 1]], ['descent', 8, ['i', 2, 1]], ['attributes', 10, ['i', 2, 0]]]; }
}

/** struct XCirculateEvent: 56 bytes */
export class struct_XCirculateEvent {
  type: number = 0;
  serial: number = 0;
  send_event: number = 0;
  display: any = null;
  event: number = 0;
  window: number = 0;
  place: number = 0;
  static $of(...a: any[]): struct_XCirculateEvent {
    const o = new struct_XCirculateEvent();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.serial = a[1];
    if (n > 2) o.send_event = a[2];
    if (n > 3) o.display = a[3];
    if (n > 4) o.event = a[4];
    if (n > 5) o.window = a[5];
    if (n > 6) o.place = a[6];
    return o;
  }
  $cp(s: struct_XCirculateEvent): this {
    this.type = s.type;
    this.serial = s.serial;
    this.send_event = s.send_event;
    this.display = s.display;
    this.event = s.event;
    this.window = s.window;
    this.place = s.place;
    return this;
  }
  $clone(): struct_XCirculateEvent { return new struct_XCirculateEvent().$cp(this); }
  static $size = 56;
  static $layout(): any[] { return [['type', 0, ['i', 4, 1]], ['serial', 8, ['i', 8, 0]], ['send_event', 16, ['i', 4, 1]], ['display', 24, ['p']], ['event', 32, ['i', 8, 0]], ['window', 40, ['i', 8, 0]], ['place', 48, ['i', 4, 1]]]; }
}

/** struct XCirculateRequestEvent: 56 bytes */
export class struct_XCirculateRequestEvent {
  type: number = 0;
  serial: number = 0;
  send_event: number = 0;
  display: any = null;
  parent: number = 0;
  window: number = 0;
  place: number = 0;
  static $of(...a: any[]): struct_XCirculateRequestEvent {
    const o = new struct_XCirculateRequestEvent();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.serial = a[1];
    if (n > 2) o.send_event = a[2];
    if (n > 3) o.display = a[3];
    if (n > 4) o.parent = a[4];
    if (n > 5) o.window = a[5];
    if (n > 6) o.place = a[6];
    return o;
  }
  $cp(s: struct_XCirculateRequestEvent): this {
    this.type = s.type;
    this.serial = s.serial;
    this.send_event = s.send_event;
    this.display = s.display;
    this.parent = s.parent;
    this.window = s.window;
    this.place = s.place;
    return this;
  }
  $clone(): struct_XCirculateRequestEvent { return new struct_XCirculateRequestEvent().$cp(this); }
  static $size = 56;
  static $layout(): any[] { return [['type', 0, ['i', 4, 1]], ['serial', 8, ['i', 8, 0]], ['send_event', 16, ['i', 4, 1]], ['display', 24, ['p']], ['parent', 32, ['i', 8, 0]], ['window', 40, ['i', 8, 0]], ['place', 48, ['i', 4, 1]]]; }
}

/** struct XClassHint: 16 bytes */
export class struct_XClassHint {
  res_name: any = null;
  res_class: any = null;
  static $of(...a: any[]): struct_XClassHint {
    const o = new struct_XClassHint();
    const n = a.length;
    if (n > 0) o.res_name = a[0];
    if (n > 1) o.res_class = a[1];
    return o;
  }
  $cp(s: struct_XClassHint): this {
    this.res_name = s.res_name;
    this.res_class = s.res_class;
    return this;
  }
  $clone(): struct_XClassHint { return new struct_XClassHint().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['res_name', 0, ['p']], ['res_class', 8, ['p']]]; }
}

/** struct XClientMessageEvent: 96 bytes */
export class struct_XClientMessageEvent {
  type: number = 0;
  serial: number = 0;
  send_event: number = 0;
  display: any = null;
  window: number = 0;
  message_type: number = 0;
  format: number = 0;
  data: anon_Xlib_h_901 = new anon_Xlib_h_901();
  static $of(...a: any[]): struct_XClientMessageEvent {
    const o = new struct_XClientMessageEvent();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.serial = a[1];
    if (n > 2) o.send_event = a[2];
    if (n > 3) o.display = a[3];
    if (n > 4) o.window = a[4];
    if (n > 5) o.message_type = a[5];
    if (n > 6) o.format = a[6];
    if (n > 7) o.data = a[7];
    return o;
  }
  $cp(s: struct_XClientMessageEvent): this {
    this.type = s.type;
    this.serial = s.serial;
    this.send_event = s.send_event;
    this.display = s.display;
    this.window = s.window;
    this.message_type = s.message_type;
    this.format = s.format;
    this.data.$cp(s.data);
    return this;
  }
  $clone(): struct_XClientMessageEvent { return new struct_XClientMessageEvent().$cp(this); }
  static $size = 96;
  static $layout(): any[] { return [['type', 0, ['i', 4, 1]], ['serial', 8, ['i', 8, 0]], ['send_event', 16, ['i', 4, 1]], ['display', 24, ['p']], ['window', 32, ['i', 8, 0]], ['message_type', 40, ['i', 8, 0]], ['format', 48, ['i', 4, 1]], ['data', 56, ['r', anon_Xlib_h_901]]]; }
}

/** struct XColor: 16 bytes */
export class struct_XColor {
  pixel: number = 0;
  red: number = 0;
  green: number = 0;
  blue: number = 0;
  flags: number = 0;
  pad: number = 0;
  static $of(...a: any[]): struct_XColor {
    const o = new struct_XColor();
    const n = a.length;
    if (n > 0) o.pixel = a[0];
    if (n > 1) o.red = a[1];
    if (n > 2) o.green = a[2];
    if (n > 3) o.blue = a[3];
    if (n > 4) o.flags = a[4];
    if (n > 5) o.pad = a[5];
    return o;
  }
  $cp(s: struct_XColor): this {
    this.pixel = s.pixel;
    this.red = s.red;
    this.green = s.green;
    this.blue = s.blue;
    this.flags = s.flags;
    this.pad = s.pad;
    return this;
  }
  $clone(): struct_XColor { return new struct_XColor().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['pixel', 0, ['i', 8, 0]], ['red', 8, ['i', 2, 0]], ['green', 10, ['i', 2, 0]], ['blue', 12, ['i', 2, 0]], ['flags', 14, ['i', 1, 1]], ['pad', 15, ['i', 1, 1]]]; }
}

/** struct XColormapEvent: 56 bytes */
export class struct_XColormapEvent {
  type: number = 0;
  serial: number = 0;
  send_event: number = 0;
  display: any = null;
  window: number = 0;
  colormap: number = 0;
  new: number = 0;
  state: number = 0;
  static $of(...a: any[]): struct_XColormapEvent {
    const o = new struct_XColormapEvent();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.serial = a[1];
    if (n > 2) o.send_event = a[2];
    if (n > 3) o.display = a[3];
    if (n > 4) o.window = a[4];
    if (n > 5) o.colormap = a[5];
    if (n > 6) o.new = a[6];
    if (n > 7) o.state = a[7];
    return o;
  }
  $cp(s: struct_XColormapEvent): this {
    this.type = s.type;
    this.serial = s.serial;
    this.send_event = s.send_event;
    this.display = s.display;
    this.window = s.window;
    this.colormap = s.colormap;
    this.new = s.new;
    this.state = s.state;
    return this;
  }
  $clone(): struct_XColormapEvent { return new struct_XColormapEvent().$cp(this); }
  static $size = 56;
  static $layout(): any[] { return [['type', 0, ['i', 4, 1]], ['serial', 8, ['i', 8, 0]], ['send_event', 16, ['i', 4, 1]], ['display', 24, ['p']], ['window', 32, ['i', 8, 0]], ['colormap', 40, ['i', 8, 0]], ['new', 48, ['i', 4, 1]], ['state', 52, ['i', 4, 1]]]; }
}

/** struct XConfigureEvent: 88 bytes */
export class struct_XConfigureEvent {
  type: number = 0;
  serial: number = 0;
  send_event: number = 0;
  display: any = null;
  event: number = 0;
  window: number = 0;
  x: number = 0;
  y: number = 0;
  width: number = 0;
  height: number = 0;
  border_width: number = 0;
  above: number = 0;
  override_redirect: number = 0;
  static $of(...a: any[]): struct_XConfigureEvent {
    const o = new struct_XConfigureEvent();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.serial = a[1];
    if (n > 2) o.send_event = a[2];
    if (n > 3) o.display = a[3];
    if (n > 4) o.event = a[4];
    if (n > 5) o.window = a[5];
    if (n > 6) o.x = a[6];
    if (n > 7) o.y = a[7];
    if (n > 8) o.width = a[8];
    if (n > 9) o.height = a[9];
    if (n > 10) o.border_width = a[10];
    if (n > 11) o.above = a[11];
    if (n > 12) o.override_redirect = a[12];
    return o;
  }
  $cp(s: struct_XConfigureEvent): this {
    this.type = s.type;
    this.serial = s.serial;
    this.send_event = s.send_event;
    this.display = s.display;
    this.event = s.event;
    this.window = s.window;
    this.x = s.x;
    this.y = s.y;
    this.width = s.width;
    this.height = s.height;
    this.border_width = s.border_width;
    this.above = s.above;
    this.override_redirect = s.override_redirect;
    return this;
  }
  $clone(): struct_XConfigureEvent { return new struct_XConfigureEvent().$cp(this); }
  static $size = 88;
  static $layout(): any[] { return [['type', 0, ['i', 4, 1]], ['serial', 8, ['i', 8, 0]], ['send_event', 16, ['i', 4, 1]], ['display', 24, ['p']], ['event', 32, ['i', 8, 0]], ['window', 40, ['i', 8, 0]], ['x', 48, ['i', 4, 1]], ['y', 52, ['i', 4, 1]], ['width', 56, ['i', 4, 1]], ['height', 60, ['i', 4, 1]], ['border_width', 64, ['i', 4, 1]], ['above', 72, ['i', 8, 0]], ['override_redirect', 80, ['i', 4, 1]]]; }
}

/** struct XConfigureRequestEvent: 96 bytes */
export class struct_XConfigureRequestEvent {
  type: number = 0;
  serial: number = 0;
  send_event: number = 0;
  display: any = null;
  parent: number = 0;
  window: number = 0;
  x: number = 0;
  y: number = 0;
  width: number = 0;
  height: number = 0;
  border_width: number = 0;
  above: number = 0;
  detail: number = 0;
  value_mask: number = 0;
  static $of(...a: any[]): struct_XConfigureRequestEvent {
    const o = new struct_XConfigureRequestEvent();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.serial = a[1];
    if (n > 2) o.send_event = a[2];
    if (n > 3) o.display = a[3];
    if (n > 4) o.parent = a[4];
    if (n > 5) o.window = a[5];
    if (n > 6) o.x = a[6];
    if (n > 7) o.y = a[7];
    if (n > 8) o.width = a[8];
    if (n > 9) o.height = a[9];
    if (n > 10) o.border_width = a[10];
    if (n > 11) o.above = a[11];
    if (n > 12) o.detail = a[12];
    if (n > 13) o.value_mask = a[13];
    return o;
  }
  $cp(s: struct_XConfigureRequestEvent): this {
    this.type = s.type;
    this.serial = s.serial;
    this.send_event = s.send_event;
    this.display = s.display;
    this.parent = s.parent;
    this.window = s.window;
    this.x = s.x;
    this.y = s.y;
    this.width = s.width;
    this.height = s.height;
    this.border_width = s.border_width;
    this.above = s.above;
    this.detail = s.detail;
    this.value_mask = s.value_mask;
    return this;
  }
  $clone(): struct_XConfigureRequestEvent { return new struct_XConfigureRequestEvent().$cp(this); }
  static $size = 96;
  static $layout(): any[] { return [['type', 0, ['i', 4, 1]], ['serial', 8, ['i', 8, 0]], ['send_event', 16, ['i', 4, 1]], ['display', 24, ['p']], ['parent', 32, ['i', 8, 0]], ['window', 40, ['i', 8, 0]], ['x', 48, ['i', 4, 1]], ['y', 52, ['i', 4, 1]], ['width', 56, ['i', 4, 1]], ['height', 60, ['i', 4, 1]], ['border_width', 64, ['i', 4, 1]], ['above', 72, ['i', 8, 0]], ['detail', 80, ['i', 4, 1]], ['value_mask', 88, ['i', 8, 0]]]; }
}

/** struct XCreateWindowEvent: 72 bytes */
export class struct_XCreateWindowEvent {
  type: number = 0;
  serial: number = 0;
  send_event: number = 0;
  display: any = null;
  parent: number = 0;
  window: number = 0;
  x: number = 0;
  y: number = 0;
  width: number = 0;
  height: number = 0;
  border_width: number = 0;
  override_redirect: number = 0;
  static $of(...a: any[]): struct_XCreateWindowEvent {
    const o = new struct_XCreateWindowEvent();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.serial = a[1];
    if (n > 2) o.send_event = a[2];
    if (n > 3) o.display = a[3];
    if (n > 4) o.parent = a[4];
    if (n > 5) o.window = a[5];
    if (n > 6) o.x = a[6];
    if (n > 7) o.y = a[7];
    if (n > 8) o.width = a[8];
    if (n > 9) o.height = a[9];
    if (n > 10) o.border_width = a[10];
    if (n > 11) o.override_redirect = a[11];
    return o;
  }
  $cp(s: struct_XCreateWindowEvent): this {
    this.type = s.type;
    this.serial = s.serial;
    this.send_event = s.send_event;
    this.display = s.display;
    this.parent = s.parent;
    this.window = s.window;
    this.x = s.x;
    this.y = s.y;
    this.width = s.width;
    this.height = s.height;
    this.border_width = s.border_width;
    this.override_redirect = s.override_redirect;
    return this;
  }
  $clone(): struct_XCreateWindowEvent { return new struct_XCreateWindowEvent().$cp(this); }
  static $size = 72;
  static $layout(): any[] { return [['type', 0, ['i', 4, 1]], ['serial', 8, ['i', 8, 0]], ['send_event', 16, ['i', 4, 1]], ['display', 24, ['p']], ['parent', 32, ['i', 8, 0]], ['window', 40, ['i', 8, 0]], ['x', 48, ['i', 4, 1]], ['y', 52, ['i', 4, 1]], ['width', 56, ['i', 4, 1]], ['height', 60, ['i', 4, 1]], ['border_width', 64, ['i', 4, 1]], ['override_redirect', 68, ['i', 4, 1]]]; }
}

/** struct XCrossingEvent: 104 bytes */
export class struct_XCrossingEvent {
  type: number = 0;
  serial: number = 0;
  send_event: number = 0;
  display: any = null;
  window: number = 0;
  root: number = 0;
  subwindow: number = 0;
  time: number = 0;
  x: number = 0;
  y: number = 0;
  x_root: number = 0;
  y_root: number = 0;
  mode: number = 0;
  detail: number = 0;
  same_screen: number = 0;
  focus: number = 0;
  state: number = 0;
  static $of(...a: any[]): struct_XCrossingEvent {
    const o = new struct_XCrossingEvent();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.serial = a[1];
    if (n > 2) o.send_event = a[2];
    if (n > 3) o.display = a[3];
    if (n > 4) o.window = a[4];
    if (n > 5) o.root = a[5];
    if (n > 6) o.subwindow = a[6];
    if (n > 7) o.time = a[7];
    if (n > 8) o.x = a[8];
    if (n > 9) o.y = a[9];
    if (n > 10) o.x_root = a[10];
    if (n > 11) o.y_root = a[11];
    if (n > 12) o.mode = a[12];
    if (n > 13) o.detail = a[13];
    if (n > 14) o.same_screen = a[14];
    if (n > 15) o.focus = a[15];
    if (n > 16) o.state = a[16];
    return o;
  }
  $cp(s: struct_XCrossingEvent): this {
    this.type = s.type;
    this.serial = s.serial;
    this.send_event = s.send_event;
    this.display = s.display;
    this.window = s.window;
    this.root = s.root;
    this.subwindow = s.subwindow;
    this.time = s.time;
    this.x = s.x;
    this.y = s.y;
    this.x_root = s.x_root;
    this.y_root = s.y_root;
    this.mode = s.mode;
    this.detail = s.detail;
    this.same_screen = s.same_screen;
    this.focus = s.focus;
    this.state = s.state;
    return this;
  }
  $clone(): struct_XCrossingEvent { return new struct_XCrossingEvent().$cp(this); }
  static $size = 104;
  static $layout(): any[] { return [['type', 0, ['i', 4, 1]], ['serial', 8, ['i', 8, 0]], ['send_event', 16, ['i', 4, 1]], ['display', 24, ['p']], ['window', 32, ['i', 8, 0]], ['root', 40, ['i', 8, 0]], ['subwindow', 48, ['i', 8, 0]], ['time', 56, ['i', 8, 0]], ['x', 64, ['i', 4, 1]], ['y', 68, ['i', 4, 1]], ['x_root', 72, ['i', 4, 1]], ['y_root', 76, ['i', 4, 1]], ['mode', 80, ['i', 4, 1]], ['detail', 84, ['i', 4, 1]], ['same_screen', 88, ['i', 4, 1]], ['focus', 92, ['i', 4, 1]], ['state', 96, ['i', 4, 0]]]; }
}

/** struct XDestroyWindowEvent: 48 bytes */
export class struct_XDestroyWindowEvent {
  type: number = 0;
  serial: number = 0;
  send_event: number = 0;
  display: any = null;
  event: number = 0;
  window: number = 0;
  static $of(...a: any[]): struct_XDestroyWindowEvent {
    const o = new struct_XDestroyWindowEvent();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.serial = a[1];
    if (n > 2) o.send_event = a[2];
    if (n > 3) o.display = a[3];
    if (n > 4) o.event = a[4];
    if (n > 5) o.window = a[5];
    return o;
  }
  $cp(s: struct_XDestroyWindowEvent): this {
    this.type = s.type;
    this.serial = s.serial;
    this.send_event = s.send_event;
    this.display = s.display;
    this.event = s.event;
    this.window = s.window;
    return this;
  }
  $clone(): struct_XDestroyWindowEvent { return new struct_XDestroyWindowEvent().$cp(this); }
  static $size = 48;
  static $layout(): any[] { return [['type', 0, ['i', 4, 1]], ['serial', 8, ['i', 8, 0]], ['send_event', 16, ['i', 4, 1]], ['display', 24, ['p']], ['event', 32, ['i', 8, 0]], ['window', 40, ['i', 8, 0]]]; }
}

/** struct XErrorEvent: 40 bytes */
export class struct_XErrorEvent {
  type: number = 0;
  display: any = null;
  resourceid: number = 0;
  serial: number = 0;
  error_code: number = 0;
  request_code: number = 0;
  minor_code: number = 0;
  static $of(...a: any[]): struct_XErrorEvent {
    const o = new struct_XErrorEvent();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.display = a[1];
    if (n > 2) o.resourceid = a[2];
    if (n > 3) o.serial = a[3];
    if (n > 4) o.error_code = a[4];
    if (n > 5) o.request_code = a[5];
    if (n > 6) o.minor_code = a[6];
    return o;
  }
  $cp(s: struct_XErrorEvent): this {
    this.type = s.type;
    this.display = s.display;
    this.resourceid = s.resourceid;
    this.serial = s.serial;
    this.error_code = s.error_code;
    this.request_code = s.request_code;
    this.minor_code = s.minor_code;
    return this;
  }
  $clone(): struct_XErrorEvent { return new struct_XErrorEvent().$cp(this); }
  static $size = 40;
  static $layout(): any[] { return [['type', 0, ['i', 4, 1]], ['display', 8, ['p']], ['resourceid', 16, ['i', 8, 0]], ['serial', 24, ['i', 8, 0]], ['error_code', 32, ['i', 1, 0]], ['request_code', 33, ['i', 1, 0]], ['minor_code', 34, ['i', 1, 0]]]; }
}

/** struct XExposeEvent: 64 bytes */
export class struct_XExposeEvent {
  type: number = 0;
  serial: number = 0;
  send_event: number = 0;
  display: any = null;
  window: number = 0;
  x: number = 0;
  y: number = 0;
  width: number = 0;
  height: number = 0;
  count: number = 0;
  static $of(...a: any[]): struct_XExposeEvent {
    const o = new struct_XExposeEvent();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.serial = a[1];
    if (n > 2) o.send_event = a[2];
    if (n > 3) o.display = a[3];
    if (n > 4) o.window = a[4];
    if (n > 5) o.x = a[5];
    if (n > 6) o.y = a[6];
    if (n > 7) o.width = a[7];
    if (n > 8) o.height = a[8];
    if (n > 9) o.count = a[9];
    return o;
  }
  $cp(s: struct_XExposeEvent): this {
    this.type = s.type;
    this.serial = s.serial;
    this.send_event = s.send_event;
    this.display = s.display;
    this.window = s.window;
    this.x = s.x;
    this.y = s.y;
    this.width = s.width;
    this.height = s.height;
    this.count = s.count;
    return this;
  }
  $clone(): struct_XExposeEvent { return new struct_XExposeEvent().$cp(this); }
  static $size = 64;
  static $layout(): any[] { return [['type', 0, ['i', 4, 1]], ['serial', 8, ['i', 8, 0]], ['send_event', 16, ['i', 4, 1]], ['display', 24, ['p']], ['window', 32, ['i', 8, 0]], ['x', 40, ['i', 4, 1]], ['y', 44, ['i', 4, 1]], ['width', 48, ['i', 4, 1]], ['height', 52, ['i', 4, 1]], ['count', 56, ['i', 4, 1]]]; }
}

/** struct XF86VidModeModeLine: 40 bytes */
export class struct_XF86VidModeModeLine {
  hdisplay: number = 0;
  hsyncstart: number = 0;
  hsyncend: number = 0;
  htotal: number = 0;
  hskew: number = 0;
  vdisplay: number = 0;
  vsyncstart: number = 0;
  vsyncend: number = 0;
  vtotal: number = 0;
  flags: number = 0;
  privsize: number = 0;
  private: any = null;
  static $of(...a: any[]): struct_XF86VidModeModeLine {
    const o = new struct_XF86VidModeModeLine();
    const n = a.length;
    if (n > 0) o.hdisplay = a[0];
    if (n > 1) o.hsyncstart = a[1];
    if (n > 2) o.hsyncend = a[2];
    if (n > 3) o.htotal = a[3];
    if (n > 4) o.hskew = a[4];
    if (n > 5) o.vdisplay = a[5];
    if (n > 6) o.vsyncstart = a[6];
    if (n > 7) o.vsyncend = a[7];
    if (n > 8) o.vtotal = a[8];
    if (n > 9) o.flags = a[9];
    if (n > 10) o.privsize = a[10];
    if (n > 11) o.private = a[11];
    return o;
  }
  $cp(s: struct_XF86VidModeModeLine): this {
    this.hdisplay = s.hdisplay;
    this.hsyncstart = s.hsyncstart;
    this.hsyncend = s.hsyncend;
    this.htotal = s.htotal;
    this.hskew = s.hskew;
    this.vdisplay = s.vdisplay;
    this.vsyncstart = s.vsyncstart;
    this.vsyncend = s.vsyncend;
    this.vtotal = s.vtotal;
    this.flags = s.flags;
    this.privsize = s.privsize;
    this.private = s.private;
    return this;
  }
  $clone(): struct_XF86VidModeModeLine { return new struct_XF86VidModeModeLine().$cp(this); }
  static $size = 40;
  static $layout(): any[] { return [['hdisplay', 0, ['i', 2, 0]], ['hsyncstart', 2, ['i', 2, 0]], ['hsyncend', 4, ['i', 2, 0]], ['htotal', 6, ['i', 2, 0]], ['hskew', 8, ['i', 2, 0]], ['vdisplay', 10, ['i', 2, 0]], ['vsyncstart', 12, ['i', 2, 0]], ['vsyncend', 14, ['i', 2, 0]], ['vtotal', 16, ['i', 2, 0]], ['flags', 20, ['i', 4, 0]], ['privsize', 24, ['i', 4, 1]], ['private', 32, ['p']]]; }
}

/** struct XFocusChangeEvent: 48 bytes */
export class struct_XFocusChangeEvent {
  type: number = 0;
  serial: number = 0;
  send_event: number = 0;
  display: any = null;
  window: number = 0;
  mode: number = 0;
  detail: number = 0;
  static $of(...a: any[]): struct_XFocusChangeEvent {
    const o = new struct_XFocusChangeEvent();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.serial = a[1];
    if (n > 2) o.send_event = a[2];
    if (n > 3) o.display = a[3];
    if (n > 4) o.window = a[4];
    if (n > 5) o.mode = a[5];
    if (n > 6) o.detail = a[6];
    return o;
  }
  $cp(s: struct_XFocusChangeEvent): this {
    this.type = s.type;
    this.serial = s.serial;
    this.send_event = s.send_event;
    this.display = s.display;
    this.window = s.window;
    this.mode = s.mode;
    this.detail = s.detail;
    return this;
  }
  $clone(): struct_XFocusChangeEvent { return new struct_XFocusChangeEvent().$cp(this); }
  static $size = 48;
  static $layout(): any[] { return [['type', 0, ['i', 4, 1]], ['serial', 8, ['i', 8, 0]], ['send_event', 16, ['i', 4, 1]], ['display', 24, ['p']], ['window', 32, ['i', 8, 0]], ['mode', 40, ['i', 4, 1]], ['detail', 44, ['i', 4, 1]]]; }
}

/** struct XFontProp: 16 bytes */
export class struct_XFontProp {
  name: number = 0;
  card32: number = 0;
  static $of(...a: any[]): struct_XFontProp {
    const o = new struct_XFontProp();
    const n = a.length;
    if (n > 0) o.name = a[0];
    if (n > 1) o.card32 = a[1];
    return o;
  }
  $cp(s: struct_XFontProp): this {
    this.name = s.name;
    this.card32 = s.card32;
    return this;
  }
  $clone(): struct_XFontProp { return new struct_XFontProp().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['name', 0, ['i', 8, 0]], ['card32', 8, ['i', 8, 0]]]; }
}

/** struct XFontStruct: 96 bytes */
export class struct_XFontStruct {
  ext_data: struct__XExtData | null = null;
  fid: number = 0;
  direction: number = 0;
  min_char_or_byte2: number = 0;
  max_char_or_byte2: number = 0;
  min_byte1: number = 0;
  max_byte1: number = 0;
  all_chars_exist: number = 0;
  default_char: number = 0;
  n_properties: number = 0;
  properties: struct_XFontProp | null = null;
  min_bounds: struct_XCharStruct = new struct_XCharStruct();
  max_bounds: struct_XCharStruct = new struct_XCharStruct();
  per_char: struct_XCharStruct | null = null;
  ascent: number = 0;
  descent: number = 0;
  static $of(...a: any[]): struct_XFontStruct {
    const o = new struct_XFontStruct();
    const n = a.length;
    if (n > 0) o.ext_data = a[0];
    if (n > 1) o.fid = a[1];
    if (n > 2) o.direction = a[2];
    if (n > 3) o.min_char_or_byte2 = a[3];
    if (n > 4) o.max_char_or_byte2 = a[4];
    if (n > 5) o.min_byte1 = a[5];
    if (n > 6) o.max_byte1 = a[6];
    if (n > 7) o.all_chars_exist = a[7];
    if (n > 8) o.default_char = a[8];
    if (n > 9) o.n_properties = a[9];
    if (n > 10) o.properties = a[10];
    if (n > 11) o.min_bounds = a[11];
    if (n > 12) o.max_bounds = a[12];
    if (n > 13) o.per_char = a[13];
    if (n > 14) o.ascent = a[14];
    if (n > 15) o.descent = a[15];
    return o;
  }
  $cp(s: struct_XFontStruct): this {
    this.ext_data = s.ext_data;
    this.fid = s.fid;
    this.direction = s.direction;
    this.min_char_or_byte2 = s.min_char_or_byte2;
    this.max_char_or_byte2 = s.max_char_or_byte2;
    this.min_byte1 = s.min_byte1;
    this.max_byte1 = s.max_byte1;
    this.all_chars_exist = s.all_chars_exist;
    this.default_char = s.default_char;
    this.n_properties = s.n_properties;
    this.properties = s.properties;
    this.min_bounds.$cp(s.min_bounds);
    this.max_bounds.$cp(s.max_bounds);
    this.per_char = s.per_char;
    this.ascent = s.ascent;
    this.descent = s.descent;
    return this;
  }
  $clone(): struct_XFontStruct { return new struct_XFontStruct().$cp(this); }
  static $size = 96;
  static $layout(): any[] { return [['ext_data', 0, ['p']], ['fid', 8, ['i', 8, 0]], ['direction', 16, ['i', 4, 0]], ['min_char_or_byte2', 20, ['i', 4, 0]], ['max_char_or_byte2', 24, ['i', 4, 0]], ['min_byte1', 28, ['i', 4, 0]], ['max_byte1', 32, ['i', 4, 0]], ['all_chars_exist', 36, ['i', 4, 1]], ['default_char', 40, ['i', 4, 0]], ['n_properties', 44, ['i', 4, 1]], ['properties', 48, ['p']], ['min_bounds', 56, ['r', struct_XCharStruct]], ['max_bounds', 68, ['r', struct_XCharStruct]], ['per_char', 80, ['p']], ['ascent', 88, ['i', 4, 1]], ['descent', 92, ['i', 4, 1]]]; }
}

/** struct XGCValues: 128 bytes */
export class struct_XGCValues {
  function: number = 0;
  plane_mask: number = 0;
  foreground: number = 0;
  background: number = 0;
  line_width: number = 0;
  line_style: number = 0;
  cap_style: number = 0;
  join_style: number = 0;
  fill_style: number = 0;
  fill_rule: number = 0;
  arc_mode: number = 0;
  tile: number = 0;
  stipple: number = 0;
  ts_x_origin: number = 0;
  ts_y_origin: number = 0;
  font: number = 0;
  subwindow_mode: number = 0;
  graphics_exposures: number = 0;
  clip_x_origin: number = 0;
  clip_y_origin: number = 0;
  clip_mask: number = 0;
  dash_offset: number = 0;
  dashes: number = 0;
  static $of(...a: any[]): struct_XGCValues {
    const o = new struct_XGCValues();
    const n = a.length;
    if (n > 0) o.function = a[0];
    if (n > 1) o.plane_mask = a[1];
    if (n > 2) o.foreground = a[2];
    if (n > 3) o.background = a[3];
    if (n > 4) o.line_width = a[4];
    if (n > 5) o.line_style = a[5];
    if (n > 6) o.cap_style = a[6];
    if (n > 7) o.join_style = a[7];
    if (n > 8) o.fill_style = a[8];
    if (n > 9) o.fill_rule = a[9];
    if (n > 10) o.arc_mode = a[10];
    if (n > 11) o.tile = a[11];
    if (n > 12) o.stipple = a[12];
    if (n > 13) o.ts_x_origin = a[13];
    if (n > 14) o.ts_y_origin = a[14];
    if (n > 15) o.font = a[15];
    if (n > 16) o.subwindow_mode = a[16];
    if (n > 17) o.graphics_exposures = a[17];
    if (n > 18) o.clip_x_origin = a[18];
    if (n > 19) o.clip_y_origin = a[19];
    if (n > 20) o.clip_mask = a[20];
    if (n > 21) o.dash_offset = a[21];
    if (n > 22) o.dashes = a[22];
    return o;
  }
  $cp(s: struct_XGCValues): this {
    this.function = s.function;
    this.plane_mask = s.plane_mask;
    this.foreground = s.foreground;
    this.background = s.background;
    this.line_width = s.line_width;
    this.line_style = s.line_style;
    this.cap_style = s.cap_style;
    this.join_style = s.join_style;
    this.fill_style = s.fill_style;
    this.fill_rule = s.fill_rule;
    this.arc_mode = s.arc_mode;
    this.tile = s.tile;
    this.stipple = s.stipple;
    this.ts_x_origin = s.ts_x_origin;
    this.ts_y_origin = s.ts_y_origin;
    this.font = s.font;
    this.subwindow_mode = s.subwindow_mode;
    this.graphics_exposures = s.graphics_exposures;
    this.clip_x_origin = s.clip_x_origin;
    this.clip_y_origin = s.clip_y_origin;
    this.clip_mask = s.clip_mask;
    this.dash_offset = s.dash_offset;
    this.dashes = s.dashes;
    return this;
  }
  $clone(): struct_XGCValues { return new struct_XGCValues().$cp(this); }
  static $size = 128;
  static $layout(): any[] { return [['function', 0, ['i', 4, 1]], ['plane_mask', 8, ['i', 8, 0]], ['foreground', 16, ['i', 8, 0]], ['background', 24, ['i', 8, 0]], ['line_width', 32, ['i', 4, 1]], ['line_style', 36, ['i', 4, 1]], ['cap_style', 40, ['i', 4, 1]], ['join_style', 44, ['i', 4, 1]], ['fill_style', 48, ['i', 4, 1]], ['fill_rule', 52, ['i', 4, 1]], ['arc_mode', 56, ['i', 4, 1]], ['tile', 64, ['i', 8, 0]], ['stipple', 72, ['i', 8, 0]], ['ts_x_origin', 80, ['i', 4, 1]], ['ts_y_origin', 84, ['i', 4, 1]], ['font', 88, ['i', 8, 0]], ['subwindow_mode', 96, ['i', 4, 1]], ['graphics_exposures', 100, ['i', 4, 1]], ['clip_x_origin', 104, ['i', 4, 1]], ['clip_y_origin', 108, ['i', 4, 1]], ['clip_mask', 112, ['i', 8, 0]], ['dash_offset', 120, ['i', 4, 1]], ['dashes', 124, ['i', 1, 1]]]; }
}

/** struct XGenericEvent: 40 bytes */
export class struct_XGenericEvent {
  type: number = 0;
  serial: number = 0;
  send_event: number = 0;
  display: any = null;
  extension: number = 0;
  evtype: number = 0;
  static $of(...a: any[]): struct_XGenericEvent {
    const o = new struct_XGenericEvent();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.serial = a[1];
    if (n > 2) o.send_event = a[2];
    if (n > 3) o.display = a[3];
    if (n > 4) o.extension = a[4];
    if (n > 5) o.evtype = a[5];
    return o;
  }
  $cp(s: struct_XGenericEvent): this {
    this.type = s.type;
    this.serial = s.serial;
    this.send_event = s.send_event;
    this.display = s.display;
    this.extension = s.extension;
    this.evtype = s.evtype;
    return this;
  }
  $clone(): struct_XGenericEvent { return new struct_XGenericEvent().$cp(this); }
  static $size = 40;
  static $layout(): any[] { return [['type', 0, ['i', 4, 1]], ['serial', 8, ['i', 8, 0]], ['send_event', 16, ['i', 4, 1]], ['display', 24, ['p']], ['extension', 32, ['i', 4, 1]], ['evtype', 36, ['i', 4, 1]]]; }
}

/** struct XGenericEventCookie: 56 bytes */
export class struct_XGenericEventCookie {
  type: number = 0;
  serial: number = 0;
  send_event: number = 0;
  display: any = null;
  extension: number = 0;
  evtype: number = 0;
  cookie: number = 0;
  data: any = null;
  static $of(...a: any[]): struct_XGenericEventCookie {
    const o = new struct_XGenericEventCookie();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.serial = a[1];
    if (n > 2) o.send_event = a[2];
    if (n > 3) o.display = a[3];
    if (n > 4) o.extension = a[4];
    if (n > 5) o.evtype = a[5];
    if (n > 6) o.cookie = a[6];
    if (n > 7) o.data = a[7];
    return o;
  }
  $cp(s: struct_XGenericEventCookie): this {
    this.type = s.type;
    this.serial = s.serial;
    this.send_event = s.send_event;
    this.display = s.display;
    this.extension = s.extension;
    this.evtype = s.evtype;
    this.cookie = s.cookie;
    this.data = s.data;
    return this;
  }
  $clone(): struct_XGenericEventCookie { return new struct_XGenericEventCookie().$cp(this); }
  static $size = 56;
  static $layout(): any[] { return [['type', 0, ['i', 4, 1]], ['serial', 8, ['i', 8, 0]], ['send_event', 16, ['i', 4, 1]], ['display', 24, ['p']], ['extension', 32, ['i', 4, 1]], ['evtype', 36, ['i', 4, 1]], ['cookie', 40, ['i', 4, 0]], ['data', 48, ['p']]]; }
}

/** struct XGraphicsExposeEvent: 72 bytes */
export class struct_XGraphicsExposeEvent {
  type: number = 0;
  serial: number = 0;
  send_event: number = 0;
  display: any = null;
  drawable: number = 0;
  x: number = 0;
  y: number = 0;
  width: number = 0;
  height: number = 0;
  count: number = 0;
  major_code: number = 0;
  minor_code: number = 0;
  static $of(...a: any[]): struct_XGraphicsExposeEvent {
    const o = new struct_XGraphicsExposeEvent();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.serial = a[1];
    if (n > 2) o.send_event = a[2];
    if (n > 3) o.display = a[3];
    if (n > 4) o.drawable = a[4];
    if (n > 5) o.x = a[5];
    if (n > 6) o.y = a[6];
    if (n > 7) o.width = a[7];
    if (n > 8) o.height = a[8];
    if (n > 9) o.count = a[9];
    if (n > 10) o.major_code = a[10];
    if (n > 11) o.minor_code = a[11];
    return o;
  }
  $cp(s: struct_XGraphicsExposeEvent): this {
    this.type = s.type;
    this.serial = s.serial;
    this.send_event = s.send_event;
    this.display = s.display;
    this.drawable = s.drawable;
    this.x = s.x;
    this.y = s.y;
    this.width = s.width;
    this.height = s.height;
    this.count = s.count;
    this.major_code = s.major_code;
    this.minor_code = s.minor_code;
    return this;
  }
  $clone(): struct_XGraphicsExposeEvent { return new struct_XGraphicsExposeEvent().$cp(this); }
  static $size = 72;
  static $layout(): any[] { return [['type', 0, ['i', 4, 1]], ['serial', 8, ['i', 8, 0]], ['send_event', 16, ['i', 4, 1]], ['display', 24, ['p']], ['drawable', 32, ['i', 8, 0]], ['x', 40, ['i', 4, 1]], ['y', 44, ['i', 4, 1]], ['width', 48, ['i', 4, 1]], ['height', 52, ['i', 4, 1]], ['count', 56, ['i', 4, 1]], ['major_code', 60, ['i', 4, 1]], ['minor_code', 64, ['i', 4, 1]]]; }
}

/** struct XGravityEvent: 56 bytes */
export class struct_XGravityEvent {
  type: number = 0;
  serial: number = 0;
  send_event: number = 0;
  display: any = null;
  event: number = 0;
  window: number = 0;
  x: number = 0;
  y: number = 0;
  static $of(...a: any[]): struct_XGravityEvent {
    const o = new struct_XGravityEvent();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.serial = a[1];
    if (n > 2) o.send_event = a[2];
    if (n > 3) o.display = a[3];
    if (n > 4) o.event = a[4];
    if (n > 5) o.window = a[5];
    if (n > 6) o.x = a[6];
    if (n > 7) o.y = a[7];
    return o;
  }
  $cp(s: struct_XGravityEvent): this {
    this.type = s.type;
    this.serial = s.serial;
    this.send_event = s.send_event;
    this.display = s.display;
    this.event = s.event;
    this.window = s.window;
    this.x = s.x;
    this.y = s.y;
    return this;
  }
  $clone(): struct_XGravityEvent { return new struct_XGravityEvent().$cp(this); }
  static $size = 56;
  static $layout(): any[] { return [['type', 0, ['i', 4, 1]], ['serial', 8, ['i', 8, 0]], ['send_event', 16, ['i', 4, 1]], ['display', 24, ['p']], ['event', 32, ['i', 8, 0]], ['window', 40, ['i', 8, 0]], ['x', 48, ['i', 4, 1]], ['y', 52, ['i', 4, 1]]]; }
}

/** struct XKeyEvent: 96 bytes */
export class struct_XKeyEvent {
  type: number = 0;
  serial: number = 0;
  send_event: number = 0;
  display: any = null;
  window: number = 0;
  root: number = 0;
  subwindow: number = 0;
  time: number = 0;
  x: number = 0;
  y: number = 0;
  x_root: number = 0;
  y_root: number = 0;
  state: number = 0;
  keycode: number = 0;
  same_screen: number = 0;
  static $of(...a: any[]): struct_XKeyEvent {
    const o = new struct_XKeyEvent();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.serial = a[1];
    if (n > 2) o.send_event = a[2];
    if (n > 3) o.display = a[3];
    if (n > 4) o.window = a[4];
    if (n > 5) o.root = a[5];
    if (n > 6) o.subwindow = a[6];
    if (n > 7) o.time = a[7];
    if (n > 8) o.x = a[8];
    if (n > 9) o.y = a[9];
    if (n > 10) o.x_root = a[10];
    if (n > 11) o.y_root = a[11];
    if (n > 12) o.state = a[12];
    if (n > 13) o.keycode = a[13];
    if (n > 14) o.same_screen = a[14];
    return o;
  }
  $cp(s: struct_XKeyEvent): this {
    this.type = s.type;
    this.serial = s.serial;
    this.send_event = s.send_event;
    this.display = s.display;
    this.window = s.window;
    this.root = s.root;
    this.subwindow = s.subwindow;
    this.time = s.time;
    this.x = s.x;
    this.y = s.y;
    this.x_root = s.x_root;
    this.y_root = s.y_root;
    this.state = s.state;
    this.keycode = s.keycode;
    this.same_screen = s.same_screen;
    return this;
  }
  $clone(): struct_XKeyEvent { return new struct_XKeyEvent().$cp(this); }
  static $size = 96;
  static $layout(): any[] { return [['type', 0, ['i', 4, 1]], ['serial', 8, ['i', 8, 0]], ['send_event', 16, ['i', 4, 1]], ['display', 24, ['p']], ['window', 32, ['i', 8, 0]], ['root', 40, ['i', 8, 0]], ['subwindow', 48, ['i', 8, 0]], ['time', 56, ['i', 8, 0]], ['x', 64, ['i', 4, 1]], ['y', 68, ['i', 4, 1]], ['x_root', 72, ['i', 4, 1]], ['y_root', 76, ['i', 4, 1]], ['state', 80, ['i', 4, 0]], ['keycode', 84, ['i', 4, 0]], ['same_screen', 88, ['i', 4, 1]]]; }
}

/** struct XKeymapEvent: 72 bytes */
export class struct_XKeymapEvent {
  type: number = 0;
  serial: number = 0;
  send_event: number = 0;
  display: any = null;
  window: number = 0;
  key_vector: Int8Array = new Int8Array(32);
  static $of(...a: any[]): struct_XKeymapEvent {
    const o = new struct_XKeymapEvent();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.serial = a[1];
    if (n > 2) o.send_event = a[2];
    if (n > 3) o.display = a[3];
    if (n > 4) o.window = a[4];
    if (n > 5) o.key_vector = a[5];
    return o;
  }
  $cp(s: struct_XKeymapEvent): this {
    this.type = s.type;
    this.serial = s.serial;
    this.send_event = s.send_event;
    this.display = s.display;
    this.window = s.window;
    this.key_vector.set(s.key_vector);
    return this;
  }
  $clone(): struct_XKeymapEvent { return new struct_XKeymapEvent().$cp(this); }
  static $size = 72;
  static $layout(): any[] { return [['type', 0, ['i', 4, 1]], ['serial', 8, ['i', 8, 0]], ['send_event', 16, ['i', 4, 1]], ['display', 24, ['p']], ['window', 32, ['i', 8, 0]], ['key_vector', 40, ['a', ['i', 1, 1], 32]]]; }
}

/** struct XMapEvent: 56 bytes */
export class struct_XMapEvent {
  type: number = 0;
  serial: number = 0;
  send_event: number = 0;
  display: any = null;
  event: number = 0;
  window: number = 0;
  override_redirect: number = 0;
  static $of(...a: any[]): struct_XMapEvent {
    const o = new struct_XMapEvent();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.serial = a[1];
    if (n > 2) o.send_event = a[2];
    if (n > 3) o.display = a[3];
    if (n > 4) o.event = a[4];
    if (n > 5) o.window = a[5];
    if (n > 6) o.override_redirect = a[6];
    return o;
  }
  $cp(s: struct_XMapEvent): this {
    this.type = s.type;
    this.serial = s.serial;
    this.send_event = s.send_event;
    this.display = s.display;
    this.event = s.event;
    this.window = s.window;
    this.override_redirect = s.override_redirect;
    return this;
  }
  $clone(): struct_XMapEvent { return new struct_XMapEvent().$cp(this); }
  static $size = 56;
  static $layout(): any[] { return [['type', 0, ['i', 4, 1]], ['serial', 8, ['i', 8, 0]], ['send_event', 16, ['i', 4, 1]], ['display', 24, ['p']], ['event', 32, ['i', 8, 0]], ['window', 40, ['i', 8, 0]], ['override_redirect', 48, ['i', 4, 1]]]; }
}

/** struct XMapRequestEvent: 48 bytes */
export class struct_XMapRequestEvent {
  type: number = 0;
  serial: number = 0;
  send_event: number = 0;
  display: any = null;
  parent: number = 0;
  window: number = 0;
  static $of(...a: any[]): struct_XMapRequestEvent {
    const o = new struct_XMapRequestEvent();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.serial = a[1];
    if (n > 2) o.send_event = a[2];
    if (n > 3) o.display = a[3];
    if (n > 4) o.parent = a[4];
    if (n > 5) o.window = a[5];
    return o;
  }
  $cp(s: struct_XMapRequestEvent): this {
    this.type = s.type;
    this.serial = s.serial;
    this.send_event = s.send_event;
    this.display = s.display;
    this.parent = s.parent;
    this.window = s.window;
    return this;
  }
  $clone(): struct_XMapRequestEvent { return new struct_XMapRequestEvent().$cp(this); }
  static $size = 48;
  static $layout(): any[] { return [['type', 0, ['i', 4, 1]], ['serial', 8, ['i', 8, 0]], ['send_event', 16, ['i', 4, 1]], ['display', 24, ['p']], ['parent', 32, ['i', 8, 0]], ['window', 40, ['i', 8, 0]]]; }
}

/** struct XMappingEvent: 56 bytes */
export class struct_XMappingEvent {
  type: number = 0;
  serial: number = 0;
  send_event: number = 0;
  display: any = null;
  window: number = 0;
  request: number = 0;
  first_keycode: number = 0;
  count: number = 0;
  static $of(...a: any[]): struct_XMappingEvent {
    const o = new struct_XMappingEvent();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.serial = a[1];
    if (n > 2) o.send_event = a[2];
    if (n > 3) o.display = a[3];
    if (n > 4) o.window = a[4];
    if (n > 5) o.request = a[5];
    if (n > 6) o.first_keycode = a[6];
    if (n > 7) o.count = a[7];
    return o;
  }
  $cp(s: struct_XMappingEvent): this {
    this.type = s.type;
    this.serial = s.serial;
    this.send_event = s.send_event;
    this.display = s.display;
    this.window = s.window;
    this.request = s.request;
    this.first_keycode = s.first_keycode;
    this.count = s.count;
    return this;
  }
  $clone(): struct_XMappingEvent { return new struct_XMappingEvent().$cp(this); }
  static $size = 56;
  static $layout(): any[] { return [['type', 0, ['i', 4, 1]], ['serial', 8, ['i', 8, 0]], ['send_event', 16, ['i', 4, 1]], ['display', 24, ['p']], ['window', 32, ['i', 8, 0]], ['request', 40, ['i', 4, 1]], ['first_keycode', 44, ['i', 4, 1]], ['count', 48, ['i', 4, 1]]]; }
}

/** struct XMotionEvent: 96 bytes */
export class struct_XMotionEvent {
  type: number = 0;
  serial: number = 0;
  send_event: number = 0;
  display: any = null;
  window: number = 0;
  root: number = 0;
  subwindow: number = 0;
  time: number = 0;
  x: number = 0;
  y: number = 0;
  x_root: number = 0;
  y_root: number = 0;
  state: number = 0;
  is_hint: number = 0;
  same_screen: number = 0;
  static $of(...a: any[]): struct_XMotionEvent {
    const o = new struct_XMotionEvent();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.serial = a[1];
    if (n > 2) o.send_event = a[2];
    if (n > 3) o.display = a[3];
    if (n > 4) o.window = a[4];
    if (n > 5) o.root = a[5];
    if (n > 6) o.subwindow = a[6];
    if (n > 7) o.time = a[7];
    if (n > 8) o.x = a[8];
    if (n > 9) o.y = a[9];
    if (n > 10) o.x_root = a[10];
    if (n > 11) o.y_root = a[11];
    if (n > 12) o.state = a[12];
    if (n > 13) o.is_hint = a[13];
    if (n > 14) o.same_screen = a[14];
    return o;
  }
  $cp(s: struct_XMotionEvent): this {
    this.type = s.type;
    this.serial = s.serial;
    this.send_event = s.send_event;
    this.display = s.display;
    this.window = s.window;
    this.root = s.root;
    this.subwindow = s.subwindow;
    this.time = s.time;
    this.x = s.x;
    this.y = s.y;
    this.x_root = s.x_root;
    this.y_root = s.y_root;
    this.state = s.state;
    this.is_hint = s.is_hint;
    this.same_screen = s.same_screen;
    return this;
  }
  $clone(): struct_XMotionEvent { return new struct_XMotionEvent().$cp(this); }
  static $size = 96;
  static $layout(): any[] { return [['type', 0, ['i', 4, 1]], ['serial', 8, ['i', 8, 0]], ['send_event', 16, ['i', 4, 1]], ['display', 24, ['p']], ['window', 32, ['i', 8, 0]], ['root', 40, ['i', 8, 0]], ['subwindow', 48, ['i', 8, 0]], ['time', 56, ['i', 8, 0]], ['x', 64, ['i', 4, 1]], ['y', 68, ['i', 4, 1]], ['x_root', 72, ['i', 4, 1]], ['y_root', 76, ['i', 4, 1]], ['state', 80, ['i', 4, 0]], ['is_hint', 84, ['i', 1, 1]], ['same_screen', 88, ['i', 4, 1]]]; }
}

/** struct XNoExposeEvent: 48 bytes */
export class struct_XNoExposeEvent {
  type: number = 0;
  serial: number = 0;
  send_event: number = 0;
  display: any = null;
  drawable: number = 0;
  major_code: number = 0;
  minor_code: number = 0;
  static $of(...a: any[]): struct_XNoExposeEvent {
    const o = new struct_XNoExposeEvent();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.serial = a[1];
    if (n > 2) o.send_event = a[2];
    if (n > 3) o.display = a[3];
    if (n > 4) o.drawable = a[4];
    if (n > 5) o.major_code = a[5];
    if (n > 6) o.minor_code = a[6];
    return o;
  }
  $cp(s: struct_XNoExposeEvent): this {
    this.type = s.type;
    this.serial = s.serial;
    this.send_event = s.send_event;
    this.display = s.display;
    this.drawable = s.drawable;
    this.major_code = s.major_code;
    this.minor_code = s.minor_code;
    return this;
  }
  $clone(): struct_XNoExposeEvent { return new struct_XNoExposeEvent().$cp(this); }
  static $size = 48;
  static $layout(): any[] { return [['type', 0, ['i', 4, 1]], ['serial', 8, ['i', 8, 0]], ['send_event', 16, ['i', 4, 1]], ['display', 24, ['p']], ['drawable', 32, ['i', 8, 0]], ['major_code', 40, ['i', 4, 1]], ['minor_code', 44, ['i', 4, 1]]]; }
}

/** struct XPoint: 4 bytes */
export class struct_XPoint {
  x: number = 0;
  y: number = 0;
  static $of(...a: any[]): struct_XPoint {
    const o = new struct_XPoint();
    const n = a.length;
    if (n > 0) o.x = a[0];
    if (n > 1) o.y = a[1];
    return o;
  }
  $cp(s: struct_XPoint): this {
    this.x = s.x;
    this.y = s.y;
    return this;
  }
  $clone(): struct_XPoint { return new struct_XPoint().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['x', 0, ['i', 2, 1]], ['y', 2, ['i', 2, 1]]]; }
}

/** struct XPropertyEvent: 64 bytes */
export class struct_XPropertyEvent {
  type: number = 0;
  serial: number = 0;
  send_event: number = 0;
  display: any = null;
  window: number = 0;
  atom: number = 0;
  time: number = 0;
  state: number = 0;
  static $of(...a: any[]): struct_XPropertyEvent {
    const o = new struct_XPropertyEvent();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.serial = a[1];
    if (n > 2) o.send_event = a[2];
    if (n > 3) o.display = a[3];
    if (n > 4) o.window = a[4];
    if (n > 5) o.atom = a[5];
    if (n > 6) o.time = a[6];
    if (n > 7) o.state = a[7];
    return o;
  }
  $cp(s: struct_XPropertyEvent): this {
    this.type = s.type;
    this.serial = s.serial;
    this.send_event = s.send_event;
    this.display = s.display;
    this.window = s.window;
    this.atom = s.atom;
    this.time = s.time;
    this.state = s.state;
    return this;
  }
  $clone(): struct_XPropertyEvent { return new struct_XPropertyEvent().$cp(this); }
  static $size = 64;
  static $layout(): any[] { return [['type', 0, ['i', 4, 1]], ['serial', 8, ['i', 8, 0]], ['send_event', 16, ['i', 4, 1]], ['display', 24, ['p']], ['window', 32, ['i', 8, 0]], ['atom', 40, ['i', 8, 0]], ['time', 48, ['i', 8, 0]], ['state', 56, ['i', 4, 1]]]; }
}

/** struct XRectangle: 8 bytes */
export class struct_XRectangle {
  x: number = 0;
  y: number = 0;
  width: number = 0;
  height: number = 0;
  static $of(...a: any[]): struct_XRectangle {
    const o = new struct_XRectangle();
    const n = a.length;
    if (n > 0) o.x = a[0];
    if (n > 1) o.y = a[1];
    if (n > 2) o.width = a[2];
    if (n > 3) o.height = a[3];
    return o;
  }
  $cp(s: struct_XRectangle): this {
    this.x = s.x;
    this.y = s.y;
    this.width = s.width;
    this.height = s.height;
    return this;
  }
  $clone(): struct_XRectangle { return new struct_XRectangle().$cp(this); }
  static $size = 8;
  static $layout(): any[] { return [['x', 0, ['i', 2, 1]], ['y', 2, ['i', 2, 1]], ['width', 4, ['i', 2, 0]], ['height', 6, ['i', 2, 0]]]; }
}

/** struct XReparentEvent: 72 bytes */
export class struct_XReparentEvent {
  type: number = 0;
  serial: number = 0;
  send_event: number = 0;
  display: any = null;
  event: number = 0;
  window: number = 0;
  parent: number = 0;
  x: number = 0;
  y: number = 0;
  override_redirect: number = 0;
  static $of(...a: any[]): struct_XReparentEvent {
    const o = new struct_XReparentEvent();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.serial = a[1];
    if (n > 2) o.send_event = a[2];
    if (n > 3) o.display = a[3];
    if (n > 4) o.event = a[4];
    if (n > 5) o.window = a[5];
    if (n > 6) o.parent = a[6];
    if (n > 7) o.x = a[7];
    if (n > 8) o.y = a[8];
    if (n > 9) o.override_redirect = a[9];
    return o;
  }
  $cp(s: struct_XReparentEvent): this {
    this.type = s.type;
    this.serial = s.serial;
    this.send_event = s.send_event;
    this.display = s.display;
    this.event = s.event;
    this.window = s.window;
    this.parent = s.parent;
    this.x = s.x;
    this.y = s.y;
    this.override_redirect = s.override_redirect;
    return this;
  }
  $clone(): struct_XReparentEvent { return new struct_XReparentEvent().$cp(this); }
  static $size = 72;
  static $layout(): any[] { return [['type', 0, ['i', 4, 1]], ['serial', 8, ['i', 8, 0]], ['send_event', 16, ['i', 4, 1]], ['display', 24, ['p']], ['event', 32, ['i', 8, 0]], ['window', 40, ['i', 8, 0]], ['parent', 48, ['i', 8, 0]], ['x', 56, ['i', 4, 1]], ['y', 60, ['i', 4, 1]], ['override_redirect', 64, ['i', 4, 1]]]; }
}

/** struct XResizeRequestEvent: 48 bytes */
export class struct_XResizeRequestEvent {
  type: number = 0;
  serial: number = 0;
  send_event: number = 0;
  display: any = null;
  window: number = 0;
  width: number = 0;
  height: number = 0;
  static $of(...a: any[]): struct_XResizeRequestEvent {
    const o = new struct_XResizeRequestEvent();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.serial = a[1];
    if (n > 2) o.send_event = a[2];
    if (n > 3) o.display = a[3];
    if (n > 4) o.window = a[4];
    if (n > 5) o.width = a[5];
    if (n > 6) o.height = a[6];
    return o;
  }
  $cp(s: struct_XResizeRequestEvent): this {
    this.type = s.type;
    this.serial = s.serial;
    this.send_event = s.send_event;
    this.display = s.display;
    this.window = s.window;
    this.width = s.width;
    this.height = s.height;
    return this;
  }
  $clone(): struct_XResizeRequestEvent { return new struct_XResizeRequestEvent().$cp(this); }
  static $size = 48;
  static $layout(): any[] { return [['type', 0, ['i', 4, 1]], ['serial', 8, ['i', 8, 0]], ['send_event', 16, ['i', 4, 1]], ['display', 24, ['p']], ['window', 32, ['i', 8, 0]], ['width', 40, ['i', 4, 1]], ['height', 44, ['i', 4, 1]]]; }
}

/** struct XSegment: 8 bytes */
export class struct_XSegment {
  x1: number = 0;
  y1: number = 0;
  x2: number = 0;
  y2: number = 0;
  static $of(...a: any[]): struct_XSegment {
    const o = new struct_XSegment();
    const n = a.length;
    if (n > 0) o.x1 = a[0];
    if (n > 1) o.y1 = a[1];
    if (n > 2) o.x2 = a[2];
    if (n > 3) o.y2 = a[3];
    return o;
  }
  $cp(s: struct_XSegment): this {
    this.x1 = s.x1;
    this.y1 = s.y1;
    this.x2 = s.x2;
    this.y2 = s.y2;
    return this;
  }
  $clone(): struct_XSegment { return new struct_XSegment().$cp(this); }
  static $size = 8;
  static $layout(): any[] { return [['x1', 0, ['i', 2, 1]], ['y1', 2, ['i', 2, 1]], ['x2', 4, ['i', 2, 1]], ['y2', 6, ['i', 2, 1]]]; }
}

/** struct XSelectionClearEvent: 56 bytes */
export class struct_XSelectionClearEvent {
  type: number = 0;
  serial: number = 0;
  send_event: number = 0;
  display: any = null;
  window: number = 0;
  selection: number = 0;
  time: number = 0;
  static $of(...a: any[]): struct_XSelectionClearEvent {
    const o = new struct_XSelectionClearEvent();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.serial = a[1];
    if (n > 2) o.send_event = a[2];
    if (n > 3) o.display = a[3];
    if (n > 4) o.window = a[4];
    if (n > 5) o.selection = a[5];
    if (n > 6) o.time = a[6];
    return o;
  }
  $cp(s: struct_XSelectionClearEvent): this {
    this.type = s.type;
    this.serial = s.serial;
    this.send_event = s.send_event;
    this.display = s.display;
    this.window = s.window;
    this.selection = s.selection;
    this.time = s.time;
    return this;
  }
  $clone(): struct_XSelectionClearEvent { return new struct_XSelectionClearEvent().$cp(this); }
  static $size = 56;
  static $layout(): any[] { return [['type', 0, ['i', 4, 1]], ['serial', 8, ['i', 8, 0]], ['send_event', 16, ['i', 4, 1]], ['display', 24, ['p']], ['window', 32, ['i', 8, 0]], ['selection', 40, ['i', 8, 0]], ['time', 48, ['i', 8, 0]]]; }
}

/** struct XSelectionEvent: 72 bytes */
export class struct_XSelectionEvent {
  type: number = 0;
  serial: number = 0;
  send_event: number = 0;
  display: any = null;
  requestor: number = 0;
  selection: number = 0;
  target: number = 0;
  property: number = 0;
  time: number = 0;
  static $of(...a: any[]): struct_XSelectionEvent {
    const o = new struct_XSelectionEvent();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.serial = a[1];
    if (n > 2) o.send_event = a[2];
    if (n > 3) o.display = a[3];
    if (n > 4) o.requestor = a[4];
    if (n > 5) o.selection = a[5];
    if (n > 6) o.target = a[6];
    if (n > 7) o.property = a[7];
    if (n > 8) o.time = a[8];
    return o;
  }
  $cp(s: struct_XSelectionEvent): this {
    this.type = s.type;
    this.serial = s.serial;
    this.send_event = s.send_event;
    this.display = s.display;
    this.requestor = s.requestor;
    this.selection = s.selection;
    this.target = s.target;
    this.property = s.property;
    this.time = s.time;
    return this;
  }
  $clone(): struct_XSelectionEvent { return new struct_XSelectionEvent().$cp(this); }
  static $size = 72;
  static $layout(): any[] { return [['type', 0, ['i', 4, 1]], ['serial', 8, ['i', 8, 0]], ['send_event', 16, ['i', 4, 1]], ['display', 24, ['p']], ['requestor', 32, ['i', 8, 0]], ['selection', 40, ['i', 8, 0]], ['target', 48, ['i', 8, 0]], ['property', 56, ['i', 8, 0]], ['time', 64, ['i', 8, 0]]]; }
}

/** struct XSelectionRequestEvent: 80 bytes */
export class struct_XSelectionRequestEvent {
  type: number = 0;
  serial: number = 0;
  send_event: number = 0;
  display: any = null;
  owner: number = 0;
  requestor: number = 0;
  selection: number = 0;
  target: number = 0;
  property: number = 0;
  time: number = 0;
  static $of(...a: any[]): struct_XSelectionRequestEvent {
    const o = new struct_XSelectionRequestEvent();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.serial = a[1];
    if (n > 2) o.send_event = a[2];
    if (n > 3) o.display = a[3];
    if (n > 4) o.owner = a[4];
    if (n > 5) o.requestor = a[5];
    if (n > 6) o.selection = a[6];
    if (n > 7) o.target = a[7];
    if (n > 8) o.property = a[8];
    if (n > 9) o.time = a[9];
    return o;
  }
  $cp(s: struct_XSelectionRequestEvent): this {
    this.type = s.type;
    this.serial = s.serial;
    this.send_event = s.send_event;
    this.display = s.display;
    this.owner = s.owner;
    this.requestor = s.requestor;
    this.selection = s.selection;
    this.target = s.target;
    this.property = s.property;
    this.time = s.time;
    return this;
  }
  $clone(): struct_XSelectionRequestEvent { return new struct_XSelectionRequestEvent().$cp(this); }
  static $size = 80;
  static $layout(): any[] { return [['type', 0, ['i', 4, 1]], ['serial', 8, ['i', 8, 0]], ['send_event', 16, ['i', 4, 1]], ['display', 24, ['p']], ['owner', 32, ['i', 8, 0]], ['requestor', 40, ['i', 8, 0]], ['selection', 48, ['i', 8, 0]], ['target', 56, ['i', 8, 0]], ['property', 64, ['i', 8, 0]], ['time', 72, ['i', 8, 0]]]; }
}

/** struct XSetWindowAttributes: 112 bytes */
export class struct_XSetWindowAttributes {
  background_pixmap: number = 0;
  background_pixel: number = 0;
  border_pixmap: number = 0;
  border_pixel: number = 0;
  bit_gravity: number = 0;
  win_gravity: number = 0;
  backing_store: number = 0;
  backing_planes: number = 0;
  backing_pixel: number = 0;
  save_under: number = 0;
  event_mask: number = 0;
  do_not_propagate_mask: number = 0;
  override_redirect: number = 0;
  colormap: number = 0;
  cursor: number = 0;
  static $of(...a: any[]): struct_XSetWindowAttributes {
    const o = new struct_XSetWindowAttributes();
    const n = a.length;
    if (n > 0) o.background_pixmap = a[0];
    if (n > 1) o.background_pixel = a[1];
    if (n > 2) o.border_pixmap = a[2];
    if (n > 3) o.border_pixel = a[3];
    if (n > 4) o.bit_gravity = a[4];
    if (n > 5) o.win_gravity = a[5];
    if (n > 6) o.backing_store = a[6];
    if (n > 7) o.backing_planes = a[7];
    if (n > 8) o.backing_pixel = a[8];
    if (n > 9) o.save_under = a[9];
    if (n > 10) o.event_mask = a[10];
    if (n > 11) o.do_not_propagate_mask = a[11];
    if (n > 12) o.override_redirect = a[12];
    if (n > 13) o.colormap = a[13];
    if (n > 14) o.cursor = a[14];
    return o;
  }
  $cp(s: struct_XSetWindowAttributes): this {
    this.background_pixmap = s.background_pixmap;
    this.background_pixel = s.background_pixel;
    this.border_pixmap = s.border_pixmap;
    this.border_pixel = s.border_pixel;
    this.bit_gravity = s.bit_gravity;
    this.win_gravity = s.win_gravity;
    this.backing_store = s.backing_store;
    this.backing_planes = s.backing_planes;
    this.backing_pixel = s.backing_pixel;
    this.save_under = s.save_under;
    this.event_mask = s.event_mask;
    this.do_not_propagate_mask = s.do_not_propagate_mask;
    this.override_redirect = s.override_redirect;
    this.colormap = s.colormap;
    this.cursor = s.cursor;
    return this;
  }
  $clone(): struct_XSetWindowAttributes { return new struct_XSetWindowAttributes().$cp(this); }
  static $size = 112;
  static $layout(): any[] { return [['background_pixmap', 0, ['i', 8, 0]], ['background_pixel', 8, ['i', 8, 0]], ['border_pixmap', 16, ['i', 8, 0]], ['border_pixel', 24, ['i', 8, 0]], ['bit_gravity', 32, ['i', 4, 1]], ['win_gravity', 36, ['i', 4, 1]], ['backing_store', 40, ['i', 4, 1]], ['backing_planes', 48, ['i', 8, 0]], ['backing_pixel', 56, ['i', 8, 0]], ['save_under', 64, ['i', 4, 1]], ['event_mask', 72, ['i', 8, 1]], ['do_not_propagate_mask', 80, ['i', 8, 1]], ['override_redirect', 88, ['i', 4, 1]], ['colormap', 96, ['i', 8, 0]], ['cursor', 104, ['i', 8, 0]]]; }
}

/** struct XUnmapEvent: 56 bytes */
export class struct_XUnmapEvent {
  type: number = 0;
  serial: number = 0;
  send_event: number = 0;
  display: any = null;
  event: number = 0;
  window: number = 0;
  from_configure: number = 0;
  static $of(...a: any[]): struct_XUnmapEvent {
    const o = new struct_XUnmapEvent();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.serial = a[1];
    if (n > 2) o.send_event = a[2];
    if (n > 3) o.display = a[3];
    if (n > 4) o.event = a[4];
    if (n > 5) o.window = a[5];
    if (n > 6) o.from_configure = a[6];
    return o;
  }
  $cp(s: struct_XUnmapEvent): this {
    this.type = s.type;
    this.serial = s.serial;
    this.send_event = s.send_event;
    this.display = s.display;
    this.event = s.event;
    this.window = s.window;
    this.from_configure = s.from_configure;
    return this;
  }
  $clone(): struct_XUnmapEvent { return new struct_XUnmapEvent().$cp(this); }
  static $size = 56;
  static $layout(): any[] { return [['type', 0, ['i', 4, 1]], ['serial', 8, ['i', 8, 0]], ['send_event', 16, ['i', 4, 1]], ['display', 24, ['p']], ['event', 32, ['i', 8, 0]], ['window', 40, ['i', 8, 0]], ['from_configure', 48, ['i', 4, 1]]]; }
}

/** struct XVisibilityEvent: 48 bytes */
export class struct_XVisibilityEvent {
  type: number = 0;
  serial: number = 0;
  send_event: number = 0;
  display: any = null;
  window: number = 0;
  state: number = 0;
  static $of(...a: any[]): struct_XVisibilityEvent {
    const o = new struct_XVisibilityEvent();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.serial = a[1];
    if (n > 2) o.send_event = a[2];
    if (n > 3) o.display = a[3];
    if (n > 4) o.window = a[4];
    if (n > 5) o.state = a[5];
    return o;
  }
  $cp(s: struct_XVisibilityEvent): this {
    this.type = s.type;
    this.serial = s.serial;
    this.send_event = s.send_event;
    this.display = s.display;
    this.window = s.window;
    this.state = s.state;
    return this;
  }
  $clone(): struct_XVisibilityEvent { return new struct_XVisibilityEvent().$cp(this); }
  static $size = 48;
  static $layout(): any[] { return [['type', 0, ['i', 4, 1]], ['serial', 8, ['i', 8, 0]], ['send_event', 16, ['i', 4, 1]], ['display', 24, ['p']], ['window', 32, ['i', 8, 0]], ['state', 40, ['i', 4, 1]]]; }
}

/** struct XWMHints: 56 bytes */
export class struct_XWMHints {
  flags: number = 0;
  input: number = 0;
  initial_state: number = 0;
  icon_pixmap: number = 0;
  icon_window: number = 0;
  icon_x: number = 0;
  icon_y: number = 0;
  icon_mask: number = 0;
  window_group: number = 0;
  static $of(...a: any[]): struct_XWMHints {
    const o = new struct_XWMHints();
    const n = a.length;
    if (n > 0) o.flags = a[0];
    if (n > 1) o.input = a[1];
    if (n > 2) o.initial_state = a[2];
    if (n > 3) o.icon_pixmap = a[3];
    if (n > 4) o.icon_window = a[4];
    if (n > 5) o.icon_x = a[5];
    if (n > 6) o.icon_y = a[6];
    if (n > 7) o.icon_mask = a[7];
    if (n > 8) o.window_group = a[8];
    return o;
  }
  $cp(s: struct_XWMHints): this {
    this.flags = s.flags;
    this.input = s.input;
    this.initial_state = s.initial_state;
    this.icon_pixmap = s.icon_pixmap;
    this.icon_window = s.icon_window;
    this.icon_x = s.icon_x;
    this.icon_y = s.icon_y;
    this.icon_mask = s.icon_mask;
    this.window_group = s.window_group;
    return this;
  }
  $clone(): struct_XWMHints { return new struct_XWMHints().$cp(this); }
  static $size = 56;
  static $layout(): any[] { return [['flags', 0, ['i', 8, 1]], ['input', 8, ['i', 4, 1]], ['initial_state', 12, ['i', 4, 1]], ['icon_pixmap', 16, ['i', 8, 0]], ['icon_window', 24, ['i', 8, 0]], ['icon_x', 32, ['i', 4, 1]], ['icon_y', 36, ['i', 4, 1]], ['icon_mask', 40, ['i', 8, 0]], ['window_group', 48, ['i', 8, 0]]]; }
}

/** struct XWindowAttributes: 136 bytes */
export class struct_XWindowAttributes {
  x: number = 0;
  y: number = 0;
  width: number = 0;
  height: number = 0;
  border_width: number = 0;
  depth: number = 0;
  visual: struct_Visual | null = null;
  root: number = 0;
  class: number = 0;
  bit_gravity: number = 0;
  win_gravity: number = 0;
  backing_store: number = 0;
  backing_planes: number = 0;
  backing_pixel: number = 0;
  save_under: number = 0;
  colormap: number = 0;
  map_installed: number = 0;
  map_state: number = 0;
  all_event_masks: number = 0;
  your_event_mask: number = 0;
  do_not_propagate_mask: number = 0;
  override_redirect: number = 0;
  screen: struct_Screen | null = null;
  static $of(...a: any[]): struct_XWindowAttributes {
    const o = new struct_XWindowAttributes();
    const n = a.length;
    if (n > 0) o.x = a[0];
    if (n > 1) o.y = a[1];
    if (n > 2) o.width = a[2];
    if (n > 3) o.height = a[3];
    if (n > 4) o.border_width = a[4];
    if (n > 5) o.depth = a[5];
    if (n > 6) o.visual = a[6];
    if (n > 7) o.root = a[7];
    if (n > 8) o.class = a[8];
    if (n > 9) o.bit_gravity = a[9];
    if (n > 10) o.win_gravity = a[10];
    if (n > 11) o.backing_store = a[11];
    if (n > 12) o.backing_planes = a[12];
    if (n > 13) o.backing_pixel = a[13];
    if (n > 14) o.save_under = a[14];
    if (n > 15) o.colormap = a[15];
    if (n > 16) o.map_installed = a[16];
    if (n > 17) o.map_state = a[17];
    if (n > 18) o.all_event_masks = a[18];
    if (n > 19) o.your_event_mask = a[19];
    if (n > 20) o.do_not_propagate_mask = a[20];
    if (n > 21) o.override_redirect = a[21];
    if (n > 22) o.screen = a[22];
    return o;
  }
  $cp(s: struct_XWindowAttributes): this {
    this.x = s.x;
    this.y = s.y;
    this.width = s.width;
    this.height = s.height;
    this.border_width = s.border_width;
    this.depth = s.depth;
    this.visual = s.visual;
    this.root = s.root;
    this.class = s.class;
    this.bit_gravity = s.bit_gravity;
    this.win_gravity = s.win_gravity;
    this.backing_store = s.backing_store;
    this.backing_planes = s.backing_planes;
    this.backing_pixel = s.backing_pixel;
    this.save_under = s.save_under;
    this.colormap = s.colormap;
    this.map_installed = s.map_installed;
    this.map_state = s.map_state;
    this.all_event_masks = s.all_event_masks;
    this.your_event_mask = s.your_event_mask;
    this.do_not_propagate_mask = s.do_not_propagate_mask;
    this.override_redirect = s.override_redirect;
    this.screen = s.screen;
    return this;
  }
  $clone(): struct_XWindowAttributes { return new struct_XWindowAttributes().$cp(this); }
  static $size = 136;
  static $layout(): any[] { return [['x', 0, ['i', 4, 1]], ['y', 4, ['i', 4, 1]], ['width', 8, ['i', 4, 1]], ['height', 12, ['i', 4, 1]], ['border_width', 16, ['i', 4, 1]], ['depth', 20, ['i', 4, 1]], ['visual', 24, ['p']], ['root', 32, ['i', 8, 0]], ['class', 40, ['i', 4, 1]], ['bit_gravity', 44, ['i', 4, 1]], ['win_gravity', 48, ['i', 4, 1]], ['backing_store', 52, ['i', 4, 1]], ['backing_planes', 56, ['i', 8, 0]], ['backing_pixel', 64, ['i', 8, 0]], ['save_under', 72, ['i', 4, 1]], ['colormap', 80, ['i', 8, 0]], ['map_installed', 88, ['i', 4, 1]], ['map_state', 92, ['i', 4, 1]], ['all_event_masks', 96, ['i', 8, 1]], ['your_event_mask', 104, ['i', 8, 1]], ['do_not_propagate_mask', 112, ['i', 8, 1]], ['override_redirect', 120, ['i', 4, 1]], ['screen', 128, ['p']]]; }
}

/** struct _XExtData: 32 bytes */
export class struct__XExtData {
  number: number = 0;
  next: struct__XExtData | null = null;
  free_private: any = null;
  private_data: any = null;
  static $of(...a: any[]): struct__XExtData {
    const o = new struct__XExtData();
    const n = a.length;
    if (n > 0) o.number = a[0];
    if (n > 1) o.next = a[1];
    if (n > 2) o.free_private = a[2];
    if (n > 3) o.private_data = a[3];
    return o;
  }
  $cp(s: struct__XExtData): this {
    this.number = s.number;
    this.next = s.next;
    this.free_private = s.free_private;
    this.private_data = s.private_data;
    return this;
  }
  $clone(): struct__XExtData { return new struct__XExtData().$cp(this); }
  static $size = 32;
  static $layout(): any[] { return [['number', 0, ['i', 4, 1]], ['next', 8, ['p']], ['free_private', 16, ['p']], ['private_data', 24, ['p']]]; }
}

/** struct __jmp_buf_tag: 200 bytes */
export class struct___jmp_buf_tag {
  __jmpbuf: Float64Array = new Float64Array(8);
  __mask_was_saved: number = 0;
  __saved_mask: struct___sigset_t = new struct___sigset_t();
  static $of(...a: any[]): struct___jmp_buf_tag {
    const o = new struct___jmp_buf_tag();
    const n = a.length;
    if (n > 0) o.__jmpbuf = a[0];
    if (n > 1) o.__mask_was_saved = a[1];
    if (n > 2) o.__saved_mask = a[2];
    return o;
  }
  $cp(s: struct___jmp_buf_tag): this {
    this.__jmpbuf.set(s.__jmpbuf);
    this.__mask_was_saved = s.__mask_was_saved;
    this.__saved_mask.$cp(s.__saved_mask);
    return this;
  }
  $clone(): struct___jmp_buf_tag { return new struct___jmp_buf_tag().$cp(this); }
  static $size = 200;
  static $layout(): any[] { return [['__jmpbuf', 0, ['a', ['i', 8, 1], 8]], ['__mask_was_saved', 64, ['i', 4, 1]], ['__saved_mask', 72, ['r', struct___sigset_t]]]; }
}

/** struct __sigset_t: 128 bytes */
export class struct___sigset_t {
  __val: Float64Array = new Float64Array(16);
  static $of(...a: any[]): struct___sigset_t {
    const o = new struct___sigset_t();
    const n = a.length;
    if (n > 0) o.__val = a[0];
    return o;
  }
  $cp(s: struct___sigset_t): this {
    this.__val.set(s.__val);
    return this;
  }
  $clone(): struct___sigset_t { return new struct___sigset_t().$cp(this); }
  static $size = 128;
  static $layout(): any[] { return [['__val', 0, ['a', ['i', 8, 0], 16]]]; }
}

/** struct _armies: 20 bytes */
export class struct__armies {
  total: number = 0;
  attack: number = 0;
  reinforce: number = 0;
  ferries: number = 0;
  killed: number = 0;
  static $of(...a: any[]): struct__armies {
    const o = new struct__armies();
    const n = a.length;
    if (n > 0) o.total = a[0];
    if (n > 1) o.attack = a[1];
    if (n > 2) o.reinforce = a[2];
    if (n > 3) o.ferries = a[3];
    if (n > 4) o.killed = a[4];
    return o;
  }
  $cp(s: struct__armies): this {
    this.total = s.total;
    this.attack = s.attack;
    this.reinforce = s.reinforce;
    this.ferries = s.ferries;
    this.killed = s.killed;
    return this;
  }
  $clone(): struct__armies { return new struct__armies().$cp(this); }
  static $size = 20;
  static $layout(): any[] { return [['total', 0, ['i', 4, 0]], ['attack', 4, ['i', 4, 0]], ['reinforce', 8, ['i', 4, 0]], ['ferries', 12, ['i', 4, 0]], ['killed', 16, ['i', 4, 0]]]; }
}

/** struct _bomb: 24 bytes */
export class struct__bomb {
  planets: number = 0;
  planets_8: number = 0;
  planets_core: number = 0;
  armies: number = 0;
  armies_8: number = 0;
  armies_core: number = 0;
  static $of(...a: any[]): struct__bomb {
    const o = new struct__bomb();
    const n = a.length;
    if (n > 0) o.planets = a[0];
    if (n > 1) o.planets_8 = a[1];
    if (n > 2) o.planets_core = a[2];
    if (n > 3) o.armies = a[3];
    if (n > 4) o.armies_8 = a[4];
    if (n > 5) o.armies_core = a[5];
    return o;
  }
  $cp(s: struct__bomb): this {
    this.planets = s.planets;
    this.planets_8 = s.planets_8;
    this.planets_core = s.planets_core;
    this.armies = s.armies;
    this.armies_8 = s.armies_8;
    this.armies_core = s.armies_core;
    return this;
  }
  $clone(): struct__bomb { return new struct__bomb().$cp(this); }
  static $size = 24;
  static $layout(): any[] { return [['planets', 0, ['i', 4, 0]], ['planets_8', 4, ['i', 4, 0]], ['planets_core', 8, ['i', 4, 0]], ['armies', 12, ['i', 4, 0]], ['armies_8', 16, ['i', 4, 0]], ['armies_core', 20, ['i', 4, 0]]]; }
}

/** struct _carries: 24 bytes */
export class struct__carries {
  total: number = 0;
  partial: number = 0;
  completed: number = 0;
  attack: number = 0;
  reinforce: number = 0;
  ferries: number = 0;
  static $of(...a: any[]): struct__carries {
    const o = new struct__carries();
    const n = a.length;
    if (n > 0) o.total = a[0];
    if (n > 1) o.partial = a[1];
    if (n > 2) o.completed = a[2];
    if (n > 3) o.attack = a[3];
    if (n > 4) o.reinforce = a[4];
    if (n > 5) o.ferries = a[5];
    return o;
  }
  $cp(s: struct__carries): this {
    this.total = s.total;
    this.partial = s.partial;
    this.completed = s.completed;
    this.attack = s.attack;
    this.reinforce = s.reinforce;
    this.ferries = s.ferries;
    return this;
  }
  $clone(): struct__carries { return new struct__carries().$cp(this); }
  static $size = 24;
  static $layout(): any[] { return [['total', 0, ['i', 4, 0]], ['partial', 4, ['i', 4, 0]], ['completed', 8, ['i', 4, 0]], ['attack', 12, ['i', 4, 0]], ['reinforce', 16, ['i', 4, 0]], ['ferries', 20, ['i', 4, 0]]]; }
}

/** struct _damage: 8 bytes */
export class struct__damage {
  inflicted: number = 0;
  taken: number = 0;
  static $of(...a: any[]): struct__damage {
    const o = new struct__damage();
    const n = a.length;
    if (n > 0) o.inflicted = a[0];
    if (n > 1) o.taken = a[1];
    return o;
  }
  $cp(s: struct__damage): this {
    this.inflicted = s.inflicted;
    this.taken = s.taken;
    return this;
  }
  $clone(): struct__damage { return new struct__damage().$cp(this); }
  static $size = 8;
  static $layout(): any[] { return [['inflicted', 0, ['i', 4, 0]], ['taken', 4, ['i', 4, 0]]]; }
}

/** struct _deaths: 32 bytes */
export class struct__deaths {
  total: number = 0;
  potential: number = 0;
  converted: number = 0;
  dooshed: number = 0;
  phasered: number = 0;
  torped: number = 0;
  plasmaed: number = 0;
  acc: number = 0;
  static $of(...a: any[]): struct__deaths {
    const o = new struct__deaths();
    const n = a.length;
    if (n > 0) o.total = a[0];
    if (n > 1) o.potential = a[1];
    if (n > 2) o.converted = a[2];
    if (n > 3) o.dooshed = a[3];
    if (n > 4) o.phasered = a[4];
    if (n > 5) o.torped = a[5];
    if (n > 6) o.plasmaed = a[6];
    if (n > 7) o.acc = a[7];
    return o;
  }
  $cp(s: struct__deaths): this {
    this.total = s.total;
    this.potential = s.potential;
    this.converted = s.converted;
    this.dooshed = s.dooshed;
    this.phasered = s.phasered;
    this.torped = s.torped;
    this.plasmaed = s.plasmaed;
    this.acc = s.acc;
    return this;
  }
  $clone(): struct__deaths { return new struct__deaths().$cp(this); }
  static $size = 32;
  static $layout(): any[] { return [['total', 0, ['i', 4, 0]], ['potential', 4, ['i', 4, 0]], ['converted', 8, ['i', 4, 0]], ['dooshed', 12, ['i', 4, 0]], ['phasered', 16, ['i', 4, 0]], ['torped', 20, ['i', 4, 0]], ['plasmaed', 24, ['i', 4, 0]], ['acc', 28, ['i', 4, 0]]]; }
}

/** struct _kills: 48 bytes */
export class struct__kills {
  total: number = 0;
  max: number = 0;
  first: number = 0;
  first_potential: number = 0;
  first_converted: number = 0;
  second: number = 0;
  second_potential: number = 0;
  second_converted: number = 0;
  phasered: number = 0;
  torped: number = 0;
  plasmaed: number = 0;
  static $of(...a: any[]): struct__kills {
    const o = new struct__kills();
    const n = a.length;
    if (n > 0) o.total = a[0];
    if (n > 1) o.max = a[1];
    if (n > 2) o.first = a[2];
    if (n > 3) o.first_potential = a[3];
    if (n > 4) o.first_converted = a[4];
    if (n > 5) o.second = a[5];
    if (n > 6) o.second_potential = a[6];
    if (n > 7) o.second_converted = a[7];
    if (n > 8) o.phasered = a[8];
    if (n > 9) o.torped = a[9];
    if (n > 10) o.plasmaed = a[10];
    return o;
  }
  $cp(s: struct__kills): this {
    this.total = s.total;
    this.max = s.max;
    this.first = s.first;
    this.first_potential = s.first_potential;
    this.first_converted = s.first_converted;
    this.second = s.second;
    this.second_potential = s.second_potential;
    this.second_converted = s.second_converted;
    this.phasered = s.phasered;
    this.torped = s.torped;
    this.plasmaed = s.plasmaed;
    return this;
  }
  $clone(): struct__kills { return new struct__kills().$cp(this); }
  static $size = 48;
  static $layout(): any[] { return [['total', 0, ['i', 4, 0]], ['max', 4, ['d', 8]], ['first', 12, ['i', 4, 0]], ['first_potential', 16, ['i', 4, 0]], ['first_converted', 20, ['i', 4, 0]], ['second', 24, ['i', 4, 0]], ['second_potential', 28, ['i', 4, 0]], ['second_converted', 32, ['i', 4, 0]], ['phasered', 36, ['i', 4, 0]], ['torped', 40, ['i', 4, 0]], ['plasmaed', 44, ['i', 4, 0]]]; }
}

/** struct _ogged: 40 bytes */
export class struct__ogged {
  armies: number = 0;
  dooshed: number = 0;
  converted: number = 0;
  potential: number = 0;
  bigger_ship: number = 0;
  same_ship: number = 0;
  smaller_ship: number = 0;
  sb_armies: number = 0;
  friendly: number = 0;
  friendly_armies: number = 0;
  static $of(...a: any[]): struct__ogged {
    const o = new struct__ogged();
    const n = a.length;
    if (n > 0) o.armies = a[0];
    if (n > 1) o.dooshed = a[1];
    if (n > 2) o.converted = a[2];
    if (n > 3) o.potential = a[3];
    if (n > 4) o.bigger_ship = a[4];
    if (n > 5) o.same_ship = a[5];
    if (n > 6) o.smaller_ship = a[6];
    if (n > 7) o.sb_armies = a[7];
    if (n > 8) o.friendly = a[8];
    if (n > 9) o.friendly_armies = a[9];
    return o;
  }
  $cp(s: struct__ogged): this {
    this.armies = s.armies;
    this.dooshed = s.dooshed;
    this.converted = s.converted;
    this.potential = s.potential;
    this.bigger_ship = s.bigger_ship;
    this.same_ship = s.same_ship;
    this.smaller_ship = s.smaller_ship;
    this.sb_armies = s.sb_armies;
    this.friendly = s.friendly;
    this.friendly_armies = s.friendly_armies;
    return this;
  }
  $clone(): struct__ogged { return new struct__ogged().$cp(this); }
  static $size = 40;
  static $layout(): any[] { return [['armies', 0, ['i', 4, 0]], ['dooshed', 4, ['i', 4, 0]], ['converted', 8, ['i', 4, 0]], ['potential', 12, ['i', 4, 0]], ['bigger_ship', 16, ['i', 4, 0]], ['same_ship', 20, ['i', 4, 0]], ['smaller_ship', 24, ['i', 4, 0]], ['sb_armies', 28, ['i', 4, 0]], ['friendly', 32, ['i', 4, 0]], ['friendly_armies', 36, ['i', 4, 0]]]; }
}

/** struct _phaser: 16 bytes */
export class struct__phaser {
  fired: number = 0;
  hit: number = 0;
  damage: struct__damage = new struct__damage();
  static $of(...a: any[]): struct__phaser {
    const o = new struct__phaser();
    const n = a.length;
    if (n > 0) o.fired = a[0];
    if (n > 1) o.hit = a[1];
    if (n > 2) o.damage = a[2];
    return o;
  }
  $cp(s: struct__phaser): this {
    this.fired = s.fired;
    this.hit = s.hit;
    this.damage.$cp(s.damage);
    return this;
  }
  $clone(): struct__phaser { return new struct__phaser().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['fired', 0, ['i', 4, 0]], ['hit', 4, ['i', 4, 0]], ['damage', 8, ['r', struct__damage]]]; }
}

/** struct _planets: 8 bytes */
export class struct__planets {
  taken: number = 0;
  destroyed: number = 0;
  static $of(...a: any[]): struct__planets {
    const o = new struct__planets();
    const n = a.length;
    if (n > 0) o.taken = a[0];
    if (n > 1) o.destroyed = a[1];
    return o;
  }
  $cp(s: struct__planets): this {
    this.taken = s.taken;
    this.destroyed = s.destroyed;
    return this;
  }
  $clone(): struct__planets { return new struct__planets().$cp(this); }
  static $size = 8;
  static $layout(): any[] { return [['taken', 0, ['i', 4, 0]], ['destroyed', 4, ['i', 4, 0]]]; }
}

/** struct _plasma: 24 bytes */
export class struct__plasma {
  fired: number = 0;
  hit: number = 0;
  phasered: number = 0;
  wall: number = 0;
  damage: struct__damage = new struct__damage();
  static $of(...a: any[]): struct__plasma {
    const o = new struct__plasma();
    const n = a.length;
    if (n > 0) o.fired = a[0];
    if (n > 1) o.hit = a[1];
    if (n > 2) o.phasered = a[2];
    if (n > 3) o.wall = a[3];
    if (n > 4) o.damage = a[4];
    return o;
  }
  $cp(s: struct__plasma): this {
    this.fired = s.fired;
    this.hit = s.hit;
    this.phasered = s.phasered;
    this.wall = s.wall;
    this.damage.$cp(s.damage);
    return this;
  }
  $clone(): struct__plasma { return new struct__plasma().$cp(this); }
  static $size = 24;
  static $layout(): any[] { return [['fired', 0, ['i', 4, 0]], ['hit', 4, ['i', 4, 0]], ['phasered', 8, ['i', 4, 0]], ['wall', 12, ['i', 4, 0]], ['damage', 16, ['r', struct__damage]]]; }
}

/** struct _ticks: 56 bytes */
export class struct__ticks {
  total: number = 0;
  yellow: number = 0;
  red: number = 0;
  zone: Uint32Array = new Uint32Array(8);
  potential: number = 0;
  carrier: number = 0;
  repair: number = 0;
  static $of(...a: any[]): struct__ticks {
    const o = new struct__ticks();
    const n = a.length;
    if (n > 0) o.total = a[0];
    if (n > 1) o.yellow = a[1];
    if (n > 2) o.red = a[2];
    if (n > 3) o.zone = a[3];
    if (n > 4) o.potential = a[4];
    if (n > 5) o.carrier = a[5];
    if (n > 6) o.repair = a[6];
    return o;
  }
  $cp(s: struct__ticks): this {
    this.total = s.total;
    this.yellow = s.yellow;
    this.red = s.red;
    this.zone.set(s.zone);
    this.potential = s.potential;
    this.carrier = s.carrier;
    this.repair = s.repair;
    return this;
  }
  $clone(): struct__ticks { return new struct__ticks().$cp(this); }
  static $size = 56;
  static $layout(): any[] { return [['total', 0, ['i', 4, 0]], ['yellow', 4, ['i', 4, 0]], ['red', 8, ['i', 4, 0]], ['zone', 12, ['a', ['i', 4, 0], 8]], ['potential', 44, ['i', 4, 0]], ['carrier', 48, ['i', 4, 0]], ['repair', 52, ['i', 4, 0]]]; }
}

/** struct _torp: 28 bytes */
export class struct__torp {
  fired: number = 0;
  hit: number = 0;
  detted: number = 0;
  selfdetted: number = 0;
  wall: number = 0;
  damage: struct__damage = new struct__damage();
  static $of(...a: any[]): struct__torp {
    const o = new struct__torp();
    const n = a.length;
    if (n > 0) o.fired = a[0];
    if (n > 1) o.hit = a[1];
    if (n > 2) o.detted = a[2];
    if (n > 3) o.selfdetted = a[3];
    if (n > 4) o.wall = a[4];
    if (n > 5) o.damage = a[5];
    return o;
  }
  $cp(s: struct__torp): this {
    this.fired = s.fired;
    this.hit = s.hit;
    this.detted = s.detted;
    this.selfdetted = s.selfdetted;
    this.wall = s.wall;
    this.damage.$cp(s.damage);
    return this;
  }
  $clone(): struct__torp { return new struct__torp().$cp(this); }
  static $size = 28;
  static $layout(): any[] { return [['fired', 0, ['i', 4, 0]], ['hit', 4, ['i', 4, 0]], ['detted', 8, ['i', 4, 0]], ['selfdetted', 12, ['i', 4, 0]], ['wall', 16, ['i', 4, 0]], ['damage', 20, ['r', struct__damage]]]; }
}

/** struct _weapons: 68 bytes */
export class struct__weapons {
  phaser: struct__phaser = new struct__phaser();
  torps: struct__torp = new struct__torp();
  plasma: struct__plasma = new struct__plasma();
  static $of(...a: any[]): struct__weapons {
    const o = new struct__weapons();
    const n = a.length;
    if (n > 0) o.phaser = a[0];
    if (n > 1) o.torps = a[1];
    if (n > 2) o.plasma = a[2];
    return o;
  }
  $cp(s: struct__weapons): this {
    this.phaser.$cp(s.phaser);
    this.torps.$cp(s.torps);
    this.plasma.$cp(s.plasma);
    return this;
  }
  $clone(): struct__weapons { return new struct__weapons().$cp(this); }
  static $size = 68;
  static $layout(): any[] { return [['phaser', 0, ['r', struct__phaser]], ['torps', 16, ['r', struct__torp]], ['plasma', 44, ['r', struct__plasma]]]; }
}

/** struct badversion_spacket: 4 bytes */
export class struct_badversion_spacket {
  type: number = 0;
  why: number = 0;
  pad2: number = 0;
  pad3: number = 0;
  static $of(...a: any[]): struct_badversion_spacket {
    const o = new struct_badversion_spacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.why = a[1];
    if (n > 2) o.pad2 = a[2];
    if (n > 3) o.pad3 = a[3];
    return o;
  }
  $cp(s: struct_badversion_spacket): this {
    this.type = s.type;
    this.why = s.why;
    this.pad2 = s.pad2;
    this.pad3 = s.pad3;
    return this;
  }
  $clone(): struct_badversion_spacket { return new struct_badversion_spacket().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['why', 1, ['i', 1, 1]], ['pad2', 2, ['i', 1, 1]], ['pad3', 3, ['i', 1, 1]]]; }
}

/** struct beam_cpacket: 4 bytes */
export class struct_beam_cpacket {
  type: number = 0;
  state: number = 0;
  pad1: number = 0;
  pad2: number = 0;
  static $of(...a: any[]): struct_beam_cpacket {
    const o = new struct_beam_cpacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.state = a[1];
    if (n > 2) o.pad1 = a[2];
    if (n > 3) o.pad2 = a[3];
    return o;
  }
  $cp(s: struct_beam_cpacket): this {
    this.type = s.type;
    this.state = s.state;
    this.pad1 = s.pad1;
    this.pad2 = s.pad2;
    return this;
  }
  $clone(): struct_beam_cpacket { return new struct_beam_cpacket().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['state', 1, ['i', 1, 1]], ['pad1', 2, ['i', 1, 1]], ['pad2', 3, ['i', 1, 1]]]; }
}

/** struct bomb_cpacket: 4 bytes */
export class struct_bomb_cpacket {
  type: number = 0;
  state: number = 0;
  pad1: number = 0;
  pad2: number = 0;
  static $of(...a: any[]): struct_bomb_cpacket {
    const o = new struct_bomb_cpacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.state = a[1];
    if (n > 2) o.pad1 = a[2];
    if (n > 3) o.pad2 = a[3];
    return o;
  }
  $cp(s: struct_bomb_cpacket): this {
    this.type = s.type;
    this.state = s.state;
    this.pad1 = s.pad1;
    this.pad2 = s.pad2;
    return this;
  }
  $clone(): struct_bomb_cpacket { return new struct_bomb_cpacket().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['state', 1, ['i', 1, 1]], ['pad1', 2, ['i', 1, 1]], ['pad2', 3, ['i', 1, 1]]]; }
}

/** struct cloak_cpacket: 4 bytes */
export class struct_cloak_cpacket {
  type: number = 0;
  state: number = 0;
  pad1: number = 0;
  pad2: number = 0;
  static $of(...a: any[]): struct_cloak_cpacket {
    const o = new struct_cloak_cpacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.state = a[1];
    if (n > 2) o.pad1 = a[2];
    if (n > 3) o.pad2 = a[3];
    return o;
  }
  $cp(s: struct_cloak_cpacket): this {
    this.type = s.type;
    this.state = s.state;
    this.pad1 = s.pad1;
    this.pad2 = s.pad2;
    return this;
  }
  $clone(): struct_cloak_cpacket { return new struct_cloak_cpacket().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['state', 1, ['i', 1, 1]], ['pad1', 2, ['i', 1, 1]], ['pad2', 3, ['i', 1, 1]]]; }
}

/** struct colors: 104 bytes */
export class struct_colors {
  name: any = null;
  contexts: any[] = new Array(5).fill(null);
  insens_contexts: any[] = new Array(5).fill(null);
  pixmap: number = 0;
  pixelValue: number = 0;
  static $of(...a: any[]): struct_colors {
    const o = new struct_colors();
    const n = a.length;
    if (n > 0) o.name = a[0];
    if (n > 1) o.contexts = a[1];
    if (n > 2) o.insens_contexts = a[2];
    if (n > 3) o.pixmap = a[3];
    if (n > 4) o.pixelValue = a[4];
    return o;
  }
  $cp(s: struct_colors): this {
    this.name = s.name;
    $cpvals(this.contexts, s.contexts);
    $cpvals(this.insens_contexts, s.insens_contexts);
    this.pixmap = s.pixmap;
    this.pixelValue = s.pixelValue;
    return this;
  }
  $clone(): struct_colors { return new struct_colors().$cp(this); }
  static $size = 104;
  static $layout(): any[] { return [['name', 0, ['p']], ['contexts', 8, ['a', ['p'], 5]], ['insens_contexts', 48, ['a', ['p'], 5]], ['pixmap', 88, ['i', 8, 0]], ['pixelValue', 96, ['i', 4, 1]]]; }
}

/** struct context: 10 bytes */
export class struct_context {
  gameup: number = 0;
  tournament_teams: number = 0;
  tournament_age: number = 0;
  tournament_age_units: number = 0;
  tournament_remain: number = 0;
  tournament_remain_units: number = 0;
  starbase_remain: number = 0;
  team_remain: number = 0;
  static $of(...a: any[]): struct_context {
    const o = new struct_context();
    const n = a.length;
    if (n > 0) o.gameup = a[0];
    if (n > 1) o.tournament_teams = a[1];
    if (n > 2) o.tournament_age = a[2];
    if (n > 3) o.tournament_age_units = a[3];
    if (n > 4) o.tournament_remain = a[4];
    if (n > 5) o.tournament_remain_units = a[5];
    if (n > 6) o.starbase_remain = a[6];
    if (n > 7) o.team_remain = a[7];
    return o;
  }
  $cp(s: struct_context): this {
    this.gameup = s.gameup;
    this.tournament_teams = s.tournament_teams;
    this.tournament_age = s.tournament_age;
    this.tournament_age_units = s.tournament_age_units;
    this.tournament_remain = s.tournament_remain;
    this.tournament_remain_units = s.tournament_remain_units;
    this.starbase_remain = s.starbase_remain;
    this.team_remain = s.team_remain;
    return this;
  }
  $clone(): struct_context { return new struct_context().$cp(this); }
  static $size = 10;
  static $layout(): any[] { return [['gameup', 0, ['i', 2, 1]], ['tournament_teams', 2, ['i', 1, 0]], ['tournament_age', 3, ['i', 1, 0]], ['tournament_age_units', 4, ['i', 1, 1]], ['tournament_remain', 5, ['i', 1, 0]], ['tournament_remain_units', 6, ['i', 1, 1]], ['starbase_remain', 7, ['i', 1, 0]], ['team_remain', 8, ['i', 1, 0]]]; }
}

/** struct copilot_cpacket: 4 bytes */
export class struct_copilot_cpacket {
  type: number = 0;
  state: number = 0;
  pad1: number = 0;
  pad2: number = 0;
  static $of(...a: any[]): struct_copilot_cpacket {
    const o = new struct_copilot_cpacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.state = a[1];
    if (n > 2) o.pad1 = a[2];
    if (n > 3) o.pad2 = a[3];
    return o;
  }
  $cp(s: struct_copilot_cpacket): this {
    this.type = s.type;
    this.state = s.state;
    this.pad1 = s.pad1;
    this.pad2 = s.pad2;
    return this;
  }
  $clone(): struct_copilot_cpacket { return new struct_copilot_cpacket().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['state', 1, ['i', 1, 1]], ['pad1', 2, ['i', 1, 1]], ['pad2', 3, ['i', 1, 1]]]; }
}

/** struct def: 272 bytes */
export class struct_def {
  name: any = null;
  type: number = 0;
  desc: any = null;
  variable: any = null;
  values: any[] = $sarr(anon_defwin_c_53, 10);
  static $of(...a: any[]): struct_def {
    const o = new struct_def();
    const n = a.length;
    if (n > 0) o.name = a[0];
    if (n > 1) o.type = a[1];
    if (n > 2) o.desc = a[2];
    if (n > 3) o.variable = a[3];
    if (n > 4) o.values = a[4];
    return o;
  }
  $cp(s: struct_def): this {
    this.name = s.name;
    this.type = s.type;
    this.desc = s.desc;
    this.variable = s.variable;
    $cparr(this.values, s.values);
    return this;
  }
  $clone(): struct_def { return new struct_def().$cp(this); }
  static $size = 272;
  static $layout(): any[] { return [['name', 0, ['p']], ['type', 8, ['i', 4, 1]], ['desc', 16, ['p']], ['variable', 24, ['p']], ['values', 32, ['a', ['r', anon_defwin_c_53], 10]]]; }
}

/** struct det_mytorp_cpacket: 4 bytes */
export class struct_det_mytorp_cpacket {
  type: number = 0;
  pad1: number = 0;
  tnum: number = 0;
  static $of(...a: any[]): struct_det_mytorp_cpacket {
    const o = new struct_det_mytorp_cpacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.pad1 = a[1];
    if (n > 2) o.tnum = a[2];
    return o;
  }
  $cp(s: struct_det_mytorp_cpacket): this {
    this.type = s.type;
    this.pad1 = s.pad1;
    this.tnum = s.tnum;
    return this;
  }
  $clone(): struct_det_mytorp_cpacket { return new struct_det_mytorp_cpacket().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['pad1', 1, ['i', 1, 1]], ['tnum', 2, ['i', 2, 0]]]; }
}

/** struct dir_cpacket: 4 bytes */
export class struct_dir_cpacket {
  type: number = 0;
  dir: number = 0;
  pad1: number = 0;
  pad2: number = 0;
  static $of(...a: any[]): struct_dir_cpacket {
    const o = new struct_dir_cpacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.dir = a[1];
    if (n > 2) o.pad1 = a[2];
    if (n > 3) o.pad2 = a[3];
    return o;
  }
  $cp(s: struct_dir_cpacket): this {
    this.type = s.type;
    this.dir = s.dir;
    this.pad1 = s.pad1;
    this.pad2 = s.pad2;
    return this;
  }
  $clone(): struct_dir_cpacket { return new struct_dir_cpacket().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['dir', 1, ['i', 1, 0]], ['pad1', 2, ['i', 1, 1]], ['pad2', 3, ['i', 1, 1]]]; }
}

/** struct distress: 109 bytes */
export class struct_distress {
  sender: number = 0;
  dam: number = 0;
  shld: number = 0;
  arms: number = 0;
  wtmp: number = 0;
  etmp: number = 0;
  fuelp: number = 0;
  sts: number = 0;
  wtmpflag: number = 0;
  etempflag: number = 0;
  cloakflag: number = 0;
  distype: number = 0;
  macroflag: number = 0;
  close_pl: number = 0;
  close_en: number = 0;
  tclose_pl: number = 0;
  tclose_en: number = 0;
  pre_app: number = 0;
  i: number = 0;
  close_j: number = 0;
  close_fr: number = 0;
  tclose_j: number = 0;
  tclose_fr: number = 0;
  cclist: Uint8Array = new Uint8Array(6);
  preappend: Int8Array = new Int8Array(80);
  static $of(...a: any[]): struct_distress {
    const o = new struct_distress();
    const n = a.length;
    if (n > 0) o.sender = a[0];
    if (n > 1) o.dam = a[1];
    if (n > 2) o.shld = a[2];
    if (n > 3) o.arms = a[3];
    if (n > 4) o.wtmp = a[4];
    if (n > 5) o.etmp = a[5];
    if (n > 6) o.fuelp = a[6];
    if (n > 7) o.sts = a[7];
    if (n > 8) o.wtmpflag = a[8];
    if (n > 9) o.etempflag = a[9];
    if (n > 10) o.cloakflag = a[10];
    if (n > 11) o.distype = a[11];
    if (n > 12) o.macroflag = a[12];
    if (n > 13) o.close_pl = a[13];
    if (n > 14) o.close_en = a[14];
    if (n > 15) o.tclose_pl = a[15];
    if (n > 16) o.tclose_en = a[16];
    if (n > 17) o.pre_app = a[17];
    if (n > 18) o.i = a[18];
    if (n > 19) o.close_j = a[19];
    if (n > 20) o.close_fr = a[20];
    if (n > 21) o.tclose_j = a[21];
    if (n > 22) o.tclose_fr = a[22];
    if (n > 23) o.cclist = a[23];
    if (n > 24) o.preappend = a[24];
    return o;
  }
  $cp(s: struct_distress): this {
    this.sender = s.sender;
    this.dam = s.dam;
    this.shld = s.shld;
    this.arms = s.arms;
    this.wtmp = s.wtmp;
    this.etmp = s.etmp;
    this.fuelp = s.fuelp;
    this.sts = s.sts;
    this.wtmpflag = s.wtmpflag;
    this.etempflag = s.etempflag;
    this.cloakflag = s.cloakflag;
    this.distype = s.distype;
    this.macroflag = s.macroflag;
    this.close_pl = s.close_pl;
    this.close_en = s.close_en;
    this.tclose_pl = s.tclose_pl;
    this.tclose_en = s.tclose_en;
    this.pre_app = s.pre_app;
    this.i = s.i;
    this.close_j = s.close_j;
    this.close_fr = s.close_fr;
    this.tclose_j = s.tclose_j;
    this.tclose_fr = s.tclose_fr;
    this.cclist.set(s.cclist);
    this.preappend.set(s.preappend);
    return this;
  }
  $clone(): struct_distress { return new struct_distress().$cp(this); }
  static $size = 109;
  static $layout(): any[] { return [['sender', 0, ['i', 1, 0]], ['dam', 1, ['i', 1, 0]], ['shld', 2, ['i', 1, 0]], ['arms', 3, ['i', 1, 0]], ['wtmp', 4, ['i', 1, 0]], ['etmp', 5, ['i', 1, 0]], ['fuelp', 6, ['i', 1, 0]], ['sts', 7, ['i', 1, 0]], ['wtmpflag', 8, ['i', 1, 0]], ['etempflag', 9, ['i', 1, 0]], ['cloakflag', 10, ['i', 1, 0]], ['distype', 11, ['i', 1, 0]], ['macroflag', 12, ['i', 1, 0]], ['close_pl', 13, ['i', 1, 0]], ['close_en', 14, ['i', 1, 0]], ['tclose_pl', 15, ['i', 1, 0]], ['tclose_en', 16, ['i', 1, 0]], ['pre_app', 17, ['i', 1, 0]], ['i', 18, ['i', 1, 0]], ['close_j', 19, ['i', 1, 0]], ['close_fr', 20, ['i', 1, 0]], ['tclose_j', 21, ['i', 1, 0]], ['tclose_fr', 22, ['i', 1, 0]], ['cclist', 23, ['a', ['i', 1, 0], 6]], ['preappend', 29, ['a', ['i', 1, 1], 80]]]; }
}

/** struct dmacro_list: 24 bytes */
export class struct_dmacro_list {
  c: number = 0;
  name: any = null;
  macro: any = null;
  static $of(...a: any[]): struct_dmacro_list {
    const o = new struct_dmacro_list();
    const n = a.length;
    if (n > 0) o.c = a[0];
    if (n > 1) o.name = a[1];
    if (n > 2) o.macro = a[2];
    return o;
  }
  $cp(s: struct_dmacro_list): this {
    this.c = s.c;
    this.name = s.name;
    this.macro = s.macro;
    return this;
  }
  $clone(): struct_dmacro_list { return new struct_dmacro_list().$cp(this); }
  static $size = 24;
  static $layout(): any[] { return [['c', 0, ['i', 1, 0]], ['name', 8, ['p']], ['macro', 16, ['p']]]; }
}

/** struct dockperm_cpacket: 4 bytes */
export class struct_dockperm_cpacket {
  type: number = 0;
  state: number = 0;
  pad2: number = 0;
  pad3: number = 0;
  static $of(...a: any[]): struct_dockperm_cpacket {
    const o = new struct_dockperm_cpacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.state = a[1];
    if (n > 2) o.pad2 = a[2];
    if (n > 3) o.pad3 = a[3];
    return o;
  }
  $cp(s: struct_dockperm_cpacket): this {
    this.type = s.type;
    this.state = s.state;
    this.pad2 = s.pad2;
    this.pad3 = s.pad3;
    return this;
  }
  $clone(): struct_dockperm_cpacket { return new struct_dockperm_cpacket().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['state', 1, ['i', 1, 1]], ['pad2', 2, ['i', 1, 1]], ['pad3', 3, ['i', 1, 1]]]; }
}

/** struct event: 32 bytes */
export class struct_event {
  type: number = 0;
  Window: any = null;
  key: number = 0;
  x: number = 0;
  y: number = 0;
  modifier: number = 0;
  static $of(...a: any[]): struct_event {
    const o = new struct_event();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.Window = a[1];
    if (n > 2) o.key = a[2];
    if (n > 3) o.x = a[3];
    if (n > 4) o.y = a[4];
    if (n > 5) o.modifier = a[5];
    return o;
  }
  $cp(s: struct_event): this {
    this.type = s.type;
    this.Window = s.Window;
    this.key = s.key;
    this.x = s.x;
    this.y = s.y;
    this.modifier = s.modifier;
    return this;
  }
  $clone(): struct_event { return new struct_event().$cp(this); }
  static $size = 32;
  static $layout(): any[] { return [['type', 0, ['i', 4, 1]], ['Window', 8, ['p']], ['key', 16, ['i', 1, 0]], ['x', 20, ['i', 4, 1]], ['y', 24, ['i', 4, 1]], ['modifier', 28, ['i', 4, 1]]]; }
}

/** struct fd_set: 128 bytes */
export class struct_fd_set {
  __fds_bits: Float64Array = new Float64Array(16);
  static $of(...a: any[]): struct_fd_set {
    const o = new struct_fd_set();
    const n = a.length;
    if (n > 0) o.__fds_bits = a[0];
    return o;
  }
  $cp(s: struct_fd_set): this {
    this.__fds_bits.set(s.__fds_bits);
    return this;
  }
  $clone(): struct_fd_set { return new struct_fd_set().$cp(this); }
  static $size = 128;
  static $layout(): any[] { return [['__fds_bits', 0, ['a', ['i', 8, 1], 16]]]; }
}

/** struct feature: 40 bytes */
export class struct_feature {
  name: any = null;
  var: any = null;
  feature_type: number = 0;
  value: number = 0;
  arg1: any = null;
  arg2: any = null;
  static $of(...a: any[]): struct_feature {
    const o = new struct_feature();
    const n = a.length;
    if (n > 0) o.name = a[0];
    if (n > 1) o.var = a[1];
    if (n > 2) o.feature_type = a[2];
    if (n > 3) o.value = a[3];
    if (n > 4) o.arg1 = a[4];
    if (n > 5) o.arg2 = a[5];
    return o;
  }
  $cp(s: struct_feature): this {
    this.name = s.name;
    this.var = s.var;
    this.feature_type = s.feature_type;
    this.value = s.value;
    this.arg1 = s.arg1;
    this.arg2 = s.arg2;
    return this;
  }
  $clone(): struct_feature { return new struct_feature().$cp(this); }
  static $size = 40;
  static $layout(): any[] { return [['name', 0, ['p']], ['var', 8, ['p']], ['feature_type', 16, ['i', 1, 1]], ['value', 20, ['i', 4, 1]], ['arg1', 24, ['p']], ['arg2', 32, ['p']]]; }
}

/** struct feature_cpacket: 88 bytes */
export class struct_feature_cpacket {
  type: number = 0;
  feature_type: number = 0;
  arg1: number = 0;
  arg2: number = 0;
  value: number = 0;
  name: Int8Array = new Int8Array(80);
  static $of(...a: any[]): struct_feature_cpacket {
    const o = new struct_feature_cpacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.feature_type = a[1];
    if (n > 2) o.arg1 = a[2];
    if (n > 3) o.arg2 = a[3];
    if (n > 4) o.value = a[4];
    if (n > 5) o.name = a[5];
    return o;
  }
  $cp(s: struct_feature_cpacket): this {
    this.type = s.type;
    this.feature_type = s.feature_type;
    this.arg1 = s.arg1;
    this.arg2 = s.arg2;
    this.value = s.value;
    this.name.set(s.name);
    return this;
  }
  $clone(): struct_feature_cpacket { return new struct_feature_cpacket().$cp(this); }
  static $size = 88;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['feature_type', 1, ['i', 1, 1]], ['arg1', 2, ['i', 1, 1]], ['arg2', 3, ['i', 1, 1]], ['value', 4, ['i', 4, 1]], ['name', 8, ['a', ['i', 1, 1], 80]]]; }
}

/** struct flags_spacket: 8 bytes */
export class struct_flags_spacket {
  type: number = 0;
  pnum: number = 0;
  tractor: number = 0;
  pad2: number = 0;
  flags: number = 0;
  static $of(...a: any[]): struct_flags_spacket {
    const o = new struct_flags_spacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.pnum = a[1];
    if (n > 2) o.tractor = a[2];
    if (n > 3) o.pad2 = a[3];
    if (n > 4) o.flags = a[4];
    return o;
  }
  $cp(s: struct_flags_spacket): this {
    this.type = s.type;
    this.pnum = s.pnum;
    this.tractor = s.tractor;
    this.pad2 = s.pad2;
    this.flags = s.flags;
    return this;
  }
  $clone(): struct_flags_spacket { return new struct_flags_spacket().$cp(this); }
  static $size = 8;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['pnum', 1, ['i', 1, 1]], ['tractor', 2, ['i', 1, 1]], ['pad2', 3, ['i', 1, 1]], ['flags', 4, ['i', 4, 0]]]; }
}

/** struct fontInfo: 16 bytes */
export class struct_fontInfo {
  baseline: number = 0;
  xfs: struct_XFontStruct | null = null;
  static $of(...a: any[]): struct_fontInfo {
    const o = new struct_fontInfo();
    const n = a.length;
    if (n > 0) o.baseline = a[0];
    if (n > 1) o.xfs = a[1];
    return o;
  }
  $cp(s: struct_fontInfo): this {
    this.baseline = s.baseline;
    this.xfs = s.xfs;
    return this;
  }
  $clone(): struct_fontInfo { return new struct_fontInfo().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['baseline', 0, ['i', 4, 1]], ['xfs', 8, ['p']]]; }
}

/** struct generic_32_spacket: 32 bytes */
export class struct_generic_32_spacket {
  type: number = 0;
  version: number = 0;
  pad: Int8Array = new Int8Array(30);
  static $of(...a: any[]): struct_generic_32_spacket {
    const o = new struct_generic_32_spacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.version = a[1];
    if (n > 2) o.pad = a[2];
    return o;
  }
  $cp(s: struct_generic_32_spacket): this {
    this.type = s.type;
    this.version = s.version;
    this.pad.set(s.pad);
    return this;
  }
  $clone(): struct_generic_32_spacket { return new struct_generic_32_spacket().$cp(this); }
  static $size = 32;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['version', 1, ['i', 1, 1]], ['pad', 2, ['a', ['i', 1, 1], 30]]]; }
}

/** struct generic_32_spacket_a: 32 bytes */
export class struct_generic_32_spacket_a {
  type: number = 0;
  version: number = 0;
  repair_time: number = 0;
  pl_orbit: number = 0;
  pad1: Int8Array = new Int8Array(26);
  static $of(...a: any[]): struct_generic_32_spacket_a {
    const o = new struct_generic_32_spacket_a();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.version = a[1];
    if (n > 2) o.repair_time = a[2];
    if (n > 3) o.pl_orbit = a[3];
    if (n > 4) o.pad1 = a[4];
    return o;
  }
  $cp(s: struct_generic_32_spacket_a): this {
    this.type = s.type;
    this.version = s.version;
    this.repair_time = s.repair_time;
    this.pl_orbit = s.pl_orbit;
    this.pad1.set(s.pad1);
    return this;
  }
  $clone(): struct_generic_32_spacket_a { return new struct_generic_32_spacket_a().$cp(this); }
  static $size = 32;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['version', 1, ['i', 1, 1]], ['repair_time', 2, ['i', 2, 0]], ['pl_orbit', 4, ['i', 2, 0]], ['pad1', 6, ['a', ['i', 1, 1], 26]]]; }
}

/** struct generic_32_spacket_b: 32 bytes */
export class struct_generic_32_spacket_b {
  type: number = 0;
  version: number = 0;
  repair_time: number = 0;
  pl_orbit: number = 0;
  gameup: number = 0;
  tournament_teams: number = 0;
  tournament_age: number = 0;
  tournament_age_units: number = 0;
  tournament_remain: number = 0;
  tournament_remain_units: number = 0;
  starbase_remain: number = 0;
  team_remain: number = 0;
  pad1: Int8Array = new Int8Array(18);
  static $of(...a: any[]): struct_generic_32_spacket_b {
    const o = new struct_generic_32_spacket_b();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.version = a[1];
    if (n > 2) o.repair_time = a[2];
    if (n > 3) o.pl_orbit = a[3];
    if (n > 4) o.gameup = a[4];
    if (n > 5) o.tournament_teams = a[5];
    if (n > 6) o.tournament_age = a[6];
    if (n > 7) o.tournament_age_units = a[7];
    if (n > 8) o.tournament_remain = a[8];
    if (n > 9) o.tournament_remain_units = a[9];
    if (n > 10) o.starbase_remain = a[10];
    if (n > 11) o.team_remain = a[11];
    if (n > 12) o.pad1 = a[12];
    return o;
  }
  $cp(s: struct_generic_32_spacket_b): this {
    this.type = s.type;
    this.version = s.version;
    this.repair_time = s.repair_time;
    this.pl_orbit = s.pl_orbit;
    this.gameup = s.gameup;
    this.tournament_teams = s.tournament_teams;
    this.tournament_age = s.tournament_age;
    this.tournament_age_units = s.tournament_age_units;
    this.tournament_remain = s.tournament_remain;
    this.tournament_remain_units = s.tournament_remain_units;
    this.starbase_remain = s.starbase_remain;
    this.team_remain = s.team_remain;
    this.pad1.set(s.pad1);
    return this;
  }
  $clone(): struct_generic_32_spacket_b { return new struct_generic_32_spacket_b().$cp(this); }
  static $size = 32;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['version', 1, ['i', 1, 1]], ['repair_time', 2, ['i', 2, 0]], ['pl_orbit', 4, ['i', 1, 1]], ['gameup', 5, ['i', 2, 0]], ['tournament_teams', 7, ['i', 1, 0]], ['tournament_age', 8, ['i', 1, 0]], ['tournament_age_units', 9, ['i', 1, 1]], ['tournament_remain', 10, ['i', 1, 0]], ['tournament_remain_units', 11, ['i', 1, 1]], ['starbase_remain', 12, ['i', 1, 0]], ['team_remain', 13, ['i', 1, 0]], ['pad1', 14, ['a', ['i', 1, 1], 18]]]; }
}

/** struct hostile_spacket: 4 bytes */
export class struct_hostile_spacket {
  type: number = 0;
  pnum: number = 0;
  war: number = 0;
  hostile: number = 0;
  static $of(...a: any[]): struct_hostile_spacket {
    const o = new struct_hostile_spacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.pnum = a[1];
    if (n > 2) o.war = a[2];
    if (n > 3) o.hostile = a[3];
    return o;
  }
  $cp(s: struct_hostile_spacket): this {
    this.type = s.type;
    this.pnum = s.pnum;
    this.war = s.war;
    this.hostile = s.hostile;
    return this;
  }
  $clone(): struct_hostile_spacket { return new struct_hostile_spacket().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['pnum', 1, ['i', 1, 1]], ['war', 2, ['i', 1, 1]], ['hostile', 3, ['i', 1, 1]]]; }
}

/** struct icon: 32 bytes */
export class struct_icon {
  window: number = 0;
  bitmap: number = 0;
  width: number = 0;
  height: number = 0;
  pixmap: number = 0;
  static $of(...a: any[]): struct_icon {
    const o = new struct_icon();
    const n = a.length;
    if (n > 0) o.window = a[0];
    if (n > 1) o.bitmap = a[1];
    if (n > 2) o.width = a[2];
    if (n > 3) o.height = a[3];
    if (n > 4) o.pixmap = a[4];
    return o;
  }
  $cp(s: struct_icon): this {
    this.window = s.window;
    this.bitmap = s.bitmap;
    this.width = s.width;
    this.height = s.height;
    this.pixmap = s.pixmap;
    return this;
  }
  $clone(): struct_icon { return new struct_icon().$cp(this); }
  static $size = 32;
  static $layout(): any[] { return [['window', 0, ['i', 8, 0]], ['bitmap', 8, ['i', 8, 0]], ['width', 16, ['i', 4, 1]], ['height', 20, ['i', 4, 1]], ['pixmap', 24, ['i', 8, 0]]]; }
}

/** struct in_addr: 4 bytes */
export class struct_in_addr {
  s_addr: number = 0;
  static $of(...a: any[]): struct_in_addr {
    const o = new struct_in_addr();
    const n = a.length;
    if (n > 0) o.s_addr = a[0];
    return o;
  }
  $cp(s: struct_in_addr): this {
    this.s_addr = s.s_addr;
    return this;
  }
  $clone(): struct_in_addr { return new struct_in_addr().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['s_addr', 0, ['i', 4, 0]]]; }
}

/** struct int_range: 12 bytes */
export class struct_int_range {
  min_value: number = 0;
  max_value: number = 0;
  increment: number = 0;
  static $of(...a: any[]): struct_int_range {
    const o = new struct_int_range();
    const n = a.length;
    if (n > 0) o.min_value = a[0];
    if (n > 1) o.max_value = a[1];
    if (n > 2) o.increment = a[2];
    return o;
  }
  $cp(s: struct_int_range): this {
    this.min_value = s.min_value;
    this.max_value = s.max_value;
    this.increment = s.increment;
    return this;
  }
  $clone(): struct_int_range { return new struct_int_range().$cp(this); }
  static $size = 12;
  static $layout(): any[] { return [['min_value', 0, ['i', 4, 1]], ['max_value', 4, ['i', 4, 1]], ['increment', 8, ['i', 4, 1]]]; }
}

/** struct ipc_perm: 48 bytes */
export class struct_ipc_perm {
  __key: number = 0;
  uid: number = 0;
  gid: number = 0;
  cuid: number = 0;
  cgid: number = 0;
  mode: number = 0;
  __seq: number = 0;
  __pad2: number = 0;
  __glibc_reserved1: number = 0;
  __glibc_reserved2: number = 0;
  static $of(...a: any[]): struct_ipc_perm {
    const o = new struct_ipc_perm();
    const n = a.length;
    if (n > 0) o.__key = a[0];
    if (n > 1) o.uid = a[1];
    if (n > 2) o.gid = a[2];
    if (n > 3) o.cuid = a[3];
    if (n > 4) o.cgid = a[4];
    if (n > 5) o.mode = a[5];
    if (n > 6) o.__seq = a[6];
    if (n > 7) o.__pad2 = a[7];
    if (n > 8) o.__glibc_reserved1 = a[8];
    if (n > 9) o.__glibc_reserved2 = a[9];
    return o;
  }
  $cp(s: struct_ipc_perm): this {
    this.__key = s.__key;
    this.uid = s.uid;
    this.gid = s.gid;
    this.cuid = s.cuid;
    this.cgid = s.cgid;
    this.mode = s.mode;
    this.__seq = s.__seq;
    this.__pad2 = s.__pad2;
    this.__glibc_reserved1 = s.__glibc_reserved1;
    this.__glibc_reserved2 = s.__glibc_reserved2;
    return this;
  }
  $clone(): struct_ipc_perm { return new struct_ipc_perm().$cp(this); }
  static $size = 48;
  static $layout(): any[] { return [['__key', 0, ['i', 4, 1]], ['uid', 4, ['i', 4, 0]], ['gid', 8, ['i', 4, 0]], ['cuid', 12, ['i', 4, 0]], ['cgid', 16, ['i', 4, 0]], ['mode', 20, ['i', 4, 0]], ['__seq', 24, ['i', 2, 0]], ['__pad2', 26, ['i', 2, 0]], ['__glibc_reserved1', 32, ['i', 8, 0]], ['__glibc_reserved2', 40, ['i', 8, 0]]]; }
}

/** struct key_handler_type: 8 bytes */
export class struct_key_handler_type {
  handler: any = null;
  static $of(...a: any[]): struct_key_handler_type {
    const o = new struct_key_handler_type();
    const n = a.length;
    if (n > 0) o.handler = a[0];
    return o;
  }
  $cp(s: struct_key_handler_type): this {
    this.handler = s.handler;
    return this;
  }
  $clone(): struct_key_handler_type { return new struct_key_handler_type().$cp(this); }
  static $size = 8;
  static $layout(): any[] { return [['handler', 0, ['p']]]; }
}

/** struct key_list: 16 bytes */
export class struct_key_list {
  dest: number = 0;
  name: any = null;
  static $of(...a: any[]): struct_key_list {
    const o = new struct_key_list();
    const n = a.length;
    if (n > 0) o.dest = a[0];
    if (n > 1) o.name = a[1];
    return o;
  }
  $cp(s: struct_key_list): this {
    this.dest = s.dest;
    this.name = s.name;
    return this;
  }
  $clone(): struct_key_list { return new struct_key_list().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['dest', 0, ['i', 1, 0]], ['name', 8, ['p']]]; }
}

/** struct kills_spacket: 8 bytes */
export class struct_kills_spacket {
  type: number = 0;
  pnum: number = 0;
  pad1: number = 0;
  pad2: number = 0;
  kills: number = 0;
  static $of(...a: any[]): struct_kills_spacket {
    const o = new struct_kills_spacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.pnum = a[1];
    if (n > 2) o.pad1 = a[2];
    if (n > 3) o.pad2 = a[3];
    if (n > 4) o.kills = a[4];
    return o;
  }
  $cp(s: struct_kills_spacket): this {
    this.type = s.type;
    this.pnum = s.pnum;
    this.pad1 = s.pad1;
    this.pad2 = s.pad2;
    this.kills = s.kills;
    return this;
  }
  $clone(): struct_kills_spacket { return new struct_kills_spacket().$cp(this); }
  static $size = 8;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['pnum', 1, ['i', 1, 1]], ['pad1', 2, ['i', 1, 1]], ['pad2', 3, ['i', 1, 1]], ['kills', 4, ['i', 4, 0]]]; }
}

/** struct list: 24 bytes */
export class struct_list {
  face: number = 0;
  next: struct_list | null = null;
  data: any = null;
  static $of(...a: any[]): struct_list {
    const o = new struct_list();
    const n = a.length;
    if (n > 0) o.face = a[0];
    if (n > 1) o.next = a[1];
    if (n > 2) o.data = a[2];
    return o;
  }
  $cp(s: struct_list): this {
    this.face = s.face;
    this.next = s.next;
    this.data = s.data;
    return this;
  }
  $clone(): struct_list { return new struct_list().$cp(this); }
  static $size = 24;
  static $layout(): any[] { return [['face', 0, ['i', 4, 1]], ['next', 8, ['p']], ['data', 16, ['p']]]; }
}

/** struct login_cpacket: 52 bytes */
export class struct_login_cpacket {
  type: number = 0;
  query: number = 0;
  pad2: number = 0;
  pad3: number = 0;
  name: Int8Array = new Int8Array(16);
  password: Int8Array = new Int8Array(16);
  login: Int8Array = new Int8Array(16);
  static $of(...a: any[]): struct_login_cpacket {
    const o = new struct_login_cpacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.query = a[1];
    if (n > 2) o.pad2 = a[2];
    if (n > 3) o.pad3 = a[3];
    if (n > 4) o.name = a[4];
    if (n > 5) o.password = a[5];
    if (n > 6) o.login = a[6];
    return o;
  }
  $cp(s: struct_login_cpacket): this {
    this.type = s.type;
    this.query = s.query;
    this.pad2 = s.pad2;
    this.pad3 = s.pad3;
    this.name.set(s.name);
    this.password.set(s.password);
    this.login.set(s.login);
    return this;
  }
  $clone(): struct_login_cpacket { return new struct_login_cpacket().$cp(this); }
  static $size = 52;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['query', 1, ['i', 1, 1]], ['pad2', 2, ['i', 1, 1]], ['pad3', 3, ['i', 1, 1]], ['name', 4, ['a', ['i', 1, 1], 16]], ['password', 20, ['a', ['i', 1, 1], 16]], ['login', 36, ['a', ['i', 1, 1], 16]]]; }
}

/** struct login_spacket: 104 bytes */
export class struct_login_spacket {
  type: number = 0;
  accept: number = 0;
  pad2: number = 0;
  pad3: number = 0;
  flags: number = 0;
  keymap: Int8Array = new Int8Array(96);
  static $of(...a: any[]): struct_login_spacket {
    const o = new struct_login_spacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.accept = a[1];
    if (n > 2) o.pad2 = a[2];
    if (n > 3) o.pad3 = a[3];
    if (n > 4) o.flags = a[4];
    if (n > 5) o.keymap = a[5];
    return o;
  }
  $cp(s: struct_login_spacket): this {
    this.type = s.type;
    this.accept = s.accept;
    this.pad2 = s.pad2;
    this.pad3 = s.pad3;
    this.flags = s.flags;
    this.keymap.set(s.keymap);
    return this;
  }
  $clone(): struct_login_spacket { return new struct_login_spacket().$cp(this); }
  static $size = 104;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['accept', 1, ['i', 1, 1]], ['pad2', 2, ['i', 1, 1]], ['pad3', 3, ['i', 1, 1]], ['flags', 4, ['i', 4, 1]], ['keymap', 8, ['a', ['i', 1, 1], 96]]]; }
}

/** struct ltd_spacket: 324 bytes */
export class struct_ltd_spacket {
  type: number = 0;
  version: number = 0;
  pad: Int8Array = new Int8Array(2);
  kt: number = 0;
  kmax: number = 0;
  k1: number = 0;
  k1p: number = 0;
  k1c: number = 0;
  k2: number = 0;
  k2p: number = 0;
  k2c: number = 0;
  kbp: number = 0;
  kbt: number = 0;
  kbs: number = 0;
  dt: number = 0;
  dpc: number = 0;
  dcc: number = 0;
  ddc: number = 0;
  dbp: number = 0;
  dbt: number = 0;
  dbs: number = 0;
  acc: number = 0;
  ptt: number = 0;
  pdt: number = 0;
  bpt: number = 0;
  bp8: number = 0;
  bpc: number = 0;
  bat: number = 0;
  ba8: number = 0;
  bac: number = 0;
  oat: number = 0;
  odc: number = 0;
  occ: number = 0;
  opc: number = 0;
  ogc: number = 0;
  oec: number = 0;
  olc: number = 0;
  osba: number = 0;
  ofc: number = 0;
  ofa: number = 0;
  at: number = 0;
  aa: number = 0;
  ar: number = 0;
  af: number = 0;
  ak: number = 0;
  ct: number = 0;
  cp: number = 0;
  cc: number = 0;
  ca: number = 0;
  cr: number = 0;
  cf: number = 0;
  tt: number = 0;
  tyel: number = 0;
  tred: number = 0;
  tz0: number = 0;
  tz1: number = 0;
  tz2: number = 0;
  tz3: number = 0;
  tz4: number = 0;
  tz5: number = 0;
  tz6: number = 0;
  tz7: number = 0;
  tpc: number = 0;
  tcc: number = 0;
  tr: number = 0;
  dr: number = 0;
  wpf: number = 0;
  wph: number = 0;
  wpdi: number = 0;
  wpdt: number = 0;
  wtf: number = 0;
  wth: number = 0;
  wtd: number = 0;
  wts: number = 0;
  wtw: number = 0;
  wtdi: number = 0;
  wtdt: number = 0;
  wsf: number = 0;
  wsh: number = 0;
  wsp: number = 0;
  wsw: number = 0;
  wsdi: number = 0;
  wsdt: number = 0;
  static $of(...a: any[]): struct_ltd_spacket {
    const o = new struct_ltd_spacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.version = a[1];
    if (n > 2) o.pad = a[2];
    if (n > 3) o.kt = a[3];
    if (n > 4) o.kmax = a[4];
    if (n > 5) o.k1 = a[5];
    if (n > 6) o.k1p = a[6];
    if (n > 7) o.k1c = a[7];
    if (n > 8) o.k2 = a[8];
    if (n > 9) o.k2p = a[9];
    if (n > 10) o.k2c = a[10];
    if (n > 11) o.kbp = a[11];
    if (n > 12) o.kbt = a[12];
    if (n > 13) o.kbs = a[13];
    if (n > 14) o.dt = a[14];
    if (n > 15) o.dpc = a[15];
    if (n > 16) o.dcc = a[16];
    if (n > 17) o.ddc = a[17];
    if (n > 18) o.dbp = a[18];
    if (n > 19) o.dbt = a[19];
    if (n > 20) o.dbs = a[20];
    if (n > 21) o.acc = a[21];
    if (n > 22) o.ptt = a[22];
    if (n > 23) o.pdt = a[23];
    if (n > 24) o.bpt = a[24];
    if (n > 25) o.bp8 = a[25];
    if (n > 26) o.bpc = a[26];
    if (n > 27) o.bat = a[27];
    if (n > 28) o.ba8 = a[28];
    if (n > 29) o.bac = a[29];
    if (n > 30) o.oat = a[30];
    if (n > 31) o.odc = a[31];
    if (n > 32) o.occ = a[32];
    if (n > 33) o.opc = a[33];
    if (n > 34) o.ogc = a[34];
    if (n > 35) o.oec = a[35];
    if (n > 36) o.olc = a[36];
    if (n > 37) o.osba = a[37];
    if (n > 38) o.ofc = a[38];
    if (n > 39) o.ofa = a[39];
    if (n > 40) o.at = a[40];
    if (n > 41) o.aa = a[41];
    if (n > 42) o.ar = a[42];
    if (n > 43) o.af = a[43];
    if (n > 44) o.ak = a[44];
    if (n > 45) o.ct = a[45];
    if (n > 46) o.cp = a[46];
    if (n > 47) o.cc = a[47];
    if (n > 48) o.ca = a[48];
    if (n > 49) o.cr = a[49];
    if (n > 50) o.cf = a[50];
    if (n > 51) o.tt = a[51];
    if (n > 52) o.tyel = a[52];
    if (n > 53) o.tred = a[53];
    if (n > 54) o.tz0 = a[54];
    if (n > 55) o.tz1 = a[55];
    if (n > 56) o.tz2 = a[56];
    if (n > 57) o.tz3 = a[57];
    if (n > 58) o.tz4 = a[58];
    if (n > 59) o.tz5 = a[59];
    if (n > 60) o.tz6 = a[60];
    if (n > 61) o.tz7 = a[61];
    if (n > 62) o.tpc = a[62];
    if (n > 63) o.tcc = a[63];
    if (n > 64) o.tr = a[64];
    if (n > 65) o.dr = a[65];
    if (n > 66) o.wpf = a[66];
    if (n > 67) o.wph = a[67];
    if (n > 68) o.wpdi = a[68];
    if (n > 69) o.wpdt = a[69];
    if (n > 70) o.wtf = a[70];
    if (n > 71) o.wth = a[71];
    if (n > 72) o.wtd = a[72];
    if (n > 73) o.wts = a[73];
    if (n > 74) o.wtw = a[74];
    if (n > 75) o.wtdi = a[75];
    if (n > 76) o.wtdt = a[76];
    if (n > 77) o.wsf = a[77];
    if (n > 78) o.wsh = a[78];
    if (n > 79) o.wsp = a[79];
    if (n > 80) o.wsw = a[80];
    if (n > 81) o.wsdi = a[81];
    if (n > 82) o.wsdt = a[82];
    return o;
  }
  $cp(s: struct_ltd_spacket): this {
    this.type = s.type;
    this.version = s.version;
    this.pad.set(s.pad);
    this.kt = s.kt;
    this.kmax = s.kmax;
    this.k1 = s.k1;
    this.k1p = s.k1p;
    this.k1c = s.k1c;
    this.k2 = s.k2;
    this.k2p = s.k2p;
    this.k2c = s.k2c;
    this.kbp = s.kbp;
    this.kbt = s.kbt;
    this.kbs = s.kbs;
    this.dt = s.dt;
    this.dpc = s.dpc;
    this.dcc = s.dcc;
    this.ddc = s.ddc;
    this.dbp = s.dbp;
    this.dbt = s.dbt;
    this.dbs = s.dbs;
    this.acc = s.acc;
    this.ptt = s.ptt;
    this.pdt = s.pdt;
    this.bpt = s.bpt;
    this.bp8 = s.bp8;
    this.bpc = s.bpc;
    this.bat = s.bat;
    this.ba8 = s.ba8;
    this.bac = s.bac;
    this.oat = s.oat;
    this.odc = s.odc;
    this.occ = s.occ;
    this.opc = s.opc;
    this.ogc = s.ogc;
    this.oec = s.oec;
    this.olc = s.olc;
    this.osba = s.osba;
    this.ofc = s.ofc;
    this.ofa = s.ofa;
    this.at = s.at;
    this.aa = s.aa;
    this.ar = s.ar;
    this.af = s.af;
    this.ak = s.ak;
    this.ct = s.ct;
    this.cp = s.cp;
    this.cc = s.cc;
    this.ca = s.ca;
    this.cr = s.cr;
    this.cf = s.cf;
    this.tt = s.tt;
    this.tyel = s.tyel;
    this.tred = s.tred;
    this.tz0 = s.tz0;
    this.tz1 = s.tz1;
    this.tz2 = s.tz2;
    this.tz3 = s.tz3;
    this.tz4 = s.tz4;
    this.tz5 = s.tz5;
    this.tz6 = s.tz6;
    this.tz7 = s.tz7;
    this.tpc = s.tpc;
    this.tcc = s.tcc;
    this.tr = s.tr;
    this.dr = s.dr;
    this.wpf = s.wpf;
    this.wph = s.wph;
    this.wpdi = s.wpdi;
    this.wpdt = s.wpdt;
    this.wtf = s.wtf;
    this.wth = s.wth;
    this.wtd = s.wtd;
    this.wts = s.wts;
    this.wtw = s.wtw;
    this.wtdi = s.wtdi;
    this.wtdt = s.wtdt;
    this.wsf = s.wsf;
    this.wsh = s.wsh;
    this.wsp = s.wsp;
    this.wsw = s.wsw;
    this.wsdi = s.wsdi;
    this.wsdt = s.wsdt;
    return this;
  }
  $clone(): struct_ltd_spacket { return new struct_ltd_spacket().$cp(this); }
  static $size = 324;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['version', 1, ['i', 1, 1]], ['pad', 2, ['a', ['i', 1, 1], 2]], ['kt', 4, ['i', 4, 0]], ['kmax', 8, ['i', 4, 0]], ['k1', 12, ['i', 4, 0]], ['k1p', 16, ['i', 4, 0]], ['k1c', 20, ['i', 4, 0]], ['k2', 24, ['i', 4, 0]], ['k2p', 28, ['i', 4, 0]], ['k2c', 32, ['i', 4, 0]], ['kbp', 36, ['i', 4, 0]], ['kbt', 40, ['i', 4, 0]], ['kbs', 44, ['i', 4, 0]], ['dt', 48, ['i', 4, 0]], ['dpc', 52, ['i', 4, 0]], ['dcc', 56, ['i', 4, 0]], ['ddc', 60, ['i', 4, 0]], ['dbp', 64, ['i', 4, 0]], ['dbt', 68, ['i', 4, 0]], ['dbs', 72, ['i', 4, 0]], ['acc', 76, ['i', 4, 0]], ['ptt', 80, ['i', 4, 0]], ['pdt', 84, ['i', 4, 0]], ['bpt', 88, ['i', 4, 0]], ['bp8', 92, ['i', 4, 0]], ['bpc', 96, ['i', 4, 0]], ['bat', 100, ['i', 4, 0]], ['ba8', 104, ['i', 4, 0]], ['bac', 108, ['i', 4, 0]], ['oat', 112, ['i', 4, 0]], ['odc', 116, ['i', 4, 0]], ['occ', 120, ['i', 4, 0]], ['opc', 124, ['i', 4, 0]], ['ogc', 128, ['i', 4, 0]], ['oec', 132, ['i', 4, 0]], ['olc', 136, ['i', 4, 0]], ['osba', 140, ['i', 4, 0]], ['ofc', 144, ['i', 4, 0]], ['ofa', 148, ['i', 4, 0]], ['at', 152, ['i', 4, 0]], ['aa', 156, ['i', 4, 0]], ['ar', 160, ['i', 4, 0]], ['af', 164, ['i', 4, 0]], ['ak', 168, ['i', 4, 0]], ['ct', 172, ['i', 4, 0]], ['cp', 176, ['i', 4, 0]], ['cc', 180, ['i', 4, 0]], ['ca', 184, ['i', 4, 0]], ['cr', 188, ['i', 4, 0]], ['cf', 192, ['i', 4, 0]], ['tt', 196, ['i', 4, 0]], ['tyel', 200, ['i', 4, 0]], ['tred', 204, ['i', 4, 0]], ['tz0', 208, ['i', 4, 0]], ['tz1', 212, ['i', 4, 0]], ['tz2', 216, ['i', 4, 0]], ['tz3', 220, ['i', 4, 0]], ['tz4', 224, ['i', 4, 0]], ['tz5', 228, ['i', 4, 0]], ['tz6', 232, ['i', 4, 0]], ['tz7', 236, ['i', 4, 0]], ['tpc', 240, ['i', 4, 0]], ['tcc', 244, ['i', 4, 0]], ['tr', 248, ['i', 4, 0]], ['dr', 252, ['i', 4, 0]], ['wpf', 256, ['i', 4, 0]], ['wph', 260, ['i', 4, 0]], ['wpdi', 264, ['i', 4, 0]], ['wpdt', 268, ['i', 4, 0]], ['wtf', 272, ['i', 4, 0]], ['wth', 276, ['i', 4, 0]], ['wtd', 280, ['i', 4, 0]], ['wts', 284, ['i', 4, 0]], ['wtw', 288, ['i', 4, 0]], ['wtdi', 292, ['i', 4, 0]], ['wtdt', 296, ['i', 4, 0]], ['wsf', 300, ['i', 4, 0]], ['wsh', 304, ['i', 4, 0]], ['wsp', 308, ['i', 4, 0]], ['wsw', 312, ['i', 4, 0]], ['wsdi', 316, ['i', 4, 0]], ['wsdt', 320, ['i', 4, 0]]]; }
}

/** struct ltd_stats: 324 bytes */
export class struct_ltd_stats {
  kills: struct__kills = new struct__kills();
  deaths: struct__deaths = new struct__deaths();
  planets: struct__planets = new struct__planets();
  bomb: struct__bomb = new struct__bomb();
  ogged: struct__ogged = new struct__ogged();
  armies: struct__armies = new struct__armies();
  carries: struct__carries = new struct__carries();
  ticks: struct__ticks = new struct__ticks();
  damage_repaired: number = 0;
  weapons: struct__weapons = new struct__weapons();
  static $of(...a: any[]): struct_ltd_stats {
    const o = new struct_ltd_stats();
    const n = a.length;
    if (n > 0) o.kills = a[0];
    if (n > 1) o.deaths = a[1];
    if (n > 2) o.planets = a[2];
    if (n > 3) o.bomb = a[3];
    if (n > 4) o.ogged = a[4];
    if (n > 5) o.armies = a[5];
    if (n > 6) o.carries = a[6];
    if (n > 7) o.ticks = a[7];
    if (n > 8) o.damage_repaired = a[8];
    if (n > 9) o.weapons = a[9];
    return o;
  }
  $cp(s: struct_ltd_stats): this {
    this.kills.$cp(s.kills);
    this.deaths.$cp(s.deaths);
    this.planets.$cp(s.planets);
    this.bomb.$cp(s.bomb);
    this.ogged.$cp(s.ogged);
    this.armies.$cp(s.armies);
    this.carries.$cp(s.carries);
    this.ticks.$cp(s.ticks);
    this.damage_repaired = s.damage_repaired;
    this.weapons.$cp(s.weapons);
    return this;
  }
  $clone(): struct_ltd_stats { return new struct_ltd_stats().$cp(this); }
  static $size = 324;
  static $layout(): any[] { return [['kills', 0, ['r', struct__kills]], ['deaths', 48, ['r', struct__deaths]], ['planets', 80, ['r', struct__planets]], ['bomb', 88, ['r', struct__bomb]], ['ogged', 112, ['r', struct__ogged]], ['armies', 152, ['r', struct__armies]], ['carries', 172, ['r', struct__carries]], ['ticks', 196, ['r', struct__ticks]], ['damage_repaired', 252, ['i', 4, 0]], ['weapons', 256, ['r', struct__weapons]]]; }
}

/** struct macro_list: 16 bytes */
export class struct_macro_list {
  type: number = 0;
  key: number = 0;
  who: number = 0;
  string: any = null;
  static $of(...a: any[]): struct_macro_list {
    const o = new struct_macro_list();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.key = a[1];
    if (n > 2) o.who = a[2];
    if (n > 3) o.string = a[3];
    return o;
  }
  $cp(s: struct_macro_list): this {
    this.type = s.type;
    this.key = s.key;
    this.who = s.who;
    this.string = s.string;
    return this;
  }
  $clone(): struct_macro_list { return new struct_macro_list().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['type', 0, ['i', 4, 1]], ['key', 4, ['i', 1, 0]], ['who', 5, ['i', 1, 1]], ['string', 8, ['p']]]; }
}

/** struct mask_spacket: 4 bytes */
export class struct_mask_spacket {
  type: number = 0;
  mask: number = 0;
  pad1: number = 0;
  pad2: number = 0;
  static $of(...a: any[]): struct_mask_spacket {
    const o = new struct_mask_spacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.mask = a[1];
    if (n > 2) o.pad1 = a[2];
    if (n > 3) o.pad2 = a[3];
    return o;
  }
  $cp(s: struct_mask_spacket): this {
    this.type = s.type;
    this.mask = s.mask;
    this.pad1 = s.pad1;
    this.pad2 = s.pad2;
    return this;
  }
  $clone(): struct_mask_spacket { return new struct_mask_spacket().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['mask', 1, ['i', 1, 1]], ['pad1', 2, ['i', 1, 1]], ['pad2', 3, ['i', 1, 1]]]; }
}

/** struct mctl: 4 bytes */
export class struct_mctl {
  mc_current: number = 0;
  static $of(...a: any[]): struct_mctl {
    const o = new struct_mctl();
    const n = a.length;
    if (n > 0) o.mc_current = a[0];
    return o;
  }
  $cp(s: struct_mctl): this {
    this.mc_current = s.mc_current;
    return this;
  }
  $clone(): struct_mctl { return new struct_mctl().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['mc_current', 0, ['i', 4, 1]]]; }
}

/** struct memory: 43840 bytes */
export class struct_memory {
  players: any[] = $sarr(struct_player, 36);
  torps: any[] = $sarr(struct_torp, 288);
  plasmatorps: any[] = $sarr(struct_plasmatorp, 36);
  status: any[] = $sarr(struct_status, 1);
  planets: any[] = $sarr(struct_planet, 40);
  phasers: any[] = $sarr(struct_phaser, 36);
  mctl: any[] = $sarr(struct_mctl, 1);
  messages: any[] = $sarr(struct_message, 50);
  shipvals: any[] = $sarr(struct_ship, 8);
  context: any[] = $sarr(struct_context, 1);
  static $of(...a: any[]): struct_memory {
    const o = new struct_memory();
    const n = a.length;
    if (n > 0) o.players = a[0];
    if (n > 1) o.torps = a[1];
    if (n > 2) o.plasmatorps = a[2];
    if (n > 3) o.status = a[3];
    if (n > 4) o.planets = a[4];
    if (n > 5) o.phasers = a[5];
    if (n > 6) o.mctl = a[6];
    if (n > 7) o.messages = a[7];
    if (n > 8) o.shipvals = a[8];
    if (n > 9) o.context = a[9];
    return o;
  }
  $cp(s: struct_memory): this {
    $cparr(this.players, s.players);
    $cparr(this.torps, s.torps);
    $cparr(this.plasmatorps, s.plasmatorps);
    $cparr(this.status, s.status);
    $cparr(this.planets, s.planets);
    $cparr(this.phasers, s.phasers);
    $cparr(this.mctl, s.mctl);
    $cparr(this.messages, s.messages);
    $cparr(this.shipvals, s.shipvals);
    $cparr(this.context, s.context);
    return this;
  }
  $clone(): struct_memory { return new struct_memory().$cp(this); }
  static $size = 43840;
  static $layout(): any[] { return [['players', 0, ['a', ['r', struct_player], 36]], ['torps', 29376, ['a', ['r', struct_torp], 288]], ['plasmatorps', 35136, ['a', ['r', struct_plasmatorp], 36]], ['status', 35712, ['a', ['r', struct_status], 1]], ['planets', 35740, ['a', ['r', struct_planet], 40]], ['phasers', 37980, ['a', ['r', struct_phaser], 36]], ['mctl', 38700, ['a', ['r', struct_mctl], 1]], ['messages', 38704, ['a', ['r', struct_message], 50]], ['shipvals', 43504, ['a', ['r', struct_ship], 8]], ['context', 43824, ['a', ['r', struct_context], 1]]]; }
}

/** struct menuItem: 24 bytes */
export class struct_menuItem {
  column: number = 0;
  string: any = null;
  color: number = 0;
  static $of(...a: any[]): struct_menuItem {
    const o = new struct_menuItem();
    const n = a.length;
    if (n > 0) o.column = a[0];
    if (n > 1) o.string = a[1];
    if (n > 2) o.color = a[2];
    return o;
  }
  $cp(s: struct_menuItem): this {
    this.column = s.column;
    this.string = s.string;
    this.color = s.color;
    return this;
  }
  $clone(): struct_menuItem { return new struct_menuItem().$cp(this); }
  static $size = 24;
  static $layout(): any[] { return [['column', 0, ['i', 4, 1]], ['string', 8, ['p']], ['color', 16, ['i', 4, 1]]]; }
}

/** struct mesg_cpacket: 84 bytes */
export class struct_mesg_cpacket {
  type: number = 0;
  group: number = 0;
  indiv: number = 0;
  pad1: number = 0;
  mesg: Int8Array = new Int8Array(80);
  static $of(...a: any[]): struct_mesg_cpacket {
    const o = new struct_mesg_cpacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.group = a[1];
    if (n > 2) o.indiv = a[2];
    if (n > 3) o.pad1 = a[3];
    if (n > 4) o.mesg = a[4];
    return o;
  }
  $cp(s: struct_mesg_cpacket): this {
    this.type = s.type;
    this.group = s.group;
    this.indiv = s.indiv;
    this.pad1 = s.pad1;
    this.mesg.set(s.mesg);
    return this;
  }
  $clone(): struct_mesg_cpacket { return new struct_mesg_cpacket().$cp(this); }
  static $size = 84;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['group', 1, ['i', 1, 1]], ['indiv', 2, ['i', 1, 1]], ['pad1', 3, ['i', 1, 1]], ['mesg', 4, ['a', ['i', 1, 1], 80]]]; }
}

/** struct mesg_s_spacket: 84 bytes */
export class struct_mesg_s_spacket {
  type: number = 0;
  m_flags: number = 0;
  m_recpt: number = 0;
  m_from: number = 0;
  length: number = 0;
  mesg: number = 0;
  pad2: number = 0;
  pad3: number = 0;
  pad: Int8Array = new Int8Array(76);
  static $of(...a: any[]): struct_mesg_s_spacket {
    const o = new struct_mesg_s_spacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.m_flags = a[1];
    if (n > 2) o.m_recpt = a[2];
    if (n > 3) o.m_from = a[3];
    if (n > 4) o.length = a[4];
    if (n > 5) o.mesg = a[5];
    if (n > 6) o.pad2 = a[6];
    if (n > 7) o.pad3 = a[7];
    if (n > 8) o.pad = a[8];
    return o;
  }
  $cp(s: struct_mesg_s_spacket): this {
    this.type = s.type;
    this.m_flags = s.m_flags;
    this.m_recpt = s.m_recpt;
    this.m_from = s.m_from;
    this.length = s.length;
    this.mesg = s.mesg;
    this.pad2 = s.pad2;
    this.pad3 = s.pad3;
    this.pad.set(s.pad);
    return this;
  }
  $clone(): struct_mesg_s_spacket { return new struct_mesg_s_spacket().$cp(this); }
  static $size = 84;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['m_flags', 1, ['i', 1, 0]], ['m_recpt', 2, ['i', 1, 0]], ['m_from', 3, ['i', 1, 0]], ['length', 4, ['i', 1, 0]], ['mesg', 5, ['i', 1, 1]], ['pad2', 6, ['i', 1, 1]], ['pad3', 7, ['i', 1, 1]], ['pad', 8, ['a', ['i', 1, 1], 76]]]; }
}

/** struct mesg_spacket: 84 bytes */
export class struct_mesg_spacket {
  type: number = 0;
  m_flags: number = 0;
  m_recpt: number = 0;
  m_from: number = 0;
  mesg: Int8Array = new Int8Array(80);
  static $of(...a: any[]): struct_mesg_spacket {
    const o = new struct_mesg_spacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.m_flags = a[1];
    if (n > 2) o.m_recpt = a[2];
    if (n > 3) o.m_from = a[3];
    if (n > 4) o.mesg = a[4];
    return o;
  }
  $cp(s: struct_mesg_spacket): this {
    this.type = s.type;
    this.m_flags = s.m_flags;
    this.m_recpt = s.m_recpt;
    this.m_from = s.m_from;
    this.mesg.set(s.mesg);
    return this;
  }
  $clone(): struct_mesg_spacket { return new struct_mesg_spacket().$cp(this); }
  static $size = 84;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['m_flags', 1, ['i', 1, 0]], ['m_recpt', 2, ['i', 1, 0]], ['m_from', 3, ['i', 1, 0]], ['mesg', 4, ['a', ['i', 1, 1], 80]]]; }
}

/** struct message: 96 bytes */
export class struct_message {
  m_no: number = 0;
  m_flags: number = 0;
  m_time: number = 0;
  m_recpt: number = 0;
  m_data: Int8Array = new Int8Array(80);
  static $of(...a: any[]): struct_message {
    const o = new struct_message();
    const n = a.length;
    if (n > 0) o.m_no = a[0];
    if (n > 1) o.m_flags = a[1];
    if (n > 2) o.m_time = a[2];
    if (n > 3) o.m_recpt = a[3];
    if (n > 4) o.m_data = a[4];
    return o;
  }
  $cp(s: struct_message): this {
    this.m_no = s.m_no;
    this.m_flags = s.m_flags;
    this.m_time = s.m_time;
    this.m_recpt = s.m_recpt;
    this.m_data.set(s.m_data);
    return this;
  }
  $clone(): struct_message { return new struct_message().$cp(this); }
  static $size = 96;
  static $layout(): any[] { return [['m_no', 0, ['i', 4, 1]], ['m_flags', 4, ['i', 4, 1]], ['m_time', 8, ['i', 4, 1]], ['m_recpt', 12, ['i', 4, 1]], ['m_data', 16, ['a', ['i', 1, 1], 80]]]; }
}

/** struct motd_line: 24 bytes */
export class struct_motd_line {
  next: struct_motd_line | null = null;
  data: any = null;
  bold: number = 0;
  static $of(...a: any[]): struct_motd_line {
    const o = new struct_motd_line();
    const n = a.length;
    if (n > 0) o.next = a[0];
    if (n > 1) o.data = a[1];
    if (n > 2) o.bold = a[2];
    return o;
  }
  $cp(s: struct_motd_line): this {
    this.next = s.next;
    this.data = s.data;
    this.bold = s.bold;
    return this;
  }
  $clone(): struct_motd_line { return new struct_motd_line().$cp(this); }
  static $size = 24;
  static $layout(): any[] { return [['next', 0, ['p']], ['data', 8, ['p']], ['bold', 16, ['i', 4, 1]]]; }
}

/** struct motd_spacket: 84 bytes */
export class struct_motd_spacket {
  type: number = 0;
  pad1: number = 0;
  pad2: number = 0;
  pad3: number = 0;
  line: Int8Array = new Int8Array(80);
  static $of(...a: any[]): struct_motd_spacket {
    const o = new struct_motd_spacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.pad1 = a[1];
    if (n > 2) o.pad2 = a[2];
    if (n > 3) o.pad3 = a[3];
    if (n > 4) o.line = a[4];
    return o;
  }
  $cp(s: struct_motd_spacket): this {
    this.type = s.type;
    this.pad1 = s.pad1;
    this.pad2 = s.pad2;
    this.pad3 = s.pad3;
    this.line.set(s.line);
    return this;
  }
  $clone(): struct_motd_spacket { return new struct_motd_spacket().$cp(this); }
  static $size = 84;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['pad1', 1, ['i', 1, 1]], ['pad2', 2, ['i', 1, 1]], ['pad3', 3, ['i', 1, 1]], ['line', 4, ['a', ['i', 1, 1], 80]]]; }
}

/** struct obtype: 8 bytes */
export class struct_obtype {
  o_type: number = 0;
  o_num: number = 0;
  static $of(...a: any[]): struct_obtype {
    const o = new struct_obtype();
    const n = a.length;
    if (n > 0) o.o_type = a[0];
    if (n > 1) o.o_num = a[1];
    return o;
  }
  $cp(s: struct_obtype): this {
    this.o_type = s.o_type;
    this.o_num = s.o_num;
    return this;
  }
  $clone(): struct_obtype { return new struct_obtype().$cp(this); }
  static $size = 8;
  static $layout(): any[] { return [['o_type', 0, ['i', 4, 1]], ['o_num', 4, ['i', 4, 1]]]; }
}

/** struct option: 64 bytes */
export class struct_option {
  op_num: number = 0;
  op_text: any = null;
  op_option: any = null;
  op_targetwin: any = null;
  op_string: any = null;
  op_size: number = 0;
  op_array: any = null;
  op_range: struct_int_range | null = null;
  static $of(...a: any[]): struct_option {
    const o = new struct_option();
    const n = a.length;
    if (n > 0) o.op_num = a[0];
    if (n > 1) o.op_text = a[1];
    if (n > 2) o.op_option = a[2];
    if (n > 3) o.op_targetwin = a[3];
    if (n > 4) o.op_string = a[4];
    if (n > 5) o.op_size = a[5];
    if (n > 6) o.op_array = a[6];
    if (n > 7) o.op_range = a[7];
    return o;
  }
  $cp(s: struct_option): this {
    this.op_num = s.op_num;
    this.op_text = s.op_text;
    this.op_option = s.op_option;
    this.op_targetwin = s.op_targetwin;
    this.op_string = s.op_string;
    this.op_size = s.op_size;
    this.op_array = s.op_array;
    this.op_range = s.op_range;
    return this;
  }
  $clone(): struct_option { return new struct_option().$cp(this); }
  static $size = 64;
  static $layout(): any[] { return [['op_num', 0, ['i', 4, 1]], ['op_text', 8, ['p']], ['op_option', 16, ['p']], ['op_targetwin', 24, ['p']], ['op_string', 32, ['p']], ['op_size', 40, ['i', 4, 1]], ['op_array', 48, ['p']], ['op_range', 56, ['p']]]; }
}

/** struct option_menu: 32 bytes */
export class struct_option_menu {
  page_num: number = 0;
  Next: struct_option_menu | null = null;
  menu: struct_option | null = null;
  numopt: number = 0;
  updated: number = 0;
  static $of(...a: any[]): struct_option_menu {
    const o = new struct_option_menu();
    const n = a.length;
    if (n > 0) o.page_num = a[0];
    if (n > 1) o.Next = a[1];
    if (n > 2) o.menu = a[2];
    if (n > 3) o.numopt = a[3];
    if (n > 4) o.updated = a[4];
    return o;
  }
  $cp(s: struct_option_menu): this {
    this.page_num = s.page_num;
    this.Next = s.Next;
    this.menu = s.menu;
    this.numopt = s.numopt;
    this.updated = s.updated;
    return this;
  }
  $clone(): struct_option_menu { return new struct_option_menu().$cp(this); }
  static $size = 32;
  static $layout(): any[] { return [['page_num', 0, ['i', 4, 1]], ['Next', 8, ['p']], ['menu', 16, ['p']], ['numopt', 24, ['i', 4, 1]], ['updated', 28, ['i', 4, 1]]]; }
}

/** struct options_cpacket: 104 bytes */
export class struct_options_cpacket {
  type: number = 0;
  pad1: number = 0;
  pad2: number = 0;
  pad3: number = 0;
  flags: number = 0;
  keymap: Int8Array = new Int8Array(96);
  static $of(...a: any[]): struct_options_cpacket {
    const o = new struct_options_cpacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.pad1 = a[1];
    if (n > 2) o.pad2 = a[2];
    if (n > 3) o.pad3 = a[3];
    if (n > 4) o.flags = a[4];
    if (n > 5) o.keymap = a[5];
    return o;
  }
  $cp(s: struct_options_cpacket): this {
    this.type = s.type;
    this.pad1 = s.pad1;
    this.pad2 = s.pad2;
    this.pad3 = s.pad3;
    this.flags = s.flags;
    this.keymap.set(s.keymap);
    return this;
  }
  $clone(): struct_options_cpacket { return new struct_options_cpacket().$cp(this); }
  static $size = 104;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['pad1', 1, ['i', 1, 1]], ['pad2', 2, ['i', 1, 1]], ['pad3', 3, ['i', 1, 1]], ['flags', 4, ['i', 4, 0]], ['keymap', 8, ['a', ['i', 1, 1], 96]]]; }
}

/** struct orbit_cpacket: 4 bytes */
export class struct_orbit_cpacket {
  type: number = 0;
  state: number = 0;
  pad1: number = 0;
  pad2: number = 0;
  static $of(...a: any[]): struct_orbit_cpacket {
    const o = new struct_orbit_cpacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.state = a[1];
    if (n > 2) o.pad1 = a[2];
    if (n > 3) o.pad2 = a[3];
    return o;
  }
  $cp(s: struct_orbit_cpacket): this {
    this.type = s.type;
    this.state = s.state;
    this.pad1 = s.pad1;
    this.pad2 = s.pad2;
    return this;
  }
  $clone(): struct_orbit_cpacket { return new struct_orbit_cpacket().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['state', 1, ['i', 1, 1]], ['pad1', 2, ['i', 1, 1]], ['pad2', 3, ['i', 1, 1]]]; }
}

/** struct outfit_cpacket: 4 bytes */
export class struct_outfit_cpacket {
  type: number = 0;
  team: number = 0;
  ship: number = 0;
  pad1: number = 0;
  static $of(...a: any[]): struct_outfit_cpacket {
    const o = new struct_outfit_cpacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.team = a[1];
    if (n > 2) o.ship = a[2];
    if (n > 3) o.pad1 = a[3];
    return o;
  }
  $cp(s: struct_outfit_cpacket): this {
    this.type = s.type;
    this.team = s.team;
    this.ship = s.ship;
    this.pad1 = s.pad1;
    return this;
  }
  $clone(): struct_outfit_cpacket { return new struct_outfit_cpacket().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['team', 1, ['i', 1, 1]], ['ship', 2, ['i', 1, 1]], ['pad1', 3, ['i', 1, 1]]]; }
}

/** struct packet_handler: 16 bytes */
export class struct_packet_handler {
  size: number = 0;
  handler: any = null;
  static $of(...a: any[]): struct_packet_handler {
    const o = new struct_packet_handler();
    const n = a.length;
    if (n > 0) o.size = a[0];
    if (n > 1) o.handler = a[1];
    return o;
  }
  $cp(s: struct_packet_handler): this {
    this.size = s.size;
    this.handler = s.handler;
    return this;
  }
  $clone(): struct_packet_handler { return new struct_packet_handler().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['size', 0, ['i', 4, 1]], ['handler', 8, ['p']]]; }
}

/** struct phaser: 20 bytes */
export class struct_phaser {
  ph_status: number = 0;
  ph_dir: number = 0;
  ph_target: number = 0;
  ph_updateFuse: number = 0;
  ph_fuse: number = 0;
  ph_x: number = 0;
  ph_y: number = 0;
  sound_phaser: number = 0;
  static $of(...a: any[]): struct_phaser {
    const o = new struct_phaser();
    const n = a.length;
    if (n > 0) o.ph_status = a[0];
    if (n > 1) o.ph_dir = a[1];
    if (n > 2) o.ph_target = a[2];
    if (n > 3) o.ph_updateFuse = a[3];
    if (n > 4) o.ph_fuse = a[4];
    if (n > 5) o.ph_x = a[5];
    if (n > 6) o.ph_y = a[6];
    if (n > 7) o.sound_phaser = a[7];
    return o;
  }
  $cp(s: struct_phaser): this {
    this.ph_status = s.ph_status;
    this.ph_dir = s.ph_dir;
    this.ph_target = s.ph_target;
    this.ph_updateFuse = s.ph_updateFuse;
    this.ph_fuse = s.ph_fuse;
    this.ph_x = s.ph_x;
    this.ph_y = s.ph_y;
    this.sound_phaser = s.sound_phaser;
    return this;
  }
  $clone(): struct_phaser { return new struct_phaser().$cp(this); }
  static $size = 20;
  static $layout(): any[] { return [['ph_status', 0, ['i', 1, 0]], ['ph_dir', 1, ['i', 1, 0]], ['ph_target', 2, ['i', 2, 1]], ['ph_updateFuse', 4, ['i', 2, 1]], ['ph_fuse', 6, ['i', 2, 1]], ['ph_x', 8, ['i', 4, 1]], ['ph_y', 12, ['i', 4, 1]], ['sound_phaser', 16, ['i', 4, 1]]]; }
}

/** struct phaser_cpacket: 4 bytes */
export class struct_phaser_cpacket {
  type: number = 0;
  dir: number = 0;
  pad1: number = 0;
  pad2: number = 0;
  static $of(...a: any[]): struct_phaser_cpacket {
    const o = new struct_phaser_cpacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.dir = a[1];
    if (n > 2) o.pad1 = a[2];
    if (n > 3) o.pad2 = a[3];
    return o;
  }
  $cp(s: struct_phaser_cpacket): this {
    this.type = s.type;
    this.dir = s.dir;
    this.pad1 = s.pad1;
    this.pad2 = s.pad2;
    return this;
  }
  $clone(): struct_phaser_cpacket { return new struct_phaser_cpacket().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['dir', 1, ['i', 1, 0]], ['pad1', 2, ['i', 1, 1]], ['pad2', 3, ['i', 1, 1]]]; }
}

/** struct phaser_s_spacket: 12 bytes */
export class struct_phaser_s_spacket {
  type: number = 0;
  status: number = 0;
  pnum: number = 0;
  target: number = 0;
  x: number = 0;
  y: number = 0;
  dir: number = 0;
  pad1: number = 0;
  pad2: number = 0;
  pad3: number = 0;
  static $of(...a: any[]): struct_phaser_s_spacket {
    const o = new struct_phaser_s_spacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.status = a[1];
    if (n > 2) o.pnum = a[2];
    if (n > 3) o.target = a[3];
    if (n > 4) o.x = a[4];
    if (n > 5) o.y = a[5];
    if (n > 6) o.dir = a[6];
    if (n > 7) o.pad1 = a[7];
    if (n > 8) o.pad2 = a[8];
    if (n > 9) o.pad3 = a[9];
    return o;
  }
  $cp(s: struct_phaser_s_spacket): this {
    this.type = s.type;
    this.status = s.status;
    this.pnum = s.pnum;
    this.target = s.target;
    this.x = s.x;
    this.y = s.y;
    this.dir = s.dir;
    this.pad1 = s.pad1;
    this.pad2 = s.pad2;
    this.pad3 = s.pad3;
    return this;
  }
  $clone(): struct_phaser_s_spacket { return new struct_phaser_s_spacket().$cp(this); }
  static $size = 12;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['status', 1, ['i', 1, 1]], ['pnum', 2, ['i', 1, 0]], ['target', 3, ['i', 1, 0]], ['x', 4, ['i', 2, 1]], ['y', 6, ['i', 2, 1]], ['dir', 8, ['i', 1, 0]], ['pad1', 9, ['i', 1, 1]], ['pad2', 10, ['i', 1, 1]], ['pad3', 11, ['i', 1, 1]]]; }
}

/** struct phaser_spacket: 16 bytes */
export class struct_phaser_spacket {
  type: number = 0;
  pnum: number = 0;
  status: number = 0;
  dir: number = 0;
  x: number = 0;
  y: number = 0;
  target: number = 0;
  static $of(...a: any[]): struct_phaser_spacket {
    const o = new struct_phaser_spacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.pnum = a[1];
    if (n > 2) o.status = a[2];
    if (n > 3) o.dir = a[3];
    if (n > 4) o.x = a[4];
    if (n > 5) o.y = a[5];
    if (n > 6) o.target = a[6];
    return o;
  }
  $cp(s: struct_phaser_spacket): this {
    this.type = s.type;
    this.pnum = s.pnum;
    this.status = s.status;
    this.dir = s.dir;
    this.x = s.x;
    this.y = s.y;
    this.target = s.target;
    return this;
  }
  $clone(): struct_phaser_spacket { return new struct_phaser_spacket().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['pnum', 1, ['i', 1, 1]], ['status', 2, ['i', 1, 1]], ['dir', 3, ['i', 1, 0]], ['x', 4, ['i', 4, 1]], ['y', 8, ['i', 4, 1]], ['target', 12, ['i', 4, 1]]]; }
}

/** struct pickok_spacket: 4 bytes */
export class struct_pickok_spacket {
  type: number = 0;
  state: number = 0;
  pad2: number = 0;
  pad3: number = 0;
  static $of(...a: any[]): struct_pickok_spacket {
    const o = new struct_pickok_spacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.state = a[1];
    if (n > 2) o.pad2 = a[2];
    if (n > 3) o.pad3 = a[3];
    return o;
  }
  $cp(s: struct_pickok_spacket): this {
    this.type = s.type;
    this.state = s.state;
    this.pad2 = s.pad2;
    this.pad3 = s.pad3;
    return this;
  }
  $clone(): struct_pickok_spacket { return new struct_pickok_spacket().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['state', 1, ['i', 1, 1]], ['pad2', 2, ['i', 1, 1]], ['pad3', 3, ['i', 1, 1]]]; }
}

/** struct ping_cpacket: 12 bytes */
export class struct_ping_cpacket {
  type: number = 0;
  number: number = 0;
  pingme: number = 0;
  pad1: number = 0;
  cp_sent: number = 0;
  cp_recv: number = 0;
  static $of(...a: any[]): struct_ping_cpacket {
    const o = new struct_ping_cpacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.number = a[1];
    if (n > 2) o.pingme = a[2];
    if (n > 3) o.pad1 = a[3];
    if (n > 4) o.cp_sent = a[4];
    if (n > 5) o.cp_recv = a[5];
    return o;
  }
  $cp(s: struct_ping_cpacket): this {
    this.type = s.type;
    this.number = s.number;
    this.pingme = s.pingme;
    this.pad1 = s.pad1;
    this.cp_sent = s.cp_sent;
    this.cp_recv = s.cp_recv;
    return this;
  }
  $clone(): struct_ping_cpacket { return new struct_ping_cpacket().$cp(this); }
  static $size = 12;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['number', 1, ['i', 1, 0]], ['pingme', 2, ['i', 1, 1]], ['pad1', 3, ['i', 1, 1]], ['cp_sent', 4, ['i', 4, 1]], ['cp_recv', 8, ['i', 4, 1]]]; }
}

/** struct ping_spacket: 8 bytes */
export class struct_ping_spacket {
  type: number = 0;
  number: number = 0;
  lag: number = 0;
  tloss_sc: number = 0;
  tloss_cs: number = 0;
  iloss_sc: number = 0;
  iloss_cs: number = 0;
  static $of(...a: any[]): struct_ping_spacket {
    const o = new struct_ping_spacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.number = a[1];
    if (n > 2) o.lag = a[2];
    if (n > 3) o.tloss_sc = a[3];
    if (n > 4) o.tloss_cs = a[4];
    if (n > 5) o.iloss_sc = a[5];
    if (n > 6) o.iloss_cs = a[6];
    return o;
  }
  $cp(s: struct_ping_spacket): this {
    this.type = s.type;
    this.number = s.number;
    this.lag = s.lag;
    this.tloss_sc = s.tloss_sc;
    this.tloss_cs = s.tloss_cs;
    this.iloss_sc = s.iloss_sc;
    this.iloss_cs = s.iloss_cs;
    return this;
  }
  $clone(): struct_ping_spacket { return new struct_ping_spacket().$cp(this); }
  static $size = 8;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['number', 1, ['i', 1, 0]], ['lag', 2, ['i', 2, 0]], ['tloss_sc', 4, ['i', 1, 0]], ['tloss_cs', 5, ['i', 1, 0]], ['iloss_sc', 6, ['i', 1, 0]], ['iloss_cs', 7, ['i', 1, 0]]]; }
}

/** struct planet: 56 bytes */
export class struct_planet {
  pl_no: number = 0;
  pl_flags: number = 0;
  pl_owner: number = 0;
  pl_x: number = 0;
  pl_y: number = 0;
  pl_name: Int8Array = new Int8Array(16);
  pl_namelen: number = 0;
  pl_armies: number = 0;
  pl_info: number = 0;
  pl_deadtime: number = 0;
  pl_couptime: number = 0;
  static $of(...a: any[]): struct_planet {
    const o = new struct_planet();
    const n = a.length;
    if (n > 0) o.pl_no = a[0];
    if (n > 1) o.pl_flags = a[1];
    if (n > 2) o.pl_owner = a[2];
    if (n > 3) o.pl_x = a[3];
    if (n > 4) o.pl_y = a[4];
    if (n > 5) o.pl_name = a[5];
    if (n > 6) o.pl_namelen = a[6];
    if (n > 7) o.pl_armies = a[7];
    if (n > 8) o.pl_info = a[8];
    if (n > 9) o.pl_deadtime = a[9];
    if (n > 10) o.pl_couptime = a[10];
    return o;
  }
  $cp(s: struct_planet): this {
    this.pl_no = s.pl_no;
    this.pl_flags = s.pl_flags;
    this.pl_owner = s.pl_owner;
    this.pl_x = s.pl_x;
    this.pl_y = s.pl_y;
    this.pl_name.set(s.pl_name);
    this.pl_namelen = s.pl_namelen;
    this.pl_armies = s.pl_armies;
    this.pl_info = s.pl_info;
    this.pl_deadtime = s.pl_deadtime;
    this.pl_couptime = s.pl_couptime;
    return this;
  }
  $clone(): struct_planet { return new struct_planet().$cp(this); }
  static $size = 56;
  static $layout(): any[] { return [['pl_no', 0, ['i', 4, 1]], ['pl_flags', 4, ['i', 4, 1]], ['pl_owner', 8, ['i', 4, 1]], ['pl_x', 12, ['i', 4, 1]], ['pl_y', 16, ['i', 4, 1]], ['pl_name', 20, ['a', ['i', 1, 1], 16]], ['pl_namelen', 36, ['i', 4, 1]], ['pl_armies', 40, ['i', 4, 1]], ['pl_info', 44, ['i', 4, 1]], ['pl_deadtime', 48, ['i', 4, 1]], ['pl_couptime', 52, ['i', 4, 1]]]; }
}

/** struct planet_loc_spacket: 28 bytes */
export class struct_planet_loc_spacket {
  type: number = 0;
  pnum: number = 0;
  pad2: number = 0;
  pad3: number = 0;
  x: number = 0;
  y: number = 0;
  name: Int8Array = new Int8Array(16);
  static $of(...a: any[]): struct_planet_loc_spacket {
    const o = new struct_planet_loc_spacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.pnum = a[1];
    if (n > 2) o.pad2 = a[2];
    if (n > 3) o.pad3 = a[3];
    if (n > 4) o.x = a[4];
    if (n > 5) o.y = a[5];
    if (n > 6) o.name = a[6];
    return o;
  }
  $cp(s: struct_planet_loc_spacket): this {
    this.type = s.type;
    this.pnum = s.pnum;
    this.pad2 = s.pad2;
    this.pad3 = s.pad3;
    this.x = s.x;
    this.y = s.y;
    this.name.set(s.name);
    return this;
  }
  $clone(): struct_planet_loc_spacket { return new struct_planet_loc_spacket().$cp(this); }
  static $size = 28;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['pnum', 1, ['i', 1, 1]], ['pad2', 2, ['i', 1, 1]], ['pad3', 3, ['i', 1, 1]], ['x', 4, ['i', 4, 1]], ['y', 8, ['i', 4, 1]], ['name', 12, ['a', ['i', 1, 1], 16]]]; }
}

/** struct planet_s_spacket: 6 bytes */
export class struct_planet_s_spacket {
  pnum: number = 0;
  owner: number = 0;
  info: number = 0;
  armies: number = 0;
  flags: number = 0;
  static $of(...a: any[]): struct_planet_s_spacket {
    const o = new struct_planet_s_spacket();
    const n = a.length;
    if (n > 0) o.pnum = a[0];
    if (n > 1) o.owner = a[1];
    if (n > 2) o.info = a[2];
    if (n > 3) o.armies = a[3];
    if (n > 4) o.flags = a[4];
    return o;
  }
  $cp(s: struct_planet_s_spacket): this {
    this.pnum = s.pnum;
    this.owner = s.owner;
    this.info = s.info;
    this.armies = s.armies;
    this.flags = s.flags;
    return this;
  }
  $clone(): struct_planet_s_spacket { return new struct_planet_s_spacket().$cp(this); }
  static $size = 6;
  static $layout(): any[] { return [['pnum', 0, ['i', 1, 1]], ['owner', 1, ['i', 1, 1]], ['info', 2, ['i', 1, 1]], ['armies', 3, ['i', 1, 0]], ['flags', 4, ['i', 2, 0]]]; }
}

/** struct planet_spacket: 12 bytes */
export class struct_planet_spacket {
  type: number = 0;
  pnum: number = 0;
  owner: number = 0;
  info: number = 0;
  flags: number = 0;
  pad2: number = 0;
  armies: number = 0;
  static $of(...a: any[]): struct_planet_spacket {
    const o = new struct_planet_spacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.pnum = a[1];
    if (n > 2) o.owner = a[2];
    if (n > 3) o.info = a[3];
    if (n > 4) o.flags = a[4];
    if (n > 5) o.pad2 = a[5];
    if (n > 6) o.armies = a[6];
    return o;
  }
  $cp(s: struct_planet_spacket): this {
    this.type = s.type;
    this.pnum = s.pnum;
    this.owner = s.owner;
    this.info = s.info;
    this.flags = s.flags;
    this.pad2 = s.pad2;
    this.armies = s.armies;
    return this;
  }
  $clone(): struct_planet_spacket { return new struct_planet_spacket().$cp(this); }
  static $size = 12;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['pnum', 1, ['i', 1, 1]], ['owner', 2, ['i', 1, 1]], ['info', 3, ['i', 1, 1]], ['flags', 4, ['i', 2, 0]], ['pad2', 6, ['i', 2, 0]], ['armies', 8, ['i', 4, 1]]]; }
}

/** struct planlock_cpacket: 4 bytes */
export class struct_planlock_cpacket {
  type: number = 0;
  pnum: number = 0;
  pad1: number = 0;
  pad2: number = 0;
  static $of(...a: any[]): struct_planlock_cpacket {
    const o = new struct_planlock_cpacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.pnum = a[1];
    if (n > 2) o.pad1 = a[2];
    if (n > 3) o.pad2 = a[3];
    return o;
  }
  $cp(s: struct_planlock_cpacket): this {
    this.type = s.type;
    this.pnum = s.pnum;
    this.pad1 = s.pad1;
    this.pad2 = s.pad2;
    return this;
  }
  $clone(): struct_planlock_cpacket { return new struct_planlock_cpacket().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['pnum', 1, ['i', 1, 1]], ['pad1', 2, ['i', 1, 1]], ['pad2', 3, ['i', 1, 1]]]; }
}

/** struct plasma_cpacket: 4 bytes */
export class struct_plasma_cpacket {
  type: number = 0;
  dir: number = 0;
  pad1: number = 0;
  pad2: number = 0;
  static $of(...a: any[]): struct_plasma_cpacket {
    const o = new struct_plasma_cpacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.dir = a[1];
    if (n > 2) o.pad1 = a[2];
    if (n > 3) o.pad2 = a[3];
    return o;
  }
  $cp(s: struct_plasma_cpacket): this {
    this.type = s.type;
    this.dir = s.dir;
    this.pad1 = s.pad1;
    this.pad2 = s.pad2;
    return this;
  }
  $clone(): struct_plasma_cpacket { return new struct_plasma_cpacket().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['dir', 1, ['i', 1, 0]], ['pad1', 2, ['i', 1, 1]], ['pad2', 3, ['i', 1, 1]]]; }
}

/** struct plasma_info_spacket: 8 bytes */
export class struct_plasma_info_spacket {
  type: number = 0;
  war: number = 0;
  status: number = 0;
  pad1: number = 0;
  pnum: number = 0;
  pad2: number = 0;
  static $of(...a: any[]): struct_plasma_info_spacket {
    const o = new struct_plasma_info_spacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.war = a[1];
    if (n > 2) o.status = a[2];
    if (n > 3) o.pad1 = a[3];
    if (n > 4) o.pnum = a[4];
    if (n > 5) o.pad2 = a[5];
    return o;
  }
  $cp(s: struct_plasma_info_spacket): this {
    this.type = s.type;
    this.war = s.war;
    this.status = s.status;
    this.pad1 = s.pad1;
    this.pnum = s.pnum;
    this.pad2 = s.pad2;
    return this;
  }
  $clone(): struct_plasma_info_spacket { return new struct_plasma_info_spacket().$cp(this); }
  static $size = 8;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['war', 1, ['i', 1, 1]], ['status', 2, ['i', 1, 1]], ['pad1', 3, ['i', 1, 1]], ['pnum', 4, ['i', 2, 0]], ['pad2', 6, ['i', 2, 0]]]; }
}

/** struct plasma_spacket: 12 bytes */
export class struct_plasma_spacket {
  type: number = 0;
  pad1: number = 0;
  pnum: number = 0;
  x: number = 0;
  y: number = 0;
  static $of(...a: any[]): struct_plasma_spacket {
    const o = new struct_plasma_spacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.pad1 = a[1];
    if (n > 2) o.pnum = a[2];
    if (n > 3) o.x = a[3];
    if (n > 4) o.y = a[4];
    return o;
  }
  $cp(s: struct_plasma_spacket): this {
    this.type = s.type;
    this.pad1 = s.pad1;
    this.pnum = s.pnum;
    this.x = s.x;
    this.y = s.y;
    return this;
  }
  $clone(): struct_plasma_spacket { return new struct_plasma_spacket().$cp(this); }
  static $size = 12;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['pad1', 1, ['i', 1, 1]], ['pnum', 2, ['i', 2, 0]], ['x', 4, ['i', 4, 1]], ['y', 8, ['i', 4, 1]]]; }
}

/** struct plasmatorp: 16 bytes */
export class struct_plasmatorp {
  pt_status: number = 0;
  pt_war: number = 0;
  pt_owner: number = 0;
  pt_fuse: number = 0;
  pt_updateFuse: number = 0;
  pt_x: number = 0;
  pt_y: number = 0;
  static $of(...a: any[]): struct_plasmatorp {
    const o = new struct_plasmatorp();
    const n = a.length;
    if (n > 0) o.pt_status = a[0];
    if (n > 1) o.pt_war = a[1];
    if (n > 2) o.pt_owner = a[2];
    if (n > 3) o.pt_fuse = a[3];
    if (n > 4) o.pt_updateFuse = a[4];
    if (n > 5) o.pt_x = a[5];
    if (n > 6) o.pt_y = a[6];
    return o;
  }
  $cp(s: struct_plasmatorp): this {
    this.pt_status = s.pt_status;
    this.pt_war = s.pt_war;
    this.pt_owner = s.pt_owner;
    this.pt_fuse = s.pt_fuse;
    this.pt_updateFuse = s.pt_updateFuse;
    this.pt_x = s.pt_x;
    this.pt_y = s.pt_y;
    return this;
  }
  $clone(): struct_plasmatorp { return new struct_plasmatorp().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['pt_status', 0, ['i', 1, 0]], ['pt_war', 1, ['i', 1, 1]], ['pt_owner', 2, ['i', 2, 1]], ['pt_fuse', 4, ['i', 2, 1]], ['pt_updateFuse', 6, ['i', 2, 1]], ['pt_x', 8, ['i', 4, 1]], ['pt_y', 12, ['i', 4, 1]]]; }
}

/** struct player: 816 bytes */
export class struct_player {
  p_no: number = 0;
  p_updates: number = 0;
  p_status: number = 0;
  p_flags: number = 0;
  p_name: Int8Array = new Int8Array(16);
  p_login: Int8Array = new Int8Array(16);
  p_monitor: Int8Array = new Int8Array(16);
  p_mapchars: Int8Array = new Int8Array(2);
  p_ship: struct_ship = new struct_ship();
  p_x: number = 0;
  p_y: number = 0;
  p_dir: number = 0;
  p_desdir: number = 0;
  p_subdir: number = 0;
  p_speed: number = 0;
  p_desspeed: number = 0;
  p_subspeed: number = 0;
  p_team: number = 0;
  p_damage: number = 0;
  p_subdamage: number = 0;
  p_shield: number = 0;
  p_subshield: number = 0;
  p_cloakphase: number = 0;
  p_ntorp: number = 0;
  p_nplasmatorp: number = 0;
  p_hostile: number = 0;
  p_swar: number = 0;
  p_kills: number = 0;
  p_planet: number = 0;
  pl_orbit: number = 0;
  p_playerl: number = 0;
  p_armies: number = 0;
  p_fuel: number = 0;
  p_explode: number = 0;
  p_etemp: number = 0;
  p_etime: number = 0;
  p_wtemp: number = 0;
  p_wtime: number = 0;
  p_whydead: number = 0;
  p_whodead: number = 0;
  p_stats: struct_stats = new struct_stats();
  p_genoplanets: number = 0;
  p_genoarmsbomb: number = 0;
  p_planets: number = 0;
  p_armsbomb: number = 0;
  p_docked: number = 0;
  p_port: Int32Array = new Int32Array(4);
  p_tractor: number = 0;
  p_pos: number = 0;
  p_repair_time: number = 0;
  static $of(...a: any[]): struct_player {
    const o = new struct_player();
    const n = a.length;
    if (n > 0) o.p_no = a[0];
    if (n > 1) o.p_updates = a[1];
    if (n > 2) o.p_status = a[2];
    if (n > 3) o.p_flags = a[3];
    if (n > 4) o.p_name = a[4];
    if (n > 5) o.p_login = a[5];
    if (n > 6) o.p_monitor = a[6];
    if (n > 7) o.p_mapchars = a[7];
    if (n > 8) o.p_ship = a[8];
    if (n > 9) o.p_x = a[9];
    if (n > 10) o.p_y = a[10];
    if (n > 11) o.p_dir = a[11];
    if (n > 12) o.p_desdir = a[12];
    if (n > 13) o.p_subdir = a[13];
    if (n > 14) o.p_speed = a[14];
    if (n > 15) o.p_desspeed = a[15];
    if (n > 16) o.p_subspeed = a[16];
    if (n > 17) o.p_team = a[17];
    if (n > 18) o.p_damage = a[18];
    if (n > 19) o.p_subdamage = a[19];
    if (n > 20) o.p_shield = a[20];
    if (n > 21) o.p_subshield = a[21];
    if (n > 22) o.p_cloakphase = a[22];
    if (n > 23) o.p_ntorp = a[23];
    if (n > 24) o.p_nplasmatorp = a[24];
    if (n > 25) o.p_hostile = a[25];
    if (n > 26) o.p_swar = a[26];
    if (n > 27) o.p_kills = a[27];
    if (n > 28) o.p_planet = a[28];
    if (n > 29) o.pl_orbit = a[29];
    if (n > 30) o.p_playerl = a[30];
    if (n > 31) o.p_armies = a[31];
    if (n > 32) o.p_fuel = a[32];
    if (n > 33) o.p_explode = a[33];
    if (n > 34) o.p_etemp = a[34];
    if (n > 35) o.p_etime = a[35];
    if (n > 36) o.p_wtemp = a[36];
    if (n > 37) o.p_wtime = a[37];
    if (n > 38) o.p_whydead = a[38];
    if (n > 39) o.p_whodead = a[39];
    if (n > 40) o.p_stats = a[40];
    if (n > 41) o.p_genoplanets = a[41];
    if (n > 42) o.p_genoarmsbomb = a[42];
    if (n > 43) o.p_planets = a[43];
    if (n > 44) o.p_armsbomb = a[44];
    if (n > 45) o.p_docked = a[45];
    if (n > 46) o.p_port = a[46];
    if (n > 47) o.p_tractor = a[47];
    if (n > 48) o.p_pos = a[48];
    if (n > 49) o.p_repair_time = a[49];
    return o;
  }
  $cp(s: struct_player): this {
    this.p_no = s.p_no;
    this.p_updates = s.p_updates;
    this.p_status = s.p_status;
    this.p_flags = s.p_flags;
    this.p_name.set(s.p_name);
    this.p_login.set(s.p_login);
    this.p_monitor.set(s.p_monitor);
    this.p_mapchars.set(s.p_mapchars);
    this.p_ship.$cp(s.p_ship);
    this.p_x = s.p_x;
    this.p_y = s.p_y;
    this.p_dir = s.p_dir;
    this.p_desdir = s.p_desdir;
    this.p_subdir = s.p_subdir;
    this.p_speed = s.p_speed;
    this.p_desspeed = s.p_desspeed;
    this.p_subspeed = s.p_subspeed;
    this.p_team = s.p_team;
    this.p_damage = s.p_damage;
    this.p_subdamage = s.p_subdamage;
    this.p_shield = s.p_shield;
    this.p_subshield = s.p_subshield;
    this.p_cloakphase = s.p_cloakphase;
    this.p_ntorp = s.p_ntorp;
    this.p_nplasmatorp = s.p_nplasmatorp;
    this.p_hostile = s.p_hostile;
    this.p_swar = s.p_swar;
    this.p_kills = s.p_kills;
    this.p_planet = s.p_planet;
    this.pl_orbit = s.pl_orbit;
    this.p_playerl = s.p_playerl;
    this.p_armies = s.p_armies;
    this.p_fuel = s.p_fuel;
    this.p_explode = s.p_explode;
    this.p_etemp = s.p_etemp;
    this.p_etime = s.p_etime;
    this.p_wtemp = s.p_wtemp;
    this.p_wtime = s.p_wtime;
    this.p_whydead = s.p_whydead;
    this.p_whodead = s.p_whodead;
    this.p_stats.$cp(s.p_stats);
    this.p_genoplanets = s.p_genoplanets;
    this.p_genoarmsbomb = s.p_genoarmsbomb;
    this.p_planets = s.p_planets;
    this.p_armsbomb = s.p_armsbomb;
    this.p_docked = s.p_docked;
    this.p_port.set(s.p_port);
    this.p_tractor = s.p_tractor;
    this.p_pos = s.p_pos;
    this.p_repair_time = s.p_repair_time;
    return this;
  }
  $clone(): struct_player { return new struct_player().$cp(this); }
  static $size = 816;
  static $layout(): any[] { return [['p_no', 0, ['i', 4, 1]], ['p_updates', 4, ['i', 4, 1]], ['p_status', 8, ['i', 4, 1]], ['p_flags', 12, ['i', 4, 0]], ['p_name', 16, ['a', ['i', 1, 1], 16]], ['p_login', 32, ['a', ['i', 1, 1], 16]], ['p_monitor', 48, ['a', ['i', 1, 1], 16]], ['p_mapchars', 64, ['a', ['i', 1, 1], 2]], ['p_ship', 68, ['r', struct_ship]], ['p_x', 108, ['i', 4, 1]], ['p_y', 112, ['i', 4, 1]], ['p_dir', 116, ['i', 1, 0]], ['p_desdir', 117, ['i', 1, 0]], ['p_subdir', 120, ['i', 4, 1]], ['p_speed', 124, ['i', 4, 1]], ['p_desspeed', 128, ['i', 2, 1]], ['p_subspeed', 132, ['i', 4, 1]], ['p_team', 136, ['i', 2, 1]], ['p_damage', 140, ['i', 4, 1]], ['p_subdamage', 144, ['i', 4, 1]], ['p_shield', 148, ['i', 4, 1]], ['p_subshield', 152, ['i', 4, 1]], ['p_cloakphase', 156, ['i', 2, 1]], ['p_ntorp', 158, ['i', 2, 1]], ['p_nplasmatorp', 160, ['i', 2, 1]], ['p_hostile', 162, ['i', 1, 1]], ['p_swar', 163, ['i', 1, 1]], ['p_kills', 164, ['d', 4]], ['p_planet', 168, ['i', 2, 1]], ['pl_orbit', 170, ['i', 2, 1]], ['p_playerl', 172, ['i', 2, 1]], ['p_armies', 176, ['i', 4, 1]], ['p_fuel', 180, ['i', 4, 1]], ['p_explode', 184, ['i', 2, 1]], ['p_etemp', 188, ['i', 4, 1]], ['p_etime', 192, ['i', 2, 1]], ['p_wtemp', 196, ['i', 4, 1]], ['p_wtime', 200, ['i', 2, 1]], ['p_whydead', 202, ['i', 2, 1]], ['p_whodead', 204, ['i', 2, 1]], ['p_stats', 208, ['r', struct_stats]], ['p_genoplanets', 776, ['i', 2, 1]], ['p_genoarmsbomb', 778, ['i', 2, 1]], ['p_planets', 780, ['i', 2, 1]], ['p_armsbomb', 782, ['i', 2, 1]], ['p_docked', 784, ['i', 4, 1]], ['p_port', 788, ['a', ['i', 4, 1], 4]], ['p_tractor', 804, ['i', 2, 1]], ['p_pos', 808, ['i', 4, 1]], ['p_repair_time', 812, ['i', 2, 1]]]; }
}

/** struct player_s2_spacket: 12 bytes */
export class struct_player_s2_spacket {
  type: number = 0;
  packets: number = 0;
  dir: number = 0;
  speed: number = 0;
  x: number = 0;
  y: number = 0;
  flags: number = 0;
  static $of(...a: any[]): struct_player_s2_spacket {
    const o = new struct_player_s2_spacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.packets = a[1];
    if (n > 2) o.dir = a[2];
    if (n > 3) o.speed = a[3];
    if (n > 4) o.x = a[4];
    if (n > 5) o.y = a[5];
    if (n > 6) o.flags = a[6];
    return o;
  }
  $cp(s: struct_player_s2_spacket): this {
    this.type = s.type;
    this.packets = s.packets;
    this.dir = s.dir;
    this.speed = s.speed;
    this.x = s.x;
    this.y = s.y;
    this.flags = s.flags;
    return this;
  }
  $clone(): struct_player_s2_spacket { return new struct_player_s2_spacket().$cp(this); }
  static $size = 12;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['packets', 1, ['i', 1, 1]], ['dir', 2, ['i', 1, 0]], ['speed', 3, ['i', 1, 1]], ['x', 4, ['i', 2, 1]], ['y', 6, ['i', 2, 1]], ['flags', 8, ['i', 4, 0]]]; }
}

/** struct player_s_spacket: 12 bytes */
export class struct_player_s_spacket {
  type: number = 0;
  packets: number = 0;
  dir: number = 0;
  speed: number = 0;
  x: number = 0;
  y: number = 0;
  static $of(...a: any[]): struct_player_s_spacket {
    const o = new struct_player_s_spacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.packets = a[1];
    if (n > 2) o.dir = a[2];
    if (n > 3) o.speed = a[3];
    if (n > 4) o.x = a[4];
    if (n > 5) o.y = a[5];
    return o;
  }
  $cp(s: struct_player_s_spacket): this {
    this.type = s.type;
    this.packets = s.packets;
    this.dir = s.dir;
    this.speed = s.speed;
    this.x = s.x;
    this.y = s.y;
    return this;
  }
  $clone(): struct_player_s_spacket { return new struct_player_s_spacket().$cp(this); }
  static $size = 12;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['packets', 1, ['i', 1, 1]], ['dir', 2, ['i', 1, 0]], ['speed', 3, ['i', 1, 1]], ['x', 4, ['i', 4, 1]], ['y', 8, ['i', 4, 1]]]; }
}

/** struct player_spacket: 12 bytes */
export class struct_player_spacket {
  type: number = 0;
  pnum: number = 0;
  dir: number = 0;
  speed: number = 0;
  x: number = 0;
  y: number = 0;
  static $of(...a: any[]): struct_player_spacket {
    const o = new struct_player_spacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.pnum = a[1];
    if (n > 2) o.dir = a[2];
    if (n > 3) o.speed = a[3];
    if (n > 4) o.x = a[4];
    if (n > 5) o.y = a[5];
    return o;
  }
  $cp(s: struct_player_spacket): this {
    this.type = s.type;
    this.pnum = s.pnum;
    this.dir = s.dir;
    this.speed = s.speed;
    this.x = s.x;
    this.y = s.y;
    return this;
  }
  $clone(): struct_player_spacket { return new struct_player_spacket().$cp(this); }
  static $size = 12;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['pnum', 1, ['i', 1, 1]], ['dir', 2, ['i', 1, 0]], ['speed', 3, ['i', 1, 1]], ['x', 4, ['i', 4, 1]], ['y', 8, ['i', 4, 1]]]; }
}

/** struct playlock_cpacket: 4 bytes */
export class struct_playlock_cpacket {
  type: number = 0;
  pnum: number = 0;
  pad1: number = 0;
  pad2: number = 0;
  static $of(...a: any[]): struct_playlock_cpacket {
    const o = new struct_playlock_cpacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.pnum = a[1];
    if (n > 2) o.pad1 = a[2];
    if (n > 3) o.pad2 = a[3];
    return o;
  }
  $cp(s: struct_playlock_cpacket): this {
    this.type = s.type;
    this.pnum = s.pnum;
    this.pad1 = s.pad1;
    this.pad2 = s.pad2;
    return this;
  }
  $clone(): struct_playlock_cpacket { return new struct_playlock_cpacket().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['pnum', 1, ['i', 1, 1]], ['pad1', 2, ['i', 1, 1]], ['pad2', 3, ['i', 1, 1]]]; }
}

/** struct plupdate: 12 bytes */
export class struct_plupdate {
  plu_update: number = 0;
  plu_x: number = 0;
  plu_y: number = 0;
  static $of(...a: any[]): struct_plupdate {
    const o = new struct_plupdate();
    const n = a.length;
    if (n > 0) o.plu_update = a[0];
    if (n > 1) o.plu_x = a[1];
    if (n > 2) o.plu_y = a[2];
    return o;
  }
  $cp(s: struct_plupdate): this {
    this.plu_update = s.plu_update;
    this.plu_x = s.plu_x;
    this.plu_y = s.plu_y;
    return this;
  }
  $clone(): struct_plupdate { return new struct_plupdate().$cp(this); }
  static $size = 12;
  static $layout(): any[] { return [['plu_update', 0, ['i', 4, 1]], ['plu_x', 4, ['i', 4, 1]], ['plu_y', 8, ['i', 4, 1]]]; }
}

/** struct plyr_info_spacket: 4 bytes */
export class struct_plyr_info_spacket {
  type: number = 0;
  pnum: number = 0;
  shiptype: number = 0;
  team: number = 0;
  static $of(...a: any[]): struct_plyr_info_spacket {
    const o = new struct_plyr_info_spacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.pnum = a[1];
    if (n > 2) o.shiptype = a[2];
    if (n > 3) o.team = a[3];
    return o;
  }
  $cp(s: struct_plyr_info_spacket): this {
    this.type = s.type;
    this.pnum = s.pnum;
    this.shiptype = s.shiptype;
    this.team = s.team;
    return this;
  }
  $clone(): struct_plyr_info_spacket { return new struct_plyr_info_spacket().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['pnum', 1, ['i', 1, 1]], ['shiptype', 2, ['i', 1, 1]], ['team', 3, ['i', 1, 1]]]; }
}

/** struct plyr_login_spacket: 52 bytes */
export class struct_plyr_login_spacket {
  type: number = 0;
  pnum: number = 0;
  rank: number = 0;
  pad1: number = 0;
  name: Int8Array = new Int8Array(16);
  monitor: Int8Array = new Int8Array(16);
  login: Int8Array = new Int8Array(16);
  static $of(...a: any[]): struct_plyr_login_spacket {
    const o = new struct_plyr_login_spacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.pnum = a[1];
    if (n > 2) o.rank = a[2];
    if (n > 3) o.pad1 = a[3];
    if (n > 4) o.name = a[4];
    if (n > 5) o.monitor = a[5];
    if (n > 6) o.login = a[6];
    return o;
  }
  $cp(s: struct_plyr_login_spacket): this {
    this.type = s.type;
    this.pnum = s.pnum;
    this.rank = s.rank;
    this.pad1 = s.pad1;
    this.name.set(s.name);
    this.monitor.set(s.monitor);
    this.login.set(s.login);
    return this;
  }
  $clone(): struct_plyr_login_spacket { return new struct_plyr_login_spacket().$cp(this); }
  static $size = 52;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['pnum', 1, ['i', 1, 1]], ['rank', 2, ['i', 1, 1]], ['pad1', 3, ['i', 1, 1]], ['name', 4, ['a', ['i', 1, 1], 16]], ['monitor', 20, ['a', ['i', 1, 1], 16]], ['login', 36, ['a', ['i', 1, 1], 16]]]; }
}

/** struct profanity: 528 bytes */
export class struct_profanity {
  badWord: Int8Array = new Int8Array(10);
  beginningOnly: number = 0;
  skip: Int32Array = new Int32Array(128);
  static $of(...a: any[]): struct_profanity {
    const o = new struct_profanity();
    const n = a.length;
    if (n > 0) o.badWord = a[0];
    if (n > 1) o.beginningOnly = a[1];
    if (n > 2) o.skip = a[2];
    return o;
  }
  $cp(s: struct_profanity): this {
    this.badWord.set(s.badWord);
    this.beginningOnly = s.beginningOnly;
    this.skip.set(s.skip);
    return this;
  }
  $clone(): struct_profanity { return new struct_profanity().$cp(this); }
  static $size = 528;
  static $layout(): any[] { return [['badWord', 0, ['a', ['i', 1, 1], 10]], ['beginningOnly', 12, ['i', 4, 1]], ['skip', 16, ['a', ['i', 4, 1], 128]]]; }
}

/** struct pstatus_spacket: 4 bytes */
export class struct_pstatus_spacket {
  type: number = 0;
  pnum: number = 0;
  status: number = 0;
  pad1: number = 0;
  static $of(...a: any[]): struct_pstatus_spacket {
    const o = new struct_pstatus_spacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.pnum = a[1];
    if (n > 2) o.status = a[2];
    if (n > 3) o.pad1 = a[3];
    return o;
  }
  $cp(s: struct_pstatus_spacket): this {
    this.type = s.type;
    this.pnum = s.pnum;
    this.status = s.status;
    this.pad1 = s.pad1;
    return this;
  }
  $clone(): struct_pstatus_spacket { return new struct_pstatus_spacket().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['pnum', 1, ['i', 1, 1]], ['status', 2, ['i', 1, 1]], ['pad1', 3, ['i', 1, 1]]]; }
}

/** struct queue_spacket: 4 bytes */
export class struct_queue_spacket {
  type: number = 0;
  pad1: number = 0;
  pos: number = 0;
  static $of(...a: any[]): struct_queue_spacket {
    const o = new struct_queue_spacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.pad1 = a[1];
    if (n > 2) o.pos = a[2];
    return o;
  }
  $cp(s: struct_queue_spacket): this {
    this.type = s.type;
    this.pad1 = s.pad1;
    this.pos = s.pos;
    return this;
  }
  $clone(): struct_queue_spacket { return new struct_queue_spacket().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['pad1', 1, ['i', 1, 1]], ['pos', 2, ['i', 2, 0]]]; }
}

/** struct rank: 32 bytes */
export class struct_rank {
  hours: number = 0;
  ratings: number = 0;
  offense: number = 0;
  name: any = null;
  cname: any = null;
  static $of(...a: any[]): struct_rank {
    const o = new struct_rank();
    const n = a.length;
    if (n > 0) o.hours = a[0];
    if (n > 1) o.ratings = a[1];
    if (n > 2) o.offense = a[2];
    if (n > 3) o.name = a[3];
    if (n > 4) o.cname = a[4];
    return o;
  }
  $cp(s: struct_rank): this {
    this.hours = s.hours;
    this.ratings = s.ratings;
    this.offense = s.offense;
    this.name = s.name;
    this.cname = s.cname;
    return this;
  }
  $clone(): struct_rank { return new struct_rank().$cp(this); }
  static $size = 32;
  static $layout(): any[] { return [['hours', 0, ['d', 4]], ['ratings', 4, ['d', 4]], ['offense', 8, ['d', 4]], ['name', 16, ['p']], ['cname', 24, ['p']]]; }
}

/** struct rank_spacket: 40 bytes */
export class struct_rank_spacket {
  type: number = 0;
  rnum: number = 0;
  rmax: number = 0;
  pad: number = 0;
  name: Int8Array = new Int8Array(16);
  hours: number = 0;
  ratings: number = 0;
  offense: number = 0;
  cname: Int8Array = new Int8Array(8);
  static $of(...a: any[]): struct_rank_spacket {
    const o = new struct_rank_spacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.rnum = a[1];
    if (n > 2) o.rmax = a[2];
    if (n > 3) o.pad = a[3];
    if (n > 4) o.name = a[4];
    if (n > 5) o.hours = a[5];
    if (n > 6) o.ratings = a[6];
    if (n > 7) o.offense = a[7];
    if (n > 8) o.cname = a[8];
    return o;
  }
  $cp(s: struct_rank_spacket): this {
    this.type = s.type;
    this.rnum = s.rnum;
    this.rmax = s.rmax;
    this.pad = s.pad;
    this.name.set(s.name);
    this.hours = s.hours;
    this.ratings = s.ratings;
    this.offense = s.offense;
    this.cname.set(s.cname);
    return this;
  }
  $clone(): struct_rank_spacket { return new struct_rank_spacket().$cp(this); }
  static $size = 40;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['rnum', 1, ['i', 1, 1]], ['rmax', 2, ['i', 1, 1]], ['pad', 3, ['i', 1, 1]], ['name', 4, ['a', ['i', 1, 1], 16]], ['hours', 20, ['i', 4, 1]], ['ratings', 24, ['i', 4, 1]], ['offense', 28, ['i', 4, 1]], ['cname', 32, ['a', ['i', 1, 1], 8]]]; }
}

/** struct refit_cpacket: 4 bytes */
export class struct_refit_cpacket {
  type: number = 0;
  ship: number = 0;
  pad1: number = 0;
  pad2: number = 0;
  static $of(...a: any[]): struct_refit_cpacket {
    const o = new struct_refit_cpacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.ship = a[1];
    if (n > 2) o.pad1 = a[2];
    if (n > 3) o.pad2 = a[3];
    return o;
  }
  $cp(s: struct_refit_cpacket): this {
    this.type = s.type;
    this.ship = s.ship;
    this.pad1 = s.pad1;
    this.pad2 = s.pad2;
    return this;
  }
  $clone(): struct_refit_cpacket { return new struct_refit_cpacket().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['ship', 1, ['i', 1, 1]], ['pad1', 2, ['i', 1, 1]], ['pad2', 3, ['i', 1, 1]]]; }
}

/** struct repair_cpacket: 4 bytes */
export class struct_repair_cpacket {
  type: number = 0;
  state: number = 0;
  pad1: number = 0;
  pad2: number = 0;
  static $of(...a: any[]): struct_repair_cpacket {
    const o = new struct_repair_cpacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.state = a[1];
    if (n > 2) o.pad1 = a[2];
    if (n > 3) o.pad2 = a[3];
    return o;
  }
  $cp(s: struct_repair_cpacket): this {
    this.type = s.type;
    this.state = s.state;
    this.pad1 = s.pad1;
    this.pad2 = s.pad2;
    return this;
  }
  $clone(): struct_repair_cpacket { return new struct_repair_cpacket().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['state', 1, ['i', 1, 1]], ['pad1', 2, ['i', 1, 1]], ['pad2', 3, ['i', 1, 1]]]; }
}

/** struct repress_cpacket: 4 bytes */
export class struct_repress_cpacket {
  type: number = 0;
  state: number = 0;
  pnum: number = 0;
  pad2: number = 0;
  static $of(...a: any[]): struct_repress_cpacket {
    const o = new struct_repress_cpacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.state = a[1];
    if (n > 2) o.pnum = a[2];
    if (n > 3) o.pad2 = a[3];
    return o;
  }
  $cp(s: struct_repress_cpacket): this {
    this.type = s.type;
    this.state = s.state;
    this.pnum = s.pnum;
    this.pad2 = s.pad2;
    return this;
  }
  $clone(): struct_repress_cpacket { return new struct_repress_cpacket().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['state', 1, ['i', 1, 1]], ['pnum', 2, ['i', 1, 1]], ['pad2', 3, ['i', 1, 1]]]; }
}

/** struct reserved_cpacket: 36 bytes */
export class struct_reserved_cpacket {
  type: number = 0;
  pad1: number = 0;
  pad2: number = 0;
  pad3: number = 0;
  data: Int8Array = new Int8Array(16);
  resp: Int8Array = new Int8Array(16);
  static $of(...a: any[]): struct_reserved_cpacket {
    const o = new struct_reserved_cpacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.pad1 = a[1];
    if (n > 2) o.pad2 = a[2];
    if (n > 3) o.pad3 = a[3];
    if (n > 4) o.data = a[4];
    if (n > 5) o.resp = a[5];
    return o;
  }
  $cp(s: struct_reserved_cpacket): this {
    this.type = s.type;
    this.pad1 = s.pad1;
    this.pad2 = s.pad2;
    this.pad3 = s.pad3;
    this.data.set(s.data);
    this.resp.set(s.resp);
    return this;
  }
  $clone(): struct_reserved_cpacket { return new struct_reserved_cpacket().$cp(this); }
  static $size = 36;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['pad1', 1, ['i', 1, 1]], ['pad2', 2, ['i', 1, 1]], ['pad3', 3, ['i', 1, 1]], ['data', 4, ['a', ['i', 1, 1], 16]], ['resp', 20, ['a', ['i', 1, 1], 16]]]; }
}

/** struct reserved_spacket: 20 bytes */
export class struct_reserved_spacket {
  type: number = 0;
  pad1: number = 0;
  pad2: number = 0;
  pad3: number = 0;
  data: Int8Array = new Int8Array(16);
  static $of(...a: any[]): struct_reserved_spacket {
    const o = new struct_reserved_spacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.pad1 = a[1];
    if (n > 2) o.pad2 = a[2];
    if (n > 3) o.pad3 = a[3];
    if (n > 4) o.data = a[4];
    return o;
  }
  $cp(s: struct_reserved_spacket): this {
    this.type = s.type;
    this.pad1 = s.pad1;
    this.pad2 = s.pad2;
    this.pad3 = s.pad3;
    this.data.set(s.data);
    return this;
  }
  $clone(): struct_reserved_spacket { return new struct_reserved_spacket().$cp(this); }
  static $size = 20;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['pad1', 1, ['i', 1, 1]], ['pad2', 2, ['i', 1, 1]], ['pad3', 3, ['i', 1, 1]], ['data', 4, ['a', ['i', 1, 1], 16]]]; }
}

/** struct resetstats_cpacket: 4 bytes */
export class struct_resetstats_cpacket {
  type: number = 0;
  verify: number = 0;
  pad2: number = 0;
  pad3: number = 0;
  static $of(...a: any[]): struct_resetstats_cpacket {
    const o = new struct_resetstats_cpacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.verify = a[1];
    if (n > 2) o.pad2 = a[2];
    if (n > 3) o.pad3 = a[3];
    return o;
  }
  $cp(s: struct_resetstats_cpacket): this {
    this.type = s.type;
    this.verify = s.verify;
    this.pad2 = s.pad2;
    this.pad3 = s.pad3;
    return this;
  }
  $clone(): struct_resetstats_cpacket { return new struct_resetstats_cpacket().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['verify', 1, ['i', 1, 1]], ['pad2', 2, ['i', 1, 1]], ['pad3', 3, ['i', 1, 1]]]; }
}

/** struct s_line: 32 bytes */
export class struct_s_line {
  begin_x: number = 0;
  begin_y: number = 0;
  end_x: number = 0;
  end_y: number = 0;
  color: number = 0;
  orientation: number = 0;
  flag: any = null;
  static $of(...a: any[]): struct_s_line {
    const o = new struct_s_line();
    const n = a.length;
    if (n > 0) o.begin_x = a[0];
    if (n > 1) o.begin_y = a[1];
    if (n > 2) o.end_x = a[2];
    if (n > 3) o.end_y = a[3];
    if (n > 4) o.color = a[4];
    if (n > 5) o.orientation = a[5];
    if (n > 6) o.flag = a[6];
    return o;
  }
  $cp(s: struct_s_line): this {
    this.begin_x = s.begin_x;
    this.begin_y = s.begin_y;
    this.end_x = s.end_x;
    this.end_y = s.end_y;
    this.color = s.color;
    this.orientation = s.orientation;
    this.flag = s.flag;
    return this;
  }
  $clone(): struct_s_line { return new struct_s_line().$cp(this); }
  static $size = 32;
  static $layout(): any[] { return [['begin_x', 0, ['i', 4, 1]], ['begin_y', 4, ['i', 4, 1]], ['end_x', 8, ['i', 4, 1]], ['end_y', 12, ['i', 4, 1]], ['color', 16, ['i', 4, 1]], ['orientation', 20, ['i', 4, 1]], ['flag', 24, ['p']]]; }
}

/** struct sc_sequence_spacket: 4 bytes */
export class struct_sc_sequence_spacket {
  type: number = 0;
  pad1: number = 0;
  sequence: number = 0;
  static $of(...a: any[]): struct_sc_sequence_spacket {
    const o = new struct_sc_sequence_spacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.pad1 = a[1];
    if (n > 2) o.sequence = a[2];
    return o;
  }
  $cp(s: struct_sc_sequence_spacket): this {
    this.type = s.type;
    this.pad1 = s.pad1;
    this.sequence = s.sequence;
    return this;
  }
  $clone(): struct_sc_sequence_spacket { return new struct_sc_sequence_spacket().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['pad1', 1, ['i', 1, 1]], ['sequence', 2, ['i', 2, 0]]]; }
}

/** struct scrollingWindow: 40 bytes */
export class struct_scrollingWindow {
  lines: number = 0;
  updated: number = 0;
  topline: number = 0;
  head: struct_stringList | null = null;
  tail: struct_stringList | null = null;
  index: struct_stringList | null = null;
  static $of(...a: any[]): struct_scrollingWindow {
    const o = new struct_scrollingWindow();
    const n = a.length;
    if (n > 0) o.lines = a[0];
    if (n > 1) o.updated = a[1];
    if (n > 2) o.topline = a[2];
    if (n > 3) o.head = a[3];
    if (n > 4) o.tail = a[4];
    if (n > 5) o.index = a[5];
    return o;
  }
  $cp(s: struct_scrollingWindow): this {
    this.lines = s.lines;
    this.updated = s.updated;
    this.topline = s.topline;
    this.head = s.head;
    this.tail = s.tail;
    this.index = s.index;
    return this;
  }
  $clone(): struct_scrollingWindow { return new struct_scrollingWindow().$cp(this); }
  static $size = 40;
  static $layout(): any[] { return [['lines', 0, ['i', 4, 1]], ['updated', 4, ['i', 4, 1]], ['topline', 8, ['i', 4, 1]], ['head', 16, ['p']], ['tail', 24, ['p']], ['index', 32, ['p']]]; }
}

/** struct sequence_cpacket: 4 bytes */
export class struct_sequence_cpacket {
  type: number = 0;
  pad1: number = 0;
  sequence: number = 0;
  static $of(...a: any[]): struct_sequence_cpacket {
    const o = new struct_sequence_cpacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.pad1 = a[1];
    if (n > 2) o.sequence = a[2];
    return o;
  }
  $cp(s: struct_sequence_cpacket): this {
    this.type = s.type;
    this.pad1 = s.pad1;
    this.sequence = s.sequence;
    return this;
  }
  $clone(): struct_sequence_cpacket { return new struct_sequence_cpacket().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['pad1', 1, ['i', 1, 1]], ['sequence', 2, ['i', 2, 0]]]; }
}

/** struct sequence_spacket: 4 bytes */
export class struct_sequence_spacket {
  type: number = 0;
  flag16: number = 0;
  sequence: number = 0;
  static $of(...a: any[]): struct_sequence_spacket {
    const o = new struct_sequence_spacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.flag16 = a[1];
    if (n > 2) o.sequence = a[2];
    return o;
  }
  $cp(s: struct_sequence_spacket): this {
    this.type = s.type;
    this.flag16 = s.flag16;
    this.sequence = s.sequence;
    return this;
  }
  $clone(): struct_sequence_spacket { return new struct_sequence_spacket().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['flag16', 1, ['i', 1, 0]], ['sequence', 2, ['i', 2, 0]]]; }
}

/** struct servers: 256 bytes */
export class struct_servers {
  address: Int8Array = new Int8Array(100);
  port: number = 0;
  age: number = 0;
  when: number = 0;
  refresh: number = 0;
  lifetime: number = 0;
  players: number = 0;
  status: number = 0;
  typeflag: number = 0;
  comment: Int8Array = new Int8Array(100);
  pid: number = 0;
  exitstatus: number = 0;
  observer: number = 0;
  static $of(...a: any[]): struct_servers {
    const o = new struct_servers();
    const n = a.length;
    if (n > 0) o.address = a[0];
    if (n > 1) o.port = a[1];
    if (n > 2) o.age = a[2];
    if (n > 3) o.when = a[3];
    if (n > 4) o.refresh = a[4];
    if (n > 5) o.lifetime = a[5];
    if (n > 6) o.players = a[6];
    if (n > 7) o.status = a[7];
    if (n > 8) o.typeflag = a[8];
    if (n > 9) o.comment = a[9];
    if (n > 10) o.pid = a[10];
    if (n > 11) o.exitstatus = a[11];
    if (n > 12) o.observer = a[12];
    return o;
  }
  $cp(s: struct_servers): this {
    this.address.set(s.address);
    this.port = s.port;
    this.age = s.age;
    this.when = s.when;
    this.refresh = s.refresh;
    this.lifetime = s.lifetime;
    this.players = s.players;
    this.status = s.status;
    this.typeflag = s.typeflag;
    this.comment.set(s.comment);
    this.pid = s.pid;
    this.exitstatus = s.exitstatus;
    this.observer = s.observer;
    return this;
  }
  $clone(): struct_servers { return new struct_servers().$cp(this); }
  static $size = 256;
  static $layout(): any[] { return [['address', 0, ['a', ['i', 1, 1], 100]], ['port', 100, ['i', 4, 1]], ['age', 104, ['i', 4, 1]], ['when', 112, ['i', 8, 1]], ['refresh', 120, ['i', 4, 1]], ['lifetime', 124, ['i', 4, 1]], ['players', 128, ['i', 4, 1]], ['status', 132, ['i', 4, 1]], ['typeflag', 136, ['i', 1, 1]], ['comment', 137, ['a', ['i', 1, 1], 100]], ['pid', 240, ['i', 4, 1]], ['exitstatus', 244, ['i', 4, 1]], ['observer', 248, ['i', 4, 1]]]; }
}

/** struct shield_cpacket: 4 bytes */
export class struct_shield_cpacket {
  type: number = 0;
  state: number = 0;
  pad1: number = 0;
  pad2: number = 0;
  static $of(...a: any[]): struct_shield_cpacket {
    const o = new struct_shield_cpacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.state = a[1];
    if (n > 2) o.pad1 = a[2];
    if (n > 3) o.pad2 = a[3];
    return o;
  }
  $cp(s: struct_shield_cpacket): this {
    this.type = s.type;
    this.state = s.state;
    this.pad1 = s.pad1;
    this.pad2 = s.pad2;
    return this;
  }
  $clone(): struct_shield_cpacket { return new struct_shield_cpacket().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['state', 1, ['i', 1, 1]], ['pad1', 2, ['i', 1, 1]], ['pad2', 3, ['i', 1, 1]]]; }
}

/** struct ship: 40 bytes */
export class struct_ship {
  s_phaserdamage: number = 0;
  s_maxspeed: number = 0;
  s_maxfuel: number = 0;
  s_maxshield: number = 0;
  s_maxdamage: number = 0;
  s_maxegntemp: number = 0;
  s_maxwpntemp: number = 0;
  s_maxarmies: number = 0;
  s_width: number = 0;
  s_height: number = 0;
  s_type: number = 0;
  s_torpspeed: number = 0;
  static $of(...a: any[]): struct_ship {
    const o = new struct_ship();
    const n = a.length;
    if (n > 0) o.s_phaserdamage = a[0];
    if (n > 1) o.s_maxspeed = a[1];
    if (n > 2) o.s_maxfuel = a[2];
    if (n > 3) o.s_maxshield = a[3];
    if (n > 4) o.s_maxdamage = a[4];
    if (n > 5) o.s_maxegntemp = a[5];
    if (n > 6) o.s_maxwpntemp = a[6];
    if (n > 7) o.s_maxarmies = a[7];
    if (n > 8) o.s_width = a[8];
    if (n > 9) o.s_height = a[9];
    if (n > 10) o.s_type = a[10];
    if (n > 11) o.s_torpspeed = a[11];
    return o;
  }
  $cp(s: struct_ship): this {
    this.s_phaserdamage = s.s_phaserdamage;
    this.s_maxspeed = s.s_maxspeed;
    this.s_maxfuel = s.s_maxfuel;
    this.s_maxshield = s.s_maxshield;
    this.s_maxdamage = s.s_maxdamage;
    this.s_maxegntemp = s.s_maxegntemp;
    this.s_maxwpntemp = s.s_maxwpntemp;
    this.s_maxarmies = s.s_maxarmies;
    this.s_width = s.s_width;
    this.s_height = s.s_height;
    this.s_type = s.s_type;
    this.s_torpspeed = s.s_torpspeed;
    return this;
  }
  $clone(): struct_ship { return new struct_ship().$cp(this); }
  static $size = 40;
  static $layout(): any[] { return [['s_phaserdamage', 0, ['i', 2, 1]], ['s_maxspeed', 4, ['i', 4, 1]], ['s_maxfuel', 8, ['i', 4, 1]], ['s_maxshield', 12, ['i', 4, 1]], ['s_maxdamage', 16, ['i', 4, 1]], ['s_maxegntemp', 20, ['i', 4, 1]], ['s_maxwpntemp', 24, ['i', 4, 1]], ['s_maxarmies', 28, ['i', 2, 1]], ['s_width', 30, ['i', 2, 1]], ['s_height', 32, ['i', 2, 1]], ['s_type', 34, ['i', 2, 1]], ['s_torpspeed', 36, ['i', 4, 1]]]; }
}

/** struct ship_cap_spacket: 60 bytes */
export class struct_ship_cap_spacket {
  type: number = 0;
  operation: number = 0;
  s_type: number = 0;
  s_torpspeed: number = 0;
  s_phaserrange: number = 0;
  s_maxspeed: number = 0;
  s_maxfuel: number = 0;
  s_maxshield: number = 0;
  s_maxdamage: number = 0;
  s_maxwpntemp: number = 0;
  s_maxegntemp: number = 0;
  s_width: number = 0;
  s_height: number = 0;
  s_maxarmies: number = 0;
  s_letter: number = 0;
  pad2: number = 0;
  s_name: Int8Array = new Int8Array(16);
  s_desig1: number = 0;
  s_desig2: number = 0;
  s_bitmap: number = 0;
  static $of(...a: any[]): struct_ship_cap_spacket {
    const o = new struct_ship_cap_spacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.operation = a[1];
    if (n > 2) o.s_type = a[2];
    if (n > 3) o.s_torpspeed = a[3];
    if (n > 4) o.s_phaserrange = a[4];
    if (n > 5) o.s_maxspeed = a[5];
    if (n > 6) o.s_maxfuel = a[6];
    if (n > 7) o.s_maxshield = a[7];
    if (n > 8) o.s_maxdamage = a[8];
    if (n > 9) o.s_maxwpntemp = a[9];
    if (n > 10) o.s_maxegntemp = a[10];
    if (n > 11) o.s_width = a[11];
    if (n > 12) o.s_height = a[12];
    if (n > 13) o.s_maxarmies = a[13];
    if (n > 14) o.s_letter = a[14];
    if (n > 15) o.pad2 = a[15];
    if (n > 16) o.s_name = a[16];
    if (n > 17) o.s_desig1 = a[17];
    if (n > 18) o.s_desig2 = a[18];
    if (n > 19) o.s_bitmap = a[19];
    return o;
  }
  $cp(s: struct_ship_cap_spacket): this {
    this.type = s.type;
    this.operation = s.operation;
    this.s_type = s.s_type;
    this.s_torpspeed = s.s_torpspeed;
    this.s_phaserrange = s.s_phaserrange;
    this.s_maxspeed = s.s_maxspeed;
    this.s_maxfuel = s.s_maxfuel;
    this.s_maxshield = s.s_maxshield;
    this.s_maxdamage = s.s_maxdamage;
    this.s_maxwpntemp = s.s_maxwpntemp;
    this.s_maxegntemp = s.s_maxegntemp;
    this.s_width = s.s_width;
    this.s_height = s.s_height;
    this.s_maxarmies = s.s_maxarmies;
    this.s_letter = s.s_letter;
    this.pad2 = s.pad2;
    this.s_name.set(s.s_name);
    this.s_desig1 = s.s_desig1;
    this.s_desig2 = s.s_desig2;
    this.s_bitmap = s.s_bitmap;
    return this;
  }
  $clone(): struct_ship_cap_spacket { return new struct_ship_cap_spacket().$cp(this); }
  static $size = 60;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['operation', 1, ['i', 1, 1]], ['s_type', 2, ['i', 2, 0]], ['s_torpspeed', 4, ['i', 2, 0]], ['s_phaserrange', 6, ['i', 2, 0]], ['s_maxspeed', 8, ['i', 4, 1]], ['s_maxfuel', 12, ['i', 4, 1]], ['s_maxshield', 16, ['i', 4, 1]], ['s_maxdamage', 20, ['i', 4, 1]], ['s_maxwpntemp', 24, ['i', 4, 1]], ['s_maxegntemp', 28, ['i', 4, 1]], ['s_width', 32, ['i', 2, 0]], ['s_height', 34, ['i', 2, 0]], ['s_maxarmies', 36, ['i', 2, 0]], ['s_letter', 38, ['i', 1, 1]], ['pad2', 39, ['i', 1, 1]], ['s_name', 40, ['a', ['i', 1, 1], 16]], ['s_desig1', 56, ['i', 1, 1]], ['s_desig2', 57, ['i', 1, 1]], ['s_bitmap', 58, ['i', 2, 0]]]; }
}

/** struct shipdef: 40 bytes */
export class struct_shipdef {
  name: any = null;
  rcfile: any = null;
  keymap: any = null;
  buttonmap: any = null;
  ckeymap: any = null;
  static $of(...a: any[]): struct_shipdef {
    const o = new struct_shipdef();
    const n = a.length;
    if (n > 0) o.name = a[0];
    if (n > 1) o.rcfile = a[1];
    if (n > 2) o.keymap = a[2];
    if (n > 3) o.buttonmap = a[3];
    if (n > 4) o.ckeymap = a[4];
    return o;
  }
  $cp(s: struct_shipdef): this {
    this.name = s.name;
    this.rcfile = s.rcfile;
    this.keymap = s.keymap;
    this.buttonmap = s.buttonmap;
    this.ckeymap = s.ckeymap;
    return this;
  }
  $clone(): struct_shipdef { return new struct_shipdef().$cp(this); }
  static $size = 40;
  static $layout(): any[] { return [['name', 0, ['p']], ['rcfile', 8, ['p']], ['keymap', 16, ['p']], ['buttonmap', 24, ['p']], ['ckeymap', 32, ['p']]]; }
}

/** struct shm_sound: 4100 bytes */
export class struct_shm_sound {
  name: Int8Array = new Int8Array(4096);
  play_sound: number = 0;
  static $of(...a: any[]): struct_shm_sound {
    const o = new struct_shm_sound();
    const n = a.length;
    if (n > 0) o.name = a[0];
    if (n > 1) o.play_sound = a[1];
    return o;
  }
  $cp(s: struct_shm_sound): this {
    this.name.set(s.name);
    this.play_sound = s.play_sound;
    return this;
  }
  $clone(): struct_shm_sound { return new struct_shm_sound().$cp(this); }
  static $size = 4100;
  static $layout(): any[] { return [['name', 0, ['a', ['i', 1, 1], 4096]], ['play_sound', 4096, ['i', 4, 1]]]; }
}

/** struct shmid_ds: 112 bytes */
export class struct_shmid_ds {
  shm_perm: struct_ipc_perm = new struct_ipc_perm();
  shm_segsz: number = 0;
  shm_atime: number = 0;
  shm_dtime: number = 0;
  shm_ctime: number = 0;
  shm_cpid: number = 0;
  shm_lpid: number = 0;
  shm_nattch: number = 0;
  __glibc_reserved5: number = 0;
  __glibc_reserved6: number = 0;
  static $of(...a: any[]): struct_shmid_ds {
    const o = new struct_shmid_ds();
    const n = a.length;
    if (n > 0) o.shm_perm = a[0];
    if (n > 1) o.shm_segsz = a[1];
    if (n > 2) o.shm_atime = a[2];
    if (n > 3) o.shm_dtime = a[3];
    if (n > 4) o.shm_ctime = a[4];
    if (n > 5) o.shm_cpid = a[5];
    if (n > 6) o.shm_lpid = a[6];
    if (n > 7) o.shm_nattch = a[7];
    if (n > 8) o.__glibc_reserved5 = a[8];
    if (n > 9) o.__glibc_reserved6 = a[9];
    return o;
  }
  $cp(s: struct_shmid_ds): this {
    this.shm_perm.$cp(s.shm_perm);
    this.shm_segsz = s.shm_segsz;
    this.shm_atime = s.shm_atime;
    this.shm_dtime = s.shm_dtime;
    this.shm_ctime = s.shm_ctime;
    this.shm_cpid = s.shm_cpid;
    this.shm_lpid = s.shm_lpid;
    this.shm_nattch = s.shm_nattch;
    this.__glibc_reserved5 = s.__glibc_reserved5;
    this.__glibc_reserved6 = s.__glibc_reserved6;
    return this;
  }
  $clone(): struct_shmid_ds { return new struct_shmid_ds().$cp(this); }
  static $size = 112;
  static $layout(): any[] { return [['shm_perm', 0, ['r', struct_ipc_perm]], ['shm_segsz', 48, ['i', 8, 0]], ['shm_atime', 56, ['i', 8, 1]], ['shm_dtime', 64, ['i', 8, 1]], ['shm_ctime', 72, ['i', 8, 1]], ['shm_cpid', 80, ['i', 4, 1]], ['shm_lpid', 84, ['i', 4, 1]], ['shm_nattch', 88, ['i', 8, 0]], ['__glibc_reserved5', 96, ['i', 8, 0]], ['__glibc_reserved6', 104, ['i', 8, 0]]]; }
}

/** struct shortreply_spacket: 8 bytes */
export class struct_shortreply_spacket {
  type: number = 0;
  repl: number = 0;
  winside: number = 0;
  gwidth: number = 0;
  static $of(...a: any[]): struct_shortreply_spacket {
    const o = new struct_shortreply_spacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.repl = a[1];
    if (n > 2) o.winside = a[2];
    if (n > 3) o.gwidth = a[3];
    return o;
  }
  $cp(s: struct_shortreply_spacket): this {
    this.type = s.type;
    this.repl = s.repl;
    this.winside = s.winside;
    this.gwidth = s.gwidth;
    return this;
  }
  $clone(): struct_shortreply_spacket { return new struct_shortreply_spacket().$cp(this); }
  static $size = 8;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['repl', 1, ['i', 1, 1]], ['winside', 2, ['i', 2, 0]], ['gwidth', 4, ['i', 4, 1]]]; }
}

/** struct shortreq_cpacket: 4 bytes */
export class struct_shortreq_cpacket {
  type: number = 0;
  req: number = 0;
  version: number = 0;
  pad2: number = 0;
  static $of(...a: any[]): struct_shortreq_cpacket {
    const o = new struct_shortreq_cpacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.req = a[1];
    if (n > 2) o.version = a[2];
    if (n > 3) o.pad2 = a[3];
    return o;
  }
  $cp(s: struct_shortreq_cpacket): this {
    this.type = s.type;
    this.req = s.req;
    this.version = s.version;
    this.pad2 = s.pad2;
    return this;
  }
  $clone(): struct_shortreq_cpacket { return new struct_shortreq_cpacket().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['req', 1, ['i', 1, 1]], ['version', 2, ['i', 1, 1]], ['pad2', 3, ['i', 1, 1]]]; }
}

/** struct slider__pingstats: 48 bytes */
export class struct_slider__pingstats {
  label: any = null;
  min: number = 0;
  max: number = 0;
  green: number = 0;
  yellow: number = 0;
  label_length: number = 0;
  diff: number = 0;
  var: any = null;
  lastVal: number = 0;
  static $of(...a: any[]): struct_slider__pingstats {
    const o = new struct_slider__pingstats();
    const n = a.length;
    if (n > 0) o.label = a[0];
    if (n > 1) o.min = a[1];
    if (n > 2) o.max = a[2];
    if (n > 3) o.green = a[3];
    if (n > 4) o.yellow = a[4];
    if (n > 5) o.label_length = a[5];
    if (n > 6) o.diff = a[6];
    if (n > 7) o.var = a[7];
    if (n > 8) o.lastVal = a[8];
    return o;
  }
  $cp(s: struct_slider__pingstats): this {
    this.label = s.label;
    this.min = s.min;
    this.max = s.max;
    this.green = s.green;
    this.yellow = s.yellow;
    this.label_length = s.label_length;
    this.diff = s.diff;
    this.var = s.var;
    this.lastVal = s.lastVal;
    return this;
  }
  $clone(): struct_slider__pingstats { return new struct_slider__pingstats().$cp(this); }
  static $size = 48;
  static $layout(): any[] { return [['label', 0, ['p']], ['min', 8, ['i', 4, 1]], ['max', 12, ['i', 4, 1]], ['green', 16, ['i', 4, 1]], ['yellow', 20, ['i', 4, 1]], ['label_length', 24, ['i', 4, 1]], ['diff', 28, ['i', 4, 1]], ['var', 32, ['p']], ['lastVal', 40, ['i', 4, 1]]]; }
}

/** struct slider__stats: 48 bytes */
export class struct_slider__stats {
  label: any = null;
  min: number = 0;
  max: number = 0;
  low_red: number = 0;
  high_red: number = 0;
  label_length: number = 0;
  diff: number = 0;
  var: any = null;
  lastVal: number = 0;
  static $of(...a: any[]): struct_slider__stats {
    const o = new struct_slider__stats();
    const n = a.length;
    if (n > 0) o.label = a[0];
    if (n > 1) o.min = a[1];
    if (n > 2) o.max = a[2];
    if (n > 3) o.low_red = a[3];
    if (n > 4) o.high_red = a[4];
    if (n > 5) o.label_length = a[5];
    if (n > 6) o.diff = a[6];
    if (n > 7) o.var = a[7];
    if (n > 8) o.lastVal = a[8];
    return o;
  }
  $cp(s: struct_slider__stats): this {
    this.label = s.label;
    this.min = s.min;
    this.max = s.max;
    this.low_red = s.low_red;
    this.high_red = s.high_red;
    this.label_length = s.label_length;
    this.diff = s.diff;
    this.var = s.var;
    this.lastVal = s.lastVal;
    return this;
  }
  $clone(): struct_slider__stats { return new struct_slider__stats().$cp(this); }
  static $size = 48;
  static $layout(): any[] { return [['label', 0, ['p']], ['min', 8, ['i', 4, 1]], ['max', 12, ['i', 4, 1]], ['low_red', 16, ['i', 4, 1]], ['high_red', 20, ['i', 4, 1]], ['label_length', 24, ['i', 4, 1]], ['diff', 28, ['i', 4, 1]], ['var', 32, ['p']], ['lastVal', 40, ['i', 4, 1]]]; }
}

/** struct sockaddr: 16 bytes */
export class struct_sockaddr {
  sa_family: number = 0;
  sa_data: Int8Array = new Int8Array(14);
  static $of(...a: any[]): struct_sockaddr {
    const o = new struct_sockaddr();
    const n = a.length;
    if (n > 0) o.sa_family = a[0];
    if (n > 1) o.sa_data = a[1];
    return o;
  }
  $cp(s: struct_sockaddr): this {
    this.sa_family = s.sa_family;
    this.sa_data.set(s.sa_data);
    return this;
  }
  $clone(): struct_sockaddr { return new struct_sockaddr().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['sa_family', 0, ['i', 2, 0]], ['sa_data', 2, ['a', ['i', 1, 1], 14]]]; }
}

/** struct sockaddr_in: 16 bytes */
export class struct_sockaddr_in {
  sin_family: number = 0;
  sin_port: number = 0;
  sin_addr: struct_in_addr = new struct_in_addr();
  sin_zero: Uint8Array = new Uint8Array(8);
  static $of(...a: any[]): struct_sockaddr_in {
    const o = new struct_sockaddr_in();
    const n = a.length;
    if (n > 0) o.sin_family = a[0];
    if (n > 1) o.sin_port = a[1];
    if (n > 2) o.sin_addr = a[2];
    if (n > 3) o.sin_zero = a[3];
    return o;
  }
  $cp(s: struct_sockaddr_in): this {
    this.sin_family = s.sin_family;
    this.sin_port = s.sin_port;
    this.sin_addr.$cp(s.sin_addr);
    this.sin_zero.set(s.sin_zero);
    return this;
  }
  $clone(): struct_sockaddr_in { return new struct_sockaddr_in().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['sin_family', 0, ['i', 2, 0]], ['sin_port', 2, ['i', 2, 0]], ['sin_addr', 4, ['r', struct_in_addr]], ['sin_zero', 8, ['a', ['i', 1, 0], 8]]]; }
}

/** struct socket_cpacket: 8 bytes */
export class struct_socket_cpacket {
  type: number = 0;
  version: number = 0;
  udp_version: number = 0;
  pad3: number = 0;
  socket: number = 0;
  static $of(...a: any[]): struct_socket_cpacket {
    const o = new struct_socket_cpacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.version = a[1];
    if (n > 2) o.udp_version = a[2];
    if (n > 3) o.pad3 = a[3];
    if (n > 4) o.socket = a[4];
    return o;
  }
  $cp(s: struct_socket_cpacket): this {
    this.type = s.type;
    this.version = s.version;
    this.udp_version = s.udp_version;
    this.pad3 = s.pad3;
    this.socket = s.socket;
    return this;
  }
  $clone(): struct_socket_cpacket { return new struct_socket_cpacket().$cp(this); }
  static $size = 8;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['version', 1, ['i', 1, 1]], ['udp_version', 2, ['i', 1, 1]], ['pad3', 3, ['i', 1, 1]], ['socket', 4, ['i', 4, 0]]]; }
}

/** struct speed_cpacket: 4 bytes */
export class struct_speed_cpacket {
  type: number = 0;
  speed: number = 0;
  pad1: number = 0;
  pad2: number = 0;
  static $of(...a: any[]): struct_speed_cpacket {
    const o = new struct_speed_cpacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.speed = a[1];
    if (n > 2) o.pad1 = a[2];
    if (n > 3) o.pad2 = a[3];
    return o;
  }
  $cp(s: struct_speed_cpacket): this {
    this.type = s.type;
    this.speed = s.speed;
    this.pad1 = s.pad1;
    this.pad2 = s.pad2;
    return this;
  }
  $clone(): struct_speed_cpacket { return new struct_speed_cpacket().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['speed', 1, ['i', 1, 1]], ['pad1', 2, ['i', 1, 1]], ['pad2', 3, ['i', 1, 1]]]; }
}

/** struct stat: 144 bytes */
export class struct_stat {
  st_dev: number = 0;
  st_ino: number = 0;
  st_nlink: number = 0;
  st_mode: number = 0;
  st_uid: number = 0;
  st_gid: number = 0;
  __pad0: number = 0;
  st_rdev: number = 0;
  st_size: number = 0;
  st_blksize: number = 0;
  st_blocks: number = 0;
  st_atim: struct_timespec = new struct_timespec();
  st_mtim: struct_timespec = new struct_timespec();
  st_ctim: struct_timespec = new struct_timespec();
  __glibc_reserved: Float64Array = new Float64Array(3);
  static $of(...a: any[]): struct_stat {
    const o = new struct_stat();
    const n = a.length;
    if (n > 0) o.st_dev = a[0];
    if (n > 1) o.st_ino = a[1];
    if (n > 2) o.st_nlink = a[2];
    if (n > 3) o.st_mode = a[3];
    if (n > 4) o.st_uid = a[4];
    if (n > 5) o.st_gid = a[5];
    if (n > 6) o.__pad0 = a[6];
    if (n > 7) o.st_rdev = a[7];
    if (n > 8) o.st_size = a[8];
    if (n > 9) o.st_blksize = a[9];
    if (n > 10) o.st_blocks = a[10];
    if (n > 11) o.st_atim = a[11];
    if (n > 12) o.st_mtim = a[12];
    if (n > 13) o.st_ctim = a[13];
    if (n > 14) o.__glibc_reserved = a[14];
    return o;
  }
  $cp(s: struct_stat): this {
    this.st_dev = s.st_dev;
    this.st_ino = s.st_ino;
    this.st_nlink = s.st_nlink;
    this.st_mode = s.st_mode;
    this.st_uid = s.st_uid;
    this.st_gid = s.st_gid;
    this.__pad0 = s.__pad0;
    this.st_rdev = s.st_rdev;
    this.st_size = s.st_size;
    this.st_blksize = s.st_blksize;
    this.st_blocks = s.st_blocks;
    this.st_atim.$cp(s.st_atim);
    this.st_mtim.$cp(s.st_mtim);
    this.st_ctim.$cp(s.st_ctim);
    this.__glibc_reserved.set(s.__glibc_reserved);
    return this;
  }
  $clone(): struct_stat { return new struct_stat().$cp(this); }
  static $size = 144;
  static $layout(): any[] { return [['st_dev', 0, ['i', 8, 0]], ['st_ino', 8, ['i', 8, 0]], ['st_nlink', 16, ['i', 8, 0]], ['st_mode', 24, ['i', 4, 0]], ['st_uid', 28, ['i', 4, 0]], ['st_gid', 32, ['i', 4, 0]], ['__pad0', 36, ['i', 4, 1]], ['st_rdev', 40, ['i', 8, 0]], ['st_size', 48, ['i', 8, 1]], ['st_blksize', 56, ['i', 8, 1]], ['st_blocks', 64, ['i', 8, 1]], ['st_atim', 72, ['r', struct_timespec]], ['st_mtim', 88, ['r', struct_timespec]], ['st_ctim', 104, ['r', struct_timespec]], ['__glibc_reserved', 120, ['a', ['i', 8, 1], 3]]]; }
}

/** struct stats: 568 bytes */
export class struct_stats {
  st_maxkills: number = 0;
  st_kills: number = 0;
  st_losses: number = 0;
  st_armsbomb: number = 0;
  st_planets: number = 0;
  st_ticks: number = 0;
  st_tkills: number = 0;
  st_tlosses: number = 0;
  st_tarmsbomb: number = 0;
  st_tplanets: number = 0;
  st_tticks: number = 0;
  st_sbkills: number = 0;
  st_sblosses: number = 0;
  st_sbticks: number = 0;
  st_sbmaxkills: number = 0;
  st_lastlogin: number = 0;
  st_flags: number = 0;
  st_keymap: Uint8Array = new Uint8Array(480);
  st_rank: number = 0;
  static $of(...a: any[]): struct_stats {
    const o = new struct_stats();
    const n = a.length;
    if (n > 0) o.st_maxkills = a[0];
    if (n > 1) o.st_kills = a[1];
    if (n > 2) o.st_losses = a[2];
    if (n > 3) o.st_armsbomb = a[3];
    if (n > 4) o.st_planets = a[4];
    if (n > 5) o.st_ticks = a[5];
    if (n > 6) o.st_tkills = a[6];
    if (n > 7) o.st_tlosses = a[7];
    if (n > 8) o.st_tarmsbomb = a[8];
    if (n > 9) o.st_tplanets = a[9];
    if (n > 10) o.st_tticks = a[10];
    if (n > 11) o.st_sbkills = a[11];
    if (n > 12) o.st_sblosses = a[12];
    if (n > 13) o.st_sbticks = a[13];
    if (n > 14) o.st_sbmaxkills = a[14];
    if (n > 15) o.st_lastlogin = a[15];
    if (n > 16) o.st_flags = a[16];
    if (n > 17) o.st_keymap = a[17];
    if (n > 18) o.st_rank = a[18];
    return o;
  }
  $cp(s: struct_stats): this {
    this.st_maxkills = s.st_maxkills;
    this.st_kills = s.st_kills;
    this.st_losses = s.st_losses;
    this.st_armsbomb = s.st_armsbomb;
    this.st_planets = s.st_planets;
    this.st_ticks = s.st_ticks;
    this.st_tkills = s.st_tkills;
    this.st_tlosses = s.st_tlosses;
    this.st_tarmsbomb = s.st_tarmsbomb;
    this.st_tplanets = s.st_tplanets;
    this.st_tticks = s.st_tticks;
    this.st_sbkills = s.st_sbkills;
    this.st_sblosses = s.st_sblosses;
    this.st_sbticks = s.st_sbticks;
    this.st_sbmaxkills = s.st_sbmaxkills;
    this.st_lastlogin = s.st_lastlogin;
    this.st_flags = s.st_flags;
    this.st_keymap.set(s.st_keymap);
    this.st_rank = s.st_rank;
    return this;
  }
  $clone(): struct_stats { return new struct_stats().$cp(this); }
  static $size = 568;
  static $layout(): any[] { return [['st_maxkills', 0, ['d', 8]], ['st_kills', 8, ['i', 4, 1]], ['st_losses', 12, ['i', 4, 1]], ['st_armsbomb', 16, ['i', 4, 1]], ['st_planets', 20, ['i', 4, 1]], ['st_ticks', 24, ['i', 4, 1]], ['st_tkills', 28, ['i', 4, 1]], ['st_tlosses', 32, ['i', 4, 1]], ['st_tarmsbomb', 36, ['i', 4, 1]], ['st_tplanets', 40, ['i', 4, 1]], ['st_tticks', 44, ['i', 4, 1]], ['st_sbkills', 48, ['i', 4, 1]], ['st_sblosses', 52, ['i', 4, 1]], ['st_sbticks', 56, ['i', 4, 1]], ['st_sbmaxkills', 64, ['d', 8]], ['st_lastlogin', 72, ['i', 4, 1]], ['st_flags', 76, ['i', 4, 1]], ['st_keymap', 80, ['a', ['i', 1, 0], 480]], ['st_rank', 560, ['i', 4, 1]]]; }
}

/** struct stats_s_spacket: 36 bytes */
export class struct_stats_s_spacket {
  type: number = 0;
  pnum: number = 0;
  tplanets: number = 0;
  tkills: number = 0;
  tlosses: number = 0;
  kills: number = 0;
  losses: number = 0;
  tticks: number = 0;
  tarmies: number = 0;
  maxkills: number = 0;
  sbkills: number = 0;
  sblosses: number = 0;
  armies: number = 0;
  planets: number = 0;
  sbmaxkills: number = 0;
  static $of(...a: any[]): struct_stats_s_spacket {
    const o = new struct_stats_s_spacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.pnum = a[1];
    if (n > 2) o.tplanets = a[2];
    if (n > 3) o.tkills = a[3];
    if (n > 4) o.tlosses = a[4];
    if (n > 5) o.kills = a[5];
    if (n > 6) o.losses = a[6];
    if (n > 7) o.tticks = a[7];
    if (n > 8) o.tarmies = a[8];
    if (n > 9) o.maxkills = a[9];
    if (n > 10) o.sbkills = a[10];
    if (n > 11) o.sblosses = a[11];
    if (n > 12) o.armies = a[12];
    if (n > 13) o.planets = a[13];
    if (n > 14) o.sbmaxkills = a[14];
    return o;
  }
  $cp(s: struct_stats_s_spacket): this {
    this.type = s.type;
    this.pnum = s.pnum;
    this.tplanets = s.tplanets;
    this.tkills = s.tkills;
    this.tlosses = s.tlosses;
    this.kills = s.kills;
    this.losses = s.losses;
    this.tticks = s.tticks;
    this.tarmies = s.tarmies;
    this.maxkills = s.maxkills;
    this.sbkills = s.sbkills;
    this.sblosses = s.sblosses;
    this.armies = s.armies;
    this.planets = s.planets;
    this.sbmaxkills = s.sbmaxkills;
    return this;
  }
  $clone(): struct_stats_s_spacket { return new struct_stats_s_spacket().$cp(this); }
  static $size = 36;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['pnum', 1, ['i', 1, 1]], ['tplanets', 2, ['i', 2, 0]], ['tkills', 4, ['i', 2, 0]], ['tlosses', 6, ['i', 2, 0]], ['kills', 8, ['i', 2, 0]], ['losses', 10, ['i', 2, 0]], ['tticks', 12, ['i', 4, 0]], ['tarmies', 16, ['i', 4, 0]], ['maxkills', 20, ['i', 4, 0]], ['sbkills', 24, ['i', 2, 0]], ['sblosses', 26, ['i', 2, 0]], ['armies', 28, ['i', 2, 0]], ['planets', 30, ['i', 2, 0]], ['sbmaxkills', 32, ['i', 4, 0]]]; }
}

/** struct stats_spacket: 56 bytes */
export class struct_stats_spacket {
  type: number = 0;
  pnum: number = 0;
  pad1: number = 0;
  pad2: number = 0;
  tkills: number = 0;
  tlosses: number = 0;
  kills: number = 0;
  losses: number = 0;
  tticks: number = 0;
  tplanets: number = 0;
  tarmies: number = 0;
  sbkills: number = 0;
  sblosses: number = 0;
  armies: number = 0;
  planets: number = 0;
  maxkills: number = 0;
  sbmaxkills: number = 0;
  static $of(...a: any[]): struct_stats_spacket {
    const o = new struct_stats_spacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.pnum = a[1];
    if (n > 2) o.pad1 = a[2];
    if (n > 3) o.pad2 = a[3];
    if (n > 4) o.tkills = a[4];
    if (n > 5) o.tlosses = a[5];
    if (n > 6) o.kills = a[6];
    if (n > 7) o.losses = a[7];
    if (n > 8) o.tticks = a[8];
    if (n > 9) o.tplanets = a[9];
    if (n > 10) o.tarmies = a[10];
    if (n > 11) o.sbkills = a[11];
    if (n > 12) o.sblosses = a[12];
    if (n > 13) o.armies = a[13];
    if (n > 14) o.planets = a[14];
    if (n > 15) o.maxkills = a[15];
    if (n > 16) o.sbmaxkills = a[16];
    return o;
  }
  $cp(s: struct_stats_spacket): this {
    this.type = s.type;
    this.pnum = s.pnum;
    this.pad1 = s.pad1;
    this.pad2 = s.pad2;
    this.tkills = s.tkills;
    this.tlosses = s.tlosses;
    this.kills = s.kills;
    this.losses = s.losses;
    this.tticks = s.tticks;
    this.tplanets = s.tplanets;
    this.tarmies = s.tarmies;
    this.sbkills = s.sbkills;
    this.sblosses = s.sblosses;
    this.armies = s.armies;
    this.planets = s.planets;
    this.maxkills = s.maxkills;
    this.sbmaxkills = s.sbmaxkills;
    return this;
  }
  $clone(): struct_stats_spacket { return new struct_stats_spacket().$cp(this); }
  static $size = 56;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['pnum', 1, ['i', 1, 1]], ['pad1', 2, ['i', 1, 1]], ['pad2', 3, ['i', 1, 1]], ['tkills', 4, ['i', 4, 1]], ['tlosses', 8, ['i', 4, 1]], ['kills', 12, ['i', 4, 1]], ['losses', 16, ['i', 4, 1]], ['tticks', 20, ['i', 4, 1]], ['tplanets', 24, ['i', 4, 1]], ['tarmies', 28, ['i', 4, 1]], ['sbkills', 32, ['i', 4, 1]], ['sblosses', 36, ['i', 4, 1]], ['armies', 40, ['i', 4, 1]], ['planets', 44, ['i', 4, 1]], ['maxkills', 48, ['i', 4, 1]], ['sbmaxkills', 52, ['i', 4, 1]]]; }
}

/** struct status: 28 bytes */
export class struct_status {
  tourn: number = 0;
  armsbomb: number = 0;
  planets: number = 0;
  kills: number = 0;
  losses: number = 0;
  time: number = 0;
  timeprod: number = 0;
  static $of(...a: any[]): struct_status {
    const o = new struct_status();
    const n = a.length;
    if (n > 0) o.tourn = a[0];
    if (n > 1) o.armsbomb = a[1];
    if (n > 2) o.planets = a[2];
    if (n > 3) o.kills = a[3];
    if (n > 4) o.losses = a[4];
    if (n > 5) o.time = a[5];
    if (n > 6) o.timeprod = a[6];
    return o;
  }
  $cp(s: struct_status): this {
    this.tourn = s.tourn;
    this.armsbomb = s.armsbomb;
    this.planets = s.planets;
    this.kills = s.kills;
    this.losses = s.losses;
    this.time = s.time;
    this.timeprod = s.timeprod;
    return this;
  }
  $clone(): struct_status { return new struct_status().$cp(this); }
  static $size = 28;
  static $layout(): any[] { return [['tourn', 0, ['i', 1, 0]], ['armsbomb', 4, ['i', 4, 0]], ['planets', 8, ['i', 4, 0]], ['kills', 12, ['i', 4, 0]], ['losses', 16, ['i', 4, 0]], ['time', 20, ['i', 4, 0]], ['timeprod', 24, ['i', 4, 0]]]; }
}

/** struct status_spacket: 28 bytes */
export class struct_status_spacket {
  type: number = 0;
  tourn: number = 0;
  pad1: number = 0;
  pad2: number = 0;
  armsbomb: number = 0;
  planets: number = 0;
  kills: number = 0;
  losses: number = 0;
  time: number = 0;
  timeprod: number = 0;
  static $of(...a: any[]): struct_status_spacket {
    const o = new struct_status_spacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.tourn = a[1];
    if (n > 2) o.pad1 = a[2];
    if (n > 3) o.pad2 = a[3];
    if (n > 4) o.armsbomb = a[4];
    if (n > 5) o.planets = a[5];
    if (n > 6) o.kills = a[6];
    if (n > 7) o.losses = a[7];
    if (n > 8) o.time = a[8];
    if (n > 9) o.timeprod = a[9];
    return o;
  }
  $cp(s: struct_status_spacket): this {
    this.type = s.type;
    this.tourn = s.tourn;
    this.pad1 = s.pad1;
    this.pad2 = s.pad2;
    this.armsbomb = s.armsbomb;
    this.planets = s.planets;
    this.kills = s.kills;
    this.losses = s.losses;
    this.time = s.time;
    this.timeprod = s.timeprod;
    return this;
  }
  $clone(): struct_status_spacket { return new struct_status_spacket().$cp(this); }
  static $size = 28;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['tourn', 1, ['i', 1, 1]], ['pad1', 2, ['i', 1, 1]], ['pad2', 3, ['i', 1, 1]], ['armsbomb', 4, ['i', 4, 0]], ['planets', 8, ['i', 4, 0]], ['kills', 12, ['i', 4, 0]], ['losses', 16, ['i', 4, 0]], ['time', 20, ['i', 4, 0]], ['timeprod', 24, ['i', 4, 0]]]; }
}

/** struct stringList: 128 bytes */
export class struct_stringList {
  string: Int8Array = new Int8Array(100);
  color: number = 0;
  font: any = null;
  next: struct_stringList | null = null;
  prev: struct_stringList | null = null;
  static $of(...a: any[]): struct_stringList {
    const o = new struct_stringList();
    const n = a.length;
    if (n > 0) o.string = a[0];
    if (n > 1) o.color = a[1];
    if (n > 2) o.font = a[2];
    if (n > 3) o.next = a[3];
    if (n > 4) o.prev = a[4];
    return o;
  }
  $cp(s: struct_stringList): this {
    this.string.set(s.string);
    this.color = s.color;
    this.font = s.font;
    this.next = s.next;
    this.prev = s.prev;
    return this;
  }
  $clone(): struct_stringList { return new struct_stringList().$cp(this); }
  static $size = 128;
  static $layout(): any[] { return [['string', 0, ['a', ['i', 1, 1], 100]], ['color', 100, ['i', 4, 1]], ['font', 104, ['p']], ['next', 112, ['p']], ['prev', 120, ['p']]]; }
}

/** struct stringlist: 24 bytes */
export class struct_stringlist {
  string: any = null;
  value: any = null;
  next: struct_stringlist | null = null;
  static $of(...a: any[]): struct_stringlist {
    const o = new struct_stringlist();
    const n = a.length;
    if (n > 0) o.string = a[0];
    if (n > 1) o.value = a[1];
    if (n > 2) o.next = a[2];
    return o;
  }
  $cp(s: struct_stringlist): this {
    this.string = s.string;
    this.value = s.value;
    this.next = s.next;
    return this;
  }
  $clone(): struct_stringlist { return new struct_stringlist().$cp(this); }
  static $size = 24;
  static $layout(): any[] { return [['string', 0, ['p']], ['value', 8, ['p']], ['next', 16, ['p']]]; }
}

/** struct threshold_cpacket: 4 bytes */
export class struct_threshold_cpacket {
  type: number = 0;
  pad1: number = 0;
  thresh: number = 0;
  static $of(...a: any[]): struct_threshold_cpacket {
    const o = new struct_threshold_cpacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.pad1 = a[1];
    if (n > 2) o.thresh = a[2];
    return o;
  }
  $cp(s: struct_threshold_cpacket): this {
    this.type = s.type;
    this.pad1 = s.pad1;
    this.thresh = s.thresh;
    return this;
  }
  $clone(): struct_threshold_cpacket { return new struct_threshold_cpacket().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['pad1', 1, ['i', 1, 1]], ['thresh', 2, ['i', 2, 0]]]; }
}

/** struct timespec: 16 bytes */
export class struct_timespec {
  tv_sec: number = 0;
  tv_nsec: number = 0;
  static $of(...a: any[]): struct_timespec {
    const o = new struct_timespec();
    const n = a.length;
    if (n > 0) o.tv_sec = a[0];
    if (n > 1) o.tv_nsec = a[1];
    return o;
  }
  $cp(s: struct_timespec): this {
    this.tv_sec = s.tv_sec;
    this.tv_nsec = s.tv_nsec;
    return this;
  }
  $clone(): struct_timespec { return new struct_timespec().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['tv_sec', 0, ['i', 8, 1]], ['tv_nsec', 8, ['i', 8, 1]]]; }
}

/** struct timeval: 16 bytes */
export class struct_timeval {
  tv_sec: number = 0;
  tv_usec: number = 0;
  static $of(...a: any[]): struct_timeval {
    const o = new struct_timeval();
    const n = a.length;
    if (n > 0) o.tv_sec = a[0];
    if (n > 1) o.tv_usec = a[1];
    return o;
  }
  $cp(s: struct_timeval): this {
    this.tv_sec = s.tv_sec;
    this.tv_usec = s.tv_usec;
    return this;
  }
  $clone(): struct_timeval { return new struct_timeval().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['tv_sec', 0, ['i', 8, 1]], ['tv_usec', 8, ['i', 8, 1]]]; }
}

/** struct torp: 20 bytes */
export class struct_torp {
  t_status: number = 0;
  t_owner: number = 0;
  t_war: number = 0;
  t_x: number = 0;
  t_y: number = 0;
  t_fuse: number = 0;
  t_updateFuse: number = 0;
  t_dir: number = 0;
  static $of(...a: any[]): struct_torp {
    const o = new struct_torp();
    const n = a.length;
    if (n > 0) o.t_status = a[0];
    if (n > 1) o.t_owner = a[1];
    if (n > 2) o.t_war = a[2];
    if (n > 3) o.t_x = a[3];
    if (n > 4) o.t_y = a[4];
    if (n > 5) o.t_fuse = a[5];
    if (n > 6) o.t_updateFuse = a[6];
    if (n > 7) o.t_dir = a[7];
    return o;
  }
  $cp(s: struct_torp): this {
    this.t_status = s.t_status;
    this.t_owner = s.t_owner;
    this.t_war = s.t_war;
    this.t_x = s.t_x;
    this.t_y = s.t_y;
    this.t_fuse = s.t_fuse;
    this.t_updateFuse = s.t_updateFuse;
    this.t_dir = s.t_dir;
    return this;
  }
  $clone(): struct_torp { return new struct_torp().$cp(this); }
  static $size = 20;
  static $layout(): any[] { return [['t_status', 0, ['i', 1, 0]], ['t_owner', 2, ['i', 2, 1]], ['t_war', 4, ['i', 1, 1]], ['t_x', 8, ['i', 4, 1]], ['t_y', 12, ['i', 4, 1]], ['t_fuse', 16, ['i', 2, 1]], ['t_updateFuse', 18, ['i', 1, 0]], ['t_dir', 19, ['i', 1, 0]]]; }
}

/** struct torp_cpacket: 4 bytes */
export class struct_torp_cpacket {
  type: number = 0;
  dir: number = 0;
  pad1: number = 0;
  pad2: number = 0;
  static $of(...a: any[]): struct_torp_cpacket {
    const o = new struct_torp_cpacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.dir = a[1];
    if (n > 2) o.pad1 = a[2];
    if (n > 3) o.pad2 = a[3];
    return o;
  }
  $cp(s: struct_torp_cpacket): this {
    this.type = s.type;
    this.dir = s.dir;
    this.pad1 = s.pad1;
    this.pad2 = s.pad2;
    return this;
  }
  $clone(): struct_torp_cpacket { return new struct_torp_cpacket().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['dir', 1, ['i', 1, 0]], ['pad1', 2, ['i', 1, 1]], ['pad2', 3, ['i', 1, 1]]]; }
}

/** struct torp_info_spacket: 8 bytes */
export class struct_torp_info_spacket {
  type: number = 0;
  war: number = 0;
  status: number = 0;
  pad1: number = 0;
  tnum: number = 0;
  pad2: number = 0;
  static $of(...a: any[]): struct_torp_info_spacket {
    const o = new struct_torp_info_spacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.war = a[1];
    if (n > 2) o.status = a[2];
    if (n > 3) o.pad1 = a[3];
    if (n > 4) o.tnum = a[4];
    if (n > 5) o.pad2 = a[5];
    return o;
  }
  $cp(s: struct_torp_info_spacket): this {
    this.type = s.type;
    this.war = s.war;
    this.status = s.status;
    this.pad1 = s.pad1;
    this.tnum = s.tnum;
    this.pad2 = s.pad2;
    return this;
  }
  $clone(): struct_torp_info_spacket { return new struct_torp_info_spacket().$cp(this); }
  static $size = 8;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['war', 1, ['i', 1, 1]], ['status', 2, ['i', 1, 1]], ['pad1', 3, ['i', 1, 1]], ['tnum', 4, ['i', 2, 0]], ['pad2', 6, ['i', 2, 0]]]; }
}

/** struct torp_spacket: 12 bytes */
export class struct_torp_spacket {
  type: number = 0;
  dir: number = 0;
  tnum: number = 0;
  x: number = 0;
  y: number = 0;
  static $of(...a: any[]): struct_torp_spacket {
    const o = new struct_torp_spacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.dir = a[1];
    if (n > 2) o.tnum = a[2];
    if (n > 3) o.x = a[3];
    if (n > 4) o.y = a[4];
    return o;
  }
  $cp(s: struct_torp_spacket): this {
    this.type = s.type;
    this.dir = s.dir;
    this.tnum = s.tnum;
    this.x = s.x;
    this.y = s.y;
    return this;
  }
  $clone(): struct_torp_spacket { return new struct_torp_spacket().$cp(this); }
  static $size = 12;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['dir', 1, ['i', 1, 0]], ['tnum', 2, ['i', 2, 0]], ['x', 4, ['i', 4, 1]], ['y', 8, ['i', 4, 1]]]; }
}

/** struct tractor_cpacket: 4 bytes */
export class struct_tractor_cpacket {
  type: number = 0;
  state: number = 0;
  pnum: number = 0;
  pad2: number = 0;
  static $of(...a: any[]): struct_tractor_cpacket {
    const o = new struct_tractor_cpacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.state = a[1];
    if (n > 2) o.pnum = a[2];
    if (n > 3) o.pad2 = a[3];
    return o;
  }
  $cp(s: struct_tractor_cpacket): this {
    this.type = s.type;
    this.state = s.state;
    this.pnum = s.pnum;
    this.pad2 = s.pad2;
    return this;
  }
  $clone(): struct_tractor_cpacket { return new struct_tractor_cpacket().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['state', 1, ['i', 1, 1]], ['pnum', 2, ['i', 1, 1]], ['pad2', 3, ['i', 1, 1]]]; }
}

/** struct udp_reply_spacket: 8 bytes */
export class struct_udp_reply_spacket {
  type: number = 0;
  reply: number = 0;
  pad1: number = 0;
  pad2: number = 0;
  port: number = 0;
  static $of(...a: any[]): struct_udp_reply_spacket {
    const o = new struct_udp_reply_spacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.reply = a[1];
    if (n > 2) o.pad1 = a[2];
    if (n > 3) o.pad2 = a[3];
    if (n > 4) o.port = a[4];
    return o;
  }
  $cp(s: struct_udp_reply_spacket): this {
    this.type = s.type;
    this.reply = s.reply;
    this.pad1 = s.pad1;
    this.pad2 = s.pad2;
    this.port = s.port;
    return this;
  }
  $clone(): struct_udp_reply_spacket { return new struct_udp_reply_spacket().$cp(this); }
  static $size = 8;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['reply', 1, ['i', 1, 1]], ['pad1', 2, ['i', 1, 1]], ['pad2', 3, ['i', 1, 1]], ['port', 4, ['i', 4, 1]]]; }
}

/** struct udp_req_cpacket: 8 bytes */
export class struct_udp_req_cpacket {
  type: number = 0;
  request: number = 0;
  connmode: number = 0;
  pad2: number = 0;
  port: number = 0;
  static $of(...a: any[]): struct_udp_req_cpacket {
    const o = new struct_udp_req_cpacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.request = a[1];
    if (n > 2) o.connmode = a[2];
    if (n > 3) o.pad2 = a[3];
    if (n > 4) o.port = a[4];
    return o;
  }
  $cp(s: struct_udp_req_cpacket): this {
    this.type = s.type;
    this.request = s.request;
    this.connmode = s.connmode;
    this.pad2 = s.pad2;
    this.port = s.port;
    return this;
  }
  $clone(): struct_udp_req_cpacket { return new struct_udp_req_cpacket().$cp(this); }
  static $size = 8;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['request', 1, ['i', 1, 1]], ['connmode', 2, ['i', 1, 1]], ['pad2', 3, ['i', 1, 1]], ['port', 4, ['i', 4, 1]]]; }
}

/** struct updates_cpacket: 8 bytes */
export class struct_updates_cpacket {
  type: number = 0;
  pad1: number = 0;
  pad2: number = 0;
  pad3: number = 0;
  usecs: number = 0;
  static $of(...a: any[]): struct_updates_cpacket {
    const o = new struct_updates_cpacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.pad1 = a[1];
    if (n > 2) o.pad2 = a[2];
    if (n > 3) o.pad3 = a[3];
    if (n > 4) o.usecs = a[4];
    return o;
  }
  $cp(s: struct_updates_cpacket): this {
    this.type = s.type;
    this.pad1 = s.pad1;
    this.pad2 = s.pad2;
    this.pad3 = s.pad3;
    this.usecs = s.usecs;
    return this;
  }
  $clone(): struct_updates_cpacket { return new struct_updates_cpacket().$cp(this); }
  static $size = 8;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['pad1', 1, ['i', 1, 1]], ['pad2', 2, ['i', 1, 1]], ['pad3', 3, ['i', 1, 1]], ['usecs', 4, ['i', 4, 0]]]; }
}

/** struct war_cpacket: 4 bytes */
export class struct_war_cpacket {
  type: number = 0;
  newmask: number = 0;
  pad1: number = 0;
  pad2: number = 0;
  static $of(...a: any[]): struct_war_cpacket {
    const o = new struct_war_cpacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.newmask = a[1];
    if (n > 2) o.pad1 = a[2];
    if (n > 3) o.pad2 = a[3];
    return o;
  }
  $cp(s: struct_war_cpacket): this {
    this.type = s.type;
    this.newmask = s.newmask;
    this.pad1 = s.pad1;
    this.pad2 = s.pad2;
    return this;
  }
  $clone(): struct_war_cpacket { return new struct_war_cpacket().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['newmask', 1, ['i', 1, 1]], ['pad1', 2, ['i', 1, 1]], ['pad2', 3, ['i', 1, 1]]]; }
}

/** struct warning_s_spacket: 4 bytes */
export class struct_warning_s_spacket {
  type: number = 0;
  whichmessage: number = 0;
  argument: number = 0;
  argument2: number = 0;
  static $of(...a: any[]): struct_warning_s_spacket {
    const o = new struct_warning_s_spacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.whichmessage = a[1];
    if (n > 2) o.argument = a[2];
    if (n > 3) o.argument2 = a[3];
    return o;
  }
  $cp(s: struct_warning_s_spacket): this {
    this.type = s.type;
    this.whichmessage = s.whichmessage;
    this.argument = s.argument;
    this.argument2 = s.argument2;
    return this;
  }
  $clone(): struct_warning_s_spacket { return new struct_warning_s_spacket().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['whichmessage', 1, ['i', 1, 0]], ['argument', 2, ['i', 1, 1]], ['argument2', 3, ['i', 1, 1]]]; }
}

/** struct warning_spacket: 84 bytes */
export class struct_warning_spacket {
  type: number = 0;
  pad1: number = 0;
  pad2: number = 0;
  pad3: number = 0;
  mesg: Int8Array = new Int8Array(80);
  static $of(...a: any[]): struct_warning_spacket {
    const o = new struct_warning_spacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.pad1 = a[1];
    if (n > 2) o.pad2 = a[2];
    if (n > 3) o.pad3 = a[3];
    if (n > 4) o.mesg = a[4];
    return o;
  }
  $cp(s: struct_warning_spacket): this {
    this.type = s.type;
    this.pad1 = s.pad1;
    this.pad2 = s.pad2;
    this.pad3 = s.pad3;
    this.mesg.set(s.mesg);
    return this;
  }
  $clone(): struct_warning_spacket { return new struct_warning_spacket().$cp(this); }
  static $size = 84;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['pad1', 1, ['i', 1, 1]], ['pad2', 2, ['i', 1, 1]], ['pad3', 3, ['i', 1, 1]], ['mesg', 4, ['a', ['i', 1, 1], 80]]]; }
}

/** struct window: 128 bytes */
export class struct_window {
  window: number = 0;
  drawable: number = 0;
  buffer: number = 0;
  isbuffered: number = 0;
  background: number = 0;
  type: number = 0;
  data: any = null;
  mapped: number = 0;
  width: number = 0;
  height: number = 0;
  name: any = null;
  handle_keydown: any = null;
  handle_keyup: any = null;
  handle_button: any = null;
  handle_expose: any = null;
  insensitive: number = 0;
  cursor: number = 0;
  static $of(...a: any[]): struct_window {
    const o = new struct_window();
    const n = a.length;
    if (n > 0) o.window = a[0];
    if (n > 1) o.drawable = a[1];
    if (n > 2) o.buffer = a[2];
    if (n > 3) o.isbuffered = a[3];
    if (n > 4) o.background = a[4];
    if (n > 5) o.type = a[5];
    if (n > 6) o.data = a[6];
    if (n > 7) o.mapped = a[7];
    if (n > 8) o.width = a[8];
    if (n > 9) o.height = a[9];
    if (n > 10) o.name = a[10];
    if (n > 11) o.handle_keydown = a[11];
    if (n > 12) o.handle_keyup = a[12];
    if (n > 13) o.handle_button = a[13];
    if (n > 14) o.handle_expose = a[14];
    if (n > 15) o.insensitive = a[15];
    if (n > 16) o.cursor = a[16];
    return o;
  }
  $cp(s: struct_window): this {
    this.window = s.window;
    this.drawable = s.drawable;
    this.buffer = s.buffer;
    this.isbuffered = s.isbuffered;
    this.background = s.background;
    this.type = s.type;
    this.data = s.data;
    this.mapped = s.mapped;
    this.width = s.width;
    this.height = s.height;
    this.name = s.name;
    this.handle_keydown = s.handle_keydown;
    this.handle_keyup = s.handle_keyup;
    this.handle_button = s.handle_button;
    this.handle_expose = s.handle_expose;
    this.insensitive = s.insensitive;
    this.cursor = s.cursor;
    return this;
  }
  $clone(): struct_window { return new struct_window().$cp(this); }
  static $size = 128;
  static $layout(): any[] { return [['window', 0, ['i', 8, 0]], ['drawable', 8, ['i', 8, 0]], ['buffer', 16, ['i', 8, 0]], ['isbuffered', 24, ['i', 4, 1]], ['background', 32, ['i', 8, 0]], ['type', 40, ['i', 4, 1]], ['data', 48, ['p']], ['mapped', 56, ['i', 4, 1]], ['width', 60, ['i', 4, 1]], ['height', 64, ['i', 4, 1]], ['name', 72, ['p']], ['handle_keydown', 80, ['p']], ['handle_keyup', 88, ['p']], ['handle_button', 96, ['p']], ['handle_expose', 104, ['p']], ['insensitive', 112, ['i', 4, 1]], ['cursor', 120, ['i', 8, 0]]]; }
}

/** struct windowlist: 16 bytes */
export class struct_windowlist {
  window: struct_window | null = null;
  next: struct_windowlist | null = null;
  static $of(...a: any[]): struct_windowlist {
    const o = new struct_windowlist();
    const n = a.length;
    if (n > 0) o.window = a[0];
    if (n > 1) o.next = a[1];
    return o;
  }
  $cp(s: struct_windowlist): this {
    this.window = s.window;
    this.next = s.next;
    return this;
  }
  $clone(): struct_windowlist { return new struct_windowlist().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['window', 0, ['p']], ['next', 8, ['p']]]; }
}

/** struct you_spacket: 32 bytes */
export class struct_you_spacket {
  type: number = 0;
  pnum: number = 0;
  hostile: number = 0;
  swar: number = 0;
  armies: number = 0;
  tractor: number = 0;
  pad2: number = 0;
  pad3: number = 0;
  flags: number = 0;
  damage: number = 0;
  shield: number = 0;
  fuel: number = 0;
  etemp: number = 0;
  wtemp: number = 0;
  whydead: number = 0;
  whodead: number = 0;
  static $of(...a: any[]): struct_you_spacket {
    const o = new struct_you_spacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.pnum = a[1];
    if (n > 2) o.hostile = a[2];
    if (n > 3) o.swar = a[3];
    if (n > 4) o.armies = a[4];
    if (n > 5) o.tractor = a[5];
    if (n > 6) o.pad2 = a[6];
    if (n > 7) o.pad3 = a[7];
    if (n > 8) o.flags = a[8];
    if (n > 9) o.damage = a[9];
    if (n > 10) o.shield = a[10];
    if (n > 11) o.fuel = a[11];
    if (n > 12) o.etemp = a[12];
    if (n > 13) o.wtemp = a[13];
    if (n > 14) o.whydead = a[14];
    if (n > 15) o.whodead = a[15];
    return o;
  }
  $cp(s: struct_you_spacket): this {
    this.type = s.type;
    this.pnum = s.pnum;
    this.hostile = s.hostile;
    this.swar = s.swar;
    this.armies = s.armies;
    this.tractor = s.tractor;
    this.pad2 = s.pad2;
    this.pad3 = s.pad3;
    this.flags = s.flags;
    this.damage = s.damage;
    this.shield = s.shield;
    this.fuel = s.fuel;
    this.etemp = s.etemp;
    this.wtemp = s.wtemp;
    this.whydead = s.whydead;
    this.whodead = s.whodead;
    return this;
  }
  $clone(): struct_you_spacket { return new struct_you_spacket().$cp(this); }
  static $size = 32;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['pnum', 1, ['i', 1, 1]], ['hostile', 2, ['i', 1, 1]], ['swar', 3, ['i', 1, 1]], ['armies', 4, ['i', 1, 1]], ['tractor', 5, ['i', 1, 1]], ['pad2', 6, ['i', 1, 1]], ['pad3', 7, ['i', 1, 1]], ['flags', 8, ['i', 4, 0]], ['damage', 12, ['i', 4, 1]], ['shield', 16, ['i', 4, 1]], ['fuel', 20, ['i', 4, 1]], ['etemp', 24, ['i', 2, 0]], ['wtemp', 26, ['i', 2, 0]], ['whydead', 28, ['i', 2, 0]], ['whodead', 30, ['i', 2, 0]]]; }
}

/** struct youshort_spacket: 12 bytes */
export class struct_youshort_spacket {
  type: number = 0;
  pnum: number = 0;
  hostile: number = 0;
  swar: number = 0;
  armies: number = 0;
  whydead: number = 0;
  whodead: number = 0;
  pad1: number = 0;
  flags: number = 0;
  static $of(...a: any[]): struct_youshort_spacket {
    const o = new struct_youshort_spacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.pnum = a[1];
    if (n > 2) o.hostile = a[2];
    if (n > 3) o.swar = a[3];
    if (n > 4) o.armies = a[4];
    if (n > 5) o.whydead = a[5];
    if (n > 6) o.whodead = a[6];
    if (n > 7) o.pad1 = a[7];
    if (n > 8) o.flags = a[8];
    return o;
  }
  $cp(s: struct_youshort_spacket): this {
    this.type = s.type;
    this.pnum = s.pnum;
    this.hostile = s.hostile;
    this.swar = s.swar;
    this.armies = s.armies;
    this.whydead = s.whydead;
    this.whodead = s.whodead;
    this.pad1 = s.pad1;
    this.flags = s.flags;
    return this;
  }
  $clone(): struct_youshort_spacket { return new struct_youshort_spacket().$cp(this); }
  static $size = 12;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['pnum', 1, ['i', 1, 1]], ['hostile', 2, ['i', 1, 1]], ['swar', 3, ['i', 1, 1]], ['armies', 4, ['i', 1, 1]], ['whydead', 5, ['i', 1, 1]], ['whodead', 6, ['i', 1, 1]], ['pad1', 7, ['i', 1, 1]], ['flags', 8, ['i', 4, 0]]]; }
}

/** struct youss_spacket: 12 bytes */
export class struct_youss_spacket {
  type: number = 0;
  pad1: number = 0;
  damage: number = 0;
  shield: number = 0;
  fuel: number = 0;
  etemp: number = 0;
  wtemp: number = 0;
  static $of(...a: any[]): struct_youss_spacket {
    const o = new struct_youss_spacket();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.pad1 = a[1];
    if (n > 2) o.damage = a[2];
    if (n > 3) o.shield = a[3];
    if (n > 4) o.fuel = a[4];
    if (n > 5) o.etemp = a[5];
    if (n > 6) o.wtemp = a[6];
    return o;
  }
  $cp(s: struct_youss_spacket): this {
    this.type = s.type;
    this.pad1 = s.pad1;
    this.damage = s.damage;
    this.shield = s.shield;
    this.fuel = s.fuel;
    this.etemp = s.etemp;
    this.wtemp = s.wtemp;
    return this;
  }
  $clone(): struct_youss_spacket { return new struct_youss_spacket().$cp(this); }
  static $size = 12;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['pad1', 1, ['i', 1, 1]], ['damage', 2, ['i', 2, 0]], ['shield', 4, ['i', 2, 0]], ['fuel', 6, ['i', 2, 0]], ['etemp', 8, ['i', 2, 0]], ['wtemp', 10, ['i', 2, 0]]]; }
}

/** union _XEvent: 192 bytes */
export class union__XEvent {
  $m: any;
  $o: number;
  constructor(m: any = null, o = 0) { this.$m = m || $mem(192); this.$o = o; }
  get type(): number { return $uget(this, 0, ['i', 4, 1]); }
  set type(v: number) { $uset(this, 0, ['i', 4, 1], v); }
  get xany(): struct_XAnyEvent { return $uget(this, 0, ['r', struct_XAnyEvent]); }
  set xany(v: struct_XAnyEvent) { $uset(this, 0, ['r', struct_XAnyEvent], v); }
  get xkey(): struct_XKeyEvent { return $uget(this, 0, ['r', struct_XKeyEvent]); }
  set xkey(v: struct_XKeyEvent) { $uset(this, 0, ['r', struct_XKeyEvent], v); }
  get xbutton(): struct_XButtonEvent { return $uget(this, 0, ['r', struct_XButtonEvent]); }
  set xbutton(v: struct_XButtonEvent) { $uset(this, 0, ['r', struct_XButtonEvent], v); }
  get xmotion(): struct_XMotionEvent { return $uget(this, 0, ['r', struct_XMotionEvent]); }
  set xmotion(v: struct_XMotionEvent) { $uset(this, 0, ['r', struct_XMotionEvent], v); }
  get xcrossing(): struct_XCrossingEvent { return $uget(this, 0, ['r', struct_XCrossingEvent]); }
  set xcrossing(v: struct_XCrossingEvent) { $uset(this, 0, ['r', struct_XCrossingEvent], v); }
  get xfocus(): struct_XFocusChangeEvent { return $uget(this, 0, ['r', struct_XFocusChangeEvent]); }
  set xfocus(v: struct_XFocusChangeEvent) { $uset(this, 0, ['r', struct_XFocusChangeEvent], v); }
  get xexpose(): struct_XExposeEvent { return $uget(this, 0, ['r', struct_XExposeEvent]); }
  set xexpose(v: struct_XExposeEvent) { $uset(this, 0, ['r', struct_XExposeEvent], v); }
  get xgraphicsexpose(): struct_XGraphicsExposeEvent { return $uget(this, 0, ['r', struct_XGraphicsExposeEvent]); }
  set xgraphicsexpose(v: struct_XGraphicsExposeEvent) { $uset(this, 0, ['r', struct_XGraphicsExposeEvent], v); }
  get xnoexpose(): struct_XNoExposeEvent { return $uget(this, 0, ['r', struct_XNoExposeEvent]); }
  set xnoexpose(v: struct_XNoExposeEvent) { $uset(this, 0, ['r', struct_XNoExposeEvent], v); }
  get xvisibility(): struct_XVisibilityEvent { return $uget(this, 0, ['r', struct_XVisibilityEvent]); }
  set xvisibility(v: struct_XVisibilityEvent) { $uset(this, 0, ['r', struct_XVisibilityEvent], v); }
  get xcreatewindow(): struct_XCreateWindowEvent { return $uget(this, 0, ['r', struct_XCreateWindowEvent]); }
  set xcreatewindow(v: struct_XCreateWindowEvent) { $uset(this, 0, ['r', struct_XCreateWindowEvent], v); }
  get xdestroywindow(): struct_XDestroyWindowEvent { return $uget(this, 0, ['r', struct_XDestroyWindowEvent]); }
  set xdestroywindow(v: struct_XDestroyWindowEvent) { $uset(this, 0, ['r', struct_XDestroyWindowEvent], v); }
  get xunmap(): struct_XUnmapEvent { return $uget(this, 0, ['r', struct_XUnmapEvent]); }
  set xunmap(v: struct_XUnmapEvent) { $uset(this, 0, ['r', struct_XUnmapEvent], v); }
  get xmap(): struct_XMapEvent { return $uget(this, 0, ['r', struct_XMapEvent]); }
  set xmap(v: struct_XMapEvent) { $uset(this, 0, ['r', struct_XMapEvent], v); }
  get xmaprequest(): struct_XMapRequestEvent { return $uget(this, 0, ['r', struct_XMapRequestEvent]); }
  set xmaprequest(v: struct_XMapRequestEvent) { $uset(this, 0, ['r', struct_XMapRequestEvent], v); }
  get xreparent(): struct_XReparentEvent { return $uget(this, 0, ['r', struct_XReparentEvent]); }
  set xreparent(v: struct_XReparentEvent) { $uset(this, 0, ['r', struct_XReparentEvent], v); }
  get xconfigure(): struct_XConfigureEvent { return $uget(this, 0, ['r', struct_XConfigureEvent]); }
  set xconfigure(v: struct_XConfigureEvent) { $uset(this, 0, ['r', struct_XConfigureEvent], v); }
  get xgravity(): struct_XGravityEvent { return $uget(this, 0, ['r', struct_XGravityEvent]); }
  set xgravity(v: struct_XGravityEvent) { $uset(this, 0, ['r', struct_XGravityEvent], v); }
  get xresizerequest(): struct_XResizeRequestEvent { return $uget(this, 0, ['r', struct_XResizeRequestEvent]); }
  set xresizerequest(v: struct_XResizeRequestEvent) { $uset(this, 0, ['r', struct_XResizeRequestEvent], v); }
  get xconfigurerequest(): struct_XConfigureRequestEvent { return $uget(this, 0, ['r', struct_XConfigureRequestEvent]); }
  set xconfigurerequest(v: struct_XConfigureRequestEvent) { $uset(this, 0, ['r', struct_XConfigureRequestEvent], v); }
  get xcirculate(): struct_XCirculateEvent { return $uget(this, 0, ['r', struct_XCirculateEvent]); }
  set xcirculate(v: struct_XCirculateEvent) { $uset(this, 0, ['r', struct_XCirculateEvent], v); }
  get xcirculaterequest(): struct_XCirculateRequestEvent { return $uget(this, 0, ['r', struct_XCirculateRequestEvent]); }
  set xcirculaterequest(v: struct_XCirculateRequestEvent) { $uset(this, 0, ['r', struct_XCirculateRequestEvent], v); }
  get xproperty(): struct_XPropertyEvent { return $uget(this, 0, ['r', struct_XPropertyEvent]); }
  set xproperty(v: struct_XPropertyEvent) { $uset(this, 0, ['r', struct_XPropertyEvent], v); }
  get xselectionclear(): struct_XSelectionClearEvent { return $uget(this, 0, ['r', struct_XSelectionClearEvent]); }
  set xselectionclear(v: struct_XSelectionClearEvent) { $uset(this, 0, ['r', struct_XSelectionClearEvent], v); }
  get xselectionrequest(): struct_XSelectionRequestEvent { return $uget(this, 0, ['r', struct_XSelectionRequestEvent]); }
  set xselectionrequest(v: struct_XSelectionRequestEvent) { $uset(this, 0, ['r', struct_XSelectionRequestEvent], v); }
  get xselection(): struct_XSelectionEvent { return $uget(this, 0, ['r', struct_XSelectionEvent]); }
  set xselection(v: struct_XSelectionEvent) { $uset(this, 0, ['r', struct_XSelectionEvent], v); }
  get xcolormap(): struct_XColormapEvent { return $uget(this, 0, ['r', struct_XColormapEvent]); }
  set xcolormap(v: struct_XColormapEvent) { $uset(this, 0, ['r', struct_XColormapEvent], v); }
  get xclient(): struct_XClientMessageEvent { return $uget(this, 0, ['r', struct_XClientMessageEvent]); }
  set xclient(v: struct_XClientMessageEvent) { $uset(this, 0, ['r', struct_XClientMessageEvent], v); }
  get xmapping(): struct_XMappingEvent { return $uget(this, 0, ['r', struct_XMappingEvent]); }
  set xmapping(v: struct_XMappingEvent) { $uset(this, 0, ['r', struct_XMappingEvent], v); }
  get xerror(): struct_XErrorEvent { return $uget(this, 0, ['r', struct_XErrorEvent]); }
  set xerror(v: struct_XErrorEvent) { $uset(this, 0, ['r', struct_XErrorEvent], v); }
  get xkeymap(): struct_XKeymapEvent { return $uget(this, 0, ['r', struct_XKeymapEvent]); }
  set xkeymap(v: struct_XKeymapEvent) { $uset(this, 0, ['r', struct_XKeymapEvent], v); }
  get xgeneric(): struct_XGenericEvent { return $uget(this, 0, ['r', struct_XGenericEvent]); }
  set xgeneric(v: struct_XGenericEvent) { $uset(this, 0, ['r', struct_XGenericEvent], v); }
  get xcookie(): struct_XGenericEventCookie { return $uget(this, 0, ['r', struct_XGenericEventCookie]); }
  set xcookie(v: struct_XGenericEventCookie) { $uset(this, 0, ['r', struct_XGenericEventCookie], v); }
  get pad(): Float64Array { return $uget(this, 0, ['a', ['i', 8, 1], 24]); }
  set pad(v: Float64Array) { $uset(this, 0, ['a', ['i', 8, 1], 24], v); }
  static $of_type(v: any): union__XEvent { const o = new union__XEvent(); o.type = v; return o; }
  static $of_xany(v: any): union__XEvent { const o = new union__XEvent(); o.xany = v; return o; }
  static $of_xkey(v: any): union__XEvent { const o = new union__XEvent(); o.xkey = v; return o; }
  static $of_xbutton(v: any): union__XEvent { const o = new union__XEvent(); o.xbutton = v; return o; }
  static $of_xmotion(v: any): union__XEvent { const o = new union__XEvent(); o.xmotion = v; return o; }
  static $of_xcrossing(v: any): union__XEvent { const o = new union__XEvent(); o.xcrossing = v; return o; }
  static $of_xfocus(v: any): union__XEvent { const o = new union__XEvent(); o.xfocus = v; return o; }
  static $of_xexpose(v: any): union__XEvent { const o = new union__XEvent(); o.xexpose = v; return o; }
  static $of_xgraphicsexpose(v: any): union__XEvent { const o = new union__XEvent(); o.xgraphicsexpose = v; return o; }
  static $of_xnoexpose(v: any): union__XEvent { const o = new union__XEvent(); o.xnoexpose = v; return o; }
  static $of_xvisibility(v: any): union__XEvent { const o = new union__XEvent(); o.xvisibility = v; return o; }
  static $of_xcreatewindow(v: any): union__XEvent { const o = new union__XEvent(); o.xcreatewindow = v; return o; }
  static $of_xdestroywindow(v: any): union__XEvent { const o = new union__XEvent(); o.xdestroywindow = v; return o; }
  static $of_xunmap(v: any): union__XEvent { const o = new union__XEvent(); o.xunmap = v; return o; }
  static $of_xmap(v: any): union__XEvent { const o = new union__XEvent(); o.xmap = v; return o; }
  static $of_xmaprequest(v: any): union__XEvent { const o = new union__XEvent(); o.xmaprequest = v; return o; }
  static $of_xreparent(v: any): union__XEvent { const o = new union__XEvent(); o.xreparent = v; return o; }
  static $of_xconfigure(v: any): union__XEvent { const o = new union__XEvent(); o.xconfigure = v; return o; }
  static $of_xgravity(v: any): union__XEvent { const o = new union__XEvent(); o.xgravity = v; return o; }
  static $of_xresizerequest(v: any): union__XEvent { const o = new union__XEvent(); o.xresizerequest = v; return o; }
  static $of_xconfigurerequest(v: any): union__XEvent { const o = new union__XEvent(); o.xconfigurerequest = v; return o; }
  static $of_xcirculate(v: any): union__XEvent { const o = new union__XEvent(); o.xcirculate = v; return o; }
  static $of_xcirculaterequest(v: any): union__XEvent { const o = new union__XEvent(); o.xcirculaterequest = v; return o; }
  static $of_xproperty(v: any): union__XEvent { const o = new union__XEvent(); o.xproperty = v; return o; }
  static $of_xselectionclear(v: any): union__XEvent { const o = new union__XEvent(); o.xselectionclear = v; return o; }
  static $of_xselectionrequest(v: any): union__XEvent { const o = new union__XEvent(); o.xselectionrequest = v; return o; }
  static $of_xselection(v: any): union__XEvent { const o = new union__XEvent(); o.xselection = v; return o; }
  static $of_xcolormap(v: any): union__XEvent { const o = new union__XEvent(); o.xcolormap = v; return o; }
  static $of_xclient(v: any): union__XEvent { const o = new union__XEvent(); o.xclient = v; return o; }
  static $of_xmapping(v: any): union__XEvent { const o = new union__XEvent(); o.xmapping = v; return o; }
  static $of_xerror(v: any): union__XEvent { const o = new union__XEvent(); o.xerror = v; return o; }
  static $of_xkeymap(v: any): union__XEvent { const o = new union__XEvent(); o.xkeymap = v; return o; }
  static $of_xgeneric(v: any): union__XEvent { const o = new union__XEvent(); o.xgeneric = v; return o; }
  static $of_xcookie(v: any): union__XEvent { const o = new union__XEvent(); o.xcookie = v; return o; }
  static $of_pad(v: any): union__XEvent { const o = new union__XEvent(); o.pad = v; return o; }
  $cp(s: union__XEvent): this { $mcopy(this, s, 192); return this; }
  $clone(): union__XEvent { return new union__XEvent().$cp(this); }
  static $size = 192;
  static $union = true;
  static $layout(): any[] { return [['type', 0, ['i', 4, 1]], ['xany', 0, ['r', struct_XAnyEvent]], ['xkey', 0, ['r', struct_XKeyEvent]], ['xbutton', 0, ['r', struct_XButtonEvent]], ['xmotion', 0, ['r', struct_XMotionEvent]], ['xcrossing', 0, ['r', struct_XCrossingEvent]], ['xfocus', 0, ['r', struct_XFocusChangeEvent]], ['xexpose', 0, ['r', struct_XExposeEvent]], ['xgraphicsexpose', 0, ['r', struct_XGraphicsExposeEvent]], ['xnoexpose', 0, ['r', struct_XNoExposeEvent]], ['xvisibility', 0, ['r', struct_XVisibilityEvent]], ['xcreatewindow', 0, ['r', struct_XCreateWindowEvent]], ['xdestroywindow', 0, ['r', struct_XDestroyWindowEvent]], ['xunmap', 0, ['r', struct_XUnmapEvent]], ['xmap', 0, ['r', struct_XMapEvent]], ['xmaprequest', 0, ['r', struct_XMapRequestEvent]], ['xreparent', 0, ['r', struct_XReparentEvent]], ['xconfigure', 0, ['r', struct_XConfigureEvent]], ['xgravity', 0, ['r', struct_XGravityEvent]], ['xresizerequest', 0, ['r', struct_XResizeRequestEvent]], ['xconfigurerequest', 0, ['r', struct_XConfigureRequestEvent]], ['xcirculate', 0, ['r', struct_XCirculateEvent]], ['xcirculaterequest', 0, ['r', struct_XCirculateRequestEvent]], ['xproperty', 0, ['r', struct_XPropertyEvent]], ['xselectionclear', 0, ['r', struct_XSelectionClearEvent]], ['xselectionrequest', 0, ['r', struct_XSelectionRequestEvent]], ['xselection', 0, ['r', struct_XSelectionEvent]], ['xcolormap', 0, ['r', struct_XColormapEvent]], ['xclient', 0, ['r', struct_XClientMessageEvent]], ['xmapping', 0, ['r', struct_XMappingEvent]], ['xerror', 0, ['r', struct_XErrorEvent]], ['xkeymap', 0, ['r', struct_XKeymapEvent]], ['xgeneric', 0, ['r', struct_XGenericEvent]], ['xcookie', 0, ['r', struct_XGenericEventCookie]], ['pad', 0, ['a', ['i', 8, 1], 24]]]; }
}
