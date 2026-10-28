// @ts-nocheck
// NetHack 3.6.7 restore.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { welcome } from './allmain.ts';
import { restore_artifacts } from './artifact.ts';
import { max_rank_sz } from './botl.ts';
import { docrt } from './display.ts';
import { new_mname, new_oname } from './do_name.ts';
import { mon_catchup_elapsed_time, newedog } from './dog.ts';
import { assign_graphics } from './drawing.ts';
import { Is_branchlev, assign_level, ledger_no, on_level, restore_dungeon } from './dungeon.ts';
import { done, panic, restore_killers } from './end.ts';
import { rest_engravings } from './engrave.ts';
import { create_levelfile, debugcore, delete_savefile, nhclose } from './files.ts';
import { check_special_room, in_rooms, obj_to_any } from './hack.ts';
import { getnow, sgn, strncmpi, time_from_yyyymmddhhmmss } from './hacklib.ts';
import { useup } from './invent.ts';
import { relink_light_sources, restore_light_sources } from './light.ts';
import { newmextra, peace_minded, propagate, set_malign } from './makemon.ts';
import { newemin } from './minion.ts';
import { mazexy, restore_waterlevel } from './mkmaze.ts';
import { add_to_container, free_omid, mksobj, new_omailcmd, newoextra, newolong, newomid, newomonst, place_object, set_corpsenm, weight } from './mkobj.ts';
import { rest_rooms } from './mkroom.ts';
import { hide_monst, restore_cham } from './mon.ts';
import { monsndx } from './mondata.ts';
import { restnames } from './o_init.ts';
import { xname } from './objnam.ts';
import { fruitadd, reglyph_darkroom, set_playmode } from './options.ts';
import { You, impossible, pline } from './pline.ts';
import { set_uasmon } from './polyself.ts';
import { newepri, restpriest } from './priest.ts';
import { load_qtlist } from './questpgr.ts';
import { rest_regions } from './region.ts';
import { rnd } from './rnd.ts';
import { role_init } from './role.ts';
import { restore_oracles } from './rumors.ts';
import { bclose, bufon, def_bclose, savelev, savestateinlock } from './save.ts';
import { inhishop, repair_damage, restshk, set_residency, shop_keeper } from './shk.ts';
import { neweshk } from './shknam.ts';
import { place_monster } from './steed.ts';
import { relink_timers, restore_timers, run_timers, stop_timer } from './timeout.ts';
import { deltrap } from './trap.ts';
import { error } from './unixtty.ts';
import { newegd } from './vault.ts';
import { uptodate } from './version.ts';
import { vision_reset } from './vision.ts';
import { setuwep } from './wield.ts';
import { place_wsegs, rest_worm } from './worm.ts';
import { setworn } from './worn.ts';
import { struct_bucket, struct_cemetery, struct_context_info, struct_d_level, struct_damage, struct_flag, struct_fruit, struct_monst, struct_nhcoord, struct_obj, struct_restore_procs, struct_s_level, struct_savefile_info, struct_trap } from './structs.ts';
import { $at2, $sat, $u64, G, P, S, free, getuid, lseek, memcpy, read, sprintf, strcpy } from './rt/index.ts';
import { BUFSZ, COLNO, CORPSE, DEFUNCT_MONSTER, FALSE, FREE_SAVE, GRAPPLING_HOOK, LOW_PM, MAGIC_PORTAL, MAXSPELL, N_PER_BUCKET, OBJ_FREE, PICK_AXE, PM_HOUSECAT, RANGE_GLOBAL, RANGE_LEVEL, ROGUESET, ROT_CORPSE, ROWNO, SFI1_EXTERNALCOMP, SFI1_RLECOMP, SFI1_ZEROCOMP, SHOPBASE, SLIME_MOLD, STAIRS, S_UNICORN, TRICKED, TRUE, WRITE_SAVE, W_BALL, W_CHAIN, W_WEP } from './consts.ts';

let restoreprocs: struct_restore_procs;
let n_ids_mapped: number;
let id_map: struct_bucket | null;
let oldfruit: struct_fruit | null;
let omoves: any;

async function find_lev_obj(): Promise<void> {
  let fobjtmp = null;
  let otmp = null;
  let x = 0;
  let y = 0;
  for (x = 0; x < COLNO; ++x) {
    for (y = 0; y < ROWNO; ++y) {
      G.level.objects[x][y] = null;
    }
  }
  while (!!(otmp = G.level.objlist)) {
    G.level.objlist = otmp.nobj;
    otmp.nobj = fobjtmp;
    otmp.where = OBJ_FREE;
    fobjtmp = otmp;
  }
  while (!!(otmp = fobjtmp)) {
    fobjtmp = otmp.nobj;
    await place_object(otmp, otmp.ox, otmp.oy);
  }
}

export async function inven_inuse(quietly: number): Promise<void> {
  let otmp = null;
  let otmp2 = null;
  for (otmp = G.invent; otmp; otmp = otmp2) {
    otmp2 = otmp.nobj;
    if (otmp.in_use) {
      if (!quietly) {
        await pline(S("Finishing off %s..."), await xname(otmp));
      }
      await useup(otmp);
    }
  }
}

