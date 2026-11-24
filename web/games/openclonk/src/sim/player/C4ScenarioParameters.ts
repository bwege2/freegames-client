// @ts-nocheck
// OpenClonk 36de799: src/player/C4ScenarioParameters.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n } from '../../rt/int.ts';
import { $oat, $own, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { StdMap } from '../../rt/std.ts';

export class C4ScenarioParameterDef {
  Name = new $.StdCopyStrBuf();
  Description = new $.StdCopyStrBuf();
  ID = new $.StdCopyStrBuf();
  Type = 0;
  Options = [];
  Default = 0;
  LeagueValue = 0;
  Achievement = new $.StdCopyStrBuf();

  init() {
    this.Name = new $.StdCopyStrBuf();
    this.Description = new $.StdCopyStrBuf();
    this.ID = new $.StdCopyStrBuf();
    this.Options = [];
    this.Default = 0;
    this.LeagueValue = 0;
    this.Achievement = new $.StdCopyStrBuf();
    return this;
  }

  GetName() {
    return this.Name.getData();
  }

  GetDescription() {
    return this.Description.getData();
  }

  GetID() {
    return this.ID.getData();
  }

  GetType() {
    return this.Type;
  }

  GetDefault() {
    return this.Default;
  }

  GetLeagueValue() {
    return this.LeagueValue;
  }

  GetOptionByValue(val) {
    for (const Option of this.Options) {
      if (Option.Value === val) {
        return Option;
      }
    }
    return null;
  }

  GetOptionByIndex(idx) {
    if (idx >= this.Options.length) {
      return null;
    }
    return this.Options[idx];
  }

  IsAchievement() {
    return this.Achievement.getLength() > 0;
  }

  GetAchievement() {
    return this.Achievement.getData();
  }

  CompileFunc(pComp) {
    if (!pComp.Name(S("ParameterDef"))) {
      pComp.NameEnd();
      pComp.excNotFound(S("ParameterDef"));
    }
    pComp.Value$StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$StdCopyStrBuf($.mkNamingAdapt$mStdParameterAdapt$StdCopyStrBuf$i32$pi8$StdCopyStrBuf$b$b($.mkParAdapt$rStdCopyStrBuf$mi32(this.Name, 1 /*RCT_All*/), S("Name"), new $.StdCopyStrBuf()));
    pComp.Value$StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$StdCopyStrBuf($.mkNamingAdapt$mStdParameterAdapt$StdCopyStrBuf$i32$pi8$StdCopyStrBuf$b$b($.mkParAdapt$rStdCopyStrBuf$mi32(this.Description, 1 /*RCT_All*/), S("Description"), new $.StdCopyStrBuf()));
    pComp.Value$StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$StdCopyStrBuf($.mkNamingAdapt$mStdParameterAdapt$StdCopyStrBuf$i32$pi8$StdCopyStrBuf$b$b($.mkParAdapt$rStdCopyStrBuf$mi32(this.ID, 2 /*RCT_Idtf*/), S("ID"), new $.StdCopyStrBuf()));
    const ParTypeEntries = $own([((($o) => ($o.Name = S("Enumeration"), $o.Val = 0 /*SPDT_Enum*/, $o))(new $.StdEnumEntry$i32$10())), ((($o) => ($o.Name = null, $o.Val = 0 /*SPDT_Enum*/, $o))(new $.StdEnumEntry$i32$10()))]);
    pComp.Value$StdNamingDefaultAdapt$StdEnumAdapt$i32$u8$i32$6($.mkNamingAdapt$mStdEnumAdapt$i32$u8$pi8$i32$b$b$6($.mkEnumAdaptT$7(P(this, "Type"), $oat(ParTypeEntries, 0)), S("Type"), 0 /*SPDT_Enum*/));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Default"), S("Default"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "LeagueValue"), S("LeagueValue"), 0));
    pComp.Value$StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$StdCopyStrBuf($.mkNamingAdapt$mStdParameterAdapt$StdCopyStrBuf$i32$pi8$StdCopyStrBuf$b$b($.mkParAdapt$rStdCopyStrBuf$mi32(this.Achievement, 2 /*RCT_Idtf*/), S("Achievement"), new $.StdCopyStrBuf()));
    pComp.Value$StdNamingAdapt$StdSTLContainerAdapt$vector$Option($.mkNamingAdapt$mStdSTLContainerAdapt$vector$Option$pi8($.mkSTLContainerAdapt$rvector$i32$8(this.Options, 0 /*SEP_NONE*/), S("Options")));
    pComp.NameEnd();
  }

  $clone() { return new C4ScenarioParameterDef().$assign(this); }
  $assign(o) {
    this.Name.$assign(o.Name);
    this.Description.$assign(o.Description);
    this.ID.$assign(o.ID);
    this.Type = o.Type;
    this.Options = o.Options.slice();
    this.Default = o.Default;
    this.LeagueValue = o.LeagueValue;
    this.Achievement.$assign(o.Achievement);
    return this;
  }
}

export class C4ScenarioParameterDef$Option {
  Value = 0;
  Name = new $.StdCopyStrBuf();
  Description = new $.StdCopyStrBuf();

  CompileFunc(pComp) {
    if (!pComp.Name(S("Option"))) {
      pComp.NameEnd();
      pComp.excNotFound(S("Option"));
    }
    pComp.Value$StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$StdCopyStrBuf($.mkNamingAdapt$mStdParameterAdapt$StdCopyStrBuf$i32$pi8$StdCopyStrBuf$b$b($.mkParAdapt$rStdCopyStrBuf$mi32(this.Name, 1 /*RCT_All*/), S("Name"), new $.StdCopyStrBuf()));
    pComp.Value$StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$StdCopyStrBuf($.mkNamingAdapt$mStdParameterAdapt$StdCopyStrBuf$i32$pi8$StdCopyStrBuf$b$b($.mkParAdapt$rStdCopyStrBuf$mi32(this.Description, 1 /*RCT_All*/), S("Description"), new $.StdCopyStrBuf()));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Value"), S("Value"), 0));
    pComp.NameEnd();
  }

  None() {
    this.Name = new $.StdCopyStrBuf();
    this.Description = new $.StdCopyStrBuf();
    return this;
  }

  $clone() { return new C4ScenarioParameterDef$Option().$assign(this); }
  $assign(o) {
    this.Value = o.Value;
    this.Name.$assign(o.Name);
    this.Description.$assign(o.Description);
    return this;
  }
}

export class C4ScenarioParameterDefs {
  Parameters = [];

  init() {
    this.Parameters = [];
    return this;
  }

  Clear() {
    this.Parameters.length = 0;
  }

  GetParameterDefByIndex(idx) {
    if (idx >= this.Parameters.length) {
      return null;
    }
    return this.Parameters[idx];
  }

  Load(hGroup, pLang) {
    let Buf = new $.StdStrBuf();
    if (!hGroup.LoadEntryString$pi8$pStdStrBuf(S("ParameterDefs.txt"), Buf)) {
      return false;
    }
    if (pLang != null) {
      pLang.ReplaceStrings$rStdStrBuf(Buf);
    }
    if (!$.CompileFromBuf_LogWarn$rC4ScenarioParameterDefs$x$pi8(this, Buf, S("ParameterDefs.txt"))) {
      return false;
    }
    return true;
  }

  CompileFunc(pComp) {
    pComp.Value$StdSTLContainerAdapt$vector$C4ScenarioParameterDef($.mkSTLContainerAdapt$rvector$i32$4(this.Parameters, 0 /*SEP_NONE*/));
  }

  RegisterScriptConstants(values) {
    for (const Parameter of this.Parameters) {
      let constant_name = new $.StdStrBuf();
      constant_name.Format(S("SCENPAR_%s"), Parameter.GetID());
      let constant_value = values.GetValueByID(Parameter.GetID(), Parameter.GetDefault());
      $.ScriptEngine.RegisterGlobalConstant(constant_name.getData(), $.C4VInt(constant_value));
    }
    let scenpar = $.C4PropList.NewStatic(null, null, $oat($.Strings.P, 231 /*P_SCENPAR*/));
    for (const Parameter of this.Parameters) {
      let constant_value = values.GetValueByID(Parameter.GetID(), Parameter.GetDefault());
      scenpar.SetPropertyByS($.Strings.RegString$StdStrBuf(new $.StdStrBuf().init$pi8$b(Parameter.GetID())), $.C4VInt(constant_value));
    }
    scenpar.Freeze();
    $.ScriptEngine.RegisterGlobalConstant(S("SCENPAR"), new $.C4Value().init$pC4PropListStatic(scenpar));
  }

  $clone() { return new C4ScenarioParameterDefs().$assign(this); }
  $assign(o) {
    this.Parameters = o.Parameters.slice();
    return this;
  }
}

export class C4ScenarioParameters {
  Parameters = new StdMap((a, b) => a.op_lt(b));

  init() {
    this.Parameters = new StdMap((a, b) => a.op_lt(b));
    return this;
  }

  Clear() {
    this.Parameters.clear();
  }

  Merge(other) {
    for (const Parameter of other.Parameters) {
      let j = this.Parameters.find(Parameter.first);
      if (!j.eq(this.Parameters.end())) {
        if (j.v.second >= Parameter.second) {
          continue;
        }
      }
      this.Parameters.entry(Parameter.first, () => 0).second = Parameter.second;
    }
  }

  GetValueByID(id, default_value) {
    let i = this.Parameters.find(new $.StdCopyStrBuf().init$mStdStrBuf(new $.StdStrBuf().init$pi8$b(id)));
    if (!i.eq(this.Parameters.end())) {
      return i.v.second;
    } else {
      return default_value;
    }
  }

  SetValue(id, value, only_if_larger) {
    if (only_if_larger) {
      let i = this.Parameters.find(new $.StdCopyStrBuf().init$mStdStrBuf(new $.StdStrBuf().init$pi8$b(id)));
      if (!i.eq(this.Parameters.end())) {
        if (i.v.second >= value) {
          return;
        }
      }
    }
    this.Parameters.entry(new $.StdCopyStrBuf().init$pi8$b(id), () => 0).second = value;
  }

  CompileFunc(pComp) {
    if (pComp.isDeserializer()) {
      this.Parameters.clear();
      if (pComp.hasNaming()) {
        let name_count = $u64n(pComp.NameCount());
        for (let i = 0; i < name_count; i = i + 1) {
          const v = [0];
          let name = pComp.GetNameByIndex(0);
          let sName = new $.StdCopyStrBuf().init$pi8$b(name);
          if (name == null) {
            continue;
          }
          pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(v, 0), sName.getData(), 0));
          this.Parameters.entry(sName, () => 0).second = v[0];
        }
      } else {
        const name_count = [0];
        pComp.Value$ri32(P(name_count, 0));
        for (let i = 0; i < name_count[0]; i = i + 1 | 0) {
          let name = new $.StdCopyStrBuf();
          const v = [0];
          pComp.Value$rStdCopyStrBuf(name);
          pComp.Value$ri32(P(v, 0));
          this.Parameters.entry(name, () => 0).second = v[0];
        }
      }
    } else {
      if (pComp.hasNaming()) {
        for (const Parameter of this.Parameters) {
          pComp.Value$StdNamingAdapt$i32($.mkNamingAdapt$ri32$pi8(P(Parameter, "second"), Parameter.first.getData()));
        }
      } else {
        const name_count = [this.Parameters.size() | 0];
        pComp.Value$ri32(P(name_count, 0));
        for (const Parameter of this.Parameters) {
          pComp.Value$rStdCopyStrBuf(Parameter.first);
          pComp.Value$ri32(P(Parameter, "second"));
        }
      }
    }
  }

  static AddFilename2ID(filename, id) {
    let $t1;
    let sResult = new $.StdStrBuf();
    let sSource = new $.StdStrBuf().init$pi8$b(filename, true);
    let sPart = new $.StdStrBuf();
    sSource.ReplaceChar(92, 47);
    let idx = 0;
    while (sSource.GetSection(($t1 = idx, idx = idx + 1, $t1), sPart, 47)) {
      let len = sPart.getLength();
      if (len > 4 && $.SEqual2NoCase(sPart.getPtr(len - 4), S(".oc"), 3)) {
        sResult.Append$pi8$u64(sPart.getData(), len - 4);
        sResult.AppendChar(95);
      }
    }
    sResult.Append$pi8(id);
    return sResult;
  }

  $clone() { return new C4ScenarioParameters().$assign(this); }
  $assign(o) {
    this.Parameters = o.Parameters.$clone();
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4ScenarioParameterDef, C4ScenarioParameterDef$Option, C4ScenarioParameterDefs, C4ScenarioParameters });
