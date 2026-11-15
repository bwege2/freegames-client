// lintypes.c: the groups (main_groups: name, need credit, size, colour, costs, fire chance, tech level)
// and the types (main_types: group and graphic), and readpng.c, which cuts the types' graphics out of
// opening/icons.png in the order of opening/iconlist.txt.
import { unzlibSync } from 'fflate';
import * as C from './consts.ts';
import { G } from './g.ts';
import { MT, MG } from './map.ts';
import { f32, toInt } from './c.ts';
import { fopen, type CFile } from './stdio.ts';
import { PATHS } from './g.ts';

export interface Group {
  name: string; no_credit: number; group: number; size: number; colour: number;
  cost_mul: number; bul_cost: number; fire_chance: number; cost: number; tech: number;
}

const GROUPS: [string, number, number, number, number, number, number, number, number, number][] = [
  ['Empty', 0, 0, 1, 76, 1, 1, 0, 0, 0],
  ['Power line', 0, 1, 1, 122, 2, 100, 0, 100, 200],
  ['Solar PS', 1, 2, 4, 118, 5, 100000, 33, 500000, 500],
  ['Substation', 0, 3, 2, 114, 2, 100, 50, 500, 200],
  ['Residential LL', 0, 4, 3, 216, 25, 1000, 75, 1000, 0],
  ['Farm', 0, 5, 4, 94, 20, 100, 20, 1000, 0],
  ['Market', 0, 6, 2, 156, 25, 100, 80, 100, 0],
  ['Track', 0, 7, 1, 32, 25, 10, 4, 1, 0],
  ['Coalmine', 0, 8, 4, 0, 25, 10000, 85, 10000, 85],
  ['Railway', 0, 9, 1, 178, 10, 1000, 6, 500, 180],
  ['Coal PS', 0, 10, 4, 0, 5, 200000, 80, 100000, 200],
  ['Road', 0, 11, 1, 242, 25, 50, 4, 100, 50],
  ['Lt. Industry', 0, 12, 3, 210, 25, 20000, 70, 20000, 160],
  ['University', 0, 13, 3, 150, 25, 20000, 40, 20000, 150],
  ['Commune', 0, 14, 4, 94, 2, 1000, 30, 1, 0],
  ['Ore mine', 0, 15, 4, 50, 10, 500000, 0, 500, 0],
  ['Rubbish tip', 0, 16, 4, 240, 25, 1000000, 50, 10000, 0],
  ['Port', 0, 17, 4, 156, 2, 1000, 50, 100000, 35],
  ['Hv. Industry', 0, 18, 4, 7, 20, 70000, 80, 50000, 170],
  ['Park', 1, 19, 1, 95, 25, 1000, 1, 1000, 2],
  ['Recycle', 1, 20, 2, 92, 5, 1000, 10, 100000, 232],
  ['Water', 0, 21, 1, 159, 2, 1000000, 0, 1000000, 0],
  ['Health centre', 0, 22, 2, 88, 2, 1000, 2, 100000, 110],
  ['Rocket pad', 1, 23, 4, 180, 2, 1, 0, 700000, 750],
  ['Windmill', 0, 24, 2, 89, 25, 1000, 10, 20000, 30],
  ['Monument', 0, 25, 2, 239, 25, 1000000, 0, 10000, 0],
  ['School', 0, 26, 2, 239, 25, 10000, 40, 10000, 1],
  ['Blacksmith', 0, 27, 2, 239, 25, 1000, 60, 5000, 3],
  ['Mill', 0, 28, 2, 239, 25, 1000, 60, 10000, 25],
  ['Pottery', 0, 29, 2, 44, 25, 1000, 50, 1000, 0],
  ["Fire sta'n", 0, 30, 2, 52, 10, 1000, 0, 20000, 22],
  ['Cricket pitch', 0, 31, 2, 244, 3, 1000, 20, 2000, 12],
  ['Burnt', 0, 32, 1, 62, 1, 1000, 0, 0, 0],
  ['Shanty town', 0, 33, 2, 54, 1, 100000, 25, 0, 0],
  ['Fire', 0, 34, 1, 62, 1, 1000, 0, 0, 0],
  ['Used', 0, 35, 1, 76, 1, 0, 0, 0, 0],
  ['Residential ML', 0, 36, 3, 216, 25, 1000, 75, 2000, 0],
  ['Residential HL', 0, 37, 3, 216, 25, 1000, 75, 4000, 0],
  ['Residential', 0, 38, 3, 216, 25, 1000, 75, 800, 0],
  ['Residential', 0, 39, 3, 216, 25, 1000, 75, 1600, 0],
  ['Residential', 0, 38, 3, 216, 25, 1000, 75, 3200, 0],
  ['EOF', 0, 0, 0, 0, 0, 0, 0, 0, 0],
];
export const main_groups: Group[] = GROUPS.map(([name, no_credit, group, size, colour, cost_mul, bul_cost, fire_chance, cost, tech]) =>
  ({ name, no_credit, group, size, colour, cost_mul, bul_cost, fire_chance, cost, tech }));

export interface Type { group: number; graphic: Uint8Array }
export const main_types: Type[] = Array.from({ length: C.NUM_OF_TYPES }, () => ({ group: 0, graphic: new Uint8Array(0) }));

