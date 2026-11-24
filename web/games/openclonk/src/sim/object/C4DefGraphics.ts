// @ts-nocheck
// OpenClonk 36de799: src/object/C4DefGraphics.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { c$sscanf } from '../../rt/libc.ts';
import { $padd, $peq, $rd, $wr, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $isException, $max, $min, StdString } from '../../rt/std.ts';

export class C4DefGraphics {
  pDef = null;
  pNext = null;
  Type = 0;
  $u1 = new C4DefGraphics$$anon1();
  fColorBitmapAutoCreated = false;

  GetLast() {
    let pLast = this;
    while (pLast.pNext != null) {
      pLast = pLast.pNext;
    }
    return pLast;
  }

  GetBitmap(dwClr = 0) {
    if (this.Type !== 1) {
      return null;
    }
    if (this.$u1.Bmp.BitmapClr != null) {
      this.$u1.Bmp.BitmapClr.SetClr(dwClr);
      return this.$u1.Bmp.BitmapClr;
    } else {
      return this.$u1.Bmp.Bitmap;
    }
  }

  init(pOwnDef = null) {
    this.pDef = pOwnDef;
    this.Type = 0 /*TYPE_None*/;
    this.$u1.Bmp.Bitmap = this.$u1.Bmp.BitmapClr = this.$u1.Bmp.BitmapNormal = null;
    this.pNext = null;
    this.fColorBitmapAutoCreated = false;
    return this;
  }

  $dtor() {
    C4DefGraphics.prototype.Clear.call(this);
  }

  LoadBitmap(hGroup, szFilename, szOverlay, szNormal, fColorByOwner) {
    if (szFilename == null) {
      return false;
    }
    this.Type = 1 /*TYPE_Bitmap*/;
    this.$u1.Bmp.Bitmap = new $.C4Surface().init$v();
    if (!this.$u1.Bmp.Bitmap.Load(hGroup, szFilename, false, true, 2)) {
      this.Clear();
      return false;
    }
    if (fColorByOwner) {
      this.$u1.Bmp.BitmapClr = new $.C4Surface().init$v();
      if (szOverlay != null && this.$u1.Bmp.BitmapClr.Load(hGroup, szOverlay, false, false, 2)) {
        if (!this.$u1.Bmp.BitmapClr.SetAsClrByOwnerOf(this.$u1.Bmp.Bitmap)) {
          $.DebugLogF(S("    Gfx loading error in %s: %s (%d x %d) doesn't match overlay %s (%d x %d) - invalid file or size mismatch"), hGroup.GetFullName().getData(), szFilename, this.$u1.Bmp.Bitmap != null ? this.$u1.Bmp.Bitmap.Wdt : -1, this.$u1.Bmp.Bitmap != null ? this.$u1.Bmp.Bitmap.Hgt : -1, szOverlay, this.$u1.Bmp.BitmapClr.Wdt, this.$u1.Bmp.BitmapClr.Hgt);
          this.Clear();
          return false;
        }
      } else {
        if (!this.$u1.Bmp.BitmapClr.CreateColorByOwner(this.$u1.Bmp.Bitmap)) {
          this.Clear();
          return false;
        }
      }
      this.fColorBitmapAutoCreated = true;
    }
    if (szNormal != null) {
      this.$u1.Bmp.BitmapNormal = new $.C4Surface().init$v();
      if (this.$u1.Bmp.BitmapNormal.Load(hGroup, szNormal, false, true, 2)) {
        if (this.$u1.Bmp.BitmapNormal.Wdt !== this.$u1.Bmp.Bitmap.Wdt || this.$u1.Bmp.BitmapNormal.Hgt !== this.$u1.Bmp.Bitmap.Hgt) {
          $.DebugLogF(S("    Gfx loading error in %s: %s (%d x %d) doesn't match normal %s (%d x %d) - invalid file or size mismatch"), hGroup.GetFullName().getData(), szFilename, this.$u1.Bmp.Bitmap != null ? this.$u1.Bmp.Bitmap.Wdt : -1, this.$u1.Bmp.Bitmap != null ? this.$u1.Bmp.Bitmap.Hgt : -1, szNormal, this.$u1.Bmp.BitmapNormal.Wdt, this.$u1.Bmp.BitmapNormal.Hgt);
          this.Clear();
          return false;
        }
        this.$u1.Bmp.Bitmap.pNormalSfc = this.$u1.Bmp.BitmapNormal;
        if (this.$u1.Bmp.BitmapClr != null) {
          this.$u1.Bmp.BitmapClr.pNormalSfc = this.$u1.Bmp.BitmapNormal;
        }
      } else {
        $delete(this.$u1.Bmp.BitmapNormal);
        this.$u1.Bmp.BitmapNormal = null;
      }
    }
    this.Type = 1 /*TYPE_Bitmap*/;
    return true;
  }

  LoadMesh(hGroup, szFileName, loader) {
    const buf = [null];
    const size = [0];
    try {
      if (!hGroup.LoadEntry$pi8$ppi8$pu64$i32(szFileName, P(buf, 0), P(size, 0), 1)) {
        return false;
      }
      if ($.SEqualNoCase($.GetExtension(szFileName), S("xml"))) {
        this.$u1.Mesh = $.StdMeshLoader.LoadMeshXml(buf[0], size[0], $.MeshMaterialManager, loader, hGroup.GetName());
      } else {
        this.$u1.Mesh = $.StdMeshLoader.LoadMeshBinary(buf[0], size[0], $.MeshMaterialManager, loader, hGroup.GetName());
      }
      $delete(buf[0]);
      this.$u1.Mesh.SetLabel(StdString.of(this.pDef.id.ToString()));
      this.$u1.Mesh.PostInit();
    } catch ($e1) {
      if ($isException($e1, "runtime_error")) {
        const ex = $e1;
        $.DebugLogF(S("Failed to load mesh in definition %s: %s"), hGroup.GetName(), ex.what());
        $delete(buf[0]);
        return false;
      } else {
        throw $e1;
      }
    }
    this.Type = 2 /*TYPE_Mesh*/;
    return true;
  }

  LoadSkeleton(hGroup, szFileName, loader) {
    const buf = [null];
    const size = [0];
    try {
      if (!hGroup.LoadEntry$pi8$ppi8$pu64$i32(szFileName, P(buf, 0), P(size, 0), 1)) {
        return false;
      }
      loader.RemoveSkeleton$pi8$pi8(hGroup.GetName(), szFileName);
      if ($.SEqualNoCase($.GetExtension(szFileName), S("xml"))) {
        loader.LoadSkeletonXml(hGroup.GetName(), szFileName, buf[0], size[0]);
      } else {
        loader.LoadSkeletonBinary(hGroup.GetName(), szFileName, buf[0], size[0]);
      }
      $delete(buf[0]);
    } catch ($e1) {
      if ($isException($e1, "runtime_error")) {
        const ex = $e1;
        $.DebugLogF(S("Failed to load skeleton in definition %s: %s"), hGroup.GetName(), ex.what());
        $delete(buf[0]);
        return false;
      } else {
        throw $e1;
      }
    }
    return true;
  }

