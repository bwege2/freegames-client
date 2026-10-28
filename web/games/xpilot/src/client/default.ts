// default.c: the client's general options and their setters; common/checknames.c's name checks.
import { G } from './G.ts';
import { sys } from './sys.ts';
import {
  TEAM_NOT_SET, MAX_TEAMS, SERVER_PORT, MIN_PLAYER_POWER, MAX_PLAYER_POWER, MIN_PLAYER_TURNSPEED, MAX_PLAYER_TURNSPEED,
  MIN_PLAYER_TURNRESISTANCE, MAX_PLAYER_TURNRESISTANCE, MIN_SCALEFACTOR, MAX_SCALEFACTOR, MAX_SUPPORTED_FPS, MIN_SPARK_SIZE,
  MAX_SPARK_SIZE, MAX_SPARK_RAND, SHIP_SZ, MAX_NAME_LEN, MIN_SHOW_ITEMS_TIME, MAX_SHOW_ITEMS_TIME, MIN_SHOT_SIZE,
  MAX_SHOT_SIZE, MIN_TEAMSHOT_SIZE, MAX_TEAMSHOT_SIZE, MIN_MAP_POINT_SIZE, MAX_MAP_POINT_SIZE, MAX_MSGS, MAX_HIST_MSGS,
  XP_OPTFLAG_CONFIG_DEFAULT, XP_OPTFLAG_NEVER_SAVE, XP_OPTFLAG_KEEP, XP_OPTFLAG_DEFAULT, MIN_HUD_SIZE, CONTROL_TIME,
  MAX_POINTER_MOVES, MAX_HOST_LEN, MAX_CHARS, MAX_DISP_LEN,
} from './consts.ts';
import { isprint, isspace, isupper, islower, sprintf, strlcpy, toInt } from './cutil.ts';
import {
  ref, STORE_OPTIONS, XP_BOOL_OPTION, XP_DOUBLE_OPTION, XP_INT_OPTION, XP_NOARG_OPTION, XP_STRING_OPTION, type xp_option_t,
} from './option.ts';
import { warn, xpprintf } from './error.ts';
import { Send_power, Send_power_s, Send_turnspeed, Send_turnspeed_s, Send_turnresistance, Send_turnresistance_s } from './netclient.ts';
import { Validate_shape_str } from './shipshape.ts';
import { Set_auto_shield, Set_toggle_shield } from './event.ts';
import { Check_client_fps } from './client.ts';
import { Check_view_dimensions } from './paint.ts';
import { Paint_sliding_radar, Paint_world_radar } from './paintradar.ts';
import { Set_scaleFactor, Set_altScaleFactor } from './xdefault.ts';
import { onReset } from './cutil.ts';

// ---------------------------------------------------------------- checknames.c

const isgraph = (c: string) => c.charCodeAt(0) > 0x20 && c.charCodeAt(0) < 0x7f;
const PROT_EXT = '~';

export function Check_user_name(name: string): boolean {
  if (name.length > MAX_NAME_LEN - 1 || !name.length) return false;
  for (const c of name) if (!isgraph(c)) return false;
  return true;
}

export function Fix_user_name(name: string): string {
  if (name.length > MAX_NAME_LEN - 1) name = name.slice(0, MAX_NAME_LEN - 1);
  if (!name.length) return 'X';
  return [...name].map((c) => (isgraph(c) ? c : 'x')).join('');
}

export function Check_nick_name(name: string): boolean {
  if (name.length > MAX_NAME_LEN - 1 || !name.length) return false;
  if (!isupper(name[0])) return false;
  for (const c of name) if (!isprint(c) || c === PROT_EXT) return false;
  if (isspace(name[name.length - 1])) return false;
  return true;
}

let fixNickN = 0;
onReset(() => { fixNickN = 0; });

export function Fix_nick_name(name: string): string {
  if (name.length > MAX_NAME_LEN - 1) name = name.slice(0, MAX_NAME_LEN - 1);
  if (!name.length) return `X${fixNickN++}`;
  let s = [...name];
  if (!isupper(s[0])) s[0] = islower(s[0]) ? s[0].toUpperCase() : 'X';
  s = s.map((c) => (!isprint(c) || c === PROT_EXT ? 'x' : c));
  while (s.length && isspace(s[s.length - 1])) s.pop();
  return s.join('');
}

