// graph-item.cpp of HyperRogue 13.1o: the item graphics (drawItemType: treasures, orbs with their inner shapes and
// rings, the compass, the Palace's hypersian rug, the baby tortoise, ...), queue_ring, the orb colours, the compass
// goal marks. Stage 2, package D4 (PORTING-STAGE2.md). (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// Not ported (STAGE2-STUB, NotPorted when reached): the 3D branches (WDIM/GDIM == 3, embedded planes, the radar:
// addradar only fills radarpoints, which only the 3D radar draws), the crystal compass, VR, the map editor's user
// shapes (none in stage 2).
import { G } from './globals.ts';
import { NotPorted, among, PPR, OUTLINE_DEAD } from './hyper.ts';
import { ld_deg, c_sin } from './cpp.ts';
import type { cell } from './locations.ts';
import {
  type shiftmatrix, type shiftpoint, TAU, M_PI, A_PI, smul, xpush, tC0_sm, inverse_shift_sp,
  rgpushxto0_sp, MirrorX,
} from './hyperpoint.ts';
import { spin, spin90, spin270, lmirror, lrspintox } from './embeddings.ts';
import { GDIM, WDIM, embedded_plane, mproduct, sl2 } from './classes.ts';
import { cgi, type hpcshape } from './geometry.ts';
import { queuepoly, queuepolyat, queuestr_sp } from './drawing.ts';
import { draw_floorshape } from './floorshapes.ts';
import { darkena, firecolor, watercolor, fghostcolor } from './colors.ts';
import {
  iinf, minf, type eItem, type eOrbshape,
  osLove, osRanged, osOffensive, osDirectional, osFriend, osUtility, osPowerUtility, osWarping, osFrog,
  osProtective, osTerraform, osMovement,
  waIcewall,
  moPrincess, moFriendlyGhost, moTortoise,
  itOrbFire, itOrbWater, itOrbFriend, itOrbDiscord, itOrbFrog, itOrbImpact, itOrbPhasing, itOrbDash, itOrbFreedom,
  itOrbPlague, itOrbChaos, itOrbAir, itOrbUndeath, itOrbRecall, itOrbLife, itOrbSlaying, itOrbSide1, itOrbDigging,
  itOrbEnergy, itPirate, itKraken, itBuggy, itBuggy2, itHolyGrail, itBombEgg, itTrollEgg, itCursed, itFrog,
  itWhirlpool, itHunting, itDodeca, itDice, itShard, itTreat, itSlime, itBone, itStatue, itIvory, itEclectic, itKey,
  itRevolver, itSavedPrincess, itStrongWind, itFatigue, itWarning, itCrossbow, itBabyTortoise, itCompass, itPalace,
  itRose, itBarrow, itFireShard, itWaterShard, itZebra, itLotus, itSwitch, itInventory, itOrbFish, itOrbBeauty,
  itOrbBull, itOrbSpeed, itOrbStunning, itOrbDragon, itOrbDomination, itOrbMorph, itOrbWinter, itOrbLuck,
  itOrbAether, itOrbFlash, itOrbMatter, itOrbStone, itOrbSummon, itOrbSafety, itOrbSword, itOrbSword2,
  itOrbThorns, itOrbSide2, itOrb37, itOrbLava, itOrbGravity, itOrbSpace, itOrbChoice, itOrbMirror,
  itOrbMagnetism, itOrbEmpathy, itOrbPsi, itOrbSide3, itOrbPurity, itOrbLightning, itOrbShield, itOrbTime,
  itOrbWoods, itOrbNature, itOrbIllusion, itOrbInvis, itOrbTeleport, itOrbIntensity, itOrbHorns, itOrbShell,
} from './content.ts';
import { isElementalShard, highwall } from './flags.ts';
import { getcs } from './config.ts';
import { sintick, ptick, spintick } from './animations.ts';
import { doHighlight, kind_outline, draw_ascii_or_zh, addauraspecial } from './graph.ts';
import { ctof } from './pattern2.ts';
import { barrowCount } from './items.ts';
import { active_switch } from './game.ts';
import { findcompass, compassDist } from './bigstuff.ts';
import { ggmatrix } from './geometry2.ts';
import { isPlayerOn } from './pcmove.ts';
import { its } from './hprint.ts';
import { cryst } from './classes.ts';
import { drawMonsterType, tortoise_draw } from './graph-monster.ts';
import { drawSpeed } from './graph-player.ts';

