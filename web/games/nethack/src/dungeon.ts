// @ts-nocheck
// NetHack 3.6.7 dungeon.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { dupstr } from './alloc.ts';
import { isok } from './cmd.ts';
import { db_under_typ, is_drawbridge_wall } from './dbridge.ts';
import { dlb_fclose, dlb_fopen, dlb_fread } from './dlb.ts';
import { goto_level } from './do.ts';
import { done, nh_terminate, panic } from './end.ts';
import { debugcore } from './files.ts';
import { switch_terrain } from './hack.ts';
import { eos, highc, mungspaces, strncmpi, strstri, strsubst } from './hacklib.ts';
import { place_lregion } from './mkmaze.ts';
import { cmap_to_type } from './mkroom.ts';
import { an, makeplural } from './objnam.ts';
import { impossible } from './pline.ts';
import { align_gname } from './pray.ts';
import { findpriest, inhistemple } from './priest.ts';
import { ldrname } from './questpgr.ts';
import { mread, restcemetery } from './restore.ts';
import { rn2, rnd } from './rnd.ts';
import { bwrite, savecemetery } from './save.ts';
import { inhishop, shop_keeper } from './shk.ts';
import { formatkiller } from './topten.ts';
import { check_version } from './version.ts';
import { worm_known } from './worm.ts';
import { struct_branch, struct_cemetery, struct_d_level, struct_dlb_handle, struct_dungeon, struct_lchoice, struct_level_map, struct_mapseen, struct_monst, struct_proto_dungeon, struct_s_level, struct_tmpbranch, struct_version_info, union_any } from './structs.ts';
import { $at2, $peq, $rd, $sadd, $sarrOf, $sat, $sdiff, $wr, G, P, R, S, fprintf, free, getchar, memset, sprintf, strcat, strchr, strcmp, strcpy, strlen, strncmp } from './rt/index.ts';
import { ALTAR, ARMORSHOP, ASCENDED, ATR_BOLD, ATR_INVERSE, ATR_NONE, BLINDED, BOOKSHOP, BRANCH_LIMIT, BR_NO_END1, BR_NO_END2, BR_PORTAL, BR_STAIR, CANDLESHOP, COLNO, DBWALL, DELPHI, DOOR, DRAWBRIDGE_DOWN, DRAWBRIDGE_UP, D_ALIGN_MASK, ESCAPED, EXIT_FAILURE, FALSE, FODDERSHOP, FOODSHOP, FORGOTTEN, FOUNTAIN, FREE_SAVE, GRAVE, HELLISH, INFRAVISION, LEVITATION, LEV_LIMIT, LR_DOWNTELE, LR_UPTELE, MAGIC_PORTAL, MAXDUNGEON, MAXLEVEL, MAXLINFO, MAZELIKE, MENU_UNSELECTED, MSA_NONE, M_AP_FURNITURE, NHW_MENU, NO_GLYPH, PICK_ONE, POTIONSHOP, RINGSHOP, ROGUELIKE, ROOMOFFSET, ROWNO, SCROLLSHOP, SEE_INVIS, SHOPBASE, SINK, SVALL, TEMPLE, THRONE, TOWN, TREE, TRUE, VISITED, WANDSHOP, WEAPONSHOP, WRITE_SAVE } from './consts.ts';

let branches: struct_branch | null;
let add_branch$branch_id: number;

async function dumpit(): Promise<void> {
  let i = 0;
  let x = null;
  let br = null;
  if (!await debugcore(S("dungeon.c"), 0)) {
    return;
  }
  for (i = 0; i < G.n_dgns; ++i) {
    fprintf(R.stderr, S("\n#%d \"%s\" (%s):\n"), i, P(G.dungeons[i].dname), P(G.dungeons[i].proto));
    fprintf(R.stderr, S("    num_dunlevs %d, dunlev_ureached %d\n"), G.dungeons[i].num_dunlevs, G.dungeons[i].dunlev_ureached);
    fprintf(R.stderr, S("    depth_start %d, ledger_start %d\n"), G.dungeons[i].depth_start, G.dungeons[i].ledger_start);
    fprintf(R.stderr, S("    flags:%s%s%s\n"), G.dungeons[i].flags.rogue_like | 0 ? S(" rogue_like") : S(""), G.dungeons[i].flags.maze_like | 0 ? S(" maze_like") : S(""), G.dungeons[i].flags.hellish | 0 ? S(" hellish") : S(""));
    await getchar();
  }
  fprintf(R.stderr, S("\nSpecial levels:\n"));
  for (x = G.sp_levchn; x; x = x.next) {
    fprintf(R.stderr, S("%s (%d): "), P(x.proto), x.rndlevs);
    fprintf(R.stderr, S("on %d, %d; "), x.dlevel.dnum, x.dlevel.dlevel);
    fprintf(R.stderr, S("flags:%s%s%s%s\n"), x.flags.rogue_like | 0 ? S(" rogue_like") : S(""), x.flags.maze_like | 0 ? S(" maze_like") : S(""), x.flags.hellish | 0 ? S(" hellish") : S(""), x.flags.town | 0 ? S(" town") : S(""));
    await getchar();
  }
  fprintf(R.stderr, S("\nBranches:\n"));
  for (br = branches; br; br = br.next) {
    fprintf(R.stderr, S("%d: %s, end1 %d %d, end2 %d %d, %s\n"), br.id, br.type === BR_STAIR ? S("stair") : br.type === BR_NO_END1 ? S("no end1") : br.type === BR_NO_END2 ? S("no end2") : br.type === BR_PORTAL ? S("portal") : S("unknown"), br.end1.dnum, br.end1.dlevel, br.end2.dnum, br.end2.dlevel, br.end1_up ? S("end1 up") : S("end1 down"));
  }
  await getchar();
  fprintf(R.stderr, S("\nDone\n"));
  await getchar();
}

export async function save_dungeon(fd: number, perform_write: number, free_data: number): Promise<void> {
  let curr = null;
  let next = null;
  let curr_ms = null;
  let next_ms = null;
  const count = new Int32Array(1);
  if (perform_write) {
    await bwrite(fd, P(G, "n_dgns"), 4);
    await bwrite(fd, G.dungeons[0], 56 * (G.n_dgns >>> 0) >>> 0);
    await bwrite(fd, G.dungeon_topology, 56);
    await bwrite(fd, P(G.tune), 6);
    for (count[0] = 0, curr = branches; curr; curr = curr.next) {
      ++count[0];
    }
    await bwrite(fd, P(count, 0), 4);
    for (curr = branches; curr; curr = curr.next) {
      await bwrite(fd, curr, 24);
    }
    count[0] = maxledgerno();
    await bwrite(fd, P(count, 0), 4);
    await bwrite(fd, G.level_info[0], (count[0] >>> 0) * 1 >>> 0);
    await bwrite(fd, G.inv_pos, 2);
    for (count[0] = 0, curr_ms = G.mapseenchn; curr_ms; curr_ms = curr_ms.next) {
      ++count[0];
    }
    await bwrite(fd, P(count, 0), 4);
    for (curr_ms = G.mapseenchn; curr_ms; curr_ms = curr_ms.next) {
      await save_mapseen(fd, curr_ms);
    }
  }
  if (free_data) {
    for (curr = branches; curr; curr = next) {
      next = curr.next;
      free(curr);
    }
    branches = null;
    for (curr_ms = G.mapseenchn; curr_ms; curr_ms = next_ms) {
      next_ms = curr_ms.next;
      if (curr_ms.custom) {
        free(curr_ms.custom);
      }
      if (curr_ms.final_resting_place) {
        await savecemetery(fd, FREE_SAVE, P(curr_ms, "final_resting_place"));
      }
      free(curr_ms);
    }
    G.mapseenchn = null;
  }
}

export async function restore_dungeon(fd: number): Promise<void> {
  let curr = null;
  let last = null;
  const count = new Int32Array(1);
  let i = 0;
  let curr_ms = null;
  let last_ms = null;
  await mread(fd, P(G, "n_dgns"), 4);
  await mread(fd, G.dungeons[0], 56 * (G.n_dgns >>> 0) >>> 0);
  await mread(fd, G.dungeon_topology, 56);
  await mread(fd, P(G.tune), 6);
  last = branches = null;
  await mread(fd, P(count, 0), 4);
  for (i = 0; i < count[0]; ++i) {
    curr = new struct_branch();
    await mread(fd, curr, 24);
    curr.next = null;
    if (last) {
      last.next = curr;
    } else {
      branches = curr;
    }
    last = curr;
  }
  await mread(fd, P(count, 0), 4);
  if (count[0] >= MAXLINFO) {
    await panic(S("level information count larger (%d) than allocated size"), count[0]);
  }
  await mread(fd, G.level_info[0], (count[0] >>> 0) * 1 >>> 0);
  await mread(fd, G.inv_pos, 2);
  await mread(fd, P(count, 0), 4);
  last_ms = null;
  for (i = 0; i < count[0]; ++i) {
    curr_ms = await load_mapseen(fd);
    curr_ms.next = null;
    if (last_ms) {
      last_ms.next = curr_ms;
    } else {
      G.mapseenchn = curr_ms;
    }
    last_ms = curr_ms;
  }
}

async function Fread(ptr: any, size: number, nitems: number, stream: struct_dlb_handle | null): Promise<void> {
  let cnt = 0;
  if ((cnt = dlb_fread(ptr, size, nitems, stream)) !== nitems) {
    await panic(S("Premature EOF on dungeon description file!\r\nExpected %d bytes - got %d."), Math.imul(size, nitems), Math.imul(size, cnt));
    await nh_terminate(EXIT_FAILURE);
  }
}

async function dname_to_dnum(s: Ptr | null): Promise<number> {
  let i = 0;
  for (i = 0; i < G.n_dgns; i = i + 1 << 24 >> 24) {
    if (!strcmp(P(G.dungeons[i].dname), s)) {
      return i;
    }
  }
  await panic(S("Couldn't resolve dungeon number for name \"%s\"."), s);
  return 0;
}

export function find_level(s: Ptr | null): struct_s_level | null {
  let curr = null;
  for (curr = G.sp_levchn; curr; curr = curr.next) {
    if (!strncmpi(s, P(curr.proto), -1)) {
      break;
    }
  }
  return curr;
}

async function find_branch(s: Ptr | null, pd: struct_proto_dungeon | null): Promise<number> {
  let i = 0;
  if (pd) {
    for (i = 0; i < pd.n_brs; ++i) {
      if (!strcmp(P(pd.tmpbranch[i].name), s)) {
        break;
      }
    }
    if (i === pd.n_brs) {
      await panic(S("find_branch: can't find %s"), s);
    }
  } else {
    let br = null;
    let dnam = null;
    for (br = branches; br; br = br.next) {
      dnam = P(G.dungeons[br.end2.dnum].dname);
      if (!strncmpi(dnam, s, -1) || !strncmpi(dnam, S("The "), 4) && !strncmpi(dnam.add(4), s, -1)) {
        break;
      }
    }
    i = br ? ledger_no(br.end1) << 8 | ledger_no(br.end2) : -1;
  }
  return i;
}

async function parent_dnum(s: Ptr | null, pd: struct_proto_dungeon | null): Promise<number> {
  let i = 0;
  let pdnum = 0;
  i = await find_branch(s, pd);
  for (pdnum = 0; strcmp(P(pd.tmpdungeon[pdnum].name), s); pdnum = pdnum + 1 << 24 >> 24) {
    if ((i -= pd.tmpdungeon[pdnum].branches) < 0) {
      return pdnum;
    }
  }
  await panic(S("parent_dnum: couldn't resolve branch."));
  return 0;
}

