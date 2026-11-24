// @ts-nocheck
// OpenClonk 36de799: src/landscape/fow/C4FoW.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { P, S } from '../../../rt/ptr.ts';
import { $ } from '../../../rt/registry.ts';
import { $delete } from '../../../rt/std.ts';

export class C4FragTransform {
  static $layout = [["x", 0, "f32", 0], ["y", 4, "f32", 0], ["x0", 8, "f32", 0], ["y0", 12, "f32", 0]];
  static $size = 16;
  x = 1;
  y = 1;
  x0 = 0;
  y0 = 0;

  Translate(dx, dy) {
    this.x0 = Math.fround(this.x0 + dx);
    this.y0 = Math.fround(this.y0 + dy);
  }

  Scale(sx, sy) {
    this.x = Math.fround(this.x * sx);
    this.y = Math.fround(this.y * sy);
    this.x0 = Math.fround(this.x0 * sx);
    this.y0 = Math.fround(this.y0 * sy);
  }

  Get2x3(transform) {
    transform.a[transform.o + 0] = this.x;
    transform.a[transform.o + 1] = 0;
    transform.a[transform.o + 2] = this.x0;
    transform.a[transform.o + 3] = 0;
    transform.a[transform.o + 4] = this.y;
    transform.a[transform.o + 5] = this.y0;
  }

  $clone() { return new C4FragTransform().$assign(this); }
  $assign(o) {
    this.x = o.x;
    this.y = o.y;
    this.x0 = o.x0;
    this.y0 = o.y0;
    return this;
  }
}

export class C4FoW {
  pLights = null;
  deleted_lights = null;
  Ambient = new $.C4FoWAmbient();
  FramebufShader = new $.C4Shader().init();
  RenderShader = new $.C4Shader().init();

  init() {
    this.pLights = null;
    this.deleted_lights = null;
    this.Ambient = new $.C4FoWAmbient();
    this.FramebufShader = new $.C4Shader().init();
    this.RenderShader = new $.C4Shader().init();
    return this;
  }

  $dtor() {
    if (this.deleted_lights != null) {
      C4FoW.prototype.ClearDeletedLights.call(this);
    }
  }

  GetFramebufShader() {
    if (!this.FramebufShader.Initialised()) {
      let FramebufVertexShader = S("in vec2 oc_Position;\nin vec2 oc_TexCoord;\nout vec2 texcoord;\nuniform mat4 projectionMatrix;\n\nslice(position)\n{\n  gl_Position = projectionMatrix * vec4(oc_Position, 0.0, 1.0);\n}\n\nslice(texcoord)\n{\n  texcoord = oc_TexCoord;\n}");
      let FramebufFragmentShader = S("in vec2 texcoord;\nuniform sampler2D tex;\nout vec4 fragColor;\n\nslice(color)\n{\n  fragColor = texture(tex, texcoord);\n}");
      this.FramebufShader.AddVertexSlices(S("built-in FoW framebuf shader"), FramebufVertexShader);
      this.FramebufShader.AddFragmentSlices(S("built-in FoW framebuf shader"), FramebufFragmentShader);
      const szUniforms = new Array(3).fill(null);
      szUniforms[0 /*C4FoWFSU_ProjectionMatrix*/] = S("projectionMatrix");
      szUniforms[1 /*C4FoWFSU_Texture*/] = S("tex");
      szUniforms[2 /*C4FoWFSU_Count*/] = null;
      const szAttributes = new Array(3).fill(null);
      szAttributes[0 /*C4FoWFSA_Position*/] = S("oc_Position");
      szAttributes[1 /*C4FoWFSA_TexCoord*/] = S("oc_TexCoord");
      szAttributes[2 /*C4FoWFSA_Count*/] = null;
      if (!this.FramebufShader.Init(S("framebuf"), P(szUniforms, 0), P(szAttributes, 0))) {
        this.FramebufShader.ClearSlices();
        return null;
      }
    }
    return this.FramebufShader;
  }

