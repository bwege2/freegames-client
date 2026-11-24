// @ts-nocheck
// OpenClonk 36de799: src/platform/C4FileMonitor.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $ } from '../../rt/registry.ts';
import { $mixin, StdMap } from '../../rt/std.ts';
import { StdSchedulerProc } from './StdScheduler.ts';

export class C4FileMonitor extends StdSchedulerProc {
  fStarted = false;
  pCallback = null;
  fd = 0;
  watch_descriptors = new StdMap();

  $clone() { return new C4FileMonitor().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.fStarted = o.fStarted;
    this.pCallback = o.pCallback;
    this.fd = o.fd;
    this.watch_descriptors = o.watch_descriptors.$clone();
    return this;
  }
}

export function $init(): void {
  $mixin(C4FileMonitor, $.C4InteractiveThread$Callback);
}

Object.assign($, { C4FileMonitor });