async function level_range(dgn: number, base: number, randc: number, chain: number, pd: struct_proto_dungeon | null, adjusted_base: Ptr | null): Promise<number> {
  let lmax = G.dungeons[dgn].num_dunlevs;
  if (chain >= 0) {
    let levtmp = pd.final_lev[chain];
    if (!levtmp) {
      await panic(S("level_range: empty chain level!"));
    }
    base += levtmp.dlevel.dlevel;
  } else {
    if (base < 0) {
      base = lmax + base + 1;
    }
  }
  if (base < 1 || base > lmax) {
    await panic(S("level_range: base value out of range"));
  }
  adjusted_base.a[adjusted_base.o] = base;
  if (randc === -1) {
    return lmax - base + 1;
  } else if (randc) {
    return base + randc - 1 > lmax ? lmax - base + 1 : randc;
  }
  return 1;
}

async function parent_dlevel(s: Ptr | null, pd: struct_proto_dungeon | null): Promise<number> {
  let i = 0;
  let j = 0;
  let num = 0;
  const base = new Int32Array(1);
  let dnum = await parent_dnum(s, pd);
  let curr = null;
  i = await find_branch(s, pd);
  num = await level_range(dnum, pd.tmpbranch[i].lev.base, pd.tmpbranch[i].lev.rand, pd.tmpbranch[i].chain, pd, P(base, 0));
  i = j = rn2(num);
  do {
    if (++i >= num) {
      i = 0;
    }
    for (curr = branches; curr; curr = curr.next) {
      if (curr.end1.dnum === dnum && curr.end1.dlevel === base[0] + i || curr.end2.dnum === dnum && curr.end2.dlevel === base[0] + i) {
        break;
      }
    }
  } while (curr && i !== j);
  return base[0] + i << 24 >> 24;
}

async function correct_branch_type(tbr: struct_tmpbranch | null): Promise<number> {
  switch (tbr.type) {
  case 0:
    return BR_STAIR;
  case 1:
    return tbr.up ? BR_NO_END1 : BR_NO_END2;
  case 2:
    return tbr.up ? BR_NO_END2 : BR_NO_END1;
  case 3:
    return BR_PORTAL;
  }
  await impossible(S("correct_branch_type: unknown branch type"));
  return BR_STAIR;
}

export async function insert_branch(new_branch: struct_branch | null, extract_first: number): Promise<void> {
  let curr = null;
  let prev = null;
  let new_val = 0;
  let curr_val = 0;
  let prev_val = 0;
  if (extract_first) {
    for (prev = null, curr = branches; curr; prev = curr, curr = curr.next) {
      if (curr === new_branch) {
        break;
      }
    }
    if (!curr) {
      await panic(S("insert_branch: not found"));
    }
    if (prev) {
      prev.next = curr.next;
    } else {
      branches = curr.next;
    }
  }
  new_branch.next = null;
  prev = null;
  prev_val = -1;
  new_val = (new_branch.end1.dnum * (32 + 1) + new_branch.end1.dlevel) * (16 + 1) * (32 + 1) + (new_branch.end2.dnum * (32 + 1) + new_branch.end2.dlevel);
  for (curr = branches; curr; prev_val = curr_val, prev = curr, curr = curr.next) {
    curr_val = (curr.end1.dnum * (32 + 1) + curr.end1.dlevel) * (16 + 1) * (32 + 1) + (curr.end2.dnum * (32 + 1) + curr.end2.dlevel);
    if (prev_val < new_val && new_val <= curr_val) {
      break;
    }
  }
  if (prev) {
    new_branch.next = curr;
    prev.next = new_branch;
  } else {
    new_branch.next = branches;
    branches = new_branch;
  }
}

async function add_branch(dgn: number, child_entry_level: number, pd: struct_proto_dungeon | null): Promise<struct_branch | null> {
  let branch_num = 0;
  let new_branch = null;
  branch_num = await find_branch(P(G.dungeons[dgn].dname), pd);
  new_branch = new struct_branch();
  memset(new_branch, 0, 24);
  new_branch.next = null;
  new_branch.id = add_branch$branch_id++;
  new_branch.type = await correct_branch_type($sat(pd.tmpbranch, branch_num));
  new_branch.end1.dnum = await parent_dnum(P(G.dungeons[dgn].dname), pd);
  new_branch.end1.dlevel = await parent_dlevel(P(G.dungeons[dgn].dname), pd);
  new_branch.end2.dnum = dgn << 24 >> 24;
  new_branch.end2.dlevel = child_entry_level << 24 >> 24;
  new_branch.end1_up = (pd.tmpbranch[branch_num].up ? TRUE : FALSE) << 24 >> 24;
  await insert_branch(new_branch, FALSE);
  return new_branch;
}

function add_level(new_lev: struct_s_level | null): void {
  let prev = null;
  let curr = null;
  prev = null;
  for (curr = G.sp_levchn; curr; curr = curr.next) {
    if (curr.dlevel.dnum === new_lev.dlevel.dnum && curr.dlevel.dlevel > new_lev.dlevel.dlevel) {
      break;
    }
    prev = curr;
  }
  if (!prev) {
    new_lev.next = G.sp_levchn;
    G.sp_levchn = new_lev;
  } else {
    new_lev.next = curr;
    prev.next = new_lev;
  }
}

async function init_level(dgn: number, proto_index: number, pd: struct_proto_dungeon | null): Promise<void> {
  let new_level = null;
  let tlevel = $sat(pd.tmplevel, proto_index);
  pd.final_lev[proto_index] = null;
  if (!G.flags.debug && tlevel.chance <= rn2(100)) {
    return;
  }
  pd.final_lev[proto_index] = new_level = new struct_s_level();
  memset(new_level, 0, 32);
  strcpy(P(new_level.proto), P(tlevel.name));
  new_level.boneid = tlevel.boneschar;
  new_level.dlevel.dnum = dgn << 24 >> 24;
  new_level.dlevel.dlevel = 0;
  new_level.flags.town = ((!!(tlevel.flags & TOWN) ? 1 : 0) >>> 0) & 1;
  new_level.flags.hellish = ((!!(tlevel.flags & HELLISH) ? 1 : 0) >>> 0) & 1;
  new_level.flags.maze_like = ((!!(tlevel.flags & MAZELIKE) ? 1 : 0) >>> 0) & 1;
  new_level.flags.rogue_like = ((!!(tlevel.flags & ROGUELIKE) ? 1 : 0) >>> 0) & 1;
  new_level.flags.align = (((tlevel.flags & D_ALIGN_MASK) >> 4) >>> 0) & 7;
  if (!new_level.flags.align) {
    new_level.flags.align = (((pd.tmpdungeon[dgn].flags & D_ALIGN_MASK) >> 4) >>> 0) & 7;
  }
  new_level.rndlevs = tlevel.rndlevs & 0xff;
  new_level.next = null;
}

async function possible_places(idx: number, map: Ptr | null, pd: struct_proto_dungeon | null): Promise<number> {
  let i = 0;
  const start = new Int32Array(1);
  let count = 0;
  let lev = pd.final_lev[idx];
  for (i = 0; i <= MAXLEVEL; ++i) {
    map.a[map.o + i] = FALSE;
  }
  count = await level_range(lev.dlevel.dnum, pd.tmplevel[idx].lev.base, pd.tmplevel[idx].lev.rand, pd.tmplevel[idx].chain, pd, P(start, 0));
  for (i = start[0]; i < start[0] + count; ++i) {
    map.a[map.o + i] = TRUE;
  }
  for (i = pd.start; i < idx; ++i) {
    if (pd.final_lev[i] && map.a[map.o + pd.final_lev[i].dlevel.dlevel]) {
      map.a[map.o + pd.final_lev[i].dlevel.dlevel] = FALSE;
      --count;
    }
  }
  return count;
}

async function pick_level(map: Ptr | null, nth: number): Promise<number> {
  let i = 0;
  for (i = 1; i <= MAXLEVEL; ++i) {
    if (map.a[map.o + i] && !nth--) {
      return i << 24 >> 24;
    }
  }
  await panic(S("pick_level:  ran out of valid levels"));
  return 0;
}

async function place_level(proto_index: number, pd: struct_proto_dungeon | null): Promise<number> {
  let map = new Int8Array(33);
  let lev = null;
  let npossible = 0;
  if (proto_index === pd.n_levs) {
    return TRUE;
  }
  lev = pd.final_lev[proto_index];
  if (!lev) {
    return await place_level(proto_index + 1, pd);
  }
  npossible = await possible_places(proto_index, P(map), pd);
  for (; npossible; --npossible) {
    lev.dlevel.dlevel = await pick_level(P(map), rn2(npossible));
    if (await place_level(proto_index + 1, pd)) {
      return TRUE;
    }
    map[lev.dlevel.dlevel] = FALSE;
  }
  return FALSE;
}

