// graph-monster.cpp of HyperRogue 13.1o: the monster graphics (drawMonsterType: every monster's shapes; drawMonster:
// facing, animations, worms/ivies/tentacles/dragons, mimics, the player on its cell; tortoises, legs, shadows,
// christmas lights). Stage 2, package D4 (PORTING-STAGE2.md). (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// Names: the C++ macros VBODY, VHEAD, ... (`at_smart_lof(V, cgi.BODY)`) are the functions VBODY(V), ...; VBIRD
// takes `where`. `tortoise::draw` -> tortoise_draw. Not ported (STAGE2-STUB, NotPorted when reached): the 3D
// branches (GDIM == 3 / WDIM == 3: radar, animated wings, the 3D legs), the map editor's user shapes (none exist
// in stage 2: drawUserShape is false), the Dice (dice::draw_die, complex2.cpp).
// VBIRD's phase: the original uses the cell's address (`int(size_t(where))/1000.`), which differs between runs
// (ASLR); the port uses the cell's serial `_id` instead, as fghostcolor does (README.md, deviations).
import { G } from './globals.ts';
import { NotPorted, among, isize, PPR, OUTLINE_NONE, OUTLINE_FRIEND, OUTLINE_ENEMY, OUTLINE_DEAD, OUTLINE_TRANS }
  from './hyper.ts';
import { ld_deg, c_sin, c_cos, c_atan } from './cpp.ts';
import type { cell } from './locations.ts';
import { NODIR } from './locations.ts';
import {
  type shiftmatrix, type transmatrix, Id, C0, TAU, M_PI, A_PI, smul, smulh, tmulh, tcopy,
  tC0, tC0_sm, xpush, det, inverse_shift, inverse_shift_sp, unshift_sm, hypot_d, rpushxto0, cyclefix,
  rgpushxto0, hdist0, normalize, hadd, hmul, shiftless_t, cspin180, orthogonal_move_fol_t, unshift,
} from './hyperpoint.ts';
import {
  spin, spin180, spin270, lmirror, lxpush, lzpush, lrspintox, lspintox, xspinpush, xspinpush0, tile_center,
} from './embeddings.ts';
import { GDIM, WDIM, elliptic, quotient, BITRUNCATED, NONSTDVAR, mhybrid, mproduct, gproduct, sl2, eubinary }
  from './classes.ts';
import { gNormal, gElliptic } from './classes.ts';
import { cgi, geom3_lev_to_factor, geom3_factor_to_lev, type hpcshape } from './geometry.ts';
import { queuepoly, queuepolyat, queueline, queuestr_sp, POLY_FORCEWIDE } from './drawing.ts';
import { gradient, darkena, firecolor, watercolor, fghostcolor, cloakcolor, part } from './colors.ts';
import {
  minf, iinf, linf, type eMonster,
  waSulphur, waSulphurC, waBarrier, waMirrorWall,
  laTerracotta, laHalloween,
  itOrbFire, itOrbAether, itOrbFish, itOrbEmpathy, itOrbWinter,
  moTerraWarrior, moTortoise, moWorldTurtle, moMutant, moPlayer, moMimic, moShadow, moIllusion, moBullet, moKnight,
  moKnightMoved, moGolem, moGolemMoved, moEvilGolem, moIceGolem, moFalsePrincess, moRoseLady, moRoseBeauty,
  moPrincess, moPrincessArmed, moWolf, moRedFox, moWolfMoved, moLavaWolf, moReptile, moSalamander, moFrog, moPhaser,
  moVaulter, moVineBeast, moMouse, moMouseMoved, moRunDog, moHunterDog, moHunterGuard, moHunterChanging,
  moFallingDog, moOrangeDog, moShark, moGreaterShark, moCShark, moPike, moEagle, moParrot, moBomberbird,
  moAlbatross, moTameBomberbird, moWindCrow, moTameBomberbirdMoved, moSandBird, moAcidBird, moSparrowhawk,
  moWestHawk, moButterfly, moGadfly, moVampire, moBat, moGargoyle, moZombie, moVariantWarrior, moDesertman,
  moMonk, moCrusher, moPair, moAltDemon, moHexDemon, moSkeleton, moPalace, moFatGuard, moVizier, moCrystalSage,
  moHedge, moYeti, moMonkey, moResearcher, moFamiliar, moRanger, moNarciss, moMirrorSpirit, moJiangshi, moGhost,
  moSeep, moFriendlyGhost, moVineSpirit, moFireFairy, moRusalka, moSlime, moKrakenH, moKrakenT, moCultist,
  moPyroCultist, moCultistLeader, moPirate, moRatling, moRatlingAvenger, moViking, moOutlaw, moNecromancer,
  moDraugr, moVoidBeast, moGoblin, moLancer, moFlailer, moMiner, moTroll, moFjordTroll, moForestTroll,
  moStormTroll, moDarkTroll, moRedTroll, moEarthElemental, moWaterElemental, moFireElemental, moAirElemental,
  moWorm, moWormwait, moHexSnake, moHexSnakeTail, moDragonHead, moDragonTail, moTentacle, moTentaclewait,
  moTentacleEscaping, moTentacletail, moTentacleGhost, moWormtail, moAsteroid, moDonkey, moAnimatedDie,
  moAngryDie, moBug0, moMetalBeast, moRagingBull, moNorthPole, moBrownBug, moHexer, moWitchGhost, moWitchWinter,
  moWitchFlash, moWitchSpeed, moWitchFire, moFriendlyIvy, moIvyRoot,
} from './content.ts';
import {
  isTroll, isPrincess, isMetalBeast, isBull, isBug, isSwitch, isDemon, isMagneticPole, isWitch, isAnyIvy, isWorm,
  isIvy, isMutantIvy, isDragon, isMimic, hasFacing, isDie, isFriendly, isWatery, noHighlight,
  get_threat_level, mirrorcolor,
} from './flags.ts';
import { getcs, princessgender } from './config.ts';
import { GEN_F } from './hyper.ts';
import { sintick, ptick, fractick, applyAnimation, chainAnimation, chainAngle, LAYER_SMALL, LAYER_BIG } from './animations.ts';
import {
  at_smart_lof_sm, draw_ascii_or_zh, ddspin180, lpispin, doHighlight, addauraspecial, pushdown, hide_player,
} from './graph.ts';
import { ddspin, iddspin, cellgfxdist } from './geometry2.ts';
import { ocwtV } from './celldrawer.ts';
import { nestcolors } from './graph-wall.ts';
import { pattern_threecolor, ctof } from './pattern2.ts';
import { createMov } from './cell.ts';
import { neighborId } from './cell.ts';
import { hrand } from './rand.ts';
import {
  tortoise_getb, tortoise_seek, tortoise_diff, tortoise_getScent, tortoise_getBit, tfEyeHue, tfShellHue, tfScuteHue,
  tfSkinHue, tfShellSat, tfScuteSat, tfSkinSat, tfShellDark, tfSkinDark, dragon_bodypart, dragon_findhead,
  mirror_mirrordir,
} from './complex.ts';
import { roundTableRadius, newRoundTableRadius } from './bigstuff.ts';
import { player_positions, numplayers, playerpos } from './pcmove.ts';
import { wormhead } from './game.ts';
import { mouseout } from './control.ts';
import { dice_draw_die } from './complex2.ts';
import { queue_ring } from './graph-item.ts';
import {
  drawPlayer, drawMimic, drawPlayerEffects, drawWinter, drawFlash_sm, drawSpeed, pshRatling, pshSkeleton, pshRogue,
  pshSpaceship,
} from './graph-player.ts';
import { model_needs_depth } from './basegraph.ts';

const cd = () => G.current_display;
/** #define SHADOW_MON 0x30 (hyper.h) */
const SHADOW_MON = 0x30;
/** #define UNTRANS (GDIM == 3 ? 0x000000FF : 0) */
const UNTRANS = (): number => (GDIM() === 3 ? 0x000000FF : 0);
/** #define SCALE cgi.scalefactor */
const SCALE = (): number => cgi().scalefactor;
const adj = (c: cell, i: number): transmatrix => G.currentmap.adj(c, i);
const sm = smul;
const u32 = (x: number): number => x >>> 0;
const ch = (s: string): number => s.charCodeAt(0);

// the macros of graph-monster.cpp (HDR)
export function VFOOT(V: shiftmatrix): shiftmatrix { return (GDIM() === 2 || mhybrid()) ? V : at_smart_lof_sm(V, cgi().LEG0); }
export function VLEG(V: shiftmatrix): shiftmatrix { return at_smart_lof_sm(V, cgi().LEG); }
export function VGROIN(V: shiftmatrix): shiftmatrix { return at_smart_lof_sm(V, cgi().GROIN); }
export function VBODY(V: shiftmatrix): shiftmatrix { return at_smart_lof_sm(V, cgi().BODY); }
export function VRAT(V: shiftmatrix): shiftmatrix {
  if (GDIM() === 2) return VHEAD(V);
  throw new NotPorted('VRAT: 3D (zc)'); // STAGE2-STUB (3D)
}
export function VBODY1(V: shiftmatrix): shiftmatrix { return at_smart_lof_sm(V, cgi().BODY1); }
export function VBODY2(V: shiftmatrix): shiftmatrix { return at_smart_lof_sm(V, cgi().BODY2); }
export function VBODY3(V: shiftmatrix): shiftmatrix { return at_smart_lof_sm(V, cgi().BODY3); }
export function VNECK(V: shiftmatrix): shiftmatrix { return at_smart_lof_sm(V, cgi().NECK); }
export function VHEAD(V: shiftmatrix): shiftmatrix { return at_smart_lof_sm(V, cgi().HEAD); }
export function VHEAD1(V: shiftmatrix): shiftmatrix { return at_smart_lof_sm(V, cgi().HEAD1); }
export function VHEAD2(V: shiftmatrix): shiftmatrix { return at_smart_lof_sm(V, cgi().HEAD2); }
export function VHEAD3(V: shiftmatrix): shiftmatrix { return at_smart_lof_sm(V, cgi().HEAD3); }
export function VALEGS(V: shiftmatrix): shiftmatrix { return V; }
export function VABODY(V: shiftmatrix): shiftmatrix { return at_smart_lof_sm(V, cgi().ABODY); }
export function VAHEAD(V: shiftmatrix): shiftmatrix { return at_smart_lof_sm(V, cgi().AHEAD); }
export function VFISH(V: shiftmatrix): shiftmatrix { return V; }
export function VBIRD(V: shiftmatrix, where: cell | null): shiftmatrix {
  const g = cgi();
  if (GDIM() === 3 || (where && bird_disruption(where))) return WDIM() === 2 ? at_smart_lof_sm(V, g.BIRD) : V;
  // static_cast<int>(reinterpret_cast<size_t>(where))/1000.: the address; the port uses the serial (see the header)
  return at_smart_lof_sm(V, g.BIRD + .05 * sintick(1000, (where ? where._id : 0) / 1000.));
}
export function VGHOST(V: shiftmatrix): shiftmatrix { return at_smart_lof_sm(V, cgi().GHOST); }
export function VSLIMEEYE(V: shiftmatrix): shiftmatrix { return shiftless_t(orthogonal_move_fol_t(V.T, cgi().FLATEYE), V.shift); }

/** bool bird_disruption(cell *c) (mapeffects.cpp) */
import { bird_disruption } from './mapeffects.ts';

/** mapeditor::drawUserShape(...): no user shapes in stage 2 (the map editor is stage 3) */
function drawUserShape(): boolean { return false; }

export function fc(ph: number, col: number, z: number): number {
  if (G.items[itOrbFire]) col = darkena(firecolor(ph), 0, 0xFF);
  if (G.items[itOrbAether]) col = u32((col & ~0xFF) | ((col & 0xFF) >>> 1));
  for (const pc of player_positions())
    if (G.items[itOrbFish] && isWatery(pc) && z !== 3) return watercolor(ph);
  if (G.invismove)
    col =
      G.shmup_on ?
        u32((col & ~0xFF) | (Math.trunc((col & 0xFF) * .25)))
        : u32((col & ~0xFF) | Math.trunc(Math.trunc((col & 0xFF) * (100 + 100 * sintick(500))) / 200));
  return col;
}

export function drawStunStars(V: shiftmatrix, t: number): void {
  // CAP_SHAPES
  for (let i = 0; i < 3 * t; i++) {
    let V2 = sm(V, spin(TAU * i / (3 * t) + ptick(200)));
    // MAXMDIM >= 4
    if (GDIM() === 3) V2 = sm(V2, lzpush(cgi().HEAD));
    queuepolyat(V2, cgi().shFlailBall, 0xFFFFFFFF, PPR.STUNSTARS);
  }
}

const getBit = tortoise_getBit;

/** tortoise::draw(const shiftmatrix& V, int bits, int small, int stuntime): small is 0 or 2 */
export function tortoise_draw(V: shiftmatrix, bits: number, small: number, stuntime: number): void {
  // CAP_SHAPES
  let eyecolor = getBit(bits, tfEyeHue) ? 0xFF0000 : 0xC0C0C0;
  let shellcolor = getBit(bits, tfShellHue) ? 0x00C040 : 0xA06000;
  let scutecolor = getBit(bits, tfScuteHue) ? 0x00C040 : 0xA06000;
  let skincolor = getBit(bits, tfSkinHue) ? 0x00C040 : 0xA06000;
  if (getBit(bits, tfShellSat)) shellcolor = gradient(shellcolor, 0xB0B0B0, 0, .5, 1);
  if (getBit(bits, tfScuteSat)) scutecolor = gradient(scutecolor, 0xB0B0B0, 0, .5, 1);
  if (getBit(bits, tfSkinSat)) skincolor = gradient(skincolor, 0xB0B0B0, 0, .5, 1);
  if (getBit(bits, tfShellDark)) shellcolor = gradient(shellcolor, 0, 0, .5, 1);
  if (getBit(bits, tfSkinDark)) skincolor = gradient(skincolor, 0, 0, .5, 1);

  if (bits < 0) {
    skincolor = 0xC00060;
    shellcolor = 0xFF00FF;
    scutecolor = 0x6000C0;
    eyecolor = 0xFFFFFF;
  }

  const g = cgi();
  for (let i = 0; i < 12; i++) {
    const col =
      i === 0 ? shellcolor :
        i < 8 ? scutecolor :
          skincolor;
    let b = getBit(bits, i);
    let d = darkena(col, 0, 0xFF);
    if (i >= 1 && i <= 7) if (b) { d = darkena(col, 1, 0xFF); b = 0; }

    if (i >= 8 && i <= 11 && stuntime >= 3) continue;

    queuepoly(V, g.shTortoise[i][b + small], d);
    if ((i >= 5 && i <= 7) || (i >= 9 && i <= 10))
      queuepoly(sm(V, lmirror()), g.shTortoise[i][b + small], d);

    if (i === 8) {
      for (let k = 0; k < stuntime; k++) {
        eyecolor &= 0xFEFEFE;
        eyecolor >>>= 1;
      }
      queuepoly(V, g.shTortoise[12][b + small], darkena(eyecolor, 0, 0xFF));
      queuepoly(sm(V, lmirror()), g.shTortoise[12][b + small], darkena(eyecolor, 0, 0xFF));
    }
  }
}

