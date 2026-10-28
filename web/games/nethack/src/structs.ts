// @ts-nocheck
// The structs and unions of NetHack 3.6.7, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { $sarr, $arr, $cparr, $cpvals, $umember, $udecode, $uclone } from './rt/index.ts';

/** struct (anonymous): 16 bytes */
export class anon_attrib_c_701 {
  role: number = 0;
  abil: struct_innate | null = null;
  static $of(...a: any[]): anon_attrib_c_701 {
    const o = new anon_attrib_c_701();
    const n = a.length;
    if (n > 0) o.role = a[0];
    if (n > 1) o.abil = a[1];
    return o;
  }
  $cp(s: anon_attrib_c_701): this {
    this.role = s.role;
    this.abil = s.abil;
    return this;
  }
  $clone(): anon_attrib_c_701 { return new anon_attrib_c_701().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['role', 0, ['i', 2, 1]], ['abil', 8, ['p']]]; }
}

/** struct (anonymous): 24 bytes */
export class anon_cmd_c_3733 {
  nhkf: number = 0;
  desc: any = null;
  numpad: number = 0;
  static $of(...a: any[]): anon_cmd_c_3733 {
    const o = new anon_cmd_c_3733();
    const n = a.length;
    if (n > 0) o.nhkf = a[0];
    if (n > 1) o.desc = a[1];
    if (n > 2) o.numpad = a[2];
    return o;
  }
  $cp(s: anon_cmd_c_3733): this {
    this.nhkf = s.nhkf;
    this.desc = s.desc;
    this.numpad = s.numpad;
    return this;
  }
  $clone(): anon_cmd_c_3733 { return new anon_cmd_c_3733().$cp(this); }
  static $size = 24;
  static $layout(): any[] { return [['nhkf', 0, ['i', 4, 1]], ['desc', 8, ['p']], ['numpad', 16, ['i', 1, 1]]]; }
}

/** struct (anonymous): 16 bytes */
export class anon_cmd_c_4285 {
  nhkf: number = 0;
  key: number = 0;
  name: any = null;
  static $of(...a: any[]): anon_cmd_c_4285 {
    const o = new anon_cmd_c_4285();
    const n = a.length;
    if (n > 0) o.nhkf = a[0];
    if (n > 1) o.key = a[1];
    if (n > 2) o.name = a[2];
    return o;
  }
  $cp(s: anon_cmd_c_4285): this {
    this.nhkf = s.nhkf;
    this.key = s.key;
    this.name = s.name;
    return this;
  }
  $clone(): anon_cmd_c_4285 { return new anon_cmd_c_4285().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['nhkf', 0, ['i', 4, 1]], ['key', 4, ['i', 1, 1]], ['name', 8, ['p']]]; }
}

/** union (anonymous): 8 bytes */
export class anon_decl_h_412 {
  $v: any = 0;
  $raw: Uint8Array | null = null;
  get str(): any { return this.$raw ? $udecode(this, ['p']) : this.$v; }
  set str(v: any) { this.$v = v; this.$raw = null; }
  get l(): number { return this.$raw ? $udecode(this, ['i', 8, 1]) : this.$v; }
  set l(v: number) { this.$v = v; this.$raw = null; }
  static $of_str(v: any): anon_decl_h_412 { const o = new anon_decl_h_412(); o.str = v; return o; }
  static $of_l(v: any): anon_decl_h_412 { const o = new anon_decl_h_412(); o.l = v; return o; }
  $cp(s: anon_decl_h_412): this { this.$v = $uclone(s.$v); this.$raw = s.$raw; return this; }
  $clone(): anon_decl_h_412 { return new anon_decl_h_412().$cp(this); }
  static $size = 8;
  static $layout(): any[] { return [['str', ['p']], ['l', ['i', 8, 1]]]; }
}

/** struct (anonymous): 16 bytes */
export class anon_detect_c_1084 {
  what: any = null;
  where: struct_d_level | null = null;
  static $of(...a: any[]): anon_detect_c_1084 {
    const o = new anon_detect_c_1084();
    const n = a.length;
    if (n > 0) o.what = a[0];
    if (n > 1) o.where = a[1];
    return o;
  }
  $cp(s: anon_detect_c_1084): this {
    this.what = s.what;
    this.where = s.where;
    return this;
  }
  $clone(): anon_detect_c_1084 { return new anon_detect_c_1084().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['what', 0, ['p']], ['where', 8, ['p']]]; }
}

/** struct (anonymous): 8 bytes */
export class anon_do_name_c_635 {
  nhkf: number = 0;
  ret: number = 0;
  static $of(...a: any[]): anon_do_name_c_635 {
    const o = new anon_do_name_c_635();
    const n = a.length;
    if (n > 0) o.nhkf = a[0];
    if (n > 1) o.ret = a[1];
    return o;
  }
  $cp(s: anon_do_name_c_635): this {
    this.nhkf = s.nhkf;
    this.ret = s.ret;
    return this;
  }
  $clone(): anon_do_name_c_635 { return new anon_do_name_c_635().$cp(this); }
  static $size = 8;
  static $layout(): any[] { return [['nhkf', 0, ['i', 4, 1]], ['ret', 4, ['i', 4, 1]]]; }
}

/** struct (anonymous): 16 bytes */
export class anon_eat_c_128 {
  txt: any = null;
  nut: number = 0;
  fodder: number = 0;
  greasy: number = 0;
  static $of(...a: any[]): anon_eat_c_128 {
    const o = new anon_eat_c_128();
    const n = a.length;
    if (n > 0) o.txt = a[0];
    if (n > 1) o.nut = a[1];
    if (n > 2) o.fodder = a[2];
    if (n > 3) o.greasy = a[3];
    return o;
  }
  $cp(s: anon_eat_c_128): this {
    this.txt = s.txt;
    this.nut = s.nut;
    this.fodder = s.fodder;
    this.greasy = s.greasy;
    return this;
  }
  $clone(): anon_eat_c_128 { return new anon_eat_c_128().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['txt', 0, ['p']], ['nut', 8, ['i', 4, 1]], ['fodder', 12, ['b', 0, 1, 0]], ['greasy', 12, ['b', 1, 1, 0]]]; }
}

/** struct (anonymous): 24 bytes */
export class anon_end_c_532 {
  why: number = 0;
  unmulti: number = 0;
  exclude: any = null;
  include: any = null;
  static $of(...a: any[]): anon_end_c_532 {
    const o = new anon_end_c_532();
    const n = a.length;
    if (n > 0) o.why = a[0];
    if (n > 1) o.unmulti = a[1];
    if (n > 2) o.exclude = a[2];
    if (n > 3) o.include = a[3];
    return o;
  }
  $cp(s: anon_end_c_532): this {
    this.why = s.why;
    this.unmulti = s.unmulti;
    this.exclude = s.exclude;
    this.include = s.include;
    return this;
  }
  $clone(): anon_end_c_532 { return new anon_end_c_532().$cp(this); }
  static $size = 24;
  static $layout(): any[] { return [['why', 0, ['i', 4, 1]], ['unmulti', 4, ['i', 4, 1]], ['exclude', 8, ['p']], ['include', 16, ['p']]]; }
}

/** struct (anonymous): 16 bytes */
export class anon_engrave_c_28 {
  wipefrom: number = 0;
  wipeto: any = null;
  static $of(...a: any[]): anon_engrave_c_28 {
    const o = new anon_engrave_c_28();
    const n = a.length;
    if (n > 0) o.wipefrom = a[0];
    if (n > 1) o.wipeto = a[1];
    return o;
  }
  $cp(s: anon_engrave_c_28): this {
    this.wipefrom = s.wipefrom;
    this.wipeto = s.wipeto;
    return this;
  }
  $clone(): anon_engrave_c_28 { return new anon_engrave_c_28().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['wipefrom', 0, ['i', 1, 1]], ['wipeto', 8, ['p']]]; }
}

/** struct (anonymous): 332 bytes */
export class anon_makemon_c_1514 {
  choice_count: number = 0;
  mchoices: Int8Array = new Int8Array(327);
  static $of(...a: any[]): anon_makemon_c_1514 {
    const o = new anon_makemon_c_1514();
    const n = a.length;
    if (n > 0) o.choice_count = a[0];
    if (n > 1) o.mchoices = a[1];
    return o;
  }
  $cp(s: anon_makemon_c_1514): this {
    this.choice_count = s.choice_count;
    this.mchoices.set(s.mchoices);
    return this;
  }
  $clone(): anon_makemon_c_1514 { return new anon_makemon_c_1514().$cp(this); }
  static $size = 332;
  static $layout(): any[] { return [['choice_count', 0, ['i', 4, 1]], ['mchoices', 4, ['a', ['i', 1, 1], 327]]]; }
}

/** struct (anonymous): 8 bytes */
export class anon_mkroom_c_762 {
  pm: number = 0;
  prob: number = 0;
  static $of(...a: any[]): anon_mkroom_c_762 {
    const o = new anon_mkroom_c_762();
    const n = a.length;
    if (n > 0) o.pm = a[0];
    if (n > 1) o.prob = a[1];
    return o;
  }
  $cp(s: anon_mkroom_c_762): this {
    this.pm = s.pm;
    this.prob = s.prob;
    return this;
  }
  $clone(): anon_mkroom_c_762 { return new anon_mkroom_c_762().$cp(this); }
  static $size = 8;
  static $layout(): any[] { return [['pm', 0, ['i', 4, 0]], ['prob', 4, ['i', 4, 0]]]; }
}

/** struct (anonymous): 16 bytes */
export class anon_options_c_1349 {
  name: any = null;
  color: number = 0;
  static $of(...a: any[]): anon_options_c_1349 {
    const o = new anon_options_c_1349();
    const n = a.length;
    if (n > 0) o.name = a[0];
    if (n > 1) o.color = a[1];
    return o;
  }
  $cp(s: anon_options_c_1349): this {
    this.name = s.name;
    this.color = s.color;
    return this;
  }
  $clone(): anon_options_c_1349 { return new anon_options_c_1349().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['name', 0, ['p']], ['color', 8, ['i', 4, 1]]]; }
}

/** struct (anonymous): 16 bytes */
export class anon_options_c_1382 {
  name: any = null;
  attr: number = 0;
  static $of(...a: any[]): anon_options_c_1382 {
    const o = new anon_options_c_1382();
    const n = a.length;
    if (n > 0) o.name = a[0];
    if (n > 1) o.attr = a[1];
    return o;
  }
  $cp(s: anon_options_c_1382): this {
    this.name = s.name;
    this.attr = s.attr;
    return this;
  }
  $clone(): anon_options_c_1382 { return new anon_options_c_1382().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['name', 0, ['p']], ['attr', 8, ['i', 4, 1]]]; }
}

/** struct (anonymous): 24 bytes */
export class anon_options_c_1589 {
  name: any = null;
  msgtyp: number = 0;
  descr: any = null;
  static $of(...a: any[]): anon_options_c_1589 {
    const o = new anon_options_c_1589();
    const n = a.length;
    if (n > 0) o.name = a[0];
    if (n > 1) o.msgtyp = a[1];
    if (n > 2) o.descr = a[2];
    return o;
  }
  $cp(s: anon_options_c_1589): this {
    this.name = s.name;
    this.msgtyp = s.msgtyp;
    this.descr = s.descr;
    return this;
  }
  $clone(): anon_options_c_1589 { return new anon_options_c_1589().$cp(this); }
  static $size = 24;
  static $layout(): any[] { return [['name', 0, ['p']], ['msgtyp', 8, ['i', 1, 1]], ['descr', 16, ['p']]]; }
}

/** struct (anonymous): 16 bytes */
export class anon_pager_c_2018 {
  f: any = null;
  text: any = null;
  static $of(...a: any[]): anon_pager_c_2018 {
    const o = new anon_pager_c_2018();
    const n = a.length;
    if (n > 0) o.f = a[0];
    if (n > 1) o.text = a[1];
    return o;
  }
  $cp(s: anon_pager_c_2018): this {
    this.f = s.f;
    this.text = s.text;
    return this;
  }
  $clone(): anon_pager_c_2018 { return new anon_pager_c_2018().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['f', 0, ['p']], ['text', 8, ['p']]]; }
}

/** struct (anonymous): 8 bytes */
export class anon_restore_c_66 {
  gid: number = 0;
  nid: number = 0;
  static $of(...a: any[]): anon_restore_c_66 {
    const o = new anon_restore_c_66();
    const n = a.length;
    if (n > 0) o.gid = a[0];
    if (n > 1) o.nid = a[1];
    return o;
  }
  $cp(s: anon_restore_c_66): this {
    this.gid = s.gid;
    this.nid = s.nid;
    return this;
  }
  $clone(): anon_restore_c_66 { return new anon_restore_c_66().$cp(this); }
  static $size = 8;
  static $layout(): any[] { return [['gid', 0, ['i', 4, 0]], ['nid', 4, ['i', 4, 0]]]; }
}

/** struct (anonymous): 16 bytes */
export class anon_role_c_769 {
  roles: Int8Array = new Int8Array(14);
  mask: number = 0;
  static $of(...a: any[]): anon_role_c_769 {
    const o = new anon_role_c_769();
    const n = a.length;
    if (n > 0) o.roles = a[0];
    if (n > 1) o.mask = a[1];
    return o;
  }
  $cp(s: anon_role_c_769): this {
    this.roles.set(s.roles);
    this.mask = s.mask;
    return this;
  }
  $clone(): anon_role_c_769 { return new anon_role_c_769().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['roles', 0, ['a', ['i', 1, 1], 14]], ['mask', 14, ['i', 2, 1]]]; }
}

/** union (anonymous): 8 bytes */
export class anon_sigaction_h_31 {
  $v: any = 0;
  $raw: Uint8Array | null = null;
  get sa_handler(): any { return this.$raw ? $udecode(this, ['p']) : this.$v; }
  set sa_handler(v: any) { this.$v = v; this.$raw = null; }
  get sa_sigaction(): any { return this.$raw ? $udecode(this, ['p']) : this.$v; }
  set sa_sigaction(v: any) { this.$v = v; this.$raw = null; }
  static $of_sa_handler(v: any): anon_sigaction_h_31 { const o = new anon_sigaction_h_31(); o.sa_handler = v; return o; }
  static $of_sa_sigaction(v: any): anon_sigaction_h_31 { const o = new anon_sigaction_h_31(); o.sa_sigaction = v; return o; }
  $cp(s: anon_sigaction_h_31): this { this.$v = $uclone(s.$v); this.$raw = s.$raw; return this; }
  $clone(): anon_sigaction_h_31 { return new anon_sigaction_h_31().$cp(this); }
  static $size = 8;
  static $layout(): any[] { return [['sa_handler', ['p']], ['sa_sigaction', ['p']]]; }
}

/** union (anonymous): 8 bytes */
export class anon_sp_lev_h_267 {
  $v: any = 0;
  $raw: Uint8Array | null = null;
  get value(): struct_opvar | null { return this.$raw ? $udecode(this, ['p']) : this.$v; }
  set value(v: struct_opvar | null) { this.$v = v; this.$raw = null; }
  get arrayvalues(): any { return this.$raw ? $udecode(this, ['p']) : this.$v; }
  set arrayvalues(v: any) { this.$v = v; this.$raw = null; }
  static $of_value(v: any): anon_sp_lev_h_267 { const o = new anon_sp_lev_h_267(); o.value = v; return o; }
  static $of_arrayvalues(v: any): anon_sp_lev_h_267 { const o = new anon_sp_lev_h_267(); o.arrayvalues = v; return o; }
  $cp(s: anon_sp_lev_h_267): this { this.$v = $uclone(s.$v); this.$raw = s.$raw; return this; }
  $clone(): anon_sp_lev_h_267 { return new anon_sp_lev_h_267().$cp(this); }
  static $size = 8;
  static $layout(): any[] { return [['value', ['p']], ['arrayvalues', ['p']]]; }
}

/** struct (anonymous): 4 bytes */
export class anon_sp_lev_h_405 {
  x1: number = 0;
  y1: number = 0;
  x2: number = 0;
  y2: number = 0;
  static $of(...a: any[]): anon_sp_lev_h_405 {
    const o = new anon_sp_lev_h_405();
    const n = a.length;
    if (n > 0) o.x1 = a[0];
    if (n > 1) o.y1 = a[1];
    if (n > 2) o.x2 = a[2];
    if (n > 3) o.y2 = a[3];
    return o;
  }
  $cp(s: anon_sp_lev_h_405): this {
    this.x1 = s.x1;
    this.y1 = s.y1;
    this.x2 = s.x2;
    this.y2 = s.y2;
    return this;
  }
  $clone(): anon_sp_lev_h_405 { return new anon_sp_lev_h_405().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['x1', 0, ['i', 1, 1]], ['y1', 1, ['i', 1, 1]], ['x2', 2, ['i', 1, 1]], ['y2', 3, ['i', 1, 1]]]; }
}

/** struct (anonymous): 4 bytes */
export class anon_sp_lev_h_408 {
  x1: number = 0;
  y1: number = 0;
  x2: number = 0;
  y2: number = 0;
  static $of(...a: any[]): anon_sp_lev_h_408 {
    const o = new anon_sp_lev_h_408();
    const n = a.length;
    if (n > 0) o.x1 = a[0];
    if (n > 1) o.y1 = a[1];
    if (n > 2) o.x2 = a[2];
    if (n > 3) o.y2 = a[3];
    return o;
  }
  $cp(s: anon_sp_lev_h_408): this {
    this.x1 = s.x1;
    this.y1 = s.y1;
    this.x2 = s.x2;
    this.y2 = s.y2;
    return this;
  }
  $clone(): anon_sp_lev_h_408 { return new anon_sp_lev_h_408().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['x1', 0, ['i', 1, 1]], ['y1', 1, ['i', 1, 1]], ['x2', 2, ['i', 1, 1]], ['y2', 3, ['i', 1, 1]]]; }
}

/** struct (anonymous): 3 bytes */
export class anon_sp_lev_h_417 {
  room: number = 0;
  wall: number = 0;
  door: number = 0;
  static $of(...a: any[]): anon_sp_lev_h_417 {
    const o = new anon_sp_lev_h_417();
    const n = a.length;
    if (n > 0) o.room = a[0];
    if (n > 1) o.wall = a[1];
    if (n > 2) o.door = a[2];
    return o;
  }
  $cp(s: anon_sp_lev_h_417): this {
    this.room = s.room;
    this.wall = s.wall;
    this.door = s.door;
    return this;
  }
  $clone(): anon_sp_lev_h_417 { return new anon_sp_lev_h_417().$cp(this); }
  static $size = 3;
  static $layout(): any[] { return [['room', 0, ['i', 1, 1]], ['wall', 1, ['i', 1, 1]], ['door', 2, ['i', 1, 1]]]; }
}

/** struct (anonymous): 12 bytes */
export class anon_termcap_c_870 {
  ti_color: number = 0;
  nh_color: number = 0;
  nh_bright_color: number = 0;
  static $of(...a: any[]): anon_termcap_c_870 {
    const o = new anon_termcap_c_870();
    const n = a.length;
    if (n > 0) o.ti_color = a[0];
    if (n > 1) o.nh_color = a[1];
    if (n > 2) o.nh_bright_color = a[2];
    return o;
  }
  $cp(s: anon_termcap_c_870): this {
    this.ti_color = s.ti_color;
    this.nh_color = s.nh_color;
    this.nh_bright_color = s.nh_bright_color;
    return this;
  }
  $clone(): anon_termcap_c_870 { return new anon_termcap_c_870().$cp(this); }
  static $size = 12;
  static $layout(): any[] { return [['ti_color', 0, ['i', 4, 1]], ['nh_color', 4, ['i', 4, 1]], ['nh_bright_color', 8, ['i', 4, 1]]]; }
}

/** struct (anonymous): 16 bytes */
export class anon_trap_c_1709 {
  obj: struct_obj | null = null;
  x: number = 0;
  y: number = 0;
  static $of(...a: any[]): anon_trap_c_1709 {
    const o = new anon_trap_c_1709();
    const n = a.length;
    if (n > 0) o.obj = a[0];
    if (n > 1) o.x = a[1];
    if (n > 2) o.y = a[2];
    return o;
  }
  $cp(s: anon_trap_c_1709): this {
    this.obj = s.obj;
    this.x = s.x;
    this.y = s.y;
    return this;
  }
  $clone(): anon_trap_c_1709 { return new anon_trap_c_1709().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['obj', 0, ['p']], ['x', 8, ['i', 1, 1]], ['y', 9, ['i', 1, 1]]]; }
}

/** struct Align: 32 bytes */
export class struct_Align {
  noun: any = null;
  adj: any = null;
  filecode: any = null;
  allow: number = 0;
  value: number = 0;
  static $of(...a: any[]): struct_Align {
    const o = new struct_Align();
    const n = a.length;
    if (n > 0) o.noun = a[0];
    if (n > 1) o.adj = a[1];
    if (n > 2) o.filecode = a[2];
    if (n > 3) o.allow = a[3];
    if (n > 4) o.value = a[4];
    return o;
  }
  $cp(s: struct_Align): this {
    this.noun = s.noun;
    this.adj = s.adj;
    this.filecode = s.filecode;
    this.allow = s.allow;
    this.value = s.value;
    return this;
  }
  $clone(): struct_Align { return new struct_Align().$cp(this); }
  static $size = 32;
  static $layout(): any[] { return [['noun', 0, ['p']], ['adj', 8, ['p']], ['filecode', 16, ['p']], ['allow', 24, ['i', 2, 1]], ['value', 26, ['i', 1, 1]]]; }
}

/** struct Bool_Opt: 24 bytes */
export class struct_Bool_Opt {
  name: any = null;
  addr: any = null;
  initvalue: number = 0;
  optflags: number = 0;
  static $of(...a: any[]): struct_Bool_Opt {
    const o = new struct_Bool_Opt();
    const n = a.length;
    if (n > 0) o.name = a[0];
    if (n > 1) o.addr = a[1];
    if (n > 2) o.initvalue = a[2];
    if (n > 3) o.optflags = a[3];
    return o;
  }
  $cp(s: struct_Bool_Opt): this {
    this.name = s.name;
    this.addr = s.addr;
    this.initvalue = s.initvalue;
    this.optflags = s.optflags;
    return this;
  }
  $clone(): struct_Bool_Opt { return new struct_Bool_Opt().$cp(this); }
  static $size = 24;
  static $layout(): any[] { return [['name', 0, ['p']], ['addr', 8, ['p']], ['initvalue', 16, ['i', 1, 1]], ['optflags', 20, ['i', 4, 1]]]; }
}

/** struct Comp_Opt: 24 bytes */
export class struct_Comp_Opt {
  name: any = null;
  descr: any = null;
  size: number = 0;
  optflags: number = 0;
  static $of(...a: any[]): struct_Comp_Opt {
    const o = new struct_Comp_Opt();
    const n = a.length;
    if (n > 0) o.name = a[0];
    if (n > 1) o.descr = a[1];
    if (n > 2) o.size = a[2];
    if (n > 3) o.optflags = a[3];
    return o;
  }
  $cp(s: struct_Comp_Opt): this {
    this.name = s.name;
    this.descr = s.descr;
    this.size = s.size;
    this.optflags = s.optflags;
    return this;
  }
  $clone(): struct_Comp_Opt { return new struct_Comp_Opt().$cp(this); }
  static $size = 24;
  static $layout(): any[] { return [['name', 0, ['p']], ['descr', 8, ['p']], ['size', 16, ['i', 4, 1]], ['optflags', 20, ['i', 4, 1]]]; }
}

/** struct DisplayDesc: 44 bytes */
export class struct_DisplayDesc {
  rows: number = 0;
  cols: number = 0;
  curx: number = 0;
  cury: number = 0;
  color: number = 0;
  attrs: number = 0;
  toplin: number = 0;
  rawprint: number = 0;
  inmore: number = 0;
  inread: number = 0;
  intr: number = 0;
  lastwin: number = 0;
  dismiss_more: number = 0;
  static $of(...a: any[]): struct_DisplayDesc {
    const o = new struct_DisplayDesc();
    const n = a.length;
    if (n > 0) o.rows = a[0];
    if (n > 1) o.cols = a[1];
    if (n > 2) o.curx = a[2];
    if (n > 3) o.cury = a[3];
    if (n > 4) o.color = a[4];
    if (n > 5) o.attrs = a[5];
    if (n > 6) o.toplin = a[6];
    if (n > 7) o.rawprint = a[7];
    if (n > 8) o.inmore = a[8];
    if (n > 9) o.inread = a[9];
    if (n > 10) o.intr = a[10];
    if (n > 11) o.lastwin = a[11];
    if (n > 12) o.dismiss_more = a[12];
    return o;
  }
  $cp(s: struct_DisplayDesc): this {
    this.rows = s.rows;
    this.cols = s.cols;
    this.curx = s.curx;
    this.cury = s.cury;
    this.color = s.color;
    this.attrs = s.attrs;
    this.toplin = s.toplin;
    this.rawprint = s.rawprint;
    this.inmore = s.inmore;
    this.inread = s.inread;
    this.intr = s.intr;
    this.lastwin = s.lastwin;
    this.dismiss_more = s.dismiss_more;
    return this;
  }
  $clone(): struct_DisplayDesc { return new struct_DisplayDesc().$cp(this); }
  static $size = 44;
  static $layout(): any[] { return [['rows', 0, ['i', 2, 1]], ['cols', 2, ['i', 2, 1]], ['curx', 4, ['i', 2, 1]], ['cury', 6, ['i', 2, 1]], ['color', 8, ['i', 4, 1]], ['attrs', 12, ['i', 4, 1]], ['toplin', 16, ['i', 4, 1]], ['rawprint', 20, ['i', 4, 1]], ['inmore', 24, ['i', 4, 1]], ['inread', 28, ['i', 4, 1]], ['intr', 32, ['i', 4, 1]], ['lastwin', 36, ['i', 4, 1]], ['dismiss_more', 40, ['i', 1, 1]]]; }
}

/** struct Gender: 48 bytes */
export class struct_Gender {
  adj: any = null;
  he: any = null;
  him: any = null;
  his: any = null;
  filecode: any = null;
  allow: number = 0;
  static $of(...a: any[]): struct_Gender {
    const o = new struct_Gender();
    const n = a.length;
    if (n > 0) o.adj = a[0];
    if (n > 1) o.he = a[1];
    if (n > 2) o.him = a[2];
    if (n > 3) o.his = a[3];
    if (n > 4) o.filecode = a[4];
    if (n > 5) o.allow = a[5];
    return o;
  }
  $cp(s: struct_Gender): this {
    this.adj = s.adj;
    this.he = s.he;
    this.him = s.him;
    this.his = s.his;
    this.filecode = s.filecode;
    this.allow = s.allow;
    return this;
  }
  $clone(): struct_Gender { return new struct_Gender().$cp(this); }
  static $size = 48;
  static $layout(): any[] { return [['adj', 0, ['p']], ['he', 8, ['p']], ['him', 16, ['p']], ['his', 24, ['p']], ['filecode', 32, ['p']], ['allow', 40, ['i', 2, 1]]]; }
}

/** struct Jitem: 16 bytes */
export class struct_Jitem {
  item: number = 0;
  name: any = null;
  static $of(...a: any[]): struct_Jitem {
    const o = new struct_Jitem();
    const n = a.length;
    if (n > 0) o.item = a[0];
    if (n > 1) o.name = a[1];
    return o;
  }
  $cp(s: struct_Jitem): this {
    this.item = s.item;
    this.name = s.name;
    return this;
  }
  $clone(): struct_Jitem { return new struct_Jitem().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['item', 0, ['i', 4, 1]], ['name', 8, ['p']]]; }
}

/** struct NhRegion: 96 bytes */
export class struct_NhRegion {
  bounding_box: struct_nhrect = new struct_nhrect();
  rects: struct_nhrect | null = null;
  nrects: number = 0;
  attach_2_u: number = 0;
  attach_2_m: number = 0;
  enter_msg: any = null;
  leave_msg: any = null;
  ttl: number = 0;
  expire_f: number = 0;
  can_enter_f: number = 0;
  enter_f: number = 0;
  can_leave_f: number = 0;
  leave_f: number = 0;
  inside_f: number = 0;
  player_flags: number = 0;
  monsters: any = null;
  n_monst: number = 0;
  max_monst: number = 0;
  visible: number = 0;
  glyph: number = 0;
  arg: union_any = new union_any();
  static $of(...a: any[]): struct_NhRegion {
    const o = new struct_NhRegion();
    const n = a.length;
    if (n > 0) o.bounding_box = a[0];
    if (n > 1) o.rects = a[1];
    if (n > 2) o.nrects = a[2];
    if (n > 3) o.attach_2_u = a[3];
    if (n > 4) o.attach_2_m = a[4];
    if (n > 5) o.enter_msg = a[5];
    if (n > 6) o.leave_msg = a[6];
    if (n > 7) o.ttl = a[7];
    if (n > 8) o.expire_f = a[8];
    if (n > 9) o.can_enter_f = a[9];
    if (n > 10) o.enter_f = a[10];
    if (n > 11) o.can_leave_f = a[11];
    if (n > 12) o.leave_f = a[12];
    if (n > 13) o.inside_f = a[13];
    if (n > 14) o.player_flags = a[14];
    if (n > 15) o.monsters = a[15];
    if (n > 16) o.n_monst = a[16];
    if (n > 17) o.max_monst = a[17];
    if (n > 18) o.visible = a[18];
    if (n > 19) o.glyph = a[19];
    if (n > 20) o.arg = a[20];
    return o;
  }
  $cp(s: struct_NhRegion): this {
    this.bounding_box.$cp(s.bounding_box);
    this.rects = s.rects;
    this.nrects = s.nrects;
    this.attach_2_u = s.attach_2_u;
    this.attach_2_m = s.attach_2_m;
    this.enter_msg = s.enter_msg;
    this.leave_msg = s.leave_msg;
    this.ttl = s.ttl;
    this.expire_f = s.expire_f;
    this.can_enter_f = s.can_enter_f;
    this.enter_f = s.enter_f;
    this.can_leave_f = s.can_leave_f;
    this.leave_f = s.leave_f;
    this.inside_f = s.inside_f;
    this.player_flags = s.player_flags;
    this.monsters = s.monsters;
    this.n_monst = s.n_monst;
    this.max_monst = s.max_monst;
    this.visible = s.visible;
    this.glyph = s.glyph;
    this.arg.$cp(s.arg);
    return this;
  }
  $clone(): struct_NhRegion { return new struct_NhRegion().$cp(this); }
  static $size = 96;
  static $layout(): any[] { return [['bounding_box', 0, ['r', struct_nhrect]], ['rects', 8, ['p']], ['nrects', 16, ['i', 2, 1]], ['attach_2_u', 18, ['i', 1, 1]], ['attach_2_m', 20, ['i', 4, 0]], ['enter_msg', 24, ['p']], ['leave_msg', 32, ['p']], ['ttl', 40, ['i', 8, 1]], ['expire_f', 48, ['i', 2, 1]], ['can_enter_f', 50, ['i', 2, 1]], ['enter_f', 52, ['i', 2, 1]], ['can_leave_f', 54, ['i', 2, 1]], ['leave_f', 56, ['i', 2, 1]], ['inside_f', 58, ['i', 2, 1]], ['player_flags', 60, ['i', 4, 0]], ['monsters', 64, ['p']], ['n_monst', 72, ['i', 2, 1]], ['max_monst', 74, ['i', 2, 1]], ['visible', 76, ['i', 1, 1]], ['glyph', 80, ['i', 4, 1]], ['arg', 88, ['r', union_any]]]; }
}

/** struct Race: 88 bytes */
export class struct_Race {
  noun: any = null;
  adj: any = null;
  coll: any = null;
  filecode: any = null;
  individual: struct_RoleName = new struct_RoleName();
  malenum: number = 0;
  femalenum: number = 0;
  mummynum: number = 0;
  zombienum: number = 0;
  allow: number = 0;
  selfmask: number = 0;
  lovemask: number = 0;
  hatemask: number = 0;
  attrmin: Int8Array = new Int8Array(6);
  attrmax: Int8Array = new Int8Array(6);
  hpadv: struct_RoleAdvance = new struct_RoleAdvance();
  enadv: struct_RoleAdvance = new struct_RoleAdvance();
  static $of(...a: any[]): struct_Race {
    const o = new struct_Race();
    const n = a.length;
    if (n > 0) o.noun = a[0];
    if (n > 1) o.adj = a[1];
    if (n > 2) o.coll = a[2];
    if (n > 3) o.filecode = a[3];
    if (n > 4) o.individual = a[4];
    if (n > 5) o.malenum = a[5];
    if (n > 6) o.femalenum = a[6];
    if (n > 7) o.mummynum = a[7];
    if (n > 8) o.zombienum = a[8];
    if (n > 9) o.allow = a[9];
    if (n > 10) o.selfmask = a[10];
    if (n > 11) o.lovemask = a[11];
    if (n > 12) o.hatemask = a[12];
    if (n > 13) o.attrmin = a[13];
    if (n > 14) o.attrmax = a[14];
    if (n > 15) o.hpadv = a[15];
    if (n > 16) o.enadv = a[16];
    return o;
  }
  $cp(s: struct_Race): this {
    this.noun = s.noun;
    this.adj = s.adj;
    this.coll = s.coll;
    this.filecode = s.filecode;
    this.individual.$cp(s.individual);
    this.malenum = s.malenum;
    this.femalenum = s.femalenum;
    this.mummynum = s.mummynum;
    this.zombienum = s.zombienum;
    this.allow = s.allow;
    this.selfmask = s.selfmask;
    this.lovemask = s.lovemask;
    this.hatemask = s.hatemask;
    this.attrmin.set(s.attrmin);
    this.attrmax.set(s.attrmax);
    this.hpadv.$cp(s.hpadv);
    this.enadv.$cp(s.enadv);
    return this;
  }
  $clone(): struct_Race { return new struct_Race().$cp(this); }
  static $size = 88;
  static $layout(): any[] { return [['noun', 0, ['p']], ['adj', 8, ['p']], ['coll', 16, ['p']], ['filecode', 24, ['p']], ['individual', 32, ['r', struct_RoleName]], ['malenum', 48, ['i', 2, 1]], ['femalenum', 50, ['i', 2, 1]], ['mummynum', 52, ['i', 2, 1]], ['zombienum', 54, ['i', 2, 1]], ['allow', 56, ['i', 2, 1]], ['selfmask', 58, ['i', 2, 1]], ['lovemask', 60, ['i', 2, 1]], ['hatemask', 62, ['i', 2, 1]], ['attrmin', 64, ['a', ['i', 1, 1], 6]], ['attrmax', 70, ['a', ['i', 1, 1], 6]], ['hpadv', 76, ['r', struct_RoleAdvance]], ['enadv', 82, ['r', struct_RoleAdvance]]]; }
}

/** struct Role: 288 bytes */
export class struct_Role {
  name: struct_RoleName = new struct_RoleName();
  rank: any[] = $sarr(struct_RoleName, 9);
  lgod: any = null;
  ngod: any = null;
  cgod: any = null;
  filecode: any = null;
  homebase: any = null;
  intermed: any = null;
  malenum: number = 0;
  femalenum: number = 0;
  petnum: number = 0;
  ldrnum: number = 0;
  guardnum: number = 0;
  neminum: number = 0;
  enemy1num: number = 0;
  enemy2num: number = 0;
  enemy1sym: number = 0;
  enemy2sym: number = 0;
  questarti: number = 0;
  allow: number = 0;
  attrbase: Int8Array = new Int8Array(6);
  attrdist: Int8Array = new Int8Array(6);
  hpadv: struct_RoleAdvance = new struct_RoleAdvance();
  enadv: struct_RoleAdvance = new struct_RoleAdvance();
  xlev: number = 0;
  initrecord: number = 0;
  spelbase: number = 0;
  spelheal: number = 0;
  spelshld: number = 0;
  spelarmr: number = 0;
  spelstat: number = 0;
  spelspec: number = 0;
  spelsbon: number = 0;
  static $of(...a: any[]): struct_Role {
    const o = new struct_Role();
    const n = a.length;
    if (n > 0) o.name = a[0];
    if (n > 1) o.rank = a[1];
    if (n > 2) o.lgod = a[2];
    if (n > 3) o.ngod = a[3];
    if (n > 4) o.cgod = a[4];
    if (n > 5) o.filecode = a[5];
    if (n > 6) o.homebase = a[6];
    if (n > 7) o.intermed = a[7];
    if (n > 8) o.malenum = a[8];
    if (n > 9) o.femalenum = a[9];
    if (n > 10) o.petnum = a[10];
    if (n > 11) o.ldrnum = a[11];
    if (n > 12) o.guardnum = a[12];
    if (n > 13) o.neminum = a[13];
    if (n > 14) o.enemy1num = a[14];
    if (n > 15) o.enemy2num = a[15];
    if (n > 16) o.enemy1sym = a[16];
    if (n > 17) o.enemy2sym = a[17];
    if (n > 18) o.questarti = a[18];
    if (n > 19) o.allow = a[19];
    if (n > 20) o.attrbase = a[20];
    if (n > 21) o.attrdist = a[21];
    if (n > 22) o.hpadv = a[22];
    if (n > 23) o.enadv = a[23];
    if (n > 24) o.xlev = a[24];
    if (n > 25) o.initrecord = a[25];
    if (n > 26) o.spelbase = a[26];
    if (n > 27) o.spelheal = a[27];
    if (n > 28) o.spelshld = a[28];
    if (n > 29) o.spelarmr = a[29];
    if (n > 30) o.spelstat = a[30];
    if (n > 31) o.spelspec = a[31];
    if (n > 32) o.spelsbon = a[32];
    return o;
  }
  $cp(s: struct_Role): this {
    this.name.$cp(s.name);
    $cparr(this.rank, s.rank);
    this.lgod = s.lgod;
    this.ngod = s.ngod;
    this.cgod = s.cgod;
    this.filecode = s.filecode;
    this.homebase = s.homebase;
    this.intermed = s.intermed;
    this.malenum = s.malenum;
    this.femalenum = s.femalenum;
    this.petnum = s.petnum;
    this.ldrnum = s.ldrnum;
    this.guardnum = s.guardnum;
    this.neminum = s.neminum;
    this.enemy1num = s.enemy1num;
    this.enemy2num = s.enemy2num;
    this.enemy1sym = s.enemy1sym;
    this.enemy2sym = s.enemy2sym;
    this.questarti = s.questarti;
    this.allow = s.allow;
    this.attrbase.set(s.attrbase);
    this.attrdist.set(s.attrdist);
    this.hpadv.$cp(s.hpadv);
    this.enadv.$cp(s.enadv);
    this.xlev = s.xlev;
    this.initrecord = s.initrecord;
    this.spelbase = s.spelbase;
    this.spelheal = s.spelheal;
    this.spelshld = s.spelshld;
    this.spelarmr = s.spelarmr;
    this.spelstat = s.spelstat;
    this.spelspec = s.spelspec;
    this.spelsbon = s.spelsbon;
    return this;
  }
  $clone(): struct_Role { return new struct_Role().$cp(this); }
  static $size = 288;
  static $layout(): any[] { return [['name', 0, ['r', struct_RoleName]], ['rank', 16, ['a', ['r', struct_RoleName], 9]], ['lgod', 160, ['p']], ['ngod', 168, ['p']], ['cgod', 176, ['p']], ['filecode', 184, ['p']], ['homebase', 192, ['p']], ['intermed', 200, ['p']], ['malenum', 208, ['i', 2, 1]], ['femalenum', 210, ['i', 2, 1]], ['petnum', 212, ['i', 2, 1]], ['ldrnum', 214, ['i', 2, 1]], ['guardnum', 216, ['i', 2, 1]], ['neminum', 218, ['i', 2, 1]], ['enemy1num', 220, ['i', 2, 1]], ['enemy2num', 222, ['i', 2, 1]], ['enemy1sym', 224, ['i', 1, 1]], ['enemy2sym', 225, ['i', 1, 1]], ['questarti', 226, ['i', 2, 1]], ['allow', 228, ['i', 2, 1]], ['attrbase', 230, ['a', ['i', 1, 1], 6]], ['attrdist', 236, ['a', ['i', 1, 1], 6]], ['hpadv', 242, ['r', struct_RoleAdvance]], ['enadv', 248, ['r', struct_RoleAdvance]], ['xlev', 254, ['i', 1, 1]], ['initrecord', 255, ['i', 1, 1]], ['spelbase', 256, ['i', 4, 1]], ['spelheal', 260, ['i', 4, 1]], ['spelshld', 264, ['i', 4, 1]], ['spelarmr', 268, ['i', 4, 1]], ['spelstat', 272, ['i', 4, 1]], ['spelspec', 276, ['i', 4, 1]], ['spelsbon', 280, ['i', 4, 1]]]; }
}

/** struct RoleAdvance: 6 bytes */
export class struct_RoleAdvance {
  infix: number = 0;
  inrnd: number = 0;
  lofix: number = 0;
  lornd: number = 0;
  hifix: number = 0;
  hirnd: number = 0;
  static $of(...a: any[]): struct_RoleAdvance {
    const o = new struct_RoleAdvance();
    const n = a.length;
    if (n > 0) o.infix = a[0];
    if (n > 1) o.inrnd = a[1];
    if (n > 2) o.lofix = a[2];
    if (n > 3) o.lornd = a[3];
    if (n > 4) o.hifix = a[4];
    if (n > 5) o.hirnd = a[5];
    return o;
  }
  $cp(s: struct_RoleAdvance): this {
    this.infix = s.infix;
    this.inrnd = s.inrnd;
    this.lofix = s.lofix;
    this.lornd = s.lornd;
    this.hifix = s.hifix;
    this.hirnd = s.hirnd;
    return this;
  }
  $clone(): struct_RoleAdvance { return new struct_RoleAdvance().$cp(this); }
  static $size = 6;
  static $layout(): any[] { return [['infix', 0, ['i', 1, 1]], ['inrnd', 1, ['i', 1, 1]], ['lofix', 2, ['i', 1, 1]], ['lornd', 3, ['i', 1, 1]], ['hifix', 4, ['i', 1, 1]], ['hirnd', 5, ['i', 1, 1]]]; }
}

/** struct RoleName: 16 bytes */
export class struct_RoleName {
  m: any = null;
  f: any = null;
  static $of(...a: any[]): struct_RoleName {
    const o = new struct_RoleName();
    const n = a.length;
    if (n > 0) o.m = a[0];
    if (n > 1) o.f = a[1];
    return o;
  }
  $cp(s: struct_RoleName): this {
    this.m = s.m;
    this.f = s.f;
    return this;
  }
  $clone(): struct_RoleName { return new struct_RoleName().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['m', 0, ['p']], ['f', 8, ['p']]]; }
}

/** struct WinDesc: 136 bytes */
export class struct_WinDesc {
  flags: number = 0;
  type: number = 0;
  active: number = 0;
  offx: number = 0;
  offy: number = 0;
  rows: number = 0;
  cols: number = 0;
  curx: number = 0;
  cury: number = 0;
  maxrow: number = 0;
  maxcol: number = 0;
  datlen: any = null;
  data: any = null;
  morestr: any = null;
  mlist: struct_tty_mi | null = null;
  plist: any = null;
  plist_size: number = 0;
  npages: number = 0;
  nitems: number = 0;
  how: number = 0;
  menu_ch: number = 0;
  static $of(...a: any[]): struct_WinDesc {
    const o = new struct_WinDesc();
    const n = a.length;
    if (n > 0) o.flags = a[0];
    if (n > 1) o.type = a[1];
    if (n > 2) o.active = a[2];
    if (n > 3) o.offx = a[3];
    if (n > 4) o.offy = a[4];
    if (n > 5) o.rows = a[5];
    if (n > 6) o.cols = a[6];
    if (n > 7) o.curx = a[7];
    if (n > 8) o.cury = a[8];
    if (n > 9) o.maxrow = a[9];
    if (n > 10) o.maxcol = a[10];
    if (n > 11) o.datlen = a[11];
    if (n > 12) o.data = a[12];
    if (n > 13) o.morestr = a[13];
    if (n > 14) o.mlist = a[14];
    if (n > 15) o.plist = a[15];
    if (n > 16) o.plist_size = a[16];
    if (n > 17) o.npages = a[17];
    if (n > 18) o.nitems = a[18];
    if (n > 19) o.how = a[19];
    if (n > 20) o.menu_ch = a[20];
    return o;
  }
  $cp(s: struct_WinDesc): this {
    this.flags = s.flags;
    this.type = s.type;
    this.active = s.active;
    this.offx = s.offx;
    this.offy = s.offy;
    this.rows = s.rows;
    this.cols = s.cols;
    this.curx = s.curx;
    this.cury = s.cury;
    this.maxrow = s.maxrow;
    this.maxcol = s.maxcol;
    this.datlen = s.datlen;
    this.data = s.data;
    this.morestr = s.morestr;
    this.mlist = s.mlist;
    this.plist = s.plist;
    this.plist_size = s.plist_size;
    this.npages = s.npages;
    this.nitems = s.nitems;
    this.how = s.how;
    this.menu_ch = s.menu_ch;
    return this;
  }
  $clone(): struct_WinDesc { return new struct_WinDesc().$cp(this); }
  static $size = 136;
  static $layout(): any[] { return [['flags', 0, ['i', 4, 1]], ['type', 4, ['i', 1, 1]], ['active', 5, ['i', 1, 1]], ['offx', 6, ['i', 2, 1]], ['offy', 8, ['i', 2, 1]], ['rows', 16, ['i', 8, 1]], ['cols', 24, ['i', 8, 1]], ['curx', 32, ['i', 8, 1]], ['cury', 40, ['i', 8, 1]], ['maxrow', 48, ['i', 8, 1]], ['maxcol', 56, ['i', 8, 1]], ['datlen', 64, ['p']], ['data', 72, ['p']], ['morestr', 80, ['p']], ['mlist', 88, ['p']], ['plist', 96, ['p']], ['plist_size', 104, ['i', 8, 1]], ['npages', 112, ['i', 8, 1]], ['nitems', 120, ['i', 8, 1]], ['how', 128, ['i', 2, 1]], ['menu_ch', 130, ['i', 1, 1]]]; }
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

/** struct _cond_map: 16 bytes */
export class struct__cond_map {
  bm: number = 0;
  clratr: number = 0;
  static $of(...a: any[]): struct__cond_map {
    const o = new struct__cond_map();
    const n = a.length;
    if (n > 0) o.bm = a[0];
    if (n > 1) o.clratr = a[1];
    return o;
  }
  $cp(s: struct__cond_map): this {
    this.bm = s.bm;
    this.clratr = s.clratr;
    return this;
  }
  $clone(): struct__cond_map { return new struct__cond_map().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['bm', 0, ['i', 8, 0]], ['clratr', 8, ['i', 8, 0]]]; }
}

/** struct _config_error_frame: 1304 bytes */
export class struct__config_error_frame {
  line_num: number = 0;
  num_errors: number = 0;
  origline_shown: number = 0;
  fromfile: number = 0;
  secure: number = 0;
  origline: Int8Array = new Int8Array(1024);
  source: Int8Array = new Int8Array(256);
  next: struct__config_error_frame | null = null;
  static $of(...a: any[]): struct__config_error_frame {
    const o = new struct__config_error_frame();
    const n = a.length;
    if (n > 0) o.line_num = a[0];
    if (n > 1) o.num_errors = a[1];
    if (n > 2) o.origline_shown = a[2];
    if (n > 3) o.fromfile = a[3];
    if (n > 4) o.secure = a[4];
    if (n > 5) o.origline = a[5];
    if (n > 6) o.source = a[6];
    if (n > 7) o.next = a[7];
    return o;
  }
  $cp(s: struct__config_error_frame): this {
    this.line_num = s.line_num;
    this.num_errors = s.num_errors;
    this.origline_shown = s.origline_shown;
    this.fromfile = s.fromfile;
    this.secure = s.secure;
    this.origline.set(s.origline);
    this.source.set(s.source);
    this.next = s.next;
    return this;
  }
  $clone(): struct__config_error_frame { return new struct__config_error_frame().$cp(this); }
  static $size = 1304;
  static $layout(): any[] { return [['line_num', 0, ['i', 4, 1]], ['num_errors', 4, ['i', 4, 1]], ['origline_shown', 8, ['i', 1, 1]], ['fromfile', 9, ['i', 1, 1]], ['secure', 10, ['i', 1, 1]], ['origline', 11, ['a', ['i', 1, 1], 1024]], ['source', 1035, ['a', ['i', 1, 1], 256]], ['next', 1296, ['p']]]; }
}

/** struct _create_particular_data: 20 bytes */
export class struct__create_particular_data {
  which: number = 0;
  fem: number = 0;
  monclass: number = 0;
  randmonst: number = 0;
  maketame: number = 0;
  makepeaceful: number = 0;
  makehostile: number = 0;
  sleeping: number = 0;
  saddled: number = 0;
  invisible: number = 0;
  hidden: number = 0;
  static $of(...a: any[]): struct__create_particular_data {
    const o = new struct__create_particular_data();
    const n = a.length;
    if (n > 0) o.which = a[0];
    if (n > 1) o.fem = a[1];
    if (n > 2) o.monclass = a[2];
    if (n > 3) o.randmonst = a[3];
    if (n > 4) o.maketame = a[4];
    if (n > 5) o.makepeaceful = a[5];
    if (n > 6) o.makehostile = a[6];
    if (n > 7) o.sleeping = a[7];
    if (n > 8) o.saddled = a[8];
    if (n > 9) o.invisible = a[9];
    if (n > 10) o.hidden = a[10];
    return o;
  }
  $cp(s: struct__create_particular_data): this {
    this.which = s.which;
    this.fem = s.fem;
    this.monclass = s.monclass;
    this.randmonst = s.randmonst;
    this.maketame = s.maketame;
    this.makepeaceful = s.makepeaceful;
    this.makehostile = s.makehostile;
    this.sleeping = s.sleeping;
    this.saddled = s.saddled;
    this.invisible = s.invisible;
    this.hidden = s.hidden;
    return this;
  }
  $clone(): struct__create_particular_data { return new struct__create_particular_data().$cp(this); }
  static $size = 20;
  static $layout(): any[] { return [['which', 0, ['i', 4, 1]], ['fem', 4, ['i', 4, 1]], ['monclass', 8, ['i', 1, 1]], ['randmonst', 9, ['i', 1, 1]], ['maketame', 10, ['i', 1, 1]], ['makepeaceful', 11, ['i', 1, 1]], ['makehostile', 12, ['i', 1, 1]], ['sleeping', 13, ['i', 1, 1]], ['saddled', 14, ['i', 1, 1]], ['invisible', 15, ['i', 1, 1]], ['hidden', 16, ['i', 1, 1]]]; }
}

/** struct _opcode: 16 bytes */
export class struct__opcode {
  opcode: number = 0;
  opdat: struct_opvar | null = null;
  static $of(...a: any[]): struct__opcode {
    const o = new struct__opcode();
    const n = a.length;
    if (n > 0) o.opcode = a[0];
    if (n > 1) o.opdat = a[1];
    return o;
  }
  $cp(s: struct__opcode): this {
    this.opcode = s.opcode;
    this.opdat = s.opdat;
    return this;
  }
  $clone(): struct__opcode { return new struct__opcode().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['opcode', 0, ['i', 4, 1]], ['opdat', 8, ['p']]]; }
}

/** struct _room: 32 bytes */
export class struct__room {
  name: union_str_or_len = new union_str_or_len();
  parent: union_str_or_len = new union_str_or_len();
  x: number = 0;
  y: number = 0;
  w: number = 0;
  h: number = 0;
  xalign: number = 0;
  yalign: number = 0;
  rtype: number = 0;
  chance: number = 0;
  rlit: number = 0;
  filled: number = 0;
  joined: number = 0;
  static $of(...a: any[]): struct__room {
    const o = new struct__room();
    const n = a.length;
    if (n > 0) o.name = a[0];
    if (n > 1) o.parent = a[1];
    if (n > 2) o.x = a[2];
    if (n > 3) o.y = a[3];
    if (n > 4) o.w = a[4];
    if (n > 5) o.h = a[5];
    if (n > 6) o.xalign = a[6];
    if (n > 7) o.yalign = a[7];
    if (n > 8) o.rtype = a[8];
    if (n > 9) o.chance = a[9];
    if (n > 10) o.rlit = a[10];
    if (n > 11) o.filled = a[11];
    if (n > 12) o.joined = a[12];
    return o;
  }
  $cp(s: struct__room): this {
    this.name.$cp(s.name);
    this.parent.$cp(s.parent);
    this.x = s.x;
    this.y = s.y;
    this.w = s.w;
    this.h = s.h;
    this.xalign = s.xalign;
    this.yalign = s.yalign;
    this.rtype = s.rtype;
    this.chance = s.chance;
    this.rlit = s.rlit;
    this.filled = s.filled;
    this.joined = s.joined;
    return this;
  }
  $clone(): struct__room { return new struct__room().$cp(this); }
  static $size = 32;
  static $layout(): any[] { return [['name', 0, ['r', union_str_or_len]], ['parent', 8, ['r', union_str_or_len]], ['x', 16, ['i', 1, 1]], ['y', 17, ['i', 1, 1]], ['w', 18, ['i', 1, 1]], ['h', 19, ['i', 1, 1]], ['xalign', 20, ['i', 1, 1]], ['yalign', 21, ['i', 1, 1]], ['rtype', 22, ['i', 1, 1]], ['chance', 23, ['i', 1, 1]], ['rlit', 24, ['i', 1, 1]], ['filled', 25, ['i', 1, 1]], ['joined', 26, ['i', 1, 1]]]; }
}

/** struct _status_hilite_line_str: 288 bytes */
export class struct__status_hilite_line_str {
  id: number = 0;
  fld: number = 0;
  hl: struct_hilite_s | null = null;
  mask: number = 0;
  str: Int8Array = new Int8Array(256);
  next: struct__status_hilite_line_str | null = null;
  static $of(...a: any[]): struct__status_hilite_line_str {
    const o = new struct__status_hilite_line_str();
    const n = a.length;
    if (n > 0) o.id = a[0];
    if (n > 1) o.fld = a[1];
    if (n > 2) o.hl = a[2];
    if (n > 3) o.mask = a[3];
    if (n > 4) o.str = a[4];
    if (n > 5) o.next = a[5];
    return o;
  }
  $cp(s: struct__status_hilite_line_str): this {
    this.id = s.id;
    this.fld = s.fld;
    this.hl = s.hl;
    this.mask = s.mask;
    this.str.set(s.str);
    this.next = s.next;
    return this;
  }
  $clone(): struct__status_hilite_line_str { return new struct__status_hilite_line_str().$cp(this); }
  static $size = 288;
  static $layout(): any[] { return [['id', 0, ['i', 4, 1]], ['fld', 4, ['i', 4, 1]], ['hl', 8, ['p']], ['mask', 16, ['i', 8, 0]], ['str', 24, ['a', ['i', 1, 1], 256]], ['next', 280, ['p']]]; }
}

/** struct abil2adtyp_tag: 16 bytes */
export class struct_abil2adtyp_tag {
  abil: any = null;
  adtyp: number = 0;
  static $of(...a: any[]): struct_abil2adtyp_tag {
    const o = new struct_abil2adtyp_tag();
    const n = a.length;
    if (n > 0) o.abil = a[0];
    if (n > 1) o.adtyp = a[1];
    return o;
  }
  $cp(s: struct_abil2adtyp_tag): this {
    this.abil = s.abil;
    this.adtyp = s.adtyp;
    return this;
  }
  $clone(): struct_abil2adtyp_tag { return new struct_abil2adtyp_tag().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['abil', 0, ['p']], ['adtyp', 8, ['i', 1, 0]]]; }
}

/** struct abil2spfx_tag: 16 bytes */
export class struct_abil2spfx_tag {
  abil: any = null;
  spfx: number = 0;
  static $of(...a: any[]): struct_abil2spfx_tag {
    const o = new struct_abil2spfx_tag();
    const n = a.length;
    if (n > 0) o.abil = a[0];
    if (n > 1) o.spfx = a[1];
    return o;
  }
  $cp(s: struct_abil2spfx_tag): this {
    this.abil = s.abil;
    this.spfx = s.spfx;
    return this;
  }
  $clone(): struct_abil2spfx_tag { return new struct_abil2spfx_tag().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['abil', 0, ['p']], ['spfx', 8, ['i', 8, 0]]]; }
}

/** struct action: 16 bytes */
export class struct_action {
  letr: number = 0;
  desc: any = null;
  static $of(...a: any[]): struct_action {
    const o = new struct_action();
    const n = a.length;
    if (n > 0) o.letr = a[0];
    if (n > 1) o.desc = a[1];
    return o;
  }
  $cp(s: struct_action): this {
    this.letr = s.letr;
    this.desc = s.desc;
    return this;
  }
  $clone(): struct_action { return new struct_action().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['letr', 0, ['i', 1, 1]], ['desc', 8, ['p']]]; }
}

/** struct align: 8 bytes */
export class struct_align {
  type: number = 0;
  record: number = 0;
  static $of(...a: any[]): struct_align {
    const o = new struct_align();
    const n = a.length;
    if (n > 0) o.type = a[0];
    if (n > 1) o.record = a[1];
    return o;
  }
  $cp(s: struct_align): this {
    this.type = s.type;
    this.record = s.record;
    return this;
  }
  $clone(): struct_align { return new struct_align().$cp(this); }
  static $size = 8;
  static $layout(): any[] { return [['type', 0, ['i', 1, 1]], ['record', 4, ['i', 4, 1]]]; }
}

/** struct alt_spellings: 16 bytes */
export class struct_alt_spellings {
  sp: any = null;
  ob: number = 0;
  static $of(...a: any[]): struct_alt_spellings {
    const o = new struct_alt_spellings();
    const n = a.length;
    if (n > 0) o.sp = a[0];
    if (n > 1) o.ob = a[1];
    return o;
  }
  $cp(s: struct_alt_spellings): this {
    this.sp = s.sp;
    this.ob = s.ob;
    return this;
  }
  $clone(): struct_alt_spellings { return new struct_alt_spellings().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['sp', 0, ['p']], ['ob', 8, ['i', 4, 1]]]; }
}

/** struct alt_spl: 16 bytes */
export class struct_alt_spl {
  name: any = null;
  pm_val: number = 0;
  static $of(...a: any[]): struct_alt_spl {
    const o = new struct_alt_spl();
    const n = a.length;
    if (n > 0) o.name = a[0];
    if (n > 1) o.pm_val = a[1];
    return o;
  }
  $cp(s: struct_alt_spl): this {
    this.name = s.name;
    this.pm_val = s.pm_val;
    return this;
  }
  $clone(): struct_alt_spl { return new struct_alt_spl().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['name', 0, ['p']], ['pm_val', 8, ['i', 2, 1]]]; }
}

/** struct altar: 16 bytes */
export class struct_altar {
  coord: number = 0;
  x: number = 0;
  y: number = 0;
  align: number = 0;
  shrine: number = 0;
  static $of(...a: any[]): struct_altar {
    const o = new struct_altar();
    const n = a.length;
    if (n > 0) o.coord = a[0];
    if (n > 1) o.x = a[1];
    if (n > 2) o.y = a[2];
    if (n > 3) o.align = a[3];
    if (n > 4) o.shrine = a[4];
    return o;
  }
  $cp(s: struct_altar): this {
    this.coord = s.coord;
    this.x = s.x;
    this.y = s.y;
    this.align = s.align;
    this.shrine = s.shrine;
    return this;
  }
  $clone(): struct_altar { return new struct_altar().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['coord', 0, ['i', 8, 1]], ['x', 8, ['i', 1, 1]], ['y', 9, ['i', 1, 1]], ['align', 10, ['i', 1, 1]], ['shrine', 11, ['i', 1, 1]]]; }
}

/** struct artifact: 80 bytes */
export class struct_artifact {
  otyp: number = 0;
  name: any = null;
  spfx: number = 0;
  cspfx: number = 0;
  mtype: number = 0;
  attk: struct_attack = new struct_attack();
  defn: struct_attack = new struct_attack();
  cary: struct_attack = new struct_attack();
  inv_prop: number = 0;
  alignment: number = 0;
  role: number = 0;
  race: number = 0;
  cost: number = 0;
  acolor: number = 0;
  static $of(...a: any[]): struct_artifact {
    const o = new struct_artifact();
    const n = a.length;
    if (n > 0) o.otyp = a[0];
    if (n > 1) o.name = a[1];
    if (n > 2) o.spfx = a[2];
    if (n > 3) o.cspfx = a[3];
    if (n > 4) o.mtype = a[4];
    if (n > 5) o.attk = a[5];
    if (n > 6) o.defn = a[6];
    if (n > 7) o.cary = a[7];
    if (n > 8) o.inv_prop = a[8];
    if (n > 9) o.alignment = a[9];
    if (n > 10) o.role = a[10];
    if (n > 11) o.race = a[11];
    if (n > 12) o.cost = a[12];
    if (n > 13) o.acolor = a[13];
    return o;
  }
  $cp(s: struct_artifact): this {
    this.otyp = s.otyp;
    this.name = s.name;
    this.spfx = s.spfx;
    this.cspfx = s.cspfx;
    this.mtype = s.mtype;
    this.attk.$cp(s.attk);
    this.defn.$cp(s.defn);
    this.cary.$cp(s.cary);
    this.inv_prop = s.inv_prop;
    this.alignment = s.alignment;
    this.role = s.role;
    this.race = s.race;
    this.cost = s.cost;
    this.acolor = s.acolor;
    return this;
  }
  $clone(): struct_artifact { return new struct_artifact().$cp(this); }
  static $size = 80;
  static $layout(): any[] { return [['otyp', 0, ['i', 2, 1]], ['name', 8, ['p']], ['spfx', 16, ['i', 8, 0]], ['cspfx', 24, ['i', 8, 0]], ['mtype', 32, ['i', 8, 0]], ['attk', 40, ['r', struct_attack]], ['defn', 44, ['r', struct_attack]], ['cary', 48, ['r', struct_attack]], ['inv_prop', 52, ['i', 1, 0]], ['alignment', 53, ['i', 1, 1]], ['role', 54, ['i', 2, 1]], ['race', 56, ['i', 2, 1]], ['cost', 64, ['i', 8, 1]], ['acolor', 72, ['i', 1, 1]]]; }
}

/** struct attack: 4 bytes */
export class struct_attack {
  aatyp: number = 0;
  adtyp: number = 0;
  damn: number = 0;
  damd: number = 0;
  static $of(...a: any[]): struct_attack {
    const o = new struct_attack();
    const n = a.length;
    if (n > 0) o.aatyp = a[0];
    if (n > 1) o.adtyp = a[1];
    if (n > 2) o.damn = a[2];
    if (n > 3) o.damd = a[3];
    return o;
  }
  $cp(s: struct_attack): this {
    this.aatyp = s.aatyp;
    this.adtyp = s.adtyp;
    this.damn = s.damn;
    this.damd = s.damd;
    return this;
  }
  $clone(): struct_attack { return new struct_attack().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['aatyp', 0, ['i', 1, 0]], ['adtyp', 1, ['i', 1, 0]], ['damn', 2, ['i', 1, 0]], ['damd', 3, ['i', 1, 0]]]; }
}

/** struct attribs: 6 bytes */
export class struct_attribs {
  a: Int8Array = new Int8Array(6);
  static $of(...a: any[]): struct_attribs {
    const o = new struct_attribs();
    const n = a.length;
    if (n > 0) o.a = a[0];
    return o;
  }
  $cp(s: struct_attribs): this {
    this.a.set(s.a);
    return this;
  }
  $clone(): struct_attribs { return new struct_attribs().$cp(this); }
  static $size = 6;
  static $layout(): any[] { return [['a', 0, ['a', ['i', 1, 1], 6]]]; }
}

/** struct autopickup_exception: 32 bytes */
export class struct_autopickup_exception {
  regex: struct_nhregex | null = null;
  pattern: any = null;
  grab: number = 0;
  next: struct_autopickup_exception | null = null;
  static $of(...a: any[]): struct_autopickup_exception {
    const o = new struct_autopickup_exception();
    const n = a.length;
    if (n > 0) o.regex = a[0];
    if (n > 1) o.pattern = a[1];
    if (n > 2) o.grab = a[2];
    if (n > 3) o.next = a[3];
    return o;
  }
  $cp(s: struct_autopickup_exception): this {
    this.regex = s.regex;
    this.pattern = s.pattern;
    this.grab = s.grab;
    this.next = s.next;
    return this;
  }
  $clone(): struct_autopickup_exception { return new struct_autopickup_exception().$cp(this); }
  static $size = 32;
  static $layout(): any[] { return [['regex', 0, ['p']], ['pattern', 8, ['p']], ['grab', 16, ['i', 1, 1]], ['next', 24, ['p']]]; }
}

/** struct bill_x: 24 bytes */
export class struct_bill_x {
  bo_id: number = 0;
  useup: number = 0;
  price: number = 0;
  bquan: number = 0;
  static $of(...a: any[]): struct_bill_x {
    const o = new struct_bill_x();
    const n = a.length;
    if (n > 0) o.bo_id = a[0];
    if (n > 1) o.useup = a[1];
    if (n > 2) o.price = a[2];
    if (n > 3) o.bquan = a[3];
    return o;
  }
  $cp(s: struct_bill_x): this {
    this.bo_id = s.bo_id;
    this.useup = s.useup;
    this.price = s.price;
    this.bquan = s.bquan;
    return this;
  }
  $clone(): struct_bill_x { return new struct_bill_x().$cp(this); }
  static $size = 24;
  static $layout(): any[] { return [['bo_id', 0, ['i', 4, 0]], ['useup', 4, ['i', 1, 1]], ['price', 8, ['i', 8, 1]], ['bquan', 16, ['i', 8, 1]]]; }
}

/** struct book_info: 16 bytes */
export class struct_book_info {
  book: struct_obj | null = null;
  o_id: number = 0;
  delay: number = 0;
  static $of(...a: any[]): struct_book_info {
    const o = new struct_book_info();
    const n = a.length;
    if (n > 0) o.book = a[0];
    if (n > 1) o.o_id = a[1];
    if (n > 2) o.delay = a[2];
    return o;
  }
  $cp(s: struct_book_info): this {
    this.book = s.book;
    this.o_id = s.o_id;
    this.delay = s.delay;
    return this;
  }
  $clone(): struct_book_info { return new struct_book_info().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['book', 0, ['p']], ['o_id', 8, ['i', 4, 0]], ['delay', 12, ['i', 1, 1]]]; }
}

/** struct branch: 24 bytes */
export class struct_branch {
  next: struct_branch | null = null;
  id: number = 0;
  type: number = 0;
  end1: struct_d_level = new struct_d_level();
  end2: struct_d_level = new struct_d_level();
  end1_up: number = 0;
  static $of(...a: any[]): struct_branch {
    const o = new struct_branch();
    const n = a.length;
    if (n > 0) o.next = a[0];
    if (n > 1) o.id = a[1];
    if (n > 2) o.type = a[2];
    if (n > 3) o.end1 = a[3];
    if (n > 4) o.end2 = a[4];
    if (n > 5) o.end1_up = a[5];
    return o;
  }
  $cp(s: struct_branch): this {
    this.next = s.next;
    this.id = s.id;
    this.type = s.type;
    this.end1.$cp(s.end1);
    this.end2.$cp(s.end2);
    this.end1_up = s.end1_up;
    return this;
  }
  $clone(): struct_branch { return new struct_branch().$cp(this); }
  static $size = 24;
  static $layout(): any[] { return [['next', 0, ['p']], ['id', 8, ['i', 4, 1]], ['type', 12, ['i', 4, 1]], ['end1', 16, ['r', struct_d_level]], ['end2', 18, ['r', struct_d_level]], ['end1_up', 20, ['i', 1, 1]]]; }
}

/** struct bubble: 40 bytes */
export class struct_bubble {
  x: number = 0;
  y: number = 0;
  dx: number = 0;
  dy: number = 0;
  bm: Uint8Array = new Uint8Array(6);
  prev: struct_bubble | null = null;
  next: struct_bubble | null = null;
  cons: struct_container | null = null;
  static $of(...a: any[]): struct_bubble {
    const o = new struct_bubble();
    const n = a.length;
    if (n > 0) o.x = a[0];
    if (n > 1) o.y = a[1];
    if (n > 2) o.dx = a[2];
    if (n > 3) o.dy = a[3];
    if (n > 4) o.bm = a[4];
    if (n > 5) o.prev = a[5];
    if (n > 6) o.next = a[6];
    if (n > 7) o.cons = a[7];
    return o;
  }
  $cp(s: struct_bubble): this {
    this.x = s.x;
    this.y = s.y;
    this.dx = s.dx;
    this.dy = s.dy;
    this.bm.set(s.bm);
    this.prev = s.prev;
    this.next = s.next;
    this.cons = s.cons;
    return this;
  }
  $clone(): struct_bubble { return new struct_bubble().$cp(this); }
  static $size = 40;
  static $layout(): any[] { return [['x', 0, ['i', 1, 1]], ['y', 1, ['i', 1, 1]], ['dx', 2, ['i', 1, 1]], ['dy', 3, ['i', 1, 1]], ['bm', 4, ['a', ['i', 1, 0], 6]], ['prev', 16, ['p']], ['next', 24, ['p']], ['cons', 32, ['p']]]; }
}

/** struct bucket: 520 bytes */
export class struct_bucket {
  next: struct_bucket | null = null;
  map: any[] = $sarr(anon_restore_c_66, 64);
  static $of(...a: any[]): struct_bucket {
    const o = new struct_bucket();
    const n = a.length;
    if (n > 0) o.next = a[0];
    if (n > 1) o.map = a[1];
    return o;
  }
  $cp(s: struct_bucket): this {
    this.next = s.next;
    $cparr(this.map, s.map);
    return this;
  }
  $clone(): struct_bucket { return new struct_bucket().$cp(this); }
  static $size = 520;
  static $layout(): any[] { return [['next', 0, ['p']], ['map', 8, ['a', ['r', anon_restore_c_66], 64]]]; }
}

/** struct c_color_names: 88 bytes */
export class struct_c_color_names {
  c_black: any = null;
  c_amber: any = null;
  c_golden: any = null;
  c_light_blue: any = null;
  c_red: any = null;
  c_green: any = null;
  c_silver: any = null;
  c_blue: any = null;
  c_purple: any = null;
  c_white: any = null;
  c_orange: any = null;
  static $of(...a: any[]): struct_c_color_names {
    const o = new struct_c_color_names();
    const n = a.length;
    if (n > 0) o.c_black = a[0];
    if (n > 1) o.c_amber = a[1];
    if (n > 2) o.c_golden = a[2];
    if (n > 3) o.c_light_blue = a[3];
    if (n > 4) o.c_red = a[4];
    if (n > 5) o.c_green = a[5];
    if (n > 6) o.c_silver = a[6];
    if (n > 7) o.c_blue = a[7];
    if (n > 8) o.c_purple = a[8];
    if (n > 9) o.c_white = a[9];
    if (n > 10) o.c_orange = a[10];
    return o;
  }
  $cp(s: struct_c_color_names): this {
    this.c_black = s.c_black;
    this.c_amber = s.c_amber;
    this.c_golden = s.c_golden;
    this.c_light_blue = s.c_light_blue;
    this.c_red = s.c_red;
    this.c_green = s.c_green;
    this.c_silver = s.c_silver;
    this.c_blue = s.c_blue;
    this.c_purple = s.c_purple;
    this.c_white = s.c_white;
    this.c_orange = s.c_orange;
    return this;
  }
  $clone(): struct_c_color_names { return new struct_c_color_names().$cp(this); }
  static $size = 88;
  static $layout(): any[] { return [['c_black', 0, ['p']], ['c_amber', 8, ['p']], ['c_golden', 16, ['p']], ['c_light_blue', 24, ['p']], ['c_red', 32, ['p']], ['c_green', 40, ['p']], ['c_silver', 48, ['p']], ['c_blue', 56, ['p']], ['c_purple', 64, ['p']], ['c_white', 72, ['p']], ['c_orange', 80, ['p']]]; }
}

/** struct c_common_strings: 104 bytes */
export class struct_c_common_strings {
  c_nothing_happens: any = null;
  c_thats_enough_tries: any = null;
  c_silly_thing_to: any = null;
  c_shudder_for_moment: any = null;
  c_something: any = null;
  c_Something: any = null;
  c_You_can_move_again: any = null;
  c_Never_mind: any = null;
  c_vision_clears: any = null;
  c_the_your: any[] = new Array(2).fill(null);
  c_fakename: any[] = new Array(2).fill(null);
  static $of(...a: any[]): struct_c_common_strings {
    const o = new struct_c_common_strings();
    const n = a.length;
    if (n > 0) o.c_nothing_happens = a[0];
    if (n > 1) o.c_thats_enough_tries = a[1];
    if (n > 2) o.c_silly_thing_to = a[2];
    if (n > 3) o.c_shudder_for_moment = a[3];
    if (n > 4) o.c_something = a[4];
    if (n > 5) o.c_Something = a[5];
    if (n > 6) o.c_You_can_move_again = a[6];
    if (n > 7) o.c_Never_mind = a[7];
    if (n > 8) o.c_vision_clears = a[8];
    if (n > 9) o.c_the_your = a[9];
    if (n > 10) o.c_fakename = a[10];
    return o;
  }
  $cp(s: struct_c_common_strings): this {
    this.c_nothing_happens = s.c_nothing_happens;
    this.c_thats_enough_tries = s.c_thats_enough_tries;
    this.c_silly_thing_to = s.c_silly_thing_to;
    this.c_shudder_for_moment = s.c_shudder_for_moment;
    this.c_something = s.c_something;
    this.c_Something = s.c_Something;
    this.c_You_can_move_again = s.c_You_can_move_again;
    this.c_Never_mind = s.c_Never_mind;
    this.c_vision_clears = s.c_vision_clears;
    $cpvals(this.c_the_your, s.c_the_your);
    $cpvals(this.c_fakename, s.c_fakename);
    return this;
  }
  $clone(): struct_c_common_strings { return new struct_c_common_strings().$cp(this); }
  static $size = 104;
  static $layout(): any[] { return [['c_nothing_happens', 0, ['p']], ['c_thats_enough_tries', 8, ['p']], ['c_silly_thing_to', 16, ['p']], ['c_shudder_for_moment', 24, ['p']], ['c_something', 32, ['p']], ['c_Something', 40, ['p']], ['c_You_can_move_again', 48, ['p']], ['c_Never_mind', 56, ['p']], ['c_vision_clears', 64, ['p']], ['c_the_your', 72, ['a', ['p'], 2]], ['c_fakename', 88, ['a', ['p'], 2]]]; }
}

/** struct cemetery: 176 bytes */
export class struct_cemetery {
  next: struct_cemetery | null = null;
  who: Int8Array = new Int8Array(49);
  how: Int8Array = new Int8Array(101);
  when: Int8Array = new Int8Array(15);
  frpx: number = 0;
  frpy: number = 0;
  bonesknown: number = 0;
  static $of(...a: any[]): struct_cemetery {
    const o = new struct_cemetery();
    const n = a.length;
    if (n > 0) o.next = a[0];
    if (n > 1) o.who = a[1];
    if (n > 2) o.how = a[2];
    if (n > 3) o.when = a[3];
    if (n > 4) o.frpx = a[4];
    if (n > 5) o.frpy = a[5];
    if (n > 6) o.bonesknown = a[6];
    return o;
  }
  $cp(s: struct_cemetery): this {
    this.next = s.next;
    this.who.set(s.who);
    this.how.set(s.how);
    this.when.set(s.when);
    this.frpx = s.frpx;
    this.frpy = s.frpy;
    this.bonesknown = s.bonesknown;
    return this;
  }
  $clone(): struct_cemetery { return new struct_cemetery().$cp(this); }
  static $size = 176;
  static $layout(): any[] { return [['next', 0, ['p']], ['who', 8, ['a', ['i', 1, 1], 49]], ['how', 57, ['a', ['i', 1, 1], 101]], ['when', 158, ['a', ['i', 1, 1], 15]], ['frpx', 173, ['i', 1, 1]], ['frpy', 174, ['i', 1, 1]], ['bonesknown', 175, ['i', 1, 1]]]; }
}

/** struct class_sym: 24 bytes */
export class struct_class_sym {
  sym: number = 0;
  name: any = null;
  explain: any = null;
  static $of(...a: any[]): struct_class_sym {
    const o = new struct_class_sym();
    const n = a.length;
    if (n > 0) o.sym = a[0];
    if (n > 1) o.name = a[1];
    if (n > 2) o.explain = a[2];
    return o;
  }
  $cp(s: struct_class_sym): this {
    this.sym = s.sym;
    this.name = s.name;
    this.explain = s.explain;
    return this;
  }
  $clone(): struct_class_sym { return new struct_class_sym().$cp(this); }
  static $size = 24;
  static $layout(): any[] { return [['sym', 0, ['i', 1, 1]], ['name', 8, ['p']], ['explain', 16, ['p']]]; }
}

/** struct cmd: 2128 bytes */
export class struct_cmd {
  serialno: number = 0;
  num_pad: number = 0;
  pcHack_compat: number = 0;
  phone_layout: number = 0;
  swap_yz: number = 0;
  move_W: number = 0;
  move_NW: number = 0;
  move_N: number = 0;
  move_NE: number = 0;
  move_E: number = 0;
  move_SE: number = 0;
  move_S: number = 0;
  move_SW: number = 0;
  dirchars: any = null;
  alphadirchars: any = null;
  commands: any[] = new Array(256).fill(null);
  spkeys: Int8Array = new Int8Array(42);
  static $of(...a: any[]): struct_cmd {
    const o = new struct_cmd();
    const n = a.length;
    if (n > 0) o.serialno = a[0];
    if (n > 1) o.num_pad = a[1];
    if (n > 2) o.pcHack_compat = a[2];
    if (n > 3) o.phone_layout = a[3];
    if (n > 4) o.swap_yz = a[4];
    if (n > 5) o.move_W = a[5];
    if (n > 6) o.move_NW = a[6];
    if (n > 7) o.move_N = a[7];
    if (n > 8) o.move_NE = a[8];
    if (n > 9) o.move_E = a[9];
    if (n > 10) o.move_SE = a[10];
    if (n > 11) o.move_S = a[11];
    if (n > 12) o.move_SW = a[12];
    if (n > 13) o.dirchars = a[13];
    if (n > 14) o.alphadirchars = a[14];
    if (n > 15) o.commands = a[15];
    if (n > 16) o.spkeys = a[16];
    return o;
  }
  $cp(s: struct_cmd): this {
    this.serialno = s.serialno;
    this.num_pad = s.num_pad;
    this.pcHack_compat = s.pcHack_compat;
    this.phone_layout = s.phone_layout;
    this.swap_yz = s.swap_yz;
    this.move_W = s.move_W;
    this.move_NW = s.move_NW;
    this.move_N = s.move_N;
    this.move_NE = s.move_NE;
    this.move_E = s.move_E;
    this.move_SE = s.move_SE;
    this.move_S = s.move_S;
    this.move_SW = s.move_SW;
    this.dirchars = s.dirchars;
    this.alphadirchars = s.alphadirchars;
    $cpvals(this.commands, s.commands);
    this.spkeys.set(s.spkeys);
    return this;
  }
  $clone(): struct_cmd { return new struct_cmd().$cp(this); }
  static $size = 2128;
  static $layout(): any[] { return [['serialno', 0, ['i', 4, 0]], ['num_pad', 4, ['i', 1, 1]], ['pcHack_compat', 5, ['i', 1, 1]], ['phone_layout', 6, ['i', 1, 1]], ['swap_yz', 7, ['i', 1, 1]], ['move_W', 8, ['i', 1, 1]], ['move_NW', 9, ['i', 1, 1]], ['move_N', 10, ['i', 1, 1]], ['move_NE', 11, ['i', 1, 1]], ['move_E', 12, ['i', 1, 1]], ['move_SE', 13, ['i', 1, 1]], ['move_S', 14, ['i', 1, 1]], ['move_SW', 15, ['i', 1, 1]], ['dirchars', 16, ['p']], ['alphadirchars', 24, ['p']], ['commands', 32, ['a', ['p'], 256]], ['spkeys', 2080, ['a', ['i', 1, 1], 42]]]; }
}

/** struct condition_t: 32 bytes */
export class struct_condition_t {
  mask: number = 0;
  text: any[] = new Array(3).fill(null);
  static $of(...a: any[]): struct_condition_t {
    const o = new struct_condition_t();
    const n = a.length;
    if (n > 0) o.mask = a[0];
    if (n > 1) o.text = a[1];
    return o;
  }
  $cp(s: struct_condition_t): this {
    this.mask = s.mask;
    $cpvals(this.text, s.text);
    return this;
  }
  $clone(): struct_condition_t { return new struct_condition_t().$cp(this); }
  static $size = 32;
  static $layout(): any[] { return [['mask', 0, ['i', 8, 1]], ['text', 8, ['a', ['p'], 3]]]; }
}

/** struct condmap: 16 bytes */
export class struct_condmap {
  id: any = null;
  bitmask: number = 0;
  static $of(...a: any[]): struct_condmap {
    const o = new struct_condmap();
    const n = a.length;
    if (n > 0) o.id = a[0];
    if (n > 1) o.bitmask = a[1];
    return o;
  }
  $cp(s: struct_condmap): this {
    this.id = s.id;
    this.bitmask = s.bitmask;
    return this;
  }
  $clone(): struct_condmap { return new struct_condmap().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['id', 0, ['p']], ['bitmask', 8, ['i', 8, 0]]]; }
}

/** struct container: 24 bytes */
export class struct_container {
  next: struct_container | null = null;
  x: number = 0;
  y: number = 0;
  what: number = 0;
  list: any = null;
  static $of(...a: any[]): struct_container {
    const o = new struct_container();
    const n = a.length;
    if (n > 0) o.next = a[0];
    if (n > 1) o.x = a[1];
    if (n > 2) o.y = a[2];
    if (n > 3) o.what = a[3];
    if (n > 4) o.list = a[4];
    return o;
  }
  $cp(s: struct_container): this {
    this.next = s.next;
    this.x = s.x;
    this.y = s.y;
    this.what = s.what;
    this.list = s.list;
    return this;
  }
  $clone(): struct_container { return new struct_container().$cp(this); }
  static $size = 24;
  static $layout(): any[] { return [['next', 0, ['p']], ['x', 8, ['i', 1, 1]], ['y', 9, ['i', 1, 1]], ['what', 10, ['i', 2, 1]], ['list', 16, ['p']]]; }
}

/** struct context_info: 328 bytes */
export class struct_context_info {
  ident: number = 0;
  no_of_wizards: number = 0;
  run: number = 0;
  startingpet_mid: number = 0;
  current_fruit: number = 0;
  warnlevel: number = 0;
  rndencode: number = 0;
  next_attrib_check: number = 0;
  stethoscope_move: number = 0;
  stethoscope_movement: number = 0;
  travel: number = 0;
  travel1: number = 0;
  forcefight: number = 0;
  nopick: number = 0;
  made_amulet: number = 0;
  mon_moving: number = 0;
  move: number = 0;
  mv: number = 0;
  bypasses: number = 0;
  botl: number = 0;
  botlx: number = 0;
  door_opened: number = 0;
  digging: struct_dig_info = new struct_dig_info();
  victual: struct_victual_info = new struct_victual_info();
  tin: struct_tin_info = new struct_tin_info();
  spbook: struct_book_info = new struct_book_info();
  takeoff: struct_takeoff_info = new struct_takeoff_info();
  warntype: struct_warntype_info = new struct_warntype_info();
  polearm: struct_polearm_info = new struct_polearm_info();
  objsplit: struct_obj_split = new struct_obj_split();
  tribute: struct_tribute_info = new struct_tribute_info();
  novel: struct_novel_tracking = new struct_novel_tracking();
  static $of(...a: any[]): struct_context_info {
    const o = new struct_context_info();
    const n = a.length;
    if (n > 0) o.ident = a[0];
    if (n > 1) o.no_of_wizards = a[1];
    if (n > 2) o.run = a[2];
    if (n > 3) o.startingpet_mid = a[3];
    if (n > 4) o.current_fruit = a[4];
    if (n > 5) o.warnlevel = a[5];
    if (n > 6) o.rndencode = a[6];
    if (n > 7) o.next_attrib_check = a[7];
    if (n > 8) o.stethoscope_move = a[8];
    if (n > 9) o.stethoscope_movement = a[9];
    if (n > 10) o.travel = a[10];
    if (n > 11) o.travel1 = a[11];
    if (n > 12) o.forcefight = a[12];
    if (n > 13) o.nopick = a[13];
    if (n > 14) o.made_amulet = a[14];
    if (n > 15) o.mon_moving = a[15];
    if (n > 16) o.move = a[16];
    if (n > 17) o.mv = a[17];
    if (n > 18) o.bypasses = a[18];
    if (n > 19) o.botl = a[19];
    if (n > 20) o.botlx = a[20];
    if (n > 21) o.door_opened = a[21];
    if (n > 22) o.digging = a[22];
    if (n > 23) o.victual = a[23];
    if (n > 24) o.tin = a[24];
    if (n > 25) o.spbook = a[25];
    if (n > 26) o.takeoff = a[26];
    if (n > 27) o.warntype = a[27];
    if (n > 28) o.polearm = a[28];
    if (n > 29) o.objsplit = a[29];
    if (n > 30) o.tribute = a[30];
    if (n > 31) o.novel = a[31];
    return o;
  }
  $cp(s: struct_context_info): this {
    this.ident = s.ident;
    this.no_of_wizards = s.no_of_wizards;
    this.run = s.run;
    this.startingpet_mid = s.startingpet_mid;
    this.current_fruit = s.current_fruit;
    this.warnlevel = s.warnlevel;
    this.rndencode = s.rndencode;
    this.next_attrib_check = s.next_attrib_check;
    this.stethoscope_move = s.stethoscope_move;
    this.stethoscope_movement = s.stethoscope_movement;
    this.travel = s.travel;
    this.travel1 = s.travel1;
    this.forcefight = s.forcefight;
    this.nopick = s.nopick;
    this.made_amulet = s.made_amulet;
    this.mon_moving = s.mon_moving;
    this.move = s.move;
    this.mv = s.mv;
    this.bypasses = s.bypasses;
    this.botl = s.botl;
    this.botlx = s.botlx;
    this.door_opened = s.door_opened;
    this.digging.$cp(s.digging);
    this.victual.$cp(s.victual);
    this.tin.$cp(s.tin);
    this.spbook.$cp(s.spbook);
    this.takeoff.$cp(s.takeoff);
    this.warntype.$cp(s.warntype);
    this.polearm.$cp(s.polearm);
    this.objsplit.$cp(s.objsplit);
    this.tribute.$cp(s.tribute);
    this.novel.$cp(s.novel);
    return this;
  }
  $clone(): struct_context_info { return new struct_context_info().$cp(this); }
  static $size = 328;
  static $layout(): any[] { return [['ident', 0, ['i', 4, 0]], ['no_of_wizards', 4, ['i', 4, 0]], ['run', 8, ['i', 4, 0]], ['startingpet_mid', 12, ['i', 4, 0]], ['current_fruit', 16, ['i', 4, 1]], ['warnlevel', 20, ['i', 4, 1]], ['rndencode', 24, ['i', 4, 1]], ['next_attrib_check', 32, ['i', 8, 1]], ['stethoscope_move', 40, ['i', 8, 1]], ['stethoscope_movement', 48, ['i', 2, 1]], ['travel', 50, ['i', 1, 1]], ['travel1', 51, ['i', 1, 1]], ['forcefight', 52, ['i', 1, 1]], ['nopick', 53, ['i', 1, 1]], ['made_amulet', 54, ['i', 1, 1]], ['mon_moving', 55, ['i', 1, 1]], ['move', 56, ['i', 1, 1]], ['mv', 57, ['i', 1, 1]], ['bypasses', 58, ['i', 1, 1]], ['botl', 59, ['i', 1, 1]], ['botlx', 60, ['i', 1, 1]], ['door_opened', 61, ['i', 1, 1]], ['digging', 64, ['r', struct_dig_info]], ['victual', 88, ['r', struct_victual_info]], ['tin', 120, ['r', struct_tin_info]], ['spbook', 144, ['r', struct_book_info]], ['takeoff', 160, ['r', struct_takeoff_info]], ['warntype', 216, ['r', struct_warntype_info]], ['polearm', 248, ['r', struct_polearm_info]], ['objsplit', 264, ['r', struct_obj_split]], ['tribute', 272, ['r', struct_tribute_info]], ['novel', 288, ['r', struct_novel_tracking]]]; }
}

/** struct corridor: 6 bytes */
export class struct_corridor {
  src: anon_sp_lev_h_417 = new anon_sp_lev_h_417();
  dest: anon_sp_lev_h_417 = new anon_sp_lev_h_417();
  static $of(...a: any[]): struct_corridor {
    const o = new struct_corridor();
    const n = a.length;
    if (n > 0) o.src = a[0];
    if (n > 1) o.dest = a[1];
    return o;
  }
  $cp(s: struct_corridor): this {
    this.src.$cp(s.src);
    this.dest.$cp(s.dest);
    return this;
  }
  $clone(): struct_corridor { return new struct_corridor().$cp(this); }
  static $size = 6;
  static $layout(): any[] { return [['src', 0, ['r', anon_sp_lev_h_417]], ['dest', 3, ['r', anon_sp_lev_h_417]]]; }
}

/** struct couple: 4 bytes */
export class struct_couple {
  base: number = 0;
  rand: number = 0;
  static $of(...a: any[]): struct_couple {
    const o = new struct_couple();
    const n = a.length;
    if (n > 0) o.base = a[0];
    if (n > 1) o.rand = a[1];
    return o;
  }
  $cp(s: struct_couple): this {
    this.base = s.base;
    this.rand = s.rand;
    return this;
  }
  $clone(): struct_couple { return new struct_couple().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['base', 0, ['i', 2, 1]], ['rand', 2, ['i', 2, 1]]]; }
}

/** struct d_flags: 4 bytes */
export class struct_d_flags {
  town: number = 0;
  hellish: number = 0;
  maze_like: number = 0;
  rogue_like: number = 0;
  align: number = 0;
  unused: number = 0;
  static $of(...a: any[]): struct_d_flags {
    const o = new struct_d_flags();
    const n = a.length;
    if (n > 0) o.town = a[0];
    if (n > 1) o.hellish = a[1];
    if (n > 2) o.maze_like = a[2];
    if (n > 3) o.rogue_like = a[3];
    if (n > 4) o.align = a[4];
    if (n > 5) o.unused = a[5];
    return o;
  }
  $cp(s: struct_d_flags): this {
    this.town = s.town;
    this.hellish = s.hellish;
    this.maze_like = s.maze_like;
    this.rogue_like = s.rogue_like;
    this.align = s.align;
    this.unused = s.unused;
    return this;
  }
  $clone(): struct_d_flags { return new struct_d_flags().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['town', 0, ['b', 0, 1, 0]], ['hellish', 0, ['b', 1, 1, 0]], ['maze_like', 0, ['b', 2, 1, 0]], ['rogue_like', 0, ['b', 3, 1, 0]], ['align', 0, ['b', 4, 3, 0]], ['unused', 0, ['b', 7, 1, 0]]]; }
}

/** struct d_level: 2 bytes */
export class struct_d_level {
  dnum: number = 0;
  dlevel: number = 0;
  static $of(...a: any[]): struct_d_level {
    const o = new struct_d_level();
    const n = a.length;
    if (n > 0) o.dnum = a[0];
    if (n > 1) o.dlevel = a[1];
    return o;
  }
  $cp(s: struct_d_level): this {
    this.dnum = s.dnum;
    this.dlevel = s.dlevel;
    return this;
  }
  $clone(): struct_d_level { return new struct_d_level().$cp(this); }
  static $size = 2;
  static $layout(): any[] { return [['dnum', 0, ['i', 1, 1]], ['dlevel', 1, ['i', 1, 1]]]; }
}

/** struct damage: 32 bytes */
export class struct_damage {
  next: struct_damage | null = null;
  when: number = 0;
  cost: number = 0;
  place: struct_nhcoord = new struct_nhcoord();
  typ: number = 0;
  static $of(...a: any[]): struct_damage {
    const o = new struct_damage();
    const n = a.length;
    if (n > 0) o.next = a[0];
    if (n > 1) o.when = a[1];
    if (n > 2) o.cost = a[2];
    if (n > 3) o.place = a[3];
    if (n > 4) o.typ = a[4];
    return o;
  }
  $cp(s: struct_damage): this {
    this.next = s.next;
    this.when = s.when;
    this.cost = s.cost;
    this.place.$cp(s.place);
    this.typ = s.typ;
    return this;
  }
  $clone(): struct_damage { return new struct_damage().$cp(this); }
  static $size = 32;
  static $layout(): any[] { return [['next', 0, ['p']], ['when', 8, ['i', 8, 1]], ['cost', 16, ['i', 8, 1]], ['place', 24, ['r', struct_nhcoord]], ['typ', 26, ['i', 1, 1]]]; }
}

/** struct debug_flags: 2 bytes */
export class struct_debug_flags {
  test: number = 0;
  ttystatus: number = 0;
  static $of(...a: any[]): struct_debug_flags {
    const o = new struct_debug_flags();
    const n = a.length;
    if (n > 0) o.test = a[0];
    if (n > 1) o.ttystatus = a[1];
    return o;
  }
  $cp(s: struct_debug_flags): this {
    this.test = s.test;
    this.ttystatus = s.ttystatus;
    return this;
  }
  $clone(): struct_debug_flags { return new struct_debug_flags().$cp(this); }
  static $size = 2;
  static $layout(): any[] { return [['test', 0, ['i', 1, 1]], ['ttystatus', 1, ['i', 1, 1]]]; }
}

/** struct def_skill: 2 bytes */
export class struct_def_skill {
  skill: number = 0;
  skmax: number = 0;
  static $of(...a: any[]): struct_def_skill {
    const o = new struct_def_skill();
    const n = a.length;
    if (n > 0) o.skill = a[0];
    if (n > 1) o.skmax = a[1];
    return o;
  }
  $cp(s: struct_def_skill): this {
    this.skill = s.skill;
    this.skmax = s.skmax;
    return this;
  }
  $clone(): struct_def_skill { return new struct_def_skill().$cp(this); }
  static $size = 2;
  static $layout(): any[] { return [['skill', 0, ['i', 1, 1]], ['skmax', 1, ['i', 1, 1]]]; }
}

/** struct dest_area: 8 bytes */
export class struct_dest_area {
  lx: number = 0;
  ly: number = 0;
  hx: number = 0;
  hy: number = 0;
  nlx: number = 0;
  nly: number = 0;
  nhx: number = 0;
  nhy: number = 0;
  static $of(...a: any[]): struct_dest_area {
    const o = new struct_dest_area();
    const n = a.length;
    if (n > 0) o.lx = a[0];
    if (n > 1) o.ly = a[1];
    if (n > 2) o.hx = a[2];
    if (n > 3) o.hy = a[3];
    if (n > 4) o.nlx = a[4];
    if (n > 5) o.nly = a[5];
    if (n > 6) o.nhx = a[6];
    if (n > 7) o.nhy = a[7];
    return o;
  }
  $cp(s: struct_dest_area): this {
    this.lx = s.lx;
    this.ly = s.ly;
    this.hx = s.hx;
    this.hy = s.hy;
    this.nlx = s.nlx;
    this.nly = s.nly;
    this.nhx = s.nhx;
    this.nhy = s.nhy;
    return this;
  }
  $clone(): struct_dest_area { return new struct_dest_area().$cp(this); }
  static $size = 8;
  static $layout(): any[] { return [['lx', 0, ['i', 1, 1]], ['ly', 1, ['i', 1, 1]], ['hx', 2, ['i', 1, 1]], ['hy', 3, ['i', 1, 1]], ['nlx', 4, ['i', 1, 1]], ['nly', 5, ['i', 1, 1]], ['nhx', 6, ['i', 1, 1]], ['nhy', 7, ['i', 1, 1]]]; }
}

/** struct dgn_topology: 56 bytes */
export class struct_dgn_topology {
  d_oracle_level: struct_d_level = new struct_d_level();
  d_bigroom_level: struct_d_level = new struct_d_level();
  d_rogue_level: struct_d_level = new struct_d_level();
  d_medusa_level: struct_d_level = new struct_d_level();
  d_stronghold_level: struct_d_level = new struct_d_level();
  d_valley_level: struct_d_level = new struct_d_level();
  d_wiz1_level: struct_d_level = new struct_d_level();
  d_wiz2_level: struct_d_level = new struct_d_level();
  d_wiz3_level: struct_d_level = new struct_d_level();
  d_juiblex_level: struct_d_level = new struct_d_level();
  d_orcus_level: struct_d_level = new struct_d_level();
  d_baalzebub_level: struct_d_level = new struct_d_level();
  d_asmodeus_level: struct_d_level = new struct_d_level();
  d_portal_level: struct_d_level = new struct_d_level();
  d_sanctum_level: struct_d_level = new struct_d_level();
  d_earth_level: struct_d_level = new struct_d_level();
  d_water_level: struct_d_level = new struct_d_level();
  d_fire_level: struct_d_level = new struct_d_level();
  d_air_level: struct_d_level = new struct_d_level();
  d_astral_level: struct_d_level = new struct_d_level();
  d_tower_dnum: number = 0;
  d_sokoban_dnum: number = 0;
  d_mines_dnum: number = 0;
  d_quest_dnum: number = 0;
  d_qstart_level: struct_d_level = new struct_d_level();
  d_qlocate_level: struct_d_level = new struct_d_level();
  d_nemesis_level: struct_d_level = new struct_d_level();
  d_knox_level: struct_d_level = new struct_d_level();
  d_mineend_level: struct_d_level = new struct_d_level();
  d_sokoend_level: struct_d_level = new struct_d_level();
  static $of(...a: any[]): struct_dgn_topology {
    const o = new struct_dgn_topology();
    const n = a.length;
    if (n > 0) o.d_oracle_level = a[0];
    if (n > 1) o.d_bigroom_level = a[1];
    if (n > 2) o.d_rogue_level = a[2];
    if (n > 3) o.d_medusa_level = a[3];
    if (n > 4) o.d_stronghold_level = a[4];
    if (n > 5) o.d_valley_level = a[5];
    if (n > 6) o.d_wiz1_level = a[6];
    if (n > 7) o.d_wiz2_level = a[7];
    if (n > 8) o.d_wiz3_level = a[8];
    if (n > 9) o.d_juiblex_level = a[9];
    if (n > 10) o.d_orcus_level = a[10];
    if (n > 11) o.d_baalzebub_level = a[11];
    if (n > 12) o.d_asmodeus_level = a[12];
    if (n > 13) o.d_portal_level = a[13];
    if (n > 14) o.d_sanctum_level = a[14];
    if (n > 15) o.d_earth_level = a[15];
    if (n > 16) o.d_water_level = a[16];
    if (n > 17) o.d_fire_level = a[17];
    if (n > 18) o.d_air_level = a[18];
    if (n > 19) o.d_astral_level = a[19];
    if (n > 20) o.d_tower_dnum = a[20];
    if (n > 21) o.d_sokoban_dnum = a[21];
    if (n > 22) o.d_mines_dnum = a[22];
    if (n > 23) o.d_quest_dnum = a[23];
    if (n > 24) o.d_qstart_level = a[24];
    if (n > 25) o.d_qlocate_level = a[25];
    if (n > 26) o.d_nemesis_level = a[26];
    if (n > 27) o.d_knox_level = a[27];
    if (n > 28) o.d_mineend_level = a[28];
    if (n > 29) o.d_sokoend_level = a[29];
    return o;
  }
  $cp(s: struct_dgn_topology): this {
    this.d_oracle_level.$cp(s.d_oracle_level);
    this.d_bigroom_level.$cp(s.d_bigroom_level);
    this.d_rogue_level.$cp(s.d_rogue_level);
    this.d_medusa_level.$cp(s.d_medusa_level);
    this.d_stronghold_level.$cp(s.d_stronghold_level);
    this.d_valley_level.$cp(s.d_valley_level);
    this.d_wiz1_level.$cp(s.d_wiz1_level);
    this.d_wiz2_level.$cp(s.d_wiz2_level);
    this.d_wiz3_level.$cp(s.d_wiz3_level);
    this.d_juiblex_level.$cp(s.d_juiblex_level);
    this.d_orcus_level.$cp(s.d_orcus_level);
    this.d_baalzebub_level.$cp(s.d_baalzebub_level);
    this.d_asmodeus_level.$cp(s.d_asmodeus_level);
    this.d_portal_level.$cp(s.d_portal_level);
    this.d_sanctum_level.$cp(s.d_sanctum_level);
    this.d_earth_level.$cp(s.d_earth_level);
    this.d_water_level.$cp(s.d_water_level);
    this.d_fire_level.$cp(s.d_fire_level);
    this.d_air_level.$cp(s.d_air_level);
    this.d_astral_level.$cp(s.d_astral_level);
    this.d_tower_dnum = s.d_tower_dnum;
    this.d_sokoban_dnum = s.d_sokoban_dnum;
    this.d_mines_dnum = s.d_mines_dnum;
    this.d_quest_dnum = s.d_quest_dnum;
    this.d_qstart_level.$cp(s.d_qstart_level);
    this.d_qlocate_level.$cp(s.d_qlocate_level);
    this.d_nemesis_level.$cp(s.d_nemesis_level);
    this.d_knox_level.$cp(s.d_knox_level);
    this.d_mineend_level.$cp(s.d_mineend_level);
    this.d_sokoend_level.$cp(s.d_sokoend_level);
    return this;
  }
  $clone(): struct_dgn_topology { return new struct_dgn_topology().$cp(this); }
  static $size = 56;
  static $layout(): any[] { return [['d_oracle_level', 0, ['r', struct_d_level]], ['d_bigroom_level', 2, ['r', struct_d_level]], ['d_rogue_level', 4, ['r', struct_d_level]], ['d_medusa_level', 6, ['r', struct_d_level]], ['d_stronghold_level', 8, ['r', struct_d_level]], ['d_valley_level', 10, ['r', struct_d_level]], ['d_wiz1_level', 12, ['r', struct_d_level]], ['d_wiz2_level', 14, ['r', struct_d_level]], ['d_wiz3_level', 16, ['r', struct_d_level]], ['d_juiblex_level', 18, ['r', struct_d_level]], ['d_orcus_level', 20, ['r', struct_d_level]], ['d_baalzebub_level', 22, ['r', struct_d_level]], ['d_asmodeus_level', 24, ['r', struct_d_level]], ['d_portal_level', 26, ['r', struct_d_level]], ['d_sanctum_level', 28, ['r', struct_d_level]], ['d_earth_level', 30, ['r', struct_d_level]], ['d_water_level', 32, ['r', struct_d_level]], ['d_fire_level', 34, ['r', struct_d_level]], ['d_air_level', 36, ['r', struct_d_level]], ['d_astral_level', 38, ['r', struct_d_level]], ['d_tower_dnum', 40, ['i', 1, 1]], ['d_sokoban_dnum', 41, ['i', 1, 1]], ['d_mines_dnum', 42, ['i', 1, 1]], ['d_quest_dnum', 43, ['i', 1, 1]], ['d_qstart_level', 44, ['r', struct_d_level]], ['d_qlocate_level', 46, ['r', struct_d_level]], ['d_nemesis_level', 48, ['r', struct_d_level]], ['d_knox_level', 50, ['r', struct_d_level]], ['d_mineend_level', 52, ['r', struct_d_level]], ['d_sokoend_level', 54, ['r', struct_d_level]]]; }
}

/** struct dig_info: 24 bytes */
export class struct_dig_info {
  effort: number = 0;
  level: struct_d_level = new struct_d_level();
  pos: struct_nhcoord = new struct_nhcoord();
  lastdigtime: number = 0;
  down: number = 0;
  chew: number = 0;
  warned: number = 0;
  quiet: number = 0;
  static $of(...a: any[]): struct_dig_info {
    const o = new struct_dig_info();
    const n = a.length;
    if (n > 0) o.effort = a[0];
    if (n > 1) o.level = a[1];
    if (n > 2) o.pos = a[2];
    if (n > 3) o.lastdigtime = a[3];
    if (n > 4) o.down = a[4];
    if (n > 5) o.chew = a[5];
    if (n > 6) o.warned = a[6];
    if (n > 7) o.quiet = a[7];
    return o;
  }
  $cp(s: struct_dig_info): this {
    this.effort = s.effort;
    this.level.$cp(s.level);
    this.pos.$cp(s.pos);
    this.lastdigtime = s.lastdigtime;
    this.down = s.down;
    this.chew = s.chew;
    this.warned = s.warned;
    this.quiet = s.quiet;
    return this;
  }
  $clone(): struct_dig_info { return new struct_dig_info().$cp(this); }
  static $size = 24;
  static $layout(): any[] { return [['effort', 0, ['i', 4, 1]], ['level', 4, ['r', struct_d_level]], ['pos', 6, ['r', struct_nhcoord]], ['lastdigtime', 8, ['i', 8, 1]], ['down', 16, ['i', 1, 1]], ['chew', 17, ['i', 1, 1]], ['warned', 18, ['i', 1, 1]], ['quiet', 19, ['i', 1, 1]]]; }
}

/** struct dlb_directory: 32 bytes */
export class struct_dlb_directory {
  fname: any = null;
  foffset: number = 0;
  fsize: number = 0;
  handling: number = 0;
  static $of(...a: any[]): struct_dlb_directory {
    const o = new struct_dlb_directory();
    const n = a.length;
    if (n > 0) o.fname = a[0];
    if (n > 1) o.foffset = a[1];
    if (n > 2) o.fsize = a[2];
    if (n > 3) o.handling = a[3];
    return o;
  }
  $cp(s: struct_dlb_directory): this {
    this.fname = s.fname;
    this.foffset = s.foffset;
    this.fsize = s.fsize;
    this.handling = s.handling;
    return this;
  }
  $clone(): struct_dlb_directory { return new struct_dlb_directory().$cp(this); }
  static $size = 32;
  static $layout(): any[] { return [['fname', 0, ['p']], ['foffset', 8, ['i', 8, 1]], ['fsize', 16, ['i', 8, 1]], ['handling', 24, ['i', 1, 1]]]; }
}

/** struct dlb_handle: 40 bytes */
export class struct_dlb_handle {
  fp: any = null;
  lib: struct_dlb_library | null = null;
  start: number = 0;
  size: number = 0;
  mark: number = 0;
  static $of(...a: any[]): struct_dlb_handle {
    const o = new struct_dlb_handle();
    const n = a.length;
    if (n > 0) o.fp = a[0];
    if (n > 1) o.lib = a[1];
    if (n > 2) o.start = a[2];
    if (n > 3) o.size = a[3];
    if (n > 4) o.mark = a[4];
    return o;
  }
  $cp(s: struct_dlb_handle): this {
    this.fp = s.fp;
    this.lib = s.lib;
    this.start = s.start;
    this.size = s.size;
    this.mark = s.mark;
    return this;
  }
  $clone(): struct_dlb_handle { return new struct_dlb_handle().$cp(this); }
  static $size = 40;
  static $layout(): any[] { return [['fp', 0, ['p']], ['lib', 8, ['p']], ['start', 16, ['i', 8, 1]], ['size', 24, ['i', 8, 1]], ['mark', 32, ['i', 8, 1]]]; }
}

/** struct dlb_library: 56 bytes */
export class struct_dlb_library {
  fdata: any = null;
  fmark: number = 0;
  dir: struct_dlb_directory | null = null;
  sspace: any = null;
  nentries: number = 0;
  rev: number = 0;
  strsize: number = 0;
  static $of(...a: any[]): struct_dlb_library {
    const o = new struct_dlb_library();
    const n = a.length;
    if (n > 0) o.fdata = a[0];
    if (n > 1) o.fmark = a[1];
    if (n > 2) o.dir = a[2];
    if (n > 3) o.sspace = a[3];
    if (n > 4) o.nentries = a[4];
    if (n > 5) o.rev = a[5];
    if (n > 6) o.strsize = a[6];
    return o;
  }
  $cp(s: struct_dlb_library): this {
    this.fdata = s.fdata;
    this.fmark = s.fmark;
    this.dir = s.dir;
    this.sspace = s.sspace;
    this.nentries = s.nentries;
    this.rev = s.rev;
    this.strsize = s.strsize;
    return this;
  }
  $clone(): struct_dlb_library { return new struct_dlb_library().$cp(this); }
  static $size = 56;
  static $layout(): any[] { return [['fdata', 0, ['p']], ['fmark', 8, ['i', 8, 1]], ['dir', 16, ['p']], ['sspace', 24, ['p']], ['nentries', 32, ['i', 8, 1]], ['rev', 40, ['i', 8, 1]], ['strsize', 48, ['i', 8, 1]]]; }
}

/** struct dlb_procs: 72 bytes */
export class struct_dlb_procs {
  dlb_init_proc: any = null;
  dlb_cleanup_proc: any = null;
  dlb_fopen_proc: any = null;
  dlb_fclose_proc: any = null;
  dlb_fread_proc: any = null;
  dlb_fseek_proc: any = null;
  dlb_fgets_proc: any = null;
  dlb_fgetc_proc: any = null;
  dlb_ftell_proc: any = null;
  static $of(...a: any[]): struct_dlb_procs {
    const o = new struct_dlb_procs();
    const n = a.length;
    if (n > 0) o.dlb_init_proc = a[0];
    if (n > 1) o.dlb_cleanup_proc = a[1];
    if (n > 2) o.dlb_fopen_proc = a[2];
    if (n > 3) o.dlb_fclose_proc = a[3];
    if (n > 4) o.dlb_fread_proc = a[4];
    if (n > 5) o.dlb_fseek_proc = a[5];
    if (n > 6) o.dlb_fgets_proc = a[6];
    if (n > 7) o.dlb_fgetc_proc = a[7];
    if (n > 8) o.dlb_ftell_proc = a[8];
    return o;
  }
  $cp(s: struct_dlb_procs): this {
    this.dlb_init_proc = s.dlb_init_proc;
    this.dlb_cleanup_proc = s.dlb_cleanup_proc;
    this.dlb_fopen_proc = s.dlb_fopen_proc;
    this.dlb_fclose_proc = s.dlb_fclose_proc;
    this.dlb_fread_proc = s.dlb_fread_proc;
    this.dlb_fseek_proc = s.dlb_fseek_proc;
    this.dlb_fgets_proc = s.dlb_fgets_proc;
    this.dlb_fgetc_proc = s.dlb_fgetc_proc;
    this.dlb_ftell_proc = s.dlb_ftell_proc;
    return this;
  }
  $clone(): struct_dlb_procs { return new struct_dlb_procs().$cp(this); }
  static $size = 72;
  static $layout(): any[] { return [['dlb_init_proc', 0, ['p']], ['dlb_cleanup_proc', 8, ['p']], ['dlb_fopen_proc', 16, ['p']], ['dlb_fclose_proc', 24, ['p']], ['dlb_fread_proc', 32, ['p']], ['dlb_fseek_proc', 40, ['p']], ['dlb_fgets_proc', 48, ['p']], ['dlb_fgetc_proc', 56, ['p']], ['dlb_ftell_proc', 64, ['p']]]; }
}

/** struct dlevel_t: 40368 bytes */
export class struct_dlevel_t {
  locations: any[] = $arr(80, () => $sarr(struct_rm, 21));
  objects: any[] = $arr(80, () => new Array(21).fill(null));
  monsters: any[] = $arr(80, () => new Array(21).fill(null));
  objlist: struct_obj | null = null;
  buriedobjlist: struct_obj | null = null;
  monlist: struct_monst | null = null;
  damagelist: struct_damage | null = null;
  bonesinfo: struct_cemetery | null = null;
  flags: struct_levelflags = new struct_levelflags();
  static $of(...a: any[]): struct_dlevel_t {
    const o = new struct_dlevel_t();
    const n = a.length;
    if (n > 0) o.locations = a[0];
    if (n > 1) o.objects = a[1];
    if (n > 2) o.monsters = a[2];
    if (n > 3) o.objlist = a[3];
    if (n > 4) o.buriedobjlist = a[4];
    if (n > 5) o.monlist = a[5];
    if (n > 6) o.damagelist = a[6];
    if (n > 7) o.bonesinfo = a[7];
    if (n > 8) o.flags = a[8];
    return o;
  }
  $cp(s: struct_dlevel_t): this {
    $cparr(this.locations, s.locations);
    $cpvals(this.objects, s.objects);
    $cpvals(this.monsters, s.monsters);
    this.objlist = s.objlist;
    this.buriedobjlist = s.buriedobjlist;
    this.monlist = s.monlist;
    this.damagelist = s.damagelist;
    this.bonesinfo = s.bonesinfo;
    this.flags.$cp(s.flags);
    return this;
  }
  $clone(): struct_dlevel_t { return new struct_dlevel_t().$cp(this); }
  static $size = 40368;
  static $layout(): any[] { return [['locations', 0, ['a', ['a', ['r', struct_rm], 21], 80]], ['objects', 13440, ['a', ['a', ['p'], 21], 80]], ['monsters', 26880, ['a', ['a', ['p'], 21], 80]], ['objlist', 40320, ['p']], ['buriedobjlist', 40328, ['p']], ['monlist', 40336, ['p']], ['damagelist', 40344, ['p']], ['bonesinfo', 40352, ['p']], ['flags', 40360, ['r', struct_levelflags]]]; }
}

/** struct dungeon: 56 bytes */
export class struct_dungeon {
  dname: Int8Array = new Int8Array(24);
  proto: Int8Array = new Int8Array(15);
  boneid: number = 0;
  flags: struct_d_flags = new struct_d_flags();
  entry_lev: number = 0;
  num_dunlevs: number = 0;
  dunlev_ureached: number = 0;
  ledger_start: number = 0;
  depth_start: number = 0;
  static $of(...a: any[]): struct_dungeon {
    const o = new struct_dungeon();
    const n = a.length;
    if (n > 0) o.dname = a[0];
    if (n > 1) o.proto = a[1];
    if (n > 2) o.boneid = a[2];
    if (n > 3) o.flags = a[3];
    if (n > 4) o.entry_lev = a[4];
    if (n > 5) o.num_dunlevs = a[5];
    if (n > 6) o.dunlev_ureached = a[6];
    if (n > 7) o.ledger_start = a[7];
    if (n > 8) o.depth_start = a[8];
    return o;
  }
  $cp(s: struct_dungeon): this {
    this.dname.set(s.dname);
    this.proto.set(s.proto);
    this.boneid = s.boneid;
    this.flags.$cp(s.flags);
    this.entry_lev = s.entry_lev;
    this.num_dunlevs = s.num_dunlevs;
    this.dunlev_ureached = s.dunlev_ureached;
    this.ledger_start = s.ledger_start;
    this.depth_start = s.depth_start;
    return this;
  }
  $clone(): struct_dungeon { return new struct_dungeon().$cp(this); }
  static $size = 56;
  static $layout(): any[] { return [['dname', 0, ['a', ['i', 1, 1], 24]], ['proto', 24, ['a', ['i', 1, 1], 15]], ['boneid', 39, ['i', 1, 1]], ['flags', 40, ['r', struct_d_flags]], ['entry_lev', 44, ['i', 1, 1]], ['num_dunlevs', 45, ['i', 1, 1]], ['dunlev_ureached', 46, ['i', 1, 1]], ['ledger_start', 48, ['i', 4, 1]], ['depth_start', 52, ['i', 4, 1]]]; }
}

/** struct early_opt: 24 bytes */
export class struct_early_opt {
  e: number = 0;
  name: any = null;
  minlength: number = 0;
  valallowed: number = 0;
  static $of(...a: any[]): struct_early_opt {
    const o = new struct_early_opt();
    const n = a.length;
    if (n > 0) o.e = a[0];
    if (n > 1) o.name = a[1];
    if (n > 2) o.minlength = a[2];
    if (n > 3) o.valallowed = a[3];
    return o;
  }
  $cp(s: struct_early_opt): this {
    this.e = s.e;
    this.name = s.name;
    this.minlength = s.minlength;
    this.valallowed = s.valallowed;
    return this;
  }
  $clone(): struct_early_opt { return new struct_early_opt().$cp(this); }
  static $size = 24;
  static $layout(): any[] { return [['e', 0, ['i', 4, 1]], ['name', 8, ['p']], ['minlength', 16, ['i', 4, 1]], ['valallowed', 20, ['i', 1, 1]]]; }
}

/** struct edog: 56 bytes */
export class struct_edog {
  droptime: number = 0;
  dropdist: number = 0;
  apport: number = 0;
  whistletime: number = 0;
  hungrytime: number = 0;
  ogoal: struct_nhcoord = new struct_nhcoord();
  abuse: number = 0;
  revivals: number = 0;
  mhpmax_penalty: number = 0;
  killed_by_u: number = 0;
  static $of(...a: any[]): struct_edog {
    const o = new struct_edog();
    const n = a.length;
    if (n > 0) o.droptime = a[0];
    if (n > 1) o.dropdist = a[1];
    if (n > 2) o.apport = a[2];
    if (n > 3) o.whistletime = a[3];
    if (n > 4) o.hungrytime = a[4];
    if (n > 5) o.ogoal = a[5];
    if (n > 6) o.abuse = a[6];
    if (n > 7) o.revivals = a[7];
    if (n > 8) o.mhpmax_penalty = a[8];
    if (n > 9) o.killed_by_u = a[9];
    return o;
  }
  $cp(s: struct_edog): this {
    this.droptime = s.droptime;
    this.dropdist = s.dropdist;
    this.apport = s.apport;
    this.whistletime = s.whistletime;
    this.hungrytime = s.hungrytime;
    this.ogoal.$cp(s.ogoal);
    this.abuse = s.abuse;
    this.revivals = s.revivals;
    this.mhpmax_penalty = s.mhpmax_penalty;
    this.killed_by_u = s.killed_by_u;
    return this;
  }
  $clone(): struct_edog { return new struct_edog().$cp(this); }
  static $size = 56;
  static $layout(): any[] { return [['droptime', 0, ['i', 8, 1]], ['dropdist', 8, ['i', 4, 0]], ['apport', 12, ['i', 4, 1]], ['whistletime', 16, ['i', 8, 1]], ['hungrytime', 24, ['i', 8, 1]], ['ogoal', 32, ['r', struct_nhcoord]], ['abuse', 36, ['i', 4, 1]], ['revivals', 40, ['i', 4, 1]], ['mhpmax_penalty', 44, ['i', 4, 1]], ['killed_by_u', 48, ['b', 0, 1, 0]]]; }
}

/** struct egd: 324 bytes */
export class struct_egd {
  fcbeg: number = 0;
  fcend: number = 0;
  vroom: number = 0;
  gdx: number = 0;
  gdy: number = 0;
  ogx: number = 0;
  ogy: number = 0;
  gdlevel: struct_d_level = new struct_d_level();
  warncnt: number = 0;
  gddone: number = 0;
  witness: number = 0;
  unused: number = 0;
  fakecorr: any[] = $sarr(struct_fakecorridor, 101);
  static $of(...a: any[]): struct_egd {
    const o = new struct_egd();
    const n = a.length;
    if (n > 0) o.fcbeg = a[0];
    if (n > 1) o.fcend = a[1];
    if (n > 2) o.vroom = a[2];
    if (n > 3) o.gdx = a[3];
    if (n > 4) o.gdy = a[4];
    if (n > 5) o.ogx = a[5];
    if (n > 6) o.ogy = a[6];
    if (n > 7) o.gdlevel = a[7];
    if (n > 8) o.warncnt = a[8];
    if (n > 9) o.gddone = a[9];
    if (n > 10) o.witness = a[10];
    if (n > 11) o.unused = a[11];
    if (n > 12) o.fakecorr = a[12];
    return o;
  }
  $cp(s: struct_egd): this {
    this.fcbeg = s.fcbeg;
    this.fcend = s.fcend;
    this.vroom = s.vroom;
    this.gdx = s.gdx;
    this.gdy = s.gdy;
    this.ogx = s.ogx;
    this.ogy = s.ogy;
    this.gdlevel.$cp(s.gdlevel);
    this.warncnt = s.warncnt;
    this.gddone = s.gddone;
    this.witness = s.witness;
    this.unused = s.unused;
    $cparr(this.fakecorr, s.fakecorr);
    return this;
  }
  $clone(): struct_egd { return new struct_egd().$cp(this); }
  static $size = 324;
  static $layout(): any[] { return [['fcbeg', 0, ['i', 4, 1]], ['fcend', 4, ['i', 4, 1]], ['vroom', 8, ['i', 4, 1]], ['gdx', 12, ['i', 1, 1]], ['gdy', 13, ['i', 1, 1]], ['ogx', 14, ['i', 1, 1]], ['ogy', 15, ['i', 1, 1]], ['gdlevel', 16, ['r', struct_d_level]], ['warncnt', 18, ['i', 1, 1]], ['gddone', 19, ['b', 0, 1, 0]], ['witness', 19, ['b', 1, 2, 0]], ['unused', 19, ['b', 3, 5, 0]], ['fakecorr', 20, ['a', ['r', struct_fakecorridor], 101]]]; }
}

/** struct emin: 2 bytes */
export class struct_emin {
  min_align: number = 0;
  renegade: number = 0;
  static $of(...a: any[]): struct_emin {
    const o = new struct_emin();
    const n = a.length;
    if (n > 0) o.min_align = a[0];
    if (n > 1) o.renegade = a[1];
    return o;
  }
  $cp(s: struct_emin): this {
    this.min_align = s.min_align;
    this.renegade = s.renegade;
    return this;
  }
  $clone(): struct_emin { return new struct_emin().$cp(this); }
  static $size = 2;
  static $layout(): any[] { return [['min_align', 0, ['i', 1, 1]], ['renegade', 1, ['i', 1, 1]]]; }
}

/** struct engr: 40 bytes */
export class struct_engr {
  nxt_engr: struct_engr | null = null;
  engr_txt: any = null;
  engr_x: number = 0;
  engr_y: number = 0;
  engr_lth: number = 0;
  engr_time: number = 0;
  engr_type: number = 0;
  static $of(...a: any[]): struct_engr {
    const o = new struct_engr();
    const n = a.length;
    if (n > 0) o.nxt_engr = a[0];
    if (n > 1) o.engr_txt = a[1];
    if (n > 2) o.engr_x = a[2];
    if (n > 3) o.engr_y = a[3];
    if (n > 4) o.engr_lth = a[4];
    if (n > 5) o.engr_time = a[5];
    if (n > 6) o.engr_type = a[6];
    return o;
  }
  $cp(s: struct_engr): this {
    this.nxt_engr = s.nxt_engr;
    this.engr_txt = s.engr_txt;
    this.engr_x = s.engr_x;
    this.engr_y = s.engr_y;
    this.engr_lth = s.engr_lth;
    this.engr_time = s.engr_time;
    this.engr_type = s.engr_type;
    return this;
  }
  $clone(): struct_engr { return new struct_engr().$cp(this); }
  static $size = 40;
  static $layout(): any[] { return [['nxt_engr', 0, ['p']], ['engr_txt', 8, ['p']], ['engr_x', 16, ['i', 1, 1]], ['engr_y', 17, ['i', 1, 1]], ['engr_lth', 20, ['i', 4, 0]], ['engr_time', 24, ['i', 8, 1]], ['engr_type', 32, ['i', 1, 1]]]; }
}

/** struct entity: 24 bytes */
export class struct_entity {
  emon: struct_monst | null = null;
  edata: struct_permonst | null = null;
  ex: number = 0;
  ey: number = 0;
  static $of(...a: any[]): struct_entity {
    const o = new struct_entity();
    const n = a.length;
    if (n > 0) o.emon = a[0];
    if (n > 1) o.edata = a[1];
    if (n > 2) o.ex = a[2];
    if (n > 3) o.ey = a[3];
    return o;
  }
  $cp(s: struct_entity): this {
    this.emon = s.emon;
    this.edata = s.edata;
    this.ex = s.ex;
    this.ey = s.ey;
    return this;
  }
  $clone(): struct_entity { return new struct_entity().$cp(this); }
  static $size = 24;
  static $layout(): any[] { return [['emon', 0, ['p']], ['edata', 8, ['p']], ['ex', 16, ['i', 4, 1]], ['ey', 20, ['i', 4, 1]]]; }
}

/** struct epri: 40 bytes */
export class struct_epri {
  shralign: number = 0;
  shroom: number = 0;
  shrpos: struct_nhcoord = new struct_nhcoord();
  shrlevel: struct_d_level = new struct_d_level();
  intone_time: number = 0;
  enter_time: number = 0;
  hostile_time: number = 0;
  peaceful_time: number = 0;
  static $of(...a: any[]): struct_epri {
    const o = new struct_epri();
    const n = a.length;
    if (n > 0) o.shralign = a[0];
    if (n > 1) o.shroom = a[1];
    if (n > 2) o.shrpos = a[2];
    if (n > 3) o.shrlevel = a[3];
    if (n > 4) o.intone_time = a[4];
    if (n > 5) o.enter_time = a[5];
    if (n > 6) o.hostile_time = a[6];
    if (n > 7) o.peaceful_time = a[7];
    return o;
  }
  $cp(s: struct_epri): this {
    this.shralign = s.shralign;
    this.shroom = s.shroom;
    this.shrpos.$cp(s.shrpos);
    this.shrlevel.$cp(s.shrlevel);
    this.intone_time = s.intone_time;
    this.enter_time = s.enter_time;
    this.hostile_time = s.hostile_time;
    this.peaceful_time = s.peaceful_time;
    return this;
  }
  $clone(): struct_epri { return new struct_epri().$cp(this); }
  static $size = 40;
  static $layout(): any[] { return [['shralign', 0, ['i', 1, 1]], ['shroom', 1, ['i', 1, 1]], ['shrpos', 2, ['r', struct_nhcoord]], ['shrlevel', 4, ['r', struct_d_level]], ['intone_time', 8, ['i', 8, 1]], ['enter_time', 16, ['i', 8, 1]], ['hostile_time', 24, ['i', 8, 1]], ['peaceful_time', 32, ['i', 8, 1]]]; }
}

/** struct eshk: 4936 bytes */
export class struct_eshk {
  robbed: number = 0;
  credit: number = 0;
  debit: number = 0;
  loan: number = 0;
  shoptype: number = 0;
  shoproom: number = 0;
  unused: number = 0;
  following: number = 0;
  surcharge: number = 0;
  dismiss_kops: number = 0;
  shk: struct_nhcoord = new struct_nhcoord();
  shd: struct_nhcoord = new struct_nhcoord();
  shoplevel: struct_d_level = new struct_d_level();
  billct: number = 0;
  bill: any[] = $sarr(struct_bill_x, 200);
  bill_p: struct_bill_x | null = null;
  visitct: number = 0;
  customer: Int8Array = new Int8Array(32);
  shknam: Int8Array = new Int8Array(32);
  static $of(...a: any[]): struct_eshk {
    const o = new struct_eshk();
    const n = a.length;
    if (n > 0) o.robbed = a[0];
    if (n > 1) o.credit = a[1];
    if (n > 2) o.debit = a[2];
    if (n > 3) o.loan = a[3];
    if (n > 4) o.shoptype = a[4];
    if (n > 5) o.shoproom = a[5];
    if (n > 6) o.unused = a[6];
    if (n > 7) o.following = a[7];
    if (n > 8) o.surcharge = a[8];
    if (n > 9) o.dismiss_kops = a[9];
    if (n > 10) o.shk = a[10];
    if (n > 11) o.shd = a[11];
    if (n > 12) o.shoplevel = a[12];
    if (n > 13) o.billct = a[13];
    if (n > 14) o.bill = a[14];
    if (n > 15) o.bill_p = a[15];
    if (n > 16) o.visitct = a[16];
    if (n > 17) o.customer = a[17];
    if (n > 18) o.shknam = a[18];
    return o;
  }
  $cp(s: struct_eshk): this {
    this.robbed = s.robbed;
    this.credit = s.credit;
    this.debit = s.debit;
    this.loan = s.loan;
    this.shoptype = s.shoptype;
    this.shoproom = s.shoproom;
    this.unused = s.unused;
    this.following = s.following;
    this.surcharge = s.surcharge;
    this.dismiss_kops = s.dismiss_kops;
    this.shk.$cp(s.shk);
    this.shd.$cp(s.shd);
    this.shoplevel.$cp(s.shoplevel);
    this.billct = s.billct;
    $cparr(this.bill, s.bill);
    this.bill_p = s.bill_p;
    this.visitct = s.visitct;
    this.customer.set(s.customer);
    this.shknam.set(s.shknam);
    return this;
  }
  $clone(): struct_eshk { return new struct_eshk().$cp(this); }
  static $size = 4936;
  static $layout(): any[] { return [['robbed', 0, ['i', 8, 1]], ['credit', 8, ['i', 8, 1]], ['debit', 16, ['i', 8, 1]], ['loan', 24, ['i', 8, 1]], ['shoptype', 32, ['i', 4, 1]], ['shoproom', 36, ['i', 1, 1]], ['unused', 37, ['i', 1, 1]], ['following', 38, ['i', 1, 1]], ['surcharge', 39, ['i', 1, 1]], ['dismiss_kops', 40, ['i', 1, 1]], ['shk', 41, ['r', struct_nhcoord]], ['shd', 43, ['r', struct_nhcoord]], ['shoplevel', 45, ['r', struct_d_level]], ['billct', 48, ['i', 4, 1]], ['bill', 56, ['a', ['r', struct_bill_x], 200]], ['bill_p', 4856, ['p']], ['visitct', 4864, ['i', 4, 1]], ['customer', 4868, ['a', ['i', 1, 1], 32]], ['shknam', 4900, ['a', ['i', 1, 1], 32]]]; }
}

/** struct ext_func_tab: 48 bytes */
export class struct_ext_func_tab {
  key: number = 0;
  ef_txt: any = null;
  ef_desc: any = null;
  ef_funct: any = null;
  flags: number = 0;
  f_text: any = null;
  static $of(...a: any[]): struct_ext_func_tab {
    const o = new struct_ext_func_tab();
    const n = a.length;
    if (n > 0) o.key = a[0];
    if (n > 1) o.ef_txt = a[1];
    if (n > 2) o.ef_desc = a[2];
    if (n > 3) o.ef_funct = a[3];
    if (n > 4) o.flags = a[4];
    if (n > 5) o.f_text = a[5];
    return o;
  }
  $cp(s: struct_ext_func_tab): this {
    this.key = s.key;
    this.ef_txt = s.ef_txt;
    this.ef_desc = s.ef_desc;
    this.ef_funct = s.ef_funct;
    this.flags = s.flags;
    this.f_text = s.f_text;
    return this;
  }
  $clone(): struct_ext_func_tab { return new struct_ext_func_tab().$cp(this); }
  static $size = 48;
  static $layout(): any[] { return [['key', 0, ['i', 1, 0]], ['ef_txt', 8, ['p']], ['ef_desc', 16, ['p']], ['ef_funct', 24, ['p']], ['flags', 32, ['i', 4, 1]], ['f_text', 40, ['p']]]; }
}

/** struct fakecorridor: 3 bytes */
export class struct_fakecorridor {
  fx: number = 0;
  fy: number = 0;
  ftyp: number = 0;
  static $of(...a: any[]): struct_fakecorridor {
    const o = new struct_fakecorridor();
    const n = a.length;
    if (n > 0) o.fx = a[0];
    if (n > 1) o.fy = a[1];
    if (n > 2) o.ftyp = a[2];
    return o;
  }
  $cp(s: struct_fakecorridor): this {
    this.fx = s.fx;
    this.fy = s.fy;
    this.ftyp = s.ftyp;
    return this;
  }
  $clone(): struct_fakecorridor { return new struct_fakecorridor().$cp(this); }
  static $size = 3;
  static $layout(): any[] { return [['fx', 0, ['i', 1, 1]], ['fy', 1, ['i', 1, 1]], ['ftyp', 2, ['i', 1, 1]]]; }
}

/** struct fe: 48 bytes */
export class struct_fe {
  next: struct_fe | null = null;
  timeout: number = 0;
  tid: number = 0;
  kind: number = 0;
  func_index: number = 0;
  arg: union_any = new union_any();
  needs_fixup: number = 0;
  static $of(...a: any[]): struct_fe {
    const o = new struct_fe();
    const n = a.length;
    if (n > 0) o.next = a[0];
    if (n > 1) o.timeout = a[1];
    if (n > 2) o.tid = a[2];
    if (n > 3) o.kind = a[3];
    if (n > 4) o.func_index = a[4];
    if (n > 5) o.arg = a[5];
    if (n > 6) o.needs_fixup = a[6];
    return o;
  }
  $cp(s: struct_fe): this {
    this.next = s.next;
    this.timeout = s.timeout;
    this.tid = s.tid;
    this.kind = s.kind;
    this.func_index = s.func_index;
    this.arg.$cp(s.arg);
    this.needs_fixup = s.needs_fixup;
    return this;
  }
  $clone(): struct_fe { return new struct_fe().$cp(this); }
  static $size = 48;
  static $layout(): any[] { return [['next', 0, ['p']], ['timeout', 8, ['i', 8, 1]], ['tid', 16, ['i', 8, 0]], ['kind', 24, ['i', 2, 1]], ['func_index', 26, ['i', 2, 1]], ['arg', 32, ['r', union_any]], ['needs_fixup', 40, ['b', 0, 1, 0]]]; }
}

/** struct fieldid_t: 16 bytes */
export class struct_fieldid_t {
  fieldname: any = null;
  fldid: number = 0;
  static $of(...a: any[]): struct_fieldid_t {
    const o = new struct_fieldid_t();
    const n = a.length;
    if (n > 0) o.fieldname = a[0];
    if (n > 1) o.fldid = a[1];
    return o;
  }
  $cp(s: struct_fieldid_t): this {
    this.fieldname = s.fieldname;
    this.fldid = s.fldid;
    return this;
  }
  $clone(): struct_fieldid_t { return new struct_fieldid_t().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['fieldname', 0, ['p']], ['fldid', 8, ['i', 4, 1]]]; }
}

/** struct flag: 160 bytes */
export class struct_flag {
  acoustics: number = 0;
  autodig: number = 0;
  autoquiver: number = 0;
  autoopen: number = 0;
  beginner: number = 0;
  biff: number = 0;
  bones: number = 0;
  confirm: number = 0;
  dark_room: number = 0;
  debug: number = 0;
  end_own: number = 0;
  explore: number = 0;
  female: number = 0;
  friday13: number = 0;
  help: number = 0;
  ignintr: number = 0;
  ins_chkpt: number = 0;
  invlet_constant: number = 0;
  legacy: number = 0;
  lit_corridor: number = 0;
  nap: number = 0;
  null: number = 0;
  p__obsolete: number = 0;
  pickup: number = 0;
  pickup_thrown: number = 0;
  pushweapon: number = 0;
  rest_on_space: number = 0;
  safe_dog: number = 0;
  showexp: number = 0;
  showscore: number = 0;
  silent: number = 0;
  sortloot: number = 0;
  sortpack: number = 0;
  sparkle: number = 0;
  standout: number = 0;
  time: number = 0;
  tombstone: number = 0;
  verbose: number = 0;
  end_top: number = 0;
  end_around: number = 0;
  moonphase: number = 0;
  suppress_alert: number = 0;
  paranoia_bits: number = 0;
  pickup_burden: number = 0;
  pile_limit: number = 0;
  inv_order: Int8Array = new Int8Array(18);
  pickup_types: Int8Array = new Int8Array(18);
  end_disclose: Int8Array = new Int8Array(7);
  menu_style: number = 0;
  made_fruit: number = 0;
  initrole: number = 0;
  initrace: number = 0;
  initgend: number = 0;
  initalign: number = 0;
  randomall: number = 0;
  pantheon: number = 0;
  lootabc: number = 0;
  showrace: number = 0;
  travelcmd: number = 0;
  runmode: number = 0;
  static $of(...a: any[]): struct_flag {
    const o = new struct_flag();
    const n = a.length;
    if (n > 0) o.acoustics = a[0];
    if (n > 1) o.autodig = a[1];
    if (n > 2) o.autoquiver = a[2];
    if (n > 3) o.autoopen = a[3];
    if (n > 4) o.beginner = a[4];
    if (n > 5) o.biff = a[5];
    if (n > 6) o.bones = a[6];
    if (n > 7) o.confirm = a[7];
    if (n > 8) o.dark_room = a[8];
    if (n > 9) o.debug = a[9];
    if (n > 10) o.end_own = a[10];
    if (n > 11) o.explore = a[11];
    if (n > 12) o.female = a[12];
    if (n > 13) o.friday13 = a[13];
    if (n > 14) o.help = a[14];
    if (n > 15) o.ignintr = a[15];
    if (n > 16) o.ins_chkpt = a[16];
    if (n > 17) o.invlet_constant = a[17];
    if (n > 18) o.legacy = a[18];
    if (n > 19) o.lit_corridor = a[19];
    if (n > 20) o.nap = a[20];
    if (n > 21) o.null = a[21];
    if (n > 22) o.p__obsolete = a[22];
    if (n > 23) o.pickup = a[23];
    if (n > 24) o.pickup_thrown = a[24];
    if (n > 25) o.pushweapon = a[25];
    if (n > 26) o.rest_on_space = a[26];
    if (n > 27) o.safe_dog = a[27];
    if (n > 28) o.showexp = a[28];
    if (n > 29) o.showscore = a[29];
    if (n > 30) o.silent = a[30];
    if (n > 31) o.sortloot = a[31];
    if (n > 32) o.sortpack = a[32];
    if (n > 33) o.sparkle = a[33];
    if (n > 34) o.standout = a[34];
    if (n > 35) o.time = a[35];
    if (n > 36) o.tombstone = a[36];
    if (n > 37) o.verbose = a[37];
    if (n > 38) o.end_top = a[38];
    if (n > 39) o.end_around = a[39];
    if (n > 40) o.moonphase = a[40];
    if (n > 41) o.suppress_alert = a[41];
    if (n > 42) o.paranoia_bits = a[42];
    if (n > 43) o.pickup_burden = a[43];
    if (n > 44) o.pile_limit = a[44];
    if (n > 45) o.inv_order = a[45];
    if (n > 46) o.pickup_types = a[46];
    if (n > 47) o.end_disclose = a[47];
    if (n > 48) o.menu_style = a[48];
    if (n > 49) o.made_fruit = a[49];
    if (n > 50) o.initrole = a[50];
    if (n > 51) o.initrace = a[51];
    if (n > 52) o.initgend = a[52];
    if (n > 53) o.initalign = a[53];
    if (n > 54) o.randomall = a[54];
    if (n > 55) o.pantheon = a[55];
    if (n > 56) o.lootabc = a[56];
    if (n > 57) o.showrace = a[57];
    if (n > 58) o.travelcmd = a[58];
    if (n > 59) o.runmode = a[59];
    return o;
  }
  $cp(s: struct_flag): this {
    this.acoustics = s.acoustics;
    this.autodig = s.autodig;
    this.autoquiver = s.autoquiver;
    this.autoopen = s.autoopen;
    this.beginner = s.beginner;
    this.biff = s.biff;
    this.bones = s.bones;
    this.confirm = s.confirm;
    this.dark_room = s.dark_room;
    this.debug = s.debug;
    this.end_own = s.end_own;
    this.explore = s.explore;
    this.female = s.female;
    this.friday13 = s.friday13;
    this.help = s.help;
    this.ignintr = s.ignintr;
    this.ins_chkpt = s.ins_chkpt;
    this.invlet_constant = s.invlet_constant;
    this.legacy = s.legacy;
    this.lit_corridor = s.lit_corridor;
    this.nap = s.nap;
    this.null = s.null;
    this.p__obsolete = s.p__obsolete;
    this.pickup = s.pickup;
    this.pickup_thrown = s.pickup_thrown;
    this.pushweapon = s.pushweapon;
    this.rest_on_space = s.rest_on_space;
    this.safe_dog = s.safe_dog;
    this.showexp = s.showexp;
    this.showscore = s.showscore;
    this.silent = s.silent;
    this.sortloot = s.sortloot;
    this.sortpack = s.sortpack;
    this.sparkle = s.sparkle;
    this.standout = s.standout;
    this.time = s.time;
    this.tombstone = s.tombstone;
    this.verbose = s.verbose;
    this.end_top = s.end_top;
    this.end_around = s.end_around;
    this.moonphase = s.moonphase;
    this.suppress_alert = s.suppress_alert;
    this.paranoia_bits = s.paranoia_bits;
    this.pickup_burden = s.pickup_burden;
    this.pile_limit = s.pile_limit;
    this.inv_order.set(s.inv_order);
    this.pickup_types.set(s.pickup_types);
    this.end_disclose.set(s.end_disclose);
    this.menu_style = s.menu_style;
    this.made_fruit = s.made_fruit;
    this.initrole = s.initrole;
    this.initrace = s.initrace;
    this.initgend = s.initgend;
    this.initalign = s.initalign;
    this.randomall = s.randomall;
    this.pantheon = s.pantheon;
    this.lootabc = s.lootabc;
    this.showrace = s.showrace;
    this.travelcmd = s.travelcmd;
    this.runmode = s.runmode;
    return this;
  }
  $clone(): struct_flag { return new struct_flag().$cp(this); }
  static $size = 160;
  static $layout(): any[] { return [['acoustics', 0, ['i', 1, 1]], ['autodig', 1, ['i', 1, 1]], ['autoquiver', 2, ['i', 1, 1]], ['autoopen', 3, ['i', 1, 1]], ['beginner', 4, ['i', 1, 1]], ['biff', 5, ['i', 1, 1]], ['bones', 6, ['i', 1, 1]], ['confirm', 7, ['i', 1, 1]], ['dark_room', 8, ['i', 1, 1]], ['debug', 9, ['i', 1, 1]], ['end_own', 10, ['i', 1, 1]], ['explore', 11, ['i', 1, 1]], ['female', 12, ['i', 1, 1]], ['friday13', 13, ['i', 1, 1]], ['help', 14, ['i', 1, 1]], ['ignintr', 15, ['i', 1, 1]], ['ins_chkpt', 16, ['i', 1, 1]], ['invlet_constant', 17, ['i', 1, 1]], ['legacy', 18, ['i', 1, 1]], ['lit_corridor', 19, ['i', 1, 1]], ['nap', 20, ['i', 1, 1]], ['null', 21, ['i', 1, 1]], ['p__obsolete', 22, ['i', 1, 1]], ['pickup', 23, ['i', 1, 1]], ['pickup_thrown', 24, ['i', 1, 1]], ['pushweapon', 25, ['i', 1, 1]], ['rest_on_space', 26, ['i', 1, 1]], ['safe_dog', 27, ['i', 1, 1]], ['showexp', 28, ['i', 1, 1]], ['showscore', 29, ['i', 1, 1]], ['silent', 30, ['i', 1, 1]], ['sortloot', 31, ['i', 1, 1]], ['sortpack', 32, ['i', 1, 1]], ['sparkle', 33, ['i', 1, 1]], ['standout', 34, ['i', 1, 1]], ['time', 35, ['i', 1, 1]], ['tombstone', 36, ['i', 1, 1]], ['verbose', 37, ['i', 1, 1]], ['end_top', 40, ['i', 4, 1]], ['end_around', 44, ['i', 4, 1]], ['moonphase', 48, ['i', 4, 0]], ['suppress_alert', 56, ['i', 8, 0]], ['paranoia_bits', 64, ['i', 4, 0]], ['pickup_burden', 68, ['i', 4, 1]], ['pile_limit', 72, ['i', 4, 1]], ['inv_order', 76, ['a', ['i', 1, 1], 18]], ['pickup_types', 94, ['a', ['i', 1, 1], 18]], ['end_disclose', 112, ['a', ['i', 1, 1], 7]], ['menu_style', 119, ['i', 1, 1]], ['made_fruit', 120, ['i', 1, 1]], ['initrole', 124, ['i', 4, 1]], ['initrace', 128, ['i', 4, 1]], ['initgend', 132, ['i', 4, 1]], ['initalign', 136, ['i', 4, 1]], ['randomall', 140, ['i', 4, 1]], ['pantheon', 144, ['i', 4, 1]], ['lootabc', 148, ['i', 1, 1]], ['showrace', 149, ['i', 1, 1]], ['travelcmd', 150, ['i', 1, 1]], ['runmode', 152, ['i', 4, 1]]]; }
}

/** struct flock: 32 bytes */
export class struct_flock {
  l_type: number = 0;
  l_whence: number = 0;
  l_start: number = 0;
  l_len: number = 0;
  l_pid: number = 0;
  static $of(...a: any[]): struct_flock {
    const o = new struct_flock();
    const n = a.length;
    if (n > 0) o.l_type = a[0];
    if (n > 1) o.l_whence = a[1];
    if (n > 2) o.l_start = a[2];
    if (n > 3) o.l_len = a[3];
    if (n > 4) o.l_pid = a[4];
    return o;
  }
  $cp(s: struct_flock): this {
    this.l_type = s.l_type;
    this.l_whence = s.l_whence;
    this.l_start = s.l_start;
    this.l_len = s.l_len;
    this.l_pid = s.l_pid;
    return this;
  }
  $clone(): struct_flock { return new struct_flock().$cp(this); }
  static $size = 32;
  static $layout(): any[] { return [['l_type', 0, ['i', 2, 1]], ['l_whence', 2, ['i', 2, 1]], ['l_start', 8, ['i', 8, 1]], ['l_len', 16, ['i', 8, 1]], ['l_pid', 24, ['i', 4, 1]]]; }
}

/** struct fruit: 48 bytes */
export class struct_fruit {
  fname: Int8Array = new Int8Array(32);
  fid: number = 0;
  nextf: struct_fruit | null = null;
  static $of(...a: any[]): struct_fruit {
    const o = new struct_fruit();
    const n = a.length;
    if (n > 0) o.fname = a[0];
    if (n > 1) o.fid = a[1];
    if (n > 2) o.nextf = a[2];
    return o;
  }
  $cp(s: struct_fruit): this {
    this.fname.set(s.fname);
    this.fid = s.fid;
    this.nextf = s.nextf;
    return this;
  }
  $clone(): struct_fruit { return new struct_fruit().$cp(this); }
  static $size = 48;
  static $layout(): any[] { return [['fname', 0, ['a', ['i', 1, 1], 32]], ['fid', 32, ['i', 4, 1]], ['nextf', 40, ['p']]]; }
}

/** struct gbuf_entry: 8 bytes */
export class struct_gbuf_entry {
  new: number = 0;
  glyph: number = 0;
  static $of(...a: any[]): struct_gbuf_entry {
    const o = new struct_gbuf_entry();
    const n = a.length;
    if (n > 0) o.new = a[0];
    if (n > 1) o.glyph = a[1];
    return o;
  }
  $cp(s: struct_gbuf_entry): this {
    this.new = s.new;
    this.glyph = s.glyph;
    return this;
  }
  $clone(): struct_gbuf_entry { return new struct_gbuf_entry().$cp(this); }
  static $size = 8;
  static $layout(): any[] { return [['new', 0, ['i', 1, 1]], ['glyph', 4, ['i', 4, 1]]]; }
}

/** struct h2o_ctx: 12 bytes */
export class struct_h2o_ctx {
  dkn_boom: number = 0;
  unk_boom: number = 0;
  ctx_valid: number = 0;
  static $of(...a: any[]): struct_h2o_ctx {
    const o = new struct_h2o_ctx();
    const n = a.length;
    if (n > 0) o.dkn_boom = a[0];
    if (n > 1) o.unk_boom = a[1];
    if (n > 2) o.ctx_valid = a[2];
    return o;
  }
  $cp(s: struct_h2o_ctx): this {
    this.dkn_boom = s.dkn_boom;
    this.unk_boom = s.unk_boom;
    this.ctx_valid = s.ctx_valid;
    return this;
  }
  $clone(): struct_h2o_ctx { return new struct_h2o_ctx().$cp(this); }
  static $size = 12;
  static $layout(): any[] { return [['dkn_boom', 0, ['i', 4, 1]], ['unk_boom', 4, ['i', 4, 1]], ['ctx_valid', 8, ['i', 1, 1]]]; }
}

/** struct hilite_s: 128 bytes */
export class struct_hilite_s {
  fld: number = 0;
  set: number = 0;
  anytype: number = 0;
  value: union_any = new union_any();
  behavior: number = 0;
  textmatch: Int8Array = new Int8Array(80);
  rel: number = 0;
  coloridx: number = 0;
  next: struct_hilite_s | null = null;
  static $of(...a: any[]): struct_hilite_s {
    const o = new struct_hilite_s();
    const n = a.length;
    if (n > 0) o.fld = a[0];
    if (n > 1) o.set = a[1];
    if (n > 2) o.anytype = a[2];
    if (n > 3) o.value = a[3];
    if (n > 4) o.behavior = a[4];
    if (n > 5) o.textmatch = a[5];
    if (n > 6) o.rel = a[6];
    if (n > 7) o.coloridx = a[7];
    if (n > 8) o.next = a[8];
    return o;
  }
  $cp(s: struct_hilite_s): this {
    this.fld = s.fld;
    this.set = s.set;
    this.anytype = s.anytype;
    this.value.$cp(s.value);
    this.behavior = s.behavior;
    this.textmatch.set(s.textmatch);
    this.rel = s.rel;
    this.coloridx = s.coloridx;
    this.next = s.next;
    return this;
  }
  $clone(): struct_hilite_s { return new struct_hilite_s().$cp(this); }
  static $size = 128;
  static $layout(): any[] { return [['fld', 0, ['i', 4, 1]], ['set', 4, ['i', 1, 1]], ['anytype', 8, ['i', 4, 0]], ['value', 16, ['r', union_any]], ['behavior', 24, ['i', 4, 1]], ['textmatch', 28, ['a', ['i', 1, 1], 80]], ['rel', 108, ['i', 4, 1]], ['coloridx', 112, ['i', 4, 1]], ['next', 120, ['p']]]; }
}

/** struct icp: 8 bytes */
export class struct_icp {
  iprob: number = 0;
  iclass: number = 0;
  static $of(...a: any[]): struct_icp {
    const o = new struct_icp();
    const n = a.length;
    if (n > 0) o.iprob = a[0];
    if (n > 1) o.iclass = a[1];
    return o;
  }
  $cp(s: struct_icp): this {
    this.iprob = s.iprob;
    this.iclass = s.iclass;
    return this;
  }
  $clone(): struct_icp { return new struct_icp().$cp(this); }
  static $size = 8;
  static $layout(): any[] { return [['iprob', 0, ['i', 4, 1]], ['iclass', 4, ['i', 1, 1]]]; }
}

/** struct innate: 32 bytes */
export class struct_innate {
  ulevel: number = 0;
  ability: any = null;
  gainstr: any = null;
  losestr: any = null;
  static $of(...a: any[]): struct_innate {
    const o = new struct_innate();
    const n = a.length;
    if (n > 0) o.ulevel = a[0];
    if (n > 1) o.ability = a[1];
    if (n > 2) o.gainstr = a[2];
    if (n > 3) o.losestr = a[3];
    return o;
  }
  $cp(s: struct_innate): this {
    this.ulevel = s.ulevel;
    this.ability = s.ability;
    this.gainstr = s.gainstr;
    this.losestr = s.losestr;
    return this;
  }
  $clone(): struct_innate { return new struct_innate().$cp(this); }
  static $size = 32;
  static $layout(): any[] { return [['ulevel', 0, ['i', 1, 1]], ['ability', 8, ['p']], ['gainstr', 16, ['p']], ['losestr', 24, ['p']]]; }
}

/** struct instance_flags: 392 bytes */
export class struct_instance_flags {
  debug_fuzzer: number = 0;
  defer_plname: number = 0;
  herecmd_menu: number = 0;
  invis_goldsym: number = 0;
  at_midnight: number = 0;
  at_night: number = 0;
  failing_untrap: number = 0;
  in_lava_effects: number = 0;
  last_msg: number = 0;
  override_ID: number = 0;
  parse_config_file_src: number = 0;
  purge_monsters: number = 0;
  suppress_price: number = 0;
  terrainmode: number = 0;
  getloc_travelmode: number = 0;
  getloc_filter: number = 0;
  getloc_usemenu: number = 0;
  getloc_moveskip: number = 0;
  travelcc: struct_nhcoord = new struct_nhcoord();
  trav_debug: number = 0;
  window_inited: number = 0;
  vision_inited: number = 0;
  sanity_check: number = 0;
  mon_polycontrol: number = 0;
  in_dumplog: number = 0;
  in_parse: number = 0;
  initoptions_noterminate: number = 0;
  msg_history: number = 0;
  getpos_coords: number = 0;
  menu_headings: number = 0;
  opt_booldup: any = null;
  opt_compdup: any = null;
  altmeta: number = 0;
  autodescribe: number = 0;
  cbreak: number = 0;
  deferred_X: number = 0;
  echo: number = 0;
  force_invmenu: number = 0;
  goldX: number = 0;
  hilite_pile: number = 0;
  implicit_uncursed: number = 0;
  mention_walls: number = 0;
  menu_head_objsym: number = 0;
  menu_overlay: number = 0;
  menu_requested: number = 0;
  menu_tab_sep: number = 0;
  news: number = 0;
  num_pad: number = 0;
  perm_invent: number = 0;
  renameallowed: number = 0;
  renameinprogress: number = 0;
  status_updates: number = 0;
  toptenwin: number = 0;
  use_background_glyph: number = 0;
  use_menu_color: number = 0;
  hilite_delta: number = 0;
  unhilite_deadline: number = 0;
  zerocomp: number = 0;
  rlecomp: number = 0;
  num_pad_mode: number = 0;
  cursesgraphics: number = 0;
  bouldersym: number = 0;
  prevmsg_window: number = 0;
  extmenu: number = 0;
  clicklook: number = 0;
  cmdassist: number = 0;
  time_botl: number = 0;
  wizweight: number = 0;
  wc_color: number = 0;
  wc_hilite_pet: number = 0;
  wc_ascii_map: number = 0;
  wc_tiled_map: number = 0;
  wc_preload_tiles: number = 0;
  wc_tile_width: number = 0;
  wc_tile_height: number = 0;
  wc_tile_file: any = null;
  wc_inverse: number = 0;
  wc_align_status: number = 0;
  wc_align_message: number = 0;
  wc_vary_msgcount: number = 0;
  wc_foregrnd_menu: any = null;
  wc_backgrnd_menu: any = null;
  wc_foregrnd_message: any = null;
  wc_backgrnd_message: any = null;
  wc_foregrnd_status: any = null;
  wc_backgrnd_status: any = null;
  wc_foregrnd_text: any = null;
  wc_backgrnd_text: any = null;
  wc_font_map: any = null;
  wc_font_message: any = null;
  wc_font_status: any = null;
  wc_font_menu: any = null;
  wc_font_text: any = null;
  wc_fontsiz_map: number = 0;
  wc_fontsiz_message: number = 0;
  wc_fontsiz_status: number = 0;
  wc_fontsiz_menu: number = 0;
  wc_fontsiz_text: number = 0;
  wc_scroll_amount: number = 0;
  wc_scroll_margin: number = 0;
  wc_map_mode: number = 0;
  wc_player_selection: number = 0;
  wc_splash_screen: number = 0;
  wc_popup_dialog: number = 0;
  wc_eight_bit_input: number = 0;
  wc2_fullscreen: number = 0;
  wc2_softkeyboard: number = 0;
  wc2_wraptext: number = 0;
  wc2_selectsaved: number = 0;
  wc2_darkgray: number = 0;
  wc2_hitpointbar: number = 0;
  wc2_guicolor: number = 0;
  wc_mouse_support: number = 0;
  wc2_term_cols: number = 0;
  wc2_term_rows: number = 0;
  wc2_statuslines: number = 0;
  wc2_windowborders: number = 0;
  wc2_petattr: number = 0;
  save_uswallow: number = 0;
  save_uinwater: number = 0;
  save_uburied: number = 0;
  mines_prize_type: number = 0;
  soko_prize_type1: number = 0;
  soko_prize_type2: number = 0;
  debug: struct_debug_flags = new struct_debug_flags();
  windowtype_locked: number = 0;
  windowtype_deferred: number = 0;
  returning_missile: any = null;
  obsolete: number = 0;
  static $of(...a: any[]): struct_instance_flags {
    const o = new struct_instance_flags();
    const n = a.length;
    if (n > 0) o.debug_fuzzer = a[0];
    if (n > 1) o.defer_plname = a[1];
    if (n > 2) o.herecmd_menu = a[2];
    if (n > 3) o.invis_goldsym = a[3];
    if (n > 4) o.at_midnight = a[4];
    if (n > 5) o.at_night = a[5];
    if (n > 6) o.failing_untrap = a[6];
    if (n > 7) o.in_lava_effects = a[7];
    if (n > 8) o.last_msg = a[8];
    if (n > 9) o.override_ID = a[9];
    if (n > 10) o.parse_config_file_src = a[10];
    if (n > 11) o.purge_monsters = a[11];
    if (n > 12) o.suppress_price = a[12];
    if (n > 13) o.terrainmode = a[13];
    if (n > 14) o.getloc_travelmode = a[14];
    if (n > 15) o.getloc_filter = a[15];
    if (n > 16) o.getloc_usemenu = a[16];
    if (n > 17) o.getloc_moveskip = a[17];
    if (n > 18) o.travelcc = a[18];
    if (n > 19) o.trav_debug = a[19];
    if (n > 20) o.window_inited = a[20];
    if (n > 21) o.vision_inited = a[21];
    if (n > 22) o.sanity_check = a[22];
    if (n > 23) o.mon_polycontrol = a[23];
    if (n > 24) o.in_dumplog = a[24];
    if (n > 25) o.in_parse = a[25];
    if (n > 26) o.initoptions_noterminate = a[26];
    if (n > 27) o.msg_history = a[27];
    if (n > 28) o.getpos_coords = a[28];
    if (n > 29) o.menu_headings = a[29];
    if (n > 30) o.opt_booldup = a[30];
    if (n > 31) o.opt_compdup = a[31];
    if (n > 32) o.altmeta = a[32];
    if (n > 33) o.autodescribe = a[33];
    if (n > 34) o.cbreak = a[34];
    if (n > 35) o.deferred_X = a[35];
    if (n > 36) o.echo = a[36];
    if (n > 37) o.force_invmenu = a[37];
    if (n > 38) o.goldX = a[38];
    if (n > 39) o.hilite_pile = a[39];
    if (n > 40) o.implicit_uncursed = a[40];
    if (n > 41) o.mention_walls = a[41];
    if (n > 42) o.menu_head_objsym = a[42];
    if (n > 43) o.menu_overlay = a[43];
    if (n > 44) o.menu_requested = a[44];
    if (n > 45) o.menu_tab_sep = a[45];
    if (n > 46) o.news = a[46];
    if (n > 47) o.num_pad = a[47];
    if (n > 48) o.perm_invent = a[48];
    if (n > 49) o.renameallowed = a[49];
    if (n > 50) o.renameinprogress = a[50];
    if (n > 51) o.status_updates = a[51];
    if (n > 52) o.toptenwin = a[52];
    if (n > 53) o.use_background_glyph = a[53];
    if (n > 54) o.use_menu_color = a[54];
    if (n > 55) o.hilite_delta = a[55];
    if (n > 56) o.unhilite_deadline = a[56];
    if (n > 57) o.zerocomp = a[57];
    if (n > 58) o.rlecomp = a[58];
    if (n > 59) o.num_pad_mode = a[59];
    if (n > 60) o.cursesgraphics = a[60];
    if (n > 61) o.bouldersym = a[61];
    if (n > 62) o.prevmsg_window = a[62];
    if (n > 63) o.extmenu = a[63];
    if (n > 64) o.clicklook = a[64];
    if (n > 65) o.cmdassist = a[65];
    if (n > 66) o.time_botl = a[66];
    if (n > 67) o.wizweight = a[67];
    if (n > 68) o.wc_color = a[68];
    if (n > 69) o.wc_hilite_pet = a[69];
    if (n > 70) o.wc_ascii_map = a[70];
    if (n > 71) o.wc_tiled_map = a[71];
    if (n > 72) o.wc_preload_tiles = a[72];
    if (n > 73) o.wc_tile_width = a[73];
    if (n > 74) o.wc_tile_height = a[74];
    if (n > 75) o.wc_tile_file = a[75];
    if (n > 76) o.wc_inverse = a[76];
    if (n > 77) o.wc_align_status = a[77];
    if (n > 78) o.wc_align_message = a[78];
    if (n > 79) o.wc_vary_msgcount = a[79];
    if (n > 80) o.wc_foregrnd_menu = a[80];
    if (n > 81) o.wc_backgrnd_menu = a[81];
    if (n > 82) o.wc_foregrnd_message = a[82];
    if (n > 83) o.wc_backgrnd_message = a[83];
    if (n > 84) o.wc_foregrnd_status = a[84];
    if (n > 85) o.wc_backgrnd_status = a[85];
    if (n > 86) o.wc_foregrnd_text = a[86];
    if (n > 87) o.wc_backgrnd_text = a[87];
    if (n > 88) o.wc_font_map = a[88];
    if (n > 89) o.wc_font_message = a[89];
    if (n > 90) o.wc_font_status = a[90];
    if (n > 91) o.wc_font_menu = a[91];
    if (n > 92) o.wc_font_text = a[92];
    if (n > 93) o.wc_fontsiz_map = a[93];
    if (n > 94) o.wc_fontsiz_message = a[94];
    if (n > 95) o.wc_fontsiz_status = a[95];
    if (n > 96) o.wc_fontsiz_menu = a[96];
    if (n > 97) o.wc_fontsiz_text = a[97];
    if (n > 98) o.wc_scroll_amount = a[98];
    if (n > 99) o.wc_scroll_margin = a[99];
    if (n > 100) o.wc_map_mode = a[100];
    if (n > 101) o.wc_player_selection = a[101];
    if (n > 102) o.wc_splash_screen = a[102];
    if (n > 103) o.wc_popup_dialog = a[103];
    if (n > 104) o.wc_eight_bit_input = a[104];
    if (n > 105) o.wc2_fullscreen = a[105];
    if (n > 106) o.wc2_softkeyboard = a[106];
    if (n > 107) o.wc2_wraptext = a[107];
    if (n > 108) o.wc2_selectsaved = a[108];
    if (n > 109) o.wc2_darkgray = a[109];
    if (n > 110) o.wc2_hitpointbar = a[110];
    if (n > 111) o.wc2_guicolor = a[111];
    if (n > 112) o.wc_mouse_support = a[112];
    if (n > 113) o.wc2_term_cols = a[113];
    if (n > 114) o.wc2_term_rows = a[114];
    if (n > 115) o.wc2_statuslines = a[115];
    if (n > 116) o.wc2_windowborders = a[116];
    if (n > 117) o.wc2_petattr = a[117];
    if (n > 118) o.save_uswallow = a[118];
    if (n > 119) o.save_uinwater = a[119];
    if (n > 120) o.save_uburied = a[120];
    if (n > 121) o.mines_prize_type = a[121];
    if (n > 122) o.soko_prize_type1 = a[122];
    if (n > 123) o.soko_prize_type2 = a[123];
    if (n > 124) o.debug = a[124];
    if (n > 125) o.windowtype_locked = a[125];
    if (n > 126) o.windowtype_deferred = a[126];
    if (n > 127) o.returning_missile = a[127];
    if (n > 128) o.obsolete = a[128];
    return o;
  }
  $cp(s: struct_instance_flags): this {
    this.debug_fuzzer = s.debug_fuzzer;
    this.defer_plname = s.defer_plname;
    this.herecmd_menu = s.herecmd_menu;
    this.invis_goldsym = s.invis_goldsym;
    this.at_midnight = s.at_midnight;
    this.at_night = s.at_night;
    this.failing_untrap = s.failing_untrap;
    this.in_lava_effects = s.in_lava_effects;
    this.last_msg = s.last_msg;
    this.override_ID = s.override_ID;
    this.parse_config_file_src = s.parse_config_file_src;
    this.purge_monsters = s.purge_monsters;
    this.suppress_price = s.suppress_price;
    this.terrainmode = s.terrainmode;
    this.getloc_travelmode = s.getloc_travelmode;
    this.getloc_filter = s.getloc_filter;
    this.getloc_usemenu = s.getloc_usemenu;
    this.getloc_moveskip = s.getloc_moveskip;
    this.travelcc.$cp(s.travelcc);
    this.trav_debug = s.trav_debug;
    this.window_inited = s.window_inited;
    this.vision_inited = s.vision_inited;
    this.sanity_check = s.sanity_check;
    this.mon_polycontrol = s.mon_polycontrol;
    this.in_dumplog = s.in_dumplog;
    this.in_parse = s.in_parse;
    this.initoptions_noterminate = s.initoptions_noterminate;
    this.msg_history = s.msg_history;
    this.getpos_coords = s.getpos_coords;
    this.menu_headings = s.menu_headings;
    this.opt_booldup = s.opt_booldup;
    this.opt_compdup = s.opt_compdup;
    this.altmeta = s.altmeta;
    this.autodescribe = s.autodescribe;
    this.cbreak = s.cbreak;
    this.deferred_X = s.deferred_X;
    this.echo = s.echo;
    this.force_invmenu = s.force_invmenu;
    this.goldX = s.goldX;
    this.hilite_pile = s.hilite_pile;
    this.implicit_uncursed = s.implicit_uncursed;
    this.mention_walls = s.mention_walls;
    this.menu_head_objsym = s.menu_head_objsym;
    this.menu_overlay = s.menu_overlay;
    this.menu_requested = s.menu_requested;
    this.menu_tab_sep = s.menu_tab_sep;
    this.news = s.news;
    this.num_pad = s.num_pad;
    this.perm_invent = s.perm_invent;
    this.renameallowed = s.renameallowed;
    this.renameinprogress = s.renameinprogress;
    this.status_updates = s.status_updates;
    this.toptenwin = s.toptenwin;
    this.use_background_glyph = s.use_background_glyph;
    this.use_menu_color = s.use_menu_color;
    this.hilite_delta = s.hilite_delta;
    this.unhilite_deadline = s.unhilite_deadline;
    this.zerocomp = s.zerocomp;
    this.rlecomp = s.rlecomp;
    this.num_pad_mode = s.num_pad_mode;
    this.cursesgraphics = s.cursesgraphics;
    this.bouldersym = s.bouldersym;
    this.prevmsg_window = s.prevmsg_window;
    this.extmenu = s.extmenu;
    this.clicklook = s.clicklook;
    this.cmdassist = s.cmdassist;
    this.time_botl = s.time_botl;
    this.wizweight = s.wizweight;
    this.wc_color = s.wc_color;
    this.wc_hilite_pet = s.wc_hilite_pet;
    this.wc_ascii_map = s.wc_ascii_map;
    this.wc_tiled_map = s.wc_tiled_map;
    this.wc_preload_tiles = s.wc_preload_tiles;
    this.wc_tile_width = s.wc_tile_width;
    this.wc_tile_height = s.wc_tile_height;
    this.wc_tile_file = s.wc_tile_file;
    this.wc_inverse = s.wc_inverse;
    this.wc_align_status = s.wc_align_status;
    this.wc_align_message = s.wc_align_message;
    this.wc_vary_msgcount = s.wc_vary_msgcount;
    this.wc_foregrnd_menu = s.wc_foregrnd_menu;
    this.wc_backgrnd_menu = s.wc_backgrnd_menu;
    this.wc_foregrnd_message = s.wc_foregrnd_message;
    this.wc_backgrnd_message = s.wc_backgrnd_message;
    this.wc_foregrnd_status = s.wc_foregrnd_status;
    this.wc_backgrnd_status = s.wc_backgrnd_status;
    this.wc_foregrnd_text = s.wc_foregrnd_text;
    this.wc_backgrnd_text = s.wc_backgrnd_text;
    this.wc_font_map = s.wc_font_map;
    this.wc_font_message = s.wc_font_message;
    this.wc_font_status = s.wc_font_status;
    this.wc_font_menu = s.wc_font_menu;
    this.wc_font_text = s.wc_font_text;
    this.wc_fontsiz_map = s.wc_fontsiz_map;
    this.wc_fontsiz_message = s.wc_fontsiz_message;
    this.wc_fontsiz_status = s.wc_fontsiz_status;
    this.wc_fontsiz_menu = s.wc_fontsiz_menu;
    this.wc_fontsiz_text = s.wc_fontsiz_text;
    this.wc_scroll_amount = s.wc_scroll_amount;
    this.wc_scroll_margin = s.wc_scroll_margin;
    this.wc_map_mode = s.wc_map_mode;
    this.wc_player_selection = s.wc_player_selection;
    this.wc_splash_screen = s.wc_splash_screen;
    this.wc_popup_dialog = s.wc_popup_dialog;
    this.wc_eight_bit_input = s.wc_eight_bit_input;
    this.wc2_fullscreen = s.wc2_fullscreen;
    this.wc2_softkeyboard = s.wc2_softkeyboard;
    this.wc2_wraptext = s.wc2_wraptext;
    this.wc2_selectsaved = s.wc2_selectsaved;
    this.wc2_darkgray = s.wc2_darkgray;
    this.wc2_hitpointbar = s.wc2_hitpointbar;
    this.wc2_guicolor = s.wc2_guicolor;
    this.wc_mouse_support = s.wc_mouse_support;
    this.wc2_term_cols = s.wc2_term_cols;
    this.wc2_term_rows = s.wc2_term_rows;
    this.wc2_statuslines = s.wc2_statuslines;
    this.wc2_windowborders = s.wc2_windowborders;
    this.wc2_petattr = s.wc2_petattr;
    this.save_uswallow = s.save_uswallow;
    this.save_uinwater = s.save_uinwater;
    this.save_uburied = s.save_uburied;
    this.mines_prize_type = s.mines_prize_type;
    this.soko_prize_type1 = s.soko_prize_type1;
    this.soko_prize_type2 = s.soko_prize_type2;
    this.debug.$cp(s.debug);
    this.windowtype_locked = s.windowtype_locked;
    this.windowtype_deferred = s.windowtype_deferred;
    this.returning_missile = s.returning_missile;
    this.obsolete = s.obsolete;
    return this;
  }
  $clone(): struct_instance_flags { return new struct_instance_flags().$cp(this); }
  static $size = 392;
  static $layout(): any[] { return [['debug_fuzzer', 0, ['i', 1, 1]], ['defer_plname', 1, ['i', 1, 1]], ['herecmd_menu', 2, ['i', 1, 1]], ['invis_goldsym', 3, ['i', 1, 1]], ['at_midnight', 4, ['i', 4, 1]], ['at_night', 8, ['i', 4, 1]], ['failing_untrap', 12, ['i', 4, 1]], ['in_lava_effects', 16, ['i', 4, 1]], ['last_msg', 20, ['i', 4, 1]], ['override_ID', 24, ['i', 4, 1]], ['parse_config_file_src', 28, ['i', 4, 1]], ['purge_monsters', 32, ['i', 4, 1]], ['suppress_price', 36, ['i', 4, 1]], ['terrainmode', 40, ['i', 4, 1]], ['getloc_travelmode', 44, ['i', 1, 1]], ['getloc_filter', 48, ['i', 4, 1]], ['getloc_usemenu', 52, ['i', 1, 1]], ['getloc_moveskip', 53, ['i', 1, 1]], ['travelcc', 54, ['r', struct_nhcoord]], ['trav_debug', 56, ['i', 1, 1]], ['window_inited', 57, ['i', 1, 1]], ['vision_inited', 58, ['i', 1, 1]], ['sanity_check', 59, ['i', 1, 1]], ['mon_polycontrol', 60, ['i', 1, 1]], ['in_dumplog', 61, ['i', 1, 1]], ['in_parse', 62, ['i', 1, 1]], ['initoptions_noterminate', 63, ['i', 1, 1]], ['msg_history', 64, ['i', 4, 0]], ['getpos_coords', 68, ['i', 4, 1]], ['menu_headings', 72, ['i', 4, 1]], ['opt_booldup', 80, ['p']], ['opt_compdup', 88, ['p']], ['altmeta', 96, ['i', 1, 1]], ['autodescribe', 97, ['i', 1, 1]], ['cbreak', 98, ['i', 1, 1]], ['deferred_X', 99, ['i', 1, 1]], ['echo', 100, ['i', 1, 1]], ['force_invmenu', 101, ['i', 1, 1]], ['goldX', 102, ['i', 1, 1]], ['hilite_pile', 103, ['i', 1, 1]], ['implicit_uncursed', 104, ['i', 1, 1]], ['mention_walls', 105, ['i', 1, 1]], ['menu_head_objsym', 106, ['i', 1, 1]], ['menu_overlay', 107, ['i', 1, 1]], ['menu_requested', 108, ['i', 1, 1]], ['menu_tab_sep', 109, ['i', 1, 1]], ['news', 110, ['i', 1, 1]], ['num_pad', 111, ['i', 1, 1]], ['perm_invent', 112, ['i', 1, 1]], ['renameallowed', 113, ['i', 1, 1]], ['renameinprogress', 114, ['i', 1, 1]], ['status_updates', 115, ['i', 1, 1]], ['toptenwin', 116, ['i', 1, 1]], ['use_background_glyph', 117, ['i', 1, 1]], ['use_menu_color', 118, ['i', 1, 1]], ['hilite_delta', 120, ['i', 8, 1]], ['unhilite_deadline', 128, ['i', 8, 1]], ['zerocomp', 136, ['i', 1, 1]], ['rlecomp', 137, ['i', 1, 1]], ['num_pad_mode', 138, ['i', 1, 0]], ['cursesgraphics', 139, ['i', 1, 1]], ['bouldersym', 140, ['i', 1, 0]], ['prevmsg_window', 141, ['i', 1, 1]], ['extmenu', 142, ['i', 1, 1]], ['clicklook', 143, ['i', 1, 1]], ['cmdassist', 144, ['i', 1, 1]], ['time_botl', 145, ['i', 1, 1]], ['wizweight', 146, ['i', 1, 1]], ['wc_color', 147, ['i', 1, 1]], ['wc_hilite_pet', 148, ['i', 1, 1]], ['wc_ascii_map', 149, ['i', 1, 1]], ['wc_tiled_map', 150, ['i', 1, 1]], ['wc_preload_tiles', 151, ['i', 1, 1]], ['wc_tile_width', 152, ['i', 4, 1]], ['wc_tile_height', 156, ['i', 4, 1]], ['wc_tile_file', 160, ['p']], ['wc_inverse', 168, ['i', 1, 1]], ['wc_align_status', 172, ['i', 4, 1]], ['wc_align_message', 176, ['i', 4, 1]], ['wc_vary_msgcount', 180, ['i', 4, 1]], ['wc_foregrnd_menu', 184, ['p']], ['wc_backgrnd_menu', 192, ['p']], ['wc_foregrnd_message', 200, ['p']], ['wc_backgrnd_message', 208, ['p']], ['wc_foregrnd_status', 216, ['p']], ['wc_backgrnd_status', 224, ['p']], ['wc_foregrnd_text', 232, ['p']], ['wc_backgrnd_text', 240, ['p']], ['wc_font_map', 248, ['p']], ['wc_font_message', 256, ['p']], ['wc_font_status', 264, ['p']], ['wc_font_menu', 272, ['p']], ['wc_font_text', 280, ['p']], ['wc_fontsiz_map', 288, ['i', 4, 1]], ['wc_fontsiz_message', 292, ['i', 4, 1]], ['wc_fontsiz_status', 296, ['i', 4, 1]], ['wc_fontsiz_menu', 300, ['i', 4, 1]], ['wc_fontsiz_text', 304, ['i', 4, 1]], ['wc_scroll_amount', 308, ['i', 4, 1]], ['wc_scroll_margin', 312, ['i', 4, 1]], ['wc_map_mode', 316, ['i', 4, 1]], ['wc_player_selection', 320, ['i', 4, 1]], ['wc_splash_screen', 324, ['i', 1, 1]], ['wc_popup_dialog', 325, ['i', 1, 1]], ['wc_eight_bit_input', 326, ['i', 1, 1]], ['wc2_fullscreen', 327, ['i', 1, 1]], ['wc2_softkeyboard', 328, ['i', 1, 1]], ['wc2_wraptext', 329, ['i', 1, 1]], ['wc2_selectsaved', 330, ['i', 1, 1]], ['wc2_darkgray', 331, ['i', 1, 1]], ['wc2_hitpointbar', 332, ['i', 1, 1]], ['wc2_guicolor', 333, ['i', 1, 1]], ['wc_mouse_support', 336, ['i', 4, 1]], ['wc2_term_cols', 340, ['i', 4, 1]], ['wc2_term_rows', 344, ['i', 4, 1]], ['wc2_statuslines', 348, ['i', 4, 1]], ['wc2_windowborders', 352, ['i', 4, 1]], ['wc2_petattr', 356, ['i', 4, 1]], ['save_uswallow', 360, ['b', 0, 1, 0]], ['save_uinwater', 360, ['b', 1, 1, 0]], ['save_uburied', 360, ['b', 2, 1, 0]], ['mines_prize_type', 362, ['i', 2, 1]], ['soko_prize_type1', 364, ['i', 2, 1]], ['soko_prize_type2', 366, ['i', 2, 1]], ['debug', 368, ['r', struct_debug_flags]], ['windowtype_locked', 370, ['i', 1, 1]], ['windowtype_deferred', 371, ['i', 1, 1]], ['returning_missile', 376, ['p']], ['obsolete', 384, ['i', 1, 1]]]; }
}

/** struct inv_sub: 6 bytes */
export class struct_inv_sub {
  race_pm: number = 0;
  item_otyp: number = 0;
  subs_otyp: number = 0;
  static $of(...a: any[]): struct_inv_sub {
    const o = new struct_inv_sub();
    const n = a.length;
    if (n > 0) o.race_pm = a[0];
    if (n > 1) o.item_otyp = a[1];
    if (n > 2) o.subs_otyp = a[2];
    return o;
  }
  $cp(s: struct_inv_sub): this {
    this.race_pm = s.race_pm;
    this.item_otyp = s.item_otyp;
    this.subs_otyp = s.subs_otyp;
    return this;
  }
  $clone(): struct_inv_sub { return new struct_inv_sub().$cp(this); }
  static $size = 6;
  static $layout(): any[] { return [['race_pm', 0, ['i', 2, 1]], ['item_otyp', 2, ['i', 2, 1]], ['subs_otyp', 4, ['i', 2, 1]]]; }
}

/** struct isaac64_ctx: 4128 bytes */
export class struct_isaac64_ctx {
  n: number = 0;
  r: Float64Array = new Float64Array(256);
  m: Float64Array = new Float64Array(256);
  a: number = 0;
  b: number = 0;
  c: number = 0;
  static $of(...a: any[]): struct_isaac64_ctx {
    const o = new struct_isaac64_ctx();
    const n = a.length;
    if (n > 0) o.n = a[0];
    if (n > 1) o.r = a[1];
    if (n > 2) o.m = a[2];
    if (n > 3) o.a = a[3];
    if (n > 4) o.b = a[4];
    if (n > 5) o.c = a[5];
    return o;
  }
  $cp(s: struct_isaac64_ctx): this {
    this.n = s.n;
    this.r.set(s.r);
    this.m.set(s.m);
    this.a = s.a;
    this.b = s.b;
    this.c = s.c;
    return this;
  }
  $clone(): struct_isaac64_ctx { return new struct_isaac64_ctx().$cp(this); }
  static $size = 4128;
  static $layout(): any[] { return [['n', 0, ['i', 4, 0]], ['r', 8, ['a', ['i', 8, 0], 256]], ['m', 2056, ['a', ['i', 8, 0], 256]], ['a', 4104, ['i', 8, 0]], ['b', 4112, ['i', 8, 0]], ['c', 4120, ['i', 8, 0]]]; }
}

/** struct istat_s: 80 bytes */
export class struct_istat_s {
  fldname: any = null;
  fldfmt: any = null;
  time: number = 0;
  chg: number = 0;
  percent_matters: number = 0;
  percent_value: number = 0;
  anytype: number = 0;
  a: union_any = new union_any();
  val: any = null;
  valwidth: number = 0;
  idxmax: number = 0;
  fld: number = 0;
  hilite_rule: struct_hilite_s | null = null;
  thresholds: struct_hilite_s | null = null;
  static $of(...a: any[]): struct_istat_s {
    const o = new struct_istat_s();
    const n = a.length;
    if (n > 0) o.fldname = a[0];
    if (n > 1) o.fldfmt = a[1];
    if (n > 2) o.time = a[2];
    if (n > 3) o.chg = a[3];
    if (n > 4) o.percent_matters = a[4];
    if (n > 5) o.percent_value = a[5];
    if (n > 6) o.anytype = a[6];
    if (n > 7) o.a = a[7];
    if (n > 8) o.val = a[8];
    if (n > 9) o.valwidth = a[9];
    if (n > 10) o.idxmax = a[10];
    if (n > 11) o.fld = a[11];
    if (n > 12) o.hilite_rule = a[12];
    if (n > 13) o.thresholds = a[13];
    return o;
  }
  $cp(s: struct_istat_s): this {
    this.fldname = s.fldname;
    this.fldfmt = s.fldfmt;
    this.time = s.time;
    this.chg = s.chg;
    this.percent_matters = s.percent_matters;
    this.percent_value = s.percent_value;
    this.anytype = s.anytype;
    this.a.$cp(s.a);
    this.val = s.val;
    this.valwidth = s.valwidth;
    this.idxmax = s.idxmax;
    this.fld = s.fld;
    this.hilite_rule = s.hilite_rule;
    this.thresholds = s.thresholds;
    return this;
  }
  $clone(): struct_istat_s { return new struct_istat_s().$cp(this); }
  static $size = 80;
  static $layout(): any[] { return [['fldname', 0, ['p']], ['fldfmt', 8, ['p']], ['time', 16, ['i', 8, 1]], ['chg', 24, ['i', 1, 1]], ['percent_matters', 25, ['i', 1, 1]], ['percent_value', 26, ['i', 2, 1]], ['anytype', 28, ['i', 4, 0]], ['a', 32, ['r', union_any]], ['val', 40, ['p']], ['valwidth', 48, ['i', 4, 1]], ['idxmax', 52, ['i', 4, 1]], ['fld', 56, ['i', 4, 1]], ['hilite_rule', 64, ['p']], ['thresholds', 72, ['p']]]; }
}

/** struct itp: 8 bytes */
export class struct_itp {
  iprob: number = 0;
  itype: number = 0;
  static $of(...a: any[]): struct_itp {
    const o = new struct_itp();
    const n = a.length;
    if (n > 0) o.iprob = a[0];
    if (n > 1) o.itype = a[1];
    return o;
  }
  $cp(s: struct_itp): this {
    this.iprob = s.iprob;
    this.itype = s.itype;
    return this;
  }
  $clone(): struct_itp { return new struct_itp().$cp(this); }
  static $size = 8;
  static $layout(): any[] { return [['iprob', 0, ['i', 4, 1]], ['itype', 4, ['i', 4, 1]]]; }
}

/** struct kinfo: 272 bytes */
export class struct_kinfo {
  next: struct_kinfo | null = null;
  id: number = 0;
  format: number = 0;
  name: Int8Array = new Int8Array(256);
  static $of(...a: any[]): struct_kinfo {
    const o = new struct_kinfo();
    const n = a.length;
    if (n > 0) o.next = a[0];
    if (n > 1) o.id = a[1];
    if (n > 2) o.format = a[2];
    if (n > 3) o.name = a[3];
    return o;
  }
  $cp(s: struct_kinfo): this {
    this.next = s.next;
    this.id = s.id;
    this.format = s.format;
    this.name.set(s.name);
    return this;
  }
  $clone(): struct_kinfo { return new struct_kinfo().$cp(this); }
  static $size = 272;
  static $layout(): any[] { return [['next', 0, ['p']], ['id', 8, ['i', 4, 1]], ['format', 12, ['i', 4, 1]], ['name', 16, ['a', ['i', 1, 1], 256]]]; }
}

/** struct lchoice: 1544 bytes */
export class struct_lchoice {
  idx: number = 0;
  lev: Int8Array = new Int8Array(512);
  playerlev: Int8Array = new Int8Array(512);
  dgn: Int8Array = new Int8Array(512);
  menuletter: number = 0;
  static $of(...a: any[]): struct_lchoice {
    const o = new struct_lchoice();
    const n = a.length;
    if (n > 0) o.idx = a[0];
    if (n > 1) o.lev = a[1];
    if (n > 2) o.playerlev = a[2];
    if (n > 3) o.dgn = a[3];
    if (n > 4) o.menuletter = a[4];
    return o;
  }
  $cp(s: struct_lchoice): this {
    this.idx = s.idx;
    this.lev.set(s.lev);
    this.playerlev.set(s.playerlev);
    this.dgn.set(s.dgn);
    this.menuletter = s.menuletter;
    return this;
  }
  $clone(): struct_lchoice { return new struct_lchoice().$cp(this); }
  static $size = 1544;
  static $layout(): any[] { return [['idx', 0, ['i', 4, 1]], ['lev', 4, ['a', ['i', 1, 1], 512]], ['playerlev', 516, ['a', ['i', 1, 1], 512]], ['dgn', 1028, ['a', ['i', 1, 1], 512]], ['menuletter', 1540, ['i', 1, 1]]]; }
}

/** struct lev_init: 32 bytes */
export class struct_lev_init {
  init_style: number = 0;
  flags: number = 0;
  filling: number = 0;
  init_present: number = 0;
  padding: number = 0;
  fg: number = 0;
  bg: number = 0;
  smoothed: number = 0;
  joined: number = 0;
  lit: number = 0;
  walled: number = 0;
  icedpools: number = 0;
  static $of(...a: any[]): struct_lev_init {
    const o = new struct_lev_init();
    const n = a.length;
    if (n > 0) o.init_style = a[0];
    if (n > 1) o.flags = a[1];
    if (n > 2) o.filling = a[2];
    if (n > 3) o.init_present = a[3];
    if (n > 4) o.padding = a[4];
    if (n > 5) o.fg = a[5];
    if (n > 6) o.bg = a[6];
    if (n > 7) o.smoothed = a[7];
    if (n > 8) o.joined = a[8];
    if (n > 9) o.lit = a[9];
    if (n > 10) o.walled = a[10];
    if (n > 11) o.icedpools = a[11];
    return o;
  }
  $cp(s: struct_lev_init): this {
    this.init_style = s.init_style;
    this.flags = s.flags;
    this.filling = s.filling;
    this.init_present = s.init_present;
    this.padding = s.padding;
    this.fg = s.fg;
    this.bg = s.bg;
    this.smoothed = s.smoothed;
    this.joined = s.joined;
    this.lit = s.lit;
    this.walled = s.walled;
    this.icedpools = s.icedpools;
    return this;
  }
  $clone(): struct_lev_init { return new struct_lev_init().$cp(this); }
  static $size = 32;
  static $layout(): any[] { return [['init_style', 0, ['i', 1, 1]], ['flags', 8, ['i', 8, 1]], ['filling', 16, ['i', 1, 1]], ['init_present', 17, ['i', 1, 1]], ['padding', 18, ['i', 1, 1]], ['fg', 19, ['i', 1, 1]], ['bg', 20, ['i', 1, 1]], ['smoothed', 21, ['i', 1, 1]], ['joined', 22, ['i', 1, 1]], ['lit', 23, ['i', 1, 1]], ['walled', 24, ['i', 1, 1]], ['icedpools', 25, ['i', 1, 1]]]; }
}

/** struct lev_region: 24 bytes */
export class struct_lev_region {
  inarea: anon_sp_lev_h_405 = new anon_sp_lev_h_405();
  delarea: anon_sp_lev_h_408 = new anon_sp_lev_h_408();
  in_islev: number = 0;
  del_islev: number = 0;
  rtype: number = 0;
  padding: number = 0;
  rname: union_str_or_len = new union_str_or_len();
  static $of(...a: any[]): struct_lev_region {
    const o = new struct_lev_region();
    const n = a.length;
    if (n > 0) o.inarea = a[0];
    if (n > 1) o.delarea = a[1];
    if (n > 2) o.in_islev = a[2];
    if (n > 3) o.del_islev = a[3];
    if (n > 4) o.rtype = a[4];
    if (n > 5) o.padding = a[5];
    if (n > 6) o.rname = a[6];
    return o;
  }
  $cp(s: struct_lev_region): this {
    this.inarea.$cp(s.inarea);
    this.delarea.$cp(s.delarea);
    this.in_islev = s.in_islev;
    this.del_islev = s.del_islev;
    this.rtype = s.rtype;
    this.padding = s.padding;
    this.rname.$cp(s.rname);
    return this;
  }
  $clone(): struct_lev_region { return new struct_lev_region().$cp(this); }
  static $size = 24;
  static $layout(): any[] { return [['inarea', 0, ['r', anon_sp_lev_h_405]], ['delarea', 4, ['r', anon_sp_lev_h_408]], ['in_islev', 8, ['i', 1, 1]], ['del_islev', 9, ['i', 1, 1]], ['rtype', 10, ['i', 1, 1]], ['padding', 11, ['i', 1, 1]], ['rname', 16, ['r', union_str_or_len]]]; }
}

/** struct level_map: 16 bytes */
export class struct_level_map {
  lev_name: any = null;
  lev_spec: struct_d_level | null = null;
  static $of(...a: any[]): struct_level_map {
    const o = new struct_level_map();
    const n = a.length;
    if (n > 0) o.lev_name = a[0];
    if (n > 1) o.lev_spec = a[1];
    return o;
  }
  $cp(s: struct_level_map): this {
    this.lev_name = s.lev_name;
    this.lev_spec = s.lev_spec;
    return this;
  }
  $clone(): struct_level_map { return new struct_level_map().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['lev_name', 0, ['p']], ['lev_spec', 8, ['p']]]; }
}

/** struct levelflags: 8 bytes */
export class struct_levelflags {
  nfountains: number = 0;
  nsinks: number = 0;
  has_shop: number = 0;
  has_vault: number = 0;
  has_zoo: number = 0;
  has_court: number = 0;
  has_morgue: number = 0;
  has_beehive: number = 0;
  has_barracks: number = 0;
  has_temple: number = 0;
  has_swamp: number = 0;
  noteleport: number = 0;
  hardfloor: number = 0;
  nommap: number = 0;
  hero_memory: number = 0;
  shortsighted: number = 0;
  graveyard: number = 0;
  sokoban_rules: number = 0;
  is_maze_lev: number = 0;
  is_cavernous_lev: number = 0;
  arboreal: number = 0;
  wizard_bones: number = 0;
  corrmaze: number = 0;
  static $of(...a: any[]): struct_levelflags {
    const o = new struct_levelflags();
    const n = a.length;
    if (n > 0) o.nfountains = a[0];
    if (n > 1) o.nsinks = a[1];
    if (n > 2) o.has_shop = a[2];
    if (n > 3) o.has_vault = a[3];
    if (n > 4) o.has_zoo = a[4];
    if (n > 5) o.has_court = a[5];
    if (n > 6) o.has_morgue = a[6];
    if (n > 7) o.has_beehive = a[7];
    if (n > 8) o.has_barracks = a[8];
    if (n > 9) o.has_temple = a[9];
    if (n > 10) o.has_swamp = a[10];
    if (n > 11) o.noteleport = a[11];
    if (n > 12) o.hardfloor = a[12];
    if (n > 13) o.nommap = a[13];
    if (n > 14) o.hero_memory = a[14];
    if (n > 15) o.shortsighted = a[15];
    if (n > 16) o.graveyard = a[16];
    if (n > 17) o.sokoban_rules = a[17];
    if (n > 18) o.is_maze_lev = a[18];
    if (n > 19) o.is_cavernous_lev = a[19];
    if (n > 20) o.arboreal = a[20];
    if (n > 21) o.wizard_bones = a[21];
    if (n > 22) o.corrmaze = a[22];
    return o;
  }
  $cp(s: struct_levelflags): this {
    this.nfountains = s.nfountains;
    this.nsinks = s.nsinks;
    this.has_shop = s.has_shop;
    this.has_vault = s.has_vault;
    this.has_zoo = s.has_zoo;
    this.has_court = s.has_court;
    this.has_morgue = s.has_morgue;
    this.has_beehive = s.has_beehive;
    this.has_barracks = s.has_barracks;
    this.has_temple = s.has_temple;
    this.has_swamp = s.has_swamp;
    this.noteleport = s.noteleport;
    this.hardfloor = s.hardfloor;
    this.nommap = s.nommap;
    this.hero_memory = s.hero_memory;
    this.shortsighted = s.shortsighted;
    this.graveyard = s.graveyard;
    this.sokoban_rules = s.sokoban_rules;
    this.is_maze_lev = s.is_maze_lev;
    this.is_cavernous_lev = s.is_cavernous_lev;
    this.arboreal = s.arboreal;
    this.wizard_bones = s.wizard_bones;
    this.corrmaze = s.corrmaze;
    return this;
  }
  $clone(): struct_levelflags { return new struct_levelflags().$cp(this); }
  static $size = 8;
  static $layout(): any[] { return [['nfountains', 0, ['i', 1, 0]], ['nsinks', 1, ['i', 1, 0]], ['has_shop', 2, ['b', 0, 1, 0]], ['has_vault', 2, ['b', 1, 1, 0]], ['has_zoo', 2, ['b', 2, 1, 0]], ['has_court', 2, ['b', 3, 1, 0]], ['has_morgue', 2, ['b', 4, 1, 0]], ['has_beehive', 2, ['b', 5, 1, 0]], ['has_barracks', 2, ['b', 6, 1, 0]], ['has_temple', 2, ['b', 7, 1, 0]], ['has_swamp', 3, ['b', 0, 1, 0]], ['noteleport', 3, ['b', 1, 1, 0]], ['hardfloor', 3, ['b', 2, 1, 0]], ['nommap', 3, ['b', 3, 1, 0]], ['hero_memory', 3, ['b', 4, 1, 0]], ['shortsighted', 3, ['b', 5, 1, 0]], ['graveyard', 3, ['b', 6, 1, 0]], ['sokoban_rules', 3, ['b', 7, 1, 0]], ['is_maze_lev', 4, ['b', 0, 1, 0]], ['is_cavernous_lev', 4, ['b', 1, 1, 0]], ['arboreal', 4, ['b', 2, 1, 0]], ['wizard_bones', 4, ['b', 3, 1, 0]], ['corrmaze', 4, ['b', 4, 1, 0]]]; }
}

/** struct linfo: 1 bytes */
export class struct_linfo {
  flags: number = 0;
  static $of(...a: any[]): struct_linfo {
    const o = new struct_linfo();
    const n = a.length;
    if (n > 0) o.flags = a[0];
    return o;
  }
  $cp(s: struct_linfo): this {
    this.flags = s.flags;
    return this;
  }
  $clone(): struct_linfo { return new struct_linfo().$cp(this); }
  static $size = 1;
  static $layout(): any[] { return [['flags', 0, ['i', 1, 0]]]; }
}

/** struct litmon: 16 bytes */
export class struct_litmon {
  mon: struct_monst | null = null;
  nxt: struct_litmon | null = null;
  static $of(...a: any[]): struct_litmon {
    const o = new struct_litmon();
    const n = a.length;
    if (n > 0) o.mon = a[0];
    if (n > 1) o.nxt = a[1];
    return o;
  }
  $cp(s: struct_litmon): this {
    this.mon = s.mon;
    this.nxt = s.nxt;
    return this;
  }
  $clone(): struct_litmon { return new struct_litmon().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['mon', 0, ['p']], ['nxt', 8, ['p']]]; }
}

/** struct ls_t: 24 bytes */
export class struct_ls_t {
  next: struct_ls_t | null = null;
  x: number = 0;
  y: number = 0;
  range: number = 0;
  flags: number = 0;
  type: number = 0;
  id: union_any = new union_any();
  static $of(...a: any[]): struct_ls_t {
    const o = new struct_ls_t();
    const n = a.length;
    if (n > 0) o.next = a[0];
    if (n > 1) o.x = a[1];
    if (n > 2) o.y = a[2];
    if (n > 3) o.range = a[3];
    if (n > 4) o.flags = a[4];
    if (n > 5) o.type = a[5];
    if (n > 6) o.id = a[6];
    return o;
  }
  $cp(s: struct_ls_t): this {
    this.next = s.next;
    this.x = s.x;
    this.y = s.y;
    this.range = s.range;
    this.flags = s.flags;
    this.type = s.type;
    this.id.$cp(s.id);
    return this;
  }
  $clone(): struct_ls_t { return new struct_ls_t().$cp(this); }
  static $size = 24;
  static $layout(): any[] { return [['next', 0, ['p']], ['x', 8, ['i', 1, 1]], ['y', 9, ['i', 1, 1]], ['range', 10, ['i', 2, 1]], ['flags', 12, ['i', 2, 1]], ['type', 14, ['i', 2, 1]], ['id', 16, ['r', union_any]]]; }
}

/** struct mail_info: 32 bytes */
export class struct_mail_info {
  message_typ: number = 0;
  display_txt: any = null;
  object_nam: any = null;
  response_cmd: any = null;
  static $of(...a: any[]): struct_mail_info {
    const o = new struct_mail_info();
    const n = a.length;
    if (n > 0) o.message_typ = a[0];
    if (n > 1) o.display_txt = a[1];
    if (n > 2) o.object_nam = a[2];
    if (n > 3) o.response_cmd = a[3];
    return o;
  }
  $cp(s: struct_mail_info): this {
    this.message_typ = s.message_typ;
    this.display_txt = s.display_txt;
    this.object_nam = s.object_nam;
    this.response_cmd = s.response_cmd;
    return this;
  }
  $clone(): struct_mail_info { return new struct_mail_info().$cp(this); }
  static $size = 32;
  static $layout(): any[] { return [['message_typ', 0, ['i', 4, 1]], ['display_txt', 8, ['p']], ['object_nam', 16, ['p']], ['response_cmd', 24, ['p']]]; }
}

/** struct mapseen: 384 bytes */
export class struct_mapseen {
  next: struct_mapseen | null = null;
  br: struct_branch | null = null;
  lev: struct_d_level = new struct_d_level();
  feat: struct_mapseen_feat = new struct_mapseen_feat();
  flags: struct_mapseen_flags = new struct_mapseen_flags();
  custom: any = null;
  custom_lth: number = 0;
  msrooms: any[] = $sarr(struct_mapseen_rooms, 82);
  final_resting_place: struct_cemetery | null = null;
  static $of(...a: any[]): struct_mapseen {
    const o = new struct_mapseen();
    const n = a.length;
    if (n > 0) o.next = a[0];
    if (n > 1) o.br = a[1];
    if (n > 2) o.lev = a[2];
    if (n > 3) o.feat = a[3];
    if (n > 4) o.flags = a[4];
    if (n > 5) o.custom = a[5];
    if (n > 6) o.custom_lth = a[6];
    if (n > 7) o.msrooms = a[7];
    if (n > 8) o.final_resting_place = a[8];
    return o;
  }
  $cp(s: struct_mapseen): this {
    this.next = s.next;
    this.br = s.br;
    this.lev.$cp(s.lev);
    this.feat.$cp(s.feat);
    this.flags.$cp(s.flags);
    this.custom = s.custom;
    this.custom_lth = s.custom_lth;
    $cparr(this.msrooms, s.msrooms);
    this.final_resting_place = s.final_resting_place;
    return this;
  }
  $clone(): struct_mapseen { return new struct_mapseen().$cp(this); }
  static $size = 384;
  static $layout(): any[] { return [['next', 0, ['p']], ['br', 8, ['p']], ['lev', 16, ['r', struct_d_level]], ['feat', 20, ['r', struct_mapseen_feat]], ['flags', 24, ['r', struct_mapseen_flags]], ['custom', 32, ['p']], ['custom_lth', 40, ['i', 4, 0]], ['msrooms', 44, ['a', ['r', struct_mapseen_rooms], 82]], ['final_resting_place', 376, ['p']]]; }
}

/** struct mapseen_feat: 4 bytes */
export class struct_mapseen_feat {
  nfount: number = 0;
  nsink: number = 0;
  naltar: number = 0;
  nthrone: number = 0;
  ngrave: number = 0;
  ntree: number = 0;
  water: number = 0;
  lava: number = 0;
  ice: number = 0;
  nshop: number = 0;
  ntemple: number = 0;
  msalign: number = 0;
  shoptype: number = 0;
  static $of(...a: any[]): struct_mapseen_feat {
    const o = new struct_mapseen_feat();
    const n = a.length;
    if (n > 0) o.nfount = a[0];
    if (n > 1) o.nsink = a[1];
    if (n > 2) o.naltar = a[2];
    if (n > 3) o.nthrone = a[3];
    if (n > 4) o.ngrave = a[4];
    if (n > 5) o.ntree = a[5];
    if (n > 6) o.water = a[6];
    if (n > 7) o.lava = a[7];
    if (n > 8) o.ice = a[8];
    if (n > 9) o.nshop = a[9];
    if (n > 10) o.ntemple = a[10];
    if (n > 11) o.msalign = a[11];
    if (n > 12) o.shoptype = a[12];
    return o;
  }
  $cp(s: struct_mapseen_feat): this {
    this.nfount = s.nfount;
    this.nsink = s.nsink;
    this.naltar = s.naltar;
    this.nthrone = s.nthrone;
    this.ngrave = s.ngrave;
    this.ntree = s.ntree;
    this.water = s.water;
    this.lava = s.lava;
    this.ice = s.ice;
    this.nshop = s.nshop;
    this.ntemple = s.ntemple;
    this.msalign = s.msalign;
    this.shoptype = s.shoptype;
    return this;
  }
  $clone(): struct_mapseen_feat { return new struct_mapseen_feat().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['nfount', 0, ['b', 0, 2, 0]], ['nsink', 0, ['b', 2, 2, 0]], ['naltar', 0, ['b', 4, 2, 0]], ['nthrone', 0, ['b', 6, 2, 0]], ['ngrave', 1, ['b', 0, 2, 0]], ['ntree', 1, ['b', 2, 2, 0]], ['water', 1, ['b', 4, 2, 0]], ['lava', 1, ['b', 6, 2, 0]], ['ice', 2, ['b', 0, 2, 0]], ['nshop', 2, ['b', 2, 2, 0]], ['ntemple', 2, ['b', 4, 2, 0]], ['msalign', 2, ['b', 6, 2, 0]], ['shoptype', 3, ['b', 0, 5, 0]]]; }
}

/** struct mapseen_flags: 4 bytes */
export class struct_mapseen_flags {
  unreachable: number = 0;
  forgot: number = 0;
  knownbones: number = 0;
  oracle: number = 0;
  sokosolved: number = 0;
  bigroom: number = 0;
  castle: number = 0;
  castletune: number = 0;
  valley: number = 0;
  msanctum: number = 0;
  ludios: number = 0;
  roguelevel: number = 0;
  quest_summons: number = 0;
  questing: number = 0;
  static $of(...a: any[]): struct_mapseen_flags {
    const o = new struct_mapseen_flags();
    const n = a.length;
    if (n > 0) o.unreachable = a[0];
    if (n > 1) o.forgot = a[1];
    if (n > 2) o.knownbones = a[2];
    if (n > 3) o.oracle = a[3];
    if (n > 4) o.sokosolved = a[4];
    if (n > 5) o.bigroom = a[5];
    if (n > 6) o.castle = a[6];
    if (n > 7) o.castletune = a[7];
    if (n > 8) o.valley = a[8];
    if (n > 9) o.msanctum = a[9];
    if (n > 10) o.ludios = a[10];
    if (n > 11) o.roguelevel = a[11];
    if (n > 12) o.quest_summons = a[12];
    if (n > 13) o.questing = a[13];
    return o;
  }
  $cp(s: struct_mapseen_flags): this {
    this.unreachable = s.unreachable;
    this.forgot = s.forgot;
    this.knownbones = s.knownbones;
    this.oracle = s.oracle;
    this.sokosolved = s.sokosolved;
    this.bigroom = s.bigroom;
    this.castle = s.castle;
    this.castletune = s.castletune;
    this.valley = s.valley;
    this.msanctum = s.msanctum;
    this.ludios = s.ludios;
    this.roguelevel = s.roguelevel;
    this.quest_summons = s.quest_summons;
    this.questing = s.questing;
    return this;
  }
  $clone(): struct_mapseen_flags { return new struct_mapseen_flags().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['unreachable', 0, ['b', 0, 1, 0]], ['forgot', 0, ['b', 1, 1, 0]], ['knownbones', 0, ['b', 2, 1, 0]], ['oracle', 0, ['b', 3, 1, 0]], ['sokosolved', 0, ['b', 4, 1, 0]], ['bigroom', 0, ['b', 5, 1, 0]], ['castle', 0, ['b', 6, 1, 0]], ['castletune', 0, ['b', 7, 1, 0]], ['valley', 1, ['b', 0, 1, 0]], ['msanctum', 1, ['b', 1, 1, 0]], ['ludios', 1, ['b', 2, 1, 0]], ['roguelevel', 1, ['b', 3, 1, 0]], ['quest_summons', 1, ['b', 4, 1, 0]], ['questing', 1, ['b', 5, 1, 0]]]; }
}

/** struct mapseen_rooms: 4 bytes */
export class struct_mapseen_rooms {
  seen: number = 0;
  untended: number = 0;
  static $of(...a: any[]): struct_mapseen_rooms {
    const o = new struct_mapseen_rooms();
    const n = a.length;
    if (n > 0) o.seen = a[0];
    if (n > 1) o.untended = a[1];
    return o;
  }
  $cp(s: struct_mapseen_rooms): this {
    this.seen = s.seen;
    this.untended = s.untended;
    return this;
  }
  $clone(): struct_mapseen_rooms { return new struct_mapseen_rooms().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['seen', 0, ['b', 0, 1, 0]], ['untended', 0, ['b', 1, 1, 0]]]; }
}

/** struct mazepart: 16 bytes */
export class struct_mazepart {
  zaligntyp: number = 0;
  keep_region: number = 0;
  halign: number = 0;
  valign: number = 0;
  xsize: number = 0;
  ysize: number = 0;
  map: any = null;
  static $of(...a: any[]): struct_mazepart {
    const o = new struct_mazepart();
    const n = a.length;
    if (n > 0) o.zaligntyp = a[0];
    if (n > 1) o.keep_region = a[1];
    if (n > 2) o.halign = a[2];
    if (n > 3) o.valign = a[3];
    if (n > 4) o.xsize = a[4];
    if (n > 5) o.ysize = a[5];
    if (n > 6) o.map = a[6];
    return o;
  }
  $cp(s: struct_mazepart): this {
    this.zaligntyp = s.zaligntyp;
    this.keep_region = s.keep_region;
    this.halign = s.halign;
    this.valign = s.valign;
    this.xsize = s.xsize;
    this.ysize = s.ysize;
    this.map = s.map;
    return this;
  }
  $clone(): struct_mazepart { return new struct_mazepart().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['zaligntyp', 0, ['i', 1, 1]], ['keep_region', 1, ['i', 1, 1]], ['halign', 2, ['i', 1, 1]], ['valign', 3, ['i', 1, 1]], ['xsize', 4, ['i', 1, 1]], ['ysize', 5, ['i', 1, 1]], ['map', 8, ['p']]]; }
}

/** struct menu_cmd_t: 24 bytes */
export class struct_menu_cmd_t {
  name: any = null;
  cmd: number = 0;
  desc: any = null;
  static $of(...a: any[]): struct_menu_cmd_t {
    const o = new struct_menu_cmd_t();
    const n = a.length;
    if (n > 0) o.name = a[0];
    if (n > 1) o.cmd = a[1];
    if (n > 2) o.desc = a[2];
    return o;
  }
  $cp(s: struct_menu_cmd_t): this {
    this.name = s.name;
    this.cmd = s.cmd;
    this.desc = s.desc;
    return this;
  }
  $clone(): struct_menu_cmd_t { return new struct_menu_cmd_t().$cp(this); }
  static $size = 24;
  static $layout(): any[] { return [['name', 0, ['p']], ['cmd', 8, ['i', 1, 1]], ['desc', 16, ['p']]]; }
}

/** struct menucoloring: 32 bytes */
export class struct_menucoloring {
  match: struct_nhregex | null = null;
  origstr: any = null;
  color: number = 0;
  attr: number = 0;
  next: struct_menucoloring | null = null;
  static $of(...a: any[]): struct_menucoloring {
    const o = new struct_menucoloring();
    const n = a.length;
    if (n > 0) o.match = a[0];
    if (n > 1) o.origstr = a[1];
    if (n > 2) o.color = a[2];
    if (n > 3) o.attr = a[3];
    if (n > 4) o.next = a[4];
    return o;
  }
  $cp(s: struct_menucoloring): this {
    this.match = s.match;
    this.origstr = s.origstr;
    this.color = s.color;
    this.attr = s.attr;
    this.next = s.next;
    return this;
  }
  $clone(): struct_menucoloring { return new struct_menucoloring().$cp(this); }
  static $size = 32;
  static $layout(): any[] { return [['match', 0, ['p']], ['origstr', 8, ['p']], ['color', 16, ['i', 4, 1]], ['attr', 20, ['i', 4, 1]], ['next', 24, ['p']]]; }
}

/** struct mextra: 56 bytes */
export class struct_mextra {
  mname: any = null;
  egd: struct_egd | null = null;
  epri: struct_epri | null = null;
  eshk: struct_eshk | null = null;
  emin: struct_emin | null = null;
  edog: struct_edog | null = null;
  mcorpsenm: number = 0;
  static $of(...a: any[]): struct_mextra {
    const o = new struct_mextra();
    const n = a.length;
    if (n > 0) o.mname = a[0];
    if (n > 1) o.egd = a[1];
    if (n > 2) o.epri = a[2];
    if (n > 3) o.eshk = a[3];
    if (n > 4) o.emin = a[4];
    if (n > 5) o.edog = a[5];
    if (n > 6) o.mcorpsenm = a[6];
    return o;
  }
  $cp(s: struct_mextra): this {
    this.mname = s.mname;
    this.egd = s.egd;
    this.epri = s.epri;
    this.eshk = s.eshk;
    this.emin = s.emin;
    this.edog = s.edog;
    this.mcorpsenm = s.mcorpsenm;
    return this;
  }
  $clone(): struct_mextra { return new struct_mextra().$cp(this); }
  static $size = 56;
  static $layout(): any[] { return [['mname', 0, ['p']], ['egd', 8, ['p']], ['epri', 16, ['p']], ['eshk', 24, ['p']], ['emin', 32, ['p']], ['edog', 40, ['p']], ['mcorpsenm', 48, ['i', 4, 1]]]; }
}

/** struct mi: 16 bytes */
export class struct_mi {
  item: union_any = new union_any();
  count: number = 0;
  static $of(...a: any[]): struct_mi {
    const o = new struct_mi();
    const n = a.length;
    if (n > 0) o.item = a[0];
    if (n > 1) o.count = a[1];
    return o;
  }
  $cp(s: struct_mi): this {
    this.item.$cp(s.item);
    this.count = s.count;
    return this;
  }
  $clone(): struct_mi { return new struct_mi().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['item', 0, ['r', union_any]], ['count', 8, ['i', 8, 1]]]; }
}

/** struct mkroom: 216 bytes */
export class struct_mkroom {
  lx: number = 0;
  hx: number = 0;
  ly: number = 0;
  hy: number = 0;
  rtype: number = 0;
  orig_rtype: number = 0;
  rlit: number = 0;
  needfill: number = 0;
  needjoining: number = 0;
  doorct: number = 0;
  fdoor: number = 0;
  nsubrooms: number = 0;
  irregular: number = 0;
  sbrooms: any[] = new Array(24).fill(null);
  resident: struct_monst | null = null;
  static $of(...a: any[]): struct_mkroom {
    const o = new struct_mkroom();
    const n = a.length;
    if (n > 0) o.lx = a[0];
    if (n > 1) o.hx = a[1];
    if (n > 2) o.ly = a[2];
    if (n > 3) o.hy = a[3];
    if (n > 4) o.rtype = a[4];
    if (n > 5) o.orig_rtype = a[5];
    if (n > 6) o.rlit = a[6];
    if (n > 7) o.needfill = a[7];
    if (n > 8) o.needjoining = a[8];
    if (n > 9) o.doorct = a[9];
    if (n > 10) o.fdoor = a[10];
    if (n > 11) o.nsubrooms = a[11];
    if (n > 12) o.irregular = a[12];
    if (n > 13) o.sbrooms = a[13];
    if (n > 14) o.resident = a[14];
    return o;
  }
  $cp(s: struct_mkroom): this {
    this.lx = s.lx;
    this.hx = s.hx;
    this.ly = s.ly;
    this.hy = s.hy;
    this.rtype = s.rtype;
    this.orig_rtype = s.orig_rtype;
    this.rlit = s.rlit;
    this.needfill = s.needfill;
    this.needjoining = s.needjoining;
    this.doorct = s.doorct;
    this.fdoor = s.fdoor;
    this.nsubrooms = s.nsubrooms;
    this.irregular = s.irregular;
    $cpvals(this.sbrooms, s.sbrooms);
    this.resident = s.resident;
    return this;
  }
  $clone(): struct_mkroom { return new struct_mkroom().$cp(this); }
  static $size = 216;
  static $layout(): any[] { return [['lx', 0, ['i', 1, 1]], ['hx', 1, ['i', 1, 1]], ['ly', 2, ['i', 1, 1]], ['hy', 3, ['i', 1, 1]], ['rtype', 4, ['i', 1, 1]], ['orig_rtype', 5, ['i', 1, 1]], ['rlit', 6, ['i', 1, 1]], ['needfill', 7, ['i', 1, 1]], ['needjoining', 8, ['i', 1, 1]], ['doorct', 9, ['i', 1, 1]], ['fdoor', 10, ['i', 1, 1]], ['nsubrooms', 11, ['i', 1, 1]], ['irregular', 12, ['i', 1, 1]], ['sbrooms', 16, ['a', ['p'], 24]], ['resident', 208, ['p']]]; }
}

/** struct monst: 144 bytes */
export class struct_monst {
  nmon: struct_monst | null = null;
  data: struct_permonst | null = null;
  m_id: number = 0;
  mnum: number = 0;
  cham: number = 0;
  movement: number = 0;
  m_lev: number = 0;
  malign: number = 0;
  mx: number = 0;
  my: number = 0;
  mux: number = 0;
  muy: number = 0;
  mtrack: any[] = $sarr(struct_nhcoord, 4);
  mhp: number = 0;
  mhpmax: number = 0;
  mappearance: number = 0;
  m_ap_type: number = 0;
  mtame: number = 0;
  mextrinsics: number = 0;
  mspec_used: number = 0;
  female: number = 0;
  minvis: number = 0;
  invis_blkd: number = 0;
  perminvis: number = 0;
  mcan: number = 0;
  mburied: number = 0;
  mundetected: number = 0;
  mcansee: number = 0;
  mspeed: number = 0;
  permspeed: number = 0;
  mrevived: number = 0;
  mcloned: number = 0;
  mavenge: number = 0;
  mflee: number = 0;
  mfleetim: number = 0;
  msleeping: number = 0;
  mblinded: number = 0;
  mstun: number = 0;
  mfrozen: number = 0;
  mcanmove: number = 0;
  mconf: number = 0;
  mpeaceful: number = 0;
  mtrapped: number = 0;
  mleashed: number = 0;
  isshk: number = 0;
  isminion: number = 0;
  isgd: number = 0;
  ispriest: number = 0;
  iswiz: number = 0;
  wormno: number = 0;
  mstrategy: number = 0;
  mtrapseen: number = 0;
  mlstmv: number = 0;
  mspare1: number = 0;
  minvent: struct_obj | null = null;
  mw: struct_obj | null = null;
  misc_worn_check: number = 0;
  weapon_check: number = 0;
  meating: number = 0;
  mextra: struct_mextra | null = null;
  static $of(...a: any[]): struct_monst {
    const o = new struct_monst();
    const n = a.length;
    if (n > 0) o.nmon = a[0];
    if (n > 1) o.data = a[1];
    if (n > 2) o.m_id = a[2];
    if (n > 3) o.mnum = a[3];
    if (n > 4) o.cham = a[4];
    if (n > 5) o.movement = a[5];
    if (n > 6) o.m_lev = a[6];
    if (n > 7) o.malign = a[7];
    if (n > 8) o.mx = a[8];
    if (n > 9) o.my = a[9];
    if (n > 10) o.mux = a[10];
    if (n > 11) o.muy = a[11];
    if (n > 12) o.mtrack = a[12];
    if (n > 13) o.mhp = a[13];
    if (n > 14) o.mhpmax = a[14];
    if (n > 15) o.mappearance = a[15];
    if (n > 16) o.m_ap_type = a[16];
    if (n > 17) o.mtame = a[17];
    if (n > 18) o.mextrinsics = a[18];
    if (n > 19) o.mspec_used = a[19];
    if (n > 20) o.female = a[20];
    if (n > 21) o.minvis = a[21];
    if (n > 22) o.invis_blkd = a[22];
    if (n > 23) o.perminvis = a[23];
    if (n > 24) o.mcan = a[24];
    if (n > 25) o.mburied = a[25];
    if (n > 26) o.mundetected = a[26];
    if (n > 27) o.mcansee = a[27];
    if (n > 28) o.mspeed = a[28];
    if (n > 29) o.permspeed = a[29];
    if (n > 30) o.mrevived = a[30];
    if (n > 31) o.mcloned = a[31];
    if (n > 32) o.mavenge = a[32];
    if (n > 33) o.mflee = a[33];
    if (n > 34) o.mfleetim = a[34];
    if (n > 35) o.msleeping = a[35];
    if (n > 36) o.mblinded = a[36];
    if (n > 37) o.mstun = a[37];
    if (n > 38) o.mfrozen = a[38];
    if (n > 39) o.mcanmove = a[39];
    if (n > 40) o.mconf = a[40];
    if (n > 41) o.mpeaceful = a[41];
    if (n > 42) o.mtrapped = a[42];
    if (n > 43) o.mleashed = a[43];
    if (n > 44) o.isshk = a[44];
    if (n > 45) o.isminion = a[45];
    if (n > 46) o.isgd = a[46];
    if (n > 47) o.ispriest = a[47];
    if (n > 48) o.iswiz = a[48];
    if (n > 49) o.wormno = a[49];
    if (n > 50) o.mstrategy = a[50];
    if (n > 51) o.mtrapseen = a[51];
    if (n > 52) o.mlstmv = a[52];
    if (n > 53) o.mspare1 = a[53];
    if (n > 54) o.minvent = a[54];
    if (n > 55) o.mw = a[55];
    if (n > 56) o.misc_worn_check = a[56];
    if (n > 57) o.weapon_check = a[57];
    if (n > 58) o.meating = a[58];
    if (n > 59) o.mextra = a[59];
    return o;
  }
  $cp(s: struct_monst): this {
    this.nmon = s.nmon;
    this.data = s.data;
    this.m_id = s.m_id;
    this.mnum = s.mnum;
    this.cham = s.cham;
    this.movement = s.movement;
    this.m_lev = s.m_lev;
    this.malign = s.malign;
    this.mx = s.mx;
    this.my = s.my;
    this.mux = s.mux;
    this.muy = s.muy;
    $cparr(this.mtrack, s.mtrack);
    this.mhp = s.mhp;
    this.mhpmax = s.mhpmax;
    this.mappearance = s.mappearance;
    this.m_ap_type = s.m_ap_type;
    this.mtame = s.mtame;
    this.mextrinsics = s.mextrinsics;
    this.mspec_used = s.mspec_used;
    this.female = s.female;
    this.minvis = s.minvis;
    this.invis_blkd = s.invis_blkd;
    this.perminvis = s.perminvis;
    this.mcan = s.mcan;
    this.mburied = s.mburied;
    this.mundetected = s.mundetected;
    this.mcansee = s.mcansee;
    this.mspeed = s.mspeed;
    this.permspeed = s.permspeed;
    this.mrevived = s.mrevived;
    this.mcloned = s.mcloned;
    this.mavenge = s.mavenge;
    this.mflee = s.mflee;
    this.mfleetim = s.mfleetim;
    this.msleeping = s.msleeping;
    this.mblinded = s.mblinded;
    this.mstun = s.mstun;
    this.mfrozen = s.mfrozen;
    this.mcanmove = s.mcanmove;
    this.mconf = s.mconf;
    this.mpeaceful = s.mpeaceful;
    this.mtrapped = s.mtrapped;
    this.mleashed = s.mleashed;
    this.isshk = s.isshk;
    this.isminion = s.isminion;
    this.isgd = s.isgd;
    this.ispriest = s.ispriest;
    this.iswiz = s.iswiz;
    this.wormno = s.wormno;
    this.mstrategy = s.mstrategy;
    this.mtrapseen = s.mtrapseen;
    this.mlstmv = s.mlstmv;
    this.mspare1 = s.mspare1;
    this.minvent = s.minvent;
    this.mw = s.mw;
    this.misc_worn_check = s.misc_worn_check;
    this.weapon_check = s.weapon_check;
    this.meating = s.meating;
    this.mextra = s.mextra;
    return this;
  }
  $clone(): struct_monst { return new struct_monst().$cp(this); }
  static $size = 144;
  static $layout(): any[] { return [['nmon', 0, ['p']], ['data', 8, ['p']], ['m_id', 16, ['i', 4, 0]], ['mnum', 20, ['i', 2, 1]], ['cham', 22, ['i', 2, 1]], ['movement', 24, ['i', 2, 1]], ['m_lev', 26, ['i', 1, 0]], ['malign', 27, ['i', 1, 1]], ['mx', 28, ['i', 1, 1]], ['my', 29, ['i', 1, 1]], ['mux', 30, ['i', 1, 1]], ['muy', 31, ['i', 1, 1]], ['mtrack', 32, ['a', ['r', struct_nhcoord], 4]], ['mhp', 40, ['i', 4, 1]], ['mhpmax', 44, ['i', 4, 1]], ['mappearance', 48, ['i', 4, 0]], ['m_ap_type', 52, ['i', 1, 0]], ['mtame', 53, ['i', 1, 1]], ['mextrinsics', 54, ['i', 2, 0]], ['mspec_used', 56, ['i', 4, 1]], ['female', 60, ['b', 0, 1, 0]], ['minvis', 60, ['b', 1, 1, 0]], ['invis_blkd', 60, ['b', 2, 1, 0]], ['perminvis', 60, ['b', 3, 1, 0]], ['mcan', 60, ['b', 4, 1, 0]], ['mburied', 60, ['b', 5, 1, 0]], ['mundetected', 60, ['b', 6, 1, 0]], ['mcansee', 60, ['b', 7, 1, 0]], ['mspeed', 61, ['b', 0, 2, 0]], ['permspeed', 61, ['b', 2, 2, 0]], ['mrevived', 61, ['b', 4, 1, 0]], ['mcloned', 61, ['b', 5, 1, 0]], ['mavenge', 61, ['b', 6, 1, 0]], ['mflee', 61, ['b', 7, 1, 0]], ['mfleetim', 62, ['b', 0, 7, 0]], ['msleeping', 62, ['b', 7, 1, 0]], ['mblinded', 63, ['b', 0, 7, 0]], ['mstun', 63, ['b', 7, 1, 0]], ['mfrozen', 64, ['b', 0, 7, 0]], ['mcanmove', 64, ['b', 7, 1, 0]], ['mconf', 65, ['b', 0, 1, 0]], ['mpeaceful', 65, ['b', 1, 1, 0]], ['mtrapped', 65, ['b', 2, 1, 0]], ['mleashed', 65, ['b', 3, 1, 0]], ['isshk', 65, ['b', 4, 1, 0]], ['isminion', 65, ['b', 5, 1, 0]], ['isgd', 65, ['b', 6, 1, 0]], ['ispriest', 65, ['b', 7, 1, 0]], ['iswiz', 66, ['b', 0, 1, 0]], ['wormno', 66, ['b', 1, 5, 0]], ['mstrategy', 72, ['i', 8, 0]], ['mtrapseen', 80, ['i', 8, 1]], ['mlstmv', 88, ['i', 8, 1]], ['mspare1', 96, ['i', 8, 1]], ['minvent', 104, ['p']], ['mw', 112, ['p']], ['misc_worn_check', 120, ['i', 8, 1]], ['weapon_check', 128, ['i', 1, 1]], ['meating', 132, ['i', 4, 1]], ['mextra', 136, ['p']]]; }
}

/** struct monster: 80 bytes */
export class struct_monster {
  name: union_str_or_len = new union_str_or_len();
  appear_as: union_str_or_len = new union_str_or_len();
  id: number = 0;
  align: number = 0;
  coord: number = 0;
  x: number = 0;
  y: number = 0;
  class: number = 0;
  appear: number = 0;
  peaceful: number = 0;
  asleep: number = 0;
  female: number = 0;
  invis: number = 0;
  cancelled: number = 0;
  revived: number = 0;
  avenge: number = 0;
  fleeing: number = 0;
  blinded: number = 0;
  paralyzed: number = 0;
  stunned: number = 0;
  confused: number = 0;
  seentraps: number = 0;
  has_invent: number = 0;
  static $of(...a: any[]): struct_monster {
    const o = new struct_monster();
    const n = a.length;
    if (n > 0) o.name = a[0];
    if (n > 1) o.appear_as = a[1];
    if (n > 2) o.id = a[2];
    if (n > 3) o.align = a[3];
    if (n > 4) o.coord = a[4];
    if (n > 5) o.x = a[5];
    if (n > 6) o.y = a[6];
    if (n > 7) o.class = a[7];
    if (n > 8) o.appear = a[8];
    if (n > 9) o.peaceful = a[9];
    if (n > 10) o.asleep = a[10];
    if (n > 11) o.female = a[11];
    if (n > 12) o.invis = a[12];
    if (n > 13) o.cancelled = a[13];
    if (n > 14) o.revived = a[14];
    if (n > 15) o.avenge = a[15];
    if (n > 16) o.fleeing = a[16];
    if (n > 17) o.blinded = a[17];
    if (n > 18) o.paralyzed = a[18];
    if (n > 19) o.stunned = a[19];
    if (n > 20) o.confused = a[20];
    if (n > 21) o.seentraps = a[21];
    if (n > 22) o.has_invent = a[22];
    return o;
  }
  $cp(s: struct_monster): this {
    this.name.$cp(s.name);
    this.appear_as.$cp(s.appear_as);
    this.id = s.id;
    this.align = s.align;
    this.coord = s.coord;
    this.x = s.x;
    this.y = s.y;
    this.class = s.class;
    this.appear = s.appear;
    this.peaceful = s.peaceful;
    this.asleep = s.asleep;
    this.female = s.female;
    this.invis = s.invis;
    this.cancelled = s.cancelled;
    this.revived = s.revived;
    this.avenge = s.avenge;
    this.fleeing = s.fleeing;
    this.blinded = s.blinded;
    this.paralyzed = s.paralyzed;
    this.stunned = s.stunned;
    this.confused = s.confused;
    this.seentraps = s.seentraps;
    this.has_invent = s.has_invent;
    return this;
  }
  $clone(): struct_monster { return new struct_monster().$cp(this); }
  static $size = 80;
  static $layout(): any[] { return [['name', 0, ['r', union_str_or_len]], ['appear_as', 8, ['r', union_str_or_len]], ['id', 16, ['i', 2, 1]], ['align', 18, ['i', 1, 1]], ['coord', 24, ['i', 8, 1]], ['x', 32, ['i', 1, 1]], ['y', 33, ['i', 1, 1]], ['class', 34, ['i', 1, 1]], ['appear', 35, ['i', 1, 1]], ['peaceful', 36, ['i', 1, 1]], ['asleep', 37, ['i', 1, 1]], ['female', 38, ['i', 2, 1]], ['invis', 40, ['i', 2, 1]], ['cancelled', 42, ['i', 2, 1]], ['revived', 44, ['i', 2, 1]], ['avenge', 46, ['i', 2, 1]], ['fleeing', 48, ['i', 2, 1]], ['blinded', 50, ['i', 2, 1]], ['paralyzed', 52, ['i', 2, 1]], ['stunned', 54, ['i', 2, 1]], ['confused', 56, ['i', 2, 1]], ['seentraps', 64, ['i', 8, 1]], ['has_invent', 72, ['i', 2, 1]]]; }
}

/** struct movcmd: 24 bytes */
export class struct_movcmd {
  k1: number = 0;
  k2: number = 0;
  k3: number = 0;
  k4: number = 0;
  txt: any = null;
  alt: any = null;
  static $of(...a: any[]): struct_movcmd {
    const o = new struct_movcmd();
    const n = a.length;
    if (n > 0) o.k1 = a[0];
    if (n > 1) o.k2 = a[1];
    if (n > 2) o.k3 = a[2];
    if (n > 3) o.k4 = a[3];
    if (n > 4) o.txt = a[4];
    if (n > 5) o.alt = a[5];
    return o;
  }
  $cp(s: struct_movcmd): this {
    this.k1 = s.k1;
    this.k2 = s.k2;
    this.k3 = s.k3;
    this.k4 = s.k4;
    this.txt = s.txt;
    this.alt = s.alt;
    return this;
  }
  $clone(): struct_movcmd { return new struct_movcmd().$cp(this); }
  static $size = 24;
  static $layout(): any[] { return [['k1', 0, ['i', 1, 0]], ['k2', 1, ['i', 1, 0]], ['k3', 2, ['i', 1, 0]], ['k4', 3, ['i', 1, 0]], ['txt', 8, ['p']], ['alt', 16, ['p']]]; }
}

/** struct multishot: 12 bytes */
export class struct_multishot {
  n: number = 0;
  i: number = 0;
  o: number = 0;
  s: number = 0;
  static $of(...a: any[]): struct_multishot {
    const o = new struct_multishot();
    const n = a.length;
    if (n > 0) o.n = a[0];
    if (n > 1) o.i = a[1];
    if (n > 2) o.o = a[2];
    if (n > 3) o.s = a[3];
    return o;
  }
  $cp(s: struct_multishot): this {
    this.n = s.n;
    this.i = s.i;
    this.o = s.o;
    this.s = s.s;
    return this;
  }
  $clone(): struct_multishot { return new struct_multishot().$cp(this); }
  static $size = 12;
  static $layout(): any[] { return [['n', 0, ['i', 4, 1]], ['i', 4, ['i', 4, 1]], ['o', 8, ['i', 2, 1]], ['s', 10, ['i', 1, 1]]]; }
}

/** struct musable: 40 bytes */
export class struct_musable {
  offensive: struct_obj | null = null;
  defensive: struct_obj | null = null;
  misc: struct_obj | null = null;
  has_offense: number = 0;
  has_defense: number = 0;
  has_misc: number = 0;
  static $of(...a: any[]): struct_musable {
    const o = new struct_musable();
    const n = a.length;
    if (n > 0) o.offensive = a[0];
    if (n > 1) o.defensive = a[1];
    if (n > 2) o.misc = a[2];
    if (n > 3) o.has_offense = a[3];
    if (n > 4) o.has_defense = a[4];
    if (n > 5) o.has_misc = a[5];
    return o;
  }
  $cp(s: struct_musable): this {
    this.offensive = s.offensive;
    this.defensive = s.defensive;
    this.misc = s.misc;
    this.has_offense = s.has_offense;
    this.has_defense = s.has_defense;
    this.has_misc = s.has_misc;
    return this;
  }
  $clone(): struct_musable { return new struct_musable().$cp(this); }
  static $size = 40;
  static $layout(): any[] { return [['offensive', 0, ['p']], ['defensive', 8, ['p']], ['misc', 16, ['p']], ['has_offense', 24, ['i', 4, 1]], ['has_defense', 28, ['i', 4, 1]], ['has_misc', 32, ['i', 4, 1]]]; }
}

/** struct mvitals: 3 bytes */
export class struct_mvitals {
  born: number = 0;
  died: number = 0;
  mvflags: number = 0;
  static $of(...a: any[]): struct_mvitals {
    const o = new struct_mvitals();
    const n = a.length;
    if (n > 0) o.born = a[0];
    if (n > 1) o.died = a[1];
    if (n > 2) o.mvflags = a[2];
    return o;
  }
  $cp(s: struct_mvitals): this {
    this.born = s.born;
    this.died = s.died;
    this.mvflags = s.mvflags;
    return this;
  }
  $clone(): struct_mvitals { return new struct_mvitals().$cp(this); }
  static $size = 3;
  static $layout(): any[] { return [['born', 0, ['i', 1, 0]], ['died', 1, ['i', 1, 0]], ['mvflags', 2, ['i', 1, 0]]]; }
}

/** struct nhcoord: 2 bytes */
export class struct_nhcoord {
  x: number = 0;
  y: number = 0;
  static $of(...a: any[]): struct_nhcoord {
    const o = new struct_nhcoord();
    const n = a.length;
    if (n > 0) o.x = a[0];
    if (n > 1) o.y = a[1];
    return o;
  }
  $cp(s: struct_nhcoord): this {
    this.x = s.x;
    this.y = s.y;
    return this;
  }
  $clone(): struct_nhcoord { return new struct_nhcoord().$cp(this); }
  static $size = 2;
  static $layout(): any[] { return [['x', 0, ['i', 1, 1]], ['y', 1, ['i', 1, 1]]]; }
}

/** struct nhrect: 4 bytes */
export class struct_nhrect {
  lx: number = 0;
  ly: number = 0;
  hx: number = 0;
  hy: number = 0;
  static $of(...a: any[]): struct_nhrect {
    const o = new struct_nhrect();
    const n = a.length;
    if (n > 0) o.lx = a[0];
    if (n > 1) o.ly = a[1];
    if (n > 2) o.hx = a[2];
    if (n > 3) o.hy = a[3];
    return o;
  }
  $cp(s: struct_nhrect): this {
    this.lx = s.lx;
    this.ly = s.ly;
    this.hx = s.hx;
    this.hy = s.hy;
    return this;
  }
  $clone(): struct_nhrect { return new struct_nhrect().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['lx', 0, ['i', 1, 1]], ['ly', 1, ['i', 1, 1]], ['hx', 2, ['i', 1, 1]], ['hy', 3, ['i', 1, 1]]]; }
}

/** struct nhregex: 72 bytes */
export class struct_nhregex {
  re: struct_re_pattern_buffer = new struct_re_pattern_buffer();
  err: number = 0;
  static $of(...a: any[]): struct_nhregex {
    const o = new struct_nhregex();
    const n = a.length;
    if (n > 0) o.re = a[0];
    if (n > 1) o.err = a[1];
    return o;
  }
  $cp(s: struct_nhregex): this {
    this.re.$cp(s.re);
    this.err = s.err;
    return this;
  }
  $clone(): struct_nhregex { return new struct_nhregex().$cp(this); }
  static $size = 72;
  static $layout(): any[] { return [['re', 0, ['r', struct_re_pattern_buffer]], ['err', 64, ['i', 4, 1]]]; }
}

/** struct novel_tracking: 40 bytes */
export class struct_novel_tracking {
  id: number = 0;
  count: number = 0;
  pasg: Int8Array = new Int8Array(30);
  static $of(...a: any[]): struct_novel_tracking {
    const o = new struct_novel_tracking();
    const n = a.length;
    if (n > 0) o.id = a[0];
    if (n > 1) o.count = a[1];
    if (n > 2) o.pasg = a[2];
    return o;
  }
  $cp(s: struct_novel_tracking): this {
    this.id = s.id;
    this.count = s.count;
    this.pasg.set(s.pasg);
    return this;
  }
  $clone(): struct_novel_tracking { return new struct_novel_tracking().$cp(this); }
  static $size = 40;
  static $layout(): any[] { return [['id', 0, ['i', 4, 0]], ['count', 4, ['i', 4, 1]], ['pasg', 8, ['a', ['i', 1, 1], 30]]]; }
}

/** struct o_range: 24 bytes */
export class struct_o_range {
  name: any = null;
  oclass: number = 0;
  f_o_range: number = 0;
  l_o_range: number = 0;
  static $of(...a: any[]): struct_o_range {
    const o = new struct_o_range();
    const n = a.length;
    if (n > 0) o.name = a[0];
    if (n > 1) o.oclass = a[1];
    if (n > 2) o.f_o_range = a[2];
    if (n > 3) o.l_o_range = a[3];
    return o;
  }
  $cp(s: struct_o_range): this {
    this.name = s.name;
    this.oclass = s.oclass;
    this.f_o_range = s.f_o_range;
    this.l_o_range = s.l_o_range;
    return this;
  }
  $clone(): struct_o_range { return new struct_o_range().$cp(this); }
  static $size = 24;
  static $layout(): any[] { return [['name', 0, ['p']], ['oclass', 8, ['i', 1, 1]], ['f_o_range', 12, ['i', 4, 1]], ['l_o_range', 16, ['i', 4, 1]]]; }
}

/** struct obj: 96 bytes */
export class struct_obj {
  nobj: struct_obj | null = null;
  v: union_vptrs = new union_vptrs();
  cobj: struct_obj | null = null;
  o_id: number = 0;
  ox: number = 0;
  oy: number = 0;
  otyp: number = 0;
  owt: number = 0;
  quan: number = 0;
  spe: number = 0;
  oclass: number = 0;
  invlet: number = 0;
  oartifact: number = 0;
  where: number = 0;
  timed: number = 0;
  cursed: number = 0;
  blessed: number = 0;
  unpaid: number = 0;
  no_charge: number = 0;
  known: number = 0;
  dknown: number = 0;
  bknown: number = 0;
  rknown: number = 0;
  oeroded: number = 0;
  oeroded2: number = 0;
  oerodeproof: number = 0;
  olocked: number = 0;
  obroken: number = 0;
  otrapped: number = 0;
  recharged: number = 0;
  lamplit: number = 0;
  globby: number = 0;
  greased: number = 0;
  nomerge: number = 0;
  was_thrown: number = 0;
  in_use: number = 0;
  bypass: number = 0;
  cknown: number = 0;
  lknown: number = 0;
  corpsenm: number = 0;
  usecount: number = 0;
  oeaten: number = 0;
  age: number = 0;
  owornmask: number = 0;
  oextra: struct_oextra | null = null;
  static $of(...a: any[]): struct_obj {
    const o = new struct_obj();
    const n = a.length;
    if (n > 0) o.nobj = a[0];
    if (n > 1) o.v = a[1];
    if (n > 2) o.cobj = a[2];
    if (n > 3) o.o_id = a[3];
    if (n > 4) o.ox = a[4];
    if (n > 5) o.oy = a[5];
    if (n > 6) o.otyp = a[6];
    if (n > 7) o.owt = a[7];
    if (n > 8) o.quan = a[8];
    if (n > 9) o.spe = a[9];
    if (n > 10) o.oclass = a[10];
    if (n > 11) o.invlet = a[11];
    if (n > 12) o.oartifact = a[12];
    if (n > 13) o.where = a[13];
    if (n > 14) o.timed = a[14];
    if (n > 15) o.cursed = a[15];
    if (n > 16) o.blessed = a[16];
    if (n > 17) o.unpaid = a[17];
    if (n > 18) o.no_charge = a[18];
    if (n > 19) o.known = a[19];
    if (n > 20) o.dknown = a[20];
    if (n > 21) o.bknown = a[21];
    if (n > 22) o.rknown = a[22];
    if (n > 23) o.oeroded = a[23];
    if (n > 24) o.oeroded2 = a[24];
    if (n > 25) o.oerodeproof = a[25];
    if (n > 26) o.olocked = a[26];
    if (n > 27) o.obroken = a[27];
    if (n > 28) o.otrapped = a[28];
    if (n > 29) o.recharged = a[29];
    if (n > 30) o.lamplit = a[30];
    if (n > 31) o.globby = a[31];
    if (n > 32) o.greased = a[32];
    if (n > 33) o.nomerge = a[33];
    if (n > 34) o.was_thrown = a[34];
    if (n > 35) o.in_use = a[35];
    if (n > 36) o.bypass = a[36];
    if (n > 37) o.cknown = a[37];
    if (n > 38) o.lknown = a[38];
    if (n > 39) o.corpsenm = a[39];
    if (n > 40) o.usecount = a[40];
    if (n > 41) o.oeaten = a[41];
    if (n > 42) o.age = a[42];
    if (n > 43) o.owornmask = a[43];
    if (n > 44) o.oextra = a[44];
    return o;
  }
  $cp(s: struct_obj): this {
    this.nobj = s.nobj;
    this.v.$cp(s.v);
    this.cobj = s.cobj;
    this.o_id = s.o_id;
    this.ox = s.ox;
    this.oy = s.oy;
    this.otyp = s.otyp;
    this.owt = s.owt;
    this.quan = s.quan;
    this.spe = s.spe;
    this.oclass = s.oclass;
    this.invlet = s.invlet;
    this.oartifact = s.oartifact;
    this.where = s.where;
    this.timed = s.timed;
    this.cursed = s.cursed;
    this.blessed = s.blessed;
    this.unpaid = s.unpaid;
    this.no_charge = s.no_charge;
    this.known = s.known;
    this.dknown = s.dknown;
    this.bknown = s.bknown;
    this.rknown = s.rknown;
    this.oeroded = s.oeroded;
    this.oeroded2 = s.oeroded2;
    this.oerodeproof = s.oerodeproof;
    this.olocked = s.olocked;
    this.obroken = s.obroken;
    this.otrapped = s.otrapped;
    this.recharged = s.recharged;
    this.lamplit = s.lamplit;
    this.globby = s.globby;
    this.greased = s.greased;
    this.nomerge = s.nomerge;
    this.was_thrown = s.was_thrown;
    this.in_use = s.in_use;
    this.bypass = s.bypass;
    this.cknown = s.cknown;
    this.lknown = s.lknown;
    this.corpsenm = s.corpsenm;
    this.usecount = s.usecount;
    this.oeaten = s.oeaten;
    this.age = s.age;
    this.owornmask = s.owornmask;
    this.oextra = s.oextra;
    return this;
  }
  $clone(): struct_obj { return new struct_obj().$cp(this); }
  static $size = 96;
  static $layout(): any[] { return [['nobj', 0, ['p']], ['v', 8, ['r', union_vptrs]], ['cobj', 16, ['p']], ['o_id', 24, ['i', 4, 0]], ['ox', 28, ['i', 1, 1]], ['oy', 29, ['i', 1, 1]], ['otyp', 30, ['i', 2, 1]], ['owt', 32, ['i', 4, 0]], ['quan', 40, ['i', 8, 1]], ['spe', 48, ['i', 1, 1]], ['oclass', 49, ['i', 1, 1]], ['invlet', 50, ['i', 1, 1]], ['oartifact', 51, ['i', 1, 1]], ['where', 52, ['i', 1, 1]], ['timed', 53, ['i', 1, 1]], ['cursed', 54, ['b', 0, 1, 0]], ['blessed', 54, ['b', 1, 1, 0]], ['unpaid', 54, ['b', 2, 1, 0]], ['no_charge', 54, ['b', 3, 1, 0]], ['known', 54, ['b', 4, 1, 0]], ['dknown', 54, ['b', 5, 1, 0]], ['bknown', 54, ['b', 6, 1, 0]], ['rknown', 54, ['b', 7, 1, 0]], ['oeroded', 55, ['b', 0, 2, 0]], ['oeroded2', 55, ['b', 2, 2, 0]], ['oerodeproof', 55, ['b', 4, 1, 0]], ['olocked', 55, ['b', 5, 1, 0]], ['obroken', 55, ['b', 6, 1, 0]], ['otrapped', 55, ['b', 7, 1, 0]], ['recharged', 56, ['b', 0, 3, 0]], ['lamplit', 56, ['b', 3, 1, 0]], ['globby', 56, ['b', 4, 1, 0]], ['greased', 56, ['b', 5, 1, 0]], ['nomerge', 56, ['b', 6, 1, 0]], ['was_thrown', 56, ['b', 7, 1, 0]], ['in_use', 57, ['b', 0, 1, 0]], ['bypass', 57, ['b', 1, 1, 0]], ['cknown', 57, ['b', 2, 1, 0]], ['lknown', 57, ['b', 3, 1, 0]], ['corpsenm', 60, ['i', 4, 1]], ['usecount', 64, ['i', 4, 1]], ['oeaten', 68, ['i', 4, 0]], ['age', 72, ['i', 8, 1]], ['owornmask', 80, ['i', 8, 1]], ['oextra', 88, ['p']]]; }
}

/** struct obj_split: 8 bytes */
export class struct_obj_split {
  parent_oid: number = 0;
  child_oid: number = 0;
  static $of(...a: any[]): struct_obj_split {
    const o = new struct_obj_split();
    const n = a.length;
    if (n > 0) o.parent_oid = a[0];
    if (n > 1) o.child_oid = a[1];
    return o;
  }
  $cp(s: struct_obj_split): this {
    this.parent_oid = s.parent_oid;
    this.child_oid = s.child_oid;
    return this;
  }
  $clone(): struct_obj_split { return new struct_obj_split().$cp(this); }
  static $size = 8;
  static $layout(): any[] { return [['parent_oid', 0, ['i', 4, 0]], ['child_oid', 4, ['i', 4, 0]]]; }
}

/** struct objclass: 40 bytes */
export class struct_objclass {
  oc_name_idx: number = 0;
  oc_descr_idx: number = 0;
  oc_uname: any = null;
  oc_name_known: number = 0;
  oc_merge: number = 0;
  oc_uses_known: number = 0;
  oc_pre_discovered: number = 0;
  oc_magic: number = 0;
  oc_charged: number = 0;
  oc_unique: number = 0;
  oc_nowish: number = 0;
  oc_big: number = 0;
  oc_tough: number = 0;
  oc_dir: number = 0;
  oc_material: number = 0;
  oc_subtyp: number = 0;
  oc_oprop: number = 0;
  oc_class: number = 0;
  oc_delay: number = 0;
  oc_color: number = 0;
  oc_prob: number = 0;
  oc_weight: number = 0;
  oc_cost: number = 0;
  oc_wsdam: number = 0;
  oc_wldam: number = 0;
  oc_oc1: number = 0;
  oc_oc2: number = 0;
  oc_nutrition: number = 0;
  static $of(...a: any[]): struct_objclass {
    const o = new struct_objclass();
    const n = a.length;
    if (n > 0) o.oc_name_idx = a[0];
    if (n > 1) o.oc_descr_idx = a[1];
    if (n > 2) o.oc_uname = a[2];
    if (n > 3) o.oc_name_known = a[3];
    if (n > 4) o.oc_merge = a[4];
    if (n > 5) o.oc_uses_known = a[5];
    if (n > 6) o.oc_pre_discovered = a[6];
    if (n > 7) o.oc_magic = a[7];
    if (n > 8) o.oc_charged = a[8];
    if (n > 9) o.oc_unique = a[9];
    if (n > 10) o.oc_nowish = a[10];
    if (n > 11) o.oc_big = a[11];
    if (n > 12) o.oc_tough = a[12];
    if (n > 13) o.oc_dir = a[13];
    if (n > 14) o.oc_material = a[14];
    if (n > 15) o.oc_subtyp = a[15];
    if (n > 16) o.oc_oprop = a[16];
    if (n > 17) o.oc_class = a[17];
    if (n > 18) o.oc_delay = a[18];
    if (n > 19) o.oc_color = a[19];
    if (n > 20) o.oc_prob = a[20];
    if (n > 21) o.oc_weight = a[21];
    if (n > 22) o.oc_cost = a[22];
    if (n > 23) o.oc_wsdam = a[23];
    if (n > 24) o.oc_wldam = a[24];
    if (n > 25) o.oc_oc1 = a[25];
    if (n > 26) o.oc_oc2 = a[26];
    if (n > 27) o.oc_nutrition = a[27];
    return o;
  }
  $cp(s: struct_objclass): this {
    this.oc_name_idx = s.oc_name_idx;
    this.oc_descr_idx = s.oc_descr_idx;
    this.oc_uname = s.oc_uname;
    this.oc_name_known = s.oc_name_known;
    this.oc_merge = s.oc_merge;
    this.oc_uses_known = s.oc_uses_known;
    this.oc_pre_discovered = s.oc_pre_discovered;
    this.oc_magic = s.oc_magic;
    this.oc_charged = s.oc_charged;
    this.oc_unique = s.oc_unique;
    this.oc_nowish = s.oc_nowish;
    this.oc_big = s.oc_big;
    this.oc_tough = s.oc_tough;
    this.oc_dir = s.oc_dir;
    this.oc_material = s.oc_material;
    this.oc_subtyp = s.oc_subtyp;
    this.oc_oprop = s.oc_oprop;
    this.oc_class = s.oc_class;
    this.oc_delay = s.oc_delay;
    this.oc_color = s.oc_color;
    this.oc_prob = s.oc_prob;
    this.oc_weight = s.oc_weight;
    this.oc_cost = s.oc_cost;
    this.oc_wsdam = s.oc_wsdam;
    this.oc_wldam = s.oc_wldam;
    this.oc_oc1 = s.oc_oc1;
    this.oc_oc2 = s.oc_oc2;
    this.oc_nutrition = s.oc_nutrition;
    return this;
  }
  $clone(): struct_objclass { return new struct_objclass().$cp(this); }
  static $size = 40;
  static $layout(): any[] { return [['oc_name_idx', 0, ['i', 2, 1]], ['oc_descr_idx', 2, ['i', 2, 1]], ['oc_uname', 8, ['p']], ['oc_name_known', 16, ['b', 0, 1, 0]], ['oc_merge', 16, ['b', 1, 1, 0]], ['oc_uses_known', 16, ['b', 2, 1, 0]], ['oc_pre_discovered', 16, ['b', 3, 1, 0]], ['oc_magic', 16, ['b', 4, 1, 0]], ['oc_charged', 16, ['b', 5, 1, 0]], ['oc_unique', 16, ['b', 6, 1, 0]], ['oc_nowish', 16, ['b', 7, 1, 0]], ['oc_big', 17, ['b', 0, 1, 0]], ['oc_tough', 17, ['b', 1, 1, 0]], ['oc_dir', 17, ['b', 2, 2, 0]], ['oc_material', 17, ['b', 4, 5, 0]], ['oc_subtyp', 19, ['i', 1, 1]], ['oc_oprop', 20, ['i', 1, 0]], ['oc_class', 21, ['i', 1, 1]], ['oc_delay', 22, ['i', 1, 1]], ['oc_color', 23, ['i', 1, 0]], ['oc_prob', 24, ['i', 2, 1]], ['oc_weight', 26, ['i', 2, 0]], ['oc_cost', 28, ['i', 2, 1]], ['oc_wsdam', 30, ['i', 1, 1]], ['oc_wldam', 31, ['i', 1, 1]], ['oc_oc1', 32, ['i', 1, 1]], ['oc_oc2', 33, ['i', 1, 1]], ['oc_nutrition', 34, ['i', 2, 0]]]; }
}

/** struct objdescr: 16 bytes */
export class struct_objdescr {
  oc_name: any = null;
  oc_descr: any = null;
  static $of(...a: any[]): struct_objdescr {
    const o = new struct_objdescr();
    const n = a.length;
    if (n > 0) o.oc_name = a[0];
    if (n > 1) o.oc_descr = a[1];
    return o;
  }
  $cp(s: struct_objdescr): this {
    this.oc_name = s.oc_name;
    this.oc_descr = s.oc_descr;
    return this;
  }
  $clone(): struct_objdescr { return new struct_objdescr().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['oc_name', 0, ['p']], ['oc_descr', 8, ['p']]]; }
}

/** struct object: 56 bytes */
export class struct_object {
  name: union_str_or_len = new union_str_or_len();
  corpsenm: number = 0;
  id: number = 0;
  spe: number = 0;
  coord: number = 0;
  x: number = 0;
  y: number = 0;
  class: number = 0;
  containment: number = 0;
  curse_state: number = 0;
  quan: number = 0;
  buried: number = 0;
  lit: number = 0;
  eroded: number = 0;
  locked: number = 0;
  trapped: number = 0;
  recharged: number = 0;
  invis: number = 0;
  greased: number = 0;
  broken: number = 0;
  static $of(...a: any[]): struct_object {
    const o = new struct_object();
    const n = a.length;
    if (n > 0) o.name = a[0];
    if (n > 1) o.corpsenm = a[1];
    if (n > 2) o.id = a[2];
    if (n > 3) o.spe = a[3];
    if (n > 4) o.coord = a[4];
    if (n > 5) o.x = a[5];
    if (n > 6) o.y = a[6];
    if (n > 7) o.class = a[7];
    if (n > 8) o.containment = a[8];
    if (n > 9) o.curse_state = a[9];
    if (n > 10) o.quan = a[10];
    if (n > 11) o.buried = a[11];
    if (n > 12) o.lit = a[12];
    if (n > 13) o.eroded = a[13];
    if (n > 14) o.locked = a[14];
    if (n > 15) o.trapped = a[15];
    if (n > 16) o.recharged = a[16];
    if (n > 17) o.invis = a[17];
    if (n > 18) o.greased = a[18];
    if (n > 19) o.broken = a[19];
    return o;
  }
  $cp(s: struct_object): this {
    this.name.$cp(s.name);
    this.corpsenm = s.corpsenm;
    this.id = s.id;
    this.spe = s.spe;
    this.coord = s.coord;
    this.x = s.x;
    this.y = s.y;
    this.class = s.class;
    this.containment = s.containment;
    this.curse_state = s.curse_state;
    this.quan = s.quan;
    this.buried = s.buried;
    this.lit = s.lit;
    this.eroded = s.eroded;
    this.locked = s.locked;
    this.trapped = s.trapped;
    this.recharged = s.recharged;
    this.invis = s.invis;
    this.greased = s.greased;
    this.broken = s.broken;
    return this;
  }
  $clone(): struct_object { return new struct_object().$cp(this); }
  static $size = 56;
  static $layout(): any[] { return [['name', 0, ['r', union_str_or_len]], ['corpsenm', 8, ['i', 4, 1]], ['id', 12, ['i', 2, 1]], ['spe', 14, ['i', 2, 1]], ['coord', 16, ['i', 8, 1]], ['x', 24, ['i', 1, 1]], ['y', 25, ['i', 1, 1]], ['class', 26, ['i', 1, 1]], ['containment', 27, ['i', 1, 1]], ['curse_state', 28, ['i', 1, 1]], ['quan', 32, ['i', 4, 1]], ['buried', 36, ['i', 2, 1]], ['lit', 38, ['i', 2, 1]], ['eroded', 40, ['i', 2, 1]], ['locked', 42, ['i', 2, 1]], ['trapped', 44, ['i', 2, 1]], ['recharged', 46, ['i', 2, 1]], ['invis', 48, ['i', 2, 1]], ['greased', 50, ['i', 2, 1]], ['broken', 52, ['i', 2, 1]]]; }
}

/** struct oextra: 40 bytes */
export class struct_oextra {
  oname: any = null;
  omonst: struct_monst | null = null;
  omid: any = null;
  olong: any = null;
  omailcmd: any = null;
  static $of(...a: any[]): struct_oextra {
    const o = new struct_oextra();
    const n = a.length;
    if (n > 0) o.oname = a[0];
    if (n > 1) o.omonst = a[1];
    if (n > 2) o.omid = a[2];
    if (n > 3) o.olong = a[3];
    if (n > 4) o.omailcmd = a[4];
    return o;
  }
  $cp(s: struct_oextra): this {
    this.oname = s.oname;
    this.omonst = s.omonst;
    this.omid = s.omid;
    this.olong = s.olong;
    this.omailcmd = s.omailcmd;
    return this;
  }
  $clone(): struct_oextra { return new struct_oextra().$cp(this); }
  static $size = 40;
  static $layout(): any[] { return [['oname', 0, ['p']], ['omonst', 8, ['p']], ['omid', 16, ['p']], ['olong', 24, ['p']], ['omailcmd', 32, ['p']]]; }
}

/** struct opvar: 16 bytes */
export class struct_opvar {
  spovartyp: number = 0;
  vardata: anon_decl_h_412 = new anon_decl_h_412();
  static $of(...a: any[]): struct_opvar {
    const o = new struct_opvar();
    const n = a.length;
    if (n > 0) o.spovartyp = a[0];
    if (n > 1) o.vardata = a[1];
    return o;
  }
  $cp(s: struct_opvar): this {
    this.spovartyp = s.spovartyp;
    this.vardata.$cp(s.vardata);
    return this;
  }
  $clone(): struct_opvar { return new struct_opvar().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['spovartyp', 0, ['i', 1, 1]], ['vardata', 8, ['r', anon_decl_h_412]]]; }
}

/** struct other_opts: 24 bytes */
export class struct_other_opts {
  name: any = null;
  optflags: number = 0;
  code: number = 0;
  othr_count_func: any = null;
  static $of(...a: any[]): struct_other_opts {
    const o = new struct_other_opts();
    const n = a.length;
    if (n > 0) o.name = a[0];
    if (n > 1) o.optflags = a[1];
    if (n > 2) o.code = a[2];
    if (n > 3) o.othr_count_func = a[3];
    return o;
  }
  $cp(s: struct_other_opts): this {
    this.name = s.name;
    this.optflags = s.optflags;
    this.code = s.code;
    this.othr_count_func = s.othr_count_func;
    return this;
  }
  $clone(): struct_other_opts { return new struct_other_opts().$cp(this); }
  static $size = 24;
  static $layout(): any[] { return [['name', 0, ['p']], ['optflags', 8, ['i', 4, 1]], ['code', 12, ['i', 4, 1]], ['othr_count_func', 16, ['p']]]; }
}

/** struct paranoia_opts: 48 bytes */
export class struct_paranoia_opts {
  flagmask: number = 0;
  argname: any = null;
  argMinLen: number = 0;
  synonym: any = null;
  synMinLen: number = 0;
  explain: any = null;
  static $of(...a: any[]): struct_paranoia_opts {
    const o = new struct_paranoia_opts();
    const n = a.length;
    if (n > 0) o.flagmask = a[0];
    if (n > 1) o.argname = a[1];
    if (n > 2) o.argMinLen = a[2];
    if (n > 3) o.synonym = a[3];
    if (n > 4) o.synMinLen = a[4];
    if (n > 5) o.explain = a[5];
    return o;
  }
  $cp(s: struct_paranoia_opts): this {
    this.flagmask = s.flagmask;
    this.argname = s.argname;
    this.argMinLen = s.argMinLen;
    this.synonym = s.synonym;
    this.synMinLen = s.synMinLen;
    this.explain = s.explain;
    return this;
  }
  $clone(): struct_paranoia_opts { return new struct_paranoia_opts().$cp(this); }
  static $size = 48;
  static $layout(): any[] { return [['flagmask', 0, ['i', 4, 1]], ['argname', 8, ['p']], ['argMinLen', 16, ['i', 4, 1]], ['synonym', 24, ['p']], ['synMinLen', 32, ['i', 4, 1]], ['explain', 40, ['p']]]; }
}

/** struct passwd: 48 bytes */
export class struct_passwd {
  pw_name: any = null;
  pw_passwd: any = null;
  pw_uid: number = 0;
  pw_gid: number = 0;
  pw_gecos: any = null;
  pw_dir: any = null;
  pw_shell: any = null;
  static $of(...a: any[]): struct_passwd {
    const o = new struct_passwd();
    const n = a.length;
    if (n > 0) o.pw_name = a[0];
    if (n > 1) o.pw_passwd = a[1];
    if (n > 2) o.pw_uid = a[2];
    if (n > 3) o.pw_gid = a[3];
    if (n > 4) o.pw_gecos = a[4];
    if (n > 5) o.pw_dir = a[5];
    if (n > 6) o.pw_shell = a[6];
    return o;
  }
  $cp(s: struct_passwd): this {
    this.pw_name = s.pw_name;
    this.pw_passwd = s.pw_passwd;
    this.pw_uid = s.pw_uid;
    this.pw_gid = s.pw_gid;
    this.pw_gecos = s.pw_gecos;
    this.pw_dir = s.pw_dir;
    this.pw_shell = s.pw_shell;
    return this;
  }
  $clone(): struct_passwd { return new struct_passwd().$cp(this); }
  static $size = 48;
  static $layout(): any[] { return [['pw_name', 0, ['p']], ['pw_passwd', 8, ['p']], ['pw_uid', 16, ['i', 4, 0]], ['pw_gid', 20, ['i', 4, 0]], ['pw_gecos', 24, ['p']], ['pw_dir', 32, ['p']], ['pw_shell', 40, ['p']]]; }
}

/** struct permonst: 72 bytes */
export class struct_permonst {
  mname: any = null;
  mlet: number = 0;
  mlevel: number = 0;
  mmove: number = 0;
  ac: number = 0;
  mr: number = 0;
  maligntyp: number = 0;
  geno: number = 0;
  mattk: any[] = $sarr(struct_attack, 6);
  cwt: number = 0;
  cnutrit: number = 0;
  msound: number = 0;
  msize: number = 0;
  mresists: number = 0;
  mconveys: number = 0;
  mflags1: number = 0;
  mflags2: number = 0;
  mflags3: number = 0;
  difficulty: number = 0;
  mcolor: number = 0;
  static $of(...a: any[]): struct_permonst {
    const o = new struct_permonst();
    const n = a.length;
    if (n > 0) o.mname = a[0];
    if (n > 1) o.mlet = a[1];
    if (n > 2) o.mlevel = a[2];
    if (n > 3) o.mmove = a[3];
    if (n > 4) o.ac = a[4];
    if (n > 5) o.mr = a[5];
    if (n > 6) o.maligntyp = a[6];
    if (n > 7) o.geno = a[7];
    if (n > 8) o.mattk = a[8];
    if (n > 9) o.cwt = a[9];
    if (n > 10) o.cnutrit = a[10];
    if (n > 11) o.msound = a[11];
    if (n > 12) o.msize = a[12];
    if (n > 13) o.mresists = a[13];
    if (n > 14) o.mconveys = a[14];
    if (n > 15) o.mflags1 = a[15];
    if (n > 16) o.mflags2 = a[16];
    if (n > 17) o.mflags3 = a[17];
    if (n > 18) o.difficulty = a[18];
    if (n > 19) o.mcolor = a[19];
    return o;
  }
  $cp(s: struct_permonst): this {
    this.mname = s.mname;
    this.mlet = s.mlet;
    this.mlevel = s.mlevel;
    this.mmove = s.mmove;
    this.ac = s.ac;
    this.mr = s.mr;
    this.maligntyp = s.maligntyp;
    this.geno = s.geno;
    $cparr(this.mattk, s.mattk);
    this.cwt = s.cwt;
    this.cnutrit = s.cnutrit;
    this.msound = s.msound;
    this.msize = s.msize;
    this.mresists = s.mresists;
    this.mconveys = s.mconveys;
    this.mflags1 = s.mflags1;
    this.mflags2 = s.mflags2;
    this.mflags3 = s.mflags3;
    this.difficulty = s.difficulty;
    this.mcolor = s.mcolor;
    return this;
  }
  $clone(): struct_permonst { return new struct_permonst().$cp(this); }
  static $size = 72;
  static $layout(): any[] { return [['mname', 0, ['p']], ['mlet', 8, ['i', 1, 1]], ['mlevel', 9, ['i', 1, 1]], ['mmove', 10, ['i', 1, 1]], ['ac', 11, ['i', 1, 1]], ['mr', 12, ['i', 1, 1]], ['maligntyp', 13, ['i', 1, 1]], ['geno', 14, ['i', 2, 0]], ['mattk', 16, ['a', ['r', struct_attack], 6]], ['cwt', 40, ['i', 2, 0]], ['cnutrit', 42, ['i', 2, 0]], ['msound', 44, ['i', 1, 0]], ['msize', 45, ['i', 1, 0]], ['mresists', 46, ['i', 1, 0]], ['mconveys', 47, ['i', 1, 0]], ['mflags1', 48, ['i', 8, 0]], ['mflags2', 56, ['i', 8, 0]], ['mflags3', 64, ['i', 2, 0]], ['difficulty', 66, ['i', 1, 0]], ['mcolor', 67, ['i', 1, 0]]]; }
}

/** struct plinemsg_type: 32 bytes */
export class struct_plinemsg_type {
  msgtype: number = 0;
  regex: struct_nhregex | null = null;
  pattern: any = null;
  next: struct_plinemsg_type | null = null;
  static $of(...a: any[]): struct_plinemsg_type {
    const o = new struct_plinemsg_type();
    const n = a.length;
    if (n > 0) o.msgtype = a[0];
    if (n > 1) o.regex = a[1];
    if (n > 2) o.pattern = a[2];
    if (n > 3) o.next = a[3];
    return o;
  }
  $cp(s: struct_plinemsg_type): this {
    this.msgtype = s.msgtype;
    this.regex = s.regex;
    this.pattern = s.pattern;
    this.next = s.next;
    return this;
  }
  $clone(): struct_plinemsg_type { return new struct_plinemsg_type().$cp(this); }
  static $size = 32;
  static $layout(): any[] { return [['msgtype', 0, ['i', 1, 1]], ['regex', 8, ['p']], ['pattern', 16, ['p']], ['next', 24, ['p']]]; }
}

/** struct poison_effect_message: 16 bytes */
export class struct_poison_effect_message {
  delivery_func: any = null;
  effect_msg: any = null;
  static $of(...a: any[]): struct_poison_effect_message {
    const o = new struct_poison_effect_message();
    const n = a.length;
    if (n > 0) o.delivery_func = a[0];
    if (n > 1) o.effect_msg = a[1];
    return o;
  }
  $cp(s: struct_poison_effect_message): this {
    this.delivery_func = s.delivery_func;
    this.effect_msg = s.effect_msg;
    return this;
  }
  $clone(): struct_poison_effect_message { return new struct_poison_effect_message().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['delivery_func', 0, ['p']], ['effect_msg', 8, ['p']]]; }
}

/** struct polearm_info: 16 bytes */
export class struct_polearm_info {
  hitmon: struct_monst | null = null;
  m_id: number = 0;
  static $of(...a: any[]): struct_polearm_info {
    const o = new struct_polearm_info();
    const n = a.length;
    if (n > 0) o.hitmon = a[0];
    if (n > 1) o.m_id = a[1];
    return o;
  }
  $cp(s: struct_polearm_info): this {
    this.hitmon = s.hitmon;
    this.m_id = s.m_id;
    return this;
  }
  $clone(): struct_polearm_info { return new struct_polearm_info().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['hitmon', 0, ['p']], ['m_id', 8, ['i', 4, 0]]]; }
}

/** struct prop: 24 bytes */
export class struct_prop {
  extrinsic: number = 0;
  blocked: number = 0;
  intrinsic: number = 0;
  static $of(...a: any[]): struct_prop {
    const o = new struct_prop();
    const n = a.length;
    if (n > 0) o.extrinsic = a[0];
    if (n > 1) o.blocked = a[1];
    if (n > 2) o.intrinsic = a[2];
    return o;
  }
  $cp(s: struct_prop): this {
    this.extrinsic = s.extrinsic;
    this.blocked = s.blocked;
    this.intrinsic = s.intrinsic;
    return this;
  }
  $clone(): struct_prop { return new struct_prop().$cp(this); }
  static $size = 24;
  static $layout(): any[] { return [['extrinsic', 0, ['i', 8, 1]], ['blocked', 8, ['i', 8, 1]], ['intrinsic', 16, ['i', 8, 1]]]; }
}

/** struct propname: 16 bytes */
export class struct_propname {
  prop_num: number = 0;
  prop_name: any = null;
  static $of(...a: any[]): struct_propname {
    const o = new struct_propname();
    const n = a.length;
    if (n > 0) o.prop_num = a[0];
    if (n > 1) o.prop_name = a[1];
    return o;
  }
  $cp(s: struct_propname): this {
    this.prop_num = s.prop_num;
    this.prop_name = s.prop_name;
    return this;
  }
  $clone(): struct_propname { return new struct_propname().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['prop_num', 0, ['i', 4, 1]], ['prop_name', 8, ['p']]]; }
}

/** struct proto_dungeon: 5312 bytes */
export class struct_proto_dungeon {
  tmpdungeon: any[] = $sarr(struct_tmpdungeon, 16);
  tmplevel: any[] = $sarr(struct_tmplevel, 50);
  final_lev: any[] = new Array(50).fill(null);
  tmpbranch: any[] = $sarr(struct_tmpbranch, 32);
  start: number = 0;
  n_levs: number = 0;
  n_brs: number = 0;
  static $of(...a: any[]): struct_proto_dungeon {
    const o = new struct_proto_dungeon();
    const n = a.length;
    if (n > 0) o.tmpdungeon = a[0];
    if (n > 1) o.tmplevel = a[1];
    if (n > 2) o.final_lev = a[2];
    if (n > 3) o.tmpbranch = a[3];
    if (n > 4) o.start = a[4];
    if (n > 5) o.n_levs = a[5];
    if (n > 6) o.n_brs = a[6];
    return o;
  }
  $cp(s: struct_proto_dungeon): this {
    $cparr(this.tmpdungeon, s.tmpdungeon);
    $cparr(this.tmplevel, s.tmplevel);
    $cpvals(this.final_lev, s.final_lev);
    $cparr(this.tmpbranch, s.tmpbranch);
    this.start = s.start;
    this.n_levs = s.n_levs;
    this.n_brs = s.n_brs;
    return this;
  }
  $clone(): struct_proto_dungeon { return new struct_proto_dungeon().$cp(this); }
  static $size = 5312;
  static $layout(): any[] { return [['tmpdungeon', 0, ['a', ['r', struct_tmpdungeon], 16]], ['tmplevel', 1216, ['a', ['r', struct_tmplevel], 50]], ['final_lev', 3616, ['a', ['p'], 50]], ['tmpbranch', 4016, ['a', ['r', struct_tmpbranch], 32]], ['start', 5296, ['i', 4, 1]], ['n_levs', 5300, ['i', 4, 1]], ['n_brs', 5304, ['i', 4, 1]]]; }
}

/** struct q_score: 8 bytes */
export class struct_q_score {
  first_start: number = 0;
  met_leader: number = 0;
  not_ready: number = 0;
  pissed_off: number = 0;
  got_quest: number = 0;
  first_locate: number = 0;
  met_intermed: number = 0;
  got_final: number = 0;
  made_goal: number = 0;
  met_nemesis: number = 0;
  killed_nemesis: number = 0;
  in_battle: number = 0;
  cheater: number = 0;
  touched_artifact: number = 0;
  offered_artifact: number = 0;
  got_thanks: number = 0;
  ldrgend: number = 0;
  nemgend: number = 0;
  godgend: number = 0;
  leader_is_dead: number = 0;
  leader_m_id: number = 0;
  static $of(...a: any[]): struct_q_score {
    const o = new struct_q_score();
    const n = a.length;
    if (n > 0) o.first_start = a[0];
    if (n > 1) o.met_leader = a[1];
    if (n > 2) o.not_ready = a[2];
    if (n > 3) o.pissed_off = a[3];
    if (n > 4) o.got_quest = a[4];
    if (n > 5) o.first_locate = a[5];
    if (n > 6) o.met_intermed = a[6];
    if (n > 7) o.got_final = a[7];
    if (n > 8) o.made_goal = a[8];
    if (n > 9) o.met_nemesis = a[9];
    if (n > 10) o.killed_nemesis = a[10];
    if (n > 11) o.in_battle = a[11];
    if (n > 12) o.cheater = a[12];
    if (n > 13) o.touched_artifact = a[13];
    if (n > 14) o.offered_artifact = a[14];
    if (n > 15) o.got_thanks = a[15];
    if (n > 16) o.ldrgend = a[16];
    if (n > 17) o.nemgend = a[17];
    if (n > 18) o.godgend = a[18];
    if (n > 19) o.leader_is_dead = a[19];
    if (n > 20) o.leader_m_id = a[20];
    return o;
  }
  $cp(s: struct_q_score): this {
    this.first_start = s.first_start;
    this.met_leader = s.met_leader;
    this.not_ready = s.not_ready;
    this.pissed_off = s.pissed_off;
    this.got_quest = s.got_quest;
    this.first_locate = s.first_locate;
    this.met_intermed = s.met_intermed;
    this.got_final = s.got_final;
    this.made_goal = s.made_goal;
    this.met_nemesis = s.met_nemesis;
    this.killed_nemesis = s.killed_nemesis;
    this.in_battle = s.in_battle;
    this.cheater = s.cheater;
    this.touched_artifact = s.touched_artifact;
    this.offered_artifact = s.offered_artifact;
    this.got_thanks = s.got_thanks;
    this.ldrgend = s.ldrgend;
    this.nemgend = s.nemgend;
    this.godgend = s.godgend;
    this.leader_is_dead = s.leader_is_dead;
    this.leader_m_id = s.leader_m_id;
    return this;
  }
  $clone(): struct_q_score { return new struct_q_score().$cp(this); }
  static $size = 8;
  static $layout(): any[] { return [['first_start', 0, ['b', 0, 1, 0]], ['met_leader', 0, ['b', 1, 1, 0]], ['not_ready', 0, ['b', 2, 3, 0]], ['pissed_off', 0, ['b', 5, 1, 0]], ['got_quest', 0, ['b', 6, 1, 0]], ['first_locate', 0, ['b', 7, 1, 0]], ['met_intermed', 1, ['b', 0, 1, 0]], ['got_final', 1, ['b', 1, 1, 0]], ['made_goal', 1, ['b', 2, 3, 0]], ['met_nemesis', 1, ['b', 5, 1, 0]], ['killed_nemesis', 1, ['b', 6, 1, 0]], ['in_battle', 1, ['b', 7, 1, 0]], ['cheater', 2, ['b', 0, 1, 0]], ['touched_artifact', 2, ['b', 1, 1, 0]], ['offered_artifact', 2, ['b', 2, 1, 0]], ['got_thanks', 2, ['b', 3, 1, 0]], ['ldrgend', 2, ['b', 4, 2, 0]], ['nemgend', 2, ['b', 6, 2, 0]], ['godgend', 3, ['b', 0, 2, 0]], ['leader_is_dead', 3, ['b', 2, 1, 0]], ['leader_m_id', 4, ['i', 4, 0]]]; }
}

/** struct qmchoices: 16 bytes */
export class struct_qmchoices {
  mndx: number = 0;
  mlet: number = 0;
  mappearance: number = 0;
  m_ap_type: number = 0;
  static $of(...a: any[]): struct_qmchoices {
    const o = new struct_qmchoices();
    const n = a.length;
    if (n > 0) o.mndx = a[0];
    if (n > 1) o.mlet = a[1];
    if (n > 2) o.mappearance = a[2];
    if (n > 3) o.m_ap_type = a[3];
    return o;
  }
  $cp(s: struct_qmchoices): this {
    this.mndx = s.mndx;
    this.mlet = s.mlet;
    this.mappearance = s.mappearance;
    this.m_ap_type = s.m_ap_type;
    return this;
  }
  $clone(): struct_qmchoices { return new struct_qmchoices().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['mndx', 0, ['i', 4, 1]], ['mlet', 4, ['i', 1, 1]], ['mappearance', 8, ['i', 4, 0]], ['m_ap_type', 12, ['i', 1, 0]]]; }
}

/** struct qtlists: 16 bytes */
export class struct_qtlists {
  common: struct_qtmsg | null = null;
  chrole: struct_qtmsg | null = null;
  static $of(...a: any[]): struct_qtlists {
    const o = new struct_qtlists();
    const n = a.length;
    if (n > 0) o.common = a[0];
    if (n > 1) o.chrole = a[1];
    return o;
  }
  $cp(s: struct_qtlists): this {
    this.common = s.common;
    this.chrole = s.chrole;
    return this;
  }
  $clone(): struct_qtlists { return new struct_qtlists().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['common', 0, ['p']], ['chrole', 8, ['p']]]; }
}

/** struct qtmsg: 32 bytes */
export class struct_qtmsg {
  msgnum: number = 0;
  delivery: number = 0;
  offset: number = 0;
  size: number = 0;
  summary_size: number = 0;
  static $of(...a: any[]): struct_qtmsg {
    const o = new struct_qtmsg();
    const n = a.length;
    if (n > 0) o.msgnum = a[0];
    if (n > 1) o.delivery = a[1];
    if (n > 2) o.offset = a[2];
    if (n > 3) o.size = a[3];
    if (n > 4) o.summary_size = a[4];
    return o;
  }
  $cp(s: struct_qtmsg): this {
    this.msgnum = s.msgnum;
    this.delivery = s.delivery;
    this.offset = s.offset;
    this.size = s.size;
    this.summary_size = s.summary_size;
    return this;
  }
  $clone(): struct_qtmsg { return new struct_qtmsg().$cp(this); }
  static $size = 32;
  static $layout(): any[] { return [['msgnum', 0, ['i', 4, 1]], ['delivery', 4, ['i', 1, 1]], ['offset', 8, ['i', 8, 1]], ['size', 16, ['i', 8, 1]], ['summary_size', 24, ['i', 8, 1]]]; }
}

/** struct re_pattern_buffer: 64 bytes */
export class struct_re_pattern_buffer {
  buffer: any = null;
  allocated: number = 0;
  used: number = 0;
  syntax: number = 0;
  fastmap: any = null;
  translate: any = null;
  re_nsub: number = 0;
  can_be_null: number = 0;
  regs_allocated: number = 0;
  fastmap_accurate: number = 0;
  no_sub: number = 0;
  not_bol: number = 0;
  not_eol: number = 0;
  newline_anchor: number = 0;
  static $of(...a: any[]): struct_re_pattern_buffer {
    const o = new struct_re_pattern_buffer();
    const n = a.length;
    if (n > 0) o.buffer = a[0];
    if (n > 1) o.allocated = a[1];
    if (n > 2) o.used = a[2];
    if (n > 3) o.syntax = a[3];
    if (n > 4) o.fastmap = a[4];
    if (n > 5) o.translate = a[5];
    if (n > 6) o.re_nsub = a[6];
    if (n > 7) o.can_be_null = a[7];
    if (n > 8) o.regs_allocated = a[8];
    if (n > 9) o.fastmap_accurate = a[9];
    if (n > 10) o.no_sub = a[10];
    if (n > 11) o.not_bol = a[11];
    if (n > 12) o.not_eol = a[12];
    if (n > 13) o.newline_anchor = a[13];
    return o;
  }
  $cp(s: struct_re_pattern_buffer): this {
    this.buffer = s.buffer;
    this.allocated = s.allocated;
    this.used = s.used;
    this.syntax = s.syntax;
    this.fastmap = s.fastmap;
    this.translate = s.translate;
    this.re_nsub = s.re_nsub;
    this.can_be_null = s.can_be_null;
    this.regs_allocated = s.regs_allocated;
    this.fastmap_accurate = s.fastmap_accurate;
    this.no_sub = s.no_sub;
    this.not_bol = s.not_bol;
    this.not_eol = s.not_eol;
    this.newline_anchor = s.newline_anchor;
    return this;
  }
  $clone(): struct_re_pattern_buffer { return new struct_re_pattern_buffer().$cp(this); }
  static $size = 64;
  static $layout(): any[] { return [['buffer', 0, ['p']], ['allocated', 8, ['i', 8, 0]], ['used', 16, ['i', 8, 0]], ['syntax', 24, ['i', 8, 0]], ['fastmap', 32, ['p']], ['translate', 40, ['p']], ['re_nsub', 48, ['i', 8, 0]], ['can_be_null', 56, ['b', 0, 1, 0]], ['regs_allocated', 56, ['b', 1, 2, 0]], ['fastmap_accurate', 56, ['b', 3, 1, 0]], ['no_sub', 56, ['b', 4, 1, 0]], ['not_bol', 56, ['b', 5, 1, 0]], ['not_eol', 56, ['b', 6, 1, 0]], ['newline_anchor', 56, ['b', 7, 1, 0]]]; }
}

/** struct region: 7 bytes */
export class struct_region {
  x1: number = 0;
  y1: number = 0;
  x2: number = 0;
  y2: number = 0;
  rtype: number = 0;
  rlit: number = 0;
  rirreg: number = 0;
  static $of(...a: any[]): struct_region {
    const o = new struct_region();
    const n = a.length;
    if (n > 0) o.x1 = a[0];
    if (n > 1) o.y1 = a[1];
    if (n > 2) o.x2 = a[2];
    if (n > 3) o.y2 = a[3];
    if (n > 4) o.rtype = a[4];
    if (n > 5) o.rlit = a[5];
    if (n > 6) o.rirreg = a[6];
    return o;
  }
  $cp(s: struct_region): this {
    this.x1 = s.x1;
    this.y1 = s.y1;
    this.x2 = s.x2;
    this.y2 = s.y2;
    this.rtype = s.rtype;
    this.rlit = s.rlit;
    this.rirreg = s.rirreg;
    return this;
  }
  $clone(): struct_region { return new struct_region().$cp(this); }
  static $size = 7;
  static $layout(): any[] { return [['x1', 0, ['i', 1, 1]], ['y1', 1, ['i', 1, 1]], ['x2', 2, ['i', 1, 1]], ['y2', 3, ['i', 1, 1]], ['rtype', 4, ['i', 1, 1]], ['rlit', 5, ['i', 1, 1]], ['rirreg', 6, ['i', 1, 1]]]; }
}

/** struct replaceterrain: 8 bytes */
export class struct_replaceterrain {
  chance: number = 0;
  x1: number = 0;
  y1: number = 0;
  x2: number = 0;
  y2: number = 0;
  fromter: number = 0;
  toter: number = 0;
  tolit: number = 0;
  static $of(...a: any[]): struct_replaceterrain {
    const o = new struct_replaceterrain();
    const n = a.length;
    if (n > 0) o.chance = a[0];
    if (n > 1) o.x1 = a[1];
    if (n > 2) o.y1 = a[2];
    if (n > 3) o.x2 = a[3];
    if (n > 4) o.y2 = a[4];
    if (n > 5) o.fromter = a[5];
    if (n > 6) o.toter = a[6];
    if (n > 7) o.tolit = a[7];
    return o;
  }
  $cp(s: struct_replaceterrain): this {
    this.chance = s.chance;
    this.x1 = s.x1;
    this.y1 = s.y1;
    this.x2 = s.x2;
    this.y2 = s.y2;
    this.fromter = s.fromter;
    this.toter = s.toter;
    this.tolit = s.tolit;
    return this;
  }
  $clone(): struct_replaceterrain { return new struct_replaceterrain().$cp(this); }
  static $size = 8;
  static $layout(): any[] { return [['chance', 0, ['i', 1, 1]], ['x1', 1, ['i', 1, 1]], ['y1', 2, ['i', 1, 1]], ['x2', 3, ['i', 1, 1]], ['y2', 4, ['i', 1, 1]], ['fromter', 5, ['i', 1, 1]], ['toter', 6, ['i', 1, 1]], ['tolit', 7, ['i', 1, 1]]]; }
}

/** struct repo: 16 bytes */
export class struct_repo {
  shopkeeper: struct_monst | null = null;
  location: struct_nhcoord = new struct_nhcoord();
  static $of(...a: any[]): struct_repo {
    const o = new struct_repo();
    const n = a.length;
    if (n > 0) o.shopkeeper = a[0];
    if (n > 1) o.location = a[1];
    return o;
  }
  $cp(s: struct_repo): this {
    this.shopkeeper = s.shopkeeper;
    this.location.$cp(s.location);
    return this;
  }
  $clone(): struct_repo { return new struct_repo().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['shopkeeper', 0, ['p']], ['location', 8, ['r', struct_nhcoord]]]; }
}

/** struct restore_procs: 40 bytes */
export class struct_restore_procs {
  name: any = null;
  mread_flags: number = 0;
  restore_minit: any = null;
  restore_mread: any = null;
  restore_bclose: any = null;
  static $of(...a: any[]): struct_restore_procs {
    const o = new struct_restore_procs();
    const n = a.length;
    if (n > 0) o.name = a[0];
    if (n > 1) o.mread_flags = a[1];
    if (n > 2) o.restore_minit = a[2];
    if (n > 3) o.restore_mread = a[3];
    if (n > 4) o.restore_bclose = a[4];
    return o;
  }
  $cp(s: struct_restore_procs): this {
    this.name = s.name;
    this.mread_flags = s.mread_flags;
    this.restore_minit = s.restore_minit;
    this.restore_mread = s.restore_mread;
    this.restore_bclose = s.restore_bclose;
    return this;
  }
  $clone(): struct_restore_procs { return new struct_restore_procs().$cp(this); }
  static $size = 40;
  static $layout(): any[] { return [['name', 0, ['p']], ['mread_flags', 8, ['i', 4, 1]], ['restore_minit', 16, ['p']], ['restore_mread', 24, ['p']], ['restore_bclose', 32, ['p']]]; }
}

/** struct rm: 8 bytes */
export class struct_rm {
  glyph: number = 0;
  typ: number = 0;
  seenv: number = 0;
  flags: number = 0;
  horizontal: number = 0;
  lit: number = 0;
  waslit: number = 0;
  roomno: number = 0;
  edge: number = 0;
  candig: number = 0;
  static $of(...a: any[]): struct_rm {
    const o = new struct_rm();
    const n = a.length;
    if (n > 0) o.glyph = a[0];
    if (n > 1) o.typ = a[1];
    if (n > 2) o.seenv = a[2];
    if (n > 3) o.flags = a[3];
    if (n > 4) o.horizontal = a[4];
    if (n > 5) o.lit = a[5];
    if (n > 6) o.waslit = a[6];
    if (n > 7) o.roomno = a[7];
    if (n > 8) o.edge = a[8];
    if (n > 9) o.candig = a[9];
    return o;
  }
  $cp(s: struct_rm): this {
    this.glyph = s.glyph;
    this.typ = s.typ;
    this.seenv = s.seenv;
    this.flags = s.flags;
    this.horizontal = s.horizontal;
    this.lit = s.lit;
    this.waslit = s.waslit;
    this.roomno = s.roomno;
    this.edge = s.edge;
    this.candig = s.candig;
    return this;
  }
  $clone(): struct_rm { return new struct_rm().$cp(this); }
  static $size = 8;
  static $layout(): any[] { return [['glyph', 0, ['i', 4, 1]], ['typ', 4, ['i', 1, 1]], ['seenv', 5, ['i', 1, 0]], ['flags', 6, ['b', 0, 5, 0]], ['horizontal', 6, ['b', 5, 1, 0]], ['lit', 6, ['b', 6, 1, 0]], ['waslit', 6, ['b', 7, 1, 0]], ['roomno', 7, ['b', 0, 6, 0]], ['edge', 7, ['b', 6, 1, 0]], ['candig', 7, ['b', 7, 1, 0]]]; }
}

/** struct rnglist_t: 4144 bytes */
export class struct_rnglist_t {
  fn: any = null;
  init: number = 0;
  rng_state: struct_isaac64_ctx = new struct_isaac64_ctx();
  static $of(...a: any[]): struct_rnglist_t {
    const o = new struct_rnglist_t();
    const n = a.length;
    if (n > 0) o.fn = a[0];
    if (n > 1) o.init = a[1];
    if (n > 2) o.rng_state = a[2];
    return o;
  }
  $cp(s: struct_rnglist_t): this {
    this.fn = s.fn;
    this.init = s.init;
    this.rng_state.$cp(s.rng_state);
    return this;
  }
  $clone(): struct_rnglist_t { return new struct_rnglist_t().$cp(this); }
  static $size = 4144;
  static $layout(): any[] { return [['fn', 0, ['p']], ['init', 8, ['i', 1, 1]], ['rng_state', 16, ['r', struct_isaac64_ctx]]]; }
}

/** struct rogueroom: 12 bytes */
export class struct_rogueroom {
  rlx: number = 0;
  rly: number = 0;
  dx: number = 0;
  dy: number = 0;
  real: number = 0;
  doortable: number = 0;
  nroom: number = 0;
  static $of(...a: any[]): struct_rogueroom {
    const o = new struct_rogueroom();
    const n = a.length;
    if (n > 0) o.rlx = a[0];
    if (n > 1) o.rly = a[1];
    if (n > 2) o.dx = a[2];
    if (n > 3) o.dy = a[3];
    if (n > 4) o.real = a[4];
    if (n > 5) o.doortable = a[5];
    if (n > 6) o.nroom = a[6];
    return o;
  }
  $cp(s: struct_rogueroom): this {
    this.rlx = s.rlx;
    this.rly = s.rly;
    this.dx = s.dx;
    this.dy = s.dy;
    this.real = s.real;
    this.doortable = s.doortable;
    this.nroom = s.nroom;
    return this;
  }
  $clone(): struct_rogueroom { return new struct_rogueroom().$cp(this); }
  static $size = 12;
  static $layout(): any[] { return [['rlx', 0, ['i', 1, 1]], ['rly', 1, ['i', 1, 1]], ['dx', 2, ['i', 1, 1]], ['dy', 3, ['i', 1, 1]], ['real', 4, ['i', 1, 1]], ['doortable', 5, ['i', 1, 0]], ['nroom', 8, ['i', 4, 1]]]; }
}

/** struct room_door: 4 bytes */
export class struct_room_door {
  wall: number = 0;
  pos: number = 0;
  secret: number = 0;
  mask: number = 0;
  static $of(...a: any[]): struct_room_door {
    const o = new struct_room_door();
    const n = a.length;
    if (n > 0) o.wall = a[0];
    if (n > 1) o.pos = a[1];
    if (n > 2) o.secret = a[2];
    if (n > 3) o.mask = a[3];
    return o;
  }
  $cp(s: struct_room_door): this {
    this.wall = s.wall;
    this.pos = s.pos;
    this.secret = s.secret;
    this.mask = s.mask;
    return this;
  }
  $clone(): struct_room_door { return new struct_room_door().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['wall', 0, ['i', 1, 1]], ['pos', 1, ['i', 1, 1]], ['secret', 2, ['i', 1, 1]], ['mask', 3, ['i', 1, 1]]]; }
}

/** struct rt_opt: 16 bytes */
export class struct_rt_opt {
  token: any = null;
  value: any = null;
  static $of(...a: any[]): struct_rt_opt {
    const o = new struct_rt_opt();
    const n = a.length;
    if (n > 0) o.token = a[0];
    if (n > 1) o.value = a[1];
    return o;
  }
  $cp(s: struct_rt_opt): this {
    this.token = s.token;
    this.value = s.value;
    return this;
  }
  $clone(): struct_rt_opt { return new struct_rt_opt().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['token', 0, ['p']], ['value', 8, ['p']]]; }
}

/** struct s_level: 32 bytes */
export class struct_s_level {
  next: struct_s_level | null = null;
  dlevel: struct_d_level = new struct_d_level();
  proto: Int8Array = new Int8Array(15);
  boneid: number = 0;
  rndlevs: number = 0;
  flags: struct_d_flags = new struct_d_flags();
  static $of(...a: any[]): struct_s_level {
    const o = new struct_s_level();
    const n = a.length;
    if (n > 0) o.next = a[0];
    if (n > 1) o.dlevel = a[1];
    if (n > 2) o.proto = a[2];
    if (n > 3) o.boneid = a[3];
    if (n > 4) o.rndlevs = a[4];
    if (n > 5) o.flags = a[5];
    return o;
  }
  $cp(s: struct_s_level): this {
    this.next = s.next;
    this.dlevel.$cp(s.dlevel);
    this.proto.set(s.proto);
    this.boneid = s.boneid;
    this.rndlevs = s.rndlevs;
    this.flags.$cp(s.flags);
    return this;
  }
  $clone(): struct_s_level { return new struct_s_level().$cp(this); }
  static $size = 32;
  static $layout(): any[] { return [['next', 0, ['p']], ['dlevel', 8, ['r', struct_d_level]], ['proto', 10, ['a', ['i', 1, 1], 15]], ['boneid', 25, ['i', 1, 1]], ['rndlevs', 26, ['i', 1, 0]], ['flags', 28, ['r', struct_d_flags]]]; }
}

/** struct save_procs: 48 bytes */
export class struct_save_procs {
  name: any = null;
  save_bufon: any = null;
  save_bufoff: any = null;
  save_bflush: any = null;
  save_bwrite: any = null;
  save_bclose: any = null;
  static $of(...a: any[]): struct_save_procs {
    const o = new struct_save_procs();
    const n = a.length;
    if (n > 0) o.name = a[0];
    if (n > 1) o.save_bufon = a[1];
    if (n > 2) o.save_bufoff = a[2];
    if (n > 3) o.save_bflush = a[3];
    if (n > 4) o.save_bwrite = a[4];
    if (n > 5) o.save_bclose = a[5];
    return o;
  }
  $cp(s: struct_save_procs): this {
    this.name = s.name;
    this.save_bufon = s.save_bufon;
    this.save_bufoff = s.save_bufoff;
    this.save_bflush = s.save_bflush;
    this.save_bwrite = s.save_bwrite;
    this.save_bclose = s.save_bclose;
    return this;
  }
  $clone(): struct_save_procs { return new struct_save_procs().$cp(this); }
  static $size = 48;
  static $layout(): any[] { return [['name', 0, ['p']], ['save_bufon', 8, ['p']], ['save_bufoff', 16, ['p']], ['save_bflush', 24, ['p']], ['save_bwrite', 32, ['p']], ['save_bclose', 40, ['p']]]; }
}

/** struct savefile_info: 24 bytes */
export class struct_savefile_info {
  sfi1: number = 0;
  sfi2: number = 0;
  sfi3: number = 0;
  static $of(...a: any[]): struct_savefile_info {
    const o = new struct_savefile_info();
    const n = a.length;
    if (n > 0) o.sfi1 = a[0];
    if (n > 1) o.sfi2 = a[1];
    if (n > 2) o.sfi3 = a[2];
    return o;
  }
  $cp(s: struct_savefile_info): this {
    this.sfi1 = s.sfi1;
    this.sfi2 = s.sfi2;
    this.sfi3 = s.sfi3;
    return this;
  }
  $clone(): struct_savefile_info { return new struct_savefile_info().$cp(this); }
  static $size = 24;
  static $layout(): any[] { return [['sfi1', 0, ['i', 8, 0]], ['sfi2', 8, ['i', 8, 0]], ['sfi3', 16, ['i', 8, 0]]]; }
}

/** struct scatter_chain: 32 bytes */
export class struct_scatter_chain {
  next: struct_scatter_chain | null = null;
  obj: struct_obj | null = null;
  ox: number = 0;
  oy: number = 0;
  dx: number = 0;
  dy: number = 0;
  range: number = 0;
  stopped: number = 0;
  static $of(...a: any[]): struct_scatter_chain {
    const o = new struct_scatter_chain();
    const n = a.length;
    if (n > 0) o.next = a[0];
    if (n > 1) o.obj = a[1];
    if (n > 2) o.ox = a[2];
    if (n > 3) o.oy = a[3];
    if (n > 4) o.dx = a[4];
    if (n > 5) o.dy = a[5];
    if (n > 6) o.range = a[6];
    if (n > 7) o.stopped = a[7];
    return o;
  }
  $cp(s: struct_scatter_chain): this {
    this.next = s.next;
    this.obj = s.obj;
    this.ox = s.ox;
    this.oy = s.oy;
    this.dx = s.dx;
    this.dy = s.dy;
    this.range = s.range;
    this.stopped = s.stopped;
    return this;
  }
  $clone(): struct_scatter_chain { return new struct_scatter_chain().$cp(this); }
  static $size = 32;
  static $layout(): any[] { return [['next', 0, ['p']], ['obj', 8, ['p']], ['ox', 16, ['i', 1, 1]], ['oy', 17, ['i', 1, 1]], ['dx', 18, ['i', 1, 1]], ['dy', 19, ['i', 1, 1]], ['range', 20, ['i', 4, 1]], ['stopped', 24, ['i', 1, 1]]]; }
}

/** struct shclass: 80 bytes */
export class struct_shclass {
  name: any = null;
  symb: number = 0;
  prob: number = 0;
  shdist: number = 0;
  iprobs: any[] = $sarr(struct_itp, 6);
  shknms: any = null;
  static $of(...a: any[]): struct_shclass {
    const o = new struct_shclass();
    const n = a.length;
    if (n > 0) o.name = a[0];
    if (n > 1) o.symb = a[1];
    if (n > 2) o.prob = a[2];
    if (n > 3) o.shdist = a[3];
    if (n > 4) o.iprobs = a[4];
    if (n > 5) o.shknms = a[5];
    return o;
  }
  $cp(s: struct_shclass): this {
    this.name = s.name;
    this.symb = s.symb;
    this.prob = s.prob;
    this.shdist = s.shdist;
    $cparr(this.iprobs, s.iprobs);
    this.shknms = s.shknms;
    return this;
  }
  $clone(): struct_shclass { return new struct_shclass().$cp(this); }
  static $size = 80;
  static $layout(): any[] { return [['name', 0, ['p']], ['symb', 8, ['i', 1, 1]], ['prob', 12, ['i', 4, 1]], ['shdist', 16, ['i', 1, 1]], ['iprobs', 20, ['a', ['r', struct_itp], 6]], ['shknms', 72, ['p']]]; }
}

/** struct sigaction: 152 bytes */
export class struct_sigaction {
  __sigaction_handler: anon_sigaction_h_31 = new anon_sigaction_h_31();
  sa_mask: struct___sigset_t = new struct___sigset_t();
  sa_flags: number = 0;
  sa_restorer: any = null;
  static $of(...a: any[]): struct_sigaction {
    const o = new struct_sigaction();
    const n = a.length;
    if (n > 0) o.__sigaction_handler = a[0];
    if (n > 1) o.sa_mask = a[1];
    if (n > 2) o.sa_flags = a[2];
    if (n > 3) o.sa_restorer = a[3];
    return o;
  }
  $cp(s: struct_sigaction): this {
    this.__sigaction_handler.$cp(s.__sigaction_handler);
    this.sa_mask.$cp(s.sa_mask);
    this.sa_flags = s.sa_flags;
    this.sa_restorer = s.sa_restorer;
    return this;
  }
  $clone(): struct_sigaction { return new struct_sigaction().$cp(this); }
  static $size = 152;
  static $layout(): any[] { return [['__sigaction_handler', 0, ['r', anon_sigaction_h_31]], ['sa_mask', 8, ['r', struct___sigset_t]], ['sa_flags', 136, ['i', 4, 1]], ['sa_restorer', 144, ['p']]]; }
}

/** struct sinfo: 44 bytes */
export class struct_sinfo {
  gameover: number = 0;
  stopprint: number = 0;
  done_hup: number = 0;
  preserve_locks: number = 0;
  something_worth_saving: number = 0;
  panicking: number = 0;
  exiting: number = 0;
  in_moveloop: number = 0;
  in_impossible: number = 0;
  in_paniclog: number = 0;
  wizkit_wishing: number = 0;
  static $of(...a: any[]): struct_sinfo {
    const o = new struct_sinfo();
    const n = a.length;
    if (n > 0) o.gameover = a[0];
    if (n > 1) o.stopprint = a[1];
    if (n > 2) o.done_hup = a[2];
    if (n > 3) o.preserve_locks = a[3];
    if (n > 4) o.something_worth_saving = a[4];
    if (n > 5) o.panicking = a[5];
    if (n > 6) o.exiting = a[6];
    if (n > 7) o.in_moveloop = a[7];
    if (n > 8) o.in_impossible = a[8];
    if (n > 9) o.in_paniclog = a[9];
    if (n > 10) o.wizkit_wishing = a[10];
    return o;
  }
  $cp(s: struct_sinfo): this {
    this.gameover = s.gameover;
    this.stopprint = s.stopprint;
    this.done_hup = s.done_hup;
    this.preserve_locks = s.preserve_locks;
    this.something_worth_saving = s.something_worth_saving;
    this.panicking = s.panicking;
    this.exiting = s.exiting;
    this.in_moveloop = s.in_moveloop;
    this.in_impossible = s.in_impossible;
    this.in_paniclog = s.in_paniclog;
    this.wizkit_wishing = s.wizkit_wishing;
    return this;
  }
  $clone(): struct_sinfo { return new struct_sinfo().$cp(this); }
  static $size = 44;
  static $layout(): any[] { return [['gameover', 0, ['i', 4, 1]], ['stopprint', 4, ['i', 4, 1]], ['done_hup', 8, ['i', 4, 1]], ['preserve_locks', 12, ['i', 4, 1]], ['something_worth_saving', 16, ['i', 4, 1]], ['panicking', 20, ['i', 4, 1]], ['exiting', 24, ['i', 4, 1]], ['in_moveloop', 28, ['i', 4, 1]], ['in_impossible', 32, ['i', 4, 1]], ['in_paniclog', 36, ['i', 4, 1]], ['wizkit_wishing', 40, ['i', 4, 1]]]; }
}

/** struct sing_plur: 16 bytes */
export class struct_sing_plur {
  sing: any = null;
  plur: any = null;
  static $of(...a: any[]): struct_sing_plur {
    const o = new struct_sing_plur();
    const n = a.length;
    if (n > 0) o.sing = a[0];
    if (n > 1) o.plur = a[1];
    return o;
  }
  $cp(s: struct_sing_plur): this {
    this.sing = s.sing;
    this.plur = s.plur;
    return this;
  }
  $clone(): struct_sing_plur { return new struct_sing_plur().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['sing', 0, ['p']], ['plur', 8, ['p']]]; }
}

/** struct skill_range: 16 bytes */
export class struct_skill_range {
  first: number = 0;
  last: number = 0;
  name: any = null;
  static $of(...a: any[]): struct_skill_range {
    const o = new struct_skill_range();
    const n = a.length;
    if (n > 0) o.first = a[0];
    if (n > 1) o.last = a[1];
    if (n > 2) o.name = a[2];
    return o;
  }
  $cp(s: struct_skill_range): this {
    this.first = s.first;
    this.last = s.last;
    this.name = s.name;
    return this;
  }
  $clone(): struct_skill_range { return new struct_skill_range().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['first', 0, ['i', 2, 1]], ['last', 2, ['i', 2, 1]], ['name', 8, ['p']]]; }
}

/** struct skills: 4 bytes */
export class struct_skills {
  skill: number = 0;
  max_skill: number = 0;
  advance: number = 0;
  static $of(...a: any[]): struct_skills {
    const o = new struct_skills();
    const n = a.length;
    if (n > 0) o.skill = a[0];
    if (n > 1) o.max_skill = a[1];
    if (n > 2) o.advance = a[2];
    return o;
  }
  $cp(s: struct_skills): this {
    this.skill = s.skill;
    this.max_skill = s.max_skill;
    this.advance = s.advance;
    return this;
  }
  $clone(): struct_skills { return new struct_skills().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['skill', 0, ['i', 1, 1]], ['max_skill', 1, ['i', 1, 1]], ['advance', 2, ['i', 2, 0]]]; }
}

/** struct sortloot_item: 24 bytes */
export class struct_sortloot_item {
  obj: struct_obj | null = null;
  str: any = null;
  indx: number = 0;
  orderclass: number = 0;
  subclass: number = 0;
  disco: number = 0;
  static $of(...a: any[]): struct_sortloot_item {
    const o = new struct_sortloot_item();
    const n = a.length;
    if (n > 0) o.obj = a[0];
    if (n > 1) o.str = a[1];
    if (n > 2) o.indx = a[2];
    if (n > 3) o.orderclass = a[3];
    if (n > 4) o.subclass = a[4];
    if (n > 5) o.disco = a[5];
    return o;
  }
  $cp(s: struct_sortloot_item): this {
    this.obj = s.obj;
    this.str = s.str;
    this.indx = s.indx;
    this.orderclass = s.orderclass;
    this.subclass = s.subclass;
    this.disco = s.disco;
    return this;
  }
  $clone(): struct_sortloot_item { return new struct_sortloot_item().$cp(this); }
  static $size = 24;
  static $layout(): any[] { return [['obj', 0, ['p']], ['str', 8, ['p']], ['indx', 16, ['i', 4, 1]], ['orderclass', 20, ['i', 1, 1]], ['subclass', 21, ['i', 1, 1]], ['disco', 22, ['i', 1, 1]]]; }
}

/** struct sp_coder: 120 bytes */
export class struct_sp_coder {
  stack: struct_splevstack | null = null;
  frame: struct_sp_frame | null = null;
  premapped: number = 0;
  solidify: number = 0;
  croom: struct_mkroom | null = null;
  tmproomlist: any[] = new Array(6).fill(null);
  failed_room: Int8Array = new Int8Array(6);
  n_subroom: number = 0;
  exit_script: number = 0;
  lvl_is_joined: number = 0;
  check_inaccessibles: number = 0;
  opcode: number = 0;
  opdat: struct_opvar | null = null;
  static $of(...a: any[]): struct_sp_coder {
    const o = new struct_sp_coder();
    const n = a.length;
    if (n > 0) o.stack = a[0];
    if (n > 1) o.frame = a[1];
    if (n > 2) o.premapped = a[2];
    if (n > 3) o.solidify = a[3];
    if (n > 4) o.croom = a[4];
    if (n > 5) o.tmproomlist = a[5];
    if (n > 6) o.failed_room = a[6];
    if (n > 7) o.n_subroom = a[7];
    if (n > 8) o.exit_script = a[8];
    if (n > 9) o.lvl_is_joined = a[9];
    if (n > 10) o.check_inaccessibles = a[10];
    if (n > 11) o.opcode = a[11];
    if (n > 12) o.opdat = a[12];
    return o;
  }
  $cp(s: struct_sp_coder): this {
    this.stack = s.stack;
    this.frame = s.frame;
    this.premapped = s.premapped;
    this.solidify = s.solidify;
    this.croom = s.croom;
    $cpvals(this.tmproomlist, s.tmproomlist);
    this.failed_room.set(s.failed_room);
    this.n_subroom = s.n_subroom;
    this.exit_script = s.exit_script;
    this.lvl_is_joined = s.lvl_is_joined;
    this.check_inaccessibles = s.check_inaccessibles;
    this.opcode = s.opcode;
    this.opdat = s.opdat;
    return this;
  }
  $clone(): struct_sp_coder { return new struct_sp_coder().$cp(this); }
  static $size = 120;
  static $layout(): any[] { return [['stack', 0, ['p']], ['frame', 8, ['p']], ['premapped', 16, ['i', 4, 1]], ['solidify', 20, ['i', 1, 1]], ['croom', 24, ['p']], ['tmproomlist', 32, ['a', ['p'], 6]], ['failed_room', 80, ['a', ['i', 1, 1], 6]], ['n_subroom', 88, ['i', 4, 1]], ['exit_script', 92, ['i', 1, 1]], ['lvl_is_joined', 96, ['i', 4, 1]], ['check_inaccessibles', 100, ['i', 1, 1]], ['opcode', 104, ['i', 4, 1]], ['opdat', 112, ['p']]]; }
}

/** struct sp_frame: 32 bytes */
export class struct_sp_frame {
  next: struct_sp_frame | null = null;
  stack: struct_splevstack | null = null;
  variables: struct_splev_var | null = null;
  n_opcode: number = 0;
  static $of(...a: any[]): struct_sp_frame {
    const o = new struct_sp_frame();
    const n = a.length;
    if (n > 0) o.next = a[0];
    if (n > 1) o.stack = a[1];
    if (n > 2) o.variables = a[2];
    if (n > 3) o.n_opcode = a[3];
    return o;
  }
  $cp(s: struct_sp_frame): this {
    this.next = s.next;
    this.stack = s.stack;
    this.variables = s.variables;
    this.n_opcode = s.n_opcode;
    return this;
  }
  $clone(): struct_sp_frame { return new struct_sp_frame().$cp(this); }
  static $size = 32;
  static $layout(): any[] { return [['next', 0, ['p']], ['stack', 8, ['p']], ['variables', 16, ['p']], ['n_opcode', 24, ['i', 8, 1]]]; }
}

/** struct sp_lev: 16 bytes */
export class struct_sp_lev {
  opcodes: struct__opcode | null = null;
  n_opcodes: number = 0;
  static $of(...a: any[]): struct_sp_lev {
    const o = new struct_sp_lev();
    const n = a.length;
    if (n > 0) o.opcodes = a[0];
    if (n > 1) o.n_opcodes = a[1];
    return o;
  }
  $cp(s: struct_sp_lev): this {
    this.opcodes = s.opcodes;
    this.n_opcodes = s.n_opcodes;
    return this;
  }
  $clone(): struct_sp_lev { return new struct_sp_lev().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['opcodes', 0, ['p']], ['n_opcodes', 8, ['i', 8, 1]]]; }
}

/** struct spell: 8 bytes */
export class struct_spell {
  sp_id: number = 0;
  sp_lev: number = 0;
  sp_know: number = 0;
  static $of(...a: any[]): struct_spell {
    const o = new struct_spell();
    const n = a.length;
    if (n > 0) o.sp_id = a[0];
    if (n > 1) o.sp_lev = a[1];
    if (n > 2) o.sp_know = a[2];
    return o;
  }
  $cp(s: struct_spell): this {
    this.sp_id = s.sp_id;
    this.sp_lev = s.sp_lev;
    this.sp_know = s.sp_know;
    return this;
  }
  $clone(): struct_spell { return new struct_spell().$cp(this); }
  static $size = 8;
  static $layout(): any[] { return [['sp_id', 0, ['i', 2, 1]], ['sp_lev', 2, ['i', 1, 1]], ['sp_know', 4, ['i', 4, 1]]]; }
}

/** struct splev_var: 40 bytes */
export class struct_splev_var {
  next: struct_splev_var | null = null;
  name: any = null;
  svtyp: number = 0;
  data: anon_sp_lev_h_267 = new anon_sp_lev_h_267();
  array_len: number = 0;
  static $of(...a: any[]): struct_splev_var {
    const o = new struct_splev_var();
    const n = a.length;
    if (n > 0) o.next = a[0];
    if (n > 1) o.name = a[1];
    if (n > 2) o.svtyp = a[2];
    if (n > 3) o.data = a[3];
    if (n > 4) o.array_len = a[4];
    return o;
  }
  $cp(s: struct_splev_var): this {
    this.next = s.next;
    this.name = s.name;
    this.svtyp = s.svtyp;
    this.data.$cp(s.data);
    this.array_len = s.array_len;
    return this;
  }
  $clone(): struct_splev_var { return new struct_splev_var().$cp(this); }
  static $size = 40;
  static $layout(): any[] { return [['next', 0, ['p']], ['name', 8, ['p']], ['svtyp', 16, ['i', 1, 1]], ['data', 24, ['r', anon_sp_lev_h_267]], ['array_len', 32, ['i', 8, 1]]]; }
}

/** struct splevstack: 24 bytes */
export class struct_splevstack {
  depth: number = 0;
  depth_alloc: number = 0;
  stackdata: any = null;
  static $of(...a: any[]): struct_splevstack {
    const o = new struct_splevstack();
    const n = a.length;
    if (n > 0) o.depth = a[0];
    if (n > 1) o.depth_alloc = a[1];
    if (n > 2) o.stackdata = a[2];
    return o;
  }
  $cp(s: struct_splevstack): this {
    this.depth = s.depth;
    this.depth_alloc = s.depth_alloc;
    this.stackdata = s.stackdata;
    return this;
  }
  $clone(): struct_splevstack { return new struct_splevstack().$cp(this); }
  static $size = 24;
  static $layout(): any[] { return [['depth', 0, ['i', 8, 1]], ['depth_alloc', 8, ['i', 8, 1]], ['stackdata', 16, ['p']]]; }
}

/** struct spltrap: 16 bytes */
export class struct_spltrap {
  coord: number = 0;
  x: number = 0;
  y: number = 0;
  type: number = 0;
  static $of(...a: any[]): struct_spltrap {
    const o = new struct_spltrap();
    const n = a.length;
    if (n > 0) o.coord = a[0];
    if (n > 1) o.x = a[1];
    if (n > 2) o.y = a[2];
    if (n > 3) o.type = a[3];
    return o;
  }
  $cp(s: struct_spltrap): this {
    this.coord = s.coord;
    this.x = s.x;
    this.y = s.y;
    this.type = s.type;
    return this;
  }
  $clone(): struct_spltrap { return new struct_spltrap().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['coord', 0, ['i', 8, 1]], ['x', 8, ['i', 1, 1]], ['y', 9, ['i', 1, 1]], ['type', 10, ['i', 1, 1]]]; }
}

/** struct stairway: 5 bytes */
export class struct_stairway {
  sx: number = 0;
  sy: number = 0;
  tolev: struct_d_level = new struct_d_level();
  up: number = 0;
  static $of(...a: any[]): struct_stairway {
    const o = new struct_stairway();
    const n = a.length;
    if (n > 0) o.sx = a[0];
    if (n > 1) o.sy = a[1];
    if (n > 2) o.tolev = a[2];
    if (n > 3) o.up = a[3];
    return o;
  }
  $cp(s: struct_stairway): this {
    this.sx = s.sx;
    this.sy = s.sy;
    this.tolev.$cp(s.tolev);
    this.up = s.up;
    return this;
  }
  $clone(): struct_stairway { return new struct_stairway().$cp(this); }
  static $size = 5;
  static $layout(): any[] { return [['sx', 0, ['i', 1, 1]], ['sy', 1, ['i', 1, 1]], ['tolev', 2, ['r', struct_d_level]], ['up', 4, ['i', 1, 1]]]; }
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

/** struct strbuf: 272 bytes */
export class struct_strbuf {
  len: number = 0;
  str: any = null;
  buf: Int8Array = new Int8Array(256);
  static $of(...a: any[]): struct_strbuf {
    const o = new struct_strbuf();
    const n = a.length;
    if (n > 0) o.len = a[0];
    if (n > 1) o.str = a[1];
    if (n > 2) o.buf = a[2];
    return o;
  }
  $cp(s: struct_strbuf): this {
    this.len = s.len;
    this.str = s.str;
    this.buf.set(s.buf);
    return this;
  }
  $clone(): struct_strbuf { return new struct_strbuf().$cp(this); }
  static $size = 272;
  static $layout(): any[] { return [['len', 0, ['i', 4, 1]], ['str', 8, ['p']], ['buf', 16, ['a', ['i', 1, 1], 256]]]; }
}

/** struct symdef: 24 bytes */
export class struct_symdef {
  sym: number = 0;
  explanation: any = null;
  color: number = 0;
  static $of(...a: any[]): struct_symdef {
    const o = new struct_symdef();
    const n = a.length;
    if (n > 0) o.sym = a[0];
    if (n > 1) o.explanation = a[1];
    if (n > 2) o.color = a[2];
    return o;
  }
  $cp(s: struct_symdef): this {
    this.sym = s.sym;
    this.explanation = s.explanation;
    this.color = s.color;
    return this;
  }
  $clone(): struct_symdef { return new struct_symdef().$cp(this); }
  static $size = 24;
  static $layout(): any[] { return [['sym', 0, ['i', 1, 0]], ['explanation', 8, ['p']], ['color', 16, ['i', 1, 0]]]; }
}

/** struct symparse: 16 bytes */
export class struct_symparse {
  range: number = 0;
  idx: number = 0;
  name: any = null;
  static $of(...a: any[]): struct_symparse {
    const o = new struct_symparse();
    const n = a.length;
    if (n > 0) o.range = a[0];
    if (n > 1) o.idx = a[1];
    if (n > 2) o.name = a[2];
    return o;
  }
  $cp(s: struct_symparse): this {
    this.range = s.range;
    this.idx = s.idx;
    this.name = s.name;
    return this;
  }
  $clone(): struct_symparse { return new struct_symparse().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['range', 0, ['i', 4, 0]], ['idx', 4, ['i', 4, 1]], ['name', 8, ['p']]]; }
}

/** struct symsetentry: 40 bytes */
export class struct_symsetentry {
  next: struct_symsetentry | null = null;
  name: any = null;
  desc: any = null;
  idx: number = 0;
  handling: number = 0;
  nocolor: number = 0;
  primary: number = 0;
  rogue: number = 0;
  explicitly: number = 0;
  static $of(...a: any[]): struct_symsetentry {
    const o = new struct_symsetentry();
    const n = a.length;
    if (n > 0) o.next = a[0];
    if (n > 1) o.name = a[1];
    if (n > 2) o.desc = a[2];
    if (n > 3) o.idx = a[3];
    if (n > 4) o.handling = a[4];
    if (n > 5) o.nocolor = a[5];
    if (n > 6) o.primary = a[6];
    if (n > 7) o.rogue = a[7];
    if (n > 8) o.explicitly = a[8];
    return o;
  }
  $cp(s: struct_symsetentry): this {
    this.next = s.next;
    this.name = s.name;
    this.desc = s.desc;
    this.idx = s.idx;
    this.handling = s.handling;
    this.nocolor = s.nocolor;
    this.primary = s.primary;
    this.rogue = s.rogue;
    this.explicitly = s.explicitly;
    return this;
  }
  $clone(): struct_symsetentry { return new struct_symsetentry().$cp(this); }
  static $size = 40;
  static $layout(): any[] { return [['next', 0, ['p']], ['name', 8, ['p']], ['desc', 16, ['p']], ['idx', 24, ['i', 4, 1]], ['handling', 28, ['i', 4, 1]], ['nocolor', 32, ['b', 0, 1, 0]], ['primary', 32, ['b', 1, 1, 0]], ['rogue', 32, ['b', 2, 1, 0]], ['explicitly', 32, ['b', 3, 1, 0]]]; }
}

/** struct sysopt: 152 bytes */
export class struct_sysopt {
  support: any = null;
  recover: any = null;
  wizards: any = null;
  fmtd_wizard_list: any = null;
  explorers: any = null;
  shellers: any = null;
  genericusers: any = null;
  debugfiles: any = null;
  dumplogfile: any = null;
  env_dbgfl: number = 0;
  maxplayers: number = 0;
  seduce: number = 0;
  check_save_uid: number = 0;
  check_plname: number = 0;
  bones_pools: number = 0;
  persmax: number = 0;
  pers_is_uid: number = 0;
  entrymax: number = 0;
  pointsmin: number = 0;
  tt_oname_maxrank: number = 0;
  gdbpath: any = null;
  greppath: any = null;
  panictrace_gdb: number = 0;
  panictrace_libc: number = 0;
  accessibility: number = 0;
  static $of(...a: any[]): struct_sysopt {
    const o = new struct_sysopt();
    const n = a.length;
    if (n > 0) o.support = a[0];
    if (n > 1) o.recover = a[1];
    if (n > 2) o.wizards = a[2];
    if (n > 3) o.fmtd_wizard_list = a[3];
    if (n > 4) o.explorers = a[4];
    if (n > 5) o.shellers = a[5];
    if (n > 6) o.genericusers = a[6];
    if (n > 7) o.debugfiles = a[7];
    if (n > 8) o.dumplogfile = a[8];
    if (n > 9) o.env_dbgfl = a[9];
    if (n > 10) o.maxplayers = a[10];
    if (n > 11) o.seduce = a[11];
    if (n > 12) o.check_save_uid = a[12];
    if (n > 13) o.check_plname = a[13];
    if (n > 14) o.bones_pools = a[14];
    if (n > 15) o.persmax = a[15];
    if (n > 16) o.pers_is_uid = a[16];
    if (n > 17) o.entrymax = a[17];
    if (n > 18) o.pointsmin = a[18];
    if (n > 19) o.tt_oname_maxrank = a[19];
    if (n > 20) o.gdbpath = a[20];
    if (n > 21) o.greppath = a[21];
    if (n > 22) o.panictrace_gdb = a[22];
    if (n > 23) o.panictrace_libc = a[23];
    if (n > 24) o.accessibility = a[24];
    return o;
  }
  $cp(s: struct_sysopt): this {
    this.support = s.support;
    this.recover = s.recover;
    this.wizards = s.wizards;
    this.fmtd_wizard_list = s.fmtd_wizard_list;
    this.explorers = s.explorers;
    this.shellers = s.shellers;
    this.genericusers = s.genericusers;
    this.debugfiles = s.debugfiles;
    this.dumplogfile = s.dumplogfile;
    this.env_dbgfl = s.env_dbgfl;
    this.maxplayers = s.maxplayers;
    this.seduce = s.seduce;
    this.check_save_uid = s.check_save_uid;
    this.check_plname = s.check_plname;
    this.bones_pools = s.bones_pools;
    this.persmax = s.persmax;
    this.pers_is_uid = s.pers_is_uid;
    this.entrymax = s.entrymax;
    this.pointsmin = s.pointsmin;
    this.tt_oname_maxrank = s.tt_oname_maxrank;
    this.gdbpath = s.gdbpath;
    this.greppath = s.greppath;
    this.panictrace_gdb = s.panictrace_gdb;
    this.panictrace_libc = s.panictrace_libc;
    this.accessibility = s.accessibility;
    return this;
  }
  $clone(): struct_sysopt { return new struct_sysopt().$cp(this); }
  static $size = 152;
  static $layout(): any[] { return [['support', 0, ['p']], ['recover', 8, ['p']], ['wizards', 16, ['p']], ['fmtd_wizard_list', 24, ['p']], ['explorers', 32, ['p']], ['shellers', 40, ['p']], ['genericusers', 48, ['p']], ['debugfiles', 56, ['p']], ['dumplogfile', 64, ['p']], ['env_dbgfl', 72, ['i', 4, 1]], ['maxplayers', 76, ['i', 4, 1]], ['seduce', 80, ['i', 4, 1]], ['check_save_uid', 84, ['i', 4, 1]], ['check_plname', 88, ['i', 4, 1]], ['bones_pools', 92, ['i', 4, 1]], ['persmax', 96, ['i', 4, 1]], ['pers_is_uid', 100, ['i', 4, 1]], ['entrymax', 104, ['i', 4, 1]], ['pointsmin', 108, ['i', 4, 1]], ['tt_oname_maxrank', 112, ['i', 4, 1]], ['gdbpath', 120, ['p']], ['greppath', 128, ['p']], ['panictrace_gdb', 136, ['i', 4, 1]], ['panictrace_libc', 140, ['i', 4, 1]], ['accessibility', 144, ['i', 4, 1]]]; }
}

/** struct takeoff_info: 56 bytes */
export class struct_takeoff_info {
  mask: number = 0;
  what: number = 0;
  delay: number = 0;
  cancelled_don: number = 0;
  disrobing: Int8Array = new Int8Array(31);
  static $of(...a: any[]): struct_takeoff_info {
    const o = new struct_takeoff_info();
    const n = a.length;
    if (n > 0) o.mask = a[0];
    if (n > 1) o.what = a[1];
    if (n > 2) o.delay = a[2];
    if (n > 3) o.cancelled_don = a[3];
    if (n > 4) o.disrobing = a[4];
    return o;
  }
  $cp(s: struct_takeoff_info): this {
    this.mask = s.mask;
    this.what = s.what;
    this.delay = s.delay;
    this.cancelled_don = s.cancelled_don;
    this.disrobing.set(s.disrobing);
    return this;
  }
  $clone(): struct_takeoff_info { return new struct_takeoff_info().$cp(this); }
  static $size = 56;
  static $layout(): any[] { return [['mask', 0, ['i', 8, 1]], ['what', 8, ['i', 8, 1]], ['delay', 16, ['i', 4, 1]], ['cancelled_don', 20, ['i', 1, 1]], ['disrobing', 21, ['a', ['i', 1, 1], 31]]]; }
}

/** struct tc_gbl_data: 24 bytes */
export class struct_tc_gbl_data {
  tc_AS: any = null;
  tc_AE: any = null;
  tc_LI: number = 0;
  tc_CO: number = 0;
  static $of(...a: any[]): struct_tc_gbl_data {
    const o = new struct_tc_gbl_data();
    const n = a.length;
    if (n > 0) o.tc_AS = a[0];
    if (n > 1) o.tc_AE = a[1];
    if (n > 2) o.tc_LI = a[2];
    if (n > 3) o.tc_CO = a[3];
    return o;
  }
  $cp(s: struct_tc_gbl_data): this {
    this.tc_AS = s.tc_AS;
    this.tc_AE = s.tc_AE;
    this.tc_LI = s.tc_LI;
    this.tc_CO = s.tc_CO;
    return this;
  }
  $clone(): struct_tc_gbl_data { return new struct_tc_gbl_data().$cp(this); }
  static $size = 24;
  static $layout(): any[] { return [['tc_AS', 0, ['p']], ['tc_AE', 8, ['p']], ['tc_LI', 16, ['i', 4, 1]], ['tc_CO', 20, ['i', 4, 1]]]; }
}

/** struct tc_lcl_data: 64 bytes */
export class struct_tc_lcl_data {
  tc_CM: any = null;
  tc_ND: any = null;
  tc_CD: any = null;
  tc_HI: any = null;
  tc_HE: any = null;
  tc_US: any = null;
  tc_UE: any = null;
  tc_ul_hack: number = 0;
  static $of(...a: any[]): struct_tc_lcl_data {
    const o = new struct_tc_lcl_data();
    const n = a.length;
    if (n > 0) o.tc_CM = a[0];
    if (n > 1) o.tc_ND = a[1];
    if (n > 2) o.tc_CD = a[2];
    if (n > 3) o.tc_HI = a[3];
    if (n > 4) o.tc_HE = a[4];
    if (n > 5) o.tc_US = a[5];
    if (n > 6) o.tc_UE = a[6];
    if (n > 7) o.tc_ul_hack = a[7];
    return o;
  }
  $cp(s: struct_tc_lcl_data): this {
    this.tc_CM = s.tc_CM;
    this.tc_ND = s.tc_ND;
    this.tc_CD = s.tc_CD;
    this.tc_HI = s.tc_HI;
    this.tc_HE = s.tc_HE;
    this.tc_US = s.tc_US;
    this.tc_UE = s.tc_UE;
    this.tc_ul_hack = s.tc_ul_hack;
    return this;
  }
  $clone(): struct_tc_lcl_data { return new struct_tc_lcl_data().$cp(this); }
  static $size = 64;
  static $layout(): any[] { return [['tc_CM', 0, ['p']], ['tc_ND', 8, ['p']], ['tc_CD', 16, ['p']], ['tc_HI', 24, ['p']], ['tc_HE', 32, ['p']], ['tc_US', 40, ['p']], ['tc_UE', 48, ['p']], ['tc_ul_hack', 56, ['i', 1, 1]]]; }
}

/** struct termios: 60 bytes */
export class struct_termios {
  c_iflag: number = 0;
  c_oflag: number = 0;
  c_cflag: number = 0;
  c_lflag: number = 0;
  c_line: number = 0;
  c_cc: Uint8Array = new Uint8Array(32);
  static $of(...a: any[]): struct_termios {
    const o = new struct_termios();
    const n = a.length;
    if (n > 0) o.c_iflag = a[0];
    if (n > 1) o.c_oflag = a[1];
    if (n > 2) o.c_cflag = a[2];
    if (n > 3) o.c_lflag = a[3];
    if (n > 4) o.c_line = a[4];
    if (n > 5) o.c_cc = a[5];
    return o;
  }
  $cp(s: struct_termios): this {
    this.c_iflag = s.c_iflag;
    this.c_oflag = s.c_oflag;
    this.c_cflag = s.c_cflag;
    this.c_lflag = s.c_lflag;
    this.c_line = s.c_line;
    this.c_cc.set(s.c_cc);
    return this;
  }
  $clone(): struct_termios { return new struct_termios().$cp(this); }
  static $size = 60;
  static $layout(): any[] { return [['c_iflag', 0, ['i', 4, 0]], ['c_oflag', 4, ['i', 4, 0]], ['c_cflag', 8, ['i', 4, 0]], ['c_lflag', 12, ['i', 4, 0]], ['c_line', 16, ['i', 1, 0]], ['c_cc', 17, ['a', ['i', 1, 0], 32]]]; }
}

/** struct terrain: 2 bytes */
export class struct_terrain {
  ter: number = 0;
  tlit: number = 0;
  static $of(...a: any[]): struct_terrain {
    const o = new struct_terrain();
    const n = a.length;
    if (n > 0) o.ter = a[0];
    if (n > 1) o.tlit = a[1];
    return o;
  }
  $cp(s: struct_terrain): this {
    this.ter = s.ter;
    this.tlit = s.tlit;
    return this;
  }
  $clone(): struct_terrain { return new struct_terrain().$cp(this); }
  static $size = 2;
  static $layout(): any[] { return [['ter', 0, ['i', 1, 1]], ['tlit', 1, ['i', 1, 1]]]; }
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

/** struct tin_info: 24 bytes */
export class struct_tin_info {
  tin: struct_obj | null = null;
  o_id: number = 0;
  usedtime: number = 0;
  reqtime: number = 0;
  static $of(...a: any[]): struct_tin_info {
    const o = new struct_tin_info();
    const n = a.length;
    if (n > 0) o.tin = a[0];
    if (n > 1) o.o_id = a[1];
    if (n > 2) o.usedtime = a[2];
    if (n > 3) o.reqtime = a[3];
    return o;
  }
  $cp(s: struct_tin_info): this {
    this.tin = s.tin;
    this.o_id = s.o_id;
    this.usedtime = s.usedtime;
    this.reqtime = s.reqtime;
    return this;
  }
  $clone(): struct_tin_info { return new struct_tin_info().$cp(this); }
  static $size = 24;
  static $layout(): any[] { return [['tin', 0, ['p']], ['o_id', 8, ['i', 4, 0]], ['usedtime', 12, ['i', 4, 1]], ['reqtime', 16, ['i', 4, 1]]]; }
}

/** struct tm: 56 bytes */
export class struct_tm {
  tm_sec: number = 0;
  tm_min: number = 0;
  tm_hour: number = 0;
  tm_mday: number = 0;
  tm_mon: number = 0;
  tm_year: number = 0;
  tm_wday: number = 0;
  tm_yday: number = 0;
  tm_isdst: number = 0;
  tm_gmtoff: number = 0;
  tm_zone: any = null;
  static $of(...a: any[]): struct_tm {
    const o = new struct_tm();
    const n = a.length;
    if (n > 0) o.tm_sec = a[0];
    if (n > 1) o.tm_min = a[1];
    if (n > 2) o.tm_hour = a[2];
    if (n > 3) o.tm_mday = a[3];
    if (n > 4) o.tm_mon = a[4];
    if (n > 5) o.tm_year = a[5];
    if (n > 6) o.tm_wday = a[6];
    if (n > 7) o.tm_yday = a[7];
    if (n > 8) o.tm_isdst = a[8];
    if (n > 9) o.tm_gmtoff = a[9];
    if (n > 10) o.tm_zone = a[10];
    return o;
  }
  $cp(s: struct_tm): this {
    this.tm_sec = s.tm_sec;
    this.tm_min = s.tm_min;
    this.tm_hour = s.tm_hour;
    this.tm_mday = s.tm_mday;
    this.tm_mon = s.tm_mon;
    this.tm_year = s.tm_year;
    this.tm_wday = s.tm_wday;
    this.tm_yday = s.tm_yday;
    this.tm_isdst = s.tm_isdst;
    this.tm_gmtoff = s.tm_gmtoff;
    this.tm_zone = s.tm_zone;
    return this;
  }
  $clone(): struct_tm { return new struct_tm().$cp(this); }
  static $size = 56;
  static $layout(): any[] { return [['tm_sec', 0, ['i', 4, 1]], ['tm_min', 4, ['i', 4, 1]], ['tm_hour', 8, ['i', 4, 1]], ['tm_mday', 12, ['i', 4, 1]], ['tm_mon', 16, ['i', 4, 1]], ['tm_year', 20, ['i', 4, 1]], ['tm_wday', 24, ['i', 4, 1]], ['tm_yday', 28, ['i', 4, 1]], ['tm_isdst', 32, ['i', 4, 1]], ['tm_gmtoff', 40, ['i', 8, 1]], ['tm_zone', 48, ['p']]]; }
}

/** struct tmp_glyph: 344 bytes */
export class struct_tmp_glyph {
  saved: any[] = $sarr(struct_nhcoord, 160);
  sidx: number = 0;
  style: number = 0;
  glyph: number = 0;
  prev: struct_tmp_glyph | null = null;
  static $of(...a: any[]): struct_tmp_glyph {
    const o = new struct_tmp_glyph();
    const n = a.length;
    if (n > 0) o.saved = a[0];
    if (n > 1) o.sidx = a[1];
    if (n > 2) o.style = a[2];
    if (n > 3) o.glyph = a[3];
    if (n > 4) o.prev = a[4];
    return o;
  }
  $cp(s: struct_tmp_glyph): this {
    $cparr(this.saved, s.saved);
    this.sidx = s.sidx;
    this.style = s.style;
    this.glyph = s.glyph;
    this.prev = s.prev;
    return this;
  }
  $clone(): struct_tmp_glyph { return new struct_tmp_glyph().$cp(this); }
  static $size = 344;
  static $layout(): any[] { return [['saved', 0, ['a', ['r', struct_nhcoord], 160]], ['sidx', 320, ['i', 4, 1]], ['style', 324, ['i', 4, 1]], ['glyph', 328, ['i', 4, 1]], ['prev', 336, ['p']]]; }
}

/** struct tmpbranch: 40 bytes */
export class struct_tmpbranch {
  name: Int8Array = new Int8Array(24);
  lev: struct_couple = new struct_couple();
  chain: number = 0;
  type: number = 0;
  up: number = 0;
  static $of(...a: any[]): struct_tmpbranch {
    const o = new struct_tmpbranch();
    const n = a.length;
    if (n > 0) o.name = a[0];
    if (n > 1) o.lev = a[1];
    if (n > 2) o.chain = a[2];
    if (n > 3) o.type = a[3];
    if (n > 4) o.up = a[4];
    return o;
  }
  $cp(s: struct_tmpbranch): this {
    this.name.set(s.name);
    this.lev.$cp(s.lev);
    this.chain = s.chain;
    this.type = s.type;
    this.up = s.up;
    return this;
  }
  $clone(): struct_tmpbranch { return new struct_tmpbranch().$cp(this); }
  static $size = 40;
  static $layout(): any[] { return [['name', 0, ['a', ['i', 1, 1], 24]], ['lev', 24, ['r', struct_couple]], ['chain', 28, ['i', 4, 1]], ['type', 32, ['i', 4, 1]], ['up', 36, ['i', 4, 1]]]; }
}

/** struct tmpdungeon: 76 bytes */
export class struct_tmpdungeon {
  name: Int8Array = new Int8Array(24);
  protoname: Int8Array = new Int8Array(24);
  lev: struct_couple = new struct_couple();
  flags: number = 0;
  chance: number = 0;
  levels: number = 0;
  branches: number = 0;
  entry_lev: number = 0;
  boneschar: number = 0;
  static $of(...a: any[]): struct_tmpdungeon {
    const o = new struct_tmpdungeon();
    const n = a.length;
    if (n > 0) o.name = a[0];
    if (n > 1) o.protoname = a[1];
    if (n > 2) o.lev = a[2];
    if (n > 3) o.flags = a[3];
    if (n > 4) o.chance = a[4];
    if (n > 5) o.levels = a[5];
    if (n > 6) o.branches = a[6];
    if (n > 7) o.entry_lev = a[7];
    if (n > 8) o.boneschar = a[8];
    return o;
  }
  $cp(s: struct_tmpdungeon): this {
    this.name.set(s.name);
    this.protoname.set(s.protoname);
    this.lev.$cp(s.lev);
    this.flags = s.flags;
    this.chance = s.chance;
    this.levels = s.levels;
    this.branches = s.branches;
    this.entry_lev = s.entry_lev;
    this.boneschar = s.boneschar;
    return this;
  }
  $clone(): struct_tmpdungeon { return new struct_tmpdungeon().$cp(this); }
  static $size = 76;
  static $layout(): any[] { return [['name', 0, ['a', ['i', 1, 1], 24]], ['protoname', 24, ['a', ['i', 1, 1], 24]], ['lev', 48, ['r', struct_couple]], ['flags', 52, ['i', 4, 1]], ['chance', 56, ['i', 4, 1]], ['levels', 60, ['i', 4, 1]], ['branches', 64, ['i', 4, 1]], ['entry_lev', 68, ['i', 4, 1]], ['boneschar', 72, ['i', 1, 1]]]; }
}

/** struct tmplevel: 48 bytes */
export class struct_tmplevel {
  name: Int8Array = new Int8Array(24);
  lev: struct_couple = new struct_couple();
  chance: number = 0;
  rndlevs: number = 0;
  chain: number = 0;
  flags: number = 0;
  boneschar: number = 0;
  static $of(...a: any[]): struct_tmplevel {
    const o = new struct_tmplevel();
    const n = a.length;
    if (n > 0) o.name = a[0];
    if (n > 1) o.lev = a[1];
    if (n > 2) o.chance = a[2];
    if (n > 3) o.rndlevs = a[3];
    if (n > 4) o.chain = a[4];
    if (n > 5) o.flags = a[5];
    if (n > 6) o.boneschar = a[6];
    return o;
  }
  $cp(s: struct_tmplevel): this {
    this.name.set(s.name);
    this.lev.$cp(s.lev);
    this.chance = s.chance;
    this.rndlevs = s.rndlevs;
    this.chain = s.chain;
    this.flags = s.flags;
    this.boneschar = s.boneschar;
    return this;
  }
  $clone(): struct_tmplevel { return new struct_tmplevel().$cp(this); }
  static $size = 48;
  static $layout(): any[] { return [['name', 0, ['a', ['i', 1, 1], 24]], ['lev', 24, ['r', struct_couple]], ['chance', 28, ['i', 4, 1]], ['rndlevs', 32, ['i', 4, 1]], ['chain', 36, ['i', 4, 1]], ['flags', 40, ['i', 4, 1]], ['boneschar', 44, ['i', 1, 1]]]; }
}

/** struct toptenentry: 208 bytes */
export class struct_toptenentry {
  tt_next: struct_toptenentry | null = null;
  points: number = 0;
  deathdnum: number = 0;
  deathlev: number = 0;
  maxlvl: number = 0;
  hp: number = 0;
  maxhp: number = 0;
  deaths: number = 0;
  ver_major: number = 0;
  ver_minor: number = 0;
  patchlevel: number = 0;
  deathdate: number = 0;
  birthdate: number = 0;
  uid: number = 0;
  plrole: Int8Array = new Int8Array(4);
  plrace: Int8Array = new Int8Array(4);
  plgend: Int8Array = new Int8Array(4);
  plalign: Int8Array = new Int8Array(4);
  name: Int8Array = new Int8Array(11);
  death: Int8Array = new Int8Array(101);
  static $of(...a: any[]): struct_toptenentry {
    const o = new struct_toptenentry();
    const n = a.length;
    if (n > 0) o.tt_next = a[0];
    if (n > 1) o.points = a[1];
    if (n > 2) o.deathdnum = a[2];
    if (n > 3) o.deathlev = a[3];
    if (n > 4) o.maxlvl = a[4];
    if (n > 5) o.hp = a[5];
    if (n > 6) o.maxhp = a[6];
    if (n > 7) o.deaths = a[7];
    if (n > 8) o.ver_major = a[8];
    if (n > 9) o.ver_minor = a[9];
    if (n > 10) o.patchlevel = a[10];
    if (n > 11) o.deathdate = a[11];
    if (n > 12) o.birthdate = a[12];
    if (n > 13) o.uid = a[13];
    if (n > 14) o.plrole = a[14];
    if (n > 15) o.plrace = a[15];
    if (n > 16) o.plgend = a[16];
    if (n > 17) o.plalign = a[17];
    if (n > 18) o.name = a[18];
    if (n > 19) o.death = a[19];
    return o;
  }
  $cp(s: struct_toptenentry): this {
    this.tt_next = s.tt_next;
    this.points = s.points;
    this.deathdnum = s.deathdnum;
    this.deathlev = s.deathlev;
    this.maxlvl = s.maxlvl;
    this.hp = s.hp;
    this.maxhp = s.maxhp;
    this.deaths = s.deaths;
    this.ver_major = s.ver_major;
    this.ver_minor = s.ver_minor;
    this.patchlevel = s.patchlevel;
    this.deathdate = s.deathdate;
    this.birthdate = s.birthdate;
    this.uid = s.uid;
    this.plrole.set(s.plrole);
    this.plrace.set(s.plrace);
    this.plgend.set(s.plgend);
    this.plalign.set(s.plalign);
    this.name.set(s.name);
    this.death.set(s.death);
    return this;
  }
  $clone(): struct_toptenentry { return new struct_toptenentry().$cp(this); }
  static $size = 208;
  static $layout(): any[] { return [['tt_next', 0, ['p']], ['points', 8, ['i', 8, 1]], ['deathdnum', 16, ['i', 4, 1]], ['deathlev', 20, ['i', 4, 1]], ['maxlvl', 24, ['i', 4, 1]], ['hp', 28, ['i', 4, 1]], ['maxhp', 32, ['i', 4, 1]], ['deaths', 36, ['i', 4, 1]], ['ver_major', 40, ['i', 4, 1]], ['ver_minor', 44, ['i', 4, 1]], ['patchlevel', 48, ['i', 4, 1]], ['deathdate', 56, ['i', 8, 1]], ['birthdate', 64, ['i', 8, 1]], ['uid', 72, ['i', 4, 1]], ['plrole', 76, ['a', ['i', 1, 1], 4]], ['plrace', 80, ['a', ['i', 1, 1], 4]], ['plgend', 84, ['a', ['i', 1, 1], 4]], ['plalign', 88, ['a', ['i', 1, 1], 4]], ['name', 92, ['a', ['i', 1, 1], 11]], ['death', 103, ['a', ['i', 1, 1], 101]]]; }
}

/** struct tport_hideaway: 12 bytes */
export class struct_tport_hideaway {
  savespell: struct_spell = new struct_spell();
  tport_indx: number = 0;
  static $of(...a: any[]): struct_tport_hideaway {
    const o = new struct_tport_hideaway();
    const n = a.length;
    if (n > 0) o.savespell = a[0];
    if (n > 1) o.tport_indx = a[1];
    return o;
  }
  $cp(s: struct_tport_hideaway): this {
    this.savespell.$cp(s.savespell);
    this.tport_indx = s.tport_indx;
    return this;
  }
  $clone(): struct_tport_hideaway { return new struct_tport_hideaway().$cp(this); }
  static $size = 12;
  static $layout(): any[] { return [['savespell', 0, ['r', struct_spell]], ['tport_indx', 8, ['i', 4, 1]]]; }
}

/** struct tporttypes: 16 bytes */
export class struct_tporttypes {
  menulet: number = 0;
  menudesc: any = null;
  static $of(...a: any[]): struct_tporttypes {
    const o = new struct_tporttypes();
    const n = a.length;
    if (n > 0) o.menulet = a[0];
    if (n > 1) o.menudesc = a[1];
    return o;
  }
  $cp(s: struct_tporttypes): this {
    this.menulet = s.menulet;
    this.menudesc = s.menudesc;
    return this;
  }
  $clone(): struct_tporttypes { return new struct_tporttypes().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['menulet', 0, ['i', 1, 1]], ['menudesc', 8, ['p']]]; }
}

/** struct trap: 24 bytes */
export class struct_trap {
  ntrap: struct_trap | null = null;
  tx: number = 0;
  ty: number = 0;
  dst: struct_d_level = new struct_d_level();
  launch: struct_nhcoord = new struct_nhcoord();
  ttyp: number = 0;
  tseen: number = 0;
  once: number = 0;
  madeby_u: number = 0;
  vl: union_vlaunchinfo = new union_vlaunchinfo();
  static $of(...a: any[]): struct_trap {
    const o = new struct_trap();
    const n = a.length;
    if (n > 0) o.ntrap = a[0];
    if (n > 1) o.tx = a[1];
    if (n > 2) o.ty = a[2];
    if (n > 3) o.dst = a[3];
    if (n > 4) o.launch = a[4];
    if (n > 5) o.ttyp = a[5];
    if (n > 6) o.tseen = a[6];
    if (n > 7) o.once = a[7];
    if (n > 8) o.madeby_u = a[8];
    if (n > 9) o.vl = a[9];
    return o;
  }
  $cp(s: struct_trap): this {
    this.ntrap = s.ntrap;
    this.tx = s.tx;
    this.ty = s.ty;
    this.dst.$cp(s.dst);
    this.launch.$cp(s.launch);
    this.ttyp = s.ttyp;
    this.tseen = s.tseen;
    this.once = s.once;
    this.madeby_u = s.madeby_u;
    this.vl.$cp(s.vl);
    return this;
  }
  $clone(): struct_trap { return new struct_trap().$cp(this); }
  static $size = 24;
  static $layout(): any[] { return [['ntrap', 0, ['p']], ['tx', 8, ['i', 1, 1]], ['ty', 9, ['i', 1, 1]], ['dst', 10, ['r', struct_d_level]], ['launch', 12, ['r', struct_nhcoord]], ['ttyp', 14, ['b', 0, 5, 0]], ['tseen', 14, ['b', 5, 1, 0]], ['once', 14, ['b', 6, 1, 0]], ['madeby_u', 14, ['b', 7, 1, 0]], ['vl', 16, ['r', union_vlaunchinfo]]]; }
}

/** struct trapinfo: 24 bytes */
export class struct_trapinfo {
  tobj: struct_obj | null = null;
  tx: number = 0;
  ty: number = 0;
  time_needed: number = 0;
  force_bungle: number = 0;
  static $of(...a: any[]): struct_trapinfo {
    const o = new struct_trapinfo();
    const n = a.length;
    if (n > 0) o.tobj = a[0];
    if (n > 1) o.tx = a[1];
    if (n > 2) o.ty = a[2];
    if (n > 3) o.time_needed = a[3];
    if (n > 4) o.force_bungle = a[4];
    return o;
  }
  $cp(s: struct_trapinfo): this {
    this.tobj = s.tobj;
    this.tx = s.tx;
    this.ty = s.ty;
    this.time_needed = s.time_needed;
    this.force_bungle = s.force_bungle;
    return this;
  }
  $clone(): struct_trapinfo { return new struct_trapinfo().$cp(this); }
  static $size = 24;
  static $layout(): any[] { return [['tobj', 0, ['p']], ['tx', 8, ['i', 1, 1]], ['ty', 9, ['i', 1, 1]], ['time_needed', 12, ['i', 4, 1]], ['force_bungle', 16, ['i', 1, 1]]]; }
}

/** struct tribute_info: 16 bytes */
export class struct_tribute_info {
  tributesz: number = 0;
  enabled: number = 0;
  bookstock: number = 0;
  Deathnotice: number = 0;
  static $of(...a: any[]): struct_tribute_info {
    const o = new struct_tribute_info();
    const n = a.length;
    if (n > 0) o.tributesz = a[0];
    if (n > 1) o.enabled = a[1];
    if (n > 2) o.bookstock = a[2];
    if (n > 3) o.Deathnotice = a[3];
    return o;
  }
  $cp(s: struct_tribute_info): this {
    this.tributesz = s.tributesz;
    this.enabled = s.enabled;
    this.bookstock = s.bookstock;
    this.Deathnotice = s.Deathnotice;
    return this;
  }
  $clone(): struct_tribute_info { return new struct_tribute_info().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['tributesz', 0, ['i', 8, 0]], ['enabled', 8, ['i', 1, 1]], ['bookstock', 9, ['b', 0, 1, 0]], ['Deathnotice', 9, ['b', 1, 1, 0]]]; }
}

/** struct trobj: 8 bytes */
export class struct_trobj {
  trotyp: number = 0;
  trspe: number = 0;
  trclass: number = 0;
  trquan: number = 0;
  trbless: number = 0;
  static $of(...a: any[]): struct_trobj {
    const o = new struct_trobj();
    const n = a.length;
    if (n > 0) o.trotyp = a[0];
    if (n > 1) o.trspe = a[1];
    if (n > 2) o.trclass = a[2];
    if (n > 3) o.trquan = a[3];
    if (n > 4) o.trbless = a[4];
    return o;
  }
  $cp(s: struct_trobj): this {
    this.trotyp = s.trotyp;
    this.trspe = s.trspe;
    this.trclass = s.trclass;
    this.trquan = s.trquan;
    this.trbless = s.trbless;
    return this;
  }
  $clone(): struct_trobj { return new struct_trobj().$cp(this); }
  static $size = 8;
  static $layout(): any[] { return [['trotyp', 0, ['i', 2, 1]], ['trspe', 2, ['i', 1, 1]], ['trclass', 3, ['i', 1, 1]], ['trquan', 4, ['b', 0, 6, 0]], ['trbless', 4, ['b', 6, 2, 0]]]; }
}

/** struct ttable: 24 bytes */
export class struct_ttable {
  f: any = null;
  cleanup: any = null;
  name: any = null;
  static $of(...a: any[]): struct_ttable {
    const o = new struct_ttable();
    const n = a.length;
    if (n > 0) o.f = a[0];
    if (n > 1) o.cleanup = a[1];
    if (n > 2) o.name = a[2];
    return o;
  }
  $cp(s: struct_ttable): this {
    this.f = s.f;
    this.cleanup = s.cleanup;
    this.name = s.name;
    return this;
  }
  $clone(): struct_ttable { return new struct_ttable().$cp(this); }
  static $size = 24;
  static $layout(): any[] { return [['f', 0, ['p']], ['cleanup', 8, ['p']], ['name', 16, ['p']]]; }
}

/** struct tty_mi: 40 bytes */
export class struct_tty_mi {
  next: struct_tty_mi | null = null;
  identifier: union_any = new union_any();
  count: number = 0;
  str: any = null;
  attr: number = 0;
  selected: number = 0;
  selector: number = 0;
  gselector: number = 0;
  static $of(...a: any[]): struct_tty_mi {
    const o = new struct_tty_mi();
    const n = a.length;
    if (n > 0) o.next = a[0];
    if (n > 1) o.identifier = a[1];
    if (n > 2) o.count = a[2];
    if (n > 3) o.str = a[3];
    if (n > 4) o.attr = a[4];
    if (n > 5) o.selected = a[5];
    if (n > 6) o.selector = a[6];
    if (n > 7) o.gselector = a[7];
    return o;
  }
  $cp(s: struct_tty_mi): this {
    this.next = s.next;
    this.identifier.$cp(s.identifier);
    this.count = s.count;
    this.str = s.str;
    this.attr = s.attr;
    this.selected = s.selected;
    this.selector = s.selector;
    this.gselector = s.gselector;
    return this;
  }
  $clone(): struct_tty_mi { return new struct_tty_mi().$cp(this); }
  static $size = 40;
  static $layout(): any[] { return [['next', 0, ['p']], ['identifier', 8, ['r', union_any]], ['count', 16, ['i', 8, 1]], ['str', 24, ['p']], ['attr', 32, ['i', 4, 1]], ['selected', 36, ['i', 1, 1]], ['selector', 37, ['i', 1, 1]], ['gselector', 38, ['i', 1, 1]]]; }
}

/** struct tty_status_fields: 40 bytes */
export class struct_tty_status_fields {
  idx: number = 0;
  color: number = 0;
  attr: number = 0;
  x: number = 0;
  y: number = 0;
  lth: number = 0;
  valid: number = 0;
  dirty: number = 0;
  redraw: number = 0;
  sanitycheck: number = 0;
  static $of(...a: any[]): struct_tty_status_fields {
    const o = new struct_tty_status_fields();
    const n = a.length;
    if (n > 0) o.idx = a[0];
    if (n > 1) o.color = a[1];
    if (n > 2) o.attr = a[2];
    if (n > 3) o.x = a[3];
    if (n > 4) o.y = a[4];
    if (n > 5) o.lth = a[5];
    if (n > 6) o.valid = a[6];
    if (n > 7) o.dirty = a[7];
    if (n > 8) o.redraw = a[8];
    if (n > 9) o.sanitycheck = a[9];
    return o;
  }
  $cp(s: struct_tty_status_fields): this {
    this.idx = s.idx;
    this.color = s.color;
    this.attr = s.attr;
    this.x = s.x;
    this.y = s.y;
    this.lth = s.lth;
    this.valid = s.valid;
    this.dirty = s.dirty;
    this.redraw = s.redraw;
    this.sanitycheck = s.sanitycheck;
    return this;
  }
  $clone(): struct_tty_status_fields { return new struct_tty_status_fields().$cp(this); }
  static $size = 40;
  static $layout(): any[] { return [['idx', 0, ['i', 4, 1]], ['color', 4, ['i', 4, 1]], ['attr', 8, ['i', 4, 1]], ['x', 12, ['i', 4, 1]], ['y', 16, ['i', 4, 1]], ['lth', 24, ['i', 8, 0]], ['valid', 32, ['i', 1, 1]], ['dirty', 33, ['i', 1, 1]], ['redraw', 34, ['i', 1, 1]], ['sanitycheck', 35, ['i', 1, 1]]]; }
}

/** struct u_achieve: 4 bytes */
export class struct_u_achieve {
  amulet: number = 0;
  bell: number = 0;
  book: number = 0;
  menorah: number = 0;
  enter_gehennom: number = 0;
  ascended: number = 0;
  mines_luckstone: number = 0;
  finish_sokoban: number = 0;
  killed_medusa: number = 0;
  static $of(...a: any[]): struct_u_achieve {
    const o = new struct_u_achieve();
    const n = a.length;
    if (n > 0) o.amulet = a[0];
    if (n > 1) o.bell = a[1];
    if (n > 2) o.book = a[2];
    if (n > 3) o.menorah = a[3];
    if (n > 4) o.enter_gehennom = a[4];
    if (n > 5) o.ascended = a[5];
    if (n > 6) o.mines_luckstone = a[6];
    if (n > 7) o.finish_sokoban = a[7];
    if (n > 8) o.killed_medusa = a[8];
    return o;
  }
  $cp(s: struct_u_achieve): this {
    this.amulet = s.amulet;
    this.bell = s.bell;
    this.book = s.book;
    this.menorah = s.menorah;
    this.enter_gehennom = s.enter_gehennom;
    this.ascended = s.ascended;
    this.mines_luckstone = s.mines_luckstone;
    this.finish_sokoban = s.finish_sokoban;
    this.killed_medusa = s.killed_medusa;
    return this;
  }
  $clone(): struct_u_achieve { return new struct_u_achieve().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['amulet', 0, ['b', 0, 1, 0]], ['bell', 0, ['b', 1, 1, 0]], ['book', 0, ['b', 2, 1, 0]], ['menorah', 0, ['b', 3, 1, 0]], ['enter_gehennom', 0, ['b', 4, 1, 0]], ['ascended', 0, ['b', 5, 1, 0]], ['mines_luckstone', 0, ['b', 6, 1, 0]], ['finish_sokoban', 0, ['b', 7, 1, 0]], ['killed_medusa', 1, ['b', 0, 1, 0]]]; }
}

/** struct u_conduct: 88 bytes */
export class struct_u_conduct {
  unvegetarian: number = 0;
  unvegan: number = 0;
  food: number = 0;
  gnostic: number = 0;
  weaphit: number = 0;
  killer: number = 0;
  literate: number = 0;
  polypiles: number = 0;
  polyselfs: number = 0;
  wishes: number = 0;
  wisharti: number = 0;
  static $of(...a: any[]): struct_u_conduct {
    const o = new struct_u_conduct();
    const n = a.length;
    if (n > 0) o.unvegetarian = a[0];
    if (n > 1) o.unvegan = a[1];
    if (n > 2) o.food = a[2];
    if (n > 3) o.gnostic = a[3];
    if (n > 4) o.weaphit = a[4];
    if (n > 5) o.killer = a[5];
    if (n > 6) o.literate = a[6];
    if (n > 7) o.polypiles = a[7];
    if (n > 8) o.polyselfs = a[8];
    if (n > 9) o.wishes = a[9];
    if (n > 10) o.wisharti = a[10];
    return o;
  }
  $cp(s: struct_u_conduct): this {
    this.unvegetarian = s.unvegetarian;
    this.unvegan = s.unvegan;
    this.food = s.food;
    this.gnostic = s.gnostic;
    this.weaphit = s.weaphit;
    this.killer = s.killer;
    this.literate = s.literate;
    this.polypiles = s.polypiles;
    this.polyselfs = s.polyselfs;
    this.wishes = s.wishes;
    this.wisharti = s.wisharti;
    return this;
  }
  $clone(): struct_u_conduct { return new struct_u_conduct().$cp(this); }
  static $size = 88;
  static $layout(): any[] { return [['unvegetarian', 0, ['i', 8, 1]], ['unvegan', 8, ['i', 8, 1]], ['food', 16, ['i', 8, 1]], ['gnostic', 24, ['i', 8, 1]], ['weaphit', 32, ['i', 8, 1]], ['killer', 40, ['i', 8, 1]], ['literate', 48, ['i', 8, 1]], ['polypiles', 56, ['i', 8, 1]], ['polyselfs', 64, ['i', 8, 1]], ['wishes', 72, ['i', 8, 1]], ['wisharti', 80, ['i', 8, 1]]]; }
}

/** struct u_event: 4 bytes */
export class struct_u_event {
  minor_oracle: number = 0;
  major_oracle: number = 0;
  read_tribute: number = 0;
  qcalled: number = 0;
  qexpelled: number = 0;
  qcompleted: number = 0;
  uheard_tune: number = 0;
  uopened_dbridge: number = 0;
  invoked: number = 0;
  gehennom_entered: number = 0;
  uhand_of_elbereth: number = 0;
  udemigod: number = 0;
  uvibrated: number = 0;
  ascended: number = 0;
  static $of(...a: any[]): struct_u_event {
    const o = new struct_u_event();
    const n = a.length;
    if (n > 0) o.minor_oracle = a[0];
    if (n > 1) o.major_oracle = a[1];
    if (n > 2) o.read_tribute = a[2];
    if (n > 3) o.qcalled = a[3];
    if (n > 4) o.qexpelled = a[4];
    if (n > 5) o.qcompleted = a[5];
    if (n > 6) o.uheard_tune = a[6];
    if (n > 7) o.uopened_dbridge = a[7];
    if (n > 8) o.invoked = a[8];
    if (n > 9) o.gehennom_entered = a[9];
    if (n > 10) o.uhand_of_elbereth = a[10];
    if (n > 11) o.udemigod = a[11];
    if (n > 12) o.uvibrated = a[12];
    if (n > 13) o.ascended = a[13];
    return o;
  }
  $cp(s: struct_u_event): this {
    this.minor_oracle = s.minor_oracle;
    this.major_oracle = s.major_oracle;
    this.read_tribute = s.read_tribute;
    this.qcalled = s.qcalled;
    this.qexpelled = s.qexpelled;
    this.qcompleted = s.qcompleted;
    this.uheard_tune = s.uheard_tune;
    this.uopened_dbridge = s.uopened_dbridge;
    this.invoked = s.invoked;
    this.gehennom_entered = s.gehennom_entered;
    this.uhand_of_elbereth = s.uhand_of_elbereth;
    this.udemigod = s.udemigod;
    this.uvibrated = s.uvibrated;
    this.ascended = s.ascended;
    return this;
  }
  $clone(): struct_u_event { return new struct_u_event().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['minor_oracle', 0, ['b', 0, 1, 0]], ['major_oracle', 0, ['b', 1, 1, 0]], ['read_tribute', 0, ['b', 2, 1, 0]], ['qcalled', 0, ['b', 3, 1, 0]], ['qexpelled', 0, ['b', 4, 1, 0]], ['qcompleted', 0, ['b', 5, 1, 0]], ['uheard_tune', 0, ['b', 6, 2, 0]], ['uopened_dbridge', 1, ['b', 0, 1, 0]], ['invoked', 1, ['b', 1, 1, 0]], ['gehennom_entered', 1, ['b', 2, 1, 0]], ['uhand_of_elbereth', 1, ['b', 3, 2, 0]], ['udemigod', 1, ['b', 5, 1, 0]], ['uvibrated', 1, ['b', 6, 1, 0]], ['ascended', 1, ['b', 7, 1, 0]]]; }
}

/** struct u_have: 4 bytes */
export class struct_u_have {
  amulet: number = 0;
  bell: number = 0;
  book: number = 0;
  menorah: number = 0;
  questart: number = 0;
  unused: number = 0;
  static $of(...a: any[]): struct_u_have {
    const o = new struct_u_have();
    const n = a.length;
    if (n > 0) o.amulet = a[0];
    if (n > 1) o.bell = a[1];
    if (n > 2) o.book = a[2];
    if (n > 3) o.menorah = a[3];
    if (n > 4) o.questart = a[4];
    if (n > 5) o.unused = a[5];
    return o;
  }
  $cp(s: struct_u_have): this {
    this.amulet = s.amulet;
    this.bell = s.bell;
    this.book = s.book;
    this.menorah = s.menorah;
    this.questart = s.questart;
    this.unused = s.unused;
    return this;
  }
  $clone(): struct_u_have { return new struct_u_have().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['amulet', 0, ['b', 0, 1, 0]], ['bell', 0, ['b', 1, 1, 0]], ['book', 0, ['b', 2, 1, 0]], ['menorah', 0, ['b', 3, 1, 0]], ['questart', 0, ['b', 4, 1, 0]], ['unused', 0, ['b', 5, 3, 0]]]; }
}

/** struct u_realtime: 24 bytes */
export class struct_u_realtime {
  realtime: number = 0;
  start_timing: number = 0;
  finish_time: number = 0;
  static $of(...a: any[]): struct_u_realtime {
    const o = new struct_u_realtime();
    const n = a.length;
    if (n > 0) o.realtime = a[0];
    if (n > 1) o.start_timing = a[1];
    if (n > 2) o.finish_time = a[2];
    return o;
  }
  $cp(s: struct_u_realtime): this {
    this.realtime = s.realtime;
    this.start_timing = s.start_timing;
    this.finish_time = s.finish_time;
    return this;
  }
  $clone(): struct_u_realtime { return new struct_u_realtime().$cp(this); }
  static $size = 24;
  static $layout(): any[] { return [['realtime', 0, ['i', 8, 1]], ['start_timing', 8, ['i', 8, 1]], ['finish_time', 16, ['i', 8, 1]]]; }
}

/** struct u_roleplay: 16 bytes */
export class struct_u_roleplay {
  blind: number = 0;
  nudist: number = 0;
  numbones: number = 0;
  static $of(...a: any[]): struct_u_roleplay {
    const o = new struct_u_roleplay();
    const n = a.length;
    if (n > 0) o.blind = a[0];
    if (n > 1) o.nudist = a[1];
    if (n > 2) o.numbones = a[2];
    return o;
  }
  $cp(s: struct_u_roleplay): this {
    this.blind = s.blind;
    this.nudist = s.nudist;
    this.numbones = s.numbones;
    return this;
  }
  $clone(): struct_u_roleplay { return new struct_u_roleplay().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['blind', 0, ['i', 1, 1]], ['nudist', 1, ['i', 1, 1]], ['numbones', 8, ['i', 8, 1]]]; }
}

/** struct unpacked_coord: 24 bytes */
export class struct_unpacked_coord {
  is_random: number = 0;
  getloc_flags: number = 0;
  x: number = 0;
  y: number = 0;
  static $of(...a: any[]): struct_unpacked_coord {
    const o = new struct_unpacked_coord();
    const n = a.length;
    if (n > 0) o.is_random = a[0];
    if (n > 1) o.getloc_flags = a[1];
    if (n > 2) o.x = a[2];
    if (n > 3) o.y = a[3];
    return o;
  }
  $cp(s: struct_unpacked_coord): this {
    this.is_random = s.is_random;
    this.getloc_flags = s.getloc_flags;
    this.x = s.x;
    this.y = s.y;
    return this;
  }
  $clone(): struct_unpacked_coord { return new struct_unpacked_coord().$cp(this); }
  static $size = 24;
  static $layout(): any[] { return [['is_random', 0, ['i', 1, 1]], ['getloc_flags', 8, ['i', 8, 1]], ['x', 16, ['i', 4, 1]], ['y', 20, ['i', 4, 1]]]; }
}

/** struct val_list: 16 bytes */
export class struct_val_list {
  list: struct_valuable_data | null = null;
  size: number = 0;
  static $of(...a: any[]): struct_val_list {
    const o = new struct_val_list();
    const n = a.length;
    if (n > 0) o.list = a[0];
    if (n > 1) o.size = a[1];
    return o;
  }
  $cp(s: struct_val_list): this {
    this.list = s.list;
    this.size = s.size;
    return this;
  }
  $clone(): struct_val_list { return new struct_val_list().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['list', 0, ['p']], ['size', 8, ['i', 4, 1]]]; }
}

/** struct valuable_data: 16 bytes */
export class struct_valuable_data {
  count: number = 0;
  typ: number = 0;
  static $of(...a: any[]): struct_valuable_data {
    const o = new struct_valuable_data();
    const n = a.length;
    if (n > 0) o.count = a[0];
    if (n > 1) o.typ = a[1];
    return o;
  }
  $cp(s: struct_valuable_data): this {
    this.count = s.count;
    this.typ = s.typ;
    return this;
  }
  $clone(): struct_valuable_data { return new struct_valuable_data().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['count', 0, ['i', 8, 1]], ['typ', 8, ['i', 4, 1]]]; }
}

/** struct version_info: 40 bytes */
export class struct_version_info {
  incarnation: number = 0;
  feature_set: number = 0;
  entity_count: number = 0;
  struct_sizes1: number = 0;
  struct_sizes2: number = 0;
  static $of(...a: any[]): struct_version_info {
    const o = new struct_version_info();
    const n = a.length;
    if (n > 0) o.incarnation = a[0];
    if (n > 1) o.feature_set = a[1];
    if (n > 2) o.entity_count = a[2];
    if (n > 3) o.struct_sizes1 = a[3];
    if (n > 4) o.struct_sizes2 = a[4];
    return o;
  }
  $cp(s: struct_version_info): this {
    this.incarnation = s.incarnation;
    this.feature_set = s.feature_set;
    this.entity_count = s.entity_count;
    this.struct_sizes1 = s.struct_sizes1;
    this.struct_sizes2 = s.struct_sizes2;
    return this;
  }
  $clone(): struct_version_info { return new struct_version_info().$cp(this); }
  static $size = 40;
  static $layout(): any[] { return [['incarnation', 0, ['i', 8, 0]], ['feature_set', 8, ['i', 8, 0]], ['entity_count', 16, ['i', 8, 0]], ['struct_sizes1', 24, ['i', 8, 0]], ['struct_sizes2', 32, ['i', 8, 0]]]; }
}

/** struct victual_info: 32 bytes */
export class struct_victual_info {
  piece: struct_obj | null = null;
  o_id: number = 0;
  usedtime: number = 0;
  reqtime: number = 0;
  nmod: number = 0;
  canchoke: number = 0;
  fullwarn: number = 0;
  eating: number = 0;
  doreset: number = 0;
  static $of(...a: any[]): struct_victual_info {
    const o = new struct_victual_info();
    const n = a.length;
    if (n > 0) o.piece = a[0];
    if (n > 1) o.o_id = a[1];
    if (n > 2) o.usedtime = a[2];
    if (n > 3) o.reqtime = a[3];
    if (n > 4) o.nmod = a[4];
    if (n > 5) o.canchoke = a[5];
    if (n > 6) o.fullwarn = a[6];
    if (n > 7) o.eating = a[7];
    if (n > 8) o.doreset = a[8];
    return o;
  }
  $cp(s: struct_victual_info): this {
    this.piece = s.piece;
    this.o_id = s.o_id;
    this.usedtime = s.usedtime;
    this.reqtime = s.reqtime;
    this.nmod = s.nmod;
    this.canchoke = s.canchoke;
    this.fullwarn = s.fullwarn;
    this.eating = s.eating;
    this.doreset = s.doreset;
    return this;
  }
  $clone(): struct_victual_info { return new struct_victual_info().$cp(this); }
  static $size = 32;
  static $layout(): any[] { return [['piece', 0, ['p']], ['o_id', 8, ['i', 4, 0]], ['usedtime', 12, ['i', 4, 1]], ['reqtime', 16, ['i', 4, 1]], ['nmod', 20, ['i', 4, 1]], ['canchoke', 24, ['b', 0, 1, 0]], ['fullwarn', 24, ['b', 1, 1, 0]], ['eating', 24, ['b', 2, 1, 0]], ['doreset', 24, ['b', 3, 1, 0]]]; }
}

/** struct vt_mode: 8 bytes */
export class struct_vt_mode {
  mode: number = 0;
  waitv: number = 0;
  relsig: number = 0;
  acqsig: number = 0;
  frsig: number = 0;
  static $of(...a: any[]): struct_vt_mode {
    const o = new struct_vt_mode();
    const n = a.length;
    if (n > 0) o.mode = a[0];
    if (n > 1) o.waitv = a[1];
    if (n > 2) o.relsig = a[2];
    if (n > 3) o.acqsig = a[3];
    if (n > 4) o.frsig = a[4];
    return o;
  }
  $cp(s: struct_vt_mode): this {
    this.mode = s.mode;
    this.waitv = s.waitv;
    this.relsig = s.relsig;
    this.acqsig = s.acqsig;
    this.frsig = s.frsig;
    return this;
  }
  $clone(): struct_vt_mode { return new struct_vt_mode().$cp(this); }
  static $size = 8;
  static $layout(): any[] { return [['mode', 0, ['i', 1, 0]], ['waitv', 1, ['i', 1, 0]], ['relsig', 2, ['i', 2, 1]], ['acqsig', 4, ['i', 2, 1]], ['frsig', 6, ['i', 2, 1]]]; }
}

/** struct warntype_info: 32 bytes */
export class struct_warntype_info {
  obj: number = 0;
  polyd: number = 0;
  species: struct_permonst | null = null;
  speciesidx: number = 0;
  static $of(...a: any[]): struct_warntype_info {
    const o = new struct_warntype_info();
    const n = a.length;
    if (n > 0) o.obj = a[0];
    if (n > 1) o.polyd = a[1];
    if (n > 2) o.species = a[2];
    if (n > 3) o.speciesidx = a[3];
    return o;
  }
  $cp(s: struct_warntype_info): this {
    this.obj = s.obj;
    this.polyd = s.polyd;
    this.species = s.species;
    this.speciesidx = s.speciesidx;
    return this;
  }
  $clone(): struct_warntype_info { return new struct_warntype_info().$cp(this); }
  static $size = 32;
  static $layout(): any[] { return [['obj', 0, ['i', 8, 0]], ['polyd', 8, ['i', 8, 0]], ['species', 16, ['p']], ['speciesidx', 24, ['i', 2, 1]]]; }
}

/** struct wc_Opt: 16 bytes */
export class struct_wc_Opt {
  wc_name: any = null;
  wc_bit: number = 0;
  static $of(...a: any[]): struct_wc_Opt {
    const o = new struct_wc_Opt();
    const n = a.length;
    if (n > 0) o.wc_name = a[0];
    if (n > 1) o.wc_bit = a[1];
    return o;
  }
  $cp(s: struct_wc_Opt): this {
    this.wc_name = s.wc_name;
    this.wc_bit = s.wc_bit;
    return this;
  }
  $clone(): struct_wc_Opt { return new struct_wc_Opt().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['wc_name', 0, ['p']], ['wc_bit', 8, ['i', 8, 0]]]; }
}

/** struct win_choices: 16 bytes */
export class struct_win_choices {
  procs: struct_window_procs | null = null;
  ini_routine: any = null;
  static $of(...a: any[]): struct_win_choices {
    const o = new struct_win_choices();
    const n = a.length;
    if (n > 0) o.procs = a[0];
    if (n > 1) o.ini_routine = a[1];
    return o;
  }
  $cp(s: struct_win_choices): this {
    this.procs = s.procs;
    this.ini_routine = s.ini_routine;
    return this;
  }
  $clone(): struct_win_choices { return new struct_win_choices().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['procs', 0, ['p']], ['ini_routine', 8, ['p']]]; }
}

/** struct window_procs: 416 bytes */
export class struct_window_procs {
  name: any = null;
  wincap: number = 0;
  wincap2: number = 0;
  has_color: Int8Array = new Int8Array(16);
  win_init_nhwindows: any = null;
  win_player_selection: any = null;
  win_askname: any = null;
  win_get_nh_event: any = null;
  win_exit_nhwindows: any = null;
  win_suspend_nhwindows: any = null;
  win_resume_nhwindows: any = null;
  win_create_nhwindow: any = null;
  win_clear_nhwindow: any = null;
  win_display_nhwindow: any = null;
  win_destroy_nhwindow: any = null;
  win_curs: any = null;
  win_putstr: any = null;
  win_putmixed: any = null;
  win_display_file: any = null;
  win_start_menu: any = null;
  win_add_menu: any = null;
  win_end_menu: any = null;
  win_select_menu: any = null;
  win_message_menu: any = null;
  win_update_inventory: any = null;
  win_mark_synch: any = null;
  win_wait_synch: any = null;
  win_cliparound: any = null;
  win_print_glyph: any = null;
  win_raw_print: any = null;
  win_raw_print_bold: any = null;
  win_nhgetch: any = null;
  win_nh_poskey: any = null;
  win_nhbell: any = null;
  win_doprev_message: any = null;
  win_yn_function: any = null;
  win_getlin: any = null;
  win_get_ext_cmd: any = null;
  win_number_pad: any = null;
  win_delay_output: any = null;
  win_start_screen: any = null;
  win_end_screen: any = null;
  win_outrip: any = null;
  win_preference_update: any = null;
  win_getmsghistory: any = null;
  win_putmsghistory: any = null;
  win_status_init: any = null;
  win_status_finish: any = null;
  win_status_enablefield: any = null;
  win_status_update: any = null;
  win_can_suspend: any = null;
  static $of(...a: any[]): struct_window_procs {
    const o = new struct_window_procs();
    const n = a.length;
    if (n > 0) o.name = a[0];
    if (n > 1) o.wincap = a[1];
    if (n > 2) o.wincap2 = a[2];
    if (n > 3) o.has_color = a[3];
    if (n > 4) o.win_init_nhwindows = a[4];
    if (n > 5) o.win_player_selection = a[5];
    if (n > 6) o.win_askname = a[6];
    if (n > 7) o.win_get_nh_event = a[7];
    if (n > 8) o.win_exit_nhwindows = a[8];
    if (n > 9) o.win_suspend_nhwindows = a[9];
    if (n > 10) o.win_resume_nhwindows = a[10];
    if (n > 11) o.win_create_nhwindow = a[11];
    if (n > 12) o.win_clear_nhwindow = a[12];
    if (n > 13) o.win_display_nhwindow = a[13];
    if (n > 14) o.win_destroy_nhwindow = a[14];
    if (n > 15) o.win_curs = a[15];
    if (n > 16) o.win_putstr = a[16];
    if (n > 17) o.win_putmixed = a[17];
    if (n > 18) o.win_display_file = a[18];
    if (n > 19) o.win_start_menu = a[19];
    if (n > 20) o.win_add_menu = a[20];
    if (n > 21) o.win_end_menu = a[21];
    if (n > 22) o.win_select_menu = a[22];
    if (n > 23) o.win_message_menu = a[23];
    if (n > 24) o.win_update_inventory = a[24];
    if (n > 25) o.win_mark_synch = a[25];
    if (n > 26) o.win_wait_synch = a[26];
    if (n > 27) o.win_cliparound = a[27];
    if (n > 28) o.win_print_glyph = a[28];
    if (n > 29) o.win_raw_print = a[29];
    if (n > 30) o.win_raw_print_bold = a[30];
    if (n > 31) o.win_nhgetch = a[31];
    if (n > 32) o.win_nh_poskey = a[32];
    if (n > 33) o.win_nhbell = a[33];
    if (n > 34) o.win_doprev_message = a[34];
    if (n > 35) o.win_yn_function = a[35];
    if (n > 36) o.win_getlin = a[36];
    if (n > 37) o.win_get_ext_cmd = a[37];
    if (n > 38) o.win_number_pad = a[38];
    if (n > 39) o.win_delay_output = a[39];
    if (n > 40) o.win_start_screen = a[40];
    if (n > 41) o.win_end_screen = a[41];
    if (n > 42) o.win_outrip = a[42];
    if (n > 43) o.win_preference_update = a[43];
    if (n > 44) o.win_getmsghistory = a[44];
    if (n > 45) o.win_putmsghistory = a[45];
    if (n > 46) o.win_status_init = a[46];
    if (n > 47) o.win_status_finish = a[47];
    if (n > 48) o.win_status_enablefield = a[48];
    if (n > 49) o.win_status_update = a[49];
    if (n > 50) o.win_can_suspend = a[50];
    return o;
  }
  $cp(s: struct_window_procs): this {
    this.name = s.name;
    this.wincap = s.wincap;
    this.wincap2 = s.wincap2;
    this.has_color.set(s.has_color);
    this.win_init_nhwindows = s.win_init_nhwindows;
    this.win_player_selection = s.win_player_selection;
    this.win_askname = s.win_askname;
    this.win_get_nh_event = s.win_get_nh_event;
    this.win_exit_nhwindows = s.win_exit_nhwindows;
    this.win_suspend_nhwindows = s.win_suspend_nhwindows;
    this.win_resume_nhwindows = s.win_resume_nhwindows;
    this.win_create_nhwindow = s.win_create_nhwindow;
    this.win_clear_nhwindow = s.win_clear_nhwindow;
    this.win_display_nhwindow = s.win_display_nhwindow;
    this.win_destroy_nhwindow = s.win_destroy_nhwindow;
    this.win_curs = s.win_curs;
    this.win_putstr = s.win_putstr;
    this.win_putmixed = s.win_putmixed;
    this.win_display_file = s.win_display_file;
    this.win_start_menu = s.win_start_menu;
    this.win_add_menu = s.win_add_menu;
    this.win_end_menu = s.win_end_menu;
    this.win_select_menu = s.win_select_menu;
    this.win_message_menu = s.win_message_menu;
    this.win_update_inventory = s.win_update_inventory;
    this.win_mark_synch = s.win_mark_synch;
    this.win_wait_synch = s.win_wait_synch;
    this.win_cliparound = s.win_cliparound;
    this.win_print_glyph = s.win_print_glyph;
    this.win_raw_print = s.win_raw_print;
    this.win_raw_print_bold = s.win_raw_print_bold;
    this.win_nhgetch = s.win_nhgetch;
    this.win_nh_poskey = s.win_nh_poskey;
    this.win_nhbell = s.win_nhbell;
    this.win_doprev_message = s.win_doprev_message;
    this.win_yn_function = s.win_yn_function;
    this.win_getlin = s.win_getlin;
    this.win_get_ext_cmd = s.win_get_ext_cmd;
    this.win_number_pad = s.win_number_pad;
    this.win_delay_output = s.win_delay_output;
    this.win_start_screen = s.win_start_screen;
    this.win_end_screen = s.win_end_screen;
    this.win_outrip = s.win_outrip;
    this.win_preference_update = s.win_preference_update;
    this.win_getmsghistory = s.win_getmsghistory;
    this.win_putmsghistory = s.win_putmsghistory;
    this.win_status_init = s.win_status_init;
    this.win_status_finish = s.win_status_finish;
    this.win_status_enablefield = s.win_status_enablefield;
    this.win_status_update = s.win_status_update;
    this.win_can_suspend = s.win_can_suspend;
    return this;
  }
  $clone(): struct_window_procs { return new struct_window_procs().$cp(this); }
  static $size = 416;
  static $layout(): any[] { return [['name', 0, ['p']], ['wincap', 8, ['i', 8, 0]], ['wincap2', 16, ['i', 8, 0]], ['has_color', 24, ['a', ['i', 1, 1], 16]], ['win_init_nhwindows', 40, ['p']], ['win_player_selection', 48, ['p']], ['win_askname', 56, ['p']], ['win_get_nh_event', 64, ['p']], ['win_exit_nhwindows', 72, ['p']], ['win_suspend_nhwindows', 80, ['p']], ['win_resume_nhwindows', 88, ['p']], ['win_create_nhwindow', 96, ['p']], ['win_clear_nhwindow', 104, ['p']], ['win_display_nhwindow', 112, ['p']], ['win_destroy_nhwindow', 120, ['p']], ['win_curs', 128, ['p']], ['win_putstr', 136, ['p']], ['win_putmixed', 144, ['p']], ['win_display_file', 152, ['p']], ['win_start_menu', 160, ['p']], ['win_add_menu', 168, ['p']], ['win_end_menu', 176, ['p']], ['win_select_menu', 184, ['p']], ['win_message_menu', 192, ['p']], ['win_update_inventory', 200, ['p']], ['win_mark_synch', 208, ['p']], ['win_wait_synch', 216, ['p']], ['win_cliparound', 224, ['p']], ['win_print_glyph', 232, ['p']], ['win_raw_print', 240, ['p']], ['win_raw_print_bold', 248, ['p']], ['win_nhgetch', 256, ['p']], ['win_nh_poskey', 264, ['p']], ['win_nhbell', 272, ['p']], ['win_doprev_message', 280, ['p']], ['win_yn_function', 288, ['p']], ['win_getlin', 296, ['p']], ['win_get_ext_cmd', 304, ['p']], ['win_number_pad', 312, ['p']], ['win_delay_output', 320, ['p']], ['win_start_screen', 328, ['p']], ['win_end_screen', 336, ['p']], ['win_outrip', 344, ['p']], ['win_preference_update', 352, ['p']], ['win_getmsghistory', 360, ['p']], ['win_putmsghistory', 368, ['p']], ['win_status_init', 376, ['p']], ['win_status_finish', 384, ['p']], ['win_status_enablefield', 392, ['p']], ['win_status_update', 400, ['p']], ['win_can_suspend', 408, ['p']]]; }
}

/** struct winsize: 8 bytes */
export class struct_winsize {
  ws_row: number = 0;
  ws_col: number = 0;
  ws_xpixel: number = 0;
  ws_ypixel: number = 0;
  static $of(...a: any[]): struct_winsize {
    const o = new struct_winsize();
    const n = a.length;
    if (n > 0) o.ws_row = a[0];
    if (n > 1) o.ws_col = a[1];
    if (n > 2) o.ws_xpixel = a[2];
    if (n > 3) o.ws_ypixel = a[3];
    return o;
  }
  $cp(s: struct_winsize): this {
    this.ws_row = s.ws_row;
    this.ws_col = s.ws_col;
    this.ws_xpixel = s.ws_xpixel;
    this.ws_ypixel = s.ws_ypixel;
    return this;
  }
  $clone(): struct_winsize { return new struct_winsize().$cp(this); }
  static $size = 8;
  static $layout(): any[] { return [['ws_row', 0, ['i', 2, 0]], ['ws_col', 2, ['i', 2, 0]], ['ws_xpixel', 4, ['i', 2, 0]], ['ws_ypixel', 6, ['i', 2, 0]]]; }
}

/** struct worn: 16 bytes */
export class struct_worn {
  w_mask: number = 0;
  w_obj: any = null;
  static $of(...a: any[]): struct_worn {
    const o = new struct_worn();
    const n = a.length;
    if (n > 0) o.w_mask = a[0];
    if (n > 1) o.w_obj = a[1];
    return o;
  }
  $cp(s: struct_worn): this {
    this.w_mask = s.w_mask;
    this.w_obj = s.w_obj;
    return this;
  }
  $clone(): struct_worn { return new struct_worn().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['w_mask', 0, ['i', 8, 1]], ['w_obj', 8, ['p']]]; }
}

/** struct wseg: 16 bytes */
export class struct_wseg {
  nseg: struct_wseg | null = null;
  wx: number = 0;
  wy: number = 0;
  static $of(...a: any[]): struct_wseg {
    const o = new struct_wseg();
    const n = a.length;
    if (n > 0) o.nseg = a[0];
    if (n > 1) o.wx = a[1];
    if (n > 2) o.wy = a[2];
    return o;
  }
  $cp(s: struct_wseg): this {
    this.nseg = s.nseg;
    this.wx = s.wx;
    this.wy = s.wy;
    return this;
  }
  $clone(): struct_wseg { return new struct_wseg().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['nseg', 0, ['p']], ['wx', 8, ['i', 1, 1]], ['wy', 9, ['i', 1, 1]]]; }
}

/** struct xlock_s: 32 bytes */
export class struct_xlock_s {
  door: struct_rm | null = null;
  box: struct_obj | null = null;
  picktyp: number = 0;
  chance: number = 0;
  usedtime: number = 0;
  magic_key: number = 0;
  static $of(...a: any[]): struct_xlock_s {
    const o = new struct_xlock_s();
    const n = a.length;
    if (n > 0) o.door = a[0];
    if (n > 1) o.box = a[1];
    if (n > 2) o.picktyp = a[2];
    if (n > 3) o.chance = a[3];
    if (n > 4) o.usedtime = a[4];
    if (n > 5) o.magic_key = a[5];
    return o;
  }
  $cp(s: struct_xlock_s): this {
    this.door = s.door;
    this.box = s.box;
    this.picktyp = s.picktyp;
    this.chance = s.chance;
    this.usedtime = s.usedtime;
    this.magic_key = s.magic_key;
    return this;
  }
  $clone(): struct_xlock_s { return new struct_xlock_s().$cp(this); }
  static $size = 32;
  static $layout(): any[] { return [['door', 0, ['p']], ['box', 8, ['p']], ['picktyp', 16, ['i', 4, 1]], ['chance', 20, ['i', 4, 1]], ['usedtime', 24, ['i', 4, 1]], ['magic_key', 28, ['i', 1, 1]]]; }
}

/** struct xprnctx: 2 bytes */
export class struct_xprnctx {
  let: number = 0;
  dot: number = 0;
  static $of(...a: any[]): struct_xprnctx {
    const o = new struct_xprnctx();
    const n = a.length;
    if (n > 0) o.let = a[0];
    if (n > 1) o.dot = a[1];
    return o;
  }
  $cp(s: struct_xprnctx): this {
    this.let = s.let;
    this.dot = s.dot;
    return this;
  }
  $clone(): struct_xprnctx { return new struct_xprnctx().$cp(this); }
  static $size = 2;
  static $layout(): any[] { return [['let', 0, ['i', 1, 1]], ['dot', 1, ['i', 1, 1]]]; }
}

/** struct you: 2392 bytes */
export class struct_you {
  ux: number = 0;
  uy: number = 0;
  dx: number = 0;
  dy: number = 0;
  dz: number = 0;
  di: number = 0;
  tx: number = 0;
  ty: number = 0;
  ux0: number = 0;
  uy0: number = 0;
  uz: struct_d_level = new struct_d_level();
  uz0: struct_d_level = new struct_d_level();
  utolev: struct_d_level = new struct_d_level();
  utotype: number = 0;
  umoved: number = 0;
  last_str_turn: number = 0;
  ulevel: number = 0;
  ulevelmax: number = 0;
  utrap: number = 0;
  utraptype: number = 0;
  urooms: Int8Array = new Int8Array(5);
  urooms0: Int8Array = new Int8Array(5);
  uentered: Int8Array = new Int8Array(5);
  ushops: Int8Array = new Int8Array(5);
  ushops0: Int8Array = new Int8Array(5);
  ushops_entered: Int8Array = new Int8Array(5);
  ushops_left: Int8Array = new Int8Array(5);
  uhunger: number = 0;
  uhs: number = 0;
  uprops: any[] = $sarr(struct_prop, 68);
  umconf: number = 0;
  usick_type: number = 0;
  nv_range: number = 0;
  xray_range: number = 0;
  bglyph: number = 0;
  cglyph: number = 0;
  bc_order: number = 0;
  bc_felt: number = 0;
  umonster: number = 0;
  umonnum: number = 0;
  mh: number = 0;
  mhmax: number = 0;
  mtimedone: number = 0;
  macurr: struct_attribs = new struct_attribs();
  mamax: struct_attribs = new struct_attribs();
  ulycn: number = 0;
  ucreamed: number = 0;
  uswldtim: number = 0;
  uswallow: number = 0;
  uinwater: number = 0;
  uundetected: number = 0;
  mfemale: number = 0;
  uinvulnerable: number = 0;
  uburied: number = 0;
  uedibility: number = 0;
  udg_cnt: number = 0;
  uachieve: struct_u_achieve = new struct_u_achieve();
  uevent: struct_u_event = new struct_u_event();
  uhave: struct_u_have = new struct_u_have();
  uconduct: struct_u_conduct = new struct_u_conduct();
  uroleplay: struct_u_roleplay = new struct_u_roleplay();
  acurr: struct_attribs = new struct_attribs();
  aexe: struct_attribs = new struct_attribs();
  abon: struct_attribs = new struct_attribs();
  amax: struct_attribs = new struct_attribs();
  atemp: struct_attribs = new struct_attribs();
  atime: struct_attribs = new struct_attribs();
  ualign: struct_align = new struct_align();
  ualignbase: Int8Array = new Int8Array(2);
  uluck: number = 0;
  moreluck: number = 0;
  uhitinc: number = 0;
  udaminc: number = 0;
  uac: number = 0;
  uspellprot: number = 0;
  usptime: number = 0;
  uspmtime: number = 0;
  uhp: number = 0;
  uhpmax: number = 0;
  uen: number = 0;
  uenmax: number = 0;
  uhpinc: Int8Array = new Int8Array(30);
  ueninc: Int8Array = new Int8Array(30);
  ugangr: number = 0;
  ugifts: number = 0;
  ublessed: number = 0;
  ublesscnt: number = 0;
  umoney0: number = 0;
  uspare1: number = 0;
  uexp: number = 0;
  urexp: number = 0;
  ucleansed: number = 0;
  usleep: number = 0;
  uinvault: number = 0;
  ustuck: struct_monst | null = null;
  usteed: struct_monst | null = null;
  ugallop: number = 0;
  urideturns: number = 0;
  umortality: number = 0;
  ugrave_arise: number = 0;
  weapon_slots: number = 0;
  skills_advanced: number = 0;
  skill_record: Int8Array = new Int8Array(60);
  weapon_skills: any[] = $sarr(struct_skills, 39);
  twoweap: number = 0;
  static $of(...a: any[]): struct_you {
    const o = new struct_you();
    const n = a.length;
    if (n > 0) o.ux = a[0];
    if (n > 1) o.uy = a[1];
    if (n > 2) o.dx = a[2];
    if (n > 3) o.dy = a[3];
    if (n > 4) o.dz = a[4];
    if (n > 5) o.di = a[5];
    if (n > 6) o.tx = a[6];
    if (n > 7) o.ty = a[7];
    if (n > 8) o.ux0 = a[8];
    if (n > 9) o.uy0 = a[9];
    if (n > 10) o.uz = a[10];
    if (n > 11) o.uz0 = a[11];
    if (n > 12) o.utolev = a[12];
    if (n > 13) o.utotype = a[13];
    if (n > 14) o.umoved = a[14];
    if (n > 15) o.last_str_turn = a[15];
    if (n > 16) o.ulevel = a[16];
    if (n > 17) o.ulevelmax = a[17];
    if (n > 18) o.utrap = a[18];
    if (n > 19) o.utraptype = a[19];
    if (n > 20) o.urooms = a[20];
    if (n > 21) o.urooms0 = a[21];
    if (n > 22) o.uentered = a[22];
    if (n > 23) o.ushops = a[23];
    if (n > 24) o.ushops0 = a[24];
    if (n > 25) o.ushops_entered = a[25];
    if (n > 26) o.ushops_left = a[26];
    if (n > 27) o.uhunger = a[27];
    if (n > 28) o.uhs = a[28];
    if (n > 29) o.uprops = a[29];
    if (n > 30) o.umconf = a[30];
    if (n > 31) o.usick_type = a[31];
    if (n > 32) o.nv_range = a[32];
    if (n > 33) o.xray_range = a[33];
    if (n > 34) o.bglyph = a[34];
    if (n > 35) o.cglyph = a[35];
    if (n > 36) o.bc_order = a[36];
    if (n > 37) o.bc_felt = a[37];
    if (n > 38) o.umonster = a[38];
    if (n > 39) o.umonnum = a[39];
    if (n > 40) o.mh = a[40];
    if (n > 41) o.mhmax = a[41];
    if (n > 42) o.mtimedone = a[42];
    if (n > 43) o.macurr = a[43];
    if (n > 44) o.mamax = a[44];
    if (n > 45) o.ulycn = a[45];
    if (n > 46) o.ucreamed = a[46];
    if (n > 47) o.uswldtim = a[47];
    if (n > 48) o.uswallow = a[48];
    if (n > 49) o.uinwater = a[49];
    if (n > 50) o.uundetected = a[50];
    if (n > 51) o.mfemale = a[51];
    if (n > 52) o.uinvulnerable = a[52];
    if (n > 53) o.uburied = a[53];
    if (n > 54) o.uedibility = a[54];
    if (n > 55) o.udg_cnt = a[55];
    if (n > 56) o.uachieve = a[56];
    if (n > 57) o.uevent = a[57];
    if (n > 58) o.uhave = a[58];
    if (n > 59) o.uconduct = a[59];
    if (n > 60) o.uroleplay = a[60];
    if (n > 61) o.acurr = a[61];
    if (n > 62) o.aexe = a[62];
    if (n > 63) o.abon = a[63];
    if (n > 64) o.amax = a[64];
    if (n > 65) o.atemp = a[65];
    if (n > 66) o.atime = a[66];
    if (n > 67) o.ualign = a[67];
    if (n > 68) o.ualignbase = a[68];
    if (n > 69) o.uluck = a[69];
    if (n > 70) o.moreluck = a[70];
    if (n > 71) o.uhitinc = a[71];
    if (n > 72) o.udaminc = a[72];
    if (n > 73) o.uac = a[73];
    if (n > 74) o.uspellprot = a[74];
    if (n > 75) o.usptime = a[75];
    if (n > 76) o.uspmtime = a[76];
    if (n > 77) o.uhp = a[77];
    if (n > 78) o.uhpmax = a[78];
    if (n > 79) o.uen = a[79];
    if (n > 80) o.uenmax = a[80];
    if (n > 81) o.uhpinc = a[81];
    if (n > 82) o.ueninc = a[82];
    if (n > 83) o.ugangr = a[83];
    if (n > 84) o.ugifts = a[84];
    if (n > 85) o.ublessed = a[85];
    if (n > 86) o.ublesscnt = a[86];
    if (n > 87) o.umoney0 = a[87];
    if (n > 88) o.uspare1 = a[88];
    if (n > 89) o.uexp = a[89];
    if (n > 90) o.urexp = a[90];
    if (n > 91) o.ucleansed = a[91];
    if (n > 92) o.usleep = a[92];
    if (n > 93) o.uinvault = a[93];
    if (n > 94) o.ustuck = a[94];
    if (n > 95) o.usteed = a[95];
    if (n > 96) o.ugallop = a[96];
    if (n > 97) o.urideturns = a[97];
    if (n > 98) o.umortality = a[98];
    if (n > 99) o.ugrave_arise = a[99];
    if (n > 100) o.weapon_slots = a[100];
    if (n > 101) o.skills_advanced = a[101];
    if (n > 102) o.skill_record = a[102];
    if (n > 103) o.weapon_skills = a[103];
    if (n > 104) o.twoweap = a[104];
    return o;
  }
  $cp(s: struct_you): this {
    this.ux = s.ux;
    this.uy = s.uy;
    this.dx = s.dx;
    this.dy = s.dy;
    this.dz = s.dz;
    this.di = s.di;
    this.tx = s.tx;
    this.ty = s.ty;
    this.ux0 = s.ux0;
    this.uy0 = s.uy0;
    this.uz.$cp(s.uz);
    this.uz0.$cp(s.uz0);
    this.utolev.$cp(s.utolev);
    this.utotype = s.utotype;
    this.umoved = s.umoved;
    this.last_str_turn = s.last_str_turn;
    this.ulevel = s.ulevel;
    this.ulevelmax = s.ulevelmax;
    this.utrap = s.utrap;
    this.utraptype = s.utraptype;
    this.urooms.set(s.urooms);
    this.urooms0.set(s.urooms0);
    this.uentered.set(s.uentered);
    this.ushops.set(s.ushops);
    this.ushops0.set(s.ushops0);
    this.ushops_entered.set(s.ushops_entered);
    this.ushops_left.set(s.ushops_left);
    this.uhunger = s.uhunger;
    this.uhs = s.uhs;
    $cparr(this.uprops, s.uprops);
    this.umconf = s.umconf;
    this.usick_type = s.usick_type;
    this.nv_range = s.nv_range;
    this.xray_range = s.xray_range;
    this.bglyph = s.bglyph;
    this.cglyph = s.cglyph;
    this.bc_order = s.bc_order;
    this.bc_felt = s.bc_felt;
    this.umonster = s.umonster;
    this.umonnum = s.umonnum;
    this.mh = s.mh;
    this.mhmax = s.mhmax;
    this.mtimedone = s.mtimedone;
    this.macurr.$cp(s.macurr);
    this.mamax.$cp(s.mamax);
    this.ulycn = s.ulycn;
    this.ucreamed = s.ucreamed;
    this.uswldtim = s.uswldtim;
    this.uswallow = s.uswallow;
    this.uinwater = s.uinwater;
    this.uundetected = s.uundetected;
    this.mfemale = s.mfemale;
    this.uinvulnerable = s.uinvulnerable;
    this.uburied = s.uburied;
    this.uedibility = s.uedibility;
    this.udg_cnt = s.udg_cnt;
    this.uachieve.$cp(s.uachieve);
    this.uevent.$cp(s.uevent);
    this.uhave.$cp(s.uhave);
    this.uconduct.$cp(s.uconduct);
    this.uroleplay.$cp(s.uroleplay);
    this.acurr.$cp(s.acurr);
    this.aexe.$cp(s.aexe);
    this.abon.$cp(s.abon);
    this.amax.$cp(s.amax);
    this.atemp.$cp(s.atemp);
    this.atime.$cp(s.atime);
    this.ualign.$cp(s.ualign);
    this.ualignbase.set(s.ualignbase);
    this.uluck = s.uluck;
    this.moreluck = s.moreluck;
    this.uhitinc = s.uhitinc;
    this.udaminc = s.udaminc;
    this.uac = s.uac;
    this.uspellprot = s.uspellprot;
    this.usptime = s.usptime;
    this.uspmtime = s.uspmtime;
    this.uhp = s.uhp;
    this.uhpmax = s.uhpmax;
    this.uen = s.uen;
    this.uenmax = s.uenmax;
    this.uhpinc.set(s.uhpinc);
    this.ueninc.set(s.ueninc);
    this.ugangr = s.ugangr;
    this.ugifts = s.ugifts;
    this.ublessed = s.ublessed;
    this.ublesscnt = s.ublesscnt;
    this.umoney0 = s.umoney0;
    this.uspare1 = s.uspare1;
    this.uexp = s.uexp;
    this.urexp = s.urexp;
    this.ucleansed = s.ucleansed;
    this.usleep = s.usleep;
    this.uinvault = s.uinvault;
    this.ustuck = s.ustuck;
    this.usteed = s.usteed;
    this.ugallop = s.ugallop;
    this.urideturns = s.urideturns;
    this.umortality = s.umortality;
    this.ugrave_arise = s.ugrave_arise;
    this.weapon_slots = s.weapon_slots;
    this.skills_advanced = s.skills_advanced;
    this.skill_record.set(s.skill_record);
    $cparr(this.weapon_skills, s.weapon_skills);
    this.twoweap = s.twoweap;
    return this;
  }
  $clone(): struct_you { return new struct_you().$cp(this); }
  static $size = 2392;
  static $layout(): any[] { return [['ux', 0, ['i', 1, 1]], ['uy', 1, ['i', 1, 1]], ['dx', 2, ['i', 1, 1]], ['dy', 3, ['i', 1, 1]], ['dz', 4, ['i', 1, 1]], ['di', 5, ['i', 1, 1]], ['tx', 6, ['i', 1, 1]], ['ty', 7, ['i', 1, 1]], ['ux0', 8, ['i', 1, 1]], ['uy0', 9, ['i', 1, 1]], ['uz', 10, ['r', struct_d_level]], ['uz0', 12, ['r', struct_d_level]], ['utolev', 14, ['r', struct_d_level]], ['utotype', 16, ['i', 1, 0]], ['umoved', 17, ['i', 1, 1]], ['last_str_turn', 20, ['i', 4, 1]], ['ulevel', 24, ['i', 4, 1]], ['ulevelmax', 28, ['i', 4, 1]], ['utrap', 32, ['i', 4, 0]], ['utraptype', 36, ['i', 4, 0]], ['urooms', 40, ['a', ['i', 1, 1], 5]], ['urooms0', 45, ['a', ['i', 1, 1], 5]], ['uentered', 50, ['a', ['i', 1, 1], 5]], ['ushops', 55, ['a', ['i', 1, 1], 5]], ['ushops0', 60, ['a', ['i', 1, 1], 5]], ['ushops_entered', 65, ['a', ['i', 1, 1], 5]], ['ushops_left', 70, ['a', ['i', 1, 1], 5]], ['uhunger', 76, ['i', 4, 1]], ['uhs', 80, ['i', 4, 0]], ['uprops', 88, ['a', ['r', struct_prop], 68]], ['umconf', 1720, ['i', 4, 0]], ['usick_type', 1724, ['b', 0, 2, 0]], ['nv_range', 1728, ['i', 4, 1]], ['xray_range', 1732, ['i', 4, 1]], ['bglyph', 1736, ['i', 4, 1]], ['cglyph', 1740, ['i', 4, 1]], ['bc_order', 1744, ['i', 4, 1]], ['bc_felt', 1748, ['i', 4, 1]], ['umonster', 1752, ['i', 4, 1]], ['umonnum', 1756, ['i', 4, 1]], ['mh', 1760, ['i', 4, 1]], ['mhmax', 1764, ['i', 4, 1]], ['mtimedone', 1768, ['i', 4, 1]], ['macurr', 1772, ['r', struct_attribs]], ['mamax', 1778, ['r', struct_attribs]], ['ulycn', 1784, ['i', 4, 1]], ['ucreamed', 1788, ['i', 4, 0]], ['uswldtim', 1792, ['i', 4, 0]], ['uswallow', 1796, ['b', 0, 1, 0]], ['uinwater', 1796, ['b', 1, 1, 0]], ['uundetected', 1796, ['b', 2, 1, 0]], ['mfemale', 1796, ['b', 3, 1, 0]], ['uinvulnerable', 1796, ['b', 4, 1, 0]], ['uburied', 1796, ['b', 5, 1, 0]], ['uedibility', 1796, ['b', 6, 1, 0]], ['udg_cnt', 1800, ['i', 4, 0]], ['uachieve', 1804, ['r', struct_u_achieve]], ['uevent', 1808, ['r', struct_u_event]], ['uhave', 1812, ['r', struct_u_have]], ['uconduct', 1816, ['r', struct_u_conduct]], ['uroleplay', 1904, ['r', struct_u_roleplay]], ['acurr', 1920, ['r', struct_attribs]], ['aexe', 1926, ['r', struct_attribs]], ['abon', 1932, ['r', struct_attribs]], ['amax', 1938, ['r', struct_attribs]], ['atemp', 1944, ['r', struct_attribs]], ['atime', 1950, ['r', struct_attribs]], ['ualign', 1956, ['r', struct_align]], ['ualignbase', 1964, ['a', ['i', 1, 1], 2]], ['uluck', 1966, ['i', 1, 1]], ['moreluck', 1967, ['i', 1, 1]], ['uhitinc', 1968, ['i', 1, 1]], ['udaminc', 1969, ['i', 1, 1]], ['uac', 1970, ['i', 1, 1]], ['uspellprot', 1971, ['i', 1, 0]], ['usptime', 1972, ['i', 1, 0]], ['uspmtime', 1973, ['i', 1, 0]], ['uhp', 1976, ['i', 4, 1]], ['uhpmax', 1980, ['i', 4, 1]], ['uen', 1984, ['i', 4, 1]], ['uenmax', 1988, ['i', 4, 1]], ['uhpinc', 1992, ['a', ['i', 1, 1], 30]], ['ueninc', 2022, ['a', ['i', 1, 1], 30]], ['ugangr', 2052, ['i', 4, 1]], ['ugifts', 2056, ['i', 4, 1]], ['ublessed', 2060, ['i', 4, 1]], ['ublesscnt', 2064, ['i', 4, 1]], ['umoney0', 2072, ['i', 8, 1]], ['uspare1', 2080, ['i', 8, 1]], ['uexp', 2088, ['i', 8, 1]], ['urexp', 2096, ['i', 8, 1]], ['ucleansed', 2104, ['i', 8, 1]], ['usleep', 2112, ['i', 8, 1]], ['uinvault', 2120, ['i', 4, 1]], ['ustuck', 2128, ['p']], ['usteed', 2136, ['p']], ['ugallop', 2144, ['i', 8, 1]], ['urideturns', 2152, ['i', 4, 1]], ['umortality', 2156, ['i', 4, 1]], ['ugrave_arise', 2160, ['i', 4, 1]], ['weapon_slots', 2164, ['i', 4, 1]], ['skills_advanced', 2168, ['i', 4, 1]], ['skill_record', 2172, ['a', ['i', 1, 1], 60]], ['weapon_skills', 2232, ['a', ['r', struct_skills], 39]], ['twoweap', 2388, ['i', 1, 1]]]; }
}

/** union any: 8 bytes */
export class union_any {
  $v: any = 0;
  $raw: Uint8Array | null = null;
  get a_void(): any { return this.$raw ? $udecode(this, ['p']) : this.$v; }
  set a_void(v: any) { this.$v = v; this.$raw = null; }
  get a_obj(): struct_obj | null { return this.$raw ? $udecode(this, ['p']) : this.$v; }
  set a_obj(v: struct_obj | null) { this.$v = v; this.$raw = null; }
  get a_monst(): struct_monst | null { return this.$raw ? $udecode(this, ['p']) : this.$v; }
  set a_monst(v: struct_monst | null) { this.$v = v; this.$raw = null; }
  get a_int(): number { return this.$raw ? $udecode(this, ['i', 4, 1]) : this.$v; }
  set a_int(v: number) { this.$v = v; this.$raw = null; }
  get a_char(): number { return this.$raw ? $udecode(this, ['i', 1, 1]) : this.$v; }
  set a_char(v: number) { this.$v = v; this.$raw = null; }
  get a_schar(): number { return this.$raw ? $udecode(this, ['i', 1, 1]) : this.$v; }
  set a_schar(v: number) { this.$v = v; this.$raw = null; }
  get a_uchar(): number { return this.$raw ? $udecode(this, ['i', 1, 0]) : this.$v; }
  set a_uchar(v: number) { this.$v = v; this.$raw = null; }
  get a_uint(): number { return this.$raw ? $udecode(this, ['i', 4, 0]) : this.$v; }
  set a_uint(v: number) { this.$v = v; this.$raw = null; }
  get a_long(): number { return this.$raw ? $udecode(this, ['i', 8, 1]) : this.$v; }
  set a_long(v: number) { this.$v = v; this.$raw = null; }
  get a_ulong(): number { return this.$raw ? $udecode(this, ['i', 8, 0]) : this.$v; }
  set a_ulong(v: number) { this.$v = v; this.$raw = null; }
  get a_iptr(): any { return this.$raw ? $udecode(this, ['p']) : this.$v; }
  set a_iptr(v: any) { this.$v = v; this.$raw = null; }
  get a_lptr(): any { return this.$raw ? $udecode(this, ['p']) : this.$v; }
  set a_lptr(v: any) { this.$v = v; this.$raw = null; }
  get a_ulptr(): any { return this.$raw ? $udecode(this, ['p']) : this.$v; }
  set a_ulptr(v: any) { this.$v = v; this.$raw = null; }
  get a_uptr(): any { return this.$raw ? $udecode(this, ['p']) : this.$v; }
  set a_uptr(v: any) { this.$v = v; this.$raw = null; }
  get a_string(): any { return this.$raw ? $udecode(this, ['p']) : this.$v; }
  set a_string(v: any) { this.$v = v; this.$raw = null; }
  get a_nfunc(): any { return this.$raw ? $udecode(this, ['p']) : this.$v; }
  set a_nfunc(v: any) { this.$v = v; this.$raw = null; }
  get a_mask32(): number { return this.$raw ? $udecode(this, ['i', 8, 0]) : this.$v; }
  set a_mask32(v: number) { this.$v = v; this.$raw = null; }
  static $of_a_void(v: any): union_any { const o = new union_any(); o.a_void = v; return o; }
  static $of_a_obj(v: any): union_any { const o = new union_any(); o.a_obj = v; return o; }
  static $of_a_monst(v: any): union_any { const o = new union_any(); o.a_monst = v; return o; }
  static $of_a_int(v: any): union_any { const o = new union_any(); o.a_int = v; return o; }
  static $of_a_char(v: any): union_any { const o = new union_any(); o.a_char = v; return o; }
  static $of_a_schar(v: any): union_any { const o = new union_any(); o.a_schar = v; return o; }
  static $of_a_uchar(v: any): union_any { const o = new union_any(); o.a_uchar = v; return o; }
  static $of_a_uint(v: any): union_any { const o = new union_any(); o.a_uint = v; return o; }
  static $of_a_long(v: any): union_any { const o = new union_any(); o.a_long = v; return o; }
  static $of_a_ulong(v: any): union_any { const o = new union_any(); o.a_ulong = v; return o; }
  static $of_a_iptr(v: any): union_any { const o = new union_any(); o.a_iptr = v; return o; }
  static $of_a_lptr(v: any): union_any { const o = new union_any(); o.a_lptr = v; return o; }
  static $of_a_ulptr(v: any): union_any { const o = new union_any(); o.a_ulptr = v; return o; }
  static $of_a_uptr(v: any): union_any { const o = new union_any(); o.a_uptr = v; return o; }
  static $of_a_string(v: any): union_any { const o = new union_any(); o.a_string = v; return o; }
  static $of_a_nfunc(v: any): union_any { const o = new union_any(); o.a_nfunc = v; return o; }
  static $of_a_mask32(v: any): union_any { const o = new union_any(); o.a_mask32 = v; return o; }
  $cp(s: union_any): this { this.$v = $uclone(s.$v); this.$raw = s.$raw; return this; }
  $clone(): union_any { return new union_any().$cp(this); }
  static $size = 8;
  static $layout(): any[] { return [['a_void', ['p']], ['a_obj', ['p']], ['a_monst', ['p']], ['a_int', ['i', 4, 1]], ['a_char', ['i', 1, 1]], ['a_schar', ['i', 1, 1]], ['a_uchar', ['i', 1, 0]], ['a_uint', ['i', 4, 0]], ['a_long', ['i', 8, 1]], ['a_ulong', ['i', 8, 0]], ['a_iptr', ['p']], ['a_lptr', ['p']], ['a_ulptr', ['p']], ['a_uptr', ['p']], ['a_string', ['p']], ['a_nfunc', ['p']], ['a_mask32', ['i', 8, 0]]]; }
}

/** union str_or_len: 8 bytes */
export class union_str_or_len {
  $v: any = 0;
  $raw: Uint8Array | null = null;
  get str(): any { return this.$raw ? $udecode(this, ['p']) : this.$v; }
  set str(v: any) { this.$v = v; this.$raw = null; }
  get len(): number { return this.$raw ? $udecode(this, ['i', 4, 1]) : this.$v; }
  set len(v: number) { this.$v = v; this.$raw = null; }
  static $of_str(v: any): union_str_or_len { const o = new union_str_or_len(); o.str = v; return o; }
  static $of_len(v: any): union_str_or_len { const o = new union_str_or_len(); o.len = v; return o; }
  $cp(s: union_str_or_len): this { this.$v = $uclone(s.$v); this.$raw = s.$raw; return this; }
  $clone(): union_str_or_len { return new union_str_or_len().$cp(this); }
  static $size = 8;
  static $layout(): any[] { return [['str', ['p']], ['len', ['i', 4, 1]]]; }
}

/** union vlaunchinfo: 2 bytes */
export class union_vlaunchinfo {
  $v: any = 0;
  $raw: Uint8Array | null = null;
  get v_launch_otyp(): number { return this.$raw ? $udecode(this, ['i', 2, 1]) : this.$v; }
  set v_launch_otyp(v: number) { this.$v = v; this.$raw = null; }
  get v_launch2(): struct_nhcoord { return $umember(this, ['r', struct_nhcoord], () => new struct_nhcoord()); }
  set v_launch2(v: struct_nhcoord) { this.$v = v; this.$raw = null; }
  get v_conjoined(): number { return this.$raw ? $udecode(this, ['i', 1, 0]) : this.$v; }
  set v_conjoined(v: number) { this.$v = v; this.$raw = null; }
  get v_tnote(): number { return this.$raw ? $udecode(this, ['i', 2, 1]) : this.$v; }
  set v_tnote(v: number) { this.$v = v; this.$raw = null; }
  static $of_v_launch_otyp(v: any): union_vlaunchinfo { const o = new union_vlaunchinfo(); o.v_launch_otyp = v; return o; }
  static $of_v_launch2(v: any): union_vlaunchinfo { const o = new union_vlaunchinfo(); o.v_launch2 = v; return o; }
  static $of_v_conjoined(v: any): union_vlaunchinfo { const o = new union_vlaunchinfo(); o.v_conjoined = v; return o; }
  static $of_v_tnote(v: any): union_vlaunchinfo { const o = new union_vlaunchinfo(); o.v_tnote = v; return o; }
  $cp(s: union_vlaunchinfo): this { this.$v = $uclone(s.$v); this.$raw = s.$raw; return this; }
  $clone(): union_vlaunchinfo { return new union_vlaunchinfo().$cp(this); }
  static $size = 2;
  static $layout(): any[] { return [['v_launch_otyp', ['i', 2, 1]], ['v_launch2', ['r', struct_nhcoord]], ['v_conjoined', ['i', 1, 0]], ['v_tnote', ['i', 2, 1]]]; }
}

/** union vptrs: 8 bytes */
export class union_vptrs {
  $v: any = 0;
  $raw: Uint8Array | null = null;
  get v_nexthere(): struct_obj | null { return this.$raw ? $udecode(this, ['p']) : this.$v; }
  set v_nexthere(v: struct_obj | null) { this.$v = v; this.$raw = null; }
  get v_ocontainer(): struct_obj | null { return this.$raw ? $udecode(this, ['p']) : this.$v; }
  set v_ocontainer(v: struct_obj | null) { this.$v = v; this.$raw = null; }
  get v_ocarry(): struct_monst | null { return this.$raw ? $udecode(this, ['p']) : this.$v; }
  set v_ocarry(v: struct_monst | null) { this.$v = v; this.$raw = null; }
  static $of_v_nexthere(v: any): union_vptrs { const o = new union_vptrs(); o.v_nexthere = v; return o; }
  static $of_v_ocontainer(v: any): union_vptrs { const o = new union_vptrs(); o.v_ocontainer = v; return o; }
  static $of_v_ocarry(v: any): union_vptrs { const o = new union_vptrs(); o.v_ocarry = v; return o; }
  $cp(s: union_vptrs): this { this.$v = $uclone(s.$v); this.$raw = s.$raw; return this; }
  $clone(): union_vptrs { return new union_vptrs().$cp(this); }
  static $size = 8;
  static $layout(): any[] { return [['v_nexthere', ['p']], ['v_ocontainer', ['p']], ['v_ocarry', ['p']]]; }
}
