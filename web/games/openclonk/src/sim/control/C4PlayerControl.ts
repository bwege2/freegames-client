// @ts-nocheck
// OpenClonk 36de799: src/control/C4PlayerControl.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n, ftoi32, ftou32 } from '../../rt/int.ts';
import { $oat, $own, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $begin, $delete, $end, $itcopy, $rbegin, $rend, $vpush, resize, seq_equal, seq_erase, seq_insert, std_find, std_sort } from '../../rt/std.ts';

export class C4PlayerControlDef {
  sIdentifier = new $.StdCopyStrBuf();
  sGUIName = new $.StdCopyStrBuf();
  sGUIDesc = new $.StdCopyStrBuf();
  fGlobal = false;
  fIsHoldKey = false;
  fDefaultDisabled = false;
  fSendCursorPos = false;
  iRepeatDelay = 0;
  iInitialRepeatDelay = 0;
  idControlExtraData = new $.C4ID().init$v();
  eCoordSpace = 0 /*COS_Game*/;
  eAction = 1 /*CDA_Script*/;

  init() {
    this.sIdentifier = new $.StdCopyStrBuf();
    this.sGUIName = new $.StdCopyStrBuf();
    this.sGUIDesc = new $.StdCopyStrBuf();
    this.fGlobal = false;
    this.fIsHoldKey = false;
    this.fDefaultDisabled = false;
    this.fSendCursorPos = false;
    this.idControlExtraData = $.C4ID.None.$clone();
    this.eCoordSpace = 0 /*COS_Game*/;
    this.eAction = 1 /*CDA_Script*/;
    return this;
  }

  CompileFunc(pComp) {
    if (!pComp.Name(S("ControlDef"))) {
      pComp.NameEnd();
      pComp.excNotFound(S("ControlDef"));
    }
    pComp.Value$StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x$3($.mkNamingAdapt$mStdParameterAdapt$StdCopyStrBuf$i32$pi8$x$b$b$3($.mkParAdapt$rStdCopyStrBuf$mi32(this.sIdentifier, 2 /*RCT_Idtf*/), S("Identifier"), S("None")));
    pComp.Value$StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x$2($.mkNamingAdapt$mStdParameterAdapt$StdCopyStrBuf$i32$pi8$x$b$b$2($.mkParAdapt$rStdCopyStrBuf$mi32(this.sGUIName, 1 /*RCT_All*/), S("GUIName"), S("")));
    pComp.Value$StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x$2($.mkNamingAdapt$mStdParameterAdapt$StdCopyStrBuf$i32$pi8$x$b$b$2($.mkParAdapt$rStdCopyStrBuf$mi32(this.sGUIDesc, 1 /*RCT_All*/), S("GUIDesc"), S("")));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "fGlobal"), S("Global"), false));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "fIsHoldKey"), S("Hold"), false));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iRepeatDelay"), S("RepeatDelay"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iInitialRepeatDelay"), S("InitialRepeatDelay"), 0));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "fDefaultDisabled"), S("DefaultDisabled"), false));
    pComp.Value$StdNamingDefaultAdapt$C4ID$C4ID($.mkNamingAdapt$rC4ID$pi8$C4ID$b$b(this.idControlExtraData, S("ExtraData"), $.C4ID.None));
    const CoordSpaceNames = $own([((($o) => ($o.Name = S("Game"), $o.Val = 0 /*COS_Game*/, $o))(new $.StdEnumEntry$i32$6())), ((($o) => ($o.Name = S("Viewport"), $o.Val = 1 /*COS_Viewport*/, $o))(new $.StdEnumEntry$i32$6())), ((($o) => ($o.Name = null, $o.Val = 0 /*COS_Game*/, $o))(new $.StdEnumEntry$i32$6()))]);
    pComp.Value$StdNamingDefaultAdapt$StdEnumAdapt$i32$i32$i32($.mkNamingAdapt$mStdEnumAdapt$i32$i32$pi8$i32$b$b($.mkEnumAdapt(P(this, "eCoordSpace"), $oat(CoordSpaceNames, 0)), S("CoordinateSpace"), 0 /*COS_Game*/));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "fSendCursorPos"), S("SendCursorPos"), false));
    const ActionNames = $own([
  ((($o) => ($o.Name = S("None"), $o.Val = 0 /*CDA_None*/, $o))(new $.StdEnumEntry$i32$5())),
  ((($o) => ($o.Name = S("Script"), $o.Val = 1 /*CDA_Script*/, $o))(new $.StdEnumEntry$i32$5())),
  ((($o) => ($o.Name = S("Menu"), $o.Val = 2 /*CDA_Menu*/, $o))(new $.StdEnumEntry$i32$5())),
  ((($o) => ($o.Name = S("MenuOK"), $o.Val = 3 /*CDA_MenuOK*/, $o))(new $.StdEnumEntry$i32$5())),
  ((($o) => ($o.Name = S("MenuCancel"), $o.Val = 4 /*CDA_MenuCancel*/, $o))(new $.StdEnumEntry$i32$5())),
  ((($o) => ($o.Name = S("MenuLeft"), $o.Val = 5 /*CDA_MenuLeft*/, $o))(new $.StdEnumEntry$i32$5())),
  ((($o) => ($o.Name = S("MenuUp"), $o.Val = 6 /*CDA_MenuUp*/, $o))(new $.StdEnumEntry$i32$5())),
  ((($o) => ($o.Name = S("MenuRight"), $o.Val = 7 /*CDA_MenuRight*/, $o))(new $.StdEnumEntry$i32$5())),
  ((($o) => ($o.Name = S("MenuDown"), $o.Val = 8 /*CDA_MenuDown*/, $o))(new $.StdEnumEntry$i32$5())),
  ((($o) => ($o.Name = S("ObjectMenuTextComplete"), $o.Val = 9 /*CDA_ObjectMenuTextComplete*/, $o))(new $.StdEnumEntry$i32$5())),
  ((($o) => ($o.Name = S("ObjectMenuOK"), $o.Val = 10 /*CDA_ObjectMenuOK*/, $o))(new $.StdEnumEntry$i32$5())),
  ((($o) => ($o.Name = S("ObjectMenuOKAll"), $o.Val = 11 /*CDA_ObjectMenuOKAll*/, $o))(new $.StdEnumEntry$i32$5())),
  ((($o) => ($o.Name = S("ObjectMenuSelect"), $o.Val = 12 /*CDA_ObjectMenuSelect*/, $o))(new $.StdEnumEntry$i32$5())),
  ((($o) => ($o.Name = S("ObjectMenuCancel"), $o.Val = 13 /*CDA_ObjectMenuCancel*/, $o))(new $.StdEnumEntry$i32$5())),
  ((($o) => ($o.Name = S("ObjectMenuLeft"), $o.Val = 14 /*CDA_ObjectMenuLeft*/, $o))(new $.StdEnumEntry$i32$5())),
  ((($o) => ($o.Name = S("ObjectMenuUp"), $o.Val = 15 /*CDA_ObjectMenuUp*/, $o))(new $.StdEnumEntry$i32$5())),
  ((($o) => ($o.Name = S("ObjectMenuRight"), $o.Val = 16 /*CDA_ObjectMenuRight*/, $o))(new $.StdEnumEntry$i32$5())),
  ((($o) => ($o.Name = S("ObjectMenuDown"), $o.Val = 17 /*CDA_ObjectMenuDown*/, $o))(new $.StdEnumEntry$i32$5())),
  ((($o) => ($o.Name = S("ZoomIn"), $o.Val = 18 /*CDA_ZoomIn*/, $o))(new $.StdEnumEntry$i32$5())),
  ((($o) => ($o.Name = S("ZoomOut"), $o.Val = 19 /*CDA_ZoomOut*/, $o))(new $.StdEnumEntry$i32$5())),
  ((($o) => ($o.Name = null, $o.Val = 0 /*CDA_None*/, $o))(new $.StdEnumEntry$i32$5())),
]);
    pComp.Value$StdNamingDefaultAdapt$StdEnumAdapt$i32$i32$i32$2($.mkNamingAdapt$mStdEnumAdapt$i32$i32$pi8$i32$b$b$2($.mkEnumAdapt$2(P(this, "eAction"), $oat(ActionNames, 0)), S("Action"), 1 /*CDA_Script*/));
    pComp.NameEnd();
  }

  GetIdentifier() {
    return this.sIdentifier.getData();
  }

  GetGUIName() {
    return this.sGUIName.getData();
  }

  GetGUIDesc() {
    return this.sGUIDesc.getData();
  }

  GetAction() {
    return this.eAction;
  }

  IsHoldKey() {
    return this.fIsHoldKey;
  }

  GetExtraData() {
    return this.idControlExtraData.$clone();
  }

  IsGlobal() {
    return this.fGlobal;
  }

  GetRepeatDelay() {
    return this.iRepeatDelay;
  }

  GetInitialRepeatDelay() {
    return this.iInitialRepeatDelay;
  }

  IsDefaultDisabled() {
    return this.fDefaultDisabled;
  }

  GetCoordinateSpace() {
    return this.eCoordSpace;
  }

  IsSendCursorPos() {
    return this.fSendCursorPos;
  }

  op_eq(cmp) {
    return this.sIdentifier.op_eq$StdStrBuf(cmp.sIdentifier) && this.sGUIName.op_eq$StdStrBuf(cmp.sGUIName) && this.sGUIDesc.op_eq$StdStrBuf(cmp.sGUIDesc) && (this.fGlobal ? 1 : 0) === (cmp.fGlobal ? 1 : 0) && (this.fIsHoldKey ? 1 : 0) === (cmp.fIsHoldKey ? 1 : 0) && this.iRepeatDelay === cmp.iRepeatDelay && this.iInitialRepeatDelay === cmp.iInitialRepeatDelay && (this.fDefaultDisabled ? 1 : 0) === (cmp.fDefaultDisabled ? 1 : 0) && this.idControlExtraData.op_eq(cmp.idControlExtraData) && (this.fSendCursorPos ? 1 : 0) === (cmp.fSendCursorPos ? 1 : 0) && this.eAction === cmp.eAction;
  }

  IsSyncObjectMenuControl() {
    return this.eAction >= 10 && this.eAction <= 17;
  }

  IsAsync() {
    return this.eAction !== 0 && this.eAction !== 1 && !this.IsSyncObjectMenuControl();
  }

  IsSync() {
    return this.eAction === 1 || this.IsSyncObjectMenuControl();
  }

  IsValid() {
    return this.eAction !== 0;
  }

  $clone() { return new C4PlayerControlDef().$assign(this); }
  $assign(o) {
    this.sIdentifier.$assign(o.sIdentifier);
    this.sGUIName.$assign(o.sGUIName);
    this.sGUIDesc.$assign(o.sGUIDesc);
    this.fGlobal = o.fGlobal;
    this.fIsHoldKey = o.fIsHoldKey;
    this.fDefaultDisabled = o.fDefaultDisabled;
    this.fSendCursorPos = o.fSendCursorPos;
    this.iRepeatDelay = o.iRepeatDelay;
    this.iInitialRepeatDelay = o.iInitialRepeatDelay;
    this.idControlExtraData.$assign(o.idControlExtraData);
    this.eCoordSpace = o.eCoordSpace;
    this.eAction = o.eAction;
    return this;
  }
}

