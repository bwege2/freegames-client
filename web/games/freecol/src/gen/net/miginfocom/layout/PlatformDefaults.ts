// @ts-nocheck
// MigLayout 5.3 core/net/miginfocom/layout/PlatformDefaults.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * License (BSD):
 * ==============
 *
 * Copyright (c) 2004, Mikael Grev, MiG InfoCom AB. (miglayout (at) miginfocom (dot) com)
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 * Redistributions of source code must retain the above copyright notice, this list
 * of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this
 * list of conditions and the following disclaimer in the documentation and/or other
 * materials provided with the distribution.
 * Neither the name of the MiG InfoCom AB nor the names of its contributors may be
 * used to endorse or promote products derived from this software without specific
 * prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 * OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY
 * OF SUCH DAMAGE.
 *
 * @version 1.0
 * @author Mikael Grev, MiG InfoCom AB
 *         Date: 2006-sep-08
 * @author Xxxx Xxxx, Xxxx  - Gnome support
 *         Date: 2008-jan-16
 */
import { $J, HashMap, IllegalArgumentException, JObject, JString, Throwable, Toolkit } from '../../../../jre/index.ts';

let BoundSize, LayoutUtil, UnitConverter, UnitValue;

/**
 * Currently handles Windows, Mac OS X, and GNOME spacing.
 */
