// x11/xpaint.c: one frame (Paint_frame, in the original's order), the score list and the clock.
import { G } from './G.ts';
import type { other_t } from './G.ts';
import { BLACK, BLUE, WHITE, WRAP_PLAY, TEAM_PLAY, TIMING, LIMITED_LIVES, BM_SCORE_BG, BM_LOGO, XP_OPTFLAG_DEFAULT } from './consts.ts';
import { BIT, onReset, sprintf, strchrc, toInt } from './cutil.ts';
import { sys } from './sys.ts';
import * as X from '../xlib/xlib.ts';
import type { Display, GC } from '../xlib/xlib.ts';
import { rd } from './record.ts';
import { SET_FG, Arc_end, Arc_start, Rectangle_end, Rectangle_start, Segment_end, Segment_start } from './paintdata.ts';
import { Paint_frame_start, Paint_score_table } from './paint.ts';
import { Paint_world, Paint_objects } from './paintmap.ts';
import { Paint_shots, Paint_ships, Init_wreckage } from './paintobjects.ts';
import { Init_asteroids, Team_color } from './guiobjects.ts';
import { Paint_meters, Paint_HUD, Paint_HUD_values, Paint_messages, Paint_score_objects, Paint_recording } from './painthud.ts';
import { Paint_radar, Paint_world_radar } from './paintradar.ts';
import { Bitmap_get, Bitmap_paint, Bitmaps_cleanup, Bitmaps_init, pixmaps } from './bitmaps.ts';
import { Talk_cursor } from './talk.ts';
import { Using_score_decimals } from './client.ts';
import { COLOR_INDEX_OPTION, STORE_OPTIONS, ref } from './option.ts';

const SCORE_BORDER = 6;

const XP = {
  prev_damaged: 0, prev_prev_damaged: 0, toggle: false, last_toggled: 0, clock_width: 0, lineSpacing: -1, firstLine: 0,
  clockColor: 0, scoreColor: 0, scoreSelfColor: 0, scoreInactiveColor: 0, scoreInactiveSelfColor: 0, scoreOwnTeamColor: 0,
  scoreEnemyTeamColor: 0,
};
onReset(() => Object.assign(XP, {
  prev_damaged: 0, prev_prev_damaged: 0, toggle: false, last_toggled: 0, clock_width: 0, lineSpacing: -1, firstLine: 0,
  clockColor: 0, scoreColor: 0, scoreSelfColor: 0, scoreInactiveColor: 0, scoreInactiveSelfColor: 0, scoreOwnTeamColor: 0,
  scoreEnemyTeamColor: 0,
}));

export function Paint_init(): number {
  if (Init_wreckage() === -1) return -1;
  if (Init_asteroids() === -1) return -1;
  if (Bitmaps_init() === -1) return -1;
  return 0;
}

export function Paint_cleanup(): void {
  Bitmaps_cleanup();
}

const FPS = () => G.Setup!.frames_per_second;

