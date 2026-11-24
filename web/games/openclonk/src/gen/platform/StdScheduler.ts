// @ts-nocheck
// OpenClonk 36de799: src/platform/StdScheduler.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $spawn } from '../../rt/coro.ts';
import { c$__errno_location, c$close, c$eventfd, c$poll, c$printf, c$read, c$strerror, c$timerfd_create, c$timerfd_gettime, c$timerfd_settime, c$write } from '../../rt/libc.ts';
import { $rd, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $begin, $end, $itcopy, $max, $min, StdMap, StdPair, seq_erase, std_find } from '../../rt/std.ts';
import { StdThread } from '../../rt/threads.ts';

export class StdSchedulerProc {
  scheduler = null;

  Changed$v() {
    let s = this.scheduler;
    if (s != null) {
      s.Changed$pStdSchedulerProc(this);
    }
  }

  ExecuteUntil(iTimeout = -1) {
    if (iTimeout < 0) {
      for (; ; ) {
        if (!$spawn(this.Execute$i32$ppollfd())) {
          return false;
        }
      }
    }
    let tStopTime = $.op_add$C4TimeMilliseconds$u32($.C4TimeMilliseconds.Now(), iTimeout >>> 0);
    for (; ; ) {
      if (!$spawn(this.Execute$i32$ppollfd($max(iTimeout, 0)))) {
        return false;
      }
      let tTime = $.C4TimeMilliseconds.Now();
      if ($.op_ge(tTime, tStopTime)) {
        break;
      }
      iTimeout = $.op_sub$C4TimeMilliseconds$C4TimeMilliseconds(tStopTime, tTime);
    }
    return true;
  }

  GetFDs(_0) {
  }

  GetNextTick(_tNow) {
    return new $.C4TimeMilliseconds().init$i32(1 /*PositiveInfinity*/);
  }

  IsSignaled() {
    let fds = [];
    this.GetFDs(fds);
    return c$poll(P(fds, 0), fds.length, 0) > 0;
  }

  IsLowPriority() {
    return false;
  }

  IsNotify() {
    return false;
  }

  TimerInterval() {
    return 0;
  }

  $clone() { return new StdSchedulerProc().$assign(this); }
  $assign(o) {
    this.scheduler = o.scheduler;
    return this;
  }
}

export class StdScheduler {
  procs = [];
  isInManualLoop = false;
  Unblocker = new StdScheduler$NoopNotifyProc().None();

  init() {
    this.procs = [];
    this.isInManualLoop = false;
    this.Unblocker = new StdScheduler$NoopNotifyProc().None();
    StdScheduler.prototype.Add$pStdSchedulerProc.call(this, this.Unblocker);
    return this;
  }

  $dtor() {
    StdScheduler.prototype.Clear$v.call(this);
  }

  getProcCnt() {
    return this.procs.length - 1 | 0;
  }

  hasProc(pProc) {
    return !std_find($begin(this.procs), $end(this.procs), pProc).eq($end(this.procs));
  }

  IsInManualLoop() {
    return this.isInManualLoop;
  }

  Clear$v() {
    while (this.procs.length > 0) {
      StdScheduler.prototype.Remove.call(this, this.procs[this.procs.length - 1]);
    }
  }

  Set$ppStdSchedulerProc$i32(ppnProcs, inProcCnt) {
    StdScheduler.prototype.Clear$v.call(this);
    for (let i = 0; i < inProcCnt; i = i + 1 | 0) {
      StdScheduler.prototype.Add$pStdSchedulerProc.call(this, ppnProcs.a[ppnProcs.o + i]);
    }
  }

  Add$pStdSchedulerProc(pProc) {
    if (pProc.scheduler != null) {
      return;
    }
    this.procs.push(pProc);
    pProc.scheduler = this;
    this.Added(pProc);
  }

  Remove(pProc) {
    if (pProc.scheduler !== this) {
      return;
    }
    this.Removing(pProc);
    pProc.scheduler = null;
    let pos = std_find($begin(this.procs), $end(this.procs), pProc);
    if (!pos.eq($end(this.procs))) {
      seq_erase(this.procs, $itcopy(pos));
    }
  }

  Added(_pProc) {
  }

  Removing(_pProc) {
  }

  Changed$pStdSchedulerProc(_pProc) {
  }

  StartOnCurrentThread() {
  }

  GetNextTick(tNow) {
    let tProcTick = new $.C4TimeMilliseconds().init$i32(1 /*PositiveInfinity*/);
    for (const proc of this.procs) {
      tProcTick.$assign($min(tProcTick, proc.GetNextTick(tNow.$clone())));
    }
    return tProcTick;
  }

