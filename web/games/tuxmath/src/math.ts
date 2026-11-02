// The math problems of Tux, of Math Command 2.0.3: the lesson files' options and the card generator
// of src/mathcards.c. The arcade lessons are either played from an exhaustive shuffled list
// (comprehensive = 1: every valid two-number card, as add_all_valid() builds it) or from random
// cards (comprehensive = 0, and the original's padding), including its recursive 3- and 4-number
// order-of-operations cards for Commando. The same formats, filters, difficulty values and quirks
// are reproduced (see re/tuxmath/NOTES.md).

export interface LessonOptions {
  addition: boolean;
  subtraction: boolean;
  multiplication: boolean;
  division: boolean;
  allowNegatives: boolean;
  maxAnswer: number;
  minAugend: number; maxAugend: number; minAddend: number; maxAddend: number;
  minMinuend: number; maxMinuend: number; minSubtrahend: number; maxSubtrahend: number;
  minMultiplier: number; maxMultiplier: number; minMultiplicand: number; maxMultiplicand: number;
  minDivisor: number; maxDivisor: number; minQuotient: number; maxQuotient: number;
  formatAnswerLast: boolean;
  formatAnswerFirst: boolean;
  formatAnswerMiddle: boolean;
  formatAddLast: boolean; formatAddFirst: boolean; formatAddMiddle: boolean;
  formatSubLast: boolean; formatSubFirst: boolean; formatSubMiddle: boolean;
  formatMultLast: boolean; formatMultFirst: boolean; formatMultMiddle: boolean;
  formatDivLast: boolean; formatDivFirst: boolean; formatDivMiddle: boolean;
  minFormulaNums: number;
  maxFormulaNums: number;
  playThroughList: boolean;
  questionCopies: number;
  repeatWrongs: boolean;
  copiesRepeatedWrongs: number;
  avgListLength: number;
  varyListLength: boolean;
  randomize: boolean;
  comprehensive: boolean;
  speed: number;
  maxSpeed: number;
  speedupFactor: number;
  allowSpeedup: boolean;
  startingComets: number;
  extraCometsPerWave: number;
  maxComets: number;
  bonusCometInterval: number;
  bonusSpeedRatio: number;
  usePowerupComets: boolean;
  powerupFreq: number;
  useBkgd: boolean;
  demoMode: boolean;
  saveSummary: boolean;
  useFeedback: boolean;
  slowAfterWrong: boolean;
}

/** The defaults of src/mathcards.c MC_DEFAULTS and src/globals.h. */
export const LESSON_DEFAULTS: LessonOptions = {
  addition: true, subtraction: true, multiplication: true, division: true,
  allowNegatives: false, maxAnswer: 999,
  minAugend: 0, maxAugend: 12, minAddend: 0, maxAddend: 12,
  minMinuend: 0, maxMinuend: 12, minSubtrahend: 0, maxSubtrahend: 12,
  minMultiplier: 0, maxMultiplier: 12, minMultiplicand: 0, maxMultiplicand: 12,
  minDivisor: 0, maxDivisor: 12, minQuotient: 0, maxQuotient: 12,
  formatAnswerLast: true, formatAnswerFirst: false, formatAnswerMiddle: false,
  formatAddLast: true, formatAddFirst: false, formatAddMiddle: false,
  formatSubLast: true, formatSubFirst: false, formatSubMiddle: false,
  formatMultLast: true, formatMultFirst: false, formatMultMiddle: false,
  formatDivLast: true, formatDivFirst: false, formatDivMiddle: false,
  minFormulaNums: 2, maxFormulaNums: 2,
  playThroughList: true, questionCopies: 1, repeatWrongs: true, copiesRepeatedWrongs: 1,
  avgListLength: 100, varyListLength: false, randomize: true, comprehensive: false,
  speed: 1, maxSpeed: 10, speedupFactor: 1.2, allowSpeedup: true,
  startingComets: 2, extraCometsPerWave: 2, maxComets: 10,
  bonusCometInterval: 10, bonusSpeedRatio: 1.5,
  usePowerupComets: true, powerupFreq: 10,
  useBkgd: true, demoMode: false, saveSummary: true, useFeedback: false, slowAfterWrong: false,
};

export interface Card {
  formula: string;
  answer: number;
  difficulty: number;
}

const OPS = ['+', '-', 'x', '÷'] as const;

