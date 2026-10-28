// @ts-nocheck
// COW 3.3.3 x11window.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { camera_snap } from './camera.ts';
import { terminate } from './cowmain.ts';
import { booleanDefault, getdefault, intDefault, strcmpi } from './defaults.ts';
import { smessage } from './smessage.ts';
import { GetPixmaps } from './x11sprite.ts';
import { anon_Xlib_h_489, struct_XButtonEvent, struct_XClassHint, struct_XColor, struct_XConfigureEvent, struct_XErrorEvent, struct_XExposeEvent, struct_XF86VidModeModeLine, struct_XFontStruct, struct_XGCValues, struct_XKeyEvent, struct_XMotionEvent, struct_XPoint, struct_XRectangle, struct_XSegment, struct_XSetWindowAttributes, struct_XWMHints, struct_XWindowAttributes, struct_colors, struct_event, struct_fd_set, struct_fontInfo, struct_icon, struct_menuItem, struct_scrollingWindow, struct_stringList, struct_timeval, struct_window, struct_windowlist, union__XEvent } from './structs.ts';
import { $arr, $bytes, $cast, $pcast, $peq, $rd, $sadd, $sarr, $sarrOf, $sat, $shl64, $shr64, $ta, $u64, $view8, $wr, G, P, R, S, XAllocColor, XAllocColorCells, XAllocSizeHints, XBell, XChangeProperty, XClearArea, XClearWindow, XCloseDisplay, XCopyArea, XCopyPlane, XCreateBitmapFromData, XCreateColormap, XCreateFontCursor, XCreateGC, XCreatePixmap, XCreatePixmapCursor, XCreatePixmapFromBitmapData, XCreateWindow, XDefineCursor, XDeleteProperty, XDestroyWindow, XDrawArc, XDrawImageString, XDrawLine, XDrawLines, XDrawSegments, XDrawString, XEventsQueued, XF86VidModeGetAllModeLines, XF86VidModeGetModeLine, XF86VidModeQueryVersion, XF86VidModeSetViewPort, XF86VidModeSwitchToMode, XFetchBuffer, XFillRectangle, XFillRectangles, XFlush, XFree, XFreeCursor, XFreeFont, XFreeGC, XFreePixmap, XGetWindowAttributes, XGrabKeyboard, XGrabPointer, XInternAtom, XLoadQueryFont, XLookupString, XMapRaised, XMoveWindow, XNextEvent, XOpenDisplay, XParseColor, XParseGeometry, XPeekEvent, XPending, XQueryColor, XQueryPointer, XRaiseWindow, XReadBitmapFile, XRecolorCursor, XResizeWindow, XSendEvent, XSetBackground, XSetClassHint, XSetCommand, XSetDashes, XSetForeground, XSetFunction, XSetGraphicsExposures, XSetIconName, XSetLineAttributes, XSetWMHints, XSetWMNormalHints, XSetWMProtocols, XSetWindowBackground, XSetWindowBackgroundPixmap, XSetWindowBorder, XSetWindowBorderPixmap, XSetWindowColormap, XStoreColor, XStoreName, XTextWidth, XTranslateCoordinates, XUngrabKeyboard, XUngrabPointer, XUnmapWindow, XWarpPointer, abort, exit, fcntl, fprintf, free, gettimeofday, memccpy, memset, printf, select, snprintf, sprintf, strcat, strcmp, strcpy, strdup, strerror, strlen } from '../rt/index.ts';
import { AllocNone, BITGC, BLACK, BitmapSuccess, Button1Mask, Button1MotionMask, Button2Mask, Button2MotionMask, Button3Mask, Button3MotionMask, Button4MotionMask, Button5MotionMask, ButtonMotionMask, ButtonPress, ButtonPressMask, ButtonReleaseMask, COLORS, CWBackPixel, CWBorderPixel, CWEventMask, CYAN, C_FED, C_IND, C_KLI, C_ORI, C_ROM, CapButt, ClientMessage, ControlMask, CoordModeOrigin, CopyFromParent, CurrentTime, DoBlue, DoGreen, DoRed, EnterWindowMask, ExposureMask, FD_CLOEXEC, FONTS, FULLSCREEN_FAILED, FULLSCREEN_OK, F_SETFD, False, FillTiled, GCFillStyle, GCFont, GCForeground, GCFunction, GCTile, GREEN, GREY, GXand, GXor, G_SET_X, G_SET_Y, GrabModeAsync, HASHSIZE, IconWindowHint, InputHint, InputOutput, JoinMiter, KeyPress, KeyPressMask, KeymapStateMask, LeaveWindowMask, LineOnOffDash, LockMask, MAXCACHE, MAX_TEXT_WIDTH, MENU_BAR, MENU_PAD, NoEventMask, None, NormalState, PBaseSize, PLANES, PMaxSize, PMinSize, PPosition, PResizeInc, ParentRelative, PointerMotionHintMask, PointerMotionMask, PropModeReplace, PseudoColor, QueuedAlready, RED, RaceDefaultOffset, ResizeRedirectMask, SCROLL_THUMB_WIDTH, ShiftMask, StateHint, StructureNotifyMask, TILESIDE, True, TrueColor, USPosition, WHITE, WIN_EDGE, WIN_GRAPH, WIN_MENU, WIN_SCROLL, WIN_TEXT, W_CTRL_BUTTON, W_EV_BUTTON, W_EV_CLOSED, W_EV_CM_BUTTON, W_EV_EXPOSE, W_EV_KEY, W_EV_MKEY, W_Key_Down, W_Key_Up, W_LBUTTON, W_MBUTTON, W_RBUTTON, W_SHIFT_BUTTON, W_WDBUTTON, W_WUBUTTON, WindowGroupHint, XA_ATOM, XC_left_ptr, XC_pirate, XC_trek, XC_xterm, XValue, YELLOW, YValue, fed_mask_height, fed_mask_width, localcursor_height, localcursor_width, localmask_height, localmask_width, mapcursor_height, mapcursor_width, mapmask_height, mapmask_width, mplanet_height, mplanet_width } from './consts.ts';
const fed_cruiser_height = 18;
const fed_cruiser_width = 17;
const kli_cruiser_height = 18;
const kli_cruiser_width = 17;
const ori_cruiser_height = 18;
const ori_cruiser_width = 17;
const rom_cruiser_height = 13;
const rom_cruiser_width = 17;

let fed_cruiser_bits: any;
let fed_mask_bits: any;
let rom_cruiser_bits: any;
let rom_mask_bits: any;
let ori_cruiser_bits: any;
let kli_cruiser_bits: any;
let mapcursor_bits: any;
let mapmask_bits: any;
let localcursor_bits: any;
let localmask_bits: any;
let _nfonts: any;
let _bfonts: any;
let _ifonts: any;
let _bgfonts: any;
let zero: any;
let one: any;
let two: any;
let three: any;
let planes: any;
let scrollbar: number;
let scroll_thumb_width: number;
let scroll_thumb_gc: any;
let scroll_thumb_pixmap: number;
let scroll_lines: number;
let class_hint: struct_XClassHint;
let wm_hint: struct_XWMHints;
let W_myevent: struct_event;
let W_isEvent: number;
let gray: any;
let striped: any;
let solid: any;
let extrared: any;
let extragreen: any;
let extrablue: any;
let _rcache: any;
let _rcache_index: number;
let _lcache: any;
let _lcache_index: any;
let _tts_gc: any;
let _tts_fontinfo: struct_XFontStruct | null;
let _tts_th: number;
let _tts_tw: number;
let WMXYHintMode_default$fetched: number;
let WMXYHintMode_default$WMXYHM_default: number;
let W_SpNextEvent$prev_x: number;
let W_SpNextEvent$prev_y: number;
let W_DefineMapcursor$f: struct_XColor;
let W_DefineMapcursor$b: struct_XColor;
let W_DefineLocalcursor$f: struct_XColor;
let W_DefineLocalcursor$b: struct_XColor;
let W_DefineFedCursor$f: struct_XColor;
let W_DefineFedCursor$b: struct_XColor;
let W_DefineRomCursor$f: struct_XColor;
let W_DefineRomCursor$b: struct_XColor;
let W_DefineKliCursor$f: struct_XColor;
let W_DefineKliCursor$b: struct_XColor;
let W_DefineOriCursor$f: struct_XColor;
let W_DefineOriCursor$b: struct_XColor;
let W_DefineCursor$oldbits: Ptr | null;
let W_DefineCursor$curs: number;
let W_WarpPointer$warped_from_x: any;
let W_WarpPointer$warped_from_y: any;
let video_mode_initialise$done: number;

export function _myerror(d: any, e: struct_XErrorEvent | null): number {
  fprintf(R.stderr, S("netrek: x11window: _myerror\n"));
  abort();
}

export function pastebuffer(): void {
  const nbytes = new Int32Array(1);
  let x = 0;
  let buff = null;
  let c = 0;
  buff = XFetchBuffer(G.W_Display, P(nbytes, 0), 0);
  for (x = 0; x < nbytes[0]; ++x) {
    c = buff.a[buff.o + x];
    smessage(c);
  }
}

function WMXYHintMode_default(): number {
  let hm_default_string = null;
  if (!WMXYHintMode_default$fetched) {
    hm_default_string = getdefault(S("WMXYHintMode"));
    if (!hm_default_string || strcmp(hm_default_string, S("USPosition")) === 0) {
      WMXYHintMode_default$WMXYHM_default = USPosition;
    } else {
      WMXYHintMode_default$WMXYHM_default = PPosition;
    }
    WMXYHintMode_default$fetched = 1;
  }
  return WMXYHintMode_default$WMXYHM_default;
}

export function W_Initialize(str: Ptr | null): void {
  let i = 0;
  for (i = 0; i < HASHSIZE; ++i) {
    G.hashtable[i] = null;
  }
  if (!(G.W_Display = XOpenDisplay(str))) {
    fprintf(R.stderr, S("I can't open your display, twink!\n"));
    terminate(1);
  }
  if (fcntl($cast(anon_Xlib_h_489, G.W_Display).fd, F_SETFD, FD_CLOEXEC) < 0) {
    fprintf(R.stderr, S("failed to set the X socket to close on exec(),\nfcntl F_SETFD FD_CLOEXEC failure,\n'%s'"), strerror($rd(P(R, "errno"))));
  }
  G.wm_protocols = XInternAtom(G.W_Display, S("WM_PROTOCOLS"), False);
  G.wm_delete_window = XInternAtom(G.W_Display, S("WM_DELETE_WINDOW"), False);
  G.W_Root = $sadd($cast(anon_Xlib_h_489, G.W_Display).screens, $cast(anon_Xlib_h_489, G.W_Display).default_screen).root;
  G.W_Visual = $sadd($cast(anon_Xlib_h_489, G.W_Display).screens, $cast(anon_Xlib_h_489, G.W_Display).default_screen).root_visual;
  G.W_Screen = $cast(anon_Xlib_h_489, G.W_Display).default_screen;
  G.W_Colormap = $sadd($cast(anon_Xlib_h_489, G.W_Display).screens, G.W_Screen).cmap;
  G.myroot.window = G.W_Root;
  G.myroot.type = WIN_GRAPH;
  GetFonts();
  GetColors();
  scrollbar = booleanDefault(S("ScrollBar"), scrollbar);
  scroll_lines = intDefault(S("ScrollSaveLines"), scroll_lines);
  scroll_thumb_width = intDefault(S("ScrollBarWidth"), scroll_thumb_width);
  init_tts();
}

export function W_GetPixmaps(t: Ptr | null, g: Ptr | null): void {
  GetPixmaps(G.W_Display, G.myroot, t, g);
}

export function checkFont(fontinfo: struct_XFontStruct | null, fontname: Ptr | null): void {
  if (G.small_screen) {
    return;
  }
  if (fontinfo.max_bounds.width !== 6 || fontinfo.min_bounds.width !== 6 || fontinfo.descent + fontinfo.ascent !== 10 || fontinfo.min_bounds.lbearing < 0 || fontinfo.max_bounds.rbearing > 6 || fontinfo.max_bounds.ascent > 8 || fontinfo.max_bounds.descent > 2) {
    fprintf(R.stderr, S("Warning: font '%s'\ndoes not conform to 6x10 character cell rules.\n"), fontname);
  }
}

export function GetFonts(): void {
  let regular = 0;
  let italic = 0;
  let bold = 0;
  let big = 0;
  let i = 0;
  let values = new struct_XGCValues();
  let fontinfo = null;
  let fontname = null;
  let black = 0;
  let white = 0;
  fontname = getdefault(S("font"));
  if (!fontname) {
    fontname = G.small_screen ? S("5x7") : S("6x10");
  }
  fontinfo = XLoadQueryFont(G.W_Display, fontname);
  if (!fontinfo) {
    fontinfo = find_font(fontname, P(_nfonts));
  }
  if (!fontinfo) {
    printf(S("netrek: Can't find any fonts!\n"));
    terminate(1);
  }
  checkFont(fontinfo, fontname);
  regular = fontinfo.fid;
  G.W_Textwidth = fontinfo.max_bounds.width;
  G.W_Textheight = fontinfo.max_bounds.descent + fontinfo.max_bounds.ascent;
  G.fonts[1].xfs = fontinfo;
  G.fonts[1].baseline = fontinfo.max_bounds.ascent;
  fontname = getdefault(S("boldfont"));
  if (!fontname) {
    fontname = G.small_screen ? S("5x7") : S("-*-clean-bold-r-normal--10-100-75-75-c-60-*");
  }
  fontinfo = XLoadQueryFont(G.W_Display, fontname);
  if (!fontinfo) {
    fontinfo = find_font(fontname, P(_bfonts));
  }
  if (!fontinfo) {
    bold = regular;
    G.fonts[2].xfs = null;
    G.fonts[2].baseline = G.fonts[1].baseline;
  } else {
    checkFont(fontinfo, fontname);
    bold = fontinfo.fid;
    G.fonts[2].xfs = fontinfo;
    G.fonts[2].baseline = fontinfo.max_bounds.ascent;
    if (fontinfo.max_bounds.width > G.W_Textwidth) {
      G.W_Textwidth = fontinfo.max_bounds.width;
    }
    if (fontinfo.max_bounds.descent + fontinfo.max_bounds.ascent > G.W_Textheight) {
      G.W_Textheight = fontinfo.max_bounds.descent + fontinfo.max_bounds.ascent;
    }
  }
  fontname = getdefault(S("italicfont"));
  if (!fontname) {
    fontname = G.small_screen ? S("5x7") : S("-*-clean-bold-r-normal--10-100-75-75-c-60-*");
  }
  fontinfo = XLoadQueryFont(G.W_Display, fontname);
  if (!fontinfo) {
    fontinfo = find_font(fontname, P(_ifonts));
  }
  if (!fontinfo) {
    italic = regular;
    G.fonts[3].xfs = null;
    G.fonts[3].baseline = G.fonts[1].baseline;
  } else {
    checkFont(fontinfo, fontname);
    italic = fontinfo.fid;
    G.fonts[3].xfs = fontinfo;
    G.fonts[3].baseline = fontinfo.max_bounds.ascent;
    if (fontinfo.max_bounds.width > G.W_Textwidth) {
      G.W_Textwidth = fontinfo.max_bounds.width;
    }
    if (fontinfo.max_bounds.descent + fontinfo.max_bounds.ascent > G.W_Textheight) {
      G.W_Textheight = fontinfo.max_bounds.descent + fontinfo.max_bounds.ascent;
    }
  }
  fontname = getdefault(S("bigfont"));
  if (!fontname) {
    fontname = G.small_screen ? S("5x7") : S("-*-lucidatypewriter-*-*-*-*-40-*-*-*-*-*-*-*");
  }
  fontinfo = XLoadQueryFont(G.W_Display, fontname);
  if (!fontinfo) {
    fontinfo = find_font(fontname, P(_bgfonts));
  }
  if (!fontinfo) {
    big = regular;
    G.fonts[0].xfs = null;
    G.fonts[0].baseline = G.fonts[1].baseline;
    G.W_BigTextwidth = G.W_Textwidth;
    G.W_BigTextheight = G.W_Textheight;
  } else {
    big = fontinfo.fid;
    G.fonts[0].xfs = fontinfo;
    G.fonts[0].baseline = fontinfo.max_bounds.ascent;
    G.W_BigTextwidth = fontinfo.max_bounds.width;
    G.W_BigTextheight = fontinfo.max_bounds.descent + fontinfo.max_bounds.ascent;
  }
  white = $sadd($cast(anon_Xlib_h_489, G.W_Display).screens, G.W_Screen).white_pixel | 0;
  black = $sadd($cast(anon_Xlib_h_489, G.W_Display).screens, G.W_Screen).black_pixel | 0;
  G.insens_tile = XCreatePixmapFromBitmapData(G.W_Display, G.W_Root, P(gray), TILESIDE, TILESIDE, $u64(black), $u64(white), $sadd($cast(anon_Xlib_h_489, G.W_Display).screens, G.W_Screen).root_depth >>> 0);
  for (i = 0; $u64(i) < Math.trunc(1248 / 104); ++i) {
    values.font = big;
    G.colortable[i].contexts[0] = XCreateGC(G.W_Display, G.W_Root, GCFont, values);
    XSetGraphicsExposures(G.W_Display, G.colortable[i].contexts[0], False);
    values.font = regular;
    G.colortable[i].contexts[1] = XCreateGC(G.W_Display, G.W_Root, GCFont, values);
    XSetGraphicsExposures(G.W_Display, G.colortable[i].contexts[1], False);
    values.fill_style = FillTiled;
    values.tile = G.insens_tile;
    G.colortable[i].insens_contexts[1] = XCreateGC(G.W_Display, G.W_Root, GCFont | GCFillStyle | GCTile, values);
    XSetGraphicsExposures(G.W_Display, G.colortable[i].insens_contexts[1], False);
    values.font = bold;
    G.colortable[i].contexts[2] = XCreateGC(G.W_Display, G.W_Root, GCFont, values);
    XSetGraphicsExposures(G.W_Display, G.colortable[i].contexts[2], False);
    values.font = italic;
    G.colortable[i].contexts[3] = XCreateGC(G.W_Display, G.W_Root, GCFont, values);
    XSetGraphicsExposures(G.W_Display, G.colortable[i].contexts[3], False);
    {
      let dl = $ta(Int8Array, 2, [1, 8]);
      XSetLineAttributes(G.W_Display, G.colortable[i].contexts[3], 0, LineOnOffDash, CapButt, JoinMiter);
      XSetDashes(G.W_Display, G.colortable[i].contexts[3], 0, P(dl), 2);
    }
    values.function = GXor;
    G.colortable[i].contexts[BITGC] = XCreateGC(G.W_Display, G.W_Root, GCFunction, values);
    XSetGraphicsExposures(G.W_Display, G.colortable[i].contexts[BITGC], False);
  }
}

