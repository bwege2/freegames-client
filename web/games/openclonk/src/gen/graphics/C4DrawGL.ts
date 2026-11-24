// @ts-nocheck
// OpenClonk 36de799: src/graphics/C4DrawGL.cpp, src/graphics/C4DrawGL.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { C4Draw } from './C4Draw.ts';
import { gl$SDL_GL_CreateContext, gl$SDL_GL_DeleteContext, gl$SDL_GL_MakeCurrent, gl$SDL_GL_SetAttribute, gl$SDL_GL_SwapWindow, gl$epoxy_gl_version, gl$epoxy_has_gl_extension, gl$epoxy_is_desktop_gl, gl$glBindBuffer, gl$glBindTexture, gl$glBindVertexArray, gl$glBlendFunc, gl$glBufferData, gl$glBufferSubData, gl$glClear, gl$glClearColor, gl$glDebugMessageCallback, gl$glDeleteBuffers, gl$glDeleteTextures, gl$glDeleteVertexArrays, gl$glDepthFunc, gl$glDepthMask, gl$glDisable, gl$glDrawArrays, gl$glEnable, gl$glEnableVertexAttribArray, gl$glFlush, gl$glGenBuffers, gl$glGenTextures, gl$glGenVertexArrays, gl$glGetError, gl$glGetIntegerv, gl$glGetString, gl$glGetStringi, gl$glObjectLabel, gl$glPixelStorei, gl$glTexImage2D, gl$glTexParameterfv, gl$glTexParameteri, gl$glVertexAttribPointer, gl$glViewport } from '../../rt/gl.ts';
import { $i64n } from '../../rt/int.ts';
import { c$fabs, c$sqrt, c$sqrtf, c$tan } from '../../rt/libc.ts';
import { $bytesView, $oadd, $oarr, $oat, $oidx, $own, $rd, $view8, $wr, P, S, SB } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { sdl$SDL_GetError } from '../../rt/sdl.ts';
import { $begin, $delete, $end, $itcopy, $max, $min, StdException, StdSet, StdString, resize, seq_erase, seq_insert, std_find } from '../../rt/std.ts';

export class C4DrawGLError extends StdException {
  Buf = new $.StdCopyStrBuf();

  init(buf) {
    this.Buf = new $.StdCopyStrBuf().init$StdStrBuf$b(buf);
    return this;
  }

  what() {
    return this.Buf.getData();
  }

  $clone() { return new C4DrawGLError().$assign(this); }
  $assign(o) {
    this.Buf.$assign(o.Buf);
    return this;
  }
}

export class CStdGLCtx {
  static contexts;
  pWindow = null;
  ctx = null;
  this_context = null;
  hVAOs = [];
  VAOsToBeDeleted = [];

  init() {
    this.pWindow = null;
    this.this_context = $end(CStdGLCtx.contexts);
    this.hVAOs = [];
    this.VAOsToBeDeleted = [];
    this.ctx = null;
    return this;
  }

  $dtor() {
    CStdGLCtx.prototype.Clear.call(this);
  }

  Clear(_multisample_change = false) {
    this.Deselect();
    if (this.ctx != null) {
      gl$SDL_GL_DeleteContext(this.ctx);
    }
    this.ctx = null;
    this.pWindow = null;
    if (!this.this_context.eq($end(CStdGLCtx.contexts))) {
      seq_erase(CStdGLCtx.contexts, $itcopy(this.this_context));
      this.this_context = $end(CStdGLCtx.contexts).copy();
    }
  }

  Init(pWindow, _1) {
    if ($.pGL == null) {
      return false;
    }
    this.pWindow = pWindow;
    this.ctx = gl$SDL_GL_CreateContext(pWindow.window);
    if (this.ctx == null) {
      $.LogSilentF(S("  gl: OpenGL %d.%d not available; falling back to 3.1 emergency context."), 3, 2);
      gl$SDL_GL_SetAttribute(17 /*SDL_GL_CONTEXT_MAJOR_VERSION*/, 3);
      gl$SDL_GL_SetAttribute(18 /*SDL_GL_CONTEXT_MINOR_VERSION*/, 1);
      $.pGL.Workarounds.ForceSoftwareTransform = true;
      this.ctx = gl$SDL_GL_CreateContext(pWindow.window);
    }
    if (this.ctx == null) {
      return $.pGL.Error_($.FormatString(S("SDL_GL_CreateContext: %s"), sdl$SDL_GetError()).getData());
    }
    if (!this.Select(true)) {
      return false;
    }
    this.this_context = seq_insert(CStdGLCtx.contexts, $end(CStdGLCtx.contexts), this).copy();
    return true;
  }

  Select(verbose = false) {
    if (gl$SDL_GL_MakeCurrent(this.pWindow.window, this.ctx) !== 0) {
      return $.pGL.Error_($.FormatString(S("SDL_GL_MakeCurrent: %s"), sdl$SDL_GetError()).getData());
    }
    this.SelectCommon();
    if (!$.pGL.UpdateClipper()) {
      if (verbose) {
        $.pGL.Error_(S("  gl: UpdateClipper failed"));
      }
      return false;
    }
    return true;
  }

  Deselect() {
    if ($.pGL != null && $.pGL.pCurrCtx === this) {
      $.pGL.pCurrCtx = null;
      $.pGL.RenderTarget = null;
    }
  }

  PageFlip() {
    gl$glFlush();
    if (this.pWindow == null) {
      return false;
    }
    gl$SDL_GL_SwapWindow(this.pWindow.window);
    return true;
  }

  SelectCommon() {
    $.pGL.pCurrCtx = this;
    gl$glDisable(2929);
    gl$glDepthFunc(513);
    gl$glDisable(2884);
    gl$glEnable(3042);
    let toBeDeleted = [];
    if (!(this.VAOsToBeDeleted.length === 0)) {
      for (const i of this.VAOsToBeDeleted) {
        if (i < this.hVAOs.length && this.hVAOs[i] !== 0) {
          toBeDeleted.push(this.hVAOs[i]);
          this.hVAOs[i] = 0;
        }
      }
      gl$glDeleteVertexArrays(toBeDeleted.length | 0, P(toBeDeleted, 0));
      this.VAOsToBeDeleted.length = 0;
    }
  }

  $clone() { return new CStdGLCtx().$assign(this); }
  $assign(o) {
    this.pWindow = o.pWindow;
    this.ctx = o.ctx;
    this.this_context = o.this_context.$clone();
    this.hVAOs = o.hVAOs.slice();
    this.VAOsToBeDeleted = o.VAOsToBeDeleted.slice();
    return this;
  }
}

export class CStdGL$$anon1 {
  static $layout = [["LowMaxVertexUniformCount", 0, "u8", 0], ["ForceSoftwareTransform", 1, "u8", 0]];
  static $size = 2;
  LowMaxVertexUniformCount = false;
  ForceSoftwareTransform = false;

  $clone() { return new CStdGL$$anon1().$assign(this); }
  $assign(o) {
    this.LowMaxVertexUniformCount = o.LowMaxVertexUniformCount;
    this.ForceSoftwareTransform = o.ForceSoftwareTransform;
    return this;
  }
}

export class CStdGL extends C4Draw {
  static N_GENERIC_VBOS;
  static GENERIC_VBO_SIZE;
  iPixelFormat = 0;
  sfcFmt = 0;
  pMainCtx = null;
  pCurrCtx = null;
  lines_tex = 0;
  ProjectionMatrix = new $.StdProjectionMatrix();
  SpriteShader = new $.C4Shader().init();
  SpriteShaderMod2 = new $.C4Shader().init();
  SpriteShaderBase = new $.C4Shader().init();
  SpriteShaderBaseMod2 = new $.C4Shader().init();
  SpriteShaderBaseOverlay = new $.C4Shader().init();
  SpriteShaderBaseOverlayMod2 = new $.C4Shader().init();
  SpriteShaderLight = new $.C4Shader().init();
  SpriteShaderLightMod2 = new $.C4Shader().init();
  SpriteShaderLightBase = new $.C4Shader().init();
  SpriteShaderLightBaseMod2 = new $.C4Shader().init();
  SpriteShaderLightBaseOverlay = new $.C4Shader().init();
  SpriteShaderLightBaseOverlayMod2 = new $.C4Shader().init();
  SpriteShaderLightBaseNormal = new $.C4Shader().init();
  SpriteShaderLightBaseNormalMod2 = new $.C4Shader().init();
  SpriteShaderLightBaseNormalOverlay = new $.C4Shader().init();
  SpriteShaderLightBaseNormalOverlayMod2 = new $.C4Shader().init();
  GenericVBOs = new Uint32Array(16);
  GenericVBOSizes = new Uint32Array(16);
  CurrentVBO = 0;
  GenericVAOs = new Uint32Array(32);
  VAOIDs = new StdSet();
  NextVAOID = null;
  has_khr_debug = false;
  Workarounds = new CStdGL$$anon1();

