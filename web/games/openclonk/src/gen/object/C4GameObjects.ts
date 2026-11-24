// @ts-nocheck
// OpenClonk 36de799: src/object/C4GameObjects.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { C4NotifyingObjectList } from './C4ObjectList.ts';
import { P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $max } from '../../rt/std.ts';

export class C4GameObjects extends C4NotifyingObjectList {
  LastUsedMarker = 0;
  Sectors = new $.C4LSectors().None();
  InactiveObjects = new $.C4ObjectList().init();
  ForeObjects = new $.C4ObjectList().init();

  init() {
    this.Sectors = new $.C4LSectors().None();
    this.InactiveObjects = new $.C4ObjectList().init();
    this.ForeObjects = new $.C4ObjectList().init();
    C4GameObjects.prototype.Default.call(this);
    return this;
  }

  $dtor() {
    this.Sectors.Clear();
    super.$dtor();
  }

  Default() {
    this.Sectors.Clear();
    this.LastUsedMarker = 0;
    this.ForeObjects.Default();
  }

  Init(width, height) {
    this.Sectors.Init(width, height);
  }

  Clear$b(clear_inactive_objects) {
    this.DeleteObjects$b(clear_inactive_objects);
    if (clear_inactive_objects) {
      this.InactiveObjects.Clear$v();
    }
    this.LastUsedMarker = 0;
  }

  Clear$v() {
    this.Clear$b(false);
  }

  Add$pC4Object(object) {
    if (object.Status === 2) {
      return this.InactiveObjects.Add$pC4Object$i32$pC4ObjectList(object, 1 /*stMain*/);
    }
    if ((object.Category & 32768) !== 0) {
      this.ForeObjects.Add$pC4Object$i32$pC4ObjectList(object, 1 /*stMain*/);
    }
    if (!$.C4ObjectList.prototype.Add$pC4Object$i32$pC4ObjectList.call(this, object, 1 /*stMain*/)) {
      return false;
    }
    this.Sectors.Add(object, this);
    return true;
  }

  Remove(object) {
    if (object.Status === 2) {
      return this.InactiveObjects.Remove(object);
    }
    this.Sectors.Remove(object);
    this.ForeObjects.Remove(object);
    return $.C4ObjectList.prototype.Remove.call(this, object);
  }

