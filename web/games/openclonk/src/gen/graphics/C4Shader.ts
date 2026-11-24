// @ts-nocheck
// OpenClonk 36de799: src/graphics/C4Shader.cpp, src/graphics/C4Shader.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { gl$glActiveTexture, gl$glAttachShader, gl$glCompileShader, gl$glCreateProgram, gl$glCreateShader, gl$glDeleteProgram, gl$glDeleteShader, gl$glGetAttribLocation, gl$glGetIntegerv, gl$glGetProgramInfoLog, gl$glGetProgramiv, gl$glGetShaderInfoLog, gl$glGetShaderiv, gl$glGetUniformLocation, gl$glLinkProgram, gl$glShaderSource, gl$glUniform1f, gl$glUniform1fv, gl$glUniform1i, gl$glUniform1iv, gl$glUniform1ui, gl$glUniform1uiv, gl$glUniform2f, gl$glUniform2fv, gl$glUniform2i, gl$glUniform2iv, gl$glUniform2ui, gl$glUniform2uiv, gl$glUniform3f, gl$glUniform3fv, gl$glUniform3i, gl$glUniform3iv, gl$glUniform3ui, gl$glUniform3uiv, gl$glUniform4f, gl$glUniform4fv, gl$glUniform4i, gl$glUniform4iv, gl$glUniform4ui, gl$glUniform4uiv, gl$glUniformMatrix3fv, gl$glUniformMatrix3x2fv, gl$glUniformMatrix4fv, gl$glUniformMatrix4x3fv, gl$glUseProgram } from '../../rt/gl.ts';
import { $u64n } from '../../rt/int.ts';
import { c$isalnum, c$isspace, c$sscanf } from '../../rt/libc.ts';
import { $own, $padd, $rd, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $begin, $end, $filled, $itcopy, $min, $vpush, StdMap, StdPair, StdSet, StdString, resize, seq_erase, std_distance, std_find, std_inserter, std_set_difference } from '../../rt/std.ts';

export class C4ShaderPosName {
  Position = 0;
  Name = null;

  $clone() { return new C4ShaderPosName().$assign(this); }
  $assign(o) {
    this.Position = o.Position;
    this.Name = o.Name;
    return this;
  }
}

export class C4Shader {
  Name = new $.StdStrBuf();
  VertexSlices = [];
  FragmentSlices = [];
  SourceFiles = [];
  Categories = [];
  ScriptShaders = new StdSet();
  LastRefresh = new $.C4TimeMilliseconds();
  ScriptSlicesLoaded = false;
  iTexCoords = 0;
  hProg = 0;
  Uniforms = [];
  Attributes = [];

  init() {
    this.Name = new $.StdStrBuf();
    this.VertexSlices = [];
    this.FragmentSlices = [];
    this.SourceFiles = [];
    this.Categories = [];
    this.ScriptShaders = new StdSet();
    this.LastRefresh = new $.C4TimeMilliseconds();
    this.ScriptSlicesLoaded = false;
    this.iTexCoords = 0;
    this.hProg = 0;
    this.Uniforms = [];
    this.Attributes = [];
    return this;
  }

  $dtor() {
    C4Shader.prototype.Clear.call(this);
  }

  GetSourceFileId(file) {
    let it = std_find($begin(this.SourceFiles), $end(this.SourceFiles), file);
    if (it.eq($end(this.SourceFiles))) {
      return -1;
    }
    return std_distance($begin(this.SourceFiles), $itcopy(it)) | 0;
  }

  Initialised() {
    return this.hProg !== 0;
  }

  GetUniform(iUniform) {
    return iUniform >= 0 && iUniform >>> 0 < this.Uniforms.length ? this.Uniforms[$u64n(iUniform)].address : -1;
  }

  HaveUniform(iUniform) {
    return this.GetUniform(iUniform) !== -1;
  }

  GetAttribute(iAttribute) {
    return iAttribute >= 0 && iAttribute >>> 0 < this.Attributes.length ? this.Attributes[$u64n(iAttribute)].address : -1;
  }

  AddDefine(name) {
    let define = $.FormatString(S("#define %s"), name);
    this.AddVertexSlice(-1, define.getData());
    this.AddFragmentSlice(-1, define.getData());
  }

  AddVertexSlice(iPos, szText) {
    this.AddSlice(this.VertexSlices, iPos, szText, null, 0, 0);
  }

  AddFragmentSlice(iPos, szText) {
    this.AddSlice(this.FragmentSlices, iPos, szText, null, 0, 0);
  }

  AddVertexSlices(szWhat, szText, szSource = S(""), iSourceTime = 0) {
    this.AddSlices(this.VertexSlices, szWhat, szText, szSource, iSourceTime);
  }

  AddFragmentSlices(szWhat, szText, szSource = S(""), iSourceTime = 0) {
    this.AddSlices(this.FragmentSlices, szWhat, szText, szSource, iSourceTime);
  }

  LoadFragmentSlices(pGroups, szFile) {
    return this.LoadSlices(this.FragmentSlices, pGroups, szFile);
  }

  LoadVertexSlices(pGroups, szFile) {
    return this.LoadSlices(this.VertexSlices, pGroups, szFile);
  }

  SetScriptCategories(categories) {
    0;
    this.Categories = categories.slice();
  }