  init() {
    this.pMainCtx = null;
    this.ProjectionMatrix = new $.StdProjectionMatrix();
    this.SpriteShader = new $.C4Shader().init();
    this.SpriteShaderMod2 = new $.C4Shader().init();
    this.SpriteShaderBase = new $.C4Shader().init();
    this.SpriteShaderBaseMod2 = new $.C4Shader().init();
    this.SpriteShaderBaseOverlay = new $.C4Shader().init();
    this.SpriteShaderBaseOverlayMod2 = new $.C4Shader().init();
    this.SpriteShaderLight = new $.C4Shader().init();
    this.SpriteShaderLightMod2 = new $.C4Shader().init();
    this.SpriteShaderLightBase = new $.C4Shader().init();
    this.SpriteShaderLightBaseMod2 = new $.C4Shader().init();
    this.SpriteShaderLightBaseOverlay = new $.C4Shader().init();
    this.SpriteShaderLightBaseOverlayMod2 = new $.C4Shader().init();
    this.SpriteShaderLightBaseNormal = new $.C4Shader().init();
    this.SpriteShaderLightBaseNormalMod2 = new $.C4Shader().init();
    this.SpriteShaderLightBaseNormalOverlay = new $.C4Shader().init();
    this.SpriteShaderLightBaseNormalOverlayMod2 = new $.C4Shader().init();
    this.CurrentVBO = 0;
    this.VAOIDs = new StdSet();
    this.NextVAOID = this.VAOIDs.end();
    this.Workarounds = new CStdGL$$anon1();
    this.GenericVBOs[0] = 0;
    CStdGL.prototype.Default.call(this);
    $.pGL = this;
    this.lines_tex = 0;
    return this;
  }

  $dtor() {
    CStdGL.prototype.Clear.call(this);
    $.pGL = null;
    super.$dtor();
  }

  GenVAOID() {
    let id = 0;
    if (this.NextVAOID.eq(this.VAOIDs.begin())) {
      id = 1;
    } else {
      let iter = $itcopy(this.NextVAOID);
      iter.dec();
      id = iter.v + 1 >>> 0;
    }
    let inserted_iter = this.VAOIDs.insert($itcopy(this.NextVAOID), id);
    this.NextVAOID = inserted_iter.copy();
    let prev_id = id;
    this.NextVAOID.inc();
    while (!this.NextVAOID.eq(this.VAOIDs.end()) && prev_id + 1 >>> 0 === this.NextVAOID.v) {
      prev_id = this.NextVAOID.v;
      this.NextVAOID.inc();
    }
    return id;
  }

  FreeVAOID(vaoid) {
    let iter = this.VAOIDs.find(vaoid);
    0;
    if (this.pCurrCtx != null) {
      if (vaoid < this.pCurrCtx.hVAOs.length && this.pCurrCtx.hVAOs[vaoid] !== 0) {
        gl$glDeleteVertexArrays(1, P(this.pCurrCtx.hVAOs, vaoid));
        this.pCurrCtx.hVAOs[vaoid] = 0;
      }
    }
    for (const ctx of CStdGLCtx.contexts) {
      if (ctx !== this.pCurrCtx && vaoid < ctx.hVAOs.length && ctx.hVAOs[vaoid] !== 0) {
        if (std_find($begin(ctx.VAOsToBeDeleted), $end(ctx.VAOsToBeDeleted), vaoid).eq($end(ctx.VAOsToBeDeleted))) {
          ctx.VAOsToBeDeleted.push(vaoid);
        }
      }
    }
    let nextVaoID = 1;
    if (!this.NextVAOID.eq(this.VAOIDs.begin())) {
      let next_vao_iter = $itcopy(this.NextVAOID);
      next_vao_iter.dec();
      nextVaoID = next_vao_iter.v + 1 >>> 0;
    }
    0;
    if (vaoid < nextVaoID || iter.eq(this.NextVAOID)) {
      this.NextVAOID = this.VAOIDs.erase($itcopy(iter)).copy();
    } else {
      this.VAOIDs.erase($itcopy(iter));
    }
  }

  GetVAO(vaoid, vao) {
    0;
    if (vaoid >= this.pCurrCtx.hVAOs.length) {
      0;
      let iter = this.VAOIDs.end();
      iter.dec();
      resize(this.pCurrCtx.hVAOs, iter.v + 1 >>> 0, () => 0);
    }
    if (this.pCurrCtx.hVAOs[vaoid] === 0) {
      gl$glGenVertexArrays(1, P(this.pCurrCtx.hVAOs, vaoid));
      vao.a[vao.o] = this.pCurrCtx.hVAOs[vaoid];
      return false;
    }
    vao.a[vao.o] = this.pCurrCtx.hVAOs[vaoid];
    return true;
  }

  Clear() {
    this.NoPrimaryClipper();
    this.InvalidateDeviceObjects();
    this.NoPrimaryClipper();
    this.RenderTarget = null;
    this.SpriteShader.Clear();
    this.SpriteShaderMod2.Clear();
    this.SpriteShaderBase.Clear();
    this.SpriteShaderBaseMod2.Clear();
    this.SpriteShaderBaseOverlay.Clear();
    this.SpriteShaderBaseOverlayMod2.Clear();
    this.SpriteShaderLight.Clear();
    this.SpriteShaderLightMod2.Clear();
    this.SpriteShaderLightBase.Clear();
    this.SpriteShaderLightBaseMod2.Clear();
    this.SpriteShaderLightBaseOverlay.Clear();
    this.SpriteShaderLightBaseOverlayMod2.Clear();
    this.SpriteShaderLightBaseNormal.Clear();
    this.SpriteShaderLightBaseNormalMod2.Clear();
    this.SpriteShaderLightBaseNormalOverlay.Clear();
    this.SpriteShaderLightBaseNormalOverlayMod2.Clear();
    if (this.pCurrCtx != null) {
      this.pCurrCtx.Deselect();
    }
    this.pMainCtx = null;
    $.C4Draw.prototype.Clear.call(this);
  }

  Default() {
    $.C4Draw.prototype.Default.call(this);
    this.pCurrCtx = null;
    this.iPixelFormat = 0;
    this.sfcFmt = 0;
    this.Workarounds.LowMaxVertexUniformCount = false;
    this.Workarounds.ForceSoftwareTransform = false;
  }

  OnResolutionChanged(iXRes, iYRes) {
    this.CreatePrimaryClipper(iXRes, iYRes);
    this.RestoreDeviceObjects();
    return true;
  }

  UpdateClipper() {
    if (this.RenderTarget == null || !this.Active) {
      return true;
    }
    let clipRect = this.GetClipRect();
    if (clipRect.Wdt <= 0 || clipRect.Hgt <= 0) {
      this.ClipAll = true;
      return true;
    }
    this.ClipAll = false;
    gl$glViewport(clipRect.x, (this.RenderTarget.Hgt - clipRect.y | 0) - clipRect.Hgt | 0, clipRect.Wdt, clipRect.Hgt);
    this.ProjectionMatrix.$assign($.StdProjectionMatrix.Orthographic(Math.fround(clipRect.x), Math.fround(clipRect.x + clipRect.Wdt | 0), Math.fround(clipRect.y + clipRect.Hgt | 0), Math.fround(clipRect.y)));
    return true;
  }

  GetProjectionMatrix() {
    return this.ProjectionMatrix;
  }

