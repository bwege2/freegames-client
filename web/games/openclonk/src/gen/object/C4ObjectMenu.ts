// @ts-nocheck
// OpenClonk 36de799: src/object/C4ObjectMenu.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { C4Menu } from '../gui/C4Menu.ts';
import { P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';

export class C4ObjectMenu extends C4Menu {
  Object = null;
  ParentObject = null;
  RefillObject = null;
  RefillObjectContentsCount = 0;
  eCallbackType = 0;
  UserMenu = false;
  CloseQuerying = false;

  init() {
    super.init();
    this.$dyn = C4ObjectMenu;
    C4ObjectMenu.prototype.Default.call(this);
    return this;
  }

  Default() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4ObjectMenu && C4ObjectMenu.prototype instanceof $c) return $c.prototype.Default.apply(this, arguments); }
    $.C4Menu.prototype.Default.call(this);
    this.eCallbackType = 0 /*CB_None*/;
    this.Object = this.ParentObject = this.RefillObject = null;
    this.RefillObjectContentsCount = 0;
    this.UserMenu = false;
    this.CloseQuerying = false;
  }

  LocalInit(pObject, fUserMenu) {
    this.Object = pObject;
    this.UserMenu = fUserMenu;
    this.ParentObject = this.GetParentObject();
    if (pObject != null) {
      this.eCallbackType = 1 /*CB_Object*/;
    } else {
      this.eCallbackType = 2 /*CB_Scenario*/;
    }
  }

  SetRefillObject(pObj) {
    this.RefillObject = pObj;
    this.NeedRefill = true;
    this.Refill();
  }

  ClearPointers(pObj) {
    if (this.Object === pObj) {
      this.Object = null;
    }
    if (this.ParentObject === pObj) {
      this.ParentObject = null;
    }
    if (this.RefillObject === pObj) {
      this.RefillObject = null;
    }
    $.C4Menu.prototype.ClearPointers.call(this, pObj);
  }

  Init$rC4FacetSurface$pi8$pC4Object$i32$i32$i32$i32$b(fctSymbol, szEmpty, pObject, iExtra = 0, iExtraData = 0, iId = 0, iStyle = 0, fUserMenu = false) {
    if (!this.DoInit$rC4FacetSurface$pi8$i32$i32$i32$i32(fctSymbol, szEmpty, iExtra, iExtraData, iId, iStyle)) {
      return false;
    }
    this.LocalInit(pObject, fUserMenu);
    return true;
  }

  InitRefSym$C4TargetFacet$pi8$pC4Object$i32$i32$i32$i32$b(fctSymbol, szEmpty, pObject, iExtra = 0, iExtraData = 0, iId = 0, iStyle = 0, fUserMenu = false) {
    if (!this.DoInitRefSym(fctSymbol, szEmpty, iExtra, iExtraData, iId, iStyle)) {
      return false;
    }
    this.LocalInit(pObject, fUserMenu);
    return true;
  }

  Execute$v() {
    if (!this.IsActive$v()) {
      return;
    }
    if (this.RefillObject != null) {
      if (this.RefillObject.Contents.ObjectCount() !== this.RefillObjectContentsCount) {
        this.NeedRefill = true;
        this.RefillObjectContentsCount = this.RefillObject.Contents.ObjectCount();
      }
    }
    $.C4Menu.prototype.Execute$v.call(this);
  }

  GetParentObject() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4ObjectMenu && C4ObjectMenu.prototype instanceof $c) return $c.prototype.GetParentObject.apply(this, arguments); }
    let $t1, $t2, $t3;
    $t1 = $.Objects;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    try {
      for (; $t2.op_ne($t3); $t2.op_inc$v()) {
        const cObj = $t2.op_mul();
        if (cObj.Menu === this) {
          return cObj;
        }
      }
    } finally { $t2.$dtor(); $t3.$dtor(); }
    return null;
  }

  IsCloseQuerying() {
    return !!this.CloseQuerying;
  }

  MenuCommand(szCommand, _fIsCloseCommand) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4ObjectMenu && C4ObjectMenu.prototype instanceof $c) return $c.prototype.MenuCommand.apply(this, arguments); }
    switch (this.eCallbackType) {
      case 1:
        if (this.Object != null) {
          this.Object.MenuCommand(szCommand);
        }
        break;
      case 2:
        $.AulExec.DirectExec(null, szCommand, S("MenuCommand"));
        break;
      case 0:
        break;
    }
    return true;
  }

  DoRefillInternal(rfRefilled) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4ObjectMenu && C4ObjectMenu.prototype instanceof $c) return $c.prototype.DoRefillInternal.apply(this, arguments); }
    let fctSymbol = new $.C4FacetSurface().init();
    const pObj = [null];
    const szCaption = new Int8Array(257);
    const szCommand = new Int8Array(257);
    const szCommand2 = new Int8Array(257);
    const iCount = [0];
    let pDef = null;
    let ListItems = new $.C4IDList().init();
    let pTarget = null;
    let fctTarget = new $.C4Facet().init$v();
    switch (this.Identification) {
      case 6:
        this.ClearItems();
        if (!((pTarget = this.RefillObject) != null)) {
          return false;
        }
        {
          let iter = new $.C4ObjectListIterator().init(pTarget.Contents);
          while ((pObj[0] = iter.GetNext(P(iCount, 0))) != null) {
            pDef = pObj[0].Def;
            if (pDef.NoGet !== 0) {
              continue;
            }
            if ((~pObj[0].OCF >>> 0 & 64) >>> 0 !== 0) {
              let pObj2 = pTarget.Contents.Find(pDef, -2, 64);
              if (pObj2 != null) {
                if (pObj2.CanConcatPictureWith(pObj[0])) {
                  pObj[0] = pObj2;
                }
              }
            }
            $.ssprintf$11(szCaption, $.LoadResStr(S("IDS_MENU_ACTIVATE")), pObj[0].GetName());
            fctSymbol.Set$pC4Surface$i32$i32$i32$i32(fctSymbol.Surface, 0, 0, 35, 35);
            pObj[0].Picture2Facet(fctSymbol);
            $.ssprintf$11(szCommand, S("SetCommand(\"Activate\",Object(%d))&&ExecuteCommand()"), pObj[0].Number);
            $.ssprintf$11(szCommand2, S("SetCommand(\"Activate\",nil,%d,0,Object(%d),%s)&&ExecuteCommand()"), pTarget.Contents.ObjectCount(pDef.id.$clone()), pTarget.Number, pDef.id.ToString());
            this.Add$pi8$rC4FacetSurface$pi8$i32$pC4Object$pi8$C4ID$pi8$b$i32$b(P(szCaption, 0), fctSymbol, P(szCommand, 0), iCount[0], pObj[0], S(""), pDef.id.$clone(), P(szCommand2, 0), true, pObj[0].GetValue(pTarget, -1));
            $.C4FacetSurface.prototype.Default.call(fctSymbol);
          }
        }
        break;
      case 13:
      case 18:
        this.ClearItems();
        if (!((pTarget = this.RefillObject) != null)) {
          return false;
        }
        {
          let iter = new $.C4ObjectListIterator().init(pTarget.Contents);
          while ((pObj[0] = iter.GetNext(P(iCount, 0))) != null) {
            pDef = pObj[0].Def;
            if (pDef.NoGet !== 0) {
              continue;
            }
            if ((~pObj[0].OCF >>> 0 & 64) >>> 0 !== 0) {
              let pObj2 = pTarget.Contents.Find(pDef, -2, 64);
              if (pObj2 != null) {
                if (pObj2.CanConcatPictureWith(pObj[0])) {
                  pObj[0] = pObj2;
                }
              }
            }
            let fGet = true;
            if (!((pObj[0].OCF & 8) >>> 0 !== 0)) {
              fGet = false;
            }
            if (this.Identification === 18) {
              if (this.Object != null && !this.Object.Call$pi8$pC4AulParSet$b(S("~RejectCollect"), new $.C4AulParSet().init$rpC4Def$rpC4Object(P(pObj[0], "Def"), P(pObj, 0)).op_and()).op_not()) {
                fGet = false;
              }
            }
            if (!((pTarget.OCF & 2048) >>> 0 !== 0)) {
              fGet = true;
            }
            $.ssprintf$11(szCaption, $.LoadResStr(fGet ? S("IDS_MENU_GET") : S("IDS_MENU_ACTIVATE")), pObj[0].GetName());
            fctSymbol.Set$pC4Surface$i32$i32$i32$i32(fctSymbol.Surface, 0, 0, 35, 35);
            pObj[0].Picture2Facet(fctSymbol);
            $.ssprintf$11(szCommand, S("SetCommand(\"%s\", Object(%d)) && ExecuteCommand()"), fGet ? S("Get") : S("Activate"), pObj[0].Number);
            szCommand2[0] = 0;
            let iAllCount = 0;
            if ((iAllCount = pTarget.Contents.ObjectCount(pDef.id.$clone())) > 1) {
              $.ssprintf$11(szCommand2, S("SetCommand(\"%s\", nil, %d,0, Object(%d), %s) && ExecuteCommand()"), fGet ? S("Get") : S("Activate"), iAllCount, pTarget.Number, pDef.id.ToString());
            }
            this.Add$pi8$rC4FacetSurface$pi8$i32$pC4Object$pi8$C4ID$pi8$b$i32$b(P(szCaption, 0), fctSymbol, P(szCommand, 0), iCount[0], pObj[0], S(""), pDef.id.$clone(), P(szCommand2, 0));
            $.C4FacetSurface.prototype.Default.call(fctSymbol);
          }
        }
        break;
      default:
        return true;
    }
    rfRefilled.a[rfRefilled.o] = true;
    return true;
  }

  OnSelectionChanged(iNewSelection$) {
    const iNewSelection = [iNewSelection$];
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4ObjectMenu && C4ObjectMenu.prototype instanceof $c) return $c.prototype.OnSelectionChanged.apply(this, arguments); }
    if (this.UserMenu) {
      let pars = new $.C4AulParSet().init$ri32$rpC4Object(P(iNewSelection, 0), P(this, "ParentObject"));
      if (this.eCallbackType === 1 && this.Object != null) {
        this.Object.Call$pi8$pC4AulParSet$b(S("~OnMenuSelection"), pars.op_and());
      } else if (this.eCallbackType === 2) {
        $.GameScript.Call(S("~OnMenuSelection"), pars.op_and());
      }
    }
  }

  IsCloseDenied() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4ObjectMenu && C4ObjectMenu.prototype instanceof $c) return $c.prototype.IsCloseDenied.apply(this, arguments); }
    if (this.UserMenu && !this.CloseQuerying) {
      this.CloseQuerying = true;
      let fResult = false;
      let pars = new $.C4AulParSet().init$ri32$rpC4Object(P(this, "Selection"), P(this, "ParentObject"));
      if (this.eCallbackType === 1) {
        if (this.Object != null) {
          fResult = !this.Object.Call$pi8$pC4AulParSet$b(S("~MenuQueryCancel"), pars.op_and()).op_not();
        }
      } else if (this.eCallbackType === 2) {
        fResult = !$.GameScript.Call(S("~MenuQueryCancel"), pars.op_and()).op_not();
      }
      this.CloseQuerying = false;
      if (fResult) {
        return true;
      }
    }
    return false;
  }

  IsReadOnly() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4ObjectMenu && C4ObjectMenu.prototype instanceof $c) return $c.prototype.IsReadOnly.apply(this, arguments); }
    let pVP = this.GetViewport();
    if (pVP == null) {
      return false;
    }
    if (pVP.fIsNoOwnerViewport) {
      if (this.eCallbackType === 1 || this.eCallbackType === 2) {
        return true;
      }
    }
    if (!pVP.fIsNoOwnerViewport) {
      let pPlr = $.Players.Get($.MouseControl.GetPlayer());
      if (pPlr != null && pPlr.Eliminated !== 0) {
        return true;
      }
    }
    return false;
  }

  OnUserSelectItem(Player, iIndex) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4ObjectMenu && C4ObjectMenu.prototype instanceof $c) return $c.prototype.OnUserSelectItem.apply(this, arguments); }
    $.Game.Input.Add$i32$pC4ControlPacket(161 /*CID_PlrControl*/, new $.C4ControlPlayerControl().init$i32$i32$i32(Player, $.Game.PlayerControlDefs.InternalCons.CON_ObjectMenuSelect, iIndex | -0x80000000));
  }

  OnUserEnter(Player, iIndex, fRight) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4ObjectMenu && C4ObjectMenu.prototype instanceof $c) return $c.prototype.OnUserEnter.apply(this, arguments); }
    $.Game.Input.Add$i32$pC4ControlPacket(161 /*CID_PlrControl*/, new $.C4ControlPlayerControl().init$i32$i32$i32(Player, fRight ? $.Game.PlayerControlDefs.InternalCons.CON_ObjectMenuOKAll : $.Game.PlayerControlDefs.InternalCons.CON_ObjectMenuOK, iIndex));
  }

  OnUserClose$v() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4ObjectMenu && C4ObjectMenu.prototype instanceof $c) return $c.prototype.OnUserClose$v.apply(this, arguments); }
    $.Game.Input.Add$i32$pC4ControlPacket(161 /*CID_PlrControl*/, new $.C4ControlPlayerControl().init$i32$i32$i32($.MouseControl.GetPlayer(), $.Game.PlayerControlDefs.InternalCons.CON_ObjectMenuCancel, 0));
  }

  GetControllingPlayer() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4ObjectMenu && C4ObjectMenu.prototype instanceof $c) return $c.prototype.GetControllingPlayer.apply(this, arguments); }
    return this.Object != null ? this.Object.Controller : $.NO_OWNER$C4Constants;
  }

  $clone() { return new C4ObjectMenu().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Object = o.Object;
    this.ParentObject = o.ParentObject;
    this.RefillObject = o.RefillObject;
    this.RefillObjectContentsCount = o.RefillObjectContentsCount;
    this.eCallbackType = o.eCallbackType;
    this.UserMenu = o.UserMenu;
    this.CloseQuerying = o.CloseQuerying;
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4ObjectMenu });