export function Paint_frame(): void {
  Paint_frame_start();
  Paint_score_table();
  Paint_clock(false);
  SET_FG(G.colors[BLACK].pixel);
  rd.newFrame();
  if (G.damaged <= 0) {
    if (XP.prev_damaged || XP.prev_prev_damaged) {
      SET_FG(G.colors[BLACK].pixel);
      X.XFillRectangle(G.dpy, G.drawWindow, G.gameGC, 0, 0, G.draw_width, G.draw_height);
    }
    Arc_start();
    Rectangle_start();
    Segment_start();
    Paint_world();
    Segment_end();
    Rectangle_end();
    Rectangle_start();
    Segment_start();
    Paint_objects();
    Paint_shots();
    Rectangle_end();
    Segment_end();
    Rectangle_start();
    Segment_start();
    Paint_ships();
    Paint_meters();
    Paint_HUD();
    Paint_recording();
    Paint_HUD_values();
    Rectangle_end();
    Segment_end();
    Arc_end();
    Paint_messages();
    Paint_radar();
    Paint_score_objects();
  } else {
    X.XSetFunction(G.dpy, G.gameGC, X.GXxor);
    SET_FG(G.colors[BLACK].pixel ^ G.colors[BLUE].pixel);
    X.XFillRectangle(G.dpy, G.drawWindow, G.gameGC, 0, 0, G.draw_width, G.draw_height);
    X.XSetFunction(G.dpy, G.gameGC, X.GXcopy);
    SET_FG(G.colors[BLACK].pixel);
  }
  XP.prev_prev_damaged = XP.prev_damaged;
  XP.prev_damaged = G.damaged;
  rd.endFrame();
  if (G.radar_exposures === 1 || G.UpdateRadar) Paint_world_radar();
  G.UpdateRadar = false;
  const S = G.Setup!;
  if (G.radarPixmap !== G.radarWindow && G.radar_exposures > 0) {
    if (!G.instruments.slidingRadar || BIT(S.mode, WRAP_PLAY) === 0) {
      X.XCopyArea(G.dpy, G.radarPixmap, G.radarWindow, G.gameGC, 0, 0, 256, G.RadarHeight, 0, 0);
    } else {
      const xp = (G.selfPos.x * 256) / S.width;
      const yp = (G.selfPos.y * G.RadarHeight) / S.height;
      const xo = 256 / 2, yo = G.RadarHeight / 2;
      let x = toInt(xp - xo + 0.5), y = toInt(yp - yo + 0.5);
      if (x <= 0) x += 256;
      if (y <= 0) y += G.RadarHeight;
      const w1 = x, h1 = y, h2 = G.RadarHeight - h1, w2 = 256 - w1;
      X.XCopyArea(G.dpy, G.radarPixmap, G.radarWindow, G.gameGC, 0, h2, w1, h1, w2, 0);
      if (w2 > 0) X.XCopyArea(G.dpy, G.radarPixmap, G.radarWindow, G.gameGC, w1, h2, w2, h1, 0, 0);
      if (h2 > 0) X.XCopyArea(G.dpy, G.radarPixmap, G.radarWindow, G.gameGC, 0, 0, w1, h2, w2, h1);
      if (w2 > 0 && h2 > 0) X.XCopyArea(G.dpy, G.radarPixmap, G.radarWindow, G.gameGC, w1, 0, w2, h2, 0, h1);
    }
  } else if (G.radar_exposures > 2) Paint_world_radar();
  if (G.dbuf_state!.type === 0) X.XCopyArea(G.dpy, G.drawPixmap, G.drawWindow, G.gameGC, 0, 0, G.draw_width, G.draw_height, 0, 0);
  // dbuff_switch: nothing to switch when copying pixmaps
  if (!G.damaged) {
    SET_FG(G.colors[BLACK].pixel);
    X.XFillRectangle(G.dpy, G.drawPixmap, G.gameGC, 0, 0, G.draw_width, G.draw_height);
  }
  if (G.clData.talking) {
    if (G.loops >= XP.last_toggled + FPS() / 2 || G.loops < XP.last_toggled) {
      XP.toggle = !XP.toggle;
      XP.last_toggled = G.loops;
    }
    Talk_cursor(XP.toggle);
  }
  X.XFlush(G.dpy);
}

function Paint_score_background(): void {
  if (G.fullColor && Bitmap_get(G.playersWindow, BM_SCORE_BG, 0) !== null && Bitmap_get(G.playersWindow, BM_LOGO, 0) !== null) {
    X.XSetForeground(G.dpy, G.scoreListGC, G.colors[BLACK].pixel);
    const bgh = pixmaps()[BM_SCORE_BG].height, lh = pixmaps()[BM_LOGO].height;
    Bitmap_paint(G.playersWindow, BM_SCORE_BG, 0, 0, 0);
    if (G.players_height > bgh + lh) X.XFillRectangle(G.dpy, G.playersWindow, G.scoreListGC, 0, bgh, G.players_width, G.players_height - (bgh + lh));
    Bitmap_paint(G.playersWindow, BM_LOGO, 0, G.players_height - lh, 0);
    X.XFlush(G.dpy);
  } else {
    X.XSetForeground(G.dpy, G.scoreListGC, G.colors[G.windowColor].pixel);
    X.XFillRectangle(G.dpy, G.playersWindow, G.scoreListGC, 0, 0, G.players_width, G.players_height);
    X.XFlush(G.dpy);
  }
}

