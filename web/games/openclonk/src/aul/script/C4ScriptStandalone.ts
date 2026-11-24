// @ts-nocheck
// OpenClonk 36de799: src/script/C4ScriptStandalone.cpp, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { u64 } from '../../rt/int.ts';
import { c$fprintf, c$stderr, c$time } from '../../rt/libc.ts';
import { FixedRandom, GetWorkingDirectory } from '../../rt/native.ts';
import { S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';

function InitializeC4Script() {
  $.InitCoreFunctionMap($.ScriptEngine);
  FixedRandom(u64(BigInt(c$time(null))));
}

function ClearC4Script() {
  $.GameScript.Clear();
  $.ScriptEngine.Clear();
}

function RunLoadedC4Script() {
  $.ScriptEngine.Link(null);
  let result = $.GameScript.Call(S("Main"));
  return result;
}

function RunFile(filename, checkOnly) {
  let File = new $.C4Group().init();
  if (!File.Open(GetWorkingDirectory())) {
    c$fprintf(c$stderr, S("Open failed: %s\n"), File.GetError());
    return 1;
  }
  let fn = new $.StdStrBuf();
  File.ResetSearch();
  if (!File.FindNextEntry$pi8$pStdStrBuf$pu64$b(filename, fn)) {
    c$fprintf(c$stderr, S("FindNextEntry failed: %s\n"), File.GetError());
    return 1;
  }
  InitializeC4Script();
  $.GameScript.Load$rC4Group$pi8$pi8$pC4LangStringTable(File, fn.getData(), null, null);
  if (!checkOnly) {
    RunLoadedC4Script();
  }
  ClearC4Script();
  return $.ScriptEngine.errCnt;
}

function RunString(script, checkOnly) {
  InitializeC4Script();
  $.GameScript.LoadData(S("<memory>"), script, null);
  if (!checkOnly) {
    RunLoadedC4Script();
  }
  ClearC4Script();
  return $.ScriptEngine.errCnt;
}

export function c4s_runfile(filename) {
  return RunFile(filename, false);
}

export function c4s_runstring(script) {
  return RunString(script, false);
}

export function c4s_checkfile(filename) {
  return RunFile(filename, true);
}

export function c4s_checkstring(script) {
  return RunString(script, true);
}

export function $init(): void {
}

Object.assign($, { ClearC4Script, InitializeC4Script, RunFile, RunLoadedC4Script, RunString, c4s_checkfile, c4s_checkstring, c4s_runfile, c4s_runstring });
