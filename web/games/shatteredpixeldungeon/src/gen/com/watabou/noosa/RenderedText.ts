// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/noosa/RenderedText.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
/*
 * Pixel Dungeon
 * Copyright (C) 2012-2015 Oleg Dolya
 *
 * Shattered Pixel Dungeon
 * Copyright (C) 2014-2026 Evan Debenham
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 */
import { $J, Affine2, ArrayList, HashMap, JObject, JString, RuntimeException, Texture as Texture$lib, Thread, Throwable } from '../../../../jre/index.ts';
import { Image } from './Image.ts';

let Color, GlyphLayout, TextureRegion, Matrix, Quad, Texture, Game, NoosaScript;

export class RenderedText extends Image {
  font: BitmapFont = null;
  size_: number = 0;
  text_: string = null;
  static alreadyReported: ArrayList<number> = null;
  renderedHeight: number = 0;
  static textRenderer: RenderedText$TextRenderBatch = null;
  $init_RenderedText() {
    this.font = null;
    this.renderedHeight = 0;
  }
  _RenderedText$(): this {
    this._Image$();
    this.$init_RenderedText();
    this.text_ = null;
    return this;
  }
  _RenderedText$int(size: number): this {
    this._Image$();
    this.$init_RenderedText();
    this.text_ = null;
    this.size_ = size;
    return this;
  }
  _RenderedText$String$int(text: string, size: number): this {
    this._Image$();
    this.$init_RenderedText();
    this.text_ = text;
    this.size_ = size;
    this.measure();
    return this;
  }
  text$String(text: string): void {
    this.text_ = text;
    this.measure();
  }
  text$(): string {
    return this.text_;
  }
  size(size: number): void {
    this.size_ = size;
    this.measure();
  }
  measure(): void {
    if ($J.equals(Thread.currentThread().getName(), 'SHPD Actor Thread')) {
      throw new RuntimeException('Text measured from the actor thread!');
    }
    if (this.text_ == null || $J.equals(this.text_, '')) {
      this.text_ = '';
      this.width_ = this.height_ = 0;
      this.visible_ = false;
      return;
    } else {
      this.visible_ = true;
    }
    this.font = Game.platform.getFont(this.size_, this.text_, true, true);
    if (this.font != null) {
      let glyphs = new GlyphLayout()._GlyphLayout$BitmapFont$CharSequence(this.font, this.text_);
      for (let c of JString.toCharArray(this.text_)) {
        let g = this.font.getData().getGlyph(c);
        if (g == null || (g.id_ !== c)) {
          let toException = this.text_;
          if (toException.length > 30) {
            toException = toException.substring(0, 30) + '...';
          }
          if (!RenderedText.alreadyReported.contains(c)) {
            Game.reportException(new Throwable('font file ' + this.font.toString() + ' could not render ' + String.fromCharCode(c) + ' from string: ' + toException));
            RenderedText.alreadyReported.add(c);
          }
        }
      }
      let lastGlyph = this.font.getData().getGlyph(this.text_.charCodeAt((this.text_.length - 1) | 0));
      if (lastGlyph != null && Math.fround(lastGlyph.xadvance) > Math.fround(lastGlyph.width_ * 1.5)) {
        this.width_ = Math.fround(Math.fround(glyphs.width_ - lastGlyph.width_) + lastGlyph.xadvance);
      } else {
        this.width_ = glyphs.width_;
      }
      this.height_ = Math.fround($J.roundf(Math.fround(this.size_ * 0.75)));
      this.renderedHeight = glyphs.height_;
    }
  }
  updateMatrix(): void {
    super.updateMatrix();
    if (this.renderedHeight !== this.height_) {
      Matrix.translate(this.matrix, 0, Math.fround($J.roundf(Math.fround(this.height_ - this.renderedHeight))));
    }
  }
  draw(): void {
    if (this.font != null) {
      this.updateMatrix();
      RenderedText$TextRenderBatch.textBeingRendered = this;
      this.font.draw$Batch$CharSequence$float$float(RenderedText.textRenderer, this.text_, 0, 0);
    }
  }
  static $clinit() {
    RenderedText.alreadyReported = new ArrayList();
    RenderedText.textRenderer = new RenderedText$TextRenderBatch()._RenderedText$TextRenderBatch();
  }
}

