// @ts-nocheck
// OpenClonk 36de799: src/graphics/C4DrawMeshGL.cpp, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { gl$glBindBuffer, gl$glBindTexture, gl$glBindVertexArray, gl$glBlendFunc, gl$glCullFace, gl$glDeleteBuffers, gl$glDepthMask, gl$glDisable, gl$glDrawElementsBaseVertex, gl$glEnable, gl$glEnableVertexAttribArray, gl$glFrontFace, gl$glGenBuffers, gl$glPolygonMode, gl$glUniformMatrix3x4fv, gl$glUniformMatrix4x3fv, gl$glVertexAttribPointer } from '../../rt/gl.ts';
import { $u64n } from '../../rt/int.ts';
import { c$fabs, c$setlocale } from '../../rt/libc.ts';
import { $oarr, $own, $padd, $rd, $rowp, $wr, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $dyncast, $missing, $reserve, $throw, $vpush, StdException, StdString } from '../../rt/std.ts';

export class ScopedLocale$1 {
  saved_loc = new StdString();

  init(locale) {
    this.saved_loc = new StdString();
    let old_loc = c$setlocale(1, locale);
    if (old_loc == null) {
      $throw(new StdException(S("Argument to setlocale was invalid"), "invalid_argument"));
    }
    this.saved_loc.assign(old_loc);
    return this;
  }

  $dtor() {
    c$setlocale(1, this.saved_loc.c_str());
  }

  $clone() { return new ScopedLocale$1().$assign(this); }
  $assign(o) {
    this.saved_loc = o.saved_loc.$clone();
    return this;
  }
}

export class BoneTransform {
  m = $oarr(3, () => new Float32Array(4));

  $clone() { return new BoneTransform().$assign(this); }
  $assign(o) {
    this.m = $own(o.m.map(($e0) => $e0.slice()));
    return this;
  }
}

export class PretransformedMeshVertex {
  static $layout = [["nx", 0, "f32", 0], ["ny", 4, "f32", 0], ["nz", 8, "f32", 0], ["x", 12, "f32", 0], ["y", 16, "f32", 0], ["z", 20, "f32", 0]];
  static $size = 24;
  nx = 0;
  ny = 0;
  nz = 0;
  x = 0;
  y = 0;
  z = 0;

  $clone() { return new PretransformedMeshVertex().$assign(this); }
  $assign(o) {
    this.nx = o.nx;
    this.ny = o.ny;
    this.nz = o.nz;
    this.x = o.x;
    this.y = o.y;
    this.z = o.z;
    return this;
  }
}

export function Texture2DToCode(index, hasTextureAnimation) {
  if (hasTextureAnimation) {
    return $.FormatString(S("texture(oc_Texture%d, (oc_TextureMatrix%d * vec4(texcoord, 0.0, 1.0)).xy)"), index, index);
  }
  return $.FormatString(S("texture(oc_Texture%d, texcoord)"), index);
}

export function TextureUnitSourceToCode(index, source, manualColor, manualAlpha, hasTextureAnimation) {
  switch (source) {
    case 0:
      return new $.StdStrBuf().init$pi8$b(S("currentColor"));
    case 1:
      return Texture2DToCode(index, hasTextureAnimation);
    case 2:
      return new $.StdStrBuf().init$pi8$b(S("diffuse"));
    case 3:
      return new $.StdStrBuf().init$pi8$b(S("diffuse"));
    case 4:
      return new $.StdStrBuf().init$pi8$b(S("vec4(oc_PlayerColor, 1.0)"));
    case 5:
      return $.FormatString(S("vec4(%f, %f, %f, %f)"), manualColor.a[manualColor.o + 0], manualColor.a[manualColor.o + 1], manualColor.a[manualColor.o + 2], manualAlpha);
    default:
      0;
      return new $.StdStrBuf().init$pi8$b(S("vec4(0.0, 0.0, 0.0, 0.0)"));
  }
}