/** readpng.c's LG() calls, in order: type, group, id in iconlist.txt */
const LG: [number, number, string][] = [
  [C.CST_GREEN, C.GROUP_BARE, C.LCT_GREEN_G],
  [C.CST_FIRE_1, C.GROUP_FIRE, C.LCT_FIRE_1_G],
  [C.CST_FIRE_2, C.GROUP_FIRE, C.LCT_FIRE_2_G],
  [C.CST_FIRE_3, C.GROUP_FIRE, C.LCT_FIRE_3_G],
  [C.CST_FIRE_4, C.GROUP_FIRE, C.LCT_FIRE_4_G],
  [C.CST_FIRE_5, C.GROUP_FIRE, C.LCT_FIRE_5_G],
  [C.CST_FIRE_DONE1, C.GROUP_FIRE, C.LCT_FIRE_DONE1_G],
  [C.CST_FIRE_DONE2, C.GROUP_FIRE, C.LCT_FIRE_DONE2_G],
  [C.CST_FIRE_DONE3, C.GROUP_FIRE, C.LCT_FIRE_DONE3_G],
  [C.CST_FIRE_DONE4, C.GROUP_FIRE, C.LCT_FIRE_DONE4_G],
  [C.CST_BURNT, C.GROUP_BURNT, C.LCT_BURNT_G],
  [C.CST_PARKLAND_PLANE, C.GROUP_PARKLAND, C.LCT_PARKLAND_PLANE_G],
  [C.CST_PARKLAND_LAKE, C.GROUP_PARKLAND, C.LCT_PARKLAND_LAKE_G],
  [C.CST_POWERL_H_L, C.GROUP_POWER_LINE, C.LCT_POWERL_H_L_G],
  [C.CST_POWERL_V_L, C.GROUP_POWER_LINE, C.LCT_POWERL_V_L_G],
  [C.CST_POWERL_LD_L, C.GROUP_POWER_LINE, C.LCT_POWERL_LD_L_G],
  [C.CST_POWERL_RD_L, C.GROUP_POWER_LINE, C.LCT_POWERL_RD_L_G],
  [C.CST_POWERL_LU_L, C.GROUP_POWER_LINE, C.LCT_POWERL_LU_L_G],
  [C.CST_POWERL_RU_L, C.GROUP_POWER_LINE, C.LCT_POWERL_RU_L_G],
  [C.CST_POWERL_LDU_L, C.GROUP_POWER_LINE, C.LCT_POWERL_LDU_L_G],
  [C.CST_POWERL_LDR_L, C.GROUP_POWER_LINE, C.LCT_POWERL_LDR_L_G],
  [C.CST_POWERL_LUR_L, C.GROUP_POWER_LINE, C.LCT_POWERL_LUR_L_G],
  [C.CST_POWERL_UDR_L, C.GROUP_POWER_LINE, C.LCT_POWERL_UDR_L_G],
  [C.CST_POWERL_LUDR_L, C.GROUP_POWER_LINE, C.LCT_POWERL_LUDR_L_G],
  [C.CST_POWERL_H_D, C.GROUP_POWER_LINE, C.LCT_POWERL_H_D_G],
  [C.CST_POWERL_V_D, C.GROUP_POWER_LINE, C.LCT_POWERL_V_D_G],
  [C.CST_POWERL_LD_D, C.GROUP_POWER_LINE, C.LCT_POWERL_LD_D_G],
  [C.CST_POWERL_RD_D, C.GROUP_POWER_LINE, C.LCT_POWERL_RD_D_G],
  [C.CST_POWERL_LU_D, C.GROUP_POWER_LINE, C.LCT_POWERL_LU_D_G],
  [C.CST_POWERL_RU_D, C.GROUP_POWER_LINE, C.LCT_POWERL_RU_D_G],
  [C.CST_POWERL_LDU_D, C.GROUP_POWER_LINE, C.LCT_POWERL_LDU_D_G],
  [C.CST_POWERL_LDR_D, C.GROUP_POWER_LINE, C.LCT_POWERL_LDR_D_G],
  [C.CST_POWERL_LUR_D, C.GROUP_POWER_LINE, C.LCT_POWERL_LUR_D_G],
  [C.CST_POWERL_UDR_D, C.GROUP_POWER_LINE, C.LCT_POWERL_UDR_D_G],
  [C.CST_POWERL_LUDR_D, C.GROUP_POWER_LINE, C.LCT_POWERL_LUDR_D_G],
  [C.CST_RAIL_LR, C.GROUP_RAIL, C.LCT_RAIL_LR_G],
  [C.CST_RAIL_LU, C.GROUP_RAIL, C.LCT_RAIL_LU_G],
  [C.CST_RAIL_LD, C.GROUP_RAIL, C.LCT_RAIL_LD_G],
  [C.CST_RAIL_UD, C.GROUP_RAIL, C.LCT_RAIL_UD_G],
  [C.CST_RAIL_UR, C.GROUP_RAIL, C.LCT_RAIL_UR_G],
  [C.CST_RAIL_DR, C.GROUP_RAIL, C.LCT_RAIL_DR_G],
  [C.CST_RAIL_LUR, C.GROUP_RAIL, C.LCT_RAIL_LUR_G],
  [C.CST_RAIL_LDR, C.GROUP_RAIL, C.LCT_RAIL_LDR_G],
  [C.CST_RAIL_LUD, C.GROUP_RAIL, C.LCT_RAIL_LUD_G],
  [C.CST_RAIL_UDR, C.GROUP_RAIL, C.LCT_RAIL_UDR_G],
  [C.CST_RAIL_LUDR, C.GROUP_RAIL, C.LCT_RAIL_LUDR_G],
  [C.CST_ROAD_LR, C.GROUP_ROAD, C.LCT_ROAD_LR_G],
  [C.CST_ROAD_LU, C.GROUP_ROAD, C.LCT_ROAD_LU_G],
  [C.CST_ROAD_LD, C.GROUP_ROAD, C.LCT_ROAD_LD_G],
  [C.CST_ROAD_UD, C.GROUP_ROAD, C.LCT_ROAD_UD_G],
  [C.CST_ROAD_UR, C.GROUP_ROAD, C.LCT_ROAD_UR_G],
  [C.CST_ROAD_DR, C.GROUP_ROAD, C.LCT_ROAD_DR_G],
  [C.CST_ROAD_LUR, C.GROUP_ROAD, C.LCT_ROAD_LUR_G],
  [C.CST_ROAD_LDR, C.GROUP_ROAD, C.LCT_ROAD_LDR_G],
  [C.CST_ROAD_LUD, C.GROUP_ROAD, C.LCT_ROAD_LUD_G],
  [C.CST_ROAD_UDR, C.GROUP_ROAD, C.LCT_ROAD_UDR_G],
  [C.CST_ROAD_LUDR, C.GROUP_ROAD, C.LCT_ROAD_LUDR_G],
  [C.CST_TRACK_LR, C.GROUP_TRACK, C.LCT_TRACK_LR_G],
  [C.CST_TRACK_LU, C.GROUP_TRACK, C.LCT_TRACK_LU_G],
  [C.CST_TRACK_LD, C.GROUP_TRACK, C.LCT_TRACK_LD_G],
  [C.CST_TRACK_UD, C.GROUP_TRACK, C.LCT_TRACK_UD_G],
  [C.CST_TRACK_UR, C.GROUP_TRACK, C.LCT_TRACK_UR_G],
  [C.CST_TRACK_DR, C.GROUP_TRACK, C.LCT_TRACK_DR_G],
  [C.CST_TRACK_LUR, C.GROUP_TRACK, C.LCT_TRACK_LUR_G],
  [C.CST_TRACK_LDR, C.GROUP_TRACK, C.LCT_TRACK_LDR_G],
  [C.CST_TRACK_LUD, C.GROUP_TRACK, C.LCT_TRACK_LUD_G],
  [C.CST_TRACK_UDR, C.GROUP_TRACK, C.LCT_TRACK_UDR_G],
  [C.CST_TRACK_LUDR, C.GROUP_TRACK, C.LCT_TRACK_LUDR_G],
  [C.CST_WATER, C.GROUP_WATER, C.LCT_WATER_G],
  [C.CST_WATER_D, C.GROUP_WATER, C.LCT_WATER_D_G],
  [C.CST_WATER_R, C.GROUP_WATER, C.LCT_WATER_R_G],
  [C.CST_WATER_U, C.GROUP_WATER, C.LCT_WATER_U_G],
  [C.CST_WATER_L, C.GROUP_WATER, C.LCT_WATER_L_G],
  [C.CST_WATER_LR, C.GROUP_WATER, C.LCT_WATER_LR_G],
  [C.CST_WATER_UD, C.GROUP_WATER, C.LCT_WATER_UD_G],
  [C.CST_WATER_LD, C.GROUP_WATER, C.LCT_WATER_LD_G],
  [C.CST_WATER_RD, C.GROUP_WATER, C.LCT_WATER_RD_G],
  [C.CST_WATER_LU, C.GROUP_WATER, C.LCT_WATER_LU_G],
  [C.CST_WATER_UR, C.GROUP_WATER, C.LCT_WATER_UR_G],
  [C.CST_WATER_LUD, C.GROUP_WATER, C.LCT_WATER_LUD_G],
  [C.CST_WATER_LRD, C.GROUP_WATER, C.LCT_WATER_LRD_G],
  [C.CST_WATER_LUR, C.GROUP_WATER, C.LCT_WATER_LUR_G],
  [C.CST_WATER_URD, C.GROUP_WATER, C.LCT_WATER_URD_G],
  [C.CST_WATER_LURD, C.GROUP_WATER, C.LCT_WATER_LURD_G],
  [C.CST_BLACKSMITH_0, C.GROUP_BLACKSMITH, C.LCT_BLACKSMITH_0_G],
  [C.CST_BLACKSMITH_1, C.GROUP_BLACKSMITH, C.LCT_BLACKSMITH_1_G],
  [C.CST_BLACKSMITH_2, C.GROUP_BLACKSMITH, C.LCT_BLACKSMITH_2_G],
  [C.CST_BLACKSMITH_3, C.GROUP_BLACKSMITH, C.LCT_BLACKSMITH_3_G],
  [C.CST_BLACKSMITH_4, C.GROUP_BLACKSMITH, C.LCT_BLACKSMITH_4_G],
  [C.CST_BLACKSMITH_5, C.GROUP_BLACKSMITH, C.LCT_BLACKSMITH_5_G],
  [C.CST_BLACKSMITH_6, C.GROUP_BLACKSMITH, C.LCT_BLACKSMITH_6_G],
  [C.CST_CRICKET_1, C.GROUP_CRICKET, C.LCT_CRICKET_1_G],
  [C.CST_CRICKET_2, C.GROUP_CRICKET, C.LCT_CRICKET_2_G],
  [C.CST_CRICKET_3, C.GROUP_CRICKET, C.LCT_CRICKET_3_G],
  [C.CST_CRICKET_4, C.GROUP_CRICKET, C.LCT_CRICKET_4_G],
  [C.CST_CRICKET_5, C.GROUP_CRICKET, C.LCT_CRICKET_5_G],
  [C.CST_CRICKET_6, C.GROUP_CRICKET, C.LCT_CRICKET_6_G],
  [C.CST_CRICKET_7, C.GROUP_CRICKET, C.LCT_CRICKET_7_G],
  [C.CST_FIRESTATION_1, C.GROUP_FIRESTATION, C.LCT_FIRESTATION_1_G],
  [C.CST_FIRESTATION_2, C.GROUP_FIRESTATION, C.LCT_FIRESTATION_2_G],
  [C.CST_FIRESTATION_3, C.GROUP_FIRESTATION, C.LCT_FIRESTATION_3_G],
  [C.CST_FIRESTATION_4, C.GROUP_FIRESTATION, C.LCT_FIRESTATION_4_G],
  [C.CST_FIRESTATION_5, C.GROUP_FIRESTATION, C.LCT_FIRESTATION_5_G],
  [C.CST_FIRESTATION_6, C.GROUP_FIRESTATION, C.LCT_FIRESTATION_6_G],
  [C.CST_FIRESTATION_7, C.GROUP_FIRESTATION, C.LCT_FIRESTATION_7_G],
  [C.CST_FIRESTATION_8, C.GROUP_FIRESTATION, C.LCT_FIRESTATION_8_G],
  [C.CST_FIRESTATION_9, C.GROUP_FIRESTATION, C.LCT_FIRESTATION_9_G],
  [C.CST_FIRESTATION_10, C.GROUP_FIRESTATION, C.LCT_FIRESTATION_10_G],
  [C.CST_HEALTH, C.GROUP_HEALTH, C.LCT_HEALTH_G],
  [C.CST_MARKET_EMPTY, C.GROUP_MARKET, C.LCT_MARKET_EMPTY_G],
  [C.CST_MARKET_LOW, C.GROUP_MARKET, C.LCT_MARKET_LOW_G],
  [C.CST_MARKET_MED, C.GROUP_MARKET, C.LCT_MARKET_MED_G],
  [C.CST_MARKET_FULL, C.GROUP_MARKET, C.LCT_MARKET_FULL_G],
  [C.CST_MILL_0, C.GROUP_MILL, C.LCT_MILL_0_G],
  [C.CST_MILL_1, C.GROUP_MILL, C.LCT_MILL_1_G],
  [C.CST_MILL_2, C.GROUP_MILL, C.LCT_MILL_2_G],
  [C.CST_MILL_3, C.GROUP_MILL, C.LCT_MILL_3_G],
  [C.CST_MILL_4, C.GROUP_MILL, C.LCT_MILL_4_G],
  [C.CST_MILL_5, C.GROUP_MILL, C.LCT_MILL_5_G],
  [C.CST_MILL_6, C.GROUP_MILL, C.LCT_MILL_6_G],
  [C.CST_MONUMENT_0, C.GROUP_MONUMENT, C.LCT_MONUMENT_0_G],
  [C.CST_MONUMENT_1, C.GROUP_MONUMENT, C.LCT_MONUMENT_1_G],
  [C.CST_MONUMENT_2, C.GROUP_MONUMENT, C.LCT_MONUMENT_2_G],
  [C.CST_MONUMENT_3, C.GROUP_MONUMENT, C.LCT_MONUMENT_3_G],
  [C.CST_MONUMENT_4, C.GROUP_MONUMENT, C.LCT_MONUMENT_4_G],
  [C.CST_MONUMENT_5, C.GROUP_MONUMENT, C.LCT_MONUMENT_5_G],
  [C.CST_POTTERY_0, C.GROUP_POTTERY, C.LCT_POTTERY_0_G],
  [C.CST_POTTERY_1, C.GROUP_POTTERY, C.LCT_POTTERY_1_G],
  [C.CST_POTTERY_2, C.GROUP_POTTERY, C.LCT_POTTERY_2_G],
  [C.CST_POTTERY_3, C.GROUP_POTTERY, C.LCT_POTTERY_3_G],
  [C.CST_POTTERY_4, C.GROUP_POTTERY, C.LCT_POTTERY_4_G],
  [C.CST_POTTERY_5, C.GROUP_POTTERY, C.LCT_POTTERY_5_G],
  [C.CST_POTTERY_6, C.GROUP_POTTERY, C.LCT_POTTERY_6_G],
  [C.CST_POTTERY_7, C.GROUP_POTTERY, C.LCT_POTTERY_7_G],
  [C.CST_POTTERY_8, C.GROUP_POTTERY, C.LCT_POTTERY_8_G],
  [C.CST_POTTERY_9, C.GROUP_POTTERY, C.LCT_POTTERY_9_G],
  [C.CST_POTTERY_10, C.GROUP_POTTERY, C.LCT_POTTERY_10_G],
  [C.CST_RECYCLE, C.GROUP_RECYCLE, C.LCT_RECYCLE_G],
  [C.CST_SCHOOL, C.GROUP_SCHOOL, C.LCT_SCHOOL_G],
  [C.CST_SHANTY, C.GROUP_SHANTY, C.LCT_SHANTY_G],
  [C.CST_SUBSTATION_R, C.GROUP_SUBSTATION, C.LCT_SUBSTATION_R_G],
  [C.CST_SUBSTATION_G, C.GROUP_SUBSTATION, C.LCT_SUBSTATION_G_G],
  [C.CST_SUBSTATION_RG, C.GROUP_SUBSTATION, C.LCT_SUBSTATION_RG_G],
  [C.CST_WINDMILL_1_G, C.GROUP_WINDMILL, C.LCT_WINDMILL_1_G_G],
  [C.CST_WINDMILL_2_G, C.GROUP_WINDMILL, C.LCT_WINDMILL_2_G_G],
  [C.CST_WINDMILL_3_G, C.GROUP_WINDMILL, C.LCT_WINDMILL_3_G_G],
  [C.CST_WINDMILL_1_RG, C.GROUP_WINDMILL, C.LCT_WINDMILL_1_RG_G],
  [C.CST_WINDMILL_2_RG, C.GROUP_WINDMILL, C.LCT_WINDMILL_2_RG_G],
  [C.CST_WINDMILL_3_RG, C.GROUP_WINDMILL, C.LCT_WINDMILL_3_RG_G],
  [C.CST_WINDMILL_1_R, C.GROUP_WINDMILL, C.LCT_WINDMILL_1_R_G],
  [C.CST_WINDMILL_2_R, C.GROUP_WINDMILL, C.LCT_WINDMILL_2_R_G],
  [C.CST_WINDMILL_3_R, C.GROUP_WINDMILL, C.LCT_WINDMILL_3_R_G],
  [C.CST_WINDMILL_1_W, C.GROUP_WINDMILL, C.LCT_WINDMILL_1_W_G],
  [C.CST_WINDMILL_2_W, C.GROUP_WINDMILL, C.LCT_WINDMILL_2_W_G],
  [C.CST_WINDMILL_3_W, C.GROUP_WINDMILL, C.LCT_WINDMILL_3_W_G],
  [C.CST_INDUSTRY_L_C, C.GROUP_INDUSTRY_L, C.LCT_INDUSTRY_L_C_G],
  [C.CST_INDUSTRY_L_Q1, C.GROUP_INDUSTRY_L, C.LCT_INDUSTRY_L_Q1_G],
  [C.CST_INDUSTRY_L_Q2, C.GROUP_INDUSTRY_L, C.LCT_INDUSTRY_L_Q2_G],
  [C.CST_INDUSTRY_L_Q3, C.GROUP_INDUSTRY_L, C.LCT_INDUSTRY_L_Q3_G],
  [C.CST_INDUSTRY_L_Q4, C.GROUP_INDUSTRY_L, C.LCT_INDUSTRY_L_Q4_G],
  [C.CST_INDUSTRY_L_L1, C.GROUP_INDUSTRY_L, C.LCT_INDUSTRY_L_L1_G],
  [C.CST_INDUSTRY_L_L2, C.GROUP_INDUSTRY_L, C.LCT_INDUSTRY_L_L2_G],
  [C.CST_INDUSTRY_L_L3, C.GROUP_INDUSTRY_L, C.LCT_INDUSTRY_L_L3_G],
  [C.CST_INDUSTRY_L_L4, C.GROUP_INDUSTRY_L, C.LCT_INDUSTRY_L_L4_G],
  [C.CST_INDUSTRY_L_M1, C.GROUP_INDUSTRY_L, C.LCT_INDUSTRY_L_M1_G],
  [C.CST_INDUSTRY_L_M2, C.GROUP_INDUSTRY_L, C.LCT_INDUSTRY_L_M2_G],
  [C.CST_INDUSTRY_L_M3, C.GROUP_INDUSTRY_L, C.LCT_INDUSTRY_L_M3_G],
  [C.CST_INDUSTRY_L_M4, C.GROUP_INDUSTRY_L, C.LCT_INDUSTRY_L_M4_G],
  [C.CST_INDUSTRY_L_H1, C.GROUP_INDUSTRY_L, C.LCT_INDUSTRY_L_H1_G],
  [C.CST_INDUSTRY_L_H2, C.GROUP_INDUSTRY_L, C.LCT_INDUSTRY_L_H2_G],
  [C.CST_INDUSTRY_L_H3, C.GROUP_INDUSTRY_L, C.LCT_INDUSTRY_L_H3_G],
  [C.CST_INDUSTRY_L_H4, C.GROUP_INDUSTRY_L, C.LCT_INDUSTRY_L_H4_G],
  [C.CST_RESIDENCE_LL, C.GROUP_RESIDENCE_LL, C.LCT_RESIDENCE_LL_G],
  [C.CST_RESIDENCE_ML, C.GROUP_RESIDENCE_ML, C.LCT_RESIDENCE_ML_G],
  [C.CST_RESIDENCE_HL, C.GROUP_RESIDENCE_HL, C.LCT_RESIDENCE_HL_G],
  [C.CST_RESIDENCE_LH, C.GROUP_RESIDENCE_LH, C.LCT_RESIDENCE_LH_G],
  [C.CST_RESIDENCE_MH, C.GROUP_RESIDENCE_MH, C.LCT_RESIDENCE_MH_G],
  [C.CST_RESIDENCE_HH, C.GROUP_RESIDENCE_HH, C.LCT_RESIDENCE_HH_G],
  [C.CST_UNIVERSITY, C.GROUP_UNIVERSITY, C.LCT_UNIVERSITY_G],
  [C.CST_COALMINE_EMPTY, C.GROUP_COALMINE, C.LCT_COALMINE_EMPTY_G],
  [C.CST_COALMINE_LOW, C.GROUP_COALMINE, C.LCT_COALMINE_LOW_G],
  [C.CST_COALMINE_MED, C.GROUP_COALMINE, C.LCT_COALMINE_MED_G],
  [C.CST_COALMINE_FULL, C.GROUP_COALMINE, C.LCT_COALMINE_FULL_G],
  [C.CST_COMMUNE_1, C.GROUP_COMMUNE, C.LCT_COMMUNE_1_G],
  [C.CST_COMMUNE_2, C.GROUP_COMMUNE, C.LCT_COMMUNE_2_G],
  [C.CST_COMMUNE_3, C.GROUP_COMMUNE, C.LCT_COMMUNE_3_G],
  [C.CST_COMMUNE_4, C.GROUP_COMMUNE, C.LCT_COMMUNE_4_G],
  [C.CST_COMMUNE_5, C.GROUP_COMMUNE, C.LCT_COMMUNE_5_G],
  [C.CST_COMMUNE_6, C.GROUP_COMMUNE, C.LCT_COMMUNE_6_G],
  [C.CST_COMMUNE_7, C.GROUP_COMMUNE, C.LCT_COMMUNE_7_G],
  [C.CST_COMMUNE_8, C.GROUP_COMMUNE, C.LCT_COMMUNE_8_G],
  [C.CST_COMMUNE_9, C.GROUP_COMMUNE, C.LCT_COMMUNE_9_G],
  [C.CST_COMMUNE_10, C.GROUP_COMMUNE, C.LCT_COMMUNE_10_G],
  [C.CST_COMMUNE_11, C.GROUP_COMMUNE, C.LCT_COMMUNE_11_G],
  [C.CST_COMMUNE_12, C.GROUP_COMMUNE, C.LCT_COMMUNE_12_G],
  [C.CST_COMMUNE_13, C.GROUP_COMMUNE, C.LCT_COMMUNE_13_G],
  [C.CST_COMMUNE_14, C.GROUP_COMMUNE, C.LCT_COMMUNE_14_G],
  [C.CST_EX_PORT, C.GROUP_PORT, C.LCT_EX_PORT_G],
  [C.CST_FARM_O0, C.GROUP_ORGANIC_FARM, C.LCT_FARM_O0_G],
  [C.CST_FARM_O1, C.GROUP_ORGANIC_FARM, C.LCT_FARM_O1_G],
  [C.CST_FARM_O2, C.GROUP_ORGANIC_FARM, C.LCT_FARM_O2_G],
  [C.CST_FARM_O3, C.GROUP_ORGANIC_FARM, C.LCT_FARM_O3_G],
  [C.CST_FARM_O4, C.GROUP_ORGANIC_FARM, C.LCT_FARM_O4_G],
  [C.CST_FARM_O5, C.GROUP_ORGANIC_FARM, C.LCT_FARM_O5_G],
  [C.CST_FARM_O6, C.GROUP_ORGANIC_FARM, C.LCT_FARM_O6_G],
  [C.CST_FARM_O7, C.GROUP_ORGANIC_FARM, C.LCT_FARM_O7_G],
  [C.CST_FARM_O8, C.GROUP_ORGANIC_FARM, C.LCT_FARM_O8_G],
  [C.CST_FARM_O9, C.GROUP_ORGANIC_FARM, C.LCT_FARM_O9_G],
  [C.CST_FARM_O10, C.GROUP_ORGANIC_FARM, C.LCT_FARM_O10_G],
  [C.CST_FARM_O11, C.GROUP_ORGANIC_FARM, C.LCT_FARM_O11_G],
  [C.CST_FARM_O12, C.GROUP_ORGANIC_FARM, C.LCT_FARM_O12_G],
  [C.CST_FARM_O13, C.GROUP_ORGANIC_FARM, C.LCT_FARM_O13_G],
  [C.CST_FARM_O14, C.GROUP_ORGANIC_FARM, C.LCT_FARM_O14_G],
  [C.CST_FARM_O15, C.GROUP_ORGANIC_FARM, C.LCT_FARM_O15_G],
  [C.CST_FARM_O16, C.GROUP_ORGANIC_FARM, C.LCT_FARM_O16_G],
  [C.CST_INDUSTRY_H_C, C.GROUP_INDUSTRY_H, C.LCT_INDUSTRY_H_C_G],
  [C.CST_INDUSTRY_H_L1, C.GROUP_INDUSTRY_H, C.LCT_INDUSTRY_H_L1_G],
  [C.CST_INDUSTRY_H_L2, C.GROUP_INDUSTRY_H, C.LCT_INDUSTRY_H_L2_G],
  [C.CST_INDUSTRY_H_L3, C.GROUP_INDUSTRY_H, C.LCT_INDUSTRY_H_L3_G],
  [C.CST_INDUSTRY_H_L4, C.GROUP_INDUSTRY_H, C.LCT_INDUSTRY_H_L4_G],
  [C.CST_INDUSTRY_H_L5, C.GROUP_INDUSTRY_H, C.LCT_INDUSTRY_H_L5_G],
  [C.CST_INDUSTRY_H_L6, C.GROUP_INDUSTRY_H, C.LCT_INDUSTRY_H_L6_G],
  [C.CST_INDUSTRY_H_L7, C.GROUP_INDUSTRY_H, C.LCT_INDUSTRY_H_L7_G],
  [C.CST_INDUSTRY_H_L8, C.GROUP_INDUSTRY_H, C.LCT_INDUSTRY_H_L8_G],
  [C.CST_INDUSTRY_H_M1, C.GROUP_INDUSTRY_H, C.LCT_INDUSTRY_H_M1_G],
  [C.CST_INDUSTRY_H_M2, C.GROUP_INDUSTRY_H, C.LCT_INDUSTRY_H_M2_G],
  [C.CST_INDUSTRY_H_M3, C.GROUP_INDUSTRY_H, C.LCT_INDUSTRY_H_M3_G],
  [C.CST_INDUSTRY_H_M4, C.GROUP_INDUSTRY_H, C.LCT_INDUSTRY_H_M4_G],
  [C.CST_INDUSTRY_H_M5, C.GROUP_INDUSTRY_H, C.LCT_INDUSTRY_H_M5_G],
  [C.CST_INDUSTRY_H_M6, C.GROUP_INDUSTRY_H, C.LCT_INDUSTRY_H_M6_G],
  [C.CST_INDUSTRY_H_M7, C.GROUP_INDUSTRY_H, C.LCT_INDUSTRY_H_M7_G],
  [C.CST_INDUSTRY_H_M8, C.GROUP_INDUSTRY_H, C.LCT_INDUSTRY_H_M8_G],
  [C.CST_INDUSTRY_H_H1, C.GROUP_INDUSTRY_H, C.LCT_INDUSTRY_H_H1_G],
  [C.CST_INDUSTRY_H_H2, C.GROUP_INDUSTRY_H, C.LCT_INDUSTRY_H_H2_G],
  [C.CST_INDUSTRY_H_H3, C.GROUP_INDUSTRY_H, C.LCT_INDUSTRY_H_H3_G],
  [C.CST_INDUSTRY_H_H4, C.GROUP_INDUSTRY_H, C.LCT_INDUSTRY_H_H4_G],
  [C.CST_INDUSTRY_H_H5, C.GROUP_INDUSTRY_H, C.LCT_INDUSTRY_H_H5_G],
  [C.CST_INDUSTRY_H_H6, C.GROUP_INDUSTRY_H, C.LCT_INDUSTRY_H_H6_G],
  [C.CST_INDUSTRY_H_H7, C.GROUP_INDUSTRY_H, C.LCT_INDUSTRY_H_H7_G],
  [C.CST_INDUSTRY_H_H8, C.GROUP_INDUSTRY_H, C.LCT_INDUSTRY_H_H8_G],
  [C.CST_OREMINE_1, C.GROUP_OREMINE, C.LCT_OREMINE_1_G],
  [C.CST_OREMINE_2, C.GROUP_OREMINE, C.LCT_OREMINE_2_G],
  [C.CST_OREMINE_3, C.GROUP_OREMINE, C.LCT_OREMINE_3_G],
  [C.CST_OREMINE_4, C.GROUP_OREMINE, C.LCT_OREMINE_4_G],
  [C.CST_OREMINE_5, C.GROUP_OREMINE, C.LCT_OREMINE_5_G],
  [C.CST_OREMINE_6, C.GROUP_OREMINE, C.LCT_OREMINE_6_G],
  [C.CST_OREMINE_7, C.GROUP_OREMINE, C.LCT_OREMINE_7_G],
  [C.CST_OREMINE_8, C.GROUP_OREMINE, C.LCT_OREMINE_8_G],
  [C.CST_POWERS_COAL_EMPTY, C.GROUP_COAL_POWER, C.LCT_POWERS_COAL_EMPTY_G],
  [C.CST_POWERS_COAL_LOW, C.GROUP_COAL_POWER, C.LCT_POWERS_COAL_LOW_G],
  [C.CST_POWERS_COAL_MED, C.GROUP_COAL_POWER, C.LCT_POWERS_COAL_MED_G],
  [C.CST_POWERS_COAL_FULL, C.GROUP_COAL_POWER, C.LCT_POWERS_COAL_FULL_G],
  [C.CST_POWERS_SOLAR, C.GROUP_SOLAR_POWER, C.LCT_POWERS_SOLAR_G],
  [C.CST_ROCKET_1, C.GROUP_ROCKET, C.LCT_ROCKET_1_G],
  [C.CST_ROCKET_2, C.GROUP_ROCKET, C.LCT_ROCKET_2_G],
  [C.CST_ROCKET_3, C.GROUP_ROCKET, C.LCT_ROCKET_3_G],
  [C.CST_ROCKET_4, C.GROUP_ROCKET, C.LCT_ROCKET_4_G],
  [C.CST_ROCKET_5, C.GROUP_ROCKET, C.LCT_ROCKET_5_G],
  [C.CST_ROCKET_6, C.GROUP_ROCKET, C.LCT_ROCKET_6_G],
  [C.CST_ROCKET_7, C.GROUP_ROCKET, C.LCT_ROCKET_7_G],
  [C.CST_ROCKET_FLOWN, C.GROUP_ROCKET, C.LCT_ROCKET_FLOWN_G],
  [C.CST_TIP_0, C.GROUP_TIP, C.LCT_TIP_0_G],
  [C.CST_TIP_1, C.GROUP_TIP, C.LCT_TIP_1_G],
  [C.CST_TIP_2, C.GROUP_TIP, C.LCT_TIP_2_G],
  [C.CST_TIP_3, C.GROUP_TIP, C.LCT_TIP_3_G],
  [C.CST_TIP_4, C.GROUP_TIP, C.LCT_TIP_4_G],
  [C.CST_TIP_5, C.GROUP_TIP, C.LCT_TIP_5_G],
  [C.CST_TIP_6, C.GROUP_TIP, C.LCT_TIP_6_G],
  [C.CST_TIP_7, C.GROUP_TIP, C.LCT_TIP_7_G],
  [C.CST_TIP_8, C.GROUP_TIP, C.LCT_TIP_8_G],

];

