// models.cpp of HyperRogue 13.1o. STUB (graphics, a later stage; owned by package P8): what the stage-1 files use
// of it. Each is marked STAGE1-STUB. (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.

/** polygonal::solve(): only for the polynomial/polygonal models; the default model (the disk) returns at once */
export function polygonal_solve(): void { } // STAGE1-STUB (graphics; the default model)

// --- added by D1 (drawing.ts, hypgraph.ts): the small helpers of models.cpp the drawing needs; real, D2 owns
// the file (move/merge freely) ---
import { G, pconf } from './globals.ts';
import { NotPorted } from './hyper.ts';
import { sphere, nonisotropic, mdinf, mf, type eModel } from './classes.ts';
import { type hyperpoint, type transmatrix, tmulh, tmul, iso_inverse } from './hyperpoint.ts';

/** inline bool mdAzimuthalEqui() */
export function mdAzimuthalEqui(): boolean {
  const f = mdinf[pconf().model].flags;
  return (f & mf.azimuthal) !== 0n && ((f & (mf.equidistant | mf.equiarea | mf.equivolume)) !== 0n && !((f & mf.twopoint) !== 0n));
}
/** inline bool mdBandAny() */
export function mdBandAny(): boolean { return (mdinf[pconf().model].flags & mf.pseudocylindrical) !== 0n; }

/** models::ori_to_scr(hyperpoint& h): returns the new h */
export function models_ori_to_scr(h: hyperpoint): hyperpoint { if (!G.models_model_straight) h = tmulh(pconf().mori().get(), h); return h; }
/** models::ori_to_scr(transmatrix& h) */
export function models_ori_to_scr_t(h: transmatrix): transmatrix { if (!G.models_model_straight) h = tmul(pconf().mori().get(), h); return h; }
/** models::scr_to_ori(hyperpoint& h) */
export function models_scr_to_ori(h: hyperpoint): hyperpoint { if (!G.models_model_straight) h = tmulh(iso_inverse(pconf().mori().get()), h); return h; }
/** models::scr_to_ori(transmatrix& h) */
export function models_scr_to_ori_t(h: transmatrix): transmatrix { if (!G.models_model_straight) h = tmul(iso_inverse(pconf().mori().get()), h); return h; }

/** models::get_broken_coord(eModel m): the broken coordinate, or zero */
export function models_get_broken_coord(m: eModel): number {
  if (mdinf[m].flags & mf.werner) return 1;
  if (sphere()) return (mdinf[m].flags & mf.broken) ? 2 : 0;
  return 0;
}

/** models::is_perspective(eModel m) */
export function models_is_perspective(m: eModel): boolean { return (mdinf[m].flags & mf.perspective) !== 0n; }
void nonisotropic;

// --- added by D1 (hypgraph.ts): real; D2 owns the file (move/merge freely) ---
/** models::is_hyperboloid(eModel m) */
export function models_is_hyperboloid(m: eModel): boolean {
  return m === (sphere() ? mdHemisphere : mdHyperboloid);
}
/** models::product_model(eModel m) */
export function models_product_model(m: eModel): boolean {
  if (!gproduct()) return false;
  if ((mdinf[m].flags & mf.product_special) && !(pconf().model === mdDisk && pconf().alpha !== 1)) return false;
  return true;
}
import { gproduct, mdHemisphere, mdHyperboloid, mdDisk } from './classes.ts';

// --- package D2 ---
/** cld models::spiral_multiplier as [re, im]; ld spiral_cone_rad; bool model_straight_yz (file state of models.cpp) */
export const models_state = { spiral_multiplier: [0, 0] as [number, number], spiral_cone_rad: 0, model_straight_yz: false };

/** models::configure() */
export function models_configure(): void {
  const mori = pconf().mori().get();
  G.models_model_straight = (mori[0][0] > 1 - 1e-9);
  models_state.model_straight_yz = GDIM() === 2 || (mori[2][2] > 1 - 1e-9);
  G.models_camera_straight = eqmatrix(pconf().cam(), Id);
  if (G.history_on) history_apply();

  if (!euclid()) {
    const b = pconf().spiral_angle * degree;
    const cos_spiral = c_cos(b);
    const sin_spiral = c_sin(b);
    models_state.spiral_cone_rad = pconf().spiral_cone * degree;
    G.models_ring_not_spiral = Math.abs(cos_spiral) < 1e-3;
    let mul = 1;
    if (sphere()) mul = .5 * pconf().sphere_spiral_multiplier;
    else if (G.models_ring_not_spiral) mul = pconf().right_spiral_multiplier;
    else mul = pconf().any_spiral_multiplier * cos_spiral;

    // cld(cos_spiral, sin_spiral) * cld(spiral_cone_rad * mul / 2., 0)
    const r = models_state.spiral_cone_rad * mul / 2.;
    models_state.spiral_multiplier = [cos_spiral * r - sin_spiral * 0, cos_spiral * 0 + sin_spiral * r];
  }
  if (euclid()) {
    // stage 3, package G1
    G.models_euclidean_spin = tmul(pispin, iso_inverse(tmul(cview().T, G.currentmap.master_relative(G.current_display.precise_center, true))));
    G.models_euclidean_spin = tmul(gpushxto0(tmulh(G.models_euclidean_spin, C0())), G.models_euclidean_spin);
    const h = tmulh(inverse(G.models_euclidean_spin), hadd(hadd(C0(), hmul(hsub(tmulh(euc_eumove_loc([1, 0]), C0()), C0()), pconf().spiral_x)), hmul(hsub(tmulh(euc_eumove_loc([0, 1]), C0()), C0()), pconf().spiral_y)));
    // spiral_multiplier = cld(0, TAU) / cld(h[0], h[1])
    const den = h[0] * h[0] + h[1] * h[1];
    models_state.spiral_multiplier = [(0 * h[0] + TAU * h[1]) / den, (TAU * h[0] - 0 * h[1]) / den];
  }

  const centerover = G.current_display.precise_center;
  if (centerover && !G.history_on) {
    const p = G.history_path_for_lineanimation;
    if (p.length === 0 || ((quotient() || arb_in()) && p[p.length - 1] !== centerover)) {
      p.push(centerover);
    }
  }
}
import { GDIM, euclid, quotient } from './classes.ts';
import { eqmatrix, Id, degree, pispin, gpushxto0, C0, inverse, hadd, hmul, hsub } from './hyperpoint.ts';
import { cview } from './graph.ts';
import { euc_eumove_loc } from './euclid.ts';
import { c_cos, c_sin } from './cpp.ts';
import { history_apply } from './history.ts';
import { arb_in } from './arbitrile.ts';

