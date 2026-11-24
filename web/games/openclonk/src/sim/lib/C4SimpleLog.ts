// @ts-nocheck
// OpenClonk 36de799: src/lib/C4SimpleLog.cpp, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { c$printf } from '../../rt/libc.ts';
import { S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';

export function LogSilentF(msg, ...$va) {
  let args = null;
  args = { a: $va, i: 0 };
  let Buf = new $.StdStrBuf();
  Buf.FormatV(msg, args);
  return Log(Buf.getData());
}

export function LogF(msg, ...$va) {
  let args = null;
  args = { a: $va, i: 0 };
  let Buf = new $.StdStrBuf();
  Buf.FormatV(msg, args);
  return Log(Buf.getData());
}

export function DebugLogF(msg, ...$va) {
  let args = null;
  args = { a: $va, i: 0 };
  let Buf = new $.StdStrBuf();
  Buf.FormatV(msg, args);
  return Log(Buf.getData());
}


export function Log(msg) {
  if (!$.fQuiet) {
    c$printf(S("%s\n"), msg);
  }
  return true;
}

export function DebugLog(strMessage) {
  return Log(strMessage);
}

export function LogFatal(strMessage) {
  return Log(strMessage);
}

export function $init(): void {
  $.fQuiet = false;
}

Object.assign($, { DebugLog, DebugLogF, Log, LogF, LogFatal, LogSilentF });