/** tortoise::getMatchColor(int bits) */
export function tortoise_getMatchColor(bits: number): number {
  let mcol = 1;
  const d = tortoise_getScent(bits);

  if (d > 0) mcol = 0xFFFFFF;
  else if (d < 0) mcol = 0;

  const dd = Math.trunc(0xFF * (c_atan(Math.abs(d) / 2) / ld_deg(90, A_PI)));

  return gradient(0x487830, mcol, 0, dd, 0xFF);
}

function footfun(d: number): number {
  d -= Math.floor(d);
  return (
    d < .25 ? d :
      d < .75 ? .5 - d :
        d - 1);
}

export function animallegs(V: shiftmatrix, mo: eMonster, col: number, footphase: number): void {
  // CAP_SHAPES
  footphase /= SCALE();

  const dog = mo === moRunDog;
  const bug = mo === moBug0 || mo === moMetalBeast;

  if (bug) footphase *= 2.5;

  let rightfoot = footfun(footphase / .4 / 2) / 4 * 2;
  let leftfoot = footfun(footphase / .4 / 2 - (bug ? .5 : dog ? .1 : .25)) / 4 * 2;

  if (bug) { rightfoot /= 2.5; leftfoot /= 2.5; }

  rightfoot *= SCALE();
  leftfoot *= SCALE();

  if (!footphase) rightfoot = leftfoot = 0;

  const g = cgi();
  const sh: (hpcshape | null)[][] = [
    [g.shDogFrontPaw, g.shDogRearPaw, g.shDogFrontLeg, g.shDogRearLeg],
    [g.shWolfFrontPaw, g.shWolfRearPaw, g.shWolfFrontLeg, g.shWolfRearLeg],
    [g.shReptileFrontFoot, g.shReptileRearFoot, g.shReptileFrontLeg, g.shReptileRearLeg],
    [g.shBugLeg, null, null, null],
    [g.shTrylobiteFrontClaw, g.shTrylobiteRearClaw, g.shTrylobiteFrontLeg, g.shTrylobiteRearLeg],
    [g.shBullFrontHoof, g.shBullRearHoof, g.shBullFrontHoof, g.shBullRearHoof],
  ];

  const x = sh[mo === moRagingBull ? 5 : mo === moBug0 ? 3 : mo === moMetalBeast ? 4 : mo === moRunDog ? 0 : mo === moReptile ? 2 : 1];

  // MAXMDIM >= 4
  if (GDIM() === 3 && !(GDIM() === 3 && WDIM() === 2 && gproduct()))
    throw new NotPorted('animallegs: 3D'); // STAGE2-STUB (3D)

  const VL = at_smart_lof_sm(V, g.ALEG0);
  const VAML = at_smart_lof_sm(V, g.ALEG);

  if (x[0]) queuepolyat(sm(VL, lxpush(rightfoot)), x[0], col, PPR.MONSTER_FOOT);
  if (x[0]) queuepolyat(sm(sm(VL, lmirror()), lxpush(leftfoot)), x[0], col, PPR.MONSTER_FOOT);
  if (x[1]) queuepolyat(sm(VL, lxpush(-rightfoot)), x[1], col, PPR.MONSTER_FOOT);
  if (x[1]) queuepolyat(sm(sm(VL, lmirror()), lxpush(-leftfoot)), x[1], col, PPR.MONSTER_FOOT);

  if (x[2]) queuepolyat(sm(VAML, lxpush(rightfoot / 2)), x[2], col, PPR.MONSTER_FOOT);
  if (x[2]) queuepolyat(sm(sm(VAML, lmirror()), lxpush(leftfoot / 2)), x[2], col, PPR.MONSTER_FOOT);
  if (x[3]) queuepolyat(sm(VAML, lxpush(-rightfoot / 2)), x[3], col, PPR.MONSTER_FOOT);
  if (x[3]) queuepolyat(sm(sm(VAML, lmirror()), lxpush(-leftfoot / 2)), x[3], col, PPR.MONSTER_FOOT);
}

// EX bool noshadow: G.noshadow

// CAP_SHAPES
export function ShadowV(V: shiftmatrix, bp: hpcshape, prio: PPR = PPR.MONSTER_SHADOW): void {
  if (WDIM() === 2 && GDIM() === 3 && bp.shs !== bp.she)
    throw new NotPorted('ShadowV: 2D in 3D'); // STAGE2-STUB (3D)
  if (G.mmspatial) {
    if (model_needs_depth() || G.noshadow)
      return; // shadows break the depth testing
    const p = G.poly_outline;
    G.poly_outline = OUTLINE_TRANS;
    try {
      queuepolyat(V, bp, SHADOW_MON, prio);
    } finally { G.poly_outline = p; }
  }
}

// CAP_SHAPES
export function otherbodyparts(V: shiftmatrix, col: number, who: eMonster, footphase: number): transmatrix {

  // if(!mmspatial && !footphase && who != moSkeleton) return;

  footphase /= SCALE();
  const rightfoot = footfun(footphase / .4 / 2.5) / 4 * 2.5 * SCALE();

  const wobble = -1;

  // todo

  let who1 = who;
  if (among(who, moPlayer, moMimic, moShadow, moIllusion, moFalsePrincess, moRoseLady, moRoseBeauty, moPrincess, moPrincessArmed)) {
    const cs = getcs();
    const id = cs.charid >> 1;
    if (id === pshRatling) who1 = moRatling;
    if (id === pshSkeleton) who1 = moSkeleton;
  }

  const g = cgi();
  if (G.detaillevel >= 2 && GDIM() === 2) {
    const VL = at_smart_lof_sm(V, g.LEG1);
    queuepoly(sm(VL, xpush(rightfoot * 3 / 4)), g.shHumanLeg, col);
    queuepoly(sm(sm(VL, lmirror()), xpush(-rightfoot * 3 / 4)), g.shHumanLeg, col);
  }

  if (GDIM() === 2) {
    const VL = at_smart_lof_sm(V, g.LEG);
    queuepoly(sm(VL, xpush(rightfoot / 2)), g.shHumanLeg, col);
    queuepoly(sm(sm(VL, lmirror()), xpush(-rightfoot / 2)), g.shHumanLeg, col);
  }

  if (G.detaillevel >= 2 && GDIM() === 2) {
    const VL = at_smart_lof_sm(V, g.LEG3);
    queuepoly(sm(VL, xpush(rightfoot / 4)), g.shHumanLeg, col);
    queuepoly(sm(sm(VL, lmirror()), xpush(-rightfoot / 4)), g.shHumanLeg, col);
  }

  let Tright: shiftmatrix, Tleft: shiftmatrix;

  if (GDIM() === 2 || mhybrid() || g.emb.is_euc_in_product()) {
    Tright = sm(VFOOT(V), xpush(rightfoot));
    Tleft = sm(sm(VFOOT(V), lmirror()), xpush(-rightfoot));
  }
  // MAXMDIM >= 4
  else throw new NotPorted('otherbodyparts: 3D'); // STAGE2-STUB (3D)

  if (who === moWaterElemental && GDIM() === 2) {
    const fishtail = footfun(footphase / .4) / 4 * 1.5;
    queuepoly(sm(VFOOT(V), xpush(fishtail)), g.shFishTail, watercolor(100));
  }
  else if (who1 === moSkeleton) {
    queuepoly(Tright, g.shSkeletalFoot, col);
    queuepoly(Tleft, g.shSkeletalFoot, col);
    return spin(rightfoot * wobble);
  }
  else if (isTroll(who1) || among(who1, moMonkey, moYeti, moRatling, moRatlingAvenger, moGoblin)) {
    queuepoly(Tright, g.shYetiFoot, col);
    queuepoly(Tleft, g.shYetiFoot, col);
  }
  else {
    queuepoly(Tright, g.shHumanFoot, col);
    queuepoly(Tleft, g.shHumanFoot, col);
  }

  if (GDIM() === 3 || !G.mmspatial) return spin(rightfoot * wobble);

  if (G.detaillevel >= 2 && who !== moZombie)
    queuepoly(at_smart_lof_sm(V, g.NECK1), g.shHumanNeck, col);
  if (G.detaillevel >= 1) {
    queuepoly(VGROIN(V), g.shHumanGroin, col);
    if (who !== moZombie) queuepoly(VNECK(V), g.shHumanNeck, col);
  }
  if (G.detaillevel >= 2) {
    queuepoly(at_smart_lof_sm(V, g.GROIN1), g.shHumanGroin, col);
    if (who !== moZombie) queuepoly(at_smart_lof_sm(V, g.NECK3), g.shHumanNeck, col);
  }

  return spin(rightfoot * wobble);
}

export function drawstar(c: cell): boolean {
  for (let t = 0; t < c.type; t++)
    if (c.move(t) && c.move(t).wall !== waSulphur && c.move(t).wall !== waSulphurC &&
      c.move(t).wall !== waBarrier)
      return false;
  return true;
}

/** bool drawing_usershape_on(cell *c, mapeditor::eShapegroup sg): mapeditor::drawcell is never set in stage 2 */
export function drawing_usershape_on(_c: cell, _sg: number): boolean {
  return false; // c == mapeditor::drawcell: no drawing tool in stage 2
}

// CAP_SHAPES
// EX color_t skincolor = 0xD0C080FF: G.skincolor

export function humanoid_eyes(V: shiftmatrix, ecol: number, hcol: number = G.skincolor): void {
  if (GDIM() === 3) {
    queuepoly(VHEAD(V), cgi().shPHeadOnly, hcol);
    queuepoly(VHEAD(V), cgi().shSkullEyes, ecol);
  }
}

export function drawTerraWarrior(V: shiftmatrix, t: number, hp: number, footphase: number): void {
  if (!G.mmmon) {
    draw_ascii_or_zh(V, 'T'.charCodeAt(0), minf[moTerraWarrior].name, gradient(0x202020, 0xFFFFFF, 0, t, 6), 1.5, 1);
    return;
  }
  const g = cgi();
  ShadowV(V, g.shPBody);
  const col = linf[laTerracotta].color;
  const bcol = darkena(false ? 0xC0B23E : col, 0, 0xFF);
  const VBS = otherbodyparts(V, bcol, moDesertman, footphase);
  queuepoly(sm(VBODY(V), VBS), g.shPBody, bcol);
  if (!G.peace_on) queuepoly(sm(sm(VBODY(V), VBS), lmirror()), g.shPSword, darkena(0xC0C0C0, 0, 0xFF));
  queuepoly(sm(VBODY1(V), VBS), g.shTerraArmor1, darkena(t > 0 ? 0x4040FF : col, 0, 0xFF));
  if (hp >= 4) queuepoly(sm(VBODY2(V), VBS), g.shTerraArmor2, darkena(t > 1 ? 0xC00000 : col, 0, 0xFF));
  if (hp >= 2) queuepoly(sm(VBODY3(V), VBS), g.shTerraArmor3, darkena(t > 2 ? 0x612600 : col, 0, 0xFF));
  queuepoly(VHEAD(V), g.shTerraHead, darkena(t > 4 ? 0x202020 : t > 3 ? 0x504040 : col, 0, 0xFF));
  queuepoly(VHEAD1(V), g.shPFace, bcol);
  humanoid_eyes(V, 0x400000FF, darkena(col, 0, 0xFF));
}

/** const int WINGS (polygons.cpp: the animation frames of 3D wings) */
const WINGS = 4;

export function wingphase(period: number, phase = 0): number {
  const t = fractick(period, phase);
  const WINGS2 = WINGS * 2;
  let ti = Math.trunc(t * WINGS2) % WINGS2;
  if (ti > WINGS) ti = WINGS2 - ti;
  return ti;
}

function wingmatrix(period: number, phase = 0): transmatrix {
  const t = fractick(period, phase) * TAU;
  const Vwing = tcopy(Id);
  Vwing[1][1] = .85 + .15 * c_sin(t);
  return Vwing;
}

