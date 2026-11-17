// No Gravity port (GPL-3.0-or-later; translated in 2026 by the freegames project from realtech VR's
// No Gravity 2.0, GPL-2.0-or-later; LICENSE.md): the files the original keeps in the player's
// directory (~/.local/share/realtech/nogravity on Linux): the pilots nogravity.pts, the hall of fame
// nogravity.hsc and the settings nogravity.ini, in the original's formats, kept in the player's account.
import { packSaves, unpackSaves, saveGameInfo, readGameConfig, highScoresReset, rosterReset } from './data.ts';
import { conPrint } from './console.ts';
import { gamma, setGamma } from './menu.ts';
import { G } from './state.ts';

export const PTS = 'nogravity.pts', HSC = 'nogravity.hsc', INI = 'nogravity.ini';
export const persist = {
  /** the host's storage (the website's account storage) */
  put: (_name: string, _data: Uint8Array): void => {},
  saveRoster(): void { this.put(PTS, packSaves(G.g_pSaveGames)); },
  saveScores(): void { this.put(HSC, packSaves(G.g_pBestGames)); },
  saveConfig(): void { this.put(INI, new TextEncoder().encode(saveGameInfo(gamma))); },
};
const now = (): number => Math.trunc(Date.now() / 1000);

/** NG_ReadGameConfig, NG_RosterLoad, NG_HighScoresLoad on the files read at start (null: missing) */
export function loadPlayerFiles(files: { pts: Uint8Array | null; hsc: Uint8Array | null; ini: Uint8Array | null }): void {
  const ini = files.ini ? new TextDecoder('latin1').decode(files.ini) : null;
  const r = readGameConfig(ini);
  setGamma(r.gamma);
  if (r.write) persist.saveConfig();
  const roster = files.pts ? unpackSaves(files.pts) : null;
  if (roster) G.g_pSaveGames = roster;
  else { rosterReset(); persist.saveRoster(); conPrint(files.pts ? `${PTS} wrong version` : `${PTS} not found.`); }
  const best = files.hsc ? unpackSaves(files.hsc) : null;
  if (best) G.g_pBestGames = best;
  else { highScoresReset(now()); persist.saveScores(); conPrint(files.hsc ? `${HSC} wrong version` : `${HSC} not found`); }
}
