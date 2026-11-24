// @ts-nocheck
// OpenClonk 36de799: src/object/C4MeshDenumerator.cpp, src/object/C4MeshDenumerator.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { StdMeshInstance$AttachedMesh$Denumerator } from '../lib/StdMesh.ts';

export class C4MeshDenumerator extends StdMeshInstance$AttachedMesh$Denumerator {
  Def = null;
  Object = new $.C4ObjectPtr().init$v();

  init$v() {
    this.Def = null;
    this.Object = new $.C4ObjectPtr().init$pC4Object(null);
    return this;
  }

  init$pC4Def(def) {
    this.Def = def;
    this.Object = new $.C4ObjectPtr().init$pC4Object(null);
    return this;
  }

  init$pC4Object(object) {
    this.Def = null;
    this.Object = new $.C4ObjectPtr().init$pC4Object(object);
    return this;
  }

  GetObject() {
    return this.Object.op_C4Object_();
  }

  CompileFunc(pComp, attach) {
    if (pComp.isDeserializer()) {
      const def = [0];
      pComp.Value$StdNamingCountAdapt$i32($.mkNamingCountAdapt$ri32$pi8(P(def, 0), S("ChildInstance")));
      if (def[0] !== 0) {
        const pGfx = [null];
        pComp.Value$StdNamingAdapt$C4DefGraphicsAdapt($.mkNamingAdapt$mC4DefGraphicsAdapt$pi8(new $.C4DefGraphicsAdapt().init(P(pGfx, 0)), S("ChildMesh")));
        this.Def = pGfx[0].pDef;
        if (pGfx[0].Type !== 2) {
          pComp.excCorrupt(S("ChildMesh points to non-mesh graphics"));
        }
        0;
        pComp.Value$StdParameterAdapt$StdContextPtrAdapt$StdMeshInstance$StdMesh$x($.mkParAdapt$mStdContextPtrAdapt$StdMeshInstance$StdMesh$x($.mkNamingContextPtrAdapt(P(attach, "Child"), pGfx[0].$u1.Mesh, S("ChildInstance")), $.C4MeshDenumeratorFactory));
        0;
        attach.OwnChild = true;
      } else {
        pComp.Value$StdNamingAdapt$C4ObjectPtr($.mkNamingAdapt$rC4ObjectPtr$pi8(this.Object, S("ChildObject")));
        attach.OwnChild = false;
      }
    } else {
      const def = [0];
      if (this.Def != null) {
        def[0] = def[0] + 1 | 0;
      }
      pComp.Value$StdNamingCountAdapt$i32($.mkNamingCountAdapt$ri32$pi8(P(def, 0), S("ChildInstance")));
      if (this.Def != null) {
        0;
        const pGfx = [this.Def.Graphics];
        0;
        pComp.Value$StdNamingAdapt$C4DefGraphicsAdapt($.mkNamingAdapt$mC4DefGraphicsAdapt$pi8(new $.C4DefGraphicsAdapt().init(P(pGfx, 0)), S("ChildMesh")));
        pComp.Value$StdParameterAdapt$StdContextPtrAdapt$StdMeshInstance$StdMesh$x($.mkParAdapt$mStdContextPtrAdapt$StdMeshInstance$StdMesh$x($.mkNamingContextPtrAdapt(P(attach, "Child"), pGfx[0].$u1.Mesh, S("ChildInstance")), $.C4MeshDenumeratorFactory));
      } else {
        0;
        pComp.Value$StdNamingAdapt$C4ObjectPtr($.mkNamingAdapt$rC4ObjectPtr$pi8(this.Object, S("ChildObject")));
      }
    }
  }

  DenumeratePointers(attach) {
    this.Object.DenumeratePointers();
    if (this.Object.op_C4Object_() != null) {
      0;
      0;
      if (attach.Child == null) {
        attach.Child = this.Object.op_arrow().pMeshInstance;
      }
    }
  }

  ClearPointers(pObj) {
    if (this.Object.op_eq$pC4Object(pObj)) {
      this.Object.op_assign(null);
      return false;
    }
    return true;
  }

  $clone() { return new C4MeshDenumerator().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Def = o.Def;
    this.Object.$assign(o.Object);
    return this;
  }
}


export function $init(): void {
  $.C4MeshDenumeratorFactory = $.StdMeshInstance$AttachedMesh.DenumeratorFactory;
}

Object.assign($, { C4MeshDenumerator });
