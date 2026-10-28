// pmars.c: main(), init(), body() (assemble, list, simulate, print the results), Exit() and the -Q
// return codes, P-space allocation, and decode_vopt() for -v.
import {
  g, reset_globals, SUCCESS, WARNING, MEMERR, PARSEERR, DAT, mF, DIRECT, PIN_APPEARED, UNSHARED, PMARSVER,
  SPEEDLEVELS, loopDelayAr, keyDelayAr,
} from './global.ts';
import { host, Exit, errout } from './host.ts';
import { sprintf } from './libc.ts';
import { parse_param } from './clparse.ts';
import { assemble, reset_asm, LineTooLong } from './asm.ts';
import { disasm } from './disasm.ts';
import { simulator1, MAXALLOC } from './sim.ts';
import { score, deaths, results, sort_by_score, reset_cdb } from './cdb.ts';
import { set_reg, reset_eval } from './eval.ts';
import { reset_pos } from './pos.ts';
import * as S from './str_eng.ts';

/* contains number of P-spaces allocated, < warriors with PIN */
let pspP = 0;

export function decode_vopt(option: number): void {
  g.xDisplayType = Math.trunc(option / 1000) % 10;
  option %= 1000;
  g.displayLevel = option % 10;
  g.displayMode = Math.trunc((option % 100 - g.displayLevel) / 10);
  g.displaySpeed = Math.trunc((option - g.displayMode * 10 - g.displayLevel) / 100);
  if (g.displaySpeed >= SPEEDLEVELS) g.displaySpeed = SPEEDLEVELS - 1;
  g.loopDelay = loopDelayAr[g.displaySpeed];
  g.keyDelay = keyDelayAr[g.displaySpeed];
}

function init(): void {
  g.INITIALINST.opcode = DAT * 8 + mF;
  g.INITIALINST.A_mode = g.INITIALINST.B_mode = DIRECT;
  g.INITIALINST.A_value = g.INITIALINST.B_value = g.INITIALINST.debuginfo = 0;
  g.errorcode = SUCCESS;
  g.errorlevel = WARNING;
  g.errmsg = '';
  decode_vopt(g.SWITCH_v);
  if (!host.stdinIsTty) g.inputRedirection = true;
}

async function body(): Promise<void> {
  for (let i = 0; i < g.warriors && g.errorcode === SUCCESS; i++) {
    const w = g.warrior[i];
    if (!(await assemble(w.fileName!, i)) && !g.SWITCH_b) {
      if (!g.SWITCH_A) host.stdout(sprintf(S.info01, w.name, w.instLen, w.authorName));
      disasm(w.instBank ?? [], w.instLen, w.offset);
      if (g.SWITCH_A) {
        if (w.pSpaceIndex === PIN_APPEARED) host.stdout(sprintf('       PIN     %6ld\n', w.pSpaceIDNumber));
        host.stdout('       END\n');
      } else host.stdout('\n');
    }
  }
  pspace_init(); /* set up pSpace */
  if (g.rounds && !g.SWITCH_A && g.errorcode === SUCCESS) {
    await simulator1();
    if (g.SWITCH_k) {
      set_reg('W', BigInt(g.warriors)); /* 'W' used in score calculation */
      const w = g.warrior;
      if (g.warriors === 2) /* standard 2-warrior game */
        host.stdout(sprintf('%d %d\n%d %d\n', w[0].score[0], w[0].score[1], w[1].score[0], w[1].score[1]));
      else /* multiwarrior */
        for (let i = 0; i < g.warriors; i++) {
          let o = sprintf('%d ', score(i));
          for (let j = 0; j < g.warriors; j++) o += sprintf('%d ', w[i].score[j]);
          host.stdout(o + sprintf('%d\n', deaths(i)));
        }
    } else results('stdout');
  }
}

/** return exitcode based on SWITCH_Q setting, useful mainly in scripts */
function returninfo(): number {
  const VARIANT = 2; /* GRAPHX */
  if (g.SWITCH_Q >= 1 && g.SWITCH_Q <= 999) {
    const idxV: number[] = [], scrV: number[] = [];
    set_reg('W', BigInt(g.warriors));
    for (let i = 0; i < g.warriors; ++i) {
      scrV[i] = score(i);
      idxV[i] = i;
    }
    if (g.SWITCH_o) sort_by_score(idxV, scrV);
    if (g.SWITCH_Q <= g.warriors) return scrV[idxV[g.SWITCH_Q - 1]];
    else if (g.SWITCH_Q >= 101 && g.SWITCH_Q <= 100 + g.warriors) return idxV[g.SWITCH_Q - 101] + 1;
    return -1; /* unknown -Q argument */
  }
  switch (g.SWITCH_Q) {
    case 1000: return PMARSVER; /* version */
    case 1001: return VARIANT; /* SERVER, GRAPHX, etc. */
    case 1002: return PMARSVER * 10 + VARIANT;
    case 1003: return 4; /* core address size (int or short) */
    case 2000: return g.warriors - pspP + 1; /* how many warriors share a P-space */
    default: return -1;
  }
}

function pspace_init(): void {
  const w = g.warrior;
  for (let i = 0; i < g.warriors; ++i) {
    if (w[i].pSpaceIndex === UNSHARED) w[i].pSpaceIndex = pspP++;
    else if (w[i].pSpaceIndex === PIN_APPEARED) { /* PIN appeared and unmatched */
      w[i].pSpaceIndex = pspP;
      for (let j = i + 1; j < g.warriors; ++j) if (w[i].pSpaceIDNumber === w[j].pSpaceIDNumber) w[j].pSpaceIndex = pspP;
      ++pspP;
    } /* else: pSpace already shared, don't increment pspP */
  }
  /* allocate space */
  for (let i = 0; i < g.warriors; ++i) {
    w[i].lastResult = g.coreSize - 1; /* unlikely number */
    const j = w[i].pSpaceIndex;
    if (g.pSpace[j] === null) {
      if (g.pSpaceSize > MAXALLOC) {
        errout(S.outOfMemory);
        throw new Exit(MEMERR);
      }
      g.pSpace[j] = new Int32Array(g.pSpaceSize);
    }
  }
}

/** a new process: every global of the C program as it starts */
function reset_process(): void {
  reset_globals();
  reset_asm();
  reset_cdb();
  reset_eval();
  reset_pos();
  pspP = 0;
}

/**
 * main(argc, argv) with argv[0] left out; returns the exit status. `server`: built as a SERVER (KotH)
 * pMARS is, without the debugger: an online battle must run the same on every client.
 */
export async function main(args: string[], o: { server?: boolean } = {}): Promise<number> {
  reset_process();
  g.server = !!o.server;
  const status = (code: number) => (g.SWITCH_Q >= 0 ? returninfo() : code);
  try {
    if ((g.errorcode = await parse_param(args)) === 0) {
      init();
      await body();
      return status(g.errorcode);
    }
    return status(g.errorcode);
  } catch (e) {
    if (e instanceof Exit) return status(e.code);
    if (e instanceof LineTooLong) {
      /* pMARS 0.9.5 never returns here; the port says why it stops */
      errout(`pmars: ${e.message}: pMARS 0.9.5 loops forever on this input\n`);
      return PARSEERR;
    }
    throw e;
  }
}
