// geom-exp.cpp of HyperRogue 13.1o: the 'experiments with geometry' menu (stage 3, package G1). (C) Zeno Rogue,
// GPL-2.0-or-later; TypeScript port.
//
// The menus are the original's. Geometries and variations whose packages are not ported yet (PORTING-GEOMETRIES.md:
// Goldberg and the other variations, irregular, Archimedean, binary and aperiodic tilings, crystals, 3D and
// nonisotropic spaces, product spaces, fake curvature, tessellation files) are listed as in the original, but
// choosing one shows the message "not available in this version yet" and keeps the current game (a deviation,
// README.md): `geometry_ported` / `variation_ported` decide that.
import { NotPorted, among, isize, gcd } from './hyper.ts';
import { stub_screen_pop, pushScreen } from './control.ts';
import { G, pconf } from './globals.ts';
import { XLAT, XLAT1, shapename_available, shapename } from './language.ts';
import { fts, its } from './hprint.ts';
import {
  hyperbolic, sphere, euclid, elliptic, mdDisk, mdPanini, ginf, IRREGULAR, PURE, BITRUNCATED, GOLDBERG, INVERSE,
  UNRECTIFIED, UNTRUNCATED, WARPED, GOLDBERG_INV, S3, S7, S6, WDIM, a4, quotient, closed_manifold, nonorientable,
  cgflags, qOPTQ, qDEPRECATED, qANYQ, qFRACTAL, qULTRA, mproduct, mtwisted, mhybrid, nonisotropic, aperiodic, cryst,
  sol, nil, elliptic as _elliptic, eVariation, gNormal, gEuclid, gFieldQuotient, gCrystal, gArchimedean, gArbitrary,
  gProduct, gTwistedProduct, gFake, gCubeTiling, gMinimal, gZebraQuotient, gBolza, gKleinQuartic, gSchmutzM2,
  gBolza2, gSchmutzM3, gBring, gMacbeath, gSeifertWeber, gHomologySphere, gSeifertCover, gArnoldCat, gBinaryTiling,
  gBinary4, gTernary, gcHyperbolic, gcEuclid, gcSphere, gcSol, gcNIH, gcSolN, gcNil, gcSL2, gcProduct, qAFFINE,
  closed_or_bounded, embedded_plane, gNil,
} from './classes.ts';
import { standard_tiling } from './cell.ts';
import { sn_in } from './nonisotropic.ts';
import { models_get_model_name, models_model_menu } from './models.ts';
import { gp_operation_name, gp_configure, gp_whirl_set } from './goldberg.ts';
import { cgi } from './geometry.ts';
import {
  dialog_addSelItem, dialog_add_action, dialog_add_action_push, dialog_editNumber, dialog_init_t, dialog_addBoolItem,
  dialog_addItem, dialog_addBreak, dialog_addInfo, dialog_addHelp, dialog_addHelp_s, dialog_addBack, dialog_display,
  dialog_addTitle, dialog_lastItem, dialog_start_list, dialog_end_list, dialog_handleNavigation, dialog_editInfix,
  dialog_hasInfix, dialog_do_if_confirmed, dialog_add_action_confirmed, dialog_cheat_if_confirmed, ONOFF, dialog_init,
} from './dialogs.ts';
import { gamescreen, popScreen } from './graph.ts';
import { sm } from './graph.ts';
import { doexiton } from './control.ts';
import { set_geometry, set_variation, stop_game, start_game, stop_game_and_switch_mode, rg_nothing, rg_tactic } from './system.ts';
import { addMessage } from './basegraph.ts';
import {
  land_validity, generateLandList, treasureType, getLandForList, lv_appears_in_geom_exp, lv_display_error_message,
  lv_switch_to_single, lsSingle, lsNiceWalls, lsNoWalls,
} from './landlock.ts';
import { hiitemsMax } from './yendor.ts';
import { linf, landtypes, laCrossroads, laCrossroads2, laCrossroads4, laIce, laHunting, laMirrorOld, laPrincessQuest,
  laWildWest, laHalloween, laWarpCoast, laGraveyard, laDual, laDocks, laSnakeNest, laRedRock, laCamelot, laCA,
  laAsteroids, laCanvas, laMinefield, type eLand } from './content.ts';
import { dual_may_split_or_do, dual_mayboth } from './multigame.ts';
import { menuitem_land_structure } from './menus.ts';
import { add_edit, P } from './config.ts';
import { show3D } from './config.ts';
import { geometry_has_alt_mine_rule } from './cell.ts';
import { enable_viewdists, viewdist_configure_dialog } from './expansion.ts';
import { shot_menu } from './screenshot.ts';
import { bt_in } from './binary-tiling.ts';
import { arcm_in } from './archimedean.ts';
import { arb_in } from './arbitrile.ts';
import { reg3_in } from './reg3.ts';
import { kite_in } from './kite.ts';
import { fake_in } from './fake.ts';
import { euc_in, euc_state, euc_prepare_torus3, euc_show_torus3 } from './euclid.ts';
import {
  fieldpattern_fgeomextras, fieldpattern_nextPrime, fieldpattern_nextPrimes, fieldpattern_enableFieldChange,
  fieldpattern_getcurrfp,
} from './fieldpattern.ts';
import { lie_movement_available } from './hypgraph.ts';

void _elliptic;

let eupage = 0;
// int euperpage = 9;

export const euchelp =
  "If you want to know how much the gameplay is affected by the " +
  "hyperbolic geometry in HyperRogue, this mode is for you!\n\n" +

  "You can try many different geometries here. We start by gluing " +
  "n-gons in such a way that k of them meet in every vertex. " +
  "Depending on n and k, this either folds into a sphere, unfolds into a plane, " +
  "or requires a hyperbolic space. The result may be then 'bitruncated' by " +
  "replacing each vertex by a 2k-gon. Furthermore, you can play " +
  "with quotient geometries. For example, the elliptic geometry is " +
  "obtained from the sphere by making the antipodes be the same point, " +
  "so you return to the same spot (but as a mirror image) after going there. " +
  "Have fun experimenting! " +
  "Achievements and leaderboards do not work in geometry experiments, " +
  "except some specific ones.\n\n" +
  "In standard geometry (bitruncated or not), you can play the full game, but in other geometries " +
  "you select a particular land. Lands are unlocked by visiting them in this " +
  "session, or permanently by collecting 25 treasure. Try Crossroads in Euclidean " +
  "or chaos mode in non-standard non-quotient hyperbolic to visit many lands. " +
  "Highlights:\n" +
  "* Crystal World and Warped Coast can be understood as extra geometries.\n" +
  "* Halloween is specially designed for spherical geometry.\n" +
  "* To see the difference, try Hunting Grounds in Euclidean -- it is impossible.\n";

