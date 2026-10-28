// asm.c: the assembler. assemble() reads a warrior (;redcode, ;name, ;author, ...), expand() is pass 1
// (the preprocessor: labels, EQU, FOR/ROF, CURLINE, &-concatenation, ;assert, the ;debug/;trace/;break
// switches), encode() is pass 2 (the automaton parses each line into a cell, eval.c computes the
// fields). parse() assembles one line for cdb's edit and fill. Messages and their order are the C
// code's (errprn()). The static buffers buf, buf2 (A_expr, B_expr) and token are byte arrays as in C.
import {
  g, MAXALLCHAR, MAXINSTR, PARSEERR, SUCCESS, WARNING, SERIOUS, BREAK, OVERFLOW, OK_EXPR, DIV_ZERO, UNSHARED,
  PIN_APPEARED, PMARSVER, IMMEDIATE, PREDECR, POSTINC, SYM_TO_INDIR_A, type Cell, cell,
  MOV, ADD, SUB, MUL, DIV, MOD, JMZ, JMN, DJN, CMP, SLT, SPL, DAT, JMP, SEQ, SNE, NOP, LDP, STP, mAB, mB, mF, mI,
} from './global.ts';
import { host, Exit } from './host.ts';
import { sprintf, isspace, isalpha, strupper, at } from './libc.ts';
import { eval_expr, reset_regs } from './eval.ts';
import {
  CBuf, get_token, str_in_set, ch_in_set, addr_sym, NONE, ADDRTOKEN, FSEPTOKEN, COMMTOKEN, MODFTOKEN, EXPRTOKEN,
  CHARTOKEN, NUMBTOKEN, com_sym, cat_sym, cln_sym,
} from './token.ts';
import * as S from './str_eng.ts';

export const opname = ['MOV', 'ADD', 'SUB', 'MUL', 'DIV', 'MOD', 'JMZ', /* op */
  'JMN', 'DJN', 'CMP', 'SLT', 'SPL', 'DAT', 'JMP', /* op */
  'SEQ', 'SNE', 'NOP', /* ext op */
  'LDP', 'STP',
  'ORG', 'END', /* pseudo-opcodes */
  'PIN', ''];
export const modname = ['A', 'B', 'AB', 'BA', 'F', 'X', 'I', ''];
const swname = ['DEBUG', 'TRACE', 'BREAK', 'ASSERT', ''];

const PSEOPNUM = 4; /* also PIN */
const OPNUM = opname.length - PSEOPNUM;
const ORGOP = OPNUM + 0;
const ENDOP = OPNUM + 1;
const PINOP = OPNUM + 2;
const EQUOP = OPNUM + 3; /* this has to be the last */
const MODNUM = modname.length - 1;
const SWNUM = swname.length - 1;

const ERRMAX = 9; /* max error */
const GRPMAX = 7; /* max group */
const LEXCMAX = 50; /* max number of excess lines */

const RTEXT = 0, RSTACK = 1, RLABEL = 2;

const BUFERR = 0, M88ERR = 1, TOKERR = 2, SYNERR = 3, SNFERR = 4, F88ERR = 5, NOPERR = 6, EVLERR = 7, EXPERR = 8,
  RECERR = 9, ANNERR = 10, LINERR = 11, APPERR = 12, IGNORE = 13, ZLNERR = 14, NUMERR = 15, IDNERR = 16, ROFERR = 17,
  FORERR = 18, ERVERR = 19, GRPERR = 20, CHKERR = 21, NASERR = 22, BASERR = 23, EXXERR = 24, FNFERR = 25, UDFERR = 26,
  CATERR = 27, DLBERR = 28, OFSERR = 29, DOEERR = 30, DSKERR = 31, MLCERR = 32, DIVERR = 33, OFLERR = 34, MISC = 35;
void UDFERR; void NUMERR; void ERVERR; void MLCERR;

const S_OP = 0, S_MOD_ADDR_EXP = 1, S_MODF = 2, S_ADDR_EXP_A = 3, S_EXP_FS = 4, S_ADDR_EXP_B = 5, S_EXPR = 6;

interface Src { src: string; loc: number; nextsrc: Src | null }
interface Line { vline: string; dbginfo: number; linesrc: Src | null; nextline: Line | null }
interface Grp { symn: string; nextsym: Grp | null }
interface Ref { grpsym: Grp | null; sline: Line | null; value: number; visit: number; reftype: number; nextref: Ref | null }
interface ErrKeep { code: number; loc: number; num: number }

/** A line longer than 255 characters: pMARS 0.9.5 loops forever on it (its line index is a uChar). */
export class LineTooLong extends Error {}

/* ************************* some globals *************************** */
let noassert = true;
let errnum = 0, warnum = 0; /* uChar */
let symnum = 0; /* uChar */
let reftbl: Ref | null = null;
let symtbl: Grp | null = null;
let srctbl: Src | null = null;
const sline: (Line | null)[] = [null, null], lline: (Line | null)[] = [null, null];
let errkeep: ErrKeep[] = [];
let dbginfo = 0;
let dbgproceed = 1;
let curWarrior = 0;
let pass = 0;
let ierr = 0;
const buf = new CBuf(), buf2 = new CBuf(), token = new CBuf();
const A_expr = buf, B_expr = buf2;
let opcode = 0, modifier = 0; /* uChar */
let statefine = 0; /* uChar */
let laststate = S_OP;
let line = 0, linemax = 0; /* uShrt */
let vcont = 1;
let dspnt = 0;
let aline: Line | null = null;
let stdinstart = 0;
/** lines the preprocessor generated (FOR loops): a guard against FOR loops pMARS never leaves */
let generated = 0;
const MAXGENERATED = 1 << 20;

export function reset_asm(): void {
  noassert = true;
  errnum = warnum = symnum = 0;
  reftbl = null;
  symtbl = null;
  srctbl = null;
  sline[0] = sline[1] = lline[0] = lline[1] = null;
  errkeep = [];
  dbginfo = 0;
  dbgproceed = 1;
  curWarrior = 0;
  pass = 0;
  ierr = 0;
  buf.b.fill(0);
  buf2.b.fill(0);
  token.b.fill(0);
  opcode = modifier = statefine = 0;
  laststate = S_OP;
  line = linemax = 0;
  vcont = 1;
  dspnt = 0;
  aline = null;
  stdinstart = 0;
  generated = 0;
}

const U8 = (n: number): number => n & 255;
const U16 = (n: number): number => n & 0xffff;

/** concat(a, b): strcat if the result fits (MAXALLCHAR) */
function concat(a: CBuf, b: string): boolean {
  if (a.length + b.length < MAXALLCHAR) {
    a.cat(b);
    return true;
  }
  return false;
}