export function drawMonsterType(m: eMonster, where: cell | null, V1: shiftmatrix, col: number, footphase: number, asciicol: number): boolean {

  // MAXMDIM >= 4
  if (GDIM() === 3 && asciicol !== NOCOLOR)
    throw new NotPorted('drawMonsterType: addradar (3D)'); // STAGE2-STUB (3D)

  const xch = minf[m].glyph;

  let V = V1;
  if (WDIM() === 3) throw new NotPorted('drawMonsterType: WDIM 3'); // STAGE2-STUB (3D)

  const g = cgi();
  // CAP_SHAPES
  if (among(m, moTortoise, moWorldTurtle) && where && where.stuntime >= 3)
    drawStunStars(V, where.stuntime - 2);
  else if (among(m, moTortoise, moWorldTurtle, moMutant) || m === moPlayer || (where && !where.stuntime)) { /* nothing */ }
  else if (where && !(isMetalBeast(m) && where.stuntime === 1))
    drawStunStars(V, where.stuntime);

  if (drawUserShape()) // mapeditor::drawUserShape(V, mapeditor::sgMonster, m, darkena(col, 0, 0xFF), where)
    return true;

  if (!G.mmmon) {
    draw_ascii_or_zh(V1, xch, minf[m].name, asciicol, 1.5, 1);
    return true;
  }

  const peace = G.peace_on;

  const princess = (): boolean => {
    const girl = princessgender() === GEN_F;
    const evil = !isPrincess(m);

    const facecolor = evil ? 0xC0B090FF : 0xD0C080FF;

    const cs = G.vid.cs;
    const id = cs.charid >> 1;

    const body = id === pshRatling ? g.shYeti : id === pshSkeleton ? g.shSkeletonBody : girl ? g.shFemaleBody : g.shPBody;
    const wears_dress = among(id, pshRogue, pshRatling, pshSkeleton);

    ShadowV(V, body);
    const VBS = otherbodyparts(V, facecolor, !evil && G.items[itOrbFish] && G.items[itOrbEmpathy] ? moWaterElemental : m, footphase);
    queuepoly(sm(VBODY(V), VBS), body, facecolor);

    if (m === moPrincessArmed)
      queuepoly(sm(sm(VBODY(V), VBS), lmirror()), id === pshRogue ? g.shSabre : g.shPSword, 0xFFFFFFFF);

    if ((m === moFalsePrincess || m === moRoseBeauty) && where && where.cpdist === 1)
      queuepoly(sm(VBODY(V), VBS), g.shPKnife, 0xFFFFFFFF);

    if (m === moRoseLady) {
      queuepoly(sm(VBODY(V), VBS), g.shPKnife, 0xFFFFFFFF);
      queuepoly(sm(sm(VBODY(V), VBS), lmirror()), g.shPKnife, 0xFFFFFFFF);
    }

    if (girl) {
      queuepoly(sm(VBODY1(V), VBS), g.shFemaleDress, evil ? 0xC000C0FF : 0x00C000FF);
      if (wears_dress)
        queuepoly(sm(VBODY2(V), VBS), g.shPrincessDress, u32((evil ? 0xC040C0C0 : 0x8080FFC0) | UNTRANS()));
    }
    else {
      if (wears_dress)
        queuepoly(sm(VBODY1(V), VBS), g.shPrinceDress, evil ? 0x802080FF : 0x404040FF);
    }

    const hair = id === pshRatling ? g.shRatHead : id === pshSkeleton ? g.shSkull : girl ? g.shFemaleHair : g.shPHead;

    if (m === moRoseLady) {
      //    queuepoly(V, girl ? cgi.shGoatHead : cgi.shDemon,  0x800000FF);
      // make her hair a bit darker to stand out in 3D
      queuepoly(hair === g.shRatHead ? VRAT(V) : VHEAD1(V), hair, evil ? 0x500050FF : GDIM() === 3 ? 0x666A64FF : 0x332A22FF);
    }
    else if (m === moRoseBeauty) {
      if (girl) {
        queuepoly(VHEAD1(V), g.shBeautyHair, 0xF0A0D0FF);
        queuepoly(VHEAD2(V), g.shFlowerHair, 0xC00000FF);
      }
      else {
        queuepoly(VHEAD1(V), g.shPHead, 0xF0A0D0FF);
        queuepoly(sm(VBODY(V), VBS), g.shFlowerHand, 0xC00000FF);
        queuepoly(sm(VBODY2(V), VBS), g.shSuspenders, 0xC00000FF);
      }
    }
    else {
      queuepoly(hair === g.shRatHead ? VRAT(V) : VHEAD1(V), hair, evil ? 0xC00000FF : 0x332A22FF);
    }
    if (hair === g.shRatHead) {
      const V1 = VRAT(V);
      queuepoly(V1, g.shWolf1, 0x008000FF);
      queuepoly(V1, g.shWolf2, 0x008000FF);
      queuepoly(V1, g.shWolf3, darkena(0x202020, 0, 0xFF));
    }
    else if (hair === g.shSkull) {
      queuepoly(VHEAD(V), g.shSkullEyes, darkena(0x202020, 0, 0xFF));
    }
    else queuepoly(VHEAD(V), g.shPFace, facecolor);
    if (id === pshRatling) queuepoly(VLEG(V), g.shRatTail, darkena(col, 0, 0xFF));
    if (id !== pshRatling) humanoid_eyes(V, evil ? 0x0000C0FF : 0x00C000FF, facecolor);
    return true;
  };

  // CAP_SHAPES
  switch (m) {
    case moTortoise: {
      const bits = where ? tortoise_getb(where) : G.tortoise_last;
      tortoise_draw(V, bits, 0, where ? where.stuntime : 0);
      if (tortoise_seek() && !tortoise_diff(bits) && where)
        queue_ring(V, g.shRing, darkena(0xFFFFFF, 0, Math.trunc(0x80 + 0x70 * sintick(200))), PPR.ITEM);
      return true;
    }

    case moWorldTurtle: {
      tortoise_draw(V, -1, 0, where ? where.stuntime : 0);
      return true;
    }

    case moPlayer:
      drawPlayer(m, where, V, col, footphase);
      return true;

    case moMimic: case moShadow: case moIllusion:
      drawMimic(m, where, V, col, footphase);
      return true;

    case moBullet:
      if ((getcs().charid >> 1) === pshSpaceship) {
        ShadowV(V, g.shKnife);
        queuepoly(VBODY(V), g.shMissile, getcs().swordcolor);
        return true;
      }
      ShadowV(V, g.shKnife);
      queuepoly(sm(VBODY(V), spin270()), g.shKnife, getcs().swordcolor);
      return true;

    case moKnight: case moKnightMoved: {
      ShadowV(V, g.shPBody);
      const VBS = otherbodyparts(V, darkena(0xC0C0A0, 0, 0xC0), m, footphase);
      queuepoly(sm(VBODY(V), VBS), g.shPBody, darkena(0xC0C0A0, 0, 0xC0));
      if (!G.racing_on)
        queuepoly(sm(VBODY(V), VBS), g.shPSword, darkena(0xFFFF00, 0, 0xFF));
      queuepoly(sm(VBODY1(V), VBS), g.shKnightArmor, darkena(0xD0D0D0, 1, 0xFF));
      let col: number;
      if (!eubinary() && where && where.master.alt)
        col = cloakcolor(roundTableRadius(where));
      else
        col = cloakcolor(newRoundTableRadius());
      queuepoly(sm(VBODY2(V), VBS), g.shKnightCloak, darkena(col, 1, 0xFF));
      queuepoly(VHEAD1(V), g.shPHead, darkena(0x703800, 1, 0xFF));
      queuepoly(VHEAD(V), g.shPFace, darkena(0xC0C0A0, 0, 0xFF));
      humanoid_eyes(V, 0x000000FF);
      return true;
    }

    case moGolem: case moGolemMoved: {
      ShadowV(V, g.shPBody);
      const VBS = otherbodyparts(V, darkena(col, 1, 0xC0), G.items[itOrbFish] && G.items[itOrbEmpathy] ? moWaterElemental : m, footphase);
      queuepoly(sm(VBODY(V), VBS), g.shPBody, darkena(col, 0, 0xC0));
      queuepoly(VHEAD(V), g.shGolemhead, darkena(col, 1, 0xFF));
      humanoid_eyes(V, 0xC0C000FF, darkena(col, 0, 0xFF));
      return true;
    }

    case moEvilGolem: case moIceGolem: {
      const VBS = sm(VBODY(V), otherbodyparts(V, darkena(col, 2, 0xC0), m, footphase));
      ShadowV(V, g.shPBody);
      queuepoly(VBS, g.shPBody, darkena(col, 0, 0xC0));
      queuepoly(VHEAD(V), g.shGolemhead, darkena(col, 1, 0xFF));
      humanoid_eyes(V, 0xFF0000FF, darkena(col, 0, 0xFF));
      return true;
    }

    case moFalsePrincess: case moRoseLady: case moRoseBeauty:
      return princess();

    case moWolf: case moRedFox: case moWolfMoved: case moLavaWolf: {
      ShadowV(V, g.shWolfBody);
      if (G.mmspatial || footphase)
        animallegs(VALEGS(V), moWolf, darkena(col, 0, 0xFF), footphase);
      else
        queuepoly(VALEGS(V), g.shWolfLegs, darkena(col, 0, 0xFF));
      queuepoly(VABODY(V), g.shWolfBody, darkena(col, 0, 0xFF));
      if (m === moRedFox) {
        queuepoly(VABODY(V), g.shFoxTail1, darkena(col, 0, 0xFF));
        queuepoly(VABODY(V), g.shFoxTail2, darkena(0xFFFFFF, 0, 0xFF));
      }
      queuepoly(VAHEAD(V), g.shWolfHead, darkena(col, 0, 0xFF));
      queuepoly(VAHEAD(V), g.shWolfEyes, darkena(col, 3, 0xFF));
      if (GDIM() === 3) {
        queuepoly(VAHEAD(V), g.shFamiliarEye, 0xFF);
        queuepoly(sm(VAHEAD(V), lmirror()), g.shFamiliarEye, 0xFF);
      }
      return true;
    }

    case moReptile: {
      ShadowV(V, g.shReptileBody);
      animallegs(VALEGS(V), moReptile, darkena(col, 0, 0xFF), footphase);
      queuepoly(VABODY(V), g.shReptileBody, darkena(col, 0, 0xFF));
      queuepoly(VAHEAD(V), g.shReptileHead, darkena(col, 0, 0xFF));
      queuepoly(VAHEAD(V), g.shReptileEye, darkena(col, 3, 0xFF));
      queuepoly(sm(VAHEAD(V), lmirror()), g.shReptileEye, darkena(col, 3, 0xFF));
      if (GDIM() === 2) queuepoly(VABODY(V), g.shReptileTail, darkena(col, 2, 0xFF));
      return true;
    }

    case moSalamander: {
      ShadowV(V, g.shReptileBody);
      animallegs(VALEGS(V), moReptile, darkena(0xD00000, 1, 0xFF), footphase);
      queuepoly(VABODY(V), g.shReptileBody, darkena(0xD00000, 0, 0xFF));
      queuepoly(VAHEAD(V), g.shReptileHead, darkena(0xD00000, 1, 0xFF));
      queuepoly(VAHEAD(V), g.shReptileEye, darkena(0xD00000, 0, 0xFF));
      queuepoly(sm(VAHEAD(V), lmirror()), g.shReptileEye, darkena(0xD00000, 0, 0xFF));
      queuepoly(VABODY(V), g.shReptileTail, darkena(0xD08000, 0, 0xFF));
      return true;
    }

    case moFrog: case moPhaser: case moVaulter: {
      ShadowV(V, g.shFrogBody);
      const VL = GDIM() === 3 ? V : at_smart_lof_sm(V, g.ALEG0);
      const xcolor = darkena(0xFF0000, 1, 0xFF);
      const alpha = (m === moPhaser ? 0xC0 : 0xFF);
      if (footphase) {
        queuepoly(VL, g.shFrogJumpFoot, darkena(col, 0, alpha));
        queuepoly(sm(VL, lmirror()), g.shFrogJumpFoot, darkena(col, 0, alpha));
        queuepoly(VALEGS(V), g.shFrogJumpLeg, xcolor);
        queuepoly(sm(VALEGS(V), lmirror()), g.shFrogJumpLeg, xcolor);
      }
      else {
        queuepoly(VL, g.shFrogRearFoot, darkena(col, 0, alpha));
        queuepoly(sm(VL, lmirror()), g.shFrogRearFoot, darkena(col, 0, alpha));
        queuepoly(VALEGS(V), g.shFrogRearLeg, xcolor);
        queuepoly(sm(VALEGS(V), lmirror()), g.shFrogRearLeg, xcolor);
        queuepoly(VALEGS(V), g.shFrogRearLeg2, xcolor);
        queuepoly(sm(VALEGS(V), lmirror()), g.shFrogRearLeg2, xcolor);
      }
      queuepoly(VL, g.shFrogFrontFoot, darkena(col, 0, alpha));
      queuepoly(sm(VL, lmirror()), g.shFrogFrontFoot, darkena(col, 0, alpha));
      queuepoly(VALEGS(V), g.shFrogFrontLeg, xcolor);
      queuepoly(sm(VALEGS(V), lmirror()), g.shFrogFrontLeg, xcolor);
      queuepoly(VABODY(V), g.shFrogBody, darkena(col, 0, alpha));
      queuepoly(VABODY(V), g.shFrogEye, darkena(col, 3, alpha));
      queuepoly(sm(VABODY(V), lmirror()), g.shFrogEye, darkena(col, 3, alpha));
      queuepoly(VABODY(V), g.shFrogStripe, xcolor);
      return true;
    }

    case moVineBeast: {
      ShadowV(V, g.shWolfBody);
      if (G.mmspatial || footphase)
        animallegs(VALEGS(V), moWolf, 0x00FF00FF, footphase);
      else
        queuepoly(VALEGS(V), g.shWolfLegs, 0x00FF00FF);
      queuepoly(VABODY(V), g.shWolfBody, darkena(col, 1, 0xFF));
      queuepoly(VAHEAD(V), g.shWolfHead, darkena(col, 0, 0xFF));
      queuepoly(VAHEAD(V), g.shWolfEyes, 0xFF0000FF);
      return true;
    }

    case moMouse: case moMouseMoved: {
      queuepoly(VALEGS(V), g.shMouse, darkena(col, 0, 0xFF));
      queuepoly(VALEGS(V), g.shMouseLegs, darkena(col, 1, 0xFF));
      queuepoly(VALEGS(V), g.shMouseEyes, 0xFF);
      return true;
    }

    case moRunDog: case moHunterDog: case moHunterGuard: case moHunterChanging: case moFallingDog: {
      if (!G.mmspatial && !footphase)
        queuepoly(VABODY(V), g.shDogBody, darkena(col, 0, 0xFF));
      else {
        ShadowV(V, g.shDogTorso);
        queuepoly(VABODY(V), g.shDogTorso, darkena(col, 0, 0xFF));
        animallegs(VALEGS(V), moRunDog, m === moFallingDog ? 0xFFFFFFFF : darkena(col, 0, 0xFF), footphase);
      }
      queuepoly(VAHEAD(V), g.shDogHead, darkena(col, 0, 0xFF));

      {
        const dp = G.poly_outline;
        try {
          let eyecolor = 0x202020;
          let redeyes = false;
          if (m === moHunterDog) { eyecolor = 0xFF0000; redeyes = true; }
          if (m === moHunterGuard) { eyecolor = 0xFF6000; redeyes = true; }
          if (m === moHunterChanging) { eyecolor = 0xFFFF00; redeyes = true; }
          const eyes = darkena(eyecolor, 0, 0xFF);

          if (redeyes) G.poly_outline = eyes;
          queuepoly(VAHEAD(V), g.shWolf1, eyes).flags |= POLY_FORCEWIDE;
          queuepoly(VAHEAD(V), g.shWolf2, eyes).flags |= POLY_FORCEWIDE;
        } finally { G.poly_outline = dp; }
      }
      queuepoly(VAHEAD(V), g.shWolf3, darkena(m === moRunDog ? 0x202020 : 0x000000, 0, 0xFF));
      return true;
    }

    case moOrangeDog: {
      if (!G.mmspatial && !footphase)
        queuepoly(VABODY(V), g.shDogBody, darkena(0xFFFFFF, 0, 0xFF));
      else {
        ShadowV(V, g.shDogTorso);
        if (GDIM() === 2) queuepoly(VABODY(V), g.shDogTorso, darkena(0xFFFFFF, 0, 0xFF));
        animallegs(VALEGS(V), moRunDog, darkena(0xFFFFFF, 0, 0xFF), footphase);
      }
      queuepoly(VAHEAD(V), g.shDogHead, darkena(0xFFFFFF, 0, 0xFF));
      queuepoly(VABODY(V), g.shDogStripes, GDIM() === 2 ? darkena(0x303030, 0, 0xFF) : 0xFFFFFFFF);
      queuepoly(VAHEAD(V), g.shWolf1, darkena(0x202020, 0, 0xFF));
      queuepoly(VAHEAD(V), g.shWolf2, darkena(0x202020, 0, 0xFF));
      queuepoly(VAHEAD(V), g.shWolf3, darkena(0x202020, 0, 0xFF));
      return true;
    }

    case moShark: case moGreaterShark: case moCShark:
      queuepoly(VFISH(V), g.shShark, darkena(col, 0, 0xFF));
      return true;

    case moPike:
      queuepoly(VFISH(V), g.shPikeBody, darkena(col, 0, 0xFF));
      queuepoly(VFISH(V), g.shPikeEye, darkena(col, 2, 0xFF));
      queuepoly(sm(VFISH(V), lmirror()), g.shPikeEye, darkena(col, 2, 0xFF));
      return true;

    case moEagle: case moParrot: case moBomberbird: case moAlbatross:
    case moTameBomberbird: case moWindCrow: case moTameBomberbirdMoved:
    case moSandBird: case moAcidBird: {
      ShadowV(V, g.shEagle);
      if (GDIM() === 3) throw new NotPorted('drawMonsterType: 3D wings'); // STAGE2-STUB (3D)
      const sh = g.shEagle;
      if (m === moParrot && GDIM() === 3)
        queuepolyat(VBIRD(V, where), sh, darkena(col, 0, 0xFF), PPR.SUPERLINE);
      else
        queuepoly(VBIRD(V, where), sh, darkena(col, 0, 0xFF));
      return true;
    }

    case moSparrowhawk: case moWestHawk: {
      ShadowV(V, g.shHawk);
      if (GDIM() === 3) throw new NotPorted('drawMonsterType: 3D wings'); // STAGE2-STUB (3D)
      const sh = g.shHawk;
      queuepoly(VBIRD(V, where), sh, darkena(col, 0, 0xFF));
      return true;
    }

    case moButterfly: {
      const Vwing = wingmatrix(100);
      ShadowV(sm(V, Vwing), g.shButterflyWing);
      if (GDIM() === 2)
        queuepoly(sm(VBIRD(V, where), Vwing), g.shButterflyWing, darkena(col, 0, 0xFF));
      else
        throw new NotPorted('drawMonsterType: 3D wings'); // STAGE2-STUB (3D)
      queuepoly(VBIRD(V, where), g.shButterflyBody, darkena(col, 2, 0xFF));
      return true;
    }

    case moGadfly: {
      const Vwing = wingmatrix(100);
      ShadowV(sm(V, Vwing), g.shGadflyWing);
      if (GDIM() !== 2) throw new NotPorted('drawMonsterType: 3D wings'); // STAGE2-STUB (3D)
      queuepoly(sm(VBIRD(V, where), Vwing), g.shGadflyWing, darkena(col, 0, 0xFF));
      queuepoly(VBIRD(V, where), g.shGadflyBody, darkena(col, 1, 0xFF));
      queuepoly(VBIRD(V, where), g.shGadflyEye, darkena(col, 2, 0xFF));
      queuepoly(sm(VBIRD(V, where), lmirror()), g.shGadflyEye, darkena(col, 2, 0xFF));
      return true;
    }

    case moVampire: case moBat: {
      // vampires have no shadow and no mirror images
      if (m === moBat) ShadowV(V, g.shBatWings);
      if (m === moBat || !G.inmirrorcount) {
        if (GDIM() !== 2) throw new NotPorted('drawMonsterType: 3D wings'); // STAGE2-STUB (3D)
        queuepoly(VBIRD(V, where), g.shBatWings, darkena(0x303030, 0, 0xFF));
        queuepoly(VBIRD(V, where), g.shBatBody, darkena(0x606060, 0, 0xFF));
      }
      return true;
    }

    case moGargoyle: {
      ShadowV(V, g.shGargoyleWings);
      if (GDIM() !== 2) throw new NotPorted('drawMonsterType: 3D wings'); // STAGE2-STUB (3D)
      queuepoly(VBIRD(V, where), g.shGargoyleWings, darkena(col, 0, 0xD0));
      queuepoly(VBIRD(V, where), g.shGargoyleBody, darkena(col, 0, 0xFF));
      return true;
    }

    case moZombie: {
      const c = darkena(col, where && where.land === laHalloween ? 1 : 0, 0xFF);
      const VBS = otherbodyparts(V, c, m, footphase);
      ShadowV(V, g.shPBody);
      queuepoly(sm(VBODY(V), VBS), g.shPBody, c);
      return true;
    }

    case moTerraWarrior: {
      drawTerraWarrior(V, 7, (where ? where.hitpoints : 7), footphase);
      return true;
    }

    case moVariantWarrior: {
      const VBS = sm(VBODY(V), otherbodyparts(V, darkena(col, 0, 0xC0), m, footphase));
      ShadowV(V, g.shPBody);
      queuepoly(VBS, g.shPBody, darkena(0xFFD500, 0, 0xF0));
      if (!peace) queuepoly(VBS, g.shPSword, 0xFFFF00FF);
      queuepoly(VHEAD(V), g.shHood, 0x008000FF);
      humanoid_eyes(V, 0xFFFF00FF);
      return true;
    }

    case moDesertman: {
      const VBS = sm(VBODY(V), otherbodyparts(V, darkena(col, 0, 0xC0), m, footphase));
      ShadowV(V, g.shPBody);
      queuepoly(VBS, g.shPBody, darkena(col, 0, 0xC0));
      if (!peace) queuepoly(VBS, g.shPSword, 0xFFFF00FF);
      queuepoly(VHEAD(V), g.shHood, u32(0xD0D000C0 | UNTRANS()));
      humanoid_eyes(V, 0x301800FF);
      return true;
    }

    case moMonk: {
      const VBS = otherbodyparts(V, darkena(col, 0, 0xC0), m, footphase);
      ShadowV(V, g.shRaiderBody);
      queuepoly(sm(VBODY(V), VBS), g.shRaiderBody, darkena(col, 0, 0xFF));
      queuepoly(sm(VBODY1(V), VBS), g.shRaiderShirt, darkena(col, 2, 0xFF));
      if (!peace) queuepoly(sm(VBODY(V), VBS), g.shPKnife, 0xFFC0C0C0);
      queuepoly(sm(VBODY2(V), VBS), g.shRaiderArmor, darkena(col, 1, 0xFF));
      queuepolyat(sm(VBODY3(V), VBS), g.shRatCape2, darkena(col, 2, 0xFF), PPR.MONSTER_ARMOR0);
      queuepoly(VHEAD1(V), g.shRaiderHelmet, darkena(col, 0, 0xFF));
      queuepoly(VHEAD(V), g.shPFace, darkena(0xC0C0A0, 0, 0xFF));
      humanoid_eyes(V, 0x000000FF);
      return true;
    }

    case moCrusher: {
      const VBS = otherbodyparts(V, darkena(col, 1, 0xFF), m, footphase);
      ShadowV(V, g.shRaiderBody);
      queuepoly(sm(VBODY(V), VBS), g.shRaiderBody, darkena(col, 0, 0xFF));
      queuepoly(sm(VBODY1(V), VBS), g.shRaiderShirt, darkena(col, 2, 0xFF));
      queuepoly(sm(VBODY2(V), VBS), g.shRaiderArmor, darkena(col, 1, 0xFF));
      queuepoly(sm(VBODY(V), VBS), g.shFlailTrunk, darkena(col, 1, 0xFF));
      queuepoly(sm(VBODY1(V), VBS), g.shHammerHead, darkena(col, 0, 0xFF));
      queuepoly(VHEAD1(V), g.shRaiderHelmet, darkena(col, 0, 0xFF));
      queuepoly(VHEAD(V), g.shPFace, darkena(0xC0C0A0, 0, 0xFF));
      humanoid_eyes(V, 0x000000FF);
      return true;
    }

    case moPair: {
      const VBS = otherbodyparts(V, darkena(col, 1, 0xFF), m, footphase);
      ShadowV(V, g.shRaiderBody);
      queuepoly(sm(VBODY(V), VBS), g.shRaiderBody, darkena(col, 0, 0xFF));
      queuepoly(sm(VBODY1(V), VBS), g.shRaiderShirt, darkena(col, 2, 0xFF));
      queuepoly(sm(VBODY2(V), VBS), g.shRaiderArmor, darkena(col, 1, 0xFF));
      queuepoly(sm(VBODY(V), VBS), g.shPickAxe, darkena(0xA0A0A0, 0, 0xFF));
      queuepoly(VHEAD1(V), g.shRaiderHelmet, darkena(col, 0, 0xFF));
      queuepoly(VHEAD(V), g.shPFace, darkena(0xC0C0A0, 0, 0xFF));
      humanoid_eyes(V, 0x000000FF);
      return true;
    }

    case moAltDemon: case moHexDemon: {
      const VBS = otherbodyparts(V, darkena(col, 0, 0xC0), m, footphase);
      ShadowV(V, g.shRaiderBody);
      queuepoly(sm(VBODY(V), VBS), g.shRaiderBody, darkena(col, 0, 0xFF));
      queuepoly(sm(VBODY1(V), VBS), g.shRaiderShirt, darkena(col, 2, 0xFF));
      queuepoly(sm(VBODY2(V), VBS), g.shRaiderArmor, darkena(col, 1, 0xFF));
      if (!peace) queuepoly(sm(VBODY(V), VBS), g.shPSword, 0xFFD0D0D0);
      queuepoly(VHEAD1(V), g.shRaiderHelmet, darkena(col, 0, 0xFF));
      queuepoly(VHEAD(V), g.shPFace, darkena(0xC0C0A0, 0, 0xFF));
      humanoid_eyes(V, 0x000000FF);
      return true;
    }

    case moSkeleton: {
      const VBS = sm(VBODY(V), otherbodyparts(V, darkena(0xFFFFFF, 0, 0xFF), moSkeleton, footphase));
      queuepoly(VBS, g.shSkeletonBody, darkena(0xFFFFFF, 0, 0xFF));
      if (GDIM() === 2) queuepoly(VHEAD(V), g.shSkull, darkena(0xFFFFFF, 0, 0xFF));
      if (GDIM() === 2) queuepoly(VHEAD1(V), g.shSkullEyes, 0x000000FF);
      humanoid_eyes(V, 0x000000FF, 0xFFFFFFFF);
      ShadowV(V, g.shSkeletonBody);
      queuepoly(VBS, g.shSabre, 0xFFFFFFFF);
      return true;
    }

    case moPalace: case moFatGuard: case moVizier: {
      ShadowV(V, g.shPBody);
      const VBS = otherbodyparts(V, darkena(0xFFD500, 0, 0xFF), m, footphase);
      if (m === moFatGuard) {
        queuepoly(sm(VBODY(V), VBS), g.shFatBody, darkena(0xC06000, 0, 0xFF));
        col = 0xFFFFFF;
        if (!where || where.hitpoints >= 3)
          queuepoly(sm(VBODY1(V), VBS), g.shKnightCloak, darkena(0xFFC0C0, 1, 0xFF));
      }
      else {
        queuepoly(sm(VBODY(V), VBS), g.shPBody, darkena(0xFFD500, 0, 0xFF));
        queuepoly(sm(VBODY1(V), VBS), g.shKnightArmor, m === moVizier ? 0xC000C0FF :
          darkena(0x00C000, 1, 0xFF));
        if (where && where.hitpoints >= 3)
          queuepoly(sm(VBODY2(V), VBS), g.shKnightCloak, m === moVizier ? 0x800080FF :
            darkena(0x00FF00, 1, 0xFF));
      }
      queuepoly(VHEAD1(V), g.shTurban1, darkena(col, 1, 0xFF));
      if (!where || where.hitpoints >= 2)
        queuepoly(VHEAD2(V), g.shTurban2, darkena(col, 0, 0xFF));
      queuepoly(sm(VBODY(V), VBS), g.shSabre, 0xFFFFFFFF);
      humanoid_eyes(V, 0x301800FF);
      return true;
    }

    case moCrystalSage: {
      const VBS = sm(VBODY(V), otherbodyparts(V, 0xFFFFFFFF, m, footphase));
      ShadowV(V, g.shPBody);
      queuepoly(VBS, g.shPBody, 0xFFFFFFFF);
      queuepoly(VHEAD1(V), g.shPHead, 0xFFFFFFFF);
      queuepoly(VHEAD(V), g.shPFace, 0xFFFFFFFF);
      humanoid_eyes(V, 0xFFFFFFFF, 0xC0C0C0FF);
      return true;
    }

    case moHedge: {
      ShadowV(V, g.shPBody);
      const VBS = sm(VBODY(V), otherbodyparts(V, darkena(col, 1, 0xFF), m, footphase));
      queuepoly(VBS, g.shPBody, darkena(col, 0, 0xFF));
      queuepoly(VBS, g.shHedgehogBlade, 0xC0C0C0FF);
      queuepoly(VHEAD1(V), g.shPHead, 0x804000FF);
      queuepoly(VHEAD(V), g.shPFace, 0xF09000FF);
      humanoid_eyes(V, 0x00D000FF);
      return true;
    }

    case moYeti: case moMonkey: {
      const VBS = sm(VBODY(V), otherbodyparts(V, darkena(col, 0, 0xC0), m, footphase));
      ShadowV(V, g.shPBody);
      queuepoly(VBS, g.shYeti, darkena(col, 0, 0xC0));
      queuepoly(VHEAD1(V), g.shPHead, darkena(col, 0, 0xFF));
      humanoid_eyes(V, 0x000000FF, darkena(col, 0, 0xFF));
      return true;
    }

    case moResearcher: {
      const VBS = sm(VBODY(V), otherbodyparts(V, darkena(col, 0, 0xFF), m, footphase));
      ShadowV(V, g.shPBody);
      queuepoly(VBS, g.shPBody, darkena(0xFFFF00, 0, 0xC0));
      queuepoly(VHEAD(V), g.shAztecHead, darkena(col, 0, 0xFF));
      queuepoly(VHEAD1(V), g.shAztecCap, darkena(0xC000C0, 0, 0xFF));
      humanoid_eyes(V, 0x000000FF);
      return true;
    }

    case moFamiliar: {
      ShadowV(V, g.shWolfBody);
      queuepoly(VABODY(V), g.shWolfBody, darkena(0xA03000, 0, 0xFF));
      if (G.mmspatial || footphase)
        animallegs(VALEGS(V), moWolf, darkena(0xC04000, 0, 0xFF), footphase);
      else
        queuepoly(VALEGS(V), g.shWolfLegs, darkena(0xC04000, 0, 0xFF));

      queuepoly(VAHEAD(V), g.shFamiliarHead, darkena(0xC04000, 0, 0xFF));
      // queuepoly(V, cgi.shCatLegs, darkena(0x902000, 0, 0xFF));
      if (true) {
        queuepoly(VAHEAD(V), g.shFamiliarEye, darkena(0xFFFF00, 0, 0xFF));
        queuepoly(sm(VAHEAD(V), lmirror()), g.shFamiliarEye, darkena(0xFFFF00, 0, 0xFF));
      }
      return true;
    }

    case moRanger: {
      ShadowV(V, g.shPBody);
      const VBS = sm(VBODY(V), otherbodyparts(V, darkena(col, 0, 0xFF), m, footphase));
      queuepoly(VBS, g.shPBody, darkena(col, 0, 0xC0));
      if (!peace) queuepoly(VBS, g.shPSword, darkena(col, 0, 0xFF));
      queuepoly(VHEAD(V), g.shArmor, darkena(col, 1, 0xFF));
      humanoid_eyes(V, 0x000000FF);
      return true;
    }

    case moNarciss: {
      ShadowV(V, g.shPBody);
      const VBS = sm(VBODY(V), otherbodyparts(V, darkena(col, 0, 0xFF), m, footphase));
      queuepoly(VBS, g.shFlowerHand, darkena(col, 0, 0xFF));
      queuepoly(VBS, g.shPBody, 0xFFE080FF);
      if (!peace) queuepoly(VBS, g.shPKnife, 0xC0C0C0FF);
      queuepoly(VHEAD(V), g.shPFace, 0xFFE080FF);
      queuepoly(VHEAD1(V), g.shPHead, 0x806A00FF);
      humanoid_eyes(V, 0x000000FF);
      return true;
    }

    case moMirrorSpirit: {
      ShadowV(V, g.shPBody);
      const VBS = sm(VBODY(V), otherbodyparts(V, darkena(col, 0, 0x90), m, footphase));
      queuepoly(VBS, g.shPBody, darkena(col, 0, 0x90));
      if (!peace) queuepoly(sm(VBS, lmirror()), g.shPSword, darkena(col, 0, 0xD0));
      queuepoly(VHEAD1(V), g.shPHead, darkena(col, 1, 0x90));
      queuepoly(VHEAD2(V), g.shPFace, darkena(col, 1, 0x90));
      queuepoly(VHEAD(V), g.shArmor, darkena(col, 0, 0xC0));
      humanoid_eyes(V, 0xFFFFFFFF, darkena(col, 0, 0xFF));
      return true;
    }

    case moJiangshi: {
      ShadowV(V, g.shJiangShi);
      const z2 = WDIM() === 3 ? 0 : GDIM() === 3 ? -Math.abs(c_sin(footphase * TAU)) * g.human_height / 3 : geom3_lev_to_factor(Math.abs(c_sin(footphase * TAU)) * g.human_height);
      const V0 = V;
      const Vj = at_smart_lof_sm(V0, z2);
      otherbodyparts(Vj, darkena(col, 0, 0xFF), m, m === moJiangshi ? 0 : footphase);
      queuepoly(VBODY(Vj), g.shJiangShi, darkena(col, 0, 0xFF));
      queuepoly(VBODY1(Vj), g.shJiangShiDress, darkena(0x202020, 0, 0xFF));
      queuepoly(VHEAD(Vj), g.shTerraHead, darkena(0x101010, 0, 0xFF));
      queuepoly(VHEAD1(Vj), g.shPFace, darkena(col, 0, 0xFF));
      queuepoly(VHEAD2(Vj), g.shJiangShiCap1, darkena(0x800000, 0, 0xFF));
      queuepoly(VHEAD3(Vj), g.shJiangShiCap2, darkena(0x400000, 0, 0xFF));
      humanoid_eyes(Vj, 0x000000FF, darkena(col, 0, 0xFF));
      return true;
    }

    case moGhost: case moSeep: case moFriendlyGhost: {
      if (m === moFriendlyGhost) col = fghostcolor(where!);
      queuepolyat(VGHOST(V), g.shGhost, darkena(col, 0, m === moFriendlyGhost ? 0xC0 : 0x80), GDIM() === 3 ? PPR.SUPERLINE : g.shGhost.prio);
      queuepolyat(VGHOST(V), g.shGhostEyes, 0xFF, GDIM() === 3 ? PPR.SUPERLINE : g.shEyes.prio);
      return true;
    }

    case moVineSpirit: {
      queuepoly(VGHOST(V), g.shGhost, u32(0xD0D0D0C0 | UNTRANS()));
      queuepolyat(VGHOST(V), g.shGhostEyes, 0xFF0000FF, GDIM() === 3 ? PPR.SUPERLINE : g.shGhostEyes.prio);
      return true;
    }

    case moFireFairy: {
      col = firecolor(0);
      const VBS = sm(VBODY(V), otherbodyparts(V, darkena(col, 0, 0xFF), m, footphase));
      ShadowV(V, g.shFemaleBody);
      queuepoly(VBS, g.shFemaleBody, darkena(col, 0, 0xC0));
      queuepoly(VHEAD(V), g.shWitchHair, darkena(col, 1, 0xFF));
      queuepoly(VHEAD1(V), g.shPFace, darkena(col, 0, 0xFF));
      humanoid_eyes(V, darkena(col, 1, 0xFF));
      return true;
    }

    case moRusalka: {
      col = watercolor(0);
      const girl = princessgender() === GEN_F;
      if (girl) {
        const VBS = sm(VBODY(V), otherbodyparts(V, col, m, footphase));
        ShadowV(V, g.shFemaleBody);
        queuepoly(VBS, g.shFemaleBody, watercolor(100));
        queuepoly(VHEAD1(V), g.shFemaleHair, watercolor(150));
        // queuepoly(VHEAD2, cgi.shFlowerHair,  watercolor(50));
        // queuepoly(VHEAD, cgi.shWitchHair, watercolor(150));
        queuepoly(VHEAD1(V), g.shPFace, watercolor(200));
        queuepoly(VHEAD1(V), g.shWightCloak, u32(watercolor(50) & 0xFFFFFF80));
        humanoid_eyes(V, u32(col | 0xFF));
      }
      else {
        const VBS = sm(VBODY(V), otherbodyparts(V, col, m, footphase));
        ShadowV(V, g.shPBody);
        queuepoly(VBS, g.shPBody, watercolor(100));

        queuepoly(VBS, g.shSuspenders, watercolor(150));

        queuepoly(VHEAD1(V), g.shPHead, watercolor(50));
        queuepoly(VHEAD1(V), g.shPFace, watercolor(200));
        queuepoly(VHEAD1(V), g.shWightCloak, u32(watercolor(50) & 0xFFFFFF80));
        humanoid_eyes(V, u32(col | 0xFF));
      }
      return true;
    }

    case moSlime: {
      queuepoly(VFISH(V), g.shSlime, darkena(col, 0, 0x80));
      queuepoly(VSLIMEEYE(V), g.shSlimeEyes, 0xFF);
      return true;
    }

    case moKrakenH: {
      queuepoly(VFISH(V), g.shKrakenHead, darkena(col, 0, 0xD0));
      queuepoly(VFISH(V), g.shKrakenEye, u32(0xFFFFFFC0 | UNTRANS()));
      queuepoly(VFISH(V), g.shKrakenEye2, 0xC0);
      queuepoly(sm(VFISH(V), lmirror()), g.shKrakenEye, u32(0xFFFFFFC0 | UNTRANS()));
      queuepoly(sm(VFISH(V), lmirror()), g.shKrakenEye2, 0xC0);
      return true;
    }

    case moKrakenT: {
      queuepoly(VFISH(V), g.shSeaTentacle, darkena(col, 0, 0xD0));
      return true;
    }

    case moCultist: case moPyroCultist: case moCultistLeader: {
      const VBS = sm(VBODY(V), otherbodyparts(V, darkena(col, 1, 0xFF), m, footphase));
      ShadowV(V, g.shPBody);
      queuepoly(VBS, g.shPBody, darkena(col, 0, 0xC0));
      if (!peace) queuepoly(VBS, g.shPSword, darkena(col, 2, 0xFF));
      queuepoly(VHEAD(V), g.shHood, darkena(col, 1, 0xFF));
      humanoid_eyes(V, 0x00FF00FF);
      return true;
    }

    case moPirate: {
      const VBS = sm(VBODY(V), otherbodyparts(V, darkena(col, 0, 0xFF), m, footphase));
      ShadowV(V, g.shPBody);
      queuepoly(VBS, g.shPBody, darkena(0x404040, 0, 0xFF));
      queuepoly(VBS, g.shPirateHook, darkena(0xD0D0D0, 0, 0xFF));
      queuepoly(VHEAD(V), g.shPFace, darkena(0xFFFF80, 0, 0xFF));
      queuepoly(VHEAD1(V), g.shEyepatch, darkena(0, 0, 0xC0));
      queuepoly(VHEAD2(V), g.shPirateHood, darkena(col, 0, 0xFF));
      humanoid_eyes(V, 0x000000FF);
      return true;
    }

    case moRatling: case moRatlingAvenger: {
      const VBS = otherbodyparts(V, darkena(col, 0, 0xFF), m, footphase);
      ShadowV(V, g.shYeti);
      queuepoly(VLEG(V), g.shRatTail, darkena(col, 0, 0xFF));
      queuepoly(sm(VBODY(V), VBS), g.shYeti, darkena(col, 1, 0xFF));

      const t = Math.fround(sintick(1000, where ? where.cpdist * M_PI : 0));
      const eyecol = t > 0.92 ? 0xFF0000 : 0;

      if (GDIM() === 2) {
        queuepoly(VHEAD(V), g.shRatHead, darkena(col, 0, 0xFF));
        queuepoly(VHEAD(V), g.shWolf1, darkena(eyecol, 0, 0xFF));
        queuepoly(VHEAD(V), g.shWolf2, darkena(eyecol, 0, 0xFF));
        queuepoly(VHEAD(V), g.shWolf3, darkena(0x202020, 0, 0xFF));
        if (m === moRatlingAvenger) queuepoly(VHEAD1(V), g.shRatCape1, 0x303030FF);
      }
      // MAXMDIM >= 4
      else throw new NotPorted('drawMonsterType: 3D ratling'); // STAGE2-STUB (3D)
      if (m === moRatlingAvenger) {
        queuepoly(sm(VBODY1(V), VBS), g.shRatCape2, 0x484848FF);
      }
      return true;
    }

    case moViking: {
      const VBS = otherbodyparts(V, darkena(col, 1, 0xFF), m, footphase);
      ShadowV(V, g.shPBody);
      queuepoly(sm(VBODY(V), VBS), g.shPBody, darkena(0xE00000, 0, 0xFF));
      if (!peace) queuepoly(sm(VBODY(V), VBS), g.shPSword, darkena(0xD0D0D0, 0, 0xFF));
      queuepoly(sm(VBODY1(V), VBS), g.shKnightCloak, darkena(0x404040, 0, 0xFF));
      queuepoly(VHEAD(V), g.shVikingHelmet, darkena(0xC0C0C0, 0, 0xFF));
      queuepoly(VHEAD(V), g.shPFace, darkena(0xFFFF80, 0, 0xFF));
      humanoid_eyes(V, 0x000000FF);
      return true;
    }

    case moOutlaw: {
      const VBS = otherbodyparts(V, darkena(col, 1, 0xFF), m, footphase);
      ShadowV(V, g.shPBody);
      queuepoly(sm(VBODY(V), VBS), g.shPBody, darkena(col, 0, 0xFF));
      queuepoly(sm(VBODY1(V), VBS), g.shKnightCloak, darkena(col, 1, 0xFF));
      queuepoly(VHEAD1(V), g.shWestHat1, darkena(col, 2, 0xFF));
      queuepoly(VHEAD2(V), g.shWestHat2, darkena(col, 1, 0xFF));
      queuepoly(VHEAD(V), g.shPFace, darkena(0xFFFF80, 0, 0xFF));
      queuepoly(sm(VBODY(V), VBS), g.shGunInHand, darkena(col, 1, 0xFF));
      humanoid_eyes(V, 0x000000FF);
      return true;
    }

    case moNecromancer: {
      const VBS = sm(VBODY(V), otherbodyparts(V, darkena(col, 0, 0xFF), m, footphase));
      ShadowV(V, g.shPBody);
      queuepoly(VBS, g.shPBody, u32(0xC00000C0 | UNTRANS()));
      queuepoly(VHEAD(V), g.shHood, darkena(col, 1, 0xFF));
      humanoid_eyes(V, 0xFF0000FF);
      return true;
    }

    case moDraugr: {
      const VBS = sm(VBODY(V), otherbodyparts(V, u32(0x483828D0 | UNTRANS()), m, footphase));
      queuepoly(VBS, g.shPBody, u32(0x483828D0 | UNTRANS()));
      queuepoly(VBS, g.shPSword, u32(0xFFFFD0A0 | UNTRANS()));
      queuepoly(VHEAD(V), g.shPHead, u32(0x483828D0 | UNTRANS()));
      humanoid_eyes(V, 0xFF0000FF, 0x483828FF);
      // queuepoly(V, cgi.shSkull, 0xC06020D0);
      //queuepoly(V, cgi.shSkullEyes, 0x000000D0);
      //  queuepoly(V, cgi.shWightCloak, 0xC0A080A0);
      let b = where ? where.cpdist : 0;
      b--;
      if (b < 0) b = 0;
      if (b > 6) b = 6;
      queuepoly(VHEAD1(V), g.shWightCloak, u32(u32(0x605040A0 | UNTRANS()) + u32(Math.imul(0x10101000, b))));
      return true;
    }

    case moVoidBeast: {
      const VBS = sm(VBODY(V), otherbodyparts(V, u32(0x080808D0 | UNTRANS()), m, footphase));
      queuepoly(VBS, g.shPBody, u32(0x080808D0 | UNTRANS()));
      queuepoly(VHEAD(V), g.shPHead, u32(0x080808D0 | UNTRANS()));
      queuepoly(VHEAD(V), g.shWightCloak, u32(0xFF0000A0 | UNTRANS()));
      humanoid_eyes(V, 0xFF0000FF, 0x080808FF);
      return true;
    }

    case moGoblin: {
      const VBS = sm(VBODY(V), otherbodyparts(V, darkena(col, 0, 0xFF), m, footphase));
      ShadowV(V, g.shYeti);
      queuepoly(VBS, g.shYeti, darkena(col, 0, 0xC0));
      queuepoly(VHEAD(V), g.shArmor, darkena(col, 1, 0xFF));
      humanoid_eyes(V, 0x800000FF, darkena(col, 0, 0xFF));
      return true;
    }

    case moLancer: case moFlailer: case moMiner: {
      let V2 = V;
      if (m === moLancer)
        V2 = sm(V, spin((where && where.type === 6) ? -ld_deg(60, A_PI) : -ld_deg(90, A_PI)));
      const Vh = at_smart_lof_sm(V2, g.HEAD);
      let Vb = at_smart_lof_sm(V2, g.BODY);
      Vb = sm(Vb, otherbodyparts(V2, darkena(col, 1, 0xFF), m, footphase));
      ShadowV(V2, g.shPBody);
      queuepoly(Vb, g.shPBody, darkena(col, 0, 0xC0));
      queuepoly(Vh, m === moFlailer ? g.shArmor : g.shHood, darkena(col, 1, 0xFF));
      if (m === moMiner)
        queuepoly(Vb, g.shPickAxe, darkena(0xC0C0C0, 0, 0xFF));
      if (m === moLancer)
        queuepoly(Vb, g.shPike, darkena(col, 0, 0xFF));
      if (m === moFlailer) {
        queuepoly(Vb, g.shFlailBall, darkena(col, 0, 0xFF));
        queuepoly(Vb, g.shFlailChain, darkena(col, 1, 0xFF));
        queuepoly(Vb, g.shFlailTrunk, darkena(col, 0, 0xFF));
      }
      humanoid_eyes(V, 0x000000FF);
      return true;
    }

    case moTroll: {
      const VBS = sm(VBODY(V), otherbodyparts(V, darkena(col, 0, 0xFF), m, footphase));
      ShadowV(V, g.shYeti);
      queuepoly(VBS, g.shYeti, darkena(col, 0, 0xC0));
      queuepoly(VHEAD1(V), g.shPHead, darkena(col, 1, 0xFF));
      queuepoly(VHEAD(V), g.shPFace, darkena(col, 2, 0xFF));
      humanoid_eyes(V, 0x004000FF, darkena(col, 0, 0xFF));
      return true;
    }

    case moFjordTroll: case moForestTroll: case moStormTroll: {
      const VBS = sm(VBODY(V), otherbodyparts(V, darkena(col, 0, 0xFF), m, footphase));
      ShadowV(V, g.shYeti);
      queuepoly(VBS, g.shYeti, darkena(col, 0, 0xC0));
      queuepoly(VHEAD1(V), g.shPHead, darkena(col, 1, 0xFF));
      queuepoly(VHEAD(V), g.shPFace, darkena(col, 2, 0xFF));
      humanoid_eyes(V, 0x004000FF, darkena(col, 0, 0xFF));
      return true;
    }

    case moDarkTroll: {
      const VBS = sm(VBODY(V), otherbodyparts(V, darkena(col, 0, 0xFF), m, footphase));
      ShadowV(V, g.shYeti);
      queuepoly(VBS, g.shYeti, darkena(col, 0, 0xC0));
      queuepoly(VHEAD1(V), g.shPHead, darkena(col, 1, 0xFF));
      queuepoly(VHEAD(V), g.shPFace, u32(0xFFFFFF80 | UNTRANS()));
      humanoid_eyes(V, 0x000000FF, darkena(col, 0, 0xFF));
      return true;
    }

    case moRedTroll: {
      const VBS = sm(VBODY(V), otherbodyparts(V, darkena(col, 0, 0xFF), m, footphase));
      ShadowV(V, g.shYeti);
      queuepoly(VBS, g.shYeti, darkena(0xFF8000, 0, 0xFF));
      queuepoly(VHEAD1(V), g.shPHead, darkena(col, 0, 0xC0));
      queuepoly(VHEAD(V), g.shPFace, u32(0xFFFFFF80 | UNTRANS()));
      humanoid_eyes(V, 0x000000FF, darkena(col, 0, 0xFF));
      return true;
    }

    case moEarthElemental: {
      const VBS = sm(VBODY(V), otherbodyparts(V, darkena(col, 1, 0xFF), m, footphase));
      ShadowV(V, g.shWaterElemental);
      queuepoly(VBS, g.shWaterElemental, darkena(col, 0, 0xC0));
      queuepoly(VHEAD1(V), g.shFemaleHair, darkena(col, 0, 0xFF));
      queuepoly(VHEAD(V), g.shPFace, u32(0xF0000080 | UNTRANS()));
      humanoid_eyes(V, 0xD0D000FF, darkena(col, 1, 0xFF));
      return true;
    }

    case moWaterElemental: {
      const VBS = sm(VBODY(V), otherbodyparts(V, watercolor(50), m, footphase));
      ShadowV(V, g.shWaterElemental);
      queuepoly(VBS, g.shWaterElemental, watercolor(0));
      queuepoly(VHEAD1(V), g.shFemaleHair, watercolor(100));
      queuepoly(VHEAD(V), g.shPFace, watercolor(200));
      humanoid_eyes(V, 0x0000FFFF, watercolor(150));
      return true;
    }

    case moFireElemental: {
      const VBS = sm(VBODY(V), otherbodyparts(V, darkena(firecolor(50), 0, 0xFF), m, footphase));
      ShadowV(V, g.shWaterElemental);
      queuepoly(VBS, g.shWaterElemental, darkena(firecolor(0), 0, 0xFF));
      queuepoly(VHEAD1(V), g.shFemaleHair, darkena(firecolor(100), 0, 0xFF));
      queuepoly(VHEAD(V), g.shPFace, darkena(firecolor(200), 0, 0xFF));
      humanoid_eyes(V, darkena(firecolor(200), 0, 0xFF), darkena(firecolor(50), 0, 0xFF));
      return true;
    }

    case moAirElemental: {
      const VBS = sm(VBODY(V), otherbodyparts(V, darkena(col, 0, 0x40), m, footphase));
      ShadowV(V, g.shWaterElemental);
      queuepoly(VBS, g.shWaterElemental, darkena(col, 0, 0x80));
      queuepoly(VHEAD1(V), g.shFemaleHair, darkena(col, 0, 0x80));
      queuepoly(VHEAD(V), g.shPFace, darkena(col, 0, 0x80));
      humanoid_eyes(V, 0xFFFFFFFF, darkena(col, 1, 0xFF));
      return true;
    }

    case moWorm: case moWormwait: case moHexSnake: {
      queuepoly(V, g.shWormHead, darkena(col, 0, 0xFF));
      queuepolyat(V, g.shWormEyes, 0xFF, PPR.ONTENTACLE_EYES);
      return true;
    }

    case moDragonHead: {
      queuepoly(V, g.shDragonHead, darkena(col, 0, 0xFF));
      queuepolyat(V, g.shDragonEyes, 0xFF, PPR.ONTENTACLE_EYES);
      const noscolor = 0xFF0000FF;
      queuepoly(V, g.shDragonNostril, noscolor);
      queuepoly(sm(V, lmirror()), g.shDragonNostril, noscolor);
      return true;
    }

    case moDragonTail: {
      queuepoly(V, g.shDragonSegment, darkena(col, 0, 0xFF));
      return true;
    }

    case moTentacle: case moTentaclewait: case moTentacleEscaping: {
      queuepoly(V, g.shTentHead, darkena(col, 0, 0xFF));
      ShadowV(V, g.shTentHead, PPR.GIANTSHADOW);
      return true;
    }

    case moAsteroid: {
      queuepoly(V, g.shAsteroid[1], darkena(col, 0, 0xFF));
      return true;
    }

    case moDonkey: {
      ShadowV(V, g.shBullBody);
      const hoofcol = darkena(gradient(0, col, 0, .65, 1), 0, 0xFF);
      if (G.mmspatial || footphase)
        animallegs(VALEGS(V), moRagingBull, hoofcol, footphase);
      queuepoly(VABODY(V), g.shBullBody, darkena(gradient(0, col, 0, .60, 1), 0, 0xFF));
      queuepoly(VAHEAD(V), g.shDonkeyHead, darkena(col, 0, 0xFF));
      queuepoly(VAHEAD(V), g.shDonkeyEar, darkena(0xFFFFFF, 0, 0xFF));
      queuepoly(sm(VAHEAD(V), lmirror()), g.shDonkeyEar, darkena(0xFFFFFF, 0, 0xFF));
      queuepoly(VAHEAD(V), g.shDonkeyEye, darkena(0, 0, 0xFF));
      queuepoly(sm(VAHEAD(V), lmirror()), g.shDonkeyEye, darkena(0, 0, 0xFF));
      queuepoly(VAHEAD(V), g.shDonkeyNose, darkena(0xFFFFFF, 0, 0xFF));
      queuepoly(VAHEAD(V), g.shDonkeyNose1, darkena(0, 0, 0xFF));
      queuepoly(sm(VAHEAD(V), lmirror()), g.shDonkeyNose1, darkena(0, 0, 0xFF));
      return true;
    }

    // CAP_COMPLEX2
    case moAnimatedDie: case moAngryDie: {
      if (where)
        dice_draw_die(where, V, 1, darkena(col, 0, 0xFF));
      else
        queuepoly(V, g.shDodeca, darkena(col, 0, 0xFF));
      return true;
    }

    default: break;
  }

  if (isPrincess(m)) return princess();

  else if (isBull(m)) {
    ShadowV(V, g.shBullBody);
    const hoofcol = darkena(gradient(0, col, 0, .65, 1), 0, 0xFF);
    if (G.mmspatial || footphase)
      animallegs(VALEGS(V), moRagingBull, hoofcol, footphase);
    queuepoly(VABODY(V), g.shBullBody, darkena(gradient(0, col, 0, .80, 1), 0, 0xFF));
    queuepoly(VAHEAD(V), g.shBullHead, darkena(col, 0, 0xFF));
    queuepoly(VAHEAD(V), g.shBullHorn, darkena(0xFFFFFF, 0, 0xFF));
    queuepoly(sm(VAHEAD(V), lmirror()), g.shBullHorn, darkena(0xFFFFFF, 0, 0xFF));
  }

  else if (isBug(m)) {
    ShadowV(V, g.shBugBody);
    if (!G.mmspatial && !footphase)
      queuepoly(VABODY(V), g.shBugBody, darkena(col, 0, 0xFF));
    else {
      animallegs(VALEGS(V), moBug0, darkena(col, 0, 0xFF), footphase);
      queuepoly(VABODY(V), g.shBugAntenna, darkena(col, 1, 0xFF));
    }
    queuepoly(VABODY(V), g.shBugArmor, darkena(col, 1, 0xFF));
  }
  else if (isSwitch(m)) {
    queuepoly(VFISH(V), g.shJelly, darkena(col, 0, 0xD0));
    queuepolyat(VBODY(V), g.shJelly, darkena(col, 0, 0xD0), PPR.MONSTER_BODY);
    queuepolyat(VHEAD(V), g.shJelly, darkena(col, 0, 0xD0), PPR.MONSTER_HEAD);
    queuepolyat(VHEAD(V), g.shSlimeEyes, 0xFF, PPR.MONSTER_HEAD);
  }
  else if (isDemon(m)) {
    const VBS = sm(VBODY(V), otherbodyparts(V, darkena(col, 0, 0xC0), m, footphase));
    queuepoly(VBS, g.shPBody, darkena(col, 1, 0xC0));
    ShadowV(V, g.shPBody);
    let acol = col;
    if (xch === 'D'.charCodeAt(0)) acol = 0xD0D0D0;
    queuepoly(VHEAD(V), g.shDemon, darkena(acol, 0, 0xFF));
    humanoid_eyes(V, 0xFF0000FF, 0xC00000FF);
  }
  else if (isMagneticPole(m)) {
    if (m === moNorthPole)
      queuepolyat(sm(VBODY(V), spin180()), g.lash_default.shIBranch, 0x000000C0, PPR.TENTACLE1);
    queuepolyat(VBODY(V), g.shDisk, darkena(col, 0, 0xFF), PPR.MONSTER_BODY);
  }
  else if (isMetalBeast(m) || m === moBrownBug) {
    ShadowV(V, g.shTrylobite);
    if (!G.mmspatial)
      queuepoly(VABODY(V), g.shTrylobite, darkena(col, 1, 0xC0));
    else {
      queuepoly(VABODY(V), g.shTrylobiteBody, darkena(col, 1, 0xFF));
      animallegs(VALEGS(V), moMetalBeast, darkena(col, 1, 0xFF), footphase);
    }
    const acol = col;
    queuepoly(VAHEAD(V), g.shTrylobiteHead, darkena(acol, 0, 0xFF));
  }
  else if (m === moHexer) {
    const VBS = sm(VBODY(V), otherbodyparts(V, darkena(col, 1, 0xFF), m, footphase));
    ShadowV(V, g.shFemaleBody);
    queuepoly(VBS, g.shFemaleBody, darkena(0x800080, 0, 0xFF));
    queuepoly(VHEAD1(V), g.shWitchHair, darkena(0xFF00FF, 1, 0xFF));
    queuepoly(VHEAD(V), g.shPFace, darkena(0xFFFFFF, 0, 0xFF));
    queuepoly(VBS, g.shWitchDress, darkena(col, 1, 0xC0));
    humanoid_eyes(V, 0xF000F0FF);
  }
  else if (isWitch(m)) {
    const VBS = sm(VBODY(V), otherbodyparts(V, darkena(col, 1, 0xFF), m, footphase));
    let cc = 0xFF;
    if (m === moWitchGhost) cc = Math.trunc(0x85 + 120 * sintick(160));
    if (m === moWitchWinter && where) drawWinter(V, 0, iinf[itOrbWinter].color);
    if (m === moWitchFlash && where) drawFlash_sm(V);
    if (m === moWitchSpeed && where) drawSpeed(V);
    if (m === moWitchFire) col = firecolor(0);
    ShadowV(V, g.shFemaleBody);
    queuepoly(VBS, g.shFemaleBody, darkena(col, 0, cc));
    //    queuepoly(cV2, ct, cgi.shPSword, darkena(col, 0, 0XFF));
    //    queuepoly(V, cgi.shHood, darkena(col, 0, 0XC0));
    if (m === moWitchFire) col = firecolor(100);
    queuepoly(VHEAD1(V), g.shWitchHair, darkena(col, 1, cc));
    if (m === moWitchFire) col = firecolor(200);
    queuepoly(VHEAD(V), g.shPFace, darkena(col, 0, cc));
    if (m === moWitchFire) col = firecolor(300);
    queuepoly(VBS, g.shWitchDress, darkena(col, 1, 0xC0));
    humanoid_eyes(V, 0x000000FF);
  }

  // just for the HUD glyphs...
  else if (isAnyIvy(m)) {
    queuepoly(VBODY(V), g.shILeaf[0], darkena(col, 0, 0xFF));
  }

  else
    draw_ascii_or_zh(V1, minf[m].glyph, minf[m].name, asciicol, 1.5, 1);

  return true;
}

