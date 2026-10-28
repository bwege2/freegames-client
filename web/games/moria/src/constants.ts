// The constants and enums of Umoria 5.7.15's headers (src/*.h), with their names. Enums are objects of
// numbers (PlayerEquipment.Wield). The configuration namespaces of config.h are in config.ts.

// version.h
export const CURRENT_VERSION_MAJOR = 5;
export const CURRENT_VERSION_MINOR = 7;
export const CURRENT_VERSION_PATCH = 15;

// types.h
export const MORIA_MESSAGE_SIZE = 80;

// ui.h
export const MSG_LINE = 0;
export const MESSAGE_HISTORY_SIZE = 22;
export const STAT_COLUMN = 0;
/** CTRL_KEY(x): the control character of x ('R' -> '\x12') */
export function CTRL_KEY(x: string): string {
  return String.fromCharCode(x.charCodeAt(0) & 0x1f);
}
export const DELETE = '\x7f';
export const ESCAPE = '\x1b';

// dungeon.h
export const RATIO = 3;
export const MAX_HEIGHT = 66;
export const MAX_WIDTH = 198;
export const SCREEN_HEIGHT = 22;
export const SCREEN_WIDTH = 66;
export const QUART_HEIGHT = 5; // SCREEN_HEIGHT / 4
export const QUART_WIDTH = 16; // SCREEN_WIDTH / 4

// dungeon_tile.h
export const TILE_NULL_WALL = 0;
export const TILE_DARK_FLOOR = 1;
export const TILE_LIGHT_FLOOR = 2;
export const MAX_CAVE_ROOM = 2;
export const TILE_CORR_FLOOR = 3;
export const TILE_BLOCKED_FLOOR = 4;
export const MAX_CAVE_FLOOR = 4;
export const MAX_OPEN_SPACE = 3;
export const MIN_CLOSED_SPACE = 4;
export const TMP1_WALL = 8;
export const TMP2_WALL = 9;
export const MIN_CAVE_WALL = 12;
export const TILE_GRANITE_WALL = 12;
export const TILE_MAGMA_WALL = 13;
export const TILE_QUARTZ_WALL = 14;
export const TILE_BOUNDARY_WALL = 15;

// game.h
export const TREASURE_MAX_LEVELS = 50;
export const MAX_OBJECTS_IN_GAME = 420;
export const MAX_DUNGEON_OBJECTS = 344;
export const OBJECT_IDENT_SIZE = 448;
export const LEVEL_MAX_OBJECTS = 175;
export const NORMAL_TABLE_SIZE = 256;
export const NORMAL_TABLE_SD = 64;
/** enum class Screen (game.h) */
export const Screen = { Blank: 0, Equipment: 1, Inventory: 2, Wear: 3, Help: 4, Wrong: 5 } as const;

// inventory.h
export const PLAYER_INVENTORY_SIZE = 34;
export const ITEM_NEVER_STACK_MIN = 0;
export const ITEM_NEVER_STACK_MAX = 63;
export const ITEM_SINGLE_STACK_MIN = 64;
export const ITEM_SINGLE_STACK_MAX = 192;
export const ITEM_GROUP_MIN = 192;
export const ITEM_GROUP_MAX = 255;
export const INSCRIP_SIZE = 13;
/** enum PlayerEquipment (inventory.h) */
export const PlayerEquipment = {
  Wield: 22, Head: 23, Neck: 24, Body: 25, Arm: 26, Hands: 27, Right: 28, Left: 29, Feet: 30, Outer: 31, Light: 32, Auxiliary: 33,
} as const;

// player.h
/** enum PlayerClassLevelAdj (player.h) */
export const PlayerClassLevelAdj = { BTH: 0, BTHB: 1, DEVICE: 2, DISARM: 3, SAVE: 4 } as const;
/** enum PlayerAttr (player.h) */
export const PlayerAttr = { A_STR: 0, A_INT: 1, A_WIS: 2, A_DEX: 3, A_CON: 4, A_CHR: 5 } as const;
export const CLASS_MISC_HIT = 4;
export const CLASS_MAX_LEVEL_ADJUST = 5;
export const PLAYER_MAX_LEVEL = 40;
export const PLAYER_MAX_CLASSES = 6;
export const PLAYER_MAX_RACES = 8;
export const PLAYER_MAX_BACKGROUNDS = 128;
export const BTH_PER_PLUS_TO_HIT_ADJUST = 3;
export const PLAYER_NAME_SIZE = 27;

// monster.h
export const MON_MAX_CREATURES = 279;
export const MON_ATTACK_TYPES = 215;
export const MON_TOTAL_ALLOCATIONS = 125;
export const MON_MAX_LEVELS = 40;
export const MON_MAX_ATTACKS = 4;

