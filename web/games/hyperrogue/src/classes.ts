// classes.cpp of HyperRogue 13.1o, the parts that are not content: the geometries (eGeometry, ginf, the
// geometry macros of hyper.h as functions), eVariation, land_tac, genderswitch, the NOWALLSEP markers.
// The content tables (minf, iinf, winf, linf and their enums) are generated into content.ts.
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// ginf, the gi* geometryinfo1 values and land_tac are module exports here, not fields of G: they are only mutated
// in place (ginf[g].distlimit, ...), never reassigned, and keeping them here keeps globals.ts free of an import
// cycle. The macros of hyper.h (S7, euclid, PURE, ...) are functions: `if(euclid)` -> `if (euclid())`.
// The top level of this module uses only its own constants, content.ts and hyper.ts; G only inside functions.
import { G } from './globals.ts';
import {
  type eItem, type eLand, type eMonster, type flagtype, moFalsePrincess, moRoseLady, moRoseBeauty, moRusalka,
  laNone, laMountain, laHauntedWall, laWhirlpool, laBarrier, laOceanWall, laClearing, laPrincessQuest,
  laIce, laDesert, laHunting, laMotion, laCaves, laAlchemist, laJungle, laMirror, laZebra, laPalace, laOcean,
  laLivefjord, laWarpCoast, laRlyeh, laHell, laDryForest, laWineyard, laSwitch, laReptile, laDeadCaves,
  laGraveyard, laHaunted, laIvoryTower, laEndorian, laDungeon, laRuins, laEmerald, laCocytus, laCaribbean,
  laKraken, laTemple, laMinefield, laPower, laHive, laRedRock, laStorms, laOvergrown, laWhirlwind, laBlizzard,
  laRose, laVolcano, laDragon, laTortoise, laBurial, laElementalWall, laTrollheim, laPrairie, laBull,
  laTerracotta, laDice, laCursed, laCrossroads, laCrossroads2, laCrossroads3, laCrossroads4, laCrossroads5,
  laCrossroads6, laMasterCrossroads, laCamelot, laWildWest, laDual, laSnakeNest, laDocks, laBrownian, laVariant,
  laWestWall, laWet, laFrog, laEclectic,
} from './content.ts';
import { Flag, GEN_F, GEN_M } from './hyper.ts';
import { late } from './locations.ts';
import { bt_in } from './binary-tiling.ts';
import { arcm_in } from './archimedean.ts';
import { arb_in } from './arbitrile.ts';

// --- genderswitch ---

export const NUM_GS = 8;

/** struct genderswitch_t */
export interface genderswitch_t {
  gender: number;
  m: eMonster;
  name: string;
  desc: string;
}

export const genderswitch: genderswitch_t[] = [
  { gender: GEN_F, m: moFalsePrincess, name: 'False Princess',
    desc: "Don't be fooled by this red-haired girl, or you will be stabbed if you come too close!" },
  { gender: GEN_M, m: moFalsePrincess, name: 'False Prince',
    desc: "Don't be fooled by this red-haired boy, or you will be stabbed if you come too close!" },
  { gender: GEN_F, m: moRoseLady, name: 'Rose Lady',
    desc: 'This false princess is immune to the alluring scent of roses.' },
  { gender: GEN_M, m: moRoseLady, name: 'Rose Lord',
    desc: 'This false prince is immune to the alluring scent of roses.' },
  { gender: GEN_F, m: moRoseBeauty, name: 'Rose Beauty',
    desc: 'She has flowers in her long fair hair. You could not bring yourself to attack such a beautiful woman.' },
  { gender: GEN_M, m: moRoseBeauty, name: 'Handsome Gardener',
    desc: 'Tall, strong, and holding a flower in his hand. You could ' +
      'not bring yourself to attack such a handsome man.' },
  { gender: GEN_F, m: moRusalka, name: 'Rusałka',
    desc: 'A malicious water being. When you kill her, she changes the tile you are standing on, from land to shallow water, or from shallow water to deep water.' },
  { gender: GEN_M, m: moRusalka, name: 'Topielec',
    desc: 'A malicious water being. When you kill him, he changes the tile you are standing on, from land to shallow water, or from shallow water to deep water.' },
];

// --- land_tac ---

/** struct landtacinfo */
export interface landtacinfo { l: eLand; tries: number; multiplier: number; }

const lt = (l: eLand, tries: number, multiplier: number): landtacinfo => ({ l, tries, multiplier });

export const land_tac: landtacinfo[] = [
  lt(laIce, 10, 1), lt(laDesert, 10, 1),
  lt(laHunting, 5, 2),
  lt(laMotion, 10, 1), lt(laCaves, 10, 1), lt(laAlchemist, 10, 1),
  lt(laJungle, 10, 1), lt(laMirror, 10, 1), lt(laZebra, 10, 1), lt(laPalace, 10, 1),
  lt(laOcean, 10, 1), lt(laLivefjord, 10, 1), lt(laWarpCoast, 10, 1), lt(laRlyeh, 10, 1), lt(laHell, 10, 1),
  lt(laDryForest, 10, 1), lt(laWineyard, 10, 1), lt(laSwitch, 10, 1), lt(laReptile, 10, 1),
  lt(laDeadCaves, 10, 1), lt(laGraveyard, 10, 1),
  lt(laHaunted, 10, 1),
  lt(laIvoryTower, 10, 1), lt(laEndorian, 10, 1), lt(laMountain, 5, 2), lt(laDungeon, 5, 2),
  lt(laRuins, 10, 1), lt(laEmerald, 10, 1),
  lt(laCocytus, 10, 1),

  lt(laCaribbean, 5, 2), lt(laWhirlpool, 5, 2), lt(laKraken, 5, 2),
  lt(laTemple, 5, 2), lt(laMinefield, 5, 2),
  lt(laPower, 5, 2), lt(laHive, 5, 2), lt(laRedRock, 5, 2), lt(laStorms, 5, 2), lt(laOvergrown, 5, 2),
  lt(laClearing, 5, 2),
  lt(laWhirlwind, 5, 2),
  lt(laBlizzard, 10, 1),
  lt(laRose, 5, 2), lt(laVolcano, 10, 1), lt(laDragon, 2, 5), lt(laTortoise, 1, 10),
  lt(laBurial, 5, 2),
  lt(laElementalWall, 10, 1), lt(laTrollheim, 5, 2),
  lt(laPrairie, 5, 2), lt(laBull, 5, 2), lt(laTerracotta, 10, 1),
  lt(laDice, 5, 2), lt(laCursed, 5, 2),

  lt(laCrossroads, 10, 1), lt(laCrossroads2, 10, 1), lt(laCrossroads3, 10, 1), lt(laCrossroads4, 10, 1), lt(laCrossroads5, 5, 2),
  lt(laCrossroads6, 10, 1), lt(laMasterCrossroads, 10, 1),

  lt(laCamelot, 1, 100),
  lt(laWildWest, 10, 1),
  lt(laDual, 10, 1),
  lt(laSnakeNest, 10, 1),
  lt(laDocks, 10, 1),

  lt(laBrownian, 10, 1),
  lt(laVariant, 10, 1),
  lt(laWestWall, 10, 1),
  lt(laWet, 10, 1), lt(laFrog, 10, 1), lt(laEclectic, 10, 1),
];

