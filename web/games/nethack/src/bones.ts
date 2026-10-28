// @ts-nocheck
// NetHack 3.6.7 bones.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { unleash_all } from './apply.ts';
import { artifact_exists, artifact_light, exist_artifact } from './artifact.ts';
import { yn_function } from './cmd.ts';
import { newsym } from './display.ts';
import { obj_no_longer_held } from './do.ts';
import { christen_monst, free_oname, safe_oname } from './do_name.ts';
import { update_mlstmv } from './dog.ts';
import { In_hell, Is_botlevel, Is_branchlev, Is_special, assign_level, depth, dunlevs_in_dungeon, ledger_no, maxledgerno, on_level } from './dungeon.ts';
import { sanitize_engravings } from './engrave.ts';
import { commit_bonesfile, compress_bonesfile, create_bonesfile, debugcore, delete_bonesfile, nhclose, open_bonesfile, paniclog } from './files.ts';
import { in_rooms } from './hack.ts';
import { strncmpi, yyyymmddhhmmss } from './hacklib.ts';
import { obj_is_burning } from './light.ts';
import { makemon, mongets } from './makemon.ts';
import { add_to_container, add_to_minv, curse, dealloc_obj, free_omonst, mk_named_object, obj_attach_mid, obj_extract_self, place_object, set_corpsenm, weight } from './mkobj.ts';
import { dmonsfree, mongone } from './mon.ts';
import { m_carrying } from './mthrowu.ts';
import { fruit_from_indx } from './objnam.ts';
import { pline } from './pline.ts';
import { is_quest_artifact } from './questpgr.ts';
import { cant_revive } from './read.ts';
import { getlev, mread, trickery, validate } from './restore.ts';
import { rn2 } from './rnd.ts';
import { bclose, bwrite, savefruitchn, savelev, store_savefileinfo } from './save.ts';
import { inside_shop, tended_shop } from './shk.ts';
import { dismount_steed } from './steed.ts';
import { enexto, rloc_to } from './teleport.ts';
import { end_burn } from './timeout.ts';
import { formatkiller } from './topten.ts';
import { store_version } from './version.ts';
import { clear_bypasses, m_dowear } from './worn.ts';
import { get_obj_location } from './zap.ts';
import { struct_cemetery, struct_d_level, struct_monst, struct_nhcoord, struct_obj } from './structs.ts';
import { $at2, $rd, $sat, $wr, G, P, S, memset, sprintf, strcmp, strcpy, strlen } from './rt/index.ts';
import { AMULET_OF_YENDOR, BELL, BELL_OF_OPENING, CANDELABRUM_OF_INVOCATION, COLNO, CORPSE, DEFUNCT_MONSTER, DELPHI, DISMOUNT_BONES, EGG, FAKE_AMULET_OF_YENDOR, FALSE, FOOD_CLASS, FREE_SAVE, HOLE, LOW_PM, MAGIC_PORTAL, MM_NONAME, MS_LEADER, MS_NEMESIS, MUMMY_WRAPPING, NON_PM, NO_MINVENT, OBJ_CONTAINED, OBJ_FLOOR, PM_DOPPELGANGER, PM_GHOST, PM_MEDUSA, PM_ORACLE, PM_VLAD_THE_IMPALER, ROOMOFFSET, ROWNO, SCR_MAIL, SHOPBASE, SLIME_MOLD, SPECIAL_PM, SPE_BLANK_PAPER, SPE_BOOK_OF_THE_DEAD, SPE_NOVEL, STATUE, S_MUMMY, S_stone, TIN, TRUE, WAX_CANDLE, WRITE_SAVE } from './consts.ts';


function no_bones_level(lev: struct_d_level | null): number {
  let sptr = null;
  if (ledger_no(G.save_dlevel)) {
    assign_level(lev, G.save_dlevel);
  }
  return (!!(sptr = Is_special(lev)) && !sptr.boneid || !G.dungeons[lev.dnum].boneid || Is_botlevel(lev) || Is_branchlev(lev) && lev.dlevel > 1 || In_hell(lev) && lev.dlevel === dunlevs_in_dungeon(lev) - 1 ? 1 : 0) << 24 >> 24;
}

function goodfruit(id: number): void {
  let f = fruit_from_indx(-id);
  if (f) {
    f.fid = id;
  }
}

