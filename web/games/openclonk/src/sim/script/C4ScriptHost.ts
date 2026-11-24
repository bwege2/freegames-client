// @ts-nocheck
// OpenClonk 36de799: src/script/C4ScriptHost.cpp, src/script/C4ScriptHost.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n } from '../../rt/int.ts';
import { $oat, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $begin, $delete, $end, $itcopy, $rbegin, $rend, $throw, Bitset, StdMap, seq_insert, std_find } from '../../rt/std.ts';
import { C4ComponentHost } from '../c4group/C4ComponentHost.ts';
import { C4PropListStatic } from './C4PropList.ts';

export class C4ScriptHost extends C4ComponentHost {
  SourceScripts = [];
  ScriptName = new $.StdCopyStrBuf();
  Engine = null;
  Prev = null;
  Next = null;
  Includes = [];
  Appends = [];
  Resolving = false;
  IncludesResolved = false;
  Script = new $.StdStrBuf();
  stringTable = null;
  LocalValues = new $.C4Set$C4Property().init();
  State = 0 /*ASS_NONE*/;
  ownedFunctions = [];
  ownedPropLists = [];
  enabledWarnings = new StdMap();
  ast = null;

  $dtor() {
    C4ScriptHost.prototype.Unreg.call(this);
    C4ScriptHost.prototype.Clear.call(this);
    super.$dtor();
  }

  Delete() {
    return false;
  }

  Clear() {
    this.UnlinkOwnedFunctions();
    $.C4ComponentHost.prototype.Clear.call(this);
    this.ast = null;
    this.Script.Clear();
    this.LocalValues.Clear();
    this.DeleteOwnedPropLists();
    this.SourceScripts.length = 0;
    this.SourceScripts.push(this);
    if (this.stringTable != null) {
      this.stringTable.DelRef();
      this.stringTable = null;
    }
    this.Includes.length = 0;
    this.Appends.length = 0;
    this.State = 0 /*ASS_NONE*/;
    this.enabledWarnings.clear();
  }

  Load$rC4Group$pi8$pi8$pC4LangStringTable(hGroup, szFilename, szLanguage, pLocalTable) {
    let fSuccess = $.C4ComponentHost.prototype.Load$rC4Group$pi8$pi8.call(this, hGroup, szFilename, szLanguage);
    if (this.stringTable !== pLocalTable) {
      if (this.stringTable != null) {
        this.stringTable.DelRef();
      }
      this.stringTable = pLocalTable;
      if (this.stringTable != null) {
        this.stringTable.AddRef();
      }
    }
    this.ScriptName.Ref$pi8(this.GetFilePath());
    this.MakeScript();
    return fSuccess;
  }

  LoadData(szFilename, szData, pLocalTable) {
    if (this.stringTable !== pLocalTable) {
      if (this.stringTable != null) {
        this.stringTable.DelRef();
      }
      this.stringTable = pLocalTable;
      if (this.stringTable != null) {
        this.stringTable.AddRef();
      }
    }
    this.ScriptName.Copy$pi8(szFilename);
    let tempScript = new $.StdStrBuf();
    tempScript.Copy$pi8(szData);
    this.Script.Clear();
    if (this.stringTable != null) {
      this.stringTable.ReplaceStrings$StdStrBuf$rStdStrBuf(tempScript, this.Script);
    } else {
      this.Script.Take$rStdStrBuf(tempScript);
    }
    this.Preparse();
    return true;
  }

  Reg2List(pEngine) {
    if (this.Engine != null) {
      return;
    }
    if ((this.Engine = pEngine) != null) {
      if ((this.Prev = this.Engine.ChildL) != null) {
        this.Prev.Next = this;
      } else {
        this.Engine.Child0 = this;
      }
      this.Engine.ChildL = this;
    } else {
      this.Prev = null;
    }
    this.Next = null;
  }

  GetPropList$v() {
    return null;
  }

  GetPropList$v$c() {
    return this.GetPropList$v();
  }

  GetScript() {
    return this.Script.getData();
  }