export function Paint_score_start(): void {
  const thisLine = SCORE_BORDER + G.scoreListFont.ascent;
  let headingStr: string;
  const mode = G.Setup!.mode;
  if (G.showUserName) headingStr = 'NICK=USER@HOST';
  else if (BIT(mode, TEAM_PLAY)) headingStr = '     SCORE   NAME     LIFE';
  else {
    headingStr = ' AL ';
    headingStr += '  SCORE  ';
    if (BIT(mode, LIMITED_LIVES)) headingStr += 'LIFE';
    headingStr += ' NAME';
  }
  Paint_score_background();
  ShadowDrawString(G.dpy, G.playersWindow, G.scoreListGC, SCORE_BORDER, thisLine, headingStr, G.colors[XP.scoreColor].pixel, G.colors[BLACK].pixel);
  G.gcv.line_style = X.LineSolid;
  X.XChangeGC(G.dpy, G.scoreListGC, X.GCLineStyle, G.gcv);
  X.XDrawLine(G.dpy, G.playersWindow, G.scoreListGC, SCORE_BORDER, thisLine, G.players_width - SCORE_BORDER, thisLine);
  G.gcv.line_style = X.LineOnOffDash;
  X.XChangeGC(G.dpy, G.scoreListGC, X.GCLineStyle, G.gcv);
  Paint_clock(true);
}

const SC = { raceStr: '', teamStr: '', lifeStr: '' };
onReset(() => Object.assign(SC, { raceStr: '', teamStr: '', lifeStr: '' }));

export function Paint_score_entry(entry_num: number, other: other_t, is_team: boolean): void {
  if (XP.lineSpacing === -1) {
    SC.raceStr = '\0\0 \0\0\0\0\0';
    SC.teamStr = '\0 \0\0';
    SC.lifeStr = '';
    XP.lineSpacing = G.scoreListFont.ascent + G.scoreListFont.descent + 3;
    XP.firstLine = 2 * SCORE_BORDER + G.scoreListFont.ascent + XP.lineSpacing;
  }
  const thisLine = XP.firstLine + XP.lineSpacing * entry_num;
  const mode = G.Setup!.mode;
  let label: string;
  const cs = (s: string) => { const i = s.indexOf('\0'); return i < 0 ? s : s.slice(0, i); };
  if (G.showUserName) label = sprintf('%s=%s@%s', other.nick_name, other.user_name, other.host_name);
  else {
    if (BIT(mode, TIMING)) {
      let rs = '  ' + SC.raceStr.slice(2);
      if ((other.mychar === 0x20 || other.mychar === 0x52) && other.round + other.check > 0) {
        const t = other.round > 99 ? sprintf('%3d', other.round) : sprintf('%d.%c', other.round, other.check + 0x61);
        rs = t + '\0' + rs.slice(t.length + 1);
      }
      SC.raceStr = rs;
    }
    if (BIT(mode, TEAM_PLAY)) SC.teamStr = String.fromCharCode(other.team + 0x30) + SC.teamStr.slice(1);
    else SC.teamStr = String.fromCharCode(other.alliance) + '\0' + SC.teamStr.slice(2);
    if (BIT(mode, LIMITED_LIVES)) SC.lifeStr = sprintf(' %3d', other.life);
    let scoreStr: string;
    if (Using_score_decimals()) scoreStr = sprintf('%*.*f', 9 - G.showScoreDecimals, G.showScoreDecimals, other.score);
    else {
      const sc = Math.trunc(other.score >= 0.0 ? other.score + 0.5 : other.score - 0.5);
      scoreStr = sprintf('%6d', sc);
    }
    if (BIT(mode, TEAM_PLAY)) label = sprintf('%c %s  %-18s%s', other.mychar, scoreStr, other.nick_name, cs(SC.lifeStr));
    else label = sprintf('%c %s%s%s%s  %s', other.mychar, cs(SC.raceStr), cs(SC.teamStr), scoreStr, cs(SC.lifeStr), other.nick_name);
  }
  let color: number;
  if (!is_team && strchrc('DPW', other.mychar)) {
    color = G.self && other.id === G.self.id ? XP.scoreInactiveSelfColor : XP.scoreInactiveColor;
    X.XSetForeground(G.dpy, G.scoreListGC, G.colors[color].pixel);
    X.XDrawString(G.dpy, G.playersWindow, G.scoreListGC, SCORE_BORDER, thisLine, label, label.length);
  } else {
    if (!is_team) color = G.self && other.id === G.self.id ? XP.scoreSelfColor : XP.scoreColor;
    else {
      color = Team_color(other.team);
      if (!color) color = G.self && other.team === G.self.team ? XP.scoreOwnTeamColor : XP.scoreEnemyTeamColor;
    }
    ShadowDrawString(G.dpy, G.playersWindow, G.scoreListGC, SCORE_BORDER, thisLine, label, G.colors[color].pixel, G.colors[BLACK].pixel);
  }
  if (is_team) {
    color = G.windowColor !== WHITE ? WHITE : BLACK;
    X.XSetForeground(G.dpy, G.scoreListGC, G.colors[color].pixel);
    G.gcv.line_style = X.LineSolid;
    X.XChangeGC(G.dpy, G.scoreListGC, X.GCLineStyle, G.gcv);
    X.XDrawLine(G.dpy, G.playersWindow, G.scoreListGC, SCORE_BORDER, thisLine, G.players_width - SCORE_BORDER, thisLine);
    G.gcv.line_style = X.LineOnOffDash;
    X.XChangeGC(G.dpy, G.scoreListGC, X.GCLineStyle, G.gcv);
  }
}

