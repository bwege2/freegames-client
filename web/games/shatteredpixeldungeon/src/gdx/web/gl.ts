// @ts-nocheck
// libGDX's GL20 (com.badlogic.gdx.graphics.GL20) on WebGL, for the calls the translated game makes
// (com.watabou.glwrap, noosa, RenderedText; re/shatteredpixeldungeon/work/j2ts-report.txt lists them) and the
// font pages' textures. libGDX passes OpenGL's int names; WebGL has objects, so each kind of object gets
// int names here (from 1, as desktop drivers give them). java.nio buffers (src/jre/io.ts) are read from their
// position to their limit, as libGDX's LWJGL3 backend hands them to OpenGL (Lwjgl3GL20: glBufferData and
// glBufferSubData use the buffer's remaining() bytes, glTexImage2D its address at the position).
//
// WebGL has no client-side vertex and index arrays, which OpenGL 2.0 (the game's NoosaScript.drawQuad,
// drawElements, RenderedText) uses: glVertexAttribPointer with a Buffer remembers the array, and glDrawElements
// uploads the remembered arrays (and a Buffer of indices) into scratch buffers before it draws.

/** The bytes of a java.nio Buffer from its position to its limit, as a Uint8Array over the same memory. */
export function bufferBytes(b: any): Uint8Array | null {
  if (b == null) return null;
  const a = b.a;
  const size = a.BYTES_PER_ELEMENT;
  return new Uint8Array(a.buffer, a.byteOffset + b.pos * size, (b.lim - b.pos) * size);
}

class Names<T> {
  map = new Map<number, T>();
  next = 1;
  add(o: T): number { const n = this.next++; this.map.set(n, o); return n; }
  get(n: number): T | null { return n ? this.map.get(n) ?? null : null; }
  remove(n: number): T | null { const o = this.map.get(n) ?? null; this.map.delete(n); return o; }
}

type ClientArray = { array: any; byteOffset: number; size: number; type: number; normalized: boolean; stride: number };

export class WebGL20 {
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  textures = new Names<WebGLTexture>();
  buffers = new Names<WebGLBuffer>();
  programs = new Names<WebGLProgram>();
  shaders = new Names<WebGLShader>();
  framebuffers = new Names<WebGLFramebuffer>();
  renderbuffers = new Names<WebGLRenderbuffer>();
  /** Uniform locations by program: OpenGL's int location -> WebGL's object. */
  uniforms = new Map<number, Map<number, WebGLUniformLocation>>();
  currentProgram = 0;
  arrayBuffer = 0;
  elementBuffer = 0;
  client = new Map<number, ClientArray>();
  scratchVertex: WebGLBuffer;
  scratchIndex: WebGLBuffer;
  m16 = new Float32Array(16);
  m9 = new Float32Array(9);
  lost = false;

  constructor(gl: WebGLRenderingContext | WebGL2RenderingContext) {
    this.gl = gl;
    this.scratchVertex = gl.createBuffer();
    this.scratchIndex = gl.createBuffer();
    // pixels as the program gives them: no premultiplication, no colour conversion, no flip
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  }

