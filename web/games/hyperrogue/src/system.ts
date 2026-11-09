// system.cpp of HyperRogue 13.1o (package P8): starting and ending games, changing game modes, loading and
// saving the score/save file. (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// Files go through cfile.ts (an in-memory file system the website backs with account storage); the formats are
// the original's: saveStats appends the same text to the score file (`scorefile`, "hyperrogue.log"), loadsave
// reads it back (high scores, Yendor/tactics records, and the last game if it was saved with an Orb of Safety).
// Not ported (later stages): set_geometry / set_variation for other geometries (they throw NotPorted when the
// geometry or variation would change), save_mode_to_file / load_mode_from_file (the parameters of config.cpp),
// select_savefile's file dialog. hooks_gamedata (dual mode) is not registered (multigame.cpp, a later stage).
import { G } from './globals.ts';
import {
  NotPorted, among, isize, callhooks, callhandlers, addHook, MD_UNDECIDED, MAXPLAYER, VER,
} from './hyper.ts';
import { time, itrunc, fround } from './cpp.ts';
import {
  fopen, fclose, fputs, fgets, feof, ftell, fscanf_d, fscanf_s, sscanf, truncate, strftime_c, printf, exit, bytes_to_cstr,
} from './cfile.ts';
import {
  type eLand, type eItem, type eMonster, ittypes, motypes, landtypes, iinf, minf, IC_TREASURE, IC_ORB, IC_OTHER, IC_NAI,
  laNone, laBarrier, laCrossroads, laCrossroads2, laCrossroads4, laOceanWall, laOcean, laHauntedWall, laGraveyard,
  laHauntedBorder, laHaunted, laMercuryRiver, laTerracotta, laMountain, laJungle, laPrincessQuest, laPalace, laMemory,
  laIce, laBrownian, laElementalWall, laCanvas, laWhirlpool, laCamelot, laPower, laCA, laCaribbean, laMinefield,
  laHalloween, laMirror, laMirrorOld, laWildWest,
  waSea, waOpenPlate,
  itOrbSpeed, itOrbWinter, itOrbFlash, itOrbAether, itRedGem, itFernFlower, itWine, itGreenStone, itOrbInvis,
  itHolyGrail, itOrbYendor, itOrbSafety, itOrbLife, itOrbFriend, itSavedPrincess, itOrbLightning, itRoyalJelly,
  itSilver, itEmerald, itPower, itPalace, itOrbFire, itOrbPsi, itGrimoire, itPirate, itOrbTime, itOrbSpace, itCoast,
  itWhirlpool, itBombEgg, itOrbAir, itOrbWater, itFjord, itOrbFrog, itOrbDiscord, itOrbLove, itIvory, itElemental,
  itZebra, itFireShard, itWaterShard, itAirShard, itEarthShard, itOrbSummon, itOrbMatter, itMutant, itFulgurite,
  itBounty, itOrbLuck, itOrbStunning, itLotus, itOrbUndeath, itWindstone, itOrbEmpathy, itMutant2, itOrbFreedom,
  itRose, itOrbBeauty, itCoral, itOrb37, itOrbEnergy, itApple, itDragon, itOrbDomination, itBabyTortoise,
  itOrbShell, itKraken, itOrbSword, itBarrow, itOrbSword2, itTrollEgg, itOrbStone, itDodeca, itAmethyst, itSlime,
  itOrbNature, itOrbDash, itOrbRecall, itGreenGrass, itBull, itOrbHorns, itOrbBull, itOrbMirror, itLavaLily,
  itHunting, itBlizzard, itTerra, itOrbSide1, itOrbSide2, itOrbSide3, itOrbLava, itOrbMorph, itOrbSlaying,
  itOrbMagnetism, itOrbPhasing, itDock, itGlowCrystal, itMagnet, itRuins, itSwitch, itVarTreasure, itBrownian,
  itWest, itOrbIntensity, itOrbChoice, itOrbGravity, itOrbImpact, itOrbChaos, itOrbPlague, itEclectic, itFrog, itWet,
  itCursed, itDice, itOrbPurity, itOrbWoods, itCurseWeakness, itCurseFatigue, itCurseDraining, itCurseRepulsion,
  itCurseGluttony, itCurseWater, itOrbFish, itCrossbow, itRevolver, itAsteroid, itTreat, itFatigue, itSnake,
  itOrbThorns, itOrbDragon, itOrbIllusion,
  moVizier, moPrincess, moPrincessMoved, moPrincessArmedMoved, moPrincessArmed, moPlayer, moGolem, moTameBomberbird,
  moTortoise, moWormtail, moCrystalSage, moWormwait, moFireFairy, moTentacleEscaping, moMiner, moREMOVED,
  moGolemMoved, moIllusion, moTentacletail, moTentaclewait, moGreater, moGreaterM, moLesserM, moFriendlyGhost,
  moWolfMoved, moWorldTurtle, moNone, moBug0, moBug1, moBug2, moVineBeast, moVineSpirit, moLancer, moFlailer,
  moEarthElemental, moDarkTroll, moWitch, moWitchFire, moWitchFlash, moWitchGhost, moWitchSpeed, moEvilGolem,
  moWitchWinter, moKnight, moCultistLeader, moPirate, moCShark, moParrot, moHexSnake, moRedTroll, moBomberbird,
  moAlbatross, moPalace, moFatGuard, moSkeleton, moViking, moFjordTroll, moWaterElemental, moMouse,
  moAirElemental, moFireElemental, moFamiliar, moGargoyle, moOrangeDog, moForestTroll, moStormTroll, moOutlaw,
  moMutant, moMetalBeast, moMetalBeast2, moWindCrow, moRedFox, moRatling, moFalsePrincess, moRoseLady,
  moRoseBeauty, moRatlingAvenger, moSparrowhawk, moResearcher, moDragonHead, moDragonTail, moKrakenH, moKrakenT,
  moDraugr, moBat, moReptile, moFriendlyIvy, moSleepBull, moRagingBull, moHerdBull, moButterfly, moGadfly,
  moHunterDog, moIceGolem, moVoidBeast, moJiangshi, moTerraWarrior, moSalamander, moLavaWolf, moNorthPole,
  moSouthPole, moSwitch1, moSwitch2, moAltDemon, moHexDemon, moPair, moCrusher, moMonk, moAcidBird, moBrownBug,
  moVariantWarrior, moWestHawk, moFallingDog, moNarciss, moMirrorSpirit, moFrog, moPhaser, moVaulter, moPike,
  moRusalka, moHexer, moAngryDie, moAnimatedDie, moAsteroid, moVampire,
} from './content.ts';
import {
  gNormal, gSphere, gElliptic, gArchimedean, gProduct, gTwistedProduct, gArbitrary, ginf, eVariation,
  euclid, sphere, elliptic, sol, nil, sl2, quotient, closed_or_bounded, embedded_plane, mhybrid,
  weirdhyperbolic, experimental, BITRUNCATED, PURE, WDIM,
} from './classes.ts';
import { cellwalker, type cell } from './locations.ts';
import { hrand, hrandpos, shrand, srand } from './rand.ts';
import { its } from './hprint.ts';
import { XLAT, spM, spL, dnameof_l } from './language.ts';
import { bignum } from './util.ts';
import { addMessage, subscreens_prepare, initialize_all, quit_all } from './basegraph.ts';
import {
  createMov, initcells, init_disk_cells, celldist, getDistLimit, BARLEV, clearMemoRPM,
} from './cell.ts';
import { get_expansion } from './expansion.ts';
import { cgi, check_cgi } from './geometry.ts';
import { itemclass, isGravityLand, isCyclic, generateAll, isHaunted, isMonsterPart, isFriendly } from './flags.ts';
import { gold, updateHi_for_code, in_lovasz } from './items.ts';
import { inv_init, inv_applyBox } from './inventory.ts';
import {
  modecode, yendor_init, hiitemsMax, tactic_record, get_identify, load_modecode_line, load_modename_line,
  yendor_bestscore_at, YENDORLEVELS, FIRST_MODECODE, modestream, load_mode_data_with_zero, peace_simon_init,
} from './yendor.ts';
import { achievement_final } from './achievement.ts';
import {
  fix_land_structure_choice, landUnlockedIngame, ls_hv_structure, randomElementalLand, land_validity,
  lv_display_error_message, treasureType, ls_any_chaos, lsNiceWalls, lsChaos, lsSingle, pickLandRPM, ls_nice_walls,
} from './landlock.ts';
import { setdist } from './landgen.ts';
import {
  clear_euland, pregen, horo_ok, start_camelot, create_altmap, generate_mines, newRoundTableRadius,
} from './bigstuff.ts';
import { brownian_init, mine_auto_teleport_charges } from './complex2.ts';
import { sword_determine_sword_angles, sword_initial, halloween_generate, princess_coords } from './complex.ts';
import { checkmove, pureHardcore } from './checkmove.ts';
import { bfs } from './environment.ts';
import { clearshadow } from './monstermove.ts';
import { calcTidalPhase, makeEmpty } from './mapeffects.ts';
import { numplayers, player_indices, player_positions } from './pcmove.ts';
import { tkills } from './attack.ts';
import { countMyGolems, countMyGolemsHP, restoreGolems } from './game.ts';
import { is_cell_removed } from './savemem.ts';
import { hsA } from './locations.ts';
import { euc_get_at } from './euclid.ts';
// stage 3, package G1 (set_geometry, set_variation)
import {
  gSpace435, gCell8, gCrystal, OINF, qIDEAL, cgflags, GDIM, S3, GOLDBERG, INVERSE, DUAL, nonorientable,
  aperiodic, cryst, hyperbolic, nonisotropic, mproduct,
} from './classes.ts';
import { mdGeodesic, mdLiePerspective, mdPerspective, mdDisk } from './classes.ts';
import { pconf } from './globals.ts';
import { ors_reset } from './control.ts';
import { bt_in } from './binary-tiling.ts';
import { arb_in, arb_convert_deactivate } from './arbitrile.ts';
import { gp_variation_for } from './goldberg.ts';
import { is_subcube_based, is_reg3_variation } from './geometry.ts';
import { reg3_in } from './reg3.ts';
import { hybrid_get_where, hybrid_in_underlying_geometry, in_s2xe, in_h2xe, hybrid_csteps, hybrid_underlying } from './nonisotropic.ts';
import { hat_in } from './aperiodic-hat.ts';
import { geom3_in_flipped } from './embeddings.ts';
import { gp_operation_name } from './goldberg.ts';
import { arcm_current_or_fake_compute_geometry } from './archimedean.ts';
import { bow_crossbow_mode, bow_wBlade, bow_clear_bowpath } from './crossbow.ts';
// later-stage stub modules (package P8)
import { resetview } from './hypgraph.ts';
import { restartGraph, allowChangeRange, allowIncreasedSight } from './graph.ts';
import { init_floorcolors } from './graph-wall.ts';
import { showFestive, land_structure_name } from './menus.ts';
import { dialog_never_keys } from './dialogs.ts';
import { popScreenAll } from './control.ts';
import { resetmusic } from './sound.ts';
import { texture_config_remap } from './textures.ts';
import { polygonal_solve } from './models.ts';
import { counthints, hints, formatted_yasc_code } from './quit.ts';
import { shmup_init } from './shmup.ts';
import { racing_generate_track, racing_restore_goals, racing_reset_race } from './racing.ts';
import { tour_presentation, tour_pmRestart, tour_stop_tour } from './tour.ts';
import { dual_split, dual_assign_landsides, dual_enable, dual_disable } from './multigame.ts';
import { arg_read } from './commandline.ts';
import { ca_init } from './complex.ts';
import { irr_auto_creator, irr_base } from './irregular.ts';
import { mapstream_load_geometry } from './mapeditor.ts';
import { IRREGULAR } from './classes.ts';

