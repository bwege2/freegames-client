// tour.cpp of HyperRogue 13.1o. STUB (a later stage; owned by package P8): stage 1 has tour::on == false
// (G.tour_on), so these are never reached. Each is marked STAGE1-STUB.
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
import { NotPorted } from './hyper.ts';

/** enum presmode */
export const tour_pmStartAll = 0, tour_pmStart = 1, tour_pmFrame = 2, tour_pmStop = 3, tour_pmKey = 4,
  tour_pmRestart = 5, tour_pmAfterFrame = 6, tour_pmHelpEx = 7, tour_pmKeyAlt = 8, tour_pmKeyAlt2 = 9,
  tour_pmSlideHelp = 10, tour_pmGeometry = 11, tour_pmGeometryReset = 13, tour_pmGeometryStart = 15,
  tour_pmGeometrySpecial = 16;

export function tour_presentation(_mode: number): void { throw new NotPorted('tour::presentation'); } // STAGE1-STUB
export function tour_stop_tour(): void { throw new NotPorted('tour::stop_tour'); } // STAGE1-STUB

// added by P7 (pcmove.ts): STAGE1-STUB
/** tour::checkGoodLand(eLand l): tour::on is false in stage 1 */
export function tour_checkGoodLand(_l: number): void { throw new NotPorted('tour::checkGoodLand'); } // STAGE1-STUB

// added by U3 (quit.ts: a hint's action): STAGE2-STUB (tour.cpp, stage 3)
export function tour_start(): void { } // STAGE2-STUB