export function TextureUnitBlendToCode(index, blend_type, source1, source2, manualFactor, hasTextureAnimation) {
  switch (blend_type) {
    case 0:
      return new $.StdStrBuf().init$pi8$b(source1);
    case 1:
      return new $.StdStrBuf().init$pi8$b(source2);
    case 2:
      return $.FormatString(S("%s * %s"), source1, source2);
    case 3:
      return $.FormatString(S("2.0 * %s * %s"), source1, source2);
    case 4:
      return $.FormatString(S("4.0 * %s * %s"), source1, source2);
    case 5:
      return $.FormatString(S("%s + %s"), source1, source2);
    case 6:
      return $.FormatString(S("%s + %s - 0.5"), source1, source2);
    case 7:
      return $.FormatString(S("%s + %s - %s*%s"), source1, source2, source1, source2);
    case 8:
      return $.FormatString(S("%s - %s"), source1, source2);
    case 9:
      return $.FormatString(S("diffuse.a * %s + (1.0 - diffuse.a) * %s"), source1, source2);
    case 10:
      return $.FormatString(S("%s.a * %s + (1.0 - %s.a) * %s"), Texture2DToCode(index, hasTextureAnimation).getData(), source1, Texture2DToCode(index, hasTextureAnimation).getData(), source2);
    case 11:
      return $.FormatString(S("currentColor.a * %s + (1.0 - currentColor.a) * %s"), source1, source2);
    case 12:
      return $.FormatString(S("%f * %s + (1.0 - %f) * %s"), manualFactor, source1, manualFactor, source2);
    case 13:
      return $.FormatString(S("vec3(4.0 * dot(%s - 0.5, %s - 0.5), 4.0 * dot(%s - 0.5, %s - 0.5), 4.0 * dot(%s - 0.5, %s - 0.5))"), source1, source2, source1, source2, source1, source2);
    case 14:
      return $.FormatString(S("diffuse.rgb * %s + (1.0 - diffuse.rgb) * %s"), source1, source2);
    default:
      0;
      return new $.StdStrBuf().init$pi8$b(source1);
  }
}

export function TextureUnitToCode(index, texunit) {
  let scoped_c_locale = new ScopedLocale$1().init(S("C"));
  let hasTextureAnimation = texunit.HasTexCoordAnimation();
  let color_source1 = $.FormatString(S("%s.rgb"), TextureUnitSourceToCode(index, texunit.ColorOpSources[0], P(texunit.ColorOpManualColor1, 0), texunit.AlphaOpManualAlpha1, hasTextureAnimation).getData());
  let color_source2 = $.FormatString(S("%s.rgb"), TextureUnitSourceToCode(index, texunit.ColorOpSources[1], P(texunit.ColorOpManualColor2, 0), texunit.AlphaOpManualAlpha2, hasTextureAnimation).getData());
  let alpha_source1 = $.FormatString(S("%s.a"), TextureUnitSourceToCode(index, texunit.AlphaOpSources[0], P(texunit.ColorOpManualColor1, 0), texunit.AlphaOpManualAlpha1, hasTextureAnimation).getData());
  let alpha_source2 = $.FormatString(S("%s.a"), TextureUnitSourceToCode(index, texunit.AlphaOpSources[1], P(texunit.ColorOpManualColor2, 0), texunit.AlphaOpManualAlpha2, hasTextureAnimation).getData());
  return $.FormatString(S("currentColor = vec4(%s, %s);\n"), TextureUnitBlendToCode(index, texunit.ColorOpEx, color_source1.getData(), color_source2.getData(), texunit.ColorOpManualFactor, hasTextureAnimation).getData(), TextureUnitBlendToCode(index, texunit.AlphaOpEx, alpha_source1.getData(), alpha_source2.getData(), texunit.AlphaOpManualFactor, hasTextureAnimation).getData());
}

export function AlphaTestToCode(pass) {
  let scoped_c_locale = new ScopedLocale$1().init(S("C"));
  switch (pass.AlphaRejectionFunction) {
    case 1:
      return new $.StdStrBuf().init$pi8$b(S(""));
    case 0:
      return new $.StdStrBuf().init$pi8$b(S("discard;"));
    case 2:
      return $.FormatString(S("if (!(fragColor.a < %f)) discard;"), pass.AlphaRejectionValue);
    case 3:
      return $.FormatString(S("if (!(fragColor.a <= %f)) discard;"), pass.AlphaRejectionValue);
    case 4:
      return $.FormatString(S("if (!(fragColor.a == %f)) discard;"), pass.AlphaRejectionValue);
    case 5:
      return $.FormatString(S("if (!(fragColor.a != %f)) discard;"), pass.AlphaRejectionValue);
    case 7:
      return $.FormatString(S("if (!(fragColor.a > %f)) discard;"), pass.AlphaRejectionValue);
    case 6:
      return $.FormatString(S("if (!(fragColor.a >= %f)) discard;"), pass.AlphaRejectionValue);
    default:
      0;
      return new $.StdStrBuf();
  }
}

