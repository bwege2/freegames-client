// x11/painthud.c: meters, the HUD (speed and direction pointers, HUD radar, frame, items, fuel,
// lock, score messages, time left, modifiers, fuel gauge), score objects on the map, the message
// lines, the recording marker and the FPS/lag values.
import { G } from './G.ts';
import {
  BLOCK_SZ, BLUE, RED, WHITE, ITEM_SIZE, ITEM_HUD, ITEM_FUEL, ITEM_TANK, NUM_ITEMS, MAX_SCORE_OBJECTS, LIMITED_LIVES, TEAM_PLAY,
  MIN_HUD_SIZE, HUD_OFFSET, FUEL_GAUGE_OFFSET, HUD_FUEL_GAUGE_SIZE, WARNING_DISTANCE, MSG_FLASH_TIME, MSG_LIFE_TIME,
  SELF_DESTRUCT_DELAY, MAX_PLAYER_POWER, MAX_PLAYER_TURNSPEED, RadarEnemy, BmsBall, BmsSafe, BmsCover, BmsPop, SEL_PENDING,
  SEL_EMPHASIZED, DRAW_EMPHASIZED, SHIP_SZ, MSG_LEN,
} from './consts.ts';
import { BIT, MAX, MIN, onReset, sprintf, strchrc, toInt } from './cutil.ts';
import * as X from '../xlib/xlib.ts';
import { rd, Record_size } from './record.ts';
import { SET_FG, Arc_add, Rectangle_add, Segment_add } from './paintdata.ts';
import { WINSCALE, UWINSCALE, X as XX, Y as YY } from './paint.ts';
import { Other_by_id } from './client.ts';
import { Check_name_string, Gui_paint_item_symbol, Life_color } from './guiobjects.ts';
import { tcos, tsin } from './xpmath.ts';
import { COLOR_INDEX_OPTION, STORE_OPTIONS, ref } from './option.ts';
import { Bms_test_state } from './messages.ts';

const HOdefaults = {
  hudHLineColor: 0, hudVLineColor: 0, hudItemsColor: 0, hudRadarEnemyColor: 0, hudRadarOtherColor: 0, hudLockColor: 0,
  fuelGaugeColor: 0, dirPtrColor: 0, messagesColor: 0, oldMessagesColor: 0, msgScanBallColor: 0, msgScanSafeColor: 0,
  msgScanCoverColor: 0, msgScanPopColor: 0, fuelMeterColor: 0, powerMeterColor: 0, turnSpeedMeterColor: 0,
  packetSizeMeterColor: 0, packetLossMeterColor: 0, packetDropMeterColor: 0, packetLagMeterColor: 0, temporaryMeterColor: 0,
  meterBorderColor: 0, scoreObjectColor: 0,
};
type HOKey = keyof typeof HOdefaults;
const HO = { ...HOdefaults };
const ST = { mapdiag: 0, vertSpacing: -1, have_hudmsg: false, hudmsg: '' };
onReset(() => {
  Object.assign(HO, HOdefaults);
  Object.assign(ST, { mapdiag: 0, vertSpacing: -1, have_hudmsg: false, hudmsg: '' });
});

const meterWidth = 60;
const meterHeight = 10;

function Paint_meter(xoff: number, y: number, title: string, val: number, max: number, meter_color: number): void {
  const mw1_4 = Math.trunc(meterWidth / 4), mw2_4 = Math.trunc(meterWidth / 2), mw3_4 = Math.trunc((3 * meterWidth) / 4), mw4_4 = meterWidth;
  const BORDER = 5;
  let x, xstr;
  if (xoff >= 0) {
    x = xoff;
    xstr = WINSCALE(x + meterWidth) + BORDER;
  } else {
    x = G.ext_view_width - (meterWidth - xoff);
    xstr = WINSCALE(x) - (BORDER + X.XTextWidth(G.gameFont, title, title.length));
  }
  Rectangle_add(meter_color, x + 2, y + 2, Math.trunc(((meterWidth - 3) * val) / (max ? max : 1)), meterHeight - 3);
  if (HO.meterBorderColor) {
    const color = HO.meterBorderColor;
    SET_FG(G.colors[color].pixel);
    rd.drawRectangle(G.dpy, G.drawPixmap, G.gameGC, WINSCALE(x), WINSCALE(y), UWINSCALE(meterWidth), UWINSCALE(meterHeight));
    Segment_add(color, x, y - 4, x, y + meterHeight + 4);
    Segment_add(color, x + mw4_4, y - 4, x + mw4_4, y + meterHeight + 4);
    Segment_add(color, x + mw2_4, y - 3, x + mw2_4, y + meterHeight + 3);
    Segment_add(color, x + mw1_4, y - 1, x + mw1_4, y + meterHeight + 1);
    Segment_add(color, x + mw3_4, y - 1, x + mw3_4, y + meterHeight + 1);
  }
  if (!HO.meterBorderColor) SET_FG(G.colors[meter_color].pixel);
  rd.drawString(G.dpy, G.drawPixmap, G.gameGC, xstr, WINSCALE(y) + Math.trunc((G.gameFont.ascent + meterHeight) / 2), title, title.length);
}

