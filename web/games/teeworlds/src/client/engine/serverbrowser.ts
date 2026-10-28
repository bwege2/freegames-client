// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: engine/serverbrowser.h of Teeworlds 0.7.5 in TypeScript: only the server info of the server the client
// is on (NETMSG_SERVERINFO); there is no server browser.

export const FLAG_PASSWORD = 1, FLAG_PURE = 2, FLAG_PUREMAP = 4, FLAG_TIMESCORE = 8;

export class CServerInfo {
  static readonly LEVEL_CASUAL = 0;
  static readonly LEVEL_NORMAL = 1;
  static readonly LEVEL_COMPETITIVE = 2;
  m_MaxClients = 0;
  m_NumClients = 0;
  m_MaxPlayers = 0;
  m_NumPlayers = 0;
  m_Flags = 0;
  m_ServerLevel = 0;
  m_Favorite = false;
  m_Latency = 0;
  m_aGameType = '';
  m_aName = '';
  m_aHostname = '';
  m_aMap = '';
  m_aVersion = '';
  m_aAddress = '';
}

/** str_clean_whitespaces: no leading or trailing whitespace, every run of whitespace one space */
export function str_clean_whitespaces(s: string): string {
  return s.split(/[ \t\n\r]+/).filter((w) => w !== '').join(' ');
}
