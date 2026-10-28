// @ts-nocheck
// COW 3.3.3 local.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { Abort_Sound, Play_Sound } from './sound.ts';
import { S_Plasma, S_Ship, S_Torp, W_DrawSprite } from './x11sprite.ts';
import { W_CacheClearArea, W_CacheLine, W_ChangeBorder, W_ClearWindow, W_FlushClearAreaCache, W_FlushLineCaches, W_MakePhaserLine, W_MakeTractLine, W_MaskText, W_WriteBitmap, W_WriteCircle, W_WriteTriangle } from './x11window.ts';
import { struct_planet } from './structs.ts';
import { $arr, $rd, $sadd, $sdiff, $sidx, $wr, G, P, atan2, rint } from '../rt/index.ts';
import { CLOAK_SOUND, CRUISER, DETDIST, EXPLOSION_SOUND, EX_FRAMES, FIRE_PLASMA_SOUND, FIRE_TORP_SOUND, GWIDTH, LITE_PLAYERS_LOCAL, MAXPLANETS, MAXPLASMA, MAXPLAYER, MAXTORP, NOBODY, NO_CLK_PIX, NUMDETFRAMES, NUM_HOCKEY_LINES, OTHER_EXPLOSION_SOUND, OTHER_FIRE_PLASMA_SOUND, OTHER_FIRE_TORP_SOUND, OTHER_PHASER_SOUND, OTHER_SBEXPLOSION_SOUND, PALIVE, PEXPLODE, PFCLOAK, PFGREEN, PFOBSERV, PFPLLOCK, PFPLOCK, PFPRESS, PFRED, PFSHIELD, PFTRACT, PFYELLOW, PHASEDIST, PHASER_SOUND, PHFREE, PHHIT, PHHIT2, PHMISS, PLASMA_HIT_SOUND, PLFUEL, PLREPAIR, PTEXPLODE, PTFREE, REDALERT_SOUND, ROM, SBEXPLOSION_SOUND, SBEXPVIEWS, SCALE, SHIELD_DOWN_SOUND, SHIELD_FRAMES, SHIELD_UP_SOUND, STARBASE, S_LINE_HORIZONTAL, S_LINE_VERTICAL, TEXPLODE, TFREE, TORP_HIT_SOUND, TWINSIDE, UNCLOAK_SOUND, cloak_height, cloak_width, cloud_height, cloud_width, emph_player_seql_frames, emph_player_seql_height, emph_player_seql_width, eplasmatorp_height, eplasmatorp_width, etorp_height, etorp_width, ex_height, ex_width, mplasmatorp_height, mplasmatorp_width, mtorp_height, mtorp_width, planet_height, planet_width, plasmacloud_height, plasmacloud_width, sbexp_height, sbexp_width, shield_height, shield_width } from './consts.ts';

let clearcount: number;
let clearzone: any;
let clearlcount: number;
let clearline: any;
let sound_torps: number;
let sound_other_torps: number;
let num_other_torps: number;
let sound_plasma: number;
let sound_other_plasma: number;
let num_other_plasma: number;

function planetBitmap(p: struct_planet | null): Ptr | null {
  let i = 0;
  if (G.showlocal === 0) {
    return G.bplanets[0];
  } else if (p.pl_info & G.me.p_team || G.playback) {
    if (G.showlocal === 1) {
      return G.bplanets[G.remap[p.pl_owner]];
    } else {
      i = 0;
      if (p.pl_armies > 4) {
        i += 4;
      }
      if (p.pl_flags & PLREPAIR) {
        i += 2;
      }
      if (p.pl_flags & PLFUEL) {
        i += 1;
      }
      switch (G.showlocal) {
      case 2:
        return G.bplanets2[i];
      case 3:
        return G.bplanets3[i];
      case 4:
        return G.bplanets4[i];
      default:
        return G.bplanets[0];
      }
    }
  } else {
    return G.noinfoplanet;
  }
}

function DrawPlanets(): void {
  let dx = 0;
  let dy = 0;
  let l = null;
  let view = Math.imul(SCALE, TWINSIDE) / 2 | 0;
  for (l = $sadd($sadd(G.planets, MAXPLANETS), -1); $sidx(l) >= $sidx(G.planets); l = $sadd(l, -1)) {
    dx = l.pl_x - G.me.p_x;
    dy = l.pl_y - G.me.p_y;
    if (dx > view || dx < -view || dy > view || dy < -view) {
      continue;
    }
    dx = (dx / SCALE | 0) + (TWINSIDE / 2 | 0);
    dy = (dy / SCALE | 0) + (TWINSIDE / 2 | 0);
    W_WriteBitmap(dx - (planet_width / 2 | 0), dy - (planet_height / 2 | 0), planetBitmap(l), l.pl_info & G.me.p_team || G.playback ? G.shipCol[G.remap[l.pl_owner]] : G.unColor);
    if (G.showIND && (l.pl_info & G.me.p_team || G.playback) && l.pl_owner === NOBODY) {
      W_CacheLine(G.w, dx - (planet_width / 2 | 0), dy - (planet_height / 2 | 0), dx + ((planet_width / 2 | 0) - 1), dy + ((planet_height / 2 | 0) - 1), G.W_White);
      W_CacheLine(G.w, dx + ((planet_width / 2 | 0) - 1), dy - (planet_height / 2 | 0), dx - (planet_width / 2 | 0), dy + ((planet_height / 2 | 0) - 1), G.W_White);
    }
    if (G.namemode) {
      W_MaskText(G.w, dx - (planet_width / 2 | 0), dy + (planet_height / 2 | 0), l.pl_info & G.me.p_team || G.playback ? G.shipCol[G.remap[l.pl_owner]] : G.unColor, P(l.pl_name), l.pl_namelen, G.me.p_team === l.pl_owner ? G.W_HighlightFont : l.pl_info & G.me.p_team && !(l.pl_owner & (G.me.p_swar | G.me.p_hostile)) ? G.W_HighlightFont : G.W_RegularFont);
      clearzone[0][clearcount] = dx - (planet_width / 2 | 0);
      clearzone[1][clearcount] = dy + (planet_height / 2 | 0);
      clearzone[2][clearcount] = Math.imul(G.W_Textwidth, l.pl_namelen);
      clearzone[3][clearcount] = G.W_Textheight;
      ++clearcount;
    }
    clearzone[0][clearcount] = dx - (planet_width / 2 | 0);
    clearzone[1][clearcount] = dy - (planet_height / 2 | 0);
    clearzone[2][clearcount] = planet_width;
    clearzone[3][clearcount] = planet_height;
    ++clearcount;
  }
}

