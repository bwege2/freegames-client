// @ts-nocheck
// OpenClonk 36de799: src/script/C4Aul.cpp, src/script/C4Aul.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { C4PropListStaticMember } from './C4PropList.ts';
import { c$memset, c$strcmp } from '../../rt/libc.ts';
import { $peq, $rd, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $begin, $delete, $end, $throw, $vpush, StdException, seq_erase, seq_sort, seq_splice } from '../../rt/std.ts';

export class C4AulError extends StdException {
  sMessage = new $.StdCopyStrBuf();

  what() {
    return this.sMessage.op_const_void_() != null ? this.sMessage.getData() : S("(unknown error)");
  }

  None() {
    this.sMessage = new $.StdCopyStrBuf();
    return this;
  }

  $clone() { return new C4AulError().$assign(this); }
  $assign(o) {
    this.sMessage.$assign(o.sMessage);
    return this;
  }
}

export class C4AulFuncMap {
  Funcs = new Array(1025).fill(null);
  FuncCnt = 0;

  init() {
    this.FuncCnt = 0;
    c$memset(P(this.Funcs, 0), 0, 8200);
    return this;
  }

  $dtor() {
    0;
  }

  GetFirstFunc(Name) {
    if (Name == null) {
      return null;
    }
    let Func = this.Funcs[C4AulFuncMap.Hash(Name) % 1025];
    while (Func != null && !$.SEqual(Name, Func.GetName())) {
      Func = Func.MapNext;
    }
    return Func;
  }

  GetNextSNFunc(After) {
    let Func = After.MapNext;
    while (Func != null && !$peq(After.GetName(), Func.GetName())) {
      Func = Func.MapNext;
    }
    return Func;
  }

  static Hash(name) {
    let $t1;
    let h = 0x811c9dc5;
    while (name.a[name.o] !== 0) {
      h = Math.imul((h ^ $rd(($t1 = name, name = name.add(1), $t1)) >>> 0) >>> 0, 0x1000193) >>> 0;
    }
    return h;
  }

  Add(func) {
    this.FuncCnt = this.FuncCnt + 1 | 0;
    let pFunc = P(this.Funcs, C4AulFuncMap.Hash(func.GetName()) % 1025);
    func.MapNext = pFunc.a[pFunc.o];
    pFunc.a[pFunc.o] = func;
  }

  Remove(func) {
    let pFunc = P(this.Funcs, C4AulFuncMap.Hash(func.GetName()) % 1025);
    while (pFunc.a[pFunc.o] !== func) {
      pFunc = P(pFunc.a[pFunc.o], "MapNext");
      0;
    }
    pFunc.a[pFunc.o] = pFunc.a[pFunc.o].MapNext;
    this.FuncCnt = this.FuncCnt - 1 | 0;
  }

  $clone() { return new C4AulFuncMap().$assign(this); }
  $assign(o) {
    this.Funcs = o.Funcs.slice();
    this.FuncCnt = o.FuncCnt;
    return this;
  }
}

export class C4AulUserFile {
  sContents = new $.StdCopyStrBuf();
  handle = 0;

  init(handle) {
    this.sContents = new $.StdCopyStrBuf();
    this.handle = handle;
    return this;
  }

  Write(data, data_length) {
    this.sContents.Append$pi8$u64(data, data_length);
  }

  GetFileContents() {
    return this.sContents.getData();
  }

  GrabFileContents() {
    let r = new $.StdStrBuf();
    r.Take$rStdStrBuf(this.sContents);
    return r;
  }

  GetFileLength() {
    return this.sContents.getLength();
  }

  GetHandle() {
    return this.handle;
  }

  $clone() { return new C4AulUserFile().$assign(this); }
  $assign(o) {
    this.sContents.$assign(o.sContents);
    this.handle = o.handle;
    return this;
  }
}

export class C4AulErrorHandler {

  $dtor() {
    $.ScriptEngine.UnregisterErrorHandler(this);
  }

