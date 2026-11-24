// @ts-nocheck
// OpenClonk 36de799: src/game/C4GameScript.cpp, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $and64n, $or64n, $u64n } from '../../rt/int.ts';
import { c$strchr, c$strlen } from '../../rt/libc.ts';
import { $oadd, $oat, $oidx, $own, $rd, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $fn, $throw, StdString } from '../../rt/std.ts';
import { StdCompiler } from '../lib/StdCompiler.ts';

export class PathInfo {
  ilx = 0;
  ily = 0;
  ilen = 0;

  $clone() { return new PathInfo().$assign(this); }
  $assign(o) {
    this.ilx = o.ilx;
    this.ily = o.ily;
    this.ilen = o.ilen;
    return this;
  }
}

export class SumPathLength {
  pPathInfo = null;

  init(info) {
    this.pPathInfo = info;
    return this;
  }

  op_call(iX, iY, _TransferTarget) {
    this.pPathInfo.ilen = this.pPathInfo.ilen + $.Distance(this.pPathInfo.ilx | 0, this.pPathInfo.ily | 0, iX, iY);
    this.pPathInfo.ilx = iX;
    this.pPathInfo.ily = iY;
    return true;
  }

  $clone() { return new SumPathLength().$assign(this); }
  $assign(o) {
    this.pPathInfo = o.pPathInfo;
    return this;
  }
}

export class C4ValueCompiler extends StdCompiler {
  pszNames = null;
  iNameCnt = 0;
  iEntryNr = 0;
  iDepth = 0;
  iMatchStart = 0;
  iMatchCount = 0;

  init(pszNames, iNameCnt, iEntryNr) {
    this.pszNames = pszNames;
    this.iNameCnt = iNameCnt;
    this.iEntryNr = iEntryNr;
    return this;
  }

  isDeserializer() {
    return false;
  }

  hasNaming() {
    return true;
  }

  isVerbose() {
    return false;
  }

  Name(szName) {
    if (this.iMatchStart === 0 || this.haveCurrentMatch()) {
      if (!this.haveCompleteMatch()) {
        if ($.SEqual(this.pszNames.a[this.pszNames.o + this.iMatchCount], szName)) {
          if (this.iMatchCount === 0) {
            this.iMatchStart = this.iDepth + 1 | 0;
          }
          this.iMatchCount = this.iMatchCount + 1 | 0;
        }
      }
    }
    this.iDepth = this.iDepth + 1 | 0;
    return true;
  }

  Default(_szName) {
    return false;
  }

  NameEnd(_fBreak = false) {
    if (this.haveCurrentMatch()) {
      this.iMatchCount = this.iMatchCount - 1 | 0;
      if (this.iMatchCount === 0) {
        this.iMatchStart = 0;
      }
    }
    this.iDepth = this.iDepth - 1 | 0;
  }

  Begin() {
    this.iDepth = this.iMatchStart = this.iMatchCount = 0;
  }

  MaybeProcessInt$ri32(t) {
    let $t1;
    if (this.haveCompleteMatch() && !(($t1 = this.iEntryNr, this.iEntryNr = this.iEntryNr - 1 | 0, $t1) !== 0)) {
      const i = [t.a[t.o]];
      this.ProcessInt(P(i, 0));
      t.a[t.o] = i[0];
    }
  }

  MaybeProcessInt$ru32(t) {
    let $t1;
    if (this.haveCompleteMatch() && !(($t1 = this.iEntryNr, this.iEntryNr = this.iEntryNr - 1 | 0, $t1) !== 0)) {
      const i = [t.a[t.o] | 0];
      this.ProcessInt(P(i, 0));
      t.a[t.o] = i[0] >>> 0;
    }
  }

  MaybeProcessInt$ri16(t) {
    let $t1;
    if (this.haveCompleteMatch() && !(($t1 = this.iEntryNr, this.iEntryNr = this.iEntryNr - 1 | 0, $t1) !== 0)) {
      const i = [t.a[t.o]];
      this.ProcessInt(P(i, 0));
      t.a[t.o] = i[0] << 16 >> 16;
    }
  }

  MaybeProcessInt$ru16(t) {
    let $t1;
    if (this.haveCompleteMatch() && !(($t1 = this.iEntryNr, this.iEntryNr = this.iEntryNr - 1 | 0, $t1) !== 0)) {
      const i = [t.a[t.o]];
      this.ProcessInt(P(i, 0));
      t.a[t.o] = i[0] & 0xffff;
    }
  }

  MaybeProcessInt$ri8(t) {
    let $t1;
    if (this.haveCompleteMatch() && !(($t1 = this.iEntryNr, this.iEntryNr = this.iEntryNr - 1 | 0, $t1) !== 0)) {
      const i = [t.a[t.o]];
      this.ProcessInt(P(i, 0));
      t.a[t.o] = i[0] << 24 >> 24;
    }
  }

  MaybeProcessInt$ru8(t) {
    let $t1;
    if (this.haveCompleteMatch() && !(($t1 = this.iEntryNr, this.iEntryNr = this.iEntryNr - 1 | 0, $t1) !== 0)) {
      const i = [t.a[t.o]];
      this.ProcessInt(P(i, 0));
      t.a[t.o] = i[0] & 0xff;
    }
  }

  DWord$ri32(rInt) {
    this.MaybeProcessInt$ri32(rInt);
  }

  DWord$ru32(rInt) {
    this.MaybeProcessInt$ru32(rInt);
  }

  Word$ri16(rShort) {
    this.MaybeProcessInt$ri16(rShort);
  }

  Word$ru16(rShort) {
    this.MaybeProcessInt$ru16(rShort);
  }

  Byte$ri8(rByte) {
    this.MaybeProcessInt$ri8(rByte);
  }

  Byte$ru8(rByte) {
    this.MaybeProcessInt$ru8(rByte);
  }

  Boolean(rBool) {
    let $t1;
    if (this.haveCompleteMatch()) {
      if (!(($t1 = this.iEntryNr, this.iEntryNr = this.iEntryNr - 1 | 0, $t1) !== 0)) {
        this.ProcessBool(rBool);
      }
    }
  }

  Character(rChar) {
    let $t1;
    if (this.haveCompleteMatch()) {
      if (!(($t1 = this.iEntryNr, this.iEntryNr = this.iEntryNr - 1 | 0, $t1) !== 0)) {
        this.ProcessChar(rChar);
      }
    }
  }

  String$pi8$u64$i32(szString, iMaxLength, eType) {
    let $t1;
    if (this.haveCompleteMatch()) {
      if (!(($t1 = this.iEntryNr, this.iEntryNr = this.iEntryNr - 1 | 0, $t1) !== 0)) {
        this.ProcessString$pi8$u64$b(szString, iMaxLength, eType === 4);
      }
    }
  }

  String$ppi8$i32(pszString, eType) {
    let $t1;
    if (this.haveCompleteMatch()) {
      if (!(($t1 = this.iEntryNr, this.iEntryNr = this.iEntryNr - 1 | 0, $t1) !== 0)) {
        this.ProcessString$ppi8$b(pszString, eType === 4);
      }
    }
  }

  String$rstring$i32(str, type) {
    let $t1;
    if (this.haveCompleteMatch()) {
      if (!(($t1 = this.iEntryNr, this.iEntryNr = this.iEntryNr - 1 | 0, $t1) !== 0)) {
        this.ProcessString$rstring$b(str, type === 4);
      }
    }
  }

  Raw(_pData, _iSize, _eType = 0 /*RCT_Escaped*/) {
  }

  haveCurrentMatch() {
    return (this.iDepth + 1 | 0) === (this.iMatchStart + this.iMatchCount | 0);
  }

  haveCompleteMatch() {
    return this.haveCurrentMatch() && this.iMatchCount === this.iNameCnt;
  }

  $clone() { return new C4ValueCompiler().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pszNames = o.pszNames;
    this.iNameCnt = o.iNameCnt;
    this.iEntryNr = o.iEntryNr;
    this.iDepth = o.iDepth;
    this.iMatchStart = o.iMatchStart;
    this.iMatchCount = o.iMatchCount;
    return this;
  }
}

export class C4ValueGetCompiler extends C4ValueCompiler {
  Res = new $.C4Value().init$v();

  init(pszNames, iNameCnt, iEntryNr) {
    super.init(pszNames, iNameCnt, iEntryNr);
    this.Res = new $.C4Value().init$v();
    return this;
  }

  getResult() {
    return this.Res;
  }

  ProcessInt(rInt) {
    this.Res.$assign($.C4VInt(rInt.a[rInt.o]));
  }

  ProcessBool(rBool) {
    this.Res.$assign($.C4VBool(rBool.a[rBool.o]));
  }

  ProcessChar(rChar) {
    this.Res.$assign($.C4VString$StdStrBuf($.FormatString(S("%c"), rChar.a[rChar.o])));
  }

  ProcessString$pi8$u64$b(szString, _iMaxLength, fIsID) {
    this.Res.$assign(fIsID ? $.C4VPropList($.C4Id2Def(new $.C4ID().init$string(StdString.of(szString)))) : $.C4VString$pi8(szString));
  }

  ProcessString$ppi8$b(pszString, fIsID) {
    this.Res.$assign(fIsID ? $.C4VPropList($.C4Id2Def(new $.C4ID().init$string(StdString.of(pszString.a[pszString.o])))) : $.C4VString$pi8(pszString.a[pszString.o]));
  }

  ProcessString$rstring$b(str, fIsID) {
    this.Res.$assign(fIsID ? $.C4VPropList($.C4Id2Def(new $.C4ID().init$string(StdString.of(str.c_str())))) : $.C4VString$pi8(str.c_str()));
  }

  $clone() { return new C4ValueGetCompiler().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Res.$assign(o.Res);
    return this;
  }
}

export function MakeAbsCoordinates$pC4PropList$ri32$ri32(_this, x, y) {
  let obj = $.Object_(_this);
  if (obj != null) {
    x.a[x.o] = x.a[x.o] + obj.GetX() | 0;
    y.a[y.o] = y.a[y.o] + obj.GetY() | 0;
  }
}

export function MakeAbsCoordinates$pC4PropList$ri64$ri64(_this, x, y) {
  let obj = $.Object_(_this);
  if (obj != null) {
    x.a[x.o] = x.a[x.o] + obj.GetX();
    y.a[y.o] = y.a[y.o] + obj.GetY();
  }
}

export function FnGetEffectsFor(target) {
  if (target != null) {
    if (target === $.ScriptEngine.GetPropList()) {
      return P($.ScriptEngine, "pGlobalEffects");
    }
    if (target === $.GameScript.ScenPropList.getPropList()) {
      return P($.GameScript, "pScenarioEffects");
    }
    let obj = target.GetObject$v();
    if (obj == null) {
      $throw(new $.C4AulExecError().init(S("Effect target has to be an object")));
    }
    return P(obj, "pEffects");
  }
  return P($.ScriptEngine, "pGlobalEffects");
}

function FnIncinerateLandscape(_this, x$, y$, caused_by_plr) {
  const x = [x$];
  const y = [y$];
  MakeAbsCoordinates$pC4PropList$ri64$ri64(_this, P(x, 0), P(y, 0));
  return !!$.Landscape.Incinerate(x[0] | 0, y[0] | 0, caused_by_plr | 0);
}

function FnSetGravity(__this, gravity) {
  $.Landscape.SetGravity($.C4REAL100($.Clamp$i64$i64$i64(gravity, -1000, 1000) | 0));
}

function FnGetGravity(__this) {
  return $.fixtoi$C4Fixed($.Landscape.GetGravity().op_mul$i32(100));
}

function FnGetPlayerName(__this, player_nr) {
  if (!($.ValidPlr(player_nr | 0) !== 0)) {
    return null;
  }
  return $.String_($.Players.Get(player_nr | 0).GetName());
}

function FnGetPlayerType(__this, player_nr) {
  let player = $.Players.Get(player_nr | 0);
  if (player == null) {
    return 0;
  }
  return player.GetType();
}

function FnGetPlayerColor(__this, player_nr) {
  let player = $.Players.Get(player_nr | 0);
  return player != null ? player.ColorDw : 0;
}

function FnGetPlrClonkSkin(__this, player_nr) {
  let player = $.Players.Get(player_nr | 0);
  if (player != null) {
    return new $.Nillable$i64().init$i64(player.PrefClonkSkin);
  }
  return new $.Nillable$i64().init$C4Void(new $.C4Void());
}

function FnGetX(_this, precision) {
  if (!($.Object_(_this) != null)) {
    return new $.Nillable$i64().init$C4Void(new $.C4Void());
  }
  if (precision === 0) {
    precision = 1;
  }
  return new $.Nillable$i64().init$i64($.fixtoi$C4Fixed$i32($.Object_(_this).fix_x, precision | 0));
}

function FnGetY(_this, precision) {
  if (!($.Object_(_this) != null)) {
    return new $.Nillable$i64().init$C4Void(new $.C4Void());
  }
  if (precision === 0) {
    precision = 1;
  }
  return new $.Nillable$i64().init$i64($.fixtoi$C4Fixed$i32($.Object_(_this).fix_y, precision | 0));
}

export function GetValidOwner(_this, owner) {
  if (owner.IsNil()) {
    if ($.Object_(_this) != null) {
      return $.Object_(_this).Controller;
    } else {
      return -1;
    }
  }
  return owner.op_long();
}

export function AssignController(_this, obj) {
  if (obj != null && $.Object_(_this) != null && $.Object_(_this).Controller > -1) {
    obj.Controller = $.Object_(_this).Controller;
  }
}

function FnCreateObjectAbove(_this, PropList, x$, y$, owner) {
  const x = [x$];
  const y = [y$];
  MakeAbsCoordinates$pC4PropList$ri64$ri64(_this, P(x, 0), P(y, 0));
  let set_owner = GetValidOwner(_this, new $.Nillable$i64().$copy(owner));
  let obj = $.Game.CreateObject$pC4PropList$pC4Object$i32$i32$i32$i32$b$C4Fixed$C4Fixed$C4Fixed$i32(PropList, $.Object_(_this), set_owner | 0, x[0] | 0, y[0] | 0);
  AssignController(_this, obj);
  return obj;
}

function FnCreateObject(_this, PropList, x$, y$, owner) {
  const x = [x$];
  const y = [y$];
  MakeAbsCoordinates$pC4PropList$ri64$ri64(_this, P(x, 0), P(y, 0));
  let set_owner = GetValidOwner(_this, new $.Nillable$i64().$copy(owner));
  let obj = $.Game.CreateObject$pC4PropList$pC4Object$i32$i32$i32$i32$b$C4Fixed$C4Fixed$C4Fixed$i32(PropList, $.Object_(_this), set_owner | 0, x[0] | 0, y[0] | 0, 0, true);
  AssignController(_this, obj);
  return obj;
}

function FnCreateConstruction(_this, PropList, x$, y$, owner, completion, adjust_terrain, check_site) {
  const x = [x$];
  const y = [y$];
  if (PropList == null || !(PropList.GetDef$v() != null)) {
    return null;
  }
  MakeAbsCoordinates$pC4PropList$ri64$ri64(_this, P(x, 0), P(y, 0));
  if (check_site && !$.ConstructionCheck(PropList, x[0] | 0, y[0] | 0, $.Object_(_this))) {
    return null;
  }
  let set_owner = GetValidOwner(_this, new $.Nillable$i64().$copy(owner));
  let obj = $.Game.CreateObjectConstruction(PropList, $.Object_(_this), set_owner | 0, x[0] | 0, y[0] | 0, Math.trunc(completion * 100000 / 100) | 0, adjust_terrain);
  AssignController(_this, obj);
  return obj;
}

function FnFindConstructionSite(__this, PropList, abs_x$, abs_y$) {
  const abs_x = [abs_x$];
  const abs_y = [abs_y$];
  let def = null;
  if (!((def = PropList.GetDef$v()) != null)) {
    return null;
  }
  if ($.ConstructionCheck(PropList, abs_x[0], abs_y[0])) {
    return null;
  }
  let result = !!$.FindConSiteSpot(P(abs_x, 0), P(abs_y, 0), def.Shape.Wdt, def.Shape.Hgt, 20);
  if (!result) {
    return null;
  }
  let array = new $.C4ValueArray().init$i32(2);
  array.SetItem(0, $.C4VInt(abs_x[0]));
  array.SetItem(1, $.C4VInt(abs_y[0]));
  return array;
}

function FnCheckConstructionSite(_this, PropList, x$, y$) {
  const x = [x$];
  const y = [y$];
  if (PropList == null || !(PropList.GetDef$v() != null)) {
    return false;
  }
  MakeAbsCoordinates$pC4PropList$ri32$ri32(_this, P(x, 0), P(y, 0));
  return $.ConstructionCheck(PropList, x[0], y[0]);
}