function DrawShips(): void {
  let $g = 0;
  let j = null;
  let php = null;
  let idbuf = new Int8Array(10);
  let view = 0;
  let dx = 0;
  let dy = 0;
  let px = 0;
  let py = 0;
  let wx = 0;
  let wy = 0;
  let tx = 0;
  let ty = 0;
  let lx = 0;
  let ly = 0;
  let ship_bits = null;
  let sprite = null;
  $L: for (;;) {
    switch ($g) {
    case 0:
      idbuf = new Int8Array(10);
      view = Math.imul(SCALE, TWINSIDE) / 2 | 0;
      idbuf[0] = 48;
      idbuf[1] = 0;
      j = $sadd($sadd(G.players, MAXPLAYER), -1);
    case 2:
      if (!($sidx(j) >= $sidx(G.players))) { $g = 4; continue $L; }
      if ((j.p_flags & PFCLOAK) >>> 0) {
        if (j.p_cloakphase < (12 * G.server_ups / 10 | 0) - 1) {
          if (G.me === j && j.p_cloakphase === 0) {
            Play_Sound(CLOAK_SOUND);
          }
          j.p_cloakphase = j.p_cloakphase + 1 << 16 >> 16;
        }
      } else {
        if (j.p_cloakphase) {
          if (G.me === j) {
            if (j.p_cloakphase === (12 * G.server_ups / 10 | 0) - 1) {
              Play_Sound(UNCLOAK_SOUND);
            } else {
              Abort_Sound(CLOAK_SOUND);
            }
          }
          j.p_cloakphase = j.p_cloakphase - 1 << 16 >> 16;
        }
      }
      sprite = S_Ship(j.p_no);
      dx = j.p_x - G.me.p_x;
      dy = j.p_y - G.me.p_y;
      if (!sprite && (dx > view || dx < -view || dy > view || dy < -view)) {
        { $g = 3; continue $L; };
      }
      dx = (dx / SCALE | 0) + (TWINSIDE / 2 | 0);
      dy = (dy / SCALE | 0) + (TWINSIDE / 2 | 0);
      if (!sprite || G.pixFlags & NO_CLK_PIX) {
        if ((j.p_flags & PFCLOAK) >>> 0 && j.p_cloakphase === (12 * G.server_ups / 10 | 0) - 1) {
          if (G.me === j || G.playback) {
            W_WriteBitmap(dx - (cloak_width / 2 | 0), dy - (cloak_height / 2 | 0), G.cloakicon, G.myColor);
            clearzone[0][clearcount] = dx - ((shield_width / 2 | 0) + 1);
            clearzone[1][clearcount] = dy - ((shield_height / 2 | 0) + 1);
            clearzone[2][clearcount] = shield_width + 3;
            clearzone[3][clearcount] = shield_height + 3;
            ++clearcount;
            { $g = 1; continue $L; }
          }
          { $g = 3; continue $L; };
        }
      }
      if (!(j.p_status === PALIVE && !(G.me === j && (G.me.p_flags & PFOBSERV) >>> 0))) { $g = 6; continue $L; }
      switch (j.p_team) {
      case 1:
        if (G.use_tng_fed_bitmaps) {
          ship_bits = P(G.tng_fed_bitmaps);
        } else {
          ship_bits = P(G.fed_bitmaps);
        }
        break;
      case 2:
        ship_bits = P(G.rom_bitmaps);
        break;
      case 4:
        ship_bits = P(G.kli_bitmaps);
        break;
      case 8:
        ship_bits = P(G.ori_bitmaps);
        break;
      default:
        ship_bits = P(G.ind_bitmaps);
        break;
      }
      clearzone[0][clearcount] = dx - ((shield_width / 2 | 0) + 6);
      clearzone[1][clearcount] = dy - ((shield_height / 2 | 0) + 6);
      clearzone[2][clearcount] = shield_width + 12;
      clearzone[3][clearcount] = shield_height + 12;
      ++clearcount;
      if (!!sprite) {
        G.clearsize = W_DrawSprite(sprite, dx, dy, TWINSIDE);
        if (G.clearsize > shield_width + 12) {
          --clearcount;
          clearzone[0][clearcount] = dx - (G.clearsize / 2 | 0);
          clearzone[1][clearcount] = dy - (G.clearsize / 2 | 0);
          clearzone[2][clearcount] = G.clearsize;
          clearzone[3][clearcount] = G.clearsize;
          ++clearcount;
        }
      } else if (j.p_team === ROM && j.p_ship.s_type === CRUISER && G.ROMVLVS) {
        W_WriteBitmap(dx - (j.p_ship.s_width / 2 | 0), dy - (j.p_ship.s_height / 2 | 0), G.ROMVLVS_bitmap[((j.p_dir + 8) / 16 | 0) & 15], G.me === j || (G.me.p_flags & 134217728) >>> 0 && (G.me.p_flags & 16384) >>> 0 && G.me.p_playerl === j.p_no ? G.myColor : G.shipCol[G.remap[j.p_team]]);
      } else {
        W_WriteBitmap(dx - (j.p_ship.s_width / 2 | 0), dy - (j.p_ship.s_height / 2 | 0), ship_bits.a[ship_bits.o + j.p_ship.s_type][((j.p_dir + 8) / 16 | 0) & 15], G.me === j || (G.me.p_flags & 134217728) >>> 0 && (G.me.p_flags & 16384) >>> 0 && G.me.p_playerl === j.p_no ? G.myColor : G.shipCol[G.remap[j.p_team]]);
      }
      if (j.p_cloakphase > 0) {
        if (!sprite) {
          W_WriteBitmap(dx - (cloak_width / 2 | 0), dy - (cloak_height / 2 | 0), G.cloakicon, G.me === j || (G.me.p_flags & 134217728) >>> 0 && (G.me.p_flags & 16384) >>> 0 && G.me.p_playerl === j.p_no ? G.myColor : G.shipCol[G.remap[j.p_team]]);
        }
        if (!(G.me === j)) {
          { $g = 3; continue $L; };
        }
      }
    case 1: // shieldlabel
      if (G.UseLite && G.emph_player_seq_n[j.p_no] > 0 && G.liteflag & LITE_PLAYERS_LOCAL) {
        let seq_n = (G.emph_player_seq_n[j.p_no] * 5 / G.server_ups | 0) % emph_player_seql_frames;
        W_WriteBitmap(dx - (emph_player_seql_width / 2 | 0), dy - (emph_player_seql_height / 2 | 0), G.emph_player_seql[seq_n], G.W_White);
      }
      if ((G.me === j || (G.me.p_flags & 134217728) >>> 0 && (G.me.p_flags & 16384) >>> 0 && G.me.p_playerl === j.p_no) && G.vary_hull) {
        let hull_left = 100 * (G.me.p_ship.s_maxdamage - G.me.p_damage) / G.me.p_ship.s_maxdamage | 0;
        let hull_num = 7;
        let hull_color = 0;
        if (hull_left <= 16) {
          hull_num = 0;
          hull_color = G.W_Red;
        } else if (hull_left <= 28) {
          hull_num = 1;
          hull_color = G.W_Yellow;
        } else if (hull_left <= 40) {
          hull_num = 2;
          hull_color = G.W_Green;
        } else if (hull_left <= 52) {
          hull_num = 3;
          hull_color = G.W_Green;
        } else if (hull_left <= 64) {
          hull_num = 4;
          hull_color = G.W_Green;
        } else if (hull_left <= 76) {
          hull_num = 5;
          hull_color = G.W_White;
        } else if (hull_left <= 88) {
          hull_num = 6;
          hull_color = G.W_White;
        } else {
          hull_color = G.me === j || (G.me.p_flags & 134217728) >>> 0 && (G.me.p_flags & 16384) >>> 0 && G.me.p_playerl === j.p_no ? G.myColor : G.shipCol[G.remap[j.p_team]];
        }
        W_WriteBitmap(dx - ((shield_width / 2 | 0) + 1), dy - ((shield_height / 2 | 0) + 1), G.hull[hull_num], hull_color);
      }
      if (j.p_no === G.me.p_no) {
        if ((G.sound_flags & PFSHIELD) >>> 0 && !((j.p_flags & PFSHIELD) >>> 0)) {
          Play_Sound(SHIELD_DOWN_SOUND);
        } else if (!((G.sound_flags & PFSHIELD) >>> 0) && (j.p_flags & PFSHIELD) >>> 0) {
          Play_Sound(SHIELD_UP_SOUND);
        }
      }
      if ((j.p_flags & PFSHIELD) >>> 0) {
        let color = G.me === j || (G.me.p_flags & 134217728) >>> 0 && (G.me.p_flags & 16384) >>> 0 && G.me.p_playerl === j.p_no ? G.myColor : G.shipCol[G.remap[j.p_team]];
        let shieldnum = 0;
        if ((G.me === j || (G.me.p_flags & 134217728) >>> 0 && (G.me.p_flags & 16384) >>> 0 && G.me.p_playerl === j.p_no) && G.VShieldBitmaps) {
          let value = 0;
          shieldnum = Math.imul(SHIELD_FRAMES, G.me.p_shield) / G.me.p_ship.s_maxshield | 0;
          if (shieldnum >= SHIELD_FRAMES) {
            shieldnum = SHIELD_FRAMES - 1;
          }
          value = 100 * G.me.p_shield / G.me.p_ship.s_maxshield | 0;
          if (value < 34) {
            color = G.rColor;
          } else if (value < 67) {
            color = G.yColor;
          } else {
            color = G.gColor;
          }
        } else {
          color = G.me === j || (G.me.p_flags & 134217728) >>> 0 && (G.me.p_flags & 16384) >>> 0 && G.me.p_playerl === j.p_no ? G.myColor : G.shipCol[G.remap[j.p_team]];
          shieldnum = 2;
        }
        if (G.warnShields && (G.me === j || (G.me.p_flags & 134217728) >>> 0 && (G.me.p_flags & 16384) >>> 0 && G.me.p_playerl === j.p_no)) {
          switch ((G.me.p_flags & (PFGREEN | PFYELLOW | PFRED)) >>> 0) {
          case 2048:
            color = G.gColor;
            break;
          case 4096:
            color = G.yColor;
            break;
          case 8192:
            color = G.rColor;
            break;
          }
        }
        W_WriteBitmap(dx - (shield_width / 2 | 0), dy - (shield_height / 2 | 0), G.shield[shieldnum], color);
      }
      if (G.detCircle) {
        if (G.me === j) {
          let dcr = DETDIST * 2 / SCALE | 0;
          let dcx = dx - (dcr / 2 | 0);
          let dcy = dy - (dcr / 2 | 0);
          W_WriteCircle(G.w, dcy, dcy, dcr, G.W_Red);
          clearzone[0][clearcount] = dcx;
          clearzone[1][clearcount] = dcy;
          clearzone[2][clearcount] = dcr + dcr;
          clearzone[3][clearcount] = dcr + dcr;
          ++clearcount;
          --G.detCircle;
        }
      }
      if ((j.p_flags & PFCLOAK) >>> 0) {
        { $g = 3; continue $L; };
      }
      {
        let color = G.me === j || (G.me.p_flags & 134217728) >>> 0 && (G.me.p_flags & 16384) >>> 0 && G.me.p_playerl === j.p_no ? G.myColor : G.shipCol[G.remap[j.p_team]];
        idbuf[0] = $rd(G.shipnos.add(j.p_no));
        if (G.me === j || (G.me.p_flags & 134217728) >>> 0 && (G.me.p_flags & 16384) >>> 0 && G.me.p_playerl === j.p_no) {
          switch ((G.me.p_flags & (PFGREEN | PFYELLOW | PFRED)) >>> 0) {
          case 2048:
            color = G.gColor;
            break;
          case 4096:
            color = G.yColor;
            break;
          case 8192:
            color = G.rColor;
            break;
          }
        }
        W_MaskText(G.w, dx + (j.p_ship.s_width / 2 | 0), dy - (j.p_ship.s_height / 2 | 0), color, P(idbuf), 1, G.me === j ? G.W_HighlightFont : !(G.me.p_team & (j.p_swar | j.p_hostile)) && !(j.p_team & (G.me.p_swar | G.me.p_hostile)) ? G.W_HighlightFont : G.W_RegularFont);
        clearzone[0][clearcount] = dx + (j.p_ship.s_width / 2 | 0);
        clearzone[1][clearcount] = dy - (j.p_ship.s_height / 2 | 0);
        clearzone[2][clearcount] = G.W_Textwidth;
        clearzone[3][clearcount] = G.W_Textheight;
        ++clearcount;
      }
      { $g = 5; continue $L; }
    case 6:
      if (j.p_status === PEXPLODE) {
        let i = j.p_explode * 5 / G.server_ups | 0;
        if (j.p_explode === 1) {
          if (j === G.me) {
            if (j.p_ship.s_type === STARBASE) {
              Play_Sound(SBEXPLOSION_SOUND);
            } else {
              Play_Sound(EXPLOSION_SOUND);
            }
          } else if (j.p_ship.s_type === STARBASE) {
            Play_Sound(OTHER_SBEXPLOSION_SOUND);
          } else {
            Play_Sound(OTHER_EXPLOSION_SOUND);
          }
        }
        if (!!sprite) {
          G.clearsize = W_DrawSprite(sprite, dx, dy, TWINSIDE);
          clearzone[0][clearcount] = dx - (G.clearsize / 2 | 0);
          clearzone[1][clearcount] = dy - (G.clearsize / 2 | 0);
          clearzone[2][clearcount] = G.clearsize;
          clearzone[3][clearcount] = G.clearsize;
          ++clearcount;
        } else {
          if (i < EX_FRAMES || i < SBEXPVIEWS && j.p_ship.s_type === STARBASE) {
            if (j.p_ship.s_type === STARBASE) {
              W_WriteBitmap(dx - (sbexp_width / 2 | 0), dy - (sbexp_height / 2 | 0), G.sbexpview[i], G.me === j || (G.me.p_flags & 134217728) >>> 0 && (G.me.p_flags & 16384) >>> 0 && G.me.p_playerl === j.p_no ? G.myColor : G.shipCol[G.remap[j.p_team]]);
              clearzone[0][clearcount] = dx - (sbexp_width / 2 | 0);
              clearzone[1][clearcount] = dy - (sbexp_height / 2 | 0);
              clearzone[2][clearcount] = sbexp_width;
              clearzone[3][clearcount] = sbexp_height;
            } else {
              W_WriteBitmap(dx - (ex_width / 2 | 0), dy - (ex_height / 2 | 0), G.expview[i], G.me === j || (G.me.p_flags & 134217728) >>> 0 && (G.me.p_flags & 16384) >>> 0 && G.me.p_playerl === j.p_no ? G.myColor : G.shipCol[G.remap[j.p_team]]);
              clearzone[0][clearcount] = dx - (ex_width / 2 | 0);
              clearzone[1][clearcount] = dy - (ex_height / 2 | 0);
              clearzone[2][clearcount] = ex_width;
              clearzone[3][clearcount] = ex_height;
            }
            ++clearcount;
          }
          j.p_explode = j.p_explode + 1 << 16 >> 16;
        }
      }
    case 5:
      php = $sadd(G.phasers, j.p_no);
      if (php.ph_status !== PHFREE) {
        if (php.sound_phaser) {
          Play_Sound(j === G.me ? PHASER_SOUND : OTHER_PHASER_SOUND);
          php.sound_phaser = 0;
        }
        if ((php.ph_updateFuse = php.ph_updateFuse - G.weaponUpdate << 16 >> 16) === 0) {
          php.ph_status = PHFREE;
          php.sound_phaser = 0;
        } else {
          if (php.ph_status === PHMISS) {
            tx = Math.trunc((Math.imul(PHASEDIST, j.p_ship.s_phaserdamage) / 100 | 0) * G.Cos[php.ph_dir]) | 0;
            ty = Math.trunc((Math.imul(PHASEDIST, j.p_ship.s_phaserdamage) / 100 | 0) * G.Sin[php.ph_dir]) | 0;
            tx = ((j.p_x + tx - G.me.p_x) / SCALE | 0) + (TWINSIDE / 2 | 0);
            ty = ((j.p_y + ty - G.me.p_y) / SCALE | 0) + (TWINSIDE / 2 | 0);
            php.ph_fuse = 0;
          } else if (php.ph_status === PHHIT2) {
            tx = ((php.ph_x - G.me.p_x) / SCALE | 0) + (TWINSIDE / 2 | 0);
            ty = ((php.ph_y - G.me.p_y) / SCALE | 0) + (TWINSIDE / 2 | 0);
          } else {
            tx = (($sadd(G.players, php.ph_target).p_x - G.me.p_x) / SCALE | 0) + (TWINSIDE / 2 | 0);
            ty = (($sadd(G.players, php.ph_target).p_y - G.me.p_y) / SCALE | 0) + (TWINSIDE / 2 | 0);
          }
          if (G.shrinkPhaserOnMiss || php.ph_status !== PHMISS) {
            if (G.me === j || (G.me.p_flags & 134217728) >>> 0 && (G.me.p_flags & 16384) >>> 0 && G.me.p_playerl === j.p_no) {
              px = (Math.imul(dx, 16 - G.phaserShrink) + Math.imul(tx, G.phaserShrink) + 8) / 16 | 0;
              py = (Math.imul(dy, 16 - G.phaserShrink) + Math.imul(ty, G.phaserShrink) + 8) / 16 | 0;
            } else {
              px = (Math.imul(dx, 16 - G.theirPhaserShrink) + Math.imul(tx, G.theirPhaserShrink) + 8) / 16 | 0;
              py = (Math.imul(dy, 16 - G.theirPhaserShrink) + Math.imul(ty, G.theirPhaserShrink) + 8) / 16 | 0;
            }
          } else {
            px = dx;
            py = dy;
          }
          if (!(G.me.p_team & (j.p_swar | j.p_hostile)) && !(j.p_team & (G.me.p_swar | G.me.p_hostile))) {
            if (G.highlightFriendlyPhasers && php.ph_status === PHHIT) {
              W_CacheLine(G.w, px, py, tx, ty, G.foreColor);
            } else {
              if (php.ph_fuse % 2 === 1) {
                W_CacheLine(G.w, px, py, tx, ty, G.foreColor);
              } else {
                W_CacheLine(G.w, px, py, tx, ty, $sadd(G.phasers, G.me.p_no) === php || (G.me.p_flags & 134217728) >>> 0 && (G.me.p_flags & 16384) >>> 0 && G.me.p_playerl === $sadd(G.players, $sdiff(php, G.phasers)).p_no ? G.myColor : G.shipCol[G.remap[$sadd(G.players, $sdiff(php, G.phasers)).p_team]]);
              }
            }
            php.ph_fuse = php.ph_fuse + 1 << 16 >> 16;
            clearline[0][clearlcount] = px;
            clearline[1][clearlcount] = py;
            clearline[2][clearlcount] = tx;
            clearline[3][clearlcount] = ty;
            ++clearlcount;
          } else {
            if (G.enemyPhasers > 0 && G.enemyPhasers <= 10) {
              let dir = 0;
              if (tx === px && ty === py) {
                { $g = 3; continue $L; };
              }
              if (php.ph_status !== PHMISS) {
                dir = (Math.trunc(rint(atan2(ty - py, tx - px) / 3.1415926000000001 * 128)) | 0) & 0xff;
              } else {
                dir = (php.ph_dir + 64 + 256) % 256 & 0xff;
              }
              wx = Math.trunc(px + G.enemyPhasers * G.Cos[dir]) | 0;
              wy = Math.trunc(py + G.enemyPhasers * G.Sin[dir]) | 0;
              lx = Math.trunc(px - G.enemyPhasers * G.Cos[dir]) | 0;
              ly = Math.trunc(py - G.enemyPhasers * G.Sin[dir]) | 0;
              W_MakePhaserLine(G.w, wx, wy, tx, ty, G.shipCol[G.remap[j.p_team]]);
              W_MakePhaserLine(G.w, lx, ly, tx, ty, G.shipCol[G.remap[j.p_team]]);
              php.ph_fuse = php.ph_fuse + 1 << 16 >> 16;
              clearline[0][clearlcount] = wx;
              clearline[1][clearlcount] = wy;
              clearline[2][clearlcount] = tx;
              clearline[3][clearlcount] = ty;
              ++clearlcount;
              clearline[0][clearlcount] = lx;
              clearline[1][clearlcount] = ly;
              clearline[2][clearlcount] = tx;
              clearline[3][clearlcount] = ty;
              ++clearlcount;
            } else {
              W_MakePhaserLine(G.w, px, py, tx, ty, G.shipCol[G.remap[j.p_team]]);
              php.ph_fuse = php.ph_fuse + 1 << 16 >> 16;
              clearline[0][clearlcount] = px;
              clearline[1][clearlcount] = py;
              clearline[2][clearlcount] = tx;
              clearline[3][clearlcount] = ty;
              ++clearlcount;
            }
          }
        }
      }
      if (G.showTractorPressor) {
        if ((G.me === j || G.F_show_all_tractors) && (G.me.p_status === 2 || G.me.p_status === 5) && (j.p_status === 2 || j.p_status === 5) && ((j.p_flags & PFTRACT) >>> 0 || (j.p_flags & PFPRESS) >>> 0)) {
          let theta = 0;
          let dir = 0;
          let lx = new Int32Array(2);
          let ly = new Int32Array(2);
          let target_width = 0;
          let tractee = null;
          if (j.p_tractor < 0 || j.p_tractor >= MAXPLAYER) {
            { $g = 3; continue $L; };
          }
          if ((j.p_flags & PFOBSERV) >>> 0) {
            { $g = 3; continue $L; };
          }
          tractee = $sadd(G.players, j.p_tractor);
          if (tractee.p_status !== PALIVE || (tractee.p_flags & PFCLOAK) >>> 0 && tractee.p_cloakphase === (12 * G.server_ups / 10 | 0) - 1) {
            { $g = 3; continue $L; };
          }
          if (G.tcounter >= 2) {
            if (!G.continuetractor) {
              --G.tcounter;
            }
            px = ((tractee.p_x - G.me.p_x) / SCALE | 0) + (TWINSIDE / 2 | 0);
            py = ((tractee.p_y - G.me.p_y) / SCALE | 0) + (TWINSIDE / 2 | 0);
            if (px === dx && py === dy) {
              { $g = 3; continue $L; };
            }
            theta = atan2(px - dx, dy - py) + 3.1415926000000001 / 2;
            dir = (Math.trunc(rint(theta / 3.1415926000000001 * 128)) | 0) & 0xff;
            if ((tractee.p_flags & PFSHIELD) >>> 0) {
              target_width = shield_width;
            } else {
              target_width = tractee.p_ship.s_width / 2 | 0;
            }
            lx[0] = Math.trunc(px + G.Cos[dir] * (target_width / 2 | 0)) | 0;
            ly[0] = Math.trunc(py + G.Sin[dir] * (target_width / 2 | 0)) | 0;
            lx[1] = Math.trunc(px - G.Cos[dir] * (target_width / 2 | 0)) | 0;
            ly[1] = Math.trunc(py - G.Sin[dir] * (target_width / 2 | 0)) | 0;
            if ((j.p_flags & PFPRESS) >>> 0) {
              W_MakeTractLine(G.w, dx, dy, lx[0], ly[0], G.W_Yellow);
              W_MakeTractLine(G.w, dx, dy, lx[1], ly[1], G.W_Yellow);
            } else {
              W_MakeTractLine(G.w, dx, dy, lx[0], ly[0], G.W_Green);
              W_MakeTractLine(G.w, dx, dy, lx[1], ly[1], G.W_Green);
            }
            clearline[0][clearlcount] = dx;
            clearline[1][clearlcount] = dy;
            clearline[2][clearlcount] = lx[0];
            clearline[3][clearlcount] = ly[0];
            ++clearlcount;
            clearline[0][clearlcount] = dx;
            clearline[1][clearlcount] = dy;
            clearline[2][clearlcount] = lx[1];
            clearline[3][clearlcount] = ly[1];
            ++clearlcount;
          }
        } else if (!((G.me.p_flags & PFPRESS) >>> 0 || (G.me.p_flags & PFTRACT) >>> 0)) {
          G.tcounter = 2;
        }
      }
    case 3:
      j = $sadd(j, -1);
      { $g = 2; continue $L; }
    case 4:
      return;
    }
    break;
  }
}

