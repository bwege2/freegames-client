// @ts-nocheck
// libGDX's Texture as the translated glyph packer (PixmapPacker) and fonts use it (Apache-2.0, see core.ts):
// a GL texture made from a Pixmap through Gdx.gl, as libGDX's GLTexture.uploadImageData does
// (glGenTexture, glBindTexture, glPixelStorei(GL_UNPACK_ALIGNMENT, 1), glTexImage2D with the pixmap's
// format, type and pixels; setFilter/setWrap as glTexParameteri). Headless, Gdx.gl draws nothing; a browser
// backend's Gdx.gl (WebGL) makes the texture real. The game's own textures are com.watabou.glwrap's.
import { JObject, defineLib } from '../jre/lang.ts';
import { Gdx, libEnum } from './core.ts';
import { Pixmap } from './pixmap.ts';
import { Pixmap_Format } from './stubs.ts';

const GL_TEXTURE_2D = 3553, GL_TEXTURE_MIN_FILTER = 10241, GL_TEXTURE_MAG_FILTER = 10240,
  GL_TEXTURE_WRAP_S = 10242, GL_TEXTURE_WRAP_T = 10243, GL_UNPACK_ALIGNMENT = 3317;

export const Texture_TextureFilter = libEnum('Texture_TextureFilter', 'com.badlogic.gdx.graphics.Texture$TextureFilter',
  ['Nearest', 'Linear', 'MipMap', 'MipMapNearestNearest', 'MipMapLinearNearest', 'MipMapNearestLinear', 'MipMapLinearLinear']);
const FILTER_GL = [9728, 9729, 9987, 9984, 9985, 9986, 9987];
Texture_TextureFilter.prototype.getGLEnum = function () { return FILTER_GL[this.ordinal()]; };
Texture_TextureFilter.prototype.isMipMap = function () { return this.ordinal() >= 2; };

export const Texture_TextureWrap = libEnum('Texture_TextureWrap', 'com.badlogic.gdx.graphics.Texture$TextureWrap',
  ['MirroredRepeat', 'ClampToEdge', 'Repeat']);
const WRAP_GL = [33648, 33071, 10497];
Texture_TextureWrap.prototype.getGLEnum = function () { return WRAP_GL[this.ordinal()]; };

/** glutils.PixmapTextureData: a texture's pixels from a Pixmap. */
export class PixmapTextureData extends JObject {
  pixmap: Pixmap;
  format: any;
  useMipMaps: boolean;
  disposePixmap: boolean;
  managed: boolean;
  constructor(pixmap: Pixmap, format: any, useMipMaps: boolean, disposePixmap: boolean, managed = false) {
    super();
    this.pixmap = pixmap;
    this.format = format == null ? pixmap.getFormat() : format;
    this.useMipMaps = useMipMaps;
    this.disposePixmap = disposePixmap;
    this.managed = managed;
  }
  getWidth() { return this.pixmap.getWidth(); }
  getHeight() { return this.pixmap.getHeight(); }
  getFormat() { return this.format; }
  isPrepared() { return true; }
  prepare() {}
  consumePixmap() { return this.pixmap; }
  disposePixmap_() { return this.disposePixmap; }
  useMipMaps_() { return this.useMipMaps; }
  isManaged() { return this.managed; }
}
defineLib(PixmapTextureData, 'com.badlogic.gdx.graphics.glutils.PixmapTextureData', { ifaces: ['com.badlogic.gdx.graphics.TextureData'] });