const alnum = (c: string | undefined) => !!c && /[A-Za-z0-9]/.test(c);

export function Check_host_name(name: string): boolean {
  if (name.length > MAX_HOST_LEN - 1) return false;
  if (!alnum(name[0])) return false;
  for (let i = 0; i < name.length; i++) {
    if (!alnum(name[i])) {
      if (name[i] === '.' || name[i] === '-') {
        if (name[i + 1] === '.' || name[i + 1] === '-' || name[i + 1] === undefined) return false;
      } else return false;
    }
  }
  return true;
}

export function Fix_host_name(name: string): string {
  if (name.length > MAX_HOST_LEN - 1) name = name.slice(0, MAX_HOST_LEN - 1);
  if (!alnum(name[0])) return 'xxx.xxx'.slice(0, 7);
  const s = [...name];
  for (let i = 0; i < s.length; i++) {
    if (!alnum(s[i])) {
      if (s[i] === '.' || s[i] === '-') {
        if (s[i + 1] === '.' || s[i + 1] === '-' || s[i + 1] === undefined) s[i] = 'x';
      } else s[i] = 'x';
    }
  }
  return s.join('');
}

// ---------------------------------------------------------------- setters

const D = { hudScale: 0, shipShapeSetting: null as string | null, shipShapeFile: null as string | null, protocolVersionStr: '' };
onReset(() => Object.assign(D, { hudScale: 0, shipShapeSetting: null, shipShapeFile: null, protocolVersionStr: '' }));

function Set_nickName(_opt: xp_option_t | null, value: string): boolean {
  if (value.length === 0) return true;
  let n = strlcpy(value, MAX_NAME_LEN);
  if (n[0] >= 'a' && n[0] <= 'z') n = n[0].toUpperCase() + n.slice(1);
  if (n[0] < 'A' || n[0] > 'Z') {
    warn(`Your player name "${n}" should start with an uppercase letter.`);
    n = 'X' + n.slice(1);
  }
  if (!Check_nick_name(n)) {
    const nick = n;
    n = Fix_nick_name(n);
    warn(`Fixing nick from "${nick}" to "${n}".`);
  }
  G.connectParam.nick_name = n;
  return true;
}

function Set_userName(_opt: xp_option_t, value: string): boolean {
  G.connectParam.user_name = strlcpy(sys.login, MAX_NAME_LEN);
  if (value.length > 0) G.connectParam.user_name = strlcpy(value, MAX_NAME_LEN);
  if (!Check_user_name(G.connectParam.user_name)) {
    const user = G.connectParam.user_name;
    G.connectParam.user_name = Fix_user_name(user);
    warn(`Fixing username from "${user}" to "${G.connectParam.user_name}".`);
  }
  if (G.connectParam.nick_name.length === 0) Set_nickName(null, G.connectParam.user_name);
  return true;
}

function Set_hostName(_opt: xp_option_t, value: string): boolean {
  G.connectParam.host_name = strlcpy(sys.hostname, 256);
  if (value.length > 0) G.connectParam.host_name = strlcpy(value, 256);
  if (!Check_host_name(G.connectParam.host_name)) {
    const host = G.connectParam.host_name;
    G.connectParam.host_name = Fix_host_name(host);
    warn(`Fixing host from "${host}" to "${G.connectParam.host_name}".`);
  }
  return true;
}

function Set_team(_opt: xp_option_t, value: number): boolean {
  G.connectParam.team = value >= 0 && value < MAX_TEAMS ? value : TEAM_NOT_SET;
  return true;
}

function Set_texturePath(_opt: xp_option_t, value: string): boolean {
  G.texturePath = value;
  if (G.realTexturePath === null) G.realTexturePath = value;
  return true;
}