function LOGICERROR(lineNo: number): never {
  host.stdout(sprintf(S.logicErr, 'asm.c', lineNo));
  throw new Exit(PARSEERR);
}

/* ************************** Functions ***************************** */

function lookup(symn: string): Ref | null {
  for (let curtbl = reftbl; curtbl; curtbl = curtbl.nextref)
    for (let symtable = curtbl.grpsym; symtable; symtable = symtable.nextsym)
      if (symtable.symn === symn) return curtbl;
  return null;
}

function newtbl(): void {
  reftbl = { grpsym: null, sline: null, value: 0, visit: 0, reftype: RTEXT, nextref: reftbl };
}

function addsym(symn: string, curgroup: Grp | null): Grp {
  return { symn, nextsym: curgroup };
}

function addpredef(symn: string, value: number): void {
  const lsymtbl = addsym(symn, null);
  token.s = sprintf('%lu', value >>> 0);
  newtbl();
  reftbl!.grpsym = lsymtbl;
  reftbl!.reftype = RTEXT;
  reftbl!.sline = { vline: token.s, dbginfo: 0, linesrc: null, nextline: null };
}

function addpredefs(): void {
  /* predefined constants */
  addpredef('CORESIZE', g.coreSize);
  addpredef('MAXPROCESSES', g.taskNum);
  addpredef('MAXCYCLES', Number(BigInt.asUintN(32, g.cycles)));
  addpredef('MAXLENGTH', g.instrLim);
  addpredef('MINDISTANCE', g.separation);
  addpredef('VERSION', PMARSVER);
  addpredef('WARRIORS', g.warriors);
  addpredef('ROUNDS', g.rounds);
  addpredef('READLIMIT', g.readLimit);
  addpredef('WRITELIMIT', g.writeLimit);
  addpredef('PSPACESIZE', g.pSpaceSize);
}

/* Add line, with sline and lline, it is possible to add line to multiple group of inst */
function addline(vline: string, src: Src | null, lspnt: number): void {
  const temp: Line = { vline, dbginfo: dbginfo ? 1 : 0, linesrc: src, nextline: null };
  if (sline[lspnt]) lline[lspnt] = lline[lspnt]!.nextline = temp; /* First come first serve */
  else sline[lspnt] = lline[lspnt] = temp; /* lline init depends on sline */
  if (++generated > MAXGENERATED) throw new LineTooLong('FOR/ROF expands to more than a million lines');
}

function addlinesrc(src: string, loc: number): Src {
  srctbl = { src, loc, nextsrc: srctbl };
  return srctbl;
}

/* clear all allocated mem */
function cleanmem(): void {
  sline[0] = sline[1] = null;
  reftbl = null;
  symtbl = null;
  symnum = 0;
}

/* show symbol informations */
function show_lbl(): void {
  textout(S.labelRefMsg);
  for (let aref = reftbl; aref; aref = aref.nextref) {
    textout(S.groupLabel);
    buf.s = '';
    if (aref.grpsym === null) textout('<NONE>\n');
    else {
      for (let agrp: Grp | null = aref.grpsym; agrp; agrp = agrp.nextsym) {
        textout(agrp.symn);
        textout(' ');
      }
      textout('\n');
    }
    textout('Reference:\n');
    switch (aref.reftype) {
      case RTEXT:
        textout(S.textMsg);
        textout('\n');
        for (let l = aref.sline; l; l = l.nextline) {
          textout(l.vline);
          textout('\n');
        }
        textout('\n');
        break;
      case RSTACK:
        textout(S.stackMsg);
        textout(sprintf('%5d\n\n', aref.value));
        break;
      case RLABEL:
        textout(S.labelMsg);
        textout(sprintf('%5d\n\n', aref.value));
        break;
    }
  }
  textout(S.endOfChart);
}

/* Show information about the EQU processing */
function show_info(sspnt: number): void {
  textout(sprintf(S.afterPass, pass));
  textout(S.instrMsg);
  for (let l = sline[sspnt]; l; l = l.nextline) textout(sprintf('(%5d) %s\n', l.linesrc!.loc, l.vline));
  textout(S.endOfPass);
}

/* Remove trailing comment from str */
function nocmnt(str: string): string {
  const i = str.indexOf(com_sym);
  return i < 0 ? str : str.slice(0, i);
}

function globalswitch(str: string, idx: number, loc: number, lspnt: number): number {
  const c = { i: U8(idx) };
  get_token(str, c, token);
  token.s = strupper(token.s);
  if (token.s === 'REDCODE' && c.i === idx + 7) return -1; /* no leading spaces */
  let i = c.i;
  while (isspace(at(str, i))) i = U8(i + 1);
  const t = token.s;
  const w = g.warrior[curWarrior];
  if (t === 'NAME') w.name = at(str, i) === '\0' ? S.unknown : str.slice(i);
  else if (t === 'AUTHOR') w.authorName = at(str, i) === '\0' ? S.anonymous : str.slice(i);
  else if (t === 'DATE') w.date = at(str, i) === '\0' ? '' : str.slice(i);
  else if (t === 'VERSION') w.version = at(str, i) === '\0' ? '' : str.slice(i);
  else if (str_in_set(t, swname) < SWNUM) {
    str = str.slice(0, i) + nocmnt(str.slice(i)); /* don't remove first comment */
    addline(str, addlinesrc(str, loc), lspnt);
  }
  return 0;
}

function lineswitch(str: string, idx: number, l: Line | null): void { /* line switch */
  const c = { i: U8(idx) };
  get_token(str, c, token);
  token.s = strupper(token.s);
  if (token.s === 'DEBUG') {
    get_token(str, c, token);
    token.s = strupper(token.s);
    if ((dbgproceed = token.s !== 'OFF' ? 1 : 0) !== 0) {
      g.debugState = BREAK;
      if ((g.copyDebugInfo = token.s !== 'STATIC') === true) if (token.s) errprn(IGNORE, l, str);
    }
  } else if (token.s === 'TRACE') {
    if (dbgproceed) {
      get_token(str, c, token);
      token.s = strupper(token.s);
      if ((dbginfo = token.s !== 'OFF' ? 1 : 0) === 1) if (token.s) errprn(IGNORE, l, str);
    }
  } else if (token.s === 'BREAK') {
    if (dbgproceed) {
      get_token(str, c, token);
      dbginfo = 2;
      if (token.s) errprn(IGNORE, l, str);
    }
  }
}

/* output for different displays: stderr, or cdb's panel when assembling for cdb */
function textout(str: string): void {
  if (!g.inCdb) host.stderr(str);
  else host.display.puts(str);
}

