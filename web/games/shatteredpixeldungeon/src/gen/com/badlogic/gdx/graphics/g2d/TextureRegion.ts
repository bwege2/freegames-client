// @ts-nocheck
// TextureRegion.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
/*******************************************************************************
 * Copyright 2011 See AUTHORS file.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *   http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ******************************************************************************/
import { $J, IllegalArgumentException, JObject } from '../../../../../../jre/index.ts';

/**
 * Defines a rectangular area of a texture. The coordinate system used has its origin in the upper left corner with the x-axis
 * pointing to the right and the y axis pointing downwards.
 * @author mzechner
 * @author Nathan Sweet
 */
export class TextureRegion extends JObject {
  texture_: Texture = null;
  u: number = 0;
  v: number = 0;
  u2: number = 0;
  v2: number = 0;
  regionWidth: number = 0;
  regionHeight: number = 0;
  /**
   * Constructs a region the size of the specified texture.
   */
  _TextureRegion$Texture(texture: Texture): this {
    if (texture == null) {
      throw new IllegalArgumentException('texture cannot be null.');
    }
    this.texture_ = texture;
    this.setRegion$int$int$int$int(0, 0, texture.getWidth(), texture.getHeight());
    return this;
  }
  /**
   * @param width The width of the texture region. May be negative to flip the sprite when drawn.
   * @param height The height of the texture region. May be negative to flip the sprite when drawn.
   */
  setRegion$int$int$int$int(x: number, y: number, width: number, height: number): void {
    let invTexWidth = Math.fround(1 / this.texture_.getWidth());
    let invTexHeight = Math.fround(1 / this.texture_.getHeight());
    this.setRegion$float$float$float$float(Math.fround(x * invTexWidth), Math.fround(y * invTexHeight), Math.fround(((x + width) | 0) * invTexWidth), Math.fround(((y + height) | 0) * invTexHeight));
    this.regionWidth = Math.abs(width);
    this.regionHeight = Math.abs(height);
  }
  setRegion$float$float$float$float(u: number, v: number, u2: number, v2: number): void {
    let texWidth = this.texture_.getWidth();
    let texHeight = this.texture_.getHeight();
    this.regionWidth = $J.roundf(Math.fround(Math.fround(Math.abs(Math.fround(u2 - u))) * texWidth));
    this.regionHeight = $J.roundf(Math.fround(Math.fround(Math.abs(Math.fround(v2 - v))) * texHeight));
    if (this.regionWidth === 1 && this.regionHeight === 1) {
      let adjustX = Math.fround(0.25 / texWidth);
      u = Math.fround(u + adjustX);
      u2 = Math.fround(u2 - adjustX);
      let adjustY = Math.fround(0.25 / texHeight);
      v = Math.fround(v + adjustY);
      v2 = Math.fround(v2 - adjustY);
    }
    this.u = u;
    this.v = v;
    this.u2 = u2;
    this.v2 = v2;
  }
  getTexture(): Texture {
    return this.texture_;
  }
  /**
   * Returns the region's width.
   */
  getRegionWidth(): number {
    return this.regionWidth;
  }
  /**
   * Returns the region's height.
   */
  getRegionHeight(): number {
    return this.regionHeight;
  }
}

$J.define(TextureRegion, 'com.badlogic.gdx.graphics.g2d.TextureRegion', { kind: 'class', sup: 'java.lang.Object', ctors: { 'com.badlogic.gdx.graphics.g2d.TextureRegion,int,int,int,int': '_TextureRegion$TextureRegion$int$int$int$int', 'com.badlogic.gdx.graphics.g2d.TextureRegion': '_TextureRegion$TextureRegion', 'com.badlogic.gdx.graphics.Texture,float,float,float,float': '_TextureRegion$Texture$float$float$float$float', 'com.badlogic.gdx.graphics.Texture,int,int,int,int': '_TextureRegion$Texture$int$int$int$int', 'com.badlogic.gdx.graphics.Texture,int,int': '_TextureRegion$Texture$int$int', 'com.badlogic.gdx.graphics.Texture': '_TextureRegion$Texture', '': '_TextureRegion$' }, meths: { 'setRegion(com.badlogic.gdx.graphics.g2d.TextureRegion,int,int,int,int)': 'setRegion$TextureRegion$int$int$int$int', 'setRegion(com.badlogic.gdx.graphics.g2d.TextureRegion)': 'setRegion$TextureRegion', 'setRegion(float,float,float,float)': 'setRegion$float$float$float$float', 'setRegion(int,int,int,int)': 'setRegion$int$int$int$int', 'setRegion(com.badlogic.gdx.graphics.Texture)': 'setRegion$Texture' } });