const ch = (c: string): number => c.charCodeAt(0);

// --- what this port has (a deviation while packages are missing) ---

/** true if the port has the geometry g (with a 2D standard tiling: Euclidean, spherical, hyperbolic, the
 *  quotient spaces) */
export function geometry_ported(g: number): boolean {
  const gi = ginf[g];
  if (gi.g.gameplay_dimension !== 2) return false;
  if (among(g, gArchimedean, gArbitrary, gProduct, gTwistedProduct, gFake, gCrystal, gBinaryTiling, gBinary4, gTernary))
    return false;
  if ((gi.flags & qDEPRECATED) !== 0n) return false;
  const k = gi.g.kind;
  if (!among(k, gcHyperbolic, gcEuclid, gcSphere)) return false;
  // aperiodic tilings (kite-and-dart, hat), fractals, the {3,oo}-like tilings, binary tilings: other packages
  if (gi.vertex >= 123 /* OINF */) return false;
  const old = G.geometry;
  G.geometry = g;
  try {
    if (aperiodic() || (cgflags() & qFRACTAL) !== 0n || bt_in() || kite_in()) return false;
  }
  finally { G.geometry = old; }
  return true;
}

/** true if the port has the variation v (pure, bitruncated, Goldberg and the inverse variations; not irregular) */
export function variation_ported(v: number): boolean {
  return v === eVariation.pure || v === eVariation.bitruncated || v === eVariation.goldberg || v === eVariation.unrectified ||
    v === eVariation.untruncated || v === eVariation.warped;
}

function not_available(): void {
  addMessage(XLAT('not available in this version yet'));
}

// --- showQuotientConfig (CAP_FIELD) ---

function showQuotientConfig(): void {
  G.cmode = sm.SIDE | sm.MAYDARK;
  gamescreen();
  dialog_init_t(XLAT('field quotient'));
  const fgeomextras = fieldpattern_fgeomextras();
  const gxcur = fgeomextras[G.fieldpattern_current_extra];
  for (let i = 0; i < isize(fgeomextras); i++) {
    const g = fgeomextras[i];
    dialog_addBoolItem(ginf[g.base].tiling_name, g.base === gxcur.base, ch('a') + i);
    dialog_add_action(() => { G.fieldpattern_current_extra = i; });
  }

  dialog_addBreak(100);

  fieldpattern_nextPrimes(gxcur);
  const stars = ['', '*', '**'];
  for (let i = 0; i < isize(gxcur.primes); i++) {
    const p = gxcur.primes[i];

    const sides = ginf[gxcur.base].sides;
    const sa = shapename_available(sides);
    let s = sa ? 'order %1%2 (%3 %4s)' : 'order %1%2 (%3 %4-gons)';

    s = XLAT(s, its(p.p), p.squared ? '²' : '', its(p.cells), sa ? shapename(sides) : its(sides));

    s += stars[gxcur.dualval[i]];

    dialog_addBoolItem(s, i === gxcur.current_prime_id, ch('A') + i);
    dialog_add_action(() => { gxcur.current_prime_id = i; });
  }

  if (isize(gxcur.primes) <= 6) {
    dialog_addBreak(100);
    dialog_addHelp_s(
      "This geometry is obtained by applying the same 'generators' which " +
      'lead to creating the given basic hyperbolic geometry, ' +
      'but using a fixed finite field instead of the field of reals. ' +
      'It can be also interpreted as a quotient of the given basic geometry. ' +
      'Warning: field patterns based on large primes might generate for a long time.',
    );
    dialog_addBreak(100);
  }

  dialog_addItem('find the next prime', ch('p'));
  dialog_add_action(() => { fieldpattern_nextPrime(gxcur); });

  dialog_addItem('activate', ch('x'));
  dialog_add_action_confirmed(() => {
    set_geometry(gxcur.base);
    fieldpattern_enableFieldChange();
    set_geometry(gFieldQuotient);
    start_game();
  });

  dialog_addItem('find alternate manifolds', ch('y'));
  dialog_add_action_confirmed(() => {
    set_geometry(gxcur.base);
    G.fieldpattern_triplet_id = 0;
    fieldpattern_enableFieldChange();
    set_geometry(gFieldQuotient);
    start_game();

    const cfp = fieldpattern_getcurrfp();
    const triplets = cfp.find_triplets();
    pushScreen(() => {
      G.cmode = sm.SIDE | sm.MAYDARK;
      gamescreen();
      dialog_init_t(XLAT('alternate manifolds'));
      let id = 0;
      for (const t of triplets) {
        dialog_addItem(XLAT('generators (%1,%2), size %3', its(t.i), its(t.j), its(Math.trunc(t.size / S7()))), ch('a') + id);
        const myid = id;
        dialog_add_action(() => {
          stop_game();
          G.fieldpattern_triplet_id = myid;
          fieldpattern_enableFieldChange();
          start_game();
        });
        id++;
      }
      dialog_addBreak(100);
      dialog_addHelp_s(XLAT(
        'This option finds alternate solutions. For example, there are three {7,3} manifolds with 156 heptagons each ("first Hurwitz triplet").'),
      );
      dialog_display();
    });
  });

  dialog_addItem('default', ch('z'));
  dialog_add_action_confirmed(() => {
    set_geometry(gEuclid);
    G.fieldpattern_quotient_field_changed = false;
    set_geometry(gFieldQuotient);
    start_game();
  });

  dialog_addBack();
  dialog_display();
}

export const bitruncnames = [' (b)', ' (n)', ' (g)', ' (i)', ' (d)'];

function validity_info(): void {
  const vccolors = [0xFF0000, 0xFF8000, 0xFFFF00, 0x00FF00];
  const lv = land_validity(G.specialland);
  if (lv.flags & lv_display_error_message)
    dialog_addInfo(XLAT(lv.msg), vccolors[lv.quality_level]);
  else
    dialog_addBreak(100);
}

// EX bool showquotients: G.showquotients (unused by the menus)

