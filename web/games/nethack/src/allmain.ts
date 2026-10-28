// @ts-nocheck
// NetHack 3.6.7 allmain.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { check_leash, next_to_u } from './apply.ts';
import { init_artifacts, mkot_trap_warn } from './artifact.ts';
import { acurr, change_luck, exerchk, exercise, restore_attrib } from './attrib.ts';
import { bot, status_eval_next_unhilite, status_initialize, timebot } from './botl.ts';
import { end_of_input, enter_explore_mode, pushch, rhack, sanity_check, savech } from './cmd.ts';
import { is_pool } from './dbridge.ts';
import { decl_init } from './decl.ts';
import { do_vicinity_map, dosearch0, warnreveal } from './detect.ts';
import { clear_glyph_buffer, curs_on_u, docrt, flush_screen, see_monsters, see_objects, see_traps, swallowed, under_ground, under_water } from './display.ts';
import { deferred_goto, save_currentstate } from './do.ts';
import { find_ac, glibr, set_wear } from './do_wear.ts';
import { makedog } from './dog.ts';
import { obj_delivery } from './dokick.ts';
import { depth, init_dungeons, on_level, u_on_upstairs } from './dungeon.ts';
import { gethungry, maybe_finished_meal, reset_eat } from './eat.ts';
import { done1 } from './end.ts';
import { read_engr_at, u_wipe_engr } from './engrave.ts';
import { check_special_room, domove, lookaround, monster_nearby, nomul, pooleffects, unmul } from './hack.ts';
import { eos, friday_13th, getnow, night, phase_of_the_moon, strncmpi } from './hacklib.ts';
import { update_inventory } from './invent.ts';
import { ckmailstatus } from './mail.ts';
import { makemon } from './makemon.ts';
import { mklev } from './mklev.ts';
import { fumaroles, movebubbles } from './mkmaze.ts';
import { clear_splitobjs } from './mkobj.ts';
import { mcalcdistress, mcalcmove, mnexto, movemon } from './mon.ts';
import { monst_init } from './monst.ts';
import { init_objects } from './o_init.ts';
import { objects_init } from './objects.ts';
import { match_optname } from './options.ts';
import { encumber_msg, pickup } from './pickup.ts';
import { Norep, You, pline, raw_printf } from './pline.ts';
import { polyself, rehumanize, udeadinside, ugenocided } from './polyself.ts';
import { align_str } from './priest.ts';
import { com_pager, load_qtlist } from './questpgr.ts';
import { run_regions } from './region.ts';
import { rn2, rnd } from './rnd.ts';
import { Hello, role_init } from './role.ts';
import { dosounds } from './sounds.ts';
import { age_spells } from './spell.ts';
import { tele } from './teleport.ts';
import { do_storms, fall_asleep, nh_timeout } from './timeout.ts';
import { initrack, settrack } from './track.ts';
import { sink_into_lava } from './trap.ts';
import { u_init } from './u_init.ts';
import { invault } from './vault.ts';
import { early_version_info } from './version.ts';
import { vision_recalc, vision_reset } from './vision.ts';
import { you_were } from './were.ts';
import { amulet, intervene } from './wizard.ts';
import { clear_bypasses } from './worn.ts';
import { struct_early_opt } from './structs.ts';
import { $rd, $sarrOf, $u64, $wr, G, P, S, isspace, signal, sprintf, strchr, strlen } from './rt/index.ts';
import { ARG_DEBUG, ARG_SHOWPATHS, ARG_VERSION, A_CON, A_CURRENT, A_DEX, A_INT, A_ORIGINAL, A_WIS, BLINDED, BUFSZ, CLAIRVOYANT, COLNO, ENERGY_REGENERATION, EXT_ENCUMBER, FALSE, FAST, FULL_MOON, GLIB, G_NOCORPSE, HALF_PHDAM, HALLUC, HALLUC_RES, HVY_ENCUMBER, LOW_PM, MAXULEV, MOD_ENCUMBER, NEW_MOON, NHW_MAP, NHW_MENU, NHW_MESSAGE, NHW_STATUS, NON_PM, NORMAL_SPEED, NO_MM_FLAGS, NUMMONS, POLYMORPH, REGENERATION, ROLE_FEMALE, ROLE_GENDMASK, ROLE_MALE, RUN_TPORT, SEARCHING, SIGINT, SLT_ENCUMBER, S_EEL, TELEPAT, TELEPORT, TRUE, TT_LAVA, UNCHANGING, UNENCUMBERED, WARNING, WARN_OF_MON } from './consts.ts';

