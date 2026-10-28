// cache.cpp and specache.cpp: the registry of every picture, tile, sound and particle frame the data
// names, loaded from its SPEC file when first used and dropped again on level loads (the sound layer
// sees the same loads as the original's)
import { crc_manager } from './crc.ts';
import { dprintf, fatal } from './imlib/dprint.ts';
import { image } from './imlib/image.ts';
import { bFILE, jFILE, open_file, SEEK_SET, spec_directory, spec_types, SPEC_BACKTILE, SPEC_CHARACTER,
  SPEC_CHARACTER2, SPEC_EXTERN_SFX, SPEC_EXTERNAL_LCACHE, SPEC_FORETILE, SPEC_IMAGE, SPEC_PALETTE,
  SPEC_PARTICLE } from './imlib/specs.ts';
import { backtile, char_tint, figure, foretile } from './items.ts';
import { part_frame } from './particle.ts';
import { sound_effect, S } from './sdlport/sound.ts';
import { CAR, CDR, item_type, lbreak, lcar, lcdr, lnumber_value, lstring_value, L_CONS_CELL, type LObj } from './lisp/lisp.ts';

/** specache.cpp: spec directories by file name */
class spec_directory_cache {
  private dirs = new Map<string, spec_directory>();
  get_spec_directory(filename: string, fp: bFILE | null = null): spec_directory | null {
    const d = this.dirs.get(filename);
    if (d) return d;
    let need_close = false;
    if (!fp) {
      fp = open_file(filename, 'rb');
      if (fp.open_failure()) {
        fp.close();
        return null;
      }
      need_close = true;
    }
    const sd = new spec_directory(fp);
    this.dirs.set(filename, sd);
    if (need_close) fp.close();
    return sd;
  }
  clear(): void { this.dirs.clear(); }
}
export const sd_cache = new spec_directory_cache();

class CacheItem {
  data: unknown = null;
  last_access = -1;
  type = 0;
  file_number = -1;
  offset = 0;
}

export class CacheList {
  list: CacheItem[] = [];
  total = 0;
  last_registered = -1;
  last_access = 1;
  poll_start_access = 0;
  last_file = -1;
  fp: bFILE | null = null;
  last_dir: spec_directory | null = null;
  last_offset = -1;
  used = 0;
  ful = 0;
  prof_data: Int32Array | null = null;

  private touch(x: CacheItem): void {
    x.last_access = this.last_access;
    this.last_access = (this.last_access + 1) | 0;
    if (x.last_access < 0) {
      this.normalize();
      x.last_access = 1;
    }
  }

  private normalize(): void {
    this.last_access = -1;
    for (const ci of this.list) {
      if (ci.last_access >= 0) ci.last_access = ci.last_access >> 16;
      if (ci.last_access > this.last_access) this.last_access = ci.last_access;
    }
    this.last_access++;
  }

  in_use(): number {
    if (this.used) {
      this.used = 0;
      return 1;
    }
    return 0;
  }
  full(): number {
    if (this.ful) {
      this.ful = 0;
      return 1;
    }
    return 0;
  }

  unmalloc(i: CacheItem): void {
    switch (i.type) {
      case SPEC_CHARACTER2: case SPEC_CHARACTER: case SPEC_FORETILE: case SPEC_BACKTILE: case SPEC_IMAGE:
      case SPEC_EXTERN_SFX: case SPEC_PARTICLE: case SPEC_EXTERNAL_LCACHE: case SPEC_PALETTE:
        break;
      default:
        dprintf('Trying to unmalloc unknown type\n');
    }
    i.data = null;
    i.last_access = -1;
  }

  prof_init(): void { this.prof_data = new Int32Array(this.total); }
  prof_uninit(): void { this.prof_data = null; }
  prof_is_on(): boolean { return this.prof_data !== null; }
  prof_poll_start(): void { this.poll_start_access = this.last_access; }
  prof_poll_end(): void {
    if (this.prof_data) for (let i = 0; i < this.total; i++) if (this.list[i].last_access >= this.poll_start_access) this.prof_data[i]++;
  }