async function restlevchn(fd: number): Promise<void> {
  const cnt = new Int32Array(1);
  let tmplev = null;
  let x = null;
  G.sp_levchn = null;
  await mread(fd, P(cnt, 0), 4);
  for (; cnt[0] > 0; --cnt[0]) {
    tmplev = new struct_s_level();
    await mread(fd, tmplev, 32);
    if (!G.sp_levchn) {
      G.sp_levchn = tmplev;
    } else {
      for (x = G.sp_levchn; x.next; x = x.next) {
        ;
      }
      x.next = tmplev;
    }
    tmplev.next = null;
  }
}

async function restdamage(fd: number, ghostly: number): Promise<void> {
  const counter = new Int32Array(1);
  let tmp_dam = null;
  await mread(fd, P(counter, 0), 4);
  if (!counter[0]) {
    return;
  }
  tmp_dam = new struct_damage();
  while (--counter[0] >= 0) {
    let damaged_shops = new Int8Array(5);
    let shp = null;
    await mread(fd, tmp_dam, 32);
    if (ghostly) {
      tmp_dam.when += G.monstermoves - omoves[0];
    }
    strcpy(P(damaged_shops), in_rooms(tmp_dam.place.x, tmp_dam.place.y, SHOPBASE));
    if (G.u.uz.dlevel) {
      for (shp = P(damaged_shops); shp.a[shp.o]; shp = shp.add(1)) {
        let shkp = await shop_keeper(shp.a[shp.o]);
        if (shkp && inhishop(shkp) && await repair_damage(shkp, tmp_dam, null, TRUE)) {
          break;
        }
      }
    }
    if (!shp || !shp.a[shp.o]) {
      tmp_dam.next = G.level.damagelist;
      G.level.damagelist = tmp_dam;
      tmp_dam = new struct_damage();
    }
  }
  free(tmp_dam);
}

async function restobj(fd: number, otmp: struct_obj | null): Promise<void> {
  const buflen = new Int32Array(1);
  await mread(fd, otmp, 96);
  otmp.nobj = otmp.v.v_nexthere = null;
  if (otmp.oextra) {
    otmp.oextra = await newoextra();
    await mread(fd, P(buflen, 0), 4);
    if (buflen[0] > 0) {
      await new_oname(otmp, buflen[0]);
      await mread(fd, otmp.oextra.oname, buflen[0] >>> 0);
    }
    await mread(fd, P(buflen, 0), 4);
    if (buflen[0] > 0) {
      await newomonst(otmp);
      await restmon(fd, otmp.oextra.omonst);
    }
    await mread(fd, P(buflen, 0), 4);
    if (buflen[0] > 0) {
      await newomid(otmp);
      await mread(fd, otmp.oextra.omid, buflen[0] >>> 0);
    }
    await mread(fd, P(buflen, 0), 4);
    if (buflen[0] > 0) {
      await newolong(otmp);
      await mread(fd, otmp.oextra.olong, buflen[0] >>> 0);
    }
    await mread(fd, P(buflen, 0), 4);
    if (buflen[0] > 0) {
      let omailcmd = P(new Int8Array((buflen[0] >>> 0)));
      await mread(fd, omailcmd, buflen[0] >>> 0);
      await new_omailcmd(otmp, omailcmd);
      free(omailcmd);
    }
  }
}

async function restobjchn(fd: number, ghostly: number, frozen: number): Promise<struct_obj | null> {
  let $t1: any;
  let otmp = null;
  let otmp2 = null;
  let first = null;
  const buflen = new Int32Array(1);
  while (1) {
    await mread(fd, P(buflen, 0), 4);
    if (buflen[0] === -1) {
      break;
    }
    otmp = new struct_obj();
    await restobj(fd, otmp);
    if (!first) {
      first = otmp;
    } else {
      otmp2.nobj = otmp;
    }
    if (ghostly) {
      let nid = ($t1 = G.context.ident, G.context.ident = $t1 + 1 >>> 0, $t1);
      await add_id_mapping(otmp.o_id, nid);
      otmp.o_id = nid;
    }
    if (ghostly && otmp.otyp === SLIME_MOLD) {
      await ghostfruit(otmp);
    }
    if (ghostly && !frozen && !(otmp.otyp === 201 || otmp.otyp === 202 || otmp.otyp === 237 || otmp.otyp === 199 || otmp.otyp === 200 || otmp.otyp === 296)) {
      otmp.age = G.monstermoves - omoves[0] + otmp.age;
    }
    if (!!otmp.cobj) {
      let otmp3 = null;
      otmp.cobj = await restobjchn(fd, ghostly, otmp.otyp === 191 ? 1 : 0);
      for (otmp3 = otmp.cobj; otmp3; otmp3 = otmp3.nobj) {
        otmp3.v.v_ocontainer = otmp;
      }
    } else if (otmp.otyp === 189 && otmp.spe === 1) {
      let catcorpse = null;
      if (!!(catcorpse = await mksobj(CORPSE, TRUE, FALSE))) {
        otmp.spe = 1;
        await set_corpsenm(catcorpse, PM_HOUSECAT);
        await stop_timer(ROT_CORPSE, obj_to_any(catcorpse));
        await add_to_container(otmp, catcorpse);
        otmp.owt = await weight(otmp) >>> 0;
      }
    }
    if (otmp.bypass) {
      otmp.bypass = 0;
    }
    if (!ghostly) {
      if (otmp.o_id === G.context.victual.o_id) {
        G.context.victual.piece = otmp;
      }
      if (otmp.o_id === G.context.tin.o_id) {
        G.context.tin.tin = otmp;
      }
      if (otmp.o_id === G.context.spbook.o_id) {
        G.context.spbook.book = otmp;
      }
    }
    otmp2 = otmp;
  }
  if (first && otmp2.nobj) {
    await impossible(S("Restobjchn: error reading objchn."));
    otmp2.nobj = null;
  }
  return first;
}