/** namespace rg: constants used as parameters in functions such as restart_game and wrongmode (char codes) */
export const rg_nothing = 0;
export const rg_peace = 0x50; // 'P'
export const rg_inv = 0x69; // 'i'
export const rg_chaos = 0x43; // 'C'
export const rg_tactic = 0x74; // 't'
export const rg_tour = 0x54; // 'T'
export const rg_yendor = 0x79; // 'y'
export const rg_shmup = 0x73; // 's'
export const rg_randpattern = 0x72; // 'r'
export const rg_princess = 0x70; // 'p'
export const rg_daily = 0x64; // 'd'
export const rg_daily_off = 0x44; // 'D'
export const rg_racing = 0x52; // 'R'
export const rg_dualmode = 0x55; // 'U'
export const rg_heptagons = 0x37; // '7'
/** wrongmode only -- marks 'global' achievements not related to the current mode */
export const rg_global = 0x78; // 'x'
/** wrongmode only -- change vid.scfg.players then restart_game(rg::nothing) instead */
export const rg_multi = 0x6D; // 'm'
/** wrongmode only -- mark achievements for special geometries/variations (land_structure lsSingle) */
export const rg_special_geometry = 0x67; // 'g'
/** wrongmode only -- mark achievements for special geometries/variations */
export const rg_special_geometry_nicewalls = 0x47; // 'G'
/** wrongmode only -- specgeom returns 'fail' if the special geometry is not correct */
export const rg_fail = 0x58; // 'X'

// EX bool game_active, autocheat, loaded_from_save; EX eWall canvas_default_wall; EX int truelotus,
// asteroids_generated, asteroid_orbs_generated; EX time_t timerstart, savetime, tickstart; EX bool timerstopped;
// EX int savecount, save_turns; EX bool doCross; EX int loadcount, current_loadcount, load_branching;
// EX bool gamegen_failure; EX eLand top_land: all in G

const isdigit = (c: string | undefined): boolean => c !== undefined && c >= '0' && c <= '9';

/** a comparator for version number strings */
export function verless(v: string, cmp: string): boolean {
  if (isdigit(v[0]) && isdigit(v[1]))
    v = 'A' + v;
  if (isdigit(cmp[0]) && isdigit(cmp[1]))
    cmp = 'A' + cmp;
  return v < cmp;
}

/** Print the welcome message during the start of game. Depends on the current mode and other settings. */
export function welcomeMessage(): void {
  if (callhandlers(false, G.hooks_welcome_message)) return;
  if (G.nohelp === 1) return;
  if (G.custom_welcome !== '') addMessage(G.custom_welcome);
  else if (embedded_plane()) return geom3_in_flipped(() => welcomeMessage());
  // CAP_TOUR
  else if (G.tour_on) return; // displayed by tour
  else if (G.princess_challenge) {
    G.kills[moVizier] = 1;
    G.princess_forceMouse = true;
    if (G.yendor_everwon)
      G.items[itGreenStone] = 99;
    addMessage(XLAT('Welcome to %the1 Challenge!', spM(moPrincess)));
    addMessage(XLAT('The more Hypersian Rugs you collect, the harder it is.', spM(moPrincess)));
  }
  else if (G.intra_in)
    addMessage(XLAT("Welcome to a portal map! Press 'o' to configure."));
  else if (G.randomPatternsMode)
    addMessage(XLAT('Welcome to the Random Pattern mode!'));
  else if (G.tactic_on)
    addMessage(XLAT('You are playing %the1 in the Pure Tactics mode.', spL(G.firstland)));
  else if (G.yendor_on)
    addMessage(XLAT('Welcome to the Yendor Challenge %1!', its(G.yendor_challenge)));
  else if (G.peace_on) { /* no welcome message */ }
  else if (G.shmup_on) { /* welcome message given elsewhere */ }
  else if (euclid())
    addMessage(XLAT('Welcome to the Euclidean mode!'));
  else if (G.specialland === laHalloween && BITRUNCATED() && among(G.geometry, gSphere, gElliptic))
    addMessage(XLAT('Welcome to Halloween!'));
  else if (elliptic() && WDIM() === 2)
    addMessage(XLAT('Good luck in the elliptic plane!'));
  else if (elliptic())
    addMessage(XLAT('Good luck in the elliptic space!'));
  else if (sphere())
    addMessage(XLAT('Welcome to Spherogue!'));
  else if (in_s2xe())
    addMessage(XLAT('Welcome to Spherindrogue!'));
  else if (in_h2xe())
    addMessage(XLAT('Welcome to Hyper-X-R-Rogue!'));
  else if (sol())
    addMessage(XLAT('Welcome to SolvRogue!'));
  else if (nil())
    addMessage(XLAT('Welcome to NilRogue!'));
  else if (sl2()) {
    if (hybrid_csteps() === 0)
      addMessage(XLAT('Welcome to CoverRogue!'));
    else if (cgi_psl_steps() % hybrid_csteps() === 0)
      addMessage(XLAT('Welcome to PSL(2,R)-ogue!'));
    else
      addMessage(XLAT('Welcome to SL(2,R)-ogue!'));
    if (hybrid_underlying() === gNormal && BITRUNCATED())
      addMessage(XLAT('Hint: this is more playable with pure {7,3} or pure {5,4}'));
  }
  else if (PURE() && G.geometry === gNormal && !G.cheater)
    addMessage(XLAT('Welcome to the Heptagonal Mode!'));
  else if (G.cheater || G.autocheat)
    addMessage(XLAT('Welcome to HyperRogue! (cheat mode on)'));
  else if (hat_in())
    addMessage(XLAT('Welcome to HatRogue!'));
  else if (bow_crossbow_mode())
    addMessage(XLAT('Welcome to HyperRanger!'));
  else
    addMessage(XLAT('Welcome to HyperRogue!'));

  if (!G.safety && !G.daily_on) {
    const lv = land_validity(G.specialland);
    if ((lv.flags & lv_display_error_message) !== 0n)
      addMessage(XLAT(lv.msg));
  }

  if (G.nohelp === 2) return;

  if (!dialog_never_keys()) {
    if (bow_crossbow_mode()) {
      addMessage(XLAT("Press 'f' or click the crossbow icon to target."));
    }
    else {
      // !ISMAC
      addMessage(XLAT('Press F1 or right-click things for help.'));
    }
  }
}

/** cgi.psl_steps (SL(2,R) only) */
function cgi_psl_steps(): number { throw new NotPorted('cgi.psl_steps'); }

// EX bool ineligible_starting_land; EX int easy_specialland: G

export function reset_cheats(): void {
  if (G.autocheat) {
    G.cheater = 1;
    return;
  }
  G.cheater = 0;
  G.reptilecheat = false;
  G.shadingcheat = false;
  G.cheat_items_enabled = false;
  G.timerghost = true;
  G.gen_wandering = true;
}