let earlyopts: any;

export async function moveloop(resuming: number): Promise<void> {
  let moveamt = 0;
  let wtcap = 0;
  let change = 0;
  let monscanmove = FALSE;
  decl_init();
  monst_init();
  objects_init();
  if (resuming && G.iflags.deferred_X) {
    await enter_explore_mode();
  }
  G.flags.moonphase = phase_of_the_moon() >>> 0;
  if (G.flags.moonphase === FULL_MOON) {
    await You(S("are lucky!  Full moon tonight."));
    change_luck(1);
  } else if (G.flags.moonphase === NEW_MOON) {
    await pline(S("Be careful!  New moon tonight."));
  }
  G.flags.friday13 = friday_13th();
  if (G.flags.friday13) {
    await pline(S("Watch out!  Bad things can happen on Friday the 13th."));
    change_luck(-1);
  }
  if (!resuming) {
    G.context.rndencode = rnd(9000);
    await set_wear(null);
    await pickup(1);
  }
  G.context.botlx = TRUE;
  update_inventory();
  if (resuming) {
    await read_engr_at(G.u.ux, G.u.uy);
  }
  await encumber_msg();
  if (G.defer_see_monsters) {
    G.defer_see_monsters = FALSE;
    await see_monsters();
  }
  initrack();
  G.u.uz0.dlevel = G.u.uz.dlevel;
  G.youmonst.movement = NORMAL_SPEED;
  G.context.move = 0;
  G.program_state.in_moveloop = 1;
  for (; ; ) {
    if (G.program_state.done_hup) {
      await end_of_input();
    }
    G.windowprocs.win_get_nh_event();
    if (G.context.move) {
      G.youmonst.movement = G.youmonst.movement - NORMAL_SPEED << 16 >> 16;
      do {
        wtcap = await encumber_msg();
        G.context.mon_moving = TRUE;
        do {
          monscanmove = await movemon() << 24 >> 24;
          if (G.youmonst.movement >= NORMAL_SPEED) {
            break;
          }
        } while (monscanmove);
        G.context.mon_moving = FALSE;
        if (!monscanmove && G.youmonst.movement < NORMAL_SPEED) {
          let mtmp = null;
          await mcalcdistress();
          for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
            mtmp.movement = mtmp.movement + mcalcmove(mtmp) << 16 >> 16;
          }
          if (!rn2(G.u.uevent.udemigod | 0 ? 25 : depth(G.u.uz) > depth(G.dungeon_topology.d_stronghold_level) ? 50 : 70)) {
            await makemon(null, 0, 0, NO_MM_FLAGS);
          }
          if (G.u.usteed && G.u.umoved) {
            moveamt = mcalcmove(G.u.usteed);
          } else {
            moveamt = G.youmonst.data.mmove;
            if (G.u.uprops[FAST].intrinsic & ~(67108864 | 33554432 | 16777216) || G.u.uprops[FAST].extrinsic) {
              if (rn2(3) !== 0) {
                moveamt += NORMAL_SPEED;
              }
            } else if (G.u.uprops[FAST].intrinsic || G.u.uprops[FAST].extrinsic) {
              if (rn2(3) === 0) {
                moveamt += NORMAL_SPEED;
              }
            }
          }
          switch (wtcap) {
          case UNENCUMBERED:
            break;
          case SLT_ENCUMBER:
            moveamt -= moveamt / 4 | 0;
            break;
          case MOD_ENCUMBER:
            moveamt -= moveamt / 2 | 0;
            break;
          case HVY_ENCUMBER:
            moveamt -= moveamt * 3 / 4 | 0;
            break;
          case EXT_ENCUMBER:
            moveamt -= moveamt * 7 / 8 | 0;
            break;
          default:
            break;
          }
          G.youmonst.movement = G.youmonst.movement + moveamt << 16 >> 16;
          if (G.youmonst.movement < 0) {
            G.youmonst.movement = 0;
          }
          settrack();
          ++G.monstermoves;
          ++G.moves;
          if (G.u.uprops[GLIB].intrinsic) {
            await glibr();
          }
          await nh_timeout();
          await run_regions();
          if (G.u.ublesscnt) {
            --G.u.ublesscnt;
          }
          if (G.flags.time && !G.context.run) {
            G.iflags.time_botl = TRUE;
          }
          if (G.u.uinvulnerable) {
            wtcap = UNENCUMBERED;
          } else if (!(G.u.umonnum !== G.u.umonster) ? G.u.uhp < G.u.uhpmax ? 1 : 0 : G.u.mh < G.u.mhmax || G.youmonst.data.mlet === S_EEL ? 1 : 0) {
            await regen_hp(wtcap);
          }
          if (wtcap > MOD_ENCUMBER && G.u.umoved) {
            if (!(wtcap < EXT_ENCUMBER ? G.moves % 30 : G.moves % 10)) {
              if (G.u.umonnum !== G.u.umonster && G.u.mh > 1) {
                --G.u.mh;
                G.context.botl = TRUE;
              } else if (!(G.u.umonnum !== G.u.umonster) && G.u.uhp > 1) {
                --G.u.uhp;
                G.context.botl = TRUE;
              } else {
                await You(S("pass out from exertion!"));
                await exercise(A_CON, FALSE);
                await fall_asleep(-10, FALSE);
              }
            }
          }
          if (G.u.uen < G.u.uenmax && (wtcap < MOD_ENCUMBER && !(G.moves % (Math.imul(MAXULEV + 8 - G.u.ulevel, G.urole.malenum === 342 ? 3 : 4) / 6 | 0)) || (G.u.uprops[ENERGY_REGENERATION].intrinsic || G.u.uprops[ENERGY_REGENERATION].extrinsic))) {
            G.u.uen += rn2(((acurr(A_WIS) + acurr(A_INT)) / 15 | 0) + 1) + 1;
            if (G.u.uen > G.u.uenmax) {
              G.u.uen = G.u.uenmax;
            }
            G.context.botl = TRUE;
            if (G.u.uen === G.u.uenmax) {
              await interrupt_multi(S("You feel full of energy."));
            }
          }
          if (!G.u.uinvulnerable) {
            if ((G.u.uprops[TELEPORT].intrinsic || G.u.uprops[TELEPORT].extrinsic) && !rn2(85)) {
              let old_ux = G.u.ux;
              let old_uy = G.u.uy;
              await tele();
              if (G.u.ux !== old_ux || G.u.uy !== old_uy) {
                if (!await next_to_u()) {
                  await check_leash(old_ux, old_uy);
                }
                pushch(0);
                savech(0);
              }
            }
            if (change === 1 && !(G.u.uprops[POLYMORPH].intrinsic || G.u.uprops[POLYMORPH].extrinsic) || change === 2 && G.u.ulycn === NON_PM) {
              change = 0;
            }
            if ((G.u.uprops[POLYMORPH].intrinsic || G.u.uprops[POLYMORPH].extrinsic) && !rn2(100)) {
              change = 1;
            } else if (G.u.ulycn >= LOW_PM && !(G.u.umonnum !== G.u.umonster) && !rn2(80 - 20 * night())) {
              change = 2;
            }
            if (change && !(G.u.uprops[UNCHANGING].intrinsic || G.u.uprops[UNCHANGING].extrinsic)) {
              if (G.multi >= 0) {
                await stop_occupation();
                if (change === 1) {
                  await polyself(0);
                } else {
                  await you_were();
                }
                change = 0;
              }
            }
          }
          if ((G.u.uprops[SEARCHING].intrinsic || G.u.uprops[SEARCHING].extrinsic) && G.multi >= 0) {
            await dosearch0(1);
          }
          if (G.u.uprops[WARNING].intrinsic || G.u.uprops[WARNING].extrinsic) {
            await warnreveal();
          }
          await mkot_trap_warn();
          await dosounds();
          await do_storms();
          await gethungry();
          age_spells();
          await exerchk();
          await invault();
          if (G.u.uhave.amulet) {
            await amulet();
          }
          if (!rn2(40 + acurr(A_DEX) * 3)) {
            await u_wipe_engr(rnd(3));
          }
          if (G.u.uevent.udemigod | 0 && !G.u.uinvulnerable) {
            if (G.u.udg_cnt) {
              G.u.udg_cnt = G.u.udg_cnt - 1 >>> 0;
            }
            if (!G.u.udg_cnt) {
              await intervene();
              G.u.udg_cnt = rn2(200) + 50 >>> 0;
            }
          }
          await restore_attrib();
          if ((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level) || (G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level)) {
            await movebubbles();
          } else if ((G.dungeon_topology.d_fire_level.dlevel || G.dungeon_topology.d_fire_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_fire_level)) {
            await fumaroles();
          } else if (G.u.uinwater) {
            await under_water(0);
          } else if (G.u.uburied) {
            await under_ground(0);
          }
          if (G.multi < 0) {
            if (++G.multi === 0) {
              await unmul(null);
              if (G.u.utotype) {
                await deferred_goto();
              }
            }
          }
        }
      } while (G.youmonst.movement < NORMAL_SPEED);
      if (G.iflags.hilite_delta) {
        status_eval_next_unhilite();
      }
      if (G.context.bypasses) {
        clear_bypasses();
      }
      if ((G.u.uhave.amulet | 0 || (G.u.uprops[CLAIRVOYANT].intrinsic || G.u.uprops[CLAIRVOYANT].extrinsic) && !G.u.uprops[CLAIRVOYANT].blocked) && !(G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum) && !G.u.uprops[CLAIRVOYANT].blocked && !(G.moves % 15) && !rn2(2)) {
        await do_vicinity_map(null);
      }
      if (G.u.utrap && G.u.utraptype === TT_LAVA) {
        await sink_into_lava();
      } else if (!G.u.umoved) {
        await pooleffects(FALSE);
      }
    }
    clear_splitobjs();
    find_ac();
    if (!G.context.mv || (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
      if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
        await see_monsters();
        await see_objects();
        await see_traps();
        if (G.u.uswallow) {
          await swallowed(0);
        }
      } else if (G.u.uprops[TELEPAT].extrinsic) {
        await see_monsters();
      } else if (G.u.uprops[WARNING].intrinsic || G.u.uprops[WARNING].extrinsic || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic)) {
        await see_monsters();
      }
      if (G.vision_full_recalc) {
        await vision_recalc(0);
      }
    }
    if (G.context.botl || G.context.botlx) {
      await bot();
      await curs_on_u();
    } else if (G.iflags.time_botl) {
      await timebot();
      await curs_on_u();
    }
    G.context.move = 1;
    if (G.multi >= 0 && G.occupation) {
      if (await G.occupation() === 0) {
        G.occupation = null;
      }
      if (monster_nearby()) {
        await stop_occupation();
        await reset_eat();
      }
      continue;
    }
    if (G.iflags.sanity_check || G.iflags.debug_fuzzer) {
      await sanity_check();
    }
    await G.windowprocs.win_cliparound(G.u.ux, G.u.uy);
    G.u.umoved = FALSE;
    if (G.multi > 0) {
      await lookaround();
      if (!G.multi) {
        G.context.move = 0;
        if (G.flags.time) {
          G.context.botl = TRUE;
        }
        continue;
      }
      if (G.context.mv) {
        if (G.multi < COLNO && !--G.multi) {
          G.context.travel = G.context.travel1 = G.context.mv = (G.context.run = 0) << 24 >> 24;
        }
        await domove();
      } else {
        --G.multi;
        await rhack(G.save_cm);
      }
    } else if (G.multi === 0) {
      await ckmailstatus();
      await rhack(null);
    }
    if (G.u.utotype) {
      await deferred_goto();
    } else if (G.flags.time && (!G.context.move || !G.context.mv)) {
      G.context.botl = TRUE;
    }
    if (G.vision_full_recalc) {
      await vision_recalc(0);
    }
    if ((!G.context.run || G.flags.runmode === RUN_TPORT) && (G.multi && (!G.context.travel ? !(G.multi % 7) ? 1 : 0 : !(G.moves % 7) ? 1 : 0))) {
      if (G.flags.time && G.context.run) {
        G.context.botl = TRUE;
      }
      await G.windowprocs.win_display_nhwindow(G.WIN_MAP, FALSE);
    }
  }
}