export function find_font(oldf: Ptr | null, fonts: Ptr | null): struct_XFontStruct | null {
  let fi = null;
  let f = null;
  fprintf(R.stderr, S("netrek: Can't find font %s.  Trying others...\n"), oldf);
  for (f = fonts; f.a[f.o]; f = f.add(1)) {
    if (strcmp(f.a[f.o], oldf) !== 0) {
      if (fi = XLoadQueryFont(G.W_Display, f.a[f.o])) {
        return fi;
      }
    }
  }
  return null;
}

export function GetColors(): void {
  let i = 0;
  let j = 0;
  let values = new struct_XGCValues();
  let foo = new struct_XColor();
  let white = 0;
  let black = 0;
  const pixel = new Float64Array(1);
  let defaultstring = new Int8Array(100);
  let defaults = null;
  let extracolors = new Float64Array(16);
  let colordef = new struct_XColor();
  G.forceMono = booleanDefault(S("forcemono"), G.forceMono);
  if ($sadd($cast(anon_Xlib_h_489, G.W_Display).screens, G.W_Screen).root_visual.map_entries <= 2 || G.forceMono) {
    white = $sadd($cast(anon_Xlib_h_489, G.W_Display).screens, G.W_Screen).white_pixel | 0;
    black = $sadd($cast(anon_Xlib_h_489, G.W_Display).screens, G.W_Screen).black_pixel | 0;
    for (i = 0; $u64(i) < Math.trunc(1248 / 104); ++i) {
      if (i !== G.W_Black) {
        G.colortable[i].pixelValue = white;
      } else {
        G.colortable[i].pixelValue = black;
      }
      if (i === G.W_Red) {
        G.colortable[i].pixmap = XCreatePixmapFromBitmapData(G.W_Display, G.W_Root, P(striped), TILESIDE, TILESIDE, $u64(white), $u64(black), $sadd($cast(anon_Xlib_h_489, G.W_Display).screens, G.W_Screen).root_depth >>> 0);
      } else if (i === G.W_Yellow) {
        G.colortable[i].pixmap = XCreatePixmapFromBitmapData(G.W_Display, G.W_Root, P(gray), TILESIDE, TILESIDE, $u64(white), $u64(black), $sadd($cast(anon_Xlib_h_489, G.W_Display).screens, G.W_Screen).root_depth >>> 0);
      } else {
        G.colortable[i].pixmap = XCreatePixmapFromBitmapData(G.W_Display, G.W_Root, P(solid), TILESIDE, TILESIDE, $u64(G.colortable[i].pixelValue), $u64(G.colortable[i].pixelValue), $sadd($cast(anon_Xlib_h_489, G.W_Display).screens, G.W_Screen).root_depth >>> 0);
      }
      if (white === 0) {
        XSetFunction(G.W_Display, G.colortable[i].contexts[BITGC], GXand);
      }
    }
  } else if (G.W_Visual.class === PseudoColor) {
    if (!XAllocColorCells(G.W_Display, G.W_Colormap, False, P(planes), PLANES, P(pixel, 0), 1) && !G.takeNearest) {
      G.W_Colormap = XCreateColormap(G.W_Display, G.W_Root, G.W_Visual, AllocNone);
      if (!XAllocColorCells(G.W_Display, G.W_Colormap, False, P(planes), PLANES, P(pixel, 0), 1)) {
        fprintf(R.stderr, S("Cannot create new colormap\n"));
        terminate(1);
      }
      if (XAllocColorCells(G.W_Display, G.W_Colormap, False, null, 0, P(extracolors), COLORS)) {
        colordef.flags = DoRed | DoGreen | DoBlue;
        for (i = 0; i < COLORS; ++i) {
          colordef.pixel = extracolors[i];
          colordef.red = extrared[i] << 8 & 0xffff;
          colordef.green = extragreen[i] << 8 & 0xffff;
          colordef.blue = extrablue[i] << 8 & 0xffff;
          XStoreColor(G.W_Display, G.W_Colormap, colordef);
        }
      }
    }
    for (i = 0; $u64(i) < Math.trunc(1248 / 104); ++i) {
      sprintf(P(defaultstring), S("color.%s"), G.colortable[i].name);
      defaults = getdefault(P(defaultstring));
      if (!defaults) {
        if (i > GREY) {
          sprintf(P(defaultstring), S("color.%s"), G.colortable[i - RaceDefaultOffset].name);
          defaults = getdefault(P(defaultstring));
          if (!defaults) {
            defaults = G.colortable[i - RaceDefaultOffset].name;
          }
        } else {
          defaults = G.colortable[i].name;
        }
      }
      XParseColor(G.W_Display, G.W_Colormap, defaults, foo);
      switch (i) {
      case 1:
        foo.pixel = pixel[0];
        break;
      case 2:
        foo.pixel = ((pixel[0] | planes[1]) >>> 0 | planes[2]) >>> 0;
        break;
      case 5:
        foo.pixel = ((pixel[0] | planes[1]) >>> 0 | planes[3]) >>> 0;
        break;
      case 4:
        foo.pixel = ((pixel[0] | planes[2]) >>> 0 | planes[3]) >>> 0;
        break;
      case 3:
        foo.pixel = (pixel[0] | planes[1]) >>> 0;
        break;
      case 6:
        foo.pixel = (((pixel[0] | planes[1]) >>> 0 | planes[2]) >>> 0 | planes[3]) >>> 0;
        break;
      case 0:
        foo.pixel = (pixel[0] | planes[0]) >>> 0;
        break;
      case 9:
        foo.pixel = (((pixel[0] | planes[0]) >>> 0 | planes[1]) >>> 0 | planes[2]) >>> 0;
        break;
      case 7:
        foo.pixel = (((pixel[0] | planes[0]) >>> 0 | planes[1]) >>> 0 | planes[3]) >>> 0;
        break;
      case 8:
        foo.pixel = (((pixel[0] | planes[0]) >>> 0 | planes[2]) >>> 0 | planes[3]) >>> 0;
        break;
      case 10:
        foo.pixel = ((pixel[0] | planes[0]) >>> 0 | planes[1]) >>> 0;
        break;
      case 11:
        foo.pixel = ((((pixel[0] | planes[0]) >>> 0 | planes[1]) >>> 0 | planes[2]) >>> 0 | planes[3]) >>> 0;
        break;
      }
      if (G.takeNearest) {
        XAllocColor(G.W_Display, G.W_Colormap, foo);
      } else {
        XStoreColor(G.W_Display, G.W_Colormap, foo);
      }
      G.colortable[i].pixelValue = foo.pixel | 0;
      G.colortable[i].pixmap = XCreatePixmapFromBitmapData(G.W_Display, G.W_Root, P(solid), TILESIDE, TILESIDE, foo.pixel, foo.pixel, $sadd($cast(anon_Xlib_h_489, G.W_Display).screens, G.W_Screen).root_depth >>> 0);
    }
  } else if (G.W_Visual.class >= TrueColor) {
    for (i = 0; $u64(i) < Math.trunc(1248 / 104); ++i) {
      sprintf(P(defaultstring), S("color.%s"), G.colortable[i].name);
      defaults = getdefault(P(defaultstring));
      if (!defaults) {
        if (i > GREY) {
          sprintf(P(defaultstring), S("color.%s"), G.colortable[i - RaceDefaultOffset].name);
          defaults = getdefault(P(defaultstring));
          if (!defaults) {
            defaults = G.colortable[i - RaceDefaultOffset].name;
          }
        } else {
          defaults = G.colortable[i].name;
        }
      }
      XParseColor(G.W_Display, G.W_Colormap, defaults, foo);
      XAllocColor(G.W_Display, G.W_Colormap, foo);
      G.colortable[i].pixelValue = foo.pixel | 0;
      G.colortable[i].pixmap = XCreatePixmapFromBitmapData(G.W_Display, G.W_Root, P(solid), TILESIDE, TILESIDE, foo.pixel, foo.pixel, $sadd($cast(anon_Xlib_h_489, G.W_Display).screens, G.W_Screen).root_depth >>> 0);
    }
  } else {
    fprintf(R.stderr, S("Don't know how to deal with a Class %d Visual\n"), G.W_Visual.class);
    fprintf(R.stderr, S("Your X server is not supported at %d bpp!\n"), $sadd($cast(anon_Xlib_h_489, G.W_Display).screens, G.W_Screen).root_depth);
    terminate(1);
  }
  for (i = 0; $u64(i) < Math.trunc(1248 / 104); ++i) {
    for (j = 0; j < FONTS + 1; ++j) {
      XSetForeground(G.W_Display, G.colortable[i].contexts[j], $u64(G.colortable[i].pixelValue));
      XSetBackground(G.W_Display, G.colortable[i].contexts[j], $u64(G.colortable[G.W_Black].pixelValue));
    }
  }
  if (scrollbar) {
    scroll_thumb_pixmap = XCreatePixmapFromBitmapData(G.W_Display, G.W_Root, P(gray), TILESIDE, TILESIDE, $u64(G.colortable[G.W_White].pixelValue), $u64(G.colortable[G.W_Black].pixelValue), $sadd($cast(anon_Xlib_h_489, G.W_Display).screens, G.W_Screen).root_depth >>> 0);
    values.fill_style = FillTiled;
    values.tile = scroll_thumb_pixmap;
    scroll_thumb_gc = XCreateGC(G.W_Display, G.W_Root, GCFillStyle | GCTile, values);
  }
}

export function W_SetBackgroundPixmap(window_: Ptr | null, background: number): void {
  let win = window_ ? $cast(struct_window, window_) : G.myroot;
  XSetWindowBackgroundPixmap(G.W_Display, win.window, background);
  XClearWindow(G.W_Display, win.window);
  if (win.background) {
    XFreePixmap(G.W_Display, win.background);
  }
  win.background = XCreatePixmap(G.W_Display, G.W_Root, win.width >>> 0, win.height >>> 0, $sadd($cast(anon_Xlib_h_489, G.W_Display).screens, G.W_Screen).root_depth >>> 0);
  XCopyArea(G.W_Display, win.window, win.background, G.colortable[G.W_White].contexts[0], 0, 0, win.width >>> 0, win.height >>> 0, 0, 0);
}

export function W_UnsetBackgroundPixmap(window_: Ptr | null): void {
  let win = window_ ? $cast(struct_window, window_) : G.myroot;
  if (win.background) {
    XFreePixmap(G.W_Display, win.background);
    win.background = 0;
  }
  XSetWindowBackgroundPixmap(G.W_Display, win.window, ParentRelative);
  XClearWindow(G.W_Display, win.window);
  XCopyArea(G.W_Display, win.window, win.drawable, G.colortable[G.W_White].contexts[0], 0, 0, win.width >>> 0, win.height >>> 0, 0, 0);
}

export function W_FlushWindow(window_: Ptr | null): void {
  let win = window_ ? $cast(struct_window, window_) : G.myroot;
  if (win.isbuffered) {
    XCopyArea(G.W_Display, win.buffer, win.window, G.colortable[G.W_Black].contexts[0], 0, 0, win.width >>> 0, win.height >>> 0, 0, 0);
  }
}

export function W_RenameWindow(window_: Ptr | null, str: Ptr | null): void {
  let win = window_ ? $cast(struct_window, window_) : G.myroot;
  XStoreName(G.W_Display, win.window, str);
}

export function W_MakeWindow(name: Ptr | null, x$: number, y$: number, width$: number, height$: number, parent$: Ptr | null, border: number, color: number): Ptr | null {
  const x = new Int32Array(1);
  x[0] = x$;
  const y = new Int32Array(1);
  y[0] = y$;
  const width = new Int32Array(1);
  width[0] = width$;
  const height = new Int32Array(1);
  height[0] = height$;
  const parent = [null];
  parent[0] = parent$;
  let newwin = null;
  let wparent = 0;
  let attrs = new struct_XSetWindowAttributes();
  let window_title = S("Netrek");
  let title_buff = new Int8Array(257);
  let sz_hints = null;
  let gcheck_result = 0;
  gcheck_result = checkGeometry(name, P(x, 0), P(y, 0), P(width, 0), P(height, 0));
  checkParent(name, P(parent, 0));
  wparent = (parent[0] ? $cast(struct_window, parent[0]) : G.myroot).window;
  attrs.border_pixel = $u64(G.colortable[color].pixelValue);
  attrs.event_mask = KeyPressMask | ButtonPressMask | ExposureMask | LeaveWindowMask;
  attrs.event_mask = attrs.event_mask | ButtonMotionMask;
  if (strcmp(name, S("netrek_icon")) === 0) {
    attrs.event_mask = ExposureMask;
  }
  attrs.background_pixel = $u64(G.colortable[G.W_Black].pixelValue);
  attrs.do_not_propagate_mask = KeyPressMask | ButtonPressMask | ExposureMask;
  newwin = newWindow(XCreateWindow(G.W_Display, wparent, x[0], y[0], width[0] >>> 0, height[0] >>> 0, border >>> 0, CopyFromParent, InputOutput, null, CWBackPixel | CWEventMask | CWBorderPixel, attrs), WIN_GRAPH);
  if (!strcmp(name, S("netrek"))) {
    if (G.full_screen_enabled) {
      kde_fullscreen_on($bytes(newwin));
    }
  }
  sz_hints = XAllocSizeHints();
  if (strcmp(name, S("netrek")) === 0 || strcmp(name, S("wait")) === 0 || strcmp(name, S("waitmotd")) === 0) {
    if (!G.title && G.serverName) {
      if (strcmp(name, S("wait")) === 0) {
        strcpy(P(title_buff), G.serverName);
      } else if (strcmp(name, S("waitmotd")) === 0) {
        strcpy(P(title_buff), S("Motd-[f]forward, [b]back, [space]unmap"));
      } else {
        sprintf(P(title_buff), S("Netrek  @  %s"), G.serverName);
      }
      window_title = P(title_buff);
    } else if (G.title) {
      window_title = G.title;
    }
    sz_hints.min_width = width[0];
    sz_hints.max_width = width[0];
    sz_hints.min_height = height[0];
    sz_hints.max_height = height[0];
    sz_hints.flags = PMinSize | PMaxSize;
    if (!G.small_screen) {
      if (gcheck_result & G_SET_X || gcheck_result & G_SET_Y) {
        sz_hints.flags = sz_hints.flags | WMXYHintMode_default();
      }
    }
  } else {
    window_title = name;
    if (gcheck_result & G_SET_X || gcheck_result & G_SET_Y) {
      sz_hints.flags = sz_hints.flags | WMXYHintMode_default();
    }
  }
  XStoreName(G.W_Display, newwin.window, window_title);
  XSetWMNormalHints(G.W_Display, newwin.window, sz_hints);
  XFree(sz_hints);
  class_hint.res_name = name;
  XSetClassHint(G.W_Display, newwin.window, class_hint);
  XSetWMHints(G.W_Display, newwin.window, wm_hint);
  newwin.name = strdup(name);
  newwin.data = null;
  newwin.width = width[0];
  newwin.height = height[0];
  if (wparent !== G.W_Root) {
    if (checkMapped(name)) {
      W_MapWindow($bytes(newwin));
    }
  }
  let default_buffered = 0;
  if (!strcmp(name, S("local"))) {
    default_buffered = 1;
  }
  if (!strcmp(name, S("tstat"))) {
    default_buffered = 1;
  }
  if (!strcmp(name, S("map"))) {
    default_buffered = 1;
  }
  if (!strcmp(name, S("quit"))) {
    default_buffered = 1;
  }
  let default_buffered_name = new Int8Array(80);
  snprintf(P(default_buffered_name), 80, S("%s.buffered"), name);
  if (booleanDefault(P(default_buffered_name), default_buffered)) {
    newwin.isbuffered = 1;
    if (newwin.buffer === 0) {
      newwin.buffer = XCreatePixmap(G.W_Display, G.W_Root, newwin.width >>> 0, newwin.height >>> 0, $sadd($cast(anon_Xlib_h_489, G.W_Display).screens, G.W_Screen).root_depth >>> 0);
    }
    newwin.drawable = newwin.buffer;
    XFillRectangle(G.W_Display, newwin.drawable, G.colortable[G.backColor].contexts[0], 0, 0, newwin.width >>> 0, newwin.height >>> 0);
  }
  XSetWindowColormap(G.W_Display, newwin.window, G.W_Colormap);
  return $bytes(newwin);
}