  PrepareMaterial(mat_manager, loader, mat) {
    if (this.pCurrCtx == null) {
      return false;
    }
    for (let i = 0; i < mat.Techniques.length; i = i + 1 >>> 0) {
      const technique = mat.Techniques[i];
      technique.Available = true;
      for (let j = 0; j < technique.Passes.length; j = j + 1 >>> 0) {
        const pass = technique.Passes[j];
        const max_texture_units = [0];
        gl$glGetIntegerv(34930, P(max_texture_units, 0));
        0;
        max_texture_units[0] = $min(max_texture_units[0], 16);
        let active_texture_units = 0;
        for (const TextureUnit of pass.TextureUnits) {
          if (TextureUnit.HasTexture()) {
            active_texture_units = active_texture_units + 1 >>> 0;
          }
        }
        if (active_texture_units > max_texture_units[0] >>> 0) {
          technique.Available = false;
        }
        for (const texunit of pass.TextureUnits) {
          for (let l = 0; l < texunit.GetNumTextures(); l = l + 1 >>> 0) {
            const texture = texunit.GetTexture(l);
            gl$glBindTexture(3553, texture.texName);
            switch (texunit.TexAddressMode) {
              case 0:
                gl$glTexParameteri(3553, 10242, 10497);
                gl$glTexParameteri(3553, 10243, 10497);
                break;
              case 3:
                gl$glTexParameterfv(3553, 4100, P(texunit.TexBorderColor, 0));
              case 1:
                gl$glTexParameteri(3553, 10242, 10496);
                gl$glTexParameteri(3553, 10243, 10496);
                break;
              case 2:
                gl$glTexParameteri(3553, 10242, 33648);
                gl$glTexParameteri(3553, 10243, 33648);
                break;
            }
            switch (texunit.Filtering[0]) {
              case 0:
                technique.Available = false;
                break;
              case 1:
                switch (texunit.Filtering[2]) {
                  case 0:
                    gl$glTexParameteri(3553, 10241, 9728);
                    break;
                  case 1:
                    gl$glTexParameteri(3553, 10241, 9984);
                    break;
                  case 2:
                    gl$glTexParameteri(3553, 10241, 9986);
                    break;
                  case 3:
                    technique.Available = false;
                    break;
                }
                break;
              case 2:
                switch (texunit.Filtering[2]) {
                  case 0:
                    gl$glTexParameteri(3553, 10241, 9729);
                    break;
                  case 1:
                    gl$glTexParameteri(3553, 10241, 9985);
                    break;
                  case 2:
                    gl$glTexParameteri(3553, 10241, 9987);
                    break;
                  case 3:
                    technique.Available = false;
                    break;
                }
                break;
              case 3:
                technique.Available = false;
                break;
            }
            switch (texunit.Filtering[1]) {
              case 0:
                technique.Available = false;
                break;
              case 1:
                gl$glTexParameteri(3553, 10240, 9728);
                break;
              case 2:
                gl$glTexParameteri(3553, 10240, 9729);
                break;
              case 3:
                technique.Available = false;
                break;
            }
          }
        }
        let custom_shader = true;
        if (pass.VertexShader.Shader == null) {
          let buf = $.GetVertexShaderCodeForPass(pass, this.Workarounds.LowMaxVertexUniformCount);
          let hash = $.GetSHA1HexDigest(buf.getData(), buf.getLength());
          pass.VertexShader.Shader = mat_manager.AddShader(S("auto-generated vertex shader"), hash.getData(), S("glsl"), 1 /*SMMS_VERTEX*/, buf.getData(), 1);
          custom_shader = false;
        }
        if (pass.FragmentShader.Shader == null) {
          let buf = $.GetFragmentShaderCodeForPass(pass, pass.FragmentShader.Parameters);
          let hash = $.GetSHA1HexDigest(buf.getData(), buf.getLength());
          pass.FragmentShader.Shader = mat_manager.AddShader(S("auto-generated fragment shader"), hash.getData(), S("glsl"), 0 /*SMMS_FRAGMENT*/, buf.getData(), 1);
        }
        let name = $.FormatString(S("%s:%s:%s"), mat.Name.getData(), technique.Name.getData(), pass.Name.getData());
        let added_program = mat_manager.AddProgram(name.getData(), loader, pass.FragmentShader, pass.VertexShader, pass.GeometryShader);
        if (added_program == null) {
          if (!custom_shader && !this.Workarounds.LowMaxVertexUniformCount) {
            let buf = $.GetVertexShaderCodeForPass(pass, true);
            let hash = $.GetSHA1HexDigest(buf.getData(), buf.getLength());
            pass.VertexShader.Shader = mat_manager.AddShader(S("auto-generated vertex shader"), hash.getData(), S("glsl"), 1 /*SMMS_VERTEX*/, buf.getData(), 1);
            added_program = mat_manager.AddProgram(name.getData(), loader, pass.FragmentShader, pass.VertexShader, pass.GeometryShader);
            if (added_program != null) {
              this.Workarounds.LowMaxVertexUniformCount = true;
              $.Log(S("  gl: Enabling low max vertex uniform workaround"));
            }
          }
        }
        if (added_program == null) {
          technique.Available = false;
        } else {
          let program_instance = new $.StdMeshMaterialPass$ProgramInstance().init(added_program, pass.FragmentShader, pass.VertexShader, pass.GeometryShader);
          (pass.Program = program_instance, program_instance = null);
        }
      }
      if (technique.Available && mat.BestTechniqueIndex === -1) {
        mat.BestTechniqueIndex = i | 0;
      }
    }
    return mat.BestTechniqueIndex !== -1;
  }

  PrepareRendering(sfcToSurface) {
    if (this.pApp == null || !this.pApp.AssertMainThread()) {
      return false;
    }
    if (!this.Active) {
      return false;
    }
    if (sfcToSurface == null) {
      return false;
    }
    if (sfcToSurface.Locked !== 0) {
      return false;
    }
    if (sfcToSurface !== this.RenderTarget) {
      if (!sfcToSurface.IsRenderTarget()) {
        return false;
      }
      if (sfcToSurface.pCtx != null && sfcToSurface.pCtx !== this.pCurrCtx) {
        if (!sfcToSurface.pCtx.Select()) {
          return false;
        }
      }
      this.RenderTarget = sfcToSurface;
      this.UpdateClipper();
    }
    return true;
  }

