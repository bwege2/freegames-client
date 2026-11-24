// @ts-nocheck
// OpenClonk 36de799: src/landscape/C4MapCreatorS2.cpp, src/landscape/C4MapCreatorS2.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n } from '../../rt/int.ts';
import { c$memset, c$printf, c$sscanf } from '../../rt/libc.ts';
import { Random } from '../../rt/native.ts';
import { $bytesView, $oadd, $oat, $oidx, $own, $padd, $rd, $wr, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $max, $memberKey, $memberOf, $min, $throw } from '../../rt/std.ts';

export class MemberAdapter$C4MCOverlay {
  Object = null;
  Offset = null;

  init(object, offset) {
    this.Offset = offset;
    this.Object = object;
    return this;
  }

  As$6() {
    return P($memberOf(this.Object, this.Offset), $memberKey(this.Offset));
  }

  As$2() {
    return $memberOf(this.Object, this.Offset)[$memberKey(this.Offset)];
  }

  As() {
    return P($memberOf(this.Object, this.Offset), $memberKey(this.Offset));
  }

  As$3() {
    return P($memberOf(this.Object, this.Offset), $memberKey(this.Offset));
  }

  As$5() {
    return P($memberOf(this.Object, this.Offset), $memberKey(this.Offset));
  }

  As$4() {
    return P($memberOf(this.Object, this.Offset), $memberKey(this.Offset));
  }

  $clone() { return new MemberAdapter$C4MCOverlay().$assign(this); }
  $assign(o) {
    this.Object = o.Object;
    this.Offset = o.Offset;
    return this;
  }
}

export class C4MCNodeAttr {
  Name = null;
  Type = 0;
  Offset = null;

  $clone() { return new C4MCNodeAttr().$assign(this); }
  $assign(o) {
    this.Name = o.Name;
    this.Type = o.Type;
    this.Offset = o.Offset;
    return this;
  }
}

export class C4MCAlgorithm {
  Identifier = new Int8Array(30);
  Function = null;

  $clone() { return new C4MCAlgorithm().$assign(this); }
  $assign(o) {
    this.Identifier = o.Identifier.slice();
    this.Function = o.Function;
    return this;
  }
}

export class C4MCCallbackArray {
  pMapCreator = null;
  pMap = null;
  iWdt = 0;
  iHgt = 0;
  pSF = null;
  pNext = null;

  init(pSFunc, pMapCreator) {
    this.pSF = pSFunc;
    this.pMap = null;
    this.pNext = null;
    if ((this.pMapCreator = pMapCreator) != null) {
      pMapCreator.CallbackArrays.Add(this);
    }
    return this;
  }

  $dtor() {
    if (this.pMap != null) {
      $delete(this.pMap);
    }
  }

  EnablePixel(iX, iY) {
    let $t1;
    if (this.pMap == null) {
      if (this.pMapCreator == null) {
        return;
      }
      let pCurrMap = this.pMapCreator.pCurrentMap;
      if (pCurrMap == null) {
        return;
      }
      this.iWdt = pCurrMap.Wdt;
      this.iHgt = pCurrMap.Hgt;
      let iSize = (Math.imul(this.iWdt, this.iHgt) + 7 | 0) / 8 | 0;
      this.pMap = P(new Uint8Array($u64n(iSize)), 0);
      c$memset(this.pMap, 0, $u64n(iSize));
    }
    if (iX < 0 || iY < 0 || iX >= this.iWdt || iY >= this.iHgt) {
      return;
    }
    let iIndex = iX + Math.imul(iY, this.iWdt) | 0;
    ($t1 = $padd(this.pMap, iIndex / 8 | 0), $t1.a[$t1.o] = ($t1.a[$t1.o] | (1 << iIndex % 8 | 0)) & 0xff);
  }

  Execute(iMapZoom$) {
    const iMapZoom = [iMapZoom$];
    let $t1;
    if (this.pSF == null || this.pMap == null) {
      return;
    }
    let Pars = new $.C4AulParSet().init$mi32$mi32$ri32(0, 0, P(iMapZoom, 0));
    let iIndex = Math.imul(this.iWdt, this.iHgt);
    while (($t1 = iIndex, iIndex = iIndex - 1 | 0, $t1) !== 0) {
      if ((this.pMap.a[this.pMap.o + (iIndex / 8 | 0)] & (1 << iIndex % 8 | 0)) !== 0) {
        Pars.op_index(0).$assign($.C4VInt(Math.imul(iIndex % this.iWdt, iMapZoom[0]) - (iMapZoom[0] / 2 | 0) | 0));
        Pars.op_index(1).$assign($.C4VInt(Math.imul(iIndex / this.iWdt | 0, iMapZoom[0]) - (iMapZoom[0] / 2 | 0) | 0));
        this.pSF.Exec$pC4PropList$pC4AulParSet$b(null, Pars.op_and());
      }
    }
  }

  $clone() { return new C4MCCallbackArray().$assign(this); }
  $assign(o) {
    this.pMapCreator = o.pMapCreator;
    this.pMap = o.pMap;
    this.iWdt = o.iWdt;
    this.iHgt = o.iHgt;
    this.pSF = o.pSF;
    this.pNext = o.pNext;
    return this;
  }
}

export class C4MCCallbackArrayList {
  pFirst = null;

  init() {
    this.pFirst = null;
    return this;
  }

  $dtor() {
    C4MCCallbackArrayList.prototype.Clear.call(this);
  }

  Add(pNewArray) {
    if (this.pFirst != null) {
      let pLast = this.pFirst;
      while (pLast.pNext != null) {
        pLast = pLast.pNext;
      }
      pLast.pNext = pNewArray;
    } else {
      this.pFirst = pNewArray;
    }
  }

  Clear() {
    let pArray = null;
    let pNext = this.pFirst;
    while ((pArray = pNext) != null) {
      pNext = pArray.pNext;
      $delete(pArray);
    }
    this.pFirst = null;
  }

  Execute(iMapZoom) {
    for (let pArray = this.pFirst; pArray != null; pArray = pArray.pNext) {
      pArray.Execute(iMapZoom);
    }
  }

  $clone() { return new C4MCCallbackArrayList().$assign(this); }
  $assign(o) {
    this.pFirst = o.pFirst;
    return this;
  }
}

export class C4MCNode {
  Owner = null;
  Child0 = null;
  ChildL = null;
  Prev = null;
  Next = null;
  MapCreator = null;
  Name = new Int8Array(30);

  init$pC4MCNode(pOwner = null) {
    C4MCNode.prototype.Reg2Owner.call(this, pOwner);
    $wr(P(this.Name, 0), 0, 0);
    return this;
  }

  init$pC4MCParser$pC4MCNode$rC4MCNode$b(pParser, pOwner, rTemplate, _fClone) {
    for (let pParent = pOwner; pParent != null; pParent = pParent.Owner) {
      if (pParent === rTemplate) {
        $throw(new C4MCParserErr().init$pC4MCParser$pi8$pi8(pParser, S("cannot use template '%s' within itself"), P(rTemplate.Name, 0)));
      }
    }
    C4MCNode.prototype.Reg2Owner.call(this, pOwner);
    for (let pChild = rTemplate.Child0; pChild != null; pChild = pChild.Next) {
      pChild.clone(pParser, this);
    }
    $wr(P(this.Name, 0), 0, 0);
    return this;
  }

  $dtor() {
    C4MCNode.prototype.Clear.call(this);
    if (this.Prev != null) {
      this.Prev.Next = this.Next;
    } else if (this.Owner != null) {
      this.Owner.Child0 = this.Next;
    }
    if (this.Next != null) {
      this.Next.Prev = this.Prev;
    } else if (this.Owner != null) {
      this.Owner.ChildL = this.Prev;
    }
  }

  clone(pParser, pToNode) {
    return new C4MCNode().init$pC4MCParser$pC4MCNode$rC4MCNode$b(pParser, pToNode, this, true);
  }

  Clear() {
    while (this.Child0 != null) {
      $delete(this.Child0);
    }
  }

  Reg2Owner(pOwner) {
    this.Child0 = this.ChildL = null;
    if ((this.Owner = pOwner) != null) {
      if ((this.Prev = this.Owner.ChildL) != null) {
        this.Prev.Next = this;
      } else {
        this.Owner.Child0 = this;
      }
      this.Owner.ChildL = this;
      this.MapCreator = pOwner.MapCreator;
    } else {
      this.Prev = null;
      this.MapCreator = null;
    }
    this.Next = null;
  }

  GlobalScope() {
    return false;
  }

  SetOp(_eOp) {
    return false;
  }

  GetNodeByName(szName) {
    for (let pChild = this.ChildL; pChild != null; pChild = pChild.Prev) {
      if ($.SEqual(P(pChild.Name, 0), szName)) {
        return pChild;
      }
    }
    if (this.Owner != null) {
      return this.Owner.GetNodeByName(szName);
    }
    return null;
  }

  SetField(_pParser, _szField, _szSVal, _iVal, _ValType) {
    return false;
  }

  IntPar(pParser, szSVal, iVal, ValType) {
    if (ValType === 3 || ValType === 12 || ValType === 13) {
      return iVal;
    }
    $throw(new C4MCParserErr().init$pC4MCParser$pi8$pi8(pParser, S("'%s' is not a valid value for this field"), szSVal));
  }

  StrPar(pParser, szSVal, _iVal, ValType) {
    if (ValType !== 2) {
      $throw(new C4MCParserErr().init$pC4MCParser$pi8$pi8(pParser, S("'%s' is not a valid value for this field"), szSVal));
    }
    return szSVal;
  }

  Evaluate() {
  }

  ReEvaluate() {
    this.Evaluate();
    for (let pChild = this.Child0; pChild != null; pChild = pChild.Next) {
      pChild.ReEvaluate();
    }
  }

