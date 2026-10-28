// @ts-nocheck
// NetHack 3.6.7 ball.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { exercise } from './attrib.ts';
import { is_pool } from './dbridge.ts';
import { cls, map_object, newsym } from './display.ts';
import { canletgo, dropx, flooreffects, set_wounded_legs } from './do.ts';
import { hliquid } from './do_name.ts';
import { omon_adj } from './dothrow.ts';
import { on_level } from './dungeon.ts';
import { losehp, movobj, near_capacity, nomul, spoteffects, weight_cap } from './hack.ts';
import { dist2, distmin } from './hacklib.ts';
import { freeinv } from './invent.ts';
import { obj_extract_self, place_object, remove_object } from './mkobj.ts';
import { Yname2, otense, safe_typename, xname, yname } from './objnam.ts';
import { encumber_msg } from './pickup.ts';
import { You, You_feel, Your, impossible, pline, pline_The } from './pline.ts';
import { body_part } from './polyself.ts';
import { rn2, rnd } from './rnd.ts';
import { deltrap, fill_pit, reset_utrap, sokoban_guilt, t_at } from './trap.ts';
import { hmon } from './uhitm.ts';
import { setuqwep, setuswapwep, setuwep } from './wield.ts';
import { find_mac } from './worn.ts';
import { miss } from './zap.ts';
import { $at2, G, S } from './rt/index.ts';
import { A_STR, BCPOS_BALL, BCPOS_CHAIN, BCPOS_DIFFER, BC_BALL, BC_CHAIN, BLINDED, DOOR, FALSE, HALF_PHDAM, HEAD, HEAVY_IRON_BALL, HMON_DRAGGED, HOLE, IRON, IRON_CHAIN, KILLED_BY, KILLED_BY_AN, LEFT_SIDE, LEG, LEVITATION, MITHRIL, NO_KILLER_PREFIX, OBJ_FLOOR, OBJ_FREE, OBJ_INVENT, PIT, POOL, RIGHT_SIDE, SLT_ENCUMBER, SPIKED_PIT, TRAPDOOR, TRUE, TT_BEARTRAP, TT_BURIEDBALL, TT_INFLOOR, TT_LAVA, TT_PIT, TT_WEB, W_BALL, W_CHAIN, W_WEAPONS, override_restriction } from './consts.ts';

let bcrestriction: number;
let drop_ball$pullmsg: Ptr | null;

export async function ballrelease(showmsg: number): Promise<void> {
  if (G.uball.where === 3) {
    if (showmsg) {
      await pline(S("Startled, you drop the iron ball."));
    }
    if (G.uwep === G.uball) {
      await setuwep(null);
    }
    if (G.uswapwep === G.uball) {
      await setuswapwep(null);
    }
    if (G.uquiver === G.uball) {
      await setuqwep(null);
    }
    await freeinv(G.uball);
    await encumber_msg();
  }
}

export async function ballfall(): Promise<void> {
  let gets_hit = 0;
  gets_hit = ((G.uball.ox !== G.u.ux || G.uball.oy !== G.u.uy) && (G.uwep === G.uball ? FALSE : rn2(5) << 24 >> 24) ? 1 : 0) << 24 >> 24;
  await ballrelease(TRUE);
  if (gets_hit) {
    let dmg = rn2(7) + 25;
    await pline_The(S("iron ball falls on your %s."), body_part(HEAD));
    if (G.uarmh) {
      if ((G.objects[G.uarmh.otyp].oc_material | 0) >= IRON && (G.objects[G.uarmh.otyp].oc_material | 0) <= MITHRIL) {
        await pline(S("Fortunately, you are wearing a hard helmet."));
        dmg = 3;
      } else if (G.flags.verbose) {
        await pline(S("%s does not protect you."), await Yname2(G.uarmh));
      }
    }
    await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (dmg + 1) / 2 | 0 : dmg, S("crunched in the head by an iron ball"), NO_KILLER_PREFIX);
  }
}

async function placebc_core(): Promise<void> {
  if (!G.uchain || !G.uball) {
    await impossible(S("Where are your ball and chain?"));
    return;
  }
  await flooreffects(G.uchain, G.u.ux, G.u.uy, S(""));
  if (G.uball.where === 3) {
    G.u.bc_order = BCPOS_DIFFER;
  } else {
    await flooreffects(G.uball, G.u.ux, G.u.uy, S(""));
    await place_object(G.uball, G.u.ux, G.u.uy);
    G.u.bc_order = BCPOS_CHAIN;
  }
  await place_object(G.uchain, G.u.ux, G.u.uy);
  G.u.bglyph = G.u.cglyph = $at2(G.level.locations, G.u.ux, G.u.uy).glyph;
  await newsym(G.u.ux, G.u.uy);
  bcrestriction = 0;
}

