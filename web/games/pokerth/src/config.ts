// PokerTH 1.1.2 keeps its settings in ~/.pokerth/config.xml (src/config/configfile.cpp); the port keeps the
// entries it uses in the same XML form in the player's server storage (file "config.xml"), with the
// original's defaults. AGPL-3.0-or-later, see ../LICENSE.md.
import type { Storage } from '../../../src/sdk/index.ts';

export class Config {
  myName = 'Human Player';
  numberOfPlayers = 10;
  startCash = 5000;
  firstSmallBlind = 10;
  raiseOnMinutes = false;
  raiseEveryHands = 8;
  raiseEveryMinutes = 5;
  alwaysDoubleBlinds = true;
  manualBlinds: number[] = [];
  afterMB: 'd' | 'r' | 's' = 'd';
  afterMBRaiseValue = 0;
  gameSpeed = 4;
  playSoundEffects = true;
  // online games ("Net..." entries)
  netNumberOfPlayers = 10;
  netStartCash = 3000;
  netTimeOutPlayerAction = 20;
  netDelayBetweenHands = 7;
}

const INTS: [keyof Config, string][] = [
  ['numberOfPlayers', 'NumberOfPlayers'], ['startCash', 'StartCash'], ['firstSmallBlind', 'FirstSmallBlind'],
  ['raiseEveryHands', 'RaiseSmallBlindEveryHands'], ['raiseEveryMinutes', 'RaiseSmallBlindEveryMinutes'],
  ['afterMBRaiseValue', 'AfterMBAlwaysRaiseValue'], ['gameSpeed', 'GameSpeed'], ['netNumberOfPlayers', 'NetNumberOfPlayers'],
  ['netStartCash', 'NetStartCash'], ['netTimeOutPlayerAction', 'NetTimeOutPlayerAction'], ['netDelayBetweenHands', 'NetDelayBetweenHands'],
];

const xmlEsc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export function configToXml(c: Config): string {
  const lines = ['<?xml version="1.0" encoding="UTF-8" ?>', '<PokerTH>', '  <Configuration>'];
  const add = (name: string, v: string | number) => lines.push(`    <${name} value="${xmlEsc(String(v))}" />`);
  add('MyName', c.myName);
  for (const [k, n] of INTS) add(n, c[k] as number);
  add('RaiseBlindsAtHands', c.raiseOnMinutes ? 0 : 1);
  add('RaiseBlindsAtMinutes', c.raiseOnMinutes ? 1 : 0);
  add('AlwaysDoubleBlinds', c.alwaysDoubleBlinds ? 1 : 0);
  add('ManualBlindsOrder', c.alwaysDoubleBlinds ? 0 : 1);
  add('AfterMBAlwaysDoubleBlinds', c.afterMB === 'd' ? 1 : 0);
  add('AfterMBAlwaysRaiseAbout', c.afterMB === 'r' ? 1 : 0);
  add('AfterMBStayAtLastBlind', c.afterMB === 's' ? 1 : 0);
  add('PlaySoundEffects', c.playSoundEffects ? 1 : 0);
  lines.push('    <ManualBlindsList type="list">');
  for (const b of c.manualBlinds) lines.push(`      <Blind value="${b}" />`);
  lines.push('    </ManualBlindsList>', '  </Configuration>', '</PokerTH>', '');
  return lines.join('\n');
}

export function configFromXml(xml: string): Config {
  const c = new Config();
  const get = (name: string): string | null => {
    const m = new RegExp(`<${name} value="([^"]*)"`).exec(xml);
    return m ? m[1].replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&') : null;
  };
  const name = get('MyName');
  if (name) c.myName = name.slice(0, 20);
  for (const [k, n] of INTS) {
    const v = Number(get(n));
    if (get(n) !== null && Number.isFinite(v)) (c as unknown as Record<string, number>)[k] = Math.trunc(v);
  }
  c.raiseOnMinutes = get('RaiseBlindsAtMinutes') === '1';
  c.alwaysDoubleBlinds = get('AlwaysDoubleBlinds') !== '0';
  c.afterMB = get('AfterMBAlwaysRaiseAbout') === '1' ? 'r' : get('AfterMBStayAtLastBlind') === '1' ? 's' : 'd';
  c.playSoundEffects = get('PlaySoundEffects') !== '0';
  c.manualBlinds = [...xml.matchAll(/<Blind value="(\d+)"/g)].map((m) => Number(m[1])).slice(0, 30);
  return c;
}

export async function loadConfig(storage: Storage): Promise<Config> {
  const b = await storage.get('config.xml');
  return b ? configFromXml(new TextDecoder().decode(b)) : new Config();
}

export async function saveConfig(storage: Storage, c: Config): Promise<void> {
  await storage.put('config.xml', new TextEncoder().encode(configToXml(c)));
}