/** Reads a lesson file (key = value, # comments) as the original's fileops.c does. */
export function parseLesson(text: string): LessonOptions {
  const o = { ...LESSON_DEFAULTS };
  const bool = (v: string) => v.trim() !== '0' && v.trim().toLowerCase() !== 'false';
  for (const line of text.split(/\r?\n/)) {
    const m = /^\s*([a-z_]+)\s*=\s*(.*?)\s*(?:#.*)?$/.exec(line);
    if (!m) continue;
    const key = m[1], value = m[2];
    switch (key) {
      case 'addition_allowed': o.addition = bool(value); break;
      case 'subtraction_allowed': o.subtraction = bool(value); break;
      case 'multiplication_allowed': o.multiplication = bool(value); break;
      case 'division_allowed': o.division = bool(value); break;
      case 'allow_negatives': o.allowNegatives = bool(value); break;
      case 'max_answer': o.maxAnswer = Number(value); break;
      case 'min_augend': o.minAugend = Number(value); break;
      case 'max_augend': o.maxAugend = Number(value); break;
      case 'min_addend': o.minAddend = Number(value); break;
      case 'max_addend': o.maxAddend = Number(value); break;
      case 'min_minuend': o.minMinuend = Number(value); break;
      case 'max_minuend': o.maxMinuend = Number(value); break;
      case 'min_subtrahend': o.minSubtrahend = Number(value); break;
      case 'max_subtrahend': o.maxSubtrahend = Number(value); break;
      case 'min_multiplier': o.minMultiplier = Number(value); break;
      case 'max_multiplier': o.maxMultiplier = Number(value); break;
      case 'min_multiplicand': o.minMultiplicand = Number(value); break;
      case 'max_multiplicand': o.maxMultiplicand = Number(value); break;
      case 'min_divisor': o.minDivisor = Number(value); break;
      case 'max_divisor': o.maxDivisor = Number(value); break;
      case 'min_quotient': o.minQuotient = Number(value); break;
      case 'max_quotient': o.maxQuotient = Number(value); break;
      case 'format_answer_last': o.formatAnswerLast = bool(value); break;
      case 'format_answer_first': o.formatAnswerFirst = bool(value); break;
      case 'format_answer_middle': o.formatAnswerMiddle = bool(value); break;
      case 'format_add_answer_last': o.formatAddLast = bool(value); break;
      case 'format_add_answer_first': o.formatAddFirst = bool(value); break;
      case 'format_add_answer_middle': o.formatAddMiddle = bool(value); break;
      case 'format_sub_answer_last': o.formatSubLast = bool(value); break;
      case 'format_sub_answer_first': o.formatSubFirst = bool(value); break;
      case 'format_sub_answer_middle': o.formatSubMiddle = bool(value); break;
      case 'format_mult_answer_last': o.formatMultLast = bool(value); break;
      case 'format_mult_answer_first': o.formatMultFirst = bool(value); break;
      case 'format_mult_answer_middle': o.formatMultMiddle = bool(value); break;
      case 'format_div_answer_last': o.formatDivLast = bool(value); break;
      case 'format_div_answer_first': o.formatDivFirst = bool(value); break;
      case 'format_div_answer_middle': o.formatDivMiddle = bool(value); break;
      case 'min_formula_nums': o.minFormulaNums = Number(value); break;
      case 'max_formula_nums': o.maxFormulaNums = Number(value); break;
      case 'play_through_list': o.playThroughList = bool(value); break;
      case 'question_copies': o.questionCopies = Number(value); break;
      case 'repeat_wrongs': o.repeatWrongs = bool(value); break;
      case 'copies_repeated_wrongs': o.copiesRepeatedWrongs = Number(value); break;
      case 'avg_list_length': o.avgListLength = Number(value); break;
      case 'vary_list_length': o.varyListLength = bool(value); break;
      case 'randomize': o.randomize = bool(value); break;
      case 'comprehensive': o.comprehensive = bool(value); break;
      case 'speed': o.speed = Number(value); break;
      case 'max_speed': o.maxSpeed = Number(value); break;
      case 'speedup_factor': o.speedupFactor = Number(value); break;
      case 'allow_speedup': o.allowSpeedup = bool(value); break;
      case 'starting_comets': o.startingComets = Number(value); break;
      case 'extra_comets_per_wave': o.extraCometsPerWave = Number(value); break;
      case 'max_comets': o.maxComets = Number(value); break;
      case 'bonus_comet_interval': o.bonusCometInterval = Number(value); break;
      case 'bonus_speed_ratio': o.bonusSpeedRatio = Number(value); break;
      case 'use_powerup_comets': o.usePowerupComets = bool(value); break;
      case 'powerup_freq': o.powerupFreq = Number(value); break;
      case 'use_bkgd': o.useBkgd = bool(value); break;
      case 'demo_mode': o.demoMode = bool(value); break;
      case 'save_summary': o.saveSummary = bool(value); break;
      case 'use_feedback': o.useFeedback = bool(value); break;
      case 'slow_after_wrong': o.slowAfterWrong = bool(value); break;
      default: break;
    }
  }
  // MC_Initialize() calls clear_negatives() when negatives are not allowed: every range
  // minimum that is negative becomes 0 (mathcards.c:1074).
  if (!o.allowNegatives) {
    for (const key of ['minAugend', 'maxAugend', 'minAddend', 'maxAddend', 'minMinuend', 'maxMinuend',
      'minSubtrahend', 'maxSubtrahend', 'minMultiplier', 'maxMultiplier', 'minMultiplicand',
      'maxMultiplicand', 'minDivisor', 'maxDivisor', 'minQuotient', 'maxQuotient'] as const) {
      if (o[key] < 0) o[key] = 0;
    }
  }
  return o;
}

type Op = 0 | 1 | 2 | 3;

const opAllowed = (o: LessonOptions, op: Op): boolean =>
  [o.addition, o.subtraction, o.multiplication, o.division][op];

/** The per-operation format flags (FORMAT_ADD_ANSWER_LAST + op * 3 in the original). */
const formatAllowed = (o: LessonOptions, op: Op, format: number): boolean =>
  [o.formatAnswerLast, o.formatAnswerFirst, o.formatAnswerMiddle][format]
  && [[o.formatAddLast, o.formatAddFirst, o.formatAddMiddle],
    [o.formatSubLast, o.formatSubFirst, o.formatSubMiddle],
    [o.formatMultLast, o.formatMultFirst, o.formatMultMiddle],
    [o.formatDivLast, o.formatDivFirst, o.formatDivMiddle]][op][format];

/**
 * Fills in the question mark of a card with the format of reformat_arithmetic(): the
 * answer-last form keeps the computed value, the first and middle forms hide the first or
 * the second number and show the computed value on the right.
 */
function reformat(card: Card, op: Op, o: LessonOptions, random: () => number): Card {
  let format = Math.floor(random() * 3);
  // the random generator allows a format when either the global or the per-op flag is set
  // (mathcards.c:1840); add_all_valid() requires both.
  while (!formatAllowedRandom(o, op, format)) format = Math.floor(random() * 3);
  if (format === 0) return { ...card, formula: `${card.formula} = ?` };
  const tokens = card.formula.split(' ');
  const index = format === 1 ? 0 : 2;
  const missing = Number(tokens[index]);
  tokens[index] = '?';
  return { formula: `${tokens.join(' ')} = ${card.answer}`, answer: missing, difficulty: card.difficulty };
}

const formatAllowedRandom = (o: LessonOptions, op: Op, format: number): boolean =>
  [o.formatAnswerLast, o.formatAnswerFirst, o.formatAnswerMiddle][format]
  || [[o.formatAddLast, o.formatAddFirst, o.formatAddMiddle],
    [o.formatSubLast, o.formatSubFirst, o.formatSubMiddle],
    [o.formatMultLast, o.formatMultFirst, o.formatMultMiddle],
    [o.formatDivLast, o.formatDivFirst, o.formatDivMiddle]][op][format];

const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23];

