// @ts-nocheck
// OpenClonk 36de799: src/object/C4Object.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n, ftoi32 } from '../../rt/int.ts';
import { c$memset, c$sqrt, c$strncpy } from '../../rt/libc.ts';
import { Random } from '../../rt/native.ts';
import { $bytesView, $oarr, $oat, $oi, $oidx, $peq, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $max, $maxBy, $min, $minBy, $throw } from '../../rt/std.ts';
import { C4PropListNumbered } from '../script/C4PropList.ts';

export class C4Action {
  Dir = 0;
  DrawDir = 0;
  ComDir = 0;
  Time = 0;
  Data = 0;
  Phase = 0;
  PhaseDelay = 0;
  t_attach = 0;
  Target = new $.C4ObjectPtr().init$v();
  Target2 = new $.C4ObjectPtr().init$v();
  Facet = new $.C4Facet().init$v();
  FacetX = 0;
  FacetY = 0;
  Animation = null;

  init() {
    this.Target = new $.C4ObjectPtr().init$v();
    this.Target2 = new $.C4ObjectPtr().init$v();
    this.Facet = new $.C4Facet().init$v();
    C4Action.prototype.Default.call(this);
    return this;
  }

  Default() {
    this.Dir = 0;
    this.DrawDir = this.Dir;
    this.ComDir = 0;
    this.Time = 0;
    this.Data = 0;
    this.Target.op_assign(null);
    this.Target2.op_assign(null);
    this.Phase = 0;
    this.PhaseDelay = 0;
    $.C4Facet.prototype.Default.call(this.Facet);
    this.FacetX = 0;
    this.FacetY = 0;
    this.t_attach = 0;
    this.Animation = null;
  }

  CompileFunc(comp) {
    comp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Dir"), S("Dir"), 0));
    comp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "ComDir"), S("ComDir"), 0));
    comp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Time"), S("ActionTime"), 0));
    comp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Data"), S("ActionData"), 0));
    comp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Phase"), S("Phase"), 0));
    comp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "PhaseDelay"), S("PhaseDelay"), 0));
  }

  $clone() { return new C4Action().$assign(this); }
  $assign(o) {
    this.Dir = o.Dir;
    this.DrawDir = o.DrawDir;
    this.ComDir = o.ComDir;
    this.Time = o.Time;
    this.Data = o.Data;
    this.Phase = o.Phase;
    this.PhaseDelay = o.PhaseDelay;
    this.t_attach = o.t_attach;
    this.Target.$assign(o.Target);
    this.Target2.$assign(o.Target2);
    this.Facet.$assign(o.Facet);
    this.FacetX = o.FacetX;
    this.FacetY = o.FacetY;
    this.Animation = o.Animation;
    return this;
  }
}

export class C4Object extends C4PropListNumbered {
  id = new $.C4ID().init$v();
  RemovalDelay = 0;
  Owner = 0;
  Controller = 0;
  LastEnergyLossCausePlayer = 0;
  Category = 0;
  old_x = 0;
  old_y = 0;
  Area = new $.C4LArea().init$v();
  Mass = 0;
  OwnMass = 0;
  Damage = 0;
  Energy = 0;
  Breath = 0;
  InMat = 0;
  Color = 0;
  Audible = 0;
  AudiblePan = 0;
  AudiblePlayer = 0;
  lightRange = 0;
  lightFadeoutRange = 0;
  lightColor = 0;
  fix_x = new $.C4Fixed();
  fix_y = new $.C4Fixed();
  fix_r = new $.C4Fixed();
  xdir = new $.C4Fixed();
  ydir = new $.C4Fixed();
  rdir = new $.C4Fixed();
  iLastAttachMovementFrame = 0;
  Mobile = false;
  Unsorted = false;
  Initializing = false;
  InLiquid = false;
  EntranceStatus = false;
  t_contact = 0;
  OCF = 0;
  Marker = 0;
  Layer = new $.C4ObjectPtr().init$v();
  pDrawTransform = null;
  Menu = null;
  TopFace = new $.C4Facet().init$v();
  Def = null;
  Contained = new $.C4ObjectPtr().init$v();
  Info = null;
  Action = new C4Action().init();
  Shape = new $.C4Shape();
  fOwnVertices = false;
  SolidMask = new $.C4TargetRect();
  HalfVehicleSolidMask = false;
  PictureRect = new $.C4Rect();
  Contents = new $.C4NotifyingObjectList().init$v();
  MaterialContents = null;
  pGraphics = null;
  pMeshInstance = null;
  pEffects = null;
  FrontParticles = null;
  BackParticles = null;
  ColorMod = 0;
  BlitMode = 0;
  CrewDisabled = false;
  Command = null;
  nInfo = new $.StdCopyStrBuf();
  pGfxOverlay = null;
  OnFire = false;
  Con = 0;
  Plane = 0;
  Alive = false;
  pSolidMaskData = null;

  UpdateInMat() {
    const newmat = [0];
    if (this.Contained.op_C4Object_() != null) {
      newmat[0] = this.Contained.op_arrow().Def.ClosedContainer !== 0 ? $.MNone$C4Constants : this.Contained.op_arrow().InMat;
    } else {
      newmat[0] = $.GBackMat(this.GetX(), this.GetY());
    }
    if (newmat[0] !== this.InMat) {
      this.Call$pi8$pC4AulParSet$b(S("~OnMaterialChanged"), new $.C4AulParSet().init$ri32$ri32(P(newmat, 0), P(this, "InMat")).op_and());
      this.InMat = newmat[0];
    }
  }

  Splash() {
    let tx = this.GetX();
    let ty = this.GetY() + 1 | 0;
    let amt = $min(Math.imul(this.Shape.Wdt, this.Shape.Hgt) / 10 | 0, 20);
    if ($.GBackSemiSolid(tx, ty - 15 | 0)) {
      return;
    }
    let iMat = $.GBackMat(tx, ty);
    if ($.MatValid(iMat) && $.DensityLiquid($oidx($.MaterialMap.Map, iMat).Density) && $oidx($.MaterialMap.Map, iMat).Instable !== 0) {
      let sy = ty;
      while ($.GBackLiquid(tx, sy) && sy > (ty - 20 | 0) && sy >= 0) {
        sy = sy - 1 | 0;
      }
      for (let cnt = 0; cnt < amt; cnt = cnt + 1 | 0) {
        let bubble_x = ((tx >>> 0) + Random(16) >>> 0) - 8 >>> 0 | 0;
        let bubble_y = ((ty >>> 0) + Random(16) >>> 0) - 6 >>> 0 | 0;
        $.BubbleOut(bubble_x, bubble_y);
        if ($.GBackLiquid(tx, ty) && !$.GBackSemiSolid(tx, sy)) {
          let xdir = $.C4REAL100(Random(151) - 75 >>> 0 | 0);
          let ydir = $.C4REAL100(-(Random(200) | 0) | 0);
          $.PXS.Create($.Landscape.ExtractMaterial(tx, ty, false), $.itofix$i32(tx), $.itofix$i32(sy), xdir.$clone(), ydir.$clone());
        }
      }
    }
    if (amt >= 20) {
      $.StartSoundEffect(S("Liquids::Splash2"), false, 50, this);
    } else if (amt > 1) {
      $.StartSoundEffect(S("Liquids::Splash1"), false, 50, this);
    }
  }

  RemoveSolidMask(fBackupAttachment) {
    if (this.pSolidMaskData != null) {
      this.pSolidMaskData.Remove(fBackupAttachment);
    }
  }

  MovementDigFreeTargetArea() {
    let current_action = this.GetAction();
    if (current_action != null && current_action.GetPropertyInt(60 /*P_DigFree*/) !== 0) {
      let target_x = $.fixtoi$C4Fixed(this.fix_x.op_add$C4Fixed(this.xdir));
      let target_y = $.fixtoi$C4Fixed(this.fix_y.op_add$C4Fixed(this.ydir));
      if (current_action.GetPropertyInt(60 /*P_DigFree*/) === 1) {
        $.Landscape.DigFreeRect(target_x + this.Shape.GetX() | 0, target_y + this.Shape.GetY() | 0, this.Shape.Wdt, this.Shape.Hgt, this);
      } else {
        let rad = current_action.GetPropertyInt(60 /*P_DigFree*/);
        if (this.Con < 100000) {
          rad = (Math.imul(Math.imul(rad, 6), this.Con) / 5 | 0) / 100000 | 0;
        }
        $.Landscape.DigFree(target_x, target_y - 1 | 0, rad, this);
      }
    }
  }

  init() {
    super.init();
    this.id = new $.C4ID().init$v();
    this.Area = new $.C4LArea().init$v();
    this.fix_x = new $.C4Fixed();
    this.fix_y = new $.C4Fixed();
    this.fix_r = new $.C4Fixed();
    this.xdir = new $.C4Fixed();
    this.ydir = new $.C4Fixed();
    this.rdir = new $.C4Fixed();
    this.Layer = new $.C4ObjectPtr().init$v();
    this.TopFace = new $.C4Facet().init$v();
    this.Contained = new $.C4ObjectPtr().init$v();
    this.Action = new C4Action().init();
    this.Shape = new $.C4Shape();
    this.SolidMask = new $.C4TargetRect();
    this.PictureRect = new $.C4Rect();
    this.Contents = new $.C4NotifyingObjectList().init$v();
    this.nInfo = new $.StdCopyStrBuf();
    this.FrontParticles = this.BackParticles = null;
    C4Object.prototype.Default.call(this);
    return this;
  }

  $dtor() {
    C4Object.prototype.Clear.call(this);
    super.$dtor();
  }

  ClearParticleLists() {
    if (this.FrontParticles != null) {
      $.Particles.ReleaseParticleList(this.FrontParticles);
    }
    if (this.BackParticles != null) {
      $.Particles.ReleaseParticleList(this.BackParticles);
    }
    this.FrontParticles = this.BackParticles = null;
  }

  Resort() {
    this.Unsorted = true;
    $.Game.fResortAnyObject = true;
  }

  SetPlane(z) {
    if (z !== 0) {
      this.Plane = z;
    }
    this.Resort();
  }

  GetPlane$v$c() {
    return this.Plane;
  }

  GetSolidMaskPlane() {
    let plane = this.GetPropertyInt(81 /*P_SolidMaskPlane*/);
    return plane !== 0 ? plane : this.GetPlane$v$c();
  }

  SetCommand$i32$pC4Object$C4Value$i32$pC4Object$b$C4Value$i32$pC4String(iCommand, pTarget$, iTx, iTy$ = 0, pTarget2$ = null, fControl = false, iData = new $.C4Value().$copy($.C4VNull), iRetries = 0, szText = null) {
    const pTarget = [pTarget$];
    const iTy = [iTy$];
    const pTarget2 = [pTarget2$];
    this.ClearCommands();
    if (fControl) {
      if (!this.CloseMenu(false)) {
        return;
      }
    }
    if (fControl) {
      if (!this.Call$pi8$pC4AulParSet$b(S("~ControlCommand"), new $.C4AulParSet().init$mpi8$rpC4Object$rC4Value$ri32$rpC4Object$rC4Value($.CommandName(iCommand), P(pTarget, 0), iTx, P(iTy, 0), P(pTarget2, 0), iData).op_and()).op_not()) {
        return;
      }
    }
    if (this.Contained.op_C4Object_() != null) {
      if ((this.Contained.op_arrow().Def.VehicleControl & 2) !== 0) {
        this.Contained.op_arrow().Controller = this.Controller;
        if (!this.Contained.op_arrow().Call$pi8$pC4AulParSet$b(S("~ControlCommand"), new $.C4AulParSet().init$mpi8$rpC4Object$rC4Value$ri32$rpC4Object$rC4Value$mpC4Object($.CommandName(iCommand), P(pTarget, 0), iTx, P(iTy, 0), P(pTarget2, 0), iData, this).op_and()).op_not()) {
          return;
        }
      }
    }
    if (this.GetProcedure() === 243) {
      if (this.Action.Target.op_C4Object_() != null) {
        if ((this.Action.Target.op_arrow().Def.VehicleControl & 1) !== 0) {
          this.Action.Target.op_arrow().Controller = this.Controller;
          if (!this.Action.Target.op_arrow().Call$pi8$pC4AulParSet$b(S("~ControlCommand"), new $.C4AulParSet().init$mpi8$rpC4Object$rC4Value$ri32$rpC4Object$rC4Value($.CommandName(iCommand), P(pTarget, 0), iTx, P(iTy, 0), P(pTarget2, 0), iData).op_and()).op_not()) {
            return;
          }
        }
      }
    }
    this.AddCommand$i32$pC4Object$C4Value$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(iCommand, pTarget[0], new $.C4Value().$copy(iTx), iTy[0], 0, pTarget2[0], true, new $.C4Value().$copy(iData), false, iRetries, szText, 1);
  }

  SetCommand$i32$pC4Object$i32$i32$pC4Object$b$C4Value$i32$pC4String(iCommand, pTarget = null, iTx = 0, iTy = 0, pTarget2 = null, fControl = false, iData = new $.C4Value().$copy($.C4VNull), iRetries = 0, szText = null) {
    this.SetCommand$i32$pC4Object$C4Value$i32$pC4Object$b$C4Value$i32$pC4String(iCommand, pTarget, $.C4VInt(iTx), iTy, pTarget2, fControl, new $.C4Value().$copy(iData), iRetries, szText);
  }

  AddCommand$i32$pC4Object$C4Value$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(iCommand, pTarget, iTx, iTy = 0, iUpdateInterval = 0, pTarget2 = null, fInitEvaluation = true, iData = new $.C4Value().$copy($.C4VNull), fAppend = false, iRetries = 0, szText = null, iBaseMode = 0) {
    let MaxCommandStack = 35;
    let pCom = null;
    let pLast = null;
    let iCommands = 0;
    for (pCom = this.Command, iCommands = 0; pCom != null; pCom = pCom.Next, iCommands = iCommands + 1 | 0) {
    }
    if (iCommands >= 35) {
      return false;
    }
    if (!$.Inside$i32$i32$i32$3(iCommand, 1, 25)) {
      return false;
    }
    if (!((pCom = new $.C4Command().init()) != null)) {
      return false;
    }
    pCom.Set(iCommand, this, pTarget, new $.C4Value().$copy(iTx), iTy, pTarget2, new $.C4Value().$copy(iData), iUpdateInterval, !fInitEvaluation, iRetries, szText, iBaseMode);
    if (fAppend) {
      for (pLast = this.Command; pLast != null && pLast.Next != null; pLast = pLast.Next) {
      }
      if (pLast != null) {
        pLast.Next = pCom;
      } else {
        this.Command = pCom;
      }
    } else {
      pCom.Next = this.Command;
      this.Command = pCom;
    }
    return true;
  }

  AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(iCommand, pTarget = null, iTx = 0, iTy = 0, iUpdateInterval = 0, pTarget2 = null, fInitEvaluation = true, iData = new $.C4Value().$copy($.C4VNull), fAppend = false, iRetries = 0, szText = null, iBaseMode = 0) {
    return this.AddCommand$i32$pC4Object$C4Value$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(iCommand, pTarget, $.C4VInt(iTx), iTy, iUpdateInterval, pTarget2, fInitEvaluation, new $.C4Value().$copy(iData), fAppend, iRetries, szText, iBaseMode);
  }

  FindCommand(iCommandType) {
    for (let pCom = this.Command; pCom != null; pCom = pCom.Next) {
      if (pCom.Command === iCommandType) {
        return pCom;
      }
    }
    return null;
  }

  ClearCommand(pUntil) {
    let pCom = null;
    let pNext = null;
    for (pCom = this.Command; pCom != null; pCom = pNext) {
      if (pCom === pUntil) {
        pNext = null;
      } else {
        pNext = pCom.Next;
      }
      this.Command = pCom.Next;
      if (pCom.iExec === 0) {
        $delete(pCom);
      } else {
        pCom.iExec = 2;
      }
    }
  }

  ClearCommands() {
    let pNext = null;
    while (this.Command != null) {
      pNext = this.Command.Next;
      if (this.Command.iExec === 0) {
        $delete(this.Command);
      } else {
        this.Command.iExec = 2;
      }
      this.Command = pNext;
    }
  }

  DrawSelectMark(cgo) {
    if (this.Status === 0) {
      return;
    }
    if ($.Game.C4S.Head.Film !== 0 && $.Game.C4S.Head.Replay) {
      return;
    }
    const offX = [0];
    const offY = [0];
    const newzoom = [0];
    this.GetDrawPosition$C4TargetFacet$rf32$rf32$rf32(cgo, P(offX, 0), P(offY, 0), P(newzoom, 0));
    if (!$.Inside$f32$f32$f32(offX[0], cgo.X, Math.fround(cgo.X + cgo.Wdt)) || !$.Inside$f32$f32$f32(offY[0], cgo.Y, Math.fround(cgo.Y + cgo.Hgt))) {
      return;
    }
    let cox = Math.fround(Math.fround(Math.fround(Math.fround(offX[0] + Math.fround(this.Shape.GetX())) - cgo.X) + cgo.X) - Math.fround(2));
    let coy = Math.fround(Math.fround(Math.fround(Math.fround(offY[0] + Math.fround(this.Shape.GetY())) - cgo.Y) + cgo.Y) - Math.fround(2));
    $.GraphicsResource.fctSelectMark.Draw$pC4Surface$f32$f32$i32$i32(cgo.Surface, cox, coy, 0);
    $.GraphicsResource.fctSelectMark.Draw$pC4Surface$f32$f32$i32$i32(cgo.Surface, Math.fround(cox + Math.fround(this.Shape.Wdt)), coy, 1);
    $.GraphicsResource.fctSelectMark.Draw$pC4Surface$f32$f32$i32$i32(cgo.Surface, cox, Math.fround(coy + Math.fround(this.Shape.Hgt)), 2);
    $.GraphicsResource.fctSelectMark.Draw$pC4Surface$f32$f32$i32$i32(cgo.Surface, Math.fround(cox + Math.fround(this.Shape.Wdt)), Math.fround(coy + Math.fround(this.Shape.Hgt)), 3);
  }

  UpdateActionFace() {
    $.C4Facet.prototype.Default.call(this.Action.Facet);
    let pActionDef = this.GetAction();
    if (pActionDef != null) {
      if (pActionDef.GetPropertyInt(35 /*P_Wdt*/) > 0) {
        this.Action.Facet.Set$pC4Surface$f32$f32$f32$f32(this.GetGraphics().GetBitmap(this.Color), Math.fround(pActionDef.GetPropertyInt(31 /*P_X*/)), Math.fround(pActionDef.GetPropertyInt(32 /*P_Y*/)), Math.fround(pActionDef.GetPropertyInt(35 /*P_Wdt*/)), Math.fround(pActionDef.GetPropertyInt(36 /*P_Hgt*/)));
        this.Action.FacetX = pActionDef.GetPropertyInt(42 /*P_OffX*/);
        this.Action.FacetY = pActionDef.GetPropertyInt(43 /*P_OffY*/);
      }
    }
  }

  SyncClearance() {
    this.Action.t_attach = 0;
    this.InMat = -1;
    this.t_contact = 0;
    this.SetOCF();
    this.CloseMenu(true);
    $delete(this.MaterialContents);
    this.MaterialContents = null;
    if ((this.Category & 1) !== 0) {
      this.xdir.$assign(this.ydir.op_assign(0));
    }
  }

  SetSolidMask(x, y, wdt, hgt, tx, ty) {
    if (this.pSolidMaskData != null) {
      $delete(this.pSolidMaskData);
      this.pSolidMaskData = null;
    }
    this.SolidMask.Set$i32$i32$i32$i32$i32$i32(x, y, wdt, hgt, tx, ty);
    if (this.CheckSolidMaskRect()) {
      this.UpdateSolidMask(false);
    }
  }

  SetHalfVehicleSolidMask(set) {
    if (this.pSolidMaskData != null) {
      this.HalfVehicleSolidMask = set;
      this.pSolidMaskData.SetHalfVehicle(set);
    }
  }

  CheckSolidMaskRect() {
    let mask = this.Def.pSolidMask;
    if (mask == null) {
      this.SolidMask.Set$i32$i32$i32$i32$i32$i32(0, 0, 0, 0, 0, 0);
      return false;
    }
    this.SolidMask.Set$i32$i32$i32$i32$i32$i32($max(this.SolidMask.x, 0), $max(this.SolidMask.y, 0), $min(this.SolidMask.Wdt, mask.Wdt - this.SolidMask.x | 0), $min(this.SolidMask.Hgt, mask.Hgt - this.SolidMask.y | 0), this.SolidMask.tx, this.SolidMask.ty);
    if (this.SolidMask.Hgt <= 0) {
      this.SolidMask.Wdt = 0;
    }
    return this.SolidMask.Wdt > 0;
  }

  MenuCommand(szCommand) {
    if (this.Def == null || this.Status === 0) {
      return false;
    }
    return !$.AulExec.DirectExec(this, szCommand, S("MenuCommand")).op_not();
  }

  Clear() {
    this.ClearParticleLists();
    $delete(this.pEffects);
    this.pEffects = null;
    $delete(this.pSolidMaskData);
    this.pSolidMaskData = null;
    $delete(this.Menu);
    this.Menu = null;
    $delete(this.MaterialContents);
    this.MaterialContents = null;
    let pCom = null;
    let pNext = null;
    for (pCom = this.Command; pCom != null; pCom = pNext) {
      pNext = pCom.Next;
      $delete(pCom);
      pCom = pNext;
    }
    $delete(this.pDrawTransform);
    this.pDrawTransform = null;
    $delete(this.pGfxOverlay);
    this.pGfxOverlay = null;
    $delete(this.pMeshInstance);
    this.pMeshInstance = null;
  }

  ClearInfo(pInfo) {
    if (this.Info === pInfo) {
      this.Info = null;
    }
  }

  AssignInfo() {
    if (this.Info != null || !($.ValidPlr(this.Owner) !== 0)) {
      return false;
    }
    let pPlr = $.Players.Get(this.Owner);
    if (pPlr.Crew.GetLink$pC4Object(this) != null) {
      if (!$.Players.Get(this.Owner).MakeCrewMember(this, true, false)) {
        pPlr.Crew.Remove(this);
      }
      return true;
    } else if (this.nInfo.getLength() !== 0) {
      if (!$.Players.Get(this.Owner).MakeCrewMember(this, true, false)) {
        return false;
      }
      if (!this.Alive) {
        if ($.ValidPlr(this.Owner) !== 0) {
          $.Players.Get(this.Owner).ClearPointers(this, true);
        }
      }
      return true;
    }
    return false;
  }

  ValidateOwner() {
    if (!($.ValidPlr(this.Owner) !== 0)) {
      this.Owner = -1;
    }
    if (!($.ValidPlr(this.Controller) !== 0)) {
      this.Controller = -1;
    }
    return true;
  }

  AssignLightRange() {
    if (this.lightRange === 0 && this.lightFadeoutRange === 0) {
      return true;
    }
    this.UpdateLight();
    return true;
  }

  DrawPicture(cgo, fSelected = false, transform = null) {
    this.Def.Draw$rC4Facet$b$u32$pC4Object$i32$i32$pC4DrawTransform$pi8(cgo, fSelected, this.Color, this, 0, 0, transform);
  }

  Picture2Facet(cgo) {
    let fctPicRect = this.PictureRect.$clone();
    if (fctPicRect.Wdt === 0) {
      fctPicRect.$assign(this.Def.PictureRect);
    }
    let fctPicture = new $.C4Facet().init$v();
    fctPicture.Set$pC4Surface$f32$f32$f32$f32(this.GetGraphics().GetBitmap(this.Color), Math.fround(fctPicRect.x), Math.fround(fctPicRect.y), Math.fround(fctPicRect.Wdt), Math.fround(fctPicRect.Hgt));
    if (this.ColorMod === 0xffffffff && this.BlitMode === 0 && this.pGfxOverlay == null) {
      cgo.Set$C4Facet(fctPicture);
      return;
    }
    if (!cgo.Create(ftoi32(cgo.Wdt), ftoi32(cgo.Hgt))) {
      return;
    }
    this.PrepareDrawing();
    fctPicture.Draw$rC4Facet$b$i32$i32$b(cgo, true);
    if (this.pGfxOverlay != null) {
      for (let pGfxOvrl = this.pGfxOverlay; pGfxOvrl != null; pGfxOvrl = pGfxOvrl.GetNext()) {
        if (pGfxOvrl.IsPicture()) {
          pGfxOvrl.DrawPicture(cgo, this, null);
        }
      }
    }
    this.FinishedDrawing();
  }

  Default() {
    this.id.$assign($.C4ID.None);
    this.nInfo.Clear();
    this.RemovalDelay = 0;
    this.Owner = -1;
    this.Controller = -1;
    this.LastEnergyLossCausePlayer = -1;
    this.Category = 0;
    this.Con = 0;
    this.Mass = this.OwnMass = 0;
    this.Damage = 0;
    this.Energy = 0;
    this.Alive = false;
    this.Breath = 0;
    this.InMat = -1;
    this.Color = 0;
    this.lightRange = 0;
    this.lightFadeoutRange = 0;
    this.lightColor = 0xffffffff;
    this.fix_x.$assign(this.fix_y.$assign(this.fix_r.op_assign(0)));
    this.xdir.$assign(this.ydir.$assign(this.rdir.op_assign(0)));
    this.Mobile = false;
    this.Unsorted = false;
    this.Initializing = false;
    this.OnFire = false;
    this.InLiquid = false;
    this.EntranceStatus = false;
    this.Audible = this.AudiblePan = 0;
    this.AudiblePlayer = -1;
    this.t_contact = 0;
    this.OCF = 0;
    this.Action.Default();
    this.Shape.Default();
    this.fOwnVertices = false;
    this.Contents.Default();
    this.SolidMask.Default();
    this.HalfVehicleSolidMask = false;
    $.C4Rect.prototype.Default.call(this.PictureRect);
    this.Def = null;
    this.Info = null;
    this.Command = null;
    this.Contained.op_assign(null);
    $.C4Facet.prototype.Default.call(this.TopFace);
    this.Menu = null;
    this.MaterialContents = null;
    this.Marker = 0;
    this.ColorMod = 0xffffffff;
    this.BlitMode = 0;
    this.CrewDisabled = false;
    this.Layer.op_assign(null);
    this.pSolidMaskData = null;
    this.pGraphics = null;
    this.pMeshInstance = null;
    this.pDrawTransform = null;
    this.pEffects = null;
    this.pGfxOverlay = null;
    this.iLastAttachMovementFrame = -1;
    this.ClearParticleLists();
  }

