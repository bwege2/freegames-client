// graph-player.cpp of HyperRogue 13.1o: the player and mimic graphics (drawPlayer, drawMimic), the orb effects
// around the player (shield, speed, safety, flash, love, winter, lightning, curses, the sword), the movement
// arrows and the movement star. Stage 2, package D4 (PORTING-STAGE2.md). (C) Zeno Rogue, GPL-2.0-or-later;
// TypeScript port.
//
// Overloads: drawSafety() (safetyat = ticks) / drawSafety_sm(V, ct); drawLightning() / drawLightning_sm(V);
// drawFlash_sm(V) (animations.cpp has drawFlash(cell)). Not ported (STAGE2-STUB, NotPorted when reached): the 3D
// branches (queueball, addradar), shmup's (stage 3), the map editor's user shapes (none in stage 2).
import { G } from './globals.ts';
import { NotPorted, among, PPR, ORBBASE } from './hyper.ts';
import { ld_deg, c_sin, c_cos } from './cpp.ts';
import type { cell } from './locations.ts';
import {
  type transmatrix, type shiftmatrix, Id, smulh, smul, shiftless_t, rgpushxto0_sp, rgpushxto0, hpxy, tC0_sm,
  eupush_h, A_PI, M_PI, TAU, tmul, tmulh, tC0, xpush, xpush0, ypush, inverse_shift_sp, unshift_sm, iso_inverse,
  MirrorY, smalltangent,
} from './hyperpoint.ts';
import { GDIM, WDIM, euclid, sphere, S7, PURE, mhybrid } from './classes.ts';
import { tile_center, xspinpush0, spin, lmirror, lrspintox } from './embeddings.ts';
import { getcs } from './config.ts';
import { queueline, queuepoly, curvepoint, queuecurve, queuestr_V } from './drawing.ts';
import { cgi, geom3_lev_to_factor } from './geometry.ts';
import { drawstaratvec, chei_sm, ddspin180, at_smart_lof_sm } from './graph.ts';
import { darkena, watercolor, cloakcolor } from './colors.ts';
import { ptick, sintick } from './animations.ts';
import { rand, randd } from './rand.ts';
import {
  iinf, type eMonster, type eItem,
  itOrbShield, itOrbShell, itOrbTime, itOrbSpeed, itCurseGluttony, itCurseRepulsion, itOrbSword, itOrbSword2,
  itOrbSafety, itOrbFlash, itOrbLove, itOrbWinter, itOrbFire, itCurseWater, itOrbLightning, itOrbDiscord,
  itOrbFish, itOrbSide3, itOrbHorns, itOrbSide1, itCrossbow, itOrbThorns, itRevolver, itOrbSlaying,
  itCurseWeakness, itOrbBeauty, itOrbEmpathy,
  laHalloween, laWildWest,
  moPlayer, moBug0, moRunDog, moWolf, moWaterElemental, moShadow,
} from './content.ts';
import { isStunnable, isPushable } from './flags.ts';
import { bow_crossbow_mode } from './crossbow.ts';
import { sword_pos2, tortoise_seek } from './complex.ts';
import { confusingGeometry } from './hypgraph.ts';
import { vectodir } from './control.ts';
import {
  ShadowV, otherbodyparts, animallegs, humanoid_eyes, fc, tortoise_draw,
  VBODY, VBODY1, VBODY2, VBODY3, VHEAD, VHEAD1, VHEAD2, VLEG, VRAT, VALEGS, VABODY, VAHEAD,
} from './graph-monster.ts';

const sm = smul;

// EX int lightat, safetyat: G.lightat, G.safetyat
export function drawLightning(): void { G.lightat = G.ticks; }
export function drawSafety(): void { G.safetyat = G.ticks; }

/** #define PRING(i) for(double i=0; i<=cgi.S84+1e-6; i+= pow(.5, vid.linequality)) */
function PRING(f: (a: number) => void): void {
  const step = Math.pow(.5, G.vid.linequality);
  for (let i = 0; i <= cgi().S84 + 1e-6; i += step) f(i);
}

export function drawShield(V: shiftmatrix, it: eItem): void {
  // CAP_CURVE
  const ds = Math.fround(ptick(300));
  let col = iinf[it].color;
  if (it === itOrbShield && G.items[itOrbTime] && !G.orbused[it])
    col = (col & 0xFEFEFE) >>> 1;
  if (sphere() && G.cwt.at.land === laHalloween && !G.wmblack && !G.wmascii)
    col = 0;
  const g = cgi();
  const d = it === itOrbShield ? g.hexf : g.hexf - .1;
  const mt = sphere() ? 7 : 5;
  // MAXMDIM >= 4
  if (GDIM() === 3)
    throw new NotPorted('drawShield: queueball (3D)'); // STAGE2-STUB (3D)
  else {
    for (let a = 0; a <= g.S84 * mt + 1e-6; a += Math.pow(.5, G.vid.linequality))
      curvepoint(xspinpush0(a * g.S_step, d + c_sin(ds + ld_deg(90, A_PI) * a / mt) * .1));
    queuecurve(V, darkena(col, 0, 0xFF), 0x8080808, PPR.LINE);
  }
}

export function drawSpeed(V: shiftmatrix, scale = 1): void {
  // CAP_CURVE
  const ds = ptick(10);
  const col = darkena(iinf[itOrbSpeed].color, 0, 0xFF);
  const g = cgi();
  // MAXMDIM >= 4
  if (GDIM() === 3) throw new NotPorted('drawSpeed: queueball (3D)'); // STAGE2-STUB (3D)
  else
    for (let b = 0; b < g.S84; b += g.S14) {
      PRING((a) => {
        curvepoint(xspinpush0((ds + b + a) * g.S_step, g.hexf * a / g.S84 * scale));
      });
      queuecurve(V, col, 0x8080808, PPR.LINE);
    }
}