/** find_divisor() from mathcards.c:2232, used by multi-number division cards. */
function findDivisor(a: number, o: LessonOptions, random: () => number): number {
  let div = 1;
  let passes = 3;
  do {
    for (let i = 0; i < PRIMES.length; i++) {
      const p = PRIMES[i];
      if (a % p === 0 && Math.floor(random() * (i + 1)) === 0 && div * p <= o.maxDivisor) div *= p;
    }
  } while (div < o.minDivisor && --passes > 0);
  return div;
}

/**
 * generate_random_ooo_card_of_length() from mathcards.c:1651: one two-number card, or (for
 * lengths 3 and 4, Commando) a recursive formula. The original evaluates a mixed formula
 * strictly left to right but writes it without parentheses; that is kept, quirks included.
 */
function randomCardOfLength(length: number, reformatCard: boolean, o: LessonOptions, random: () => number): Card {
  const randInt = (min: number, max: number) => Math.floor(random() * (max - min + 1)) + min;
  if (length <= 2) {
    let op = Math.floor(random() * 4) as Op;
    while (!opAllowed(o, op)) op = Math.floor(random() * 4) as Op;
    let r1 = 0, r2 = 0, answer = 0;
    for (;;) {
      r1 = randInt([o.minAugend, o.minMinuend, o.minMultiplier, o.minDivisor][op],
        [o.maxAugend, o.maxMinuend, o.maxMultiplier, o.maxDivisor][op]);
      r2 = randInt([o.minAddend, o.minSubtrahend, o.minMultiplicand, o.minQuotient][op],
        [o.maxAddend, o.maxSubtrahend, o.maxMultiplicand, o.maxQuotient][op]);
      if (op === 0) answer = r1 + r2;
      else if (op === 1) answer = r1 - r2;
      else if (op === 2) {
        if (r2 === 0) r2 = 1;
        if (r1 === 0) r1 = 1;
        answer = r1 * r2;
      } else {
        // the original draws the divisor into r1 and the quotient into r2, sets the answer
        // to the divisor and turns r1 into the dividend (mathcards.c:1780)
        if (r2 === 0) r2 = 1;
        answer = r1;
        r1 *= r2;
      }
      if ((answer < 0 && !o.allowNegatives) || answer > o.maxAnswer) continue;
      break;
    }
    const card: Card = { formula: `${r1} ${OPS[op]} ${r2}`, answer, difficulty: op + 1 };
    return reformatCard ? reformat(card, op, o, random) : card;
  }
  const base = randomCardOfLength(length - 1, false, o, random);
  let op: Op;
  if (/[+-]/.test(base.formula)) {
    // after an addition or subtraction the original only appends another '+' or '-'
    op = (random() < 0.5 ? 0 : 1) as Op;
    while (!opAllowed(o, op)) op = (random() < 0.5 ? 0 : 1) as Op;
  } else {
    op = Math.floor(random() * 4) as Op;
    while (!opAllowed(o, op)) op = Math.floor(random() * 4) as Op;
  }
  let answer = base.answer;
  let operand: number;
  if (op === 0) {
    operand = randInt(o.minAugend, o.maxAugend);
    answer += operand;
  } else if (op === 1) {
    operand = randInt(o.minSubtrahend, o.maxSubtrahend);
    answer -= operand;
  } else if (op === 2) {
    // the original's lower bound really is MIN_AUGEND here, not MIN_MULTIPLICAND
    operand = Math.floor(random() * (o.maxMultiplicand - o.minMultiplicand + 1)) + o.minAugend;
    answer *= operand;
  } else {
    operand = findDivisor(answer, o, random);
    answer = Math.trunc(answer / operand);
  }
  const formula = (op === 1 || op === 3 || random() < 0.5)
    ? `${base.formula} ${OPS[op]} ${operand}`
    : `${operand} ${OPS[op]} ${base.formula}`;
  const card: Card = { formula, answer, difficulty: base.difficulty + (length - 1) + op };
  return reformatCard ? reformat(card, op, o, random) : card;
}