  Load(hGroup, loader, fColorByOwner) {
    const Filename = new Int8Array(4097);
    $wr(P(Filename, 0), 0, 0);
    hGroup.ResetSearch();
    while (hGroup.FindNextEntry$pi8$pi8$pu64$b(S("*"), P(Filename, 0), null, !!($rd(P(Filename, 0)) !== 0))) {
      if (!$.WildcardMatch(S("*.skeleton"), P(Filename, 0)) && !$.WildcardMatch(S("*.skeleton.xml"), P(Filename, 0))) {
        continue;
      }
      this.LoadSkeleton(hGroup, P(Filename, 0), loader);
    }
    if (!this.LoadMesh(hGroup, S("Graphics.mesh"), loader)) {
      if (!this.LoadMesh(hGroup, S("Graphics.mesh.xml"), loader)) {
        this.LoadBitmap(hGroup, S("Graphics.png"), S("Overlay.png"), S("Normal.png"), fColorByOwner);
      }
    }
    let pLastGraphics = this;
    let iOverlayWildcardPos = $.SCharPos(42, S("Overlay*.png"));
    hGroup.ResetSearch();
    $wr(P(Filename, 0), 0, 0);
    const AdditionalGraphics = [S("Graphics*.png"), S("Graphics*.mesh"), S("Graphics*.mesh.xml"), null];
    while (hGroup.FindNextEntry$pi8$pi8$pu64$b(S("*"), P(Filename, 0), null, !!($rd(P(Filename, 0)) !== 0))) {
      for (let szWildcard = P(AdditionalGraphics, 0); szWildcard.a[szWildcard.o] != null; szWildcard = szWildcard.add(1)) {
        if (!$.WildcardMatch(szWildcard.a[szWildcard.o], P(Filename, 0))) {
          continue;
        }
        if ($.SEqualNoCase(P(Filename, 0), S("Graphics.png")) || $.SEqualNoCase(P(Filename, 0), S("Graphics.mesh")) || $.SEqualNoCase(P(Filename, 0), S("Graphics.mesh.xml"))) {
          continue;
        }
        if ($.WildcardMatch(S("Graphics.*.png"), P(Filename, 0))) {
          continue;
        }
        const GrpName = new Int8Array(4097);
        let iWildcardPos = $.SCharPos(42, szWildcard.a[szWildcard.o]);
        $.SCopy$pi8$pi8$u64($padd(P(Filename, 0), iWildcardPos), P(GrpName, 0), 4096);
        $.RemoveExtension$pi8(P(GrpName, 0));
        let extpos = 0;
        const scale = [0];
        if ((extpos = $.SCharLastPos(46, P(GrpName, 0))) > -1) {
          if (c$sscanf($padd($padd(P(GrpName, 0), extpos), 1), S("%d"), P(scale, 0)) === 1) {
            GrpName[extpos] = 0;
          }
        }
        GrpName[30] = 0;
        pLastGraphics.pNext = new C4AdditionalDefGraphics().init(this.pDef, P(GrpName, 0));
        pLastGraphics = pLastGraphics.pNext;
        if ($peq(szWildcard.a[szWildcard.o], AdditionalGraphics[0])) {
          const OverlayFn = new Int8Array(4097);
          if (fColorByOwner) {
            $.SCopy$pi8$pi8$u64(S("Overlay*.png"), P(OverlayFn, 0), 4096);
            OverlayFn[iOverlayWildcardPos] = 0;
            $.SAppend($padd(P(Filename, 0), iWildcardPos), P(OverlayFn, 0));
            $.EnforceExtension$pi8$pi8(P(OverlayFn, 0), $.GetExtension(S("Overlay*.png")));
          }
          const NormalFn = new Int8Array(4097);
          $.SCopy$pi8$pi8$u64(S("Normal*.png"), P(NormalFn, 0), 4096);
          NormalFn[iOverlayWildcardPos] = 0;
          $.SAppend($padd(P(Filename, 0), iWildcardPos), P(NormalFn, 0));
          $.EnforceExtension$pi8$pi8(P(NormalFn, 0), $.GetExtension(S("Normal*.png")));
          if (!pLastGraphics.LoadBitmap(hGroup, P(Filename, 0), fColorByOwner ? P(OverlayFn, 0) : null, P(NormalFn, 0), fColorByOwner)) {
            return false;
          }
        } else {
          if (!pLastGraphics.LoadMesh(hGroup, P(Filename, 0), loader)) {
            return false;
          }
        }
      }
    }
    return true;
  }

  Get(szGrpName) {
    if (szGrpName == null || szGrpName.a[szGrpName.o + 0] === 0) {
      return this;
    }
    for (let pGrp = this.pNext; pGrp != null; pGrp = pGrp.pNext) {
      if ($.SEqualNoCase(pGrp.GetName(), szGrpName)) {
        return pGrp;
      }
    }
    return null;
  }

  Clear() {
    switch (this.Type) {
      case 0:
        break;
      case 1:
        if (this.$u1.Bmp.BitmapNormal != null) {
          $delete(this.$u1.Bmp.BitmapNormal);
          this.$u1.Bmp.BitmapNormal = null;
        }
        if (this.$u1.Bmp.BitmapClr != null) {
          $delete(this.$u1.Bmp.BitmapClr);
          this.$u1.Bmp.BitmapClr = null;
        }
        if (this.$u1.Bmp.Bitmap != null) {
          $delete(this.$u1.Bmp.Bitmap);
          this.$u1.Bmp.Bitmap = null;
        }
        break;
      case 2:
        if (this.$u1.Mesh != null) {
          $delete(this.$u1.Mesh);
          this.$u1.Mesh = null;
        }
        break;
    }
    this.Type = 0 /*TYPE_None*/;
    let pGrp2N = this.pNext;
    let pGrp2 = null;
    while ((pGrp2 = pGrp2N) != null) {
      pGrp2N = pGrp2.pNext;
      pGrp2.pNext = null;
      $delete(pGrp2);
    }
    this.pNext = null;
    this.fColorBitmapAutoCreated = false;
  }

  IsMesh() {
    return this.Type === 2;
  }

  IsColorByOwner() {
    return this.Type === 2 || this.Type === 1 && !(this.$u1.Bmp.BitmapClr == null);
  }

