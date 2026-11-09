// embeddings.cpp of HyperRogue 13.1o. STUB (a later stage; owned by package P1): what the stage-1 files use of it.
// Functions that test the current geometry are real (they give the standard geometry's answer there); the others
// throw NotPorted, as the standard geometry never reaches them. Each is marked STAGE1-STUB.
// Added by P1b: embedding_method with the behaviour of emb_none (the embedding of every 2D geometry drawn in 2D:
// its logical/intermediate matrices are Id, so spin(a) = Id * cspin(0, 1, a) * Id = cspin(0, 1, a) exactly),
// make_embed, mgclass/ggclass and the m*/l* functions of embeddings.cpp that geometry.cpp, geometry2.cpp and the
// rules use (spin, spin90/180/270, lzpush, lxpush, lxpush0, tile_center, lspinpush0, xspinpush0, xspinpush,
// lspintox, lrspintox): real for that case, NotPorted for an embedded plane (3D graphics).
import { c_cos, c_sin } from './cpp.ts';
import { NotPorted, hr_exception } from './hyper.ts';
import { G } from './globals.ts';
import {
  ginf, embedded_plane, mhybrid, sl2, euclid, WDIM, LDIM, gproduct, gcEuclid, gcSphere, gcHyperbolic, sol, nih, nil,
  hyperbolic, sphere, MDIM,
} from './classes.ts';
import {
  type hyperpoint, type transmatrix, Id, C0, tcopy, tmul, tmulh, cspin, cspin90, cspin180, cpush, xpush, eupush,
  cos_auto, sin_auto, hcopy, Hypc, spintoc, rspintoc, inverse, M_PI,
} from './hyperpoint.ts';
import { in_h2xe, in_s2xe } from './nonisotropic.ts';
import { cgi } from './geometry.ts';

/** #define IPF(x) geom3::in_flipped([&] { return (x); }): only with an embedded plane (3D graphics) */
export function geom3_in_flipped<T>(_f: () => T): T { throw new NotPorted('geom3::in_flipped'); } // STAGE1-STUB
export function swapmatrix(_m: unknown): void { throw new NotPorted('swapmatrix'); } // STAGE1-STUB

/** geom3::mgclass(): (embedded_plane ? ginf_backup : ginf)[geometry].g.kind */
export function geom3_mgclass(): number { // STAGE1-STUB (real without an embedded plane)
  if (embedded_plane()) throw new NotPorted('geom3::mgclass: embedded plane (ginf_backup)');
  return ginf[G.geometry].g.kind;
}
/** geom3::ggclass(): (flipped ? ginf_backup : ginf)[geometry].g.kind; geom3::flipped is false without an embedded plane */
export function geom3_ggclass(): number { return ginf[G.geometry].g.kind; } // STAGE1-STUB (real when not flipped)
/** #define meuclid (geom3::mgclass() == gcEuclid) */
export function meuclid(): boolean { return geom3_mgclass() === gcEuclid; }
/** #define msphere (geom3::mgclass() == gcSphere) */
export function msphere(): boolean { return geom3_mgclass() === gcSphere; }
/** #define mhyperbolic (geom3::mgclass() == gcHyperbolic) */
export function mhyperbolic(): boolean { return geom3_mgclass() === gcHyperbolic; }

/** struct embedding_method, as emb_none (the only one without an embedded plane) */
export class embedding_method {
  /** convert the tangent space in logical coordinates to actual coordinates */
  logical_to_intermediate: transmatrix = tcopy(Id);
  /** convert the tangent space in actual coordinates to logical coordinates */
  intermediate_to_logical: transmatrix = tcopy(Id);
  /** convert the tangent space in logical coordinates to actual coordinates */
  logical_scaled_to_intermediate: transmatrix = tcopy(Id);
  /** convert the tangent space in actual coordinates to logical coordinates */
  intermediate_to_logical_scaled: transmatrix = tcopy(Id);