// --- package U4: the menus of models.cpp (model_list, model_menu, quick_model, edit_formula), the model
// queries they use (model_available, has_orientation, is_3d, has_transition, get_model_name), the command line
// options (readArgs) and the parameters (add_model_config). The rug (CAP_RUG) and VR (vrhr::active() is
// false) are stage 3. ---
import { stub_screen_pop, pushScreen } from './control.ts';
import {
  mdBall, mdRotatedHyperboles, mdPanini, mdPolynomial, mdHalfplane, mdLieOrthogonal, mdLiePerspective, mdBandEquiarea,
  mdBand, mdPolygonal, mdFisheye, mdFisheye2, mdCollignon, mdMiller, mdLoximuthal, mdRetroHammer, mdRetroCraig,
  mdPolar, mdAitoff, mdHammer, mdWinkelTripel, mdSpiral, mdJoukowsky, mdJoukowskyInverted, mdFormula,
  mdRelPerspective, mdRelOrthogonal, mdGeodesic, mdEquidistant, mdHorocyclic, mdPerspective, mdEquivolume,
  mdThreePoint, mdCentralInversion, mdPoorMan, mdRetroHammer as mdRetroHammer_, hyperbolic, sl2, nil, sol, nih,
  WDIM, MDIM,
} from './classes.ts';
import { XLAT } from './language.ts';
import { fts, its } from './hprint.ts';
import { among, isize } from './hyper.ts';
import { sPanini } from './basegraph.ts';
import { in_s2xe, in_h2xe } from './nonisotropic.ts';
import { trans23, TAU } from './hyperpoint.ts';
import {
  dialog_init_t, dialog_addItem, dialog_addSelItem, dialog_addBoolItem, dialog_addMatrixItem, dialog_addInfo,
  dialog_addBreak, dialog_addBack, dialog_display, dialog_add_action, dialog_add_action_push, dialog_lastItem,
  dialog_get_di, dialog_get_ne, dialog_editNumber, dialog_editNumber_n, dialog_editMatrix, dialog_edit_string,
  dialog_start_list, dialog_end_list, dialog_bound_low, dialog_bound_up, dialog_scaleLog, dialog_addBoolItem_action,
  dialog_addBoolItem_choice, dialog_parser_help, diItem, ONOFF,
} from './dialogs.ts';
import { gamescreen, popScreen, sm, in_perspective_v } from './graph.ts';
import {
  E, P, PC, param_i, param_f, param_b, param_enum, param_str, param_matrix, param_custom_int, param_custom_ld,
  add_edit, menuitem_sightrange, menuitem_projection_distance, update_linked,
} from './config.ts';
import { menuitem_projection } from './geom-exp.ts';
import { editScale } from './menus.ts';
import { get_shader_flags } from './basegraph.ts';
import { addHook } from './hyper.ts';
import { arg_argis, arg_shift, arg_args, arg_argi, arg_shift_arg_formula, arg_launch_dialog, PHASEFROM } from './commandline.ts';
import { appears } from './util.ts';
import { type projection_configuration } from './globals.ts';

// EX trans23 rotation: G.models_rotation (made by add_model_config); EX int do_rotate = 1: G.models_do_rotate
// int spiral_id = 7 (match_torus_period: Euclidean tori, stage 3)
// EX bool desitter_projections: G.models_desitter_projections
// EX vector<bool_reaction_t> avail_checkers: none are added in the port (stage-3 features add them)

/** EX bool model_available(eModel pm) */
export function models_model_available(pm: eModel): boolean {
  // if(pm < isize(avail_checkers) && avail_checkers[pm]) return avail_checkers[pm]();
  if (mdinf[pm].flags & mf.technical) return false;
  if (gproduct()) {
    // if(pm == mdPerspective) return true; if(among(pm, mdBall, mdHemisphere)) return false; return PIU(model_available(pm));
    throw new NotPorted('model_available: product geometries'); // STAGE2-STUB
  }
  if (hyperbolic() && G.models_desitter_projections && among(pm, mdRelPerspective, mdRelOrthogonal)) return true;
  if (sl2()) return among(pm, mdGeodesic, mdEquidistant, mdRelPerspective, mdRelOrthogonal, mdHorocyclic, mdPerspective);
  if (among(pm, mdRelOrthogonal, mdRelPerspective)) return false;
  if (nonisotropic()) return among(pm, mdDisk, mdPerspective, mdHorocyclic, mdGeodesic, mdEquidistant, mdFisheye, mdLiePerspective, mdLieOrthogonal);
  if (sphere() && pm === mdBall) return false;
  if (sphere() && (mdinf[pm].flags & mf.horocyclic)) return false;
  if (GDIM() === 2 && models_is_perspective(pm)) return false;
  if (pm === mdGeodesic && !nonisotropic()) return false;
  if (pm === mdLiePerspective && sphere()) return false;
  if (pm === mdLieOrthogonal && sphere()) return false;
  if (GDIM() === 2 && pm === mdEquivolume) return false;
  if (pm === mdThreePoint && !(GDIM() === 3 && !nonisotropic() && !gproduct())) return false;
  if (GDIM() === 3 && among(pm, mdBall, mdHyperboloid, mdFormula, mdPolygonal, mdRotatedHyperboles, mdSpiral, mdHemisphere)) return false;
  if (pm === mdCentralInversion && !euclid()) return false;
  if (pm === mdPoorMan) return hyperbolic();
  if (pm === mdRetroHammer_) return hyperbolic();
  return true;
}

/** the models whose projection the port's applymodel (hypgraph.ts) does not draw yet in 2D: polygonal and
 *  polynomial (polygonal::compute), formula (complex numbers), spiral, the Lie and relativistic models (stage 3).
 *  model_list hides them: choosing one would stop the drawing (README.md). */
function model_drawn_by_port(pm: eModel): boolean {
  return !among(pm, mdPolygonal, mdPolynomial, mdFormula, mdSpiral, mdLieOrthogonal, mdLiePerspective, mdRelPerspective, mdRelOrthogonal);
}

/** EX bool has_orientation(eModel m) */
export function models_has_orientation(m: eModel): boolean {
  if (models_is_perspective(m) && G.vid.stereo_mode === sPanini) return true;
  if (nonisotropic()) return false;
  return (mdinf[m].flags & mf.orientation) !== 0n;
}

/** EX bool is_3d(const projection_configuration& p) */
export function models_is_3d(p: projection_configuration): boolean {
  if (GDIM() === 3) return true;
  return among(p.model, mdBall, mdHyperboloid, mdHemisphere) || (p.model === mdSpiral && p.spiral_cone !== 360);
}

/** EX bool has_transition(eModel m) */
export function models_has_transition(m: eModel): boolean {
  return (mdinf[m].flags & mf.transition) !== 0n && GDIM() === 2;
}

/** int editpos = 0 (unused) */