/** #define NOCOLOR 0 (hyper.h) */
const NOCOLOR = 0;

function drawMonsterTypeDH(m: eMonster, where: cell, V: shiftmatrix, col: number, dh: boolean, footphase: number, asciicol: number): boolean {
  const p = G.poly_outline;
  try {
    if (dh) {
      G.poly_outline = OUTLINE_DEAD;
      G.darken++;
    }
    const b = drawMonsterType(m, where, V, col, footphase, asciicol);
    if (dh) {
      G.darken--;
    }
    return b;
  } finally { G.poly_outline = p; }
}

// EX shiftmatrix playerV: G.playerV

let last_wormsegment = -1;
const wormsegments: (() => void)[][] = [];

function add_segment(d: number, s: () => void): void {
  while (isize(wormsegments) <= d) wormsegments.push([]);
  last_wormsegment = Math.max(last_wormsegment, d);
  wormsegments[d].push(s);
}

export function drawWormSegments(): void {
  for (let i = 0; i <= last_wormsegment; i++) {
    for (const f of wormsegments[i]) f();
    wormsegments[i].length = 0;
  }
  last_wormsegment = -1;
}

// EX bool dont_face_pc: G.dont_face_pc; EX shiftmatrix die_target: G.die_target

function taildist(c: cell): number {
  let s = 0;
  while (s < 1000 && c && c.mondir !== NODIR && isWorm(c.monst)) {
    s++; c = c.move(c.mondir);
  }
  return s;
}

