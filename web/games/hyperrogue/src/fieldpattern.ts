// fieldpattern.cpp of HyperRogue 13.1o: the field quotient pattern (the {7,3} field over Z_43 that heptagon.cpp's
// fieldval, the Palace/Prairie/Wind/Whirlpool distances (windmap, markers) and the field quotient geometries use).
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// Stage 1 ports the 2D part (solve, build, analyze, getdist, dijkstra, ..., getcurrfp, the fgeomextras of the
// field quotient menu). The 3D field patterns (solve3, generate_isometries3, generate_all3, generate_quotientgroup,
// hread_fpattern for the default534/435/436/336 strings, the CAP_THREAD discovery) are a later stage: NotPorted.
//
// `struct matrix : array<array<int, MAXMDIM>, MAXMDIM>` is a number[][] 4x4; only the first MWDIM rows/columns
// take part in ==, < and the map key. `map<matrix, int> matcode` is a Map keyed by matkey(M) (no iteration over
// it is observable). The fieldval functions of namespace fieldpattern defined in pattern2.cpp (fieldval,
// fieldval_uniq, fieldval_uniq_rand) live in pattern2.ts and are re-exported here.
//
// #define currfp fieldpattern::getcurrfp(): `currfp.x` -> `fieldpattern_getcurrfp().x`;
// `&currfp == &fieldpattern::fp_invalid` -> `fieldpattern_getcurrfp() === G.fieldpattern_fp_invalid`.
import { G } from './globals.ts';
import { NotPorted, hr_exception, DISTANCE_UNKNOWN } from './hyper.ts';
import {
  S7, S3, WDIM, mproduct, PURE, hyperbolic, sphere, euclid, quotient, mhybrid, GOLDBERG, ginf,
  gFieldQuotient, gSpace535, gSpace534, gSpace435, gSpace436, gSpace336, gSpace344, gSpace536, gSpace345, gSpace353,
  gSpace354, gCubeTiling, gNormal, gOctagon, g45, g46, g47, gSchmutzM3, qFIELD, qANYQ, qCLOSED,
} from './classes.ts';
import { itNone, itBuggy, itAmethyst, itEmerald, itCoast, itWhirlpool, itStatue, itSapphire, itShard, itGold, type eItem } from './content.ts';
import { fake_in } from './fake.ts';
import { bt_in } from './binary-tiling.ts';
import type { cell } from './locations.ts';
import { fieldpattern_fieldval } from './pattern2.ts';
import { arg_argis, arg_shift, arg_argi } from './commandline.ts';

export { fieldpattern_fieldval, fieldpattern_fieldval_uniq, fieldpattern_fieldval_uniq_rand } from './pattern2.ts';

// use_rule_fp, use_quotient_fp: G

let limitsq = 10;
let limitp = 10000;
let limitv = 100000;

/** struct primeinfo */
export interface primeinfo { p: number; cells: number; squared: boolean; }

/** struct fgeomextra */
export class fgeomextra {
  base: number;
  primes: primeinfo[] = [];
  dualval: number[] = [];
  current_prime_id: number;
  constructor(b: number, i: number) { this.base = b; this.current_prime_id = i; }
}

export function fieldpattern_isprime(n: number): boolean {
  for (let k = 2; k < n; k++) if (n % k === 0) return false;
  return true;
}

/** #define MWDIM (mproduct ? 3 : WDIM+1) */
export function MWDIM(): number { return mproduct() ? 3 : WDIM() + 1; }

/** struct matrix : array<array<int, MAXMDIM>, MAXMDIM> */
export type matrix = number[][];
function matnew(): matrix { return [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]; }
function matcopy(M: matrix): matrix { return [[...M[0]], [...M[1]], [...M[2]], [...M[3]]]; }
/** matrix::operator== */
export function mateq(A: matrix, B: matrix): boolean {
  const n = MWDIM();
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++)
    if (A[i][j] !== B[i][j]) return false;
  return true;
}
/** matrix::operator< */
export function matless(A: matrix, B: matrix): boolean {
  const n = MWDIM();
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++)
    if (A[i][j] !== B[i][j]) return A[i][j] < B[i][j];
  return false;
}
/** the key of a matrix in matcode: its first MWDIM x MWDIM entries (operator< compares only these) */
function matkey(M: matrix): string {
  const n = MWDIM();
  let s = '';
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) s += M[i][j] + ',';
  return s;
}

export function fieldpattern_groupspin(id: number, d: number, group: number): number {
  return group * Math.trunc(id / group) + (id + d) % group;
}

export function fieldpattern_btspin(id: number, d: number): number {
  return fieldpattern_groupspin(id, d, S7());
}

// debugflag debug_field: debug output, left out (PORTING.md, "Macros")

export const ERR = -99;

/** struct triplet_info */
export interface triplet_info { i: number; j: number; size: number; }

export const MAXDIST = 120;

/** #define MXF 1000000 */
export const MXF = 1000000;

export class fpattern {

  force_hash = 0;

  Prime = 0; wsquare = 0; Field = 0; dual = 0;
  // we perform our computations in the field Z_Prime[w] where w^2 equals wsquare
  // (or simply Z_Prime for wsquare == 0)

  // #define EASY
  // 'easy' assumes that all elements of the field actually used
  // are of form n or mw (not n+mw), and cs and ch are both of form n
  // by experimentation, such cs and ch always exist
  // many computations are much simpler under that assumption

