// Constants of XPilot NG 4.7.3's common and client headers (const.h, click.h, setup.h, rules.h,
// item.h, keys.h, packet.h, pack.h, net.h, client.h, paint.h, xinit.h, xpaint.h, bitmaps.h).

// const.h
export const PI = 3.14159265358979323846;
export const RES = 128;
export const BLOCK_SZ = 35;
export const TABLE_SIZE = RES;
export const OLD_MAX_CHECKS = 26;
export const MAX_TEAMS = 10;
export const EXPIRED_MINE_ID = 4096;
export const MAX_CHARS = 80;
export const MSG_LEN = 256;
export const MAX_MOTD_SIZE = 30 * 1024;
export const NUM_MODBANKS = 4;
export const SPEED_LIMIT = 65.0;
export const MAX_PLAYER_TURNSPEED = 64.0;
export const MIN_PLAYER_TURNSPEED = 0.0;
export const MAX_PLAYER_POWER = 55.0;
export const MIN_PLAYER_POWER = 5.0;
export const MAX_PLAYER_TURNRESISTANCE = 1.0;
export const MIN_PLAYER_TURNRESISTANCE = 0.0;
export const MAX_STATION_FUEL = 500.0;
export const TARGET_DAMAGE = 250.0;
export const SELF_DESTRUCT_DELAY = 150.0;
export const SHIP_SZ = 16;
export const VISIBILITY_DISTANCE = 1000.0;
export const BALL_RADIUS = 10;
export const MISSILE_LEN = 15;
export const TEAM_NOT_SET = 0xffff;
export const DEBRIS_TYPES = 8 * 4 * 4;
export const NUM_COLORS = 4;
export const BLACK = 0, WHITE = 1, BLUE = 2, RED = 3;
export const MIN_VIEW_SIZE = 384, MAX_VIEW_SIZE = 1024, DEF_VIEW_SIZE = 768;
export const MIN_SPARK_RAND = 0, MAX_SPARK_RAND = 0x80, DEF_SPARK_RAND = 0x55;
export const STYLE_FILLED = 1 << 0, STYLE_TEXTURED = 1 << 1, STYLE_INVISIBLE = 1 << 2, STYLE_INVISIBLE_RADAR = 1 << 3;
export const MOD2 = (x: number, m: number): number => x & (m - 1);

// click.h
export const CLICK_SHIFT = 6;
export const CLICK = 1 << CLICK_SHIFT;
export const BLOCK_CLICKS = BLOCK_SZ << CLICK_SHIFT;

// setup.h
export const SETUP_COMPRESSED = 0x80;
export const SETUP_MAP_ORDER_XY = 1, SETUP_MAP_ORDER_YX = 2, SETUP_MAP_UNCOMPRESSED = 3;
export const SETUP_SPACE = 0, SETUP_FILLED = 1, SETUP_FILLED_NO_DRAW = 2, SETUP_FUEL = 3, SETUP_REC_RU = 4,
  SETUP_REC_RD = 5, SETUP_REC_LU = 6, SETUP_REC_LD = 7, SETUP_ACWISE_GRAV = 8, SETUP_CWISE_GRAV = 9, SETUP_POS_GRAV = 10,
  SETUP_NEG_GRAV = 11, SETUP_WORM_NORMAL = 12, SETUP_WORM_IN = 13, SETUP_WORM_OUT = 14, SETUP_CANNON_UP = 15,
  SETUP_CANNON_RIGHT = 16, SETUP_CANNON_DOWN = 17, SETUP_CANNON_LEFT = 18, SETUP_SPACE_DOT = 19, SETUP_TREASURE = 20,
  SETUP_BASE_LOWEST = 30, SETUP_BASE_UP = 30, SETUP_BASE_RIGHT = 40, SETUP_BASE_DOWN = 50, SETUP_BASE_LEFT = 60,
  SETUP_BASE_HIGHEST = 69, SETUP_TARGET = 70, SETUP_CHECK = 80, SETUP_ITEM_CONCENTRATOR = 110, SETUP_DECOR_FILLED = 111,
  SETUP_DECOR_RU = 112, SETUP_DECOR_RD = 113, SETUP_DECOR_LU = 114, SETUP_DECOR_LD = 115, SETUP_DECOR_DOT_FILLED = 116,
  SETUP_DECOR_DOT_RU = 117, SETUP_DECOR_DOT_RD = 118, SETUP_DECOR_DOT_LU = 119, SETUP_DECOR_DOT_LD = 120, SETUP_UP_GRAV = 121,
  SETUP_DOWN_GRAV = 122, SETUP_RIGHT_GRAV = 123, SETUP_LEFT_GRAV = 124, SETUP_ASTEROID_CONCENTRATOR = 125;