  Init$pC4PropList$pC4Object$i32$pC4ObjectInfo$i32$i32$i32$C4Fixed$C4Fixed$C4Fixed$i32(pDef, pCreator, iOwner, pInfo, nx, ny, nr, nxdir, nydir, nrdir, iController) {
    $.C4PropListNumbered.prototype.AcquireNumber.call(this);
    this.Initializing = true;
    this.Owner = iOwner;
    if (iController > -1) {
      this.Controller = iController;
    } else {
      this.Controller = iOwner;
    }
    this.LastEnergyLossCausePlayer = -1;
    this.Info = pInfo;
    this.Def = pDef.GetDef$v();
    0;
    this.SetProperty(0 /*P_Prototype*/, $.C4VPropList(pDef));
    this.id.$assign(this.Def.id);
    if (this.Info != null) {
      this.SetName(P(pInfo.Name, 0));
    }
    this.Category = this.Def.Category;
    this.Plane = this.Def.GetPlane$v();
    0;
    this.Def.Count = this.Def.Count + 1 | 0;
    if (pCreator != null) {
      this.Layer.$assign(pCreator.Layer);
    }
    this.pGraphics = this.Def.Graphics;
    if (this.pGraphics.Type === 2) {
      this.pMeshInstance = new $.StdMeshInstance().init(this.pGraphics.$u1.Mesh, this.Def.GrowthType !== 0 ? 1 : Math.fround(Math.fround(this.Con) / Math.fround(100000)));
      this.pMeshInstance.SetFaceOrderingForClrModulation(this.ColorMod);
    } else {
      this.pMeshInstance = null;
    }
    this.BlitMode = this.Def.BlitMode >>> 0;
    if (this.Def.Rotateable === 0) {
      nr = 0;
      nrdir.op_assign(0);
    }
    this.fix_x.$assign($.itofix$i32(nx));
    this.fix_y.$assign($.itofix$i32(ny));
    this.fix_r.$assign($.itofix$i32(nr));
    this.xdir.$assign(nxdir);
    this.ydir.$assign(nydir);
    this.rdir.$assign(nrdir);
    if (!this.xdir.op_not() || !this.ydir.op_not() || !this.rdir.op_not()) {
      this.Mobile = true;
    }
    this.Mass = $max(Math.imul(this.Def.Mass, this.Con) / 100000 | 0, 1);
    if ((this.Category & 8) !== 0) {
      this.Alive = true;
    }
    if (this.Alive) {
      this.Energy = this.GetPropertyInt(71 /*P_MaxEnergy*/);
    }
    this.Breath = this.GetPropertyInt(72 /*P_MaxBreath*/);
    if (this.Def.ColorByOwner !== 0) {
      if ($.ValidPlr(this.Owner) !== 0) {
        this.Color = $.Players.Get(this.Owner).ColorDw;
      } else {
        this.Color = 255;
      }
    }
    this.Shape.$assign(this.Def.Shape);
    this.SolidMask.$assign(this.Def.SolidMask);
    this.CheckSolidMaskRect();
    this.UpdateGraphics(false);
    this.UpdateFace(true);
    this.Audible = $.Viewports.GetAudibility(this.GetX(), this.GetY(), P(this, "AudiblePan"), 0, P(this, "AudiblePlayer"));
    this.SetOCF();
    this.Initializing = false;
    return true;
  }