function wrap(p: { x: number; y: number }): boolean {
  const w = G.world, rw = G.realWorld;
  if (p.x < w.x || p.x > w.x + G.ext_view_width) {
    if (p.x < rw.x || p.x > rw.x + G.ext_view_width) return false;
    p.x += w.x - rw.x;
  }
  if (p.y < w.y || p.y > w.y + G.ext_view_height) {
    if (p.y < rw.y || p.y > rw.y + G.ext_view_height) return false;
    p.y += w.y - rw.y;
  }
  return true;
}

export function Paint_score_objects(): void {
  if (!HO.scoreObjectColor) return;
  for (let i = 0; i < MAX_SCORE_OBJECTS; i++) {
    const sobj = G.score_objects[i];
    if (sobj.life_time > 0) {
      if (G.loopsSlow % 3) {
        const p = { x: sobj.x * BLOCK_SZ + Math.trunc(BLOCK_SZ / 2), y: sobj.y * BLOCK_SZ + Math.trunc(BLOCK_SZ / 2) };
        if (wrap(p)) {
          if (sobj.msg_width === -1) sobj.msg_width = X.XTextWidth(G.gameFont, sobj.msg, sobj.msg_len);
          SET_FG(G.colors[HO.scoreObjectColor].pixel);
          const x = WINSCALE(XX(p.x)) - Math.trunc(sobj.msg_width / 2);
          const y = WINSCALE(YY(p.y)) + Math.trunc(G.gameFont.ascent / 2);
          rd.drawString(G.dpy, G.drawPixmap, G.gameGC, x, y, sobj.msg, sobj.msg_len);
        }
      }
      sobj.life_time -= G.timePerFrame;
      if (sobj.life_time <= 0.0) {
        sobj.life_time = 0.0;
        sobj.hud_msg_len = 0;
      }
    }
  }
}

export function Paint_meters(): void {
  let y = 20, color;
  const FPS = G.Setup!.frames_per_second;
  if (HO.fuelMeterColor) Paint_meter(-10, (y += 20), 'Fuel', toInt(G.fuelSum), toInt(G.fuelMax), HO.fuelMeterColor);
  if (HO.powerMeterColor) color = HO.powerMeterColor;
  else if (G.controlTime > 0.0) color = HO.temporaryMeterColor;
  else color = 0;
  if (color) Paint_meter(-10, (y += 20), 'Power', toInt(G.displayedPower), toInt(MAX_PLAYER_POWER), color);
  if (HO.turnSpeedMeterColor) color = HO.turnSpeedMeterColor;
  else if (G.controlTime > 0.0) color = HO.temporaryMeterColor;
  else color = 0;
  if (color) Paint_meter(-10, (y += 20), 'Turnspeed', toInt(G.displayedTurnspeed), toInt(MAX_PLAYER_TURNSPEED), color);
  if (G.controlTime > 0.0) {
    G.controlTime -= G.timePerFrame;
    if (G.controlTime <= 0.0) G.controlTime = 0.0;
  }
  if (HO.packetSizeMeterColor) Paint_meter(-10, (y += 20), 'Packet', G.packet_size >= 4096 ? 4096 : G.packet_size, 4096, HO.packetSizeMeterColor);
  if (HO.packetLossMeterColor) Paint_meter(-10, (y += 20), 'Loss', G.packet_loss, FPS, HO.packetLossMeterColor);
  if (HO.packetDropMeterColor) Paint_meter(-10, (y += 20), 'Drop', G.packet_drop, FPS, HO.packetDropMeterColor);
  if (HO.packetLagMeterColor) Paint_meter(-10, (y += 20), 'Lag', MIN(G.packet_lag, 1 * FPS), 1 * FPS, HO.packetLagMeterColor);
  if (HO.temporaryMeterColor) {
    const mx = Math.trunc((G.ext_view_width - 300) / 2) - 32;
    const my = Math.trunc((2 * G.ext_view_height) / 3);
    if (G.thrusttime >= 0 && G.thrusttimemax > 0) {
      Paint_meter(mx, my, 'Thrust Left', G.thrusttime >= G.thrusttimemax ? G.thrusttimemax : G.thrusttime, G.thrusttimemax, HO.temporaryMeterColor);
    }
    if (G.shieldtime >= 0 && G.shieldtimemax > 0) {
      Paint_meter(mx, my + 20, 'Shields Left', G.shieldtime >= G.shieldtimemax ? G.shieldtimemax : G.shieldtime, G.shieldtimemax, HO.temporaryMeterColor);
    }
    if (G.phasingtime >= 0 && G.phasingtimemax > 0) {
      Paint_meter(mx, my + 40, 'Phasing left', G.phasingtime >= G.phasingtimemax ? G.phasingtimemax : G.phasingtime, G.phasingtimemax, HO.temporaryMeterColor);
    }
    if (G.destruct > 0) Paint_meter(mx, my + 60, 'Self destructing', G.destruct, toInt(SELF_DESTRUCT_DELAY), HO.temporaryMeterColor);
    if (G.shutdown_count >= 0) Paint_meter(mx, my + 80, 'SHUTDOWN', G.shutdown_count, G.shutdown_delay, HO.temporaryMeterColor);
  }
}

