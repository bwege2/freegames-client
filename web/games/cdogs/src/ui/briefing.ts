// C-Dogs SDL 2.5.0, translated: the campaign intro, the mission briefing and the mission summary
// (briefing_screens.c) and the animated counters of the summary (animated_counter.c).
// GPL-2.0-or-later / BSD-2-Clause (web/games/cdogs/LICENSE.md).
import { AnyButton, DIRECTION_DOWN, colorGreen, colorPurple, colorRed, colorWhite, f32, type Vec2i } from '../core/base.ts';
import { FPS_FRAMELIMIT, WeaponClassCanShoot } from '../core/classes.ts';
import { CPicGetPic } from '../core/pics.ts';
import {
  CanLevelSelect, HasObjectives, IsIntroNeeded, gCampaign, gMission, gPlayerDatas, type Campaign, type CampaignEntry,
  type MissionOptions,
} from '../core/state.ts';
import { KeycardCount, ObjectiveIsComplete, ObjectiveIsPerfect, ObjectiveIsRequired, OBJECTIVE_COLLECT, OBJECTIVE_DESTROY, OBJECTIVE_KILL, OBJECTIVE_RESCUE, type Objective } from '../core/mission.ts';
import { MAX_GUNS, type PlayerData } from '../core/types.ts';
import { GetNumPlayers, PLAYER_ANY, PlayerGetNumWeapons } from '../core/player.ts';
import { CampaignUnload } from '../core/data.ts';
import { MUSIC_BRIEFING, MUSIC_END, MUSIC_LOSE, MUSIC_MENU, MusicPlayFromChunk } from '../core/music.ts';
import { AutosaveAdd, AutosaveSaveText } from '../core/autosave.ts';
import { EVENT_WAIT_CANCEL, EVENT_WAIT_CONTINUE, EVENT_WAIT_OK, EventIsEscape, EventWaitForAnyKeyOrButton, GetMenuCmd, GetPlayerCmds } from '../platform/input.ts';
import { ALIGN_CENTER, ALIGN_END, CPicDraw, FontH, FontOptsNew, FontSplitLines, FontStr, FontStrH, FontStrMask, FontStrOpt, PicRender, gGfx, type FontOpts } from '../render/gfx.ts';
import { DrawHead } from '../render/draw.ts';
import { MENU_SOUND_ENTER, MENU_TYPE_NORMAL, MENU_TYPE_RETURN, MenuAddExitType, MenuAddSubmenu, MenuCreateNormal, MenuCreateReturn, MenuDraw, MenuPlaySound, MenuSystemAddCustomDisplay, MenuSystemInit, MenuUpdate } from './menu.ts';
import { GameLoopDataNew, UPDATE_RESULT_DRAW, UPDATE_RESULT_OK, type GameLoopData, type LoopRunner } from './loop.ts';
import { ScreenLoading } from './loading.ts';
import { DisplayCharacterAndName as DisplayCharacterAndNameImpl } from './playerselect.ts';
import { NumPlayersSelection } from './prep.ts';
import { PlayerEquip } from './equip.ts';
import { ScreenVictory } from './end.ts';

/** what the browser needs from index.ts: loading a campaign (asynchronous) and the autosave file */
export const briefingHooks = {
  load: (_entry: CampaignEntry): Promise<boolean> => Promise.resolve(false),
  saveAutosave: (_text: string): void => {},
};

// --- animated_counter.c ----------------------------------------------------------------------------------------------

const INC_RATIO = f32(0.05);
export interface AnimatedCounter { prefix: string | null; max: number; current: number; incRatio: number }
export const AnimatedCounterZero = (): AnimatedCounter => ({ prefix: null, max: 0, current: 0, incRatio: 0 });
export const AnimatedCounterNew = (prefix: string, max: number): AnimatedCounter => ({ prefix, max, current: 0, incRatio: INC_RATIO });
export function AnimatedCounterUpdate(a: AnimatedCounter, ticks: number): boolean {
  if (a.current === a.max) return true;
  let inc = f32((a.max - a.current) * a.incRatio);
  for (let i = 0; i < ticks; i++) {
    const diff = a.max - a.current;
    while (diff > 0 ? inc > diff : inc < diff) inc = f32(inc * INC_RATIO);
    a.current += diff > 0 ? Math.ceil(inc) : Math.floor(inc);
  }
  return false;
}
export function AnimatedCounterDraw(a: AnimatedCounter, pos: Vec2i): Vec2i {
  return FontStr(`${a.current}`, FontStr(a.prefix, pos));
}
export function AnimatedCounterTimeDraw(a: AnimatedCounter, pos: Vec2i): Vec2i {
  return FontStr(`${Math.trunc(a.current / 60)}:${String(a.current % 60).padStart(2, '0')}`, FontStr(a.prefix, pos));
}