/** initialize the game */
export function initgame(): void {
  // DEBBI(debug_init, ("initGame"));
  if (!G.safety) reset_cheats();

  callhooks(G.hooks_initgame);

  modecode(1);

  if (!G.safety) fix_land_structure_choice();

  if (G.multi_players < 1 || G.multi_players > MAXPLAYER)
    G.multi_players = 1;
  G.multi_whereto[0].d = MD_UNDECIDED;
  G.multi_cpid = 0;

  yendor_init(1);

  if (G.safety && G.safetyseed) {
    shrand(G.safetyseed);
    G.firstland = G.safetyland;
  }

  if (!G.safety) {
    G.firstland = G.specialland;
    G.ineligible_starting_land = !landUnlockedIngame(G.specialland);
  }

  if (G.firstland === laNone || G.firstland === laBarrier)
    G.firstland = laCrossroads;

  G.easy_specialland = 0;

  if (G.firstland === laOceanWall) G.firstland = laOcean;
  if (G.firstland === laHauntedWall) G.firstland = laGraveyard;
  if (G.firstland === laHauntedBorder) G.firstland = laGraveyard;
  if (G.firstland === laHaunted && !G.tactic_on) G.firstland = laGraveyard;
  if (G.firstland === laMercuryRiver) G.firstland = laTerracotta;
  if (G.firstland === laMountain && !G.tactic_on && !ls_hv_structure()) G.firstland = laJungle;
  if (G.firstland === laPrincessQuest) G.firstland = laPalace;
  if (G.firstland === laMemory) G.firstland = laIce;
  if (!ls_hv_structure())
    if ((isGravityLand(G.firstland) && !isCyclic(G.firstland)) || (G.firstland === laOcean && !G.safety && !G.yendor_on)) {
      G.firstland = weirdhyperbolic() ? laCrossroads4 : laCrossroads;
      G.easy_specialland = 3;
    }

  clear_euland(G.firstland);

  G.cwt.at = G.currentmap.gamestart(); G.cwt.spin = 0; G.cwt.mirrored = false;
  G.cwt.at.land = G.firstland;

  // CAP_COMPLEX2
  if (G.firstland === laBrownian) brownian_init(G.cwt.at);

  G.chaosAchieved = false;

  G.clearing_direct = 0;
  G.clearing_imputed = new bignum(0);
  G.rosephase = 0;
  G.shmup_count_pauses = 0;
  G.illegal_moves = 0;

  G.splitrocks = 0;

  if (G.firstland === laElementalWall) G.cwt.at.land = randomElementalLand();

  resetview();
  createMov(G.cwt.at, 0);

  pregen();
  setdist(G.cwt.at, BARLEV(), null!);

  if (!G.disable_bigstuff)
    if (isCyclic(G.specialland) || G.specialland === laCanvas) {
      // CAP_COMPLEX2
      G.camelot_anthraxBonus = G.items[itHolyGrail];
      G.cwt.at.move(0).land = G.firstland;
      if (G.firstland === laWhirlpool) G.cwt.at.move(0).wall = waSea;

      setdist(G.cwt.at.move(0), BARLEV() - 1, G.cwt.at);

      if (horo_ok()) {
        if (G.specialland === laCamelot)
          start_camelot(G.cwt.at);
        else {
          const h = create_altmap(G.cwt.at, 2, hsA);
          if (!h) printf('FAIL\n');
        }
      }
    }

  if (G.tactic_on && G.firstland === laPower) {
    G.items[itOrbSpeed] = 30;
    G.items[itOrbWinter] = 30;
    G.items[itOrbFlash] = 30;
  }

  if (G.firstland === laCA)
    G.items[itOrbAether] = 2;

  if (G.tactic_on && G.firstland === laCaribbean) {
    if (hiitemsMax(itRedGem) >= 25) G.items[itRedGem] = Math.min(hiitemsMax(itRedGem), 50);
    if (hiitemsMax(itFernFlower) >= 25) G.items[itFernFlower] = Math.min(hiitemsMax(itFernFlower), 50);
    if (hiitemsMax(itWine) >= 25) G.items[itWine] = Math.min(hiitemsMax(itWine), 50);
  }

  G.yendor_lastchallenge = G.yendor_challenge;

  if (G.shmup_on) shmup_init();

  yendor_init(2);

  // CAP_RACING
  if (G.racing_on) racing_generate_track();

  if (G.gamegen_failure) return;

  if (euclid() && G.specialland === laPrincessQuest) {
    const c = euc_get_at(princess_coords()).c7; // euc::at(princess::coords())
    G.princess_generating = true;
    c.land = laPalace;
    setdist(c, 7 - getDistLimit() - G.genrange_bonus, null!);
    G.princess_generating = false;
  }

  if (G.cwt.at.land === laCrossroads2 && !ls_hv_structure()) {
    let c = G.cwt.at;
    if (mhybrid()) { c = hybrid_get_where(c)[0]; const c1 = c; hybrid_in_underlying_geometry(() => c1.cmove(0)); }
    c.landparam = 12;
    c.cmove(0).landparam = 44;
    c.cmove(0).land = laCrossroads2;
  }

  sword_determine_sword_angles();
  for (let i = 0; i < numplayers(); i++)
    G.sword_dir[i] = sword_initial(G.cwt.at);

  // CAP_DAILY=0: daily::split()

  // extern int sightrange; sightrange = 9;
  // cwt.at->land = laHell; items[itHell] = 10;
  for (let i = BARLEV(); i >= 7 - getDistLimit() - G.genrange_bonus; i--) {
    setdist(G.cwt.at, i, null!);

    G.currentmap.verify();
  }

  if (G.doCross) {
    for (let i = 0; i < ittypes; i++) if (itemclass(i) === IC_TREASURE) G.items[i] = 50;
    for (let i = 0; i < motypes; i++) G.kills[i] = 30;
    G.items[itSavedPrincess] = 0;
    G.kills[moPrincessMoved] = 0;
    G.kills[moPrincessArmedMoved] = 0;
    G.kills[moPlayer] = 0;
  }

  if (quotient() && generateAll(G.firstland)) {
    for (let i = 0; i < isize(G.currentmap.allcells()); i++)
      setdist(G.currentmap.allcells()[i], 8, null!);
  }


  if (G.multi_players > 1 && !G.shmup_on) for (let i = 0; i < numplayers(); i++) {
    const idir = (3 * i) % G.cwt.at.type;
    G.multi_player[i].at = G.cwt.at.move(idir);
    // special case -- otherwise they land on a wall
    if (G.firstland === laCrossroads2 && i === 1)
      G.multi_player[1].at = G.cwt.at;
    if (G.firstland === laCrossroads2 && i === 6)
      G.multi_player[6].at = createMov(createMov(G.cwt.at, 0), 3);
    setdist(G.cwt.at.move(idir), 7 - getDistLimit() - G.genrange_bonus, G.cwt.at);
    G.multi_player[i].spin = 0;
    G.multi_flipped[i] = true;
    G.multi_whereto[i].d = MD_UNDECIDED;
  }

  yendor_init(3);
  peace_simon_init();

  G.multi_revive_queue.length = 0;
  // CAP_TOUR
  if (G.tour_on) tour_presentation(tour_pmRestart);

  if (G.multi_players > 1 && !G.shmup_on) {
    for (const pc of player_positions())
      makeEmpty(pc);
  }
  else {
    makeEmpty(G.cwt.at);
  }

  // make the starting point safe in this setting
  if (G.specialland === laPalace && G.geometry === gNormal && PURE())
    G.cwt.at.wall = waOpenPlate;

  if (G.specialland === laMinefield && closed_or_bounded()) {
    bfs();
    generate_mines();
  }

  if (G.specialland === laHalloween)
    halloween_generate();

  if (in_lovasz()) {
    G.cwt.at.item = itOrbInvis;
  }

  G.princess_squeaked = false;
  G.clearing_current_root = null!;

  if (!G.safety) {
    G.usedSafety = false;
    G.timerstart = time(); G.turncount = 0; G.lastexplore = 0; G.rosewave = 0; G.rosephase = 0;
    G.tickstart = G.ticks;
    G.noiseuntil = 0;
    G.sagephase = 0; G.hardcoreAt = 0; G.lineofsightAt = 0;
    G.timerstopped = false;
    G.savecount = 0; G.savetime = 0;
    G.loadcount = 0; G.current_loadcount = 0; G.load_branching = 0;

    G.tortoise_last21tort = 0;
    if (!G.wfc_use_eclectic) G.cheater = 1;
    if (!G.autocheat && !G.cheater && G.geometry === gNormal) G.patterns_whichShape = 0;
    G.hauntedWarning = false;
    G.truelotus = 0;
    G.asteroids_generated = 0;
    G.asteroid_orbs_generated = 0;
    G.survivalist = true;
    // CAP_CRYSTAL
    G.crystal_used_compass_inside = false;
    G.got_achievements = new Set();
    // CAP_INV
    if (G.inv_on) inv_init();
    // CAP_COMPLEX2
    mine_auto_teleport_charges();
    welcomeMessage();
  }
  else {
    G.usedSafety = true;
    G.safety = false;
  }

  G.havewhat = G.hadwhat = 0n; G.rosemap.clear();

  G.elec_lightningfast = 0;

  G.lastsafety = gold();
  bfs();
  checkmove(false);
  G.playermoved = true;

  if (quotient() || sphere())
    for (const c of G.currentmap.allcells()) setdist(c, 8, null!);

  if (!allowChangeRange()) {
    G.gamerange_bonus = G.genrange_bonus = 0;
    if (G.vid.use_smart_range === 2) G.vid.use_smart_range = 1;
  }
  if (!allowIncreasedSight()) G.vid.use_smart_range = 0;
  calcTidalPhase();
  callhooks(G.hooks_post_initgame);
}

let havesave = true;

// ---------------------------------------------------------------------------------------------------------------
// namespace scores (CAP_SAVE): loading and saving scores and saved games. Most applyBox functions are used both
// for saving savegames and scores to the logfile, loading savegames and scores from the logfile, and loading
// highscore information from the logfile. The flags saving, loading, and loadingHi specify what is done.
// A reference `int& t` is an (object, key) pair: (G, 'turncount'), (G.items, it).

/** the amount of boxes reserved for each hr::score item */
export const MAXBOX = 500;
/** currently used boxes in hr::score */
export const POSSCORE = 423;

/** a struct to keep local score from an earlier game */
export class score {
  /** version used */
  ver = '';
  /** all the data of the saved score, see applyBoxes() */
  box: number[] = new Array<number>(MAXBOX).fill(0);
  /** yasc message */
  yasc_message = '';
  clone(): score {
    const s = new score();
    s.ver = this.ver; s.box = [...this.box]; s.yasc_message = this.yasc_message;
    return s;
  }
}

/** enum boxpriority */
export const bpMain = 0, bpMain1 = 1, bpSpecialTreasure = 2, bpTreasure = 3, bpMonster = 4, bpDeadOrb = 5,
  bpOtherItem = 6, bpFriendlyMonster = 7, bpMonsterPart = 8, bpWeirdStat = 9, bpOrb = 10, bpNAI = 11, bpMode = 12,
  bpTechnical = 13, bpGUARD = 14;

type Rec = Record<string | number, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

/** the next box should contain t */
function applyBox(o: Rec, k: string | number): void {
  const S = G.scores_save;
  if (G.scores_saving) S.box[G.scores_boxid++] = o[k];
  else if (G.scores_loading) o[k] = S.box[G.scores_boxid++];
  else G.scores_boxid++;
}

/** the next box should contain tb (a bignum, stored as the bits of a float) */
function applyBoxBignum(o: Rec, k: string, name: string): void {
  let tf = 0;
  const ti = { v: 0 };
  const buf = new DataView(new ArrayBuffer(4));
  if (G.scores_saving) tf = fround((o[k] as bignum).approx_ld());
  if (G.scores_saving) { buf.setFloat32(0, tf, true); ti.v = buf.getInt32(0, true); }
  scores_applyBoxNum(ti, 'v', name);
  if (G.scores_loading) { buf.setInt32(0, ti.v, true); tf = buf.getFloat32(0, true); }
  if (G.scores_loading) o[k] = bignum.from_ld(tf);
}

/** applyBoxNum(int& i, string name IS("")): the next box should contain i, and possibly be named name */
export function scores_applyBoxNum(o: object, k: string | number, name = ''): void {
  const id = G.scores_boxid;
  G.scores_fakebox[id] = (name === '' || name[0] === '@');
  G.scores_boxname[id] = name;
  G.scores_monsbox[id] = false;
  applyBox(o as Rec, k);
}

/** the next box should contain b, and possibly be named name */
function applyBoxBool(o: Rec, k: string | number, name = ''): void {
  const i = { v: o[k] ? 1 : 0 };
  scores_applyBoxNum(i, 'v', name);
  G.scores_monsbox[G.scores_boxid] = false;
  o[k] = i.v !== 0;
}

/** Save i while saving, do nothing while loading. Use together with applyBoxLoad and boxid++ */
function applyBoxSave(i: number, name = ''): void {
  G.scores_fakebox[G.scores_boxid] = (name === '');
  G.scores_boxname[G.scores_boxid] = name;
  applyBox({ v: i }, 'v');
}

/** Load i while loading, do nothing while saving. Use together with applyBoxSave and boxid++ */
function applyBoxLoad(name = ''): number {
  G.scores_fakebox[G.scores_boxid] = (name === '');
  G.scores_boxname[G.scores_boxid] = name;
  const i = { v: 0 }; applyBox(i, 'v');
  return i.v;
}

function setprio(idx: number): void { G.scores_boxprio[G.scores_boxid] = idx; }

/** the next box is the number of collected items it */
function applyBoxI(it: eItem, f = false): void {
  if (among(it, itOrbYendor, itHolyGrail)) setprio(bpSpecialTreasure);
  else if (itemclass(it) === IC_NAI) setprio(bpNAI);
  else if (it === itGreenStone) setprio(bpDeadOrb);
  else if (itemclass(it) === IC_ORB) setprio(bpOrb);
  else if (itemclass(it) === IC_OTHER) setprio(bpOtherItem);
  else if (itemclass(it) === IC_TREASURE) setprio(bpTreasure);
  G.scores_boxname[G.scores_boxid] = iinf[it].name;
  G.scores_fakebox[G.scores_boxid] = f;
  G.scores_monsbox[G.scores_boxid] = false;
  if (G.scores_loadingHi) {
    updateHi_for_code(it, G.scores_save.box[G.scores_boxid++], G.scores_saved_modecode);
  }
  else applyBox(G.items, it);
}

