// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/image/ColorConvertOp.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2024, Oracle and/or its affiliates. All rights reserved.
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
import { $J, BufferedImage, CMSManager, ColorSpace, ICC_ColorSpace, ICC_Profile, IllegalArgumentException, JObject, NullPointerException } from '../../../../jre/index.ts';

let ComponentColorModel, DataBuffer, IndexColorModel;

/**
 * This class performs a pixel-by-pixel color conversion of the data in
 * the source image.  The resulting color values are scaled to the precision
 * of the destination image.  Color conversion can be specified
 * via an array of ColorSpace objects or an array of ICC_Profile objects.
 * <p>
 * If the source is a BufferedImage with premultiplied alpha, the
 * color components are divided by the alpha component before color conversion.
 * If the destination is a BufferedImage with premultiplied alpha, the
 * color components are multiplied by the alpha component after conversion.
 * Rasters are treated as having no alpha channel, i.e. all bands are
 * color bands.
 * <p>
 * If a RenderingHints object is specified in the constructor, the
 * color rendering hint and the dithering hint may be used to control
 * color conversion.
 * <p>
 * Note that Source and Destination may be the same object.
 * @see java.awt.RenderingHints#KEY_COLOR_RENDERING
 * @see java.awt.RenderingHints#KEY_DITHERING
 */
