// geometry.cpp of HyperRogue 13.1o: the basic parameters of the current geometry (geometry_information:
// prepare_basics, check_cgi, cgi_string) and the shape data of the drawing.
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// Stage 1 ports the non-graphical part: prepare_basics computes tessf, crossf, hexf, hcrossf, hexhexdist,
// hexvdist, rhexf, edgelen, hexshift, scalefactor, orbsize, zhexf, plevel, the heptmove/hexmove/invhexmove
// matrices, set_sibling_limit and the field pattern analysis; branches for other geometries call their stub
// modules. Stage 2 (package D2) adds the drawing part: hpcshape, floorshape, the shape members of
// geometry_information (filled by polygons.ts prepare_shapes and floorshapes.ts), prepare_compute3 (the levels
// FLOOR, WALL, ... of the drawing) and geom3's level functions. The member functions that the C++ defines in
// polygons.cpp, floorshapes.cpp and 3d-models.cpp are functions with a `this: geometry_information` parameter
// in those modules, bound as members here. Left out (3D, stage 3): switch_always3/tpp/fpp, dim_listener (only
// 3D graphics listens), the floor textures in check_cgi, usershapes (the map editor).
import { c_atanh, c_cosh, c_sin, c_tanh } from './cpp.ts';
import { G, pconf } from './globals.ts';
import { NotPorted, among, PPR } from './hyper.ts';
import {
  GOLDBERG_INV, S7, S3, S6, euclid, sphere, hyperbolic, elliptic, WDIM, GDIM, BITRUNCATED, UNRECTIFIED, INVERSE, mhybrid,
  mproduct, mtwisted, embedded_plane, OINF, ginf, gArchimedean, gcHyperbolic, gHoroRec, sol, nil, nih,
  eVariation, type eVariation as eVariationT, gFieldQuotient, GOLDBERG,
} from './classes.ts';
import {
  type hyperpoint, type transmatrix, TAU, M_PI, deg, edge_of_triangle_with_angles, xpush0, intval, hdist,
  hdist0, mid, iso_inverse, tmul, tmulh, sin_auto, asin_auto, tcopy, Id,
} from './hyperpoint.ts';
import { spin, lxpush, xspinpush0, make_embed, type embedding_method } from './embeddings.ts';
import type { expansion_analyzer } from './expansion.ts';
import { set_sibling_limit } from './expansion.ts';
import { arcm_in } from './archimedean.ts';
import { fake_in } from './fake.ts';
import { arb_in } from './arbitrile.ts';
import { bt_in } from './binary-tiling.ts';
import { kite_in } from './kite.ts';
import { reg3_in } from './reg3.ts';
import { euc_in } from './euclid.ts';
import { gp_compute_geometry, gp_prepare_matrices } from './goldberg.ts';
import type { gpdata_t } from './goldberg.ts';
import { gp_variation_for } from './goldberg.ts';
import { hypot_d } from './hyperpoint.ts';
import { irr_compute_geometry } from './irregular.ts';
import { fieldpattern_getcurrfp } from './fieldpattern.ts';
import { its } from './hprint.ts';
import type { cell } from './locations.ts';
import { XLAT } from './language.ts';
import { lerp } from './util.ts';
import { adjust_linked } from './config.ts';
import * as polygons from './polygons.ts';
import * as floorshapes from './floorshapes.ts';
import * as models3d from './3d-models.ts';

// debugflag debug_geometry: debug output, left out (PORTING.md, "Macros")

/** enum class SIDE */
export const SIDE_INFDEEP = 0, SIDE_DEEP = 1, SIDE_SHALLOW = 2, SIDE_WATERLEVEL = 3, SIDE_FLOOR = 4, SIDE_RED1 = 5,
  SIDE_RED2 = 6, SIDE_RED3 = 7, SIDE_RED4 = 8, SIDE_WALL = 9, SIDE_HIGH = 10, SIDE_HIGH2 = 11, SIDE_SKY = 12,
  SIDE_GUARD = 13;
export const SIDEPARS = SIDE_GUARD;

/** constexpr SIDE allsides[] */
export const allsides: readonly number[] = [
  SIDE_INFDEEP, SIDE_DEEP, SIDE_SHALLOW, SIDE_WATERLEVEL, SIDE_FLOOR, SIDE_RED1, SIDE_RED2, SIDE_RED3, SIDE_RED4,
  SIDE_WALL, SIDE_HIGH, SIDE_HIGH2, SIDE_SKY,
];

/** sidearray<T>: an array of SIDEPARS values, indexed by SIDE */
export type sidearray<T> = T[];

/** constexpr sidearray<PPR> side_to_prio */
export const side_to_prio: readonly PPR[] = [
  PPR.DEEP_SIDE, PPR.DEEP_SIDE, PPR.SHALLOW_SIDE, PPR.WATERLEVEL_SIDE, PPR.FLOOR_SIDE, PPR.RED1_SIDE, PPR.RED2_SIDE,
  PPR.RED3_SIDE, PPR.WALL_SIDE, PPR.WALL_SIDE, PPR.DEFAULT, PPR.DEFAULT, PPR.DEFAULT,
];

/** constexpr sidearray<PPR> side_to_prio_top */
export const side_to_prio_top: readonly PPR[] = [
  PPR.DEEP_TOP, PPR.DEEP_TOP, PPR.SHALLOW_TOP, PPR.WATERLEVEL_TOP, PPR.FLOOR, PPR.RED1_TOP, PPR.RED2_TOP,
  PPR.RED3_TOP, PPR.WALL_TOP, PPR.WALL_TOP, PPR.DEFAULT, PPR.DEFAULT, PPR.DEFAULT,
];

/** struct usershapelayer */
export class usershapelayer {
  list: hyperpoint[] = [];
  sym = false;
  rots = 0;
  color = 0;
  shift: hyperpoint = [0, 0, 0, 0]; spin: hyperpoint = [0, 0, 0, 0];
  zlevel = 0;
  texture_offset = 0;
  prio: PPR = PPR.ZERO;
}

export const USERLAYERS = 32;

/** struct usershape { usershapelayer d[USERLAYERS]; } */
export class usershape { d: usershapelayer[] = Array.from({ length: USERLAYERS }, () => new usershapelayer()); }

/** glvertex (glhr.cpp: array<GLfloat, SHDIM>, SHDIM = 4): the float vertices every shape is drawn from */
export type glvertex = Float32Array;

/** struct basic_textureinfo */
export class basic_textureinfo {
  texture_id = 0;
  tvertices: glvertex[] = [];
  colors: glvertex[] = [];
}

/** struct hpcshape: a shape, the vertices s..e-1 of cgi.hpc / cgi.ourshape. A value in C++: `sh = orig`
 *  copies (use set / clone); bshape keeps a pointer to it (`last`), so the shapes are never replaced. */
export class hpcshape {
  s = 0; e = 0;
  prio: PPR = PPR.ZERO;
  flags = 0;
  intester: hyperpoint = [0, 0, 0, 0];
  tinf: basic_textureinfo | null = null;
  texture_offset = 0;
  shs = 0; she = 0;
  clear(): void { this.s = this.e = this.shs = this.she = this.texture_offset = 0; this.prio = PPR.ZERO; this.tinf = null; this.flags = 0; }
  /** `*this = o` */
  set(o: hpcshape): this {
    this.s = o.s; this.e = o.e; this.prio = o.prio; this.flags = o.flags; this.intester = [...o.intester];
    this.tinf = o.tinf; this.texture_offset = o.texture_offset; this.shs = o.shs; this.she = o.she;
    return this;
  }
  clone(): hpcshape { return new hpcshape().set(this); }
}