  Init(szWhat, szUniforms, szAttributes) {
    this.Name.Copy$pi8(szWhat);
    this.LastRefresh.$assign($.C4TimeMilliseconds.Now());
    if (!this.ScriptSlicesLoaded) {
      this.Categories.push(StdString.of(szWhat));
      this.LoadScriptSlices();
    }
    let VertexShader = this.Build(this.VertexSlices, true);
    let FragmentShader = this.Build(this.FragmentSlices, true);
    if (C4Shader.IsLogging()) {
      $.ShaderLogF(S("******** Vertex shader for %s:"), szWhat);
      $.ShaderLog(VertexShader.getData());
      $.ShaderLogF(S("******** Fragment shader for %s:"), szWhat);
      $.ShaderLog(FragmentShader.getData());
    }
    let hVert = this.Create(35633, $.FormatString(S("%s vertex shader"), szWhat).getData(), VertexShader.getData());
    let hFrag = this.Create(35632, $.FormatString(S("%s fragment shader"), szWhat).getData(), FragmentShader.getData());
    if (hFrag === 0 || hVert === 0) {
      if (hFrag !== 0) {
        gl$glDeleteShader(hFrag);
      }
      if (hVert !== 0) {
        gl$glDeleteShader(hVert);
      }
      return false;
    }
    let hNewProg = gl$glCreateProgram();
    $.pGL.ObjectLabel(33506, hNewProg, -1, szWhat);
    gl$glAttachShader(hNewProg, hVert);
    gl$glAttachShader(hNewProg, hFrag);
    gl$glLinkProgram(hNewProg);
    gl$glDeleteShader(hFrag);
    gl$glDeleteShader(hVert);
    this.DumpInfoLog($.FormatString(S("%s shader program"), szWhat).getData(), hNewProg, true);
    const status = [0];
    gl$glGetProgramiv(hNewProg, 35714, P(status, 0));
    if (status[0] !== 1) {
      gl$glDeleteProgram(hNewProg);
      $.ShaderLogF(S("  gl: Failed to link %s shader!"), szWhat);
      return false;
    }
    $.ShaderLogF(S("  gl: %s shader linked successfully"), szWhat);
    if (this.hProg !== 0) {
      gl$glDeleteProgram(this.hProg);
    }
    this.hProg = hNewProg;
    let iUniformCount = 0;
    if (szUniforms != null) {
      while (szUniforms.a[szUniforms.o + iUniformCount] != null) {
        iUniformCount = iUniformCount + 1 | 0;
      }
    }
    resize(this.Uniforms, $u64n(iUniformCount), () => new C4Shader$Variable());
    let iAttributeCount = 0;
    if (szAttributes != null) {
      while (szAttributes.a[szAttributes.o + iAttributeCount] != null) {
        iAttributeCount = iAttributeCount + 1 | 0;
      }
    }
    resize(this.Attributes, $u64n(iAttributeCount), () => new C4Shader$Variable());
    for (let i = 0; i < iUniformCount; i = i + 1 | 0) {
      this.Uniforms[$u64n(i)].address = gl$glGetUniformLocation(this.hProg, szUniforms.a[szUniforms.o + i]);
      this.Uniforms[$u64n(i)].name = szUniforms.a[szUniforms.o + i];
      $.ShaderLogF(S("Uniform %s = %d"), szUniforms.a[szUniforms.o + i], this.Uniforms[$u64n(i)].address);
    }
    for (let i = 0; i < iAttributeCount; i = i + 1 | 0) {
      this.Attributes[$u64n(i)].address = gl$glGetAttribLocation(this.hProg, szAttributes.a[szAttributes.o + i]);
      this.Attributes[$u64n(i)].name = szAttributes.a[szAttributes.o + i];
      $.ShaderLogF(S("Attribute %s = %d"), szAttributes.a[szAttributes.o + i], this.Attributes[$u64n(i)].address);
    }
    return true;
  }

  Refresh() {
    this.LastRefresh.$assign($.C4TimeMilliseconds.Now());
    let next = $.ScriptShader.GetShaderIDs(this.Categories);
    let toAdd = new StdSet();
    let toRemove = new StdSet();
    std_set_difference(this.ScriptShaders.begin(), this.ScriptShaders.end(), next.begin(), next.end(), std_inserter(toRemove));
    std_set_difference(next.begin(), next.end(), this.ScriptShaders.begin(), this.ScriptShaders.end(), std_inserter(toAdd));
    this.ScriptShaders = next.$clone();
    let removeSlices = ((pSlice) => {
  let Source = new $.StdCopyStrBuf().init$StdCopyStrBuf$b(pSlice.v.Source);
  let pNext = null;
  for (; !pSlice.eq($end(this.FragmentSlices)); pSlice = pNext.copy()) {
    pNext = pSlice.copy();
    pNext.postinc();
    if ($.SEqual(pSlice.v.Source.getData(), Source.getData())) {
      seq_erase(this.FragmentSlices, $itcopy(pSlice));
    }
  }
});
    let sourcesToUpdate = [];
    for (let pSlice$2 = $begin(this.FragmentSlices); !pSlice$2.eq($end(this.FragmentSlices)); pSlice$2.postinc()) {
      if (pSlice$2.v.Source.getLength() !== 0) {
        if (pSlice$2.v.Source.BeginsWith(S("[script "))) {
          const sid = [-1];
          c$sscanf(pSlice$2.v.Source.getData(), S("[script %d"), P(sid, 0));
          if (!toRemove.find(sid[0]).eq(toRemove.end())) {
            removeSlices(pSlice$2);
          }
        } else if ($.FileExists(pSlice$2.v.Source.getData()) && $.FileTime(pSlice$2.v.Source.getData()) > pSlice$2.v.SourceTime) {
          $vpush(sourcesToUpdate, pSlice$2.v.Source.$clone());
          removeSlices(pSlice$2);
        }
      }
    }
    if (toAdd.size() === 0 && toRemove.size() === 0 && sourcesToUpdate.length === 0) {
      return true;
    }
    for (const Source of sourcesToUpdate) {
      const szParentPath = new Int8Array(4097);
      let Group = new $.C4Group().init();
      let Shader = new $.StdStrBuf();
      $.GetParentPath$pi8$pi8(Source.getData(), P(szParentPath, 0));
      if (!Group.Open(P(szParentPath, 0)) || !Group.LoadEntryString$pi8$pStdStrBuf($.GetFilename(Source.getData()), Shader) || !Group.Close$v()) {
        $.ShaderLogF(S("  gl: Failed to refresh %s shader from %s!"), this.Name.getData(), Source.getData());
        return false;
      }
      let iSourceTime = $.FileTime(Source.getData());
      let WhatSrc = $.FormatString(S("file %s"), $.Config.AtRelativePath(Source.getData()));
      this.AddFragmentSlices(WhatSrc.getData(), Shader.getData(), Source.getData(), iSourceTime);
    }
    for (const id of toAdd) {
      this.LoadScriptSlice(id);
    }
    let UniformNames = $filled(this.Uniforms.length + 1, () => null);
    for (let i = 0; i < this.Uniforms.length; i = i + 1) {
      UniformNames[i] = this.Uniforms[i].name;
    }
    UniformNames[this.Uniforms.length] = null;
    let AttributeNames = $filled(this.Attributes.length + 1, () => null);
    for (let i = 0; i < this.Attributes.length; i = i + 1) {
      AttributeNames[i] = this.Attributes[i].name;
    }
    AttributeNames[this.Attributes.length] = null;
    let What = new $.StdCopyStrBuf().init$StdStrBuf$b(this.Name);
    if (!this.Init(What.getData(), P(UniformNames, 0), P(AttributeNames, 0))) {
      return false;
    }
    return true;
  }

