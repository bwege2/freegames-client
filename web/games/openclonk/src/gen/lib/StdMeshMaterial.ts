// @ts-nocheck
// OpenClonk 36de799: src/lib/StdMeshMaterial.cpp, src/lib/StdMeshMaterial.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n } from '../../rt/int.ts';
import { c$fmod, c$isdigit, c$isspace, c$sin, c$strchr, c$strrchr } from '../../rt/libc.ts';
import { $oadd, $oat, $own, $padd, $rd, $wr, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $begin, $copy, $delete, $end, $itcopy, $throw, $tuple, $vpush, IStringStream, StdException, StdMap, StdPair, StdSet, StdString, resize, std_distance, std_find, std_find_if } from '../../rt/std.ts';

export class Enumerator$i32 {
  Name = null;
  Value = 0;

  $clone() { return new Enumerator$i32().$assign(this); }
  $assign(o) {
    this.Name = o.Name;
    this.Value = o.Value;
    return this;
  }
}

export class Enumerator$i32$2 {
  Name = null;
  Value = 0;

  $clone() { return new Enumerator$i32$2().$assign(this); }
  $assign(o) {
    this.Name = o.Name;
    this.Value = o.Value;
    return this;
  }
}

export class Enumerator$i32$3 {
  Name = null;
  Value = 0;

  $clone() { return new Enumerator$i32$3().$assign(this); }
  $assign(o) {
    this.Name = o.Name;
    this.Value = o.Value;
    return this;
  }
}

export class Enumerator$i32$5 {
  Name = null;
  Value = 0;

  $clone() { return new Enumerator$i32$5().$assign(this); }
  $assign(o) {
    this.Name = o.Name;
    this.Value = o.Value;
    return this;
  }
}

export class Enumerator$i32$6 {
  Name = null;
  Value = 0;

  $clone() { return new Enumerator$i32$6().$assign(this); }
  $assign(o) {
    this.Name = o.Name;
    this.Value = o.Value;
    return this;
  }
}

export class Enumerator$i32$7 {
  Name = null;
  Value = 0;

  $clone() { return new Enumerator$i32$7().$assign(this); }
  $assign(o) {
    this.Name = o.Name;
    this.Value = o.Value;
    return this;
  }
}

export class Enumerator$i32$8 {
  Name = null;
  Value = 0;

  $clone() { return new Enumerator$i32$8().$assign(this); }
  $assign(o) {
    this.Name = o.Name;
    this.Value = o.Value;
    return this;
  }
}

export class Enumerator$i32$9 {
  Name = null;
  Value = 0;

  $clone() { return new Enumerator$i32$9().$assign(this); }
  $assign(o) {
    this.Name = o.Name;
    this.Value = o.Value;
    return this;
  }
}

export class Enumerator$i32$10 {
  Name = null;
  Value = 0;

  $clone() { return new Enumerator$i32$10().$assign(this); }
  $assign(o) {
    this.Name = o.Name;
    this.Value = o.Value;
    return this;
  }
}

export class Enumerator$i32$11 {
  Name = null;
  Value = 0;

  $clone() { return new Enumerator$i32$11().$assign(this); }
  $assign(o) {
    this.Name = o.Name;
    this.Value = o.Value;
    return this;
  }
}

export class EnumeratorShortcut$2$i32 {
  Name = null;
  Values = new Int32Array(2);

  $clone() { return new EnumeratorShortcut$2$i32().$assign(this); }
  $assign(o) {
    this.Name = o.Name;
    this.Values = o.Values.slice();
    return this;
  }
}

export class StdMeshMaterialError extends StdException {
  Buf = new $.StdCopyStrBuf();

  init(message, file, line) {
    this.Buf = new $.StdCopyStrBuf();
    this.Buf.Format(S("%s:%u: %s"), file, line, message.getData());
    return this;
  }

  what() {
    return this.Buf.getData();
  }

  $clone() { return new StdMeshMaterialError().$assign(this); }
  $assign(o) {
    this.Buf.$assign(o.Buf);
    return this;
  }
}

export class Enumerator$i32$4 {
  Name = null;
  Value = 0;

  $clone() { return new Enumerator$i32$4().$assign(this); }
  $assign(o) {
    this.Name = o.Name;
    this.Value = o.Value;
    return this;
  }
}

export class EnumeratorShortcut$3$i32 {
  Name = null;
  Values = new Int32Array(3);

  $clone() { return new EnumeratorShortcut$3$i32().$assign(this); }
  $assign(o) {
    this.Name = o.Name;
    this.Values = o.Values.slice();
    return this;
  }
}

export class StdMeshMaterialShaderParameter {
  type = 6 /*FLOAT4*/;
  $u1 = new StdMeshMaterialShaderParameter$$anon1();

  init$i32(type) {
    this.type = type;
    if (type === 7) {
      this.$u1.matrix = P(new Float32Array(16), 0);
    }
    return this;
  }

  $dtor() {
    if (this.type === 7) {
      $delete(this.$u1.matrix);
    }
  }

  op_assign$mStdMeshMaterialShaderParameter(other) {
    if (this === other) {
      return this;
    }
    if (this.type === 7) {
      $delete(this.$u1.matrix);
    }
    this.Move(other);
    return this;
  }

  GetType() {
    return this.type;
  }

  SetType(type) {
    let other = new StdMeshMaterialShaderParameter().init$i32(type);
    this.Move(other);
  }

  GetAuto$v$c() {
    0;
    return this.$u1.a;
  }

  GetInt$v$c() {
    0;
    return this.$u1.i;
  }

  GetFloat$v$c() {
    0;
    return this.$u1.f[0];
  }

  GetFloatv$v$c() {
    0;
    return P(this.$u1.f, 0);
  }

  GetMatrix$v$c() {
    0;
    return this.$u1.matrix;
  }

  GetAuto$v() {
    0;
    return P(this.$u1, "a");
  }

  GetInt$v() {
    0;
    return P(this.$u1, "i");
  }

  GetFloat$v() {
    0;
    return P(this.$u1.f, 0);
  }

  GetFloatv$v() {
    0;
    return P(this.$u1.f, 0);
  }

  GetMatrix$v() {
    0;
    return this.$u1.matrix;
  }

  CopyShallow(other) {
    this.type = other.type;
    switch (this.type) {
      case 0:
        this.$u1.a = other.$u1.a;
        break;
      case 1:
      case 2:
        this.$u1.i = other.$u1.i;
        break;
      case 6:
        this.$u1.f[3] = other.$u1.f[3];
      case 5:
        this.$u1.f[2] = other.$u1.f[2];
      case 4:
        this.$u1.f[1] = other.$u1.f[1];
      case 3:
        this.$u1.f[0] = other.$u1.f[0];
        break;
      case 7:
        this.$u1.matrix = other.$u1.matrix;
        break;
      default:
        0;
        break;
    }
  }

  CopyDeep(other) {
    this.CopyShallow(other);
    if (this.type === 7) {
      this.$u1.matrix = P(new Float32Array(16), 0);
      for (let i = 0; i < 16; i = i + 1 | 0) {
        this.$u1.matrix.a[this.$u1.matrix.o + i] = other.$u1.matrix.a[other.$u1.matrix.o + i];
      }
    }
  }

  Move(other) {
    this.CopyShallow(other);
    other.type = 3 /*FLOAT*/;
  }

  $copy(other) {
    this.type = 6 /*FLOAT4*/;
    StdMeshMaterialShaderParameter.prototype.CopyDeep.call(this, other);
    return this;
  }
  $clone() { return new StdMeshMaterialShaderParameter().$copy(this); }
  $assign(other) {
    if (this === other) {
      return this;
    }
    if (this.type === 7) {
      $delete(this.$u1.matrix);
    }
    this.CopyDeep(other);
    return this;
  }
}

export class StdMeshMaterialShaderParameter$$anon1 {
  $v = 0;
  get a() { const v = this.$v; return v === null ? 0 : v; }
  set a(v) { this.$v = v; }
  get i() { const v = this.$v; return v === null ? 0 : v; }
  set i(v) { this.$v = v; }
  get f() { return this.$v; }
  set f(v) { this.$v = v; }
  get matrix() { const v = this.$v; return v === 0 ? null : v; }
  set matrix(v) { this.$v = v; }
  $clone() { const u = new StdMeshMaterialShaderParameter$$anon1(); u.$v = this.$v; return u; }
  $assign(o) { this.$v = o.$v; return this; }
}

export class StdMeshMaterialShaderParameters {
  NamedParameters = [];

  init() {
    this.NamedParameters = [];
    return this;
  }

  Load(ctx) {
    let token_name = new $.StdStrBuf();
    ctx.AdvanceRequired$rStdStrBuf$i32(token_name, 1 /*TOKEN_BRACE_OPEN*/);
    let token = 0;
    while ((token = ctx.AdvanceNonEOF(token_name)) === 0) {
      if (token_name.op_eq$pi8(S("param_named"))) {
        let param_name = new $.StdStrBuf();
        ctx.AdvanceRequired$rStdStrBuf$i32(param_name, 0 /*TOKEN_IDTF*/);
        this.NamedParameters.push(new StdPair(new $.StdCopyStrBuf().init$StdStrBuf$b(param_name), this.LoadConstParameter(ctx)));
      } else if (token_name.op_eq$pi8(S("param_named_auto"))) {
        let param_name = new $.StdStrBuf();
        ctx.AdvanceRequired$rStdStrBuf$i32(param_name, 0 /*TOKEN_IDTF*/);
        this.NamedParameters.push(new StdPair(new $.StdCopyStrBuf().init$StdStrBuf$b(param_name), this.LoadAutoParameter(ctx)));
      } else {
        ctx.ErrorUnexpectedIdentifier(token_name);
      }
    }
    if (token !== 2) {
      ctx.Error_(new $.StdCopyStrBuf().init$pi8$b(S("'")).op_add$pi8(token_name.getData()).op_add$pi8(S("' unexpected")));
    }
  }

  AddParameter(name, type) {
    this.NamedParameters.push(new StdPair(new $.StdCopyStrBuf().init$pi8$b(name), new StdMeshMaterialShaderParameter().init$i32(type)));
    return this.NamedParameters[this.NamedParameters.length - 1].second;
  }

  LoadConstParameter(ctx) {
    let type_name = new $.StdStrBuf();
    ctx.AdvanceRequired$rStdStrBuf$i32(type_name, 0 /*TOKEN_IDTF*/);
    if (type_name.op_eq$pi8(S("int"))) {
      let param = new StdMeshMaterialShaderParameter().init$i32(2 /*INT*/);
      $wr(param.GetInt$v(), 0, ctx.AdvanceInt());
      return param;
    } else if (type_name.op_eq$pi8(S("float"))) {
      let param = new StdMeshMaterialShaderParameter().init$i32(3 /*FLOAT*/);
      $wr(param.GetFloat$v(), 0, ctx.AdvanceFloat());
      return param;
    } else if (type_name.op_eq$pi8(S("float2"))) {
      let param = new StdMeshMaterialShaderParameter().init$i32(4 /*FLOAT2*/);
      $wr(param.GetFloatv$v(), 0, ctx.AdvanceFloat());
      $wr(param.GetFloatv$v(), 1, ctx.AdvanceFloat());
      return param;
    } else if (type_name.op_eq$pi8(S("float3"))) {
      let param = new StdMeshMaterialShaderParameter().init$i32(4 /*FLOAT2*/);
      $wr(param.GetFloatv$v(), 0, ctx.AdvanceFloat());
      $wr(param.GetFloatv$v(), 1, ctx.AdvanceFloat());
      $wr(param.GetFloatv$v(), 2, ctx.AdvanceFloat());
      return param;
    } else if (type_name.op_eq$pi8(S("float4"))) {
      let param = new StdMeshMaterialShaderParameter().init$i32(4 /*FLOAT2*/);
      $wr(param.GetFloatv$v(), 0, ctx.AdvanceFloat());
      $wr(param.GetFloatv$v(), 1, ctx.AdvanceFloat());
      $wr(param.GetFloatv$v(), 2, ctx.AdvanceFloat());
      $wr(param.GetFloatv$v(), 3, ctx.AdvanceFloat());
      return param;
    } else {
      ctx.Error_($.FormatString(S("Invalid type: \"%s\""), type_name.getData()));
      return new StdMeshMaterialShaderParameter();
    }
  }

  LoadAutoParameter(ctx) {
    let param = new StdMeshMaterialShaderParameter().init$i32(0 /*AUTO*/);
    $wr(param.GetAuto$v(), 0, ctx.AdvanceEnum$11($oat($.ShaderParameterAutoEnumerators, 0)));
    return param;
  }

  $clone() { return new StdMeshMaterialShaderParameters().$assign(this); }
  $assign(o) {
    this.NamedParameters = o.NamedParameters.slice();
    return this;
  }
}

export class StdMeshMaterialLoader {