  /* --- state */
  glEnable(cap: number) { this.gl.enable(cap); }
  glDisable(cap: number) { this.gl.disable(cap); }
  glIsEnabled(cap: number) { return this.gl.isEnabled(cap); }
  glClear(mask: number) { this.gl.clear(mask); }
  glClearColor(r: number, g: number, b: number, a: number) { this.gl.clearColor(r, g, b, a); }
  glBlendFunc(s: number, d: number) { this.gl.blendFunc(s, d); }
  glBlendFuncSeparate(a: number, b: number, c: number, d: number) { this.gl.blendFuncSeparate(a, b, c, d); }
  glBlendEquation(m: number) { this.gl.blendEquation(m); }
  glScissor(x: number, y: number, w: number, h: number) { this.gl.scissor(x, y, w, h); }
  glViewport(x: number, y: number, w: number, h: number) { this.gl.viewport(x, y, w, h); }
  glPixelStorei(p: number, v: number) { this.gl.pixelStorei(p, v); }
  glGetError() { return this.gl.getError(); }
  glFlush() { this.gl.flush(); }
  glFinish() { this.gl.finish(); }
  glDepthMask(f: boolean) { this.gl.depthMask(f); }
  glColorMask(r: boolean, g: boolean, b: boolean, a: boolean) { this.gl.colorMask(r, g, b, a); }
  glLineWidth(w: number) { this.gl.lineWidth(w); }
  glGetString(name: number) { return String(this.gl.getParameter(name)); }
  glGetIntegerv(pname: number, params: any) {
    const v = this.gl.getParameter(pname);
    if (typeof v === 'number') params.put(0, v);
    else if (typeof v === 'boolean') params.put(0, v ? 1 : 0);
    else if (v && v.length !== undefined) for (let i = 0; i < v.length; i++) params.put(i, v[i]);
  }

  /* --- textures */
  glGenTexture() { return this.textures.add(this.gl.createTexture()); }
  glDeleteTexture(t: number) { const o = this.textures.remove(t); if (o) this.gl.deleteTexture(o); }
  glActiveTexture(unit: number) { this.gl.activeTexture(unit); }
  glBindTexture(target: number, t: number) { this.gl.bindTexture(target, this.textures.get(t)); }
  glTexParameterf(target: number, p: number, v: number) { this.gl.texParameteri(target, p, v | 0); }
  glTexParameteri(target: number, p: number, v: number) { this.gl.texParameteri(target, p, v); }
  glTexImage2D(target: number, level: number, internal: number, w: number, h: number, border: number, format: number, type: number, pixels: any) {
    this.gl.texImage2D(target, level, internal, w, h, border, format, type, bufferBytes(pixels));
  }
  glTexSubImage2D(target: number, level: number, x: number, y: number, w: number, h: number, format: number, type: number, pixels: any) {
    this.gl.texSubImage2D(target, level, x, y, w, h, format, type, bufferBytes(pixels));
  }
  glGenerateMipmap(target: number) { this.gl.generateMipmap(target); }

  /* --- buffers */
  glGenBuffer() { return this.buffers.add(this.gl.createBuffer()); }
  glDeleteBuffer(b: number) {
    const o = this.buffers.remove(b);
    if (o) this.gl.deleteBuffer(o);
    if (this.arrayBuffer === b) this.arrayBuffer = 0;
    if (this.elementBuffer === b) this.elementBuffer = 0;
  }
  glBindBuffer(target: number, b: number) {
    if (target === 34962) this.arrayBuffer = b;
    else if (target === 34963) this.elementBuffer = b;
    this.gl.bindBuffer(target, this.buffers.get(b));
  }
  glBufferData(target: number, size: number, data: any, usage: number) {
    if (data == null) this.gl.bufferData(target, size, usage);
    else this.gl.bufferData(target, bufferBytes(data), usage);
  }
  glBufferSubData(target: number, offset: number, _size: number, data: any) {
    this.gl.bufferSubData(target, offset, bufferBytes(data));
  }