  ClearSlices() {
    this.VertexSlices.length = 0;
    this.FragmentSlices.length = 0;
    this.iTexCoords = 0;
    this.ScriptSlicesLoaded = false;
    this.Categories.length = 0;
    this.ScriptShaders.clear();
  }

  Clear() {
    if (this.hProg === 0) {
      return;
    }
    gl$glDeleteProgram(this.hProg);
    this.hProg = 0;
    this.Uniforms.length = 0;
    this.Attributes.length = 0;
  }

  AddSlice(slices, iPos, szText, szSource, line, iSourceTime) {
    let Slice = new C4Shader$ShaderSlice().None();
    Slice.Position = iPos;
    Slice.Text.Copy$pi8(szText);
    Slice.Source.op_assign$pi8(szSource);
    Slice.SourceTime = iSourceTime;
    Slice.SourceLine = line;
    $vpush(slices, Slice.$clone());
  }

  AddSlices(slices, szWhat, szText, szSource, iSourceTime) {
    if (std_find($begin(this.SourceFiles), $end(this.SourceFiles), szSource).eq($end(this.SourceFiles))) {
      this.SourceFiles.push(StdString.of(szSource));
    }
    let pStart = szText;
    const pPos = [szText];
    let iDepth = -1;
    let iPosition = -1;
    let fGotContent = false;
    while (pPos[0].a[pPos[0].o] !== 0) {
      if (pPos[0].a[pPos[0].o] === 47 && $rd($padd(pPos[0], 1)) === 47) {
        pPos[0] = pPos[0].add(2);
        while (pPos[0].a[pPos[0].o] !== 0 && pPos[0].a[pPos[0].o] !== 10) {
          pPos[0] = pPos[0].add(1);
        }
        continue;
      }
      if (pPos[0].a[pPos[0].o] === 47 && $rd($padd(pPos[0], 1)) === 42) {
        pPos[0] = pPos[0].add(2);
        while (pPos[0].a[pPos[0].o] !== 0 && (pPos[0].a[pPos[0].o] !== 42 || $rd($padd(pPos[0], 1)) !== 47)) {
          pPos[0] = pPos[0].add(1);
        }
        if (pPos[0].a[pPos[0].o] !== 0) {
          pPos[0] = pPos[0].add(2);
        }
        continue;
      }
      if (pPos[0].a[pPos[0].o] === 123) {
        iDepth = iDepth + 1 | 0;
        pPos[0] = pPos[0].add(1);
        continue;
      }
      if (pPos[0].a[pPos[0].o] === 125) {
        if (iPosition !== -1 && iDepth === 0) {
          if (fGotContent) {
            let Str = new $.StdStrBuf();
            Str.Copy$pi8$u64(pStart, $u64n(pPos[0].o - pStart.o));
            this.AddSlice(slices, iPosition, Str.getData(), szSource, $.SGetLine(szText, pStart), iSourceTime);
          }
          iPosition = -1;
          pStart = $padd(pPos[0], 1);
          fGotContent = false;
        }
        if (iDepth >= 0) {
          iDepth = iDepth - 1 | 0;
        }
        pPos[0] = pPos[0].add(1);
        continue;
      }
      if (pPos[0].a[pPos[0].o] === 10) {
        if ($.SEqual2($padd(pPos[0], 1), S("slice")) && !(c$isalnum($rd($padd(pPos[0], 6))) !== 0)) {
          let pSliceEnd = pPos[0];
          pPos[0] = pPos[0].add(6);
          do {
            while (c$isspace(pPos[0].a[pPos[0].o]) !== 0) {
              pPos[0] = pPos[0].add(1);
            }
          } while (false);
          if (pPos[0].a[pPos[0].o] !== 40) {
            pPos[0] = pPos[0].add(1);
            continue;
          }
          pPos[0] = pPos[0].add(1);
          iPosition = this.ParsePosition(szWhat, P(pPos, 0));
          if (iPosition !== -1) {
            do {
              while (c$isspace(pPos[0].a[pPos[0].o]) !== 0) {
                pPos[0] = pPos[0].add(1);
              }
            } while (false);
            if (pPos[0].a[pPos[0].o] !== 41) {
              pPos[0] = pPos[0].add(1);
              continue;
            }
            pPos[0] = pPos[0].add(1);
            do {
              while (c$isspace(pPos[0].a[pPos[0].o]) !== 0) {
                pPos[0] = pPos[0].add(1);
              }
            } while (false);
            if (pPos[0].a[pPos[0].o] === 123) {
              if (fGotContent) {
                let Str = new $.StdStrBuf();
                Str.Copy$pi8$u64(pStart, $u64n(pSliceEnd.o - pStart.o));
                this.AddSlice(slices, -1, Str.getData(), szSource, $.SGetLine(szText, pSliceEnd), iSourceTime);
              }
              iDepth = 0;
              pStart = $padd(pPos[0], 1);
              fGotContent = false;
            } else {
              $.ShaderLogF(S("  gl: Missing opening brace in %s!"), szWhat);
            }
            pPos[0] = pPos[0].add(1);
            continue;
          }
        }
      }
      if (!(c$isspace(pPos[0].a[pPos[0].o]) !== 0)) {
        fGotContent = true;
      }
      pPos[0] = pPos[0].add(1);
    }
    if (fGotContent) {
      let Str = new $.StdStrBuf();
      Str.Copy$pi8$u64(pStart, $u64n(pPos[0].o - pStart.o));
      this.AddSlice(slices, iPosition, Str.getData(), szSource, $.SGetLine(szText, pStart), iSourceTime);
    }
  }