  sub(a: number, b: number): number {
    return (a + b * (this.Prime - 1)) % this.Prime;
  }

  add(a: number, b: number): number {
    if (a === ERR || b === ERR || a * b < 0) return ERR;
    return (a + b) % this.Prime;
  }

  mul(tx: number, ty: number): number {
    return (tx * ty * ((tx < 0 && ty < 0) ? this.wsquare : 1)) % this.Prime;
  }

  sqr(x: number): number { return this.mul(x, x); }

  err = 0;

  mmul(A: matrix, B: matrix): matrix {
    const res = matnew();
    const n = MWDIM();
    for (let i = 0; i < n; i++) for (let k = 0; k < n; k++) {
      let t = 0;
      let tp = 0, tn = 0;
      for (let j = 0; j < n; j++) {
        const val = this.mul(A[i][j], B[j][k]);
        if (val > 0) tp += val;
        else tn += val;
      }
      tp %= this.Prime; tn %= this.Prime;
      if (tp && tn) this.err++;
      t = tp + tn;
      res[i][k] = t;
    }
    return res;
  }

  /** map<matrix, int> matcode */
  matcode = new Map<string, number>();
  matrices: matrix[] = [];

  /** matcode[M]: operator[] inserts 0 for a missing key */
  code(M: matrix): number {
    const k = matkey(M);
    const v = this.matcode.get(k);
    if (v !== undefined) return v;
    this.matcode.set(k, 0);
    return 0;
  }
  /** matcode.count(M) */
  has(M: matrix): boolean { return this.matcode.has(matkey(M)); }

  qpaths: string[] = [];

  qcoords: matrix[] = [];

  /** S7 in 2D, but e.g. 4 for a 3D cube */
  rotations = 0;

  /** S7 in 2D, but e.g. 24 for a 3D cube */
  local_group = 0;

  // Id: Identity
  // R : rotate by 1/rotations of the full circle
  // P : make a step and turn backwards
  // X : in 3-dim, turn by 90 degrees

  Id: matrix = matnew(); R: matrix = matnew(); P: matrix = matnew(); X: matrix = matnew();

  strtomatrix(s: string): matrix {
    let res = this.Id;
    const m = matcopy(this.Id);
    for (let i = s.length - 1; i >= 0; i--)
      if (s[i] === 'R') res = this.mmul(this.R, res);
      else if (s[i] === 'P') res = this.mmul(this.P, res);
      else if (s[i] === 'x') { m[0][0] = -1; res = this.mmul(m, res); m[0][0] = +1; }
      else if (s[i] === 'y') { m[1][1] = -1; res = this.mmul(m, res); m[1][1] = +1; }
      else if (s[i] === 'z') { m[2][2] = -1; res = this.mmul(m, res); m[2][2] = +1; }
    return matcopy(res);
  }

  addas(M: matrix, i: number): void {
    if (!this.has(M)) {
      this.matcode.set(matkey(M), i);
      for (let j = 0; j < this.qcoords.length; j++)
        this.addas(this.mmul(M, this.qcoords[j]), i);
    }
  }

  /** add(const matrix& M): `addm` (add(int, int) is the field addition) */
  addm(M: matrix): void {
    if (!this.has(M)) {
      const i = this.matrices.length;
      this.matcode.set(matkey(M), i); this.matrices.push(matcopy(M));
      for (let j = 0; j < this.qcoords.length; j++)
        this.addas(this.mmul(M, this.qcoords[j]), i);
      if (WDIM() === 3) this.addm(this.mmul(this.X, M));
      this.addm(this.mmul(this.R, M));
    }
  }

  connections: number[] = [];

  inverses: number[] = []; // NYI in 3D

  // 2D only
  rrf: number[] = []; // rrf[i] equals gmul(i, rotations-1)
  rpf: number[] = []; // rpf[i] equals gmul(i, rotations)

  mpow(M: matrix, N: number): matrix {
    while ((N & 1) === 0) { N >>= 1; M = this.mmul(M, M); }
    let res = M;
    N >>= 1;
    while (N) {
      M = this.mmul(M, M); if (N & 1) res = this.mmul(res, M);
      N >>= 1;
    }
    return res;
  }

  gmul(a: number, b: number): number { return this.code(this.mmul(this.matrices[a], this.matrices[b])); }
  gpow(a: number, N: number): number { return this.code(this.mpow(this.matrices[a], N)); }

  gorder(a: number): number {
    let b = a;
    let q = 1;
    while (b) { b = this.gmul(b, a); q++; }
    return q;
  }

  /** gmul(pair<int, bool> a, int b) */
  gmul_p(a: [number, boolean], b: number): [number, boolean] {
    return [this.gmul(a[0], b), a[1]];
  }

  order(M: matrix): number {
    let cnt = 1;
    let Po = M;
    while (!mateq(Po, this.Id)) { Po = this.mmul(Po, M); cnt++; }
    return cnt;
  }

  decodepath(i: number): string {
    let s = '';
    while (i) {
      if (i % S7()) { i--; s += 'R'; }
      else { i = this.connections[i]; s += 'P'; }
    }
    return s;
  }

  cs = 0; sn = 0; ch = 0; sh = 0;

  disthep: number[] = [];
  disthex: number[] = [];

  distwall: number[] = []; distriver: number[] = []; distwall2: number[] = []; distriverleft: number[] = [];
  distriverright: number[] = []; distflower: number[] = [];
  distflower0 = 0;

  markers: eItem[] = [];

