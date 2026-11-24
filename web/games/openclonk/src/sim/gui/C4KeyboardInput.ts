// @ts-nocheck
// OpenClonk 36de799: src/gui/C4KeyboardInput.cpp, src/gui/C4KeyboardInput.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $and64n, $u64n } from '../../rt/int.ts';
import { c$isdigit, c$sscanf, c$strcmp, c$strncasecmp } from '../../rt/libc.ts';
import { $oadd, $oarr, $oat, $own, $padd, $rd, $reinterpVoid, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $begin, $delete, $end, $fill_list, $itcopy, $regex_match, $throw, $vpush, HashMap, Regex, RegexMatch, StdMap, StdMultiMap, StdPair, StdString, seq_equal, seq_erase, std_find, std_find_if } from '../../rt/std.ts';

export class C4KeyShiftMapEntry {
  eShift = 0;
  szName = null;

  $clone() { return new C4KeyShiftMapEntry().$assign(this); }
  $assign(o) {
    this.eShift = o.eShift;
    this.szName = o.szName;
    return this;
  }
}

export class C4KeyCodeMapEntry {
  wCode = 0;
  szName = null;
  szShortName = null;

  $clone() { return new C4KeyCodeMapEntry().$assign(this); }
  $assign(o) {
    this.wCode = o.wCode;
    this.szName = o.szName;
    this.szShortName = o.szShortName;
    return this;
  }
}

export class C4KeyCodeEx {
  Key = 0;
  dwShift = 0;
  deviceId = 0;
  fRepeated = false;

  static String2KeyShift(sName) {
    let pCheck = $oat($.KeyShiftMap$C4KeyboardInput, 0);
    while (pCheck.szName != null) {
      if ($.SEqualNoCase(sName.getData(), pCheck.szName)) {
        break;
      } else {
        pCheck = $oadd(pCheck, 1);
      }
    }
    return pCheck.eShift;
  }

  static String2KeyCode(sName) {
    if (sName.getLength() > 1) {
      const dwRVal = [0];
      if (c$sscanf(sName.getData(), S("\\x%x"), P(dwRVal, 0)) === 1) {
        return dwRVal[0];
      }
      if ($rd(sName.getData()) === 36) {
        return C4KeyCodeEx.GetKeyByScanCode(sName.getData());
      }
      let controller_re = new Regex(S("^Controller(\\w+)$"));
      let matches = new RegexMatch();
      if ($regex_match(sName.getData(), matches, controller_re)) {
        let keycode_it = $.controllercodes$C4KeyboardInput.find(matches.at(1).str());
        if (!keycode_it.eq($.controllercodes$C4KeyboardInput.end())) {
          return KEY_Gamepad(keycode_it.v.second & 0xff);
        } else {
          return 0xfffffffffffffffe;
        }
      }
      let is_mouse_key = false;
      is_mouse_key = !(c$strncasecmp(sName.getData(), S("Mouse"), 5) !== 0);
      if (is_mouse_key) {
        let key_str = $padd(sName.getData(), 5);
        const mouse_id = [0];
        if (c$sscanf(key_str, S("%d"), P(mouse_id, 0)) === 1) {
          while (c$isdigit(key_str.a[key_str.o]) !== 0) {
            key_str = key_str.add(1);
          }
          if (!($.stricmp(key_str, S("Move")) !== 0)) {
            return KEY_Mouse(mouse_id[0] & 0xff, 1);
          }
          if (!($.stricmp(key_str, S("Wheel1Up")) !== 0)) {
            return KEY_Mouse(mouse_id[0] & 0xff, 64);
          }
          if (!($.stricmp(key_str, S("Wheel1Down")) !== 0)) {
            return KEY_Mouse(mouse_id[0] & 0xff, 65);
          }
          if ($.SEqualNoCase(key_str, S("Button"), 6)) {
            key_str = key_str.add(6);
          }
          let mouseevent_id = 0;
          if ($.SEqualNoCase(key_str, S("Left"), 4)) {
            mouseevent_id = 16;
            key_str = key_str.add(4);
          } else if ($.SEqualNoCase(key_str, S("Right"), 5)) {
            mouseevent_id = 17;
            key_str = key_str.add(5);
          } else if ($.SEqualNoCase(key_str, S("Middle"), 6)) {
            mouseevent_id = 18;
            key_str = key_str.add(6);
          } else if ($.SEqualNoCase(key_str, S("X1"), 2)) {
            mouseevent_id = 19;
            key_str = key_str.add(2);
          } else if ($.SEqualNoCase(key_str, S("X2"), 2)) {
            mouseevent_id = 20;
            key_str = key_str.add(2);
          } else if (c$isdigit(key_str.a[key_str.o]) !== 0) {
            const button_index = [0];
            if (c$sscanf(key_str, S("%d"), P(button_index, 0)) === 1) {
              mouseevent_id = 16 + $u64n(button_index[0]) & 0xff;
              while (c$isdigit(key_str.a[key_str.o]) !== 0) {
                key_str = key_str.add(1);
              }
            }
          }
          if (mouseevent_id !== 0) {
            if (key_str.a[key_str.o] === 0) {
              return KEY_Mouse(mouse_id[0] & 0xff, mouseevent_id);
            }
            if (!($.stricmp(key_str, S("Double")) !== 0)) {
              return KEY_Mouse(mouse_id[0] & 0xff, mouseevent_id + 32 & 0xff);
            }
          }
        }
      }
    }
    let pCheck = $oat($.KeyCodeMap$C4KeyboardInput, 0);
    while (pCheck.szName != null) {
      if ($.SEqualNoCase(sName.getData(), pCheck.szName)) {
        return pCheck.wCode;
      }
      pCheck = $oadd(pCheck, 1);
    }
    return 0xfffffffffffffffe;
  }

  KeyCode2String() { /* not translated: display name of a key (GUI only); the page uses the browser key names */ }

  ToString(fHumanReadable, fShort) {
    if (!('C4KeyCodeEx$ToString$sResult' in $)) $.C4KeyCodeEx$ToString$sResult = new $.StdStrBuf();
    $.C4KeyCodeEx$ToString$sResult.Clear();
    for (let dwShiftCheck = 1; dwShiftCheck <= 4; dwShiftCheck = (dwShiftCheck << 1) >>> 0) {
      if ((dwShiftCheck & this.dwShift) >>> 0 !== 0) {
        $.C4KeyCodeEx$ToString$sResult.Append$StdStrBuf(C4KeyCodeEx.KeyShift2String(dwShiftCheck | 0));
        $.C4KeyCodeEx$ToString$sResult.AppendChar(43);
      }
    }
    if ($.C4KeyCodeEx$ToString$sResult.getLength() !== 0) {
      $.C4KeyCodeEx$ToString$sResult.Append$StdStrBuf(C4KeyCodeEx.KeyCode2String(this.Key, fHumanReadable, fShort));
      return new $.StdStrBuf().init$rStdStrBuf$b($.C4KeyCodeEx$ToString$sResult);
    } else {
      return C4KeyCodeEx.KeyCode2String(this.Key, fHumanReadable, fShort);
    }
  }