  LoadSlices(slices, pGroups, szFile) {
    let pGroup = pGroups.FindEntry(szFile);
    if (pGroup == null) {
      return false;
    }
    let Shader = new $.StdStrBuf();
    if (!pGroup.LoadEntryString$pi8$pStdStrBuf(szFile, Shader)) {
      return false;
    }
    let Source = $.FormatString(S("%s/%s"), pGroup.GetFullName().getData(), szFile);
    let iSourceTime = 0;
    if ($.FileExists(Source.getData())) {
      iSourceTime = $.FileTime(Source.getData());
    }
    let What = $.FormatString(S("file %s"), $.Config.AtRelativePath(Source.getData()));
    this.AddSlices(slices, What.getData(), Shader.getData(), Source.getData(), iSourceTime);
    return true;
  }

  ParsePosition(szWhat, ppPos) {
    let pPos = ppPos.a[ppPos.o];
    while (c$isspace(pPos.a[pPos.o]) !== 0) {
      pPos = pPos.add(1);
    }
    let pStart = pPos;
    while (c$isalnum(pPos.a[pPos.o]) !== 0) {
      pPos = pPos.add(1);
    }
    let Name = new $.StdStrBuf();
    Name.Copy$pi8$u64(pStart, $u64n(pPos.o - pStart.o));
    let iPosition = -1;
    for (const PosName of $.C4SH_PosNames) {
      if ($.SEqual(Name.getData(), PosName.Name)) {
        iPosition = PosName.Position;
        break;
      }
    }
    if (iPosition === -1) {
      $.ShaderLogF(S("  gl: Unknown slice position in %s: %s"), szWhat, Name.getData());
      return -1;
    }
    while (c$isspace(pPos.a[pPos.o]) !== 0) {
      pPos = pPos.add(1);
    }
    if (pPos.a[pPos.o] === 43) {
      const iMod = [0];
      const iModLen = [0];
      if (!(c$sscanf($padd(pPos, 1), S("%d%n"), P(iMod, 0), P(iModLen, 0)) !== 0)) {
        $.ShaderLogF(S("  gl: Invalid slice modifier in %s"), szWhat);
        return -1;
      }
      iPosition = iPosition + iMod[0] | 0;
      pPos = pPos.add(1 + iModLen[0] | 0);
    }
    if (pPos.a[pPos.o] === 45) {
      const iMod = [0];
      const iModLen = [0];
      if (!(c$sscanf($padd(pPos, 1), S("%d%n"), P(iMod, 0), P(iModLen, 0)) !== 0)) {
        $.ShaderLogF(S("  gl: Invalid slice modifier in %s"), szWhat);
        return -1;
      }
      iPosition = iPosition - iMod[0] | 0;
      pPos = pPos.add(1 + iModLen[0] | 0);
    }
    ppPos.a[ppPos.o] = pPos;
    return iPosition;
  }

  LoadScriptSlices() {
    this.ScriptShaders = $.ScriptShader.GetShaderIDs(this.Categories).$clone();
    for (const id of this.ScriptShaders) {
      this.LoadScriptSlice(id);
    }
    this.ScriptSlicesLoaded = true;
  }

  LoadScriptSlice(id) {
    const s = $.ScriptShader.shaders.at(id);
    switch (s.type) {
      case 0:
        this.AddVertexSlices(this.Name.getData(), s.source.c_str(), $.FormatString(S("[script %d]"), id).getData());
        break;
      case 1:
        this.AddFragmentSlices(this.Name.getData(), s.source.c_str(), $.FormatString(S("[script %d]"), id).getData());
        break;
    }
  }

  Build(Slices, fDebug = false) {
    let Buf = new $.StdStrBuf();
    const iMaxFrags = [0];
    const iMaxVerts = [0];
    gl$glGetIntegerv(35657, P(iMaxFrags, 0));
    gl$glGetIntegerv(35658, P(iMaxVerts, 0));
    Buf.Format(S("#version %d\n#define MAX_FRAGMENT_UNIFORM_COMPONENTS %d\n#define MAX_VERTEX_UNIFORM_COMPONENTS %d\n"), 150, iMaxFrags[0], iMaxVerts[0]);
    let iPos = -1;
    let iNextPos = -1;
    do {
      iPos = iNextPos;
      iNextPos = 257;
      if (fDebug && iPos > 0) {
        Buf.AppendFormat(S("\t// Position %d:\n"), iPos);
      }
      for (const Slice of Slices) {
        if (Slice.Position < iPos) {
          continue;
        }
        if (Slice.Position > iPos) {
          iNextPos = $min(iNextPos, Slice.Position);
          continue;
        }
        if (fDebug) {
          if (Slice.Source.getLength() !== 0) {
            Buf.AppendFormat(S("\t// Slice from %s:\n#line %d %d\n"), Slice.Source.getData(), Slice.SourceLine - 1 | 0, this.GetSourceFileId(Slice.Source.getData()) + 1 | 0);
          } else {
            Buf.Append$pi8(S("\t// Built-in slice:\n#line 1 0\n"));
          }
        }
        Buf.Append$StdStrBuf(Slice.Text);
        if (Buf.op_index(Buf.getLength() - 1) !== 10) {
          Buf.AppendChar(10);
        }
      }
      if (iPos === -1) {
        Buf.Append$pi8(S("void main() {\n"));
      }
    } while (iNextPos <= 256);
    Buf.Append$pi8(S("}\n"));
    Buf.Append$pi8(S("// File number to name mapping:\n//\t  0: <built-in shader code>\n"));
    for (let i = 0; $u64n(i) < this.SourceFiles.length; i = i + 1 | 0) {
      Buf.AppendFormat(S("//\t%3d: %s\n"), i + 1 | 0, this.SourceFiles[$u64n(i)].c_str());
    }
    return Buf;
  }