export function drawMonster(Vparam: shiftmatrix, _ct: number, c: cell, col: number, asciicol: number): boolean {
  // CAP_SHAPES
  const g = cgi();

  const darkhistory = G.history_includeHistory && G.history_inkillhistory.has(c);
  let outline = OUTLINE_NONE;

  if (doHighlight()) {
    outline =
      (isPlayerOn(c) || isFriendly(c)) ? OUTLINE_FRIEND :
        noHighlight(c.monst) ? OUTLINE_NONE :
          OUTLINE_ENEMY;
    G.poly_outline = outline;
  }

  // highlight faraway enemies if that's needed
  if (G.vid.faraway_highlight && c.cpdist >= 6 && G.vid.faraway_highlight <= get_threat_level(c)) {

    // basic red-green oscillation
    const r = Math.ceil(255 * Math.abs(sintick(1000, 0.25))) >>> 0;
    const gg = Math.ceil(255 * Math.abs(sintick(1000, 0.00))) >>> 0;
    let hlc = u32((r << 16) + (gg << 8));

    hlc = gradient(col, hlc, 0, G.vid.faraway_highlight_color, 100);

    if (c.cpdist === 6)
      hlc = gradient(0, hlc, 0, 1, 1.5);

    addauraspecial(tC0_sm(Vparam), hlc, 0);
  }

  let nospins = false;
  const footphaseb = { v: 0 }, footphase = { v: 0 };

  const Vs = { v: Vparam }; nospins = applyAnimation(c, Vs, footphase, LAYER_SMALL);
  const Vb = { v: Vparam }; const nospinb = applyAnimation(c, Vb, footphaseb, LAYER_BIG);
  //  nospin = true;

  const m = c.monst;

  const half_elliptic = elliptic() && GDIM() === 3 && WDIM() === 2;
  const mirrored = det(Vparam.T) > 0;

  let res = !!m;

  if (!m) { /* nothing */ }

  else if (half_elliptic && mirrored !== !!c.monmirror && !isMimic(m)) { /* nothing */ }

  else if (isAnyIvy(c) || isWorm(c)) {

    if ((m === moHexSnake || m === moHexSnakeTail) && c.hitpoints === 2) {
      let d = c.mondir;
      if (d === NODIR)
        for (let i = 0; i < c.type; i++) {
          const c2 = c.move(i); if (!c2) continue;
          if (among(c2.monst, moHexSnakeTail, moHexSnake) && c2.mondir === c.c.spin(i))
            d = i;
        }
      if (d === NODIR) { d = hrand(c.type); createMov(c, d); }
      const c1 = nestcolors[pattern_threecolor(c)];
      const c2 = nestcolors[pattern_threecolor(c.move(d))];
      col = (c1 + c2); // sum works because they are dark and should be brightened
    }

    if (isDragon(c.monst) && c.stuntime === 0) col = 0xFF6000;

    if (GDIM() === 3)
      throw new NotPorted('drawMonster: addradar (3D)'); // STAGE2-STUB (3D)

    const Vb0 = Vb.v;
    if (c.mondir !== NODIR && GDIM() === 3 && isAnyIvy(c)) {
      throw new NotPorted('drawMonster: 3D ivy'); // STAGE2-STUB (3D)
    }
    else if (c.mondir !== NODIR) {

      if (G.mmmon) {
        let length = 0;
        const c2 = c.move(c.mondir);

        if (nospinb) {
          const len = { v: 0 };
          chainAnimation(c, c2, Vb, smul(Vparam, adj(c, c.mondir)), len);
          length = len.v;
        }
        else {
          Vb.v = sm(Vb.v, ddspin(c, c.mondir));
          length = cellgfxdist(c, c.mondir);
        }

        let Vbn = Vb.v;
        if (g.emb.no_spin() && c.mondir !== NODIR) {
          const Vbn_ = { v: sm(Vparam, adj(c, c.mondir)) };
          const dummy = { v: 0 };
          applyAnimation(c.move(c.mondir), Vbn_, dummy, LAYER_BIG);
          Vbn = Vbn_.v;
        }

        if (c.monmirror) Vb.v = sm(Vb.v, lmirror());

        if (drawUserShape()) // mapeditor::drawUserShape(Vb, mapeditor::sgMonster, c->monst, (col << 8) + 0xFF, c)
          return false;

        if (isIvy(c) || isMutantIvy(c) || c.monst === moFriendlyIvy) {
          const lash = (G.geometry === gNormal && BITRUNCATED()) ? g.lash_default : g.get_lash(hdist0(tmulh(adj(c, c.mondir), C0())));
          queuepoly(Vb.v, lash.shIBranch, u32((col << 8) + 0xFF));
          christmas_lights(c, Vb.v);
        }

        else if (c.monst === moDragonHead || c.monst === moDragonTail) {
          const part = dragon_bodypart(c, dragon_findhead(c));
          if (part !== ch('2')) {
            queuepoly(at_smart_lof_sm(Vb.v, g.ABODY), g.shDragonSegment, darkena(col, 0, 0xFF));
            ShadowV(Vb.v, g.shDragonSegment, PPR.GIANTSHADOW);
          }
        }
        else {
          if (c.monst === moTentacleGhost) {
            const cwtV = cd().player_matrix;
            const V0 = G.history_on ? unshift(tC0_sm(Vs.v)) : inverse_shift_sp(cwtV, tC0_sm(Vs.v));
            const V1 = tmulh(lspintox(V0), V0);
            Vs.v = sm(sm(sm(cwtV, lrspintox(V0)), rpushxto0(V1)), lpispin());
            drawMonsterType(moGhost, c, Vs.v, col, footphase.v, asciicol);
            col = minf[moTentacletail].color;
          }
          const hexsnake = c.monst === moHexSnake || c.monst === moHexSnakeTail;
          const thead = c.monst === moTentacle || c.monst === moTentaclewait || c.monst === moTentacleEscaping;
          const shp = hexsnake ? g.shWormSegment : g.shSmallWormSegment;
          const wav = hexsnake ? 0 :
            c.monst < moTentacle ? 1 / 1.5 :
              1;
          let col0 = col;
          if (c.monst === moWorm || c.monst === moWormwait)
            col0 = minf[moWormtail].color;
          else if (thead)
            col0 = minf[moTentacletail].color;
          const Vbc = Vb.v, Vbnc = Vbn, cmon = c.monst, outl = outline, lengthc = length;
          add_segment(taildist(c), () => {
            for (let i = 11; i >= 0; i--) {
              if (i < 3 && (cmon === moTentacle || cmon === moTentaclewait)) continue;
              if (doHighlight())
                G.poly_outline = outl;
              let Vbx = Vbc;
              if (g.emb.no_spin()) {
                void Vbnc;
                throw new NotPorted('drawMonster: worm segments without spin (embedded)'); // STAGE2-STUB
              }
              else {
                if (WDIM() === 2) Vbx = sm(Vbx, spin(c_sin(TAU * i / 12) * wav / (i + .1)));
                Vbx = sm(Vbx, lxpush(lengthc * (i) / 12.0));
              }
              // shiftmatrix Vbx2 = Vnext * xpush(length2 * i / 6.0);
              // Vbx = Vbx * rspintox(inverse(Vbx) * Vbx2 * C0) * lpispin();
              ShadowV(Vbx, shp, PPR.GIANTSHADOW);
              queuepoly(at_smart_lof_sm(Vbx, g.ABODY), shp, u32((col0 << 8) + 0xFF));
            }
          });
        }
      }

      else {
        const T = sm(Vparam, ddspin(c, c.mondir));
        const col = darkena(0x606020, 0, 0xFF);
        for (let u = -1; u <= 1; u++)
          queueline(smulh(T, xspinpush0(ld_deg(90, A_PI), u * g.crossf / 5)), smulh(sm(T, xspinpush(0, g.crossf)), xspinpush0(ld_deg(90, A_PI), u * g.crossf / 5)), col, 2 + G.vid.linequality);
      }
    }

    if (G.mmmon) {
      if (isAnyIvy(c)) {
        if (mhybrid()) {
          throw new NotPorted('drawMonster: hybrid ivy'); // STAGE2-STUB (other geometries)
        }
        else if (GDIM() === 3) {
          throw new NotPorted('drawMonster: 3D ivy'); // STAGE2-STUB (3D)
        }
        else {
          if (c.monmirror) Vb.v = sm(Vb.v, lmirror());
          queuepoly(at_smart_lof_sm(Vb.v, g.ABODY), g.shILeaf[ctof(c)], darkena(col, 0, 0xFF));
          ShadowV(Vb.v, g.shILeaf[ctof(c)], PPR.GIANTSHADOW);
        }
      }
      else if (m === moWorm || m === moWormwait || m === moHexSnake) {
        Vb.v = sm(Vb.v, lpispin());
        if (c.monmirror) Vb.v = sm(Vb.v, lmirror());
        const Vbh = at_smart_lof_sm(Vb.v, g.AHEAD);
        queuepoly(Vbh, g.shWormHead, darkena(col, 0, 0xFF));
        queuepolyat(Vbh, g.shWormEyes, 0xFF, PPR.ONTENTACLE_EYES);
        ShadowV(Vb.v, g.shWormHead, PPR.GIANTSHADOW);
      }
      else if (m === moDragonHead) {
        if (c.monmirror) Vb.v = sm(Vb.v, lmirror());
        const Vbh = at_smart_lof_sm(Vb.v, g.AHEAD);
        ShadowV(Vb.v, g.shDragonHead, PPR.GIANTSHADOW);
        queuepoly(Vbh, g.shDragonHead, darkena(col, c.hitpoints ? 0 : 1, 0xFF));
        queuepolyat(Vbh/* * lpispin() */, g.shDragonEyes, 0xFF, PPR.ONTENTACLE_EYES);

        const noscolor = (c.hitpoints === 1 && c.stuntime === 1) ? 0xFF0000FF : 0xFF;
        queuepoly(Vbh, g.shDragonNostril, noscolor);
        queuepoly(sm(Vbh, lmirror()), g.shDragonNostril, noscolor);
      }
      else if (m === moTentacle || m === moTentaclewait || m === moTentacleEscaping) {
        Vb.v = sm(Vb.v, lpispin());
        if (c.monmirror) Vb.v = sm(Vb.v, lmirror());
        const Vbh = at_smart_lof_sm(Vb.v, g.AHEAD);
        queuepoly(Vbh, g.shTentHead, darkena(col, 0, 0xFF));
        ShadowV(Vb.v, g.shTentHead, PPR.GIANTSHADOW);
      }
      else if (m === moDragonTail) {
        let c2: cell = null!;
        for (let i = 0; i < c.type; i++)
          if (c.move(i) && isDragon(c.move(i).monst) && c.move(i).mondir === c.c.spin(i))
            c2 = c.move(i);
        const nd = neighborId(c, c2);
        const part = dragon_bodypart(c, dragon_findhead(c));
        if (part === ch('t')) {
          if (nospinb) {
            const length = { v: 0 };
            chainAnimation(c, c2, Vb, smul(Vparam, adj(c, nd)), length);
            Vb.v = sm(Vb.v, lpispin());
          }
          else {
            Vb.v = sm(Vb0, ddspin180(c, nd));
          }
          if (c.monmirror) Vb.v = sm(Vb.v, lmirror());
          const Vbb = at_smart_lof_sm(Vb.v, g.ABODY);
          queuepoly(Vbb, g.shDragonTail, darkena(col, c.hitpoints ? 0 : 1, 0xFF));
          ShadowV(Vb.v, g.shDragonTail, PPR.GIANTSHADOW);
        }
        else if (true) {
          if (nospinb) {
            const length = { v: 0 };
            chainAnimation(c, c2, Vb, smul(Vparam, adj(c, nd)), length);
            Vb.v = sm(Vb.v, lpispin());
            let ang = chainAngle(c, Vb, c.move(c.mondir), G.currentmap.spin_angle(c, c.mondir) - G.currentmap.spin_angle(c, nd), Vparam);
            ang /= 2;
            Vb.v = sm(Vb.v, spin(M_PI - ang));
          }
          else {
            /* todo what if no spin_angle */
            const hdir0 = G.currentmap.spin_angle(c, nd) + M_PI;
            let hdir1 = G.currentmap.spin_angle(c, c.mondir);
            hdir1 = cyclefix(hdir1, hdir0);
            Vb.v = sm(Vb0, spin((hdir0 + hdir1) / 2 + M_PI));
          }
          if (c.monmirror) Vb.v = sm(Vb.v, lmirror());
          const Vbb = at_smart_lof_sm(Vb.v, g.ABODY);
          if (part === ch('l') || part === ch('2')) {
            queuepoly(Vbb, g.shDragonLegs, darkena(col, c.hitpoints ? 0 : 1, 0xFF));
          }
          queuepoly(Vbb, g.shDragonWings, darkena(col, c.hitpoints ? 0 : 1, 0xFF));
        }
      }
      else {
        if (c.monst === moTentacletail && c.mondir === NODIR) {
          if (c.monmirror) Vb.v = sm(Vb.v, lmirror());
          queuepoly(GDIM() === 3 ? at_smart_lof_sm(Vb.v, g.ABODY) : Vb.v, g.shWormSegment, darkena(col, 0, 0xFF));
        }
        else if (c.mondir === NODIR) {
          const hexsnake = c.monst === moHexSnake || c.monst === moHexSnakeTail;
          let c2: cell = null!;
          for (let i = 0; i < c.type; i++)
            if (c.move(i) && isWorm(c.move(i).monst) && c.move(i).mondir === c.c.spin(i))
              c2 = c.move(i);
          const nd = neighborId(c, c2);
          if (nospinb) {
            const length = { v: 0 };
            chainAnimation(c, c2, Vb, smul(Vparam, adj(c, nd)), length);
            Vb.v = sm(Vb.v, lpispin());
          }
          else {
            Vb.v = sm(Vb0, ddspin180(c, nd));
          }
          if (c.monmirror) Vb.v = sm(Vb.v, lmirror());
          const Vbb = sm(at_smart_lof_sm(Vb.v, g.ABODY), lpispin());
          const shp = hexsnake ? g.shWormTail : g.shSmallWormTail;
          queuepoly(Vbb, shp, darkena(col, 0, 0xFF));
          ShadowV(Vb.v, shp, PPR.GIANTSHADOW);
        }
      }
    }
    else res = res && drawMonsterType(c.monst, c, Vb.v, col, footphase.v, asciicol);
  }

  else if (isMimic(c)) {
    let xdir = 0, copies = 1;
    if (c.wall === waMirrorWall) {
      xdir = mirror_mirrordir(c);
      copies = 2;
      if (xdir === -1) { copies = 6; xdir = 0; }
    }
    for (const mm of G.mirror_mirrors) if (c === mm[1].at)
      for (let d = 0; d < copies; d++) {
        G.multi_cpid = mm[0];
        let cw = mm[1].clone();
        if (d & 1) cw = cw.mirrorat(xdir);
        if (d >= 2) cw.add(2);
        if (d >= 4) cw.add(2);
        Vs.v = Vparam;
        let mirr = cw.mirrored;
        if (mirrored !== mirr && half_elliptic) continue;
        const T = { v: shiftless_t(Id) };
        nospins = applyAnimation(G.cwt.at, T, footphase, LAYER_SMALL);
        const Vs1 = Vs.v;
        if (nospins)
          Vs.v = sm(sm(sm(Vs.v, ddspin(c, cw.spin, 0)), iddspin(G.cwt.at, G.cwt.spin, 0)), unshift_sm(T.v));
        else
          Vs.v = sm(Vs.v, ddspin(c, cw.spin, 0));
        if (mirr) Vs.v = sm(Vs.v, lmirror());
        if (G.inmirrorcount & 1) mirr = !mirr;
        col = mirrorcolor(G.geometry === gElliptic ? det(Vs.v.T) < 0 : mirr);
        if (!mouseout() && !nospins && GDIM() === 2) {
          const P2 = smulh(Vs.v, inverse_shift_sp(G.inmirrorcount ? ocwtV : cd().player_matrix, G.mouseh));
          queuestr_sp(P2, Math.trunc(10 * G.mapfontscale / 100), 'x', 0xFF00);
        }

        if (G.multi_alwaysuse) {
          let dir = G.multi_whereto[G.multi_cpid].d;
          if (dir >= 0) {
            dir = cw.plus(dir).spin;
            let h = tC0(adj(cw.at, dir));
            const part = (1 + sintick(250)) / 2;
            h = normalize(hadd(hmul(h, part), hmul(C0(), 1 - part)));
            queuestr_sp(smulh(Vs1, h), Math.trunc(10 * G.mapfontscale / 100), 'x', 0xFF00);
          }
        }

        // CAP_SDLJOY
        if (G.joydir.d >= 0 && WDIM() === 2) {
          const dir = cw.plus(G.joydir.d).spin;
          let h = tC0(adj(cw.at, dir));
          const part = (1 + sintick(250)) / 2;
          h = normalize(hadd(hmul(h, part), hmul(C0(), 1 - part)));
          queuestr_sp(smulh(Vs1, h), Math.trunc(10 * G.mapfontscale / 100), 'x', 0xFF00);
        }

        if (!nospins && G.flipplayer) Vs.v = sm(Vs.v, lpispin());

        res = res && drawMonsterType(moMimic, c, Vs.v, col, footphase.v, asciicol);
        drawPlayerEffects(Vs.v, Vparam, c, c.monst);
      }
  }

  // illusions face randomly

  else if (c.monst === moIllusion) {
    G.multi_cpid = 0;
    if (c.monmirror) Vs.v = sm(Vs.v, lmirror());
    drawMonsterType(c.monst, c, Vs.v, col, footphase.v, asciicol);
    drawPlayerEffects(Vs.v, Vparam, c, c.monst);
  }

  // wolves face the heat

  else if (c.monst === moWolf && c.cpdist > 1) {
    if (!nospins) {
      let d = 0;
      let bheat = -999;
      for (let i = 0; i < c.type; i++) if (c.move(i) && c.move(i).LHU.heat > bheat) {
        bheat = c.move(i).LHU.heat;
        d = i;
      }
      Vs.v = sm(Vs.v, ddspin(c, d, 0));
    }
    if (c.monmirror) Vs.v = sm(Vs.v, lmirror());
    return drawMonsterTypeDH(m, c, Vs.v, col, darkhistory, footphase.v, asciicol);
  }

  else if (c.monst === moKrakenT) {
    if (c.hitpoints === 0) col = 0x404040;
    if (nospinb) {
      const length = { v: 0 };
      chainAnimation(c, c.move(c.mondir), Vb, smul(Vparam, adj(c, c.mondir)), length);
      Vb.v = sm(Vb.v, lpispin());
      Vb.v = sm(Vb.v, xpush(g.tentacle_length - cellgfxdist(c, c.mondir)));
    }
    else if (NONSTDVAR()) {
      throw new NotPorted('drawMonster: kraken in a non-standard variation'); // STAGE2-STUB (other geometries)
    }
    else {
      Vb.v = sm(Vb.v, ddspin180(c, c.mondir));
      Vb.v = sm(Vb.v, xpush(g.tentacle_length - cellgfxdist(c, c.mondir)));
    }
    if (c.monmirror) Vb.v = sm(Vb.v, lmirror());

    // if(ctof(c) && !masterless) Vb = Vb * xpush(hexhexdist - hcrossf);
    // return (!BITRUNCATED) ? tessf * gp::scale : (c->type == 6 && (i&1)) ? hexhexdist : cgi.crossf;
    res = res && drawMonsterTypeDH(m, c, Vb.v, col, darkhistory, footphase.v, asciicol);
  }

  // golems, knights, and hyperbugs don't face the player (mondir-controlled)
  // also whatever in the lineview mode, and whatever in the quotient geometry

  else if (isDie(c.monst)) {
    let U = inverse_shift(Vparam, Vs.v);
    U = rgpushxto0(tC0(U));
    G.die_target = Vparam;
    res = res && drawMonsterTypeDH(m, c, sm(Vparam, U), col, darkhistory, footphase.v, asciicol);
  }

  else if ((hasFacing(c) && c.mondir !== NODIR) || G.history_on || quotient() || G.dont_face_pc) {
    if (c.monst === moKrakenH) { Vs.v = Vb.v; nospins = nospinb; }
    if (!nospins && c.mondir < c.type) Vs.v = sm(Vs.v, ddspin180(c, c.mondir));
    if (c.monst === moPair) Vs.v = sm(Vs.v, xpush(-.12));
    if (c.monmirror) Vs.v = sm(Vs.v, lmirror());
    if (isFriendly(c)) drawPlayerEffects(Vs.v, Vparam, c, c.monst);
    res = res && drawMonsterTypeDH(m, c, Vs.v, col, darkhistory, footphase.v, asciicol);
  }

  else {
    // other monsters face the player

    if (!nospins) {
      const where = (c.monst === moMirrorSpirit && G.inmirrorcount) ? ocwtV : cd().player_matrix;
      if (g.emb.is_euc_in_product()) { /* nothing */ }
      else if (WDIM() === 2 || mproduct()) {
        const V0 = inverse_shift_sp(Vs.v, smulh(where, tile_center()));
        if (gproduct()) throw new NotPorted('drawMonster: product geometry'); // STAGE2-STUB (other geometries)

        if (hypot_d(2, tC0(unshift_sm(Vs.v))) > 1e-3) {
          Vs.v = sm(Vs.v, lrspintox(V0));
        }
      }
      else if (!sl2()) {
        const V0 = inverse_shift_sp(Vs.v, tC0_sm(where));
        Vs.v = sm(Vs.v, lrspintox(V0));
        // cwtV * rgpushxto0(inverse(cwtV) * tC0(Vs));
      }
      if (c.monst === moHunterChanging)
        Vs.v = sm(Vs.v, (mhybrid() ? spin180() : cspin180(WDIM() - 2, WDIM() - 1)));
    }
    if (c.monmirror) Vs.v = sm(Vs.v, lmirror());

    if (c.monst === moShadow)
      G.multi_cpid = c.hitpoints;

    res = res && drawMonsterTypeDH(m, c, Vs.v, col, darkhistory, footphase.v, asciicol);
  }

  for (let i = 0; i < numplayers(); i++) if (c === playerpos(i) && !G.shmup_on && G.mapeditor_drawplayer &&
    !(G.hardcore && !G.canmove)) {
    const mirr = G.multi_players > 1 ? G.multi_player[i].mirrored : G.cwt.mirrored;
    if (half_elliptic && mirr !== mirrored) continue;
    if (!nospins) {
      Vs.v = G.playerV;
      if (G.multi_players > 1 ? G.multi_flipped[i] : G.flipplayer) Vs.v = sm(Vs.v, lpispin());
    }
    else {
      if (mirr) Vs.v = sm(Vs.v, lmirror());
    }
    G.multi_cpid = i;

    asciicol = getcs().uicolor >>> 8;

    drawPlayerEffects(Vs.v, Vparam, c, moPlayer);
    if (G.inmirrorcount && !mouseout() && !nospins && GDIM() === 2) {
      let h = inverse_shift_sp(ocwtV, G.mouseh);
      if (G.flipplayer) h = tmulh(lpispin(), h);
      const P2 = smulh(Vs.v, h);
      queuestr_sp(P2, Math.trunc(G.mapfontscale / 10), 'x', 0xFF00);
    }

    if (hide_player()) {
      G.first_cell_to_draw = false;
      if (WDIM() === 2 && GDIM() === 3) {
        drawPlayer(moPlayer, c, Vs.v, col, footphase.v, true);
        res = true;
      }
    }

    else if (isWorm(c.monst)) {
      const depth = geom3_factor_to_lev(wormhead(c) === c ? g.AHEAD : g.ABODY);
      footphase.v = 0;
      const q = { v: isize(G.ptds) };
      res = drawMonsterType(moPlayer, c, Vs.v, col, footphase.v, asciicol) || res;
      pushdown(c, q, Vs.v, -depth, true, false);
    }

    else res = drawMonsterType(moPlayer, c, Vs.v, col, footphase.v, asciicol) || res;
  }
  return res;
}

