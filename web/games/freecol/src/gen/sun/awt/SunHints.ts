// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/awt/SunHints.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2013, Oracle and/or its affiliates. All rights reserved.
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
 *
 * This code is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License version 2 only, as
 * published by the Free Software Foundation.  Oracle designates this
 * particular file as subject to the "Classpath" exception as provided
 * by Oracle in the LICENSE file that accompanied this code.
 *
 * This code is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
 * version 2 for more details (a copy is included in the LICENSE file that
 * accompanied this code).
 *
 * You should have received a copy of the GNU General Public License version
 * 2 along with this work; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * Please contact Oracle, 500 Oracle Parkway, Redwood Shores, CA 94065 USA
 * or visit www.oracle.com if you need additional information or have any
 * questions.
 */
import { $J, Integer, InternalError, JObject } from '../../../jre/index.ts';
import { RenderingHints$Key } from '../../java/awt/RenderingHints.ts';

/**
 * This class contains rendering hints that can be used by the
 * {@link java.awt.Graphics2D} class, and classes that implement
 * {@link java.awt.image.BufferedImageOp} and
 * {@link java.awt.image.Raster}.
 */
export class SunHints extends JObject {
  static readonly NUM_KEYS: number = 10;
  static readonly VALS_PER_KEY: number = 8;
  /**
   * Rendering hint key and values
   */
  static readonly INTKEY_RENDERING: number = 0;
  static readonly INTVAL_RENDER_DEFAULT: number = 0;
  static readonly INTVAL_RENDER_SPEED: number = 1;
  static readonly INTVAL_RENDER_QUALITY: number = 2;
  /**
   * Antialiasing hint key and values
   */
  static readonly INTKEY_ANTIALIASING: number = 1;
  static readonly INTVAL_ANTIALIAS_DEFAULT: number = 0;
  static readonly INTVAL_ANTIALIAS_OFF: number = 1;
  static readonly INTVAL_ANTIALIAS_ON: number = 2;
  /**
   * Text antialiasing hint key and values
   */
  static readonly INTKEY_TEXT_ANTIALIASING: number = 2;
  static readonly INTVAL_TEXT_ANTIALIAS_DEFAULT: number = 0;
  static readonly INTVAL_TEXT_ANTIALIAS_OFF: number = 1;
  static readonly INTVAL_TEXT_ANTIALIAS_ON: number = 2;
  static readonly INTVAL_TEXT_ANTIALIAS_GASP: number = 3;
  static readonly INTVAL_TEXT_ANTIALIAS_LCD_HRGB: number = 4;
  static readonly INTVAL_TEXT_ANTIALIAS_LCD_HBGR: number = 5;
  static readonly INTVAL_TEXT_ANTIALIAS_LCD_VRGB: number = 6;
  static readonly INTVAL_TEXT_ANTIALIAS_LCD_VBGR: number = 7;
  /**
   * Font fractional metrics hint key and values
   */
  static readonly INTKEY_FRACTIONALMETRICS: number = 3;
  static readonly INTVAL_FRACTIONALMETRICS_DEFAULT: number = 0;
  static readonly INTVAL_FRACTIONALMETRICS_OFF: number = 1;
  static readonly INTVAL_FRACTIONALMETRICS_ON: number = 2;
  /**
   * Dithering hint key and values
   */
  static readonly INTKEY_DITHERING: number = 4;
  static readonly INTVAL_DITHER_DEFAULT: number = 0;
  static readonly INTVAL_DITHER_DISABLE: number = 1;
  static readonly INTVAL_DITHER_ENABLE: number = 2;
  /**
   * Interpolation hint key and values
   */
  static readonly INTKEY_INTERPOLATION: number = 5;
  static readonly INTVAL_INTERPOLATION_NEAREST_NEIGHBOR: number = 0;
  static readonly INTVAL_INTERPOLATION_BILINEAR: number = 1;
  static readonly INTVAL_INTERPOLATION_BICUBIC: number = 2;
  /**
   * Alpha interpolation hint key and values
   */
  static readonly INTKEY_ALPHA_INTERPOLATION: number = 6;
  static readonly INTVAL_ALPHA_INTERPOLATION_DEFAULT: number = 0;
  static readonly INTVAL_ALPHA_INTERPOLATION_SPEED: number = 1;
  static readonly INTVAL_ALPHA_INTERPOLATION_QUALITY: number = 2;
  /**
   * Color rendering hint key and values
   */
  static readonly INTKEY_COLOR_RENDERING: number = 7;
  static readonly INTVAL_COLOR_RENDER_DEFAULT: number = 0;
  static readonly INTVAL_COLOR_RENDER_SPEED: number = 1;
  static readonly INTVAL_COLOR_RENDER_QUALITY: number = 2;
  /**
   * Stroke normalization control hint key and values
   */
  static readonly INTKEY_STROKE_CONTROL: number = 8;
  static readonly INTVAL_STROKE_DEFAULT: number = 0;
  static readonly INTVAL_STROKE_NORMALIZE: number = 1;
  static readonly INTVAL_STROKE_PURE: number = 2;
  /**
   * Image scaling hint key and values
   */
  static readonly INTKEY_RESOLUTION_VARIANT: number = 9;
  static readonly INTVAL_RESOLUTION_VARIANT_DEFAULT: number = 0;
  static readonly INTVAL_RESOLUTION_VARIANT_BASE: number = 1;
  static readonly INTVAL_RESOLUTION_VARIANT_SIZE_FIT: number = 2;
  static readonly INTVAL_RESOLUTION_VARIANT_DPI_FIT: number = 3;
  /**
   * LCD text contrast control hint key.
   * Value is "100" to make discontiguous with the others which
   * are all enumerative and are of a different class.
   */
  static readonly INTKEY_AATEXT_LCD_CONTRAST: number = 100;
  /**
   * Rendering hint key and value objects
   */
  static KEY_RENDERING: SunHints$Key = null;
  static VALUE_RENDER_SPEED: any = null;
  static VALUE_RENDER_QUALITY: any = null;
  static VALUE_RENDER_DEFAULT: any = null;
  /**
   * Antialiasing hint key and value objects
   */
  static KEY_ANTIALIASING: SunHints$Key = null;
  static VALUE_ANTIALIAS_ON: any = null;
  static VALUE_ANTIALIAS_OFF: any = null;
  static VALUE_ANTIALIAS_DEFAULT: any = null;
  /**
   * Text antialiasing hint key and value objects
   */
  static KEY_TEXT_ANTIALIASING: SunHints$Key = null;
  static VALUE_TEXT_ANTIALIAS_ON: any = null;
  static VALUE_TEXT_ANTIALIAS_OFF: any = null;
  static VALUE_TEXT_ANTIALIAS_DEFAULT: any = null;
  static VALUE_TEXT_ANTIALIAS_GASP: any = null;
  static VALUE_TEXT_ANTIALIAS_LCD_HRGB: any = null;
  static VALUE_TEXT_ANTIALIAS_LCD_HBGR: any = null;
  static VALUE_TEXT_ANTIALIAS_LCD_VRGB: any = null;
  static VALUE_TEXT_ANTIALIAS_LCD_VBGR: any = null;
  /**
   * Font fractional metrics hint key and value objects
   */
  static KEY_FRACTIONALMETRICS: SunHints$Key = null;
  static VALUE_FRACTIONALMETRICS_ON: any = null;
  static VALUE_FRACTIONALMETRICS_OFF: any = null;
  static VALUE_FRACTIONALMETRICS_DEFAULT: any = null;
  /**
   * Dithering hint key and value objects
   */
  static KEY_DITHERING: SunHints$Key = null;
  static VALUE_DITHER_ENABLE: any = null;
  static VALUE_DITHER_DISABLE: any = null;
  static VALUE_DITHER_DEFAULT: any = null;
  /**
   * Interpolation hint key and value objects
   */
  static KEY_INTERPOLATION: SunHints$Key = null;
  static VALUE_INTERPOLATION_NEAREST_NEIGHBOR: any = null;
  static VALUE_INTERPOLATION_BILINEAR: any = null;
  static VALUE_INTERPOLATION_BICUBIC: any = null;
  /**
   * Alpha interpolation hint key and value objects
   */
  static KEY_ALPHA_INTERPOLATION: SunHints$Key = null;
  static VALUE_ALPHA_INTERPOLATION_SPEED: any = null;
  static VALUE_ALPHA_INTERPOLATION_QUALITY: any = null;
  static VALUE_ALPHA_INTERPOLATION_DEFAULT: any = null;
  /**
   * Color rendering hint key and value objects
   */
  static KEY_COLOR_RENDERING: SunHints$Key = null;
  static VALUE_COLOR_RENDER_SPEED: any = null;
  static VALUE_COLOR_RENDER_QUALITY: any = null;
  static VALUE_COLOR_RENDER_DEFAULT: any = null;
  /**
   * Stroke normalization control hint key and value objects
   */
  static KEY_STROKE_CONTROL: SunHints$Key = null;
  static VALUE_STROKE_DEFAULT: any = null;
  static VALUE_STROKE_NORMALIZE: any = null;
  static VALUE_STROKE_PURE: any = null;
  /**
   * Image resolution variant hint key and value objects
   */
  static KEY_RESOLUTION_VARIANT: SunHints$Key = null;
  static VALUE_RESOLUTION_VARIANT_DEFAULT: any = null;
  static VALUE_RESOLUTION_VARIANT_BASE: any = null;
  static VALUE_RESOLUTION_VARIANT_SIZE_FIT: any = null;
  static VALUE_RESOLUTION_VARIANT_DPI_FIT: any = null;
  /**
   * LCD text contrast hint key
   */
  static KEY_TEXT_ANTIALIAS_LCD_CONTRAST: RenderingHints$Key = null;
  static $clinit() {
    SunHints.KEY_RENDERING = new SunHints$Key()._SunHints$Key(SunHints.INTKEY_RENDERING, 'Global rendering quality key');
    SunHints.VALUE_RENDER_SPEED = new SunHints$Value()._SunHints$Value(SunHints.KEY_RENDERING, SunHints.INTVAL_RENDER_SPEED, 'Fastest rendering methods');
    SunHints.VALUE_RENDER_QUALITY = new SunHints$Value()._SunHints$Value(SunHints.KEY_RENDERING, SunHints.INTVAL_RENDER_QUALITY, 'Highest quality rendering methods');
    SunHints.VALUE_RENDER_DEFAULT = new SunHints$Value()._SunHints$Value(SunHints.KEY_RENDERING, SunHints.INTVAL_RENDER_DEFAULT, 'Default rendering methods');
    SunHints.KEY_ANTIALIASING = new SunHints$Key()._SunHints$Key(SunHints.INTKEY_ANTIALIASING, 'Global antialiasing enable key');
    SunHints.VALUE_ANTIALIAS_ON = new SunHints$Value()._SunHints$Value(SunHints.KEY_ANTIALIASING, SunHints.INTVAL_ANTIALIAS_ON, 'Antialiased rendering mode');
    SunHints.VALUE_ANTIALIAS_OFF = new SunHints$Value()._SunHints$Value(SunHints.KEY_ANTIALIASING, SunHints.INTVAL_ANTIALIAS_OFF, 'Nonantialiased rendering mode');
    SunHints.VALUE_ANTIALIAS_DEFAULT = new SunHints$Value()._SunHints$Value(SunHints.KEY_ANTIALIASING, SunHints.INTVAL_ANTIALIAS_DEFAULT, 'Default antialiasing rendering mode');
    SunHints.KEY_TEXT_ANTIALIASING = new SunHints$Key()._SunHints$Key(SunHints.INTKEY_TEXT_ANTIALIASING, 'Text-specific antialiasing enable key');
    SunHints.VALUE_TEXT_ANTIALIAS_ON = new SunHints$Value()._SunHints$Value(SunHints.KEY_TEXT_ANTIALIASING, SunHints.INTVAL_TEXT_ANTIALIAS_ON, 'Antialiased text mode');
    SunHints.VALUE_TEXT_ANTIALIAS_OFF = new SunHints$Value()._SunHints$Value(SunHints.KEY_TEXT_ANTIALIASING, SunHints.INTVAL_TEXT_ANTIALIAS_OFF, 'Nonantialiased text mode');
    SunHints.VALUE_TEXT_ANTIALIAS_DEFAULT = new SunHints$Value()._SunHints$Value(SunHints.KEY_TEXT_ANTIALIASING, SunHints.INTVAL_TEXT_ANTIALIAS_DEFAULT, 'Default antialiasing text mode');
    SunHints.VALUE_TEXT_ANTIALIAS_GASP = new SunHints$Value()._SunHints$Value(SunHints.KEY_TEXT_ANTIALIASING, SunHints.INTVAL_TEXT_ANTIALIAS_GASP, 'gasp antialiasing text mode');
    SunHints.VALUE_TEXT_ANTIALIAS_LCD_HRGB = new SunHints$Value()._SunHints$Value(SunHints.KEY_TEXT_ANTIALIASING, SunHints.INTVAL_TEXT_ANTIALIAS_LCD_HRGB, 'LCD HRGB antialiasing text mode');
    SunHints.VALUE_TEXT_ANTIALIAS_LCD_HBGR = new SunHints$Value()._SunHints$Value(SunHints.KEY_TEXT_ANTIALIASING, SunHints.INTVAL_TEXT_ANTIALIAS_LCD_HBGR, 'LCD HBGR antialiasing text mode');
    SunHints.VALUE_TEXT_ANTIALIAS_LCD_VRGB = new SunHints$Value()._SunHints$Value(SunHints.KEY_TEXT_ANTIALIASING, SunHints.INTVAL_TEXT_ANTIALIAS_LCD_VRGB, 'LCD VRGB antialiasing text mode');
    SunHints.VALUE_TEXT_ANTIALIAS_LCD_VBGR = new SunHints$Value()._SunHints$Value(SunHints.KEY_TEXT_ANTIALIASING, SunHints.INTVAL_TEXT_ANTIALIAS_LCD_VBGR, 'LCD VBGR antialiasing text mode');
    SunHints.KEY_FRACTIONALMETRICS = new SunHints$Key()._SunHints$Key(SunHints.INTKEY_FRACTIONALMETRICS, 'Fractional metrics enable key');
    SunHints.VALUE_FRACTIONALMETRICS_ON = new SunHints$Value()._SunHints$Value(SunHints.KEY_FRACTIONALMETRICS, SunHints.INTVAL_FRACTIONALMETRICS_ON, 'Fractional text metrics mode');
    SunHints.VALUE_FRACTIONALMETRICS_OFF = new SunHints$Value()._SunHints$Value(SunHints.KEY_FRACTIONALMETRICS, SunHints.INTVAL_FRACTIONALMETRICS_OFF, 'Integer text metrics mode');
    SunHints.VALUE_FRACTIONALMETRICS_DEFAULT = new SunHints$Value()._SunHints$Value(SunHints.KEY_FRACTIONALMETRICS, SunHints.INTVAL_FRACTIONALMETRICS_DEFAULT, 'Default fractional text metrics mode');
    SunHints.KEY_DITHERING = new SunHints$Key()._SunHints$Key(SunHints.INTKEY_DITHERING, 'Dithering quality key');
    SunHints.VALUE_DITHER_ENABLE = new SunHints$Value()._SunHints$Value(SunHints.KEY_DITHERING, SunHints.INTVAL_DITHER_ENABLE, 'Dithered rendering mode');
    SunHints.VALUE_DITHER_DISABLE = new SunHints$Value()._SunHints$Value(SunHints.KEY_DITHERING, SunHints.INTVAL_DITHER_DISABLE, 'Nondithered rendering mode');
    SunHints.VALUE_DITHER_DEFAULT = new SunHints$Value()._SunHints$Value(SunHints.KEY_DITHERING, SunHints.INTVAL_DITHER_DEFAULT, 'Default dithering mode');
    SunHints.KEY_INTERPOLATION = new SunHints$Key()._SunHints$Key(SunHints.INTKEY_INTERPOLATION, 'Image interpolation method key');
    SunHints.VALUE_INTERPOLATION_NEAREST_NEIGHBOR = new SunHints$Value()._SunHints$Value(SunHints.KEY_INTERPOLATION, SunHints.INTVAL_INTERPOLATION_NEAREST_NEIGHBOR, 'Nearest Neighbor image interpolation mode');
    SunHints.VALUE_INTERPOLATION_BILINEAR = new SunHints$Value()._SunHints$Value(SunHints.KEY_INTERPOLATION, SunHints.INTVAL_INTERPOLATION_BILINEAR, 'Bilinear image interpolation mode');
    SunHints.VALUE_INTERPOLATION_BICUBIC = new SunHints$Value()._SunHints$Value(SunHints.KEY_INTERPOLATION, SunHints.INTVAL_INTERPOLATION_BICUBIC, 'Bicubic image interpolation mode');
    SunHints.KEY_ALPHA_INTERPOLATION = new SunHints$Key()._SunHints$Key(SunHints.INTKEY_ALPHA_INTERPOLATION, 'Alpha blending interpolation method key');
    SunHints.VALUE_ALPHA_INTERPOLATION_SPEED = new SunHints$Value()._SunHints$Value(SunHints.KEY_ALPHA_INTERPOLATION, SunHints.INTVAL_ALPHA_INTERPOLATION_SPEED, 'Fastest alpha blending methods');
    SunHints.VALUE_ALPHA_INTERPOLATION_QUALITY = new SunHints$Value()._SunHints$Value(SunHints.KEY_ALPHA_INTERPOLATION, SunHints.INTVAL_ALPHA_INTERPOLATION_QUALITY, 'Highest quality alpha blending methods');
    SunHints.VALUE_ALPHA_INTERPOLATION_DEFAULT = new SunHints$Value()._SunHints$Value(SunHints.KEY_ALPHA_INTERPOLATION, SunHints.INTVAL_ALPHA_INTERPOLATION_DEFAULT, 'Default alpha blending methods');
    SunHints.KEY_COLOR_RENDERING = new SunHints$Key()._SunHints$Key(SunHints.INTKEY_COLOR_RENDERING, 'Color rendering quality key');
    SunHints.VALUE_COLOR_RENDER_SPEED = new SunHints$Value()._SunHints$Value(SunHints.KEY_COLOR_RENDERING, SunHints.INTVAL_COLOR_RENDER_SPEED, 'Fastest color rendering mode');
    SunHints.VALUE_COLOR_RENDER_QUALITY = new SunHints$Value()._SunHints$Value(SunHints.KEY_COLOR_RENDERING, SunHints.INTVAL_COLOR_RENDER_QUALITY, 'Highest quality color rendering mode');
    SunHints.VALUE_COLOR_RENDER_DEFAULT = new SunHints$Value()._SunHints$Value(SunHints.KEY_COLOR_RENDERING, SunHints.INTVAL_COLOR_RENDER_DEFAULT, 'Default color rendering mode');
    SunHints.KEY_STROKE_CONTROL = new SunHints$Key()._SunHints$Key(SunHints.INTKEY_STROKE_CONTROL, 'Stroke normalization control key');
    SunHints.VALUE_STROKE_DEFAULT = new SunHints$Value()._SunHints$Value(SunHints.KEY_STROKE_CONTROL, SunHints.INTVAL_STROKE_DEFAULT, 'Default stroke normalization');
    SunHints.VALUE_STROKE_NORMALIZE = new SunHints$Value()._SunHints$Value(SunHints.KEY_STROKE_CONTROL, SunHints.INTVAL_STROKE_NORMALIZE, 'Normalize strokes for consistent rendering');
    SunHints.VALUE_STROKE_PURE = new SunHints$Value()._SunHints$Value(SunHints.KEY_STROKE_CONTROL, SunHints.INTVAL_STROKE_PURE, 'Pure stroke conversion for accurate paths');
    SunHints.KEY_RESOLUTION_VARIANT = new SunHints$Key()._SunHints$Key(SunHints.INTKEY_RESOLUTION_VARIANT, 'Global image resolution variant key');
    SunHints.VALUE_RESOLUTION_VARIANT_DEFAULT = new SunHints$Value()._SunHints$Value(SunHints.KEY_RESOLUTION_VARIANT, SunHints.INTVAL_RESOLUTION_VARIANT_DEFAULT, 'Choose image resolutions based on a defaultheuristic');
    SunHints.VALUE_RESOLUTION_VARIANT_BASE = new SunHints$Value()._SunHints$Value(SunHints.KEY_RESOLUTION_VARIANT, SunHints.INTVAL_RESOLUTION_VARIANT_BASE, 'Use only the standard resolution of an image');
    SunHints.VALUE_RESOLUTION_VARIANT_SIZE_FIT = new SunHints$Value()._SunHints$Value(SunHints.KEY_RESOLUTION_VARIANT, SunHints.INTVAL_RESOLUTION_VARIANT_SIZE_FIT, 'Choose image resolutions based on the DPIof the screen and transformin the Graphics2D context');
    SunHints.VALUE_RESOLUTION_VARIANT_DPI_FIT = new SunHints$Value()._SunHints$Value(SunHints.KEY_RESOLUTION_VARIANT, SunHints.INTVAL_RESOLUTION_VARIANT_DPI_FIT, 'Choose image resolutions based only on the DPI of the screen');
    SunHints.KEY_TEXT_ANTIALIAS_LCD_CONTRAST = new SunHints$LCDContrastKey()._SunHints$LCDContrastKey(SunHints.INTKEY_AATEXT_LCD_CONTRAST, 'Text-specific LCD contrast key');
  }
}

