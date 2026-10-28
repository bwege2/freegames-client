// @ts-nocheck
// NetHack 3.6.7 engrave.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { exercise } from './attrib.ts';
import { sanitize_name } from './bones.ts';
import { yn_function } from './cmd.ts';
import { is_ice, is_lava, is_pool } from './dbridge.ts';
import { hliquid, mon_nam } from './do_name.ts';
import { on_level } from './dungeon.ts';
import { more_experienced } from './exper.ts';
import { debugcore } from './files.ts';
import { check_capacity, in_rooms, nomul } from './hack.ts';
import { fuzzymatch, mungspaces, strstri, xcrypt } from './hacklib.ts';
import { getobj, useup } from './invent.ts';
import { makemon } from './makemon.ts';
import { costly_alteration } from './mkobj.ts';
import { resists_blnd } from './mondata.ts';
import { accessible } from './monmove.ts';
import { The, Tobjnam, Yname2, Yobjnam2, doname, otense, xname, yname } from './objnam.ts';
import { You, You_cant, You_see, Your, impossible, pline, pline_The } from './pline.ts';
import { body_part } from './polyself.ts';
import { make_blinded } from './potion.ts';
import { altar_wrath } from './pray.ts';
import { wand_explode } from './read.ts';
import { mread } from './restore.ts';
import { rn2, rnd } from './rnd.ts';
import { get_rnd_text, getrumor } from './rumors.ts';
import { bwrite } from './save.ts';
import { check_unpaid } from './shk.ts';
import { goodpos } from './teleport.ts';
import { t_at, uescaped_shaft, uteetering_at_seen_pit } from './trap.ts';
import { dry_a_towel } from './weapon.ts';
import { welded } from './wield.ts';
import { learnwand, zapnodir, zappable } from './zap.ts';
import { anon_engrave_c_28, struct_engr } from './structs.ts';
import { $at2, $bytes, $rd, $rows, $sadd, $salloc, $sarrOf, $sat, $ta, $u64, $wr, G, P, S, free, memset, sprintf, strcat, strchr, strcmp, strcpy, strlen, strncat, strncpy } from './rt/index.ts';
import { AIR, ALLOW_NONE, ALL_CLASSES, ALTAR, AMULET_CLASS, ARMOR_CLASS, ARM_BOOTS, ATHAME, A_WIS, BALL_CLASS, BLINDED, BUFSZ, BURN, CHAIN_CLASS, CLOUD, COIN_CLASS, CONFUSION, COST_DEGRD, DBWALL, DEAF, DOOR, DRAWBRIDGE_DOWN, DUST, ENGRAVE, ENGR_BLOOD, FALSE, FINGERTIP, FLYING, FOOD_CLASS, FOUNTAIN, GEM_CLASS, GRAVE, HALLUC, HALLUC_RES, HAND, HEADSTONE, ILLOBJ_CLASS, LEVITATION, MAGIC_MARKER, MARK, NO_MM_FLAGS, N_ENGRAVE, PM_GHOUL, PM_TRAPPER, POTION_CLASS, P_BASIC, P_DAGGER, P_RIDING, P_SABER, RANDOM_CLASS, RING_CLASS, ROCK_CLASS, ROOM, ROWNO, SCROLL_CLASS, SDOOR, SHOPBASE, SPBOOK_CLASS, STUNNED, S_VAMPIRE, S_VORTEX, TEMPLE, TOOL_CLASS, TRUE, VAULT, VENOM_CLASS, WAND_BACKFIRE_CHANCE, WAND_CLASS, WEAPON_CLASS } from './consts.ts';

let head_engr: struct_engr | null;
let rubouts: any;
let styluses: any;
let blind_writing: any;

export async function random_engraving(outbuf: Ptr | null): Promise<Ptr | null> {
  let rumor = null;
  if (!rn2(4) || !(rumor = await getrumor(0, outbuf, TRUE)) || !rumor.a[rumor.o]) {
    await get_rnd_text(S("engrave"), outbuf, rn2);
  }
  wipeout_text(outbuf, Math.trunc(strlen(outbuf) / 4) | 0, 0);
  return outbuf;
}

export function wipeout_text(engr: Ptr | null, cnt: number, seed: number): void {
  let s = null;
  let i = 0;
  let j = 0;
  let nxt = 0;
  let use_rubout = 0;
  let lth = strlen(engr) | 0;
  if (lth && cnt > 0) {
    while (cnt--) {
      if (!seed) {
        nxt = rn2(lth);
        use_rubout = rn2(4);
      } else {
        nxt = seed % (lth >>> 0) | 0;
        seed = seed * 31 >>> 0, seed = seed % (BUFSZ - 1);
        use_rubout = (seed & 3) >>> 0 | 0;
      }
      s = engr.add(nxt);
      if (s.a[s.o] === 32) {
        continue;
      }
      if (strchr(S("?.,'`-|_"), s.a[s.o])) {
        s.a[s.o] = 32;
        continue;
      }
      if (!use_rubout) {
        i = Math.trunc(768 / 16) | 0;
      } else {
        for (i = 0; i < (Math.trunc(768 / 16) | 0); ++i) {
          if (s.a[s.o] === rubouts[i].wipefrom) {
            if (!seed) {
              j = rn2(strlen(rubouts[i].wipeto) | 0);
            } else {
              seed = seed * 31 >>> 0, seed = seed % (BUFSZ - 1);
              j = seed % strlen(rubouts[i].wipeto) | 0;
            }
            s.a[s.o] = $rd(rubouts[i].wipeto, j);
            break;
          }
        }
      }
      if (i === (Math.trunc(768 / 16) | 0)) {
        s.a[s.o] = 63;
      }
    }
  }
  while (lth && engr.a[engr.o + (lth - 1)] === 32) {
    engr.a[engr.o + --lth] = 0;
  }
}