async function restmon(fd: number, mtmp: struct_monst | null): Promise<void> {
  const buflen = new Int32Array(1);
  await mread(fd, mtmp, 144);
  mtmp.nmon = null;
  if (mtmp.mextra) {
    mtmp.mextra = await newmextra();
    await mread(fd, P(buflen, 0), 4);
    if (buflen[0] > 0) {
      await new_mname(mtmp, buflen[0]);
      await mread(fd, mtmp.mextra.mname, buflen[0] >>> 0);
    }
    await mread(fd, P(buflen, 0), 4);
    if (buflen[0] > 0) {
      await newegd(mtmp);
      await mread(fd, mtmp.mextra.egd, 324);
    }
    await mread(fd, P(buflen, 0), 4);
    if (buflen[0] > 0) {
      await newepri(mtmp);
      await mread(fd, mtmp.mextra.epri, 40);
    }
    await mread(fd, P(buflen, 0), 4);
    if (buflen[0] > 0) {
      await neweshk(mtmp);
      await mread(fd, mtmp.mextra.eshk, 4936);
    }
    await mread(fd, P(buflen, 0), 4);
    if (buflen[0] > 0) {
      await newemin(mtmp);
      await mread(fd, mtmp.mextra.emin, 2);
    }
    await mread(fd, P(buflen, 0), 4);
    if (buflen[0] > 0) {
      await newedog(mtmp);
      await mread(fd, mtmp.mextra.edog, 56);
    }
    await mread(fd, P(mtmp.mextra, "mcorpsenm"), 4);
  }
}

async function restmonchn(fd: number, ghostly: number): Promise<struct_monst | null> {
  let $t1: any;
  let mtmp = null;
  let mtmp2 = null;
  let first = null;
  let offset = 0;
  const buflen = new Int32Array(1);
  while (1) {
    await mread(fd, P(buflen, 0), 4);
    if (buflen[0] === -1) {
      break;
    }
    mtmp = new struct_monst();
    await restmon(fd, mtmp);
    if (!first) {
      first = mtmp;
    } else {
      mtmp2.nmon = mtmp;
    }
    if (ghostly) {
      let nid = ($t1 = G.context.ident, G.context.ident = $t1 + 1 >>> 0, $t1);
      await add_id_mapping(mtmp.m_id, nid);
      mtmp.m_id = nid;
    }
    offset = mtmp.mnum;
    mtmp.data = $sat(G.mons, offset);
    if (ghostly) {
      let mndx = await monsndx(mtmp.data);
      if (await propagate(mndx, TRUE, ghostly) === 0) {
        mtmp.mhpmax = DEFUNCT_MONSTER;
      }
    }
    if (mtmp.minvent) {
      let obj = null;
      mtmp.minvent = await restobjchn(fd, ghostly, FALSE);
      for (obj = mtmp.minvent; obj; obj = obj.nobj) {
        obj.v.v_ocarry = mtmp;
      }
    }
    if (mtmp.mw) {
      let obj = null;
      for (obj = mtmp.minvent; obj; obj = obj.nobj) {
        if (obj.owornmask & W_WEP) {
          break;
        }
      }
      if (obj) {
        mtmp.mw = obj;
      } else {
        mtmp.mw = null;
        await impossible(S("bad monster weapon restore"));
      }
    }
    if (mtmp.isshk) {
      restshk(mtmp, ghostly);
    }
    if (mtmp.ispriest) {
      restpriest(mtmp, ghostly);
    }
    if (!ghostly) {
      if (mtmp.m_id === G.context.polearm.m_id) {
        G.context.polearm.hitmon = mtmp;
      }
    }
    mtmp2 = mtmp;
  }
  if (first && mtmp2.nmon) {
    await impossible(S("Restmonchn: error reading monchn."));
    mtmp2.nmon = null;
  }
  return first;
}