export function CreateCriterionsFromPars(parameters, pFOs, pSOs, context) {
  let $t1, $t2, $t3, $t4;
  let count = 0;
  let sort_count = 0;
  const has_layer_check = [false];
  for (let i = 0; i < 10; i = i + 1 | 0) {
    let Data = new $.C4Value().$copy(($t1 = parameters, parameters = $oadd(parameters, 1), $t1));
    if (Data.op_not()) {
      break;
    }
    const pSO = [null];
    let pFO = $.C4FindObject.CreateByValue(Data, pSOs != null ? P(pSO, 0) : null, context, P(has_layer_check, 0));
    if (pFO != null) {
      pFOs.a[pFOs.o + ($t2 = count, count = count + 1 | 0, $t2)] = pFO;
    }
    if (pSO[0] != null) {
      pSOs.a[pSOs.o + ($t3 = sort_count, sort_count = sort_count + 1 | 0, $t3)] = pSO[0];
    }
  }
  if (count === 0) {
    for (let i$2 = 0; i$2 < sort_count; i$2 = i$2 + 1 | 0) {
      $delete(pSOs.a[pSOs.o + i$2]);
    }
    return null;
  }
  if (context != null && !has_layer_check[0]) {
    pFOs.a[pFOs.o + ($t4 = count, count = count + 1 | 0, $t4)] = new $.C4FindObjectLayer().init(context.Layer.op_C4Object_());
  }
  let pSO = null;
  if (sort_count !== 0) {
    if (sort_count === 1) {
      pSO = pSOs.a[pSOs.o + 0];
    } else {
      pSO = new $.C4SortObjectMultiple().init(sort_count, pSOs, false);
    }
  }
  let pFO = null;
  if (count === 1) {
    pFO = pFOs.a[pFOs.o + 0];
  } else {
    pFO = new $.C4FindObjectAnd().init(count, pFOs, false);
  }
  if (pSO != null) {
    pFO.SetSort(pSO);
  }
  return pFO;
}

function FnObjectCount(_this, parameters) {
  const pFOs = new Array(11).fill(null);
  let pFO = CreateCriterionsFromPars(parameters, P(pFOs, 0), null, $.Object_(_this));
  if (pFO == null) {
    $throw(new $.C4AulExecError().init(S("ObjectCount: No valid search criterions supplied")));
  }
  let count = pFO.Count$C4ObjectList$C4LSectors($.Objects, $.Objects.Sectors);
  $delete(pFO);
  return $.C4VInt(count);
}

function FnFindObject(_this, parameters) {
  const pFOs = new Array(10).fill(null);
  const pSOs = new Array(10).fill(null);
  let pFO = CreateCriterionsFromPars(parameters, P(pFOs, 0), P(pSOs, 0), $.Object_(_this));
  if (pFO == null) {
    $throw(new $.C4AulExecError().init(S("FindObject: No valid search criterions supplied")));
  }
  let obj = pFO.Find$C4ObjectList$C4LSectors($.Objects, $.Objects.Sectors);
  $delete(pFO);
  return $.C4VObj(obj);
}

function FnFindObjects(_this, parameters) {
  const pFOs = new Array(10).fill(null);
  const pSOs = new Array(10).fill(null);
  let pFO = CreateCriterionsFromPars(parameters, P(pFOs, 0), P(pSOs, 0), $.Object_(_this));
  if (pFO == null) {
    $throw(new $.C4AulExecError().init(S("FindObjects: No valid search criterions supplied")));
  }
  let results = pFO.FindMany$C4ObjectList$C4LSectors($.Objects, $.Objects.Sectors);
  $delete(pFO);
  return $.C4VArray(results);
}

function FnInsertMaterial(_this, mat, x$, y$, vx, vy, insert_position) {
  const x = [x$];
  const y = [y$];
  MakeAbsCoordinates$pC4PropList$ri64$ri64(_this, P(x, 0), P(y, 0));
  const insert_x = [x[0] | 0];
  const insert_y = [y[0] | 0];
  if (!$.Landscape.InsertMaterial(mat | 0, P(insert_x, 0), P(insert_y, 0), vx | 0, vy | 0)) {
    return false;
  }
  if (insert_position != null && !insert_position.IsFrozen()) {
    insert_position.SetProperty(31 /*P_X*/, $.C4VInt(insert_x[0]));
    insert_position.SetProperty(32 /*P_Y*/, $.C4VInt(insert_y[0]));
  }
  return true;
}

function FnCanInsertMaterial(_this, mat, x$, y$, insert_position) {
  const x = [x$];
  const y = [y$];
  MakeAbsCoordinates$pC4PropList$ri64$ri64(_this, P(x, 0), P(y, 0));
  const insert_x = [x[0] | 0];
  const insert_y = [y[0] | 0];
  if (!$.Landscape.InsertMaterial(mat | 0, P(insert_x, 0), P(insert_y, 0), 0, 0, true)) {
    return false;
  }
  if (insert_position != null && !insert_position.IsFrozen()) {
    insert_position.SetProperty(31 /*P_X*/, $.C4VInt(insert_x[0]));
    insert_position.SetProperty(32 /*P_Y*/, $.C4VInt(insert_y[0]));
  }
  return true;
}

function FnExecutePXS(__this, frames, callback) {
  for (const i = [0]; i[0] < frames; i[0] = i[0] + 1) {
    $.PXS.Execute();
    if (callback != null) {
      callback.Call$i32$pC4AulParSet$b(10 /*P_Timer*/, new $.C4AulParSet().init$ri64(P(i, 0)).op_and());
    }
  }
  return true;
}

function FnGetMaterialCount(__this, material_nr, real) {
  if (!$.MatValid(material_nr | 0)) {
    return -1;
  }
  if (real || !($oidx($.MaterialMap.Map, material_nr).MinHeightCount !== 0)) {
    return $.Landscape.GetMatCount(material_nr | 0);
  } else {
    return $.Landscape.GetEffectiveMatCount(material_nr | 0);
  }
}

function FnGetMaterial(_this, x$, y$) {
  const x = [x$];
  const y = [y$];
  MakeAbsCoordinates$pC4PropList$ri64$ri64(_this, P(x, 0), P(y, 0));
  return $.GBackMat(x[0] | 0, y[0] | 0);
}

function FnGetBackMaterial(_this, x$, y$) {
  const x = [x$];
  const y = [y$];
  MakeAbsCoordinates$pC4PropList$ri64$ri64(_this, P(x, 0), P(y, 0));
  return $.Landscape.GetBackMat(x[0] | 0, y[0] | 0);
}

export function GetTextureName(texture_nr) {
  if (texture_nr === 0) {
    return null;
  }
  let texture = $.TextureMap.GetEntry(texture_nr);
  if (texture == null) {
    return null;
  }
  return $.String_(texture.GetTextureName());
}

function FnGetTexture(_this, x$, y$) {
  const x = [x$];
  const y = [y$];
  MakeAbsCoordinates$pC4PropList$ri64$ri64(_this, P(x, 0), P(y, 0));
  return GetTextureName($.PixCol2Tex($.Landscape.GetPix(x[0] | 0, y[0] | 0)));
}

function FnGetBackTexture(_this, x$, y$) {
  const x = [x$];
  const y = [y$];
  MakeAbsCoordinates$pC4PropList$ri64$ri64(_this, P(x, 0), P(y, 0));
  return GetTextureName($.PixCol2Tex($.Landscape.GetBackPix(x[0] | 0, y[0] | 0)));
}

function FnGetAverageTextureColor(__this, texture) {
  if (texture == null) {
    return new $.Nillable$i64().init$C4Void(new $.C4Void());
  }
  let texture_name = new $.StdStrBuf();
  texture_name.Ref$pi8(texture.GetCStr());
  let pch = c$strchr(texture_name.getData(), 45);
  if (pch != null) {
    let len = $u64n(pch.o - texture_name.getData().o);
    texture_name.Copy$v();
    texture_name.SetLength(len);
  }
  let Tex = $.TextureMap.GetTexture$pi8(texture_name.getData());
  if (Tex == null) {
    return new $.Nillable$i64().init$C4Void(new $.C4Void());
  }
  return new $.Nillable$i64().init$i64(Tex.GetAverageColor());
}

function FnGBackSolid(_this, x$, y$) {
  const x = [x$];
  const y = [y$];
  MakeAbsCoordinates$pC4PropList$ri64$ri64(_this, P(x, 0), P(y, 0));
  return $.GBackSolid(x[0] | 0, y[0] | 0);
}

function FnGBackSemiSolid(_this, x$, y$) {
  const x = [x$];
  const y = [y$];
  MakeAbsCoordinates$pC4PropList$ri64$ri64(_this, P(x, 0), P(y, 0));
  return $.GBackSemiSolid(x[0] | 0, y[0] | 0);
}

function FnGBackLiquid(_this, x$, y$) {
  const x = [x$];
  const y = [y$];
  MakeAbsCoordinates$pC4PropList$ri64$ri64(_this, P(x, 0), P(y, 0));
  return $.GBackLiquid(x[0] | 0, y[0] | 0);
}

function FnGBackSky(_this, x$, y$) {
  const x = [x$];
  const y = [y$];
  MakeAbsCoordinates$pC4PropList$ri64$ri64(_this, P(x, 0), P(y, 0));
  return $.Landscape.GetBackPix(x[0] | 0, y[0] | 0) === 0;
}

function FnExtractMaterialAmount(_this, x$, y$, mat, amount, distant_first) {
  const x = [x$];
  const y = [y$];
  MakeAbsCoordinates$pC4PropList$ri64$ri64(_this, P(x, 0), P(y, 0));
  let extracted = 0;
  for (; extracted < amount; extracted = extracted + 1) {
    if ($.GBackMat(x[0] | 0, y[0] | 0) !== mat) {
      return extracted;
    }
    if ($.Landscape.ExtractMaterial(x[0] | 0, y[0] | 0, distant_first) !== mat) {
      return extracted;
    }
  }
  return extracted;
}

function FnBlastFree(_this, iX, iY, iLevel, caused_by_player_nr, max_density) {
  if (caused_by_player_nr.IsNil() && $.Object_(_this) != null) {
    caused_by_player_nr.op_assign$i64($.Object_(_this).Controller);
  }
  if (max_density.IsNil()) {
    max_density.op_assign$i64(100);
  }
  $.Landscape.BlastFree(iX | 0, iY | 0, iLevel | 0, caused_by_player_nr.op_long() | 0, $.Object_(_this), max_density.op_long() | 0);
}

function FnSoundAt(_this, szSound, x$, y$, level, at_player_nr, custom_falloff_distance, pitch, modifier_props) {
  const x = [x$];
  const y = [y$];
  if (!at_player_nr.IsNil()) {
    let player = $.Players.Get(at_player_nr.op_long() | 0);
    if (player == null) {
      return false;
    }
    if (!player.LocalControl) {
      return true;
    }
  }
  if (level.op_long() < 0) {
    return true;
  }
  if (level.IsNil() || level.op_long() > 100) {
    level.op_assign$i64(100);
  }
  let modifier = null;
  if (modifier_props != null) {
    modifier = $.Application.SoundSystem.Modifiers.Get(modifier_props, true);
  } else {
    modifier = null;
  }
  MakeAbsCoordinates$pC4PropList$ri64$ri64(_this, P(x, 0), P(y, 0));
  $.StartSoundEffectAt($.FnStringPar(szSound), x[0] | 0, y[0] | 0, level.op_long() | 0, custom_falloff_distance | 0, pitch | 0, modifier);
  return true;
}

function FnSound(_this, sound, global, level, at_player_nr, loop_count, custom_falloff_distance, pitch, modifier_props) {
  if (!at_player_nr.IsNil()) {
    let player = $.Players.Get(at_player_nr.op_long() | 0);
    if (player == null) {
      return false;
    }
    if (!player.LocalControl) {
      return true;
    }
  }
  if (level.op_long() < 0) {
    return true;
  }
  if (level.IsNil() || level.op_long() > 100) {
    level.op_assign$i64(100);
  }
  let modifier = null;
  if (modifier_props != null) {
    modifier = $.Application.SoundSystem.Modifiers.Get(modifier_props, true);
  } else {
    modifier = null;
  }
  let obj = null;
  if (!global) {
    obj = $.Object_(_this);
  }
  if (loop_count >= 0) {
    let inst = $.GetSoundInstance($.FnStringPar(sound), obj);
    if (inst != null) {
      $.SoundUpdate(inst, level.op_long() | 0, pitch | 0);
    } else {
      $.StartSoundEffect($.FnStringPar(sound), !(loop_count === 0), level.op_long() | 0, obj, custom_falloff_distance | 0, pitch | 0, modifier);
    }
  } else {
    $.StopSoundEffect($.FnStringPar(sound), obj);
  }
  return true;
}

function FnChangeSoundModifier(__this, modifier_props, release) {
  let modifier = $.Application.SoundSystem.Modifiers.Get(modifier_props, false);
  if (modifier == null) {
    return true;
  }
  if (release) {
    modifier.Release();
  } else {
    modifier.Update();
  }
  return true;
}

function FnSetGlobalSoundModifier(__this, modifier_props, at_player) {
  if (at_player.IsNil()) {
    $.Game.SetGlobalSoundModifier(modifier_props);
  } else {
    let player = $.Players.Get(at_player.op_long() | 0);
    if (player == null) {
      return false;
    }
    player.SetSoundModifier(modifier_props);
  }
  return true;
}

function FnMusic(__this, song_name, loop, fade_time_ms, max_resume_time_ms) {
  if (max_resume_time_ms < 0) {
    return false;
  }
  let success = false;
  if (song_name == null) {
    success = $.Application.MusicSystem.Stop();
  } else {
    success = $.Application.MusicSystem.Play$pi8$b$i32$f64$b($.FnStringPar(song_name), !!loop, fade_time_ms | 0, max_resume_time_ms / 1000);
  }
  if ($.Control$2.SyncMode()) {
    return true;
  }
  return success;
}

function FnMusicLevel(__this, iLevel) {
  return $.Application.MusicSystem.SetGameMusicLevel(iLevel | 0);
}

function FnSetPlayList(__this, playlist_data, at_player_nr, force_switch, fade_time_ms, max_resume_time_ms) {
  if (max_resume_time_ms < 0) {
    return 0;
  }
  if (!at_player_nr.IsNil() && at_player_nr.op_long() !== -1) {
    let at_plr = $.Players.Get(at_player_nr.op_long() | 0);
    if (at_plr == null) {
      return 0;
    }
    if (!at_plr.LocalControl) {
      return 0;
    }
  }
  let playlist = playlist_data.getStr();
  let playlist_props = null;
  if (playlist == null) {
    playlist_props = playlist_data.getPropList();
    if (playlist_props != null) {
      playlist = playlist_props.GetPropertyStr(175 /*P_PlayList*/);
      let val = new $.C4Value().init$v();
      if (playlist_props.GetProperty(176 /*P_MusicBreakMin*/, val)) {
        $.Application.MusicSystem.SetMusicBreakMin(val.getInt());
      }
      if (playlist_props.GetProperty(177 /*P_MusicBreakMax*/, val)) {
        $.Application.MusicSystem.SetMusicBreakMax(val.getInt());
      }
      if (playlist_props.GetProperty(178 /*P_MusicBreakChance*/, val)) {
        $.Application.MusicSystem.SetMusicBreakChance(val.getInt());
      }
      if (playlist_props.GetProperty(179 /*P_MusicMaxPositionMemory*/, val)) {
        $.Application.MusicSystem.SetMusicMaxPositionMemory(val.getInt());
      }
    }
  }
  let files_in_playlist = $.Application.MusicSystem.SetPlayList($.FnStringPar(playlist), force_switch, fade_time_ms | 0, max_resume_time_ms / 1000);
  if ($.Control$2.SyncMode()) {
    return 0;
  }
  return files_in_playlist;
}

function FnGameOver(__this, _iGameOverValue) {
  return !!$.Game.DoGameOver();
}

function FnGainScenarioAccess(__this, szPassword) {
  if (c$strlen(P($.Config.General.MissionAccess, 0)) + c$strlen($.FnStringPar(szPassword)) + 3 > 1024) {
    return false;
  }
  $.SAddModule(P($.Config.General.MissionAccess, 0), $.FnStringPar(szPassword));
  return true;
}

function FnPlayerMessage(_this, parameters) {
  if (!($.Object_(_this) != null)) {
    $throw(new $.NeedObjectContext().init(S("PlayerMessage")));
  }
  let player_nr = parameters.getInt();
  let message = $oidx(parameters, 1).getStr();
  if (message == null) {
    return $.C4VBool(false);
  }
  let buf = new $.StdStrBuf();
  buf.SetLength(message.GetData().getLength());
  let is_spoken = false;
  if ($.SCopySegment($.FnStringPar(message), 1, buf.getMData(), 36)) {
    if ($.StartSoundEffect(buf.getData(), false, 100, $.Object_(_this)) != null) {
      is_spoken = true;
    }
  }
  if (!is_spoken) {
    buf.Take$mStdStrBuf($.FnStringFormat(_this, message, $oadd(parameters, 2), 8));
    let dollar = c$strchr(buf.getData(), 36);
    if (dollar != null) {
      buf.Shrink($u64n(dollar.o - buf.getData().o));
    }
    $.GameMsgObjectPlayer(buf.getData(), $.Object_(_this), player_nr);
  }
  return $.C4VBool(true);
}