export class C4PlayerControlDefs {
  Defs = [];
  clear_previous = false;
  InternalCons = new C4PlayerControlDefs$CInternalCons();

  UpdateInternalCons() {
    this.InternalCons.CON_ObjectMenuSelect = this.GetControlIndexByIdentifier(S("ObjectMenuSelect"));
    this.InternalCons.CON_ObjectMenuOK = this.GetControlIndexByIdentifier(S("ObjectMenuOK"));
    this.InternalCons.CON_ObjectMenuOKAll = this.GetControlIndexByIdentifier(S("ObjectMenuOKAll"));
    this.InternalCons.CON_ObjectMenuCancel = this.GetControlIndexByIdentifier(S("ObjectMenuCancel"));
    this.InternalCons.CON_CursorPos = this.GetControlIndexByIdentifier(S("CursorPos"));
  }

  init() {
    this.Defs = [];
    this.clear_previous = false;
    this.InternalCons = new C4PlayerControlDefs$CInternalCons();
    return this;
  }

  Clear() {
    this.clear_previous = false;
    this.Defs.length = 0;
    this.UpdateInternalCons();
  }

  CompileFunc(pComp) {
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "clear_previous"), S("ClearPrevious"), false));
    pComp.Value$StdSTLContainerAdapt$vector$C4PlayerControlDef($.mkSTLContainerAdapt$rvector$i32$3(this.Defs, 0 /*SEP_NONE*/));
    if (pComp.isDeserializer()) {
      this.UpdateInternalCons();
    }
  }

  MergeFrom(Src) {
    if (Src.clear_previous) {
      this.Defs.length = 0;
    }
    for (const SrcDef of Src.Defs) {
      let iPrevIdx = this.GetControlIndexByIdentifier(SrcDef.GetIdentifier());
      if (iPrevIdx !== -1) {
        this.Defs[$u64n(iPrevIdx)].$assign(SrcDef);
      } else {
        $vpush(this.Defs, SrcDef.$clone());
      }
    }
    this.UpdateInternalCons();
  }

  FinalInit() {
    for (let i = $begin(this.Defs); !i.eq($end(this.Defs)); i.inc()) {
      let szIdtf = i.v.GetIdentifier();
      if (szIdtf != null && szIdtf.a[szIdtf.o] !== 0 && !$.SEqual(szIdtf, S("None"))) {
        $.ScriptEngine.RegisterGlobalConstant($.FormatString(S("CON_%s"), szIdtf).getData(), $.C4VInt(i.i - $begin(this.Defs).i | 0));
      }
    }
  }

  GetControlByIndex(idx) {
    if (idx < 0 || idx >= (this.Defs.length | 0)) {
      return null;
    }
    return this.Defs[$u64n(idx)];
  }

  GetControlIndexByIdentifier(szIdentifier) {
    for (let i = $begin(this.Defs); !i.eq($end(this.Defs)); i.inc()) {
      if ($.SEqual(i.v.GetIdentifier(), szIdentifier)) {
        return i.i - $begin(this.Defs).i | 0;
      }
    }
    return -1;
  }

  GetCount() {
    return this.Defs.length;
  }

  op_eq(cmp) {
    return seq_equal(this.Defs, cmp.Defs) && (this.clear_previous ? 1 : 0) === (cmp.clear_previous ? 1 : 0);
  }

  $clone() { return new C4PlayerControlDefs().$assign(this); }
  $assign(o) {
    this.Defs = o.Defs.slice();
    this.clear_previous = o.clear_previous;
    this.InternalCons.$assign(o.InternalCons);
    return this;
  }
}

export class C4PlayerControlDefs$CInternalCons {
  CON_ObjectMenuSelect = -1;
  CON_ObjectMenuOKAll = -1;
  CON_ObjectMenuOK = -1;
  CON_ObjectMenuCancel = -1;
  CON_CursorPos = -1;

  $clone() { return new C4PlayerControlDefs$CInternalCons().$assign(this); }
  $assign(o) {
    this.CON_ObjectMenuSelect = o.CON_ObjectMenuSelect;
    this.CON_ObjectMenuOKAll = o.CON_ObjectMenuOKAll;
    this.CON_ObjectMenuOK = o.CON_ObjectMenuOK;
    this.CON_ObjectMenuCancel = o.CON_ObjectMenuCancel;
    this.CON_CursorPos = o.CON_CursorPos;
    return this;
  }
}

export class C4PlayerControlRecentKey {
  pressed_key = new $.C4KeyCodeEx().init();
  matched_key = new $.C4KeyCodeEx().init();
  tTime = new $.C4TimeMilliseconds();

  init(pressed_key, matched_key, tTime) {
    this.pressed_key = pressed_key.$clone();
    this.matched_key = matched_key.$clone();
    this.tTime = tTime.$clone();
    return this;
  }

  op_eq(cmp) {
    return this.pressed_key.op_eq(cmp);
  }

  $clone() { return new C4PlayerControlRecentKey().$assign(this); }
  $assign(o) {
    this.pressed_key.$assign(o.pressed_key);
    this.matched_key.$assign(o.matched_key);
    this.tTime.$assign(o.tTime);
    return this;
  }
}

export class C4PlayerControlAssignment {
  KeyCombo = [];
  fComboIsSequence = false;
  TriggerKey = new $.C4KeyCodeEx().init();
  sControlName = new $.StdCopyStrBuf();
  sGUIName = new $.StdCopyStrBuf();
  sGUIDesc = new $.StdCopyStrBuf();
  fGUIDisabled = false;
  fOverrideAssignments = false;
  is_inherited = false;
  fRefsResolved = false;
  iGUIGroup = 0;
  iControl = -1;
  iPriority = 0;
  iTriggerMode = 0;
  inherited_assignment = null;

  init() {
    this.KeyCombo = [];
    this.TriggerKey = new $.C4KeyCodeEx().init();
    this.sControlName = new $.StdCopyStrBuf();
    this.sGUIName = new $.StdCopyStrBuf();
    this.sGUIDesc = new $.StdCopyStrBuf();
    this.fOverrideAssignments = false;
    this.is_inherited = false;
    this.fRefsResolved = false;
    this.iGUIGroup = 0;
    this.iControl = -1;
    this.iPriority = 0;
    this.iTriggerMode = 0;
    this.inherited_assignment = null;
    return this;
  }