export function can_reach_floor(check_pit: number): number {
  let t = null;
  if (G.u.uswallow) {
    return FALSE;
  }
  if (G.u.usteed && G.u.weapon_skills[P_RIDING].skill < P_BASIC) {
    return FALSE;
  }
  if (check_pit && !((G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked) && !!(t = t_at(G.u.ux, G.u.uy)) && (uteetering_at_seen_pit(t) || uescaped_shaft(t))) {
    return FALSE;
  }
  return ((!((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) || (G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level) || (G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) && (!G.u.uundetected || !((G.youmonst.data.mflags1 & 256) >>> 0 !== 0) || G.u.umonnum === PM_TRAPPER) ? 1 : 0) << 24 >> 24;
}

export async function cant_reach_floor(x: number, y: number, up: number, check_pit: number): Promise<void> {
  await You(S("can't reach the %s."), up ? ceiling(x, y) : check_pit && can_reach_floor(FALSE) ? S("bottom of the pit") : surface(x, y));
}

export function surface(x: number, y: number): Ptr | null {
  let lev = $sat(G.level.locations[x], y);
  if (x === G.u.ux && y === G.u.uy && G.u.uswallow | 0 && (G.u.ustuck.data.mflags1 & 262144) >>> 0 !== 0) {
    return S("maw");
  } else if ((lev.typ === AIR || lev.typ === CLOUD) && ((G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level))) {
    return S("air");
  } else if (is_pool(x, y)) {
    return G.u.uinwater | 0 && !((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) ? S("bottom") : hliquid(S("water"));
  } else if (is_ice(x, y)) {
    return S("ice");
  } else if (is_lava(x, y)) {
    return hliquid(S("lava"));
  } else if (lev.typ === DRAWBRIDGE_DOWN) {
    return S("bridge");
  } else if ($at2(G.level.locations, x, y).typ === ALTAR) {
    return S("altar");
  } else if ($at2(G.level.locations, x, y).typ === GRAVE) {
    return S("headstone");
  } else if ($at2(G.level.locations, x, y).typ === FOUNTAIN) {
    return S("fountain");
  } else if (lev.typ >= ROOM && !((G.dungeon_topology.d_earth_level.dlevel || G.dungeon_topology.d_earth_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_earth_level)) || lev.typ && lev.typ <= DBWALL || lev.typ === DOOR || lev.typ === SDOOR) {
    return S("floor");
  } else {
    return S("ground");
  }
}

export function ceiling(x: number, y: number): Ptr | null {
  let lev = $sat(G.level.locations[x], y);
  let what = null;
  if ($rd(in_rooms(x, y, VAULT))) {
    what = S("vault's ceiling");
  } else if ($rd(in_rooms(x, y, TEMPLE))) {
    what = S("temple's ceiling");
  } else if ($rd(in_rooms(x, y, SHOPBASE))) {
    what = S("shop's ceiling");
  } else if ((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) {
    what = S("water above");
  } else if (lev.typ === AIR || lev.typ === CLOUD) {
    what = S("sky");
  } else if (G.u.uinwater) {
    what = S("water's surface");
  } else if (lev.typ >= ROOM && !((G.dungeon_topology.d_earth_level.dlevel || G.dungeon_topology.d_earth_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_earth_level)) || lev.typ && lev.typ <= DBWALL || lev.typ === DOOR || lev.typ === SDOOR) {
    what = S("ceiling");
  } else {
    what = S("rock cavern");
  }
  return what;
}

export function engr_at(x: number, y: number): struct_engr | null {
  let ep = head_engr;
  while (ep) {
    if (x === ep.engr_x && y === ep.engr_y) {
      return ep;
    }
    ep = ep.nxt_engr;
  }
  return null;
}

export function sengr_at(s: Ptr | null, x: number, y: number, strict: number): number {
  let ep = engr_at(x, y);
  if (ep && ep.engr_type !== HEADSTONE && ep.engr_time <= G.moves) {
    return strict ? fuzzymatch(ep.engr_txt, s, S(""), TRUE) : !!strstri(ep.engr_txt, s) ? 1 : 0;
  }
  return FALSE;
}

export async function u_wipe_engr(cnt: number): Promise<void> {
  if (can_reach_floor(TRUE)) {
    await wipe_engr_at(G.u.ux, G.u.uy, cnt, FALSE);
  }
}

export async function wipe_engr_at(x: number, y: number, cnt: number, magical: number): Promise<void> {
  let ep = engr_at(x, y);
  if (ep && ep.engr_type !== HEADSTONE) {
    do {
      if (await debugcore(S("engrave.c"), 1)) {
        await pline(S("asked to erode %d characters"), cnt);
      }
    } while (0);
    if (ep.engr_type !== BURN || is_ice(x, y) || magical && !rn2(2)) {
      if (ep.engr_type !== DUST && ep.engr_type !== ENGR_BLOOD) {
        cnt = (rn2(1 + (50 / (cnt + 1) | 0)) ? 0 : 1) << 24 >> 24;
        do {
          if (await debugcore(S("engrave.c"), 1)) {
            await pline(S("actually eroding %d characters"), cnt);
          }
        } while (0);
      }
      wipeout_text(ep.engr_txt, cnt, 0);
      while (ep.engr_txt.a[ep.engr_txt.o] === 32) {
        ep.engr_txt = ep.engr_txt.add(1);
      }
      if (!ep.engr_txt.a[ep.engr_txt.o]) {
        await del_engr(ep);
      }
    }
  }
}

export async function read_engr_at(x: number, y: number): Promise<void> {
  let ep = engr_at(x, y);
  let sensed = 0;
  if (ep && ep.engr_txt.a[ep.engr_txt.o]) {
    switch (ep.engr_type) {
    case 1:
      if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
        sensed = 1;
        await pline(S("%s is written here in the %s."), G.c_common_strings.c_Something, is_ice(x, y) ? S("frost") : S("dust"));
      }
      break;
    case 2:
    case 6:
      if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) || can_reach_floor(TRUE)) {
        sensed = 1;
        await pline(S("%s is engraved here on the %s."), G.c_common_strings.c_Something, surface(x, y));
      }
      break;
    case 3:
      if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) || can_reach_floor(TRUE)) {
        sensed = 1;
        await pline(S("Some text has been %s into the %s here."), is_ice(x, y) ? S("melted") : S("burned"), surface(x, y));
      }
      break;
    case 4:
      if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
        sensed = 1;
        await pline(S("There's some graffiti on the %s here."), surface(x, y));
      }
      break;
    case 5:
      if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
        sensed = 1;
        await You_see(S("a message scrawled in blood here."));
      }
      break;
    default:
      await impossible(S("%s is written in a very strange way."), G.c_common_strings.c_Something);
      sensed = 1;
    }
    if (sensed) {
      let et = null;
      let buf = new Int8Array(256);
      let maxelen = 256 - 24;
      if ((strlen(ep.engr_txt) | 0) > maxelen) {
        strncpy(P(buf), ep.engr_txt, $u64(maxelen));
        buf[maxelen] = 0;
        et = P(buf);
      } else {
        et = ep.engr_txt;
      }
      await You(S("%s: \"%s\"."), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("feel the words") : S("read"), et);
      if (G.context.run > 0) {
        nomul(0);
      }
    }
  }
}

