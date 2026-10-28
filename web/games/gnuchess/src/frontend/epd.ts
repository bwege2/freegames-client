// Port of src/frontend/epd.cc of GNU Chess 6.3.0: EPD positions (load/epdload, save/epdsave, setboard,
// solve). C strings are walked with a pointer: here an index into the string, where reading past its
// end gives '\0' (as the zero-filled input buffer the commands come from does).
import {
  A1, A8, BCASTLE, BKINGCASTLE, BQUEENCASTLE, BitPosArray, EPD_ERROR, EPD_SUCCESS, MAXSTR, PHASE, SETBIT, ValueB,
  ValueN, ValueP, ValueQ, ValueR, WCASTLE, WKINGCASTLE, WQUEENCASTLE, algbr, bishop, black, board, cboard, clearBoard,
  empty, g, king, knight, leadz, nbits, notation, pawn, queen, r315, r45, r90, rook, white,
} from './common.ts';
import { UpdateCBoard, UpdateFriends, UpdateMvboard } from './util.ts';
import { ShowBoard } from './output.ts';
import { NewPosition } from './init.ts';
import { fopenRead, fopenWrite, fprintf, printf, type RFile } from './stdio.ts';
import { isdigit, sscanf, tolower } from '../libc.ts';

const EPDCLOSE = 1;

/** A line read from an EPD file, used in solve.c */
export const epd = { epd_line: '' };

let fp: RFile | null = null;
/** char line[MAXSTR] of ReadEPDFile(): what fgets() leaves in it stays there for the next call */
let line = '';

export function epdReset(): void {
  fp = null;
  line = '';
  epd.epd_line = '';
}

/**
 * Reads in an EPD file. The first call will read the first EPD line, the second call will read the 2nd
 * line and so on. The file is closed when a read fails or op == EPDCLOSE; op == 2 works silently.
 * Comment lines (starting with '#') are skipped.
 */
export function ReadEPDFile(file: string, op: number): boolean {
  /*  If first time through, must open file  */
  if (fp === null) {
    fp = fopenRead(file);
    if (fp === null) {
      printf('Error opening file %s\n', file);
      return false;
    }
  }

  /*  Is this a close request? */
  if (op === EPDCLOSE) {
    fp = null;
    return false;
  }

  for (;;) {
    /* next_line: Okay, we read in an EPD entry */
    const got = fp.fgets(MAXSTR - 1);
    if (got !== null) line = got + '\0' + line.slice(got.length + 1);
    epd.epd_line = cstr(line);
    if (!fp.feof()) {
      /* Skip comment lines */
      const l = cstr(line);
      let comment = false;
      for (let i = 0; i < l.length; ++i) {
        if (l[i] === ' ' || l[i] === '\t') continue;
        if (l[i] === '#') comment = true;
        break;
      }
      if (comment) continue;
      const ret = ParseEPD(line);
      /* For now just ignore malformed lines */
      if (ret !== EPD_SUCCESS) continue;
      if (op !== 2) printf('\n%s : Best move = %s\n', g.id, g.solution);
      return true;
    } else {
      /* finished, must close file */
      fp = null;
      return false;
    }
  }
}

/** the C string at the start of buf (up to its first NUL) */
const cstr = (buf: string): string => {
  const z = buf.indexOf('\0');
  return z < 0 ? buf : buf.slice(0, z);
};

/**
 * Parses an EPD input line (p from index i). A few global variables are updated e.g. current board,
 * side to move, en passant, castling status, etc. Returns EPD_SUCCESS or EPD_ERROR.
 */