  CompileFunc(pComp) {
    if (!pComp.Name(S("Assignment"))) {
      pComp.NameEnd();
      pComp.excNotFound(S("Assignment"));
    }
    pComp.Value$StdNamingDefaultAdapt$StdSTLContainerAdapt$vector$KeyComboItem$vector$KeyComboItem($.mkNamingAdapt$mStdSTLContainerAdapt$vector$KeyComboItem$pi8$vector$b$b($.mkSTLContainerAdapt$rvector$i32$9(this.KeyCombo), S("Key"), []));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "fComboIsSequence"), S("ComboIsSequence"), false));
    pComp.Value$StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x$3($.mkNamingAdapt$mStdParameterAdapt$StdCopyStrBuf$i32$pi8$x$b$b$3($.mkParAdapt$rStdCopyStrBuf$mi32(this.sControlName, 2 /*RCT_Idtf*/), S("Control"), S("None")));
    pComp.Value$StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x$2($.mkNamingAdapt$mStdParameterAdapt$StdCopyStrBuf$i32$pi8$x$b$b$2($.mkParAdapt$rStdCopyStrBuf$mi32(this.sGUIName, 1 /*RCT_All*/), S("GUIName"), S("")));
    pComp.Value$StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x$2($.mkNamingAdapt$mStdParameterAdapt$StdCopyStrBuf$i32$pi8$x$b$b$2($.mkParAdapt$rStdCopyStrBuf$mi32(this.sGUIDesc, 1 /*RCT_All*/), S("GUIDesc"), S("")));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iGUIGroup"), S("GUIGroup"), 0));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "fGUIDisabled"), S("GUIDisabled"), false));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iPriority"), S("Priority"), 0));
    const TriggerModeNames = $own([
  ((($o) => ($o.Name = S("Default"), $o.Val = 0, $o))(new $.StdBitfieldEntry$i32())),
  ((($o) => ($o.Name = S("Hold"), $o.Val = 1, $o))(new $.StdBitfieldEntry$i32())),
  ((($o) => ($o.Name = S("Release"), $o.Val = 2, $o))(new $.StdBitfieldEntry$i32())),
  ((($o) => ($o.Name = S("AlwaysUnhandled"), $o.Val = 4, $o))(new $.StdBitfieldEntry$i32())),
  ((($o) => ($o.Name = S("ClearRecentKeys"), $o.Val = 16, $o))(new $.StdBitfieldEntry$i32())),
  ((($o) => ($o.Name = null, $o.Val = 0, $o))(new $.StdBitfieldEntry$i32())),
]);
    pComp.Value$StdNamingDefaultAdapt$StdBitfieldAdapt$i32$i32($.mkNamingAdapt$mStdBitfieldAdapt$i32$pi8$i32$b$b($.mkBitfieldAdapt$ri32$pStdBitfieldEntry(P(this, "iTriggerMode"), $oat(TriggerModeNames, 0)), S("TriggerMode"), 0 /*CTM_Default*/));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "fOverrideAssignments"), S("OverrideAssignments"), false));
    pComp.NameEnd();
    if (pComp.isDeserializer()) {
      this.fRefsResolved = false;
    }
  }

  CopyKeyFrom(src_assignment) {
    this.KeyCombo = src_assignment.KeyCombo.slice();
    this.TriggerKey.$assign(src_assignment.TriggerKey);
    this.fComboIsSequence = src_assignment.fComboIsSequence;
    if (!src_assignment.fRefsResolved) {
      this.fRefsResolved = false;
    }
  }

  ResolveRefs(pParentSet, pControlDefs) {
    if (!('C4PlayerControlAssignment$ResolveRefs$recursion_check' in $)) $.C4PlayerControlAssignment$ResolveRefs$recursion_check = 0;
    if ($.C4PlayerControlAssignment$ResolveRefs$recursion_check > 10) {
      $.LogFatal($.FormatString(S("Maximum recursion limit reached while resolving player control assignments of set %s in assignment for key %s. This is probably due to a circular control chain."), pParentSet.GetName(), this.GetControlName()).getData());
      return false;
    }
    $.C4PlayerControlAssignment$ResolveRefs$recursion_check = $.C4PlayerControlAssignment$ResolveRefs$recursion_check + 1 | 0;
    this.iControl = pControlDefs.GetControlIndexByIdentifier(this.sControlName.getData());
    let NewCombo = [];
    for (const rKeyComboItem of this.KeyCombo) {
      let szKeyName = rKeyComboItem.sKeyName.getData();
      let is_key_reference = false;
      let last_shift_delim_pos = 0;
      if (szKeyName != null && szKeyName.a[szKeyName.o] !== 0) {
        if ((last_shift_delim_pos = $.SCharLastPos(43, szKeyName)) > -1) {
          szKeyName = szKeyName.add(last_shift_delim_pos + 1 | 0);
        }
        if ($.SEqual2(szKeyName, S("CON_"))) {
          is_key_reference = true;
          szKeyName = szKeyName.add(4);
        }
      }
      if (is_key_reference) {
        let pRefAssignment = pParentSet.GetAssignmentByControlName(szKeyName);
        if (pRefAssignment != null) {
          if (!pRefAssignment.IsRefsResolved()) {
            if (!pRefAssignment.ResolveRefs(pParentSet, pControlDefs)) {
              $.C4PlayerControlAssignment$ResolveRefs$recursion_check = $.C4PlayerControlAssignment$ResolveRefs$recursion_check - 1 | 0;
              return false;
            }
          }
          let ref_shift = rKeyComboItem.Key.dwShift;
          if (ref_shift !== 0) {
            for (const $x5 of pRefAssignment.KeyCombo) {
              const assignment_combo_item = $x5.$clone();
              assignment_combo_item.Key.dwShift = (assignment_combo_item.Key.dwShift | ref_shift) >>> 0;
              $vpush(NewCombo, assignment_combo_item.$clone());
            }
          } else {
            seq_insert(NewCombo, $end(NewCombo), $begin(pRefAssignment.KeyCombo), $end(pRefAssignment.KeyCombo), (x) => x.$clone());
          }
        } else {
          $.LogF(S("WARNING: Control %s of set %s contains reference to unassigned control %s."), this.GetControlName(), pParentSet.GetName(), rKeyComboItem.sKeyName.getData());
          NewCombo.length = 0;
        }
      } else {
        $vpush(NewCombo, rKeyComboItem.$clone());
      }
    }
    this.KeyCombo = NewCombo.slice();
    if (this.KeyCombo.length > 1 && !this.fComboIsSequence) {
      let shift = 0;
      for (const i of this.KeyCombo) {
        if (i.Key.Key === 29 || i.Key.Key === 97) {
          shift |= 2;
        }
        if (i.Key.Key === 42 || i.Key.Key === 54) {
          shift |= 4;
        }
        shift = (shift >>> 0 | i.Key.dwShift) >>> 0 | 0;
      }
      for (const i of this.KeyCombo) {
        i.Key.dwShift = (i.Key.dwShift | shift >>> 0) >>> 0;
      }
    }
    for (const i of this.KeyCombo) {
      i.Key.FixShiftKeys();
    }
    if (this.KeyCombo.length !== 0) {
      this.TriggerKey.$assign(this.KeyCombo[this.KeyCombo.length - 1].Key);
    } else {
      this.TriggerKey.$assign(new $.C4KeyCodeEx().init());
    }
    this.fRefsResolved = true;
    $.C4PlayerControlAssignment$ResolveRefs$recursion_check = $.C4PlayerControlAssignment$ResolveRefs$recursion_check - 1 | 0;
    return true;
  }

  IsComboMatched(DownKeys, RecentKeys) {
    0;
    if (this.fComboIsSequence) {
      let tKeyLast = $.C4TimeMilliseconds.Now();
      let i = $rbegin(this.KeyCombo).add(1);
      for (let ri = $rbegin(RecentKeys); !i.eq($rend(this.KeyCombo)); ri.inc()) {
        if (ri.eq($rend(RecentKeys))) {
          return false;
        }
        const rk = ri.v;
        let tKeyRecent = rk.tTime.$clone();
        if ($.op_sub$C4TimeMilliseconds$C4TimeMilliseconds(tKeyLast, tKeyRecent) > 800) {
          return false;
        }
        const k = i.v;
        if (!rk.matched_key.op_eq(k.Key)) {
          if ($.Key_IsMouse(rk.matched_key.Key) && $.Key_GetMouseEvent(rk.matched_key.Key) === 1) {
            continue;
          }
          return false;
        }
        i.inc();
      }
    } else {
      for (const k of this.KeyCombo) {
        let fFound = false;
        for (const dk of DownKeys) {
          if (dk.matched_key.op_eq(k.Key)) {
            fFound = true;
            break;
          }
        }
        if (!fFound) {
          return false;
        }
      }
    }
    return true;
  }

  SetInherited(to_val) {
    this.is_inherited = to_val;
  }

  SetInheritedAssignment(to_val) {
    this.inherited_assignment = to_val;
  }

  ResetKeyToInherited() {
    if (this.inherited_assignment != null) {
      this.CopyKeyFrom(this.inherited_assignment);
    }
  }

  IsKeyChanged() {
    if (this.inherited_assignment == null) {
      return true;
    }
    return !seq_equal(this.KeyCombo, this.inherited_assignment.KeyCombo) || (this.fComboIsSequence ? 1 : 0) !== (this.inherited_assignment.fComboIsSequence ? 1 : 0);
  }

  SetControlName(control_name) {
    this.sControlName.Copy$pi8(control_name);
  }

  SetKey(key) {
    resize(this.KeyCombo, 1, () => new C4PlayerControlAssignment$KeyComboItem().None());
    this.KeyCombo[0].Key.$assign(key);
    this.KeyCombo[0].Key.fRepeated = false;
    this.KeyCombo[0].sKeyName.Clear();
    this.fComboIsSequence = false;
    this.TriggerKey.$assign(key);
  }

  op_eq(cmp) {
    return seq_equal(this.KeyCombo, cmp.KeyCombo) && this.sControlName.op_eq$StdStrBuf(cmp.sControlName) && this.sGUIName.op_eq$StdStrBuf(cmp.sGUIName) && this.sGUIDesc.op_eq$StdStrBuf(cmp.sGUIDesc) && (this.fGUIDisabled ? 1 : 0) === (cmp.fGUIDisabled ? 1 : 0) && this.iTriggerMode === cmp.iTriggerMode && this.iPriority === cmp.iPriority;
  }

  op_lt(cmp) {
    return this.iPriority > cmp.iPriority;
  }

  GetControlName() {
    return this.sControlName.getData();
  }

  GetControl() {
    return this.iControl;
  }

  GetGUIName(defs) {
    if (this.sGUIName.getLength() !== 0) {
      if (this.sGUIName.op_eq$pi8(S("None"))) {
        return S("");
      }
      return this.sGUIName.getData();
    }
    let def = defs.GetControlByIndex(this.GetControl());
    if (def != null) {
      return def.GetGUIName();
    }
    return null;
  }

  GetGUIDesc(defs) {
    if (this.sGUIDesc.getLength() !== 0) {
      return this.sGUIDesc.getData();
    }
    let def = defs.GetControlByIndex(this.GetControl());
    if (def != null) {
      return def.GetGUIDesc();
    }
    return null;
  }

  IsGUIDisabled() {
    return this.fGUIDisabled;
  }

  GetGUIGroup() {
    return this.iGUIGroup;
  }

  IsRefsResolved() {
    return this.fRefsResolved;
  }

  ResetRefsResolved() {
    this.fRefsResolved = false;
  }

  IsAlwaysUnhandled() {
    return !!((this.iTriggerMode & 4) !== 0);
  }

  GetTriggerMode() {
    return this.iTriggerMode;
  }

  GetTriggerKey() {
    return this.TriggerKey;
  }

  HasCombo() {
    return this.KeyCombo.length > 1;
  }

  IsOverrideAssignments() {
    return this.fOverrideAssignments;
  }

  IsInherited() {
    return this.is_inherited;
  }

  GetInheritedAssignment() {
    return this.inherited_assignment;
  }

  GetKeysAsString(human_readable, short_name) {
    let result = new $.StdStrBuf();
    if (this.KeyCombo.length === 0) {
      return result;
    }
    let i = $begin(this.KeyCombo);
    result.Take$mStdStrBuf(i.v.Key.ToString(human_readable, short_name));
    while (!i.inc().eq($end(this.KeyCombo))) {
      result.AppendChar(this.fComboIsSequence ? 44 : 43);
      result.Append$StdStrBuf(i.v.Key.ToString(human_readable, short_name));
    }
    return result;
  }

  $clone() { return new C4PlayerControlAssignment().$assign(this); }
  $assign(o) {
    this.KeyCombo = o.KeyCombo.slice();
    this.fComboIsSequence = o.fComboIsSequence;
    this.TriggerKey.$assign(o.TriggerKey);
    this.sControlName.$assign(o.sControlName);
    this.sGUIName.$assign(o.sGUIName);
    this.sGUIDesc.$assign(o.sGUIDesc);
    this.fGUIDisabled = o.fGUIDisabled;
    this.fOverrideAssignments = o.fOverrideAssignments;
    this.is_inherited = o.is_inherited;
    this.fRefsResolved = o.fRefsResolved;
    this.iGUIGroup = o.iGUIGroup;
    this.iControl = o.iControl;
    this.iPriority = o.iPriority;
    this.iTriggerMode = o.iTriggerMode;
    this.inherited_assignment = o.inherited_assignment;
    return this;
  }
}

