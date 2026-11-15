// C-Dogs SDL 2.5.0, translated: high scores (hiscores.c). The original keeps scores.json, shared by everyone on the
// machine; the port keeps the same JSON in the game's storage (scoreStore, set by index.ts).
// GPL-2.0-or-later / BSD-2-Clause (web/games/cdogs/LICENSE.md).
import { DIRECTION_DOWN, colorRed, colorWhite } from '../core/base.ts';
import { CharacterCopy, FPS_FRAMELIMIT, StrCharacterClass, WeaponUsagesGetAccuracy, WeaponUsagesGetFavorite, newCharacter } from '../core/classes.ts';
import { gCampaign, gPlayerDatas, IsPVP, type Campaign } from '../core/state.ts';
import type { Character, PlayerData, PlayerStats, WeaponUsage } from '../core/types.ts';
import { GetNumPlayers, IsPlayerHuman, PLAYER_ANY, newStats } from '../core/player.ts';
import { EVENT_WAIT_CONTINUE, EventWaitForAnyKeyOrButton } from '../platform/input.ts';
import { FontH, FontStr, FontStrMask, FontStrW, PicRender } from '../render/gfx.ts';
import { DrawHead } from '../render/draw.ts';
import { GameLoopDataNew, UPDATE_RESULT_OK, type GameLoopData, type LoopRunner } from './loop.ts';

const MAX_ENTRY = 20;
export interface HighScoreEntry { Name: string; Time: number; Character: Character; Stats: PlayerStats; WeaponUsages: Map<string, WeaponUsage> }
/** the scores file: load and save the whole JSON text */
export const scoreStore = { load: (): string | null => null, save: (_text: string): void => {} };