  /* --- shaders and programs */
  glCreateShader(type: number) { return this.shaders.add(this.gl.createShader(type)); }
  glShaderSource(s: number, src: string) { this.gl.shaderSource(this.shaders.get(s), src); }
  glCompileShader(s: number) { this.gl.compileShader(this.shaders.get(s)); }
  glDeleteShader(s: number) { const o = this.shaders.remove(s); if (o) this.gl.deleteShader(o); }
  glGetShaderiv(s: number, pname: number, params: any) {
    const v = this.gl.getShaderParameter(this.shaders.get(s), pname);
    params.put(0, typeof v === 'boolean' ? (v ? 1 : 0) : v | 0);
  }
  glGetShaderInfoLog(s: number) { return this.gl.getShaderInfoLog(this.shaders.get(s)) ?? ''; }
  glCreateProgram() { return this.programs.add(this.gl.createProgram()); }
  glAttachShader(p: number, s: number) { this.gl.attachShader(this.programs.get(p), this.shaders.get(s)); }
  glDetachShader(p: number, s: number) { this.gl.detachShader(this.programs.get(p), this.shaders.get(s)); }
  glLinkProgram(p: number) { this.gl.linkProgram(this.programs.get(p)); }
  glUseProgram(p: number) { this.currentProgram = p; this.gl.useProgram(this.programs.get(p)); }
  glDeleteProgram(p: number) {
    const o = this.programs.remove(p);
    if (o) this.gl.deleteProgram(o);
    this.uniforms.delete(p);
    if (this.currentProgram === p) this.currentProgram = 0;
  }
  glGetProgramiv(p: number, pname: number, params: any) {
    const v = this.gl.getProgramParameter(this.programs.get(p), pname);
    params.put(0, typeof v === 'boolean' ? (v ? 1 : 0) : v | 0);
  }
  glGetProgramInfoLog(p: number) { return this.gl.getProgramInfoLog(this.programs.get(p)) ?? ''; }
  glGetAttribLocation(p: number, name: string) { return this.gl.getAttribLocation(this.programs.get(p), name); }
  glGetUniformLocation(p: number, name: string) {
    const loc = this.gl.getUniformLocation(this.programs.get(p), name);
    if (loc == null) return -1;
    let m = this.uniforms.get(p);
    if (!m) this.uniforms.set(p, (m = new Map()));
    const n = m.size + 1;
    m.set(n, loc);
    return n;
  }
  loc(n: number): WebGLUniformLocation | null {
    if (n < 0) return null;
    return this.uniforms.get(this.currentProgram)?.get(n) ?? null;
  }
  glUniform1i(l: number, x: number) { this.gl.uniform1i(this.loc(l), x); }
  glUniform1f(l: number, x: number) { this.gl.uniform1f(this.loc(l), x); }
  glUniform2f(l: number, x: number, y: number) { this.gl.uniform2f(this.loc(l), x, y); }
  glUniform3f(l: number, x: number, y: number, z: number) { this.gl.uniform3f(this.loc(l), x, y, z); }
  glUniform4f(l: number, x: number, y: number, z: number, w: number) { this.gl.uniform4f(this.loc(l), x, y, z, w); }
  glUniformMatrix4fv(l: number, count: number, transpose: boolean, value: any, offset: number) {
    const loc = this.loc(l);
    if (count === 1) {
      const m = this.m16;
      for (let i = 0; i < 16; i++) m[i] = value[offset + i];
      this.gl.uniformMatrix4fv(loc, transpose, m);
    } else {
      this.gl.uniformMatrix4fv(loc, transpose, Float32Array.from(value.slice(offset, offset + 16 * count)));
    }
  }
  glUniformMatrix3fv(l: number, count: number, transpose: boolean, value: any, offset: number) {
    const loc = this.loc(l);
    if (count === 1) {
      const m = this.m9;
      for (let i = 0; i < 9; i++) m[i] = value[offset + i];
      this.gl.uniformMatrix3fv(loc, transpose, m);
    } else {
      this.gl.uniformMatrix3fv(loc, transpose, Float32Array.from(value.slice(offset, offset + 9 * count)));
    }
  }

