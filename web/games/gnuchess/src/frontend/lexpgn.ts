// Port of src/frontend/lexpgn.ll of GNU Chess 6.3.0 (lexpgn by David A. Wheeler): the flex scanner that
// reads one game of a PGN file. The package ships flex 2.5.35's output (lexpgn.cc); this is a scanner
// with the same rules and the same flex semantics: in the current start condition the longest match
// wins, ties go to the earlier rule; characters no rule matches are echoed to stdout (flex's default
// rule); the start condition and any input left unread stay for the next call; at end of input the
// buffer is reset (yyrestart) and the next call reads the file then in yyin.
import { Game, R_BLACK_WINS, R_DRAW, R_NORESULT, R_WHITE_WINS, Tree, board, g, white } from './common.ts';
import { MakeMove, ValidateMove } from './move.ts';
import { ParseEPD } from './epd.ts';
import { printf } from './stdio.ts';
import { sscanf } from '../libc.ts';

export const DEST_TRASH = 0, DEST_GAME = 1, DEST_BOOK = 2;

/** the PGN tags of the game (pgn_*), its comments, and data_dest (lexpgn.h) */
export const pgn = {
  data_dest: DEST_TRASH,
  initial_comments: null as string | null,
  pgn_event: null as string | null,
  pgn_site: null as string | null,
  pgn_date: null as string | null,
  pgn_round: null as string | null,
  pgn_white: null as string | null,
  pgn_black: null as string | null,
  pgn_whiteELO: null as string | null,
  pgn_blackELO: null as string | null,
  pgn_result: null as string | null,
  pgn_othertags: null as string | null,
};

const NO_TAG = 0, EVENT_TAG = 1, SITE_TAG = 2, DATE_TAG = 3, ROUND_TAG = 4, WHITE_TAG = 5, BLACK_TAG = 6;
const RESULT_TAG = 7, WHITE_ELO_TAG = 8, BLACK_ELO_TAG = 9, WHITETITLE_TAG = 10, BLACKTITLE_TAG = 11;
const FEN_TAG = 12, OTHER_TAG = 13;

function append_str(dest: string | null, s: string): string {
  return dest === null ? s : dest + s;
}

/** Append PGN text t after the current move */
function append_comment(t: string): void {
  if (pgn.data_dest === DEST_GAME) {
    if (g.GameCnt < 1) pgn.initial_comments = append_str(pgn.initial_comments, t);
    else Game[g.GameCnt].comments = append_str(Game[g.GameCnt].comments, t);
  }
}

// start conditions
const INITIAL = 0, tag_gobble = 1, tagsymbol = 2, tagsep = 3, tagdata = 4, tagend = 5, bracecomment = 6, RAV = 7;

const SPACE = '[ \\t\\n\\r\\f]';
const NONSPACE = '[^ \\t\\n\\r\\f]';

interface Rule {
  re: RegExp;
  bol?: boolean; // the pattern starts with ^
  act: number;
}
const rule = (src: string, act: number, bol = false): Rule => ({ re: new RegExp(src, 'iy'), act, bol });

// Actions, numbered in the order of the rules in lexpgn.ll (that order breaks ties).
const A_SPACE = 1, A_ESCAPE = 2, A_TAGOPEN = 3, A_GOBBLE = 4;
const A_T_WHITE = 5, A_T_BLACK = 6, A_T_RESULT = 7, A_T_WHITETITLE = 8, A_T_BLACKTITLE = 9, A_T_FEN = 10;
const A_T_EVENT = 11, A_T_SITE = 12, A_T_DATE = 13, A_T_ROUND = 14, A_T_WHITEELO = 15, A_T_BLACKELO = 16;
const A_T_OTHER = 17, A_T_EMPTY = 18, A_T_EOL = 19, A_T_BAD = 20, A_SEP = 21, A_SEP_BAD = 22;
const A_DATA = 23, A_DATA_END = 24, A_DATA_GARBAGE = 25, A_DATA_EOL = 26, A_TAGEND = 27;
const A_SEMI = 28, A_BRACE = 29, A_BC_TEXT = 30, A_BC_END = 31, A_BC_NL = 32, A_NAG = 33;
const A_RESULT = 34, A_MOVENUM = 35, A_DOTS = 36, A_MOVE = 37, A_RAV = 38, A_RAV_OPEN = 39, A_RAV_CLOSE = 40;
const A_RAV_TEXT = 41, A_RAV_WHITE = 42, A_RAV_BRACKET = 43, A_INVALID = 44;