// identification.h
/** enum SpecialNameIds (identification.h) */
export const SpecialNameIds = {
  SN_NULL: 0, SN_R: 1, SN_RA: 2, SN_RF: 3, SN_RC: 4, SN_RL: 5, SN_HA: 6, SN_DF: 7, SN_SA: 8, SN_SD: 9, SN_SE: 10,
  SN_SU: 11, SN_FT: 12, SN_FB: 13, SN_FREE_ACTION: 14, SN_SLAYING: 15, SN_CLUMSINESS: 16, SN_WEAKNESS: 17,
  SN_SLOW_DESCENT: 18, SN_SPEED: 19, SN_STEALTH: 20, SN_SLOWNESS: 21, SN_NOISE: 22, SN_GREAT_MASS: 23,
  SN_INTELLIGENCE: 24, SN_WISDOM: 25, SN_INFRAVISION: 26, SN_MIGHT: 27, SN_LORDLINESS: 28, SN_MAGI: 29,
  SN_BEAUTY: 30, SN_SEEING: 31, SN_REGENERATION: 32, SN_STUPIDITY: 33, SN_DULLNESS: 34, SN_BLINDNESS: 35,
  SN_TIMIDNESS: 36, SN_TELEPORTATION: 37, SN_UGLINESS: 38, SN_PROTECTION: 39, SN_IRRITATION: 40,
  SN_VULNERABILITY: 41, SN_ENVELOPING: 42, SN_FIRE: 43, SN_SLAY_EVIL: 44, SN_DRAGON_SLAYING: 45, SN_EMPTY: 46,
  SN_LOCKED: 47, SN_POISON_NEEDLE: 48, SN_GAS_TRAP: 49, SN_EXPLOSION_DEVICE: 50, SN_SUMMONING_RUNES: 51,
  SN_MULTIPLE_TRAPS: 52, SN_DISARMED: 53, SN_UNLOCKED: 54, SN_SLAY_ANIMAL: 55, SN_ARRAY_SIZE: 56,
} as const;
export const MAX_COLORS = 49;
export const MAX_MUSHROOMS = 22;
export const MAX_WOODS = 25;
export const MAX_METALS = 25;
export const MAX_ROCKS = 32;
export const MAX_AMULETS = 11;
export const MAX_TITLES = 45;
export const MAX_SYLLABLES = 153;

// treasure.h
export const TV_NEVER = -1;
export const TV_NOTHING = 0;
export const TV_MISC = 1;
export const TV_CHEST = 2;
export const TV_MIN_WEAR = 10;
export const TV_MIN_ENCHANT = 10;
export const TV_SLING_AMMO = 10;
export const TV_BOLT = 11;
export const TV_ARROW = 12;
export const TV_SPIKE = 13;
export const TV_LIGHT = 15;
export const TV_BOW = 20;
export const TV_HAFTED = 21;
export const TV_POLEARM = 22;
export const TV_SWORD = 23;
export const TV_DIGGING = 25;
export const TV_BOOTS = 30;
export const TV_GLOVES = 31;
export const TV_CLOAK = 32;
export const TV_HELM = 33;
export const TV_SHIELD = 34;
export const TV_HARD_ARMOR = 35;
export const TV_SOFT_ARMOR = 36;
export const TV_MAX_ENCHANT = 39;
export const TV_AMULET = 40;
export const TV_RING = 45;
export const TV_MAX_WEAR = 50;
export const TV_STAFF = 55;
export const TV_WAND = 65;
export const TV_SCROLL1 = 70;
export const TV_SCROLL2 = 71;
export const TV_POTION1 = 75;
export const TV_POTION2 = 76;
export const TV_FLASK = 77;
export const TV_FOOD = 80;
export const TV_MAGIC_BOOK = 90;
export const TV_PRAYER_BOOK = 91;
export const TV_MAX_OBJECT = 99;
export const TV_GOLD = 100;
export const TV_MAX_PICK_UP = 100;
export const TV_INVIS_TRAP = 101;
export const TV_MIN_VISIBLE = 102;
export const TV_VIS_TRAP = 102;
export const TV_RUBBLE = 103;
export const TV_MIN_DOORS = 104;
export const TV_OPEN_DOOR = 104;
export const TV_CLOSED_DOOR = 105;
export const TV_UP_STAIR = 107;
export const TV_DOWN_STAIR = 108;
export const TV_SECRET_DOOR = 109;
export const TV_STORE_DOOR = 110;
export const TV_MAX_VISIBLE = 110;

// store.h
export const MAX_OWNERS = 18;
export const MAX_STORES = 6;
export const STORE_MAX_DISCRETE_ITEMS = 24;
export const STORE_MAX_ITEM_TYPES = 26;
export const COST_ADJUSTMENT = 100;

// scores.h
export const MAX_HIGH_SCORE_ENTRIES = 1000;

// spells.h
/** enum MagicSpellFlags (spells.h) */
export const MagicSpellFlags = { MagicMissile: 0, Lightning: 1, PoisonGas: 2, Acid: 3, Frost: 4, Fire: 5, HolyOrb: 6 } as const;

// climits, as Umoria uses them
export const SHRT_MAX = 32767;
export const UCHAR_MAX = 255;
export const INT_MAX = 2147483647;
export const MAX_SHORT = 32767;