  Create(iShaderType, szWhat, szShader$) {
    const szShader = [szShader$];
    let hShader = gl$glCreateShader(iShaderType);
    $.pGL.ObjectLabel(33505, hShader, -1, szWhat);
    gl$glShaderSource(hShader, 1, P(szShader, 0), null);
    gl$glCompileShader(hShader);
    this.DumpInfoLog(szWhat, hShader, false);
    const status = [0];
    gl$glGetShaderiv(hShader, 35713, P(status, 0));
    if (status[0] === 1) {
      return hShader;
    }
    gl$glDeleteShader(hShader);
    return 0;
  }

  DumpInfoLog(szWhat, hShader, forProgram) {
    const iLength = [0];
    if (forProgram) {
      gl$glGetProgramiv(hShader, 35716, P(iLength, 0));
    } else {
      gl$glGetShaderiv(hShader, 35716, P(iLength, 0));
    }
    if (iLength[0] <= 1) {
      return;
    }
    let buf = $filled($u64n(iLength[0] + 1 | 0), () => 0);
    const iActualLength = [0];
    if (forProgram) {
      gl$glGetProgramInfoLog(hShader, iLength[0], P(iActualLength, 0), P(buf, 0));
    } else {
      gl$glGetShaderInfoLog(hShader, iLength[0], P(iActualLength, 0), P(buf, 0));
    }
    if (iActualLength[0] > iLength[0] || iActualLength[0] <= 0) {
      return;
    }
    buf[$u64n(iActualLength[0])] = 0;
    $.ShaderLogF(S("  gl: Compiling %s:"), szWhat);
    $.ShaderLog(P(buf, 0));
  }

  static IsLogging() {
    return $.Config.Graphics.DebugOpenGL !== 0 || !($.Application.isEditor === 0);
  }

  $clone() { return new C4Shader().$assign(this); }
  $assign(o) {
    this.Name.$assign(o.Name);
    this.VertexSlices = o.VertexSlices.slice();
    this.FragmentSlices = o.FragmentSlices.slice();
    this.SourceFiles = o.SourceFiles.slice();
    this.Categories = o.Categories.slice();
    this.ScriptShaders = o.ScriptShaders.$clone();
    this.LastRefresh.$assign(o.LastRefresh);
    this.ScriptSlicesLoaded = o.ScriptSlicesLoaded;
    this.iTexCoords = o.iTexCoords;
    this.hProg = o.hProg;
    this.Uniforms = o.Uniforms.slice();
    this.Attributes = o.Attributes.slice();
    return this;
  }
}

export class C4Shader$ShaderSlice {
  Position = 0;
  Text = new $.StdCopyStrBuf();
  Source = new $.StdCopyStrBuf();
  SourceLine = 0;
  SourceTime = 0;

  None() {
    this.Text = new $.StdCopyStrBuf();
    this.Source = new $.StdCopyStrBuf();
    return this;
  }

  $clone() { return new C4Shader$ShaderSlice().$assign(this); }
  $assign(o) {
    this.Position = o.Position;
    this.Text.$assign(o.Text);
    this.Source.$assign(o.Source);
    this.SourceLine = o.SourceLine;
    this.SourceTime = o.SourceTime;
    return this;
  }
}

export class C4Shader$Variable {
  address = 0;
  name = null;

  $clone() { return new C4Shader$Variable().$assign(this); }
  $assign(o) {
    this.address = o.address;
    this.name = o.name;
    return this;
  }
}

export class C4ShaderCall {
  fStarted = false;
  pShader = null;
  iUnits = 0;

  init(pShader) {
    this.fStarted = false;
    this.pShader = pShader;
    this.iUnits = 0;
    return this;
  }

  $dtor() {
    C4ShaderCall.prototype.Finish.call(this);
  }

  GetAttribute(iAttribute) {
    return this.pShader.GetAttribute(iAttribute);
  }

  AllocTexUnit(iUniform) {
    if (iUniform >= 0) {
      if (!this.pShader.HaveUniform(iUniform)) {
        return 0;
      }
      0;
      if (this.iUnits >= 32) {
        return 0;
      }
      this.SetUniform1i(iUniform, this.iUnits);
    }
    let hTex = 33984 + this.iUnits | 0;
    gl$glActiveTexture(hTex >>> 0);
    this.iUnits = this.iUnits + 1 | 0;
    return hTex;
  }

  SetUniform1i(iUniform, iX) {
    if (this.pShader.HaveUniform(iUniform)) {
      gl$glUniform1i(this.pShader.GetUniform(iUniform), iX);
    }
  }

  SetUniform2i(iUniform, iX, iY) {
    if (this.pShader.HaveUniform(iUniform)) {
      gl$glUniform2i(this.pShader.GetUniform(iUniform), iX, iY);
    }
  }

  SetUniform3i(iUniform, iX, iY, iZ) {
    if (this.pShader.HaveUniform(iUniform)) {
      gl$glUniform3i(this.pShader.GetUniform(iUniform), iX, iY, iZ);
    }
  }

  SetUniform4i(iUniform, iX, iY, iZ, iW) {
    if (this.pShader.HaveUniform(iUniform)) {
      gl$glUniform4i(this.pShader.GetUniform(iUniform), iX, iY, iZ, iW);
    }
  }

  SetUniform1ui(iUniform, iX) {
    if (this.pShader.HaveUniform(iUniform)) {
      gl$glUniform1ui(this.pShader.GetUniform(iUniform), iX);
    }
  }

  Setuniform2ui(iUniform, iX, iY) {
    if (this.pShader.HaveUniform(iUniform)) {
      gl$glUniform2ui(this.pShader.GetUniform(iUniform), iX, iY);
    }
  }

  Setuniform3ui(iUniform, iX, iY, iZ) {
    if (this.pShader.HaveUniform(iUniform)) {
      gl$glUniform3ui(this.pShader.GetUniform(iUniform), iX, iY, iZ);
    }
  }