export async function make_engr_at(x: number, y: number, s: Ptr | null, e_time: number, e_type: number): Promise<void> {
  let ep = null;
  let smem = strlen(s) + 1 >>> 0;
  if (!!(ep = engr_at(x, y))) {
    await del_engr(ep);
  }
  ep = $salloc(struct_engr, smem + 40 >>> 0);
  memset(ep, 0, smem + 40);
  ep.nxt_engr = head_engr;
  head_engr = ep;
  ep.engr_x = x << 24 >> 24;
  ep.engr_y = y << 24 >> 24;
  ep.engr_txt = $bytes($sadd(ep, 1));
  strcpy(ep.engr_txt, s);
  if (!G.in_mklev && !strcmp(s, S("Elbereth"))) {
    await exercise(A_WIS, TRUE);
  }
  ep.engr_time = e_time;
  ep.engr_type = (e_type > 0 ? e_type : rnd(N_ENGRAVE - 1)) << 24 >> 24;
  ep.engr_lth = smem;
}

export async function del_engr_at(x: number, y: number): Promise<void> {
  let ep = engr_at(x, y);
  if (ep) {
    await del_engr(ep);
  }
}

export function freehand(): number {
  return !G.uwep || !welded(G.uwep) || !((G.uwep.oclass === WEAPON_CLASS || G.uwep.oclass === TOOL_CLASS) && G.objects[G.uwep.otyp].oc_big | 0) && (!G.uarms || !G.uarms.cursed) ? 1 : 0;
}