  Draw(cgo, iColor, pObj, iPhaseX, iPhaseY, trans) {
    let fctPicRect = this.pDef.PictureRect.$clone();
    let fctPicture = new $.C4Facet().init$v();
    if (pObj != null) {
      if (pObj.PictureRect.Wdt !== 0) {
        fctPicRect.$assign(pObj.PictureRect);
      }
    }
    if (pObj != null) {
      pObj.PrepareDrawing();
    }
    switch (this.Type) {
      case 0:
        break;
      case 1:
        fctPicture.Set$pC4Surface$f32$f32$f32$f32(this.GetBitmap(iColor), Math.fround(fctPicRect.x), Math.fround(fctPicRect.y), Math.fround(fctPicRect.Wdt), Math.fround(fctPicRect.Hgt));
        fctPicture.DrawTUnscaled$rC4Facet$b$i32$i32$pC4DrawTransform(cgo, true, iPhaseX, iPhaseY, trans);
        break;
      case 2:
        let dummy = null;
        let instance = null;
        let value = new $.C4Value().init$v();
        if (pObj != null) {
          instance = pObj.pMeshInstance;
          pObj.GetProperty(21 /*P_PictureTransformation*/, value);
        } else {
          dummy = new $.StdMeshInstance().init(this.$u1.Mesh, 1);
          instance = dummy;
          this.pDef.GetProperty(21 /*P_PictureTransformation*/, value);
        }
        let matrix = new $.StdMeshMatrix();
        if ($.C4ValueToMatrix$rC4Value$pStdMeshMatrix(value, matrix)) {
          $.pDraw.SetMeshTransform(matrix);
        }
        $.pDraw.SetPerspective(true);
        $.pDraw.RenderMesh(instance, cgo.Surface, cgo.X, cgo.Y, cgo.Wdt, cgo.Hgt, pObj != null ? pObj.Color : iColor, trans);
        $.pDraw.SetPerspective(false);
        $.pDraw.SetMeshTransform(null);
        break;
    }
    if (pObj != null) {
      pObj.FinishedDrawing();
    }
    if (pObj != null && pObj.pGfxOverlay != null) {
      for (let pGfxOvrl = pObj.pGfxOverlay; pGfxOvrl != null; pGfxOvrl = pGfxOvrl.GetNext()) {
        if (pGfxOvrl.IsPicture()) {
          pGfxOvrl.DrawPicture(cgo, pObj, trans);
        }
      }
    }
  }

  GetName() {
    return null;
  }

  GetNext() {
    return this.pNext;
  }

  DrawClr(cgo, fAspect = true, dwClr = 0) {
    if (this.Type !== 1) {
      return;
    }
    let pSfc = this.$u1.Bmp.BitmapClr != null ? this.$u1.Bmp.BitmapClr : this.$u1.Bmp.Bitmap;
    if (pSfc == null) {
      return;
    }
    let fct = new $.C4Facet().init$pC4Surface$f32$f32$f32$f32(pSfc, Math.fround(0), Math.fround(0), Math.fround(pSfc.Wdt), Math.fround(pSfc.Hgt));
    fct.DrawClr(cgo, fAspect, dwClr);
  }

  $clone() { return new C4DefGraphics().$assign(this); }
  $assign(o) {
    this.pDef = o.pDef;
    this.pNext = o.pNext;
    this.Type = o.Type;
    this.$u1.$assign(o.$u1);
    this.fColorBitmapAutoCreated = o.fColorBitmapAutoCreated;
    return this;
  }
}

export class C4DefGraphics$$anon1 {
  $v = new C4DefGraphics$$anon1$$anon1();
  get Bmp() { return this.$v; }
  set Bmp(v) { this.$v.$assign(v); }
  get Mesh() { return this.$v.Bitmap; }
  set Mesh(v) { this.$v.Bitmap = v; }
  $clone() { const u = new C4DefGraphics$$anon1(); u.$v.$assign(this.$v); return u; }
  $assign(o) { this.$v.$assign(o.$v); return this; }
}

export class C4DefGraphics$$anon1$$anon1 {
  Bitmap = null;
  BitmapClr = null;
  BitmapNormal = null;

  $clone() { return new C4DefGraphics$$anon1$$anon1().$assign(this); }
  $assign(o) {
    this.Bitmap = o.Bitmap;
    this.BitmapClr = o.BitmapClr;
    this.BitmapNormal = o.BitmapNormal;
    return this;
  }
}

export class C4DefGraphicsPtrBackupEntry {
  pGraphicsPtr = null;
  pDef = null;
  Name = new Int8Array(31);
  pMeshUpdate = null;

  init(pSourceGraphics) {
    this.pMeshUpdate = null;
    this.pGraphicsPtr = pSourceGraphics;
    this.pDef = pSourceGraphics.pDef;
    let szName = this.pGraphicsPtr.GetName();
    if (szName != null) {
      $.SCopy$pi8$pi8$u64(szName, P(this.Name, 0), 30);
    } else {
      $wr(P(this.Name, 0), 0, 0);
    }
    if (pSourceGraphics.Type === 2) {
      this.pMeshUpdate = new $.StdMeshUpdate().init(pSourceGraphics.$u1.Mesh);
    }
    return this;
  }

  $dtor() {
    if (this.pGraphicsPtr != null) {
      C4DefGraphicsPtrBackupEntry.prototype.AssignRemoval.call(this);
    }
    $delete(this.pMeshUpdate);
  }

  AssignUpdate() {
    let $t1, $t2, $t3;
    this.UpdateAttachedMeshes();
    if (this.pGraphicsPtr != null) {
      $t1 = $.Objects;
      $t2 = $t1.begin();
      $t3 = $t1.end();
      try {
        for (; $t2.op_ne($t3); $t2.op_inc$v()) {
          const pObj = $t2.op_mul();
          if (pObj != null && pObj.Status !== 0) {
            if (pObj.pGraphics === this.pGraphicsPtr) {
              if (this.pMeshUpdate != null) {
                0;
                0;
                let pGrp = this.pDef.Graphics.Get(P(this.Name, 0));
                if (pGrp != null && pGrp.Type === 2) {
                  this.pMeshUpdate.Update(pObj.pMeshInstance, pGrp.$u1.Mesh);
                }
              }
              if (!pObj.SetGraphics$pi8$pC4Def(P(this.Name, 0), this.pDef)) {
                if (!pObj.SetGraphics$pi8$pC4Def(P(this.Name, 0), pObj.Def)) {
                  pObj.AssignRemoval();
                  pObj.pGraphics = null;
                }
              }
            }
            for (; ; ) {
              let pGfxOverlay = null;
              for (pGfxOverlay = pObj.pGfxOverlay; pGfxOverlay != null; pGfxOverlay = pGfxOverlay.GetNext()) {
                if (pGfxOverlay.GetGfx() === this.pGraphicsPtr) {
                  pObj.RemoveGraphicsOverlay(pGfxOverlay.GetID());
                  break;
                }
              }
              if (pGfxOverlay == null) {
                break;
              }
            }
            let pDeco = null;
            if (this.pDef != null && pObj.Menu != null && (pDeco = pObj.Menu.GetFrameDecoration()) != null) {
              if (pDeco.idSourceDef.op_eq(this.pDef.id)) {
                if (!pDeco.UpdateGfx()) {
                  pObj.Menu.SetFrameDeco(null);
                }
              }
            }
          }
        }
      } finally { $t2.$dtor(); $t3.$dtor(); }
      this.pGraphicsPtr = null;
    }
  }