export class RenderedText$TextRenderBatch extends JObject {
  static textBeingRendered: RenderedText = null;
  static vertices: number[] = null;
  static buffers: HashMap<number, FloatBuffer> = null;
  _RenderedText$TextRenderBatch(): this {
    return this;
  }
  draw$Texture$floatArr$int$int(texture: Texture, spriteVertices: number[], offset: number, count: number): void {
    let v = RenderedText$TextRenderBatch.textBeingRendered;
    let toOpenGL: FloatBuffer;
    if (RenderedText$TextRenderBatch.buffers.containsKey($J.idiv(count, 20))) {
      toOpenGL = RenderedText$TextRenderBatch.buffers.get($J.idiv(count, 20));
      (toOpenGL).position(0);
    } else {
      toOpenGL = Quad.createSet($J.idiv(count, 20));
      RenderedText$TextRenderBatch.buffers.put($J.idiv(count, 20), toOpenGL);
    }
    for (let i = 0; i < count; i = (i + 20) | 0) {
      RenderedText$TextRenderBatch.vertices[0] = spriteVertices[(i + 0) | 0];
      RenderedText$TextRenderBatch.vertices[1] = spriteVertices[(i + 1) | 0];
      RenderedText$TextRenderBatch.vertices[2] = spriteVertices[(i + 3) | 0];
      RenderedText$TextRenderBatch.vertices[3] = spriteVertices[(i + 4) | 0];
      RenderedText$TextRenderBatch.vertices[4] = spriteVertices[(i + 5) | 0];
      RenderedText$TextRenderBatch.vertices[5] = spriteVertices[(i + 6) | 0];
      RenderedText$TextRenderBatch.vertices[6] = spriteVertices[(i + 8) | 0];
      RenderedText$TextRenderBatch.vertices[7] = spriteVertices[(i + 9) | 0];
      RenderedText$TextRenderBatch.vertices[8] = spriteVertices[(i + 10) | 0];
      RenderedText$TextRenderBatch.vertices[9] = spriteVertices[(i + 11) | 0];
      RenderedText$TextRenderBatch.vertices[10] = spriteVertices[(i + 13) | 0];
      RenderedText$TextRenderBatch.vertices[11] = spriteVertices[(i + 14) | 0];
      RenderedText$TextRenderBatch.vertices[12] = spriteVertices[(i + 15) | 0];
      RenderedText$TextRenderBatch.vertices[13] = spriteVertices[(i + 16) | 0];
      RenderedText$TextRenderBatch.vertices[14] = spriteVertices[(i + 18) | 0];
      RenderedText$TextRenderBatch.vertices[15] = spriteVertices[(i + 19) | 0];
      toOpenGL.put(RenderedText$TextRenderBatch.vertices);
    }
    (toOpenGL).position(0);
    let script = NoosaScript.get();
    texture.bind();
    Texture.clear();
    script.camera(v.camera());
    script.uModel.valueM4(v.matrix);
    script.lighting(v.rm, v.gm, v.bm, v.am, v.ra, v.ga, v.ba, v.aa);
    script.drawQuadSet$FloatBuffer$int(toOpenGL, $J.idiv(count, 20));
  }
  begin(): void {
  }
  end(): void {
  }
  setColor$Color(tint: Color): void {
  }
  setColor$float$float$float$float(r: number, g: number, b: number, a: number): void {
  }
  getColor(): Color {
    return null;
  }
  setPackedColor(packedColor: number): void {
  }
  getPackedColor(): number {
    return 0;
  }
  draw$Texture$float$float$float$float$float$float$float$float$float$int$int$int$int$boolean$boolean(texture: Texture, x: number, y: number, originX: number, originY: number, width: number, height: number, scaleX: number, scaleY: number, rotation: number, srcX: number, srcY: number, srcWidth: number, srcHeight: number, flipX: boolean, flipY: boolean): void {
  }
  draw$Texture$float$float$float$float$int$int$int$int$boolean$boolean(texture: Texture, x: number, y: number, width: number, height: number, srcX: number, srcY: number, srcWidth: number, srcHeight: number, flipX: boolean, flipY: boolean): void {
  }
  draw$Texture$float$float$int$int$int$int(texture: Texture, x: number, y: number, srcX: number, srcY: number, srcWidth: number, srcHeight: number): void {
  }
  draw$Texture$float$float$float$float$float$float$float$float(texture: Texture, x: number, y: number, width: number, height: number, u: number, v: number, u2: number, v2: number): void {
  }
  draw$Texture$float$float(texture: Texture, x: number, y: number): void {
  }
  draw$Texture$float$float$float$float(texture: Texture, x: number, y: number, width: number, height: number): void {
  }
  draw$TextureRegion$float$float(region: TextureRegion, x: number, y: number): void {
  }
  draw$TextureRegion$float$float$float$float(region: TextureRegion, x: number, y: number, width: number, height: number): void {
  }
  draw$TextureRegion$float$float$float$float$float$float$float$float$float(region: TextureRegion, x: number, y: number, originX: number, originY: number, width: number, height: number, scaleX: number, scaleY: number, rotation: number): void {
  }
  draw$TextureRegion$float$float$float$float$float$float$float$float$float$boolean(region: TextureRegion, x: number, y: number, originX: number, originY: number, width: number, height: number, scaleX: number, scaleY: number, rotation: number, clockwise: boolean): void {
  }
  draw$TextureRegion$float$float$Affine2(region: TextureRegion, width: number, height: number, transform: Affine2): void {
  }
  flush(): void {
  }
  disableBlending(): void {
  }
  enableBlending(): void {
  }
  setBlendFunction(srcFunc: number, dstFunc: number): void {
  }
  setBlendFunctionSeparate(srcFuncColor: number, dstFuncColor: number, srcFuncAlpha: number, dstFuncAlpha: number): void {
  }
  getBlendSrcFunc(): number {
    return 0;
  }
  getBlendDstFunc(): number {
    return 0;
  }
  getBlendSrcFuncAlpha(): number {
    return 0;
  }
  getBlendDstFuncAlpha(): number {
    return 0;
  }
  getProjectionMatrix(): Matrix4 {
    return null;
  }
  getTransformMatrix(): Matrix4 {
    return null;
  }
  setProjectionMatrix(projection: Matrix4): void {
  }
  setTransformMatrix(transform: Matrix4): void {
  }
  setShader(shader: ShaderProgram): void {
  }
  getShader(): ShaderProgram {
    return null;
  }
  isBlendingEnabled(): boolean {
    return false;
  }
  isDrawing(): boolean {
    return false;
  }
  dispose(): void {
  }
  draw(...a: any[]): any {
    if (a.length === 3 && (a[0] == null || $J.isa(a[0], TextureRegion)) && typeof a[1] === 'number' && typeof a[2] === 'number') return this.draw$TextureRegion$float$float(...a);
    if (a.length === 3 && (a[0] == null || $J.isa(a[0], Texture$lib)) && typeof a[1] === 'number' && typeof a[2] === 'number') return this.draw$Texture$float$float(...a);
    if (a.length === 4 && (a[0] == null || $J.isa(a[0], TextureRegion)) && typeof a[1] === 'number' && typeof a[2] === 'number' && (a[3] == null || $J.isa(a[3], Affine2))) return this.draw$TextureRegion$float$float$Affine2(...a);
    if (a.length === 4 && (a[0] == null || $J.isa(a[0], Texture$lib)) && (a[1] == null || Array.isArray(a[1]) || ArrayBuffer.isView(a[1])) && typeof a[2] === 'number' && typeof a[3] === 'number') return this.draw$Texture$floatArr$int$int(...a);
    if (a.length === 5 && (a[0] == null || $J.isa(a[0], TextureRegion)) && typeof a[1] === 'number' && typeof a[2] === 'number' && typeof a[3] === 'number' && typeof a[4] === 'number') return this.draw$TextureRegion$float$float$float$float(...a);
    if (a.length === 5 && (a[0] == null || $J.isa(a[0], Texture$lib)) && typeof a[1] === 'number' && typeof a[2] === 'number' && typeof a[3] === 'number' && typeof a[4] === 'number') return this.draw$Texture$float$float$float$float(...a);
    if (a.length === 7 && (a[0] == null || $J.isa(a[0], Texture$lib)) && typeof a[1] === 'number' && typeof a[2] === 'number' && typeof a[3] === 'number' && typeof a[4] === 'number' && typeof a[5] === 'number' && typeof a[6] === 'number') return this.draw$Texture$float$float$int$int$int$int(...a);
    if (a.length === 9 && (a[0] == null || $J.isa(a[0], Texture$lib)) && typeof a[1] === 'number' && typeof a[2] === 'number' && typeof a[3] === 'number' && typeof a[4] === 'number' && typeof a[5] === 'number' && typeof a[6] === 'number' && typeof a[7] === 'number' && typeof a[8] === 'number') return this.draw$Texture$float$float$float$float$float$float$float$float(...a);
    if (a.length === 10 && (a[0] == null || $J.isa(a[0], TextureRegion)) && typeof a[1] === 'number' && typeof a[2] === 'number' && typeof a[3] === 'number' && typeof a[4] === 'number' && typeof a[5] === 'number' && typeof a[6] === 'number' && typeof a[7] === 'number' && typeof a[8] === 'number' && typeof a[9] === 'number') return this.draw$TextureRegion$float$float$float$float$float$float$float$float$float(...a);
    if (a.length === 11 && (a[0] == null || $J.isa(a[0], TextureRegion)) && typeof a[1] === 'number' && typeof a[2] === 'number' && typeof a[3] === 'number' && typeof a[4] === 'number' && typeof a[5] === 'number' && typeof a[6] === 'number' && typeof a[7] === 'number' && typeof a[8] === 'number' && typeof a[9] === 'number' && typeof a[10] === 'boolean') return this.draw$TextureRegion$float$float$float$float$float$float$float$float$float$boolean(...a);
    if (a.length === 11 && (a[0] == null || $J.isa(a[0], Texture$lib)) && typeof a[1] === 'number' && typeof a[2] === 'number' && typeof a[3] === 'number' && typeof a[4] === 'number' && typeof a[5] === 'number' && typeof a[6] === 'number' && typeof a[7] === 'number' && typeof a[8] === 'number' && typeof a[9] === 'boolean' && typeof a[10] === 'boolean') return this.draw$Texture$float$float$float$float$int$int$int$int$boolean$boolean(...a);
    if (a.length === 16 && (a[0] == null || $J.isa(a[0], Texture$lib)) && typeof a[1] === 'number' && typeof a[2] === 'number' && typeof a[3] === 'number' && typeof a[4] === 'number' && typeof a[5] === 'number' && typeof a[6] === 'number' && typeof a[7] === 'number' && typeof a[8] === 'number' && typeof a[9] === 'number' && typeof a[10] === 'number' && typeof a[11] === 'number' && typeof a[12] === 'number' && typeof a[13] === 'number' && typeof a[14] === 'boolean' && typeof a[15] === 'boolean') return this.draw$Texture$float$float$float$float$float$float$float$float$float$int$int$int$int$boolean$boolean(...a);
    throw new Error('no overload of draw for these arguments');
  }
  setColor(...a: any[]): any {
    if (a.length === 1 && (a[0] == null || $J.isa(a[0], Color))) return this.setColor$Color(...a);
    if (a.length === 4 && typeof a[0] === 'number' && typeof a[1] === 'number' && typeof a[2] === 'number' && typeof a[3] === 'number') return this.setColor$float$float$float$float(...a);
    throw new Error('no overload of setColor for these arguments');
  }
  static $clinit() {
    RenderedText$TextRenderBatch.textBeingRendered = null;
    RenderedText$TextRenderBatch.vertices = $J.newArray(16, 0);
    RenderedText$TextRenderBatch.buffers = new HashMap();
  }
}