const rules: Rule[][] = [];
rules[INITIAL] = [
  rule(`${SPACE}+`, A_SPACE),
  rule('\\%[^\\r\\n]*', A_ESCAPE),
  rule('\\[[ \\t]*', A_TAGOPEN),
  rule('\\;[^\\n\\r]*', A_SEMI),
  rule('\\{', A_BRACE),
  rule(`\\$${NONSPACE}*`, A_NAG),
  rule(`\\*${SPACE}*`, A_RESULT),
  rule(`1\\/2-1\\/2${SPACE}*`, A_RESULT),
  rule(`0-1${SPACE}*`, A_RESULT),
  rule(`1-0${SPACE}*`, A_RESULT),
  rule('[1-9][0-9]*\\.?', A_MOVENUM),
  rule('\\.\\.+', A_DOTS),
  rule('[a-z0][a-z0-9\\-=\\+\\#\\?\\!\\,]*', A_MOVE),
  rule('\\(', A_RAV),
  rule('[^\\n]', A_INVALID),
];
rules[tag_gobble] = [rule('[^\\n\\r]*', A_GOBBLE)];
rules[tagsymbol] = [
  rule('white', A_T_WHITE),
  rule('black', A_T_BLACK),
  rule('result', A_T_RESULT),
  rule('whitetitle', A_T_WHITETITLE),
  rule('blacktitle', A_T_BLACKTITLE),
  rule('fen', A_T_FEN),
  rule('event', A_T_EVENT),
  rule('site', A_T_SITE),
  rule('date', A_T_DATE),
  rule('round', A_T_ROUND),
  rule('whiteELO', A_T_WHITEELO),
  rule('blackELO', A_T_BLACKELO),
  rule('[a-z0-9_]+', A_T_OTHER),
  rule('[ \\t]*\\]', A_T_EMPTY),
  rule('[\\n\\r]', A_T_EOL),
  rule('[^\\n]', A_T_BAD),
  rule('[^\\n]', A_INVALID),
];
rules[tagsep] = [rule('[ \\t]+"?', A_SEP), rule('[^\\n]', A_SEP_BAD)];
rules[tagdata] = [
  rule('(?:\\\\"|[^\\n\\r"])*', A_DATA),
  rule('"[ \\t]*\\][\\n\\r]*', A_DATA_END),
  rule('"[^\\n\\r]*', A_DATA_GARBAGE),
  rule('[\\n\\r]', A_DATA_EOL),
  rule('[^\\n]', A_INVALID),
];
rules[tagend] = [rule('[^\\n\\r]*', A_TAGEND)];
rules[bracecomment] = [
  rule('[^\\r\\n}]+(?:\\n+[^\\r\\n}]*)*', A_BC_TEXT),
  rule('\\}', A_BC_END),
  rule('\\n\\r', A_BC_NL),
  rule('\\r\\n', A_BC_NL),
  rule('\\r', A_BC_NL),
  rule('\\n', A_BC_NL),
];
rules[RAV] = [
  rule('\\(', A_RAV_OPEN),
  rule('\\)', A_RAV_CLOSE),
  rule('[^\\(\\)\\[]+', A_RAV_TEXT),
  rule('\\[[wW]hite', A_RAV_WHITE, true),
  rule('\\[', A_RAV_BRACKET),
];