/** tryToSetShipShape: the shape itself, or a name in the shipShapeFile (lib/shipshapes.txt) */
function tryToSetShipShape(): void {
  G.shipShape = null;
  const setting = D.shipShapeSetting;
  if (setting === null || setting.length === 0) return;
  if (setting.includes('(')) {
    if (Validate_shape_str(setting)) {
      G.shipShape = setting;
      xpprintf('Your shipShape is valid. Have a nice day.');
    } else warn("Your shipShape isn't valid. Please fix it.");
    return;
  }
  if (!D.shipShapeFile || D.shipShapeFile.length === 0) return;
  const data = sys.libFile(D.shipShapeFile);
  if (!data) {
    warn(`Can't open shipShapeFile "${D.shipShapeFile}".`);
    return;
  }
  let text = '';
  for (const b of data) text += String.fromCharCode(b);
  let candidate: string | null = null;
  for (const line0 of text.split('\n')) {
    const line = line0.slice(0, 1023);
    let k = line.indexOf('(name:');
    if (k < 0) k = line.indexOf('(NM:');
    if (k < 0) continue;
    let s = line.slice(line.indexOf(':', k) + 1);
    while (s[0] === ' ') s = s.slice(1);
    const close = s.indexOf(')');
    if (close >= 0) s = s.slice(0, close);
    if (s === setting) {
      candidate = line0 + (line0.endsWith('\n') ? '' : '\n');
      break;
    }
  }
  if (!candidate) {
    warn(`Could not find the ship "${setting}" in shipShapeFile ${D.shipShapeFile}.`);
    return;
  }
  if (Validate_shape_str(candidate)) {
    xpprintf(`Ship shape "${setting}" is now in use.`);
    G.shipShape = candidate;
  } else warn(`Your shipShape "${setting}" isn't valid. Please fix it.`);
}

function Set_power(_o: xp_option_t, val: number): boolean { Send_power(val); G.power = val; G.controlTime = CONTROL_TIME; return true; }
function Set_turnSpeed(_o: xp_option_t, val: number): boolean { Send_turnspeed(val); G.turnspeed = val; G.controlTime = CONTROL_TIME; return true; }
function Set_turnResistance(_o: xp_option_t, val: number): boolean { Send_turnresistance(val); G.turnresistance = val; return true; }
function Set_altPower(_o: xp_option_t, val: number): boolean { Send_power_s(val); G.power_s = val; G.controlTime = CONTROL_TIME; return true; }
function Set_altTurnSpeed(_o: xp_option_t, val: number): boolean { Send_turnspeed_s(val); G.turnspeed_s = val; G.controlTime = CONTROL_TIME; return true; }
function Set_altTurnResistance(_o: xp_option_t, val: number): boolean { Send_turnresistance_s(val); G.turnresistance_s = val; return true; }

function Set_maxMouseTurnsPS(_o: xp_option_t, val: number): boolean {
  G.maxMouseTurnsPS = val;
  if (G.maxMouseTurnsPS > 0) {
    G.mouseMovementInterval = Math.trunc(1000000 / G.maxMouseTurnsPS);
    if (G.mouseMovementInterval * G.maxMouseTurnsPS < 1000000) G.mouseMovementInterval++;
  }
  return true;
}

function Set_sparkProb(_o: xp_option_t, val: number): boolean {
  G.sparkProb = val;
  G.spark_rand = toInt(G.sparkProb * MAX_SPARK_RAND + 0.5);
  Check_view_dimensions();
  return true;
}

function Set_hudScale(_o: xp_option_t, value: number): boolean {
  D.hudScale = value;
  G.hudSize = toInt(MIN_HUD_SIZE * D.hudScale);
  return true;
}

function Set_dirPrediction(_o: xp_option_t, val: boolean): boolean {
  if (val) {
    if (!G.dirPrediction) {
      for (let m = 0; m < MAX_POINTER_MOVES; m++) G.pointer_moves[m].id = -1;
      G.pointer_move_next = 0;
      G.last_keyboard_ack = 0;
      G.dirPrediction = true;
    }
  } else G.dirPrediction = false;
  return true;
}

function Set_protocolVersion(_o: xp_option_t, value: string): boolean {
  const m = /^\s*(?:0[xX])?([0-9a-fA-F]+)/.exec(value);
  if (!m) return false;
  G.protocolVersion = parseInt(m[1], 16);
  return true;
}

const I = G.instruments;
void I;
const inst = <K extends keyof typeof G.instruments>(k: K) => ref(() => G.instruments, k);
const g = <K extends keyof typeof G>(k: K) => ref(() => G, k);
const cp = <K extends keyof typeof G.connectParam>(k: K) => ref(() => G.connectParam, k);
const cl = <K extends keyof typeof G.clData>(k: K) => ref(() => G.clData, k);
const xa = <K extends keyof typeof G.xpArgs>(k: K) => ref(() => G.xpArgs, k);
const dflt = <K extends keyof typeof D>(k: K) => ref(D, k);