  $clone() { return new StdMeshMaterialLoader().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class StdMeshMaterialShader {
  Filename = new $.StdCopyStrBuf();
  Name = new $.StdCopyStrBuf();
  Language = new $.StdCopyStrBuf();
  Code = new $.StdCopyStrBuf();

  init(filename, name, language, _3, code) {
    this.Filename = new $.StdCopyStrBuf().init$pi8$b(filename);
    this.Name = new $.StdCopyStrBuf().init$pi8$b(name);
    this.Language = new $.StdCopyStrBuf().init$pi8$b(language);
    this.Code = new $.StdCopyStrBuf().init$pi8$b(code);
    return this;
  }

  GetFilename() {
    return this.Filename.getData();
  }

  GetCode() {
    return this.Code.getData();
  }

  $clone() { return new StdMeshMaterialShader().$assign(this); }
  $assign(o) {
    this.Filename.$assign(o.Filename);
    this.Name.$assign(o.Name);
    this.Language.$assign(o.Language);
    this.Code.$assign(o.Code);
    return this;
  }
}

export class StdMeshMaterialProgram {
  Name = new $.StdCopyStrBuf();
  FragmentShader = null;
  VertexShader = null;
  GeometryShader = null;
  Shader = new $.C4Shader().init();
  ShaderMod2 = new $.C4Shader().init();
  ShaderLight = new $.C4Shader().init();
  ShaderLightMod2 = new $.C4Shader().init();
  ParameterNames = [];

  init(name, fragment_shader, vertex_shader, geometry_shader) {
    this.Name = new $.StdCopyStrBuf().init$pi8$b(name);
    this.FragmentShader = fragment_shader;
    this.VertexShader = vertex_shader;
    this.GeometryShader = geometry_shader;
    this.Shader = new $.C4Shader().init();
    this.ShaderMod2 = new $.C4Shader().init();
    this.ShaderLight = new $.C4Shader().init();
    this.ShaderLightMod2 = new $.C4Shader().init();
    this.ParameterNames = [];
    0;
    0;
    return this;
  }

  AddParameterNames(parameters) {
    let added = false;
    for (const NamedParameter of parameters.NamedParameters) {
      let iter = std_find($begin(this.ParameterNames), $end(this.ParameterNames), NamedParameter.first, (x, y) => x.op_eq$StdStrBuf(y));
      if (iter.eq($end(this.ParameterNames))) {
        $vpush(this.ParameterNames, NamedParameter.first.$clone());
        added = true;
      }
    }
    return added;
  }

  IsCompiled() {
    return this.Shader.Initialised();
  }

  Compile(loader) {
    if (!this.CompileShader(loader, this.Shader, 0)) {
      return false;
    }
    if (!this.CompileShader(loader, this.ShaderMod2, 1)) {
      return false;
    }
    if (!this.CompileShader(loader, this.ShaderLight, 8)) {
      return false;
    }
    if (!this.CompileShader(loader, this.ShaderLightMod2, 9)) {
      return false;
    }
    return true;
  }

  GetShader(ssc) {
    const shaders = [this.Shader, this.ShaderMod2, this.ShaderLight, this.ShaderLightMod2];
    let index = 0;
    if ((ssc & 1) !== 0) {
      index = index + 1 | 0;
    }
    if ((ssc & 8) !== 0) {
      index = index + 2 | 0;
    }
    0;
    return shaders[index];
  }

  GetParameterIndex(name) {
    let iter = std_find($begin(this.ParameterNames), $end(this.ParameterNames), name, (x, y) => x.op_eq$pi8(y));
    if (iter.eq($end(this.ParameterNames))) {
      return -1;
    }
    return 23 + std_distance($begin(this.ParameterNames), $itcopy(iter)) | 0;
  }

  GetFragmentShader() {
    return this.FragmentShader;
  }

  GetVertexShader() {
    return this.VertexShader;
  }

  GetGeometryShader() {
    return this.GeometryShader;
  }

  CompileShader(loader, shader, ssc) {
    loader.AddShaderSlices(shader, ssc);
    shader.AddVertexSlices(this.VertexShader.GetFilename(), this.VertexShader.GetCode(), this.VertexShader.GetFilename());
    shader.AddFragmentSlices(this.FragmentShader.GetFilename(), this.FragmentShader.GetCode(), this.FragmentShader.GetFilename());
    let uniformNames = [];
    let attributeNames = [];
    resize(uniformNames, 23 + this.ParameterNames.length + 1, () => null);
    uniformNames[0] = S("projectionMatrix");
    uniformNames[1] = S("modelviewMatrix");
    uniformNames[2] = S("normalMatrix");
    uniformNames[3] = S("clrMod");
    uniformNames[4] = S("gamma");
    uniformNames[5] = S("resolution");
    uniformNames[6] = S("baseTex");
    uniformNames[7] = S("overlayTex");
    uniformNames[8] = S("oc_PlayerColor");
    uniformNames[9] = S("lightTex");
    uniformNames[10] = S("lightTransform");
    uniformNames[11] = S("normalTex");
    uniformNames[12] = S("ambientTex");
    uniformNames[13] = S("ambientTransform");
    uniformNames[14] = S("ambientBrightness");
    uniformNames[15] = S("materialAmbient");
    uniformNames[16] = S("materialDiffuse");
    uniformNames[17] = S("materialSpecular");
    uniformNames[18] = S("materialEmission");
    uniformNames[19] = S("materialShininess");
    uniformNames[20] = S("bones");
    uniformNames[21] = S("cullMode");
    uniformNames[22] = S("frameCounter");
    for (let i = 0; i < this.ParameterNames.length; i = i + 1 >>> 0) {
      uniformNames[23 + i >>> 0] = this.ParameterNames[i].getData();
    }
    uniformNames[23 + this.ParameterNames.length] = null;
    resize(attributeNames, 9, () => null);
    attributeNames[0] = S("oc_Position");
    attributeNames[1] = S("oc_Normal");
    attributeNames[2] = S("oc_TexCoord");
    attributeNames[3] = S("oc_Color");
    attributeNames[4] = S("oc_BoneIndices0");
    attributeNames[5] = S("oc_BoneIndices1");
    attributeNames[6] = S("oc_BoneWeights0");
    attributeNames[7] = S("oc_BoneWeights1");
    attributeNames[8] = null;
    let name = new $.StdCopyStrBuf().init$StdCopyStrBuf$b(this.Name);
    if (ssc !== 0) {
      name.Append$pi8(S(":"));
    }
    if ((ssc & 8) !== 0) {
      name.Append$pi8(S("Light"));
    }
    if ((ssc & 1) !== 0) {
      name.Append$pi8(S("Mod2"));
    }
    return shader.Init(name.getData(), P(uniformNames, 0), P(attributeNames, 0));
  }

  $clone() { return new StdMeshMaterialProgram().$assign(this); }
  $assign(o) {
    this.Name.$assign(o.Name);
    this.FragmentShader = o.FragmentShader;
    this.VertexShader = o.VertexShader;
    this.GeometryShader = o.GeometryShader;
    this.Shader.$assign(o.Shader);
    this.ShaderMod2.$assign(o.ShaderMod2);
    this.ShaderLight.$assign(o.ShaderLight);
    this.ShaderLightMod2.$assign(o.ShaderLightMod2);
    this.ParameterNames = o.ParameterNames.slice();
    return this;
  }
}

export class StdMeshMaterialTextureUnit {
  Name = new $.StdCopyStrBuf();
  Duration = 0;
  TexAddressMode = 0 /*AM_Wrap*/;
  TexBorderColor = new Float32Array(4);
  Filtering = new Int32Array(3);
  ColorOpEx = 2 /*BOX_Modulate*/;
  ColorOpSources = new Int32Array(2);
  ColorOpManualFactor = 0;
  ColorOpManualColor1 = new Float32Array(3);
  ColorOpManualColor2 = new Float32Array(3);
  AlphaOpEx = 2 /*BOX_Modulate*/;
  AlphaOpSources = new Int32Array(2);
  AlphaOpManualFactor = 0;
  AlphaOpManualAlpha1 = 0;
  AlphaOpManualAlpha2 = 0;
  Transformations = [];
  Textures = [];

  init() {
    this.Name = new $.StdCopyStrBuf();
    this.Duration = 0;
    this.TexAddressMode = 0 /*AM_Wrap*/;
    this.ColorOpEx = 2 /*BOX_Modulate*/;
    this.ColorOpManualFactor = 0;
    this.AlphaOpEx = 2 /*BOX_Modulate*/;
    this.AlphaOpManualFactor = 0;
    this.Transformations = [];
    this.Textures = [];
    this.TexBorderColor[0] = this.TexBorderColor[1] = this.TexBorderColor[2] = 0;
    this.TexBorderColor[3] = 1;
    this.Filtering[0] = this.Filtering[1] = 2 /*F_Linear*/;
    this.Filtering[2] = 1 /*F_Point*/;
    this.ColorOpSources[0] = 0 /*BOS_Current*/;
    this.ColorOpSources[1] = 1 /*BOS_Texture*/;
    this.AlphaOpSources[0] = 0 /*BOS_Current*/;
    this.AlphaOpSources[1] = 1 /*BOS_Texture*/;
    this.ColorOpManualColor1[0] = this.ColorOpManualColor1[1] = this.ColorOpManualColor1[2] = this.AlphaOpManualAlpha1 = 0;
    this.ColorOpManualColor2[0] = this.ColorOpManualColor2[1] = this.ColorOpManualColor2[2] = this.AlphaOpManualAlpha2 = 0;
    return this;
  }

  LoadTexture(ctx, texname) {
    let $t1, $t2;
    let surface = ctx.Loader.LoadTexture(texname);
    if (surface == null) {
      ctx.Error_(new $.StdCopyStrBuf().init$pi8$b(S("Could not load texture '")).op_add$pi8(texname).op_add$pi8(S("'")));
    }
    if (surface.Wdt !== surface.Hgt) {
      ctx.Error_(new $.StdCopyStrBuf().init$pi8$b(S("Texture '")).op_add$pi8(texname).op_add$pi8(S("' is not quadratic")));
    }
    $vpush(this.Textures, new StdMeshMaterialTextureUnit$TexPtr().init(($t2 = surface, surface = null, $t2)));
  }

  Load(ctx) {
    let $t1;
    let token = 0;
    let token_name = new $.StdCopyStrBuf();
    while ((token = ctx.AdvanceNonEOF(token_name)) === 0) {
      if (token_name.op_eq$pi8(S("texture"))) {
        this.Textures.length = 0;
        ctx.AdvanceRequired$rStdStrBuf$i32(token_name, 0 /*TOKEN_IDTF*/);
        this.LoadTexture(ctx, token_name.getData());
      } else if (token_name.op_eq$pi8(S("anim_texture"))) {
        this.Textures.length = 0;
        let base_name = new $.StdCopyStrBuf();
        ctx.AdvanceRequired$rStdStrBuf$i32(base_name, 0 /*TOKEN_IDTF*/);
        const num_frames = [0];
        if (ctx.AdvanceIntOptional(P(num_frames, 0))) {
          let data = base_name.getData();
          let sep = c$strrchr(data, 46);
          for (let i = 0; i < num_frames[0]; i = i + 1 | 0) {
            let buf = new $.StdCopyStrBuf();
            if (sep != null) {
              buf.Format(S("%.*s_%d.%s"), sep.o - data.o | 0, data, i, $padd(sep, 1));
            } else {
              buf.Format(S("%s_%d"), data, i);
            }
            this.LoadTexture(ctx, buf.getData());
          }
          this.Duration = ctx.AdvanceFloat();
        } else {
          this.LoadTexture(ctx, base_name.getData());
          while (!ctx.AdvanceFloatOptional(P(this, "Duration"))) {
            ctx.AdvanceRequired$rStdStrBuf$i32(token_name, 0 /*TOKEN_IDTF*/);
            this.LoadTexture(ctx, token_name.getData());
          }
        }
      } else if (token_name.op_eq$pi8(S("tex_address_mode"))) {
        this.TexAddressMode = ctx.AdvanceEnum$10($oat($.TexAddressModeEnumerators, 0));
      } else if (token_name.op_eq$pi8(S("tex_border_colour"))) {
        ctx.AdvanceColor(true, P(this.TexBorderColor, 0));
      } else if (token_name.op_eq$pi8(S("filtering"))) {
        ctx.AdvanceEnums$2($oat($.FilteringEnumerators, 0), $oat($.FilteringShortcuts, 0), P(this.Filtering, 0));
        if (this.Filtering[0] === 0 || this.Filtering[1] === 0) {
          ctx.Error_(new $.StdCopyStrBuf().init$pi8$b(S("'none' is only valid for the mip filter")));
        }
        if (this.Filtering[2] === 3) {
          ctx.Error_(new $.StdCopyStrBuf().init$pi8$b(S("'anisotropic' is not a valid mip filter")));
        }
      } else if (token_name.op_eq$pi8(S("colour_op"))) {
        let ColorOp = ctx.AdvanceEnum$4($oat($.BlendOpEnumerators, 0));
        switch (ColorOp) {
          case 0:
            this.ColorOpEx = 0 /*BOX_Source1*/;
            break;
          case 1:
            this.ColorOpEx = 5 /*BOX_Add*/;
            break;
          case 2:
            this.ColorOpEx = 2 /*BOX_Modulate*/;
            break;
          case 3:
            this.ColorOpEx = 10 /*BOX_BlendTextureAlpha*/;
            break;
        }
        this.ColorOpSources[0] = 1 /*BOS_Texture*/;
        this.ColorOpSources[1] = 0 /*BOS_Current*/;
      } else if (token_name.op_eq$pi8(S("colour_op_ex"))) {
        this.ColorOpEx = ctx.AdvanceEnum$5($oat($.BlendOpExEnumerators, 0));
        this.ColorOpSources[0] = ctx.AdvanceEnum$9($oat($.BlendOpSourceEnumerators, 0));
        this.ColorOpSources[1] = ctx.AdvanceEnum$9($oat($.BlendOpSourceEnumerators, 0));
        if (this.ColorOpEx === 12) {
          this.ColorOpManualFactor = ctx.AdvanceFloat();
        }
        if (this.ColorOpSources[0] === 5) {
          ctx.AdvanceColor(false, P(this.ColorOpManualColor1, 0));
        }
        if (this.ColorOpSources[1] === 5) {
          ctx.AdvanceColor(false, P(this.ColorOpManualColor2, 0));
        }
      } else if (token_name.op_eq$pi8(S("alpha_op_ex"))) {
        this.AlphaOpEx = ctx.AdvanceEnum$5($oat($.BlendOpExEnumerators, 0));
        this.AlphaOpSources[0] = ctx.AdvanceEnum$9($oat($.BlendOpSourceEnumerators, 0));
        this.AlphaOpSources[1] = ctx.AdvanceEnum$9($oat($.BlendOpSourceEnumerators, 0));
        if (this.AlphaOpEx === 12) {
          this.AlphaOpManualFactor = ctx.AdvanceFloat();
        }
        if (this.AlphaOpSources[0] === 5) {
          this.AlphaOpManualAlpha1 = ctx.AdvanceFloat();
        }
        if (this.AlphaOpSources[1] === 5) {
          this.AlphaOpManualAlpha2 = ctx.AdvanceFloat();
        }
      } else if (token_name.op_eq$pi8(S("scroll"))) {
        let trans = new StdMeshMaterialTextureUnit$Transformation();
        trans.TransformType = 0 /*T_SCROLL*/;
        trans.$u1.Scroll.X = ctx.AdvanceFloat();
        trans.$u1.Scroll.Y = ctx.AdvanceFloat();
        $vpush(this.Transformations, trans.$clone());
      } else if (token_name.op_eq$pi8(S("scroll_anim"))) {
        let trans = new StdMeshMaterialTextureUnit$Transformation();
        trans.TransformType = 1 /*T_SCROLL_ANIM*/;
        trans.$u1.ScrollAnim.XSpeed = ctx.AdvanceFloat();
        trans.$u1.ScrollAnim.YSpeed = ctx.AdvanceFloat();
        $vpush(this.Transformations, trans.$clone());
      } else if (token_name.op_eq$pi8(S("rotate"))) {
        let trans = new StdMeshMaterialTextureUnit$Transformation();
        trans.TransformType = 2 /*T_ROTATE*/;
        trans.$u1.Rotate.Angle = ctx.AdvanceFloat();
        $vpush(this.Transformations, trans.$clone());
      } else if (token_name.op_eq$pi8(S("rotate_anim"))) {
        let trans = new StdMeshMaterialTextureUnit$Transformation();
        trans.TransformType = 3 /*T_ROTATE_ANIM*/;
        trans.$u1.RotateAnim.RevsPerSec = ctx.AdvanceFloat();
        $vpush(this.Transformations, trans.$clone());
      } else if (token_name.op_eq$pi8(S("scale"))) {
        let trans = new StdMeshMaterialTextureUnit$Transformation();
        trans.TransformType = 4 /*T_SCALE*/;
        trans.$u1.Scale.X = ctx.AdvanceFloat();
        trans.$u1.Scale.Y = ctx.AdvanceFloat();
        $vpush(this.Transformations, trans.$clone());
      } else if (token_name.op_eq$pi8(S("transform"))) {
        let trans = new StdMeshMaterialTextureUnit$Transformation();
        trans.TransformType = 5 /*T_TRANSFORM*/;
        $t1 = trans.$u1.Transform.M;
        for (let $i3 = 0; $i3 < $t1.length; $i3++) {
          const i = P($t1, $i3);
          i.a[i.o] = ctx.AdvanceFloat();
        }
        $vpush(this.Transformations, trans.$clone());
      } else if (token_name.op_eq$pi8(S("wave_xform"))) {
        let trans = new StdMeshMaterialTextureUnit$Transformation();
        trans.TransformType = 6 /*T_WAVE_XFORM*/;
        trans.$u1.WaveXForm.XForm = ctx.AdvanceEnum$8($oat($.XFormTypeEnumerators, 0));
        trans.$u1.WaveXForm.Wave = ctx.AdvanceEnum$7($oat($.WaveTypeEnumerators, 0));
        trans.$u1.WaveXForm.Base = ctx.AdvanceFloat();
        trans.$u1.WaveXForm.Frequency = ctx.AdvanceFloat();
        trans.$u1.WaveXForm.Phase = ctx.AdvanceFloat();
        trans.$u1.WaveXForm.Amplitude = ctx.AdvanceFloat();
        $vpush(this.Transformations, trans.$clone());
      } else {
        ctx.ErrorUnexpectedIdentifier(token_name);
      }
    }
    if (token !== 2) {
      ctx.Error_(new $.StdCopyStrBuf().init$pi8$b(S("'")).op_add$pi8(token_name.getData()).op_add$pi8(S("' unexpected")));
    }
  }

  HasTexture() {
    return !(this.Textures.length === 0);
  }

  GetNumTextures() {
    return this.Textures.length;
  }

  GetTexture(i) {
    return this.Textures[i].pTex.Texture;
  }

  HasFrameAnimation() {
    return this.Duration > Math.fround(0);
  }

  HasTexCoordAnimation() {
    return !(this.Transformations.length === 0);
  }

  $clone() { return new StdMeshMaterialTextureUnit().$assign(this); }
  $assign(o) {
    this.Name.$assign(o.Name);
    this.Duration = o.Duration;
    this.TexAddressMode = o.TexAddressMode;
    this.TexBorderColor = o.TexBorderColor.slice();
    this.Filtering = o.Filtering.slice();
    this.ColorOpEx = o.ColorOpEx;
    this.ColorOpSources = o.ColorOpSources.slice();
    this.ColorOpManualFactor = o.ColorOpManualFactor;
    this.ColorOpManualColor1 = o.ColorOpManualColor1.slice();
    this.ColorOpManualColor2 = o.ColorOpManualColor2.slice();
    this.AlphaOpEx = o.AlphaOpEx;
    this.AlphaOpSources = o.AlphaOpSources.slice();
    this.AlphaOpManualFactor = o.AlphaOpManualFactor;
    this.AlphaOpManualAlpha1 = o.AlphaOpManualAlpha1;
    this.AlphaOpManualAlpha2 = o.AlphaOpManualAlpha2;
    this.Transformations = o.Transformations.slice();
    this.Textures = o.Textures.slice();
    return this;
  }
}

export class StdMeshMaterialParserCtx {
  Line = 0;
  Script = null;
  Manager = null;
  FileName = new $.StdCopyStrBuf();
  Loader = null;

  init(manager, mat_script, filename, loader) {
    this.Line = 1;
    this.Script = mat_script;
    this.FileName = new $.StdCopyStrBuf().init$pi8$b(filename);
    this.Manager = manager;
    this.Loader = loader;
    return this;
  }

  SkipWhitespace() {
    while (c$isspace(this.Script.a[this.Script.o]) !== 0) {
      if (this.Script.a[this.Script.o] === 10) {
        this.Line = this.Line + 1 >>> 0;
      }
      this.Script = this.Script.add(1);
    }
    if (this.Script.a[this.Script.o] === 47) {
      if ($rd($padd(this.Script, 1)) === 47) {
        this.Script = this.Script.add(2);
        while (this.Script.a[this.Script.o] !== 10 && this.Script.a[this.Script.o] !== 0) {
          this.Script = this.Script.add(1);
        }
        this.SkipWhitespace();
      } else if (this.Script.a[this.Script.o] === 42) {
        for (this.Script = this.Script.add(2); this.Script.a[this.Script.o] !== 0; this.Script = this.Script.add(1)) {
          if (this.Script.a[this.Script.o] === 42 && $rd($padd(this.Script, 1)) === 47) {
            break;
          }
        }
        if (this.Script.a[this.Script.o] === 42) {
          this.Script = this.Script.add(2);
          this.SkipWhitespace();
        }
      }
    }
  }

  Peek(name) {
    this.SkipWhitespace();
    let before = this.Script;
    let tok = this.Advance(name);
    this.Script = before;
    return tok;
  }

  Advance(name) {
    this.SkipWhitespace();
    switch (this.Script.a[this.Script.o]) {
      case 0:
        name.Clear();
        return 4 /*TOKEN_EOF*/;
      case 123:
        this.Script = this.Script.add(1);
        $.StdStrBuf.prototype.op_assign$pi8.call(name, S("{"));
        return 1 /*TOKEN_BRACE_OPEN*/;
      case 125:
        this.Script = this.Script.add(1);
        $.StdStrBuf.prototype.op_assign$pi8.call(name, S("}"));
        return 2 /*TOKEN_BRACE_CLOSE*/;
      case 58:
        this.Script = this.Script.add(1);
        $.StdStrBuf.prototype.op_assign$pi8.call(name, S(":"));
        return 3 /*TOKEN_COLON*/;
      default:
        let begin = this.Script;
        do {
          this.Script = this.Script.add(1);
        } while (!(c$isspace(this.Script.a[this.Script.o]) !== 0) && this.Script.a[this.Script.o] !== 123 && this.Script.a[this.Script.o] !== 125 && this.Script.a[this.Script.o] !== 58);
        name.Copy$pi8$u64(begin, $u64n(this.Script.o - begin.o));
        return 0 /*TOKEN_IDTF*/;
    }
  }

  AdvanceNonEOF(name) {
    let token = this.Advance(name);
    if (token === 4) {
      this.Error_(new $.StdCopyStrBuf().init$pi8$b(S("Unexpected end of file")));
    }
    return token;
  }

  AdvanceRequired$rStdStrBuf$i32(name, expect) {
    let token = this.AdvanceNonEOF(name);
    if (token !== expect) {
      this.Error_(new $.StdCopyStrBuf().init$pi8$b(S("'")).op_add$StdStrBuf(name).op_add$pi8(S("' unexpected")));
    }
    return token;
  }

  AdvanceRequired$rStdStrBuf$i32$i32(name, expect1, expect2) {
    let token = this.AdvanceNonEOF(name);
    if (token !== expect1 && token !== expect2) {
      this.Error_(new $.StdStrBuf().init$pi8$b(S("'")).op_add$StdStrBuf(name).op_add$pi8(S("' unexpected")));
    }
    return token;
  }

  AdvanceInt() {
    let buf = new $.StdStrBuf();
    this.AdvanceRequired$rStdStrBuf$i32(buf, 0 /*TOKEN_IDTF*/);
    const i = [0];
    if (new IStringStream(StdString.of(buf.getData())).read(P(i, 0), "i32").fail()) {
      this.Error_(new $.StdStrBuf().init$pi8$b(S("Integer value expected")));
    }
    return i[0];
  }

  AdvanceIntOptional(value) {
    let buf = new $.StdStrBuf();
    let tok = this.Peek(buf);
    if (tok === 0 && c$isdigit(buf.op_index(0)) !== 0) {
      value.a[value.o] = this.AdvanceInt();
      return true;
    }
    return false;
  }

  AdvanceFloat() {
    let buf = new $.StdStrBuf();
    this.AdvanceRequired$rStdStrBuf$i32(buf, 0 /*TOKEN_IDTF*/);
    const f = [0];
    if (new IStringStream(StdString.of(buf.getData())).read(P(f, 0), "f32").fail()) {
      this.Error_(new $.StdStrBuf().init$pi8$b(S("Floating point value expected")));
    }
    return f[0];
  }

  AdvanceFloatOptional(value) {
    let buf = new $.StdStrBuf();
    let tok = this.Peek(buf);
    if (tok === 0 && c$isdigit(buf.op_index(0)) !== 0) {
      value.a[value.o] = this.AdvanceFloat();
      return true;
    }
    return false;
  }

  AdvanceColor(with_alpha, Color) {
    Color.a[Color.o + 0] = this.AdvanceFloat();
    Color.a[Color.o + 1] = this.AdvanceFloat();
    Color.a[Color.o + 2] = this.AdvanceFloat();
    if (with_alpha) {
      this.AdvanceFloatOptional($padd(Color, 3));
    }
  }

  AdvanceBoolean() {
    let buf = new $.StdCopyStrBuf();
    this.AdvanceRequired$rStdStrBuf$i32(buf, 0 /*TOKEN_IDTF*/);
    if (buf.op_eq$pi8(S("on"))) {
      return true;
    }
    if (buf.op_eq$pi8(S("off"))) {
      return false;
    }
    this.Error_(new $.StdCopyStrBuf().init$pi8$b(S("Expected either 'on' or 'off', but not '")).op_add$StdStrBuf(buf).op_add$pi8(S("'")));
    return false;
  }

  AdvanceEnum$11(enumerators) {
    let buf = new $.StdCopyStrBuf();
    this.AdvanceRequired$rStdStrBuf$i32(buf, 0 /*TOKEN_IDTF*/);
    for (let cur = enumerators; cur.Name != null; cur = $oadd(cur, 1)) {
      if (buf.op_eq$pi8(cur.Name)) {
        return cur.Value;
      }
    }
    this.ErrorUnexpectedIdentifier(buf);
    return 0;
  }

  AdvanceEnum$10(enumerators) {
    let buf = new $.StdCopyStrBuf();
    this.AdvanceRequired$rStdStrBuf$i32(buf, 0 /*TOKEN_IDTF*/);
    for (let cur = enumerators; cur.Name != null; cur = $oadd(cur, 1)) {
      if (buf.op_eq$pi8(cur.Name)) {
        return cur.Value;
      }
    }
    this.ErrorUnexpectedIdentifier(buf);
    return 0;
  }

  AdvanceEnum$4(enumerators) {
    let buf = new $.StdCopyStrBuf();
    this.AdvanceRequired$rStdStrBuf$i32(buf, 0 /*TOKEN_IDTF*/);
    for (let cur = enumerators; cur.Name != null; cur = $oadd(cur, 1)) {
      if (buf.op_eq$pi8(cur.Name)) {
        return cur.Value;
      }
    }
    this.ErrorUnexpectedIdentifier(buf);
    return 0;
  }

  AdvanceEnum$5(enumerators) {
    let buf = new $.StdCopyStrBuf();
    this.AdvanceRequired$rStdStrBuf$i32(buf, 0 /*TOKEN_IDTF*/);
    for (let cur = enumerators; cur.Name != null; cur = $oadd(cur, 1)) {
      if (buf.op_eq$pi8(cur.Name)) {
        return cur.Value;
      }
    }
    this.ErrorUnexpectedIdentifier(buf);
    return 0;
  }

  AdvanceEnum$9(enumerators) {
    let buf = new $.StdCopyStrBuf();
    this.AdvanceRequired$rStdStrBuf$i32(buf, 0 /*TOKEN_IDTF*/);
    for (let cur = enumerators; cur.Name != null; cur = $oadd(cur, 1)) {
      if (buf.op_eq$pi8(cur.Name)) {
        return cur.Value;
      }
    }
    this.ErrorUnexpectedIdentifier(buf);
    return 0;
  }

  AdvanceEnum$8(enumerators) {
    let buf = new $.StdCopyStrBuf();
    this.AdvanceRequired$rStdStrBuf$i32(buf, 0 /*TOKEN_IDTF*/);
    for (let cur = enumerators; cur.Name != null; cur = $oadd(cur, 1)) {
      if (buf.op_eq$pi8(cur.Name)) {
        return cur.Value;
      }
    }
    this.ErrorUnexpectedIdentifier(buf);
    return 0;
  }

  AdvanceEnum$7(enumerators) {
    let buf = new $.StdCopyStrBuf();
    this.AdvanceRequired$rStdStrBuf$i32(buf, 0 /*TOKEN_IDTF*/);
    for (let cur = enumerators; cur.Name != null; cur = $oadd(cur, 1)) {
      if (buf.op_eq$pi8(cur.Name)) {
        return cur.Value;
      }
    }
    this.ErrorUnexpectedIdentifier(buf);
    return 0;
  }

  AdvanceEnum$2(enumerators) {
    let buf = new $.StdCopyStrBuf();
    this.AdvanceRequired$rStdStrBuf$i32(buf, 0 /*TOKEN_IDTF*/);
    for (let cur = enumerators; cur.Name != null; cur = $oadd(cur, 1)) {
      if (buf.op_eq$pi8(cur.Name)) {
        return cur.Value;
      }
    }
    this.ErrorUnexpectedIdentifier(buf);
    return 0;
  }

  AdvanceEnum$3(enumerators) {
    let buf = new $.StdCopyStrBuf();
    this.AdvanceRequired$rStdStrBuf$i32(buf, 0 /*TOKEN_IDTF*/);
    for (let cur = enumerators; cur.Name != null; cur = $oadd(cur, 1)) {
      if (buf.op_eq$pi8(cur.Name)) {
        return cur.Value;
      }
    }
    this.ErrorUnexpectedIdentifier(buf);
    return 0;
  }

  AdvanceEnum$6(enumerators) {
    let buf = new $.StdCopyStrBuf();
    this.AdvanceRequired$rStdStrBuf$i32(buf, 0 /*TOKEN_IDTF*/);
    for (let cur = enumerators; cur.Name != null; cur = $oadd(cur, 1)) {
      if (buf.op_eq$pi8(cur.Name)) {
        return cur.Value;
      }
    }
    this.ErrorUnexpectedIdentifier(buf);
    return 0;
  }

  AdvanceEnum(enumerators) {
    let buf = new $.StdCopyStrBuf();
    this.AdvanceRequired$rStdStrBuf$i32(buf, 0 /*TOKEN_IDTF*/);
    for (let cur = enumerators; cur.Name != null; cur = $oadd(cur, 1)) {
      if (buf.op_eq$pi8(cur.Name)) {
        return cur.Value;
      }
    }
    this.ErrorUnexpectedIdentifier(buf);
    return 0;
  }

  AdvanceEnums$2(enumerators, shortcuts, enums) {
    let buf = new $.StdCopyStrBuf();
    this.AdvanceRequired$rStdStrBuf$i32(buf, 0 /*TOKEN_IDTF*/);
    let cenum = null;
    let cshort = null;
    for (cenum = enumerators; cenum.Name != null; cenum = $oadd(cenum, 1)) {
      if (buf.op_eq$pi8(cenum.Name)) {
        break;
      }
    }
    for (cshort = shortcuts; cshort.Name != null; cshort = $oadd(cshort, 1)) {
      if (buf.op_eq$pi8(cshort.Name)) {
        break;
      }
    }
    if (cenum.Name == null && cshort.Name == null) {
      this.ErrorUnexpectedIdentifier(buf);
    } else if (cenum.Name == null && cshort.Name != null) {
      for (let i = 0; i < 3; i = i + 1 | 0) {
        enums.a[enums.o + i] = cshort.Values[i];
      }
    } else if (cenum.Name != null && (cshort.Name == null || false)) {
      enums.a[enums.o + 0] = cenum.Value;
      for (let i = 1; i < 3; i = i + 1 | 0) {
        enums.a[enums.o + i] = this.AdvanceEnum$6(enumerators);
      }
    } else {
      let cenum2 = null;
      let tok = this.Peek(buf);
      if (tok === 0) {
        for (cenum2 = enumerators; cenum2.Name != null; cenum2 = $oadd(cenum2, 1)) {
          if (buf.op_eq$pi8(cenum2.Name)) {
            break;
          }
        }
      }
      if (cenum2 != null && cenum2.Name != null) {
        enums.a[enums.o + 0] = cenum.Value;
        for (let i = 1; i < 3; i = i + 1 | 0) {
          enums.a[enums.o + i] = this.AdvanceEnum$6(enumerators);
        }
      } else {
        for (let i = 0; i < 3; i = i + 1 | 0) {
          enums.a[enums.o + i] = cshort.Values[i];
        }
      }
    }
  }

  AdvanceEnums(enumerators, shortcuts, enums) {
    let buf = new $.StdCopyStrBuf();
    this.AdvanceRequired$rStdStrBuf$i32(buf, 0 /*TOKEN_IDTF*/);
    let cenum = null;
    let cshort = null;
    for (cenum = enumerators; cenum.Name != null; cenum = $oadd(cenum, 1)) {
      if (buf.op_eq$pi8(cenum.Name)) {
        break;
      }
    }
    for (cshort = shortcuts; cshort.Name != null; cshort = $oadd(cshort, 1)) {
      if (buf.op_eq$pi8(cshort.Name)) {
        break;
      }
    }
    if (cenum.Name == null && cshort.Name == null) {
      this.ErrorUnexpectedIdentifier(buf);
    } else if (cenum.Name == null && cshort.Name != null) {
      for (let i = 0; i < 2; i = i + 1 | 0) {
        enums.a[enums.o + i] = cshort.Values[i];
      }
    } else if (cenum.Name != null && (cshort.Name == null || false)) {
      enums.a[enums.o + 0] = cenum.Value;
      for (let i = 1; i < 2; i = i + 1 | 0) {
        enums.a[enums.o + i] = this.AdvanceEnum(enumerators);
      }
    } else {
      let cenum2 = null;
      let tok = this.Peek(buf);
      if (tok === 0) {
        for (cenum2 = enumerators; cenum2.Name != null; cenum2 = $oadd(cenum2, 1)) {
          if (buf.op_eq$pi8(cenum2.Name)) {
            break;
          }
        }
      }
      if (cenum2 != null && cenum2.Name != null) {
        enums.a[enums.o + 0] = cenum.Value;
        for (let i = 1; i < 2; i = i + 1 | 0) {
          enums.a[enums.o + i] = this.AdvanceEnum(enumerators);
        }
      } else {
        for (let i = 0; i < 2; i = i + 1 | 0) {
          enums.a[enums.o + i] = cshort.Values[i];
        }
      }
    }
  }

  Error_(message) {
    $throw(new StdMeshMaterialError().init(message, this.FileName.getData(), this.Line));
  }

  ErrorUnexpectedIdentifier(identifier) {
    this.Error_(new $.StdCopyStrBuf().init$pi8$b(S("Unexpected identifier: '")).op_add$StdStrBuf(identifier).op_add$pi8(S("'")));
  }

  WarningNotSupported(identifier) {
    $.DebugLogF(S("%s:%d: Warning: \"%s\" is not supported!"), this.FileName.getData(), this.Line, identifier);
  }

  $clone() { return new StdMeshMaterialParserCtx().$assign(this); }
  $assign(o) {
    this.Line = o.Line;
    this.Script = o.Script;
    this.Manager = o.Manager;
    this.FileName.$assign(o.FileName);
    this.Loader = o.Loader;
    return this;
  }
}

export class StdMeshMaterialSubLoader {
  static $layout = [["CurIndex", 0, "u32", 0]];
  static $size = 4;
  CurIndex = 0;

  Load$3(ctx, vec) {
    let indices = [];
    let token_name = new $.StdCopyStrBuf();
    let tok = ctx.AdvanceRequired$rStdStrBuf$i32$i32(token_name, 0 /*TOKEN_IDTF*/, 1 /*TOKEN_BRACE_OPEN*/);
    if (tok === 1) {
      indices.push(this.CurIndex);
      0;
      if (this.CurIndex === vec.length) {
        $vpush(vec, new StdMeshMaterialTextureUnit().init());
        vec[vec.length - 1].Name.Format(S("%u"), this.CurIndex);
      }
      this.CurIndex = this.CurIndex + 1 >>> 0;
    } else {
      let size_before = indices.length >>> 0;
      for (let i = 0; i < vec.length; i = i + 1 >>> 0) {
        if ($.SWildcardMatchEx(vec[i].Name.getData(), token_name.getData())) {
          indices.push(i);
        }
      }
      if (indices.length === size_before) {
        if (c$strchr(token_name.getData(), 42) == null && c$strchr(token_name.getData(), 63) == null) {
          indices.push(vec.length >>> 0);
          $vpush(vec, new StdMeshMaterialTextureUnit().init());
          vec[vec.length - 1].Name.$assign(token_name);
        }
      }
      ctx.AdvanceRequired$rStdStrBuf$i32(token_name, 1 /*TOKEN_BRACE_OPEN*/);
    }
    if (indices.length === 0) {
      new StdMeshMaterialTextureUnit().init().Load(ctx);
    } else {
      for (let i = 0; i < indices.length - 1; i = i + 1 >>> 0) {
        let old_line = ctx.Line;
        let old_pos = ctx.Script;
        vec[indices[i]].Load(ctx);
        ctx.Line = old_line;
        ctx.Script = old_pos;
      }
      vec[indices[indices.length - 1]].Load(ctx);
    }
  }

  Load(ctx, vec) {
    let indices = [];
    let token_name = new $.StdCopyStrBuf();
    let tok = ctx.AdvanceRequired$rStdStrBuf$i32$i32(token_name, 0 /*TOKEN_IDTF*/, 1 /*TOKEN_BRACE_OPEN*/);
    if (tok === 1) {
      indices.push(this.CurIndex);
      0;
      if (this.CurIndex === vec.length) {
        $vpush(vec, new StdMeshMaterialPass().init());
        vec[vec.length - 1].Name.Format(S("%u"), this.CurIndex);
      }
      this.CurIndex = this.CurIndex + 1 >>> 0;
    } else {
      let size_before = indices.length >>> 0;
      for (let i = 0; i < vec.length; i = i + 1 >>> 0) {
        if ($.SWildcardMatchEx(vec[i].Name.getData(), token_name.getData())) {
          indices.push(i);
        }
      }
      if (indices.length === size_before) {
        if (c$strchr(token_name.getData(), 42) == null && c$strchr(token_name.getData(), 63) == null) {
          indices.push(vec.length >>> 0);
          $vpush(vec, new StdMeshMaterialPass().init());
          vec[vec.length - 1].Name.$assign(token_name);
        }
      }
      ctx.AdvanceRequired$rStdStrBuf$i32(token_name, 1 /*TOKEN_BRACE_OPEN*/);
    }
    if (indices.length === 0) {
      new StdMeshMaterialPass().init().Load(ctx);
    } else {
      for (let i = 0; i < indices.length - 1; i = i + 1 >>> 0) {
        let old_line = ctx.Line;
        let old_pos = ctx.Script;
        vec[indices[i]].Load(ctx);
        ctx.Line = old_line;
        ctx.Script = old_pos;
      }
      vec[indices[indices.length - 1]].Load(ctx);
    }
  }

  Load$2(ctx, vec) {
    let indices = [];
    let token_name = new $.StdCopyStrBuf();
    let tok = ctx.AdvanceRequired$rStdStrBuf$i32$i32(token_name, 0 /*TOKEN_IDTF*/, 1 /*TOKEN_BRACE_OPEN*/);
    if (tok === 1) {
      indices.push(this.CurIndex);
      0;
      if (this.CurIndex === vec.length) {
        $vpush(vec, new StdMeshMaterialTechnique().init());
        vec[vec.length - 1].Name.Format(S("%u"), this.CurIndex);
      }
      this.CurIndex = this.CurIndex + 1 >>> 0;
    } else {
      let size_before = indices.length >>> 0;
      for (let i = 0; i < vec.length; i = i + 1 >>> 0) {
        if ($.SWildcardMatchEx(vec[i].Name.getData(), token_name.getData())) {
          indices.push(i);
        }
      }
      if (indices.length === size_before) {
        if (c$strchr(token_name.getData(), 42) == null && c$strchr(token_name.getData(), 63) == null) {
          indices.push(vec.length >>> 0);
          $vpush(vec, new StdMeshMaterialTechnique().init());
          vec[vec.length - 1].Name.$assign(token_name);
        }
      }
      ctx.AdvanceRequired$rStdStrBuf$i32(token_name, 1 /*TOKEN_BRACE_OPEN*/);
    }
    if (indices.length === 0) {
      new StdMeshMaterialTechnique().init().Load(ctx);
    } else {
      for (let i = 0; i < indices.length - 1; i = i + 1 >>> 0) {
        let old_line = ctx.Line;
        let old_pos = ctx.Script;
        vec[indices[i]].Load(ctx);
        ctx.Line = old_line;
        ctx.Script = old_pos;
      }
      vec[indices[indices.length - 1]].Load(ctx);
    }
  }

  $clone() { return new StdMeshMaterialSubLoader().$assign(this); }
  $assign(o) {
    this.CurIndex = o.CurIndex;
    return this;
  }
}

export class StdMeshMaterialTextureUnit$Transformation {
  static $layout = [["TransformType", 0, "i32", 0], ["$u1.Scroll.X", 4, "f32", 0], ["$u1.Scroll.Y", 8, "f32", 0], ["$u1.ScrollAnim.XSpeed", 12, "f32", 0], ["$u1.ScrollAnim.YSpeed", 16, "f32", 0], ["$u1.Rotate.Angle", 20, "f32", 0], ["$u1.RotateAnim.RevsPerSec", 24, "f32", 0], ["$u1.Scale.X", 28, "f32", 0], ["$u1.Scale.Y", 32, "f32", 0], ["$u1.Transform.M", 36, "f32", 16], ["$u1.WaveXForm.XForm", 100, "i32", 0], ["$u1.WaveXForm.Wave", 104, "i32", 0], ["$u1.WaveXForm.Base", 108, "f32", 0], ["$u1.WaveXForm.Frequency", 112, "f32", 0], ["$u1.WaveXForm.Phase", 116, "f32", 0], ["$u1.WaveXForm.Amplitude", 120, "f32", 0]];
  static $size = 124;
  TransformType = 0;
  $u1 = new StdMeshMaterialTextureUnit$Transformation$$anon1();

  GetScrollX(t) {
    0;
    return this.$u1.ScrollAnim.XSpeed * t;
  }

  GetScrollY(t) {
    0;
    return this.$u1.ScrollAnim.YSpeed * t;
  }

  GetRotate(t) {
    0;
    return c$fmod(this.$u1.RotateAnim.RevsPerSec * t, 1) * 360;
  }

  GetWaveXForm(t) {
    0;
    let val = c$fmod(this.$u1.WaveXForm.Frequency * t + this.$u1.WaveXForm.Phase, 1);
    switch (this.$u1.WaveXForm.Wave) {
      case 0:
        return this.$u1.WaveXForm.Base + this.$u1.WaveXForm.Amplitude * 0.5 * (1 + c$sin(val * 2 * 3.141592653589793));
      case 1:
        if (val < 0.5) {
          return this.$u1.WaveXForm.Base + this.$u1.WaveXForm.Amplitude * 2 * val;
        } else {
          return this.$u1.WaveXForm.Base + this.$u1.WaveXForm.Amplitude * 2 * (1 - val);
        }
      case 2:
        if (val < 0.5) {
          return this.$u1.WaveXForm.Base;
        } else {
          return Math.fround(this.$u1.WaveXForm.Base + this.$u1.WaveXForm.Amplitude);
        }
      case 3:
        return this.$u1.WaveXForm.Base + this.$u1.WaveXForm.Amplitude * val;
      case 4:
        return this.$u1.WaveXForm.Base + this.$u1.WaveXForm.Amplitude * (1 - val);
      default:
        0;
        return 0;
    }
  }

  $clone() { return new StdMeshMaterialTextureUnit$Transformation().$assign(this); }
  $assign(o) {
    this.TransformType = o.TransformType;
    this.$u1.$assign(o.$u1);
    return this;
  }
}

export class StdMeshMaterialTextureUnit$Transformation$$anon1 {
  $v = 0;
  get Scroll() { const v = this.$v; return v instanceof StdMeshMaterialTextureUnit$Transformation$$anon1$$anon1 ? v : (this.$v = new StdMeshMaterialTextureUnit$Transformation$$anon1$$anon1()); }
  set Scroll(v) { this.$v = v.$clone(); }
  get ScrollAnim() { const v = this.$v; return v instanceof StdMeshMaterialTextureUnit$Transformation$$anon1$$anon2 ? v : (this.$v = new StdMeshMaterialTextureUnit$Transformation$$anon1$$anon2()); }
  set ScrollAnim(v) { this.$v = v.$clone(); }
  get Rotate() { const v = this.$v; return v instanceof StdMeshMaterialTextureUnit$Transformation$$anon1$$anon3 ? v : (this.$v = new StdMeshMaterialTextureUnit$Transformation$$anon1$$anon3()); }
  set Rotate(v) { this.$v = v.$clone(); }
  get RotateAnim() { const v = this.$v; return v instanceof StdMeshMaterialTextureUnit$Transformation$$anon1$$anon4 ? v : (this.$v = new StdMeshMaterialTextureUnit$Transformation$$anon1$$anon4()); }
  set RotateAnim(v) { this.$v = v.$clone(); }
  get Scale() { const v = this.$v; return v instanceof StdMeshMaterialTextureUnit$Transformation$$anon1$$anon5 ? v : (this.$v = new StdMeshMaterialTextureUnit$Transformation$$anon1$$anon5()); }
  set Scale(v) { this.$v = v.$clone(); }
  get Transform() { const v = this.$v; return v instanceof StdMeshMaterialTextureUnit$Transformation$$anon1$$anon6 ? v : (this.$v = new StdMeshMaterialTextureUnit$Transformation$$anon1$$anon6()); }
  set Transform(v) { this.$v = v.$clone(); }
  get WaveXForm() { const v = this.$v; return v instanceof StdMeshMaterialTextureUnit$Transformation$$anon1$$anon7 ? v : (this.$v = new StdMeshMaterialTextureUnit$Transformation$$anon1$$anon7()); }
  set WaveXForm(v) { this.$v = v.$clone(); }
  $clone() { const u = new StdMeshMaterialTextureUnit$Transformation$$anon1(); u.$v = this.$v && this.$v.$clone ? this.$v.$clone() : this.$v; return u; }
  $assign(o) { this.$v = o.$v && o.$v.$clone ? o.$v.$clone() : o.$v; return this; }
}

export class StdMeshMaterialTextureUnit$Transformation$$anon1$$anon1 {
  X = 0;
  Y = 0;

  $clone() { return new StdMeshMaterialTextureUnit$Transformation$$anon1$$anon1().$assign(this); }
  $assign(o) {
    this.X = o.X;
    this.Y = o.Y;
    return this;
  }
}

export class StdMeshMaterialTextureUnit$Transformation$$anon1$$anon2 {
  XSpeed = 0;
  YSpeed = 0;

  $clone() { return new StdMeshMaterialTextureUnit$Transformation$$anon1$$anon2().$assign(this); }
  $assign(o) {
    this.XSpeed = o.XSpeed;
    this.YSpeed = o.YSpeed;
    return this;
  }
}

export class StdMeshMaterialTextureUnit$Transformation$$anon1$$anon3 {
  Angle = 0;

  $clone() { return new StdMeshMaterialTextureUnit$Transformation$$anon1$$anon3().$assign(this); }
  $assign(o) {
    this.Angle = o.Angle;
    return this;
  }
}

export class StdMeshMaterialTextureUnit$Transformation$$anon1$$anon4 {
  RevsPerSec = 0;

  $clone() { return new StdMeshMaterialTextureUnit$Transformation$$anon1$$anon4().$assign(this); }
  $assign(o) {
    this.RevsPerSec = o.RevsPerSec;
    return this;
  }
}

export class StdMeshMaterialTextureUnit$Transformation$$anon1$$anon5 {
  X = 0;
  Y = 0;

  $clone() { return new StdMeshMaterialTextureUnit$Transformation$$anon1$$anon5().$assign(this); }
  $assign(o) {
    this.X = o.X;
    this.Y = o.Y;
    return this;
  }
}

export class StdMeshMaterialTextureUnit$Transformation$$anon1$$anon6 {
  M = new Float32Array(16);

  $clone() { return new StdMeshMaterialTextureUnit$Transformation$$anon1$$anon6().$assign(this); }
  $assign(o) {
    this.M = o.M.slice();
    return this;
  }
}

export class StdMeshMaterialTextureUnit$Transformation$$anon1$$anon7 {
  XForm = 0;
  Wave = 0;
  Base = 0;
  Frequency = 0;
  Phase = 0;
  Amplitude = 0;

  $clone() { return new StdMeshMaterialTextureUnit$Transformation$$anon1$$anon7().$assign(this); }
  $assign(o) {
    this.XForm = o.XForm;
    this.Wave = o.Wave;
    this.Base = o.Base;
    this.Frequency = o.Frequency;
    this.Phase = o.Phase;
    this.Amplitude = o.Amplitude;
    return this;
  }
}

export class StdMeshMaterialTextureUnit$Tex {
  RefCount = 0;
  Surf = null;
  Texture = null;

  init(Surface) {
    this.RefCount = 1;
    this.Surf = Surface;
    this.Texture = Surface.texture;
    return this;
  }

  $dtor() {
    0;
    $delete(this.Surf);
  }

  $clone() { return new StdMeshMaterialTextureUnit$Tex().$assign(this); }
  $assign(o) {
    this.RefCount = o.RefCount;
    this.Surf = o.Surf;
    this.Texture = o.Texture;
    return this;
  }
}

export class StdMeshMaterialTextureUnit$TexPtr {
  pTex = null;

  init(Surface) {
    this.pTex = new StdMeshMaterialTextureUnit$Tex().init(Surface);
    return this;
  }

  $dtor() {
    if (!((this.pTex.RefCount = this.pTex.RefCount - 1 >>> 0) !== 0)) {
      $delete(this.pTex);
    }
  }

  $copy(other) {
    this.pTex = other.pTex;
    this.pTex.RefCount = this.pTex.RefCount + 1 >>> 0;
    return this;
  }
  $clone() { return new StdMeshMaterialTextureUnit$TexPtr().$copy(this); }
  $assign(other) {
    if (other === this) {
      return this;
    }
    if (!((this.pTex.RefCount = this.pTex.RefCount - 1 >>> 0) !== 0)) {
      $delete(this.pTex);
    }
    this.pTex = other.pTex;
    this.pTex.RefCount = this.pTex.RefCount + 1 >>> 0;
    return this;
  }
}

export class StdMeshMaterialPass {
  Name = new $.StdCopyStrBuf();
  TextureUnits = [];
  Ambient = new Float32Array(4);
  Diffuse = new Float32Array(4);
  Specular = new Float32Array(4);
  Emissive = new Float32Array(4);
  Shininess = 0;
  DepthCheck = true;
  DepthWrite = true;
  CullHardware = 0 /*CH_Clockwise*/;
  SceneBlendFactors = new Int32Array(2);
  AlphaRejectionFunction = 0;
  AlphaRejectionValue = 0;
  AlphaToCoverage = false;
  FragmentShader = new StdMeshMaterialPass$ShaderInstance().None();
  VertexShader = new StdMeshMaterialPass$ShaderInstance().None();
  GeometryShader = new StdMeshMaterialPass$ShaderInstance().None();
  Program = null;

  init() {
    this.Name = new $.StdCopyStrBuf();
    this.TextureUnits = [];
    this.DepthCheck = true;
    this.DepthWrite = true;
    this.CullHardware = 0 /*CH_Clockwise*/;
    this.FragmentShader = new StdMeshMaterialPass$ShaderInstance().None();
    this.VertexShader = new StdMeshMaterialPass$ShaderInstance().None();
    this.GeometryShader = new StdMeshMaterialPass$ShaderInstance().None();
    this.Program = null;
    this.Ambient[0] = this.Ambient[1] = this.Ambient[2] = 1;
    this.Ambient[3] = 1;
    this.Diffuse[0] = this.Diffuse[1] = this.Diffuse[2] = 1;
    this.Diffuse[3] = 1;
    this.Specular[0] = this.Specular[1] = this.Specular[2] = 0;
    this.Specular[3] = 0;
    this.Emissive[0] = this.Emissive[1] = this.Emissive[2] = 0;
    this.Emissive[3] = 0;
    this.Shininess = 0;
    this.SceneBlendFactors[0] = 0 /*SB_One*/;
    this.SceneBlendFactors[1] = 1 /*SB_Zero*/;
    this.AlphaRejectionFunction = 1 /*DF_AlwaysPass*/;
    this.AlphaRejectionValue = 0;
    this.AlphaToCoverage = false;
    this.VertexShader.Shader = this.FragmentShader.Shader = this.GeometryShader.Shader = null;
    return this;
  }

  Load(ctx) {
    let token = 0;
    let token_name = new $.StdCopyStrBuf();
    let texture_unit_loader = new StdMeshMaterialSubLoader();
    while ((token = ctx.AdvanceNonEOF(token_name)) === 0) {
      if (token_name.op_eq$pi8(S("texture_unit"))) {
        texture_unit_loader.Load$3(ctx, this.TextureUnits);
      } else if (token_name.op_eq$pi8(S("ambient"))) {
        ctx.AdvanceColor(true, P(this.Ambient, 0));
      } else if (token_name.op_eq$pi8(S("diffuse"))) {
        ctx.AdvanceColor(true, P(this.Diffuse, 0));
      } else if (token_name.op_eq$pi8(S("specular"))) {
        this.Specular[0] = ctx.AdvanceFloat();
        this.Specular[1] = ctx.AdvanceFloat();
        this.Specular[2] = ctx.AdvanceFloat();
        let specular3 = ctx.AdvanceFloat();
        const shininess = [0];
        if (ctx.AdvanceFloatOptional(P(shininess, 0))) {
          this.Specular[3] = specular3;
          this.Shininess = shininess[0];
        } else {
          this.Shininess = specular3;
        }
      } else if (token_name.op_eq$pi8(S("emissive"))) {
        ctx.AdvanceColor(true, P(this.Emissive, 0));
      } else if (token_name.op_eq$pi8(S("depth_check"))) {
        this.DepthCheck = ctx.AdvanceBoolean();
      } else if (token_name.op_eq$pi8(S("depth_write"))) {
        this.DepthWrite = ctx.AdvanceBoolean();
      } else if (token_name.op_eq$pi8(S("cull_hardware"))) {
        this.CullHardware = ctx.AdvanceEnum$2($oat($.CullHardwareEnumerators, 0));
      } else if (token_name.op_eq$pi8(S("scene_blend"))) {
        ctx.AdvanceEnums($oat($.SceneBlendEnumerators, 0), $oat($.SceneBlendShortcuts, 0), P(this.SceneBlendFactors, 0));
      } else if (token_name.op_eq$pi8(S("scene_blend_op"))) {
        let op = new $.StdStrBuf();
        ctx.AdvanceRequired$rStdStrBuf$i32(op, 0 /*TOKEN_IDTF*/);
        ctx.WarningNotSupported(token_name.getData());
      } else if (token_name.op_eq$pi8(S("alpha_rejection"))) {
        this.AlphaRejectionFunction = ctx.AdvanceEnum$3($oat($.DepthFunctionEnumerators, 0));
        if (this.AlphaRejectionFunction !== 0 && this.AlphaRejectionFunction !== 1) {
          this.AlphaRejectionValue = Math.fround(ctx.AdvanceFloat() / 255);
        }
      } else if (token_name.op_eq$pi8(S("alpha_to_coverage"))) {
        this.AlphaToCoverage = ctx.AdvanceBoolean();
      } else if (token_name.op_eq$pi8(S("colour_write"))) {
        ctx.AdvanceBoolean();
        ctx.WarningNotSupported(S("colour_write"));
      } else if (token_name.op_eq$pi8(S("depth_func"))) {
        let func = new $.StdStrBuf();
        ctx.AdvanceRequired$rStdStrBuf$i32(func, 0 /*TOKEN_IDTF*/);
        ctx.WarningNotSupported(token_name.getData());
      } else if (token_name.op_eq$pi8(S("illumination_stage"))) {
        ctx.WarningNotSupported(token_name.getData());
      } else if (token_name.op_eq$pi8(S("light_clip_planes"))) {
        ctx.AdvanceBoolean();
        ctx.WarningNotSupported(token_name.getData());
      } else if (token_name.op_eq$pi8(S("light_scissor"))) {
        ctx.AdvanceBoolean();
        ctx.WarningNotSupported(token_name.getData());
      } else if (token_name.op_eq$pi8(S("lighting"))) {
        ctx.AdvanceBoolean();
        ctx.WarningNotSupported(token_name.getData());
      } else if (token_name.op_eq$pi8(S("normalise_normals")) || token_name.op_eq$pi8(S("normalize_normals"))) {
        ctx.AdvanceBoolean();
        ctx.WarningNotSupported(token_name.getData());
      } else if (token_name.op_eq$pi8(S("polygon_mode"))) {
        let mode = new $.StdStrBuf();
        ctx.AdvanceRequired$rStdStrBuf$i32(mode, 0 /*TOKEN_IDTF*/);
        ctx.WarningNotSupported(token_name.getData());
      } else if (token_name.op_eq$pi8(S("shading"))) {
        let shading = new $.StdStrBuf();
        ctx.AdvanceRequired$rStdStrBuf$i32(shading, 0 /*TOKEN_IDTF*/);
        ctx.WarningNotSupported(token_name.getData());
      } else if (token_name.op_eq$pi8(S("transparent_sorting"))) {
        ctx.AdvanceBoolean();
        ctx.WarningNotSupported(token_name.getData());
      } else if (token_name.op_eq$pi8(S("vertex_program_ref"))) {
        this.LoadShaderRef(ctx, 1 /*SMMS_VERTEX*/);
      } else if (token_name.op_eq$pi8(S("fragment_program_ref"))) {
        this.LoadShaderRef(ctx, 0 /*SMMS_FRAGMENT*/);
      } else if (token_name.op_eq$pi8(S("geometry_program_ref"))) {
        this.LoadShaderRef(ctx, 2 /*SMMS_GEOMETRY*/);
      } else {
        ctx.ErrorUnexpectedIdentifier(token_name);
      }
    }
    if (token !== 2) {
      ctx.Error_(new $.StdCopyStrBuf().init$pi8$b(S("'")).op_add$pi8(token_name.getData()).op_add$pi8(S("' unexpected")));
    }
  }

  IsOpaque() {
    return this.SceneBlendFactors[1] === 1;
  }

  LoadShaderRef(ctx, type) {
    let program_name = new $.StdStrBuf();
    let token = new $.StdStrBuf();
    ctx.AdvanceRequired$rStdStrBuf$i32(program_name, 0 /*TOKEN_IDTF*/);
    let cur_shader = null;
    let shader = null;
    let shader_type_name = null;
    switch (type) {
      case 0:
        cur_shader = this.FragmentShader;
        shader = ctx.Manager.GetFragmentShader(program_name.getData());
        shader_type_name = S("fragment");
        break;
      case 1:
        cur_shader = this.VertexShader;
        shader = ctx.Manager.GetVertexShader(program_name.getData());
        shader_type_name = S("vertex");
        break;
      case 2:
        cur_shader = this.GeometryShader;
        shader = ctx.Manager.GetGeometryShader(program_name.getData());
        shader_type_name = S("geometry");
        break;
      default:
        0;
        return;
    }
    if (cur_shader.Shader != null) {
      ctx.Error_($.FormatString(S("There is already a %s shader in this pass"), shader_type_name));
    }
    if (shader == null) {
      ctx.Error_($.FormatString(S("There is no such %s shader with name %s"), shader_type_name, program_name.getData()));
    }
    cur_shader.Shader = shader;
    cur_shader.Parameters.Load(ctx);
  }

  $clone() { return new StdMeshMaterialPass().$assign(this); }
  $assign(o) {
    this.Name.$assign(o.Name);
    this.TextureUnits = o.TextureUnits.slice();
    this.Ambient = o.Ambient.slice();
    this.Diffuse = o.Diffuse.slice();
    this.Specular = o.Specular.slice();
    this.Emissive = o.Emissive.slice();
    this.Shininess = o.Shininess;
    this.DepthCheck = o.DepthCheck;
    this.DepthWrite = o.DepthWrite;
    this.CullHardware = o.CullHardware;
    this.SceneBlendFactors = o.SceneBlendFactors.slice();
    this.AlphaRejectionFunction = o.AlphaRejectionFunction;
    this.AlphaRejectionValue = o.AlphaRejectionValue;
    this.AlphaToCoverage = o.AlphaToCoverage;
    this.FragmentShader.$assign(o.FragmentShader);
    this.VertexShader.$assign(o.VertexShader);
    this.GeometryShader.$assign(o.GeometryShader);
    this.Program = o.Program;
    return this;
  }
}

export class StdMeshMaterialPass$ShaderInstance {
  Shader = null;
  Parameters = new StdMeshMaterialShaderParameters().init();

  None() {
    this.Parameters = new StdMeshMaterialShaderParameters().init();
    return this;
  }

  $clone() { return new StdMeshMaterialPass$ShaderInstance().$assign(this); }
  $assign(o) {
    this.Shader = o.Shader;
    this.Parameters.$assign(o.Parameters);
    return this;
  }
}

export class StdMeshMaterialPass$ProgramInstance {
  Program = null;
  Parameters = [];

  init(program, fragment_instance, vertex_instance, geometry_instance) {
    this.Program = program;
    this.Parameters = [];
    0;
    0;
    0;
    StdMeshMaterialPass$ProgramInstance.prototype.LoadParameterRefs.call(this, fragment_instance);
    StdMeshMaterialPass$ProgramInstance.prototype.LoadParameterRefs.call(this, vertex_instance);
    StdMeshMaterialPass$ProgramInstance.prototype.LoadParameterRefs.call(this, geometry_instance);
    return this;
  }

  LoadParameterRefs(instance) {
    for (const NamedParameter of instance.Parameters.NamedParameters) {
      let index = this.Program.GetParameterIndex(NamedParameter.first.getData());
      0;
      let parameter_iter = std_find_if($begin(this.Parameters), $end(this.Parameters), ((ref) => {
  return ref.UniformIndex === index;
}));
      if (!parameter_iter.eq($end(this.Parameters))) {
        continue;
      } else {
        let ref$2 = new StdMeshMaterialPass$ProgramInstance$ParameterRef();
        ref$2.Parameter = NamedParameter.second;
        ref$2.UniformIndex = index;
        $vpush(this.Parameters, ref$2.$clone());
      }
    }
  }

  $clone() { return new StdMeshMaterialPass$ProgramInstance().$assign(this); }
  $assign(o) {
    this.Program = o.Program;
    this.Parameters = o.Parameters.slice();
    return this;
  }
}

export class StdMeshMaterialPass$ProgramInstance$ParameterRef {
  Parameter = null;
  UniformIndex = 0;

  $clone() { return new StdMeshMaterialPass$ProgramInstance$ParameterRef().$assign(this); }
  $assign(o) {
    this.Parameter = o.Parameter;
    this.UniformIndex = o.UniformIndex;
    return this;
  }
}

export class StdMeshMaterialTechnique {
  Name = new $.StdCopyStrBuf();
  Passes = [];
  Available = false;

  init() {
    this.Name = new $.StdCopyStrBuf();
    this.Passes = [];
    this.Available = false;
    return this;
  }

  Load(ctx) {
    let token = 0;
    let token_name = new $.StdCopyStrBuf();
    let pass_loader = new StdMeshMaterialSubLoader();
    while ((token = ctx.AdvanceNonEOF(token_name)) === 0) {
      if (token_name.op_eq$pi8(S("pass"))) {
        pass_loader.Load(ctx, this.Passes);
      } else {
        ctx.ErrorUnexpectedIdentifier(token_name);
      }
    }
    if (token !== 2) {
      ctx.Error_(new $.StdCopyStrBuf().init$pi8$b(S("'")).op_add$pi8(token_name.getData()).op_add$pi8(S("' unexpected")));
    }
  }

  IsOpaque() {
    for (const Pass of this.Passes) {
      if (Pass.IsOpaque()) {
        return true;
      }
    }
    return false;
  }

  $clone() { return new StdMeshMaterialTechnique().$assign(this); }
  $assign(o) {
    this.Name.$assign(o.Name);
    this.Passes = o.Passes.slice();
    this.Available = o.Available;
    return this;
  }
}

export class StdMeshMaterial {
  FileName = new $.StdCopyStrBuf();
  Line = 0;
  Name = new $.StdCopyStrBuf();
  ReceiveShadows = true;
  Techniques = [];
  BestTechniqueIndex = -1;

  init() {
    this.FileName = new $.StdCopyStrBuf();
    this.Line = 0;
    this.Name = new $.StdCopyStrBuf();
    this.ReceiveShadows = true;
    this.Techniques = [];
    this.BestTechniqueIndex = -1;
    return this;
  }

  Load(ctx) {
    let token = 0;
    let token_name = new $.StdCopyStrBuf();
    let technique_loader = new StdMeshMaterialSubLoader();
    while ((token = ctx.AdvanceNonEOF(token_name)) === 0) {
      if (token_name.op_eq$pi8(S("technique"))) {
        technique_loader.Load$2(ctx, this.Techniques);
      } else if (token_name.op_eq$pi8(S("receive_shadows"))) {
        this.ReceiveShadows = ctx.AdvanceBoolean();
      } else {
        ctx.ErrorUnexpectedIdentifier(token_name);
      }
    }
    if (token !== 2) {
      ctx.Error_(new $.StdCopyStrBuf().init$pi8$b(S("'")).op_add$pi8(token_name.getData()).op_add$pi8(S("' unexpected")));
    }
  }

  IsOpaque() {
    0;
    return this.Techniques[$u64n(this.BestTechniqueIndex)].IsOpaque();
  }

  $clone() { return new StdMeshMaterial().$assign(this); }
  $assign(o) {
    this.FileName.$assign(o.FileName);
    this.Line = o.Line;
    this.Name.$assign(o.Name);
    this.ReceiveShadows = o.ReceiveShadows;
    this.Techniques = o.Techniques.slice();
    this.BestTechniqueIndex = o.BestTechniqueIndex;
    return this;
  }
}

export class StdMeshMatManager {
  Materials = new StdMap((a, b) => a.op_lt(b));
  FragmentShaders = new StdMap((a, b) => a.op_lt(b));
  VertexShaders = new StdMap((a, b) => a.op_lt(b));
  GeometryShaders = new StdMap((a, b) => a.op_lt(b));
  Programs = new StdMap();

  Clear() {
    this.Materials.clear();
    this.Programs.clear();
    this.FragmentShaders.clear();
    this.VertexShaders.clear();
    this.GeometryShaders.clear();
  }

  Parse(mat_script, filename, loader) {
    let ctx = new StdMeshMaterialParserCtx().init(this, mat_script, filename, loader);
    let token = 0;
    let token_name = new $.StdCopyStrBuf();
    let loaded_materials = new StdSet((a, b) => a.op_lt(b));
    while ((token = ctx.Advance(token_name)) === 0) {
      if (token_name.op_eq$pi8(S("material"))) {
        let material_name = new $.StdCopyStrBuf();
        ctx.AdvanceRequired$rStdStrBuf$i32(material_name, 0 /*TOKEN_IDTF*/);
        let iter = this.Materials.find(material_name);
        if (!iter.eq(this.Materials.end())) {
          ctx.Error_($.FormatString(S("Material with name '%s' is already defined in %s:%u"), material_name.getData(), iter.v.second.FileName.getData(), iter.v.second.Line));
        }
        let next = ctx.AdvanceRequired$rStdStrBuf$i32$i32(token_name, 1 /*TOKEN_BRACE_OPEN*/, 3 /*TOKEN_COLON*/);
        let parent = null;
        if (next === 3) {
          let parent_name = new $.StdCopyStrBuf();
          ctx.AdvanceRequired$rStdStrBuf$i32(parent_name, 0 /*TOKEN_IDTF*/);
          ctx.AdvanceRequired$rStdStrBuf$i32(token_name, 1 /*TOKEN_BRACE_OPEN*/);
          iter = this.Materials.find(parent_name).copy();
          if (iter.eq(this.Materials.end())) {
            ctx.Error_(new $.StdCopyStrBuf().init$pi8$b(S("Parent material '")).op_add$StdStrBuf(parent_name).op_add$pi8(S("' does not exist (or is not yet loaded)")));
          }
          parent = iter.v.second;
        }
        let mat = parent != null ? parent.$clone() : new StdMeshMaterial().init();
        mat.Name.$assign(material_name);
        mat.FileName.$assign(ctx.FileName);
        mat.Line = ctx.Line;
        mat.Load(ctx);
        this.Materials.entry(material_name, () => new StdMeshMaterial().init()).second.$assign(mat);
        if (!$.pDraw.PrepareMaterial(this, loader, this.Materials.entry(material_name, () => new StdMeshMaterial().init()).second)) {
          this.Materials.erase(material_name);
          ctx.Error_(new $.StdCopyStrBuf().init$pi8$b(S("No working technique for material '")).op_add$StdStrBuf(material_name).op_add$pi8(S("'")));
        }
        loaded_materials.insert(material_name);
      } else if (token_name.op_eq$pi8(S("vertex_program"))) {
        LoadShader(ctx, 1 /*SMMS_VERTEX*/);
      } else if (token_name.op_eq$pi8(S("fragment_program"))) {
        LoadShader(ctx, 0 /*SMMS_FRAGMENT*/);
      } else if (token_name.op_eq$pi8(S("geometry_program"))) {
        LoadShader(ctx, 2 /*SMMS_GEOMETRY*/);
      } else {
        ctx.ErrorUnexpectedIdentifier(token_name);
      }
    }
    if (token !== 4) {
      ctx.Error_(new $.StdCopyStrBuf().init$pi8$b(S("'")).op_add$pi8(token_name.getData()).op_add$pi8(S("' unexpected")));
    }
    return loaded_materials;
  }

  GetMaterial(material_name) {
    let iter = this.Materials.find(new $.StdCopyStrBuf().init$pi8$b(material_name));
    if (iter.eq(this.Materials.end())) {
      return null;
    }
    return iter.v.second;
  }

  Begin() {
    return new StdMeshMatManager$Iterator().init(this.Materials.begin());
  }

  End() {
    return new StdMeshMatManager$Iterator().init(this.Materials.end());
  }

  Remove$StdStrBuf$pStdMeshMaterialUpdate(name, update) {
    let it = this.Materials.find(new $.StdCopyStrBuf().init$StdStrBuf$b(name));
    if (it.eq(this.Materials.end())) {
      return;
    }
    if (update != null) {
      update.Add(it.v.second);
    }
    this.Materials.erase($itcopy(it));
  }

  Remove$Iterator$pStdMeshMaterialUpdate(iter, update) {
    if (update != null) {
      update.Add(iter.op_mul());
    }
    let next_iter = iter.$clone();
    next_iter.op_inc();
    this.Materials.erase($itcopy(iter.iter_));
    return next_iter;
  }

  AddShader(filename, name, language, type, text, load_flags) {
    let map = null;
    switch (type) {
      case 0:
        map = this.FragmentShaders;
        break;
      case 1:
        map = this.VertexShaders;
        break;
      case 2:
        map = this.GeometryShaders;
        break;
    }
    let name_buf = new $.StdCopyStrBuf().init$pi8$b(name);
    let iter = map.find(name_buf);
    if (!iter.eq(map.end())) {
      if ((load_flags & 2) >>> 0 === 2) {
        map.erase($itcopy(iter));
      } else if ((load_flags & 1) >>> 0 === 1) {
        return iter.v.second;
      } else {
        return null;
      }
    }
    let shader = new StdMeshMaterialShader().init(filename, name, language, type, text);
    let inserted = map.insertPair(new StdPair($copy(name_buf), shader));
    0;
    iter = inserted.first.copy();
    return iter.v.second;
  }

  AddProgram(name, loader, fragment_shader, vertex_shader, geometry_shader) {
    let key = $tuple(fragment_shader.Shader, vertex_shader.Shader, geometry_shader.Shader);
    let iter = this.Programs.find(key);
    if (iter.eq(this.Programs.end())) {
      let program = new StdMeshMaterialProgram().init(name, fragment_shader.Shader, vertex_shader.Shader, geometry_shader.Shader);
      iter = this.Programs.insertPair(new StdPair($copy(key), program)).first.copy();
    }
    const inserted_program = iter.v.second;
    let fragment_added = inserted_program.AddParameterNames(fragment_shader.Parameters);
    let vertex_added = inserted_program.AddParameterNames(vertex_shader.Parameters);
    let geometry_added = inserted_program.AddParameterNames(geometry_shader.Parameters);
    if (!inserted_program.IsCompiled() || fragment_added || vertex_added || geometry_added) {
      if (!inserted_program.Compile(loader)) {
        return null;
      }
    }
    return inserted_program;
  }

  GetFragmentShader(name) {
    let iter = this.FragmentShaders.find(new $.StdCopyStrBuf().init$pi8$b(name));
    if (iter.eq(this.FragmentShaders.end())) {
      return null;
    }
    return iter.v.second;
  }

  GetVertexShader(name) {
    let iter = this.VertexShaders.find(new $.StdCopyStrBuf().init$pi8$b(name));
    if (iter.eq(this.VertexShaders.end())) {
      return null;
    }
    return iter.v.second;
  }

  GetGeometryShader(name) {
    let iter = this.GeometryShaders.find(new $.StdCopyStrBuf().init$pi8$b(name));
    if (iter.eq(this.GeometryShaders.end())) {
      return null;
    }
    return iter.v.second;
  }

  None() {
    this.Materials = new StdMap((a, b) => a.op_lt(b));
    this.FragmentShaders = new StdMap((a, b) => a.op_lt(b));
    this.VertexShaders = new StdMap((a, b) => a.op_lt(b));
    this.GeometryShaders = new StdMap((a, b) => a.op_lt(b));
    this.Programs = new StdMap();
    return this;
  }

  $clone() { return new StdMeshMatManager().$assign(this); }
  $assign(o) {
    this.Materials = o.Materials.$clone();
    this.FragmentShaders = o.FragmentShaders.$clone();
    this.VertexShaders = o.VertexShaders.$clone();
    this.GeometryShaders = o.GeometryShaders.$clone();
    this.Programs = o.Programs.$clone();
    return this;
  }
}

export class StdMeshMatManager$Iterator {
  iter_ = null;

  init(iter) {
    this.iter_ = $itcopy(iter);
    return this;
  }

  op_inc() {
    this.iter_.inc();
    return this;
  }

  op_ne(other) {
    return !this.iter_.eq(other.iter_);
  }

  op_mul() {
    return this.iter_.v.second;
  }

  op_arrow() {
    return this.iter_.v.second;
  }

  $clone() { return new StdMeshMatManager$Iterator().$assign(this); }
  $assign(iter) {
    this.iter_ = iter.iter_.copy();
    return this.$clone();
  }
}














export function LoadShader(ctx, type) {
  let token_name = new $.StdStrBuf();
  let name = new $.StdStrBuf();
  let language = new $.StdStrBuf();
  ctx.AdvanceRequired$rStdStrBuf$i32(name, 0 /*TOKEN_IDTF*/);
  ctx.AdvanceRequired$rStdStrBuf$i32(language, 0 /*TOKEN_IDTF*/);
  ctx.AdvanceRequired$rStdStrBuf$i32(token_name, 1 /*TOKEN_BRACE_OPEN*/);
  let token = 0;
  let source = new $.StdCopyStrBuf();
  let code = new $.StdCopyStrBuf();
  let syntax = new $.StdCopyStrBuf();
  while ((token = ctx.AdvanceNonEOF(token_name)) === 0) {
    if (token_name.op_eq$pi8(S("source"))) {
      ctx.AdvanceRequired$rStdStrBuf$i32(source, 0 /*TOKEN_IDTF*/);
      code.op_assign$StdStrBuf(ctx.Loader.LoadShaderCode(source.getData()));
      if (code.getLength() === 0) {
        ctx.Error_(new $.StdCopyStrBuf().init$pi8$b(S("Could not load shader code from '")).op_add$StdStrBuf(source).op_add$pi8(S("'")));
      }
    } else if (token_name.op_eq$pi8(S("syntax"))) {
      ctx.AdvanceRequired$rStdStrBuf$i32(syntax, 0 /*TOKEN_IDTF*/);
    } else {
      ctx.ErrorUnexpectedIdentifier(token_name);
    }
  }
  if (token !== 2) {
    ctx.Error_(new $.StdCopyStrBuf().init$pi8$b(S("'")).op_add$pi8(token_name.getData()).op_add$pi8(S("' unexpected")));
  }
  ctx.Manager.AddShader(source.getData(), name.getData(), language.getData(), type, code.getData(), 2);
}


export function $init(): void {
  $.ShaderParameterAutoEnumerators = $own([((($o) => ($o.Name = null, $o.Value = 0, $o))(new Enumerator$i32$4()))]);
  $.TexAddressModeEnumerators = $own([
  ((($o) => ($o.Name = S("wrap"), $o.Value = 0 /*AM_Wrap*/, $o))(new Enumerator$i32$9())),
  ((($o) => ($o.Name = S("clamp"), $o.Value = 1 /*AM_Clamp*/, $o))(new Enumerator$i32$9())),
  ((($o) => ($o.Name = S("mirror"), $o.Value = 2 /*AM_Mirror*/, $o))(new Enumerator$i32$9())),
  ((($o) => ($o.Name = S("border"), $o.Value = 3 /*AM_Border*/, $o))(new Enumerator$i32$9())),
  ((($o) => ($o.Name = null, $o.Value = 0, $o))(new Enumerator$i32$9())),
]);
  $.FilteringEnumerators = $own([
  ((($o) => ($o.Name = S("none"), $o.Value = 0 /*F_None*/, $o))(new Enumerator$i32$8())),
  ((($o) => ($o.Name = S("point"), $o.Value = 1 /*F_Point*/, $o))(new Enumerator$i32$8())),
  ((($o) => ($o.Name = S("linear"), $o.Value = 2 /*F_Linear*/, $o))(new Enumerator$i32$8())),
  ((($o) => ($o.Name = S("anisotropic"), $o.Value = 3 /*F_Anisotropic*/, $o))(new Enumerator$i32$8())),
  ((($o) => ($o.Name = null, $o.Value = 0, $o))(new Enumerator$i32$8())),
]);
  $.FilteringShortcuts = $own([
  ((($o) => ($o.Name = S("none"), $o.Values = new Int32Array([1, 1, 0]), $o))(new EnumeratorShortcut$3$i32())),
  ((($o) => ($o.Name = S("bilinear"), $o.Values = new Int32Array([2, 2, 1]), $o))(new EnumeratorShortcut$3$i32())),
  ((($o) => ($o.Name = S("trilinear"), $o.Values = new Int32Array([2, 2, 2]), $o))(new EnumeratorShortcut$3$i32())),
  ((($o) => ($o.Name = S("anisotropic"), $o.Values = new Int32Array([3, 3, 2]), $o))(new EnumeratorShortcut$3$i32())),
  ((($o) => ($o.Name = null, $o.Values = new Int32Array([0, 0, 0]), $o))(new EnumeratorShortcut$3$i32())),
]);
  $.BlendOpEnumerators = $own([
  ((($o) => ($o.Name = S("replace"), $o.Value = 0 /*BO_Replace*/, $o))(new Enumerator$i32$7())),
  ((($o) => ($o.Name = S("add"), $o.Value = 1 /*BO_Add*/, $o))(new Enumerator$i32$7())),
  ((($o) => ($o.Name = S("modulate"), $o.Value = 2 /*BO_Modulate*/, $o))(new Enumerator$i32$7())),
  ((($o) => ($o.Name = S("alpha_blend"), $o.Value = 3 /*BO_AlphaBlend*/, $o))(new Enumerator$i32$7())),
  ((($o) => ($o.Name = null, $o.Value = 0, $o))(new Enumerator$i32$7())),
]);
  $.BlendOpExEnumerators = $own([
  ((($o) => ($o.Name = S("source1"), $o.Value = 0 /*BOX_Source1*/, $o))(new Enumerator$i32$5())),
  ((($o) => ($o.Name = S("source2"), $o.Value = 1 /*BOX_Source2*/, $o))(new Enumerator$i32$5())),
  ((($o) => ($o.Name = S("modulate"), $o.Value = 2 /*BOX_Modulate*/, $o))(new Enumerator$i32$5())),
  ((($o) => ($o.Name = S("modulate_x2"), $o.Value = 3 /*BOX_ModulateX2*/, $o))(new Enumerator$i32$5())),
  ((($o) => ($o.Name = S("modulate_x4"), $o.Value = 4 /*BOX_ModulateX4*/, $o))(new Enumerator$i32$5())),
  ((($o) => ($o.Name = S("add"), $o.Value = 5 /*BOX_Add*/, $o))(new Enumerator$i32$5())),
  ((($o) => ($o.Name = S("add_signed"), $o.Value = 6 /*BOX_AddSigned*/, $o))(new Enumerator$i32$5())),
  ((($o) => ($o.Name = S("add_smooth"), $o.Value = 7 /*BOX_AddSmooth*/, $o))(new Enumerator$i32$5())),
  ((($o) => ($o.Name = S("subtract"), $o.Value = 8 /*BOX_Subtract*/, $o))(new Enumerator$i32$5())),
  ((($o) => ($o.Name = S("blend_diffuse_alpha"), $o.Value = 9 /*BOX_BlendDiffuseAlpha*/, $o))(new Enumerator$i32$5())),
  ((($o) => ($o.Name = S("blend_texture_alpha"), $o.Value = 10 /*BOX_BlendTextureAlpha*/, $o))(new Enumerator$i32$5())),
  ((($o) => ($o.Name = S("blend_current_alpha"), $o.Value = 11 /*BOX_BlendCurrentAlpha*/, $o))(new Enumerator$i32$5())),
  ((($o) => ($o.Name = S("blend_manual"), $o.Value = 12 /*BOX_BlendManual*/, $o))(new Enumerator$i32$5())),
  ((($o) => ($o.Name = S("dotproduct"), $o.Value = 13 /*BOX_Dotproduct*/, $o))(new Enumerator$i32$5())),
  ((($o) => ($o.Name = S("blend_diffuse_colour"), $o.Value = 14 /*BOX_BlendDiffuseColor*/, $o))(new Enumerator$i32$5())),
  ((($o) => ($o.Name = null, $o.Value = 0, $o))(new Enumerator$i32$5())),
]);
  $.BlendOpSourceEnumerators = $own([
  ((($o) => ($o.Name = S("src_current"), $o.Value = 0 /*BOS_Current*/, $o))(new Enumerator$i32$6())),
  ((($o) => ($o.Name = S("src_texture"), $o.Value = 1 /*BOS_Texture*/, $o))(new Enumerator$i32$6())),
  ((($o) => ($o.Name = S("src_diffuse"), $o.Value = 2 /*BOS_Diffuse*/, $o))(new Enumerator$i32$6())),
  ((($o) => ($o.Name = S("src_specular"), $o.Value = 3 /*BOS_Specular*/, $o))(new Enumerator$i32$6())),
  ((($o) => ($o.Name = S("src_player_color"), $o.Value = 4 /*BOS_PlayerColor*/, $o))(new Enumerator$i32$6())),
  ((($o) => ($o.Name = S("src_player_colour"), $o.Value = 4 /*BOS_PlayerColor*/, $o))(new Enumerator$i32$6())),
  ((($o) => ($o.Name = S("src_manual"), $o.Value = 5 /*BOS_Manual*/, $o))(new Enumerator$i32$6())),
  ((($o) => ($o.Name = null, $o.Value = 0, $o))(new Enumerator$i32$6())),
]);
  $.XFormTypeEnumerators = $own([
  ((($o) => ($o.Name = S("scroll_x"), $o.Value = 0 /*XF_SCROLL_X*/, $o))(new Enumerator$i32$11())),
  ((($o) => ($o.Name = S("scroll_y"), $o.Value = 1 /*XF_SCROLL_Y*/, $o))(new Enumerator$i32$11())),
  ((($o) => ($o.Name = S("rotate"), $o.Value = 2 /*XF_ROTATE*/, $o))(new Enumerator$i32$11())),
  ((($o) => ($o.Name = S("scale_x"), $o.Value = 3 /*XF_SCALE_X*/, $o))(new Enumerator$i32$11())),
  ((($o) => ($o.Name = S("scale_y"), $o.Value = 4 /*XF_SCALE_Y*/, $o))(new Enumerator$i32$11())),
  ((($o) => ($o.Name = null, $o.Value = 0, $o))(new Enumerator$i32$11())),
]);
  $.WaveTypeEnumerators = $own([
  ((($o) => ($o.Name = S("sine"), $o.Value = 0 /*W_SINE*/, $o))(new Enumerator$i32$10())),
  ((($o) => ($o.Name = S("triangle"), $o.Value = 1 /*W_TRIANGLE*/, $o))(new Enumerator$i32$10())),
  ((($o) => ($o.Name = S("square"), $o.Value = 2 /*W_SQUARE*/, $o))(new Enumerator$i32$10())),
  ((($o) => ($o.Name = S("sawtooth"), $o.Value = 3 /*W_SAWTOOTH*/, $o))(new Enumerator$i32$10())),
  ((($o) => ($o.Name = S("inverse_sawtooth"), $o.Value = 4 /*W_INVERSE_SAWTOOTH*/, $o))(new Enumerator$i32$10())),
  ((($o) => ($o.Name = null, $o.Value = 0, $o))(new Enumerator$i32$10())),
]);
  $.CullHardwareEnumerators = $own([((($o) => ($o.Name = S("clockwise"), $o.Value = 0 /*CH_Clockwise*/, $o))(new Enumerator$i32())), ((($o) => ($o.Name = S("anticlockwise"), $o.Value = 1 /*CH_CounterClockwise*/, $o))(new Enumerator$i32())), ((($o) => ($o.Name = S("none"), $o.Value = 2 /*CH_None*/, $o))(new Enumerator$i32())), ((($o) => ($o.Name = null, $o.Value = 0, $o))(new Enumerator$i32()))]);
  $.SceneBlendEnumerators = $own([
  ((($o) => ($o.Name = S("one"), $o.Value = 0 /*SB_One*/, $o))(new Enumerator$i32$3())),
  ((($o) => ($o.Name = S("zero"), $o.Value = 1 /*SB_Zero*/, $o))(new Enumerator$i32$3())),
  ((($o) => ($o.Name = S("dest_colour"), $o.Value = 2 /*SB_DestColor*/, $o))(new Enumerator$i32$3())),
  ((($o) => ($o.Name = S("src_colour"), $o.Value = 3 /*SB_SrcColor*/, $o))(new Enumerator$i32$3())),
  ((($o) => ($o.Name = S("one_minus_dest_colour"), $o.Value = 4 /*SB_OneMinusDestColor*/, $o))(new Enumerator$i32$3())),
  ((($o) => ($o.Name = S("one_minus_src_colour"), $o.Value = 5 /*SB_OneMinusSrcColor*/, $o))(new Enumerator$i32$3())),
  ((($o) => ($o.Name = S("dest_alpha"), $o.Value = 6 /*SB_DestAlpha*/, $o))(new Enumerator$i32$3())),
  ((($o) => ($o.Name = S("src_alpha"), $o.Value = 7 /*SB_SrcAlpha*/, $o))(new Enumerator$i32$3())),
  ((($o) => ($o.Name = S("one_minus_dest_alpha"), $o.Value = 8 /*SB_OneMinusDestAlpha*/, $o))(new Enumerator$i32$3())),
  ((($o) => ($o.Name = S("one_minus_src_alpha"), $o.Value = 9 /*SB_OneMinusSrcAlpha*/, $o))(new Enumerator$i32$3())),
  ((($o) => ($o.Name = null, $o.Value = 0, $o))(new Enumerator$i32$3())),
]);
  $.SceneBlendShortcuts = $own([
  ((($o) => ($o.Name = S("add"), $o.Values = new Int32Array([0, 0]), $o))(new EnumeratorShortcut$2$i32())),
  ((($o) => ($o.Name = S("modulate"), $o.Values = new Int32Array([2, 1]), $o))(new EnumeratorShortcut$2$i32())),
  ((($o) => ($o.Name = S("colour_blend"), $o.Values = new Int32Array([3, 5]), $o))(new EnumeratorShortcut$2$i32())),
  ((($o) => ($o.Name = S("alpha_blend"), $o.Values = new Int32Array([7, 9]), $o))(new EnumeratorShortcut$2$i32())),
  ((($o) => ($o.Name = null, $o.Values = new Int32Array([0, 0]), $o))(new EnumeratorShortcut$2$i32())),
]);
  $.DepthFunctionEnumerators = $own([
  ((($o) => ($o.Name = S("always_fail"), $o.Value = 0 /*DF_AlwaysFail*/, $o))(new Enumerator$i32$2())),
  ((($o) => ($o.Name = S("always_pass"), $o.Value = 1 /*DF_AlwaysPass*/, $o))(new Enumerator$i32$2())),
  ((($o) => ($o.Name = S("less"), $o.Value = 2 /*DF_Less*/, $o))(new Enumerator$i32$2())),
  ((($o) => ($o.Name = S("less_equal"), $o.Value = 3 /*DF_LessEqual*/, $o))(new Enumerator$i32$2())),
  ((($o) => ($o.Name = S("equal"), $o.Value = 4 /*DF_Equal*/, $o))(new Enumerator$i32$2())),
  ((($o) => ($o.Name = S("not_equal"), $o.Value = 5 /*DF_NotEqual*/, $o))(new Enumerator$i32$2())),
  ((($o) => ($o.Name = S("greater_equal"), $o.Value = 6 /*DF_GreaterEqual*/, $o))(new Enumerator$i32$2())),
  ((($o) => ($o.Name = S("greater"), $o.Value = 7 /*DF_Greater*/, $o))(new Enumerator$i32$2())),
  ((($o) => ($o.Name = null, $o.Value = 0, $o))(new Enumerator$i32$2())),
]);
  $.MeshMaterialManager = new StdMeshMatManager(); $.MeshMaterialManager.None();
}

Object.assign($, { Enumerator$i32, Enumerator$i32$10, Enumerator$i32$11, Enumerator$i32$2, Enumerator$i32$3, Enumerator$i32$4, Enumerator$i32$5, Enumerator$i32$6, Enumerator$i32$7, Enumerator$i32$8, Enumerator$i32$9, EnumeratorShortcut$2$i32, EnumeratorShortcut$3$i32, LoadShader, StdMeshMatManager, StdMeshMatManager$Iterator, StdMeshMaterial, StdMeshMaterialError, StdMeshMaterialLoader, StdMeshMaterialParserCtx, StdMeshMaterialPass, StdMeshMaterialPass$ProgramInstance, StdMeshMaterialPass$ProgramInstance$ParameterRef, StdMeshMaterialPass$ShaderInstance, StdMeshMaterialProgram, StdMeshMaterialShader, StdMeshMaterialShaderParameter, StdMeshMaterialShaderParameter$$anon1, StdMeshMaterialShaderParameters, StdMeshMaterialSubLoader, StdMeshMaterialTechnique, StdMeshMaterialTextureUnit, StdMeshMaterialTextureUnit$Tex, StdMeshMaterialTextureUnit$TexPtr, StdMeshMaterialTextureUnit$Transformation, StdMeshMaterialTextureUnit$Transformation$$anon1, StdMeshMaterialTextureUnit$Transformation$$anon1$$anon1, StdMeshMaterialTextureUnit$Transformation$$anon1$$anon2, StdMeshMaterialTextureUnit$Transformation$$anon1$$anon3, StdMeshMaterialTextureUnit$Transformation$$anon1$$anon4, StdMeshMaterialTextureUnit$Transformation$$anon1$$anon5, StdMeshMaterialTextureUnit$Transformation$$anon1$$anon6, StdMeshMaterialTextureUnit$Transformation$$anon1$$anon7 });