  AssignRemoval() {
    let $t1, $t2, $t3;
    this.UpdateAttachedMeshes();
    if (this.pGraphicsPtr != null) {
      $t1 = $.Objects;
      $t2 = $t1.begin();
      $t3 = $t1.end();
      try {
        for (; $t2.op_ne($t3); $t2.op_inc$v()) {
          const pObj = $t2.op_mul();
          if (pObj != null && pObj.Status !== 0) {
            if (pObj.pGraphics === this.pGraphicsPtr) {
              if (pObj.pMeshInstance != null) {
                0;
                pObj.AssignRemoval();
                $delete(pObj.pMeshInstance);
                pObj.pMeshInstance = null;
                pObj.pGraphics = null;
              } else if (!pObj.SetGraphics$pi8$pC4Def()) {
                pObj.AssignRemoval();
                pObj.pGraphics = null;
              }
            }
            for (; ; ) {
              let pGfxOverlay = null;
              for (pGfxOverlay = pObj.pGfxOverlay; pGfxOverlay != null; pGfxOverlay = pGfxOverlay.GetNext()) {
                if (pGfxOverlay.GetGfx() === this.pGraphicsPtr) {
                  pObj.RemoveGraphicsOverlay(pGfxOverlay.GetID());
                  break;
                }
              }
              if (pGfxOverlay == null) {
                break;
              }
            }
            let pDeco = null;
            if (this.pDef != null && pObj.Menu != null && (pDeco = pObj.Menu.GetFrameDecoration()) != null) {
              if (pDeco.idSourceDef.op_eq(this.pDef.id)) {
                pObj.Menu.SetFrameDeco(null);
              }
            }
          }
        }
      } finally { $t2.$dtor(); $t3.$dtor(); }
      this.pGraphicsPtr = null;
    }
  }

  UpdateAttachedMeshes() {
    let $t1, $t2, $t3;
    $t1 = $.Objects;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    try {
      for (; $t2.op_ne($t3); $t2.op_inc$v()) {
        const pObj = $t2.op_mul();
        if (pObj != null && pObj.Status !== 0) {
          if (pObj.pMeshInstance != null) {
            this.UpdateAttachedMesh(pObj.pMeshInstance);
          }
          for (let pGfxOverlay = pObj.pGfxOverlay; pGfxOverlay != null; pGfxOverlay = pGfxOverlay.GetNext()) {
            if (pGfxOverlay.pMeshInstance != null) {
              this.UpdateAttachedMesh(pGfxOverlay.pMeshInstance);
            }
          }
        }
      }
    } finally { $t2.$dtor(); $t3.$dtor(); }
  }

  UpdateAttachedMesh(instance) {
    let $t1;
    if (this.pMeshUpdate != null && instance.GetMesh() === this.pMeshUpdate.GetOldMesh() && instance.GetAttachParent() != null && instance.GetAttachParent().OwnChild) {
      let pGrp = this.pDef.Graphics.Get(P(this.Name, 0));
      if (pGrp != null && pGrp.Type === 2) {
        this.pMeshUpdate.Update(instance, pGrp.$u1.Mesh);
      } else {
        instance.GetAttachParent().Parent.DetachMesh(instance.GetAttachParent().Number);
      }
    }
    let attached_meshes = [];
    for (let iter = instance.AttachedMeshesBegin(); !iter.eq(instance.AttachedMeshesEnd()); iter.inc()) {
      attached_meshes.push(iter.v);
    }
    $t1 = attached_meshes;
    for (let $i1 = 0; $i1 < $t1.length; $i1++) {
      const attached_mesh = P($t1, $i1);
      this.UpdateAttachedMesh(attached_mesh.a[attached_mesh.o].Child);
    }
  }

  $clone() { return new C4DefGraphicsPtrBackupEntry().$assign(this); }
  $assign(o) {
    this.pGraphicsPtr = o.pGraphicsPtr;
    this.pDef = o.pDef;
    this.Name = o.Name.slice();
    this.pMeshUpdate = o.pMeshUpdate;
    return this;
  }
}

export class C4DefGraphicsPtrBackup {
  MeshMaterialUpdate = new $.StdMeshMaterialUpdate();
  MeshAnimationUpdate = new $.StdMeshAnimationUpdate();
  Entries = [];
  fApplied = false;

  init() {
    this.MeshMaterialUpdate = new $.StdMeshMaterialUpdate().init($.MeshMaterialManager);
    this.MeshAnimationUpdate = new $.StdMeshAnimationUpdate().init($.Definitions.GetSkeletonLoader());
    this.Entries = [];
    this.fApplied = false;
    return this;
  }

  $dtor() {
    let $t1;
    if (!this.fApplied) {
      C4DefGraphicsPtrBackup.prototype.AssignRemoval.call(this);
    }
    $t1 = this.Entries;
    for (let $i1 = 0; $i1 < $t1.length; $i1++) {
      const Entry = P($t1, $i1);
      $delete(Entry.a[Entry.o]);
    }
  }

  Add(pGfx) {
    for (let pCur = pGfx; pCur != null; pCur = pCur.pNext) {
      this.Entries.push(new C4DefGraphicsPtrBackupEntry().init(pCur));
    }
    let pDef = pGfx.pDef;
    for (let iter = $.MeshMaterialManager.Begin(); iter.op_ne($.MeshMaterialManager.End()); ) {
      let Filename = new $.StdStrBuf();
      Filename.Copy$pi8(P(pDef.Filename, 0));
      Filename.Append$pi8(S("/"));
      Filename.Append$pi8($.GetFilename(iter.op_arrow().FileName.getData()));
      if (Filename.op_eq$StdStrBuf(iter.op_arrow().FileName)) {
        iter.$assign($.MeshMaterialManager.Remove$Iterator$pStdMeshMaterialUpdate(iter, this.MeshMaterialUpdate));
      } else {
        iter.op_inc();
      }
    }
  }

  AssignUpdate() {
    let $t1, $t2, $t3, $t4;
    for (const iter of $.Definitions.table) {
      if (iter.second.Graphics.Type === 2) {
        this.MeshMaterialUpdate.Update$pStdMesh(iter.second.Graphics.$u1.Mesh);
      }
    }
    $t1 = this.Entries;
    for (let $i1 = 0; $i1 < $t1.length; $i1++) {
      const Entry = P($t1, $i1);
      Entry.a[Entry.o].AssignUpdate();
    }
    $t2 = $.Objects;
    $t3 = $t2.begin();
    $t4 = $t2.end();
    try {
      for (; $t3.op_ne($t4); $t3.op_inc$v()) {
        const pObj = $t3.op_mul();
        if (pObj != null && pObj.Status !== 0) {
          if (pObj.pMeshInstance != null) {
            this.UpdateMesh(pObj.pMeshInstance);
          }
          for (let pGfxOverlay = pObj.pGfxOverlay; pGfxOverlay != null; pGfxOverlay = pGfxOverlay.GetNext()) {
            if (pGfxOverlay.pMeshInstance != null) {
              this.UpdateMesh(pGfxOverlay.pMeshInstance);
            }
          }
        }
      }
    } finally { $t3.$dtor(); $t4.$dtor(); }
    this.fApplied = true;
  }