/** EX string get_model_name(eModel m) */
export function models_get_model_name(m: eModel): string {
  if (m === mdDisk && GDIM() === 3 && (hyperbolic() || nonisotropic())) return XLAT('ball model/Gans');
  if (m === mdPerspective && gproduct()) return XLAT('native perspective');
  if (gproduct()) throw new NotPorted('get_model_name: product geometries (PIU)'); // STAGE2-STUB
  if (nonisotropic()) {
    if (m === mdHorocyclic && sl2()) return XLAT('layered equidistant');
    if (m === mdHorocyclic && !sol()) return XLAT('simple model: projection');
    if (m === mdPerspective) return XLAT('simple model: perspective');
    if (m === mdGeodesic) return XLAT('native perspective');
    if (among(m, mdEquidistant, mdFisheye, mdHorocyclic, mdLiePerspective, mdLieOrthogonal, mdRelPerspective, mdRelOrthogonal)) return XLAT(mdinf[m].name_hyperbolic);
  }
  if (m === mdDisk && GDIM() === 3) return XLAT('perspective in 4D');
  if (m === mdHalfplane && GDIM() === 3 && hyperbolic()) return XLAT('half-space');
  if (sphere())
    return XLAT(mdinf[m].name_spherical);
  if (euclid())
    return XLAT(mdinf[m].name_euclidean);
  if (hyperbolic())
    return XLAT(mdinf[m].name_hyperbolic);
  return '?';
}

// match_torus_period(): Euclidean tori (stage 3)

/** EX void edit_formula() (the formula model is not drawn by the port: reached only from the model list, which
 *  hides it) */
export function models_edit_formula(): void {
  const vp = pconf();
  if (vp.model !== mdFormula) vp.basic_model = vp.model;
  dialog_edit_string(PC('formula'), 'formula',
    XLAT(
      'This lets you specify the projection as a formula f. ' +
      'The formula has access to the value \'z\', which is a complex number corresponding to the (x,y) coordinates in the currently selected model; ' +
      'the point z is mapped to f(z). You can also use the underlying coordinates ux, uy, uz.',
    ),
  );
  // CAP_QUEUE && CAP_CURVE
  dialog_get_di().extra_options = () => {
    dialog_parser_help();
    // the axes drawn with queuecurve in mdPixel (the formula model: stage 3) STAGE2-STUB
  };
  dialog_get_di().reaction_final = () => {
    pconf().model = mdFormula;
  };
}

/** EX void model_list() */
export function models_model_list(): void {
  G.cmode = sm.SIDE | sm.MAYDARK | sm.CENTER;
  gamescreen();
  dialog_init_t(XLAT('models & projections'));
  // CAP_RUG: USING_NATIVE_GEOMETRY_IN_RUG (the rug: stage 3)

  dialog_start_list(2000, 2000, 'a'.charCodeAt(0));
  for (let i = 0; i < isize(mdinf); i++) {
    const m = i;
    // if(m == mdFormula && ISMOBILE) continue;
    if (models_model_available(m) && model_drawn_by_port(m)) {
      dialog_addBoolItem(models_get_model_name(m), pconf().model === m, G.dialog_list_fake_key++);
      dialog_add_action(() => {
        if (m === mdFormula) {
          models_edit_formula();
          return;
        }
        const vp = pconf();
        vp.model = m;
        polygonal_solve();
        vp.alpha = 1; vp.scale = 1;
        if (pconf().model === mdBand && sphere())
          vp.scale = .3;
        if (pconf().model === mdDisk && sphere())
          vp.scale = .4;
        popScreen();
      });
    }
  }

  dialog_end_list();
  dialog_addBreak(100);
  dialog_addBack();
  dialog_display();
}

/** void stretch_extra() */
function stretch_extra(): void {
  const vp = pconf();
  dialog_addBreak(100);
  if (sphere() && pconf().model === mdBandEquiarea) {
    dialog_addBoolItem('Gall-Peters', vp.stretch === 2, 'O'.charCodeAt(0));
    dialog_add_action(() => { vp.stretch = 2; dialog_get_ne().s = '2'; });
  }
  if (pconf().model === mdBandEquiarea) {
    // y = K * sin(phi)
    // cos(phi) * cos(phi) = 1/K
    if (sphere() && vp.stretch >= 1) {
      const phi = Math.acos(Math.sqrt(1 / vp.stretch));
      dialog_addInfo(XLAT('The current value makes the map conformal at the latitude of %1 (%2°).', fts(phi), fts(phi / degree)));
    }
    else if (hyperbolic() && Math.abs(vp.stretch) <= 1 && Math.abs(vp.stretch) >= 1e-9) {
      const phi = Math.acosh(Math.abs(Math.sqrt(1 / vp.stretch)));
      dialog_addInfo(XLAT('The current value makes the map conformal %1 units from the main line.', fts(phi)));
    }
    else dialog_addInfo('');
  }
}

// bool set_vr_settings = true (VR: CAP_VR is 0)