export function christmas_color(d: number, _simple: boolean): number {
  const cols = [0x10101, 0x10100, 0x000001, 0x00100, 0x10000];
  let v = cols[gmod(d, 5)];
  v *= 0x3F;
  let mode: number;
  const ticks = G.ticks;
  if (false) {
    mode = gmod(Math.trunc(ticks / 20000), 2) ? 1 : 3;
  }
  else {
    const t = gmod(ticks, 11000);
    if (t > 10000) mode = 4;
    else mode = 1 + gmod(Math.trunc(ticks / 11000), 3);
  }
  switch (mode) {
    case 0:
      break;
    case 1:
      if ((Math.trunc(ticks / 100) - d) % 16) v = 0;
      break;
    case 2: {
      const z = gmod(d * 500 - ticks, 8000);
      if (z > 1500) v = 0;
      else if (z < 500) { v = Math.trunc(v / 0x3F); v = u32(Math.imul(v, Math.trunc(0x3F * z / 500))); }
      else if (z > 1000) { v = Math.trunc(v / 0x3F); v = u32(Math.imul(v, Math.trunc(0x3F * (1500 - z) / 500))); }
      break;
    }
    case 3:
      if ((Math.trunc(-ticks / 100) - d) % 16) v = 0;
      break;
    case 4:
      v = Math.trunc(v / 0x3F);
      v = u32(Math.imul(v, Math.trunc(0x20 + 0x1F * (1 - c_cos(ticks / 500. * TAU)) / 2)));
      break;
  }
  return v;
}
import { gmod } from './hyper.ts';
import { isPlayerOn } from './pcmove.ts';