export function drawSafety_sm(V: shiftmatrix, ct: number): void {
  if (G.inHighQual) return;
  // CAP_QUEUE
  const ds = ptick(50);
  const col = darkena(iinf[itOrbSafety].color, 0, 0xFF);
  // MAXMDIM >= 4
  if (GDIM() === 3) throw new NotPorted('drawSafety: queueball (3D)'); // STAGE2-STUB (3D)
  const g = cgi();
  for (let a = 0; a < ct; a++)
    queueline(smulh(V, xspinpush0((ds + Math.trunc(a * g.S84 / ct)) * g.S_step, 2 * g.hexf)), smulh(V, xspinpush0((ds + Math.trunc((a + ((ct - 1) >> 1)) * g.S84 / ct)) * g.S_step, 2 * g.hexf)), col, G.vid.linequality);
}

export function drawFlash_sm(V: shiftmatrix): void {
  // CAP_CURVE
  const ds = Math.fround(ptick(300));
  let col = darkena(iinf[itOrbFlash].color, 0, 0xFF);
  col = (col & ~1) >>> 0;
  const g = cgi();
  for (let u = 0; u < 5; u++) {
    const rad = g.hexf * (2.5 + .5 * c_sin(ds + u * .3));
    // MAXMDIM >= 4
    if (GDIM() === 3) throw new NotPorted('drawFlash: queueball (3D)'); // STAGE2-STUB (3D)
    else {
      PRING((a) => curvepoint(xspinpush0(a * g.S_step, rad)));
      queuecurve(V, col, 0x8080808, PPR.LINE);
    }
  }
}

export function drawLove(V: shiftmatrix, hdir: number): void {
  // CAP_CURVE
  const ds = Math.fround(ptick(300));
  let col = darkena(iinf[itOrbLove].color, 0, 0xFF);
  col = (col & ~1) >>> 0;
  const g = cgi();
  for (let u = 0; u < 5; u++) {
    const V1 = chei_sm(V, u, 5);
    PRING((a) => {
      let d = (1 + c_cos(a * g.S_step)) / 2;
      let z = a; if (z > g.S42) z = g.S84 - z;
      if (z <= 10) d += (10 - z) * (10 - z) * (10 - z) / 3000.;

      const rad = g.hexf * (2.5 + .5 * c_sin(ds + u * .3)) * d;
      curvepoint(xspinpush0((g.S42 + hdir + a - 1) * g.S_step, rad));
    });
    queuecurve(V1, col, 0x8080808, PPR.LINE);
  }
}

export function drawWinter(V: shiftmatrix, hdir: number, col: number): void {
  // CAP_QUEUE
  const ds = Math.fround(ptick(300));
  col = darkena(col, 0, 0xFF);
  const g = cgi();
  for (let u = 0; u < 20; u++) {
    let rad: number;
    if (G.vid.flasheffects)
      rad = c_sin(ds + u * TAU / 20) * M_PI / S7();
    else
      rad = c_sin((ds + u) * TAU / 20) * M_PI / S7();
    const V1 = chei_sm(V, u, 20);
    queueline(smulh(V1, xspinpush0(M_PI + hdir + rad, g.hexf * .5)), smulh(V1, xspinpush0(M_PI + hdir + rad, g.hexf * 3)), col, 2 + G.vid.linequality);
  }
}

export function drawLightning_sm(V: shiftmatrix): void {
  // CAP_QUEUE
  const ds = Math.fround(ptick(600));
  const col = darkena(iinf[itOrbLightning].color, 0, 0xFF);
  const g = cgi();
  for (let u = 0; u < 20; u++) {
    let leng: number, rad: number;
    if (G.vid.flasheffects) {
      leng = 0.5 / (0.1 + (rand() % 100) / 100.0);
      rad = rand() % 1000;
    }
    else {
      if (u % 5) leng = 1.25 + sintick(200, u * 1.25) * 0.25;
      else leng = 2 + sintick(200, u * 1.25);
      rad = (u + ds) * TAU / 20;
    }
    const V1 = chei_sm(V, u, 20);
    queueline(smulh(V1, xspinpush0(rad, g.hexf * 0.3)), smulh(V1, xspinpush0(rad, g.hexf * leng)), col, 2 + G.vid.linequality);
  }
}

export function drawCurse(V: shiftmatrix, it: eItem): void {
  // CAP_QUEUE
  const ds = Math.fround(ptick(450) + (it * 5.5)); // Extra offset so both Gluttony and Repulsion are easily visible
  const col = darkena(iinf[it].color, 0, 0xFF);
  const g = cgi();
  for (let u = 0; u < 20; u++) {
    let leng: number, rad: number;
    if (G.vid.flasheffects) {
      leng = 0.6 + 0.3 * randd();
      rad = rand() % 1000;
    }
    else {
      leng = 0.85 + sintick(150, u * 1.25) * 0.15;
      rad = (u + ds) * TAU / 20;
    }
    const V1 = chei_sm(V, u, 20);
    queueline(smulh(V1, xspinpush0(rad, g.hexf * 0.3)), smulh(V1, xspinpush0(rad, g.hexf * leng)), col, 2 + G.vid.linequality);
  }
}