const validclasses = [' (X)', ' (½)', '', ' (!)'];

export function gen_landvisited(): void {
  const lv = G.landvisited;
  if (G.cheater) for (let i = 0; i < landtypes; i++) lv[i] = true;

  for (let i = 0; i < landtypes; i++)
    if (hiitemsMax(treasureType(i)) >= 25) lv[i] = true;
  lv[laCrossroads] = true;
  lv[laCrossroads4] = true;
  lv[laIce] = true;
  lv[laHunting] = true;
  lv[laMirrorOld] = true;
  lv[laPrincessQuest] = !!G.cheater || G.princess_everSaved;
  lv[laWildWest] = true;
  lv[laHalloween] = true;
  lv[laWarpCoast] = true;
  lv[laGraveyard] = true;
  lv[laDual] = true;
  lv[laDocks] ||= lv[laWarpCoast];
  lv[laSnakeNest] ||= lv[laRedRock];
  lv[laCamelot] ||= hiitemsMax(treasureType(laCamelot)) >= 1;
  lv[laCA] = true;
  lv[laAsteroids] = true;
}

export function ge_land_selection(): void {
  G.cmode = sm.SIDE | sm.MAYDARK;
  gamescreen();

  gen_landvisited();

  dialog_init_t(XLAT('select the starting land'));
  if (G.dialog_infix !== '') G.mouseovers = G.dialog_infix;

  generateLandList((l: eLand) => {
    if (G.dialog_infix !== '' && !dialog_hasInfix(linf[l].name)) return false;
    return !!(land_validity(l).flags & lv_appears_in_geom_exp);
  });
  // stable_sort by quality_level, descending (Array.prototype.sort is stable)
  G.landlist.sort((l1, l2) => land_validity(l2).quality_level - land_validity(l1).quality_level);

  dialog_start_list(900, 900, ch('1'));

  for (const l of G.landlist) {

    const s = XLAT1(linf[l].name);

    if (G.landvisited[l] || G.unlock_all) {
      dialog_addBoolItem(s, l === G.specialland, G.dialog_list_fake_key++);
    }
    else {
      dialog_addSelItem(s, XLAT('(locked)'), G.dialog_list_fake_key++);
    }

    dialog_lastItem().color = linf[l].color;
    dialog_lastItem().value += validclasses[land_validity(l).quality_level];
    dialog_add_action(() => {
      if (G.landvisited[l] || G.unlock_all) dialog_do_if_confirmed(dual_mayboth(() => {
        stop_game_and_switch_mode(G.tactic_on ? rg_tactic : rg_nothing);
        G.firstland = G.specialland = l;
        if (l === laCanvas || l === laAsteroids || (land_validity(l).flags & lv_switch_to_single))
          G.land_structure = lsSingle;
        else if (among(l, laCrossroads, laCrossroads2))
          G.land_structure = lsNiceWalls;
        else if (among(l, laCrossroads4))
          G.land_structure = lsNoWalls;
        start_game();
        popScreen();
      }));
    });
  }
  dialog_end_list();

  dialog_addBreak(25);
  validity_info();
  dialog_addBreak(25);

  dialog_addInfo(XLAT('press letters to search'));
  // dual::add_choice(): only in the dual mode (multigame.cpp, a later package)
  if (G.dual_state) throw new NotPorted('ge_land_selection: dual::add_choice'); // STAGE3-STUB
  dialog_addBack();
  dialog_display();

  G.keyhandler = (sym: number, uni: number) => {
    const k = { sym, uni };
    dialog_handleNavigation(k);
    sym = k.sym; uni = k.uni;

    if (dialog_editInfix(sym, uni)) G.dialog_list_skip = 0;
    else if (doexiton(sym, uni)) popScreen();
  };
}

export function activate_ge_land_selection(): void {
  G.dialog_infix = '';
  eupage = 0;
  void eupage;
  pushScreen(ge_land_selection);
}

/** struct geometry_filter */
export interface geometry_filter {
  name: string;
  hotkey: number;
  /** test if the current geometry matches the filter */
  test: () => boolean;
}

let current_filter: geometry_filter | null = null;

function forced_quotient(): boolean { return quotient() && !((cgflags() & qOPTQ) !== 0n); }

export const gf_hyperbolic: geometry_filter = { name: 'hyperbolic', hotkey: ch('h'), test: () => (arcm_in() || arb_in() || hyperbolic()) && !forced_quotient() };
export const gf_spherical: geometry_filter = { name: 'spherical', hotkey: ch('s'), test: () => (arcm_in() || arb_in() || sphere()) && !forced_quotient() };
export const gf_euclidean: geometry_filter = { name: 'Euclidean', hotkey: ch('e'), test: () => (arcm_in() || arb_in() || euclid()) && !forced_quotient() };
export const gf_other: geometry_filter = { name: 'non-isotropic', hotkey: ch('n'), test: () => mproduct() || mtwisted() || nonisotropic() };
export const gf_regular_2d: geometry_filter = { name: 'regular 2D tesselations', hotkey: ch('r'), test: () =>
  standard_tiling() && WDIM() === 2 && !forced_quotient(),
};
export const gf_regular_3d: geometry_filter = { name: 'regular 3D honeycombs', hotkey: ch('3'), test: () => {
  if (euclid()) return G.geometry === gCubeTiling;
  return !bt_in() && !kite_in() && WDIM() === 3 && !forced_quotient() && !nonisotropic() && !mproduct();
} };
export const gf_quotient: geometry_filter = { name: 'interesting quotient spaces', hotkey: ch('q'), test: () =>
  forced_quotient() && !elliptic(),
};
export const gf_tes_file: geometry_filter = { name: 'load from file', hotkey: ch('f'), test: () => arb_in() };
export const gf_no_filters: geometry_filter = { name: 'no filters', hotkey: ch('-'), test: () => true };

export const available_filters: geometry_filter[] = [gf_hyperbolic, gf_spherical, gf_euclidean, gf_other, gf_regular_2d, gf_regular_3d, gf_quotient, gf_tes_file, gf_no_filters];

function ge_select_filter(): void {
  G.cmode = sm.SIDE | sm.MAYDARK;
  gamescreen();

  dialog_init_t(XLAT('geometries'));

  for (const f of available_filters) {
    if (current_filter)
      dialog_addBoolItem(XLAT(f.name), f === current_filter, f.hotkey);
    else
      dialog_addItem(XLAT(f.name), f.hotkey);
    dialog_add_action(() => { current_filter = f; popScreen(); });
  }

  dialog_addBack();
  dialog_display();
}