function Paint_lock(hud_pos_x: number, hud_pos_y: number): void {
  const BORDER = 2;
  const S = G.Setup!;
  if (ST.mapdiag === 0) ST.mapdiag = toInt(Math.sqrt(S.width * S.width + S.height * S.height));
  const target = Other_by_id(G.lock_id);
  if (target === null) return;
  if (G.hudColor) {
    let color = Life_color(target);
    if (!color) color = G.hudColor;
    SET_FG(G.colors[color].pixel);
    Check_name_string(target);
    rd.drawString(G.dpy, G.drawPixmap, G.gameGC, WINSCALE(hud_pos_x) - Math.trunc(target.name_width / 2),
      WINSCALE(hud_pos_y - G.hudSize + HUD_OFFSET - BORDER) - G.gameFont.descent, target.id_string, target.name_len);
    const str = BIT(S.mode, LIMITED_LIVES) ? sprintf('%03d', target.life) : sprintf('%03d', Math.trunc(G.lock_dist / BLOCK_SZ));
    if (BIT(S.mode, LIMITED_LIVES) || G.lock_dist !== 0) {
      if (BIT(S.mode, LIMITED_LIVES) && target.life === 0) SET_FG(G.colors[RED].pixel);
      else SET_FG(G.colors[G.hudColor].pixel);
      rd.drawString(G.dpy, G.drawPixmap, G.gameGC, WINSCALE(hud_pos_x + G.hudSize - HUD_OFFSET + BORDER),
        WINSCALE(hud_pos_y - G.hudSize + HUD_OFFSET - BORDER) - G.gameFont.descent, str, 3);
    }
  }
  if (G.lock_dist !== 0 && HO.hudLockColor) {
    if (G.lock_dist > WARNING_DISTANCE || G.loopsSlow & 1) {
      let size = MIN(Math.trunc(ST.mapdiag / G.lock_dist), 10);
      if (size === 0) size = 1;
      const self = G.self;
      const x = toInt(hud_pos_x + MIN_HUD_SIZE * 0.6 * tcos(G.lock_dir) - size * 0.5);
      const y = toInt(hud_pos_y - MIN_HUD_SIZE * 0.6 * tsin(G.lock_dir) - size * 0.5);
      if (self !== null && ((self.team === target.team && BIT(S.mode, TEAM_PLAY)) || (self.alliance !== 0x20 && self.alliance === target.alliance))) {
        Arc_add(BLUE, x, y, size, size, 0, 64 * 360);
      } else {
        SET_FG(G.colors[HO.hudLockColor].pixel);
        rd.fillArc(G.dpy, G.drawPixmap, G.gameGC, WINSCALE(x), WINSCALE(y), UWINSCALE(size), UWINSCALE(size), 0, 64 * 360);
      }
    }
  }
}

function Paint_hudradar(hrscale: number, xlimit: number, ylimit: number, sz: number): void {
  const S = G.Setup!;
  const hrw = toInt(hrscale * 256);
  const hrh = toInt(hrscale * G.RadarHeight);
  const xf = hrw / S.width;
  const yf = hrh / S.height;
  for (let i = 0; i < G.num_radar; i++) {
    const r = G.radar_ptr[i];
    let x = toInt(r.x * hrscale - (G.world.x + Math.trunc(G.ext_view_width / 2)) * xf);
    let y = toInt(r.y * hrscale - (G.world.y + Math.trunc(G.ext_view_height / 2)) * yf);
    if (x < -Math.trunc(hrw / 2)) x += hrw;
    else if (x > Math.trunc(hrw / 2)) x -= hrw;
    if (y < -Math.trunc(hrh / 2)) y += hrh;
    else if (y > Math.trunc(hrh / 2)) y -= hrh;
    if (!(x <= xlimit && x >= -xlimit && y <= ylimit && y >= -ylimit)) {
      x = x + Math.trunc(G.ext_view_width / 2) - Math.trunc(sz / 2);
      y = -y + Math.trunc(G.ext_view_height / 2) - Math.trunc(sz / 2);
      if (r.type === RadarEnemy) {
        if (HO.hudRadarEnemyColor >= 1) Arc_add(HO.hudRadarEnemyColor, x, y, sz, sz, 0, 64 * 360);
      } else if (HO.hudRadarOtherColor >= 1) Arc_add(HO.hudRadarOtherColor, x, y, sz, sz, 0, 64 * 360);
    }
  }
}

