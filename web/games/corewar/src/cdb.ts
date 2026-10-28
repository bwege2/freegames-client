// cdb.c: the line-oriented core debugger (Stefan Strack), as the X11 build has it: its output and input
// are the X window's text panels (xwindisp.ts), with the panel commands close/switch/display. Also the
// score functions and results() pMARS prints at the end. get_cmd() is the C code's command-chain
// machinery (cmd~cmd, !! loops, macros) on a byte buffer, including how it splits and restores it.
import {
  g, NOBREAK, BREAK, STEP, SKIP, RESET, USERABORT, OVERFLOW, OK_EXPR, DIV_ZERO, MAXWARRIOR, MAXALLCHAR,
} from './global.ts';
import { host, Exit } from './host.ts';
import { sprintf, isspace, isalpha, isupper, toupper, INT_MIN } from './libc.ts';
import { eval_expr, set_reg } from './eval.ts';
import { cellview, locview } from './disasm.ts';
import { parse } from './asm.ts';
import { decode_vopt } from './pmars.ts';
import * as S from './str_eng.ts';

const VERBLEN = 3;
export const CDB_PROMPT = '(cdb) ';
const CMDSEP = 0x7e; /* '~' chain command separator */
const CMDREP = 0x21; /* '!' chain command repeator */
const MAXSTR = MAXALLCHAR;
const MAXCMDSTR = 10 * MAXALLCHAR;
const MAXMACROS = 2000;
const MAXLOOPNESTING = 120;
const MAXARG = MAXALLCHAR;
const RANGE_T = 0, TEXT_T = 1;
const FORCE = 1, COND = 0;
const CORE = 0, QUEUE = 1, WARRIOR = 2, PSP = 3;

/* hash value constants */
const NULL_H = 0, ON_H = 419, OF_H = 411, CAL_H = 2226, CA_H = 2214, CLS_H = 2530, CLE_H = 2516, CL_H = 2511,
  CLO_H = 2526, CON_H = 2606, CO_H = 2592, C_H = 2187, DIS_H = 3178, DI_H = 3159, D_H = 2916, ECH_H = 3734,
  EC_H = 3726, EDI_H = 3762, ED_H = 3753, E_H = 3645, EXE_H = 4298, EX_H = 4293, FIL_H = 4629, FI_H = 4617, F_H = 4374,
  GO_H = 5508, G_H = 5103, HAS_H = 5878, HEL_H = 5979, HE_H = 5967, H_H = 5832, IF_H = 6723, LIS_H = 9010, LI_H = 8991,
  L_H = 8748, MOV_H = 9904, MO_H = 9882, MAC_H = 9507, MA_H = 9504, M_H = 9477, PRO_H = 12165, PR_H = 12150,
  P_H = 11664, PQU_H = 12144, PQ_H = 12123, PSP_H = 12193, PS_H = 12177, QUI_H = 12969, QU_H = 12960, Q_H = 12393,
  REG_H = 13264, RE_H = 13257, R_H = 13122, REM_H = 13270, RES_H = 13276, SEA_H = 13987, SE_H = 13986, STE_H = 14396,
  ST_H = 14391, S_H = 13851, SKI_H = 14157, SK_H = 14148, SWI_H = 14481, SW_H = 14472, THR_H = 14814, TH_H = 14796,
  TRA_H = 15067, TR_H = 15066, T_H = 14580, UNT_H = 15707, UN_H = 15687, U_H = 15309, WRI_H = 17262, WR_H = 17253,
  W_H = 16767, WQU_H = 17247, WQ_H = 17226, XEC_H = 17634, XE_H = 17631, X_H = 17496;

/* global variables */
let logfile: string | null = null;
let logChain: Promise<unknown> = Promise.resolve();
let skipCounter = 0n;
let commaSep = 0;
let silent = 0;
let targetSize = 0;
let targetID = CORE;
let nextMacro: string | null = null;
let macroTab: string[] = [];
let W2 = 0, QW = 0;
let targetview: (loc: number) => string = locview;
/* cdb(): static long start, stop */
let start = 0n, stop = 0n;
/* get_cmd() statics */
let curCmd = 0, nextCmd = 0, loopNesting = 0;
let repeating = 0n;
let loopStack: bigint[] = new Array(MAXLOOPNESTING).fill(0n);
const inputStr = new Uint8Array(MAXCMDSTR + 2);
let lastCmdStr = '';

export function reset_cdb(): void {
  logfile = null;
  logChain = Promise.resolve();
  skipCounter = 0n;
  commaSep = silent = 0;
  targetSize = 0;
  targetID = CORE;
  nextMacro = null;
  macroTab = [];
  W2 = QW = 0;
  targetview = locview;
  start = stop = 0n;
  curCmd = nextCmd = loopNesting = 0;
  repeating = 0n;
  loopStack = new Array(MAXLOOPNESTING).fill(0n);
  inputStr.fill(0);
  lastCmdStr = '';
}

/* inputStr as C sees it */
const rd = (i: number): number => (i >= 0 && i < inputStr.length ? inputStr[i] : 0);
const wr = (i: number, c: number): void => { if (i >= 0 && i < inputStr.length) inputStr[i] = c; };
function cstr(i: number): string {
  let s = '';
  while (rd(i)) s += String.fromCharCode(inputStr[i++]);
  return s;
}
function strcpyAt(i: number, s: string): void {
  for (let k = 0; k < s.length; k++) wr(i + k, s.charCodeAt(k) & 255);
  wr(i + s.length, 0);
}
const strlenAt = (i: number): number => cstr(i).length;
const ch = (c: number): string => String.fromCharCode(c);

function FOLD(n: bigint): number {
  const t = BigInt(targetSize);
  return Number((((n % t) + t) % t));
}

function targetSelect(index: number): number {
  return targetID === CORE || targetID === PSP ? index
    : targetID === QUEUE ? queue(index)
      : g.W === index ? g.progCnt : g.taskQueue[g.warrior[index].taskHead];
}

const textLines = (): number => host.display.textLines;

