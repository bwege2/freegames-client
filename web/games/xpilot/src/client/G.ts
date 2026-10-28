// The client's global variables (the externs of client.h, paint.h, netclient.h, xinit.h, xpaint.h and
// the X11 headers), with their C initial values. One object, made fresh for every client run
// (resetG), so a page can start the game again. File-local statics stay in their modules
// (cutil.ts onReset).
import type { Display, GC, XColor, XEvent, XFontStruct, XGCValues } from '../xlib/xlib.ts';
import type { shipshape_t } from './shipshape.ts';
import { MAX_CHARS, MAX_COLORS, MAX_SCORE_OBJECTS, NUM_ITEMS, NUM_MODBANKS, POLYGON_VERSION, DEBRIS_TYPES, TEAM_NOT_SET, MAX_POINTER_MOVES, SEL_NONE, BmsNone, NUM_DASHES, NUM_CDASHES } from './consts.ts';

export interface ipos_t { x: number; y: number }
export interface irec_t { x: number; y: number; w: number; h: number }

export interface other_t {
  score: number;
  id: number;
  team: number;
  check: number;
  round: number;
  timing_loops: number;
  timing: number;
  life: number;
  mychar: number;
  alliance: number;
  name_width: number;
  name_len: number;
  max_chars_in_names: number;
  ignorelevel: number;
  ship: shipshape_t | null;
  nick_name: string;
  user_name: string;
  host_name: string;
  id_string: string;
}

export function newOther(): other_t {
  return {
    score: 0, id: 0, team: 0, check: 0, round: 0, timing_loops: 0, timing: 0, life: 0, mychar: 0, alliance: 0, name_width: 0,
    name_len: 0, max_chars_in_names: 0, ignorelevel: 0, ship: null, nick_name: '', user_name: '', host_name: '', id_string: '',
  };
}

export interface fuelstation_t { pos: number; fuel: number; bounds: irec_t }
export interface homebase_t { pos: number; id: number; team: number; bounds: irec_t; type: number; appeartime: number }
export interface cannontime_t { pos: number; dead_time: number; dot: number }
export interface target_t { pos: number; dead_time: number; damage: number }
export interface checkpoint_t { pos: number; bounds: irec_t }
export interface edge_style_t { width: number; color: number; rgb: number; style: number }
export interface polygon_style_t { color: number; rgb: number; texture: number; flags: number; def_edge_style: number }
export interface xp_polygon_t { points: ipos_t[]; num_points: number; bounds: irec_t; edge_styles: number[] | null; style: number }

export interface refuel_t { x0: number; y0: number; x1: number; y1: number }
export interface connector_t { x0: number; y0: number; x1: number; y1: number; tractor: number }
export interface laser_t { color: number; dir: number; x: number; y: number; len: number }
export interface missile_t { x: number; y: number; dir: number; len: number }
export interface ball_t { x: number; y: number; id: number; style: number }
export interface ship_t { x: number; y: number; id: number; dir: number; shield: number; cloak: number; eshield: number; phased: number; deflector: number }
export interface mine_t { x: number; y: number; teammine: number; id: number }
export interface itemtype_t { x: number; y: number; type: number }
export interface ecm_t { x: number; y: number; size: number }
export interface trans_t { x1: number; y1: number; x2: number; y2: number }
export interface paused_t { x: number; y: number; count: number }
export interface appearing_t { x: number; y: number; id: number; count: number }
export interface radar_t { x: number; y: number; size: number; type: number }
export interface debris_t { x: number; y: number }
export interface wreckage_t { x: number; y: number; wrecktype: number; size: number; rotation: number }
export interface asteroid_t { x: number; y: number; type: number; size: number; rotation: number }
export interface wormhole_t { x: number; y: number }

export interface score_object_t {
  score: number; life_time: number; x: number; y: number;
  hud_msg_len: number; hud_msg_width: number; msg_width: number; msg_len: number;
  msg: string; hud_msg: string;
}

export interface message_t { txt: string; len: number; lifeTime: number; bmsinfo: number }

export interface selection_t {
  talk: { state: number; x1: number; x2: number; incl_nl: boolean };
  draw: { state: number; x1: number; x2: number; y1: number; y2: number };
  txt: string | null;
  txt_size: number;
  len: number;
  keep_emphasizing: boolean;
}

export interface setup_t {
  map_data_len: number;
  mode: number;
  lives: number;
  x: number;
  y: number;
  width: number;
  height: number;
  frames_per_second: number;
  map_order: number;
  name: string;
  author: string;
  data_url: string;
  map_data: Uint8Array;
}

export interface Connect_param_t {
  contact_port: number; server_port: number; login_port: number;
  nick_name: string; user_name: string; host_name: string; server_addr: string; server_name: string; disp_name: string;
  server_version: number; team: number;
}