export async function init_dungeons(): Promise<void> {
  let $t1: any;
  let dgn_file = null;
  let i = 0;
  let cl = 0;
  let cb = 0;
  let x = null;
  let pd = new struct_proto_dungeon();
  let lev_map = null;
  let vers_info = new struct_version_info();
  pd.n_levs = pd.n_brs = 0;
  dgn_file = await dlb_fopen(S("dungeon"), S("r"));
  if (!dgn_file) {
    let tbuf = new Int8Array(256);
    sprintf(P(tbuf), S("Cannot open dungeon description - \"%s"), S("dungeon"));
    strcat(P(tbuf), S("\" from "));
    strcat(P(tbuf), S("\""));
    strcat(P(tbuf), S("nhdat"));
    strcat(P(tbuf), S("\" file!"));
    await panic(S("%s"), P(tbuf));
  }
  await Fread(vers_info, 40, 1, dgn_file);
  if (G.iflags.window_inited) {
    await G.windowprocs.win_clear_nhwindow(G.WIN_MAP);
  }
  if (!await check_version(vers_info, S("dungeon"), TRUE)) {
    await panic(S("Dungeon description not valid."));
  }
  G.sp_levchn = null;
  await Fread(P(G, "n_dgns"), 4, 1, dgn_file);
  if (G.n_dgns >= MAXDUNGEON) {
    await panic(S("init_dungeons: too many dungeons"));
  }
  for (i = 0; i < G.n_dgns; ++i) {
    await Fread($sat(pd.tmpdungeon, i), 76, 1, dgn_file);
    if (!G.flags.debug && pd.tmpdungeon[i].chance && pd.tmpdungeon[i].chance <= rn2(100)) {
      let j = 0;
      for (j = 0; j < pd.tmpdungeon[i].levels; ++j) {
        await Fread($sat(pd.tmplevel, cl), 48, 1, dgn_file);
      }
      for (j = 0; j < pd.tmpdungeon[i].branches; ++j) {
        await Fread($sat(pd.tmpbranch, cb), 40, 1, dgn_file);
      }
      --G.n_dgns;
      --i;
      continue;
    }
    strcpy(P(G.dungeons[i].dname), P(pd.tmpdungeon[i].name));
    strcpy(P(G.dungeons[i].proto), P(pd.tmpdungeon[i].protoname));
    G.dungeons[i].boneid = pd.tmpdungeon[i].boneschar;
    if (pd.tmpdungeon[i].lev.rand) {
      G.dungeons[i].num_dunlevs = rn2(pd.tmpdungeon[i].lev.rand) + pd.tmpdungeon[i].lev.base << 24 >> 24;
    } else {
      G.dungeons[i].num_dunlevs = pd.tmpdungeon[i].lev.base << 24 >> 24;
    }
    if (!i) {
      G.dungeons[i].ledger_start = 0;
      G.dungeons[i].depth_start = 1;
      G.dungeons[i].dunlev_ureached = 1;
    } else {
      G.dungeons[i].ledger_start = G.dungeons[i - 1].ledger_start + G.dungeons[i - 1].num_dunlevs;
      G.dungeons[i].dunlev_ureached = 0;
    }
    G.dungeons[i].flags.hellish = ((!!(pd.tmpdungeon[i].flags & HELLISH) ? 1 : 0) >>> 0) & 1;
    G.dungeons[i].flags.maze_like = ((!!(pd.tmpdungeon[i].flags & MAZELIKE) ? 1 : 0) >>> 0) & 1;
    G.dungeons[i].flags.rogue_like = ((!!(pd.tmpdungeon[i].flags & ROGUELIKE) ? 1 : 0) >>> 0) & 1;
    G.dungeons[i].flags.align = (((pd.tmpdungeon[i].flags & D_ALIGN_MASK) >> 4) >>> 0) & 7;
    if (pd.tmpdungeon[i].entry_lev < 0) {
      G.dungeons[i].entry_lev = G.dungeons[i].num_dunlevs + pd.tmpdungeon[i].entry_lev + 1 << 24 >> 24;
      if (G.dungeons[i].entry_lev <= 0) {
        G.dungeons[i].entry_lev = 1;
      }
    } else if (pd.tmpdungeon[i].entry_lev > 0) {
      G.dungeons[i].entry_lev = pd.tmpdungeon[i].entry_lev << 24 >> 24;
      if (G.dungeons[i].entry_lev > G.dungeons[i].num_dunlevs) {
        G.dungeons[i].entry_lev = G.dungeons[i].num_dunlevs;
      }
    } else {
      G.dungeons[i].entry_lev = 1;
    }
    if (i) {
      let br = null;
      let from_depth = 0;
      let from_up = 0;
      br = await add_branch(i, G.dungeons[i].entry_lev, pd);
      if (br.end1.dnum === i) {
        from_depth = depth(br.end2);
        from_up = (!br.end1_up ? 1 : 0) << 24 >> 24;
      } else {
        from_depth = depth(br.end1);
        from_up = br.end1_up;
      }
      G.dungeons[i].depth_start = from_depth + (br.type === BR_PORTAL ? 0 : from_up ? -1 : 1) - (G.dungeons[i].entry_lev - 1);
    }
    if (G.dungeons[i].num_dunlevs > MAXLEVEL) {
      G.dungeons[i].num_dunlevs = MAXLEVEL;
    }
    pd.start = pd.n_levs;
    pd.n_levs += pd.tmpdungeon[i].levels;
    if (pd.n_levs > LEV_LIMIT) {
      await panic(S("init_dungeon: too many special levels"));
    }
    for (; cl < pd.n_levs; ++cl) {
      await Fread($sat(pd.tmplevel, cl), 48, 1, dgn_file);
      await init_level(i, cl, pd);
    }
    if (!await place_level(pd.start, pd)) {
      await panic(S("init_dungeon:  couldn't place levels"));
    }
    for (; pd.start < pd.n_levs; ++pd.start) {
      if (pd.final_lev[pd.start]) {
        add_level(pd.final_lev[pd.start]);
      }
    }
    pd.n_brs += pd.tmpdungeon[i].branches;
    if (pd.n_brs > BRANCH_LIMIT) {
      await panic(S("init_dungeon: too many branches"));
    }
    for (; cb < pd.n_brs; ++cb) {
      await Fread($sat(pd.tmpbranch, cb), 40, 1, dgn_file);
    }
  }
  dlb_fclose(dgn_file);
  for (i = 0; i < 5; ++i) {
    G.tune[i] = 65 + rn2(7) << 24 >> 24;
  }
  G.tune[5] = 0;
  for (lev_map = G.level_map[0]; lev_map.lev_name.a[lev_map.lev_name.o]; lev_map = $sadd(lev_map, 1)) {
    x = find_level(lev_map.lev_name);
    if (x) {
      assign_level(lev_map.lev_spec, x.dlevel);
      if (!strncmp(lev_map.lev_name, S("x-"), 2)) {
        sprintf(P(x.proto), S("%s%s"), G.urole.filecode, lev_map.lev_name.add(1));
      } else if (lev_map.lev_spec === G.dungeon_topology.d_knox_level) {
        let br = null;
        for (br = branches; br; br = br.next) {
          if (on_level(br.end2, G.dungeon_topology.d_knox_level)) {
            break;
          }
        }
        if (br) {
          br.end1.dnum = G.n_dgns << 24 >> 24;
        }
        await insert_branch(br, TRUE);
      }
    }
  }
  G.dungeon_topology.d_quest_dnum = await dname_to_dnum(S("The Quest"));
  G.dungeon_topology.d_sokoban_dnum = await dname_to_dnum(S("Sokoban"));
  G.dungeon_topology.d_mines_dnum = await dname_to_dnum(S("The Gnomish Mines"));
  G.dungeon_topology.d_tower_dnum = await dname_to_dnum(S("Vlad's Tower"));
  if (!!(x = find_level(S("dummy")))) {
    i = x.dlevel.dnum;
    if (dunlevs_in_dungeon(x.dlevel) > 1 - G.dungeons[i].depth_start) {
      ($t1 = G.dungeons[i], $t1.depth_start = $t1.depth_start - 1);
    }
  }
  await dumpit();
}

export function dunlev(lev: struct_d_level | null): number {
  return lev.dlevel;
}

export function dunlevs_in_dungeon(lev: struct_d_level | null): number {
  return G.dungeons[lev.dnum].num_dunlevs;
}

export function deepest_lev_reached(noquest: number): number {
  let i = 0;
  let tmp = new struct_d_level();
  let ret = 0;
  for (i = 0; i < G.n_dgns; ++i) {
    if (noquest && i === G.dungeon_topology.d_quest_dnum) {
      continue;
    }
    tmp.dlevel = G.dungeons[i].dunlev_ureached;
    if (tmp.dlevel === 0) {
      continue;
    }
    tmp.dnum = i << 24 >> 24;
    if (depth(tmp) > ret) {
      ret = depth(tmp);
    }
  }
  return ret;
}

export function ledger_no(lev: struct_d_level | null): number {
  return lev.dlevel + G.dungeons[lev.dnum].ledger_start << 24 >> 24;
}

export function maxledgerno(): number {
  return G.dungeons[G.n_dgns - 1].ledger_start + G.dungeons[G.n_dgns - 1].num_dunlevs << 24 >> 24;
}

export async function ledger_to_dnum(ledgerno: number): Promise<number> {
  let i = 0;
  for (i = 0; i < G.n_dgns; ++i) {
    if (G.dungeons[i].ledger_start < ledgerno && ledgerno <= G.dungeons[i].ledger_start + G.dungeons[i].num_dunlevs) {
      return i << 24 >> 24;
    }
  }
  await panic(S("level number out of range [ledger_to_dnum(%d)]"), ledgerno);
  return 0;
}

export async function ledger_to_dlev(ledgerno: number): Promise<number> {
  return ledgerno - G.dungeons[await ledger_to_dnum(ledgerno)].ledger_start << 24 >> 24;
}

export function depth(lev: struct_d_level | null): number {
  return G.dungeons[lev.dnum].depth_start + lev.dlevel - 1 << 24 >> 24;
}

export function on_level(lev1: struct_d_level | null, lev2: struct_d_level | null): number {
  return (lev1.dnum === lev2.dnum && lev1.dlevel === lev2.dlevel ? 1 : 0) << 24 >> 24;
}

export function Is_special(lev: struct_d_level | null): struct_s_level | null {
  let levtmp = null;
  for (levtmp = G.sp_levchn; levtmp; levtmp = levtmp.next) {
    if (on_level(lev, levtmp.dlevel)) {
      return levtmp;
    }
  }
  return null;
}

export function Is_branchlev(lev: struct_d_level | null): struct_branch | null {
  let curr = null;
  for (curr = branches; curr; curr = curr.next) {
    if (on_level(lev, curr.end1) || on_level(lev, curr.end2)) {
      return curr;
    }
  }
  return null;
}

export function builds_up(lev: struct_d_level | null): number {
  let dptr = $sat(G.dungeons, lev.dnum);
  return (dptr.num_dunlevs > 1 && dptr.entry_lev === dptr.num_dunlevs ? 1 : 0) << 24 >> 24;
}

export async function next_level(at_stairs: number): Promise<void> {
  if (at_stairs && G.u.ux === G.sstairs.sx && G.u.uy === G.sstairs.sy) {
    await goto_level(G.sstairs.tolev, at_stairs, FALSE, FALSE);
  } else {
    let newlevel = new struct_d_level();
    newlevel.dnum = G.u.uz.dnum;
    newlevel.dlevel = G.u.uz.dlevel + 1 << 24 >> 24;
    await goto_level(newlevel, at_stairs, !at_stairs ? 1 : 0, FALSE);
  }
}

export async function prev_level(at_stairs: number): Promise<void> {
  if (at_stairs && G.u.ux === G.sstairs.sx && G.u.uy === G.sstairs.sy) {
    if (!G.u.uz.dnum && G.u.uz.dlevel === 1 && !G.u.uhave.amulet) {
      await done(ESCAPED);
    } else {
      await goto_level(G.sstairs.tolev, at_stairs, FALSE, FALSE);
    }
  } else {
    let newlevel = new struct_d_level();
    newlevel.dnum = G.u.uz.dnum;
    newlevel.dlevel = G.u.uz.dlevel - 1 << 24 >> 24;
    await goto_level(newlevel, at_stairs, FALSE, FALSE);
  }
}

export async function u_on_newpos(x: number, y: number): Promise<void> {
  if (!isok(x, y)) {
    let func = null;
    func = x < 0 || y < 0 || x > COLNO - 1 || y > ROWNO - 1 ? panic : impossible;
    await func(S("u_on_newpos: trying to place hero off map <%d,%d>"), x, y);
  }
  G.u.ux = x << 24 >> 24;
  G.u.uy = y << 24 >> 24;
  await G.windowprocs.win_cliparound(G.u.ux, G.u.uy);
  if (G.u.usteed) {
    G.u.usteed.mx = G.u.ux, G.u.usteed.my = G.u.uy;
  }
  if (!on_level(G.u.uz, G.u.uz0)) {
    G.u.ux0 = G.u.ux, G.u.uy0 = G.u.uy;
  }
}

export async function u_on_rndspot(upflag: number): Promise<void> {
  let up = upflag & 1;
  let was_in_W_tower = upflag & 2;
  if (was_in_W_tower && On_W_tower_level(G.u.uz)) {
    await place_lregion(G.dndest.nlx, G.dndest.nly, G.dndest.nhx, G.dndest.nhy, 0, 0, 0, 0, LR_DOWNTELE, null);
  } else if (up) {
    await place_lregion(G.updest.lx, G.updest.ly, G.updest.hx, G.updest.hy, G.updest.nlx, G.updest.nly, G.updest.nhx, G.updest.nhy, LR_UPTELE, null);
  } else {
    await place_lregion(G.dndest.lx, G.dndest.ly, G.dndest.hx, G.dndest.hy, G.dndest.nlx, G.dndest.nly, G.dndest.nhx, G.dndest.nhy, LR_DOWNTELE, null);
  }
  await switch_terrain();
}

export async function u_on_sstairs(upflag: number): Promise<void> {
  if (G.sstairs.sx) {
    await u_on_newpos(G.sstairs.sx, G.sstairs.sy);
  } else {
    await u_on_rndspot(upflag);
  }
}