export function OgreBlendTypeToGL(blend) {
  switch (blend) {
    case 0:
      return 1;
    case 1:
      return 0;
    case 2:
      return 774;
    case 3:
      return 768;
    case 4:
      return 775;
    case 5:
      return 769;
    case 6:
      return 772;
    case 7:
      return 770;
    case 8:
      return 773;
    case 9:
      return 771;
    default:
      0;
      return 0;
  }
}

export function GetVertexShaderCodeForPass(_pass, LowMaxVertexUniformCount) {
  let buf = new $.StdStrBuf();
  if (!$.GraphicsResource.Files.LoadEntryString$pi8$pStdStrBuf(S("MeshVertexShader.glsl"), buf)) {
    buf.Copy$pi8(S("attribute vec3 oc_Position;\nattribute vec3 oc_Normal;\nattribute vec2 oc_TexCoord;\nvarying vec3 vtxNormal;\nvarying vec2 texcoord;\nuniform mat4 projectionMatrix;\nuniform mat4 modelviewMatrix;\nuniform mat3 normalMatrix;\n\nslice(position)\n{\n  gl_Position = projectionMatrix * modelviewMatrix * vec4(oc_Position, 1.0);\n}\n\nslice(texcoord)\n{\n  texcoord = oc_TexCoord;\n}\n\nslice(normal)\n{\n  vtxNormal = normalize(normalMatrix * oc_Normal);\n}\n"));
  }
  if ($.pGL.Workarounds.ForceSoftwareTransform) {
    buf.Take$mStdStrBuf(new $.StdStrBuf().init$pi8$b(S("#define OC_WA_FORCE_SOFTWARE_TRANSFORM\n")).op_add$StdStrBuf(buf));
  }
  if (LowMaxVertexUniformCount) {
    return new $.StdStrBuf().init$pi8$b(S("#define OC_WA_LOW_MAX_VERTEX_UNIFORM_COMPONENTS\n")).op_add$StdStrBuf(buf);
  } else {
    return buf;
  }
}

export function GetFragmentShaderCodeForPass(pass, params) {
  let buf = new $.StdStrBuf();
  let texIndex = 0;
  let textureUnitCode = new $.StdStrBuf().init$pi8$b(S(""));
  let textureUnitDeclCode = new $.StdStrBuf().init$pi8$b(S(""));
  for (const texunit of pass.TextureUnits) {
    textureUnitCode.Append$StdStrBuf(TextureUnitToCode(texIndex | 0, texunit));
    if (texunit.HasTexture()) {
      textureUnitDeclCode.Append$pi8($.FormatString(S("uniform sampler2D oc_Texture%u;\n"), texIndex).getData());
      $wr(params.AddParameter($.FormatString(S("oc_Texture%u"), texIndex).getData(), 2 /*INT*/).GetInt$v(), 0, texIndex | 0);
      if (texunit.HasTexCoordAnimation()) {
        textureUnitDeclCode.Append$pi8($.FormatString(S("uniform mat4 oc_TextureMatrix%u;\n"), texIndex).getData());
        $wr(params.AddParameter($.FormatString(S("oc_TextureMatrix%u"), texIndex).getData(), 1 /*AUTO_TEXTURE_MATRIX*/).GetInt$v(), 0, texIndex | 0);
      }
      texIndex = texIndex + 1 >>> 0;
    }
  }
  return $.FormatString(S("%s\nuniform vec3 oc_PlayerColor;\n\nslice(texture)\n{\n  vec4 diffuse = fragColor;\n  vec4 currentColor = diffuse;\n  %s\n  fragColor = currentColor;\n}\n\nslice(finish)\n{\n  %s\n}\n"), textureUnitDeclCode.getData(), textureUnitCode.getData(), AlphaTestToCode(pass).getData());
}

export function GetSHA1HexDigest(text, len) {
  let ctx = new $.sha1().init();
  ctx.process_bytes(text, len);
  const digest = new Uint32Array(5);
  ctx.get_digest(digest);
  return $.FormatString(S("%08x%08x%08x%08x%08x"), digest[0], digest[1], digest[2], digest[3], digest[4]);
}