function errprn(code: number, l: Line | null, arg: string): void {
  let abuf = '';
  g.errorcode = PARSEERR;
  g.errorlevel = SERIOUS;
  switch (code) {
    case ANNERR: abuf = S.illegalAppendErr; g.errorlevel = WARNING; break;
    case BUFERR: abuf = S.bufferOverflowErr; break;
    case ERVERR: abuf = sprintf(S.illegalConcatErr, arg); break;
    case GRPERR: abuf = sprintf(S.tooManyLabelsErr, arg); break;
    case FORERR: abuf = S.unopenedFORErr; break;
    case ROFERR: abuf = S.unclosedROFErr; g.errorlevel = WARNING; break;
    case M88ERR: abuf = sprintf(S.bad88FormatErr, arg); break;
    case ZLNERR: abuf = S.noInstErr; g.errorlevel = WARNING; break;
    case DLBERR: abuf = sprintf(S.discardLabelErr, arg); g.errorlevel = WARNING; break;
    case TOKERR: abuf = sprintf(S.tokenErr, arg); break;
    case SNFERR: abuf = sprintf(S.undefinedSymErr, arg); break;
    case NUMERR: abuf = S.expectNumberErr; break;
    case SYNERR: abuf = S.syntaxErr; break;
    case LINERR: abuf = sprintf(S.tooManyInstrErr, arg); break;
    case EXPERR: abuf = sprintf(S.missingErr, arg); break;
    case RECERR: abuf = sprintf(S.recursiveErr, arg); break;
    case EVLERR: abuf = S.badExprErr; break;
    case DIVERR: abuf = S.divZeroErr; break;
    case OFLERR: abuf = S.overflowErr; g.errorlevel = WARNING; break;
    case NASERR: abuf = S.missingAssertErr; g.errorlevel = WARNING; break;
    case OFSERR: abuf = S.badOffsetErr; g.errorlevel = WARNING; break;
    case CATERR: abuf = sprintf(S.concatErr, arg); break;
    case DOEERR: abuf = S.ignoreENDErr; g.errorlevel = WARNING; break;
    case BASERR: abuf = S.invalidAssertErr; g.errorlevel = WARNING; break;
    case EXXERR: abuf = sprintf(S.tooMuchStuffErr, MAXINSTR); break;
    case IGNORE: abuf = sprintf(S.extraTokenErr, arg); g.errorlevel = WARNING; break;
    case APPERR: abuf = sprintf(S.improperPlaceErr, arg); break;
    case F88ERR: abuf = sprintf(S.invalid88Err, arg); break;
    case NOPERR: abuf = sprintf(S.incompleteOpErr, arg); break;
    case IDNERR: abuf = sprintf(S.redefinitionErr, arg); g.errorlevel = WARNING; break;
    case UDFERR: abuf = sprintf(S.undefinedLabelErr, arg); g.errorlevel = WARNING; break;
    case CHKERR: abuf = S.assertionFailErr; break;
    case MISC: abuf = arg; break;
    case FNFERR: abuf = sprintf(S.fileOpenErr, arg); break;
    case DSKERR: abuf = sprintf(S.fileReadErr, arg); break;
  }
  if (g.errorlevel === WARNING) warnum = U8(warnum + 1);
  else errnum = U8(errnum + 1);

  if (l) {
    let i = 0;
    if (l.linesrc === null) LOGICERROR(846);
    while (i < ierr && (errkeep[i].loc !== l.linesrc.loc || errkeep[i].code !== code)) i++;
    if (i === ierr) {
      textout(g.errorlevel === WARNING ? S.warning : S.error);
      textout(sprintf(S.inLine, l.linesrc.loc, l.linesrc.src));
      textout(sprintf('        %s\n', abuf));
      errkeep[ierr++] = { num: 1, loc: l.linesrc.loc, code };
    } else errkeep[i].num++;
  } else {
    textout(sprintf('%s:\n', g.errorlevel === WARNING ? S.warning : S.error));
    textout(sprintf('        %s\n', abuf));
  }
  if (ierr >= ERRMAX) {
    textout(S.tooManyMsgErr);
    throw new Exit(PARSEERR);
  }
  g.errmsg = abuf;
}

/* ******************************************************************* */

