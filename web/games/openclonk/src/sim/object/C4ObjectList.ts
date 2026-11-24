// @ts-nocheck
// OpenClonk 36de799: src/object/C4ObjectList.cpp, src/object/C4ObjectList.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $oarr, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $begin, $delete, $end } from '../../rt/std.ts';

export class C4ObjectLink {
  Obj = null;
  Prev = null;
  Next = null;

  $clone() { return new C4ObjectLink().$assign(this); }
  $assign(o) {
    this.Obj = o.Obj;
    this.Prev = o.Prev;
    this.Next = o.Next;
    return this;
  }
}

export class C4ObjectListChangeListener {

  OnObjectRemove(_list, _link) {
  }

  OnObjectAdded(_list, _link) {
  }

  OnObjectRename(_list, _link) {
  }

  OnObjectContainerChanged(_obj, _old_container, _new_container) {
  }

  $clone() { return new C4ObjectListChangeListener().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class C4ObjectList {
  First = null;
  Last = null;
  Mass = 0;
  pEnumerated = null;
  FirstIter = null;

  init() {
    this.FirstIter = null;
    C4ObjectList.prototype.Default.call(this);
    return this;
  }

  $dtor() {
    C4ObjectList.prototype.Clear$v.call(this);
  }

  begin() {
    return new C4ObjectList$iterator().init(this, this.First, false);
  }

  end() {
    return new C4ObjectList$iterator().init(this, null, false);
  }

  reverse() {
    return new C4ObjectList$ReverseView().init(this);
  }

  Default() {
    this.First = this.Last = null;
    this.Mass = 0;
    this.pEnumerated = null;
  }

  Clear$v() {
    let link = null;
    let next_link = null;
    for (link = this.First; link != null; link = next_link) {
      next_link = link.Next;
      $delete(link);
    }
    this.First = this.Last = null;
    if (this.pEnumerated != null) {
      $delete(this.pEnumerated);
      this.pEnumerated = null;
    }
    for (let it = this.FirstIter; it != null; it = it.Next) {
      it.link.$assign($.NULL_LINK$C4ObjectList);
    }
  }

  Sort() {
    let link = null;
    let is_sorted = false;
    do {
      is_sorted = true;
      for (link = this.First; link != null && link.Next != null; link = link.Next) {
        if (link.Obj.id.op_gt(link.Next.Obj.id)) {
          this.RemoveLink(link);
          this.InsertLink(link, link.Next);
          is_sorted = false;
          break;
        }
      }
    } while (!is_sorted);
  }

  Copy(list) {
    this.Clear$v();
    this.Default();
    let link = null;
    for (link = list.First; link != null; link = link.Next) {
      this.Add$pC4Object$i32$pC4ObjectList(link.Obj, 0 /*stNone*/);
    }
  }

  DrawIfCategory(cgo, player, dwCategory, invert) {
    let link = null;
    for (link = this.Last; link != null; link = link.Prev) {
      if ((!((link.Obj.Category >>> 0 & dwCategory) >>> 0 !== 0) ? 1 : 0) === (invert ? 1 : 0)) {
        link.Obj.Draw$rC4TargetFacet$i32$i32$f32$f32(cgo, player);
      }
    }
    for (link = this.Last; link != null; link = link.Prev) {
      if ((!((link.Obj.Category >>> 0 & dwCategory) >>> 0 !== 0) ? 1 : 0) === (invert ? 1 : 0)) {
        link.Obj.DrawTopFace(cgo, player);
      }
    }
  }

  Draw(cgo, player, MinPlane, MaxPlane) {
    let link = null;
    let first = null;
    for (first = this.Last; first != null; first = first.Prev) {
      if (first.Obj.GetPlane$v$c() >= MinPlane) {
        break;
      }
    }
    for (link = first; link != null; link = link.Prev) {
      if (link.Obj.GetPlane$v$c() > MaxPlane) {
        break;
      }
      if ((link.Obj.Category & 32768) !== 0) {
        continue;
      }
      link.Obj.Draw$rC4TargetFacet$i32$i32$f32$f32(cgo, player);
    }
    for (link = first; link != null; link = link.Prev) {
      if (link.Obj.GetPlane$v$c() > MaxPlane) {
        break;
      }
      if ((link.Obj.Category & 32768) !== 0) {
        continue;
      }
      link.Obj.DrawTopFace(cgo, player);
    }
  }

  DrawSelectMark(cgo) {
    let link = null;
    for (link = this.Last; link != null; link = link.Prev) {
      link.Obj.DrawSelectMark(cgo);
    }
  }

  CloseMenus() {
    let obj = null;
    let link = null;
    for (link = this.First; link != null && (obj = link.Obj) != null; link = link.Next) {
      obj.CloseMenu(true);
    }
  }

  UpdateGraphics(graphics_changed) {
    let link = null;
    for (link = this.First; link != null; link = link.Next) {
      if (link.Obj.Status !== 0) {
        link.Obj.UpdateGraphics(graphics_changed);
      }
    }
  }

  UpdateFaces(update_shapes) {
    let link = null;
    for (link = this.First; link != null; link = link.Next) {
      if (link.Obj.Status !== 0) {
        link.Obj.UpdateFace(update_shapes);
      }
    }
  }

  ClearInfo(pInfo) {
    let link = null;
    for (link = this.First; link != null; link = link.Next) {
      if (link.Obj.Status !== 0) {
        link.Obj.ClearInfo(pInfo);
      }
    }
  }

  Add$pC4Object$i32$pC4ObjectList(new_obj, sort_type, sorted_list = null) {
    if (new_obj == null || new_obj.Def == null || new_obj.Status === 0) {
      return false;
    }
    0;
    0;
    let new_link = new C4ObjectLink();
    if (new_link == null) {
      return false;
    }
    new_link.Obj = new_obj;
    let current = null;
    let previous = this.Last;
    if (sort_type === 3) {
      current = this.First;
      previous = null;
    } else if (sort_type !== 0) {
      let is_sorted = !new_obj.Unsorted;
      if (is_sorted) {
        if (sorted_list != null) {
          previous = null;
          current = this.First;
          while (current != null && (current.Obj.Status === 0 || current.Obj.Unsorted)) {
            current = current.Next;
          }
          if (current != null) {
            let link2 = null;
            for (link2 = sorted_list.First; link2 != null; link2 = link2.Next) {
              if (link2.Obj.Status !== 0 && !link2.Obj.Unsorted) {
                if (link2.Obj === new_obj) {
                  0;
                  break;
                }
                if (current != null && link2.Obj === current.Obj) {
                  previous = current;
                  current = current.Next;
                  while (current != null && (current.Obj.Status === 0 || current.Obj.Unsorted)) {
                    current = current.Next;
                  }
                  if (current == null) {
                    break;
                  }
                }
              }
            }
            0;
          }
        } else {
          if (!((new_obj.Category & 1) !== 0)) {
            for (previous = null, current = this.First; current != null; current = current.Next) {
              if (current.Obj.Status !== 0 && !current.Obj.Unsorted) {
                if (current.Obj.GetPlane$v$c() === new_obj.GetPlane$v$c() && current.Obj.id.op_eq(new_obj.id)) {
                  break;
                }
                previous = current;
              }
            }
          }
          if (current == null) {
            for (previous = null, current = this.First; current != null; current = current.Next) {
              if (current.Obj.Status !== 0 && !current.Obj.Unsorted) {
                if (current.Obj.GetPlane$v$c() <= new_obj.GetPlane$v$c()) {
                  break;
                }
                previous = current;
              }
            }
          }
        }
        current = previous != null ? previous.Next : this.First;
      }
    }
    0;
    0;
    this.InsertLink(new_link, previous);
    this.Mass = this.Mass + new_obj.Mass | 0;
    return true;
  }

  Remove(obj) {
    let link = null;
    for (link = this.First; link != null; link = link.Next) {
      if (link.Obj === obj) {
        break;
      }
    }
    if (link == null) {
      return false;
    }
    for (let it = this.FirstIter; it != null; it = it.Next) {
      if (it.link.Prev === link) {
        it.link.Prev = link.Prev;
      } else if (it.link.Next === link) {
        it.link.Next = link.Next;
      } else if (it.link.Obj === link.Obj) {
        it.link.Obj = null;
      }
    }
    this.RemoveLink(link);
    $delete(link);
    this.Mass = this.Mass - obj.Mass | 0;
    if (this.Mass < 0) {
      this.Mass = 0;
    }
    return true;
  }

  AssignInfo() {
    let link = null;
    for (link = this.Last; link != null; link = link.Prev) {
      if (link.Obj.Status !== 0) {
        link.Obj.AssignInfo();
      }
    }
    return true;
  }

  ValidateOwners() {
    let link = null;
    for (link = this.First; link != null; link = link.Next) {
      if (link.Obj.Status !== 0) {
        link.Obj.ValidateOwner();
      }
    }
    return true;
  }

  GetNameList(defs) {
    let id = new $.C4ID().init$v();
    let Buf = new $.StdStrBuf();
    for (let i = 0; id.$assign(this.GetListID(-1, i)).op_unsigned_long_C4ID_() != null; i = i + 1 | 0) {
      let current_def = defs.ID2Def(id.$clone());
      if (current_def != null) {
        let idcount = this.ObjectCount(id.$clone());
        if (i > 0) {
          Buf.Append$pi8(S(", "));
        }
        Buf.AppendFormat(S("%dx %s"), idcount, current_def.GetName());
      }
    }
    return Buf;
  }

  IsClear() {
    return this.ObjectCount() === 0;
  }

  DenumeratePointers() {
    if (this.pEnumerated == null) {
      return false;
    }
    for (let pNum = $begin(this.pEnumerated); !pNum.eq($end(this.pEnumerated)); pNum.inc()) {
      this.Add$pC4Object$i32$pC4ObjectList($.Objects.ObjectPointer(pNum.v), 0 /*stNone*/);
    }
    $delete(this.pEnumerated);
    this.pEnumerated = null;
    return true;
  }

  Write(szTarget) {
    const ostr = new Int8Array(25);
    szTarget.a[szTarget.o + 0] = 0;
    let link = null;
    for (link = this.First; link != null && link.Obj != null; link = link.Next) {
      if (link.Obj.Status !== 0) {
        $.ssprintf$9(ostr, S("%d;"), link.Obj.Number);
        $.SAppend(P(ostr, 0), szTarget);
      }
    }
    return true;
  }

  CompileFunc$pStdCompiler$pC4ValueNumbers(pComp, _numbers = null) {
    $delete(this.pEnumerated);
    this.pEnumerated = [];
    if (!pComp.isDeserializer()) {
      for (let link = this.First; link != null; link = link.Next) {
        if (link.Obj.Status !== 0) {
          this.pEnumerated.push(link.Obj.Number);
        }
      }
    }
    pComp.Value$StdSTLContainerAdapt$list$i32($.mkSTLContainerAdapt$rlist$i32$3(this.pEnumerated, 2 /*SEP_SEP2*/));
    if (!pComp.isDeserializer()) {
      $delete(this.pEnumerated);
      this.pEnumerated = null;
    }
  }

  CompileFunc$pStdCompiler$b$pC4ValueNumbers(pComp, skip_player_objects, numbers$) {
    const numbers = [numbers$];
    const object_count = [this.ObjectCount()];
    pComp.Value$StdNamingCountAdapt$i32($.mkNamingCountAdapt$ri32$pi8(P(object_count, 0), S("Object")));
    if (pComp.isSerializer()) {
      0;
      for (let link = this.Last; link != null; link = link.Prev) {
        if (link.Obj.Status !== 0 && (!skip_player_objects || !link.Obj.IsUserPlayerObject())) {
          pComp.Value$StdNamingAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers$2($.mkNamingAdapt$mStdParameterAdapt$C4Object$pC4ValueNumbers$pi8$2($.mkParAdapt$rC4Object$rpC4ValueNumbers(link.Obj, P(numbers, 0)), S("Object")));
        }
      }
    } else {
      this.Clear$v();
      for (let i = 0; i < object_count[0]; i = i + 1 | 0) {
        const obj = [null];
        try {
          pComp.Value$StdNamingAdapt$StdParameterAdapt$StdPtrAdapt$C4Object$pC4ValueNumbers($.mkNamingAdapt$mStdParameterAdapt$StdPtrAdapt$C4Object$pC4ValueNumbers$pi8($.mkParAdapt$mStdPtrAdapt$C4Object$rpC4ValueNumbers($.mkPtrAdaptNoNull$rpC4Object(P(obj, 0)), P(numbers, 0)), S("Object")));
          this.Add$pC4Object$i32$pC4ObjectList(obj[0], 3 /*stReverse*/);
        } catch ($e3) {
          if ($e3 instanceof $.StdCompiler$Exception) {
            const exception = $e3;
            if (!(exception.Pos.getLength() !== 0)) {
              $.LogF(S("ERROR: Object loading: %s"), exception.Msg.getData());
            } else {
              $.LogF(S("ERROR: Object loading(%s): %s"), exception.Pos.getData(), exception.Msg.getData());
            }
            $delete(exception);
          } else {
            throw $e3;
          }
        }
      }
    }
  }

  Denumerate(numbers) {
    let link = null;
    for (link = this.First; link != null; link = link.Next) {
      if (link.Obj.Status !== 0) {
        link.Obj.Denumerate(numbers);
      }
    }
  }

  IsContained(obj) {
    let link = null;
    for (link = this.First; link != null; link = link.Next) {
      if (link.Obj === obj) {
        return true;
      }
    }
    return false;
  }

  ClearPointers(obj) {
    let removed_amount = 0;
    while (this.Remove(obj)) {
      removed_amount = removed_amount + 1 | 0;
    }
    let current_obj = null;
    let link = null;
    for (link = this.First; link != null && (current_obj = link.Obj) != null; link = link.Next) {
      current_obj.ClearPointers$pC4Object(obj);
    }
    return removed_amount;
  }

  ObjectCount(id = $.C4ID.None.$clone()) {
    let link = null;
    let count = 0;
    for (link = this.First; link != null; link = link.Next) {
      if (link.Obj.Status !== 0 && (id.op_eq($.C4ID.None) || link.Obj.Def.id.op_eq(id))) {
        count = count + 1 | 0;
      }
    }
    return count;
  }

  MassCount() {
    let link = null;
    let mass = 0;
    for (link = this.First; link != null; link = link.Next) {
      if (link.Obj.Status !== 0) {
        mass = mass + link.Obj.Mass | 0;
      }
    }
    this.Mass = mass;
    return mass;
  }

  ListIDCount(dwCategory) {
    let link = null;
    for (let clid = 0; clid < 500; clid = clid + 1 | 0) {
      $.TempListID[clid].$assign($.C4ID.None);
    }
    for (link = this.First; link != null && link.Obj != null; link = link.Next) {
      if (link.Obj.Status !== 0) {
        let def = null;
        if (dwCategory === -1 || (def = $.C4Id2Def(link.Obj.Def.id.$clone())) != null && (def.Category & dwCategory) !== 0) {
          for (let clid$2 = 0; clid$2 < 500; clid$2 = clid$2 + 1 | 0) {
            if ($.TempListID[clid$2].op_eq(link.Obj.Def.id)) {
              break;
            }
            if ($.TempListID[clid$2].op_eq($.C4ID.None)) {
              $.TempListID[clid$2].$assign(link.Obj.Def.id);
              break;
            }
          }
        }
      }
    }
    for (let i = 0; i < 500; i = i + 1 | 0) {
      if ($.TempListID[i].op_eq($.C4ID.None)) {
        return i;
      }
    }
    return 500;
  }

  GetObject(index = 0) {
    let cIdx = 0;
    let link = null;
    for (link = this.First, cIdx = 0; link != null; link = link.Next) {
      if (link.Obj.Status !== 0) {
        if (cIdx === index) {
          return link.Obj;
        }
        cIdx = cIdx + 1 | 0;
      }
    }
    return null;
  }

  GetFirstObject() {
    return this.First != null ? this.First.Obj : null;
  }

  GetLastObject() {
    return this.Last != null ? this.Last.Obj : null;
  }

  Find(def, owner = -2, dwOCF = 0xffffffff) {
    let link = null;
    for (link = this.First; link != null; link = link.Next) {
      if (link.Obj.Status !== 0 && link.Obj.Def === def && (owner === -2 || link.Obj.Owner === owner) && (dwOCF & link.Obj.OCF) >>> 0 !== 0) {
        return link.Obj;
      }
    }
    return null;
  }

  FindOther(id, owner = -2) {
    let link = null;
    for (link = this.First; link != null; link = link.Next) {
      if (link.Obj.Status !== 0 && link.Obj.Def.id.op_ne(id) && (owner === -2 || link.Obj.Owner === owner)) {
        return link.Obj;
      }
    }
    return null;
  }

  GetLink$pC4Object$c(obj) {
    if (obj == null) {
      return null;
    }
    let link = null;
    for (link = this.First; link != null; link = link.Next) {
      if (link.Obj === obj) {
        return link;
      }
    }
    return null;
  }

  GetLink$pC4Object(obj) {
    return this.GetLink$pC4Object$c(obj);
  }

  GetListID(dwCategory, index) {
    let link = null;
    for (let i = 0; i < 500; i = i + 1 | 0) {
      $.TempListID[i].$assign($.C4ID.None);
    }
    for (link = this.First; link != null && link.Obj != null; link = link.Next) {
      if (link.Obj.Status !== 0) {
        let def = null;
        if (dwCategory === -1 || (def = $.C4Id2Def(link.Obj.Def.id.$clone())) != null && (def.Category & dwCategory) !== 0) {
          for (let i$2 = 0; i$2 < 500; i$2 = i$2 + 1 | 0) {
            if ($.TempListID[i$2].op_eq(link.Obj.Def.id)) {
              break;
            }
            if ($.TempListID[i$2].op_eq($.C4ID.None)) {
              $.TempListID[i$2].$assign(link.Obj.Def.id);
              break;
            }
          }
        }
      }
    }
    if ($.Inside$i32$i32$i32$3(index, 0, 499)) {
      return $.TempListID[index].$clone();
    }
    return $.C4ID.None.$clone();
  }

  ShiftContents(new_first_obj) {
    let new_first_link = this.GetLink$pC4Object(new_first_obj);
    if (new_first_link == null) {
      return false;
    }
    if (new_first_link === this.First) {
      return true;
    }
    this.Last.Next = this.First;
    this.First.Prev = this.Last;
    this.First = new_first_link;
    this.Last = new_first_link.Prev;
    this.First.Prev = this.Last.Next = null;
    return true;
  }

  DeleteObjects$v() {
    while (this.First != null) {
      let obj = this.First.Obj;
      if (obj.Status !== 0) {
        $.Game.ClearPointers(obj);
      }
      obj.Status = 0;
      this.Remove(obj);
      $delete(obj);
    }
    this.Mass = 0;
  }

  UpdateScriptPointers() {
    for (let link = this.First; link != null; link = link.Next) {
      link.Obj.UpdateScriptPointers();
    }
  }

  CheckSort(list) {
    let link = this.First;
    let compare_link = list.First;
    while (link != null && (link.Obj.Status === 0 || link.Obj.Unsorted)) {
      link = link.Next;
    }
    while (link != null) {
      if (compare_link == null) {
        $.Log(S("CheckSort failure"));
        let numbers = new $.C4ValueNumbers().init();
        $.LogSilent$pi8($.DecompileToBuf$StdNamingAdapt$C4ObjectListDumpHelper($.mkNamingAdapt$mC4ObjectListDumpHelper$pi8(new C4ObjectListDumpHelper().init(this, numbers), S("SectorList"))).getData());
        $.LogSilent$pi8($.DecompileToBuf$StdNamingAdapt$C4ObjectListDumpHelper($.mkNamingAdapt$mC4ObjectListDumpHelper$pi8(new C4ObjectListDumpHelper().init(list, numbers), S("MainList"))).getData());
        return false;
      } else {
        if (link.Obj === compare_link.Obj) {
          link = link.Next;
          while (link != null && (link.Obj.Status === 0 || link.Obj.Unsorted)) {
            link = link.Next;
          }
        }
        compare_link = compare_link.Next;
      }
    }
    return true;
  }

  CheckCategorySort() {
    let link = null;
    let previous = null;
    for (link = this.First; link != null; link = link.Next) {
      if (!link.Obj.Unsorted && link.Obj.Status !== 0) {
        if (previous != null) {
          0;
        }
        previous = link;
      }
    }
  }

  InsertLinkBefore(link, before_link) {
    if (before_link != null) {
      link.Prev = before_link.Prev;
      if (before_link.Prev != null) {
        before_link.Prev.Next = link;
      } else {
        this.First = link;
      }
      link.Next = before_link;
      before_link.Prev = link;
    } else {
      link.Next = null;
      link.Prev = this.Last;
      if (this.Last != null) {
        this.Last.Next = link;
      } else {
        this.First = link;
      }
      this.Last = link;
    }
    if (before_link != null) {
      for (let it = this.FirstIter; it != null; it = it.Next) {
        if (it.link.Obj === before_link.Obj) {
          it.link.Prev = link;
        }
      }
    }
  }

  InsertLink(link, after_link) {
    if (after_link != null) {
      link.Prev = after_link;
      link.Next = after_link.Next;
      if (after_link.Next != null) {
        after_link.Next.Prev = link;
      } else {
        this.Last = link;
      }
      after_link.Next = link;
    } else {
      link.Prev = null;
      link.Next = this.First;
      if (this.First != null) {
        this.First.Prev = link;
      } else {
        this.Last = link;
      }
      this.First = link;
    }
    if (after_link != null) {
      for (let it = this.FirstIter; it != null; it = it.Next) {
        if (it.link.Obj === after_link.Obj) {
          it.link.Next = link;
        }
      }
    }
  }

  RemoveLink(link) {
    if (link.Prev != null) {
      link.Prev.Next = link.Next;
    } else {
      this.First = link.Next;
    }
    if (link.Next != null) {
      link.Next.Prev = link.Prev;
    } else {
      this.Last = link.Prev;
    }
  }

  AddIter(iter) {
    let r = this.FirstIter;
    this.FirstIter = iter;
    return r;
  }

  RemoveIter(iter) {
    if (iter === this.FirstIter) {
      this.FirstIter = iter.Next;
    } else {
      let i = this.FirstIter;
      while (i.Next != null && i.Next !== iter) {
        i = i.Next;
      }
      i.Next = iter.Next;
    }
  }

  $copy(List) {
    this.FirstIter = null;
    C4ObjectList.prototype.Default.call(this);
    C4ObjectList.prototype.Copy.call(this, List);
    return this;
  }
  $clone() { return new C4ObjectList().$copy(this); }
  $assign(o) {
    this.First = o.First;
    this.Last = o.Last;
    this.Mass = o.Mass;
    this.pEnumerated = o.pEnumerated;
    this.FirstIter = o.FirstIter;
    return this;
  }
}

export class C4ObjectList$iterator {
  List = null;
  link = new C4ObjectLink();
  Next = null;
  reverse = false;

  $dtor() {
    this.List.RemoveIter(this);
  }

  op_inc$v() {
    let advance = this.reverse ? this.link.Prev : this.link.Next;
    this.link.$assign(advance != null ? advance : $.NULL_LINK$C4ObjectList);
    return this;
  }

  op_inc$i32(_0) {
    let old = new C4ObjectList$iterator().$copy(this);
    this.op_inc$v();
    return old;
  }

  op_mul() {
    return this.link.Obj;
  }

  op_eq(iter) {
    return iter.List === this.List && iter.link.Obj === this.link.Obj && (iter.reverse ? 1 : 0) === (this.reverse ? 1 : 0);
  }

  op_ne(iter) {
    return !this.op_eq(iter);
  }

  find(target) {
    while (this.link.Obj != null) {
      if (this.link.Obj === target) {
        return true;
      } else {
        this.op_inc$i32(0);
      }
    }
    return false;
  }

  atEnd() {
    return this.link.Obj == null;
  }

  init(list, link, reverse) {
    this.link = (link != null ? link : $.NULL_LINK$C4ObjectList).$clone();
    this.reverse = reverse;
    this.List = list;
    this.Next = list.AddIter(this);
    return this;
  }

  $copy(iter) {
    this.link = iter.link.$clone();
    this.Next = null;
    this.reverse = iter.reverse;
    this.List = iter.List;
    this.Next = this.List.AddIter(this);
    return this;
  }
  $clone() { return new C4ObjectList$iterator().$copy(this); }
  $assign(iter) {
    0;
    this.link.$assign(iter.link);
    this.reverse = iter.reverse;
    return this;
  }
}

export class C4ObjectList$ReverseView {
  list = null;

  init(list) {
    this.list = list;
    return this;
  }

  begin() {
    return new C4ObjectList$iterator().init(this.list, this.list.Last, true);
  }

  end() {
    return new C4ObjectList$iterator().init(this.list, null, true);
  }

  $clone() { return new C4ObjectList$ReverseView().$assign(this); }
  $assign(o) {
    this.list = o.list;
    return this;
  }
}

export class C4ObjectListIterator {
  rList = null;
  pCurr = new C4ObjectList$iterator();
  pCurrID = new C4ObjectList$iterator();

  init(rList) {
    this.pCurr = rList.end();
    this.pCurrID = rList.begin();
    this.rList = rList;
    return this;
  }

  GetNext(piCount) {
    if (this.pCurrID.op_eq(this.rList.end())) {
      return null;
    }
    if (this.pCurr.op_eq(this.rList.end())) {
      this.pCurr.$assign(this.pCurrID);
    } else if (this.pCurr.op_inc$v().op_eq(this.rList.end())) {
      return null;
    }
    if (this.pCurr.op_mul().id.op_ne(this.pCurrID.op_mul().id)) {
      this.pCurrID.$assign(this.pCurr);
    } else {
      for (let pCheck = new C4ObjectList$iterator().$copy(this.pCurrID); pCheck.op_ne(this.pCurr); pCheck.op_inc$v()) {
        if (pCheck.op_mul().CanConcatPictureWith(this.pCurr.op_mul())) {
          if (this.pCurr.op_inc$v().op_eq(this.rList.end())) {
            return null;
          }
          if (this.pCurr.op_mul().id.op_ne(this.pCurrID.op_mul().id)) {
            this.pCurrID.$assign(this.pCurr);
            break;
          }
          pCheck.$assign(this.pCurrID);
        }
      }
    }
    if (piCount != null) {
      piCount.a[piCount.o] = 1;
      let pCheck = new C4ObjectList$iterator().$copy(this.pCurr);
      for (pCheck.op_inc$v(); pCheck.op_ne(this.rList.end()) && pCheck.op_mul().id.op_eq(this.pCurr.op_mul().id); pCheck.op_inc$v()) {
        if (pCheck.op_mul().CanConcatPictureWith(this.pCurr.op_mul())) {
          piCount.a[piCount.o] = piCount.a[piCount.o] + 1 | 0;
        }
      }
    }
    return this.pCurr.op_mul();
  }

  $clone() { return new C4ObjectListIterator().$assign(this); }
  $assign(o) {
    this.rList = o.rList;
    this.pCurr.$assign(o.pCurr);
    this.pCurrID.$assign(o.pCurrID);
    return this;
  }
}

export class C4ObjectListDumpHelper {
  list = null;
  numbers = null;

  CompileFunc(pComp) {
    pComp.Value$StdNamingAdapt$StdParameterAdapt$C4ObjectList$pC4ValueNumbers($.mkNamingAdapt$mStdParameterAdapt$C4ObjectList$pC4ValueNumbers$pi8($.mkParAdapt$rC4ObjectList$rpC4ValueNumbers(this.list, P(this, "numbers")), S("Objects")));
  }

  init(pLst, numbers) {
    this.list = pLst;
    this.numbers = numbers;
    return this;
  }

  $clone() { return new C4ObjectListDumpHelper().$assign(this); }
  $assign(o) {
    this.list = o.list;
    this.numbers = o.numbers;
    return this;
  }
}

export class C4NotifyingObjectList extends C4ObjectList {

  init$v() {
    super.init();
    return this;
  }

  init$C4ObjectList(list) {
    super.$assign(list);
    return this;
  }

  $dtor() {
    super.$dtor();
  }

  InsertLinkBefore(link, before_link) {
    C4ObjectList.prototype.InsertLinkBefore.call(this, link, before_link);
    $.ObjectListChangeListener.OnObjectAdded(this, link);
  }

  InsertLink(link, after_link) {
    C4ObjectList.prototype.InsertLink.call(this, link, after_link);
    $.ObjectListChangeListener.OnObjectAdded(this, link);
  }

  RemoveLink(link) {
    C4ObjectList.prototype.RemoveLink.call(this, link);
    $.ObjectListChangeListener.OnObjectRemove(this, link);
  }

  $clone() { return new C4NotifyingObjectList().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}




export function $init(): void {
  $.NULL_LINK$C4ObjectList = ((($o) => ($o.Obj = null, $o.Prev = null, $o.Next = null, $o))(new C4ObjectLink()));
  $.MaxTempListID$C4ObjectList = 500;
  $.TempListID = $oarr(500, () => new $.C4ID().init$v());
}

Object.assign($, { C4NotifyingObjectList, C4ObjectLink, C4ObjectList, C4ObjectList$ReverseView, C4ObjectList$iterator, C4ObjectListChangeListener, C4ObjectListDumpHelper, C4ObjectListIterator });