  static KeyShift2String(eShift) {
    let pCheck = $oat($.KeyShiftMap$C4KeyboardInput, 0);
    while (pCheck.szName != null) {
      if (eShift === pCheck.eShift) {
        break;
      } else {
        pCheck = $oadd(pCheck, 1);
      }
    }
    return new $.StdStrBuf().init$pi8$b(pCheck.szName);
  }

  op_lt(v2) {
    return this.Key < v2.Key || this.Key === v2.Key && this.dwShift < v2.dwShift;
  }

  op_eq(v2) {
    return this.Key === v2.Key && this.dwShift === v2.dwShift;
  }

  CompileFunc(pComp, pOutBuf = null) {
    if (pComp.isDeserializer()) {
      let sCode = new $.StdStrBuf();
      let is_scan_code = false;
      let dwSetShift = 0;
      for (; ; ) {
        is_scan_code = pComp.Separator(12 /*SEP_DOLLAR*/);
        if (!is_scan_code) {
          pComp.NoSeparator();
        }
        pComp.Value$StdParameterAdapt$StdStrBuf$i32$2($.mkParAdapt$rStdStrBuf$mi32(sCode, 2 /*RCT_Idtf*/));
        if (is_scan_code) {
          sCode.Take$mStdStrBuf($.FormatString(S("$%s"), sCode.getData()));
          break;
        }
        if (!pComp.Separator(6 /*SEP_PLUS*/)) {
          break;
        }
        let eAddState = C4KeyCodeEx.String2KeyShift(sCode);
        if (eAddState === 65535) {
          pComp.excCorrupt(S("undefined key shift state: %s"), sCode.getData());
        }
        dwSetShift = (dwSetShift | eAddState >>> 0) >>> 0;
      }
      if (sCode.getLength() !== 0) {
        let eCode = C4KeyCodeEx.String2KeyCode(sCode);
        if (eCode === 0xfffffffffffffffe) {
          if (pOutBuf != null) {
            eCode = 0;
          } else {
            pComp.excCorrupt(S("undefined key code: %s"), sCode.getData());
          }
        }
        this.dwShift = dwSetShift;
        this.Key = eCode;
        if (pOutBuf != null) {
          if (eCode === 0) {
            pOutBuf.Take$mStdStrBuf(sCode);
          } else {
            pOutBuf.Copy$StdStrBuf(this.ToString(false, false));
          }
        }
      }
    } else {
      for (let dwShiftCheck = 1; dwShiftCheck <= 4; dwShiftCheck = (dwShiftCheck << 1) >>> 0) {
        if ((dwShiftCheck & this.dwShift) >>> 0 !== 0) {
          pComp.Value$StdDecompileAdapt$StdStrBuf($.mkDecompileAdapt$StdStrBuf(C4KeyCodeEx.KeyShift2String(dwShiftCheck | 0)));
          pComp.Separator(6 /*SEP_PLUS*/);
        }
      }
      pComp.Value$StdDecompileAdapt$StdStrBuf($.mkDecompileAdapt$StdStrBuf(C4KeyCodeEx.KeyCode2String(this.Key, false, false)));
    }
  }

  init(key = 0, Shift = 0, fIsRepeated = false, deviceId = -1) {
    this.Key = key;
    this.dwShift = Shift;
    this.deviceId = deviceId;
    this.fRepeated = fIsRepeated;
    return this;
  }

  static FromC4MC(mouse_id, iButton, dwKeyParam, is_down = null) {
    const dummy = [false];
    if (is_down == null) {
      is_down = P(dummy, 0);
    }
    is_down.a[is_down.o] = true;
    let mouseevent_code = 0;
    let wheel_dir = 0;
    if (iButton === 7) {
      wheel_dir = (dwKeyParam >>> 16) << 16 >> 16;
    }
    switch (iButton) {
      case 0:
        mouseevent_code = 1;
        break;
      case 1:
        mouseevent_code = 16;
        break;
      case 2:
        mouseevent_code = 16;
        is_down.a[is_down.o] = false;
        break;
      case 5:
        mouseevent_code = 48;
        break;
      case 3:
        mouseevent_code = 17;
        break;
      case 6:
        mouseevent_code = 49;
        break;
      case 4:
        mouseevent_code = 17;
        is_down.a[is_down.o] = false;
        break;
      case 8:
        mouseevent_code = 18;
        break;
      case 9:
        mouseevent_code = 18;
        is_down.a[is_down.o] = false;
        break;
      case 10:
        mouseevent_code = 50;
        break;
      case 11:
        mouseevent_code = 19;
        break;
      case 12:
        mouseevent_code = 19;
        is_down.a[is_down.o] = false;
        break;
      case 13:
        mouseevent_code = 51;
        break;
      case 14:
        mouseevent_code = 20;
        break;
      case 15:
        mouseevent_code = 20;
        is_down.a[is_down.o] = false;
        break;
      case 16:
        mouseevent_code = 52;
        break;
      case 7:
        if (wheel_dir === 0) {
          0;
        }
        mouseevent_code = wheel_dir > 0 ? $.KEY_MOUSE_Wheel1Up$C4KeyboardInput : $.KEY_MOUSE_Wheel1Down$C4KeyboardInput;
        break;
    }
    let key = new C4KeyCodeEx().init(KEY_Mouse(mouse_id & 0xff, mouseevent_code & 0xff), 0);
    if ((dwKeyParam & 0) >>> 0 !== 0) {
      key.dwShift = (key.dwShift | 2) >>> 0;
    }
    if ((dwKeyParam & 0) >>> 0 !== 0) {
      key.dwShift = (key.dwShift | 4) >>> 0;
    }
    if ((dwKeyParam & 0) >>> 0 !== 0) {
      key.dwShift = (key.dwShift | 1) >>> 0;
    }
    return key;
  }

  IsRepeated() {
    return this.fRepeated;
  }

  FixShiftKeys() {
    if ((this.dwShift & 1) >>> 0 !== 0 && (this.Key === 56 || this.Key === 100)) {
      this.dwShift = (this.dwShift & 0xfffffffe) >>> 0;
    }
    if ((this.dwShift & 2) >>> 0 !== 0 && (this.Key === 29 || this.Key === 97)) {
      this.dwShift = (this.dwShift & 0xfffffffd) >>> 0;
    }
    if ((this.dwShift & 4) >>> 0 !== 0 && (this.Key === 42 || this.Key === 54)) {
      this.dwShift = (this.dwShift & 0xfffffffb) >>> 0;
    }
  }