export class C4PlayerControlAssignment$KeyComboItem {
  Key = new $.C4KeyCodeEx().init();
  sKeyName = new $.StdCopyStrBuf();

  CompileFunc(pComp) {
    if (pComp.isDeserializer()) {
      this.Key.dwShift = 0;
      this.sKeyName.Clear();
      pComp.Value$StdParameterAdapt$C4KeyCodeEx$pStdCopyStrBuf($.mkParAdapt$rC4KeyCodeEx$mpStdCopyStrBuf(this.Key, this.sKeyName));
    } else {
      if (this.sKeyName.op_not()) {
        this.UpdateKeyName();
      }
      pComp.Value$StdParameterAdapt$StdCopyStrBuf$i32($.mkParAdapt$rStdCopyStrBuf$mi32(this.sKeyName, 2 /*RCT_Idtf*/));
    }
  }

  UpdateKeyName() {
    this.sKeyName.Copy$StdStrBuf(this.Key.ToString(false, false));
  }

  None() {
    this.Key = new $.C4KeyCodeEx().init();
    this.sKeyName = new $.StdCopyStrBuf();
    return this;
  }

  $clone() { return new C4PlayerControlAssignment$KeyComboItem().$assign(this); }
  $assign(o) {
    this.Key.$assign(o.Key);
    this.sKeyName.$assign(o.sKeyName);
    return this;
  }
}

export class C4PlayerControlAssignmentSet {
  sName = new $.StdCopyStrBuf();
  sGUIName = new $.StdCopyStrBuf();
  sParentSetName = new $.StdCopyStrBuf();
  Assignments = [];
  has_keyboard = true;
  has_mouse = true;
  has_gamepad = false;

  init() {
    this.sName = new $.StdCopyStrBuf();
    this.sGUIName = new $.StdCopyStrBuf();
    this.sParentSetName = new $.StdCopyStrBuf();
    this.Assignments = [];
    this.has_keyboard = true;
    this.has_mouse = true;
    this.has_gamepad = false;
    return this;
  }

  InitEmptyFromTemplate(template_set) {
    this.sName.Copy$StdStrBuf(template_set.sName);
    this.sGUIName.Copy$StdStrBuf(template_set.sGUIName);
    this.sParentSetName.Copy$StdStrBuf(template_set.sParentSetName);
    this.has_keyboard = template_set.has_keyboard;
    this.has_mouse = template_set.has_mouse;
    this.has_gamepad = template_set.has_gamepad;
  }

  CompileFunc(pComp) {
    if (!pComp.Name(S("ControlSet"))) {
      pComp.NameEnd();
      pComp.excNotFound(S("ControlSet"));
    }
    pComp.Value$StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x$3($.mkNamingAdapt$mStdParameterAdapt$StdCopyStrBuf$i32$pi8$x$b$b$3($.mkParAdapt$rStdCopyStrBuf$mi32(this.sName, 1 /*RCT_All*/), S("Name"), S("None")));
    pComp.Value$StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x($.mkNamingAdapt$mStdParameterAdapt$StdCopyStrBuf$i32$pi8$x$b$b($.mkParAdapt$rStdCopyStrBuf$mi32(this.sGUIName, 1 /*RCT_All*/), S("GUIName"), S("undefined")));
    pComp.Value$StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x$2($.mkNamingAdapt$mStdParameterAdapt$StdCopyStrBuf$i32$pi8$x$b$b$2($.mkParAdapt$rStdCopyStrBuf$mi32(this.sParentSetName, 2 /*RCT_Idtf*/), S("Parent"), S("")));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "has_keyboard"), S("Keyboard"), true));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "has_mouse"), S("Mouse"), true));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "has_gamepad"), S("Gamepad"), false));
    pComp.Value$StdSTLContainerAdapt$vector$C4PlayerControlAssignment($.mkSTLContainerAdapt$rvector$i32$5(this.Assignments, 0 /*SEP_NONE*/));
    pComp.NameEnd();
  }

  ResolveRefs(pDefs) {
    for (const Assignment of this.Assignments) {
      Assignment.ResetRefsResolved();
    }
    for (const Assignment of this.Assignments) {
      if (!Assignment.IsRefsResolved()) {
        if (!Assignment.ResolveRefs(this, pDefs)) {
          return false;
        }
      }
    }
    return true;
  }

  SortAssignments() {
    std_sort($begin(this.Assignments), $end(this.Assignments));
  }

  MergeFrom(Src, merge_mode) {
    for (const SrcAssignment of Src.Assignments) {
      let fIsReleaseKey = !!((SrcAssignment.GetTriggerMode() & 2) !== 0);
      if (merge_mode !== 1 && SrcAssignment.IsOverrideAssignments()) {
        let any_remaining = true;
        while (any_remaining) {
          any_remaining = false;
          for (let j = $begin(this.Assignments); !j.eq($end(this.Assignments)); j.inc()) {
            if ($.SEqual(j.v.GetControlName(), SrcAssignment.GetControlName())) {
              let fSelfIsReleaseKey = !!((j.v.GetTriggerMode() & 2) !== 0);
              if ((fSelfIsReleaseKey ? 1 : 0) === (fIsReleaseKey ? 1 : 0)) {
                seq_erase(this.Assignments, $itcopy(j));
                any_remaining = true;
                break;
              }
            }
          }
        }
      } else if (merge_mode === 1 || merge_mode === 3) {
        let any_override = false;
        for (const Assignment of this.Assignments) {
          if ($.SEqual(Assignment.GetControlName(), SrcAssignment.GetControlName())) {
            let fSelfIsReleaseKey = !!((Assignment.GetTriggerMode() & 2) !== 0);
            if ((fSelfIsReleaseKey ? 1 : 0) === (fIsReleaseKey ? 1 : 0)) {
              any_override = true;
              if (merge_mode === 3) {
                Assignment.CopyKeyFrom(SrcAssignment);
                Assignment.SetInherited(false);
              }
              break;
            }
          }
        }
        if (any_override) {
          continue;
        }
      }
      $vpush(this.Assignments, SrcAssignment.$clone());
      if (merge_mode === 2) {
        this.Assignments[this.Assignments.length - 1].SetInherited(true);
        this.Assignments[this.Assignments.length - 1].SetInheritedAssignment(SrcAssignment);
      }
    }
  }

  CreateAssignmentForControl(control_name) {
    $vpush(this.Assignments, new C4PlayerControlAssignment().init());
    this.Assignments[this.Assignments.length - 1].SetControlName(control_name);
    return this.Assignments[this.Assignments.length - 1];
  }

  RemoveAssignmentByControlName(control_name) {
    for (let i = $begin(this.Assignments); !i.eq($end(this.Assignments)); i.inc()) {
      if ($.SEqual(i.v.GetControlName(), control_name)) {
        seq_erase(this.Assignments, $itcopy(i));
        return;
      }
    }
  }

  GetName() {
    return this.sName.getData();
  }

  GetGUIName() {
    return this.sGUIName.getData();
  }

  IsWildcardName() {
    return $.IsWildcardString(this.sName.getData());
  }

  GetAssignmentByIndex(index) {
    if (index < 0 || index >= (this.Assignments.length | 0)) {
      return null;
    }
    return this.Assignments[$u64n(index)];
  }

  GetAssignmentByControlName(szControlName) {
    for (const Assignment of this.Assignments) {
      if ($.SEqual(Assignment.GetControlName(), szControlName)) {
        if (!((Assignment.GetTriggerMode() & 2) !== 0)) {
          return Assignment;
        }
      }
    }
    return null;
  }

  GetAssignmentByControl(control) {
    for (const Assignment of this.Assignments) {
      if (Assignment.GetControl() === control) {
        if (!((Assignment.GetTriggerMode() & 2) !== 0)) {
          return Assignment;
        }
      }
    }
    return null;
  }

  GetAssignmentsByKey(rDefs, key, fHoldKeysOnly, pOutVec, DownKeys, RecentKeys) {
    0;
    for (const rAssignment of this.Assignments) {
      const rAssignmentTriggerKey = rAssignment.GetTriggerKey();
      if (!(rAssignmentTriggerKey.Key === key.Key)) {
        continue;
      }
      if (!fHoldKeysOnly) {
        if (rAssignmentTriggerKey.dwShift !== key.dwShift) {
          continue;
        }
      }
      let pCtrl = rDefs.GetControlByIndex(rAssignment.GetControl());
      if (pCtrl == null) {
        continue;
      }
      if (fHoldKeysOnly) {
        if (!pCtrl.IsHoldKey() || (rAssignment.GetTriggerMode() & 3) !== 0) {
          continue;
        }
      } else if (rAssignment.HasCombo()) {
        if (!rAssignment.IsComboMatched(DownKeys, RecentKeys)) {
          continue;
        }
      }
      pOutVec.push(rAssignment);
    }
  }

  GetTriggerKeys(rDefs, pRegularKeys, pHoldKeys) {
    for (const rAssignment of this.Assignments) {
      let pDef = rDefs.GetControlByIndex(rAssignment.GetControl());
      if (pDef != null && pDef.IsHoldKey()) {
        const rKey = rAssignment.GetTriggerKey();
        if (std_find($begin(pHoldKeys), $end(pHoldKeys), rKey, (x, y) => x.op_eq(y)).eq($end(pHoldKeys))) {
          $vpush(pHoldKeys, rKey.$clone());
        }
      }
    }
    for (const rAssignment of this.Assignments) {
      let pDef = rDefs.GetControlByIndex(rAssignment.GetControl());
      if (pDef != null && !pDef.IsHoldKey()) {
        const rKey = rAssignment.GetTriggerKey();
        if (std_find($begin(pHoldKeys), $end(pHoldKeys), rKey, (x, y) => x.op_eq(y)).eq($end(pHoldKeys))) {
          if (std_find($begin(pRegularKeys), $end(pRegularKeys), rKey, (x, y) => x.op_eq(y)).eq($end(pRegularKeys))) {
            $vpush(pRegularKeys, rKey.$clone());
          }
        }
      }
    }
  }

  op_eq(cmp) {
    return seq_equal(this.Assignments, cmp.Assignments) && this.sName.op_eq$StdStrBuf(cmp.sName);
  }

  GetPicture() {
    if (this.HasGamepad()) {
      return $.GraphicsResource.fctGamepad.GetPhase(0);
    }
    if (this.HasKeyboard()) {
      return $.GraphicsResource.fctKeyboard.GetPhase($.Game.PlayerControlUserAssignmentSets.GetSetIndex(this));
    }
    return new $.C4Facet().init$v();
  }

  HasKeyboard() {
    return this.has_keyboard;
  }

  HasMouse() {
    return this.has_mouse;
  }

  HasGamepad() {
    return this.has_gamepad;
  }

  GetLayoutOrder() {
    return 0;
  }

  IsMouseControlAssigned(_mouseevent) {
    return true;
  }

  $clone() { return new C4PlayerControlAssignmentSet().$assign(this); }
  $assign(o) {
    this.sName.$assign(o.sName);
    this.sGUIName.$assign(o.sGUIName);
    this.sParentSetName.$assign(o.sParentSetName);
    this.Assignments = o.Assignments.slice();
    this.has_keyboard = o.has_keyboard;
    this.has_mouse = o.has_mouse;
    this.has_gamepad = o.has_gamepad;
    return this;
  }
}