function DrawTorps(): void {
  let k = null;
  let t = null;
  let dx = 0;
  let dy = 0;
  let numdetframes = 0;
  let frame = 0;
  let tno = 0;
  let tsub = 0;
  let sprite = null;
  let j = null;
  let torpCount = 0;
  let view = Math.imul(SCALE, TWINSIDE) / 2 | 0;
  for (t = G.torps, j = G.players, tno = 0; j !== $sadd(G.players, MAXPLAYER); t = $sadd(t, MAXTORP), j = $sadd(j, 1), tno += MAXTORP) {
    if (j !== G.me) {
      num_other_torps += j.p_ntorp;
    }
    torpCount = j.p_ntorp;
    for (tsub = 0, k = t; torpCount > 0; k = $sadd(k, 1), ++tsub) {
      if (!k.t_status) {
        continue;
      }
      --torpCount;
      if ((k.t_updateFuse = k.t_updateFuse - G.weaponUpdate & 0xff) === 0) {
        if (k.t_status !== TEXPLODE) {
          k.t_status = TFREE;
          j.p_ntorp = j.p_ntorp - 1 << 16 >> 16;
          continue;
        }
        k.t_updateFuse = 100;
      }
      dx = k.t_x - G.me.p_x;
      dy = k.t_y - G.me.p_y;
      if (dx > view || dx < -view || dy > view || dy < -view) {
        if (k.t_status === TEXPLODE && j !== G.me) {
          k.t_status = TFREE;
          j.p_ntorp = j.p_ntorp - 1 << 16 >> 16;
        }
        continue;
      }
      dx = (dx / SCALE | 0) + (TWINSIDE / 2 | 0);
      dy = (dy / SCALE | 0) + (TWINSIDE / 2 | 0);
      if (!!(sprite = S_Torp(tno + tsub))) {
        G.clearsize = W_DrawSprite(sprite, dx, dy, TWINSIDE);
        clearzone[0][clearcount] = dx - (G.clearsize / 2 | 0);
        clearzone[1][clearcount] = dy - (G.clearsize / 2 | 0);
        clearzone[2][clearcount] = G.clearsize;
        clearzone[3][clearcount] = G.clearsize;
        ++clearcount;
      } else if (k.t_status === TEXPLODE) {
        k.t_fuse = k.t_fuse - 1 << 16 >> 16;
        numdetframes = Math.imul(NUMDETFRAMES, G.server_ups) / 5 | 0;
        frame = k.t_fuse * 5 / G.server_ups | 0;
        if (frame > NUMDETFRAMES - 1) {
          frame = NUMDETFRAMES - 1;
        }
        if (k.t_fuse <= 0) {
          k.t_status = TFREE;
          j.p_ntorp = j.p_ntorp - 1 << 16 >> 16;
          continue;
        }
        if (k.t_fuse >= numdetframes) {
          k.t_fuse = numdetframes - 1 << 16 >> 16;
        }
        if (k.t_fuse === numdetframes - 1) {
          Play_Sound(TORP_HIT_SOUND);
        }
        W_WriteBitmap(dx - (cloud_width / 2 | 0), dy - (cloud_height / 2 | 0), G.cloud[frame], G.me.p_no === k.t_owner || (G.me.p_flags & 134217728) >>> 0 && (G.me.p_flags & 16384) >>> 0 && G.me.p_playerl === $sadd(G.players, k.t_owner).p_no ? G.myColor : G.shipCol[G.remap[$sadd(G.players, k.t_owner).p_team]]);
        clearzone[0][clearcount] = dx - (cloud_width / 2 | 0);
        clearzone[1][clearcount] = dy - (cloud_height / 2 | 0);
        clearzone[2][clearcount] = cloud_width;
        clearzone[3][clearcount] = cloud_height;
        ++clearcount;
      } else if (j !== G.me && (k.t_war & G.me.p_team || j.p_team & (G.me.p_hostile | G.me.p_swar))) {
        W_CacheLine(G.w, dx - (etorp_width / 2 | 0), dy - (etorp_height / 2 | 0), dx + (etorp_width / 2 | 0), dy + (etorp_height / 2 | 0), G.me.p_no === k.t_owner || (G.me.p_flags & 134217728) >>> 0 && (G.me.p_flags & 16384) >>> 0 && G.me.p_playerl === $sadd(G.players, k.t_owner).p_no ? G.myColor : G.shipCol[G.remap[$sadd(G.players, k.t_owner).p_team]]);
        W_CacheLine(G.w, dx + (etorp_width / 2 | 0), dy - (etorp_height / 2 | 0), dx - (etorp_width / 2 | 0), dy + (etorp_height / 2 | 0), G.me.p_no === k.t_owner || (G.me.p_flags & 134217728) >>> 0 && (G.me.p_flags & 16384) >>> 0 && G.me.p_playerl === $sadd(G.players, k.t_owner).p_no ? G.myColor : G.shipCol[G.remap[$sadd(G.players, k.t_owner).p_team]]);
        clearzone[0][clearcount] = dx - (etorp_width / 2 | 0);
        clearzone[1][clearcount] = dy - (etorp_height / 2 | 0);
        clearzone[2][clearcount] = etorp_width;
        clearzone[3][clearcount] = etorp_height;
        ++clearcount;
      } else {
        W_CacheLine(G.w, dx - (mtorp_width / 2 | 0), dy, dx + (mtorp_width / 2 | 0), dy, G.me.p_no === k.t_owner || (G.me.p_flags & 134217728) >>> 0 && (G.me.p_flags & 16384) >>> 0 && G.me.p_playerl === $sadd(G.players, k.t_owner).p_no ? G.myColor : G.shipCol[G.remap[$sadd(G.players, k.t_owner).p_team]]);
        W_CacheLine(G.w, dx, dy - (mtorp_width / 2 | 0), dx, dy + (mtorp_width / 2 | 0), G.me.p_no === k.t_owner || (G.me.p_flags & 134217728) >>> 0 && (G.me.p_flags & 16384) >>> 0 && G.me.p_playerl === $sadd(G.players, k.t_owner).p_no ? G.myColor : G.shipCol[G.remap[$sadd(G.players, k.t_owner).p_team]]);
        clearzone[0][clearcount] = dx - (mtorp_width / 2 | 0);
        clearzone[1][clearcount] = dy - (mtorp_height / 2 | 0);
        clearzone[2][clearcount] = mtorp_width;
        clearzone[3][clearcount] = mtorp_height;
        ++clearcount;
      }
    }
  }
  return;
}

