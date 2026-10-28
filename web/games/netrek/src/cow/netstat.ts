// @ts-nocheck
// COW 3.3.3 netstat.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { ustime } from './interface.ts';
import { updateLMeter } from './lagmeter.ts';
import { nsrefresh } from './netstatopt.ts';
import { $cs, G, P, S, printf, sqrt, strcpy } from '../rt/index.ts';
import { NETSTAT_DF_NFT, NETSTAT_FAILURES, NETSTAT_LOCAL, NETSTAT_TOTAL, PALIVE } from './consts.ts';

let lastread: number;
let dead: number;
let start: number;
let counter: number;
let sum: number;
let n: number;
let s2: number;
let M: number;
let var_: number;
let sd: number;
let suml: number;
let nl: number;
let s2l: number;
let Ml: number;
let varl: number;
let sdl: number;
let nf: number;
let nfthresh_s: any;
let nfthresh: number;
let ns_record_update$lastupdateSpeed: number;
let ns_record_update$lasttime: number;

export function ns_init(v: number): void {
  start = v;
  sum = n = s2 = 0;
  suml = nl = s2l = 0;
  nf = 0;
}

export function ns_record_update(count: number): void {
  let now = 0;
  let et = 0;
  et = 1000 / G.server_ups | 0;
  if (!G.me) {
    return;
  }
  now = Math.trunc(ustime() / 1000) | 0;
  if (ns_record_update$lasttime < et + (et / 4 | 0) && now - lastread < (et / 2 | 0)) {
    return;
  }
  if (start) {
    --start;
    lastread = now;
    return;
  }
  if (G.me.p_status !== PALIVE) {
    dead = 5;
    lastread = now;
    suml = nl = s2l = 0;
    return;
  } else if (dead) {
    --dead;
    lastread = now;
    return;
  }
  if (G.server_ups !== ns_record_update$lastupdateSpeed) {
    ns_init(3);
    ns_record_update$lastupdateSpeed = G.server_ups;
    lastread = now;
    return;
  }
  ns_record_update$lastupdateSpeed = G.server_ups;
  ns_record_update$lasttime = now - lastread;
  if (ns_record_update$lasttime >= nfthresh) {
    ++nf;
    nsrefresh(NETSTAT_FAILURES);
    updateLMeter();
  } else {
    ++counter;
    ns_do_stat(ns_record_update$lasttime, counter);
  }
  lastread = now;
}

export function ns_do_stat(v: number, c: number): void {
  let uf = 0;
  ++n;
  ++nl;
  sum += v;
  suml += v;
  s2 += Math.imul(v, v);
  s2l += Math.imul(v, v);
  if (n <= 1 || nl <= 1) {
    return;
  }
  uf = G.server_ups * 10 / G.netstatfreq | 0;
  if (uf === 0) {
    uf = 1;
  }
  if (c % uf === 0) {
    M = sum / n | 0;
    var_ = (s2 - Math.imul(M, sum)) / (n - 1) | 0;
    if (G.debug) {
      printf(S("ns1: var=%d\n"), var_);
    }
    sd = Math.trunc(sqrt(var_)) | 0;
    nsrefresh(NETSTAT_TOTAL);
    Ml = suml / nl | 0;
    varl = (s2l - Math.imul(Ml, suml)) / (nl - 1) | 0;
    if (G.debug) {
      printf(S("ns2: varl=%d\n"), varl);
    }
    sdl = Math.trunc(sqrt(varl)) | 0;
    nsrefresh(NETSTAT_LOCAL);
    updateLMeter();
  }
}

export function ns_get_tstat(): number {
  return sd;
}

export function ns_get_lstat(): number {
  return sdl;
}

export function ns_get_nfailures(): number {
  return nf;
}

export function ns_get_nfthresh_s(): Ptr | null {
  return P(nfthresh_s);
}

export function ns_set_nfthresh_s(s: Ptr | null): void {
  strcpy(P(nfthresh_s), s);
}

export function ns_get_nfthresh(): number {
  return nfthresh;
}

export function ns_set_nfthresh(v: number): void {
  nfthresh = v;
}

export function $init(): void {
  lastread = 0;
  dead = 0;
  start = 0;
  counter = 0;
  sum = 0;
  n = 0;
  s2 = 0;
  M = 0;
  var_ = 0;
  sd = 0;
  suml = 0;
  nl = 0;
  s2l = 0;
  Ml = 0;
  varl = 0;
  sdl = 0;
  nf = 0;
  nfthresh_s = $cs("2000", 8);
  nfthresh = NETSTAT_DF_NFT;
  ns_record_update$lastupdateSpeed = 0;
  ns_record_update$lasttime = -1;
}