async function regen_hp(wtcap: number): Promise<void> {
  let heal = 0;
  let reached_full = FALSE;
  let encumbrance_ok = (wtcap < MOD_ENCUMBER || !G.u.umoved ? 1 : 0) << 24 >> 24;
  if (G.u.umonnum !== G.u.umonster) {
    if (G.u.mh < 1) {
      await rehumanize();
    } else if (G.youmonst.data.mlet === S_EEL && !is_pool(G.u.ux, G.u.uy) && !((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level))) {
      if (G.u.mh > 1 && !(G.u.uprops[REGENERATION].intrinsic || G.u.uprops[REGENERATION].extrinsic) && rn2(G.u.mh) > rn2(8) && (!(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic) || !(G.moves % 2))) {
        heal = -1;
      }
    } else if (G.u.mh < G.u.mhmax) {
      if (G.u.uprops[REGENERATION].intrinsic || G.u.uprops[REGENERATION].extrinsic || encumbrance_ok && !(G.moves % 20)) {
        heal = 1;
      }
    }
    if (heal) {
      G.context.botl = TRUE;
      G.u.mh += heal;
      reached_full = (G.u.mh === G.u.mhmax ? 1 : 0) << 24 >> 24;
    }
  } else {
    if (G.u.uhp < G.u.uhpmax && (encumbrance_ok || (G.u.uprops[REGENERATION].intrinsic || G.u.uprops[REGENERATION].extrinsic))) {
      if (G.u.ulevel > 9) {
        if (!(G.moves % 3)) {
          let Con = acurr(A_CON);
          if (Con <= 12) {
            heal = 1;
          } else {
            heal = rnd(Con);
            if (heal > G.u.ulevel - 9) {
              heal = G.u.ulevel - 9;
            }
          }
        }
      } else {
        if (!(G.moves % (((MAXULEV + 12) / (G.u.ulevel + 2) | 0) + 1))) {
          heal = 1;
        }
      }
      if ((G.u.uprops[REGENERATION].intrinsic || G.u.uprops[REGENERATION].extrinsic) && !heal) {
        heal = 1;
      }
      if (heal) {
        G.context.botl = TRUE;
        G.u.uhp += heal;
        if (G.u.uhp > G.u.uhpmax) {
          G.u.uhp = G.u.uhpmax;
        }
        reached_full = (G.u.uhp === G.u.uhpmax ? 1 : 0) << 24 >> 24;
      }
    }
  }
  if (reached_full) {
    await interrupt_multi(S("You are in full health."));
  }
}