export function DrawPlasmaTorps(): void {
  let $t1: any, $t2: any;
  let pt = null;
  let dx = 0;
  let dy = 0;
  let numdetframes = 0;
  let frame = 0;
  let ptno = 0;
  let sprite = null;
  let view = Math.imul(SCALE, TWINSIDE) / 2 | 0;
  for (pt = $sadd($sadd(G.plasmatorps, Math.imul(MAXPLASMA, MAXPLAYER)), -1), ptno = Math.imul(MAXPLASMA, MAXPLAYER) - 1; $sidx(pt) >= $sidx(G.plasmatorps); pt = $sadd(pt, -1), --ptno) {
    if (!pt.pt_status) {
      continue;
    }
    if (pt.pt_owner !== G.me.p_no) {
      ++num_other_plasma;
    }
    if ((pt.pt_updateFuse = pt.pt_updateFuse - G.weaponUpdate << 16 >> 16) === 0) {
      if (pt.pt_status !== PTEXPLODE) {
        pt.pt_status = PTFREE;
        ($t1 = $sadd(G.players, pt.pt_owner), $t1.p_nplasmatorp = $t1.p_nplasmatorp - 1 << 16 >> 16);
        continue;
      }
      pt.pt_updateFuse = 100;
    }
    dx = pt.pt_x - G.me.p_x;
    dy = pt.pt_y - G.me.p_y;
    if (dx > view || dx < -view || dy > view || dy < -view) {
      continue;
    }
    dx = (dx / SCALE | 0) + (TWINSIDE / 2 | 0);
    dy = (dy / SCALE | 0) + (TWINSIDE / 2 | 0);
    if (!!(sprite = S_Plasma(ptno))) {
      G.clearsize = W_DrawSprite(sprite, dx, dy, TWINSIDE);
      clearzone[0][clearcount] = dx - (G.clearsize / 2 | 0);
      clearzone[1][clearcount] = dy - (G.clearsize / 2 | 0);
      clearzone[2][clearcount] = G.clearsize;
      clearzone[3][clearcount] = G.clearsize;
      ++clearcount;
    } else if (pt.pt_status === PTEXPLODE) {
      pt.pt_fuse = pt.pt_fuse - 1 << 16 >> 16;
      numdetframes = Math.imul(NUMDETFRAMES, G.server_ups) / 5 | 0;
      frame = pt.pt_fuse * 5 / G.server_ups | 0;
      if (frame > NUMDETFRAMES - 1) {
        frame = NUMDETFRAMES - 1;
      }
      if (pt.pt_fuse <= 0) {
        pt.pt_status = PTFREE;
        ($t2 = $sadd(G.players, pt.pt_owner), $t2.p_nplasmatorp = $t2.p_nplasmatorp - 1 << 16 >> 16);
        continue;
      }
      if (pt.pt_fuse >= numdetframes) {
        pt.pt_fuse = numdetframes - 1 << 16 >> 16;
      }
      if (pt.pt_fuse === numdetframes - 1) {
        Play_Sound(PLASMA_HIT_SOUND);
      }
      W_WriteBitmap(dx - (plasmacloud_width / 2 | 0), dy - (plasmacloud_height / 2 | 0), G.plasmacloud[frame], G.me.p_no === pt.pt_owner || (G.me.p_flags & 134217728) >>> 0 && (G.me.p_flags & 16384) >>> 0 && G.me.p_playerl === $sadd(G.players, pt.pt_owner).p_no ? G.myColor : G.shipCol[G.remap[$sadd(G.players, pt.pt_owner).p_team]]);
      clearzone[0][clearcount] = dx - (plasmacloud_width / 2 | 0);
      clearzone[1][clearcount] = dy - (plasmacloud_height / 2 | 0);
      clearzone[2][clearcount] = plasmacloud_width;
      clearzone[3][clearcount] = plasmacloud_height;
      ++clearcount;
    } else if (pt.pt_owner !== G.me.p_no && (pt.pt_war & G.me.p_team || $sadd(G.players, pt.pt_owner).p_team & (G.me.p_hostile | G.me.p_swar))) {
      W_WriteBitmap(dx - (eplasmatorp_width / 2 | 0), dy - (eplasmatorp_height / 2 | 0), G.eplasmatorp, G.me.p_no === pt.pt_owner || (G.me.p_flags & 134217728) >>> 0 && (G.me.p_flags & 16384) >>> 0 && G.me.p_playerl === $sadd(G.players, pt.pt_owner).p_no ? G.myColor : G.shipCol[G.remap[$sadd(G.players, pt.pt_owner).p_team]]);
      clearzone[0][clearcount] = dx - (eplasmatorp_width / 2 | 0);
      clearzone[1][clearcount] = dy - (eplasmatorp_height / 2 | 0);
      clearzone[2][clearcount] = eplasmatorp_width;
      clearzone[3][clearcount] = eplasmatorp_height;
      ++clearcount;
    } else {
      W_WriteBitmap(dx - (mplasmatorp_width / 2 | 0), dy - (mplasmatorp_height / 2 | 0), G.mplasmatorp, G.me.p_no === pt.pt_owner || (G.me.p_flags & 134217728) >>> 0 && (G.me.p_flags & 16384) >>> 0 && G.me.p_playerl === $sadd(G.players, pt.pt_owner).p_no ? G.myColor : G.shipCol[G.remap[$sadd(G.players, pt.pt_owner).p_team]]);
      clearzone[0][clearcount] = dx - (mplasmatorp_width / 2 | 0);
      clearzone[1][clearcount] = dy - (mplasmatorp_height / 2 | 0);
      clearzone[2][clearcount] = mplasmatorp_width;
      clearzone[3][clearcount] = mplasmatorp_height;
      ++clearcount;
    }
  }
  return;
}