  /* --- vertex attributes and drawing */
  glEnableVertexAttribArray(i: number) { if (i >= 0) this.gl.enableVertexAttribArray(i); }
  glDisableVertexAttribArray(i: number) { if (i >= 0) { this.gl.disableVertexAttribArray(i); this.client.delete(i); } }
  glVertexAttribPointer(i: number, size: number, type: number, normalized: boolean, stride: number, ptr: any) {
    if (i < 0) return;
    if (typeof ptr === 'number') {
      this.client.delete(i);
      this.gl.vertexAttribPointer(i, size, type, normalized, stride, ptr);
    } else {
      const a = ptr.a;
      this.client.set(i, { array: a, byteOffset: ptr.pos * a.BYTES_PER_ELEMENT, size, type, normalized, stride });
    }
  }
  /** Puts the client-side arrays into the scratch vertex buffer (each array once) and points their attributes there. */
  uploadClientArrays() {
    if (this.client.size === 0) return;
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.scratchVertex);
    let uploaded: any = null;
    for (const [i, c] of this.client) {
      if (c.array !== uploaded) {
        if (uploaded !== null) {
          // a second array: its own buffer for this draw (rare: the game's attributes share one array)
          const b = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, b);
          gl.bufferData(gl.ARRAY_BUFFER, c.array, gl.STREAM_DRAW);
          gl.vertexAttribPointer(i, c.size, c.type, c.normalized, c.stride, c.byteOffset);
          gl.deleteBuffer(b);
          continue;
        }
        gl.bufferData(gl.ARRAY_BUFFER, c.array, gl.STREAM_DRAW);
        uploaded = c.array;
      }
      gl.vertexAttribPointer(i, c.size, c.type, c.normalized, c.stride, c.byteOffset);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.get(this.arrayBuffer));
  }
  glDrawElements(mode: number, count: number, type: number, indices: any) {
    const gl = this.gl;
    this.uploadClientArrays();
    if (typeof indices === 'number') {
      gl.drawElements(mode, count, type, indices);
    } else {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.scratchIndex);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, bufferBytes(indices), gl.STREAM_DRAW);
      gl.drawElements(mode, count, type, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.get(this.elementBuffer));
    }
  }
  glDrawArrays(mode: number, first: number, count: number) {
    this.uploadClientArrays();
    this.gl.drawArrays(mode, first, count);
  }

  /* --- framebuffers */
  glGenFramebuffer() { return this.framebuffers.add(this.gl.createFramebuffer()); }
  glDeleteFramebuffer(f: number) { const o = this.framebuffers.remove(f); if (o) this.gl.deleteFramebuffer(o); }
  glBindFramebuffer(target: number, f: number) { this.gl.bindFramebuffer(target, this.framebuffers.get(f)); }
  glFramebufferTexture2D(target: number, attachment: number, textarget: number, t: number, level: number) {
    this.gl.framebufferTexture2D(target, attachment, textarget, this.textures.get(t), level);
  }
  glFramebufferRenderbuffer(target: number, attachment: number, rbtarget: number, r: number) {
    this.gl.framebufferRenderbuffer(target, attachment, rbtarget, this.renderbuffers.get(r));
  }
  glCheckFramebufferStatus(target: number) { return this.gl.checkFramebufferStatus(target); }
  glGenRenderbuffer() { return this.renderbuffers.add(this.gl.createRenderbuffer()); }
  glDeleteRenderbuffer(r: number) { const o = this.renderbuffers.remove(r); if (o) this.gl.deleteRenderbuffer(o); }
  glBindRenderbuffer(target: number, r: number) { this.gl.bindRenderbuffer(target, this.renderbuffers.get(r)); }
  glRenderbufferStorage(target: number, format: number, w: number, h: number) { this.gl.renderbufferStorage(target, format, w, h); }
}

const wrappers = new WeakMap<object, any>();

/**
 * The GL20 of a WebGL context, one per context (the program keeps GL names in static fields across a stop and a
 * new start in the same page). Any GL call the port has not met gets a clear error instead of "not a function".
 */
export function webGL20(gl: WebGLRenderingContext | WebGL2RenderingContext): any {
  const known = wrappers.get(gl);
  if (known) return known;
  const impl = new WebGL20(gl);
  const proxy = new Proxy(impl, {
    get(t: any, p) {
      if (p in t) return t[p];
      if (typeof p === 'string' && p.startsWith('gl')) return () => { throw new Error('GL20.' + p + ' is not in the browser backend (src/gdx/web/gl.ts)'); };
      return undefined;
    },
  });
  wrappers.set(gl, proxy);
  return proxy;
}
