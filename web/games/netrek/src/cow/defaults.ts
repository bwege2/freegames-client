// @ts-nocheck
// COW 3.3.3 defaults.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { litedefaults } from './beeplite.ts';
import { getshipdefaults } from './getship.ts';
import { getctrlkey, initkeymap } from './input.ts';
import { InitPlayerList } from './playerlist.ts';
import { struct_shipdef, struct_stringlist } from './structs.ts';
import { $rd, $sadd, $sarrOf, $sat, $u64, $view8, $wr, G, P, R, S, __ctype_b_loc, access, atoi, fclose, fgets, fopen, fprintf, getenv, memccpy, memcpy, memset, printf, sprintf, strcat, strcpy, strdup, strlen, strncasecmp, toupper } from '../rt/index.ts';
import { DEFAULTSHIP, MACRO_ENEMY, MACRO_FRIEND, MACRO_ME, MACRO_PLAYER, MACRO_TEAM, MAX_KEY, MAX_MACRO, NBTM, NEWM, NEWMMOUSE, NEWMSPEC, NEWMULTIM, NO_BG_PIX, NO_CLK_PIX, NO_EXP_PIX, NO_FED_PIX, NO_HALOS, NO_IND_PIX, NO_KLI_PIX, NO_MAP_PIX, NO_ORI_PIX, NO_ROM_PIX, NO_WEP_PIX, R_OK, _ISupper, take } from './consts.ts';