  Type() {
    return 0 /*MCN_Node*/;
  }

  Overlay() {
    return null;
  }

  OwnerOverlay() {
    for (let pOwnr = this.Owner; pOwnr != null; pOwnr = pOwnr.Owner) {
      {
        let pOwnrOvrl = pOwnr.Overlay();
        if (pOwnrOvrl != null) {
          return pOwnrOvrl;
        }
      }
    }
    return null;
  }

  $clone() { return new C4MCNode().$assign(this); }
  $assign(o) {
    this.Owner = o.Owner;
    this.Child0 = o.Child0;
    this.ChildL = o.ChildL;
    this.Prev = o.Prev;
    this.Next = o.Next;
    this.MapCreator = o.MapCreator;
    this.Name = o.Name.slice();
    return this;
  }
}

export class C4MCNode$int_bool {
  static $layout = [["value", 0, "i32", 0], ["percent", 4, "u8", 0]];
  static $size = 8;
  value = 0;
  percent = false;

  Evaluate(relative_to) {
    if (this.percent) {
      return Math.imul(this.value, relative_to) / 100 | 0;
    } else {
      return this.value;
    }
  }

  Set(value, percent) {
    this.value = value;
    this.percent = percent;
  }

  $clone() { return new C4MCNode$int_bool().$assign(this); }
  $assign(o) {
    this.value = o.value;
    this.percent = o.percent;
    return this;
  }
}

export class C4MCParserErr {
  static $layout = [["Msg", 0, "i8", 256]];
  static $size = 256;
  Msg = new Int8Array(256);

  init$pC4MCParser$pi8(pParser, szMsg) {
    $.ssprintf$10(this.Msg, S("%s: %s (%d)"), P(pParser.Filename, 0), szMsg, pParser.BPos != null ? $.SGetLine(pParser.BPos, pParser.CPos) : 0);
    return this;
  }

  init$pC4MCParser$pi8$pi8(pParser, szMsg, szPar) {
    const Buf = new Int8Array(256);
    $.ssprintf$10(Buf, szMsg, szPar);
    $.ssprintf$10(this.Msg, S("%s: %s (%d)"), P(pParser.Filename, 0), P(Buf, 0), pParser.BPos != null ? $.SGetLine(pParser.BPos, pParser.CPos) : 0);
    return this;
  }

  show() {
    $.Log(P(this.Msg, 0));
  }

  $clone() { return new C4MCParserErr().$assign(this); }
  $assign(o) {
    this.Msg = o.Msg.slice();
    return this;
  }
}

export class C4MCParser {
  MapCreator = null;
  Code = null;
  BPos = null;
  CPos = null;
  CurrToken = 0;
  CurrTokenIdtf = new Int8Array(30);
  CurrTokenVal = 0;
  Filename = new Int8Array(30);

  AdvanceSpaces() {
    let C = 0;
    let C2 = 0;
    let InComment = 0;
    while ((C = this.CPos.a[this.CPos.o]) !== 0) {
      switch (InComment) {
        case 0:
          if (C === 47) {
            this.CPos = this.CPos.add(1);
            switch (this.CPos.a[this.CPos.o]) {
              case 47:
                InComment = 1;
                break;
              case 42:
                InComment = 2;
                break;
              default:
                this.CPos = this.CPos.add(-1);
                return true;
            }
          } else if ((C & 0xff) > 32) {
            return true;
          }
          break;
        case 1:
          if ((C & 0xff) === 13 || (C & 0xff) === 10) {
            InComment = 0;
          }
          break;
        case 2:
          if (C === 47 && C2 === 42) {
            InComment = 0;
          }
          break;
      }
      this.CPos = this.CPos.add(1);
      C2 = C;
    }
    return false;
  }

  GetNextToken() {
    if (!this.AdvanceSpaces()) {
      this.CurrToken = 14 /*MCT_EOF*/;
      return false;
    }
    let CPos0 = this.CPos;
    let Len = 0;
    let State = 0 /*TGS_None*/;
    while (true) {
      let C = this.CPos.a[this.CPos.o];
      switch (State) {
        case 0:
          if (C >= 48 && C <= 57 || C === 43 || C === 45) {
            State = 2 /*TGS_Int*/;
          } else if (C === 35) {
            State = 3 /*TGS_Dir*/;
          } else if (C === 59) {
            this.CPos = this.CPos.add(1);
            this.CurrToken = 7 /*MCT_SCOLON*/;
            return true;
          } else if (C === 61) {
            this.CPos = this.CPos.add(1);
            this.CurrToken = 4 /*MCT_EQ*/;
            return true;
          } else if (C === 123) {
            this.CPos = this.CPos.add(1);
            this.CurrToken = 5 /*MCT_BLOPEN*/;
            return true;
          } else if (C === 125) {
            this.CPos = this.CPos.add(1);
            this.CurrToken = 6 /*MCT_BLCLOSE*/;
            return true;
          } else if (C === 38) {
            this.CPos = this.CPos.add(1);
            this.CurrToken = 8 /*MCT_AND*/;
            return true;
          } else if (C === 124) {
            this.CPos = this.CPos.add(1);
            this.CurrToken = 9 /*MCT_OR*/;
            return true;
          } else if (C === 94) {
            this.CPos = this.CPos.add(1);
            this.CurrToken = 10 /*MCT_XOR*/;
            return true;
          } else if (C >= 64) {
            State = 1 /*TGS_Ident*/;
          } else {
            this.CPos = this.CPos.add(1);
            $throw(new C4MCParserErr().init$pC4MCParser$pi8(this, S("unexpected character found")));
          }
          break;
        case 1:
        case 3:
          if ((C < 48 || C > 57) && (C < 97 || C > 122) && (C < 65 || C > 90) && C !== 95) {
            Len = $min(Len, 30);
            $.SCopy$pi8$pi8$u64(CPos0, P(this.CurrTokenIdtf, 0), $u64n(Len));
            if (State === 1) {
              this.CurrToken = 2 /*MCT_IDTF*/;
            } else {
              this.CurrToken = 1 /*MCT_DIR*/;
            }
            return true;
          }
          break;
        case 2:
          if (C < 48 || C > 57) {
            Len = $min(Len, 30);
            this.CurrToken = 3 /*MCT_INT*/;
            if (Len === 1 && CPos0.a[CPos0.o] === 45) {
              this.CurrToken = 11 /*MCT_RANGE*/;
              return true;
            } else if (37 === C) {
              this.CPos = this.CPos.add(1);
              this.CurrToken = 12 /*MCT_PERCENT*/;
            } else if (112 === C) {
              this.CPos = this.CPos.add(1);
              if (120 === this.CPos.a[this.CPos.o]) {
                this.CPos = this.CPos.add(1);
              }
              this.CurrToken = 13 /*MCT_PX*/;
            }
            $.SCopy$pi8$pi8$u64(CPos0, P(this.CurrTokenIdtf, 0), $u64n(Len));
            c$sscanf(P(this.CurrTokenIdtf, 0), S("%d"), P(this, "CurrTokenVal"));
            return true;
          }
          break;
      }
      this.CPos = this.CPos.add(1);
      Len = Len + 1 | 0;
    }
  }