async function resetobjs(ochain: struct_obj | null, restore: number): Promise<void> {
  let otmp = null;
  let nobj = null;
  for (otmp = ochain; otmp; otmp = nobj) {
    nobj = otmp.nobj;
    if (otmp.cobj) {
      await resetobjs(otmp.cobj, restore);
    }
    if (otmp.in_use) {
      await obj_extract_self(otmp);
      await dealloc_obj(otmp);
      continue;
    }
    if (restore) {
      if (otmp.oartifact) {
        if (exist_artifact(otmp.otyp, safe_oname(otmp)) || is_quest_artifact(otmp)) {
          otmp.oartifact = 0;
          if (otmp.oextra && otmp.oextra.oname) {
            free_oname(otmp);
          }
        } else {
          artifact_exists(otmp, safe_oname(otmp), TRUE);
        }
      } else if (otmp.oextra && otmp.oextra.oname) {
        sanitize_name(otmp.oextra.oname);
      }
      if (otmp.oclass === FOOD_CLASS && otmp.oeaten) {
        let top = null;
        let p = null;
        const ox = new Int8Array(1);
        const oy = new Int8Array(1);
        for (top = otmp; top.where === OBJ_CONTAINED; top = top.v.v_ocontainer) {
          continue;
        }
        otmp.no_charge = ((top.where === OBJ_FLOOR && get_obj_location(top, P(ox, 0), P(oy, 0), 0) && inside_shop(ox[0], oy[0]) && $rd((p = in_rooms(ox[0], oy[0], SHOPBASE))) && tended_shop($sat(G.rooms, p.a[p.o] - ROOMOFFSET)) ? 1 : 0) >>> 0) & 1;
      }
    } else {
      if (G.objects[otmp.otyp].oc_uses_known) {
        otmp.known = 0;
      }
      otmp.dknown = (otmp.bknown = 0) & 1;
      otmp.rknown = 0;
      otmp.lknown = 0;
      otmp.cknown = 0;
      otmp.invlet = 0;
      otmp.no_charge = 0;
      otmp.was_thrown = 0;
      if (otmp.oextra && otmp.oextra.oname && !(otmp.oartifact || otmp.otyp === STATUE || otmp.otyp === SPE_NOVEL || otmp.otyp === CORPSE && otmp.corpsenm >= SPECIAL_PM)) {
        free_oname(otmp);
      }
      if (otmp.otyp === SLIME_MOLD) {
        goodfruit(otmp.spe);
      } else if (otmp.otyp === SCR_MAIL) {
        if (otmp.spe === 0) {
          otmp.spe = 1;
        }
      } else if (otmp.otyp === EGG) {
        otmp.spe = 0;
      } else if (otmp.otyp === TIN) {
        if (otmp.corpsenm >= LOW_PM && ($sat(G.mons, otmp.corpsenm).geno & 4096) !== 0) {
          otmp.corpsenm = NON_PM;
        }
      } else if (otmp.otyp === CORPSE || otmp.otyp === STATUE) {
        const mnum = new Int32Array(1);
        mnum[0] = otmp.corpsenm;
        if (otmp.oextra && otmp.oextra.omonst && cant_revive(P(mnum, 0), FALSE, null)) {
          free_omonst(otmp);
          if (mnum[0] === PM_DOPPELGANGER && otmp.otyp === CORPSE) {
            await set_corpsenm(otmp, mnum[0]);
          }
        }
      } else if (otmp.otyp === G.iflags.mines_prize_type && !((G.dungeon_topology.d_mineend_level.dlevel || G.dungeon_topology.d_mineend_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_mineend_level)) || (otmp.otyp === G.iflags.soko_prize_type1 || otmp.otyp === G.iflags.soko_prize_type2) && !((G.dungeon_topology.d_sokoend_level.dlevel || G.dungeon_topology.d_sokoend_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_sokoend_level))) {
        otmp.corpsenm = NON_PM;
      } else if (otmp.otyp === AMULET_OF_YENDOR) {
        otmp.otyp = FAKE_AMULET_OF_YENDOR;
        await curse(otmp);
      } else if (otmp.otyp === CANDELABRUM_OF_INVOCATION) {
        if (otmp.lamplit) {
          await end_burn(otmp, TRUE);
        }
        otmp.otyp = WAX_CANDLE;
        otmp.age = 50;
        if (otmp.spe > 0) {
          otmp.quan = otmp.spe;
        }
        otmp.spe = 0;
        otmp.owt = await weight(otmp) >>> 0;
        await curse(otmp);
      } else if (otmp.otyp === BELL_OF_OPENING) {
        otmp.otyp = BELL;
        await curse(otmp);
      } else if (otmp.otyp === SPE_BOOK_OF_THE_DEAD) {
        otmp.otyp = SPE_BLANK_PAPER;
        await curse(otmp);
      }
    }
  }
}