/** cdb(message): returns the new debugState */
export async function cdb(message: string): Promise<number> {
  let returnValue = NOBREAK;
  let i: number;
  /* skip execution */
  if (skipCounter > 0n) {
    --skipCounter;
    return STEP;
  }
  g.inCdb = true;
  host.display.write_menu();
  W2 = g.warrior[g.W].nextWarrior;
  if (targetID === QUEUE) {
    g.curAddr = 0;
    QW = g.W;
    targetSize = g.warrior[QW].tasks ? g.warrior[QW].tasks : 1; /* at least 1 */
  } else if (targetID === WARRIOR) {
    g.curAddr = g.W;
  } else if (targetID === PSP) {
    QW = g.W;
  } else {
    g.curAddr = g.progCnt;
    targetSize = g.coreSize;
  }

  cdb_fputs(message, COND);
  await print_core(g.curAddr, g.curAddr);
  do { /* command interpreter loop */
    const cmdStr = await get_cmd(CDB_PROMPT); /* get (chained) command */
    const p = parse_cmd(cmdStr);
    const argType = p.type;
    let argStr = p.arg;
    const verbStr = p.verb;
    const W = g.warrior[g.W];
    switch (hash_str(verbStr, VERBLEN)) {
      case CAL_H:
      case CA_H: /* calculate */
        if (argType === RANGE_T) {
          if (!commaSep) cdb_fputs(sprintf('%ld\n', start), COND);
          else cdb_fputs(sprintf('%ld,%ld\n', start, stop), COND);
        } else bad_arg(argStr);
        break;
      case CLS_H:
      case CLE_H:
      case CL_H:
        host.display.clear();
        break;
      case CLO_H: /* close display panel 2 */
        if (g.curPanel === 2) {
          i = g.curAddr;
          g.curAddr = g.curAddr2;
          g.curAddr2 = i;
        }
        host.display.update(0);
        break;
      case CON_H:
      case CO_H:
      case C_H:
        cdb_fputs(S.exitingCdbToFinishSimulation, COND);
        logfile = null;
        if (argStr && (start = BigInt(FOLD(start))) === BigInt(FOLD(stop))) g.progCnt = Number(start);
        returnValue = NOBREAK;
        g.inCdb = false;
        break;
      case DIS_H:
      case DI_H:
      case D_H: {
        i = hash_str(argStr, 3);
        if (i === CLE_H || i === CLS_H) {
          /* the X11 build has no "display clear" */
        } else if ((i = hash_str(argStr, 2)) === ON_H) g.displayLevel = 3;
        else if (i === OF_H) g.displayLevel = 0;
        else if (FOLD(start) === FOLD(stop)) {
          decode_vopt(Number(BigInt.asIntN(32, start)));
          host.display.resize();
        }
        break;
      }
      case ECH_H:
      case EC_H:
        cdb_fputs(sprintf('%s\n', argStr), COND);
        break;
      case EDI_H:
      case ED_H:
      case E_H:
        g.curAddr = FOLD(stop);
        await edit_core(FOLD(start), g.curAddr);
        break;
      case EXE_H:
      case EX_H:
      case XEC_H:
      case XE_H:
      case X_H:
        if ((start = BigInt(FOLD(start))) === BigInt(FOLD(stop))) {
          W.taskHead = W.taskTail;
          W.tasks = 1;
          g.progCnt = Number(start);
          returnValue = STEP;
          g.inCdb = false;
        } else cdb_fputs(S.usageExecute, FORCE);
        break;
      case FIL_H:
      case FI_H:
      case F_H:
        await fill_core(FOLD(start), FOLD(stop));
        break;
      case GO_H:
      case G_H:
        if (argStr && (start = BigInt(FOLD(start))) === BigInt(FOLD(stop))) g.progCnt = Number(start);
        returnValue = BREAK;
        g.inCdb = false;
        break;
      case HAS_H: /* HASH: developer hook for adding new commands */
        argStr = argStr.replace(/[a-z]/g, (c) => c.toUpperCase());
        cdb_fputs(sprintf('#define %s_H %d\n', argStr, hash_str(argStr, VERBLEN)), COND);
        break;
      case HEL_H:
      case HE_H:
      case H_H:
        await help();
        break;
      case IF_H:
        if (argType === RANGE_T) {
          if (!start) g.cmdMod = SKIP;
        } else bad_arg(argStr);
        break;
      case LIS_H:
      case LI_H:
      case L_H:
      case NULL_H: /* no command, use default */
        if (argType === RANGE_T) {
          g.curAddr = FOLD(stop);
          await print_core(FOLD(start), g.curAddr);
        } else if (argStr.charCodeAt(0) !== CMDREP && (argStr.charCodeAt(1) || 0) !== CMDREP) bad_arg(argStr); /* kludge to make !!~!! work */
        break;
      case MAC_H:
      case MA_H:
      case M_H: {
        /* filename ? */
        let f = 0;
        while (f < argStr.length && argStr[f] !== ',' && !isspace(argStr[f])) ++f;
        let e = f;
        while (e < argStr.length && (argStr[e] === ',' || isspace(argStr[e]))) e++;
        const fnStr = argStr.slice(e);
        argStr = argStr.slice(0, f);
        if (!macroTab.length || fnStr) await load_macros(fnStr);
        if (!argStr) await print_macros();
        else exec_macro(argStr);
        break;
      }
      case MOV_H:
      case MO_H:
        if ((i = hash_str(argStr, 2)) === ON_H) g.copyDebugInfo = true;
        else if (i === OF_H) g.copyDebugInfo = false;
        else cdb_fputs(S.usageMoveable, FORCE);
        break;
      case PRO_H:
      case PR_H:
      case P_H:
        results(null);
        if (logfile) results('log');
        break;
      case PQU_H:
      case PQ_H:
        if ((i = hash_str(argStr, 2)) === OF_H) {
          g.curAddr = targetSelect(g.curAddr);
          targetSize = g.coreSize;
          targetID = CORE;
          targetview = locview;
        } else {
          if (argStr && start === stop && start >= 1n && start <= BigInt(g.warriors)) QW = Number(start) - 1;
          else QW = g.W;
          g.curAddr = 0;
          targetSize = g.warrior[QW].tasks ? g.warrior[QW].tasks : 1;
          targetID = QUEUE;
          targetview = queueview;
        }
        await print_core(g.curAddr, g.curAddr);
        break;
      case PSP_H: /* P-space list mode */
      case PS_H:
        if ((i = hash_str(argStr, 2)) === OF_H) {
          g.curAddr = targetSelect(g.curAddr);
          targetSize = g.coreSize;
          targetID = CORE;
          targetview = locview;
        } else {
          if (argStr && start === stop && start >= 1n && start <= BigInt(g.warriors)) QW = Number(start) - 1;
          else QW = g.W;
          g.curAddr = 0;
          targetSize = g.pSpaceSize;
          targetID = PSP;
          targetview = pspaceview;
        }
        await print_core(g.curAddr, g.curAddr);
        break;
      case QUI_H:
      case QU_H:
      case Q_H:
        logfile = null;
        await host.display.display_close(false);
        throw new Exit(USERABORT);
      case REM_H: /* macro comment */
        break;
      case REG_H:
      case RE_H:
      case R_H:
        print_registers();
        break;
      case RES_H: /* reset command chain/macro execution */
        g.cmdMod = RESET;
        break;
      case SEA_H: /* wildcard search for pattern in disassembly */
      case SE_H: {
        argStr = argStr.replace(/[a-z]/g, (c) => c.toUpperCase());
        /* pMARS searches on forever from address 0 when nothing matches (until Ctrl-C): one pass here */
        for (let n = 0, i = g.curAddr + 1; !g.cmdMod && i !== g.curAddr && n <= 2 * targetSize; ++i, ++n) {
          if (i === targetSize) i = 0;
          if (!wildsearch(argStr, targetview(i))) {
            g.curAddr = i;
            break;
          }
        }
        cdb_fputs(targetview(g.curAddr), COND);
        break;
      }
      case SKI_H:
      case SK_H:
        if (start === stop) { /* we don't fold here */
          skipCounter = start;
          returnValue = STEP;
          g.inCdb = false;
        } else cdb_fputs(S.usageSkip, FORCE);
        break;
      case STE_H:
      case ST_H:
      case S_H:
        if (argStr && (start = BigInt(FOLD(start))) === BigInt(FOLD(stop))) g.progCnt = Number(start);
        returnValue = STEP;
        g.inCdb = false;
        break;
      case SWI_H: /* switch display panels */
      case SW_H: {
        if (argStr && start === stop && (start === 1n || start === 2n)) {
          if (BigInt(g.curPanel) === start) break;
          else i = Number(start);
        } else if (g.curPanel < 2) i = 2;
        else i = 1;
        host.display.update(i);
        i = g.curAddr;
        g.curAddr = g.curAddr2;
        g.curAddr2 = i;
        break;
      }
      case TRA_H:
      case TR_H:
      case T_H:
        if (argType === RANGE_T) set_trace(FOLD(start), FOLD(stop));
        else bad_arg(argStr);
        break;
      case THR_H:
      case TH_H:
        if (argStr && (start = BigInt(FOLD(start))) === BigInt(FOLD(stop))) g.progCnt = Number(start);
        skipCounter = BigInt(W.tasks * g.warriors - 1);
        returnValue = STEP;
        g.inCdb = false;
        break;
      case UNT_H:
      case UN_H:
      case U_H:
        if (argType === RANGE_T) unset_trace(FOLD(start), FOLD(stop));
        else bad_arg(argStr);
        break;
      case WRI_H:
      case WR_H:
      case W_H:
        if (!argStr && !logfile) cdb_fputs(S.usageWrite, FORCE);
        if (logfile) {
          cdb_fputs(S.closingLogfile, COND);
          logfile = null;
        }
        if (argStr) {
          if (!(await host.appendFile(argStr, ''))) cdb_fputs(S.cannotOpenLogfile, FORCE);
          else {
            logfile = argStr;
            cdb_fputs(S.openingLogfile, COND);
          }
        }
        break;
      case WQU_H:
      case WQ_H:
        if ((i = hash_str(argStr, 2)) === OF_H) {
          g.curAddr = targetSelect(g.curAddr);
          targetSize = g.coreSize;
          targetID = CORE;
          targetview = locview;
        } else {
          g.curAddr = g.W;
          targetSize = g.warriors;
          targetID = WARRIOR;
          targetview = warriorview;
        }
        await print_core(g.curAddr, g.curAddr);
        break;
      default:
        cdb_fputs(sprintf(S.unknownCommand, cmdStr), FORCE);
        break;
    }
  } while (g.inCdb);
  host.display.write_menu();
  return returnValue;
}

