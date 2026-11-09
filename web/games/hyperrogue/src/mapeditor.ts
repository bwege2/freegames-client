// mapeditor.cpp of HyperRogue 13.1o. STUB (a later stage; owned by package P8; created by P2).
import { NotPorted } from './hyper.ts';
import type { cell } from './locations.ts';
import type { modestream } from './yendor.ts';

/** EX void mapstream::save_geometry(hstream& f) (stage 3, package G1: the geometries ported so far; the others
 *  throw NotPorted where they would write their own data) */
export function mapstream_save_geometry(f: modestream): void {
  f.write_int(G.geometry);
  f.write_char(G.variation);
  // CAP_GP
  if (GOLDBERG() || INVERSE()) {
    f.write_int(G.gp_param[0]);
    f.write_int(G.gp_param[1]);
  }
  // CAP_IRR
  if (IRREGULAR()) throw new NotPorted('save_geometry: irr::save_map_bin'); // STAGE3-STUB
  // MAXMDIM >= 4
  if (G.variation === eVariation.coxeter || is_subcube_based(G.variation)) throw new NotPorted('save_geometry: reg3 variations'); // STAGE3-STUB
  // CAP_FIELD
  if (G.geometry === gFieldQuotient) {
    f.write_char(G.fieldpattern_quotient_field_changed ? 1 : 0);
    if (G.fieldpattern_quotient_field_changed) throw new NotPorted('save_geometry: changed field quotient'); // STAGE3-STUB
  }
  if (cryst()) throw new NotPorted('save_geometry: crystal'); // STAGE3-STUB
  if (G.geometry === gArchimedean) throw new NotPorted('save_geometry: arcm'); // STAGE3-STUB
  if (G.geometry === gArbitrary) throw new NotPorted('save_geometry: arb'); // STAGE3-STUB
  if (G.geometry === gNil) throw new NotPorted('save_geometry: nil'); // STAGE3-STUB
  if (G.geometry === gArnoldCat) throw new NotPorted('save_geometry: asonov'); // STAGE3-STUB
  if (mproduct() || mtwisted() || mhybrid()) throw new NotPorted('save_geometry: hybrid'); // STAGE3-STUB
  if (fake_in()) throw new NotPorted('save_geometry: fake'); // STAGE3-STUB
  if (bt_in()) f.write_ld(G.vid.binary_width);
  if (euc_in()) {
    const T = euc_state.eu_input.user_axes;
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) f.write_int(T[i][j]);
    f.write_int(euc_state.eu_input.twisted);
  }
  f.write_int(G.mine_adjacency_rule);
  f.write_int(G.req_disksize);
  f.write_int(G.diskshape);
}

/** EX void mapstream::load_geometry(hstream& f) (stage 3, package G1) */
export function mapstream_load_geometry(f: modestream): void {
  const was_default = pconf().model === default_model();
  const vernum = f.vernum;
  G.geometry = f.get_int();
  const nbtype = f.get_char();
  G.variation = nbtype;
  // CAP_GP
  if (GOLDBERG() || INVERSE()) {
    G.gp_param[0] = f.get_int();
    G.gp_param[1] = f.get_int();
  }
  if (IRREGULAR()) throw new NotPorted('load_geometry: irr::load_map_full'); // STAGE3-STUB
  if (G.variation === eVariation.coxeter || is_subcube_based(G.variation)) throw new NotPorted('load_geometry: reg3 variations'); // STAGE3-STUB
  if (cryst()) throw new NotPorted('load_geometry: crystal'); // STAGE3-STUB
  // CAP_FIELD
  if (G.geometry === gFieldQuotient) {
    G.fieldpattern_quotient_field_changed = f.get_char() !== 0;
    if (G.fieldpattern_quotient_field_changed) throw new NotPorted('load_geometry: changed field quotient'); // STAGE3-STUB
  }
  if (G.geometry === gArbitrary || G.geometry === gArchimedean || G.geometry === gNil || G.geometry === gArnoldCat ||
    G.geometry === gProduct || G.geometry === gTwistedProduct || mhybrid() || fake_in())
    throw new NotPorted('load_geometry: ' + ginf[G.geometry].shortname); // STAGE3-STUB
  if (bt_in() && vernum >= 0xA80C)
    G.vid.binary_width = f.get_ld();
  if (euc_in() && vernum >= 0xA80D) {
    const T = euc_state.eu_input.user_axes;
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) T[i][j] = f.get_int();
    euc_state.eu_input.twisted = f.get_int();
  }
  if (vernum >= 0xA810)
    G.mine_adjacency_rule = f.get_int();
  if (vernum >= 0xA933) {
    G.req_disksize = f.get_int();
    G.diskshape = f.get_int();
  }
  geometry_settings(was_default);
}
import { G, pconf } from './globals.ts';
import {
  GOLDBERG, INVERSE, IRREGULAR, eVariation, gFieldQuotient, cryst, gArchimedean, gArbitrary, gNil, gArnoldCat, mproduct,
  mtwisted, mhybrid, gProduct, gTwistedProduct, ginf,
} from './classes.ts';
import { is_subcube_based } from './geometry.ts';
import { fake_in } from './fake.ts';
import { bt_in } from './binary-tiling.ts';
import { euc_in, euc_state } from './euclid.ts';
import { default_model, geometry_settings } from './system.ts';

// added by P3 (landlock.ts, landgen.ts, monstergen.ts): STAGE1-STUB until its owner ports it
export function mapeditor_applyModelcell(_c: cell): void { throw new NotPorted('mapeditor::applyModelcell'); } // STAGE1-STUB
// added by D1 (hypgraph.ts move_affected_matrices): STAGE2-STUB
/** mapeditor::dt_in(): return cfree; (the free-form drawing tool is never active in stage 2) */
export function mapeditor_dt_in(): boolean { return false; } // STAGE2-STUB (real: cfree is null)

// added by D3 (graph.ts drawthemap, celldrawer.ts): STAGE2-STUBs (the map editor is stage 3)
/** mapeditor::draw_dtshapes(): fmh_known = false; then the free-form shapes of the drawing tool (none in stage 2) */
export function mapeditor_draw_dtshapes(): void { } // STAGE2-STUB (real: dtshapes is empty)
/** mapeditor::drawGhosts(c, V, ct): the editor's ghosts (only in its drawing modes, sm::DRAW) */
export function mapeditor_drawGhosts(_c: cell, _V: import('./hyperpoint.ts').shiftmatrix, _ct: number): void {
  if (G_me.cmode & 16n) throw new NotPorted('mapeditor::drawGhosts (the map editor)'); // STAGE2-STUB (sm::DRAW)
}
import { G as G_me } from './globals.ts';

// added by U3 (control.ts: Shift + wheel): STAGE2-STUB (mapeditor.cpp, stage 3)
/** void mapeditor::scaleall(ld scale, bool keep_mouse) */
export function mapeditor_scaleall(_scale: number, _keep_mouse: boolean): void { } // STAGE2-STUB

// added by U2 (menus.ts showCreative): STAGE2-STUB (the editors are stage 3)
export function mapeditor_showMapEditor(): void { throw new NotPorted('mapeditor::showMapEditor'); } // STAGE2-STUB
export function mapeditor_showDrawEditor(): void { throw new NotPorted('mapeditor::showDrawEditor'); } // STAGE2-STUB
export function mapeditor_initdraw(_c: cell): void { throw new NotPorted('mapeditor::initdraw'); } // STAGE2-STUB