export class ColorConvertOp extends JObject {
  profileList: ICC_Profile[] = null;
  CSList: ColorSpace[] = null;
  thisTransform: ColorTransform = null;
  thisRasterTransform: ColorTransform = null;
  thisSrcProfile: ICC_Profile = null;
  thisDestProfile: ICC_Profile = null;
  hints: RenderingHints = null;
  gotProfiles: boolean = false;
  srcMinVals: number[] = null;
  srcMaxVals: number[] = null;
  dstMinVals: number[] = null;
  dstMaxVals: number[] = null;
  /**
   * Constructs a new ColorConvertOp which will convert
   * from a source color space to a destination color space.
   * The RenderingHints argument may be null.
   * This Op can be used only with BufferedImages, and will convert
   * directly from the ColorSpace of the source image to that of the
   * destination.  The destination argument of the filter method
   * cannot be specified as null.
   * @param hints the {@code RenderingHints} object used to control
   *        the color conversion, or {@code null}
   */
  _ColorConvertOp$RenderingHints(hints: RenderingHints): this {
    this.profileList = $J.newArray(0, null);
    this.hints = hints;
    return this;
  }
  /**
   * Constructs a new ColorConvertOp from a ColorSpace object.
   * The RenderingHints argument may be null.  This
   * Op can be used only with BufferedImages, and is primarily useful
   * when the {@link #filter(BufferedImage, BufferedImage) filter}
   * method is invoked with a destination argument of null.
   * In that case, the ColorSpace defines the destination color space
   * for the destination created by the filter method.  Otherwise, the
   * ColorSpace defines an intermediate space to which the source is
   * converted before being converted to the destination space.
   * @param cspace defines the destination {@code ColorSpace} or an
   *        intermediate {@code ColorSpace}
   * @param hints the {@code RenderingHints} object used to control
   *        the color conversion, or {@code null}
   * @throws NullPointerException if cspace is null
   */
  _ColorConvertOp$ColorSpace$RenderingHints(cspace: ColorSpace, hints: RenderingHints): this {
    if (cspace == null) {
      throw new NullPointerException('ColorSpace cannot be null');
    }
    if ($J.isa(cspace, ICC_ColorSpace)) {
      this.profileList = $J.newArray(1, null);
      this.profileList[0] = (cspace).getProfile();
    } else {
      this.CSList = $J.newArray(1, null);
      this.CSList[0] = cspace;
    }
    this.hints = hints;
    return this;
  }
  /**
   * ColorConverts the source BufferedImage.
   * If the destination image is null,
   * a BufferedImage will be created with an appropriate ColorModel.
   * @param src the source {@code BufferedImage} to be converted
   * @param dest the destination {@code BufferedImage},
   *        or {@code null}
   * @return {@code dest} color converted from {@code src}
   *         or a new, converted {@code BufferedImage}
   *         if {@code dest} is {@code null}
   * @throws IllegalArgumentException if dest is null and this op was
   *             constructed using the constructor which takes only a
   *             RenderingHints argument, since the operation is ill defined.
   */
  filter$BufferedImage$BufferedImage(src: BufferedImage, dest: BufferedImage): BufferedImage {
    let srcColorSpace: ColorSpace;
    let destColorSpace: ColorSpace;
    let savdest = null;
    if (src.getColorModel() instanceof IndexColorModel) {
      let icm = src.getColorModel();
      src = icm.convertToIntDiscrete(src.getRaster(), true);
    }
    srcColorSpace = src.getColorModel().getColorSpace();
    if (dest != null) {
      if (dest.getColorModel() instanceof IndexColorModel) {
        savdest = dest;
        dest = null;
        destColorSpace = null;
      } else {
        destColorSpace = dest.getColorModel().getColorSpace();
      }
    } else {
      destColorSpace = null;
    }
    if ((this.CSList != null) || (!($J.isa(srcColorSpace, ICC_ColorSpace))) || ((dest != null) && (!($J.isa(destColorSpace, ICC_ColorSpace))))) {
      dest = this.nonICCBIFilter(src, srcColorSpace, dest, destColorSpace);
    } else {
      dest = this.ICCBIFilter(src, srcColorSpace, dest, destColorSpace);
    }
    if (savdest != null) {
      let big = savdest.createGraphics();
      try {
        big.drawImage$Image$int$int$ImageObserver(dest, 0, 0, null);
      } finally {
        big.dispose();
      }
      return savdest;
    } else {
      return dest;
    }
  }
  ICCBIFilter(src: BufferedImage, srcColorSpace: ColorSpace, dest: BufferedImage, destColorSpace: ColorSpace): BufferedImage {
    let nProfiles = this.profileList.length;
    let srcProfile = null;
    let destProfile = null;
    srcProfile = (srcColorSpace).getProfile();
    if (dest == null) {
      if (nProfiles === 0) {
        throw new IllegalArgumentException('Destination ColorSpace is undefined');
      }
      destProfile = this.profileList[(nProfiles - 1) | 0];
      dest = this.createCompatibleDestImage$BufferedImage$ColorModel(src, null);
    } else {
      if (src.getHeight() !== dest.getHeight() || src.getWidth() !== dest.getWidth()) {
        throw new IllegalArgumentException('Width or height of BufferedImages do not match');
      }
      destProfile = (destColorSpace).getProfile();
    }
    if (srcProfile === destProfile) {
      let noTrans = true;
      for (let i = 0; i < nProfiles; i++) {
        if (srcProfile !== this.profileList[i]) {
          noTrans = false;
          break;
        }
      }
      if (noTrans) {
        let g = dest.createGraphics();
        try {
          g.drawImage$Image$int$int$ImageObserver(src, 0, 0, null);
        } finally {
          g.dispose();
        }
        return dest;
      }
    }
    if ((this.thisTransform == null) || (this.thisSrcProfile !== srcProfile) || (this.thisDestProfile !== destProfile)) {
      this.updateBITransform(srcProfile, destProfile);
    }
    this.thisTransform.colorConvert(src, dest);
    return dest;
  }
  updateBITransform(srcProfile: ICC_Profile, destProfile: ICC_Profile): void {
    let theProfiles: ICC_Profile[];
    let i1: number;
    let nProfiles: number;
    let nTransforms: number;
    let renderingIntent: number;
    let useSrc = false;
    let useDest = false;
    nProfiles = this.profileList.length;
    nTransforms = nProfiles;
    if ((nProfiles === 0) || (srcProfile !== this.profileList[0])) {
      nTransforms = (nTransforms + 1) | 0;
      useSrc = true;
    }
    if ((nProfiles === 0) || (destProfile !== (this.profileList[(nProfiles - 1) | 0])) || (nTransforms < 2)) {
      nTransforms = (nTransforms + 1) | 0;
      useDest = true;
    }
    theProfiles = $J.newArray(nTransforms, null);
    let idx = 0;
    if (useSrc) {
      theProfiles[idx++] = srcProfile;
    }
    for (i1 = 0; i1 < nProfiles; i1++) {
      theProfiles[idx++] = this.profileList[i1];
    }
    if (useDest) {
      theProfiles[idx] = destProfile;
    }
    if (theProfiles[0].getProfileClass() === 2) {
      renderingIntent = 1;
    } else {
      renderingIntent = 0;
    }
    let mdl = CMSManager.getModule();
    this.thisTransform = mdl.createTransform(renderingIntent, ...theProfiles);
    this.thisSrcProfile = srcProfile;
    this.thisDestProfile = destProfile;
  }
  /**
   * Creates a zeroed destination image with the correct size and number of
   * bands, given this source.
   * @param src       Source image for the filter operation.
   * @param destCM    ColorModel of the destination.  If null, an
   *                  appropriate ColorModel will be used.
   * @return a {@code BufferedImage} with the correct size and
   * number of bands from the specified {@code src}.
   * @throws IllegalArgumentException if {@code destCM} is
   *         {@code null} and this {@code ColorConvertOp} was
   *         created without any {@code ICC_Profile} or
   *         {@code ColorSpace} defined for the destination
   */
  createCompatibleDestImage$BufferedImage$ColorModel(src: BufferedImage, destCM: ColorModel): BufferedImage {
    let cs = null;
    if (destCM == null) {
      if (this.CSList == null) {
        let nProfiles = this.profileList.length;
        if (nProfiles === 0) {
          throw new IllegalArgumentException('Destination ColorSpace is undefined');
        }
        let destProfile = this.profileList[(nProfiles - 1) | 0];
        cs = ColorConvertOp.createCompatibleColorSpace(destProfile);
      } else {
        let nSpaces = this.CSList.length;
        cs = this.CSList[(nSpaces - 1) | 0];
      }
    }
    return this.createCompatibleDestImage$BufferedImage$ColorModel$ColorSpace$ColorConvertOp(src, destCM, cs);
  }
  static createCompatibleColorSpace(profile: ICC_Profile): ColorSpace {
    if (profile === ICC_Profile.getInstance(1000)) {
      return ColorSpace.getInstance(1000);
    }
    if (profile === ICC_Profile.getInstance(1004)) {
      return ColorSpace.getInstance(1004);
    }
    if (profile === ICC_Profile.getInstance(1001)) {
      return ColorSpace.getInstance(1001);
    }
    if (profile === ICC_Profile.getInstance(1002)) {
      return ColorSpace.getInstance(1002);
    }
    if (profile === ICC_Profile.getInstance(1003)) {
      return ColorSpace.getInstance(1003);
    }
    return new ICC_ColorSpace(profile);
  }
  createCompatibleDestImage$BufferedImage$ColorModel$ColorSpace$ColorConvertOp(src: BufferedImage, destCM: ColorModel, destCS: ColorSpace): BufferedImage {
    let image: BufferedImage;
    if (destCM == null) {
      let srcCM = src.getColorModel();
      let nbands = destCS.getNumComponents();
      let hasAlpha = srcCM.hasAlpha();
      if (hasAlpha) {
        nbands = (nbands + 1) | 0;
      }
      let nbits = $J.newArray(nbands, 0);
      for (let i = 0; i < nbands; i++) {
        nbits[i] = 8;
      }
      destCM = new ComponentColorModel()._ComponentColorModel$ColorSpace$intArr$boolean$boolean$int$int(destCS, nbits, hasAlpha, srcCM.isAlphaPremultiplied(), srcCM.getTransparency(), DataBuffer.TYPE_BYTE);
    }
    let w = src.getWidth();
    let h = src.getHeight();
    image = new BufferedImage(destCM, destCM.createCompatibleWritableRaster(w, h), destCM.isAlphaPremultiplied(), null);
    return image;
  }
  nonICCBIFilter(src: BufferedImage, srcColorSpace: ColorSpace, dst: BufferedImage, dstColorSpace: ColorSpace): BufferedImage {
    let w = src.getWidth();
    let h = src.getHeight();
    let ciespace = ColorSpace.getInstance(1001);
    if (dst == null) {
      dst = this.createCompatibleDestImage$BufferedImage$ColorModel(src, null);
      dstColorSpace = dst.getColorModel().getColorSpace();
    } else {
      if ((h !== dst.getHeight()) || (w !== dst.getWidth())) {
        throw new IllegalArgumentException('Width or height of BufferedImages do not match');
      }
    }
    let srcRas = src.getRaster();
    let dstRas = dst.getRaster();
    let srcCM = src.getColorModel();
    let dstCM = dst.getColorModel();
    let srcNumComp = srcCM.getNumColorComponents();
    let dstNumComp = dstCM.getNumColorComponents();
    let dstHasAlpha = dstCM.hasAlpha();
    let needSrcAlpha = srcCM.hasAlpha() && dstHasAlpha;
    let list: ColorSpace[];
    if ((this.CSList == null) && (this.profileList.length !== 0)) {
      let nonICCSrc: boolean;
      let nonICCDst: boolean;
      let srcProfile: ICC_Profile;
      let dstProfile: ICC_Profile;
      if (!($J.isa(srcColorSpace, ICC_ColorSpace))) {
        nonICCSrc = true;
        srcProfile = ciespace.getProfile();
      } else {
        nonICCSrc = false;
        srcProfile = (srcColorSpace).getProfile();
      }
      if (!($J.isa(dstColorSpace, ICC_ColorSpace))) {
        nonICCDst = true;
        dstProfile = ciespace.getProfile();
      } else {
        nonICCDst = false;
        dstProfile = (dstColorSpace).getProfile();
      }
      if ((this.thisTransform == null) || (this.thisSrcProfile !== srcProfile) || (this.thisDestProfile !== dstProfile)) {
        this.updateBITransform(srcProfile, dstProfile);
      }
      let maxNum = 65535;
      let cs: ColorSpace;
      let iccSrcNumComp: number;
      if (nonICCSrc) {
        cs = ciespace;
        iccSrcNumComp = 3;
      } else {
        cs = srcColorSpace;
        iccSrcNumComp = srcNumComp;
      }
      let srcMinVal = $J.newArray(iccSrcNumComp, 0);
      let srcInvDiffMinMax = $J.newArray(iccSrcNumComp, 0);
      for (let i = 0; i < iccSrcNumComp; i++) {
        srcMinVal[i] = cs.getMinValue(i);
        srcInvDiffMinMax[i] = Math.fround(maxNum / (Math.fround(cs.getMaxValue(i) - srcMinVal[i])));
      }
      let iccDstNumComp: number;
      if (nonICCDst) {
        cs = ciespace;
        iccDstNumComp = 3;
      } else {
        cs = dstColorSpace;
        iccDstNumComp = dstNumComp;
      }
      let dstMinVal = $J.newArray(iccDstNumComp, 0);
      let dstDiffMinMax = $J.newArray(iccDstNumComp, 0);
      for (let i = 0; i < iccDstNumComp; i++) {
        dstMinVal[i] = cs.getMinValue(i);
        dstDiffMinMax[i] = Math.fround((Math.fround(cs.getMaxValue(i) - dstMinVal[i])) / maxNum);
      }
      let dstColor: number[];
      if (dstHasAlpha) {
        let size = (((dstNumComp + 1) | 0) > 3) ? ((dstNumComp + 1) | 0) : 3;
        dstColor = $J.newArray(size, 0);
      } else {
        let size = (dstNumComp > 3) ? dstNumComp : 3;
        dstColor = $J.newArray(size, 0);
      }
      let srcLine = $J.newArray(Math.imul(w, iccSrcNumComp), 0);
      let dstLine = $J.newArray(Math.imul(w, iccDstNumComp), 0);
      let pixel: any;
      let color: number[];
      let alpha = null;
      if (needSrcAlpha) {
        alpha = $J.newArray(w, 0);
      }
      let idx: number;
      for (let y = 0; y < h; y++) {
        pixel = null;
        color = null;
        idx = 0;
        for (let x = 0; x < w; x++) {
          pixel = srcRas.getDataElements$int$int$Object(x, y, pixel);
          color = srcCM.getNormalizedComponents$Object$floatArr$int(pixel, color, 0);
          if (needSrcAlpha) {
            alpha[x] = color[srcNumComp];
          }
          if (nonICCSrc) {
            color = srcColorSpace.toCIEXYZ(color);
          }
          for (let i = 0; i < iccSrcNumComp; i++) {
            srcLine[idx++] = (($J.d2i((Math.fround(Math.fround((Math.fround(color[i] - srcMinVal[i])) * srcInvDiffMinMax[i]) + 0.5)))) << 16) >> 16;
          }
        }
        this.thisTransform.colorConvert(srcLine, dstLine);
        pixel = null;
        idx = 0;
        for (let x = 0; x < w; x++) {
          for (let i = 0; i < iccDstNumComp; i++) {
            dstColor[i] = Math.fround(Math.fround((Math.fround((dstLine[idx++] & 65535))) * dstDiffMinMax[i]) + dstMinVal[i]);
          }
          if (nonICCDst) {
            color = dstColorSpace.fromCIEXYZ(dstColor);
            for (let i = 0; i < dstNumComp; i++) {
              dstColor[i] = color[i];
            }
          }
          if (needSrcAlpha) {
            dstColor[dstNumComp] = alpha[x];
          } else if (dstHasAlpha) {
            dstColor[dstNumComp] = 1;
          }
          pixel = dstCM.getDataElements$floatArr$int$Object(dstColor, 0, pixel);
          dstRas.setDataElements$int$int$Object(x, y, pixel);
        }
      }
    } else {
      let numCS: number;
      if (this.CSList == null) {
        numCS = 0;
      } else {
        numCS = this.CSList.length;
      }
      let dstColor: number[];
      if (dstHasAlpha) {
        dstColor = $J.newArray((dstNumComp + 1) | 0, 0);
      } else {
        dstColor = $J.newArray(dstNumComp, 0);
      }
      let spixel = null;
      let dpixel = null;
      let color = null;
      let tmpColor: number[];
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          spixel = srcRas.getDataElements$int$int$Object(x, y, spixel);
          color = srcCM.getNormalizedComponents$Object$floatArr$int(spixel, color, 0);
          tmpColor = srcColorSpace.toCIEXYZ(color);
          for (let i = 0; i < numCS; i++) {
            tmpColor = this.CSList[i].fromCIEXYZ(tmpColor);
            tmpColor = this.CSList[i].toCIEXYZ(tmpColor);
          }
          tmpColor = dstColorSpace.fromCIEXYZ(tmpColor);
          for (let i = 0; i < dstNumComp; i++) {
            dstColor[i] = tmpColor[i];
          }
          if (needSrcAlpha) {
            dstColor[dstNumComp] = color[srcNumComp];
          } else if (dstHasAlpha) {
            dstColor[dstNumComp] = 1;
          }
          dpixel = dstCM.getDataElements$floatArr$int$Object(dstColor, 0, dpixel);
          dstRas.setDataElements$int$int$Object(x, y, dpixel);
        }
      }
    }
    return dst;
  }
}