export function initDefaults(deffile: Ptr | null): void {
  let fp = null;
  let file = new Int8Array(256);
  let v = null;
  let new_ = null;
  let dm = null;
  let dm_def = null;
  let notdone = 0;
  let c = 0;
  const str = [null];
  let keysused = new Uint8Array(256);
  memset(P(keysused), 0, 256);
  memcpy(G.dist_prefered[0], G.dist_defaults[0], $u64(G.sizedist));
  getshipdefaults();
  if (!deffile) {
    if (findDefaults(deffile, P(file))) {
      deffile = P(file);
    } else {
      return;
    }
  }
  fp = fopen(deffile, S("r"));
  if (!fp) {
    return;
  }
  printf(S("reading defaults file %s\n"), deffile);
  G.macrocnt = 0;
  memccpy(P(G.defaultsFile), deffile, 0, 80);
  while (fgets(P(file), 250, fp)) {
    if ($rd(P(file)) === 35) {
      continue;
    }
    if ($rd(P(file)) !== 0) {
      file[strlen(P(file)) - 1] = 0;
    }
    v = P(file);
    while (v.a[v.o] !== 58 && v.a[v.o] !== 0) {
      v = v.add(1);
    }
    if (v.a[v.o] === 0) {
      continue;
    }
    v.a[v.o] = 0;
    v = v.add(1);
    while (v.a[v.o] === 32 || v.a[v.o] === 9) {
      v = v.add(1);
    }
    if (strncmpi(P(file), S("macro."), 6) === 0) {
      if (G.macrocnt === MAX_MACRO) {
        fprintf(R.stderr, S("Maximum number of macros is %d\n"), MAX_MACRO);
      } else {
        str[0] = P(file).add(6);
        c = getctrlkey(P(str, 0));
        if (c === 63) {
          fprintf(R.stderr, S("Cannot use '?' for a macro\n"));
        } else {
          G.macro[G.macrocnt].type = NBTM;
          G.macro[G.macrocnt].key = c;
          G.macro[G.macrocnt].who = str[0].a[str[0].o + 1];
          G.macro[G.macrocnt].string = strdup(v);
          if (keysused[G.macro[G.macrocnt].key]) {
            G.macro[keysused[G.macro[G.macrocnt].key] - 1].type = NEWMULTIM;
            G.macro[G.macrocnt].type = NEWMULTIM;
          } else {
            keysused[G.macro[G.macrocnt].key] = G.macrocnt + 1 & 0xff;
          }
          ++G.macrocnt;
        }
      }
    } else if (strncmpi(P(file), S("mac."), 4) === 0) {
      if (G.macrocnt === MAX_MACRO) {
        fprintf(R.stderr, S("Maximum number of macros is %d\n"), MAX_MACRO);
      } else {
        str[0] = P(file).add(4);
        c = getctrlkey(P(str, 0));
        if (c === 63) {
          fprintf(R.stderr, S("Cannot use '?' for a macro\n"));
        } else {
          G.macro[G.macrocnt].key = c;
          if (str[0].a[str[0].o] === 46) {
            if (str[0].a[str[0].o + 1] === 37) {
              switch (str[0].a[str[0].o + 2]) {
              case 117:
              case 85:
              case 112:
                G.macro[G.macrocnt].who = MACRO_PLAYER;
                break;
              case 116:
              case 122:
              case 90:
                G.macro[G.macrocnt].who = MACRO_TEAM;
                break;
              case 103:
                G.macro[G.macrocnt].who = MACRO_FRIEND;
                break;
              case 104:
                G.macro[G.macrocnt].who = MACRO_ENEMY;
                break;
              default:
                G.macro[G.macrocnt].who = MACRO_ME;
                break;
              }
              G.macro[G.macrocnt].type = NEWMMOUSE;
            } else {
              G.macro[G.macrocnt].who = str[0].a[str[0].o + 1];
              G.macro[G.macrocnt].type = NEWMSPEC;
            }
          } else {
            G.macro[G.macrocnt].who = 0;
            G.macro[G.macrocnt].type = NEWM;
            if (keysused[G.macro[G.macrocnt].key]) {
              printf(S("Multiline macros of nonstandard types are not recommended.\n"));
              printf(S("You might experience strange behaviour of macros.\n"));
              printf(S("Type: unspecified macro, key: %c.\n"), G.macro[G.macrocnt].key);
            }
          }
          if (keysused[G.macro[G.macrocnt].key]) {
            G.macro[keysused[G.macro[G.macrocnt].key] - 1].type = NEWMULTIM;
            G.macro[G.macrocnt].type = NEWMULTIM;
          } else {
            keysused[G.macro[G.macrocnt].key] = G.macrocnt + 1 & 0xff;
          }
          G.macro[G.macrocnt].string = strdup(v);
          ++G.macrocnt;
        }
      }
    } else if (strncmpi(P(file), S("dist."), 5) === 0) {
      str[0] = P(file).add(5);
      c = getctrlkey(P(str, 0));
      if (str[0].a[str[0].o] !== 46) {
        str[0] = P(file).add(4);
        c = 0;
      }
      str[0] = str[0].add(1);
      notdone = 1;
      for (dm = $sat(G.dist_prefered, take), dm_def = $sat(G.dist_defaults, take); dm.name && notdone; dm = $sadd(dm, 1), dm_def = $sadd(dm_def, 1)) {
        if (strcmpi(str[0], dm.name) === 0) {
          dm.macro = strdup(v);
          if (c) {
            dm.c = c;
            dm_def.c = c;
          }
          notdone = 0;
        }
      }
    } else if (strncasecmp(P(file), S("lite."), 5) === 0) {
      let offset = 5;
      let lt = null;
      if (file[6] === 46) {
        offset = 7;
      }
      notdone = 1;
      for (lt = P(G.distlite, take), dm = $sat(G.dist_prefered, take), dm_def = $sat(G.dist_defaults, take); dm.name && notdone; dm = $sadd(dm, 1), dm_def = $sadd(dm_def, 1), lt = lt.add(1)) {
        if (strcmpi(P(file).add(offset), dm.name) === 0) {
          lt.a[lt.o] = strdup(v);
          notdone = 0;
        }
      }
    } else if (strncmpi(P(file), S("msg."), 4) === 0) {
      str[0] = P(file).add(4);
      notdone = 1;
      for (dm = $sat(G.rcm_msg, 0); dm.name && notdone; dm = $sadd(dm, 1)) {
        if (strcmpi(str[0], dm.name) === 0) {
          dm.macro = strdup(v);
          notdone = 0;
        }
      }
    } else if (strncmpi(P(file), S("key."), 4) === 0) {
      let keycnt = 0;
      if ((keycnt = strlen($view8(P(G.keys), true)) | 0) === MAX_KEY - 1) {
        fprintf(R.stderr, S("Maximum number of keys is %d\n"), MAX_KEY - 1);
      } else {
        str[0] = P(file).add(4);
        c = getctrlkey(P(str, 0));
        G.keys[keycnt] = c;
        G.keys[keycnt + 1] = 0;
        if (str[0].a[str[0].o] !== 46) {
          c = 116;
        } else {
          str[0] = str[0].add(1);
          c = getctrlkey(P(str, 0));
        }
        G.macroKeys[keycnt].dest = c;
        G.macroKeys[keycnt].name = strdup(v);
      }
    } else if (strncmpi(P(file), S("singleMacro"), 11) === 0) {
      let i = 0;
      str[0] = v;
      for (i = 0; str[0].a[str[0].o]; ++i) {
        G.singleMacro[i] = getctrlkey(P(str, 0));
      }
      G.singleMacro[i] = 0;
    }
    if (v.a[v.o] !== 0) {
      new_ = new struct_stringlist();
      new_.next = G.defaults;
      new_.string = strdup(P(file));
      new_.value = strdup(v);
      G.defaults = new_;
    }
  }
  fclose(fp);
}

