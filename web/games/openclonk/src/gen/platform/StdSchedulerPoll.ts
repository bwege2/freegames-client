// @ts-nocheck
// OpenClonk 36de799: src/platform/StdSchedulerPoll.cpp, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $ } from '../../rt/registry.ts';

export function Fail(msg) {
  $.Log(msg);
}

export function $init(): void {
}

Object.assign($, { Fail });