async function loadfruitchn(fd: number): Promise<struct_fruit | null> {
  let flist = null;
  let fnext = null;
  flist = null;
  while ((fnext = new struct_fruit(), await mread(fd, fnext, 48), fnext.fid !== 0 ? 1 : 0)) {
    fnext.nextf = flist;
    flist = fnext;
  }
  free(fnext);
  return flist;
}

function freefruitchn(flist: struct_fruit | null): void {
  let fnext = null;
  while (flist) {
    fnext = flist.nextf;
    free(flist);
    flist = fnext;
  }
}

async function ghostfruit(otmp: struct_obj | null): Promise<void> {
  let oldf = null;
  for (oldf = oldfruit; oldf; oldf = oldf.nextf) {
    if (oldf.fid === otmp.spe) {
      break;
    }
  }
  if (!oldf) {
    await impossible(S("no old fruit?"));
  } else {
    otmp.spe = await fruitadd(P(oldf.fname), null) << 24 >> 24;
  }
}

async function restgamestate(fd: number, stuckid: Ptr | null, steedid: Ptr | null): Promise<number> {
  let newgameflags = new struct_flag();
  let newgamecontext = new struct_context_info();
  let otmp = null;
  let bc_obj = null;
  let timebuf = new Int8Array(15);
  const uid = new Float64Array(1);
  let defer_perm_invent = 0;
  await mread(fd, P(uid, 0), 8);
  if (G.sysopt.check_save_uid && uid[0] !== getuid()) {
    await pline(S("Saved game was not yours."));
    if (!G.flags.debug) {
      return FALSE;
    }
  }
  newgamecontext.$cp(G.context);
  await mread(fd, G.context, 328);
  G.context.warntype.species = G.context.warntype.speciesidx >= LOW_PM ? $sat(G.mons, G.context.warntype.speciesidx) : null;
  newgameflags.$cp(G.flags);
  await mread(fd, G.flags, 160);
  defer_perm_invent = G.iflags.perm_invent;
  G.iflags.perm_invent = FALSE;
  G.iflags.deferred_X = (newgameflags.explore && !G.flags.explore ? 1 : 0) << 24 >> 24;
  if (newgameflags.debug) {
    G.flags.debug = TRUE, G.flags.explore = G.iflags.deferred_X = FALSE;
  } else if (G.flags.debug) {
    set_playmode();
  }
  await role_init();
  await mread(fd, G.u, 2392);
  await mread(fd, P(timebuf), 14);
  timebuf[14] = 0;
  G.ubirthday = await time_from_yyyymmddhhmmss(P(timebuf));
  ;
  await mread(fd, P(G.urealtime, "realtime"), 8);
  await mread(fd, P(timebuf), 14);
  timebuf[14] = 0;
  G.urealtime.start_timing = await time_from_yyyymmddhhmmss(P(timebuf));
  ;
  G.urealtime.start_timing = getnow();
  await set_uasmon();
  await G.windowprocs.win_cliparound(G.u.ux, G.u.uy);
  if (G.u.uhp <= 0 && (!(G.u.umonnum !== G.u.umonster) || G.u.mh <= 0)) {
    G.u.ux = G.u.uy = 0;
    await You(S("were not healthy enough to survive restoration."));
    G.dungeon_topology.d_wiz1_level.dlevel = 0;
    G.u.uz.dnum = 0;
    G.u.uz.dlevel = 1;
    G.iflags.deferred_X = FALSE;
    G.iflags.perm_invent = defer_perm_invent;
    G.flags.$cp(newgameflags);
    G.context.$cp(newgamecontext);
    return FALSE;
  }
  assign_level(G.u.uz0, G.u.uz);
  await restore_killers(fd);
  await restore_timers(fd, RANGE_GLOBAL, FALSE, 0);
  await restore_light_sources(fd);
  G.invent = await restobjchn(fd, FALSE, FALSE);
  bc_obj = await restobjchn(fd, FALSE, FALSE);
  while (bc_obj) {
    let nobj = bc_obj.nobj;
    if (bc_obj.owornmask) {
      await setworn(bc_obj, bc_obj.owornmask);
    }
    bc_obj.nobj = null;
    bc_obj = nobj;
  }
  G.migrating_objs = await restobjchn(fd, FALSE, FALSE);
  G.migrating_mons = await restmonchn(fd, FALSE);
  await mread(fd, G.mvitals[0], 1146);
  G.defer_see_monsters = TRUE;
  for (otmp = G.invent; otmp; otmp = otmp.nobj) {
    if (otmp.owornmask) {
      await setworn(otmp, otmp.owornmask);
    }
  }
  otmp = G.uwep;
  G.uwep = null;
  await setuwep(otmp);
  if (!G.uwep || G.uwep.otyp === PICK_AXE || G.uwep.otyp === GRAPPLING_HOOK) {
    G.unweapon = TRUE;
  }
  await restore_dungeon(fd);
  await restlevchn(fd);
  await mread(fd, P(G, "moves"), 8);
  await mread(fd, P(G, "monstermoves"), 8);
  await mread(fd, G.quest_status, 8);
  await mread(fd, G.spl_book[0], (MAXSPELL + 1) * 8);
  await restore_artifacts(fd);
  await restore_oracles(fd);
  if (G.u.ustuck) {
    await mread(fd, stuckid, 4);
  }
  if (G.u.usteed) {
    await mread(fd, steedid, 4);
  }
  await mread(fd, P(G.pl_character), 32);
  await mread(fd, P(G.pl_fruit), 32);
  freefruitchn(G.ffruit);
  G.ffruit = await loadfruitchn(fd);
  await restnames(fd);
  await restore_waterlevel(fd);
  await restore_msghistory(fd);
  await relink_timers(FALSE);
  await relink_light_sources(FALSE);
  G.iflags.perm_invent = defer_perm_invent;
  return TRUE;
}