export function drawPlayerEffects(V: shiftmatrix, Vparam: shiftmatrix, c: cell, m: eMonster): void {
  const onplayer = m === moPlayer;
  if (!onplayer && !G.items[itOrbEmpathy]) return;
  if (G.items[itOrbShield] > (G.shmup_on ? 0 : ORBBASE)) drawShield(V, itOrbShield);
  if (G.items[itOrbShell] > (G.shmup_on ? 0 : ORBBASE)) drawShield(V, itOrbShell);

  if (G.items[itOrbSpeed]) drawSpeed(V, (G.items[itOrbSpeed] % 2) ? 1.1 : 0.8);
  if (G.items[itCurseGluttony]) drawCurse(V, itCurseGluttony);
  if (G.items[itCurseRepulsion]) drawCurse(V, itCurseRepulsion);

  const g = cgi();
  if (onplayer && (G.items[itOrbSword] || G.items[itOrbSword2])) {
    const SWORDDIM = mhybrid() ? 2 : WDIM();

    if (G.shmup_on && SWORDDIM === 2) {
      throw new NotPorted('drawPlayerEffects: shmup sword'); // STAGE2-STUB (shmup: stage 3)
    }

    else if (SWORDDIM === 3) {
      throw new NotPorted('drawPlayerEffects: 3D sword'); // STAGE2-STUB (3D)
    }

    else {
      const sd = G.sword_dir[G.multi_cpid];
      sd.angle %= G.sword_sword_angles;
      const ang = sd.angle;
      const sword_angles = G.sword_sword_angles;

      // CAP_QUEUE || CAP_SHAPES
      const Vnow = sm(sm(Vparam, rgpushxto0(inverse_shift_sp(Vparam, tC0_sm(V)))), ddspin180(c, 0));

      const adj = 1 - (Math.trunc(sword_angles / G.cwt.at.type) & 1);

      // CAP_QUEUE
      if (!euclid() && !mhybrid()) for (let a = 0; a < sword_angles; a++) {
        if (a === ang && G.items[itOrbSword]) continue;
        if ((a + (sword_angles >> 1)) % sword_angles === ang && G.items[itOrbSword2]) continue;
        const longer = sword_pos2(G.cwt.at, a - 1) !== sword_pos2(G.cwt.at, a + 1);
        if (sword_angles > 48 && !longer) continue;
        const col = darkena(0xC0C0C0, 0, 0xFF);
        const l0 = PURE() ? 0.6 * g.scalefactor : longer ? 0.36 : 0.4;
        const l1 = PURE() ? 0.7 * g.scalefactor : longer ? 0.44 : 0.42;
        // MAXMDIM >= 4
        if (GDIM() === 3) throw new NotPorted('drawPlayerEffects: 3D sword marks'); // STAGE2-STUB (3D)
        const h0 = xpush0(l0);
        const h1 = xpush0(l1);
        const T = sm(Vnow, spin((sword_angles + (-adj - 2 * a)) * M_PI / sword_angles));
        queueline(smulh(T, h0), smulh(T, h1), col, 1, PPR.SUPERLINE);
      }

      // CAP_SHAPES
      if (G.items[itOrbSword])
        queuepoly(sm(Vnow, spin(M_PI + (-adj - 2 * ang) * M_PI / sword_angles)), (G.peace_on ? g.shMagicShovel : g.shMagicSword), darkena(iinf[itOrbSword].color, 0, Math.trunc(0x80 + 0x70 * sintick(200))));

      if (G.items[itOrbSword2])
        queuepoly(sm(Vnow, spin((-adj - 2 * ang) * M_PI / sword_angles)), (G.peace_on ? g.shMagicShovel : g.shMagicSword), darkena(iinf[itOrbSword2].color, 0, Math.trunc(0x80 + 0x70 * sintick(200))));
    }
  }

  if (onplayer && G.items[itOrbSafety]) drawSafety_sm(V, c.type);

  if (onplayer && G.items[itOrbFlash]) drawFlash_sm(V);
  if (onplayer && G.items[itOrbLove]) drawLove(V, 0); // displaydir(c, cwt.spin));

  if (G.items[itOrbWinter])
    drawWinter(V, 0, iinf[itOrbWinter].color); // displaydir(c, cwt.spin));

  if (G.items[itOrbFire])
    drawWinter(V, 0, iinf[itOrbFire].color); // displaydir(c, cwt.spin));

  if (G.items[itCurseWater])
    drawWinter(V, 0, iinf[itCurseWater].color); // displaydir(c, cwt.spin));

  if (onplayer && G.items[itOrbLightning]) drawLightning_sm(V);

  if (G.safetyat > 0) {
    const tim = G.ticks - G.safetyat;
    if (tim > 2500) G.safetyat = 0;
    for (let u = tim; u <= 2500; u++) {
      if ((u - tim) % 250) continue;
      const rad = g.hexf * u / 250;
      const col = darkena(iinf[itOrbSafety].color, 0, 0xFF);
      PRING((a) => curvepoint(xspinpush0(a * g.S_step, rad)));
      queuecurve(V, col, 0, PPR.LINE);
    }
  }
}

/** struct playershape */
export interface playershape { name: string; is_humanoid: boolean; is_animal: boolean; }

/** enum ePlayershape */
export const pshRogue = 0, pshPrincess = 1, pshCat = 2, pshDog = 3, pshFamiliar = 4, pshSpaceship = 5, pshBunny = 6,
  pshRatling = 7, pshHyperbug = 8, pshSkeleton = 9, pshGUARD = 10;

export const playershapes: playershape[] = [
  { name: 'Rogue', is_humanoid: true, is_animal: false },
  { name: 'Princess', is_humanoid: true, is_animal: false },
  { name: 'cat', is_humanoid: false, is_animal: true },
  { name: 'dog', is_humanoid: false, is_animal: true },
  { name: 'Familiar', is_humanoid: false, is_animal: true },
  { name: 'spaceship', is_humanoid: false, is_animal: false },
  { name: 'bunny', is_humanoid: false, is_animal: true },
  { name: 'Ratling', is_humanoid: true, is_animal: false },
  { name: 'hyperbug', is_humanoid: false, is_animal: true },
  { name: 'Skeleton', is_humanoid: true, is_animal: false },
];