function set_default_filter(): void {
  current_filter = hyperbolic() ? gf_hyperbolic : euclid() ? gf_euclidean : sphere() ? gf_spherical : gf_other;
  for (const f of available_filters) if (f.test()) current_filter = f;
}

function set_or_configure_geometry(g: number): void {
  // stage 3 deviation: the geometries of packages not ported yet
  if (!geometry_ported(g) && g !== gFieldQuotient) { not_available(); return; }
  if (g === gCrystal)
    throw new NotPorted('crystal::show'); // CAP_CRYSTAL
  else if (g === gArchimedean)
    throw new NotPorted('arcm::show'); // CAP_ARCM
  else if (g === gArbitrary)
    throw new NotPorted('arb::choose');
  else {
    const quo = false;
    if (among(g, gProduct, gTwistedProduct)) {
      throw new NotPorted('set_or_configure_geometry: product spaces'); // (the 3D package)
    }
    dual_may_split_or_do(() => {
      set_geometry(g);
      if (quo) throw new NotPorted('hybrid::fixup_csteps');
    });
    start_game();
  }
}

/** is g2 the same tiling as the current geometry (geometry)? */
function same_tiling(g2: number): boolean {
  /* no quotients for fractals */
  if ((cgflags() & qFRACTAL) !== 0n) return g2 === G.geometry;
  if (g2 === gCrystal)
    return S3() === 4;
  if (g2 === gFieldQuotient && (hyperbolic() || (G.geometry === gCubeTiling && /* reg3::cubes_reg3 */ false)) && standard_tiling())
    return true;
  if (g2 === gFieldQuotient && G.geometry !== gFieldQuotient) {
    let ce = 0;
    for (const ge of fieldpattern_fgeomextras()) {
      if (ginf[ge.base].tiling_name === ginf[G.geometry].tiling_name) {
        G.fieldpattern_current_extra = ce;
        return true;
      }
      ce++;
    }
  }
  return ginf[g2].tiling_name === ginf[G.geometry].tiling_name;
}

function ge_select_tiling(): void {
  if (current_filter === gf_tes_file) { popScreen(); set_or_configure_geometry(gArbitrary); }
  G.cmode = sm.SIDE | sm.MAYDARK;
  gamescreen();

  if (!current_filter) { popScreen(); return; }
  dialog_init();
  dialog_addItem(XLAT(current_filter.name), ch('x'));
  dialog_add_action_push(ge_select_filter);

  dialog_addBreak(100);

  dialog_start_list(500, 1500, ch('a'));

  const save = G.geometry;
  for (let i = 0; i < isize(ginf); i++) {
    let g = i;
    if (among(g, gProduct, gTwistedProduct)) {
      // hybrid::configure(g): sets up the product of the current geometry (the 3D package); the entry is listed
      // without it (choosing it says "not available")
    }
    const orig_el = elliptic();
    const on = G.geometry === g;
    const in_2d = WDIM() === 2;
    G.geometry = g; // dynamicval<eGeometry> cg(geometry, g)
    try {
      if ((cgflags() & qDEPRECATED) !== 0n) continue;
      // CAP_ARCM, CAP_CRYSTAL, CAP_SOLV are on; arb::in() && (ISMOBILE || ISWEB): the desktop build lists it
      if (G.geometry === gFake) continue;
      if (!current_filter.test()) continue;
      if (orig_el) {
        for (let j = 0; j < isize(ginf); j++)
          if (ginf[j].tiling_name === ginf[i].tiling_name)
            G.geometry = g = j;
      }

      const is_product = (G.geometry === gProduct && in_2d);
      const is_twisted = (G.geometry === gTwistedProduct && in_2d);
      dialog_addBoolItem(
        is_product ? XLAT('current geometry x E') :
          is_twisted ? XLAT('twisted current x E') :
            XLAT(ginf[g].menu_displayed_name), on, G.dialog_list_fake_key++);
      dialog_lastItem().value += validclasses[land_validity(G.specialland).quality_level];
      const gg = g;
      dialog_add_action(() => { set_or_configure_geometry(gg); });
    }
    finally { G.geometry = save; }
  }

  dialog_end_list();
  dialog_addBreak(100);
  if (G.dual_state) throw new NotPorted('ge_select_tiling: dual::add_choice'); // STAGE3-STUB
  dialog_addBack();
  dialog_display();
}

/** EX string current_proj_name() */
export function current_proj_name(): string {
  const h = hyperbolic() || sn_in();
  const vp = pconf();
  if (vp.model === mdPanini && vp.alpha === 1)
    return XLAT('stereographic Panini');
  else if (vp.model !== mdDisk)
    return models_get_model_name(vp.model);
  else if (h && vp.alpha === 1)
    return XLAT('Poincaré model');
  else if (h && vp.alpha === 0)
    return XLAT('Klein-Beltrami model');
  else if (h && vp.alpha === -1)
    return XLAT('inverted Poincaré model');
  else if (sphere() && vp.alpha === 1)
    return XLAT('stereographic projection');
  else if (sphere() && vp.alpha === 0)
    return XLAT('gnomonic projection');
  else if (sphere() && vp.alpha >= 999)
    return XLAT('orthographic projection');
  else if (h && vp.alpha >= 999)
    return XLAT('Gans model');
  else
    return XLAT('general perspective');
}

export function dim_name(): string {
  return ' (' + its(WDIM()) + 'D)';
}

export function is_highly_symmetric(g: number): boolean {
  if (among(g, gFieldQuotient, gBolza, gKleinQuartic, gBolza2, gMacbeath, gSeifertWeber, gHomologySphere, gSeifertCover)) return true;
  if (quotient() && among(g, gArnoldCat, gNil)) return true;
  if (mhybrid()) throw new NotPorted('is_highly_symmetric: hybrid'); // PIU(...)
  return false;
}