  CrossCheck() {
    let $t1, $t2, $t3, $t4, $t5, $t6;
    let goal_required_ocf = 0x2004000;
    let ball_required_ocf = 4096;
    if ($.Game.iTick3 === 0) {
      ball_required_ocf = (ball_required_ocf | 8) >>> 0;
    }
    $t1 = this;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    try {
      for (; $t2.op_ne($t3); $t2.op_inc$v()) {
        const goal = $t2.op_mul();
        if (goal.Status !== 0 && goal.Contained.op_not() && (goal.OCF & goal_required_ocf) >>> 0 !== 0) {
          let Marker = this.GetNextMarker();
          const sector = [null];
          $L_check_next_goal: {
            for (let in_goal_area = goal.Area.FirstObjects(P(sector, 0)); in_goal_area != null; in_goal_area = goal.Area.NextObjects(in_goal_area, P(sector, 0))) {
              $t4 = in_goal_area;
              $t5 = $t4.begin();
              $t6 = $t4.end();
              try {
                for (; $t5.op_ne($t6); $t5.op_inc$v()) {
                  const ball = [$t5.op_mul()];
                  if (ball[0] !== goal && ball[0].Status !== 0 && ball[0].Contained.op_not() && (ball[0].OCF & ball_required_ocf) >>> 0 !== 0 && goal.Layer.op_eq$C4ObjectPtr(ball[0].Layer) && $.Inside$i32$i32$i32$3(ball[0].GetX() - (goal.GetX() + goal.Shape.x | 0) | 0, 0, goal.Shape.Wdt - 1 | 0) && $.Inside$i32$i32$i32$3(ball[0].GetY() - (goal.GetY() + goal.Shape.y | 0) | 0, 0, goal.Shape.Hgt - 1 | 0)) {
                    if (ball[0].Marker === Marker) {
                      continue;
                    }
                    ball[0].Marker = Marker;
                    if ((goal.OCF & 0x2000000) >>> 0 !== 0 && (ball[0].OCF & 4096) >>> 0 !== 0 && (ball[0].Category & 16) !== 0) {
                      let relative_xdir = ball[0].xdir.op_sub$C4Fixed(goal.xdir);
                      let relative_ydir = ball[0].ydir.op_sub$C4Fixed(goal.ydir);
                      let hit_speed = relative_xdir.op_mul$C4Fixed(relative_xdir).op_add$C4Fixed(relative_ydir.op_mul$C4Fixed(relative_ydir));
                      if (hit_speed.op_gt$C4Fixed($.HitSpeed2) && goal.Call$pi8$pC4AulParSet$b(S("~QueryCatchBlow"), new $.C4AulParSet().init$rpC4Object(P(ball, 0)).op_and()).op_not()) {
                        let hit_energy = $.fixtoi$C4Fixed(hit_speed.op_mul$i32(ball[0].Mass).op_div$i32(5));
                        if (hit_energy !== 0) {
                          hit_energy = $max(hit_energy / 3 | 0, 1);
                        }
                        const damage = [(-hit_energy | 0) / 5 | 0];
                        goal.DoEnergy(damage[0], false, 34, ball[0].Controller);
                        let min_mass = 50;
                        let goal_mass = $max(goal.Mass, min_mass);
                        let pActionDef = goal.GetAction();
                        if ($.Game.iTick3 === 0 || pActionDef != null && pActionDef.GetPropertyP(23 /*P_Procedure*/) !== 236) {
                          goal.Fling(ball[0].xdir.op_mul$i32(min_mass).op_div$i32(goal_mass), $.Abs$C4Fixed(ball[0].ydir.op_div$i32(2)).op_neg().op_mul$i32(min_mass).op_div$i32(goal_mass), false);
                        }
                        goal.Call$pi8$pC4AulParSet$b(S("~CatchBlow"), new $.C4AulParSet().init$ri32$rpC4Object(P(damage, 0), P(ball, 0)).op_and());
                        if (goal.Status === 0 || goal.Contained.op_C4Object_() != null || !((goal.OCF & goal_required_ocf) >>> 0 !== 0)) {
                          break $L_check_next_goal;
                        }
                        continue;
                      }
                    }
                    if ((goal.OCF & 16384) >>> 0 !== 0 && (ball[0].OCF & 8) >>> 0 !== 0 && $.Inside$i32$i32$i32$3(ball[0].GetX() - (goal.GetX() + goal.Def.Collection.x | 0) | 0, 0, goal.Def.Collection.Wdt - 1 | 0) && $.Inside$i32$i32$i32$3(ball[0].GetY() - (goal.GetY() + goal.Def.Collection.y | 0) | 0, 0, goal.Def.Collection.Hgt - 1 | 0)) {
                      goal.Collect(ball[0]);
                      if (goal.Status === 0 || goal.Contained.op_C4Object_() != null || !((goal.OCF & goal_required_ocf) >>> 0 !== 0)) {
                        break $L_check_next_goal;
                      }
                    }
                  }
                }
              } finally { $t5.$dtor(); $t6.$dtor(); }
            }
          }
          ;
        }
      }
    } finally { $t2.$dtor(); $t3.$dtor(); }
  }

  Synchronize() {
    this.ResortUnsorted();
    this.UpdateSolidMasks();
  }

  UpdateSolidMasks() {
    let $t1, $t2, $t3;
    $t1 = this;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    try {
      for (; $t2.op_ne($t3); $t2.op_inc$v()) {
        const object = $t2.op_mul();
        if (object.Status !== 0) {
          object.UpdateSolidMask(false);
        }
      }
    } finally { $t2.$dtor(); $t3.$dtor(); }
  }

  ObjectPointer(object_number) {
    let object = $.C4PropListNumbered.GetByNumber(object_number);
    if (object != null) {
      return object.GetObject$v();
    }
    return null;
  }

  SafeObjectPointer(object_number) {
    let object = this.ObjectPointer(object_number);
    if (object != null && object.Status === 0) {
      return null;
    }
    return object;
  }