/** the image data of a PNG with an 8-bit palette (what readpng.c asks libpng for): rows of colour indices */
export function decodePng8(png: Uint8Array): { width: number; height: number; rows: Uint8Array[] } | null {
  const dv = new DataView(png.buffer, png.byteOffset, png.byteLength);
  let pos = 8;
  let width = 0, height = 0, depth = 0, ctype = 0;
  const idat: Uint8Array[] = [];
  while (pos + 8 <= png.length) {
    const len = dv.getUint32(pos);
    const type = String.fromCharCode(png[pos + 4], png[pos + 5], png[pos + 6], png[pos + 7]);
    const body = png.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      width = dv.getUint32(pos + 8);
      height = dv.getUint32(pos + 12);
      depth = body[8];
      ctype = body[9];
    } else if (type === 'IDAT') idat.push(body);
    else if (type === 'IEND') break;
    pos += 12 + len;
  }
  if (ctype !== 3 || depth !== 8) return null;
  const total = idat.reduce((n, b) => n + b.length, 0);
  const z = new Uint8Array(total);
  let o = 0;
  for (const b of idat) { z.set(b, o); o += b.length; }
  const raw = unzlibSync(z);
  const rows: Uint8Array[] = [];
  let prev = new Uint8Array(width);
  for (let y = 0; y < height; y++) {
    const f = raw[y * (width + 1)];
    const src = raw.subarray(y * (width + 1) + 1, (y + 1) * (width + 1));
    const row = new Uint8Array(width);
    for (let x = 0; x < width; x++) {
      const a = x > 0 ? row[x - 1] : 0;
      const b = prev[x];
      const c = x > 0 ? prev[x - 1] : 0;
      let v = src[x];
      switch (f) {
        case 1: v += a; break;
        case 2: v += b; break;
        case 3: v += (a + b) >> 1; break;
        case 4: {
          const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
          v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
          break;
        }
      }
      row[x] = v & 0xff;
    }
    rows.push(row);
    prev = row;
  }
  return { width, height, rows };
}

