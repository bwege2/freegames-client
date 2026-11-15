// C-Dogs SDL 2.5.0, translated: the autosave (autosave.c): completed missions and the players' guns, ammo, lives,
// HP and score per campaign. The original keeps autosave.json in its config directory; the port keeps the same JSON
// in the player's server storage. GPL-2.0-or-later / BSD-2-Clause (web/games/cdogs/LICENSE.md).
import { MAX_WEAPONS, type PlayerData } from './types.ts';
import { gPlayerDatas, type CampaignEntry } from './state.ts';
import { StrWeaponClass } from './classes.ts';
import { PlayerAddMinimalWeapons, PlayerAddWeapon, PlayerSetLives } from './player.ts';

const VERSION = 3;
export interface PlayerSave { Guns: (string | null)[]; ammo: number[]; Lives: number; HP: number; Score: number }
export interface CampaignSave {
  Campaign: CampaignEntry;
  NextMission: number;
  MissionsCompleted: number[];
  Players: PlayerSave[];
  IsValid: boolean;
}
export const gAutosave = { LastCampaignIndex: -1, Campaigns: [] as CampaignSave[] };
/** does a campaign path exist in the data (set by the loader) */
export const autosaveHooks = { campaignExists: (_path: string): boolean => true };

function entryOf(path: string): CampaignEntry {
  return { Filename: '', Path: path, Info: '', Mode: 0, BuiltinIndex: 0, NumMissions: 0, IsBuiltin: false };
}
export function CampaignSaveIsValid(cs: CampaignSave | null): boolean {
  return cs != null && cs.IsValid && cs.Campaign.Path.length > 0;
}
export function AutosaveLoadText(text: string | null): void {
  gAutosave.LastCampaignIndex = -1;
  gAutosave.Campaigns = [];
  if (!text) return;
  let root: Record<string, unknown>;
  try {
    root = JSON.parse(text);
  } catch {
    return;
  }
  const version = typeof root.Version === 'number' ? root.Version : 2;
  const missions = Array.isArray(root.Missions) ? (root.Missions as Record<string, unknown>[]) : [];
  for (const node of missions) {
    const camp = (node.Campaign ?? {}) as Record<string, unknown>;
    const m: CampaignSave = { Campaign: entryOf(String(camp.Path ?? '')), NextMission: 0, MissionsCompleted: [], Players: [], IsValid: true };
    m.NextMission = typeof node.NextMission === 'number' ? node.NextMission : 0;
    if (version < 3) {
      const n = typeof node.MissionsCompleted === 'number' ? node.MissionsCompleted : 0;
      for (let i = 0; i < n; i++) m.MissionsCompleted.push(i);
      m.NextMission = n;
    } else if (Array.isArray(node.MissionsCompleted)) {
      m.MissionsCompleted = (node.MissionsCompleted as number[]).map((x) => x | 0);
    }
    m.IsValid = autosaveHooks.campaignExists(m.Campaign.Path);
    for (const pn of (Array.isArray(node.Players) ? node.Players : []) as Record<string, unknown>[]) {
      const guns = (Array.isArray(pn.Guns) ? pn.Guns : []) as string[];
      m.Players.push({
        Guns: Array.from({ length: MAX_WEAPONS }, (_, i) => (guns[i] && guns[i].length > 0 ? guns[i] : null)),
        ammo: Array.isArray(pn.Ammo) ? (pn.Ammo as number[]).map((x) => x | 0) : [],
        Lives: typeof pn.Lives === 'number' ? pn.Lives : 0,
        HP: typeof pn.HP === 'number' ? pn.HP : 0,
        Score: typeof pn.Score === 'number' ? pn.Score : 0,
      });
    }
    AutosaveAddCampaign(m);
  }
  if (version >= 3 && typeof root.LastCampaignIndex === 'number') gAutosave.LastCampaignIndex = root.LastCampaignIndex;
}
export function AutosaveSaveText(): string {
  return JSON.stringify({
    Version: VERSION,
    LastCampaignIndex: gAutosave.LastCampaignIndex,
    Missions: gAutosave.Campaigns.map((m) => ({
      Campaign: { Path: m.Campaign.Path },
      NextMission: m.NextMission,
      MissionsCompleted: m.MissionsCompleted,
      Players: m.Players.map((ps) => ({ Guns: ps.Guns.map((g) => g ?? ''), Ammo: ps.ammo, Lives: ps.Lives, HP: ps.HP, Score: ps.Score })),
    })),
  }, null, '\t');
}
function FindCampaign(path: string | null): { cs: CampaignSave; idx: number } | null {
  if (!path) return null;
  const idx = gAutosave.Campaigns.findIndex((m) => m.Campaign.Path === path);
  return idx >= 0 ? { cs: gAutosave.Campaigns[idx], idx } : null;
}
export function AutosaveAdd(ce: CampaignEntry, missionIndex: number, nextMission: number, playerDatas: PlayerData[]): void {
  const ms: CampaignSave = { Campaign: { ...ce }, NextMission: nextMission, MissionsCompleted: [missionIndex], Players: [], IsValid: true };
  for (const pd of playerDatas) {
    ms.Players.push({
      Guns: Array.from({ length: MAX_WEAPONS }, (_, i) => (pd.guns[i] ? pd.guns[i]!.name : null)),
      ammo: [...pd.ammo], Lives: pd.Lives, HP: pd.HP, Score: pd.Totals.Score,
    });
  }
  AutosaveAddCampaign(ms);
}
export function AutosaveAddCampaign(cs: CampaignSave): void {
  let found = FindCampaign(cs.Campaign.Path);
  if (found) {
    gAutosave.LastCampaignIndex = found.idx;
  } else {
    gAutosave.Campaigns.push({ Campaign: cs.Campaign, NextMission: 0, MissionsCompleted: [], Players: [], IsValid: true });
    gAutosave.LastCampaignIndex = gAutosave.Campaigns.length - 1;
    found = { cs: gAutosave.Campaigns[gAutosave.LastCampaignIndex], idx: gAutosave.LastCampaignIndex };
  }
  const e = found.cs;
  e.NextMission = cs.NextMission;
  for (const mi of cs.MissionsCompleted) if (!e.MissionsCompleted.includes(mi)) e.MissionsCompleted.push(mi);
  e.MissionsCompleted.sort((a, b) => a - b);
  e.Players = cs.Players;
  e.Campaign = cs.Campaign;
  e.IsValid = cs.IsValid;
}
export function AutosaveGetCampaign(path: string): CampaignSave | null {
  return FindCampaign(path)?.cs ?? null;
}
export function AutosaveGetLastCampaign(): CampaignSave | null {
  const i = gAutosave.LastCampaignIndex;
  return i < 0 || i >= gAutosave.Campaigns.length ? null : gAutosave.Campaigns[i];
}
export function PlayerSavesApply(saves: PlayerSave[], weaponPersist: boolean): void {
  for (let i = 0, idx = 0; i < gPlayerDatas.length && idx < saves.length; i++, idx++) {
    const p = gPlayerDatas[i];
    if (!p.IsLocal) {
      idx--;
      continue;
    }
    const ps = saves[idx];
    if (weaponPersist) {
      for (let j = 0; j < MAX_WEAPONS; j++) if (ps.Guns[j] != null) PlayerAddWeapon(p, StrWeaponClass(ps.Guns[j]));
      PlayerAddMinimalWeapons(p);
      p.ammo = [...ps.ammo];
    }
    if (ps.Lives > 0) PlayerSetLives(p, ps.Lives);
    if (ps.HP > 0) p.HP = ps.HP;
    if (ps.Score > 0) p.Totals.Score = ps.Score;
  }
}