// --- campaign intro --------------------------------------------------------------------------------------------------

export function ScreenCampaignIntro(gameMode: number, entry: CampaignEntry): GameLoopData {
  let waitResult = EVENT_WAIT_CONTINUE;
  let loading = false;
  return GameLoopDataNew({
    label: 'intro',
    OnEnter: () => {
      gCampaign.Entry.Mode = gameMode;
      if (!gCampaign.IsLoaded) {
        loading = true;
        void briefingHooks.load(entry).then((ok) => {
          loading = false;
          if (ok) MusicPlayFromChunk(MUSIC_MENU);
        });
      } else {
        MusicPlayFromChunk(MUSIC_MENU);
      }
    },
    OnExit: () => {
      if (waitResult === EVENT_WAIT_CANCEL) CampaignUnload(gCampaign);
    },
    InputFunc: () => {
      if (loading) return;
      waitResult = EventWaitForAnyKeyOrButton();
      if (waitResult === EVENT_WAIT_OK) MenuPlaySound(MENU_SOUND_ENTER);
    },
    UpdateFunc: (l: LoopRunner) => {
      if (loading) return UPDATE_RESULT_DRAW;
      if (!gCampaign.IsLoaded || waitResult === EVENT_WAIT_CANCEL) l.pop();
      else if (!IsIntroNeeded(gCampaign.Entry.Mode) || waitResult === EVENT_WAIT_OK) {
        l.push(ScreenLoading('Loading campaign...', true, NumPlayersSelection(), true));
      }
      return UPDATE_RESULT_OK;
    },
    DrawFunc: () => {
          if (loading) return;
      const c = gCampaign.Setting;
      const w = gGfx.w;
      const y = Math.trunc(gGfx.h / 4);
      const opts = FontOptsNew();
      opts.HAlign = ALIGN_CENTER;
      opts.Area = { x: gGfx.w, y: gGfx.h };
      opts.Pad.y = y - 25;
      FontStrOpt(c.Author.length ? `${c.Title} by ${c.Author}` : c.Title, { x: 0, y: 0 }, opts);
      if (c.Description.length > 0) FontStr(FontSplitLines(c.Description, Math.trunc((w * 5) / 6)), { x: Math.trunc(w / 12), y });
    },
  });
}

// --- mission briefing ------------------------------------------------------------------------------------------------