export class C4PlayerControlAssignmentSets {
  Sets = [];
  clear_previous = false;

  init() {
    this.Sets = [];
    this.clear_previous = false;
    return this;
  }

  Clear() {
    this.Sets.length = 0;
  }

  CompileFunc(pComp) {
    if (pComp.isSerializer() && pComp.isRegistry()) {
      pComp.Default(S("ControlSets"));
    }
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "clear_previous"), S("ClearPrevious"), false));
    pComp.Value$StdSTLContainerAdapt$list$C4PlayerControlAssignmentSet($.mkSTLContainerAdapt$rlist$i32$2(this.Sets, 0 /*SEP_NONE*/));
  }

  op_eq(cmp) {
    return seq_equal(this.Sets, cmp.Sets) && (this.clear_previous ? 1 : 0) === (cmp.clear_previous ? 1 : 0);
  }

  ResolveRefs(pDefs) {
    for (const Set of this.Sets) {
      if (!Set.ResolveRefs(pDefs)) {
        return false;
      }
    }
    return true;
  }

  SortAssignments() {
    for (const Set of this.Sets) {
      Set.SortAssignments();
    }
  }

  MergeFrom(Src, merge_mode) {
    if (Src.clear_previous) {
      this.Sets.length = 0;
    }
    for (const SrcSet of Src.Sets) {
      let fIsWildcardSet = SrcSet.IsWildcardName();
      if (!fIsWildcardSet) {
        let pPrevSet = this.GetSetByName(SrcSet.GetName());
        if (pPrevSet == null && merge_mode === 2) {
          pPrevSet = this.CreateEmptySetByTemplate(SrcSet);
        }
        if (pPrevSet != null) {
          pPrevSet.MergeFrom(SrcSet, merge_mode);
        } else {
          $vpush(this.Sets, SrcSet.$clone());
        }
      } else {
        for (const DstSet of this.Sets) {
          if ($.WildcardMatch(SrcSet.GetName(), DstSet.GetName())) {
            DstSet.MergeFrom(SrcSet, merge_mode);
          }
        }
      }
    }
  }

  CreateEmptySetByTemplate(template_set) {
    $vpush(this.Sets, new C4PlayerControlAssignmentSet().init());
    this.Sets[this.Sets.length - 1].InitEmptyFromTemplate(template_set);
    return this.Sets[this.Sets.length - 1];
  }

  RemoveSetByName(set_name) {
    for (let i = $begin(this.Sets); !i.eq($end(this.Sets)); i.inc()) {
      if ($.SEqual(set_name, i.v.GetName())) {
        seq_erase(this.Sets, $itcopy(i));
        return;
      }
    }
  }

  GetSetByName(szName) {
    for (const Set of this.Sets) {
      if ($.WildcardMatch(szName, Set.GetName())) {
        return Set;
      }
    }
    return null;
  }

  GetDefaultSet() {
    if (this.Sets.length === 0) {
      return null;
    }
    return this.Sets[0];
  }

  GetSetIndex(set) {
    let index = 0;
    for (let i = $begin(this.Sets); !i.eq($end(this.Sets)); i.inc(), index = index + 1 | 0) {
      if (i.v === set) {
        return index;
      }
    }
    return -1;
  }

  GetSetByIndex(index) {
    let $t1;
    if (index < 0 || index >= (this.Sets.length | 0)) {
      return null;
    }
    let i = $begin(this.Sets);
    while (($t1 = index, index = index - 1 | 0, $t1) !== 0) {
      i.inc();
    }
    return i.v;
  }

  GetSetCount() {
    return this.Sets.length;
  }

  $clone() { return new C4PlayerControlAssignmentSets().$assign(this); }
  $assign(o) {
    this.Sets = o.Sets.slice();
    this.clear_previous = o.clear_previous;
    return this;
  }
}

export class C4PlayerControlFile {
  ControlDefs = new C4PlayerControlDefs().init();
  AssignmentSets = new C4PlayerControlAssignmentSets().init();

  Clear() {
    this.ControlDefs.Clear();
    this.AssignmentSets.Clear();
  }

  CompileFunc(pComp) {
    pComp.Value$StdNamingDefaultAdapt$C4PlayerControlDefs$C4PlayerControlDefs($.mkNamingAdapt$rC4PlayerControlDefs$pi8$C4PlayerControlDefs$b$b(this.ControlDefs, S("ControlDefs"), new C4PlayerControlDefs().init()));
    pComp.Value$StdNamingDefaultAdapt$C4PlayerControlAssignmentSets$C4PlayerControlAssignmentSets($.mkNamingAdapt$rC4PlayerControlAssignmentSets$pi8$C4PlayerControlAssignmentSets$b$b(this.AssignmentSets, S("ControlSets"), new C4PlayerControlAssignmentSets().init()));
  }

  Load(hGroup, szFilename, pLang) {
    this.Clear();
    let Buf = new $.StdStrBuf();
    if (!hGroup.LoadEntryString$pi8$pStdStrBuf(szFilename, Buf)) {
      return false;
    }
    if (pLang != null) {
      pLang.ReplaceStrings$rStdStrBuf(Buf);
    }
    if (!$.CompileFromBuf_LogWarn$rC4PlayerControlFile$x$pi8(this, Buf, szFilename)) {
      return false;
    }
    return true;
  }

  Save(hGroup, szFilename) {
    let Buf = new $.StdStrBuf();
    if (!$.DecompileToBuf_Log$rC4PlayerControlFile$px$pi8(this, Buf, szFilename)) {
      return false;
    }
    hGroup.Add$pi8$rStdStrBuf$b$b$b(szFilename, Buf, false, true);
    return true;
  }

  GetControlDefs() {
    return this.ControlDefs;
  }

  GetAssignmentSets() {
    return this.AssignmentSets;
  }

  None() {
    this.ControlDefs = new C4PlayerControlDefs().init();
    this.AssignmentSets = new C4PlayerControlAssignmentSets().init();
    return this;
  }

  $clone() { return new C4PlayerControlFile().$assign(this); }
  $assign(o) {
    this.ControlDefs.$assign(o.ControlDefs);
    this.AssignmentSets.$assign(o.AssignmentSets);
    return this;
  }
}

export class C4PlayerControl {
  ControlDefs = null;
  iPlr = -1;
  pControlSet = null;
  KeyBindings = [];
  RecentKeys = [];
  DownKeys = [];
  IsCursorPosRequested = false;
  Sync = new C4PlayerControl$CSync().None();