/** EX void model_menu() */
export function models_model_menu(): void {
  G.cmode = sm.SIDE | sm.MAYDARK | sm.CENTER;
  gamescreen();
  // CAP_RUG: USING_NATIVE_GEOMETRY_IN_RUG
  dialog_init_t(XLAT('models & projections'));
  G.mouseovers = XLAT('see http://www.roguetemple.com/z/hyper/models.php');

  const vp = pconf();
  const vpmodel = vp.model;
  const K = (c: string): number => c.charCodeAt(0);

  dialog_addSelItem(XLAT('projection type'), models_get_model_name(vpmodel), K('m'));
  dialog_add_action_push(models_model_list);

  if (nonisotropic() && !sl2())
    dialog_addBoolItem_action(XLAT('geodesic movement in Sol/Nil'), P('nisot_geodesic_movement'), K('G'));

  const rot = models_rotation();
  add_edit((GDIM() === 2 || gproduct()) ? E(rot, 'v2') : E(rot, 'v3'));
  if (G.models_do_rotate === 0) { dialog_lastItem().value = XLAT('NEVER'); dialog_lastItem().type = diItem; }
  else { dialog_lastItem().value = ONOFF(G.models_do_rotate === 2); }

  const vr_settings = false; // vrhr::active() && set_vr_settings

  // if(vrhr::active()) { "edit VR or non-VR settings" } (no VR)

  // if(vpmodel == mdBand && sphere)
  if (!in_perspective_v() && !vr_settings) {
    dialog_addSelItem(XLAT('scale factor'), fts(vp.scale), K('z'));
    dialog_add_action(editScale);
  }

  if (Math.abs(vp.alpha - 1) > 1e-3 && vpmodel !== mdBall && vpmodel !== mdHyperboloid && vpmodel !== mdHemisphere && vpmodel !== mdDisk) {
    dialog_addBreak(50);
    dialog_addInfo('NOTE: this works \'correctly\' only if the Poincaré model/stereographic projection is used.');
    dialog_addBreak(50);
  }

  if (among(vpmodel, mdDisk, mdBall, mdHyperboloid, mdRotatedHyperboles, mdPanini)) {
    const v = vp.model;
    try {
      if (vpmodel === mdHyperboloid) vp.model = mdDisk;
      add_edit(PC('alpha'));
    }
    finally { vp.model = v; }
  }

  if (models_has_orientation(vpmodel)) {
    dialog_addMatrixItem(XLAT('model orientation'), mori_ref(), K('l'));
    dialog_add_action(() => {
      dialog_editMatrix(mori_ref(), XLAT('model orientation'), '', GDIM());
    });
  }

  if (among(vpmodel, mdPerspective, mdHorocyclic) && nil()) {
    dialog_addMatrixItem(XLAT('model orientation'), mori_ref(), K('l'));
    dialog_add_action(() => {
      dialog_editMatrix(mori_ref(), XLAT('model orientation'), '', GDIM());
    });
    dialog_addSelItem(XLAT('rotational or Heisenberg'), fts(vp.rotational_nil), K('L'));
    dialog_add_action(() => {
      dialog_editNumber(PC('rotational_nil'), 0, 1, 1, 1, XLAT('1 = Heisenberg, 0 = rotational'), '');
    });
  }

  if (GDIM() === 3 && vpmodel !== mdPerspective && !vr_settings) {
    const cliphelp = XLAT(
      'Your view of the 3D model is naturally bounded from four directions by your window. ' +
      'Here, you can also set up similar bounds in the Z direction. Radius of the ball/band ' +
      'models, and the distance from the center to the plane in the halfspace model, are 1.\n\n');
    dialog_addSelItem(XLAT('near clipping plane'), fts(vp.clip_max), K('c'));
    dialog_add_action(() => {
      dialog_editNumber(PC('clip_max'), -10, 10, 0.2, 1, XLAT('near clipping plane'),
        cliphelp + XLAT('Objects with Z coordinate ' +
          'bigger than this parameter are not shown. This is useful with the models which ' +
          'extend infinitely in the Z direction, or if you want things close to your character ' +
          'to be not obscured by things closer to the camera.'));
    });
    dialog_addSelItem(XLAT('far clipping plane'), fts(vp.clip_min), K('C'));
    dialog_add_action(() => {
      dialog_editNumber(PC('clip_min'), -10, 10, 0.2, -1, XLAT('far clipping plane'),
        cliphelp + XLAT('Objects with Z coordinate ' +
          'smaller than this parameter are not shown; it also affects the fog effect' +
          ' (near clipping plane = 0% fog, far clipping plane = 100% fog).'));
    });
  }

  if (vpmodel === mdPolynomial) {
    const pg = G.polygonal;
    dialog_addSelItem(XLAT('coefficient'),
      fts(pg.coefr[pg.coefid]), K('x'));
    dialog_add_action(() => {
      pg.maxcoef = Math.max(pg.maxcoef, pg.coefid);
      const ci = pg.coefid + 1;
      dialog_editNumber(E(pg.coefr, pg.coefid), -10, 10, .01 / ci / ci, 0, XLAT('coefficient'), '');
    });
    dialog_addSelItem(XLAT('coefficient (imaginary)'),
      fts(pg.coefi[pg.coefid]), K('y'));
    dialog_add_action(() => {
      pg.maxcoef = Math.max(pg.maxcoef, pg.coefid);
      const ci = pg.coefid + 1;
      dialog_editNumber(E(pg.coefi, pg.coefid), -10, 10, .01 / ci / ci, 0, XLAT('coefficient (imaginary)'), '');
    });
    dialog_addSelItem(XLAT('which coefficient'), its(pg.coefid), K('n'));
    dialog_add_action(() => {
      dialog_editNumber_n(E(pg, 'coefid'), 0, polygonal_MSI - 1, 1, 0, XLAT('which coefficient'), '');
      dialog_bound_low(0); dialog_bound_up(polygonal_MSI - 1);
    });
  }

  if (vpmodel === mdHalfplane) {
    dialog_addSelItem(XLAT('half-plane scale'), fts(vp.halfplane_scale), K('b'));
    dialog_add_action(() => {
      dialog_editNumber(PC('halfplane_scale'), 0, 2, 0.25, 1, XLAT('half-plane scale'), '');
    });
  }

  if (vpmodel === mdRotatedHyperboles) {
    dialog_addBoolItem_action(XLAT('use atan to make it finite'), PC('use_atan'), K('x'));
  }

  if (among(vpmodel, mdLieOrthogonal, mdLiePerspective)) {
    if (in_s2xe() || (sphere() && GDIM() === 2)) dialog_addInfo(XLAT('this is not a Lie group'), 0xC00000);
    else if (!hyperbolic() && !sol() && !nih() && !nil() && !euclid() && !in_h2xe() && !in_e2xe())
      dialog_addInfo(XLAT('not implemented'));
  }

  if (vpmodel === mdBall && !vr_settings) {
    dialog_addSelItem(XLAT('projection in ball model'), fts(vp.ballproj), K('x'));
    dialog_add_action(() => {
      dialog_editNumber(PC('ballproj'), 0, 100, .1, 0, XLAT('projection in ball model'),
        'This parameter affects the ball model the same way as the projection parameter affects the disk model.');
    });
  }

  if (vpmodel === mdPolygonal) {
    const pg = G.polygonal;
    dialog_addSelItem(XLAT('polygon sides'), its(pg.SI), K('x'));
    dialog_add_action(() => {
      dialog_editNumber_n(E(pg, 'SI'), 3, 10, 1, 4, XLAT('polygon sides'), '');
      dialog_get_di().reaction = polygonal_solve;
    });
    dialog_addSelItem(XLAT('star factor'), fts(pg.STAR), K('y'));
    dialog_add_action(() => {
      dialog_editNumber(E(pg, 'STAR'), -1, 1, .1, 0, XLAT('star factor'), '');
      dialog_get_di().reaction = polygonal_solve;
    });
    dialog_addSelItem(XLAT('degree of the approximation'), its(pg.deg), K('n'));
    dialog_add_action(() => {
      dialog_editNumber_n(E(pg, 'deg'), 2, polygonal_MSI - 1, 1, 2, XLAT('degree of the approximation'), '');
      dialog_get_di().reaction = polygonal_solve;
      dialog_bound_low(0); dialog_bound_up(polygonal_MSI - 1);
    });
  }

  if (models_is_3d(vp) && GDIM() === 2 && !vr_settings)
    add_edit(PC('ptr_ball'));

  // if(vr_settings): the VR model's rotation, shift and scale (no VR)

  if (models_is_hyperboloid(vpmodel))
    add_edit(PC('top_z'));

  if (models_has_transition(vpmodel))
    add_edit(PC('model_transition'));

  if (among(vpmodel, mdJoukowsky, mdJoukowskyInverted, mdSpiral) && GDIM() === 2)
    add_edit(PC('skiprope'));

  if (vpmodel === mdJoukowskyInverted)
    add_edit(PC('dualfocus_autoscale'));

  if (vpmodel === mdHemisphere && euclid())
    add_edit(PC('euclid_to_sphere'));

  if (mdinf[vpmodel].flags & mf.twopoint)
    add_edit(PC('twopoint_param'));

  if (mdinf[vpmodel].flags & mf.axial)
    add_edit(PC('axial_angle'));

  if (vpmodel === mdFisheye)
    add_edit(PC('fisheye_param'));

  if (vpmodel === mdFisheye2) {
    add_edit(PC('fisheye_param'));
    add_edit(PC('fisheye_alpha'));
  }

  if (models_is_hyperboloid(vpmodel))
    add_edit(PC('show_hyperboloid_flat'));

  if (among(vpmodel, mdHyperboloid, mdHemisphere))
    add_edit(PC('small_hyperboloid'));

  if (vpmodel === mdCollignon)
    add_edit(PC('collignon_parameter'));

  if (vpmodel === mdMiller) {
    dialog_addSelItem(XLAT('parameter'), fts(vp.miller_parameter), K('b'));
    dialog_add_action(() => {
      dialog_editNumber(PC('miller_parameter'), -1, 1, .1, 4 / 5., XLAT('parameter'),
        'The Miller projection is obtained by multiplying the latitude by 4/5, using Mercator projection, and then multiplying Y by 5/4. ' +
        'Here you can change this parameter.',
      );
    });
  }

  if (among(vpmodel, mdLoximuthal, mdRetroHammer, mdRetroCraig))
    add_edit(PC('loximuthal_parameter'));

  if (among(vpmodel, mdPolar)) {
    add_edit(PC('offside'));
    add_edit(PC('offside2'));
  }

  if (among(vpmodel, mdAitoff, mdHammer, mdWinkelTripel))
    add_edit(PC('aitoff_parameter'));

  if (vpmodel === mdWinkelTripel)
    add_edit(PC('winkel_parameter'));

  if (vpmodel === mdSpiral && !euclid()) {
    add_edit(PC('spiral_angle'));

    add_edit(
      sphere() ? PC('sphere_spiral_multiplier') :
        G.models_ring_not_spiral ? PC('right_spiral_multiplier') :
          PC('any_spiral_multiplier'),
    );

    add_edit(PC('spiral_cone'));
  }

  if (vpmodel === mdSpiral && euclid()) {
    add_edit(PC('spiral_x'));
    add_edit(PC('spiral_y'));
    // if(euclid && quotient) "match the period" (Euclidean tori: stage 3)
  }

  add_edit(PC('stretch'));

  if (models_product_model(vpmodel))
    add_edit(PC('product_z_scale'));

  // CAP_GL
  dialog_addBoolItem(XLAT('use GPU to compute projections'), G.vid.consider_shader_projection, K('G'));
  const shaderside_projection = (get_shader_flags() & SF_DIRECT) !== 0n;
  if (G.vid.consider_shader_projection && !shaderside_projection)
    dialog_lastItem().value = XLAT('N/A');
  if (G.vid.consider_shader_projection && shaderside_projection && (get_shader_flags() & SF_NONSPATIAL))
    dialog_lastItem().value += XLAT(' (2D only)');
  dialog_add_action(() => { G.vid.consider_shader_projection = !G.vid.consider_shader_projection; });

  menuitem_sightrange(K('R'));

  dialog_addBreak(100);
  dialog_addItem(XLAT('history mode'), K('a'));
  dialog_add_action_push(history_menu_stub);
  // CAP_RUG
  if (GDIM() === 2 || G.rug_rugged) {
    dialog_addItem(XLAT('hypersian rug mode'), K('u'));
    dialog_add_action_push(rug_show_stub);
  }
  dialog_addBack();

  dialog_display();
}