function FnMessage(_this, Pars) {
  if (!($.Object_(_this) != null)) {
    $throw(new $.NeedObjectContext().init(S("Message")));
  }
  let szMessage = Pars.getStr();
  if (szMessage == null) {
    return $.C4VBool(false);
  }
  let buf = new $.StdStrBuf();
  buf.SetLength(szMessage.GetData().getLength());
  let fSpoken = false;
  if ($.SCopySegment($.FnStringPar(szMessage), 1, buf.getMData(), 36)) {
    if ($.StartSoundEffect(buf.getData(), false, 100, $.Object_(_this)) != null) {
      fSpoken = true;
    }
  }
  if (!fSpoken) {
    buf.Take$mStdStrBuf($.FnStringFormat(_this, szMessage, $oadd(Pars, 1), 9));
    let dollar = c$strchr(buf.getData(), 36);
    if (dollar != null) {
      buf.Shrink($u64n(dollar.o - buf.getData().o));
    }
    $.GameMsgObject(buf.getData(), $.Object_(_this));
  }
  return $.C4VBool(true);
}

function FnAddMessage(_this, parameters) {
  if (!($.Object_(_this) != null)) {
    $throw(new $.NeedObjectContext().init(S("AddMessage")));
  }
  let message = parameters.getStr();
  if (message == null) {
    return $.C4VBool(false);
  }
  $.Messages.Append(3, $.FnStringFormat(_this, message, $oadd(parameters, 1), 9).getData(), $.Object_(_this), -1, 0, 0, 0xffffffff);
  return $.C4VBool(true);
}

function FnMaterial(__this, mat_name) {
  return $.MaterialMap.Get($.FnStringPar(mat_name));
}

export function FnPlaceVegetation(_this, Def, x$, y$, wdt, hgt, growth, shape) {
  const x = [x$];
  const y = [y$];
  if (shape != null) {
    let out_pos = $.C4PropList.New$pC4PropList(null);
    let vout_pos = $.C4VPropList(out_pos);
    return $.Game.PlaceVegetation(Def, x[0] | 0, y[0] | 0, wdt | 0, hgt | 0, growth | 0, shape, out_pos);
  } else {
    MakeAbsCoordinates$pC4PropList$ri64$ri64(_this, P(x, 0), P(y, 0));
    return $.Game.PlaceVegetation(Def, x[0] | 0, y[0] | 0, wdt | 0, hgt | 0, growth | 0, null, null);
  }
}

export function FnPlaceAnimal(_this, Def) {
  return $.Game.PlaceAnimal(Def != null ? Def : _this);
}

function FnHostile(__this, player_nr1, player_nr2, check_one_way_only) {
  if (check_one_way_only) {
    return $.Players.HostilityDeclared(player_nr1 | 0, player_nr2 | 0);
  } else {
    return !!($.Hostile(player_nr1 | 0, player_nr2 | 0) !== 0);
  }
}

function FnSetHostility(__this, player_nr1$, player_nr2$, hostile$, silent, no_calls) {
  const player_nr1 = [player_nr1$];
  const player_nr2 = [player_nr2$];
  const hostile = [hostile$];
  let player = $.Players.Get(player_nr1[0] | 0);
  if (player == null) {
    return false;
  }
  if (!no_calls) {
    if (!$.Game.GRBroadcast(S("~RejectHostilityChange"), new $.C4AulParSet().init$ri64$ri64$rb(P(player_nr1, 0), P(player_nr2, 0), P(hostile, 0)).op_and(), true, true).op_not()) {
      return false;
    }
  }
  let old_hostility = $.Players.HostilityDeclared(player_nr1[0] | 0, player_nr2[0] | 0);
  if (!player.SetHostility(player_nr2[0] | 0, hostile[0] ? 1 : 0, silent)) {
    return false;
  }
  $.Game.GRBroadcast(S("~OnHostilityChange"), new $.C4AulParSet().init$mC4Value$mC4Value$mC4Value$mC4Value($.C4VInt(player_nr1[0] | 0), $.C4VInt(player_nr2[0] | 0), $.C4VBool(hostile[0]), $.C4VBool(old_hostility)).op_and(), true);
  return true;
}

function FnSetPlrView(__this, player_nr, target, immediate_position) {
  if (!($.ValidPlr(player_nr | 0) !== 0)) {
    return false;
  }
  $.Players.Get(player_nr | 0).SetViewMode(1, target, immediate_position);
  return true;
}

function FnGetPlrViewMode(__this, player_nr) {
  if (!($.ValidPlr(player_nr | 0) !== 0)) {
    return -1;
  }
  if ($.Control$2.SyncMode()) {
    return -1;
  }
  return $.Players.Get(player_nr | 0).ViewMode;
}

function FnResetCursorView(__this, player_nr, immediate_position) {
  let player = $.Players.Get(player_nr | 0);
  if (player != null) {
    player.ResetCursorView(immediate_position);
  }
}

function FnGetPlrView(__this, player_nr) {
  let player = $.Players.Get(player_nr | 0);
  if (player == null || player.ViewMode !== 1) {
    return null;
  }
  return player.ViewTarget;
}







function FnSetPlayerZoomByViewRange(_this, player_nr, range_wdt, range_hgt, flags) {
  if (range_wdt < 0 || range_hgt < 0) {
    return false;
  }
  if (player_nr === -1) {
    for (let player = $.Players.First; player != null; player = player.Next) {
      if (player.Number !== -1) {
        FnSetPlayerZoomByViewRange(_this, player.Number, range_wdt, range_hgt, flags);
      }
    }
    return true;
  } else {
    let player = $.Players.Get(player_nr | 0);
    if (player == null) {
      return false;
    }
    if ($and64n(flags, 16) !== 0) {
      player.SetMinZoomByViewRange(range_wdt | 0, range_hgt | 0, !!($and64n(flags, 4) !== 0), !!($and64n(flags, 8) !== 0));
    }
    if ($and64n(flags, 32) !== 0) {
      player.SetMaxZoomByViewRange(range_wdt | 0, range_hgt | 0, !!($and64n(flags, 4) !== 0), !!($and64n(flags, 8) !== 0));
    }
    if ($and64n(flags, 64) !== 0 || !($and64n(flags, 48) !== 0)) {
      player.SetZoomByViewRange(range_wdt | 0, range_hgt | 0, !!($and64n(flags, 1) !== 0), !!($and64n(flags, 4) !== 0), !!($and64n(flags, 8) !== 0));
    }
  }
  return true;
}

function FnGetPlayerZoomLimits(__this, player_nr) {
  let player = $.Players.Get(player_nr | 0);
  if (player == null) {
    return null;
  }
  let result = $.C4PropList.New$pC4PropList();
  if (result == null) {
    return null;
  }
  result.SetPropertyByS($.Strings.RegString$pi8(S("MaxWidth")), $.C4VInt(player.ZoomLimitMaxWdt !== 0 || player.ZoomLimitMaxHgt !== 0 ? player.ZoomLimitMaxWdt : $.C4VP_DefMaxViewRangeX$C4Player));
  result.SetPropertyByS($.Strings.RegString$pi8(S("MaxHeight")), $.C4VInt(player.ZoomLimitMaxHgt));
  result.SetPropertyByS($.Strings.RegString$pi8(S("MaxValue")), $.C4VInt($.fixtoi$C4Fixed$i32(player.ZoomLimitMaxVal, 100)));
  result.SetPropertyByS($.Strings.RegString$pi8(S("MinWidth")), $.C4VInt(player.ZoomLimitMinWdt !== 0 || player.ZoomLimitMinHgt !== 0 ? player.ZoomLimitMinWdt : $.C4VP_DefMinViewRangeX$C4Player));
  result.SetPropertyByS($.Strings.RegString$pi8(S("MinHeight")), $.C4VInt(player.ZoomLimitMinHgt));
  result.SetPropertyByS($.Strings.RegString$pi8(S("MinValue")), $.C4VInt($.fixtoi$C4Fixed$i32(player.ZoomLimitMinVal, 100)));
  return result;
}

function FnSetPlayerZoom(_this, player_nr, zoom, precision, flags) {
  if (zoom < 0 || precision < 0) {
    return false;
  }
  if (player_nr === -1) {
    for (let player = $.Players.First; player != null; player = player.Next) {
      if (player.Number !== -1) {
        FnSetPlayerZoom(_this, player.Number, zoom, precision, flags);
      }
    }
    return true;
  } else {
    if (precision === 0) {
      precision = 1;
    }
    let fZoom = $.itofix$i32$i32(zoom | 0, precision | 0);
    let player = $.Players.Get(player_nr | 0);
    if (player == null) {
      return false;
    }
    if ($and64n(flags, 16) !== 0) {
      player.SetMinZoom(fZoom.$clone(), !!($and64n(flags, 4) !== 0), !!($and64n(flags, 8) !== 0));
    }
    if ($and64n(flags, 32) !== 0) {
      player.SetMaxZoom(fZoom.$clone(), !!($and64n(flags, 4) !== 0), !!($and64n(flags, 8) !== 0));
    }
    if ($and64n(flags, 64) !== 0 || !($and64n(flags, 48) !== 0)) {
      player.SetZoom(fZoom.$clone(), !!($and64n(flags, 1) !== 0), !!($and64n(flags, 4) !== 0), !!($and64n(flags, 8) !== 0));
    }
  }
  return true;
}

function FnSetPlayerViewLock(_this, player_nr, is_locked) {
  if (player_nr === -1) {
    for (let player = $.Players.First; player != null; player = player.Next) {
      if (player.Number !== -1) {
        FnSetPlayerViewLock(_this, player.Number, is_locked);
      }
    }
    return true;
  }
  let player = $.Players.Get(player_nr | 0);
  if (player == null) {
    return false;
  }
  player.SetViewLocked(is_locked);
  return true;
}

function FnDoBaseMaterial(__this, player_nr, id, change) {
  if (!($.ValidPlr(player_nr | 0) !== 0)) {
    return false;
  }
  let def = $.C4Id2Def(id.$clone());
  if (def == null) {
    return false;
  }
  let last_count = $.Players.Get(player_nr | 0).BaseMaterial.GetIDCount(id.$clone());
  return $.Players.Get(player_nr | 0).BaseMaterial.SetIDCount(id.$clone(), last_count + change | 0, true);
}

function FnDoBaseProduction(__this, player_nr, id, change) {
  if (!($.ValidPlr(player_nr | 0) !== 0)) {
    return false;
  }
  let def = $.C4Id2Def(id.$clone());
  if (def == null) {
    return false;
  }
  let last_count = $.Players.Get(player_nr | 0).BaseProduction.GetIDCount(id.$clone());
  return $.Players.Get(player_nr | 0).BaseProduction.SetIDCount(id.$clone(), last_count + change | 0, true);
}

function FnSetPlrKnowledge(__this, player_nr, id, remove) {
  let success = false;
  if (player_nr.IsNil()) {
    for (let player = $.Players.First; player != null; player = player.Next) {
      if (player.SetKnowledge(id.$clone(), remove)) {
        success = true;
      }
    }
  } else {
    let player = $.Players.Get(player_nr.op_long() | 0);
    if (player != null) {
      success = player.SetKnowledge(id.$clone(), remove);
    }
  }
  return success;
}

function FnGetPlrKnowledge(__this, player_nr, id, index, category) {
  if (!($.ValidPlr(player_nr) !== 0)) {
    return $.C4VBool(false);
  }
  if (id.op_unsigned_long_C4ID_() != null) {
    return $.C4VBool($.Players.Get(player_nr).Knowledge.GetIDCount(id.$clone(), 1) !== 0);
  }
  return $.C4VPropList($.C4Id2Def($.Players.Get(player_nr).Knowledge.GetID$rC4DefList$i32$i32$pi32($.Definitions, category, index)));
}

function FnGetDefinition(__this, iIndex) {
  return $.Definitions.GetDef(iIndex | 0);
}

function FnGetDefinitionGroupPath(_this) {
  if ($.Application.isEditor !== 0) {
    $.Console.EnsureDefinitionListInitialized();
  }
  let def = _this.GetDef$v();
  if (def == null || !(def.ConsoleGroupPath.getData() != null)) {
    return null;
  }
  return $.Strings.RegString$pi8(def.ConsoleGroupPath.getData());
}

function FnGetBaseMaterial(__this, player_nr, id, index, category) {
  if (!($.ValidPlr(player_nr) !== 0)) {
    return $.C4VBool(false);
  }
  if (id.op_unsigned_long_C4ID_() != null) {
    return $.C4VInt($.Players.Get(player_nr).BaseMaterial.GetIDCount(id.$clone()));
  }
  return $.C4VPropList($.C4Id2Def($.Players.Get(player_nr).BaseMaterial.GetID$rC4DefList$i32$i32$pi32($.Definitions, category, index)));
}

function FnGetBaseProduction(__this, player_nr, id, index, category) {
  if (!($.ValidPlr(player_nr) !== 0)) {
    return $.C4VBool(false);
  }
  if (id.op_unsigned_long_C4ID_() != null) {
    return $.C4VInt($.Players.Get(player_nr).BaseProduction.GetIDCount(id.$clone()));
  }
  return $.C4VPropList($.C4Id2Def($.Players.Get(player_nr).BaseProduction.GetID$rC4DefList$i32$i32$pi32($.Definitions, category, index)));
}

function FnGetWealth(__this, player_nr) {
  if (!($.ValidPlr(player_nr | 0) !== 0)) {
    return 0;
  }
  return $.Players.Get(player_nr | 0).Wealth;
}

function FnSetWealth(__this, player_nr, value) {
  if (!($.ValidPlr(player_nr | 0) !== 0)) {
    return false;
  }
  $.Players.Get(player_nr | 0).SetWealth(value | 0);
  return true;
}

function FnDoPlayerScore(__this, player_nr, change) {
  if (!($.ValidPlr(player_nr | 0) !== 0)) {
    return 0;
  }
  return $.Players.Get(player_nr | 0).DoScore(change | 0) ? 1 : 0;
}

function FnGetPlayerScore(__this, player_nr) {
  if (!($.ValidPlr(player_nr | 0) !== 0)) {
    return 0;
  }
  return $.Players.Get(player_nr | 0).CurrentScore;
}

function FnGetPlayerScoreGain(__this, player_nr) {
  if (!($.ValidPlr(player_nr | 0) !== 0)) {
    return 0;
  }
  return $.Players.Get(player_nr | 0).CurrentScore - $.Players.Get(player_nr | 0).InitialScore | 0;
}

function FnGetHiRank(__this, player_nr) {
  if (!($.ValidPlr(player_nr | 0) !== 0)) {
    return null;
  }
  return $.Players.Get(player_nr | 0).GetHiRankActiveCrew();
}

function FnGetCrew(__this, player_nr, index) {
  if (!($.ValidPlr(player_nr | 0) !== 0)) {
    return null;
  }
  return $.Players.Get(player_nr | 0).Crew.GetObject(index | 0);
}

function FnGetCrewCount(__this, player_nr) {
  if (!($.ValidPlr(player_nr | 0) !== 0)) {
    return 0;
  }
  return $.Players.Get(player_nr | 0).Crew.ObjectCount();
}

function FnGetPlayerCount(__this, type) {
  if (type === 0) {
    return $.Players.GetCount$v();
  } else {
    return $.Players.GetCount$i32(type | 0);
  }
}

function FnGetPlayerByIndex(__this, index, type) {
  let player = null;
  if (type !== 0) {
    player = $.Players.GetByIndex$i32$i32(index | 0, type | 0);
  } else {
    player = $.Players.GetByIndex$i32(index | 0);
  }
  if (player == null) {
    return -1;
  }
  return player.Number;
}

function FnEliminatePlayer(__this, player_nr, remove_direct) {
  let player = $.Players.Get(player_nr | 0);
  if (player == null) {
    return 0;
  }
  if (remove_direct) {
    if ($.Control$2.isCtrlHost()) {
      $.Players.CtrlRemove(player_nr | 0, false);
    }
    return 1;
  } else {
    if (player.Eliminated !== 0) {
      return 0;
    }
    player.Eliminate();
  }
  return 1;
}

function FnSurrenderPlayer(__this, player_nr) {
  let player = $.Players.Get(player_nr | 0);
  if (player == null) {
    return false;
  }
  if (player.Eliminated !== 0) {
    return false;
  }
  player.Surrender();
  return true;
}

function FnSetLeaguePerformance(__this, iScore, player_id) {
  if (!$.Game.Parameters.isLeague()) {
    return false;
  }
  if (player_id !== 0 && !($.Game.PlayerInfos.GetPlayerInfoByID$i32(player_id | 0) != null)) {
    return false;
  }
  $.Game.RoundResults.SetLeaguePerformance(iScore | 0, player_id | 0);
  return true;
}