export interface MissionBriefingData {
  Title: string | null;
  TitleOpts: FontOpts;
  Description: string | null;
  DescriptionPos: Vec2i;
  ObjectiveDescPos: Vec2i;
  ObjectiveInfoPos: Vec2i;
  ObjectiveHeight: number;
  MissionOptions: MissionOptions;
}
export function MissionBriefingDataNew(m: MissionOptions): MissionBriefingData {
  const w = gGfx.w;
  const h = gGfx.h;
  const y = Math.trunc(h / 4);
  const b: MissionBriefingData = {
    Title: null, TitleOpts: FontOptsNew(), Description: null, DescriptionPos: { x: 0, y: 0 }, ObjectiveDescPos: { x: 0, y: 0 },
    ObjectiveInfoPos: { x: 0, y: 0 }, ObjectiveHeight: 0, MissionOptions: m,
  };
  const md = m.missionData!;
  b.Title = `Mission ${m.index + 1}: ${md.Title}`;
  b.TitleOpts.HAlign = ALIGN_CENTER;
  b.TitleOpts.Area = { x: w, y: h };
  b.TitleOpts.Pad.y = y - 25;
  b.Description = FontSplitLines(md.Description, Math.trunc((w * 5) / 6));
  b.DescriptionPos = { x: Math.trunc(w / 12), y };
  b.ObjectiveDescPos = { x: Math.trunc(w / 6), y: y + FontStrH(b.Description) + Math.trunc(h / 10) };
  b.ObjectiveInfoPos = { x: w - Math.trunc(w / 6), y: b.ObjectiveDescPos.y + FontH() };
  b.ObjectiveHeight = Math.trunc(h / 12);
  return b;
}
export function MissionBriefingDrawData(b: MissionBriefingData): void {
  FontStrOpt(b.Title, { x: 0, y: 0 }, b.TitleOpts);
  b.MissionOptions.missionData!.Objectives.forEach((o, i) => {
    if (o.Required === 0) return;
    const off = { x: 0, y: i * b.ObjectiveHeight };
    FontStr(o.Description, { x: b.ObjectiveDescPos.x + off.x, y: b.ObjectiveDescPos.y + off.y });
    off.x = -16 * (i & 1);
    DrawObjectiveInfo(o, { x: b.ObjectiveInfoPos.x + off.x, y: b.ObjectiveInfoPos.y + off.y });
  });
}
function IsMissionBriefingNeeded(mode: number, briefing: string | null): boolean {
  return HasObjectives(mode) && GetNumPlayers(PLAYER_ANY, false, true) > 0 && briefing != null && briefing.length > 0;
}
export function ScreenMissionBriefing(): GameLoopData {
  const m = gMission;
  const b = MissionBriefingDataNew(m);
  let typewriterCount = 0;
  let waitResult = EVENT_WAIT_CONTINUE;
  const desc = b.Description ?? '';
  let shown = '';
  return GameLoopDataNew({
    label: 'briefing',
    OnEnter: () => {
      if (IsMissionBriefingNeeded(gCampaign.Entry.Mode, b.Description)) MusicPlayFromChunk(MUSIC_BRIEFING);
    },
    OnExit: () => {
      if (waitResult !== EVENT_WAIT_OK) CampaignUnload(gCampaign);
    },
    InputFunc: () => {
      const cmds = GetPlayerCmds();
      if (b.Description != null) {
        for (const c of cmds) {
          if (!AnyButton(c)) continue;
          if (typewriterCount <= desc.length) {
            shown = desc;
            typewriterCount = desc.length;
            return;
          }
          waitResult = EVENT_WAIT_OK;
          MenuPlaySound(MENU_SOUND_ENTER);
        }
      }
      if (EventIsEscape(cmds, GetMenuCmd(false))) waitResult = EVENT_WAIT_CANCEL;
    },
    UpdateFunc: (l: LoopRunner) => {
      if (!IsMissionBriefingNeeded(gCampaign.Entry.Mode, b.Description)) {
        waitResult = EVENT_WAIT_OK;
      } else if (waitResult === EVENT_WAIT_CONTINUE) {
        if (typewriterCount <= desc.length) {
          if (shown.length <= typewriterCount) shown = desc.slice(0, typewriterCount + 1);
          typewriterCount++;
          return UPDATE_RESULT_DRAW;
        }
        return UPDATE_RESULT_OK;
      }
      if (waitResult === EVENT_WAIT_OK) l.change(PlayerEquip());
      else l.pop();
      return UPDATE_RESULT_OK;
    },
    DrawFunc: () => {
          FontStr(shown, b.DescriptionPos);
      MissionBriefingDrawData(b);
    },
  });
}

// --- mission summary -------------------------------------------------------------------------------------------------