async function unplacebc_core(): Promise<void> {
  if (G.u.uswallow) {
    if ((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) {
      if (!(G.uball.where === 3)) {
        await obj_extract_self(G.uball);
      }
      await obj_extract_self(G.uchain);
    }
    return;
  }
  if (!(G.uball.where === 3)) {
    await obj_extract_self(G.uball);
    if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && G.u.bc_felt & BC_BALL) {
      $at2(G.level.locations, G.uball.ox, G.uball.oy).glyph = G.u.bglyph;
    }
    await newsym(G.uball.ox, G.uball.oy);
  }
  await obj_extract_self(G.uchain);
  if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && G.u.bc_felt & BC_CHAIN) {
    $at2(G.level.locations, G.uchain.ox, G.uchain.oy).glyph = G.u.cglyph;
  }
  await newsym(G.uchain.ox, G.uchain.oy);
  G.u.bc_felt = 0;
}

function check_restriction(restriction: number): number {
  let ret = FALSE;
  if (!bcrestriction || restriction === override_restriction) {
    ret = TRUE;
  } else {
    ret = (bcrestriction === restriction ? TRUE : FALSE) << 24 >> 24;
  }
  return ret;
}

export async function placebc(): Promise<void> {
  if (!check_restriction(0)) {
    return;
  }
  if (G.uchain && G.uchain.where !== OBJ_FREE) {
    await impossible(S("bc already placed?"));
    return;
  }
  await placebc_core();
}

export async function unplacebc(): Promise<void> {
  if (bcrestriction) {
    await impossible(S("unplacebc denied, restriction in place"));
    return;
  }
  await unplacebc_core();
}

export async function unplacebc_and_covet_placebc(): Promise<number> {
  let restriction = 0;
  if (bcrestriction) {
    await impossible(S("unplacebc_and_covet_placebc denied, already restricted"));
  } else {
    restriction = bcrestriction = rnd(400);
    await unplacebc_core();
  }
  return restriction;
}

export async function lift_covet_and_placebc(pin: number): Promise<void> {
  if (!check_restriction(pin)) {
    return;
  }
  if (G.uchain && G.uchain.where !== OBJ_FREE) {
    await impossible(S("bc already placed?"));
    return;
  }
  await placebc_core();
}

async function bc_order(): Promise<number> {
  let obj = null;
  if (G.uchain.ox !== G.uball.ox || G.uchain.oy !== G.uball.oy || G.uball.where === 3 || G.u.uswallow | 0) {
    return BCPOS_DIFFER;
  }
  for (obj = G.level.objects[G.uball.ox][G.uball.oy]; obj; obj = obj.v.v_nexthere) {
    if (obj === G.uchain) {
      return BCPOS_CHAIN;
    }
    if (obj === G.uball) {
      return BCPOS_BALL;
    }
  }
  await impossible(S("bc_order:  ball&chain not in same location!"));
  return BCPOS_DIFFER;
}

export async function set_bc(already_blind: number): Promise<void> {
  let ball_on_floor = !(G.uball.where === 3) ? 1 : 0;
  G.u.bc_order = await bc_order();
  G.u.bc_felt = ball_on_floor ? BC_BALL | BC_CHAIN : BC_CHAIN;
  if (already_blind || G.u.uswallow | 0) {
    G.u.cglyph = G.u.bglyph = $at2(G.level.locations, G.u.ux, G.u.uy).glyph;
    return;
  }
  await remove_object(G.uchain);
  if (ball_on_floor) {
    await remove_object(G.uball);
  }
  await newsym(G.uchain.ox, G.uchain.oy);
  G.u.cglyph = $at2(G.level.locations, G.uchain.ox, G.uchain.oy).glyph;
  if (G.u.bc_order === BCPOS_DIFFER) {
    await place_object(G.uchain, G.uchain.ox, G.uchain.oy);
    await newsym(G.uchain.ox, G.uchain.oy);
    if (ball_on_floor) {
      await newsym(G.uball.ox, G.uball.oy);
      G.u.bglyph = $at2(G.level.locations, G.uball.ox, G.uball.oy).glyph;
      await place_object(G.uball, G.uball.ox, G.uball.oy);
      await newsym(G.uball.ox, G.uball.oy);
    }
  } else {
    G.u.bglyph = G.u.cglyph;
    if (G.u.bc_order === BCPOS_CHAIN) {
      await place_object(G.uball, G.uball.ox, G.uball.oy);
      await place_object(G.uchain, G.uchain.ox, G.uchain.oy);
    } else {
      await place_object(G.uchain, G.uchain.ox, G.uchain.oy);
      await place_object(G.uball, G.uball.ox, G.uball.oy);
    }
    await newsym(G.uball.ox, G.uball.oy);
  }
}