  private preload_cache_object(type: number, fun_of: (t: number) => LObj, set_need: (t: number) => boolean, total_objects: number,
    eval_fun: (f: LObj, args: LObj) => LObj, new_args: (n: number) => LObj): void {
    if (type < 0xffff) {
      if (set_need(type)) {
        const cache_fun = fun_of(type);
        if (cache_fun) {
          const cl = eval_fun(cache_fun, new_args(type));
          if (cl && lcar(cl)) {
            for (let obj_list = lcar(cl); obj_list; obj_list = CDR(obj_list)) {
              const t = lnumber_value(CAR(obj_list));
              if (t < 0 || t >= total_objects) lbreak(`Get cache list returned a bad object number ${t}\n`);
              else this.preload_cache_object(t, fun_of, set_need, total_objects, eval_fun, new_args);
            }
          }
          if (cl && lcdr(cl)) {
            for (let id_list = lcar(lcdr(cl)); id_list; id_list = CDR(id_list)) {
              const id = lnumber_value(CAR(id_list));
              if (id < 0 || id >= this.total) lbreak(`Get cache list returned a bad id number ${id}\n`);
              else if (this.list[id].last_access < 0) this.list[id].last_access = -2;
              else this.list[id].last_access = 2;
            }
          }
        }
      }
    }
  }

  /** marks what a level needs (preload_cache), then loads it (load_cache_prof_info without a profile) */
  load_cache_prof_info(filename: string, hooks: CacheLevelHooks): void {
    for (const ci of this.list) if (ci.last_access >= 0) ci.last_access = 0;
    // preload_cache
    hooks.clear_need();
    for (const type of hooks.object_types())
      this.preload_cache_object(type, hooks.fun_of, hooks.set_need, hooks.total_objects(), hooks.eval_fun, hooks.new_args);
    for (const id of hooks.tile_ids()) {
      if (this.list[id].last_access < 0) this.list[id].last_access = -2;
      else this.list[id].last_access = 2;
    }
    hooks.load_chars();
    // the level files carry no "cache profile info": go solely on the guesses
    let load_fail = 1;
    const fp = open_file(filename, 'rb');
    if (!fp.open_failure()) {
      const sd = new spec_directory(fp);
      if (sd.find('cache profile info')) dprintf('cache profile info found and ignored\n');
    }
    if (load_fail) {
      for (let j = 0; j < this.total; j++) {
        const it = this.list[j];
        if (it.file_number >= 0 && it.last_access === -2) {
          it.last_access = -1;
          if (!this.ful) this.load_item(j);
        }
      }
      if (this.full()) dprintf('Cache filled while loading\n');
      load_fail = 0;
    }
    fp.close();
  }

  private load_item(j: number): void {
    switch (this.list[j].type) {
      case SPEC_BACKTILE: this.backt(j); break;
      case SPEC_FORETILE: this.foret(j); break;
      case SPEC_CHARACTER: case SPEC_CHARACTER2: this.fig(j); break;
      case SPEC_IMAGE: this.img(j); break;
      case SPEC_PARTICLE: this.part(j); break;
      case SPEC_EXTERN_SFX: this.sfx(j); break;
      case SPEC_EXTERNAL_LCACHE: this.lblock(j); break;
      case SPEC_PALETTE: this.ctint(j); break;
    }
  }

  unreg(id: number): void {
    if (this.list[id].file_number >= 0) {
      this.unmalloc(this.list[id]);
      this.list[id].file_number = -1;
    } else dprintf('Error : trying to unregister free object\n');
  }

  empty(): void {
    this.list = [];
    if (this.fp) this.fp.close();
    this.fp = null;
    this.last_dir = null;
    this.prof_data = null;
    this.total = 0;
    this.last_registered = -1;
    this.last_access = 1;
    this.used = this.ful = 0;
    this.last_file = -1;
  }

  private locate(i: CacheItem, local_only = 0): bFILE {
    if (i.file_number !== this.last_file) {
      if (this.fp) this.fp.close();
      const name = crc_manager.get_filename(i.file_number);
      this.fp = local_only ? new jFILE(name, 'rb') : open_file(name, 'rb');
      if (this.fp.open_failure()) fatal(`Ooch. Could not open file ${name}`);
      this.last_offset = -1;
      this.last_dir = new spec_directory(this.fp);
      this.last_file = i.file_number;
    }
    if (i.offset !== this.last_offset) {
      this.fp!.seek(i.offset, SEEK_SET);
      this.last_offset = i.offset;
    }
    this.used = 1;
    return this.fp!;
  }