/* queue - return address at process queue position */
function queue(index: number): number {
  const q = g.warrior[QW];
  index = ((index % q.tasks) + q.tasks) % q.tasks;
  if (!index) return g.progCnt;
  const p = q.taskHead + index - 1;
  return g.taskQueue[p >= g.totaltask ? p - g.totaltask : p];
}

/**
 * get_cmd - get command from user or from command chain (cmd1~cmd2~cmd3..)
 * <return> recalls last cmd (chain); <space>.... supresses saving cmd (chain) to last-cmd;
 * ~~ (empty cmd) repeats last cmd in chain (also ~\0); ~ ~ is same as \n;
 * !e repeats the chain before e times (no e, repeat forever); expands macro "flat".
 */
async function get_cmd(prompt: string): Promise<string> {
  let inpPtr: number, marking: number, loopStart: number, i: number, j: number;
  if (g.cmdMod === RESET) g.cmdMod = curCmd = nextCmd = 0; /* "reset" command was issued to terminate macro */
  for (;;) { /* new_input: */
    let again = false;
    if (nextMacro !== null) { /* last command was "macro <name>" */
      if (strlenAt(nextCmd) + nextCmd + nextMacro.length <= MAXCMDSTR) { /* check for buffer overflow */
        let holding: string;
        if (nextCmd) holding = '~' + cstr(nextCmd); /* save remaining chain for later appending */
        else holding = '';
        nextCmd = curCmd; /* reset */
        strcpyAt(curCmd, nextMacro + holding); /* insert macro string in place of "macro <name>" command */
        nextMacro = null;
      } else {
        cdb_fputs(S.macroStringExpansionTooLong, FORCE);
        nextCmd = curCmd = 0;
        nextMacro = null;
        continue;
      }
    } else if (!nextCmd) {
      /* command string exhausted; get new from user */
      for (loopNesting = 0; loopNesting < MAXLOOPNESTING; ++loopNesting) loopStack[loopNesting] = 0n;
      loopNesting = 0;
      repeating = 0n;
      cdb_fputs(prompt, FORCE); /* display prompt */
      let conLine = false;
      i = 0; /* buffer index */
      do { /* while not continuation line */
        const rv = await host.display.gets(MAXCMDSTR - i);
        if (rv === null) {
          cdb_fputs(S.EOFreadingCommandInput, FORCE);
          strcpyAt(0, 'con\n'); /* leave cdb */
          break;
        }
        strcpyAt(i, rv);
        if (logfile) logWrite(rv); /* echo to logfile if logging */
        /* NOEOL */
        let e = i;
        while (rd(e) && rd(e) !== 0x0a && rd(e) !== 0x0d) ++e;
        wr(e, 0);
        i = strlenAt(0) - 1;
        if (rd(i) === 0x5c) { /* \ */
          conLine = true;
          wr(i, 0);
        } else conLine = false;
      } while (conLine);
      if (!rd(0)) strcpyAt(0, lastCmdStr); /* if return was pressed, recall last command */
      else if (!isspace(ch(rd(0)))) lastCmdStr = cstr(0); /* if leading space, don't save as last command */
      nextCmd = curCmd = 0;
    }
    /* advance to next ~,! or \0 */
    advance: for (;;) {
      marking = 0;
      for (inpPtr = nextCmd; rd(inpPtr) && rd(inpPtr) !== CMDSEP &&
        ((nextCmd === 0 && rd(inpPtr + 1) !== CMDREP) || rd(inpPtr) !== CMDREP || marking); ++inpPtr)
        if (!isspace(ch(rd(inpPtr)))) marking = 1;

      if (!rd(inpPtr) && nextCmd !== inpPtr) {
        /* last (or only) cmd in chain */
        curCmd = nextCmd;
        nextCmd = 0;
      } else if (nextCmd === inpPtr && rd(inpPtr) !== CMDREP) {
        /* ~[~\0] = empty cmd, recall last in chain */
        if (rd(inpPtr)) nextCmd = inpPtr + 1; /* ~~ */
        else nextCmd = 0; /* ~\0 */
        if (inpPtr > 0) wr(inpPtr - 1, 0x20);
        wr(inpPtr, 0);
      } else if (rd(inpPtr) === CMDSEP) {
        curCmd = nextCmd;
        nextCmd = inpPtr + 1;
        wr(inpPtr, 0);
      } else { /* if (inputStr[inpPtr] == CMDREP) */
        if (rd(inpPtr + 1) === CMDREP) { /* !! loop start */
          i = inpPtr + 2;
          if (g.cmdMod === SKIP) { /* skip next block !!....!n */
            g.cmdMod = 0;
            marking = 1;
            for (; rd(i); ++i)
              if (rd(i) === CMDREP) {
                if (rd(i + 1) === CMDREP) loopStart = 1; /* possible loop start!! */
                else loopStart = 0;
                for (j = i - 1; isspace(ch(rd(j))); --j);
                if (rd(j) === CMDSEP) { /* ~  ! */
                  if (loopStart) ++marking;
                  else --marking;
                  if (!marking && !loopStart) break;
                  else if (loopStart) i = i + 2;
                } else if (loopStart) i = i + 2;
              }
            loopStack[loopNesting] = repeating; /* undo stack pushing */
            repeating = loopStack[--loopNesting] ?? 0n;
          }
          /* advance to next ~ or \0 */
          for (; rd(i) && rd(i) !== CMDSEP; ++i);
          if (rd(i)) {
            nextCmd = i + 1;
            loopStack[loopNesting] = repeating;
            if (loopNesting < MAXLOOPNESTING) {
              repeating = loopStack[++loopNesting] ?? 0n;
              continue advance;
            } else {
              cdb_fputs(S.maximumLoopNestingExceeded, FORCE);
              curCmd = nextCmd = 0;
              again = true;
              break advance;
            }
          } else {
            nextCmd = 0;
            again = true;
            break advance;
          }
        } else { /* !# loop end */
          if (g.cmdMod === SKIP) {
            g.cmdMod = 0;
            repeating = 1n;
          }
          if (!repeating) {
            repeating = -1n; /* flag for "empty repeat count" */
            for (i = inpPtr + 1; rd(i) && rd(i) !== CMDSEP; ++i) if (!isspace(ch(rd(i)))) repeating = 0n;
            const jj = rd(i) === CMDSEP;
            if (jj) wr(i, 0);
            for (let k = inpPtr + 1; rd(k); ++k) wr(k, toupper(ch(rd(k))).charCodeAt(0)); /* capitalize */
            if (!repeating) {
              const r = { v: 0n };
              if (subst_eval(cstr(inpPtr + 1), r) === TEXT_T) {
                cdb_fputs(S.badRepeatCountExpression, FORCE);
                curCmd = nextCmd = 0;
                again = true;
                break advance;
              }
              repeating = r.v;
            }
            if (jj) wr(i, CMDSEP);
          }
          if (!--repeating) { /* done */
            /* advance to next ~ or \0 */
            for (i = inpPtr + 1; rd(i) && rd(i) !== CMDSEP; ++i);
            if (rd(i)) {
              nextCmd = i + 1;
              loopStack[loopNesting] = repeating;
              if (loopNesting) repeating = loopStack[--loopNesting];
              continue advance;
            } else {
              nextCmd = 0;
              again = true;
              break advance;
            }
          }
          marking = 1;
          for (i = inpPtr - 1; i >= 0; --i)
            if (!rd(i)) { /* reverse */
              wr(i, CMDSEP);
              nextCmd = i + 1;
            } else if (rd(i) === CMDREP) {
              if (rd(i - 1) === CMDREP) { /* possible loop start!! */
                loopStart = 1;
                --i;
              } else loopStart = 0;
              for (j = i - 1; isspace(ch(rd(j))) && j >= 0; --j);
              if (!rd(j) || rd(j) === CMDSEP) { /* ~  ! */
                wr(j, CMDSEP);
                if (loopStart) --marking;
                else ++marking;
                if ((!marking && loopStart) || !loopNesting) break;
                else {
                  nextCmd = j + 1;
                  i = j; /* continue past inner nested loop */
                }
              } else i = j; /* not a loop, continue reversing */
            }
          if (rd(i) === CMDREP) {
            for (++i; rd(i) && rd(i) !== CMDSEP; ++i);
            if (rd(i)) curCmd = i + 1;
          } else curCmd = 0;
          if (nextCmd > 0) wr(nextCmd - 1, 0);
        } /* !# loop end */
      }
      break;
    }
    if (again) continue;
    if (g.cmdMod === SKIP) {
      g.cmdMod = 0;
      continue;
    }
    return cstr(curCmd);
  }
}