export async function u_on_upstairs(): Promise<void> {
  if (G.upstair.sx) {
    await u_on_newpos(G.upstair.sx, G.upstair.sy);
  } else {
    await u_on_sstairs(0);
  }
}

export async function u_on_dnstairs(): Promise<void> {
  if (G.dnstair.sx) {
    await u_on_newpos(G.dnstair.sx, G.dnstair.sy);
  } else {
    await u_on_sstairs(1);
  }
}

export function On_stairs(x: number, y: number): number {
  return (x === G.upstair.sx && y === G.upstair.sy || x === G.dnstair.sx && y === G.dnstair.sy || x === G.dnladder.sx && y === G.dnladder.sy || x === G.upladder.sx && y === G.upladder.sy || x === G.sstairs.sx && y === G.sstairs.sy ? 1 : 0) << 24 >> 24;
}

export function Is_botlevel(lev: struct_d_level | null): number {
  return (lev.dlevel === G.dungeons[lev.dnum].num_dunlevs ? 1 : 0) << 24 >> 24;
}

export function Can_dig_down(lev: struct_d_level | null): number {
  return (!G.level.flags.hardfloor && !Is_botlevel(lev) && !Invocation_lev(lev) ? 1 : 0) << 24 >> 24;
}

export function Can_fall_thru(lev: struct_d_level | null): number {
  return (Can_dig_down(lev) || (G.dungeon_topology.d_stronghold_level.dlevel || G.dungeon_topology.d_stronghold_level.dnum) && on_level(lev, G.dungeon_topology.d_stronghold_level) ? 1 : 0) << 24 >> 24;
}

export async function Can_rise_up(x: number, y: number, lev: struct_d_level | null): Promise<number> {
  if (lev.dnum === G.dungeon_topology.d_astral_level.dnum || lev.dnum === G.dungeon_topology.d_sokoban_dnum || (G.dungeon_topology.d_wiz1_level.dlevel || G.dungeon_topology.d_wiz1_level.dnum) && on_level(lev, G.dungeon_topology.d_wiz1_level) && await In_W_tower(x, y, lev)) {
    return FALSE;
  }
  return (lev.dlevel > 1 || G.dungeons[lev.dnum].entry_lev === 1 && ledger_no(lev) !== 1 && G.sstairs.sx && G.sstairs.up ? 1 : 0) << 24 >> 24;
}