function Paint_HUD_items(hud_pos_x: number, hud_pos_y: number): void {
  const BORDER = 3;
  let maxWidth = -1;
  SET_FG(G.colors[HO.hudItemsColor].pixel);
  if (ST.vertSpacing < 0) ST.vertSpacing = MAX(ITEM_SIZE, G.gameFont.ascent + G.gameFont.descent) + 1;
  const vertSpacing = ST.vertSpacing;
  let vert_pos = WINSCALE(hud_pos_y - G.hudSize + HUD_OFFSET + BORDER);
  let horiz_pos = WINSCALE(hud_pos_x - G.hudSize + HUD_OFFSET - BORDER);
  const FPS = G.Setup!.frames_per_second;
  for (let i = 0; i < NUM_ITEMS; i++) {
    let num = G.numItems[i];
    if (i === ITEM_FUEL) continue;
    if (G.instruments.showItems) {
      G.lastNumItems[i] = num;
      if (num <= 0) num = -1;
    } else {
      if (num !== G.lastNumItems[i]) {
        G.numItemsTime[i] = toInt(G.showItemsTime * FPS);
        G.lastNumItems[i] = num;
      }
      if (G.numItemsTime[i]-- <= 0) {
        G.numItemsTime[i] = 0;
        num = -1;
      }
    }
    if (num >= 0) {
      Gui_paint_item_symbol(i & 0xff, G.drawPixmap, G.gameGC, horiz_pos - ITEM_SIZE, vert_pos, ITEM_HUD);
      if (i === G.lose_item) {
        if (G.lose_item_active !== 0) {
          if (G.lose_item_active < 0) G.lose_item_active++;
          rd.drawRectangle(G.dpy, G.drawPixmap, G.gameGC, horiz_pos - ITEM_SIZE - 2, vert_pos - 2, ITEM_SIZE + 2, ITEM_SIZE + 2);
        }
      }
      const str = sprintf('%d', num);
      const len = str.length;
      const width = X.XTextWidth(G.gameFont, str, len);
      rd.drawString(G.dpy, G.drawPixmap, G.gameGC, horiz_pos - ITEM_SIZE - BORDER - width,
        vert_pos + Math.trunc(ITEM_SIZE / 2) + Math.trunc(G.gameFont.ascent / 2), str, len);
      maxWidth = MAX(maxWidth, width + BORDER + ITEM_SIZE);
      vert_pos += vertSpacing;
      if (vert_pos + vertSpacing > WINSCALE(hud_pos_y + G.hudSize - HUD_OFFSET - BORDER)) {
        horiz_pos -= maxWidth + 2 * BORDER;
        vert_pos = WINSCALE(hud_pos_y - G.hudSize + HUD_OFFSET + BORDER);
        maxWidth = -1;
      }
    }
  }
}

export function Del_HUD_message(): void {
  ST.have_hudmsg = false;
}

export function Add_HUD_message(message: string | null): void {
  if (!message) return;
  ST.hudmsg = message.slice(0, MSG_LEN - 1);
  ST.have_hudmsg = true;
}