const invorb: eItem[] = [];

function addinv(it: eItem): void {
  invorb.push(it);
}

/** Handle the information about orb it. Need to call list_invorb later */
function applyBoxOrb(it: eItem): void {
  applyBoxI(it, true);
  invorb.push(it);
}

/** Handle the OSM information for all orbs that applyBoxOrb has been called for so far */
function list_invorb(): void {
  for (const it of invorb) {
    // CAP_INV
    inv_applyBox(it);
  }
  invorb.length = 0;
}

/** handle the number of monsters of type m killed */
function applyBoxM(m: eMonster, f = false): void {
  setprio(isMonsterPart(m) ? bpMonsterPart : (isFriendly(m) || m === moTortoise) ? bpFriendlyMonster : bpMonster);
  G.scores_fakebox[G.scores_boxid] = f;
  G.scores_boxname[G.scores_boxid] = minf[m].name;
  G.scores_monsbox[G.scores_boxid] = true;
  applyBox(G.kills, m);
}

// EX modecode_t saved_modecode: G.scores_saved_modecode

function applyBoxEnum(o: Rec, k: string | number, name = ''): void {
  const ii = { v: o[k] as number };
  scores_applyBoxNum(ii, 'v', name);
  o[k] = ii.v;
}

/** Call applyBox for all the required values. This will save the values if saving, load if loading, load into
 *  highscores if loadingHi */
export function scores_applyBoxes(): void {
  invorb.length = 0;

  let lostin: eLand = laNone;

  setprio(bpMain); applyBoxSave(G.timerstart | 0, 'time elapsed');
  const timer = time();
  setprio(bpMain); applyBoxSave(timer | 0, 'date');
  setprio(bpMain); applyBoxSave(gold(), 'treasure collected');
  setprio(bpMain); applyBoxSave(tkills(), 'total kills');
  setprio(bpMain); scores_applyBoxNum(G, 'turncount', 'turn count');
  setprio(bpWeirdStat); scores_applyBoxNum(G, 'cellcount', 'cells generated');

  if (G.scores_loading) G.timerstart = time();

  for (let i = 0; i < itOrbLightning; i++)
    if (i === 0) { G.items[i] = 0; applyBoxI(itFernFlower); }
    else applyBoxI(i);

  for (let i = 0; i < 43; i++) {
    if (G.scores_loading) G.kills[i] = 0;
    if (i === moWormtail) applyBoxM(moCrystalSage);
    else if (i === moWormwait) applyBoxM(moFireFairy);
    else if (i === moTentacleEscaping) applyBoxM(moMiner);
    else if (i === moREMOVED) applyBoxI(itFatigue);
    else if (i === moGolemMoved) applyBoxM(moIllusion);
    else if (i === moTentacletail) applyBoxI(itSnake);
    else if (i === moTentaclewait) applyBoxOrb(itOrbThorns);
    else if (i === moGreater) applyBoxOrb(itOrbDragon);
    else if (i === moGreaterM) applyBoxOrb(itOrbIllusion);
    else if (i === moLesserM) applyBoxM(moFriendlyGhost);
    else if (i === moWolfMoved) applyBoxM(moWorldTurtle);
    else if (i === moNone) { setprio(bpWeirdStat); scores_applyBoxNum(G.kills, i, 'icewalls melted'); }
    else applyBoxM(i);
  }

  setprio(bpMain);
  if (G.scores_saving) {
    let totaltime = G.savetime;
    if (!G.timerstopped) totaltime += timer - G.timerstart;
    applyBoxSave(totaltime | 0, 'time played');
  }
  else if (G.scores_loading) G.savetime = applyBoxLoad('time played');
  else { G.scores_boxname[G.scores_boxid] = 'time played'; G.scores_boxid++; }

  setprio(bpMain1);
  if (G.scores_saving) G.savecount++;
  scores_applyBoxNum(G, 'savecount', 'number of saves');
  if (G.scores_saving) G.savecount--;
  setprio(bpMode);
  scores_applyBoxNum(G, 'cheater', 'number of cheats');

  G.scores_fakebox[G.scores_boxid] = false; setprio(bpMain);
  if (G.scores_saving) applyBoxSave(G.items[itOrbSafety] ? G.safetyland : G.cwt.at.land, 'where');
  else if (G.scores_loading) G.firstland = G.safetyland = applyBoxLoad('where');
  else lostin = G.scores_save.box[G.scores_boxid++];

  for (let i = itOrbLightning; i < 25; i++) applyBoxOrb(i);

  applyBoxI(itRoyalJelly);
  applyBoxI(itWine);
  applyBoxI(itSilver);
  applyBoxI(itEmerald);
  applyBoxI(itPower);
  applyBoxOrb(itOrbFire);
  applyBoxOrb(itOrbInvis);
  applyBoxOrb(itOrbAether);
  applyBoxOrb(itOrbPsi);
  applyBoxM(moBug0);
  applyBoxM(moBug1);
  applyBoxM(moBug2);
  applyBoxM(moVineBeast);
  applyBoxM(moVineSpirit);
  applyBoxM(moLancer);
  applyBoxM(moFlailer);
  applyBoxM(moEarthElemental);
  applyBoxM(moDarkTroll);
  applyBoxM(moWitch);
  applyBoxM(moWitchFire);
  applyBoxM(moWitchFlash);
  applyBoxM(moWitchGhost);
  applyBoxM(moWitchSpeed);
  applyBoxM(moEvilGolem);
  applyBoxM(moWitchWinter);
  applyBoxI(itHolyGrail);
  applyBoxI(itGrimoire);
  applyBoxM(moKnight);
  applyBoxM(moCultistLeader);

  applyBoxM(moPirate);
  applyBoxM(moCShark);
  applyBoxM(moParrot);
  applyBoxI(itPirate);
  applyBoxOrb(itOrbTime);

  applyBoxM(moHexSnake);
  applyBoxM(moRedTroll);
  applyBoxI(itRedGem);
  applyBoxOrb(itOrbSpace);

  const geo = { v: G.geometry };
  scores_applyBoxNum(geo, 'v', '@geometry'); G.geometry = geo.v;
  setprio(bpMode);
  applyBoxBool(G, 'hardcore', 'hardcore');
  setprio(bpMode);
  scores_applyBoxNum(G, 'hardcoreAt', '@hardcoreAt');
  setprio(bpMode);
  applyBoxBool(G, 'shmup_on', 'shmup');
  setprio(bpMode);
  if (G.scores_saving) applyBoxSave(G.specialland, 'euclid land');
  else if (G.scores_loading) G.specialland = applyBoxLoad('euclid land');
  else G.scores_fakebox[G.scores_boxid++] = true;

  applyBoxI(itCoast);
  applyBoxI(itWhirlpool);
  applyBoxI(itBombEgg);
  applyBoxM(moBomberbird);
  applyBoxM(moTameBomberbird);
  applyBoxM(moAlbatross);
  applyBoxOrb(itOrbFriend);
  applyBoxOrb(itOrbAir);
  applyBoxOrb(itOrbWater);

  applyBoxI(itPalace);
  applyBoxI(itFjord);
  applyBoxOrb(itOrbFrog);
  applyBoxOrb(itOrbDiscord);
  applyBoxM(moPalace);
  applyBoxM(moFatGuard);
  applyBoxM(moSkeleton);
  applyBoxM(moVizier);
  applyBoxM(moViking);
  applyBoxM(moFjordTroll);
  applyBoxM(moWaterElemental);

  applyBoxI(itSavedPrincess);
  applyBoxOrb(itOrbLove);
  applyBoxM(moPrincess);
  applyBoxM(moPrincessMoved, false); // live Princess for Safety
  applyBoxM(moPrincessArmedMoved, false); // live Princess for Safety
  applyBoxM(moMouse);
  scores_applyBoxNum(G, 'princess_saveArmedHP', '@saveArmedHP');
  scores_applyBoxNum(G, 'princess_saveHP', '@saveHP');

  applyBoxI(itIvory);
  applyBoxI(itElemental);
  applyBoxI(itZebra);
  applyBoxI(itFireShard);
  applyBoxI(itWaterShard);
  applyBoxI(itAirShard);
  applyBoxI(itEarthShard);

  applyBoxM(moAirElemental);
  applyBoxM(moFireElemental);
  applyBoxM(moFamiliar);
  applyBoxM(moGargoyle);
  applyBoxM(moOrangeDog);
  applyBoxOrb(itOrbSummon);
  applyBoxOrb(itOrbMatter);

  applyBoxM(moForestTroll);
  applyBoxM(moStormTroll);
  applyBoxM(moOutlaw);
  applyBoxM(moMutant);
  applyBoxM(moMetalBeast);
  applyBoxM(moMetalBeast2);
  applyBoxI(itMutant);
  applyBoxI(itFulgurite);
  applyBoxI(itBounty);
  applyBoxOrb(itOrbLuck);
  applyBoxOrb(itOrbStunning);

  setprio(bpMode);
  applyBoxBool(G, 'tactic_on', '@tactic');
  setprio(bpMode);
  scores_applyBoxNum(G, 'elec_lightningfast', '@lightningfast');

  // if(save.box[boxid]) printf("lotus = %d (lost = %d)\n", save.box[boxid], isHaunted(lostin));
  if (G.scores_loadingHi && isHaunted(lostin)) G.scores_boxid++;
  else applyBoxI(itLotus);
  applyBoxOrb(itOrbUndeath);
  applyBoxI(itWindstone);
  applyBoxOrb(itOrbEmpathy);
  applyBoxM(moWindCrow);
  applyBoxOrb(itMutant2);
  applyBoxOrb(itOrbFreedom);
  applyBoxM(moRedFox);
  applyBoxBool(G, 'survivalist', '@survivalist');
  setprio(bpMode);
  if (G.scores_loadingHi) applyBoxI(itLotus);
  else scores_applyBoxNum(G, 'truelotus', 'lotus/escape');

  setprio(bpMode);
  applyBoxEnum(G, 'variation', 'variation');
  applyBoxI(itRose);
  applyBoxOrb(itOrbBeauty);
  applyBoxI(itCoral);
  applyBoxOrb(itOrb37);
  applyBoxOrb(itOrbEnergy);
  applyBoxM(moRatling);
  applyBoxM(moFalsePrincess);
  applyBoxM(moRoseLady);
  applyBoxM(moRoseBeauty);
  setprio(bpMode);
  applyBoxEnum(G, 'land_structure', 'land structure');
  setprio(bpMode);
  scores_applyBoxNum(G, 'multi_players', 'shmup players');
  if (G.multi_players < 1 || G.multi_players > MAXPLAYER)
    G.multi_players = 1;
  applyBoxM(moRatlingAvenger);
  // printf("applybox %d\n", shmup::players);

  applyBoxI(itApple);
  applyBoxM(moSparrowhawk);
  applyBoxM(moResearcher);
  applyBoxI(itDragon);
  applyBoxM(moDragonHead);
  applyBoxOrb(itOrbDomination);
  applyBoxI(itBabyTortoise);
  scores_applyBoxNum(G, 'tortoise_seekbits', '@seekbits');
  applyBoxM(moTortoise);
  applyBoxOrb(itOrbShell);

  setprio(bpMode);
  scores_applyBoxNum(G, 'safetyseed', '@safetyseed');

  // (+18)
  for (let i = 0; i < 6; i++) {
    setprio(bpWeirdStat);
    scores_applyBoxNum(G.multi_treasures, i, '@multi-treasures' + its(i));
    setprio(bpWeirdStat);
    scores_applyBoxNum(G.multi_kills, i, '@multi-kills' + its(i));
    setprio(bpWeirdStat);
    scores_applyBoxNum(G.multi_deaths, i, '@multi-deaths' + its(i));
  }
  // (+8)
  applyBoxM(moDragonTail);
  applyBoxI(itKraken);
  applyBoxM(moKrakenH);
  applyBoxM(moKrakenT);
  applyBoxOrb(itOrbSword);
  applyBoxI(itBarrow);
  applyBoxM(moDraugr);
  applyBoxOrb(itOrbSword2);
  applyBoxI(itTrollEgg);
  applyBoxOrb(itOrbStone);

  const sph = { v: false };
  setprio(bpMode);
  sph.v = false; applyBoxBool(sph, 'v', 'sphere'); if (sph.v) G.geometry = gSphere;
  setprio(bpMode);
  sph.v = false; applyBoxBool(sph, 'v', 'elliptic'); if (sph.v) G.geometry = gElliptic;
  scores_applyBoxNum(G, 'princess_reviveAt', '@reviveAt');

  applyBoxI(itDodeca);
  applyBoxI(itAmethyst);
  applyBoxI(itSlime);
  applyBoxOrb(itOrbNature);
  applyBoxOrb(itOrbDash);
  addinv(itOrbRecall);
  applyBoxM(moBat);
  applyBoxM(moReptile);
  applyBoxM(moFriendlyIvy);

  applyBoxI(itGreenGrass);
  applyBoxI(itBull);
  applyBoxOrb(itOrbHorns);
  applyBoxOrb(itOrbBull);
  applyBoxM(moSleepBull);
  applyBoxM(moRagingBull);
  applyBoxM(moHerdBull);
  applyBoxM(moButterfly);
  applyBoxM(moGadfly);

  // 10.0:
  scores_applyBoxNum(G, 'hinttoshow', '@hinttoshow'); // 258
  addinv(itOrbMirror);
  addinv(itGreenStone);
  list_invorb();
  // CAP_INV
  setprio(bpMode);
  applyBoxBool(G, 'inv_on', 'inventory'); // 306
  scores_applyBoxNum(G, 'inv_rseed', '@inv-rseed');

  // 10.1:
  applyBoxI(itLavaLily);
  applyBoxI(itHunting);
  applyBoxI(itBlizzard);
  applyBoxI(itTerra);
  applyBoxOrb(itOrbSide1);
  applyBoxOrb(itOrbSide2);
  applyBoxOrb(itOrbSide3);
  applyBoxOrb(itOrbLava);
  applyBoxOrb(itOrbMorph);
  applyBoxM(moHunterDog);
  applyBoxM(moIceGolem);
  applyBoxM(moVoidBeast);
  applyBoxM(moJiangshi);
  applyBoxM(moTerraWarrior);
  applyBoxM(moSalamander);
  applyBoxM(moLavaWolf);

  applyBoxOrb(itOrbSlaying);
  applyBoxOrb(itOrbMagnetism);
  applyBoxOrb(itOrbPhasing);
  applyBoxI(itDock);
  applyBoxI(itGlowCrystal);
  applyBoxI(itMagnet);
  applyBoxI(itRuins);
  applyBoxI(itSwitch);
  applyBoxM(moNorthPole);
  applyBoxM(moSouthPole);
  applyBoxM(moSwitch1);
  applyBoxM(moSwitch2);
  applyBoxM(moAltDemon);
  applyBoxM(moHexDemon);
  applyBoxM(moPair);
  applyBoxM(moCrusher);
  applyBoxM(moMonk);

  const v2 = { v: false };
  applyBoxBool(v2, 'v', '@variation'); if (G.scores_loading && v2.v) G.variation = eVariation.goldberg;
  scores_applyBoxNum(G.gp_param, 0, '@gp-first');
  scores_applyBoxNum(G.gp_param, 1, '@gp-second');

  v2.v = false; applyBoxBool(v2, 'v', '@irregular'); if (G.scores_loading && v2.v) G.variation = eVariation.irregular;
  scores_applyBoxNum(G, 'irr_cellcount', '@irr-cellcount');

  list_invorb();

  scores_applyBoxNum(G, 'irr_bitruncations_performed', '@irr-bitruncations');

  applyBoxI(itVarTreasure);
  applyBoxI(itBrownian);
  applyBoxI(itWest);
  applyBoxM(moAcidBird);
  applyBoxM(moBrownBug);
  applyBoxM(moVariantWarrior);
  applyBoxM(moWestHawk);
  applyBoxM(moFallingDog);
  applyBoxOrb(itOrbIntensity);
  applyBoxOrb(itOrbChoice);
  applyBoxOrb(itOrbGravity);
  list_invorb();

  applyBoxM(moNarciss);
  applyBoxM(moMirrorSpirit);

  scores_applyBoxNum(G, 'clearing_direct', '@clearing-direct');
  applyBoxBignum(G, 'clearing_imputed', '@clearing-imputed');

  applyBoxOrb(itOrbImpact);
  applyBoxOrb(itOrbChaos);
  applyBoxOrb(itOrbPlague);
  applyBoxI(itEclectic);
  applyBoxI(itFrog);
  applyBoxI(itWet);
  applyBoxM(moFrog);
  applyBoxM(moPhaser);
  applyBoxM(moVaulter);
  applyBoxM(moPike);
  applyBoxM(moRusalka);
  list_invorb();

  setprio(bpTechnical);
  scores_applyBoxNum(G, 'scores_saved_modecode', 'modecode');
  setprio(bpMode);
  applyBoxBool(G, 'ineligible_starting_land', 'ineligible_starting_land');

  setprio(bpMain1);
  scores_applyBoxNum(G, 'yasc_code', 'YASC code');
  setprio(bpMode);
  applyBoxBool(G, 'casual', 'casual mode');

  applyBoxI(itCursed);
  applyBoxI(itDice);
  applyBoxOrb(itOrbPurity);
  applyBoxOrb(itOrbWoods);
  applyBoxM(moHexer);
  applyBoxM(moAngryDie);
  applyBoxM(moAnimatedDie);
  applyBoxI(itCurseWeakness, true);
  applyBoxI(itCurseFatigue, true);
  applyBoxI(itCurseDraining, true);
  applyBoxI(itCurseRepulsion, true);
  applyBoxI(itCurseGluttony, true);
  applyBoxI(itCurseWater, true);
  list_invorb();

  setprio(bpMode);
  applyBoxEnum(G, 'bow_weapon', 'weapon choice');
  setprio(bpMode);
  applyBoxEnum(G, 'bow_style', 'crossbow style');

  applyBoxOrb(itOrbFish);
  list_invorb();

  applyBoxI(itCrossbow, true);
  applyBoxI(itRevolver, true);
  applyBoxI(itAsteroid);
  applyBoxM(moAsteroid);
  applyBoxI(itTreat);
  applyBoxM(moVampire);
  scores_applyBoxNum(G, 'asteroids_generated', '@asteroids generated');
  scores_applyBoxNum(G, 'asteroid_orbs_generated', '@orbs generated');

  setprio(bpWeirdStat);
  scores_applyBoxNum(G, 'loadcount', 'load count');
  setprio(bpWeirdStat);
  scores_applyBoxNum(G, 'load_branching', 'load branching');
  setprio(bpWeirdStat);
  scores_applyBoxNum(G, 'current_loadcount', 'current load count');

  setprio(bpMode);
  applyBoxEnum(G, 'lineofsight', 'lineofsight');
  setprio(bpMode);
  scores_applyBoxNum(G, 'lineofsightAt', '@lineofsightAt');

  if (POSSCORE !== G.scores_boxid) printf(`ERROR: ${G.scores_boxid} boxes\n`);
  if (isize(invorb)) { /* println(hlog, "ERROR: Orbs not taken into account"); */ exit(1); }
}