function FnCreateScriptPlayer(__this, name, dwColor, team_id, dwFlags, idExtra) {
  if (name == null || !(name.GetData().getLength() !== 0)) {
    return false;
  }
  if (!$.Control$2.isCtrlHost()) {
    return true;
  }
  let pScriptPlrInfo = new $.C4PlayerInfo().init();
  let dwInfoFlags = 0;
  if ($and64n(dwFlags, 1) !== 0) {
    dwInfoFlags = (dwInfoFlags | 2048) >>> 0;
  }
  if ($and64n(dwFlags, 2) !== 0) {
    dwInfoFlags = (dwInfoFlags | 4096) >>> 0;
  }
  if ($and64n(dwFlags, 4) !== 0) {
    dwInfoFlags = (dwInfoFlags | 8192) >>> 0;
  }
  if ($and64n(dwFlags, 8) !== 0) {
    dwInfoFlags = (dwInfoFlags | 16384) >>> 0;
  }
  if ($and64n(dwFlags, 16) !== 0) {
    dwInfoFlags = (dwInfoFlags | 32768) >>> 0;
  }
  pScriptPlrInfo.SetAsScriptPlayer(name.GetCStr(), dwColor >>> 0, dwInfoFlags, idExtra.$clone());
  pScriptPlrInfo.SetTeam(team_id | 0);
  let JoinPkt = new $.C4ClientPlayerInfos().init(null, true, pScriptPlrInfo);
  $.Game.PlayerInfos.DoPlayerInfoUpdate(JoinPkt);
  return true;
}

function FnGetCursor(__this, player_nr) {
  let player = $.Players.Get(player_nr | 0);
  if (player == null) {
    return null;
  }
  return player.Cursor.op_C4Object_();
}

function FnGetViewCursor(__this, player_nr) {
  let player = $.Players.Get(player_nr | 0);
  return (player != null ? player.ViewCursor.$clone() : new $.C4ObjectPtr().init$pC4Object(null)).op_C4Object_();
}

function FnSetCursor(__this, player_nr, obj, no_select_arrow) {
  let player = $.Players.Get(player_nr | 0);
  if (player == null || obj != null && obj.Status === 0 || obj != null && obj.CrewDisabled) {
    return false;
  }
  player.SetCursor(obj, !no_select_arrow);
  return true;
}

function FnSetViewCursor(__this, player_nr, obj) {
  let player = $.Players.Get(player_nr | 0);
  if (player == null) {
    return false;
  }
  player.ViewCursor.op_assign(obj);
  return true;
}

function FnGetWind(_this, x$, y$, global) {
  const x = [x$];
  const y = [y$];
  if (global) {
    return $.Weather.Wind;
  }
  MakeAbsCoordinates$pC4PropList$ri64$ri64(_this, P(x, 0), P(y, 0));
  return $.Weather.GetWind(x[0] | 0, y[0] | 0);
}

function FnSetWind(__this, wind) {
  $.Weather.SetWind(wind | 0);
}

function FnSetTemperature(__this, temperature) {
  $.Weather.SetTemperature(temperature | 0);
}

function FnGetTemperature(__this) {
  return $.Weather.GetTemperature();
}

function FnSetAmbientBrightness(__this, brightness) {
  if ($.Landscape.HasFoW()) {
    $.Landscape.GetFoW().Ambient.SetBrightness(brightness / 100);
  }
}

function FnGetAmbientBrightness(__this) {
  if (!$.Landscape.HasFoW()) {
    return 100;
  }
  return Math.trunc($.Landscape.GetFoW().Ambient.GetBrightness() * 100 + 0.5);
}

function FnSetSeason(__this, season) {
  $.Weather.SetSeason(season | 0);
}

function FnGetSeason(__this) {
  return $.Weather.GetSeason();
}

function FnSetClimate(__this, climate) {
  $.Weather.SetClimate(climate | 0);
}

function FnGetClimate(__this) {
  return $.Weather.GetClimate();
}

function FnLandscapeWidth(__this) {
  return $.Landscape.GetWidth();
}

function FnLandscapeHeight(__this) {
  return $.Landscape.GetHeight();
}

function FnShakeFree(__this, x, y, radius) {
  $.Landscape.ShakeFree(x | 0, y | 0, radius | 0);
}

function FnDigFree(_this, x, y, radius, no_dig2objects, no_instability_check) {
  return $.Landscape.DigFree(x | 0, y | 0, radius | 0, $.Object_(_this), no_dig2objects, no_instability_check);
}

function FnDigFreeRect(_this, x, y, wdt, hgt, no_dig2objects, no_instability_check) {
  return $.Landscape.DigFreeRect(x | 0, y | 0, wdt | 0, hgt | 0, $.Object_(_this), no_dig2objects, no_instability_check);
}

function FnClearFreeRect(__this, x, y, wdt, hgt) {
  $.Landscape.ClearFreeRect(x | 0, y | 0, wdt | 0, hgt | 0);
}

function FnPathFree(__this, x1, y1, x2, y2) {
  return !!$.PathFree$i32$i32$i32$i32(x1 | 0, y1 | 0, x2 | 0, y2 | 0);
}

function FnPathFree2(__this, x1, y1, x2, y2) {
  const x = [-1];
  const y = [-1];
  if (!$.PathFree$i32$i32$i32$i32$pi32$pi32(x1, y1, x2, y2, P(x, 0), P(y, 0))) {
    let array = new $.C4ValueArray().init$i32(2);
    array.SetItem(0, $.C4VInt(x[0]));
    array.SetItem(1, $.C4VInt(y[0]));
    return array;
  }
  return null;
}

export function FnObject(__this, iNumber) {
  return $.Objects.SafeObjectPointer(iNumber | 0);
}

function FnGameCallEx(__this, parameters) {
  let fn = parameters.getStr();
  if (fn == null) {
    return new $.C4Value().init$v();
  }
  let ParSet = new $.C4AulParSet().init$v();
  ParSet.Copy($oadd(parameters, 1), 9);
  return $.Game.GRBroadcast(fn.GetCStr(), ParSet.op_and(), true);
}

function FnEditCursor(__this) {
  if ($.Control$2.SyncMode()) {
    return null;
  }
  return $.Console.EditCursor.GetTarget();
}

function FnIsNetwork(__this) {
  return $.Game.Parameters.IsNetworkGame;
}

function FnIsEditor(__this) {
  return $.Game.Parameters.IsEditor;
}

function FnGetLeague(__this, idx) {
  let sIdxLeague = new $.StdStrBuf();
  if (!$.Game.Parameters.League.GetSection($u64n(idx), sIdxLeague)) {
    return null;
  }
  return $.String_(sIdxLeague.getData());
}

function FnGetLeagueScore(__this, player_id) {
  if (player_id < 1) {
    return 0;
  }
  let info = $.Game.PlayerInfos.GetPlayerInfoByID$i32(player_id | 0);
  if (info == null) {
    return 0;
  }
  return info.getLeagueScore();
}

function FnSetLeagueProgressData(__this, pNewData, player_id) {
  if (!($.Game.Parameters.League.getLength() !== 0) || player_id === 0) {
    return false;
  }
  let info = $.Game.PlayerInfos.GetPlayerInfoByID$i32(player_id | 0);
  if (info == null) {
    return false;
  }
  info.SetLeagueProgressData(pNewData != null ? pNewData.GetCStr() : null);
  return true;
}

function FnGetLeagueProgressData(__this, player_id) {
  if (!($.Game.Parameters.League.getLength() !== 0)) {
    return null;
  }
  let info = $.Game.PlayerInfos.GetPlayerInfoByID$i32(player_id | 0);
  if (info == null) {
    return null;
  }
  return $.String_(info.GetLeagueProgressData());
}

function FnTestMessageBoard(__this, player_nr, test_if_in_use) {
  let player = $.Players.Get(player_nr | 0);
  if (player == null) {
    return false;
  }
  if (!test_if_in_use) {
    return true;
  }
  return player.HasMessageBoardQuery();
}

function FnCallMessageBoard(_this, obj, upper_case, query_string, player_nr) {
  if (obj == null) {
    obj = $.Object_(_this);
  }
  if (obj != null && obj.Status === 0) {
    return false;
  }
  let player = $.Players.Get(player_nr | 0);
  if (player == null) {
    return false;
  }
  player.CallMessageBoard(obj, new $.StdStrBuf().init$pi8$b($.FnStringPar(query_string)), !!upper_case);
  return true;
}

function FnAbortMessageBoard(_this, obj, player_nr) {
  if (obj == null) {
    obj = $.Object_(_this);
  }
  let player = $.Players.Get(player_nr | 0);
  if (player == null) {
    return false;
  }
  $.MessageInput.AbortMsgBoardQuery(obj, player_nr | 0);
  return player.RemoveMessageBoardQuery(obj);
}

function FnSetFoW(__this, enabled, player_nr) {
  if (!($.ValidPlr(player_nr | 0) !== 0)) {
    return;
  }
  $.Players.Get(player_nr | 0).SetFoW(!!enabled);
}

function FnSetMaxPlayer(__this, player_count) {
  if (player_count < 0) {
    return 0;
  }
  $.Game.Parameters.MaxPlayers = player_count | 0;
  return 1;
}

function FnGetScenarioAccess(__this, password) {
  if (password == null) {
    return false;
  }
  if ($.Control$2.SyncMode()) {
    $.Log(S("Warning: using GetScenarioAccess may cause desyncs when playing records!"));
  }
  return $.SIsModule(P($.Config.General.MissionAccess, 0), $.FnStringPar(password));
}

export function GetValByStdCompiler$pi8$pi8$i32$C4MaterialCore(strEntry, strSection, iEntryNr, rFrom) {
  const szNames = [strSection != null ? strSection : strEntry, strSection != null ? strEntry : null];
  let Comp = new C4ValueGetCompiler().init(P(szNames, 0), strSection != null ? 2 : 1, iEntryNr);
  try {
    Comp.Decompile$C4MaterialCore(rFrom);
    return new $.C4Value().$copy(Comp.getResult());
  } catch ($e1) {
    if ($e1 instanceof $.StdCompiler$Exception) {
      return new $.C4Value().$copy($.C4VNull);
    } else {
      throw $e1;
    }
  }
}

export function GetValByStdCompiler$pi8$pi8$i32$StdNamingAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers(strEntry, strSection, iEntryNr, rFrom) {
  const szNames = [strSection != null ? strSection : strEntry, strSection != null ? strEntry : null];
  let Comp = new C4ValueGetCompiler().init(P(szNames, 0), strSection != null ? 2 : 1, iEntryNr);
  try {
    Comp.Decompile$StdNamingAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers(rFrom);
    return new $.C4Value().$copy(Comp.getResult());
  } catch ($e1) {
    if ($e1 instanceof $.StdCompiler$Exception) {
      return new $.C4Value().$copy($.C4VNull);
    } else {
      throw $e1;
    }
  }
}

export function GetValByStdCompiler$pi8$pi8$i32$StdNamingAdapt$StdParameterAdapt$C4Player$pC4ValueNumbers(strEntry, strSection, iEntryNr, rFrom) {
  const szNames = [strSection != null ? strSection : strEntry, strSection != null ? strEntry : null];
  let Comp = new C4ValueGetCompiler().init(P(szNames, 0), strSection != null ? 2 : 1, iEntryNr);
  try {
    Comp.Decompile$StdNamingAdapt$StdParameterAdapt$C4Player$pC4ValueNumbers(rFrom);
    return new $.C4Value().$copy(Comp.getResult());
  } catch ($e1) {
    if ($e1 instanceof $.StdCompiler$Exception) {
      return new $.C4Value().$copy($.C4VNull);
    } else {
      throw $e1;
    }
  }
}

export function GetValByStdCompiler$pi8$pi8$i32$StdNamingAdapt$C4ObjectInfoCore(strEntry, strSection, iEntryNr, rFrom) {
  const szNames = [strSection != null ? strSection : strEntry, strSection != null ? strEntry : null];
  let Comp = new C4ValueGetCompiler().init(P(szNames, 0), strSection != null ? 2 : 1, iEntryNr);
  try {
    Comp.Decompile$StdNamingAdapt$C4ObjectInfoCore(rFrom);
    return new $.C4Value().$copy(Comp.getResult());
  } catch ($e1) {
    if ($e1 instanceof $.StdCompiler$Exception) {
      return new $.C4Value().$copy($.C4VNull);
    } else {
      throw $e1;
    }
  }
}

export function GetValByStdCompiler$pi8$pi8$i32$StdNamingAdapt$C4Def(strEntry, strSection, iEntryNr, rFrom) {
  const szNames = [strSection != null ? strSection : strEntry, strSection != null ? strEntry : null];
  let Comp = new C4ValueGetCompiler().init(P(szNames, 0), strSection != null ? 2 : 1, iEntryNr);
  try {
    Comp.Decompile$StdNamingAdapt$C4Def(rFrom);
    return new $.C4Value().$copy(Comp.getResult());
  } catch ($e1) {
    if ($e1 instanceof $.StdCompiler$Exception) {
      return new $.C4Value().$copy($.C4VNull);
    } else {
      throw $e1;
    }
  }
}

export function GetValByStdCompiler$pi8$pi8$i32$C4PlayerInfoCore(strEntry, strSection, iEntryNr, rFrom) {
  const szNames = [strSection != null ? strSection : strEntry, strSection != null ? strEntry : null];
  let Comp = new C4ValueGetCompiler().init(P(szNames, 0), strSection != null ? 2 : 1, iEntryNr);
  try {
    Comp.Decompile$C4PlayerInfoCore(rFrom);
    return new $.C4Value().$copy(Comp.getResult());
  } catch ($e1) {
    if ($e1 instanceof $.StdCompiler$Exception) {
      return new $.C4Value().$copy($.C4VNull);
    } else {
      throw $e1;
    }
  }
}

export function GetValByStdCompiler$pi8$pi8$i32$StdParameterAdapt$C4Scenario$b(strEntry, strSection, iEntryNr, rFrom) {
  const szNames = [strSection != null ? strSection : strEntry, strSection != null ? strEntry : null];
  let Comp = new C4ValueGetCompiler().init(P(szNames, 0), strSection != null ? 2 : 1, iEntryNr);
  try {
    Comp.Decompile$StdParameterAdapt$C4Scenario$b$2(rFrom);
    return new $.C4Value().$copy(Comp.getResult());
  } catch ($e1) {
    if ($e1 instanceof $.StdCompiler$Exception) {
      return new $.C4Value().$copy($.C4VNull);
    } else {
      throw $e1;
    }
  }
}

function FnGetDefCoreVal(_this, strEntry, strSection, iEntryNr) {
  if (_this == null || !(_this.GetDef$v() != null)) {
    $throw(new $.NeedNonGlobalContext().init(S("GetDefCoreVal")));
  }
  return GetValByStdCompiler$pi8$pi8$i32$StdNamingAdapt$C4Def($.FnStringPar(strEntry), strSection != null ? strSection.GetCStr() : null, iEntryNr, $.mkNamingAdapt$rC4Def$pi8(_this.GetDef$v(), S("DefCore")));
}

function FnGetObjectVal(_this, strEntry, strSection, iEntryNr) {
  let numbers = new $.C4ValueNumbers().init();
  let retval = GetValByStdCompiler$pi8$pi8$i32$StdNamingAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers($.FnStringPar(strEntry), strSection != null ? strSection.GetCStr() : null, iEntryNr, $.mkNamingAdapt$mStdParameterAdapt$C4Object$pC4ValueNumbers$pi8($.mkParAdapt$rC4Object$mpC4ValueNumbers($.Object_(_this), numbers), S("Object")));
  numbers.Denumerate();
  retval.Denumerate(numbers);
  return retval;
}

function FnGetObjectInfoCoreVal(_this, strEntry, strSection, iEntryNr) {
  let pObjInfo = $.Object_(_this).Info;
  if (pObjInfo == null) {
    return new $.C4Value().$copy($.C4VNull);
  }
  let pObjInfoCore = pObjInfo;
  return GetValByStdCompiler$pi8$pi8$i32$StdNamingAdapt$C4ObjectInfoCore($.FnStringPar(strEntry), strSection != null ? strSection.GetCStr() : null, iEntryNr, $.mkNamingAdapt$rC4ObjectInfoCore$pi8(pObjInfoCore, S("ObjectInfo")));
}

function FnGetScenarioVal(__this, strEntry, strSection, iEntryNr) {
  return GetValByStdCompiler$pi8$pi8$i32$StdParameterAdapt$C4Scenario$b($.FnStringPar(strEntry), strSection != null ? strSection.GetCStr() : null, iEntryNr, $.mkParAdapt$rC4Scenario$mb($.Game.C4S, false));
}

function FnGetPlayerVal(__this, strEntry, strSection, player_nr, iEntryNr) {
  let pPlayer = $.Players.Get(player_nr);
  if (pPlayer == null) {
    return new $.C4Value().init$v();
  }
  let numbers = new $.C4ValueNumbers().init();
  let retval = GetValByStdCompiler$pi8$pi8$i32$StdNamingAdapt$StdParameterAdapt$C4Player$pC4ValueNumbers($.FnStringPar(strEntry), strSection != null ? strSection.GetCStr() : null, iEntryNr, $.mkNamingAdapt$mStdParameterAdapt$C4Player$pC4ValueNumbers$pi8($.mkParAdapt$rC4Player$mpC4ValueNumbers(pPlayer, numbers), S("Player")));
  numbers.Denumerate();
  retval.Denumerate(numbers);
  return retval;
}