  PrepareSpriteShader(shader, name, ssc, pGroups, additionalDefines, additionalSlices) {
    const uniformNames = new Array(24).fill(null);
    uniformNames[0 /*C4SSU_ProjectionMatrix*/] = S("projectionMatrix");
    uniformNames[1 /*C4SSU_ModelViewMatrix*/] = S("modelviewMatrix");
    uniformNames[2 /*C4SSU_NormalMatrix*/] = S("normalMatrix");
    uniformNames[3 /*C4SSU_ClrMod*/] = S("clrMod");
    uniformNames[4 /*C4SSU_Gamma*/] = S("gamma");
    uniformNames[5 /*C4SSU_Resolution*/] = S("resolution");
    uniformNames[6 /*C4SSU_BaseTex*/] = S("baseTex");
    uniformNames[7 /*C4SSU_OverlayTex*/] = S("overlayTex");
    uniformNames[8 /*C4SSU_OverlayClr*/] = S("overlayClr");
    uniformNames[9 /*C4SSU_LightTex*/] = S("lightTex");
    uniformNames[10 /*C4SSU_LightTransform*/] = S("lightTransform");
    uniformNames[11 /*C4SSU_NormalTex*/] = S("normalTex");
    uniformNames[12 /*C4SSU_AmbientTex*/] = S("ambientTex");
    uniformNames[13 /*C4SSU_AmbientTransform*/] = S("ambientTransform");
    uniformNames[14 /*C4SSU_AmbientBrightness*/] = S("ambientBrightness");
    uniformNames[15 /*C4SSU_MaterialAmbient*/] = S("materialAmbient");
    uniformNames[16 /*C4SSU_MaterialDiffuse*/] = S("materialDiffuse");
    uniformNames[17 /*C4SSU_MaterialSpecular*/] = S("materialSpecular");
    uniformNames[18 /*C4SSU_MaterialEmission*/] = S("materialEmission");
    uniformNames[19 /*C4SSU_MaterialShininess*/] = S("materialShininess");
    uniformNames[20 /*C4SSU_Bones*/] = S("bones");
    uniformNames[21 /*C4SSU_CullMode*/] = S("cullMode");
    uniformNames[22 /*C4SSU_FrameCounter*/] = S("frameCounter");
    uniformNames[23 /*C4SSU_Count*/] = null;
    const attributeNames = new Array(9).fill(null);
    attributeNames[0 /*C4SSA_Position*/] = S("oc_Position");
    attributeNames[1 /*C4SSA_Normal*/] = S("oc_Normal");
    attributeNames[2 /*C4SSA_TexCoord*/] = S("oc_TexCoord");
    attributeNames[3 /*C4SSA_Color*/] = S("oc_Color");
    attributeNames[4 /*C4SSA_BoneIndices0*/] = S("oc_BoneIndices0");
    attributeNames[5 /*C4SSA_BoneIndices1*/] = S("oc_BoneIndices1");
    attributeNames[6 /*C4SSA_BoneWeights0*/] = S("oc_BoneWeights0");
    attributeNames[7 /*C4SSA_BoneWeights1*/] = S("oc_BoneWeights1");
    attributeNames[8 /*C4SSA_Count*/] = null;
    shader.Clear();
    shader.ClearSlices();
    shader.AddDefine(S("OPENCLONK"));
    shader.AddDefine(S("OC_SPRITE"));
    if ((ssc & 1) !== 0) {
      shader.AddDefine(S("OC_CLRMOD_MOD2"));
    }
    if ((ssc & 16) !== 0) {
      shader.AddDefine(S("OC_WITH_NORMALMAP"));
    }
    if ((ssc & 8) !== 0) {
      shader.AddDefine(S("OC_DYNAMIC_LIGHT"));
    }
    if ((ssc & 2) !== 0) {
      shader.AddDefine(S("OC_HAVE_BASE"));
    }
    if ((ssc & 4) !== 0) {
      shader.AddDefine(S("OC_HAVE_OVERLAY"));
    }
    if (additionalDefines != null) {
      for (let define = additionalDefines; define.a[define.o] != null; define = define.add(1)) {
        shader.AddDefine(define.a[define.o]);
      }
    }
    shader.LoadVertexSlices(pGroups, S("SpriteVertexShader.glsl"));
    shader.LoadFragmentSlices(pGroups, S("CommonShader.glsl"));
    shader.LoadFragmentSlices(pGroups, S("ObjectShader.glsl"));
    shader.SetScriptCategories($own([StdString.of(S("Common")), StdString.of(S("Object"))]));
    if (additionalSlices != null) {
      for (let slice = additionalSlices; slice.a[slice.o] != null; slice = slice.add(1)) {
        shader.LoadFragmentSlices(pGroups, slice.a[slice.o]);
      }
    }
    if (!shader.Init(name, P(uniformNames, 0), P(attributeNames, 0))) {
      shader.ClearSlices();
      return false;
    }
    return true;
  }

  EnsureMainContextSelected() {
    return this.pMainCtx.Select();
  }

  CreateContext(pWindow, pApp) {
    if (pWindow == null) {
      return null;
    }
    let pCtx = null;
    pCtx = new CStdGLCtx().init();
    let first_ctx = this.pMainCtx == null;
    if (first_ctx) {
      this.pMainCtx = pCtx;
      $.LogF(S("  gl: Create first %scontext..."), $.Config.Graphics.DebugOpenGL !== 0 ? S("debug ") : S(""));
    }
    if (!pCtx.Init(pWindow, pApp)) {
      $.Log(S("  gl: failed to create context."));
      $delete(pCtx);
      return null;
    }
    this.has_khr_debug = gl$epoxy_has_gl_extension(S("GL_KHR_debug")) || gl$epoxy_gl_version() >= 43;
    if ($.Config.Graphics.DebugOpenGL !== 0 && (this.has_khr_debug || gl$epoxy_has_gl_extension(S("GL_ARB_debug_output")))) {
      if (first_ctx) {
        $.Log(S("  gl: Setting OpenGLDebugProc callback"));
      }
      gl$glDebugMessageCallback(OpenGLDebugProc, null);
      gl$glEnable(33346);
      if (this.has_khr_debug) {
        gl$glEnable(37600);
      }
    }
    if (first_ctx) {
      let gl_vendor = $view8(gl$glGetString(7936), true);
      let gl_renderer = $view8(gl$glGetString(7937), true);
      let gl_version = $view8(gl$glGetString(7938), true);
      $.LogF(S("GL %s on %s (%s)"), gl_version != null ? gl_version : S(""), gl_renderer != null ? gl_renderer : S(""), gl_vendor != null ? gl_vendor : S(""));
      if ($.Config.Graphics.DebugOpenGL !== 0) {
        if (gl$epoxy_is_desktop_gl() && gl$epoxy_gl_version() >= 30) {
          const gl_extension_count = [0];
          gl$glGetIntegerv(33309, P(gl_extension_count, 0));
          if (gl_extension_count[0] === 0) {
            $.LogSilentF(S("No available extensions."));
          } else {
            $.LogSilentF(S("%d available extensions:"), gl_extension_count[0]);
            for (let i = 0; i < gl_extension_count[0]; i = i + 1 | 0) {
              let gl_extension = $view8(gl$glGetStringi(7939, i >>> 0), true);
              $.LogSilentF(S("  %4d: %s"), i, gl_extension);
            }
          }
        } else {
          let gl_extensions = $view8(gl$glGetString(7939), true);
          $.LogSilentF(S("GLExt: %s"), gl_extensions != null ? gl_extensions : S(""));
        }
      }
    }
    this.RenderTarget = null;
    this.pCurrCtx = null;
    return pCtx;
  }