export async function doengrave(): Promise<number> {
  let dengr = FALSE;
  let doblind = FALSE;
  let doknown = FALSE;
  let eow = FALSE;
  let jello = FALSE;
  let ptext = TRUE;
  let teleengr = FALSE;
  let zapwand = FALSE;
  let type = DUST;
  let oetype = 0;
  let buf = new Int8Array(256);
  let ebuf = new Int8Array(256);
  let fbuf = new Int8Array(256);
  let qbuf = new Int8Array(128);
  let post_engr_text = new Int8Array(256);
  let everb = null;
  let eloc = null;
  let sp = null;
  let len = 0;
  let maxelen = 0;
  let oep = engr_at(G.u.ux, G.u.uy);
  let otmp = null;
  let writer = null;
  G.multi = 0;
  G.nomovemsg = null;
  buf[0] = 0;
  ebuf[0] = 0;
  post_engr_text[0] = 0;
  maxelen = BUFSZ - 1;
  if (oep) {
    oetype = oep.engr_type;
  }
  if ((G.youmonst.data.mflags2 & 256) >>> 0 !== 0 || G.youmonst.data.mlet === S_VAMPIRE) {
    type = ENGR_BLOOD;
  }
  if (G.u.uswallow) {
    if ((G.u.ustuck.data.mflags1 & 262144) >>> 0 !== 0) {
      await pline(S("What would you write?  \"Jonah was here\"?"));
      return 0;
    } else if (G.u.ustuck.data.mlet === S_VORTEX || G.u.ustuck.data === $sat(G.mons, 151)) {
      await cant_reach_floor(G.u.ux, G.u.uy, FALSE, FALSE);
      return 0;
    } else {
      jello = TRUE;
    }
  } else if (is_lava(G.u.ux, G.u.uy)) {
    await You_cant(S("write on the %s!"), surface(G.u.ux, G.u.uy));
    return 0;
  } else if (is_pool(G.u.ux, G.u.uy) || $at2(G.level.locations, G.u.ux, G.u.uy).typ === FOUNTAIN) {
    await You_cant(S("write on the %s!"), surface(G.u.ux, G.u.uy));
    return 0;
  }
  if ((G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level) || (G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) {
    await You_cant(S("write in thin air!"));
    return 0;
  } else if (!accessible(G.u.ux, G.u.uy)) {
    await You_cant(S("write here."));
    return 0;
  }
  if ((G.youmonst.data.mflags1 & 8192) >>> 0 !== 0 || G.youmonst.data.msize < 1) {
    await You_cant(S("even hold anything!"));
    return 0;
  }
  if (await check_capacity(null)) {
    return 0;
  }
  otmp = await getobj(P(styluses), S("write with"));
  if (!otmp) {
    return 0;
  }
  if (otmp === G.zeroobj) {
    strcat(strcpy(P(fbuf), S("your ")), body_part(FINGERTIP));
    writer = P(fbuf);
  } else {
    writer = await yname(otmp);
  }
  if (!freehand() && otmp !== G.uwep && !otmp.owornmask) {
    await You(S("have no free %s to write with!"), body_part(HAND));
    return 0;
  }
  if (jello) {
    await You(S("tickle %s with %s."), await mon_nam(G.u.ustuck), writer);
    await Your(S("message dissolves..."));
    return 0;
  }
  if (otmp.oclass !== WAND_CLASS && !can_reach_floor(TRUE)) {
    await cant_reach_floor(G.u.ux, G.u.uy, FALSE, TRUE);
    return 0;
  }
  if ($at2(G.level.locations, G.u.ux, G.u.uy).typ === ALTAR) {
    await You(S("make a motion towards the altar with %s."), writer);
    await altar_wrath(G.u.ux, G.u.uy);
    return 0;
  }
  if ($at2(G.level.locations, G.u.ux, G.u.uy).typ === GRAVE) {
    if (otmp === G.zeroobj) {
      await You(S("would only make a small smudge on the %s."), surface(G.u.ux, G.u.uy));
      return 0;
    } else if (!$at2(G.level.locations, G.u.ux, G.u.uy).horizontal) {
      await You(S("disturb the undead!"));
      $at2(G.level.locations, G.u.ux, G.u.uy).horizontal = 1;
      await makemon($sat(G.mons, PM_GHOUL), G.u.ux, G.u.uy, NO_MM_FLAGS);
      await exercise(A_WIS, FALSE);
      return 1;
    }
  }
  switch (otmp.oclass) {
  default:
  case AMULET_CLASS:
  case CHAIN_CLASS:
  case POTION_CLASS:
  case COIN_CLASS:
    break;
  case RING_CLASS:
  case GEM_CLASS:
    if (G.objects[otmp.otyp].oc_tough) {
      type = ENGRAVE;
      break;
    }
    break;
  case ARMOR_CLASS:
    if (otmp.oclass === ARMOR_CLASS && G.objects[otmp.otyp].oc_subtyp === ARM_BOOTS) {
      type = DUST;
      break;
    }
  case BALL_CLASS:
  case ROCK_CLASS:
    await You_cant(S("engrave with such a large object!"));
    ptext = FALSE;
    break;
  case FOOD_CLASS:
  case SCROLL_CLASS:
  case SPBOOK_CLASS:
    await pline(S("%s would get %s."), await Yname2(otmp), is_ice(G.u.ux, G.u.uy) ? S("all frosty") : S("too dirty"));
    ptext = FALSE;
    break;
  case RANDOM_CLASS:
    break;
  case WAND_CLASS:
    if (await zappable(otmp)) {
      await check_unpaid(otmp);
      if (otmp.cursed | 0 && !rn2(WAND_BACKFIRE_CHANCE)) {
        await wand_explode(otmp, 0);
        return 1;
      }
      zapwand = TRUE;
      if (!can_reach_floor(TRUE)) {
        ptext = FALSE;
      }
      switch (otmp.otyp) {
      default:
        break;
      case 384:
      case 385:
      case 387:
      case 388:
      case 386:
        await zapnodir(otmp);
        break;
      case 390:
        strcpy(P(post_engr_text), S("The wand unsuccessfully fights your attempt to write!"));
        break;
      case 392:
        if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
          sprintf(P(post_engr_text), S("The bugs on the %s slow down!"), surface(G.u.ux, G.u.uy));
        }
        break;
      case 393:
        if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
          sprintf(P(post_engr_text), S("The bugs on the %s speed up!"), surface(G.u.ux, G.u.uy));
        }
        break;
      case 395:
        if (oep) {
          if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
            type = 0;
            await random_engraving(P(buf));
          } else {
            if (oetype) {
              type = oetype;
            }
            xcrypt(blengr(), P(buf));
          }
          dengr = TRUE;
        }
        break;
      case 389:
      case 394:
      case 398:
      case 399:
      case 400:
        break;
      case 402:
        ptext = TRUE;
        if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
          sprintf(P(post_engr_text), S("The %s is riddled by bullet holes!"), surface(G.u.ux, G.u.uy));
        }
        break;
      case 405:
      case 406:
        if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
          sprintf(P(post_engr_text), S("The bugs on the %s stop moving!"), surface(G.u.ux, G.u.uy));
        }
        break;
      case 404:
        if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
          strcpy(P(post_engr_text), S("A few ice cubes drop from the wand."));
        }
        if (!oep || oep.engr_type !== BURN) {
          break;
        }
      case 396:
      case 391:
        if (oep && oep.engr_type !== HEADSTONE) {
          if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
            await pline_The(S("engraving on the %s vanishes!"), surface(G.u.ux, G.u.uy));
          }
          dengr = TRUE;
        }
        break;
      case 397:
        if (oep && oep.engr_type !== HEADSTONE) {
          if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
            await pline_The(S("engraving on the %s vanishes!"), surface(G.u.ux, G.u.uy));
          }
          teleengr = TRUE;
        }
        break;
      case 401:
        ptext = TRUE;
        type = ENGRAVE;
        if (!G.objects[otmp.otyp].oc_name_known) {
          if (G.flags.verbose) {
            await pline(S("This %s is a wand of digging!"), await xname(otmp));
          }
          doknown = TRUE;
        }
        strcpy(P(post_engr_text), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) ? S("You hear drilling!") : (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("You feel tremors.") : $at2(G.level.locations, G.u.ux, G.u.uy).typ === GRAVE ? S("Chips fly out from the headstone.") : is_ice(G.u.ux, G.u.uy) ? S("Ice chips fly up from the ice surface!") : $at2(G.level.locations, G.u.ux, G.u.uy).typ === DRAWBRIDGE_DOWN ? S("Splinters fly up from the bridge.") : S("Gravel flies up from the floor."));
        break;
      case 403:
        ptext = TRUE;
        type = BURN;
        if (!G.objects[otmp.otyp].oc_name_known) {
          if (G.flags.verbose) {
            await pline(S("This %s is a wand of fire!"), await xname(otmp));
          }
          doknown = TRUE;
        }
        strcpy(P(post_engr_text), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("You feel the wand heat up.") : S("Flames fly from the wand."));
        break;
      case 407:
        ptext = TRUE;
        type = BURN;
        if (!G.objects[otmp.otyp].oc_name_known) {
          if (G.flags.verbose) {
            await pline(S("This %s is a wand of lightning!"), await xname(otmp));
          }
          doknown = TRUE;
        }
        if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
          strcpy(P(post_engr_text), S("Lightning arcs from the wand."));
          doblind = TRUE;
        } else {
          strcpy(P(post_engr_text), !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) ? S("You hear crackling!") : S("Your hair stands up!"));
        }
        break;
      }
    } else {
      ptext = FALSE;
      if (can_reach_floor(TRUE)) {
        if (otmp.spe < 0) {
          zapwand = TRUE;
        } else {
          await pline_The(S("wand is too worn out to engrave."));
        }
      }
    }
    break;
  case WEAPON_CLASS:
    if (otmp.oclass === WEAPON_CLASS && G.objects[otmp.otyp].oc_subtyp >= P_DAGGER && G.objects[otmp.otyp].oc_subtyp <= P_SABER) {
      if (otmp.spe > -3) {
        type = ENGRAVE;
      } else {
        await pline(S("%s too dull for engraving."), await Yobjnam2(otmp, S("are")));
      }
    }
    break;
  case TOOL_CLASS:
    if (otmp === G.ublindf) {
      await pline(S("That is a bit difficult to engrave with, don't you think?"));
      return 0;
    }
    switch (otmp.otyp) {
    case 217:
      if (otmp.spe <= 0) {
        await Your(S("marker has dried out."));
      } else {
        type = MARK;
      }
      break;
    case 209:
      ptext = FALSE;
      if (oep) {
        if (oep.engr_type === DUST || oep.engr_type === ENGR_BLOOD || oep.engr_type === MARK) {
          if (otmp.otyp === 209 && otmp.spe > 0) {
            await dry_a_towel(otmp, -1, TRUE);
          }
          if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
            await You(S("wipe out the message here."));
          } else {
            await pline(S("%s %s."), await Yobjnam2(otmp, S("get")), is_ice(G.u.ux, G.u.uy) ? S("frosty") : S("dusty"));
          }
          dengr = TRUE;
        } else {
          await pline(S("%s can't wipe out this engraving."), await Yname2(otmp));
        }
      } else {
        await pline(S("%s %s."), await Yobjnam2(otmp, S("get")), is_ice(G.u.ux, G.u.uy) ? S("frosty") : S("dusty"));
      }
      break;
    default:
      break;
    }
    break;
  case VENOM_CLASS:
    if (G.flags.debug) {
      await pline(S("Writing a poison pen letter??"));
      break;
    }
  case ILLOBJ_CLASS:
    await impossible(S("You're engraving with an illegal object!"));
    break;
  }
  if ($at2(G.level.locations, G.u.ux, G.u.uy).typ === GRAVE) {
    if (type === ENGRAVE || type === 0) {
      type = HEADSTONE;
    } else {
      type = DUST;
      dengr = FALSE;
      teleengr = FALSE;
      buf[0] = 0;
    }
  }
  if (doknown) {
    await learnwand(otmp);
    if (G.objects[otmp.otyp].oc_name_known) {
      await more_experienced(0, 10);
    }
  }
  if (teleengr) {
    rloc_engr(oep);
    oep = null;
  }
  if (dengr) {
    await del_engr(oep);
    oep = null;
  }
  if ($rd(P(buf))) {
    await make_engr_at(G.u.ux, G.u.uy, P(buf), G.moves, type);
    if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
      await pline_The(S("engraving now reads: \"%s\"."), P(buf));
    }
    ptext = FALSE;
  }
  if (zapwand && otmp.spe < 0) {
    await pline(S("%s %sturns to dust."), await The(await xname(otmp)), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("") : S("glows violently, then "));
    if (!($at2(G.level.locations, G.u.ux, G.u.uy).typ === GRAVE)) {
      await You(S("are not going to get anywhere trying to write in the %s with your dust."), is_ice(G.u.ux, G.u.uy) ? S("frost") : S("dust"));
    }
    await useup(otmp);
    otmp = null;
    ptext = FALSE;
  }
  if (!ptext) {
    if (otmp && otmp.oclass === WAND_CLASS && !can_reach_floor(TRUE)) {
      await cant_reach_floor(G.u.ux, G.u.uy, FALSE, TRUE);
    }
    return 1;
  }
  if (oep) {
    let c = 110;
    if (type === HEADSTONE) {
      c = 121;
    } else if (type === oep.engr_type && (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) || oep.engr_type === BURN || oep.engr_type === ENGRAVE)) {
      c = await yn_function(S("Do you want to add to the current engraving?"), P(G.ynqchars), 121);
      if (c === 113) {
        await pline(S("%s"), G.c_common_strings.c_Never_mind);
        return 0;
      }
    }
    if (c === 110 || (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
      if (oep.engr_type === DUST || oep.engr_type === ENGR_BLOOD || oep.engr_type === MARK) {
        if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
          await You(S("wipe out the message that was %s here."), oep.engr_type === DUST ? S("written in the dust") : oep.engr_type === ENGR_BLOOD ? S("scrawled in blood") : S("written"));
          await del_engr(oep);
          oep = null;
        } else {
          eow = TRUE;
        }
      } else if (type === DUST || type === MARK || type === ENGR_BLOOD) {
        await You(S("cannot wipe out the message that is %s the %s here."), oep.engr_type === BURN ? is_ice(G.u.ux, G.u.uy) ? S("melted into") : S("burned into") : S("engraved in"), surface(G.u.ux, G.u.uy));
        return 1;
      } else if (type !== oep.engr_type || c === 110) {
        if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) || can_reach_floor(TRUE)) {
          await You(S("will overwrite the current message."));
        }
        eow = TRUE;
      }
    }
  }
  eloc = surface(G.u.ux, G.u.uy);
  switch (type) {
  default:
    everb = oep && !eow ? S("add to the weird writing on") : S("write strangely on");
    break;
  case 1:
    everb = oep && !eow ? S("add to the writing in") : S("write in");
    eloc = is_ice(G.u.ux, G.u.uy) ? S("frost") : S("dust");
    break;
  case 6:
    everb = oep && !eow ? S("add to the epitaph on") : S("engrave on");
    break;
  case 2:
    everb = oep && !eow ? S("add to the engraving in") : S("engrave in");
    break;
  case 3:
    everb = oep && !eow ? is_ice(G.u.ux, G.u.uy) ? S("add to the text melted into") : S("add to the text burned into") : is_ice(G.u.ux, G.u.uy) ? S("melt into") : S("burn into");
    break;
  case 4:
    everb = oep && !eow ? S("add to the graffiti on") : S("scribble on");
    break;
  case 5:
    everb = oep && !eow ? S("add to the scrawl on") : S("scrawl on");
    break;
  }
  if (otmp !== G.zeroobj) {
    await You(S("%s the %s with %s."), everb, eloc, await doname(otmp));
  } else {
    await You(S("%s the %s with your %s."), everb, eloc, body_part(FINGERTIP));
  }
  sprintf(P(qbuf), S("What do you want to %s the %s here?"), everb, eloc);
  await G.windowprocs.win_getlin(P(qbuf), P(ebuf));
  mungspaces(P(ebuf));
  len = strlen(P(ebuf)) | 0;
  for (sp = P(ebuf); sp.a[sp.o]; sp = sp.add(1)) {
    if (sp.a[sp.o] === 32) {
      len -= 1;
    }
  }
  if (len === 0 || strchr(P(ebuf), 27)) {
    if (zapwand) {
      if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
        await pline(S("%s, then %s."), await Tobjnam(otmp, S("glow")), otense(otmp, S("fade")));
      }
      return 1;
    } else {
      await pline(S("%s"), G.c_common_strings.c_Never_mind);
      return 0;
    }
  }
  if (len !== 1 || !strchr(P(ebuf), 120) && !strchr(P(ebuf), 88)) {
    ++G.u.uconduct.literate;
  }
  for (sp = P(ebuf); sp.a[sp.o]; sp = sp.add(1)) {
    if (sp.a[sp.o] === 32) {
      continue;
    }
    if ((type === DUST || type === ENGR_BLOOD) && !rn2(25) || (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && !rn2(11) || G.u.uprops[CONFUSION].intrinsic && !rn2(7) || G.u.uprops[STUNNED].intrinsic && !rn2(4) || G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) && !rn2(2)) {
      sp.a[sp.o] = 32 + rnd(96 - 2) << 24 >> 24;
    }
  }
  if (eow) {
    await del_engr(oep);
    oep = null;
  }
  switch (type) {
  default:
    G.multi = -(len / 10 | 0);
    if (G.multi) {
      G.nomovemsg = S("You finish your weird engraving.");
    }
    break;
  case 1:
    G.multi = -(len / 10 | 0);
    if (G.multi) {
      G.nomovemsg = S("You finish writing in the dust.");
    }
    break;
  case 6:
  case 2:
    G.multi = -(len / 10 | 0);
    if (otmp.oclass === WEAPON_CLASS && (otmp.otyp !== ATHAME || otmp.cursed | 0)) {
      G.multi = -len;
      maxelen = (otmp.spe + 3) * 2 + 1;
      await pline(S("%s dull."), await Yobjnam2(otmp, S("get")));
      await costly_alteration(otmp, COST_DEGRD);
      if (len > maxelen) {
        G.multi = -maxelen;
        otmp.spe = -3;
      } else if (len > 1) {
        otmp.spe = otmp.spe - (len >> 1) << 24 >> 24;
      } else {
        otmp.spe = otmp.spe - 1 << 24 >> 24;
      }
    } else if (otmp.oclass === RING_CLASS || otmp.oclass === GEM_CLASS) {
      G.multi = -len;
    }
    if (G.multi) {
      G.nomovemsg = S("You finish engraving.");
    }
    break;
  case 3:
    G.multi = -(len / 10 | 0);
    if (G.multi) {
      G.nomovemsg = is_ice(G.u.ux, G.u.uy) ? S("You finish melting your message into the ice.") : S("You finish burning your message into the floor.");
    }
    break;
  case 4:
    G.multi = -(len / 10 | 0);
    if (otmp.otyp === MAGIC_MARKER) {
      maxelen = otmp.spe * 2;
      if (len > maxelen) {
        await Your(S("marker dries out."));
        otmp.spe = 0;
        G.multi = -(maxelen / 10 | 0);
      } else if (len > 1) {
        otmp.spe = otmp.spe - (len >> 1) << 24 >> 24;
      } else {
        otmp.spe = otmp.spe - 1 << 24 >> 24;
      }
    }
    if (G.multi) {
      G.nomovemsg = S("You finish defacing the dungeon.");
    }
    break;
  case 5:
    G.multi = -(len / 10 | 0);
    if (G.multi) {
      G.nomovemsg = S("You finish scrawling.");
    }
    break;
  }
  if (len > maxelen) {
    for (sp = P(ebuf); maxelen && sp.a[sp.o]; sp = sp.add(1)) {
      if (!(sp.a[sp.o] === 32)) {
        --maxelen;
      }
    }
    if (!maxelen && sp.a[sp.o]) {
      sp.a[sp.o] = 0;
      if (G.multi) {
        G.nomovemsg = S("You cannot write any more.");
      }
      await You(S("are only able to write \"%s\"."), P(ebuf));
    }
  }
  if (oep) {
    strcpy(P(buf), oep.engr_txt);
  }
  strncat(P(buf), P(ebuf), $u64(BUFSZ - (strlen(P(buf)) | 0) - 1));
  await make_engr_at(G.u.ux, G.u.uy, P(buf), G.moves - G.multi, type);
  if (post_engr_text[0]) {
    await pline(S("%s"), P(post_engr_text));
  }
  if (doblind && !resists_blnd(G.youmonst)) {
    await You(S("are blinded by the flash!"));
    await make_blinded(rnd(50), FALSE);
    if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
      await Your(S("%s"), G.c_common_strings.c_vision_clears);
    }
  }
  return 1;
}

