// fileutil.c: where the program's files are, ~/.lincityrc, and loading raw graphics.
import { G, PATHS } from './g.ts';
import { sscanf } from './c.ts';
import { fopen, fileExists, directoryExists, mkdir, LIBDIR, HOME } from './stdio.ts';
import { do_error } from './main.ts';

export function init_path_strings(): void {
  PATHS.LIBDIR = LIBDIR;
  const homedir = HOME;
  G.lc_save_dir_len = homedir.length + '.lincity'.length + 1;
  PATHS.lc_save_dir = `${homedir}/.lincity`;
  PATHS.colour_pal_file = `${LIBDIR}/colour.pal`;
  PATHS.opening_path = `${LIBDIR}/opening`;
  PATHS.opening_pic = `${PATHS.opening_path}/open.tga.gz`;
  PATHS.graphic_path = `${LIBDIR}/icons/`;
  PATHS.lincityrc_file = `${homedir}/.lincityrc`;
  // find_localized_paths(): the English messages and help (LANG is C)
  PATHS.message_path = `${LIBDIR}/messages/`;
  PATHS.help_path = `${LIBDIR}/help/`;
  PATHS.fontfile = `${PATHS.opening_path}/iso8859-1-8x8.raw`;
  PATHS.lc_temp_filename = `${PATHS.lc_save_dir}/tmp-file`;
}

export function verify_package(): void {
  if (!fileExists(PATHS.colour_pal_file)) do_error('Error verifying package. Can\'t find colour.pal.');
}

export function check_savedir(): void {
  if (!directoryExists(PATHS.lc_save_dir)) mkdir(PATHS.lc_save_dir);
}

export function load_graphic(s: string): Uint8Array {
  const inf = fopen(PATHS.graphic_path + s, 'rb');
  if (!inf) {
    do_error(`${PATHS.graphic_path}${s} -- UNABLE TO LOAD`);
    return new Uint8Array(0);
  }
  return inf.data.slice();
}

export function load_lincityrc(): void {
  const fp = fopen(PATHS.lincityrc_file, 'r');
  if (!fp) {
    save_lincityrc();
    return;
  }
  for (;;) {
    const buf = fp.fgets(128);
    if (buf === null) break;
    const keys: [string, (v: number) => void][] = [
      ['overwrite_transport=%d', (v) => { G.overwrite_transport_flag = v ? 1 : 0; }],
      ['no_init_help=%d', (v) => { G.no_init_help = v ? 1 : 0; }],
      ['skip_splash_screen=%d', (v) => { G.skip_splash_screen = v ? 1 : 0; }],
      ['suppress_firsttime_module_help=%d', (v) => { G.suppress_firsttime_module_help = v ? 1 : 0; }],
      ['suppress_popups=%d', (v) => { G.suppress_popups = v ? 1 : 0; }],
      ['time_multiplex_stats=%d', (v) => { G.time_multiplex_stats = v ? 1 : 0; }],
      ['x_confine_pointer=%d', (v) => { G.confine_flag = v ? 1 : 0; }],
    ];
    for (const [fmt, set] of keys) {
      const r = sscanf(buf, fmt);
      if (r.length === 1) {
        set(r[0] as number);
        break;
      }
    }
  }
}

export function save_lincityrc(): void {
  const fp = fopen(PATHS.lincityrc_file, 'w');
  if (!fp) return;
  fp.fprintf('# Set this if you want to be able to overwrite one\n# kind of transport with another.\noverwrite_transport=%d\n\n', G.overwrite_transport_flag);
  fp.fprintf("# Set this if you don't want the opening help screen.\nno_init_help=%d\n\n", G.no_init_help);
  fp.fprintf("# Set this if you don't want the opening splash screen.\nskip_splash_screen=%d\n\n", G.skip_splash_screen);
  fp.fprintf("# Set this if you don't want help the first time you\n# click to place an item.\nsuppress_firsttime_module_help=%d\n\n", G.suppress_firsttime_module_help);
  fp.fprintf("# Set this if don't want modal dialog boxes which you\n# are required to click OK.  Instead, report the dialog\n# box information to the message area.\nsuppress_popups=%d\n\n", G.suppress_popups);
  fp.fprintf('# Set this if want the different statistic windows to cycle\n# through the right panel.\ntime_multiplex_stats=%d\n\n', G.time_multiplex_stats);
  fp.fprintf('# (X Windows only) Set this if you want to confine the pointer\n# to within the window.\nx_confine_pointer=%d\n\n', G.confine_flag);
  fp.fclose();
}

/** convert \r\n (and lone \r) to \n */
export function undosify_string(s: string): string {
  let out = '';
  let prev = '';
  for (const c of s) {
    if (c !== '\r') {
      if (prev === '\r' && c !== '\n') out += '\n';
      out += c;
    }
    prev = c;
  }
  if (prev === '\r') out += '\n';
  return out;
}
