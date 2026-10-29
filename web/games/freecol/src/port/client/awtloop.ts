// The AWT event loop on the client's scheduler (sched.ts): the translated java.awt.EventQueue keeps its
// queues, coalescing and dispatching; what the JDK does with its EventDispatchThread (a thread that waits
// for events) and with javax.swing.TimerQueue (a thread that waits for timers) is done by the scheduler.
import { $J, InvocationTargetException } from '../../jre/index.ts';
import { awt } from '../../jre/toolkit.ts';
import type { Scheduler } from './sched.ts';

export function installAwtLoop(java: (n: string) => any, jmethod: (c: string, sig: string) => string, sched: Scheduler) {
  const EventQueue = java('java.awt.EventQueue');
  const Toolkit = java('java.awt.Toolkit');
  const Timer = java('javax.swing.Timer');
  const eqCtor = EventQueue.$meta.ctors[''];

  const post = jmethod('java.awt.EventQueue', 'postEvent(java.awt.AWTEvent)');
  const peek = jmethod('java.awt.EventQueue', 'peekEvent()');
  const next = jmethod('java.awt.EventQueue', 'getNextEvent()');
  const dispatch = jmethod('java.awt.EventQueue', 'dispatchEvent(java.awt.AWTEvent)');
  // the event dispatch thread is the scheduler's
  EventQueue.prototype.initDispatchThread = function () {
    if (this.dispatchThread == null) this.dispatchThread = sched.edt;
  };
  EventQueue.prototype.isDispatchThreadImpl = function () {
    return sched.isDispatchThread();
  };
  EventQueue.prototype[jmethod('java.awt.EventQueue', 'wakeup(boolean)')] = function () {
    if (this.dispatchThread == null) this.dispatchThread = sched.edt;
  };
  // the filters of the loops running (a modal dialog's drops input to the windows it blocks, as
  // EventDispatchThread.pumpEventsForFilter does)
  const filters: any[] = [];
  // modal dialogs' loops (Dialog.show) and SecondaryLoop: the EDT's nested pump until exit()
  EventQueue.prototype[jmethod('java.awt.EventQueue', 'createSecondaryLoop(java.awt.Conditional,java.awt.EventFilter,long)')] =
  EventQueue.prototype[jmethod('java.awt.EventQueue', 'createSecondaryLoop()')] =
  EventQueue.prototype.createSecondaryLoop = function (_cond?: any, filter?: any) {
    let done = false;
    return {
      enter() {
        done = false;
        if (filter) filters.push(filter);
        try {
          sched.waitUntil(() => done, undefined, 'pump');
        } finally {
          if (filter) filters.splice(filters.lastIndexOf(filter), 1);
        }
        return true;
      },
      exit() {
        const was = !done;
        done = true;
        return was;
      },
    };
  };
  const invokeAndWait = function (source: any, runnable: any) {
    if (sched.isDispatchThread()) throw new Error('Cannot call invokeAndWait from the event dispatcher thread');
    const lock = {};
    const ev = $J.make('java.awt.event.InvocationEvent', 'java.lang.Object,java.lang.Runnable,java.lang.Object,boolean', source, runnable, lock, true);
    Toolkit.getEventQueue()[post](ev);
    sched.waitUntil(() => ev.isDispatched());
    const t = ev.getThrowable();
    if (t != null) throw new InvocationTargetException(t);
  };
  $J.replaceStatic(EventQueue, "invokeAndWait$Runnable", (r: any) => invokeAndWait(Toolkit.getDefaultToolkit(), r));
  $J.replaceStatic(EventQueue, "invokeAndWait$Object$Runnable", invokeAndWait);

  // one event at a time, as EventDispatchThread.pumpOneEventForFilters takes and dispatches them
  sched.dispatchOne = () => {
    const eq = Toolkit.getEventQueue();
    if (eq[peek]() == null) return false;
    const e = eq[next]();
    if (filters.length) {
      const REJECT = java('java.awt.EventFilter$FilterAction').REJECT;
      for (const f of filters) if ($J.fn(f, 'acceptEvent')(e) === REJECT) return true;
    }
    sched.runAs(sched.edt, 'run', () => {
      try {
        eq[dispatch](e);
      } catch (x) {
        if ((x as any)?.$stop) throw x;
        sched.uncaught(sched.edt, x);
      }
    });
    return true;
  };
  awt.isDispatchThread = () => sched.isDispatchThread();
  void eqCtor;

  // javax.swing.Timer: the scheduler's timers instead of TimerQueue's thread
  Timer.prototype.start = function () {
    if (this.$timer) return;
    const fire = (delay: number) => {
      this.$timer = sched.setTimer(delay, () => {
        this.$timer = null;
        this.post();
        if (this.isRepeats()) fire(this.getDelay());
      });
    };
    fire(this.getInitialDelay());
  };
  Timer.prototype.stop = function () {
    if (this.$timer) {
      sched.clearTimer(this.$timer);
      this.$timer = null;
    }
    this.cancelEvent();
  };
  Timer.prototype.restart = function () {
    this.stop();
    this.start();
  };
  Timer.prototype.isRunning = function () {
    return this.$timer != null;
  };
  void $J;
}