/** save the current game values to save */
export function scores_saveBox(): void {
  G.scores_boxid = 0; G.scores_saving = true; scores_applyBoxes(); G.scores_saving = false;
}

/** load the current game values from save */
function loadBox(): void {
  // have boxid
  G.scores_boxid = 0; G.scores_loading = true; scores_applyBoxes(); G.scores_loading = false;
}

export const MODECODE_BOX = 387;
export const CURRENT_LOADCOUNT_BOX = 420;
export const LOADCOUNT_BOX = 418;
export const BRANCH_SCALE = 100000.0;

function fill_modecode(): number {
  const S = G.scores_save;
  const sp1 = G.multi_players, sp2 = G.geometry, sp3 = G.shmup_on, sp4 = G.land_structure, sp5 = G.variation;
  const sp7 = G.gp_param[0], sp8 = G.gp_param[1], spinv = G.inv_on;
  try {
    G.multi_players = S.box[197];
    G.geometry = S.box[116];
    if (among(G.geometry, gArchimedean, gProduct, gTwistedProduct, gArbitrary))
      return 6; /* these would not be saved nor loaded correctly */
    G.shmup_on = !!S.box[119];
    G.land_structure = S.box[196];
    G.variation = S.box[186];
    G.gp_param[0] = S.box[342];
    G.gp_param[1] = S.box[343];
    // CAP_INV
    G.inv_on = !!S.box[306];

    if (S.box[238]) G.geometry = gSphere;
    if (S.box[239]) G.geometry = gElliptic;
    if (S.box[341]) G.variation = eVariation.goldberg;
    if (S.box[344]) G.variation = eVariation.irregular;

    if (G.multi_players < 0 || G.multi_players > MAXPLAYER)
      return 6;

    if (G.multi_players === 0)
      G.multi_players = 1;

    if (G.shmup_on && G.multi_players === 1 && G.scores_boxid <= 258)
      return 6; /* not sure why */

    return modecode(2);
  }
  finally {
    // the dynamicvals restore in reverse order
    G.inv_on = spinv; G.gp_param[1] = sp8; G.gp_param[0] = sp7; G.variation = sp5; G.land_structure = sp4;
    G.shmup_on = sp3; G.geometry = sp2; G.multi_players = sp1;
  }
}