  ProcessKeyEvent(pressed_key, matched_key, state, rKeyExtraData, reset_down_states_only = false, clear_recent_keys = null) {
    if ($.Key_IsGamepad(pressed_key.Key)) {
      let plr = $.Players.Get(this.iPlr);
      if (plr == null || plr.pGamepad == null || plr.pGamepad.GetID() !== pressed_key.deviceId) {
        return false;
      }
    }
    let Matches = [];
    0;
    this.pControlSet.GetAssignmentsByKey(this.ControlDefs, matched_key, state !== 0, Matches, this.DownKeys, this.RecentKeys);
    let cursor_pos_added = false;
    let pControlPacket = null;
    for (let i = $begin(Matches); !i.eq($end(Matches)); i.inc()) {
      let pAssignment = i.v;
      0;
      let iControlIndex = pAssignment.GetControl();
      let pControlDef = this.ControlDefs.GetControlByIndex(iControlIndex);
      if (pControlDef != null && pControlDef.IsValid() && !this.Sync.IsControlDisabled(iControlIndex) && (state === 0 || pControlDef.IsHoldKey())) {
        if (clear_recent_keys != null && (pAssignment.GetTriggerMode() & 16) !== 0) {
          clear_recent_keys.a[clear_recent_keys.o] = true;
        }
        if (pControlDef.IsAsync() && pControlPacket == null) {
          if (pControlDef.IsSendCursorPos()) {
            this.IsCursorPosRequested = true;
          }
          if (this.ExecuteControl(iControlIndex, state, rKeyExtraData, pAssignment.GetTriggerMode(), pressed_key.IsRepeated(), reset_down_states_only)) {
            return true;
          }
        } else {
          if (pressed_key.IsRepeated()) {
            return false;
          }
          if (pControlPacket == null) {
            pControlPacket = new $.C4ControlPlayerControl().init$i32$i32$C4KeyEventData(this.iPlr, state, rKeyExtraData);
          }
          let extra_trigger_mode = 0;
          if (reset_down_states_only) {
            extra_trigger_mode |= 8;
          }
          pControlPacket.AddControl(iControlIndex, pAssignment.GetTriggerMode() | extra_trigger_mode);
          if (pControlDef.IsSendCursorPos() && !cursor_pos_added) {
            const x = [0];
            const y = [0];
            const game_x = [0];
            const game_y = [0];
            if (this.GetCurrentPlayerCursorPos(P(x, 0), P(y, 0), P(game_x, 0), P(game_y, 0))) {
              let cursor_key_data = rKeyExtraData.$clone();
              cursor_key_data.vp_x = x[0];
              cursor_key_data.vp_y = y[0];
              cursor_key_data.game_x = game_x[0];
              cursor_key_data.game_y = game_y[0];
              pControlPacket.SetExtraData(cursor_key_data);
            }
            this.IsCursorPosRequested = true;
            cursor_pos_added = true;
          }
        }
      }
    }
    if (pControlPacket != null) {
      $.Game.Input.Add$i32$pC4ControlPacket(161 /*CID_PlrControl*/, pControlPacket);
      return true;
    }
    return false;
  }

  ProcessKeyDown(pressed_key, matched_key) {
    let RKey = new C4PlayerControlRecentKey().init(pressed_key, matched_key, $.C4TimeMilliseconds.Now());
    if (!$.Key_IsMouse(pressed_key.Key) || $.Inside$u8$u64$u64($.Key_GetMouseEvent(pressed_key.Key), 16, 47)) {
      if (std_find($begin(this.DownKeys), $end(this.DownKeys), pressed_key, (x, y) => x.op_eq(y)).eq($end(this.DownKeys))) {
        $vpush(this.DownKeys, RKey.$clone());
      }
    }
    const clear_recent_keys = [false];
    let fResult = this.ProcessKeyEvent(pressed_key, matched_key, 0 /*CONS_Down*/, $.Game.KeyboardInput.GetLastKeyExtraData(), false, P(clear_recent_keys, 0));
    if (clear_recent_keys[0]) {
      this.RecentKeys.length = 0;
    } else if (!pressed_key.IsRepeated()) {
      $vpush(this.RecentKeys, RKey.$clone());
    }
    return fResult;
  }

  ProcessKeyUp(pressed_key, matched_key) {
    if (!$.Key_IsMouse(pressed_key.Key) || $.Inside$u8$u64$u64($.Key_GetMouseEvent(pressed_key.Key), 16, 47)) {
      let i = std_find($begin(this.DownKeys), $end(this.DownKeys), pressed_key, (x, y) => x.op_eq(y));
      if (!i.eq($end(this.DownKeys))) {
        seq_erase(this.DownKeys, $itcopy(i));
      }
    }
    return this.ProcessKeyEvent(pressed_key, matched_key, 1 /*CONS_Up*/, $.Game.KeyboardInput.GetLastKeyExtraData());
  }

  ProcessKeyMoved(pressed_key, matched_key) {
    return this.ProcessKeyEvent(pressed_key, matched_key, 2 /*CONS_Moved*/, $.Game.KeyboardInput.GetLastKeyExtraData());
  }

  ExecuteControl(iControl, state, rKeyExtraData, iTriggerMode, fRepeated, fHandleDownStateOnly) {
    let pControlDef = this.ControlDefs.GetControlByIndex(iControl);
    if (pControlDef == null || this.Sync.IsControlDisabled(iControl)) {
      return false;
    }
    let eAction = pControlDef.GetAction();
    let KeyExtraData = rKeyExtraData.$clone();
    let pCtrlDownState = this.Sync.GetControlDownState(iControl);
    let fWasDown = pCtrlDownState != null ? pCtrlDownState.IsDown() : false;
    if ((this.IsGlobal() ? 1 : 0) !== (pControlDef.IsGlobal() ? 1 : 0)) {
      return false;
    }
    if ((iTriggerMode & 8) !== 0) {
      fHandleDownStateOnly = true;
    }
    if ((iTriggerMode & 3) !== 0) {
      if (eAction !== 1) {
        return false;
      }
      if (!pControlDef.IsHoldKey()) {
        return false;
      }
      if (state === 1) {
        return false;
      }
      if (fWasDown) {
        if ((iTriggerMode & 2) !== 0) {
          KeyExtraData.iStrength = 0;
          this.Sync.SetControlDownState(iControl, KeyExtraData, $.Game.FrameCounter, false);
          state = 1 /*CONS_Up*/;
          fRepeated = false;
        } else {
          0;
          this.Sync.SetControlDownState(iControl, KeyExtraData, $.Game.FrameCounter, false);
          fRepeated = true;
        }
      } else {
        if ((iTriggerMode & 1) !== 0) {
          this.Sync.SetControlDownState(iControl, KeyExtraData, $.Game.FrameCounter, false);
          fRepeated = false;
        } else {
          return false;
        }
      }
    } else if (state === 1) {
      if (!fWasDown) {
        return false;
      }
      this.Sync.SetControlDownState(iControl, KeyExtraData, $.Game.FrameCounter, true);
    } else if (pControlDef.IsHoldKey()) {
      if (state === 2) {
        this.Sync.SetControlMovedState(iControl, KeyExtraData, $.Game.FrameCounter);
        fRepeated = true;
      } else {
        this.Sync.SetControlDownState(iControl, KeyExtraData, $.Game.FrameCounter, true);
        fRepeated = fWasDown;
      }
    }
    if (fHandleDownStateOnly) {
      return false;
    }
    let fHandled = this.ExecuteControlAction(iControl, eAction, pControlDef.GetExtraData(), state, KeyExtraData, fRepeated);
    let pPlr = null;
    if ((pPlr = $.Players.Get(this.iPlr)) != null) {
      if (pPlr.ShowStartup) {
        pPlr.ShowStartup = false;
      }
    }
    return fHandled && !((iTriggerMode & 4) !== 0);
  }

  ExecuteControlAction(iControl, eAction, idControlExtraData, state, rKeyExtraData, fRepeated) {
    if (state === 2 && eAction !== 1) {
      return false;
    }
    let pPlr = null;
    let pVP = null;
    let pCursor = null;
    let pCursorMenu = null;
    if (this.iPlr > -1) {
      pPlr = $.Players.Get(this.iPlr);
      if (pPlr == null) {
        return false;
      }
      pCursor = pPlr.Cursor.op_C4Object_();
      if (pCursor != null && pCursor.Menu != null && pCursor.Menu.IsActive$v()) {
        pCursorMenu = pCursor.Menu;
      }
    }
    let fUp = state === 1;
    switch (eAction) {
      case 1:
        return this.ExecuteControlScript(iControl, idControlExtraData.$clone(), state, rKeyExtraData, fRepeated);
      case 2:
        if (pPlr == null || fUp) {
          return false;
        }
        if (pPlr.Menu.IsActive$v()) {
          pPlr.Menu.TryClose(false, true);
        } else {
          pPlr.ActivateMenuMain();
        }
        return true;
      case 3:
        if (pPlr == null || !pPlr.Menu.IsActive$v() || fUp) {
          return false;
        }
        pPlr.Menu.Control(38, 0);
        return true;
      case 4:
        if (pPlr == null || !pPlr.Menu.IsActive$v() || fUp) {
          return false;
        }
        pPlr.Menu.Control(40, 0);
        return true;
      case 5:
        if (pPlr == null || !pPlr.Menu.IsActive$v() || fUp) {
          return false;
        }
        pPlr.Menu.Control(52, 0);
        return true;
      case 6:
        if (pPlr == null || !pPlr.Menu.IsActive$v() || fUp) {
          return false;
        }
        pPlr.Menu.Control(54, 0);
        return true;
      case 7:
        if (pPlr == null || !pPlr.Menu.IsActive$v() || fUp) {
          return false;
        }
        pPlr.Menu.Control(53, 0);
        return true;
      case 8:
        if (pPlr == null || !pPlr.Menu.IsActive$v() || fUp) {
          return false;
        }
        pPlr.Menu.Control(55, 0);
        return true;
      case 9:
        if (pCursorMenu == null || fUp || !pCursorMenu.IsTextProgressing()) {
          return false;
        }
        pCursorMenu.Control(42, 0);
        return true;
      case 10:
        if (pCursorMenu == null || fUp) {
          return false;
        }
        pCursorMenu.Control(38, 0);
        return true;
      case 11:
        if (pCursorMenu == null || fUp) {
          return false;
        }
        pCursorMenu.Control(39, 0);
        return true;
      case 12:
        if (pCursorMenu == null || fUp) {
          return false;
        }
        pCursorMenu.Control(60, rKeyExtraData.iStrength);
        return true;
      case 13:
        if (pCursorMenu == null || fUp) {
          return false;
        }
        pCursorMenu.Control(40, 0);
        return true;
      case 14:
        if (pCursorMenu == null || fUp) {
          return false;
        }
        pCursorMenu.Control(52, 0);
        return true;
      case 15:
        if (pCursorMenu == null || fUp) {
          return false;
        }
        pCursorMenu.Control(54, 0);
        return true;
      case 16:
        if (pCursorMenu == null || fUp) {
          return false;
        }
        pCursorMenu.Control(53, 0);
        return true;
      case 17:
        if (pCursorMenu == null || fUp) {
          return false;
        }
        pCursorMenu.Control(55, 0);
        return true;
      case 18:
        if (pPlr == null || fUp || !((pVP = $.Viewports.GetViewport(this.iPlr)) != null)) {
          return false;
        }
        pVP.ChangeZoom($.C4GFX_ZoomStep$C4PlayerControl);
        return true;
      case 19:
        if (pPlr == null || fUp || !((pVP = $.Viewports.GetViewport(this.iPlr)) != null)) {
          return false;
        }
        pVP.ChangeZoom(Math.fround(1 / $.C4GFX_ZoomStep$C4PlayerControl));
        return true;
      default:
        return false;
    }
  }