function DrawMisc(): void {
  let j = null;
  let dx = 0;
  let dy = 0;
  let view = Math.imul(SCALE, TWINSIDE) / 2 | 0;
  let sl = null;
  let HALF_WINSIDE = TWINSIDE / 2 | 0;
  let ex = 0;
  let ey = 0;
  let sx = 0;
  let sy = 0;
  if (G.hockey_s_lines && 1) {
    for (sl = $sadd($sadd(G.s_lines[0], NUM_HOCKEY_LINES), -1); $sidx(sl) >= $sidx(G.s_lines[0]); sl = $sadd(sl, -1)) {
      if (sl.orientation === S_LINE_VERTICAL) {
        if ((sx = (sl.begin_x - G.me.p_x) / SCALE | 0) < HALF_WINSIDE && sx > -HALF_WINSIDE) {
          sx += HALF_WINSIDE;
          ex = sx;
          if ((sy = HALF_WINSIDE - ((G.me.p_y - sl.begin_y) / SCALE | 0)) < 0) {
            sy = 0;
          }
          if (sy > TWINSIDE - 1) {
            sy = TWINSIDE - 1;
          }
          if ((ey = HALF_WINSIDE - ((G.me.p_y - sl.end_y) / SCALE | 0)) < 0) {
            ey = 0;
          }
          if (ey > TWINSIDE - 1) {
            ey = TWINSIDE - 1;
          }
          if (sy === ey) {
            continue;
          }
        } else {
          continue;
        }
      } else if (sl.orientation === S_LINE_HORIZONTAL) {
        if ((sy = (sl.begin_y - G.me.p_y) / SCALE | 0) < HALF_WINSIDE && sy > -HALF_WINSIDE) {
          sy += HALF_WINSIDE;
          ey = sy;
          if ((sx = HALF_WINSIDE - ((G.me.p_x - sl.begin_x) / SCALE | 0)) < 0) {
            sx = 0;
          }
          if (sx > TWINSIDE - 1) {
            sx = TWINSIDE - 1;
          }
          if ((ex = HALF_WINSIDE - ((G.me.p_x - sl.end_x) / SCALE | 0)) < 0) {
            ex = 0;
          }
          if (ex > TWINSIDE - 1) {
            ex = TWINSIDE - 1;
          }
          if (sx === ex) {
            continue;
          }
        } else {
          continue;
        }
      } else {
        continue;
      }
      W_CacheLine(G.w, sx, sy, ex, ey, sl.color);
      clearline[0][clearlcount] = sx;
      clearline[1][clearlcount] = sy;
      clearline[2][clearlcount] = ex;
      clearline[3][clearlcount] = ey;
      ++clearlcount;
    }
  }
  if (G.me.p_x < Math.imul(TWINSIDE / 2 | 0, SCALE)) {
    dx = (TWINSIDE / 2 | 0) - (G.me.p_x / SCALE | 0);
    sy = (TWINSIDE / 2 | 0) + ((0 - G.me.p_y) / SCALE | 0);
    ey = (TWINSIDE / 2 | 0) + ((GWIDTH - G.me.p_y) / SCALE | 0);
    if (sy < 0) {
      sy = 0;
    }
    if (ey > TWINSIDE - 1) {
      ey = TWINSIDE - 1;
    }
    W_CacheLine(G.w, dx, sy, dx, ey, G.warningColor);
    clearline[0][clearlcount] = dx;
    clearline[1][clearlcount] = sy;
    clearline[2][clearlcount] = dx;
    clearline[3][clearlcount] = ey;
    ++clearlcount;
  }
  if (GWIDTH - G.me.p_x < Math.imul(TWINSIDE / 2 | 0, SCALE)) {
    dx = (TWINSIDE / 2 | 0) + ((GWIDTH - G.me.p_x) / SCALE | 0);
    sy = (TWINSIDE / 2 | 0) + ((0 - G.me.p_y) / SCALE | 0);
    ey = (TWINSIDE / 2 | 0) + ((GWIDTH - G.me.p_y) / SCALE | 0);
    if (sy < 0) {
      sy = 0;
    }
    if (ey > TWINSIDE - 1) {
      ey = TWINSIDE - 1;
    }
    W_CacheLine(G.w, dx, sy, dx, ey, G.warningColor);
    clearline[0][clearlcount] = dx;
    clearline[1][clearlcount] = sy;
    clearline[2][clearlcount] = dx;
    clearline[3][clearlcount] = ey;
    ++clearlcount;
  }
  if (G.me.p_y < Math.imul(TWINSIDE / 2 | 0, SCALE)) {
    dy = (TWINSIDE / 2 | 0) - (G.me.p_y / SCALE | 0);
    sx = (TWINSIDE / 2 | 0) + ((0 - G.me.p_x) / SCALE | 0);
    ex = (TWINSIDE / 2 | 0) + ((GWIDTH - G.me.p_x) / SCALE | 0);
    if (sx < 0) {
      sx = 0;
    }
    if (ex > TWINSIDE - 1) {
      ex = TWINSIDE - 1;
    }
    W_CacheLine(G.w, sx, dy, ex, dy, G.warningColor);
    clearline[0][clearlcount] = sx;
    clearline[1][clearlcount] = dy;
    clearline[2][clearlcount] = ex;
    clearline[3][clearlcount] = dy;
    ++clearlcount;
  }
  if (GWIDTH - G.me.p_y < Math.imul(TWINSIDE / 2 | 0, SCALE)) {
    dy = (TWINSIDE / 2 | 0) + ((GWIDTH - G.me.p_y) / SCALE | 0);
    sx = (TWINSIDE / 2 | 0) + ((0 - G.me.p_x) / SCALE | 0);
    ex = (TWINSIDE / 2 | 0) + ((GWIDTH - G.me.p_x) / SCALE | 0);
    if (sx < 0) {
      sx = 0;
    }
    if (ex > TWINSIDE - 1) {
      ex = TWINSIDE - 1;
    }
    W_CacheLine(G.w, sx, dy, ex, dy, G.warningColor);
    clearline[0][clearlcount] = sx;
    clearline[1][clearlcount] = dy;
    clearline[2][clearlcount] = ex;
    clearline[3][clearlcount] = dy;
    ++clearlcount;
  }
  if (G.oldalert >>> 0 !== (G.me.p_flags & (PFGREEN | PFYELLOW | PFRED)) >>> 0) {
    G.oldalert = (G.me.p_flags & (PFGREEN | PFYELLOW | PFRED)) >>> 0 | 0;
    switch (G.oldalert) {
    case 2048:
      if (G.extraBorder) {
        W_ChangeBorder(G.w, G.gColor);
      }
      W_ChangeBorder(G.baseWin, G.gColor);
      W_ChangeBorder(G.iconWin, G.gColor);
      Abort_Sound(REDALERT_SOUND);
      break;
    case 4096:
      if (G.extraBorder) {
        W_ChangeBorder(G.w, G.yColor);
      }
      W_ChangeBorder(G.baseWin, G.yColor);
      W_ChangeBorder(G.iconWin, G.yColor);
      Abort_Sound(REDALERT_SOUND);
      break;
    case 8192:
      if (G.extraBorder) {
        W_ChangeBorder(G.w, G.rColor);
      }
      W_ChangeBorder(G.baseWin, G.rColor);
      W_ChangeBorder(G.iconWin, G.rColor);
      Play_Sound(REDALERT_SOUND);
      break;
    }
  }
  if (sound_torps < G.me.p_ntorp) {
    Play_Sound(FIRE_TORP_SOUND);
  }
  if (sound_other_torps < num_other_torps) {
    Play_Sound(OTHER_FIRE_TORP_SOUND);
  }
  if (sound_plasma < G.me.p_nplasmatorp) {
    Play_Sound(FIRE_PLASMA_SOUND);
  }
  if (sound_other_plasma < num_other_plasma) {
    Play_Sound(OTHER_FIRE_PLASMA_SOUND);
  }
  G.sound_flags = G.me.p_flags;
  sound_torps = G.me.p_ntorp;
  sound_other_torps = num_other_torps;
  num_other_torps = 0;
  sound_plasma = G.me.p_nplasmatorp;
  sound_other_plasma = num_other_plasma;
  num_other_plasma = 0;
  if (G.showLock & 2 && !((G.me.p_flags & PFOBSERV) >>> 0)) {
    let tri_x = -1;
    let tri_y = -1;
    let facing = 0;
    let tri_size = 4;
    if ((G.me.p_flags & PFPLOCK) >>> 0) {
      j = $sadd(G.players, G.me.p_playerl);
      if (!((j.p_flags & PFCLOAK) >>> 0)) {
        dx = j.p_x - G.me.p_x;
        dy = j.p_y - G.me.p_y;
        if ((dx < 0 ? -dx : dx) < view && (dy < 0 ? -dy : dy) < view) {
          dx = (dx / SCALE | 0) + (TWINSIDE / 2 | 0);
          dy = (dy / SCALE | 0) + (TWINSIDE / 2 | 0);
          tri_x = dx + 0;
          tri_y = dy + 20;
          facing = 1;
        }
      }
    } else if ((G.me.p_flags & PFPLLOCK) >>> 0) {
      let l = $sadd(G.planets, G.me.p_planet);
      dx = l.pl_x - G.me.p_x;
      dy = l.pl_y - G.me.p_y;
      if ((dx < 0 ? -dx : dx) < view && (dy < 0 ? -dy : dy) < view) {
        dx = (dx / SCALE | 0) + (TWINSIDE / 2 | 0);
        dy = (dy / SCALE | 0) + (TWINSIDE / 2 | 0);
        tri_x = dx;
        tri_y = dy - 20;
        facing = 0;
      }
    }
    if (tri_x !== -1) {
      W_WriteTriangle(G.w, tri_x, tri_y, 4, facing, G.foreColor);
      clearzone[0][clearcount] = tri_x - tri_size - 1;
      clearzone[1][clearcount] = tri_y - 1 + (facing ? 0 : -tri_size);
      clearzone[2][clearcount] = tri_size * 2 + 2;
      clearzone[3][clearcount] = tri_size + 2;
      ++clearcount;
    }
  }
}