export function drawPlayer_animal(_m: eMonster, _where: cell | null, V0: shiftmatrix, _col: number, footphase: number, stop = false): void {
  const cs = getcs();

  const id = cs.charid >> 1;

  let V = V0;
  const g = cgi();

  if (id === pshHyperbug) {
    ShadowV(V, g.shBugBody);
    if (!G.mmspatial && !footphase)
      queuepoly(VABODY(V), g.shBugBody, fc(0, cs.skincolor, 0));
    else {
      animallegs(VALEGS(V), moBug0, fc(500, cs.dresscolor, 4), footphase);
      queuepoly(VABODY(V), g.shBugAntenna, fc(150, cs.skincolor, 2));
    }
    queuepoly(VABODY(V), g.shBugArmor, fc(400, cs.haircolor, 5));
  }

  if (id === pshBunny) {
    const z2 = WDIM() === 3 ? 0 : GDIM() === 3 ? -Math.abs(c_sin(footphase * TAU)) * g.human_height / 3 : geom3_lev_to_factor(Math.abs(c_sin(footphase * TAU)) * g.human_height * 2);
    const V0 = V;
    V = at_smart_lof_sm(V0, z2);
  }

  if (id === pshBunny) {
    /* bunny */
    if (!G.mmspatial && !footphase) {
      if (stop) return;
      queuepoly(VALEGS(V), g.shCatLegs, fc(500, cs.dresscolor, 4));
    }
    else {
      ShadowV(V, g.shBunnyBody);
      if (stop) return;
      animallegs(VALEGS(V), moRunDog, fc(500, cs.dresscolor, 4), footphase);
    }
    queuepoly(VABODY(V), g.shBunnyTail, fc(0, cs.skincolor, 0));
    queuepoly(VABODY(V), g.shBunnyBody, fc(0, cs.skincolor, 0));
    queuepoly(VAHEAD(V), g.shBunnyHead, fc(150, cs.haircolor, 2));
  }
  else if (id === pshFamiliar) {
    /* famililar */
    if (!G.mmspatial && !footphase) {
      if (stop) return;
      queuepoly(VALEGS(V), g.shWolfLegs, fc(150, cs.dresscolor, 4));
    }
    else {
      ShadowV(V, g.shWolfBody);
      if (stop) return;
      animallegs(VALEGS(V), moWolf, fc(500, cs.dresscolor, 4), footphase);
    }
    queuepoly(VABODY(V), g.shWolfBody, fc(0, cs.skincolor, 0));
    queuepoly(VAHEAD(V), g.shFamiliarHead, fc(500, cs.haircolor, 2));
  }
  else if (id === pshDog) {
    /* dog */
    if (!G.mmspatial && !footphase) {
      if (stop) return;
      queuepoly(VABODY(V), g.shDogBody, fc(0, cs.skincolor, 0));
    }
    else {
      ShadowV(V, g.shDogTorso);
      if (stop) return;
      animallegs(VALEGS(V), moRunDog, fc(500, cs.dresscolor, 4), footphase);
      queuepoly(VABODY(V), g.shDogTorso, fc(0, cs.skincolor, 0));
    }
    queuepoly(VAHEAD(V), g.shDogHead, fc(150, cs.haircolor, 2));
  }
  else if (id === pshCat) {
    /* cat */
    if (!G.mmspatial && !footphase) {
      if (stop) return;
      queuepoly(VALEGS(V), g.shCatLegs, fc(500, cs.dresscolor, 4));
    }
    else {
      ShadowV(V, g.shCatBody);
      if (stop) return;
      animallegs(VALEGS(V), moRunDog, fc(500, cs.dresscolor, 4), footphase);
    }
    queuepoly(VABODY(V), g.shCatBody, fc(0, cs.skincolor, 0));
    queuepoly(VAHEAD(V), g.shCatHead, fc(150, cs.haircolor, 2));
  }

  if (!G.shmup_on) { // || shmup::curtime >= shmup::getPlayer()->nextshot
    const col = G.items[itOrbDiscord] ? watercolor(0) : fc(314, cs.eyecolor, 3);
    if (among(id, pshCat, pshBunny)) {
      queuepoly(sm(VAHEAD(V), xpush(.04)), g.shWolf1, col);
      queuepoly(sm(VAHEAD(V), xpush(.04)), g.shWolf2, col);
    }
    if (id === pshDog) {
      queuepoly(VAHEAD(V), g.shWolf1, col);
      queuepoly(VAHEAD(V), g.shWolf2, col);
    }
    if (id === pshFamiliar) {
      queuepoly(VAHEAD(V), g.shFamiliarEye, col);
      queuepoly(sm(VAHEAD(V), lmirror()), g.shFamiliarEye, col);
    }
  }
  else throw new NotPorted('drawPlayer_animal: shmup'); // STAGE2-STUB (shmup: stage 3)

  if (id === pshBunny) {
    if (GDIM() !== 2) throw new NotPorted('drawPlayer_animal: 3D ears'); // STAGE2-STUB (3D)
    const EAR = VAHEAD(V);
    queuepoly(EAR, g.shBunnyEar, fc(150, cs.haircolor, 2));
    queuepoly(sm(EAR, MirrorY), g.shBunnyEar, fc(150, cs.haircolor, 2));
  }

  if (id === pshDog) {
    const colnose = G.items[itOrbDiscord] ? watercolor(0) : fc(314, 0xFF, 3);
    queuepoly(VAHEAD(V), g.shWolf3, colnose);
  }

  // CAP_COMPLEX2
  if (G.camelot_knighted)
    queuepoly(VABODY(V), g.shKnightCloak, darkena(cloakcolor(G.camelot_knighted), 1, 0xFF));

  if (tortoise_seek())
    tortoise_draw(VABODY(V), G.tortoise_seekbits, 4, 0);
}