/**
 * Defines the type of all keys used to control various
 * aspects of the rendering and imaging pipelines.  Instances
 * of this class are immutable and unique which means that
 * tests for matches can be made using the == operator instead
 * of the more expensive equals() method.
 */
export class SunHints$Key extends RenderingHints$Key {
  description_: string = null;
  /**
   * Construct a key using the indicated private key.  Each
   * subclass of Key maintains its own unique domain of integer
   * keys.  No two objects with the same integer key and of the
   * same specific subclass can be constructed.  An exception
   * will be thrown if an attempt is made to construct another
   * object of a given class with the same integer key as a
   * pre-existing instance of that subclass of Key.
   */
  _SunHints$Key(privatekey: number, description: string): this {
    this._RenderingHints$Key(privatekey);
    this.description_ = description;
    return this;
  }
  /**
   * Returns the numeric index associated with this Key.  This
   * is useful for use in switch statements and quick lookups
   * of the setting of a particular key.
   */
  getIndex(): number {
    return this.intKey();
  }
  /**
   * Returns a string representation of the Key.
   */
  toString(): string {
    return this.description_;
  }
  /**
   * Returns true if the specified object is a valid value
   * for this Key.
   */
  isCompatibleValue(val: any): boolean {
    if (val instanceof SunHints$Value) {
      return (val).isCompatibleKey(this);
    }
    return false;
  }
}