/** A random card as generate_random_flashcard() makes it (mathcards.c:1580). */
export function generateCard(o: LessonOptions, random: () => number = Math.random): Card {
  // the original first draws a problem type (typing, arithmetic, comparison), rejecting the
  // disabled ones, then a formula length; with the arcade lessons only arithmetic survives.
  for (;;) {
    const type = Math.floor(random() * 3);
    if (type === 1) break;
  }
  const length = Math.floor(random() * (o.maxFormulaNums - o.minFormulaNums + 1)) + o.minFormulaNums;
  return randomCardOfLength(length, true, o, random);
}

/** calc_num_valid_questions() from mathcards.c:2249 (arithmetic only). */
function countValid(o: LessonOptions): number {
  let total = 0;
  for (let op = 0; op < 4; op++) {
    if (!opAllowed(o, op as Op)) continue;
    const pairs = ([o.maxAugend, o.maxMinuend, o.maxMultiplier, o.maxDivisor][op]
      - [o.minAugend, o.minMinuend, o.minMultiplier, o.minDivisor][op] + 1)
      * ([o.maxAddend, o.maxSubtrahend, o.maxMultiplicand, o.maxQuotient][op]
        - [o.minAddend, o.minSubtrahend, o.minMultiplicand, o.minQuotient][op] + 1);
    let formats = 0;
    for (let f = 0; f < 3; f++) if (formatAllowed(o, op as Op, f)) formats++;
    total += pairs * formats;
  }
  return total;
}