/** the automaton; the cell gets modes and, by dfashell(), the opcode */
function automaton(expr: string, state: number, c: Cell): void {
  const ix = { i: 0 };
  let atbl: Ref | null;
  const rest = (): string => expr.slice(ix.i);
  switch ((laststate = state)) {
    case S_OP:
      statefine = 0;
      if (get_token(expr, ix, token) === CHARTOKEN) {
        token.s = strupper(token.s);
        if ((opcode = U8(str_in_set(token.s, opname))) < OPNUM) automaton(rest(), S_MOD_ADDR_EXP, c);
        else if (opcode < EQUOP) automaton(rest(), S_EXPR, c);
        else LOGICERROR(971); /* No label should appear at this point */
      } else errprn(EXPERR, aline, S.opcodeMsg);
      break;

    case S_MOD_ADDR_EXP:
      statefine = 0;
      switch (get_token(expr, ix, token)) {
        case MODFTOKEN:
          automaton(rest(), S_MODF, c);
          break;
        case ADDRTOKEN:
          c.A_mode = ch_in_set(token.s[0], addr_sym);
          if (c.A_mode > 4) {
            if (g.SWITCH_8) errprn(M88ERR, aline, '[*{}]');
            else c.A_mode = SYM_TO_INDIR_A(c.A_mode);
          }
          automaton(rest(), S_EXP_FS, c);
          break;
        case NUMBTOKEN:
        case EXPRTOKEN:
          automaton(expr, S_EXP_FS, c);
          break;
        case CHARTOKEN:
          if ((atbl = lookup(token.s)) !== null) {
            if (atbl.visit) errprn(RECERR, aline, token.s);
            else if (atbl.reftype === RTEXT) {
              if (atbl.sline) {
                atbl.visit = 1;
                automaton(atbl.sline.vline, S_MOD_ADDR_EXP, c);
                atbl.visit = 0;
                automaton(rest(), laststate, c);
              } else LOGICERROR(1010); /* all slines should've been filled */
            } else {
              const tmp = sprintf('%d', atbl.value - line);
              atbl.visit = 1;
              automaton(tmp, S_MOD_ADDR_EXP, c);
              atbl.visit = 0;
              automaton(rest(), laststate, c);
            }
          } else if (token.s.length <= 1) automaton(expr, S_EXP_FS, c);
          else errprn(SNFERR, aline, token.s);
          break;
        case NONE:
          break;
        default:
          errprn(APPERR, aline, token.s);
      }
      break;

    case S_MODF:
      statefine = 0;
      switch (get_token(expr, ix, token)) {
        case CHARTOKEN:
          token.s = strupper(token.s);
          if ((modifier = U8(str_in_set(token.s, modname))) < MODNUM) automaton(rest(), S_ADDR_EXP_A, c);
          else errprn(EXPERR, aline, S.modifierMsg);
          break;
        case NONE:
          break;
        default:
          errprn(EXPERR, aline, S.modifierMsg);
      }
      break;

    case S_ADDR_EXP_A:
      statefine = 0;
      switch (get_token(expr, ix, token)) {
        case ADDRTOKEN:
          c.A_mode = ch_in_set(token.s[0], addr_sym);
          if (c.A_mode > 4) {
            if (g.SWITCH_8) errprn(M88ERR, aline, '[*{}]');
            else c.A_mode = SYM_TO_INDIR_A(c.A_mode);
          }
          automaton(rest(), S_EXP_FS, c);
          break;
        case NUMBTOKEN:
        case EXPRTOKEN:
          automaton(expr, S_EXP_FS, c);
          break;
        case CHARTOKEN:
          if ((atbl = lookup(token.s)) !== null) {
            if (atbl.visit) errprn(RECERR, aline, token.s);
            else if (atbl.reftype === RTEXT) {
              if (atbl.sline) {
                atbl.visit = 1;
                automaton(atbl.sline.vline, S_ADDR_EXP_A, c);
                atbl.visit = 0;
                automaton(rest(), laststate, c);
              } else LOGICERROR(1080);
            } else {
              const tmp = sprintf('%d', atbl.value - line);
              atbl.visit = 1;
              automaton(tmp, S_ADDR_EXP_A, c);
              atbl.visit = 0;
              automaton(rest(), laststate, c);
            }
          } else if (token.s.length <= 1) automaton(expr, S_EXP_FS, c);
          else errprn(SNFERR, aline, token.s);
          break;
        case NONE:
          break;
        default:
          errprn(EXPERR, aline, S.aTerm);
      }
      break;

    case S_EXP_FS:
      switch (get_token(expr, ix, token)) {
        case FSEPTOKEN:
          automaton(rest(), S_ADDR_EXP_B, c);
          break;
        case ADDRTOKEN:
          if (token.s[0] !== '>' && token.s[0] !== '<' && token.s[0] !== '*') errprn(APPERR, aline, token.s);
          else {
            if (!concat(A_expr, token.s)) errprn(BUFERR, aline, '');
            statefine = 1;
            automaton(rest(), S_EXP_FS, c);
          }
          break;
        case NUMBTOKEN:
          if (!concat(token, ' ')) errprn(BUFERR, aline, '');
        /* FALLTHROUGH */
        case EXPRTOKEN:
          if (!concat(A_expr, token.s)) errprn(BUFERR, aline, '');
          statefine = 1;
          automaton(rest(), S_EXP_FS, c);
          break;
        case CHARTOKEN:
          if ((atbl = lookup(token.s)) !== null) {
            if (atbl.visit) errprn(RECERR, aline, token.s);
            else if (atbl.reftype === RTEXT) {
              if (atbl.sline) {
                atbl.visit = 1;
                automaton(atbl.sline.vline, S_EXP_FS, c);
                atbl.visit = 0;
                automaton(rest(), laststate, c);
              } else LOGICERROR(1139);
            } else {
              const tmp = sprintf('%d', atbl.value - line);
              atbl.visit = 1;
              automaton(tmp, S_EXP_FS, c);
              atbl.visit = 0;
              automaton(rest(), laststate, c);
            }
          } else if (token.s.length <= 1) { /* check if it's a register. */
            if (concat(A_expr, token.s)) {
              statefine = 1;
              automaton(rest(), S_EXP_FS, c);
            } else errprn(BUFERR, aline, '');
          } else errprn(SNFERR, aline, token.s);
          break;
        case NONE:
          break;
        default:
          errprn(APPERR, aline, token.s);
      }
      break;

    case S_ADDR_EXP_B:
      statefine = 0;
      switch (get_token(expr, ix, token)) {
        case ADDRTOKEN:
          c.B_mode = ch_in_set(token.s[0], addr_sym);
          if (c.B_mode > 4) {
            if (g.SWITCH_8) errprn(M88ERR, aline, '[*{}]');
            else c.B_mode = SYM_TO_INDIR_A(c.B_mode);
          }
          automaton(rest(), S_EXPR, c);
          break;
        case NUMBTOKEN:
        case EXPRTOKEN:
          automaton(expr, S_EXPR, c);
          break;
        case CHARTOKEN:
          if ((atbl = lookup(token.s)) !== null) {
            if (atbl.visit) errprn(RECERR, aline, token.s);
            else if (atbl.reftype === RTEXT) {
              if (atbl.sline) {
                atbl.visit = 1;
                automaton(atbl.sline.vline, S_ADDR_EXP_B, c);
                atbl.visit = 0;
                automaton(rest(), laststate, c);
              } else LOGICERROR(1196);
            } else {
              const tmp = sprintf('%d', atbl.value - line);
              atbl.visit = 1;
              automaton(tmp, S_ADDR_EXP_B, c);
              atbl.visit = 0;
              automaton(rest(), laststate, c);
            }
          } else if (token.s.length <= 1) automaton(expr, S_EXPR, c);
          else errprn(SNFERR, aline, token.s);
          break;
        case NONE:
          break;
        default:
          errprn(EXPERR, aline, S.bTerm);
      }
      break;

    case S_EXPR:
      switch (get_token(expr, ix, token)) {
        case ADDRTOKEN:
          if (token.s[0] !== '>' && token.s[0] !== '<' && token.s[0] !== '*') errprn(APPERR, aline, token.s);
          else {
            if (!concat(B_expr, token.s)) errprn(BUFERR, aline, '');
            statefine = 1;
            automaton(rest(), S_EXPR, c);
          }
          break;
        case NUMBTOKEN:
          if (!concat(token, ' ')) errprn(BUFERR, aline, '');
        /* FALLTHROUGH */
        case EXPRTOKEN:
          if (!concat(B_expr, token.s)) errprn(BUFERR, aline, '');
          statefine = 1;
          automaton(rest(), S_EXPR, c);
          break;
        case CHARTOKEN:
          if ((atbl = lookup(token.s)) !== null) {
            if (atbl.visit) errprn(RECERR, aline, token.s);
            else if (atbl.reftype === RTEXT) {
              if (atbl.sline) {
                atbl.visit = 1;
                automaton(atbl.sline.vline, S_EXPR, c);
                atbl.visit = 0;
                automaton(rest(), S_EXPR, c);
              } else LOGICERROR(1252);
            } else {
              const tmp = opcode < OPNUM ? sprintf('%d', atbl.value - line) : sprintf('%d', atbl.value);
              atbl.visit = 1;
              automaton(tmp, S_EXPR, c);
              atbl.visit = 0;
              automaton(rest(), S_EXPR, c);
            }
          } else if (token.s.length <= 1) { /* check for register use */
            if (concat(B_expr, token.s)) {
              statefine = 1;
              automaton(rest(), S_EXPR, c);
            } else errprn(BUFERR, aline, '');
          } else errprn(SNFERR, aline, token.s);
          break;
        case NONE:
          break;
        default:
          errprn(APPERR, aline, token.s);
      }
      break;
  }
}