export function W_ChangeBorder(window_: Ptr | null, color: number): void {
  if ($sadd($cast(anon_Xlib_h_489, G.W_Display).screens, G.W_Screen).root_visual.map_entries <= 2 || G.forceMono) {
    XSetWindowBorderPixmap(G.W_Display, (window_ ? $cast(struct_window, window_) : G.myroot).window, G.colortable[color].pixmap);
  } else {
    XSetWindowBorder(G.W_Display, (window_ ? $cast(struct_window, window_) : G.myroot).window, $u64(G.colortable[color].pixelValue));
  }
}

export function W_MapWindow(window_: Ptr | null): void {
  let win = null;
  win = window_ ? $cast(struct_window, window_) : G.myroot;
  if (win.mapped) {
    return;
  }
  win.mapped = 1;
  XMapRaised(G.W_Display, win.window);
}

export function W_UnmapWindow(window_: Ptr | null): void {
  let win = null;
  win = window_ ? $cast(struct_window, window_) : G.myroot;
  if (win.mapped === 0) {
    return;
  }
  win.mapped = 0;
  XUnmapWindow(G.W_Display, win.window);
}

export function W_IsMapped(window_: Ptr | null): number {
  let win = null;
  win = window_ ? $cast(struct_window, window_) : G.myroot;
  if (!win) {
    return 0;
  }
  return win.mapped;
}

export function W_FillArea(window_: Ptr | null, x: number, y: number, width: number, height: number, color: number): void {
  let win = null;
  win = window_ ? $cast(struct_window, window_) : G.myroot;
  switch (win.type) {
  case 1:
    XFillRectangle(G.W_Display, win.drawable, G.colortable[color].contexts[0], x, y, width >>> 0, height >>> 0);
    break;
  case 4:
    XFillRectangle(G.W_Display, win.drawable, G.colortable[color].contexts[0], WIN_EDGE + Math.imul(x, G.W_Textwidth), MENU_PAD + Math.imul(y, G.W_Textheight), Math.imul(width, G.W_Textwidth) >>> 0, Math.imul(height, G.W_Textheight) >>> 0);
    break;
  default:
    XFillRectangle(G.W_Display, win.drawable, G.colortable[color].contexts[0], WIN_EDGE + Math.imul(x, G.W_Textwidth), MENU_PAD + Math.imul(y, G.W_Textheight), Math.imul(width, G.W_Textwidth) >>> 0, Math.imul(height, G.W_Textheight) >>> 0);
  }
}

function FlushClearAreaCache(window_: Ptr | null): void {
  let win = window_ ? $cast(struct_window, window_) : G.myroot;
  XFillRectangles(G.W_Display, win.drawable, G.colortable[G.backColor].contexts[0], _rcache[0], _rcache_index);
  _rcache_index = 0;
}

export function W_CacheClearArea(window_: Ptr | null, x: number, y: number, width: number, height: number): void {
  let r = null;
  if (_rcache_index === MAXCACHE) {
    FlushClearAreaCache(window_);
  }
  r = $sat(_rcache, _rcache_index++);
  r.x = x << 16 >> 16;
  r.y = y << 16 >> 16;
  r.width = width & 0xffff;
  r.height = height & 0xffff;
}

export function W_FlushClearAreaCache(window_: Ptr | null): void {
  if (_rcache_index) {
    FlushClearAreaCache(window_);
  }
}

export function W_ClearArea(window_: Ptr | null, x: number, y: number, width: number, height: number): void {
  let win = null;
  win = window_ ? $cast(struct_window, window_) : G.myroot;
  switch (win.type) {
  case 1:
    XFillRectangle(G.W_Display, win.drawable, G.colortable[G.backColor].contexts[0], x, y, width >>> 0, height >>> 0);
    break;
  default:
    XFillRectangle(G.W_Display, win.drawable, G.colortable[G.backColor].contexts[0], WIN_EDGE + Math.imul(x, G.W_Textwidth), MENU_PAD + Math.imul(y, G.W_Textheight), Math.imul(width, G.W_Textwidth) >>> 0, Math.imul(G.W_Textheight, height) >>> 0);
    break;
  }
}

export function W_ClearWindow(window_: Ptr | null): void {
  let win = window_ ? $cast(struct_window, window_) : G.myroot;
  if (!win.isbuffered) {
    XClearWindow(G.W_Display, win.window);
    return;
  }
  if (!win.background) {
    XFillRectangle(G.W_Display, win.drawable, G.colortable[G.backColor].contexts[0], 0, 0, win.width >>> 0, win.height >>> 0);
    return;
  }
  XCopyArea(G.W_Display, win.background, win.drawable, G.colortable[G.W_White].contexts[0], 0, 0, win.width >>> 0, win.height >>> 0, 0, 0);
}

export function W_Pending(): number {
  return XPending(G.W_Display);
}

export async function W_EventsPending(): Promise<number> {
  if (W_isEvent) {
    return 1;
  }
  while (XPending(G.W_Display)) {
    if (await W_SpNextEvent(W_myevent)) {
      W_isEvent = 1;
      return 1;
    }
  }
  return 0;
}

export async function W_NextEvent(wevent: struct_event | null): Promise<void> {
  if (W_isEvent) {
    wevent.$cp(W_myevent);
    W_isEvent = 0;
    return;
  }
  while (await W_SpNextEvent(wevent) === 0) {
    ;
  }
}

function sym_to_key(sym: number): number {
  switch (sym) {
  case 65362:
    return W_Key_Up;
  case 65364:
    return W_Key_Down;
  }
  return 0;
}

export async function W_SpNextEvent(wevent: struct_event | null): Promise<number> {
  let event = new union__XEvent();
  let key = null;
  let button = null;
  let expose = null;
  let configure = null;
  let motion = null;
  let thresh = 0;
  let control_key = 0;
  const ch = new Uint8Array(1);
  let nch = 0;
  let win = null;
  const sym = new Float64Array(1);
  key = $cast(struct_XKeyEvent, event);
  button = $cast(struct_XButtonEvent, event);
  expose = $cast(struct_XExposeEvent, event);
  configure = $cast(struct_XConfigureEvent, event);
  motion = $cast(struct_XMotionEvent, event);
  for (; ; ) {
    await XNextEvent(G.W_Display, event);
    win = findWindow(key.window);
    if (!win) {
      return 0;
    }
    if (key.send_event === True && event.type !== ClientMessage) {
      return 0;
    }
    if ((event.type === KeyPress || event.type === ButtonPress) && win.type === WIN_MENU) {
      if (key.y % (G.W_Textheight + MENU_PAD * 2 + MENU_BAR) >= G.W_Textheight + MENU_PAD * 2) {
        return 0;
      }
      key.y = key.y / (G.W_Textheight + MENU_PAD * 2 + MENU_BAR) | 0;
    }
    switch (event.type) {
    case 33:
      if (event.xclient.message_type === G.wm_protocols && $u64(event.xclient.data.l[0]) === G.wm_delete_window) {
        W_UnmapWindow($bytes(win));
        wevent.type = W_EV_CLOSED;
        wevent.Window = $bytes(win);
        wevent.key = (wevent.x = wevent.y = 0) & 0xff;
        return 1;
      }
      if (event.xclient.message_type === 0 && event.xclient.data.l[0] === 1 && event.xclient.data.l[1] === 2) {
        let tv = new struct_timeval();
        gettimeofday(tv, null);
        let now = $u64(tv.tv_sec * 1000000 + tv.tv_usec);
        let was = $u64(event.xclient.data.l[2] | $shl64(event.xclient.data.l[3], 32));
        let vl = now - was;
        if (vl < 1000000) {
          G.visual_l = vl;
        }
        return 0;
      }
      break;
    case 8:
      if (win === $cast(struct_window, G.messagew)) {
        G.W_in_message = 0;
      }
      return 0;
      break;
    case 2:
      if ((key.state & LockMask) >>> 0 && !((key.state & ShiftMask) >>> 0) && G.ignoreCaps) {
        printf(S("Got a capslock!\n"));
        key.state = (key.state & 4294967293) >>> 0;
      }
      if ((key.state & ControlMask) >>> 0 && G.use_control_key) {
        control_key = 1;
        key.state = (key.state & 4294967291) >>> 0;
      } else {
        control_key = 0;
      }
      nch = XLookupString(key, $view8(P(ch, 0), true), 1, P(sym, 0), null);
      if (nch === 0) {
        ch[0] = sym_to_key(sym[0] | 0);
        if (ch[0] === 0) {
          return 0;
        }
      }
      if (G.mouse_as_shift) {
        if ((key.state & Button1Mask) >>> 0) {
          wevent.modifier = W_LBUTTON;
          wevent.type = W_EV_MKEY;
        } else if ((key.state & Button2Mask) >>> 0) {
          wevent.modifier = W_MBUTTON;
          wevent.type = W_EV_MKEY;
        } else if ((key.state & Button3Mask) >>> 0) {
          wevent.modifier = W_RBUTTON;
          wevent.type = W_EV_MKEY;
        } else {
          wevent.type = W_EV_KEY;
        }
      } else {
        wevent.type = W_EV_KEY;
      }
      wevent.Window = $bytes(win);
      wevent.x = key.x;
      wevent.y = key.y;
      if (control_key) {
        wevent.key = ch[0] + 96 & 0xff;
      } else {
        wevent.key = ch[0];
      }
      return 1;
      break;
    case 4:
      wevent.type = W_EV_BUTTON;
      wevent.Window = $bytes(win);
      W_SpNextEvent$prev_x = wevent.x = button.x;
      W_SpNextEvent$prev_y = wevent.y = button.y;
      if (G.mouse_as_shift && ($peq(wevent.Window, G.mapw) || $peq(wevent.Window, G.w))) {
        switch ((button.button & 15) >>> 0) {
        case 3:
          if (G.b3_as_shift) {
            return 0;
          }
          break;
        case 1:
          if (G.b1_as_shift) {
            return 0;
          }
          break;
        case 2:
          if (G.b2_as_shift) {
            return 0;
          }
          break;
        }
      }
      switch ((button.button & 15) >>> 0) {
      case 3:
        wevent.key = W_RBUTTON;
        break;
      case 1:
        wevent.key = W_LBUTTON;
        break;
      case 2:
        wevent.key = W_MBUTTON;
        break;
      case 4:
        wevent.key = W_WUBUTTON;
        break;
      case 5:
        wevent.key = W_WDBUTTON;
        break;
      }
      if (G.extended_mouse) {
        if ((button.state & (ControlMask | ShiftMask)) >>> 0) {
          if ((button.state & ShiftMask) >>> 0) {
            wevent.key = (wevent.key | W_SHIFT_BUTTON) & 0xff;
          }
          if ((button.state & ControlMask) >>> 0) {
            wevent.key = (wevent.key | W_CTRL_BUTTON) & 0xff;
          }
          return 1;
        }
      }
      if (win.type === WIN_SCROLL) {
        scrollScrolling(wevent);
        return 0;
      }
      return 1;
    case 6:
      if (!G.motion_mouse || !G.motion_mouse_enablable && !G.motion_mouse_steering) {
        return 0;
      }
      wevent.type = W_EV_CM_BUTTON;
      wevent.Window = $bytes(win);
      thresh = Math.abs(W_SpNextEvent$prev_x - motion.x) + Math.abs(W_SpNextEvent$prev_y - motion.y);
      if (thresh < G.user_motion_thresh) {
        return 0;
      }
      W_SpNextEvent$prev_x = wevent.x = motion.x;
      W_SpNextEvent$prev_y = wevent.y = motion.y;
      if (G.mouse_as_shift && ($peq(wevent.Window, G.mapw) || $peq(wevent.Window, G.w))) {
        switch ((button.button & 15) >>> 0) {
        case 3:
          if (G.b3_as_shift) {
            return 0;
          }
          break;
        case 1:
          if (G.b1_as_shift) {
            return 0;
          }
          break;
        case 2:
          if (G.b2_as_shift) {
            return 0;
          }
          break;
        }
      }
      switch ((button.button & 15) >>> 0) {
      case 3:
        wevent.key = W_RBUTTON;
        break;
      case 1:
        wevent.key = W_LBUTTON;
        break;
      case 2:
        wevent.key = W_MBUTTON;
        break;
      case 4:
        wevent.key = W_WUBUTTON;
        break;
      case 5:
        wevent.key = W_WDBUTTON;
        break;
      }
      if (G.extended_mouse) {
        if ((button.state & (ControlMask | ShiftMask)) >>> 0) {
          if ((button.state & ShiftMask) >>> 0) {
            wevent.key = (wevent.key | W_SHIFT_BUTTON) & 0xff;
          }
          if ((button.state & ControlMask) >>> 0) {
            wevent.key = (wevent.key | W_CTRL_BUTTON) & 0xff;
          }
          return 1;
        }
      }
      return 1;
    case 12:
      if (expose.count !== 0) {
        return 0;
      }
      if (win.type === WIN_SCROLL) {
        configureScrolling(win, expose.x, expose.y, expose.width, expose.height);
        redrawScrolling(win);
        return 0;
      }
      if (win.type === WIN_MENU) {
        redrawMenu(win);
        return 0;
      }
      wevent.type = W_EV_EXPOSE;
      wevent.Window = $bytes(win);
      return 1;
    case 22:
      configureScrolling(win, configure.x, configure.y, configure.width, configure.height);
      break;
    default:
      return 0;
      break;
    }
  }
}

export function W_MakeLine(window_: Ptr | null, x0: number, y0: number, x1: number, y1: number, color: number): void {
  let win = 0;
  win = (window_ ? $cast(struct_window, window_) : G.myroot).drawable;
  XDrawLine(G.W_Display, win, G.colortable[color].contexts[0], x0, y0, x1, y1);
}

function FlushLineCache(win: number, color: number): void {
  XDrawSegments(G.W_Display, win, G.colortable[color].contexts[0], _lcache[color][0], _lcache_index[color]);
  _lcache_index[color] = 0;
}

export function W_CacheLine(window_: Ptr | null, x0: number, y0: number, x1: number, y1: number, color: number): void {
  let win = (window_ ? $cast(struct_window, window_) : G.myroot).drawable;
  let s = null;
  if (_lcache_index[color] === MAXCACHE) {
    FlushLineCache(win, color);
  }
  s = $sat(_lcache[color], _lcache_index[color]++);
  s.x1 = x0 << 16 >> 16;
  s.y1 = y0 << 16 >> 16;
  s.x2 = x1 << 16 >> 16;
  s.y2 = y1 << 16 >> 16;
}

export function W_FlushLineCaches(window_: Ptr | null): void {
  let win = (window_ ? $cast(struct_window, window_) : G.myroot).drawable;
  let i = 0;
  for (i = 0; $u64(i) < Math.trunc(1248 / 104); ++i) {
    if (_lcache_index[i]) {
      FlushLineCache(win, i);
    }
  }
}

export function W_MakeTractLine(window_: Ptr | null, x0: number, y0: number, x1: number, y1: number, color: number): void {
  let win = 0;
  win = (window_ ? $cast(struct_window, window_) : G.myroot).drawable;
  XDrawLine(G.W_Display, win, G.colortable[color].contexts[3], x0, y0, x1, y1);
}

