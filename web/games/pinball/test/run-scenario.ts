// Runs a scenario on a Target (the original or the port) and returns its lines (scenario.ts Recorder).
import { FrameScript, Recorder, prepare, type Target } from './scenario.ts';
import { applyStart, type Scenario } from './scenarios.ts';

/** the end of a capped game scenario */
class Stop {}

export function runScenario(t: Target, sc: Scenario, each?: (n: number) => void): string[] {
  prepare(t, sc.spec);
  const rec = new Recorder(t, sc.mode === 'game');
  t.script = new FrameScript(sc.mode === 'game' ? sc.events : [...sc.events, { frame: sc.frames, key: 0x9b }]);
  t.onWait = (n) => {
    if (n === 1) applyStart(t, sc);
    rec.frame(n);
    each?.(n);
    if (sc.mode === 'game' && sc.frames && n >= sc.frames) throw new Stop();
  };
  try {
    if (sc.mode === 'game') t.playGame();
    else t.call('RUN', 'PLAY');
  } catch (e) {
    if (!(e instanceof Stop)) throw e;
  }
  return rec.lines;
}