export function ApplyZoomAndTransform(ZoomX, ZoomY, Zoom, pTransform, projection) {
  $.Translate(projection, ZoomX, ZoomY, 0);
  $.Scale(projection, Zoom, Zoom, 1);
  $.Translate(projection, -ZoomX, -ZoomY, 0);
  if (pTransform != null) {
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
    $wr(transform.op_call$i32$i32(2, 2), 0, 1);
    $wr(transform.op_call$i32$i32(2, 3), 0, 0);
    $wr(transform.op_call$i32$i32(3, 0), 0, pTransform.mat[6]);
    $wr(transform.op_call$i32$i32(3, 1), 0, pTransform.mat[7]);
    $wr(transform.op_call$i32$i32(3, 2), 0, 0);
    $wr(transform.op_call$i32$i32(3, 3), 0, pTransform.mat[8]);
    $.op_mulAssign$rStdProjectionMatrix$StdProjectionMatrix(projection, transform);
    let det = Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(Math.fround($rd(transform.op_call$i32$i32(0, 0)) * $rd(transform.op_call$i32$i32(1, 1))) * $rd(transform.op_call$i32$i32(3, 3))) + Math.fround(Math.fround($rd(transform.op_call$i32$i32(1, 0)) * $rd(transform.op_call$i32$i32(3, 1))) * $rd(transform.op_call$i32$i32(0, 3)))) + Math.fround(Math.fround($rd(transform.op_call$i32$i32(3, 0)) * $rd(transform.op_call$i32$i32(0, 1))) * $rd(transform.op_call$i32$i32(1, 3)))) - Math.fround(Math.fround($rd(transform.op_call$i32$i32(0, 0)) * $rd(transform.op_call$i32$i32(3, 1))) * $rd(transform.op_call$i32$i32(1, 3)))) - Math.fround(Math.fround($rd(transform.op_call$i32$i32(1, 0)) * $rd(transform.op_call$i32$i32(0, 1))) * $rd(transform.op_call$i32$i32(3, 3)))) - Math.fround(Math.fround($rd(transform.op_call$i32$i32(3, 0)) * $rd(transform.op_call$i32$i32(1, 1))) * $rd(transform.op_call$i32$i32(0, 3))));
    return det > Math.fround(0);
  }
  return true;
}

export function SetStandardUniforms(call, dwModClr, dwPlayerColor, _dwBlitMode, cullFace, pFoW, clipRect, outRect) {
  const fMod = new Float32Array([Math.fround(Math.fround((dwModClr >>> 16 & 255) >>> 0) / 255), Math.fround(Math.fround((dwModClr >>> 8 & 255) >>> 0) / 255), Math.fround(Math.fround((dwModClr & 255) >>> 0) / 255), Math.fround(Math.fround((dwModClr >>> 24 & 255) >>> 0) / 255)]);
  call.SetUniform4fv(3, 1, P(fMod, 0));
  call.SetUniform3fv(4, 1, P($.pDraw.gammaOut, 0));
  call.SetUniform2f(5, Math.fround(outRect.Wdt), Math.fround(outRect.Hgt));
  const fPlrClr = new Float32Array([Math.fround(Math.fround((dwPlayerColor >>> 16 & 255) >>> 0) / 255), Math.fround(Math.fround((dwPlayerColor >>> 8 & 255) >>> 0) / 255), Math.fround(Math.fround((dwPlayerColor & 255) >>> 0) / 255)]);
  call.SetUniform3fv(8, 1, P(fPlrClr, 0));
  call.SetUniform1f(21, cullFace ? 0 : 1);
  if (pFoW != null) {
    call.AllocTexUnit(9);
    gl$glBindTexture(3553, pFoW.getSurfaceName());
    const lightTransform = new Float32Array(6);
    pFoW.GetFragTransform(clipRect, outRect, P(lightTransform, 0));
    call.SetUniformMatrix2x3fv(10, 1, P(lightTransform, 0));
    call.AllocTexUnit(12);
    gl$glBindTexture(3553, pFoW.getFoW().Ambient.Tex);
    call.SetUniform1f(14, Math.fround(pFoW.getFoW().Ambient.GetBrightness()));
    const ambientTransform = new Float32Array(6);
    pFoW.getFoW().Ambient.GetFragTransform(pFoW.getViewportRegion(), clipRect, outRect, P(ambientTransform, 0));
    call.SetUniformMatrix2x3fv(13, 1, P(ambientTransform, 0));
  }
  call.SetUniform1i(22, $.Game.FrameCounter);
}

export function ResolveAutoParameter(_call, _parameter, _value, _dwModClr, _dwPlayerColor, _dwBlitMode, _pFoW, _clipRect) {
  0;
  return false;
}