export function W_MakePhaserLine(window_: Ptr | null, x0: number, y0: number, x1: number, y1: number, color: number): void {
  let win = 0;
  win = (window_ ? $cast(struct_window, window_) : G.myroot).drawable;
  XDrawLine(G.W_Display, win, G.colortable[color].contexts[1], x0, y0, x1, y1);
}

export function W_WriteCircle(window_: Ptr | null, x: number, y: number, r: number, color: number): void {
  let win = window_ ? $cast(struct_window, window_) : G.myroot;
  XSetForeground(G.W_Display, G.colortable[color].contexts[0], $u64(G.colortable[color].pixelValue));
  XDrawArc(G.W_Display, win.drawable, G.colortable[color].contexts[0], x, y, r >>> 0, r >>> 0, 0, 23040);
}

export function W_WriteTriangle(window_: Ptr | null, x: number, y: number, s: number, t: number, color: number): void {
  let win = window_ ? $cast(struct_window, window_) : G.myroot;
  let points = $sarr(struct_XPoint, 4);
  if (t === 0) {
    points[0].x = x << 16 >> 16;
    points[0].y = y << 16 >> 16;
    points[1].x = x + s << 16 >> 16;
    points[1].y = y - s << 16 >> 16;
    points[2].x = x - s << 16 >> 16;
    points[2].y = y - s << 16 >> 16;
    points[3].x = x << 16 >> 16;
    points[3].y = y << 16 >> 16;
  } else {
    points[0].x = x << 16 >> 16;
    points[0].y = y << 16 >> 16;
    points[1].x = x + s << 16 >> 16;
    points[1].y = y + s << 16 >> 16;
    points[2].x = x - s << 16 >> 16;
    points[2].y = y + s << 16 >> 16;
    points[3].x = x << 16 >> 16;
    points[3].y = y << 16 >> 16;
  }
  XDrawLines(G.W_Display, win.drawable, G.colortable[color].contexts[0], points[0], 4, CoordModeOrigin);
}

export function W_WriteText(window_: Ptr | null, x: number, y: number, color: number, str: Ptr | null, len: number, font: Ptr | null): void {
  let win = null;
  let addr = 0;
  if (!font) {
    font = G.W_RegularFont;
  }
  win = window_ ? $cast(struct_window, window_) : G.myroot;
  switch (win.type) {
  case 1:
    addr = G.fonts[$rd($pcast(font, 4, true, false))].baseline;
    if (len < 0) {
      len = strlen(str) | 0;
    }
    XDrawImageString(G.W_Display, win.drawable, win.insensitive ? G.colortable[color].insens_contexts[1] : G.colortable[color].contexts[$rd($pcast(font, 4, true, false))], x, y + addr, str, len);
    break;
  case 4:
    XCopyArea(G.W_Display, win.drawable, win.drawable, G.colortable[G.W_White].contexts[0], WIN_EDGE, MENU_PAD + G.W_Textheight, Math.imul(win.width, G.W_Textwidth) >>> 0, Math.imul(win.height - 1, G.W_Textheight) >>> 0, WIN_EDGE, MENU_PAD);
    XClearArea(G.W_Display, win.drawable, WIN_EDGE, MENU_PAD + Math.imul(G.W_Textheight, win.height - 1), Math.imul(G.W_Textwidth, win.width) >>> 0, G.W_Textheight >>> 0, False);
    if (len < 0) {
      len = strlen(str) | 0;
    }
    XDrawImageString(G.W_Display, win.drawable, win.insensitive ? G.colortable[color].insens_contexts[1] : G.colortable[color].contexts[$rd($pcast(font, 4, true, false))], WIN_EDGE, MENU_PAD + Math.imul(G.W_Textheight, win.height - 1) + G.fonts[$rd($pcast(font, 4, true, false))].baseline, str, len);
    AddToScrolling(win, color, font, str, len);
    break;
  case 3:
    changeMenuItem(win, x, y, str, color);
    break;
  default:
    addr = G.fonts[$rd($pcast(font, 4, true, false))].baseline;
    if (len < 0) {
      len = strlen(str) | 0;
    }
    XDrawImageString(G.W_Display, win.drawable, win.insensitive ? G.colortable[color].insens_contexts[1] : G.colortable[color].contexts[$rd($pcast(font, 4, true, false))], Math.imul(x, G.W_Textwidth) + WIN_EDGE, MENU_PAD + Math.imul(y, G.W_Textheight) + addr, str, len);
    break;
  }
}

export function W_MaskText(window_: Ptr | null, x: number, y: number, color: number, str: Ptr | null, len: number, font: Ptr | null): void {
  let win = null;
  let addr = 0;
  addr = G.fonts[$rd($pcast(font, 4, true, false))].baseline;
  win = window_ ? $cast(struct_window, window_) : G.myroot;
  XDrawString(G.W_Display, win.drawable, G.colortable[color].contexts[$rd($pcast(font, 4, true, false))], x, y + addr, str, len);
}

export function W_StoreBitmap(width: number, height: number, data: Ptr | null, window_: Ptr | null): Ptr | null {
  let newicon = null;
  let win = null;
  win = window_ ? $cast(struct_window, window_) : G.myroot;
  newicon = new struct_icon();
  if (!newicon) {
    fprintf(R.stderr, S("W_StoreBitmap fail to allocate icon"));
    exit(1);
  }
  newicon.width = width;
  newicon.height = height;
  newicon.bitmap = XCreateBitmapFromData(G.W_Display, G.W_Root, data, width >>> 0, height >>> 0);
  newicon.window = win.drawable;
  newicon.pixmap = 0;
  return $bytes(newicon);
}

export function W_WriteBitmap(x: number, y: number, bit: Ptr | null, color: number): void {
  let icon = null;
  icon = $cast(struct_icon, bit);
  XCopyPlane(G.W_Display, icon.bitmap, icon.window, G.colortable[color].contexts[BITGC], 0, 0, icon.width >>> 0, icon.height >>> 0, x, y, 1);
}

export function W_TileWindow(window_: Ptr | null, bit: Ptr | null): void {
  let win = 0;
  let icon = null;
  icon = $cast(struct_icon, bit);
  win = (window_ ? $cast(struct_window, window_) : G.myroot).window;
  if (icon.pixmap === 0) {
    icon.pixmap = XCreatePixmap(G.W_Display, G.W_Root, icon.width >>> 0, icon.height >>> 0, $sadd($cast(anon_Xlib_h_489, G.W_Display).screens, G.W_Screen).root_depth >>> 0);
    XCopyPlane(G.W_Display, icon.bitmap, icon.pixmap, G.colortable[G.W_White].contexts[0], 0, 0, icon.width >>> 0, icon.height >>> 0, 0, 0, 1);
  }
  XSetWindowBackgroundPixmap(G.W_Display, win, icon.pixmap);
  XClearWindow(G.W_Display, win);
}

export function W_UnTileWindow(window_: Ptr | null): void {
  let win = 0;
  win = (window_ ? $cast(struct_window, window_) : G.myroot).window;
  XSetWindowBackground(G.W_Display, win, $u64(G.colortable[G.W_Black].pixelValue));
  XClearWindow(G.W_Display, win);
}

export function W_MakeTextWindow(name: Ptr | null, x$: number, y$: number, width$: number, height$: number, parent$: Ptr | null, border: number): Ptr | null {
  const x = new Int32Array(1);
  x[0] = x$;
  const y = new Int32Array(1);
  y[0] = y$;
  const width = new Int32Array(1);
  width[0] = width$;
  const height = new Int32Array(1);
  height[0] = height$;
  const parent = [null];
  parent[0] = parent$;
  let newwin = null;
  let wparent = 0;
  let attrs = new struct_XSetWindowAttributes();
  let sz_hints = null;
  let gcheck_result = 0;
  gcheck_result = checkGeometry(name, P(x, 0), P(y, 0), P(width, 0), P(height, 0));
  checkParent(name, P(parent, 0));
  attrs.border_pixel = $u64(G.colortable[G.W_White].pixelValue);
  attrs.event_mask = ExposureMask;
  attrs.event_mask = attrs.event_mask | ButtonPressMask;
  attrs.background_pixel = $u64(G.colortable[G.W_Black].pixelValue);
  attrs.do_not_propagate_mask = ExposureMask;
  wparent = (parent[0] ? $cast(struct_window, parent[0]) : G.myroot).window;
  newwin = newWindow(XCreateWindow(G.W_Display, wparent, x[0], y[0], Math.imul(width[0], G.W_Textwidth) + WIN_EDGE * 2 >>> 0, MENU_PAD * 2 + Math.imul(height[0], G.W_Textheight) >>> 0, border >>> 0, CopyFromParent, InputOutput, null, CWBackPixel | CWEventMask | CWBorderPixel, attrs), WIN_TEXT);
  class_hint.res_name = name;
  sz_hints = XAllocSizeHints();
  sz_hints.min_width = WIN_EDGE * 2 + Math.imul(width[0], G.W_Textwidth);
  sz_hints.max_width = WIN_EDGE * 2 + Math.imul(width[0], G.W_Textwidth);
  sz_hints.base_width = WIN_EDGE * 2;
  sz_hints.width_inc = G.W_Textwidth;
  sz_hints.min_height = MENU_PAD * 2 + 3 * G.W_Textheight;
  sz_hints.max_height = MENU_PAD * 2 + Math.imul(height[0], G.W_Textheight);
  sz_hints.base_height = MENU_PAD * 2 + 2 * G.W_Textheight;
  sz_hints.height_inc = G.W_Textheight;
  sz_hints.flags = PResizeInc | PMinSize | PMaxSize | PBaseSize;
  if (gcheck_result & G_SET_X || gcheck_result & G_SET_Y) {
    sz_hints.flags = sz_hints.flags | WMXYHintMode_default();
  }
  XStoreName(G.W_Display, newwin.window, name);
  XSetWMNormalHints(G.W_Display, newwin.window, sz_hints);
  XFree(sz_hints);
  XSetClassHint(G.W_Display, newwin.window, class_hint);
  XSetWMHints(G.W_Display, newwin.window, wm_hint);
  newwin.name = strdup(name);
  newwin.data = null;
  newwin.width = width[0];
  newwin.height = height[0];
  if (wparent !== G.W_Root) {
    if (checkMapped(name)) {
      W_MapWindow($bytes(newwin));
    }
  }
  XSetWindowColormap(G.W_Display, newwin.window, G.W_Colormap);
  return $bytes(newwin);
}

export function newWindow(window_: number, type: number): struct_window | null {
  let newwin = null;
  XSetWMProtocols(G.W_Display, window_, P(G, "wm_delete_window"), 1);
  newwin = new struct_window();
  if (!newwin) {
    fprintf(R.stderr, S("newWindow fail to allocate window"));
    exit(1);
  }
  newwin.window = window_;
  newwin.drawable = window_;
  newwin.isbuffered = 0;
  newwin.buffer = 0;
  newwin.background = 0;
  newwin.type = type;
  newwin.mapped = 0;
  newwin.handle_keydown = null;
  newwin.handle_keyup = null;
  newwin.handle_button = null;
  newwin.handle_expose = null;
  addToHash(newwin);
  newwin.insensitive = 0;
  newwin.cursor = 0;
  return newwin;
}

export function findWindow(window_: number): struct_window | null {
  let entry = null;
  entry = G.hashtable[(window_ | 0) % 101];
  while (!!entry) {
    if (entry.window.window === window_) {
      return entry.window;
    }
    entry = entry.next;
  }
  return null;
}

export function addToHash(win: struct_window | null): void {
  let new_ = null;
  new_ = P(G.hashtable, (win.window | 0) % 101);
  while (!!new_.a[new_.o]) {
    new_ = P(new_.a[new_.o], "next");
  }
  new_.a[new_.o] = new struct_windowlist();
  new_.a[new_.o].next = null;
  new_.a[new_.o].window = win;
}

export function W_MakeScrollingWindow(name: Ptr | null, x$: number, y$: number, width$: number, height$: number, parent$: Ptr | null, border: number): Ptr | null {
  const x = new Int32Array(1);
  x[0] = x$;
  const y = new Int32Array(1);
  y[0] = y$;
  const width = new Int32Array(1);
  width[0] = width$;
  const height = new Int32Array(1);
  height[0] = height$;
  const parent = [null];
  parent[0] = parent$;
  let newwin = null;
  let wparent = 0;
  let attrs = new struct_XSetWindowAttributes();
  let sz_hints = null;
  let gcheck_result = 0;
  let sw = null;
  let scw = scrollbar ? scroll_thumb_width : 0;
  gcheck_result = checkGeometry(name, P(x, 0), P(y, 0), P(width, 0), P(height, 0));
  checkParent(name, P(parent, 0));
  wparent = (parent[0] ? $cast(struct_window, parent[0]) : G.myroot).window;
  attrs.border_pixel = $u64(G.colortable[G.W_White].pixelValue);
  attrs.event_mask = StructureNotifyMask | ExposureMask | ButtonPressMask;
  attrs.background_pixel = $u64(G.colortable[G.W_Black].pixelValue);
  attrs.do_not_propagate_mask = ResizeRedirectMask | ExposureMask;
  newwin = newWindow(XCreateWindow(G.W_Display, wparent, x[0], y[0], Math.imul(width[0], G.W_Textwidth) + WIN_EDGE * 2 + scw >>> 0, MENU_PAD * 2 + Math.imul(height[0], G.W_Textheight) >>> 0, border >>> 0, CopyFromParent, InputOutput, null, CWBackPixel | CWEventMask | CWBorderPixel, attrs), WIN_SCROLL);
  class_hint.res_name = name;
  sz_hints = XAllocSizeHints();
  sz_hints.width_inc = G.W_Textwidth;
  sz_hints.height_inc = G.W_Textheight;
  sz_hints.min_width = WIN_EDGE * 2 + G.W_Textwidth + scw;
  sz_hints.min_height = MENU_PAD * 2 + G.W_Textheight;
  sz_hints.base_width = WIN_EDGE * 2 + scw;
  sz_hints.base_height = MENU_PAD * 2;
  sz_hints.flags = PResizeInc | PMinSize | PBaseSize;
  if (gcheck_result & XValue || gcheck_result & YValue) {
    sz_hints.flags = sz_hints.flags | WMXYHintMode_default();
  }
  XStoreName(G.W_Display, newwin.window, name);
  XSetWMNormalHints(G.W_Display, newwin.window, sz_hints);
  XFree(sz_hints);
  XSetClassHint(G.W_Display, newwin.window, class_hint);
  XSetWMHints(G.W_Display, newwin.window, wm_hint);
  newwin.name = strdup(name);
  sw = new struct_scrollingWindow();
  if (!sw) {
    fprintf(R.stderr, S("W_MakeScrollingWindow fail to allocate scrollingWindow"));
    exit(1);
  }
  sw.lines = 0;
  sw.updated = 0;
  sw.head = sw.tail = sw.index = null;
  sw.topline = 0;
  newwin.data = $bytes(sw);
  newwin.width = width[0];
  newwin.height = height[0];
  if (wparent !== G.W_Root) {
    if (checkMapped(name)) {
      W_MapWindow($bytes(newwin));
    }
  }
  XSetWindowColormap(G.W_Display, newwin.window, G.W_Colormap);
  return $bytes(newwin);
}

function AddToScrolling(win: struct_window | null, color: number, font: Ptr | null, str: Ptr | null, len: number): void {
  let sw = null;
  let new_ = null;
  sw = $cast(struct_scrollingWindow, win.data);
  if (sw.lines > 0 && sw.lines > scroll_lines) {
    new_ = sw.tail;
    sw.tail = new_.prev;
    new_.prev.next = null;
    new_.prev = null;
    new_.next = sw.head;
    sw.head.prev = new_;
    sw.head = new_;
  } else {
    new_ = new struct_stringList();
    if (!new_) {
      fprintf(R.stderr, S("AddToScrolling fail to allocate stringList"));
      exit(1);
    }
    new_.next = sw.head;
    new_.prev = null;
    if (sw.head) {
      sw.head.prev = new_;
    }
    sw.head = new_;
    if (!sw.tail) {
      sw.tail = new_;
    }
    ++sw.lines;
  }
  sw.index = sw.head;
  sw.topline = 0;
  ++sw.updated;
  memccpy(P(new_.string), str, 0, 100 - 1);
  new_.color = color;
  new_.font = font;
  if (len >= MAX_TEXT_WIDTH) {
    new_.string[MAX_TEXT_WIDTH - 1] = 0;
  } else {
    memset(P(new_.string, len), 32, $u64(MAX_TEXT_WIDTH - len - 1));
    new_.string[MAX_TEXT_WIDTH - 1] = 0;
  }
}

