// @ts-nocheck
// COW 3.3.3 camera.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { anon_Xlib_h_489, struct_Screen, struct_Visual } from './structs.ts';
import { $cast, $sadd, P, R, S, XScreenNumberOfScreen, fprintf, free, imlib_context_set_color_modifier, imlib_context_set_colormap, imlib_context_set_display, imlib_context_set_drawable, imlib_context_set_image, imlib_context_set_operation, imlib_context_set_visual, imlib_create_image_from_drawable, imlib_free_image_and_decache, imlib_image_attach_data_value, imlib_save_image, snprintf } from '../rt/index.ts';
import { IMLIB_OP_COPY, MAXFRAMEFILENAMESIZE, TWINSIDE } from './consts.ts';

let disp: any;
let vis: struct_Visual | null;
let scr: struct_Screen | null;
let cm: number;
let rw: number;
let tw: number;
let rx: number;
let ry: number;
let rdx: number;
let rdy: number;
let frame: number;
let initialised: number;

export function camera_init(arg_disp: any, arg_window: number): void {
  if (initialised) {
    return;
  }
  disp = arg_disp;
  tw = arg_window;
  scr = $sadd($cast(anon_Xlib_h_489, disp).screens, $cast(anon_Xlib_h_489, disp).default_screen);
  vis = $sadd($cast(anon_Xlib_h_489, disp).screens, XScreenNumberOfScreen(scr)).root_visual;
  cm = $sadd($cast(anon_Xlib_h_489, disp).screens, XScreenNumberOfScreen(scr)).cmap;
  rw = $sadd($cast(anon_Xlib_h_489, disp).screens, XScreenNumberOfScreen(scr)).root;
  imlib_context_set_display(disp);
  imlib_context_set_visual(vis);
  imlib_context_set_colormap(cm);
  imlib_context_set_color_modifier(null);
  imlib_context_set_operation(IMLIB_OP_COPY);
  frame = 0;
  rx = 0;
  ry = 0;
  rdx = TWINSIDE;
  rdy = TWINSIDE;
  imlib_context_set_drawable(tw);
  ++initialised;
}

export function camera_snap(arg_disp: any, arg_window: number): void {
  let image = null;
  let name = null;
  camera_init(arg_disp, arg_window);
  image = imlib_create_image_from_drawable(rw, rx, ry, rdx | 0, rdy | 0, 0);
  imlib_context_set_image(image);
  imlib_image_attach_data_value(S("quality"), null, 15, null);
  name = P(new Int8Array(MAXFRAMEFILENAMESIZE));
  snprintf(name, MAXFRAMEFILENAMESIZE - 1, S("netrek-%03d.png"), frame++);
  imlib_save_image(name);
  imlib_free_image_and_decache();
  fprintf(R.stderr, S("camera_snap: %s\n"), name);
  free(name);
}

export function $init(): void {
  disp = null;
  vis = null;
  scr = null;
  cm = 0;
  rw = 0;
  tw = 0;
  rx = 0;
  ry = 0;
  rdx = 0;
  rdy = 0;
  frame = 0;
  initialised = 0;
}