export function ResolveAutoTextureMatrix(instance, technique, passIndex, texUnitIndex) {
  0;
  const pass = technique.Passes[passIndex];
  0;
  const texunit = pass.TextureUnits[texUnitIndex];
  let matrix = $.StdProjectionMatrix.Identity();
  let Position = instance.GetTexturePosition(passIndex, texUnitIndex);
  for (const trans of texunit.Transformations) {
    let temp_matrix = new $.StdProjectionMatrix();
    switch (trans.TransformType) {
      case 0:
        $.Translate(matrix, trans.$u1.Scroll.X, trans.$u1.Scroll.Y, 0);
        break;
      case 1:
        $.Translate(matrix, Math.fround(trans.GetScrollX(Position)), Math.fround(trans.GetScrollY(Position)), 0);
        break;
      case 2:
        $.Rotate(matrix, trans.$u1.Rotate.Angle, 0, 0, 1);
        break;
      case 3:
        $.Rotate(matrix, Math.fround(trans.GetRotate(Position)), 0, 0, 1);
        break;
      case 4:
        $.Scale(matrix, trans.$u1.Scale.X, trans.$u1.Scale.Y, 1);
        break;
      case 5:
        for (let i = 0; i < 16; i = i + 1 | 0) {
          $wr(temp_matrix.op_call$i32$i32(i / 4 | 0, i % 4), 0, trans.$u1.Transform.M[i]);
        }
        $.op_mulAssign$rStdProjectionMatrix$StdProjectionMatrix(matrix, temp_matrix);
        break;
      case 6:
        switch (trans.$u1.WaveXForm.XForm) {
          case 0:
            $.Translate(matrix, Math.fround(trans.GetWaveXForm(Position)), 0, 0);
            break;
          case 1:
            $.Translate(matrix, 0, Math.fround(trans.GetWaveXForm(Position)), 0);
            break;
          case 2:
            $.Rotate(matrix, Math.fround(trans.GetWaveXForm(Position)), 0, 0, 1);
            break;
          case 3:
            $.Scale(matrix, Math.fround(trans.GetWaveXForm(Position)), 1, 1);
            break;
          case 4:
            $.Scale(matrix, 1, Math.fround(trans.GetWaveXForm(Position)), 1);
            break;
        }
        break;
    }
  }
  return matrix;
}

export function CookBoneTransforms(mesh_instance) {
  let bones = [];
  if (mesh_instance.GetBoneCount() === 0) {
    if (!('CookBoneTransforms$dummy_bone' in $)) $.CookBoneTransforms$dummy_bone = ((($o) => ($o.m = [new Float32Array([1, 0, 0, 0]), new Float32Array([0, 1, 0, 0]), new Float32Array([0, 0, 1, 0])], $o))(new BoneTransform()));
    $vpush(bones, $.CookBoneTransforms$dummy_bone.$clone());
  } else {
    $reserve(bones, mesh_instance.GetBoneCount());
    for (let bone_index = 0; bone_index < mesh_instance.GetBoneCount(); bone_index = bone_index + 1) {
      const bone = mesh_instance.GetBoneTransform(bone_index);
      let cooked_bone = ((($o) => ($o.m = [new Float32Array([bone.op_call$i32$i32$c(0, 0), bone.op_call$i32$i32$c(0, 1), bone.op_call$i32$i32$c(0, 2), bone.op_call$i32$i32$c(0, 3)]), new Float32Array([bone.op_call$i32$i32$c(1, 0), bone.op_call$i32$i32$c(1, 1), bone.op_call$i32$i32$c(1, 2), bone.op_call$i32$i32$c(1, 3)]), new Float32Array([bone.op_call$i32$i32$c(2, 0), bone.op_call$i32$i32$c(2, 1), bone.op_call$i32$i32$c(2, 2), bone.op_call$i32$i32$c(2, 3)])], $o))(new BoneTransform()));
      $vpush(bones, cooked_bone.$clone());
    }
  }
  return bones;
}

export function PretransformMeshVertex(out, in_, mesh_instance) {
  if (in_.bone_weight[0] === 0 || mesh_instance.GetBoneCount() === 0) {
    out.x = in_.x;
    out.y = in_.y;
    out.z = in_.z;
    out.nx = in_.nx;
    out.ny = in_.ny;
    out.nz = in_.nz;
  } else {
    let vtx = ((($o) => ($o.nx = Math.fround(0), $o.ny = Math.fround(0), $o.nz = Math.fround(0), $o.x = Math.fround(0), $o.y = Math.fround(0), $o.z = Math.fround(0), $o))(new PretransformedMeshVertex()));
    for (let i = 0; i < 8 && in_.bone_weight[i] > Math.fround(0); i = i + 1) {
      let weight = in_.bone_weight[i];
      const bone = mesh_instance.GetBoneTransform(in_.bone_index[i]);
      let vertex = $.op_mul$f32$StdMeshVertex(weight, $.op_mul$StdMeshMatrix$StdMeshVertex(bone, in_));
      vtx.nx = Math.fround(vtx.nx + vertex.nx);
      vtx.ny = Math.fround(vtx.ny + vertex.ny);
      vtx.nz = Math.fround(vtx.nz + vertex.nz);
      vtx.x = Math.fround(vtx.x + vertex.x);
      vtx.y = Math.fround(vtx.y + vertex.y);
      vtx.z = Math.fround(vtx.z + vertex.z);
    }
    out.$assign(vtx);
  }
}