/** history::history_menu (the history mode: stage 3) */
function history_menu_stub(): void { stub_screen_pop(); } // STAGE2-STUB
/** rug::show (the hypersian rug: stage 3) */
function rug_show_stub(): void { stub_screen_pop(); } // STAGE2-STUB
/** shaders.cpp SF_DIRECT, SF_NONSPATIAL (the port has no shaders: get_shader_flags() is 0) */
const SF_DIRECT = 1n << 13n, SF_NONSPATIAL = 1n << 16n;
/** in_e2xe() (product geometries: stage 3) */
function in_e2xe(): boolean { return gproduct() && in_e2xe_product(); }
function in_e2xe_product(): boolean { throw new NotPorted('in_e2xe (product geometries)'); } // STAGE2-STUB

/** the model orientation matrix of pconf.mori() as a reference: get() is v2 in 2D, v3 in 3D */
function mori_ref(): { v: transmatrix } {
  const m = pconf().mori();
  return MDIM() === 3 ? E(m, 'v2') : E(m, 'v3');
}

/** models::rotation (made when first needed: null means the identity of trans23()) */
function models_rotation(): trans23 {
  if (!G.models_rotation) G.models_rotation = new trans23();
  return G.models_rotation;
}

/** EX void quick_model() */
export function models_quick_model(): void {
  G.cmode = sm.CENTER | sm.SIDE | sm.MAYDARK;
  gamescreen();
  dialog_init_t('models & projections');
  const K = (c: string): number => c.charCodeAt(0);
  const p = pconf();

  if (GDIM() === 2 && !euclid()) {
    dialog_addItem(hyperbolic() ? XLAT('Gans model') : XLAT('orthographic projection'), K('1'));
    dialog_add_action(() => { if (G.rug_rugged) rug_close(); p.alpha = 999; p.scale = 998; p.xposition = p.yposition = 0; popScreen(); });
    dialog_addItem(hyperbolic() ? XLAT('Poincaré model') : XLAT('stereographic projection'), K('2'));
    dialog_add_action(() => { if (G.rug_rugged) rug_close(); p.alpha = 1; p.scale = 1; p.xposition = p.yposition = 0; popScreen(); });
    dialog_addItem(hyperbolic() ? XLAT('Beltrami-Klein model') : XLAT('gnomonic projection'), K('3'));
    dialog_add_action(() => { if (G.rug_rugged) rug_close(); p.alpha = 0; p.scale = 1; p.xposition = p.yposition = 0; popScreen(); });
    if (sphere()) {
      dialog_addItem(XLAT('stereographic projection') + ' ' + XLAT('(zoomed out)'), K('4'));
      dialog_add_action(() => { if (G.rug_rugged) rug_close(); p.alpha = 1; p.scale = 0.4; p.xposition = p.yposition = 0; popScreen(); });
    }
    if (hyperbolic()) {
      dialog_addItem(XLAT('Gans model') + ' ' + XLAT('(zoomed out)'), K('4'));
      dialog_add_action(() => { if (G.rug_rugged) rug_close(); p.alpha = 999; p.scale = 499; p.xposition = p.yposition = 0; popScreen(); });
      // CAP_RUG
      dialog_addItem(XLAT('Hypersian Rug'), K('u'));
      dialog_add_action(() => {
        if (G.rug_rugged) pushScreen(rug_show_stub);
        else {
          p.alpha = 1; p.scale = 1;
          // if(!rug::rugged) rug::init(); (the hypersian rug: stage 3; nothing happens) STAGE2-STUB
          popScreen();
        }
      });
    }
  }
  else if (GDIM() === 2 && euclid()) {
    throw new NotPorted('quick_model: Euclidean zoom (stage 3)'); // STAGE2-STUB (other geometries)
  }
  else if (GDIM() === 3) {
    const ysh = WDIM() === 2 ? 'camera' : 'yshift';
    dialog_addItem(XLAT('first-person perspective'), K('1'));
    dialog_add_action(() => { G.vid[ysh] = 0; G.vid.sspeed = 0; popScreen(); });
    dialog_addItem(XLAT('fixed point of view'), K('2'));
    dialog_add_action(() => { G.vid[ysh] = 0; G.vid.sspeed = -10; popScreen(); });
    dialog_addItem(XLAT('third-person perspective'), K('3'));
    dialog_add_action(() => { G.vid[ysh] = 1; G.vid.sspeed = 0; popScreen(); });
  }
  if (WDIM() === 2) {
    dialog_addItem(XLAT('toggle full 3D graphics'), K('f'));
    // geom3::switch_fpp(): the 3D view is stage 3; the item only closes the menu STAGE2-STUB
    dialog_add_action(() => { popScreen(); });
  }
  dialog_addItem(XLAT('advanced projections'), K('a'));
  dialog_add_action_push(models_model_menu);
  menuitem_sightrange(K('r'));
  dialog_addBack();
  dialog_display();
}

