// lw/network.ts: src/network.c: the colours and the starting parts of the teams of a network game.
// (The globals LW_NETWORK_ON, LW_NETWORK_INFO, LW_NETWORK_ERROR_DETECTED and LW_NETWORK_RAW_MAP are in
// state.ts.)

import { G, NB_TEAMS } from './state.ts';

const LW_NETWORK_COLOR_NB = 12;
const LW_NETWORK_COLOR_DIST_MAXINT = 1000000;
const LW_NETWORK_COLOR_DIST_SCALE = 1000;

export function distance_between_colors(col1: number, col2: number): number {
  let dist: number;
  if (col1 < 0 || col2 < 0) {
    // if one of the members was -1, the colors are "far" from each other
    dist = 6;
  } else dist = Math.abs(col1 - col2);
  if (dist > LW_NETWORK_COLOR_NB) dist = Math.trunc(LW_NETWORK_COLOR_NB / 2);
  if (dist > Math.trunc(LW_NETWORK_COLOR_NB / 2)) dist = LW_NETWORK_COLOR_NB - dist;
  return dist;
}

export function choose_different_color(): number {
  const closeness = new Array<number>(LW_NETWORK_COLOR_NB).fill(0);
  for (let i = 0; i < LW_NETWORK_COLOR_NB; ++i) {
    closeness[i] = 0;
    for (let j = 0; j < NB_TEAMS; ++j) {
      const ni = G.LW_NETWORK_INFO[j]!;
      if (ni.active) {
        let dist = distance_between_colors(ni.color, i);
        if (dist > 0) {
          // network colour conflicts count less than conflicts with local colours
          if (ni.network) dist++;
          closeness[i]! += Math.trunc(LW_NETWORK_COLOR_DIST_SCALE / (dist * dist));
        } else closeness[i] = LW_NETWORK_COLOR_DIST_MAXINT;
      }
    }
  }
  let closeness_min = LW_NETWORK_COLOR_DIST_MAXINT;
  let color = 0;
  for (let i = 0; i < LW_NETWORK_COLOR_NB; ++i) {
    if (closeness[i]! < closeness_min) {
      color = i;
      closeness_min = closeness[i]!;
    }
  }
  return color;
}

export function lw_network_attribute_colors(): void {
  for (let i = 0; i < NB_TEAMS; ++i) {
    const ni = G.LW_NETWORK_INFO[i]!;
    if (ni.active) {
      // -1 is a temporary value, overwritten below
      if (ni.network) ni.color = -1;
      else ni.color = G.CONFIG_TEAM_COLOR[i]!;
    }
  }
  for (let i = 0; i < NB_TEAMS; ++i) {
    const ni = G.LW_NETWORK_INFO[i]!;
    if (ni.active && ni.network) ni.color = choose_different_color();
  }
}

const order = [0, 5, 2, 3, 1, 4];

export function lw_network_attribute_parts(): void {
  for (let i = 0; i < NB_TEAMS; ++i) {
    const ni = G.LW_NETWORK_INFO[i]!;
    if (ni.active) ni.part = order[ni.server_id]!;
  }
}