// EX std::unordered_map<cell*, array<int, 3>> shines, old_shines: G.shines, G.old_shines
// EX bool festive, festive_date, festive_option: G

function shines_at(c: cell): number[] {
  let s = G.shines.get(c);
  if (!s) { s = [0, 0, 0]; G.shines.set(c, s); }
  return s;
}

export function christmas_lights(c: cell, Vb: shiftmatrix): void {
  if (!G.festive) return;
  let lev = 0;
  if (isMutantIvy(c)) lev = (c.stuntime - 1) & 15;
  else {
    let c1 = c;
    while (lev < 100 && c1.cpdist <= 7 && (isIvy(c1.monst) || c1.monst === moFriendlyIvy) && !among(c1.monst, moIvyRoot) && c1.mondir !== NODIR) {
      c1 = c1.cmove(c1.mondir); lev++;
    }
  }
  const cn = c.cmove(c.mondir);
  const dist = hdist0(tmulh(adj(c, c.mondir), C0()));
  for (const a of [0, 1, 2]) {
    const col = christmas_color(3 * lev - a, c.monst === moMutant);
    const bri = Math.max(part(col, 0), Math.max(part(col, 1), part(col, 2)));
    const fcol = u32(0x7E + (col << 9) + Math.imul(0x1010101, Math.trunc(129 * bri / 0x3F)));
    queuepoly(sm(Vb, xpush(dist * (a * 2 + 1) / 6)), cgi().shChristmasLight, fcol);
    for (const p of [0, 1, 2]) {
      const val = part(col, p);
      if (!val) continue;
      const forCellEx = (cf: cell, f: (c1: cell) => void): void => {
        for (let i = 0; i < cf.type; i++) { const c1 = cf.move(i); if (!c1) continue; f(c1); }
      };
      if (a === 0) {
        shines_at(c)[p] += 2 * val;
        forCellEx(c, (c1) => { shines_at(c1)[p] += val; });
      }
      if (a === 2) {
        shines_at(cn)[p] += 2 * val;
        forCellEx(cn, (c1) => { shines_at(c1)[p] += val; });
      }
      if (a === 1) {
        shines_at(c)[p] += val;
        shines_at(cn)[p] += val;
        forCellEx(c, (c1) => { shines_at(c1)[p] += val >> 1; });
        forCellEx(cn, (c1) => { shines_at(c1)[p] += val >> 1; });
      }
    }
  }
}