export function getdefault(str: Ptr | null): Ptr | null {
  let sl = null;
  sl = G.defaults;
  while (!!sl) {
    if (strcmpi(sl.string, str) === 0) {
      return sl.value;
    }
    sl = sl.next;
  }
  return null;
}

export function strcmpi(str1: Ptr | null, str2: Ptr | null): number {
  let chr1 = 0;
  let chr2 = 0;
  let duh = 0;
  let stop = 0;
  stop = strlen(str1) | 0;
  if ($u64(stop) > strlen(str2)) {
    return 1;
  } else if ($u64(stop) < strlen(str2)) {
    return -1;
  }
  for (duh = 0; duh < stop; ++duh) {
    chr1 = ($rd($rd(__ctype_b_loc()), str1.a[str1.o + duh]) & _ISupper ? str1.a[str1.o + duh] : toupper(str1.a[str1.o + duh])) << 24 >> 24;
    chr2 = ($rd($rd(__ctype_b_loc()), str2.a[str2.o + duh]) & _ISupper ? str2.a[str2.o + duh] : toupper(str2.a[str2.o + duh])) << 24 >> 24;
    if (chr1 === 0 || chr2 === 0) {
      return 0;
    }
    if (chr1 !== chr2) {
      return chr2 - chr1;
    }
  }
  return 0;
}

export function strncmpi(str1: Ptr | null, str2: Ptr | null, max: number): number {
  let chr1 = 0;
  let chr2 = 0;
  let duh = 0;
  let stop = 0;
  stop = strlen(str1) | 0;
  if (stop < max) {
    return -1;
  }
  if (stop > max) {
    stop = max;
  }
  if ($u64(stop) > strlen(str2)) {
    return 1;
  }
  for (duh = 0; duh < stop; ++duh) {
    chr1 = ($rd($rd(__ctype_b_loc()), str1.a[str1.o + duh]) & _ISupper ? str1.a[str1.o + duh] : toupper(str1.a[str1.o + duh])) << 24 >> 24;
    chr2 = ($rd($rd(__ctype_b_loc()), str2.a[str2.o + duh]) & _ISupper ? str2.a[str2.o + duh] : toupper(str2.a[str2.o + duh])) << 24 >> 24;
    if (chr1 === 0 || chr2 === 0) {
      return 0;
    }
    if (chr1 !== chr2) {
      return chr2 - chr1;
    }
  }
  return 0;
}

export function booleanDefault(def: Ptr | null, preferred: number): number {
  let str = null;
  str = getdefault(def);
  if (!str) {
    return preferred;
  }
  if (strncmpi(str, S("on"), 2) === 0 || strncmpi(str, S("true"), 4) === 0) {
    return 1;
  } else {
    return 0;
  }
}

export function intDefault(def: Ptr | null, preferred: number): number {
  let str = null;
  str = getdefault(def);
  if (!str) {
    return preferred;
  }
  return atoi(str);
}

export function findDefaults(deffile: Ptr | null, file: Ptr | null): number {
  if (findfile(S(".netrekrc"), file)) {
    return 1;
  }
  if (findfile(S(".xtrekrc"), file)) {
    return 1;
  }
  if (findfile(S("/etc/netrek-client-cow/netrekrc"), file)) {
    return 1;
  }
  return 0;
}

