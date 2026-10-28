// Port of src/frontend/pgn.cc of GNU Chess 6.3.0: saving a game as PGN (pgnsave, and game.log on every
// remove) and reading one (pgnload, pgnreplay).
import { Game, black, g, white } from './common.ts';
import { PROGRAM } from './version.ts';
import { InitVars } from './init.ts';
import { ShowBoard } from './output.ts';
import { DEST_GAME, pgn, setYyin, yylex } from './lexpgn.ts';
import { fopenRead, fopenWrite, fprintf, printf, stdio } from './stdio.ts';

const VERSION = '6.3.0';
const NULL2EMPTY = (x: string | null): string => x ?? '';

/** To save a game into PGN format to a file, if the file does not exist. If it exists, the user is told. */
export function PGNSaveToFile(file: string, resultstr: string): void {
  if (fopenRead(file)) {
    printf("File '%s' already exists. Please delete it first, or choose a different file name.\n", file);
    return;
  }
  const fp = fopenWrite(file, 'w');
  if (fp === null) {
    printf('Cannot write to file %s\n', file);
    return;
  }

  /* Write the seven tags */
  fprintf(fp, '[Event "%s"]\n', NULL2EMPTY(pgn.pgn_event));
  fprintf(fp, '[Site "%s"]\n', NULL2EMPTY(pgn.pgn_site));
  const secs = stdio.clock.time();
  if (pgn.pgn_date) fprintf(fp, '[Date "%s"]\n', pgn.pgn_date);
  else {
    const [year, mon, mday] = localtime(secs);
    fprintf(fp, '[Date "%4d.%02d.%02d"]\n', year, mon + 1, mday);
  }
  fprintf(fp, '[Round "%s"]\n', NULL2EMPTY(pgn.pgn_round));

  if (pgn.pgn_white) fprintf(fp, '[White "%s"]\n', pgn.pgn_white);
  else if (g.computer === white) fprintf(fp, '[White "%s %s"]\n', PROGRAM, VERSION);
  else fprintf(fp, '[White "%s"]\n', g.name);

  if (pgn.pgn_black) fprintf(fp, '[Black "%s"]\n', pgn.pgn_black);
  else if (g.computer === black) fprintf(fp, '[Black "%s %s"]\n', PROGRAM, VERSION);
  else fprintf(fp, '[Black "%s"]\n', g.name);

  if (pgn.pgn_whiteELO) fprintf(fp, '[WhiteELO "%s"]\n', NULL2EMPTY(pgn.pgn_white));
  else fprintf(fp, '[WhiteELO "%d"]\n', g.computer === white ? g.myrating : g.opprating);

  if (pgn.pgn_blackELO) fprintf(fp, '[BlackELO "%s"]\n', NULL2EMPTY(pgn.pgn_black));
  else fprintf(fp, '[BlackELO "%d"]\n', g.computer === white ? g.opprating : g.myrating);

  if (pgn.pgn_result) fprintf(fp, '[Result "%s"]\n', pgn.pgn_result);
  else {
    /* Revive the little-known standard functions! */
    let len = 0;
    while (len < resultstr.length && resultstr[len] !== ' ' && resultstr[len] !== '{') len++;
    fprintf(fp, '[Result "%.*s"]\n', len, resultstr);
  }

  if (pgn.pgn_othertags) fprintf(fp, '%s', pgn.pgn_othertags);

  fprintf(fp, '\n');

  if (pgn.initial_comments) {
    fprintf(fp, '\n%s\n', pgn.initial_comments);
    /* If it doesn't end in \n, add it */
    if (pgn.initial_comments[0] && pgn.initial_comments[pgn.initial_comments.length - 1] !== '\n') fprintf(fp, '\n');
  }

  let s = '';
  for (let i = 0; i <= g.GameCnt; i++) {
    if (!(i % 2)) s += String(Math.trunc(i / 2) + 1) + '. ';
    s += Game[i].SANmv;
    s += ' ';
    if (s.length > 80) {
      let p = 79;
      while (s[p--] !== ' ');
      ++p; // *++p = '\0'
      fprintf(fp, '%s\n', s.slice(0, p));
      s = s.slice(p + 1);
    }
    const comments = Game[i].comments;
    if (comments) {
      fprintf(fp, '%s\n', s);
      fprintf(fp, '%s', comments);
      if (comments[0] && comments[comments.length - 1] !== '\n') fprintf(fp, '\n');
      s = '';
    }
  }
  fprintf(fp, '%s', s);
  fprintf(fp, '%s', resultstr);
  fprintf(fp, '\n\n');
}