  PostLoad(keep_inactive_objects, numbers) {
    let $t1, $t2, $t3, $t4, $t5, $t6, $t7, $t8, $t9, $t10, $t11, $t12;
    let max_object_number = 0;
    $t1 = this.reverse();
    $t2 = $t1.begin();
    $t3 = $t1.end();
    try {
      for (; $t2.op_ne($t3); $t2.op_inc$v()) {
        const object = $t2.op_mul();
        max_object_number = $max(max_object_number, object.Number);
        if ((object.Category & 32768) !== 0) {
          this.ForeObjects.Add$pC4Object$i32$pC4ObjectList(object, 1 /*stMain*/, this);
        }
      }
    } finally { $t2.$dtor(); $t3.$dtor(); }
    let inactiveObjectsCopy = new $.C4ObjectList().init();
    if (keep_inactive_objects) {
      inactiveObjectsCopy.Copy(this.InactiveObjects);
      this.InactiveObjects.Clear$v();
    }
    this.Denumerate(numbers);
    $.C4PropListNumbered.SetEnumerationIndex(max_object_number);
    if (keep_inactive_objects) {
      this.InactiveObjects.Copy(inactiveObjectsCopy);
      inactiveObjectsCopy.Clear$v();
      $.C4PropListNumbered.UnshelveNumberedPropLists();
    }
    $t4 = this;
    $t5 = $t4.begin();
    $t6 = $t4.end();
    try {
      for (; $t5.op_ne($t6); $t5.op_inc$v()) {
        const object = $t5.op_mul();
        if (object.Status !== 0) {
          if ((object.Category & 1) !== 0) {
            object.xdir.$assign(object.ydir.op_assign(0));
          }
          if (object.Contained.op_C4Object_() != null) {
            if (!(object.Contained.op_arrow().Contents.GetLink$pC4Object(object) != null)) {
              $.DebugLogF(S("Error in Objects.txt: Container of #%d is #%d, but not found in contents list!"), object.Number, object.Contained.op_arrow().Number);
              object.Contained.op_arrow().Contents.Add$pC4Object$i32$pC4ObjectList(object, 2 /*stContents*/);
            }
          }
          let contents_iterator = object.Contents.begin();
          while (!contents_iterator.atEnd()) {
            let contained_object = contents_iterator.op_mul();
            let contents_iterator2 = object.Contents.begin();
            if (contents_iterator2.find(contained_object) && contents_iterator2.op_ne(contents_iterator)) {
              $.DebugLogF(S("Error in Objects.txt: Double containment of #%d by #%d!"), contained_object.Number, object.Number);
              object.Contents.Remove(contained_object);
              continue;
            }
            if (contained_object.Status !== 0 && contained_object.Contained.op_ne$pC4Object(object)) {
              $.DebugLogF(S("Error in Objects.txt: Object #%d not in container #%d as referenced!"), contained_object.Number, object.Number);
              contained_object.Contained.op_assign(object);
            }
            contents_iterator.op_inc$i32(0);
          }
        }
      }
    } finally { $t5.$dtor(); $t6.$dtor(); }
    $t7 = this;
    $t8 = $t7.begin();
    $t9 = $t7.end();
    try {
      for (; $t8.op_ne($t9); $t8.op_inc$v()) {
        const object = $t8.op_mul();
        if (object.Status === 2) {
          this.Remove(object);
          this.InactiveObjects.Add$pC4Object$i32$pC4ObjectList(object, 0 /*stNone*/);
        }
      }
    } finally { $t8.$dtor(); $t9.$dtor(); }
    {
      let DBGRECOFF = new $.C4DebugRecOff().init$v();
      try {
        this.UpdateGraphics(false);
        this.UpdateFaces(false);
        this.SetOCF();
      } finally { DBGRECOFF && DBGRECOFF.$dtor(); }
    }
    this.FixObjectOrder();
    $t10 = this;
    $t11 = $t10.begin();
    $t12 = $t10.end();
    try {
      for (; $t11.op_ne($t12); $t11.op_inc$v()) {
        const object = $t11.op_mul();
        if (object.Status !== 0) {
          object.UpdateLight();
          object.UpdateFlipDir();
          object.SetOCF();
        }
      }
    } finally { $t11.$dtor(); $t12.$dtor(); }
    return this.ObjectCount();
  }