  static GetKeyByScanCode(scan_code) {
    const scan_code_int = [0];
    if (c$sscanf(scan_code, S("$%x"), P(scan_code_int, 0)) !== 1) {
      return 0xfffffffffffffffe;
    }
    return scan_code_int[0];
  }

  $clone() { return new C4KeyCodeEx().$assign(this); }
  $assign(o) {
    this.Key = o.Key;
    this.dwShift = o.dwShift;
    this.deviceId = o.deviceId;
    this.fRepeated = o.fRepeated;
    return this;
  }
}

export class C4KeyEventData {
  iStrength = 0;
  game_x = 0x7fffff;
  game_y = 0x7fffff;
  vp_x = 0x7fffff;
  vp_y = 0x7fffff;

  init$i32$i32$i32$i32$i32(iStrength, game_x, game_y, vp_x, vp_y) {
    this.iStrength = iStrength;
    this.game_x = game_x;
    this.game_y = game_y;
    this.vp_x = vp_x;
    this.vp_y = vp_y;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Value$ri32(P(this, "iStrength"));
    pComp.Separator();
    pComp.Value$ri32(P(this, "game_x"));
    pComp.Separator();
    pComp.Value$ri32(P(this, "game_y"));
    pComp.Separator();
    pComp.Value$ri32(P(this, "vp_x"));
    pComp.Separator();
    pComp.Value$ri32(P(this, "vp_y"));
  }

  op_eq(cmp) {
    return this.iStrength === cmp.iStrength && this.game_x === cmp.game_x && this.game_y === cmp.game_y && this.vp_x === cmp.vp_x && this.vp_y === cmp.vp_y;
  }

  $clone() { return new C4KeyEventData().$assign(this); }
  $assign(o) {
    this.iStrength = o.iStrength;
    this.game_x = o.game_x;
    this.game_y = o.game_y;
    this.vp_x = o.vp_x;
    this.vp_y = o.vp_y;
    return this;
  }
}

export class C4KeyboardCallbackInterface {
  iRef = 0;
  pOriginalKey = null;

  Ref() {
    this.iRef = this.iRef + 1 | 0;
  }

  Deref() {
    if (!((this.iRef = this.iRef - 1 | 0) !== 0)) {
      $delete(this);
    }
  }

  IsOriginalKey(pCheckKey) {
    return pCheckKey === this.pOriginalKey;
  }

  $clone() { return new C4KeyboardCallbackInterface().$assign(this); }
  $assign(o) {
    this.iRef = o.iRef;
    this.pOriginalKey = o.pOriginalKey;
    return this;
  }
}

export class C4CustomKey {
  Codes = [];
  DefaultCodes = [];
  Scope = 0;
  Name = new $.StdStrBuf();
  uiPriority = 0;
  is_down = false;
  vecCallbacks = [];
  iRef = 0;

  init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(DefCode, szName, Scope, pCallback, uiPriority = 1) {
    this.Codes = [];
    this.DefaultCodes = [];
    this.Scope = Scope;
    this.Name = new $.StdStrBuf();
    this.uiPriority = uiPriority;
    this.is_down = false;
    this.vecCallbacks = [];
    this.iRef = 0;
    if (DefCode.Key !== 0) {
      $vpush(this.DefaultCodes, DefCode.$clone());
    }
    this.Name.Copy$pi8(szName);
    if (pCallback != null) {
      pCallback.Ref();
      this.vecCallbacks.push(pCallback);
      pCallback.pOriginalKey = this;
    }
    return this;
  }

  init$vector$pi8$i32$pC4KeyboardCallbackInterface$u32(rDefCodes, szName, Scope, pCallback, uiPriority = 1) {
    this.Codes = [];
    this.DefaultCodes = rDefCodes.slice();
    this.Scope = Scope;
    this.Name = new $.StdStrBuf();
    this.uiPriority = uiPriority;
    this.is_down = false;
    this.vecCallbacks = [];
    this.iRef = 0;
    this.Name.Copy$pi8(szName);
    if (pCallback != null) {
      pCallback.Ref();
      this.vecCallbacks.push(pCallback);
      pCallback.pOriginalKey = this;
    }
    return this;
  }

  init$C4CustomKey$b(rCpy, fCopyCallbacks) {
    this.Codes = rCpy.Codes.slice();
    this.DefaultCodes = rCpy.DefaultCodes.slice();
    this.Scope = rCpy.Scope;
    this.Name = new $.StdStrBuf();
    this.uiPriority = rCpy.uiPriority;
    this.is_down = false;
    this.vecCallbacks = [];
    this.iRef = 0;
    this.Name.Copy$StdStrBuf(rCpy.GetName());
    if (fCopyCallbacks) {
      for (const callback of rCpy.vecCallbacks) {
        callback.Ref();
        this.vecCallbacks.push(callback);
      }
    }
    return this;
  }

  $dtor() {
    for (let i = $begin(this.vecCallbacks); !i.eq($end(this.vecCallbacks)); i.inc()) {
      i.v.Deref();
    }
  }

  Ref() {
    this.iRef = this.iRef + 1 | 0;
  }

  Deref() {
    if (!((this.iRef = this.iRef - 1 | 0) !== 0)) {
      $delete(this);
    }
  }

  GetCodes() {
    return this.Codes.length !== 0 ? this.Codes : this.DefaultCodes;
  }

  GetName() {
    return this.Name;
  }

  GetScope() {
    return this.Scope;
  }

  GetPriority() {
    return this.uiPriority;
  }

  IsCodeMatched(key) {
    const codes = this.GetCodes();
    for (const code of codes) {
      if (code.op_eq(key)) {
        return true;
      }
    }
    return false;
  }

  Update(pByKey) {
    0;
    0;
    if (pByKey.DefaultCodes.length !== 0) {
      this.DefaultCodes = pByKey.DefaultCodes.slice();
    }
    if (pByKey.Codes.length !== 0) {
      this.Codes = pByKey.Codes.slice();
    }
    if (pByKey.Scope !== 0) {
      this.Scope = pByKey.Scope;
    }
    if (pByKey.uiPriority !== 0) {
      this.uiPriority = pByKey.uiPriority;
    }
    for (const callback of pByKey.vecCallbacks) {
      callback.Ref();
      this.vecCallbacks.push(callback);
    }
  }

  Execute(eEv, key) {
    let $t1;
    this.is_down = eEv === 1;
    $t1 = this.vecCallbacks;
    for (let $i1 = 0; $i1 < $t1.length; $i1++) {
      const callback = P($t1, $i1);
      if (callback.a[callback.o].OnKeyEvent(key, eEv)) {
        return true;
      }
    }
    return false;
  }

  IsDown() {
    return this.is_down;
  }

  KillCallbacks(pOfKey) {
    let i = null;
    while (!(i = std_find_if($begin(this.vecCallbacks), $end(this.vecCallbacks), ((pIntfc) => {
  return pIntfc.IsOriginalKey(pOfKey);
})).copy()).eq($end(this.vecCallbacks))) {
      let pItfc = i.v;
      seq_erase(this.vecCallbacks, $itcopy(i));
      pItfc.Deref();
    }
  }

