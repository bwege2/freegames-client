// Hunt the Wumpus, Gregory Yob, 1973: the listing published in Creative Computing (Sept/Oct 1975),
// re/wumpus/wumpus.basic, ported statement by statement. Numbers in comments are its line numbers;
// variable names are the listing's (L is the scalar L, Loc the array L(), Mem the array M()).
// The program talks only through `io`, so the same code runs on the website's teletype and in the
// tests against the listing itself (test/hpbasic.ts runs it).

export interface Io {
  /** prints text as BASIC's PRINT does (the caller adds no newline) */
  print(s: string): void;
  /** one typed line (BASIC's INPUT has already printed its "?") */
  input(): Promise<string>;
  /** BASIC's RND(0): uniform in [0, 1) */
  rnd(): number;
}

/** S(20,3), the dodecahedral cave: lines 130-160 (DATA), read by 80-120 */
const S_DATA = [
  2, 5, 8, 1, 3, 10, 2, 4, 12, 3, 5, 14, 1, 4, 6,
  5, 7, 15, 6, 8, 17, 1, 7, 9, 8, 10, 18, 2, 9, 11,
  10, 12, 19, 3, 11, 13, 12, 14, 20, 4, 13, 15, 6, 14, 16,
  15, 17, 20, 7, 16, 18, 9, 17, 19, 11, 18, 20, 13, 16, 19,
];

/**
 * A number as HP 2000 BASIC prints it: a blank (or "-") and the digits, in a field of 6 characters
 * (9, 12, 15 for longer numbers). The 1975 sample run shows it: "TUNNELS LEAD TO  1     3     10".
 */
export function num(n: number): string {
  const s = `${n < 0 ? '-' : ' '}${Math.abs(n)}`;
  const digits = s.length - 1;
  const field = digits <= 3 ? 6 : digits <= 6 ? 9 : digits <= 9 ? 12 : 15;
  return s.padEnd(field);
}

/** A number as BASIC's INPUT reads it (the first item of the line), or null if it is none. */
export function parseNumber(line: string): number | null {
  const item = line.split(',')[0].trim();
  return /^[+-]?(\d+\.?\d*|\.\d+)(E[+-]?\d+)?$/i.test(item) ? Number(item) : null;
}

const INSTRUCTIONS = [
  "WELCOME TO 'HUNT THE WUMPUS'",
  '  THE WUMPUS LIVES IN A CAVE OF 20 ROOMS. EACH ROOM',
  'HAS 3 TUNNELS LEADING TO OTHER ROOMS. (LOOK AT A',
  "DODECAHEDRON TO SEE HOW THIS WORKS-IF YOU DON'T KNOW",
  'WHAT A DODECAHEDRON IS, ASK SOMEONE)',
  '',
  '     HAZARDS:',
  ' BOTTOMLESS PITS - TWO ROOMS HAVE BOTTOMLESS PITS IN THEM',
  '     IF YOU GO THERE, YOU FALL INTO THE PIT (& LOSE!)',
  ' SUPER BATS - TWO OTHER ROOMS HAVE SUPER BATS. IF YOU',
  '     GO THERE, A BAT GRABS YOU AND TAKES YOU TO SOME OTHER',
  '     ROOM AT RANDOM. (WHICH MIGHT BE TROUBLESOME)',
  '',
  '     WUMPUS:',
  ' THE WUMPUS IS NOT BOTHERED BY THE HAZARDS (HE HAS SUCKER',
  ' FEET AND IS TOO BIG FOR A BAT TO LIFT).  USUALLY',
  ' HE IS ASLEEP. TWO THINGS WAKE HIM UP: YOUR ENTERING',
  ' HIS ROOM OR YOUR SHOOTING AN ARROW.',
  '     IF THE WUMPUS WAKES, HE MOVES (P=.75) ONE ROOM',
  ' OR STAYS STILL (P=.25). AFTER THAT, IF HE IS WHERE YOU',
  ' ARE, HE EATS YOU UP (& YOU LOSE!)',
  '',
  '     YOU:',
  ' EACH TURN YOU MAY MOVE OR SHOOT A CROOKED ARROW',
  '   MOVING: YOU CAN GO ONE ROOM (THRU ONE TUNNEL)',
  '   ARROWS: YOU HAVE 5 ARROWS. YOU LOSE WHEN YOU RUN OUT.',
  '   EACH ARROW CAN GO FROM 1 TO 5 ROOMS. YOU AIM BY TELLING',
  '   THE COMPUTER THE ROOM#S YOU WANT THE ARROW TO GO TO.',
  '   IF THE ARROW CAN\'T GO THAT WAY(IE NO TUNNEL) IT MOVES',
  '   AT RANDOM TO THE NEXT ROOM.',
  '     IF THE ARROW HITS THE WUMPUS, YOU WIN.',
  '     IF THE ARROW HITS YOU, YOU LOSE.',
  '',
  '    WARNINGS:',
  '     WHEN YOU ARE ONE ROOM AWAY FROM WUMPUS OR HAZARD,',
  '    THE COMPUTER SAYS:',
  " WUMPUS-  'I SMELL A WUMPUS'",
  " BAT   -  'BATS NEARBY'",
  " PIT   -  'I FEEL A DRAFT'",
  '',
];