export function Paint_HUD(): void {
  const BORDER = 3;
  let did_fuel = 0;
  const S = G.Setup!;
  const evw2 = Math.trunc(G.ext_view_width / 2), evh2 = Math.trunc(G.ext_view_height / 2);
  if (G.ptr_move_fact !== 0.0 && G.selfVisible && (G.selfVel.x !== 0 || G.selfVel.y !== 0)) {
    Segment_add(G.hudColor, evw2, evh2, toInt(evw2 - G.ptr_move_fact * G.selfVel.x), toInt(evh2 + G.ptr_move_fact * G.selfVel.y));
  }
  if (G.selfVisible && HO.dirPtrColor) {
    Segment_add(HO.dirPtrColor, toInt(evw2 + (100 - 15) * tcos(G.heading)), toInt(evh2 - (100 - 15) * tsin(G.heading)),
      toInt(evw2 + 100 * tcos(G.heading)), toInt(evh2 - 100 * tsin(G.heading)));
  }
  if (HO.hudRadarEnemyColor || HO.hudRadarOtherColor) {
    const hudRadarMapScale = S.width / 256;
    const lim = (G.hudRadarLimit * Math.trunc(G.active_view_width / 2) * G.hudRadarScale) / hudRadarMapScale;
    Paint_hudradar(G.hudRadarScale, lim, lim, G.hudRadarDotSize);
    Paint_hudradar(hudRadarMapScale, G.active_view_width / 2, G.active_view_height / 2, SHIP_SZ);
  }
  if (Bms_test_state(BmsBall) && HO.msgScanBallColor) Arc_add(HO.msgScanBallColor, evw2 - 5, evh2 - 5, 10, 10, 0, 64 * 360);
  if (Bms_test_state(BmsCover) && HO.msgScanCoverColor) Arc_add(HO.msgScanCoverColor, evw2 - 4, evh2 - 4, 8, 8, 0, 64 * 360);

  const hud_pos_x = toInt(evw2 - G.hud_move_fact * G.selfVel.x);
  const hud_pos_y = toInt(evh2 + G.hud_move_fact * G.selfVel.y);
  const hudSize = G.hudSize;

  G.gcv.line_style = X.LineOnOffDash;
  X.XChangeGC(G.dpy, G.gameGC, X.GCLineStyle | X.GCDashOffset, G.gcv);
  if (HO.hudHLineColor) {
    SET_FG(G.colors[HO.hudHLineColor].pixel);
    rd.drawLine(G.dpy, G.drawPixmap, G.gameGC, WINSCALE(hud_pos_x - hudSize), WINSCALE(hud_pos_y - hudSize + HUD_OFFSET),
      WINSCALE(hud_pos_x + hudSize), WINSCALE(hud_pos_y - hudSize + HUD_OFFSET));
    rd.drawLine(G.dpy, G.drawPixmap, G.gameGC, WINSCALE(hud_pos_x - hudSize), WINSCALE(hud_pos_y + hudSize - HUD_OFFSET),
      WINSCALE(hud_pos_x + hudSize), WINSCALE(hud_pos_y + hudSize - HUD_OFFSET));
  }
  if (HO.hudVLineColor) {
    SET_FG(G.colors[HO.hudVLineColor].pixel);
    rd.drawLine(G.dpy, G.drawPixmap, G.gameGC, WINSCALE(hud_pos_x - hudSize + HUD_OFFSET), WINSCALE(hud_pos_y - hudSize),
      WINSCALE(hud_pos_x - hudSize + HUD_OFFSET), WINSCALE(hud_pos_y + hudSize));
    rd.drawLine(G.dpy, G.drawPixmap, G.gameGC, WINSCALE(hud_pos_x + hudSize - HUD_OFFSET), WINSCALE(hud_pos_y - hudSize),
      WINSCALE(hud_pos_x + hudSize - HUD_OFFSET), WINSCALE(hud_pos_y + hudSize));
  }
  G.gcv.line_style = X.LineSolid;
  X.XChangeGC(G.dpy, G.gameGC, X.GCLineStyle, G.gcv);

  if (HO.hudItemsColor) Paint_HUD_items(hud_pos_x, hud_pos_y);

  if (G.hudColor && (G.fuelTime > 0.0 || G.fuelSum < G.fuelNotify)) {
    SET_FG(G.colors[G.hudColor].pixel);
    did_fuel = 1;
    let str = sprintf('%04d', toInt(G.fuelSum));
    rd.drawString(G.dpy, G.drawPixmap, G.gameGC, WINSCALE(hud_pos_x + hudSize - HUD_OFFSET + BORDER),
      WINSCALE(hud_pos_y + hudSize - HUD_OFFSET + BORDER) + G.gameFont.ascent, str, str.length);
    if (G.numItems[ITEM_TANK]) {
      if (G.fuelCurrent === 0) str = 'M ';
      else str = sprintf('T%d', G.fuelCurrent);
      rd.drawString(G.dpy, G.drawPixmap, G.gameGC, WINSCALE(hud_pos_x + hudSize - HUD_OFFSET + BORDER),
        WINSCALE(hud_pos_y + hudSize - HUD_OFFSET + BORDER) + G.gameFont.descent + 2 * G.gameFont.ascent, str, str.length);
    }
  }

  Paint_lock(hud_pos_x, hud_pos_y);

  if (ST.have_hudmsg) {
    const len = ST.hudmsg.length;
    const width = X.XTextWidth(G.gameFont, ST.hudmsg, len);
    SET_FG(G.colors[WHITE].pixel);
    rd.drawString(G.dpy, G.drawPixmap, G.gameGC, WINSCALE(hud_pos_x) - Math.trunc(width / 2),
      WINSCALE(hud_pos_y - hudSize - BORDER) - G.gameFont.descent, ST.hudmsg, len);
  }

  if (G.hudColor) {
    SET_FG(G.colors[G.hudColor].pixel);
    for (let i = 0, j = 0; i < MAX_SCORE_OBJECTS; i++) {
      const sobj = G.score_objects[(i + G.score_object) % MAX_SCORE_OBJECTS];
      if (sobj.hud_msg_len > 0) {
        if (sobj.hud_msg_width === -1) sobj.hud_msg_width = X.XTextWidth(G.gameFont, sobj.hud_msg, sobj.hud_msg_len);
        if (j === 0 && sobj.hud_msg_width > WINSCALE(2 * hudSize - HUD_OFFSET * 2) && (did_fuel || HO.hudVLineColor)) ++j;
        rd.drawString(G.dpy, G.drawPixmap, G.gameGC, WINSCALE(hud_pos_x) - Math.trunc(sobj.hud_msg_width / 2),
          WINSCALE(hud_pos_y + hudSize - HUD_OFFSET + BORDER) + G.gameFont.ascent + j * (G.gameFont.ascent + G.gameFont.descent),
          sobj.hud_msg, sobj.hud_msg_len);
        j++;
      }
    }
    if (G.time_left > 0) {
      const str = sprintf('%3d:%02d', Math.trunc(G.time_left / 60), Math.trunc(G.time_left % 60));
      const size = X.XTextWidth(G.gameFont, str, str.length);
      rd.drawString(G.dpy, G.drawPixmap, G.gameGC, WINSCALE(hud_pos_x - hudSize + HUD_OFFSET - BORDER) - size,
        WINSCALE(hud_pos_y - hudSize + HUD_OFFSET - BORDER) - G.gameFont.descent, str, str.length);
    }
    const mods = G.mods;
    const modlen = mods.length;
    rd.drawString(G.dpy, G.drawPixmap, G.gameGC, WINSCALE(hud_pos_x - hudSize + HUD_OFFSET - BORDER) - X.XTextWidth(G.gameFont, mods, modlen),
      WINSCALE(hud_pos_y + hudSize - HUD_OFFSET + BORDER) + G.gameFont.ascent, mods, mods.length);
    if (G.autopilotLight) {
      const autopilot = 'Autopilot';
      const text_width = X.XTextWidth(G.gameFont, autopilot, autopilot.length);
      rd.drawString(G.dpy, G.drawPixmap, G.gameGC, WINSCALE(hud_pos_x) - Math.trunc(text_width / 2),
        WINSCALE(hud_pos_y - hudSize + HUD_OFFSET - BORDER) - G.gameFont.descent * 2 - G.gameFont.ascent, autopilot, autopilot.length);
    }
  }

  if (G.fuelTime > 0.0) {
    G.fuelTime -= G.timePerFrame;
    if (G.fuelTime <= 0.0) G.fuelTime = 0.0;
  }

  if (HO.fuelGaugeColor && (G.fuelTime > 0.0 || (G.fuelSum < G.fuelNotify && ((G.fuelSum < G.fuelCritical && G.loopsSlow % 4 < 2)
    || (G.fuelSum < G.fuelWarning && G.fuelSum > G.fuelCritical && G.loopsSlow % 8 < 4) || G.fuelSum > G.fuelWarning)))) {
    SET_FG(G.colors[HO.fuelGaugeColor].pixel);
    rd.drawRectangle(G.dpy, G.drawPixmap, G.gameGC, WINSCALE(hud_pos_x + hudSize - HUD_OFFSET + FUEL_GAUGE_OFFSET) - 1,
      WINSCALE(hud_pos_y - hudSize + HUD_OFFSET + FUEL_GAUGE_OFFSET) - 1, UWINSCALE(HUD_OFFSET - 2 * FUEL_GAUGE_OFFSET) + 3,
      UWINSCALE(HUD_FUEL_GAUGE_SIZE) + 3);
    const size = toInt((HUD_FUEL_GAUGE_SIZE * G.fuelSum) / G.fuelMax);
    rd.fillRectangle(G.dpy, G.drawPixmap, G.gameGC, WINSCALE(hud_pos_x + hudSize - HUD_OFFSET + FUEL_GAUGE_OFFSET) + 1,
      WINSCALE(hud_pos_y - hudSize + HUD_OFFSET + FUEL_GAUGE_OFFSET + HUD_FUEL_GAUGE_SIZE - size) + 1,
      UWINSCALE(HUD_OFFSET - 2 * FUEL_GAUGE_OFFSET), UWINSCALE(size));
  }
}

