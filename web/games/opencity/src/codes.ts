// src/enum.h, src/structure/structure.h, src/simulator/simulator.h, src/main.h: OpenCity's codes and
// constants, with the original's values.

export const SC = {
  UNDEFINED: 0, TEST: 1, ANY: 2, PART: 3,
  RES: 10, COM: 11, IND: 12, PARK: 13, FLORA: 14,
  ROAD: 20,
  ELECTRIC: 30, ELINE: 31, EPLANT_COAL: 32, EPLANT_GAS: 33, EPLANT_OIL: 34, EPLANT_NUCLEAR: 35,
  FIREDEPT: 36, POLICEDEPT: 37, HOSPITALDEPT: 38, MILITARYDEPT: 39, EDUCATIONDEPT: 40,
} as const;

export const GC = {
  EMPTY: 0, TEST_BUILDING: 1,
  RES_ZONE0: 10, COM_ZONE0: 20, IND_ZONE0: 30,
  ROAD_O_N: 150, ELINE_O_N: 170,
  EPLANT_COAL: 300, EPLANT_NUCLEAR: 303,
  PARK0: 320,
  TREE_BEGIN: 330, TREE_END: 334,
  FIRE_DEPT: 350, POLICE_DEPT: 360, HOSPITAL_DEPT: 370, MILITARY_DEPT: 380, EDUCATION_DEPT: 390,
  VEHICLE_STD: 400, VEHICLE_FX: 430, VEHICLE_PICKUP: 440, VEHICLE_ROBBER: 441, VEHICLE_FIRE: 450,
  VEHICLE_POLICE: 460,
  MAX: 491,
} as const;

/** OPENCITY_STRUCTURE_TYPE */
export const ST = {
  UNDEFINED: 0, RESIDENCE: 1, COMMERCE: 2, INDUSTRY: 3, WATER: 4, ELECTRICITY: 5, GAS: 6, GOVERNMENT: 7,
  PATH: 8, TREE: 9, VEHICLE: 10,
} as const;

/** OPENCITY_TOOL_CODE */
export const TOOL = {
  NONE: 0, DESTROY: 1, ZONE_RES: 2, ZONE_COM: 3, ZONE_IND: 4, HEIGHT_UP: 5, HEIGHT_DOWN: 6, ROAD: 7, ELINE: 8,
  EPLANT_COAL: 9, EPLANT_NUCLEAR: 10, PARK: 11, FLORA: 12, FIRE: 13, POLICE: 14, HOSPITAL: 15, EDUCATION: 16,
  AGENT_POLICE: 17, AGENT_DEMONSTRATOR: 18, AGENT_ROBBER: 19, TEST_BUILDING: 20, QUERY: 21, NUMBER: 22,
} as const;
export const TOOL_NAMES = ['NONE', 'DESTROY', 'ZONE_RES', 'ZONE_COM', 'ZONE_IND', 'HEIGHT_UP', 'HEIGHT_DOWN', 'ROAD',
  'ELINE', 'EPLANT_COAL', 'EPLANT_NUCLEAR', 'PARK', 'FLORA', 'FIRE', 'POLICE', 'HOSPITAL', 'EDUCATION',
  'AGENT_POLICE', 'AGENT_DEMONSTRATOR', 'AGENT_ROBBER', 'TEST_BUILDING', 'QUERY'];

/** OPENCITY_DIRECTION (src/enum/opencity_direction.h) */
export const DIR = { O_N: 0, O_E: 1, O_S: 2, O_W: 3, S_N: 4, W_E: 5, N_E: 6, N_W: 7, S_E: 8, S_W: 9 } as const;

/** structure status bits */
export const BIT = { R: 0x01, C: 0x02, I: 0x04, W: 0x08, E: 0x10, G: 0x20, P: 0x40, MARK: 0x80 } as const;

export const LEVEL = { START: 0, MAX: 99, MIN: 0, RATIO: 10 } as const;

/** OPENCITY_PROPERTY_CODE */
export const PROP = { TOOL_COST: 0, DESTROY_COST: 1, MAINTENANCE_COST: 2, INCOME: 3 } as const;

/** OPENCITY_SOUND_EFFECT: indexes into sound/sound.m3u */
export const SOUND = { DESTROY: 0, ELINE: 1, EPLANT: 2, PARK: 3, RCI: 4, ROAD: 5, TERRAIN: 6 } as const;

export const OC = {
  FUND_START: 15000, R_INCOME_TAX: 8, C_INCOME_TAX: 8, I_INCOME_TAX: 9, INCOME_HELP: 10,
  MAP_HEIGHT_MAX: 10, MAP_HEIGHT_MIN: -10, CHANCE_COUNTER_MAX: 300,
  MS_PER_DAY: 1750, MS_GLOBAL_LOG_FACTOR: 500, MS_STRUCTURE_LOG_FACTOR: 400,
  MAX_RESSOURCE_RECORD: 20,
} as const;

/** simulator.h */
export const RANGE = {
  R_C: 4, R_I: 7, R_P: 3, C_R: 4, C_I: 8, C_P: 2, I_R: 7, I_C: 8, I_P: 4, E_E: 1, E_RCI: 2, P_RCIP: 2,
} as const;
export const SIM = {
  UP: 70, DOWN: 40, EPLANT_COAL_POWER: 20000, EPLANT_NUCLEAR_POWER: 50000, DEPT_POWER_CONSUMPTION: 50,
  RESIDENTIAL: 0, COMMERCIAL: 1, INDUSTRIAL: 2, ELECTRIC: 3, TRAFFIC: 4, NUMBER: 5,
} as const;

/** OpenCity's version (globalvar.h): the save file's signature says 0.0.7 */
export const VERSION = { str: '0.0.7', long: 7 } as const;