export class PlatformDefaults extends JObject {
  /**
   * Property to use in LAF settings and as JComponent client property
   * to specify the visual padding.
   * <p>
   */
  static VISUAL_PADDING_PROPERTY: string = null;
  static DEF_H_UNIT: number = 0;
  static DEF_V_UNIT: number = 0;
  static GAP_PROVIDER: InCellGapProvider = null;
  static MOD_COUNT: number = 0;
  static LPX6: UnitValue = null;
  static LPX7: UnitValue = null;
  static LPX11: UnitValue = null;
  static LPX12: UnitValue = null;
  static LPX16: UnitValue = null;
  static LPX18: UnitValue = null;
  static LPX20: UnitValue = null;
  static LPY6: UnitValue = null;
  static LPY7: UnitValue = null;
  static LPY11: UnitValue = null;
  static LPY12: UnitValue = null;
  static LPY16: UnitValue = null;
  static LPY18: UnitValue = null;
  static LPY20: UnitValue = null;
  static readonly WINDOWS_XP: number = 0;
  static readonly MAC_OSX: number = 1;
  static readonly GNOME: number = 2;
  static CUR_PLAF: number = 0;
  static PANEL_INS: UnitValue[] = null;
  static DIALOG_INS: UnitValue[] = null;
  static BUTTON_FORMAT: string = null;
  static HOR_DEFS: HashMap<string, UnitValue> = null;
  static VER_DEFS: HashMap<string, UnitValue> = null;
  static DEF_VGAP: BoundSize = null;
  static DEF_HGAP: BoundSize = null;
  static RELATED_X: BoundSize = null;
  static RELATED_Y: BoundSize = null;
  static UNRELATED_X: BoundSize = null;
  static UNRELATED_Y: BoundSize = null;
  static BUTT_WIDTH: UnitValue = null;
  static BUTT_PADDING: UnitValue = null;
  static horScale: number = null;
  static verScale: number = null;
  /**
   * I value indicating that the size of the font for the container of the component
   * will be used as a base for calculating the logical pixel size. This is much as how
   * Windows calculated DLU (dialog units).
   * @see net.miginfocom.layout.UnitValue#LPX
   * @see net.miginfocom.layout.UnitValue#LPY
   * @see #setLogicalPixelBase(int)
   */
  static readonly BASE_FONT_SIZE: number = 100;
  /**
   * I value indicating that the screen DPI will be used as a base for calculating the
   * logical pixel size.
   * <p>
   * This is the default value.
   * @see net.miginfocom.layout.UnitValue#LPX
   * @see net.miginfocom.layout.UnitValue#LPY
   * @see #setLogicalPixelBase(int)
   * @see #setVerticalScaleFactor(Float)
   * @see #setHorizontalScaleFactor(Float)
   */
  static readonly BASE_SCALE_FACTOR: number = 101;
  /**
   * I value indicating that the size of a logical pixel should always be a real pixel
   * and thus no compensation will be made.
   * @see net.miginfocom.layout.UnitValue#LPX
   * @see net.miginfocom.layout.UnitValue#LPY
   * @see #setLogicalPixelBase(int)
   */
  static readonly BASE_REAL_PIXEL: number = 102;
  static LP_BASE: number = 0;
  static BASE_DPI_FORCED: number = null;
  static BASE_DPI: number = 0;
  static dra: boolean = false;
  static VISUAL_BOUNDS: HashMap<string, number[]> = null;
  _PlatformDefaults(): this {
    return this;
  }
  /**
   * Returns the platform that the JRE is running on currently.
   * @return The platform that the JRE is running on currently. E.g. {@link #MAC_OSX}, {@link #WINDOWS_XP}, or {@link #GNOME}.
   */
  static getCurrentPlatform(): number {
    let os = $J.system_getProperty('os.name');
    if (os.startsWith('Mac OS')) {
      return PlatformDefaults.MAC_OSX;
    } else if (os.startsWith('Linux')) {
      return PlatformDefaults.GNOME;
    } else {
      return PlatformDefaults.WINDOWS_XP;
    }
  }
  /**
   * Set the defaults to the default for the platform
   * @param plaf The platform. <code>PlatformDefaults.WINDOWS_XP</code>,
   * <code>PlatformDefaults.MAC_OSX</code>, or
   * <code>PlatformDefaults.GNOME</code>.
   */
  static setPlatform(plaf: number): void {
    switch (plaf) {
      case PlatformDefaults.WINDOWS_XP:
        PlatformDefaults.setDefaultVisualPadding('TabbedPane.' + PlatformDefaults.VISUAL_PADDING_PROPERTY, [1, 0, 1, 2]);
        PlatformDefaults.setRelatedGap(PlatformDefaults.LPX7, PlatformDefaults.LPY7);
        PlatformDefaults.setUnrelatedGap(PlatformDefaults.LPX11, PlatformDefaults.LPY11);
        PlatformDefaults.setParagraphGap(PlatformDefaults.LPX20, PlatformDefaults.LPY20);
        PlatformDefaults.setIndentGap(PlatformDefaults.LPX11, PlatformDefaults.LPY11);
        PlatformDefaults.setGridCellGap(PlatformDefaults.LPX7, PlatformDefaults.LPY7);
        PlatformDefaults.setMinimumButtonWidth(new UnitValue()._UnitValue$float$int$String(75, UnitValue.LPX, null));
        PlatformDefaults.setButtonOrder('L_E+U+YNBXOCAH_I_R');
        PlatformDefaults.setDialogInsets(PlatformDefaults.LPY11, PlatformDefaults.LPX11, PlatformDefaults.LPY11, PlatformDefaults.LPX11);
        PlatformDefaults.setPanelInsets(PlatformDefaults.LPY7, PlatformDefaults.LPX7, PlatformDefaults.LPY7, PlatformDefaults.LPX7);
        break;
      case PlatformDefaults.MAC_OSX:
        PlatformDefaults.setDefaultVisualPadding('Button.' + PlatformDefaults.VISUAL_PADDING_PROPERTY, [3, 6, 5, 6]);
        PlatformDefaults.setDefaultVisualPadding('Button.icon.' + PlatformDefaults.VISUAL_PADDING_PROPERTY, [3, 2, 3, 2]);
        PlatformDefaults.setDefaultVisualPadding('Button.square.' + PlatformDefaults.VISUAL_PADDING_PROPERTY, [4, 4, 4, 4]);
        PlatformDefaults.setDefaultVisualPadding('Button.square.icon.' + PlatformDefaults.VISUAL_PADDING_PROPERTY, [4, 4, 4, 4]);
        PlatformDefaults.setDefaultVisualPadding('Button.gradient.' + PlatformDefaults.VISUAL_PADDING_PROPERTY, [5, 4, 5, 4]);
        PlatformDefaults.setDefaultVisualPadding('Button.gradient.icon.' + PlatformDefaults.VISUAL_PADDING_PROPERTY, [5, 4, 5, 4]);
        PlatformDefaults.setDefaultVisualPadding('Button.bevel.' + PlatformDefaults.VISUAL_PADDING_PROPERTY, [2, 2, 3, 2]);
        PlatformDefaults.setDefaultVisualPadding('Button.bevel.icon.' + PlatformDefaults.VISUAL_PADDING_PROPERTY, [2, 2, 3, 2]);
        PlatformDefaults.setDefaultVisualPadding('Button.textured.' + PlatformDefaults.VISUAL_PADDING_PROPERTY, [3, 2, 3, 2]);
        PlatformDefaults.setDefaultVisualPadding('Button.textured.icon.' + PlatformDefaults.VISUAL_PADDING_PROPERTY, [3, 2, 3, 2]);
        PlatformDefaults.setDefaultVisualPadding('Button.roundRect.' + PlatformDefaults.VISUAL_PADDING_PROPERTY, [5, 4, 5, 4]);
        PlatformDefaults.setDefaultVisualPadding('Button.roundRect.icon.' + PlatformDefaults.VISUAL_PADDING_PROPERTY, [5, 4, 5, 4]);
        PlatformDefaults.setDefaultVisualPadding('Button.recessed.' + PlatformDefaults.VISUAL_PADDING_PROPERTY, [5, 4, 5, 4]);
        PlatformDefaults.setDefaultVisualPadding('Button.recessed.icon.' + PlatformDefaults.VISUAL_PADDING_PROPERTY, [5, 4, 5, 4]);
        PlatformDefaults.setDefaultVisualPadding('Button.help.' + PlatformDefaults.VISUAL_PADDING_PROPERTY, [4, 3, 3, 4]);
        PlatformDefaults.setDefaultVisualPadding('Button.help.icon.' + PlatformDefaults.VISUAL_PADDING_PROPERTY, [4, 3, 3, 4]);
        PlatformDefaults.setDefaultVisualPadding('ComboBox.' + PlatformDefaults.VISUAL_PADDING_PROPERTY, [2, 4, 4, 5]);
        PlatformDefaults.setDefaultVisualPadding('ComboBox.isPopDown.' + PlatformDefaults.VISUAL_PADDING_PROPERTY, [2, 5, 4, 5]);
        PlatformDefaults.setDefaultVisualPadding('ComboBox.isSquare.' + PlatformDefaults.VISUAL_PADDING_PROPERTY, [1, 6, 5, 7]);
        PlatformDefaults.setDefaultVisualPadding('ComboBox.editable.' + PlatformDefaults.VISUAL_PADDING_PROPERTY, [3, 3, 3, 2]);
        PlatformDefaults.setDefaultVisualPadding('ComboBox.editable.isSquare.' + PlatformDefaults.VISUAL_PADDING_PROPERTY, [3, 3, 3, 1]);
        PlatformDefaults.setDefaultVisualPadding('TextField.' + PlatformDefaults.VISUAL_PADDING_PROPERTY, [3, 3, 3, 3]);
        PlatformDefaults.setDefaultVisualPadding('TabbedPane.' + PlatformDefaults.VISUAL_PADDING_PROPERTY, [4, 8, 11, 8]);
        PlatformDefaults.setDefaultVisualPadding('Spinner.' + PlatformDefaults.VISUAL_PADDING_PROPERTY, [3, 3, 3, 1]);
        PlatformDefaults.setDefaultVisualPadding('RadioButton.' + PlatformDefaults.VISUAL_PADDING_PROPERTY, [4, 6, 3, 5]);
        PlatformDefaults.setDefaultVisualPadding('RadioButton.small.' + PlatformDefaults.VISUAL_PADDING_PROPERTY, [4, 6, 3, 5]);
        PlatformDefaults.setDefaultVisualPadding('RadioButton.mini.' + PlatformDefaults.VISUAL_PADDING_PROPERTY, [5, 7, 4, 5]);
        PlatformDefaults.setDefaultVisualPadding('CheckBox.' + PlatformDefaults.VISUAL_PADDING_PROPERTY, [5, 7, 4, 5]);
        PlatformDefaults.setDefaultVisualPadding('CheckBox.small.' + PlatformDefaults.VISUAL_PADDING_PROPERTY, [5, 7, 4, 5]);
        PlatformDefaults.setDefaultVisualPadding('CheckBox.mini.' + PlatformDefaults.VISUAL_PADDING_PROPERTY, [6, 7, 3, 5]);
        PlatformDefaults.setRelatedGap(PlatformDefaults.LPX7, PlatformDefaults.LPY7);
        PlatformDefaults.setUnrelatedGap(PlatformDefaults.LPX11, PlatformDefaults.LPY11);
        PlatformDefaults.setParagraphGap(PlatformDefaults.LPX20, PlatformDefaults.LPY20);
        PlatformDefaults.setIndentGap(PlatformDefaults.LPX11, PlatformDefaults.LPY11);
        PlatformDefaults.setGridCellGap(PlatformDefaults.LPX7, PlatformDefaults.LPY7);
        PlatformDefaults.setMinimumButtonWidth(new UnitValue()._UnitValue$float$int$String(70, UnitValue.LPX, null));
        PlatformDefaults.setMinimumButtonPadding(new UnitValue()._UnitValue$float$int$String(8, UnitValue.LPX, null));
        PlatformDefaults.setButtonOrder('L_HE+U+NYBXCOA_I_R');
        PlatformDefaults.setDialogInsets(PlatformDefaults.LPY20, PlatformDefaults.LPX20, PlatformDefaults.LPY20, PlatformDefaults.LPX20);
        PlatformDefaults.setPanelInsets(PlatformDefaults.LPY16, PlatformDefaults.LPX16, PlatformDefaults.LPY16, PlatformDefaults.LPX16);
        break;
      case PlatformDefaults.GNOME:
        PlatformDefaults.setRelatedGap(PlatformDefaults.LPX6, PlatformDefaults.LPY6);
        PlatformDefaults.setUnrelatedGap(PlatformDefaults.LPX12, PlatformDefaults.LPY12);
        PlatformDefaults.setParagraphGap(PlatformDefaults.LPX18, PlatformDefaults.LPY18);
        PlatformDefaults.setIndentGap(PlatformDefaults.LPX12, PlatformDefaults.LPY12);
        PlatformDefaults.setGridCellGap(PlatformDefaults.LPX6, PlatformDefaults.LPY6);
        PlatformDefaults.setMinimumButtonWidth(new UnitValue()._UnitValue$float$int$String(85, UnitValue.LPX, null));
        PlatformDefaults.setButtonOrder('L_HE+UNYACBXO_I_R');
        PlatformDefaults.setDialogInsets(PlatformDefaults.LPY12, PlatformDefaults.LPX12, PlatformDefaults.LPY12, PlatformDefaults.LPX12);
        PlatformDefaults.setPanelInsets(PlatformDefaults.LPY6, PlatformDefaults.LPX6, PlatformDefaults.LPY6, PlatformDefaults.LPX6);
        break;
      default:
        throw new IllegalArgumentException('Unknown platform: ' + plaf);
    }
    PlatformDefaults.CUR_PLAF = plaf;
    PlatformDefaults.BASE_DPI = PlatformDefaults.BASE_DPI_FORCED != null ? PlatformDefaults.BASE_DPI_FORCED : PlatformDefaults.getPlatformDPI(plaf);
  }
  /**
   * Sets the visual bounds for a component type.
   * @param key The component type. E.g. "TabbedPane.visualPadding" or "ComboBox.editable.isSquare.visualPadding". See source code for list.
   * @param insets Top, left, bottom, right. Always length 4 or null.
   * @see net.miginfocom.layout.ComponentWrapper#getVisualPadding()
   */
  static setDefaultVisualPadding(key: string, insets: number[]): void {
    PlatformDefaults.VISUAL_BOUNDS.put(key, insets);
  }
  /**
   * Returns the visual bounds for a component type.
   * @param key The component type. E.g. "TabbedPane.visualPadding" or "ComboBox.editable.isSquare.visualPadding". See source code for list.
   * @return insets Top, left, bottom, right. Always length 4 or null. Live object, MUST NOT BE CHANGED!.
   * @see net.miginfocom.layout.ComponentWrapper#getVisualPadding()
   */
  static getDefaultVisualPadding(key: string): number[] {
    return PlatformDefaults.VISUAL_BOUNDS.get(key);
  }
  static getPlatformDPI(plaf: number): number {
    switch (plaf) {
      case PlatformDefaults.WINDOWS_XP:
      case PlatformDefaults.GNOME:
        return 96;
      case PlatformDefaults.MAC_OSX:
        try {
          return Toolkit.getDefaultToolkit().getScreenResolution();
        } catch ($e0) {
          {
            let t = $J.exc($e0);
            return 72;
          }
        }
      default:
        throw new IllegalArgumentException('Unknown platform: ' + plaf);
    }
  }
  /**
   * Returns the current platform
   * @return <code>PlatformDefaults.WINDOWS</code> or <code>PlatformDefaults.MAC_OSX</code>
   */
  static getPlatform(): number {
    return PlatformDefaults.CUR_PLAF;
  }
  static getDefaultDPI(): number {
    return PlatformDefaults.BASE_DPI;
  }
  /**
   * Sets the default platform DPI. Normally this is set in the {@link #setPlatform(int)} for the different platforms
   * but it can be tweaked here. For instance SWT on Mac does this.
   * <p>
   * Note that this is not the actual current DPI, but the base DPI for the toolkit.
   * @param dpi The base DPI. If null the default DPI is reset to the platform base DPI.
   */
  static setDefaultDPI(dpi: number): void {
    PlatformDefaults.BASE_DPI = dpi != null ? dpi : PlatformDefaults.getPlatformDPI(PlatformDefaults.CUR_PLAF);
    PlatformDefaults.BASE_DPI_FORCED = dpi;
  }
  /**
   * The forced scale factor that all screen relative units (e.g. millimeters, inches and logical pixels) will be multiplied
   * with. If <code>null</code> this will default to a scale that will scale the current screen to the default screen resolution
   * (72 DPI for Mac and 92 DPI for Windows).
   * @return The forced scale or <code>null</code> for default scaling.
   * @see #getHorizontalScaleFactor()
   * @see ComponentWrapper#getHorizontalScreenDPI()
   */
  static getHorizontalScaleFactor(): number {
    return PlatformDefaults.horScale;
  }
  /**
   * The forced scale factor that all screen relative units (e.g. millimeters, inches and logical pixels) will be multiplied
   * with. If <code>null</code> this will default to a scale that will scale the current screen to the default screen resolution
   * (72 DPI for Mac and 92 DPI for Windows).
   * @param f The forced scale or <code>null</code> for default scaling.
   * @see #getHorizontalScaleFactor()
   * @see ComponentWrapper#getHorizontalScreenDPI()
   */
  static setHorizontalScaleFactor(f: number): void {
    if (!LayoutUtil.equals(PlatformDefaults.horScale, f)) {
      PlatformDefaults.horScale = f;
      PlatformDefaults.MOD_COUNT++;
    }
  }
  /**
   * The forced scale factor that all screen relative units (e.g. millimeters, inches and logical pixels) will be multiplied
   * with. If <code>null</code> this will default to a scale that will scale the current screen to the default screen resolution
   * (72 DPI for Mac and 92 DPI for Windows).
   * @return The forced scale or <code>null</code> for default scaling.
   * @see #getHorizontalScaleFactor()
   * @see ComponentWrapper#getVerticalScreenDPI()
   */
  static getVerticalScaleFactor(): number {
    return PlatformDefaults.verScale;
  }
  /**
   * The forced scale factor that all screen relative units (e.g. millimeters, inches and logical pixels) will be multiplied
   * with. If <code>null</code> this will default to a scale that will scale the current screen to the default screen resolution
   * (72 DPI for Mac and 92 DPI for Windows).
   * @param f The forced scale or <code>null</code> for default scaling.
   * @see #getHorizontalScaleFactor()
   * @see ComponentWrapper#getVerticalScreenDPI()
   */
  static setVerticalScaleFactor(f: number): void {
    if (!LayoutUtil.equals(PlatformDefaults.verScale, f)) {
      PlatformDefaults.verScale = f;
      PlatformDefaults.MOD_COUNT++;
    }
  }
  /**
   * What base value should be used to calculate logical pixel sizes.
   * @return The current base. Default is {@link #BASE_SCALE_FACTOR}
   * @see #BASE_FONT_SIZE
   * @see #BASE_SCALE_FACTOR
   * @see #BASE_REAL_PIXEL
   */
  static getLogicalPixelBase(): number {
    return PlatformDefaults.LP_BASE;
  }
  /**
   * What base value should be used to calculate logical pixel sizes.
   * @param base The new base. Default is {@link #BASE_SCALE_FACTOR}
   * @see #BASE_FONT_SIZE
   * @see #BASE_SCALE_FACTOR
   * @see #BASE_REAL_PIXEL
   */
  static setLogicalPixelBase(base: number): void {
    if (PlatformDefaults.LP_BASE !== base) {
      if (base < PlatformDefaults.BASE_FONT_SIZE || base > PlatformDefaults.BASE_REAL_PIXEL) {
        throw new IllegalArgumentException('Unrecognized base: ' + base);
      }
      PlatformDefaults.LP_BASE = base;
      PlatformDefaults.MOD_COUNT++;
    }
  }
  /**
   * Sets gap value for components that are "related".
   * @param x The value that will be transformed to pixels. If <code>null</code> the current value will not change.
   * @param y The value that will be transformed to pixels. If <code>null</code> the current value will not change.
   */
  static setRelatedGap(x: UnitValue, y: UnitValue): void {
    PlatformDefaults.setUnitValue(['r', 'rel', 'related'], x, y);
    PlatformDefaults.RELATED_X = new BoundSize()._BoundSize$UnitValue$UnitValue$UnitValue$String(x, x, null, 'rel:rel');
    PlatformDefaults.RELATED_Y = new BoundSize()._BoundSize$UnitValue$UnitValue$UnitValue$String(y, y, null, 'rel:rel');
  }
  /**
   * Sets gap value for components that are "unrelated".
   * @param x The value that will be transformed to pixels. If <code>null</code> the current value will not change.
   * @param y The value that will be transformed to pixels. If <code>null</code> the current value will not change.
   */
  static setUnrelatedGap(x: UnitValue, y: UnitValue): void {
    PlatformDefaults.setUnitValue(['u', 'unrel', 'unrelated'], x, y);
    PlatformDefaults.UNRELATED_X = new BoundSize()._BoundSize$UnitValue$UnitValue$UnitValue$String(x, x, null, 'unrel:unrel');
    PlatformDefaults.UNRELATED_Y = new BoundSize()._BoundSize$UnitValue$UnitValue$UnitValue$String(y, y, null, 'unrel:unrel');
  }
  /**
   * Sets paragraph gap value for components.
   * @param x The value that will be transformed to pixels. If <code>null</code> the current value will not change.
   * @param y The value that will be transformed to pixels. If <code>null</code> the current value will not change.
   */
  static setParagraphGap(x: UnitValue, y: UnitValue): void {
    PlatformDefaults.setUnitValue(['p', 'para', 'paragraph'], x, y);
  }
  /**
   * Sets gap value for components that are "intended".
   * @param x The value that will be transformed to pixels. If <code>null</code> the current value will not change.
   * @param y The value that will be transformed to pixels. If <code>null</code> the current value will not change.
   */
  static setIndentGap(x: UnitValue, y: UnitValue): void {
    PlatformDefaults.setUnitValue(['i', 'ind', 'indent'], x, y);
  }
  /**
   * Sets gap between two cells in the grid. Note that this is not a gap between component IN a cell, that has to be set
   * on the component constraints. The value will be the min and preferred size of the gap.
   * @param x The value that will be transformed to pixels. If <code>null</code> the current value will not change.
   * @param y The value that will be transformed to pixels. If <code>null</code> the current value will not change.
   */
  static setGridCellGap(x: UnitValue, y: UnitValue): void {
    if (x != null) {
      PlatformDefaults.DEF_HGAP = new BoundSize()._BoundSize$UnitValue$UnitValue$UnitValue$String(x, x, null, null);
    }
    if (y != null) {
      PlatformDefaults.DEF_VGAP = new BoundSize()._BoundSize$UnitValue$UnitValue$UnitValue$String(y, y, null, null);
    }
    PlatformDefaults.MOD_COUNT++;
  }
  /**
   * Sets the recommended minimum button width.
   * @param width The recommended minimum button width.
   */
  static setMinimumButtonWidth(width: UnitValue): void {
    PlatformDefaults.BUTT_WIDTH = width;
    PlatformDefaults.MOD_COUNT++;
  }
  /**
   * Returns the recommended minimum button width depending on the current set platform.
   * @return The recommended minimum button width depending on the current set platform.
   */
  static getMinimumButtonWidth(): UnitValue {
    return PlatformDefaults.BUTT_WIDTH;
  }
  static setMinimumButtonPadding(padding: UnitValue): void {
    PlatformDefaults.BUTT_PADDING = padding;
    PlatformDefaults.MOD_COUNT++;
  }
  static getMinimumButtonPadding(): UnitValue {
    return PlatformDefaults.BUTT_PADDING;
  }
  static getMinimumButtonWidthIncludingPadding(refValue: number, parent: ContainerWrapper, comp: ComponentWrapper): number {
    let buttonMinWidth = PlatformDefaults.getMinimumButtonWidth().getPixels(refValue, parent, comp);
    if (comp != null && PlatformDefaults.getMinimumButtonPadding() != null) {
      return Math.fround(Math.max((comp.getMinimumWidth(comp.getWidth()) + Math.imul(PlatformDefaults.getMinimumButtonPadding().getPixels(refValue, parent, comp), 2)) | 0, buttonMinWidth));
    } else {
      return Math.fround(buttonMinWidth);
    }
  }
  /**
   * Returns the unit value associated with the unit. (E.i. "related" or "indent"). Must be lower case.
   * @param unit The unit string.
   * @return The unit value associated with the unit. <code>null</code> for unrecognized units.
   */
  static getUnitValueX(unit: string): UnitValue {
    return PlatformDefaults.HOR_DEFS.get(unit);
  }
  /**
   * Returns the unit value associated with the unit. (E.i. "related" or "indent"). Must be lower case.
   * @param unit The unit string.
   * @return The unit value associated with the unit. <code>null</code> for unrecognized units.
   */
  static getUnitValueY(unit: string): UnitValue {
    return PlatformDefaults.VER_DEFS.get(unit);
  }
  /**
   * Sets the unit value associated with a unit string. This may be used to store values for new unit strings
   * or modify old. Note that if a built in unit (such as "related") is modified all versions of it must be
   * set (I.e. "r", "rel" and "related"). The build in values will be reset to the default ones if the platform
   * is re-set.
   * @param unitStrings The unit strings. E.g. "mu", "myunit". Will be converted to lower case and trimmed. Not <code>null</code>.
   * @param x The value for the horizontal dimension. If <code>null</code> the value is not changed.
   * @param y The value for the vertical dimension. Might be same object as for <code>x</code>. If <code>null</code> the value is not changed.
   */
  static setUnitValue(unitStrings: string[], x: UnitValue, y: UnitValue): void {
    for (let unitString of unitStrings) {
      let s = JString.trim(unitString.toLowerCase());
      if (x != null) {
        PlatformDefaults.HOR_DEFS.put(s, x);
      }
      if (y != null) {
        PlatformDefaults.VER_DEFS.put(s, y);
      }
    }
    PlatformDefaults.MOD_COUNT++;
  }
  /**
   * Understands ("r", "rel", "related") OR ("u", "unrel", "unrelated") OR ("i", "ind", "indent") OR ("p", "para", "paragraph").
   */
  static convertToPixels(value: number, unit: string, isHor: boolean, ref: number, parent: ContainerWrapper, comp: ComponentWrapper): number {
    let uv = (isHor ? PlatformDefaults.HOR_DEFS : PlatformDefaults.VER_DEFS).get(unit);
    return uv != null ? $J.roundf(Math.fround(value * uv.getPixels(ref, parent, comp))) : UnitConverter.UNABLE;
  }
  /**
   * Returns the order for the typical buttons in a standard button bar. It is one letter per button type.
   * @return The button order.
   * @see #setButtonOrder(String)
   */
  static getButtonOrder(): string {
    return PlatformDefaults.BUTTON_FORMAT;
  }
  /**
   * Sets the order for the typical buttons in a standard button bar. It is one letter per button type.
   * <p>
   * Letter in upper case will get the minimum button width that the {@link #getMinimumButtonWidth()} specifies
   * and letters in lower case will get the width the current look&amp;feel specifies.
   * <p>
   * Gaps will never be added to before the first component or after the last component. However, '+' (push) will be
   * applied before and after as well, but with a minimum size of 0 if first/last so there will not be a gap
   * before or after.
   * <p>
   * If gaps are explicitly set on buttons they will never be reduced, but they may be increased.
   * <p>
   * These are the characters that can be used:
   * <ul>
   * <li><code>'L'</code> - Buttons with this style tag will statically end up on the left end of the bar.
   * <li><code>'R'</code> - Buttons with this style tag will statically end up on the right end of the bar.
   * <li><code>'H'</code> - A tag for the "help" button that normally is supposed to be on the right.
   * <li><code>'E'</code> - A tag for the "help2" button that normally is supposed to be on the left.
   * <li><code>'Y'</code> - A tag for the "yes" button.
   * <li><code>'N'</code> - A tag for the "no" button.
   * <li><code>'X'</code> - A tag for the "next &gt;" or "forward &gt;" button.
   * <li><code>'B'</code> - A tag for the "&lt; back" or "&lt; previous" button.
   * <li><code>'I'</code> - A tag for the "finish" button.
   * <li><code>'A'</code> - A tag for the "apply" button.
   * <li><code>'C'</code> - A tag for the "cancel" or "close" button.
   * <li><code>'O'</code> - A tag for the "ok" or "done" button.
   * <li><code>'U'</code> - All Uncategorized, Other, or "Unknown" buttons. Tag will be "other".
   * <li><code>'+'</code> - A glue push gap that will take as much space as it can and at least an "unrelated" gap. (Platform dependent)
   * <li><code>'_'</code> - (underscore) An "unrelated" gap. (Platform dependent)
   * </ul>
   * <p>
   * Even though the style tags are normally applied to buttons this works with all components.
   * <p>
   * The normal style for MAC OS X is <code>"L_HE+U+NYBXCOA_I_R"</code>,
   * for Windows is <code>"L_E+U+YNBXOCAH_I_R"</code>, and for GNOME is
   * <code>"L_HE+UNYACBXO_I_R"</code>.
   *
   * @param order The new button order for the current platform.
   */
  static setButtonOrder(order: string): void {
    PlatformDefaults.BUTTON_FORMAT = order;
    PlatformDefaults.MOD_COUNT++;
  }
  /**
   * Returns the tag (used in the {@link CC}) for a char. The char is same as used in {@link #getButtonOrder()}.
   * @param c The char. Must be lower case!
   * @return The tag that corresponds to the char or <code>null</code> if the char is unrecognized.
   */
  static getTagForChar(c: number): string {
    switch (c) {
      case 111 /* 'o' */:
        return 'ok';
      case 99 /* 'c' */:
        return 'cancel';
      case 104 /* 'h' */:
        return 'help';
      case 101 /* 'e' */:
        return 'help2';
      case 121 /* 'y' */:
        return 'yes';
      case 110 /* 'n' */:
        return 'no';
      case 97 /* 'a' */:
        return 'apply';
      case 120 /* 'x' */:
        return 'next';
      case 98 /* 'b' */:
        return 'back';
      case 105 /* 'i' */:
        return 'finish';
      case 108 /* 'l' */:
        return 'left';
      case 114 /* 'r' */:
        return 'right';
      case 117 /* 'u' */:
        return 'other';
      default:
        return null;
    }
  }
  /**
   * Returns the platform recommended inter-cell gap in the horizontal (x) dimension..
   * @return The platform recommended inter-cell gap in the horizontal (x) dimension..
   */
  static getGridGapX(): BoundSize {
    return PlatformDefaults.DEF_HGAP;
  }
  /**
   * Returns the platform recommended inter-cell gap in the vertical (x) dimension..
   * @return The platform recommended inter-cell gap in the vertical (x) dimension..
   */
  static getGridGapY(): BoundSize {
    return PlatformDefaults.DEF_VGAP;
  }
  /**
   * Returns the default dialog insets depending of the current platform.
   * @param side top == 0, left == 1, bottom = 2, right = 3.
   * @return The insets. Never <code>null</code>.
   */
  static getDialogInsets(side: number): UnitValue {
    return PlatformDefaults.DIALOG_INS[side];
  }
  /**
   * Sets the default insets for a dialog. Values that are null will not be changed.
   * @param top The top inset. May be <code>null</code>.
   * @param left The left inset. May be <code>null</code>.
   * @param bottom The bottom inset. May be <code>null</code>.
   * @param right The right inset. May be <code>null</code>.
   */
  static setDialogInsets(top: UnitValue, left: UnitValue, bottom: UnitValue, right: UnitValue): void {
    if (top != null) {
      PlatformDefaults.DIALOG_INS[0] = top;
    }
    if (left != null) {
      PlatformDefaults.DIALOG_INS[1] = left;
    }
    if (bottom != null) {
      PlatformDefaults.DIALOG_INS[2] = bottom;
    }
    if (right != null) {
      PlatformDefaults.DIALOG_INS[3] = right;
    }
    PlatformDefaults.MOD_COUNT++;
  }
  /**
   * Returns the default panel insets depending of the current platform.
   * @param side top == 0, left == 1, bottom = 2, right = 3.
   * @return The insets. Never <code>null</code>.
   */
  static getPanelInsets(side: number): UnitValue {
    return PlatformDefaults.PANEL_INS[side];
  }
  /**
   * Sets the default insets for a dialog. Values that are null will not be changed.
   * @param top The top inset. May be <code>null</code>.
   * @param left The left inset. May be <code>null</code>.
   * @param bottom The bottom inset. May be <code>null</code>.
   * @param right The right inset. May be <code>null</code>.
   */
  static setPanelInsets(top: UnitValue, left: UnitValue, bottom: UnitValue, right: UnitValue): void {
    if (top != null) {
      PlatformDefaults.PANEL_INS[0] = top;
    }
    if (left != null) {
      PlatformDefaults.PANEL_INS[1] = left;
    }
    if (bottom != null) {
      PlatformDefaults.PANEL_INS[2] = bottom;
    }
    if (right != null) {
      PlatformDefaults.PANEL_INS[3] = right;
    }
    PlatformDefaults.MOD_COUNT++;
  }
  /**
   * Returns the percentage used for alignment for labels (0 is left, 50 is center and 100 is right).
   * @return The percentage used for alignment for labels
   */
  static getLabelAlignPercentage(): number {
    return PlatformDefaults.CUR_PLAF === PlatformDefaults.MAC_OSX ? 1 : 0;
  }
  /**
   * Returns the default gap between two components that <b>are in the same cell</b>.
   * @param comp The component that the gap is for. Never <code>null</code>.
   * @param adjacentComp The adjacent component if any. May be <code>null</code>.
   * @param adjacentSide What side the <code>adjacentComp</code> is on. {@link javax.swing.SwingUtilities#TOP} (1) or
   * {@link javax.swing.SwingUtilities#LEFT} (2) or {@link javax.swing.SwingUtilities#BOTTOM} (3) or {@link javax.swing.SwingUtilities#RIGHT} (4).
   * @param tag The tag string that the component might be tagged with in the component constraints. May be <code>null</code>.
   * @param isLTR If it is left-to-right.
   * @return The default gap between two components or <code>null</code> if there should be no gap.
   */
  static getDefaultComponentGap(comp: ComponentWrapper, adjacentComp: ComponentWrapper, adjacentSide: number, tag: string, isLTR: boolean): BoundSize {
    if (PlatformDefaults.GAP_PROVIDER != null) {
      return PlatformDefaults.GAP_PROVIDER.getDefaultGap(comp, adjacentComp, adjacentSide, tag, isLTR);
    }
    if (adjacentComp == null) {
      return null;
    }
    return (adjacentSide === 2 || adjacentSide === 4) ? PlatformDefaults.RELATED_X : PlatformDefaults.RELATED_Y;
  }
  /**
   * Returns the current gap provider or <code>null</code> if none is set and "related" should always be used.
   * @return The current gap provider or <code>null</code> if none is set and "related" should always be used.
   */
  static getGapProvider(): InCellGapProvider {
    return PlatformDefaults.GAP_PROVIDER;
  }
  /**
   * Sets the current gap provider or <code>null</code> if none is set and "related" should always be used.
   * @param provider The current gap provider or <code>null</code> if none is set and "related" should always be used.
   */
  static setGapProvider(provider: InCellGapProvider): void {
    PlatformDefaults.GAP_PROVIDER = provider;
  }
  /**
   * Returns how many times the defaults has been changed. This can be used as a light weight check to
   * see if layout caches needs to be refreshed.
   * @return How many times the defaults has been changed.
   */
  static getModCount(): number {
    return PlatformDefaults.MOD_COUNT;
  }
  /**
   * Tells all layout manager instances to revalidate and recalculated everything.
   */
  invalidate(): void {
    PlatformDefaults.MOD_COUNT++;
  }
  /**
   * Returns the current default unit. The default unit is the unit used if no unit is set. E.g. "width 10".
   * @return The current default unit.
   * @see UnitValue#PIXEL
   * @see UnitValue#LPX
   */
  static getDefaultHorizontalUnit(): number {
    return PlatformDefaults.DEF_H_UNIT;
  }
  /**
   * Sets the default unit. The default unit is the unit used if no unit is set. E.g. "width 10".
   * @param unit The new default unit.
   * @see UnitValue#PIXEL
   * @see UnitValue#LPX
   */
  static setDefaultHorizontalUnit(unit: number): void {
    if (unit < UnitValue.PIXEL || unit > UnitValue.LABEL_ALIGN) {
      throw new IllegalArgumentException('Illegal Unit: ' + unit);
    }
    if (PlatformDefaults.DEF_H_UNIT !== unit) {
      PlatformDefaults.DEF_H_UNIT = unit;
      PlatformDefaults.MOD_COUNT++;
    }
  }
  /**
   * Returns the current default unit. The default unit is the unit used if no unit is set. E.g. "width 10".
   * @return The current default unit.
   * @see UnitValue#PIXEL
   * @see UnitValue#LPY
   */
  static getDefaultVerticalUnit(): number {
    return PlatformDefaults.DEF_V_UNIT;
  }
  /**
   * Sets the default unit. The default unit is the unit used if no unit is set. E.g. "width 10".
   * @param unit The new default unit.
   * @see UnitValue#PIXEL
   * @see UnitValue#LPY
   */
  static setDefaultVerticalUnit(unit: number): void {
    if (unit < UnitValue.PIXEL || unit > UnitValue.LABEL_ALIGN) {
      throw new IllegalArgumentException('Illegal Unit: ' + unit);
    }
    if (PlatformDefaults.DEF_V_UNIT !== unit) {
      PlatformDefaults.DEF_V_UNIT = unit;
      PlatformDefaults.MOD_COUNT++;
    }
  }
  /**
   * The default alignment for rows. Pre v3.5 this was <code>false</code> but now it is
   * <code>true</code>.
   * @return The current value. Default is <code>true</code>.
   * @since 3.5
   */
  static getDefaultRowAlignmentBaseline(): boolean {
    return PlatformDefaults.dra;
  }
  /**
   * The default alignment for rows. Pre v3.5 this was <code>false</code> but now it is
   * <code>true</code>.
   * @param b The new value. Default is <code>true</code> from v3.5.
   * @since 3.5
   */
  static setDefaultRowAlignmentBaseline(b: boolean): void {
    PlatformDefaults.dra = b;
  }
  static $clinit() {
    PlatformDefaults.VISUAL_PADDING_PROPERTY = 'visualPadding';
    PlatformDefaults.DEF_H_UNIT = UnitValue.LPX;
    PlatformDefaults.DEF_V_UNIT = UnitValue.LPY;
    PlatformDefaults.GAP_PROVIDER = null;
    PlatformDefaults.MOD_COUNT = 0;
    PlatformDefaults.LPX6 = new UnitValue()._UnitValue$float$int$String(6, UnitValue.LPX, null);
    PlatformDefaults.LPX7 = new UnitValue()._UnitValue$float$int$String(7, UnitValue.LPX, null);
    PlatformDefaults.LPX11 = new UnitValue()._UnitValue$float$int$String(11, UnitValue.LPX, null);
    PlatformDefaults.LPX12 = new UnitValue()._UnitValue$float$int$String(12, UnitValue.LPX, null);
    PlatformDefaults.LPX16 = new UnitValue()._UnitValue$float$int$String(16, UnitValue.LPX, null);
    PlatformDefaults.LPX18 = new UnitValue()._UnitValue$float$int$String(18, UnitValue.LPX, null);
    PlatformDefaults.LPX20 = new UnitValue()._UnitValue$float$int$String(20, UnitValue.LPX, null);
    PlatformDefaults.LPY6 = new UnitValue()._UnitValue$float$int$String(6, UnitValue.LPY, null);
    PlatformDefaults.LPY7 = new UnitValue()._UnitValue$float$int$String(7, UnitValue.LPY, null);
    PlatformDefaults.LPY11 = new UnitValue()._UnitValue$float$int$String(11, UnitValue.LPY, null);
    PlatformDefaults.LPY12 = new UnitValue()._UnitValue$float$int$String(12, UnitValue.LPY, null);
    PlatformDefaults.LPY16 = new UnitValue()._UnitValue$float$int$String(16, UnitValue.LPY, null);
    PlatformDefaults.LPY18 = new UnitValue()._UnitValue$float$int$String(18, UnitValue.LPY, null);
    PlatformDefaults.LPY20 = new UnitValue()._UnitValue$float$int$String(20, UnitValue.LPY, null);
    PlatformDefaults.CUR_PLAF = PlatformDefaults.WINDOWS_XP;
    PlatformDefaults.PANEL_INS = $J.newArray(4, null);
    PlatformDefaults.DIALOG_INS = $J.newArray(4, null);
    PlatformDefaults.BUTTON_FORMAT = null;
    PlatformDefaults.HOR_DEFS = new HashMap(32);
    PlatformDefaults.VER_DEFS = new HashMap(32);
    PlatformDefaults.DEF_VGAP = null;
    PlatformDefaults.DEF_HGAP = null;
    PlatformDefaults.RELATED_X = null;
    PlatformDefaults.RELATED_Y = null;
    PlatformDefaults.UNRELATED_X = null;
    PlatformDefaults.UNRELATED_Y = null;
    PlatformDefaults.BUTT_WIDTH = null;
    PlatformDefaults.BUTT_PADDING = null;
    PlatformDefaults.horScale = null;
    PlatformDefaults.verScale = null;
    PlatformDefaults.LP_BASE = PlatformDefaults.BASE_SCALE_FACTOR;
    PlatformDefaults.BASE_DPI_FORCED = null;
    PlatformDefaults.BASE_DPI = 96;
    PlatformDefaults.dra = true;
    PlatformDefaults.VISUAL_BOUNDS = new HashMap(64);
    PlatformDefaults.setPlatform(PlatformDefaults.getCurrentPlatform());
    PlatformDefaults.MOD_COUNT = 0;
  }
}