function dfashell(expr: string, c: Cell): void {
  c.A_mode = ch_in_set('$', addr_sym);
  c.B_mode = ch_in_set('$', addr_sym);
  modifier = MODNUM; /* marked as not used */
  A_expr.s = '';
  B_expr.s = '';
  g.errorcode = SUCCESS;
  automaton(expr, S_OP, c);

  if (opcode < OPNUM) {
    /* This is also represented in a NONE case in automaton function call */
    if (statefine === 0 && g.errorcode === SUCCESS) errprn(SYNERR, aline, opname[opcode]);
    else if (B_expr.s === '') /* If there's only one argument */
      switch (opcode) {
        case DAT: /* The default in DAT statement is #0 */
          c.B_mode = c.A_mode;
          B_expr.s = A_expr.s;
          c.A_mode = ch_in_set('#', addr_sym);
          A_expr.s = '0';
          break;
        case SPL: /* The default in SPL/JMP statement is $0 */
        case JMP:
        case NOP:
          c.B_mode = ch_in_set('$', addr_sym);
          B_expr.s = '0';
          break;
        default:
          errprn(NOPERR, aline, opname[opcode]); /* opcode < OPNUM */
      }

    if (g.SWITCH_8) {
      switch (opcode) {
        case DAT:
          if ((c.A_mode !== IMMEDIATE && c.A_mode !== PREDECR) || (c.B_mode !== IMMEDIATE && c.B_mode !== PREDECR))
            errprn(F88ERR, aline, 'DAT [#<] [#<]');
          break;
        case MOV:
        case ADD:
        case SUB:
        case CMP:
          if (c.B_mode === IMMEDIATE) {
            token.s = sprintf('%s [#$@<] [$@<]', opname[opcode]);
            errprn(F88ERR, aline, token.s);
          }
          break;
        case JMP:
        case JMZ:
        case JMN:
        case DJN:
        case SPL:
          if (c.A_mode === IMMEDIATE) {
            token.s = sprintf('%s [$@<] [#$@<]', opname[opcode]);
            errprn(F88ERR, aline, token.s);
          }
          break;
        case MUL:
        case DIV:
        case MOD:
        case SEQ:
        case SNE:
        case NOP:
        case LDP:
        case STP:
          errprn(M88ERR, aline, opname[opcode]);
      }
      if (modifier !== MODNUM) errprn(M88ERR, aline, '.'); /* These two should be declared in label */
      if (c.A_mode === POSTINC || c.B_mode === POSTINC) errprn(M88ERR, aline, '>');
    }
    if (modifier === MODNUM) /* no modifier, pick default */
      switch (opcode) {
        case DAT:
        case NOP:
          modifier = mF;
          break;
        case MOV:
        case CMP:
        case SEQ:
        case SNE:
          if (c.A_mode === IMMEDIATE) modifier = mAB;
          else if (c.B_mode === IMMEDIATE) modifier = mB;
          else modifier = mI;
          break;
        case ADD:
        case SUB:
        case MUL:
        case DIV:
        case MOD:
          if (c.A_mode === IMMEDIATE) modifier = mAB;
          else if (c.B_mode === IMMEDIATE) modifier = mB;
          else modifier = mF;
          break;
        case LDP:
        case STP:
        case SLT:
          if (c.A_mode === IMMEDIATE) modifier = mAB;
          else modifier = mB;
          break;
        default:
          modifier = mB;
      }
    c.opcode = U8((opcode << 3) + modifier);
  }
}

function normalize(value: bigint): number {
  const cs = BigInt(g.coreSize);
  return Number(((value % cs) + cs) % cs);
}

/* assemble into instBank */
function encode(sspnt: number): void {
  const w = g.warrior[curWarrior];
  if (line <= MAXINSTR) {
    if (line > U16(g.instrLim)) {
      buf.s = sprintf('%d', line - g.instrLim);
      errprn(LINERR, null, buf.s);
    }
    w.instLen = line;
    if (line) {
      const base: Cell[] = Array.from({ length: line + 1 }, () => cell());
      w.instBank = base;
      for (aline = sline[sspnt], line = 0; aline; aline = aline.nextline) {
        dfashell(aline.vline, base[line]);
        if (errnum === 0) {
          if (A_expr.s === '') A_expr.s = '0';
          if (B_expr.s === '') B_expr.s = '0';
          const resultA = { v: 0n }, resultB = { v: 0n };
          let evalerrA: number, evalerrB: number;
          if (opcode === ENDOP || opcode === ORGOP || opcode === PINOP) {
            if ((evalerrA = eval_expr(B_expr.s, resultB)) < OK_EXPR) {
              if (evalerrA === DIV_ZERO) errprn(DIVERR, aline, '');
              else errprn(EVLERR, aline, '');
            } else { /* by absolute */
              if (evalerrA === OVERFLOW) errprn(OFLERR, aline, '');
              if ((opcode === ORGOP || opcode === PINOP) && g.SWITCH_8) errprn(M88ERR, aline, opname[opcode]);
              if (opcode === ORGOP) w.offset = normalize(resultB.v);
              else if (opcode === PINOP) {
                w.pSpaceIDNumber = resultB.v; /* not an address, no need to normalize */
                w.pSpaceIndex = PIN_APPEARED; /* to indicate PIN has been set */
              } else if (resultB.v) {
                if (w.offset) errprn(DOEERR, aline, '');
                else w.offset = normalize(resultB.v);
              }
              /* else ignore 'end' with parameter == 0L */
            }
          } else if ((evalerrA = eval_expr(A_expr.s, resultA)) < OK_EXPR) {
            if (evalerrA === DIV_ZERO) errprn(DIVERR, aline, '');
            else errprn(EVLERR, aline, '');
          } else if ((evalerrB = eval_expr(B_expr.s, resultB)) < OK_EXPR) {
            if (evalerrB === DIV_ZERO) errprn(DIVERR, aline, '');
            else errprn(EVLERR, aline, '');
          } else {
            if (evalerrA === OVERFLOW || evalerrB === OVERFLOW) errprn(OFLERR, aline, '');
            base[line].A_value = normalize(resultA.v);
            base[line].B_value = normalize(resultB.v);
            if ((base[line].debuginfo = aline.dbginfo) !== 0) g.debugState = BREAK;
            line = U16(line + 1);
          }
        }
      }
      if (w.offset < 0 || w.offset >= w.instLen) errprn(OFSERR, null, '');
    } else errprn(ZLNERR, null, '');
  } else errprn(EXXERR, null, '');
}