  ParseTo(pToNode) {
    let pNewNode = null;
    let Done = false;
    let LastOperand = -1;
    const FieldName = new Int8Array(30);
    let pCpyNode = null;
    let State = 0 /*PS_NONE*/;
    while (this.GetNextToken()) {
      switch (State) {
        case 0:
        case 4:
          switch (this.CurrToken) {
            case 1:
              if (!pToNode.GlobalScope()) {
                $throw(new C4MCParserErr().init$pC4MCParser$pi8(this, S("can't use directives in local scope")));
              }
              $throw(new C4MCParserErr().init$pC4MCParser$pi8$pi8(this, S("unknown directive: %s"), P(this.CurrTokenIdtf, 0)));
              break;
            case 2:
              if ($.SEqual(P(this.CurrTokenIdtf, 0), S("overlay"))) {
                pNewNode = new C4MCOverlay().init$pC4MCParser$pC4MCNode$rC4MCOverlay$b(this, pToNode, this.MapCreator.DefaultOverlay, false);
                State = 1 /*PS_KEYWD1*/;
              } else if ($.SEqual(P(this.CurrTokenIdtf, 0), S("point")) && !(pToNode.GetNodeByName(P(this.CurrTokenIdtf, 0)) != null)) {
                if (!(pToNode.Overlay() != null)) {
                  $throw(new C4MCParserErr().init$pC4MCParser$pi8(this, S("point only allowed in overlays")));
                }
                pNewNode = new C4MCPoint().init$pC4MCParser$pC4MCNode$rC4MCPoint$b(this, pToNode, this.MapCreator.DefaultPoint, false);
                State = 1 /*PS_KEYWD1*/;
              } else if ($.SEqual(P(this.CurrTokenIdtf, 0), S("map"))) {
                if (!pToNode.GlobalScope()) {
                  $throw(new C4MCParserErr().init$pC4MCParser$pi8(this, S("can't declare map in local scope")));
                }
                pNewNode = new C4MCMap().init$pC4MCParser$pC4MCNode$rC4MCMap$b(this, pToNode, this.MapCreator.DefaultMap, false);
                State = 1 /*PS_KEYWD1*/;
              } else {
                if (State === 4) {
                  State = 6 /*PS_GOTOPIDTF*/;
                } else {
                  State = 5 /*PS_GOTIDTF*/;
                }
              }
              if (State === 4 && pNewNode != null) {
                if (LastOperand !== pNewNode.Type()) {
                  $throw(new C4MCParserErr().init$pC4MCParser$pi8(this, S("operator type mismatch")));
                }
              }
              break;
            case 6:
            case 14:
              Done = true;
              break;
            default:
              $throw(new C4MCParserErr().init$pC4MCParser$pi8(this, S("identifier expected")));
              break;
          }
          break;
        case 1:
          if (this.CurrToken === 2) {
            $.SCopy$pi8$pi8$u64(P(this.CurrTokenIdtf, 0), P(pNewNode.Name, 0), 30);
            State = 2 /*PS_KEYWD1N*/;
            break;
          } else if (pToNode.GlobalScope()) {
            $throw(new C4MCParserErr().init$pC4MCParser$pi8(this, S("unnamed objects not allowed in global scope")));
          }
        case 2:
          if (this.CurrToken !== 5) {
            $throw(new C4MCParserErr().init$pC4MCParser$pi8(this, S("'{' expected")));
          }
          this.ParseTo(pNewNode);
          if (this.CurrToken === 14) {
            $throw(new C4MCParserErr().init$pC4MCParser$pi8(this, S("unexpected end of file")));
          }
          State = 3 /*PS_AFTERNODE*/;
          break;
        case 5:
        case 6:
          switch (this.CurrToken) {
            case 4:
              if (State === 6) {
                $throw(new C4MCParserErr().init$pC4MCParser$pi8(this, S("second operand expected")));
              }
              $.SCopy$pi8$pi8$u64(P(this.CurrTokenIdtf, 0), P(FieldName, 0), 30);
              State = 7 /*PS_SETFIELD*/;
              break;
            case 5:
            case 7:
            case 8:
            case 9:
            case 10:
              if (pToNode.GlobalScope()) {
                $throw(new C4MCParserErr().init$pC4MCParser$pi8$pi8(this, S("can't reinstanciate object '%s' in global scope"), P(this.CurrTokenIdtf, 0)));
              }
              pCpyNode = pToNode.GetNodeByName(P(this.CurrTokenIdtf, 0));
              if (pCpyNode == null) {
                $throw(new C4MCParserErr().init$pC4MCParser$pi8$pi8(this, S("unknown object: %s"), P(this.CurrTokenIdtf, 0)));
              }
              switch (pCpyNode.Type()) {
                case 1:
                  pNewNode = new C4MCOverlay().init$pC4MCParser$pC4MCNode$rC4MCOverlay$b(this, pToNode, pCpyNode, false);
                  break;
                case 3:
                  if (pCpyNode.Type() === 3) {
                    $throw(new C4MCParserErr().init$pC4MCParser$pi8$pi8(this, S("can't declare map in local scope"), P(this.CurrTokenIdtf, 0)));
                  }
                  break;
                default:
                  $throw(new C4MCParserErr().init$pC4MCParser$pi8$pi8(this, S("can't reinstanciate '%s'; object type is unknown"), P(this.CurrTokenIdtf, 0)));
                  break;
              }
              if (State === 6) {
                if (LastOperand !== pNewNode.Type()) {
                  $throw(new C4MCParserErr().init$pC4MCParser$pi8(this, S("operator type mismatch")));
                }
              }
              if (this.CurrToken === 5) {
                this.ParseTo(pNewNode);
                this.GetNextToken();
                if (this.CurrToken === 14) {
                  $throw(new C4MCParserErr().init$pC4MCParser$pi8(this, S("unexpected end of file")));
                }
              }
              State = 3 /*PS_AFTERNODE*/;
              break;
            default:
              $throw(new C4MCParserErr().init$pC4MCParser$pi8(this, S("'=', ';' or '{' expected")));
              break;
          }
          if (State !== 3) {
            break;
          }
        case 3:
          switch (this.CurrToken) {
            case 7:
              State = 0 /*PS_NONE*/;
              break;
            case 8:
            case 9:
            case 10:
              if (pToNode.GlobalScope()) {
                $throw(new C4MCParserErr().init$pC4MCParser$pi8(this, S("operators not allowed in global scope")));
              }
              if (!pNewNode.SetOp(this.CurrToken)) {
                $throw(new C4MCParserErr().init$pC4MCParser$pi8(this, S("';' expected")));
              }
              LastOperand = pNewNode.Type();
              State = 4 /*PS_GOTOP*/;
              break;
            default:
              $throw(new C4MCParserErr().init$pC4MCParser$pi8(this, S("';' or operator expected")));
              break;
          }
          if (pToNode.GlobalScope()) {
            pNewNode.ReEvaluate();
          }
          pNewNode = null;
          break;
        case 7:
          this.ParseValue(pToNode, P(FieldName, 0));
          State = 0 /*PS_NONE*/;
          break;
      }
      if (Done) {
        break;
      }
    }
    if (State !== 0) {
      if (State === 4) {
        $throw(new C4MCParserErr().init$pC4MCParser$pi8(this, S("second operand expected")));
      } else {
        $throw(new C4MCParserErr().init$pC4MCParser$pi8(this, S("unexpected end of file")));
      }
    }
  }

  ParseValue(pToNode, szFieldName) {
    let Value = 0;
    let Type = 0;
    switch (this.CurrToken) {
      case 2:
        {
          if (!pToNode.SetField(this, szFieldName, P(this.CurrTokenIdtf, 0), 0, this.CurrToken)) {
            $throw(new C4MCParserErr().init$pC4MCParser$pi8$pi8(this, S("field '%s' not found"), szFieldName));
          }
          if (!this.GetNextToken()) {
            $throw(new C4MCParserErr().init$pC4MCParser$pi8(this, S("unexpected end of file")));
          }
          break;
        }
      case 3:
      case 13:
      case 12:
        {
          Value = this.CurrTokenVal;
          Type = this.CurrToken;
          if (!this.GetNextToken()) {
            $throw(new C4MCParserErr().init$pC4MCParser$pi8(this, S("unexpected end of file")));
          }
          if (11 === this.CurrToken) {
            if (!this.GetNextToken()) {
              $throw(new C4MCParserErr().init$pC4MCParser$pi8(this, S("unexpected end of file")));
            }
            if (3 === this.CurrToken || 13 === this.CurrToken || 12 === this.CurrToken) {
              Value = (Value >>> 0) + Random((this.CurrTokenVal - Value | 0) >>> 0) >>> 0 | 0;
            } else {
              $throw(new C4MCParserErr().init$pC4MCParser$pi8$pi8(this, S("constant for field '%s' expected"), P(this.CurrTokenIdtf, 0)));
            }
            Type = this.CurrToken;
            if (!this.GetNextToken()) {
              $throw(new C4MCParserErr().init$pC4MCParser$pi8(this, S("unexpected end of file")));
            }
          }
          if (!pToNode.SetField(this, szFieldName, P(this.CurrTokenIdtf, 0), Value, Type)) {
            $throw(new C4MCParserErr().init$pC4MCParser$pi8$pi8(this, S("field '%s' not found"), szFieldName));
          }
          break;
        }
      default:
        {
          $throw(new C4MCParserErr().init$pC4MCParser$pi8$pi8(this, S("constant for field '%s' expected"), P(this.CurrTokenIdtf, 0)));
        }
    }
    if (this.CurrToken !== 7) {
      $throw(new C4MCParserErr().init$pC4MCParser$pi8(this, S("';' expected")));
    }
  }

  init(pMapCreator) {
    this.MapCreator = pMapCreator;
    this.Code = null;
    this.BPos = null;
    this.CPos = null;
    $wr(P(this.Filename, 0), 0, 0);
    return this;
  }

  $dtor() {
    C4MCParser.prototype.Clear.call(this);
  }

  Clear() {
    $delete(this.Code);
    this.Code = null;
    this.BPos = null;
    this.CPos = null;
    $wr(P(this.Filename, 0), 0, 0);
  }

  ParseFile(szFilename, pGrp) {
    const iSize = [0];
    this.Clear();
    $.SCopy$pi8$pi8$u64(szFilename, P(this.Filename, 0), 30);
    if (pGrp == null) {
      $throw(new C4MCParserErr().init$pC4MCParser$pi8(this, S("internal error: no group")));
    }
    if (!pGrp.AccessEntry(szFilename, P(iSize, 0))) {
      $throw(new C4MCParserErr().init$pC4MCParser$pi8(this, S("file not found")));
    }
    if (iSize[0] === 0) {
      return;
    }
    this.Code = P(new Int8Array(iSize[0] + 1), 0);
    pGrp.Read$px$u64(this.Code, iSize[0]);
    this.Code.a[this.Code.o + iSize[0]] = 0;
    this.BPos = this.Code;
    this.CPos = this.Code;
    this.ParseTo(this.MapCreator);
    if (false) {
      PrintNodeTree(this.MapCreator, 0);
    }
    this.Clear();
  }

  Parse(szScript) {
    this.Clear();
    this.BPos = szScript;
    this.CPos = szScript;
    this.ParseTo(this.MapCreator);
    if (false) {
      PrintNodeTree(this.MapCreator, 0);
    }
    this.Clear();
  }

  ParseMemFile(szScript, szFilename) {
    this.Clear();
    $.SCopy$pi8$pi8$u64(szFilename, P(this.Filename, 0), 30);
    this.BPos = szScript;
    this.CPos = szScript;
    this.ParseTo(this.MapCreator);
    this.Clear();
  }

  $clone() { return new C4MCParser().$assign(this); }
  $assign(o) {
    this.MapCreator = o.MapCreator;
    this.Code = o.Code;
    this.BPos = o.BPos;
    this.CPos = o.CPos;
    this.CurrToken = o.CurrToken;
    this.CurrTokenIdtf = o.CurrTokenIdtf.slice();
    this.CurrTokenVal = o.CurrTokenVal;
    this.Filename = o.Filename.slice();
    return this;
  }
}