/** hpcshape x[n] */
export function hpcarr(n: number): hpcshape[] { return Array.from({ length: n }, () => new hpcshape()); }
/** hpcshape x[n][m] */
export function hpcarr2(n: number, m: number): hpcshape[][] { return Array.from({ length: n }, () => hpcarr(m)); }

/** #define WINGS (BADMODEL ? 1 : 4); typedef array<hpcshape, WINGS+1> hpcshape_animated */
export const WINGS = 4;
export type hpcshape_animated = hpcshape[];

/** struct floorshape */
export class floorshape {
  is_plain = false;
  shapeid = 0;
  id = 0;
  /** pattern strength in 3D */
  pstrength = 10;
  /** frame strength in 3D */
  fstrength = 10;
  prio: PPR = PPR.FLOOR;
  b: hpcshape[] = []; shadow: hpcshape[] = []; cone: hpcshape[][] = [[], []];
  levels: sidearray<hpcshape[]> = Array.from({ length: SIDEPARS }, () => []);
  side: sidearray<hpcshape[][]> = Array.from({ length: SIDEPARS }, () => []);
}

/** struct plain_floorshape */
export class plain_floorshape extends floorshape {
  rad0 = 0; rad1 = 0;
  configure(r0: number, r1: number): void { this.rad0 = r0; this.rad1 = r1; }
}

/** struct escher_floorshape. noftype: 0 (shapeid2 is heptagonal or just use shapeid1), 1 (shapeid2 is pure
 *  heptagonal), 2 (shapeid2 is Euclidean), 3 (shapeid2 is hexagonal) */
export class escher_floorshape extends floorshape {
  shapeid0 = 0; shapeid1 = 0; noftype = 0; shapeid2 = 0;
  scale = 0;
}

/** struct length_adjusted_shapes */
export class length_adjusted_shapes { shIBranch = new hpcshape(); }

/** enum class ePipeEnd */
export const ePipeEnd_sharp = 0, ePipeEnd_ball = 1;

/** GOLDBERG_BITS controls the size of tables for Goldberg. see gp::check_limits */
export const GOLDBERG_BITS = 5;
export const GOLDBERG_LIMIT = (1 << GOLDBERG_BITS);
export const GOLDBERG_MASK = (GOLDBERG_LIMIT - 1);

/** values of hcrossf and hexf for the standard geometry. Since polygons are
 *  usually drawn in this geometry, the scale in other geometries is usually
 *  based on comparing these values to the values in the other geometry. */
export const hcrossf7 = 0.620672, hexf7 = 0.378077, tessf7 = 1.090550, hexhexdist7 = 0.566256;

/** struct geometry_information: basic geometry parameters (the non-graphical part) */
export class geometry_information {
  /** distance from heptagon center to another heptagon center */
  tessf = 0;
  /** distance from heptagon center to adjacent cell center (either hcrossf or tessf) */
  crossf = 0;
  /** distance from heptagon center to small heptagon vertex */
  hexf = 0;
  /** distance from heptagon center to big heptagon vertex */
  hcrossf = 0;
  /** distance between adjacent hexagon vertices */
  hexhexdist = 0;
  /** distance between hexagon vertex and hexagon center */
  hexvdist = 0;
  /** distance from heptagon center to heptagon vertex (either hexf or hcrossf) */
  rhexf = 0;
  /** edge length */
  edgelen = 0;

  /** basic parameters for 3D geometries */
  close_distances = new Map<number, number>();
  loop = 0; face = 0; schmid = 0;
  spins: transmatrix[] = [];
  adjmoves: transmatrix[] = [];
  heptshape: unknown = null;
  subshapes: unknown[] = [];
  adjcheck = 0;
  strafedist = 0;
  ultra_mirror_dist = 0; ultra_material_part = 0; ultra_mirror_part = 0;
  ultra_mirrors: transmatrix[] = [];
  xp_order = 0; r_order = 0; rx_order = 0;
  full_X: transmatrix = tcopy(Id); full_R: transmatrix = tcopy(Id); full_P: transmatrix = tcopy(Id);

  /** for 2D geometries */
  heptmove: transmatrix[] = [];
  hexmove: transmatrix[] = [];
  invhexmove: transmatrix[] = [];

  base_distlimit = 0;

  emb: embedding_method = null!;

  /** size of the Sword (from Orb of the Sword), used in the shmup mode */
  sword_size = 0;
  /** scale factor for the graphics of most things */
  scalefactor = 0;
  orbsize = 0; floorrad0 = 0; floorrad1 = 0; zhexf = 0;
  corner_bonus = 0;
  hexshift = 0;
  asteroid_size: number[] = [0, 0, 0, 0, 0, 0, 0, 0];
  wormscale = 0;
  tentacle_length = 0;
  /** level in hybrid geometries */
  plevel = 0;
  /** level for a z-step */
  single_step = 0;
  /** the number of levels in PSL */
  psl_steps = 0;
  /** level in twisted geometries -- rarely computed */
  plevel_twisted = 0;

  /** Goldberg parameters (gp::compute_geometry fills them; null without Goldberg) */
  gpdata: gpdata_t | null = null;

  expansion: expansion_analyzer | null = null;

  state = 0;
  usershape_state = 0;
  timestamp = 0;
  /** prevent from being destroyed */
  use_count = 0;

  require_basics(): void { if (this.state & 1) return; this.state |= 1; this.prepare_basics(); }
  require_shapes(): void { if (this.state & 2) return; this.state |= 2; this.prepare_shapes(); }
  require_usershapes(): void {
    if (this.usershape_state === G.usershape_changes) return;
    this.usershape_state = G.usershape_changes;
    throw new NotPorted('prepare_usershapes (the map editor, stage 3)');
  }

  // --- stage 2 (package D2): the drawing part of the struct ---

  /** for binary tilings */
  direct_tmatrix: transmatrix[] = [];
  inverse_tmatrix: transmatrix[] = [];
  /** a bitmask for hr::bt::use_direct_for */
  use_direct = 0;

  /** various parameters related to the 3D view */
  INFDEEP = 0; HELL = 0; DEEP = 0; HELLSPIKE = 0; SHALLOW = 0; WATERLEVEL = 0; FLOOR = 0; RED: number[] = [0, 0, 0, 0];
  WALL = 0; HIGH = 0; HIGH2 = 0; LOWSKY = 0; SKY = 0; STAR = 0;
  STUFF = 0; FLATEYE = 0;
  LEG0 = 0; LEG1 = 0; LEG = 0; LEG3 = 0; GROIN = 0; GROIN1 = 0; GHOST = 0;
  BODY = 0; BODY1 = 0; BODY2 = 0; BODY3 = 0;
  NECK1 = 0; NECK = 0; NECK3 = 0; HEAD = 0; HEAD1 = 0; HEAD2 = 0; HEAD3 = 0;
  ALEG0 = 0; ALEG = 0; ABODY = 0; AHEAD = 0; BIRD = 0;

  human_height = 0; slev = 0;

  eyelevel_familiar = 0; eyelevel_human = 0; eyelevel_dog = 0;

  // #if CAP_SHAPES
  shSemiFloorSide: sidearray<hpcshape> = hpcarr(SIDEPARS);