  maxdist = 0; otherpole = 0; circrad = 0; wallid = 0; wallorder = 0; riverid = 0;

  easy(i: number): boolean {
    return i < this.Prime || !(i % this.Prime);
  }

  // 11 * 25
  // (1+z+z^3) * (1+z^3+z^4) ==
  // 1+z+z^7 == 1+z+z^2(z^5) == 1+z+z^2(1+z^2) = 1+z+z^2+z^4

  init(p: number): void {
    this.Prime = p;
    if (this.solve()) {
      // printf("error: could not solve the fieldpattern\n"); exit(1);
      throw new hr_exception('error: could not solve the fieldpattern');
    }
    this.build();
    this.analyze();
  }

  /** fpattern(int p) */
  constructor(p: number) {
    this.force_hash = 0;
    if (!p) return;
    this.init(p);
  }

  hashv = 0;

  check_order(M: matrix, req: number): boolean {
    const err = 0;
    let P = M;
    for (let i = 1; i < req; i++) {
      if (mateq(P, this.Id)) return false;
      P = this.mmul(P, M);
    }
    return mateq(P, this.Id) && !err;
  }

  generate_isometries(): matrix[] {
    const T = matcopy(this.Id);
    const low = this.wsquare ? 1 - this.Prime : 0;
    const res: matrix[] = [];
    const P = this.Prime;

    const colprod = (a: number, b: number): number =>
      this.add(this.add(this.mul(T[0][a], T[0][b]), this.mul(T[1][a], T[1][b])), this.mul(T[2][a], T[2][b]));

    for (T[0][0] = low; T[0][0] < P; T[0][0]++)
      for (T[1][0] = low; T[1][0] < P; T[1][0]++)
        for (T[2][0] = low; T[2][0] < P; T[2][0]++)
          if (colprod(0, 0) === 1)
            for (T[0][1] = low; T[0][1] < P; T[0][1]++)
              for (T[1][1] = low; T[1][1] < P; T[1][1]++)
                for (T[2][1] = low; T[2][1] < P; T[2][1]++)
                  if (colprod(1, 1) === 1)
                    if (colprod(1, 0) === 0)
                      for (T[0][2] = low; T[0][2] < P; T[0][2]++)
                        for (T[1][2] = low; T[1][2] < P; T[1][2]++)
                          for (T[2][2] = low; T[2][2] < P; T[2][2]++)
                            if (colprod(2, 2) === 1)
                              if (colprod(2, 0) === 0)
                                if (colprod(2, 1) === 0)
                                  res.push(matcopy(T));

    return res;
  }

  generate_isometries3(): matrix[] { throw new NotPorted('fpattern::generate_isometries3 (3D field patterns)'); }
  add1(_M: matrix): void { throw new NotPorted('fpattern::add1 (3D field patterns)'); }
  generate_all3(): boolean { throw new NotPorted('fpattern::generate_all3 (3D field patterns)'); }
  generate_quotientgroup(): void { throw new NotPorted('fpattern::generate_quotientgroup (3D field patterns)'); }
  solve3(): number { throw new NotPorted('fpattern::solve3 (3D field patterns)'); }

  compute_hash(): number {
    let hashv = 0;
    const iR = this.code(this.R);
    const iP = this.code(this.P);
    const iX = this.code(this.X);
    for (let i = 0; i < this.matrices.length; i++) {
      hashv = (Math.imul(3, hashv) + this.gmul(i, iP) + Math.imul(7, this.gmul(i, iR))) >>> 0;
      if (MWDIM() === 4) hashv = (hashv + Math.imul(11, this.gmul(i, iX))) >>> 0;
    }
    return hashv;
  }