  AssignRemoval() {
    let $t1;
    this.MeshMaterialUpdate.Cancel();
    $t1 = this.Entries;
    for (let $i1 = 0; $i1 < $t1.length; $i1++) {
      const Entry = P($t1, $i1);
      Entry.a[Entry.o].AssignRemoval();
    }
    this.fApplied = true;
  }

  GetUpdater() {
    return this.MeshMaterialUpdate;
  }

  UpdateMesh(instance) {
    this.MeshMaterialUpdate.Update$pStdMeshInstance(instance);
    this.MeshAnimationUpdate.Update(instance);
    for (let iter = instance.AttachedMeshesBegin(); !iter.eq(instance.AttachedMeshesEnd()); iter.inc()) {
      if (iter.v.OwnChild) {
        this.UpdateMesh(iter.v.Child);
      }
    }
  }

  $clone() { return new C4DefGraphicsPtrBackup().$assign(this); }
  $assign(o) {
    this.MeshMaterialUpdate.$assign(o.MeshMaterialUpdate);
    this.MeshAnimationUpdate.$assign(o.MeshAnimationUpdate);
    this.Entries = o.Entries.slice();
    this.fApplied = o.fApplied;
    return this;
  }
}

export class C4DefGraphicsAdapt {
  pDefGraphics = null;

  init(pDefGraphics) {
    this.pDefGraphics = pDefGraphics;
    return this;
  }

  CompileFunc(pComp) {
    let deserializing = pComp.isDeserializer();
    if (!deserializing && this.pDefGraphics.a[this.pDefGraphics.o] == null) {
      return;
    }
    let id = new $.C4ID().init$v();
    if (!deserializing) {
      id.$assign(this.pDefGraphics.a[this.pDefGraphics.o].pDef.id);
    }
    pComp.Value$rC4ID(id);
    if (!pComp.Separator(5 /*SEP_PART2*/) || !pComp.Separator(5 /*SEP_PART2*/)) {
      pComp.excCorrupt(S("DefGraphics: expected \"::\""));
    }
    let Name = new $.StdStrBuf();
    if (!deserializing) {
      $.StdStrBuf.prototype.op_assign$pi8.call(Name, this.pDefGraphics.a[this.pDefGraphics.o].GetName());
    }
    pComp.Value$StdDefaultAdapt$StdParameterAdapt$StdStrBuf$i32$x($.mkDefaultAdapt$mStdParameterAdapt$StdStrBuf$i32$x($.mkParAdapt$rStdStrBuf$mi32(Name, 2 /*RCT_Idtf*/), S("")));
    if (deserializing) {
      let pDef = $.Definitions.ID2Def(id.$clone());
      if (pDef == null || !((this.pDefGraphics.a[this.pDefGraphics.o] = pDef.Graphics.Get(Name.getData())) != null)) {
        pComp.excCorrupt(S("DefGraphics: could not find graphics \"%s\" in %s(%s)!"), Name.getData(), id.ToString(), pDef != null ? pDef.GetName() : S("def not found"));
      }
    }
  }

  op_eq(pDef2) {
    return this.pDefGraphics.a[this.pDefGraphics.o] === pDef2;
  }

  op_assign(pDef2) {
    this.pDefGraphics.a[this.pDefGraphics.o] = pDef2;
  }

  $clone() { return new C4DefGraphicsAdapt().$assign(this); }
  $assign(o) {
    this.pDefGraphics = o.pDefGraphics;
    return this;
  }
}

export class C4GraphicsOverlay {
  eMode = 0 /*MODE_None*/;
  pSourceGfx = null;
  Action = new Int8Array(31);
  fctBlit = new $.C4TargetFacet().init();
  pMeshInstance = null;
  dwBlitMode = 0;
  dwClrModulation = 0xffffff;
  OverlayObj = new $.C4ObjectPtr().init$v();
  Transform = new $.C4DrawTransform().init$v();
  iPhase = 0;
  fZoomToShape = false;
  iID = 0;
  pNext = null;

  UpdateFacet() {
    if (this.eMode === 5) {
      return;
    }
    if (this.pSourceGfx == null) {
      return;
    }
    let pDef = this.pSourceGfx.pDef;
    0;
    this.fZoomToShape = false;
    $delete(this.pMeshInstance);
    this.pMeshInstance = null;
    switch (this.eMode) {
      case 0:
        break;
      case 1:
        if (this.pSourceGfx.Type === 1) {
          this.fctBlit.Set$pC4Surface$f32$f32$f32$f32$f32$f32$f32(this.pSourceGfx.GetBitmap(), Math.fround(0), Math.fround(0), Math.fround(pDef.Shape.Wdt), Math.fround(pDef.Shape.Hgt), Math.fround(pDef.Shape.x + (pDef.Shape.Wdt / 2 | 0) | 0), Math.fround(pDef.Shape.y + (pDef.Shape.Hgt / 2 | 0) | 0));
        } else if (this.pSourceGfx.Type === 2) {
          this.pMeshInstance = new $.StdMeshInstance().init(this.pSourceGfx.$u1.Mesh, 1);
        }
        break;
      case 2:
        {
          this.fctBlit.Default();
          if (this.Action[0] === 0) {
            return;
          }
          let v = new $.C4Value().init$v();
          pDef.GetProperty(15 /*P_ActMap*/, v);
          let actmap = v.getPropList();
          if (actmap == null) {
            return;
          }
          actmap.GetPropertyByS($.Strings.RegString$pi8(P(this.Action, 0)), v);
          let action = v.getPropList();
          if (action == null) {
            return;
          }
          if (this.pSourceGfx.Type === 1) {
            this.fctBlit.Set$pC4Surface$f32$f32$f32$f32$f32$f32$f32(this.pSourceGfx.GetBitmap(), Math.fround(action.GetPropertyInt(31 /*P_X*/)), Math.fround(action.GetPropertyInt(32 /*P_Y*/)), Math.fround(action.GetPropertyInt(35 /*P_Wdt*/)), Math.fround(action.GetPropertyInt(36 /*P_Hgt*/)));
          } else if (this.pSourceGfx.Type === 2) {
            let AnimationName = action.GetPropertyStr(67 /*P_Animation*/);
            if (AnimationName == null) {
              return;
            }
            this.pMeshInstance = new $.StdMeshInstance().init(this.pSourceGfx.$u1.Mesh, 1);
            let Animation = this.pSourceGfx.$u1.Mesh.GetSkeleton$v().GetAnimationByName(AnimationName.GetData());
            if (Animation == null) {
              return;
            }
            this.pMeshInstance.PlayAnimation$StdMeshAnimation$i32$pAnimationNode$pValueProvider$pValueProvider$b(Animation, 0, null, new $.C4ValueProviderRef$i32().init(this.iPhase, $.ftofix(Math.fround(Animation.Length / Math.fround(action.GetPropertyInt(29 /*P_Length*/))))), new $.C4ValueProviderConst().init$C4Fixed($.itofix$i32(1)), true);
          }
          break;
        }
      case 8:
        break;
      case 4:
      case 3:
        this.fZoomToShape = true;
        break;
      case 6:
        break;
      case 7:
        break;
      case 5:
        break;
    }
  }