/**
 * Defines the type of all "enumerative" values used to control
 * various aspects of the rendering and imaging pipelines.  Instances
 * of this class are immutable and unique which means that
 * tests for matches can be made using the == operator instead
 * of the more expensive equals() method.
 */
export class SunHints$Value extends JObject {
  myKey: SunHints$Key = null;
  index_: number = 0;
  description_: string = null;
  static ValueObjects: SunHints$Value[][] = null;
  /**
   * Construct a value using the indicated private index.  Each
   * subclass of Value maintains its own unique domain of integer
   * indices.  Enforcing the uniqueness of the integer indices
   * is left to the subclass.
   */
  _SunHints$Value(key: SunHints$Key, index: number, description: string): this {
    this.myKey = key;
    this.index_ = index;
    this.description_ = description;
    SunHints$Value.register(key, this);
    return this;
  }
  static register(key: SunHints$Key, value: SunHints$Value): void {
    let kindex = key.getIndex();
    let vindex = value.getIndex();
    if (SunHints$Value.ValueObjects[kindex][vindex] != null) {
      throw new InternalError('duplicate index: ' + vindex);
    }
    SunHints$Value.ValueObjects[kindex][vindex] = value;
  }
  /**
   * Returns the numeric index associated with this Key.  This
   * is useful for use in switch statements and quick lookups
   * of the setting of a particular key.
   */
  getIndex(): number {
    return this.index_;
  }
  /**
   * Returns a string representation of this Value.
   */
  toString(): string {
    return this.description_;
  }
  /**
   * Returns true if the specified object is a valid Key
   * for this Value.
   */
  isCompatibleKey(k: SunHints$Key): boolean {
    return this.myKey === k;
  }
  /**
   * The hash code for all SunHints.Value objects will be the same
   * as the system identity code of the object as defined by the
   * System.identityHashCode() method.
   */
  hashCode(): number {
    return $J.system_identityHashCode(this);
  }
  /**
   * The equals method for all SunHints.Value objects will return
   * the same result as the equality operator '=='.
   */
  equals(o: any): boolean {
    return this === o;
  }
  static $clinit() {
    SunHints$Value.ValueObjects = $J.newArrayN([SunHints.NUM_KEYS, SunHints.VALS_PER_KEY], null);
  }
}