  set_field(p: number, sq: number): void {
    this.Prime = p;
    this.Field = sq ? this.Prime * this.Prime : this.Prime;
    this.wsquare = sq;
    const n = MWDIM();
    for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) this.Id[a][b] = a === b ? 1 : 0;
  }

  solve(): number {

    const n = MWDIM();
    for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) this.Id[a][b] = a === b ? 1 : 0;

    if (!fieldpattern_isprime(this.Prime)) {
      return 1;
    }

    this.rotations = WDIM() === 2 ? S7() : 4;
    this.local_group = WDIM() === 2 ? S7() : 24;

    for (this.dual = 0; this.dual < 3; this.dual++) {
      for (let pw = 1; pw < 3; pw++) {
        if (pw > 3) break;
        this.Field = pw === 1 ? this.Prime : this.Prime * this.Prime;

        if (pw === 2) {
          for (this.wsquare = 1; this.wsquare < this.Prime; this.wsquare++) {
            let roots = 0;
            for (let a = 0; a < this.Prime; a++) if ((a * a) % this.Prime === this.wsquare) roots++;
            if (!roots) break;
          }
        } else this.wsquare = 0;

        // #if MAXMDIM >= 4
        if (WDIM() === 3) {
          if (this.dual === 0 && (this.Prime <= limitsq || pw === 1)) {
            const s = this.solve3();
            if (s) return 0;
          }
          continue;
        }

        if (this.dual === 2) {
          if (this.Field <= 10) {
            const all_isometries = this.generate_isometries();
            for (const X of all_isometries)
              if (this.check_order(X, this.rotations))
                for (const Y of all_isometries)
                  if (this.check_order(Y, 2) && this.check_order(this.mmul(X, Y), S3())) {
                    this.R = X; this.P = Y;
                    return 0;
                  }
          }
          continue;
        }

        // #ifdef EASY
        const sqrts: number[] = new Array<number>(this.Prime).fill(0);
        for (let k = 1 - this.Prime; k < this.Prime; k++) sqrts[this.sqr(k)] = k;
        const fmax = this.Prime;

        this.R = matcopy(this.Id); this.P = matcopy(this.Id); this.X = matcopy(this.Id);
        this.X[1][1] = 0; this.X[2][2] = 0;
        this.X[1][2] = 1; this.X[2][1] = this.Prime - 1;

        for (this.cs = 0; this.cs < fmax; this.cs++) {
          const sb = this.sub(1, this.sqr(this.cs));

          this.sn = sqrts[sb];

          this.R[0][0] = this.cs; this.R[1][1] = this.cs;
          this.R[0][1] = this.sn; this.R[1][0] = this.sub(0, this.sn);

          if (!this.check_order(this.R, this.dual ? S3() : this.rotations)) continue;

          if (this.R[0][0] === 1) continue;

          for (this.ch = 2; this.ch < fmax; this.ch++) {
            const chx = this.sub(this.mul(this.ch, this.ch), 1);

            this.sh = sqrts[chx];
            this.P[0][0] = this.sub(0, this.ch);
            this.P[0][WDIM()] = this.sub(0, this.sh);
            this.P[1][1] = this.Prime - 1;
            this.P[WDIM()][0] = this.sh;
            this.P[WDIM()][WDIM()] = this.ch;

            if (!this.check_order(this.mmul(this.P, this.R), this.dual ? this.rotations : S3())) continue;

            if (this.dual) this.R = this.mmul(this.P, this.R);

            return 0;
          }
        }
      }
    }

    return 2;
  }

  find_triplets(): triplet_info[] {
    const N = this.matrices.length;
    const compute_transcript = (i: number, j: number): number[] => {

      const indices: number[] = new Array<number>(N).fill(-1);
      const transcript: number[] = [];
      const q: number[] = [];

      let qty = 0;

      const visit = (id: number): void => {
        transcript.push(indices[id]);
        if (indices[id] === -1) {
          indices[id] = q.length;
          q.push(id);
          qty++;
        }
      };

      visit(0);
      for (let x = 0; x < q.length; x++) {
        const at = q[x];
        visit(this.gmul(at, i));
        visit(this.gmul(at, j));
      }

      transcript.push(qty);

      return transcript;
    };

    // if(debug_field) println(hlog, "looking for alternate solutions");

    const orig_transcript = compute_transcript(1, S7());

    const transcripts_seen = new Set<string>();
    transcripts_seen.add(orig_transcript.join(','));

    const conjugacy_classes = new Set<number>();
    const cc: number[] = [];

    for (let i = 0; i < N; i++) conjugacy_classes.add(i);
    for (let i = 0; i < N; i++) {
      if (!conjugacy_classes.has(i)) continue;
      const removals: number[] = [];
      for (let j = 0; j < N; j++) {
        const c = this.gmul(this.inverses[j], this.gmul(i, j));
        if (c > i) removals.push(c);
      }
      for (const r of removals) conjugacy_classes.delete(r);
      cc.push(i);
    }

    const tinf: triplet_info[] = [];
    tinf.push({ i: 1, j: S7(), size: orig_transcript[orig_transcript.length - 1] });

    // set<int> iterates in ascending order
    for (const i of [...conjugacy_classes].sort((a, b) => a - b)) if (this.gorder(i) === S7()) {
      for (let j = 1; j < N; j++) if (this.gorder(j) === 2 && this.gorder(this.gmul(i, j)) === S3()) {
        const t = compute_transcript(i, j);
        if (!transcripts_seen.has(t.join(','))) {
          transcripts_seen.add(t.join(','));
          tinf.push({ i, j, size: t[t.length - 1] });
        }
      }
    }

    return tinf;
  }

  build(): void {

    if (WDIM() === 3) return;

    for (let i = 0; i < this.qpaths.length; i++) {
      const M = this.strtomatrix(this.qpaths[i]);
      this.qcoords.push(M);
      // printf("Solved %s as matrix of order %d\n", qpaths[i].c_str(), order(M));
    }

    this.matcode.clear(); this.matrices.length = 0;
    this.addm(this.Id);
    if (this.matrices.length !== this.local_group) throw new hr_exception(`Error: rotation crash #1 (${this.matrices.length})`);

    this.connections.length = 0;

    for (let i = 0; i < this.matrices.length; i++) {

      const M = this.matrices[i];

      const PM = this.mmul(this.P, M);

      this.addm(PM);

      if (this.matrices.length % this.local_group) throw new hr_exception(`Error: rotation crash (${this.matrices.length})`);

      if (!this.has(PM)) throw new hr_exception('Error: not marked');

      this.connections.push(this.code(PM));
    }

    const N = this.matrices.length;

    if (WDIM() === 3) return;

    this.rrf = new Array<number>(N).fill(0); this.rrf[0] = S7() - 1;
    for (let i = 0; i < N; i++) {
      this.rrf[fieldpattern_btspin(i, 1)] = fieldpattern_btspin(this.rrf[i], 1);
      this.rrf[this.connections[i]] = this.connections[this.rrf[i]];
    }

    this.rpf = new Array<number>(N).fill(0); this.rpf[0] = S7();
    for (let i = 0; i < N; i++) {
      this.rpf[fieldpattern_btspin(i, 1)] = fieldpattern_btspin(this.rpf[i], 1);
      this.rpf[this.connections[i]] = this.connections[this.rpf[i]];
    }

    this.inverses = new Array<number>(N).fill(0);
    this.inverses[0] = 0;
    for (let i = 0; i < N; i++) { // inverses[i] = gpow(i, N-1);
      this.inverses[fieldpattern_btspin(i, 1)] = this.rrf[this.inverses[i]]; // btspin(inverses[i],6),
      this.inverses[this.connections[i]] = this.rpf[this.inverses[i]];
    }

    let errs = 0;
    for (let i = 0; i < N; i++) if (this.gmul(i, this.inverses[i])) errs++;
    // if(errs) printf("errs = %d\n", errs);
    void errs;

    if (G.fieldpattern_triplet_id) {
      const triplets = this.find_triplets();
      if (G.fieldpattern_triplet_id >= 0 && G.fieldpattern_triplet_id < triplets.length) {
        const ti = triplets[G.fieldpattern_triplet_id];
        this.R = matcopy(this.matrices[ti.i]);
        this.P = matcopy(this.matrices[ti.j]);
        const t = G.fieldpattern_triplet_id; G.fieldpattern_triplet_id = 0;
        try { this.build(); } finally { G.fieldpattern_triplet_id = t; }
        return;
      }
    }
  }

  /** getdist(pair<int,bool> a, vector<char>& dists) */
  getdist_v(a: [number, boolean], dists: number[]): number {
    if (!a[1]) return dists[a[0]];
    let m = MAXDIST;
    const ma = dists[a[0]];
    const mb = dists[this.connections[fieldpattern_btspin(a[0], 3)]];
    const mc = dists[this.connections[fieldpattern_btspin(a[0], 4)]];
    m = Math.min(m, 1 + ma);
    m = Math.min(m, 1 + mb);
    m = Math.min(m, 1 + mc);
    if (m <= 2 && ma + mb + mc <= m * 3 - 2) return m - 1; // special case
    m = Math.min(m, 2 + dists[this.connections[fieldpattern_btspin(a[0], 2)]]);
    m = Math.min(m, 2 + dists[this.connections[fieldpattern_btspin(a[0], 5)]]);
    m = Math.min(m, 2 + dists[this.connections[fieldpattern_btspin(this.connections[fieldpattern_btspin(a[0], 3)], 5)]]);
    return m;
  }

  /** getdist(pair<int,bool> a, pair<int,bool> b) */
  getdist(a: [number, boolean], b: [number, boolean]): number {
    if (a[0] === b[0]) return a[1] === b[1] ? 0 : 1;
    if (b[0]) { a = [this.gmul(a[0], this.inverses[b[0]]), a[1]]; b = [0, b[1]]; }
    return this.getdist_v(a, b[1] ? this.disthex : this.disthep);
  }

  /** dijkstra(vector<char>& dists, vector<int> indist[MAXDIST]): fills dists in place */
  dijkstra(dists: number[], indist: number[][]): number {
    const N = this.matrices.length;
    dists.length = N;
    for (let i = 0; i < N; i++) dists[i] = MAXDIST - 1;
    let maxd = 0;
    for (let i = 0; i < MAXDIST; i++) while (indist[i].length) {
      let at = indist[i].pop()!;
      if (dists[at] <= i) continue;
      maxd = i;
      dists[at] = i;
      const lg = MWDIM() === 4 ? this.local_group : S7();
      for (let q = 0; q < lg; q++) {
        dists[at] = i;
        if (WDIM() === 3)
          indist[i + 1].push(this.gmul(at, this.local_group));
        else if (PURE()) // todo-variation: PURE here?
          indist[i + 1].push(this.connections[at]);
        else {
          indist[i + 2].push(this.connections[at]);
          indist[i + 3].push(this.connections[fieldpattern_btspin(this.connections[at], 2)]);
        }
        at = fieldpattern_groupspin(at, 1, lg);
      }
    }
    return maxd;
  }

  analyze(): void {

    if (MWDIM() === 4) {
      /* we need to compute inverses */
      const N = this.matrices.length;
      this.inverses.length = N;
      for (let i = 0; i < N; i++) {
        const M = this.matrices[i];
        const M2 = this.mpow(M, N - 1);
        this.inverses[i] = this.code(M2);
      }
    }

    const N = this.connections.length;

    // markers.resize(N): keeps the existing entries (analyze runs again in prepare_basics)
    while (this.markers.length < N) this.markers.push(itNone);
    this.markers.length = N;

    // vector<int> indist[MAXDIST] (the C++ array has MAXDIST entries; i+2 / i+3 stay far below it here)
    const indist: number[][] = [];
    for (let i = 0; i < MAXDIST + 3; i++) indist.push([]);

    indist[0].push(0);
    const md0 = this.dijkstra(this.disthep, indist);

    if (MWDIM() === 4) return;

    const c = this.connections;
    indist[1].push(0);
    indist[1].push(c[3]);
    indist[1].push(c[4]);
    indist[2].push(c[fieldpattern_btspin(c[3], 5)]);
    indist[2].push(c[2]);
    indist[2].push(c[5]);
    const md1 = this.dijkstra(this.disthex, indist);

    this.maxdist = Math.max(md0, md1);

    this.otherpole = 0;

    const disthep = this.disthep;
    for (let i = 0; i < N; i += S7()) {
      let mp = 0;
      for (let q = 0; q < S7(); q++) if (disthep[c[i + q]] < disthep[i]) mp++;
      if (mp === S7()) {
        let eq = true;
        for (let q = 0; q < S7(); q++) if (disthep[c[i + q]] !== disthep[c[i]]) eq = false;
        if (eq) {
          if (disthep[i] > disthep[this.otherpole]) this.otherpole = i;
        }
      }
    }

    this.circrad = 99;

    for (let i = 0; i < N; i++) for (let u = 2; u < 4; u++) if (disthep[i] < this.circrad)
      if (disthep[c[i]] < disthep[i] && disthep[c[fieldpattern_btspin(i, u)]] < disthep[i])
        this.circrad = disthep[i];

    const PRRR = this.strtomatrix('PRRR');
    const PRRPRRRRR = this.strtomatrix('PRRPRRRRR');
    const PRRRP = this.strtomatrix('PRRRP');
    const PRP = this.strtomatrix('PRP');
    const PR = this.strtomatrix('PR');
    const Wall = this.strtomatrix('RRRPRRRRRPRRRP');

    this.wallorder = this.order(Wall);
    this.wallid = this.code(Wall);

    // #define SETDIST(X, d, it) {int c = matcode[X]; indist[d].push_back(c); if(it == itNone) ; else if(markers[c] && markers[c] != it) markers[c] = itBuggy; else markers[c] = it; }
    const SETDIST = (X: matrix, d: number, it: eItem): void => {
      const cc = this.code(X); indist[d].push(cc);
      if (it === itNone) { /* nothing */ }
      else if (this.markers[cc] && this.markers[cc] !== it) this.markers[cc] = itBuggy;
      else this.markers[cc] = it;
    };

    let W = this.Id;
    for (let i = 0; i < this.wallorder; i++) {
      SETDIST(W, 0, itAmethyst);
      W = this.mmul(W, Wall);
    }
    W = this.P;
    for (let i = 0; i < this.wallorder; i++) {
      SETDIST(W, 0, itEmerald);
      W = this.mmul(W, Wall);
    }

    this.dijkstra(this.distwall, indist);

    W = this.strtomatrix('RRRRPR');
    for (let j = 0; j < this.wallorder; j++) {
      W = this.mmul(W, Wall);
      for (let i = 0; i < this.wallorder; i++) {
        SETDIST(W, 0, itNone);
        SETDIST(this.mmul(PRRR, W), 1, itNone);
        W = this.mmul(Wall, W);
      }
    }
    this.dijkstra(this.distwall2, indist);

    const rpushid = this.code(PRRPRRRRR);
    this.riverid = 0;

    riveridfound:
    for (let i = 0; i < N; i++) {
      let j = i;
      const ipush = this.gmul(rpushid, i);
      for (let k = 0; k < this.wallorder; k++) {
        if (ipush === j) {
          this.riverid = i;
          break riveridfound;
        }
        j = this.gmul(j, this.wallid);
      }
    }

    W = this.strtomatrix('RRRRPR');
    for (let j = 0; j < this.wallorder; j++) {
      W = this.mmul(W, Wall);
      for (let i = 0; i < this.wallorder; i++) {
        if (i === 7) SETDIST(W, 0, itCoast);
        if (i === 3) SETDIST(this.mmul(PRRRP, W), 0, itWhirlpool);
        W = this.mmul(Wall, W);
      }
    }
    this.dijkstra(PURE() ? this.distriver : this.distflower, indist);

    W = this.matrices[this.riverid];
    for (let i = 0; i < this.wallorder; i++) {
      SETDIST(W, 0, itStatue);
      W = this.mmul(W, Wall);
    }
    W = this.mmul(this.P, W);
    for (let i = 0; i < this.wallorder; i++) {
      SETDIST(W, 0, itSapphire);
      W = this.mmul(W, Wall);
    }
    W = this.mmul(PRP, this.matrices[this.riverid]);
    for (let i = 0; i < this.wallorder; i++) {
      SETDIST(W, 1, itShard);
      W = this.mmul(W, Wall);
    }
    W = this.mmul(PR, this.matrices[this.riverid]);
    for (let i = 0; i < this.wallorder; i++) {
      SETDIST(W, 1, itGold);
      W = this.mmul(W, Wall);
    }
    this.dijkstra(PURE() ? this.distflower : this.distriver, indist);

    for (let i = 0; i < this.matrices.length; i++)
      if (this.distflower[i] === 0) {
        this.distflower0 = this.inverses[i] + 1;
        break;
      }

    if (!PURE()) {
      W = this.matrices[this.riverid];
      for (let i = 0; i < this.wallorder; i++) {
        SETDIST(W, 0, itStatue);
        W = this.mmul(W, Wall);
      }
      W = this.mmul(PR, this.matrices[this.riverid]);
      for (let i = 0; i < this.wallorder; i++) {
        SETDIST(W, 0, itGold);
        W = this.mmul(W, Wall);
      }
      W = this.mmul(this.P, this.matrices[this.riverid]);
      for (let i = 0; i < this.wallorder; i++) {
        SETDIST(W, 1, itSapphire);
        W = this.mmul(W, Wall);
      }
      this.dijkstra(this.distriverleft, indist);
      W = this.mmul(PRP, this.matrices[this.riverid]);
      for (let i = 0; i < this.wallorder; i++) {
        SETDIST(W, 0, itShard);
        W = this.mmul(W, Wall);
      }
      W = this.mmul(this.P, this.matrices[this.riverid]);
      for (let i = 0; i < this.wallorder; i++) {
        SETDIST(W, 0, itSapphire);
        W = this.mmul(W, Wall);
      }
      W = this.matrices[this.riverid];
      for (let i = 0; i < this.wallorder; i++) {
        SETDIST(W, 1, itStatue);
        W = this.mmul(W, Wall);
      }
      this.dijkstra(this.distriverright, indist);
    }
    else {
      W = this.strtomatrix('RRRRPR');
      for (let j = 0; j < this.wallorder; j++) {
        W = this.mmul(W, Wall);
        for (let i = 0; i < this.wallorder; i++) {
          if (i === 7) SETDIST(W, 0, itCoast);
          W = this.mmul(Wall, W);
        }
      }
      this.dijkstra(this.distriverleft, indist);
      W = this.strtomatrix('RRRRPR');
      for (let j = 0; j < this.wallorder; j++) {
        W = this.mmul(W, Wall);
        for (let i = 0; i < this.wallorder; i++) {
          if (i === 3) SETDIST(this.mmul(PRRRP, W), 0, itWhirlpool);
          W = this.mmul(Wall, W);
        }
      }
      this.dijkstra(this.distriverright, indist);
    }
  }

  /** orderstats(): prints the statistics of the orders (a debugging tool) */
  orderstats(): number {
    const N = this.matrices.length;
    const MAXORD = 10000;
    const ordcount: number[] = new Array<number>(MAXORD).fill(0);
    const ordsample: number[] = new Array<number>(MAXORD).fill(0);

    for (let i = 0; i < N; i++) {
      const cnt = this.order(this.matrices[i]);

      if (cnt < MAXORD) {
        if (!ordcount[cnt]) ordsample[cnt] = i;
        ordcount[cnt]++;
      }
    }
    // printf("Listing:\n"); ...
    return ordsample[this.Prime];
  }

  findsubpath(): void {
    const N = this.matrices.length;
    for (let i = 1; i < N; i++)
      if (this.gpow(i, this.Prime) === 0) {
        G.fieldpattern_subpathid = i;
        G.fieldpattern_subpathorder = this.Prime;
        return;
      }
  }
}