export function Paint_messages(): void {
  const mf = G.messageFont;
  const BORDER = 10, SPACING = mf.ascent + mf.descent + 1;
  let top_y = BORDER + mf.ascent;
  let bot_y = WINSCALE(G.ext_view_height) - mf.descent - BORDER;
  const sel = G.selection.draw;
  for (let i = 0; i < 2 * G.maxMessages; i++) {
    const msg = i < G.maxMessages ? G.TalkMsg[i] : G.GameMsg[i - G.maxMessages];
    if (msg.len === 0) continue;
    if (msg.lifeTime > MSG_FLASH_TIME || (sel.state !== SEL_PENDING && sel.state !== SEL_EMPHASIZED)) {
      if ((msg.lifeTime -= G.timePerFrame) <= 0.0) {
        msg.txt = '';
        msg.len = 0;
        msg.lifeTime = 0.0;
        continue;
      }
    }
    let msg_color;
    if (msg.lifeTime <= MSG_FLASH_TIME) msg_color = HO.oldMessagesColor;
    else if (G.self && strchrc('P', G.self.mychar)) msg_color = HO.messagesColor;
    else {
      switch (msg.bmsinfo) {
        case BmsBall: msg_color = HO.msgScanBallColor; break;
        case BmsSafe: msg_color = HO.msgScanSafeColor; break;
        case BmsCover: msg_color = HO.msgScanCoverColor; break;
        case BmsPop: msg_color = HO.msgScanPopColor; break;
        default: msg_color = HO.messagesColor; break;
      }
    }
    if (G.newbie) {
      const help = '[*Newbie help*]';
      const sz = msg.txt.length, hsz = help.length;
      if (sz > hsz && msg.txt.slice(sz - hsz) === help) msg_color = WHITE;
    }
    if (msg_color === 0) continue;
    let x, y;
    if (i < G.maxMessages) {
      x = BORDER;
      y = top_y;
      top_y += SPACING;
    } else {
      if (!G.instruments.showMessages) continue;
      x = BORDER;
      y = bot_y;
      bot_y -= SPACING;
    }
    let len = toInt(G.charsPerSecond * (MSG_LIFE_TIME - msg.lifeTime));
    len = MIN(msg.len, len);
    if (sel.state === SEL_EMPHASIZED && i < G.maxMessages && i >= sel.y1 && i <= sel.y2) {
      let ptr: string | null = null, xoff = 0, l = 0;
      let ptr2: string | null = null, xoff2 = 0, l2 = 0;
      let ptr3: string | null = null, xoff3 = 0, l3 = 0;
      const txt = msg.txt;
      if (i > sel.y1 && i < sel.y2) {
        ptr2 = txt;
        l2 = len;
        xoff2 = 0;
      } else if (i === sel.y1) {
        ptr = txt;
        xoff = 0;
        if (len < sel.x1) l = len;
        else {
          l = sel.x1;
          ptr2 = txt.slice(sel.x1);
          xoff2 = X.XTextWidth(mf, txt, sel.x1);
          if (i < sel.y2) l2 = len - sel.x1;
          else if (len <= sel.x2) l2 = len - sel.x1;
          else {
            l2 = sel.x2 - sel.x1 + 1;
            ptr3 = txt.slice(sel.x2 + 1);
            xoff3 = X.XTextWidth(mf, txt, sel.x2 + 1);
            l3 = len - sel.x2 - 1;
          }
        }
      } else {
        ptr2 = txt;
        xoff2 = 0;
        if (len <= sel.x2 + 1) l2 = len;
        else {
          l2 = sel.x2 + 1;
          ptr3 = txt.slice(sel.x2 + 1);
          xoff3 = X.XTextWidth(mf, txt, sel.x2 + 1);
          l3 = len - sel.x2 - 1;
        }
      }
      if (ptr !== null) {
        X.XSetForeground(G.dpy, G.messageGC, G.colors[msg_color].pixel);
        rd.drawString(G.dpy, G.drawPixmap, G.messageGC, x + xoff, y, ptr, l);
      }
      if (ptr2 !== null) {
        X.XSetForeground(G.dpy, G.messageGC, G.colors[DRAW_EMPHASIZED].pixel);
        rd.drawString(G.dpy, G.drawPixmap, G.messageGC, x + xoff2, y, ptr2, l2);
      }
      if (ptr3 !== null) {
        X.XSetForeground(G.dpy, G.messageGC, G.colors[msg_color].pixel);
        rd.drawString(G.dpy, G.drawPixmap, G.messageGC, x + xoff3, y, ptr3, l3);
      }
    } else {
      X.XSetForeground(G.dpy, G.messageGC, G.colors[msg_color].pixel);
      rd.drawString(G.dpy, G.drawPixmap, G.messageGC, x, y, msg.txt, len);
    }
  }
}