export class C4MCOverlay extends C4MCNode {
  Seed = 0;
  FixedSeed = 0;
  X = 0;
  Y = 0;
  Wdt = 0;
  Hgt = 0;
  OffX = 0;
  OffY = 0;
  RX = new C4MCNode$int_bool();
  RY = new C4MCNode$int_bool();
  RWdt = new C4MCNode$int_bool();
  RHgt = new C4MCNode$int_bool();
  ROffX = new C4MCNode$int_bool();
  ROffY = new C4MCNode$int_bool();
  Material = 0;
  Sub = false;
  Texture = new Int8Array(16);
  MatClr = 0;
  MatClrBkg = 0;
  Op = 0;
  Algorithm = null;
  Turbulence = 0;
  Lambda = 0;
  Rotate = 0;
  Alpha = new C4MCNode$int_bool();
  Beta = new C4MCNode$int_bool();
  ZoomX = 0;
  ZoomY = 0;
  Invert = false;
  LooseBounds = false;
  Group = false;
  Mask = false;
  pEvaluateFunc = null;
  pDrawFunc = null;

  init$pC4MCNode(pOwner = null) {
    super.init$pC4MCNode(pOwner);
    this.RX = new C4MCNode$int_bool();
    this.RY = new C4MCNode$int_bool();
    this.RWdt = new C4MCNode$int_bool();
    this.RHgt = new C4MCNode$int_bool();
    this.ROffX = new C4MCNode$int_bool();
    this.ROffY = new C4MCNode$int_bool();
    this.Alpha = new C4MCNode$int_bool();
    this.Beta = new C4MCNode$int_bool();
    this.X = this.Y = this.Wdt = this.Hgt = this.OffX = this.OffY = 0;
    this.Material = -1;
    $wr(P(this.Texture, 0), 0, 0);
    this.Op = 0 /*MCT_NONE*/;
    this.MatClr = 0;
    this.MatClrBkg = 0;
    this.Algorithm = null;
    this.Sub = false;
    this.ZoomX = this.ZoomY = 0;
    this.FixedSeed = this.Seed = 0;
    this.Turbulence = this.Lambda = this.Rotate = 0;
    this.Invert = this.LooseBounds = this.Group = this.Mask = false;
    this.pEvaluateFunc = this.pDrawFunc = null;
    return this;
  }

  init$pC4MCParser$pC4MCNode$rC4MCOverlay$b(pParser, pOwner, rTemplate, fClone) {
    super.init$pC4MCParser$pC4MCNode$rC4MCNode$b(pParser, pOwner, rTemplate, fClone);
    this.RX = new C4MCNode$int_bool();
    this.RY = new C4MCNode$int_bool();
    this.RWdt = new C4MCNode$int_bool();
    this.RHgt = new C4MCNode$int_bool();
    this.ROffX = new C4MCNode$int_bool();
    this.ROffY = new C4MCNode$int_bool();
    this.Alpha = new C4MCNode$int_bool();
    this.Beta = new C4MCNode$int_bool();
    this.X = rTemplate.X;
    this.Y = rTemplate.Y;
    this.Wdt = rTemplate.Wdt;
    this.Hgt = rTemplate.Hgt;
    this.RX.$assign(rTemplate.RX);
    this.RY.$assign(rTemplate.RY);
    this.RWdt.$assign(rTemplate.RWdt);
    this.RHgt.$assign(rTemplate.RHgt);
    this.OffX = rTemplate.OffX;
    this.OffY = rTemplate.OffY;
    this.ROffX.$assign(rTemplate.ROffX);
    this.ROffY.$assign(rTemplate.ROffY);
    this.Material = rTemplate.Material;
    $.SCopy$pi8$pi8$u64(P(rTemplate.Texture, 0), P(this.Texture, 0), 30);
    this.Algorithm = rTemplate.Algorithm;
    this.Sub = rTemplate.Sub;
    this.ZoomX = rTemplate.ZoomX;
    this.ZoomY = rTemplate.ZoomY;
    this.MatClr = rTemplate.MatClr;
    this.MatClrBkg = rTemplate.MatClrBkg;
    this.Seed = rTemplate.Seed;
    this.Alpha.$assign(rTemplate.Alpha);
    this.Beta.$assign(rTemplate.Beta);
    this.Turbulence = rTemplate.Turbulence;
    this.Lambda = rTemplate.Lambda;
    this.Rotate = rTemplate.Rotate;
    this.Invert = rTemplate.Invert;
    this.LooseBounds = rTemplate.LooseBounds;
    this.Group = rTemplate.Group;
    this.Mask = rTemplate.Mask;
    this.FixedSeed = rTemplate.FixedSeed;
    this.pEvaluateFunc = rTemplate.pEvaluateFunc;
    this.pDrawFunc = rTemplate.pDrawFunc;
    if (fClone) {
      this.Op = rTemplate.Op;
    } else {
      this.Op = 0 /*MCT_NONE*/;
    }
    return this;
  }

  clone(pParser, pToNode) {
    return new C4MCOverlay().init$pC4MCParser$pC4MCNode$rC4MCOverlay$b(pParser, pToNode, this, true);
  }

  Default() {
    this.Algorithm = this.GetAlgo(S("solid"));
    this.Material = -1;
    $wr(P(this.Texture, 0), 0, 0);
    this.Sub = true;
    this.OffX = this.OffY = this.X = this.Y = 0;
    this.ROffX.Set(0, true);
    this.ROffY.Set(0, true);
    this.RX.Set(0, true);
    this.RY.Set(0, true);
    this.Wdt = this.Hgt = 100;
    this.RWdt.Set(100, true);
    this.RHgt.Set(100, true);
    this.ZoomX = this.ZoomY = 100;
    this.Alpha.Set(0, false);
    this.Beta.Set(0, false);
    this.Turbulence = this.Lambda = this.Rotate = 0;
    this.Invert = this.LooseBounds = this.Group = this.Mask = false;
    this.FixedSeed = 0;
    this.pEvaluateFunc = this.pDrawFunc = null;
  }

  SetOp(eOp) {
    this.Op = eOp;
    return true;
  }

  GetAlgo(szName) {
    for (let pAlgo = $oat($.C4MCAlgoMap, 0); pAlgo.Function != null; pAlgo = $oadd(pAlgo, 1)) {
      if ($.SEqual(P(pAlgo.Identifier, 0), szName)) {
        return pAlgo;
      }
    }
    return null;
  }

  SetField(pParser, szField, szSVal, iVal, ValType) {
    let iMat = 0;
    let pAlgo = null;
    if (C4MCNode.prototype.SetField.call(this, pParser, szField, szSVal, iVal, ValType)) {
      return true;
    }
    for (let pAttr = $oat($.C4MCOvrlMap, 0); pAttr.Name.a[pAttr.Name.o] !== 0; pAttr = $oadd(pAttr, 1)) {
      if ($.SEqual(szField, pAttr.Name)) {
        let Target = new MemberAdapter$C4MCOverlay().init(this, pAttr.Offset);
        switch (pAttr.Type) {
          case 1:
            $wr(Target.As$6(), 0, this.IntPar(pParser, szSVal, iVal, ValType));
            break;
          case 2:
            Target.As$2().Set(this.IntPar(pParser, szSVal, iVal, ValType), ValType === 12 || ValType === 3);
            break;
          case 3:
            Target.As$2().Set(this.IntPar(pParser, szSVal, iVal, ValType), ValType === 12);
            break;
          case 4:
            iMat = this.MapCreator.MatMap.Get(this.StrPar(pParser, szSVal, iVal, ValType));
            if (iMat === -1) {
              $throw(new C4MCParserErr().init$pC4MCParser$pi8$pi8(pParser, S("material '%s' not found"), this.StrPar(pParser, szSVal, iVal, ValType)));
            }
            $wr(Target.As$6(), 0, iMat);
            break;
          case 5:
            if (!this.MapCreator.TexMap.CheckTexture(this.StrPar(pParser, szSVal, iVal, ValType))) {
              $throw(new C4MCParserErr().init$pC4MCParser$pi8$pi8(pParser, S("texture '%s' not found"), this.StrPar(pParser, szSVal, iVal, ValType)));
            }
            $.SCopy$pi8$pi8$u64(this.StrPar(pParser, szSVal, iVal, ValType), P($rd(Target.As()), 0), 15);
            break;
          case 6:
            pAlgo = this.GetAlgo(this.StrPar(pParser, szSVal, iVal, ValType));
            if (pAlgo == null) {
              $throw(new C4MCParserErr().init$pC4MCParser$pi8$pi8(pParser, S("algorithm '%s' not found"), this.StrPar(pParser, szSVal, iVal, ValType)));
            }
            $wr(Target.As$3(), 0, pAlgo);
            break;
          case 7:
            $wr(Target.As$5(), 0, this.IntPar(pParser, szSVal, iVal, ValType) !== 0);
            break;
          case 8:
            $wr(Target.As$6(), 0, $.Clamp$i32$i32$i32(100 - this.IntPar(pParser, szSVal, iVal, ValType) | 0, 1, 200));
            break;
          case 9:
            {
              let pSFunc = $.GameScript.ScenPropList._getPropList().GetFunc$pi8(this.StrPar(pParser, szSVal, iVal, ValType));
              if (pSFunc == null) {
                $throw(new C4MCParserErr().init$pC4MCParser$pi8$pi8(pParser, S("script func '%s' not found in scenario script"), this.StrPar(pParser, szSVal, iVal, ValType)));
              }
              $wr(Target.As$4(), 0, new C4MCCallbackArray().init(pSFunc, this.MapCreator));
            }
          default:
            break;
        }
        return true;
      }
    }
    return false;
  }