  CompileFunc(pComp) {
    pComp.Value$StdNamingDefaultAdapt$StdSTLContainerAdapt$vector$C4KeyCodeEx$vector$C4KeyCodeEx($.mkNamingAdapt$mStdSTLContainerAdapt$vector$C4KeyCodeEx$pi8$vector$b$b($.mkSTLContainerAdapt$rvector$i32(this.Codes), this.Name.getData(), this.DefaultCodes));
  }

  $clone() { return new C4CustomKey().$assign(this); }
  $assign(o) {
    this.Codes = o.Codes.slice();
    this.DefaultCodes = o.DefaultCodes.slice();
    this.Scope = o.Scope;
    this.Name.$assign(o.Name);
    this.uiPriority = o.uiPriority;
    this.is_down = o.is_down;
    this.vecCallbacks = o.vecCallbacks.slice();
    this.iRef = o.iRef;
    return this;
  }
}

export class C4KeyboardInput {
  static IsValid;
  KeysByCode = new StdMultiMap();
  KeysByName = new StdMap((a, b) => new C4KeyboardInput$szLess().op_call(a, b));
  LastKeyExtraData = new C4KeyEventData();

  init() {
    this.KeysByCode = new StdMultiMap();
    this.KeysByName = new StdMap((a, b) => new C4KeyboardInput$szLess().op_call(a, b));
    this.LastKeyExtraData = new C4KeyEventData();
    C4KeyboardInput.IsValid = true;
    return this;
  }

  $dtor() {
    C4KeyboardInput.prototype.Clear.call(this);
    C4KeyboardInput.IsValid = false;
  }

  Clear() {
    this.LastKeyExtraData.$assign(new C4KeyEventData());
    for (let i = this.KeysByName.begin(); !i.eq(this.KeysByName.end()); i.inc()) {
      i.v.second.Deref();
    }
    this.KeysByCode.clear();
    this.KeysByName.clear();
  }

  UpdateKeyCodes(pKey, rOldCodes, rNewCodes) {
    0;
    let iCode = null;
    for (iCode = $begin(rOldCodes).copy(); !iCode.eq($end(rOldCodes)); iCode.inc()) {
      if (!std_find($begin(rNewCodes), $end(rNewCodes), iCode.v, (x, y) => x.op_eq(y)).eq($end(rNewCodes))) {
        continue;
      }
      let KeyRange = this.KeysByCode.equal_range(iCode.v.Key);
      for (let i = $itcopy(KeyRange.first); !i.eq(KeyRange.second); i.inc()) {
        if (i.v.second === pKey) {
          this.KeysByCode.erase($itcopy(i));
          break;
        }
      }
    }
    for (iCode = $begin(rNewCodes).copy(); !iCode.eq($end(rNewCodes)); iCode.inc()) {
      if (!std_find($begin(rOldCodes), $end(rOldCodes), iCode.v, (x, y) => x.op_eq(y)).eq($end(rOldCodes))) {
        continue;
      }
      this.KeysByCode.insertPair(new StdPair(iCode.v.Key, pKey));
    }
  }

  RegisterKey(pRegKey) {
    0;
    if (pRegKey == null) {
      return;
    }
    pRegKey.Ref();
    let pDupKey = this.KeysByName.entry(pRegKey.GetName().getData(), () => null).second;
    if (pDupKey != null) {
      let OldCodes = pDupKey.GetCodes().slice();
      const rNewCodes = pRegKey.GetCodes();
      pDupKey.Update(pRegKey);
      if (!seq_equal(OldCodes, rNewCodes)) {
        this.UpdateKeyCodes(pDupKey, OldCodes, rNewCodes);
      }
      pRegKey.Deref();
    } else {
      this.KeysByName.entry(pRegKey.GetName().getData(), () => null).second = pRegKey;
      for (let i = $begin(pRegKey.GetCodes()); !i.eq($end(pRegKey.GetCodes())); i.inc()) {
        this.KeysByCode.insertPair(new StdPair(i.v.Key, pRegKey));
      }
    }
  }

  UnregisterKey(rsName) {
    let in_ = this.KeysByName.find(rsName.getData());
    if (in_.eq(this.KeysByName.end())) {
      return;
    }
    let pKey = in_.v.second;
    this.KeysByName.erase($itcopy(in_));
    for (let iCode = $begin(pKey.GetCodes()); !iCode.eq($end(pKey.GetCodes())); iCode.inc()) {
      let KeyRange = this.KeysByCode.equal_range(iCode.v.Key);
      for (let i = $itcopy(KeyRange.first); !i.eq(KeyRange.second); i.inc()) {
        if (i.v.second === pKey) {
          this.KeysByCode.erase($itcopy(i));
          break;
        }
      }
    }
    pKey.Deref();
  }

  UnregisterKeyBinding(pUnregKey) {
    let in_ = this.KeysByName.find(pUnregKey.GetName().getData());
    if (in_.eq(this.KeysByName.end())) {
      return;
    }
    let pKey = in_.v.second;
    if (pKey !== pUnregKey) {
      pKey.KillCallbacks(pUnregKey);
      return;
    }
    let pNewKey = new C4CustomKey().init$C4CustomKey$b(pUnregKey, true);
    pNewKey.KillCallbacks(pUnregKey);
    this.UnregisterKey(pUnregKey.GetName());
    this.RegisterKey(pNewKey);
  }