  Denumerate(numbers) {
    $.C4ObjectList.prototype.Denumerate.call(this, numbers);
    $.C4ObjectList.prototype.Denumerate.call(this.InactiveObjects, numbers);
  }

  UpdateScriptPointers() {
    $.C4ObjectList.prototype.UpdateScriptPointers.call(this);
    $.C4ObjectList.prototype.UpdateScriptPointers.call(this.InactiveObjects);
  }

  GRBroadcast(function_name, parameters, pass_error, reject_test) {
    let $t1, $t2, $t3;
    $t1 = this;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    try {
      for (; $t2.op_ne($t3); $t2.op_inc$v()) {
        const object = $t2.op_mul();
        if (object != null && (object.Category & 224) !== 0 && object.Status !== 0) {
          let vResult = object.Call$pi8$pC4AulParSet$b(function_name, parameters, pass_error);
          if (reject_test && !vResult.op_not()) {
            return vResult;
          }
        }
      }
    } finally { $t2.$dtor(); $t3.$dtor(); }
    return new $.C4Value().init$v();
  }

  UpdatePos(object) {
    this.Sectors.Update(object, this);
  }

  UpdatePosResort(object) {
    this.Sectors.Remove(object);
    this.Sectors.Add(object, this);
  }

  FixObjectOrder() {
    let pLnk0 = this.First;
    let pLnkL = this.Last;
    while (pLnk0 !== pLnkL) {
      let pLnk1stUnsorted = null;
      let pLnkLastUnsorted = null;
      let pLnkPrev = null;
      let pLnk = null;
      let pLastWarnObj = null;
      let lastPlane = 0x7fffffff;
      for (pLnk = pLnk0; pLnk !== pLnkL.Next; pLnk = pLnk.Next) {
        let pObj = pLnk.Obj;
        if (pObj.Unsorted || pObj.Status === 0) {
          continue;
        }
        let currentPlane = pObj.GetPlane$v$c();
        if (currentPlane === 0) {
          $.DebugLogF(S("Objects.txt: Object #%d has zero Plane!"), pObj.Number);
          pObj.SetPlane(lastPlane);
          currentPlane = lastPlane;
        }
        if (currentPlane > lastPlane) {
          if (pLnkPrev.Obj !== pLastWarnObj) {
            $.DebugLogF(S("Objects.txt: Wrong object order of #%d-#%d! (down)"), pObj.Number, pLnkPrev.Obj.Number);
            pLastWarnObj = pLnkPrev.Obj;
          }
          pLnk.Obj = pLnkPrev.Obj;
          pLnkPrev.Obj = pObj;
          pLnkLastUnsorted = pLnkPrev;
        } else {
          lastPlane = currentPlane;
        }
        pLnkPrev = pLnk;
      }
      if (pLnkLastUnsorted == null) {
        break;
      }
      pLnkL = pLnkLastUnsorted;
      lastPlane = -0x80000000;
      for (pLnk = pLnkL; pLnk !== pLnk0.Prev; pLnk = pLnk.Prev) {
        let pObj = pLnk.Obj;
        if (pObj.Unsorted || pObj.Status === 0) {
          continue;
        }
        let currentPlane = pObj.GetPlane$v$c();
        if (currentPlane < lastPlane) {
          if (pLnkPrev.Obj !== pLastWarnObj) {
            $.DebugLogF(S("Objects.txt: Wrong object order of #%d-#%d! (up)"), pObj.Number, pLnkPrev.Obj.Number);
            pLastWarnObj = pLnkPrev.Obj;
          }
          pLnk.Obj = pLnkPrev.Obj;
          pLnkPrev.Obj = pObj;
          pLnk1stUnsorted = pLnkPrev;
        } else {
          lastPlane = currentPlane;
        }
        pLnkPrev = pLnk;
      }
      if (pLnk1stUnsorted == null) {
        break;
      }
      pLnk0 = pLnk1stUnsorted;
    }
  }