// (randlands is G.randlands, globals.ts)

// --- geometries ---

/** enum eGeometry */
export type eGeometry = number;
export const gNormal = 0, gEuclid = 1, gSphere = 2, gElliptic = 3, gZebraQuotient = 4, gFieldQuotient = 5, gTorus = 6;
export const gOctagon = 7, g45 = 8, g46 = 9, g47 = 10, gSmallSphere = 11, gTinySphere = 12, gEuclidSquare = 13;
export const gSmallElliptic = 14, gKleinQuartic = 15, gBolza = 16, gBolza2 = 17, gMinimal = 18, gBinaryTiling = 19;
export const gArchimedean = 20, gMacbeath = 21, gBring = 22, gSchmutzM2 = 23, gSchmutzM3 = 24, gCrystal = 25;
export const gOctahedron = 26, gBinary3 = 27, gCubeTiling = 28, gCell120 = 29, gECell120 = 30, gRhombic3 = 31;
export const gBitrunc3 = 32, gSpace534 = 33, gSpace435 = 34, gCell5 = 35, gCell16 = 36, gECell16 = 37, gCell8 = 38;
export const gECell8 = 39, gCell24 = 40, gECell24 = 41, gCell600 = 42, gECell600 = 43, gHoroTris = 44, gHoroRec = 45;
export const gHoroHex = 46, gField435 = 47, gField534 = 48, gBinary4 = 49, gSol = 50, gKiteDart2 = 51, gKiteDart3 = 52;
export const gNil = 53, gProduct = 54, gTwistedProduct = 55, gTernary = 56, gNIH = 57, gSolN = 58, gInfOrder = 59;
export const gSpace336 = 60, gSpace344 = 61, gCrystal344 = 62, gArnoldCat = 63, gArbitrary = 64, gInfOrder4 = 65;
export const gCrystal534 = 66, gSpace535 = 67, gSpace536 = 68, gSeifertCover = 69, gSeifertWeber = 70, gHomologySphere = 71;
export const gInfOrderMixed = 72, gSpace436 = 73, gFake = 74, gSpace345 = 75, gSpace353 = 76, gSpace354 = 77;
export const gSpace355 = 78, gHalfBring = 79, gAperiodicHat = 80, gSierpinski3 = 81, gSierpinski4 = 82, gSixFlake = 83;
export const gMengerSponge = 84, gSierpinskiTet = 85, gAperiodicSpectre = 86, gOctTet3 = 87, gGUARD = 88;

/** enum eGeometryClass */
export type eGeometryClass = number;
export const gcHyperbolic = 0, gcEuclid = 1, gcSphere = 2, gcSol = 3, gcNIH = 4, gcSolN = 5, gcNil = 6, gcProduct = 7, gcSL2 = 8;

/** enum class eVariation: eVariation::pure -> eVariation.pure */
export const eVariation = {
  bitruncated: 0, pure: 1, goldberg: 2, irregular: 3, dual: 4, untruncated: 5, warped: 6, unrectified: 7,
  subcubes: 8, coxeter: 9, dual_subcubes: 10, bch: 11, bch_oct: 12,
} as const;
export type eVariation = number;

export type modecode_t = number;

/** only the actual geometry */
export interface geometryinfo1 {
  /** geometry class */
  kind: eGeometryClass;
  /** dimension of the gameplay (2 for crystal) */
  gameplay_dimension: number;
  /** dimension of the graphics, may be greater than gameplay_dimension with vid.always3 on */
  graphical_dimension: number;
  /** dimension of the homogeneous vector space used, usually graphical_dimension+1, but 3 in product */
  homogeneous_dimension: number;
  /** signature of the scalar product used */
  sig: number[];
}

export interface geometryinfo {
  tiling_name: string;
  quotient_name: string;
  menu_displayed_name: string;
  shortname: string;
  sides: number;
  vertex: number;
  flags: flagtype;
  g: geometryinfo1;
  /** bitrunc, non-bitrunc */
  distlimit: number[];
  default_variation: eVariation;
}

export const qCLOSED: flagtype = 1n;
export const qANYQ: flagtype = 2n;
export const qNONORIENTABLE: flagtype = 4n;
export const qSMALL: flagtype = 8n;

export const qFIELD: flagtype = 16n;
export const qDOCKS: flagtype = 32n;
export const qZEBRA: flagtype = 64n;

export const qELLIPTIC: flagtype = 128n;

export const qBINARY: flagtype = 256n;
export const qKITE: flagtype = 512n;

export const qREGULAR: flagtype = 1024n; /* not set! */
export const qARCHI: flagtype = 2048n;
export const qHYBRID: flagtype = 4096n;
export const qCRYSTAL: flagtype = 8192n;
export const qSOL: flagtype = 16384n;
export const qEXPERIMENTAL: flagtype = 32768n;
export const qNIH: flagtype = 65536n;

export const qIDEAL: flagtype = 131072n;
export const qHUGE_BOUNDED: flagtype = 262144n;
export const qOPTQ = Flag(19);
export const qSINGLE = Flag(20);

export const qDEPRECATED = Flag(21);
export const qINFMIXED = Flag(22);

export const qRAYONLY = Flag(23);
export const qAFFINE = Flag(24);

export const qULTRA = Flag(25);

export const qPORTALSPACE = Flag(26);

export const qSTRETCHABLE = Flag(27);

export const qCAT = Flag(28);

export const qAPERIODIC = Flag(29);
export const qHAT = Flag(30);

export const qFRACTAL = Flag(31);

// note: dnext assumes that x&7 equals 7
export const SEE_ALL = 50;
// note: check_football_colorability in arbitrile.cpp assumes OINF is divisible by 3
export const OINF = 123;

export const qsNONOR = qANYQ | qSMALL | qCLOSED | qNONORIENTABLE;
export const qsNONORE = qsNONOR | qELLIPTIC;
export const qsBQ = qANYQ | qSMALL | qCLOSED;
export const qsSMALL = qANYQ | qSMALL | qCLOSED;
export const qsSMALLN = qANYQ | qSMALL | qCLOSED | qNONORIENTABLE;
export const qsZEBRA = qANYQ | qSMALL | qCLOSED | qZEBRA;
export const qsFIELD = qANYQ | qFIELD | qCLOSED;
export const qsDOCKS = qANYQ | qSMALL | qCLOSED | qDOCKS;
export const qsSMALLB = qSMALL | qCLOSED;
export const qsSMALLBF = qsSMALLB | qsFIELD | qANYQ;
export const qsSMALLBE = qsSMALLB | qELLIPTIC | qANYQ;
export const qsBP = qBINARY | qKITE;