  shBFloor = hpcarr(2); shWave = hpcarr2(8, 2); shCircleFloor = new hpcshape(); shBarrel = new hpcshape();
  shWall = hpcarr(2); shMineMark = hpcarr(2); shBigMineMark = hpcarr(2); shFan = new hpcshape(); shZebra = hpcarr(5);
  shSwitchDisk = new hpcshape(); shTower = hpcarr(11); shEmeraldFloor = hpcarr(6); shSemiFeatherFloor = hpcarr(2);
  shSemiFloor = hpcarr(2); shSemiBFloor = hpcarr(2); shSemiFloorShadow = new hpcshape(); shMercuryBridge = hpcarr(2);
  shTriheptaSpecial = hpcarr(14); shCross = new hpcshape(); shGiantStar = hpcarr(2); shLake = new hpcshape();
  shMirror = new hpcshape(); shHalfFloor = hpcarr(6); shHalfMirror = hpcarr(3); shGem = hpcarr(2);
  shStar = new hpcshape(); shFlash = new hpcshape(); shDisk = new hpcshape(); shHalfDisk = new hpcshape();
  shDiskT = new hpcshape(); shDiskS = new hpcshape(); shDiskM = new hpcshape(); shDiskSq = new hpcshape();
  shEccentricDisk = new hpcshape(); shDiskSegment = new hpcshape(); shHeptagon = new hpcshape();
  shHeptagram = new hpcshape(); shTinyBird = new hpcshape(); shTinyShark = new hpcshape(); shEgg = new hpcshape();
  shSmallEgg = new hpcshape(); shRing = new hpcshape(); shSpikedRing = new hpcshape(); shTargetRing = new hpcshape();
  shSawRing = new hpcshape(); shGearRing = new hpcshape(); shPeaceRing = new hpcshape();
  shHeptaRing = new hpcshape(); shSpearRing = new hpcshape(); shLoveRing = new hpcshape();
  shFrogRing = new hpcshape(); shPowerGearRing = new hpcshape(); shProtectiveRing = new hpcshape();
  shTerraRing = new hpcshape(); shMoveRing = new hpcshape(); shReserved4 = new hpcshape();
  shMoonDisk = new hpcshape(); shDaisy = new hpcshape(); shSnowflake = new hpcshape(); shTriangle = new hpcshape();
  shNecro = new hpcshape(); shStatue = new hpcshape(); shKey = new hpcshape(); shWindArrow = new hpcshape();
  shGun = new hpcshape(); shFigurine = new hpcshape(); shTreat = new hpcshape(); shSmallTreat = new hpcshape();
  shElementalShard = new hpcshape(); shILeaf = hpcarr(3); shMovestar = new hpcshape(); shWolf = new hpcshape();
  shYeti = new hpcshape(); shDemon = new hpcshape(); shGDemon = new hpcshape(); shEagle = new hpcshape();
  shGargoyleWings = new hpcshape(); shGargoyleBody = new hpcshape(); shFoxTail1 = new hpcshape();
  shFoxTail2 = new hpcshape(); shDogBody = new hpcshape(); shDogHead = new hpcshape();
  shDogFrontLeg = new hpcshape(); shDogRearLeg = new hpcshape(); shDogFrontPaw = new hpcshape();
  shDogRearPaw = new hpcshape(); shDogTorso = new hpcshape(); shHawk = new hpcshape(); shCatBody = new hpcshape();
  shCatLegs = new hpcshape(); shCatHead = new hpcshape(); shFamiliarHead = new hpcshape();
  shFamiliarEye = new hpcshape(); shWolf1 = new hpcshape(); shWolf2 = new hpcshape(); shWolf3 = new hpcshape();
  shRatEye1 = new hpcshape(); shRatEye2 = new hpcshape(); shRatEye3 = new hpcshape(); shDogStripes = new hpcshape();
  shPBody = new hpcshape(); shSmallPBody = new hpcshape(); shPSword = new hpcshape(); shSmallPSword = new hpcshape();
  shPKnife = new hpcshape(); shFerocityM = new hpcshape(); shFerocityF = new hpcshape();
  shHumanFoot = new hpcshape(); shHumanLeg = new hpcshape(); shHumanGroin = new hpcshape();
  shHumanNeck = new hpcshape(); shSkeletalFoot = new hpcshape(); shYetiFoot = new hpcshape();
  shMagicSword = new hpcshape(); shSmallSword = new hpcshape(); shMagicShovel = new hpcshape();
  shSeaTentacle = new hpcshape(); shKrakenHead = new hpcshape(); shKrakenEye = new hpcshape();
  shKrakenEye2 = new hpcshape(); shArrow = new hpcshape(); shPHead = new hpcshape(); shPFace = new hpcshape();
  shGolemhead = new hpcshape(); shHood = new hpcshape(); shArmor = new hpcshape(); shAztecHead = new hpcshape();
  shAztecCap = new hpcshape(); shSabre = new hpcshape(); shTurban1 = new hpcshape(); shTurban2 = new hpcshape();
  shVikingHelmet = new hpcshape(); shRaiderHelmet = new hpcshape(); shRaiderArmor = new hpcshape();
  shRaiderBody = new hpcshape(); shRaiderShirt = new hpcshape(); shWestHat1 = new hpcshape();
  shWestHat2 = new hpcshape(); shGunInHand = new hpcshape(); shKnightArmor = new hpcshape();
  shKnightCloak = new hpcshape(); shWightCloak = new hpcshape(); shGhost = new hpcshape(); shEyes = new hpcshape();
  shSlime = new hpcshape(); shJelly = new hpcshape(); shJoint = new hpcshape(); shWormHead = new hpcshape();
  shSmallWormHead = new hpcshape(); shTentHead = new hpcshape(); shShark = new hpcshape();
  shWormSegment = new hpcshape(); shSmallWormSegment = new hpcshape(); shWormTail = new hpcshape();
  shSmallWormTail = new hpcshape(); shSlimeEyes = new hpcshape(); shDragonEyes = new hpcshape();
  shSmallDragonEyes = new hpcshape(); shWormEyes = new hpcshape(); shSmallWormEyes = new hpcshape();
  shGhostEyes = new hpcshape(); shMiniGhost = new hpcshape(); shSmallEyes = new hpcshape();
  shMiniEyes = new hpcshape(); shHedgehogBlade = new hpcshape(); shSmallHedgehogBlade = new hpcshape();
  shHedgehogBladePlayer = new hpcshape(); shWolfBody = new hpcshape(); shWolfHead = new hpcshape();
  shWolfLegs = new hpcshape(); shWolfEyes = new hpcshape(); shWolfFrontLeg = new hpcshape();
  shWolfRearLeg = new hpcshape(); shWolfFrontPaw = new hpcshape(); shWolfRearPaw = new hpcshape();
  shFemaleBody = new hpcshape(); shFemaleHair = new hpcshape(); shFemaleDress = new hpcshape();
  shWitchDress = new hpcshape(); shWitchHair = new hpcshape(); shBeautyHair = new hpcshape();
  shFlowerHair = new hpcshape(); shFlowerHand = new hpcshape(); shSuspenders = new hpcshape();
  shTrophy = new hpcshape(); shBugBody = new hpcshape(); shBugArmor = new hpcshape(); shBugLeg = new hpcshape();
  shBugAntenna = new hpcshape(); shPickAxe = new hpcshape(); shSmallPickAxe = new hpcshape();
  shPike = new hpcshape(); shFlailBall = new hpcshape(); shSmallFlailBall = new hpcshape();
  shFlailTrunk = new hpcshape(); shSmallFlailTrunk = new hpcshape(); shFlailChain = new hpcshape();
  shHammerHead = new hpcshape(); shSmallHammerHead = new hpcshape(); shBook = new hpcshape();
  shBookCover = new hpcshape(); shGrail = new hpcshape(); shBoatOuter = new hpcshape(); shBoatInner = new hpcshape();
  shCompass1 = new hpcshape(); shCompass2 = new hpcshape(); shCompass3 = new hpcshape(); shKnife = new hpcshape();
  shTongue = new hpcshape(); shFlailMissile = new hpcshape(); shTrapArrow = new hpcshape();
  shPirateHook = new hpcshape(); shSmallPirateHook = new hpcshape(); shPirateHood = new hpcshape();
  shEyepatch = new hpcshape(); shPirateX = new hpcshape(); shHeptaMarker = new hpcshape();
  shSnowball = new hpcshape(); shHugeDisk = new hpcshape(); shSkyboxSun = new hpcshape(); shSun = new hpcshape();
  shNightStar = new hpcshape(); shEuclideanSky = new hpcshape(); shSkeletonBody = new hpcshape();
  shSkull = new hpcshape(); shSkullEyes = new hpcshape(); shFatBody = new hpcshape();
  shWaterElemental = new hpcshape(); shPalaceGate = new hpcshape(); shFishTail = new hpcshape();
  shMouse = new hpcshape(); shMouseLegs = new hpcshape(); shMouseEyes = new hpcshape();
  shPrincessDress = new hpcshape(); shPrinceDress = new hpcshape(); shWizardCape1 = new hpcshape();
  shWizardCape2 = new hpcshape(); shBigCarpet1 = new hpcshape(); shBigCarpet2 = new hpcshape();
  shBigCarpet3 = new hpcshape(); shGoatHead = new hpcshape(); shRose = new hpcshape(); shRoseItem = new hpcshape();
  shSmallRose = new hpcshape(); shThorns = new hpcshape(); shRatHead = new hpcshape(); shRatTail = new hpcshape();
  shRatEyes = new hpcshape(); shRatCape1 = new hpcshape(); shRatCape2 = new hpcshape();
  shWizardHat1 = new hpcshape(); shWizardHat2 = new hpcshape(); shTortoise = hpcarr2(13, 6);
  shDragonLegs = new hpcshape(); shDragonTail = new hpcshape(); shDragonHead = new hpcshape();
  shSmallDragonHead = new hpcshape(); shDragonSegment = new hpcshape(); shDragonNostril = new hpcshape();
  shSmallDragonNostril = new hpcshape(); shDragonWings = new hpcshape(); shSolidBranch = new hpcshape();
  shWeakBranch = new hpcshape(); shBead0 = new hpcshape(); shBead1 = new hpcshape(); shBatWings = new hpcshape();
  shBatBody = new hpcshape(); shBatMouth = new hpcshape(); shBatFang = new hpcshape(); shBatEye = new hpcshape();
  shParticle = hpcarr(16); shAsteroid = hpcarr(8); shReptile = hpcarr2(5, 4); shReptileBody = new hpcshape();
  shReptileHead = new hpcshape(); shReptileFrontFoot = new hpcshape(); shReptileRearFoot = new hpcshape();
  shReptileFrontLeg = new hpcshape(); shReptileRearLeg = new hpcshape(); shReptileTail = new hpcshape();
  shReptileEye = new hpcshape(); shTrylobite = new hpcshape(); shTrylobiteHead = new hpcshape();
  shTrylobiteBody = new hpcshape(); shTrylobiteFrontLeg = new hpcshape(); shTrylobiteRearLeg = new hpcshape();
  shTrylobiteFrontClaw = new hpcshape(); shTrylobiteRearClaw = new hpcshape(); shBullBody = new hpcshape();
  shBullHead = new hpcshape(); shBullHorn = new hpcshape(); shBullRearHoof = new hpcshape();
  shBullFrontHoof = new hpcshape(); shSmallBullHead = new hpcshape(); shSmallBullHorn = new hpcshape();
  shTinyBullHead = new hpcshape(); shTinyBullHorn = new hpcshape(); shTinyBullBody = new hpcshape();
  shButterflyBody = new hpcshape(); shButterflyWing = new hpcshape(); shGadflyBody = new hpcshape();
  shGadflyWing = new hpcshape(); shGadflyEye = new hpcshape(); shTerraArmor1 = new hpcshape();
  shTerraArmor2 = new hpcshape(); shTerraArmor3 = new hpcshape(); shTerraHead = new hpcshape();
  shTerraFace = new hpcshape(); shJiangShi = new hpcshape(); shJiangShiDress = new hpcshape();
  shJiangShiCap1 = new hpcshape(); shJiangShiCap2 = new hpcshape(); shPikeBody = new hpcshape();
  shPikeEye = new hpcshape(); shAsymmetric = new hpcshape(); shPBodyOnly = new hpcshape();
  shPBodyArm = new hpcshape(); shPBodyHand = new hpcshape(); shPHeadOnly = new hpcshape(); shDodeca = new hpcshape();
  shSmallerDodeca = new hpcshape(); shLightningBolt = new hpcshape(); shHumanoid = new hpcshape();
  shHalfHumanoid = new hpcshape(); shHourglass = new hpcshape(); shShield = new hpcshape();
  shSmallFan = new hpcshape(); shTreeIcon = new hpcshape(); shLeafIcon = new hpcshape();
  shFrogRearFoot = new hpcshape(); shFrogFrontFoot = new hpcshape(); shFrogRearLeg = new hpcshape();
  shFrogFrontLeg = new hpcshape(); shFrogRearLeg2 = new hpcshape(); shFrogBody = new hpcshape();
  shFrogEye = new hpcshape(); shFrogStripe = new hpcshape(); shFrogJumpFoot = new hpcshape();
  shFrogJumpLeg = new hpcshape(); shSmallFrogRearFoot = new hpcshape(); shSmallFrogFrontFoot = new hpcshape();
  shSmallFrogRearLeg = new hpcshape(); shSmallFrogFrontLeg = new hpcshape(); shSmallFrogRearLeg2 = new hpcshape();
  shSmallFrogBody = new hpcshape();
  shAnimatedEagle: hpcshape_animated = hpcarr(WINGS + 1); shAnimatedTinyEagle: hpcshape_animated = hpcarr(WINGS + 1);
  shAnimatedGadfly: hpcshape_animated = hpcarr(WINGS + 1); shAnimatedHawk: hpcshape_animated = hpcarr(WINGS + 1);
  shAnimatedButterfly: hpcshape_animated = hpcarr(WINGS + 1); shAnimatedGargoyle: hpcshape_animated = hpcarr(WINGS + 1);
  shAnimatedGargoyle2: hpcshape_animated = hpcarr(WINGS + 1); shAnimatedBat: hpcshape_animated = hpcarr(WINGS + 1);
  shAnimatedBat2: hpcshape_animated = hpcarr(WINGS + 1);
  shTinyArrow = new hpcshape();
  shCrossbow = new hpcshape(); shCrossbowBolt = new hpcshape(); shCrossbowstringLoaded = new hpcshape();
  shCrossbowstringUnloaded = new hpcshape(); shCrossbowstringSemiloaded = new hpcshape();
  shCrossbowIcon = new hpcshape(); shCrossbowstringIcon = new hpcshape();
  shSpaceship = new hpcshape(); shMissile = new hpcshape(); shSpaceshipBase = new hpcshape();
  shSpaceshipCockpit = new hpcshape(); shSpaceshipGun = new hpcshape(); shSpaceshipEngine = new hpcshape();
  shChristmasLight = new hpcshape(); shSmallPike = new hpcshape();
  shBunnyBody = new hpcshape(); shBunnyHead = new hpcshape(); shBunnyEar = new hpcshape();
  shBunnyTail = new hpcshape();
  shDonkeyHead = new hpcshape(); shDonkeyEar = new hpcshape(); shDonkeyEye = new hpcshape();
  shDonkeyNose = new hpcshape(); shDonkeyNose1 = new hpcshape();
  shReserved = hpcarr(16);