export function has_ceiling(lev: struct_d_level | null): number {
  return (!((G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(lev, G.dungeon_topology.d_air_level)) && !((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(lev, G.dungeon_topology.d_water_level)) ? 1 : 0) << 24 >> 24;
}

export async function get_level(newlevel: struct_d_level | null, levnum: number): Promise<void> {
  let br = null;
  let dgn = G.u.uz.dnum;
  if (levnum <= 0) {
    levnum = G.u.uz.dlevel;
  } else if (levnum > G.dungeons[dgn].depth_start + G.dungeons[dgn].num_dunlevs - 1) {
    levnum = G.dungeons[dgn].num_dunlevs;
  } else {
    if (levnum < G.dungeons[dgn].depth_start) {
      do {
        for (br = branches; br; br = br.next) {
          if (br.end2.dnum === dgn) {
            break;
          }
        }
        if (!br) {
          await panic(S("get_level: can't find parent dungeon"));
        }
        dgn = br.end1.dnum;
      } while (levnum < G.dungeons[dgn].depth_start);
    }
    levnum = levnum - G.dungeons[dgn].depth_start + 1;
  }
  newlevel.dnum = dgn;
  newlevel.dlevel = levnum << 24 >> 24;
}

export function In_quest(lev: struct_d_level | null): number {
  return (lev.dnum === G.dungeon_topology.d_quest_dnum ? 1 : 0) << 24 >> 24;
}

export function In_mines(lev: struct_d_level | null): number {
  return (lev.dnum === G.dungeon_topology.d_mines_dnum ? 1 : 0) << 24 >> 24;
}

export async function dungeon_branch(s: Ptr | null): Promise<struct_branch | null> {
  let br = null;
  let dnum = 0;
  dnum = await dname_to_dnum(s);
  for (br = branches; br; br = br.next) {
    if (br.end2.dnum === dnum) {
      break;
    }
  }
  if (!br) {
    await panic(S("dgn_entrance: can't find entrance to %s"), s);
  }
  return br;
}

export async function at_dgn_entrance(s: Ptr | null): Promise<number> {
  let br = null;
  br = await dungeon_branch(s);
  return (on_level(G.u.uz, br.end1) ? TRUE : FALSE) << 24 >> 24;
}

export function In_V_tower(lev: struct_d_level | null): number {
  return (lev.dnum === G.dungeon_topology.d_tower_dnum ? 1 : 0) << 24 >> 24;
}

export function On_W_tower_level(lev: struct_d_level | null): number {
  return ((G.dungeon_topology.d_wiz1_level.dlevel || G.dungeon_topology.d_wiz1_level.dnum) && on_level(lev, G.dungeon_topology.d_wiz1_level) || (G.dungeon_topology.d_wiz2_level.dlevel || G.dungeon_topology.d_wiz2_level.dnum) && on_level(lev, G.dungeon_topology.d_wiz2_level) || (G.dungeon_topology.d_wiz3_level.dlevel || G.dungeon_topology.d_wiz3_level.dnum) && on_level(lev, G.dungeon_topology.d_wiz3_level) ? 1 : 0) << 24 >> 24;
}

export async function In_W_tower(x: number, y: number, lev: struct_d_level | null): Promise<number> {
  if (!On_W_tower_level(lev)) {
    return FALSE;
  }
  if (G.dndest.nlx > 0) {
    return (x >= G.dndest.nlx && x <= G.dndest.nhx && y >= G.dndest.nly && y <= G.dndest.nhy ? 1 : 0) << 24 >> 24;
  } else {
    await impossible(S("No boundary for Wizard's Tower?"));
  }
  return FALSE;
}

export function In_hell(lev: struct_d_level | null): number {
  return G.dungeons[lev.dnum].flags.hellish << 24 >> 24;
}

export function find_hell(lev: struct_d_level | null): void {
  lev.dnum = G.dungeon_topology.d_valley_level.dnum;
  lev.dlevel = 1;
}

export async function goto_hell(at_stairs: number, falling: number): Promise<void> {
  let lev = new struct_d_level();
  find_hell(lev);
  await goto_level(lev, at_stairs, falling, FALSE);
}

export function assign_level(dest: struct_d_level | null, src: struct_d_level | null): void {
  dest.dnum = src.dnum;
  dest.dlevel = src.dlevel;
}

export function assign_rnd_level(dest: struct_d_level | null, src: struct_d_level | null, range: number): void {
  dest.dnum = src.dnum;
  dest.dlevel = src.dlevel + (range > 0 ? rnd(range) : -rnd(-range)) << 24 >> 24;
  if (dest.dlevel > dunlevs_in_dungeon(dest)) {
    dest.dlevel = dunlevs_in_dungeon(dest);
  } else if (dest.dlevel < 1) {
    dest.dlevel = 1;
  }
}

export function induced_align(pct: number): number {
  let lev = Is_special(G.u.uz);
  let al = 0;
  if (lev && lev.flags.align | 0) {
    if (rn2(100) < pct) {
      return lev.flags.align | 0;
    }
  }
  if (G.dungeons[G.u.uz.dnum].flags.align) {
    if (rn2(100) < pct) {
      return G.dungeons[G.u.uz.dnum].flags.align | 0;
    }
  }
  al = rn2(3) - 1 << 24 >> 24;
  return al === -128 ? 0 : al === 1 ? 4 : al + 2;
}

export function Invocation_lev(lev: struct_d_level | null): number {
  return (In_hell(lev) && lev.dlevel === G.dungeons[lev.dnum].num_dunlevs - 1 ? 1 : 0) << 24 >> 24;
}

export function level_difficulty(): number {
  let res = 0;
  if (G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum) {
    res = depth(G.dungeon_topology.d_sanctum_level) + (G.u.ulevel / 2 | 0);
  } else if (G.u.uhave.amulet) {
    res = deepest_lev_reached(FALSE);
  } else {
    res = depth(G.u.uz);
    if (builds_up(G.u.uz)) {
      res += 2 * (G.dungeons[G.u.uz.dnum].entry_lev - G.u.uz.dlevel + 1);
    }
  }
  return res << 24 >> 24;
}

export async function lev_by_name(nam: Ptr | null): Promise<number> {
  let lev = 0;
  let slev = null;
  let dlev = new struct_d_level();
  let p = null;
  let idx = 0;
  let idxtoo = 0;
  let buf = new Int8Array(256);
  let mseen = null;
  if (!!(mseen = find_mapseen_by_str(nam))) {
    dlev.$cp(mseen.lev);
  } else {
    if (!strncmpi(nam, S("the "), 4)) {
      nam = nam.add(4);
    }
    if (!!(p = strstri(nam, S(" level"))) && $peq(p, eos(nam).add(-6))) {
      nam = strcpy(P(buf), nam);
      $wr(eos(P(buf)).add(-6), 0, 0);
    }
    if (!strncmpi(nam, S("gehennom"), -1) || !strncmpi(nam, S("hell"), -1)) {
      if (In_V_tower(G.u.uz)) {
        nam = S(" to Vlad's tower");
      } else {
        nam = S("valley");
      }
    }
    if (!!(slev = find_level(nam))) {
      dlev.$cp(slev.dlevel);
    }
  }
  if (mseen || slev) {
    idx = ledger_no(dlev);
    if ((dlev.dnum === G.u.uz.dnum || G.u.uz.dnum === G.dungeon_topology.d_valley_level.dnum && dlev.dnum === G.dungeon_topology.d_medusa_level.dnum || G.u.uz.dnum === G.dungeon_topology.d_medusa_level.dnum && dlev.dnum === G.dungeon_topology.d_valley_level.dnum) && (G.flags.debug || (G.level_info[idx].flags & (FORGOTTEN | VISITED)) === VISITED)) {
      lev = depth(dlev);
    }
  } else {
    idx = await find_branch(nam, null);
    if (idx < 0 && !!(p = strstri(nam, S(" to ")))) {
      idx = await find_branch(p.add(4), null);
    }
    if (idx >= 0) {
      idxtoo = idx >> 8 & 255;
      idx &= 255;
      if (G.flags.debug || (G.level_info[idx].flags & (FORGOTTEN | VISITED)) === VISITED && (G.level_info[idxtoo].flags & (FORGOTTEN | VISITED)) === VISITED) {
        if (await ledger_to_dnum(idxtoo) === G.u.uz.dnum) {
          idx = idxtoo;
        }
        dlev.dnum = await ledger_to_dnum(idx);
        dlev.dlevel = await ledger_to_dlev(idx);
        lev = depth(dlev);
      }
    }
  }
  return lev;
}

function unplaced_floater(dptr: struct_dungeon | null): number {
  let br = null;
  let idx = $sdiff(dptr, G.dungeons[0]) | 0;
  if (idx !== G.dungeon_topology.d_knox_level.dnum) {
    return FALSE;
  }
  for (br = branches; br; br = br.next) {
    if (br.end1.dnum === G.n_dgns && br.end2.dnum === idx) {
      return TRUE;
    }
  }
  return FALSE;
}

function unreachable_level(lvl_p: struct_d_level | null, unplaced: number): number {
  let dummy = null;
  if (unplaced) {
    return TRUE;
  }
  if (G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum && !(lvl_p.dnum === G.dungeon_topology.d_astral_level.dnum)) {
    return TRUE;
  }
  if (!!(dummy = find_level(S("dummy"))) && on_level(lvl_p, dummy.dlevel)) {
    return TRUE;
  }
  return FALSE;
}

async function tport_menu(win: number, entry: Ptr | null, lchoices: struct_lchoice | null, lvl_p: struct_d_level | null, unreachable: number): Promise<void> {
  let tmpbuf = new Int8Array(256);
  let any = new union_any();
  lchoices.lev[lchoices.idx] = lvl_p.dlevel;
  lchoices.dgn[lchoices.idx] = lvl_p.dnum;
  lchoices.playerlev[lchoices.idx] = depth(lvl_p);
  any.$cp(G.zeroany);
  if (unreachable) {
    sprintf(P(tmpbuf), S("    %s"), entry);
    entry = P(tmpbuf);
  } else {
    any.a_int = lchoices.idx + 1;
  }
  await G.windowprocs.win_add_menu(win, NO_GLYPH, any, lchoices.menuletter, 0, ATR_NONE, entry, MENU_UNSELECTED);
  if (lchoices.menuletter === 122) {
    lchoices.menuletter = 65;
  } else {
    lchoices.menuletter = lchoices.menuletter + 1 << 24 >> 24;
  }
  ++lchoices.idx;
  return;
}

function br_string(type: number): Ptr | null {
  switch (type) {
  case 3:
    return S("Portal");
  case 1:
    return S("Connection");
  case 2:
    return S("One way stair");
  case 0:
    return S("Stair");
  }
  return S(" (unknown)");
}

function chr_u_on_lvl(dlev: struct_d_level | null): number {
  return (G.u.uz.dnum === dlev.dnum && G.u.uz.dlevel === dlev.dlevel ? 42 : 32) << 24 >> 24;
}

async function print_branch(win: number, dnum: number, lower_bound: number, upper_bound: number, bymenu: number, lchoices_p: struct_lchoice | null): Promise<void> {
  let br = null;
  let buf = new Int8Array(256);
  for (br = branches; br; br = br.next) {
    if (br.end1.dnum === dnum && lower_bound < br.end1.dlevel && br.end1.dlevel <= upper_bound) {
      sprintf(P(buf), S("%c %s to %s: %d"), bymenu ? chr_u_on_lvl(br.end1) : 32, br_string(br.type), P(G.dungeons[br.end2.dnum].dname), depth(br.end1));
      if (bymenu) {
        await tport_menu(win, P(buf), lchoices_p, br.end1, unreachable_level(br.end1, FALSE));
      } else {
        await G.windowprocs.win_putstr(win, 0, P(buf));
      }
    }
  }
}

export async function print_dungeon(bymenu: number, rlev: Ptr | null, rdgn: Ptr | null): Promise<number> {
  let i = 0;
  let last_level = 0;
  let nlev = 0;
  let buf = new Int8Array(256);
  let descr = null;
  let first = 0;
  let unplaced = 0;
  let slev = null;
  let dptr = null;
  let br = null;
  let any = new union_any();
  let lchoices = new struct_lchoice();
  let win = await G.windowprocs.win_create_nhwindow(NHW_MENU);
  if (bymenu) {
    await G.windowprocs.win_start_menu(win);
    lchoices.idx = 0;
    lchoices.menuletter = 97;
  }
  for (i = 0, dptr = G.dungeons[0]; i < G.n_dgns; ++i, dptr = $sadd(dptr, 1)) {
    if (bymenu && G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum && i !== G.dungeon_topology.d_astral_level.dnum) {
      continue;
    }
    unplaced = unplaced_floater(dptr);
    descr = unplaced ? S("depth") : S("level");
    nlev = dptr.num_dunlevs;
    if (nlev > 1) {
      sprintf(P(buf), S("%s: %s %d to %d"), P(dptr.dname), await makeplural(descr), dptr.depth_start, dptr.depth_start + nlev - 1);
    } else {
      sprintf(P(buf), S("%s: %s %d"), P(dptr.dname), descr, dptr.depth_start);
    }
    if (dptr.entry_lev !== 1) {
      if (dptr.entry_lev === nlev) {
        strcat(P(buf), S(", entrance from below"));
      } else {
        sprintf(eos(P(buf)), S(", entrance on %d"), dptr.depth_start + dptr.entry_lev - 1);
      }
    }
    if (bymenu) {
      any.$cp(G.zeroany);
      await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 0, 0, G.iflags.menu_headings, P(buf), MENU_UNSELECTED);
    } else {
      await G.windowprocs.win_putstr(win, 0, P(buf));
    }
    for (slev = G.sp_levchn, last_level = 0; slev; slev = slev.next) {
      if (slev.dlevel.dnum !== i) {
        continue;
      }
      await print_branch(win, i, last_level, slev.dlevel.dlevel, bymenu, lchoices);
      sprintf(P(buf), S("%c %s: %d"), chr_u_on_lvl(slev.dlevel), P(slev.proto), depth(slev.dlevel));
      if ((G.dungeon_topology.d_stronghold_level.dlevel || G.dungeon_topology.d_stronghold_level.dnum) && on_level(slev.dlevel, G.dungeon_topology.d_stronghold_level)) {
        sprintf(eos(P(buf)), S(" (tune %s)"), P(G.tune));
      }
      if (bymenu) {
        await tport_menu(win, P(buf), lchoices, slev.dlevel, unreachable_level(slev.dlevel, unplaced));
      } else {
        await G.windowprocs.win_putstr(win, 0, P(buf));
      }
      last_level = slev.dlevel.dlevel;
    }
    await print_branch(win, i, last_level, MAXLEVEL, bymenu, lchoices);
  }
  if (bymenu) {
    let n = 0;
    const selected = [null];
    let idx = 0;
    await G.windowprocs.win_end_menu(win, S("Level teleport to where:"));
    n = await G.windowprocs.win_select_menu(win, PICK_ONE, P(selected, 0));
    await G.windowprocs.win_destroy_nhwindow(win);
    if (n > 0) {
      idx = selected[0].item.a_int - 1;
      free(selected[0]);
      if (rlev && rdgn) {
        rlev.a[rlev.o] = lchoices.lev[idx];
        rdgn.a[rdgn.o] = lchoices.dgn[idx];
        return lchoices.playerlev[idx];
      }
    }
    return 0;
  }
  for (first = TRUE, br = branches; br; br = br.next) {
    if (br.end1.dnum === G.n_dgns) {
      if (first) {
        await G.windowprocs.win_putstr(win, 0, S(""));
        await G.windowprocs.win_putstr(win, 0, S("Floating branches"));
        first = FALSE;
      }
      sprintf(P(buf), S("   %s to %s"), br_string(br.type), P(G.dungeons[br.end2.dnum].dname));
      await G.windowprocs.win_putstr(win, 0, P(buf));
    }
  }
  if (Invocation_lev(G.u.uz)) {
    await G.windowprocs.win_putstr(win, 0, S(""));
    sprintf(P(buf), S("Invocation position @ (%d,%d), hero @ (%d,%d)"), G.inv_pos.x, G.inv_pos.y, G.u.ux, G.u.uy);
    await G.windowprocs.win_putstr(win, 0, P(buf));
  } else {
    let trap = null;
    $wr(P(buf), 0, 0);
    for (trap = G.ftrap; trap; trap = trap.ntrap) {
      if ((trap.ttyp | 0) === MAGIC_PORTAL) {
        break;
      }
    }
    if (trap) {
      sprintf(P(buf), S("Portal @ (%d,%d), hero @ (%d,%d)"), trap.tx, trap.ty, G.u.ux, G.u.uy);
    } else if ((G.dungeon_topology.d_earth_level.dlevel || G.dungeon_topology.d_earth_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_earth_level) || (G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level) || (G.dungeon_topology.d_fire_level.dlevel || G.dungeon_topology.d_fire_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_fire_level) || (G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level) || (G.dungeon_topology.d_qstart_level.dlevel || G.dungeon_topology.d_qstart_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_qstart_level) || await at_dgn_entrance(S("The Quest")) || (G.dungeon_topology.d_knox_level.dlevel || G.dungeon_topology.d_knox_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_knox_level)) {
      strcpy(P(buf), S("No portal found."));
    }
    if ($rd(P(buf))) {
      await G.windowprocs.win_putstr(win, 0, S(""));
      await G.windowprocs.win_putstr(win, 0, P(buf));
    }
  }
  await G.windowprocs.win_display_nhwindow(win, TRUE);
  await G.windowprocs.win_destroy_nhwindow(win);
  return 0;
}

export async function recbranch_mapseen(source: struct_d_level | null, dest: struct_d_level | null): Promise<void> {
  let mptr = null;
  let br = null;
  if (source.dnum === dest.dnum) {
    return;
  }
  for (br = branches; br; br = br.next) {
    if (on_level(source, br.end1) && on_level(dest, br.end2)) {
      break;
    }
    if (on_level(source, br.end2) && on_level(dest, br.end1)) {
      return;
    }
  }
  if (!br) {
    return;
  }
  if (!!(mptr = find_mapseen(source))) {
    if (mptr.br && br !== mptr.br) {
      await impossible(S("Two branches on the same level?"));
    }
    mptr.br = br;
  } else {
    await impossible(S("Can't note branch for unseen level (%d, %d)"), source.dnum, source.dlevel);
  }
}

export function get_annotation(lev: struct_d_level | null): Ptr | null {
  let mptr = null;
  if (mptr = find_mapseen(lev)) {
    return mptr.custom;
  }
  return null;
}

export async function donamelevel(): Promise<number> {
  let mptr = null;
  let nbuf = new Int8Array(256);
  if (!(mptr = find_mapseen(G.u.uz))) {
    return 0;
  }
  nbuf[0] = 0;
  if (mptr.custom) {
    let tmpbuf = new Int8Array(256);
    sprintf(P(tmpbuf), S("Replace annotation \"%.30s%s\" with?"), mptr.custom, strlen(mptr.custom) > 30 ? S("...") : S(""));
    await G.windowprocs.win_getlin(P(tmpbuf), P(nbuf));
  } else {
    await G.windowprocs.win_getlin(S("What do you want to call this dungeon level?"), P(nbuf));
  }
  if (!$rd(P(nbuf)) || $rd(P(nbuf)) === 27) {
    return 0;
  }
  mungspaces(P(nbuf));
  if (mptr.custom) {
    free(mptr.custom);
    mptr.custom = null;
    mptr.custom_lth = 0;
  }
  if ($rd(P(nbuf)) && strcmp(P(nbuf), S(" "))) {
    mptr.custom = await dupstr(P(nbuf));
    mptr.custom_lth = strlen(mptr.custom) >>> 0;
  }
  return 0;
}

function find_mapseen(lev: struct_d_level | null): struct_mapseen | null {
  let mptr = null;
  for (mptr = G.mapseenchn; mptr; mptr = mptr.next) {
    if (on_level(mptr.lev, lev)) {
      break;
    }
  }
  return mptr;
}

function find_mapseen_by_str(s: Ptr | null): struct_mapseen | null {
  let mptr = null;
  for (mptr = G.mapseenchn; mptr; mptr = mptr.next) {
    if (mptr.custom && !strncmpi(s, mptr.custom, -1)) {
      break;
    }
  }
  return mptr;
}

export function forget_mapseen(ledger_num: number): void {
  let mptr = null;
  let bp = null;
  for (mptr = G.mapseenchn; mptr; mptr = mptr.next) {
    if (G.dungeons[mptr.lev.dnum].ledger_start + mptr.lev.dlevel === ledger_num) {
      break;
    }
  }
  if (mptr) {
    mptr.flags.forgot = 1;
    mptr.br = null;
    if (mptr.custom) {
      mptr.custom_lth = 0;
      free(mptr.custom);
      mptr.custom = null;
    }
    memset(mptr.msrooms[0], 0, 328);
    for (bp = mptr.final_resting_place; bp; bp = bp.next) {
      bp.bonesknown = FALSE;
    }
  }
}

export function rm_mapseen(ledger_num: number): void {
  let mptr = null;
  let mprev = null;
  let bp = null;
  let bpnext = null;
  for (mptr = G.mapseenchn; mptr; mprev = mptr, mptr = mptr.next) {
    if (G.dungeons[mptr.lev.dnum].ledger_start + mptr.lev.dlevel === ledger_num) {
      break;
    }
  }
  if (!mptr) {
    return;
  }
  if (mptr.custom) {
    free(mptr.custom);
  }
  bp = mptr.final_resting_place;
  while (bp) {
    bpnext = bp.next;
    free(bp);
    bp = bpnext;
  }
  if (mprev) {
    mprev.next = mptr.next;
    free(mptr);
  } else {
    G.mapseenchn = mptr.next;
    free(mptr);
  }
}

async function save_mapseen(fd: number, mptr: struct_mapseen | null): Promise<void> {
  let curr = null;
  const brindx = new Int32Array(1);
  for (brindx[0] = 0, curr = branches; curr; curr = curr.next, ++brindx[0]) {
    if (curr === mptr.br) {
      break;
    }
  }
  await bwrite(fd, P(brindx, 0), 4);
  await bwrite(fd, mptr.lev, 2);
  await bwrite(fd, mptr.feat, 4);
  await bwrite(fd, mptr.flags, 4);
  await bwrite(fd, P(mptr, "custom_lth"), 4);
  if (mptr.custom_lth) {
    await bwrite(fd, mptr.custom, mptr.custom_lth);
  }
  await bwrite(fd, mptr.msrooms[0], 328);
  await savecemetery(fd, WRITE_SAVE, P(mptr, "final_resting_place"));
}

async function load_mapseen(fd: number): Promise<struct_mapseen | null> {
  const branchnum = new Int32Array(1);
  let brindx = 0;
  let load = null;
  let curr = null;
  load = new struct_mapseen();
  await mread(fd, P(branchnum, 0), 4);
  for (brindx = 0, curr = branches; curr; curr = curr.next, ++brindx) {
    if (brindx === branchnum[0]) {
      break;
    }
  }
  load.br = curr;
  await mread(fd, load.lev, 2);
  await mread(fd, load.feat, 4);
  await mread(fd, load.flags, 4);
  await mread(fd, P(load, "custom_lth"), 4);
  if (load.custom_lth) {
    load.custom = P(new Int8Array((load.custom_lth + 1 >>> 0)));
    await mread(fd, load.custom, load.custom_lth);
    load.custom.a[load.custom.o + load.custom_lth] = 0;
  } else {
    load.custom = null;
  }
  await mread(fd, load.msrooms[0], 328);
  await restcemetery(fd, P(load, "final_resting_place"));
  return load;
}

export async function overview_stats(win: number, statsfmt: Ptr | null, total_count: Ptr | null, total_size: Ptr | null): Promise<void> {
  let buf = new Int8Array(256);
  let hdrbuf = new Int8Array(128);
  let ocount = 0;
  let osize = 0;
  let bcount = 0;
  let bsize = 0;
  let acount = 0;
  let asize = 0;
  let ce = null;
  let mptr = find_mapseen(G.u.uz);
  ocount = bcount = acount = osize = bsize = asize = 0;
  for (mptr = G.mapseenchn; mptr; mptr = mptr.next) {
    ++ocount;
    osize += 384;
    for (ce = mptr.final_resting_place; ce; ce = ce.next) {
      ++bcount;
      bsize += 176;
    }
    if (mptr.custom_lth) {
      ++acount;
      asize += mptr.custom_lth + 1 >>> 0;
    }
  }
  sprintf(P(hdrbuf), S("general, size %ld"), 384);
  sprintf(P(buf), statsfmt, P(hdrbuf), ocount, osize);
  await G.windowprocs.win_putstr(win, 0, P(buf));
  if (bcount) {
    sprintf(P(hdrbuf), S("cemetery, size %ld"), 176);
    sprintf(P(buf), statsfmt, P(hdrbuf), bcount, bsize);
    await G.windowprocs.win_putstr(win, 0, P(buf));
  }
  if (acount) {
    sprintf(P(hdrbuf), S("annotations, text"));
    sprintf(P(buf), statsfmt, P(hdrbuf), acount, asize);
    await G.windowprocs.win_putstr(win, 0, P(buf));
  }
  total_count.a[total_count.o] += ocount + bcount + acount;
  total_size.a[total_size.o] += osize + bsize + asize;
}

export function remdun_mapseen(dnum: number): void {
  let mptr = null;
  let mptraddr = null;
  mptraddr = P(G, "mapseenchn");
  while (!!(mptr = mptraddr.a[mptraddr.o])) {
    if (mptr.lev.dnum === dnum) {
      mptr.flags.unreachable = 1;
    }
    mptraddr = P(mptr, "next");
  }
}

export async function init_mapseen(lev: struct_d_level | null): Promise<void> {
  let mptr = null;
  let init = null;
  let prev = null;
  init = new struct_mapseen();
  memset(init, 0, 384);
  init.next = null, init.br = null, init.custom = null;
  init.final_resting_place = null;
  memset(P(G.lastseentyp), 0, 1680);
  init.lev.dnum = lev.dnum;
  init.lev.dlevel = lev.dlevel;
  for (mptr = G.mapseenchn, prev = null; mptr; prev = mptr, mptr = mptr.next) {
    if (mptr.lev.dnum > init.lev.dnum || mptr.lev.dnum === init.lev.dnum && mptr.lev.dlevel > init.lev.dlevel) {
      break;
    }
  }
  if (!prev) {
    init.next = G.mapseenchn;
    G.mapseenchn = init;
  } else {
    mptr = prev.next;
    prev.next = init;
    init.next = mptr;
  }
}

function interest_mapseen(mptr: struct_mapseen | null): number {
  if (on_level(G.u.uz, mptr.lev)) {
    return TRUE;
  }
  if (mptr.flags.unreachable | 0 || mptr.flags.forgot | 0) {
    return FALSE;
  }
  if (mptr.flags.oracle | 0 || mptr.flags.bigroom | 0 || mptr.flags.roguelevel | 0 || mptr.flags.castle | 0 || mptr.flags.valley | 0 || mptr.flags.msanctum | 0 || mptr.flags.quest_summons | 0 || mptr.flags.questing | 0) {
    return TRUE;
  }
  if (mptr.lev.dnum === G.dungeon_topology.d_sokoban_dnum && (G.u.uz.dnum === G.dungeon_topology.d_sokoban_dnum || !mptr.flags.sokosolved)) {
    return TRUE;
  }
  if (G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum) {
    return (mptr.lev.dnum === G.dungeon_topology.d_astral_level.dnum ? 1 : 0) << 24 >> 24;
  }
  return (mptr.feat.nfount | 0 || mptr.feat.nsink | 0 || mptr.feat.nthrone | 0 || mptr.feat.naltar | 0 || mptr.feat.ngrave | 0 || mptr.feat.ntree | 0 || mptr.feat.nshop | 0 || mptr.feat.ntemple | 0 || mptr.final_resting_place && (mptr.flags.knownbones | 0 || G.flags.debug) || mptr.custom || mptr.br || mptr.lev.dlevel === G.dungeons[mptr.lev.dnum].dunlev_ureached ? 1 : 0) << 24 >> 24;
}

export async function recalc_mapseen(): Promise<void> {
  let mptr = null;
  let mtmp = null;
  let bp = null;
  let bonesaddr = null;
  let i = 0;
  let ridx = 0;
  let x = 0;
  let y = 0;
  let ltyp = 0;
  let count = 0;
  let atmp = 0;
  if (!(mptr = find_mapseen(G.u.uz))) {
    return;
  }
  memset(mptr.feat, 0, 4);
  if (mptr.flags.unreachable) {
    mptr.flags.unreachable = 0;
    if (In_quest(G.u.uz)) {
      let mptrtmp = G.mapseenchn;
      do {
        if (mptrtmp.lev.dnum === mptr.lev.dnum) {
          mptrtmp.flags.unreachable = 0;
        }
        mptrtmp = mptrtmp.next;
      } while (mptrtmp);
    }
  }
  mptr.flags.knownbones = 0;
  mptr.flags.sokosolved = ((G.u.uz.dnum === G.dungeon_topology.d_sokoban_dnum && !G.level.flags.sokoban_rules ? 1 : 0) >>> 0) & 1;
  if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
    mptr.flags.bigroom = (((G.dungeon_topology.d_bigroom_level.dlevel || G.dungeon_topology.d_bigroom_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_bigroom_level) ? 1 : 0) >>> 0) & 1;
  } else if (mptr.flags.forgot) {
    mptr.flags.bigroom = 0;
  }
  mptr.flags.roguelevel = (((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level) ? 1 : 0) >>> 0) & 1;
  mptr.flags.oracle = 0;
  mptr.flags.castletune = 0;
  mptr.flags.forgot = 0;
  mptr.flags.quest_summons = ((await at_dgn_entrance(S("The Quest")) && G.u.uevent.qcalled | 0 && !(G.u.uevent.qcompleted | 0 || G.u.uevent.qexpelled | 0 || G.quest_status.leader_is_dead | 0) ? 1 : 0) >>> 0) & 1;
  mptr.flags.questing = ((on_level(G.u.uz, G.dungeon_topology.d_qstart_level) && G.quest_status.got_quest | 0 ? 1 : 0) >>> 0) & 1;
  for (i = 0; i < (Math.trunc(5 / 1) | 0) >>> 0; i = i + 1 >>> 0) {
    if (!G.u.urooms[i]) {
      continue;
    }
    ridx = G.u.urooms[i] - ROOMOFFSET >>> 0;
    mptr.msrooms[ridx].seen = 1;
    mptr.msrooms[ridx].untended = ((G.rooms[ridx].rtype >= SHOPBASE ? !(mtmp = await shop_keeper(G.u.urooms[i])) || !inhishop(mtmp) ? 1 : 0 : G.rooms[ridx].rtype === TEMPLE ? !(mtmp = findpriest(G.u.urooms[i])) || !inhistemple(mtmp) ? 1 : 0 : 0) >>> 0) & 1;
  }
  for (i = 0; i < (Math.trunc(328 / 4) | 0) >>> 0; i = i + 1 >>> 0) {
    if (mptr.msrooms[i].seen) {
      if (G.rooms[i].rtype >= SHOPBASE) {
        if (mptr.msrooms[i].untended) {
          mptr.feat.shoptype = (SHOPBASE - 1) & 31;
        } else if (!mptr.feat.nshop) {
          mptr.feat.shoptype = (G.rooms[i].rtype >>> 0) & 31;
        } else if (mptr.feat.shoptype !== G.rooms[i].rtype >>> 0) {
          mptr.feat.shoptype = 0;
        }
        count = (mptr.feat.nshop | 0) + 1;
        if (count <= 3) {
          mptr.feat.nshop = (count >>> 0) & 3;
        }
      } else if (G.rooms[i].rtype === TEMPLE) {
        count = (mptr.feat.ntemple | 0) + 1;
        if (count <= 3) {
          mptr.feat.ntemple = (count >>> 0) & 3;
        }
      } else if (G.rooms[i].orig_rtype === DELPHI) {
        mptr.flags.oracle = 1;
      }
    }
  }
  for (x = 1; x < COLNO; ++x) {
    for (y = 0; y < ROWNO; ++y) {
      if ($rd(G.viz_array.a[G.viz_array.o + y], x) & 2 || x === G.u.ux && y === G.u.uy && !((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked)) {
        ltyp = $at2(G.level.locations, x, y).typ;
        if (ltyp === DRAWBRIDGE_UP) {
          ltyp = db_under_typ($at2(G.level.locations, x, y).flags | 0);
        }
        if (!!(mtmp = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null) && (mtmp.m_ap_type & 7) === M_AP_FURNITURE && ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected))) {
          ltyp = cmap_to_type(mtmp.mappearance | 0);
        }
        G.lastseentyp[x][y] = ltyp << 24 >> 24;
      }
      switch (G.lastseentyp[x][y]) {
      case TREE:
        count = (mptr.feat.ntree | 0) + 1;
        if (count <= 3) {
          mptr.feat.ntree = (count >>> 0) & 3;
        }
        break;
      case FOUNTAIN:
        count = (mptr.feat.nfount | 0) + 1;
        if (count <= 3) {
          mptr.feat.nfount = (count >>> 0) & 3;
        }
        break;
      case THRONE:
        count = (mptr.feat.nthrone | 0) + 1;
        if (count <= 3) {
          mptr.feat.nthrone = (count >>> 0) & 3;
        }
        break;
      case SINK:
        count = (mptr.feat.nsink | 0) + 1;
        if (count <= 3) {
          mptr.feat.nsink = (count >>> 0) & 3;
        }
        break;
      case GRAVE:
        count = (mptr.feat.ngrave | 0) + 1;
        if (count <= 3) {
          mptr.feat.ngrave = (count >>> 0) & 3;
        }
        break;
      case ALTAR:
        atmp = (G.dungeon_topology.d_astral_level.dlevel || G.dungeon_topology.d_astral_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_astral_level) && ($at2(G.level.locations, x, y).seenv & SVALL) !== SVALL ? MSA_NONE : ($at2(G.level.locations, x, y).flags | 0) === 4 ? 3 : ($at2(G.level.locations, x, y).flags | 0) & 7;
        if (!mptr.feat.naltar) {
          mptr.feat.msalign = (atmp >>> 0) & 3;
        } else if ((mptr.feat.msalign | 0) !== atmp) {
          mptr.feat.msalign = (MSA_NONE) & 3;
        }
        count = (mptr.feat.naltar | 0) + 1;
        if (count <= 3) {
          mptr.feat.naltar = (count >>> 0) & 3;
        }
        break;
      case DOOR:
        if ((G.dungeon_topology.d_knox_level.dlevel || G.dungeon_topology.d_knox_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_knox_level)) {
          let ty = 0;
          let tx = x - 4;
          for (ty = y - 1; ty <= y + 1; ++ty) {
            if (isok(tx, ty) && $at2(G.level.locations, tx, ty).typ === THRONE) {
              mptr.flags.ludios = 1;
              break;
            }
          }
          break;
        }
        if (is_drawbridge_wall(x, y) < 0) {
          break;
        }
      case DBWALL:
      case DRAWBRIDGE_DOWN:
        if ((G.dungeon_topology.d_stronghold_level.dlevel || G.dungeon_topology.d_stronghold_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_stronghold_level)) {
          mptr.flags.castle = 1, mptr.flags.castletune = 1;
        }
        break;
      default:
        break;
      }
    }
  }
  if (G.level.bonesinfo && !mptr.final_resting_place) {
    bonesaddr = P(mptr, "final_resting_place");
    bp = G.level.bonesinfo;
    do {
      bonesaddr.a[bonesaddr.o] = new struct_cemetery();
      bonesaddr.a[bonesaddr.o].$cp(bp);
      bp = bp.next;
      bonesaddr = P(bonesaddr.a[bonesaddr.o], "next");
    } while (bp);
    bonesaddr.a[bonesaddr.o] = null;
  }
  for (bp = mptr.final_resting_place; bp; bp = bp.next) {
    if (G.lastseentyp[bp.frpx][bp.frpy]) {
      bp.bonesknown = TRUE;
      mptr.flags.knownbones = 1;
    }
  }
}

