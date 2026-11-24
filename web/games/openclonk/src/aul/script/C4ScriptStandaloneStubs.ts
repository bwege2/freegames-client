// @ts-nocheck
// OpenClonk 36de799: src/script/C4ScriptStandaloneStubs.cpp, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $throw } from '../../rt/std.ts';

export function FnGetEffectsFor(pTarget) {
  if (pTarget === $.ScriptEngine.GetPropList()) {
    return P($.ScriptEngine, "pGlobalEffects");
  }
  if (pTarget === $.GameScript.ScenPropList.getPropList()) {
    return P($.GameScript, "pScenarioEffects");
  }
  if (pTarget != null) {
    $throw(new $.C4AulExecError().init(S("Only global and scenario effects are supported")));
  }
  return P($.ScriptEngine, "pGlobalEffects");
}

export function EraseItemSafe(_szFilename) {
  return false;
}

export function AddDbgRec(_0, _1 = null, _2 = 0) {
}





export function $init(): void {
  $.Strings = new $.C4StringTable(); $.Strings.init();
  $.ScriptEngine = new $.C4AulScriptEngine(); $.ScriptEngine.init();
  $.Config = new $.C4Config(); $.Config.init();
  $.Reloc = new $.C4Reloc(); $.Reloc.None();
}

Object.assign($, { AddDbgRec, EraseItemSafe, FnGetEffectsFor });