export async function move_bc(before: number, control: number, ballx: number, bally: number, chainx: number, chainy: number): Promise<void> {
  if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
    if (!before) {
      if (control & BC_CHAIN && control & BC_BALL) {
        if (G.u.bc_felt & BC_BALL) {
          $at2(G.level.locations, G.uball.ox, G.uball.oy).glyph = G.u.bglyph;
        }
        if (G.u.bc_felt & BC_CHAIN) {
          $at2(G.level.locations, G.uchain.ox, G.uchain.oy).glyph = G.u.cglyph;
        }
        G.u.bc_felt = 0;
        G.u.bglyph = $at2(G.level.locations, ballx, bally).glyph;
        G.u.cglyph = $at2(G.level.locations, chainx, chainy).glyph;
        await movobj(G.uball, ballx, bally);
        await movobj(G.uchain, chainx, chainy);
      } else if (control & BC_BALL) {
        if (G.u.bc_felt & BC_BALL) {
          if (G.u.bc_order === BCPOS_DIFFER) {
            $at2(G.level.locations, G.uball.ox, G.uball.oy).glyph = G.u.bglyph;
          } else if (G.u.bc_order === BCPOS_BALL) {
            if (G.u.bc_felt & BC_CHAIN) {
              await map_object(G.uchain, 0);
            } else {
              $at2(G.level.locations, G.uball.ox, G.uball.oy).glyph = G.u.bglyph;
            }
          }
          G.u.bc_felt &= ~BC_BALL;
        }
        G.u.bglyph = ballx !== chainx || bally !== chainy ? $at2(G.level.locations, ballx, bally).glyph : G.u.cglyph;
        await movobj(G.uball, ballx, bally);
      } else if (control & BC_CHAIN) {
        if (G.u.bc_felt & BC_CHAIN) {
          if (G.u.bc_order === BCPOS_DIFFER) {
            $at2(G.level.locations, G.uchain.ox, G.uchain.oy).glyph = G.u.cglyph;
          } else if (G.u.bc_order === BCPOS_CHAIN) {
            if (G.u.bc_felt & BC_BALL) {
              await map_object(G.uball, 0);
            } else {
              $at2(G.level.locations, G.uchain.ox, G.uchain.oy).glyph = G.u.cglyph;
            }
          }
          G.u.bc_felt &= ~BC_CHAIN;
        }
        G.u.cglyph = ballx !== chainx || bally !== chainy ? $at2(G.level.locations, chainx, chainy).glyph : G.u.bglyph;
        await movobj(G.uchain, chainx, chainy);
      }
      G.u.bc_order = await bc_order();
    }
  } else {
    if (before) {
      if (!control) {
        G.u.bc_order = await bc_order();
      }
      await remove_object(G.uchain);
      await newsym(G.uchain.ox, G.uchain.oy);
      if (!(G.uball.where === 3)) {
        await remove_object(G.uball);
        await newsym(G.uball.ox, G.uball.oy);
      }
    } else {
      let on_floor = !(G.uball.where === 3) ? 1 : 0;
      if (control & BC_CHAIN || !control && G.u.bc_order === BCPOS_CHAIN) {
        if (on_floor) {
          await place_object(G.uball, ballx, bally);
        }
        await place_object(G.uchain, chainx, chainy);
      } else {
        await place_object(G.uchain, chainx, chainy);
        if (on_floor) {
          await place_object(G.uball, ballx, bally);
        }
      }
      await newsym(chainx, chainy);
      if (on_floor) {
        await newsym(ballx, bally);
      }
    }
  }
}