async function restlevelstate(stuckid: number, steedid: number): Promise<void> {
  let mtmp = null;
  if (stuckid) {
    for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
      if (mtmp.m_id === stuckid) {
        break;
      }
    }
    if (!mtmp) {
      await panic(S("Cannot find the monster ustuck."));
    }
    G.u.ustuck = mtmp;
  }
  if (steedid) {
    for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
      if (mtmp.m_id === steedid) {
        break;
      }
    }
    if (!mtmp) {
      await panic(S("Cannot find the monster usteed."));
    }
    G.u.usteed = mtmp;
    G.level.monsters[mtmp.mx][mtmp.my] = null;
  }
}

async function restlevelfile(fd: number, ltmp: number): Promise<number> {
  let nfd = 0;
  let whynot = new Int8Array(256);
  ;
  nfd = create_levelfile(ltmp, P(whynot));
  if (nfd < 0) {
    await panic(S("restlevelfile: %s"), P(whynot));
  }
  await bufon(nfd);
  await savelev(nfd, ltmp, WRITE_SAVE | FREE_SAVE);
  await bclose(nfd);
  return 2;
}

export async function dorecover(fd: number): Promise<number> {
  const stuckid = new Uint32Array(1);
  stuckid[0] = 0;
  const steedid = new Uint32Array(1);
  steedid[0] = 0;
  const ltmp = new Int8Array(1);
  let rtmp = 0;
  let otmp = null;
  G.restoring = TRUE;
  get_plname_from_file(fd, P(G.plname));
  await getlev(fd, 0, 0, FALSE);
  if (!await restgamestate(fd, P(stuckid, 0), P(steedid, 0))) {
    await G.windowprocs.win_display_nhwindow(G.WIN_MESSAGE, TRUE);
    await savelev(-1, 0, FREE_SAVE);
    nhclose(fd);
    delete_savefile();
    G.restoring = FALSE;
    return 0;
  }
  await restlevelstate(stuckid[0], steedid[0]);
  await savestateinlock();
  rtmp = await restlevelfile(fd, ledger_no(G.u.uz));
  if (rtmp < 2) {
    return rtmp;
  }
  G.u.ustuck = null;
  G.u.usteed = null;
  restoreprocs.mread_flags = 1;
  while (1) {
    await mread(fd, P(ltmp, 0), 1);
    if (restoreprocs.mread_flags === -1) {
      break;
    }
    await getlev(fd, 0, ltmp[0], FALSE);
    rtmp = await restlevelfile(fd, ltmp[0]);
    if (rtmp < 2) {
      return rtmp;
    }
  }
  restoreprocs.mread_flags = 0;
  lseek(fd, 0, 0);
  await validate(fd, null);
  get_plname_from_file(fd, P(G.plname));
  await getlev(fd, 0, 0, FALSE);
  nhclose(fd);
  reset_restpref();
  await restlevelstate(stuckid[0], steedid[0]);
  G.program_state.something_worth_saving = 1;
  if (!G.flags.debug && !G.flags.explore) {
    delete_savefile();
  }
  if ((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level)) {
    assign_graphics(ROGUESET);
  }
  max_rank_sz();
  for (otmp = G.level.objlist; otmp; otmp = otmp.nobj) {
    if (otmp.owornmask) {
      await setworn(otmp, otmp.owornmask);
    }
  }
  if (G.uball && !G.uchain || G.uchain && !G.uball) {
    await impossible(S("restgamestate: lost ball & chain"));
    await setworn(null, W_CHAIN);
    await setworn(null, W_BALL);
  }
  await inven_inuse(FALSE);
  await load_qtlist();
  reglyph_darkroom();
  vision_reset();
  G.vision_full_recalc = 1;
  await run_timers();
  await docrt();
  G.restoring = FALSE;
  await G.windowprocs.win_clear_nhwindow(G.WIN_MESSAGE);
  await welcome(FALSE);
  await check_special_room(FALSE);
  return 1;
}