/** add_all_valid(MC_PT_ARITHMETIC, ...) from mathcards.c:2309 for two-number cards. */
function addAllValid(o: LessonOptions): Card[] {
  const cards: Card[] = [];
  const add = (formula: string, answer: number, difficulty: number) =>
    cards.push({ formula, answer, difficulty });
  for (let op = 0; op < 4; op++) {
    if (!opAllowed(o, op as Op)) continue;
    const min1 = [o.minAugend, o.minMinuend, o.minMultiplier, o.minDivisor][op];
    const max1 = [o.maxAugend, o.maxMinuend, o.maxMultiplier, o.maxDivisor][op];
    const min2 = [o.minAddend, o.minSubtrahend, o.minMultiplicand, o.minQuotient][op];
    const max2 = [o.maxAddend, o.maxSubtrahend, o.maxMultiplicand, o.maxQuotient][op];
    for (let i = min1; i <= max1; i++) {
      for (let j = min2; j <= max2; j++) {
        let result: number, dividend = 0, divisor = 0, quotient = 0;
        if (op === 0) {
          result = i + j;
          if (result > o.maxAnswer) continue;
        } else if (op === 1) {
          result = i - j;
          if (result < 0 && !o.allowNegatives) continue;
          if (result > o.maxAnswer) continue;
        } else if (op === 2) {
          result = i * j;
          if (result > o.maxAnswer) continue;
        } else {
          if (i * j > o.maxAnswer) continue;
          dividend = i * j;
          divisor = i;
          quotient = j;
          result = quotient;
        }
        const sign = OPS[op];
        // add_all_valid() requires both the global and the per-operation format flag
        if (formatAllowed(o, op as Op, 0)) {
          if (op === 3 && divisor === 0) continue;
          add(op === 3 ? `${dividend} ${sign} ${divisor} = ?` : `${i} ${sign} ${j} = ?`, result, op + 1);
        }
        if (formatAllowed(o, op as Op, 1)) {
          if (op === 2 && j === 0) continue;
          if (op === 3 && divisor === 0) continue;
          add(op === 3 ? `? ${sign} ${divisor} = ${quotient}` : `? ${sign} ${j} = ${result}`,
            op === 3 ? dividend : i, op + 3);
        }
        if (formatAllowed(o, op as Op, 2)) {
          if (op === 2 && i === 0) continue;
          if (op === 3 && dividend === 0) continue;
          add(op === 3 ? `${dividend} ${sign} ? = ${quotient}` : `${i} ${sign} ? = ${result}`,
            op === 3 ? divisor : j, op + 3);
        }
      }
    }
  }
  return cards;
}

/** generate_list() from mathcards.c:1853: the shuffled exhaustive list or random cards. */
export function generateList(o: LessonOptions, random: () => number = Math.random): Card[] {
  let length = o.avgListLength;
  if (length && o.varyListLength) {
    const u1 = random() / 2 + 0.5;
    const u2 = random() / 2 + 0.5;
    let delta = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    delta *= length / 10;
    length += delta;
    if (length < 0) length = 1;
    length = Math.trunc(length);
  }
  if (!o.comprehensive) {
    return Array.from({ length: Math.max(0, length) }, () => generateCard(o, random));
  }
  const raw = countValid(o);
  if (!raw) return [];
  const cycles = Math.ceil(length / raw);
  let list: Card[] = [];
  for (let i = 0; i < cycles; i++) list.push(...addAllValid(o));
  if (o.randomize) {
    // randomize_list() gives every question a rand() key and sorts by it
    list = list.map((card) => ({ card, key: Math.floor(random() * 0x7fffffff) }))
      .sort((a, b) => a.key - b.key)
      .map((e) => e.card);
  }
  if (length) {
    if (list.length > length) list = list.slice(0, length);
    else while (list.length < length) list.push(generateCard(o, random));
  }
  return list;
}

export function opsName(op: number): string { return OPS[op] ?? '?'; }