export function drawPlayer_humanoid(_m: eMonster, where: cell | null, V: shiftmatrix, _col: number, footphase: number, stop = false): void {
  const cs = getcs();
  const id = cs.charid >> 1;
  const g = cgi();

  const body = (id === pshRatling) ? g.shYeti : (id === pshSkeleton) ? g.shSkeletonBody : (cs.charid & 1) ? g.shFemaleBody : g.shPBody;

  ShadowV(V, body);
  if (stop) return;

  const VBS = otherbodyparts(V, fc(0, (id === pshRatling || id === pshSkeleton) ? cs.dresscolor : cs.skincolor, 0), G.items[itOrbFish] ? moWaterElemental : moPlayer, footphase);

  queuepoly(sm(VBODY(V), VBS), body, fc(0, cs.skincolor, 0));

  if (id === pshRatling) queuepoly(VLEG(V), g.shRatTail, fc(100, cs.dresscolor2, 5));

  if (cs.charid & 1)
    queuepoly(sm(VBODY1(V), VBS), g.shFemaleDress, fc(500, cs.dresscolor, 4));

  if (cs.charid === 2)
    queuepoly(sm(VBODY2(V), VBS), g.shPrinceDress, fc(400, cs.dresscolor, 5));
  if (cs.charid === 3)
    queuepoly(sm(VBODY2(V), VBS), g.shPrincessDress, fc(400, cs.dresscolor2, 5));

  if (G.items[itOrbSide3])
    queuepoly(sm(VBODY(V), VBS), (cs.charid & 1) ? g.shFerocityF : g.shFerocityM, fc(0, cs.skincolor, 0));

  if (G.items[itOrbHorns]) {
    queuepoly(sm(VBODY(V), VBS), g.shBullHead, G.items[itOrbDiscord] ? watercolor(0) : 0xFF000030);
    queuepoly(sm(VBODY(V), VBS), g.shBullHorn, G.items[itOrbDiscord] ? watercolor(0) : 0xFF000040);
    queuepoly(sm(sm(VBODY(V), VBS), lmirror()), g.shBullHorn, G.items[itOrbDiscord] ? watercolor(0) : 0xFF000040);
  }

  if (G.items[itOrbSide1] && !G.shmup_on)
    queuepoly(sm(sm(VBODY(V), VBS), spin(-ld_deg(15, A_PI))), cs.charid >= 2 ? g.shSabre : g.shPSword, fc(314, cs.swordcolor, 3)); // 3 not colored

  const VWPN = cs.lefthanded ? sm(sm(VBODY(V), VBS), lmirror()) : sm(VBODY(V), VBS);

  if (G.peace_on) { /* nothing */ }
  else if (G.racing_on) {
    // CAP_RACING
    throw new NotPorted('drawPlayer_humanoid: racing trophy'); // STAGE2-STUB (racing: stage 3)
  }
  else if (bow_crossbow_mode()) {
    queuepoly(VWPN, g.shCrossbow, fc(314, cs.bowcolor, 3));
    const ti = G.items[itCrossbow];
    if (G.shmup_on) throw new NotPorted('drawPlayer_humanoid: shmup crossbow'); // STAGE2-STUB (shmup: stage 3)
    const VWPN1 = VWPN, VWPN2 = VWPN;
    if (GDIM() === 3) throw new NotPorted('drawPlayer_humanoid: 3D crossbow'); // STAGE2-STUB (3D)
    if (ti <= 1) queuepoly(VWPN1, g.shCrossbowstringLoaded, fc(314, cs.bowcolor2, 3));
    else if (ti <= 2) queuepoly(VWPN1, g.shCrossbowstringSemiloaded, fc(314, cs.bowcolor2, 3));
    else queuepoly(VWPN1, g.shCrossbowstringUnloaded, fc(314, cs.bowcolor2, 3));
    if (ti === 0) queuepoly(VWPN2, g.shCrossbowBolt, fc(314, cs.swordcolor, 3));
  }
  else if (G.items[itOrbThorns])
    queuepoly(VWPN, g.shHedgehogBladePlayer, G.items[itOrbDiscord] ? watercolor(0) : 0x00FF00FF);
  else if (G.items[itRevolver])
    queuepoly(VWPN, g.shGunInHand, fc(314, cs.swordcolor, 3)); // 3 not colored
  else if (G.items[itOrbSlaying]) {
    queuepoly(VWPN, g.shFlailTrunk, G.items[itOrbDiscord] ? watercolor(0) : fc(314, cs.swordcolor, 3));
    queuepoly(VWPN, g.shHammerHead, G.items[itOrbDiscord] ? watercolor(50) : fc(314, cs.swordcolor, 3));
  }
  else if (!G.shmup_on && G.items[itOrbDiscord])
    queuepoly(VWPN, cs.charid >= 2 ? g.shSabre : g.shPSword, watercolor(0));
  else if (G.items[itCurseWeakness]) {
    /* no weapon shown */
  }
  else if (!G.shmup_on)
    queuepoly(VWPN, cs.charid >= 2 ? g.shSabre : g.shPSword, fc(314, cs.swordcolor, 3)); // 3 not colored
  else throw new NotPorted('drawPlayer_humanoid: shmup knife'); // STAGE2-STUB (shmup: stage 3)

  if (G.items[itOrbBeauty]) {
    if (cs.charid & 1)
      queuepoly(VHEAD1(V), g.shFlowerHair, darkena(iinf[itOrbBeauty].color, 0, 0xFF));
    else
      queuepoly(VWPN, g.shFlowerHand, darkena(iinf[itOrbBeauty].color, 0, 0xFF));
  }

  if (where && where.land === laWildWest) {
    queuepoly(VHEAD1(V), g.shWestHat1, darkena(cs.swordcolor, 1, 0xFF));
    queuepoly(VHEAD2(V), g.shWestHat2, darkena(cs.swordcolor, 0, 0xFF));
  }

  if (G.cheater && !G.autocheat) {
    queuepoly(VHEAD1(V), (cs.charid & 1) ? g.shGoatHead : g.shDemon, darkena(0xFFFF00, 0, 0xFF));
    // queuepoly(V, shHood, darkena(0xFF00, 1, 0xFF));
  }
  else if (id === pshRatling) {
    const V1 = VRAT(V); // * cpush(0, cgi.scalefactor * (-0.1));
    queuepoly(V1, g.shRatHead, fc(500, cs.haircolor, 1));
    queuepoly(V1, g.shWolf1, cs.eyecolor);
    queuepoly(V1, g.shWolf2, cs.eyecolor);
    queuepoly(V1, g.shWolf3, darkena(0x202020, 0, 0xFF));
  }
  else if (id === pshSkeleton) {
    if (GDIM() === 2) queuepoly(VHEAD(V), g.shSkull, fc(500, cs.haircolor, 1));
    if (GDIM() === 2) queuepoly(VHEAD1(V), g.shSkullEyes, 0x000000FF);
    humanoid_eyes(V, cs.eyecolor, cs.skincolor);
  }
  else {
    queuepoly(VHEAD(V), g.shPFace, fc(500, cs.skincolor, 1));
    queuepoly(VHEAD1(V), (cs.charid & 1) ? g.shFemaleHair : g.shPHead, fc(150, cs.haircolor, 2));
    humanoid_eyes(V, cs.eyecolor, cs.skincolor);
  }

  // CAP_COMPLEX2
  if (G.camelot_knighted)
    queuepoly(sm(VBODY(V), VBS), id === pshRatling ? g.shRatCape1 : g.shKnightCloak, darkena(cloakcolor(G.camelot_knighted), 1, 0xFF));

  if (tortoise_seek())
    tortoise_draw(sm(sm(VBODY(V), VBS), ypush(-g.crossf * .25)), G.tortoise_seekbits, 4, 0);
}