export async function drag_ball(x: number, y: number, bc_control: Ptr | null, ballx: Ptr | null, bally: Ptr | null, chainx: Ptr | null, chainy: Ptr | null, cause_delay: Ptr | null, allow_drag: number): Promise<number> {
  let $g = 0;
  let t = null;
  let already_in_rock = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      t = null;
      ballx.a[ballx.o] = G.uball.ox;
      bally.a[bally.o] = G.uball.oy;
      chainx.a[chainx.o] = G.uchain.ox;
      chainy.a[chainy.o] = G.uchain.oy;
      bc_control.a[bc_control.o] = 0;
      cause_delay.a[cause_delay.o] = FALSE;
      if (dist2(x, y, G.uchain.ox, G.uchain.oy) <= 2) {
        await move_bc(1, bc_control.a[bc_control.o], ballx.a[ballx.o], bally.a[bally.o], chainx.a[chainx.o], chainy.a[chainy.o]);
        return TRUE;
      }
      if (G.uball.where === 3 || distmin(x, y, G.uball.ox, G.uball.oy) <= 2) {
        let oldchainx = G.uchain.ox;
        let oldchainy = G.uchain.oy;
        bc_control.a[bc_control.o] = BC_CHAIN;
        await move_bc(1, bc_control.a[bc_control.o], ballx.a[ballx.o], bally.a[bally.o], chainx.a[chainx.o], chainy.a[chainy.o]);
        if (G.uball.where === 3) {
          if (distmin(x, y, G.uchain.ox, G.uchain.oy) > 1) {
            chainx.a[chainx.o] = G.u.ux;
            chainy.a[chainy.o] = G.u.uy;
          }
          return TRUE;
        }
        if ($at2(G.level.locations, G.u.ux, G.u.uy).typ < POOL || $at2(G.level.locations, G.u.ux, G.u.uy).typ === DOOR && ($at2(G.level.locations, G.u.ux, G.u.uy).flags | 0) & (4 | 8) || ($at2(G.level.locations, chainx.a[chainx.o], chainy.a[chainy.o]).typ < POOL || $at2(G.level.locations, chainx.a[chainx.o], chainy.a[chainy.o]).typ === DOOR && ($at2(G.level.locations, chainx.a[chainx.o], chainy.a[chainy.o]).flags | 0) & (4 | 8)) || ($at2(G.level.locations, G.uball.ox, G.uball.oy).typ < POOL || $at2(G.level.locations, G.uball.ox, G.uball.oy).typ === DOOR && ($at2(G.level.locations, G.uball.ox, G.uball.oy).flags | 0) & (4 | 8))) {
          already_in_rock = TRUE;
        } else {
          already_in_rock = FALSE;
        }
        switch (dist2(x, y, G.uball.ox, G.uball.oy)) {
        case 8:
          chainx.a[chainx.o] = ((G.uball.ox + x) / 2 | 0) << 24 >> 24;
          chainy.a[chainy.o] = ((G.uball.oy + y) / 2 | 0) << 24 >> 24;
          if (($at2(G.level.locations, chainx.a[chainx.o], chainy.a[chainy.o]).typ < POOL || $at2(G.level.locations, chainx.a[chainx.o], chainy.a[chainy.o]).typ === DOOR && ($at2(G.level.locations, chainx.a[chainx.o], chainy.a[chainy.o]).flags | 0) & (4 | 8)) && !already_in_rock) {
            do {
              chainx.a[chainx.o] = oldchainx;
              chainy.a[chainy.o] = oldchainy;
              await move_bc(0, bc_control.a[bc_control.o], ballx.a[ballx.o], bally.a[bally.o], chainx.a[chainx.o], chainy.a[chainy.o]);
              { $g = 1; continue $L; }
            } while (0);
          }
          break;
        case 5:
          {
            let tempx = 0;
            let tempy = 0;
            let tempx2 = 0;
            let tempy2 = 0;
            if (Math.abs(x - G.uball.ox) === 1) {
              tempx = x;
              tempx2 = G.uball.ox;
              tempy = tempy2 = ((G.uball.oy + y) / 2 | 0) << 24 >> 24;
            } else {
              tempx = tempx2 = ((G.uball.ox + x) / 2 | 0) << 24 >> 24;
              tempy = y;
              tempy2 = G.uball.oy;
            }
            if (($at2(G.level.locations, tempx, tempy).typ < POOL || $at2(G.level.locations, tempx, tempy).typ === DOOR && ($at2(G.level.locations, tempx, tempy).flags | 0) & (4 | 8)) && !($at2(G.level.locations, tempx2, tempy2).typ < POOL || $at2(G.level.locations, tempx2, tempy2).typ === DOOR && ($at2(G.level.locations, tempx2, tempy2).flags | 0) & (4 | 8)) && !already_in_rock) {
              if (allow_drag) {
                if (dist2(G.u.ux, G.u.uy, G.uball.ox, G.uball.oy) === 5 && dist2(x, y, tempx, tempy) === 1) {
                  do {
                    chainx.a[chainx.o] = oldchainx;
                    chainy.a[chainy.o] = oldchainy;
                    await move_bc(0, bc_control.a[bc_control.o], ballx.a[ballx.o], bally.a[bally.o], chainx.a[chainx.o], chainy.a[chainy.o]);
                    { $g = 1; continue $L; }
                  } while (0);
                }
                if (dist2(G.u.ux, G.u.uy, G.uball.ox, G.uball.oy) === 4 && dist2(x, y, tempx, tempy) === 2) {
                  do {
                    chainx.a[chainx.o] = oldchainx;
                    chainy.a[chainy.o] = oldchainy;
                    await move_bc(0, bc_control.a[bc_control.o], ballx.a[ballx.o], bally.a[bally.o], chainx.a[chainx.o], chainy.a[chainy.o]);
                    { $g = 1; continue $L; }
                  } while (0);
                }
              }
              chainx.a[chainx.o] = tempx2;
              chainy.a[chainy.o] = tempy2;
            } else if (!($at2(G.level.locations, tempx, tempy).typ < POOL || $at2(G.level.locations, tempx, tempy).typ === DOOR && ($at2(G.level.locations, tempx, tempy).flags | 0) & (4 | 8)) && ($at2(G.level.locations, tempx2, tempy2).typ < POOL || $at2(G.level.locations, tempx2, tempy2).typ === DOOR && ($at2(G.level.locations, tempx2, tempy2).flags | 0) & (4 | 8)) && !already_in_rock) {
              if (allow_drag) {
                if (dist2(G.u.ux, G.u.uy, G.uball.ox, G.uball.oy) === 5 && dist2(x, y, tempx2, tempy2) === 1) {
                  do {
                    chainx.a[chainx.o] = oldchainx;
                    chainy.a[chainy.o] = oldchainy;
                    await move_bc(0, bc_control.a[bc_control.o], ballx.a[ballx.o], bally.a[bally.o], chainx.a[chainx.o], chainy.a[chainy.o]);
                    { $g = 1; continue $L; }
                  } while (0);
                }
                if (dist2(G.u.ux, G.u.uy, G.uball.ox, G.uball.oy) === 4 && dist2(x, y, tempx2, tempy2) === 2) {
                  do {
                    chainx.a[chainx.o] = oldchainx;
                    chainy.a[chainy.o] = oldchainy;
                    await move_bc(0, bc_control.a[bc_control.o], ballx.a[ballx.o], bally.a[bally.o], chainx.a[chainx.o], chainy.a[chainy.o]);
                    { $g = 1; continue $L; }
                  } while (0);
                }
              }
              chainx.a[chainx.o] = tempx;
              chainy.a[chainy.o] = tempy;
            } else if (($at2(G.level.locations, tempx, tempy).typ < POOL || $at2(G.level.locations, tempx, tempy).typ === DOOR && ($at2(G.level.locations, tempx, tempy).flags | 0) & (4 | 8)) && ($at2(G.level.locations, tempx2, tempy2).typ < POOL || $at2(G.level.locations, tempx2, tempy2).typ === DOOR && ($at2(G.level.locations, tempx2, tempy2).flags | 0) & (4 | 8)) && !already_in_rock) {
              do {
                chainx.a[chainx.o] = oldchainx;
                chainy.a[chainy.o] = oldchainy;
                await move_bc(0, bc_control.a[bc_control.o], ballx.a[ballx.o], bally.a[bally.o], chainx.a[chainx.o], chainy.a[chainy.o]);
                { $g = 1; continue $L; }
              } while (0);
            } else if (dist2(tempx, tempy, G.uchain.ox, G.uchain.oy) < dist2(tempx2, tempy2, G.uchain.ox, G.uchain.oy) || dist2(tempx, tempy, G.uchain.ox, G.uchain.oy) === dist2(tempx2, tempy2, G.uchain.ox, G.uchain.oy) && rn2(2)) {
              chainx.a[chainx.o] = tempx;
              chainy.a[chainy.o] = tempy;
            } else {
              chainx.a[chainx.o] = tempx2;
              chainy.a[chainy.o] = tempy2;
            }
            break;
          }
        case 4:
          if (distmin(x, y, G.uchain.ox, G.uchain.oy) <= 1 && distmin(G.uchain.ox, G.uchain.oy, G.uball.ox, G.uball.oy) <= 1) {
            break;
          }
          chainx.a[chainx.o] = ((x + G.uball.ox) / 2 | 0) << 24 >> 24;
          chainy.a[chainy.o] = ((y + G.uball.oy) / 2 | 0) << 24 >> 24;
          if (($at2(G.level.locations, chainx.a[chainx.o], chainy.a[chainy.o]).typ < POOL || $at2(G.level.locations, chainx.a[chainx.o], chainy.a[chainy.o]).typ === DOOR && ($at2(G.level.locations, chainx.a[chainx.o], chainy.a[chainy.o]).flags | 0) & (4 | 8)) && !already_in_rock) {
            do {
              chainx.a[chainx.o] = oldchainx;
              chainy.a[chainy.o] = oldchainy;
              await move_bc(0, bc_control.a[bc_control.o], ballx.a[ballx.o], bally.a[bally.o], chainx.a[chainx.o], chainy.a[chainy.o]);
              { $g = 1; continue $L; }
            } while (0);
          }
          break;
        case 2:
          if (dist2(x, y, G.uball.ox, G.uball.oy) === 2 && dist2(x, y, G.uchain.ox, G.uchain.oy) === 4) {
            if (G.uchain.oy === y) {
              chainx.a[chainx.o] = G.uball.ox;
            } else {
              chainy.a[chainy.o] = G.uball.oy;
            }
            if (($at2(G.level.locations, chainx.a[chainx.o], chainy.a[chainy.o]).typ < POOL || $at2(G.level.locations, chainx.a[chainx.o], chainy.a[chainy.o]).typ === DOOR && ($at2(G.level.locations, chainx.a[chainx.o], chainy.a[chainy.o]).flags | 0) & (4 | 8)) && !already_in_rock) {
              do {
                chainx.a[chainx.o] = oldchainx;
                chainy.a[chainy.o] = oldchainy;
                await move_bc(0, bc_control.a[bc_control.o], ballx.a[ballx.o], bally.a[bally.o], chainx.a[chainx.o], chainy.a[chainy.o]);
                { $g = 1; continue $L; }
              } while (0);
            }
            break;
          }
        case 1:
        case 0:
          if (distmin(x, y, G.uchain.ox, G.uchain.oy) <= 1 && distmin(G.uchain.ox, G.uchain.oy, G.uball.ox, G.uball.oy) <= 1) {
            break;
          }
          if (distmin(x, y, G.u.ux, G.u.uy) <= 1 && distmin(G.u.ux, G.u.uy, G.uball.ox, G.uball.oy) <= 1) {
            chainx.a[chainx.o] = G.u.ux;
            chainy.a[chainy.o] = G.u.uy;
            break;
          }
          chainx.a[chainx.o] = x;
          chainy.a[chainy.o] = y;
          break;
        default:
          await impossible(S("bad chain movement"));
          break;
        }
        return TRUE;
      }
    case 1: // drag
      if (near_capacity() > SLT_ENCUMBER && dist2(x, y, G.u.ux, G.u.uy) <= 2) {
        await You(S("cannot %sdrag the heavy iron ball."), G.invent ? S("carry all that and also ") : S(""));
        nomul(0);
        return FALSE;
      }
      if (is_pool(G.uchain.ox, G.uchain.oy) && ($at2(G.level.locations, G.uchain.ox, G.uchain.oy).typ === POOL || !is_pool(G.uball.ox, G.uball.oy) || $at2(G.level.locations, G.uball.ox, G.uball.oy).typ === POOL) || (t = t_at(G.uchain.ox, G.uchain.oy)) && ((t.ttyp | 0) === PIT || (t.ttyp | 0) === SPIKED_PIT || ((t.ttyp | 0) === HOLE || (t.ttyp | 0) === TRAPDOOR))) {
        if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) {
          await You_feel(S("a tug from the iron ball."));
          if (t) {
            t.tseen = 1;
          }
        } else {
          let victim = null;
          await You(S("are jerked back by the iron ball!"));
          if (!!(victim = !!G.level.monsters[G.uchain.ox][G.uchain.oy] ? G.level.monsters[G.uchain.ox][G.uchain.oy] : null)) {
            let tmp = 0;
            let dieroll = rnd(20);
            tmp = -2 + (G.u.uluck + G.u.moreluck) + find_mac(victim);
            tmp += await omon_adj(victim, G.uball, TRUE);
            if (tmp >= dieroll) {
              await hmon(victim, G.uball, HMON_DRAGGED, dieroll);
            } else {
              await miss(await xname(G.uball), victim);
            }
          }
          if (!(!!G.level.monsters[G.uchain.ox][G.uchain.oy] ? G.level.monsters[G.uchain.ox][G.uchain.oy] : null)) {
            G.u.ux = G.uchain.ox;
            G.u.uy = G.uchain.oy;
            await newsym(G.u.ux0, G.u.uy0);
          }
          nomul(0);
          bc_control.a[bc_control.o] = BC_BALL;
          await move_bc(1, bc_control.a[bc_control.o], ballx.a[ballx.o], bally.a[bally.o], chainx.a[chainx.o], chainy.a[chainy.o]);
          ballx.a[ballx.o] = G.uchain.ox;
          bally.a[bally.o] = G.uchain.oy;
          await move_bc(0, bc_control.a[bc_control.o], ballx.a[ballx.o], bally.a[bally.o], chainx.a[chainx.o], chainy.a[chainy.o]);
          await spoteffects(TRUE);
          return FALSE;
        }
      }
      bc_control.a[bc_control.o] = BC_BALL | BC_CHAIN;
      await move_bc(1, bc_control.a[bc_control.o], ballx.a[ballx.o], bally.a[bally.o], chainx.a[chainx.o], chainy.a[chainy.o]);
      if (dist2(x, y, G.u.ux, G.u.uy) > 2) {
        ballx.a[ballx.o] = chainx.a[chainx.o] = x;
        bally.a[bally.o] = chainy.a[chainy.o] = y;
      } else {
        let newchainx = G.u.ux;
        let newchainy = G.u.uy;
        if (dist2(x, y, G.uchain.ox, G.uchain.oy) === 4 && !($at2(G.level.locations, newchainx, newchainy).typ < POOL || $at2(G.level.locations, newchainx, newchainy).typ === DOOR && ($at2(G.level.locations, newchainx, newchainy).flags | 0) & (4 | 8))) {
          newchainx = ((x + G.uchain.ox) / 2 | 0) << 24 >> 24;
          newchainy = ((y + G.uchain.oy) / 2 | 0) << 24 >> 24;
          if ($at2(G.level.locations, newchainx, newchainy).typ < POOL || $at2(G.level.locations, newchainx, newchainy).typ === DOOR && ($at2(G.level.locations, newchainx, newchainy).flags | 0) & (4 | 8)) {
            newchainx = G.u.ux;
            newchainy = G.u.uy;
          }
        }
        ballx.a[ballx.o] = G.uchain.ox;
        bally.a[bally.o] = G.uchain.oy;
        chainx.a[chainx.o] = newchainx;
        chainy.a[chainy.o] = newchainy;
      }
      cause_delay.a[cause_delay.o] = TRUE;
      return TRUE;
    }
    break;
  }
}

