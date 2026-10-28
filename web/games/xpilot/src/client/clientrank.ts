// clientrank.c: the personal kill/death ranking of the clientRanker option. The score file (an array
// of C structs in the original) is kept as JSON in the player's storage; the two HTML pages are
// written there as text (README.md).
import { sys } from './sys.ts';
import { sprintf, onReset } from './cutil.ts';
import { warn } from './error.ts';
import { R } from './default.ts';

const MAX_SCORES = 300;
interface ScoreNode { nick: string; kills: number; deaths: number; timestamp: number }

const C = {
  scores: [] as ScoreNode[], recent: new Array<number>(10).fill(0), oldest_cache: 0, timesort: [] as number[],
  kd: [] as number[], kdsort: [] as number[], client_Scoring: false,
};
onReset(() => Object.assign(C, { scores: [], recent: new Array<number>(10).fill(0), oldest_cache: 0, timesort: [], kd: [], kdsort: [], client_Scoring: false }));

function Time_Sort(): void {
  const t = C.timesort;
  for (let i = 0; i < MAX_SCORES; i++) {
    for (let j = i + 1; j < MAX_SCORES; j++) {
      if (C.scores[t[i]].timestamp < C.scores[t[j]].timestamp) [t[i], t[j]] = [t[j], t[i]];
    }
  }
  for (let i = 0; i < 10; i++) C.recent[i] = t[i];
  C.oldest_cache = 5;
}

const LegalizeName = (s: string) => s.replace(/[<>\t]/g, '?');

async function Rank_score(): Promise<void> {
  const header = '<html><head><title>Xpilot Clientrank - Evolved by Mara</title>\n'
    + '<SCRIPT language="Javascript">\n<!-- Hide script\n'
    + 'function g(nick, kills, deaths, ratio) {\n'
    + "document.write('<tr><td align=left><tt>', i, '</tt></td>');\n"
    + "document.write('<td align=left><b>', nick, '</b></td>');\n"
    + "document.write('<td align=right>', kills, '</td>');\n"
    + "document.write('<td align=right>', deaths, '</td>');\n"
    + "document.write('</td>');\n"
    + "document.write('<td align=right>', ratio, '</td>');\n"
    + "document.write('</tr>\\n');\n"
    + 'i = i + 1\n}\n// Hide script --></SCRIPT>\n</head><body>\n'
    + '<h1>XPilot Clientrank - Evolved by Mara</h1>'
    + '<noscript><blink><h1>YOU MUST HAVE JAVASCRIPT FOR THIS PAGE</h1></blink>'
    + 'Please go <A href="index_nojs.html">here</A> for the non-js page</noscript>\n'
    + '<table><tr><td></td><td align=left><h1><u><b>Player</b></u></h1></td>'
    + '<td align=right><h1><u><b>Kills</b></u></h1></td><td align=right><h1><u><b>Deaths</b></u></h1></td>'
    + '<td align=right><h1><u><b>Ratio</b></u></h1></td></tr>\n<SCRIPT language="Javascript">\nvar i = 1\n';
  const headernojs = '<html><head><title>XPilot Clientrank - Evolved by Mara</title>\n</head><body>\n<h1>XPilot Clientrank</h1>'
    + '<table><tr><td></td><td align=left><h1><u><b>Player</b></u></h1></td><td align=right><h1><u><b>Kills</b></u></h1></td>'
    + '<td align=right><h1><u><b>Deaths</b></u></h1></td><td align=right><h1><u><b>Ratio</b></u></h1></td></tr>\n';
  const footer = '</table><i>Explanation for rank</i>:<br>The numbers are k/d/r, where<br>k = The number of times he has shot me<br>'
    + 'd = The number of time I have shot him<br>r = the quota between k and d<br></body></html>';
  for (let i = 0; i < MAX_SCORES; i++) {
    C.kdsort[i] = i;
    C.kd[i] = C.scores[i].deaths !== 0 ? C.scores[i].kills / C.scores[i].deaths : 0.0;
  }
  for (let i = 0; i < MAX_SCORES; i++) {
    for (let j = i + 1; j < MAX_SCORES; j++) {
      if (C.kd[i] < C.kd[j]) {
        [C.kdsort[i], C.kdsort[j]] = [C.kdsort[j], C.kdsort[i]];
        [C.kd[i], C.kd[j]] = [C.kd[j], C.kd[i]];
      }
    }
  }
  const pad = '\0'.repeat(2000);
  if (R.clientRankHTMLFile.length > 0) {
    let out = pad + header;
    for (let i = 0; i < MAX_SCORES; i++) {
      const s = C.scores[C.kdsort[i]];
      if (s.nick !== '') {
        s.nick = LegalizeName(s.nick);
        out += sprintf('g("%s", %u, %u, %.3f);\n', s.nick, s.kills, s.deaths, C.kd[i]);
      }
    }
    await sys.writeFile(R.clientRankHTMLFile, out + '</script>' + footer);
  }
  if (R.clientRankHTMLNOJSFile.length > 0) {
    let out = pad + headernojs;
    for (let i = 0; i < MAX_SCORES; i++) {
      const s = C.scores[C.kdsort[i]];
      if (s.nick !== '') {
        s.nick = LegalizeName(s.nick);
        out += sprintf('<tr><td align=left><tt>%d</tt><td align=left><b>%s</b><td align=right>%u<td align=right>%u<td align=right>%.3f</tr>\n',
          i + 1, s.nick, s.kills, s.deaths, C.kd[i]);
      }
    }
    await sys.writeFile(R.clientRankHTMLNOJSFile, out + footer);
  }
  if (R.clientRankHTMLFile.length === 0 && R.clientRankHTMLNOJSFile.length === 0) {
    warn('You have not specified clientRankHTMLFile or clientRankHTMLNOJSFile.');
  }
}