export const qsSINGLE = qANYQ | qSMALL | qCLOSED | qSINGLE;

const gi1 = (kind: eGeometryClass, gd: number, grd: number, hd: number, sig: number[]): geometryinfo1 =>
  ({ kind, gameplay_dimension: gd, graphical_dimension: grd, homogeneous_dimension: hd, sig });

export const giEuclid2 = gi1(gcEuclid, 2, 2, 3, [1, 1, 0, 0]);
export const giHyperb2 = gi1(gcHyperbolic, 2, 2, 3, [1, 1, -1, 0]);
export const giSphere2 = gi1(gcSphere, 2, 2, 3, [1, 1, +1, 0]);

export const giEuclid3 = gi1(gcEuclid, 3, 3, 4, [1, 1, 1, 0]);
export const giHyperb3 = gi1(gcHyperbolic, 3, 3, 4, [1, 1, 1, -1]);
export const giSphere3 = gi1(gcSphere, 3, 3, 4, [1, 1, 1, +1]);

export const giSol = gi1(gcSol, 3, 3, 4, [1, 1, 1, 0]);
export const giNIH = gi1(gcNIH, 3, 3, 4, [1, 1, 1, 0]);
export const giSolN = gi1(gcSolN, 3, 3, 4, [1, 1, 1, 0]);

export const giNil = gi1(gcNil, 3, 3, 4, [1, 1, 1, 0]);
export const giProductH = gi1(gcProduct, 3, 3, 3, [1, 1, -1, 0]);
export const giProductS = gi1(gcProduct, 3, 3, 3, [1, 1, 1, 0]);
/** will be filled in product::configure() */
export const giProduct = gi1(gcProduct, 3, 3, 3, [1, 1, 1, 0]);
export const giSL2 = gi1(gcSL2, 3, 3, 4, [1, 1, -1, -1]);

export const no_code: modecode_t = 0x1;

/** one entry of ginf; C++ copies the geometryinfo1 into the entry (a struct member), so the port copies too */
function gi(tiling_name: string, quotient_name: string, menu_displayed_name: string, shortname: string,
  sides: number, vertex: number, flags: flagtype, g: geometryinfo1, distlimit: number[], default_variation: eVariation): geometryinfo {
  return {
    tiling_name, quotient_name, menu_displayed_name, shortname, sides, vertex, flags,
    g: { ...g, sig: [...g.sig] }, distlimit, default_variation,
  };
}

