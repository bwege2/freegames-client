// x11/xdefault.c: the X options (colours, textures, geometry, fonts, mouse) and opening the display.
import { G } from './G.ts';
import { sys } from './sys.ts';
import { FONT_LEN, XP_OPTFLAG_CONFIG_DEFAULT, XP_OPTFLAG_DEFAULT, XP_OPTFLAG_KEEP, MAX_DISP_LEN, MAX_VISUAL_NAME } from './consts.ts';
import { ref, Set_option, STORE_OPTIONS, XP_BOOL_OPTION, XP_INT_OPTION, XP_STRING_OPTION, xp_option_origin_default, type xp_option_t } from './option.ts';
import { onReset, sprintf, strlcpy, strncasecmp, strtokAll } from './cutil.ts';
import { warn } from './error.ts';
import { Colors_free_bitmaps, Colors_init_bitmaps } from './colors.ts';
import { Scale_dashes } from './xinit.ts';
import { Config_redraw } from './configure.ts';
import { Bitmap_update_scale } from './bitmaps.ts';

const GAME_FONT = '-*-fixed-bold-*-*--13-*-*-*-c-*-iso8859-1';
const TALK_FONT = '-*-fixed-bold-*-*--15-*-*-*-c-*-iso8859-1';

const X = { displayName: '', keyboardName: '', geometryBuf: '' };
onReset(() => Object.assign(X, { displayName: '', keyboardName: '', geometryBuf: '' }));

function Set_fullColor(_o: xp_option_t | null, val: boolean): boolean {
  if (val === G.fullColor) return true;
  if (val) {
    G.fullColor = true;
    if (Colors_init_bitmaps() === -1) {
      warn('Unable to enable fullColor.');
      G.fullColor = false;
    }
  } else {
    Colors_free_bitmaps();
    G.fullColor = false;
    Set_texturedObjects(null, false);
  }
  G.scoresChanged = 1;
  return true;
}

function Set_texturedObjects(_o: xp_option_t | null, val: boolean): boolean {
  if (val === G.texturedObjects) return true;
  if (val) {
    G.texturedObjects = true;
    if (!G.fullColor) {
      warn('Unable to enable texturedObjects without fullColor on.');
      G.texturedObjects = false;
    }
  } else G.texturedObjects = false;
  return true;
}

function Set_fontName(opt: xp_option_t, val: string): boolean {
  const name = strtokAll(val, ' \t\r\n')[0];
  if (!name) return false;
  (opt.private_data as (v: string) => void)(strlcpy(name, FONT_LEN));
  return true;
}

const g = <K extends keyof typeof G>(k: K) => ref(() => G, k);

function font(name: string, k: 'gameFontName' | 'scoreListFontName' | 'buttonFontName' | 'textFontName' | 'talkFontName' | 'motdFontName' | 'messageFontName', def: string, help: string): xp_option_t {
  return XP_STRING_OPTION(name, def, g(k), FONT_LEN, Set_fontName, (v: string) => { G[k] = v; }, null, XP_OPTFLAG_DEFAULT, help);
}