  Set(aMode, pGfx, szAction, dwBMode, pOvrlObj) {
    this.eMode = aMode;
    this.pSourceGfx = pGfx;
    if (szAction != null) {
      $.SCopy$pi8$pi8$u64(szAction, P(this.Action, 0), 30);
    } else {
      $wr(P(this.Action, 0), 0, 0);
    }
    this.dwBlitMode = dwBMode;
    this.OverlayObj.op_assign(pOvrlObj);
    this.iPhase = 0;
    this.UpdateFacet();
  }

  init() {
    this.eMode = 0 /*MODE_None*/;
    this.pSourceGfx = null;
    this.fctBlit = new $.C4TargetFacet().init();
    this.pMeshInstance = null;
    this.dwBlitMode = 0;
    this.dwClrModulation = 0xffffff;
    this.OverlayObj = new $.C4ObjectPtr().init$pC4Object(null);
    this.Transform = new $.C4DrawTransform().init$i32(1);
    this.iPhase = 0;
    this.fZoomToShape = false;
    this.iID = 0;
    this.pNext = null;
    $wr(P(this.Action, 0), 0, 0);
    return this;
  }

  $dtor() {
    $delete(this.pMeshInstance);
    this.pMeshInstance = null;
    let pNextOther = this.pNext;
    let pOther = null;
    while ((pOther = pNextOther) != null) {
      pNextOther = pOther.pNext;
      pOther.pNext = null;
      $delete(pOther);
    }
  }

  CompileFunc(pComp) {
    pComp.Value$ri32(P(this, "iID"));
    pComp.Separator();
    pComp.Value$StdDefaultAdapt$C4DefGraphicsAdapt$pC4DefGraphics($.mkDefaultAdapt$mC4DefGraphicsAdapt$rpC4DefGraphics(new C4DefGraphicsAdapt().init(P(this, "pSourceGfx")), null));
    pComp.Separator();
    pComp.Value$StdIntAdapt$i32$i32$3($.mkIntAdapt$ri32$3(P(this, "eMode")));
    pComp.Separator();
    pComp.Value$StdStringAdapt($.mkStringAdaptMIE(this.Action));
    pComp.Separator();
    pComp.Value$ru32(P(this, "dwBlitMode"));
    pComp.Separator();
    pComp.Value$ri32(P(this, "iPhase"));
    pComp.Separator();
    pComp.Separator(7 /*SEP_START*/);
    pComp.Value$rC4DrawTransform(this.Transform);
    pComp.Separator(8 /*SEP_END*/);
    if (pComp.Separator()) {
      pComp.Value$StdIntAdapt$u32$i32($.mkIntAdapt$ru32(P(this, "dwClrModulation")));
    } else if (pComp.isDeserializer()) {
      this.dwClrModulation = 0xffffff;
    }
    if (pComp.Separator()) {
      pComp.Value$rC4ObjectPtr(this.OverlayObj);
    } else if (pComp.isDeserializer()) {
      this.OverlayObj.op_assign(null);
    }
    if (pComp.isDeserializer()) {
      this.UpdateFacet();
    }
  }

  DenumeratePointers() {
    this.OverlayObj.DenumeratePointers();
  }

  SetAsBase(pBaseGfx, dwBMode) {
    this.Set(1 /*MODE_Base*/, pBaseGfx, null, dwBMode, null);
  }

  SetAsAction(pBaseGfx, szAction, dwBMode) {
    this.Set(2 /*MODE_Action*/, pBaseGfx, szAction, dwBMode, null);
  }

  SetAsPicture(pBaseGfx, dwBMode) {
    this.Set(3 /*MODE_Picture*/, pBaseGfx, null, dwBMode, null);
  }

  SetAsIngamePicture(pBaseGfx, dwBMode) {
    this.Set(4 /*MODE_IngamePicture*/, pBaseGfx, null, dwBMode, null);
  }

  SetAsObject(pOverlayObj, dwBMode) {
    this.Set(5 /*MODE_Object*/, null, null, dwBMode, pOverlayObj);
  }

  SetAsObjectPicture(pOverlayObj, dwBMode) {
    this.Set(8 /*MODE_ObjectPicture*/, null, null, dwBMode, pOverlayObj);
  }

  SetAsExtraGraphics(pGfx, dwBMode) {
    this.Set(6 /*MODE_ExtraGraphics*/, pGfx, null, dwBMode, null);
  }

  SetAsRank(dwBMode, rank_obj) {
    this.Set(7 /*MODE_Rank*/, null, null, dwBMode, rank_obj);
  }

  IsValid(pForObj) {
    0;
    if (this.eMode === 5 || this.eMode === 7 || this.eMode === 8) {
      if (this.OverlayObj.op_not() || !(this.OverlayObj.op_arrow().Status !== 0)) {
        return false;
      }
      return this.eMode === 7 || !this.OverlayObj.op_arrow().HasGraphicsOverlayRecursion(pForObj);
    } else if (this.eMode === 6) {
      return !(this.pSourceGfx == null);
    } else if (this.pSourceGfx != null) {
      if (this.eMode === 3 || this.eMode === 4) {
        return true;
      } else if (this.pSourceGfx.Type === 1) {
        return !(this.fctBlit.Surface == null);
      } else if (this.pSourceGfx.Type === 2) {
        return !(this.pMeshInstance == null);
      }
      return false;
    } else {
      return false;
    }
  }

  GetTransform() {
    return this.Transform.op_and();
  }

  GetOverlayObject() {
    return this.OverlayObj.op_C4Object_();
  }

  GetID() {
    return this.iID;
  }

  SetID(aID) {
    this.iID = aID;
  }

  GetNext() {
    return this.pNext;
  }

  SetNext(paNext) {
    this.pNext = paNext;
  }

  IsPicture() {
    return this.eMode === 3;
  }

  GetGfx() {
    return this.pSourceGfx;
  }