export async function restcemetery(fd: number, cemeteryaddr: Ptr | null): Promise<void> {
  let bonesinfo = null;
  let bonesaddr = null;
  const flag = new Int32Array(1);
  await mread(fd, P(flag, 0), 4);
  if (flag[0] === 0) {
    bonesaddr = cemeteryaddr;
    do {
      bonesinfo = new struct_cemetery();
      await mread(fd, bonesinfo, 176);
      bonesaddr.a[bonesaddr.o] = bonesinfo;
      bonesaddr = P(bonesaddr.a[bonesaddr.o], "next");
    } while (bonesaddr.a[bonesaddr.o]);
  } else {
    cemeteryaddr.a[cemeteryaddr.o] = null;
  }
}

async function rest_levl(fd: number, rlecomp: number): Promise<void> {
  ;
  await mread(fd, P(G.level.locations), 13440);
}

export async function trickery(reason: Ptr | null): Promise<void> {
  await pline(S("Strange, this map is not as I remember it."));
  await pline(S("Somebody is trying some trickery here..."));
  await pline(S("This game is void."));
  strcpy(P(G.killer.name), reason ? reason : S(""));
  await done(TRICKED);
}

export async function getlev(fd: number, pid: number, lev: number, ghostly: number): Promise<void> {
  let trap = null;
  let mtmp = null;
  let elapsed = 0;
  let br = null;
  const hpid = new Int32Array(1);
  const dlvl = new Int8Array(1);
  let x = 0;
  let y = 0;
  if (ghostly) {
    clear_id_mapping();
  }
  if (ghostly) {
    oldfruit = await loadfruitchn(fd);
  }
  await mread(fd, P(hpid, 0), 4);
  await mread(fd, P(dlvl, 0), 1);
  if (pid && pid !== hpid[0] || lev && dlvl[0] !== lev) {
    let trickbuf = new Int8Array(256);
    if (pid && pid !== hpid[0]) {
      sprintf(P(trickbuf), S("PID (%d) doesn't match saved PID (%d)!"), hpid[0], pid);
    } else {
      sprintf(P(trickbuf), S("This is level %d, not %d!"), dlvl[0], lev);
    }
    if (G.flags.debug) {
      await pline(S("%s"), P(trickbuf));
    }
    await trickery(P(trickbuf));
  }
  await restcemetery(fd, P(G.level, "bonesinfo"));
  await rest_levl(fd, ((G.sfrestinfo.sfi1 & SFI1_RLECOMP) >>> 0 === SFI1_RLECOMP ? 1 : 0) << 24 >> 24);
  await mread(fd, P(G.lastseentyp), 1680);
  await mread(fd, P(omoves, 0), 8);
  elapsed = G.monstermoves - omoves[0];
  await mread(fd, G.upstair, 5);
  await mread(fd, G.dnstair, 5);
  await mread(fd, G.upladder, 5);
  await mread(fd, G.dnladder, 5);
  await mread(fd, G.sstairs, 5);
  await mread(fd, G.updest, 8);
  await mread(fd, G.dndest, 8);
  await mread(fd, G.level.flags, 8);
  await mread(fd, G.doors[0], 240);
  await rest_rooms(fd);
  if (G.nroom) {
    G.doorindex = G.rooms[G.nroom - 1].fdoor + G.rooms[G.nroom - 1].doorct;
  } else {
    G.doorindex = 0;
  }
  await restore_timers(fd, RANGE_LEVEL, ghostly, elapsed);
  await restore_light_sources(fd);
  G.level.monlist = await restmonchn(fd, ghostly);
  await rest_worm(fd);
  G.ftrap = null;
  while ((trap = new struct_trap(), await mread(fd, trap, 24), trap.tx !== 0 ? 1 : 0)) {
    trap.ntrap = G.ftrap;
    G.ftrap = trap;
  }
  free(trap);
  G.level.objlist = await restobjchn(fd, ghostly, FALSE);
  await find_lev_obj();
  G.level.buriedobjlist = await restobjchn(fd, ghostly, FALSE);
  G.billobjs = await restobjchn(fd, ghostly, FALSE);
  await rest_engravings(fd);
  for (x = 0; x < COLNO; ++x) {
    for (y = 0; y < ROWNO; ++y) {
      G.level.monsters[x][y] = null;
    }
  }
  for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
    if (mtmp.isshk) {
      set_residency(mtmp, FALSE);
    }
    await place_monster(mtmp, mtmp.mx, mtmp.my);
    if (mtmp.wormno) {
      await place_wsegs(mtmp, null);
    }
    if (!G.u.uz.dlevel) {
      continue;
    }
    if (ghostly) {
      if (!mtmp.isshk) {
        mtmp.mpeaceful = ((mtmp.data.mlet === S_UNICORN && (mtmp.data.mflags2 & 536870912) >>> 0 !== 0 && sgn(G.u.ualign.type) === sgn(mtmp.data.maligntyp) ? TRUE : peace_minded(mtmp.data)) >>> 0) & 1;
      }
      set_malign(mtmp);
    } else if (elapsed > 0) {
      await mon_catchup_elapsed_time(mtmp, elapsed);
    }
    await restore_cham(mtmp);
    if (ghostly || elapsed > 0 && elapsed > rnd(10)) {
      await hide_monst(mtmp);
    }
  }
  await restdamage(fd, ghostly);
  await rest_regions(fd, ghostly);
  if (ghostly) {
    freefruitchn(oldfruit), oldfruit = null;
    if (lev > ledger_no(G.dungeon_topology.d_medusa_level) && lev < ledger_no(G.dungeon_topology.d_stronghold_level) && G.dnstair.sx === 0) {
      let cc = new struct_nhcoord();
      await mazexy(cc);
      G.dnstair.sx = cc.x;
      G.dnstair.sy = cc.y;
      $at2(G.level.locations, cc.x, cc.y).typ = STAIRS;
    }
    br = Is_branchlev(G.u.uz);
    if (br && G.u.uz.dlevel === 1) {
      let ltmp = new struct_d_level();
      if (on_level(G.u.uz, br.end1)) {
        assign_level(ltmp, br.end2);
      } else {
        assign_level(ltmp, br.end1);
      }
      switch (br.type) {
      case 0:
      case 1:
      case 2:
        assign_level(G.sstairs.tolev, ltmp);
        break;
      case 3:
        for (trap = G.ftrap; trap; trap = trap.ntrap) {
          if ((trap.ttyp | 0) === MAGIC_PORTAL) {
            break;
          }
        }
        if (!trap) {
          await panic(S("getlev: need portal but none found"));
        }
        assign_level(trap.dst, ltmp);
        break;
      }
    } else if (!br) {
      let ttmp = null;
      for (trap = G.ftrap; trap; trap = ttmp) {
        ttmp = trap.ntrap;
        if ((trap.ttyp | 0) === MAGIC_PORTAL) {
          await deltrap(trap);
        }
      }
    }
  }
  await relink_timers(ghostly);
  await relink_light_sources(ghostly);
  reset_oattached_mids(ghostly);
  if (ghostly) {
    clear_id_mapping();
  }
}