/** list of available geometries */
export const ginf: geometryinfo[] = [
  gi('{7,3}', 'none', '{7,3} (standard HyperRogue map)', 'HR', 7, 3, 0n, giHyperb2, [7, 5], eVariation.bitruncated),
  gi('{6,3}', 'none', '{6,3} (euclidean Hex grid)', 'euclid', 6, 3, qOPTQ, giEuclid2, [7, 7], eVariation.bitruncated),
  gi('{5,3}', 'none', '{5,3} (dodecahedron)', 'sphere', 5, 3, qsSMALLB, giSphere2, [SEE_ALL, SEE_ALL], eVariation.bitruncated),
  gi('{5,3}', 'elliptic', 'elliptic geometry in {5,3}', 'elliptic', 5, 3, qsNONORE, giSphere2, [SEE_ALL, SEE_ALL], eVariation.bitruncated),
  gi('{7,3}', 'Zebra', 'Zebra quotient', 'Zebra', 7, 3, qsZEBRA, giHyperb2, [7, 5], eVariation.bitruncated),
  gi('{7,3}', 'field', 'field quotient', 'field', 7, 3, qsFIELD, giHyperb2, [7, 5], eVariation.bitruncated),
  gi('{6,3}', 'torus', 'torus/Klein bottle/...', 'torus', 6, 3, qsBQ | qDEPRECATED, giEuclid2, [7, 7], eVariation.bitruncated),
  gi('{8,3}', 'none', '{8,3} (like standard but with octagons)', 'oct', 8, 3, 0n, giHyperb2, [6, 4], eVariation.bitruncated),
  gi('{5,4}', 'none', '{5,4} (four pentagons)', '4x5', 5, 4, 0n, giHyperb2, [6, 4], eVariation.bitruncated),
  gi('{6,4}', 'none', '{6,4} (four hexagons)', '4x6', 6, 4, 0n, giHyperb2, [5, 3], eVariation.bitruncated),
  gi('{7,4}', 'none', '{7,4} (four heptagons)', '4x7', 7, 4, 0n, giHyperb2, [4, 3], eVariation.bitruncated),
  gi('{4,3}', 'none', '{4,3} (cube)', '3x4', 4, 3, qsSMALLB, giSphere2, [SEE_ALL, SEE_ALL], eVariation.bitruncated),
  gi('{3,3}', 'none', '{3,3} (tetrahedron)', '3x3', 3, 3, qsSMALLB, giSphere2, [SEE_ALL, SEE_ALL], eVariation.bitruncated),
  gi('{4,4}', 'none', '{4,4} (Euclidean square grid)', '4x4', 4, 4, qOPTQ, giEuclid2, [7, 7], eVariation.bitruncated),
  gi('{4,3}', 'elliptic', 'elliptic geometry in {4,3}', 'e3x4', 4, 3, qsNONORE, giSphere2, [SEE_ALL, SEE_ALL], eVariation.bitruncated),
  gi('{7,3}', 'Klein', 'Klein Quartic', 'Klein', 7, 3, qsSMALL, giHyperb2, [7, 5], eVariation.bitruncated),
  gi('{8,3}', 'Bolza', 'Bolza Surface', 'Bolza', 8, 3, qsDOCKS, giHyperb2, [6, 4], eVariation.bitruncated),
  gi('{8,3}', 'Bolza2', 'Bolza Surface x2', 'Bolza2', 8, 3, qsDOCKS, giHyperb2, [6, 4], eVariation.bitruncated),
  gi('{7,3}', 'minimal', 'minimal quotient', 'minimal', 7, 3, qsSMALLN, giHyperb2, [7, 5], eVariation.bitruncated),
  gi('binary', 'none', 'variant of the binary tiling', 'binary', 7, 3, qBINARY, giHyperb2, [7, 5], eVariation.pure),
  gi('Arch', 'none', 'Archimedean', 'A', 7, 3, qARCHI, giHyperb2, [7, 5], eVariation.pure),
  gi('{7,3}', 'Macbeath', 'Macbeath Surface', 'Macbeath', 7, 3, qsSMALL, giHyperb2, [7, 5], eVariation.bitruncated),
  gi('{5,4}', 'Bring', "Bring's Surface", 'Bring', 5, 4, qsSMALL, giHyperb2, [6, 4], eVariation.bitruncated),
  gi('{12,3}', 'M3', "Schmutz's M(3)", 'M3', 12, 3, qsSMALL, giHyperb2, [4, 2], eVariation.bitruncated),
  gi('{12,3}', 'M4', "Schmutz's M(4)", 'M4', 12, 3, qsSMALL, giHyperb2, [4, 2], eVariation.bitruncated),
  gi('{6,4}', 'Crystal', 'dimensional crystal', 'Crystal', 6, 4, qANYQ | qCRYSTAL, giHyperb2, [5, 3], eVariation.pure),
  gi('{3,4}', 'none', '{3,4} (octahedron)', '4x3', 3, 4, qsSMALLB, giSphere2, [SEE_ALL, SEE_ALL], eVariation.bitruncated),
  gi('bin{4,4}', 'none', '{4,4} on horospheres', 'bin44', 9, 3, qBINARY, giHyperb3, [7, 3], eVariation.pure),
  gi('{4,3,4}', 'none', '{4,3,4} cube tiling', '434', 6, 4, qOPTQ, giEuclid3, [7, 5], eVariation.pure),
  gi('{5,3,3}', 'none', '{5,3,3} 120-cell', '533', 12, 3, qsSMALLB | qSTRETCHABLE, giSphere3, [SEE_ALL, SEE_ALL], eVariation.pure),
  gi('{5,3,3}', 'elliptic', '{5,3,3} 120-cell (elliptic space)', 'e533', 12, 3, qsSMALLBE | qSTRETCHABLE, giSphere3, [SEE_ALL, SEE_ALL], eVariation.pure),
  gi('rh{4,3,4}', 'none', 'rhombic dodecahedral honeycomb', 'rh434', 12, 3, qOPTQ, giEuclid3, [7, 5], eVariation.pure),
  gi('2t{4,3,4}', 'none', 'bitruncated cubic honeycomb', '2t434', 14, 3, qOPTQ, giEuclid3, [7, 5], eVariation.pure),
  gi('{5,3,4}', 'none', '{5,3,4} hyperbolic honeycomb', '534', 12, 4, 0n, giHyperb3, [7, 2], eVariation.pure),
  gi('{4,3,5}', 'none', '{4,3,5} hyperbolic honeycomb', '435', 6, 5, 0n, giHyperb3, [7, 2], eVariation.pure),
  gi('{3,3,3}', 'none', '{3,3,3} 5-cell', '333', 4, 3, qsSMALLB, giSphere3, [SEE_ALL, SEE_ALL], eVariation.pure),
  gi('{3,3,4}', 'none', '{3,3,4} 16-cell', '334', 4, 4, qsSMALLB, giSphere3, [SEE_ALL, SEE_ALL], eVariation.pure),
  gi('{3,3,4}', 'elliptic', '{3,3,4} 16-cell (elliptic space)', 'e334', 4, 4, qsSMALLBE, giSphere3, [SEE_ALL, SEE_ALL], eVariation.pure),
  gi('{4,3,3}', 'none', '{4,3,3} 8-cell', '433', 6, 4, qsSMALLB | qSTRETCHABLE, giSphere3, [SEE_ALL, SEE_ALL], eVariation.pure),
  gi('{4,3,3}', 'elliptic', '{4,3,3} 8-cell (elliptic space)', 'e433', 6, 4, qsSMALLBE | qSTRETCHABLE, giSphere3, [SEE_ALL, SEE_ALL], eVariation.pure),
  gi('{3,4,3}', 'none', '{3,4,3} 24-cell', '343', 8, 3, qsSMALLB | qSTRETCHABLE, giSphere3, [SEE_ALL, SEE_ALL], eVariation.pure),
  gi('{3,4,3}', 'elliptic', '{3,4,3} 24-cell (elliptic space)', 'e343', 8, 3, qsSMALLBE | qSTRETCHABLE, giSphere3, [SEE_ALL, SEE_ALL], eVariation.pure),
  gi('{3,3,5}', 'none', '{3,3,5} 600-cell', '335', 4, 3, qsSMALLB, giSphere3, [SEE_ALL, SEE_ALL], eVariation.pure),
  gi('{3,3,5}', 'elliptic', '{3,3,5} 600-cell (elliptic space)', 'e335', 4, 3, qsSMALLBE, giSphere3, [SEE_ALL, SEE_ALL], eVariation.pure),
  gi('bin{3,6}', 'none', '{3,6} on horospheres', 'bin36', 8, 3, qBINARY, giHyperb3, [7, 3], eVariation.pure),
  gi('bin-rect', 'none', 'rectangles on horospheres', 'bin44/2', 7, 3, qBINARY, giHyperb3, [7, 3], eVariation.pure),
  gi('bin{6,3}', 'none', '{6,3} on horospheres', 'bin63', 14, 3, qBINARY, giHyperb3, [7, 3], eVariation.pure),
  gi('{4,3,5}', 'field', '{4,3,5} field quotient space', 'f435', 6, 5, qsSMALLBF | qDEPRECATED, giHyperb3, [SEE_ALL, SEE_ALL], eVariation.pure),
  gi('{5,3,4}', 'field', '{5,3,4} field quotient space', 'f435', 12, 4, qsSMALLBF | qDEPRECATED, giHyperb3, [SEE_ALL, SEE_ALL], eVariation.pure),
  gi('binary4', 'none', 'standard binary tiling', 'binary4', 5, 3, qBINARY, giHyperb2, [7, 5], eVariation.pure),
  gi('sol', 'none', 'Solv geometry', 'sol', 8, 3, qBINARY | qSOL, giSol, [7, 5], eVariation.pure),
  gi('kd2', 'none', 'kite-and-dart', 'kd2', 4, 3, qKITE | qAPERIODIC, giEuclid2, [7, 7], eVariation.pure),
  gi('kd3', 'none', 'kite-and-dart on horospheres', 'kd3', 12, 3, qsBP, giHyperb3, [7, 3], eVariation.pure),
  gi('nil', 'none', 'Nil geometry', 'nil', 6, 3, qOPTQ, giNil, [7, 5], eVariation.pure),
  gi('product', 'none', 'product space', 'product', 7, 3, qHYBRID, giProduct, [7, 3], eVariation.pure),
  gi('twisted', 'none', 'twisted product space', 'twisted', 7, 3, qHYBRID, giSL2, [6, 4], eVariation.pure),
  gi('ternary', 'none', 'standard ternary tiling', 'ternary', 6, 3, qBINARY, giHyperb2, [6, 4], eVariation.pure),
  gi('3x2', 'none', 'stretched hyperbolic', '3:2', 11, 3, qBINARY | qNIH, giNIH, [6, 3], eVariation.pure),
  gi('3x1/2', 'none', 'stretched Solv', '3:1/2', 9, 3, (qBINARY | qSOL | qNIH), giSolN, [7, 3], eVariation.pure),
  gi('{3,oo}', 'none', '{3,∞} (infinite triangles)', 'oox3', 3, OINF, qIDEAL, giHyperb2, [7, 7], eVariation.pure),
  gi('{3,3,6}', 'none', '{3,3,6} hyperbolic honeycomb', '336', 4, 6, qIDEAL, giHyperb3, [7, 2], eVariation.pure),
  gi('{3,4,4}', 'none', '{3,4,4} hyperbolic honeycomb', '344', 8, 4, qIDEAL, giHyperb3, [7, 2], eVariation.pure),
  gi('{3,4,4}', 'Crystal', '4D crystal in H3', 'Cryst3', 8, 4, qIDEAL | qANYQ | qCRYSTAL, giHyperb3, [7, 3], eVariation.pure),
  gi('cat', 'cat', "Arnold's cat mapping torus", 'cat', 12, 3, qBINARY | qSOL | qsBQ | qOPTQ | qCAT, giSol, [6, 4], eVariation.pure),
  gi('file', 'none', 'load from file', 'file', 7, 3, 0n, giEuclid2, [7, 5], eVariation.pure),
  gi('{4,oo}', 'none', '{4,∞} (infinite squares)', 'oox4', 4, OINF, qIDEAL, giHyperb2, [5, 5], eVariation.pure),
  gi('{5,3,4}', 'Crystal', '6D crystal in H3', 'Cryst6', 12, 4, qANYQ | qCRYSTAL, giHyperb3, [7, 3], eVariation.pure),
  gi('{5,3,5}', 'none', '{5,3,5} hyperbolic honeycomb', '535', 12, 5, 0n, giHyperb3, [7, 2], eVariation.pure),
  gi('{5,3,6}', 'none', '{5,3,6} hyperbolic honeycomb', '536', 12, 6, qIDEAL, giHyperb3, [7, 2], eVariation.pure),
  gi('{5,3,5}', 'SWh', '{5,3,5} quotient', '535c', 12, 5, qsSMALLB | qANYQ, giHyperb3, [7, 2], eVariation.pure),
  gi('{5,3,5}', 'SW', 'Seifert-Weber space', '535s', 12, 5, qsSINGLE, giHyperb3, [7, 2], eVariation.pure),
  gi('{5,3,3}', 'SW', 'Poincaré homology sphere', '533s', 12, 3, qsSINGLE, giSphere3, [7, 2], eVariation.pure),
  gi('{?,oo}', 'none', '{3/4,∞} (infinite triangles and squares)', 'ooxm', 3, OINF, qIDEAL | qINFMIXED, giHyperb2, [6, 6], eVariation.pure),
  gi('{4,3,6}', 'none', '{4,3,6} hyperbolic honeycomb', '436', 6, 6, qIDEAL, giHyperb3, [7, 2], eVariation.pure),
  gi('?', 'none', 'fake', '', 0, 0, qRAYONLY, giHyperb3, [7, 2], eVariation.pure),
  gi('{3,4,5}', 'none', '{3,4,5} hyperbolic honeycomb', '345', 8, 5, qIDEAL | qULTRA, giHyperb3, [7, 2], eVariation.pure),
  gi('{3,5,3}', 'none', '{3,5,3} hyperbolic honeycomb', '353', 20, 5, 0n, giHyperb3, [7, 2], eVariation.pure),
  gi('{3,5,4}', 'none', '{3,5,4} hyperbolic honeycomb', '354', 20, 5, qIDEAL | qULTRA, giHyperb3, [7, 2], eVariation.pure),
  gi('{3,5,5}', 'none', '{3,5,5} hyperbolic honeycomb', '355', 20, 5, qIDEAL | qULTRA, giHyperb3, [7, 2], eVariation.pure),
  gi('{5,4}', 'pBring', "projective Bring's Surface", 'pBring', 5, 4, qsSMALLN, giHyperb2, [6, 4], eVariation.bitruncated),
  gi('hat', 'none', 'aperiodic hat', 'hat', 14, 3, qAPERIODIC | qHAT, giEuclid2, [7, 7], eVariation.pure),
  gi('triangle', 'none', 'Sierpiński triangle', 'S3', 6, 3, qFRACTAL, giEuclid2, [10, 10], eVariation.pure),
  gi('carpet', 'none', 'Sierpiński carpet', 'S4', 4, 4, qFRACTAL, giEuclid2, [10, 10], eVariation.pure),
  gi('6-flake', 'none', '6-flake fractal', 'S6', 6, 3, qFRACTAL, giEuclid2, [10, 10], eVariation.pure),
  gi('{4,3,4}', 'none', 'Menger sponge', 'S8', 6, 4, qFRACTAL, giEuclid3, [10, 10], eVariation.pure),
  gi('rh{4,3,4}', 'none', 'Sierpiński tetrahedron', 'S4b', 12, 3, qFRACTAL, giEuclid3, [10, 10], eVariation.pure),
  gi('spectre', 'none', 'aperiodic spectre', 'spectre', 14, 3, qAPERIODIC | qHAT, giEuclid2, [7, 7], eVariation.pure),
  gi('ot{4,3,4}', 'none', 'octahedral-tetrahedral honeycomb', 'ot434', 8, 3, qOPTQ, giEuclid3, [7, 5], eVariation.pure),
];
// bits: 9, 10, 15, 16, (reserved for later) 17, 18

