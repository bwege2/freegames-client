// @ts-nocheck
// OpenClonk 36de799: src/platform/StdSync.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $ } from '../../rt/registry.ts';
import { CStdCSec, CStdEvent } from '../../rt/threads.ts';

export { CStdCSec };

export { CStdEvent };

export class CStdLock {
  sec = null;

  init(pSec) {
    this.sec = pSec;
    this.sec.Enter();
    return this;
  }

  $dtor() {
    CStdLock.prototype.Clear.call(this);
  }

  Clear() {
    if (this.sec != null) {
      this.sec.Leave();
    }
    this.sec = null;
  }

  $clone() { return new CStdLock().$assign(this); }
  $assign(o) {
    this.sec = o.sec;
    return this;
  }
}

export class StdThreadCheck {
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

export function $init(): void {
}

Object.assign($, { CStdCSec, CStdEvent, CStdLock, StdThreadCheck });