// rules.h
export const CRASH_WITH_PLAYER = 1 << 0, BOUNCE_WITH_PLAYER = 1 << 1, PLAYER_KILLINGS = 1 << 2, LIMITED_LIVES = 1 << 3,
  TIMING = 1 << 4, PLAYER_SHIELDING = 1 << 6, LIMITED_VISIBILITY = 1 << 7, TEAM_PLAY = 1 << 8, WRAP_PLAY = 1 << 9,
  ALLOW_NUKES = 1 << 10, ALLOW_CLUSTERS = 1 << 11, ALLOW_MODIFIERS = 1 << 12, ALLOW_LASER_MODIFIERS = 1 << 13, ALLIANCES = 1 << 14;
export const OLD_PLAYING = 1 << 0, OLD_PAUSE = 1 << 1, OLD_GAME_OVER = 1 << 2;

// item.h
export const NO_ITEM = -1, ITEM_FUEL = 0, ITEM_WIDEANGLE = 1, ITEM_REARSHOT = 2, ITEM_AFTERBURNER = 3, ITEM_CLOAK = 4,
  ITEM_SENSOR = 5, ITEM_TRANSPORTER = 6, ITEM_TANK = 7, ITEM_MINE = 8, ITEM_MISSILE = 9, ITEM_ECM = 10, ITEM_LASER = 11,
  ITEM_EMERGENCY_THRUST = 12, ITEM_TRACTOR_BEAM = 13, ITEM_AUTOPILOT = 14, ITEM_EMERGENCY_SHIELD = 15, ITEM_DEFLECTOR = 16,
  ITEM_HYPERJUMP = 17, ITEM_PHASING = 18, ITEM_MIRROR = 19, ITEM_ARMOR = 20, NUM_ITEMS = 21;
export const ITEM_SIZE = 16;
export const ITEM_TRIANGLE_SIZE = Math.trunc((5 * ITEM_SIZE) / 7) + 1;