  /** for shDisk* shapes, the number of vertices in the inner ring */
  orb_inner_ring = 0;
  res1 = 0; res2 = 0;

  shPipe = new Map<number, hpcshape>();

  lash_default = new length_adjusted_shapes();
  lash = new Map<number, length_adjusted_shapes>();

  shPlainWall3D: hpcshape[] = []; shWireframe3D: hpcshape[] = []; shWall3D: hpcshape[] = []; shMiniWall3D: hpcshape[] = [];
  walltester: hyperpoint[] = [];

  wallstart: number[] = [];
  /** needed for twisted, especially Archimedean */
  angle_of_zero: number[] = [];
  raywall: transmatrix[] = [];

  all_plain_floorshapes: plain_floorshape[] = [];
  all_escher_floorshapes: escher_floorshape[] = [];

  shFloor = new plain_floorshape();
  shMFloor = new plain_floorshape(); shMFloor2 = new plain_floorshape(); shMFloor3 = new plain_floorshape();
  shMFloor4 = new plain_floorshape(); shFullFloor = new plain_floorshape();
  shBigTriangle = new plain_floorshape(); shTriheptaFloor = new plain_floorshape(); shBigHepta = new plain_floorshape();

  shStarFloor = new escher_floorshape(); shCloudFloor = new escher_floorshape(); shCrossFloor = new escher_floorshape();
  shChargedFloor = new escher_floorshape();
  shSStarFloor = new escher_floorshape(); shOverFloor = new escher_floorshape(); shTriFloor = new escher_floorshape();
  shFeatherFloor = new escher_floorshape();
  shBarrowFloor = new escher_floorshape(); shNewFloor = new escher_floorshape(); shTrollFloor = new escher_floorshape();
  shButterflyFloor = new escher_floorshape();
  shLavaFloor = new escher_floorshape(); shLavaSeabed = new escher_floorshape(); shSeabed = new escher_floorshape();
  shCloudSeabed = new escher_floorshape();
  shCaveSeabed = new escher_floorshape(); shPalaceFloor = new escher_floorshape(); shDemonFloor = new escher_floorshape();
  shCaveFloor = new escher_floorshape();
  shDesertFloor = new escher_floorshape(); shPowerFloor = new escher_floorshape(); shRoseFloor = new escher_floorshape();
  shSwitchFloor = new escher_floorshape();
  shTurtleFloor = new escher_floorshape();
  shRedRockFloor: escher_floorshape[] = [new escher_floorshape(), new escher_floorshape(), new escher_floorshape()];
  shDragonFloor = new escher_floorshape();

