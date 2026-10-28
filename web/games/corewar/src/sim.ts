// sim.c: the simulator (MARS). One function, simulator1(), runs all rounds: placement (pos.c), loading,
// and the cycle loop with operand evaluation and every ICWS'94 opcode/modifier, P-space, read/write
// limits (RWLIMIT), process queues, and the X display's calls (xwindisp.h decides by displayLevel which
// accesses are shown). The control flow is the C code's: its gotos are the `act` values below, its
// `continue` (after a warrior died) goes to the loop condition as in C.
import {
  g, Core, MEMERR, STEP, BREAK, NOBREAK, IMMEDIATE, DIRECT, INDIRECT, PREDECR, POSTINC, INDIR_A, RAW_MODE,
  MOV, ADD, SUB, MUL, DIV, MOD, JMZ, JMN, DJN, CMP, SLT, SPL, DAT, JMP, SEQ, SNE, NOP, LDP, STP,
  mA, mB, mAB, mBA, mF, mX, mI,
} from './global.ts';
import { host, errout } from './host.ts';
import { sprintf, i32 } from './libc.ts';
import { posit, npos, rng } from './pos.ts';
import { cdb } from './cdb.ts';
import { Exit } from './host.ts';
import * as S from './str_eng.ts';

const OP = (opcode: number, modifier: number): number => (opcode << 3) + modifier;

/** the most cells/queue entries the port allocates: beyond it, malloc() "fails" as on a small machine */
export const MAXALLOC = 1 << 22;

/** checksum_warriors(): the -f seed, from the warriors' code */
export function checksum_warriors(): number {
  let shuffle = 0;
  let checksum = 0;
  for (let W = 0; W < g.endWar; W++) {
    const w = g.warrior[W];
    for (let i = 0; i < w.instLen; i++) {
      const c = w.instBank![i];
      checksum = i32(checksum + (c.opcode ^ shuffle++));
      checksum = i32(checksum + (c.A_mode ^ shuffle++));
      checksum = i32(checksum + (c.B_mode ^ shuffle++));
      checksum = i32(checksum + (c.A_value ^ shuffle++));
      checksum = i32(checksum + (c.B_value ^ shuffle++));
    }
  }
  return checksum;
}

const ACT_NEXT = 0, ACT_PUSHTEMP = 1, ACT_NOPUSH = 2, ACT_DIE = 3;