function FnGetPlayerInfoCoreVal(__this, strEntry, strSection, player_nr, iEntryNr) {
  let pPlayer = $.Players.Get(player_nr);
  if (pPlayer == null) {
    return new $.C4Value().init$v();
  }
  let pPlayerInfoCore = pPlayer;
  return GetValByStdCompiler$pi8$pi8$i32$C4PlayerInfoCore($.FnStringPar(strEntry), strSection != null ? strSection.GetCStr() : null, iEntryNr, pPlayerInfoCore);
}

function FnGetMaterialVal(__this, strEntry, strSection, iMat, iEntryNr) {
  if (iMat < 0 || iMat >= $.MaterialMap.Num) {
    return new $.C4Value().init$v();
  }
  let pMaterial = $oadd($.MaterialMap.Map, iMat);
  let pMaterialCore = pMaterial;
  return GetValByStdCompiler$pi8$pi8$i32$C4MaterialCore($.FnStringPar(strEntry), strSection != null ? strSection.GetCStr() : null, iEntryNr, pMaterialCore);
}

function FnMaterialName(__this, iMat) {
  if (!$.MatValid(iMat | 0)) {
    return null;
  }
  return $.String_(P($oidx($.MaterialMap.Map, iMat).Name, 0));
}

function FnSetSky(__this, name) {
  if (name == null) {
    return false;
  }
  const sky = $.Landscape.GetSky();
  if (!$.GraphicsResource.RegisterGlobalGraphics()) {
    return false;
  }
  if (!$.GraphicsResource.RegisterMainGroups()) {
    return false;
  }
  sky.Clear();
  let result = sky.Init(false, StdString.of(name.GetCStr()));
  $.GraphicsResource.CloseFiles();
  return result;
}

function FnSetSkyAdjust(__this, dwAdjust, dwBackClr) {
  $.Landscape.GetSky().SetModulation(dwAdjust >>> 0, dwBackClr >>> 0);
  return true;
}

function FnSetMatAdjust(__this, dwAdjust) {
  $.Landscape.SetModulation(dwAdjust >>> 0);
  return true;
}

function FnGetSkyAdjust(__this, fBackColor) {
  return $.Landscape.GetSky().GetModulation(!!fBackColor);
}

function FnGetMatAdjust(__this) {
  return $.Landscape.GetModulation();
}

function FnGetTime(__this) {
  if ($.Control$2.SyncMode()) {
    return 0;
  }
  return $.C4TimeMilliseconds.Now().AsInt();
}

function FnSetPlrExtraData(__this, player_nr, DataName, Data) {
  let strDataName = $.FnStringPar(DataName);
  if (Data.GetType() !== 0 && Data.GetType() !== 1 && Data.GetType() !== 2 && Data.GetType() !== 4) {
    return new $.C4Value().$copy($.C4VNull);
  }
  let pPlayer = $.Players.Get(player_nr);
  if (pPlayer == null) {
    return new $.C4Value().init$v();
  }
  if (pPlayer.ExtraData.pNames == null) {
    pPlayer.ExtraData.CreateTempNameList();
  }
  let ival = 0;
  if ((ival = pPlayer.ExtraData.pNames.GetItemNr(strDataName)) !== -1) {
    pPlayer.ExtraData.op_index$i32(ival | 0).$assign(Data);
  } else {
    pPlayer.ExtraData.pNames.AddName(strDataName);
    if ((ival = pPlayer.ExtraData.pNames.GetItemNr(strDataName)) === -1) {
      return new $.C4Value().init$v();
    }
    pPlayer.ExtraData.op_index$i32(ival | 0).$assign(Data);
  }
  return new $.C4Value().$copy(Data);
}

function FnGetPlrExtraData(__this, player_nr, DataName) {
  let strDataName = $.FnStringPar(DataName);
  let pPlayer = $.Players.Get(player_nr);
  if (pPlayer == null) {
    return new $.C4Value().init$v();
  }
  if (pPlayer.ExtraData.pNames == null) {
    return new $.C4Value().init$v();
  }
  let ival = 0;
  if ((ival = pPlayer.ExtraData.pNames.GetItemNr(strDataName)) === -1) {
    return new $.C4Value().init$v();
  }
  return new $.C4Value().$copy(pPlayer.ExtraData.op_index$i32(ival | 0));
}

function FnDrawMatChunks(__this, tx, ty, twdt, thgt, icntx, icnty, strMaterial, strTexture, bIFT) {
  return $.Landscape.DrawChunks(tx | 0, ty | 0, twdt | 0, thgt | 0, icntx | 0, icnty | 0, $.FnStringPar(strMaterial), $.FnStringPar(strTexture), (bIFT ? 1 : 0) !== 0) ? 1 : 0;
}

function FnDrawMap(__this, iX, iY, iWdt, iHgt, szMapDef) {
  return $.Landscape.DrawMap(iX | 0, iY | 0, iWdt | 0, iHgt | 0, $.FnStringPar(szMapDef), true) ? 1 : 0;
}

function FnDrawDefMap(__this, iX, iY, iWdt, iHgt, szMapDef) {
  return $.Landscape.DrawDefMap(iX | 0, iY | 0, iWdt | 0, iHgt | 0, $.FnStringPar(szMapDef), true) ? 1 : 0;
}

function FnCreateParticle(_this, _name, _x, _y, _speedX, _speedY, _lifetime, _properties, _amount) {
  let obj = $.Object_(_this);
  if (obj != null && _this.Status === 0) {
    return false;
  }
  return true;
}

function FnClearParticles(__this) {
  return true;
}

function FnPV_Linear(__this, startValue, endValue) {
  let array = new $.C4ValueArray().init$i32(3);
  array.SetItem(0, $.C4VInt(1));
  array.SetItem(1, startValue);
  array.SetItem(2, endValue);
  return array;
}

function FnPV_Random(__this, startValue, endValue, rerollInterval, seed) {
  let array = new $.C4ValueArray().init$i32(4);
  array.SetItem(0, $.C4VInt(2));
  array.SetItem(1, startValue);
  array.SetItem(2, endValue);
  array.SetItem(3, rerollInterval);
  array.SetItem(4, seed);
  return array;
}

function FnPV_Direction(__this, factor) {
  let array = new $.C4ValueArray().init$i32(2);
  array.SetItem(0, $.C4VInt(6));
  array.SetItem(1, factor.GetType() !== 0 ? new $.C4Value().$copy(factor) : $.C4VInt(1000));
  return array;
}

function FnPV_Step(__this, step, startValue, delay, maximumValue) {
  let array = new $.C4ValueArray().init$i32(5);
  array.SetItem(0, $.C4VInt(7));
  array.SetItem(1, step);
  array.SetItem(2, startValue);
  array.SetItem(3, delay);
  array.SetItem(4, maximumValue);
  return array;
}

function FnPV_KeyFrames(__this, pars) {
  let $t1;
  let array = new $.C4ValueArray().init$i32(10);
  array.SetItem(0, $.C4VInt(3));
  let offset = 1;
  let i = 0;
  for (; i < 10; i = i + 1 | 0) {
    let Data = new $.C4Value().$copy(($t1 = pars, pars = $oadd(pars, 1), $t1));
    if (Data.GetType() === 0) {
      break;
    }
    array.SetItem(1 + i | 0, Data);
  }
  array.SetSize(i + 1 | 0);
  return new $.C4Value().init$pC4ValueArray(array);
}

function FnPV_Sin(__this, value, amplitude, offset) {
  let array = new $.C4ValueArray().init$i32(5);
  array.SetItem(0, $.C4VInt(4));
  array.SetItem(1, value);
  array.SetItem(2, amplitude);
  array.SetItem(3, offset);
  return array;
}

function FnPV_Cos(__this, value, amplitude, offset) {
  let array = new $.C4ValueArray().init$i32(5);
  array.SetItem(0, $.C4VInt(5));
  array.SetItem(1, value);
  array.SetItem(2, amplitude);
  array.SetItem(3, offset);
  return array;
}

function FnPV_Speed(__this, factor, startValue) {
  let array = new $.C4ValueArray().init$i32(3);
  array.SetItem(0, $.C4VInt(8));
  array.SetItem(1, factor.GetType() === 0 ? $.C4VInt(1000) : new $.C4Value().$copy(factor));
  array.SetItem(2, startValue);
  return array;
}

function FnPV_Wind(__this, factor, startValue) {
  let array = new $.C4ValueArray().init$i32(3);
  array.SetItem(0, $.C4VInt(9));
  array.SetItem(1, factor.GetType() === 0 ? $.C4VInt(1000) : new $.C4Value().$copy(factor));
  array.SetItem(2, startValue);
  return array;
}

function FnPV_Gravity(__this, factor, startValue) {
  let array = new $.C4ValueArray().init$i32(3);
  array.SetItem(0, $.C4VInt(10));
  array.SetItem(1, factor.GetType() === 0 ? $.C4VInt(1000) : new $.C4Value().$copy(factor));
  array.SetItem(2, startValue);
  return array;
}

function FnPC_Die(__this) {
  let array = new $.C4ValueArray().init$i32(1);
  array.SetItem(0, $.C4VInt(0));
  return array;
}

function FnPC_Bounce(__this, bouncyness) {
  let array = new $.C4ValueArray().init$i32(2);
  array.SetItem(0, $.C4VInt(1));
  array.SetItem(1, bouncyness.GetType() !== 0 ? new $.C4Value().$copy(bouncyness) : $.C4VInt(1000));
  return array;
}

function FnPC_Stop(__this) {
  let array = new $.C4ValueArray().init$i32(1);
  array.SetItem(0, $.C4VInt(2));
  return array;
}

function FnSetSkyParallax(__this, iMode, iParX, iParY, iXDir, iYDir, iX, iY) {
  if (!iMode.IsNil()) {
    if ($.Inside$i64$i32$i32(iMode.op_long(), 0, 1)) {
      $.Landscape.GetSky().ParallaxMode = iMode.op_long() | 0;
    }
  }
  if (!iParX.IsNil() && iParX.op_long() !== 0) {
    $.Landscape.GetSky().ParX = iParX.op_long() | 0;
  }
  if (!iParY.IsNil() && iParY.op_long() !== 0) {
    $.Landscape.GetSky().ParY = iParY.op_long() | 0;
  }
  if (!iXDir.IsNil()) {
    $.Landscape.GetSky().xdir.$assign($.itofix$i32(iXDir.op_long() | 0));
  }
  if (!iYDir.IsNil()) {
    $.Landscape.GetSky().ydir.$assign($.itofix$i32(iYDir.op_long() | 0));
  }
  if (!iX.IsNil()) {
    $.Landscape.GetSky().x.$assign($.itofix$i32(iX.op_long() | 0));
  }
  if (!iY.IsNil()) {
    $.Landscape.GetSky().y.$assign($.itofix$i32(iY.op_long() | 0));
  }
  return true;
}

function FnReloadDef(_this, idDef, iReloadWhat) {
  let pDef = null;
  if (!(idDef.op_unsigned_long_C4ID_() != null)) {
    if ($.Object_(_this) != null) {
      pDef = $.Object_(_this).Def;
    }
  } else {
    pDef = $.Definitions.ID2Def(idDef.$clone());
  }
  if (pDef == null) {
    return 0;
  }
  if (iReloadWhat === 0) {
    iReloadWhat = 966;
  }
  return $.Game.ReloadDef(pDef.id.$clone()) ? 1 : 0;
}

function FnReloadParticle(__this, szParticleName) {
  return $.Game.ReloadParticle($.FnStringPar(szParticleName)) ? 1 : 0;
}

function FnSetGamma(__this, iRed, iGreen, iBlue, iRampIndex) {
  $.pDraw.SetGamma(Math.fround(Math.fround(iRed) / Math.fround(100)), Math.fround(Math.fround(iGreen) / Math.fround(100)), Math.fround(Math.fround(iBlue) / Math.fround(100)), iRampIndex | 0);
  return true;
}

function FnResetGamma(__this, _iRampIndex) {
  $.Game.SetDefaultGamma();
  return true;
}

function FnAddFragmentShader(__this, name, shader) {
  if (name == null || shader == null) {
    return new $.Nillable$i64().init$C4Void(new $.C4Void());
  }
  return new $.Nillable$i64().init$i64($.ScriptShader.Add(StdString.of(name.GetCStr()), 1 /*FragmentShader*/, StdString.of(shader.GetCStr())));
}

function FnRemoveShader(__this, id) {
  return $.ScriptShader.Remove(id | 0);
}

function FnFrameCounter(__this) {
  return $.Game.FrameCounter;
}

function FnGetPathLength(__this, iFromX, iFromY, iToX, iToY, iLevel) {
  let PathInfo = new PathInfo();
  PathInfo.ilx = iFromX;
  PathInfo.ily = iFromY;
  PathInfo.ilen = 0;
  if (iLevel === 0) {
    iLevel = 1;
  }
  $.Game.PathFinder.SetLevel(iLevel | 0);
  if (!$.Game.PathFinder.Find(iFromX | 0, iFromY | 0, iToX | 0, iToY | 0, $fn(new SumPathLength().init(PathInfo)))) {
    return new $.Nillable$i64().init$C4Void(new $.C4Void());
  }
  return new $.Nillable$i64().init$i64(PathInfo.ilen + $.Distance(PathInfo.ilx | 0, PathInfo.ily | 0, iToX | 0, iToY | 0));
}

function FnSetTextureIndex(__this, psMatTex, iNewIndex, fInsert) {
  if (!$.Inside$i64$i64$i64(iNewIndex, 0, 255)) {
    return 0;
  }
  return $.Landscape.SetTextureIndex($.FnStringPar(psMatTex), iNewIndex & 0xff, !!fInsert) ? 1 : 0;
}

function FnRemoveUnusedTexMapEntries(__this) {
  $.Landscape.RemoveUnusedTexMapEntries();
  return 1;
}




function FnDrawMaterialQuad(__this, szMaterial, iX1, iY1, iX2, iY2, iX3, iY3, iX4, iY4, draw_mode) {
  let szMat = $.FnStringPar(szMaterial);
  let szBackMat = null;
  let fBridge = false;
  if (draw_mode.GetType() === 1) {
    let draw_mode_value = draw_mode.getInt();
    switch (draw_mode_value) {
      case 0:
        break;
      case 1:
        szBackMat = S("Tunnel");
        break;
      case 2:
        fBridge = true;
        break;
    }
  } else if (draw_mode.GetType() === 4) {
    szBackMat = $.FnStringPar(draw_mode.getStr());
  }
  return !!$.Landscape.DrawQuad(iX1 | 0, iY1 | 0, iX2 | 0, iY2 | 0, iX3 | 0, iY3 | 0, iX4 | 0, iY4 | 0, szMat, szBackMat, fBridge);
}

function FnSetFilmView(__this, iToPlr) {
  if (!($.ValidPlr(iToPlr | 0) !== 0) && iToPlr !== -1) {
    return false;
  }
  if (!$.Control$2.isReplay()) {
    return true;
  }
  {
    let vp = $.Viewports.GetFirstViewport();
    if (vp != null) {
      vp.Init(iToPlr | 0, true);
    }
  }
  return true;
}

function FnAddMsgBoardCmd(__this, pstrCommand, pstrScript) {
  if (pstrCommand == null || pstrScript == null) {
    return false;
  }
  $.MessageInput.AddCommand($.FnStringPar(pstrCommand), $.FnStringPar(pstrScript));
  return true;
}

function FnSetGameSpeed(__this, iSpeed) {
  if (iSpeed !== 0) {
    if (!$.Inside$i64$i32$i32(iSpeed, 0, 1000)) {
      return false;
    }
  }
  if (iSpeed === 0) {
    iSpeed = 38;
  }
  $.Application.SetGameTickDelay$i32(Math.trunc(1000 / iSpeed) | 0);
  return true;
}

function FnSimFlight(_this, X$, Y$, pvrXDir, pvrYDir, pviDensityMin, pviDensityMax, pviIter, precision) {
  const X = [X$];
  const Y = [Y$];
  if (precision === 0) {
    precision = 10;
  }
  MakeAbsCoordinates$pC4PropList$ri32$ri32(_this, P(X, 0), P(Y, 0));
  let XDir = pvrXDir.IsNil() && $.Object_(_this) != null ? $.fixtoi$C4Fixed$i32($.Object_(_this).xdir, precision) : pvrXDir.op_int();
  let YDir = pvrXDir.IsNil() && $.Object_(_this) != null ? $.fixtoi$C4Fixed$i32($.Object_(_this).ydir, precision) : pvrYDir.op_int();
  let iDensityMin = pviDensityMin.IsNil() ? 50 : pviDensityMin.op_int();
  let iDensityMax = pviDensityMax.IsNil() ? 100 : pviDensityMax.op_int();
  const iIter = [pviIter.IsNil() ? -1 : pviIter.op_int()];
  let x = $.itofix$i32(X[0]);
  let y = $.itofix$i32(Y[0]);
  let xdir = $.itofix$i32$i32(XDir, precision);
  let ydir = $.itofix$i32$i32(YDir, precision);
  if (!$.SimFlight(x, y, xdir, ydir, iDensityMin, iDensityMax, P(iIter, 0))) {
    iIter[0] = Math.imul(iIter[0], -1);
  }
  let pResults = new $.C4ValueArray().init$i32(5);
  pResults.SetItem(0, $.C4VInt($.fixtoi$C4Fixed(x)));
  pResults.SetItem(1, $.C4VInt($.fixtoi$C4Fixed(y)));
  pResults.SetItem(2, $.C4VInt($.fixtoi$C4Fixed(xdir.op_mul$i32(precision))));
  pResults.SetItem(3, $.C4VInt($.fixtoi$C4Fixed(ydir.op_mul$i32(precision))));
  pResults.SetItem(4, $.C4VInt(iIter[0]));
  return pResults;
}

