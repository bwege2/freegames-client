// @ts-nocheck
// NetHack 3.6.7 mplayer.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { mk_artifact } from './artifact.ts';
import { rank_of } from './botl.ts';
import { christen_monst } from './do_name.ts';
import { makemon, mkmonmoney, mongets, set_malign } from './makemon.ts';
import { bless, curse, mkobj, mksobj } from './mkobj.ts';
import { monsndx, set_mon_data } from './mondata.ts';
import { rnd_defensive_item, rnd_misc_item, rnd_offensive_item } from './muse.ts';
import { rnd_class } from './objnam.ts';
import { impossible, pline } from './pline.ts';
import { d, rn2, rnd } from './rnd.ts';
import { mpickobj } from './steal.ts';
import { goodpos, rloc } from './teleport.ts';
import { monmightthrowwep } from './weapon.ts';
import { m_dowear } from './worn.ts';
import { struct_monst, struct_permonst } from './structs.ts';
import { $sat, $sidx, G, P, S, strcat, strcmp, strcpy, strlen, strncmp } from './rt/index.ts';
import { ART_MAGICBANE, ATHAME, A_NONE, BATTLE_AXE, BLACK_DRAGON_SCALE_MAIL, BULLWHIP, CHAIN_MAIL, CLOAK_OF_DISPLACEMENT, CLOAK_OF_MAGIC_RESISTANCE, CLUB, DILITHIUM_CRYSTAL, ELVEN_DAGGER, ELVEN_LEATHER_HELM, ELVEN_SHIELD, FAKE_AMULET_OF_YENDOR, FALSE, GAUNTLETS_OF_DEXTERITY, GAUNTLETS_OF_POWER, GRAY_DRAGON_SCALE_MAIL, HELM_OF_BRILLIANCE, HELM_OF_TELEPATHY, JADE, KATANA, LEATHER_GLOVES, LEVITATION_BOOTS, LOADSTONE, LONG_SWORD, LOW_BOOTS, LUCKSTONE, MACE, NO_MM_FLAGS, OILSKIN_CLOAK, ORCISH_DAGGER, PLATE_MAIL, P_SPEAR, QUARTERSTAFF, RANDOM_CLASS, ROBE, ROWNO, SCALPEL, SHIELD_OF_REFLECTION, SHORT_SWORD, SHURIKEN, SILVER_DRAGON_SCALE_MAIL, SPEAR, STRANGE_OBJECT, TRUE, TWO_HANDED_SWORD, UNICORN_HORN, WAR_HAMMER, WEAPON_CLASS, YELLOW_DRAGON_SCALE_MAIL } from './consts.ts';

let developers: any;
let mplayer_talk$same_class_msg: any;
let mplayer_talk$other_class_msg: any;

function dev_name(): Ptr | null {
  let i = 0;
  let m = 0;
  let n = Math.trunc(464 / 8) | 0;
  let mtmp = null;
  let match = 0;
  do {
    match = FALSE;
    i = rn2(n);
    for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
      if (!($sidx(mtmp.data) >= $sidx($sat(G.mons, 328)) && $sidx(mtmp.data) <= $sidx($sat(G.mons, 342)))) {
        continue;
      }
      if (!strncmp(developers[i], mtmp.mextra && mtmp.mextra.mname ? mtmp.mextra.mname : S(""), strlen(developers[i]))) {
        match = TRUE;
        break;
      }
    }
    ++m;
  } while (match && m < 100);
  if (match) {
    return null;
  }
  return developers[i];
}