function load_png_graphic(type: number, group: number, id: string, txt: CFile, rows: Uint8Array[]): void {
  let grphc: Uint8Array | null = null;
  while (!txt.feof()) {
    const buf = txt.fgets(128);
    if (buf === null) continue;
    // strtok (buf, " \t") and the two next tokens
    const t = buf.split(/[ \t]+/).filter((x) => x.length > 0);
    const fnp = t[0];
    if (!fnp || fnp[0] === '#') continue;
    if (fnp[0] === '@') break;
    if (t.length < 3) continue;
    const ri = parseInt(t[1], 10) || 0;
    const ci = parseInt(t[2], 10) || 0;
    if (fnp === id) {
      const n = main_groups[group].size;
      grphc = new Uint8Array(n * 16 * n * 16);
      let p = 0;
      for (let r = ri * 16; r < (ri + n) * 16; r++) {
        for (let c = ci * 16; c < (ci + n) * 16; c++) grphc[p++] = rows[r][c];
      }
      break;
    }
    throw new Error('Error, wrong id string');
  }
  if (!grphc) throw new Error("Error, couldn't find id string");
  main_types[type].group = group;
  main_types[type].graphic = grphc;
}

export function load_png_graphics(txt_filename: string, png_filename: string): number {
  const fp = fopen(png_filename, 'rb');
  if (!fp) return -1;
  const txt = fopen(txt_filename, 'r');
  if (!txt) return -1;
  const img = decodePng8(fp.data);
  if (!img) return -1;
  for (const [type, group, id] of LG) load_png_graphic(type, group, id, txt, img.rows);
  return 0;
}

export function init_types(): void {
  load_png_graphics(`${PATHS.opening_path}/iconlist.txt`, `${PATHS.opening_path}/icons.png`);
  main_types[C.CST_USED].group = C.GROUP_USED;
  main_types[C.CST_USED].graphic = new Uint8Array(0);
}

export const get_group_of_type = (type: number): number => main_types[type].group;

export function set_map_groups(): void {
  for (let i = 0; i < 10000; i++) MG[i] = get_group_of_type(MT[i]);
}

export function get_group_cost(group: number): number {
  const g = main_groups[group];
  // (int) ((float) cost + ((float) cost * ((float) cost_mul * (float) tech_level) / (float) MAX_TECH_LEVEL))
  return toInt(f32(f32(g.cost) + f32(f32(f32(g.cost) * f32(f32(g.cost_mul) * f32(G.tech_level))) / f32(C.MAX_TECH_LEVEL))));
}

export function get_type_name(type: number): string {
  return main_groups[get_group_of_type(type)].name;
}

export const get_type_cost = (type: number): number => get_group_cost(get_group_of_type(type));