// keys.h
export const KEY_DUMMY = 0, KEY_LOCK_NEXT = 1, KEY_LOCK_PREV = 2, KEY_LOCK_CLOSE = 3, KEY_CHANGE_HOME = 4, KEY_SHIELD = 5,
  KEY_FIRE_SHOT = 6, KEY_FIRE_MISSILE = 7, KEY_FIRE_TORPEDO = 8, KEY_TOGGLE_NUCLEAR = 9, KEY_FIRE_HEAT = 10, KEY_DROP_MINE = 11,
  KEY_DETACH_MINE = 12, KEY_TURN_LEFT = 13, KEY_TURN_RIGHT = 14, KEY_SELF_DESTRUCT = 15, KEY_LOSE_ITEM = 16, KEY_PAUSE = 17,
  KEY_TANK_DETACH = 18, KEY_TANK_NEXT = 19, KEY_TANK_PREV = 20, KEY_TOGGLE_VELOCITY = 21, KEY_TOGGLE_CLUSTER = 22,
  KEY_SWAP_SETTINGS = 23, KEY_REFUEL = 24, KEY_CONNECTOR = 25, KEY_THRUST = 30, KEY_CLOAK = 31, KEY_ECM = 32, KEY_DROP_BALL = 33,
  KEY_TRANSPORTER = 34, KEY_TALK = 35, KEY_FIRE_LASER = 36, KEY_LOCK_NEXT_CLOSE = 37, KEY_TOGGLE_COMPASS = 38,
  KEY_TOGGLE_MINI = 39, KEY_TOGGLE_SPREAD = 40, KEY_TOGGLE_POWER = 41, KEY_TOGGLE_AUTOPILOT = 42, KEY_TOGGLE_LASER = 43,
  KEY_EMERGENCY_THRUST = 44, KEY_TRACTOR_BEAM = 45, KEY_PRESSOR_BEAM = 46, KEY_CLEAR_MODIFIERS = 47, KEY_LOAD_MODIFIERS_1 = 48,
  KEY_LOAD_MODIFIERS_2 = 49, KEY_LOAD_MODIFIERS_3 = 50, KEY_LOAD_MODIFIERS_4 = 51, KEY_SELECT_ITEM = 52, KEY_PHASING = 53,
  KEY_REPAIR = 54, KEY_TOGGLE_IMPLOSION = 55, KEY_REPROGRAM = 56, KEY_LOAD_LOCK_1 = 57, KEY_LOAD_LOCK_2 = 58,
  KEY_LOAD_LOCK_3 = 59, KEY_LOAD_LOCK_4 = 60, KEY_EMERGENCY_SHIELD = 61, KEY_HYPERJUMP = 62, KEY_DETONATE_MINES = 63,
  KEY_DEFLECTOR = 64, NUM_KEYS = 72;
export const KEY_MSG_1 = 73;
export const KEY_MSG_20 = KEY_MSG_1 + 19;
export const KEY_ID_MODE = KEY_MSG_20 + 1, KEY_TOGGLE_OWNED_ITEMS = KEY_ID_MODE + 1, KEY_TOGGLE_MESSAGES = KEY_ID_MODE + 2,
  KEY_POINTER_CONTROL = KEY_ID_MODE + 3, KEY_TOGGLE_RECORD = KEY_ID_MODE + 4, KEY_TOGGLE_SOUND = KEY_ID_MODE + 5,
  KEY_PRINT_MSGS_STDOUT = KEY_ID_MODE + 6, KEY_TALK_CURSOR_LEFT = KEY_ID_MODE + 7, KEY_TALK_CURSOR_RIGHT = KEY_ID_MODE + 8,
  KEY_TALK_CURSOR_UP = KEY_ID_MODE + 9, KEY_TALK_CURSOR_DOWN = KEY_ID_MODE + 10, KEY_SWAP_SCALEFACTOR = KEY_ID_MODE + 11,
  KEY_TOGGLE_RADAR_SCORE = KEY_ID_MODE + 12, KEY_INCREASE_POWER = KEY_ID_MODE + 13, KEY_DECREASE_POWER = KEY_ID_MODE + 14,
  KEY_INCREASE_TURNSPEED = KEY_ID_MODE + 15, KEY_DECREASE_TURNSPEED = KEY_ID_MODE + 16, KEY_TOGGLE_FULLSCREEN = KEY_ID_MODE + 17,
  KEY_EXIT = KEY_ID_MODE + 18, KEY_YES = KEY_ID_MODE + 19, KEY_NO = KEY_ID_MODE + 20, NUM_CLIENT_KEYS = KEY_ID_MODE + 21;
export const KEYBOARD_SIZE = 9;