/** EX string geometry_name(eGeometryClass gc) */
export function geometry_name_gc(gc: number): string {
  switch (gc) {
    case gcHyperbolic:
      return XLAT('hyperbolic');

    case gcEuclid:
      if ((cgflags() & qAFFINE) !== 0n)
        return XLAT('affine');
      return XLAT('flat');

    case gcSphere:
      return XLAT('spherical');

    case gcSol:
      return XLAT('Sol');

    case gcNIH:
      return XLAT('hyperbolic (3:2)');

    case gcSolN:
      return XLAT('Sol (3:2)');

    case gcNil:
      return XLAT('Nil');

    case gcSL2:
      return XLAT('~SL(2,R)~');

    case gcProduct:
      throw new NotPorted('geometry_name: product (PIU)'); // the 3D package
  }
  return '?';
}

/** EX string geometry_name() */
export function geometry_name(): string {
  if (embedded_plane()) throw new NotPorted('geometry_name: embedded plane'); // the 3D package
  else if (among(ginf[G.geometry].g.kind, gcHyperbolic, gcEuclid, gcSphere))
    return geometry_name_gc(ginf[G.geometry].g.kind) + dim_name();
  else
    return geometry_name_gc(ginf[G.geometry].g.kind);
}

function select_quotient_screen(): void {
  G.cmode = sm.SIDE | sm.MAYDARK;
  gamescreen();

  dialog_init_t(XLAT('quotient spaces in ') + ginf[G.geometry].tiling_name);
  let key = ch('a');
  for (let i = 0; i < isize(ginf); i++) {
    const g = i;
    if ((ginf[g].flags & qDEPRECATED) !== 0n) continue;
    if (same_tiling(g)) {
      dialog_addBoolItem(
        (ginf[g].flags & qANYQ) !== 0n ?
          XLAT(ginf[g].menu_displayed_name) :
          'no quotient',
        g === G.geometry, key++);
      dialog_add_action(() => {
        if (g === gFieldQuotient && WDIM() === 3) {
          throw new NotPorted('select_quotient_screen: 3D field quotients'); // the 3D package
        }
        else if (g === gFieldQuotient)
          pushScreen(showQuotientConfig);
        else if (g === gCrystal)
          not_available(); // crystal::show (CAP_CRYSTAL; deviation)
        else if (!geometry_ported(g))
          not_available();
        else {
          dual_may_split_or_do(() => { set_geometry(g); });
          start_game();
        }
      });
    }
  }

  dialog_addBack();
  dialog_display();
}

export function select_quotient(): void {
  if (euclid() && !embedded_plane() && !aperiodic() && !arcm_in() && !(cgflags() & qFRACTAL) && !arb_in()) {
    euc_prepare_torus3();
    pushScreen(euc_show_torus3);
  }
  else if (nil() && !mhybrid() || sol() || mproduct() || mtwisted() || arb_in()) {
    // nilv::show_niltorus3, asonov::show_config, product::show_config, hybrid::configure_period,
    // arbiquotient::show_dialog: other packages
    not_available();
  }
  else {
    const choices: number[] = [];
    for (let i = 0; i < isize(ginf); i++) if (same_tiling(i)) choices.push(i);

    // println(hlog, "choices = ", choices);

    if (isize(choices) > 1)
      pushScreen(select_quotient_screen);
    else
      addMessage('No quotient spaces available in the current tiling.');
  }
}

/** EX string full_geometry_name() */
export function full_geometry_name(): string {
  const qstring = ginf[G.geometry].quotient_name;
  const variable =
    !(mproduct() || mhybrid() || bt_in() || (WDIM() === 3 && !reg3_in()) || aperiodic() || arb_in());

  let fgname = XLAT(ginf[G.geometry].tiling_name);
  if (qstring !== 'none') fgname += ' ' + XLAT(qstring);
  // CAP_ARCM
  if (arcm_in()) throw new NotPorted('full_geometry_name: arcm::current.symbol');
  if (variable) fgname = gp_operation_name() + ' ' + fgname;
  return fgname;
}

function action_change_variation(): void {
  if (arcm_in()) throw new NotPorted('arcm::next_variation'); // CAP_ARCM
  else if (reg3_in() || G.geometry === gCubeTiling) throw new NotPorted('reg3::configure_variation'); // MAXMDIM >= 4
  else if (euc_in(2, 4)) dialog_do_if_confirmed(() => {
    set_variation(PURE() ? eVariation.bitruncated : eVariation.pure);
    start_game();
  });
  // CAP_GP
  else // if(S3 == 3)
    gp_configure();
}

export function menuitem_change_variation(key: number): void {
  dialog_addSelItem(XLAT('variations'), gp_operation_name(), key);
  dialog_add_action(action_change_variation);
}

export function menuitem_change_geometry(key: number): void {
  dialog_addSelItem(XLAT('geometry/topology/tiling'), full_geometry_name(), key);
  dialog_add_action_push(current_filter ? ge_select_tiling : ge_select_filter);
}

/** EX void menuitem_projection(key_type key) */
export function menuitem_projection(key: number): void {
  dialog_addSelItem(XLAT('projection'), current_proj_name(), key);
  dialog_add_action_push(models_model_menu);
}

/** EX void menuitem_binary_width(key_type key) (the reaction is for textures and Asonov: other packages) */
export function menuitem_binary_width(key: number): void {
  dialog_addSelItem(XLAT('binary tiling width'), fts(G.vid.binary_width), key);
  dialog_add_action(() => {
    const v = G.vid;
    dialog_editNumber({ get v() { return v.binary_width; }, set v(x: number) { v.binary_width = x; } }, 0, 2, 0.1, 1, XLAT('binary tiling width'), '');
    // dialog::get_ne().reaction: texture::config.remap(), asonov::prepare() (other packages)
  });
}

/** struct geometry_data */
export interface geometry_data {
  ts: number; tv: number; nom: number; denom: number; euler: number; demigenus: number; worldsize: number;
  area: number;
  spf: string;
  size_str: string;
}

const UNKNOWN = 65535; // hyper.h: #define UNKNOWN 65535