// mdinf (the list of models, i.e. projections), eModel and namespace mf: graphics, a later stage.

export function orbProtection(_it: eItem): boolean { return false; } // not implemented

// these markers use lands which never appear on barrier sides

export const NOWALLSEP: eLand = laNone;
export const NOWALLSEP_SWAP: eLand = laMountain;
export const NOWALLSEP_WALL: eLand = laHauntedWall;
export const NOWALLSEP_USED: eLand = laWhirlpool;
export const NOWALLSEP_WALL_CPOS: eLand = laBarrier;
export const NOWALLSEP_WALL_CNEG: eLand = laOceanWall;
export const NOWALLSEP_WALL_EPOS: eLand = laClearing;
export const NOWALLSEP_WALL_ENEG: eLand = laPrincessQuest;

// --- the geometry macros of hyper.h ---

/** #define cginf ginf[geometry] */
export function cginf(): geometryinfo { return ginf[G.geometry]; }
/** #define S7 cginf.sides */
export function S7(): number { return ginf[G.geometry].sides; }
/** #define S3 cginf.vertex */
export function S3(): number { return ginf[G.geometry].vertex; }
/** #define S6 (S3*2) */
export function S6(): number { return S3() * 2; }
export const MAX_S3 = 4;
export function SG6(): number { return S3() === 3 ? 6 : 4; }
export function SG3(): number { return S3() === 3 ? 3 : 2; }
export function SG2(): number { return S3() === 3 ? 2 : 1; }
/** #define cgflags cginf.flags */
export function cgflags(): flagtype { return ginf[G.geometry].flags; }
/** #define cgclass (cginf.cclass), cclass = g.kind */
export function cgclass(): eGeometryClass { return ginf[G.geometry].g.kind; }
/** #define WDIM cginf.g.gameplay_dimension */
export function WDIM(): number { return ginf[G.geometry].g.gameplay_dimension; }
/** #define GDIM cginf.g.graphical_dimension */
export function GDIM(): number { return ginf[G.geometry].g.graphical_dimension; }
/** #define MDIM (MAXMDIM == 3 ? 3 : cginf.g.homogeneous_dimension); MAXMDIM is 4 in the desktop build */
export function MDIM(): number { return ginf[G.geometry].g.homogeneous_dimension; }
export function LDIM(): number { return MDIM() - 1; }