export function drawPlayer(m: eMonster, where: cell | null, V: shiftmatrix, col: number, footphase: number, stop = false): void {
  const cs = getcs();

  if (GDIM() === 3) {
    throw new NotPorted('drawPlayer: addradar (3D)'); // STAGE2-STUB (3D)
  }

  // !mapeditor::drawUserShape(V, mapeditor::sgPlayer, cs.charid, cs.skincolor, where): no user shapes in stage 2
  if (G.mapeditor_drawplayer) {

    const id = cs.charid >> 1;
    if (playershapes[id].is_animal) drawPlayer_animal(m, where, V, col, footphase, stop);
    else if (playershapes[id].is_humanoid) drawPlayer_humanoid(m, where, V, col, footphase, stop);

    else if (cs.charid >= 10) {
      const g = cgi();
      ShadowV(V, g.shSpaceship);
      queuepoly(VBODY(V), g.shSpaceshipBase, fc(150, cs.skincolor, 4));
      queuepoly(VBODY(V), g.shSpaceshipCockpit, fc(150, cs.eyecolor, 4));
      queuepoly(VBODY(V), g.shSpaceshipGun, fc(150, cs.dresscolor, 4));
      queuepoly(VBODY(V), g.shSpaceshipEngine, fc(150, cs.haircolor, 4));
      queuepoly(sm(VBODY(V), lmirror()), g.shSpaceshipGun, fc(150, cs.dresscolor, 4));
      queuepoly(sm(VBODY(V), lmirror()), g.shSpaceshipEngine, fc(150, cs.haircolor, 4));
    }
  }
}