export function PretransformMeshVertices(..._) { return $missing("PretransformMeshVertices"); }

export function RenderSubMeshImpl(projectionMatrix, modelviewMatrix, mesh_instance, instance, dwModClr, dwBlitMode, dwPlayerColor, pFoW, clipRect, outRect, parity) {
  if (Math.fround(c$fabs(modelviewMatrix.Determinant())) < 1e-06) {
    return;
  }
  const material = instance.GetMaterial();
  0;
  const technique = material.Techniques[$u64n(material.BestTechniqueIndex)];
  let using_shared_vertices = instance.GetSubMesh().GetVertices().length === 0;
  let vbo = mesh_instance.GetMesh().GetVBO();
  let ibo = mesh_instance.GetIBO();
  let vaoid = mesh_instance.GetVAOID();
  let vertex_buffer_offset = using_shared_vertices ? 0 : instance.GetSubMesh().GetOffsetInVBO();
  let index_buffer_offset = instance.GetSubMesh().GetOffsetInIBO();
  let ForceSoftwareTransform = $.pGL.Workarounds.ForceSoftwareTransform;
  const pretransform_vbo = [0];
  let bones = [];
  if (!ForceSoftwareTransform) {
    bones = CookBoneTransforms(mesh_instance).slice();
  } else {
    gl$glGenBuffers(1, P(pretransform_vbo, 0));
    PretransformMeshVertices(mesh_instance, instance, pretransform_vbo[0]);
  }
  let normalMatrixTranspose = $.StdMeshMatrix.Inverse(modelviewMatrix);
  for (let i = 0; i < technique.Passes.length; i = i + 1 >>> 0) {
    const pass = technique.Passes[i];
    if (!pass.DepthCheck) {
      gl$glDisable(2929);
    }
    gl$glDepthMask((pass.DepthWrite ? 1 : 0) & 0xff);
    if (pass.AlphaToCoverage) {
      gl$glEnable(32926);
    } else {
      gl$glDisable(32926);
    }
    gl$glFrontFace((parity ? 2304 : 2305) >>> 0);
    if (mesh_instance.GetCompletion() < 1) {
      gl$glDisable(2884);
    } else {
      switch (pass.CullHardware) {
        case 0:
          gl$glEnable(2884);
          gl$glCullFace(1029);
          break;
        case 1:
          gl$glEnable(2884);
          gl$glCullFace(1028);
          break;
        case 2:
          gl$glDisable(2884);
          break;
      }
    }
    if (!((dwBlitMode & 1) >>> 0 !== 0)) {
      if ((dwModClr >>> 24 & 255) >>> 0 < 255) {
        gl$glBlendFunc(770, 771);
      } else {
        gl$glBlendFunc(OgreBlendTypeToGL(pass.SceneBlendFactors[0]), OgreBlendTypeToGL(pass.SceneBlendFactors[1]));
      }
    } else {
      if ((dwModClr >>> 24 & 255) >>> 0 < 255) {
        gl$glBlendFunc(770, 1);
      } else {
        gl$glBlendFunc(OgreBlendTypeToGL(pass.SceneBlendFactors[0]), 1);
      }
    }
    0;
    let ssc = 0;
    if ((dwBlitMode & 2) >>> 0 !== 0) {
      ssc |= 1;
    }
    if (pFoW != null) {
      ssc |= 8;
    }
    let shader = pass.Program.Program.GetShader(ssc);
    if (shader == null) {
      return;
    }
    let call = new $.C4ShaderCall().init(shader);
    try {
      call.Start();
      call.SetUniformMatrix4x4$i32$StdProjectionMatrix(0, projectionMatrix);
      call.SetUniformMatrix4x4$i32$StdMeshMatrix(1, modelviewMatrix);
      call.SetUniformMatrix3x3Transpose(2, normalMatrixTranspose);
      call.SetUniform4fv(15, 1, P(pass.Ambient, 0));
      call.SetUniform4fv(16, 1, P(pass.Diffuse, 0));
      call.SetUniform4fv(17, 1, P(pass.Specular, 0));
      call.SetUniform4fv(18, 1, P(pass.Emissive, 0));
      call.SetUniform1f(19, pass.Shininess);
      if (!ForceSoftwareTransform) {
        if (!(bones.length === 0)) {
          if ($.pGL.Workarounds.LowMaxVertexUniformCount) {
            gl$glUniformMatrix3x4fv(shader.GetUniform(20), bones.length | 0, 0, $rowp(bones[0], "m", 0, 0));
          } else {
            gl$glUniformMatrix4x3fv(shader.GetUniform(20), bones.length | 0, 1, $rowp(bones[0], "m", 0, 0));
          }
        }
      }
      const vao = [0];
      let has_vao = $.pGL.GetVAO(vaoid, P(vao, 0));
      gl$glBindVertexArray(vao[0]);
      if (!has_vao) {
        gl$glBindBuffer(34962, vbo);
        gl$glBindBuffer(34963, ibo);
        if (shader.GetAttribute(2) !== -1) {
          gl$glVertexAttribPointer(shader.GetAttribute(2) >>> 0, 2, 5126, 0, 96, null);
        }
        if (!ForceSoftwareTransform) {
          gl$glVertexAttribPointer(shader.GetAttribute(0) >>> 0, 3, 5126, 0, 96, P(null, 20));
          gl$glVertexAttribPointer(shader.GetAttribute(1) >>> 0, 3, 5126, 0, 96, P(null, 8));
          gl$glEnableVertexAttribArray(shader.GetAttribute(0) >>> 0);
          gl$glEnableVertexAttribArray(shader.GetAttribute(1) >>> 0);
          gl$glVertexAttribPointer(shader.GetAttribute(6) >>> 0, 4, 5126, 0, 96, P(null, 32));
          gl$glVertexAttribPointer(shader.GetAttribute(7) >>> 0, 4, 5126, 0, 96, $padd(P(null, 32), 16));
          gl$glVertexAttribPointer(shader.GetAttribute(4) >>> 0, 4, 5122, 0, 96, P(null, 64));
          gl$glVertexAttribPointer(shader.GetAttribute(5) >>> 0, 4, 5122, 0, 96, $padd(P(null, 64), 8));
          gl$glEnableVertexAttribArray(shader.GetAttribute(6) >>> 0);
          gl$glEnableVertexAttribArray(shader.GetAttribute(7) >>> 0);
          gl$glEnableVertexAttribArray(shader.GetAttribute(4) >>> 0);
          gl$glEnableVertexAttribArray(shader.GetAttribute(5) >>> 0);
        }
        if (shader.GetAttribute(2) !== -1) {
          gl$glEnableVertexAttribArray(shader.GetAttribute(2) >>> 0);
        }
      }
      if (ForceSoftwareTransform) {
        gl$glBindBuffer(34962, pretransform_vbo[0]);
        gl$glVertexAttribPointer(shader.GetAttribute(0) >>> 0, 3, 5126, 0, 24, P(null, 12));
        gl$glEnableVertexAttribArray(shader.GetAttribute(0) >>> 0);
        gl$glVertexAttribPointer(shader.GetAttribute(1) >>> 0, 3, 5126, 0, 24, null);
        gl$glEnableVertexAttribArray(shader.GetAttribute(1) >>> 0);
        gl$glBindBuffer(34962, 0);
      }
      for (let j = 0; j < pass.TextureUnits.length; j = j + 1 >>> 0) {
        const texunit = pass.TextureUnits[j];
        if (texunit.HasTexture()) {
          call.AllocTexUnit(-1);
          let Phase = instance.GetTexturePhase(i, j);
          gl$glBindTexture(3553, texunit.GetTexture(Phase).texName);
        }
      }
      SetStandardUniforms(call, dwModClr, dwPlayerColor, dwBlitMode, pass.CullHardware !== 2, pFoW, clipRect, outRect);
      for (const Parameter of pass.Program.Parameters) {
        let uniform = Parameter.UniformIndex;
        if (!shader.HaveUniform(uniform)) {
          continue;
        }
        let parameter = Parameter.Parameter;
        let auto_resolved = new $.StdMeshMaterialShaderParameter();
        if (parameter.GetType() === 0) {
          if (!ResolveAutoParameter(call, auto_resolved, parameter.GetAuto$v$c(), dwModClr, dwPlayerColor, dwBlitMode, pFoW, clipRect)) {
            continue;
          }
          parameter = auto_resolved;
        }
        switch (parameter.GetType()) {
          case 1:
            call.SetUniformMatrix4x4$i32$StdProjectionMatrix(uniform, ResolveAutoTextureMatrix(instance, technique, i, parameter.GetInt$v$c() >>> 0));
            break;
          case 2:
            call.SetUniform1i(uniform, parameter.GetInt$v$c());
            break;
          case 3:
            call.SetUniform1f(uniform, parameter.GetFloat$v$c());
            break;
          case 4:
            call.SetUniform2fv(uniform, 1, parameter.GetFloatv$v$c());
            break;
          case 5:
            call.SetUniform3fv(uniform, 1, parameter.GetFloatv$v$c());
            break;
          case 6:
            call.SetUniform4fv(uniform, 1, parameter.GetFloatv$v$c());
            break;
          case 7:
            call.SetUniformMatrix4x4fv(uniform, 1, parameter.GetMatrix$v$c());
            break;
          default:
            0;
            break;
        }
      }
      $.pDraw.scriptUniform.Apply(call);
      let vertex_count = 3 * instance.GetNumFaces();
      0;
      let base_vertex = Math.trunc(vertex_buffer_offset / 96);
      gl$glDrawElementsBaseVertex(4, vertex_count | 0, 5125, P(null, index_buffer_offset), base_vertex | 0);
      gl$glBindVertexArray(0);
      call.Finish();
      if (!pass.DepthCheck) {
        gl$glEnable(2929);
      }
    } finally { call && call.$dtor(); }
  }
  if (ForceSoftwareTransform) {
    gl$glDeleteBuffers(1, P(pretransform_vbo, 0));
  }
}