  private AllocId(): number {
    if (this.prof_data) this.prof_uninit();
    let ret = this.last_registered + 1;
    if (ret >= this.total || this.list[ret].file_number < 0) {
      ret = -1;
      for (let i = 0; i < this.total && ret < 0; i++) if (this.list[i].file_number < 0) ret = i;
      if (ret < 0) {
        for (let i = 0; i < 20; i++) this.list.push(new CacheItem());
        ret = this.total;
        this.prof_data = null;
        this.total += 20;
      }
    }
    this.last_registered = ret;
    return ret;
  }

  reg_object(filename: string | null, object: LObj, type: number, rm_dups: number): number {
    if (item_type(object) === L_CONS_CELL) {
      filename = lstring_value(lcar(object));
      object = lcdr(object);
    }
    return this.reg(filename!, lstring_value(object), type, rm_dups);
  }

  reg(filename: string, name: string | null, type = -1, rm_dups = 0): number {
    const fn = crc_manager.get_filenumber(filename);
    let offset = 0;
    if (type === SPEC_EXTERN_SFX) {
      // the sound file must be a WAV file when sound is on (sound.ts decides what "there" means)
      if (!S.sfx_file_ok(filename) && S.sound_avail) fatal(`Unable to open file '${filename}' for reading`);
    } else {
      const sd = sd_cache.get_spec_directory(filename);
      if (!sd) fatal(`Unable to open file ${filename} for item ${name}`);
      let se = type !== -1 ? sd.find(name!, type) : null;
      if (!se) se = sd.find(name!);
      if (!se) fatal(`No such item ${name} in file ${filename}`);
      if (type >= 0 && type !== se.type &&
          ((type !== SPEC_CHARACTER2 && type !== SPEC_CHARACTER) || (se.type !== SPEC_CHARACTER && se.type !== SPEC_CHARACTER2)))
        fatal(`Item ${name} of file ${filename} should be type ${spec_types[type]}`);
      type = se.type;
      offset = se.offset;
    }
    if (rm_dups) {
      for (let i = 0; i < this.total; i++) if (this.list[i].file_number === fn && this.list[i].offset === offset) return i;
    }
    const id = this.AllocId();
    const it = this.list[id];
    it.file_number = fn;
    it.last_access = -1;
    it.data = null;
    it.offset = offset;
    it.type = type & 0xff;
    return id;
  }

  private get<T>(id: number, make: (fp: bFILE, me: CacheItem) => T): T {
    const me = this.list[id];
    if (me.last_access >= 0) {
      this.touch(me);
      return me.data as T;
    }
    this.touch(me);
    const fp = this.locate(me);
    me.data = make(fp, me);
    this.last_offset = fp.tell();
    return me.data as T;
  }

  backt(id: number): backtile { return this.get(id, (fp) => new backtile(fp)); }
  foret(id: number): foretile { return this.get(id, (fp) => new foretile(fp)); }
  fig(id: number): figure { return this.get(id, (fp, me) => new figure(fp, me.type)); }
  img(id: number): image { return this.get(id, (fp) => image.load(fp)); }
  part(id: number): part_frame { return this.get(id, (fp) => new part_frame(fp)); }
  ctint(id: number): char_tint { return this.get(id, (fp) => new char_tint(fp)); }

  sfx(id: number): sound_effect {
    const me = this.list[id];
    if (me.last_access >= 0) {
      this.touch(me);
      return me.data as sound_effect;
    }
    this.touch(me);
    me.data = new sound_effect(crc_manager.get_filename(me.file_number));
    return me.data as sound_effect;
  }

  lblock(id: number): LObj { return this.list[id].data as LObj; }

  loaded(id: number): number { return this.list[id].last_access >= 0 ? 1 : 0; }

  note_need(id: number): void {
    if (this.list[id].last_access < 0) this.list[id].last_access = -2;
    else this.list[id].last_access = 2;
  }
}

/** what load_cache_prof_info needs from the level and the characters */
export interface CacheLevelHooks {
  clear_need(): void;
  object_types(): number[];
  /** the type's OFUN_GET_CACHE_LIST function */
  fun_of(type: number): LObj;
  /** marks CFLAG_NEED_CACHE_IN; returns false if it was marked already */
  set_need(type: number): boolean;
  total_objects(): number;
  eval_fun(f: LObj, args: LObj): LObj;
  new_args(type: number): LObj;
  tile_ids(): number[];
  load_chars(): void;
}

export const cache = new CacheList();