  Draw(cgo, pForObj, iByPlayer) {
    0;
    const offX = [0];
    const offY = [0];
    const newzoom = [0];
    if (pForObj != null) {
      pForObj.GetDrawPosition$C4TargetFacet$rf32$rf32$rf32(cgo, P(offX, 0), P(offY, 0), P(newzoom, 0));
    } else {
      offX[0] = cgo.X;
      offY[0] = cgo.Y;
      newzoom[0] = cgo.Zoom;
    }
    let zdsi = new $.ZoomDataStackItem().init$f32(newzoom[0]);
    try {
      if (this.dwBlitMode === 256) {
        0;
        (this.OverlayObj.op_C4Object_() != null ? this.OverlayObj.op_C4Object_() : pForObj).PrepareDrawing();
      } else {
        $.pDraw.SetBlitMode(this.dwBlitMode);
        if (this.dwClrModulation !== 0xffffff) {
          $.pDraw.ActivateBlitModulation(this.dwClrModulation);
        }
        if (this.pMeshInstance != null) {
          this.pMeshInstance.SetFaceOrderingForClrModulation(this.dwClrModulation);
        }
      }
      if (this.eMode === 7) {
        0;
        let ccgo = new $.C4TargetFacet().init();
        ccgo.Set$pC4Surface$f32$f32$f32$f32$f32$f32$f32(cgo.Surface, Math.fround(offX[0] + Math.fround(pForObj.Shape.x)), Math.fround(offY[0] + Math.fround(pForObj.Shape.y)), Math.fround(pForObj.Shape.Wdt), Math.fround(pForObj.Shape.Hgt), cgo.TargetX, cgo.TargetY);
        this.DrawRankSymbol(ccgo, this.OverlayObj.op_C4Object_());
      } else if (this.OverlayObj.op_C4Object_() != null) {
        0;
        if (this.eMode === 8) {
          let fctTarget = new $.C4Facet().init$v();
          fctTarget.Set$pC4Surface$f32$f32$f32$f32(cgo.Surface, Math.fround(offX[0] + Math.fround(pForObj.Shape.x)), Math.fround(offY[0] + Math.fround(pForObj.Shape.y)), Math.fround(pForObj.Shape.Wdt), Math.fround(pForObj.Shape.Hgt));
          this.OverlayObj.op_arrow().DrawPicture(fctTarget, false, new $.C4DrawTransform().init$rC4DrawTransform$f32$f32(this.Transform, Math.fround(fctTarget.X + Math.fround(fctTarget.Wdt / Math.fround(2))), Math.fround(fctTarget.Y + Math.fround(fctTarget.Hgt / Math.fround(2)))).op_and());
        } else {
          this.OverlayObj.op_arrow().Draw$rC4TargetFacet$i32$i32$f32$f32(cgo, iByPlayer, 1 /*ODM_Overlay*/, Math.fround(offX[0] + Math.fround(this.Transform.GetXOffset())), Math.fround(offY[0] + Math.fround(this.Transform.GetYOffset())));
          this.OverlayObj.op_arrow().DrawTopFace(cgo, iByPlayer, 1 /*ODM_Overlay*/, Math.fround(offX[0] + Math.fround(this.Transform.GetXOffset())), Math.fround(offY[0] + Math.fround(this.Transform.GetYOffset())));
        }
      } else if (this.eMode === 6) {
        0;
        if (this.pSourceGfx != null) {
          let pPrevGfx = pForObj.GetGraphics();
          let pPrevTrf = pForObj.pDrawTransform;
          let trf = new $.C4DrawTransform().init$v();
          if (pPrevTrf != null) {
            trf.$assign(pPrevTrf);
            trf.op_mulAssign(this.Transform);
          } else {
            trf.$assign(this.Transform);
          }
          pForObj.SetGraphics$pC4DefGraphics$b(this.pSourceGfx, true);
          pForObj.pDrawTransform = trf.op_and();
          pForObj.Draw$rC4TargetFacet$i32$i32$f32$f32(cgo, iByPlayer, 2 /*ODM_BaseOnly*/);
          pForObj.DrawTopFace(cgo, iByPlayer, 2 /*ODM_BaseOnly*/);
          pForObj.SetGraphics$pC4DefGraphics$b(pPrevGfx, true);
          pForObj.pDrawTransform = pPrevTrf;
        }
      } else if (this.eMode === 3 || this.eMode === 4) {
        0;
        let twdt = 0;
        let thgt = 0;
        if (this.fZoomToShape) {
          twdt = Math.fround(pForObj.Shape.Wdt);
          thgt = Math.fround(pForObj.Shape.Hgt);
        } else {
          twdt = Math.fround(this.pSourceGfx.pDef.Shape.Wdt);
          thgt = Math.fround(this.pSourceGfx.pDef.Shape.Hgt);
        }
        let ccgo = new $.C4TargetFacet().init();
        ccgo.Set$pC4Surface$f32$f32$f32$f32$f32$f32$f32(cgo.Surface, Math.fround(offX[0] - Math.fround(twdt / Math.fround(2))), Math.fround(offY[0] - Math.fround(thgt / Math.fround(2))), twdt, thgt, cgo.TargetX, cgo.TargetY);
        let trf = new $.C4DrawTransform().init$rC4DrawTransform$f32$f32(this.Transform, offX[0], offY[0]);
        this.pSourceGfx.Draw(ccgo, pForObj.Color, null, this.iPhase, 0, trf.op_and());
      } else {
        if (this.fctBlit.Surface != null && pForObj != null) {
          this.fctBlit.Surface.SetClr(pForObj.Color);
        }
        if (this.pMeshInstance == null) {
          let trf = new $.C4DrawTransform().init$rC4DrawTransform$f32$f32(this.Transform, offX[0], offY[0]);
          if (this.fZoomToShape) {
            0;
            let fZoom = $min(Math.fround(Math.fround(pForObj.Shape.Wdt) / $max(this.fctBlit.Wdt, 1)), Math.fround(Math.fround(pForObj.Shape.Hgt) / $max(this.fctBlit.Hgt, 1)));
            trf.ScaleAt(fZoom, fZoom, offX[0], offY[0]);
          }
          this.fctBlit.DrawT$pC4Surface$f32$f32$i32$i32$pC4DrawTransform(cgo.Surface, Math.fround(Math.fround(offX[0] - Math.fround(this.fctBlit.Wdt / Math.fround(2))) + this.fctBlit.TargetX), Math.fround(Math.fround(offY[0] - Math.fround(this.fctBlit.Hgt / Math.fround(2))) + this.fctBlit.TargetY), this.iPhase, 0, trf.op_and());
        } else {
          let pDef = this.pSourceGfx.pDef;
          let trf = new $.C4DrawTransform().init$rC4DrawTransform$f32$f32(this.Transform, offX[0], offY[0]);
          if (this.fZoomToShape) {
            0;
            let fZoom = $min(Math.fround(Math.fround(pForObj.Shape.Wdt) / Math.fround($max(pDef.Shape.Wdt, 1))), Math.fround(Math.fround(pForObj.Shape.Hgt) / Math.fround($max(pDef.Shape.Hgt, 1))));
            trf.ScaleAt(fZoom, fZoom, offX[0], offY[0]);
          }
          let value = new $.C4Value().init$v();
          pDef.GetProperty(22 /*P_MeshTransformation*/, value);
          let matrix = new $.StdMeshMatrix();
          if ($.C4ValueToMatrix$rC4Value$pStdMeshMatrix(value, matrix)) {
            $.pDraw.SetMeshTransform(matrix);
          }
          $.pDraw.RenderMesh(this.pMeshInstance, cgo.Surface, Math.fround(offX[0] - pDef.Shape.Wdt / 2), Math.fround(offY[0] - pDef.Shape.Hgt / 2), Math.fround(pDef.Shape.Wdt), Math.fround(pDef.Shape.Hgt), pForObj != null ? pForObj.Color : 255, trf.op_and());
          $.pDraw.SetMeshTransform(null);
        }
      }
      if (this.dwBlitMode === 256) {
        (this.OverlayObj.op_C4Object_() != null ? this.OverlayObj.op_C4Object_() : pForObj).FinishedDrawing();
      } else {
        $.pDraw.ResetBlitMode();
        $.pDraw.DeactivateBlitModulation();
      }
    } finally { zdsi && zdsi.$dtor(); }
  }