export function get_plname_from_file(fd: number, plbuf: Ptr | null): void {
  const pltmpsiz = new Int32Array(1);
  pltmpsiz[0] = 0;
  read(fd, P(pltmpsiz, 0), 4);
  read(fd, plbuf, $u64(pltmpsiz[0]));
  return;
}

async function restore_msghistory(fd: number): Promise<void> {
  const msgsize = new Int32Array(1);
  let msgcount = 0;
  let msg = new Int8Array(256);
  while (1) {
    await mread(fd, P(msgsize, 0), 4);
    if (msgsize[0] === -1) {
      break;
    }
    if (msgsize[0] > BUFSZ - 1) {
      await panic(S("restore_msghistory: msg too big (%d)"), msgsize[0]);
    }
    await mread(fd, P(msg), msgsize[0] >>> 0);
    msg[msgsize[0]] = 0;
    await G.windowprocs.win_putmsghistory(P(msg), TRUE);
    ++msgcount;
  }
  if (msgcount) {
    await G.windowprocs.win_putmsghistory(null, TRUE);
  }
  do {
    if (await debugcore(S("restore.c"), 1)) {
      await pline(S("Read %d messages from savefile."), msgcount);
    }
  } while (0);
}

function clear_id_mapping(): void {
  let curr = null;
  while (!!(curr = id_map)) {
    id_map = curr.next;
    free(curr);
  }
  n_ids_mapped = 0;
}

async function add_id_mapping(gid: number, nid: number): Promise<void> {
  let idx = 0;
  idx = n_ids_mapped % N_PER_BUCKET;
  if (idx === 0) {
    let gnu = new struct_bucket();
    gnu.next = id_map;
    id_map = gnu;
  }
  id_map.map[idx].gid = gid;
  id_map.map[idx].nid = nid;
  ++n_ids_mapped;
}

export function lookup_id_mapping(gid: number, nidp: Ptr | null): number {
  let i = 0;
  let curr = null;
  if (n_ids_mapped) {
    for (curr = id_map; curr; curr = curr.next) {
      if (curr === id_map) {
        i = n_ids_mapped % N_PER_BUCKET;
        if (i === 0) {
          i = N_PER_BUCKET;
        }
      } else {
        i = N_PER_BUCKET;
      }
      while (--i >= 0) {
        if (gid === curr.map[i].gid) {
          nidp.a[nidp.o] = curr.map[i].nid;
          return TRUE;
        }
      }
    }
  }
  return FALSE;
}

function reset_oattached_mids(ghostly: number): void {
  let otmp = null;
  const oldid = new Uint32Array(1);
  const nid = new Uint32Array(1);
  for (otmp = G.level.objlist; otmp; otmp = otmp.nobj) {
    if (ghostly && (otmp.oextra && otmp.oextra.omonst)) {
      let mtmp = otmp.oextra.omonst;
      mtmp.m_id = 0;
      mtmp.mpeaceful = ((mtmp.mtame = 0) >>> 0) & 1;
    }
    if (ghostly && (otmp.oextra && otmp.oextra.omid)) {
      memcpy(P(oldid, 0), otmp.oextra.omid, 4);
      if (lookup_id_mapping(oldid[0], P(nid, 0))) {
        memcpy(otmp.oextra.omid, P(nid, 0), 4);
      } else {
        free_omid(otmp);
      }
    }
  }
}