async function get_mplname(mtmp: struct_monst | null, nam: Ptr | null): Promise<void> {
  let fmlkind = ((mtmp.data.mflags2 & 131072) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
  let devnam = null;
  devnam = dev_name();
  if (!devnam) {
    strcpy(nam, fmlkind ? S("Eve") : S("Adam"));
  } else if (fmlkind && !!strcmp(devnam, S("Janet"))) {
    strcpy(nam, rn2(2) ? S("Maud") : S("Eve"));
  } else {
    strcpy(nam, devnam);
  }
  if (fmlkind || !strcmp(nam, S("Janet"))) {
    mtmp.female = 1;
  } else {
    mtmp.female = 0;
  }
  strcat(nam, S(" the "));
  strcat(nam, rank_of(mtmp.m_lev, await monsndx(mtmp.data), mtmp.female << 24 >> 24));
}

async function mk_mplayer_armor(mon: struct_monst | null, typ: number): Promise<void> {
  let obj = null;
  if (typ === STRANGE_OBJECT) {
    return;
  }
  obj = await mksobj(typ, FALSE, FALSE);
  if (!rn2(3)) {
    obj.oerodeproof = 1;
  }
  if (!rn2(3)) {
    await curse(obj);
  }
  if (!rn2(3)) {
    await bless(obj);
  }
  obj.spe = (rn2(10) ? rn2(3) ? rn2(5) : rn2(4) + 4 : -rnd(3)) << 24 >> 24;
  await mpickobj(mon, obj);
}

export async function mk_mplayer(ptr: struct_permonst | null, x: number, y: number, special: number): Promise<struct_monst | null> {
  let mtmp = null;
  let nam = new Int8Array(32);
  if (!($sidx(ptr) >= $sidx($sat(G.mons, 328)) && $sidx(ptr) <= $sidx($sat(G.mons, 342)))) {
    return null;
  }
  if (!!G.level.monsters[x][y]) {
    await rloc(!!G.level.monsters[x][y] ? G.level.monsters[x][y] : null, FALSE);
  }
  if (!(G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum)) {
    special = FALSE;
  }
  if (!!(mtmp = await makemon(ptr, x, y, NO_MM_FLAGS))) {
    let weapon = 0;
    let armor = 0;
    let cloak = 0;
    let helm = 0;
    let shield = 0;
    let quan = 0;
    let otmp = null;
    mtmp.m_lev = (special ? rn2(16) + 15 : rnd(16)) & 0xff;
    mtmp.mhp = mtmp.mhpmax = d(mtmp.m_lev, 10) + (special ? 30 + rnd(30) : 30);
    if (special) {
      await get_mplname(mtmp, P(nam));
      mtmp = await christen_monst(mtmp, P(nam));
      await mongets(mtmp, FAKE_AMULET_OF_YENDOR);
    }
    mtmp.mpeaceful = 0;
    set_malign(mtmp);
    weapon = (!rn2(2) ? LONG_SWORD : rnd_class(SPEAR, BULLWHIP)) << 16 >> 16;
    armor = rnd_class(GRAY_DRAGON_SCALE_MAIL, YELLOW_DRAGON_SCALE_MAIL) << 16 >> 16;
    cloak = (!rn2(8) ? STRANGE_OBJECT : rnd_class(OILSKIN_CLOAK, CLOAK_OF_DISPLACEMENT)) << 16 >> 16;
    helm = (!rn2(8) ? STRANGE_OBJECT : rnd_class(ELVEN_LEATHER_HELM, HELM_OF_TELEPATHY)) << 16 >> 16;
    shield = (!rn2(8) ? STRANGE_OBJECT : rnd_class(ELVEN_SHIELD, SHIELD_OF_REFLECTION)) << 16 >> 16;
    switch (await monsndx(ptr)) {
    case 328:
      if (rn2(2)) {
        weapon = BULLWHIP;
      }
      break;
    case 329:
      if (rn2(2)) {
        weapon = (rn2(2) ? TWO_HANDED_SWORD : BATTLE_AXE) << 16 >> 16;
        shield = STRANGE_OBJECT;
      }
      if (rn2(2)) {
        armor = rnd_class(PLATE_MAIL, CHAIN_MAIL) << 16 >> 16;
      }
      if (helm === HELM_OF_BRILLIANCE) {
        helm = STRANGE_OBJECT;
      }
      break;
    case 330:
    case 331:
      if (rn2(4)) {
        weapon = MACE;
      } else if (rn2(2)) {
        weapon = CLUB;
      }
      if (helm === HELM_OF_BRILLIANCE) {
        helm = STRANGE_OBJECT;
      }
      break;
    case 332:
      if (rn2(4)) {
        weapon = QUARTERSTAFF;
      } else if (rn2(2)) {
        weapon = (rn2(2) ? UNICORN_HORN : SCALPEL) << 16 >> 16;
      }
      if (rn2(4)) {
        helm = (rn2(2) ? HELM_OF_BRILLIANCE : HELM_OF_TELEPATHY) << 16 >> 16;
      }
      if (rn2(2)) {
        shield = STRANGE_OBJECT;
      }
      break;
    case 333:
      if (rn2(4)) {
        weapon = LONG_SWORD;
      }
      if (rn2(2)) {
        armor = rnd_class(PLATE_MAIL, CHAIN_MAIL) << 16 >> 16;
      }
      break;
    case 334:
      weapon = (!rn2(3) ? SHURIKEN : STRANGE_OBJECT) << 16 >> 16;
      armor = STRANGE_OBJECT;
      cloak = ROBE;
      if (rn2(2)) {
        shield = STRANGE_OBJECT;
      }
      break;
    case 335:
    case 336:
      if (rn2(2)) {
        weapon = MACE;
      }
      if (rn2(2)) {
        armor = rnd_class(PLATE_MAIL, CHAIN_MAIL) << 16 >> 16;
      }
      if (rn2(4)) {
        cloak = ROBE;
      }
      if (rn2(4)) {
        helm = (rn2(2) ? HELM_OF_BRILLIANCE : HELM_OF_TELEPATHY) << 16 >> 16;
      }
      if (rn2(2)) {
        shield = STRANGE_OBJECT;
      }
      break;
    case 337:
      if (rn2(2)) {
        weapon = ELVEN_DAGGER;
      }
      break;
    case 338:
      if (rn2(2)) {
        weapon = (rn2(2) ? SHORT_SWORD : ORCISH_DAGGER) << 16 >> 16;
      }
      break;
    case 339:
      if (rn2(2)) {
        weapon = KATANA;
      }
      break;
    case 340:
      break;
    case 341:
      if (rn2(2)) {
        weapon = WAR_HAMMER;
      }
      if (rn2(2)) {
        armor = rnd_class(PLATE_MAIL, CHAIN_MAIL) << 16 >> 16;
      }
      break;
    case 342:
      if (rn2(4)) {
        weapon = (rn2(2) ? QUARTERSTAFF : ATHAME) << 16 >> 16;
      }
      if (rn2(2)) {
        armor = (rn2(2) ? BLACK_DRAGON_SCALE_MAIL : SILVER_DRAGON_SCALE_MAIL) << 16 >> 16;
        cloak = CLOAK_OF_MAGIC_RESISTANCE;
      }
      if (rn2(4)) {
        helm = HELM_OF_BRILLIANCE;
      }
      shield = STRANGE_OBJECT;
      break;
    default:
      await impossible(S("bad mplayer monster"));
      weapon = 0;
      break;
    }
    if (weapon !== STRANGE_OBJECT) {
      otmp = await mksobj(weapon, TRUE, FALSE);
      otmp.spe = (special ? rn2(5) + 4 : rn2(4)) << 24 >> 24;
      if (!rn2(3)) {
        otmp.oerodeproof = 1;
      } else if (!rn2(2)) {
        otmp.greased = 1;
      }
      if (special && rn2(2)) {
        otmp = await mk_artifact(otmp, A_NONE);
      }
      if (G.objects[otmp.otyp].oc_merge | 0 && !otmp.oartifact && monmightthrowwep(otmp)) {
        otmp.quan += rn2(otmp.oclass === WEAPON_CLASS && G.objects[otmp.otyp].oc_subtyp === P_SPEAR ? 4 : 8);
      }
      if (otmp.oartifact === ART_MAGICBANE) {
        otmp.spe = rnd(4) << 24 >> 24;
      }
      await mpickobj(mtmp, otmp);
    }
    if (special) {
      if (!rn2(10)) {
        await mongets(mtmp, rn2(3) ? LUCKSTONE : LOADSTONE);
      }
      await mk_mplayer_armor(mtmp, armor);
      await mk_mplayer_armor(mtmp, cloak);
      await mk_mplayer_armor(mtmp, helm);
      await mk_mplayer_armor(mtmp, shield);
      if (weapon === WAR_HAMMER) {
        await mk_mplayer_armor(mtmp, GAUNTLETS_OF_POWER);
      } else if (rn2(8)) {
        await mk_mplayer_armor(mtmp, rnd_class(LEATHER_GLOVES, GAUNTLETS_OF_DEXTERITY));
      }
      if (rn2(8)) {
        await mk_mplayer_armor(mtmp, rnd_class(LOW_BOOTS, LEVITATION_BOOTS));
      }
      await m_dowear(mtmp, TRUE);
      quan = rn2(3) ? rn2(3) : rn2(16);
      while (quan--) {
        await mongets(mtmp, rnd_class(DILITHIUM_CRYSTAL, JADE));
      }
      await mkmonmoney(mtmp, rn2(1000));
      quan = rn2(10);
      while (quan--) {
        await mpickobj(mtmp, await mkobj(RANDOM_CLASS, FALSE));
      }
    }
    quan = rnd(3);
    while (quan--) {
      await mongets(mtmp, await rnd_offensive_item(mtmp));
    }
    quan = rnd(3);
    while (quan--) {
      await mongets(mtmp, await rnd_defensive_item(mtmp));
    }
    quan = rnd(3);
    while (quan--) {
      await mongets(mtmp, await rnd_misc_item(mtmp));
    }
  }
  return mtmp;
}

export async function create_mplayers(num: number, special: number): Promise<void> {
  let pm = 0;
  let x = 0;
  let y = 0;
  let fakemon = new struct_monst();
  fakemon.$cp(G.zeromonst);
  while (num) {
    let tryct = 0;
    pm = rn2(342 - 328 + 1) + 328;
    await set_mon_data(fakemon, $sat(G.mons, pm));
    do {
      x = rn2(80 - 4) + 2;
      y = rnd(ROWNO - 2);
    } while (!goodpos(x, y, fakemon, 0) && tryct++ <= 50);
    if (tryct > 50) {
      return;
    }
    await mk_mplayer($sat(G.mons, pm), x << 24 >> 24, y << 24 >> 24, special);
    --num;
  }
}

export async function mplayer_talk(mtmp: struct_monst | null): Promise<void> {
  if (mtmp.mpeaceful) {
    return;
  }
  await pline(S("Talk? -- %s"), mtmp.data === $sat(G.mons, G.urole.malenum) || mtmp.data === $sat(G.mons, G.urole.femalenum) ? mplayer_talk$same_class_msg[rn2(3)] : mplayer_talk$other_class_msg[rn2(3)]);
}

export function $init(): void {
  developers = [S("Alex"),
S("Dave"),
S("Dean"),
S("Derek"),
S("Eric"),
S("Izchak"),
S("Janet"),
S("Jessie"),
S("Ken"),
S("Kevin"),
S("Michael"),
S("Mike"),
S("Pasi"),
S("Pat"),
S("Patric"),
S("Paul"),
S("Sean"),
S("Steve"),
S("Timo"),
S("Warwick"),
S("Bill"),
S("Eric"),
S("Keizo"),
S("Ken"),
S("Kevin"),
S("Michael"),
S("Mike"),
S("Paul"),
S("Stephen"),
S("Steve"),
S("Timo"),
S("Yitzhak"),
S("Andy"),
S("Gregg"),
S("Janne"),
S("Keni"),
S("Mike"),
S("Olaf"),
S("Richard"),
S("Andy"),
S("Chris"),
S("Dean"),
S("Jon"),
S("Jonathan"),
S("Kevin"),
S("Wang"),
S("Eric"),
S("Marvin"),
S("Warwick"),
S("Alex"),
S("Dion"),
S("Michael"),
S("Helge"),
S("Ron"),
S("Timo"),
S("Joshua"),
S("Pat"),
S("")];
  mplayer_talk$same_class_msg = [S("I can't win, and neither will you!"), S("You don't deserve to win!"), S("Mine should be the honor, not yours!")];
  mplayer_talk$other_class_msg = [S("The low-life wants to talk, eh?"), S("Fight, scum!"), S("Here is what I have to say!")];
}