  ScheduleProcs(iTimeout = 27) {
    if (this.procs.length === 0) {
      return false;
    }
    let tNow = $.C4TimeMilliseconds.Now();
    let tProcTick = this.GetNextTick(tNow.$clone());
    if (iTimeout === -1 || $.op_gt($.op_add$C4TimeMilliseconds$u32(tNow.$clone(), iTimeout >>> 0), tProcTick)) {
      iTimeout = $max($.op_sub$C4TimeMilliseconds$C4TimeMilliseconds(tProcTick, tNow), 0);
    }
    let old = this.isInManualLoop;
    this.isInManualLoop = true;
    let res = this.DoScheduleProcs(iTimeout);
    this.isInManualLoop = old;
    return res;
  }

  UnBlock() {
    this.Unblocker.Notify();
  }

  OnError$pStdSchedulerProc(_0) {
  }

  DoScheduleProcs(iTimeout) {
    let fds = [];
    let fds_for_proc = new StdMap();
    for (const proc of this.procs) {
      let os = fds.length >>> 0;
      proc.GetFDs(fds);
      if (os !== fds.length) {
        fds_for_proc.entry(proc, () => new StdPair(0, 0)).second.$assign(new StdPair(os, fds.length));
      }
    }
    let cnt = c$poll(P(fds, 0), fds.length, iTimeout);
    let fSuccess = true;
    if (cnt >= 0) {
      let any_executed = false;
      let tNow = $.C4TimeMilliseconds.Now();
      for (let i = 0; i < this.procs.length; i = i + 1) {
        let proc$2 = this.procs[i];
        let tProcTick = proc$2.GetNextTick(tNow.$clone());
        if ($.op_le(tProcTick, tNow)) {
          let pfd = null;
          if (!fds_for_proc.find(proc$2).eq(fds_for_proc.end())) {
            pfd = P(fds, fds_for_proc.entry(proc$2, () => new StdPair(0, 0)).second.first);
          }
          if (!$spawn(proc$2.Execute$i32$ppollfd(0, pfd))) {
            this.OnError$pStdSchedulerProc(proc$2);
            fSuccess = false;
          }
          any_executed = true;
          continue;
        }
        if (fds_for_proc.find(proc$2).eq(fds_for_proc.end())) {
          continue;
        }
        let begin = fds_for_proc.entry(proc$2, () => new StdPair(0, 0)).second.first;
        let end = fds_for_proc.entry(proc$2, () => new StdPair(0, 0)).second.second;
        for (let j = begin; j < end; j = j + 1 >>> 0) {
          if ((fds[j].events & fds[j].revents) !== 0) {
            if (any_executed && proc$2.IsLowPriority()) {
              break;
            }
            if (!$spawn(proc$2.Execute$i32$ppollfd(0, P(fds, begin)))) {
              this.OnError$pStdSchedulerProc(proc$2);
              fSuccess = false;
            }
            any_executed = true;
            break;
          }
        }
      }
    } else if (cnt < 0 && $rd(c$__errno_location()) !== 4) {
      c$printf(S("StdScheduler::%s: poll failed: %s\n"), P(S("DoScheduleProcs"), 0), c$strerror($rd(c$__errno_location())));
    }
    return fSuccess;
  }

  $clone() { return new StdScheduler().$assign(this); }
  $assign(o) {
    this.procs = o.procs.slice();
    this.isInManualLoop = o.isInManualLoop;
    this.Unblocker.$assign(o.Unblocker);
    return this;
  }
}

export { StdThread };

export class CStdTimerProc extends StdSchedulerProc {
  tLastTimer = new $.C4TimeMilliseconds();
  iDelay = 0;

  init(iDelay) {
    this.tLastTimer = new $.C4TimeMilliseconds().init$i32(-1 /*NegativeInfinity*/);
    this.iDelay = iDelay;
    return this;
  }

  $dtor() {
    CStdTimerProc.prototype.Set$v.call(this);
  }

  Set$v() {
    this.tLastTimer.$assign(new $.C4TimeMilliseconds().init$i32(-1 /*NegativeInfinity*/));
  }

  SetDelay(inDelay) {
    this.iDelay = inDelay;
    this.Changed$v();
  }

  CheckAndReset() {
    let tTime = $.C4TimeMilliseconds.Now();
    if ($.op_lt(tTime, $.op_add$C4TimeMilliseconds$u32(this.tLastTimer.$clone(), this.iDelay))) {
      return false;
    }
    let iDrift = $.op_sub$C4TimeMilliseconds$C4TimeMilliseconds(tTime, $.op_add$C4TimeMilliseconds$u32(this.tLastTimer.$clone(), this.iDelay));
    this.tLastTimer.$assign($.op_sub$C4TimeMilliseconds$u32(tTime.$clone(), $min(iDrift, (this.iDelay | 0) / 2 | 0) >>> 0));
    return true;
  }

  GetNextTick(_tNow) {
    return $.op_add$C4TimeMilliseconds$u32(this.tLastTimer.$clone(), this.iDelay);
  }

  TimerInterval() {
    return this.iDelay;
  }

  $clone() { return new CStdTimerProc().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.tLastTimer.$assign(o.tLastTimer);
    this.iDelay = o.iDelay;
    return this;
  }
}

export class CStdNotifyProc extends StdSchedulerProc {
  fds = new Int32Array(2);