const newNode = (nick: string): ScoreNode => ({ nick, kills: 0, deaths: 0, timestamp: 0 });

export async function Init_saved_scores(): Promise<void> {
  let i = 0;
  C.scores = [];
  C.timesort = [];
  if (R.clientRankFile.length > 0) {
    const text = await sys.readFile(R.clientRankFile);
    if (text !== null) {
      let read: ScoreNode[] = [];
      try {
        read = (JSON.parse(text) as ScoreNode[]).slice(0, MAX_SCORES);
      } catch {
        read = [];
      }
      if (read.length !== MAX_SCORES) warn('Error when reading score file!\n');
      for (const s of read) C.scores[i++] = { nick: String(s.nick), kills: s.kills >>> 0, deaths: s.deaths >>> 0, timestamp: Number(s.timestamp) || 0 };
    }
    C.client_Scoring = true;
  }
  while (i < MAX_SCORES) {
    C.scores[i] = newNode('');
    C.timesort[i] = i;
    i++;
  }
  for (let k = 0; k < MAX_SCORES; k++) if (C.timesort[k] === undefined) C.timesort[k] = 0;
  if (C.client_Scoring) Time_Sort();
}

function Get_saved_score(nick: string): number {
  let oldest = 0;
  for (let i = 0; i < MAX_SCORES; i++) {
    if (nick === C.scores[i].nick) return i;
    if (C.scores[i].timestamp < C.scores[oldest].timestamp) oldest = i;
  }
  C.scores[oldest] = newNode(nick);
  C.scores[oldest].timestamp = sys.time();
  return oldest;
}

function Find_player(nick: string): number {
  for (let i = 0; i < 10; i++) if (nick === C.scores[C.recent[i]].nick) return i;
  const k = Get_saved_score(nick);
  C.recent[C.oldest_cache] = k;
  const i = C.oldest_cache;
  C.oldest_cache = Math.trunc((C.oldest_cache + 1) / 10);
  return i;
}

export function Add_rank_Kill(nick: string): void {
  if (!C.scores.length) return;
  const i = Find_player(nick);
  C.scores[C.recent[i]].kills++;
  C.scores[C.recent[i]].timestamp = sys.time();
}

export function Add_rank_Death(nick: string): void {
  if (!C.scores.length) return;
  const i = Find_player(nick);
  C.scores[C.recent[i]].deaths++;
  C.scores[C.recent[i]].timestamp = sys.time();
}

export async function Print_saved_scores(): Promise<void> {
  await Rank_score();
  if (R.clientRankFile.length > 0) {
    if (!(await sys.writeFile(R.clientRankFile, JSON.stringify(C.scores)))) warn('Error when writing score file!\n');
  }
}