/* ******************************************************************* */

const SNIL = 0, SLBL = 1, SVAL = 2, SCOM = 3, SPSE = 4, SFOR = 5, SROF = 6, SERR = -1;

function blkfor(expr: string, dest: CBuf): number {
  let forSymGr: Grp | null;
  if (symtbl) {
    forSymGr = addsym(symtbl.symn, null);
    if (symtbl.nextsym) {
      newtbl();
      reftbl!.reftype = RLABEL;
      reftbl!.grpsym = symtbl.nextsym;
      reftbl!.value = line;
    }
    symtbl = null;
    symnum = 0;
  } else forSymGr = null;

  dest.s = '';
  trav2(expr, dest, SVAL);
  if (g.SWITCH_V) textout(sprintf(S.currentFORMsg, dest.s));
  const result = { v: 0n };
  let evalerr: number;
  if ((evalerr = eval_expr(dest.s, result)) < OK_EXPR) {
    if (evalerr === DIV_ZERO) errprn(DIVERR, aline, '');
    else errprn(EVLERR, aline, '');
  } else if (result.v <= 0n) {
    if (evalerr === OVERFLOW) errprn(OFLERR, aline, '');
    statefine = U8(statefine + 1);
  } else {
    if (evalerr === OVERFLOW) errprn(OFLERR, aline, '');
    newtbl();
    reftbl!.reftype = RSTACK;
    reftbl!.grpsym = forSymGr;
    reftbl!.visit = 1;
    const atbl = reftbl!;
    const cline = aline;
    const count = Number(BigInt.asUintN(16, result.v));
    for (atbl.value = 1; vcont && atbl.value <= count && aline; atbl.value = U16(atbl.value + 1))
      for (aline = cline; vcont;)
        if (aline!.nextline) {
          aline = aline!.nextline;
          dest.s = '';
          const r = trav2(aline.vline, dest, SNIL);
          if (r === SROF) break;
          else if (r === SCOM) {
            addline(dest.s, aline.linesrc, dspnt);
            if (dbginfo === 3) dbginfo = 0;
          }
        } else {
          errprn(ROFERR, null, '');
          vcont = 0;
        }

    let ptbl: Ref | null = null, t: Ref | null = reftbl;
    for (; t; ptbl = t, t = t.nextref) if (t.reftype === RSTACK) break;
    if (ptbl) ptbl.nextref = t!.nextref;
    else reftbl = t!.nextref;
  }
  return SFOR;
}

function equtbl(expr: string): number {
  if (symtbl) {
    newtbl();
    reftbl!.reftype = RTEXT;
    reftbl!.grpsym = symtbl;
    symtbl = null;
    symnum = 0;
    let pline: Line = (reftbl!.sline = { vline: expr, dbginfo: 0, linesrc: aline!.linesrc, nextline: null });
    while (aline!.nextline) {
      const ix = { i: 0 };
      get_token(aline!.nextline.vline, ix, token);
      token.s = strupper(token.s);
      if (token.s === 'EQU') {
        aline = aline!.nextline;
        pline = pline.nextline = { vline: aline.vline.slice(ix.i), dbginfo: 0, linesrc: aline.linesrc, nextline: null };
      } else if (token.s[0] === com_sym) {
        aline = aline!.nextline;
        lineswitch(aline.vline, ix.i, aline);
      } else break;
    }
  } else errprn(ANNERR, aline, '');
  return SVAL;
}

function equsub(expr: string, dest: CBuf, wdecl: number, tbl: Ref): number {
  tbl.visit = 1;
  const cline = aline;
  aline = tbl.sline;
  wdecl = trav2(aline!.vline, dest, wdecl);
  while (aline!.nextline && vcont) {
    if (statefine === 0)
      if (wdecl === SCOM) {
        addline(dest.s, aline!.linesrc, dspnt);
        if (dbginfo === 3) dbginfo = 0;
      }
    aline = aline!.nextline;
    dest.s = '';
    wdecl = trav2(aline.vline, dest, SNIL);
  }
  aline = cline;
  if (isspace(expr[0])) concat(dest, ' ');
  tbl.visit = 0;
  return trav2(expr, dest, wdecl);
}