export interface instruments_t {
  clientRanker: boolean; clockAMPM: boolean; filledDecor: boolean; filledWorld: boolean; outlineDecor: boolean;
  outlineWorld: boolean; showDecor: boolean; showItems: boolean; showLivesByShip: boolean; showMessages: boolean;
  showMyShipShape: boolean; showNastyShots: boolean; showShipShapes: boolean; showShipShapesHack: boolean;
  slidingRadar: boolean; texturedDecor: boolean; texturedWalls: boolean;
}

export interface client_data_t {
  talking: boolean; pointerControl: boolean; restorePointerControl: boolean; quitMode: boolean;
  clientLag: number; scaleFactor: number; scale: number; fscale: number; altScaleFactor: number;
}

export interface display_t { view_width: number; view_height: number; spark_rand: number; num_spark_colors: number }
export interface pointer_move_t { movement: number; turnspeed: number; id: number }

/** dbuff.h dbuff_state_t (PIXMAP_COPY on a TrueColor screen) */
export interface dbuff_state_t {
  type: number; multibuffer_type: number; drawing_planes: number; drawing_plane_masks: [number, number];
}

const arr = <T>(n: number, f: () => T): T[] => Array.from({ length: n }, f);

function makeG() {
  return {
    // client.c
    clData: {
      talking: false, pointerControl: false, restorePointerControl: false, quitMode: false,
      clientLag: 0, scaleFactor: 0, scale: 0, fscale: 0, altScaleFactor: 0,
    } as client_data_t,
    geometry: null as string | null,
    xpArgs: { help: false, version: false, text: false, list_servers: false, auto_connect: false, shutdown_reason: '' },
    connectParam: {
      contact_port: 0, server_port: 0, login_port: 0, nick_name: '', user_name: '', host_name: '', server_addr: '',
      server_name: '', disp_name: '', server_version: 0, team: 0,
    } as Connect_param_t,
    newbie: false,
    baseWarningType: 0,
    maxCharsInNames: 0,
    hudRadarDotSize: 0,
    hudRadarScale: 0,
    hudRadarLimit: 0,
    hudSize: 0,
    scoresChanged: 1,
    RadarHeight: 0,
    RadarWidth: 256,
    UpdateRadar: false,
    oldServer: 0,
    selfPos: { x: 0, y: 0 } as ipos_t,
    selfVel: { x: 0, y: 0 } as ipos_t,
    heading: 0,
    nextCheckPoint: 0,
    numItems: new Uint8Array(NUM_ITEMS),
    lastNumItems: new Uint8Array(NUM_ITEMS),
    numItemsTime: new Int32Array(NUM_ITEMS),
    showItemsTime: 0,
    scoreObjectTime: 0,
    autopilotLight: 0,
    showScoreDecimals: 0,
    lock_id: 0,
    lock_dir: 0,
    lock_dist: 0,
    eyesId: 0,
    eyes: null as other_t | null,
    snooping: false,
    eyeTeam: TEAM_NOT_SET,
    self: null as other_t | null,
    selfVisible: 0,
    damaged: 0,
    destruct: 0,
    shutdown_delay: 0,
    shutdown_count: 0,
    thrusttime: 0,
    thrusttimemax: 0,
    shieldtime: 0,
    shieldtimemax: 0,
    phasingtime: 0,
    phasingtimemax: 0,
    roundDelay: 0,
    roundDelayMax: 0,
    backgroundPointDist: 0,
    backgroundPointSize: 0,
    sparkSize: 0,
    shotSize: 0,
    teamShotSize: 0,
    controlTime: 0,
    spark_rand: 0,
    old_spark_rand: 0,
    fuelSum: 0,
    fuelMax: 0,
    fuelCurrent: 0,
    numTanks: 0,
    fuelTime: 0,
    fuelCritical: 0,
    fuelWarning: 0,
    fuelNotify: 0,
    shipShape: null as string | null,
    power: 0,
    power_s: 0,
    turnspeed: 0,
    turnspeed_s: 0,
    turnresistance: 0,
    turnresistance_s: 0,
    displayedPower: 0,
    displayedTurnspeed: 0,
    displayedTurnresistance: 0,
    sparkProb: 0,
    charsPerSecond: 0,
    hud_move_fact: 0,
    ptr_move_fact: 0,
    instruments: {
      clientRanker: false, clockAMPM: false, filledDecor: false, filledWorld: false, outlineDecor: false, outlineWorld: false,
      showDecor: false, showItems: false, showLivesByShip: false, showMessages: false, showMyShipShape: false,
      showNastyShots: false, showShipShapes: false, showShipShapesHack: false, slidingRadar: false, texturedDecor: false,
      texturedWalls: false,
    } as instruments_t,
    mods: '',
    packet_size: 0,
    packet_loss: 0,
    packet_drop: 0,
    packet_lag: 0,
    packet_measure: null as Uint8Array | null,
    packet_loop: 0,
    showUserName: false,
    servername: '',
    version: 0,
    toggle_shield: false,
    shields: true,
    auto_shield: true,
    modBankStr: arr(NUM_MODBANKS, () => ''),
    maxFPS: 0,
    oldMaxFPS: 0,
    clientFPS: 1.0,
    recordFPS: 0,
    currentTime: 0,
    newSecond: false,
    maxMouseTurnsPS: 0,
    mouseMovementInterval: 0,
    cumulativeMouseMovement: 0,
    clientPortStart: 0,
    clientPortEnd: 0,
    lose_item: 0,
    lose_item_active: 0,
    teamscores: new Float64Array(10),
    cannons: [] as cannontime_t[],
    num_cannons: 0,
    targets: [] as target_t[],
    num_targets: 0,
    fuels: [] as fuelstation_t[],
    num_fuels: 0,
    bases: [] as homebase_t[],
    num_bases: 0,
    checks: [] as checkpoint_t[],
    num_checks: 0,
    polygons: [] as xp_polygon_t[],
    num_polygons: 0,
    edge_styles: [] as edge_style_t[],
    num_edge_styles: 0,
    polygon_styles: [] as polygon_style_t[],
    num_polygon_styles: 0,
    score_objects: arr(MAX_SCORE_OBJECTS, (): score_object_t => ({
      score: 0, life_time: 0, x: 0, y: 0, hud_msg_len: 0, hud_msg_width: 0, msg_width: 0, msg_len: 0, msg: '', hud_msg: '',
    })),
    score_object: 0,
    Others: [] as other_t[],
    num_others: 0,
    max_others: 0,
    refuel_ptr: [] as refuel_t[], num_refuel: 0,
    connector_ptr: [] as connector_t[], num_connector: 0,
    laser_ptr: [] as laser_t[], num_laser: 0,
    missile_ptr: [] as missile_t[], num_missile: 0,
    ball_ptr: [] as ball_t[], num_ball: 0,
    ship_ptr: [] as ship_t[], num_ship: 0,
    mine_ptr: [] as mine_t[], num_mine: 0,
    itemtype_ptr: [] as itemtype_t[], num_itemtype: 0,
    ecm_ptr: [] as ecm_t[], num_ecm: 0,
    trans_ptr: [] as trans_t[], num_trans: 0,
    paused_ptr: [] as paused_t[], num_paused: 0,
    appearing_ptr: [] as appearing_t[], num_appearing: 0,
    radar_ptr: [] as radar_t[], num_radar: 0,
    num_vcannon: 0, num_vfuel: 0, num_vbase: 0, num_vdecor: 0,
    debris_ptr: arr(DEBRIS_TYPES, () => [] as debris_t[]),
    num_debris: new Int32Array(DEBRIS_TYPES),
    fastshot_ptr: arr(DEBRIS_TYPES * 2, () => [] as debris_t[]),
    num_fastshot: new Int32Array(DEBRIS_TYPES * 2),
    wreckage_ptr: [] as wreckage_t[], num_wreckage: 0,
    asteroid_ptr: [] as asteroid_t[], num_asteroids: 0,
    wormhole_ptr: [] as wormhole_t[], num_wormholes: 0,
    num_playing_teams: 0,
    time_left: -1,
    start_loops: 0,
    end_loops: 0,
    roundend: false,
    played_this_round: false,
    protocolVersion: POLYGON_VERSION,
    is_server: false,

    // messages.c
    TalkMsg: [] as message_t[],
    GameMsg: [] as message_t[],
    TalkMsg_pending: [] as message_t[],
    GameMsg_pending: [] as message_t[],
    HistoryMsg: [] as (string | null)[],
    maxLinesInHistory: 0,
    selection: {
      talk: { state: SEL_NONE, x1: 0, x2: 0, incl_nl: false },
      draw: { state: SEL_NONE, x1: 0, x2: 0, y1: 0, y2: 0 },
      txt: null, txt_size: 0, len: 0, keep_emphasizing: false,
    } as selection_t,
    maxMessages: 0,
    messagesToStdout: 0,
    talk_fast_msgs: arr(20, () => null as string | null),

    // netclient.c
    Setup: null as setup_t | null,
    server_display: { view_width: 0, view_height: 0, spark_rand: 0, num_spark_colors: 0 } as display_t,
    receive_window_size: 3,
    last_loops: 0,
    packetMeasurement: false,
    pointer_moves: arr(MAX_POINTER_MOVES, (): pointer_move_t => ({ movement: 0, turnspeed: 0, id: 0 })),
    pointer_move_next: 0,
    last_keyboard_ack: 0,
    dirPrediction: false,

    // paint.c
    world: { x: 0, y: 0 } as ipos_t,
    realWorld: { x: 0, y: 0 } as ipos_t,
    players_exposed: false,
    ext_view_width: 0,
    ext_view_height: 0,
    active_view_width: 0,
    active_view_height: 0,
    ext_view_x_offset: 0,
    ext_view_y_offset: 0,
    loops: 0,
    loopsSlow: 0,
    timePerFrame: 0.0,
    draw_width: 0,
    draw_height: 0,
    num_spark_colors: 0,
    markingLights: false,

    // xpaint.c, xinit.c, colors.c, xdefault.c, paintradar.c, paintdata.c, dbuff.c
    dpy: null as unknown as Display,
    kdpy: null as Display | null,
    about_page: 0,
    gameGC: null as unknown as GC,
    messageGC: null as unknown as GC,
    radarGC: null as unknown as GC,
    buttonGC: null as unknown as GC,
    scoreListGC: null as unknown as GC,
    textGC: null as unknown as GC,
    talkGC: null as unknown as GC,
    motdGC: null as unknown as GC,
    gcv: { line_style: 0, dash_offset: 0, fill_style: 0, stipple: 0, ts_x_origin: 0, ts_y_origin: 0 } as XGCValues & { line_style: number; dash_offset: number },
    topWindow: 0,
    drawWindow: 0,
    keyboardWindow: 0,
    drawPixmap: 0,
    playersWindow: 0,
    aboutWindow: 0,
    about_close_b: 0,
    about_next_b: 0,
    about_prev_b: 0,
    keys_close_b: 0,
    talkWindow: 0,
    gotFocus: false,
    radarWindow: 0,
    radarPixmap: 0,
    radarPixmap2: 0,
    dpl_1: [0, 0],
    dpl_2: [0, 0],
    radar_exposures: 0,
    ButtonHeight: 0,
    ProtocolAtom: 0,
    KillAtom: 0,
    quitting: false,
    top_width: 0,
    top_height: 0,
    players_width: 0,
    players_height: 0,
    radar_score_mapped: false,
    pointerControlCursor: 0,
    ignoreWindowManager: false,
    gameFont: null as unknown as XFontStruct,
    messageFont: null as unknown as XFontStruct,
    scoreListFont: null as unknown as XFontStruct,
    buttonFont: null as unknown as XFontStruct,
    textFont: null as unknown as XFontStruct,
    talkFont: null as unknown as XFontStruct,
    motdFont: null as unknown as XFontStruct,
    gameFontName: '',
    messageFontName: '',
    scoreListFontName: '',
    buttonFontName: '',
    textFontName: '',
    talkFontName: '',
    motdFontName: '',
    itemBitmaps: new Array<number>(NUM_ITEMS).fill(0),
    dashes: new Array<number>(NUM_DASHES).fill(0),
    cdashes: new Array<number>(NUM_CDASHES).fill(0),
    button_form: 0,
    visualName: '',
    dispDepth: 0,
    colorSwitch: false,
    multibuffer: false,
    fullColor: false,
    texturedObjects: false,
    maxColors: 0,
    colors: arr(MAX_COLORS, (): XColor => ({ pixel: 0, red: 0, green: 0, blue: 0, flags: 0 })),
    colormap: 0,
    sparkColors: '',
    spark_color: new Int32Array(MAX_COLORS),
    buttonColor: 0,
    windowColor: 0,
    borderColor: 0,
    wallColor: 0,
    decorColor: 0,
    hudColor: 0,
    current_foreground: 0,
    dbuf_state: null as dbuff_state_t | null,
    mouseAccelInClient: false,
    new_acc_num: 0,
    new_acc_denom: 1,
    new_threshold: 0,
    pre_exists: false,
    pre_acc_num: 0,
    pre_acc_denom: 0,
    pre_threshold: 0,

    // xevent.c
    talk_key_repeating: 0,
    talk_key_repeat_event: null as XEvent | null,
    talk_key_repeat_time: 0,
    mousePosition: { x: 0, y: 0 } as ipos_t,
    mouseMovement: 0,

    // talk.c, record.c, gfx2d.c
    save_talk_str: false,
    recording: false,
    texturePath: null as string | null,
    realTexturePath: null as string | null,

    // the strings that are char arrays in C (MAX_CHARS) live as JS strings
    _maxChars: MAX_CHARS,
    _bms: BmsNone,
  };
}

export type Globals = ReturnType<typeof makeG>;
export const G: Globals = makeG();

/** a new client run: every global back to its initial value */
export function resetG(): void {
  Object.assign(G, makeG());
}