export function Paint_recording(): void {
  if (!G.recording || G.loopsSlow % 16 < 8) return;
  SET_FG(G.colors[RED].pixel);
  const mb = Record_size() / 1e6;
  const buf = sprintf('REC %.1f MB', mb);
  const len = buf.length;
  const w = X.XTextWidth(G.gameFont, buf, len);
  X.XDrawString(G.dpy, G.drawPixmap, G.gameGC, WINSCALE(G.ext_view_width) - 10 - w, 10 + G.gameFont.ascent, buf, len);
}

export function Paint_HUD_values(): void {
  if (!G.hudColor) return;
  SET_FG(G.colors[G.hudColor].pixel);
  const buf = sprintf('FPS    : %.3f', G.clientFPS);
  const buf2 = sprintf('CL.LAG : %.1f ms', G.clData.clientLag);
  const len = buf.length, w = X.XTextWidth(G.gameFont, buf, len);
  const len2 = buf2.length, w2 = X.XTextWidth(G.gameFont, buf2, len2);
  const wmax = MAX(w, w2);
  rd.drawString(G.dpy, G.drawPixmap, G.gameGC, WINSCALE(G.ext_view_width) - 10 - wmax, 200 + G.gameFont.ascent, buf, len);
  rd.drawString(G.dpy, G.drawPixmap, G.gameGC, WINSCALE(G.ext_view_width) - 10 - wmax, 220 + G.gameFont.ascent, buf2, len2);
}