function logWrite(s: string): void {
  const f = logfile!;
  logChain = logChain.then(() => host.appendFile(f, s)).catch(() => false);
}

/**
 * cdb_fputs(str, wout) - screen output with file logging
 *   wout==FORCE: always output; wout==COND: output may be supressed by '@' or '&'
 */
export function cdb_fputs(str: string, wout: number): void {
  if ((silent !== 2 || wout === FORCE) && logfile) logWrite(str);
  if (!silent || wout === FORCE) host.display.puts(str);
  g.printAttr = 0;
}

function bad_arg(argStr: string): void {
  cdb_fputs(sprintf(S.badArgument, argStr), FORCE);
}

/** hash_str(str,length) - calculate hash value for length chars of str */
function hash_str(str: string, length: number): number {
  let hash = 0;
  for (let i = 0; i < length && i < str.length; ++i) {
    let mul = 1;
    for (let j = i + 1; j < length; ++j) mul *= 27;
    hash += (toupper(str[i]).charCodeAt(0) - 65 + 1) * mul;
  }
  return hash >>> 0;
}

/**
 * subst_eval(inpStr,result) - evaluate range field argument after substitution of special address
 * symbols: . $ A B PC PC# CYCLE ROUND LINES
 */
function subst_eval(inpStr: string, result: { v: bigint }): number {
  if (!inpStr) return RANGE_T;
  /* relative address +-expr is just .+-expr */
  let b = inpStr[0] === '-' || inpStr[0] === '+' ? '.' + inpStr : inpStr;
  const sub = (repl: string, w: string) => { b = b.split(repl).join(w); };
  sub('.', sprintf('%d', g.curAddr));
  sub('$', sprintf('%d', targetID === QUEUE && !g.warrior[QW].tasks ? targetSize - 2 : targetSize - 1));
  /* short cut: skip replacements if there are no letters in buffer */
  let pos = 0;
  while (pos < b.length && !isupper(b[pos])) ++pos;
  if (pos < b.length) {
    sub('A', sprintf('%d', targetID === PSP ? g.warrior[QW].pSpaceIndex : g.memory.A[targetSelect(g.curAddr)]));
    sub('B', sprintf('%d', targetID === PSP ? g.warrior[QW].pSpaceIndex : g.memory.B[targetSelect(g.curAddr)]));
    for (let i = g.warriors - 1; i >= 0; --i) {
      const v = targetID === QUEUE || targetID === PSP ? 0 : targetID === WARRIOR ? i : g.W === i ? g.progCnt : g.taskQueue[g.warrior[i].taskHead];
      sub(sprintf('PC%d', i + 1), sprintf('%d', v));
    }
    if (g.warriors < MAXWARRIOR) /* PCN where N==warriors is PC */
      sub(sprintf('PC%d', g.warriors), sprintf('%d', targetID === QUEUE || targetID === PSP ? 0 : targetID === WARRIOR ? g.W : g.progCnt));
    sub('PC', sprintf('%d', targetID === QUEUE || targetID === PSP ? 0 : targetID === WARRIOR ? g.W : g.progCnt));
    const wl = g.warriorsLeft ? g.warriorsLeft : 1;
    sub('CYCLE', sprintf('%d', Math.trunc((g.cycle + wl - 1) / wl)));
    sub('ROUND', sprintf('%d', g.round_num));
    sub('LINES', sprintf('%d', textLines()));
  }
  const evalerr = eval_expr(b, result);
  if (evalerr >= OK_EXPR) {
    if (evalerr === OVERFLOW) {
      cdb_fputs(S.overflowErr, COND);
      cdb_fputs('\n', COND);
    }
    return RANGE_T;
  }
  return TEXT_T; /* this is somewhat poorly handled */
}