/** the scanner's state that outlives one yylex() call */
const lex = {
  start: INITIAL, // yy_start
  buf: '', // the unread input in flex's buffer
  pos: 0,
  bol: true, // yy_at_bol
  yyin: null as (() => string) | null, // the file in yyin: reading it gives all its (remaining) bytes
  /**
   * YY_BUFFER_EOF_PENDING: a match reached the end of the data, so the scanner looked at the next
   * character, tried to read more and met the end of the file. The next call then ends at once (and
   * yyrestart()s), without reading the file that is in yyin by then.
   */
  eofPending: false,
};

export function lexReset(): void {
  lex.start = INITIAL;
  lex.buf = '';
  lex.pos = 0;
  lex.bol = true;
  lex.yyin = null;
  lex.eofPending = false;
}

/** yyin = fp: the next refill reads from this file */
export function setYyin(read: () => string): void {
  lex.yyin = read;
}

/**
 * yylex(): processes ONE game, starting with 0 or more tags, followed by 0 or more moves. Returns 0 if
 * no errors, 1 if errors, 2 if terminated (normally).
 */
export function yylex(): number {
  /* These are executed on each entry to the code */
  let seen_tags = 0;
  let seen_moves = 0;
  let ctag = NO_TAG;
  let firstmovenum = -1;
  let side = white;
  let rav_count = 0;
  let result = R_NORESULT;
  let tagname = '';
  void result;
  void firstmovenum;

  for (;;) {
    if (lex.pos >= lex.buf.length) {
      // yy_get_next_buffer(): read more; at end of input reset the buffer and yyterminate()
      const more = lex.eofPending ? '' : lex.yyin ? lex.yyin() : '';
      lex.eofPending = false;
      lex.buf = lex.buf.slice(lex.pos) + more;
      lex.pos = 0;
      if (more.length === 0) {
        lex.buf = '';
        lex.pos = 0;
        lex.bol = true; // yyrestart()
        if (seen_tags || seen_moves) return 1;
        return 2;
      }
    }
    // longest match in the current start condition, earliest rule on a tie
    let best: Rule | null = null;
    let bestLen = -1;
    for (const r of rules[lex.start]) {
      if (r.bol && !lex.bol) continue;
      r.re.lastIndex = lex.pos;
      const m = r.re.exec(lex.buf);
      if (m && m[0].length > bestLen) {
        best = r;
        bestLen = m[0].length;
      }
    }
    if (best === null || bestLen === 0) {
      if (best !== null && bestLen === 0 && emptyMatchActs(best.act)) {
        doEmpty(best.act);
        continue;
      }
      // the default rule: ECHO one character
      const c = lex.buf[lex.pos++];
      lex.bol = c === '\n';
      if (lex.pos >= lex.buf.length) lex.eofPending = true;
      printf('%s', c);
      continue;
    }
    const yytext = lex.buf.slice(lex.pos, lex.pos + bestLen);
    const yyleng = bestLen;
    lex.pos += bestLen;
    // the scanner looks one character past every match: at the end of the data that is a read at EOF
    if (lex.pos >= lex.buf.length) lex.eofPending = true;
    lex.bol = yytext[yyleng - 1] === '\n'; // YY_RULE_SETUP
    /** yyless(0): put the whole match back */
    const yyless0 = (): void => {
      lex.pos -= bestLen;
    };

    switch (best.act) {
      case A_SPACE:
      case A_ESCAPE:
        break;
      case A_TAGOPEN:
        /* Handle "[".  If we've already seen a move, return "[" to the stream and return. */
        seen_tags = 1;
        ctag = NO_TAG;
        if (seen_moves) {
          lex.start = INITIAL;
          yyless0();
          return 0;
        }
        if (pgn.data_dest === DEST_TRASH) lex.start = tag_gobble;
        else lex.start = tagsymbol;
        break;
      case A_GOBBLE:
        lex.start = INITIAL;
        break;
      case A_T_WHITE: ctag = WHITE_TAG; lex.start = tagsep; break;
      case A_T_BLACK: ctag = BLACK_TAG; lex.start = tagsep; break;
      case A_T_RESULT: ctag = RESULT_TAG; lex.start = tagsep; break;
      case A_T_WHITETITLE: ctag = WHITETITLE_TAG; lex.start = tagsep; break;
      case A_T_BLACKTITLE: ctag = BLACKTITLE_TAG; lex.start = tagsep; break;
      case A_T_FEN: ctag = FEN_TAG; lex.start = tagsep; break;
      case A_T_EVENT: ctag = EVENT_TAG; lex.start = tagsep; break;
      case A_T_SITE: ctag = SITE_TAG; lex.start = tagsep; break;
      case A_T_DATE: ctag = DATE_TAG; lex.start = tagsep; break;
      case A_T_ROUND: ctag = ROUND_TAG; lex.start = tagsep; break;
      case A_T_WHITEELO: ctag = WHITE_ELO_TAG; lex.start = tagsep; break;
      case A_T_BLACKELO: ctag = BLACK_ELO_TAG; lex.start = tagsep; break;
      case A_T_OTHER:
        ctag = OTHER_TAG;
        if (yyleng >= 80 - 1) {
          printf('Error, tagname too long: %s', yytext);
          return 1;
        }
        tagname = yytext.slice(0, 80 - 1);
        lex.start = tagsep;
        break;
      case A_T_EMPTY:
        lex.start = INITIAL; /* No tag name, skip. */
        break;
      case A_T_EOL:
        lex.start = INITIAL; /* Line ended early. */
        break;
      case A_T_BAD:
        printf('Bad character as tag name: %s\n', yytext);
        return 1;
      case A_SEP:
        lex.start = tagdata;
        break;
      case A_SEP_BAD:
        printf('Bad character as tag separator: %s\n', yytext);
        return 1;
      case A_DATA:
        /* We start at first " in tag, and must match till we reach an unprotected " or end of line */
        lex.start = tagend;
        switch (ctag) {
          case WHITE_TAG:
            if (pgn.data_dest === DEST_GAME) pgn.pgn_white = yytext;
            break;
          case BLACK_TAG:
            if (pgn.data_dest === DEST_GAME) pgn.pgn_black = yytext;
            break;
          case RESULT_TAG:
            if (yytext === '1-0') result = R_WHITE_WINS;
            else if (yytext === '0-1') result = R_BLACK_WINS;
            else if (yytext === '1/2-1/2') result = R_DRAW;
            if (pgn.data_dest === DEST_GAME) pgn.pgn_result = yytext;
            break;
          case WHITETITLE_TAG: /* We'll trust GM, IM, FMs */
            if (pgn.data_dest === DEST_GAME) pgn.pgn_othertags = append_str(pgn.pgn_othertags, '[WhiteTitle "' + yytext + '"]\n');
            break;
          case BLACKTITLE_TAG:
            if (pgn.data_dest === DEST_GAME) pgn.pgn_othertags = append_str(pgn.pgn_othertags, '[BlackTitle "' + yytext + '"]\n');
            break;
          case FEN_TAG:
            if (yyleng > 82) {
              printf('Error: FEN too long: %s\n', yytext);
              return 1;
            }
            /* Doesn't return failure/success; just do the best you can */
            ParseEPD(yytext);
            /* Remember it can be black to move now */
            side = board.side;
            if (pgn.data_dest === DEST_GAME) pgn.pgn_othertags = append_str(pgn.pgn_othertags, '[FEN "' + yytext + '"]\n');
            break;
          case EVENT_TAG:
            if (pgn.data_dest === DEST_GAME) pgn.pgn_event = yytext;
            break;
          case SITE_TAG:
            if (pgn.data_dest === DEST_GAME) pgn.pgn_site = yytext;
            break;
          case DATE_TAG:
            if (pgn.data_dest === DEST_GAME) pgn.pgn_date = yytext;
            break;
          case ROUND_TAG:
            if (pgn.data_dest === DEST_GAME) pgn.pgn_round = yytext;
            break;
          case WHITE_ELO_TAG:
            if (pgn.data_dest === DEST_GAME) pgn.pgn_whiteELO = yytext;
            break;
          case BLACK_ELO_TAG:
            if (pgn.data_dest === DEST_GAME) pgn.pgn_blackELO = yytext;
            break;
          case OTHER_TAG:
            if (pgn.data_dest === DEST_GAME) pgn.pgn_othertags = append_str(pgn.pgn_othertags, '[' + tagname + ' "' + yytext + '"]\n');
            break;
        }
        break;
      case A_DATA_END:
      case A_DATA_GARBAGE:
      case A_DATA_EOL:
      case A_TAGEND:
        lex.start = INITIAL;
        break;
      case A_SEMI:
        /* PGN comment */
        seen_moves = 1;
        append_comment(yytext);
        append_comment('\n');
        break;
      case A_BRACE:
        seen_moves = 1;
        append_comment(yytext);
        lex.start = bracecomment;
        break;
      case A_BC_TEXT:
        append_comment(yytext);
        break;
      case A_BC_END:
        append_comment(yytext);
        lex.start = INITIAL;
        break;
      case A_BC_NL:
        append_comment('\n');
        break;
      case A_NAG:
        seen_moves = 1; /* Numeric Annotation Glyph */
        append_comment(yytext);
        break;
      case A_RESULT:
        return 0; /* could check if consistent w/Result */
      case A_MOVENUM:
        seen_moves = 1; /* Move number */
        if (firstmovenum === -1) {
          const r = sscanf(yytext, '%d');
          if (r.count === 1) firstmovenum = r.values[0] as number;
          if (firstmovenum < 0 || firstmovenum > 32000) firstmovenum = -1;
        }
        break;
      case A_DOTS:
        seen_moves = 1;
        side = 1; // black
        break;
      case A_MOVE: {
        /* Process a move */
        seen_moves = 1;
        if (pgn.data_dest !== DEST_TRASH) {
          /* SAN moves can be at most 7 characters, and Game[].SANmv must be able to store the result. */
          if (yyleng > 7) {
            printf('Error: move too long: %s\n', yytext);
            return 1;
          }
          // what follows yytext in flex's buffer: its NUL replaces the next character, then the rest of the input
          const p = ValidateMove(yytext, undefined, lex.buf.slice(lex.pos + 1));
          if (p === -1) {
            printf('Invalid move: %s\n', yytext);
            return 1;
          }
          /* MakeMove increments GameCnt */
          Tree.move[p] = MakeMove(side, Tree.move[p]);
          Game[g.GameCnt].SANmv = yytext;
          side = 1 ^ side;
        }
        break;
      }
      case A_RAV:
        rav_count = 1;
        append_comment(yytext);
        lex.start = RAV;
        break;
      case A_RAV_OPEN:
        rav_count++;
        append_comment(yytext);
        break;
      case A_RAV_CLOSE:
        rav_count--;
        append_comment(yytext);
        if (rav_count <= 0) lex.start = INITIAL;
        break;
      case A_RAV_TEXT:
        append_comment(yytext);
        break;
      case A_RAV_WHITE:
        yyless0();
        lex.start = INITIAL;
        return 0; /* Damn humans */
      case A_RAV_BRACKET:
        append_comment(yytext);
        break;
      case A_INVALID:
        printf('Invalid character %c in input stream.\n', yytext[0]);
        return 1;
    }
  }
}

/** rules whose pattern may match the empty string (their action runs on an empty match: it changes the start condition) */
function emptyMatchActs(act: number): boolean {
  return act === A_TAGEND || act === A_GOBBLE || act === A_DATA;
}
function doEmpty(act: number): void {
  if (act === A_TAGEND || act === A_GOBBLE) lex.start = INITIAL;
  else lex.start = tagend; // A_DATA with an empty value: as the action, but there is no tag value to keep
}