export function Store_hud_options(): void {
  const o = (name: HOKey, def: number, help: string) => COLOR_INDEX_OPTION(name, def, ref(HO, name), help);
  STORE_OPTIONS([
    COLOR_INDEX_OPTION('hudColor', 2, ref(G, 'hudColor'), 'Which color number to use for drawing the HUD.\n'),
    o('hudHLineColor', 0, 'Which color number to use for drawing the horizontal lines\n'),
    o('hudVLineColor', 0, 'Which color number to use for drawing the vertical lines\nin the HUD.\n'),
    o('hudItemsColor', 2, 'Which color number to use for drawing owned items on the HUD.\n'),
    o('hudRadarEnemyColor', 3, 'Which color number to use for drawing hudradar dots\nthat represent enemy ships.\n'),
    o('hudRadarOtherColor', 2, 'Which color number to use for drawing hudradar dots\nthat represent friendly ships or other objects.\n'),
    o('hudLockColor', 0, 'Which color number to use for drawing the lock on the HUD.\n'),
    o('fuelGaugeColor', 0, 'Which color number to use for drawing the fuel gauge.\n'),
    o('dirPtrColor', 0, 'Which color number to use for drawing the direction pointer hack.\n'),
    o('messagesColor', 12, 'Which color number to use for drawing messages.\n'),
    o('oldMessagesColor', 13, 'Which color number to use for drawing old messages.\n'),
    o('msgScanBallColor', 3, 'Which color number to use for drawing ball message warning.\n'),
    o('msgScanSafeColor', 4, 'Which color number to use for drawing safe message.\n'),
    o('msgScanCoverColor', 2, 'Which color number to use for drawing cover message.\n'),
    o('msgScanPopColor', 11, 'Which color number to use for drawing pop message.\n'),
    o('fuelMeterColor', 0, 'Which color number to use for drawing the fuel meter.\n'),
    o('powerMeterColor', 0, 'Which color number to use for drawing the power meter.\n'),
    o('turnSpeedMeterColor', 0, 'Which color number to use for drawing the turn speed meter.\n'),
    o('packetSizeMeterColor', 0, 'Which color number to use for drawing the packet size meter.\nEach bar is equavalent to 1024 bytes, for a maximum of 4096 bytes.\n'),
    o('packetLossMeterColor', 3, 'Which color number to use for drawing the packet loss meter.\nThis gives the percentage of lost frames due to network failure.\n'),
    o('packetDropMeterColor', 3, 'Which color number to use for drawing the packet drop meter.\nThis gives the percentage of dropped frames due to display\nslowness.\n'),
    o('packetLagMeterColor', 3, 'Which color number to use for drawing the packet lag meter.\nThis gives the amount of lag in frames over the past one second.\n'),
    o('temporaryMeterColor', 3, 'Which color number to use for drawing temporary meters.\n'),
    o('meterBorderColor', 2, 'Which color number to use for drawing borders of meters.\n'),
    o('scoreObjectColor', 4, 'Which color number to use for drawing score objects.\n'),
  ]);
}