$J.define(ColorConvertOp, 'java.awt.image.ColorConvertOp', { kind: 'class', ifaces: ['java.awt.image.BufferedImageOp', 'java.awt.image.RasterOp'], sup: 'java.lang.Object', ctors: { 'java.awt.color.ICC_Profile[],java.awt.RenderingHints': '_ColorConvertOp$ICC_ProfileArr$RenderingHints', 'java.awt.color.ColorSpace,java.awt.color.ColorSpace,java.awt.RenderingHints': '_ColorConvertOp$ColorSpace$ColorSpace$RenderingHints', 'java.awt.color.ColorSpace,java.awt.RenderingHints': '_ColorConvertOp$ColorSpace$RenderingHints', 'java.awt.RenderingHints': '_ColorConvertOp$RenderingHints' }, meths: { 'createCompatibleDestImage(java.awt.image.BufferedImage,java.awt.image.ColorModel,java.awt.color.ColorSpace)': 'createCompatibleDestImage$BufferedImage$ColorModel$ColorSpace$ColorConvertOp', 'createCompatibleDestImage(java.awt.image.BufferedImage,java.awt.image.ColorModel)': 'createCompatibleDestImage$BufferedImage$ColorModel', 'getBounds2D(java.awt.image.Raster)': 'getBounds2D$Raster', 'getBounds2D(java.awt.image.BufferedImage)': 'getBounds2D$BufferedImage', 'filter(java.awt.image.Raster,java.awt.image.WritableRaster)': 'filter$Raster$WritableRaster', 'filter(java.awt.image.BufferedImage,java.awt.image.BufferedImage)': 'filter$BufferedImage$BufferedImage' } });
$J.module(() => {
  ComponentColorModel = $J.load('java.awt.image.ComponentColorModel');
  DataBuffer = $J.load('java.awt.image.DataBuffer');
  IndexColorModel = $J.load('java.awt.image.IndexColorModel');
});
