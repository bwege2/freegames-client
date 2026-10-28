// loader2.cpp: loading the game's data at start (abuse.lsp and what it names), the tiles, the
// images the engine itself uses
import { G } from './globals.ts';
import { L } from './lglobals.ts';
import { cache, sd_cache } from './cache.ts';
import { SPEC_BACKTILE, SPEC_FORETILE, SPEC_IMAGE, open_file, spec_directory } from './imlib/specs.ts';
import { CAR, CDR, DEFINEDP, NILP, find_or_create, lcar, lcdr, lstring_value, symbol_value, eval_string,
  clear_tmp, true_symbol, type LObj, type LSymbol } from './lisp/lisp.ts';
import { dprintf, AbuseError, stdout_printf } from './imlib/dprint.ts';
import { image } from './imlib/image.ts';
import { JCFont } from './imlib/fonts.ts';
import { fnt6x13 } from './fontdata.ts';
import { chars_reset, figures, object_names } from './chars.ts';
import { compiled_init } from './compiled.ts';
import { HELP } from './help.ts';
import { sbar, CUR } from './statbar.ts';
import { load_number_icons } from './loadgame.ts';
import { net_start } from './net.ts';

/** the engine's own images (cache ids) and other globals of loader2.cpp */
export const LD = {
  border_tile: 0, window_texture: 0, raise_volume: 0, lower_volume: 0, record_button: 0, play_button: 0,
  music_button: 0, sfx_button: 0, window_colors: 0, pause_image: 0, damage_pict: 0, block_pict: 0, vmm_image: 0,
  earth: 0, earth_mask: 0, clouds: 0, numbers: [] as number[], ok_button: 0, cancel_button: 0,
  light_buttons: [] as number[],
  light_connection_color: 0,
  lsf: 'abuse.lsp',
  past_startup: 0,
};

function scan_num(name: string): number | null {
  const m = /^\s*[+-]?\d+/.exec(name);
  return m ? parseInt(m[0], 10) : null;
}

export function insert_tiles(filename: string): void {
  const fp = open_file(filename, 'rb');
  if (!fp.open_failure()) {
    let ft = 0, bt = 0;
    const sd = new spec_directory(fp);
    fp.close();
    for (const se of sd.entries) {
      if (se.type === SPEC_FORETILE) ft++;
      else if (se.type === SPEC_BACKTILE) bt++;
    }
    if (bt) stdout_printf(`${filename} : adding ${bt} background tiles (range ${G.nbacktiles}-${G.nbacktiles + bt - 1})\n`);
    if (ft) stdout_printf(`${filename} : adding ${ft} foreground tiles (range ${G.nforetiles}-${G.nforetiles + bt - 1})\n`);
    if (!ft && !bt) stdout_printf(`Warning : file ${filename} has no background or foreground tiles\n`);
    else {
      let fon = G.nforetiles, bon = G.nbacktiles;
      for (const se of sd.entries) {
        if (se.type === SPEC_FORETILE) {
          G.foretiles[fon++] = cache.reg(filename, se.name);
          G.nforetiles++;
        }
        if (se.type === SPEC_BACKTILE) {
          G.backtiles[bon++] = cache.reg(filename, se.name);
          G.nbacktiles++;
        }
      }
    }
  } else stdout_printf(`Warning : insert_tiles -> file ${filename} could not be read from\n`);
}

export function load_tiles(file_list: LObj): void {
  const old_fsize = G.nforetiles, old_bsize = G.nbacktiles;
  for (let fl = file_list; !NILP(fl); fl = lcdr(fl)) {
    const fp = open_file(lstring_value(lcar(fl)), 'rb');
    if (fp.open_failure()) {
      stdout_printf(`Warning : open ${lstring_value(lcar(fl))} for reading\n`);
      fp.close();
    } else {
      const sd = new spec_directory(fp);
      fp.close();
      for (const spe of sd.entries) {
        if (spe.type === SPEC_BACKTILE) {
          const num = scan_num(spe.name);
          if (num === null) stdout_printf(`Warning : background tile ${spe.name} has no number\n`);
          else if (G.nbacktiles <= num) G.nbacktiles = num + 1;
        } else if (spe.type === SPEC_FORETILE) {
          const num = scan_num(spe.name);
          if (num === null) stdout_printf(`Warning : foreground tile ${spe.name} has no number\n`);
          else if (G.nforetiles <= num) G.nforetiles = num + 1;
        }
      }
    }
  }
  for (let i = old_bsize; i < G.nbacktiles; i++) G.backtiles[i] = -1;
  for (let i = old_fsize; i < G.nforetiles; i++) G.foretiles[i] = -1;

  for (let fl = file_list; !NILP(fl); fl = lcdr(fl)) {
    const fn = lstring_value(lcar(fl));
    const fp = open_file(fn, 'rb');
    if (!fp.open_failure()) {
      const sd = new spec_directory(fp);
      fp.close();
      for (const spe of sd.entries) {
        if (spe.type === SPEC_BACKTILE) {
          const num = scan_num(spe.name);
          if (num !== null) {
            if (G.backtiles[num] >= 0) {
              dprintf(`Warning : background tile ${num} redefined\n`);
              cache.unreg(G.backtiles[num]);
            }
            G.backtiles[num] = cache.reg(fn, spe.name, SPEC_BACKTILE);
          }
        } else if (spe.type === SPEC_FORETILE) {
          const num = scan_num(spe.name);
          if (num !== null) {
            if (G.foretiles[num] >= 0) {
              dprintf(`Warning : foreground tile ${num} redefined\n`);
              cache.unreg(G.foretiles[num]);
            }
            G.foretiles[num] = cache.reg(fn, spe.name, SPEC_FORETILE);
          }
        }
      }
    } else fp.close();
  }
}