/** rug::close() (the hypersian rug: stage 3; never rugged) */
function rug_close(): void { throw new NotPorted('rug::close (stage 3)'); } // STAGE2-STUB

// CAP_COMMANDLINE

/** EX eModel read_model(const string& ss) */
export function models_read_model(ss: string): eModel {
  for (let i = 0; i < isize(mdinf); i++) {
    if (hyperbolic() && appears(mdinf[i].name_hyperbolic, ss)) return i;
    if (euclid() && appears(mdinf[i].name_euclidean, ss)) return i;
    if (sphere() && appears(mdinf[i].name_spherical, ss)) return i;
  }
  for (let i = 0; i < isize(mdinf); i++) {
    if (appears(mdinf[i].name_hyperbolic, ss)) return i;
    if (appears(mdinf[i].name_euclidean, ss)) return i;
    if (appears(mdinf[i].name_spherical, ss)) return i;
  }
  // atoi
  const m = /^\s*([+-]?\d+)/.exec(ss);
  return m ? parseInt(m[1], 10) | 0 : 0;
}

/** int readArgs() (hooks_args, 100) */
function models_readArgs(): number {
  const vp = pconf();
  if (arg_argis('-els')) {
    throw new NotPorted('-els (history::extra_line_steps: the history mode, stage 3)'); // STAGE2-STUB
  }
  else if (arg_argis('-stretch')) {
    if (PHASEFROM(2)) return 2; arg_shift_arg_formula(PC('stretch'));
  }
  else if (arg_argis('-PM')) {
    if (PHASEFROM(2)) return 2; arg_shift(); vp.model = models_read_model(arg_args());
    if (vp.model === mdFormula) {
      arg_shift(); vp.basic_model = arg_argi();
      arg_shift(); vp.formula = arg_args();
    }
  }
  else if (arg_argis('-topz')) {
    if (PHASEFROM(2)) return 2;
    arg_shift_arg_formula(PC('top_z'));
  }
  else if (arg_argis('-twopoint')) {
    if (PHASEFROM(2)) return 2;
    arg_shift_arg_formula(PC('twopoint_param'));
  }
  else if (arg_argis('-hp')) {
    if (PHASEFROM(2)) return 2;
    arg_shift_arg_formula(PC('halfplane_scale'));
  }
  else if (arg_argis('-mets')) {
    if (PHASEFROM(2)) return 2;
    arg_shift_arg_formula(PC('euclid_to_sphere'));
  }
  else if (arg_argis('-mhyp')) {
    if (PHASEFROM(2)) return 2;
    arg_shift_arg_formula(PC('hyperboloid_scaling'));
  }
  else if (arg_argis('-mdepth')) {
    if (PHASEFROM(2)) return 2;
    arg_shift_arg_formula(PC('depth_scaling'));
  }
  else if (arg_argis('-mnil')) {
    if (PHASEFROM(2)) return 2;
    arg_shift_arg_formula(PC('rotational_nil'));
  }
  else if (arg_argis('-clip')) {
    if (PHASEFROM(2)) return 2;
    arg_shift_arg_formula(PC('clip_min'));
    arg_shift_arg_formula(PC('clip_max'));
  }
  else if (arg_argis('-mtrans')) {
    if (PHASEFROM(2)) return 2;
    arg_shift_arg_formula(PC('model_transition'));
  }
  else if (arg_argis('-mparam')) {
    if (PHASEFROM(2)) return 2;
    const pm = vp.model;
    if (pm === mdCollignon) arg_shift_arg_formula(PC('collignon_parameter'));
    else if (pm === mdMiller) arg_shift_arg_formula(PC('miller_parameter'));
    else if (among(pm, mdLoximuthal, mdRetroCraig, mdRetroHammer)) arg_shift_arg_formula(PC('loximuthal_parameter'));
    else if (among(pm, mdAitoff, mdHammer, mdWinkelTripel)) arg_shift_arg_formula(PC('aitoff_parameter'));
    if (pm === mdWinkelTripel) arg_shift_arg_formula(PC('winkel_parameter'));
  }
  else if (arg_argis('-sang')) {
    if (PHASEFROM(2)) return 2;
    arg_shift_arg_formula(PC('spiral_angle'));
    if (sphere())
      arg_shift_arg_formula(PC('sphere_spiral_multiplier'));
    else if (vp.spiral_angle === 90)
      arg_shift_arg_formula(PC('right_spiral_multiplier'));
  }
  else if (arg_argis('-ssm')) {
    if (PHASEFROM(2)) return 2;
    arg_shift_arg_formula(PC('any_spiral_multiplier'));
  }
  else if (arg_argis('-scone')) {
    if (PHASEFROM(2)) return 2;
    arg_shift_arg_formula(PC('spiral_cone'));
  }
  else if (arg_argis('-sxy')) {
    if (PHASEFROM(2)) return 2;
    arg_shift_arg_formula(PC('spiral_x'));
    arg_shift_arg_formula(PC('spiral_y'));
  }
  else if (arg_argis('-mob')) {
    if (PHASEFROM(2)) return 2;
    arg_shift_arg_formula(PC('skiprope'));
  }
  else if (arg_argis('-zoom')) {
    if (PHASEFROM(2)) return 2; arg_shift_arg_formula(PC('scale'));
  }
  else if (arg_argis('-alpha')) {
    if (PHASEFROM(2)) return 2; arg_shift_arg_formula(PC('alpha'));
  }
  else if (arg_argis('-d:model'))
    arg_launch_dialog(models_model_menu);
  else if (arg_argis('-d:formula')) {
    arg_launch_dialog();
    models_edit_formula();
  }
  else if (arg_argis('-d:match')) {
    throw new NotPorted('-d:match (Euclidean tori: stage 3)'); // STAGE2-STUB
  }
  else return 1;
  return 0;
}