export function sanitize_name(namebuf: Ptr | null): void {
  let c = 0;
  let strip_8th_bit = (G.windowprocs.name && !strncmpi(S("tty"), G.windowprocs.name, strlen(S("tty")) | 0) && !G.iflags.wc_eight_bit_input ? 1 : 0) << 24 >> 24;
  while (namebuf.a[namebuf.o]) {
    c = namebuf.a[namebuf.o] & 127;
    if (c < 32 || c === 127) {
      namebuf.a[namebuf.o] = 46;
    } else if (c !== namebuf.a[namebuf.o]) {
      if (strip_8th_bit) {
        namebuf.a[namebuf.o] = 95;
      }
    }
    namebuf = namebuf.add(1);
  }
}

export async function drop_upon_death(mtmp: struct_monst | null, cont: struct_obj | null, x: number, y: number): Promise<void> {
  let otmp = null;
  G.u.twoweap = 0;
  while (!!(otmp = G.invent)) {
    await obj_extract_self(otmp);
    if (!mtmp || (mtmp.data.mflags2 & 2) >>> 0 !== 0) {
      await obj_no_longer_held(otmp);
    }
    otmp.owornmask = 0;
    if ((cont || artifact_light(otmp)) && obj_is_burning(otmp)) {
      await end_burn(otmp, TRUE);
    }
    if (otmp.otyp === SLIME_MOLD) {
      goodfruit(otmp.spe);
    }
    if (rn2(5)) {
      await curse(otmp);
    }
    if (mtmp) {
      await add_to_minv(mtmp, otmp);
    } else if (cont) {
      await add_to_container(cont, otmp);
    } else {
      await place_object(otmp, x, y);
    }
  }
  if (cont) {
    cont.owt = await weight(cont) >>> 0;
  }
}

async function fixuporacle(oracle: struct_monst | null): Promise<number> {
  let cc = new struct_nhcoord();
  let ridx = 0;
  let o_ridx = 0;
  if (!((G.dungeon_topology.d_oracle_level.dlevel || G.dungeon_topology.d_oracle_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_oracle_level))) {
    return FALSE;
  }
  oracle.mpeaceful = 1;
  o_ridx = ($at2(G.level.locations, oracle.mx, oracle.my).roomno | 0) - ROOMOFFSET;
  if (o_ridx >= 0 && G.rooms[o_ridx].rtype === DELPHI) {
    return TRUE;
  }
  for (ridx = 0; ridx < (Math.trunc(17712 / 216) | 0); ++ridx) {
    if (G.rooms[ridx].orig_rtype === DELPHI) {
      break;
    }
  }
  if (o_ridx !== ridx && ridx < (Math.trunc(17712 / 216) | 0)) {
    cc.x = ((G.rooms[ridx].lx + G.rooms[ridx].hx) / 2 | 0) << 24 >> 24;
    cc.y = ((G.rooms[ridx].ly + G.rooms[ridx].hy) / 2 | 0) << 24 >> 24;
    if (await enexto(cc, cc.x, cc.y, oracle.data)) {
      await rloc_to(oracle, cc.x, cc.y);
      o_ridx = ($at2(G.level.locations, oracle.mx, oracle.my).roomno | 0) - ROOMOFFSET;
    }
  }
  if (ridx === o_ridx) {
    G.rooms[ridx].rtype = DELPHI;
  }
  return TRUE;
}

export function can_make_bones(): number {
  let ttmp = null;
  if (!G.flags.bones) {
    return FALSE;
  }
  if (ledger_no(G.u.uz) <= 0 || ledger_no(G.u.uz) > maxledgerno()) {
    return FALSE;
  }
  if (no_bones_level(G.u.uz)) {
    return FALSE;
  }
  if (G.u.uswallow) {
    return FALSE;
  }
  if (!Is_branchlev(G.u.uz)) {
    for (ttmp = G.ftrap; ttmp; ttmp = ttmp.ntrap) {
      if ((ttmp.ttyp | 0) === MAGIC_PORTAL) {
        return FALSE;
      }
    }
  }
  if (depth(G.u.uz) <= 0 || !rn2(1 + (depth(G.u.uz) >> 2)) && !G.flags.debug) {
    return FALSE;
  }
  if (G.flags.explore) {
    return FALSE;
  }
  return TRUE;
}