function ERROR(x: unknown, msg: string): void {
  if (!x) throw new AbuseError(msg);
}

export function load_data(argv: string[]): void {
  chars_reset();
  G.nforetiles = G.nbacktiles = 0;
  G.foretiles = [];
  G.backtiles = [];
  G.pal = null as never;
  G.color_table = null as never;

  if (!net_start()) {
    for (let i = 1; i < argv.length; i++) {
      if (argv[i] === '-lsf') LD.lsf = argv[++i];
      if (argv[i] === '-a') {
        i++;
        LD.lsf = `addon/${argv[i]}/${argv[i]}.lsp`;
      }
    }
  }

  CUR.c_mouse1 = cache.reg('art/dev.spe', 'c_mouse1', SPEC_IMAGE, 0);
  CUR.c_mouse2 = cache.reg('art/dev.spe', 'c_mouse2', SPEC_IMAGE, 0);
  CUR.c_normal = cache.reg('art/dev.spe', 'c_normal', SPEC_IMAGE, 0);
  CUR.c_target = cache.reg('art/dev.spe', 'c_target', SPEC_IMAGE, 0);

  if (!eval_string(`(load "${LD.lsf}")\n`)) {
    stdout_printf(`unable to open file '${LD.lsf}'\n`);
    throw new AbuseError(`unable to open file '${LD.lsf}'`);
  }
  compiled_init();
  clear_tmp();

  dprintf('Engine : Registering base graphics\n');
  for (let z = 0; z <= 11; z++) LD.light_buttons[z] = cache.reg('art/dev.spe', `l${z}`, SPEC_IMAGE, 0);

  const tmp_image = new image(192, 104, fnt6x13);
  G.big_font = new JCFont(tmp_image);

  const ffs = find_or_create('frame_file').value;
  const ff = DEFINEDP(ffs) ? lstring_value(ffs) : 'art/frame.spe';

  LD.ok_button = cache.reg(ff, 'dev_ok', SPEC_IMAGE);
  LD.cancel_button = cache.reg(ff, 'cancel', SPEC_IMAGE);
  LD.lower_volume = cache.reg(ff, 'lower_volume', SPEC_IMAGE);
  LD.raise_volume = cache.reg(ff, 'raise_volume', SPEC_IMAGE);
  LD.music_button = cache.reg(ff, 'music', SPEC_IMAGE);
  LD.sfx_button = cache.reg(ff, 'sound_fx', SPEC_IMAGE);
  LD.record_button = cache.reg(ff, 'record', SPEC_IMAGE);
  LD.play_button = cache.reg(ff, 'play', SPEC_IMAGE);
  LD.window_colors = cache.reg(ff, 'window_colors', SPEC_IMAGE);
  LD.pause_image = cache.reg(ff, 'pause_image', SPEC_IMAGE);
  LD.vmm_image = cache.reg(ff, 'vmm', SPEC_IMAGE);
  LD.border_tile = cache.reg(ff, 'border_tile', SPEC_IMAGE);
  LD.window_texture = cache.reg(ff, 'window_texture', SPEC_IMAGE);

  HELP.help_screens = null;
  HELP.total_help_screens = 0;
  if (DEFINEDP(symbol_value(L.l_help_screens))) {
    let v = symbol_value(L.l_help_screens);
    const hf = lstring_value(CAR(v));
    v = CDR(v);
    HELP.total_help_screens = 0;
    while (v) {
      HELP.total_help_screens++;
      v = CDR(v);
    }
    if (HELP.total_help_screens) {
      HELP.help_screens = [];
      for (v = CDR(symbol_value(L.l_help_screens)); v; v = CDR(v)) HELP.help_screens.push(cache.reg(hf, lstring_value(CAR(v)), SPEC_IMAGE));
    } else dprintf('Warning no help images following filename\n');
  }

  for (let i = 1; i < argv.length; i++) {
    if (argv[i] === '-ec') (L.l_empty_cache as LSymbol).value = true_symbol;
    if (argv[i] === '-t') insert_tiles(argv[++i]);
  }

  if (DEFINEDP(symbol_value(L.l_title_screen))) G.title_screen = cache.reg_object(null, symbol_value(L.l_title_screen), SPEC_IMAGE, 1);
  else G.title_screen = -1;
  if (DEFINEDP(symbol_value(L.l_cdc_logo))) G.cdc_logo = cache.reg_object(null, symbol_value(L.l_cdc_logo), SPEC_IMAGE, 1);
  else G.cdc_logo = -1;

  L.start_position_type = 0xffff;
  for (let i = 0; i < figures.length; i++) if (object_names[i] === 'START') L.start_position_type = i;
  if (L.start_position_type === 0xffff) {
    stdout_printf('No object named START, cannot start game.\n');
    throw new AbuseError('No object named START, cannot start game.');
  }

  sbar.load();
  load_number_icons();

  ERROR(G.nbacktiles, 'No background tiles defined!');
  ERROR(G.nforetiles, 'No foreground tiles defined!');
  ERROR(G.foretiles[0] >= 0, 'No black (0) foreground tile defined!');
  ERROR(G.backtiles[0] >= 0, 'No black (0) background tile defined!');
  ERROR(G.big_font_pict !== -1 || G.small_font_pict !== -1, 'No font loaded (use load_big_font or load_small_font)!');
  G.f_wid = cache.foret(G.foretiles[0]).im.Size().x;
  G.f_hi = cache.foret(G.foretiles[0]).im.Size().y;
  G.b_wid = cache.backt(G.backtiles[0]).im.Size().x;
  G.b_hi = cache.backt(G.backtiles[0]).im.Size().y;

  sd_cache.clear();
  LD.past_startup = 1;
}