  Setuniform4ui(iUniform, iX, iY, iZ, iW) {
    if (this.pShader.HaveUniform(iUniform)) {
      gl$glUniform4ui(this.pShader.GetUniform(iUniform), iX, iY, iZ, iW);
    }
  }

  SetUniform1f(iUniform, gX) {
    if (this.pShader.HaveUniform(iUniform)) {
      gl$glUniform1f(this.pShader.GetUniform(iUniform), gX);
    }
  }

  SetUniform2f(iUniform, gX, gY) {
    if (this.pShader.HaveUniform(iUniform)) {
      gl$glUniform2f(this.pShader.GetUniform(iUniform), gX, gY);
    }
  }

  SetUniform3f(iUniform, gX, gY, gZ) {
    if (this.pShader.HaveUniform(iUniform)) {
      gl$glUniform3f(this.pShader.GetUniform(iUniform), gX, gY, gZ);
    }
  }

  SetUniform4f(iUniform, gX, gY, gZ, gW) {
    if (this.pShader.HaveUniform(iUniform)) {
      gl$glUniform4f(this.pShader.GetUniform(iUniform), gX, gY, gZ, gW);
    }
  }

  SetUniform1iv(iUniform, iLength, pVals) {
    if (this.pShader.HaveUniform(iUniform)) {
      gl$glUniform1iv(this.pShader.GetUniform(iUniform), iLength, pVals);
    }
  }

  SetUniform2iv(iUniform, iLength, pVals) {
    if (this.pShader.HaveUniform(iUniform)) {
      gl$glUniform2iv(this.pShader.GetUniform(iUniform), iLength, pVals);
    }
  }

  SetUniform3iv(iUniform, iLength, pVals) {
    if (this.pShader.HaveUniform(iUniform)) {
      gl$glUniform3iv(this.pShader.GetUniform(iUniform), iLength, pVals);
    }
  }

  SetUniform4iv(iUniform, iLength, pVals) {
    if (this.pShader.HaveUniform(iUniform)) {
      gl$glUniform4iv(this.pShader.GetUniform(iUniform), iLength, pVals);
    }
  }

  SetUniform1uiv(iUniform, iLength, pVals) {
    if (this.pShader.HaveUniform(iUniform)) {
      gl$glUniform1uiv(this.pShader.GetUniform(iUniform), iLength, pVals);
    }
  }

  SetUniform2uiv(iUniform, iLength, pVals) {
    if (this.pShader.HaveUniform(iUniform)) {
      gl$glUniform2uiv(this.pShader.GetUniform(iUniform), iLength, pVals);
    }
  }

  SetUniform3uiv(iUniform, iLength, pVals) {
    if (this.pShader.HaveUniform(iUniform)) {
      gl$glUniform3uiv(this.pShader.GetUniform(iUniform), iLength, pVals);
    }
  }

  SetUniform4uiv(iUniform, iLength, pVals) {
    if (this.pShader.HaveUniform(iUniform)) {
      gl$glUniform4uiv(this.pShader.GetUniform(iUniform), iLength, pVals);
    }
  }

  SetUniform1fv(iUniform, iLength, pVals) {
    if (this.pShader.HaveUniform(iUniform)) {
      gl$glUniform1fv(this.pShader.GetUniform(iUniform), iLength, pVals);
    }
  }

  SetUniform2fv(iUniform, iLength, pVals) {
    if (this.pShader.HaveUniform(iUniform)) {
      gl$glUniform2fv(this.pShader.GetUniform(iUniform), iLength, pVals);
    }
  }

  SetUniform3fv(iUniform, iLength, pVals) {
    if (this.pShader.HaveUniform(iUniform)) {
      gl$glUniform3fv(this.pShader.GetUniform(iUniform), iLength, pVals);
    }
  }

  SetUniform4fv(iUniform, iLength, pVals) {
    if (this.pShader.HaveUniform(iUniform)) {
      gl$glUniform4fv(this.pShader.GetUniform(iUniform), iLength, pVals);
    }
  }

  SetUniformMatrix2x3fv(iUniform, iLength, pVals) {
    if (this.pShader.HaveUniform(iUniform)) {
      gl$glUniformMatrix3x2fv(this.pShader.GetUniform(iUniform), iLength, 1, pVals);
    }
  }

  SetUniformMatrix3x3fv(iUniform, iLength, pVals) {
    if (this.pShader.HaveUniform(iUniform)) {
      gl$glUniformMatrix3fv(this.pShader.GetUniform(iUniform), iLength, 1, pVals);
    }
  }

  SetUniformMatrix3x4fv(iUniform, iLength, pVals) {
    if (this.pShader.HaveUniform(iUniform)) {
      gl$glUniformMatrix4x3fv(this.pShader.GetUniform(iUniform), iLength, 1, pVals);
    }
  }

  SetUniformMatrix4x4fv(iUniform, iLength, pVals) {
    if (this.pShader.HaveUniform(iUniform)) {
      gl$glUniformMatrix4fv(this.pShader.GetUniform(iUniform), iLength, 1, pVals);
    }
  }

  SetUniformMatrix3x3(iUniform, matrix) {
    if (this.pShader.HaveUniform(iUniform)) {
      const mat = new Float32Array([matrix.op_call$i32$i32$c(0, 0), matrix.op_call$i32$i32$c(1, 0), matrix.op_call$i32$i32$c(2, 0), matrix.op_call$i32$i32$c(0, 1), matrix.op_call$i32$i32$c(1, 1), matrix.op_call$i32$i32$c(2, 1), matrix.op_call$i32$i32$c(0, 2), matrix.op_call$i32$i32$c(1, 2), matrix.op_call$i32$i32$c(2, 2)]);
      gl$glUniformMatrix3fv(this.pShader.GetUniform(iUniform), 1, 0, P(mat, 0));
    }
  }

