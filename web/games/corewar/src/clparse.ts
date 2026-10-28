// clparse.c: the command line (and -@ option files): every option of the X11 build, with the
// original's usage screen, error messages and checks.
import {
  g, PMARSVER, PMARSDATE, MAXROUND, MAXCORESIZE, MAXTASKNUM, MAXINSTR, MAXSEPARATION, MAXWARRIOR, CLP_NOGOOD,
  DEFAULTCORESIZE, DEFAULTCYCLES, DEFAULTTASKNUM, DEFAULTINSTRLIM, DEFAULTROUNDS, OK_EXPR,
} from './global.ts';
import { errout, host } from './host.ts';
import { sprintf, atol, isdigit, isspace, LONG_MAX, INT_MAX } from './libc.ts';
import { eval_expr, set_reg } from './eval.ts';
import * as S from './str_eng.ts';

const CLP_MAXSTRLEN = 8000;
type DType = 'int' | 'addr' | 'long' | 'bool' | 'str';
const describe: Record<DType, string> = { int: '#', addr: '#', long: '#', bool: ' ', str: '$' };

interface Opt {
  word: string;
  key: string;
  min: bigint;
  max: bigint;
  def: bigint;
  dtype: DType;
  description: string | null;
  /** -display, -geometry, -fn: index into xStorage */
  x?: number;
}

/* xwindisp.c: the standard X command line options */
const xOptions = ['display', 'geometry', 'fn'];

/** where parse_param's options keep their values (C: the storage pointers) */
let strings: Record<string, string | null> = {};
let printed_usage = false;
let argv: string[] = [];

/** a -@ file (or stdin) read word by word as fscanf(f, "%s") reads it */
class Scanner {
  text: string;
  p = 0;
  constructor(text: string) {
    this.text = text;
  }
  word(): string {
    const t = this.text;
    while (this.p < t.length && isspace(t[this.p])) this.p++;
    const s = this.p;
    while (this.p < t.length && !isspace(t[this.p])) this.p++;
    return t.slice(s, this.p);
  }
  /** fgets(inputs, 100, f): the rest of the line, at most 99 chars */
  fgets(n: number): void {
    const t = this.text;
    let k = 0;
    while (this.p < t.length && k < n - 1) {
      k++;
      if (t[this.p++] === '\n') break;
    }
  }
  /** fscanf(f, "%[^\"]%*[\"]") */
  quoted(): string {
    const t = this.text;
    const s = this.p;
    while (this.p < t.length && t[this.p] !== '"') this.p++;
    const r = t.slice(s, this.p);
    if (r.length) while (this.p < t.length && t[this.p] === '"') this.p++;
    return r;
  }
}

function record(word: string, dtype: DType, key: string, min: number | bigint, max: number | bigint, def: number | bigint, description: string | null): Opt {
  return { word, key, min: BigInt(min), max: BigInt(max), def: BigInt(def), dtype, description };
}

function print_usage(clopt: Opt[]): void {
  if (!printed_usage) {
    errout(sprintf(S.credits_screen1, Math.trunc(PMARSVER / 100), Math.trunc((PMARSVER % 100) / 10), PMARSVER % 10, PMARSDATE));
    errout(S.credits_screen2);
    errout(S.credits_screen3);
    errout(S.usage_screen);
    errout(S.optionsAre);
    let i = 0;
    for (const clip of clopt) {
      if (clip.description !== null) {
        errout(sprintf('  -%c %s %-30s', clip.word, describe[clip.dtype], clip.description));
        if (i++ % 2) errout('\n');
      }
    }
    errout(S.readOptionsFromFile);
    for (i = 0; i < xOptions.length; i++) {
      errout(sprintf('  -%-8s $ %-24s', xOptions[i], S.optXOpt[i]));
      if (i % 2) errout('\n');
    }
    printed_usage = true;
  }
}