/* recursively traverse the buffer */
function trav2(buffer: string, dest: CBuf, wdecl: number): number {
  const ix = { i: 0 };
  let tbl: Ref | null;
  const rest = (): string => buffer.slice(ix.i);
  switch (get_token(buffer, ix, token)) {
    case NONE:
      return wdecl;

    case COMMTOKEN:
      if (wdecl === SNIL && statefine === 0) {
        const jx = { i: ix.i };
        get_token(buffer, jx, token);
        token.s = strupper(token.s);
        if (token.s === 'ASSERT') {
          const result = { v: 0n };
          trav2(buffer.slice(jx.i), dest, SVAL);
          if (g.SWITCH_V) textout(sprintf(S.currentAssertMsg, dest.s));
          let evalerr: number;
          if ((evalerr = eval_expr(dest.s, result)) < OK_EXPR) errprn(BASERR, aline, '');
          else {
            if (evalerr === OVERFLOW) errprn(OFLERR, aline, '');
            noassert = false;
            if (result.v === 0n) errprn(CHKERR, aline, '');
          }
        } else lineswitch(buffer, ix.i, aline);
      }
      return wdecl;

    case CHARTOKEN: {
      buf.s = token.s;
      buf.s = strupper(buf.s);
      const B = buf.s;
      if (B === 'ROF') {
        if (statefine) statefine = U8(statefine - 1);
        else if (wdecl <= SLBL) return SROF;
        else errprn(APPERR, aline, token.s);
      } else if (B === 'FOR') {
        if (statefine) statefine = U8(statefine + 1);
        else if (wdecl <= SLBL) return blkfor(rest(), dest);
        else errprn(APPERR, aline, token.s);
      } else if (token.s === 'CURLINE') {
        if (statefine) return SNIL;
        else if (wdecl > SLBL) {
          buf.s = sprintf('%d', line);
          if (isspace(at(buffer, ix.i))) concat(buf, ' ');
          if (concat(dest, buf.s)) return trav2(rest(), dest, wdecl);
          else errprn(BUFERR, aline, '');
        } else errprn(MISC, aline, S.CURLINEErr);
      } else if (B === 'EQU') {
        if (statefine) return SNIL;
        else if (wdecl <= SLBL) return equtbl(rest());
        else errprn(APPERR, aline, token.s);
      } else if ((opcode = U8(str_in_set(B, opname))) < EQUOP) {
        if (statefine) return SNIL;
        else if (wdecl <= SLBL) {
          let j = buf.length;
          while (at(buffer, ix.i) !== '\0' && !isspace(at(buffer, ix.i))) { buf.put(j, buffer[ix.i]); j = U8(j + 1); ix.i = U8(ix.i + 1); }
          if (isspace(at(buffer, ix.i))) {
            buf.put(j, ' ');
            j = U8(j + 1);
            buf.put(j, '\0');
          }
          if (!concat(dest, buf.s)) errprn(BUFERR, aline, '');
          else {
            const op = opcode;
            if ((wdecl = trav2(rest(), dest, op < OPNUM ? SVAL : SPSE)) !== SERR) {
              if (symtbl) {
                newtbl();
                reftbl!.reftype = RLABEL;
                reftbl!.value = line;
                reftbl!.grpsym = symtbl;
                symtbl = null;
                symnum = 0;
              }
              if (op < OPNUM) {
                line = U16(line + 1);
                if (dbginfo === 2) dbginfo++;
              } else if (op === ENDOP) vcont = 0;
              return SCOM;
            } else return SERR;
          }
        } else errprn(APPERR, aline, token.s);
      } else if (statefine === 0) {
        let tmp = 1;
        while (at(buffer, ix.i) === cat_sym && isalpha(at(buffer, ix.i + 1)) &&
          (ix.i = U8(ix.i + 1), get_token(buffer, ix, buf) === CHARTOKEN) && tmp) {
          if ((tbl = lookup(buf.s)) !== null && tbl.reftype === RSTACK) {
            buf.s = sprintf('%02u', tbl.value);
            if (!concat(token, buf.s)) errprn(BUFERR, aline, '');
          } else {
            errprn(CATERR, aline, buf.s);
            tmp = 0;
          }
        }
        if ((tbl = lookup(token.s)) !== null) {
          if (tbl.reftype === RTEXT) {
            if (tbl.visit) errprn(RECERR, aline, token.s);
            else return equsub(rest(), dest, wdecl, tbl);
          } else if (wdecl > SLBL) {
            if (tbl.reftype === RSTACK) buf.s = sprintf('%02u', tbl.value);
            else if (wdecl === SPSE) buf.s = sprintf('%d', tbl.value); /* absolute value */
            else buf.s = sprintf('%d', tbl.value - line); /* relative value */
            if (isspace(at(buffer, ix.i))) concat(buf, ' ');
            if (concat(dest, buf.s)) return trav2(rest(), dest, wdecl);
            else errprn(BUFERR, aline, '');
          } else errprn(IDNERR, aline, token.s);
        } else if (wdecl <= SLBL) {
          if (symnum < GRPMAX) {
            symtbl = addsym(token.s, symtbl);
            symnum = U8(symnum + 1);
          } else errprn(GRPERR, aline, token.s);
          if (at(buffer, ix.i) === cln_sym) ix.i = U8(ix.i + 1); /* ignore a colon after a line-label */
          /* traverse the rest of buffer */
          return trav2(rest(), dest, SLBL);
        } else {
          if (isspace(at(buffer, ix.i))) concat(token, ' ');
          if (concat(dest, token.s)) return trav2(rest(), dest, wdecl);
          else errprn(BUFERR, aline, '');
        }
      } else return trav2(rest(), dest, SNIL);
      break;
    }
    default:
      if (statefine) return SNIL;
      else if (wdecl <= SLBL) errprn(TOKERR, aline, token.s);
      else {
        if (concat(dest, token.s)) return trav2(rest(), dest, wdecl);
        else errprn(BUFERR, aline, '');
      }
  }
  return SERR;
}

/* collect and expand equ */
function expand(sspnt: number): void {
  dspnt = 1 - sspnt;
  sline[dspnt] = null;
  vcont = 1;
  statefine = 0;
  linemax = U16(g.instrLim + LEXCMAX);
  void linemax;
  aline = sline[sspnt];
  while (aline && vcont) {
    buf2.s = '';
    switch (trav2(aline.vline, buf2, SNIL)) {
      case SCOM:
        addline(buf2.s, aline.linesrc, dspnt);
        if (dbginfo === 3) dbginfo = 0;
        break;
      case SFOR:
        break;
      case SROF:
        errprn(FORERR, aline, '');
    }
    aline = aline!.nextline;
  }
}

/**
 * parse(): assemble one line into the core at loc (cdb's edit and fill). Returns the number of cells
 * written, or -1 on errors.
 */
export function parse(expr: string, cells: { set(i: number, c: Cell): void; get(i: number): Cell }, loc: number): number {
  let dloc = loc;
  let sspnt = 0;
  errnum = warnum = 0;
  ierr = 0;
  errkeep = [];
  aline = null;
  const ix = { i: 0 };
  switch (get_token(expr, ix, token)) {
    case CHARTOKEN:
      expr = nocmnt(expr);
      addline(expr, addlinesrc(expr, loc & 0xffff), sspnt);
      break;
    case COMMTOKEN:
      globalswitch(expr, ix.i, loc & 0xffff, sspnt);
      break;
    default:
      errprn(TOKERR, aline, token.s);
  }
  line = U16(dloc);
  expand(sspnt);
  sline[sspnt] = null;
  sspnt = 1 - sspnt;

  const tmp = cell();
  for (aline = sline[sspnt], line = U16(loc); aline; aline = aline.nextline) {
    dfashell(aline.vline, tmp);
    if (errnum === 0)
      if (opcode < OPNUM) {
        const resultA = { v: 0n }, resultB = { v: 0n };
        let evalerrA: number, evalerrB: number;
        if ((evalerrA = eval_expr(A_expr.s, resultA)) < OK_EXPR) {
          if (evalerrA === DIV_ZERO) errprn(DIVERR, aline, '');
          else errprn(EVLERR, aline, '');
        } else if ((evalerrB = eval_expr(B_expr.s, resultB)) < OK_EXPR) {
          if (evalerrB === DIV_ZERO) errprn(DIVERR, aline, '');
          else errprn(EVLERR, aline, '');
        } else {
          if (evalerrA === OVERFLOW || evalerrB === OVERFLOW) errprn(OFLERR, aline, '');
          const dbg = dbginfo ? 1 : 0;
          cells.set(dloc, { opcode: tmp.opcode, A_mode: tmp.A_mode, B_mode: tmp.B_mode, A_value: normalize(resultA.v), B_value: normalize(resultB.v), debuginfo: dbg });
          if (dbg) g.debugState = BREAK;
          line = U16(line + 1);
          if (++dloc >= g.coreSize) dloc -= g.coreSize;
        }
      }
  }
  sline[0] = sline[1] = null;
  srctbl = null;
  if (dloc < loc) dloc = g.coreSize - loc + dloc;
  else dloc -= loc;
  if (errnum) return -1;
  return dloc;
}