export async function drop_ball(x: number, y: number): Promise<void> {
  if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
    G.u.bc_order = await bc_order();
    G.u.bglyph = G.u.bc_order ? G.u.cglyph : $at2(G.level.locations, x, y).glyph;
  }
  if (x !== G.u.ux || y !== G.u.uy) {
    let t = null;
    let side = 0;
    if (G.u.utrap && G.u.utraptype !== TT_INFLOOR && G.u.utraptype !== TT_BURIEDBALL) {
      switch (G.u.utraptype) {
      case TT_PIT:
        await pline(drop_ball$pullmsg, S("pit"));
        break;
      case TT_WEB:
        await pline(drop_ball$pullmsg, S("web"));
        await pline_The(S("web is destroyed!"));
        await deltrap(t_at(G.u.ux, G.u.uy));
        break;
      case TT_LAVA:
        await pline(drop_ball$pullmsg, hliquid(S("lava")));
        break;
      case TT_BEARTRAP:
        side = rn2(3) ? LEFT_SIDE : RIGHT_SIDE;
        await pline(drop_ball$pullmsg, S("bear trap"));
        await set_wounded_legs(side, rn2(1000) + 500);
        if (!G.u.usteed) {
          await Your(S("%s %s is severely damaged."), side === LEFT_SIDE ? S("left") : S("right"), body_part(LEG));
          await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (2 + 1) / 2 | 0 : 2, S("leg damage from being pulled out of a bear trap"), KILLED_BY);
        }
        break;
      }
      await reset_utrap(TRUE);
      await fill_pit(G.u.ux, G.u.uy);
    }
    G.u.ux0 = G.u.ux;
    G.u.uy0 = G.u.uy;
    if (!((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) && !!!G.level.monsters[x][y] && !G.u.utrap && (is_pool(x, y) || (t = t_at(x, y)) && ((t.ttyp | 0) === PIT || (t.ttyp | 0) === SPIKED_PIT || ((t.ttyp | 0) === HOLE || (t.ttyp | 0) === TRAPDOOR)))) {
      G.u.ux = x;
      G.u.uy = y;
    } else {
      G.u.ux = x - G.u.dx << 24 >> 24;
      G.u.uy = y - G.u.dy << 24 >> 24;
    }
    G.vision_full_recalc = 1;
    if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
      if (G.u.bc_felt & BC_CHAIN) {
        $at2(G.level.locations, G.uchain.ox, G.uchain.oy).glyph = G.u.cglyph;
      }
      G.u.bc_felt = 0;
      G.u.cglyph = G.u.bc_order ? G.u.bglyph : $at2(G.level.locations, G.u.ux, G.u.uy).glyph;
    }
    await movobj(G.uchain, G.u.ux, G.u.uy);
    if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
      G.u.bc_order = await bc_order();
    }
    await newsym(G.u.ux0, G.u.uy0);
    if (G.u.ux0 !== G.u.ux || G.u.uy0 !== G.u.uy) {
      await spoteffects(TRUE);
      sokoban_guilt();
    }
  }
}