function GetPlayerHighScore(co: Campaign, p: PlayerData): number {
  const complete = (!co.IsQuit && !p.survived) || co.IsComplete;
  return complete && p.IsLocal && p.isOwn && IsPlayerHuman(p) ? p.Totals.Score : 0;
}
const colorJson = (c: { r: number; g: number; b: number }): string => `#${[c.r, c.g, c.b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
function parseColor(s: unknown): { r: number; g: number; b: number; a: number } {
  const t = typeof s === 'string' ? s.replace('#', '') : '000000';
  return { r: parseInt(t.slice(0, 2), 16) || 0, g: parseInt(t.slice(2, 4), 16) || 0, b: parseInt(t.slice(4, 6), 16) || 0, a: 255 };
}
function LoadHighScores(): Map<string, HighScoreEntry[]> {
  const out = new Map<string, HighScoreEntry[]>();
  const text = scoreStore.load();
  if (!text) return out;
  let root: Record<string, unknown>;
  try {
    root = JSON.parse(text);
  } catch {
    return out;
  }
  for (const [path, arr] of Object.entries(root)) {
    if (!Array.isArray(arr)) continue;
    const entries: HighScoreEntry[] = [];
    for (const enc of arr) {
      let e: Record<string, unknown>;
      try {
        e = JSON.parse(atob(String(enc)));
      } catch {
        continue;
      }
      const cn = e.Character as Record<string, unknown> | undefined;
      const st = e.Stats as Record<string, number> | undefined;
      const wu = e.WeaponUsages as Record<string, { Shots: number; Hits: number }> | undefined;
      if (!cn || !st || !wu) continue;
      const ch = newCharacter();
      ch.Class = StrCharacterClass(String(cn.Class ?? ''));
      ch.HeadParts = [cn.HairType ?? null, cn.FacehairType ?? null, cn.HatType ?? null, cn.GlassesType ?? null] as (string | null)[];
      ch.Colors = {
        Skin: parseColor(cn.Skin), Arms: parseColor(cn.Arms), Body: parseColor(cn.Body), Legs: parseColor(cn.Legs), Hair: parseColor(cn.Hair),
        Feet: parseColor(cn.Feet), Facehair: parseColor(cn.Facehair), Hat: parseColor(cn.Hat), Glasses: parseColor(cn.Glasses),
      };
      const stats = newStats();
      Object.assign(stats, { Score: st.Score | 0, Kills: st.Kills | 0, Suicides: st.Suicides | 0, Friendlies: st.Friendlies | 0, TimeTicks: st.TimeTicks | 0 });
      entries.push({ Name: String(e.Name ?? ''), Time: Number(e.Time ?? 0), Character: ch, Stats: stats, WeaponUsages: new Map(Object.entries(wu).map(([k, v]) => [k, { Shots: v.Shots | 0, Hits: v.Hits | 0 }])) });
    }
    out.set(path, entries);
  }
  return out;
}
function SaveHighScores(hs: Map<string, HighScoreEntry[]>): void {
  const root: Record<string, string[]> = {};
  for (const k of [...hs.keys()].sort()) {
    root[k] = hs.get(k)!.map((e) => {
      const c = e.Character;
      const o = {
        Name: e.Name, Time: e.Time,
        Character: {
          Class: c.Class?.Name ?? '', HairType: c.HeadParts[0], FacehairType: c.HeadParts[1], HatType: c.HeadParts[2], GlassesType: c.HeadParts[3],
          Skin: colorJson(c.Colors.Skin), Arms: colorJson(c.Colors.Arms), Body: colorJson(c.Colors.Body), Legs: colorJson(c.Colors.Legs),
          Hair: colorJson(c.Colors.Hair), Feet: colorJson(c.Colors.Feet), Facehair: colorJson(c.Colors.Facehair), Hat: colorJson(c.Colors.Hat),
          Glasses: colorJson(c.Colors.Glasses),
        },
        Stats: e.Stats,
        WeaponUsages: Object.fromEntries(e.WeaponUsages),
      };
      return btoa(unescape(encodeURIComponent(JSON.stringify(o))));
    });
  }
  scoreStore.save(JSON.stringify(root, null, '\t'));
}
function EnterHighScore(p: PlayerData, scores: HighScoreEntry[]): boolean {
  let idx = scores.findIndex((e) => e.Stats.Score <= p.Totals.Score);
  if (idx < 0) {
    if (scores.length >= MAX_ENTRY) return false;
    idx = scores.length;
  }
  scores.splice(idx, 0, { Name: p.name, Time: Math.trunc(Date.now() / 1000), Character: CharacterCopy(p.Char), Stats: { ...p.Totals }, WeaponUsages: new Map(p.WeaponUsages) });
  return true;
}
export function HighScoresScreen(co: Campaign): GameLoopData {
  return GameLoopDataNew({
    UpdateFunc: (l: LoopRunner) => {
      l.pop();
      if (!IsPVP(co.Entry.Mode) && GetNumPlayers(PLAYER_ANY, false, true) > 0) {
        const hs = LoadHighScores();
        let scores = hs.get(co.Entry.Path);
        if (!scores) {
          scores = [];
          hs.set(co.Entry.Path, scores);
        }
        let allTime = false;
        for (const p of gPlayerDatas) {
          if (GetPlayerHighScore(co, p) > 0 && EnterHighScore(p, scores)) allTime = true;
          if (!p.survived) {
            p.Totals = newStats();
            p.missions = 0;
          } else {
            p.missions++;
          }
          p.lastMission = co.MissionIndex;
        }
        SaveHighScores(hs);
        if (allTime) {
          const data = { scores: [...scores] };
          l.push(GameLoopDataNew({
            UpdateFunc: (l2: LoopRunner) => {
              if (EventWaitForAnyKeyOrButton() !== EVENT_WAIT_CONTINUE) l2.pop();
              return UPDATE_RESULT_OK;
            },
            DrawFunc: () => HighScoresDraw(data),
          }));
        }
      }
      return UPDATE_RESULT_OK;
    },
  });
}
export interface HighScoresData { scores: HighScoreEntry[] }
export function HighScoresDataLoad(co: Campaign): HighScoresData {
  return { scores: [...(LoadHighScores().get(co.Entry.Path) ?? [])] };
}
function DisplayAt(x: number, y: number, s: string, hilite: boolean): void {
  FontStrMask(s, { x, y }, hilite ? colorRed : colorWhite);
}
const SCORE_OFFSET = 25;
const TIME_OFFSET = SCORE_OFFSET + 30;
const KILLS_OFFSET = TIME_OFFSET + 20;
const ACC_OFFSET = KILLS_OFFSET + 20;
const FAV_WEP_OFFSET = ACC_OFFSET + 30;
const FACE_OFFSET = FAV_WEP_OFFSET + 10;
const NAME_OFFSET = FACE_OFFSET + 10;
export function HighScoresDraw(h: HighScoresData): void {
  let x = 60;
  let y = 5 + FontH();
  FontStr('High Scores:', { x: 5, y: 5 });
  for (const [s, o] of [['Rank', 0], ['Score', SCORE_OFFSET], ['Time', TIME_OFFSET], ['Kills', KILLS_OFFSET], ['Acc.', ACC_OFFSET], ['Fav.Gun', FAV_WEP_OFFSET]] as [string, number][]) {
    DisplayAt(x + o - FontStrW(s), y, s, false);
  }
  DisplayAt(x + NAME_OFFSET, y, 'Name', false);
  y += 5 + FontH();
  const local: number[] = [0, 0, 0, 0];
  let pIdx = 0;
  for (const p of gPlayerDatas) {
    const s = GetPlayerHighScore(gCampaign, p);
    if (s > 0 && pIdx < 4) local[pIdx++] = s;
  }
  h.scores.forEach((e, idx) => {
    let hl = false;
    for (let i = 0; i < 4; i++) {
      if (e.Stats.Score === local[i]) {
        hl = true;
        local[i] = 0;
        break;
      }
    }
    let s = `${idx + 1}.`;
    DisplayAt(x - FontStrW(s), y, s, hl);
    s = `${e.Stats.Score}`;
    DisplayAt(x + SCORE_OFFSET - FontStrW(s), y, s, hl);
    const secs = Math.trunc(e.Stats.TimeTicks / FPS_FRAMELIMIT);
    const cs = Math.trunc(((e.Stats.TimeTicks - secs * FPS_FRAMELIMIT) * 100) / FPS_FRAMELIMIT);
    s = `${Math.trunc(secs / 60)}:${String(secs % 60).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
    DisplayAt(x + TIME_OFFSET - FontStrW(s), y, s, hl);
    s = `${e.Stats.Kills}`;
    DisplayAt(x + KILLS_OFFSET - FontStrW(s), y, s, hl);
    s = `${Math.trunc(WeaponUsagesGetAccuracy(e.WeaponUsages) * 100)}%`;
    DisplayAt(x + ACC_OFFSET - FontStrW(s), y, s, hl);
    const wc = WeaponUsagesGetFavorite(e.WeaponUsages);
    if (wc && wc.Icon) PicRender(wc.Icon, { x: x + FAV_WEP_OFFSET - 15, y }, colorWhite);
    if (e.Character.Class) DrawHead(e.Character, DIRECTION_DOWN, { x: x + FACE_OFFSET, y: y + 4 });
    DisplayAt(x + NAME_OFFSET, y, e.Name, hl);
    y += 1 + FontH();
    if (y > 198 - FontH()) {
      y = 20;
      x += 100;
    }
  });
}