/** next_input(): the next word of the command line (filep null) or of a -@ file */
function next_input(filep: Scanner | null): string {
  let inputs: string;
  if (filep === null) {
    if (argv.length) inputs = argv.shift()!;
    else inputs = '';
  } else {
    inputs = filep.word();
    if (inputs[0] === '"') { /* quoted string */
      inputs = ' ' + inputs.slice(1);
      const i = inputs.length;
      if (inputs[i - 1] === '"') inputs = inputs.slice(0, i - 1);
      else inputs += filep.quoted();
    }
    while (inputs[0] === ';') {
      filep.fgets(100);
      inputs = filep.word();
    }
  }
  return inputs.slice(0, CLP_MAXSTRLEN - 1);
}

const NONE = 0, OPTION = 1, ARGUMENT = 2, RANGE = 3, TOO_MANY = 4, MEMORY = 5, FILENAME = 6, OLDERROR = 7;

/** read the options (called recursively for -@ files); returns 0 or CLP_NOGOOD */
async function clp_parse(clopt: Opt[], filep: Scanner | null, isStdin = false): Promise<number> {
  let code = NONE;
  let clip: Opt | undefined;
  let inputs: string;
  const more = (s: string): boolean => s !== '$' && s.length > 0;
  error: {
    while (more((inputs = next_input(filep)))) {
      if (inputs[0] === '-' && inputs.length > 1) { /* option ? */
        let bool_switch = true; /* no argument needed for this option */
        for (let i = 1; i < inputs.length && bool_switch; ++i) {
          clip = clopt.find((o) => o.word === inputs[i]); /* find which option is this */
          const xi = xOptions.indexOf(inputs.slice(1));
          if (xi >= 0) clip = { word: 'x', key: '', min: 0n, max: 0n, def: BigInt(xi), dtype: 'str', description: S.optXOpt[xi], x: xi };
          if (!clip) { /* option not found */
            if (inputs[i] === '@') { /* included command file? */
              if (i + 1 < inputs.length) {
                code = FILENAME; /* must have a parameter */
                break error;
              }
              bool_switch = false;
              let newFile: Scanner, fromStdin = false;
              if (more((inputs = next_input(filep)))) {
                if (inputs === '-') {
                  let text = '', l: string | null;
                  errout(S.readingStdin);
                  while ((l = await host.readStdin()) !== null) text += l;
                  newFile = new Scanner(text);
                  fromStdin = true;
                } else {
                  const text = await host.readFile(inputs);
                  if (text === null) {
                    code = FILENAME; /* command file not found */
                    break error;
                  }
                  newFile = new Scanner(text);
                }
              } else {
                code = FILENAME; /* no parameter for -@ */
                break error;
              }
              if ((await clp_parse(clopt, newFile, fromStdin)) !== NONE) {
                code = OLDERROR;
                if (fromStdin) inputs = S.standardInput;
                break error; /* error in command file */
              }
            } else { /* no such option */
              code = OPTION;
              break error;
            }
          } else { /* option found */
            if (clip.dtype === 'bool') clip.def = clip.def ? 0n : 1n;
            else { /* not a bool switch, value needed */
              bool_switch = false;
              if (clip.word !== 'x' && i + 1 < inputs.length) {
                code = ARGUMENT; /* middle option, but we need an argument */
                break error;
              }
              if (!more((inputs = next_input(filep)))) {
                code = ARGUMENT; /* no argument */
                break error;
              } else if (clip.dtype === 'str') {
                if (clip.x !== undefined) g.xStorage[clip.x] = inputs;
                else strings[clip.key] = inputs;
              } else {
                clip.def = atol(inputs);
                let idx = 0;
                while (idx < inputs.length && isdigit(inputs[idx])) ++idx;
                if (idx < inputs.length) {
                  code = ARGUMENT;
                  break error;
                }
                if (clip.def < clip.min || clip.def > clip.max) {
                  code = RANGE;
                  break error;
                }
              }
            }
          }
        }
      } else if (g.warriors < MAXWARRIOR) {
        let many = inputs.length - 1;
        code = NONE;
        if (inputs[many] === '-') { /* warrior from stdin */
          if (!many) many++;
          else { /* number before - ? */
            many = Number(BigInt.asIntN(32, atol(inputs.slice(0, many)))); /* how many warriors from stdin */
            if (!many) {
              code = OPTION;
              break error;
            }
          }
          inputs = '';
        } else many = 1;
        for (; many > 0 && g.warriors < MAXWARRIOR; many--) g.warrior[g.warriors++].fileName = inputs;
      } else {
        code = TOO_MANY;
        break error;
      }
    }
    void isStdin;
    return 0;
  }
  /* ERROR: */
  if (code !== OLDERROR) print_usage(clopt);
  switch (code) {
    case OLDERROR: errout(sprintf(S.errorIsLocatedIn, inputs)); break;
    case OPTION: errout(sprintf(S.unknownOption, inputs)); break;
    case ARGUMENT:
      if (clip!.word === 'x') errout(sprintf(S.badArgumentForXSwitch, xOptions[Number(clip!.def)]));
      else errout(sprintf(S.badArgumentForSwitch, clip!.word));
      break;
    case RANGE:
      errout(sprintf(S.optionMustBeInTheRange, clip!.word));
      errout(sprintf('%ld - %ld\n', clip!.min, clip!.max));
      break;
    case TOO_MANY: errout(sprintf(S.tooManyParameters, inputs)); break;
    case MEMORY: errout(S.outOfMemory); break;
    case FILENAME: errout(S.cannotOpenParameterFile); break;
  }
  return CLP_NOGOOD;
}