export function local(): void {
  if (G.me.p_x < 0) {
    return;
  }
  DrawPlanets();
  DrawShips();
  DrawTorps();
  DrawPlasmaTorps();
  G.weaponUpdate = 0;
  DrawMisc();
}

export function clearLocal(): void {
  if (G.W_FastClear) {
    W_ClearWindow(G.w);
    clearcount = 0;
    clearlcount = 0;
  } else {
    while (clearcount) {
      --clearcount;
      W_CacheClearArea(G.w, clearzone[0][clearcount], clearzone[1][clearcount], clearzone[2][clearcount], clearzone[3][clearcount]);
    }
    while (clearlcount) {
      --clearlcount;
      W_CacheLine(G.w, clearline[0][clearlcount], clearline[1][clearlcount], clearline[2][clearlcount], clearline[3][clearlcount], G.backColor);
    }
    W_FlushClearAreaCache(G.w);
    W_FlushLineCaches(G.w);
  }
}

export function $init(): void {
  clearcount = 0;
  clearzone = $arr(4, () => new Int32Array(436));
  clearlcount = 0;
  clearline = $arr(4, () => new Int32Array(121));
  sound_torps = 0;
  sound_other_torps = 0;
  num_other_torps = 0;
  sound_plasma = 0;
  sound_other_plasma = 0;
  num_other_plasma = 0;
  G.sound_flags = PFSHIELD;
  G.clearsize = 0;
}