export async function stop_occupation(): Promise<void> {
  if (G.occupation) {
    if (!await maybe_finished_meal(TRUE)) {
      await You(S("stop %s."), G.occtxt);
    }
    G.occupation = null;
    G.context.botl = TRUE;
    nomul(0);
    pushch(0);
  } else if (G.multi >= 0) {
    nomul(0);
  }
}

export async function display_gamewindows(): Promise<void> {
  G.WIN_MESSAGE = await G.windowprocs.win_create_nhwindow(NHW_MESSAGE);
  if ((G.windowprocs.wincap2 & (8 | 128)) >>> 0 !== 0) {
    await status_initialize(0);
  } else {
    G.WIN_STATUS = await G.windowprocs.win_create_nhwindow(NHW_STATUS);
  }
  G.WIN_MAP = await G.windowprocs.win_create_nhwindow(NHW_MAP);
  G.WIN_INVEN = await G.windowprocs.win_create_nhwindow(NHW_MENU);
  await G.windowprocs.win_start_menu(G.WIN_INVEN), await G.windowprocs.win_end_menu(G.WIN_INVEN, null);
  await G.windowprocs.win_display_nhwindow(G.WIN_MESSAGE, FALSE);
  clear_glyph_buffer();
  await G.windowprocs.win_display_nhwindow(G.WIN_MAP, FALSE);
}