  dlow_table: sidearray<number> = new Array<number>(SIDEPARS).fill(0);
  dhi_table: sidearray<number> = new Array<number>(SIDEPARS).fill(0);

  prehpc = 0;
  /** list of points in all shapes */
  hpc: hyperpoint[] = [];
  /** what shape are we currently creating */
  last: hpcshape | null = null;
  /** is the current shape already started? first = not yet */
  first = false;
  /** starting point of the current shape, can be ultraideal */
  starting_point: hyperpoint = [0, 0, 0, 0];
  /** first ideal point of the current shape */
  starting_ideal: hyperpoint = [0, 0, 0, 0];
  /** last added point of the current shape, can be ultraideal */
  last_point: hyperpoint = [0, 0, 0, 0];
  /** last ideal point of the current shape */
  last_ideal: hyperpoint = [0, 0, 0, 0];

  validsidepar: sidearray<boolean> = new Array<boolean>(SIDEPARS).fill(false);

  ourshape: glvertex[] = [];
  // #endif

  shFullCross = hpcarr(2);

  SD3 = 0; SD6 = 0; SD7 = 0; S12 = 0; S14 = 0; S21 = 0; S28 = 0; S42 = 0; S36 = 0; S84 = 0;
  S_step = 0;

  walloffsets: [number, cell | null][] = [];

  symmetriesAt: number[][] = [];

  cellrotations: { M: transmatrix; mapping: number[]; inverse_id: number }[] = [];

  /** static constexpr (SCALETUNER is off) */
  readonly bscale7 = 1; readonly brot7 = 0; readonly bscale6 = 1; readonly brot6 = 0;

  allshapes: hpcshape[] = [];