// packet.h
export const PKT_UNDEFINED = 0, PKT_VERIFY = 1, PKT_REPLY = 2, PKT_PLAY = 3, PKT_QUIT = 4, PKT_MESSAGE = 5, PKT_START = 6,
  PKT_END = 7, PKT_SELF = 8, PKT_DAMAGED = 9, PKT_CONNECTOR = 10, PKT_REFUEL = 11, PKT_SHIP = 12, PKT_ECM = 13, PKT_PAUSED = 14,
  PKT_ITEM = 15, PKT_MINE = 16, PKT_BALL = 17, PKT_MISSILE = 18, PKT_SHUTDOWN = 19, PKT_STRING = 20, PKT_DESTRUCT = 21,
  PKT_RADAR = 22, PKT_TARGET = 23, PKT_KEYBOARD = 24, PKT_SEEK = 25, PKT_SELF_ITEMS = 26, PKT_TEAM_SCORE = 27, PKT_PLAYER = 28,
  PKT_SCORE = 29, PKT_FUEL = 30, PKT_BASE = 31, PKT_CANNON = 32, PKT_LEAVE = 33, PKT_POWER = 34, PKT_POWER_S = 35,
  PKT_TURNSPEED = 36, PKT_TURNSPEED_S = 37, PKT_TURNRESISTANCE = 38, PKT_TURNRESISTANCE_S = 39, PKT_WAR = 40, PKT_MAGIC = 41,
  PKT_RELIABLE = 42, PKT_ACK = 43, PKT_FASTRADAR = 44, PKT_TRANS = 45, PKT_ACK_CANNON = 46, PKT_ACK_FUEL = 47,
  PKT_ACK_TARGET = 48, PKT_AUDIO = 50, PKT_TALK = 51, PKT_TALK_ACK = 52, PKT_TIME_LEFT = 53, PKT_LASER = 54, PKT_DISPLAY = 55,
  PKT_EYES = 56, PKT_SHAPE = 57, PKT_MOTD = 58, PKT_LOSEITEM = 59, PKT_APPEARING = 60, PKT_TEAM = 61, PKT_POLYSTYLE = 62,
  PKT_ACK_POLYSTYLE = 63, PKT_MODIFIERS = 68, PKT_FASTSHOT = 69, PKT_THRUSTTIME = 70, PKT_MODIFIERBANK = 71,
  PKT_SHIELDTIME = 72, PKT_POINTER_MOVE = 73, PKT_REQUEST_AUDIO = 74, PKT_ASYNC_FPS = 75, PKT_TIMING = 76,
  PKT_PHASINGTIME = 77, PKT_ROUNDDELAY = 78, PKT_WRECKAGE = 79, PKT_ASTEROID = 80, PKT_WORMHOLE = 81, PKT_FAILURE = 101,
  PKT_SUCCESS = 102, PKT_DEBRIS = 128;

// pack.h
export const POLYGON_VERSION = 0x4f15;
export const MAX_NAME_LEN = 16;
export const MAX_DISP_LEN = 80;
export const MAX_HOST_LEN = 64;
export const SERVER_PORT = 15345;

// net.h
export const MIN_SOCKBUF_SIZE = 1024;
export const MAX_SOCKBUF_SIZE = 50 * 1024;
export const SERVER_RECV_SIZE = MIN_SOCKBUF_SIZE;
export const SERVER_SEND_SIZE = 4 * 1024;
export const CLIENT_SEND_SIZE = SERVER_RECV_SIZE;
export const CLIENT_RECV_SIZE = SERVER_SEND_SIZE + 1024;
export const SOCKBUF_WRITE_SPARE = 8;

// netclient.h
export const MIN_RECEIVE_WINDOW_SIZE = 1, MAX_RECEIVE_WINDOW_SIZE = 4;
export const MAX_SUPPORTED_FPS = 255;
export const MAX_POINTER_MOVES = 128;

// client.h
export const PACKET_LOSS = 0, PACKET_DROP = 1, PACKET_DRAW = 2;
export const MAX_SCORE_OBJECTS = 10;
export const MAX_SPARK_SIZE = 8, MIN_SPARK_SIZE = 1, MAX_MAP_POINT_SIZE = 8, MIN_MAP_POINT_SIZE = 0, MAX_SHOT_SIZE = 20,
  MIN_SHOT_SIZE = 1, MAX_TEAMSHOT_SIZE = 20, MIN_TEAMSHOT_SIZE = 1;