/** info(): prints the solutions for the primes below 500 (a debugging tool, command line -fi) */
export function fieldpattern_info(): void { throw new NotPorted('fieldpattern::info (debug printout)'); }

// current_quotient_field = fpattern(0), fp_invalid = fpattern(0): created here (fpattern is a class of this module)
G.fieldpattern_current_quotient_field = new fpattern(0);
G.fieldpattern_fp_invalid = new fpattern(0);
// quotient_field_changed: G

// default534, default435, default436, default336 (the 3D field patterns as hwrite'd strings): with
// hread_fpattern, a later stage

/** static fpattern fp(...) inside getcurrfp, per branch */
const statics = new Map<string, fpattern>();
function static_fp(name: string, p: number): fpattern {
  let fp = statics.get(name);
  if (!fp) { fp = new fpattern(p); statics.set(name, fp); }
  return fp;
}

export function fieldpattern_getcurrfp(): fpattern {
  if (fake_in()) throw new NotPorted('getcurrfp: fake (FPIU)');
  if (G.geometry === gFieldQuotient && G.fieldpattern_quotient_field_changed)
    return G.fieldpattern_current_quotient_field;
  if (among_g(gSpace535, gSpace534, gSpace435, gSpace436, gSpace336, gSpace344, gSpace536, gSpace345, gSpace353, gSpace354))
    throw new NotPorted('getcurrfp: 3D field patterns');
  if (G.geometry === gCubeTiling) {
    // static fpattern fp(2): solve() reaches solve3
    return static_fp('cube', 2);
  }
  if (!hyperbolic()) return G.fieldpattern_fp_invalid;
  if (WDIM() === 3 && !quotient() && !mhybrid() && !bt_in()) {
    throw new NotPorted('getcurrfp: 3D hyperbolic (solve3)');
  }
  if (S7() === 8 && S3() === 3 && !bt_in()) {
    return static_fp('83', 17);
  }
  if (S7() === 5 && S3() === 4 && !bt_in()) {
    return static_fp('54', 11);
  }
  if (S7() === 6 && S3() === 4 && !bt_in()) {
    return static_fp('64', 13);
  }
  if (S7() === 7 && S3() === 4 && !bt_in()) {
    return static_fp('74', 13);
  }
  if (sphere() || euclid()) return G.fieldpattern_fp_invalid;
  if (S7() === 7 && S3() === 3 && !bt_in()) {
    if (PURE()) {
      // we need another static because the prairie values have to be set differently in pure
      return static_fp('73pure', 43);
    }
    return static_fp('73', 43);
  }
  return G.fieldpattern_fp_invalid;
}