/** parse_cmd - into verb, range (start, stop), argument string */
function parse_cmd(inpStr: string): { type: number; verb: string; arg: string } {
  let p = 0;
  while (isspace(inpStr[p])) p++;
  if (inpStr[p] === '@') {
    p++;
    silent = 1;
    while (isspace(inpStr[p])) p++;
  } else if (inpStr[p] === '&') { /* even logfile output is disabled */
    p++;
    silent = 2;
    while (isspace(inpStr[p])) p++;
  } else silent = 0;
  /* get verb, inpStr starts with non-whitespace char */
  let verb = '';
  while (isalpha(inpStr[p]) && verb.length < MAXARG) verb += inpStr[p++];
  while (isspace(inpStr[p])) p++;
  /* if string argument, we're done */
  let arg = inpStr.slice(p, p + MAXARG);
  /* we don't want trailing spaces in file names */
  let e = arg.length - 1;
  while (e >= 0 && isspace(arg[e])) --e;
  arg = arg.slice(0, e + 1);
  /* range or address? - scan first value */
  let buffer1 = '';
  for (; p < inpStr.length && inpStr[p] !== ','; ++p) buffer1 += toupper(inpStr[p]);
  if (inpStr[p] === ',') {
    commaSep = 1;
    ++p;
  } else commaSep = 0;
  while (isspace(inpStr[p])) p++;
  let buffer2 = '';
  for (; p < inpStr.length; ++p) buffer2 += toupper(inpStr[p]);
  /* replace all special address symbols and evaluate expressions */
  const r1 = { v: 0n }, r2 = { v: 0n };
  if (subst_eval(buffer1, r1) === TEXT_T || subst_eval(buffer2, r2) === TEXT_T) return { type: TEXT_T, verb, arg };
  if (!buffer1 && !buffer2) return { type: RANGE_T, verb, arg };
  else if (buffer1 && buffer2) {
    start = r1.v;
    stop = r2.v;
  } else if (buffer1 && commaSep) {
    start = r1.v;
    stop = BigInt(g.curAddr);
  } else if (buffer1) {
    start = r1.v;
    stop = r1.v;
  } else {
    start = BigInt(g.curAddr);
    stop = r2.v;
  }
  return { type: RANGE_T, verb, arg };
}