export async function savebones(how: number, when: number, corpse: struct_obj | null): Promise<void> {
  let $g = 0;
  let fd = 0;
  let x = 0;
  let y = 0;
  let ttmp = null;
  let mtmp = null;
  let mptr = null;
  let f = null;
  let newbones = null;
  let c = new Int8Array(1);
  let bonesid = [null];
  let whynot = new Int8Array(256);
  $L: for (;;) {
    switch ($g) {
    case 0:
      whynot = new Int8Array(256);
      clear_bypasses();
      fd = open_bonesfile(G.u.uz, P(bonesid, 0));
      if (fd >= 0) {
        nhclose(fd);
        if (G.flags.debug) {
          if (await yn_function(S("Bones file already exists.  Replace it?"), P(G.ynchars), 110) === 121) {
            if (delete_bonesfile(G.u.uz)) {
              { $g = 1; continue $L; }
            } else {
              await pline(S("Cannot unlink old bones."));
            }
          }
        }
        compress_bonesfile();
        return;
      }
    case 1: // make_bones
      unleash_all();
      for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
        if (mtmp.mhp < 1) {
          continue;
        }
        mptr = mtmp.data;
        if (mtmp.iswiz | 0 || mptr === $sat(G.mons, PM_MEDUSA) || mptr.msound === MS_NEMESIS || mptr.msound === MS_LEADER || mptr === $sat(G.mons, PM_VLAD_THE_IMPALER) || mptr === $sat(G.mons, PM_ORACLE) && !await fixuporacle(mtmp)) {
          await mongone(mtmp);
        }
      }
      if (G.u.usteed) {
        await dismount_steed(DISMOUNT_BONES);
      }
      await dmonsfree();
      for (f = G.ffruit; f; f = f.nextf) {
        f.fid = -f.fid;
      }
      if (G.uball) {
        G.uball.owornmask = G.uchain.owornmask = 0;
      }
      if (G.u.ugrave_arise === NON_PM - 1) {
        let otmp = null;
        otmp = await mk_named_object(STATUE, $sat(G.mons, G.u.umonnum), G.u.ux, G.u.uy, P(G.plname));
        await drop_upon_death(null, otmp, G.u.ux, G.u.uy);
        if (!otmp) {
          return;
        }
        mtmp = null;
      } else if (G.u.ugrave_arise < LOW_PM) {
        await drop_upon_death(null, null, G.u.ux, G.u.uy);
        G.in_mklev = TRUE;
        mtmp = await makemon($sat(G.mons, PM_GHOST), G.u.ux, G.u.uy, MM_NONAME);
        G.in_mklev = FALSE;
        if (!mtmp) {
          return;
        }
        mtmp = await christen_monst(mtmp, P(G.plname));
        if (corpse) {
          await obj_attach_mid(corpse, mtmp.m_id);
        }
      } else {
        G.in_mklev = TRUE;
        mtmp = await makemon($sat(G.mons, G.u.ugrave_arise), G.u.ux, G.u.uy, NO_MINVENT);
        G.in_mklev = FALSE;
        if (!mtmp) {
          await drop_upon_death(null, null, G.u.ux, G.u.uy);
          G.u.ugrave_arise = NON_PM;
          return;
        }
        mtmp = await christen_monst(mtmp, P(G.plname));
        await newsym(G.u.ux, G.u.uy);
        await drop_upon_death(mtmp, null, G.u.ux, G.u.uy);
        if (mtmp.data.mlet === S_MUMMY && !m_carrying(mtmp, MUMMY_WRAPPING)) {
          await mongets(mtmp, MUMMY_WRAPPING);
        }
        await m_dowear(mtmp, TRUE);
      }
      if (mtmp) {
        mtmp.m_lev = (G.u.ulevel ? G.u.ulevel : 1) & 0xff;
        mtmp.mhp = mtmp.mhpmax = G.u.uhpmax;
        mtmp.female = (G.flags.female >>> 0) & 1;
        mtmp.msleeping = 1;
      }
      for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
        await resetobjs(mtmp.minvent, FALSE);
        mtmp.mlstmv = 0;
        if (mtmp.mtame) {
          mtmp.mtame = (mtmp.mpeaceful = 0) << 24 >> 24;
        }
      }
      for (ttmp = G.ftrap; ttmp; ttmp = ttmp.ntrap) {
        ttmp.madeby_u = 0;
        ttmp.tseen = (((ttmp.ttyp | 0) === HOLE ? 1 : 0) >>> 0) & 1;
      }
      await resetobjs(G.level.objlist, FALSE);
      await resetobjs(G.level.buriedobjlist, FALSE);
      G.u.ux0 = G.u.ux, G.u.uy0 = G.u.uy;
      G.u.ux = G.u.uy = 0;
      for (x = 1; x < COLNO; ++x) {
        for (y = 0; y < ROWNO; ++y) {
          $at2(G.level.locations, x, y).seenv = 0;
          $at2(G.level.locations, x, y).waslit = 0;
          $at2(G.level.locations, x, y).glyph = S_stone + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))));
          G.lastseentyp[x][y] = 0;
        }
      }
      newbones = new struct_cemetery();
      memset(newbones, 32, 176);
      sprintf(P(newbones.who), S("%s-%.3s-%.3s-%.3s-%.3s"), P(G.plname), G.urole.filecode, G.urace.filecode, G.genders[G.flags.female].filecode, G.aligns[1 - G.u.ualign.type].filecode);
      await formatkiller(P(newbones.how), 101, how, TRUE);
      strcpy(P(newbones.when), await yyyymmddhhmmss(when));
      newbones.frpx = G.u.ux0, newbones.frpy = G.u.uy0;
      newbones.bonesknown = FALSE;
      newbones.next = G.level.bonesinfo;
      G.level.bonesinfo = newbones;
      if (G.flags.debug) {
        G.level.flags.wizard_bones = 1;
      }
      fd = create_bonesfile(G.u.uz, P(bonesid, 0), P(whynot));
      if (fd < 0) {
        if (G.flags.debug) {
          await pline(S("%s"), P(whynot));
        }
        paniclog(S("savebones"), P(whynot));
        return;
      }
      c[0] = strlen(bonesid[0]) + 1 << 24 >> 24;
      await store_version(fd);
      await store_savefileinfo(fd);
      await bwrite(fd, P(c, 0), 1);
      await bwrite(fd, bonesid[0], c[0] >>> 0);
      await savefruitchn(fd, WRITE_SAVE | FREE_SAVE);
      update_mlstmv();
      await savelev(fd, ledger_no(G.u.uz), WRITE_SAVE | FREE_SAVE);
      await bclose(fd);
      await commit_bonesfile(G.u.uz);
      compress_bonesfile();
    }
    break;
  }
}