  SetupMultiBlt(call, pTransform, baseTex, overlayTex, normalTex, dwOverlayModClr, out_modelview) {
    let iAdditive = (this.dwBlitMode & 1) >>> 0 | 0;
    gl$glBlendFunc(770, (iAdditive !== 0 ? 1 : 771) >>> 0);
    call.Start();
    let dwModClr = this.BlitModulated ? this.BlitModulateClr : 0xffffffff;
    const fMod = new Float32Array([Math.fround(Math.fround((dwModClr >>> 16 & 255) >>> 0) / 255), Math.fround(Math.fround((dwModClr >>> 8 & 255) >>> 0) / 255), Math.fround(Math.fround((dwModClr & 255) >>> 0) / 255), Math.fround(Math.fround((dwModClr >>> 24 & 255) >>> 0) / 255)]);
    call.SetUniform4fv(3, 1, P(fMod, 0));
    call.SetUniform3fv(4, 1, P(this.gammaOut, 0));
    if (baseTex !== 0) {
      call.AllocTexUnit(6);
      gl$glBindTexture(3553, baseTex);
    }
    if (overlayTex !== 0) {
      call.AllocTexUnit(7);
      gl$glBindTexture(3553, overlayTex);
      const fOverlayModClr = new Float32Array([Math.fround(Math.fround((dwOverlayModClr >>> 16 & 255) >>> 0) / 255), Math.fround(Math.fround((dwOverlayModClr >>> 8 & 255) >>> 0) / 255), Math.fround(Math.fround((dwOverlayModClr & 255) >>> 0) / 255), Math.fround(Math.fround((dwOverlayModClr >>> 24 & 255) >>> 0) / 255)]);
      call.SetUniform4fv(8, 1, P(fOverlayModClr, 0));
    }
    if (this.pFoW != null && normalTex !== 0) {
      call.AllocTexUnit(11);
      gl$glBindTexture(3553, normalTex);
    }
    if (this.pFoW != null) {
      let OutRect = this.GetOutRect();
      let ClipRect = this.GetClipRect();
      let vpRect = this.pFoW.getViewportRegion().$clone();
      call.AllocTexUnit(9);
      gl$glBindTexture(3553, this.pFoW.getSurfaceName());
      const lightTransform = new Float32Array(6);
      this.pFoW.GetFragTransform(ClipRect, OutRect, P(lightTransform, 0));
      call.SetUniformMatrix2x3fv(10, 1, P(lightTransform, 0));
      call.AllocTexUnit(12);
      gl$glBindTexture(3553, this.pFoW.getFoW().Ambient.Tex);
      call.SetUniform1f(14, Math.fround(this.pFoW.getFoW().Ambient.GetBrightness()));
      const ambientTransform = new Float32Array(6);
      this.pFoW.getFoW().Ambient.GetFragTransform(vpRect, ClipRect, OutRect, P(ambientTransform, 0));
      call.SetUniformMatrix2x3fv(13, 1, P(ambientTransform, 0));
    }
    call.SetUniform1f(21, 0);
    let default_modelview = $.StdProjectionMatrix.Identity();
    const modelview = out_modelview != null ? out_modelview : default_modelview;
    $.Translate(modelview, this.ZoomX, this.ZoomY, 0);
    $.Scale(modelview, this.Zoom, this.Zoom, this.Zoom);
    $.Translate(modelview, -this.ZoomX, -this.ZoomY, 0);
    if (pTransform != null) {
      let sz = 1;
      if (this.pFoW != null && normalTex !== 0) {
        let sx = Math.fround(c$sqrt(Math.fround(Math.fround(pTransform.mat[0] * pTransform.mat[0]) + Math.fround(pTransform.mat[1] * pTransform.mat[1]))));
        let sy = Math.fround(c$sqrt(Math.fround(Math.fround(pTransform.mat[3] * pTransform.mat[3]) + Math.fround(pTransform.mat[4] * pTransform.mat[4]))));
        sz = Math.fround(c$sqrt(Math.fround(sx * sy)));
      }
      let transform = new $.StdProjectionMatrix();
      $wr(transform.op_call$i32$i32(0, 0), 0, pTransform.mat[0]);
      $wr(transform.op_call$i32$i32(0, 1), 0, pTransform.mat[1]);
      $wr(transform.op_call$i32$i32(0, 2), 0, 0);
      $wr(transform.op_call$i32$i32(0, 3), 0, pTransform.mat[2]);
      $wr(transform.op_call$i32$i32(1, 0), 0, pTransform.mat[3]);
      $wr(transform.op_call$i32$i32(1, 1), 0, pTransform.mat[4]);
      $wr(transform.op_call$i32$i32(1, 2), 0, 0);
      $wr(transform.op_call$i32$i32(1, 3), 0, pTransform.mat[5]);
      $wr(transform.op_call$i32$i32(2, 0), 0, 0);
      $wr(transform.op_call$i32$i32(2, 1), 0, 0);
      $wr(transform.op_call$i32$i32(2, 2), 0, sz);
      $wr(transform.op_call$i32$i32(2, 3), 0, 0);
      $wr(transform.op_call$i32$i32(3, 0), 0, pTransform.mat[6]);
      $wr(transform.op_call$i32$i32(3, 1), 0, pTransform.mat[7]);
      $wr(transform.op_call$i32$i32(3, 2), 0, 0);
      $wr(transform.op_call$i32$i32(3, 3), 0, pTransform.mat[8]);
      $.op_mulAssign$rStdProjectionMatrix$StdProjectionMatrix(modelview, transform);
    }
    call.SetUniformMatrix4x4$i32$StdProjectionMatrix(0, this.ProjectionMatrix);
    call.SetUniformMatrix4x4$i32$StdProjectionMatrix(1, modelview);
    if (this.pFoW != null && normalTex !== 0) {
      call.SetUniformMatrix3x3Transpose(2, $.StdMeshMatrix.Inverse($.StdProjectionMatrix.Upper3x4(modelview)));
    }
    this.scriptUniform.Apply(call);
  }

  PerformMesh(instance, tx, ty, twdt, thgt, dwPlayerColor, pTransform) {
    if (!('CStdGL$PerformMesh$FOV' in $)) $.CStdGL$PerformMesh$FOV = 60;
    if (!('CStdGL$PerformMesh$TAN_FOV' in $)) $.CStdGL$PerformMesh$TAN_FOV = Math.fround(c$tan(Math.fround(Math.fround($.CStdGL$PerformMesh$FOV / 2) / 180) * 3.141592653589793));
    let mesh_transform_parity = false;
    if (this.MeshTransform != null) {
      let det = this.MeshTransform.Determinant();
      if (Math.fround(c$fabs(det)) < 1e-06) {
        return;
      } else if (det < 0) {
        mesh_transform_parity = true;
      }
    }
    const mesh = instance.GetMesh();
    let parity = false;
    const box = mesh.GetBoundingBox();
    let v1 = new $.StdMeshVector();
    let v2 = new $.StdMeshVector();
    v1.x = box.x1;
    v1.y = box.y1;
    v1.z = box.z1;
    v2.x = box.x2;
    v2.y = box.y2;
    v2.z = box.z2;
    let MeshCenter = $.op_div$StdMeshVector$f32($.op_add$StdMeshVector$StdMeshVector(v1, v2), 2);
    gl$glEnable(2929);
    gl$glEnable(3042);
    let b = Math.fround(Math.fround(c$fabs(Math.fround(v2.x - v1.x))) / 2);
    let h = Math.fround(Math.fround(c$fabs(Math.fround(v2.y - v1.y))) / 2);
    let l = Math.fround(Math.fround(c$fabs(Math.fround(v2.z - v1.z))) / 2);
    let projectionMatrix = new $.StdProjectionMatrix();
    if (!this.fUsePerspective) {
      projectionMatrix.$assign(this.ProjectionMatrix);
      if (!$.ApplyZoomAndTransform(this.ZoomX, this.ZoomY, this.Zoom, pTransform, projectionMatrix)) {
        parity = !parity;
      }
      let rx = Math.fround(-$min(v1.x, v2.x) / Math.fround(c$fabs(Math.fround(v2.x - v1.x))));
      let ry = Math.fround(-$min(v1.y, v2.y) / Math.fround(c$fabs(Math.fround(v2.y - v1.y))));
      let dx = Math.fround(tx + Math.fround(rx * twdt));
      let dy = Math.fround(ty + Math.fround(ry * thgt));
      let scz = Math.fround(1 / mesh.GetBoundingRadius());
      $.Translate(projectionMatrix, dx, dy, 0);
      $.Scale(projectionMatrix, 1, 1, scz);
    } else {
      let clipRect = this.GetClipRect();
      projectionMatrix.$assign($.StdProjectionMatrix.Identity());
      $.Translate(projectionMatrix, -1, 1, 0);
      $.Scale(projectionMatrix, Math.fround(2 / Math.fround(clipRect.Wdt)), Math.fround(-2 / Math.fround(clipRect.Hgt)), 1);
      $.Translate(projectionMatrix, Math.fround(-clipRect.x | 0), Math.fround(-clipRect.y | 0), 0);
      if (!$.ApplyZoomAndTransform(this.ZoomX, this.ZoomY, this.Zoom, pTransform, projectionMatrix)) {
        parity = !parity;
      }
      let ttx = tx;
      let tty = ty;
      let ttwdt = twdt;
      let tthgt = thgt;
      if (twdt > thgt) {
        tty = Math.fround(tty + Math.fround(thgt - twdt) / 2);
        tthgt = twdt;
      } else {
        ttx = Math.fround(ttx + Math.fround(twdt - thgt) / 2);
        ttwdt = thgt;
      }
      $.Translate(projectionMatrix, ttx, tty, 0);
      $.Scale(projectionMatrix, Math.fround(ttwdt / Math.fround(clipRect.Wdt)), Math.fround(tthgt / Math.fround(clipRect.Hgt)), 1);
      $.Scale(projectionMatrix, Math.fround(clipRect.Wdt / 2), Math.fround((-clipRect.Hgt | 0) / 2), 1);
      $.Translate(projectionMatrix, 1, -1, 0);
      let ta = Math.fround(twdt / thgt);
      let ma = Math.fround(b / h);
      if (ta <= Math.fround(1) && Math.fround(ta / ma) <= Math.fround(1)) {
        $.Scale(projectionMatrix, $max(ta, Math.fround(ta / ma)), $max(ta, Math.fround(ta / ma)), 1);
      } else if (ta >= Math.fround(1) && Math.fround(ta / ma) >= Math.fround(1)) {
        $.Scale(projectionMatrix, $max(Math.fround(1 / ta), Math.fround(ma / ta)), $max(Math.fround(1 / ta), Math.fround(ma / ta)), 1);
      }
      $.Perspective(projectionMatrix, Math.fround(1 / $.CStdGL$PerformMesh$TAN_FOV), 1, Math.fround(0.100000001), 100);
    }
    let modelviewMatrix = new $.StdMeshMatrix();
    if (this.fUsePerspective) {
      let EyeR = Math.fround(l + $max(Math.fround(b / $.CStdGL$PerformMesh$TAN_FOV), Math.fround(h / $.CStdGL$PerformMesh$TAN_FOV)));
      let Eye = $.StdMeshVector.Translate(MeshCenter.x, MeshCenter.y, Math.fround(MeshCenter.z + EyeR));
      let Up = $.StdMeshVector.Translate(0, -1, 0);
      modelviewMatrix.$assign($.StdMeshMatrix.Scale(-1, 1, 1));
      $.op_mulAssign$rStdMeshMatrix$StdMeshMatrix(modelviewMatrix, $.StdMeshMatrix.LookAt(Eye, MeshCenter, Up));
    } else {
      modelviewMatrix.$assign($.StdMeshMatrix.Identity());
    }
    if (this.MeshTransform != null) {
      $.op_mulAssign$rStdMeshMatrix$StdMeshMatrix(modelviewMatrix, this.MeshTransform);
      if (mesh_transform_parity) {
        parity = !parity;
      }
    }
    let dwModClr = this.BlitModulated ? this.BlitModulateClr : 0xffffffff;
    let clipRect = this.GetClipRect();
    let outRect = this.GetOutRect();
    $.RenderMeshImpl(projectionMatrix, modelviewMatrix, instance, dwModClr, this.dwBlitMode, dwPlayerColor, this.pFoW, clipRect, outRect, parity);
    gl$glDepthMask(1);
    gl$glDisable(2929);
    gl$glDisable(2884);
    gl$glDisable(32926);
    gl$glClear(256);
  }