export const MIN_SHOW_ITEMS_TIME = 0.0, MAX_SHOW_ITEMS_TIME = 300.0;
export const MIN_SCALEFACTOR = 0.1, MAX_SCALEFACTOR = 20.0;
export const FUEL_NOTIFY_TIME = 3.0, CONTROL_TIME = 8.0;
export const MAX_MSGS = 15, MAX_HIST_MSGS = 128;
export const MSG_LIFE_TIME = 120.0, MSG_FLASH_TIME = 105.0;
export const MAX_POINTER_BUTTONS = 5;
export const SEL_NONE = 1 << 0, SEL_PENDING = 1 << 1, SEL_SELECTED = 1 << 2, SEL_EMPHASIZED = 1 << 3;
export const BmsNone = 0, BmsBall = 1, BmsSafe = 2, BmsCover = 3, BmsPop = 4;
export const RadarEnemy = 0, RadarFriend = 1;

// paint.h
export const MAX_COLORS = 16;
export const MAX_COLOR_LEN = 32;
export const MIN_HUD_SIZE = 90;
export const HUD_OFFSET = 20;
export const FUEL_GAUGE_OFFSET = 6;
export const HUD_FUEL_GAUGE_SIZE = 2 * (MIN_HUD_SIZE - HUD_OFFSET - FUEL_GAUGE_OFFSET);
export const WARNING_DISTANCE = VISIBILITY_DISTANCE * 0.8;
export const DSIZE = 4;

// xinit.h
export const MAX_VISUAL_NAME = 12;
export const MIN_TOP_WIDTH = 640 + 2, MAX_TOP_WIDTH = 1920 + 2, DEF_TOP_WIDTH = 1280 + 2;
export const MIN_TOP_HEIGHT = 480, MAX_TOP_HEIGHT = 1440, DEF_TOP_HEIGHT = 1024;

// xpaint.h
export const DRAW_EMPHASIZED = BLUE;
export const FONT_LEN = 256;
export const NUM_DASHES = 2, NUM_CDASHES = 2, DASHES_LENGTH = 12;
export const ITEM_HUD = 0, ITEM_PLAYFIELD = 1;

// option.h
export const XP_OPTFLAG_CONFIG_DEFAULT = 1 << 1, XP_OPTFLAG_CONFIG_COLORS = 1 << 2, XP_OPTFLAG_KEEP = 1 << 3,
  XP_OPTFLAG_NEVER_SAVE = 1 << 4, XP_OPTFLAG_DEFAULT = 0;
export const XP_KS_UNKNOWN = -1;

// wreckshape.h, astershape.h
export const NUM_WRECKAGE_SHAPES = 3, NUM_WRECKAGE_POINTS = 12;
export const WRECKAGE_SHAPES = [
  [[-9, 6], [-2, 8], [5, 2], [9, 3], [10, 0], [5, -1], [3, 0], [-2, -9], [-5, -6], [-3, -2], [-7, -1], [-5, 2]],
  [[-8, -9], [-9, -3], [-7, 3], [-1, 7], [8, 9], [9, 6], [2, 5], [-2, 2], [4, -1], [2, -5], [0, -2], [-5, -2]],
  [[-9, -2], [-7, 2], [-2, -3], [2, -3], [0, 1], [1, 10], [4, 9], [4, 2], [7, -2], [7, -5], [2, -8], [-4, -7]],
];
export const NUM_ASTEROID_SHAPES = 2, NUM_ASTEROID_POINTS = 12;
export const ASTEROID_SHAPES = [
  [[-10, 0], [-7, 6], [-2, 8], [0, 10], [5, 8], [9, 4], [10, 0], [7, -5], [6, -9], [0, -10], [-5, -7], [-7, -5]],
  [[-10, 0], [-8, 7], [-4, 9], [0, 10], [5, 7], [6, 3], [10, 0], [9, -4], [7, -7], [0, -10], [-6, -9], [-9, -7]],
];