export class SunHints$LCDContrastKey extends SunHints$Key {
  _SunHints$LCDContrastKey(privatekey: number, description: string): this {
    this._SunHints$Key(privatekey, description);
    return this;
  }
  /**
   * Returns true if the specified object is a valid value
   * for this Key. The allowable range is 100 to 250.
   */
  isCompatibleValue(val: any): boolean {
    if ($J.isa(val, Integer)) {
      let ival = (+(val));
      return ival >= 100 && ival <= 250;
    }
    return false;
  }
}

$J.define(SunHints, 'sun.awt.SunHints', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_SunHints' }, clinit: true, lazy: ['KEY_RENDERING', 'VALUE_RENDER_SPEED', 'VALUE_RENDER_QUALITY', 'VALUE_RENDER_DEFAULT', 'KEY_ANTIALIASING', 'VALUE_ANTIALIAS_ON', 'VALUE_ANTIALIAS_OFF', 'VALUE_ANTIALIAS_DEFAULT', 'KEY_TEXT_ANTIALIASING', 'VALUE_TEXT_ANTIALIAS_ON', 'VALUE_TEXT_ANTIALIAS_OFF', 'VALUE_TEXT_ANTIALIAS_DEFAULT', 'VALUE_TEXT_ANTIALIAS_GASP', 'VALUE_TEXT_ANTIALIAS_LCD_HRGB', 'VALUE_TEXT_ANTIALIAS_LCD_HBGR', 'VALUE_TEXT_ANTIALIAS_LCD_VRGB', 'VALUE_TEXT_ANTIALIAS_LCD_VBGR', 'KEY_FRACTIONALMETRICS', 'VALUE_FRACTIONALMETRICS_ON', 'VALUE_FRACTIONALMETRICS_OFF', 'VALUE_FRACTIONALMETRICS_DEFAULT', 'KEY_DITHERING', 'VALUE_DITHER_ENABLE', 'VALUE_DITHER_DISABLE', 'VALUE_DITHER_DEFAULT', 'KEY_INTERPOLATION', 'VALUE_INTERPOLATION_NEAREST_NEIGHBOR', 'VALUE_INTERPOLATION_BILINEAR', 'VALUE_INTERPOLATION_BICUBIC', 'KEY_ALPHA_INTERPOLATION', 'VALUE_ALPHA_INTERPOLATION_SPEED', 'VALUE_ALPHA_INTERPOLATION_QUALITY', 'VALUE_ALPHA_INTERPOLATION_DEFAULT', 'KEY_COLOR_RENDERING', 'VALUE_COLOR_RENDER_SPEED', 'VALUE_COLOR_RENDER_QUALITY', 'VALUE_COLOR_RENDER_DEFAULT', 'KEY_STROKE_CONTROL', 'VALUE_STROKE_DEFAULT', 'VALUE_STROKE_NORMALIZE', 'VALUE_STROKE_PURE', 'KEY_RESOLUTION_VARIANT', 'VALUE_RESOLUTION_VARIANT_DEFAULT', 'VALUE_RESOLUTION_VARIANT_BASE', 'VALUE_RESOLUTION_VARIANT_SIZE_FIT', 'VALUE_RESOLUTION_VARIANT_DPI_FIT', 'KEY_TEXT_ANTIALIAS_LCD_CONTRAST'] });
$J.define(SunHints$Key, 'sun.awt.SunHints$Key', { kind: 'class', sup: 'java.awt.RenderingHints$Key', ctors: { 'int,java.lang.String': '_SunHints$Key' } });
$J.define(SunHints$Value, 'sun.awt.SunHints$Value', { kind: 'class', sup: 'java.lang.Object', ctors: { 'sun.awt.SunHints$Key,int,java.lang.String': '_SunHints$Value' }, clinit: true, lazy: ['ValueObjects'] });
$J.define(SunHints$LCDContrastKey, 'sun.awt.SunHints$LCDContrastKey', { kind: 'class', sup: 'sun.awt.SunHints$Key', ctors: { 'int,java.lang.String': '_SunHints$LCDContrastKey' } });