function FnLoadScenarioSection(__this, pstrSection, dwFlags) {
  let szSection = null;
  if (pstrSection == null || !($rd(szSection = $.FnStringPar(pstrSection)) !== 0)) {
    return 0;
  }
  return $.Game.LoadScenarioSection(szSection, dwFlags >>> 0) ? 1 : 0;
}

function FnSetViewOffset(__this, player_nr, iX, iY) {
  if (!($.ValidPlr(player_nr | 0) !== 0)) {
    return false;
  }
  let pView = $.Viewports.GetViewport(player_nr | 0);
  if (pView == null) {
    return true;
  }
  pView.SetViewOffset(iX | 0, iY | 0);
  return true;
}

function FnSetPreSend(__this, iToVal, pNewName) {
  if (!$.Control$2.isNetwork()) {
    return true;
  }
  let szClient = $.FnStringPar(pNewName);
  if (szClient == null || szClient.a[szClient.o] === 0 || $.WildcardMatch(szClient, $.Game.Clients.getLocalName())) {
    $.Control$2.Network.setTargetFPS(iToVal | 0);
    $.GraphicsSystem.FlashMessage($.FormatString(S("TargetFPS: %ld"), iToVal).getData());
  }
  return true;
}

function FnGetPlayerID(__this, player_nr) {
  let player = $.Players.Get(player_nr | 0);
  return player != null ? player.ID : 0;
}

function FnGetPlayerTeam(__this, player_nr) {
  let player = $.Players.Get(player_nr | 0);
  if (player == null) {
    return 0;
  }
  let pTeam = $.Game.Teams.GetTeamByPlayerID(player.ID);
  if (pTeam != null) {
    return pTeam.GetID();
  }
  if (player.IsChosingTeam()) {
    return -1;
  }
  return 0;
}

function FnSetPlayerTeam(__this, player_nr$, idNewTeam$, fNoCalls) {
  const player_nr = [player_nr$];
  const idNewTeam = [idNewTeam$];
  if ($.Game.Parameters.isLeague()) {
    return false;
  }
  let player = $.Players.Get(player_nr[0] | 0);
  if (player == null) {
    return false;
  }
  let pPlrInfo = player.GetInfo();
  if (pPlrInfo == null) {
    return false;
  }
  if (player.Team === idNewTeam[0]) {
    return true;
  }
  if (!$.Game.Teams.IsJoin2TeamAllowed(idNewTeam[0] | 0, pPlrInfo.GetType())) {
    return false;
  }
  if (!fNoCalls) {
    if (!$.Game.GRBroadcast(S("~RejectTeamSwitch"), new $.C4AulParSet().init$ri64$ri64(P(player_nr, 0), P(idNewTeam, 0)).op_and(), true, true).op_not()) {
      return false;
    }
  }
  let pOldTeam = $.Game.Teams.GetTeamByPlayerID(player.ID);
  const idOldTeam = [0];
  if (pOldTeam != null) {
    idOldTeam[0] = pOldTeam.GetID();
    pOldTeam.RemovePlayerByID(player.ID);
  }
  if (idNewTeam[0] !== 0) {
    let pNewTeam = $.Game.Teams.GetGenerateTeamByID(idNewTeam[0] | 0);
    if (pNewTeam != null) {
      pNewTeam.AddPlayer(pPlrInfo, true);
      idNewTeam[0] = pNewTeam.GetID();
    } else {
      player.Team = (idNewTeam[0] = 0) | 0;
    }
  }
  if (!fNoCalls) {
    player.SetTeamHostility();
  }
  if (!fNoCalls) {
    $.Game.GRBroadcast(S("~OnTeamSwitch"), new $.C4AulParSet().init$ri64$ri64$ri32(P(player_nr, 0), P(idNewTeam, 0), P(idOldTeam, 0)).op_and(), true);
  }
  return true;
}

function FnGetScriptPlayerExtraID(__this, player_number) {
  let plr = $.Players.Get(player_number | 0);
  if (plr == null) {
    return null;
  }
  let info = plr.GetInfo();
  if (info == null) {
    return null;
  }
  return $.C4Id2Def(info.GetScriptPlayerExtraID());
}

function FnGetTeamConfig(__this, iConfigValue) {
  switch (iConfigValue) {
    case 1:
      return $.Game.Teams.IsCustom() ? 1 : 0;
    case 2:
      return $.Game.Teams.IsMultiTeams() ? 1 : 0;
    case 3:
      return $.Game.Teams.IsHostilityChangeAllowed() ? 1 : 0;
    case 4:
      return $.Game.Teams.GetTeamDist();
    case 5:
      return $.Game.Teams.IsTeamSwitchAllowed() ? 1 : 0;
    case 6:
      return $.Game.Teams.IsAutoGenerateTeams() ? 1 : 0;
    case 7:
      return $.Game.Teams.IsTeamColors() ? 1 : 0;
  }
  $.DebugLogF(S("GetTeamConfig: Unknown config value: %ld"), iConfigValue);
  return 0;
}

function FnGetTeamName(__this, iTeam) {
  let pTeam = $.Game.Teams.GetTeamByID(iTeam | 0);
  if (pTeam == null) {
    return null;
  }
  return $.String_(pTeam.GetName());
}

function FnGetTeamColor(__this, iTeam) {
  let pTeam = $.Game.Teams.GetTeamByID(iTeam | 0);
  return pTeam != null ? pTeam.GetColor() : 0;
}

function FnGetTeamByIndex(__this, iIndex) {
  let pTeam = $.Game.Teams.GetTeamByIndex(iIndex | 0);
  return pTeam != null ? pTeam.GetID() : 0;
}

function FnGetTeamCount(__this) {
  return $.Game.Teams.GetTeamCount();
}

function FnInitScenarioPlayer(__this, player_nr, team_id) {
  let player = $.Players.Get(player_nr | 0);
  if (player == null) {
    return false;
  }
  return player.ScenarioAndTeamInit(team_id | 0);
}

function FnSetScoreboardData(__this, iRowID, iColID, pText, iData) {
  $.Game.Scoreboard.SetCell(iColID | 0, iRowID | 0, pText != null ? pText.GetCStr() : null, iData | 0);
  return true;
}

function FnGetScoreboardString(__this, iRowID, iColID) {
  return $.String_($.Game.Scoreboard.GetCellString(iColID | 0, iRowID | 0));
}

function FnGetScoreboardData(__this, iRowID, iColID) {
  return $.Game.Scoreboard.GetCellData(iColID | 0, iRowID | 0);
}

function FnDoScoreboardShow(__this, change, iForPlr) {
  let player = null;
  if (iForPlr !== 0) {
    if (!((player = $.Players.Get(iForPlr - 1 | 0)) != null)) {
      return false;
    }
    if (!player.LocalControl) {
      return true;
    }
  }
  $.Game.Scoreboard.DoDlgShow(change | 0, false);
  return true;
}

function FnSortScoreboard(__this, iByColID, fReverse) {
  return $.Game.Scoreboard.SortBy(iByColID | 0, !!fReverse);
}

function FnAddEvaluationData(__this, pText, player_id) {
  if (pText == null) {
    return false;
  }
  if (!(pText.GetCStr() != null)) {
    return false;
  }
  if (player_id !== 0 && !($.Game.PlayerInfos.GetPlayerInfoByID$i32(player_id | 0) != null)) {
    return false;
  }
  $.Game.RoundResults.AddCustomEvaluationString(pText.GetCStr(), player_id | 0);
  return true;
}

function FnHideSettlementScoreInEvaluation(__this, fHide) {
  $.Game.RoundResults.HideSettlementScore(fHide);
}

function FnCustomMessage(__this, pMsg, pObj, iOwner, iOffX, iOffY, dwClr, idDeco, pSrc, dwFlags, iHSize) {
  if (pSrc != null) {
    if (!(pSrc.GetDef$v() != null) && !(pSrc.GetObject$v() != null) && !(pSrc.GetPropertyPropList(140 /*P_Source*/) != null) && pObj == null) {
      return false;
    }
  }
  if (pMsg == null) {
    return false;
  }
  if (pObj != null && pObj.Status === 0) {
    return false;
  }
  let szMsg = pMsg.GetCStr();
  if (szMsg == null) {
    return false;
  }
  if (idDeco.op_unsigned_long_C4ID_() != null && !($.C4Id2Def(idDeco.$clone()) != null)) {
    return false;
  }
  if (iOwner.IsNil()) {
    iOwner.op_assign$i64(-1);
  }
  let hpos = $and64n(dwFlags, 112) >>> 0;
  let vpos = $and64n(dwFlags, 138) >>> 0;
  if (((hpos | hpos - 1 >>> 0) >>> 0) + 1 >>> 0 >>> 1 !== hpos) {
    $throw(new $.C4AulExecError().init(S("CustomMessage: Only one horizontal positioning flag allowed")));
  }
  if (((vpos | vpos - 1 >>> 0) >>> 0) + 1 >>> 0 >>> 1 !== vpos) {
    $throw(new $.C4AulExecError().init(S("CustomMessage: Only one vertical positioning flag allowed")));
  }
  if (dwClr === 0) {
    dwClr = 0xffffffff;
  } else {
    dwClr = $or64n($and64n(dwClr, 0xffffff), 0xff000000 - ($or64n(dwClr, 0xff000000) >>> 0) >>> 0);
  }
  let iType = 0;
  if (pObj != null) {
    if (iOwner.op_long() !== -1) {
      iType = 4;
    } else {
      iType = 3;
    }
  } else if (iOwner.op_long() !== -1) {
    iType = 2;
  } else {
    iType = 1;
  }
  let sMsg = new $.StdStrBuf();
  sMsg.Ref$pi8(szMsg);
  if ($and64n(dwFlags, 256) !== 0) {
    sMsg.SplitAtChar(36, null);
  }
  return $.Messages.New$i32$StdStrBuf$pC4Object$i32$i32$i32$u32$C4ID$pC4PropList$u32$i32(iType, sMsg, pObj, iOwner.op_long() | 0, iOffX | 0, iOffY | 0, dwClr >>> 0, idDeco.$clone(), pSrc, dwFlags >>> 0, iHSize | 0);
}

function FnGuiOpen(__this, menu) {
  let window = new $.C4ScriptGuiWindow().init();
  $.Game.ScriptGuiRoot.AddChild$pC4ScriptGuiWindow(window);
  if (!window.CreateFromPropList(menu, true)) {
    $.Game.ScriptGuiRoot.RemoveChild(window, false);
    return 0;
  }
  return window.GetID();
}

function FnGuiUpdateTag(__this, tag, guiID, childID, target) {
  let window = $.Game.ScriptGuiRoot.GetChildByID(guiID);
  if (window == null) {
    return false;
  }
  if (childID !== 0) {
    let subwindow = window.GetSubWindow(childID, target);
    if (subwindow == null) {
      return false;
    }
    subwindow.SetTag(tag);
    return true;
  }
  window.SetTag(tag);
  return true;
}

function FnGuiClose(__this, guiID, childID, target) {
  let window = $.Game.ScriptGuiRoot.GetChildByID(guiID);
  if (window == null) {
    return false;
  }
  if (childID !== 0) {
    let subwindow = window.GetSubWindow(childID, target);
    if (subwindow == null) {
      return false;
    }
    subwindow.Close$v();
    return true;
  }
  window.Close$v();
  return true;
}

function FnGuiUpdate(__this, update, guiID, childID, target) {
  if (update == null) {
    return false;
  }
  let window = $.Game.ScriptGuiRoot.GetChildByID(guiID);
  if (window == null) {
    return false;
  }
  if (childID !== 0) {
    let subwindow = window.GetSubWindow(childID, target);
    if (subwindow == null) {
      return false;
    }
    subwindow.CreateFromPropList(update, false, true);
    return true;
  }
  window.CreateFromPropList(update, false, true);
  return true;
}

function FnPauseGame(__this, fToggle) {
  if ($.Control$2.isReplay()) {
    return true;
  }
  if (fToggle) {
    $.Console.TogglePause();
  } else {
    $.Console.DoHalt();
  }
  return true;
}

function FnSetNextScenario(__this, szNextMission, szNextMissionText, szNextMissionDesc) {
  if (szNextMission == null || !(szNextMission.GetData().getLength() !== 0)) {
    $.Game.NextMission.Clear();
    $.Game.NextMissionText.Clear();
  } else {
    $.Game.NextMission.Copy$StdStrBuf(szNextMission.GetData());
    if (szNextMissionText != null && szNextMissionText.GetCStr() != null) {
      $.Game.NextMissionText.Copy$StdStrBuf(szNextMissionText.GetData());
    } else {
      $.Game.NextMissionText.Copy$pi8($.LoadResStr(S("IDS_BTN_NEXTMISSION")));
    }
    if (szNextMissionDesc != null && szNextMissionDesc.GetCStr() != null) {
      $.Game.NextMissionDesc.Copy$StdStrBuf(szNextMissionDesc.GetData());
    } else {
      $.Game.NextMissionDesc.Copy$pi8($.LoadResStr(S("IDS_DESC_NEXTMISSION")));
    }
  }
  return true;
}

function FnGetPlayerControlState(__this, player_nr, iControl, fMovedState) {
  let pCheckCtrl = null;
  if (player_nr !== -1) {
    let player = $.Players.Get(player_nr | 0);
    if (player != null) {
      pCheckCtrl = player.Control;
    }
  }
  if (pCheckCtrl == null) {
    return 0;
  }
  let pControlState = pCheckCtrl.GetControlDownState(iControl | 0);
  if (pControlState == null) {
    return 0;
  }
  return fMovedState ? pControlState.MovedState.iStrength : pControlState.DownState.iStrength;
}

function FnSetPlayerControlEnabled(__this, iplr, ctrl, is_enabled) {
  let plrctrl = null;
  if (iplr !== -1) {
    let plr = $.Players.Get(iplr | 0);
    if (plr != null) {
      plrctrl = plr.Control;
    }
  }
  if (plrctrl == null) {
    return false;
  }
  if (ctrl >= ($.Game.PlayerControlDefs.GetCount() | 0)) {
    return false;
  }
  return plrctrl.SetControlDisabled(ctrl | 0, !is_enabled);
}

function FnGetPlayerControlEnabled(__this, iplr, ctrl) {
  let plrctrl = null;
  if (iplr !== -1) {
    let plr = $.Players.Get(iplr | 0);
    if (plr != null) {
      plrctrl = plr.Control;
    }
  }
  if (plrctrl == null) {
    return false;
  }
  return !plrctrl.IsControlDisabled(ctrl | 0);
}

function FnGetPlayerControlAssignment(__this, player, control, human_readable, short_name) {
  let plr = $.Players.Get(player | 0);
  if (plr == null) {
    return null;
  }
  if (plr.ControlSet == null) {
    return $.String_(S(""));
  }
  let assignment = plr.ControlSet.GetAssignmentByControl(control | 0);
  if (assignment == null) {
    return $.String_(S(""));
  }
  return $.String_(assignment.GetKeysAsString(human_readable, short_name).getData());
}

function FnPlayRumble(_this, player, strength, length) {
  if (strength <= 0 || strength > 1000) {
    return false;
  }
  if (length <= 0) {
    return false;
  }
  if (player === -1) {
    for (let plr = $.Players.First; plr != null; plr = plr.Next) {
      if (plr.Number !== -1) {
        FnPlayRumble(_this, plr.Number, strength, length);
      }
    }
    return true;
  }
  let plr = $.Players.Get(player | 0);
  if (plr == null) {
    return false;
  }
  if (plr.pGamepad != null) {
    plr.pGamepad.PlayRumble(Math.fround(Math.fround(strength) / 1000), length >>> 0);
  }
  return true;
}

function FnStopRumble(_this, player) {
  if (player === -1) {
    for (let plr = $.Players.First; plr != null; plr = plr.Next) {
      if (plr.Number !== -1) {
        FnStopRumble(_this, plr.Number);
      }
    }
    return true;
  }
  let plr = $.Players.Get(player | 0);
  if (plr == null) {
    return false;
  }
  if (plr.pGamepad != null) {
    plr.pGamepad.StopRumble();
  }
  return true;
}

function FnGetStartupPlayerCount(__this) {
  return $.Game.StartupPlayerCount;
}