  DoInput(InKey, InEvent, InScope, iStrength) {
    let $t1, $t2, $t3;
    this.LastKeyExtraData.iStrength = iStrength >= 0 ? iStrength : Math.imul(InEvent !== 2 ? 1 : 0, 100);
    this.LastKeyExtraData.game_x = this.LastKeyExtraData.game_y = this.LastKeyExtraData.vp_x = this.LastKeyExtraData.vp_y = 0x7fffff;
    let iKeyRangeMax = 5;
    let iKeyRangeCnt = 0;
    let j = 0;
    const FallbackKeys = new Float64Array(5);
    FallbackKeys[($t1 = iKeyRangeCnt, iKeyRangeCnt = iKeyRangeCnt + 1 | 0, $t1)] = InKey.Key;
    if (Key_IsGamepadButton(InKey.Key)) {
      FallbackKeys[($t2 = iKeyRangeCnt, iKeyRangeCnt = iKeyRangeCnt + 1 | 0, $t2)] = KEY_Gamepad(255);
    } else if (Key_IsGamepadAxis(InKey.Key)) {
    }
    if (InKey.Key !== 0xffffffffffffffff) {
      FallbackKeys[($t3 = iKeyRangeCnt, iKeyRangeCnt = iKeyRangeCnt + 1 | 0, $t3)] = 0xffffffffffffffff;
    }
    const KeyRanges = $oarr(5, () => new StdPair(new $.C4ObjectList$iterator(), new $.C4ObjectList$iterator()));
    0;
    for (let i = 0; i < iKeyRangeCnt; i = i + 1 | 0) {
      KeyRanges[i].$assign(this.KeysByCode.equal_range(FallbackKeys[i]));
    }
    let uiLastPrio = 100;
    for (; ; ) {
      let i$2 = null;
      let uiExecPrio = 0;
      let uiCurr = 0;
      for (j = 0; j < iKeyRangeCnt; j = j + 1 | 0) {
        for (i$2 = $itcopy(KeyRanges[j].first).copy(); !i$2.eq($itcopy(KeyRanges[j].second)); i$2.inc()) {
          uiCurr = i$2.v.second.GetPriority();
          if (uiCurr > uiExecPrio && uiCurr < uiLastPrio) {
            uiExecPrio = uiCurr;
          }
        }
      }
      if (uiExecPrio === 0) {
        break;
      }
      for (j = 0; j < iKeyRangeCnt; j = j + 1 | 0) {
        for (i$2 = $itcopy(KeyRanges[j].first).copy(); !i$2.eq($itcopy(KeyRanges[j].second)); i$2.inc()) {
          let pKey = i$2.v.second;
          0;
          if (pKey.GetPriority() === uiExecPrio) {
            if (InEvent === 2 && pKey.IsDown() || (pKey.GetScope() >>> 0 & InScope) >>> 0 !== 0 && pKey.IsCodeMatched(new C4KeyCodeEx().init(FallbackKeys[j], (InKey.dwShift | 0) >>> 0))) {
              if (pKey.Execute(InEvent, InKey.$clone())) {
                return true;
              }
            }
          }
        }
      }
      uiLastPrio = uiExecPrio;
    }
    return false;
  }

  CompileFunc(pComp) {
    pComp.Name(S("Keys"));
    try {
      for (let i = this.KeysByName.begin(); !i.eq(this.KeysByName.end()); i.inc()) {
        let OldCodes = i.v.second.GetCodes().slice();
        pComp.Value$rC4CustomKey(i.v.second);
        if (pComp.isDeserializer()) {
          const rNewCodes = i.v.second.GetCodes();
          if (!seq_equal(OldCodes, rNewCodes)) {
            this.UpdateKeyCodes(i.v.second, OldCodes, rNewCodes);
          }
        }
      }
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$Exception) {
        const pEx = $e1;
        pComp.NameEnd(true);
        $throw(pEx);
      } else {
        throw $e1;
      }
    }
    pComp.NameEnd();
  }

  LoadCustomConfig() {
    let GrpExtra = new $.C4Group().init();
    if (!GrpExtra.Open(S("Extra.ocg"))) {
      return false;
    }
    let sFileContents = new $.StdBuf();
    if (!GrpExtra.LoadEntry$pi8$pStdBuf(S("KeyConfig.txt"), sFileContents)) {
      return false;
    }
    let sFileContentsString = new $.StdStrBuf().init$pi8$b($reinterpVoid($.StdBuf.prototype.getData.call(sFileContents), "i8"));
    if (!$.CompileFromBuf_LogWarn$rC4KeyboardInput$x$pi8(this, sFileContentsString, S("Custom keys fromExtra.ocg/KeyConfig.txt"))) {
      return false;
    }
    $.LogF($.LoadResStr(S("IDS_PRC_LOADEDKEYCONF")), S("Extra.ocg/KeyConfig.txt"));
    return true;
  }

  GetKeyByName(szKeyName) {
    let i = this.KeysByName.find(szKeyName);
    if (i.eq(this.KeysByName.end())) {
      return null;
    } else {
      return i.v.second;
    }
  }

  GetKeyCodeNameByKeyName(szKeyName, fShort = false, iIndex = 0) {
    let pKey = this.GetKeyByName(szKeyName);
    if (pKey != null) {
      const codes = pKey.GetCodes();
      if ($u64n(iIndex) < codes.length) {
        let code = codes[$u64n(iIndex)].$clone();
        return code.ToString(true, fShort);
      }
    }
    return new $.StdStrBuf();
  }

  GetLastKeyExtraData() {
    return this.LastKeyExtraData;
  }

  SetLastKeyExtraData(data) {
    this.LastKeyExtraData.$assign(data);
  }

  $clone() { return new C4KeyboardInput().$assign(this); }
  $assign(o) {
    this.KeysByCode = o.KeysByCode.$clone();
    this.KeysByName = o.KeysByName.$clone();
    this.LastKeyExtraData.$assign(o.LastKeyExtraData);
    return this;
  }
}

export class C4KeyboardInput$szLess {

  op_call(p, q) {
    return p != null && q != null && c$strcmp(p, q) < 0;
  }