async function litter(): Promise<void> {
  let otmp = null;
  let nextobj = null;
  let capacity = weight_cap();
  for (otmp = G.invent; otmp; otmp = nextobj) {
    nextobj = otmp.nobj;
    if (otmp !== G.uball && rnd(capacity) <= (otmp.owt | 0)) {
      if (await canletgo(otmp, S(""))) {
        await You(S("drop %s and %s %s down the stairs with you."), await yname(otmp), otmp.quan === 1 ? S("it") : S("they"), otense(otmp, S("fall")));
        await dropx(otmp);
        await encumber_msg();
      }
    }
  }
}

export async function drag_down(): Promise<void> {
  let forward = 0;
  let dragchance = 3;
  forward = (G.uball.where === 3 && (G.uwep === G.uball || !G.uwep || !rn2(3)) ? 1 : 0) << 24 >> 24;
  if (G.uball.where === 3) {
    await You(S("lose your grip on the iron ball."));
  }
  await cls();
  if (forward) {
    if (rn2(6)) {
      await pline_The(S("iron ball drags you downstairs!"));
      await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (rnd(6) + 1) / 2 | 0 : rnd(6), S("dragged downstairs by an iron ball"), NO_KILLER_PREFIX);
      await litter();
    }
  } else {
    if (rn2(2)) {
      await pline_The(S("iron ball smacks into you!"));
      await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (rnd(20) + 1) / 2 | 0 : rnd(20), S("iron ball collision"), KILLED_BY_AN);
      await exercise(A_STR, FALSE);
      dragchance = dragchance - 2 & 0xff;
    }
    if (dragchance >= rnd(6)) {
      await pline_The(S("iron ball drags you downstairs!"));
      await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (rnd(3) + 1) / 2 | 0 : rnd(3), S("dragged downstairs by an iron ball"), NO_KILLER_PREFIX);
      await exercise(A_STR, FALSE);
      await litter();
    }
  }
}

