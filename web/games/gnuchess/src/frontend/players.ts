// Port of src/frontend/players.cc of GNU Chess 6.3.0: the player database players.dat (`list`, and the
// result of a game played under `name`).
import { MAXNAMESZ, R_BLACK_WINS, R_DRAW, R_NORESULT, R_WHITE_WINS, black, g, white } from './common.ts';
import { fopenRead, fopenWrite, fprintf, printf } from './stdio.ts';
import { sscanf } from '../libc.ts';

const PLAYERFILE = 'players.dat';
const MAXPLAYERS = 500;

interface playerentry {
  player: string;
  wins: number;
  losses: number;
  draws: number;
}

let totalplayers = 0;
let playerdb: playerentry[] = [];
const blank = (): playerentry => ({ player: '', wins: 0, losses: 0, draws: 0 });

export function playersReset(): void {
  totalplayers = 0;
  playerdb = Array.from({ length: MAXPLAYERS }, blank);
}
playersReset();

/** C's int division (the scores are ints); a division by zero would end the C program (SIGFPE) */
const idiv = (a: number, b: number): number => {
  if (b === 0) throw new Error('Floating point exception');
  return Math.trunc(a / b);
};

function rscorecompare(a: playerentry, b: playerentry): number {
  // float ascore = (int expression): the int quotient converted to float
  const ascore = idiv(a.wins + idiv(a.draws, 2), a.wins + a.draws + a.losses);
  const bscore = idiv(b.wins + idiv(b.draws, 2), b.wins + b.draws + b.losses);
  if (ascore > bscore) return -1;
  else if (bscore > ascore) return 1;
  else return 0;
}

function scorecompare(a: playerentry, b: playerentry): number {
  const ascore = idiv(100 * (a.wins + idiv(a.draws, 2)), a.wins + a.draws + a.losses);
  const bscore = idiv(100 * (b.wins + idiv(b.draws, 2)), b.wins + b.draws + b.losses);
  if (bscore > ascore) return 1;
  else if (bscore < ascore) return -1;
  else return 0;
}

function namecompare(a: playerentry, b: playerentry): number {
  if (a.player > b.player) return 1;
  else if (a.player < b.player) return -1;
  else return 0;
}

/** qsort(): glibc's is a merge sort for these sizes, so it is stable, as Array.prototype.sort is */
function qsort(cmp: (a: playerentry, b: playerentry) => number): void {
  const head = playerdb.slice(0, totalplayers).sort(cmp);
  for (let i = 0; i < totalplayers; i++) playerdb[i] = head[i];
}

export function DBSortPlayer(style: string): void {
  if (style.startsWith('score')) qsort(scorecompare);
  else if (style.startsWith('name')) qsort(namecompare);
  else if (style.startsWith('reverse')) qsort(rscorecompare);
}

export function DBListPlayer(style: string): void {
  DBReadPlayer();
  DBSortPlayer(style);
  for (let i = 0; i < totalplayers; i++) {
    const p = playerdb[i];
    printf('%s %2.0f%% %d %d %d\n', p.player, (100.0 * (p.wins + Math.fround(p.draws) / 2)) / (p.wins + p.draws + p.losses), p.wins, p.losses, p.draws);
    // getchar() here waits for a key at the terminal; the port goes on (README)
    if ((i + 1) % 10 === 0) printf('[Type a character to continue.]\n');
  }
}

export function DBWritePlayer(): void {
  DBSortPlayer('reverse');
  const wfp = fopenWrite(PLAYERFILE, 'w');
  if (wfp !== null) {
    for (let i = 0; i < totalplayers; i++) {
      const p = playerdb[i];
      fprintf(wfp, '%s %d %d %d\n', p.player, p.wins, p.losses, p.draws);
    }
  }
}

export function DBReadPlayer(): void {
  totalplayers = 0;
  const rfp = fopenRead(PLAYERFILE);
  if (rfp !== null) {
    // while (!feof(rfp)) fscanf(rfp, "%49s %d %d %d\n", ...): the trailing \n eats all whitespace
    let rest = rfp.readAll();
    while (rest.length > 0) {
      const { values, consumed } = fscan(rest);
      if (values.length === 4 && totalplayers < MAXPLAYERS) {
        const p = playerdb[totalplayers];
        p.player = values[0] as string;
        p.wins = values[1] as number;
        p.losses = values[2] as number;
        p.draws = values[3] as number;
        totalplayers++;
      }
      if (consumed === 0) break;
      rest = rest.slice(consumed);
    }
  }
}

/** fscanf(fp, "%49s %d %d %d\n") on the rest of the file: the values and how much it read */
function fscan(s: string): { values: (string | number)[]; consumed: number } {
  let i = 0;
  const ws = (): void => {
    while (i < s.length && /\s/.test(s[i])) i++;
  };
  const values: (string | number)[] = [];
  ws();
  let j = i;
  while (j < s.length && !/\s/.test(s[j]) && j - i < MAXNAMESZ - 1) j++;
  if (j === i) return { values, consumed: s.length };
  values.push(s.slice(i, j));
  i = j;
  for (let k = 0; k < 3; k++) {
    ws();
    const m = /^[+-]?\d+/.exec(s.slice(i));
    if (!m) return { values, consumed: i || s.length };
    values.push(sscanf(m[0], '%d').values[0] as number);
    i += m[0].length;
  }
  ws();
  return { values, consumed: i };
}

export function DBSearchPlayer(player: string): number {
  for (let i = 0; i < totalplayers; i++) {
    const name = playerdb[i].player;
    if (player.slice(0, name.length) === name) return i;
  }
  return -1;
}

export function DBUpdatePlayer(player: string, resultstr: string): void {
  let result = R_NORESULT;
  /* the name without spaces (lname) */
  const lname = player.split(' ').join('');
  playersReset();
  DBReadPlayer();
  let index = DBSearchPlayer(lname);
  if (index === -1) {
    const p = playerdb[totalplayers];
    p.player = lname;
    p.wins = 0;
    p.losses = 0;
    p.draws = 0;
    index = totalplayers;
    totalplayers++;
  }
  if (resultstr.startsWith('1-0')) result = R_WHITE_WINS;
  else if (resultstr.startsWith('0-1')) result = R_BLACK_WINS;
  else if (resultstr.startsWith('1/2-1/2')) result = R_DRAW;
  if ((g.computerplays === white && result === R_WHITE_WINS) || (g.computerplays === black && result === R_BLACK_WINS)) playerdb[index].wins++;
  else if ((g.computerplays === white && result === R_BLACK_WINS) || (g.computerplays === black && result === R_WHITE_WINS)) playerdb[index].losses++;
  /* Shouln't one check for draw here? Broken PGN files surely exist */
  else playerdb[index].draws++;
  DBWritePlayer();
}