const PERFECT_BONUS = 500;
interface PlayerSummaryDrawData {
  Pd: PlayerData | null;
  Score: AnimatedCounter;
  Total: AnimatedCounter;
  Time: AnimatedCounter;
  TimeTotal: AnimatedCounter;
  HealthResurrection: AnimatedCounter;
  ButcherNinjaFriendly: AnimatedCounter;
}
const MAX_LOCAL_PLAYERS = 4;
const AreAnySurvived = (): boolean => gPlayerDatas.some((p) => p.survived);
const GetAccessBonus = (m: MissionOptions): number => KeycardCount(m.KeyFlags) * 50;
function GetTimeBonus(m: MissionOptions): { bonus: number; seconds: number } {
  let seconds = 60 + m.missionData!.Objectives.length * 30 - Math.trunc(m.time / FPS_FRAMELIMIT);
  if (seconds < 0) seconds = 0;
  return { bonus: seconds * 25, seconds };
}
function GetHealthBonus(p: PlayerData): number {
  const maxHealth = p.Char.maxHealth;
  const hp = Math.min(p.hp, maxHealth);
  return hp > maxHealth - 50 ? (hp + 50 - p.Char.maxHealth) * 10 : 0;
}
const GetResurrectionFee = (p: PlayerData): number => (p.hp <= 0 ? -500 : 0);
function GetButcherPenalty(p: PlayerData): number {
  return p.Stats.Friendlies > 5 && p.Stats.Friendlies > Math.trunc(p.Stats.Kills / 2) ? -100 * p.Stats.Friendlies : 0;
}
function GetNinjaBonus(p: PlayerData): number {
  if (PlayerGetNumWeapons(p) === 1) {
    let wc = null;
    for (let i = 0; i < MAX_GUNS; i++) {
      if (p.guns[i] != null) {
        wc = p.guns[i];
        break;
      }
    }
    if (wc != null && !WeaponClassCanShoot(wc) && p.Stats.Friendlies === 0 && p.Stats.Kills > 5) return 50 * p.Stats.Kills;
  }
  return 0;
}
const GetFriendlyBonus = (p: PlayerData): number => (p.Stats.Kills === 0 && p.Stats.Friendlies === 0 ? 500 : 0);
function ApplyBonuses(p: PlayerData, bonus: number): void {
  if (!p.survived) return;
  p.Totals.Score += bonus + GetHealthBonus(p) + GetResurrectionFee(p) + GetButcherPenalty(p) + GetNinjaBonus(p) + GetFriendlyBonus(p);
}