/** parse_param(argc, argv): argv without the program name */
export async function parse_param(args: string[]): Promise<number> {
  const options: Opt[] = [
    record('r', 'int', 'rounds', 0, MAXROUND, -1, S.optRounds),
    record('e', 'bool', 'SWITCH_e', 0, 1, 0, S.optEnterDebugger),
    record('s', 'addr', 'coreSize', 1, MAXCORESIZE, DEFAULTCORESIZE, S.optCoreSize),
    record('b', 'bool', 'SWITCH_b', 0, 1, 0, S.optBrief),
    record('c', 'long', 'cycles', 1, LONG_MAX, DEFAULTCYCLES, S.optCycles),
    record('V', 'bool', 'SWITCH_V', 0, 1, 0, S.optVerboseAssembly),
    record('p', 'int', 'taskNum', 1, MAXTASKNUM, DEFAULTTASKNUM, S.optProcesses),
    record('k', 'bool', 'SWITCH_k', 0, 1, 0, S.optKotH),
    record('l', 'addr', 'instrLim', 1, MAXINSTR, DEFAULTINSTRLIM, S.optLength),
    record('8', 'bool', 'SWITCH_8', 0, 1, 0, S.opt88),
    record('d', 'addr', 'separation', 1, MAXSEPARATION, 0, S.optDistance),
    record('f', 'bool', 'SWITCH_f', 0, 1, 0, S.optFixedSeries),
    record('F', 'str', 'SWITCH_F', 0, MAXCORESIZE, 0, S.optFixedPosition),
    record('o', 'bool', 'SWITCH_o', 0, 1, 0, S.optSort),
    record('S', 'addr', 'pSpaceSize', 1, MAXCORESIZE, 0, S.optPSpaceSize),
    record('P', 'bool', 'SWITCH_P', 0, 1, 0, S.optPermutate),
    record('R', 'addr', 'readLimit', 1, MAXCORESIZE, 0, S.optReadLimit),
    record('W', 'addr', 'writeLimit', 1, MAXCORESIZE, 0, S.optReadLimit),
    record('A', 'bool', 'SWITCH_A', 0, 1, 0, S.optAssemble),
    record('=', 'str', 'SWITCH_eq', 0, 0, 0, S.optScoreFormula),
    record('Q', 'int', 'SWITCH_Q', -1, INT_MAX, -1, null),
    record('v', 'int', 'SWITCH_v', 0, 2994, 103, S.optView),
  ];
  for (let i = 0; i < MAXWARRIOR; i++) g.warrior[i].fileName = null;
  argv = args.slice();
  strings = {};
  g.warriors = 0;
  printed_usage = false;
  let result = await clp_parse(options, null);
  if (!result) { /* so far so good */
    const G = g as unknown as Record<string, unknown>;
    for (const clip of options) {
      if (clip.dtype === 'long') G[clip.key] = clip.def;
      else if (clip.dtype === 'int' || clip.dtype === 'addr' || clip.dtype === 'bool') G[clip.key] = Number(BigInt.asIntN(32, clip.def));
      else if (clip.key in strings) G[clip.key] = strings[clip.key];
    }
    if (g.SWITCH_f && g.SWITCH_F) {
      print_usage(options);
      errout(S.fFExclusive);
      result = CLP_NOGOOD;
    }
    if (g.separation === 0) g.separation = g.instrLim;
    else if (g.separation < g.instrLim) {
      print_usage(options);
      errout(S.dLessThanl);
      result = CLP_NOGOOD;
    }
    if (g.coreSize < g.warriors * g.separation) {
      print_usage(options);
      errout(S.coreSizeTooSmall);
      result = CLP_NOGOOD;
    }
    if (g.SWITCH_F) {
      g.useExtRNG = 0;
      g.SWITCH_Fnum = 0;
      for (const ch of g.SWITCH_F) {
        g.useExtRNG |= isdigit(ch) ? 0 : 1;
        g.SWITCH_Fnum = Math.imul(g.SWITCH_Fnum, 10);
        g.SWITCH_Fnum = (g.SWITCH_Fnum + (ch.charCodeAt(0) & 255) - 48) | 0;
      }
      if (!g.useExtRNG && g.separation > g.SWITCH_Fnum) {
        print_usage(options);
        errout(S.FLessThand);
        result = CLP_NOGOOD;
      } else if (g.SWITCH_Fnum < 0) g.SWITCH_Fnum = (g.SWITCH_Fnum * -1) | 0;
    }
    set_reg('W', BigInt(g.warriors));
    for (let i = 1; i <= g.warriors; ++i) {
      set_reg('S', BigInt(i));
      if (eval_expr(g.SWITCH_eq, { v: 0n }) < OK_EXPR) {
        print_usage(options);
        errout(S.badScoreFormula);
        result = CLP_NOGOOD;
        break;
      }
    }
    if (g.pSpaceSize === 0) /* make default, at least 1/16th of coresize */
      for (let i = 16; i > 0; --i)
        if (!(g.coreSize % i)) {
          g.pSpaceSize = Math.trunc(g.coreSize / i);
          break;
        }
    if (g.pSpaceSize > g.coreSize) {
      print_usage(options);
      errout(S.pSpaceTooBig);
      result = CLP_NOGOOD;
    }
    if (g.SWITCH_P) {
      if (g.warriors !== 2) {
        print_usage(options);
        errout(S.permutateMultiWarrior);
        result = CLP_NOGOOD;
      } else if (g.rounds < 0) g.rounds = (2 * g.coreSize - 4 * g.separation + 2) | 0; /* all possible combinations */
    } else if (g.rounds < 0) g.rounds = DEFAULTROUNDS;
    if (g.readLimit === 0) g.readLimit = g.coreSize;
    if (g.writeLimit === 0) g.writeLimit = g.coreSize;
    if (g.readLimit < 1 || g.writeLimit < 1 || g.coreSize % g.readLimit !== 0 || g.coreSize % g.writeLimit !== 0) {
      print_usage(options);
      errout(S.badRWLimit);
      result = CLP_NOGOOD;
    }
    if (g.warrior[0].fileName === null) {
      print_usage(options);
      errout(S.noWarriorFile);
      result = CLP_NOGOOD;
    }
  }
  return result;
}