export function compute_geometry_data(): geometry_data {
  const gd: geometry_data = { ts: 0, tv: 0, nom: 0, denom: 0, euler: 0, demigenus: 0, worldsize: 0, area: 0, spf: '', size_str: '' };
  gd.ts = ginf[G.geometry].sides;
  gd.tv = ginf[G.geometry].vertex;
  const ts = gd.ts, tv = gd.tv;
  gd.nom = (BITRUNCATED() ? tv + ts : tv) * 4;
  gd.denom = (2 * ts + 2 * tv - ts * tv);

  // CAP_GP
  if (GOLDBERG() || INVERSE()) {
    if (mhybrid()) throw new NotPorted('compute_geometry_data: hybrid (PIU)');
    gd.area = cgi().gpdata!.area;

    if (GOLDBERG() || WARPED()) {
      gd.nom = 2 * (2 * tv + (S3() - 2) * ts * (gd.area - 1));
    }
    else if (UNRECTIFIED()) {
      if ((G.gp_param[0] + G.gp_param[1]) % 2 === 0)
        gd.nom = ts * 2 * gd.area;
      else
        gd.nom = (2 * tv + (S3() - 2) * ts * (gd.area - 1));
    }
    else if (UNTRUNCATED()) {
      if ((G.gp_param[0] - G.gp_param[1]) % 3 === 0) {
        gd.nom = ts * 4 * gd.area;
        gd.denom *= 3;
      }
      else {
        gd.nom = 2 * (2 * tv + (S3() - 2) * ts * (gd.area - 1));
        gd.denom *= 3;
      }
    }
  }
  else
    gd.area = PURE() ? 1 : 3;

  gd.euler = 0;
  if (euclid()) gd.euler = 0;
  else if (sphere() && nonorientable()) gd.euler = 1;
  else if (sphere()) gd.euler = 2;
  else if (!closed_manifold()) gd.euler = -2;
  else if (WDIM() === 3) gd.euler = 0;
  else switch (G.geometry) {
    case gFieldQuotient:
      gd.worldsize = isize(G.currentmap.allcells());
      gd.euler = Math.trunc(2 * gd.worldsize * gd.denom / gd.nom);
      break;

    case gMinimal:
      gd.euler = -1;
      break;

    case gZebraQuotient:
    case gBolza:
      gd.euler = -2;
      break;

    case gKleinQuartic:
    case gSchmutzM2:
    case gBolza2:
      gd.euler = -4;
      break;

    case gSchmutzM3:
    case gBring:
      gd.euler = -6;
      break;

    case gMacbeath:
      gd.euler = -12;
      break;

    case gArbitrary:
      gd.worldsize = isize(G.currentmap.allcells());
      gd.euler = UNKNOWN;
      break;

    default:
      gd.worldsize = isize(G.currentmap.allcells());
      // println(hlog, "warning: Euler characteristics unknown, worldsize = ", gd.worldsize);
      gd.euler = Math.trunc(2 * gd.worldsize * gd.denom / gd.nom);
      break;
  }

  gd.nom = Math.imul(gd.nom, gd.euler);
  gd.denom *= 2;

  if (mhybrid()) throw new NotPorted('compute_geometry_data: hybrid');

  const g = gcd(gd.nom, gd.denom);
  if (g) {
    gd.nom = Math.trunc(gd.nom / g);
    gd.denom = Math.trunc(gd.denom / g);
  }

  if (euclid() && closed_manifold()) {
    gd.worldsize = euc_state.eu.det;
    if (BITRUNCATED()) gd.worldsize *= (a4() ? 2 : 3);
    if (GOLDBERG()) gd.worldsize *= cgi().gpdata!.area;
    // IRREGULAR: *= isize(irr::cells) / isize(irr::cells_of_heptagon) (a later package)
  }
  else
    gd.worldsize = gd.denom ? Math.trunc(gd.nom / gd.denom) : 0;

  if (gd.euler < 0 && !closed_manifold())
    gd.worldsize = -gd.worldsize;

  if (arb_in()) gd.worldsize = isize(G.currentmap.allcells());

  let spf = its(ts);
  if (arcm_in()) throw new NotPorted('compute_geometry_data: arcm');
  // CAP_BT
  else if (bt_in()) switch (G.geometry) {
    case gBinaryTiling: spf = '6,[6,7],7'; break;
    case gBinary4: spf = '5,5,5[,5]'; break;
    case gTernary: spf = '6,6,6[,6]'; break;
    default: spf = '?'; break;
  }
  else if (BITRUNCATED())
    spf = spf + ',' + its(S6()) + ',' + its(S6());
  else if (IRREGULAR())
    throw new NotPorted('compute_geometry_data: irregular');
  // CAP_GP
  else if (UNRECTIFIED() || UNTRUNCATED()) {
    const p = G.gp_param;
    if (UNRECTIFIED() && (p[0] - p[1]) % 2 !== 0)
      spf = '(?)';
    else if (UNTRUNCATED() && (p[0] - p[1]) % 3 !== 0)
      spf = '(?)';
    else {
      const each = UNRECTIFIED() ? '4' : '3';
      let first = UNRECTIFIED() ? 4 : 6;
      let second = S7();
      if (p[0] === 1 && p[1] === 1)
        first = second;
      else if (second < first)
        [first, second] = [second, first];
      spf = each;
      for (let z = 1; z < first; z++) spf += ',' + each;
      if (first !== second) {
        spf += '[';
        for (let z = first; z < second; z++) spf += ',' + each;
        spf += ']';
      }
    }
  }
  else if (GOLDBERG() && S3() === 4 && G.gp_param[0] === 1 && G.gp_param[1] === 1)
    spf = spf + ',4,' + spf + ',4';
  else if (GOLDBERG() && S3() === 4 && G.gp_param[0] === 2 && G.gp_param[1] === 0)
    spf = spf + ',4,4,4';
  else if (GOLDBERG() && S3() === 4)
    spf = '[' + spf + ',4],4,4,4';
  else if (WARPED() && S3() === 3 && G.gp_param[0] === 1 && G.gp_param[1] === 1)
    spf = spf + ',3,3';
  else if (WARPED() && S3() === 3)
    spf = '[' + spf + ',6],3,3';
  else if (GOLDBERG() && S3() === 3)
    spf = '[' + spf + ',6],6,6';
  else {
    const spf0 = spf;
    for (let z = 1; z < S3(); z++) spf = spf + ',' + spf0;
  }
  gd.spf = spf;

  gd.size_str =
    G.disksize ? its(isize(G.currentmap.allcells())) :
      // CAP_BT
      bt_in() ? fts(1440 * Math.PI / 180 * Math.sqrt(2) * Math.log(2) / Math.pow(G.vid.binary_width, WDIM() - 1), 4) + ' exp(∞)' :
        WDIM() === 3 && closed_manifold() ? its(isize(G.currentmap.allcells())) :
          WDIM() === 3 && euclid() ? '∞' :
            gd.worldsize < 0 ? (gd.nom % gd.denom ? its(gd.nom) + '/' + its(gd.denom) : its(-gd.worldsize)) + ' exp(∞)' :
              (euclid() && quotient() && !closed_manifold()) ? '∞' :
                gd.worldsize === 0 ? '∞²' :
                  its(gd.worldsize);

  if (WDIM() === 3) gd.euler = 0;
  gd.demigenus = 2 - gd.euler;
  if (gd.euler === UNKNOWN) gd.demigenus = UNKNOWN;

  return gd;
}