function modBank(i: number) {
  return { get: () => G.modBankStr[i], set: (v: string) => { G.modBankStr[i] = v; } };
}

export function Store_default_options(): void {
  const CD = XP_OPTFLAG_CONFIG_DEFAULT;
  const ns = (s: string | null) => s ?? '';
  STORE_OPTIONS([
    XP_BOOL_OPTION('newbie', true, g('newbie'), null, CD, 'Enable newbie help.\n'),
    XP_NOARG_OPTION('help', xa('help'), XP_OPTFLAG_NEVER_SAVE, 'Display this help message.\n'),
    XP_NOARG_OPTION('version', xa('version'), XP_OPTFLAG_NEVER_SAVE, 'Show the source code version.\n'),
    XP_NOARG_OPTION('join', xa('auto_connect'), XP_OPTFLAG_NEVER_SAVE, 'Join the game immediately, no questions asked.\n'),
    XP_NOARG_OPTION('text', xa('text'), XP_OPTFLAG_NEVER_SAVE, 'Use the simple text interface to contact a server\ninstead of the graphical user interface.\n'),
    XP_NOARG_OPTION('list', xa('list_servers'), XP_OPTFLAG_NEVER_SAVE, 'List all servers running on the local network.\n'),
    XP_STRING_OPTION('shutdown', '', xa('shutdown_reason'), MAX_CHARS, null, null, null, XP_OPTFLAG_NEVER_SAVE,
      'Shutdown the server with a message.\nThe message used is the first argument to this option.\n'),
    XP_STRING_OPTION('name', '', null, 0, Set_nickName, null, () => G.connectParam.nick_name, XP_OPTFLAG_KEEP, 'Set the nickname.\n'),
    XP_STRING_OPTION('user', '', null, 0, Set_userName, null, () => G.connectParam.user_name, XP_OPTFLAG_KEEP, 'Set the username.\n'),
    XP_STRING_OPTION('host', '', null, 0, Set_hostName, null, () => G.connectParam.host_name, XP_OPTFLAG_KEEP, 'Set the hostname.\n'),
    XP_INT_OPTION('team', TEAM_NOT_SET, 0, TEAM_NOT_SET, cp('team'), Set_team, XP_OPTFLAG_KEEP, 'Set the team to join.\n'),
    XP_INT_OPTION('port', SERVER_PORT, 0, 65535, cp('contact_port'), null, XP_OPTFLAG_KEEP,
      'Set the port number of the server.\nAlmost all servers use the default port, which is the recommended\npolicy.  You can find out about which port is used by a server by\nquerying the XPilot Meta server.\n'),
    XP_INT_OPTION('clientPortStart', 0, 0, 65535, g('clientPortStart'), null, XP_OPTFLAG_KEEP, 'Use UDP ports clientPortStart - clientPortEnd (for firewalls).\n'),
    XP_INT_OPTION('clientPortEnd', 0, 0, 65535, g('clientPortEnd'), null, XP_OPTFLAG_KEEP, 'Use UDP ports clientPortStart - clientPortEnd (for firewalls).\n'),
    XP_DOUBLE_OPTION('power', 55.0, MIN_PLAYER_POWER, MAX_PLAYER_POWER, g('power'), Set_power, CD, 'Set the engine power.\nValid values are in the range 5-55.\n'),
    XP_DOUBLE_OPTION('turnSpeed', 16.0, MIN_PLAYER_TURNSPEED, MAX_PLAYER_TURNSPEED, g('turnspeed'), Set_turnSpeed, CD, "Set the ship's turn speed.\nValid values are in the range 4-64.\n"),
    XP_DOUBLE_OPTION('turnResistance', 0.0, MIN_PLAYER_TURNRESISTANCE, MAX_PLAYER_TURNRESISTANCE, g('turnresistance'), Set_turnResistance, CD,
      "Set the ship's turn resistance.\nThis determines the speed at which a ship stops turning.\nValid values are in the range 0.0-1.0.\nThis should always be 0, other values are for compatibility.\nSee also turnSpeed.\n"),
    XP_DOUBLE_OPTION('scaleFactor', 1.0, MIN_SCALEFACTOR, MAX_SCALEFACTOR, cl('scaleFactor'), Set_scaleFactor, CD, 'Specifies scaling factor for the drawing window.\n'),
    XP_DOUBLE_OPTION('altScaleFactor', 2.0, MIN_SCALEFACTOR, MAX_SCALEFACTOR, cl('altScaleFactor'), Set_altScaleFactor, CD, 'Specifies alternative scaling factor for the drawing window.\n'),
    XP_INT_OPTION('maxFPS', MAX_SUPPORTED_FPS, 1, MAX_SUPPORTED_FPS, g('maxFPS'), (_o, v) => { G.maxFPS = v; Check_client_fps(); return true; }, CD,
      'Set maximum FPS supported by the client. The server will try to\nsend at most this many frames per second to the client.\n'),
    XP_INT_OPTION('maxMouseTurnsPS', 0, 0, MAX_SUPPORTED_FPS * 2, g('maxMouseTurnsPS'), Set_maxMouseTurnsPS, CD,
      "Set maximum number of mouse turns sent per second\nSet to 0 to disable this feature (its mostly useful on modem)\n"),
    XP_INT_OPTION('sparkSize', 2, MIN_SPARK_SIZE, MAX_SPARK_SIZE, g('sparkSize'), null, CD, 'Size of sparks in pixels.\n'),
    XP_DOUBLE_OPTION('sparkProb', 0.4, 0.0, 1.0, g('sparkProb'), Set_sparkProb, CD,
      'The probablilty that sparks are drawn.\nThis gives a sparkling effect.\nValid values are in the range [0.0-1.0]\n'),
    XP_INT_OPTION('hudRadarDotSize', 10, 1, SHIP_SZ, g('hudRadarDotSize'), null, CD, 'Which size to use for drawing the hudradar dots.\n'),
    XP_DOUBLE_OPTION('hudRadarScale', 1.5, 0.5, 4.0, g('hudRadarScale'), null, CD, 'The relative size of the hudradar.\n'),
    XP_DOUBLE_OPTION('hudRadarLimit', 0.05, 0.05, 5.0, g('hudRadarLimit'), null, CD,
      'Hudradar dots closer than this to your ship are not drawn.\nA value of 1.0 means that the dots are not drawn for ships in\nyour active view area.\n'),
    XP_DOUBLE_OPTION('hudScale', 2.0, 1.0, 6.0, dflt('hudScale'), Set_hudScale, CD, 'How much larger than minimum size to draw the hud.\n'),
    XP_INT_OPTION('baseWarningType', 3, 0, 3, g('baseWarningType'), null, CD,
      'Which type of base warning you prefer.\nA value of 0 disables base warning.\nA value of 1 draws a time meter on a base when a ship is appearing.\nA value of 2 makes the base name flash when a ship is appearing.\nA value of 3 combines the effects of values 1 and 2.\n'),
    XP_INT_OPTION('maxCharsInNames', MAX_NAME_LEN, 0, MAX_NAME_LEN, g('maxCharsInNames'), null, CD, 'Maximum number of characters to paint in names on game area.\n'),
    XP_BOOL_OPTION('slidingRadar', true, inst('slidingRadar'), (_o, v) => { G.instruments.slidingRadar = v; Paint_sliding_radar(); return true; }, CD,
      'If the game is in edgewrap mode then the radar will keep your\nposition on the radar in the center and raw the rest of the radar\naround it.  Note that this requires a fast graphics system.\n'),
    XP_BOOL_OPTION('dirPrediction', true, g('dirPrediction'), Set_dirPrediction, CD,
      'Client paints the wanted direction of your ship instead of what\nthe server sent you. Possible differences are corrected in\nroundtrip time.\n'),
    XP_BOOL_OPTION('showShipShapes', true, inst('showShipShapes'), null, CD, "Should others' shipshapes be displayed or not.\n"),
    XP_BOOL_OPTION('showMyShipShape', true, inst('showMyShipShape'), null, CD, 'Should your own shipshape be displayed or not.\n'),
    XP_BOOL_OPTION('showShipShapesHack', false, inst('showShipShapesHack'), null, CD, 'Should the ship shapes hack be displayed or not.\n'),
    XP_BOOL_OPTION('showLivesByShip', false, inst('showLivesByShip'), null, CD, 'Paint remaining lives next to ships.\n'),
    XP_BOOL_OPTION('showMessages', true, inst('showMessages'), null, CD, 'Should game messages appear on screen.\n'),
    XP_BOOL_OPTION('showItems', true, inst('showItems'), null, CD, 'Should owned items be displayed permanently on the HUD?\n'),
    XP_DOUBLE_OPTION('showItemsTime', 5.0, MIN_SHOW_ITEMS_TIME, MAX_SHOW_ITEMS_TIME, g('showItemsTime'), null, CD,
      'If showItems is false, the time in seconds to display item\ninformation on the HUD when it has changed.\n'),
    XP_BOOL_OPTION('filledWorld', false, inst('filledWorld'), (_o, v) => { G.instruments.filledWorld = v; return true; }, CD,
      'Draws the walls solid, filled with one color,\nunless overridden by texture.\nBe warned that this option needs fast graphics.\n'),
    XP_BOOL_OPTION('texturedWalls', true, inst('texturedWalls'), (_o, v) => { G.instruments.texturedWalls = v; return true; }, CD,
      'Allows drawing polygon bitmaps specified by the (new-style) map.\nBe warned that this needs a reasonably fast graphics system.\n'),
    XP_STRING_OPTION('protocolVersion', '', null, 0, Set_protocolVersion, null,
      () => (D.protocolVersionStr = sprintf('%04x', G.protocolVersion)), XP_OPTFLAG_KEEP, 'Which protocol version to prefer when joining servers.\n'),
    XP_BOOL_OPTION('outlineWorld', false, inst('outlineWorld'), (_o, v) => { G.instruments.outlineWorld = v; return true; }, CD,
      'Draws only the outline of all the wall blocks\non block based maps.\n'),
    XP_BOOL_OPTION('showDecor', true, inst('showDecor'), (_o, v) => { G.instruments.showDecor = v; if (!G.Setup) return true; Paint_world_radar(); return true; }, CD,
      'Should decorations be displayed on the screen and radar?\n'),
    XP_BOOL_OPTION('outlineDecor', false, inst('outlineDecor'), null, CD, 'Draws only the outline of the map decoration.\n'),
    XP_BOOL_OPTION('filledDecor', false, inst('filledDecor'), null, CD, 'Draws filled decorations.\n'),
    XP_BOOL_OPTION('texturedDecor', false, inst('texturedDecor'), null, CD, 'Draws the map decoration filled with a texture pattern.\n'),
    XP_BOOL_OPTION('clientRanker', false, inst('clientRanker'), null, CD, 'Scan messages and make personal kill/death ranking.\n'),
    XP_BOOL_OPTION('clockAMPM', false, inst('clockAMPM'), null, CD, 'Use AMPM format for clock display instead of 24 hour format.\n'),
    XP_INT_OPTION('shotSize', 6, MIN_SHOT_SIZE, MAX_SHOT_SIZE, g('shotSize'), null, CD, 'The size of shots in pixels.\n'),
    XP_INT_OPTION('teamShotSize', 4, MIN_TEAMSHOT_SIZE, MAX_TEAMSHOT_SIZE, g('teamShotSize'), null, CD,
      'The size of team shots in pixels.\nNote that team shots are drawn in teamShotColor.\n'),
    XP_INT_OPTION('backgroundPointDist', 8, 0, 10, g('backgroundPointDist'), (_o, v) => { G.backgroundPointDist = v; return true; }, CD,
      'The distance between points in the background measured in blocks.\nThese are drawn in empty map regions to keep feeling for which\ndirection the ship is moving to.\n'),
    XP_INT_OPTION('backgroundPointSize', 2, MIN_MAP_POINT_SIZE, MAX_MAP_POINT_SIZE, g('backgroundPointSize'), (_o, v) => { G.backgroundPointSize = v; return true; }, CD,
      'Specifies the size of the background points.  0 means no points.\n'),
    XP_DOUBLE_OPTION('scoreObjectTime', 4.0, 0.0, 10.0, g('scoreObjectTime'), null, CD, 'How many seconds score objects remain visible on the map.\n'),
    XP_INT_OPTION('charsPerSecond', 100, 10, 255, g('charsPerSecond'), null, CD, 'Rate at which messages appear on screen in characters per second.\n'),
    XP_INT_OPTION('maxMessages', 8, 1, MAX_MSGS, g('maxMessages'), null, CD, 'The maximum number of messages to display at the same time.\n'),
    XP_INT_OPTION('messagesToStdout', 1, 0, 2, g('messagesToStdout'), null, CD,
      "Send messages to standard output.\n0: Don't.\n1: Only player messages.\n2: Player and status messages.\n"),
    XP_INT_OPTION('maxLinesInHistory', 32, 1, MAX_HIST_MSGS, g('maxLinesInHistory'), null, XP_OPTFLAG_DEFAULT,
      "Number of your messages saved in the 'history' of the talk window.\n'history' is accessible with 'keyTalkCursorUp/Down'.\n"),
    XP_BOOL_OPTION('toggleShield', false, g('toggle_shield'), (_o, v) => { Set_toggle_shield(v); return true; }, CD, 'Are shields toggled by a keypress only?\n'),
    XP_BOOL_OPTION('autoShield', true, g('auto_shield'), (_o, v) => { Set_auto_shield(v); return true; }, CD, 'Are shields lowered automatically for weapon fire?\n'),
    XP_DOUBLE_OPTION('fuelNotify', 500.0, 0.0, 1000.0, g('fuelNotify'), null, CD, 'The limit when the HUD fuel bar will become visible.\n'),
    XP_DOUBLE_OPTION('fuelWarning', 200.0, 0.0, 1000.0, g('fuelWarning'), null, CD, 'The limit when the HUD fuel bar will start flashing.\n'),
    XP_DOUBLE_OPTION('fuelCritical', 100.0, 0.0, 1000.0, g('fuelCritical'), null, CD, 'The limit when the HUD fuel bar will flash faster.\n'),
    XP_DOUBLE_OPTION('speedFactHUD', 0.0, -10.0, +10.0, g('hud_move_fact'), null, CD, 'How much to move HUD to indicate the current velocity.\n'),
    XP_DOUBLE_OPTION('speedFactPTR', 0.0, -10.0, +10.0, g('ptr_move_fact'), null, CD, 'Uses a red line to indicate the current velocity and direction.\n'),
    XP_INT_OPTION('showScoreDecimals', 1, 0, 2, g('showScoreDecimals'), null, CD, 'The number of decimals to use when displaying scores.\n'),
    XP_DOUBLE_OPTION('altPower', 55.0, MIN_PLAYER_POWER, MAX_PLAYER_POWER, g('power_s'), Set_altPower, CD,
      "Set the ship's alternate engine power.\nSee also the keySwapSettings option.\n"),
    XP_DOUBLE_OPTION('altTurnSpeed', 16.0, MIN_PLAYER_TURNSPEED, MAX_PLAYER_TURNSPEED, g('turnspeed_s'), Set_altTurnSpeed, CD,
      "Set the ship's alternate turn speed.\nSee also the keySwapSettings option.\n"),
    XP_DOUBLE_OPTION('altTurnResistance', 0.0, MIN_PLAYER_TURNRESISTANCE, MAX_PLAYER_TURNRESISTANCE, g('turnresistance_s'), Set_altTurnResistance, CD,
      "Set the ship's alternate turn resistance.\nSee also the keySwapSettings option.\n"),
    XP_BOOL_OPTION('markingLights', false, g('markingLights'), null, CD, 'Should the fighters have marking lights, just like airplanes?\n'),
    XP_STRING_OPTION('modifierBank1', '', modBank(0), MAX_CHARS, null, null, null, XP_OPTFLAG_DEFAULT, 'The default weapon modifier values for the first modifier bank.\n'),
    XP_STRING_OPTION('modifierBank2', '', modBank(1), MAX_CHARS, null, null, null, XP_OPTFLAG_DEFAULT, 'The default weapon modifier values for the second modifier bank.\n'),
    XP_STRING_OPTION('modifierBank3', '', modBank(2), MAX_CHARS, null, null, null, XP_OPTFLAG_DEFAULT, 'The default weapon modifier values for the third modifier bank.\n'),
    XP_STRING_OPTION('modifierBank4', '', modBank(3), MAX_CHARS, null, null, null, XP_OPTFLAG_DEFAULT, 'The default weapon modifier values for the fourth modifier bank.\n'),
    XP_STRING_OPTION('shipShape', '', null, 0, (_o, v) => { D.shipShapeSetting = v; tryToSetShipShape(); return true; }, null, () => ns(D.shipShapeSetting), XP_OPTFLAG_DEFAULT,
      'Define the ship shape to use.  Because the argument to this option\nis rather large (up to 500 bytes) the recommended way to set\nthis option is in the .xpilotrc file in your home directory.\nThe exact format is defined in the file doc/README.SHIPS in the\nXPilot distribution. Note that there is a nifty Unix tool called\neditss for easy ship creation. There is XPShipEditor for Windows\nand Ship Shaper for Java.  See the XPilot FAQ for details.\nSee also the "shipShapeFile" option below.\n'),
    XP_STRING_OPTION('shipShapeFile', 'shipshapes.txt', null, 0, (_o, v) => { D.shipShapeFile = v; tryToSetShipShape(); return true; }, null, () => ns(D.shipShapeFile), XP_OPTFLAG_DEFAULT,
      'An optional file where shipshapes can be stored.\nIf this resource is defined and it refers to an existing file\nthen shipshapes can be referenced to by their name.\nFor instance if you define shipShapeFile to be\n/home/myself/.shipshapes and this file contains one or more\nshipshapes then you can select the shipshape by starting xpilot as:\n\txpilot -shipShape myshipshapename\nWhere "myshipshapename" should be the "name:" or "NM:" of\none of the shipshapes defined in /home/myself/.shipshapes.\nEach shipshape definition should be defined on only one line,\nwhere all characters up to the first left parenthesis don\'t matter.\n'),
    XP_STRING_OPTION('texturePath', 'textures', null, 0, Set_texturePath, null, () => ns(G.texturePath), XP_OPTFLAG_KEEP,
      'Search path for texture files.\nThis is a list of one or more directories separated by colons.\n'),
    XP_STRING_OPTION('clientRankFile', '', ref(R, 'clientRankFile'), 256, null, null, null, XP_OPTFLAG_DEFAULT, 'An optional file where clientside kill/death rank is stored.\n'),
    XP_STRING_OPTION('clientRankHTMLFile', '', ref(R, 'clientRankHTMLFile'), 256, null, null, null, XP_OPTFLAG_DEFAULT,
      'An optional file where clientside kill/death rank is\npublished in HTML format.\n'),
    XP_STRING_OPTION('clientRankHTMLNOJSFile', '', ref(R, 'clientRankHTMLNOJSFile'), 256, null, null, null, XP_OPTFLAG_DEFAULT,
      'An optional file where clientside kill/death rank is\npublished in HTML format, w/o JavaScript.\n'),
    ...(sys.sound ? [
      XP_STRING_OPTION('soundFile', 'sound/sounds.txt', ref(SND, 'soundFile'), 1024, null, null, null, XP_OPTFLAG_DEFAULT, 'Specifies the sound file.\n'),
      XP_INT_OPTION('maxVolume', 100, 0, 100, ref(SND, 'maxVolume'), null, CD, 'Specifies the volume to play sounds with (0-100%%).\n'),
      XP_BOOL_OPTION('sound', true, ref(SND, 'sound'), null, CD, 'Is sound enabled? (set to false to mute client).\n'),
    ] : []),
  ]);
}

/** clientrank.c's file names (the client ranker keeps them in account storage too) */
export const R = { clientRankFile: '', clientRankHTMLFile: '', clientRankHTMLNOJSFile: '' };
onReset(() => Object.assign(R, { clientRankFile: '', clientRankHTMLFile: '', clientRankHTMLNOJSFile: '' }));

/** caudio.c's options (only with SOUND) */
export const SND = { soundFile: '', maxVolume: 100, sound: true };
onReset(() => Object.assign(SND, { soundFile: '', maxVolume: 100, sound: true }));

export function defaultCleanup(): void {
  O_cleanup();
}
function O_cleanup(): void { /* garbage collected */ }

void MAX_DISP_LEN;