export function resetdefaults(): void {
  let pek = null;
  let tmp = new Int8Array(100);
  let i = 0;
  G.keepInfo = intDefault(S("keepInfo"), G.keepInfo);
  G.showPlanetOwner = booleanDefault(S("showPlanetOwner"), G.showPlanetOwner);
  G.newDashboard = intDefault(S("newDashboard"), G.newDashboard);
  G.ROMVLVS = booleanDefault(S("ROMVLVS"), G.ROMVLVS);
  G.client_ups = intDefault(S("updatespersec"), G.client_ups);
  G.redrawDelay = intDefault(S("redrawDelay"), G.redrawDelay);
  G.logmess = booleanDefault(S("logging"), G.logmess);
  G.phaserShrink = intDefault(S("phaserShrink"), G.phaserShrink);
  if (G.phaserShrink > 16) {
    G.phaserShrink = 16;
  }
  G.theirPhaserShrink = intDefault(S("theirPhaserShrink"), G.theirPhaserShrink);
  if (G.phaserShrink > 16) {
    G.phaserShrink = 16;
  }
  G.shrinkPhaserOnMiss = booleanDefault(S("shrinkPhaserOnMiss"), G.shrinkPhaserOnMiss);
  G.VShieldBitmaps = booleanDefault(S("varyShields"), G.VShieldBitmaps);
  G.warnShields = booleanDefault(S("warnShields"), G.warnShields);
  G.netstat = booleanDefault(S("netstats"), G.netstat);
  G.netstatfreq = intDefault(S("netstatfreq"), G.netstatfreq);
  if (G.netstatfreq <= 0) {
    G.netstatfreq = 1;
  }
  G.showlocal = intDefault(S("showlocal"), G.showlocal);
  if (G.showlocal > 4) {
    G.showlocal = 2;
  }
  G.showgalactic = intDefault(S("showgalactic"), G.showgalactic);
  if (G.showgalactic > 4) {
    G.showgalactic = 2;
  }
  if (!booleanDefault(S("colorgalactic"), 1)) {
    G.pixFlags |= NO_MAP_PIX;
  }
  if (!booleanDefault(S("showstars"), 1)) {
    G.pixFlags |= NO_BG_PIX;
  }
  if (!booleanDefault(S("ownerhalo"), 0)) {
    G.pixFlags |= NO_HALOS;
  }
  if (!booleanDefault(S("indPix"), 1)) {
    G.pixFlags |= NO_IND_PIX;
  }
  if (!booleanDefault(S("fedPix"), 1)) {
    G.pixFlags |= NO_FED_PIX;
  }
  if (!booleanDefault(S("romPix"), 1)) {
    G.pixFlags |= NO_ROM_PIX;
  }
  if (!booleanDefault(S("kliPix"), 1)) {
    G.pixFlags |= NO_KLI_PIX;
  }
  if (!booleanDefault(S("oriPix"), 1)) {
    G.pixFlags |= NO_ORI_PIX;
  }
  if (!booleanDefault(S("shipPix"), 1)) {
    G.pixFlags |= NO_IND_PIX | NO_FED_PIX | NO_ROM_PIX | NO_KLI_PIX | NO_ORI_PIX;
  }
  if (!booleanDefault(S("weaponPix"), 1)) {
    G.pixFlags |= NO_WEP_PIX;
  }
  if (!booleanDefault(S("explosionPix"), 1)) {
    G.pixFlags |= NO_EXP_PIX;
  }
  if (!booleanDefault(S("cloakPix"), 1)) {
    G.pixFlags |= NO_CLK_PIX;
  }
  if (!booleanDefault(S("mapPix"), 1)) {
    G.pixFlags |= NO_MAP_PIX;
  }
  if (!booleanDefault(S("backgroundPix"), 1)) {
    G.pixFlags |= NO_BG_PIX;
  }
  G.pixFlags = intDefault(S("pixFlags"), G.pixFlags);
  G.pixFlags |= G.pixMissing;
  G.showLock = intDefault(S("showLock"), G.showLock);
  if (G.showLock > 3) {
    G.showLock = 3;
  }
  G.showPhaser = intDefault(S("PhaserMsg"), G.showPhaser);
  G.messageHUD = intDefault(S("messageHUD"), G.messageHUD);
  G.messHoldThresh = intDefault(S("messageHoldThresh"), G.messHoldThresh);
  G.showPhaser = intDefault(S("PhaserMsg"), G.showPhaser);
  G.phaserShowStats = booleanDefault(S("PhaserStats"), G.phaserShowStats);
  G.showStats = booleanDefault(S("showstats"), G.showStats);
  G.keeppeace = booleanDefault(S("keeppeace"), G.keeppeace);
  G.continuetractor = booleanDefault(S("continuetractor"), G.continuetractor);
  G.showTractorPressor = booleanDefault(S("showTractorPressor"), G.showTractorPressor);
  G.extraBorder = booleanDefault(S("extraAlertBorder"), G.extraBorder);
  G.namemode = booleanDefault(S("showplanetnames"), 1);
  G.reportKills = booleanDefault(S("reportKills"), G.reportKills);
  G.udpDebug = intDefault(S("udpDebug"), G.udpDebug);
  G.udpClientSend = intDefault(S("udpClientSend"), G.udpClientSend);
  G.udpClientRecv = intDefault(S("udpClientReceive"), G.udpClientRecv);
  G.tryUdp = booleanDefault(S("tryUdp"), G.tryUdp);
  G.tryUdp1 = G.tryUdp;
  G.udpSequenceChk = booleanDefault(S("udpSequenceCheck"), G.udpSequenceChk);
  G.baseLocalPort = intDefault(S("baseLocalPort"), G.baseLocalPort);
  G.tryShort = booleanDefault(S("tryShort"), G.tryShort);
  G.tryShort1 = G.tryShort;
  G.UseNewDistress = booleanDefault(S("newDistress"), G.UseNewDistress);
  G.rejectMacro = booleanDefault(S("rejectMacro"), G.rejectMacro);
  G.enemyPhasers = intDefault(S("enemyPhasers"), G.enemyPhasers);
  pek = getdefault(S("cloakChars"));
  if (!!pek) {
    memccpy(P(G.cloakChars), pek, 0, 3);
  }
  G.showIND = booleanDefault(S("showIND"), G.showIND);
  InitPlayerList();
  if (G.ignore_signals >= 0) {
    G.ignore_signals = booleanDefault(S("ignoreSignals"), G.ignore_signals);
    if (G.ignore_signals) {
      printf(S("Ignoring signals SIGSEGV and SIGBUS\n"));
    }
  } else {
    G.ignore_signals = G.ignore_signals === -1 ? 1 : 0;
  }
  G.highlightFriendlyPhasers = booleanDefault(S("highlightFriendlyPhasers"), G.highlightFriendlyPhasers);
  G.mouse_as_shift = booleanDefault(S("mouseAsShift"), G.mouse_as_shift);
  G.motion_mouse = booleanDefault(S("continuousMouse"), G.motion_mouse);
  G.user_motion_thresh = intDefault(S("motionThresh"), G.user_motion_thresh);
  G.extended_mouse = booleanDefault(S("shiftedMouse"), G.extended_mouse);
  G.ignoreCaps = booleanDefault(S("ignoreCaps"), G.ignoreCaps);
  G.use_tng_fed_bitmaps = booleanDefault(S("useTNGBitmaps"), G.use_tng_fed_bitmaps);
  G.vary_hull = booleanDefault(S("warnHull"), G.vary_hull);
  G.sound_init = booleanDefault(S("sound"), G.sound_init);
  G.shelltools = booleanDefault(S("shellTools"), G.shelltools);
  G.portSwap = booleanDefault(S("portSwap"), G.portSwap);
  G.DefLite = booleanDefault(S("DefLite"), G.DefLite);
  G.UseLite = booleanDefault(S("UseLite"), G.UseLite);
  if (G.DefLite) {
    litedefaults();
  }
  G.beep_lite_cycle_time_planet = intDefault(S("planetCycleTime"), G.beep_lite_cycle_time_planet);
  G.beep_lite_cycle_time_player = intDefault(S("playerCycleTime"), G.beep_lite_cycle_time_player);
  G.tts_time = intDefault(S("tts_time"), G.tts_time);
  G.tts_max_len = intDefault(S("tts_max_len"), G.tts_max_len);
  G.tts_pos = intDefault(S("tts_pos"), G.tts_pos);
  G.censorMessages = booleanDefault(S("censorMessages"), G.censorMessages);
  G.shipdefaults[DEFAULTSHIP].keymap = $view8(getdefault(S("keymap")), false);
  G.shipdefaults[DEFAULTSHIP].buttonmap = $view8(getdefault(S("buttonmap")), false);
  G.shipdefaults[DEFAULTSHIP].ckeymap = $view8(getdefault(S("ckeymap")), false);
  for (i = DEFAULTSHIP; i >= 0; --i) {
    memccpy(P(tmp), S("rcfile-"), 0, 8);
    strcat(P(tmp), G.shipdefaults[i].name);
    if (pek = getdefault(P(tmp))) {
      G.shipdefaults[i].rcfile = pek;
    } else {
      G.shipdefaults[i].rcfile = G.shipdefaults[DEFAULTSHIP].rcfile;
    }
    memccpy(P(tmp), S("keymap-"), 0, 8);
    strcat(P(tmp), G.shipdefaults[i].name);
    if (pek = getdefault(P(tmp))) {
      G.shipdefaults[i].keymap = $view8(pek, false);
    } else {
      G.shipdefaults[i].keymap = G.shipdefaults[DEFAULTSHIP].keymap;
    }
    memccpy(P(tmp), S("ckeymap-"), 0, 9);
    strcat(P(tmp), G.shipdefaults[i].name);
    if (pek = getdefault(P(tmp))) {
      G.shipdefaults[i].ckeymap = $view8(pek, false);
    } else {
      G.shipdefaults[i].ckeymap = G.shipdefaults[DEFAULTSHIP].ckeymap;
    }
    memccpy(P(tmp), S("buttonmap-"), 0, 11);
    strcat(P(tmp), G.shipdefaults[i].name);
    if (pek = getdefault(P(tmp))) {
      G.shipdefaults[i].buttonmap = $view8(pek, false);
    } else {
      G.shipdefaults[i].buttonmap = G.shipdefaults[DEFAULTSHIP].buttonmap;
    }
  }
  G.myshipdef = $sat(G.shipdefaults, G.myshiptype);
}