export function RenderAttachedMesh(projectionMatrix, modelviewMatrix, attach, dwModClr, dwBlitMode, dwPlayerColor, pFoW, clipRect, outRect, parity) {
  const FinalTrans = attach.GetFinalTransformation();
  let denumerator = $dyncast(attach.ChildDenumerator, $.C4MeshDenumerator);
  if (denumerator != null && denumerator.GetObject() != null) {
    dwModClr = denumerator.GetObject().ColorMod;
    dwBlitMode = denumerator.GetObject().BlitMode;
    dwPlayerColor = denumerator.GetObject().Color;
  }
  let newModelviewMatrix = $.op_mul$StdMeshMatrix$StdMeshMatrix(modelviewMatrix, FinalTrans);
  RenderMeshImpl(projectionMatrix, newModelviewMatrix, attach.Child, dwModClr, dwBlitMode, dwPlayerColor, pFoW, clipRect, outRect, parity);
}

export function RenderMeshImpl(projectionMatrix, modelviewMatrix, instance, dwModClr, dwBlitMode, dwPlayerColor, pFoW, clipRect, outRect, parity) {
  const mesh = instance.GetMesh();
  let attach_iter = instance.AttachedMeshesBegin();
  for (; !attach_iter.eq(instance.AttachedMeshesEnd()) && (attach_iter.v.GetFlags() & 1) >>> 0 !== 0; attach_iter.inc()) {
    RenderAttachedMesh(projectionMatrix, modelviewMatrix, attach_iter.v, dwModClr, dwBlitMode, dwPlayerColor, pFoW, clipRect, outRect, parity);
  }
  if ((dwBlitMode & 16) >>> 0 !== 0) {
    gl$glPolygonMode(1032, 6913);
  }
  for (let i = 0; i < mesh.GetNumSubMeshes(); i = i + 1 >>> 0) {
    RenderSubMeshImpl(projectionMatrix, modelviewMatrix, instance, instance.GetSubMeshOrdered(i), dwModClr, dwBlitMode, dwPlayerColor, pFoW, clipRect, outRect, parity);
  }
  if ((dwBlitMode & 16) >>> 0 !== 0) {
    gl$glPolygonMode(1032, 6914);
  }
  for (; !attach_iter.eq(instance.AttachedMeshesEnd()); attach_iter.inc()) {
    RenderAttachedMesh(projectionMatrix, modelviewMatrix, attach_iter.v, dwModClr, dwBlitMode, dwPlayerColor, pFoW, clipRect, outRect, parity);
  }
}

export function $init(): void {
}

Object.assign($, { AlphaTestToCode, ApplyZoomAndTransform, BoneTransform, CookBoneTransforms, GetFragmentShaderCodeForPass, GetSHA1HexDigest, GetVertexShaderCodeForPass, OgreBlendTypeToGL, PretransformMeshVertex, PretransformMeshVertices, PretransformedMeshVertex, RenderAttachedMesh, RenderMeshImpl, RenderSubMeshImpl, ResolveAutoParameter, ResolveAutoTextureMatrix, ScopedLocale$1, SetStandardUniforms, Texture2DToCode, TextureUnitBlendToCode, TextureUnitSourceToCode, TextureUnitToCode });