  Evaluate() {
    C4MCNode.prototype.Evaluate.call(this);
    if ($.Inside$i32$i32$i32$3(this.Material, 0, this.MapCreator.MatMap.Num - 1 | 0)) {
      this.MatClr = this.MapCreator.TexMap.GetIndexMatTex(P($oidx(this.MapCreator.MatMap.Map, this.Material).Name, 0), $rd(P(this.Texture, 0)) !== 0 ? P(this.Texture, 0) : null) & 0xff;
      if (this.MatClr === 0 || !this.Sub) {
        this.MatClrBkg = 0;
      } else {
        this.MatClrBkg = $.Mat2PixColDefault($.MTunnel);
      }
    } else {
      this.MatClr = 0;
      this.MatClrBkg = 0;
    }
    if (this.Owner != null) {
      let pOwnrOvrl = null;
      if ((pOwnrOvrl = this.OwnerOverlay()) != null) {
        let iOwnerWdt = pOwnrOvrl.Wdt;
        let iOwnerHgt = pOwnrOvrl.Hgt;
        this.X = this.RX.Evaluate(iOwnerWdt) + pOwnrOvrl.X | 0;
        this.Y = this.RY.Evaluate(iOwnerHgt) + pOwnrOvrl.Y | 0;
        this.Wdt = this.RWdt.Evaluate(iOwnerWdt);
        this.Hgt = this.RHgt.Evaluate(iOwnerHgt);
        this.OffX = this.ROffX.Evaluate(iOwnerWdt);
        this.OffY = this.ROffY.Evaluate(iOwnerHgt);
      }
    }
    if (!((this.Seed = this.FixedSeed) !== 0)) {
      let r1 = Random(32768) | 0;
      let r2 = Random(65536) | 0;
      this.Seed = r1 << 16 | 0 | r2;
    }
  }

  Overlay() {
    return this;
  }

  FirstOfChain() {
    let pOvrl = this;
    let pPrevO = null;
    while (pOvrl.Prev != null) {
      if (!((pPrevO = pOvrl.Prev.Overlay()) != null)) {
        break;
      }
      if (pPrevO.Op === 0) {
        break;
      }
      pOvrl = pPrevO;
    }
    return pOvrl;
  }

  CheckMask(iX, iY) {
    if (!this.LooseBounds) {
      if (iX < this.X || iY < this.Y || iX >= (this.X + this.Wdt | 0) || iY >= (this.Y + this.Hgt | 0)) {
        return false;
      }
    }
    if ($.Config.General.DebugRec !== 0) {
      let rc = new $.C4RCTrf();
      rc.x = iX;
      rc.y = iY;
      rc.Rotate = this.Rotate;
      rc.Turbulence = this.Turbulence;
      $.AddDbgRec(147 /*RCT_MCT1*/, $bytesView(rc, [["x", 0, "i32", 0], ["y", 4, "i32", 0], ["Turbulence", 8, "i32", 0], ["Rotate", 12, "i32", 0]], 16), 16);
    }
    let dX = $.itofix$i32(iX);
    let dY = $.itofix$i32(iY);
    if (this.Turbulence !== 0) {
      let Rad2Grad = $.itofix$i32$i32(0x394bb8, 65536);
      let j = 3;
      for (let i = 10; i <= this.Turbulence; i = Math.imul(i, 10)) {
        let Seed2 = 0;
        Seed2 = this.Seed;
        for (let l = 0; l < (this.Lambda + 1 | 0); l = l + 1 | 0) {
          for (let d = $.itofix$i32(2); d.op_lt$i32(6); d.op_addAssign$C4Fixed($.C4REAL10(15))) {
            dX.op_addAssign$C4Fixed($.Sin(dX.op_div$i32(7).op_add$C4Fixed($.itofix$i32(Seed2).op_div$i32(this.ZoomX)).op_add$C4Fixed(dY).op_div$i32(j).op_add$C4Fixed(d).op_mul$C4Fixed(Rad2Grad)).op_mul$i32(j).op_div$i32(2));
            dY.op_addAssign$C4Fixed($.Cos(dY.op_div$i32(7).op_add$C4Fixed($.itofix$i32(Seed2).op_div$i32(this.ZoomY)).op_add$C4Fixed(dX).op_div$i32(j).op_sub$C4Fixed(d).op_mul$C4Fixed(Rad2Grad)).op_mul$i32(j).op_div$i32(2));
          }
          Seed2 = (Math.imul(this.Seed, Seed2 << 3 | 0) + 17509 | 0) & 65535;
        }
        j = j + 3 | 0;
      }
    }
    if (this.Rotate !== 0) {
      let dXo = dX.$clone();
      let dYo = dY.$clone();
      dX.$assign(dXo.op_mul$C4Fixed($.Cos($.itofix$i32(this.Rotate))).op_sub$C4Fixed(dYo.op_mul$C4Fixed($.Sin($.itofix$i32(this.Rotate)))));
      dY.$assign(dYo.op_mul$C4Fixed($.Cos($.itofix$i32(this.Rotate))).op_add$C4Fixed(dXo.op_mul$C4Fixed($.Sin($.itofix$i32(this.Rotate)))));
    }
    if (this.Rotate !== 0 || this.Turbulence !== 0) {
      iX = $.fixtoi$C4Fixed$i32(dX, this.ZoomX);
      iY = $.fixtoi$C4Fixed$i32(dY, this.ZoomY);
    } else {
      iX = Math.imul(iX, this.ZoomX);
      iY = Math.imul(iY, this.ZoomY);
    }
    if ($.Config.General.DebugRec !== 0) {
      let rc2 = new $.C4RCPos();
      rc2.x = iX;
      rc2.y = iY;
      $.AddDbgRec(148 /*RCT_MCT2*/, $bytesView(rc2, [["x", 0, "i32", 0], ["y", 4, "i32", 0]], 8), 8);
    }
    iX = iX - Math.imul(this.OffX, this.ZoomX) | 0;
    iY = iY - Math.imul(this.OffY, this.ZoomY) | 0;
    if (this.LooseBounds) {
      if (iX < Math.imul(this.X, this.ZoomX) || iY < Math.imul(this.Y, this.ZoomY) || iX >= Math.imul(this.X + this.Wdt | 0, this.ZoomX) || iY >= Math.imul(this.Y + this.Hgt | 0, this.ZoomY)) {
        return this.Invert;
      }
    }
    return ((this.Algorithm.Function(this, iX, iY) ? 1 : 0) ^ (this.Invert ? 1 : 0)) !== 0;
  }

  RenderPix(iX, iY, rPix, rPixBkg, eLastOp = 0 /*MCT_NONE*/, fLastSet = false, fDraw = true, ppPixelSetOverlay = null) {
    let SetThis = this.CheckMask(iX, iY);
    let DoSet = false;
    switch (eLastOp) {
      case 8:
        DoSet = SetThis && fLastSet;
        break;
      case 9:
        DoSet = SetThis || fLastSet;
        break;
      case 10:
        DoSet = ((SetThis ? 1 : 0) ^ (fLastSet ? 1 : 0)) !== 0;
        break;
      default:
        DoSet = SetThis;
        break;
    }
    if (DoSet && fDraw && this.Op === 0 || this.Group) {
      fDraw = ((fDraw ? 1 : 0) & (!this.Group || this.Op === 0 ? 1 : 0)) !== 0;
      if (fDraw && DoSet && !this.Mask) {
        rPix.a[rPix.o] = this.MatClr;
        rPixBkg.a[rPixBkg.o] = this.MatClrBkg;
        if (ppPixelSetOverlay != null) {
          ppPixelSetOverlay.a[ppPixelSetOverlay.o] = this;
        }
      }
      let fLastSetC = false;
      eLastOp = 0 /*MCT_NONE*/;
      for (let pChild = this.Child0; pChild != null; pChild = pChild.Next) {
        {
          let pOvrl = pChild.Overlay();
          if (pOvrl != null) {
            fLastSetC = pOvrl.RenderPix(iX, iY, rPix, rPixBkg, eLastOp, fLastSetC, fDraw, ppPixelSetOverlay);
            if (this.Group && pOvrl.Op === 0) {
              DoSet = ((DoSet ? 1 : 0) | (fLastSetC ? 1 : 0)) !== 0;
            }
            eLastOp = pOvrl.Op;
          }
        }
      }
      if (this.pEvaluateFunc != null && DoSet && fDraw) {
        this.pEvaluateFunc.EnablePixel(iX, iY);
      }
    }
    return DoSet;
  }

  PeekPix(iX, iY) {
    let pOvrl = this;
    let fLastSetC = false;
    let eLastOp = 0 /*MCT_NONE*/;
    const Crap = [0];
    while (true) {
      fLastSetC = pOvrl.RenderPix(iX, iY, P(Crap, 0), P(Crap, 0), eLastOp, fLastSetC, false);
      eLastOp = pOvrl.Op;
      if (pOvrl.Op === 0) {
        break;
      }
      pOvrl = pOvrl.Next.Overlay();
    }
    return fLastSetC;
  }

  InBounds(iX, iY) {
    return iX >= this.X && iY >= this.Y && iX < (this.X + this.Wdt | 0) && iY < (this.Y + this.Hgt | 0);
  }

  Type() {
    return 1 /*MCN_Overlay*/;
  }