export function W_FlushScrollingWindow(window_: Ptr | null): void {
  let win = window_ ? $cast(struct_window, window_) : G.myroot;
  let sw = null;
  if (!win.mapped) {
    return;
  }
  if (win.type !== WIN_SCROLL) {
    fprintf(R.stderr, S("bad window type in W_FlushScrollingWindow.\n"));
    return;
  }
  sw = $cast(struct_scrollingWindow, win.data);
  if (!sw.updated) {
    return;
  } else {
    let item = null;
    let y = 0;
    if (win.height > sw.updated) {
      XCopyArea(G.W_Display, win.drawable, win.drawable, G.colortable[G.W_White].contexts[0], WIN_EDGE, MENU_PAD + Math.imul(sw.updated, G.W_Textheight), Math.imul(win.width, G.W_Textwidth) >>> 0, Math.imul(win.height - sw.updated, G.W_Textheight) >>> 0, WIN_EDGE, MENU_PAD);
    }
    y = Math.imul(win.height - 1, G.W_Textheight) + G.fonts[1].baseline;
    for (item = sw.index; item && y > 0 && sw.updated; item = item.next, y -= G.W_Textheight, --sw.updated) {
      XDrawImageString(G.W_Display, win.drawable, G.colortable[item.color].contexts[$rd($pcast(item.font, 4, true, false))], WIN_EDGE, MENU_PAD + y, P(item.string), win.width);
    }
    sw.updated = 0;
    if (scrollbar) {
      drawThumb(win, sw);
    }
  }
}

function drawThumb(win: struct_window | null, sw: struct_scrollingWindow | null): void {
  let x = 0;
  let y = 0;
  let h = 0;
  let savedlines = 0;
  let maxrow = 0;
  let thumbTop = 0;
  let thumbHeight = 0;
  let totalHeight = 0;
  let winheight = 0;
  savedlines = sw.lines - win.height;
  if (savedlines < 0) {
    savedlines = 0;
  }
  maxrow = sw.lines < win.height ? sw.lines : win.height;
  winheight = Math.imul(win.height, G.W_Textheight) + MENU_PAD * 2;
  thumbTop = sw.topline + savedlines;
  thumbHeight = maxrow + 1;
  totalHeight = thumbHeight + savedlines;
  x = Math.imul(win.width, G.W_Textwidth) + WIN_EDGE * 2;
  y = Math.imul(winheight, thumbTop) / totalHeight | 0;
  h = Math.imul(winheight, thumbHeight) / totalHeight | 0;
  XClearArea(G.W_Display, win.drawable, x, 0, scroll_thumb_width >>> 0, winheight >>> 0, False);
  XFillRectangle(G.W_Display, win.drawable, scroll_thumb_gc, x, y, scroll_thumb_width >>> 0, h >>> 0);
  XDrawLine(G.W_Display, win.drawable, G.colortable[G.W_Red].contexts[0], x, 0, x, winheight);
}

function redrawScrolling(win: struct_window | null): void {
  let y = 0;
  let sw = null;
  let item = null;
  if (!win.mapped) {
    return;
  }
  sw = $cast(struct_scrollingWindow, win.data);
  if (!sw.lines) {
    return;
  }
  sw.updated = 0;
  y = Math.imul(win.height - 1, G.W_Textheight) + G.fonts[1].baseline;
  for (item = sw.index; item && y > 0; item = item.next, y -= G.W_Textheight) {
    XDrawImageString(G.W_Display, win.drawable, G.colortable[item.color].contexts[$rd($pcast(item.font, 4, true, false))], WIN_EDGE, MENU_PAD + y, P(item.string), win.width);
  }
  if (scrollbar) {
    drawThumb(win, sw);
  }
}

export function W_SetSensitive(w: Ptr | null, v: number): void {
  let win = w ? $cast(struct_window, w) : G.myroot;
  win.insensitive = !v ? 1 : 0;
  if (win.type === WIN_SCROLL) {
    redrawScrolling(win);
  }
}

export function W_MakeMenu(name: Ptr | null, x$: number, y$: number, width$: number, height$: number, parent$: Ptr | null, border: number): Ptr | null {
  const x = new Int32Array(1);
  x[0] = x$;
  const y = new Int32Array(1);
  y[0] = y$;
  const width = new Int32Array(1);
  width[0] = width$;
  const height = new Int32Array(1);
  height[0] = height$;
  const parent = [null];
  parent[0] = parent$;
  let newwin = null;
  let items = null;
  let wparent = 0;
  let i = 0;
  let attrs = new struct_XSetWindowAttributes();
  checkGeometry(name, P(x, 0), P(y, 0), P(width, 0), P(height, 0));
  checkParent(name, P(parent, 0));
  wparent = (parent[0] ? $cast(struct_window, parent[0]) : G.myroot).window;
  attrs.border_pixel = $u64(G.colortable[G.W_White].pixelValue);
  attrs.event_mask = KeyPressMask | ButtonPressMask | ExposureMask;
  attrs.background_pixel = $u64(G.colortable[G.W_Black].pixelValue);
  attrs.do_not_propagate_mask = KeyPressMask | ButtonPressMask | ExposureMask;
  newwin = newWindow(XCreateWindow(G.W_Display, wparent, x[0], y[0], Math.imul(width[0], G.W_Textwidth) + WIN_EDGE * 2 >>> 0, Math.imul(height[0], G.W_Textheight + MENU_PAD * 2) + Math.imul(height[0] - 1, MENU_BAR) >>> 0, border >>> 0, CopyFromParent, InputOutput, null, CWBackPixel | CWEventMask | CWBorderPixel, attrs), WIN_MENU);
  class_hint.res_name = name;
  XSetClassHint(G.W_Display, newwin.window, class_hint);
  XSetWMHints(G.W_Display, newwin.window, wm_hint);
  XStoreName(G.W_Display, newwin.window, name);
  newwin.name = strdup(name);
  items = $sarr(struct_menuItem, $u64(height[0]) * 24 / 24)[0];
  if (!items) {
    fprintf(R.stderr, S("W_MakeMenu fail to allocate menuItem"));
    exit(1);
  }
  for (i = 0; i < height[0]; ++i) {
    $sadd(items, i).column = 0;
    $sadd(items, i).string = P(new Int8Array(MAX_TEXT_WIDTH));
    $sadd(items, i).color = G.W_White;
  }
  newwin.data = $bytes(items);
  newwin.width = width[0];
  newwin.height = height[0];
  if (wparent !== G.W_Root) {
    if (checkMapped(name)) {
      W_MapWindow($bytes(newwin));
    }
  }
  XSetWindowColormap(G.W_Display, newwin.window, G.W_Colormap);
  return $bytes(newwin);
}

export function redrawMenu(win: struct_window | null): void {
  let count = 0;
  for (count = 1; count < win.height; ++count) {
    XFillRectangle(G.W_Display, win.drawable, G.colortable[G.W_Grey].contexts[0], 0, Math.imul(count, G.W_Textheight + MENU_PAD * 2) + Math.imul(count - 1, MENU_BAR), Math.imul(win.width, G.W_Textwidth) + WIN_EDGE * 2 >>> 0, MENU_BAR);
  }
  for (count = 0; count < win.height; ++count) {
    redrawMenuItem(win, count);
  }
}

export function redrawMenuItem(win: struct_window | null, n: number): void {
  let items = null;
  items = $cast(struct_menuItem, win.data);
  XFillRectangle(G.W_Display, win.drawable, G.colortable[G.W_Black].contexts[0], WIN_EDGE, Math.imul(n, G.W_Textheight + MENU_PAD * 2 + MENU_BAR) + MENU_PAD, Math.imul(win.width, G.W_Textwidth) >>> 0, G.W_Textheight >>> 0);
  if ($sadd(items, n).string) {
    XDrawImageString(G.W_Display, win.drawable, G.colortable[$sadd(items, n).color].contexts[1], WIN_EDGE + Math.imul(G.W_Textwidth, $sadd(items, n).column), Math.imul(n, G.W_Textheight + MENU_PAD * 2 + MENU_BAR) + MENU_PAD + G.fonts[1].baseline, $sadd(items, n).string, strlen($sadd(items, n).string) | 0);
  }
}

function changeMenuItem(win: struct_window | null, col: number, n: number, str: Ptr | null, color: number): void {
  let items = null;
  items = $cast(struct_menuItem, win.data);
  memccpy($sadd(items, n).string, str, 0, 100 - 1);
  $wr($sadd(items, n).string, (MAX_TEXT_WIDTH - 1), 0);
  $sadd(items, n).color = color;
  $sadd(items, n).column = col;
  redrawMenuItem(win, n);
}

export function W_DefineMapcursor(window_: Ptr | null): void {
  let new_ = 0;
  const mapcursmaskbit = new Float64Array(1);
  let mapcursbit = 0;
  let win = window_ ? $cast(struct_window, window_) : G.myroot;
  let path = null;
  const w = new Int32Array(1);
  const h = new Int32Array(1);
  const xh = new Int32Array(1);
  const yh = new Int32Array(1);
  xh[0] = yh[0] = 5;
  W_DefineMapcursor$f.pixel = $u64(G.colortable[G.W_White].pixelValue);
  W_DefineMapcursor$b.pixel = $u64(G.colortable[G.W_Black].pixelValue);
  XQueryColor(G.W_Display, G.W_Colormap, W_DefineMapcursor$f);
  XQueryColor(G.W_Display, G.W_Colormap, W_DefineMapcursor$b);
  mapcursbit = XCreateBitmapFromData(G.W_Display, G.W_Root, P(mapcursor_bits), mapcursor_width, mapcursor_height);
  if (path = getdefault(S("mapCursorDef"))) {
    if (W_LoadBitmap(window_, path, P(mapcursmaskbit, 0), P(w, 0), P(h, 0), P(xh, 0), P(yh, 0)) !== 1) {
      mapcursmaskbit[0] = XCreateBitmapFromData(G.W_Display, G.W_Root, P(mapmask_bits), mapmask_width, mapmask_height);
      xh[0] = yh[0] = 5;
    } else {
      mapcursbit = XCreatePixmap(G.W_Display, win.window, w[0] >>> 0, h[0] >>> 0, 1);
      XFillRectangle(G.W_Display, mapcursbit, G.colortable[G.W_White].contexts[0], 0, 0, w[0] >>> 0, h[0] >>> 0);
    }
  } else {
    mapcursmaskbit[0] = XCreateBitmapFromData(G.W_Display, G.W_Root, P(mapmask_bits), mapmask_width, mapmask_height);
  }
  if (win.cursor) {
    XFreeCursor(G.W_Display, win.cursor);
  }
  new_ = XCreatePixmapCursor(G.W_Display, mapcursbit, mapcursmaskbit[0], W_DefineMapcursor$b, W_DefineMapcursor$f, xh[0] >>> 0, yh[0] >>> 0);
  XRecolorCursor(G.W_Display, new_, W_DefineMapcursor$b, W_DefineMapcursor$f);
  XDefineCursor(G.W_Display, win.window, new_);
  win.cursor = new_;
}

export function W_DefineLocalcursor(window_: Ptr | null): void {
  let new_ = 0;
  const localcursmaskbit = new Float64Array(1);
  let localcursbit = 0;
  let win = window_ ? $cast(struct_window, window_) : G.myroot;
  let path = null;
  const w = new Int32Array(1);
  const h = new Int32Array(1);
  const xh = new Int32Array(1);
  const yh = new Int32Array(1);
  xh[0] = yh[0] = 5;
  W_DefineLocalcursor$f.pixel = $u64(G.colortable[G.W_White].pixelValue);
  W_DefineLocalcursor$b.pixel = $u64(G.colortable[G.W_Black].pixelValue);
  XQueryColor(G.W_Display, G.W_Colormap, W_DefineLocalcursor$f);
  XQueryColor(G.W_Display, G.W_Colormap, W_DefineLocalcursor$b);
  localcursbit = XCreateBitmapFromData(G.W_Display, G.W_Root, P(localcursor_bits), localcursor_width, localcursor_height);
  if (path = getdefault(S("localCursorDef"))) {
    if (W_LoadBitmap(window_, path, P(localcursmaskbit, 0), P(w, 0), P(h, 0), P(xh, 0), P(yh, 0)) !== 1) {
      localcursmaskbit[0] = XCreateBitmapFromData(G.W_Display, G.W_Root, P(localmask_bits), localmask_width, localmask_height);
      xh[0] = yh[0] = 5;
    } else {
      localcursbit = XCreatePixmap(G.W_Display, win.window, w[0] >>> 0, h[0] >>> 0, 1);
      XFillRectangle(G.W_Display, localcursbit, G.colortable[G.W_White].contexts[0], 0, 0, w[0] >>> 0, h[0] >>> 0);
    }
  } else {
    localcursmaskbit[0] = XCreateBitmapFromData(G.W_Display, G.W_Root, P(localmask_bits), localmask_width, localmask_height);
  }
  if (win.cursor) {
    XFreeCursor(G.W_Display, win.cursor);
  }
  new_ = XCreatePixmapCursor(G.W_Display, localcursbit, localcursmaskbit[0], W_DefineLocalcursor$b, W_DefineLocalcursor$f, xh[0] >>> 0, yh[0] >>> 0);
  XRecolorCursor(G.W_Display, new_, W_DefineLocalcursor$b, W_DefineLocalcursor$f);
  XDefineCursor(G.W_Display, win.window, new_);
  win.cursor = new_;
}

export function W_DefineFedCursor(window_: Ptr | null): void {
  let new_ = 0;
  let fedcursmaskbit = 0;
  let fedcursbit = 0;
  let win = window_ ? $cast(struct_window, window_) : G.myroot;
  W_DefineFedCursor$f.pixel = $u64(G.colortable[G.W_White].pixelValue);
  W_DefineFedCursor$b.pixel = $u64(G.colortable[G.W_Black].pixelValue);
  XQueryColor(G.W_Display, G.W_Colormap, W_DefineFedCursor$f);
  XQueryColor(G.W_Display, G.W_Colormap, W_DefineFedCursor$b);
  fedcursbit = XCreateBitmapFromData(G.W_Display, G.W_Root, P(fed_cruiser_bits), fed_cruiser_width, fed_cruiser_height);
  fedcursmaskbit = XCreateBitmapFromData(G.W_Display, G.W_Root, P(fed_mask_bits), fed_mask_width, fed_mask_height);
  if (win.cursor) {
    XFreeCursor(G.W_Display, win.cursor);
  }
  new_ = XCreatePixmapCursor(G.W_Display, fedcursmaskbit, fedcursbit, W_DefineFedCursor$b, W_DefineFedCursor$f, 10, 10);
  XRecolorCursor(G.W_Display, new_, W_DefineFedCursor$b, W_DefineFedCursor$f);
  XDefineCursor(G.W_Display, win.window, new_);
  win.cursor = new_;
}

export function W_DefineRomCursor(window_: Ptr | null): void {
  let new_ = 0;
  let romcursmaskbit = 0;
  let romcursbit = 0;
  let win = window_ ? $cast(struct_window, window_) : G.myroot;
  W_DefineRomCursor$f.pixel = $u64(G.colortable[G.W_White].pixelValue);
  W_DefineRomCursor$b.pixel = $u64(G.colortable[G.W_Black].pixelValue);
  XQueryColor(G.W_Display, G.W_Colormap, W_DefineRomCursor$f);
  XQueryColor(G.W_Display, G.W_Colormap, W_DefineRomCursor$b);
  romcursbit = XCreateBitmapFromData(G.W_Display, G.W_Root, P(rom_cruiser_bits), rom_cruiser_width, rom_cruiser_height);
  romcursmaskbit = XCreateBitmapFromData(G.W_Display, G.W_Root, P(rom_mask_bits), rom_cruiser_width, rom_cruiser_height);
  if (win.cursor) {
    XFreeCursor(G.W_Display, win.cursor);
  }
  new_ = XCreatePixmapCursor(G.W_Display, romcursmaskbit, romcursbit, W_DefineRomCursor$b, W_DefineRomCursor$f, 10, 10);
  XRecolorCursor(G.W_Display, new_, W_DefineRomCursor$b, W_DefineRomCursor$f);
  XDefineCursor(G.W_Display, win.window, new_);
  win.cursor = new_;
}

export function W_DefineKliCursor(window_: Ptr | null): void {
  let new_ = 0;
  let klicursmaskbit = 0;
  let klicursbit = 0;
  let win = window_ ? $cast(struct_window, window_) : G.myroot;
  W_DefineKliCursor$f.pixel = $u64(G.colortable[G.W_White].pixelValue);
  W_DefineKliCursor$b.pixel = $u64(G.colortable[G.W_Black].pixelValue);
  XQueryColor(G.W_Display, G.W_Colormap, W_DefineKliCursor$f);
  XQueryColor(G.W_Display, G.W_Colormap, W_DefineKliCursor$b);
  klicursbit = XCreateBitmapFromData(G.W_Display, G.W_Root, P(kli_cruiser_bits), kli_cruiser_width, kli_cruiser_height);
  klicursmaskbit = XCreateBitmapFromData(G.W_Display, G.W_Root, P(fed_mask_bits), kli_cruiser_width, kli_cruiser_height);
  if (win.cursor) {
    XFreeCursor(G.W_Display, win.cursor);
  }
  new_ = XCreatePixmapCursor(G.W_Display, klicursmaskbit, klicursbit, W_DefineKliCursor$b, W_DefineKliCursor$f, 10, 10);
  XRecolorCursor(G.W_Display, new_, W_DefineKliCursor$b, W_DefineKliCursor$f);
  XDefineCursor(G.W_Display, win.window, new_);
  win.cursor = new_;
}