  SetUniformMatrix3x3Transpose(iUniform, matrix) {
    if (this.pShader.HaveUniform(iUniform)) {
      const mat = new Float32Array([matrix.op_call$i32$i32$c(0, 0), matrix.op_call$i32$i32$c(0, 1), matrix.op_call$i32$i32$c(0, 2), matrix.op_call$i32$i32$c(1, 0), matrix.op_call$i32$i32$c(1, 1), matrix.op_call$i32$i32$c(1, 2), matrix.op_call$i32$i32$c(2, 0), matrix.op_call$i32$i32$c(2, 1), matrix.op_call$i32$i32$c(2, 2)]);
      gl$glUniformMatrix3fv(this.pShader.GetUniform(iUniform), 1, 0, P(mat, 0));
    }
  }

  SetUniformMatrix3x4(iUniform, matrix) {
    if (this.pShader.HaveUniform(iUniform)) {
      gl$glUniformMatrix4x3fv(this.pShader.GetUniform(iUniform), 1, 1, matrix.data());
    }
  }

  SetUniformMatrix4x4$i32$StdMeshMatrix(iUniform, matrix) {
    if (this.pShader.HaveUniform(iUniform)) {
      const mat = new Float32Array([matrix.op_call$i32$i32$c(0, 0), matrix.op_call$i32$i32$c(1, 0), matrix.op_call$i32$i32$c(2, 0), 0, matrix.op_call$i32$i32$c(0, 1), matrix.op_call$i32$i32$c(1, 1), matrix.op_call$i32$i32$c(2, 1), 0, matrix.op_call$i32$i32$c(0, 2), matrix.op_call$i32$i32$c(1, 2), matrix.op_call$i32$i32$c(2, 2), 0, matrix.op_call$i32$i32$c(0, 3), matrix.op_call$i32$i32$c(1, 3), matrix.op_call$i32$i32$c(2, 3), 1]);
      gl$glUniformMatrix4fv(this.pShader.GetUniform(iUniform), 1, 0, P(mat, 0));
    }
  }

  SetUniformMatrix4x4$i32$StdProjectionMatrix(iUniform, matrix) {
    if (this.pShader.HaveUniform(iUniform)) {
      gl$glUniformMatrix4fv(this.pShader.GetUniform(iUniform), 1, 1, matrix.data());
    }
  }

  Start() {
    0;
    0;
    if ($.op_gt(new $.C4TimeMilliseconds().init$u32($.ScriptShader.LastUpdate), this.pShader.LastRefresh) || $.op_gt($.C4TimeMilliseconds.Now(), $.op_add$C4TimeMilliseconds$u32(this.pShader.LastRefresh.$clone(), $.C4Shader_RefreshInterval$C4Shader))) {
      this.pShader.Refresh();
    }
    gl$glUseProgram(this.pShader.hProg);
    this.fStarted = true;
  }

  Finish() {
    if (this.fStarted) {
      gl$glUseProgram(0);
    }
    this.iUnits = 0;
    this.fStarted = false;
  }

  $clone() { return new C4ShaderCall().$assign(this); }
  $assign(o) {
    this.fStarted = o.fStarted;
    this.pShader = o.pShader;
    this.iUnits = o.iUnits;
    return this;
  }
}

export class C4ScriptShader {
  categories = new StdMap();
  shaders = new StdMap();
  NextID = 0;
  LastUpdate = 0;

  GetShaderIDs(cats) {
    let result = new StdSet();
    for (const cat of cats) {
      for (const id of this.categories.entry(cat, () => new StdSet()).second) {
        result.emplace(id);
      }
    }
    return result;
  }

  Add(shaderName, type, source) {
    let $t1;
    let id = ($t1 = this.NextID, this.NextID = this.NextID + 1 | 0, $t1);
    this.LastUpdate = $.C4TimeMilliseconds.Now().AsInt();
    let nsource = StdString.of(S("\n")).plus(source);
    this.shaders.emplace(new StdPair(id, ((($o) => ($o.type = type, $o.source = nsource.$clone(), $o))(new C4ScriptShader$ShaderInstance()))));
    this.categories.entry(shaderName, () => new StdSet()).second.emplace(id);
    return id;
  }

  Remove(id) {
    if (this.shaders.erase(id) !== 0) {
      for (const kv of this.categories) {
        if (kv.second.erase(id) !== 0) {
          break;
        }
      }
      this.LastUpdate = $.C4TimeMilliseconds.Now().AsInt();
      return true;
    }
    return false;
  }

  None() {
    this.categories = new StdMap();
    this.shaders = new StdMap();
    this.NextID = 0;
    this.LastUpdate = 0;
    return this;
  }

  $clone() { return new C4ScriptShader().$assign(this); }
  $assign(o) {
    this.categories = o.categories.$clone();
    this.shaders = o.shaders.$clone();
    this.NextID = o.NextID;
    this.LastUpdate = o.LastUpdate;
    return this;
  }
}

export class C4ScriptShader$ShaderInstance {
  type = 0;
  source = new StdString();

  $clone() { return new C4ScriptShader$ShaderInstance().$assign(this); }
  $assign(o) {
    this.type = o.type;
    this.source = o.source.$clone();
    return this;
  }
}

export class C4ScriptUniform {
  uniformStack = [];

  Clear() {
    this.uniformStack = [].slice();
    this.uniformStack.push(new StdMap());
  }

  Push(proplist) {
    let $t1, $t2, $t3;
    let ulist = new $.C4Value().init$v();
    if (!proplist.GetProperty(228 /*P_Uniforms*/, ulist) || ulist.GetType() !== 3) {
      return null;
    }
    this.uniformStack.push(new StdMap());
    const uniforms = this.uniformStack[this.uniformStack.length - 1];
    let u = new C4ScriptUniform$Uniform();
    $t1 = ulist.getPropList();
    $t2 = $t1.begin();
    $t3 = $t1.end();
    for (; $t2.op_ne($t3); $t2.op_inc$v()) {
      const prop = $t2.op_mul();
      if (prop.Key == null) {
        continue;
      }
      $L_skip: {
        switch (prop.Value.GetType()) {
          case 1:
            u.type = 5124;
            u.$u1.intVec[0] = prop.Value._getInt();
            break;
          case 5:
            {
              let array = prop.Value._getArray();
              switch (array.GetSize()) {
                case 1:
                  u.type = 5124;
                  break;
                case 2:
                  u.type = 35667;
                  break;
                case 3:
                  u.type = 35668;
                  break;
                case 4:
                  u.type = 35669;
                  break;
                default:
                  continue;
              }
              for (let i = 0; i < array.GetSize(); i = i + 1 | 0) {
                const item = array._GetItem(i);
                switch (item.GetType()) {
                  case 1:
                    u.$u1.intVec[i] = item._getInt();
                    break;
                  default:
                    break $L_skip;
                }
              }
              break;
            }
          default:
            continue;
        }
        uniforms.insertPair(new StdPair(StdString.of(prop.Key.GetCStr()), u));
      }
      ;
    }
    return new C4ScriptUniform$Popper().init(this);
  }