function among_g(...gs: number[]): boolean { return gs.includes(G.geometry); }

// subpathid, subpathorder: G ("todo undefined behavior")

// extra information for field quotient extra configuration

/** vector<fgeomextra> fgeomextras (created on first use: its initializer names geometries of classes.ts) */
export function fieldpattern_fgeomextras(): fgeomextra[] {
  if (!G.fieldpattern_fgeomextras) G.fieldpattern_fgeomextras = [
    new fgeomextra(gNormal, 4),
    new fgeomextra(gOctagon, 1),
    new fgeomextra(g45, 1),
    new fgeomextra(g46, 5),
    new fgeomextra(g47, 1),
    new fgeomextra(gSchmutzM3, 0),
    /*  fgeomextra(gSphere, 0),
      fgeomextra(gSmallSphere, 0), -> does not find the prime
      fgeomextra(gEuclid, 0),
      fgeomextra(gEuclidSquare, 0),
      fgeomextra(gTinySphere, 0) */
  ];
  return G.fieldpattern_fgeomextras;
}

// current_extra: G

export function fieldpattern_nextPrime(ex: fgeomextra): void {
  const g = G.geometry, t = G.fieldpattern_triplet_id;
  G.geometry = ex.base; G.fieldpattern_triplet_id = 0;
  try {
    let nextprime: number;
    if (ex.primes.length)
      nextprime = ex.primes[ex.primes.length - 1].p + 1;
    else
      nextprime = 2;
    while (true) {
      const fp = new fpattern(0);
      fp.Prime = nextprime;
      if (fp.solve() === 0) {
        fp.build();
        const cells = Math.trunc(fp.matrices.length / S7());
        ex.primes.push({ p: nextprime, cells, squared: !!fp.wsquare });
        ex.dualval.push(fp.dual);
        break;
      }
      nextprime++;
    }
  } finally { G.geometry = g; G.fieldpattern_triplet_id = t; }
}