  center_z(): number { return 0; }
  /** emb_none::normalize_flat (added by D3: graph.cpp, celldrawer.cpp) */
  normalize_flat(a: hyperpoint): hyperpoint {
    if (gproduct_emb()) throw new NotPorted('emb_none::normalize_flat: product (flatten)'); // STAGE2-STUB
    return normalize_emb(a);
  }
  tile_center(): hyperpoint {
    const z = this.center_z();
    if (z === 0) return C0();
    return tmulh(lzpush(z), C0());
  }
  actual_to_intermediate(a: hyperpoint): hyperpoint {
    if (mhybrid()) throw new NotPorted('emb_none::actual_to_intermediate: hybrid');
    return a;
  }
  intermediate_to_actual(i: hyperpoint): hyperpoint {
    if (mhybrid()) throw new NotPorted('emb_none::intermediate_to_actual: hybrid');
    return i;
  }
  get_lsti(): transmatrix { return Id; }
  get_lti(): transmatrix { return this.logical_scaled_to_intermediate; }
  /** embedding_method::height_limit (added by stage 2 package D2: prepare_compute3) */
  height_limit(sign: number): number {
    if (sign > 0) {
      if (sol() || nih()) return 2.5;
      if (hyperbolic() || sl2() || in_h2xe()) return 5;
      if (sphere() || nil() || in_s2xe()) return M_PI / 2;
      return 100;
    }
    if (sign < 0) {
      if (this.center_z()) return -this.center_z();
      if (sol() || nih()) return -2.5;
      if (hyperbolic() || sl2() || in_h2xe()) return -5;
      if (sphere() || nil() || in_s2xe()) return -M_PI / 2;
      return -100;
    }
    return 0;
  }
  base_to_actual(_h: hyperpoint): hyperpoint { throw new NotPorted('embedding_method::base_to_actual'); }
  is_euc_in_product(): boolean { return false; }
  is_product_embedding(): boolean { return false; }
  is_euc_in_sl2(): boolean { return false; }
  is_same_in_same(): boolean { return false; }
  is_sph_in_low(): boolean { return false; }
  is_hyp_in_solnih(): boolean { return false; }
  is_euc_scalable(): boolean { return false; }
  is_euc_in_hyp(): boolean { return false; }
  is_euc_in_sph(): boolean { return false; }
  is_euc_in_nil(): boolean { return false; }
  is_euc_in_noniso(): boolean { return false; }
  is_in_noniso(): boolean { return false; }
  is_cylinder(): boolean { return false; }
  no_spin(): boolean { return false; }

  prepare_lta(): void {
    // bool b = geom3::flipped; (false without an embedded plane)
    this.logical_scaled_to_intermediate = tcopy(this.get_lsti());
    this.intermediate_to_logical_scaled = inverse(this.logical_scaled_to_intermediate);
    this.logical_to_intermediate = tcopy(this.get_lti());
    this.intermediate_to_logical = inverse(this.logical_to_intermediate);
    // if(MDIM == 3 && MAXMDIM == 4): just in case
    for (let i = 0; i < 4; i++)
      this.intermediate_to_logical_scaled[i][3] = this.intermediate_to_logical_scaled[3][i] =
        this.intermediate_to_logical[3][i] = this.intermediate_to_logical[i][3] = (i === 3 ? 1 : 0);
  }
}

/** pick the embedding_method for the current setting */
export function make_embed(): embedding_method { // STAGE1-STUB (emb_none only)
  if (!embedded_plane()) {
    const emb = new embedding_method();
    emb.prepare_lta();
    return emb;
  }
  throw new NotPorted('make_embed: embedded plane');
}

/** spin(alpha)'s products (see there) */
const spin_cache = {
  lsti: null as transmatrix | null, itls: null as transmatrix | null, n: 0,
  m: new Map<number, transmatrix>(), negzero: null as transmatrix | null,
};

/** rotate by alpha degrees in the XY plane */
export function spin(alpha: number): transmatrix {
  const e = cgi().emb;
  if (e.no_spin()) return Id;
  // (performance, added after stage 2) the product is a function of alpha, the two matrices of the embedding
  // (replaced, never changed, by prepare_lta) and MDIM: cached per alpha, a copy returned
  const lsti = e.logical_scaled_to_intermediate, itls = e.intermediate_to_logical_scaled, n = MDIM();
  if (lsti !== spin_cache.lsti || itls !== spin_cache.itls || n !== spin_cache.n || spin_cache.m.size > 4096) {
    spin_cache.lsti = lsti; spin_cache.itls = itls; spin_cache.n = n; spin_cache.m.clear(); spin_cache.negzero = null;
  }
  const negzero = alpha === 0 && 1 / alpha < 0; // a Map does not tell -0 from +0
  let R = negzero ? spin_cache.negzero : spin_cache.m.get(alpha);
  if (!R) {
    R = tmul(tmul(lsti, cspin(0, 1, alpha)), itls);
    if (negzero) spin_cache.negzero = R; else spin_cache.m.set(alpha, R);
  }
  return tcopy(R);
}