function Paint_clock(redraw: boolean): void {
  const border = 3;
  const height = G.scoreListFont.ascent + G.scoreListFont.descent + 3;
  if (!XP.clockColor) {
    if (XP.clock_width !== 0) {
      X.XSetForeground(G.dpy, G.scoreListGC, G.colors[G.windowColor].pixel);
      X.XFillRectangle(G.dpy, G.playersWindow, G.scoreListGC, 256 - (XP.clock_width + 2 * border), 0, XP.clock_width + 2 * border, height);
      XP.clock_width = 0;
    }
    return;
  }
  if (!redraw && !G.newSecond) return;
  const m = sys.localtime(G.currentTime);
  let hour = m.hour;
  const minute = m.min;
  let buf: string;
  if (!G.instruments.clockAMPM) buf = sprintf('%02d:%02d', hour, minute);
  else {
    let c = 'A';
    if (hour > 12) {
      c = 'P';
      hour %= 12;
    }
    buf = sprintf('%2d:%02d%cM', hour, minute, c.charCodeAt(0));
  }
  XP.clock_width = X.XTextWidth(G.scoreListFont, buf, buf.length);
  X.XSetForeground(G.dpy, G.scoreListGC, G.colors[G.windowColor].pixel);
  X.XFillRectangle(G.dpy, G.playersWindow, G.scoreListGC, 256 - (XP.clock_width + 2 * border), 0, XP.clock_width + 2 * border, height);
  ShadowDrawString(G.dpy, G.playersWindow, G.scoreListGC, 256 - (XP.clock_width + border), G.scoreListFont.ascent + 4, buf,
    G.colors[XP.clockColor].pixel, G.colors[BLACK].pixel);
}

export function ShadowDrawString(display: Display, w: number, gc: GC, x: number, y: number, str: string, fg: number, bg: number): void {
  X.XSetForeground(display, gc, bg);
  X.XDrawString(display, w, gc, x + 1, y + 1, str, str.length);
  x--;
  y--;
  X.XSetForeground(display, gc, fg);
  X.XDrawString(display, w, gc, x, y, str, str.length);
}

export function Play_beep(): void {
  X.XBell(G.dpy, 0);
  X.XFlush(G.dpy);
}

export function Store_xpaint_options(): void {
  const r = <K extends keyof typeof XP>(k: K) => ref(XP, k) as unknown as { get(): number; set(v: number): void };
  STORE_OPTIONS([
    COLOR_INDEX_OPTION('clockColor', 1, r('clockColor'), 'Which color number to use for drawing the clock.\nThe clock is displayed in the top right of the score window.\n'),
    COLOR_INDEX_OPTION('scoreColor', 1, r('scoreColor'), 'Which color number to use for drawing score list entries.\n'),
    COLOR_INDEX_OPTION('scoreSelfColor', 3, r('scoreSelfColor'), 'Which color number to use for drawing your own score.\n'),
    COLOR_INDEX_OPTION('scoreInactiveColor', 12, r('scoreInactiveColor'), "Which color number to use for drawing inactive players's scores.\n"),
    COLOR_INDEX_OPTION('scoreInactiveSelfColor', 12, r('scoreInactiveSelfColor'), 'Which color number to use for drawing your score when inactive.\n'),
    COLOR_INDEX_OPTION('scoreOwnTeamColor', 4, r('scoreOwnTeamColor'), 'Which color number to use for drawing your own team score.\n'),
    COLOR_INDEX_OPTION('scoreEnemyTeamColor', 11, r('scoreEnemyTeamColor'), 'Which color number to use for drawing enemy team score.\n'),
  ]);
  void XP_OPTFLAG_DEFAULT;
}