export function shipchange(type: number): void {
  if (type === G.myshiptype) {
    return;
  }
  G.myshiptype = type;
  G.myshipdef = $sat(G.shipdefaults, type);
  if (G.shipdefaults[type].rcfile) {
    initDefaults(G.shipdefaults[type].rcfile);
    resetdefaults();
  }
  initkeymap();
}

export function findfile(fname: Ptr | null, found: Ptr | null): number {
  let accessible = 0;
  let home = null;
  accessible = access(fname, R_OK);
  if (strlen(fname) > 0 && accessible === 0) {
    strcpy(found, fname);
    return 1;
  }
  home = getenv(S("HOME"));
  if (home) {
    let len = strlen(home) | 0;
    if (home.a[home.o + (len - 1)] === 47) {
      sprintf(found, S("%s%s"), home, fname);
    } else {
      sprintf(found, S("%s/%s"), home, fname);
    }
  }
  accessible = access(found, 4);
  if (strlen(found) > 0 && accessible === 0) {
    return 1;
  }
  ;
  return 0;
}

export function $init(): void {
  G.defaults = null;
  G.shipdefaults = $sarrOf([struct_shipdef.$of(S("sc")),
struct_shipdef.$of(S("dd")),
struct_shipdef.$of(S("ca")),
struct_shipdef.$of(S("bb")),
struct_shipdef.$of(S("as")),
struct_shipdef.$of(S("sb")),
struct_shipdef.$of(S("ga")),
struct_shipdef.$of(S("att")),
struct_shipdef.$of(S("default"))]);
  G.myshiptype = DEFAULTSHIP;
  G.myshipdef = G.shipdefaults[DEFAULTSHIP];
}