function FnGetStartupTeamCount(__this) {
  return $.Game.StartupTeamCount;
}

function FnGainScenarioAchievement(__this, achievement_name, avalue, player, for_scenario) {
  if (achievement_name == null || !(achievement_name.GetData().getLength() !== 0)) {
    return false;
  }
  let value = avalue.IsNil() ? 1 : avalue.op_long();
  let result = true;
  if (!player.IsNil() && player.op_long() !== -1) {
    let plr = $.Players.Get(player.op_long() | 0);
    if (plr == null) {
      return false;
    }
    result = plr.GainScenarioAchievement(achievement_name.GetCStr(), value | 0, for_scenario != null ? for_scenario.GetCStr() : null);
  } else {
    for (let plr = $.Players.First; plr != null; plr = plr.Next) {
      if (!plr.GainScenarioAchievement(achievement_name.GetCStr(), value | 0, for_scenario != null ? for_scenario.GetCStr() : null)) {
        result = false;
      }
    }
  }
  return result;
}

function FnGetPXSCount(_this, iMaterial, iX0, iY0, iWdt, iHgt) {
  if (iX0.IsNil()) {
    if (iMaterial.IsNil() || iMaterial.op_long() === -1) {
      return $.PXS.GetCount$v();
    }
    return $.PXS.GetCount$i32(iMaterial.op_long() | 0);
  } else {
    const x = [iX0.op_long() | 0];
    const y = [iY0.op_long() | 0];
    MakeAbsCoordinates$pC4PropList$ri32$ri32(_this, P(x, 0), P(y, 0));
    return $.PXS.GetCount$i32$i32$i32$i32$i32(iMaterial.IsNil() ? -1 : iMaterial.op_long() | 0, x[0], y[0], iWdt.op_long() | 0, iHgt.op_long() | 0);
  }
}

function FnGetTranslatedString(__this, string_data) {
  return $.Game.GetTranslatedString(string_data, null, false);
}

export function InitGameFunctionMap(pEngine) {
  for (let pCDef = $oat($.C4ScriptGameConstMap, 0); pCDef.Identifier != null; pCDef = $oadd(pCDef, 1)) {
    0;
    pEngine.RegisterGlobalConstant(pCDef.Identifier, $.C4VInt(pCDef.Data | 0));
  }
  let p = pEngine.GetPropList();
  for (let pDef = $oat($.C4ScriptGameFnMap, 0); pDef.Identifier != null; pDef = $oadd(pDef, 1)) {
    new $.C4AulDefFunc().init(p, pDef);
  }
  $.AddFunc$36(p, S("GetX"), FnGetX);
  $.AddFunc$36(p, S("GetY"), FnGetY);
  $.AddFunc$59(p, S("GetDefinition"), FnGetDefinition);
  $.AddFunc$74(p, S("GetDefinitionGroupPath"), FnGetDefinitionGroupPath);
  $.AddFunc$78(p, S("GetPlayerName"), FnGetPlayerName);
  $.AddFunc$187(p, S("GetPlayerType"), FnGetPlayerType);
  $.AddFunc$187(p, S("GetPlayerColor"), FnGetPlayerColor);
  $.AddFunc$36(p, S("GetPlrClonkSkin"), FnGetPlrClonkSkin);
  $.AddFunc$64(p, S("CreateObject"), FnCreateObject);
  $.AddFunc$64(p, S("CreateObjectAbove"), FnCreateObjectAbove);
  $.AddFunc$65(p, S("CreateConstruction"), FnCreateConstruction);
  $.AddFunc$52(p, S("FindConstructionSite"), FnFindConstructionSite);
  $.AddFunc$114(p, S("CheckConstructionSite"), FnCheckConstructionSite);
  $.AddFunc$102(p, S("Sound"), FnSound);
  $.AddFunc$107(p, S("SoundAt"), FnSoundAt);
  $.AddFunc$113(p, S("ChangeSoundModifier"), FnChangeSoundModifier);
  $.AddFunc$110(p, S("SetGlobalSoundModifier"), FnSetGlobalSoundModifier);
  $.AddFunc$104(p, S("Music"), FnMusic);
  $.AddFunc$187(p, S("MusicLevel"), FnMusicLevel);
  $.AddFunc$185(p, S("SetPlayList"), FnSetPlayList);
  $.AddFunc$125(p, S("SetPlrView"), FnSetPlrView);
  $.AddFunc$82(p, S("SetPlrKnowledge"), FnSetPlrKnowledge);
  $.AddFunc$187(p, S("GetPlrViewMode"), FnGetPlrViewMode);
  $.AddFunc$211(p, S("ResetCursorView"), FnResetCursorView);
  $.AddFunc$67(p, S("GetPlrView"), FnGetPlrView);
  $.AddFunc$187(p, S("GetWealth"), FnGetWealth);
  $.AddFunc$129(p, S("SetWealth"), FnSetWealth);
  $.AddFunc$189(p, S("DoPlayerScore"), FnDoPlayerScore);
  $.AddFunc$187(p, S("GetPlayerScore"), FnGetPlayerScore);
  $.AddFunc$187(p, S("GetPlayerScoreGain"), FnGetPlayerScoreGain);
  $.AddFunc$190(p, S("GetWind"), FnGetWind);
  $.AddFunc$210(p, S("SetWind"), FnSetWind);
  $.AddFunc$177(p, S("GetTemperature"), FnGetTemperature);
  $.AddFunc$210(p, S("SetTemperature"), FnSetTemperature);
  $.AddFunc$213(p, S("ShakeFree"), FnShakeFree);
  $.AddFunc$192(p, S("DigFree"), FnDigFree);
  $.AddFunc$196(p, S("DigFreeRect"), FnDigFreeRect);
  $.AddFunc$214(p, S("ClearFreeRect"), FnClearFreeRect);
  $.AddFunc$131(p, S("Hostile"), FnHostile);
  $.AddFunc$132(p, S("SetHostility"), FnSetHostility);
  $.AddFunc$66(p, S("PlaceVegetation"), FnPlaceVegetation);
  $.AddFunc$63(p, S("PlaceAnimal"), FnPlaceAnimal);
  $.AddFunc$123(p, S("GameOver"), FnGameOver);
  $.AddFunc$67(p, S("GetHiRank"), FnGetHiRank);
  $.AddFunc$68(p, S("GetCrew"), FnGetCrew);
  $.AddFunc$187(p, S("GetCrewCount"), FnGetCrewCount);
  $.AddFunc$187(p, S("GetPlayerCount"), FnGetPlayerCount);
  $.AddFunc$189(p, S("GetPlayerByIndex"), FnGetPlayerByIndex);
  $.AddFunc$188(p, S("EliminatePlayer"), FnEliminatePlayer);
  $.AddFunc$123(p, S("SurrenderPlayer"), FnSurrenderPlayer);
  $.AddFunc$173(p, S("GetLeagueScore"), FnGetLeagueScore);
  $.AddFunc$129(p, S("SetLeaguePerformance"), FnSetLeaguePerformance);
  $.AddFunc$106(p, S("SetLeagueProgressData"), FnSetLeagueProgressData);
  $.AddFunc$78(p, S("GetLeagueProgressData"), FnGetLeagueProgressData);
  $.AddFunc$108(p, S("CreateScriptPlayer"), FnCreateScriptPlayer);
  $.AddFunc$67(p, S("GetCursor"), FnGetCursor);
  $.AddFunc$67(p, S("GetViewCursor"), FnGetViewCursor);
  $.AddFunc$125(p, S("SetCursor"), FnSetCursor);
  $.AddFunc$124(p, S("SetViewCursor"), FnSetViewCursor);
  $.AddFunc$189(p, S("GetMaterial"), FnGetMaterial);
  $.AddFunc$189(p, S("GetBackMaterial"), FnGetBackMaterial);
  $.AddFunc$79(p, S("GetTexture"), FnGetTexture);
  $.AddFunc$79(p, S("GetBackTexture"), FnGetBackTexture);
  $.AddFunc$33(p, S("GetAverageTextureColor"), FnGetAverageTextureColor);
  $.AddFunc$188(p, S("GetMaterialCount"), FnGetMaterialCount);
  $.AddFunc$129(p, S("GBackSolid"), FnGBackSolid);
  $.AddFunc$129(p, S("GBackSemiSolid"), FnGBackSemiSolid);
  $.AddFunc$129(p, S("GBackLiquid"), FnGBackLiquid);
  $.AddFunc$129(p, S("GBackSky"), FnGBackSky);
  $.AddFunc$180(p, S("Material"), FnMaterial);
  $.AddFunc$212(p, S("BlastFree"), FnBlastFree);
  $.AddFunc$136(p, S("InsertMaterial"), FnInsertMaterial);
  $.AddFunc$134(p, S("CanInsertMaterial"), FnCanInsertMaterial);
  $.AddFunc$127(p, S("ExecutePXS"), FnExecutePXS);
  $.AddFunc$177(p, S("LandscapeWidth"), FnLandscapeWidth);
  $.AddFunc$177(p, S("LandscapeHeight"), FnLandscapeHeight);
  $.AddFunc$210(p, S("SetAmbientBrightness"), FnSetAmbientBrightness);
  $.AddFunc$177(p, S("GetAmbientBrightness"), FnGetAmbientBrightness);
  $.AddFunc$210(p, S("SetSeason"), FnSetSeason);
  $.AddFunc$177(p, S("GetSeason"), FnGetSeason);
  $.AddFunc$210(p, S("SetClimate"), FnSetClimate);
  $.AddFunc$177(p, S("GetClimate"), FnGetClimate);
  $.AddFunc$135(p, S("SetPlayerZoomByViewRange"), FnSetPlayerZoomByViewRange);
  $.AddFunc$45(p, S("GetPlayerZoomLimits"), FnGetPlayerZoomLimits);
  $.AddFunc$135(p, S("SetPlayerZoom"), FnSetPlayerZoom);
  $.AddFunc$128(p, S("SetPlayerViewLock"), FnSetPlayerViewLock);
  $.AddFunc$122(p, S("DoBaseMaterial"), FnDoBaseMaterial);
  $.AddFunc$122(p, S("DoBaseProduction"), FnDoBaseProduction);
  $.AddFunc$94(p, S("GainScenarioAccess"), FnGainScenarioAccess);
  $.AddFunc$84(p, S("IsNetwork"), FnIsNetwork);
  $.AddFunc$84(p, S("IsEditor"), FnIsEditor);
  $.AddFunc$78(p, S("GetLeague"), FnGetLeague);
  $.AddFunc$128(p, S("TestMessageBoard"), FnTestMessageBoard, false);
  $.AddFunc$90(p, S("CallMessageBoard"), FnCallMessageBoard, false);
  $.AddFunc$91(p, S("AbortMessageBoard"), FnAbortMessageBoard, false);
  $.AddFunc$209(p, S("SetFoW"), FnSetFoW);
  $.AddFunc$187(p, S("SetMaxPlayer"), FnSetMaxPlayer);
  $.AddFunc$67(p, S("Object"), FnObject);
  $.AddFunc$177(p, S("GetTime"), FnGetTime);
  $.AddFunc$94(p, S("GetScenarioAccess"), FnGetScenarioAccess);
  $.AddFunc$78(p, S("MaterialName"), FnMaterialName);
  $.AddFunc$194(p, S("DrawMap"), FnDrawMap);
  $.AddFunc$194(p, S("DrawDefMap"), FnDrawDefMap);
  $.AddFunc$92(p, S("CreateParticle"), FnCreateParticle);
  $.AddFunc$84(p, S("ClearParticles"), FnClearParticles);
  $.AddFunc$94(p, S("SetSky"), FnSetSky);
  $.AddFunc$129(p, S("SetSkyAdjust"), FnSetSkyAdjust);
  $.AddFunc$123(p, S("SetMatAdjust"), FnSetMatAdjust);
  $.AddFunc$186(p, S("GetSkyAdjust"), FnGetSkyAdjust);
  $.AddFunc$177(p, S("GetMatAdjust"), FnGetMatAdjust);
  $.AddFunc$83(p, S("SetSkyParallax"), FnSetSkyParallax);
  $.AddFunc$175(p, S("ReloadDef"), FnReloadDef);
  $.AddFunc$180(p, S("ReloadParticle"), FnReloadParticle);
  $.AddFunc$135(p, S("SetGamma"), FnSetGamma);
  $.AddFunc$123(p, S("ResetGamma"), FnResetGamma);
  $.AddFunc$34(p, S("AddFragmentShader"), FnAddFragmentShader);
  $.AddFunc$123(p, S("RemoveShader"), FnRemoveShader);
  $.AddFunc$177(p, S("FrameCounter"), FnFrameCounter);
  $.AddFunc$109(p, S("DrawMaterialQuad"), FnDrawMaterialQuad);
  $.AddFunc$123(p, S("SetFilmView"), FnSetFilmView);
  $.AddFunc$100(p, S("AddMsgBoardCmd"), FnAddMsgBoardCmd);
  $.AddFunc$123(p, S("SetGameSpeed"), FnSetGameSpeed, false);
  $.AddFunc$198(p, S("DrawMatChunks"), FnDrawMatChunks, false);
  $.AddFunc$37(p, S("GetPathLength"), FnGetPathLength);
  $.AddFunc$184(p, S("SetTextureIndex"), FnSetTextureIndex);
  $.AddFunc$177(p, S("RemoveUnusedTexMapEntries"), FnRemoveUnusedTexMapEntries);
  $.AddFunc$55(p, S("SimFlight"), FnSimFlight);
  $.AddFunc$183(p, S("LoadScenarioSection"), FnLoadScenarioSection);
  $.AddFunc$133(p, S("SetViewOffset"), FnSetViewOffset);
  $.AddFunc$126(p, S("SetPreSend"), FnSetPreSend, false);
  $.AddFunc$187(p, S("GetPlayerID"), FnGetPlayerID);
  $.AddFunc$187(p, S("GetPlayerTeam"), FnGetPlayerTeam);
  $.AddFunc$131(p, S("SetPlayerTeam"), FnSetPlayerTeam);
  $.AddFunc$45(p, S("GetScriptPlayerExtraID"), FnGetScriptPlayerExtraID);
  $.AddFunc$187(p, S("GetTeamConfig"), FnGetTeamConfig);
  $.AddFunc$78(p, S("GetTeamName"), FnGetTeamName);
  $.AddFunc$187(p, S("GetTeamColor"), FnGetTeamColor);
  $.AddFunc$187(p, S("GetTeamByIndex"), FnGetTeamByIndex);
  $.AddFunc$177(p, S("GetTeamCount"), FnGetTeamCount);
  $.AddFunc$129(p, S("InitScenarioPlayer"), FnInitScenarioPlayer, false);
  $.AddFunc$130(p, S("SetScoreboardData"), FnSetScoreboardData);
  $.AddFunc$79(p, S("GetScoreboardString"), FnGetScoreboardString, false);
  $.AddFunc$174(p, S("GetScoreboardData"), FnGetScoreboardData, false);
  $.AddFunc$129(p, S("DoScoreboardShow"), FnDoScoreboardShow);
  $.AddFunc$128(p, S("SortScoreboard"), FnSortScoreboard);
  $.AddFunc$106(p, S("AddEvaluationData"), FnAddEvaluationData);
  $.AddFunc$208(p, S("HideSettlementScoreInEvaluation"), FnHideSettlementScoreInEvaluation);
  $.AddFunc$195(p, S("ExtractMaterialAmount"), FnExtractMaterialAmount);
  $.AddFunc$95(p, S("CustomMessage"), FnCustomMessage);
  $.AddFunc$169(p, S("GuiOpen"), FnGuiOpen);
  $.AddFunc$105(p, S("GuiUpdateTag"), FnGuiUpdateTag);
  $.AddFunc$120(p, S("GuiClose"), FnGuiClose);
  $.AddFunc$115(p, S("GuiUpdate"), FnGuiUpdate);
  $.AddFunc$117(p, S("PauseGame"), FnPauseGame, false);
  $.AddFunc$135(p, S("PathFree"), FnPathFree);
  $.AddFunc$56(p, S("PathFree2"), FnPathFree2);
  $.AddFunc$101(p, S("SetNextScenario"), FnSetNextScenario);
  $.AddFunc$190(p, S("GetPlayerControlState"), FnGetPlayerControlState);
  $.AddFunc$131(p, S("SetPlayerControlEnabled"), FnSetPlayerControlEnabled);
  $.AddFunc$129(p, S("GetPlayerControlEnabled"), FnGetPlayerControlEnabled);
  $.AddFunc$80(p, S("GetPlayerControlAssignment"), FnGetPlayerControlAssignment);
  $.AddFunc$133(p, S("PlayRumble"), FnPlayRumble);
  $.AddFunc$123(p, S("StopRumble"), FnStopRumble);
  $.AddFunc$166(p, S("GetStartupPlayerCount"), FnGetStartupPlayerCount);
  $.AddFunc$166(p, S("GetStartupTeamCount"), FnGetStartupTeamCount);
  $.AddFunc$62(p, S("EditCursor"), FnEditCursor);
  $.AddFunc$93(p, S("GainScenarioAchievement"), FnGainScenarioAchievement);
  $.AddFunc$176(p, S("GetPXSCount"), FnGetPXSCount);
  $.AddFunc$8(p, S("GetPlrKnowledge"), FnGetPlrKnowledge);
  $.AddFunc$8(p, S("GetBaseMaterial"), FnGetBaseMaterial);
  $.AddFunc$8(p, S("GetBaseProduction"), FnGetBaseProduction);
  $.AddFunc$4(p, S("GetDefCoreVal"), FnGetDefCoreVal);
  $.AddFunc$13(p, S("GetObjectVal"), FnGetObjectVal);
  $.AddFunc$13(p, S("GetObjectInfoCoreVal"), FnGetObjectInfoCoreVal);
  $.AddFunc$4(p, S("GetScenarioVal"), FnGetScenarioVal);
  $.AddFunc$5(p, S("GetPlayerVal"), FnGetPlayerVal);
  $.AddFunc$5(p, S("GetPlayerInfoCoreVal"), FnGetPlayerInfoCoreVal);
  $.AddFunc$5(p, S("GetMaterialVal"), FnGetMaterialVal);
  $.AddFunc$10(p, S("SetPlrExtraData"), FnSetPlrExtraData);
  $.AddFunc$9(p, S("GetPlrExtraData"), FnGetPlrExtraData);
  $.AddFunc$47(p, S("PV_Linear"), FnPV_Linear);
  $.AddFunc$49(p, S("PV_Random"), FnPV_Random);
  $.AddFunc$46(p, S("PV_Direction"), FnPV_Direction);
  $.AddFunc$49(p, S("PV_Step"), FnPV_Step);
  $.AddFunc$47(p, S("PV_Speed"), FnPV_Speed);
  $.AddFunc$47(p, S("PV_Wind"), FnPV_Wind);
  $.AddFunc$47(p, S("PV_Gravity"), FnPV_Gravity);
  $.AddFunc$48(p, S("PV_Sin"), FnPV_Sin);
  $.AddFunc$48(p, S("PV_Cos"), FnPV_Cos);
  $.AddFunc$50(p, S("PC_Die"), FnPC_Die);
  $.AddFunc$46(p, S("PC_Bounce"), FnPC_Bounce);
  $.AddFunc$50(p, S("PC_Stop"), FnPC_Stop);
  $.AddFunc$133(p, S("IncinerateLandscape"), FnIncinerateLandscape);
  $.AddFunc$177(p, S("GetGravity"), FnGetGravity);
  $.AddFunc$210(p, S("SetGravity"), FnSetGravity);
  $.AddFunc$75(p, S("GetTranslatedString"), FnGetTranslatedString);
}



