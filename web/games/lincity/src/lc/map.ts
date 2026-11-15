// engglobs.h's `Map map`: one block of memory as the C compiler lays it out, so that the original's
// pointer walks over it (transport.c, market.c's get_stuff/put_stuff, engine.c's do_pollution) and its
// raw byte saves (ldsvguts.c) work the same.
//   short type[100][100];  short group[100][100];  int pollution[100][100];  Map_Point_Info info[100][100];
// Map_Point_Info is 10 ints: population, flags, coal_reserve|ore_reserve (two unsigned shorts), int_1..int_7.
// The views of the first arrays run on to the end of the block: an index past type[99][99] reads group[][],
// as it does in C (connect_transport looks one column past the map's edge).
import { WORLD_SIDE_LEN } from './consts.ts';

export const MAP_BYTES = 2 * 10000 + 2 * 10000 + 4 * 10000 + 40 * 10000;
export const mapBuffer = new ArrayBuffer(MAP_BYTES);
export const mapBytes = new Uint8Array(mapBuffer);
/** map.type[x][y] at [x * 100 + y] */
export const MT = new Int16Array(mapBuffer, 0);
/** map.group[x][y] */
export const MG = new Int16Array(mapBuffer, 20000);
/** map.pollution[x][y] */
export const MPOL = new Int32Array(mapBuffer, 40000);
/** map.info as ints: record (x * 100 + y) * 10, fields below */
export const MI = new Int32Array(mapBuffer, 80000, 100000);
/** map.info as unsigned shorts (for coal_reserve and ore_reserve) */
export const MI16 = new Uint16Array(mapBuffer, 80000, 200000);

export const POP = 0;
export const FLAGS = 1;
export const I1 = 3;
export const I2 = 4;
export const I3 = 5;
export const I4 = 6;
export const I5 = 7;
export const I6 = 8;
export const I7 = 9;
/** words per Map_Point_Info */
export const INFO = 10;

/** index of map point x,y in MT, MG, MPOL */
export const P = (x: number, y: number): number => x * WORLD_SIDE_LEN + y;
/** index of the Map_Point_Info of x,y in MI */
export const IX = (x: number, y: number): number => (x * WORLD_SIDE_LEN + y) * INFO;

export const coalReserve = (x: number, y: number): number => MI16[((x * WORLD_SIDE_LEN + y) * INFO + 2) * 2];
export const setCoalReserve = (x: number, y: number, v: number): void => { MI16[((x * WORLD_SIDE_LEN + y) * INFO + 2) * 2] = v; };
export const oreReserve = (x: number, y: number): number => MI16[((x * WORLD_SIDE_LEN + y) * INFO + 2) * 2 + 1];
export const setOreReserve = (x: number, y: number, v: number): void => { MI16[((x * WORLD_SIDE_LEN + y) * INFO + 2) * 2 + 1] = v; };