export function mapseen_temple(priest: struct_monst | null): void {
  let mptr = find_mapseen(G.u.uz);
  if ((G.dungeon_topology.d_valley_level.dlevel || G.dungeon_topology.d_valley_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_valley_level)) {
    mptr.flags.valley = 1;
  } else if ((G.dungeon_topology.d_sanctum_level.dlevel || G.dungeon_topology.d_sanctum_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_sanctum_level)) {
    mptr.flags.msanctum = 1;
  }
}

export function room_discovered(roomno: number): void {
  let mptr = find_mapseen(G.u.uz);
  mptr.msrooms[roomno].seen = 1;
}

export async function dooverview(): Promise<number> {
  await show_overview(0, 0);
  return 0;
}

export async function show_overview(why: number, reason: number): Promise<void> {
  let win = 0;
  const lastdun = new Int32Array(1);
  lastdun[0] = -1;
  await recalc_mapseen();
  win = await G.windowprocs.win_create_nhwindow(NHW_MENU);
  if (G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum) {
    await traverse_mapseenchn(TRUE, win, why, reason, P(lastdun, 0));
  }
  if (why > 0 || !(G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum)) {
    await traverse_mapseenchn(FALSE, win, why, reason, P(lastdun, 0));
  }
  await G.windowprocs.win_display_nhwindow(win, TRUE);
  await G.windowprocs.win_destroy_nhwindow(win);
}