const sm = smul;
const ch = (s: string): number => s.charCodeAt(0);

export function face_the_player(V: shiftmatrix): shiftmatrix {
  if (GDIM() === 2) return V;
  throw new NotPorted('face_the_player: 3D'); // STAGE2-STUB (3D)
}

export function orbshape(s: eOrbshape): hpcshape {
  const g = cgi();
  if (G.vid.orbmode === 0) return g.shRing;
  switch (s) {
    case osLove: return g.shLoveRing;
    case osRanged: return g.shTargetRing;
    case osOffensive: return g.shSawRing;
    case osDirectional: return G.vid.orbmode === 2 ? g.shSawRing : g.shSpearRing;
    case osFriend: return g.shPeaceRing;
    case osUtility: return g.shGearRing;
    case osPowerUtility: return g.shPowerGearRing;
    case osWarping: return g.shHeptaRing;
    case osFrog: return g.shFrogRing;
    case osProtective: return g.shProtectiveRing;
    case osTerraform: return g.shTerraRing;
    case osMovement: return g.shMoveRing;
    default: return g.shRing;
  }
}

export function queue_ring(V: shiftmatrix, sh: hpcshape, col: number, p: PPR): void {
  queuepolyat(V, sh, col, p).outline = 0;

  const p1 = queuepolyat(V, sh, col, p);
  p1.cnt = cgi().orb_inner_ring;
  p1.color = 0;

  const p2 = queuepolyat(V, sh, col, p);
  p2.color = 0;
  p2.offset += cgi().orb_inner_ring;
  p2.cnt -= cgi().orb_inner_ring + 1;
}

export function orb_auxiliary_color(it: eItem): number {
  if (it === itOrbFire) return firecolor(200);
  if (it === itOrbWater) return 0x000060;
  if (it === itOrbFriend || it === itOrbDiscord) return 0xC0C0C0;
  if (it === itOrbFrog) return 0xFF0000;
  if (it === itOrbImpact) return 0xFF0000;
  if (it === itOrbPhasing) return 0xFF0000;
  if (it === itOrbDash) return 0xFF0000;
  if (it === itOrbFreedom) return 0xC0FF00;
  if (it === itOrbPlague) return 0x409040;
  if (it === itOrbChaos) return 0xFF00FF;
  if (it === itOrbAir) return 0xFFFFFF;
  if (it === itOrbUndeath) return minf[moFriendlyGhost].color;
  if (it === itOrbRecall) return 0x101010;
  if (it === itOrbLife) return 0x90B090;
  if (it === itOrbSlaying) return 0xFF0000;
  if (it === itOrbSide1) return 0x307080;
  if (it === itOrbDigging) return 0x606060;
  if (it === itOrbEnergy) return 0xFFFF80;
  return iinf[it].color;
}

export function orb_inner_color(it: eItem): number {
  if (it === itOrbWater) return 0x0070C0;
  if (it === itOrbEnergy) return 0x8B4513;
  // if(it == itOrbDash) return 0xFF0000;
  if (it === itOrbSide1) return 0x00FF00;
  // if(it == itOrbPhasing) return 0xFF0000;
  if (it === itOrbDigging) return 0x00FF00;
  if (it === itOrbLife) return 0x306000;
  return iinf[it].color;
}

