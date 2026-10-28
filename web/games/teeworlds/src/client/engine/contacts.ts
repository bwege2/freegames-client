// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: engine/contacts.h and engine/client/contacts.cpp of Teeworlds 0.7.5 in TypeScript: the friends and the
// ignored players (one class, kind "friend" or "ignore"), kept in settings.cfg as add_friend / add_ignore lines.
import { str_copy, str_quickhash } from '../../base/system.ts';
import { CFGFLAG_CLIENT, type CConfig } from '../../generated/config.ts';
import { MAX_CLAN_LENGTH, MAX_NAME_LENGTH } from '../../engine/shared/protocol.ts';
import type { CConsole } from './console.ts';

export const CONTACT_NO = 0, CONTACT_CLAN = 1, CONTACT_PLAYER = 2, MAX_CONTACTS = 128;

export interface CContactInfo { m_aName: string; m_aClan: string; m_NameHash: number; m_ClanHash: number }

export class CContacts {
  private m_aContacts: CContactInfo[] = [];
  private kind: 'friend' | 'ignore';
  private console: CConsole;

  constructor(_config: CConfig, console: CConsole, kind: 'friend' | 'ignore') {
    this.console = console;
    this.kind = kind;
  }

  OnConsoleInit(): void {
    if (this.kind === 'friend') {
      this.console.Register('add_friend', 's[name] s[clan]', CFGFLAG_CLIENT, (r) => this.AddContact(r.GetString(0), r.GetString(1)), this, 'Add a friend');
      this.console.Register('remove_friend', 's[name] s[clan]', CFGFLAG_CLIENT, (r) => this.RemoveContact(r.GetString(0), r.GetString(1)), this, 'Remove a friend');
    } else {
      this.console.Register('add_ignore', 's[name] s[clan]', CFGFLAG_CLIENT, (r) => this.AddContact(r.GetString(0), r.GetString(1)), this, 'Ignore a player');
      this.console.Register('remove_ignore', 's[name] s[clan]', CFGFLAG_CLIENT, (r) => this.RemoveContact(r.GetString(0), r.GetString(1)), this, 'Stop ignoring a player');
    }
  }

  NumContacts(): number { return this.m_aContacts.length; }
  NumFriends(): number { return this.m_aContacts.length; }
  GetContact(Index: number): CContactInfo { return this.m_aContacts[Math.max(0, Index % this.m_aContacts.length)]; }
  GetFriend(Index: number): CContactInfo { return this.GetContact(Index); }

  GetContactState(pName: string, pClan: string): number {
    let Result = CONTACT_NO;
    const NameHash = str_quickhash(pName), ClanHash = str_quickhash(pClan);
    for (const c of this.m_aContacts) {
      if (c.m_ClanHash === ClanHash) {
        if (c.m_aName === '') Result = CONTACT_CLAN;
        else if (c.m_NameHash === NameHash) {
          Result = CONTACT_PLAYER;
          break;
        }
      }
    }
    return Result;
  }
  GetFriendState(pName: string, pClan: string): number { return this.GetContactState(pName, pClan); }

  IsContact(pName: string, pClan: string, PlayersOnly: boolean): boolean {
    const NameHash = str_quickhash(pName), ClanHash = str_quickhash(pClan);
    return this.m_aContacts.some((c) => c.m_ClanHash === ClanHash && ((!PlayersOnly && c.m_aName === '') || c.m_NameHash === NameHash));
  }
  IsFriend(pName: string, pClan: string, PlayersOnly: boolean): boolean { return this.IsContact(pName, pClan, PlayersOnly); }
  IsIgnored(pName: string, pClan: string, PlayersOnly: boolean): boolean { return this.IsContact(pName, pClan, PlayersOnly); }

  AddContact(pName: string, pClan: string): void {
    if (this.m_aContacts.length === MAX_CONTACTS || (pName === '' && pClan === '')) return;
    const NameHash = str_quickhash(pName), ClanHash = str_quickhash(pClan);
    if (this.m_aContacts.some((c) => c.m_NameHash === NameHash && c.m_ClanHash === ClanHash)) return;
    this.m_aContacts.push({ m_aName: str_copy(pName, MAX_NAME_LENGTH), m_aClan: str_copy(pClan, MAX_CLAN_LENGTH), m_NameHash: NameHash, m_ClanHash: ClanHash });
  }
  AddFriend(pName: string, pClan: string): void { this.AddContact(pName, pClan); }
  AddIgnoredPlayer(pName: string, pClan: string): void { this.AddContact(pName, pClan); }

  RemoveContact(pName: string, pClan: string): void {
    const NameHash = str_quickhash(pName), ClanHash = str_quickhash(pClan);
    const i = this.m_aContacts.findIndex((c) => c.m_NameHash === NameHash && c.m_ClanHash === ClanHash);
    if (i >= 0) this.m_aContacts.splice(i, 1);
  }
  RemoveFriend(pName: string, pClan: string): void { this.RemoveContact(pName, pClan); }
  RemoveIgnoredPlayer(pName: string, pClan: string): void { this.RemoveContact(pName, pClan); }

  /** ConfigSave: the lines for settings.cfg */
  ConfigSave(WriteLine: (s: string) => void): void {
    const esc = (s: string): string => s.replace(/["\\]/g, (c) => '\\' + c);
    const pCmdStr = this.kind === 'friend' ? 'add_friend ' : 'add_ignore ';
    for (const c of this.m_aContacts) WriteLine(`${pCmdStr}"${esc(c.m_aName)}" "${esc(c.m_aClan)}"`);
  }
}