export function add_size_action(): void {
  dialog_add_action(() => {
    if (!G.viewdists) { enable_viewdists(); pushScreen(viewdist_configure_dialog); }
    else if (G.viewdists) G.viewdists = false;
  });
}

export function showEuclideanMenu(): void {
  G.cmode = sm.SIDE | sm.MAYDARK;
  gamescreen();

  dialog_init_t(XLAT('experiment with geometry'));

  // dynamicval<eGeometry> d1(geometry, geometry); dynamicval<eVariation> d2(variation, variation);
  // arb::convert::in() && rulegen::auto_rulegen: never (arbitrile.cpp's package)
  const converted = false;

  dialog_addSelItem(XLAT('geometry'), geometry_name(), ch('d'));
  dialog_add_action(() => { pushScreen(ge_select_tiling); pushScreen(ge_select_filter); });

  dialog_addSelItem(XLAT('basic tiling'), XLAT(ginf[G.geometry].tiling_name), ch('t'));
  dialog_add_action(() => {
    if (!current_filter || !current_filter.test()) set_default_filter();
    pushScreen(ge_select_tiling);
  });

  let qstring = ginf[G.geometry].quotient_name;
  if (euclid() && quotient()) qstring = ONOFF(true);

  if (qstring === 'none')
    dialog_addBoolItem(XLAT('quotient space'), false, ch('q'));
  else
    dialog_addSelItem(XLAT('quotient space'), XLAT(qstring), ch('q'));

  dialog_add_action(select_quotient);

  if (arcm_in() || cryst() || arb_in()) throw new NotPorted('showEuclideanMenu: arcm / crystal / arb parameters');

  // fake::available(): fake curvature (fake.cpp, a later package): MDIM == 3 ... and the tilings it supports
  if (fake_available_g1() && !converted) {
    dialog_addItem(XLAT('fake curvature'), ch('4'));

    dialog_add_action(() => {
      if (fake_in()) throw new NotPorted('fake::configure');
      else dialog_cheat_if_confirmed(not_available);
    });
  }

  if ((cgflags() & qULTRA) !== 0n) throw new NotPorted('showEuclideanMenu: reg3::ultra_mirror_on');

  if (mproduct() || mtwisted() || nil() || bt_in()) throw new NotPorted('showEuclideanMenu: product / twisted / Nil / binary tiling');
  else if ((WDIM() === 3 || aperiodic() || arb_in()) && !reg3_in() && G.geometry !== gCubeTiling) dialog_addBreak(100);
  else if ((BigInt(ginf[G.geometry].g.kind) & qFRACTAL) !== 0n) // cgclass & qFRACTAL (as in the original)
    dialog_addBreak(100);
  else
    menuitem_change_variation(ch('v'));

  // in_s2xe(), mhybrid, stretch::applicable(): the 3D package (none of the ported geometries)

  dialog_addBreak(100);
  menuitem_land_structure(ch('l'));
  add_edit(P('req_disksize'));

  if (G.specialland === laMinefield && closed_or_bounded()) {
    dialog_addSelItem(XLAT('number of mines'), its(G.bounded_mine_quantity), ch('m'));
    dialog_add_action(() => {
      const ne = dialog_editNumber({ get v() { return G.bounded_mine_quantity; }, set v(x: number) { G.bounded_mine_quantity = x; } },
        0, G.bounded_mine_max, 1, Math.trunc((G.bounded_mine_max + 5) / 10),
        XLAT('number of mines'), '');
      ne.reaction = () => {
        if (G.bounded_mine_quantity < 0) G.bounded_mine_quantity = 0;
        if (G.bounded_mine_quantity > G.bounded_mine_max) G.bounded_mine_quantity = G.bounded_mine_max;
      };
      ne.reaction_final = () => {
        G.bounded_mine_percentage = G.bounded_mine_quantity * 1. / G.bounded_mine_max;
        stop_game();
        start_game();
      };
    });
  }

  if (geometry_has_alt_mine_rule()) {
    dialog_addSelItem(XLAT('adjacency rule'), G.mine_adjacency_rule ? XLAT('vertex') : WDIM() === 3 ? XLAT('face') : XLAT('edge'), ch('M'));
    dialog_add_action(() => {
      stop_game();
      G.mine_adjacency_rule = G.mine_adjacency_rule ? 0 : 1;
      start_game();
      addMessage(XLAT('Note: adjacency rule affects environmental effects, but not movement.'));
    });
  }

  dialog_addBoolItem(XLAT('pattern'), G.specialland === laCanvas, ch('p'));
  if (G.specialland === laCanvas) throw new NotPorted('showEuclideanMenu: ccolor::which->name (the canvas colorings)');
  dialog_add_action(not_available); // patterns::showPrePattern (the canvas patterns, pattern2.cpp: a later package; deviation)
  validity_info();
  if (WDIM() === 3) {
    dialog_addItem(XLAT('3D configuration'), ch('9'));
    dialog_add_action_push(show3D);
  }
  menuitem_projection(ch('1'));
  if (lie_movement_available()) {
    add_edit(P('nisot_geodesic_movement'));
  }
  // CAP_CRYSTAL && MAXMDIM >= 4: crystal::add_crystal_transform('x') adds nothing outside crystals

  dialog_addBreak(50);

  // CAP_SHOT
  dialog_addItem(XLAT('take screenshot'), ch('s'));
  dialog_add_action_push(shot_menu);

  dialog_addHelp();
  dialog_addBack();

  dialog_addBreak(150);

  dialog_addTitle(XLAT('info about: %1', full_geometry_name()), 0xFFFFFF, 150);

  const gd = compute_geometry_data();
  if (WDIM() === 2 && !arb_in() && !aperiodic()) dialog_addSelItem(XLAT('faces per vertex'), gd.spf, 0);

  if (WDIM() === 2 && quotient() && closed_manifold()) {
    dialog_addItem(XLAT('fundamental domain'), ch('F'));
    dialog_add_action(not_available); // fundamental::showMenu (fundamental.cpp, a later package; deviation)
  }

  dialog_addSelItem(XLAT('size of the world'), gd.size_str, ch('3'));
  add_size_action();

  // currentmap->get_backmap(): only the nonisotropic maps have one

  if (closed_manifold()) {
    dialog_addSelItem(XLAT('Euler characteristics'), gd.euler === UNKNOWN ? '?' : its(gd.euler), 0);
    if (WDIM() === 3) { /* */ }
    else if (nonorientable())
      dialog_addSelItem(XLAT('demigenus'), gd.demigenus === UNKNOWN ? '?' : its(gd.demigenus), 0);
    else
      dialog_addSelItem(XLAT('genus'), gd.demigenus === UNKNOWN ? '?' : its(Math.trunc(gd.demigenus / 2)), 0);
  }
  else dialog_addBreak(200);

  dialog_display();
}