export function ParseEPD(s: string, i = 0): number {
  const at = (k: number): string => (k < s.length ? s[k] : '\0');
  let r = 56;
  let c = 0;
  clearBoard(board);

  let p = i;
  while (at(p) !== ' ') {
    const sq = r + c;
    const set = (side: number, piece: number, value: number): void => {
      board.b[side][piece] = SETBIT(board.b[side][piece], sq);
      board.blockerr90 = SETBIT(board.blockerr90, r90[sq]);
      board.blockerr45 = SETBIT(board.blockerr45, r45[sq]);
      board.blockerr315 = SETBIT(board.blockerr315, r315[sq]);
      board.material[side] += value;
    };
    switch (at(p)) {
      case 'P': set(white, pawn, ValueP); break;
      case 'N': set(white, knight, ValueN); break;
      case 'B': set(white, bishop, ValueB); break;
      case 'R': set(white, rook, ValueR); break;
      case 'Q': set(white, queen, ValueQ); break;
      case 'K': set(white, king, 0); break;
      case 'p': set(black, pawn, ValueP); break;
      case 'n': set(black, knight, ValueN); break;
      case 'b': set(black, bishop, ValueB); break;
      case 'r': set(black, rook, ValueR); break;
      case 'q': set(black, queen, ValueQ); break;
      case 'k': set(black, king, 0); break;
      case '/':
        r -= 8;
        c = -1;
        break;
      default:
        break;
    }
    if (isdigit(at(p))) c += at(p).charCodeAt(0) - 48;
    else c++;

    /* Special case, a trailing "/" is accepted on the end of the board settings. */
    if (r === -8 && at(p + 1) === ' ') r = 0;

    if (r < 0 || c > 8) return EPD_ERROR;
    if (c === 8 && at(p + 1) !== '/' && at(p + 1) !== ' ') return EPD_ERROR;
    p++;
  }

  board.pmaterial[white] = board.material[white] - nbits(board.b[white][pawn]) * ValueP;
  board.pmaterial[black] = board.material[black] - nbits(board.b[black][pawn]) * ValueP;
  board.king[white] = leadz(board.b[white][king]);
  board.king[black] = leadz(board.b[black][king]);
  UpdateFriends();
  UpdateCBoard();
  UpdateMvboard();

  /*  Get side to move  */
  ++p; // if (!++p) return EPD_ERROR;
  if (at(p) === 'w') board.side = white;
  else if (at(p) === 'b') board.side = black;
  else return EPD_ERROR;

  /* Isn't this one cute? */
  ++p;
  if (at(p) !== ' ') return EPD_ERROR;
  ++p;

  /*  Castling status  */
  while (at(p) !== ' ') {
    if (at(p) === 'K') board.flag |= WKINGCASTLE;
    else if (at(p) === 'Q') board.flag |= WQUEENCASTLE;
    else if (at(p) === 'k') board.flag |= BKINGCASTLE;
    else if (at(p) === 'q') board.flag |= BQUEENCASTLE;
    else if (at(p) === '-') {
      p++;
      break;
    } else return EPD_ERROR;
    p++;
  }
  if (at(p) !== ' ') return EPD_ERROR;
  ++p;

  /* En passant square, can only be '-' or [a-h][36] */
  if (at(p) !== '-') {
    if (at(p + 1) === '\0' || at(p) < 'a' || at(p) > 'h' || !(at(p + 1) === '3' || at(p + 1) === '6')) return EPD_ERROR;
    board.ep = at(p).charCodeAt(0) - 97 + (at(p + 1).charCodeAt(0) - 49) * 8;
    p++;
  } else {
    board.ep = -1;
  }

  g.solution = '';
  g.id = '';

  ++p; // if (!++p) return EPD_SUCCESS;
  /* The opcodes are optional, so we should not generate errors here */
  const rest = cstr(s.slice(Math.min(p, s.length)));

  /*  Read in best move; "bm" operator */
  const bm = rest.indexOf('bm');
  if (bm >= 0) {
    const r1 = scanUntilSemicolon(rest.slice(bm), 'bm ', 63);
    if (r1 !== null) g.solution = r1;
  }
  /*  Read in the description; "id" operator */
  if (rest.indexOf('id') >= 0) {
    // sscanf (p, "id %31[^;];", id): from p, not from where "id" was found
    const r2 = scanUntilSemicolon(rest, 'id ', 31);
    if (r2 !== null) g.id = r2;
  }

  g.phase = PHASE();
  return EPD_SUCCESS;
}

/** sscanf(s, "<word> %N[^;];", out): the literal word, spaces, then up to N chars that are not ';' */
function scanUntilSemicolon(s: string, lead: string, n: number): string | null {
  const word = lead.trimEnd();
  if (!s.startsWith(word)) return null;
  let i = word.length;
  while (i < s.length && (s[i] === ' ' || s[i] === '\t' || s[i] === '\n' || s[i] === '\r' || s[i] === '\v' || s[i] === '\f')) i++;
  let j = i;
  while (j < s.length && j - i < n && s[j] !== ';') j++;
  if (j === i) return null;
  return s.slice(i, j);
}

/** This routine reads in the next or the Nth position in the file. */
export function LoadEPD(p: string): void {
  let file = '';
  let N = 1;
  const r = sscanf(p, '%127s %d ');
  if (r.values.length >= 1) file = r.values[0] as string;
  if (r.values.length >= 2) N = r.values[1] as number;

  if (file === 'next') {
    ReadEPDFile(file, 0);
  } else {
    ReadEPDFile(file, 1);
    while (--N) {
      if (ReadEPDFile(file, 2) === false) {
        printf('File position exceeded\n');
        return;
      }
    }
    ReadEPDFile(file, 0);
  }
  ShowBoard();
  NewPosition();
}

/** This routine writes the current position in EPD format into a string. */
export function EPD2str(pos: string): string {
  for (let r = A8; r >= A1; r -= 8) {
    let k = 0;
    for (let c = 0; c < 8; c++) {
      const sq = r + c;
      if (cboard[sq] === empty) k++;
      else {
        if (k) pos += String(k);
        k = 0;
        let c1 = notation[cboard[sq]];
        if (BitPosArray[sq] & board.friends[black]) c1 = tolower(c1);
        pos += c1;
      }
    }
    if (k) pos += String(k);
    if (r > A1) pos += '/';
  }

  /* Print other stuff */
  pos += board.side === white ? ' w ' : ' b ';
  if (board.flag & WKINGCASTLE) pos += 'K';
  if (board.flag & WQUEENCASTLE) pos += 'Q';
  if (board.flag & BKINGCASTLE) pos += 'k';
  if (board.flag & BQUEENCASTLE) pos += 'q';
  if (!(board.flag & (WCASTLE | BCASTLE))) pos += '-';
  pos += ' ' + (board.ep > -1 ? algbr[board.ep] : '-');
  pos += ' bm 1; id 1;';
  return pos;
}

/** The C program crashes (fprintf on a NULL FILE *) when the file cannot be opened. */
export class Crash extends Error {}

/** This routine appends the current position in EPD format into a file. */
export function SaveEPD(p: string): void {
  const pos = EPD2str('');
  const r = sscanf(p, '%s ');
  const file = (r.values[0] as string | undefined) ?? '';
  const f = fopenWrite(file, 'a');
  if (f === null) throw new Crash('Segmentation fault');
  fprintf(f, '%s\n', pos);
}