  FillBG(dwClr = 0) {
    if (this.pCurrCtx == null) {
      return;
    }
    gl$glClearColor(Math.fround(Math.fround(dwClr >>> 16 & 0xff) / 255), Math.fround(Math.fround((dwClr & 0xffff) >> 8 & 0xff) / 255), Math.fround(Math.fround(dwClr & 0xff) / 255), 0);
    gl$glClear(16640);
  }

  PerformMultiPix(sfcTarget, vertices, n_vertices, shader_call) {
    let transform = $.StdProjectionMatrix.Translate(0.5, 0.5, 0);
    let BATCH_SIZE = 256;
    if (shader_call == null) {
      let call = new $.C4ShaderCall().init(this.GetSpriteShader$b$b$b(false, false, false));
      try {
        this.SetupMultiBlt(call, null, 0, 0, 0, 0, transform);
        for (let i = 0; i < n_vertices; i = i + 256 >>> 0) {
          this.PerformMultiBlt(sfcTarget, 0 /*OP_POINTS*/, $oadd(vertices, i), $min(n_vertices - i >>> 0, BATCH_SIZE), false, call);
        }
      } finally { call && call.$dtor(); }
    } else {
      this.SetupMultiBlt(shader_call, null, 0, 0, 0, 0, transform);
      for (let i = 0; i < n_vertices; i = i + 256 >>> 0) {
        this.PerformMultiBlt(sfcTarget, 0 /*OP_POINTS*/, $oadd(vertices, i), $min(n_vertices - i >>> 0, BATCH_SIZE), false, shader_call);
      }
    }
  }

  PerformMultiLines(sfcTarget, vertices, n_vertices, width, shader_call) {
    let tri_vertices = $oat($oarr(Math.imul(n_vertices, 3) >>> 0, () => new $.C4BltVertex()), 0);
    for (let i = 0; i < n_vertices; i = i + 2 >>> 0) {
      let x1 = $oidx(vertices, i).ftx;
      let y1 = $oidx(vertices, i).fty;
      let x2 = $oidx(vertices, i + 1 >>> 0).ftx;
      let y2 = $oidx(vertices, i + 1 >>> 0).fty;
      let offx = Math.fround(y1 - y2);
      let offy = Math.fround(x2 - x1);
      let l = c$sqrtf(Math.fround(Math.fround(offx * offx) + Math.fround(offy * offy)));
      l = Math.fround(l + Math.fround(4.99999997e-09));
      offx = Math.fround(offx * Math.fround(width / l));
      offy = Math.fround(offy * Math.fround(width / l));
      $oidx(tri_vertices, (Math.imul(3, i) >>> 0) + 0 >>> 0).ftx = Math.fround(x1 + offx);
      $oidx(tri_vertices, (Math.imul(3, i) >>> 0) + 0 >>> 0).fty = Math.fround(y1 + offy);
      $oidx(tri_vertices, (Math.imul(3, i) >>> 0) + 1 >>> 0).ftx = Math.fround(x1 - offx);
      $oidx(tri_vertices, (Math.imul(3, i) >>> 0) + 1 >>> 0).fty = Math.fround(y1 - offy);
      $oidx(tri_vertices, (Math.imul(3, i) >>> 0) + 2 >>> 0).ftx = Math.fround(x2 - offx);
      $oidx(tri_vertices, (Math.imul(3, i) >>> 0) + 2 >>> 0).fty = Math.fround(y2 - offy);
      $oidx(tri_vertices, (Math.imul(3, i) >>> 0) + 3 >>> 0).ftx = Math.fround(x2 + offx);
      $oidx(tri_vertices, (Math.imul(3, i) >>> 0) + 3 >>> 0).fty = Math.fround(y2 + offy);
      for (let j = 0; j < 4; j = j + 1 | 0) {
        $oidx(tri_vertices, (Math.imul(3, i) >>> 0) + 0 >>> 0).color[j] = $oidx(vertices, i).color[j];
        $oidx(tri_vertices, (Math.imul(3, i) >>> 0) + 1 >>> 0).color[j] = $oidx(vertices, i).color[j];
        $oidx(tri_vertices, (Math.imul(3, i) >>> 0) + 2 >>> 0).color[j] = $oidx(vertices, i + 1 >>> 0).color[j];
        $oidx(tri_vertices, (Math.imul(3, i) >>> 0) + 3 >>> 0).color[j] = $oidx(vertices, i + 1 >>> 0).color[j];
      }
      $oidx(tri_vertices, (Math.imul(3, i) >>> 0) + 0 >>> 0).tx = 0;
      $oidx(tri_vertices, (Math.imul(3, i) >>> 0) + 0 >>> 0).ty = 0;
      $oidx(tri_vertices, (Math.imul(3, i) >>> 0) + 1 >>> 0).tx = 0;
      $oidx(tri_vertices, (Math.imul(3, i) >>> 0) + 1 >>> 0).ty = 2;
      $oidx(tri_vertices, (Math.imul(3, i) >>> 0) + 2 >>> 0).tx = 1;
      $oidx(tri_vertices, (Math.imul(3, i) >>> 0) + 2 >>> 0).ty = 2;
      $oidx(tri_vertices, (Math.imul(3, i) >>> 0) + 3 >>> 0).tx = 1;
      $oidx(tri_vertices, (Math.imul(3, i) >>> 0) + 3 >>> 0).ty = 0;
      $oidx(tri_vertices, (Math.imul(3, i) >>> 0) + 4 >>> 0).$assign($oidx(tri_vertices, (Math.imul(3, i) >>> 0) + 2 >>> 0));
      $oidx(tri_vertices, (Math.imul(3, i) >>> 0) + 5 >>> 0).$assign($oidx(tri_vertices, (Math.imul(3, i) >>> 0) + 0 >>> 0));
    }
    if (shader_call == null) {
      let call = new $.C4ShaderCall().init(this.GetSpriteShader$b$b$b(true, false, false));
      try {
        this.SetupMultiBlt(call, null, this.lines_tex, 0, 0, 0, null);
        this.PerformMultiBlt(sfcTarget, 1 /*OP_TRIANGLES*/, tri_vertices, Math.imul(n_vertices, 3) >>> 0, true, call);
      } finally { call && call.$dtor(); }
    } else {
      this.SetupMultiBlt(shader_call, null, this.lines_tex, 0, 0, 0, null);
      this.PerformMultiBlt(sfcTarget, 1 /*OP_TRIANGLES*/, tri_vertices, Math.imul(n_vertices, 3) >>> 0, true, shader_call);
    }
    $delete(tri_vertices);
  }