export function fieldpattern_nextPrimes(ex: fgeomextra): void {
  while (ex.primes.length < 6)
    fieldpattern_nextPrime(ex);
}

export function fieldpattern_enableFieldChange(): void {
  const gxcur = fieldpattern_fgeomextras()[G.fieldpattern_current_extra];
  G.fieldpattern_quotient_field_changed = true;
  fieldpattern_nextPrimes(gxcur);
  const g = G.geometry;
  G.geometry = gFieldQuotient;
  try {
    const gi = ginf[G.geometry], gb = ginf[gxcur.base];
    gi.g = { ...gb.g, sig: [...gb.g.sig] };
    gi.sides = gb.sides;
    gi.vertex = gb.vertex;
    gi.distlimit = [...gb.distlimit];
    gi.tiling_name = gb.tiling_name;
    gi.default_variation = gb.default_variation;
    gi.flags = qFIELD | qANYQ | qCLOSED;
    G.fieldpattern_current_quotient_field.init(gxcur.primes[gxcur.current_prime_id].p);
  } finally { G.geometry = g; }
}

// underlying_geometry: G

export function fieldpattern_field_from_current(): void {
  const go = ginf[G.geometry];
  G.fieldpattern_underlying_geometry = G.geometry;
  const g = G.geometry;
  G.geometry = gFieldQuotient;
  try {
    const gg = ginf[G.geometry];
    gg.sides = go.sides;
    gg.vertex = go.vertex;
    gg.distlimit = [...go.distlimit];
    gg.tiling_name = go.tiling_name;
    gg.flags = go.flags | qANYQ | qFIELD | qCLOSED;
    gg.g = { ...go.g, sig: [...go.g.sig] };
    gg.default_variation = go.default_variation;
    G.fieldpattern_quotient_field_changed = true;
  } finally { G.geometry = g; }
}