  $clone() { return new C4MCOverlay().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Seed = o.Seed;
    this.FixedSeed = o.FixedSeed;
    this.X = o.X;
    this.Y = o.Y;
    this.Wdt = o.Wdt;
    this.Hgt = o.Hgt;
    this.OffX = o.OffX;
    this.OffY = o.OffY;
    this.RX.$assign(o.RX);
    this.RY.$assign(o.RY);
    this.RWdt.$assign(o.RWdt);
    this.RHgt.$assign(o.RHgt);
    this.ROffX.$assign(o.ROffX);
    this.ROffY.$assign(o.ROffY);
    this.Material = o.Material;
    this.Sub = o.Sub;
    this.Texture = o.Texture.slice();
    this.MatClr = o.MatClr;
    this.MatClrBkg = o.MatClrBkg;
    this.Op = o.Op;
    this.Algorithm = o.Algorithm;
    this.Turbulence = o.Turbulence;
    this.Lambda = o.Lambda;
    this.Rotate = o.Rotate;
    this.Alpha.$assign(o.Alpha);
    this.Beta.$assign(o.Beta);
    this.ZoomX = o.ZoomX;
    this.ZoomY = o.ZoomY;
    this.Invert = o.Invert;
    this.LooseBounds = o.LooseBounds;
    this.Group = o.Group;
    this.Mask = o.Mask;
    this.pEvaluateFunc = o.pEvaluateFunc;
    this.pDrawFunc = o.pDrawFunc;
    return this;
  }
}

export class C4MCPoint extends C4MCNode {
  X = 0;
  Y = 0;
  RX = new C4MCNode$int_bool();
  RY = new C4MCNode$int_bool();

  init$pC4MCNode(pOwner = null) {
    super.init$pC4MCNode(pOwner);
    this.RX = new C4MCNode$int_bool();
    this.RY = new C4MCNode$int_bool();
    this.X = this.Y = 0;
    return this;
  }

  init$pC4MCParser$pC4MCNode$rC4MCPoint$b(pParser, pOwner, rTemplate, fClone) {
    super.init$pC4MCParser$pC4MCNode$rC4MCNode$b(pParser, pOwner, rTemplate, fClone);
    this.RX = new C4MCNode$int_bool();
    this.RY = new C4MCNode$int_bool();
    this.X = rTemplate.X;
    this.Y = rTemplate.Y;
    this.RX.$assign(rTemplate.RX);
    this.RY.$assign(rTemplate.RY);
    return this;
  }

  clone(pParser, pToNode) {
    return new C4MCPoint().init$pC4MCParser$pC4MCNode$rC4MCPoint$b(pParser, pToNode, this, true);
  }

  Default() {
    this.X = this.Y = 0;
  }

  Evaluate() {
    C4MCNode.prototype.Evaluate.call(this);
    if (this.Owner != null) {
      let pOwnrOvrl = null;
      if ((pOwnrOvrl = this.OwnerOverlay()) != null) {
        this.X = this.RX.Evaluate(pOwnrOvrl.Wdt) + pOwnrOvrl.X | 0;
        this.Y = this.RY.Evaluate(pOwnrOvrl.Hgt) + pOwnrOvrl.Y | 0;
      }
    }
  }

  SetField(pParser, szField, szSVal, iVal, ValType) {
    if (ValType === 3) {
      return false;
    }
    if ($.SEqual(szField, S("x"))) {
      this.RX.Set(this.IntPar(pParser, szSVal, iVal, ValType), ValType === 12);
      return true;
    } else if ($.SEqual(szField, S("y"))) {
      this.RY.Set(this.IntPar(pParser, szSVal, iVal, ValType), ValType === 12);
      return true;
    }
    return false;
  }

  Type() {
    return 2 /*MCN_Point*/;
  }

  $clone() { return new C4MCPoint().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.X = o.X;
    this.Y = o.Y;
    this.RX.$assign(o.RX);
    this.RY.$assign(o.RY);
    return this;
  }
}

export class C4MapCreatorS2 extends C4MCNode {
  Landscape = null;
  TexMap = null;
  MatMap = null;
  DefaultMap = new C4MCMap().init$pC4MCNode();
  DefaultOverlay = new C4MCOverlay().init$pC4MCNode();
  DefaultPoint = new C4MCPoint().init$pC4MCNode();
  pCurrentMap = null;
  CallbackArrays = new C4MCCallbackArrayList().init();
  PlayerCount = 0;

  init(pLandscape, pTexMap, pMatMap, iPlayerCount) {
    super.init$pC4MCNode(null);
    this.DefaultMap = new C4MCMap().init$pC4MCNode();
    this.DefaultOverlay = new C4MCOverlay().init$pC4MCNode();
    this.DefaultPoint = new C4MCPoint().init$pC4MCNode();
    this.CallbackArrays = new C4MCCallbackArrayList().init();
    this.MapCreator = this;
    this.Landscape = pLandscape;
    this.TexMap = pTexMap;
    this.MatMap = pMatMap;
    this.PlayerCount = iPlayerCount;
    this.DefaultMap.MapCreator = this;
    this.DefaultOverlay.MapCreator = this;
    this.DefaultPoint.MapCreator = this;
    C4MapCreatorS2.prototype.Default.call(this);
    return this;
  }

  $dtor() {
    C4MapCreatorS2.prototype.Clear.call(this);
    super.$dtor();
  }

  Default() {
    this.DefaultMap.Default();
    C4MCOverlay.prototype.Default.call(this.DefaultOverlay);
    this.DefaultPoint.Default();
    this.pCurrentMap = null;
  }

  Clear() {
    C4MCNode.prototype.Clear.call(this);
    this.CallbackArrays.Clear();
    this.Default();
  }

  ReadFile(szFilename, pGrp) {
    try {
      new C4MCParser().init(this).ParseFile(szFilename, pGrp);
    } catch ($e1) {
      if ($e1 instanceof C4MCParserErr) {
        const err = $e1;
        err.show();
        return false;
      } else {
        throw $e1;
      }
    }
    return true;
  }

  ReadScript(szScript) {
    try {
      new C4MCParser().init(this).Parse(szScript);
    } catch ($e1) {
      if ($e1 instanceof C4MCParserErr) {
        const err = $e1;
        err.show();
        return false;
      } else {
        throw $e1;
      }
    }
    return true;
  }

  GetMap(szMapName) {
    let pMap = null;
    let pNode = null;
    if (szMapName != null && szMapName.a[szMapName.o] !== 0) {
      if ((pNode = this.GetNodeByName(szMapName)) != null) {
        if (pNode.Type() === 3) {
          pMap = pNode;
        }
      }
    } else {
      for (pNode = this.ChildL; pNode != null; pNode = pNode.Prev) {
        if (pNode.Type() === 3) {
          pMap = pNode;
          break;
        }
      }
    }
    return pMap;
  }

  Render(szMapName, sfcMap, sfcMapBkg) {
    0;
    0;
    let pMap = this.GetMap(szMapName);
    if (pMap == null) {
      return false;
    }
    let sfcWdt = 0;
    let sfcHgt = 0;
    sfcWdt = pMap.Wdt;
    sfcHgt = pMap.Hgt;
    if (sfcWdt === 0 || sfcHgt === 0) {
      return false;
    }
    sfcMap.a[sfcMap.o] = new $.CSurface8().init$i32$i32(sfcWdt, sfcHgt);
    sfcMapBkg.a[sfcMapBkg.o] = new $.CSurface8().init$i32$i32(sfcWdt, sfcHgt);
    0;
    pMap.RenderTo(sfcMap.a[sfcMap.o].Bits, sfcMapBkg.a[sfcMapBkg.o].Bits, sfcMap.a[sfcMap.o].Pitch);
    return true;
  }

  RenderBuf(szMapName, sfcWdt, sfcHgt) {
    let pMap = this.GetMap(szMapName);
    if (pMap == null) {
      return null;
    }
    sfcWdt.a[sfcWdt.o] = pMap.Wdt;
    sfcHgt.a[sfcHgt.o] = pMap.Hgt;
    if (sfcWdt.a[sfcWdt.o] === 0 || sfcHgt.a[sfcHgt.o] === 0) {
      return null;
    }
    const dwSfcWdt = [sfcWdt.a[sfcWdt.o]];
    DWordAlign(P(dwSfcWdt, 0));
    sfcWdt.a[sfcWdt.o] = dwSfcWdt[0];
    let buf = P(new Uint8Array($u64n(Math.imul(sfcWdt.a[sfcWdt.o], sfcHgt.a[sfcHgt.o]))), 0);
    pMap.RenderTo(buf, null, sfcWdt.a[sfcWdt.o]);
    return buf;
  }

  SetC4SLandscape(pLandscape) {
    this.Landscape = pLandscape;
  }

  GlobalScope() {
    return true;
  }

  ExecuteCallbacks(iMapZoom) {
    this.CallbackArrays.Execute(iMapZoom);
  }

  $clone() { return new C4MapCreatorS2().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Landscape = o.Landscape;
    this.TexMap = o.TexMap;
    this.MatMap = o.MatMap;
    this.DefaultMap.$assign(o.DefaultMap);
    this.DefaultOverlay.$assign(o.DefaultOverlay);
    this.DefaultPoint.$assign(o.DefaultPoint);
    this.pCurrentMap = o.pCurrentMap;
    this.CallbackArrays.$assign(o.CallbackArrays);
    this.PlayerCount = o.PlayerCount;
    return this;
  }
}

export class C4MCMap extends C4MCOverlay {

  init$pC4MCNode(pOwner = null) {
    super.init$pC4MCNode(pOwner);
    return this;
  }

  init$pC4MCParser$pC4MCNode$rC4MCMap$b(pParser, pOwner, rTemplate, fClone) {
    super.init$pC4MCParser$pC4MCNode$rC4MCOverlay$b(pParser, pOwner, rTemplate, fClone);
    return this;
  }

  clone(pParser, pToNode) {
    return new C4MCMap().init$pC4MCParser$pC4MCNode$rC4MCMap$b(pParser, pToNode, this, true);
  }

  Default() {
    C4MCOverlay.prototype.Default.call(this);
    this.MapCreator.Landscape.GetMapSize(P(this, "Wdt"), P(this, "Hgt"), this.MapCreator.PlayerCount);
  }