$J.define(RenderedText, 'com.watabou.noosa.RenderedText', { kind: 'class', sup: 'com.watabou.noosa.Image', ctors: { 'java.lang.String,int': '_RenderedText$String$int', 'int': '_RenderedText$int', '': '_RenderedText$' }, meths: { 'text()': 'text$', 'text(java.lang.String)': 'text$String' }, clinit: true, lazy: ['alreadyReported', 'textRenderer'] });
$J.define(RenderedText$TextRenderBatch, 'com.watabou.noosa.RenderedText$TextRenderBatch', { kind: 'class', ifaces: ['com.badlogic.gdx.graphics.g2d.Batch'], sup: 'java.lang.Object', ctors: { '': '_RenderedText$TextRenderBatch' }, meths: { 'draw(com.badlogic.gdx.graphics.g2d.TextureRegion,float,float,com.badlogic.gdx.math.Affine2)': 'draw$TextureRegion$float$float$Affine2', 'draw(com.badlogic.gdx.graphics.g2d.TextureRegion,float,float,float,float,float,float,float,float,float,boolean)': 'draw$TextureRegion$float$float$float$float$float$float$float$float$float$boolean', 'draw(com.badlogic.gdx.graphics.g2d.TextureRegion,float,float,float,float,float,float,float,float,float)': 'draw$TextureRegion$float$float$float$float$float$float$float$float$float', 'draw(com.badlogic.gdx.graphics.g2d.TextureRegion,float,float,float,float)': 'draw$TextureRegion$float$float$float$float', 'draw(com.badlogic.gdx.graphics.g2d.TextureRegion,float,float)': 'draw$TextureRegion$float$float', 'draw(com.badlogic.gdx.graphics.Texture,float,float,float,float)': 'draw$Texture$float$float$float$float', 'draw(com.badlogic.gdx.graphics.Texture,float,float)': 'draw$Texture$float$float', 'draw(com.badlogic.gdx.graphics.Texture,float,float,float,float,float,float,float,float)': 'draw$Texture$float$float$float$float$float$float$float$float', 'draw(com.badlogic.gdx.graphics.Texture,float,float,int,int,int,int)': 'draw$Texture$float$float$int$int$int$int', 'draw(com.badlogic.gdx.graphics.Texture,float,float,float,float,int,int,int,int,boolean,boolean)': 'draw$Texture$float$float$float$float$int$int$int$int$boolean$boolean', 'draw(com.badlogic.gdx.graphics.Texture,float,float,float,float,float,float,float,float,float,int,int,int,int,boolean,boolean)': 'draw$Texture$float$float$float$float$float$float$float$float$float$int$int$int$int$boolean$boolean', 'setColor(float,float,float,float)': 'setColor$float$float$float$float', 'setColor(com.badlogic.gdx.graphics.Color)': 'setColor$Color', 'draw(com.badlogic.gdx.graphics.Texture,float[],int,int)': 'draw$Texture$floatArr$int$int' }, clinit: true, lazy: ['textBeingRendered', 'vertices', 'buffers'] });
$J.module(() => {
  Color = $J.load('com.badlogic.gdx.graphics.Color');
  GlyphLayout = $J.load('com.badlogic.gdx.graphics.g2d.GlyphLayout');
  TextureRegion = $J.load('com.badlogic.gdx.graphics.g2d.TextureRegion');
  Matrix = $J.load('com.watabou.glwrap.Matrix');
  Quad = $J.load('com.watabou.glwrap.Quad');
  Texture = $J.load('com.watabou.glwrap.Texture');
  Game = $J.load('com.watabou.noosa.Game');
  NoosaScript = $J.load('com.watabou.noosa.NoosaScript');
});