/** load the current game values from save into the highscore tables */
function loadBoxHigh(): void {
  G.scores_saved_modecode = G.scores_save.box[MODECODE_BOX];
  G.scores_boxid = 0; G.scores_loadingHi = true; scores_applyBoxes(); G.scores_loadingHi = false;
}

// certify that saves and achievements were received in an official version of HyperRogue: !CAP_CERTIFY
// EX bool anticheat::tampered: G.anticheat_tampered
function anticheat_save(): void { }
function anticheat_load(): boolean { return true; }
/** anticheat::certify(const string& s, int a, int b, int c, int d IS(0)) */
export function anticheat_certify(_s: string, _a: number, _b: number, _c: number, d = 0): number { return d; }
function anticheat_check(cv: number, _ver: string, _s: string, _a: number, _b: number, _c: number, d = 0): boolean { return cv === d; }
function anticheat_nextid_tactic(): void { G.tactic_id++; } // anticheat::nextid(tactic::id, ver, cert)

let saveposition = -1;

export function remove_emergency_save(): void {
  if (G.scorefile === '') return;
  // !ISWINDOWS
  if (saveposition >= 0) {
    if (truncate(G.scorefile, saveposition)) { /* */ }
    saveposition = -1;
  }
}

let scorebox = new score();

// EX bool save_cheats: G.save_cheats

export function saveStats(emergency = false): void {
  // DEBBI(debug_init, ("saveStats [", scorefile, "]"));

  if (G.autocheat && !G.save_cheats) return;
  if (G.scorefile === '') return;
  // CAP_TOUR
  if (G.tour_on && !G.save_cheats) return;
  if (G.randomPatternsMode && !G.save_cheats) return;
  if (G.daily_on) return;
  if (G.peace_on && !G.save_cheats) return;
  if (experimental()) return;

  if (!gold() && !G.racing_on && !G.items[itOrbSafety] && !G.loaded_from_save) return;

  remove_emergency_save();

  G.scores_saved_modecode = modecode();
  const xcode = G.scores_saved_modecode;

  const f = fopen(G.scorefile, 'at');

  if (!f) {
    // printf("Could not open the score file '%s'!\n", scorefile);
    addMessage(XLAT('Could not open the score file: ') + G.scorefile);
    return;
  }

  if (emergency) {
    saveposition = ftell(f);
    //  if(!timerghost) addMessage(XLAT("Emergency save at ") + its(saveposition));
  }

  const timer = time();
  const sbuf = strftime_c(G.timerstart);
  const buf = strftime_c(timer);

  if ((G.tactic_on || G.yendor_on) && !G.items[itOrbSafety] && !G.cheater) {
    const t = (timer - G.timerstart) | 0;

    if (G.tactic_on) {
      const sc = G.items[treasureType(G.specialland)];

      if (sc) {
        const c =
          anticheat_certify(dnameof_l(G.specialland), G.turncount, t, G.timerstart | 0,
            (Math.imul(xcode >>> 0, 999) + G.tactic_id + 256 * sc) | 0);
        fputs(`TACTICS ${VER} ${G.tactic_id} ${G.specialland} ${sc} ${G.turncount} ${t} ${G.timerstart | 0} ${c} ${xcode | 0} date: ${buf}\n`, f);
        tactic_record(G.specialland, sc);
        anticheat_nextid_tactic();
      }
    }

    if (G.yendor_on)
      fputs(`YENDOR ${VER} ${G.yendor_lastchallenge} ${G.items[itOrbYendor]} ${G.yendor_won ? 1 : 0} ${G.turncount} ${t} ${G.timerstart | 0} ` +
        `${anticheat_certify(G.yendor_won ? 'WON' : 'LOST', G.turncount, t, G.timerstart | 0,
          (Math.imul(xcode >>> 0, 999) + G.yendor_lastchallenge + 256 * G.items[itOrbYendor]) | 0)} ` +
        `${xcode | 0} date: ${buf}\n`, f);

    if (!G.loaded_from_save) {
      fclose(f);
      return;
    }
  }

  // CAP_RACING
  if (G.racing_on) {
    const bs = G.racing_best_scores_to_save;
    if (G.racing_official_race && !G.cheater && bs.has(G.specialland)) {
      fputs(`RACING ${VER} ${G.specialland} ${bs.get(G.specialland)} date: ${buf}\n`, f);
      bs.delete(G.specialland);
    }
    fclose(f);
    return;
  }

  fputs('HyperRogue: game statistics (version ' + VER + ')\n', f);
  if (G.cheater)
    fputs(`CHEATER! (cheated ${G.cheater} times)\n`, f);
  if (true) {

    fputs(VER, f);
    if (!G.shmup_on) G.items[itOrbLife] = countMyGolems(moGolem);
    if (!G.shmup_on) G.items[itOrbFriend] = countMyGolems(moTameBomberbird);
    if (!G.shmup_on) G.kills[moPrincessMoved] = countMyGolems(moPrincess);
    if (!G.shmup_on) G.kills[moPrincessArmedMoved] = countMyGolems(moPrincessArmed);
    if (!G.shmup_on) G.princess_saveHP = countMyGolemsHP(moPrincess);
    if (!G.shmup_on) G.princess_saveArmedHP = countMyGolemsHP(moPrincessArmed);
    scores_saveBox();

    let line = '';
    for (let i = 0; i < G.scores_boxid; i++) line += ` ${G.scores_save.box[i] | 0}`;
    fputs(line, f);
    scorebox = G.scores_save.clone();
    anticheat_save();

    fputs('\n', f);
    if (G.yasc_message !== '') fputs(`YASC ${utf8_cstr(G.yasc_message)}\n`, f);
  }
  fputs(`Played on: ${sbuf} - ${buf} (${G.turncount} ${G.shmup_on ? 'knives' : 'turns'})\n`, f);
  fputs(`Total wealth: ${gold()}\n`, f);
  fputs(`Total enemies killed: ${tkills()}\n`, f);
  fputs(`cells generated: ${G.cellcount}\n`, f);
  if (pureHardcore()) fputs('Pure hardcore mode\n', f);
  if (G.geometry) fputs(`Geometry: ${gp_operation_name()}/${ginf[G.geometry].tiling_name}/${ginf[G.geometry].quotient_name}\n`, f);

  if (!ls_nice_walls())
    fputs(`land structure: ${land_structure_name(true)}\n`, f);

  if (G.shmup_on) fputs('Shoot-em up mode\n', f);
  if (G.inv_on) fputs('Inventory mode\n', f);
  if (G.multi_players > 1) fputs(`Multi-player (${G.multi_players} players)\n`, f);
  fputs('Number of cells explored, by distance from the player:\n', f);
  { let s = ''; for (let i = 0; i < 10; i++) s += ` ${G.explore[i] | 0}`; fputs(s, f); } fputs('\n', f);
  if (G.kills[0]) fputs(`walls melted: ${G.kills[0]}\n`, f);
  fputs(`cells travelled: ${celldist(G.cwt.at)}\n`, f);

  fputs('\n', f);

  for (let i = 0; i < ittypes; i++) if (G.items[i])
    fputs(`${String(G.items[i]).padStart(4, ' ')}x ${utf8_cstr(iinf[i].name)}\n`, f);

  fputs('\n', f);

  for (let i = 1; i < motypes; i++) if (G.kills[i])
    fputs(`${String(G.kills[i]).padStart(4, ' ')}x ${utf8_cstr(minf[i].name)}\n`, f);

  fputs('\n\n\n', f);

  // !ISMOBILE
  // DEBB(debug_init, ("Game statistics saved to ", scorefile));
  addMessage(XLAT('Game statistics saved to %1', G.scorefile));
  fclose(f);
}

/** the UTF-8 bytes of a text as a C string of cfile.ts (fprintf of the original writes the names' UTF-8 bytes; found
 *  by U2: monster names like "Rusałka" in the score file) */
function utf8_cstr(s: string): string { return bytes_to_cstr(new TextEncoder().encode(s)); }

let tamper = false;