/** polygonal::MSI */
export const polygonal_MSI = 120;

/** void add_model_config() (hooks_configfile, 100) */
function add_model_config(): void {
  const pg = G.polygonal;
  param_i(E(pg, 'SI'), 'polygon sides');
  param_f(E(pg, 'STAR'), ['star', 'polygon star factor']);
  param_i(E(pg, 'deg'), 'polygonal degree');

  param_i(E(pg, 'maxcoef'), 'polynomial degree');
  for (let i = 0; i < polygonal_MSI; i++) {
    param_f(E(pg.coefr, i), 'polynomial ' + its(i) + '.real');
    param_f(E(pg.coefi, i), 'polynomial ' + its(i) + '.imag');
  }

  const setrot = (): void => {
    dialog_get_di().dialogflags |= sm.CENTER;
    dialog_addBreak(100);
    dialog_addBoolItem_choice('line animation only', P('models_do_rotate'), 0, 'N'.charCodeAt(0));
    dialog_addBoolItem_choice('gravity lands', P('models_do_rotate'), 1, 'G'.charCodeAt(0));
    dialog_addBoolItem_choice('all directional lands', P('models_do_rotate'), 2, 'D'.charCodeAt(0));
  };

  const rot = models_rotation();
  param_matrix(E(rot, 'v2'), 'rotation', 2).editable('auto rotation', '', 'r'.charCodeAt(0)).set_extra(setrot);
  param_matrix(E(rot, 'v3'), 'rotation3', 3).editable('auto rotation in 3D', '', 'r'.charCodeAt(0)).set_extra(setrot);
  param_i(P('models_do_rotate'), 'auto_rotation_mode', 1);

  param_f(PC('halfplane_scale'), ['hp', 'halfplane scale'], 1);

  const add_all = (p: projection_configuration, pp: string, sp: string): void => {
    const K = (c: string): number => c.charCodeAt(0);
    const F = <Kk extends keyof projection_configuration>(k: Kk): pref_t<projection_configuration[Kk]> => E(p, k);

    const rug = pp !== '';
    const ds = G.auto_restrict;
    // auto_restrict = [&p] { return &vpconf == &p; } (vpconf is pconf: no rug, no VR)
    G.auto_restrict = (): boolean => G.vid.projection_config === p;
    try {
      if (p === G.vid.projection_config) {
        const par = param_custom_int(F('model'), [pp + 'used_model', 'used model'], menuitem_projection, K('1'));
        par.help_text = 'projection|Poincare|Klein|half-plane|perspective';
      }
      else param_enum(F('model'), [pp + 'used_model', sp + 'used model'], mdDisk);

      param_matrix(E(p.mori(), 'v2'), pp + 'mori', 2)
        .editable('model orientation', '', K('o'));
      param_matrix(E(p.mori(), 'v3'), pp + 'mori3', 3)
        .editable('model orientation 3D', '', K('o'));

      param_f(F('top_z'), sp + 'topz', 3)
        .editable(1, 20, .25, 'maximum z coordinate to show', 'maximum z coordinate to show', K('l'));

      param_f(F('model_transition'), [pp + 'mtrans', sp + 'model transition'], 1)
        .editable(0, 1, .1, 'model transition',
          'You can change this parameter for a transition from another model to this one.', K('t'));

      param_f(F('rotational_nil'), sp + 'rotnil', 1);

      param_f(F('clip_min'), [pp + 'clipmin', sp + 'clip-min'], rug ? -100 : -1);
      param_f(F('clip_max'), [pp + 'clipmax', sp + 'clip-max'], rug ? +10 : +1);

      param_f(F('euclid_to_sphere'), [pp + 'ets', sp + 'euclid to sphere projection'], 1.5)
        .editable(1e-1, 10, .1, 'ETS parameter', 'Stereographic projection to a sphere. Choose the radius of the sphere.', K('l'))
        .set_sets(dialog_scaleLog);

      param_f(F('twopoint_param'), [pp + 'twopoint', sp + 'twopoint parameter'], 1)
        .editable(1e-3, 10, .1, 'two-point parameter', 'In two-point-based models, this parameter gives the distance from each of the two points to the center.', K('b'))
        .set_sets(dialog_scaleLog);

      param_f(F('axial_angle'), [pp + 'axial', sp + 'axial angle'], 90)
        .editable(1e-3, 10, .1, 'angle between the axes', 'In two-axe-based models, this parameter gives the angle between the two axes.', K('x'))
        .set_sets(dialog_scaleLog);

      param_f(F('fisheye_param'), [pp + 'fisheye', sp + 'fisheye parameter'], 1)
        .editable(1e-3, 10, .1, 'fisheye parameter', 'Size of the fish eye.', K('b'))
        .set_sets(dialog_scaleLog);

      param_f(F('fisheye_alpha'), [pp + 'fishalpha', sp + 'off-center parameter'], 0)
        .editable(1e-1, 10, .1, 'off-center parameter',
          'This projection is obtained by composing gnomonic projection and inverse stereographic projection. ' +
          'This parameter changes the center of the first projection (0 = gnomonic, 1 = stereographic). Use a value closer to 1 ' +
          'to make the projection more conformal.',
          K('o'));

      param_f(F('stretch'), pp + 'stretch', 1)
        .editable(0, 10, .1, 'vertical stretch', 'Vertical stretch factor.', K('s'))
        .set_extra(stretch_extra);

      param_f(F('product_z_scale'), pp + 'zstretch')
        .editable(0.1, 10, 0.1, 'product Z stretch', '', K('Z'));

      param_f(F('collignon_parameter'), [pp + 'collignon', sp + 'collignon-parameter'], 1)
        .editable(-1, 1, .1, 'Collignon parameter', '', K('b'))
        .modif((f) => {
          f.unit = pconf().collignon_reflected ? ' (r)' : '';
        })
        .set_extra(() => {
          add_edit(F('collignon_reflected'));
        });
      param_b(F('collignon_reflected'), sp + 'collignon-reflect', false)
        .editable('Collignon reflect', K('R'));

      param_f(F('aitoff_parameter'), sp + 'aitoff')
        .editable(-1, 1, .1, 'Aitoff parameter',
          'The Aitoff projection is obtained by multiplying the longitude by 1/2, using azimuthal equidistant projection, and then dividing X by 1/2. ' +
          'Hammer projection is similar but equi-area projection is used instead. ' +
          'Here you can change this parameter.', K('b'));
      param_f(F('offside'), sp + 'offside')
        .editable(0, TAU, TAU / 10, 'offside parameter',
          'Do not center the projection on the player -- move the center offside. Useful in polar, where the value equal to offside2 can be used to center the projection on the player.', K('o'));
      param_f(F('offside2'), sp + 'offside2')
        .editable(0, TAU, TAU / 10, 'offside parameter II',
          'In polar projection, what distance to display in the center. Use asinh(1) (in hyperbolic) to make it conformal in the center, and pi to have the projection extend the same distance to the left, right, and upwards.', K('O'));
      param_f(F('miller_parameter'), sp + 'miller');
      param_f(F('loximuthal_parameter'), sp + 'loximuthal')
        .editable(-90 * degree, 90 * degree, .1, 'loximuthal parameter',
          'Loximuthal is similar to azimuthal equidistant, but based on loxodromes (lines of constant geographic direction) rather than geodesics. ' +
          'The loximuthal projection maps (the shortest) loxodromes to straight lines of the same length, going through the starting point. ' +
          'This setting changes the latitude of the starting point.\n\n' +
          'In retroazimuthal projections, a point is drawn at such a point that the azimuth *from* that point to the chosen central point is correct. ' +
          'For example, if you should move east, the point is drawn to the right. This parameter is the latitude of the central point.' +
          '\n\n(In hyperbolic geometry directions are assigned according to the Lobachevsky coordinates.)', K('b'),
        );
      param_f(F('winkel_parameter'), sp + 'winkel')
        .editable(-1, 1, .1, 'Winkel Tripel mixing',
          'The Winkel Tripel projection is the average of Aitoff projection and equirectangular projection. Here you can change the proportion.', K('B'));

      param_b(F('show_hyperboloid_flat'), sp + 'hyperboloid-flat', true)
        .editable('show flat', K('b'));

      param_b(F('small_hyperboloid'), sp + 'hyperboloid-small', false)
        .editable('halve distances', K('h'))
        .help('This option halves the distances of every point from the center. Useful in the Minkowski hyperboloid model, to get a visualization of an alternative hyperboloid model based on Clifford algebras.');

      param_f(F('skiprope'), sp + 'mobius', 0)
        .editable(0, 360, 15, 'Möbius transformations', '', K('S')).unit = '°';

      param_b(F('dualfocus_autoscale'), sp + 'dualfocus_autoscale', false)
        .editable('autoscale dual focus', K('A'));

      param_str(F('formula'), sp + 'formula');
      param_enum(F('basic_model'), sp + 'basic model');
      param_b(F('use_atan'), sp + 'use_atan');

      param_f(F('spiral_angle'), sp + 'sang')
        .editable(0, 360, 15, 'spiral angle', 'set to 90° for the ring projection', K('x'))
        .unit = '°';
      param_f(F('spiral_x'), sp + 'spiralx')
        .editable(-20, 20, 1, 'spiral period: x', '', K('x'));
      param_f(F('spiral_y'), sp + 'spiraly')
        .editable(-20, 20, 1, 'spiral period: y', '', K('y'));

      param_f(F('scale'), sp + 'scale', 1);
      param_f(F('xposition'), sp + 'xposition', 0);
      param_f(F('yposition'), sp + 'yposition', 0);

      param_i(F('back_and_front'), sp + 'backandfront', 0);

      if (p === G.vid.projection_config) {
        p.alpha = 1;
        const proj = param_custom_ld(F('alpha'), sp + 'projection', menuitem_projection_distance, K('p'));
        proj.help_text = 'projection distance|Gans Klein Poincare orthographic stereographic';
        proj.reaction = () => { update_linked('tc_alpha'); };
      }
      else {
        param_f(F('alpha'), sp + 'projection', 1).editable(0, 1000, 1, 'rug projection', '', K('p'));
      }

      param_matrix(F('ptr_camera'), pp + 'cameraangle', 3)
        .editable(pp + 'camera angle', 'Rotate the camera. Can be used to obtain a first person perspective, ' +
          'or third person perspective when combined with Y shift.', K('S'))
        .set_extra(() => {
          dialog_addBoolItem(XLAT('render behind the camera'), pconf().back_and_front !== 0, K('R'));
          dialog_add_action(() => { pconf().back_and_front = pconf().back_and_front ? 0 : 1; });
        });

      param_matrix(F('ptr_ball'), pp + 'ballangle', 3)
        .editable('camera rotation in 3D models',
          'Rotate the camera in 3D models (ball model, hyperboloid, and hemisphere). ' +
          'Note that hyperboloid and hemisphere models are also available in the ' +
          'Hypersian Rug surfaces menu, but they are rendered differently there -- ' +
          'by making a flat picture first, then mapping it to a surface. ' +
          'This makes the output better in some ways, but 3D effects are lost. ' +
          'Hypersian Rug model also allows more camera freedom.',
          K('b'));

      const help =
        'This parameter has a bit different scale depending on the settings:\n' +
        '(1) in spherical geometry (with spiral angle=90°, 1 produces a stereographic projection)\n' +
        '(2) in hyperbolic geometry, with spiral angle being +90° or -90°\n' +
        '(3) in hyperbolic geometry, with other spiral angles (1 makes the bands fit exactly)';

      param_f(F('sphere_spiral_multiplier'), pp + 'sphere_spiral_multiplier')
        .editable(0, 10, .1, 'sphere spiral multiplier', help, K('M')).unit = '°';

      param_f(F('right_spiral_multiplier'), pp + 'right_spiral_multiplier')
        .editable(0, 10, .1, 'right spiral multiplier', help, K('M')).unit = '°';

      param_f(F('any_spiral_multiplier'), pp + 'any_spiral_multiplier')
        .editable(0, 10, .1, 'any spiral multiplier', help, K('M')).unit = '°';

      param_f(F('spiral_cone'), pp + 'spiral_cone')
        .editable(0, 360, -45, 'spiral cone', '', K('C')).unit = '°';
    }
    finally { G.auto_restrict = ds; }
  };

  add_all(G.vid.projection_config, '', '');
  add_all(G.vid.rug_config, 'rug_', 'rug-');
}
type pref_t<T> = ReturnType<typeof E<T>>;

/** the static initializers of models.cpp: hookArg (hooks_args, 100), hookSet (hooks_configfile, 100) */
export function register_models(): void {
  addHook(G.hooks_args, 100, models_readArgs);
  addHook(G.hooks_configfile, 100, add_model_config);
}