export function W_DefineOriCursor(window_: Ptr | null): void {
  let new_ = 0;
  let oricursmaskbit = 0;
  let oricursbit = 0;
  let win = window_ ? $cast(struct_window, window_) : G.myroot;
  W_DefineOriCursor$f.pixel = $u64(G.colortable[G.W_White].pixelValue);
  W_DefineOriCursor$b.pixel = $u64(G.colortable[G.W_Black].pixelValue);
  XQueryColor(G.W_Display, G.W_Colormap, W_DefineOriCursor$f);
  XQueryColor(G.W_Display, G.W_Colormap, W_DefineOriCursor$b);
  oricursbit = XCreateBitmapFromData(G.W_Display, G.W_Root, P(ori_cruiser_bits), ori_cruiser_width, ori_cruiser_height);
  oricursmaskbit = XCreateBitmapFromData(G.W_Display, G.W_Root, P(fed_mask_bits), ori_cruiser_width, ori_cruiser_height);
  if (win.cursor) {
    XFreeCursor(G.W_Display, win.cursor);
  }
  new_ = XCreatePixmapCursor(G.W_Display, oricursmaskbit, oricursbit, W_DefineOriCursor$b, W_DefineOriCursor$f, 10, 10);
  XRecolorCursor(G.W_Display, new_, W_DefineOriCursor$b, W_DefineOriCursor$f);
  XDefineCursor(G.W_Display, win.window, new_);
  win.cursor = new_;
}

export function W_DefineTrekCursor(window_: Ptr | null): void {
  let new_ = 0;
  let win = window_ ? $cast(struct_window, window_) : G.myroot;
  let f = new struct_XColor();
  let b = new struct_XColor();
  let path = null;
  const w = new Int32Array(1);
  const h = new Int32Array(1);
  const xh = new Int32Array(1);
  const yh = new Int32Array(1);
  const mw = new Int32Array(1);
  const mh = new Int32Array(1);
  const mxh = new Int32Array(1);
  const myh = new Int32Array(1);
  f.pixel = $u64(G.colortable[G.W_Yellow].pixelValue);
  b.pixel = $u64(G.colortable[G.W_Black].pixelValue);
  XQueryColor(G.W_Display, G.W_Colormap, f);
  XQueryColor(G.W_Display, G.W_Colormap, b);
  if (win.cursor) {
    XFreeCursor(G.W_Display, win.cursor);
  }
  if (path = getdefault(S("infoCursorDef"))) {
    const pm = new Float64Array(1);
    const mpm = new Float64Array(1);
    if (W_LoadBitmap(window_, path, P(pm, 0), P(w, 0), P(h, 0), P(xh, 0), P(yh, 0)) !== 1) {
      new_ = XCreateFontCursor(G.W_Display, XC_trek);
    } else {
      let mask_path = new Int8Array(512);
      strcpy(P(mask_path), path);
      strcat(P(mask_path), S(".mask"));
      if (W_LoadBitmap(window_, P(mask_path), P(mpm, 0), P(mw, 0), P(mh, 0), P(mxh, 0), P(myh, 0)) !== 1) {
        mw[0] = w[0];
        mh[0] = h[0];
        mpm[0] = XCreatePixmap(G.W_Display, win.window, w[0] >>> 0, h[0] >>> 0, 1);
        XFillRectangle(G.W_Display, mpm[0], G.colortable[G.W_White].contexts[0], 0, 0, w[0] >>> 0, h[0] >>> 0);
      }
      if (w[0] !== mw[0] || h[0] !== mh[0]) {
        printf(S("Cursor and mask are not the same size. %s\n"), path);
        new_ = XCreateFontCursor(G.W_Display, XC_trek);
      } else {
        new_ = XCreatePixmapCursor(G.W_Display, pm[0], mpm[0], b, f, xh[0] >>> 0, yh[0] >>> 0);
      }
    }
  } else {
    new_ = XCreateFontCursor(G.W_Display, XC_trek);
  }
  XRecolorCursor(G.W_Display, new_, f, b);
  XDefineCursor(G.W_Display, win.window, new_);
  win.cursor = new_;
}

export function W_DefineWarningCursor(window_: Ptr | null): void {
  let new_ = 0;
  let win = window_ ? $cast(struct_window, window_) : G.myroot;
  let f = new struct_XColor();
  let b = new struct_XColor();
  f.pixel = $u64(G.colortable[G.W_Red].pixelValue);
  b.pixel = $u64(G.colortable[G.W_Black].pixelValue);
  XQueryColor(G.W_Display, G.W_Colormap, f);
  XQueryColor(G.W_Display, G.W_Colormap, b);
  if (win.cursor) {
    XFreeCursor(G.W_Display, win.cursor);
  }
  new_ = XCreateFontCursor(G.W_Display, XC_pirate);
  XRecolorCursor(G.W_Display, new_, f, b);
  XDefineCursor(G.W_Display, win.window, new_);
  win.cursor = new_;
}

export function W_DefineArrowCursor(window_: Ptr | null): void {
  let new_ = 0;
  let win = window_ ? $cast(struct_window, window_) : G.myroot;
  let f = new struct_XColor();
  let b = new struct_XColor();
  let path = null;
  const w = new Int32Array(1);
  const h = new Int32Array(1);
  const xh = new Int32Array(1);
  const yh = new Int32Array(1);
  const mw = new Int32Array(1);
  const mh = new Int32Array(1);
  const mxh = new Int32Array(1);
  const myh = new Int32Array(1);
  f.pixel = $u64(G.colortable[G.W_Black].pixelValue);
  b.pixel = $u64(G.colortable[G.W_White].pixelValue);
  XQueryColor(G.W_Display, G.W_Colormap, f);
  XQueryColor(G.W_Display, G.W_Colormap, b);
  if (win.cursor) {
    XFreeCursor(G.W_Display, win.cursor);
  }
  if (path = getdefault(S("arrowCursorDef"))) {
    const pm = new Float64Array(1);
    const mpm = new Float64Array(1);
    if (W_LoadBitmap(window_, path, P(pm, 0), P(w, 0), P(h, 0), P(xh, 0), P(yh, 0)) !== 1) {
      new_ = XCreateFontCursor(G.W_Display, XC_left_ptr);
    } else {
      let mask_path = new Int8Array(512);
      strcpy(P(mask_path), path);
      strcat(P(mask_path), S(".mask"));
      if (W_LoadBitmap(window_, P(mask_path), P(mpm, 0), P(mw, 0), P(mh, 0), P(mxh, 0), P(myh, 0)) !== 1) {
        mw[0] = w[0];
        mh[0] = h[0];
        mpm[0] = XCreatePixmap(G.W_Display, win.window, w[0] >>> 0, h[0] >>> 0, 1);
        XFillRectangle(G.W_Display, mpm[0], G.colortable[G.W_White].contexts[0], 0, 0, w[0] >>> 0, h[0] >>> 0);
      }
      if (w[0] !== mw[0] || h[0] !== mh[0]) {
        printf(S("Cursor and mask are not the same size. %s\n"), path);
        new_ = XCreateFontCursor(G.W_Display, XC_left_ptr);
      } else {
        new_ = XCreatePixmapCursor(G.W_Display, pm[0], mpm[0], b, f, xh[0] >>> 0, yh[0] >>> 0);
      }
    }
  } else {
    new_ = XCreateFontCursor(G.W_Display, XC_left_ptr);
  }
  XRecolorCursor(G.W_Display, new_, f, b);
  XDefineCursor(G.W_Display, win.window, new_);
  win.cursor = new_;
}

export function W_DefineTextCursor(window_: Ptr | null): void {
  let new_ = 0;
  let win = window_ ? $cast(struct_window, window_) : G.myroot;
  let f = new struct_XColor();
  let b = new struct_XColor();
  let path = null;
  const w = new Int32Array(1);
  const h = new Int32Array(1);
  const xh = new Int32Array(1);
  const yh = new Int32Array(1);
  const mw = new Int32Array(1);
  const mh = new Int32Array(1);
  const mxh = new Int32Array(1);
  const myh = new Int32Array(1);
  f.pixel = $u64(G.colortable[G.W_Yellow].pixelValue);
  b.pixel = $u64(G.colortable[G.W_Black].pixelValue);
  XQueryColor(G.W_Display, G.W_Colormap, f);
  XQueryColor(G.W_Display, G.W_Colormap, b);
  if (win.cursor) {
    XFreeCursor(G.W_Display, win.cursor);
  }
  if (path = getdefault(S("textCursorDef"))) {
    const pm = new Float64Array(1);
    const mpm = new Float64Array(1);
    if (W_LoadBitmap(window_, path, P(pm, 0), P(w, 0), P(h, 0), P(xh, 0), P(yh, 0)) !== 1) {
      new_ = XCreateFontCursor(G.W_Display, XC_xterm);
    } else {
      let mask_path = new Int8Array(512);
      strcpy(P(mask_path), path);
      strcat(P(mask_path), S(".mask"));
      if (W_LoadBitmap(window_, P(mask_path), P(mpm, 0), P(mw, 0), P(mh, 0), P(mxh, 0), P(myh, 0)) !== 1) {
        mw[0] = w[0];
        mh[0] = h[0];
        mpm[0] = XCreatePixmap(G.W_Display, win.window, w[0] >>> 0, h[0] >>> 0, 1);
        XFillRectangle(G.W_Display, mpm[0], G.colortable[G.W_White].contexts[0], 0, 0, w[0] >>> 0, h[0] >>> 0);
      }
      if (w[0] !== mw[0] || h[0] !== mh[0]) {
        printf(S("Cursor and mask are not the same size. %s\n"), path);
        new_ = XCreateFontCursor(G.W_Display, XC_xterm);
      } else {
        new_ = XCreatePixmapCursor(G.W_Display, pm[0], mpm[0], b, f, xh[0] >>> 0, yh[0] >>> 0);
      }
    }
  } else {
    new_ = XCreateFontCursor(G.W_Display, XC_xterm);
  }
  XRecolorCursor(G.W_Display, new_, f, b);
  XDefineCursor(G.W_Display, win.window, new_);
  win.cursor = new_;
}

export function W_DefineCursor(window_: Ptr | null, width: number, height: number, bits: Ptr | null, mask: Ptr | null, xhot: number, yhot: number): void {
  let cursbits = 0;
  let cursmask = 0;
  let win = null;
  let whiteCol = new struct_XColor();
  let blackCol = new struct_XColor();
  win = window_ ? $cast(struct_window, window_) : G.myroot;
  whiteCol.pixel = $u64(G.colortable[G.W_White].pixelValue);
  XQueryColor(G.W_Display, G.W_Colormap, whiteCol);
  blackCol.pixel = $u64(G.colortable[G.W_Black].pixelValue);
  XQueryColor(G.W_Display, G.W_Colormap, blackCol);
  if (!W_DefineCursor$oldbits || !$peq(W_DefineCursor$oldbits, bits)) {
    cursbits = XCreateBitmapFromData(G.W_Display, G.W_Root, bits, width >>> 0, height >>> 0);
    cursmask = XCreateBitmapFromData(G.W_Display, G.W_Root, mask, width >>> 0, height >>> 0);
    W_DefineCursor$oldbits = bits;
    W_DefineCursor$curs = XCreatePixmapCursor(G.W_Display, cursbits, cursmask, whiteCol, blackCol, xhot >>> 0, yhot >>> 0);
    XFreePixmap(G.W_Display, cursbits);
    XFreePixmap(G.W_Display, cursmask);
  }
  XDefineCursor(G.W_Display, win.window, W_DefineCursor$curs);
}

export function W_LoadBitmap(window_: Ptr | null, path: Ptr | null, pixmap: Ptr | null, width: Ptr | null, height: Ptr | null, x_hot: Ptr | null, y_hot: Ptr | null): number {
  let status = 0;
  status = XReadBitmapFile(G.W_Display, G.W_Root, path, width, height, pixmap, x_hot, y_hot);
  if (status === BitmapSuccess) {
    if (x_hot.a[x_hot.o] < 0) {
      x_hot.a[x_hot.o] = width.a[width.o] / 2 | 0;
      y_hot.a[y_hot.o] = height.a[height.o] / 2 | 0;
    }
    return 1;
  } else {
    return 0;
  }
}

export function W_Beep(): void {
  XBell(G.W_Display, 0);
}

export function W_WindowWidth(window_: Ptr | null): number {
  return (window_ ? $cast(struct_window, window_) : G.myroot).width;
}

export function W_WindowHeight(window_: Ptr | null): number {
  return (window_ ? $cast(struct_window, window_) : G.myroot).height;
}

export function W_Socket(): number {
  return $cast(anon_Xlib_h_489, G.W_Display).fd;
}

export function W_DestroyWindow(window_: Ptr | null): void {
  let win = null;
  win = window_ ? $cast(struct_window, window_) : G.myroot;
  free(win.name);
  free(win.data);
  deleteWindow(win);
  XDestroyWindow(G.W_Display, win.window);
  if (win.buffer) {
    XFreePixmap(G.W_Display, win.buffer);
  }
  if (win.background) {
    XFreePixmap(G.W_Display, win.background);
  }
  free($bytes(win));
}

export function deleteWindow(window_: struct_window | null): void {
  let rm = null;
  let temp = null;
  rm = P(G.hashtable, (window_.window | 0) % 101);
  while (!!rm.a[rm.o] && rm.a[rm.o].window !== window_) {
    rm = P(rm.a[rm.o], "next");
  }
  if (!rm.a[rm.o]) {
    printf(S("Attempt to delete non-existent window!\n"));
    return;
  }
  temp = rm.a[rm.o];
  rm.a[rm.o] = temp.next;
  free($bytes(temp));
}

export function W_SetIconWindow(main: Ptr | null, icon: Ptr | null): void {
  let hints = new struct_XWMHints();
  XSetIconName(G.W_Display, (icon ? $cast(struct_window, icon) : G.myroot).window, (main ? $cast(struct_window, main) : G.myroot).name);
  hints.flags = IconWindowHint;
  hints.icon_window = (icon ? $cast(struct_window, icon) : G.myroot).window;
  hints.window_group = (main ? $cast(struct_window, main) : G.myroot).window;
  hints.flags = hints.flags | WindowGroupHint;
  XSetCommand(G.W_Display, (main ? $cast(struct_window, main) : G.myroot).window, G.wm_argv, G.wm_argc);
  XSetWMHints(G.W_Display, (main ? $cast(struct_window, main) : G.myroot).window, hints);
}

function scrollUp(win: struct_window | null, y: number): void {
  let sw = $cast(struct_scrollingWindow, win.data);
  let savedlines = sw.lines - win.height;
  if (savedlines < 0) {
    savedlines = 0;
  }
  if (sw.topline + savedlines > 0) {
    if (!sw.index) {
      fprintf(R.stderr, S("scroll error, NULL index (scrollUp).\n"));
      return;
    }
    sw.index = sw.index.next;
    --sw.topline;
    redrawScrolling(win);
  }
}

function scrollDown(win: struct_window | null, y: number): void {
  let sw = $cast(struct_scrollingWindow, win.data);
  if (sw.topline < 0) {
    if (!sw.index) {
      fprintf(R.stderr, S("scroll error, NULL index (scrollDown).\n"));
      return;
    }
    sw.index = sw.index.prev;
    ++sw.topline;
    redrawScrolling(win);
  }
}

function scrollPosition(win: struct_window | null, y: number): void {
  let sw = $cast(struct_scrollingWindow, win.data);
  let savedlines = 0;
  let maxrow = 0;
  let winheight = 0;
  let newtop = 0;
  savedlines = sw.lines - win.height;
  if (savedlines < 0) {
    savedlines = 0;
  }
  maxrow = sw.lines < win.height ? sw.lines : win.height;
  winheight = Math.imul(win.height, G.W_Textheight) + MENU_PAD * 2;
  newtop = (Math.imul(y, savedlines + maxrow + 1) / winheight | 0) - savedlines;
  if (newtop < -savedlines) {
    newtop = -savedlines;
  } else if (newtop > 0) {
    newtop = 0;
  }
  scrollTo(win, sw, newtop);
}