  PerformMultiTris(sfcTarget, vertices, n_vertices, pTransform, pTex, pOverlay, pNormal, dwOverlayModClr, shader_call) {
    if (shader_call == null) {
      let call = new $.C4ShaderCall().init(this.GetSpriteShader$b$b$b(pTex != null, pOverlay != null, pNormal != null));
      try {
        this.SetupMultiBlt(call, pTransform, pTex != null ? pTex.texName : 0, pOverlay != null ? pOverlay.texName : 0, pNormal != null ? pNormal.texName : 0, dwOverlayModClr, null);
        this.PerformMultiBlt(sfcTarget, 1 /*OP_TRIANGLES*/, vertices, n_vertices, pTex != null, call);
      } finally { call && call.$dtor(); }
    } else {
      this.SetupMultiBlt(shader_call, pTransform, pTex != null ? pTex.texName : 0, pOverlay != null ? pOverlay.texName : 0, pNormal != null ? pNormal.texName : 0, dwOverlayModClr, null);
      this.PerformMultiBlt(sfcTarget, 1 /*OP_TRIANGLES*/, vertices, n_vertices, pTex != null, shader_call);
    }
  }

  PerformMultiBlt(sfcTarget, op, vertices, n_vertices, has_tex, shader_call) {
    0;
    if (!this.PrepareRendering(sfcTarget)) {
      return;
    }
    shader_call.SetUniform2f(5, Math.fround(sfcTarget.Wdt), Math.fround(sfcTarget.Hgt));
    let vbo_index = this.CurrentVBO;
    this.CurrentVBO = (this.CurrentVBO + 1 >>> 0) % 16;
    gl$glBindBuffer(34962, this.GenericVBOs[vbo_index]);
    if (this.GenericVBOSizes[vbo_index] < n_vertices) {
      this.GenericVBOSizes[vbo_index] = n_vertices;
      gl$glBufferData(34962, $i64n(n_vertices * 24), $bytesView(vertices, [["tx", 0, "f32", 0], ["ty", 4, "f32", 0], ["color", 8, "u8", 4], ["ftx", 12, "f32", 0], ["fty", 16, "f32", 0], ["ftz", 20, "f32", 0]], 24), 35040);
    } else {
      gl$glBufferSubData(34962, 0, $i64n(n_vertices * 24), $bytesView(vertices, [["tx", 0, "f32", 0], ["ty", 4, "f32", 0], ["color", 8, "u8", 4], ["ftx", 12, "f32", 0], ["fty", 16, "f32", 0], ["ftz", 20, "f32", 0]], 24));
    }
    const vao = [0];
    let vao_index = vbo_index + (has_tex ? 16 : 0) >>> 0;
    let vao_id = this.GenericVAOs[vao_index];
    let has_vao = this.GetVAO(vao_id, P(vao, 0));
    gl$glBindVertexArray(vao[0]);
    if (!has_vao) {
      let position = shader_call.GetAttribute(0) >>> 0;
      let color = shader_call.GetAttribute(3) >>> 0;
      let texcoord = (has_tex ? shader_call.GetAttribute(2) : 0) >>> 0;
      gl$glEnableVertexAttribArray(position);
      gl$glEnableVertexAttribArray(color);
      if (has_tex) {
        gl$glEnableVertexAttribArray(texcoord);
      }
      gl$glVertexAttribPointer(position, 2, 5126, 0, 24, P(null, 12));
      gl$glVertexAttribPointer(color, 4, 5121, 1, 24, P(null, 8));
      if (has_tex) {
        gl$glVertexAttribPointer(texcoord, 2, 5126, 0, 24, null);
      }
    }
    switch (op) {
      case 0:
        gl$glDrawArrays(0, 0, n_vertices | 0);
        break;
      case 1:
        gl$glDrawArrays(4, 0, n_vertices | 0);
        break;
      default:
        0;
        break;
    }
    gl$glBindVertexArray(0);
    gl$glBindBuffer(34962, 0);
  }

  RestoreDeviceObjects() {
    0;
    this.InvalidateDeviceObjects();
    this.Active = this.pMainCtx.Select();
    this.RenderTarget = this.pApp.pWindow.pSurface;
    gl$glPixelStorei(3317, 1);
    gl$glGenTextures(1, P(this, "lines_tex"));
    gl$glBindTexture(3553, this.lines_tex);
    gl$glTexParameteri(3553, 10242, 33648);
    gl$glTexParameteri(3553, 10243, 33648);
    gl$glTexParameteri(3553, 10240, 9729);
    gl$glTexParameteri(3553, 10241, 9729);
    if (!('CStdGL$RestoreDeviceObjects$linedata' in $)) $.CStdGL$RestoreDeviceObjects$linedata = SB([255, 255, 255, 0, 255, 255, 255, 255]);
    gl$glTexImage2D(3553, 0, 6408, 1, 2, 0, 32993, 33639, $.CStdGL$RestoreDeviceObjects$linedata);
    this.MaxTexSize = 64;
    const s = [0];
    gl$glGetIntegerv(3379, P(s, 0));
    if (s[0] > 0) {
      this.MaxTexSize = s[0];
    }
    gl$glGenBuffers(16, P(this.GenericVBOs, 0));
    for (let i = 0; i < 16; i = i + 1 >>> 0) {
      this.GenericVBOSizes[i] = 192;
      gl$glBindBuffer(34962, this.GenericVBOs[i]);
      gl$glBufferData(34962, $i64n(this.GenericVBOSizes[i] * 24), null, 35040);
      this.GenericVAOs[i] = this.GenVAOID();
      this.GenericVAOs[i + 16 >>> 0] = this.GenVAOID();
    }
    gl$glBindBuffer(34962, 0);
    this.dwBlitMode = 0;
    return this.Active;
  }

  InvalidateDeviceObjects() {
    let fSuccess = true;
    this.Active = false;
    if (this.lines_tex !== 0) {
      gl$glDeleteTextures(1, P(this, "lines_tex"));
      this.lines_tex = 0;
    }
    if (this.GenericVBOs[0] !== 0) {
      gl$glDeleteBuffers(16, P(this.GenericVBOs, 0));
      this.GenericVBOs[0] = 0;
      this.CurrentVBO = 0;
      for (const GenericVAO of this.GenericVAOs) {
        this.FreeVAOID(GenericVAO);
      }
    }
    return fSuccess;
  }

  DeviceReady() {
    return !(this.pMainCtx == null);
  }

  InitShaders(pGroups) {
    if (this.pCurrCtx == null) {
      this.EnsureMainContextSelected();
    }
    if (!this.PrepareSpriteShader(this.SpriteShader, S("sprite"), 0, pGroups, null, null)) {
      return false;
    }
    if (!this.PrepareSpriteShader(this.SpriteShaderMod2, S("spriteMod2"), 1, pGroups, null, null)) {
      return false;
    }
    if (!this.PrepareSpriteShader(this.SpriteShaderBase, S("spriteBase"), 2, pGroups, null, null)) {
      return false;
    }
    if (!this.PrepareSpriteShader(this.SpriteShaderBaseMod2, S("spriteBaseMod2"), 3, pGroups, null, null)) {
      return false;
    }
    if (!this.PrepareSpriteShader(this.SpriteShaderBaseOverlay, S("spriteBaseOverlay"), 6, pGroups, null, null)) {
      return false;
    }
    if (!this.PrepareSpriteShader(this.SpriteShaderBaseOverlayMod2, S("spriteBaseOverlayMod2"), 7, pGroups, null, null)) {
      return false;
    }
    if (!this.PrepareSpriteShader(this.SpriteShaderLight, S("spriteLight"), 8, pGroups, null, null)) {
      return false;
    }
    if (!this.PrepareSpriteShader(this.SpriteShaderLightMod2, S("spriteLightMod2"), 9, pGroups, null, null)) {
      return false;
    }
    if (!this.PrepareSpriteShader(this.SpriteShaderLightBase, S("spriteLightBase"), 10, pGroups, null, null)) {
      return false;
    }
    if (!this.PrepareSpriteShader(this.SpriteShaderLightBaseMod2, S("spriteLightBaseMod2"), 11, pGroups, null, null)) {
      return false;
    }
    if (!this.PrepareSpriteShader(this.SpriteShaderLightBaseOverlay, S("spriteLightBaseOverlay"), 14, pGroups, null, null)) {
      return false;
    }
    if (!this.PrepareSpriteShader(this.SpriteShaderLightBaseOverlayMod2, S("spriteLightBaseOverlayMod2"), 15, pGroups, null, null)) {
      return false;
    }
    if (!this.PrepareSpriteShader(this.SpriteShaderLightBaseNormal, S("spriteLightBaseNormal"), 26, pGroups, null, null)) {
      return false;
    }
    if (!this.PrepareSpriteShader(this.SpriteShaderLightBaseNormalMod2, S("spriteLightBaseNormalMod2"), 27, pGroups, null, null)) {
      return false;
    }
    if (!this.PrepareSpriteShader(this.SpriteShaderLightBaseNormalOverlay, S("spriteLightBaseNormalOverlay"), 30, pGroups, null, null)) {
      return false;
    }
    if (!this.PrepareSpriteShader(this.SpriteShaderLightBaseNormalOverlayMod2, S("spriteLightBaseNormalOverlayMod2"), 31, pGroups, null, null)) {
      return false;
    }
    return true;
  }