async function traverse_mapseenchn(viewendgame: number, win: number, why: number, reason: number, lastdun_p: Ptr | null): Promise<void> {
  let mptr = null;
  let showheader = 0;
  for (mptr = G.mapseenchn; mptr; mptr = mptr.next) {
    if (viewendgame ^ (mptr.lev.dnum === G.dungeon_topology.d_astral_level.dnum ? 1 : 0)) {
      continue;
    }
    if (why > 0 || interest_mapseen(mptr)) {
      showheader = (mptr.lev.dnum !== lastdun_p.a[lastdun_p.o] ? 1 : 0) << 24 >> 24;
      await print_mapseen(win, mptr, why, reason, showheader);
      lastdun_p.a[lastdun_p.o] = mptr.lev.dnum;
    }
  }
}

function seen_string(x: number, obj: Ptr | null): Ptr | null {
  switch (x) {
  case 0:
    return S("no");
  case 1:
    return strchr(P(G.vowels), obj.a[obj.o]) ? S("an") : S("a");
  case 2:
    return S("some");
  case 3:
    return S("many");
  }
  return S("(unknown)");
}

function br_string2(br: struct_branch | null): Ptr | null {
  let closed_portal = (br.end2.dnum === G.dungeon_topology.d_quest_dnum && G.u.uevent.qexpelled | 0 ? 1 : 0) << 24 >> 24;
  switch (br.type) {
  case 3:
    return closed_portal ? S("Sealed portal") : S("Portal");
  case 1:
    return S("Connection");
  case 2:
    return br.end1_up ? S("One way stairs up") : S("One way stairs down");
  case 0:
    return br.end1_up ? S("Stairs up") : S("Stairs down");
  }
  return S("(unknown)");
}

export function endgamelevelname(outbuf: Ptr | null, indx: number): Ptr | null {
  let planename = null;
  outbuf.a[outbuf.o] = 0;
  switch (indx) {
  case -5:
    strcpy(outbuf, S("Astral Plane"));
    break;
  case -4:
    planename = S("Water");
    break;
  case -3:
    planename = S("Fire");
    break;
  case -2:
    planename = S("Air");
    break;
  case -1:
    planename = S("Earth");
    break;
  }
  if (planename) {
    sprintf(outbuf, S("Plane of %s"), planename);
  } else if (!outbuf.a[outbuf.o]) {
    sprintf(outbuf, S("unknown plane #%d"), indx);
  }
  return outbuf;
}

function shop_string(rtype: number): Ptr | null {
  let str = S("shop");
  switch (rtype) {
  case SHOPBASE - 1:
    str = S("untended shop");
    break;
  case SHOPBASE:
    str = S("general store");
    break;
  case ARMORSHOP:
    str = S("armor shop");
    break;
  case SCROLLSHOP:
    str = S("scroll shop");
    break;
  case POTIONSHOP:
    str = S("potion shop");
    break;
  case WEAPONSHOP:
    str = S("weapon shop");
    break;
  case FOODSHOP:
    str = S("delicatessen");
    break;
  case RINGSHOP:
    str = S("jewelers");
    break;
  case WANDSHOP:
    str = S("wand shop");
    break;
  case BOOKSHOP:
    str = S("bookstore");
    break;
  case FODDERSHOP:
    str = S("health food store");
    break;
  case CANDLESHOP:
    str = S("lighting shop");
    break;
  default:
    break;
  }
  return str;
}

function tunesuffix(mptr: struct_mapseen | null, outbuf: Ptr | null): Ptr | null {
  outbuf.a[outbuf.o] = 0;
  if (mptr.flags.castletune | 0 && G.u.uevent.uheard_tune | 0) {
    let tmp = new Int8Array(256);
    if ((G.u.uevent.uheard_tune | 0) === 2) {
      sprintf(P(tmp), S("notes \"%s\""), P(G.tune));
    } else {
      strcpy(P(tmp), S("5-note tune"));
    }
    sprintf(outbuf, S(" (play %s to open or close drawbridge)"), P(tmp));
  }
  return outbuf;
}

