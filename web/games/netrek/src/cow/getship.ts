// @ts-nocheck
// COW 3.3.3 getship.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { struct_ship } from './structs.ts';
import { $bytes, $sat, G, memcpy } from '../rt/index.ts';
import { ASSAULT, ATT, BATTLESHIP, CRUISER, DESTROYER, SCOUT, SGALAXY, STARBASE } from './consts.ts';


export function getshipdefaults(): void {
  G.shipvals[SCOUT].s_phaserdamage = 75;
  G.shipvals[SCOUT].s_torpspeed = 16;
  G.shipvals[SCOUT].s_maxspeed = 12;
  G.shipvals[SCOUT].s_maxfuel = 5000;
  G.shipvals[SCOUT].s_maxarmies = 2;
  G.shipvals[SCOUT].s_maxshield = 75;
  G.shipvals[SCOUT].s_maxdamage = 75;
  G.shipvals[SCOUT].s_maxwpntemp = 1000;
  G.shipvals[SCOUT].s_maxegntemp = 1000;
  G.shipvals[SCOUT].s_type = SCOUT;
  G.shipvals[SCOUT].s_width = 20;
  G.shipvals[SCOUT].s_height = 20;
  G.shipvals[DESTROYER].s_phaserdamage = 85;
  G.shipvals[DESTROYER].s_torpspeed = 14;
  G.shipvals[DESTROYER].s_maxspeed = 10;
  G.shipvals[DESTROYER].s_maxfuel = 7000;
  G.shipvals[DESTROYER].s_maxarmies = 5;
  G.shipvals[DESTROYER].s_maxshield = 85;
  G.shipvals[DESTROYER].s_maxdamage = 85;
  G.shipvals[DESTROYER].s_maxwpntemp = 1000;
  G.shipvals[DESTROYER].s_maxegntemp = 1000;
  G.shipvals[DESTROYER].s_width = 20;
  G.shipvals[DESTROYER].s_height = 20;
  G.shipvals[DESTROYER].s_type = DESTROYER;
  G.shipvals[BATTLESHIP].s_phaserdamage = 105;
  G.shipvals[BATTLESHIP].s_torpspeed = 12;
  G.shipvals[BATTLESHIP].s_maxspeed = 8;
  G.shipvals[BATTLESHIP].s_maxfuel = 14000;
  G.shipvals[BATTLESHIP].s_maxarmies = 6;
  G.shipvals[BATTLESHIP].s_maxshield = 130;
  G.shipvals[BATTLESHIP].s_maxdamage = 130;
  G.shipvals[BATTLESHIP].s_maxwpntemp = 1000;
  G.shipvals[BATTLESHIP].s_maxegntemp = 1000;
  G.shipvals[BATTLESHIP].s_width = 20;
  G.shipvals[BATTLESHIP].s_height = 20;
  G.shipvals[BATTLESHIP].s_type = BATTLESHIP;
  G.shipvals[ASSAULT].s_phaserdamage = 80;
  G.shipvals[ASSAULT].s_torpspeed = 16;
  G.shipvals[ASSAULT].s_maxspeed = 8;
  G.shipvals[ASSAULT].s_maxfuel = 6000;
  G.shipvals[ASSAULT].s_maxarmies = 20;
  G.shipvals[ASSAULT].s_maxshield = 80;
  G.shipvals[ASSAULT].s_maxdamage = 200;
  G.shipvals[ASSAULT].s_maxwpntemp = 1000;
  G.shipvals[ASSAULT].s_maxegntemp = 1200;
  G.shipvals[ASSAULT].s_width = 20;
  G.shipvals[ASSAULT].s_height = 20;
  G.shipvals[ASSAULT].s_type = ASSAULT;
  G.shipvals[STARBASE].s_phaserdamage = 120;
  G.shipvals[STARBASE].s_torpspeed = 14;
  G.shipvals[STARBASE].s_maxfuel = 60000;
  G.shipvals[STARBASE].s_maxarmies = 25;
  G.shipvals[STARBASE].s_maxshield = 500;
  G.shipvals[STARBASE].s_maxdamage = 600;
  G.shipvals[STARBASE].s_maxspeed = 2;
  G.shipvals[STARBASE].s_maxwpntemp = 1300;
  G.shipvals[STARBASE].s_maxegntemp = 1000;
  G.shipvals[STARBASE].s_width = 20;
  G.shipvals[STARBASE].s_height = 20;
  G.shipvals[STARBASE].s_type = STARBASE;
  G.shipvals[ATT].s_phaserdamage = 10000;
  G.shipvals[ATT].s_torpspeed = 30;
  G.shipvals[ATT].s_maxspeed = 60;
  G.shipvals[ATT].s_maxfuel = 12000;
  G.shipvals[ATT].s_maxarmies = 1000;
  G.shipvals[ATT].s_maxshield = 30000;
  G.shipvals[ATT].s_maxdamage = 30000;
  G.shipvals[ATT].s_maxwpntemp = 10000;
  G.shipvals[ATT].s_maxegntemp = 10000;
  G.shipvals[ATT].s_width = 28;
  G.shipvals[ATT].s_height = 28;
  G.shipvals[ATT].s_type = ATT;
  G.shipvals[SGALAXY].s_phaserdamage = 10000;
  G.shipvals[SGALAXY].s_torpspeed = 30;
  G.shipvals[SGALAXY].s_maxspeed = 60;
  G.shipvals[SGALAXY].s_maxfuel = 12000;
  G.shipvals[SGALAXY].s_maxarmies = 1000;
  G.shipvals[SGALAXY].s_maxshield = 30000;
  G.shipvals[SGALAXY].s_maxdamage = 30000;
  G.shipvals[SGALAXY].s_maxwpntemp = 10000;
  G.shipvals[SGALAXY].s_maxegntemp = 10000;
  G.shipvals[SGALAXY].s_width = 20;
  G.shipvals[SGALAXY].s_height = 20;
  G.shipvals[SGALAXY].s_type = SGALAXY;
  G.shipvals[CRUISER].s_phaserdamage = 100;
  G.shipvals[CRUISER].s_torpspeed = 12;
  G.shipvals[CRUISER].s_maxspeed = 9;
  G.shipvals[CRUISER].s_maxfuel = 10000;
  G.shipvals[CRUISER].s_maxarmies = 10;
  G.shipvals[CRUISER].s_maxshield = 100;
  G.shipvals[CRUISER].s_maxdamage = 100;
  G.shipvals[CRUISER].s_maxwpntemp = 1000;
  G.shipvals[CRUISER].s_maxegntemp = 1000;
  G.shipvals[CRUISER].s_width = 20;
  G.shipvals[CRUISER].s_height = 20;
  G.shipvals[CRUISER].s_type = CRUISER;
}

export function getship(shipp: struct_ship | null, s_type: number): void {
  memcpy($bytes(shipp), $bytes($sat(G.shipvals, s_type)), 40);
}

export function $init(): void {
}