export async function newgame(): Promise<void> {
  let i = 0;
  G.context.botlx = TRUE;
  G.context.ident = 1;
  G.context.stethoscope_move = -1;
  G.context.warnlevel = 1;
  G.context.next_attrib_check = 600;
  G.context.tribute.enabled = TRUE;
  G.context.tribute.tributesz = 16;
  for (i = LOW_PM; i < NUMMONS; ++i) {
    G.mvitals[i].mvflags = (G.mons[i].geno & G_NOCORPSE) & 0xff;
  }
  await init_objects();
  G.flags.pantheon = -1;
  await role_init();
  await init_dungeons();
  init_artifacts();
  await u_init();
  signal(SIGINT, done1);
  if (G.iflags.news) {
    await G.windowprocs.win_display_file(S("news"), FALSE);
  }
  await load_qtlist();
  await mklev();
  await u_on_upstairs();
  if (G.flags.debug) {
    await obj_delivery(FALSE);
  }
  vision_reset();
  await check_special_room(FALSE);
  if (!!G.level.monsters[G.u.ux][G.u.uy]) {
    await mnexto(!!G.level.monsters[G.u.ux][G.u.uy] ? G.level.monsters[G.u.ux][G.u.uy] : null);
  }
  await makedog();
  await docrt();
  if (G.flags.legacy) {
    await flush_screen(1);
    await com_pager(1);
  }
  G.urealtime.realtime = 0;
  G.urealtime.start_timing = getnow();
  await save_currentstate();
  ++G.program_state.something_worth_saving;
  await welcome(TRUE);
  return;
}