export async function getbones(): Promise<number> {
  let fd = 0;
  let ok = 0;
  const c = new Int8Array(1);
  const bonesid = [null];
  let oldbonesid = new Int8Array(40);
  if (G.flags.explore) {
    return 0;
  }
  if (!G.flags.bones) {
    return 0;
  }
  if (rn2(3) && !G.flags.debug) {
    return 0;
  }
  if (no_bones_level(G.u.uz)) {
    return 0;
  }
  fd = open_bonesfile(G.u.uz, P(bonesid, 0));
  if (fd < 0) {
    return 0;
  }
  if (await validate(fd, P(G.bones)) !== 0) {
    if (!G.flags.debug) {
      await pline(S("Discarding unusable bones; no need to panic..."));
    }
    ok = FALSE;
  } else {
    ok = TRUE;
    if (G.flags.debug) {
      if (await yn_function(S("Get bones?"), P(G.ynchars), 110) === 110) {
        nhclose(fd);
        compress_bonesfile();
        return 0;
      }
    }
    await mread(fd, P(c, 0), 1);
    await mread(fd, P(oldbonesid), c[0] >>> 0);
    if (strcmp(bonesid[0], P(oldbonesid)) !== 0 && (strlen(bonesid[0]) <= 2 || strcmp(bonesid[0].add(2), P(oldbonesid)) !== 0)) {
      let errbuf = new Int8Array(256);
      sprintf(P(errbuf), S("This is bones level '%s', not '%s'!"), P(oldbonesid), bonesid[0]);
      if (G.flags.debug) {
        await pline(S("%s"), P(errbuf));
        ok = FALSE;
      }
      await trickery(P(errbuf));
    } else {
      let mtmp = null;
      await getlev(fd, 0, 0, TRUE);
      for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
        if (mtmp.mextra && mtmp.mextra.mname) {
          sanitize_name(mtmp.mextra.mname);
        }
        if (mtmp.mhpmax === DEFUNCT_MONSTER) {
          if (G.flags.debug) {
            do {
              if (await debugcore(S("bones.c"), 1)) {
                await pline(S("Removing defunct monster %s from bones."), mtmp.data.mname);
              }
            } while (0);
          }
          await mongone(mtmp);
        } else {
          await resetobjs(mtmp.minvent, TRUE);
        }
      }
      await resetobjs(G.level.objlist, TRUE);
      await resetobjs(G.level.buriedobjlist, TRUE);
    }
  }
  nhclose(fd);
  sanitize_engravings();
  ++G.u.uroleplay.numbones;
  if (G.flags.debug) {
    if (await yn_function(S("Unlink bones?"), P(G.ynchars), 110) === 110) {
      compress_bonesfile();
      return ok;
    }
  }
  if (!delete_bonesfile(G.u.uz)) {
    return 0;
  }
  return ok;
}

export function $init(): void {
}
