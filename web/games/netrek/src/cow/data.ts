// @ts-nocheck
// COW 3.3.3 data.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { struct_dmacro_list, struct_key_list, struct_macro_list, struct_memory, struct_plupdate, struct_rank, struct_s_line, struct_ship } from './structs.ts';
import { $arr, $cs, $sarr, $sarrOf, $ta, G, S } from '../rt/index.ts';
import { LITE_PLANETS, LITE_PLAYERS_LOCAL, LITE_PLAYERS_MAP, LITE_SELF, LITE_SOUNDS, LITE_TTS, PFGREEN, TWINSIDE } from './consts.ts';


export function $init(): void {
  G.players = null;
  G.me = null;
  G.torps = null;
  G.plasmatorps = null;
  G.status = null;
  G.myship = null;
  G.mystats = null;
  G.planets = null;
  G.phasers = null;
  G.messages = null;
  G.mctl = null;
  G.context = null;
  G.universe = new struct_memory();
  G.ghoststart = 0;
  G.ghost_pno = 0;
  G.keepInfo = 15;
  G.showPlanetOwner = 0;
  G.phaserShrink = 0;
  G.theirPhaserShrink = 0;
  G.shrinkPhaserOnMiss = 0;
  G.newDashboard = 3;
  G.old_db = 3;
  G.detCircle = 0;
  G.fastQuit = 0;
  G.gen_distress = 0;
  G.niftyNewMessages = 1;
  G.oldalert = PFGREEN;
  G.remap = $ta(Int32Array, 16, [0, 1, 2, 0, 3, 0, 0, 0, 4]);
  G.messpend = 0;
  G.messageHUD = 0;
  G.messHoldThresh = 0;
  G.messMouseDelta = 0;
  G.lastcount = 0;
  G.mdisplayed = 0;
  G.udcounter = 0;
  G.showTractorPressor = 1;
  G.showLock = 3;
  G.showPhaser = 2;
  G.autoKey = 0;
  G.extraBorder = 1;
  G.tryUdp = 1;
  G.tryUdp1 = 1;
  G.pl_update = $sarr(struct_plupdate, 40);
  G.buttonmap = new Int8Array(32);
  G.delay = 0;
  G.rdelay = 0;
  G.namemode = 1;
  G.quittime = 60;
  G.showStats = 0;
  G.warnShields = 0;
  G.ROMVLVS = 0;
  G.warncount = 0;
  G.warntimer = -1;
  G.infomapped = 0;
  G.mustexit = 0;
  G.messtime = 5;
  G.keeppeace = 0;
  G.msgBeep = 1;
  G.logmess = 0;
  G.continuetractor = 1;
  G.tcounter = 2;
  G.showlocal = 2;
  G.showgalactic = 2;
  G.pixMissing = 0;
  G.pixFlags = 0;
  G.title = null;
  G.shipnos = S("0123456789abcdefghijklmnopqrstuvwxyz");
  G.sock = -1;
  G.xtrekPort = -1;
  G.queuePos = -1;
  G.pickOk = -1;
  G.lastRank = -1;
  G.promoted = 0;
  G.rotate = 0;
  G.rotate_deg = 0;
  G.loginAccept = -1;
  G.localflags = 0;
  G.tournMask = 15;
  G.nextSocket = 0;
  G.serverName = null;
  G.defaultsFile = $cs("", 80);
  G.myname = null;
  G.loggedIn = 0;
  G.reinitPlanets = 0;
  G.timerDelay = 200000;
  G.redrawDelay = 0;
  G.reportKills = 1;
  G.phaserWindow = 0;
  G.phaserShowStats = 0;
  G.phaserStatTry = 0;
  G.phaserStatHit = 0;
  G.censorMessages = 0;
  G.recordFile = null;
  G.recordIndexFile = null;
  G.recordContextFile = null;
  G.playback = 0;
  G.logFile = null;
  G.scanplayer = 0;
  G.showTractor = 1;
  G.commMode = 0;
  G.commModeReq = 0;
  G.commStatus = 0;
  G.commSwitchTimeout = 0;
  G.udpTotal = 1;
  G.udpDropped = 0;
  G.udpRecentDropped = 0;
  G.udpSock = -1;
  G.udpDebug = 0;
  G.udpClientSend = 1;
  G.udpClientRecv = 1;
  G.udpSequenceChk = 1;
  G.weaponUpdate = 0;
  G.baseLocalPort = 0;
  G.debug = 0;
  G.messageon = 0;
  G.SBhours = 0;
  G.why_dead = 0;
  G.tryShort = 1;
  G.tryShort1 = 1;
  G.recv_short = 0;
  G.recv_mesg = 1;
  G.recv_kmesg = 1;
  G.recv_threshold = 0;
  G.recv_threshold_s = $ta(Int8Array, 8, [48]);
  G.recv_warn = 1;
  G.netstat = 0;
  G.netstatfreq = 5;
  G.netstatWin = null;
  G.lMeter = null;
  G.client_ups = 50;
  G.server_ups = 50;
  G.server_fps = 50;
  G.visual_l = 0;
  G.metaserver = S("metaserver.netrek.org");
  G.metaport = 3521;
  G.macro = $sarr(struct_macro_list, 500);
  G.MacroMode = 0;
  G.macrocnt = 0;
  G.stipple = null;
  G.clockpic = null;
  G.icon = null;
  G.borderColor = 0;
  G.backColor = 0;
  G.textColor = 0;
  G.myColor = 0;
  G.warningColor = 0;
  G.shipCol = new Int32Array(5);
  G.rColor = 0;
  G.yColor = 0;
  G.gColor = 0;
  G.unColor = 0;
  G.foreColor = 0;
  G.expview = new Array(5).fill(null);
  G.sbexpview = new Array(7).fill(null);
  G.cloud = new Array(5).fill(null);
  G.plasmacloud = new Array(5).fill(null);
  G.etorp = null;
  G.mtorp = null;
  G.eplasmatorp = null;
  G.mplasmatorp = null;
  G.shield = new Array(5).fill(null);
  G.cloakicon = null;
  G.VShieldBitmaps = 1;
  G.tractbits = null;
  G.pressbits = null;
  G.fed_bitmaps = $arr(8, () => new Array(16).fill(null));
  G.kli_bitmaps = $arr(8, () => new Array(16).fill(null));
  G.rom_bitmaps = $arr(8, () => new Array(16).fill(null));
  G.ori_bitmaps = $arr(8, () => new Array(16).fill(null));
  G.ind_bitmaps = $arr(8, () => new Array(16).fill(null));
  G.ROMVLVS_bitmap = new Array(16).fill(null);
  G.bplanets = new Array(7).fill(null);
  G.mbplanets = new Array(7).fill(null);
  G.bplanets2 = new Array(8).fill(null);
  G.mbplanets2 = new Array(8).fill(null);
  G.bplanets3 = new Array(8).fill(null);
  G.mbplanets3 = new Array(8).fill(null);
  G.noinfoplanet = null;
  G.MacroNum = 0;
  G.lastMessage = new Int8Array(80);
  G.classes = [S("SC"),
S("DD"),
S("CA"),
S("BB"),
S("AS"),
S("SB"),
S("GA"),
S("AT")];
  G.teamlet = $ta(Int8Array, 16, [73, 70, 82, 88, 75, 88, 88, 88, 79, 88, 88, 88, 88, 88, 88, 65]);
  G.teamshort = [S("IND"),
S("FED"),
S("ROM"),
S("X"),
S("KLI"),
S("X"),
S("X"),
S("X"),
S("ORI"),
S("X"),
S("X"),
S("X"),
S("X"),
S("X"),
S("X"),
S("ALL")];
  G.pseudo = new Int8Array(16);
  G.defpasswd = new Int8Array(16);
  G.login = new Int8Array(16);
  G.shipvals = $sarr(struct_ship, 8);
  G.default_ranks = $sarrOf([struct_rank.$of(0, 0, 0, S("Ensign"), S("Esgn")),
struct_rank.$of(2, 1, 0, S("Lieutenant"), S("Lt ")),
struct_rank.$of(4, 2, 0, S("Lt. Cmdr."), S("LtCm")),
struct_rank.$of(8, 3, 0, S("Commander"), S("Cder")),
struct_rank.$of(15, 4, 0, S("Captain"), S("Capt")),
struct_rank.$of(20, 5, 0, S("Flt. Capt."), S("FltC")),
struct_rank.$of(25, 6, 0, S("Commodore"), S("Cdor")),
struct_rank.$of(30, 7, 0, S("Rear Adm."), S("RAdm")),
struct_rank.$of(40, 8, 0, S("Admiral"), S("Admr"))]);
  G.ranks = null;
  G.nranks = 0;
  G.messagew = null;
  G.w = null;
  G.mapw = null;
  G.statwin = null;
  G.baseWin = null;
  G.infow = null;
  G.iconWin = null;
  G.tstatw = null;
  G.war = null;
  G.warnw = null;
  G.helpWin = null;
  G.teamWin = new Array(4).fill(null);
  G.qwin = null;
  G.messwa = null;
  G.messwt = null;
  G.messwi = null;
  G.messwk = null;
  G.playerw = null;
  G.planetw = null;
  G.rankw = null;
  G.optionWin = null;
  G.reviewWin = null;
  G.scanw = null;
  G.udpWin = null;
  G.phaserwin = null;
  G.spWin = null;
  G.macroWin = null;
  G.ping = 0;
  G.packets_sent = 0;
  G.packets_received = 0;
  G.pStats = null;
  G.deathmessage = new Int8Array(80);
  G.outmessage = new Int8Array(85);
  G.xdisplay_name = null;
  G.UseNewDistress = 0;
  G.UseNewMacro = 1;
  G.UseSmartMacro = 1;
  G.rejectMacro = 0;
  G.maskrecip = 0;
  G.singleMacro = $cs("", 500);
  G.enemyPhasers = 1;
  G.cloakChars = $cs("??", 3);
  G.showIND = 0;
  G.newPlist = 0;
  G.dist_prefered = $sarr(struct_dmacro_list, 27);
  G.dist_defaults = $sarrOf([struct_dmacro_list.$of(88, S("no zero"), S("this should never get looked at")),
struct_dmacro_list.$of(212, S("taking"), S(" %T%c->%O (%S) Carrying %a to %l%?%n>-1%{ @ %n%}\x00")),
struct_dmacro_list.$of(207, S("ogg"), S(" %T%c->%O Help Ogg %p at %l\x00")),
struct_dmacro_list.$of(194, S("bomb"), S(" %T%c->%O %?%n>4%{bomb %l @ %n%!bomb %l%}\x00")),
struct_dmacro_list.$of(195, S("space_control"), S(" %T%c->%O Help Control at %L\x00")),
struct_dmacro_list.$of(145, S("save_planet"), S(" %T%c->%O Emergency at %L!!!!\x00")),
struct_dmacro_list.$of(146, S("base_ogg"), S(" %T%c->%O Sync with --]> %g <[-- OGG ogg OGG base!!\x00")),
struct_dmacro_list.$of(147, S("help1"), S(" %T%c->%O Help me! %d%% dam, %s%% shd, %f%% fuel %a armies.\x00")),
struct_dmacro_list.$of(148, S("help2"), S(" %T%c->%O Help me! %d%% dam, %s%% shd, %f%% fuel %a armies.\x00")),
struct_dmacro_list.$of(197, S("escorting"), S(" %T%c->%O ESCORTING %g (%d%%D %s%%S %f%%F)\x00")),
struct_dmacro_list.$of(208, S("ogging"), S(" %T%c->%O Ogging %h\x00")),
struct_dmacro_list.$of(205, S("bombing"), S(" %T%c->%O Bombing %l @ %n\x00")),
struct_dmacro_list.$of(204, S("controlling"), S(" %T%c->%O Controlling at %l\x00")),
struct_dmacro_list.$of(149, S("asw"), S(" %T%c->%O Anti-bombing %p near %b.\x00")),
struct_dmacro_list.$of(150, S("asbomb"), S(" %T%c->%O DON'T BOMB %l. Let me bomb it (%S)\x00")),
struct_dmacro_list.$of(151, S("doing1"), S(" %T%c->%O (%i)%?%a>0%{ has %a arm%?%a=1%{y%!ies%}%} at %l.  (%d%% dam, %s%% shd, %f%% fuel)\x00")),
struct_dmacro_list.$of(152, S("doing2"), S(" %T%c->%O (%i)%?%a>0%{ has %a arm%?%a=1%{y%!ies%}%} at %l.  (%d%% dam, %s%% shd, %f%% fuel)\x00")),
struct_dmacro_list.$of(198, S("free_beer"), S(" %T%c->%O %p is free beer\x00")),
struct_dmacro_list.$of(206, S("no_gas"), S(" %T%c->%O %p @ %l has no gas\x00")),
struct_dmacro_list.$of(200, S("crippled"), S(" %T%c->%O %p @ %l crippled\x00")),
struct_dmacro_list.$of(153, S("pickup"), S(" %T%c->%O %p++ @ %l\x00")),
struct_dmacro_list.$of(144, S("pop"), S(" %T%c->%O %l%?%n>-1%{ @ %n%}!\x00")),
struct_dmacro_list.$of(70, S("carrying"), S(" %T%c->%O %?%S=SB%{Your Starbase is c%!C%}arrying %?%a>0%{%a%!NO%} arm%?%a=1%{y%!ies%}.\x00")),
struct_dmacro_list.$of(160, S("other1"), S(" %T%c->%O (%i)%?%a>0%{ has %a arm%?%a=1%{y%!ies%}%} at %l. (%d%%D, %s%%S, %f%%F)\x00")),
struct_dmacro_list.$of(131, S("other2"), S(" %T%c->%O (%i)%?%a>0%{ has %a arm%?%a=1%{y%!ies%}%} at %l. (%d%%D, %s%%S, %f%%F)\x00")),
struct_dmacro_list.$of(69, S("help"), S(" %T%c->%O Help(%S)! %s%% shd, %d%% dmg, %f%% fuel,%?%S=SB%{ %w%% wtmp,%!%}%E%{ ETEMP!%}%W%{ WTEMP!%} %a armies!\x00")),
struct_dmacro_list.$of()]);
  G.distmacro = G.dist_defaults[0];
  G.sizedist = 648;
  G.distlite = [null,
S("/c/l/0/|%T%c Taking %L|"),
S("/|Ogg %p|"),
S("/|Bomb %L|"),
S("/|Control %L|"),
S("/|Save %L|"),
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null];
  G.DefLite = 1;
  G.UseLite = 1;
  G.emph_planet_seq_n = new Int32Array(40);
  G.emph_player_seq_n = new Int32Array(36);
  G.emph_planet_seq = new Array(10).fill(null);
  G.emph_player_seq = new Array(10).fill(null);
  G.emph_player_seql = new Array(10).fill(null);
  G.beep_lite_cycle_time_player = 10;
  G.beep_lite_cycle_time_planet = 10;
  G.liteflag = 0;
  G.F_beeplite_flags = LITE_PLAYERS_MAP | LITE_PLAYERS_LOCAL | LITE_SELF | LITE_PLANETS | LITE_SOUNDS | LITE_TTS;
  G.tts_len = 0;
  G.tts_max_len = 40;
  G.tts_width = 0;
  G.tts_timer = 0;
  G.tts_time = 25;
  G.tts_pos = (TWINSIDE / 2 | 0) - 16;
  G.lastIn = new Int8Array(100);
  G.rcm_msg = $sarrOf([struct_dmacro_list.$of(48, S("none"), S("Unknown RCM message")),
struct_dmacro_list.$of(49, S("kill"), S("GOD->ALL %i (%S) (%T%c%?%a>0%{+%a armies%!%}) was kill %?%d>0%{%k%!NO CREDIT)%} for %u (%r%p) %?%w>0%{%W%!%}")),
struct_dmacro_list.$of(50, S("planet"), S("GOD->ALL %i (%S) (%T%c%?%a>0%{+%a armies%!%} killed by %l (%z) %?%w>0%{%W%!%}")),
struct_dmacro_list.$of(51, S("bomb"), S("%N->%Z We are being attacked by %i (%T%c) who is %d%% damaged.")),
struct_dmacro_list.$of(52, S("destroy"), S("%N->%Z %N destroyed by %i (%T%c)")),
struct_dmacro_list.$of(53, S("take"), S("%N->%O %N taken by %i (%T%c)")),
struct_dmacro_list.$of(54, S("ghostbust"), S("GOD->ALL %i (%S) (%T%c) was kill %k for the GhostBusters")),
struct_dmacro_list.$of()]);
  G.highlightFriendlyPhasers = 0;
  G.ignore_signals = 0;
  G.motion_mouse = 0;
  G.user_motion_thresh = 16;
  G.motion_mouse_enablable = 1;
  G.motion_mouse_steering = 0;
  G.extended_mouse = 0;
  G.ignoreCaps = 1;
  G.mouse_as_shift = 0;
  G.b1_as_shift = 0;
  G.b2_as_shift = 0;
  G.b3_as_shift = 0;
  G.use_tng_fed_bitmaps = 0;
  G.tng_fed_bitmaps = $arr(8, () => new Array(16).fill(null));
  G.hull = new Array(8).fill(null);
  G.vary_hull = 0;
  G.defWin = null;
  G.use_control_key = 1;
  G.docwin = null;
  G.xtrekrcwin = null;
  G.maxdoclines = 0;
  G.maxxtrekrclines = 0;
  G.bplanets4 = new Array(8).fill(null);
  G.mbplanets4 = new Array(8).fill(null);
  G.max_fd = 3;
  G.toolsWin = null;
  G.shelltools = 1;
  G.macroKeys = $sarr(struct_key_list, 20);
  G.keys = $cs("", 20);
  G.wwwlink = S("netscape -remote \"openURL(%s)\"");
  G.upgradeURL = S("http://cow.netrek.org/current/index.html#%s");
  G.releaseURL = S("http://cow.netrek.org/%s/README.html#pl%i");
  G.bugURL = S("http://sourceforge.net/bugs/?group_id=968");
  G.sound_init = 1;
  G.sound_toggle = 0;
  G.sounddir = null;
  G.soundWin = null;
  G.hockey_s_lines = 0;
  G.s_lines = $sarr(struct_s_line, 14);
  G.normal_s_lines = 0;
  G.multiline_enabled = 0;
  G.F_feature_packets = 0;
  G.F_cloak_maxwarp = 0;
  G.F_self_8flags = 1;
  G.F_self_8flags2 = 0;
  G.F_ship_cap = 0;
  G.F_sp_generic_32 = 1;
  G.A_sp_generic_32 = 0;
  G.F_agri_pix = 1;
  G.F_many_self = 0;
  G.portSwap = 1;
  G.F_show_all_tractors = 1;
  G.fastGuest = 0;
  G.identityBlind = 0;
  G.versionHide = 0;
  G.F_sp_rank = 0;
  G.F_sp_ltd = 0;
  G.F_tips = 1;
  G.program = null;
  G.small_screen = 0;
}