export async function welcome(new_game: number): Promise<void> {
  let buf = new Int8Array(256);
  let currentgend = (G.u.umonnum !== G.u.umonster ? G.u.mfemale | 0 : G.flags.female) << 24 >> 24;
  if (!new_game && G.u.umonnum !== G.u.umonster && ugenocided()) {
    await pline(S("You're back, but you still feel %s inside."), udeadinside());
    return;
  }
  $wr(P(buf), 0, 0);
  if (new_game || G.u.ualignbase[A_ORIGINAL] !== G.u.ualignbase[A_CURRENT]) {
    sprintf(eos(P(buf)), S(" %s"), align_str(G.u.ualignbase[A_ORIGINAL]));
  }
  if (!G.urole.name.f && (new_game ? (G.urole.allow & ROLE_GENDMASK) === (ROLE_MALE | ROLE_FEMALE) ? 1 : 0 : currentgend !== G.flags.initgend ? 1 : 0)) {
    sprintf(eos(P(buf)), S(" %s"), G.genders[currentgend].adj);
  }
  await pline(new_game ? S("%s %s, welcome to NetHack!  You are a%s %s %s.") : S("%s %s, the%s %s %s, welcome back to NetHack!"), Hello(null), P(G.plname), P(buf), G.urace.adj, currentgend && G.urole.name.f ? G.urole.name.f : G.urole.name.m);
}