export function drawMimic(m: eMonster, _where: cell | null, V: shiftmatrix, col: number, footphase: number): void {
  const cs = getcs();
  const id = cs.charid >> 1;
  const g = cgi();

  // mapeditor::drawUserShape(V, mapeditor::sgPlayer, cs.charid, darkena(col, 0, 0x80), where): none in stage 2

  if (id === pshSpaceship) {
    ShadowV(V, g.shSpaceship);
    queuepoly(VBODY(V), g.shSpaceshipBase, darkena(col, 0, 0xC0));
    queuepoly(VBODY(V), g.shSpaceshipCockpit, darkena(col, 0, 0xC0));
    queuepoly(VBODY(V), g.shSpaceshipGun, darkena(col, 0, 0xC0));
    queuepoly(VBODY(V), g.shSpaceshipEngine, darkena(col, 0, 0xC0));
    queuepoly(sm(VBODY(V), lmirror()), g.shSpaceshipGun, darkena(col, 0, 0xC0));
    queuepoly(sm(VBODY(V), lmirror()), g.shSpaceshipEngine, darkena(col, 0, 0xC0));
  }
  else if (id === pshFamiliar) {
    queuepoly(VABODY(V), g.shWolfBody, darkena(col, 0, 0xC0));
    ShadowV(V, g.shWolfBody);

    if (G.mmspatial || footphase)
      animallegs(VALEGS(V), moWolf, darkena(col, 0, 0xC0), footphase);
    else
      queuepoly(VABODY(V), g.shWolfLegs, darkena(col, 0, 0xC0));

    queuepoly(VABODY(V), g.shFamiliarHead, darkena(col, 0, 0xC0));
    queuepoly(VAHEAD(V), g.shFamiliarEye, darkena(col, 0, 0xC0));
    queuepoly(sm(VAHEAD(V), lmirror()), g.shFamiliarEye, darkena(col, 0, 0xC0));
  }
  else if (id === pshDog) {
    ShadowV(V, g.shDogBody);
    queuepoly(VAHEAD(V), g.shDogHead, darkena(col, 0, 0xC0));
    if (G.mmspatial || footphase) {
      animallegs(VALEGS(V), moRunDog, darkena(col, 0, 0xC0), footphase);
      queuepoly(VABODY(V), g.shDogTorso, darkena(col, 0, 0xC0));
    }
    else
      queuepoly(VABODY(V), g.shDogBody, darkena(col, 0, 0xC0));
    queuepoly(VABODY(V), g.shWolf1, darkena(col, 1, 0xC0));
    queuepoly(VABODY(V), g.shWolf2, darkena(col, 1, 0xC0));
    queuepoly(VABODY(V), g.shWolf3, darkena(col, 1, 0xC0));
  }
  else if (id === pshBunny) {
    ShadowV(V, g.shBunnyBody);
    queuepoly(VAHEAD(V), g.shBunnyHead, darkena(col, 0, 0xC0));
    if (G.mmspatial || footphase) {
      animallegs(VALEGS(V), moRunDog, darkena(col, 0, 0xC0), footphase);
      queuepoly(VABODY(V), g.shBunnyBody, darkena(col, 0, 0xC0));
    }
    else
      queuepoly(VABODY(V), g.shBunnyBody, darkena(col, 0, 0xC0));

    queuepoly(VABODY(V), g.shBunnyTail, darkena(col, 1, 0xC0));
    queuepoly(VABODY(V), g.shBunnyHead, darkena(col, 1, 0xC0));

    queuepoly(sm(VAHEAD(V), xpush(.04)), g.shWolf1, col);
    queuepoly(sm(VAHEAD(V), xpush(.04)), g.shWolf2, col);

    queuepoly(VAHEAD(V), g.shBunnyEar, darkena(col, 1, 0x80));
    queuepoly(sm(VAHEAD(V), MirrorY), g.shBunnyEar, darkena(col, 2, 0x80));
  }
  else if (id === pshHyperbug) {
    ShadowV(V, g.shBugBody);
    if (!G.mmspatial && !footphase)
      queuepoly(VABODY(V), g.shBugBody, darkena(col, 0, 0xC0));
    else {
      animallegs(VALEGS(V), moBug0, darkena(col, 0, 0xC0), footphase);
      queuepoly(VABODY(V), g.shBugAntenna, darkena(col, 0, 0xC0));
    }
    queuepoly(VABODY(V), g.shBugArmor, darkena(col, 0, 0xC0));
  }
  else if (id === pshCat) {
    ShadowV(V, g.shCatBody);
    queuepoly(VABODY(V), g.shCatBody, darkena(col, 0, 0xC0));
    queuepoly(VAHEAD(V), g.shCatHead, darkena(col, 0, 0xC0));
    if (G.mmspatial || footphase)
      animallegs(VALEGS(V), moRunDog, darkena(col, 0, 0xC0), footphase);
    else
      queuepoly(VALEGS(V), g.shCatLegs, darkena(col, 0, 0xC0));
    queuepoly(sm(VAHEAD(V), xpush(.04)), g.shWolf1, darkena(col, 1, 0xC0));
    queuepoly(sm(VAHEAD(V), xpush(.04)), g.shWolf2, darkena(col, 1, 0xC0));
  }
  else {
    const VBS = otherbodyparts(V, darkena(col, 0, 0x40), m, footphase);
    const body = (id === pshRatling) ? g.shYeti : (id === pshSkeleton) ? g.shSkeletonBody : (cs.charid & 1) ? g.shFemaleBody : g.shPBody;
    queuepoly(sm(VBODY(V), VBS), body, darkena(col, 0, 0x80));

    if (bow_crossbow_mode() && cs.charid < 4) {
      const VWPN = cs.lefthanded ? sm(sm(VBODY(V), VBS), lmirror()) : sm(VBODY(V), VBS);
      const col1 = darkena(col, 0, 0x40);
      queuepoly(VWPN, g.shCrossbow, col1);
      const ti = G.items[itCrossbow];
      if (G.shmup_on) throw new NotPorted('drawMimic: shmup crossbow'); // STAGE2-STUB (shmup: stage 3)
      const VWPN1 = VWPN, VWPN2 = VWPN;
      if (GDIM() === 3) throw new NotPorted('drawMimic: 3D crossbow'); // STAGE2-STUB (3D)
      if (ti <= 1) queuepoly(VWPN1, g.shCrossbowstringLoaded, col1);
      else if (ti <= 2) queuepoly(VWPN1, g.shCrossbowstringSemiloaded, col1);
      else queuepoly(VWPN1, g.shCrossbowstringUnloaded, col1);
      if (ti === 0) queuepoly(VWPN2, g.shCrossbowBolt, col1);
    }
    else if (!G.shmup_on) {
      const emp = G.items[itOrbEmpathy] && m !== moShadow;
      if (G.items[itOrbThorns] && emp)
        queuepoly(sm(VBODY(V), VBS), g.shHedgehogBladePlayer, darkena(col, 0, 0x40));
      if (G.items[itOrbSide1] && !G.shmup_on)
        queuepoly(sm(sm(VBODY(V), VBS), spin(-ld_deg(15, A_PI))), cs.charid >= 2 ? g.shSabre : g.shPSword, darkena(col, 0, 0x40));
      if (G.items[itOrbSide3] && emp)
        queuepoly(sm(VBODY(V), VBS), (cs.charid & 1) ? g.shFerocityF : g.shFerocityM, darkena(col, 0, 0x40));

      const VWPN = cs.lefthanded ? sm(sm(VBODY(V), VBS), lmirror()) : sm(VBODY(V), VBS);
      queuepoly(VWPN, (cs.charid >= 2 ? g.shSabre : g.shPSword), darkena(col, 0, 0xC0));
    }
    else throw new NotPorted('drawMimic: shmup knife'); // STAGE2-STUB (shmup: stage 3)

    // CAP_COMPLEX2
    if (G.camelot_knighted)
      queuepoly(sm(VBODY3(V), VBS), g.shKnightCloak, darkena(col, 1, 0xC0));

    if (body === g.shYeti) {
      const V1 = VRAT(V);
      queuepoly(V1, g.shRatHead, darkena(col, 1, 0xC0));
      queuepoly(V1, g.shWolf1, darkena(col, 2, 0xC0));
      queuepoly(V1, g.shWolf2, darkena(col, 2, 0xC0));
      queuepoly(V1, g.shWolf3, darkena(col, 2, 0xC0));
    }
    else if (body === g.shSkeletonBody) {
      queuepoly(VHEAD1(V), g.shSkull, darkena(col, 1, 0xC0));
      queuepoly(VHEAD(V), g.shSkullEyes, darkena(col, 2, 0xC0));
    }
    else {
      queuepoly(VHEAD1(V), (cs.charid & 1) ? g.shFemaleHair : g.shPHead, darkena(col, 1, 0xC0));
      queuepoly(VHEAD(V), g.shPFace, darkena(col, 0, 0xC0));
    }
    if (cs.charid & 1)
      queuepoly(sm(VBODY1(V), VBS), g.shFemaleDress, darkena(col, 1, 0xC0));
    if (cs.charid === 2)
      queuepoly(sm(VBODY2(V), VBS), g.shPrinceDress, darkena(col, 1, 0xC0));
    if (cs.charid === 3)
      queuepoly(sm(VBODY2(V), VBS), g.shPrincessDress, darkena(col, 1, 0xC0));
    if (id === pshRatling) queuepoly(VLEG(V), g.shRatTail, darkena(col, 1, 0xC0));

    if (body !== g.shYeti) humanoid_eyes(V, 0xFF, darkena(col, 0, 0x40));
  }
}