  GetRenderShader() {
    if (!this.RenderShader.Initialised()) {
      let RenderVertexShader = S("in vec2 oc_Position;\nin vec4 oc_Color;\nout vec4 vtxColor;\nuniform mat4 projectionMatrix;\nuniform vec2 vertexOffset;\n\nslice(position)\n{\n  gl_Position = projectionMatrix * vec4(oc_Position + vertexOffset, 0.0, 1.0);\n}\n\nslice(color)\n{\n  vtxColor = oc_Color;\n}");
      let RenderFragmentShader = S("in vec4 vtxColor;\nout vec4 fragColor;\n\nslice(color)\n{\n  fragColor = vtxColor;\n}");
      this.RenderShader.AddVertexSlices(S("built-in FoW render shader"), RenderVertexShader);
      this.RenderShader.AddFragmentSlices(S("built-in FoW render shader"), RenderFragmentShader);
      const szUniforms = new Array(3).fill(null);
      szUniforms[0 /*C4FoWRSU_ProjectionMatrix*/] = S("projectionMatrix");
      szUniforms[1 /*C4FoWRSU_VertexOffset*/] = S("vertexOffset");
      szUniforms[2 /*C4FoWRSU_Count*/] = null;
      const szAttributes = new Array(3).fill(null);
      szAttributes[0 /*C4FoWRSA_Position*/] = S("oc_Position");
      szAttributes[1 /*C4FoWRSA_Color*/] = S("oc_Color");
      szAttributes[2 /*C4FoWRSA_Count*/] = null;
      if (!this.RenderShader.Init(S("fowRender"), P(szUniforms, 0), P(szAttributes, 0))) {
        this.RenderShader.ClearSlices();
        return null;
      }
    }
    return this.RenderShader;
  }

  ClearDeletedLights() {
    while (this.deleted_lights != null) {
      let light = this.deleted_lights;
      this.deleted_lights = this.deleted_lights.getNext();
      $delete(light);
    }
  }

  Add(pObj) {
    if (pObj.lightRange === 0 && pObj.lightFadeoutRange === 0) {
      this.Remove(pObj);
      return;
    }
    if (pObj.Status === 0) {
      return;
    }
    let pLight = null;
    for (pLight = this.pLights; pLight != null; pLight = pLight.getNext()) {
      if (pLight.getObj() === pObj) {
        break;
      }
    }
    if (pLight != null) {
      pLight.SetReach(pObj.lightRange, pObj.lightFadeoutRange);
      pLight.SetColor(pObj.lightColor);
    } else {
      pLight = new $.C4FoWLight().init(pObj);
      pLight.pNext = this.pLights;
      this.pLights = pLight;
    }
  }

  Remove(pObj) {
    let pPrev = null;
    let pLight = null;
    for (pLight = this.pLights; pLight != null; pPrev = pLight, pLight = pLight.getNext()) {
      if (pLight.getObj() === pObj) {
        break;
      }
    }
    if (pLight == null) {
      return;
    }
    (($v) => pPrev != null ? (pPrev.pNext = $v) : (this.pLights = $v))(pLight.getNext());
    pLight.pNext = this.deleted_lights;
    this.deleted_lights = pLight;
  }

  Update(r, pPlr) {
    for (let pLight = this.pLights; pLight != null; pLight = pLight.getNext()) {
      if (pLight.IsVisibleForPlayer(pPlr)) {
        pLight.Update(r.$clone());
      }
    }
  }

  Invalidate(r) {
    for (let pLight = this.pLights; pLight != null; pLight = pLight.getNext()) {
      pLight.Invalidate(r.$clone());
    }
  }

  Render(pRegion, pOnScreen, pPlr, projectionMatrix) {
    this.ClearDeletedLights();
    let pShader = this.GetRenderShader();
    0;
    if (pShader == null) {
      return;
    }
    let Call = new $.C4ShaderCall().init(pShader);
    try {
      Call.Start();
      Call.SetUniformMatrix4x4$i32$StdProjectionMatrix(0, projectionMatrix);
      for (let pLight = this.pLights; pLight != null; pLight = pLight.getNext()) {
        if (pLight.IsVisibleForPlayer(pPlr)) {
          pLight.Render(pRegion, pOnScreen, Call);
        }
      }
      Call.Finish();
    } finally { Call && Call.$dtor(); }
  }

  $clone() { return new C4FoW().$assign(this); }
  $assign(o) {
    this.pLights = o.pLights;
    this.deleted_lights = o.deleted_lights;
    this.Ambient.$assign(o.Ambient);
    this.FramebufShader.$assign(o.FramebufShader);
    this.RenderShader.$assign(o.RenderShader);
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4FoW, C4FragTransform });