function scrollTo(win: struct_window | null, sw: struct_scrollingWindow | null, topline: number): void {
  while (topline < sw.topline) {
    if (!sw.index) {
      fprintf(R.stderr, S("scroll error, NULL index (1).\n"));
      break;
    }
    sw.index = sw.index.next;
    --sw.topline;
  }
  while (topline > sw.topline) {
    if (!sw.index) {
      fprintf(R.stderr, S("scroll error, NULL index (2).\n"));
      break;
    }
    sw.index = sw.index.prev;
    ++sw.topline;
  }
  redrawScrolling(win);
}

function scrollScrolling(wevent: struct_event | null): void {
  switch (wevent.key) {
  case 3:
  case 4:
    scrollUp(wevent.Window ? $cast(struct_window, wevent.Window) : G.myroot, wevent.y);
    break;
  case 1:
  case 5:
    scrollDown(wevent.Window ? $cast(struct_window, wevent.Window) : G.myroot, wevent.y);
    break;
  case 2:
    scrollPosition(wevent.Window ? $cast(struct_window, wevent.Window) : G.myroot, wevent.y);
    break;
  default:
    break;
  }
}

function configureScrolling(win: struct_window | null, x: number, y: number, width: number, height: number): void {
  let new_text_width = 0;
  let new_text_height = 0;
  let new_real_width = 0;
  let new_real_height = 0;
  let wa = new struct_XWindowAttributes();
  let sw = scrollbar ? scroll_thumb_width : 0;
  XGetWindowAttributes(G.W_Display, win.window, wa);
  new_text_width = (wa.width - WIN_EDGE * 2 - sw) / G.W_Textwidth | 0;
  new_text_height = (wa.height - MENU_PAD * 2) / G.W_Textheight | 0;
  if (new_text_width <= 0) {
    new_text_width = 1;
  }
  if (new_text_height <= 0) {
    new_text_height = 1;
  }
  if (new_text_width >= MAX_TEXT_WIDTH) {
    new_text_width = MAX_TEXT_WIDTH - 1;
  }
  new_real_width = Math.imul(new_text_width, G.W_Textwidth) + WIN_EDGE * 2 + sw;
  new_real_height = Math.imul(new_text_height, G.W_Textheight) + MENU_PAD * 2;
  if (new_real_height !== wa.height || new_real_width !== wa.width) {
    XResizeWindow(G.W_Display, win.window, new_real_width >>> 0, new_real_height >>> 0);
  }
  win.width = new_text_width;
  win.height = new_text_height;
}

function checkGeometry(name: Ptr | null, x: Ptr | null, y: Ptr | null, width: Ptr | null, height: Ptr | null): number {
  let buf = new Int8Array(80);
  let geom_default = null;
  sprintf(P(buf), S("%s.geometry"), name);
  geom_default = getdefault(P(buf));
  if (!geom_default) {
    return 0;
  }
  return XParseGeometry(geom_default, x, y, width, height);
}

export function checkParent(name: Ptr | null, parent: Ptr | null): void {
  let adefault = null;
  let buf = new Int8Array(100);
  let i = 0;
  let windows = null;
  sprintf(P(buf), S("%s.parent"), name);
  adefault = getdefault(P(buf));
  if (!adefault) {
    return;
  }
  if (strcmpi(adefault, S("root")) === 0) {
    parent.a[parent.o] = $bytes(G.myroot);
    return;
  }
  for (i = 0; i < HASHSIZE; ++i) {
    windows = G.hashtable[i];
    while (!!windows) {
      if (strcmpi(adefault, windows.window.name) === 0) {
        parent.a[parent.o] = $bytes(windows.window);
        return;
      }
      windows = windows.next;
    }
  }
}

export function checkMapped(name: Ptr | null): number {
  let buf = new Int8Array(100);
  sprintf(P(buf), S("%s.mapped"), name);
  return booleanDefault(P(buf), 0);
}

export function checkMappedPref(name: Ptr | null, preferred: number): number {
  let buf = new Int8Array(100);
  sprintf(P(buf), S("%s.mapped"), name);
  return booleanDefault(P(buf), preferred);
}

export function W_WarpPointer(window_: Ptr | null, x: number, y: number): void {
  if (!window_) {
    if (G.W_in_message) {
      XWarpPointer(G.W_Display, None, G.W_Root, 0, 0, 0, 0, W_WarpPointer$warped_from_x[0], W_WarpPointer$warped_from_y[0]);
      G.W_in_message = 0;
    }
  } else {
    findMouse(P(W_WarpPointer$warped_from_x, 0), P(W_WarpPointer$warped_from_y, 0));
    XWarpPointer(G.W_Display, None, (window_ ? $cast(struct_window, window_) : G.myroot).window, 0, 0, 0, 0, 0, 0);
    G.W_in_message = 1;
  }
}

export function findMouse(x: Ptr | null, y: Ptr | null): void {
  const theRoot = new Float64Array(1);
  const theChild = new Float64Array(1);
  const wX = new Int32Array(1);
  const wY = new Int32Array(1);
  const rootX = new Int32Array(1);
  const rootY = new Int32Array(1);
  let status = 0;
  const wButtons = new Uint32Array(1);
  status = XQueryPointer(G.W_Display, G.W_Root, P(theRoot, 0), P(theChild, 0), P(rootX, 0), P(rootY, 0), P(wX, 0), P(wY, 0), P(wButtons, 0));
  if (status === True) {
    x.a[x.o] = wX[0];
    y.a[y.o] = wY[0];
  } else {
    x.a[x.o] = 0;
    y.a[y.o] = 0;
  }
}

export function findMouseInWin(x: Ptr | null, y: Ptr | null, w: Ptr | null): number {
  const theRoot = new Float64Array(1);
  const theChild = new Float64Array(1);
  const wX = new Int32Array(1);
  const wY = new Int32Array(1);
  const rootX = new Int32Array(1);
  const rootY = new Int32Array(1);
  let status = 0;
  const wButtons = new Uint32Array(1);
  let win = w ? $cast(struct_window, w) : G.myroot;
  let thisWin = win.window;
  status = XQueryPointer(G.W_Display, thisWin, P(theRoot, 0), P(theChild, 0), P(rootX, 0), P(rootY, 0), P(wX, 0), P(wY, 0), P(wButtons, 0));
  if (status === True) {
    if (wX[0] <= win.width && wY[0] <= win.height) {
      x.a[x.o] = wX[0];
      y.a[y.o] = wY[0];
      return 1;
    }
  }
  x.a[x.o] = 0;
  y.a[y.o] = 0;
  return 0;
}

export function W_Flush(): void {
  XFlush(G.W_Display);
}

export function W_ProbeLatency(w: Ptr | null): void {
  let tv = new struct_timeval();
  let win = w ? $cast(struct_window, w) : G.myroot;
  let event = new union__XEvent();
  gettimeofday(tv, null);
  let now = $u64(tv.tv_sec * 1000000 + tv.tv_usec);
  event.xclient.type = ClientMessage;
  event.xclient.message_type = 0;
  event.xclient.format = 32;
  event.xclient.display = G.W_Display;
  event.xclient.window = win.window;
  event.xclient.data.l[0] = 1;
  event.xclient.data.l[1] = 2;
  event.xclient.data.l[2] = (now & 4294967295) >>> 0;
  event.xclient.data.l[3] = ($shr64(now, 32) & 4294967295) >>> 0;
  XSendEvent(G.W_Display, win.window, False, NoEventMask, event);
}

export function W_GetWindowKeyDownHandler(w: Ptr | null): Function | null {
  return (w ? $cast(struct_window, w) : G.myroot).handle_keydown;
}

export function W_SetWindowKeyDownHandler(w: Ptr | null, c: Function | null): void {
  (w ? $cast(struct_window, w) : G.myroot).handle_keydown = c;
}

export function W_GetWindowKeyUpHandler(w: Ptr | null): Function | null {
  return (w ? $cast(struct_window, w) : G.myroot).handle_keyup;
}

export function W_SetWindowKeyUpHandler(w: Ptr | null, c: Function | null): void {
  (w ? $cast(struct_window, w) : G.myroot).handle_keyup = c;
}

export function W_GetWindowButtonHandler(w: Ptr | null): Function | null {
  return (w ? $cast(struct_window, w) : G.myroot).handle_button;
}

export function W_SetWindowButtonHandler(w: Ptr | null, c: Function | null): void {
  (w ? $cast(struct_window, w) : G.myroot).handle_button = c;
}

export function W_GetWindowExposeHandler(w: Ptr | null): Function | null {
  return (w ? $cast(struct_window, w) : G.myroot).handle_expose;
}

export function W_SetWindowExposeHandler(w: Ptr | null, c: Function | null): void {
  (w ? $cast(struct_window, w) : G.myroot).handle_expose = c;
}

export function W_ResizeWindow(window_: Ptr | null, neww: number, newh: number): void {
  let w = window_ ? $cast(struct_window, window_) : G.myroot;
  let sz_hints = null;
  sz_hints = XAllocSizeHints();
  sz_hints.min_width = neww;
  sz_hints.max_width = neww;
  sz_hints.min_height = newh;
  sz_hints.max_height = newh;
  sz_hints.flags = PMinSize | PMaxSize;
  XSetWMNormalHints(G.W_Display, w.window, sz_hints);
  XFree(sz_hints);
  XResizeWindow(G.W_Display, w.window, neww >>> 0, newh >>> 0);
}

export function W_ReinitMenu(window_: Ptr | null, neww: number, newh: number): void {
  let win = window_ ? $cast(struct_window, window_) : G.myroot;
  let items = null;
  let i = 0;
  items = $cast(struct_menuItem, win.data);
  for (i = 0; i < win.height; ++i) {
    free($sadd(items, i).string);
  }
  free($bytes(items));
  items = $sarr(struct_menuItem, $u64(newh) * 24 / 24)[0];
  if (!items) {
    fprintf(R.stderr, S("W_ReinitMenu fail to allocate menuItem"));
    exit(1);
  }
  for (i = 0; i < newh; ++i) {
    $sadd(items, i).column = 0;
    $sadd(items, i).string = P(new Int8Array(MAX_TEXT_WIDTH));
    $sadd(items, i).color = G.W_White;
  }
  win.data = $bytes(items);
}

export function W_DestroyMenu(window_: Ptr | null): void {
  let win = window_ ? $cast(struct_window, window_) : G.myroot;
  let items = null;
  let i = 0;
  items = $cast(struct_menuItem, win.data);
  for (i = 0; i < win.height; ++i) {
    free($sadd(items, i).string);
  }
  free($bytes(items));
  win.data = null;
  W_DestroyWindow(window_);
}

export function W_ResizeMenu(window_: Ptr | null, neww: number, newh: number): void {
  let w = window_ ? $cast(struct_window, window_) : G.myroot;
  w.width = neww;
  w.height = newh;
  W_ResizeWindow(window_, Math.imul(neww, G.W_Textwidth) + WIN_EDGE * 2, Math.imul(newh, G.W_Textheight + MENU_PAD * 2) + Math.imul(newh - 1, MENU_BAR));
}

export function W_ResizeTextWindow(window_: Ptr | null, neww: number, newh: number): void {
  W_ResizeWindow(window_, Math.imul(neww, G.W_Textwidth) + WIN_EDGE * 2, Math.imul(newh, G.W_Textheight) + WIN_EDGE * 2);
}

export function W_Mono(): number {
  return $sadd($cast(anon_Xlib_h_489, G.W_Display).screens, G.W_Screen).root_visual.map_entries <= 2 || G.forceMono ? 1 : 0;
}

export function W_EventsQueued(): number {
  return XEventsQueued(G.W_Display, QueuedAlready);
}

export function W_EventsQueuedCk(): number {
  return $cast(anon_Xlib_h_489, G.W_Display).qlen;
}

export async function W_ReadEvents(): Promise<number> {
  let $t1: any, $t2: any;
  let event = new union__XEvent();
  let timeout = struct_timeval.$of();
  let readfds = new struct_fd_set();
  do {
    let __i = 0;
    let __arr = readfds;
    for (__i = 0; __i < Math.trunc(128 / 8); __i = __i + 1 >>> 0) {
      __arr.__fds_bits[__i] = 0;
    }
  } while (0);
  ($t1 = readfds.__fds_bits, $t2 = $cast(anon_Xlib_h_489, G.W_Display).fd / (8 * 8) | 0, $t1[$t2] = $t1[$t2] | $shl64(1, $cast(anon_Xlib_h_489, G.W_Display).fd % (8 * 8)));
  if (await select(G.max_fd, readfds, null, null, timeout) === 1) {
    await XPeekEvent(G.W_Display, event);
    return 1;
  }
  return 0;
}

export function W_OverlayBitmap(x: number, y: number, bit: Ptr | null, color: number): void {
  let icon = $cast(struct_icon, bit);
  XCopyPlane(G.W_Display, icon.bitmap, icon.window, G.colortable[color].contexts[0], 0, 0, icon.width >>> 0, icon.height >>> 0, x, y, 1);
}

export function W_SetWindowName(w: Ptr | null, name: Ptr | null): void {
  let win = w ? $cast(struct_window, w) : G.myroot;
  XStoreName(G.W_Display, win.window, name);
  return;
}

export function W_TTSTextHeight(): number {
  return _tts_th;
}

export function W_TTSTextWidth(s: Ptr | null, l: number): number {
  return XTextWidth(_tts_fontinfo, s, l);
}

export function init_tts(): void {
  let fontname = null;
  let values = new struct_XGCValues();
  let color = null;
  let xc = new struct_XColor();
  fontname = getdefault(S("tts_font"));
  if (!fontname) {
    fontname = S("10x20");
  }
  _tts_fontinfo = XLoadQueryFont(G.W_Display, fontname);
  if (!_tts_fontinfo) {
    fprintf(R.stderr, S("netrek: Can't find font \"%s\".\n"), fontname);
    _tts_fontinfo = XLoadQueryFont(G.W_Display, S("fixed"));
  }
  if (!_tts_fontinfo) {
    fprintf(R.stderr, S("netrek: Can't find any fonts.\n"));
    terminate(1);
  }
  _tts_th = _tts_fontinfo.max_bounds.descent + _tts_fontinfo.max_bounds.ascent;
  _tts_tw = _tts_fontinfo.max_bounds.width;
  values.font = _tts_fontinfo.fid;
  if (G.forceMono || $sadd($cast(anon_Xlib_h_489, G.W_Display).screens, G.W_Screen).root_visual.map_entries <= 2) {
    values.foreground = $u64(G.colortable[G.W_White].pixelValue);
    values.function = GXor;
  } else {
    color = getdefault(S("tts_color"));
    if (!color) {
      color = S("grey");
    }
    if (!XParseColor(G.W_Display, G.W_Colormap, color, xc)) {
      fprintf(R.stderr, S("netrek: Unknown tts_color \"%s\", using #777\n"), color);
      XParseColor(G.W_Display, G.W_Colormap, S("#777"), xc);
    }
    xc.pixel = (($u64(G.colortable[G.W_Black].pixelValue) | planes[0]) >>> 0 | planes[2]) >>> 0;
    if (G.takeNearest || G.W_Visual.class !== PseudoColor) {
      XAllocColor(G.W_Display, G.W_Colormap, xc);
    } else {
      XStoreColor(G.W_Display, G.W_Colormap, xc);
    }
    values.foreground = xc.pixel;
    values.function = GXor;
  }
  _tts_gc = XCreateGC(G.W_Display, G.W_Root, GCFont | GCForeground | GCFunction, values);
  XSetGraphicsExposures(G.W_Display, _tts_gc, False);
}

export function W_EraseTTSText(window_: Ptr | null, max_width: number, y: number, width: number): void {
  let x = (max_width - width) / 2 | 0;
  if (x < 0) {
    x = 4;
  }
  y -= W_TTSTextHeight();
  W_ClearArea(window_, x, y, width, W_TTSTextHeight());
}

export function W_WriteTTSText(window_: Ptr | null, max_width: number, y: number, width: number, str: Ptr | null, len: number): void {
  let win = window_ ? $cast(struct_window, window_) : G.myroot;
  let x = (max_width - width) / 2 | 0;
  if (x < 0) {
    x = 4;
  }
  y -= _tts_fontinfo.max_bounds.descent;
  XDrawString(G.W_Display, win.drawable, _tts_gc, x, y, str, len);
}

export function W_Halo(x: number, y: number, color: number): void {
  let win = G.mapw ? $cast(struct_window, G.mapw) : G.myroot;
  if (color !== G.W_Ind && color !== G.W_Grey) {
    XSetForeground(G.W_Display, G.colortable[color].contexts[0], $u64(G.colortable[color].pixelValue));
    XDrawArc(G.W_Display, win.drawable, G.colortable[color].contexts[0], x - (mplanet_width / 2 | 0), y - (mplanet_width / 2 | 0), mplanet_width, mplanet_height, 0, 23040);
  }
}