  $clone() { return new C4KeyboardInput$szLess().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class C4KeyCB$C4Console {
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

export class C4KeyCB$C4EditCursor {
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

export class C4KeyCB$C4FullScreen {
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

export class C4KeyCB$C4Game {
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

export class C4KeyCB$C4GraphicsSystem {
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

export class C4KeyCB$C4Network2 {
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

export class C4KeyCB$C4Scoreboard {
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

export class C4KeyCB$C4ToolsDlg {
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

export class C4KeyCB$C4ViewportList {
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

export class C4KeyCBEx$C4FullScreen$u8 {
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

export class C4KeyCBEx$C4GameControl$i32 {
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

export class C4KeyCBEx$C4MessageInput$b {
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

export class C4KeyCBEx$C4ToolsDlg$i32 {
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

export class C4KeyCBEx$C4ViewportList$C4Vec2D {
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

export class C4KeyCB$C4MusicSystem {
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

export class C4KeyCBEx$C4GraphicsSystem$b {
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

export class C4KeyCBExPassKey$C4PlayerControl$C4KeyCodeEx {
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

export class C4KeyBinding extends C4CustomKey {

  init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(DefCode, szName, Scope, pCallback, uiPriority = 1) {
    super.init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(DefCode, szName, Scope, pCallback, uiPriority);
    this.Ref();
    C4KeyboardInput_Init().RegisterKey(this);
    return this;
  }

  init$vector$pi8$i32$pC4KeyboardCallbackInterface$u32(rDefCodes, szName, Scope, pCallback, uiPriority = 1) {
    super.init$vector$pi8$i32$pC4KeyboardCallbackInterface$u32(rDefCodes.slice(), szName, Scope, pCallback, uiPriority);
    this.Ref();
    C4KeyboardInput_Init().RegisterKey(this);
    return this;
  }

  $dtor() {
    if (C4KeyboardInput.IsValid) {
      $.Game.KeyboardInput.UnregisterKeyBinding(this);
    }
    0;
    this.iRef = 0;
    super.$dtor();
  }

  $clone() { return new C4KeyBinding().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}























































export function KEY_CONTROLLER_Button(idx) {
  return 16 + idx & 0xff;
}

export function KEY_CONTROLLER_Axis(idx, fMax) {
  return 48 + $u64n(Math.imul(2, idx)) + (fMax ? 1 : 0) & 0xff;
}

export function KEY_Gamepad(idButton) {
  return 0x420000 + idButton;
}

export function Key_IsGamepad(key) {
  return $and64n(0xff0000, key) === 0x420000;
}

export function Key_GetGamepad(key) {
  return (key >>> 0 >>> 8 & 255) >>> 0 & 0xff;
}

export function Key_GetGamepadEvent(key) {
  return (key >>> 0 & 255) >>> 0 & 0xff;
}

export function Key_IsGamepadButton(key) {
  return Key_IsGamepad(key) && $.Inside$u8$u64$u64(Key_GetGamepadEvent(key), 16, 30);
}

export function Key_IsGamepadAxis(key) {
  return Key_IsGamepad(key) && $.Inside$u8$u64$u64(Key_GetGamepadEvent(key), 48, 59);
}

export function Key_GetGamepadButtonIndex(key) {
  return Key_GetGamepadEvent(key) - 16 & 0xff;
}

export function Key_GetGamepadAxisIndex(key) {
  return Math.trunc((Key_GetGamepadEvent(key) - 48) / 2) & 0xff;
}

export function Key_IsGamepadAxisHigh(key) {
  return !!($and64n(key, 1) !== 0);
}

export function KEY_Mouse(mouse_id, mouseevent) {
  return 0x430000 + $u64n(mouse_id << 8 | 0) + mouseevent;
}

export function Key_IsMouse(key) {
  return $and64n(0xff0000, key) === 0x430000;
}

export function Key_GetMouse(key) {
  return (key >>> 0 >>> 8 & 255) >>> 0 & 0xff;
}

export function Key_GetMouseEvent(key) {
  return (key >>> 0 & 255) >>> 0 & 0xff;
}


export function Any(keys) {
  $vpush(keys, new C4KeyCodeEx().init(KEY_Gamepad(255)));
}

export function Cancel(keys) {
  $vpush(keys, new C4KeyCodeEx().init(KEY_Gamepad(17)));
}

export function Ok(keys) {
  $vpush(keys, new C4KeyCodeEx().init(KEY_Gamepad(16)));
}

export function Left(keys) {
  $vpush(keys, new C4KeyCodeEx().init(KEY_Gamepad(48)));
  $vpush(keys, new C4KeyCodeEx().init(KEY_Gamepad(29)));
}

export function Right(keys) {
  $vpush(keys, new C4KeyCodeEx().init(KEY_Gamepad(49)));
  $vpush(keys, new C4KeyCodeEx().init(KEY_Gamepad(30)));
}

export function Up(keys) {
  $vpush(keys, new C4KeyCodeEx().init(KEY_Gamepad(50)));
  $vpush(keys, new C4KeyCodeEx().init(KEY_Gamepad(27)));
}

export function Down(keys) {
  $vpush(keys, new C4KeyCodeEx().init(KEY_Gamepad(51)));
  $vpush(keys, new C4KeyCodeEx().init(KEY_Gamepad(28)));
}

export function KEY_IsModifier(k) {
  return k === 29 || k === 42 || k === 56 || k === 97 || k === 54 || k === 100;
}

export function C4KeyboardInput_Init() {
  if (!('C4KeyboardInput_Init$keyinp' in $)) $.C4KeyboardInput_Init$keyinp = new C4KeyboardInput().init();
  return $.C4KeyboardInput_Init$keyinp;
}

export function $init(): void {
  C4KeyboardInput.IsValid = false;
  $.KeyShiftMap$C4KeyboardInput = $own([((($o) => ($o.eShift = 1 /*KEYS_Alt*/, $o.szName = S("Alt"), $o))(new C4KeyShiftMapEntry())), ((($o) => ($o.eShift = 2 /*KEYS_Control*/, $o.szName = S("Ctrl"), $o))(new C4KeyShiftMapEntry())), ((($o) => ($o.eShift = 4 /*KEYS_Shift*/, $o.szName = S("Shift"), $o))(new C4KeyShiftMapEntry())), ((($o) => ($o.eShift = 65535 /*KEYS_Undefined*/, $o.szName = null, $o))(new C4KeyShiftMapEntry()))]);
  $.KeyCodeMap$C4KeyboardInput = $own([
  ((($o) => ($o.wCode = 1, $o.szName = S("Escape"), $o.szShortName = S("Esc"), $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 2, $o.szName = S("1"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 3, $o.szName = S("2"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 4, $o.szName = S("3"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 5, $o.szName = S("4"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 6, $o.szName = S("5"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 7, $o.szName = S("6"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 8, $o.szName = S("7"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 9, $o.szName = S("8"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 10, $o.szName = S("9"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 11, $o.szName = S("0"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 12, $o.szName = S("Minus"), $o.szShortName = S("-"), $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 13, $o.szName = S("Equal"), $o.szShortName = S("="), $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 14, $o.szName = S("BackSpace"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 15, $o.szName = S("Tab"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 16, $o.szName = S("Q"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 17, $o.szName = S("W"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 18, $o.szName = S("E"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 19, $o.szName = S("R"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 20, $o.szName = S("T"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 21, $o.szName = S("Y"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 22, $o.szName = S("U"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 23, $o.szName = S("I"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 24, $o.szName = S("O"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 25, $o.szName = S("P"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 26, $o.szName = S("LeftBracket"), $o.szShortName = S("["), $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 27, $o.szName = S("RightBracket"), $o.szShortName = S("]"), $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 28, $o.szName = S("Return"), $o.szShortName = S("Ret"), $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 29, $o.szName = S("LeftControl"), $o.szShortName = S("LCtrl"), $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 30, $o.szName = S("A"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 31, $o.szName = S("S"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 32, $o.szName = S("D"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 33, $o.szName = S("F"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 34, $o.szName = S("G"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 35, $o.szName = S("H"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 36, $o.szName = S("J"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 37, $o.szName = S("K"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 38, $o.szName = S("L"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 39, $o.szName = S("Semicolon"), $o.szShortName = S(";"), $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 40, $o.szName = S("Apostrophe"), $o.szShortName = S("'"), $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 41, $o.szName = S("GraveAccent"), $o.szShortName = S("`"), $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 42, $o.szName = S("LeftShift"), $o.szShortName = S("LShift"), $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 43, $o.szName = S("Backslash"), $o.szShortName = S("\\"), $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 44, $o.szName = S("Z"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 45, $o.szName = S("X"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 46, $o.szName = S("C"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 47, $o.szName = S("V"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 48, $o.szName = S("B"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 49, $o.szName = S("N"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 50, $o.szName = S("M"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 51, $o.szName = S("Comma"), $o.szShortName = S(","), $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 52, $o.szName = S("Period"), $o.szShortName = S("."), $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 53, $o.szName = S("Slash"), $o.szShortName = S("/"), $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 54, $o.szName = S("RightShift"), $o.szShortName = S("RShift"), $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 55, $o.szName = S("Multiply"), $o.szShortName = S("N*"), $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 56, $o.szName = S("LeftAlt"), $o.szShortName = S("LAlt"), $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 57, $o.szName = S("Space"), $o.szShortName = S("Sp"), $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 58, $o.szName = S("Capslock"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 59, $o.szName = S("F1"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 60, $o.szName = S("F2"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 61, $o.szName = S("F3"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 62, $o.szName = S("F4"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 63, $o.szName = S("F5"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 64, $o.szName = S("F6"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 65, $o.szName = S("F7"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 66, $o.szName = S("F8"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 67, $o.szName = S("F9"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 68, $o.szName = S("F10"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 69, $o.szName = S("NumLock"), $o.szShortName = S("NLock"), $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 70, $o.szName = S("ScrollLock"), $o.szShortName = S("SLock"), $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 71, $o.szName = S("Num7"), $o.szShortName = S("N7"), $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 72, $o.szName = S("Num8"), $o.szShortName = S("N8"), $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 73, $o.szName = S("Num9"), $o.szShortName = S("N9"), $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 74, $o.szName = S("Subtract"), $o.szShortName = S("N-"), $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 75, $o.szName = S("Num4"), $o.szShortName = S("N4"), $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 76, $o.szName = S("Num5"), $o.szShortName = S("N5"), $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 77, $o.szName = S("Num6"), $o.szShortName = S("N6"), $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 78, $o.szName = S("Add"), $o.szShortName = S("N+"), $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 79, $o.szName = S("Num1"), $o.szShortName = S("N1"), $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 80, $o.szName = S("Num2"), $o.szShortName = S("N2"), $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 81, $o.szName = S("Num3"), $o.szShortName = S("N3"), $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 82, $o.szName = S("Num0"), $o.szShortName = S("N0"), $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 83, $o.szName = S("Decimal"), $o.szShortName = S("N,"), $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 86, $o.szName = S("|<>"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 87, $o.szName = S("F11"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 88, $o.szName = S("F12"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 96, $o.szName = S("NumReturn"), $o.szShortName = S("NRet"), $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 97, $o.szName = S("RightControl"), $o.szShortName = S("RCtrl"), $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 98, $o.szName = S("Divide"), $o.szShortName = S("N/"), $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 100, $o.szName = S("RightAlt"), $o.szShortName = S("RAlt"), $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 102, $o.szName = S("Home"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 103, $o.szName = S("Up"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 104, $o.szName = S("PageUp"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 105, $o.szName = S("Left"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 106, $o.szName = S("Right"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 107, $o.szName = S("End"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 108, $o.szName = S("Down"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 109, $o.szName = S("PageDown"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 110, $o.szName = S("Insert"), $o.szShortName = S("Ins"), $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 111, $o.szName = S("Delete"), $o.szShortName = S("Del"), $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 119, $o.szName = S("Pause"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 125, $o.szName = S("LeftWin"), $o.szShortName = S("LWin"), $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 126, $o.szName = S("RightWin"), $o.szShortName = S("RWin"), $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 127, $o.szName = S("Menu"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 99, $o.szName = S("Print"), $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
  ((($o) => ($o.wCode = 0, $o.szName = null, $o.szShortName = null, $o))(new C4KeyCodeMapEntry())),
]);
  $.KEY_CONTROLLER_Mask$C4KeyboardInput = 0x420000;
  $.KEY_MOUSE_Mask$C4KeyboardInput = 0x430000;
  $.KEY_Default$C4KeyboardInput = 0;
  $.KEY_Any$C4KeyboardInput = 0xffffffffffffffff;
  $.KEY_Undefined$C4KeyboardInput = 0xfffffffffffffffe;
  $.KEY_CONTROLLER_ButtonMin$C4KeyboardInput = 16;
  $.KEY_CONTROLLER_ButtonA$C4KeyboardInput = 16;
  $.KEY_CONTROLLER_ButtonB$C4KeyboardInput = 17;
  $.KEY_CONTROLLER_ButtonX$C4KeyboardInput = 18;
  $.KEY_CONTROLLER_ButtonY$C4KeyboardInput = 19;
  $.KEY_CONTROLLER_ButtonBack$C4KeyboardInput = 20;
  $.KEY_CONTROLLER_ButtonGuide$C4KeyboardInput = 21;
  $.KEY_CONTROLLER_ButtonStart$C4KeyboardInput = 22;
  $.KEY_CONTROLLER_ButtonLeftStick$C4KeyboardInput = 23;
  $.KEY_CONTROLLER_ButtonRightStick$C4KeyboardInput = 24;
  $.KEY_CONTROLLER_ButtonLeftShoulder$C4KeyboardInput = 25;
  $.KEY_CONTROLLER_ButtonRightShoulder$C4KeyboardInput = 26;
  $.KEY_CONTROLLER_ButtonDpadUp$C4KeyboardInput = 27;
  $.KEY_CONTROLLER_ButtonDpadDown$C4KeyboardInput = 28;
  $.KEY_CONTROLLER_ButtonDpadLeft$C4KeyboardInput = 29;
  $.KEY_CONTROLLER_ButtonDpadRight$C4KeyboardInput = 30;
  $.KEY_CONTROLLER_ButtonMax$C4KeyboardInput = 30;
  $.KEY_CONTROLLER_AnyButton$C4KeyboardInput = 255;
  $.KEY_CONTROLLER_AxisMin$C4KeyboardInput = 48;
  $.KEY_CONTROLLER_AxisLeftXLeft$C4KeyboardInput = 48;
  $.KEY_CONTROLLER_AxisLeftXRight$C4KeyboardInput = 49;
  $.KEY_CONTROLLER_AxisLeftYUp$C4KeyboardInput = 50;
  $.KEY_CONTROLLER_AxisLeftYDown$C4KeyboardInput = 51;
  $.KEY_CONTROLLER_AxisRightXLeft$C4KeyboardInput = 52;
  $.KEY_CONTROLLER_AxisRightXRight$C4KeyboardInput = 53;
  $.KEY_CONTROLLER_AxisRightYUp$C4KeyboardInput = 54;
  $.KEY_CONTROLLER_AxisRightYDown$C4KeyboardInput = 55;
  $.KEY_CONTROLLER_AxisTriggerLeft$C4KeyboardInput = 57;
  $.KEY_CONTROLLER_AxisTriggerRight$C4KeyboardInput = 59;
  $.KEY_CONTROLLER_AxisMax$C4KeyboardInput = 59;
  $.KEY_MOUSE_Move$C4KeyboardInput = 1;
  $.KEY_MOUSE_Button1$C4KeyboardInput = 16;
  $.KEY_MOUSE_ButtonLeft$C4KeyboardInput = 16;
  $.KEY_MOUSE_ButtonRight$C4KeyboardInput = 17;
  $.KEY_MOUSE_ButtonMiddle$C4KeyboardInput = 18;
  $.KEY_MOUSE_ButtonX1$C4KeyboardInput = 19;
  $.KEY_MOUSE_ButtonX2$C4KeyboardInput = 20;
  $.KEY_MOUSE_ButtonMax$C4KeyboardInput = 47;
  $.KEY_MOUSE_Button1Double$C4KeyboardInput = 48;
  $.KEY_MOUSE_ButtonLeftDouble$C4KeyboardInput = 48;
  $.KEY_MOUSE_ButtonRightDouble$C4KeyboardInput = 49;
  $.KEY_MOUSE_ButtonMiddleDouble$C4KeyboardInput = 50;
  $.KEY_MOUSE_ButtonX1Double$C4KeyboardInput = 51;
  $.KEY_MOUSE_ButtonX2Double$C4KeyboardInput = 52;
  $.KEY_MOUSE_ButtonMaxDouble$C4KeyboardInput = 79;
  $.KEY_MOUSE_Wheel1Up$C4KeyboardInput = 64;
  $.KEY_MOUSE_Wheel1Down$C4KeyboardInput = 65;
  $.controllercodes$C4KeyboardInput = $fill_list(new HashMap(), $own([
  new StdPair(StdString.of(S("ButtonA")), $.KEY_CONTROLLER_ButtonA$C4KeyboardInput),
  new StdPair(StdString.of(S("ButtonB")), $.KEY_CONTROLLER_ButtonB$C4KeyboardInput),
  new StdPair(StdString.of(S("ButtonX")), $.KEY_CONTROLLER_ButtonX$C4KeyboardInput),
  new StdPair(StdString.of(S("ButtonY")), $.KEY_CONTROLLER_ButtonY$C4KeyboardInput),
  new StdPair(StdString.of(S("ButtonBack")), $.KEY_CONTROLLER_ButtonBack$C4KeyboardInput),
  new StdPair(StdString.of(S("ButtonGuide")), $.KEY_CONTROLLER_ButtonGuide$C4KeyboardInput),
  new StdPair(StdString.of(S("ButtonStart")), $.KEY_CONTROLLER_ButtonStart$C4KeyboardInput),
  new StdPair(StdString.of(S("ButtonLeftStick")), $.KEY_CONTROLLER_ButtonLeftStick$C4KeyboardInput),
  new StdPair(StdString.of(S("ButtonRightStick")), $.KEY_CONTROLLER_ButtonRightStick$C4KeyboardInput),
  new StdPair(StdString.of(S("ButtonLeftShoulder")), $.KEY_CONTROLLER_ButtonLeftShoulder$C4KeyboardInput),
  new StdPair(StdString.of(S("ButtonRightShoulder")), $.KEY_CONTROLLER_ButtonRightShoulder$C4KeyboardInput),
  new StdPair(StdString.of(S("ButtonDpadUp")), $.KEY_CONTROLLER_ButtonDpadUp$C4KeyboardInput),
  new StdPair(StdString.of(S("ButtonDpadDown")), $.KEY_CONTROLLER_ButtonDpadDown$C4KeyboardInput),
  new StdPair(StdString.of(S("ButtonDpadLeft")), $.KEY_CONTROLLER_ButtonDpadLeft$C4KeyboardInput),
  new StdPair(StdString.of(S("ButtonDpadRight")), $.KEY_CONTROLLER_ButtonDpadRight$C4KeyboardInput),
  new StdPair(StdString.of(S("AnyButton")), $.KEY_CONTROLLER_AnyButton$C4KeyboardInput),
  new StdPair(StdString.of(S("LeftStickLeft")), $.KEY_CONTROLLER_AxisLeftXLeft$C4KeyboardInput),
  new StdPair(StdString.of(S("LeftStickRight")), $.KEY_CONTROLLER_AxisLeftXRight$C4KeyboardInput),
  new StdPair(StdString.of(S("LeftStickUp")), $.KEY_CONTROLLER_AxisLeftYUp$C4KeyboardInput),
  new StdPair(StdString.of(S("LeftStickDown")), $.KEY_CONTROLLER_AxisLeftYDown$C4KeyboardInput),
  new StdPair(StdString.of(S("RightStickLeft")), $.KEY_CONTROLLER_AxisRightXLeft$C4KeyboardInput),
  new StdPair(StdString.of(S("RightStickRight")), $.KEY_CONTROLLER_AxisRightXRight$C4KeyboardInput),
  new StdPair(StdString.of(S("RightStickUp")), $.KEY_CONTROLLER_AxisRightYUp$C4KeyboardInput),
  new StdPair(StdString.of(S("RightStickDown")), $.KEY_CONTROLLER_AxisRightYDown$C4KeyboardInput),
  new StdPair(StdString.of(S("LeftTrigger")), $.KEY_CONTROLLER_AxisTriggerLeft$C4KeyboardInput),
  new StdPair(StdString.of(S("RightTrigger")), $.KEY_CONTROLLER_AxisTriggerRight$C4KeyboardInput),
]));
}

Object.assign($, { Any, C4CustomKey, C4KeyBinding, C4KeyCB$C4Console, C4KeyCB$C4EditCursor, C4KeyCB$C4FullScreen, C4KeyCB$C4Game, C4KeyCB$C4GraphicsSystem, C4KeyCB$C4MusicSystem, C4KeyCB$C4Network2, C4KeyCB$C4Scoreboard, C4KeyCB$C4ToolsDlg, C4KeyCB$C4ViewportList, C4KeyCBEx$C4FullScreen$u8, C4KeyCBEx$C4GameControl$i32, C4KeyCBEx$C4GraphicsSystem$b, C4KeyCBEx$C4MessageInput$b, C4KeyCBEx$C4ToolsDlg$i32, C4KeyCBEx$C4ViewportList$C4Vec2D, C4KeyCBExPassKey$C4PlayerControl$C4KeyCodeEx, C4KeyCodeEx, C4KeyCodeMapEntry, C4KeyEventData, C4KeyShiftMapEntry, C4KeyboardCallbackInterface, C4KeyboardInput, C4KeyboardInput$szLess, C4KeyboardInput_Init, Cancel, Down, KEY_CONTROLLER_Axis, KEY_CONTROLLER_Button, KEY_Gamepad, KEY_IsModifier, KEY_Mouse, Key_GetGamepad, Key_GetGamepadAxisIndex, Key_GetGamepadButtonIndex, Key_GetGamepadEvent, Key_GetMouse, Key_GetMouseEvent, Key_IsGamepad, Key_IsGamepadAxis, Key_IsGamepadAxisHigh, Key_IsGamepadButton, Key_IsMouse, Left, Ok, Right, Up });
