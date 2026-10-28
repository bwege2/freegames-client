// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: game/mapitems.h of Teeworlds 0.7.5 in TypeScript (the structs as int offsets into an item).

export const LAYERTYPE_INVALID = 0, LAYERTYPE_GAME = 1, LAYERTYPE_TILES = 2, LAYERTYPE_QUADS = 3;
export const MAPITEMTYPE_VERSION = 0, MAPITEMTYPE_INFO = 1, MAPITEMTYPE_IMAGE = 2, MAPITEMTYPE_ENVELOPE = 3, MAPITEMTYPE_GROUP = 4,
  MAPITEMTYPE_LAYER = 5, MAPITEMTYPE_ENVPOINTS = 6;
export const CURVETYPE_STEP = 0, CURVETYPE_LINEAR = 1, CURVETYPE_SLOW = 2, CURVETYPE_FAST = 3, CURVETYPE_SMOOTH = 4,
  CURVETYPE_BEZIER = 5, NUM_CURVETYPES = 6;
export const ENTITY_NULL = 0, ENTITY_SPAWN = 1, ENTITY_SPAWN_RED = 2, ENTITY_SPAWN_BLUE = 3, ENTITY_FLAGSTAND_RED = 4,
  ENTITY_FLAGSTAND_BLUE = 5, ENTITY_ARMOR_1 = 6, ENTITY_HEALTH_1 = 7, ENTITY_WEAPON_SHOTGUN = 8, ENTITY_WEAPON_GRENADE = 9,
  ENTITY_POWERUP_NINJA = 10, ENTITY_WEAPON_LASER = 11, NUM_ENTITIES = 12;
export const TILE_AIR = 0, TILE_SOLID = 1, TILE_DEATH = 2, TILE_NOHOOK = 3;
export const TILEFLAG_VFLIP = 1, TILEFLAG_HFLIP = 2, TILEFLAG_OPAQUE = 4, TILEFLAG_ROTATE = 8;
export const LAYERFLAG_DETAIL = 1, TILESLAYERFLAG_GAME = 1;
export const ENTITY_OFFSET = 255 - 16 * 4;

// CMapItemInfo
export const INFO_VERSION = 0, INFO_AUTHOR = 1, INFO_MAP_VERSION = 2, INFO_CREDITS = 3, INFO_LICENSE = 4;
// CMapItemImage
export const IMAGE_VERSION = 0, IMAGE_WIDTH = 1, IMAGE_HEIGHT = 2, IMAGE_EXTERNAL = 3, IMAGE_NAME = 4, IMAGE_DATA = 5, IMAGE_FORMAT = 6;
// CMapItemGroup
export const GROUP_VERSION = 0, GROUP_OFFSET_X = 1, GROUP_OFFSET_Y = 2, GROUP_PARALLAX_X = 3, GROUP_PARALLAX_Y = 4,
  GROUP_START_LAYER = 5, GROUP_NUM_LAYERS = 6, GROUP_USE_CLIPPING = 7, GROUP_CLIP_X = 8, GROUP_CLIP_Y = 9, GROUP_CLIP_W = 10,
  GROUP_CLIP_H = 11, GROUP_NAME = 12;
// CMapItemLayer
export const LAYER_VERSION = 0, LAYER_TYPE = 1, LAYER_FLAGS = 2;
// CMapItemLayerTilemap (after its CMapItemLayer); m_Color is r, g, b, a
export const TILEMAP_VERSION = 3, TILEMAP_WIDTH = 4, TILEMAP_HEIGHT = 5, TILEMAP_FLAGS = 6, TILEMAP_COLOR = 7,
  TILEMAP_COLOR_ENV = 11, TILEMAP_COLOR_ENV_OFFSET = 12, TILEMAP_IMAGE = 13, TILEMAP_DATA = 14, TILEMAP_NAME = 15;
// CMapItemLayerQuads
export const QUADS_VERSION = 3, QUADS_NUM_QUADS = 4, QUADS_DATA = 5, QUADS_IMAGE = 6, QUADS_NAME = 7;
// CMapItemEnvelope
export const ENV_VERSION = 0, ENV_CHANNELS = 1, ENV_START_POINT = 2, ENV_NUM_POINTS = 3, ENV_NAME = 4, ENV_SYNCHRONIZED = 12;
/** CQuad: 5 points (x, y), 4 colors (r, g, b, a), 4 texcoords (x, y), then PosEnv, PosEnvOffset, ColorEnv, ColorEnvOffset */
export const QUAD_INTS = 5 * 2 + 4 * 4 + 4 * 2 + 4;
export const QUAD_POINTS = 0, QUAD_COLORS = 10, QUAD_TEXCOORDS = 26, QUAD_POS_ENV = 34, QUAD_POS_ENV_OFFSET = 35, QUAD_COLOR_ENV = 36,
  QUAD_COLOR_ENV_OFFSET = 37;
/** CEnvPoint_v1: time, curvetype, values[4]; CEnvPoint adds the bezier tangents (4 x 4) */
export const ENVPOINT_V1_INTS = 6, ENVPOINT_INTS = 6 + 16;