export function W_CameraSnap(window_: Ptr | null): void {
  let win = window_ ? $cast(struct_window, window_) : G.myroot;
  camera_snap(G.W_Display, win.window);
}

function video_mode_off(): void {
  if (G.video_mode_current !== G.video_mode_original) {
    XF86VidModeSwitchToMode(G.W_Display, G.W_Screen, G.video_mode_original);
    G.video_mode_current = G.video_mode_original;
  }
}

function video_mode_initialise(): number {
  const major = new Int32Array(1);
  const minor = new Int32Array(1);
  if (!XF86VidModeQueryVersion(G.W_Display, P(major, 0), P(minor, 0))) {
    fprintf(R.stderr, S("video_mode_initialise: XFree86-VidMode X extension absent\n"));
    return 0;
  }
  if (video_mode_initialise$done) {
    return 1;
  }
  ++video_mode_initialise$done;
  let line = 0;
  let current = new struct_XF86VidModeModeLine();
  XF86VidModeGetModeLine(G.W_Display, G.W_Screen, P(G, "video_mode_dotclock"), current);
  XF86VidModeGetAllModeLines(G.W_Display, G.W_Screen, P(G, "video_mode_list_size"), P(G, "video_mode_list"));
  G.video_mode_current = null;
  for (line = 0; line < G.video_mode_list_size; ++line) {
    let mode = G.video_mode_list.a[G.video_mode_list.o + line];
    if (mode.hdisplay === current.hdisplay && mode.vdisplay === current.vdisplay && mode.dotclock === G.video_mode_dotclock >>> 0 && mode.htotal === current.htotal && mode.vtotal === current.vtotal && mode.flags === current.flags) {
      G.video_mode_original = G.video_mode_current = mode;
    }
  }
  if (!G.video_mode_current) {
    fprintf(R.stderr, S("video_mode_begin: this mode not found, cannot switch back, so not switching\n"));
    return 0;
  }
  return 1;
}

function video_mode_on(): void {
  let line = 0;
  for (line = 0; line < G.video_mode_list_size; ++line) {
    let mode = G.video_mode_list.a[G.video_mode_list.o + line];
    if (mode.hdisplay === (G.small_screen ? 800 : 1024) && mode.vdisplay === (G.small_screen ? 600 : 768)) {
      XF86VidModeSwitchToMode(G.W_Display, G.W_Screen, mode);
      G.video_mode_current = mode;
      return;
    }
  }
}

function view_port_warp(window_: Ptr | null): void {
  let win = window_ ? $cast(struct_window, window_) : G.myroot;
  const tx = new Int32Array(1);
  tx[0] = 0;
  const ty = new Int32Array(1);
  ty[0] = 0;
  const child = new Float64Array(1);
  XTranslateCoordinates(G.W_Display, win.window, G.W_Root, 0, 0, P(tx, 0), P(ty, 0), P(child, 0));
  XF86VidModeSetViewPort(G.W_Display, G.W_Screen, tx[0], ty[0]);
  XMapRaised(G.W_Display, win.window);
  XRaiseWindow(G.W_Display, win.window);
}

function pointer_grab_on(window_: Ptr | null): void {
  let win = window_ ? $cast(struct_window, window_) : G.myroot;
  XGrabPointer(G.W_Display, win.window, True, ButtonPressMask | ButtonReleaseMask | EnterWindowMask | LeaveWindowMask | PointerMotionMask | PointerMotionHintMask | Button1MotionMask | Button2MotionMask | Button3MotionMask | Button4MotionMask | Button5MotionMask | ButtonMotionMask | KeymapStateMask, GrabModeAsync, GrabModeAsync, win.window, None, CurrentTime);
  XGrabKeyboard(G.W_Display, win.window, True, GrabModeAsync, GrabModeAsync, CurrentTime);
  XFlush(G.W_Display);
}

function pointer_grab_off(window_: Ptr | null): void {
  XUngrabPointer(G.W_Display, CurrentTime);
  XUngrabKeyboard(G.W_Display, CurrentTime);
}

function kde_fullscreen_on(window_: Ptr | null): void {
  let win = window_ ? $cast(struct_window, window_) : G.myroot;
  let WM_HINTS = 0;
  WM_HINTS = XInternAtom(G.W_Display, S("_NET_WM_STATE"), True);
  if (WM_HINTS !== None) {
    let p = new Float64Array(1);
    p[0] = XInternAtom(G.W_Display, S("_NET_WM_STATE_FULLSCREEN"), True);
    XChangeProperty(G.W_Display, win.window, WM_HINTS, XA_ATOM, 32, PropModeReplace, $pcast(P(p), 1, false, false), 1);
  }
}

function kde_fullscreen_off(window_: Ptr | null): void {
  let win = window_ ? $cast(struct_window, window_) : G.myroot;
  let WM_HINTS = 0;
  WM_HINTS = XInternAtom(G.W_Display, S("_NET_WM_STATE"), True);
  if (WM_HINTS !== None) {
    XDeleteProperty(G.W_Display, win.window, WM_HINTS);
  }
}

export function W_FullScreenOn(window_: Ptr | null): void {
  let win = window_ ? $cast(struct_window, window_) : G.myroot;
  XResizeWindow(G.W_Display, win.window, (G.small_screen ? 800 : 1024) >>> 0, (G.small_screen ? 600 : 768) >>> 0);
  XMoveWindow(G.W_Display, win.window, 0, 0);
  video_mode_on();
  view_port_warp(window_);
  kde_fullscreen_on(window_);
  pointer_grab_on(window_);
}

export function W_FullScreenOff(window_: Ptr | null): void {
  pointer_grab_off(window_);
  kde_fullscreen_off(window_);
  video_mode_off();
}

export function W_FullScreenInitialise(): void {
  G.full_screen_enabled = 0;
  G.full_screen_default = 0;
  if (booleanDefault(S("FullScreen"), 0)) {
    ++G.full_screen_default;
    if (video_mode_initialise()) {
      ++G.full_screen_enabled;
    }
  }
}

export function W_FullScreenToggle(window_: Ptr | null): number {
  if (G.full_screen_enabled) {
    G.full_screen_enabled = 0;
    W_FullScreenOff(window_);
  } else {
    if (!G.full_screen_default) {
      if (!video_mode_initialise()) {
        return FULLSCREEN_FAILED;
      }
    }
    ++G.full_screen_enabled;
    W_FullScreenOn(window_);
  }
  return FULLSCREEN_OK;
}

export function W_FullScreenBegin(window_: Ptr | null): void {
  if (G.full_screen_enabled) {
    W_FullScreenOn(window_);
  }
}

export function W_FullScreen(window_: Ptr | null): void {
  if (G.full_screen_enabled) {
    view_port_warp(window_);
    pointer_grab_on(window_);
  }
}

export function W_Deinitialize(): void {
  for (let i = 0; i < FONTS; ++i) {
    let xfs = G.fonts[i].xfs;
    if (xfs) {
      XFreeFont(G.W_Display, xfs);
    }
  }
  XFreeFont(G.W_Display, _tts_fontinfo);
  for (let i = 0; $u64(i) < Math.trunc(1248 / 104); ++i) {
    XFreeGC(G.W_Display, G.colortable[i].contexts[0]);
    XFreeGC(G.W_Display, G.colortable[i].contexts[1]);
    XFreeGC(G.W_Display, G.colortable[i].contexts[2]);
    XFreeGC(G.W_Display, G.colortable[i].contexts[3]);
    XFreeGC(G.W_Display, G.colortable[i].insens_contexts[1]);
    XFreeGC(G.W_Display, G.colortable[i].contexts[BITGC]);
  }
  XCloseDisplay(G.W_Display);
}

export function $init(): void {
  fed_cruiser_bits = $ta(Int8Array, 60, [0, 15, 0, -128, 31, 0, -64, 63, 0, -64, 63, 0, -64, 63, 0, -128, 31, 0, 0, 15, 0, 64, 38, 0, 64, 38, 0, 64, 47, 0, -64, 63, 0, -64, 54, 0, 64, 38, 0, 64, 32, 0, 64, 32, 0, 64, 32, 0, 64, 32]);
  fed_mask_bits = new Int8Array(60);
  rom_cruiser_bits = $ta(Int8Array, 39, [0, 0, 0, 0, 0, 0, 4, -128, 0, 4, -128, 0, 28, -32, 0, -4, -1, 0, -4, -1, 0, -12, -65, 0, -12, -65, 0, -28, -97, 0, -60, -113, 0, -124, -121]);
  rom_mask_bits = new Int8Array(39);
  ori_cruiser_bits = $ta(Int8Array, 54, [0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 15, 0, 0, 15, 0, 0, 15, 0, 0, 6, 0, 0, 6, 0, 32, 79, 0, 32, 79, 0, 48, -49, 0, -80, -33, 0, -16, -1, 0, -16, -10, 0, -80, -48, 0, 48, -49, 0, 32, 64, 0, 32, 64]);
  kli_cruiser_bits = $ta(Int8Array, 54, [0, 0, 0, 0, 0, 0, 0, 0, 0, 32, -128, 0, 32, -118, 0, -96, -65, 0, -32, -1, 0, -32, -1, 0, -32, -1, 0, 32, -114, 0, 0, 4, 0, 0, 4, 0, 0, 4, 0, 0, 4, 0, 0, 4, 0, 0, 14, 0, 0, 31, 0, 0, 14]);
  mapcursor_bits = new Int8Array(22);
  mapmask_bits = $ta(Int8Array, 22, [1, 4, 2, 2, 0, 0, 0, 0, 32, 0, 112, 0, 32, 0, 0, 0, 0, 0, 2, 2, 1, 4]);
  localcursor_bits = new Int8Array(22);
  localmask_bits = $ta(Int8Array, 22, [32, 0, 32, 0, 36, 1, 32, 0, 32, 0, -33, 7, 32, 0, 32, 0, 36, 1, 32, 0, 32]);
  G.forceMono = 0;
  _nfonts = [S("6x10"),
S("-*-clean-medium-r-normal--10-100-75-75-c-60-*"),
S("fixed"),
null];
  _bfonts = [S("-*-clean-bold-r-normal--10-100-75-75-c-60-*"),
S("-*-clean-bold-r-normal--10-100-75-75-c-60-*"),
S("fixed"),
null];
  _ifonts = [S("-*-clean-bold-r-normal--10-100-75-75-c-60-*"),
S("-*-clean-bold-r-normal--10-100-75-75-c-60-*"),
S("fixed"),
null];
  _bgfonts = [S("-*-lucidatypewriter-*-*-*-*-40-*-*-*-*-*-*-*"),
S("fixed"),
S("fixed"),
null];
  zero = new Int32Array(1);
  zero[0] = 0;
  one = new Int32Array(1);
  one[0] = 1;
  two = new Int32Array(1);
  two[0] = 2;
  three = new Int32Array(1);
  three[0] = 3;
  G.W_FastClear = 0;
  G.W_Root = 0;
  G.W_Colormap = 0;
  G.W_Screen = 0;
  G.W_Visual = null;
  G.W_BigFont = $pcast(P(zero, 0), 1, true, false);
  G.W_RegularFont = $pcast(P(one, 0), 1, true, false);
  G.W_HighlightFont = $pcast(P(two, 0), 1, true, false);
  G.W_UnderlineFont = $pcast(P(three, 0), 1, true, false);
  G.W_Display = null;
  G.W_White = WHITE;
  G.W_Black = BLACK;
  G.W_Red = RED;
  G.W_Green = GREEN;
  G.W_Yellow = YELLOW;
  G.W_Cyan = CYAN;
  G.W_Grey = GREY;
  G.W_Ind = C_IND;
  G.W_Fed = C_FED;
  G.W_Rom = C_ROM;
  G.W_Kli = C_KLI;
  G.W_Ori = C_ORI;
  G.W_BigTextwidth = 0;
  G.W_BigTextheight = 0;
  G.W_Textwidth = 0;
  G.W_Textheight = 0;
  G.W_in_message = 0;
  planes = new Float64Array(4);
  scrollbar = 1;
  scroll_thumb_width = SCROLL_THUMB_WIDTH;
  scroll_thumb_gc = null;
  scroll_thumb_pixmap = 0;
  scroll_lines = 100;
  G.wm_protocols = 0;
  G.wm_delete_window = 0;
  class_hint = struct_XClassHint.$of(S("netrek"), S("Netrek"));
  wm_hint = struct_XWMHints.$of(InputHint | StateHint, True, NormalState, None, None, 0, 0, None, None);
  G.wm_argv = null;
  G.wm_argc = 0;
  W_myevent = new struct_event();
  W_isEvent = 0;
  G.insens_tile = 0;
  G.colortable = $sarrOf([struct_colors.$of(S("white"), new Array(5).fill(null), new Array(5).fill(null)),
struct_colors.$of(S("black"), new Array(5).fill(null), new Array(5).fill(null)),
struct_colors.$of(S("red"), new Array(5).fill(null), new Array(5).fill(null)),
struct_colors.$of(S("green"), new Array(5).fill(null), new Array(5).fill(null)),
struct_colors.$of(S("yellow"), new Array(5).fill(null), new Array(5).fill(null)),
struct_colors.$of(S("cyan"), new Array(5).fill(null), new Array(5).fill(null)),
struct_colors.$of(S("dark grey"), new Array(5).fill(null), new Array(5).fill(null)),
struct_colors.$of(S("Rom"), new Array(5).fill(null), new Array(5).fill(null)),
struct_colors.$of(S("Kli"), new Array(5).fill(null), new Array(5).fill(null)),
struct_colors.$of(S("Fed"), new Array(5).fill(null), new Array(5).fill(null)),
struct_colors.$of(S("Ori"), new Array(5).fill(null), new Array(5).fill(null)),
struct_colors.$of(S("Ind"), new Array(5).fill(null), new Array(5).fill(null))]);
  G.hashtable = new Array(101).fill(null);
  G.fonts = $sarr(struct_fontInfo, 4);
  G.myroot = new struct_window();
  gray = $ta(Int8Array, 32, [-86, -86, 85, 85, -86, -86, 85, 85, -86, -86, 85, 85, -86, -86, 85, 85, -86, -86, 85, 85, -86, -86, 85, 85, -86, -86, 85, 85, -86, -86, 85, 85]);
  striped = $ta(Int8Array, 32, [0, -1, 0, -1, 0, -1, 0, -1, -16, 15, -16, 15, -16, 15, -16, 15, -1, 0, -1, 0, -1, 0, -1, 0, 15, -16, 15, -16, 15, -16, 15, -16]);
  solid = $ta(Int8Array, 32, [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]);
  G.full_screen_default = 0;
  G.full_screen_enabled = 0;
  extrared = $ta(Uint16Array, 16, [0, 32, 64, 96, 128, 160, 176, 192]);
  extragreen = $ta(Uint16Array, 16, [64, 96, 128, 160, 176, 192, 0, 32]);
  extrablue = $ta(Uint16Array, 16, [128, 160, 176, 192, 0, 32, 64, 96]);
  _rcache = $sarr(struct_XRectangle, 128);
  _rcache_index = 0;
  _lcache = $arr(12, () => $sarr(struct_XSegment, 128));
  _lcache_index = new Int32Array(12);
  _tts_gc = null;
  _tts_fontinfo = null;
  _tts_th = 0;
  _tts_tw = 0;
  G.video_mode_list = null;
  G.video_mode_current = null;
  G.video_mode_original = null;
  G.video_mode_dotclock = 0;
  G.video_mode_list_size = 0;
  WMXYHintMode_default$fetched = 0;
  WMXYHintMode_default$WMXYHM_default = 0;
  W_SpNextEvent$prev_x = 0;
  W_SpNextEvent$prev_y = 0;
  W_DefineMapcursor$f = new struct_XColor();
  W_DefineMapcursor$b = new struct_XColor();
  W_DefineLocalcursor$f = new struct_XColor();
  W_DefineLocalcursor$b = new struct_XColor();
  W_DefineFedCursor$f = new struct_XColor();
  W_DefineFedCursor$b = new struct_XColor();
  W_DefineRomCursor$f = new struct_XColor();
  W_DefineRomCursor$b = new struct_XColor();
  W_DefineKliCursor$f = new struct_XColor();
  W_DefineKliCursor$b = new struct_XColor();
  W_DefineOriCursor$f = new struct_XColor();
  W_DefineOriCursor$b = new struct_XColor();
  W_DefineCursor$oldbits = null;
  W_DefineCursor$curs = 0;
  W_WarpPointer$warped_from_x = new Int32Array(1);
  W_WarpPointer$warped_from_x[0] = 0;
  W_WarpPointer$warped_from_y = new Int32Array(1);
  W_WarpPointer$warped_from_y[0] = 0;
  video_mode_initialise$done = 0;
}