  init() {
    this.fds[0] = c$eventfd(0, 2048 /*EFD_NONBLOCK*/ | 0 | (524288 /*EFD_CLOEXEC*/ | 0));
    if (this.fds[0] === -1) {
      $.Fail(S("eventfd failed"));
    }
    return this;
  }

  Notify() {
    const n = [1n];
    if (c$write(this.fds[0], P(n, 0), 8) === -1) {
      $.Fail(S("write failed"));
    }
  }

  CheckAndReset() {
    const n = [0n];
    return c$read(this.fds[0], P(n, 0), 8) !== -1;
  }

  IsNotify() {
    return true;
  }

  $dtor() {
    c$close(this.fds[0]);
  }

  GetFDs(checkfds) {
    let pfd = { fd: this.fds[0], events: 1, revents: 0 };
    checkfds.push(pfd);
  }

  $clone() { return new CStdNotifyProc().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.fds = o.fds.slice();
    return this;
  }
}

export class CStdMultimediaTimerProc extends StdSchedulerProc {
  fd = 0;

  init(iDelay) {
    this.fd = c$timerfd_create(1, 2048 /*TFD_NONBLOCK*/ | 0 | (524288 /*TFD_CLOEXEC*/ | 0));
    if (this.fd === -1) {
      $.Log(S("timerfd_create failed"));
    }
    CStdMultimediaTimerProc.prototype.SetDelay.call(this, iDelay);
    return this;
  }

  $dtor() {
    c$close(this.fd);
  }

  Set$v() {
    let nv = { it_interval: { tv_sec: 0, tv_nsec: 0 }, it_value: { tv_sec: 0, tv_nsec: 0 } };
    let ov = { it_interval: { tv_sec: 0, tv_nsec: 0 }, it_value: { tv_sec: 0, tv_nsec: 0 } };
    c$timerfd_gettime(this.fd, nv);
    nv.it_value.tv_sec = 0;
    nv.it_value.tv_nsec = 1;
    c$timerfd_settime(this.fd, 0, nv, ov);
  }

  SetDelay(inDelay) {
    let nv = { it_interval: { tv_sec: 0, tv_nsec: 0 }, it_value: { tv_sec: 0, tv_nsec: 0 } };
    let ov = { it_interval: { tv_sec: 0, tv_nsec: 0 }, it_value: { tv_sec: 0, tv_nsec: 0 } };
    nv.it_interval.tv_sec = inDelay / 1000 >>> 0;
    nv.it_interval.tv_nsec = Math.imul(inDelay % 1000, 0xf4240) >>> 0;
    nv.it_value = ({ ...nv.it_interval });
    c$timerfd_settime(this.fd, 0, nv, ov);
  }

  CheckAndReset() {
    const n = [0n];
    return c$read(this.fd, P(n, 0), 8) !== -1;
  }

  GetFDs(checkfds) {
    let pfd = { fd: this.fd, events: 1, revents: 0 };
    checkfds.push(pfd);
  }

  $clone() { return new CStdMultimediaTimerProc().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.fd = o.fd;
    return this;
  }
}

export class StdSchedulerThread {
  $clone() { return this; }
  $assign(_o) { return this; }
  procs = [];
  MusicSystem = { ClearGame() {}, Clear() {}, Stop() {} };
  SoundSystem = { ClearGame() {}, Clear() {}, Stop() {} };
  Added() {}
  Removed() {}
  Removing() {}
  OnScheduler() {}
  init() { return this; }
  init$v() { return this; }
  None() { return this; }
  Init() { return this; }
  Execute() {}
  Close() { return true; }
  Open() { return false; }
  Load() { return 0; }
  Clear() {}
  Default() {}
  Set() { return true; }
  Check() { return true; }
  Lock() {}
  Unlock() {}
  isEnabled() { return false; }
  isHost() { return false; }
  isLobbyActive() { return false; }
  DoLobby() { return true; }
  RetrieveScenario() { return false; }
  FinalInit() { return true; }
  Unload() {}
  CompileFunc() {}
  FixShiftKeys() {}
  ResolveIncompleteSkeletons() {}
  RemoveSkeletonsInGroup() {}
}

export class C4ApplicationSec1Timer extends CStdTimerProc {

  init() {
    super.init(1000);
    return this;
  }

  Execute$i32$ppollfd(_0, _1) {
    if (this.CheckAndReset()) {
      this.OnSec1Timer();
    }
    return true;
  }

  $clone() { return new C4ApplicationSec1Timer().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class StdScheduler$NoopNotifyProc extends CStdNotifyProc {

  Execute$i32$ppollfd(_0, _1) {
    this.CheckAndReset();
    return true;
  }

  None() {
    super.init();
    return this;
  }

  $clone() { return new StdScheduler$NoopNotifyProc().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4ApplicationSec1Timer, CStdMultimediaTimerProc, CStdNotifyProc, CStdTimerProc, StdScheduler, StdScheduler$NoopNotifyProc, StdSchedulerProc, StdSchedulerThread, StdThread });