export function sanitize_engravings(): void {
  let ep = null;
  for (ep = head_engr; ep; ep = ep.nxt_engr) {
    sanitize_name(ep.engr_txt);
  }
}

export async function save_engravings(fd: number, mode: number): Promise<void> {
  let ep = null;
  let ep2 = null;
  const no_more_engr = new Uint32Array(1);
  no_more_engr[0] = 0;
  for (ep = head_engr; ep; ep = ep2) {
    ep2 = ep.nxt_engr;
    if (ep.engr_lth && ep.engr_txt.a[ep.engr_txt.o] && mode & (1 | 2)) {
      await bwrite(fd, P(ep, "engr_lth"), 4);
      await bwrite(fd, ep, 40 + ep.engr_lth >>> 0);
    }
    if (mode & 4) {
      free(ep);
    }
  }
  if (mode & (1 | 2)) {
    await bwrite(fd, P(no_more_engr, 0), 4);
  }
  if (mode & 4) {
    head_engr = null;
  }
}

export async function rest_engravings(fd: number): Promise<void> {
  let ep = null;
  const lth = new Uint32Array(1);
  head_engr = null;
  while (1) {
    await mread(fd, P(lth, 0), 4);
    if (lth[0] === 0) {
      return;
    }
    ep = $salloc(struct_engr, lth[0] + 40 >>> 0);
    await mread(fd, ep, 40 + lth[0] >>> 0);
    ep.nxt_engr = head_engr;
    head_engr = ep;
    ep.engr_txt = $bytes($sadd(ep, 1));
    ep.engr_time = G.moves;
  }
}