/** int hk = addHook(hooks_args, 0, ...): the -q3-limitsq / -q3-limitp / -q3-limitv options (CAP_COMMANDLINE);
 *  the CAP_THREAD hooks belong to the 3D discovery (a later stage). Called by hyper-main.ts in include order. */
export function register_fieldpattern(): void {
  G.hooks_args.add(0, () => {
    // using namespace arg;
    if (arg_argis('-q3-limitsq')) { arg_shift(); limitsq = arg_argi(); }
    else if (arg_argis('-q3-limitp')) { arg_shift(); limitp = arg_argi(); }
    else if (arg_argis('-q3-limitv')) { arg_shift(); limitv = arg_argi(); }
    else return 1;
    return 0;
  });
}

// hooks_on_geometry_change: G (P8's system section)

export function fieldpattern_field_celldistance(c1: cell, c2: cell): number {
  if (G.geometry !== gFieldQuotient) return DISTANCE_UNKNOWN;
  if (GOLDBERG()) return DISTANCE_UNKNOWN;
  const v1 = fieldpattern_fieldval(c1);
  const v2 = fieldpattern_fieldval(c2);
  const d = fieldpattern_getcurrfp().getdist(v1, v2);
  return d;
}

export function currfp_gmul(a: number, b: number): number { return fieldpattern_getcurrfp().gmul(a, b); }
export function currfp_inverses(i: number): number { return fieldpattern_getcurrfp().inverses[i]; }
export function currfp_distwall(i: number): number { return fieldpattern_getcurrfp().distwall[i]; }
export function currfp_n(): number { return fieldpattern_getcurrfp().matrices.length; }
export function currfp_get_R(): number { const fp = fieldpattern_getcurrfp(); return fp.code(fp.R); }
export function currfp_get_P(): number { const fp = fieldpattern_getcurrfp(); return fp.code(fp.P); }
export function currfp_get_X(): number { const fp = fieldpattern_getcurrfp(); return fp.code(fp.X); }

export function hread_fpattern(_hs: unknown, _fp: fpattern): void { throw new NotPorted('hread_fpattern (3D field patterns)'); }
export function hwrite_fpattern(_hs: unknown, _fp: fpattern): void { throw new NotPorted('hwrite_fpattern (3D field patterns)'); }

void limitp; void limitv;