  CompileFunc$pStdCompiler$pC4ValueNumbers(pComp, numbers$) {
    const numbers = [numbers$];
    let deserializing = pComp.isDeserializer();
    if (deserializing) {
      this.Clear();
    }
    pComp.Value$StdNamingDefaultAdapt$C4ID$C4ID($.mkNamingAdapt$rC4ID$pi8$C4ID$b$b(this.id, S("id"), $.C4ID.None));
    if (deserializing) {
      this.Def = $.Definitions.ID2Def(this.id.$clone());
      if (this.Def == null) {
        pComp.excNotFound($.LoadResStr(S("IDS_PRC_UNDEFINEDOBJECT")), this.id.ToString());
        return;
      }
    }
    pComp.Value$StdNamingAdapt$StdParameterAdapt$C4PropListNumbered$pC4ValueNumbers($.mkNamingAdapt$mStdParameterAdapt$C4PropListNumbered$pC4ValueNumbers$pi8($.mkParAdapt$rC4PropListNumbered$rpC4ValueNumbers(this, P(numbers, 0)), S("Properties")));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Status"), S("Status"), 1));
    if (this.Info != null) {
      this.nInfo.op_assign$pi8(P(this.Info.Name, 0));
    } else {
      this.nInfo.Clear();
    }
    pComp.Value$StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x$2($.mkNamingAdapt$mStdParameterAdapt$StdCopyStrBuf$i32$pi8$x$b$b$2($.mkParAdapt$rStdCopyStrBuf$mi32(this.nInfo, 1 /*RCT_All*/), S("Info"), S("")));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Owner"), S("Owner"), $.NO_OWNER$C4Constants));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Controller"), S("Controller"), $.NO_OWNER$C4Constants));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "LastEnergyLossCausePlayer"), S("LastEngLossPlr"), $.NO_OWNER$C4Constants));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Category"), S("Category"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Plane"), S("Plane"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iLastAttachMovementFrame"), S("LastSolidAtchFrame"), -1));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Con"), S("Size"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "OwnMass"), S("OwnMass"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Mass"), S("Mass"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Damage"), S("Damage"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Energy"), S("Energy"), 0));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "Alive"), S("Alive"), false));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Breath"), S("Breath"), 0));
    pComp.Value$StdNamingDefaultAdapt$u32$u32($.mkNamingAdapt$ru32$pi8$u32$b$b(P(this, "Color"), S("Color"), 0));
    pComp.Value$StdNamingDefaultAdapt$C4Fixed$C4Fixed($.mkNamingAdapt$rC4Fixed$pi8$C4Fixed$b$b(this.fix_x, S("X"), $.Fix0$C4Real));
    pComp.Value$StdNamingDefaultAdapt$C4Fixed$C4Fixed($.mkNamingAdapt$rC4Fixed$pi8$C4Fixed$b$b(this.fix_y, S("Y"), $.Fix0$C4Real));
    pComp.Value$StdNamingDefaultAdapt$C4Fixed$C4Fixed($.mkNamingAdapt$rC4Fixed$pi8$C4Fixed$b$b(this.fix_r, S("R"), $.Fix0$C4Real));
    pComp.Value$StdNamingDefaultAdapt$C4Fixed$i32($.mkNamingAdapt$rC4Fixed$pi8$i32$b$b(this.xdir, S("XDir"), 0));
    pComp.Value$StdNamingDefaultAdapt$C4Fixed$i32($.mkNamingAdapt$rC4Fixed$pi8$i32$b$b(this.ydir, S("YDir"), 0));
    pComp.Value$StdNamingDefaultAdapt$C4Fixed$i32($.mkNamingAdapt$rC4Fixed$pi8$i32$b$b(this.rdir, S("RDir"), 0));
    pComp.Value$StdParameterAdapt$C4Shape$pC4Shape($.mkParAdapt$rC4Shape$mpC4Shape(this.Shape, this.Def.Shape));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "fOwnVertices"), S("OwnVertices"), false));
    pComp.Value$StdNamingDefaultAdapt$C4TargetRect$C4TargetRect($.mkNamingAdapt$rC4TargetRect$pi8$C4TargetRect$b$b(this.SolidMask, S("SolidMask"), this.Def.SolidMask));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "HalfVehicleSolidMask"), S("HalfVehicleSolidMask"), false));
    pComp.Value$StdNamingAdapt$C4Rect($.mkNamingAdapt$rC4Rect$pi8(this.PictureRect, S("Picture")));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "Mobile"), S("Mobile"), false));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "OnFire"), S("OnFire"), false));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "InLiquid"), S("InLiquid"), false));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "EntranceStatus"), S("EntranceStatus"), false));
    pComp.Value$StdNamingDefaultAdapt$u32$u32($.mkNamingAdapt$ru32$pi8$u32$b$b(P(this, "OCF"), S("OCF"), 0));
    pComp.Value$rC4Action(this.Action);
    pComp.Value$StdNamingDefaultAdapt$C4ObjectPtr$C4ObjectPtr($.mkNamingAdapt$rC4ObjectPtr$pi8$C4ObjectPtr$b$b(this.Contained, S("Contained"), $.C4ObjectPtr.Null));
    pComp.Value$StdNamingDefaultAdapt$C4ObjectPtr$C4ObjectPtr($.mkNamingAdapt$rC4ObjectPtr$pi8$C4ObjectPtr$b$b(this.Action.Target, S("ActionTarget1"), $.C4ObjectPtr.Null));
    pComp.Value$StdNamingDefaultAdapt$C4ObjectPtr$C4ObjectPtr($.mkNamingAdapt$rC4ObjectPtr$pi8$C4ObjectPtr$b$b(this.Action.Target2, S("ActionTarget2"), $.C4ObjectPtr.Null));
    pComp.Value$StdNamingAdapt$StdParameterAdapt$C4NotifyingObjectList$pC4ValueNumbers($.mkNamingAdapt$mStdParameterAdapt$C4NotifyingObjectList$pC4ValueNumbers$pi8($.mkParAdapt$rC4NotifyingObjectList$rpC4ValueNumbers(this.Contents, P(numbers, 0)), S("Contents")));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "lightRange"), S("LightRange"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "lightFadeoutRange"), S("LightFadeoutRange"), 0));
    pComp.Value$StdNamingDefaultAdapt$u32$u32($.mkNamingAdapt$ru32$pi8$u32$b$b(P(this, "lightColor"), S("lightColor"), 0xffffffff));
    pComp.Value$StdNamingDefaultAdapt$u32$u32($.mkNamingAdapt$ru32$pi8$u32$b$b(P(this, "ColorMod"), S("ColorMod"), 0xffffffff));
    pComp.Value$StdNamingDefaultAdapt$u32$u32($.mkNamingAdapt$ru32$pi8$u32$b$b(P(this, "BlitMode"), S("BlitMode"), 0));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "CrewDisabled"), S("CrewDisabled"), false));
    pComp.Value$StdNamingDefaultAdapt$C4ObjectPtr$C4ObjectPtr($.mkNamingAdapt$rC4ObjectPtr$pi8$C4ObjectPtr$b$b(this.Layer, S("Layer"), $.C4ObjectPtr.Null));
    pComp.Value$StdNamingDefaultAdapt$C4DefGraphicsAdapt$pC4DefGraphics($.mkNamingAdapt$mC4DefGraphicsAdapt$pi8$rpC4DefGraphics$b$b(new $.C4DefGraphicsAdapt().init(P(this, "pGraphics")), S("Graphics"), this.Def.Graphics));
    pComp.Value$StdPtrAdapt$C4DrawTransform($.mkNamingPtrAdapt$rpC4DrawTransform$pi8(P(this, "pDrawTransform"), S("DrawTransform")));
    pComp.Value$StdParameter2Adapt$StdPtrAdapt$C4Effect$pC4Object$pC4ValueNumbers($.mkParAdapt$mStdPtrAdapt$C4Effect$mpC4Object$rpC4ValueNumbers($.mkNamingPtrAdapt$rpC4Effect$pi8(P(this, "pEffects"), S("Effects")), this, P(numbers, 0)));
    pComp.Value$StdNamingDefaultAdapt$C4GraphicsOverlayListAdapt$pC4GraphicsOverlay($.mkNamingAdapt$mC4GraphicsOverlayListAdapt$pi8$rpC4GraphicsOverlay$b$b(new $.C4GraphicsOverlayListAdapt().init(P(this, "pGfxOverlay")), S("GfxOverlay"), null));
    if (this.pGraphics.Type === 2) {
      if (pComp.isDeserializer()) {
        0;
        this.pMeshInstance = new $.StdMeshInstance().init(this.pGraphics.$u1.Mesh, this.Def.GrowthType !== 0 ? 1 : Math.fround(Math.fround(this.Con) / Math.fround(100000)));
      }
      pComp.Value$StdNamingAdapt$StdParameterAdapt$StdMeshInstance$x($.mkNamingAdapt$mStdParameterAdapt$StdMeshInstance$x$pi8($.mkParAdapt$rStdMeshInstance$x(this.pMeshInstance, $.C4MeshDenumeratorFactory), S("Mesh")));
    }
    if (pComp.FollowName(S("Commands"))) {
      if (deserializing) {
        let pCmd = null;
        for (let i = 1; ; i = i + 1 | 0) {
          let Naming = $.FormatString(S("Command%d"), i);
          pComp.Value$StdParameterAdapt$StdPtrAdapt$C4Command$pC4ValueNumbers($.mkParAdapt$mStdPtrAdapt$C4Command$rpC4ValueNumbers($.mkNamingPtrAdapt$rpC4Command$pi8((pCmd != null ? P(pCmd, "Next") : P(this, "Command")), Naming.getData()), P(numbers, 0)));
          pCmd = pCmd != null ? pCmd.Next : this.Command;
          if (pCmd == null) {
            break;
          }
          pCmd.cObj = this;
        }
      } else {
        let pCmd = this.Command;
        for (let i = 1; pCmd != null; i = i + 1 | 0, pCmd = pCmd.Next) {
          let Naming = $.FormatString(S("Command%d"), i);
          pComp.Value$StdNamingAdapt$StdParameterAdapt$C4Command$pC4ValueNumbers($.mkNamingAdapt$mStdParameterAdapt$C4Command$pC4ValueNumbers$pi8($.mkParAdapt$rC4Command$rpC4ValueNumbers(pCmd, P(numbers, 0)), Naming.getData()));
        }
      }
    }
    if (deserializing) {
      this.Def.Count = this.Def.Count + 1 | 0;
      if (this.pMeshInstance != null) {
        this.Action.Animation = this.pMeshInstance.GetRootAnimationForSlot(0);
        this.pMeshInstance.SetFaceOrderingForClrModulation(this.ColorMod);
      }
      if (this.BlitMode === 0) {
        this.BlitMode = this.Def.BlitMode >>> 0;
      }
      if (this.Unsorted) {
        $.Game.fResortAnyObject = true;
      }
    }
  }

  Denumerate(numbers) {
    $.C4PropList.prototype.Denumerate.call(this, numbers);
    this.Contained.DenumeratePointers();
    this.Action.Target.DenumeratePointers();
    this.Action.Target2.DenumeratePointers();
    this.Layer.DenumeratePointers();
    this.Contents.DenumeratePointers();
    for (let pCom = this.Command; pCom != null; pCom = pCom.Next) {
      pCom.Denumerate(numbers);
    }
    if (this.pEffects != null) {
      this.pEffects.Denumerate(numbers);
    }
    if (this.pGfxOverlay != null) {
      for (let pGfxOvrl = this.pGfxOverlay; pGfxOvrl != null; pGfxOvrl = pGfxOvrl.GetNext()) {
        pGfxOvrl.DenumeratePointers();
      }
    }
    if (this.pMeshInstance != null) {
      this.pMeshInstance.DenumeratePointers();
    }
  }

  DrawLine(_cgo, _at_player) {
    if (this.Shape.VtxNum < 2) {
      return;
    }
  }

  SetPhase(iPhase) {
    let pActionDef = this.GetAction();
    if (pActionDef == null) {
      return false;
    }
    let length = pActionDef.GetPropertyInt(29 /*P_Length*/);
    this.Action.Phase = $.Clamp$i32$i32$i32(iPhase, 0, length);
    this.Action.PhaseDelay = 0;
    return true;
  }

  AssignRemoval(exit_contents = false) {
    let $t1, $t2, $t3;
    if (this.Status === 0 || this.RemovalDelay > 0) {
      return;
    }
    this.RemovalDelay = 2;
    if ($.Config.General.DebugRec !== 0) {
      let rc = new $.C4RCCreateObj();
      c$memset($bytesView(rc, [["oei", 0, "i32", 0], ["id", 4, "i8", 33], ["x", 37, "i32", 0], ["y", 41, "i32", 0], ["ownr", 45, "i32", 0]], 49), 0, 49);
      rc.oei = this.Number;
      if (this.Def != null && this.Def.GetName() != null) {
        c$strncpy(P(rc.id, 0), this.Def.GetName(), 33);
      }
      rc.x = this.GetX();
      rc.y = this.GetY();
      rc.ownr = this.Owner;
      $.AddDbgRec(138 /*RCT_DsObj*/, $bytesView(rc, [["oei", 0, "i32", 0], ["id", 4, "i8", 33], ["x", 37, "i32", 0], ["y", 41, "i32", 0], ["ownr", 45, "i32", 0]], 49), 49);
    }
    if (this.Contained.op_C4Object_() != null) {
      let pars = new $.C4AulParSet().init$mpC4Object(this);
      this.Contained.op_arrow().Call$pi8$pC4AulParSet$b(S("~ContentsDestruction"), pars.op_and());
    }
    this.Call$pi8$pC4AulParSet$b(S("~Destruction"));
    if (this.pEffects != null) {
      this.pEffects.ClearAll(3);
    }
    this.ClearParticleLists();
    this.SetAction(null);
    if (this.Status === 2) {
      $.Objects.InactiveObjects.Remove(this);
      this.Status = 1;
      $.Objects.Add$pC4Object(this);
    }
    this.Status = 0;
    this.Def.Count = this.Def.Count - 1 | 0;
    let pCont = this.Contained.op_C4Object_();
    $t1 = this.Contents;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    try {
      for (; $t2.op_ne($t3); $t2.op_inc$v()) {
        const cobj = $t2.op_mul();
        if (exit_contents) {
          const fRejectCollect = [false];
          if (pCont == null || !cobj.Enter(pCont, true, false, P(fRejectCollect, 0))) {
            cobj.Exit(this.GetX(), this.GetY());
          }
        } else {
          this.Contents.Remove(cobj);
          cobj.Contained.op_assign(null);
          cobj.AssignRemoval();
        }
      }
    } finally { $t2.$dtor(); $t3.$dtor(); }
    if (pCont != null) {
      pCont.Contents.Remove(this);
      pCont.UpdateMass();
      pCont.SetOCF();
      this.Contained.op_assign(null);
    }
    if (this.Info != null) {
      this.Info.Retire();
    }
    this.Info = null;
    this.ClearRefs();
    $.Game.ClearPointers(this);
    this.ClearCommands();
    if (this.pSolidMaskData != null) {
      $delete(this.pSolidMaskData);
      this.pSolidMaskData = null;
    }
    this.SolidMask.Wdt = 0;
  }

  Draw$rC4TargetFacet$i32$i32$f32$f32(_cgo, _iByPlayer = -1, _eDrawMode = 0 /*ODM_Normal*/, _offX = Math.fround(0), _offY = Math.fround(0)) {
  }

  DrawTopFace(_cgo, _iByPlayer = -1, _eDrawMode = 0 /*ODM_Normal*/, _offX = Math.fround(0), _offY = Math.fround(0)) {
  }

  DrawActionFace(cgo, offX, offY) {
    0;
    let pActionDef = this.GetAction();
    let swdt = this.Action.Facet.Wdt;
    let shgt = this.Action.Facet.Hgt;
    let iPhase = this.Action.Phase;
    if (pActionDef.GetPropertyInt(63 /*P_Reverse*/) !== 0) {
      iPhase = (pActionDef.GetPropertyInt(29 /*P_Length*/) - 1 | 0) - this.Action.Phase | 0;
    }
    let fx = Math.fround(this.Action.Facet.X + Math.fround(swdt * Math.fround(iPhase)));
    let fy = Math.fround(this.Action.Facet.Y + Math.fround(shgt * Math.fround(this.Action.DrawDir)));
    let fwdt = swdt;
    let fhgt = shgt;
    let stretch_factor = Math.fround(Math.fround(this.Con) / Math.fround(100000));
    let tx = Math.fround(Math.fround(Math.fround(this.Def.Shape.GetX() + this.Action.FacetX | 0) * stretch_factor) + offX);
    let ty = Math.fround(Math.fround(Math.fround(this.Def.Shape.GetY() + this.Action.FacetY | 0) * stretch_factor) + offY);
    let twdt = Math.fround(swdt * stretch_factor);
    let thgt = Math.fround(shgt * stretch_factor);
    if (this.Def.GrowthType === 0) {
      if (this.Con !== 100000) {
        this.DrawFace(cgo, offX, offY);
        return;
      }
      tx = Math.fround(Math.fround(this.Def.Shape.GetX() + this.Action.FacetX | 0) + offX);
      twdt = swdt;
      let offset_from_top = Math.fround(Math.fround(shgt * Math.fround($max(100000 - this.Con | 0, 0))) / Math.fround(100000));
      fy = Math.fround(fy + offset_from_top);
      fhgt = Math.fround(fhgt - offset_from_top);
    }
    let transform = new $.C4DrawTransform().init$v();
    let transform_active = false;
    if (this.pDrawTransform != null) {
      transform.SetTransformAt(this.pDrawTransform, offX, offY);
      transform_active = true;
    }
    if (this.GetGraphics().Type !== 2 && this.Def.Rotateable !== 0 && this.fix_r.op_ne$C4Fixed($.Fix0$C4Real)) {
      if (this.pDrawTransform != null) {
        transform.Rotate($.fixtof(this.fix_r), offX, offY);
      } else {
        transform.SetRotate($.fixtof(this.fix_r), offX, offY);
      }
      transform_active = true;
    }
    this.DrawFaceImpl(cgo, true, fx, fy, fwdt, fhgt, tx, ty, twdt, thgt, transform_active ? transform.op_and() : null);
  }

  DrawFace(cgo, offX, offY, iPhaseX = 0, iPhaseY = 0) {
    let swdt = Math.fround(this.Def.Shape.Wdt);
    let shgt = Math.fround(this.Def.Shape.Hgt);
    let fx = Math.fround(swdt * Math.fround(iPhaseX));
    let fy = Math.fround(shgt * Math.fround(iPhaseY));
    let fwdt = swdt;
    let fhgt = shgt;
    let stretch_factor = Math.fround(Math.fround(this.Con) / Math.fround(100000));
    let tx = Math.fround(offX + Math.fround(Math.fround(this.Def.Shape.GetX()) * stretch_factor));
    let ty = Math.fround(offY + Math.fround(Math.fround(this.Def.Shape.GetY()) * stretch_factor));
    let twdt = Math.fround(swdt * stretch_factor);
    let thgt = Math.fround(shgt * stretch_factor);
    if (this.Def.GrowthType === 0) {
      tx = Math.fround(offX + Math.fround(this.Def.Shape.GetX()));
      twdt = swdt;
      fy = Math.fround(fy + Math.fround(fhgt - thgt));
      fhgt = thgt;
    }
    let transform = new $.C4DrawTransform().init$v();
    let transform_active = false;
    if (this.pDrawTransform != null) {
      transform.SetTransformAt(this.pDrawTransform, offX, offY);
      transform_active = true;
    }
    if (this.GetGraphics().Type !== 2 && this.Def.Rotateable !== 0 && this.fix_r.op_ne$C4Fixed($.Fix0$C4Real)) {
      if (this.pDrawTransform != null) {
        transform.Rotate($.fixtof(this.fix_r), offX, offY);
      } else {
        transform.SetRotate($.fixtof(this.fix_r), offX, offY);
      }
      transform_active = true;
    }
    this.DrawFaceImpl(cgo, false, fx, fy, fwdt, fhgt, tx, ty, twdt, thgt, transform_active ? transform.op_and() : null);
  }

  DrawFaceImpl(cgo, action, fx, fy, fwdt, fhgt, tx, ty, twdt, thgt, transform) {
    let sfc = null;
    switch (this.GetGraphics().Type) {
      case 0:
        break;
      case 1:
        sfc = action ? this.Action.Facet.Surface : this.GetGraphics().GetBitmap(this.Color);
        $.pDraw.Blit(sfc, fx, fy, fwdt, fhgt, cgo.Surface, tx, ty, twdt, thgt, true, transform);
        break;
      case 2:
        let value = new $.C4Value().init$v();
        this.GetProperty(22 /*P_MeshTransformation*/, value);
        let matrix = new $.StdMeshMatrix();
        if (!$.C4ValueToMatrix$rC4Value$pStdMeshMatrix(value, matrix)) {
          matrix.$assign($.StdMeshMatrix.Identity());
        }
        if (this.fix_r.op_ne$C4Fixed($.Fix0$C4Real)) {
          let mesh_center = this.pMeshInstance.GetMesh().GetBoundingBox().GetCenter();
          mesh_center.$assign($.op_mul$StdMeshMatrix$StdMeshVector(matrix, mesh_center));
          matrix.$assign($.op_mul$StdMeshMatrix$StdMeshMatrix($.StdMeshMatrix.Translate(-mesh_center.x, -mesh_center.y, -mesh_center.z), matrix));
          matrix.$assign($.op_mul$StdMeshMatrix$StdMeshMatrix($.StdMeshMatrix.Rotate(Math.fround($.fixtof(this.fix_r) * (3.141592653589793 / 180)), 0, 0, 1), matrix));
          matrix.$assign($.op_mul$StdMeshMatrix$StdMeshMatrix($.StdMeshMatrix.Translate(mesh_center.x, mesh_center.y, mesh_center.z), matrix));
        }
        if (twdt !== fwdt || thgt !== fhgt) {
          matrix.$assign($.op_mul$StdMeshMatrix$StdMeshMatrix($.StdMeshMatrix.Scale(Math.fround(twdt / fwdt), Math.fround(thgt / fhgt), Math.fround(c$sqrt(Math.fround(Math.fround(twdt * thgt) / Math.fround(fwdt * fhgt))))), matrix));
        }
        $.pDraw.SetMeshTransform(matrix);
        $.pDraw.RenderMesh(this.pMeshInstance, cgo.Surface, tx, ty, twdt, thgt, this.Color, transform);
        $.pDraw.SetMeshTransform(null);
        break;
    }
  }

  Execute$v() {
    if ($.Config.General.DebugRec !== 0) {
      let rc = new $.C4RCExecObj().None();
      rc.Number = this.Number;
      rc.fx.$assign(this.fix_x);
      rc.fy.$assign(this.fix_y);
      rc.fr.$assign(this.fix_r);
      $.AddDbgRec(132 /*RCT_ExecObj*/, $bytesView(rc, [["Number", 0, "i32", 0], ["fx.val", 4, "i32", 0], ["fy.val", 8, "i32", 0], ["fr.val", 12, "i32", 0]], 16), 16);
    }
    this.UpdateOCF();
    this.ExecuteCommand();
    this.ExecAction();
    if (this.Status === 0) {
      return;
    }
    this.ExecMovement();
    if (this.Status === 0) {
      return;
    }
    if (this.pEffects != null) {
      $.C4Effect.Execute$ppC4Effect(P(this, "pEffects"));
      if (this.Status === 0) {
        return;
      }
    }
    this.ExecLife();
    if (this.pMeshInstance != null && !(this.pMeshInstance.GetAttachParent() != null)) {
      this.pMeshInstance.ExecuteAnimation(Math.fround(1 / 37));
    }
    if (this.Menu != null) {
      this.Menu.Execute$v();
    }
  }

  ClearPointers$pC4Object(pObj) {
    if (this.pMeshInstance != null) {
      this.pMeshInstance.ClearPointers(pObj);
    }
    if (this.pEffects != null) {
      this.pEffects.ClearPointers$pC4PropList(pObj);
    }
    if (this.Contained.op_eq$pC4Object(pObj)) {
      this.Contained.op_arrow().Contents.Remove(this);
      this.Contained.op_assign(null);
    }
    this.Contents.Remove(pObj);
    if (this.Action.Target.op_eq$pC4Object(pObj)) {
      this.Action.Target.op_assign(null);
    }
    if (this.Action.Target2.op_eq$pC4Object(pObj)) {
      this.Action.Target2.op_assign(null);
    }
    let cCom = null;
    for (cCom = this.Command; cCom != null; cCom = cCom.Next) {
      cCom.ClearPointers(pObj);
    }
    if (this.Menu != null) {
      this.Menu.ClearPointers(pObj);
    }
    if (this.Layer.op_eq$pC4Object(pObj)) {
      this.Layer.op_assign(null);
    }
    if (this.pGfxOverlay != null) {
      let pNextGfxOvrl = this.pGfxOverlay;
      let pGfxOvrl = null;
      while ((pGfxOvrl = pNextGfxOvrl) != null) {
        pNextGfxOvrl = pGfxOvrl.GetNext();
        if (pGfxOvrl.GetOverlayObject() === pObj) {
          this.RemoveGraphicsOverlay(pGfxOvrl.GetID());
        }
      }
    }
  }

  ExecMovement() {
    this.UpdateInMat();
    if (this.Contained.op_C4Object_() != null) {
      this.CopyMotion(this.Contained.op_C4Object_());
      return true;
    }
    if ((this.Category & 1) !== 0) {
      return false;
    }
    if (this.Mobile) {
      this.DoMovement();
      if (this.xdir.op_eq$i32(0) && this.ydir.op_eq$i32(0) && this.rdir.op_eq$i32(0)) {
        this.Mobile = false;
      }
      if (this.rdir.op_eq$i32(0)) {
        this.Stabilize();
      }
    } else {
      this.Stabilize();
      if ($.Game.iTick10 === 0) {
        this.xdir.$assign(this.ydir.$assign(this.rdir.op_assign(0)));
        this.Mobile = true;
      }
    }
    if (this.Def.Rotateable === 0) {
      this.fix_r.$assign($.Fix0$C4Real);
    }
    if (!$.Inside$i32$i32$i32$3(this.GetX() + this.Shape.GetX() | 0, -this.Shape.Wdt | 0, $.Landscape.GetWidth()) && !((this.GetPropertyInt(79 /*P_BorderBound*/) & 1) !== 0) || (this.GetY() + this.Shape.GetY() | 0) > $.Landscape.GetHeight() && !((this.GetPropertyInt(79 /*P_BorderBound*/) & 4) !== 0)) {
      let current_action = this.GetAction();
      if (current_action == null || this.Action.Target.op_not() || current_action.GetPropertyP(23 /*P_Procedure*/) !== 246) {
        let should_remove = true;
        if ((this.Category & 8192) !== 0) {
          const parallaxity_x = [0];
          const parallaxity_y = [0];
          this.GetParallaxity(P(parallaxity_x, 0), P(parallaxity_y, 0));
          should_remove = false;
          if (this.GetX() > $.Landscape.GetWidth() || this.GetY() > $.Landscape.GetHeight()) {
            should_remove = true;
          } else if (this.GetX() < 0 && !(parallaxity_x[0] === 0)) {
            should_remove = true;
          } else if (parallaxity_x[0] === 0 && this.GetX() < (-$.Landscape.GetWidth() | 0)) {
            should_remove = true;
          }
        }
        if (should_remove) {
          this.AssignDeath(true);
          this.AssignRemoval();
        }
      }
    }
    return true;
  }

  ExecAction() {
    let iTXDir = new $.C4Fixed();
    let lftspeed = new $.C4Fixed();
    let tydir = new $.C4Fixed();
    let iTargetX = 0;
    let iPushRange = 0;
    let iPushDistance = 0;
    let iPhaseAdvance = 1;
    if (!this.Mobile) {
      if (this.Def.UprightAttach !== 0) {
        if ($.Inside$i32$i32$i32$3(this.GetR(), -10, 10)) {
          this.Action.t_attach |= this.Def.UprightAttach;
          this.Mobile = true;
        }
      }
    }
    let pActionDef = this.GetAction();
    if (!((this.OCF & 64) >>> 0 !== 0) && this.Def.IncompleteActivity === 0 && pActionDef != null) {
      this.SetAction(null);
      pActionDef = null;
    }
    if (this.InLiquid) {
      if (pActionDef != null && pActionDef.GetPropertyStr(61 /*P_InLiquidAction*/) != null) {
        this.SetActionByName$pC4String$pC4Object$pC4Object$i32$b(pActionDef.GetPropertyStr(61 /*P_InLiquidAction*/));
        pActionDef = this.GetAction();
      }
    }
    if (pActionDef == null) {
      this.Action.t_attach = 0;
      if (this.Mobile) {
        $.DoGravity(this);
      }
      return;
    }
    let fWalk = new $.C4Fixed();
    let fMove = new $.C4Fixed();
    this.Action.Time = this.Action.Time + 1 | 0;
    let Attach = new $.C4Value().init$v();
    pActionDef.GetProperty(16 /*P_Attach*/, Attach);
    if (Attach.GetType() !== 0) {
      this.Action.t_attach = Attach.getInt();
    } else {
      switch (pActionDef.GetPropertyP(23 /*P_Procedure*/)) {
        case 238:
          if (this.Action.Dir === 0) {
            this.Action.t_attach = 1;
          }
          if (this.Action.Dir === 1) {
            this.Action.t_attach = 2;
          }
          break;
        case 239:
          this.Action.t_attach = 4;
          break;
        case 235:
        case 237:
        case 242:
        case 243:
        case 248:
        case 240:
          this.Action.t_attach = 8;
          break;
        default:
          this.Action.t_attach = 0;
      }
    }
    if (!(pActionDef.GetPropertyInt(59 /*P_ObjectDisabled*/) !== 0) && pActionDef.GetPropertyP(23 /*P_Procedure*/) !== 236 && !this.OnFire) {
      this.LastEnergyLossCausePlayer = -1;
    }
    let dir = this.Action.Dir;
    let accel = $.C4REAL100(pActionDef.GetPropertyInt(25 /*P_Accel*/));
    let decel = accel.$clone();
    {
      let decel_val = new $.C4Value().init$v();
      pActionDef.GetProperty(26 /*P_Decel*/, decel_val);
      if (decel_val.GetType() !== 0) {
        decel.$assign($.C4REAL100(decel_val.getInt()));
      }
    }
    let limit = $.C4REAL100(pActionDef.GetPropertyInt(24 /*P_Speed*/));
    switch (pActionDef.GetPropertyP(23 /*P_Procedure*/)) {
      case 235:
        switch (this.Action.ComDir) {
          case 7:
          case 8:
          case 6:
            if (dir === 1) {
              this.xdir.op_subAssign$C4Fixed(decel);
            } else {
              this.xdir.op_subAssign$C4Fixed(accel);
            }
            if (this.xdir.op_lt$C4Fixed(limit.op_neg())) {
              this.xdir.$assign(limit.op_neg());
            }
            break;
          case 3:
          case 2:
          case 4:
            if (dir === 0) {
              this.xdir.op_addAssign$C4Fixed(decel);
            } else {
              this.xdir.op_addAssign$C4Fixed(accel);
            }
            if (this.xdir.op_gt$C4Fixed(limit.op_pos())) {
              this.xdir.$assign(limit.op_pos());
            }
            break;
          case 0:
          case 1:
          case 5:
            if (this.xdir.op_lt$i32(0)) {
              this.xdir.op_addAssign$C4Fixed(decel);
            }
            if (this.xdir.op_gt$i32(0)) {
              this.xdir.op_subAssign$C4Fixed(decel);
            }
            if (this.xdir.op_gt$C4Fixed(decel.op_neg()) && this.xdir.op_lt$C4Fixed(decel.op_pos())) {
              this.xdir.op_assign(0);
            }
            break;
        }
        iPhaseAdvance = 0;
        if (this.xdir.op_lt$i32(0)) {
          if (dir !== 0) {
            this.SetDir(0);
            this.xdir.op_assign(-1);
          }
          iPhaseAdvance = -$.fixtoi$C4Fixed(this.xdir.op_mul$i32(10)) | 0;
        }
        if (this.xdir.op_gt$i32(0)) {
          if (dir !== 1) {
            this.SetDir(1);
            this.xdir.op_assign(1);
          }
          iPhaseAdvance = $.fixtoi$C4Fixed(this.xdir.op_mul$i32(10));
        }
        this.Mobile = true;
        if (this.Def.Rotateable !== 0 && this.Shape.AttachMat !== -1 && (!this.xdir.op_not() || this.Def.Shape.VtxX[this.Shape.iAttachVtx] !== 0)) {
          this.AdjustWalkRotation(20, 20, 100);
        } else {
          this.rdir.op_assign(0);
        }
        break;
      case 237:
        this.ydir.op_assign(0);
        this.Mobile = true;
        break;
      case 238:
        {
          let ComDir = this.Action.ComDir;
          if (this.Shape.CheckScaleToWalk(this.GetX(), this.GetY())) {
            $.ObjectActionWalk(this);
            return;
          }
          if (this.Action.Dir === 0 && ComDir === 7 || this.Action.Dir === 1 && ComDir === 3) {
            ComDir = 1;
          }
          switch (ComDir) {
            case 1:
            case 2:
            case 8:
              if (this.ydir.op_gt$i32(0)) {
                this.ydir.op_subAssign$C4Fixed(decel);
              } else {
                this.ydir.op_subAssign$C4Fixed(accel);
              }
              if (this.ydir.op_lt$C4Fixed(limit.op_neg())) {
                this.ydir.$assign(limit.op_neg());
              }
              break;
            case 5:
            case 4:
            case 6:
              if (this.ydir.op_lt$i32(0)) {
                this.ydir.op_addAssign$C4Fixed(decel);
              } else {
                this.ydir.op_addAssign$C4Fixed(accel);
              }
              if (this.ydir.op_gt$C4Fixed(limit.op_pos())) {
                this.ydir.$assign(limit.op_pos());
              }
              break;
            case 7:
            case 3:
            case 0:
              if (this.ydir.op_lt$i32(0)) {
                this.ydir.op_addAssign$C4Fixed(decel);
              }
              if (this.ydir.op_gt$i32(0)) {
                this.ydir.op_subAssign$C4Fixed(decel);
              }
              if (this.ydir.op_gt$C4Fixed(decel.op_neg()) && this.ydir.op_lt$C4Fixed(decel.op_pos())) {
                this.ydir.op_assign(0);
              }
              break;
          }
          iPhaseAdvance = 0;
          if (this.ydir.op_lt$i32(0)) {
            iPhaseAdvance = -$.fixtoi$C4Fixed(this.ydir.op_mul$i32(14)) | 0;
          }
          if (this.ydir.op_gt$i32(0)) {
            iPhaseAdvance = $.fixtoi$C4Fixed(this.ydir.op_mul$i32(14));
          }
          this.xdir.op_assign(0);
          this.Mobile = true;
          break;
        }
      case 239:
        switch (this.Action.ComDir) {
          case 7:
          case 8:
          case 6:
            if (this.xdir.op_gt$i32(0)) {
              this.xdir.op_subAssign$C4Fixed(decel);
            } else {
              this.xdir.op_subAssign$C4Fixed(accel);
            }
            if (this.xdir.op_lt$C4Fixed(limit.op_neg())) {
              this.xdir.$assign(limit.op_neg());
            }
            break;
          case 3:
          case 2:
          case 4:
            if (this.xdir.op_lt$i32(0)) {
              this.xdir.op_addAssign$C4Fixed(decel);
            } else {
              this.xdir.op_addAssign$C4Fixed(accel);
            }
            if (this.xdir.op_gt$C4Fixed(limit.op_pos())) {
              this.xdir.$assign(limit.op_pos());
            }
            break;
          case 1:
            if (this.Action.Dir === 0) {
              if (this.xdir.op_gt$i32(0)) {
                this.xdir.op_subAssign$C4Fixed(decel);
              } else {
                this.xdir.op_subAssign$C4Fixed(accel);
              }
            } else if (this.xdir.op_lt$i32(0)) {
              this.xdir.op_addAssign$C4Fixed(decel);
            } else {
              this.xdir.op_addAssign$C4Fixed(accel);
            }
            if (this.xdir.op_lt$C4Fixed(limit.op_neg())) {
              this.xdir.$assign(limit.op_neg());
            }
            if (this.xdir.op_gt$C4Fixed(limit.op_pos())) {
              this.xdir.$assign(limit.op_pos());
            }
            break;
          case 0:
          case 5:
            if (this.xdir.op_lt$i32(0)) {
              this.xdir.op_addAssign$C4Fixed(decel);
            }
            if (this.xdir.op_gt$i32(0)) {
              this.xdir.op_subAssign$C4Fixed(decel);
            }
            if (this.xdir.op_gt$C4Fixed(decel.op_neg()) && this.xdir.op_lt$C4Fixed(decel.op_pos())) {
              this.xdir.op_assign(0);
            }
            break;
        }
        iPhaseAdvance = 0;
        if (this.xdir.op_lt$i32(0)) {
          iPhaseAdvance = -$.fixtoi$C4Fixed(this.xdir.op_mul$i32(10)) | 0;
          this.SetDir(0);
        }
        if (this.xdir.op_gt$i32(0)) {
          iPhaseAdvance = $.fixtoi$C4Fixed(this.xdir.op_mul$i32(10));
          this.SetDir(1);
        }
        this.ydir.op_assign(0);
        this.Mobile = true;
        break;
      case 236:
        if ($.Game.iTick10 === 0) {
          if (this.Contained.op_C4Object_() != null) {
            $.StopActionDelayCommand(this);
            this.SetCommand$i32$pC4Object$i32$i32$pC4Object$b$C4Value$i32$pC4String(4);
          }
        }
        switch (this.Action.ComDir) {
          case 7:
          case 8:
          case 6:
            this.xdir.op_subAssign$C4Fixed($maxBy($minBy(limit.op_add$C4Fixed(this.xdir), this.xdir.op_gt$i32(0) ? decel : accel, (x, y) => x.op_lt$C4Fixed(y)), $.itofix$i32(0), (x, y) => x.op_lt$C4Fixed(y)));
            break;
          case 3:
          case 2:
          case 4:
            this.xdir.op_addAssign$C4Fixed($maxBy($minBy(limit.op_sub$C4Fixed(this.xdir), this.xdir.op_lt$i32(0) ? decel : accel, (x, y) => x.op_lt$C4Fixed(y)), $.itofix$i32(0), (x, y) => x.op_lt$C4Fixed(y)));
            break;
        }
        $.DoGravity(this);
        this.Mobile = true;
        break;
      case 240:
        {
          const smpx = [this.GetX()];
          const smpy = [this.GetY()];
          let fAttachOK = false;
          if ((this.Action.t_attach & 8) !== 0 && this.Shape.Attach(P(smpx, 0), P(smpy, 0), 8)) {
            fAttachOK = true;
          } else if ((this.Action.t_attach & 1) !== 0 && this.Shape.Attach(P(smpx, 0), P(smpy, 0), 1)) {
            fAttachOK = true;
          } else if ((this.Action.t_attach & 2) !== 0 && this.Shape.Attach(P(smpx, 0), P(smpy, 0), 2)) {
            fAttachOK = true;
          } else if ((this.Action.t_attach & 4) !== 0 && this.Shape.Attach(P(smpx, 0), P(smpy, 0), 4)) {
            fAttachOK = true;
          }
          if (!fAttachOK) {
            $.ObjectComStopDig(this);
            return;
          }
          iPhaseAdvance = $.fixtoi$C4Fixed($.itofix$i32(40).op_mul$C4Fixed(limit));
          if (this.xdir.op_lt$i32(0)) {
            this.SetDir(0);
          } else if (this.xdir.op_gt$i32(0)) {
            this.SetDir(1);
          }
          this.Action.t_attach = 0;
          this.Mobile = true;
          break;
        }
      case 241:
        switch (this.Action.ComDir) {
          case 1:
            this.ydir.op_subAssign$C4Fixed(accel);
            break;
          case 2:
            this.ydir.op_subAssign$C4Fixed(accel);
            this.xdir.op_addAssign$C4Fixed(accel);
            break;
          case 3:
            this.xdir.op_addAssign$C4Fixed(accel);
            break;
          case 4:
            this.ydir.op_addAssign$C4Fixed(accel);
            this.xdir.op_addAssign$C4Fixed(accel);
            break;
          case 5:
            this.ydir.op_addAssign$C4Fixed(accel);
            break;
          case 6:
            this.ydir.op_addAssign$C4Fixed(accel);
            this.xdir.op_subAssign$C4Fixed(accel);
            break;
          case 7:
            this.xdir.op_subAssign$C4Fixed(accel);
            break;
          case 8:
            this.ydir.op_subAssign$C4Fixed(accel);
            this.xdir.op_subAssign$C4Fixed(accel);
            break;
          case 0:
            if (this.xdir.op_lt$i32(0)) {
              this.xdir.op_addAssign$C4Fixed(decel);
            }
            if (this.xdir.op_gt$i32(0)) {
              this.xdir.op_subAssign$C4Fixed(decel);
            }
            if (this.xdir.op_gt$C4Fixed(decel.op_neg()) && this.xdir.op_lt$C4Fixed(decel.op_pos())) {
              this.xdir.op_assign(0);
            }
            if (this.ydir.op_lt$i32(0)) {
              this.ydir.op_addAssign$C4Fixed(decel);
            }
            if (this.ydir.op_gt$i32(0)) {
              this.ydir.op_subAssign$C4Fixed(decel);
            }
            if (this.ydir.op_gt$C4Fixed(decel.op_neg()) && this.ydir.op_lt$C4Fixed(decel.op_pos())) {
              this.ydir.op_assign(0);
            }
            break;
        }
        if (!this.InLiquid) {
          if ($.GBackLiquid(this.GetX(), ((this.GetY() + 1 | 0) + (Math.imul(this.Def.Float, this.Con) / 100000 | 0) | 0) - 1 | 0)) {
            this.ydir.$assign(accel.op_pos());
          } else {
            $.ObjectActionWalk(this);
            return;
          }
        }
        if (this.Action.ComDir !== -1) {
          this.ydir.$assign($.Clamp$C4Fixed$C4Fixed$C4Fixed(this.ydir.$clone(), limit.op_neg(), limit.$clone()));
          this.xdir.$assign($.Clamp$C4Fixed$C4Fixed$C4Fixed(this.xdir.$clone(), limit.op_neg(), limit.$clone()));
        }
        if (!$.GBackLiquid(this.GetX(), ((this.GetY() - 1 | 0) + (Math.imul(this.Def.Float, this.Con) / 100000 | 0) | 0) - 1 | 0)) {
          if (this.ydir.op_lt$i32(0)) {
            this.ydir.op_assign(0);
          }
        }
        if (this.xdir.op_lt$i32(0)) {
          this.SetDir(0);
        }
        if (this.xdir.op_gt$i32(0)) {
          this.SetDir(1);
        }
        iPhaseAdvance = $.fixtoi$C4Fixed(limit.op_mul$i32(10));
        this.Mobile = true;
        break;
      case 242:
        this.Mobile = true;
        break;
      case 243:
        if (this.Action.Target.op_not()) {
          $.StopActionDelayCommand(this);
          return;
        }
        if (this.Contained.op_eq$C4ObjectPtr(this.Action.Target)) {
          $.StopActionDelayCommand(this);
          return;
        }
        let fStraighten = false;
        iTXDir.op_assign(0);
        fStraighten = false;
        switch (this.Action.ComDir) {
          case 7:
          case 6:
            iTXDir.$assign(limit.op_neg());
            break;
          case 8:
            fStraighten = true;
            iTXDir.$assign(limit.op_neg());
            break;
          case 3:
          case 4:
            iTXDir.$assign(limit.op_pos());
            break;
          case 2:
            fStraighten = true;
            iTXDir.$assign(limit.op_pos());
            break;
          case 1:
            fStraighten = true;
            break;
          case 0:
          case 5:
            iTXDir.op_assign(0);
            break;
        }
        if (!this.Action.Target.op_arrow().Push(iTXDir.$clone(), accel.$clone(), fStraighten)) {
          $.StopActionDelayCommand(this);
          return;
        }
        this.Action.Target.op_arrow().Controller = this.Controller;
        iPushDistance = $max((this.Shape.Wdt / 2 | 0) - 8 | 0, 0);
        iPushRange = iPushDistance + 10 | 0;
        const sax = [0];
        const say = [0];
        const sawdt = [0];
        const sahgt = [0];
        this.Action.Target.op_arrow().GetArea(P(sax, 0), P(say, 0), P(sawdt, 0), P(sahgt, 0));
        if (!$.Inside$i32$i32$i32$3(this.GetX() - sax[0] | 0, -iPushRange | 0, (sawdt[0] - 1 | 0) + iPushRange | 0) || !$.Inside$i32$i32$i32$3(this.GetY() - say[0] | 0, -iPushRange | 0, (sahgt[0] - 1 | 0) + iPushRange | 0)) {
          let prev_target = this.Action.Target.op_C4Object_();
          $.StopActionDelayCommand(this);
          $.GrabLost(this, prev_target);
          return;
        }
        if ((this.GetY() - iPushDistance | 0) > (say[0] + sahgt[0] | 0) && iTXDir.op_bool()) {
          if (iTXDir.op_gt$i32(0)) {
            sax[0] = sax[0] + (sawdt[0] / 2 | 0) | 0;
          }
          sawdt[0] = sawdt[0] / 2 | 0;
        }
        iTargetX = $.Clamp$i32$i32$i32(this.GetX(), sax[0] - iPushDistance | 0, ((sax[0] + sawdt[0] | 0) - 1 | 0) + iPushDistance | 0);
        if (this.GetX() === iTargetX) {
          this.xdir.op_assign(0);
        } else {
          if (this.GetX() < iTargetX) {
            this.xdir.$assign(limit.op_pos());
          } else if (this.GetX() > iTargetX) {
            this.xdir.$assign(limit.op_neg());
          }
        }
        iPhaseAdvance = 0;
        if (this.xdir.op_lt$i32(0)) {
          iPhaseAdvance = -$.fixtoi$C4Fixed(this.xdir.op_mul$i32(10)) | 0;
          this.SetDir(0);
        }
        if (this.xdir.op_gt$i32(0)) {
          iPhaseAdvance = $.fixtoi$C4Fixed(this.xdir.op_mul$i32(10));
          this.SetDir(1);
        }
        this.ydir.op_assign(0);
        this.Mobile = true;
        break;
      case 248:
        if (this.Action.Target.op_not()) {
          $.StopActionDelayCommand(this);
          return;
        }
        if (this.Contained.op_eq$C4ObjectPtr(this.Action.Target)) {
          $.StopActionDelayCommand(this);
          return;
        }
        if (this.Action.Target.op_arrow().Contained.op_C4Object_() != null) {
          $.StopActionDelayCommand(this);
          return;
        }
        let iPullDistance = 0;
        let iPullX = 0;
        iPullDistance = (this.Action.Target.op_arrow().Shape.Wdt / 2 | 0) + (this.Shape.Wdt / 2 | 0) | 0;
        iTargetX = this.GetX();
        if (this.Action.ComDir === 3) {
          iTargetX = this.Action.Target.op_arrow().GetX() + iPullDistance | 0;
        }
        if (this.Action.ComDir === 7) {
          iTargetX = this.Action.Target.op_arrow().GetX() - iPullDistance | 0;
        }
        iPullX = this.Action.Target.op_arrow().GetX();
        if (this.Action.ComDir === 3) {
          iPullX = this.GetX() - iPullDistance | 0;
        }
        if (this.Action.ComDir === 7) {
          iPullX = this.GetX() + iPullDistance | 0;
        }
        fWalk.$assign(limit);
        fMove.op_assign(0);
        if (this.Action.ComDir === 3) {
          fMove.$assign(fWalk.op_pos());
        }
        if (this.Action.ComDir === 7) {
          fMove.$assign(fWalk.op_neg());
        }
        iTXDir.$assign(fMove.op_add$C4Fixed(fWalk.op_mul$i32($.Clamp$i32$i32$i32(iPullX - this.Action.Target.op_arrow().GetX() | 0, -10, 10)).op_div$i32(10)));
        if (!this.Action.Target.op_arrow().Push(iTXDir.$clone(), accel.$clone(), false)) {
          $.StopActionDelayCommand(this);
          return;
        }
        this.Action.Target.op_arrow().Controller = this.Controller;
        if (this.Action.Target.op_arrow().GetProcedure() === 235 || this.Action.Target.op_arrow().GetProcedure() === 248) {
          this.Action.Target.op_arrow().Action.ComDir = 0;
          if (iTXDir.op_lt$i32(0)) {
            this.Action.Target.op_arrow().Action.ComDir = 7;
          }
          if (iTXDir.op_gt$i32(0)) {
            this.Action.Target.op_arrow().Action.ComDir = 3;
          }
        }
        iPushDistance = $max((this.Shape.Wdt / 2 | 0) - 8 | 0, 0);
        iPushRange = iPushDistance + 20 | 0;
        this.Action.Target.op_arrow().GetArea(P(sax, 0), P(say, 0), P(sawdt, 0), P(sahgt, 0));
        if (!$.Inside$i32$i32$i32$3(this.GetX() - sax[0] | 0, -iPushRange | 0, (sawdt[0] - 1 | 0) + iPushRange | 0) || !$.Inside$i32$i32$i32$3(this.GetY() - say[0] | 0, -iPushRange | 0, (sahgt[0] - 1 | 0) + iPushRange | 0)) {
          let prev_target = this.Action.Target.op_C4Object_();
          $.StopActionDelayCommand(this);
          $.GrabLost(this, prev_target);
          this.Action.Target.op_assign(null);
          return;
        }
        this.xdir.$assign(fMove.op_add$C4Fixed(fWalk.op_mul$i32($.Clamp$i32$i32$i32(iTargetX - this.GetX() | 0, -10, 10)).op_div$i32(10)));
        iPhaseAdvance = 0;
        if (this.xdir.op_lt$i32(0)) {
          iPhaseAdvance = -$.fixtoi$C4Fixed(this.xdir.op_mul$i32(10)) | 0;
          this.SetDir(0);
        }
        if (this.xdir.op_gt$i32(0)) {
          iPhaseAdvance = $.fixtoi$C4Fixed(this.xdir.op_mul$i32(10));
          this.SetDir(1);
        }
        this.ydir.op_assign(0);
        this.Mobile = true;
        break;
      case 244:
        if (this.Action.Target.op_not()) {
          this.SetAction(null);
          return;
        }
        lftspeed.$assign($.itofix$i32(2));
        tydir.op_assign(0);
        switch (this.Action.ComDir) {
          case 1:
            tydir.$assign(lftspeed.op_neg());
            break;
          case 0:
            tydir.$assign($.Landscape.GetGravity().op_neg());
            break;
          case 5:
            tydir.$assign(lftspeed.op_pos());
            break;
        }
        if (!this.Action.Target.op_arrow().Lift(tydir.$clone(), $.C4REAL100(50))) {
          this.SetAction(null);
          return;
        }
        if (this.Def.LiftTop !== 0) {
          if (this.Action.Target.op_arrow().GetY() <= (this.GetY() + this.Def.LiftTop | 0)) {
            if (this.Action.ComDir === 1) {
              this.Call$pi8$pC4AulParSet$b(S("~LiftTop"));
            }
          }
        }
        $.DoGravity(this);
        break;
      case 245:
        switch (this.Action.ComDir) {
          case 1:
            this.ydir.op_subAssign$C4Fixed(accel);
            if (this.xdir.op_lt$i32(0)) {
              this.xdir.op_addAssign$C4Fixed(decel);
            }
            if (this.xdir.op_gt$i32(0)) {
              this.xdir.op_subAssign$C4Fixed(decel);
            }
            if (this.xdir.op_gt$C4Fixed(decel.op_neg()) && this.xdir.op_lt$C4Fixed(decel.op_pos())) {
              this.xdir.op_assign(0);
            }
            break;
          case 2:
            this.ydir.op_subAssign$C4Fixed(accel);
            this.xdir.op_addAssign$C4Fixed(accel);
            break;
          case 3:
            this.xdir.op_addAssign$C4Fixed(accel);
            if (this.ydir.op_lt$i32(0)) {
              this.ydir.op_addAssign$C4Fixed(decel);
            }
            if (this.ydir.op_gt$i32(0)) {
              this.ydir.op_subAssign$C4Fixed(decel);
            }
            if (this.ydir.op_gt$C4Fixed(decel.op_neg()) && this.ydir.op_lt$C4Fixed(decel.op_pos())) {
              this.ydir.op_assign(0);
            }
            break;
          case 4:
            this.ydir.op_addAssign$C4Fixed(accel);
            this.xdir.op_addAssign$C4Fixed(accel);
            break;
          case 5:
            this.ydir.op_addAssign$C4Fixed(accel);
            if (this.xdir.op_lt$i32(0)) {
              this.xdir.op_addAssign$C4Fixed(decel);
            }
            if (this.xdir.op_gt$i32(0)) {
              this.xdir.op_subAssign$C4Fixed(decel);
            }
            if (this.xdir.op_gt$C4Fixed(decel.op_neg()) && this.xdir.op_lt$C4Fixed(decel.op_pos())) {
              this.xdir.op_assign(0);
            }
            break;
          case 6:
            this.ydir.op_addAssign$C4Fixed(accel);
            this.xdir.op_subAssign$C4Fixed(accel);
            break;
          case 7:
            this.xdir.op_subAssign$C4Fixed(accel);
            if (this.ydir.op_lt$i32(0)) {
              this.ydir.op_addAssign$C4Fixed(decel);
            }
            if (this.ydir.op_gt$i32(0)) {
              this.ydir.op_subAssign$C4Fixed(decel);
            }
            if (this.ydir.op_gt$C4Fixed(decel.op_neg()) && this.ydir.op_lt$C4Fixed(decel.op_pos())) {
              this.ydir.op_assign(0);
            }
            break;
          case 8:
            this.ydir.op_subAssign$C4Fixed(accel);
            this.xdir.op_subAssign$C4Fixed(accel);
            break;
          case 0:
            if (this.xdir.op_lt$i32(0)) {
              this.xdir.op_addAssign$C4Fixed(decel);
            }
            if (this.xdir.op_gt$i32(0)) {
              this.xdir.op_subAssign$C4Fixed(decel);
            }
            if (this.xdir.op_gt$C4Fixed(decel.op_neg()) && this.xdir.op_lt$C4Fixed(decel.op_pos())) {
              this.xdir.op_assign(0);
            }
            if (this.ydir.op_lt$i32(0)) {
              this.ydir.op_addAssign$C4Fixed(decel);
            }
            if (this.ydir.op_gt$i32(0)) {
              this.ydir.op_subAssign$C4Fixed(decel);
            }
            if (this.ydir.op_gt$C4Fixed(decel.op_neg()) && this.ydir.op_lt$C4Fixed(decel.op_pos())) {
              this.ydir.op_assign(0);
            }
            break;
        }
        if (this.Action.ComDir !== -1) {
          this.ydir.$assign($.Clamp$C4Fixed$C4Fixed$C4Fixed(this.ydir.$clone(), limit.op_neg(), limit.$clone()));
          this.xdir.$assign($.Clamp$C4Fixed$C4Fixed$C4Fixed(this.xdir.$clone(), limit.op_neg(), limit.$clone()));
        }
        this.Mobile = true;
        break;
      case 246:
        if (this.Action.Target.op_not()) {
          if (this.Status !== 0) {
            this.SetAction(null);
            this.Call$pi8$pC4AulParSet$b(S("~AttachTargetLost"));
          }
          return;
        }
        if (!((this.Action.Target.op_arrow().OCF & 64) >>> 0 !== 0)) {
          if (!(this.Action.Target.op_arrow().Def.IncompleteActivity !== 0)) {
            this.SetAction(null);
            return;
          }
        }
        if (this.Action.Target.op_arrow().Contained.op_ne$C4ObjectPtr(this.Contained)) {
          if (this.Action.Target.op_arrow().Contained.op_C4Object_() != null) {
            this.Enter(this.Action.Target.op_arrow().Contained.op_C4Object_());
          } else {
            this.Exit(this.GetX(), this.GetY(), this.GetR());
          }
        }
        if (this.Action.Target.op_not()) {
          break;
        }
        this.MovePosition$C4Fixed$C4Fixed(this.Action.Target.op_arrow().fix_x.op_add$i32(this.Action.Target.op_arrow().Shape.VtxX[this.Action.Data & 255]).op_sub$i32(this.Shape.VtxX[this.Action.Data >> 8]).op_sub$C4Fixed(this.fix_x), this.Action.Target.op_arrow().fix_y.op_add$i32(this.Action.Target.op_arrow().Shape.VtxY[this.Action.Data & 255]).op_sub$i32(this.Shape.VtxY[this.Action.Data >> 8]).op_sub$C4Fixed(this.fix_y));
        this.xdir.$assign(this.ydir.op_assign(0));
        break;
      case 247:
        {
          let fBroke = false;
          let fLineChange = false;
          if (this.Action.Target.op_not() || this.Action.Target.op_arrow().Con < 100000) {
            fBroke = true;
          }
          if (this.Action.Target2.op_not() || this.Action.Target2.op_arrow().Con < 100000) {
            fBroke = true;
          }
          if (fBroke) {
            this.Call$pi8$pC4AulParSet$b(S("~OnLineBreak"), new $.C4AulParSet().init$mb(true).op_and());
            this.AssignRemoval();
            return;
          }
          let lineAttachV = new $.C4Value().init$v();
          let lineAttach = null;
          this.Action.Target.op_arrow().GetProperty(20 /*P_LineAttach*/, lineAttachV);
          lineAttach = lineAttachV.getArray();
          let iConnectX1 = 0;
          let iConnectY1 = 0;
          iConnectX1 = this.Action.Target.op_arrow().GetX();
          iConnectY1 = this.Action.Target.op_arrow().GetY();
          if (lineAttach != null) {
            iConnectX1 = iConnectX1 + lineAttach.GetItem(0).getInt() | 0;
            iConnectY1 = iConnectY1 + lineAttach.GetItem(1).getInt() | 0;
          }
          if (iConnectX1 !== this.Shape.VtxX[0] || iConnectY1 !== this.Shape.VtxY[0]) {
            if (this.Def.LineIntersect === 0) {
              if (!this.Shape.LineConnect(iConnectX1, iConnectY1, 0, 1, this.Shape.VtxX[0], this.Shape.VtxY[0])) {
                fBroke = true;
              }
            }
            if (this.Def.LineIntersect === 1) {
              this.Shape.VtxX[0] = iConnectX1;
              this.Shape.VtxY[0] = iConnectY1;
            }
            fLineChange = true;
          }
          this.Action.Target2.op_arrow().GetProperty(20 /*P_LineAttach*/, lineAttachV);
          lineAttach = lineAttachV.getArray();
          let iConnectX2 = 0;
          let iConnectY2 = 0;
          iConnectX2 = this.Action.Target2.op_arrow().GetX();
          iConnectY2 = this.Action.Target2.op_arrow().GetY();
          if (lineAttach != null) {
            iConnectX2 = iConnectX2 + lineAttach.GetItem(0).getInt() | 0;
            iConnectY2 = iConnectY2 + lineAttach.GetItem(1).getInt() | 0;
          }
          if (iConnectX2 !== this.Shape.VtxX[this.Shape.VtxNum - 1 | 0] || iConnectY2 !== this.Shape.VtxY[this.Shape.VtxNum - 1 | 0]) {
            if (this.Def.LineIntersect === 0) {
              if (!this.Shape.LineConnect(iConnectX2, iConnectY2, this.Shape.VtxNum - 1 | 0, -1, this.Shape.VtxX[this.Shape.VtxNum - 1 | 0], this.Shape.VtxY[this.Shape.VtxNum - 1 | 0])) {
                fBroke = true;
              }
            }
            if (this.Def.LineIntersect === 1) {
              this.Shape.VtxX[this.Shape.VtxNum - 1 | 0] = iConnectX2;
              this.Shape.VtxY[this.Shape.VtxNum - 1 | 0] = iConnectY2;
            }
            fLineChange = true;
          }
          if (fBroke) {
            this.Call$pi8$pC4AulParSet$b(S("~OnLineBreak"), null);
            this.AssignRemoval();
            return;
          }
          if ($.Game.iTick35 === 0) {
            if ($.ReduceLineSegments(this.Shape, $.Game.iTick2 === 0)) {
              fLineChange = true;
            }
          }
          if (fLineChange) {
            this.Call$pi8$pC4AulParSet$b(S("~OnLineChange"));
          }
        }
        break;
      default:
        if (this.Action.t_attach !== 0) {
          this.xdir.$assign(this.ydir.op_assign(0));
          this.Mobile = true;
        } else {
          $.DoGravity(this);
        }
        break;
    }
    if (pActionDef.GetPropertyInt(30 /*P_Delay*/) !== 0) {
      this.Action.PhaseDelay = this.Action.PhaseDelay + iPhaseAdvance | 0;
      if (this.Action.PhaseDelay >= pActionDef.GetPropertyInt(30 /*P_Delay*/)) {
        this.Action.PhaseDelay = 0;
        this.Action.Phase = this.Action.Phase + pActionDef.GetPropertyInt(64 /*P_Step*/) | 0;
        if (pActionDef.GetPropertyStr(57 /*P_PhaseCall*/) != null) {
          this.Call$pi8$pC4AulParSet$b(pActionDef.GetPropertyStr(57 /*P_PhaseCall*/).GetCStr());
        }
        if (this.Action.Phase >= pActionDef.GetPropertyInt(29 /*P_Length*/)) {
          let next_action = pActionDef.GetPropertyStr(50 /*P_NextAction*/);
          if (next_action == null) {
            this.Action.Phase = 0;
          } else if (next_action === $oat($.Strings.P, 51 /*P_Hold*/)) {
            this.Action.Phase = pActionDef.GetPropertyInt(29 /*P_Length*/) - 1 | 0;
            this.Action.PhaseDelay = pActionDef.GetPropertyInt(30 /*P_Delay*/) - 1 | 0;
          } else {
            this.SetActionByName$pC4String$pC4Object$pC4Object$i32$b(next_action, null, null, 3);
          }
        }
      }
    }
    return;
  }

  ExecLife() {
    if ($.Game.iTick5 === 0) {
      if (this.Alive && this.Def.NoBreath === 0) {
        let Breathe = false;
        if ($.GBackMat(this.GetX(), this.GetY() + (this.Shape.GetY() / 2 | 0) | 0) === $.MVehic) {
          Breathe = true;
        } else if (this.GetPropertyInt(69 /*P_BreatheWater*/) !== 0) {
          if ($.GBackMat(this.GetX(), this.GetY()) === $.MWater) {
            Breathe = true;
          }
        } else {
          if (!$.GBackSemiSolid(this.GetX(), this.GetY() + (this.Shape.GetY() / 2 | 0) | 0)) {
            Breathe = true;
          }
        }
        if (this.Contained.op_C4Object_() != null) {
          Breathe = true;
        }
        if (!Breathe) {
          if (this.Breath > 0) {
            this.DoBreath(-5);
          } else {
            this.DoEnergy(-1, false, 37, -1);
          }
        } else {
          let takebreath = this.GetPropertyInt(72 /*P_MaxBreath*/) - this.Breath | 0;
          if (takebreath > 0) {
            this.DoBreath(takebreath);
          }
        }
      }
    }
    if ($.Game.iTick10 === 0) {
      if (this.Alive) {
        if (this.InMat !== -1) {
          if ($oidx($.MaterialMap.Map, this.InMat).Corrosive !== 0) {
            if (!(this.GetPropertyInt(70 /*P_CorrosionResist*/) !== 0)) {
              this.DoEnergy((-$oidx($.MaterialMap.Map, this.InMat).Corrosive | 0) / 15 | 0, false, 38, -1);
            }
          }
        }
      }
    }
    if ($.Game.iTick10 === 0) {
      if (this.InMat !== -1) {
        if ($oidx($.MaterialMap.Map, this.InMat).Incendiary !== 0) {
          if (this.GetPropertyInt(86 /*P_ContactIncinerate*/) > 0 || this.GetPropertyBool(87 /*P_MaterialIncinerate*/) > 0) {
            this.Call$pi8$pC4AulParSet$b(S("OnInIncendiaryMaterial"), new $.C4AulParSet().init$v().op_and());
          }
        }
      }
    }
    if ($.Game.iTick255 === 0) {
      if (this.Alive) {
        if (this.Info != null) {
          let iPlayingTime = this.Info.TotalPlayingTime + ($.Game.Time - this.Info.InActionTime | 0) | 0;
          let iNewAge = (iPlayingTime / 3600 | 0) / 5 | 0;
          if (this.Info.Age !== iNewAge && this.Info.Age !== 0) {
            $.GameMsgObject($.FormatString($.LoadResStr(S("IDS_OBJ_BIRTHDAY")), this.GetName(), (this.Info.TotalPlayingTime / 3600 | 0) / 5 | 0).getData(), this);
            $.StartSoundEffect(S("UI::Trumpet"), false, 100, this);
          }
          this.Info.Age = iNewAge;
        }
      }
    }
    return true;
  }

  ExecuteCommand() {
    if (this.Command != null) {
      this.Command.Execute();
    }
    if (this.Command != null && this.Command.Finished !== 0) {
      this.Call$pi8$pC4AulParSet$b(S("~ControlCommandFinished"), new $.C4AulParSet().init$mpi8$rC4ObjectPtr$rC4Value$ri32$rC4ObjectPtr$rC4Value($.CommandName(this.Command.Command), this.Command.Target, this.Command.Tx, P(this.Command, "Ty"), this.Command.Target2, this.Command.Data).op_and());
    }
    while (this.Command != null && this.Command.Finished !== 0) {
      this.ClearCommand(this.Command);
    }
    return true;
  }

  AssignDeath(fForced) {
    let thing = null;
    if (!this.Alive) {
      return;
    }
    const iDeathCausingPlayer = [this.LastEnergyLossCausePlayer];
    this.Alive = false;
    if (this.pEffects != null) {
      this.pEffects.ClearAll(4);
    }
    if (this.Alive && !fForced) {
      return;
    }
    this.SetActionByName$pi8$pC4Object$pC4Object$i32$b(S("Dead"));
    this.Alive = false;
    this.ClearCommands();
    let pInfo = this.Info;
    if (this.Info != null) {
      this.Info.HasDied = true;
      this.Info.DeathCount = this.Info.DeathCount + 1 | 0;
      this.Info.Retire();
    }
    let pPlr = $.Players.Get(this.Owner);
    if (pPlr != null) {
      pPlr.ClearPointers(this, true);
    }
    this.SetLightRange(0, 0);
    let pars = new $.C4AulParSet().init$ri32(P(iDeathCausingPlayer, 0));
    this.Call$pi8$pC4AulParSet$b(S("~Death"), pars.op_and());
    while ((thing = this.Contents.GetObject()) != null) {
      thing.Exit(thing.GetX(), thing.GetY());
    }
    this.SetOCF();
    if (pPlr != null) {
      if (!(pPlr.Crew.ObjectCount() !== 0)) {
        $.Game.GRBroadcast(S("~RelaunchPlayer"), new $.C4AulParSet().init$ri32$ri32$mpC4Object(P(this, "Owner"), P(iDeathCausingPlayer, 0), this.Status !== 0 ? this : null).op_and());
      }
    }
    if (pInfo != null) {
      pInfo.HasDied = false;
    }
  }

  ContactAction() {
    let pActionDef = this.GetAction();
    if (pActionDef == null) {
      return;
    }
    let iProcedure = pActionDef.GetPropertyP(23 /*P_Procedure*/);
    let fDisabled = pActionDef.GetPropertyInt(59 /*P_ObjectDisabled*/);
    if ((this.t_contact & 8) >>> 0 !== 0) {
      switch (iProcedure) {
        case 236:
          if (this.ydir.op_lt$i32(0)) {
            return;
          }
          if ((this.OCF & 65536) >>> 0 !== 0 || fDisabled !== 0) {
            if ($.ObjectActionFlat(this, this.Action.Dir)) {
              return;
            }
          }
          if ((this.OCF & 8192) >>> 0 !== 0) {
            if ($.ObjectActionKneel(this)) {
              return;
            }
          }
          $.ObjectActionWalk(this);
          this.ydir.op_assign(0);
          return;
        case 238:
          if ($.ComDirLike(this.Action.ComDir, 5)) {
            $.ObjectActionStand(this);
            return;
          }
          break;
        case 240:
          break;
        case 241:
          if (!$.GBackSemiSolid(this.GetX(), ((this.GetY() - 1 | 0) + (Math.imul(this.Def.Float, this.Con) / 100000 | 0) | 0) - 1 | 0)) {
            if ($.ObjectActionCornerScale(this)) {
              return;
            }
          }
          break;
      }
    }
    if ((this.t_contact & 4) >>> 0 !== 0) {
      switch (iProcedure) {
        case 235:
          $.ObjectActionStand(this);
          return;
        case 238:
          if ($.ComDirLike(this.Action.ComDir, 1)) {
            if ($.ObjectActionHangle(this)) {
              this.SetDir(this.Action.Dir === 0 ? 1 : 0);
              return;
            }
            this.Action.ComDir = 0;
          }
          break;
        case 236:
          if ((this.OCF & 8192) >>> 0 !== 0 || fDisabled !== 0) {
            $.ObjectActionTumble(this, this.Action.Dir, this.xdir.$clone(), this.ydir.$clone());
            break;
          }
          if ($.ObjectActionHangle(this)) {
            return;
          }
          break;
        case 240:
          break;
        case 239:
          this.Action.ComDir = 0;
          break;
      }
    }
    if ((this.t_contact & 1) >>> 0 !== 0) {
      switch (iProcedure) {
        case 236:
          if ((this.OCF & 8192) >>> 0 !== 0 || fDisabled !== 0) {
            $.ObjectActionTumble(this, 0, this.xdir.$clone(), this.ydir.$clone());
            break;
          } else if (!$.ComDirLike(this.Action.ComDir, 3) && $.ObjectActionScale(this, 0)) {
            return;
          }
          break;
        case 235:
          if ($.ComDirLike(this.Action.ComDir, 7)) {
            if ($.ObjectActionScale(this, 0)) {
              this.ydir.$assign($.C4REAL100(-1));
              return;
            }
          }
          if ($.ComDirLike(this.Action.ComDir, 3)) {
            $.ObjectActionJump(this, this.xdir.op_div$i32(2), this.ydir.$clone(), false);
          }
          return;
        case 241:
          if (!$.GBackSemiSolid(this.GetX(), ((this.GetY() - 1 | 0) + (Math.imul(this.Def.Float, this.Con) / 100000 | 0) | 0) - 1 | 0)) {
            if ($.ComDirLike(this.Action.ComDir, 7)) {
              if ($.ObjectActionScale(this, 0)) {
                return;
              }
            }
            if ($.ObjectActionCornerScale(this)) {
              return;
            }
          }
          return;
        case 239:
          if ($.ObjectActionScale(this, 0)) {
            this.ydir.$assign($.C4REAL100(1));
            return;
          }
          return;
        case 240:
          break;
      }
    }
    if ((this.t_contact & 2) >>> 0 !== 0) {
      switch (iProcedure) {
        case 236:
          if ((this.OCF & 8192) >>> 0 !== 0 || fDisabled !== 0) {
            $.ObjectActionTumble(this, 1, this.xdir.$clone(), this.ydir.$clone());
            break;
          } else if (!$.ComDirLike(this.Action.ComDir, 7) && $.ObjectActionScale(this, 1)) {
            return;
          }
          break;
        case 235:
          if ($.ComDirLike(this.Action.ComDir, 3)) {
            if ($.ObjectActionScale(this, 1)) {
              this.ydir.$assign($.C4REAL100(-1));
              return;
            }
          }
          if ($.ComDirLike(this.Action.ComDir, 7)) {
            $.ObjectActionJump(this, this.xdir.op_div$i32(2), this.ydir.$clone(), false);
          }
          return;
        case 241:
          if (!$.GBackSemiSolid(this.GetX(), ((this.GetY() - 1 | 0) + (Math.imul(this.Def.Float, this.Con) / 100000 | 0) | 0) - 1 | 0)) {
            if ($.ComDirLike(this.Action.ComDir, 3)) {
              if ($.ObjectActionScale(this, 1)) {
                return;
              }
            }
            if ($.ObjectActionCornerScale(this)) {
              return;
            }
          }
          return;
        case 239:
          if ($.ObjectActionScale(this, 1)) {
            this.ydir.$assign($.C4REAL100(1));
            return;
          }
          return;
        case 240:
          break;
      }
    }
    if (iProcedure === 236) {
      if (this.ydir.op_not()) {
        let fAllowDown = !((this.t_contact & 8) >>> 0 !== 0) ? 1 : 0;
        if ((this.t_contact & 2) >>> 0 !== 0) {
          this.ForcePosition(this.fix_x.op_sub$i32(1), this.fix_y.op_add$i32(fAllowDown));
          this.xdir.$assign(this.ydir.op_assign(0));
        }
        if ((this.t_contact & 1) >>> 0 !== 0) {
          this.ForcePosition(this.fix_x.op_add$i32(1), this.fix_y.op_add$i32(fAllowDown));
          this.xdir.$assign(this.ydir.op_assign(0));
        }
      }
      if (this.xdir.op_not()) {
        if ((this.t_contact & 4) >>> 0 !== 0) {
          this.ForcePosition(this.fix_x.$clone(), this.fix_y.op_add$i32(1));
          this.xdir.$assign(this.ydir.op_assign(0));
        }
      }
    }
  }

  NoAttachAction() {
    if (this.GetAction() != null) {
      let iProcedure = this.GetProcedure();
      let prev_target = this.Action.Target.op_C4Object_();
      if (iProcedure === 238 && this.Action.ComDir !== 0 && $.ComDirLike(this.Action.ComDir, 1)) {
        if ($.ObjectActionCornerScale(this)) {
          return;
        }
      }
      if (iProcedure === 238 && this.Action.ComDir === 7 && this.Action.Dir === 0) {
        if ($.ObjectActionCornerScale(this)) {
          return;
        }
      }
      if (iProcedure === 238 && this.Action.ComDir === 3 && this.Action.Dir === 1) {
        if ($.ObjectActionCornerScale(this)) {
          return;
        }
      }
      if (iProcedure === 238 && this.Action.ComDir === 0) {
        if (this.Action.Dir === 0) {
          if ($.ObjectActionJump(this, $.itofix$i32(1), $.Fix0$C4Real.$clone(), false)) {
            return;
          }
        } else {
          if ($.ObjectActionJump(this, $.itofix$i32(-1), $.Fix0$C4Real.$clone(), false)) {
            return;
          }
        }
      }
      if (iProcedure === 243) {
        $.GrabLost(this, prev_target);
      }
      $.ObjectActionJump(this, this.xdir.$clone(), this.ydir.$clone(), false);
    } else {
      $.DoGravity(this);
      this.Mobile = true;
    }
  }

  DoMovement() {
    let contact_bits = 0;
    let has_moved = false;
    let has_contact = false;
    let has_turned = false;
    let lost_attachment = false;
    let redirected_force_from_ydir_to_rdir = false;
    if (this.Def.NoHorizontalMove !== 0) {
      this.xdir.op_assign(0);
    }
    this.MovementDigFreeTargetArea();
    let old_xdir = this.xdir.$clone();
    let old_ydir = this.ydir.$clone();
    let old_ocf = this.OCF;
    let new_x = this.fix_x.op_add$C4Fixed(this.xdir);
    let new_y = this.fix_y.op_add$C4Fixed(this.ydir);
    this.SideBounds(new_x);
    this.VerticalBounds(new_y);
    let steps_x = $.Abs$i32($.fixtoi$C4Fixed(new_x.op_sub$C4Fixed(this.fix_x)));
    let steps_y = $.Abs$i32($.fixtoi$C4Fixed(new_y.op_sub$C4Fixed(this.fix_y)));
    let steps_total = steps_x + steps_y | 0;
    let step_mod = 0;
    let prefer_vertical_movement = steps_y > steps_x;
    if (prefer_vertical_movement) {
      step_mod = $max(2, (1 + steps_total | 0) / $max(1, steps_x) | 0);
    } else {
      step_mod = $max(2, (1 + steps_total | 0) / $max(1, steps_y) | 0);
    }
    let step_counter = 0;
    do {
      step_counter = (step_counter + 1 | 0) % step_mod;
      let step_x = 0;
      let step_y = 0;
      if (step_counter > 0) {
        if (prefer_vertical_movement) {
          step_y = $.Sign$i32($.fixtoi$C4Fixed(new_y) - this.GetY() | 0);
        } else {
          step_x = $.Sign$i32($.fixtoi$C4Fixed(new_x) - this.GetX() | 0);
        }
      } else {
        if (prefer_vertical_movement) {
          step_x = $.Sign$i32($.fixtoi$C4Fixed(new_x) - this.GetX() | 0);
        } else {
          step_y = $.Sign$i32($.fixtoi$C4Fixed(new_y) - this.GetY() | 0);
        }
      }
      if (this.Action.t_attach !== 0) {
        const step_target_x = [this.GetX() + step_x | 0];
        const step_target_y = [this.GetY() + step_y | 0];
        if (!this.Shape.Attach(P(step_target_x, 0), P(step_target_y, 0), this.Action.t_attach & 0xff)) {
          lost_attachment = true;
        } else {
          if (step_target_x[0] !== (this.GetX() + step_x | 0)) {
            this.xdir.$assign($.Fix0$C4Real);
            new_x.$assign($.itofix$i32(step_target_x[0]));
          }
          if (step_target_y[0] !== (this.GetY() + step_y | 0)) {
            this.ydir.$assign($.Fix0$C4Real);
            new_y.$assign($.itofix$i32(step_target_y[0]));
          }
        }
        const border_hack_contacts = [0];
        let current_contacts = this.ContactCheck(step_target_x[0], step_target_y[0], P(border_hack_contacts, 0));
        if (current_contacts !== 0 || border_hack_contacts[0] !== 0) {
          has_contact = true;
          contact_bits = (contact_bits >>> 0 | (border_hack_contacts[0] | this.t_contact) >>> 0) >>> 0 | 0;
        }
        if (current_contacts !== 0) {
          if (step_target_x[0] !== this.GetX()) {
            step_target_x[0] = this.GetX();
            new_x.$assign(this.fix_x);
          }
          if (step_target_y[0] !== this.GetY()) {
            step_target_y[0] = this.GetY();
            new_y.$assign(this.fix_y);
          }
        }
        this.DoMotion(step_target_x[0] - this.GetX() | 0, step_target_y[0] - this.GetY() | 0);
      } else {
        if (step_x !== 0) {
          const border_hack_contacts = [0];
          let current_contacts = this.ContactCheck(this.GetX() + step_x | 0, this.GetY(), P(border_hack_contacts, 0), false);
          if (current_contacts !== 0 || border_hack_contacts[0] !== 0) {
            has_contact = true;
            contact_bits = (contact_bits >>> 0 | (this.t_contact | border_hack_contacts[0]) >>> 0) >>> 0 | 0;
          }
          if (current_contacts !== 0) {
            new_x.$assign(this.fix_x);
            $.RedirectForce(this.xdir, this.ydir, -1);
            $.ApplyFriction(this.ydir, $.ContactVtxFriction(this));
            new_y.$assign(this.fix_y.op_add$C4Fixed(this.ydir));
            this.VerticalBounds(new_y);
          } else {
            this.DoMotion(step_x, 0);
            has_moved = true;
          }
        }
        if (step_y !== 0) {
          let current_contacts = this.ContactCheck(this.GetX(), this.GetY() + step_y | 0, null, this.ydir.op_gt$i32(0));
          if (current_contacts !== 0) {
            has_contact = true;
            contact_bits = (contact_bits >>> 0 | this.t_contact) >>> 0 | 0;
            new_y.$assign(this.fix_y);
            $.ApplyFriction(this.xdir, $.ContactVtxFriction(this));
            if (!$.ContactVtxCNAT(this, 1)) {
              $.RedirectForce(this.ydir, this.xdir, -1);
            } else if (!$.ContactVtxCNAT(this, 2)) {
              $.RedirectForce(this.ydir, this.xdir, 1);
            } else {
              if ((this.OCF & 512) >>> 0 !== 0 && current_contacts === 1 && !this.Alive) {
                $.RedirectForce(this.ydir, this.rdir, -$.ContactVtxWeight(this) | 0);
                redirected_force_from_ydir_to_rdir = true;
              }
              this.ydir.op_assign(0);
            }
          } else {
            this.DoMotion(0, step_y);
            has_moved = true;
          }
        }
      }
      has_moved = true;
    } while ($.fixtoi$C4Fixed(new_x) !== this.GetX() || $.fixtoi$C4Fixed(new_y) !== this.GetY());
    if (this.fix_x.op_ne$C4Fixed(new_x) || this.fix_y.op_ne$C4Fixed(new_y)) {
      has_moved = true;
      this.RemoveSolidMask(true);
      this.fix_x.$assign(new_x);
      this.fix_y.$assign(new_y);
    }
    if ((this.OCF & 512) >>> 0 !== 0 && !this.rdir.op_not()) {
      let target_r = this.fix_r.op_add$C4Fixed(this.rdir.op_mul$i32(5));
      if (this.Def.Rotateable > 1) {
        if (target_r.op_gt$C4Fixed($.itofix$i32(this.Def.Rotateable))) {
          target_r.$assign($.itofix$i32(this.Def.Rotateable));
          this.rdir.op_assign(0);
        }
        if (target_r.op_lt$C4Fixed($.itofix$i32(-this.Def.Rotateable | 0))) {
          target_r.$assign($.itofix$i32(-this.Def.Rotateable | 0));
          this.rdir.op_assign(0);
        }
      }
      const current_x = [this.GetX()];
      const current_y = [this.GetY()];
      while ($.fixtoi$C4Fixed(this.fix_r) !== $.fixtoi$C4Fixed(target_r)) {
        let old_rotation = this.fix_r.$clone();
        let old_shape = this.Shape.$clone();
        this.fix_r.op_addAssign$i32($.Sign$C4Fixed(target_r.op_sub$C4Fixed(this.fix_r)));
        this.UpdateShape();
        if (this.Action.t_attach !== 0 && !lost_attachment) {
          current_x[0] = this.GetX();
          current_y[0] = this.GetY();
          this.Shape.Attach(P(current_x, 0), P(current_y, 0), this.Action.t_attach & 0xff);
        }
        let current_contacts = this.ContactCheck(current_x[0], current_y[0]);
        if (current_contacts !== 0) {
          has_contact = true;
          contact_bits = (contact_bits >>> 0 | this.t_contact) >>> 0 | 0;
          this.Shape.$assign(old_shape);
          target_r.$assign(this.fix_r.$assign(old_rotation));
          this.UpdatePos();
          if (current_contacts === 1 && !redirected_force_from_ydir_to_rdir) {
            $.RedirectForce(this.rdir, this.ydir, -1);
          }
          this.rdir.op_assign(0);
        } else {
          has_turned = true;
          if (current_x[0] !== this.GetX() || current_y[0] !== this.GetY()) {
            this.fix_x.$assign($.itofix$i32(current_x[0]));
            this.fix_y.$assign($.itofix$i32(current_y[0]));
          }
        }
      }
      if (target_r.op_lt$C4Fixed($.FixHalfCircle$C4Movement.op_neg())) {
        target_r.op_addAssign$C4Fixed($.FixFullCircle$C4Movement);
      }
      if (target_r.op_gt$C4Fixed($.FixHalfCircle$C4Movement.op_pos())) {
        target_r.op_subAssign$C4Fixed($.FixFullCircle$C4Movement);
      }
      this.fix_r.$assign(target_r);
    }
    if (has_moved || has_turned) {
      this.UpdateSolidMask(true);
    }
    if (this.IsInLiquidCheck()) {
      if (!this.InLiquid) {
        if ((this.OCF & 4096) >>> 0 !== 0 && this.Mass > 3) {
          this.Splash();
        }
        lost_attachment = false;
        this.InLiquid = true;
      }
    } else {
      if (this.InLiquid) {
        this.InLiquid = false;
      }
    }
    if (has_contact) {
      this.t_contact = contact_bits >>> 0;
      this.ContactAction();
    }
    if (lost_attachment) {
      this.NoAttachAction();
    }
    if (has_contact) {
      let pars = new $.C4AulParSet().init$mi32$mi32($.fixtoi$C4Fixed$i32(old_xdir, 100), $.fixtoi$C4Fixed$i32(old_ydir, 100));
      if ((old_ocf & 32) >>> 0 !== 0) {
        this.Call$pi8$pC4AulParSet$b(S("~Hit"), pars.op_and());
      }
      if ((old_ocf & 4096) >>> 0 !== 0) {
        this.Call$pi8$pC4AulParSet$b(S("~Hit2"), pars.op_and());
      }
      if ((old_ocf & 8192) >>> 0 !== 0) {
        this.Call$pi8$pC4AulParSet$b(S("~Hit3"), pars.op_and());
      }
    }
    if (has_turned) {
      this.UpdateFace(true);
    } else {
      if (has_moved) {
        this.UpdatePos();
      }
    }
  }

  Stabilize() {
    if (this.Def.NoStabilize !== 0) {
      return;
    }
    let normalized_rotation = this.fix_r.$clone();
    while (normalized_rotation.op_lt$C4Fixed($.itofix$i32(-180))) {
      normalized_rotation.op_addAssign$i32(360);
    }
    while (normalized_rotation.op_gt$C4Fixed($.itofix$i32(180))) {
      normalized_rotation.op_subAssign$i32(360);
    }
    if (normalized_rotation.op_ne$C4Fixed($.Fix0$C4Real) && $.Inside$C4Fixed$C4Fixed$C4Fixed(normalized_rotation.$clone(), $.itofix$i32(-10), $.itofix$i32(10))) {
      let old_rotation = this.fix_r.$clone();
      let old_shape = this.Shape.$clone();
      this.fix_r.$assign($.Fix0$C4Real);
      this.UpdateShape();
      if (this.ContactCheck(this.GetX(), this.GetY()) !== 0) {
        this.Shape.$assign(old_shape);
        this.fix_r.$assign(old_rotation);
      } else {
        this.UpdateFace(true);
      }
    }
  }

  SetOCF() {
    let pActionDef = this.GetAction();
    let dwOCFOld = this.OCF;
    let cspeed = this.GetSpeed();
    this.OCF = 1;
    if (this.Def.Constructable !== 0 && this.Con < 100000 && this.fix_r.op_eq$C4Fixed($.Fix0$C4Real) && !this.OnFire) {
      this.OCF = (this.OCF | 2) >>> 0;
    }
    if (this.GetPropertyInt(14 /*P_Touchable*/) !== 0) {
      this.OCF = (this.OCF | 4) >>> 0;
    }
    if (this.GetPropertyInt(13 /*P_Collectible*/) !== 0) {
      this.OCF = (this.OCF | 8) >>> 0;
    }
    if (this.OnFire) {
      this.OCF = (this.OCF | 16) >>> 0;
    }
    if (!this.OnFire && this.GetPropertyInt(86 /*P_ContactIncinerate*/) > 0) {
      this.OCF = (this.OCF | 128) >>> 0;
    }
    if (this.Con >= 100000) {
      this.OCF = (this.OCF | 64) >>> 0;
    }
    if (this.Def.Rotateable !== 0) {
      if (this.Con > 100) {
        this.OCF = (this.OCF | 512) >>> 0;
      }
    }
    if (this.Def.Exclusive !== 0) {
      this.OCF = (this.OCF | 1024) >>> 0;
    }
    if (this.Def.Entrance.Wdt > 0 && this.Def.Entrance.Hgt > 0) {
      if ((this.OCF & 64) >>> 0 !== 0 && (this.Def.RotatedEntrance === 1 || this.GetR() <= this.Def.RotatedEntrance)) {
        this.OCF = (this.OCF | 2048) >>> 0;
      }
    }
    if (cspeed.op_ge$C4Fixed($.HitSpeed1)) {
      this.OCF = (this.OCF | 32) >>> 0;
    }
    if (cspeed.op_ge$C4Fixed($.HitSpeed2)) {
      this.OCF = (this.OCF | 4096) >>> 0;
    }
    if (cspeed.op_ge$C4Fixed($.HitSpeed3)) {
      this.OCF = (this.OCF | 8192) >>> 0;
    }
    if (cspeed.op_ge$C4Fixed($.HitSpeed4)) {
      this.OCF = (this.OCF | 65536) >>> 0;
    }
    if ((this.OCF & 64) >>> 0 !== 0 || this.Def.IncompleteActivity !== 0) {
      if (this.Def.Collection.Wdt > 0 && this.Def.Collection.Hgt > 0) {
        if (pActionDef == null || !(pActionDef.GetPropertyInt(59 /*P_ObjectDisabled*/) !== 0)) {
          this.OCF = (this.OCF | 16384) >>> 0;
        }
      }
    }
    if (this.Alive) {
      this.OCF = (this.OCF | 0x2000000) >>> 0;
    }
    if (this.Def.CrewMember !== 0) {
      if (this.Alive) {
        this.OCF = (this.OCF | 524288) >>> 0;
      }
    }
    if (this.Contained.op_not()) {
      this.OCF = (this.OCF | 262144) >>> 0;
    }
    if (this.InLiquid) {
      if (this.Contained.op_not()) {
        this.OCF = (this.OCF | 0x100000) >>> 0;
      }
    }
    if (this.Contained.op_not()) {
      if ($.GBackSolid(this.GetX(), this.GetY())) {
        this.OCF = (this.OCF | 0x200000) >>> 0;
      }
    }
    if (this.Contained.op_not()) {
      if (!$.GBackSemiSolid(this.GetX(), this.GetY() - 1 | 0)) {
        this.OCF = (this.OCF | 0x400000) >>> 0;
      }
    }
    if (this.Contained.op_not() || (this.Contained.op_arrow().Def.GrabPutGet & 2) !== 0 || (this.Contained.op_arrow().OCF & 2048) >>> 0 !== 0) {
      if (!$.GBackSemiSolid(this.GetX(), this.GetY() - 1 | 0) || !$.GBackSolid(this.GetX(), this.GetY() - 1 | 0) && !$.GBackSemiSolid(this.GetX(), this.GetY() - 8 | 0)) {
        this.OCF = (this.OCF | 0x800000) >>> 0;
      }
    }
    if ((this.Def.GrabPutGet & 1) !== 0 || (this.Def.GrabPutGet & 2) !== 0 || (this.OCF & 2048) >>> 0 !== 0) {
      this.OCF = (this.OCF | 0x1000000) >>> 0;
    }
    if (true && $.Config.General.DebugRec !== 0) {
      let rc = ((($o) => ($o.dwOCFOld = dwOCFOld, $o.dwOCFNew = this.OCF, $o.fUpdate = false, $o))(new $.C4RCOCF()));
      $.AddDbgRec(163 /*RCT_OCF*/, $bytesView(rc, [["dwOCFOld", 0, "u32", 0], ["dwOCFNew", 4, "u32", 0], ["fUpdate", 8, "u8", 0]], 9), 9);
    }
  }

  UpdateOCF() {
    let pActionDef = this.GetAction();
    let dwOCFOld = this.OCF;
    let cspeed = this.GetSpeed();
    this.OCF = (this.OCF & 0x2080651) >>> 0;
    if (!this.OnFire && this.GetPropertyInt(86 /*P_ContactIncinerate*/) > 0) {
      this.OCF = (this.OCF | 128) >>> 0;
    }
    if (this.GetPropertyInt(13 /*P_Collectible*/) !== 0) {
      this.OCF = (this.OCF | 8) >>> 0;
    }
    if (this.GetPropertyInt(14 /*P_Touchable*/) !== 0) {
      this.OCF = (this.OCF | 4) >>> 0;
    }
    if (this.Def.Constructable !== 0 && this.Con < 100000 && this.fix_r.op_eq$C4Fixed($.Fix0$C4Real) && !this.OnFire) {
      this.OCF = (this.OCF | 2) >>> 0;
    }
    if (this.Def.Entrance.Wdt > 0 && this.Def.Entrance.Hgt > 0) {
      if ((this.OCF & 64) >>> 0 !== 0 && (this.Def.RotatedEntrance === 1 || this.GetR() <= this.Def.RotatedEntrance)) {
        this.OCF = (this.OCF | 2048) >>> 0;
      }
    }
    if (cspeed.op_ge$C4Fixed($.HitSpeed1)) {
      this.OCF = (this.OCF | 32) >>> 0;
    }
    if (cspeed.op_ge$C4Fixed($.HitSpeed2)) {
      this.OCF = (this.OCF | 4096) >>> 0;
    }
    if (cspeed.op_ge$C4Fixed($.HitSpeed3)) {
      this.OCF = (this.OCF | 8192) >>> 0;
    }
    if (cspeed.op_ge$C4Fixed($.HitSpeed4)) {
      this.OCF = (this.OCF | 65536) >>> 0;
    }
    if ((this.OCF & 64) >>> 0 !== 0 || this.Def.IncompleteActivity !== 0) {
      if (this.Def.Collection.Wdt > 0 && this.Def.Collection.Hgt > 0) {
        if (pActionDef == null || !(pActionDef.GetPropertyInt(59 /*P_ObjectDisabled*/) !== 0)) {
          this.OCF = (this.OCF | 16384) >>> 0;
        }
      }
    }
    if (this.Contained.op_not()) {
      this.OCF = (this.OCF | 262144) >>> 0;
    }
    if (this.InLiquid) {
      if (this.Contained.op_not()) {
        this.OCF = (this.OCF | 0x100000) >>> 0;
      }
    }
    if (this.Contained.op_not()) {
      if ($.GBackSolid(this.GetX(), this.GetY())) {
        this.OCF = (this.OCF | 0x200000) >>> 0;
      }
    }
    if (this.Contained.op_not()) {
      if (!$.GBackSemiSolid(this.GetX(), this.GetY() - 1 | 0)) {
        this.OCF = (this.OCF | 0x400000) >>> 0;
      }
    }
    if (this.Contained.op_not() || (this.Contained.op_arrow().Def.GrabPutGet & 2) !== 0 || (this.Contained.op_arrow().OCF & 2048) >>> 0 !== 0) {
      if (!$.GBackSemiSolid(this.GetX(), this.GetY() - 1 | 0) || !$.GBackSolid(this.GetX(), this.GetY() - 1 | 0) && !$.GBackSemiSolid(this.GetX(), this.GetY() - 8 | 0)) {
        this.OCF = (this.OCF | 0x800000) >>> 0;
      }
    }
    if ((this.Def.GrabPutGet & 1) !== 0 || (this.Def.GrabPutGet & 2) !== 0 || (this.OCF & 2048) >>> 0 !== 0) {
      this.OCF = (this.OCF | 0x1000000) >>> 0;
    }
    if (true && $.Config.General.DebugRec !== 0) {
      let rc = ((($o) => ($o.dwOCFOld = dwOCFOld, $o.dwOCFNew = this.OCF, $o.fUpdate = true, $o))(new $.C4RCOCF()));
      $.AddDbgRec(163 /*RCT_OCF*/, $bytesView(rc, [["dwOCFOld", 0, "u32", 0], ["dwOCFNew", 4, "u32", 0], ["fUpdate", 8, "u8", 0]], 9), 9);
    }
  }

  UpdateShape(bUpdateVertices = true) {
    if (this.Def.Line !== 0) {
      return;
    }
    this.Shape.CopyFrom(this.Def.Shape.$clone(), bUpdateVertices, !!this.fOwnVertices);
    if (this.Con !== 100000) {
      if (this.Def.GrowthType !== 0) {
        this.Shape.Stretch(this.Con, bUpdateVertices);
      } else {
        this.Shape.Jolt(this.Con, bUpdateVertices);
      }
    }
    if (this.Def.Rotateable !== 0) {
      if (this.fix_r.op_ne$C4Fixed($.Fix0$C4Real)) {
        this.Shape.Rotate(this.fix_r.$clone(), bUpdateVertices);
      }
    }
    this.UpdatePos();
  }

  UpdatePos() {
    if (!this.Initializing && this.Status === 1) {
      $.Objects.UpdatePos(this);
    }
  }

  UpdateSolidMask(fRestoreAttachedObjects) {
    if (this.Status === 0) {
      return;
    }
    if (this.SolidMask.Wdt > 0 && this.Con >= 100000 && this.Contained.op_not()) {
      if (this.pSolidMaskData == null) {
        this.pSolidMaskData = new $.C4SolidMask().init(this);
      } else {
        this.pSolidMaskData.Remove(false);
      }
      this.pSolidMaskData.Put(true, null, fRestoreAttachedObjects);
      this.SetHalfVehicleSolidMask(this.HalfVehicleSolidMask);
    } else if (this.pSolidMaskData != null) {
      $delete(this.pSolidMaskData);
      this.pSolidMaskData = null;
    }
  }

  UpdateMass() {
    this.Mass = $max(Math.imul(this.Def.Mass + this.OwnMass | 0, this.Con) / 100000 | 0, 1);
    if (this.Def.NoMassFromContents === 0) {
      this.Mass = this.Mass + this.Contents.Mass | 0;
    }
    if (this.Contained.op_C4Object_() != null) {
      this.Contained.op_arrow().Contents.MassCount();
      this.Contained.op_arrow().UpdateMass();
    }
  }

  ChangeDef(idNew) {
    let $t1, $t2, $t3;
    let pDef = $.C4Id2Def(idNew.$clone());
    if (pDef == null) {
      return false;
    }
    let pContainer = this.Contained.op_C4Object_();
    if (this.Contained.op_C4Object_() != null) {
      this.Exit(0, 0, 0, $.Fix0$C4Real.$clone(), $.Fix0$C4Real.$clone(), $.Fix0$C4Real.$clone(), false);
    }
    this.SetAction(null);
    this.ResetProperty($oat($.Strings.P, 68 /*P_Action*/));
    this.SetDir(0);
    if (this.pSolidMaskData != null) {
      $delete(this.pSolidMaskData);
      this.pSolidMaskData = null;
    }
    this.Def.Count = this.Def.Count - 1 | 0;
    this.Def = pDef;
    this.SetProperty(0 /*P_Prototype*/, $.C4VPropList(pDef));
    this.id.$assign(pDef.id);
    this.Def.Count = this.Def.Count + 1 | 0;
    this.Unsorted = true;
    this.pGraphics = pDef.Graphics;
    if (!((this.BlitMode & 128) >>> 0 !== 0)) {
      this.BlitMode = this.Def.BlitMode >>> 0;
    }
    if (this.Color === 0 && $.ValidPlr(this.Owner) !== 0) {
      this.Color = $.Players.Get(this.Owner).ColorDw;
    }
    if (this.Def.Rotateable === 0) {
      this.fix_r.$assign(this.rdir.$assign($.Fix0$C4Real));
    }
    this.SolidMask.$assign(this.Def.SolidMask);
    this.HalfVehicleSolidMask = false;
    this.UpdateGraphics(true);
    this.UpdateMass();
    this.UpdateFace(true);
    this.SetOCF();
    if ($.ScriptEngine.pGlobalEffects != null) {
      $.ScriptEngine.pGlobalEffects.OnObjectChangedDef(this);
    }
    if ($.GameScript.pScenarioEffects != null) {
      $.GameScript.pScenarioEffects.OnObjectChangedDef(this);
    }
    $t1 = $.Objects;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    try {
      for (; $t2.op_ne($t3); $t2.op_inc$v()) {
        const obj = $t2.op_mul();
        if (obj.pEffects != null) {
          obj.pEffects.OnObjectChangedDef(this);
        }
      }
    } finally { $t2.$dtor(); $t3.$dtor(); }
    if (pContainer != null) {
      this.Enter(pContainer, false);
    }
    return true;
  }

  UpdateFace(bUpdateShape, fTemp = false) {
    if (!fTemp) {
      if (bUpdateShape) {
        this.UpdateShape();
      } else {
        this.UpdatePos();
      }
    }
    if (!fTemp) {
      this.UpdateSolidMask(false);
    }
    $.C4Facet.prototype.Default.call(this.TopFace);
    if (this.Con >= 100000 || this.Def.GrowthType !== 0) {
      if (this.Def.Rotateable === 0 || this.fix_r.op_eq$C4Fixed($.Fix0$C4Real)) {
        if (this.Def.TopFace.Wdt > 0) {
          this.TopFace.Set$pC4Surface$f32$f32$f32$f32(this.GetGraphics().GetBitmap(this.Color), Math.fround(this.Def.TopFace.x), Math.fround(this.Def.TopFace.y), Math.fround(this.Def.TopFace.Wdt), Math.fround(this.Def.TopFace.Hgt));
        }
      }
    }
    this.UpdateActionFace();
  }

  UpdateGraphics(fGraphicsChanged, fTemp = false) {
    if (!fTemp) {
      if (!this.pGraphics.IsColorByOwner()) {
        this.Color = 0;
      }
    }
    if (fGraphicsChanged) {
      if (this.pMeshInstance == null || this.pGraphics.Type !== 2 || this.pMeshInstance.GetMesh() !== this.pGraphics.$u1.Mesh) {
        if (this.pMeshInstance != null && this.pMeshInstance.GetAttachParent() != null) {
          let attach_parent = this.pMeshInstance.GetAttachParent();
          attach_parent.Parent.DetachMesh(attach_parent.Number);
        }
        $delete(this.pMeshInstance);
        if (this.pGraphics.Type === 2) {
          this.pMeshInstance = new $.StdMeshInstance().init(this.pGraphics.$u1.Mesh, this.Def.GrowthType !== 0 ? 1 : Math.fround(Math.fround(this.Con) / Math.fround(100000)));
          this.pMeshInstance.SetFaceOrderingForClrModulation(this.ColorMod);
        } else {
          this.pMeshInstance = null;
        }
      }
      this.UpdateFace(false);
    }
  }

  UpdateFlipDir() {
    let iFlipDir = 0;
    let pActionDef = this.GetAction();
    if (pActionDef != null) {
      if ((iFlipDir = pActionDef.GetPropertyInt(28 /*P_FlipDir*/)) !== 0) {
        if (this.Action.Dir >= iFlipDir) {
          this.Action.DrawDir = (iFlipDir - 1 | 0) - (this.Action.Dir - iFlipDir | 0) | 0;
          if (this.pDrawTransform != null) {
            this.pDrawTransform.SetFlipDir(-1);
          } else {
            this.pDrawTransform = new $.C4DrawTransform().init$i32(-1);
          }
          return;
        }
      }
    }
    this.Action.DrawDir = this.Action.Dir;
    if (this.pDrawTransform != null) {
      this.pDrawTransform.SetFlipDir(1);
      if (this.pDrawTransform.IsIdentity()) {
        $delete(this.pDrawTransform);
        this.pDrawTransform = null;
      }
    }
  }

  At$i32$i32(ctx, cty) {
    return this.Status !== 0 && this.Contained.op_not() && this.Def != null && $.Inside$i32$i32$i32$3(cty - ((this.GetY() + this.Shape.GetY() | 0) - this.addtop() | 0) | 0, 0, (this.Shape.Hgt - 1 | 0) + this.addtop() | 0) && $.Inside$i32$i32$i32$3(ctx - (this.GetX() + this.Shape.GetX() | 0) | 0, 0, this.Shape.Wdt - 1 | 0);
  }

  At$i32$i32$ru32(ctx, cty, ocf) {
    if (this.Status !== 0 && this.Contained.op_not() && this.Def != null && (this.OCF & ocf.a[ocf.o]) >>> 0 !== 0 && $.Inside$i32$i32$i32$3(cty - ((this.GetY() + this.Shape.GetY() | 0) - this.addtop() | 0) | 0, 0, (this.Shape.Hgt - 1 | 0) + this.addtop() | 0) && $.Inside$i32$i32$i32$3(ctx - (this.GetX() + this.Shape.GetX() | 0) | 0, 0, this.Shape.Wdt - 1 | 0)) {
      this.GetOCFForPos(ctx, cty, ocf);
      return true;
    }
    return false;
  }

  GetOCFForPos(ctx, cty, ocf) {
    let rocf = this.OCF;
    if ((rocf & 2048) >>> 0 !== 0) {
      if (!$.Inside$i32$i32$i32$3(cty - (this.GetY() + this.Def.Entrance.y | 0) | 0, 0, this.Def.Entrance.Hgt - 1 | 0) || !$.Inside$i32$i32$i32$3(ctx - (this.GetX() + this.Def.Entrance.x | 0) | 0, 0, this.Def.Entrance.Wdt - 1 | 0)) {
        rocf = (rocf & 0xfffff7ff) >>> 0;
      }
    }
    if ((rocf & 16384) >>> 0 !== 0) {
      if (!$.Inside$i32$i32$i32$3(cty - (this.GetY() + this.Def.Collection.y | 0) | 0, 0, this.Def.Collection.Hgt - 1 | 0) || !$.Inside$i32$i32$i32$3(ctx - (this.GetX() + this.Def.Collection.x | 0) | 0, 0, this.Def.Collection.Wdt - 1 | 0)) {
        rocf = (rocf & 0xffffbfff) >>> 0;
      }
    }
    ocf.a[ocf.o] = rocf;
  }

  CloseMenu(fForce) {
    if (this.Menu != null) {
      if (this.Menu.IsActive$v()) {
        if (!this.Menu.TryClose(fForce, false)) {
          return false;
        }
      }
      if (!this.Menu.IsCloseQuerying()) {
        $delete(this.Menu);
        this.Menu = null;
      }
    }
    return true;
  }

  ActivateMenu(iMenu, _iMenuSelect = 0, _iMenuData = 0, _iMenuPosition = 0, pTarget = null) {
    let fctSymbol = new $.C4FacetSurface().init();
    let ListItems = new $.C4IDList().init();
    if (this.Menu != null && this.Menu.IsActive$v()) {
      if (!this.Menu.TryClose(true, false)) {
        return false;
      }
    }
    if (this.Menu == null) {
      this.Menu = new $.C4ObjectMenu().init();
    } else {
      this.Menu.ClearItems();
    }
    switch (iMenu) {
      case 6:
        if (pTarget == null) {
          if (!((pTarget = this.Contained.op_C4Object_()) != null)) {
            break;
          }
        }
        if (!pTarget.Call$pi8$pC4AulParSet$b(S("~RejectContents")).op_not()) {
          return false;
        }
        fctSymbol.Create(35, 35);
        pTarget.Def.Draw$rC4Facet$b$u32$pC4Object$i32$i32$pC4DrawTransform$pi8(fctSymbol, false, pTarget.Color, pTarget);
        this.Menu.Init$rC4FacetSurface$pi8$pC4Object$i32$i32$i32$i32$b(fctSymbol, $.FormatString($.LoadResStr(S("IDS_OBJ_EMPTY")), pTarget.GetName()).getData(), this, 0, 0, iMenu);
        this.Menu.SetPermanent(true);
        this.Menu.SetRefillObject(pTarget);
        return true;
      case 4:
        if (pTarget == null) {
          if (!((pTarget = this.Contained.op_C4Object_()) != null)) {
            break;
          }
        }
        fctSymbol.Create(35, 35);
        $.DrawMenuSymbol(4, fctSymbol, pTarget.Owner);
        this.Menu.Init$rC4FacetSurface$pi8$pC4Object$i32$i32$i32$i32$b(fctSymbol, $.LoadResStr(S("IDS_PLR_NOBUY")), this, 2, 0, iMenu);
        this.Menu.SetPermanent(true);
        this.Menu.SetRefillObject(pTarget);
        return true;
      case 5:
        if (pTarget == null) {
          if (!((pTarget = this.Contained.op_C4Object_()) != null)) {
            break;
          }
        }
        fctSymbol.Create(35, 35);
        $.DrawMenuSymbol(5, fctSymbol, pTarget.Owner);
        this.Menu.Init$rC4FacetSurface$pi8$pC4Object$i32$i32$i32$i32$b(fctSymbol, $.FormatString($.LoadResStr(S("IDS_OBJ_EMPTY")), pTarget.GetName()).getData(), this, 2, 0, iMenu);
        this.Menu.SetPermanent(true);
        this.Menu.SetRefillObject(pTarget);
        return true;
      case 13:
      case 18:
        if (pTarget == null) {
          break;
        }
        if (!pTarget.Call$pi8$pC4AulParSet$b(S("~RejectContents")).op_not()) {
          return false;
        }
        fctSymbol.Create(35, 35);
        pTarget.Def.Draw$rC4Facet$b$u32$pC4Object$i32$i32$pC4DrawTransform$pi8(fctSymbol, false, pTarget.Color, pTarget);
        this.Menu.Init$rC4FacetSurface$pi8$pC4Object$i32$i32$i32$i32$b(fctSymbol, $.FormatString($.LoadResStr(S("IDS_OBJ_EMPTY")), pTarget.GetName()).getData(), this, 0, 0, iMenu);
        this.Menu.SetPermanent(true);
        this.Menu.SetRefillObject(pTarget);
        return true;
      case 15:
        if (pTarget == null) {
          break;
        }
        fctSymbol.Create(35, 35);
        $.GraphicsResource.fctOKCancel.Draw$rC4Facet$b$i32$i32$b(fctSymbol, true, 0, 1);
        this.Menu.Init$rC4FacetSurface$pi8$pC4Object$i32$i32$i32$i32$b(fctSymbol, pTarget.GetName(), this, 0, 0, iMenu, 2);
        this.Menu.SetPermanent(true);
        this.Menu.SetAlignment(16);
        let pViewport = $.Viewports.GetViewport(this.Controller);
        if (pViewport != null) {
          this.Menu.SetLocation(ftoi32(Math.fround(Math.fround(Math.fround(((pTarget.GetX() + pTarget.Shape.GetX() | 0) + pTarget.Shape.Wdt | 0) + 10 | 0) - pViewport.GetViewX()) * pViewport.GetZoom$v())), ftoi32(Math.fround(Math.fround(Math.fround(pTarget.GetY() + pTarget.Shape.GetY() | 0) - pViewport.GetViewY()) * pViewport.GetZoom$v())));
        }
        fctSymbol.Create(64, 64);
        pTarget.Def.Draw$rC4Facet$b$u32$pC4Object$i32$i32$pC4DrawTransform$pi8(fctSymbol, false, pTarget.Color, pTarget);
        this.Menu.Add$pi8$rC4FacetSurface$pi8$i32$pC4Object$pi8$C4ID$pi8$b$i32$b(pTarget.GetName(), fctSymbol, S(""), 0xbc614e, null, pTarget.GetInfoString().getData());
        $.C4FacetSurface.prototype.Default.call(fctSymbol);
        return true;
    }
    this.CloseMenu(true);
    return false;
  }

  ContactCheck(at_x, at_y, border_hack_contacts = null, collide_halfvehic = false) {
    this.Shape.ContactCheck(at_x, at_y, border_hack_contacts, collide_halfvehic);
    this.t_contact = this.Shape.ContactCNAT >>> 0;
    if (this.Shape.ContactCNAT !== 0) {
      for (let ccnat = 0; ccnat < 4; ccnat = ccnat + 1 | 0) {
        if ((this.Shape.ContactCNAT & (1 << ccnat | 0)) !== 0 && this.Contact(1 << ccnat | 0)) {
          break;
        }
      }
    }
    return this.Shape.ContactCount;
  }

  Contact(iCNAT) {
    if (this.GetPropertyInt(80 /*P_ContactCalls*/) !== 0) {
      return !this.Call$pi8$pC4AulParSet$b($.FormatString(S("~Contact%s"), $.CNATName(iCNAT)).getData()).op_not();
    }
    return false;
  }

  StopAndContact(contact_coordinate, limit, speed, cnat) {
    contact_coordinate.$assign(limit);
    speed.op_assign(0);
    this.Contact(cnat);
  }

  GetAction() {
    let value = new $.C4Value().init$v();
    this.GetProperty(68 /*P_Action*/, value);
    return value.getPropList();
  }

  SetAction(Act, pTarget = null, pTarget2 = null, iCalls = 5, fForce = false) {
    let vLastAction = new $.C4Value().init$v();
    this.GetProperty(68 /*P_Action*/, vLastAction);
    let LastAction = vLastAction.getPropList();
    const iLastPhase = [this.Action.Phase];
    const pLastTarget = [this.Action.Target.op_C4Object_()];
    const pLastTarget2 = [this.Action.Target2.op_C4Object_()];
    if (LastAction != null) {
      if (LastAction.GetPropertyInt(53 /*P_NoOtherAction*/) !== 0 && !fForce) {
        if (Act !== LastAction) {
          return false;
        }
      }
    }
    if (this.pMeshInstance != null) {
      if (this.Action.Animation != null) {
        this.pMeshInstance.StopAnimation(this.Action.Animation);
      }
      this.Action.Animation = null;
      let Animation = Act != null ? Act.GetPropertyStr(67 /*P_Animation*/) : null;
      if (Animation != null) {
        this.Action.Animation = this.pMeshInstance.PlayAnimation$StdStrBuf$i32$pAnimationNode$pValueProvider$pValueProvider$b(Animation.GetData(), 0, null, new $.C4ValueProviderAction().init$pC4Object(this), new $.C4ValueProviderConst().init$C4Fixed($.itofix$i32(1)), true);
      }
    }
    if (LastAction != null) {
      if (Act !== LastAction) {
        if (LastAction.GetPropertyStr(58 /*P_Sound*/) != null) {
          $.StopSoundEffect(LastAction.GetPropertyStr(58 /*P_Sound*/).GetCStr(), this);
        }
      }
    }
    if (this.Con < 100000) {
      if (this.Def.IncompleteActivity === 0) {
        Act = null;
      }
    }
    if (Act !== LastAction) {
      this.Action.Time = 0;
      if ((Act != null ? Act.GetPropertyP(23 /*P_Procedure*/) : -1) !== (LastAction != null ? LastAction.GetPropertyP(23 /*P_Procedure*/) : -1)) {
        this.Action.Data = 0;
        this.Action.Target.op_assign(null);
        this.Action.Target2.op_assign(null);
      }
    }
    this.SetProperty(68 /*P_Action*/, $.C4VPropList(Act));
    this.Action.Phase = this.Action.PhaseDelay = 0;
    if (pTarget != null) {
      this.Action.Target.op_assign(pTarget);
    }
    if (pTarget2 != null) {
      this.Action.Target2.op_assign(pTarget2);
    }
    this.UpdateActionFace();
    if ((LastAction != null ? LastAction.GetPropertyInt(28 /*P_FlipDir*/) : 0) !== (Act != null ? Act.GetPropertyInt(28 /*P_FlipDir*/) : 0)) {
      this.UpdateFlipDir();
    }
    if (Act != null) {
      if (Act !== LastAction) {
        if (Act.GetPropertyStr(58 /*P_Sound*/) != null) {
          $.StartSoundEffect(Act.GetPropertyStr(58 /*P_Sound*/).GetCStr(), true, 100, this);
        }
      }
    }
    this.SetOCF();
    if ((iCalls & 2) !== 0 && !fForce) {
      if (LastAction != null) {
        if (LastAction.GetPropertyStr(55 /*P_EndCall*/) != null) {
          let pOldDef = this.Def;
          this.Call$pi8$pC4AulParSet$b(LastAction.GetPropertyStr(55 /*P_EndCall*/).GetCStr());
          if (this.Def !== pOldDef || this.Status === 0) {
            return true;
          }
        }
      }
    }
    if ((iCalls & 4) !== 0 && !fForce) {
      if (LastAction != null) {
        if (LastAction.GetPropertyStr(56 /*P_AbortCall*/) != null) {
          let pOldDef = this.Def;
          if (pLastTarget[0] != null && pLastTarget[0].Status === 0) {
            pLastTarget[0] = null;
          }
          if (pLastTarget2[0] != null && pLastTarget2[0].Status === 0) {
            pLastTarget2[0] = null;
          }
          this.Call$pi8$pC4AulParSet$b(LastAction.GetPropertyStr(56 /*P_AbortCall*/).GetCStr(), new $.C4AulParSet().init$ri32$rpC4Object$rpC4Object(P(iLastPhase, 0), P(pLastTarget, 0), P(pLastTarget2, 0)).op_and());
          if (this.Def !== pOldDef || this.Status === 0) {
            return true;
          }
        }
      }
    }
    if ((iCalls & 1) !== 0) {
      if (Act != null) {
        if (Act.GetPropertyStr(54 /*P_StartCall*/) != null) {
          let pOldDef = this.Def;
          this.Call$pi8$pC4AulParSet$b(Act.GetPropertyStr(54 /*P_StartCall*/).GetCStr());
          if (this.Def !== pOldDef || this.Status === 0) {
            return true;
          }
        }
      }
    }
    let pOldDef = this.Def;
    this.Call$pi8$pC4AulParSet$b(S("~OnActionChanged"), new $.C4AulParSet().init$mpi8(LastAction != null ? LastAction.GetName() : S("Idle")).op_and());
    if (this.Def !== pOldDef || this.Status === 0) {
      return true;
    }
    return true;
  }

  SetActionByName$pC4String$pC4Object$pC4Object$i32$b(ActName, pTarget = null, pTarget2 = null, iCalls = 5, fForce = false) {
    0;
    if (ActName == null || ActName === $oat($.Strings.P, 52 /*P_Idle*/)) {
      return this.SetAction(null, null, null, iCalls, fForce);
    }
    let ActMap = new $.C4Value().init$v();
    this.GetProperty(15 /*P_ActMap*/, ActMap);
    if (!(ActMap.getPropList() != null)) {
      return false;
    }
    let Action = new $.C4Value().init$v();
    ActMap.getPropList().GetPropertyByS(ActName, Action);
    if (!(Action.getPropList() != null)) {
      return false;
    }
    return this.SetAction(Action.getPropList(), pTarget, pTarget2, iCalls, fForce);
  }

  SetActionByName$pi8$pC4Object$pC4Object$i32$b(szActName, pTarget = null, pTarget2 = null, iCalls = 5, fForce = false) {
    let ActName = $.Strings.RegString$pi8(szActName);
    ActName.IncRef();
    let r = this.SetActionByName$pC4String$pC4Object$pC4Object$i32$b(ActName, pTarget, pTarget2, iCalls, fForce);
    ActName.DecRef();
    return r;
  }

  SetDir(iDir) {
    let pActionDef = this.GetAction();
    if (pActionDef == null) {
      return;
    }
    if (!$.Inside$i32$i32$i32$3(iDir, 0, pActionDef.GetPropertyInt(27 /*P_Directions*/) - 1 | 0)) {
      return;
    }
    if (iDir !== this.Action.Dir) {
      if (pActionDef.GetPropertyStr(62 /*P_TurnAction*/) != null) {
        this.SetActionByName$pC4String$pC4Object$pC4Object$i32$b(pActionDef.GetPropertyStr(62 /*P_TurnAction*/));
      }
    }
    this.Action.Dir = iDir;
    if (pActionDef.GetPropertyInt(28 /*P_FlipDir*/) !== 0) {
      this.UpdateFlipDir();
    } else {
      this.Action.DrawDir = iDir;
    }
  }

  SetCategory(Category) {
    this.Category = Category;
    this.Resort();
    this.SetOCF();
  }

  GetProcedure() {
    let pActionDef = this.GetAction();
    if (pActionDef == null) {
      return -1;
    }
    return pActionDef.GetPropertyP(23 /*P_Procedure*/);
  }

  Enter(pTarget$, fCalls = true, fCopyMotion = true, pfRejectCollect = null) {
    const pTarget = [pTarget$];
    if (pTarget[0] == null || pTarget[0] === this) {
      return false;
    }
    if (!this.Call$pi8$pC4AulParSet$b(S("~RejectEntrance"), new $.C4AulParSet().init$rpC4Object(P(pTarget, 0)).op_and()).op_not()) {
      return false;
    }
    for (let pCnt = pTarget[0].Contained.op_C4Object_(); pCnt != null; pCnt = pCnt.Contained.op_C4Object_()) {
      if (pCnt === this) {
        return false;
      }
    }
    if (pfRejectCollect != null) {
      if (!pTarget[0].Call$pi8$pC4AulParSet$b(S("~RejectCollect"), new $.C4AulParSet().init$rpC4Def$mpC4Object(P(this, "Def"), this).op_and()).op_not()) {
        pfRejectCollect.a[pfRejectCollect.o] = true;
        return false;
      }
      pfRejectCollect.a[pfRejectCollect.o] = false;
    }
    if (this.Contained.op_C4Object_() != null) {
      if (!this.Exit(this.GetX(), this.GetY())) {
        return false;
      }
    }
    if (this.Contained.op_C4Object_() != null || this.Status === 0 || pTarget[0].Status === 0) {
      return false;
    }
    if (this.Menu != null) {
      this.CloseMenu(true);
      if (this.Contained.op_C4Object_() != null || this.Status === 0 || pTarget[0].Status === 0) {
        return false;
      }
    }
    this.SetOCF();
    this.Contained.op_assign(pTarget[0]);
    if (!this.Contained.op_arrow().Contents.Add$pC4Object$i32$pC4ObjectList(this, 2 /*stContents*/)) {
      this.Contained.op_assign(null);
      return false;
    }
    if (!this.Alive) {
      this.Controller = pTarget[0].Controller;
    }
    if (fCopyMotion) {
      this.UpdateSolidMask(false);
      this.CopyMotion(this.Contained.op_C4Object_());
    }
    this.SetOCF();
    this.UpdateFace(true);
    this.Contained.op_arrow().UpdateMass();
    this.Contained.op_arrow().SetOCF();
    $.ObjectListChangeListener.OnObjectContainerChanged(this, null, this.Contained.op_C4Object_());
    if (fCalls) {
      pTarget[0].Call$pi8$pC4AulParSet$b(S("~Collection2"), new $.C4AulParSet().init$mpC4Object(this).op_and());
    }
    if (this.Contained.op_not() || !(this.Contained.op_arrow().Status !== 0) || pTarget[0].Status === 0) {
      return true;
    }
    if (fCalls) {
      this.Call$pi8$pC4AulParSet$b(S("~Entrance"), new $.C4AulParSet().init$rC4ObjectPtr(this.Contained).op_and());
    }
    if (this.Contained.op_not() || !(this.Contained.op_arrow().Status !== 0) || pTarget[0].Status === 0) {
      return true;
    }
    return true;
  }

  Exit(iX = 0, iY = 0, iR = 0, iXDir = $.Fix0$C4Real.$clone(), iYDir = $.Fix0$C4Real.$clone(), iRDir = $.Fix0$C4Real.$clone(), fCalls = true) {
    const pContainer = [this.Contained.op_C4Object_()];
    if (pContainer[0] == null) {
      return false;
    }
    pContainer[0].Contents.Remove(this);
    pContainer[0].UpdateMass();
    pContainer[0].SetOCF();
    this.Contained.op_assign(null);
    this.fix_x.$assign($.itofix$i32(iX));
    this.fix_y.$assign($.itofix$i32(iY));
    this.fix_r.$assign($.itofix$i32(iR));
    this.BoundsCheck(this.fix_x, this.fix_y);
    this.xdir.$assign(iXDir);
    this.ydir.$assign(iYDir);
    this.rdir.$assign(iRDir);
    this.Mobile = true;
    this.InLiquid = false;
    this.CloseMenu(true);
    this.UpdateFace(true);
    this.SetOCF();
    $.ObjectListChangeListener.OnObjectContainerChanged(this, pContainer[0], null);
    if (fCalls) {
      pContainer[0].Call$pi8$pC4AulParSet$b(S("~Ejection"), new $.C4AulParSet().init$mpC4Object(this).op_and());
    }
    if (fCalls) {
      this.Call$pi8$pC4AulParSet$b(S("~Departure"), new $.C4AulParSet().init$rpC4Object(P(pContainer, 0)).op_and());
    }
    return this.Contained.op_not();
  }

  CopyMotion(from_object) {
    if (this.fix_x.op_ne$C4Fixed(from_object.fix_x) || this.fix_y.op_ne$C4Fixed(from_object.fix_y)) {
      this.fix_x.$assign(from_object.fix_x);
      this.fix_y.$assign(from_object.fix_y);
      this.UpdatePos();
    }
    this.xdir.$assign(from_object.xdir);
    this.ydir.$assign(from_object.ydir);
  }

  ForcePosition(target_x, target_y) {
    this.fix_x.$assign(target_x);
    this.fix_y.$assign(target_y);
    this.UpdatePos();
    this.UpdateSolidMask(false);
  }

  MovePosition$i32$i32(distance_x, distance_y) {
    this.MovePosition$C4Fixed$C4Fixed($.itofix$i32(distance_x), $.itofix$i32(distance_y));
  }

  MovePosition$C4Fixed$C4Fixed(distance_x, distance_y) {
    this.RemoveSolidMask(true);
    this.fix_x.op_addAssign$C4Fixed(distance_x);
    this.fix_y.op_addAssign$C4Fixed(distance_y);
    this.UpdatePos();
    this.UpdateSolidMask(true);
  }

  DoMotion(distance_x, distance_y) {
    this.RemoveSolidMask(true);
    this.fix_x.op_addAssign$i32(distance_x);
    this.fix_y.op_addAssign$i32(distance_y);
  }

  ActivateEntrance(_by_plr, by_obj$) {
    const by_obj = [by_obj$];
    if ((this.OCF & 2048) >>> 0 !== 0) {
      if (!this.Call$pi8$pC4AulParSet$b(S("~ActivateEntrance"), new $.C4AulParSet().init$rpC4Object(P(by_obj, 0)).op_and()).op_not()) {
        return true;
      }
    }
    return false;
  }

  DoDamage$i32$i32$i32(iChange$, iCausedBy$, iCause$) {
    const iChange = [iChange$];
    const iCausedBy = [iCausedBy$];
    const iCause = [iCause$];
    if (this.pEffects != null && !this.Alive) {
      this.pEffects.DoDamage$ri32$i32$i32(P(iChange, 0), iCause[0], iCausedBy[0]);
      if (iChange[0] === 0) {
        return;
      }
    }
    this.Damage = $max(this.Damage + iChange[0] | 0, 0);
    this.Call$pi8$pC4AulParSet$b(S("~Damage"), new $.C4AulParSet().init$ri32$ri32$ri32(P(iChange, 0), P(iCause, 0), P(iCausedBy, 0)).op_and());
  }

  DoEnergy(iChange$, fExact, iCause$, iCausedByPlr$) {
    const iChange = [iChange$];
    const iCause = [iCause$];
    const iCausedByPlr = [iCausedByPlr$];
    if (!fExact) {
      let scale = 1000;
      iChange[0] = Math.imul($.Clamp$i32$i32$i32(iChange[0], -0x80000000 / scale | 0, 0x7fffffff / scale | 0), scale);
    }
    let fWasZero = this.Energy === 0;
    if (iChange[0] < 0) {
      this.UpdatLastEnergyLossCause(iCausedByPlr[0]);
    }
    if (this.pEffects != null && this.Alive) {
      this.pEffects.DoDamage$ri32$i32$i32(P(iChange, 0), iCause[0], iCausedByPlr[0]);
    }
    iChange[0] = $.Clamp$i32$i32$i32(iChange[0], -this.Energy | 0, this.GetPropertyInt(71 /*P_MaxEnergy*/) - this.Energy | 0);
    this.Energy = this.Energy + iChange[0] | 0;
    this.Call$pi8$pC4AulParSet$b(S("~OnEnergyChange"), new $.C4AulParSet().init$ri32$ri32$ri32(P(iChange, 0), P(iCause, 0), P(iCausedByPlr, 0)).op_and());
    if (this.Alive) {
      if (this.Energy === 0) {
        if (!fWasZero) {
          this.AssignDeath(false);
        }
      }
    }
  }

  UpdatLastEnergyLossCause(iNewCausePlr) {
    if (iNewCausePlr !== this.Controller || this.LastEnergyLossCausePlayer < 0) {
      this.LastEnergyLossCausePlayer = iNewCausePlr;
    }
  }

  DoBreath(iChange$) {
    const iChange = [iChange$];
    iChange[0] = $.Clamp$i32$i32$i32(iChange[0], -this.Breath | 0, this.GetPropertyInt(72 /*P_MaxBreath*/) - this.Breath | 0);
    this.Breath = this.Breath + iChange[0] | 0;
    this.Call$pi8$pC4AulParSet$b(S("~OnBreathChange"), new $.C4AulParSet().init$ri32(P(iChange, 0)).op_and());
  }

  DoCon(iChange, grow_from_center) {
    let strgt_con_b = this.fix_y.op_add$i32(this.Shape.GetBottom$v());
    let fWasFull = this.Con >= 100000;
    const old_con = [this.Con];
    if (this.Def.Oversize !== 0) {
      this.Con = $max(this.Con + iChange | 0, 0);
    } else {
      this.Con = $.Clamp$i32$i32$i32(this.Con + iChange | 0, 0, 100000);
    }
    this.SetOCF();
    this.UpdateMass();
    this.UpdateShape();
    if (!grow_from_center) {
      this.fix_y.$assign(strgt_con_b.op_sub$i32(this.Shape.GetBottom$v()));
    }
    this.UpdateFace(false);
    if (iChange !== 0) {
      this.Call$pi8$pC4AulParSet$b(S("~OnCompletionChange"), new $.C4AulParSet().init$ri32$ri32(P(old_con, 0), P(this, "Con")).op_and());
    }
    if (fWasFull && this.Con < 100000) {
      if (this.Def.IncompleteActivity === 0) {
        let cobj = null;
        while ((cobj = this.Contents.GetObject()) != null) {
          if (this.Contained.op_C4Object_() != null) {
            cobj.Enter(this.Contained.op_C4Object_());
          } else {
            cobj.Exit(cobj.GetX(), cobj.GetY());
          }
        }
        this.SetAction(null);
      }
    }
    if (!fWasFull && this.Con >= 100000) {
      this.Call$pi8$pC4AulParSet$b(S("~Initialize"));
    }
    if (this.Con <= 0) {
      this.AssignRemoval();
    } else if (this.pMeshInstance != null) {
      this.pMeshInstance.SetCompletion(this.Def.GrowthType !== 0 ? 1 : Math.fround(Math.fround(this.Con) / Math.fround(100000)));
    }
  }

  GetCon() {
    return this.Con;
  }

  DoExperience(change) {
    let MaxExperience = 0x5f5e100;
    if (this.Info == null) {
      return;
    }
    this.Info.Experience = $.Clamp$i32$i32$i32(this.Info.Experience + change | 0, 0, 0x5f5e100);
    if (this.Info.Experience < 0x5f5e100) {
      if (this.Info.Experience >= $.DefaultRanks.Experience(this.Info.Rank + 1 | 0)) {
        this.Promote(this.Info.Rank + 1 | 0, false, false);
      }
    }
  }

  Promote(torank, _exception, fForceRankName) {
    if (this.Info == null) {
      return false;
    }
    let pUseDef = $.C4Id2Def(this.Info.id.$clone());
    let pRankSys = null;
    if (pUseDef != null && pUseDef.pRankNames != null) {
      pRankSys = pUseDef.pRankNames;
    } else {
      pRankSys = $.DefaultRanks;
    }
    this.Info.Promote(torank, pRankSys, fForceRankName);
    if (pRankSys.GetRankName(torank, false).op_not()) {
      return false;
    }
    $.GameMsgObject($.FormatString($.LoadResStr(S("IDS_OBJ_PROMOTION")), this.GetName(), this.Info.sRankName.getData()).getData(), this);
    this.Call$pi8$pC4AulParSet$b(S("~OnPromotion"));
    $.StartSoundEffect(S("UI::Trumpet"), false, 100, this);
    return true;
  }

  Push(txdir, dforce, fStraighten) {
    if (this.Status === 0 || this.Def == null || this.Contained.op_C4Object_() != null || !((this.OCF & 4) >>> 0 !== 0)) {
      return false;
    }
    if (this.GetPropertyInt(14 /*P_Touchable*/) === 2) {
      return true;
    }
    if (!this.Mobile) {
      this.xdir.$assign(this.ydir.$assign($.Fix0$C4Real));
    }
    dforce.$assign(dforce.op_mul$i32(100).op_div$i32(this.Mass));
    if (this.xdir.op_lt$i32(0)) {
      this.SetDir(0);
    }
    if (this.xdir.op_gt$i32(0)) {
      this.SetDir(1);
    }
    if ($.Abs$C4Fixed(this.xdir.op_sub$C4Fixed(txdir)).op_le$C4Fixed(dforce)) {
      this.xdir.$assign(txdir);
    } else {
      if (this.xdir.op_lt$C4Fixed(txdir)) {
        this.xdir.op_addAssign$C4Fixed(dforce);
      }
      if (this.xdir.op_gt$C4Fixed(txdir)) {
        this.xdir.op_subAssign$C4Fixed(dforce);
      }
    }
    if (fStraighten) {
      if ($.Inside$i32$i32$i32$3(this.GetR(), -10, 10)) {
        this.rdir.op_assign(0);
      } else {
        if (this.fix_r.op_gt$C4Fixed($.Fix0$C4Real)) {
          if (this.rdir.op_gt$C4Fixed($.RotateAccel.op_neg())) {
            this.rdir.op_subAssign$C4Fixed(dforce);
          }
        } else {
          if (this.rdir.op_lt$C4Fixed($.RotateAccel.op_pos())) {
            this.rdir.op_addAssign$C4Fixed(dforce);
          }
        }
      }
    }
    if (!this.xdir.op_not() || !this.ydir.op_not() || !this.rdir.op_not()) {
      this.Mobile = true;
    }
    if ($.Game.iTick35 === 0 && txdir.op_bool() && this.Def.NoHorizontalMove === 0 && this.ContactCheck(this.GetX(), this.GetY()) !== 0) {
      $.GameMsgObjectError($.FormatString($.LoadResStr(S("IDS_OBJ_STUCK")), this.GetName()).getData(), this);
      this.Call$pi8$pC4AulParSet$b(S("~Stuck"));
    }
    return true;
  }

  Lift(tydir, dforce) {
    if (this.Status === 0 || this.Def == null || this.Contained.op_C4Object_() != null) {
      return false;
    }
    if (!this.Mobile) {
      this.xdir.$assign(this.ydir.$assign($.Fix0$C4Real));
      this.Mobile = true;
    }
    dforce.$assign(dforce.op_mul$i32(100).op_div$i32(this.Mass));
    if ($.Abs$C4Fixed(tydir.op_sub$C4Fixed(this.ydir)).op_le$C4Fixed($.Abs$C4Fixed(dforce.$clone()))) {
      this.ydir.$assign(tydir);
    } else {
      if (this.ydir.op_lt$C4Fixed(tydir)) {
        this.ydir.op_addAssign$C4Fixed(dforce);
      }
      if (this.ydir.op_gt$C4Fixed(tydir)) {
        this.ydir.op_subAssign$C4Fixed(dforce);
      }
    }
    if (tydir.op_ne$C4Fixed($.Landscape.GetGravity().op_neg()) && this.ContactCheck(this.GetX(), this.GetY()) !== 0) {
      $.GameMsgObjectError($.FormatString($.LoadResStr(S("IDS_OBJ_STUCK")), this.GetName()).getData(), this);
      this.Call$pi8$pC4AulParSet$b(S("~Stuck"));
    }
    return true;
  }

  Fling(fling_xdir, fling_ydir, add_speed) {
    if (add_speed) {
      fling_xdir.op_addAssign$C4Fixed(this.xdir.op_div$i32(2));
      fling_ydir.op_addAssign$C4Fixed(this.ydir.op_div$i32(2));
    }
    if (!$.ObjectActionTumble(this, fling_xdir.op_lt$i32(0) ? 1 : 0, fling_xdir.$clone(), fling_ydir.$clone()) && !$.ObjectActionJump(this, fling_xdir.$clone(), fling_ydir.$clone(), false)) {
      this.xdir.$assign(fling_xdir);
      this.ydir.$assign(fling_ydir);
      this.Mobile = true;
      this.Action.t_attach &= -9;
    }
  }

  CreateContents(PropList) {
    let nobj = null;
    if (!((nobj = $.Game.CreateObject$pC4PropList$pC4Object$i32$i32$i32$i32$b$C4Fixed$C4Fixed$C4Fixed$i32(PropList, this, this.Owner)) != null)) {
      return null;
    }
    if (!nobj.Enter(this)) {
      nobj.AssignRemoval();
      return null;
    }
    return nobj;
  }

  CreateContentsByList(idlist) {
    let cnt = 0;
    let cnt2 = 0;
    for (cnt = 0; idlist.GetID$u64$pi32($u64n(cnt)).op_unsigned_long_C4ID_() != null; cnt = cnt + 1 | 0) {
      for (cnt2 = 0; cnt2 < idlist.GetCount$u64($u64n(cnt)); cnt2 = cnt2 + 1 | 0) {
        if (!(this.CreateContents($.C4Id2Def(idlist.GetID$u64$pi32($u64n(cnt)))) != null)) {
          return false;
        }
      }
    }
    return true;
  }

  GetArea(aX, aY, aWdt, aHgt) {
    if (this.Status === 0 || this.Def == null) {
      return 0;
    }
    aX.a[aX.o] = this.GetX() + this.Shape.GetX() | 0;
    aY.a[aY.o] = this.GetY() + this.Shape.GetY() | 0;
    aWdt.a[aWdt.o] = this.Shape.Wdt;
    aHgt.a[aHgt.o] = this.Shape.Hgt;
    return 1;
  }

  addtop() {
    return $max(18 - this.Shape.Hgt | 0, 0);
  }

  Left() {
    return this.GetX() + this.Shape.x | 0;
  }

  Top() {
    return (this.GetY() + this.Shape.y | 0) - this.addtop() | 0;
  }

  Width() {
    return this.Shape.Wdt;
  }

  Height() {
    return this.Shape.Hgt + this.addtop() | 0;
  }

  GetX() {
    return $.fixtoi$C4Fixed(this.fix_x);
  }

  GetY() {
    return $.fixtoi$C4Fixed(this.fix_y);
  }

  GetR() {
    return $.fixtoi$C4Fixed(this.fix_r);
  }

  GetFixedX() {
    return this.fix_x.$clone();
  }

  GetFixedY() {
    return this.fix_y.$clone();
  }

  GetFixedR() {
    return this.fix_r.$clone();
  }

  GetEntranceArea(aX, aY, aWdt, aHgt) {
    if (this.Status === 0 || this.Def == null) {
      return 0;
    }
    if ((this.OCF & 2048) >>> 0 !== 0) {
      aX.a[aX.o] = this.GetX() + this.Def.Entrance.x | 0;
      aY.a[aY.o] = this.GetY() + this.Def.Entrance.y | 0;
      aWdt.a[aWdt.o] = this.Def.Entrance.Wdt;
      aHgt.a[aHgt.o] = this.Def.Entrance.Hgt;
    } else {
      aX.a[aX.o] = this.GetX();
      aY.a[aY.o] = this.GetY();
      aWdt.a[aWdt.o] = 0;
      aHgt.a[aHgt.o] = 0;
    }
    return 1;
  }

  GetMomentum(rxdir, rydir) {
    rxdir.$assign(rydir.op_assign(0));
    if (this.Status === 0 || this.Def == null) {
      return 0;
    }
    rxdir.$assign(this.xdir);
    rydir.$assign(this.ydir);
    return 1;
  }

  GetSpeed() {
    let speed = $.Fix0$C4Real.$clone();
    if (this.xdir.op_lt$i32(0)) {
      speed.op_subAssign$C4Fixed(this.xdir);
    } else {
      speed.op_addAssign$C4Fixed(this.xdir);
    }
    if (this.ydir.op_lt$i32(0)) {
      speed.op_subAssign$C4Fixed(this.ydir);
    } else {
      speed.op_addAssign$C4Fixed(this.ydir);
    }
    return speed;
  }

  GetDataString$v() {
    let Output = new $.StdStrBuf();
    Output.AppendFormat($.LoadResStr(S("IDS_CNS_TYPE")), this.GetName(), this.Def.id.ToString());
    if ($.ValidPlr(this.Owner) !== 0) {
      Output.Append$pi8(S("\n"));
      Output.AppendFormat($.LoadResStr(S("IDS_CNS_OWNER")), $.Players.Get(this.Owner).GetName());
    }
    if (this.Contents.ObjectCount() !== 0) {
      Output.Append$pi8(S("\n"));
      Output.Append$pi8($.LoadResStr(S("IDS_CNS_CONTENTS")));
      Output.Append$StdStrBuf(this.Contents.GetNameList($.Definitions));
    }
    if (this.GetAction() != null) {
      Output.Append$pi8(S("\n"));
      Output.Append$pi8($.LoadResStr(S("IDS_CNS_ACTION")));
      Output.Append$pi8(this.GetAction().GetName());
    }
    Output.Append$pi8(S("\n"));
    Output.Append$pi8($.LoadResStr(S("IDS_CNS_PROPERTIES")));
    Output.Append$pi8(S("\n  "));
    this.AppendDataString(Output, S("\n  "));
    if (this.pEffects != null) {
      Output.Append$pi8(S("\n"));
      Output.Append$pi8($.LoadResStr(S("IDS_CNS_EFFECTS")));
      Output.Append$pi8(S(": "));
    }
    for (let pEffect = this.pEffects; pEffect != null; pEffect = pEffect.pNext) {
      Output.Append$pi8(S("\n"));
      Output.AppendFormat(S("  %s: Priority %d, Interval %d"), pEffect.GetName(), pEffect.iPriority, pEffect.iInterval);
    }
    let Output2 = new $.StdStrBuf();
    let numbers = new $.C4ValueNumbers().init();
    $.DecompileToBuf_Log$mStdNamingAdapt$StdInsertAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers$StdNamingAdapt$C4ValueNumbers$px$pi8($.mkNamingAdapt$mStdInsertAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers$StdNamingAdapt$C4ValueNumbers$pi8($.mkInsertAdapt$mStdParameterAdapt$C4Object$pC4ValueNumbers$mStdNamingAdapt$C4ValueNumbers$b($.mkParAdapt$rC4Object$mpC4ValueNumbers(this, numbers), $.mkNamingAdapt$rC4ValueNumbers$pi8(numbers, S("Values")), false), S("Object")), Output2, S("C4Object::GetDataString"));
    Output.Append$pi8(S("\n"));
    Output.Append$StdStrBuf(Output2);
    return Output;
  }

  SetName(NewName = null) {
    if (NewName == null && this.Info != null) {
      $.C4PropList.prototype.SetName.call(this, P(this.Info.Name, 0));
    } else {
      $.C4PropList.prototype.SetName.call(this, NewName);
    }
  }

  GetValue(pInBase$, iForPlayer$) {
    const pInBase = [pInBase$];
    const iForPlayer = [iForPlayer$];
    let r = this.Call$pi8$pC4AulParSet$b(S("~CalcValue"), new $.C4AulParSet().init$rpC4Object$ri32(P(pInBase, 0), P(iForPlayer, 0)).op_and());
    const iValue = [0];
    if (r.op_ne($.C4VNull)) {
      iValue[0] = r.getInt();
    } else {
      iValue[0] = this.Def.GetValue(null, iForPlayer[0]);
    }
    iValue[0] = Math.imul(iValue[0], this.Con) / 100000 | 0;
    if (pInBase[0] != null) {
      r.$assign(pInBase[0].Call$pi8$pC4AulParSet$b(S("~CalcSellValue"), new $.C4AulParSet().init$mpC4Object$ri32(this, P(iValue, 0)).op_and()));
      if (r.op_ne($.C4VNull)) {
        iValue[0] = r.getInt();
      }
    }
    return iValue[0];
  }

  SetOwner(iOwner) {
    if (!($.ValidPlr(iOwner) !== 0 || iOwner === -1)) {
      return false;
    }
    if (iOwner !== -1) {
      if (this.GetGraphics().IsColorByOwner()) {
        this.Color = $.Players.Get(iOwner).ColorDw;
        this.UpdateFace(false);
      }
    }
    if (this.Owner === iOwner) {
      return true;
    }
    const iOldOwner = [this.Owner];
    this.Owner = iOwner;
    this.Controller = this.Owner;
    this.Call$pi8$pC4AulParSet$b(S("~OnOwnerChanged"), new $.C4AulParSet().init$ri32$ri32(P(this, "Owner"), P(iOldOwner, 0)).op_and());
    return true;
  }

  SetLightRange(iToRange, iToFadeoutRange) {
    this.lightRange = iToRange;
    this.lightFadeoutRange = iToFadeoutRange;
    this.UpdateLight();
    return true;
  }

  GetLightColor() {
    return this.lightColor;
  }

  SetLightColor(iValue) {
    this.lightColor = iValue;
    this.UpdateLight();
    return true;
  }

  SetOnFire(OnFire) {
    this.OnFire = OnFire;
    this.SetOCF();
  }

  GetOnFire() {
    return this.OnFire;
  }

  SetAlive(Alive) {
    this.Alive = Alive;
    this.SetOCF();
  }

  GetAlive() {
    return this.Alive;
  }

  UpdateLight() {
    if ($.Landscape.HasFoW()) {
      $.Landscape.GetFoW().Add(this);
    }
  }

  SetAudibilityAt(cgo, iX, iY, player) {
    const offX = [0];
    const offY = [0];
    const newzoom = [0];
    this.GetDrawPosition$C4TargetFacet$f32$f32$f32$rf32$rf32$rf32(cgo, Math.fround(iX), Math.fround(iY), cgo.Zoom, P(offX, 0), P(offY, 0), P(newzoom, 0));
    let audible_at_pos = $.Clamp$i32$i32$i32(100 - (Math.imul(100, $.Distance(ftoi32(Math.fround(cgo.X + Math.fround(cgo.Wdt / Math.fround(2)))), ftoi32(Math.fround(cgo.Y + Math.fround(cgo.Hgt / Math.fround(2)))), ftoi32(offX[0]), ftoi32(offY[0]))) / 700 | 0) | 0, 0, 100);
    if (audible_at_pos > this.Audible) {
      this.Audible = audible_at_pos;
      this.AudiblePan = $.Clamp$i32$i32$i32(ftoi32(Math.fround(Math.fround(Math.fround(200) * Math.fround(Math.fround(offX[0] - cgo.X) - Math.fround(cgo.Wdt / Math.fround(2)))) / cgo.Wdt)), -100, 100);
      this.AudiblePlayer = player;
    }
  }

  IsVisible(iForPlr, fAsOverlay) {
    let fDraw = false;
    let vis = new $.C4Value().init$v();
    if (!this.GetProperty(17 /*P_Visibility*/, vis)) {
      return true;
    }
    let Visibility = 0;
    let parameters = vis.getArray();
    if (parameters != null && parameters.GetSize() !== 0) {
      Visibility = parameters.GetItem(0).getInt();
    } else {
      Visibility = vis.getInt();
    }
    if (this.Layer.op_C4Object_() != null && this.Layer.op_C4Object_() !== this && !fAsOverlay) {
      fDraw = this.Layer.op_arrow().IsVisible(iForPlr, false);
      if ((this.Layer.op_arrow().GetPropertyInt(17 /*P_Visibility*/) & 64) !== 0) {
        fDraw = !fDraw;
      }
      if (!fDraw) {
        return false;
      }
    }
    if (Visibility === 0) {
      return true;
    }
    if ((Visibility & 128) !== 0) {
      if (!fAsOverlay) {
        return false;
      }
      if (Visibility === 128) {
        return true;
      }
    }
    if ($.Application.isEditor !== 0) {
      if ((Visibility & 256) !== 0) {
        return true;
      }
    }
    fDraw = false;
    if ((Visibility & 2) !== 0) {
      fDraw = fDraw || iForPlr === this.Owner;
    }
    if (iForPlr !== -1) {
      if ((Visibility & 4) !== 0) {
        fDraw = fDraw || iForPlr !== this.Owner && !($.Hostile(iForPlr, this.Owner) !== 0);
      }
      if ((Visibility & 8) !== 0) {
        fDraw = fDraw || iForPlr !== this.Owner && $.Hostile(iForPlr, this.Owner) !== 0;
      }
      if (parameters != null) {
        if ((Visibility & 16) !== 0) {
          fDraw = fDraw || parameters.GetItem(1 + iForPlr | 0).getBool();
        }
      }
    } else {
      fDraw = fDraw || (Visibility & 32) !== 0;
    }
    return fDraw;
  }

  SetRotation(new_rotation) {
    while (new_rotation < 0) {
      new_rotation = new_rotation + 360 | 0;
    }
    new_rotation = new_rotation % 360;
    this.RemoveSolidMask(false);
    this.fix_r.$assign($.itofix$i32(new_rotation));
    this.UpdateFace(true);
  }

  PrepareDrawing() {
    if (this.ColorMod !== 0xffffffff || (this.BlitMode & 10) >>> 0 !== 0) {
      $.pDraw.ActivateBlitModulation(this.ColorMod);
    }
    $.pDraw.SetBlitMode(this.BlitMode);
  }

  FinishedDrawing() {
    $.pDraw.DeactivateBlitModulation();
    $.pDraw.ResetBlitMode();
  }

  DrawSolidMask(cgo) {
    if (this.pSolidMaskData != null) {
      this.pSolidMaskData.Draw(cgo);
    }
  }

  Collect(pObj$) {
    const pObj = [pObj$];
    const fRejectCollect = [false];
    if (!pObj[0].Enter(this, true, false, P(fRejectCollect, 0))) {
      return false;
    }
    $.ObjectComCancelAttach(pObj[0]);
    this.Call$pi8$pC4AulParSet$b(S("~Collection"), new $.C4AulParSet().init$rpC4Object(P(pObj, 0)).op_and());
    if (pObj[0].Status !== 0 && (pObj[0].OCF & 32) >>> 0 !== 0) {
      pObj[0].Call$pi8$pC4AulParSet$b(S("~Hit"));
    }
    if (pObj[0].Status !== 0 && (pObj[0].OCF & 4096) >>> 0 !== 0) {
      pObj[0].Call$pi8$pC4AulParSet$b(S("~Hit2"));
    }
    if (pObj[0].Status !== 0 && (pObj[0].OCF & 8192) >>> 0 !== 0) {
      pObj[0].Call$pi8$pC4AulParSet$b(S("~Hit3"));
    }
    if (pObj[0].Contained.op_eq$pC4Object(this)) {
      pObj[0].CopyMotion(this);
    }
    return true;
  }

  GrabInfo(pFrom) {
    if (pFrom == null) {
      return false;
    }
    if (this.Status === 0 || pFrom.Status === 0) {
      return false;
    }
    if (pFrom === this) {
      return true;
    }
    if (pFrom.Info == null) {
      return false;
    }
    if (this.Info != null) {
      this.Info.Retire();
      this.ClearInfo(this.Info);
    }
    $.Players.ClearPointers(pFrom);
    $.Players.ClearPointers(this);
    this.Info = pFrom.Info;
    pFrom.ClearInfo(pFrom.Info);
    this.SetName(P(this.Info.Name, 0));
    this.Info.Retire();
    if (this.Alive) {
      this.Info.Recruit();
    }
    let pPlr = $.Players.Get(this.Owner);
    if (pPlr != null) {
      pPlr.MakeCrewMember(this);
    }
    return true;
  }

  ShiftContents(fShiftBack, fDoCalls) {
    let c_obj = this.Contents.GetObject();
    if (c_obj == null) {
      return false;
    }
    let it = fShiftBack ? this.Contents.reverse().begin() : new $.C4ObjectList$iterator().$copy(this.Contents.begin().op_inc$v());
    while (!it.atEnd()) {
      let pObj = it.op_mul();
      if (pObj.Status !== 0) {
        if (!c_obj.CanConcatPictureWith(pObj)) {
          this.DirectComContents(pObj, !!fDoCalls);
          return true;
        }
      }
      it.op_inc$i32(0);
    }
    return false;
  }

  DirectComContents(pTarget$, fDoCalls) {
    const pTarget = [pTarget$];
    if (pTarget[0] == null || pTarget[0].Status === 0 || pTarget[0].Contained.op_ne$pC4Object(this)) {
      return;
    }
    if (this.Contents.GetObject() === pTarget[0]) {
      return;
    }
    if (fDoCalls) {
      if (this.Call$pi8$pC4AulParSet$b(S("~ControlContents"), new $.C4AulParSet().init$rpC4Object(P(pTarget, 0)).op_and()).op_const_void_() != null) {
        return;
      }
    }
    if (!this.Contents.ShiftContents(pTarget[0])) {
      return;
    }
    if (fDoCalls) {
      if (this.Contents.GetObject().Call$pi8$pC4AulParSet$b(S("~Selection"), new $.C4AulParSet().init$mpC4Object(this).op_and()).op_not()) {
        $.StartSoundEffect(S("Clonk::Action::Grab"), false, 100, this);
      }
    }
    if (this.Menu != null && this.Menu.IsActive$v() && this.Menu.IsContextMenu()) {
      this.Menu.Refill();
    }
    return;
  }

  GetParallaxity(parX, parY) {
    0;
    0;
    parX.a[parX.o] = 100;
    parY.a[parY.o] = 100;
    if ((this.Category & 32768) !== 0) {
      parX.a[parX.o] = 0;
      parY.a[parY.o] = 0;
      return;
    }
    if (!((this.Category & 8192) !== 0)) {
      return;
    }
    let parV = new $.C4Value().init$v();
    this.GetProperty(18 /*P_Parallaxity*/, parV);
    let par = parV.getArray();
    if (par == null) {
      return;
    }
    parX.a[parX.o] = par.GetItem(0).getInt();
    parY.a[parY.o] = par.GetItem(1).getInt();
  }

  GetDrawPosition$C4TargetFacet$rf32$rf32$rf32(cgo, resultx, resulty, resultzoom) {
    return this.GetDrawPosition$C4TargetFacet$f32$f32$f32$rf32$rf32$rf32(cgo, $.fixtof(this.fix_x), $.fixtof(this.fix_y), cgo.Zoom, resultx, resulty, resultzoom);
  }

  GetDrawPosition$C4TargetFacet$f32$f32$f32$rf32$rf32$rf32(cgo, objx, objy, zoom, resultx, resulty, resultzoom) {
    if ((this.Category & 32768) !== 0) {
      resultzoom.a[resultzoom.o] = zoom;
      if (this.fix_x.op_lt$i32(0)) {
        resultx.a[resultx.o] = Math.fround(Math.fround(cgo.X + objx) + cgo.Wdt);
      } else {
        resultx.a[resultx.o] = Math.fround(cgo.X + objx);
      }
      if (this.fix_y.op_lt$i32(0)) {
        resulty.a[resulty.o] = Math.fround(Math.fround(cgo.Y + objy) + cgo.Hgt);
      } else {
        resulty.a[resulty.o] = Math.fround(cgo.Y + objy);
      }
      return true;
    }
    const iParX = [0];
    const iParY = [0];
    this.GetParallaxity(P(iParX, 0), P(iParY, 0));
    let targetx = cgo.TargetX;
    let targety = cgo.TargetY;
    let parx = Math.fround(Math.fround(iParX[0]) / 100);
    let pary = Math.fround(Math.fround(iParY[0]) / 100);
    let par = parx;
    resultzoom.a[resultzoom.o] = Math.fround(1 / (1 - Math.fround(par - Math.fround(par / zoom))));
    if (resultzoom.a[resultzoom.o] <= Math.fround(0) || resultzoom.a[resultzoom.o] > Math.fround(100)) {
      return false;
    }
    let rx = Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(1) - parx) * cgo.ParRefX) * resultzoom.a[resultzoom.o]) + Math.fround(objx / Math.fround(Math.fround(parx + zoom) - Math.fround(parx * zoom))));
    let ry = Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(1) - pary) * cgo.ParRefY) * resultzoom.a[resultzoom.o]) + Math.fround(objy / Math.fround(Math.fround(pary + zoom) - Math.fround(pary * zoom))));
    if (parx === Math.fround(0) && this.fix_x.op_lt$i32(0)) {
      resultx.a[resultx.o] = Math.fround(cgo.X + Math.fround(Math.fround(Math.fround(objx + cgo.Wdt) * zoom) / resultzoom.a[resultzoom.o]));
    } else {
      resultx.a[resultx.o] = Math.fround(cgo.X + Math.fround(Math.fround(Math.fround(rx - targetx) * zoom) / resultzoom.a[resultzoom.o]));
    }
    if (pary === Math.fround(0) && this.fix_y.op_lt$i32(0)) {
      resulty.a[resulty.o] = Math.fround(cgo.Y + Math.fround(Math.fround(Math.fround(objy + cgo.Hgt) * zoom) / resultzoom.a[resultzoom.o]));
    } else {
      resulty.a[resulty.o] = Math.fround(cgo.Y + Math.fround(Math.fround(Math.fround(ry - targety) * zoom) / resultzoom.a[resultzoom.o]));
    }
    return true;
  }

  IsInLiquidCheck() {
    return $.GBackLiquid(this.GetX(), (this.GetY() + (Math.imul(this.Def.Float, this.Con) / 100000 | 0) | 0) - 1 | 0);
  }

  UpdateInLiquid() {
    if (this.IsInLiquidCheck()) {
      if (!this.InLiquid) {
        if ((this.OCF & 4096) >>> 0 !== 0 && this.Mass > 3) {
          this.Splash();
        }
        this.InLiquid = true;
      }
    } else if (this.InLiquid) {
      this.InLiquid = false;
    }
  }

  GrabContents(pFrom) {
    let $t1, $t2, $t3;
    let tmpList = new $.C4ObjectList().init();
    tmpList.Copy(pFrom.Contents);
    $t1 = tmpList;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    try {
      for (; $t2.op_ne($t3); $t2.op_inc$v()) {
        const obj = $t2.op_mul();
        if (obj.Status !== 0) {
          obj.Enter(this);
        }
      }
    } finally { $t2.$dtor(); $t3.$dtor(); }
  }

  GetDragImage(drag_object, drag_def) {
    let parV = new $.C4Value().init$v();
    this.GetProperty(66 /*P_MouseDragImage*/, parV);
    if (parV.op_not()) {
      return false;
    }
    let obj = parV.getObj();
    let def = null;
    if (obj == null) {
      def = parV.getDef();
    }
    if (drag_object != null) {
      drag_object.a[drag_object.o] = obj;
    }
    if (drag_def != null) {
      drag_def.a[drag_def.o] = def;
    }
    return true;
  }

  AddObjectAndContentsToArray(target_array, index = 0) {
    let $t1, $t2, $t3, $t4;
    target_array.SetItem(($t1 = index, index = index + 1 | 0, $t1), $.C4VObj(this));
    $t2 = this.Contents;
    $t3 = $t2.begin();
    $t4 = $t2.end();
    try {
      for (; $t3.op_ne($t4); $t3.op_inc$v()) {
        const cobj = $t3.op_mul();
        index = cobj.AddObjectAndContentsToArray(target_array, index);
      }
    } finally { $t3.$dtor(); $t4.$dtor(); }
    return index;
  }

  SideBounds(target_x) {
    if (this.Layer.op_C4Object_() != null && (this.Layer.op_arrow().GetPropertyInt(79 /*P_BorderBound*/) & 8) !== 0) {
      let pActionDef = this.GetAction();
      if (pActionDef == null || pActionDef.GetPropertyP(23 /*P_Procedure*/) !== 246) {
        let lbound = $.itofix$i32((this.Layer.op_arrow().GetX() + this.Layer.op_arrow().Shape.GetX() | 0) - this.Shape.GetX() | 0);
        let rbound = $.itofix$i32(((this.Layer.op_arrow().GetX() + this.Layer.op_arrow().Shape.GetX() | 0) + this.Layer.op_arrow().Shape.Wdt | 0) - (this.Shape.GetX() + this.Shape.Wdt | 0) | 0);
        if (target_x.op_lt$C4Fixed(lbound)) {
          this.StopAndContact(target_x, lbound.$clone(), this.xdir, 1);
        }
        if (target_x.op_gt$C4Fixed(rbound)) {
          this.StopAndContact(target_x, rbound.$clone(), this.xdir, 2);
        }
      }
    }
    let lbound = $.itofix$i32(0 - this.Shape.GetX() | 0);
    let rbound = $.itofix$i32($.Landscape.GetWidth() - (this.Shape.GetX() + this.Shape.Wdt | 0) | 0);
    if (target_x.op_lt$C4Fixed(lbound) && (this.GetPropertyInt(79 /*P_BorderBound*/) & 1) !== 0) {
      this.StopAndContact(target_x, lbound.$clone(), this.xdir, 1);
    }
    if (target_x.op_gt$C4Fixed(rbound) && (this.GetPropertyInt(79 /*P_BorderBound*/) & 1) !== 0) {
      this.StopAndContact(target_x, rbound.$clone(), this.xdir, 2);
    }
  }

  VerticalBounds(target_y) {
    if (this.Layer.op_C4Object_() != null && (this.Layer.op_arrow().GetPropertyInt(79 /*P_BorderBound*/) & 8) !== 0) {
      let pActionDef = this.GetAction();
      if (pActionDef == null || pActionDef.GetPropertyP(23 /*P_Procedure*/) !== 246) {
        let tbound = $.itofix$i32((this.Layer.op_arrow().GetY() + this.Layer.op_arrow().Shape.GetY() | 0) - this.Shape.GetY() | 0);
        let bbound = $.itofix$i32(((this.Layer.op_arrow().GetY() + this.Layer.op_arrow().Shape.GetY() | 0) + this.Layer.op_arrow().Shape.Hgt | 0) - (this.Shape.GetY() + this.Shape.Hgt | 0) | 0);
        if (target_y.op_lt$C4Fixed(tbound)) {
          this.StopAndContact(target_y, tbound.$clone(), this.ydir, 4);
        }
        if (target_y.op_gt$C4Fixed(bbound)) {
          this.StopAndContact(target_y, bbound.$clone(), this.ydir, 8);
        }
      }
    }
    let tbound = $.itofix$i32(0 - this.Shape.GetY() | 0);
    let bbound = $.itofix$i32($.Landscape.GetHeight() - (this.Shape.GetY() + this.Shape.Hgt | 0) | 0);
    if (target_y.op_lt$C4Fixed(tbound) && (this.GetPropertyInt(79 /*P_BorderBound*/) & 2) !== 0) {
      this.StopAndContact(target_y, tbound.$clone(), this.ydir, 4);
    }
    if (target_y.op_gt$C4Fixed(bbound) && (this.GetPropertyInt(79 /*P_BorderBound*/) & 4) !== 0) {
      this.StopAndContact(target_y, bbound.$clone(), this.ydir, 8);
    }
  }

  BoundsCheck(target_x, target_y) {
    this.SideBounds(target_x);
    this.VerticalBounds(target_y);
  }

  DoSelect() {
    if (this.CrewDisabled) {
      return false;
    }
    this.Call$pi8$pC4AulParSet$b(S("~CrewSelection"), new $.C4AulParSet().init$mb(false).op_and());
    return true;
  }

  UnSelect() {
    this.Call$pi8$pC4AulParSet$b(S("~CrewSelection"), new $.C4AulParSet().init$mb(true).op_and());
  }

  GetViewPos(riX, riY, tx, ty, fctViewport) {
    if ((this.Category & 8192) !== 0) {
      this.GetViewPosPar(riX, riY, tx, ty, fctViewport);
    } else {
      riX.a[riX.o] = Math.fround(this.GetX());
      riY.a[riY.o] = Math.fround(this.GetY());
    }
  }

  GetViewPosPar(riX, riY, tx, ty, fctViewport) {
    const iParX = [0];
    const iParY = [0];
    this.GetParallaxity(P(iParX, 0), P(iParY, 0));
    if (iParX[0] === 0 && this.GetX() < 0) {
      riX.a[riX.o] = Math.fround(Math.fround($.fixtof(this.fix_x) + tx) + fctViewport.Wdt);
    } else {
      riX.a[riX.o] = Math.fround($.fixtof(this.fix_x) - Math.fround(Math.fround(tx * Math.fround(iParX[0] - 100 | 0)) / Math.fround(100)));
    }
    if (iParY[0] === 0 && this.GetY() < 0) {
      riY.a[riY.o] = Math.fround(Math.fround($.fixtof(this.fix_y) + ty) + fctViewport.Hgt);
    } else {
      riY.a[riY.o] = Math.fround($.fixtof(this.fix_y) - Math.fround(Math.fround(ty * Math.fround(iParY[0] - 100 | 0)) / Math.fround(100)));
    }
  }

  PutAwayUnusedObject(pToMakeRoomForObject$) {
    const pToMakeRoomForObject = [pToMakeRoomForObject$];
    let pUnusedObject = null;
    let pFnObj2Drop = this.GetFunc$pi8(S("~GetObject2Drop"));
    if (pFnObj2Drop != null) {
      pUnusedObject = pFnObj2Drop.Exec$pC4PropList$pC4AulParSet$b(this, new $.C4AulParSet().init$rpC4Object(P(pToMakeRoomForObject, 0)).op_and()).getObj();
    } else {
      if (!(this.Contents.GetLastObject() != null)) {
        return false;
      }
      pUnusedObject = this.Contents.GetLastObject();
    }
    if (pUnusedObject == null) {
      return false;
    }
    let fPushing = this.GetProcedure() === 243;
    if (fPushing) {
      if ($.ObjectComPut(this, this.Action.Target.op_C4Object_(), pUnusedObject)) {
        return true;
      }
    }
    if (this.Contained.op_C4Object_() != null) {
      if ($.ObjectComPut(this, this.Contained.op_C4Object_(), pUnusedObject)) {
        return true;
      }
      this.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(12, pUnusedObject);
      this.AddCommand$i32$pC4Object$i32$i32$i32$pC4Object$b$C4Value$b$i32$pC4String$i32(4);
      return true;
    } else {
      return !!$.ObjectComDrop(this, pUnusedObject);
    }
  }

  GetGraphics() {
    return this.pGraphics;
  }

  SetGraphics$pi8$pC4Def(szGraphicsName = null, pSourceDef = null) {
    if (this.Status === 0) {
      return false;
    }
    if (pSourceDef == null) {
      pSourceDef = this.Def;
    }
    let pGrp = pSourceDef.Graphics.Get(szGraphicsName);
    if (pGrp == null) {
      return false;
    }
    this.pGraphics = pGrp;
    this.UpdateGraphics(true);
    return true;
  }

  SetGraphics$pC4DefGraphics$b(pNewGfx, fTemp) {
    if (pNewGfx == null) {
      return false;
    }
    this.pGraphics = pNewGfx;
    this.UpdateGraphics(true, fTemp);
    return true;
  }

  GetGraphicsOverlay$i32(iForID) {
    let pOverlay = this.pGfxOverlay;
    while (pOverlay != null && pOverlay.GetID() < iForID) {
      pOverlay = pOverlay.GetNext();
    }
    if (pOverlay != null && pOverlay.GetID() === iForID) {
      return pOverlay;
    }
    return null;
  }

  GetGraphicsOverlay$i32$b(iForID, fCreate) {
    let pOverlay = this.pGfxOverlay;
    let pPrevOverlay = null;
    while (pOverlay != null && pOverlay.GetID() < iForID) {
      pPrevOverlay = pOverlay;
      pOverlay = pOverlay.GetNext();
    }
    if (pOverlay != null && pOverlay.GetID() === iForID) {
      return pOverlay;
    }
    if (!fCreate) {
      return null;
    }
    let pNewOverlay = new $.C4GraphicsOverlay().init();
    pNewOverlay.SetID(iForID);
    pNewOverlay.SetNext(pOverlay);
    if (pPrevOverlay != null) {
      pPrevOverlay.SetNext(pNewOverlay);
    } else {
      this.pGfxOverlay = pNewOverlay;
    }
    return pNewOverlay;
  }

  RemoveGraphicsOverlay(iOverlayID) {
    let pOverlay = this.pGfxOverlay;
    let pPrevOverlay = null;
    while (pOverlay != null && pOverlay.GetID() < iOverlayID) {
      pPrevOverlay = pOverlay;
      pOverlay = pOverlay.GetNext();
    }
    if (pOverlay != null && pOverlay.GetID() === iOverlayID) {
      if (pPrevOverlay != null) {
        pPrevOverlay.SetNext(pOverlay.GetNext());
      } else {
        this.pGfxOverlay = pOverlay.GetNext();
      }
      pOverlay.SetNext(null);
      $delete(pOverlay);
      return true;
    }
    return false;
  }

  HasGraphicsOverlayRecursion(pCheckObj) {
    let pGfxOvrlObj = null;
    if (this.pGfxOverlay != null) {
      for (let pGfxOvrl = this.pGfxOverlay; pGfxOvrl != null; pGfxOvrl = pGfxOvrl.GetNext()) {
        if ((pGfxOvrlObj = pGfxOvrl.GetOverlayObject()) != null) {
          if (pGfxOvrlObj === pCheckObj) {
            return true;
          }
          if (pGfxOvrlObj.HasGraphicsOverlayRecursion(pCheckObj)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  UpdateScriptPointers() {
    if (this.pEffects != null) {
      this.pEffects.ReAssignAllCallbackFunctions();
    }
  }

  StatusActivate() {
    $.Objects.InactiveObjects.Remove(this);
    this.Status = 1;
    $.Objects.Add$pC4Object(this);
    this.UpdateGraphics(false);
    this.UpdateFace(true);
    this.UpdatePos();
    this.UpdateLight();
    this.Call$pi8$pC4AulParSet$b(S("~OnSynchronized"));
    return true;
  }

  StatusDeactivate(fClearPointers) {
    this.ClearParticleLists();
    $.Objects.Remove(this);
    this.Status = 2;
    if ($.Landscape.HasFoW()) {
      $.Landscape.GetFoW().Remove(this);
    }
    $.Objects.InactiveObjects.Add$pC4Object$i32$pC4ObjectList(this, 1 /*stMain*/);
    if (fClearPointers) {
      this.ClearContentsAndContained();
      $.Game.ClearPointers(this);
    } else {
      $.Game.TransferZones.ClearPointers(this);
    }
    return true;
  }

  ClearContentsAndContained(fDoCalls = true) {
    let $t1, $t2, $t3;
    $t1 = this.Contents;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    try {
      for (; $t2.op_ne($t3); $t2.op_inc$v()) {
        const cobj = $t2.op_mul();
        cobj.Exit(this.GetX(), this.GetY(), 0, $.Fix0$C4Real.$clone(), $.Fix0$C4Real.$clone(), $.Fix0$C4Real.$clone(), fDoCalls);
      }
    } finally { $t2.$dtor(); $t3.$dtor(); }
    if (this.Contained.op_C4Object_() != null) {
      this.Exit(this.GetX(), this.GetY(), 0, $.Fix0$C4Real.$clone(), $.Fix0$C4Real.$clone(), $.Fix0$C4Real.$clone(), fDoCalls);
    }
  }

  AdjustWalkRotation(range_x, range_y, speed) {
    let dest_angle = 0;
    if (this.Shape.iAttachVtx < 0 || this.Def.Shape.VtxX[this.Shape.iAttachVtx] === 0) {
      let y_solid_left = 0;
      let y_solid_right = 0;
      let check_x = this.Shape.iAttachX - range_x | 0;
      if ($.GBackSolid(check_x, this.Shape.iAttachY)) {
        while ((y_solid_left = y_solid_left - 1 | 0) > (-range_y | 0)) {
          if ($.GBackSolid(check_x, this.Shape.iAttachY + y_solid_left | 0)) {
            y_solid_left = y_solid_left + 1 | 0;
            break;
          }
        }
      } else {
        while ((y_solid_left = y_solid_left + 1 | 0) < range_y) {
          if ($.GBackSolid(check_x, this.Shape.iAttachY + y_solid_left | 0)) {
            y_solid_left = y_solid_left - 1 | 0;
            break;
          }
        }
      }
      check_x = check_x + Math.imul(2, range_x) | 0;
      if ($.GBackSolid(check_x, this.Shape.iAttachY)) {
        while ((y_solid_right = y_solid_right - 1 | 0) > (-range_y | 0)) {
          if ($.GBackSolid(check_x, this.Shape.iAttachY + y_solid_right | 0)) {
            y_solid_right = y_solid_right + 1 | 0;
            break;
          }
        }
      } else {
        while ((y_solid_right = y_solid_right + 1 | 0) < range_y) {
          if ($.GBackSolid(check_x, this.Shape.iAttachY + y_solid_right | 0)) {
            y_solid_right = y_solid_right - 1 | 0;
            break;
          }
        }
      }
      dest_angle = Math.imul(y_solid_right - y_solid_left | 0, 35 / $max(range_x, 1) | 0);
    } else {
      if (this.Shape.VtxX[this.Shape.iAttachVtx] > 0) {
        dest_angle = -50;
      } else {
        dest_angle = 50;
      }
    }
    if ($.Abs$i32(dest_angle - this.GetR() | 0) > 2) {
      this.rdir.$assign($.itofix$i32($.Clamp$i32$i32$i32(dest_angle - this.GetR() | 0, -15, 15)));
      this.rdir.op_divAssign$i32(10000 / speed | 0);
    } else {
      this.rdir.op_assign(0);
    }
    return true;
  }

  GetInfoString() {
    let sResult = new $.StdStrBuf();
    if (this.Status === 0) {
      return sResult;
    }
    for (let pEff = this.pEffects; pEff != null; pEff = pEff.pNext) {
      const par = $oarr(7, () => new $.C4Value().init$v());
      let vInfo = pEff.DoCall(this, S("Info"), par[0], par[1], par[2], par[3], par[4], par[5], par[6]);
      if (vInfo.op_not()) {
        continue;
      }
      if (vInfo.GetType() !== 4) {
        $.DebugLogF(S("Effect %s(#%d) on object %s (#%d) returned wrong info type %d."), pEff.GetName(), pEff.Number, this.GetName(), this.Number, vInfo.GetType());
      }
      let psInfo = vInfo.getStr();
      let szEffInfo = null;
      if (psInfo != null && (szEffInfo = psInfo.GetCStr()) != null) {
        if (szEffInfo.a[szEffInfo.o] !== 0) {
          if (sResult.getLength() !== 0) {
            sResult.AppendChar(124);
          }
          sResult.Append$pi8(szEffInfo);
        }
      }
    }
    return sResult;
  }

  CanConcatPictureWith(pOtherObject) {
    if (this.id.op_ne(pOtherObject.id)) {
      return false;
    }
    let allow_picture_stack = this.Def.AllowPictureStack;
    if (!((allow_picture_stack & 1) !== 0)) {
      if (this.Color !== pOtherObject.Color && this.Def.ColorByOwner !== 0) {
        return false;
      }
      if (this.ColorMod !== pOtherObject.ColorMod) {
        return false;
      }
      if (this.BlitMode !== pOtherObject.BlitMode) {
        return false;
      }
    }
    if (!((allow_picture_stack & 2) !== 0)) {
      if (this.pGraphics !== pOtherObject.pGraphics) {
        return false;
      }
      if (this.PictureRect.op_ne(pOtherObject.PictureRect)) {
        return false;
      }
    }
    if (!((allow_picture_stack & 4) !== 0)) {
      if (!$peq(this.GetName(), pOtherObject.GetName())) {
        return false;
      }
    }
    if (!((allow_picture_stack & 8) !== 0)) {
      for (let pOwnOverlay = this.pGfxOverlay; pOwnOverlay != null; pOwnOverlay = pOwnOverlay.GetNext()) {
        if (pOwnOverlay.IsPicture()) {
          let pOtherOverlay = pOtherObject.GetGraphicsOverlay$i32$b(pOwnOverlay.GetID(), false);
          if (pOtherOverlay == null || !pOtherOverlay.op_eq(pOwnOverlay)) {
            return false;
          }
        }
      }
      for (let pOtherOverlay = pOtherObject.pGfxOverlay; pOtherOverlay != null; pOtherOverlay = pOtherOverlay.GetNext()) {
        if (pOtherOverlay.IsPicture()) {
          if (!(this.GetGraphicsOverlay$i32(pOtherOverlay.GetID()) != null)) {
            return false;
          }
        }
      }
    }
    return true;
  }

  IsMoveableBySolidMask(ComparisonPlane) {
    return this.Status === 1 && !((this.Category & 1) !== 0) && ComparisonPlane < this.GetPlane$v$c() && this.Contained.op_not();
  }

  IsPlayerObject(iPlayerNumber = -1) {
    let fAnyPlr = iPlayerNumber === -1;
    if (fAnyPlr && !($.ValidPlr(this.Owner) !== 0)) {
      return false;
    }
    if (fAnyPlr || this.Owner === iPlayerNumber) {
      let pOwner = $.Players.Get(this.Owner);
      if (pOwner != null) {
        if (pOwner != null && pOwner.Crew.IsContained(this)) {
          return true;
        }
      } else {
        if (this.Def.CrewMember !== 0) {
          return true;
        }
      }
    }
    return false;
  }

  IsUserPlayerObject() {
    if (!this.IsPlayerObject()) {
      return false;
    }
    let pOwner = $.Players.Get(this.Owner);
    if (pOwner == null || pOwner.GetType() !== 1) {
      return false;
    }
    return true;
  }

  GetObject$v() {
    return this;
  }

  GetObject$v$c() {
    return this;
  }

  SetPropertyByS(k, to) {
    if ($oi(k) >= $oi($oat($.Strings.P, 0)) && $oi(k) < $oi($oat($.Strings.P, 249 /*P_LAST*/))) {
      switch (k.$i - $oat($.Strings.P, 0).$i) {
        case 78:
          if (!(to.getInt() !== 0)) {
            $throw(new $.C4AulExecError().init(S("invalid Plane 0")));
          }
          this.SetPlane(to.getInt());
          return;
      }
    }
    $.C4PropList.prototype.SetPropertyByS.call(this, k, to);
  }

  ResetProperty(k) {
    if ($oi(k) >= $oi($oat($.Strings.P, 0)) && $oi(k) < $oi($oat($.Strings.P, 249 /*P_LAST*/))) {
      switch (k.$i - $oat($.Strings.P, 0).$i) {
        case 78:
          this.SetPlane(this.GetPropertyInt(78 /*P_Plane*/));
          return;
      }
    }
    return $.C4PropList.prototype.ResetProperty.call(this, k);
  }

  GetPropertyByS(k, pResult) {
    if ($oi(k) >= $oi($oat($.Strings.P, 0)) && $oi(k) < $oi($oat($.Strings.P, 249 /*P_LAST*/))) {
      switch (k.$i - $oat($.Strings.P, 0).$i) {
        case 78:
          pResult.$assign($.C4VInt(this.Plane));
          return true;
      }
    }
    return $.C4PropList.prototype.GetPropertyByS.call(this, k, pResult);
  }

  GetProperties() {
    let $t1;
    let a = $.C4PropList.prototype.GetProperties.call(this);
    let i = 0;
    i = a.GetSize();
    a.SetSize(i + 1 | 0);
    a.op_index$i32(($t1 = i, i = i + 1 | 0, $t1)).$assign($.C4VString$pC4String($oat($.Strings.P, 78 /*P_Plane*/)));
    return a;
  }

  $clone() { return new C4Object().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.id.$assign(o.id);
    this.RemovalDelay = o.RemovalDelay;
    this.Owner = o.Owner;
    this.Controller = o.Controller;
    this.LastEnergyLossCausePlayer = o.LastEnergyLossCausePlayer;
    this.Category = o.Category;
    this.old_x = o.old_x;
    this.old_y = o.old_y;
    this.Area.$assign(o.Area);
    this.Mass = o.Mass;
    this.OwnMass = o.OwnMass;
    this.Damage = o.Damage;
    this.Energy = o.Energy;
    this.Breath = o.Breath;
    this.InMat = o.InMat;
    this.Color = o.Color;
    this.Audible = o.Audible;
    this.AudiblePan = o.AudiblePan;
    this.AudiblePlayer = o.AudiblePlayer;
    this.lightRange = o.lightRange;
    this.lightFadeoutRange = o.lightFadeoutRange;
    this.lightColor = o.lightColor;
    this.fix_x.$assign(o.fix_x);
    this.fix_y.$assign(o.fix_y);
    this.fix_r.$assign(o.fix_r);
    this.xdir.$assign(o.xdir);
    this.ydir.$assign(o.ydir);
    this.rdir.$assign(o.rdir);
    this.iLastAttachMovementFrame = o.iLastAttachMovementFrame;
    this.Mobile = o.Mobile;
    this.Unsorted = o.Unsorted;
    this.Initializing = o.Initializing;
    this.InLiquid = o.InLiquid;
    this.EntranceStatus = o.EntranceStatus;
    this.t_contact = o.t_contact;
    this.OCF = o.OCF;
    this.Marker = o.Marker;
    this.Layer.$assign(o.Layer);
    this.pDrawTransform = o.pDrawTransform;
    this.Menu = o.Menu;
    this.TopFace.$assign(o.TopFace);
    this.Def = o.Def;
    this.Contained.$assign(o.Contained);
    this.Info = o.Info;
    this.Action.$assign(o.Action);
    this.Shape.$assign(o.Shape);
    this.fOwnVertices = o.fOwnVertices;
    this.SolidMask.$assign(o.SolidMask);
    this.HalfVehicleSolidMask = o.HalfVehicleSolidMask;
    this.PictureRect.$assign(o.PictureRect);
    this.Contents.$assign(o.Contents);
    this.MaterialContents = o.MaterialContents;
    this.pGraphics = o.pGraphics;
    this.pMeshInstance = o.pMeshInstance;
    this.pEffects = o.pEffects;
    this.FrontParticles = o.FrontParticles;
    this.BackParticles = o.BackParticles;
    this.ColorMod = o.ColorMod;
    this.BlitMode = o.BlitMode;
    this.CrewDisabled = o.CrewDisabled;
    this.Command = o.Command;
    this.nInfo.$assign(o.nInfo);
    this.pGfxOverlay = o.pGfxOverlay;
    this.OnFire = o.OnFire;
    this.Con = o.Con;
    this.Plane = o.Plane;
    this.Alive = o.Alive;
    this.pSolidMaskData = o.pSolidMaskData;
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4Action, C4Object });
