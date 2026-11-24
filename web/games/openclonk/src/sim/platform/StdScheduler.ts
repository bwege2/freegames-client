// @ts-nocheck
// OpenClonk 36de799: src/platform/StdScheduler.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $ } from '../../rt/registry.ts';
import { $begin, $end, $itcopy, $max, $min, $missing, seq_erase, std_find } from '../../rt/std.ts';

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
        if (!this.Execute$i32$ppollfd()) {
          return false;
        }
      }
    }
    let tStopTime = $.op_add$C4TimeMilliseconds$u32($.C4TimeMilliseconds.Now(), iTimeout >>> 0);
    for (; ; ) {
      if (!this.Execute$i32$ppollfd($max(iTimeout, 0))) {
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
  Unblocker = new StdScheduler$NoopNotifyProc();

  init() {
    this.procs = [];
    this.isInManualLoop = false;
    this.Unblocker = new StdScheduler$NoopNotifyProc();
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

  Added(..._) { return $missing("StdScheduler::Added"); }

  Removing(..._) { return $missing("StdScheduler::Removing"); }

  Changed$pStdSchedulerProc(..._) { return $missing("StdScheduler::Changed"); }

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

  DoScheduleProcs(..._) { return $missing("StdScheduler::DoScheduleProcs"); }

  $clone() { return new StdScheduler().$assign(this); }
  $assign(o) {
    this.procs = o.procs.slice();
    this.isInManualLoop = o.isInManualLoop;
    this.Unblocker.$assign(o.Unblocker);
    return this;
  }
}

export class StdThread {
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

  Notify(..._) { return $missing("CStdNotifyProc::Notify"); }

  CheckAndReset(..._) { return $missing("CStdNotifyProc::CheckAndReset"); }

  IsNotify() {
    return true;
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

  $clone() { return new StdScheduler$NoopNotifyProc().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4ApplicationSec1Timer, CStdMultimediaTimerProc, CStdNotifyProc, CStdTimerProc, StdScheduler, StdScheduler$NoopNotifyProc, StdSchedulerProc, StdSchedulerThread, StdThread });