export function Store_X_options(): void {
  const CD = XP_OPTFLAG_CONFIG_DEFAULT;
  STORE_OPTIONS([
    XP_BOOL_OPTION('fullColor', true, g('fullColor'), Set_fullColor, CD,
      'Whether to use a colors as close as possible to the specified ones\nor use a few standard colors for everything. May require more\nresources from your system.\n'),
    XP_BOOL_OPTION('texturedObjects', true, g('texturedObjects'), Set_texturedObjects, CD,
      'Whether to draw certain game objects with textures.\nBe warned that this requires more graphics speed.\nfullColor must be on for this to work.\nYou may also need to enable multibuffering or double-buffering.\n'),
    XP_STRING_OPTION('geometry', '1024x768', null, 0, (_o, v) => { G.geometry = v; return true; }, null,
      () => (X.geometryBuf = sprintf('%dx%d', G.top_width, G.top_height)), XP_OPTFLAG_DEFAULT,
      'Set the window size and position in standard X geometry format.\nThe maximum allowed window size is 1922x1440.\n'),
    XP_STRING_OPTION('display', '', ref(X, 'displayName'), MAX_DISP_LEN, null, null, null, XP_OPTFLAG_KEEP, 'Set the X display.\n'),
    XP_STRING_OPTION('keyboard', '', ref(X, 'keyboardName'), MAX_DISP_LEN, null, null, null, XP_OPTFLAG_KEEP,
      'Set the X keyboard input if you want keyboard input from\nanother display.  The default is to use the keyboard input from\nthe X display.\n'),
    XP_STRING_OPTION('visual', '', g('visualName'), MAX_VISUAL_NAME, null, null, null, XP_OPTFLAG_KEEP,
      'Specify which visual to use for allocating colors.\nTo get a listing of all possible visuals on your dislay\nset the argument for this option to list.\n'),
    XP_BOOL_OPTION('colorSwitch', true, g('colorSwitch'), null, XP_OPTFLAG_KEEP,
      'Use color buffering or not.\nUsually color buffering is faster, especially on 8-bit\nPseudoColor displays.\n'),
    XP_BOOL_OPTION('multibuffer', false, g('multibuffer'), null, XP_OPTFLAG_DEFAULT, 'Use the X windows multibuffer extension if present.\n'),
    XP_BOOL_OPTION('ignoreWindowManager', false, g('ignoreWindowManager'), null, XP_OPTFLAG_DEFAULT,
      'Ignore the window manager when opening the top level player window.\nThis can be handy if you want to have your XPilot window on a\npreferred position without window manager borders.\nAlso sometimes window managers may interfere when switching\ncolormaps. This option may prevent that.\n'),
    font('gameFont', 'gameFontName', GAME_FONT, 'The font used on the HUD and for most other text.\n'),
    font('scoreListFont', 'scoreListFontName', GAME_FONT, 'The font used on the score list.\nThis must be a non-proportional font.\n'),
    font('buttonFont', 'buttonFontName', GAME_FONT, 'The font used on all buttons.\n'),
    font('textFont', 'textFontName', GAME_FONT, 'The font used in the help and about windows.\n'),
    font('talkFont', 'talkFontName', TALK_FONT, 'The font used in the talk window.\n'),
    font('motdFont', 'motdFontName', GAME_FONT, 'The font used in the MOTD window and key list window.\nThis must be a non-proportional font.\n'),
    font('messageFont', 'messageFontName', GAME_FONT, 'The font used for drawing messages.\n'),
    XP_BOOL_OPTION('showNastyShots', false, ref(() => G.instruments, 'showNastyShots'), null, CD,
      'Use the Nasty Looking Shots instead of the round shots.\nYou will probably want to increase your shotSize if you use this.\n'),
    XP_BOOL_OPTION('mouseAccelInClient', true, g('mouseAccelInClient'), null, CD,
      'This option makes the client handle the mouse acceleration.\nOptions mouseAccelNum, mouseAccelDenom and mouseAccelThresh can\nbe used to fine tune the acceleration. The default values of these\nthree options give linear response to mouse movements.\n'),
    XP_INT_OPTION('mouseAccelNum', 0, 0, 10, g('new_acc_num'), (_o, v) => { if (v < 0) { G.new_acc_num = 0; return false; } G.new_acc_num = v; return true; }, CD,
      'Mouse acceleration numerator.\n'),
    XP_INT_OPTION('mouseAccelDenom', 1, 1, 10, g('new_acc_denom'), (_o, v) => { if (v < 0) { G.new_acc_denom = 1; return false; } G.new_acc_denom = v; return true; }, CD,
      'Mouse acceleration denominator.\n'),
    XP_INT_OPTION('mouseAccelThresh', 0, 0, 10, g('new_threshold'), (_o, v) => { if (v < 0) { G.new_threshold = 0; return false; } G.new_threshold = v; return true; }, CD,
      'Mouse acceleration threshold.\n'),
  ]);
}

/** Handle_X_options: the display (the platform's emulated X server) */
export function Handle_X_options(): void {
  if (X.displayName.length === 0) Set_option('display', ':0.0', xp_option_origin_default);
  G.dpy = sys.display;
  G.kdpy = null;
  if (strncasecmp(G.visualName, 'list', 4) === 0) warn('visual list is not supported');
  G.pre_exists = true;
  G.pre_acc_num = 2;
  G.pre_acc_denom = 1;
  G.pre_threshold = 4;
}

export function displayName(): string {
  return X.displayName;
}

export function Set_scaleFactor(_o: xp_option_t | null, val: number): boolean {
  G.clData.scaleFactor = val;
  G.clData.scale = 1.0 / val;
  G.clData.fscale = Math.fround(G.clData.scale);
  Scale_dashes();
  Config_redraw();
  Bitmap_update_scale();
  return true;
}

export function Set_altScaleFactor(_o: xp_option_t | null, val: number): boolean {
  G.clData.altScaleFactor = val;
  return true;
}