/** com.badlogic.gdx.graphics.Texture (with GLTexture's members). */
export class Texture extends JObject {
  glTarget = GL_TEXTURE_2D;
  glHandle = 0;
  data: any = null;
  minFilter: any = Texture_TextureFilter.Nearest;
  magFilter: any = Texture_TextureFilter.Nearest;
  uWrap: any = Texture_TextureWrap.ClampToEdge;
  vWrap: any = Texture_TextureWrap.ClampToEdge;
  /** new Texture(FileHandle | String | Pixmap | TextureData [, Format, useMipMaps]). */
  constructor(src?: any, ..._rest: any[]) {
    super();
    if (src !== undefined) this._Texture(src);
  }
  _Texture(src: any, ..._rest: any[]): this {
    let data = src;
    if (typeof src === 'string') data = new PixmapTextureData(new Pixmap(Gdx.files.internal(src)), null, false, true);
    else if (src instanceof Pixmap) data = new PixmapTextureData(src, null, false, false);
    else if (src && src.bytesOrThrow) data = new PixmapTextureData(new Pixmap(src), null, false, true);
    this.glHandle = Gdx.gl.glGenTexture();
    this.load(data);
    return this;
  }
  load(data: any) {
    this.data = data;
    this.bind();
    const pixmap = data.consumePixmap();
    Gdx.gl.glPixelStorei(GL_UNPACK_ALIGNMENT, 1);
    Gdx.gl.glTexImage2D(this.glTarget, 0, pixmap.getGLInternalFormat(), pixmap.getWidth(), pixmap.getHeight(), 0,
      pixmap.getGLFormat(), pixmap.getGLType(), pixmap.getPixels());
    this.unsafeSetFilter(this.minFilter, this.magFilter, true);
    this.unsafeSetWrap(this.uWrap, this.vWrap, true);
    Gdx.gl.glBindTexture(this.glTarget, 0);
  }
  getTextureData() { return this.data; }
  getWidth() { return this.data.getWidth(); }
  getHeight() { return this.data.getHeight(); }
  getTextureObjectHandle() { return this.glHandle; }
  bind(unit?: number) {
    if (unit !== undefined) Gdx.gl.glActiveTexture(33984 + unit);
    Gdx.gl.glBindTexture(this.glTarget, this.glHandle);
  }
  unsafeSetFilter(min: any, mag: any, force = false) {
    if (min != null && (force || this.minFilter !== min)) { Gdx.gl.glTexParameteri(this.glTarget, GL_TEXTURE_MIN_FILTER, min.getGLEnum()); this.minFilter = min; }
    if (mag != null && (force || this.magFilter !== mag)) { Gdx.gl.glTexParameteri(this.glTarget, GL_TEXTURE_MAG_FILTER, mag.getGLEnum()); this.magFilter = mag; }
  }
  setFilter(min: any, mag: any) { this.minFilter = min; this.magFilter = mag; this.bind(); Gdx.gl.glTexParameteri(this.glTarget, GL_TEXTURE_MIN_FILTER, min.getGLEnum()); Gdx.gl.glTexParameteri(this.glTarget, GL_TEXTURE_MAG_FILTER, mag.getGLEnum()); }
  unsafeSetWrap(u: any, v: any, force = false) {
    if (u != null && (force || this.uWrap !== u)) { Gdx.gl.glTexParameteri(this.glTarget, GL_TEXTURE_WRAP_S, u.getGLEnum()); this.uWrap = u; }
    if (v != null && (force || this.vWrap !== v)) { Gdx.gl.glTexParameteri(this.glTarget, GL_TEXTURE_WRAP_T, v.getGLEnum()); this.vWrap = v; }
  }
  setWrap(u: any, v: any) { this.uWrap = u; this.vWrap = v; this.bind(); Gdx.gl.glTexParameteri(this.glTarget, GL_TEXTURE_WRAP_S, u.getGLEnum()); Gdx.gl.glTexParameteri(this.glTarget, GL_TEXTURE_WRAP_T, v.getGLEnum()); }
  getMinFilter() { return this.minFilter; }
  getMagFilter() { return this.magFilter; }
  /** Draws a pixmap into the texture (glTexSubImage2D). */
  draw(pixmap: Pixmap, x: number, y: number) {
    this.bind();
    Gdx.gl.glTexSubImage2D(this.glTarget, 0, x, y, pixmap.getWidth(), pixmap.getHeight(), pixmap.getGLFormat(), pixmap.getGLType(), pixmap.getPixels());
  }
  dispose() {
    if (this.glHandle !== 0) {
      Gdx.gl.glDeleteTexture(this.glHandle);
      this.glHandle = 0;
    }
  }
  isManaged() { return false; }
}
defineLib(Texture, 'com.badlogic.gdx.graphics.Texture', { ifaces: ['com.badlogic.gdx.utils.Disposable'] });

/** TextureAtlas.AtlasRegion: only its type is used (BitmapFont checks for it); the game has no atlases. */
export class TextureAtlas_AtlasRegion extends JObject {}
defineLib(TextureAtlas_AtlasRegion, 'com.badlogic.gdx.graphics.g2d.TextureAtlas$AtlasRegion');

export { Pixmap_Format };