export function drawItemType(it: eItem, c: cell | null, V: shiftmatrix, icol: number, pticks: number, hidden: boolean): boolean {
  if (!it) return false;
  const xch = iinf[it].glyph;

  // MAXMDIM >= 4
  if (c && GDIM() === 3)
    throw new NotPorted('drawItemType: addradar (3D)'); // STAGE2-STUB (3D)

  if (WDIM() === 3) throw new NotPorted('drawItemType: WDIM 3'); // STAGE2-STUB (3D)

  if (!G.mmitem) {
    draw_ascii_or_zh(V, iinf[it].glyph, iinf[it].name, icol, 1, 0.5);
    return true;
  }

  // CAP_SHAPES
  const sinptick = (period: number): number => c ? sintick(period) : c_sin(G.animation_factor * G.vid.ispeed * pticks / period);
  const spinptick = (period: number, phase: number) => c ? spintick(period, phase) : spin((G.animation_factor * G.vid.ispeed * pticks) / period + phase * TAU);
  const ct6 = c ? ctof(c) : 1;
  const g = cgi();
  let xsh: hpcshape | null =
    (it === itPirate || it === itKraken) ? g.shPirateX :
      (it === itBuggy || it === itBuggy2) ? g.shPirateX :
        it === itHolyGrail ? g.shGrail :
          isElementalShard(it) ? g.shElementalShard :
            (it === itBombEgg || it === itTrollEgg || it === itCursed) ? g.shEgg :
              (it === itFrog || it === itWhirlpool) ? g.shDisk :
                it === itHunting ? g.shTriangle :
                  (it === itDodeca || it === itDice) ? g.shDodeca :
                    xch === ch('*') ? g.shGem[ct6] :
                      xch === ch('(') ? g.shKnife :
                        it === itShard ? g.shMFloor.b[0] :
                          it === itTreat ? g.shTreat :
                            it === itSlime ? g.shEgg :
                              xch === ch('%') ? g.shDaisy : xch === ch('$') ? g.shStar : xch === ch(';') ? g.shTriangle :
                                xch === ch('!') ? g.shTriangle : it === itBone ? g.shNecro : it === itStatue ? g.shStatue :
                                  among(it, itIvory, itEclectic) ? g.shFigurine :
                                    xch === ch('?') ? g.shBookCover :
                                      it === itKey ? g.shKey :
                                        it === itRevolver ? g.shGun :
                                          null;

  if (c && doHighlight())
    G.poly_outline = kind_outline(it);

  let Vit = V;
  if (embedded_plane() && c && it !== itBabyTortoise) throw new NotPorted('drawItemType: embedded plane'); // STAGE2-STUB (3D)
  if (c && mproduct())
    throw new NotPorted('drawItemType: product'); // STAGE2-STUB (other geometries)
  else if (c && sl2() && !embedded_plane())
    throw new NotPorted('drawItemType: SL(2,R)'); // STAGE2-STUB (other geometries)
  else
    if (GDIM() === 3 && c && it !== itBabyTortoise) Vit = face_the_player(Vit);
  // V * cspin(0, 2, ptick(618, 0));

  // CAP_SHAPES
  // if(mapeditor::drawUserShape(Vit, mapeditor::sgItem, it, darkena(icol, 0, 0xFF), c)) return true: none in stage 2

  if (c && G.history_includeHistory && G.history_infindhistory.has(c)) G.poly_outline = OUTLINE_DEAD;

  else if (it === itSavedPrincess) {
    drawMonsterType(moPrincess, c, V, icol, 0, icol);
    return true;
  }

  else if (it === itStrongWind) {
    queuepoly(sm(Vit, spinptick(750, 0)), g.shFan, darkena(icol, 0, 255));
  }

  else if (it === itFatigue) {
    queuepoly(sm(Vit, spinptick(750, 0)), g.shFan, darkena(icol, 0, 255));
  }

  else if (it === itWarning) {
    queuepoly(sm(Vit, spinptick(750, 0)), g.shTriangle, darkena(icol, 0, 255));
  }

  else if (it === itCrossbow) {
    queuepoly(Vit, g.shCrossbowIcon, getcs().bowcolor);
    queuepoly(Vit, g.shCrossbowstringIcon, getcs().bowcolor2);
  }

  else if (it === itBabyTortoise) {
    let bits: number;
    if (c) {
      // tortoise::babymap[c]: std::map::operator[] inserts 0
      if (!G.tortoise_babymap.has(c)) G.tortoise_babymap.set(c, 0);
      bits = G.tortoise_babymap.get(c)!;
    }
    else bits = G.tortoise_last;
    const over = c && c.monst === moTortoise;
    tortoise_draw(sm(sm(Vit, spinptick(5000, 0)), ypush(g.crossf * .15)), bits, over ? 4 : 2, 0);
    // queuepoly(Vit, cgi.shHeptaMarker, darkena(tortoise::getMatchColor(bits), 0, 0xC0));
  }

  else if (it === itCompass) {
    let V2: shiftmatrix;
    // CAP_CRYSTAL
    if (cryst()) throw new NotPorted('drawItemType: crystal compass'); // STAGE2-STUB (other geometries)
    else {
      const P1 = { v: null! as shiftpoint };
      if (mark_compass(c, P1)) {
        V2 = sm(V, lrspintox(inverse_shift_sp(V, P1.v)));
      }
      else V2 = V;
    }
    if (GDIM() === 3) {
      throw new NotPorted('drawItemType: 3D compass'); // STAGE2-STUB (3D)
    }
    else {
      if (c) V2 = sm(V2, spin(M_PI * sintick(100) / 30));
      const hider = hidden ? 0xFFFFFF20 : 0xFFFFFFFF;
      queuepoly(V2, g.shCompass1, (0xFF8080FF & hider) >>> 0);
      queuepoly(V2, g.shCompass2, (0xFFFFFFFF & hider) >>> 0);
      queuepoly(V2, g.shCompass3, (0xFF0000FF & hider) >>> 0);
      queuepoly(sm(V2, lpispin()), g.shCompass3, (0x000000FF & hider) >>> 0);
    }
    xsh = null;
  }

  else if (it === itPalace) {
    // MAXMDIM >= 4
    if (GDIM() === 3) throw new NotPorted('drawItemType: 3D hypersian rug'); // STAGE2-STUB (3D)
    {
      const hider = hidden ? 0xFFFFFF20 : 0xFFFFFFFF;
      const V2 = sm(Vit, spin(pticks * G.vid.ispeed / 1500.));
      draw_floorshape(c, V2, g.shMFloor3, (0xFFD500FF & hider) >>> 0);
      draw_floorshape(c, V2, g.shMFloor4, (darkena(icol, 0, 0xFF) & hider) >>> 0);
      queuepoly(V2, g.shGem[ct6], (0xFFD500FF & hider) >>> 0);
    }
    xsh = null;
  }

  else if (it === itRose) {
    for (let u = 0; u < 4; u++)
      queuepoly(sm(sm(Vit, spinptick(1500, 0)), spin(ld_deg(30, A_PI) * u)), g.shRoseItem, darkena(icol, 0, hidden ? 0x30 : 0xA0));
  }

  else if (it === itBarrow && c) {
    for (let i = 0; i < barrowCount(c); i++)
      queuepolyat(sm(sm(sm(Vit, spin(TAU * i / barrowCount(c))), xpush(.15 * g.scalefactor)), spinptick(1500, 0)), xsh!, darkena(icol, 0, hidden ? 0x40 :
        (highwall(c) && G.wmspatial) ? 0x60 : 0xFF),
      PPR.HIDDEN);
  }

  else if (xsh) {
    if (it === itFireShard) icol = firecolor(100);
    if (it === itWaterShard) icol = watercolor(100) >>> 8;

    if (it === itZebra) icol = 0xFFFFFF;
    if (it === itLotus) icol = 0x101010;
    if (it === itSwitch) icol = minf[active_switch()].color;

    const V2 = sm(Vit, spinptick(1500, 0));

    if (xsh === g.shBookCover && G.mmitem) {
      if (GDIM() === 3)
        throw new NotPorted('drawItemType: 3D book'); // STAGE2-STUB (3D)
      else
        queuepoly(V2, g.shBook, 0x805020FF);
    }

    let pr = PPR.ITEM;
    let alpha = hidden ? (it === itKraken ? 0xC0 : 0x40) : 0xF0;
    if (c && c.wall === waIcewall) { pr = PPR.HIDDEN; alpha = 0x80; }

    queuepolyat(V2, xsh, darkena(icol, 0, alpha), pr);

    if (it === itZebra) {
      const Vx = sm(Vit, spinptick(1500, .5 / (ct6 + 6)));
      if (GDIM() === 3)
        throw new NotPorted('drawItemType: 3D zebra'); // STAGE2-STUB (3D)
      queuepolyat(Vx, xsh, darkena(0x202020, 0, hidden ? 0x40 : 0xF0), PPR.ITEMb);
    }
  }

  else if (xch === ch('o') || xch === ch('c') || it === itInventory) {
    if (it === itOrbFire) icol = firecolor(100);
    let prio = PPR.ITEM;
    const inice = !!c && c.wall === waIcewall;
    if (inice) prio = PPR.HIDDEN;

    let icol1 = icol;
    icol = orb_auxiliary_color(it);
    const col = darkena(icol, 0, Math.trunc(0x80 + 0x70 * sinptick(300)));

    if (it === itOrbFish && G.vid.orbmode === 2)
      queuepolyat(sm(Vit, spinptick(1500, 0)), g.shFishTail, col, PPR.ITEM_BELOW);

    if (xch === ch('c'))
      queuepolyat(sm(Vit, spinptick(500, 0)), g.shMoonDisk, darkena(0x801080, 0, hidden ? 0x20 : 0xC0), prio);
    else if (G.vid.orbmode < 2) {
      icol1 = orb_inner_color(it);
      queuepolyat(Vit, g.shDisk, darkena(icol1, 0, inice ? 0x80 : hidden ? 0x20 : 0xC0), prio);
    }
    else {
      icol1 = orb_inner_color(it);
      let dark = darkena(icol1, 0, inice ? 0x80 : hidden ? 0x20 : (it === itOrbBeauty) ? 0xA0 : 0xC0);
      const dark1 = darkena(icol1, 0, inice ? 0x40 : hidden ? 0x10 : (it === itOrbBeauty) ? 0x50 : 0x60);
      if (c && GDIM() === 2) Vit = rgpushxto0_sp(tC0_sm(Vit));
      const Vit1 = sm(Vit, spin90());

      if (it === itOrbBeauty) {
        queuepolyat(Vit, g.shDisk, dark1, prio);
        for (let u = 0; u < 3; u++)
          queuepolyat(sm(Vit1, spin(ld_deg(40, A_PI) * u)), g.shSmallRose, dark, prio);
      }
      else if (it === itOrbLife) {
        queuepolyat(Vit, g.shDisk, dark1, prio);
        queuepolyat(Vit1, g.shSmallPBody, dark, prio);
        queuepolyat(Vit1, g.shDiskM, dark, prio);
      }
      else if (it === itOrbBull) {
        queuepolyat(Vit, g.shDisk, dark1, prio);
        queuepolyat(Vit1, g.shTinyBullBody, dark, prio);
        queuepolyat(Vit1, g.shTinyBullHead, dark, prio);
        queuepolyat(Vit1, g.shTinyBullHorn, dark, prio);
        queuepolyat(sm(Vit1, lmirror()), g.shTinyBullHorn, dark, prio);
      }
      else if (it === itOrbFrog && false) {
        // (disabled in the original)
      }
      else if (it === itOrbSpeed) {
        queuepolyat(Vit, g.shDisk, dark1, prio);
        drawSpeed(Vit, 0.3);
      }
      else if (it === itOrbStunning) {
        queuepolyat(Vit, g.shDisk, dark1, prio);
        queuepolyat(Vit, g.shDiskM, dark, prio);
        for (let i = 0; i < 5; i++) {
          const V2 = sm(Vit, spin(TAU * i / 5 + ptick(300)));
          queuepolyat(V2, g.shSmallFlailBall, dark, prio);
        }
      }
      else if (it === itOrbDragon) {
        queuepolyat(Vit, g.shDisk, dark1, prio);
        queuepolyat(Vit1, g.shSmallDragonHead, dark, prio);
        queuepolyat(Vit1, g.shSmallDragonNostril, 0xFF, prio);
        queuepolyat(sm(Vit1, lmirror()), g.shSmallDragonNostril, 0xFF, prio);
        queuepolyat(Vit1, g.shSmallDragonEyes, 0x60, prio);
        queuepolyat(sm(Vit1, lmirror()), g.shSmallDragonEyes, 0x60, prio);
      }
      else if (it === itOrbDomination) {
        queuepolyat(sm(Vit1, MirrorX), g.shSmallWormHead, dark, prio);
        queuepolyat(sm(Vit1, MirrorX), g.shSmallWormEyes, 0x60, prio);
        queuepolyat(sm(sm(Vit1, MirrorX), lmirror()), g.shSmallWormEyes, 0x60, prio);
      }
      else if (it === itOrbMorph || it === itOrbChaos || it === itOrbPlague) {
        queuepolyat(Vit, g.shDisk, dark1, prio);
        queuepolyat(Vit1, g.shSmallTreat, dark, prio);
      }
      else if (it === itOrbWinter) {
        queuepolyat(Vit, g.shDisk, dark1, prio);
        queuepolyat(Vit1, g.shSnowflake, dark, prio);
      }
      else if (it === itOrbLuck)
        queuepolyat(Vit1, g.shSmallerDodeca, dark, prio);
      else if (it === itOrbAether) {
        queuepolyat(Vit1, g.shHalfDisk, dark, prio);
        queuepolyat(sm(Vit1, lmirror()), g.shHalfDisk, 0xFF, prio);
        queuepolyat(sm(Vit1, MirrorX), g.shHalfHumanoid, dark, prio);
        queuepolyat(sm(sm(Vit1, lmirror()), MirrorX), g.shHalfHumanoid, 0xFF, prio);
      }
      else if (it === itOrbFlash)
        queuepolyat(Vit1, g.shFlash, dark, prio);
      else if (it === itOrbMatter || it === itOrbStone) {
        queuepolyat(Vit, g.shDisk, dark1, prio);
        queuepolyat(Vit1, g.shDiskSq, dark, prio);
      }
      else if (it === itOrbSummon) {
        queuepolyat(Vit1, g.shHeptagon, dark, prio);
        queuepolyat(Vit1, g.shHeptagram, dark, prio);
      }
      else if (it === itOrbSafety) {
        queuepolyat(Vit, g.shDisk, dark, prio);
        const p = G.poly_outline;
        G.poly_outline = dark;
        try {
          queuepolyat(Vit1, g.shHeptagram, 0, prio);
        } finally { G.poly_outline = p; }
      }
      else {
        const jump = (it === itOrbPhasing || it === itOrbDash || it === itOrbFrog);
        const shape: hpcshape | null = (it === itOrbFriend) ? g.shTinyBird :
          (it === itOrbSide1) ? g.shSmallPSword :
            (it === itOrbDigging) ? g.shSmallPickAxe :
              (it === itOrbSword || it === itOrbSword2) ? g.shSmallSword :
                (it === itOrbThorns) ? g.shSmallHedgehogBlade :
                  (it === itOrbSide2 || it === itOrb37 || it === itOrbLava) ? g.shDiskT :
                    (it === itOrbGravity) ? g.shTinyArrow :
                      (it === itOrbFreedom || it === itOrbRecall) ? g.shDiskSq :
                        (it === itOrbEnergy) ? g.shHalfDisk :
                          (it === itOrbSpace) ? g.shSmallPirateHook :
                            (it === itOrbChoice || it === itOrbMirror || it === itOrbMagnetism || it === itOrbEmpathy || it === itOrbDiscord) ? g.shEccentricDisk :
                              (it === itOrbPsi || it === itOrbSide3) ? g.shDiskS :
                                (it === itOrbPurity) ? g.shSmallEgg :
                                  (it === itOrbLightning) ? g.shLightningBolt :
                                    (it === itOrbShield) ? g.shShield :
                                      (it === itOrbTime) ? g.shHourglass :
                                        (it === itOrbAir) ? g.shSmallFan :
                                          (it === itOrbWoods) ? g.shTreeIcon :
                                            (it === itOrbNature) ? g.shLeafIcon :
                                              (it === itOrbIllusion || it === itOrbInvis || it === itOrbTeleport) ? g.shHumanoid :
                                                jump ? g.shDiskSegment :
                                                  null;
        queuepolyat(Vit, g.shDisk, dark, prio);
        const reversed = (shape === g.shTreeIcon || shape === g.shHumanoid || it === itOrbSword2);
        const left90 = (shape === g.shLeafIcon || shape === g.shLightningBolt);
        if (shape)
          queuepolyat(reversed ? sm(Vit1, MirrorX) : left90 ? sm(Vit1, spin270()) : Vit1, shape, (it === itOrbInvis || it === itOrbTeleport) ? 0x20 : 0x80, prio);
        if (it === itOrbSide1 || (shape === g.shEccentricDisk && it !== itOrbDiscord))
          queuepolyat(sm(Vit1, lmirror()), shape!, 0x80, prio);
        if (jump || it === itOrbEnergy)
          queuepolyat(sm(Vit1, lmirror()), shape!, col, prio);
        if (it === itOrbIntensity || it === itOrbImpact)
          queuepolyat(Vit1, g.shDiskM, 0x80, prio);
        if (it === itOrbHorns) {
          queuepolyat(Vit1, g.shSmallBullHead, 0x80, prio);
          queuepolyat(Vit1, g.shSmallBullHorn, 0x80, prio);
          queuepolyat(sm(Vit1, lmirror()), g.shSmallBullHorn, 0x80, prio);
        }
        if (it === itOrbUndeath) {
          dark = darkena(fghostcolor(c!) /* minf[moFriendlyGhost].color */, 0, inice ? 0x80 : hidden ? 0x20 : 0xC0);
          queuepolyat(Vit1, g.shMiniGhost, dark, prio);
          queuepolyat(Vit1, g.shMiniEyes, 0xFF, prio);
        }
        if (it === itOrbSlaying) {
          queuepolyat(Vit1, g.shSmallFlailTrunk, 0x80, prio);
          queuepolyat(Vit1, g.shSmallHammerHead, 0x80, prio);
        }
        if (it === itOrbShell)
          for (let i = 1; i < 8; i++) {
            queuepolyat(Vit1, g.shTortoise[i][2], 0x80, prio);
            if (i >= 5 && i <= 7)
              queuepolyat(sm(Vit1, lmirror()), g.shTortoise[i][2], 0x80, prio);
          }
      }
    }

    queue_ring(sm(Vit, spinptick(1500, 0)), orbshape(iinf[it].orbshape), col, prio);
  }

  else {
    draw_ascii_or_zh(V, xch, iinf[it].name, icol, 1, 0.5);
  }

  return true;
}

export function queue_goal_text(P1: shiftpoint, sizemul: number, s: string, color: number): void {
  // CAP_VR: no
  queuestr_sp(P1, Math.trunc(G.vid.fsize * sizemul), s, color);
}

export function mark_compass(c: cell | null, P1: { v: shiftpoint }): boolean {
  const c1 = c ? findcompass(c) : null;
  if (!c1) return false;

  const P = ggmatrix(c1);
  P1.v = tC0_sm(P);

  if (isPlayerOn(c!)) {
    queue_goal_text(P1.v, 2, 'X', Math.imul(0x10100, Math.trunc(128 + 100 * sintick(150))) >>> 0);
    //  queuestr(V, 1, its(compassDist(c)), 0x10101 * int(128 - 100 * sin(ticks / 150.)), 1);
    queue_goal_text(P1.v, 1, its(-compassDist(c!)), Math.imul(0x10101, Math.trunc(128 - 100 * sintick(150))) >>> 0);
    addauraspecial(P1.v, 0xFF0000, 0);
    // addradar(P, 'X', iinf[itCompass].color, 0xFF, true): radarpoints are drawn only by the 3D radar
  }
  return true;
}
import { ypush } from './hyperpoint.ts';
import { lpispin } from './graph.ts';