  GetSpriteShader$i32(ssc) {
    const shaders = [
  this.SpriteShader,
  this.SpriteShaderMod2,
  this.SpriteShaderBase,
  this.SpriteShaderBaseMod2,
  this.SpriteShaderBaseOverlay,
  this.SpriteShaderBaseOverlayMod2,
  this.SpriteShaderLight,
  this.SpriteShaderLightMod2,
  this.SpriteShaderLightBase,
  this.SpriteShaderLightBaseMod2,
  this.SpriteShaderLightBaseOverlay,
  this.SpriteShaderLightBaseOverlayMod2,
  this.SpriteShaderLightBaseNormal,
  this.SpriteShaderLightBaseNormalMod2,
  this.SpriteShaderLightBaseNormalOverlay,
  this.SpriteShaderLightBaseNormalOverlayMod2,
];
    let index = 0;
    if ((ssc & 8) !== 0) {
      index = index + 6 | 0;
    }
    if ((ssc & 2) !== 0) {
      index = index + 2 | 0;
      if ((ssc & 4) !== 0) {
        index = index + 2 | 0;
      }
      if ((ssc & 16) !== 0 && (ssc & 8) !== 0) {
        index = index + 4 | 0;
      }
    }
    if ((ssc & 1) !== 0) {
      index = index + 1 | 0;
    }
    0;
    return shaders[index];
  }

  GetSpriteShader$b$b$b(haveBase, haveOverlay, haveNormal) {
    let ssc = 0;
    if ((this.dwBlitMode & 2) >>> 0 !== 0) {
      ssc |= 1;
    }
    if (haveBase) {
      ssc |= 2;
    }
    if (haveBase && haveOverlay) {
      ssc |= 4;
    }
    if (this.pFoW != null) {
      ssc |= 8;
    }
    if (this.pFoW != null && haveBase && haveNormal) {
      ssc |= 16;
    }
    return this.GetSpriteShader$i32(ssc);
  }

  ObjectLabel(identifier, name, length, label) {
    if (this.has_khr_debug) {
      gl$glObjectLabel(identifier, name, length, label);
    }
  }

  CheckGLError(szAtOp) {
    let err = gl$glGetError();
    if (err === 0) {
      return true;
    }
    $.LogF(S("GL error with %s: %d - %s"), szAtOp, err, this.GLErrorString(err));
    return false;
  }

  GLErrorString(code) {
    switch (code) {
      case 0:
        return S("No error");
      case 1280:
        return S("An unacceptable value is specified for an enumerated argument");
      case 1281:
        return S("A numeric argument is out of range");
      case 1282:
        return S("The specified operation is not allowed in the current state");
      case 1286:
        return S("The framebuffer object is not complete");
      case 1285:
        return S("There is not enough memory left to execute the command");
      case 1284:
        return S("An attempt has been made to perform an operation that would cause an internal stack to underflow");
      case 1283:
        return S("An attempt has been made to perform an operation that would cause an internal stack to overflow");
      default:
        0;
        return S("");
    }
  }

  Error_(szMsg) {
    let r = $.C4Draw.prototype.Error_.call(this, szMsg);
    $.LogF(S("  gl: %s"), gl$glGetString(7936));
    $.LogF(S("  gl: %s"), gl$glGetString(7937));
    $.LogF(S("  gl: %s"), gl$glGetString(7938));
    $.LogF(S("  gl: %s"), gl$glGetString(7939));
    return r;
  }

  $clone() { return new CStdGL().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.iPixelFormat = o.iPixelFormat;
    this.sfcFmt = o.sfcFmt;
    this.pMainCtx = o.pMainCtx;
    this.pCurrCtx = o.pCurrCtx;
    this.lines_tex = o.lines_tex;
    this.ProjectionMatrix.$assign(o.ProjectionMatrix);
    this.SpriteShader.$assign(o.SpriteShader);
    this.SpriteShaderMod2.$assign(o.SpriteShaderMod2);
    this.SpriteShaderBase.$assign(o.SpriteShaderBase);
    this.SpriteShaderBaseMod2.$assign(o.SpriteShaderBaseMod2);
    this.SpriteShaderBaseOverlay.$assign(o.SpriteShaderBaseOverlay);
    this.SpriteShaderBaseOverlayMod2.$assign(o.SpriteShaderBaseOverlayMod2);
    this.SpriteShaderLight.$assign(o.SpriteShaderLight);
    this.SpriteShaderLightMod2.$assign(o.SpriteShaderLightMod2);
    this.SpriteShaderLightBase.$assign(o.SpriteShaderLightBase);
    this.SpriteShaderLightBaseMod2.$assign(o.SpriteShaderLightBaseMod2);
    this.SpriteShaderLightBaseOverlay.$assign(o.SpriteShaderLightBaseOverlay);
    this.SpriteShaderLightBaseOverlayMod2.$assign(o.SpriteShaderLightBaseOverlayMod2);
    this.SpriteShaderLightBaseNormal.$assign(o.SpriteShaderLightBaseNormal);
    this.SpriteShaderLightBaseNormalMod2.$assign(o.SpriteShaderLightBaseNormalMod2);
    this.SpriteShaderLightBaseNormalOverlay.$assign(o.SpriteShaderLightBaseNormalOverlay);
    this.SpriteShaderLightBaseNormalOverlayMod2.$assign(o.SpriteShaderLightBaseNormalOverlayMod2);
    this.GenericVBOs = o.GenericVBOs.slice();
    this.GenericVBOSizes = o.GenericVBOSizes.slice();
    this.CurrentVBO = o.CurrentVBO;
    this.GenericVAOs = o.GenericVAOs.slice();
    this.VAOIDs = o.VAOIDs.$clone();
    this.NextVAOID = o.NextVAOID.$clone();
    this.has_khr_debug = o.has_khr_debug;
    this.Workarounds.$assign(o.Workarounds);
    return this;
  }
}

export function MsgSourceToStr(source) {
  switch (source) {
    case 33350:
      return S("API");
    case 33351:
      return S("window system");
    case 33352:
      return S("shader compiler");
    case 33353:
      return S("third party");
    case 33354:
      return S("application");
    case 33355:
      return S("other");
    default:
      return S("<unknown>");
  }
}

export function MsgTypeToStr(type) {
  switch (type) {
    case 33356:
      return S("error");
    case 33357:
      return S("deprecation warning");
    case 33358:
      return S("undefined behavior warning");
    case 33359:
      return S("portability warning");
    case 33360:
      return S("performance warning");
    case 33361:
      return S("other message");
    default:
      return S("unknown message");
  }
}

export function MsgSeverityToStr(severity) {
  switch (severity) {
    case 37190:
      return S("high");
    case 37191:
      return S("medium");
    case 37192:
      return S("low");
    case 33387:
      return S("notification");
    default:
      return S("<unknown>");
  }
}

export function OpenGLDebugProc(source, type, _id, severity, _length, message, _userParam) {
  let msg_source = MsgSourceToStr(source);
  let msg_type = MsgTypeToStr(type);
  let msg_severity = MsgSeverityToStr(severity);
  $.LogSilentF(S("  gl: %s severity %s %s: %s"), msg_severity, msg_source, msg_type, message);
}


export function $init(): void {
  CStdGL.N_GENERIC_VBOS = 16;
  CStdGL.GENERIC_VBO_SIZE = 192;
  CStdGLCtx.contexts = [];
  $.pGL = null;
}

Object.assign($, { C4DrawGLError, CStdGL, CStdGL$$anon1, CStdGLCtx, MsgSeverityToStr, MsgSourceToStr, MsgTypeToStr, OpenGLDebugProc });