  IsReady() {
    return this.State === 3;
  }

  Translate(text) {
    if (this.stringTable != null) {
      return this.stringTable.Translate(text).$clone();
    }
    $throw(new $.C4LangStringTable$NoSuchTranslation().init(text));
  }

  IsWarningEnabled(pos, warning) {
    0;
    if (this.enabledWarnings.empty()) {
      return false;
    }
    let entry = this.enabledWarnings.upper_bound(pos);
    0;
    if (!entry.eq(this.enabledWarnings.begin())) {
      entry.dec();
    }
    return entry.v.second.test($u64n(warning));
  }

  init() {
    this.SourceScripts = [];
    this.ScriptName = new $.StdCopyStrBuf();
    this.Engine = null;
    this.Prev = null;
    this.Next = null;
    this.Includes = [];
    this.Appends = [];
    this.Script = new $.StdStrBuf();
    this.LocalValues = new $.C4Set$C4Property().init();
    this.State = 0 /*ASS_NONE*/;
    this.ownedFunctions = [];
    this.ownedPropLists = [];
    this.enabledWarnings = new StdMap();
    this.ast = null;
    $.StdStrBuf.prototype.op_assign$pi8.call(this.Script, null);
    this.stringTable = null;
    this.SourceScripts.push(this);
    this.IncludesResolved = false;
    this.Resolving = false;
    this.Includes.length = 0;
    this.Appends.length = 0;
    return this;
  }

  Unreg() {
    if (this.Prev != null) {
      this.Prev.Next = this.Next;
    } else if (this.Engine != null) {
      this.Engine.Child0 = this.Next;
    }
    if (this.Next != null) {
      this.Next.Prev = this.Prev;
    } else if (this.Engine != null) {
      this.Engine.ChildL = this.Prev;
    }
    this.Prev = this.Next = null;
    this.Engine = null;
  }

  MakeScript() {
    this.Script.Clear();
    if (this.stringTable != null) {
      this.stringTable.ReplaceStrings$StdStrBuf$rStdStrBuf(this.GetDataBuf(), this.Script);
    } else {
      this.Script.Ref$StdStrBuf(this.GetDataBuf());
    }
    this.Preparse();
  }