  ResortUnsorted() {
    let $t1, $t2, $t3;
    $t1 = this;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    try {
      for (; $t2.op_ne($t3); $t2.op_inc$v()) {
        const object = $t2.op_mul();
        if (object.Unsorted) {
          this.Remove(object);
          object.Unsorted = false;
          if (!this.Add$pC4Object(object)) {
            $.Game.ClearPointers(object);
            $delete(object);
          }
        }
      }
    } finally { $t2.$dtor(); $t3.$dtor(); }
  }

  DeleteObjects$b(delete_inactive_objects) {
    $.C4ObjectList.prototype.DeleteObjects$v.call(this);
    this.Sectors.ClearObjects();
    this.ForeObjects.Clear$v();
    if (delete_inactive_objects) {
      this.InactiveObjects.DeleteObjects$v();
    }
  }

  ValidateOwners() {
    let object_list_valid = $.C4ObjectList.prototype.ValidateOwners.call(this);
    let inactive_objects_valid = this.InactiveObjects.ValidateOwners();
    return object_list_valid && inactive_objects_valid;
  }

  AssignInfo() {
    let object_list_assigned = $.C4ObjectList.prototype.AssignInfo.call(this);
    let inactive_objects_assigned = this.InactiveObjects.AssignInfo();
    return object_list_assigned && inactive_objects_assigned;
  }

  AssignLightRange() {
    let $t1, $t2, $t3;
    $t1 = this.reverse();
    $t2 = $t1.begin();
    $t3 = $t1.end();
    try {
      for (; $t2.op_ne($t3); $t2.op_inc$v()) {
        const object = $t2.op_mul();
        if (object.Status !== 0) {
          object.AssignLightRange();
        }
      }
    } finally { $t2.$dtor(); $t3.$dtor(); }
  }

  SyncClearance() {
    let $t1, $t2, $t3;
    $t1 = this;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    try {
      for (; $t2.op_ne($t3); $t2.op_inc$v()) {
        const object = $t2.op_mul();
        if (object != null) {
          object.SyncClearance();
        }
      }
    } finally { $t2.$dtor(); $t3.$dtor(); }
  }

  ResetAudibility() {
    let $t1, $t2, $t3;
    $t1 = this;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    try {
      for (; $t2.op_ne($t3); $t2.op_inc$v()) {
        const object = $t2.op_mul();
        if (object != null) {
          object.Audible = object.AudiblePan = 0;
          object.AudiblePlayer = -1;
        }
      }
    } finally { $t2.$dtor(); $t3.$dtor(); }
  }

  OnSynchronized() {
    let $t1, $t2, $t3;
    $t1 = this;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    try {
      for (; $t2.op_ne($t3); $t2.op_inc$v()) {
        const object = $t2.op_mul();
        if (object != null) {
          object.Call$pi8$pC4AulParSet$b(S("~OnSynchronized"));
        }
      }
    } finally { $t2.$dtor(); $t3.$dtor(); }
  }

  SetOCF() {
    let $t1, $t2, $t3;
    $t1 = this;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    try {
      for (; $t2.op_ne($t3); $t2.op_inc$v()) {
        const object = $t2.op_mul();
        if (object.Status !== 0) {
          object.SetOCF();
        }
      }
    } finally { $t2.$dtor(); $t3.$dtor(); }
  }

  GetNextMarker() {
    let $t1, $t2, $t3;
    let marker = (this.LastUsedMarker = this.LastUsedMarker + 1 >>> 0);
    if (marker === 0) {
      $t1 = this;
      $t2 = $t1.begin();
      $t3 = $t1.end();
      try {
        for (; $t2.op_ne($t3); $t2.op_inc$v()) {
          const object = $t2.op_mul();
          if (object != null) {
            object.Marker = 0;
          }
        }
      } finally { $t2.$dtor(); $t3.$dtor(); }
      marker = (this.LastUsedMarker = this.LastUsedMarker + 1 >>> 0);
    }
    return marker;
  }

  $clone() { return new C4GameObjects().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.LastUsedMarker = o.LastUsedMarker;
    this.Sectors.$assign(o.Sectors);
    this.InactiveObjects.$assign(o.InactiveObjects);
    this.ForeObjects.$assign(o.ForeObjects);
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4GameObjects });