/** a paging prompt: false if the user typed q */
async function page(): Promise<'q' | 'a' | ''> {
  let x = await get_cmd(S.pagePrompt);
  x = x.replace(/^\s+/, '');
  if (x[0] === 'q' || x[0] === 'Q') {
    cdb_fputs('\n', COND);
    return 'q';
  }
  return x[0] === 'a' || x[0] === 'A' ? 'a' : '';
}

async function help(): Promise<void> {
  let count = 0;
  const showLines = textLines() - 1;
  for (let helpIdx = 0; S.helpText[helpIdx]; ++helpIdx) {
    if (!silent && ++count === showLines) {
      const r = await page();
      if (r === 'q') break;
      if (r !== 'a') count = 0;
    }
    cdb_fputs(S.helpText[helpIdx], COND);
  }
}

function setAttr(start: number): void {
  if (targetID === QUEUE && start === 0) g.printAttr = QW + 1;
  else if (targetID === WARRIOR && start === g.W) g.printAttr = g.W + 1;
  else if (targetID === CORE)
    for (let i = 0; i < g.warriors; ++i)
      if (g.warrior[i].tasks && (g.W === i ? g.progCnt : g.taskQueue[g.warrior[i].taskHead]) === start) {
        g.printAttr = i + 1;
        break;
      }
}

/** print_core - list core addresses in range start-stop */
async function print_core(start: number, stop: number): Promise<void> {
  let count = 0;
  const showLines = textLines() - 1;
  setAttr(start);
  cdb_fputs(targetview(start), COND);
  while (start !== stop) {
    if (++start === targetSize) start = 0;
    if (!silent && ++count === showLines && start !== stop) {
      const r = await page();
      if (r === 'q') break;
      if (r !== 'a') count = 0;
    }
    setAttr(start);
    cdb_fputs(targetview(start), COND);
  }
}

function set_trace(start: number, stop: number): void {
  do {
    if (start === targetSize) start = 0;
    g.memory.dbg[targetSelect(start)] |= 1;
  } while (start++ !== stop);
}

function unset_trace(start: number, stop: number): void {
  do {
    if (start === targetSize) start = 0;
    g.memory.dbg[targetSelect(start)] &= ~1;
  } while (start++ !== stop);
}

/** print_registers - show simulator status */
function print_registers(): void {
  const W = g.warrior[g.W], Wo = g.warrior[W2];
  const taskHalf = g.coreSize <= 10000 ? 7 : 5;
  const tq = g.taskQueue, total = g.totaltask;
  let nFuture: number, nPast: number, count: number, thisProc: number;
  const wl = g.warriorsLeft ? g.warriorsLeft : 1;
  cdb_fputs(sprintf(S.roundOfCycle, g.round_num, g.rounds, Math.trunc((g.cycle + wl - 1) / wl)), COND);
  cdb_fputs(sprintf(S.currentlyExecutingWarrior, g.W, W.name), COND);
  cdb_fputs(sprintf(S.processesActive, W.tasks), COND);
  if (W.tasks > taskHalf * 2) {
    nPast = nFuture = taskHalf;
    cdb_fputs('.. ', COND);
  } else {
    nPast = W.tasks >> 1;
    nFuture = W.tasks - nPast;
  }
  if (W.taskTail < nPast) thisProc = W.taskTail + (total - nPast);
  else thisProc = W.taskTail - nPast;
  for (count = nPast; --count >= 0;) {
    cdb_fputs(sprintf('%d ', tq[thisProc]), COND);
    if (++thisProc === total) thisProc = 0;
  }
  if (W.tasks) {
    cdb_fputs(sprintf('[%d]-> ', g.progCnt), COND);
    for (thisProc = W.taskHead, count = 1; count < nFuture; count++) {
      cdb_fputs(sprintf('%d ', tq[thisProc]), COND);
      if (++thisProc === total) thisProc = 0;
    }
  }
  if (W.tasks > taskHalf * 2) cdb_fputs('..', COND);
  cdb_fputs('\n', COND);
  const pspace = (w: typeof W) => {
    cdb_fputs(sprintf('P-space[%d]: <%d> ', w.pSpaceIndex, w.lastResult), COND);
    for (count = 1; count < 10; ++count) cdb_fputs(sprintf('%d ', g.pSpace[w.pSpaceIndex]?.[count] ?? 0), COND);
    cdb_fputs('..\n', COND);
  };
  pspace(W);
  if (g.warriors === 2) {
    cdb_fputs(sprintf(S.otherWarrior, Wo.name), COND);
    cdb_fputs(sprintf(S.processesActive, Wo.tasks), COND);
    if (Wo.tasks < taskHalf * 2) {
      nPast = Wo.tasks >> 1;
      nFuture = Wo.tasks - nPast;
    } else {
      nPast = nFuture = taskHalf;
      cdb_fputs('.. ', COND);
    }
    if (Wo.taskTail < nPast) thisProc = Wo.taskTail + (total - nPast);
    else thisProc = Wo.taskTail - nPast;
    for (; thisProc < Wo.taskTail;) {
      cdb_fputs(sprintf('%d ', tq[thisProc]), COND);
      if (++thisProc === total) thisProc = 0;
    }
    thisProc = Wo.taskHead;
    cdb_fputs(sprintf('[%d]-> ', tq[thisProc]), COND);
    for (count = 1; count < nFuture; count++) {
      if (++thisProc === total) thisProc = 0;
      cdb_fputs(sprintf('%d ', tq[thisProc]), COND);
    }
    if (Wo.tasks > taskHalf * 2) cdb_fputs('..', COND);
    cdb_fputs('\n', COND);
    pspace(Wo);
  } else if (g.warriors > 2) {
    for (let t = 0; t < g.warriors; ++t)
      if (t !== g.W) {
        const TW = g.warrior[t];
        cdb_fputs(sprintf(S.warriorAtAddressHasActiveProcesses, t, TW.name, tq[TW.taskHead], TW.tasks,
          TW.tasks === 1 ? '' : S.pluralEndingOfProcess), COND);
      }
    cdb_fputs(sprintf(S.ofWarriorsAreAlive, g.warriorsLeft, g.warriors), COND);
  }
}