export function ScreenMissionSummary(c: Campaign, m: MissionOptions, completed: boolean): GameLoopData {
  const h = FontH() * 10;
  const ms = MenuSystemInit({ x: 0, y: gGfx.h - h }, { x: gGfx.w, y: h });
  ms.current = ms.root = MenuCreateNormal('', '', MENU_TYPE_NORMAL, 0);
  if (completed) {
    MenuAddSubmenu(ms.root, MenuCreateReturn('Continue', 0));
  } else {
    MenuAddSubmenu(ms.root, MenuCreateReturn('Replay mission', 0));
    MenuAddSubmenu(ms.root, MenuCreateReturn('Back to menu', 1));
  }
  ms.allowAborts = true;
  MenuAddExitType(ms, MENU_TYPE_RETURN);
  let accessBonus = AnimatedCounterZero();
  let timeBonus = AnimatedCounterZero();
  const pDatas: PlayerSummaryDrawData[] = Array.from({ length: MAX_LOCAL_PLAYERS }, () => ({
    Pd: null, Score: AnimatedCounterZero(), Total: AnimatedCounterZero(), Time: AnimatedCounterZero(), TimeTotal: AnimatedCounterZero(),
    HealthResurrection: AnimatedCounterZero(), ButcherNinjaFriendly: AnimatedCounterZero(),
  }));
  MenuSystemAddCustomDisplay(ms, () => {
    const w = gGfx.w;
    const sh = gGfx.h;
    const pos = { x: Math.trunc(w / 6), y: Math.trunc(sh / 2) + Math.trunc(sh / 10) };
    let idx = 1;
    for (const o of m.missionData!.Objectives) {
      if (o.done === 0 && !ObjectiveIsRequired(o)) continue;
      DrawObjectiveInfo(o, { x: pos.x - 26, y: pos.y + FontH() });
      let opts = FontOptsNew();
      opts.Area = { x: w, y: sh };
      opts.Pad = { ...pos };
      if (!ObjectiveIsRequired(o)) opts.Mask = colorPurple;
      FontStrOpt(`Objective ${idx}: ${o.done} of ${o.Count}, ${o.Required} required`, { x: 0, y: 0 }, opts);
      opts = FontOptsNew();
      opts.HAlign = ALIGN_END;
      opts.Area = { x: w, y: sh };
      opts.Pad = { ...pos };
      if (!ObjectiveIsComplete(o)) {
        opts.Mask = colorRed;
        FontStrOpt('Failed', { x: 0, y: 0 }, opts);
      } else if (ObjectiveIsPerfect(o) && AreAnySurvived()) {
        opts.Mask = colorGreen;
        FontStrOpt(`Perfect: ${PERFECT_BONUS}`, { x: 0, y: 0 }, opts);
      } else if (ObjectiveIsRequired(o)) {
        FontStrOpt('Done', { x: 0, y: 0 }, opts);
      } else {
        FontStrOpt('Bonus!', { x: 0, y: 0 }, opts);
      }
      pos.y += 15;
      idx++;
    }
    if (accessBonus.prefix) {
      AnimatedCounterDraw(accessBonus, pos);
      pos.y += FontH() + 1;
    }
    if (timeBonus.prefix) AnimatedCounterDraw(timeBonus, pos);
    switch (GetNumPlayers(PLAYER_ANY, false, true)) {
      case 1:
        DrawPlayerSummary({ x: 0, y: 0 }, { x: w, y: Math.trunc(sh / 2) }, pDatas[0]);
        break;
      case 2: {
        const size = { x: Math.trunc(w / 2), y: Math.trunc(sh / 2) };
        DrawPlayerSummary({ x: 0, y: 0 }, size, pDatas[0]);
        DrawPlayerSummary({ x: Math.trunc(w / 2), y: 0 }, size, pDatas[1]);
        break;
      }
      case 3:
      case 4: {
        const size = { x: Math.trunc(w / 2), y: Math.trunc(sh / 4) };
        DrawPlayerSummary({ x: 0, y: 0 }, size, pDatas[0]);
        DrawPlayerSummary({ x: Math.trunc(w / 2), y: 0 }, size, pDatas[1]);
        DrawPlayerSummary({ x: 0, y: Math.trunc(sh / 4) }, size, pDatas[2]);
        // the original compares the objective counter here, not the number of players
        if (idx === 4) DrawPlayerSummary({ x: Math.trunc(w / 2), y: Math.trunc(sh / 4) }, size, pDatas[3]);
        break;
      }
      default:
        break;
    }
  }, null);
  return GameLoopDataNew({
    OnEnter: () => {
      const access = GetAccessBonus(m);
      if (AreAnySurvived()) {
        let bonus = 0;
        for (const o of m.missionData!.Objectives) if (ObjectiveIsPerfect(o)) bonus += PERFECT_BONUS;
        bonus += access;
        bonus += GetTimeBonus(m).bonus;
        for (const p of gPlayerDatas) {
          ApplyBonuses(p, bonus);
          p.Totals.TimeTicks += m.time;
        }
      }
      if (completed && CanLevelSelect(c.Entry.Mode)) {
        AutosaveAdd(c.Entry, m.index, m.NextMission, gPlayerDatas);
        briefingHooks.saveAutosave(AutosaveSaveText());
      }
      if (m.missionData!.SkipDebrief) return;
      MusicPlayFromChunk(completed ? MUSIC_END : MUSIC_LOSE);
      if (AreAnySurvived()) {
        if (access > 0) accessBonus = AnimatedCounterNew('Access bonus: ', access);
        const tb = GetTimeBonus(m);
        timeBonus = AnimatedCounterNew(`Time bonus: ${tb.seconds} secs x 25 = `, tb.bonus);
      }
      let idx = 0;
      for (const pd of gPlayerDatas) {
        if (!pd.IsLocal) continue;
        const d = pDatas[idx];
        if (!d) break;
        d.Pd = pd;
        d.Score = AnimatedCounterNew('Score: ', pd.Stats.Score);
        d.Total = AnimatedCounterNew('Total: ', pd.Totals.Score);
        d.Time = AnimatedCounterNew('Time: ', Math.trunc(m.time / FPS_FRAMELIMIT));
        d.TimeTotal = AnimatedCounterNew('Total Time: ', Math.trunc(pd.Totals.TimeTicks / FPS_FRAMELIMIT));
        if (pd.survived) {
          const hb = GetHealthBonus(pd);
          if (hb !== 0) d.HealthResurrection = AnimatedCounterNew('Health bonus: ', hb);
          const rf = GetResurrectionFee(pd);
          if (rf !== 0) d.HealthResurrection = AnimatedCounterNew('Resurrection fee: ', rf);
          const bp = GetButcherPenalty(pd);
          if (bp !== 0) d.ButcherNinjaFriendly = AnimatedCounterNew('Butcher penalty: ', bp);
          const nb = GetNinjaBonus(pd);
          if (nb !== 0) d.ButcherNinjaFriendly = AnimatedCounterNew('Ninja bonus: ', nb);
          const fb = GetFriendlyBonus(pd);
          if (fb !== 0) d.ButcherNinjaFriendly = AnimatedCounterNew('Friendly bonus: ', fb);
        }
        idx++;
      }
    },
    UpdateFunc: (l: LoopRunner) => {
      const result = MenuUpdate(ms);
      if (result === UPDATE_RESULT_DRAW) {
        AnimatedCounterUpdate(accessBonus, 1);
        AnimatedCounterUpdate(timeBonus, 1);
        for (const d of pDatas) {
          AnimatedCounterUpdate(d.Score, 1);
          AnimatedCounterUpdate(d.Total, 1);
          AnimatedCounterUpdate(d.Time, 1);
          AnimatedCounterUpdate(d.TimeTotal, 1);
          AnimatedCounterUpdate(d.HealthResurrection, 1);
          AnimatedCounterUpdate(d.ButcherNinjaFriendly, 1);
        }
      }
      if (result === UPDATE_RESULT_OK || m.missionData!.SkipDebrief) {
        gCampaign.IsComplete = completed && m.NextMission >= gCampaign.Setting.Missions.length;
        if (gCampaign.IsComplete) {
          l.change(ScreenVictory(gCampaign));
        } else {
          gCampaign.IsQuit = ms.current!.returnCode === 1;
          l.pop();
        }
      }
      return result;
    },
    DrawFunc: () => MenuDraw(ms),
  });
}
function DrawPlayerSummary(pos: Vec2i, size: Vec2i, d: PlayerSummaryDrawData): void {
  const pd = d.Pd;
  if (pd == null) return;
  const textPos = { x: pos.x + Math.trunc(size.x / 2), y: pos.y + Math.trunc((size.y - FontH() * 7) / 2) };
  DisplayCharacterAndName({ x: pos.x + Math.trunc(size.x / 4), y: pos.y + Math.trunc(size.y / 2) }, pd, pd.guns[0]);
  if (pd.survived) FontStr('Completed mission', textPos);
  else FontStrMask('Failed mission', textPos, colorRed);
  textPos.y += 2 * FontH();
  AnimatedCounterDraw(d.Score, textPos);
  textPos.y += FontH();
  AnimatedCounterDraw(d.Total, textPos);
  textPos.y += FontH();
  AnimatedCounterTimeDraw(d.Time, textPos);
  textPos.y += FontH();
  AnimatedCounterTimeDraw(d.TimeTotal, textPos);
  textPos.y += FontH();
  FontStr(`Missions: ${pd.missions + (pd.survived ? 1 : 0)}`, textPos);
  textPos.y += FontH();
  if (d.HealthResurrection.prefix) {
    AnimatedCounterDraw(d.HealthResurrection, textPos);
    textPos.y += FontH();
  }
  if (d.ButcherNinjaFriendly.prefix) AnimatedCounterDraw(d.ButcherNinjaFriendly, textPos);
}
function DisplayCharacterAndName(pos: Vec2i, pd: PlayerData, gun: PlayerData['guns'][number]): void {
  DisplayCharacterAndNameImpl(pos, pd.Char, DIRECTION_DOWN, pd.name, colorWhite, gun);
}

export function DrawObjectiveInfo(o: Objective, pos: Vec2i): void {
  const store = gCampaign.Setting.characters;
  switch (o.Type) {
    case OBJECTIVE_KILL:
      DrawHead(store.OtherChars[store.specialIds[0]], DIRECTION_DOWN, pos);
      break;
    case OBJECTIVE_RESCUE:
      DrawHead(store.OtherChars[store.prisonerIds[0]], DIRECTION_DOWN, pos);
      break;
    case OBJECTIVE_COLLECT: {
      const dp = { ...pos };
      for (const pc of o.Pickups) {
        if (pc) CPicDraw(pc.Pic, { x: dp.x + 4, y: dp.y + 4 }, null);
        dp.x += 4;
        dp.y += 2;
      }
      break;
    }
    case OBJECTIVE_DESTROY: {
      const dp = { ...pos };
      for (const mo of o.MapObjects) {
        if (mo) PicRender(CPicGetPic(mo.Pic, 0), { x: dp.x + mo.Offset.x, y: dp.y + mo.Offset.y }, colorWhite);
        dp.x += 4;
        dp.y += 2;
      }
      break;
    }
    default:
      break;
  }
}