/** Runs the program; like the original it never ends (the player leaves the website's way). */
export async function wumpus(io: Io): Promise<never> {
  const S = (j: number, k: number) => S_DATA[(j - 1) * 3 + (k - 1)];
  const fnA = () => Math.floor(20 * io.rnd()) + 1; // 170
  const fnB = () => Math.floor(3 * io.rnd()) + 1; // 180
  const fnC = () => Math.floor(4 * io.rnd()) + 1; // 190
  const println = (s = '') => io.print(`${s}\n`);
  const inputString = async () => { io.print('?'); return (await io.input()).trim(); };
  const inputNumber = async () => {
    for (;;) {
      io.print('?');
      const v = parseNumber(await io.input());
      if (v !== null) return v;
    }
  };

  const Loc = [0, 0, 0, 0, 0, 0, 0]; // L(6): 1 you, 2 wumpus, 3 & 4 pits, 5 & 6 bats (210-220)
  const Mem = [0, 0, 0, 0, 0, 0, 0]; // M(6): the set-up, for "same set-up" (230)
  let A = 0, L = 0, F = 0;

  // 20-50
  io.print('INSTRUCTIONS (Y-N)');
  if ((await inputString()) !== 'N') for (const s of INSTRUCTIONS) println(s); // 1000-1410
  // 52-67
  println();
  println('     ATTENTION ALL WUMPUS LOVERS!!!');
  io.print('     THERE ARE NOW TWO ADDITIONS TO THE WUMPUS FAMILY');
  println(' OF PROGRAMS.');
  println();
  println('     WUMP2:  SOME DIFFERENT CAVE ARRANGEMENTS');
  println('     WUMP3:  DIFFERENT HAZARDS');
  println();

  /** 2000-2160: print location & hazard warnings */
  const warnings = () => {
    println();
    for (let J = 2; J <= 6; J++) {
      for (let K = 1; K <= 3; K++) {
        if (S(Loc[1], K) !== Loc[J]) continue;
        println(J === 2 ? 'I SMELL A WUMPUS!' : J <= 4 ? 'I FEEL A DRAFT' : 'BATS NEARBY!');
      }
    }
    println(`YOU ARE IN ROOM ${num(Loc[1])}`);
    println(`TUNNELS LEAD TO ${num(S(L, 1))}${num(S(L, 2))}${num(S(L, 3))}`);
    println();
  };

  /** 2500-2580: choose option; 1 shoot, 2 move */
  const option = async (): Promise<number> => {
    for (;;) {
      io.print('SHOOT OR MOVE (S-M)');
      const i = await inputString();
      if (i === 'S') return 1;
      if (i === 'M') return 2;
    }
  };

  /** 3370-3440: move wumpus; true if it got you (F=-1) */
  const moveWumpus = (): boolean => {
    const K = fnC();
    if (K !== 4) Loc[2] = S(Loc[2], K);
    if (Loc[2] !== L) return false;
    println('TSK TSK TSK- WUMPUS GOT YOU!');
    return true;
  };

  /** 3000-3360: arrow routine */
  const shoot = async (): Promise<number> => {
    F = 0;
    let J9: number;
    do {
      io.print('NO. OF ROOMS(1-5)');
      J9 = await inputNumber();
    } while (J9 < 1 || J9 > 5); // 3060
    const P = [0, 0, 0, 0, 0, 0]; // 3030 DIM P(5)
    for (let K = 1; K <= J9; K++) {
      for (;;) {
        io.print('ROOM #');
        P[K] = await inputNumber();
        if (K <= 2 || P[K] !== P[K - 2]) break; // 3095, 3100
        println("ARROWS AREN'T THAT CROOKED - TRY ANOTHER ROOM");
      }
    }
    // 3120-3210: shoot the arrow
    L = Loc[1];
    for (let K = 1; K <= J9; K++) {
      let tunnel = false;
      for (let K1 = 1; K1 <= 3; K1++) if (S(L, K1) === P[K]) { tunnel = true; break; }
      L = tunnel ? P[K] : S(L, fnB()); // 3295; 3190 no tunnel: a random one
      if (L === Loc[2]) { // 3300
        println('AHA! YOU GOT THE WUMPUS!');
        return (F = 1);
      }
      if (L === Loc[1]) { // 3340
        println('OUCH! ARROW GOT YOU!');
        return (F = -1);
      }
    }
    println('MISSED'); // 3220
    L = Loc[1];
    if (moveWumpus()) F = -1; // 3240
    A--; // 3255
    if (A <= 0) F = -1; // 3260
    return F;
  };

  /** 4000-4310: move routine */
  const move = async (): Promise<number> => {
    F = 0;
    for (;;) {
      io.print('WHERE TO');
      L = await inputNumber();
      if (L < 1 || L > 20) continue; // 4040
      if ([1, 2, 3].some((K) => S(Loc[1], K) === L) || L === Loc[1]) break; // 4050-4090
      io.print('NOT POSSIBLE -');
    }
    for (;;) {
      Loc[1] = L; // 4130
      if (L === Loc[2]) { // 4150
        println('... OOPS! BUMPED A WUMPUS!');
        if (moveWumpus()) return (F = -1); // 4180-4200
      }
      if (L === Loc[3] || L === Loc[4]) { // 4220
        println('YYYIIIIEEEE . . . FELL IN PIT');
        return (F = -1);
      }
      if (L !== Loc[5] && L !== Loc[6]) return F; // 4270
      println('ZAP--SUPER BAT SNATCH! ELSEWHEREVILLE FOR YOU!');
      L = fnA(); // 4290, then 4130 again
    }
  };

  for (;;) {
    // 240-340: locate the L array items; again until no two share a room
    do {
      for (let J = 1; J <= 6; J++) Mem[J] = Loc[J] = fnA();
    } while (Loc.some((x, J) => J > 0 && Loc.some((y, K) => K > J && x === y)));
    let same: boolean;
    do {
      A = 5; // 360
      L = Loc[1];
      println('HUNT THE WUMPUS'); // 375
      do {
        warnings(); // 390
        F = (await option()) === 1 ? await shoot() : await move(); // 410-490
      } while (F === 0);
      println(F > 0 ? "HEE HEE HEE - THE WUMPUS'LL GETCHA NEXT TIME!!" : 'HA HA HA - YOU LOSE!'); // 500-550
      for (let J = 1; J <= 6; J++) Loc[J] = Mem[J]; // 560-580
      io.print('SAME SET-UP (Y-N)');
      same = (await inputString()) === 'Y'; // 610
    } while (same);
  }
}