  shadowmulmatrix: transmatrix = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];

  ushr = new Map<usershapelayer, hpcshape>();

  /** contains the texture point coordinates for 3D models */
  models_texture = new basic_textureinfo();

  ext = new Map<string, unknown>();

  prepare_compute3 = prepare_compute3;

  // the member functions defined in polygons.cpp, floorshapes.cpp, 3d-models.cpp
  hpc_connect_ideal = polygons.hpc_connect_ideal;
  hpcpush = polygons.hpcpush;
  chasmifyPoly = polygons.chasmifyPoly;
  shift = polygons.shift;
  initPolyForGL = polygons.initPolyForGL;
  extra_vertices = polygons.extra_vertices;
  ddi = polygons.ddi;
  drawTentacle = polygons.drawTentacle;
  hpxyzsc = polygons.hpxyzsc;
  turtlevertex = polygons.turtlevertex;
  get_lash = polygons.get_lash;
  bshape = polygons.bshape;
  finishshape = polygons.finishshape;
  copyshape = polygons.copyshape;
  zoomShape = polygons.zoomShape;
  make_sidewalls = polygons.make_sidewalls;
  procedural_shapes = polygons.procedural_shapes;
  reserve_wall3d = polygons.reserve_wall3d;
  compute_cornerbonus = polygons.compute_cornerbonus;
  create_wall3d = polygons.create_wall3d;
  configure_floorshapes = polygons.configure_floorshapes;
  prepare_shapes = polygons.prepare_shapes;
  init_floorshapes = floorshapes.init_floorshapes;
  bshape2 = floorshapes.bshape2;
  generate_floorshapes_for = floorshapes.generate_floorshapes_for;
  finish_apeirogon = floorshapes.finish_apeirogon;
  make_3d_models = models3d.make_3d_models;

  generate_faces(): void {
    if (G.hooks_generate_faces.callhandlers(false, this)) return;
    // #if MAXMDIM >= 4: reg3 / euc(3) / sn / bt / nil create the faces of 3D cells (later stages)
    else if (reg3_in()) throw new NotPorted('generate_faces: reg3::generate');
    else if (euc_in(3)) throw new NotPorted('generate_faces: euc::generate');
    else if (sn_in_()) throw new NotPorted('generate_faces: sn::create_faces');
    else if (bt_in()) {
      // bt::create_faces() (binary-tiling.cpp) only does something in 3D
      if (WDIM() === 3) throw new NotPorted('generate_faces: bt::create_faces');
    }
    else if (nil() && !mtwisted()) throw new NotPorted('generate_faces: nilv::create_faces');
  }

  prepare_basics(): void {

    // indenter_finish dif(debug_geometry, "prepare_basics");

    this.hexshift = 0;

    const ALPHA = TAU / S7();

    let fmin: number, fmax: number;

    let s3: number, beta: number;

    this.heptshape = null;

    this.xp_order = 0;

    if (arcm_in()) throw new NotPorted('prepare_basics: arcm::current.compute_geometry');

    this.emb = make_embed();
    const geuclid = euclid();
    const ghyperbolic = hyperbolic();

    if (arcm_in() && !mproduct())
      ginf[gArchimedean].g.kind = gcHyperbolic; // cclass is g.kind

    const gv = G.variation; // dynamicval<eVariation> gv(variation, variation);
    try {
      const inv = INVERSE();
      const specfake = special_fake();
      const unrect = UNRECTIFIED();
      if (INVERSE()) {
        G.variation = gp_variation_for(G.gp_param);
        // println(hlog, "bitruncated = ", BITRUNCATED);
      }

      let skip_to_hybrid_finish = false;
      if (mhybrid()) {
        throw new NotPorted('prepare_basics: hybrid');
      }

      if (!skip_to_hybrid_finish) {
        if (embedded_plane()) throw new NotPorted('prepare_basics: embedded plane (geom3::light_flip)');

        let goto_finish = false;
        if ((sphere() || hyperbolic()) && WDIM() === 3 && !bt_in()) {
          this.rhexf = this.hexf = 0.378077;
          this.crossf = this.hcrossf = 0.620672;
          this.tessf = 1.090550;
          this.hexhexdist = 0.566256;
          goto_finish = true;
        }

        if (!goto_finish) {
          s3 = S3();
          if (fake_in() && !arcm_in()) throw new NotPorted('prepare_basics: fake::around');

          beta = (S3() >= OINF && !fake_in()) ? 0 : TAU / s3;

          this.tessf = euclid() ? 1 : edge_of_triangle_with_angles(beta, M_PI / S7(), M_PI / S7());

          if (elliptic() && S7() === 4 && !fake_in()) this.tessf = deg(90);

          this.hcrossf = euclid() ? this.tessf / 2 / c_sin(M_PI / s3) : edge_of_triangle_with_angles(deg(90), M_PI / S7(), beta / 2);

          if (S3() >= OINF) this.hcrossf = 10;

          this.crossf = BITRUNCATED() ? this.hcrossf : this.tessf;

          fmin = 0; fmax = this.tessf;
          for (let p = 0; p < 100; p++) {
            const f = (fmin + fmax) / 2;
            const H = xpush0(f);
            const H1 = tmulh(spin(TAU / S7()), H);
            const H2 = xpush0(this.tessf - f);
            const v1 = intval(H, H1), v2 = intval(H, H2);

            if (fake_in() && WDIM() === 2) throw new NotPorted('prepare_basics: fake');

            if (v1 < v2) fmin = f; else fmax = f;
          }
          this.hexf = fmin;

          this.rhexf = BITRUNCATED() ? this.hexf : this.hcrossf;
          this.edgelen = hdist(xpush0(this.rhexf), xspinpush0(TAU / S7(), this.rhexf));

          if (BITRUNCATED() && !(S7() & 1))
            this.hexshift = ALPHA / 2 + ALPHA * ((S7() - 1) >> 1) + M_PI;
        }

        // finish:

        this.hexvdist = hdist(xpush0(this.hexf), xspinpush0(ALPHA / 2, this.hcrossf));

        this.hexhexdist = fake_in() ?
          2 * hdist0(mid(xspinpush0(M_PI / S6(), this.hexvdist), xspinpush0(-M_PI / S6(), this.hexvdist)))
          : hdist(xpush0(this.crossf), xspinpush0(TAU / S7(), this.crossf));

        if (specfake) throw new NotPorted('prepare_basics: special_fake');
        void unrect; void sin_auto; void asin_auto;

        // if(debug_geometry) println(hlog, ...)
      }

      // hybrid_finish:

      gp_compute_geometry(inv);
      irr_compute_geometry();
      if (arcm_in()) throw new NotPorted('prepare_basics: arcm');
      if (bt_in()) { this.hexvdist = this.rhexf = 1; this.tessf = 1; this.scalefactor = 1; this.crossf = hcrossf7; }
      if (G.geometry === gHoroRec || kite_in() || sol() || nil() || nih()) { this.hexvdist = this.rhexf = .5; this.tessf = .5; this.scalefactor = .5; this.crossf = hcrossf7 / 2; }
      if (bt_in()) throw new NotPorted('prepare_basics: bt (vid.binary_width)');

      this.generate_faces();

      this.scalefactor = this.crossf / hcrossf7;
      this.orbsize = this.crossf;

      if (fake_in() && WDIM() === 2) throw new NotPorted('prepare_basics: fake (2D)');
      if (fake_in() && WDIM() === 3) throw new NotPorted('prepare_basics: fake (3D)');
      if (arb_in()) throw new NotPorted('prepare_basics: arb::current_or_slided');

      // #if MAXMDIM >= 4: is_subcube_based(variation): scalefactor /= reg3::subcube_count
      if (is_subcube_based(G.variation)) throw new NotPorted('prepare_basics: subcubes');

      // meuclid && ghyperbolic, msphere && geuclid/ghyperbolic: vid.depth only matters with an embedded plane
      // (without one, mgclass == ggclass, so these combinations do not occur)
      void geuclid; void ghyperbolic;

      if (true) {
        this.scalefactor *= G.vid.creature_scale;
        this.orbsize *= G.vid.creature_scale;
      }

      this.zhexf = BITRUNCATED() ? this.hexf : this.crossf * .55;
      this.zhexf *= G.vid.creature_scale;
      if (WDIM() === 2 && GDIM() === 3) { this.zhexf *= 1.5; this.orbsize *= 1.2; }

      if (this.emb.is_euc_in_hyp()) throw new NotPorted('prepare_basics: euc_in_hyp');

      this.floorrad0 = this.hexvdist * (GDIM() === 3 ? 1 : 1 - 0.08 * G.global_boundary_ratio);
      this.floorrad1 = this.rhexf * (GDIM() === 3 ? 1 : 1 - 0.06 * G.global_boundary_ratio);

      if (euc_in(2, 4)) {
        if (!BITRUNCATED()) {
          const sca = (GDIM() === 3 ? 1 : .94);
          this.floorrad0 = this.hexvdist * sca;
          this.floorrad1 = this.rhexf * sca;
        }
        else {
          this.floorrad0 = this.hexvdist * (GDIM() === 3 ? 1 : .9);
          this.floorrad1 = this.rhexf * (GDIM() === 3 ? 1 : .8);
        }
      }

      G.hooks_scalefactor.callhooks(this);

      this.plevel = G.vid.plevel_factor * this.scalefactor;
      this.single_step = 1;
      if (mtwisted()) throw new NotPorted('prepare_basics: twisted (psl_steps)');

      set_sibling_limit();

      // geom3::light_flip(false);

      // #if CAP_BT && MAXMDIM >= 4: if(bt::in()) bt::build_tmatrix();
      if (bt_in()) throw new NotPorted('prepare_basics: bt::build_tmatrix');

      this.prepare_compute3();
      const currfp = fieldpattern_getcurrfp();
      if (hyperbolic() && currfp !== G.fieldpattern_fp_invalid)
        currfp.analyze();

      this.heptmove.length = S7();
      this.hexmove.length = S7();
      this.invhexmove.length = S7();

      for (let d = 0; d < S7(); d++)
        this.heptmove[d] = tmul(tmul(spin(-d * ALPHA), lxpush(this.tessf)), spin(M_PI));

      for (let d = 0; d < S7(); d++)
        this.hexmove[d] = tmul(tmul(spin(this.hexshift - d * ALPHA), lxpush(-this.crossf)), spin(M_PI));

      for (let d = 0; d < S7(); d++) this.invhexmove[d] = iso_inverse(this.hexmove[d]);

      gp_prepare_matrices(inv);

      // #if CAP_SOLV: asonov::prepare(), asonov::prepare_walls() (Arnold's cat, a later stage)
    }
    finally { G.variation = gv; }
  }
}