  DrawPicture(cgo, pForObj, trans) {
    0;
    if (this.dwBlitMode === 256) {
      if (pForObj != null) {
        pForObj.PrepareDrawing();
      }
    } else {
      $.pDraw.SetBlitMode(this.dwBlitMode);
      if (this.dwClrModulation !== 0xffffff) {
        $.pDraw.ActivateBlitModulation(this.dwClrModulation);
      }
      if (this.pMeshInstance != null) {
        this.pMeshInstance.SetFaceOrderingForClrModulation(this.dwClrModulation);
      }
    }
    let trf = new $.C4DrawTransform().init$rC4DrawTransform$f32$f32(this.Transform, Math.fround(cgo.X + Math.fround(cgo.Wdt / 2)), Math.fround(cgo.Y + Math.fround(cgo.Hgt / 2)));
    if (trans != null) {
      trf.op_mulAssign(trans);
    }
    this.pSourceGfx.Draw(cgo, pForObj.Color, null, this.iPhase, 0, trf.op_and());
    if (this.dwBlitMode === 256) {
      if (pForObj != null) {
        pForObj.FinishedDrawing();
      }
    } else {
      $.pDraw.ResetBlitMode();
      $.pDraw.DeactivateBlitModulation();
    }
  }

  DrawRankSymbol(cgo, rank_obj) {
    if (rank_obj == null || rank_obj.Info == null) {
      return;
    }
    let pRankSys = $.DefaultRanks;
    let pRankRes = $.GraphicsResource.fctRank;
    let iRankCnt = $.GraphicsResource.iNumRanks;
    let rank_def = rank_obj.Def;
    if (rank_def.pRankSymbols != null) {
      pRankRes = rank_def.pRankSymbols;
      iRankCnt = rank_def.iNumRankSymbols;
    }
    if (rank_def.pRankNames != null) {
      pRankSys = rank_def.pRankNames;
      iRankCnt = rank_def.pRankNames.GetBaseRankNum();
    }
    $.C4RankSystem.DrawRankSymbol(null, rank_obj.Info.Rank, pRankRes, iRankCnt, false, 0, cgo);
  }

  op_eq(rCmp) {
    return this.eMode === rCmp.eMode && this.pSourceGfx === rCmp.pSourceGfx && $.SEqual(P(this.Action, 0), P(rCmp.Action, 0)) && this.dwBlitMode === rCmp.dwBlitMode && this.dwClrModulation === rCmp.dwClrModulation && this.Transform.op_eq(rCmp.Transform) && this.OverlayObj.op_eq$C4ObjectPtr(rCmp.OverlayObj);
  }

  GetClrModulation() {
    return this.dwClrModulation;
  }

  SetClrModulation(dwToMod) {
    this.dwClrModulation = dwToMod;
  }

  GetBlitMode() {
    return this.dwBlitMode;
  }

  SetBlitMode(dwToMode) {
    this.dwBlitMode = dwToMode;
  }

  $clone() { return new C4GraphicsOverlay().$assign(this); }
  $assign(o) {
    this.eMode = o.eMode;
    this.pSourceGfx = o.pSourceGfx;
    this.Action = o.Action.slice();
    this.fctBlit.$assign(o.fctBlit);
    this.pMeshInstance = o.pMeshInstance;
    this.dwBlitMode = o.dwBlitMode;
    this.dwClrModulation = o.dwClrModulation;
    this.OverlayObj.$assign(o.OverlayObj);
    this.Transform.$assign(o.Transform);
    this.iPhase = o.iPhase;
    this.fZoomToShape = o.fZoomToShape;
    this.iID = o.iID;
    this.pNext = o.pNext;
    return this;
  }
}

export class C4GraphicsOverlayListAdapt {
  pOverlay = null;

  init(pOverlay) {
    this.pOverlay = pOverlay;
    return this;
  }

  CompileFunc(pComp) {
    let fNaming = pComp.hasNaming();
    if (pComp.isDeserializer()) {
      $delete(this.pOverlay.a[this.pOverlay.o]);
      this.pOverlay.a[this.pOverlay.o] = null;
      let pLast = null;
      const fContinue = [false];
      do {
        let pNext = new C4GraphicsOverlay().init();
        try {
          pComp.Value$rC4GraphicsOverlay(pNext);
        } catch ($e3) {
          if ($e3 instanceof $.StdCompiler$NotFoundException) {
            const e = $e3;
            $delete(e);
            $delete(pNext);
            pNext = null;
            if (pLast == null) {
              this.pOverlay.a[this.pOverlay.o] = null;
            }
            return;
          } else {
            throw $e3;
          }
        }
        if (pLast != null) {
          pLast.SetNext(pNext);
        } else {
          this.pOverlay.a[this.pOverlay.o] = pNext;
        }
        pLast = pNext;
        if (fNaming) {
          fContinue[0] = pComp.Separator(2 /*SEP_SEP2*/) || pComp.Separator(1 /*SEP_SEP*/);
        } else {
          pComp.Value$rb(P(fContinue, 0));
        }
      } while (fContinue[0]);
    } else {
      const fContinue = [true];
      for (let pPos = this.pOverlay.a[this.pOverlay.o]; pPos != null; pPos = pPos.GetNext()) {
        if (pPos !== this.pOverlay.a[this.pOverlay.o]) {
          if (fNaming) {
            pComp.Separator(2 /*SEP_SEP2*/);
          } else {
            pComp.Value$rb(P(fContinue, 0));
          }
        }
        pComp.Value$rC4GraphicsOverlay(pPos);
      }
      if (!fNaming) {
        fContinue[0] = false;
        pComp.Value$rb(P(fContinue, 0));
      }
    }
  }

  op_eq(pDefault) {
    return this.pOverlay.a[this.pOverlay.o] === pDefault;
  }

  op_assign(pDefault) {
    $delete(this.pOverlay.a[this.pOverlay.o]);
    this.pOverlay.a[this.pOverlay.o] = pDefault;
  }

  $clone() { return new C4GraphicsOverlayListAdapt().$assign(this); }
  $assign(o) {
    this.pOverlay = o.pOverlay;
    return this;
  }
}

export class C4AdditionalDefGraphics extends C4DefGraphics {
  Name = new Int8Array(31);

  init(pOwnDef, szName) {
    super.init(pOwnDef);
    $.SCopy$pi8$pi8$u64(szName, P(this.Name, 0), 30);
    return this;
  }

  GetName() {
    return P(this.Name, 0);
  }

  $clone() { return new C4AdditionalDefGraphics().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Name = o.Name.slice();
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4AdditionalDefGraphics, C4DefGraphics, C4DefGraphics$$anon1, C4DefGraphics$$anon1$$anon1, C4DefGraphicsAdapt, C4DefGraphicsPtrBackup, C4DefGraphicsPtrBackupEntry, C4GraphicsOverlay, C4GraphicsOverlayListAdapt });