  RenderTo(pToBuf, pToBufBkg, iPitch) {
    if (this.MapCreator != null) {
      this.MapCreator.pCurrentMap = this;
    }
    for (let iY = 0; iY < this.Hgt; iY = iY + 1 | 0) {
      for (let iX = 0; iX < this.Wdt; iX = iX + 1 | 0) {
        const dummyPix = [0];
        pToBuf.a[pToBuf.o] = 0;
        if (pToBufBkg != null) {
          pToBufBkg.a[pToBufBkg.o] = 0;
        }
        const pRenderedOverlay = [null];
        this.RenderPix(iX, iY, pToBuf, (pToBufBkg != null ? pToBufBkg : P(dummyPix, 0)), 0 /*MCT_NONE*/, false, true, P(pRenderedOverlay, 0));
        if (pRenderedOverlay[0] != null) {
          if (pRenderedOverlay[0].pDrawFunc != null) {
            pRenderedOverlay[0].pDrawFunc.EnablePixel(iX, iY);
          }
        }
        pToBuf = pToBuf.add(1);
        if (pToBufBkg != null) {
          pToBufBkg = pToBufBkg.add(1);
        }
      }
      pToBuf = pToBuf.add(iPitch - this.Wdt | 0);
      if (pToBufBkg != null) {
        pToBufBkg = pToBufBkg.add(iPitch - this.Wdt | 0);
      }
    }
    if (this.MapCreator != null) {
      this.MapCreator.pCurrentMap = null;
    }
    return true;
  }

  SetSize(iWdt, iHgt) {
    this.Wdt = iWdt;
    this.Hgt = iHgt;
    this.MapCreator.ReEvaluate();
  }

  Type() {
    return 3 /*MCN_Map*/;
  }