  $clone() { return new C4AulErrorHandler().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class DefaultErrorHandler extends C4AulErrorHandler {

  OnError(msg) {
    $.DebugLogF(S("ERROR: %s"), msg);
    $.ScriptEngine.errCnt = $.ScriptEngine.errCnt + 1 | 0;
  }

  OnWarning(msg) {
    $.DebugLogF(S("WARNING: %s"), msg);
    $.ScriptEngine.warnCnt = $.ScriptEngine.warnCnt + 1 | 0;
  }

  $clone() { return new DefaultErrorHandler().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class C4AulParseError extends C4AulError {

  init$pC4ScriptHost$pi8(pScript, pMsg) {
    this.sMessage.Copy$pi8(pMsg);
    if (pScript != null) {
      this.sMessage.AppendFormat(S(" (%s)"), pScript.ScriptName.getData());
    }
    return this;
  }

  init$pC4AulParse$pi8(state, pMsg) {
    this.sMessage.Copy$pi8(pMsg);
    state.AppendPosition(this.sMessage);
    return this;
  }

  init$pC4AulScriptFunc$pi8$pi8(Fn, SPos, pMsg) {
    this.sMessage.Copy$pi8(pMsg);
    if (Fn == null) {
      return this;
    }
    this.sMessage.Append$pi8(S(" ("));
    if (Fn.GetName() != null) {
      this.sMessage.AppendFormat(S("in %s"), Fn.GetName());
    }
    if (Fn.GetName() != null && Fn.pOrgScript != null && SPos != null) {
      this.sMessage.Append$pi8(S(", "));
    }
    if (Fn.pOrgScript != null && SPos != null) {
      this.sMessage.AppendFormat(S("%s:%d:%d)"), Fn.pOrgScript.ScriptName.getData(), $.SGetLine(Fn.pOrgScript.GetScript(), SPos), $.SLineGetCharacters(Fn.pOrgScript.GetScript(), SPos));
    } else {
      this.sMessage.AppendChar(41);
    }
    return this;
  }

  $clone() { return new C4AulParseError().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class C4AulExecError extends C4AulError {

  init(szError) {
    0;
    this.sMessage.Copy$pi8(szError != null ? szError : S("(no error message)"));
    return this;
  }

  $clone() { return new C4AulExecError().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class C4AulScriptEngine extends C4PropListStaticMember {
  FuncLookUp = new C4AulFuncMap().init();
  Child0 = null;
  ChildL = null;
  UserFiles = [];
  OwnedPropLists = [];
  ErrorHandler = null;
  warnCnt = 0;
  errCnt = 0;
  lineCnt = 0;
  GlobalNamedNames = new $.C4ValueMapNames();
  GlobalNamed = new $.C4ValueMapData();
  GlobalConstNames = new $.C4ValueMapNames();
  GlobalConsts = new $.C4ValueMapData();
  pGlobalEffects = null;

  GetFirstFunc(Name) {
    return this.FuncLookUp.GetFirstFunc(Name);
  }

  GetNextSNFunc(After) {
    return this.FuncLookUp.GetNextSNFunc(After);
  }

  init() {
    super.init(null, null, $.Strings.RegString$pi8(S("Global")));
    this.FuncLookUp = new C4AulFuncMap().init();
    this.UserFiles = [];
    this.OwnedPropLists = [];
    this.ErrorHandler = $.DefaultErrorHandler$C4Aul;
    this.warnCnt = 0;
    this.errCnt = 0;
    this.lineCnt = 0;
    this.GlobalNamedNames = new $.C4ValueMapNames();
    this.GlobalNamed = new $.C4ValueMapData();
    this.GlobalConstNames = new $.C4ValueMapNames();
    this.GlobalConsts = new $.C4ValueMapData();
    this.pGlobalEffects = null;
    this.GlobalNamedNames.Reset();
    this.GlobalNamed.Reset();
    this.GlobalNamed.SetNameList(this.GlobalNamedNames);
    this.GlobalConstNames.Reset();
    this.GlobalConsts.Reset();
    this.GlobalConsts.SetNameList(this.GlobalConstNames);
    this.Child0 = this.ChildL = null;
    this.RegisterGlobalConstant(S("Global"), $.C4VPropList(this));
    return this;
  }

  $dtor() {
    this.Clear();
    super.$dtor();
  }

  Clear() {
    $delete($.C4AulDebug.GetDebugger());
    while (this.Child0 != null) {
      if (this.Child0.Delete()) {
        $delete(this.Child0);
      } else {
        this.Child0.Unreg();
      }
    }
    $.C4PropList.prototype.Clear.call(this);
    this.warnCnt = this.errCnt = this.lineCnt = 0;
    this.GlobalNamedNames.Reset();
    this.GlobalConstNames.Reset();
    this.GlobalConsts.Reset();
    this.GlobalConsts.SetNameList(this.GlobalConstNames);
    this.RegisterGlobalConstant(S("Global"), $.C4VPropList(this));
    this.GlobalNamed.Reset();
    this.GlobalNamed.SetNameList(this.GlobalNamedNames);
    $delete(this.pGlobalEffects);
    this.pGlobalEffects = null;
    this.UserFiles.length = 0;
    for (const value of this.OwnedPropLists) {
      let plist = value.getPropList();
      if (plist != null) {
        if (plist.Delete()) {
          $delete(plist);
        } else {
          $.C4PropList.prototype.Clear.call(plist);
        }
      }
    }
    this.OwnedPropLists.length = 0;
  }

  Link(rDefs) {
    try {
      for (let s = this.Child0; s != null; s = s.Next) {
        s.ResolveAppends(rDefs);
      }
      for (let s = this.Child0; s != null; s = s.Next) {
        s.ResolveIncludes(rDefs);
      }
      for (let s = this.Child0; s != null; s = s.Next) {
        s.Parse();
      }
      if (rDefs != null) {
        rDefs.SortByPriority();
        rDefs.CallEveryDefinition();
      }
      for (let s = this.Child0; s != null; s = s.Next) {
        s.GetPropList$v().FreezeAndMakeStaticRecursively(s.ownedPropLists);
      }
      this.GetPropList().FreezeAndMakeStaticRecursively(this.OwnedPropLists);
    } catch ($e1) {
      if ($e1 instanceof C4AulError) {
        const err = $e1;
        this.ErrorHandler.OnError(err.what());
      } else {
        throw $e1;
      }
    }
    $.ScriptEngine.GlobalNamed.SetNameList($.ScriptEngine.GlobalNamedNames);
  }

  ReLink(rDefs) {
    this.UnLink();
    if (rDefs != null) {
      rDefs.ResetIncludeDependencies();
    }
    this.Link(rDefs);
    $.LogF(S("C4AulScriptEngine linked - %d line%s, %d warning%s, %d error%s"), this.lineCnt, this.lineCnt !== 1 ? S("s") : S(""), this.warnCnt, this.warnCnt !== 1 ? S("s") : S(""), this.errCnt, this.errCnt !== 1 ? S("s") : S(""));
    if (this.pGlobalEffects != null) {
      this.pGlobalEffects.ReAssignAllCallbackFunctions();
    }
    if ($.GameScript.pScenarioEffects != null) {
      $.GameScript.pScenarioEffects.ReAssignAllCallbackFunctions();
    }
  }

  GetPropList() {
    return this;
  }

  ReloadScript(szScript, szLanguage) {
    let s = null;
    for (s = this.Child0; s != null; s = s.Next) {
      if (s.ReloadScript(szScript, szLanguage)) {
        break;
      }
    }
    return !(s == null);
  }

  GetFunctionNames(p) {
    let functions = [];
    let global_functions = [];
    let sort_alpha = ((a, b) => {
  return c$strcmp(a, b) < 0;
});
    if (p == null) {
      p = this.GetPropList();
    }
    let a = p.GetProperties();
    for (let i = 0; i < a.GetSize(); i = i + 1 | 0) {
      let key = a.op_index$i32$c(i).getStr();
      if (key == null) {
        continue;
      }
      let f = p.GetFunc$pC4String(key);
      if (f == null) {
        continue;
      }
      if (!f.GetPublic()) {
        continue;
      }
      if (!$.ScriptEngine.GetPropList().HasProperty(key)) {
        functions.push(key.GetCStr());
      } else {
        global_functions.push(key.GetCStr());
      }
    }
    $delete(a);
    seq_sort(functions, sort_alpha);
    if (!(functions.length === 0) && !(global_functions.length === 0)) {
      functions.push(null);
    }
    seq_sort(global_functions, sort_alpha);
    seq_splice(functions, $end(functions), global_functions);
    return functions;
  }

  RegisterGlobalConstant(szName, rValue) {
    this.GlobalConsts.op_index$i32(this.GlobalConstNames.AddName(szName)).$assign(rValue);
  }

  GetGlobalConstant(szName, pTargetValue) {
    let iConstIndex = this.GlobalConstNames.GetItemNr(szName);
    if (iConstIndex < 0) {
      return false;
    }
    if (pTargetValue != null) {
      pTargetValue.$assign(this.GlobalConsts.op_index$i32(iConstIndex));
    }
    return true;
  }

  Denumerate(numbers) {
    this.GlobalNamed.Denumerate(numbers);
    $.GameScript.Denumerate(numbers);
    $.C4PropList.prototype.Denumerate.call(this, numbers);
    if (this.pGlobalEffects != null) {
      this.pGlobalEffects.Denumerate(numbers);
    }
  }

  UnLink() {
    this.warnCnt = this.errCnt = this.lineCnt = 0;
    this.GetPropList().ThawRecursively();
    for (let s = this.Child0; s != null; s = s.Next) {
      s.GetPropList$v().ThawRecursively();
    }
    for (let s = this.Child0; s != null; s = s.Next) {
      s.UnLink();
    }
  }

  CompileFunc$pStdCompiler$b$pC4ValueNumbers(pComp, fScenarioSection, numbers$) {
    const numbers = [numbers$];
    if (!fScenarioSection) {
      0;
      let GlobalNamedDefault = new $.C4ValueMapData();
      GlobalNamedDefault.SetNameList(this.GlobalNamedNames);
      pComp.Value$StdNamingDefaultAdapt$StdParameterAdapt$C4ValueMapData$pC4ValueNumbers$C4ValueMapData($.mkNamingAdapt$mStdParameterAdapt$C4ValueMapData$pC4ValueNumbers$pi8$C4ValueMapData$b$b($.mkParAdapt$rC4ValueMapData$rpC4ValueNumbers(this.GlobalNamed, P(numbers, 0)), S("StaticVariables"), GlobalNamedDefault));
      pComp.Value$StdNamingAdapt$StdParameterAdapt$C4PropList$pC4ValueNumbers($.mkNamingAdapt$mStdParameterAdapt$C4PropList$pC4ValueNumbers$pi8($.mkParAdapt$rC4PropList$rpC4ValueNumbers($.GameScript.ScenPropList._getPropList(), P(numbers, 0)), S("Scenario")));
    }
    if (pComp.isDeserializer() && this.pGlobalEffects != null) {
      GlobalEffectsMergeCompileFunc(pComp, P(this, "pGlobalEffects"), S("Effects"), this, numbers[0]);
      GlobalEffectsMergeCompileFunc(pComp, P($.GameScript, "pScenarioEffects"), S("ScenarioEffects"), $.GameScript.ScenPropList._getPropList(), numbers[0]);
    } else {
      pComp.Value$StdParameter2Adapt$StdPtrAdapt$C4Effect$pC4AulScriptEngine$pC4ValueNumbers($.mkParAdapt$mStdPtrAdapt$C4Effect$mpC4AulScriptEngine$rpC4ValueNumbers($.mkNamingPtrAdapt(P(this, "pGlobalEffects"), S("Effects")), this, P(numbers, 0)));
      pComp.Value$StdParameter2Adapt$StdPtrAdapt$C4Effect$pC4PropList$pC4ValueNumbers($.mkParAdapt$mStdPtrAdapt$C4Effect$mpC4PropList$rpC4ValueNumbers($.mkNamingPtrAdapt(P($.GameScript, "pScenarioEffects"), S("ScenarioEffects")), $.GameScript.ScenPropList._getPropList(), P(numbers, 0)));
    }
    pComp.Value$StdNamingAdapt$C4ValueNumbers($.mkNamingAdapt$rC4ValueNumbers$pi8(numbers[0], S("Values")));
  }

  CreateUserFile() {
    let last_handle = 1;
    for (let i = $begin(this.UserFiles); !i.eq($end(this.UserFiles)); i.inc()) {
      if (i.v.GetHandle() >= last_handle) {
        last_handle = i.v.GetHandle() + 1 | 0;
      }
    }
    $vpush(this.UserFiles, new C4AulUserFile().init(last_handle));
    return last_handle;
  }

  CloseUserFile(handle) {
    for (let i = $begin(this.UserFiles); !i.eq($end(this.UserFiles)); i.inc()) {
      if (i.v.GetHandle() === handle) {
        seq_erase(this.UserFiles, i);
        break;
      }
    }
  }

  GetUserFile(handle) {
    for (const UserFile of this.UserFiles) {
      if (UserFile.GetHandle() === handle) {
        return UserFile;
      }
    }
    return null;
  }

  RegisterErrorHandler(handler) {
    0;
    this.ErrorHandler = handler;
  }

  UnregisterErrorHandler(_handler) {
    0;
    this.ErrorHandler = $.DefaultErrorHandler$C4Aul;
  }

  GetErrorHandler() {
    return this.ErrorHandler;
  }

  $clone() { return new C4AulScriptEngine().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.FuncLookUp.$assign(o.FuncLookUp);
    this.Child0 = o.Child0;
    this.ChildL = o.ChildL;
    this.UserFiles = o.UserFiles.slice();
    this.OwnedPropLists = o.OwnedPropLists.slice();
    this.ErrorHandler = o.ErrorHandler;
    this.warnCnt = o.warnCnt;
    this.errCnt = o.errCnt;
    this.lineCnt = o.lineCnt;
    this.GlobalNamedNames.$assign(o.GlobalNamedNames);
    this.GlobalNamed.$assign(o.GlobalNamed);
    this.GlobalConstNames.$assign(o.GlobalConstNames);
    this.GlobalConsts.$assign(o.GlobalConsts);
    this.pGlobalEffects = o.pGlobalEffects;
    return this;
  }
}




function GlobalEffectsMergeCompileFunc(pComp, pEffects, name, pForObj$, numbers$) {
  const pForObj = [pForObj$];
  const numbers = [numbers$];
  let pOldEffect = null;
  let pNextOldEffect = pEffects.a[pEffects.o];
  pEffects.a[pEffects.o] = null;
  try {
    pComp.Value$StdParameter2Adapt$StdPtrAdapt$C4Effect$pC4PropList$pC4ValueNumbers$2($.mkParAdapt$mStdPtrAdapt$C4Effect$rpC4PropList$rpC4ValueNumbers($.mkNamingPtrAdapt(pEffects, name), P(pForObj, 0), P(numbers, 0)));
  } catch ($e1) {
    {
      $delete(pNextOldEffect);
      $throw($e1);
    }
  }
  while ((pOldEffect = pNextOldEffect) != null) {
    pNextOldEffect = pOldEffect.pNext;
    pOldEffect.Register(pEffects, $.Abs$i32(pOldEffect.iPriority));
  }
}

export function $init(): void {
  $.C4AulWarningMessages = [
  S("unknown escape sequence '\\%c'"),
  S("'\\x' used with no following hex digits"),
  S("type '%s' used as parameter name"),
  S("parameter %u of call to '%s' is empty"),
  S("array entry %u is empty"),
  S("implicit declaration of the loop variable '%s' in a for-in loop is deprecated"),
  S("variable '%s' declared as const, but non-global variables are always mutable"),
  S("declaration of %s '%s' shadows %s"),
  S("variable '%s' used outside of its declared scope"),
  S("redeclaration of %s '%s'"),
  S("use of '%s' in a function forces it to take variable arguments"),
  S("call to '%s' passes %u arguments, of which only %u are used"),
  S("parameter %u of call to '%s' passes %s (%s expected)"),
  S("empty controlled statement (use '{}' if this is intentional)"),
  S("suspicious assignment (was a comparison intended here?)"),
  null,
];
  $.C4AulWarningIDs = [
  S("invalid_escape_sequence"),
  S("invalid_hex_escape"),
  S("type_name_used_as_par_name"),
  S("empty_parameter_in_call"),
  S("empty_parameter_in_array"),
  S("implicit_range_loop_var_decl"),
  S("non_global_var_is_never_const"),
  S("variable_shadows_variable"),
  S("variable_out_of_scope"),
  S("redeclaration"),
  S("undeclared_varargs"),
  S("arg_count_mismatch"),
  S("arg_type_mismatch"),
  S("empty_if"),
  S("suspicious_assignment"),
  null,
];
  $.DefaultErrorHandler$C4Aul = new DefaultErrorHandler();
}

Object.assign($, { C4AulError, C4AulErrorHandler, C4AulExecError, C4AulFuncMap, C4AulParseError, C4AulScriptEngine, C4AulUserFile, DefaultErrorHandler, GlobalEffectsMergeCompileFunc });