/** localtime(): [year, month 0-11, day]; the process sets the time zone (stdio.localtime) */
function localtime(secs: number): [number, number, number] {
  return localtimeHook.fn(secs);
}
export const localtimeHook = {
  fn: (secs: number): [number, number, number] => {
    const d = new Date(secs * 1000);
    return [d.getFullYear(), d.getMonth(), d.getDate()];
  },
};

/** To read a game from a PGN file. */
export function PGNReadFromFile(file: string, showheading: number): void {
  const fp = fopenRead(file);
  if (fp === null) {
    printf('Cannot open file %s\n', file);
    return;
  }
  setYyin(() => fp.readAll());
  InitVars();
  pgn.data_dest = DEST_GAME;
  yylex();
  ShowBoard();
  if (showheading) {
    printf('\n--------------------------------------------------\n');
    printf('%s (%s) x %s (%s) - %s\nSite: %s\nDate: %s\n',
      pgn.pgn_white ?? 'Unknown', pgn.pgn_whiteELO ?? 'Unknown',
      pgn.pgn_black ?? 'Unknown', pgn.pgn_blackELO ?? 'Unknown',
      pgn.pgn_result ?? 'Unknown', pgn.pgn_site ?? 'Unknown',
      pgn.pgn_date ?? 'Unknown');
    printf('--------------------------------------------------\n');
  }
}

/* Only players in the table below are permitted into the opening book from the PGN files. */
const trusted_players = [
  'Alekhine', 'Adams', 'Anand', 'Anderssen', 'Andersson', 'Aronin', 'Averbakh', 'Balashov', 'Beliavsky', 'Benko',
  'Bernstein', 'Bird', 'Bogoljubow', 'Bolbochan', 'Boleslavsky', 'Byrne', 'Botvinnik', 'Bronstein', 'Browne',
  'Capablanca', 'Chigorin', 'Christiansen', 'De Firmian', 'Deep Blue', 'Deep Thought', 'Donner', 'Dreev', 'Duras',
  'Euwe', 'Evans', 'Filip', 'Fine', 'Fischer', 'Flohr', 'Furman', 'Gelfand', 'Geller', 'Gereben', 'Glek', 'Gligoric',
  'GNU', 'Golombek', 'Gruenfeld', 'Guimard', 'Hodgson', 'Ivanchuk', 'Ivkov', 'Janowsky', 'Kamsky', 'Kan', 'Karpov',
  'Kasparov', 'Keres', 'Korchnoi', 'Kortschnoj', 'Kotov', 'Kramnik', 'Kupreich', 'Lasker', 'Lautier', 'Letelier',
  'Lilienthal', 'Ljubojevic', 'Marshall', 'Maroczy', 'Mieses', 'Miles', 'Morphy', 'Mueller', 'Nimzowitsch', 'Nunn',
  'Opocensky', 'Pachman', 'Petrosian', 'Piket', 'Pilnik', 'Pirc', 'Polgar', 'Portisch', 'Psakhis', 'Ragozin',
  'Reshevsky', 'Reti', 'Romanish', 'Rubinstein', 'Saemisch', 'Seirawan', 'Shirov', 'Short', 'Silman', 'Smyslov',
  'Sokolsky', 'Spassky', 'Sveshnikov', 'Stahlberg', 'Steinitz', 'Tal', 'Tarjan', 'Tartakower', 'Timman', 'Topalov',
  'Torre', 'Vidmar',
];

/** Return 1 if name in trusted_players list, else 0 (unused by GNU Chess 6) */
export function IsTrustedPlayer(name: string): number {
  for (const p of trusted_players) if (name.includes(p)) return 1;
  return 0;
}