/** A file being read with fgets(): its physical lines, with their '\n' */
export interface CFile {
  fgets(): Promise<string | null>;
}

export function stringFile(text: string): CFile {
  let p = 0;
  return {
    async fgets() {
      if (p >= text.length) return null;
      let e = text.indexOf('\n', p);
      e = e < 0 ? text.length : e + 1;
      const l = text.slice(p, e);
      p = e;
      return l;
    },
  };
}

export async function assemble(fName: string, aWarrior: number): Promise<number> {
  let cont = true, conLine = false;
  let lines = 0; /* logical and physical lines */
  let spnt = 0; /* index/pointer to sline and lline */

  g.errorlevel = WARNING;
  g.errorcode = SUCCESS;
  g.errmsg = '';
  errnum = warnum = 0;
  pass = 0;
  srctbl = null;
  sline[0] = sline[1] = null;
  reftbl = null;
  symtbl = null;
  symnum = 0;
  lines = 0;
  ierr = 0;
  errkeep = [];
  generated = 0;

  curWarrior = aWarrior;
  const w = g.warrior[curWarrior];
  w.name = S.unknown;
  w.authorName = S.anonymous;
  w.date = '';
  w.version = '';
  w.pSpaceIndex = UNSHARED; /* tag */
  /* These two inits turn out to be neccessary */
  w.instBank = null;
  w.instLen = 0;

  dbgproceed = 1;
  dbginfo = 0;
  noassert = true;

  addpredefs();

  let infp: CFile | null = null;
  if (fName === '') infp = { fgets: () => host.readStdin() };
  else {
    const text = await host.readFile(fName);
    if (text !== null) infp = stringFile(text);
  }
  if (infp) {
    let pstart = fName === '' ? stdinstart : 0;
    aline = null;
    while (cont) {
      /* Read characters until newline or EOF encountered. newline is excluded. */
      buf.put(0, '\0');
      let i = 0; /* pointer to line buffer start */
      let commentfound = false;
      do {
        const got = await infp.fgets();
        if (got !== null) {
          /* fgets(buf + i, ...): the line and its NUL */
          for (let k = 0; k < got.length && i + k < MAXALLCHAR - 1; k++) buf.put(i + k, got[k]);
          buf.put(Math.min(i + got.length, MAXALLCHAR - 1), '\0');
          for (; buf.b[i]; i++) {
            if (i > 255) throw new LineTooLong(`line ${lines + 1} is longer than 255 characters`);
            if (buf.b[i] === 0x3b /* ; */) commentfound = true;
            if (buf.b[i] === 0x0a || buf.b[i] === 0x0d) break;
          }
          if (i > 255) throw new LineTooLong(`line ${lines + 1} is longer than 255 characters`);
          buf.put(i, '\0');
          if (i > 0 && buf.b[i - 1] === 0x5c /* \ */ && !commentfound) { /* line continued */
            conLine = true;
            buf.put(--i, '\0'); /* reset */
          } else conLine = false;
        } else {
          cont = false;
          if (conLine) throw new LineTooLong(`the last line ends with "\\"`);
        }
      } while (conLine);
      lines = U16(lines + 1);
      const lineStr = buf.s;
      const ix = { i: 0 };
      switch (get_token(lineStr, ix, token)) {
        /* COMMTOKEN before any non-whitespace chars may contains switches. */
        case COMMTOKEN:
          if (globalswitch(lineStr, ix.i, lines, spnt)) /* REDCODE? */
            switch (pstart) {
              case 0:
                sline[spnt] = lline[spnt] = null;
                pstart++;
                break;
              case 1:
                pstart++;
              /* fallthru */
              case 2:
                cont = false;
                break;
            }
          break;
        case NONE:
          break;
        default: {
          const l = nocmnt(lineStr); /* saving some space */
          for (let k = l.length; k < lineStr.length; k++) if (lineStr[k] === com_sym) { buf.put(k, '\0'); break; }
          addline(l, addlinesrc(l, lines), spnt);
          break;
        }
      }
    }
    if (pstart) pstart--;
    if (fName === '') stdinstart = pstart; /* save value for next stdin reference */

    if (g.SWITCH_V) {
      show_info(spnt);
      textout(S.paramCheckMsg);
    }
    line = 0;
    expand(spnt);

    const pending = symtbl as Grp | null; /* left by expand() */
    if (pending) {
      buf.s = '';
      for (let t: Grp | null = pending; t; t = t.nextsym) {
        if (buf.s) if (!concat(buf, ' ')) break;
        if (!concat(buf, t.symn)) break;
      }
      errprn(DLBERR, null, buf.s);
      symtbl = null; /* discount any symtbl with empty reference */
      symnum = 0;
    }
    spnt = 1 - spnt;
    pass++;

    if (noassert) errprn(NASERR, null, '');

    if (g.SWITCH_V) {
      textout('\n');
      show_info(spnt);
      show_lbl();
    }
    encode(spnt);

    dbginfo = 0;
    dbgproceed = 1;

    /* release all allocated memory */
    cleanmem();
    srctbl = null;

    /* leave it for cdb() */
    addpredefs();

    if (errnum) {
      w.instBank = null;
      w.instLen = 0;
    }
    if (errnum + warnum) {
      if (w.fileName) textout(sprintf('\nSource: filename \'%s\'\n', w.fileName));
      else textout(sprintf('\nSource: standard input (%s by %s)\n', w.name, w.authorName));
    }
    if (errnum) textout(sprintf(S.errNumMsg, errnum));
    if (warnum) textout(sprintf(S.warNumMsg, warnum));
    while (ierr)
      if (errkeep[--ierr].num > 1) textout(sprintf(S.duplicateMsg, errkeep[ierr].loc, errkeep[ierr].num));
    if (errnum + warnum) textout('\n');
  } else errprn(FNFERR, null, fName);

  if (errnum) g.errorcode = PARSEERR;
  else g.errorcode = SUCCESS;
  reset_regs();
  return g.errorcode;
}

void JMN; void DJN; void SLT;