export function $init(): void {
  $.PLRZOOM_Direct$C4GameScript = 1;
  $.PLRZOOM_NoIncrease$C4GameScript = 4;
  $.PLRZOOM_NoDecrease$C4GameScript = 8;
  $.PLRZOOM_LimitMin$C4GameScript = 16;
  $.PLRZOOM_LimitMax$C4GameScript = 32;
  $.PLRZOOM_Set$C4GameScript = 64;
  $.CSPF_FixedAttributes$C4GameScript = 1;
  $.CSPF_NoScenarioInit$C4GameScript = 2;
  $.CSPF_NoEliminationCheck$C4GameScript = 4;
  $.CSPF_Invisible$C4GameScript = 8;
  $.CSPF_NoScenarioSave$C4GameScript = 16;
  $.DMQ_Sky$C4GameScript = 0;
  $.DMQ_Sub$C4GameScript = 1;
  $.DMQ_Bridge$C4GameScript = 2;
  $.C4ScriptGameConstMap = $own([
  ((($o) => ($o.Identifier = S("NO_OWNER"), $o.ValType = 1 /*C4V_Int*/, $o.Data = -1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4M_Vehicle"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 100, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4M_Solid"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 50, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4M_SemiSolid"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 25, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4M_Liquid"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 25, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4M_Background"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 0, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("SBRD_Caption"), $o.ValType = 1 /*C4V_Int*/, $o.Data = -1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("TEAM_Custom"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("TEAM_Active"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 2, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("TEAM_AllowHostilityChange"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 3, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("TEAM_Dist"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 4, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("TEAM_AllowTeamSwitch"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 5, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("TEAM_AutoGenerateTeams"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 6, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("TEAM_TeamColors"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 7, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4FO_Not"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4FO_And"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 2, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4FO_Or"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 3, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4FO_Exclude"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 4, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4FO_InRect"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 5, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4FO_AtPoint"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 6, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4FO_AtRect"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 7, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4FO_OnLine"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 8, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4FO_Distance"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 9, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4FO_ID"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 10, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4FO_OCF"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 11, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4FO_Category"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 12, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4FO_Action"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 13, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4FO_ActionTarget"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 14, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4FO_Procedure"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 15, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4FO_Container"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 16, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4FO_AnyContainer"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 17, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4FO_Owner"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 18, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4FO_Controller"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 19, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4FO_Func"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 20, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4FO_Layer"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 21, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4FO_InArray"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 22, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4FO_Property"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 23, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4FO_AnyLayer"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 24, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4FO_Cone"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 25, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("MD_DragSource"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("MD_DropTarget"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 2, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("MD_NoClick"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 4, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4SO_Reverse"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 31, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4SO_Multiple"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 32, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4SO_Distance"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 33, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4SO_Random"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 34, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4SO_Speed"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 35, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4SO_Mass"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 36, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4SO_Value"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 37, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4SO_Func"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 38, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4SECT_SaveLandscape"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4SECT_SaveObjects"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 2, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4SECT_KeepEffects"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 4, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4SECT_ReinitScenario"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 8, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("TEAMID_New"), $o.ValType = 1 /*C4V_Int*/, $o.Data = -1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("MSG_NoLinebreak"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("MSG_Bottom"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 2, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("MSG_Multiple"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 4, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("MSG_Top"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 8, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("MSG_Left"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 16, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("MSG_Right"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 32, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("MSG_HCenter"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 64, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("MSG_VCenter"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 128, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("MSG_DropSpeech"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 256, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("MSG_WidthRel"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 512, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("MSG_XRel"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 1024, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("MSG_YRel"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 2048, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("MSG_Zoom"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 4096, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4PT_User"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4PT_Script"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 2, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("CSPF_FixedAttributes"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("CSPF_NoScenarioInit"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 2, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("CSPF_NoEliminationCheck"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 4, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("CSPF_Invisible"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 8, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("CSPF_NoScenarioSave"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 16, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("DMQ_Sky"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 0, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("DMQ_Sub"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("DMQ_Bridge"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 2, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("PLRZOOM_Direct"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("PLRZOOM_NoIncrease"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 4, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("PLRZOOM_NoDecrease"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 8, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("PLRZOOM_LimitMin"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 16, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("PLRZOOM_LimitMax"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 32, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("PLRZOOM_Set"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 64, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("ATTACH_Front"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("ATTACH_Back"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 2, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("ATTACH_MoveRelative"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 4, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4SMT_Reverb"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4SMT_Echo"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 4, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4SMT_Equalizer"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 12, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("GUI_SetTag"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("GUI_Call"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 2, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("GUI_GridLayout"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("GUI_TightGridLayout"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 1024, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("GUI_VerticalLayout"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 2, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("GUI_TextVCenter"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 4, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("GUI_TextHCenter"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 8, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("GUI_TextRight"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 16, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("GUI_TextBottom"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 32, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("GUI_TextTop"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 0, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("GUI_TextLeft"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 0, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("GUI_FitChildren"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 64, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("GUI_Multiple"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 128, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("GUI_IgnoreMouse"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 256, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("GUI_NoCrop"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 512, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("CONS_Down"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 0, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("CONS_Up"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("CONS_Moved"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 2, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("PLRCON_MaxStrength"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 32767, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = null, $o.ValType = 0 /*C4V_Nil*/, $o.Data = 0, $o))(new $.C4ScriptConstDef())),
]);
  $.C4ScriptGameFnMap = $own([
  ((($o) => ($o.Identifier = S("FindObject"), $o.Public = true, $o.RetType = 11 /*C4V_Object*/, $o.ParType = new Int32Array([5, 10, 10, 10, 10, 10, 10, 10, 10, 10]), $o.FunctionC4V = FnFindObject, $o))(new $.C4ScriptFnDef())),
  ((($o) => ($o.Identifier = S("FindObjects"), $o.Public = true, $o.RetType = 5 /*C4V_Array*/, $o.ParType = new Int32Array([5, 10, 10, 10, 10, 10, 10, 10, 10, 10]), $o.FunctionC4V = FnFindObjects, $o))(new $.C4ScriptFnDef())),
  ((($o) => ($o.Identifier = S("ObjectCount"), $o.Public = true, $o.RetType = 1 /*C4V_Int*/, $o.ParType = new Int32Array([5, 10, 10, 10, 10, 10, 10, 10, 10, 10]), $o.FunctionC4V = FnObjectCount, $o))(new $.C4ScriptFnDef())),
  ((($o) => ($o.Identifier = S("GameCallEx"), $o.Public = true, $o.RetType = 10 /*C4V_Any*/, $o.ParType = new Int32Array([4, 10, 10, 10, 10, 10, 10, 10, 10, 10]), $o.FunctionC4V = FnGameCallEx, $o))(new $.C4ScriptFnDef())),
  ((($o) => ($o.Identifier = S("PlayerMessage"), $o.Public = true, $o.RetType = 1 /*C4V_Int*/, $o.ParType = new Int32Array([1, 4, 10, 10, 10, 10, 10, 10, 10, 10]), $o.FunctionC4V = FnPlayerMessage, $o))(new $.C4ScriptFnDef())),
  ((($o) => ($o.Identifier = S("Message"), $o.Public = true, $o.RetType = 2 /*C4V_Bool*/, $o.ParType = new Int32Array([4, 10, 10, 10, 10, 10, 10, 10, 10, 10]), $o.FunctionC4V = FnMessage, $o))(new $.C4ScriptFnDef())),
  ((($o) => ($o.Identifier = S("AddMessage"), $o.Public = true, $o.RetType = 2 /*C4V_Bool*/, $o.ParType = new Int32Array([4, 10, 10, 10, 10, 10, 10, 10, 10, 10]), $o.FunctionC4V = FnAddMessage, $o))(new $.C4ScriptFnDef())),
  ((($o) => ($o.Identifier = S("PV_KeyFrames"), $o.Public = true, $o.RetType = 5 /*C4V_Array*/, $o.ParType = new Int32Array([1, 10, 10, 10, 10, 10, 10, 10, 10, 10]), $o.FunctionC4V = FnPV_KeyFrames, $o))(new $.C4ScriptFnDef())),
  ((($o) => ($o.Identifier = null, $o.Public = false, $o.RetType = 0 /*C4V_Nil*/, $o.ParType = new Int32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]), $o.FunctionC4V = null, $o))(new $.C4ScriptFnDef())),
]);
}

Object.assign($, { AssignController, C4ValueCompiler, C4ValueGetCompiler, CreateCriterionsFromPars, FnAbortMessageBoard, FnAddEvaluationData, FnAddFragmentShader, FnAddMessage, FnAddMsgBoardCmd, FnBlastFree, FnCallMessageBoard, FnCanInsertMaterial, FnChangeSoundModifier, FnCheckConstructionSite, FnClearFreeRect, FnClearParticles, FnCreateConstruction, FnCreateObject, FnCreateObjectAbove, FnCreateParticle, FnCreateScriptPlayer, FnCustomMessage, FnDigFree, FnDigFreeRect, FnDoBaseMaterial, FnDoBaseProduction, FnDoPlayerScore, FnDoScoreboardShow, FnDrawDefMap, FnDrawMap, FnDrawMatChunks, FnDrawMaterialQuad, FnEditCursor, FnEliminatePlayer, FnExecutePXS, FnExtractMaterialAmount, FnFindConstructionSite, FnFindObject, FnFindObjects, FnFrameCounter, FnGBackLiquid, FnGBackSemiSolid, FnGBackSky, FnGBackSolid, FnGainScenarioAccess, FnGainScenarioAchievement, FnGameCallEx, FnGameOver, FnGetAmbientBrightness, FnGetAverageTextureColor, FnGetBackMaterial, FnGetBackTexture, FnGetBaseMaterial, FnGetBaseProduction, FnGetClimate, FnGetCrew, FnGetCrewCount, FnGetCursor, FnGetDefCoreVal, FnGetDefinition, FnGetDefinitionGroupPath, FnGetEffectsFor, FnGetGravity, FnGetHiRank, FnGetLeague, FnGetLeagueProgressData, FnGetLeagueScore, FnGetMatAdjust, FnGetMaterial, FnGetMaterialCount, FnGetMaterialVal, FnGetObjectInfoCoreVal, FnGetObjectVal, FnGetPXSCount, FnGetPathLength, FnGetPlayerByIndex, FnGetPlayerColor, FnGetPlayerControlAssignment, FnGetPlayerControlEnabled, FnGetPlayerControlState, FnGetPlayerCount, FnGetPlayerID, FnGetPlayerInfoCoreVal, FnGetPlayerName, FnGetPlayerScore, FnGetPlayerScoreGain, FnGetPlayerTeam, FnGetPlayerType, FnGetPlayerVal, FnGetPlayerZoomLimits, FnGetPlrClonkSkin, FnGetPlrExtraData, FnGetPlrKnowledge, FnGetPlrView, FnGetPlrViewMode, FnGetScenarioAccess, FnGetScenarioVal, FnGetScoreboardData, FnGetScoreboardString, FnGetScriptPlayerExtraID, FnGetSeason, FnGetSkyAdjust, FnGetStartupPlayerCount, FnGetStartupTeamCount, FnGetTeamByIndex, FnGetTeamColor, FnGetTeamConfig, FnGetTeamCount, FnGetTeamName, FnGetTemperature, FnGetTexture, FnGetTime, FnGetTranslatedString, FnGetViewCursor, FnGetWealth, FnGetWind, FnGetX, FnGetY, FnGuiClose, FnGuiOpen, FnGuiUpdate, FnGuiUpdateTag, FnHideSettlementScoreInEvaluation, FnHostile, FnIncinerateLandscape, FnInitScenarioPlayer, FnInsertMaterial, FnIsEditor, FnIsNetwork, FnLandscapeHeight, FnLandscapeWidth, FnLoadScenarioSection, FnMaterial, FnMaterialName, FnMessage, FnMusic, FnMusicLevel, FnObject, FnObjectCount, FnPC_Bounce, FnPC_Die, FnPC_Stop, FnPV_Cos, FnPV_Direction, FnPV_Gravity, FnPV_KeyFrames, FnPV_Linear, FnPV_Random, FnPV_Sin, FnPV_Speed, FnPV_Step, FnPV_Wind, FnPathFree, FnPathFree2, FnPauseGame, FnPlaceAnimal, FnPlaceVegetation, FnPlayRumble, FnPlayerMessage, FnReloadDef, FnReloadParticle, FnRemoveShader, FnRemoveUnusedTexMapEntries, FnResetCursorView, FnResetGamma, FnSetAmbientBrightness, FnSetClimate, FnSetCursor, FnSetFilmView, FnSetFoW, FnSetGameSpeed, FnSetGamma, FnSetGlobalSoundModifier, FnSetGravity, FnSetHostility, FnSetLeaguePerformance, FnSetLeagueProgressData, FnSetMatAdjust, FnSetMaxPlayer, FnSetNextScenario, FnSetPlayList, FnSetPlayerControlEnabled, FnSetPlayerTeam, FnSetPlayerViewLock, FnSetPlayerZoom, FnSetPlayerZoomByViewRange, FnSetPlrExtraData, FnSetPlrKnowledge, FnSetPlrView, FnSetPreSend, FnSetScoreboardData, FnSetSeason, FnSetSky, FnSetSkyAdjust, FnSetSkyParallax, FnSetTemperature, FnSetTextureIndex, FnSetViewCursor, FnSetViewOffset, FnSetWealth, FnSetWind, FnShakeFree, FnSimFlight, FnSortScoreboard, FnSound, FnSoundAt, FnStopRumble, FnSurrenderPlayer, FnTestMessageBoard, GetTextureName, GetValByStdCompiler$pi8$pi8$i32$C4MaterialCore, GetValByStdCompiler$pi8$pi8$i32$C4PlayerInfoCore, GetValByStdCompiler$pi8$pi8$i32$StdNamingAdapt$C4Def, GetValByStdCompiler$pi8$pi8$i32$StdNamingAdapt$C4ObjectInfoCore, GetValByStdCompiler$pi8$pi8$i32$StdNamingAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers, GetValByStdCompiler$pi8$pi8$i32$StdNamingAdapt$StdParameterAdapt$C4Player$pC4ValueNumbers, GetValByStdCompiler$pi8$pi8$i32$StdParameterAdapt$C4Scenario$b, GetValidOwner, InitGameFunctionMap, MakeAbsCoordinates$pC4PropList$ri32$ri32, MakeAbsCoordinates$pC4PropList$ri64$ri64, PathInfo, SumPathLength });