/** load the save */
export function loadsave(): void {
  if (G.autocheat) return;
  if (G.scorefile === '') return;
  // CAP_TOUR
  if (G.tour_on) return;
  // DEBBI(debug_init, ("loadSave"));

  const f = fopen(G.scorefile, 'rt');
  havesave = !!f;
  if (!f) return;
  let ok = false;
  const coh = counthints();
  const sc = scorebox;
  while (!feof(f)) {
    let buf = fgets(12000, f);
    if (buf === null) break;
    if (buf[0] === 'M' && buf[1] === 'O') {
      let s = buf;
      while (s !== '' && s.charCodeAt(s.length - 1) < 32) s = s.slice(0, -1);
      load_modecode_line(s);
    }
    if (buf[0] === 'N' && buf[1] === 'A') {
      let s = buf;
      while (s !== '' && s.charCodeAt(s.length - 1) < 32) s = s.slice(0, -1);
      load_modename_line(s);
    }
    if (buf[0] === 'H' && buf[1] === 'y') {
      let w = fscanf_s(f, 9999);
      if (w === null) break;
      buf = w;
      sc.ver = buf;
      if (sc.ver === 'CHEATER!' && G.save_cheats) {
        if (fgets(12000, f) === null) break;
        w = fscanf_s(f, 9999);
        if (w === null) break;
        buf = w;
        sc.ver = buf;
      }
      if (sc.ver[1] !== '.') sc.ver = '0' + sc.ver;
      if (verless(sc.ver, '4.4') || sc.ver === 'CHEATER!') { ok = false; continue; }
      ok = true;
      for (let i = 0; i < MAXBOX; i++) {
        const v = fscanf_d(f);
        if (v !== null) { sc.box[i] = v; continue; }
        G.scores_boxid = i;

        tamper = anticheat_load();

        const S = G.scores_save;
        for (let i = 0; i < G.scores_boxid; i++) S.box[i] = sc.box[i];
        for (let i = G.scores_boxid; i < MAXBOX; i++) { S.box[i] = 0; sc.box[i] = 0; }
        if (G.scores_boxid <= LOADCOUNT_BOX) S.box[LOADCOUNT_BOX] = -1;

        if (G.scores_boxid <= MODECODE_BOX) S.box[MODECODE_BOX] = sc.box[MODECODE_BOX] = fill_modecode();

        if (S.box[258] >= 0 && S.box[258] < coh) {
          hints[S.box[258]].last = S.box[1];
        }

        loadBoxHigh();

        break;
      }
    }
    if (buf[0] === 'A' && buf[1] === 'C' && buf[2] === 'H') {
      const r = sscanf(buf, '%70s%70s');
      const buf2 = r.length > 1 ? r[1] as string : '';
      if (buf2 === 'PRINCESS1') G.princess_everSaved = true;
      if (buf2 === 'YENDOR2') G.yendor_everwon = true;
      if (buf2 === 'CR4') G.chaosUnlocked = true;
    }

    if (buf[0] === 'T' && buf[1] === 'A' && buf[2] === 'C') {
      ok = false;
      const r = sscanf(buf, '%70s%9s%d%d%d%d%d%d%d%d');
      const ver = (r[1] ?? '') as string;
      const [tid, land, sco, tc, t, ts, cert] = [2, 3, 4, 5, 6, 7, 8].map((k) => (r[k] ?? 0) as number);
      let xc = (r[9] ?? -1) as number;

      let l2: eLand = land;
      if (land === laMirror && verless(ver, '10.0')) l2 = laMirrorOld;

      if (xc === -1)
        for (xc = 0; xc < 32768; xc++)
          if (anticheat_check(cert, ver, dnameof_l(l2), tc, t, ts, (Math.imul(xc, 999) + tid + 256 * sco) | 0))
            break;

      if (tid === G.tactic_id && (anticheat_check(cert, ver, dnameof_l(l2), tc, t, ts, (Math.imul(xc, 999) + tid + 256 * sco) | 0))) {
        if (sco !== 0
          && !(land === laOcean && verless(ver, '8.0f'))
          && !(land === laTerracotta && verless(ver, '10.3e'))
          && !(land === laWildWest && verless(ver, '11.3b') && !verless(ver, '11.3')))
          tactic_record(l2, sco, get_identify(xc));
        anticheat_nextid_tactic();
      }
    }

    if (buf[0] === 'Y' && buf[1] === 'E' && buf[2] === 'N') {
      const r = sscanf(buf, '%70s%9s%d%d%d%d%d%d%d%d');
      const ver = (r[1] ?? '') as string;
      const [cid, oy, won, tc, t, ts, cert] = [2, 3, 4, 5, 6, 7, 8].map((k) => (r[k] ?? 0) as number);
      let xc = (r[9] ?? -1) as number;

      if (xc === -1)
        for (xc = 0; xc < 32768; xc++)
          if (anticheat_check(cert, ver, won ? 'WON' : 'LOST', tc, t, ts, (Math.imul(xc, 999) + cid + 256 * oy) | 0))
            break;

      if (won) if (anticheat_check(cert, ver, won ? 'WON' : 'LOST', tc, t, ts, (Math.imul(xc, 999) + cid + 256 * oy) | 0)) {
        if (xc === 19 && cid === 25) xc = 0;
        xc = get_identify(xc);
        if (cid > 0 && cid < YENDORLEVELS)
          if (!(verless(ver, '8.0f') && oy > 1 && cid === 15))
            if (!(verless(ver, '9.3b') && oy > 1 && (cid === 27 || cid === 28))) {
              const bs = yendor_bestscore_at(xc);
              bs[cid] = Math.max(bs[cid], oy);
            }
      }
    }

    // CAP_RACING
    if (buf[0] === 'R' && buf[1] === 'A' && buf[2] === 'C') {
      const r = sscanf(buf, '%70s%9s%d%d');
      const land = (r[2] ?? 0) as number, sco = (r[3] ?? 0) as number;
      /* score may equal 0 because of earlier bugs */
      if (sco) {
        const res = G.racing_best_scores.get(land) ?? 0;
        if (sco < res || res === 0) G.racing_best_scores.set(land, sco);
        else G.racing_best_scores.set(land, res);
      }
      // println(hlog, "loaded the score for ", dnameof(eLand(land)), " of ", score);
    }

    if (buf[0] === 'L' && buf[1] === 'O' && buf[2] === 'A' && buf[3] === 'D') {
      sc.box[CURRENT_LOADCOUNT_BOX]++;
    }
  }

  fclose(f);
  // this is the index of Orb of Safety
  if (ok && sc.box[65 + 4 + itOrbSafety - itOrbLightning])
    load_last_save();
}

export function load_last_save(): void {
  const sc = scorebox;
  G.anticheat_tampered = tamper;
  //  printf("box = %d (%d)\n", sc.box[65 + 4 + itOrbSafety - itOrbLightning], boxid);
  //  printf("boxid = %d\n", boxid);
  const S = G.scores_save;
  for (let i = 0; i < G.scores_boxid; i++) S.box[i] = sc.box[i];
  for (let i = G.scores_boxid; i < MAXBOX; i++) S.box[i] = 0;
  //  for(int i=160; i<200; i++) printf("%d: %d ", i, save.box[i]);

  const mc = sc.box[MODECODE_BOX];
  if (mc >= FIRST_MODECODE && G.meaning.has(mc)) {
    const ss = new modestream();
    ss.s = G.meaning.get(mc)!;
    ss.vernum = ss.get_int() >>> 0; // ss.read(ss.vernum): color_t
    if (ss.vernum < 0xAA05)
      mapstream_load_geometry(ss);
    else {
      ss.write_char(0);
      load_mode_data_with_zero(ss);
    }
  }

  loadBox();
  //  printf("boxid = %d\n", boxid);
  // CAP_COMPLEX2
  if (G.items[itHolyGrail]) {
    G.items[itHolyGrail]--;
    G.camelot_knighted = newRoundTableRadius();
    G.items[itHolyGrail]++;
  }
  else G.camelot_knighted = 0;
  G.safety = true;
  if (G.items[itSavedPrincess] < 0) G.items[itSavedPrincess] = 0;
  addMessage(XLAT('Game loaded.'));
  G.showstartmenu = false;
  // reset unsavable special modes just in case
  G.peace_on = false;
  G.randomPatternsMode = false;
  G.yendor_on = false;
  G.tour_on = false;
  G.save_turns = G.turncount;
  G.loaded_from_save = true;

  if (G.loadcount >= 0) {
    G.loadcount += G.current_loadcount;
    G.load_branching = itrunc(G.load_branching + BRANCH_SCALE * Math.log(1 + G.current_loadcount));
    G.current_loadcount = 0;
  }
}

export function stop_game(): void {
  if (!G.game_active) return;
  // the online game (port only): a restart or a mode change by the player leaves it (the rules' own stop_game, the
  // Orb of Safety's, runs while the round is applied, when online_input is cleared)
  if (G.online_input && G.online_leave) G.online_leave();
  if (dual_split(stop_game)) return;
  // DEBBI(debug_init, ("stop_game"));
  achievement_final(true);
  save_if_needed();
  for (let i = 0; i < ittypes; i++) G.items[i] = 0;
  G.lastkills = 0; for (let i = 0; i < motypes; i++) G.kills[i] = 0;
  for (let i = 0; i < 10; i++) G.explore[i] = 0;
  for (let i = 0; i < 10; i++) for (let l = 0; l < landtypes; l++)
    G.exploreland[i][l] = 0;

  for (const i of player_indices())
    G.multi_deaths[i]++;

  // CAP_SAVE
  G.anticheat_tampered = false;
  G.achievementsReceived.length = 0;
  G.princess_saved = false;
  G.princess_nodungeon = false;
  G.princess_reviveAt = 0;
  G.princess_forceVizier = false;
  G.princess_forceMouse = false;
  // CAP_COMPLEX2
  G.camelot_knighted = 0;
  // items[itGreenStone] = 100;
  G.game_active = false;
  G.movehints_ticks = 0;
  clearMemory();
  // CAP_DAILY=0: if(daily::on) daily::turnoff();
}

/** EX eModel default_model() (stage 3, package G1) */
export function default_model(): number {
  if (sl2()) return mdGeodesic;
  if (nonisotropic()) return G.nisot_geodesic_movement ? mdGeodesic : mdLiePerspective;
  if (GDIM() === 3) return mdPerspective;
  return mdDisk;
}

/** EX void geometry_settings(bool was_default) */
export function geometry_settings(was_default: boolean): void {
  if (was_default) pconf().model = default_model();
  if (WDIM() === 2 && (cgflags() & qIDEAL) !== 0n && G.vid.always3 && G.vid.texture_step < 32) G.vid.texture_step = 32;
  if (sl2()) G.nisot_geodesic_movement = true;
}

/** EX void set_geometry(eGeometry target) (stage 3, package G1) */
export function set_geometry(target: number): void {
  const was_default = pconf().model === default_model();
  callhooks(G.hooks_on_geometry_change);
  if (G.geometry !== target) {
    stop_game();
    ors_reset();
    if (among(target, gProduct, gTwistedProduct)) {
      throw new NotPorted('set_geometry: product spaces (hybrid::configure)'); // STAGE3-STUB (the 3D package)
    }
    G.geometry = target;

    // CAP_IRR
    if (IRREGULAR()) G.variation = eVariation.bitruncated;
    // CAP_GP
    if (GOLDBERG() && G.gp_param[0] === 1 && G.gp_param[1] === 1 && S3() === 3) {
      G.variation = eVariation.bitruncated;
    }
    if (GOLDBERG() && nonorientable()) {
      if (G.gp_param[1] && G.gp_param[1] !== G.gp_param[0])
        G.gp_param[1] = 0;
    }
    if (DUAL() && G.geometry !== gArchimedean && !mhybrid())
      G.variation = ginf[G.geometry].default_variation;
    // CAP_BT
    if (bt_in() || WDIM() === 3 || aperiodic() || arb_in()) if (!mhybrid()) G.variation = eVariation.pure;
    if (S3() >= OINF) G.variation = eVariation.pure;
    if (INVERSE() && !mhybrid()) G.variation = gp_variation_for(G.gp_param);
    if (ginf[target].default_variation === eVariation.pure && G.geometry !== gArchimedean && !mhybrid())
      G.variation = eVariation.pure;
    geometry_settings(was_default);

    if (G.geometry === gArbitrary) {
      throw new NotPorted('set_geometry: arb::convert::base_geometry'); // STAGE3-STUB (arbitrile.cpp)
    }
  }
}

/** EX void set_variation(eVariation target) (stage 3, package G1) */
export function set_variation(target: number): void {
  if (G.variation !== target) {
    stop_game();
    if (is_subcube_based(target)) {
      if (!reg3_in()) G.geometry = hyperbolic() ? gSpace435 : gCell8;
      G.variation = target;
      return;
    }
    if (is_reg3_variation(target)) {
      if (!reg3_in()) G.geometry = hyperbolic() ? gSpace435 : gCell8;
      G.variation = target;
      return;
    }
    if (target !== eVariation.pure) {
      if (bt_in() || sol() || aperiodic() || WDIM() === 3) if (!mproduct()) G.geometry = gNormal;
    }
    arb_convert_deactivate();
    const cd = ginf[gCrystal];
    if (target === eVariation.bitruncated && cryst() && cd.sides === 8 && cd.vertex === 4) {
      cd.vertex = 3;
      cd.tiling_name = '{8,3}';
      target = eVariation.pure;
    }
    G.variation = target;
  }
}