export function minit(): void {
  restoreprocs.restore_minit();
  return;
}

export async function mread(fd: number, buf: any, len: number): Promise<void> {
  await restoreprocs.restore_mread(fd, buf, len);
  return;
}

export async function validate(fd: number, name: Ptr | null): Promise<number> {
  let rlen = 0;
  let sfi = new struct_savefile_info();
  let compatible = 0;
  let verbose = (name ? TRUE : FALSE) << 24 >> 24;
  let reslt = FALSE;
  if (!(reslt = await uptodate(fd, name))) {
    return 1;
  }
  rlen = read(fd, sfi, 24) | 0;
  minit();
  if (rlen === 0) {
    if (verbose) {
      await pline(S("File \"%s\" is empty during save file feature check?"), name);
      await G.windowprocs.win_wait_synch();
    }
    return -1;
  }
  compatible = (sfi.sfi1 & G.sfcap.sfi1) >>> 0;
  if ((sfi.sfi1 & SFI1_ZEROCOMP) >>> 0 === SFI1_ZEROCOMP) {
    if ((compatible & SFI1_ZEROCOMP) >>> 0 !== SFI1_ZEROCOMP) {
      if (verbose) {
        await pline(S("File \"%s\" has incompatible ZEROCOMP compression."), name);
        await G.windowprocs.win_wait_synch();
      }
      return 2;
    } else if ((G.sfrestinfo.sfi1 & SFI1_ZEROCOMP) >>> 0 !== SFI1_ZEROCOMP) {
      set_restpref(S("zerocomp"));
    }
  }
  if ((sfi.sfi1 & SFI1_EXTERNALCOMP) >>> 0 === SFI1_EXTERNALCOMP) {
    if ((compatible & SFI1_EXTERNALCOMP) >>> 0 !== SFI1_EXTERNALCOMP) {
      if (verbose) {
        await pline(S("File \"%s\" lacks required internal compression."), name);
        await G.windowprocs.win_wait_synch();
      }
      return 2;
    } else if ((G.sfrestinfo.sfi1 & SFI1_EXTERNALCOMP) >>> 0 !== SFI1_EXTERNALCOMP) {
      set_restpref(S("externalcomp"));
    }
  }
  if ((sfi.sfi1 & SFI1_RLECOMP) >>> 0 === SFI1_RLECOMP) {
    if ((compatible & SFI1_RLECOMP) >>> 0 !== SFI1_RLECOMP) {
      if (verbose) {
        await pline(S("File \"%s\" has incompatible run-length compression."), name);
        await G.windowprocs.win_wait_synch();
      }
      return 2;
    } else if ((G.sfrestinfo.sfi1 & SFI1_RLECOMP) >>> 0 !== SFI1_RLECOMP) {
      set_restpref(S("rlecomp"));
    }
  } else {
    set_restpref(S("!rlecomp"));
  }
  return 0;
}

export function reset_restpref(): void {
  set_restpref(S("externalcomp"));
  set_restpref(S("!rlecomp"));
}

export function set_restpref(suitename: Ptr | null): void {
  if (!strncmpi(suitename, S("externalcomp"), -1)) {
    restoreprocs.name = S("externalcomp");
    restoreprocs.restore_mread = def_mread;
    restoreprocs.restore_minit = def_minit;
    G.sfrestinfo.sfi1 = (G.sfrestinfo.sfi1 | SFI1_EXTERNALCOMP) >>> 0;
    G.sfrestinfo.sfi1 = (G.sfrestinfo.sfi1 & ~SFI1_ZEROCOMP >>> 0) >>> 0;
    def_minit();
  }
  if (!strncmpi(suitename, S("!rlecomp"), -1)) {
    G.sfrestinfo.sfi1 = (G.sfrestinfo.sfi1 & ~SFI1_RLECOMP >>> 0) >>> 0;
  }
}

function def_minit(): void {
  return;
}

async function def_mread(fd: number, buf: any, len: number): Promise<void> {
  let rlen = 0;
  rlen = read(fd, buf, len) | 0;
  if (rlen >>> 0 !== len) {
    if (restoreprocs.mread_flags === 1) {
      restoreprocs.mread_flags = -1;
      return;
    } else {
      await pline(S("Read %d instead of %u bytes."), rlen, len);
      if (G.restoring) {
        nhclose(fd);
        delete_savefile();
        await error(S("Error restoring old game."));
      }
      await panic(S("Error reading level file."));
    }
  }
}

export function $init(): void {
  restoreprocs = struct_restore_procs.$of(S("externalcomp"), 0, def_minit, def_mread, def_bclose);
  n_ids_mapped = 0;
  id_map = null;
  G.restoring = 0;
  oldfruit = null;
  omoves = new Float64Array(1);
  omoves[0] = 0;
}