/** rotate by 90 degrees in the XY plane */
export function spin90(): transmatrix {
  const e = cgi().emb;
  if (e.no_spin()) return Id;
  return tmul(tmul(e.logical_scaled_to_intermediate, cspin90(0, 1)), e.intermediate_to_logical_scaled);
}

/** rotate by 180 degrees in the XY plane */
export function spin180(): transmatrix {
  const e = cgi().emb;
  if (e.no_spin()) return Id;
  return tmul(tmul(e.logical_scaled_to_intermediate, cspin180(0, 1)), e.intermediate_to_logical_scaled);
}

/** rotate by 270 degrees in the XY plane */
export function spin270(): transmatrix {
  const e = cgi().emb;
  if (e.no_spin()) return Id;
  return tmul(tmul(e.logical_scaled_to_intermediate, cspin90(1, 0)), e.intermediate_to_logical_scaled);
}

export function lzpush(z: number): transmatrix {
  const lti = cgi().emb.logical_scaled_to_intermediate;
  if (lti[0][2]) return cpush(0, lti[0][2] * z);
  if (lti[1][2]) return cpush(1, lti[1][2] * z);
  return cpush(2, z);
}

export function lxpush(alpha: number): transmatrix {
  if (embedded_plane()) throw new NotPorted('lxpush: embedded plane');
  return cpush(0, alpha);
}

export function lxpush0(x: number): hyperpoint { return tmulh(lxpush(x), tile_center()); }

export function lspintox(H: hyperpoint): transmatrix {
  if (cgi().emb.no_spin()) return Id;
  if (embedded_plane()) throw new NotPorted('lspintox: embedded plane');
  if (WDIM() === 2 || gproduct()) return spintoc(H, 0, 1);
  const T1 = spintoc(H, 0, 1);
  return tmul(spintoc(tmulh(T1, H), 0, 2), T1);
}

export function lrspintox(H: hyperpoint): transmatrix {
  if (cgi().emb.no_spin()) return Id;
  if (embedded_plane()) throw new NotPorted('lrspintox: embedded plane');
  if (WDIM() === 2 || gproduct()) return rspintoc(H, 0, 1);
  const T1 = spintoc(H, 0, 1);
  return tmul(rspintoc(H, 0, 1), rspintoc(tmulh(T1, H), 0, 2));
}

export function tile_center(): hyperpoint { return cgi().emb.tile_center(); }

export function lspinpush0(alpha: number, x: number): hyperpoint {
  const f = embedded_plane();
  if (f) throw new NotPorted('lspinpush0: embedded plane');
  if (embedded_plane()) throw new hr_exception('still embedded plane');
  const h = xspinpush0(alpha, x);
  return h;
}

export function xspinpush0(alpha: number, x: number): hyperpoint {
  if (embedded_plane()) return lspinpush0(alpha, x);
  if (sl2()) throw new NotPorted('xspinpush0: slr::polar');
  const h = hcopy(Hypc);
  h[LDIM()] = cos_auto(x);
  h[0] = sin_auto(x) * c_cos(alpha);
  h[1] = sin_auto(x) * -c_sin(alpha);
  return h;
}

export function xspinpush(dir: number, dist: number): transmatrix {
  if (embedded_plane()) throw new NotPorted('xspinpush: embedded plane');
  else if (euclid())
    return eupush(c_cos(dir) * dist, -c_sin(dir) * dist);
  else
    return tmul(tmul(spin(dir), xpush(dist)), spin(-dir));
}

// --- added by D1 (hypgraph.ts; stage 2) ---
/** const transmatrix& lmirror() (real for emb_none) */
export function lmirror(): transmatrix {
  if (cgi().emb.is_euc_in_product()) return Id;
  if (cgi().emb.is_cylinder() && nil()) return Id;
  if (cgi().emb.logical_to_intermediate[2][1]) return MirrorZ;
  if (cgi().emb.is_hyp_in_solnih()) return MirrorY;
  return Mirror;
}
/** geom3::apply_always3(): swaps ginf with ginf_backup when vid.always3 changes; stage 2 never sets always3 */
export function geom3_apply_always3(): void {
  if (G.vid.always3) throw new NotPorted('geom3::apply_always3 (always3: 3D)'); // STAGE2-STUB
  // !vid.always3 && !ginf_backup.empty(): ginf_backup is always empty here
}
import { Mirror, MirrorY, MirrorZ } from './hyperpoint.ts';
import { normalize as normalize_emb } from './hyperpoint.ts';
import { gproduct as gproduct_emb } from './classes.ts';