// bitmaps.h
export const BM_HOLDER_FRIEND = 0, BM_HOLDER_ENEMY = 1, BM_BALL = 2, BM_SHIP_SELF = 3, BM_SHIP_FRIEND = 4, BM_SHIP_ENEMY = 5,
  BM_BULLET = 6, BM_BULLET_OWN = 7, BM_BASE_DOWN = 8, BM_BASE_LEFT = 9, BM_BASE_UP = 10, BM_BASE_RIGHT = 11, BM_FUELCELL = 12,
  BM_FUEL = 13, BM_ALL_ITEMS = 14, BM_CANNON_DOWN = 15, BM_CANNON_LEFT = 16, BM_CANNON_UP = 17, BM_CANNON_RIGHT = 18,
  BM_SPARKS = 19, BM_PAUSED = 20, BM_WALL_TOP = 21, BM_WALL_LEFT = 22, BM_WALL_BOTTOM = 23, BM_WALL_RIGHT = 24, BM_WALL_LU = 25,
  BM_WALL_RU = 26, BM_WALL_LD = 27, BM_WALL_RD = 28, BM_WALL_FILLED = 29, BM_WALL_UR = 30, BM_WALL_UL = 31, BM_SCORE_BG = 32,
  BM_LOGO = 33, BM_REFUEL = 34, BM_WORMHOLE = 35, BM_MINE_TEAM = 36, BM_MINE_OTHER = 37, BM_CONCENTRATOR = 38,
  BM_PLUSGRAVITY = 39, BM_MINUSGRAVITY = 40, BM_CHECKPOINT = 41, BM_METER = 42, BM_ASTEROIDCONC = 43, BM_BALL_GRAY = 44,
  NUM_OBJECT_BITMAPS = 45, NUM_BITMAPS = 45;
export const BMS_UNINITIALIZED = 0, BMS_INITIALIZED = 1, BMS_READY = 2, BMS_ERROR = -1;

// audio.h: the sounds, in the server's numbering
export const SOUND_NAMES = [
  'start', 'fire_shot', 'fire_torpedo', 'fire_heat_shot', 'fire_smart_shot', 'player_explosion', 'player_hit_player',
  'player_hit_cannon', 'player_hit_mine', 'player_eat_torpedo_shot', 'player_eat_heat_shot', 'player_eat_smart_shot',
  'drop_mine', 'player_hit_wall', 'worm_hole', 'wideangle_shot_pickup', 'sensor_pack_pickup', 'back_shot_pickup',
  'rocket_pack_pickup', 'cloaking_device_pickup', 'energy_pack_pickup', 'mine_pack_pickup', 'refuel', 'thrust', 'cloak',
  'change_home', 'ecm_pickup', 'afterburner_pickup', 'tank_pickup', 'drop_moving_mine', 'mine_explosion', 'ecm',
  'tank_detach', 'cannon_fire', 'player_shot_themself', 'declare_war', 'player_hit_cannonfire', 'object_explosion',
  'player_eat_shot', 'transporter_pickup', 'transporter_success', 'transporter_fail', 'deflector_pickup', 'deflector',
  'hyperjump_pickup', 'hyperjump', 'phasing_device_pickup', 'phasing_on', 'phasing_off', 'mirror_pickup', 'armor_pickup',
  'nuke_launch', 'nuke_explosion', 'player_ran_over_player', 'laser_pickup', 'emergency_thrust_pickup', 'autopilot_pickup',
  'tractor_beam_pickup', 'player_bounced', 'fire_laser', 'autopilot_on', 'autopilot_off', 'emergency_thrust_on',
  'emergency_thrust_off', 'tractor_beam', 'pressor_beam', 'connect_ball', 'drop_ball', 'explode_ball', 'destroy_ball',
  'destroy_target', 'team_win', 'team_draw', 'player_win', 'player_draw', 'player_roasted', 'player_eat_laser',
  'emergency_shield_pickup', 'emergency_shield_on', 'emergency_shield_off', 'cannon_explosion', 'asteroid_hit',
  'asteroid_break',
];
export const MAX_SOUNDS = SOUND_NAMES.length;