  Apply(call) {
    for (const p of this.uniformStack[this.uniformStack.length - 1]) {
      let loc = gl$glGetUniformLocation(call.pShader.hProg, p.first.c_str());
      if (loc === -1) {
        continue;
      }
      const intVec = p.second.$u1.intVec;
      switch (p.second.type) {
        case 5124:
          gl$glUniform1iv(loc, 1, P(intVec, 0));
          break;
        case 35667:
          gl$glUniform2iv(loc, 1, P(intVec, 0));
          break;
        case 35668:
          gl$glUniform3iv(loc, 1, P(intVec, 0));
          break;
        case 35669:
          gl$glUniform4iv(loc, 1, P(intVec, 0));
          break;
        default:
          0;
      }
    }
  }

  init() {
    this.uniformStack = [];
    C4ScriptUniform.prototype.Clear.call(this);
    return this;
  }

  $clone() { return new C4ScriptUniform().$assign(this); }
  $assign(o) {
    this.uniformStack = o.uniformStack.$clone();
    return this;
  }
}

export class C4ScriptUniform$Uniform {
  static $layout = [["type", 0, "u32", 0], ["$u1.intVec", 4, "i32", 4]];
  static $size = 20;
  type = 0;
  $u1 = new C4ScriptUniform$Uniform$$anon1();

  $clone() { return new C4ScriptUniform$Uniform().$assign(this); }
  $assign(o) {
    this.type = o.type;
    this.$u1.$assign(o.$u1);
    return this;
  }
}

export class C4ScriptUniform$Uniform$$anon1 {
  $v = 0;
  get intVec() { return this.$v; }
  set intVec(v) { this.$v = v; }
  $clone() { const u = new C4ScriptUniform$Uniform$$anon1(); u.$v = this.$v; return u; }
  $assign(o) { this.$v = o.$v; return this; }
}

export class C4ScriptUniform$Popper {
  p = null;
  size = 0;

  init(p) {
    this.p = p;
    this.size = p.uniformStack.length;
    return this;
  }

  $dtor() {
    0;
    this.p.uniformStack.pop();
  }

  $clone() { return new C4ScriptUniform$Popper().$assign(this); }
  $assign(o) {
    this.p = o.p;
    this.size = o.size;
    return this;
  }
}




















export function $init(): void {
  $.C4Shader_RefreshInterval$C4Shader = 1000;
  $.C4SH_PosNames = $own([
  ((($o) => ($o.Position = 0, $o.Name = S("init"), $o))(new C4ShaderPosName())),
  ((($o) => ($o.Position = 20, $o.Name = S("coordinate"), $o))(new C4ShaderPosName())),
  ((($o) => ($o.Position = 40, $o.Name = S("texture"), $o))(new C4ShaderPosName())),
  ((($o) => ($o.Position = 60, $o.Name = S("material"), $o))(new C4ShaderPosName())),
  ((($o) => ($o.Position = 80, $o.Name = S("normal"), $o))(new C4ShaderPosName())),
  ((($o) => ($o.Position = 100, $o.Name = S("light"), $o))(new C4ShaderPosName())),
  ((($o) => ($o.Position = 120, $o.Name = S("color"), $o))(new C4ShaderPosName())),
  ((($o) => ($o.Position = 140, $o.Name = S("finish"), $o))(new C4ShaderPosName())),
  ((($o) => ($o.Position = 50, $o.Name = S("texcoord"), $o))(new C4ShaderPosName())),
  ((($o) => ($o.Position = 60, $o.Name = S("normal"), $o))(new C4ShaderPosName())),
  ((($o) => ($o.Position = 70, $o.Name = S("color"), $o))(new C4ShaderPosName())),
  ((($o) => ($o.Position = 80, $o.Name = S("position"), $o))(new C4ShaderPosName())),
]);
  $.C4Shader_Version$C4Shader = 150;
  $.C4Shader_MaxTexCoords$C4Shader = 8;
  $.C4ShaderCall_MaxUnits$C4Shader = 32;
  $.C4Shader_PositionInit$C4Shader = 0;
  $.C4Shader_PositionCoordinate$C4Shader = 20;
  $.C4Shader_PositionTexture$C4Shader = 40;
  $.C4Shader_PositionMaterial$C4Shader = 60;
  $.C4Shader_PositionNormal$C4Shader = 80;
  $.C4Shader_PositionLight$C4Shader = 100;
  $.C4Shader_PositionColor$C4Shader = 120;
  $.C4Shader_PositionFinish$C4Shader = 140;
  $.C4Shader_LastPosition$C4Shader = 256;
  $.C4Shader_Vertex_TexCoordPos$C4Shader = 50;
  $.C4Shader_Vertex_NormalPos$C4Shader = 60;
  $.C4Shader_Vertex_ColorPos$C4Shader = 70;
  $.C4Shader_Vertex_PositionPos$C4Shader = 80;
  $.ScriptShader = new C4ScriptShader(); $.ScriptShader.None();
}

Object.assign($, { C4ScriptShader, C4ScriptShader$ShaderInstance, C4ScriptUniform, C4ScriptUniform$Popper, C4ScriptUniform$Uniform, C4ScriptUniform$Uniform$$anon1, C4Shader, C4Shader$ShaderSlice, C4Shader$Variable, C4ShaderCall, C4ShaderPosName });