  ExecuteControlScript(iControl$, idControlExtraData, state, rKeyExtraData, fRepeated$) {
    const iControl = [iControl$];
    const fRepeated = [fRepeated$];
    let pPlr = $.Players.Get(this.iPlr);
    if (pPlr != null) {
      if (pPlr.Eliminated !== 0) {
        return false;
      }
      if (state !== 2) {
        pPlr.CountControl(4 /*PCID_DirectCom*/, Math.imul(iControl[0], 2) + state | 0);
      }
    } else if (this.iPlr > -1) {
      return false;
    }
    let x = 0;
    let y = 0;
    let def = this.ControlDefs.GetControlByIndex(iControl[0]);
    if (def != null && def.GetCoordinateSpace() === 1) {
      x = rKeyExtraData.vp_x;
      y = rKeyExtraData.vp_y;
    } else {
      x = rKeyExtraData.game_x;
      y = rKeyExtraData.game_y;
    }
    let vx = x === 0x7fffff ? new $.C4Value().$copy($.C4VNull) : $.C4VInt(x);
    let vy = y === 0x7fffff ? new $.C4Value().$copy($.C4VNull) : $.C4VInt(y);
    let Pars = new $.C4AulParSet().init$ri32$ri32$mpC4Def$rC4Value$rC4Value$i32$rb$mC4Value(P(this, "iPlr"), P(iControl, 0), $.C4Id2Def(idControlExtraData.$clone()), vx, vy, rKeyExtraData.iStrength, P(fRepeated, 0), $.C4VInt(state));
    return $.ScriptEngine.GetPropList().Call$pi8$pC4AulParSet$b(S("PlayerControl"), Pars.op_and()).getBool();
  }

  AddKeyBinding(key, fHoldKey, idx) {
    this.KeyBindings.push(new $.C4KeyBinding().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(key, $.FormatString(S("PlrKey%02d"), idx).getData(), 1 /*KEYSCOPE_Control*/, new $.C4KeyCBExPassKey$C4PlayerControl$C4KeyCodeEx().init(this, key, "ProcessKeyDown", fHoldKey ? "ProcessKeyUp" : null, null, fHoldKey ? "ProcessKeyMoved" : null), 7));
  }

  GetCurrentPlayerCursorPos(x_out, y_out, game_x_out, game_y_out) {
    if (this.pControlSet != null && this.pControlSet.HasMouse()) {
      if ($.MouseControl.GetLastCursorPos(x_out, y_out, game_x_out, game_y_out)) {
        return true;
      }
    }
    let plr = $.Players.Get(this.iPlr);
    if (plr == null) {
      return false;
    }
    let cursor_obj = plr.Cursor.op_C4Object_();
    if (cursor_obj == null) {
      return false;
    }
    let vp = $.Viewports.GetViewport(this.iPlr);
    if (vp == null) {
      return false;
    }
    let game_x = cursor_obj.GetX();
    let game_y = cursor_obj.GetY();
    game_x_out.a[game_x_out.o] = game_x;
    game_y_out.a[game_y_out.o] = game_y;
    let screen_x = Math.fround(Math.fround(Math.fround(Math.fround(game_x) - vp.last_game_draw_cgo.TargetX) - vp.last_game_draw_cgo.X) * vp.GetZoom$v());
    let screen_y = Math.fround(Math.fround(Math.fround(Math.fround(game_y) - vp.last_game_draw_cgo.TargetY) - vp.last_game_draw_cgo.Y) * vp.GetZoom$v());
    let gui_x = Math.fround(Math.fround(Math.fround(screen_x - vp.last_game_draw_cgo.X) / $.GetZoom()) + vp.last_game_draw_cgo.X);
    let gui_y = Math.fround(Math.fround(Math.fround(screen_y - vp.last_game_draw_cgo.Y) / $.GetZoom()) + vp.last_game_draw_cgo.Y);
    x_out.a[x_out.o] = ftoi32(gui_x);
    y_out.a[y_out.o] = ftoi32(gui_y);
    return true;
  }

  init() {
    this.iPlr = -1;
    this.pControlSet = null;
    this.KeyBindings = [];
    this.RecentKeys = [];
    this.DownKeys = [];
    this.IsCursorPosRequested = false;
    this.Sync = new C4PlayerControl$CSync().None();
    this.ControlDefs = $.Game.PlayerControlDefs;
    return this;
  }

  $dtor() {
    C4PlayerControl.prototype.Clear.call(this);
  }

  Clear() {
    let $t1;
    this.iPlr = -1;
    this.pControlSet = null;
    $t1 = this.KeyBindings;
    for (let $i1 = 0; $i1 < $t1.length; $i1++) {
      const KeyBinding = P($t1, $i1);
      $delete(KeyBinding.a[KeyBinding.o]);
    }
    this.KeyBindings.length = 0;
    this.RecentKeys.length = 0;
    this.DownKeys.length = 0;
    this.Sync.Clear();
    this.IsCursorPosRequested = false;
  }

  Init() {
    this.Sync.InitDefaults(this.ControlDefs);
  }

  CompileFunc(pComp) {
    let DefaultSync = new C4PlayerControl$CSync().None();
    DefaultSync.InitDefaults(this.ControlDefs);
    pComp.Value$StdNamingDefaultAdapt$CSync$CSync($.mkNamingAdapt$rC4PlayerControl$CSync$pi8$C4PlayerControl$CSync$b$b(this.Sync, S("PlayerControl"), DefaultSync));
  }

  RegisterKeyset(iPlr, pKeyset) {
    let $t1, $t2;
    this.pControlSet = pKeyset;
    this.iPlr = iPlr;
    if (this.pControlSet != null) {
      let RegularKeys = [];
      let HoldKeys = [];
      this.pControlSet.GetTriggerKeys(this.ControlDefs, RegularKeys, HoldKeys);
      let idx = 0;
      for (let i = $begin(RegularKeys); !i.eq($end(RegularKeys)); i.inc()) {
        this.AddKeyBinding(i.v, false, ($t1 = idx, idx = idx + 1 | 0, $t1));
      }
      for (let i = $begin(HoldKeys); !i.eq($end(HoldKeys)); i.inc()) {
        this.AddKeyBinding(i.v, true, ($t2 = idx, idx = idx + 1 | 0, $t2));
      }
    }
  }

  IsGlobal() {
    return this.iPlr === -1;
  }

  GetControlDownState(iControl) {
    return this.Sync.GetControlDownState(iControl);
  }

  ExecuteControlPacket(pCtrl) {
    let fHandleDownStateOnly = false;
    for (let i = $begin(pCtrl.GetControlItems()); !i.eq($end(pCtrl.GetControlItems())); i.inc()) {
      const rItem = i.v;
      let pCtrlDef = this.ControlDefs.GetControlByIndex(rItem.iControl);
      if (pCtrlDef != null) {
        if ($.Config.General.DebugRec !== 0) {
          if (pCtrlDef.IsSync()) {
            $.AddDbgRec(156 /*RCT_PlrCom*/, P(rItem, "iControl"), 4);
          }
        }
        if (this.ExecuteControl(rItem.iControl, pCtrl.GetState(), pCtrl.GetExtraData(), rItem.iTriggerMode, false, fHandleDownStateOnly)) {
          if (pCtrlDef.IsSync()) {
            if (pCtrl.GetState() === 1) {
              fHandleDownStateOnly = true;
            } else {
              break;
            }
          }
        }
      }
    }
  }