/** void draw_movement_arrows(cell *c, const transmatrix& V, int df) */
export function draw_movement_arrows(c: cell, V: transmatrix, df: number): void {

  if (G.viewdists) return;

  let keylist = '';
  const keysize = .6;

  let col = getcs().uicolor;
  const g = cgi();

  for (let d = 0; d < 8; d++) {

    const md = vectodir(tmulh(spin(-d * ld_deg(45, A_PI)), smalltangent()));
    const xc = G.cwt.plus(md.d);
    if (xc.spin !== df) continue;
    xc.addStep();
    if (xc.at === c) {
      const fixrot = tmul(G.sphereflip, rgpushxto0(tmulh(G.sphereflip, tC0(V))));
      // make it more transparent
      col = (col - ((col & 0xFF) >>> 1)) >>> 0;
      G.poly_outline = OUTLINE_DEFAULT();

      let key = 0;
      if (G.vid.axes >= 5)
        key = (G.vid.axes === 5 ? G.keys_wasd : G.keys_vi)[d];

      if (G.vid.axes >= 5) keylist += String.fromCharCode(key);
      else
        queuepoly(shiftless_t(tmul(fixrot, spin(-d * ld_deg(45, A_PI)))), g.shArrow, col);

      if ((c.type & 1) && (isStunnable(c.monst) || isPushable(c.wall))) {
        const Centered = rgpushxto0(tC0(unshift_sm(G.current_display.player_matrix)));
        let sd = md.subdir;
        if (G.keybd_subdir_enabled) sd = G.keybd_subdir;

        const T = tmul(tmul(tmul(tmul(iso_inverse(Centered), rgpushxto0(tmulh(Centered, tC0(V)))), lrspintox(tmulh(Centered, tC0(V)))), spin(-sd * M_PI / S7())), xpush(0.2));

        if (G.vid.axes >= 5)
          queuestr_V(shiftless_t(T), keysize * G.mapfontscale / 100, G.s0 + String.fromCharCode(key), col >>> 8, 1);

        else
          queuepoly(shiftless_t(T), g.shArrow, col);
      }
      else if (!confusingGeometry()) break;
    }
  }
  if (keylist !== '') queuestr_V(shiftless_t(V), keysize * G.mapfontscale / 100, keylist, col >>> 8, 1);
}
import { OUTLINE_DEFAULT } from './drawing.ts';

export function drawmovestar(dx: number, dy: number): void {

  // indenter_finish(debug_movestar, "drawmovestar");
  if (G.viewdists) return;
  if (GDIM() === 3) return;

  if (!G.playerfound) return;

  if (G.shmup_on) return;
  // CAP_RUG
  if (G.rug_rugged && G.multi_players === 1 && !G.multi_alwaysuse) return;

  const H = smulh(G.current_display.player_matrix, tile_center());
  const R = Math.sqrt(H.h[0] * H.h[0] + H.h[1] * H.h[1]);
  let Centered: shiftmatrix;

  if (euclid())
    Centered = shiftless_t(eupush_h(H.h));
  else if (R > 1e-9) Centered = rgpushxto0_sp(H);
  else Centered = shiftless_t(Id);

  Centered = smul(Centered, rgpushxto0(hpxy(dx * 5, dy * 5)));
  if (G.multi_cpid >= 0) G.multi_crosscenter[G.multi_cpid] = Centered;

  let rax = G.vid.axes;
  if (rax === 1) rax = drawstaratvec(dx, dy) ? 2 : 0;

  if (rax === 0 || G.vid.axes >= 4) return;

  const starcol = getcs().uicolor;

  // CAP_SHAPES
  if (G.vid.axes === 3)
    queuepoly(Centered, cgi().shMovestar, starcol);

  else for (let d = 0; d < 8; d++) {
    // CAP_QUEUE
    const col = starcol;
    // ISPANDORA: no
    queueline(tC0_sm(Centered), smulh(Centered, xspinpush0(d * ld_deg(45, A_PI), cgi().scalefactor / 2)), col, 3 + G.vid.linequality);
  }
}