async function print_mapseen(win: number, mptr: struct_mapseen | null, final: number, how: number, printdun: number): Promise<void> {
  let buf = new Int8Array(256);
  let tmpbuf = new Int8Array(256);
  let i = 0;
  let depthstart = 0;
  let dnum = 0;
  let died_here = (final === 2 && on_level(G.u.uz, mptr.lev) ? 1 : 0) << 24 >> 24;
  dnum = mptr.lev.dnum;
  if (dnum === G.dungeon_topology.d_quest_dnum || dnum === G.dungeon_topology.d_knox_level.dnum) {
    depthstart = 1;
  } else {
    depthstart = G.dungeons[dnum].depth_start;
  }
  if (printdun) {
    if (G.dungeons[dnum].dunlev_ureached === G.dungeons[dnum].entry_lev || mptr.lev.dnum === G.dungeon_topology.d_astral_level.dnum) {
      sprintf(P(buf), S("%s:"), P(G.dungeons[dnum].dname));
    } else if (builds_up(mptr.lev)) {
      sprintf(P(buf), S("%s: levels %d up to %d"), P(G.dungeons[dnum].dname), depthstart + G.dungeons[dnum].entry_lev - 1, depthstart + G.dungeons[dnum].dunlev_ureached - 1);
    } else {
      sprintf(P(buf), S("%s: levels %d to %d"), P(G.dungeons[dnum].dname), depthstart, depthstart + G.dungeons[dnum].dunlev_ureached - 1);
    }
    await G.windowprocs.win_putstr(win, !final ? ATR_INVERSE : 0, P(buf));
  }
  i = depthstart + mptr.lev.dlevel - 1;
  if (mptr.lev.dnum === G.dungeon_topology.d_astral_level.dnum) {
    sprintf(P(buf), S("%s%s:"), S("   "), endgamelevelname(P(tmpbuf), i));
  } else {
    sprintf(P(buf), S("%sLevel %d:"), S("   "), i);
  }
  if (G.flags.debug) {
    let slev = null;
    if (!!(slev = Is_special(mptr.lev))) {
      sprintf(eos(P(buf)), S(" [%s]"), P(slev.proto));
    }
  }
  if (mptr.custom) {
    sprintf(eos(P(buf)), S(" \"%s\""), mptr.custom);
  }
  if (on_level(G.u.uz, mptr.lev)) {
    sprintf(eos(P(buf)), S(" <- You %s here."), !final || final === 1 && how === ASCENDED ? S("are") : final === 1 && how === ESCAPED ? S("left from") : S("were"));
  }
  await G.windowprocs.win_putstr(win, !final ? ATR_BOLD : 0, P(buf));
  if (mptr.flags.forgot) {
    return;
  }
  if (mptr.feat.nfount | 0 || mptr.feat.nsink | 0 || mptr.feat.nthrone | 0 || mptr.feat.naltar | 0 || mptr.feat.ngrave | 0 || mptr.feat.ntree | 0 || mptr.feat.nshop | 0 || mptr.feat.ntemple | 0) {
    buf[0] = 0;
    i = 0;
    if ((mptr.feat.nshop | 0) > 0) {
      if ((mptr.feat.nshop | 0) > 1) {
        do {
          if (mptr.feat.nshop) {
            sprintf(eos(P(buf)), S("%s%s %s%s"), i++ > 0 ? S(", ") : S("      "), seen_string(mptr.feat.nshop | 0, S("shop")), S("shop"), (mptr.feat.nshop | 0) === 1 ? S("") : S("s"));
          }
        } while (0);
      } else {
        sprintf(eos(P(buf)), S("%s%s"), i++ > 0 ? S(", ") : S("      "), await an(shop_string(mptr.feat.shoptype | 0)));
      }
    }
    if ((mptr.feat.naltar | 0) > 0) {
      if ((mptr.feat.ntemple | 0) !== (mptr.feat.naltar | 0)) {
        do {
          if (mptr.feat.naltar) {
            sprintf(eos(P(buf)), S("%s%s %s%s"), i++ > 0 ? S(", ") : S("      "), seen_string(mptr.feat.naltar | 0, S("altar")), S("altar"), (mptr.feat.naltar | 0) === 1 ? S("") : S("s"));
          }
        } while (0);
      } else {
        do {
          if (mptr.feat.ntemple) {
            sprintf(eos(P(buf)), S("%s%s %s%s"), i++ > 0 ? S(", ") : S("      "), seen_string(mptr.feat.ntemple | 0, S("temple")), S("temple"), (mptr.feat.ntemple | 0) === 1 ? S("") : S("s"));
          }
        } while (0);
      }
      if ((!((mptr.feat.msalign | 0) === 3 ? 4 : mptr.feat.msalign | 0) ? -128 : ((mptr.feat.msalign | 0) === 3 ? 4 : mptr.feat.msalign | 0) === 4 ? 1 : ((mptr.feat.msalign | 0) === 3 ? 4 : mptr.feat.msalign | 0) - 2) << 24 >> 24 === G.u.ualign.type) {
        sprintf(eos(P(buf)), S(" to %s"), await align_gname(G.u.ualign.type));
      }
    }
    do {
      if (mptr.feat.nthrone) {
        sprintf(eos(P(buf)), S("%s%s %s%s"), i++ > 0 ? S(", ") : S("      "), seen_string(mptr.feat.nthrone | 0, S("throne")), S("throne"), (mptr.feat.nthrone | 0) === 1 ? S("") : S("s"));
      }
    } while (0);
    do {
      if (mptr.feat.nfount) {
        sprintf(eos(P(buf)), S("%s%s %s%s"), i++ > 0 ? S(", ") : S("      "), seen_string(mptr.feat.nfount | 0, S("fountain")), S("fountain"), (mptr.feat.nfount | 0) === 1 ? S("") : S("s"));
      }
    } while (0);
    do {
      if (mptr.feat.nsink) {
        sprintf(eos(P(buf)), S("%s%s %s%s"), i++ > 0 ? S(", ") : S("      "), seen_string(mptr.feat.nsink | 0, S("sink")), S("sink"), (mptr.feat.nsink | 0) === 1 ? S("") : S("s"));
      }
    } while (0);
    do {
      if (mptr.feat.ngrave) {
        sprintf(eos(P(buf)), S("%s%s %s%s"), i++ > 0 ? S(", ") : S("      "), seen_string(mptr.feat.ngrave | 0, S("grave")), S("grave"), (mptr.feat.ngrave | 0) === 1 ? S("") : S("s"));
      }
    } while (0);
    do {
      if (mptr.feat.ntree) {
        sprintf(eos(P(buf)), S("%s%s %s%s"), i++ > 0 ? S(", ") : S("      "), seen_string(mptr.feat.ntree | 0, S("tree")), S("tree"), (mptr.feat.ntree | 0) === 1 ? S("") : S("s"));
      }
    } while (0);
    i = strlen(S("      ")) | 0;
    buf[i] = highc(buf[i]);
    strcat(P(buf), S("."));
    await G.windowprocs.win_putstr(win, 0, P(buf));
  }
  $wr(P(buf), 0, 0);
  if (mptr.flags.oracle) {
    sprintf(P(buf), S("%sOracle of Delphi."), S("      "));
  } else if (mptr.lev.dnum === G.dungeon_topology.d_sokoban_dnum) {
    sprintf(P(buf), S("%s%s."), S("      "), mptr.flags.sokosolved | 0 ? S("Solved") : S("Unsolved"));
  } else if (mptr.flags.bigroom) {
    sprintf(P(buf), S("%sA very big room."), S("      "));
  } else if (mptr.flags.roguelevel) {
    sprintf(P(buf), S("%sA primitive area."), S("      "));
  } else if (on_level(mptr.lev, G.dungeon_topology.d_qstart_level)) {
    sprintf(P(buf), S("%sHome%s."), S("      "), mptr.flags.unreachable | 0 ? S(" (no way back...)") : S(""));
    if (G.u.uevent.qcompleted) {
      sprintf(P(buf), S("%sCompleted quest for %s."), S("      "), ldrname());
    } else if (mptr.flags.questing) {
      sprintf(P(buf), S("%sGiven quest by %s."), S("      "), ldrname());
    }
  } else if (mptr.flags.ludios) {
    sprintf(P(buf), S("%sFort Ludios."), S("      "));
  } else if (mptr.flags.castle) {
    sprintf(P(buf), S("%sThe castle%s."), S("      "), tunesuffix(mptr, P(tmpbuf)));
  } else if (mptr.flags.valley) {
    sprintf(P(buf), S("%sValley of the Dead."), S("      "));
  } else if (mptr.flags.msanctum) {
    sprintf(P(buf), S("%sMoloch's Sanctum."), S("      "));
  }
  if ($rd(P(buf))) {
    await G.windowprocs.win_putstr(win, 0, P(buf));
  }
  if (mptr.flags.quest_summons) {
    sprintf(P(buf), S("%sSummoned by %s."), S("      "), ldrname());
    await G.windowprocs.win_putstr(win, 0, P(buf));
  }
  if (mptr.br) {
    sprintf(P(buf), S("%s%s to %s"), S("      "), br_string2(mptr.br), P(G.dungeons[mptr.br.end2.dnum].dname));
    if (mptr.br.end1_up && !(mptr.br.end2.dnum === G.dungeon_topology.d_astral_level.dnum)) {
      sprintf(eos(P(buf)), S(", level %d"), depth(mptr.br.end2));
    }
    strcat(P(buf), S("."));
    await G.windowprocs.win_putstr(win, 0, P(buf));
  }
  if (mptr.final_resting_place || final) {
    let bp = null;
    let kncnt = !died_here ? 0 : 1;
    for (bp = mptr.final_resting_place; bp; bp = bp.next) {
      if (bp.bonesknown || G.flags.debug || final) {
        ++kncnt;
      }
    }
    if (kncnt) {
      sprintf(P(buf), S("%s%s"), S("      "), S("Final resting place for"));
      await G.windowprocs.win_putstr(win, 0, P(buf));
      if (died_here) {
        await formatkiller(P(tmpbuf), 256, how, TRUE);
        strsubst(P(tmpbuf), S(" himself"), S(" yourself"));
        strsubst(P(tmpbuf), S(" herself"), S(" yourself"));
        strsubst(P(tmpbuf), S(" his "), S(" your "));
        strsubst(P(tmpbuf), S(" her "), S(" your "));
        sprintf(P(buf), S("%s%syou, %s%c"), S("      "), S("   "), P(tmpbuf), --kncnt ? 44 : 46);
        await G.windowprocs.win_putstr(win, 0, P(buf));
      }
      for (bp = mptr.final_resting_place; bp; bp = bp.next) {
        if (bp.bonesknown || G.flags.debug || final) {
          sprintf(P(buf), S("%s%s%s, %s%c"), S("      "), S("   "), P(bp.who), P(bp.how), --kncnt ? 44 : 46);
          await G.windowprocs.win_putstr(win, 0, P(buf));
        }
      }
    }
  }
}

export function $init(): void {
  G.n_dgns = 0;
  branches = null;
  G.mapseenchn = null;
  G.level_map = $sarrOf([struct_level_map.$of(S("air"), G.dungeon_topology.d_air_level),
struct_level_map.$of(S("asmodeus"), G.dungeon_topology.d_asmodeus_level),
struct_level_map.$of(S("astral"), G.dungeon_topology.d_astral_level),
struct_level_map.$of(S("baalz"), G.dungeon_topology.d_baalzebub_level),
struct_level_map.$of(S("bigrm"), G.dungeon_topology.d_bigroom_level),
struct_level_map.$of(S("castle"), G.dungeon_topology.d_stronghold_level),
struct_level_map.$of(S("earth"), G.dungeon_topology.d_earth_level),
struct_level_map.$of(S("fakewiz1"), G.dungeon_topology.d_portal_level),
struct_level_map.$of(S("fire"), G.dungeon_topology.d_fire_level),
struct_level_map.$of(S("juiblex"), G.dungeon_topology.d_juiblex_level),
struct_level_map.$of(S("knox"), G.dungeon_topology.d_knox_level),
struct_level_map.$of(S("medusa"), G.dungeon_topology.d_medusa_level),
struct_level_map.$of(S("oracle"), G.dungeon_topology.d_oracle_level),
struct_level_map.$of(S("orcus"), G.dungeon_topology.d_orcus_level),
struct_level_map.$of(S("rogue"), G.dungeon_topology.d_rogue_level),
struct_level_map.$of(S("sanctum"), G.dungeon_topology.d_sanctum_level),
struct_level_map.$of(S("valley"), G.dungeon_topology.d_valley_level),
struct_level_map.$of(S("water"), G.dungeon_topology.d_water_level),
struct_level_map.$of(S("wizard1"), G.dungeon_topology.d_wiz1_level),
struct_level_map.$of(S("wizard2"), G.dungeon_topology.d_wiz2_level),
struct_level_map.$of(S("wizard3"), G.dungeon_topology.d_wiz3_level),
struct_level_map.$of(S("minend"), G.dungeon_topology.d_mineend_level),
struct_level_map.$of(S("soko1"), G.dungeon_topology.d_sokoend_level),
struct_level_map.$of(S("x-strt"), G.dungeon_topology.d_qstart_level),
struct_level_map.$of(S("x-loca"), G.dungeon_topology.d_qlocate_level),
struct_level_map.$of(S("x-goal"), G.dungeon_topology.d_nemesis_level),
struct_level_map.$of(S(""))]);
  add_branch$branch_id = 0;
}