  $clone() { return new C4MCMap().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

function DWordAlign(val) {
  if (val.a[val.o] % 4 !== 0) {
    val.a[val.o] >>= 2;
    val.a[val.o] <<= 2;
    val.a[val.o] = val.a[val.o] + 4 | 0;
  }
}

function PrintNodeTree(pNode, depth) {
  for (let i = 0; i < depth; i = i + 1 | 0) {
    c$printf(S("  "));
  }
  switch (pNode.Type()) {
    case 0:
      c$printf(S("Node %s\n"), P(pNode.Name, 0));
      break;
    case 1:
      c$printf(S("Overlay %s\n"), P(pNode.Name, 0));
      break;
    case 2:
      c$printf(S("Point %s\n"), P(pNode.Name, 0));
      break;
    case 3:
      c$printf(S("Map %s\n"), P(pNode.Name, 0));
      break;
  }
  for (let pChild = pNode.Child0; pChild != null; pChild = pChild.Next) {
    PrintNodeTree(pChild, depth + 1 | 0);
  }
}

export function PreparePeek(ppOvrl, iX, iY, ppTopOvrl) {
  iX.a[iX.o] = iX.a[iX.o] / ppOvrl.a[ppOvrl.o].ZoomX | 0;
  iY.a[iY.o] = iY.a[iY.o] / ppOvrl.a[ppOvrl.o].ZoomY | 0;
  let pOvrl2 = ppOvrl.a[ppOvrl.o].OwnerOverlay();
  if (pOvrl2 == null) {
    return false;
  }
  let pNextOvrl = null;
  for (ppTopOvrl.a[ppTopOvrl.o] = pOvrl2; (pNextOvrl = ppTopOvrl.a[ppTopOvrl.o].OwnerOverlay()) != null; ppTopOvrl.a[ppTopOvrl.o] = pNextOvrl) {
  }
  pOvrl2 = pOvrl2.FirstOfChain();
  ppOvrl.a[ppOvrl.o] = pOvrl2;
  return true;
}

export function AlgoSolid(_pOvrl, _iX, _iY) {
  return true;
}

export function AlgoRandom(pOvrl, iX, iY) {
  return !(((pOvrl.Seed ^ (iX << 2 | 0) ^ (iY << 5 | 0) ^ ((((pOvrl.Seed >> 16) + 1 | 0) + iX | 0) + (iY << 2 | 0) | 0)) / 17 | 0) % (pOvrl.Alpha.Evaluate(100) + 2 | 0) !== 0);
}

export function AlgoChecker(_pOvrl, iX, iY) {
  return !(((iX / 1000 | 0) % 2 ^ (iY / 1000 | 0) % 2) !== 0);
}

export function AlgoBozo(pOvrl, iX, iY) {
  let iXC = (((iX / 10 | 0) + pOvrl.Seed | 0) + (iY / 80 | 0) | 0) % 200 - 100 | 0;
  let iYC = (((iY / 10 | 0) + pOvrl.Seed | 0) + (iX / 80 | 0) | 0) % 200 - 100 | 0;
  let id = $.Abs$i32(Math.imul(iXC, iYC));
  return id > (Math.imul(10000, pOvrl.Alpha.Evaluate(100) + 10 | 0) / 50 | 0);
}

export function AlgoSin(_pOvrl, iX, iY) {
  return iY > $.fixtoi$C4Fixed($.Sin($.itofix$i32(Math.imul(iX / 100 | 0, 10))).op_add$i32(1).op_mul$i32(100).op_mul$i32(10));
}

export function AlgoBoxes(pOvrl, iX, iY) {
  let pxb = pOvrl.Beta.Evaluate(pOvrl.Wdt);
  let pxa = pOvrl.Alpha.Evaluate(pOvrl.Wdt);
  return $.Abs$i32(iX + pOvrl.Seed % 4738 | 0) % (Math.imul(pxb, 100) + 1 | 0) < (Math.imul(pxa, 100) + 1 | 0) && $.Abs$i32(iY + (pOvrl.Seed / 4738 | 0) | 0) % (Math.imul(pxb, 100) + 1 | 0) < (Math.imul(pxa, 100) + 1 | 0);
}

export function AlgoRndChecker(pOvrl, iX, iY) {
  return AlgoRandom(pOvrl, iX / 1000 | 0, iY / 1000 | 0);
}

export function AlgoLines(pOvrl, iX, _iY) {
  let pxb = pOvrl.Beta.Evaluate(pOvrl.Wdt);
  let pxa = pOvrl.Alpha.Evaluate(pOvrl.Wdt);
  return $.Abs$i32(iX + pOvrl.Seed % 4738 | 0) % (Math.imul(pxb, 100) + 1 | 0) < (Math.imul(pxa, 100) + 1 | 0);
}

export function AlgoBorder(pOvrl$, iX$, iY$) {
  const pOvrl = [pOvrl$];
  const iX = [iX$];
  const iY = [iY$];
  const pTopOvrl = [null];
  let la = pOvrl[0].Alpha.Evaluate(pOvrl[0].Wdt);
  let lb = pOvrl[0].Beta.Evaluate(pOvrl[0].Hgt);
  if (!PreparePeek(P(pOvrl, 0), P(iX, 0), P(iY, 0), P(pTopOvrl, 0))) {
    return false;
  }
  for (let x = iX[0] - la | 0; x <= (iX[0] + la | 0); x = x + 1 | 0) {
    if (pTopOvrl[0].InBounds(x, iY[0])) {
      if (!pOvrl[0].PeekPix(x, iY[0])) {
        return true;
      }
    }
  }
  for (let y = iY[0] - lb | 0; y <= (iY[0] + lb | 0); y = y + 1 | 0) {
    if (pTopOvrl[0].InBounds(iX[0], y)) {
      if (!pOvrl[0].PeekPix(iX[0], y)) {
        return true;
      }
    }
  }
  return false;
}

export function AlgoMandel(pOvrl, iX, iY) {
  let iMandelIter = (pOvrl.Alpha.Evaluate(100) !== 0 ? pOvrl.Alpha.Evaluate(100) : 1000) >>> 0;
  if (iMandelIter < 10) {
    iMandelIter = 10;
  }
  let c = (iX / 100 / pOvrl.Wdt - 0.5 * (pOvrl.ZoomX / 100)) * 4;
  let ci = (iY / 100 / pOvrl.Hgt - 0.5 * (pOvrl.ZoomY / 100)) * 4;
  let _z = c;
  let _zi = ci;
  let xz = 0;
  let i = 0;
  for (i = 0; i < iMandelIter; i = i + 1 >>> 0) {
    xz = _z * _z - _zi * _zi;
    _zi = 2 * _z * _zi + ci;
    _z = xz + c;
    if (_z * _z + _zi * _zi > 4) {
      break;
    }
  }
  return !(i < iMandelIter);
}

export function AlgoGradient(pOvrl, iX, iY) {
  return (Math.abs((iX ^ Math.imul(iY, 3)) * 0x269ec3) | 0) % 214013 % 100 > (iX / pOvrl.Wdt | 0);
}

export function AlgoScript(pOvrl, iX$, iY$) {
  const iX = [iX$];
  const iY = [iY$];
  let Pars = new $.C4AulParSet().init$ri32$ri32$mi32$mi32(P(iX, 0), P(iY, 0), pOvrl.Alpha.Evaluate(100), pOvrl.Beta.Evaluate(100));
  return $.GameScript.Call($.FormatString(S("ScriptAlgo%s"), P(pOvrl.Name, 0)).getData(), Pars.op_and()).getBool();
}

export function AlgoRndAll(pOvrl, _iX, _iY) {
  return pOvrl.Seed % 100 < pOvrl.Alpha.Evaluate(100);
}

export function AlgoPolygon(pOvrl, iX, iY) {
  if (pOvrl.ChildL == null) {
    return false;
  }
  let uX = 0;
  let uY = 0;
  let cX = 0;
  let cY = 0;
  let lX = 0;
  let count = 0;
  let ignore = false;
  let zX = 0;
  let pChild = null;
  let pStartChild = null;
  for (pChild = pOvrl.ChildL; pChild.Prev != null; pChild = pChild.Prev) {
    if (pChild.Type() === 2) {
      uX = Math.imul(pChild.X, 100);
      lX = uX;
      uY = Math.imul(pChild.Y, 100);
      if (iY !== uY) {
        break;
      }
    }
  }
  pStartChild = pChild.Next;
  if (pStartChild == null) {
    pStartChild = pOvrl.Child0;
  }
  if (pStartChild == null) {
    return false;
  }
  for (pChild = pStartChild; ; pChild = pChild.Next) {
    if (pChild == null) {
      pChild = pOvrl.Child0;
    }
    if (pChild.Type() === 2) {
      cX = Math.imul(pChild.X, 100);
      cY = Math.imul(pChild.Y, 100);
      if (ignore) {
        if (cY === iY) {
          if ((lX < iX ? 1 : 0) === (iX < cX ? 1 : 0) || cX === iX) {
            return true;
          }
        } else {
          if ((uY < iY ? 1 : 0) === (iY < cY ? 1 : 0) && lX >= iX) {
            count = count + 1 | 0;
          }
          ignore = false;
          uX = cX;
          uY = cY;
        }
      } else {
        if (cY === iY) {
          if (cX === iX) {
            return true;
          }
          ignore = true;
        } else {
          if ((uY < iY ? 1 : 0) === (iY <= cY ? 1 : 0)) {
            if (iX < $min(uX, cX)) {
              count = count + 1 | 0;
            } else if (iX <= $max(uX, cX)) {
              if (iX < (zX = (Math.imul(cX - uX | 0, iY - uY | 0) / (cY - uY | 0) | 0) + uX | 0)) {
                count = count + 1 | 0;
              }
              if (zX === iX) {
                return true;
              }
            }
          }
          uX = cX;
          uY = cY;
        }
      }
      lX = cX;
    }
    if (pChild.Next === pStartChild) {
      break;
    }
    if (pChild.Next == null) {
      if (pStartChild === pOvrl.Child0) {
        break;
      }
    }
  }
  if ((count & 1) > 0) {
    return true;
  } else {
    return false;
  }
}



export function $init(): void {
  $.C4MCAlgoMap = $own([
  ((($o) => ($o.Identifier = S("solid"), $o.Function = AlgoSolid, $o))(new C4MCAlgorithm())),
  ((($o) => ($o.Identifier = S("random"), $o.Function = AlgoRandom, $o))(new C4MCAlgorithm())),
  ((($o) => ($o.Identifier = S("checker"), $o.Function = AlgoChecker, $o))(new C4MCAlgorithm())),
  ((($o) => ($o.Identifier = S("bozo"), $o.Function = AlgoBozo, $o))(new C4MCAlgorithm())),
  ((($o) => ($o.Identifier = S("sin"), $o.Function = AlgoSin, $o))(new C4MCAlgorithm())),
  ((($o) => ($o.Identifier = S("boxes"), $o.Function = AlgoBoxes, $o))(new C4MCAlgorithm())),
  ((($o) => ($o.Identifier = S("rndchecker"), $o.Function = AlgoRndChecker, $o))(new C4MCAlgorithm())),
  ((($o) => ($o.Identifier = S("lines"), $o.Function = AlgoLines, $o))(new C4MCAlgorithm())),
  ((($o) => ($o.Identifier = S("border"), $o.Function = AlgoBorder, $o))(new C4MCAlgorithm())),
  ((($o) => ($o.Identifier = S("mandel"), $o.Function = AlgoMandel, $o))(new C4MCAlgorithm())),
  ((($o) => ($o.Identifier = S("gradient"), $o.Function = AlgoGradient, $o))(new C4MCAlgorithm())),
  ((($o) => ($o.Identifier = S("script"), $o.Function = AlgoScript, $o))(new C4MCAlgorithm())),
  ((($o) => ($o.Identifier = S("rndall"), $o.Function = AlgoRndAll, $o))(new C4MCAlgorithm())),
  ((($o) => ($o.Identifier = S("poly"), $o.Function = AlgoPolygon, $o))(new C4MCAlgorithm())),
  ((($o) => ($o.Identifier = S(""), $o.Function = null, $o))(new C4MCAlgorithm())),
]);
  $.C4MCOvrlMap = $own([
  ((($o) => ($o.Name = S("x"), $o.Type = 2 /*C4MCV_Percent*/, $o.Offset = "RX", $o))(new C4MCNodeAttr())),
  ((($o) => ($o.Name = S("y"), $o.Type = 2 /*C4MCV_Percent*/, $o.Offset = "RY", $o))(new C4MCNodeAttr())),
  ((($o) => ($o.Name = S("wdt"), $o.Type = 2 /*C4MCV_Percent*/, $o.Offset = "RWdt", $o))(new C4MCNodeAttr())),
  ((($o) => ($o.Name = S("hgt"), $o.Type = 2 /*C4MCV_Percent*/, $o.Offset = "RHgt", $o))(new C4MCNodeAttr())),
  ((($o) => ($o.Name = S("ox"), $o.Type = 2 /*C4MCV_Percent*/, $o.Offset = "ROffX", $o))(new C4MCNodeAttr())),
  ((($o) => ($o.Name = S("oy"), $o.Type = 2 /*C4MCV_Percent*/, $o.Offset = "ROffY", $o))(new C4MCNodeAttr())),
  ((($o) => ($o.Name = S("mat"), $o.Type = 4 /*C4MCV_Material*/, $o.Offset = "Material", $o))(new C4MCNodeAttr())),
  ((($o) => ($o.Name = S("tex"), $o.Type = 5 /*C4MCV_Texture*/, $o.Offset = "Texture", $o))(new C4MCNodeAttr())),
  ((($o) => ($o.Name = S("algo"), $o.Type = 6 /*C4MCV_Algorithm*/, $o.Offset = "Algorithm", $o))(new C4MCNodeAttr())),
  ((($o) => ($o.Name = S("sub"), $o.Type = 7 /*C4MCV_Boolean*/, $o.Offset = "Sub", $o))(new C4MCNodeAttr())),
  ((($o) => ($o.Name = S("zoomX"), $o.Type = 8 /*C4MCV_Zoom*/, $o.Offset = "ZoomX", $o))(new C4MCNodeAttr())),
  ((($o) => ($o.Name = S("zoomY"), $o.Type = 8 /*C4MCV_Zoom*/, $o.Offset = "ZoomY", $o))(new C4MCNodeAttr())),
  ((($o) => ($o.Name = S("a"), $o.Type = 3 /*C4MCV_Pixels*/, $o.Offset = "Alpha", $o))(new C4MCNodeAttr())),
  ((($o) => ($o.Name = S("b"), $o.Type = 3 /*C4MCV_Pixels*/, $o.Offset = "Beta", $o))(new C4MCNodeAttr())),
  ((($o) => ($o.Name = S("turbulence"), $o.Type = 1 /*C4MCV_Integer*/, $o.Offset = "Turbulence", $o))(new C4MCNodeAttr())),
  ((($o) => ($o.Name = S("lambda"), $o.Type = 1 /*C4MCV_Integer*/, $o.Offset = "Lambda", $o))(new C4MCNodeAttr())),
  ((($o) => ($o.Name = S("rotate"), $o.Type = 1 /*C4MCV_Integer*/, $o.Offset = "Rotate", $o))(new C4MCNodeAttr())),
  ((($o) => ($o.Name = S("seed"), $o.Type = 1 /*C4MCV_Integer*/, $o.Offset = "FixedSeed", $o))(new C4MCNodeAttr())),
  ((($o) => ($o.Name = S("invert"), $o.Type = 7 /*C4MCV_Boolean*/, $o.Offset = "Invert", $o))(new C4MCNodeAttr())),
  ((($o) => ($o.Name = S("loosebounds"), $o.Type = 7 /*C4MCV_Boolean*/, $o.Offset = "LooseBounds", $o))(new C4MCNodeAttr())),
  ((($o) => ($o.Name = S("grp"), $o.Type = 7 /*C4MCV_Boolean*/, $o.Offset = "Group", $o))(new C4MCNodeAttr())),
  ((($o) => ($o.Name = S("mask"), $o.Type = 7 /*C4MCV_Boolean*/, $o.Offset = "Mask", $o))(new C4MCNodeAttr())),
  ((($o) => ($o.Name = S("evalFn"), $o.Type = 9 /*C4MCV_ScriptFunc*/, $o.Offset = "pEvaluateFunc", $o))(new C4MCNodeAttr())),
  ((($o) => ($o.Name = S("drawFn"), $o.Type = 9 /*C4MCV_ScriptFunc*/, $o.Offset = "pDrawFunc", $o))(new C4MCNodeAttr())),
  ((($o) => ($o.Name = S(""), $o.Type = 0 /*C4MCV_None*/, $o.Offset = null, $o))(new C4MCNodeAttr())),
]);
}

Object.assign($, { AlgoBorder, AlgoBoxes, AlgoBozo, AlgoChecker, AlgoGradient, AlgoLines, AlgoMandel, AlgoPolygon, AlgoRandom, AlgoRndAll, AlgoRndChecker, AlgoScript, AlgoSin, AlgoSolid, C4MCAlgorithm, C4MCCallbackArray, C4MCCallbackArrayList, C4MCMap, C4MCNode, C4MCNode$int_bool, C4MCNodeAttr, C4MCOverlay, C4MCParser, C4MCParserErr, C4MCPoint, C4MapCreatorS2, DWordAlign, MemberAdapter$C4MCOverlay, PreparePeek, PrintNodeTree });