export async function simulator1(): Promise<void> {
  const D = host.display;
  let permidx = 0, permtmp: number, permbuf: Int32Array | null = null;
  const coreSize = g.coreSize;
  const positions = coreSize + 1 - (g.separation << 1);
  const coreSize1 = coreSize - 1;
  const warrior = g.warrior;
  const warriors = g.warriors;
  let starter = 0;
  const cycles2 = Number(BigInt.asUintN(32, BigInt(warriors) * g.cycles));
  let temp = 0;
  let addrA = 0, addrB = 0;
  let raddrB = 0;
  let AA_Value = 0, AB_Value = 0;
  const readLimit = g.readLimit, writeLimit = g.writeLimit;

  g.endWar = warriors;

  if (g.SWITCH_P) {
    if (warriors * positions > MAXALLOC) {
      errout(S.outOfMemory);
      throw new Exit(MEMERR);
    }
    permbuf = new Int32Array(warriors * positions);
  }

  if (!g.alloc_p) {
    g.totaltask = Number(BigInt.asUintN(32, BigInt(g.taskNum) * BigInt(warriors) + 1n));
    if (coreSize > MAXALLOC || g.totaltask > MAXALLOC || g.taskNum + 1 > g.totaltask) {
      errout(S.outOfMemory);
      throw new Exit(MEMERR);
    }
    g.memory = new Core(coreSize);
    g.taskQueue = new Int32Array(g.totaltask);
    g.alloc_p = true;
  }
  const mem = g.memory;
  const MA = mem.A, MB = mem.B, Mop = mem.op, Mam = mem.am, Mbm = mem.bm, Mdbg = mem.dbg;
  const taskQueue = g.taskQueue;
  const endQueue = g.totaltask;
  const taskNum = g.taskNum;

  /* RWLIMIT: fold an address into the read or write window around progCnt */
  const foldr = (a: number): number => {
    let result = (a + coreSize - g.progCnt) % readLimit;
    result = result <= Math.trunc(readLimit / 2) ? result : result + coreSize - readLimit;
    if ((result = result + g.progCnt) >= coreSize) result -= coreSize;
    return result;
  };
  const foldw = (a: number): number => {
    let result = (a + coreSize - g.progCnt) % writeLimit;
    result = result <= Math.trunc(writeLimit / 2) ? result : result + coreSize - writeLimit;
    if ((result = result + g.progCnt) >= coreSize) result -= coreSize;
    return result;
  };

  if (g.SWITCH_e) g.debugState = STEP; /* automatically enter debugger */
  if (!g.debugState) g.copyDebugInfo = true; /* this makes things a little faster */
  g.seed = g.SWITCH_Fnum
    ? i32(g.SWITCH_Fnum - g.separation) /* seed from argument */
    : rng(g.SWITCH_f ? checksum_warriors() : i32(host.time())); /* seed from either checksum or time */
  if (g.SWITCH_Fnum && g.SWITCH_P) g.seed = Math.imul(g.seed, warriors); /* get table index from position */

  await D.open_graphics();
  g.round_num = 1;
  let lvl = g.displayLevel;
  do { /* each round */
    g.warriorsLeft = warriors;
    g.cycle = cycles2;
    if (warriors > 1) {
      if (warriors === 2) {
        if (g.SWITCH_P) {
          const pb = permbuf!;
          if (permidx === 0) for (; permidx < warriors * positions; permidx++) pb[permidx] = permidx; /* initialize buffer */
          permtmp = g.seed % permidx;
          warrior[1].position = g.separation + Math.trunc(pb[permtmp] / warriors);
          starter = pb[permtmp] % warriors;
          pb[permtmp] = pb[--permidx];
        } else warrior[1].position = g.separation + (g.seed % positions);
        g.seed = rng(g.seed);
      } else if (posit()) npos(); /* use back-up positioning algo npos if posit fails */
    }
    /* create nextWarrior links each round; leave oldW pointing to last warrior */
    let oldW: number;
    for (oldW = 0; oldW < g.endWar - 1; ++oldW) warrior[oldW].nextWarrior = oldW + 1;
    warrior[oldW].nextWarrior = 0;
    let W = starter;
    g.W = W;
    if (starter !== 0) oldW = starter - 1;
    addrA = warrior[0].instLen;
    /* clear the core following warrior 0 */
    const I = g.INITIALINST;
    do {
      MA[addrA] = I.A_value; MB[addrA] = I.B_value; Mop[addrA] = I.opcode; Mam[addrA] = I.A_mode; Mbm[addrA] = I.B_mode; Mdbg[addrA] = I.debuginfo;
    } while (++addrA < coreSize);
    let tempPtr2 = endQueue - taskNum - 1;
    temp = 0;
    do {
      /* initialize head, tail, and taskQueue */
      const w = warrior[W];
      w.taskHead = tempPtr2;
      w.taskTail = tempPtr2 + 1;
      taskQueue[tempPtr2] = (w.position + w.offset) % coreSize;
      w.tasks = 1;
      tempPtr2 -= taskNum;
      /* copy the warriors to core */
      for (let i = 0; i < w.instLen; i++) mem.set(w.position + i, w.instBank![i]);
      D.display_spl(temp, 1);
      W = w.nextWarrior;
      g.W = W;
    } while (++temp < warriors);

    D.display_clear();
    /* the inner loop of execution */
    cycles: do { /* each cycle */
      g.W = W;
      if (D.display_cycle()) await D.pause();
      lvl = g.displayLevel;
      let w = warrior[W];
      const progCnt = (g.progCnt = taskQueue[w.taskHead++]);
      let IR_A_value = MA[progCnt], IR_B_value = MB[progCnt], IR_opcode = Mop[progCnt];
      let IR_A_mode = Mam[progCnt], IR_B_mode = Mbm[progCnt];
      if (w.taskHead === endQueue) w.taskHead = 0;
      if (!g.server && g.debugState && (g.debugState === STEP || Mdbg[progCnt])) {
        g.debugState = await cdb('');
        lvl = g.displayLevel;
        W = g.W;
        w = warrior[W];
      }
      let pc = g.progCnt; /* cdb may have set it */

      /* evaluate A operand.  This is the hardest part of the entire simulator code. */
      if (IR_A_mode !== IMMEDIATE) {
        addrA = foldr(pc + IR_A_value);
        let tempPtr = addrA; /* Stores ptr to base ofs. core cell. */
        if (IR_A_mode !== DIRECT) {
          let waddrA = 0; /* core addr. of base ofs cell for predec/postinc modes */
          let offsA: boolean; /* the offset is the base cell's A-field (else its B-field) */
          if (INDIR_A(IR_A_mode)) {
            IR_A_mode = RAW_MODE(IR_A_mode);
            if (IR_A_mode !== INDIRECT) tempPtr = addrA = waddrA = foldw(pc + IR_A_value);
            else if (lvl > 3) D.display_read(addrA); /* INDIRECT -> read from base ofs. cell. */
            offsA = true;
          } else {
            if (IR_A_mode !== INDIRECT) tempPtr = addrA = waddrA = foldw(pc + IR_A_value);
            else if (lvl > 3) D.display_read(addrA);
            offsA = false;
          }
          temp = offsA ? MA[tempPtr] : MB[tempPtr];
          /* For pre-decrement modes, do the decrement now. */
          if (IR_A_mode === PREDECR) {
            if (--temp < 0) temp = coreSize1;
            if (offsA) MA[tempPtr] = temp; else MB[tempPtr] = temp;
            if (lvl > 2) D.display_dec(waddrA);
          }
          /* Compute the final A-operand's core address. */
          addrA = foldr(addrA + temp);
          /* Read the A-register values. */
          AA_Value = MA[addrA];
          IR_A_value = MB[addrA];
          /* For postincrement modes, do the increment now. */
          if (IR_A_mode === POSTINC) {
            if (++temp === coreSize) temp = 0;
            if (offsA) MA[tempPtr] = temp; else MB[tempPtr] = temp;
            if (lvl > 2) D.display_inc(waddrA);
          }
        } else { /* DIRECT */
          IR_A_value = MB[tempPtr];
          AA_Value = MA[tempPtr];
        }
      } else { /* IMMEDIATE */
        AA_Value = IR_A_value;
        addrA = pc;
        IR_A_value = IR_B_value;
      }

      /* evaluate B operand. */
      if (IR_B_mode !== IMMEDIATE) {
        raddrB = foldr(pc + IR_B_value);
        addrB = foldw(pc + IR_B_value);
        let tempPtr = raddrB;
        if (IR_B_mode !== DIRECT) {
          let offsA: boolean;
          if (INDIR_A(IR_B_mode)) {
            IR_B_mode = RAW_MODE(IR_B_mode);
            if (IR_B_mode !== INDIRECT) tempPtr = raddrB = addrB;
            else if (lvl > 3) D.display_read(raddrB);
            offsA = true;
          } else {
            if (IR_B_mode !== INDIRECT) tempPtr = raddrB = addrB;
            else if (lvl > 3) D.display_read(raddrB);
            offsA = false;
          }
          temp = offsA ? MA[tempPtr] : MB[tempPtr];
          if (IR_B_mode === PREDECR) {
            if (--temp < 0) temp = coreSize1;
            if (offsA) MA[tempPtr] = temp; else MB[tempPtr] = temp;
            if (lvl > 2) D.display_dec(addrB);
          }
          addrB = foldw(addrB + temp);
          raddrB = foldr(raddrB + temp);
          AB_Value = MA[raddrB];
          IR_B_value = MB[raddrB];
          if (IR_B_mode === POSTINC) {
            if (++temp === coreSize) temp = 0;
            if (offsA) MA[tempPtr] = temp; else MB[tempPtr] = temp;
            if (lvl > 2) D.display_inc(tempPtr);
          }
        } else {
          AB_Value = MA[tempPtr];
          IR_B_value = MB[tempPtr];
        }
      } else {
        addrB = pc;
        raddrB = pc;
        IR_B_value = MB[addrB];
        AB_Value = MA[addrB];
      }

      /*
       * addrA: the A-pointer (read); AA_Value: A field of the A-operand; IR_A_value: its B field.
       * addrB: the B-write-pointer; raddrB: the B-read-pointer; AB_Value: A field of the B-operand;
       * IR_B_value: its B field.
       */
      /* execute it! */
      if (lvl > 0) D.display_exec(pc);
      let act = ACT_NEXT;
      exec: switch (IR_opcode) {
        case OP(MOV, mA):
          if (lvl > 3) D.display_read(addrA);
          MA[addrB] = AA_Value;
          if (lvl > 1) D.display_write(addrB);
          break;
        case OP(MOV, mF):
          MA[addrB] = AA_Value;
        /* FALLTHRU */
        case OP(MOV, mB):
          if (lvl > 3) D.display_read(addrA);
          MB[addrB] = IR_A_value;
          if (lvl > 1) D.display_write(addrB);
          break;
        case OP(MOV, mAB):
          if (lvl > 3) D.display_read(addrA);
          MB[addrB] = AA_Value;
          if (lvl > 1) D.display_write(addrB);
          break;
        case OP(MOV, mX):
          MB[addrB] = AA_Value;
        /* FALLTHRU */
        case OP(MOV, mBA):
          if (lvl > 3) D.display_read(addrA);
          MA[addrB] = IR_A_value;
          if (lvl > 1) D.display_write(addrB);
          break;

        case OP(ADD, mA):
          if (lvl > 3) D.display_read(addrA);
          if ((temp = AB_Value + AA_Value) >= coreSize) temp -= coreSize;
          MA[addrB] = temp;
          if (lvl > 1) D.display_write(addrB);
          break;
        case OP(ADD, mI):
        case OP(ADD, mF):
          if ((temp = AB_Value + AA_Value) >= coreSize) temp -= coreSize;
          MA[addrB] = temp;
        /* FALLTHRU */
        case OP(ADD, mB):
          if (lvl > 3) D.display_read(addrA);
          if ((temp = IR_B_value + IR_A_value) >= coreSize) temp -= coreSize;
          MB[addrB] = temp;
          if (lvl > 1) D.display_write(addrB);
          break;
        case OP(ADD, mAB):
          if (lvl > 3) D.display_read(addrA);
          if ((temp = IR_B_value + AA_Value) >= coreSize) temp -= coreSize;
          MB[addrB] = temp;
          if (lvl > 1) D.display_write(addrB);
          break;
        case OP(ADD, mX):
          if ((temp = IR_B_value + AA_Value) >= coreSize) temp -= coreSize;
          MB[addrB] = temp;
        /* FALLTHRU */
        case OP(ADD, mBA):
          if (lvl > 3) D.display_read(addrA);
          if ((temp = AB_Value + IR_A_value) >= coreSize) temp -= coreSize;
          MA[addrB] = temp;
          if (lvl > 1) D.display_write(addrB);
          break;

        case OP(SUB, mA):
          if (lvl > 3) D.display_read(addrA);
          if ((temp = AB_Value - AA_Value) < 0) temp += coreSize;
          MA[addrB] = temp;
          if (lvl > 1) D.display_write(addrB);
          break;
        case OP(SUB, mI):
        case OP(SUB, mF):
          if ((temp = AB_Value - AA_Value) < 0) temp += coreSize;
          MA[addrB] = temp;
        /* FALLTHRU */
        case OP(SUB, mB):
          if (lvl > 3) D.display_read(addrA);
          if ((temp = IR_B_value - IR_A_value) < 0) temp += coreSize;
          MB[addrB] = temp;
          if (lvl > 1) D.display_write(addrB);
          break;
        case OP(SUB, mAB):
          if (lvl > 3) D.display_read(addrA);
          if ((temp = IR_B_value - AA_Value) < 0) temp += coreSize;
          MB[addrB] = temp;
          if (lvl > 1) D.display_write(addrB);
          break;
        case OP(SUB, mX):
          if ((temp = IR_B_value - AA_Value) < 0) temp += coreSize;
          MB[addrB] = temp;
        /* FALLTHRU */
        case OP(SUB, mBA):
          if (lvl > 3) D.display_read(addrA);
          if ((temp = AB_Value - IR_A_value) < 0) temp += coreSize;
          MA[addrB] = temp;
          if (lvl > 1) D.display_write(addrB);
          break;

        /* the cast (U32_T) prevents overflow: the product wraps at 32 bits */
        case OP(MUL, mA):
          if (lvl > 3) D.display_read(addrA);
          MA[addrB] = (Math.imul(AB_Value, AA_Value) >>> 0) % coreSize;
          if (lvl > 1) D.display_write(addrB);
          break;
        case OP(MUL, mI):
        case OP(MUL, mF):
          MA[addrB] = (Math.imul(AB_Value, AA_Value) >>> 0) % coreSize;
        /* FALLTHRU */
        case OP(MUL, mB):
          if (lvl > 3) D.display_read(addrA);
          MB[addrB] = (Math.imul(IR_B_value, IR_A_value) >>> 0) % coreSize;
          if (lvl > 1) D.display_write(addrB);
          break;
        case OP(MUL, mAB):
          if (lvl > 3) D.display_read(addrA);
          MB[addrB] = (Math.imul(IR_B_value, AA_Value) >>> 0) % coreSize;
          if (lvl > 1) D.display_write(addrB);
          break;
        case OP(MUL, mX):
          MB[addrB] = (Math.imul(IR_B_value, AA_Value) >>> 0) % coreSize;
        /* FALLTHRU */
        case OP(MUL, mBA):
          if (lvl > 3) D.display_read(addrA);
          MA[addrB] = (Math.imul(AB_Value, IR_A_value) >>> 0) % coreSize;
          if (lvl > 1) D.display_write(addrB);
          break;

        case OP(DIV, mA):
          if (lvl > 3) D.display_read(addrA);
          if (!AA_Value) { act = ACT_DIE; break; }
          MA[addrB] = Math.trunc(AB_Value / AA_Value);
          if (lvl > 1) D.display_write(addrB);
          break;
        case OP(DIV, mB):
          if (lvl > 3) D.display_read(addrA);
          if (!IR_A_value) { act = ACT_DIE; break; }
          MB[addrB] = Math.trunc(IR_B_value / IR_A_value);
          if (lvl > 1) D.display_write(addrB);
          break;
        case OP(DIV, mAB):
          if (lvl > 3) D.display_read(addrA);
          if (!AA_Value) { act = ACT_DIE; break; }
          MB[addrB] = Math.trunc(IR_B_value / AA_Value);
          if (lvl > 1) D.display_write(addrB);
          break;
        case OP(DIV, mBA):
          if (lvl > 3) D.display_read(addrA);
          if (!IR_A_value) { act = ACT_DIE; break; }
          MA[addrB] = Math.trunc(AB_Value / IR_A_value);
          if (lvl > 1) D.display_write(addrB);
          break;
        case OP(DIV, mI):
        case OP(DIV, mF):
          if (lvl > 3) D.display_read(addrA);
          if (AA_Value) {
            MA[addrB] = Math.trunc(AB_Value / AA_Value);
            if (lvl > 1) D.display_write(addrB);
            if (!IR_A_value) { act = ACT_DIE; break; }
            MB[addrB] = Math.trunc(IR_B_value / IR_A_value);
            if (lvl > 1) D.display_write(addrB);
            break;
          } else {
            if (!IR_A_value) { act = ACT_DIE; break; }
            MB[addrB] = Math.trunc(IR_B_value / IR_A_value);
            if (lvl > 1) D.display_write(addrB);
            act = ACT_DIE;
            break;
          }
        case OP(DIV, mX):
          if (lvl > 3) D.display_read(addrA);
          if (IR_A_value) {
            MA[addrB] = Math.trunc(AB_Value / IR_A_value);
            if (lvl > 1) D.display_write(addrB);
            if (!AA_Value) { act = ACT_DIE; break; }
            MB[addrB] = Math.trunc(IR_B_value / AA_Value);
            if (lvl > 1) D.display_write(addrB);
            break;
          } else {
            if (!AA_Value) { act = ACT_DIE; break; }
            MB[addrB] = Math.trunc(IR_B_value / AA_Value);
            if (lvl > 1) D.display_write(addrB);
            act = ACT_DIE;
            break;
          }

        case OP(MOD, mA):
          if (lvl > 3) D.display_read(addrA);
          if (!AA_Value) { act = ACT_DIE; break; }
          MA[addrB] = AB_Value % AA_Value;
          if (lvl > 1) D.display_write(addrB);
          break;
        case OP(MOD, mB):
          if (lvl > 3) D.display_read(addrA);
          if (!IR_A_value) { act = ACT_DIE; break; }
          MB[addrB] = IR_B_value % IR_A_value;
          if (lvl > 1) D.display_write(addrB);
          break;
        case OP(MOD, mAB):
          if (lvl > 3) D.display_read(addrA);
          if (!AA_Value) { act = ACT_DIE; break; }
          MB[addrB] = IR_B_value % AA_Value;
          if (lvl > 1) D.display_write(addrB);
          break;
        case OP(MOD, mBA):
          if (lvl > 3) D.display_read(addrA);
          if (!IR_A_value) { act = ACT_DIE; break; }
          MA[addrB] = AB_Value % IR_A_value;
          if (lvl > 1) D.display_write(addrB);
          break;
        case OP(MOD, mI):
        case OP(MOD, mF):
          if (lvl > 3) D.display_read(addrA);
          if (AA_Value) {
            MA[addrB] = AB_Value % AA_Value;
            if (lvl > 1) D.display_write(addrB);
            if (!IR_A_value) { act = ACT_DIE; break; }
            MB[addrB] = IR_B_value % IR_A_value;
            if (lvl > 1) D.display_write(addrB);
            break;
          } else {
            if (!IR_A_value) { act = ACT_DIE; break; }
            MB[addrB] = IR_B_value % IR_A_value;
            if (lvl > 1) D.display_write(addrB);
            act = ACT_DIE;
            break;
          }
        case OP(MOD, mX):
          if (lvl > 3) D.display_read(addrA);
          if (IR_A_value) {
            MA[addrB] = AB_Value % IR_A_value;
            if (lvl > 1) D.display_write(addrB);
            if (!AA_Value) { act = ACT_DIE; break; }
            MB[addrB] = IR_B_value % AA_Value;
            if (lvl > 1) D.display_write(addrB);
            break;
          } else {
            if (!AA_Value) { act = ACT_DIE; break; }
            MB[addrB] = IR_B_value % AA_Value;
            if (lvl > 1) D.display_write(addrB);
            act = ACT_DIE;
            break;
          }

        case OP(JMZ, mA):
        case OP(JMZ, mBA):
          if (lvl > 3) D.display_read(raddrB);
          if (AB_Value) break;
          temp = addrA; act = ACT_PUSHTEMP; break; /* push(addrA); goto nopush */
        case OP(JMZ, mF):
        case OP(JMZ, mX):
        case OP(JMZ, mI):
          if (lvl > 3) D.display_read(raddrB);
          if (AB_Value) break;
        /* FALLTHRU */
        case OP(JMZ, mB):
        case OP(JMZ, mAB):
          if (lvl > 3) D.display_read(raddrB);
          if (IR_B_value) break;
          temp = addrA; act = ACT_PUSHTEMP; break;

        case OP(JMN, mA):
        case OP(JMN, mBA):
          if (lvl > 3) D.display_read(raddrB);
          if (!AB_Value) break;
          temp = addrA; act = ACT_PUSHTEMP; break;
        case OP(JMN, mB):
        case OP(JMN, mAB):
          if (lvl > 3) D.display_read(raddrB);
          if (!IR_B_value) break;
          temp = addrA; act = ACT_PUSHTEMP; break;
        case OP(JMN, mF):
        case OP(JMN, mX):
        case OP(JMN, mI):
          if (lvl > 3) D.display_read(raddrB);
          if (!AB_Value && !IR_B_value) break;
          temp = addrA; act = ACT_PUSHTEMP; break;

        case OP(DJN, mA):
        case OP(DJN, mBA):
          if (--MA[addrB] < 0) MA[addrB] = coreSize1;
          if (lvl > 2) D.display_dec(addrB);
          if (lvl > 3) D.display_read(raddrB);
          if (AB_Value === 1) break;
          temp = addrA; act = ACT_PUSHTEMP; break;
        case OP(DJN, mB):
        case OP(DJN, mAB):
          if (--MB[addrB] < 0) MB[addrB] = coreSize1;
          if (lvl > 2) D.display_dec(addrB);
          if (lvl > 3) D.display_read(raddrB);
          if (IR_B_value === 1) break;
          temp = addrA; act = ACT_PUSHTEMP; break;
        case OP(DJN, mF):
        case OP(DJN, mI):
        case OP(DJN, mX):
          if (--MB[addrB] < 0) MB[addrB] = coreSize1;
          if (--MA[addrB] < 0) MA[addrB] = coreSize1;
          if (lvl > 2) D.display_dec(addrB);
          if (lvl > 3) D.display_read(raddrB);
          if (AB_Value === 1 && IR_B_value === 1) break;
          temp = addrA; act = ACT_PUSHTEMP; break;

        case OP(SEQ, mA):
        case OP(CMP, mA):
          if (lvl > 3) { D.display_read(raddrB); D.display_read(addrA); }
          if (AB_Value !== AA_Value) break;
          if ((temp = pc + 2) >= coreSize) temp -= coreSize;
          act = ACT_PUSHTEMP; break;
        case OP(SEQ, mI):
        case OP(CMP, mI):
          if (lvl > 3) { D.display_read(raddrB); D.display_read(addrA); }
          if (Mop[raddrB] !== Mop[addrA] || Mam[raddrB] !== Mam[addrA] || Mbm[raddrB] !== Mbm[addrA]) break;
        /* FALLTHRU */
        case OP(SEQ, mF):
        case OP(CMP, mF):
          if (lvl > 3) { D.display_read(raddrB); D.display_read(addrA); }
          if (AB_Value !== AA_Value) break;
        /* FALLTHRU */
        case OP(SEQ, mB):
        case OP(CMP, mB):
          if (lvl > 3) { D.display_read(raddrB); D.display_read(addrA); }
          if (IR_B_value !== IR_A_value) break;
          if ((temp = pc + 2) >= coreSize) temp -= coreSize;
          act = ACT_PUSHTEMP; break;
        case OP(SEQ, mAB):
        case OP(CMP, mAB):
          if (lvl > 3) { D.display_read(raddrB); D.display_read(addrA); }
          if (IR_B_value !== AA_Value) break;
          if ((temp = pc + 2) >= coreSize) temp -= coreSize;
          act = ACT_PUSHTEMP; break;
        case OP(SEQ, mX):
        case OP(CMP, mX):
          if (lvl > 3) { D.display_read(raddrB); D.display_read(addrA); }
          if (IR_B_value !== AA_Value) break;
        /* FALLTHRU */
        case OP(SEQ, mBA):
        case OP(CMP, mBA):
          if (lvl > 3) { D.display_read(raddrB); D.display_read(addrA); }
          if (AB_Value !== IR_A_value) break;
          if ((temp = pc + 2) >= coreSize) temp -= coreSize;
          act = ACT_PUSHTEMP; break;

        case OP(SNE, mA):
          if (lvl > 3) { D.display_read(raddrB); D.display_read(addrA); }
          if (AB_Value !== AA_Value) { /* skip: */ if ((temp = pc + 2) >= coreSize) temp -= coreSize; act = ACT_PUSHTEMP; break; }
          break;
        case OP(SNE, mI):
          if (lvl > 3) { D.display_read(raddrB); D.display_read(addrA); }
          if (Mop[raddrB] !== Mop[addrA] || Mam[raddrB] !== Mam[addrA] || Mbm[raddrB] !== Mbm[addrA]) {
            if ((temp = pc + 2) >= coreSize) temp -= coreSize; act = ACT_PUSHTEMP; break;
          }
        /* FALLTHRU */
        case OP(SNE, mF):
          if (lvl > 3) { D.display_read(raddrB); D.display_read(addrA); }
          if (AB_Value !== AA_Value) { if ((temp = pc + 2) >= coreSize) temp -= coreSize; act = ACT_PUSHTEMP; break; }
        /* FALLTHRU */
        case OP(SNE, mB):
          if (lvl > 3) { D.display_read(raddrB); D.display_read(addrA); }
          if (IR_B_value !== IR_A_value) { if ((temp = pc + 2) >= coreSize) temp -= coreSize; act = ACT_PUSHTEMP; break; }
          break;
        case OP(SNE, mAB):
          if (lvl > 3) { D.display_read(raddrB); D.display_read(addrA); }
          if (IR_B_value !== AA_Value) { if ((temp = pc + 2) >= coreSize) temp -= coreSize; act = ACT_PUSHTEMP; break; }
          break;
        case OP(SNE, mX):
          if (lvl > 3) { D.display_read(raddrB); D.display_read(addrA); }
          if (IR_B_value !== AA_Value) { if ((temp = pc + 2) >= coreSize) temp -= coreSize; act = ACT_PUSHTEMP; break; }
        /* FALLTHRU */
        case OP(SNE, mBA):
          if (lvl > 3) { D.display_read(raddrB); D.display_read(addrA); }
          if (AB_Value !== IR_A_value) { if ((temp = pc + 2) >= coreSize) temp -= coreSize; act = ACT_PUSHTEMP; break; }
          break;

        case OP(SLT, mA):
          if (lvl > 3) { D.display_read(raddrB); D.display_read(addrA); }
          if (AB_Value <= AA_Value) break;
          if ((temp = pc + 2) >= coreSize) temp -= coreSize;
          act = ACT_PUSHTEMP; break;
        case OP(SLT, mF):
        case OP(SLT, mI):
          if (lvl > 3) { D.display_read(raddrB); D.display_read(addrA); }
          if (AB_Value <= AA_Value) break;
        /* FALLTHRU */
        case OP(SLT, mB):
          if (lvl > 3) { D.display_read(raddrB); D.display_read(addrA); }
          if (IR_B_value <= IR_A_value) break;
          if ((temp = pc + 2) >= coreSize) temp -= coreSize;
          act = ACT_PUSHTEMP; break;
        case OP(SLT, mAB):
          if (lvl > 3) { D.display_read(raddrB); D.display_read(addrA); }
          if (IR_B_value <= AA_Value) break;
          if ((temp = pc + 2) >= coreSize) temp -= coreSize;
          act = ACT_PUSHTEMP; break;
        case OP(SLT, mX):
          if (lvl > 3) { D.display_read(raddrB); D.display_read(addrA); }
          if (IR_B_value <= AA_Value) break;
        /* FALLTHRU */
        case OP(SLT, mBA):
          if (lvl > 3) { D.display_read(raddrB); D.display_read(addrA); }
          if (AB_Value <= IR_A_value) break;
          if ((temp = pc + 2) >= coreSize) temp -= coreSize;
          act = ACT_PUSHTEMP; break;

        case OP(JMP, mA): case OP(JMP, mB): case OP(JMP, mAB): case OP(JMP, mBA):
        case OP(JMP, mF): case OP(JMP, mX): case OP(JMP, mI):
          temp = addrA; act = ACT_PUSHTEMP; break;

        case OP(SPL, mA): case OP(SPL, mB): case OP(SPL, mAB): case OP(SPL, mBA):
        case OP(SPL, mF): case OP(SPL, mX): case OP(SPL, mI):
          if ((temp = pc + 1) === coreSize) temp = 0;
          /* push(temp) */
          taskQueue[w.taskTail] = temp;
          if (++w.taskTail === endQueue) w.taskTail = 0;
          if (w.tasks >= taskNum) { act = ACT_NOPUSH; break; }
          ++w.tasks;
          D.display_spl(W, w.tasks);
          temp = addrA; act = ACT_PUSHTEMP; break;

        case OP(DAT, mA): case OP(DAT, mB): case OP(DAT, mAB): case OP(DAT, mBA):
        case OP(DAT, mF): case OP(DAT, mX): case OP(DAT, mI):
          act = ACT_DIE; break;

        case OP(NOP, mA): case OP(NOP, mB): case OP(NOP, mAB): case OP(NOP, mBA):
        case OP(NOP, mF): case OP(NOP, mX): case OP(NOP, mI):
          break;

        case OP(LDP, mA):
          if (lvl > 3) D.display_read(addrA);
          MA[addrB] = get_pspace(w, AA_Value);
          if (lvl > 1) D.display_write(addrB);
          break;
        case OP(LDP, mF): case OP(LDP, mX): case OP(LDP, mI): case OP(LDP, mB):
          if (lvl > 3) D.display_read(addrA);
          MB[addrB] = get_pspace(w, IR_A_value);
          if (lvl > 1) D.display_write(addrB);
          break;
        case OP(LDP, mAB):
          if (lvl > 3) D.display_read(addrA);
          MB[addrB] = get_pspace(w, AA_Value);
          if (lvl > 1) D.display_write(addrB);
          break;
        case OP(LDP, mBA):
          if (lvl > 3) D.display_read(addrA);
          MA[addrB] = get_pspace(w, IR_A_value);
          if (lvl > 1) D.display_write(addrB);
          break;
        case OP(STP, mA):
          if (lvl > 3) D.display_read(addrA);
          set_pspace(w, AB_Value, AA_Value);
          break;
        case OP(STP, mF): case OP(STP, mX): case OP(STP, mI): case OP(STP, mB):
          if (lvl > 3) D.display_read(addrA);
          set_pspace(w, IR_B_value, IR_A_value);
          break;
        case OP(STP, mAB):
          if (lvl > 3) D.display_read(addrA);
          set_pspace(w, IR_B_value, AA_Value);
          break;
        case OP(STP, mBA):
          if (lvl > 3) D.display_read(addrA);
          set_pspace(w, AB_Value, IR_A_value);
          break;

        case OP(MOV, mI): {
          if (lvl > 3) D.display_read(addrA);
          const keep = Mdbg[addrB];
          mem.copy(addrB, addrA);
          if (!g.copyDebugInfo) Mdbg[addrB] = keep;
          MB[addrB] = IR_A_value;
          MA[addrB] = AA_Value;
          if (lvl > 1) D.display_write(addrB);
          break exec;
        }
      } /* end switch */

      if (act === ACT_DIE) {
        D.display_dat(pc, W, w.tasks);
        if (--w.tasks) act = ACT_NOPUSH;
        else {
          w.score[g.warriorsLeft + warriors - 2]++;
          g.cycle = g.cycle - 1 - Math.trunc((g.cycle - 1) / g.warriorsLeft--);
          if (g.warriorsLeft < 2) break cycles; /* goto nextround */
          if (!g.server && g.debugState === BREAK) {
            g.debugState = await cdb(sprintf(S.warriorTerminated, W, w.name));
            W = g.W;
          }
          warrior[oldW].nextWarrior = W = warrior[W].nextWarrior;
          continue cycles; /* to the loop condition: --cycle */
        }
      }
      if (act === ACT_NEXT) {
        /* push the next instruction onto queue */
        if ((temp = pc + 1) === coreSize) temp = 0;
        act = ACT_PUSHTEMP;
      }
      if (act === ACT_PUSHTEMP) {
        taskQueue[w.taskTail] = temp;
        if (++w.taskTail === endQueue) w.taskTail = 0;
      }
      /* nopush: just go to the next warrior/cycle */
      oldW = W;
      W = w.nextWarrior;
    } while (--g.cycle); /* next cycle */
    g.W = W;
    /* nextround: */
    for (temp = 0; temp < warriors; temp++) {
      if (warrior[temp].tasks) {
        warrior[temp].score[g.warriorsLeft - 1]++;
        warrior[temp].lastResult = g.warriorsLeft;
      } else warrior[temp].lastResult = 0;
    }
    if (starter === g.endWar - 1) starter = 0;
    else ++starter;
    if (!g.server && g.debugState === BREAK) {
      let outs: string;
      if (g.warriorsLeft === 1 && warriors !== 1) outs = sprintf(S.warriorTerminatedEndOfRound, g.W, warrior[g.W].name, g.round_num);
      else outs = sprintf(S.endOfRound, g.round_num);
      g.debugState = await cdb(outs);
    }
  } while (++g.round_num <= g.rounds);

  await D.display_close(true);
  permbuf = null;
  g.alloc_p = false;
  void NOBREAK;
}

/* PSPACE: cell 0 of a warrior's P-space is its result of the last round */
function get_pspace(w: { pSpaceIndex: number; lastResult: number }, idx: number): number {
  const i = idx % g.pSpaceSize;
  return i ? g.pSpace[w.pSpaceIndex]![i] : w.lastResult;
}
function set_pspace(w: { pSpaceIndex: number; lastResult: number }, idx: number, value: number): void {
  const i = idx % g.pSpaceSize;
  if (i) g.pSpace[w.pSpaceIndex]![i] = value;
  else w.lastResult = value;
}