const coreFold = (r: bigint): number => {
  const c = BigInt(g.coreSize);
  return Number(BigInt.asIntN(32, ((r % c) + c) % c));
};

/** edit_core - modify range of core addresses */
async function edit_core(start: number, stop: number): Promise<void> {
  let sstart = start;
  const sstop = start <= stop ? stop : stop + targetSize;
  do {
    cdb_fputs(targetview(start), COND);
    let o: string;
    if (targetID === QUEUE) o = sprintf('%-4d->%05d   ', start, queue(start));
    else if (targetID === WARRIOR) o = sprintf('#%-2d:  %05d   ', start, g.W === start ? g.progCnt : g.taskQueue[g.warrior[start].taskHead]);
    else if (targetID === PSP) o = sprintf('[%4d]=', start);
    else o = sprintf('%05d   ', start); /* targetID == CORE */
    cdb_fputs(o, COND);
    const x = (await get_cmd('')).replace(/^\s+/, '');
    let result: number;
    if (x) {
      if (targetID === PSP) { /* edit P-cell */
        const r = { v: 0n };
        const evalerr = eval_expr(x, r);
        if (evalerr < OK_EXPR) {
          cdb_fputs(evalerr === DIV_ZERO ? S.divZeroErr : S.badExprErr, FORCE);
          cdb_fputs('\n', FORCE);
          return;
        }
        if (evalerr === OVERFLOW) {
          cdb_fputs(S.overflowErr, COND);
          cdb_fputs('\n', COND);
        }
        const v = coreFold(r.v);
        const q = g.warrior[QW];
        if (start) g.pSpace[q.pSpaceIndex]![start] = v;
        else q.lastResult = v;
      } else if ((result = parse(x, g.memory, targetSelect(start))) < 0) return;
    }
    result = 1; /* empty input (as the C code has it, the count is always 1) */
    sstart += result;
    while (result--) {
      cdb_fputs(targetview(start++), COND);
      if (start === targetSize) start -= targetSize;
    }
  } while (sstart <= sstop);
}

/** fill_core - fill range of core addresses with instruction */
async function fill_core(start: number, stop: number): Promise<void> {
  let sstart = start;
  const sstop = start <= stop ? stop : stop + targetSize;
  let evalres = 0;
  cdb_fputs(S.fillWith, COND);
  const x = (await get_cmd('')).replace(/^\s+/, '');
  if (targetID === PSP) {
    const r = { v: 0n };
    const evalerr = eval_expr(x, r);
    if (evalerr < OK_EXPR) {
      cdb_fputs(evalerr === DIV_ZERO ? S.divZeroErr : S.badExprErr, FORCE);
      cdb_fputs('\n', FORCE);
      return;
    }
    if (evalerr === OVERFLOW) {
      cdb_fputs(S.overflowErr, COND);
      cdb_fputs('\n', COND);
    }
    evalres = coreFold(r.v);
  }
  if (x)
    do {
      let result: number;
      if (targetID === PSP) {
        const w = g.warrior[g.W];
        if (start) g.pSpace[w.pSpaceIndex]![start] = evalres;
        else w.lastResult = evalres;
        result = 1;
      } else if ((result = parse(x, g.memory, targetSelect(start))) <= 0) return;
      sstart += result;
      while (result--) if (++start === targetSize) start -= targetSize;
    } while (sstart <= sstop);
}

/** wildsearch() - 0 if pattern (* any chars, ? one char; spaces not significant) matches target */
function wildsearch(pattern: string, target: string, pi = 0, ti = 0): number {
  let pat = pi, tar = ti;
  for (;;) {
    while (isspace(pattern[pat])) ++pat;
    while (isspace(target[tar])) ++tar;
    if (pat >= pattern.length) return 0; /* match! */
    else if (pattern[pat] === '*') return wildsearch(pattern, target, pat + 1, tar);
    else if (tar < target.length && (pattern[pat] === target[tar] || pattern[pat] === '?')) {
      ++pat;
      ++tar;
    } else if (pattern[pat] === '?' && tar >= target.length) {
      ++pat;
      ++tar;
    } else if (tar >= target.length) return 1; /* no match */
    else { /* mismatch, reset pattern to start */
      pat = pi;
      ++tar;
    }
  }
}