$J.define(PlatformDefaults, 'net.miginfocom.layout.PlatformDefaults', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_PlatformDefaults' }, clinit: true, lazy: ['VISUAL_PADDING_PROPERTY', 'DEF_H_UNIT', 'DEF_V_UNIT', 'GAP_PROVIDER', 'MOD_COUNT', 'LPX6', 'LPX7', 'LPX11', 'LPX12', 'LPX16', 'LPX18', 'LPX20', 'LPY6', 'LPY7', 'LPY11', 'LPY12', 'LPY16', 'LPY18', 'LPY20', 'CUR_PLAF', 'PANEL_INS', 'DIALOG_INS', 'BUTTON_FORMAT', 'HOR_DEFS', 'VER_DEFS', 'DEF_VGAP', 'DEF_HGAP', 'RELATED_X', 'RELATED_Y', 'UNRELATED_X', 'UNRELATED_Y', 'BUTT_WIDTH', 'BUTT_PADDING', 'horScale', 'verScale', 'LP_BASE', 'BASE_DPI_FORCED', 'BASE_DPI', 'dra', 'VISUAL_BOUNDS'] });
$J.module(() => {
  BoundSize = $J.load('net.miginfocom.layout.BoundSize');
  LayoutUtil = $J.load('net.miginfocom.layout.LayoutUtil');
  UnitConverter = $J.load('net.miginfocom.layout.UnitConverter');
  UnitValue = $J.load('net.miginfocom.layout.UnitValue');
});