/** sn::in() (nonisotropic.cpp) */
function sn_in_(): boolean { return sol() || nih(); }


/** get_hsh(): the heptagon cell shape of 3D geometries (later stages) */
export function get_hsh(): never { throw new NotPorted('get_hsh (3D cell shapes)'); }
export function add_wall(_i: number, _h: hyperpoint[]): void { throw new NotPorted('add_wall (3D cell shapes)'); }

export function is_subcube_based(v: eVariationT): boolean {
  return among(v, eVariation.subcubes, eVariation.dual_subcubes, eVariation.bch, eVariation.bch_oct);
}

export function is_reg3_variation(v: eVariationT): boolean {
  return v === eVariation.coxeter;
}

export function special_fake(): boolean {
  if (!fake_in()) return false;
  if (BITRUNCATED()) return true;
  return (GOLDBERG() && S3() === 4 && G.gp_param[0] === 1 && G.gp_param[1] === 1) || (UNRECTIFIED() && G.gp_param[0] === 1 && G.gp_param[1] === 1);
}

// hooks_generate_faces, hooks_swapdim, hooks_scalefactor, hooks_cgi_string: G

// dim_listener *dl_list: only graphics listens (G.dl_list)

// namespace geom3
// Here we convert between the following parameters:
// abslev: level below the plane
// lev: level above the world (abslev = depth-lev)
// projection: projection parameter
// factor: zoom factor

export function geom3_abslev_to_projection(abslev: number): number {
  if (sphere() || euclid()) return G.vid.camera + abslev;
  return c_tanh(abslev) / c_tanh(G.vid.camera);
}

export function geom3_projection_to_abslev(proj: number): number {
  if (sphere() || euclid()) return proj - G.vid.camera;
  // tanh(abslev) / tanh(camera) = proj
  return c_atanh(proj * c_tanh(G.vid.camera));
}

export function geom3_lev_to_projection(lev: number): number {
  return geom3_abslev_to_projection(G.vid.depth - lev);
}

export function geom3_projection_to_factor(proj: number): number {
  return geom3_lev_to_projection(0) / proj;
}

export function geom3_factor_to_projection(fac: number): number {
  return geom3_lev_to_projection(0) / fac;
}

export function geom3_lev_to_factor(lev: number): number {
  if (mproduct()) return -lev;
  if (WDIM() === 3) return lev;
  if (GDIM() === 3) return G.vid.depth - lev;
  return geom3_projection_to_factor(geom3_lev_to_projection(lev));
}
export function geom3_factor_to_lev(fac: number): number {
  if (mproduct()) return -fac;
  if (WDIM() === 3) return fac;
  if (GDIM() === 3) return G.vid.depth - fac;
  return G.vid.depth - geom3_projection_to_abslev(geom3_factor_to_projection(fac));
}

export function geom3_to_wh(val: number): number {
  return geom3_factor_to_lev(val / geom3_actual_wall_height());
}

export function geom3_do_auto_eye(): void {
  if (!G.vid.auto_eye) return;
  const cs = G.vid.cs; // getcs(): the single player's charstyle
  if (cs.charid < 4)
    G.vid.eye = cgi().eyelevel_human;
  else if (cs.charid < 8)
    G.vid.eye = cgi().eyelevel_dog;
  else if (cs.charid === 8)
    G.vid.eye = cgi().eyelevel_familiar;
}

/** how should we scale at level lev */
export function geom3_scale_at_lev(lev: number): number {
  if (sphere() || euclid()) return 1;
  return c_cosh(G.vid.depth - lev);
}

// string invalid, bool changing_embedded_settings: G.geom3_invalid, G.geom3_changing_embedded_settings

export function geom3_actual_wall_height(): number {
  if (mhybrid()) return cgi().plevel;
  // #if CAP_GP
  if (GOLDBERG() && G.vid.gp_autoscale_heights)
    return G.vid.wall_height * Math.min(4 / hypot_d(2, G.gp_next), 1);
  return G.vid.wall_height;
}