async function interrupt_multi(msg: Ptr | null): Promise<void> {
  if (G.multi > 0 && !G.context.travel && !G.context.run) {
    nomul(0);
    if (G.flags.verbose && msg) {
      await Norep(S("%s"), msg);
    }
  }
}

export function argcheck(argc: number, argv: Ptr | null, e_arg: number): number {
  let i = 0;
  let idx = 0;
  let match = FALSE;
  let userea = null;
  let dashdash = S("");
  for (idx = 0; idx < (Math.trunc(72 / 24) | 0); ++idx) {
    if (earlyopts[idx].e >>> 0 === e_arg >>> 0) {
      break;
    }
  }
  if (idx >= (Math.trunc(72 / 24) | 0) || argc <= 1) {
    return FALSE;
  }
  for (i = 0; i < argc; ++i) {
    if ($rd(argv.a[argv.o + i]) !== 45) {
      continue;
    }
    if ($rd(argv.a[argv.o + i], 1) === 45) {
      userea = argv.a[argv.o + i].add(2);
      dashdash = S("-");
    } else {
      userea = argv.a[argv.o + i].add(1);
    }
    match = match_optname(userea, earlyopts[idx].name, earlyopts[idx].minlength, earlyopts[idx].valallowed);
    if (match) {
      break;
    }
  }
  if (match) {
    let extended_opt = strchr(userea, 58);
    if (!extended_opt) {
      extended_opt = strchr(userea, 61);
    }
    switch (e_arg >>> 0) {
    case ARG_DEBUG:
      if (extended_opt) {
        extended_opt = extended_opt.add(1);
        debug_fields(extended_opt);
      }
      return 1;
    case ARG_VERSION:
      {
        let insert_into_pastebuf = FALSE;
        if (extended_opt) {
          extended_opt = extended_opt.add(1);
          if (match_optname(extended_opt, S("paste"), 5, FALSE)) {
            insert_into_pastebuf = TRUE;
          } else {
            raw_printf(S("-%sversion can only be extended with -%sversion:paste.\n"), dashdash, dashdash);
            return TRUE;
          }
        }
        early_version_info(insert_into_pastebuf);
        return 2;
      }
    case ARG_SHOWPATHS:
      {
        return 2;
      }
    default:
      break;
    }
  }
  ;
  return FALSE;
}

function debug_fields(opts: Ptr | null): void {
  let $t1: any;
  let op = null;
  let negated = FALSE;
  while (!!(op = strchr(opts, 44))) {
    $wr(($t1 = op, op = $t1.add(1), $t1), 0, 0);
    debug_fields(op);
  }
  if (strlen(opts) > $u64(BUFSZ / 2 | 0)) {
    return;
  }
  while (isspace(opts.a[opts.o] & 0xff)) {
    opts = opts.add(1);
  }
  op = eos(opts);
  while ((op = op.add(-1)).o >= opts.o && isspace(op.a[op.o] & 0xff)) {
    op.a[op.o] = 0;
  }
  if (!opts.a[opts.o]) {
    return;
  }
  while (opts.a[opts.o] === 33 || !strncmpi(opts, S("no"), 2)) {
    if (opts.a[opts.o] === 33) {
      opts = opts.add(1);
    } else {
      opts = opts.add(2);
    }
    negated = (!negated ? 1 : 0) << 24 >> 24;
  }
  if (match_optname(opts, S("test"), 4, FALSE)) {
    G.iflags.debug.test = (negated ? FALSE : TRUE) << 24 >> 24;
  }
  if (match_optname(opts, S("ttystatus"), 9, FALSE)) {
    G.iflags.debug.ttystatus = (negated ? FALSE : TRUE) << 24 >> 24;
  }
  return;
}

export function $init(): void {
  earlyopts = $sarrOf([struct_early_opt.$of(ARG_DEBUG, S("debug"), 5, 1), struct_early_opt.$of(ARG_VERSION, S("version"), 4, 1), struct_early_opt.$of(ARG_SHOWPATHS, S("showpaths"), 9)]);
}