export function switch_game_mode(switchWhat: number): void {
  // DEBBI(debug_init, ("switch_game_mode ", switchWhat));
  switch (switchWhat) {
    case rg_peace:
      G.peace_on = !G.peace_on;
      G.tactic_on = G.yendor_on = G.princess_challenge =
      G.randomPatternsMode = G.inv_on = false;
      G.racing_on = false;
      G.bow_weapon = bow_wBlade;
      break;

    case rg_dualmode:
      G.racing_on = false;
      G.yendor_on = G.tactic_on = G.princess_challenge = false;
      G.bow_weapon = bow_wBlade;
      if (!G.dual_state) dual_enable();
      else dual_disable();
      break;

    case rg_inv:
      G.inv_on = !G.inv_on;
      if (G.tactic_on) G.firstland = G.specialland = laIce;
      G.tactic_on = G.yendor_on = G.princess_challenge =
      G.peace_on = false;
      G.racing_on = false;
      break;

    case rg_chaos:
      if (G.tactic_on) G.firstland = laIce;
      G.yendor_on = G.tactic_on = G.princess_challenge = false;
      G.land_structure = ls_any_chaos() ? lsNiceWalls : lsChaos;
      if (closed_or_bounded()) set_geometry(gNormal);
      G.racing_on = false;
      break;

    // CAP_TOUR
    case rg_tour:
      G.geometry = gNormal;
      G.yendor_on = G.tactic_on = G.princess_challenge = G.peace_on = G.inv_on = false;
      dual_disable();
      G.land_structure = lsNiceWalls;
      G.randomPatternsMode = false;
      G.variation = eVariation.bitruncated;
      // CAP_GP
      G.gp_param = [1, 1];
      G.shmup_on = false;
      G.racing_on = false;
      break;

    case rg_yendor:
      G.yendor_on = !G.yendor_on;
      G.tactic_on = false;
      G.peace_on = false;
      G.inv_on = false;
      G.princess_challenge = false;
      G.randomPatternsMode = false;
      G.land_structure = lsNiceWalls;
      G.racing_on = false;
      if (!G.yendor_on) G.firstland = G.specialland = laIce;
      dual_disable();
      break;

    // CAP_RACING
    case rg_racing:
      G.racing_on = !G.racing_on;
      G.shmup_on = G.racing_on;
      G.peace_on = false;
      G.inv_on = false;
      G.yendor_on = false;
      G.land_structure = G.racing_on ? lsSingle : lsNiceWalls;
      G.princess_challenge = false;
      dual_disable();
      break;

    case rg_tactic:
      G.tactic_on = !G.tactic_on;
      G.yendor_on = false;
      G.peace_on = false;
      G.inv_on = false;
      G.randomPatternsMode = false;
      G.princess_challenge = false;
      G.racing_on = false;
      G.land_structure = G.tactic_on ? lsSingle : lsNiceWalls;
      if (!G.tactic_on) G.firstland = G.specialland = laIce;
      dual_disable();
      break;

    case rg_shmup:
      G.shmup_on = !G.shmup_on;
      G.princess_challenge = false;
      if (!G.shmup_on) G.racing_on = false;
      if (!G.shmup_on && G.multi_players > 1) G.bow_weapon = bow_wBlade;
      break;

    case rg_randpattern:
      G.randomPatternsMode = !G.randomPatternsMode;
      G.tactic_on = false;
      G.yendor_on = false;
      G.peace_on = false;
      G.princess_challenge = false;
      break;

    case rg_princess:
      G.princess_challenge = !G.princess_challenge;
      G.firstland = G.specialland = G.princess_challenge ? laPalace : laIce;
      G.shmup_on = false;
      G.tactic_on = false;
      G.yendor_on = false;
      G.land_structure = G.princess_challenge ? lsSingle : lsNiceWalls;
      G.inv_on = false;
      G.racing_on = false;
      G.use_custom_land_list = false;
      dual_disable();
      break;

    // CAP_DAILY=0: rg::daily, rg::daily_off
  }
}

export function start_game(): void {
  if (G.game_active) return;
  // DEBBI(debug_init, ("start_game"));
  if (G.dual_state === 1) dual_assign_landsides();
  if (dual_split(start_game)) return;
  for (;;) { // restart:
    G.game_active = true;
    G.gamegen_failure = false;
    G.ignored_memory_warning = false;
    G.loaded_from_save = false;
    check_cgi();
    cgi().require_basics();
    // CAP_ARCM
    arcm_current_or_fake_compute_geometry();
    initcells();
    get_expansion().reset();
    init_disk_cells();

    if (G.randomPatternsMode) {
      for (let i = 0; i < landtypes; i++) {
        G.randompattern[i] = hrandpos();
        // change probability 1/5 to 2/6
        if (hrand(5) === 0) {
          G.randompattern[i] -= (G.randompattern[i] % 5);
        }
      }
      if (G.randomPatternsMode) G.specialland = pickLandRPM(laNone);
      clearMemoRPM();
    }

    initgame();
    if (G.gamegen_failure) {
      stop_game();
      continue; // goto restart
    }
    break;
  }
  G.canmove = true;
  restartGraph();
  resetmusic();
  resetmusic();
  // CAP_TEXTURE
  texture_config_remap();
  subscreens_prepare();
  callhooks(G.hooks_post_startgame);
}

/** popAllScreens + popAllGames + stop_game + switch_game_mode + start_game */
export function restart_game(switchWhat: number = rg_nothing): void {
  popScreenAll();
  stop_game_and_switch_mode(switchWhat);
  start_game();
}

/** stop_game + switch_game_mode */
export function stop_game_and_switch_mode(switchWhat: number = rg_nothing): void {
  // CAP_RACING
  if (switchWhat === rg_nothing && G.racing_on) {
    racing_restore_goals();
    racing_reset_race();
    G.shmup_count_pauses = 0;
    return;
  }
  const b = (switchWhat === rg_tour && !G.tour_on);
  if (G.tour_on && among(switchWhat, rg_racing, rg_tour, rg_dualmode))
    tour_stop_tour();
  stop_game();
  switch_game_mode(switchWhat);
  if (b) G.tour_on = true;
}

// EX purehookset hooks_clearmemory: G.hooks_clearmemory

export function clearMemory(): void {
  callhooks(G.hooks_clearmemory);
}

// EX bool fixseed = false; EX int startseed = 0; EX eLand firstland0; EX purehookset hooks_initialize;
// EX bool savefile_selection = false: G

/** select_savefile: the file dialog of a later stage; savefile_selection is false on the desktop */
export function select_savefile(): void {
  if (!G.savefile_selection) return;
  throw new NotPorted('select_savefile (file dialog)');
}

export function progress_warning(): void {
  if (G.scorefile === '' && G.savefile_selection)
    addMessage(XLAT('Your progress will not be saved.'));
}

export function restore_all_golems(): void {
  if (!G.shmup_on) {
    restoreGolems(G.items[itOrbLife], moGolem); G.items[itOrbLife] = 0;
    restoreGolems(G.items[itOrbFriend], moTameBomberbird); G.items[itOrbFriend] = 0;
    restoreGolems(G.kills[moPrincessMoved], moPrincess, G.princess_saveHP); G.kills[moPrincessMoved] = 0;
    restoreGolems(G.kills[moPrincessArmedMoved], moPrincessArmed, G.princess_saveArmedHP); G.kills[moPrincessArmedMoved] = 0;
  }
}

// EX bool save_loaded: G

export function initAll(): void {
  callhooks(G.hooks_initialize);
  init_floorcolors();
  G.showstartmenu = true;
  G.festive_date = showFestive();
  ca_init();
  // CAP_COMMANDLINE
  arg_read(1);
  srand(time());
  shrand(G.fixseed ? G.startseed : time());

  G.firstland0 = G.firstland;

  // initlanguage();
  initialize_all();

  // CAP_SAVE
  select_savefile();
  G.save_loaded = true;
  loadsave();
  if (IRREGULAR() && !irr_base()) irr_auto_creator();
  const b = G.loaded_from_save;
  start_game();
  if (b) G.loaded_from_save = b;
  restore_all_golems();

  G.firstland = G.firstland0;
  polygonal_solve();
}

// EX purehookset hooks_final_cleanup: G

export function save_if_needed(): void {
  // CAP_SAVE
  if (G.casual && G.savecount && !G.items[itOrbSafety]) {
    scorebox.box[CURRENT_LOADCOUNT_BOX]++;
    const f = fopen(G.scorefile, 'at');
    if (f) {
      let yasc_msg = 'quit';
      if (!G.canmove && G.yasc_message !== '') yasc_msg = G.yasc_message;
      void yasc_msg; // (computed but not printed, as in the original)
      fputs(`LOAD ${G.cwt.at.land} ${(G.turncount - G.save_turns) | 0} ${formatted_yasc_code()} ${G.yasc_message}\n`, f);
      fclose(f);
    }
  }
  if (!G.casual)
    saveStats();
}

export function finishAll(): void {
  achievement_final(!G.items[itOrbSafety]);

  save_if_needed();
  clearMemory();
  // !ISMOBILE
  quit_all();

  callhooks(G.hooks_final_cleanup);
}

/** save_mode_to_file / load_mode_from_file: the mode files with config.cpp's parameters (a later stage) */
export function save_mode_to_file(_fname: string): void { throw new NotPorted('save_mode_to_file'); }
export function load_mode_from_file(_fname: string): void { throw new NotPorted('load_mode_from_file'); }

/** havesave (file-local): whether loadsave found a score file */
export function get_havesave(): boolean { return havesave; }

/** eliminate_if(v, f) of hyper.h, in place */
function eliminate_if<T>(v: T[], f: (x: T) => boolean): void {
  for (let i = 0; i < v.length; i++) if (f(v[i])) { v[i] = v[v.length - 1]; v.pop(); i--; }
}

/** the static initializers of system.cpp: the hooks (cgm) and the scores::save object */
export function register_system(): void {
  G.scores_save = new score();
  addHook(G.hooks_clearmemory, 40, () => {
    G.pathq.length = 0;
    G.dcal.length = 0;
    clearshadow();
    for (let i = 0; i < MAXPLAYER; i++) G.lastmountpos[i] = null!;
    G.seenSevenMines = false;
    G.recallCell = new cellwalker(); // recallCell = NULL
    if (G.butterflies) G.butterflies.length = 0;
    G.buggycells.length = 0;
    G.crush_next.length = 0;
    G.crush_now.length = 0;
    G.rosemap.clear();
    G.hv_land.clear();
    if (G.bow_bowpath) G.bow_bowpath.length = 0;
    bow_clear_bowpath();
    G.bow_fire_mode = false;
    for (const am of G.adj_memo) am.clear();
  });
  // addHook(hooks_gamedata, 0, ...): dual mode (multigame.cpp, a later stage) stores these variables
  addHook(G.hooks_removecells, 0, () => {
    eliminate_if(G.crush_next, is_cell_removed);
    eliminate_if(G.crush_now, is_cell_removed);
    eliminate_if(G.buggycells, is_cell_removed);
    if (G.butterflies) eliminate_if(G.butterflies as [cell, number][], (p) => is_cell_removed(p[0]));
    for (const sp of G.shpos) for (let p = 0; p < MAXPLAYER; p++)
      if (sp[p] && is_cell_removed(sp[p])) sp[p] = null!; // set_if_removed(shpos[i][p], NULL)
    const to_remove: cell[] = [];
    for (const p of G.rosemap.keys()) if (is_cell_removed(p)) to_remove.push(p);
    for (const r of to_remove) G.rosemap.delete(r);
  });
}