  Execute() {
    for (let i = 0; i < this.ControlDefs.GetCount(); i = i + 1) {
      let pControlDownState = this.Sync.GetControlDownState(i | 0);
      if (pControlDownState != null && pControlDownState.IsDown()) {
        let pCtrlDef = this.ControlDefs.GetControlByIndex(i | 0);
        0;
        let iCtrlRepeatDelay = pCtrlDef.GetRepeatDelay();
        if (iCtrlRepeatDelay !== 0) {
          let iFrameDiff = $.Game.FrameCounter - pControlDownState.iDownFrame | 0;
          let iCtrlInitialRepeatDelay = pCtrlDef.GetInitialRepeatDelay();
          if (iFrameDiff !== 0 && iFrameDiff >= iCtrlInitialRepeatDelay) {
            if (!((iFrameDiff - iCtrlInitialRepeatDelay | 0) % iCtrlRepeatDelay !== 0)) {
              this.ExecuteControlAction(i | 0, pCtrlDef.GetAction(), pCtrlDef.GetExtraData(), 0 /*CONS_Down*/, pControlDownState.DownState, true);
            }
          }
        }
      }
    }
    let tNow = $.C4TimeMilliseconds.Now();
    let irk = null;
    for (irk = $begin(this.RecentKeys).copy(); !irk.eq($end(this.RecentKeys)); irk.inc()) {
      const rk = irk.v;
      if ($.op_gt($.op_add$C4TimeMilliseconds$u32(rk.tTime.$clone(), 3000), tNow)) {
        break;
      }
    }
    if (!irk.eq($begin(this.RecentKeys))) {
      seq_erase(this.RecentKeys, $begin(this.RecentKeys), $itcopy(irk));
    }
  }

  DoMouseInput(mouse_id, mouseevent, game_x, game_y, gui_x, gui_y, modifier_flags) {
    const is_down = [false];
    let mouseevent_keycode = $.C4KeyCodeEx.FromC4MC(mouse_id << 24 >> 24, mouseevent, modifier_flags, P(is_down, 0));
    let mouseevent_data = new $.C4KeyEventData();
    mouseevent_data.iStrength = Math.imul(100, is_down[0] ? 1 : 0);
    mouseevent_data.vp_x = ftou32(gui_x) | 0;
    mouseevent_data.vp_y = ftou32(gui_y) | 0;
    mouseevent_data.game_x = ftou32(game_x) | 0;
    mouseevent_data.game_y = ftou32(game_y) | 0;
    $.Game.KeyboardInput.SetLastKeyExtraData(mouseevent_data);
    let result = false;
    if (is_down[0]) {
      result = this.ProcessKeyDown(mouseevent_keycode, mouseevent_keycode);
    } else {
      result = this.ProcessKeyUp(mouseevent_keycode, mouseevent_keycode);
    }
    return result;
  }

  SetControlDisabled(ctrl, is_disabled) {
    return this.Sync.SetControlDisabled(ctrl, is_disabled ? 1 : 0);
  }

  IsControlDisabled(ctrl) {
    return this.Sync.IsControlDisabled(ctrl);
  }

  PrepareInput() {
    if (this.IsCursorPosRequested) {
      const x = [0];
      const y = [0];
      const game_x = [0];
      const game_y = [0];
      if (this.GetCurrentPlayerCursorPos(P(x, 0), P(y, 0), P(game_x, 0), P(game_y, 0))) {
        if (this.ControlDefs.InternalCons.CON_CursorPos !== -1) {
          let ev = new $.C4KeyEventData();
          ev.iStrength = 0;
          ev.vp_x = x[0];
          ev.vp_y = y[0];
          ev.game_x = game_x[0];
          ev.game_y = game_y[0];
          let pControlPacket = new $.C4ControlPlayerControl().init$i32$i32$C4KeyEventData(this.iPlr, 0 /*CONS_Down*/, ev);
          pControlPacket.AddControl(this.ControlDefs.InternalCons.CON_CursorPos, 0);
          $.Game.Input.AddHead$i32$pC4ControlPacket(161 /*CID_PlrControl*/, pControlPacket);
        }
      } else {
      }
      this.IsCursorPosRequested = false;
    }
  }

  $clone() { return new C4PlayerControl().$assign(this); }
  $assign(o) {
    this.ControlDefs = o.ControlDefs;
    this.iPlr = o.iPlr;
    this.pControlSet = o.pControlSet;
    this.KeyBindings = o.KeyBindings.slice();
    this.RecentKeys = o.RecentKeys.slice();
    this.DownKeys = o.DownKeys.slice();
    this.IsCursorPosRequested = o.IsCursorPosRequested;
    this.Sync.$assign(o.Sync);
    return this;
  }
}

export class C4PlayerControl$CSync {
  ControlDownStates = [];
  ControlDisableStates = [];

  GetControlDownState(iControl) {
    if (iControl < 0 || iControl >= (this.ControlDownStates.length | 0)) {
      return null;
    }
    return this.ControlDownStates[$u64n(iControl)];
  }

  GetControlDisabled(iControl) {
    if (iControl < 0 || iControl >= (this.ControlDisableStates.length | 0)) {
      return 0;
    }
    return this.ControlDisableStates[$u64n(iControl)];
  }

  IsControlDisabled(iControl) {
    return this.GetControlDisabled(iControl) > 0;
  }

  SetControlDownState(iControl, rDownState, iDownFrame, fDownByUser) {
    if (iControl < 0) {
      return;
    }
    if (iControl >= (this.ControlDownStates.length | 0)) {
      resize(this.ControlDownStates, $u64n(iControl + 1 | 0), () => new C4PlayerControl$CSync$ControlDownState().init$v());
    }
    const rState = this.ControlDownStates[$u64n(iControl)];
    rState.DownState.$assign(rDownState);
    rState.iDownFrame = iDownFrame;
    rState.fDownByUser = fDownByUser;
  }

  SetControlMovedState(iControl, rMovedState, iMovedFrame) {
    if (iControl < 0) {
      return;
    }
    if (iControl >= (this.ControlDownStates.length | 0)) {
      resize(this.ControlDownStates, $u64n(iControl + 1 | 0), () => new C4PlayerControl$CSync$ControlDownState().init$v());
    }
    const rState = this.ControlDownStates[$u64n(iControl)];
    rState.MovedState.$assign(rMovedState);
    rState.iMovedFrame = iMovedFrame;
  }

  ResetControlDownState(iControl) {
    let pDownState = this.GetControlDownState(iControl);
    if (pDownState != null && pDownState.IsDown()) {
      let KeyDownState = pDownState.DownState.$clone();
      KeyDownState.iStrength = 0;
      this.SetControlDownState(iControl, KeyDownState, 0, false);
      this.SetControlMovedState(iControl, KeyDownState, 0);
    }
  }

  SetControlDisabled(iControl, iVal) {
    if (iControl < 0) {
      return false;
    }
    if (iControl >= (this.ControlDisableStates.length | 0)) {
      resize(this.ControlDisableStates, $u64n(iControl + 1 | 0), () => 0);
    }
    this.ControlDisableStates[$u64n(iControl)] = iVal;
    this.ResetControlDownState(iControl);
    return true;
  }

  InitDefaults(ControlDefs) {
    let def = null;
    let i = 0;
    while ((def = ControlDefs.GetControlByIndex(i)) != null) {
      if (def.IsDefaultDisabled()) {
        this.SetControlDisabled(i, 1);
      }
      i = i + 1 | 0;
    }
  }

  Clear() {
    this.ControlDownStates.length = 0;
    this.ControlDisableStates.length = 0;
  }

  CompileFunc(pComp) {
    pComp.Value$StdNamingDefaultAdapt$StdSTLContainerAdapt$vector$ControlDownState$vector$ControlDownState($.mkNamingAdapt$mStdSTLContainerAdapt$vector$ControlDownState$pi8$vector$b$b($.mkSTLContainerAdapt$rvector$i32$6(this.ControlDownStates), S("Down"), []));
    pComp.Value$StdNamingDefaultAdapt$StdSTLContainerAdapt$vector$i32$vector$i32($.mkNamingAdapt$mStdSTLContainerAdapt$vector$i32$pi8$vector$b$b($.mkSTLContainerAdapt$rvector$i32$10(this.ControlDisableStates), S("Disabled"), []));
  }

  op_eq(cmp) {
    return seq_equal(this.ControlDownStates, cmp.ControlDownStates) && seq_equal(this.ControlDisableStates, cmp.ControlDisableStates);
  }

  None() {
    this.ControlDownStates = [];
    this.ControlDisableStates = [];
    return this;
  }

  $clone() { return new C4PlayerControl$CSync().$assign(this); }
  $assign(o) {
    this.ControlDownStates = o.ControlDownStates.slice();
    this.ControlDisableStates = o.ControlDisableStates.slice();
    return this;
  }
}

export class C4PlayerControl$CSync$ControlDownState {
  DownState = new $.C4KeyEventData();
  MovedState = new $.C4KeyEventData();
  iDownFrame = 0;
  iMovedFrame = 0;
  fDownByUser = false;

  IsDown() {
    return this.DownState.iStrength > 0;
  }

  init$v() {
    this.DownState = new $.C4KeyEventData();
    this.MovedState = new $.C4KeyEventData();
    this.iDownFrame = 0;
    this.fDownByUser = false;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Value$rC4KeyEventData(this.DownState);
    pComp.Separator();
    pComp.Value$rC4KeyEventData(this.MovedState);
    pComp.Separator();
    pComp.Value$ri32(P(this, "iDownFrame"));
    pComp.Separator();
    pComp.Value$ri32(P(this, "iMovedFrame"));
    pComp.Separator();
    pComp.Value$rb(P(this, "fDownByUser"));
  }

  $clone() { return new C4PlayerControl$CSync$ControlDownState().$assign(this); }
  $assign(o) {
    this.DownState.$assign(o.DownState);
    this.MovedState.$assign(o.MovedState);
    this.iDownFrame = o.iDownFrame;
    this.iMovedFrame = o.iMovedFrame;
    this.fDownByUser = o.fDownByUser;
    return this;
  }
}


export function $init(): void {
  $.C4GFX_ZoomStep$C4PlayerControl = Math.fround(1.1040895);
}

Object.assign($, { C4PlayerControl, C4PlayerControl$CSync, C4PlayerControl$CSync$ControlDownState, C4PlayerControlAssignment, C4PlayerControlAssignment$KeyComboItem, C4PlayerControlAssignmentSet, C4PlayerControlAssignmentSets, C4PlayerControlDef, C4PlayerControlDefs, C4PlayerControlDefs$CInternalCons, C4PlayerControlFile, C4PlayerControlRecentKey });