export function engr_stats(hdrfmt: Ptr | null, hdrbuf: Ptr | null, count: Ptr | null, size: Ptr | null): void {
  let ep = null;
  sprintf(hdrbuf, hdrfmt, 40);
  count.a[count.o] = size.a[size.o] = 0;
  for (ep = head_engr; ep; ep = ep.nxt_engr) {
    ++count.a[count.o];
    size.a[size.o] += 40 + ep.engr_lth;
  }
}

export async function del_engr(ep: struct_engr | null): Promise<void> {
  if (ep === head_engr) {
    head_engr = ep.nxt_engr;
  } else {
    let ept = null;
    for (ept = head_engr; ept; ept = ept.nxt_engr) {
      if (ept.nxt_engr === ep) {
        ept.nxt_engr = ep.nxt_engr;
        break;
      }
    }
    if (!ept) {
      await impossible(S("Error in del_engr?"));
      return;
    }
  }
  free(ep);
}

export function rloc_engr(ep: struct_engr | null): void {
  let tx = 0;
  let ty = 0;
  let tryct = 200;
  do {
    if (--tryct < 0) {
      return;
    }
    tx = rn2(80 - 3) + 2;
    ty = rn2(ROWNO);
  } while (engr_at(tx, ty) || !goodpos(tx, ty, null, 0));
  ep.engr_x = tx << 24 >> 24;
  ep.engr_y = ty << 24 >> 24;
}

