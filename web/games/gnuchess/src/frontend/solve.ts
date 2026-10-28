// Port of src/frontend/solve.cc of GNU Chess 6.3.0: `solve FILE`, the positions of an EPD file one after
// the other. A generator, as SolvePosition waits for the engine.
import { SOLVE, g } from './common.ts';
import { NewPosition } from './init.ts';
import { ShowBoard } from './output.ts';
import { ReadEPDFile, epd } from './epd.ts';
import { SolvePosition, type Wait } from './engine.ts';
import { printf } from './stdio.ts';

export function* Solve(file: string): Generator<Wait, void, void> {
  let total = 0, correct = 0;
  g.flags |= SOLVE;
  while (ReadEPDFile(file, 0)) {
    NewPosition();
    total++;
    ShowBoard();
    const myMove = yield* SolvePosition(epd.epd_line);
    const solution = g.solution;
    let p = 0;
    let found = false;
    while (p < solution.length) {
      if (myMove !== '' && solution.startsWith(myMove, p)) {
        correct++;
        found = true;
        break;
      }
      while (p < solution.length && solution[p] !== ' ') p++;
      while (p < solution.length && solution[p] === ' ') p++;
    }
    printf('id: %s : ', g.id);
    printf(found ? 'Correct:  ' : 'Incorrect:  ');
    printf('<%s> %s\n', myMove, solution);
    printf('Correct=%d Total=%d\n', correct, total);
  }
  g.flags &= ~SOLVE;
}