const has = (f: flagtype): boolean => (cgflags() & f) !== 0n;

export function cryst(): boolean { return has(qCRYSTAL); }
export function experimental(): boolean { return has(qEXPERIMENTAL); }
export function euclid(): boolean { return cgclass() === gcEuclid; }
export function sphere(): boolean { return cgclass() === gcSphere; }
export function sol(): boolean { const c = cgclass(); return c === gcSol || c === gcSolN; }
export function nih(): boolean { const c = cgclass(); return c === gcNIH || c === gcSolN; }
export function nil(): boolean { return cgclass() === gcNil; }
export function sl2(): boolean { return cgclass() === gcSL2; }
export function gtwisted(): boolean { return G.geometry === gTwistedProduct; }
export function hyperbolic(): boolean { return cgclass() === gcHyperbolic; }
export function nonisotropic(): boolean {
  const c = cgclass();
  return c === gcSol || c === gcSolN || c === gcNIH || c === gcSL2 || c === gcNil;
}
export function translatable(): boolean { return euclid() || nonisotropic(); }
export function nonorientable(): boolean { return has(qNONORIENTABLE); }
export function elliptic(): boolean { return has(qELLIPTIC); }
export function quotient(): boolean { return has(qANYQ); }
export function smallbounded(): boolean { return has(qSMALL) || G.disksize !== 0; }
export function closed_manifold(): boolean { return has(qCLOSED); }
export function closed_or_bounded(): boolean { return closed_manifold() || G.disksize !== 0; }
export function mhybrid(): boolean { return has(qHYBRID); }
export function gproduct(): boolean { return cgclass() === gcProduct; }
export function embedded_plane(): boolean { return WDIM() === 2 && GDIM() === 3; }
export function mproduct(): boolean { return gproduct() && !embedded_plane(); }
export function mtwisted(): boolean { return gtwisted() && !embedded_plane(); }
export function eubinary(): boolean { return euclid() || bt_in() || cryst() || nil(); }
export function doall(): boolean { return closed_or_bounded(); }
export function sphere_narcm(): boolean { return sphere() && !arcm_in() && !arb_in(); }
export function hyperbolic_37(): boolean { return S7() === 7 && S3() === 3 && !bt_in() && !arcm_in() && !arb_in(); }
export function hyperbolic_not37(): boolean {
  return (S7() > 7 || S3() > 3 || bt_in() || arcm_in() || arb_in()) && hyperbolic();
}
export function weirdhyperbolic(): boolean {
  return (S7() > 7 || S3() > 3 || !STDVAR() || bt_in() || arcm_in() || arb_in()) && hyperbolic();
}
export function stdhyperbolic(): boolean {
  return S7() === 7 && S3() === 3 && STDVAR() && !bt_in() && !arcm_in() && !arb_in();
}
export function a4(): boolean { return S3() === 4; }
export function a45(): boolean { return S3() === 4 && S7() === 5; }
export function a46(): boolean { return S3() === 4 && S7() === 6; }
export function a47(): boolean { return S3() === 4 && S7() === 7; }
export function a457(): boolean { return S3() === 4 && S7() !== 6; }
export function a467(): boolean { return S3() === 4 && S7() >= 6; }
export function a38(): boolean { return S3() === 3 && S7() === 8; }
export function sphere4(): boolean { return sphere() && S7() === 4; }
export function stdeuc(): boolean { return G.geometry === gNormal || G.geometry === gEuclid || G.geometry === gEuclidSquare; }
export function smallsphere(): boolean { return sphere_narcm() && S7() < 5; }
export function bigsphere(): boolean { return sphere_narcm() && S7() === 5; }
export function aperiodic(): boolean { return has(qAPERIODIC); }

export function INVERSE(): boolean {
  const v = G.variation;
  return v === eVariation.unrectified || v === eVariation.warped || v === eVariation.untruncated;
}
export function UNRECTIFIED(): boolean { return G.variation === eVariation.unrectified; }
export function WARPED(): boolean { return G.variation === eVariation.warped; }
export function UNTRUNCATED(): boolean { return G.variation === eVariation.untruncated; }
export function GOLDBERG(): boolean { return G.variation === eVariation.goldberg; }
export function IRREGULAR(): boolean { return G.variation === eVariation.irregular; }
export function PURE(): boolean { return G.variation === eVariation.pure; }
export function BITRUNCATED(): boolean { return G.variation === eVariation.bitruncated; }
export function DUAL(): boolean { return G.variation === eVariation.dual; }
export function DUALMUL(): number { return DUAL() ? 2 : 1; }
export function GOLDBERG_INV(): boolean { return GOLDBERG() || INVERSE(); }
export function CHANGED_VARIATION(): boolean { return G.variation !== cginf().default_variation; }
export function STDVAR(): boolean { return PURE() || BITRUNCATED(); }
export function NONSTDVAR(): boolean { return !STDVAR(); }

/** the static initialization of classes.cpp: here only the late binding of DUALMUL for locations.ts */
export function register_classes(): void {
  late.DUALMUL = DUALMUL;
}