/** load_macros() - load macros from file ("user": from the keyboard) */
async function load_macros(fnStr: string): Promise<void> {
  if (!fnStr) fnStr = 'pmars.mac';
  let lines: string[] | null = null;
  let k = 0;
  if (fnStr === 'user') cdb_fputs(S.dotByItselfEndsKeyboardInput, COND); /* special symbol, read from stdin */
  else {
    const text = await host.readFile(fnStr);
    if (text === null) {
      cdb_fputs(sprintf(S.cannotOpenMacroFile, fnStr), FORCE);
      return;
    }
    lines = text.match(/[^\n]*\n|[^\n]+$/g) ?? [];
  }
  for (;;) {
    let outs = '';
    let conLine = false;
    let rv: string | null = null;
    do {
      rv = lines ? (k < lines.length ? lines[k++] : null) : await host.display.gets(MAXSTR - outs.length);
      if (rv === null) break;
      let l = rv;
      const e = l.search(/[\n\r]/);
      if (e >= 0) l = l.slice(0, e);
      outs += l;
      if (outs.endsWith('\\')) { /* line continued */
        conLine = true;
        outs = outs.slice(0, -1);
      } else conLine = false;
    } while (conLine);
    if (rv === null || (outs[0] === '.' && (outs.length < 2 || outs.charCodeAt(1) <= 13))) break; /* user input */
    /* capitalize name and "normalize" */
    let i = 0, buffer1 = '';
    for (; i < outs.length && outs[i] !== '='; ++i) if (!isspace(outs[i])) buffer1 += toupper(outs[i]);
    if (i < outs.length) {
      if (outs.length >= MAXSTR) buffer1 = sprintf('%s= echo Macro %s is too long (>= %d chars)~reset', buffer1, buffer1, MAXSTR);
      else buffer1 += outs.slice(i);
    } else continue; /* we hit a "comment" line -> ignore */
    let tabIdx = 0;
    for (; tabIdx < MAXMACROS && tabIdx < macroTab.length && match_macro(buffer1, macroTab[tabIdx]) === null; ++tabIdx);
    if (tabIdx === MAXMACROS) {
      cdb_fputs(S.maximumNumberOfMacrosExceeded, FORCE);
      break;
    }
    macroTab[tabIdx] = buffer1;
  }
}

/** match_macro - the definition after "=" if the name matches, else null */
function match_macro(match: string, macroDef: string): string | null {
  let i = 0;
  while ((match[i] ?? '') === (macroDef[i] ?? '\0') && macroDef[i] !== '=') i++;
  if (macroDef[i] === '=' && (i >= match.length || match[i] === '=')) return macroDef.slice(i + 1);
  return null;
}

async function print_macros(): Promise<void> {
  let count = 0;
  const showLines = textLines() - 1;
  for (let macroIdx = 0; macroIdx < macroTab.length; ++macroIdx) {
    if (!silent && ++count === showLines) {
      const r = await page();
      if (r === 'q') break;
      if (r !== 'a') count = 0;
    }
    cdb_fputs(macroTab[macroIdx], COND);
    cdb_fputs('\n', COND);
  }
}

/** exec_macro - execute macro by queuing as a command line */
function exec_macro(macro: string): void {
  macro = macro.replace(/[a-z]/g, (c) => c.toUpperCase());
  for (let macroIdx = 0; macroIdx < macroTab.length; ++macroIdx)
    if ((nextMacro = match_macro(macro, macroTab[macroIdx])) !== null) break;
  if (nextMacro === null) cdb_fputs(sprintf(S.unknownMacro, macro), FORCE);
}

function queueview(loc: number): string {
  const qloc = queue(loc);
  return sprintf('%-4d->%05d   %s\n', loc, qloc, cellview(g.memory.get(qloc), 0));
}

function warriorview(loc: number): string {
  const wloc = g.W === loc ? g.progCnt : g.taskQueue[g.warrior[loc].taskHead];
  return sprintf('#%-2d:  %05d   %s\n', loc, wloc, cellview(g.memory.get(wloc), 0));
}

function pspaceview(loc: number): string {
  loc %= g.pSpaceSize;
  const q = g.warrior[QW];
  return sprintf('[%4d]=%-5d\n', loc, loc ? g.pSpace[q.pSpaceIndex]![loc] : q.lastResult);
}

/* ------------------------------------------------------------ results */

export function score(warnum: number): number {
  let accu = 0n;
  for (let surv = 1; surv <= g.warriors; ++surv) {
    set_reg('S', BigInt(surv));
    const res = { v: 0n };
    if (eval_expr(g.SWITCH_eq, res) < OK_EXPR) return INT_MIN; /* hopefully clparse will catch errors earlier */
    accu = BigInt.asIntN(32, accu + BigInt(g.warrior[warnum].score[surv - 1]) * res.v);
  }
  return Number(accu);
}

/* total the number of deaths for warrior[warnum] */
export function deaths(warnum: number): number {
  let accu = 0;
  for (let i = g.warriors; i < 2 * g.warriors - 1; ++i) accu += g.warrior[warnum].score[i];
  return accu;
}

export function sort_by_score(idxV: number[], scrV: number[]): void {
  let sorted: boolean;
  do {
    sorted = true;
    for (let i = 0; i < g.warriors - 1; ++i)
      if (scrV[idxV[i]] < scrV[idxV[i + 1]]) {
        const tmp = idxV[i];
        idxV[i] = idxV[i + 1];
        idxV[i + 1] = tmp;
        sorted = false;
      }
  } while (!sorted);
}

/** results(outp): null = the X window's panel (cdb's "progress"), 'stdout', or 'log' (cdb's logfile) */
export function results(outp: null | 'stdout' | 'log'): void {
  const idxV: number[] = [], scrV: number[] = [];
  const saveW = { v: 0n }, saveS = { v: 0n };
  eval_expr('W', saveW); /* save these registers if in use */
  eval_expr('S', saveS);
  set_reg('W', BigInt(g.warriors)); /* 'W' used in score calculation */
  for (let i = 0; i < g.warriors; ++i) {
    idxV[i] = i;
    scrV[i] = score(i);
  }
  if (g.SWITCH_o) sort_by_score(idxV, scrV);
  const W = g.warrior;
  let out = '';
  for (let i = 0; i < g.warriors; ++i) {
    out += sprintf(S.nameByAuthorScores, W[idxV[i]].name, W[idxV[i]].authorName, scrV[idxV[i]]);
    if (g.warriors > 2) {
      out += S.resultsAre;
      for (let j = 0; j < g.warriors; ++j) out += sprintf(' %d', W[idxV[i]].score[j]);
      if (!outp) out += '\n'; /* the X11 build's panel output has this extra newline */
      out += sprintf(' %d\n', deaths(idxV[i]));
    }
  }
  if (g.warriors === 2) out += sprintf(S.resultsWLT, W[idxV[0]].score[0], W[idxV[0]].score[2], W[idxV[0]].score[1]);
  if (!outp) host.display.puts(out);
  else if (outp === 'stdout') host.stdout(out);
  else if (logfile) logWrite(out);
  set_reg('W', saveW.v); /* restore previous value of register */
  set_reg('S', saveS.v);
}