export async function make_grave(x: number, y: number, str: Ptr | null): Promise<void> {
  let buf = new Int8Array(256);
  if ($at2(G.level.locations, x, y).typ !== ROOM && $at2(G.level.locations, x, y).typ !== GRAVE || t_at(x, y)) {
    return;
  }
  $at2(G.level.locations, x, y).typ = GRAVE;
  await del_engr_at(x, y);
  if (!str) {
    str = await get_rnd_text(S("epitaph"), P(buf), rn2);
  }
  await make_engr_at(x, y, str, 0, HEADSTONE);
  return;
}

function blengr(): Ptr | null {
  return P(blind_writing[rn2(Math.trunc(189 / 21) | 0)]);
}

export function $init(): void {
  head_engr = null;
  rubouts = $sarrOf([anon_engrave_c_28.$of(65, S("^")),
anon_engrave_c_28.$of(66, S("Pb[")),
anon_engrave_c_28.$of(67, S("(")),
anon_engrave_c_28.$of(68, S("|)[")),
anon_engrave_c_28.$of(69, S("|FL[_")),
anon_engrave_c_28.$of(70, S("|-")),
anon_engrave_c_28.$of(71, S("C(")),
anon_engrave_c_28.$of(72, S("|-")),
anon_engrave_c_28.$of(73, S("|")),
anon_engrave_c_28.$of(75, S("|<")),
anon_engrave_c_28.$of(76, S("|_")),
anon_engrave_c_28.$of(77, S("|")),
anon_engrave_c_28.$of(78, S("|\\")),
anon_engrave_c_28.$of(79, S("C(")),
anon_engrave_c_28.$of(80, S("F")),
anon_engrave_c_28.$of(81, S("C(")),
anon_engrave_c_28.$of(82, S("PF")),
anon_engrave_c_28.$of(84, S("|")),
anon_engrave_c_28.$of(85, S("J")),
anon_engrave_c_28.$of(86, S("/\\")),
anon_engrave_c_28.$of(87, S("V/\\")),
anon_engrave_c_28.$of(90, S("/")),
anon_engrave_c_28.$of(98, S("|")),
anon_engrave_c_28.$of(100, S("c|")),
anon_engrave_c_28.$of(101, S("c")),
anon_engrave_c_28.$of(103, S("c")),
anon_engrave_c_28.$of(104, S("n")),
anon_engrave_c_28.$of(106, S("i")),
anon_engrave_c_28.$of(107, S("|")),
anon_engrave_c_28.$of(108, S("|")),
anon_engrave_c_28.$of(109, S("nr")),
anon_engrave_c_28.$of(110, S("r")),
anon_engrave_c_28.$of(111, S("c")),
anon_engrave_c_28.$of(113, S("c")),
anon_engrave_c_28.$of(119, S("v")),
anon_engrave_c_28.$of(121, S("v")),
anon_engrave_c_28.$of(58, S(".")),
anon_engrave_c_28.$of(59, S(",:")),
anon_engrave_c_28.$of(44, S(".")),
anon_engrave_c_28.$of(61, S("-")),
anon_engrave_c_28.$of(43, S("-|")),
anon_engrave_c_28.$of(42, S("+")),
anon_engrave_c_28.$of(64, S("0")),
anon_engrave_c_28.$of(48, S("C(")),
anon_engrave_c_28.$of(49, S("|")),
anon_engrave_c_28.$of(54, S("o")),
anon_engrave_c_28.$of(55, S("/")),
anon_engrave_c_28.$of(56, S("3o"))]);
  styluses = $ta(Int8Array, 8, [ALL_CLASSES, ALLOW_NONE, TOOL_CLASS, WEAPON_CLASS, WAND_CLASS, GEM_CLASS, RING_CLASS]);
  blind_writing = $rows([$ta(Int8Array, 21, [68, 102, 109, 105, 98, 101, 34, 69, 123, 113, 101, 109, 114]),
$ta(Int8Array, 21, [81, 103, 96, 122, 127, 33, 64, 113, 107, 113, 111, 103, 99]),
$ta(Int8Array, 21, [73, 109, 115, 105, 98, 101, 34, 76, 97, 124, 109, 103, 36, 66, 127, 105, 108, 119, 103, 126]),
$ta(Int8Array, 21, [75, 109, 108, 102, 48, 76, 107, 104, 124, 127, 111]),
$ta(Int8Array, 21, [81, 103, 112, 122, 127, 111, 103, 104, 100, 113, 33, 79, 107, 109, 126, 114]),
$ta(Int8Array, 21, [76, 99, 118, 97, 113, 33, 72, 107, 123, 117, 103, 99, 36, 69, 101, 107, 107, 101]),
$ta(Int8Array, 21, [76, 103, 104, 107, 120, 104, 109, 118, 122, 117, 33, 79, 113, 122, 117, 111, 119]),
$ta(Int8Array, 21, [68, 102, 109, 124, 120, 33, 80, 101, 102, 101, 108]),
$ta(Int8Array, 21, [68, 102, 115, 105, 98, 101, 34, 86, 125, 99, 105, 118, 107, 102])]);
}