// --- classes.cpp: eModel, namespace mf, mdinf (the projections; added by stage 2 package D1) ---
/** enum eModel */
export const mdDisk = 0, mdHalfplane = 1, mdBand = 2, mdPolygonal = 3, mdFormula = 4, mdEquidistant = 5;
export const mdEquiarea = 6, mdBall = 7, mdHyperboloid = 8, mdHemisphere = 9, mdBandEquidistant = 10;
export const mdBandEquiarea = 11, mdSinusoidal = 12, mdTwoPoint = 13, mdFisheye = 14, mdJoukowsky = 15;
export const mdJoukowskyInverted = 16, mdRotatedHyperboles = 17, mdSpiral = 18, mdPerspective = 19;
export const mdEquivolume = 20, mdCentralInversion = 21, mdSimulatedPerspective = 22, mdTwoHybrid = 23;
export const mdGeodesic = 24, mdMollweide = 25, mdCentralCyl = 26, mdCollignon = 27, mdHorocyclic = 28;
export const mdQuadrant = 29, mdAxial = 30, mdAntiAxial = 31, mdWerner = 32, mdAitoff = 33, mdHammer = 34;
export const mdLoximuthal = 35, mdMiller = 36, mdGallStereographic = 37, mdWinkelTripel = 38, mdPoorMan = 39;
export const mdPanini = 40, mdRetroCraig = 41, mdRetroLittrow = 42, mdRetroHammer = 43, mdThreePoint = 44;
export const mdLiePerspective = 45, mdLieOrthogonal = 46, mdRelPerspective = 47, mdRelOrthogonal = 48;
export const mdHorocyclicEqa = 49, mdConformalSquare = 50, mdFisheye2 = 51, mdPolar = 52, mdConformalEgg = 53;
export const mdGUARD = 54, mdPixel = 55, mdHyperboloidFlat = 56, mdPolynomial = 57, mdManual = 58;
export type eModel = number;
/** namespace mf: the model flags (flagtype: bigint, as the other flags) */
export const mf = {
  azimuthal: 1n,
  cylindrical: 2n,
  equiarea: 4n,
  equidistant: 8n,
  conformal: 16n,
  euc_boring: 32n,
  space: 64n,
  hyper_only: 128n,
  hyper_or_torus: 256n,
  pseudocylindrical: 512n,
  equivolume: 1024n,
  twopoint: 2048n,
  uses_bandshift: 4096n,
  broken: 8192n,
  technical: 16384n,
  product_special: 32768n,
  axial: 65536n,
  perspective: 131072n,
  orientation: 262144n,
  transition: 524288n,
  werner: 1048576n,
  horocyclic: 2097152n,
  band: 0n, pseudoband: 0n,
};
mf.band = mf.cylindrical | mf.pseudocylindrical | mf.uses_bandshift | mf.orientation;
mf.pseudoband = mf.pseudocylindrical | mf.uses_bandshift | mf.orientation;
/** struct modelinfo */
export interface modelinfo { name_hyperbolic: string; name_euclidean: string; name_spherical: string; flags: bigint; }
/** vector<modelinfo> mdinf: the list of available models (i.e., projections) */
export const mdinf: modelinfo[] = [
  { name_hyperbolic: "disk/Gans", name_euclidean: "general perspective", name_spherical: "general perspective", flags: mf.azimuthal | mf.conformal | mf.product_special },
  { name_hyperbolic: "half-plane", name_euclidean: "inversion", name_spherical: "stereographic projection [VR]", flags: mf.conformal | mf.orientation | mf.horocyclic | mf.product_special },
  { name_hyperbolic: "band", name_euclidean: "band", name_spherical: "Mercator", flags: mf.band | mf.conformal | mf.transition },
  { name_hyperbolic: "polygonal", name_euclidean: "polygonal", name_spherical: "polygonal", flags: mf.conformal | mf.orientation },
  { name_hyperbolic: "formula", name_euclidean: "formula", name_spherical: "formula", flags: 0n },
  { name_hyperbolic: "azimuthal equidistant", name_euclidean: "azimuthal equidistant", name_spherical: "azimuthal equidistant", flags: mf.azimuthal | mf.equidistant | mf.euc_boring | mf.product_special },
  { name_hyperbolic: "azimuthal equi-area", name_euclidean: "azimuthal equi-area", name_spherical: "azimuthal equi-area", flags: mf.azimuthal | mf.equiarea | mf.euc_boring },
  { name_hyperbolic: "ball model", name_euclidean: "ball model", name_spherical: "ball model", flags: mf.conformal | mf.azimuthal | mf.space },
  { name_hyperbolic: "Minkowski hyperboloid", name_euclidean: "plane", name_spherical: "sphere", flags: mf.conformal | mf.space | mf.euc_boring },
  { name_hyperbolic: "hemisphere", name_euclidean: "sphere", name_spherical: "Minkowski hyperboloid", flags: mf.conformal | mf.space },
  { name_hyperbolic: "band equidistant", name_euclidean: "band equidistant", name_spherical: "band equidistant", flags: mf.band | mf.equidistant | mf.euc_boring },
  { name_hyperbolic: "band equi-area", name_euclidean: "band equi-area", name_spherical: "band equi-area", flags: mf.band | mf.equiarea | mf.euc_boring },
  { name_hyperbolic: "sinusoidal", name_euclidean: "sinusoidal", name_spherical: "sinusoidal", flags: mf.pseudoband | mf.equiarea | mf.euc_boring },
  { name_hyperbolic: "two-point equidistant", name_euclidean: "two-point equidistant", name_spherical: "two-point equidistant", flags: mf.equidistant | mf.euc_boring | mf.twopoint | mf.orientation },
  { name_hyperbolic: "fisheye", name_euclidean: "fisheye", name_spherical: "fisheye", flags: 0n },
  { name_hyperbolic: "Joukowsky transform", name_euclidean: "Joukowsky transform", name_spherical: "Joukowsky transform", flags: mf.hyper_only | mf.conformal | mf.transition | mf.orientation },
  { name_hyperbolic: "Joukowsky+inversion", name_euclidean: "Joukowsky+inversion", name_spherical: "Joukowsky+inversion", flags: mf.hyper_only | mf.conformal | mf.transition | mf.orientation },
  { name_hyperbolic: "rotated hyperboles", name_euclidean: "rotated hyperboles", name_spherical: "rotated hyperboles", flags: mf.hyper_only | mf.orientation },
  { name_hyperbolic: "spiral/ring", name_euclidean: "spiral/ring", name_spherical: "spiral/ring", flags: mf.hyper_or_torus | mf.uses_bandshift | mf.orientation },
  { name_hyperbolic: "native perspective", name_euclidean: "native perspective", name_spherical: "native perspective", flags: mf.perspective | mf.product_special },
  { name_hyperbolic: "azimuthal equi-volume", name_euclidean: "azimuthal equi-volume", name_spherical: "azimuthal equi-volume", flags: mf.azimuthal | mf.equivolume | mf.euc_boring },
  { name_hyperbolic: "central inversion", name_euclidean: "central inversion", name_spherical: "central inversion", flags: mf.azimuthal | mf.conformal },
  { name_hyperbolic: "two-point azimuthal", name_euclidean: "two-point azimuthal", name_spherical: "two-point azimuthal", flags: mf.euc_boring | mf.azimuthal | mf.twopoint | mf.orientation },
  { name_hyperbolic: "two-point hybrid", name_euclidean: "two-point hybrid", name_spherical: "two-point hybrid", flags: mf.euc_boring | mf.azimuthal | mf.equidistant | mf.twopoint | mf.orientation },
  { name_hyperbolic: "geodesic", name_euclidean: "geodesic", name_spherical: "geodesic", flags: mf.perspective | mf.product_special },
  { name_hyperbolic: "Mollweide", name_euclidean: "Mollweide", name_spherical: "Mollweide", flags: mf.euc_boring | mf.pseudoband | mf.equiarea },
  { name_hyperbolic: "central cylindrical", name_euclidean: "central cylindrical", name_spherical: "central cylindrical", flags: mf.euc_boring | mf.band },
  { name_hyperbolic: "Collignon", name_euclidean: "Collignon", name_spherical: "Collignon", flags: mf.pseudoband | mf.equiarea },
  { name_hyperbolic: "horocyclic coordinates", name_euclidean: "horocyclic coordinates", name_spherical: "horocyclic coordinates", flags: mf.euc_boring | mf.orientation | mf.horocyclic },
  { name_hyperbolic: "quadrant coordinates", name_euclidean: "quadrant coordinates", name_spherical: "quadrant coordinates", flags: mf.euc_boring | mf.orientation },
  { name_hyperbolic: "axial coordinates", name_euclidean: "axial coordinates", name_spherical: "axial coordinates", flags: mf.euc_boring | mf.transition | mf.orientation },
  { name_hyperbolic: "anti-axial coordinates", name_euclidean: "anti-axial coordinates", name_spherical: "anti-axial coordinates", flags: mf.euc_boring | mf.orientation },
  { name_hyperbolic: "Werner projection", name_euclidean: "Werner projection", name_spherical: "Werner projection", flags: mf.euc_boring | mf.broken | mf.werner | mf.orientation },
  { name_hyperbolic: "Aitoff projection", name_euclidean: "Aitoff projection", name_spherical: "Aitoff projection", flags: mf.euc_boring | mf.broken | mf.orientation },
  { name_hyperbolic: "Hammer projection", name_euclidean: "Hammer projection", name_spherical: "Hammer projection", flags: mf.euc_boring | mf.broken | mf.orientation },
  { name_hyperbolic: "loximuthal projection", name_euclidean: "loximuthal projection", name_spherical: "loximuthal projection", flags: mf.euc_boring | mf.broken | mf.orientation },
  { name_hyperbolic: "Miller projection", name_euclidean: "Miller projection", name_spherical: "Miller projection", flags: mf.euc_boring | mf.band },
  { name_hyperbolic: "Gall stereographic", name_euclidean: "Gall stereographic", name_spherical: "Gall stereographic", flags: mf.euc_boring | mf.band },
  { name_hyperbolic: "Winkel tripel", name_euclidean: "Winkel tripel", name_spherical: "Winkel tripel", flags: mf.euc_boring | mf.broken | mf.orientation },
  { name_hyperbolic: "Poor man's square", name_euclidean: "Poor man's square", name_spherical: "Poor man's square", flags: mf.euc_boring | mf.orientation },
  { name_hyperbolic: "Panini projection", name_euclidean: "Panini projection", name_spherical: "Panini projection", flags: mf.euc_boring | mf.orientation },
  { name_hyperbolic: "Craig retroazimuthal", name_euclidean: "Craig retroazimuthal", name_spherical: "Craig retroazimuthal", flags: mf.euc_boring | mf.broken | mf.pseudoband },
  { name_hyperbolic: "Littrow retroazimuthal", name_euclidean: "Littrow retroazimuthal", name_spherical: "Littrow retroazimuthal", flags: mf.euc_boring | mf.broken | mf.pseudoband },
  { name_hyperbolic: "Hammer retroazimuthal", name_euclidean: "Hammer retroazimuthal", name_spherical: "Hammer retroazimuthal", flags: mf.euc_boring | mf.pseudoband },
  { name_hyperbolic: "three-point equidistant", name_euclidean: "three-point equidistant", name_spherical: "three-point equidistant", flags: mf.euc_boring | mf.equidistant | mf.orientation | mf.product_special | mf.twopoint },
  { name_hyperbolic: "Lie perspective", name_euclidean: "Lie perspective", name_spherical: "Lie perspective", flags: mf.euc_boring | mf.perspective },
  { name_hyperbolic: "Lie orthogonal", name_euclidean: "Lie orthogonal", name_spherical: "Lie orthogonal", flags: mf.euc_boring },
  { name_hyperbolic: "relativistic perspective", name_euclidean: "relativistic perspective", name_spherical: "relativistic perspective", flags: mf.euc_boring | mf.perspective },
  { name_hyperbolic: "relativistic orthogonal", name_euclidean: "relativistic orthogonal", name_spherical: "relativistic orthogonal", flags: mf.euc_boring },
  { name_hyperbolic: "horocyclic equal-area", name_euclidean: "horocyclic equal-area", name_spherical: "horocyclic equal-area", flags: mf.euc_boring | mf.equiarea | mf.orientation | mf.horocyclic },
  { name_hyperbolic: "conformal square", name_euclidean: "conformal square", name_spherical: "conformal square", flags: mf.orientation | mf.broken | mf.transition },
  { name_hyperbolic: "variant fisheye", name_euclidean: "variant fisheye", name_spherical: "variant fisheye", flags: 0n },
  { name_hyperbolic: "polar coordinates", name_euclidean: "polar coordinates", name_spherical: "polar coordinates", flags: mf.orientation },
  { name_hyperbolic: "conformal egg", name_euclidean: "conformal egg", name_spherical: "conformal egg", flags: mf.orientation | mf.transition },
  { name_hyperbolic: "guard", name_euclidean: "guard", name_spherical: "guard", flags: mf.technical },
  { name_hyperbolic: "pixel", name_euclidean: "pixel", name_spherical: "pixel", flags: mf.technical },
  { name_hyperbolic: "hypflat", name_euclidean: "hypflat", name_spherical: "hypflat", flags: mf.technical },
  { name_hyperbolic: "polynomial", name_euclidean: "polynomial", name_spherical: "polynomial", flags: mf.technical | mf.conformal | mf.orientation },
  { name_hyperbolic: "manual", name_euclidean: "manual", name_spherical: "manual", flags: mf.technical },
];