export async function bc_sanity_check(): Promise<void> {
  let otyp = 0;
  let freeball = 0;
  let freechain = 0;
  let onam = null;
  if (!!G.uball && (!G.uball || !G.uchain)) {
    await impossible(S("Punished without %s%s%s?"), !G.uball ? S("iron ball") : S(""), !G.uball && !G.uchain ? S(" and ") : S(""), !G.uchain ? S("attached chain") : S(""));
  } else if (!!!G.uball && (G.uball || G.uchain)) {
    await impossible(S("Attached %s%s%s without being Punished?"), G.uchain ? S("chain") : S(""), G.uchain && G.uball ? S(" and ") : S(""), G.uball ? S("iron ball") : S(""));
  }
  freechain = !G.uchain || G.uchain.where === OBJ_FREE ? 1 : 0;
  freeball = !G.uball || G.uball.where === OBJ_FREE || freechain && G.uball.where === OBJ_INVENT ? 1 : 0;
  if (G.uball && (G.uball.otyp !== HEAVY_IRON_BALL || G.uball.where !== OBJ_FLOOR && G.uball.where !== OBJ_INVENT && G.uball.where !== OBJ_FREE || freeball ^ freechain || (G.uball.owornmask & W_BALL) === 0 || (G.uball.owornmask & ~(W_BALL | W_WEAPONS)) !== 0)) {
    otyp = G.uball.otyp;
    onam = await safe_typename(otyp);
    await impossible(S("uball: type %d (%s), where %d, wornmask=0x%08lx"), otyp, onam, G.uball.where, G.uball.owornmask);
  }
  if (G.uchain && (G.uchain.otyp !== IRON_CHAIN || G.uchain.where !== OBJ_FLOOR && G.uchain.where !== OBJ_FREE || freechain ^ freeball || (G.uchain.owornmask & W_CHAIN) === 0 || (G.uchain.owornmask & ~W_CHAIN) !== 0)) {
    otyp = G.uchain.otyp;
    onam = await safe_typename(otyp);
    await impossible(S("uchain: type %d (%s), where %d, wornmask=0x%08lx"), otyp, onam, G.uchain.where, G.uchain.owornmask);
  }
  if (G.uball && G.uchain && !(freeball && freechain)) {
    let bx = 0;
    let by = 0;
    let cx = 0;
    let cy = 0;
    let bdx = 0;
    let bdy = 0;
    let cdx = 0;
    let cdy = 0;
    cx = G.uchain.ox, cy = G.uchain.oy;
    cdx = cx - G.u.ux, cdy = cy - G.u.uy;
    cdx = Math.abs(cdx), cdy = Math.abs(cdy);
    if (G.uball.where === OBJ_INVENT) {
      bx = G.u.ux, by = G.u.uy;
    } else {
      bx = G.uball.ox, by = G.uball.oy;
    }
    bdx = bx - cx, bdy = by - cy;
    bdx = Math.abs(bdx), bdy = Math.abs(bdy);
    if (cdx > 1 || cdy > 1 || bdx > 1 || bdy > 1) {
      await impossible(S("b&c distance: you@<%d,%d>, chain@<%d,%d>, ball@<%d,%d>"), G.u.ux, G.u.uy, cx, cy, bx, by);
    }
  }
}

export function $init(): void {
  bcrestriction = 0;
  drop_ball$pullmsg = S("The ball pulls you out of the %s!");
}