export function runGeometryExperiments(): void {
  if (!G.geometry && G.specialland === laIce)
    G.specialland = getLandForList(G.cwt.at);
  pushScreen(showEuclideanMenu);
}

/** fake::available() (fake.cpp; what the menu needs of it) */
function fake_available_g1(): boolean {
  if (fake_in()) return true;
  if (WDIM() === 2 && standard_tiling() && (PURE() || BITRUNCATED())) return true;
  if (WDIM() === 2 && standard_tiling() && GOLDBERG() && S3() === 4 && ((G.gp_param[0] + G.gp_param[1]) % 2)) return true;
  if (WDIM() === 2 && standard_tiling() && GOLDBERG() && S3() === 3 && ((G.gp_param[0] - G.gp_param[1]) % 3)) return true;
  if (WDIM() === 2 && standard_tiling() && GOLDBERG() && S3() === 4 && G.gp_param[0] === 1 && G.gp_param[1] === 1) return true;
  if (WDIM() === 2 && standard_tiling() && UNRECTIFIED() && S3() === 4 && G.gp_param[0] === 1 && G.gp_param[1] === 1) return true;
  if (WDIM() === 2 && standard_tiling() && UNTRUNCATED() && S3() === 3 && G.gp_param[0] === 1 && G.gp_param[1] === 1) return true;
  if (arcm_in() && PURE()) return true;
  if (WDIM() === 2) return false;
  throw new NotPorted('fake::available (3D)');
}

void stub_screen_pop; void gNormal; void GOLDBERG_INV; void S7;

// --- stage 3, package G1: the command line options of geom-exp.cpp (read_geom_args, readGeo) ---
import { arg_argis, arg_shift, arg_args, arg_argi, PHASEFROM, arg_launch_dialog } from './commandline.ts';
import { appears } from './util.ts';
import { addHook } from './hyper.ts';
const eVar = eVariation;
import { gp_univ_param } from './goldberg.ts';

/** EX eGeometry readGeo(const string& ss) */
export function readGeo(ss: string): number {
  for (let i = 0; i < ginf.length; i++) if (ginf[i].shortname === ss) return i;
  let numeric = true;
  for (const c of ss) if (c < '0' || c > '9') numeric = false;
  if (numeric) return parseInt(ss, 10) || 0;
  for (let i = 0; i < ginf.length; i++) if (appears(ginf[i].menu_displayed_name, ss)) {
    return i;
  }
  return 0; // gNormal
}

/** TOGGLE('7', PURE, set_variation(PURE ? bitruncated : pure)) */
function toggle7(): number {
  const a = arg_args();
  const act = (): void => { set_variation(PURE() ? eVar.bitruncated : eVar.pure); };
  if (a === '-7') { if (PHASEFROM(2)) return 2; G.showstartmenu = false; act(); return 0; }
  if (a === '-71') { if (PHASEFROM(2)) return 2; G.showstartmenu = false; if (!PURE()) act(); return 0; }
  if (a === '-70') { if (PHASEFROM(2)) return 2; G.showstartmenu = false; if (PURE()) act(); return 0; }
  return 1;
}

/** int read_geom_args() (the CAP_FIELD quotient options and the 3D variations are later packages) */
function read_geom_args(): number {
  const t = toggle7();
  if (t !== 1) return t;
  if (among(arg_args(), '-qpar', '-qpar2', '-triplet', '-to-fq', '-cs', '-fwrite', '-csp', '-fi', '-fi-at', '-fi-geo', '-qs',
    '-truncate-ultra', '-d:quotient', '-uqf', '-subcubes', '-dual-subcubes', '-bch-subcubes', '-bch-oct', '-coxeter'))
    throw new NotPorted('read_geom_args ' + arg_args() + ' (field quotients / 3D variations)'); // STAGE3-STUB
  if (arg_argis('-mineadj')) {
    arg_shift(); G.mine_adjacency_rule = arg_argi();
  }
  else if (arg_argis('-geo')) {
    if (PHASEFROM(2)) return 2;
    arg_shift();
    set_geometry(readGeo(arg_args()));
  }
  // CAP_GP
  else if (arg_argis('-gp')) {
    if (PHASEFROM(2)) return 2;
    arg_shift(); G.gp_param[0] = arg_argi();
    arg_shift(); G.gp_param[1] = arg_argi();
    set_variation(eVar.goldberg);
  }
  else if (arg_argis('-gph')) {
    if (PHASEFROM(2)) return 2;
    arg_shift(); const x = arg_argi();
    arg_shift(); const y = arg_argi();
    gp_whirl_set([x, y]);
  }
  else if (arg_argis('-unrectified')) {
    if (PHASEFROM(2)) return 2;
    G.gp_param = gp_univ_param();
    set_variation(eVar.unrectified);
  }
  else if (arg_argis('-untruncated')) {
    if (PHASEFROM(2)) return 2;
    G.gp_param = gp_univ_param();
    set_variation(eVar.untruncated);
  }
  else if (arg_argis('-warped')) {
    if (PHASEFROM(2)) return 2;
    G.gp_param = gp_univ_param();
    set_variation(eVar.warped);
  }
  else if (arg_argis('-d:geom'))
    arg_launch_dialog(showEuclideanMenu);
  else return 1;
  return 0;
}

export function register_geom_exp(): void {
  addHook(G.hooks_args, 0, read_geom_args);
}