/** geometry_information::prepare_compute3 */
function prepare_compute3(this: geometry_information): void {
  // indenter_finish dig(debug_geometry, "prepare_compute3");
  // tanh(depth) / tanh(camera) == pconf.alpha

  // geom3::flipped is false without an embedded plane
  if (GDIM() === 3 || G.geom3_changing_embedded_settings) { /* nothing */ }
  else adjust_linked();

  if (Math.abs(pconf().alpha) < 1e-6) G.geom3_invalid = XLAT('does not work with perfect Klein');

  if (G.geom3_invalid !== '') {
    this.INFDEEP = .7;
    this.DEEP = .8;
    this.HELLSPIKE = .85;
    this.SHALLOW = .9;
    this.WATERLEVEL = .95;
    this.FLOOR = 1;
    this.RED[0] = 1;
    this.RED[1] = 1.08;
    this.RED[2] = 1.16;
    this.RED[3] = 1.24;
    this.WALL = 1.25;

    this.FLATEYE = 1.03;
    this.LEG1 = 1.025;
    this.LEG = 1.05;
    this.LEG3 = 1.075;
    this.GROIN = 1.09;
    this.GROIN1 = 1.105;
    this.GHOST = 1.1;
    this.BODY = 1.15;
    this.BODY1 = 1.151;
    this.BODY2 = 1.152;
    this.BODY3 = 1.153;
    this.NECK1 = 1.16;
    this.NECK = 1.17;
    this.NECK3 = 1.18;
    this.HEAD = 1.188;
    this.HEAD1 = 1.189;
    this.HEAD2 = 1.190;
    this.HEAD3 = 1.191;
    this.ABODY = 1.08;
    this.AHEAD = 1.12;
    this.BIRD = 1.20;
    this.STUFF = 1;
    this.LOWSKY = this.SKY = this.HIGH = this.HIGH2 = this.STAR = 1;
  }
  else {
    const vid = G.vid;
    const lev_to_factor = geom3_lev_to_factor;
    const wh = geom3_actual_wall_height();
    this.WALL = lev_to_factor(wh);
    this.FLOOR = lev_to_factor(0);

    this.human_height = vid.human_wall_ratio * wh;
    if (WDIM() === 3) this.human_height = this.scalefactor * vid.height_width / 2;
    if (mhybrid()) this.human_height = Math.min(this.human_height, cgi().plevel * .9);

    let reduce = (WDIM() === 3 ? this.human_height / 2 : 0);

    this.LEG0 = lev_to_factor(this.human_height * .0 - reduce);
    this.LEG1 = lev_to_factor(this.human_height * .1 - reduce);
    this.LEG = lev_to_factor(this.human_height * .2 - reduce);
    this.LEG3 = lev_to_factor(this.human_height * .3 - reduce);
    this.GROIN = lev_to_factor(this.human_height * .4 - reduce);
    this.GROIN1 = lev_to_factor(this.human_height * .5 - reduce);
    this.BODY = lev_to_factor(this.human_height * .6 - reduce);
    this.BODY1 = lev_to_factor(this.human_height * .61 - reduce);
    this.BODY2 = lev_to_factor(this.human_height * .62 - reduce);
    this.BODY3 = lev_to_factor(this.human_height * .63 - reduce);
    this.NECK1 = lev_to_factor(this.human_height * .7 - reduce);
    this.NECK = lev_to_factor(this.human_height * .8 - reduce);
    this.NECK3 = lev_to_factor(this.human_height * .9 - reduce);
    this.HEAD = lev_to_factor(this.human_height * .97 - reduce);
    this.HEAD1 = lev_to_factor(this.human_height * .98 - reduce);
    this.HEAD2 = lev_to_factor(this.human_height * .99 - reduce);
    this.HEAD3 = lev_to_factor(this.human_height - reduce);

    reduce = (GDIM() === 3 ? this.human_height * .3 : 0);

    const sgn = vid.wall_height > 0 ? 1 : -1;
    if (cgi().emb.is_euc_in_noniso()) throw new NotPorted('prepare_compute3: euclid_embed_scale_mean');
    const ees = 1;

    this.STUFF = lev_to_factor(0) - sgn * Math.max(this.orbsize * ees * 0.3, this.zhexf * ees * .6);

    this.ABODY = lev_to_factor(this.human_height * .4 - reduce);
    this.ALEG0 = lev_to_factor(this.human_height * .0 - reduce);
    this.ALEG = lev_to_factor(this.human_height * .2 - reduce);
    this.AHEAD = lev_to_factor(this.human_height * .6 - reduce);
    this.BIRD = lev_to_factor(WDIM() === 3 ? 0 : (vid.human_wall_ratio + 1) / 2 * wh * .8);
    this.GHOST = lev_to_factor(WDIM() === 3 ? 0 : this.human_height * .5);
    this.FLATEYE = lev_to_factor(this.human_height * .15);

    this.slev = vid.rock_wall_ratio * wh / 3;
    for (let s = 0; s <= 3; s++)
      this.RED[s] = lev_to_factor(vid.rock_wall_ratio * wh * s / 3);
    this.WATERLEVEL = lev_to_factor(wh * -vid.lake_top);
    this.SHALLOW = lev_to_factor(wh * -vid.lake_shallow);
    this.HELLSPIKE = lev_to_factor(wh * -(vid.lake_top + vid.lake_bottom) / 2);
    this.DEEP = lev_to_factor(wh * -vid.lake_bottom);
    this.LOWSKY = lev_to_factor(vid.lowsky_height * wh);
    this.HIGH = lev_to_factor(vid.wall_height2 * wh);
    this.HIGH2 = lev_to_factor(vid.wall_height3 * wh);
    this.SKY = vid.sky_height === use_the_default_value ? cgi().emb.height_limit(-sgn) : lev_to_factor(vid.sky_height * wh);
    this.STAR = vid.star_height === use_the_default_value ? lerp(this.FLOOR, this.SKY, 0.95) : lev_to_factor(vid.star_height * wh);
    this.HELL = -this.SKY;
    if (embedded_plane())
      this.INFDEEP = vid.infdeep_height === use_the_default_value ? cgi().emb.height_limit(sgn) : lev_to_factor(vid.infdeep_height * wh);
    else
      this.INFDEEP = (euclid() || sphere()) ? 0.01 : geom3_lev_to_projection(0) * c_tanh(vid.camera);

    /* in spherical/cylindrical case, make sure that the high stuff does not go through the center */

    if (vid.height_limits) {
      const hp = cgi().emb.height_limit(1);
      const hn = cgi().emb.height_limit(-1);
      const adjust = (val: number, guide: number, lerpval: number): number => {
        if (val > hp)
          return lerp(guide, hp, lerpval);
        else if (val < hn)
          return lerp(guide, hn, lerpval);
        return val;
      };
      this.HIGH = adjust(this.HIGH, this.FLOOR, 0.8);
      this.HIGH2 = adjust(this.HIGH2, this.HIGH, 0.5);
      this.SKY = adjust(this.SKY, this.FLOOR, 1);
      this.STAR = adjust(this.STAR, this.FLOOR, 0.9);
      this.WATERLEVEL = adjust(this.WATERLEVEL, this.FLOOR, 0.8);
      this.SHALLOW = adjust(this.SHALLOW, this.WATERLEVEL, 0.9);
      this.DEEP = adjust(this.DEEP, this.SHALLOW, 0.5);
      this.INFDEEP = adjust(this.INFDEEP, this.FLOOR, 1);
    }
  }
}

/** constexpr ld use_the_default_value (hyper.h) */
export const use_the_default_value = -20.0625;

/** geom3::apply_settings_light: only does something with vid.always3 (3D, stage 3) */
export function geom3_apply_settings_light(): void {
  // #if MAXMDIM >= 4
  if (G.cgip && G.vid.always3) throw new NotPorted('geom3::apply_settings_light: switch_always3 (3D)');
}

// cgip, cgis: G

/** #define cgi (*cgip). check_cgi creates it; before that (the `map` scenario starts no game) cgi() creates the
 *  entry of the current geometry as check_cgi would. */
export function cgi(): geometry_information {
  if (!G.cgip) check_cgi();
  return G.cgip as geometry_information;
}

// last_texture_step: G

let ntimestamp = 0;

/** cgi_string(): the key of the current geometry's geometry_information. The parts of the original string for
 *  other geometries call their stub modules; the graphical settings it also includes (camera, wall heights,
 *  depth, line quality, ...) are fixed in stage 1 (the desktop defaults), so they are left out of the key: the
 *  key only selects a cache entry and is never shown. */
export function cgi_string(): string {
  let s = '';
  const V = (a: string, b: string): void => { s += a; s += ': '; s += b; s += '; '; };
  V('GEO', its(G.geometry));
  V('VAR', its(G.variation));

  if (arb_in()) throw new NotPorted('cgi_string: arb');
  if (fake_in()) throw new NotPorted('cgi_string: fake');
  if (GOLDBERG_INV()) {
    V('GP', its(G.gp_param[0]) + ',' + its(G.gp_param[1]) + ':' + its(G.gp_su));
  }
  if (G.variation === eVariation.irregular) throw new NotPorted('cgi_string: irr::irrid');
  if (arcm_in()) throw new NotPorted('cgi_string: arcm');
  if (mhybrid()) throw new NotPorted('cgi_string: hybrid');
  if (G.geometry === gFieldQuotient) { V('S3=', its(S3())); V('S7=', its(S7())); }

  G.hooks_cgi_string.callhooks(s);

  return s;
}

export function check_cgi(): void {
  const s = cgi_string();

  let gi = G.cgis.get(s) as geometry_information | undefined;
  if (!gi) { gi = new geometry_information(); G.cgis.set(s, gi); }
  G.cgip = gi;
  gi.timestamp = ++ntimestamp;
  // hybrid / fake / arcm alternative cgips: later stages

  let limit = 3;
  for (const t of G.cgis.values()) if ((t as geometry_information).use_count || (t as geometry_information).timestamp === ntimestamp) limit++;
  if (G.cgis.size > limit) {
    const timestamps: [number, string][] = [];
    for (const [k, t] of G.cgis) if (!(t as geometry_information).use_count) timestamps.push([-(t as geometry_information).timestamp, k]);
    timestamps.sort((a, b) => a[0] !== b[0] ? a[0] - b[0] : (a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0));
    while (timestamps.length > limit && timestamps[timestamps.length - 1][0] !== -ntimestamp) {
      G.cgis.delete(timestamps[timestamps.length - 1][1]);
      timestamps.pop();
    }
  }

  // floor_textures (graphics): left out
}

/** propagate_scale_change(): only hybrid / fake geometries have alternative cgips */
export function propagate_scale_change(): void {
  if (mhybrid()) throw new NotPorted('propagate_scale_change: hybrid');
  if (fake_in()) throw new NotPorted('propagate_scale_change: fake');
}

// (P8's check_cgi stub, added while P1b ported this file, is replaced by the real check_cgi above)