  ReloadScript(szPath, szLanguage) {
    if ($.SEqualNoCase(szPath, this.GetFilePath()) || this.stringTable != null && $.SEqualNoCase(szPath, this.stringTable.GetFilePath())) {
      const szParentPath = new Int8Array(4097);
      let ParentGrp = new $.C4Group().init();
      if ($.GetParentPath$pi8$pi8(szPath, P(szParentPath, 0))) {
        if (ParentGrp.Open(P(szParentPath, 0))) {
          if (this.Load$rC4Group$pi8$pi8$pC4LangStringTable(ParentGrp, null, szLanguage, this.stringTable)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  Preparse() {
    if (this.State < 0) {
      return false;
    }
    this.Includes.length = 0;
    this.Appends.length = 0;
    $.C4PropList.prototype.Clear.call(this.GetPropList$v());
    this.GetPropList$v().SetProperty(0 /*P_Prototype*/, $.C4VPropList(this.Engine.GetPropList()));
    this.LocalValues.Clear();
    this.AddEngineFunctions();
    0;
    const warnings = this.enabledWarnings.entry(this.Script.getData(), () => new Bitset(15)).second;
    warnings.set(0, true);
    warnings.set(1, true);
    warnings.set(2, false);
    warnings.set(3, false);
    warnings.set(4, false);
    warnings.set(5, true);
    warnings.set(6, true);
    warnings.set(7, true);
    warnings.set(8, true);
    warnings.set(9, true);
    warnings.set(10, true);
    warnings.set(11, true);
    warnings.set(12, true);
    warnings.set(13, true);
    warnings.set(14, true);
    let parser = new $.C4AulParse().init$pC4ScriptHost(this);
    this.ast = parser.Parse_Script(this);
    $.C4AulCompiler.Preparse(this, this, this.ast);
    this.IncludesResolved = false;
    this.GetPropList$v().Properties.Swap(this.LocalValues);
    this.State = 1 /*ASS_PREPARSED*/;
    return true;
  }

  Parse() {
    let $t1, $t2;
    if (this.State !== 2) {
      return false;
    }
    if (!(this.Appends.length === 0)) {
      return true;
    }
    let p = this.GetPropList$v();
    $t1 = this.SourceScripts;
    for (let $i1 = 0; $i1 < $t1.length; $i1++) {
      const SourceScript = P($t1, $i1);
      this.CopyPropList(SourceScript.a[SourceScript.o].LocalValues, p);
      if (SourceScript.a[SourceScript.o] === this) {
        continue;
      }
      if (this.GetPropList$v() != null && this.GetPropList$v().GetDef$v() != null && SourceScript.a[SourceScript.o].GetPropList$v() != null && SourceScript.a[SourceScript.o].GetPropList$v().GetDef$v() != null) {
        this.GetPropList$v().GetDef$v().IncludeDefinition(SourceScript.a[SourceScript.o].GetPropList$v().GetDef$v());
      }
    }
    $t2 = this.SourceScripts;
    for (let $i1 = 0; $i1 < $t2.length; $i1++) {
      const s = P($t2, $i1);
      $.C4AulCompiler.Compile$pC4ScriptHost$pC4ScriptHost$pScript(this, s.a[s.o], s.a[s.o].ast);
    }
    this.Engine.lineCnt = this.Engine.lineCnt + $.SGetLine(this.Script.getData(), this.Script.getPtr(this.Script.getLength())) | 0;
    this.State = 3 /*ASS_PARSED*/;
    return true;
  }

  UnLink() {
    let p = this.GetPropList$v();
    if (p != null) {
      $.C4PropList.prototype.Clear.call(p);
      p.SetProperty(0 /*P_Prototype*/, $.C4VPropList(this.Engine.GetPropList()));
    }
    this.DeleteOwnedPropLists();
    this.IncludesResolved = false;
    if (this.State > 1) {
      this.State = 1 /*ASS_PREPARSED*/;
    }
  }

  UnlinkOwnedFunctions() {
    for (const box of this.ownedFunctions) {
      0;
      let func = box._getFunction().SFunc();
      let parent = func.Parent;
      if (parent === this.GetPropList$v()) {
        continue;
      }
      0;
      let v = new $.C4Value().init$v();
      parent.GetPropertyByS(func.Name.op_C4String_(), v);
      if (v.getFunction() === func) {
        parent.Thaw();
        if (func.OwnerOverloaded != null) {
          parent.SetPropertyByS(func.Name.op_C4String_(), $.C4VFunction(func.OwnerOverloaded));
        } else {
          parent.ResetProperty(func.Name.op_C4String_());
        }
      } else {
        let func_chain = v.getFunction().SFunc();
        0;
        while (func_chain != null) {
          if (func_chain.OwnerOverloaded === func) {
            func_chain.OwnerOverloaded = func.OwnerOverloaded;
            func.OwnerOverloaded = null;
            func.DecRef();
            break;
          }
          0;
          func_chain = func_chain.OwnerOverloaded.SFunc();
        }
      }
    }
    this.ownedFunctions.length = 0;
  }

  DeleteOwnedPropLists() {
    for (const value of this.ownedPropLists) {
      let plist = value.getPropList();
      if (plist != null) {
        if (plist.Delete()) {
          $delete(plist);
        } else {
          $.C4PropList.prototype.Clear.call(plist);
        }
      }
    }
    this.ownedPropLists.length = 0;
  }

  Warn(pMsg, ...$va) {
    let args = null;
    args = { a: $va, i: 0 };
    let Buf = $.FormatStringV(pMsg, args);
    Buf.AppendFormat(S(" (%s)"), this.ScriptName.getData());
    this.Engine.GetErrorHandler().OnWarning(Buf.getData());
    void 0;
  }

  AddEngineFunctions() {
  }

  CopyPropList(from, to) {
    let prop = from.First();
    while (prop != null) {
      switch (prop.Value.GetType()) {
        case 6:
          {
            let sf = prop.Value.getFunction().SFunc();
            if (sf != null) {
              let sfc = null;
              if (sf.pOrgScript !== this) {
                sfc = new $.C4AulScriptFunc().init$pC4PropListStatic$C4AulScriptFunc(to, sf);
              } else {
                sfc = sf;
              }
              sfc.SetOverloaded(to.GetFunc$pC4String(sf.Name.op_C4String_()));
              to.SetPropertyByS(prop.Key, $.C4VFunction(sfc));
            } else {
              to.SetPropertyByS(prop.Key, prop.Value);
            }
          }
          break;
        case 3:
          {
            let p = prop.Value._getPropList().IsStatic$v();
            0;
            if (prop.Key !== $oat($.Strings.P, 0 /*P_Prototype*/)) {
              if (p == null || p.GetParent() !== to) {
                p = $.C4PropList.NewStatic(null, to, prop.Key);
                this.CopyPropList(prop.Value._getPropList().Properties, p);
              }
            }
            to.SetPropertyByS(prop.Key, $.C4VPropList(p));
          }
          break;
        case 5:
        default:
          to.SetPropertyByS(prop.Key, prop.Value);
      }
      prop = from.Next(prop);
    }
  }

  ResolveIncludes(rDefs) {
    if (this.State !== 1) {
      return false;
    }
    if (this.IncludesResolved) {
      return true;
    }
    if (this.Resolving) {
      this.Engine.GetErrorHandler().OnError(new $.C4AulParseError().init$pC4ScriptHost$pi8(this, S("Circular include chain detected - ignoring all includes!")).what());
      this.IncludesResolved = true;
      this.State = 2 /*ASS_LINKED*/;
      return false;
    }
    this.Resolving = true;
    for (let i = $rbegin(this.Includes); !i.eq($rend(this.Includes)); i.inc()) {
      let Def = rDefs != null ? rDefs.GetByName(i.v) : null;
      if (Def != null) {
        if (!Def.Script.IncludesResolved) {
          if (!Def.Script.ResolveIncludes(rDefs)) {
            continue;
          }
        }
        for (let s = $rbegin(Def.Script.SourceScripts); !s.eq($rend(Def.Script.SourceScripts)); s.inc()) {
          if (std_find($begin(this.SourceScripts), $end(this.SourceScripts), s.v).eq($end(this.SourceScripts))) {
            this.SourceScripts.unshift(s.v);
          }
        }
      } else {
        this.Warn(S("#include %s not found"), i.v.getData());
      }
    }
    this.IncludesResolved = true;
    this.Resolving = false;
    this.State = 2 /*ASS_LINKED*/;
    return true;
  }

  ResolveAppends(rDefs) {
    if (this.State !== 1) {
      return false;
    }
    for (const Append of this.Appends) {
      if (Append.op_ne$pi8(S("*")) || rDefs == null) {
        let Def = rDefs != null ? rDefs.GetByName(Append) : null;
        if (Def != null) {
          this.DoAppend(Def);
        } else {
          this.Warn(S("#appendto %s not found"), Append.getData());
        }
      } else {
        for (let i = 0; i < rDefs.GetDefCount(); i = i + 1 | 0) {
          let pDef = rDefs.GetDef(i);
          if (pDef == null) {
            break;
          }
          if (pDef === this.GetPropList$v()) {
            continue;
          }
          this.DoAppend(pDef);
        }
      }
    }
    return true;
  }

  DoAppend(def) {
    if (std_find($begin(def.Script.SourceScripts), $end(def.Script.SourceScripts), this).eq($end(def.Script.SourceScripts))) {
      def.Script.SourceScripts.push(this);
      if (!(this.Includes.length === 0)) {
        this.Warn(S("#appendto contains #include"));
        seq_insert(def.Script.Includes, $end(def.Script.Includes), $begin(this.Includes), $end(this.Includes), (x) => x.$clone());
      }
    }
  }

  EnableWarning(pos, warning, enable = true) {
    let entry = this.enabledWarnings.insert(pos, new Bitset(15));
    if (entry.second) {
      0;
      let previous = $itcopy(entry.first);
      previous.dec();
      entry.first.v.second.$assign(previous.v.second);
    }
    entry.first.v.second.set($u64n(warning), enable);
  }

  $clone() { return new C4ScriptHost().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.SourceScripts = o.SourceScripts.slice();
    this.ScriptName.$assign(o.ScriptName);
    this.Engine = o.Engine;
    this.Prev = o.Prev;
    this.Next = o.Next;
    this.Includes = o.Includes.slice();
    this.Appends = o.Appends.slice();
    this.Resolving = o.Resolving;
    this.IncludesResolved = o.IncludesResolved;
    this.Script.$assign(o.Script);
    this.stringTable = o.stringTable;
    this.LocalValues.$assign(o.LocalValues);
    this.State = o.State;
    this.ownedFunctions = o.ownedFunctions.slice();
    this.ownedPropLists = o.ownedPropLists.slice();
    this.enabledWarnings = o.enabledWarnings.$clone();
    this.ast = o.ast;
    return this;
  }
}

export class C4ExtraScriptHost extends C4ScriptHost {
  ParserPropList = new $.C4Value().init$v();

  init(parent_key_name = null) {
    super.init();
    this.ParserPropList = new $.C4Value().init$pC4PropListStatic($.C4PropList.NewStatic(null, null, parent_key_name));
    return this;
  }

  $dtor() {
    C4ExtraScriptHost.prototype.Clear.call(this);
    super.$dtor();
  }

  Clear() {
    C4ScriptHost.prototype.Clear.call(this);
    $.C4PropList.prototype.Clear.call(this.ParserPropList._getPropList());
  }

  Delete() {
    return true;
  }

  GetPropList$v() {
    return this.ParserPropList._getPropList().IsStatic$v();
  }

  $clone() { return new C4ExtraScriptHost().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.ParserPropList.$assign(o.ParserPropList);
    return this;
  }
}

export class C4DefScriptHost extends C4ScriptHost {
  Def = null;

  init() {
    super.init();
    this.Def = null;
    return this;
  }

  SetDef(to_def) {
    this.Def = to_def;
  }

  Parse() {
    let r = C4ScriptHost.prototype.Parse.call(this);
    0;
    if (!(this.Def.GetPlane$v() !== 0) && (this.Def.Category & 36895) !== 0) {
      let Plane = 0;
      let gotplane = true;
      switch (this.Def.Category & 36895) {
        case 1:
          Plane = 100;
          break;
        case 2:
          Plane = 200;
          break;
        case 4:
          Plane = 300;
          break;
        case 8:
          Plane = 400;
          break;
        case 16:
          Plane = 500;
          break;
        case 4097:
          Plane = -500;
          break;
        case 4098:
          Plane = -400;
          break;
        case 4100:
          Plane = -300;
          break;
        case 4104:
          Plane = -200;
          break;
        case 4112:
          Plane = -100;
          break;
        case 32769:
          Plane = 1100;
          break;
        case 32770:
          Plane = 1200;
          break;
        case 32772:
          Plane = 1300;
          break;
        case 32776:
          Plane = 1400;
          break;
        case 32784:
          Plane = 1500;
          break;
        default:
          this.Warn(S("Def %s (%s) has invalid category"), this.Def.GetName(), this.Def.GetDataString$v$c().getData());
          gotplane = false;
          break;
      }
      if (gotplane) {
        this.Def.SetProperty(78 /*P_Plane*/, $.C4VInt(Plane));
      }
    }
    if (!(this.Def.GetPlane$v() !== 0)) {
      this.Warn(S("Def %s (%s) has invalid Plane"), this.Def.GetName(), this.Def.GetDataString$v$c().getData());
      this.Def.SetProperty(78 /*P_Plane*/, $.C4VInt(1));
    }
    return r;
  }

  GetPropList$v() {
    return this.Def;
  }

  $clone() { return new C4DefScriptHost().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Def = o.Def;
    return this;
  }
}

export class C4GameScriptHost extends C4ScriptHost {
  ScenPropList = new $.C4Value().init$v();
  ScenPrototype = new $.C4Value().init$v();
  pScenarioEffects = null;

  init() {
    super.init();
    this.ScenPropList = new $.C4Value().init$i32(0);
    this.ScenPrototype = new $.C4Value().init$i32(0);
    this.pScenarioEffects = null;
    return this;
  }

  $dtor() {
    super.$dtor();
  }

  Load$rC4Group$pi8$pi8$pC4LangStringTable(g, f, l, t) {
    0;
    let pScen = new C4PropListScen().init(null, $oat($.Strings.P, 89 /*P_Scenario*/));
    this.ScenPropList.SetPropList(pScen);
    $.ScriptEngine.RegisterGlobalConstant(S("Scenario"), this.ScenPropList);
    this.ScenPrototype.SetPropList(pScen.GetPrototype());
    this.Reg2List($.ScriptEngine);
    return C4ScriptHost.prototype.Load$rC4Group$pi8$pi8$pC4LangStringTable.call(this, g, f, l, t);
  }

  LoadData(f, d, t) {
    0;
    let pScen = new C4PropListScen().init(null, $oat($.Strings.P, 89 /*P_Scenario*/));
    this.ScenPropList.SetPropList(pScen);
    $.ScriptEngine.RegisterGlobalConstant(S("Scenario"), this.ScenPropList);
    this.ScenPrototype.SetPropList(pScen.GetPrototype());
    this.Reg2List($.ScriptEngine);
    return C4ScriptHost.prototype.LoadData.call(this, f, d, t);
  }

  Clear() {
    C4ScriptHost.prototype.Clear.call(this);
    this.ScenPropList.Set0();
    this.ScenPrototype.Set0();
    $delete(this.pScenarioEffects);
    this.pScenarioEffects = null;
  }

  GetPropList$v() {
    let p = this.ScenPrototype._getPropList();
    return p != null ? p.IsStatic$v() : null;
  }

  Denumerate(numbers) {
    this.ScenPropList.Denumerate(numbers);
    if (this.pScenarioEffects != null) {
      this.pScenarioEffects.Denumerate(numbers);
    }
  }

  Call(szFunction, Pars = null, fPassError = false) {
    return this.ScenPropList._getPropList().Call$pi8$pC4AulParSet$b(szFunction, Pars, fPassError);
  }

  $clone() { return new C4GameScriptHost().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.ScenPropList.$assign(o.ScenPropList);
    this.ScenPrototype.$assign(o.ScenPrototype);
    this.pScenarioEffects = o.pScenarioEffects;
    return this;
  }
}

export class C4PropListScen extends C4PropListStatic {

  init(parent, key) {
    super.init(null, parent, key);
    let proto = $.C4PropList.NewStatic($.ScriptEngine.GetPropList(), this, $oat($.Strings.P, 0 /*P_Prototype*/));
    $.C4PropList.prototype.SetPropertyByS.call(this, $oat($.Strings.P, 0 /*P_Prototype*/), $.C4VPropList(proto));
    return this;
  }

  SetPropertyByS(k, to) {
    if (k === $oat($.Strings.P, 0 /*P_Prototype*/)) {
      $.DebugLog(S("ERROR: Attempt to set Scenario.Prototype."));
      return;
    }
    $.C4PropList.prototype.SetPropertyByS.call(this, k, to);
  }

  $clone() { return new C4PropListScen().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class C4ScenarioObjectsScriptHost extends C4ExtraScriptHost {

  init() {
    super.init($.Strings.RegString$pi8(S("ScenarioObjects")));
    return this;
  }

  $clone() { return new C4ScenarioObjectsScriptHost().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}


export function $init(): void {
  $.GameScript = new C4GameScriptHost(); $.GameScript.init();
}

Object.assign($, { C4DefScriptHost, C4ExtraScriptHost, C4GameScriptHost, C4PropListScen, C4ScenarioObjectsScriptHost, C4ScriptHost });
