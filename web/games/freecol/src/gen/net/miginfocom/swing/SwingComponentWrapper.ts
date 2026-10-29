// @ts-nocheck
// MigLayout 5.3 swing/net/miginfocom/swing/SwingComponentWrapper.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
 */
import { $J, Exception, IdentityHashMap, JNumber, JObject, JString, StringTokenizer, Throwable } from '../../../../jre/index.ts';

let BasicStroke, Button, Canvas, Checkbox, Choice, Color, Container, Font, HeadlessException, Insets, Label, List, Point, ScrollPane, Scrollbar, TextComponent, TextField, Point2D$Float, AbstractButton, JCheckBox, JComboBox, JComponent, JEditorPane, JLabel, JList, JPanel, JProgressBar, JRadioButton, JScrollBar, JScrollPane, JSeparator, JSlider, JSpinner, JTabbedPane, JTable, JTextArea, JTextField, SwingUtilities, UIManager, BasicHTML, JTextComponent, ComponentWrapper, LayoutUtil, PlatformDefaults, SwingContainerWrapper;

export class SwingComponentWrapper extends JObject {
  static maxSet: boolean = false;
  static vp: boolean = false;
  /**
   * Debug color for component bounds outline.
   */
  static DB_COMP_OUTLINE: Color = null;
  /**
   * Property to use in LAF settings and as JComponent client property
   * to specify the visual padding.
   * <p>
   */
  static VISUAL_PADDING_PROPERTY: string = null;
  c: Component = null;
  compType: number = 0;
  bl: boolean = null;
  prefCalled: boolean = false;
  /**
   * Cache.
   */
  static FM_MAP: IdentityHashMap<FontMetrics, Point2D$Float> = null;
  static SUBST_FONT: Font = null;
  static isJava9orLater: boolean = false;
  _SwingComponentWrapper(c: Component): this {
    this.compType = ComponentWrapper.TYPE_UNSET;
    this.bl = null;
    this.prefCalled = false;
    this.c = c;
    return this;
  }
  getBaseline(width: number, height: number): number {
    let h = height;
    let visPad = this.getVisualPadding();
    if (h < 0) {
      h = this.c.getHeight();
    } else if (visPad != null) {
      h = (height + visPad[0] + visPad[2]) | 0;
    }
    let baseLine = this.c.getBaseline(Math.max(0, width < 0 ? this.c.getWidth() : width), Math.max(0, h));
    if (baseLine !== -1 && visPad != null) {
      baseLine = (baseLine - visPad[0]) | 0;
    }
    return baseLine;
  }
  getComponent(): any {
    return this.c;
  }
  getPixelUnitFactor(isHor: boolean): number {
    {
      let font: Font, fm: FontMetrics, p: Point2D$Float, s: number, scaleFactor: number, lafScaleFactorObj: any, screenScale: number;
      switch (PlatformDefaults.getLogicalPixelBase()) {
        case PlatformDefaults.BASE_FONT_SIZE:
          font = this.c.getFont();
          fm = this.c.getFontMetrics(font != null ? font : SwingComponentWrapper.SUBST_FONT);
          p = SwingComponentWrapper.FM_MAP.get(fm);
          if (p == null) {
            let r = fm.getStringBounds$String$Graphics('X', this.c.getGraphics());
            p = new Point2D$Float()._Point2D$Float$float$float(Math.fround((Math.fround(r.getWidth())) / 6), Math.fround((Math.fround(r.getHeight())) / Math.fround(13.277344)));
            SwingComponentWrapper.FM_MAP.put(fm, p);
          }
          return isHor ? p.x_ : p.y_;
        case PlatformDefaults.BASE_SCALE_FACTOR:
          s = isHor ? PlatformDefaults.getHorizontalScaleFactor() : PlatformDefaults.getVerticalScaleFactor();
          scaleFactor = (s != null) ? +s : 1;
          lafScaleFactorObj = UIManager.get$Object('laf.scaleFactor');
          if ($J.isa(lafScaleFactorObj, JNumber)) {
            let lafScaleFactor = Math.fround(+(lafScaleFactorObj));
            return Math.fround(scaleFactor * lafScaleFactor);
          }
          screenScale = SwingComponentWrapper.isJava9orLater ? 1 : Math.fround(Math.fround((isHor ? this.getHorizontalScreenDPI() : this.getVerticalScreenDPI())) / Math.fround(PlatformDefaults.getDefaultDPI()));
          return Math.fround(scaleFactor * screenScale);
        default:
          return 1;
      }
    }
  }
  getX(): number {
    return this.c.getX();
  }
  getY(): number {
    return this.c.getY();
  }
  getHeight(): number {
    return this.c.getHeight();
  }
  getWidth(): number {
    return this.c.getWidth();
  }
  getScreenLocationX(): number {
    let p = new Point()._Point$();
    SwingUtilities.convertPointToScreen(p, this.c);
    return p.x_;
  }
  getScreenLocationY(): number {
    let p = new Point()._Point$();
    SwingUtilities.convertPointToScreen(p, this.c);
    return p.y_;
  }
  getMinimumHeight(sz: number): number {
    if (this.prefCalled === false) {
      this.c.getPreferredSize$();
      this.prefCalled = true;
    }
    return this.c.getMinimumSize$().height_;
  }
  getMinimumWidth(sz: number): number {
    if (this.prefCalled === false) {
      this.c.getPreferredSize$();
      this.prefCalled = true;
    }
    return this.c.getMinimumSize$().width_;
  }
  getPreferredHeight(sz: number): number {
    if (this.c.getWidth() === 0 && this.c.getHeight() === 0 && sz !== -1) {
      this.c.setBounds$int$int$int$int(this.c.getX(), this.c.getY(), sz, 1);
    }
    return this.c.getPreferredSize$().height_;
  }
  getPreferredWidth(sz: number): number {
    if (this.c.getWidth() === 0 && this.c.getHeight() === 0 && sz !== -1) {
      this.c.setBounds$int$int$int$int(this.c.getX(), this.c.getY(), 1, sz);
    }
    return this.c.getPreferredSize$().width_;
  }
  getMaximumHeight(sz: number): number {
    if (!this.isMaxSet(this.c)) {
      return 2147483647;
    }
    return this.c.getMaximumSize().height_;
  }
  getMaximumWidth(sz: number): number {
    if (!this.isMaxSet(this.c)) {
      return 2147483647;
    }
    return this.c.getMaximumSize().width_;
  }
  isMaxSet(c: Component): boolean {
    return c.isMaximumSizeSet();
  }
  getParent(): ContainerWrapper {
    let p = this.c.getParent();
    return p != null ? new SwingContainerWrapper()._SwingContainerWrapper(p) : null;
  }
  getHorizontalScreenDPI(): number {
    try {
      return this.c.getToolkit().getScreenResolution();
    } catch ($e0) {
      if ($J.isa($e0, HeadlessException)) {
        let ex = $J.exc($e0);
        return PlatformDefaults.getDefaultDPI();
      } else {
        throw $e0;
      }
    }
  }
  getVerticalScreenDPI(): number {
    try {
      return this.c.getToolkit().getScreenResolution();
    } catch ($e1) {
      if ($J.isa($e1, HeadlessException)) {
        let ex = $J.exc($e1);
        return PlatformDefaults.getDefaultDPI();
      } else {
        throw $e1;
      }
    }
  }
  getScreenWidth(): number {
    try {
      return this.c.getToolkit().getScreenSize().width_;
    } catch ($e2) {
      if ($J.isa($e2, HeadlessException)) {
        let ex = $J.exc($e2);
        return 1024;
      } else {
        throw $e2;
      }
    }
  }
  getScreenHeight(): number {
    try {
      return this.c.getToolkit().getScreenSize().height_;
    } catch ($e3) {
      if ($J.isa($e3, HeadlessException)) {
        let ex = $J.exc($e3);
        return 768;
      } else {
        throw $e3;
      }
    }
  }
  hasBaseline(): boolean {
    if (this.bl == null) {
      try {
        if (this.c instanceof JLabel && (this.c).getClientProperty(BasicHTML.propertyKey) != null) {
          this.bl = false;
        } else {
          this.bl = this.getBaseline(8192, 8192) > -1;
        }
      } catch ($e4) {
        {
          let ex = $J.exc($e4);
          this.bl = false;
        }
      }
    }
    return this.bl;
  }
  getLinkId(): string {
    return this.c.getName$();
  }
  setBounds(x: number, y: number, width: number, height: number): void {
    this.c.setBounds$int$int$int$int(x, y, width, height);
  }
  isVisible(): boolean {
    return this.c.isVisible$();
  }
  getVisualPadding(): number[] {
    let padding = null;
    if (SwingComponentWrapper.isVisualPaddingEnabled()) {
      if (this.c instanceof JComponent) {
        let component = this.c;
        let padValue = component.getClientProperty(SwingComponentWrapper.VISUAL_PADDING_PROPERTY);
        if (Array.isArray(padValue)) {
          padding = padValue;
        } else if (padValue instanceof Insets) {
          let padInsets = padValue;
          padding = [padInsets.top, padInsets.left, padInsets.bottom, padInsets.right];
        }
        if (padding == null) {
          let classID: string;
          {
            let border: Border;
            switch (this.getComponentType(false)) {
              case ComponentWrapper.TYPE_BUTTON:
                border = component.getBorder();
                if (border != null && border.getClass().getName().startsWith('com.apple.laf.AquaButtonBorder')) {
                  if (PlatformDefaults.getPlatform() === PlatformDefaults.MAC_OSX) {
                    let buttonType = component.getClientProperty('JButton.buttonType');
                    if (buttonType == null) {
                      classID = component.getHeight() < 33 ? 'Button' : 'Button.bevel';
                    } else {
                      classID = 'Button.' + $J.str(buttonType);
                    }
                    if ((component).getIcon() != null) {
                      classID += '.icon';
                    }
                  } else {
                    classID = 'Button';
                  }
                } else {
                  classID = '';
                }
                break;
              case ComponentWrapper.TYPE_CHECK_BOX:
                border = component.getBorder();
                if (border != null && border.getClass().getName().startsWith('com.apple.laf.AquaButtonBorder')) {
                  let size = component.getClientProperty('JComponent.sizeVariant');
                  if (size != null && $J.equals($J.str(size), 'regular') === false) {
                    size = '.' + $J.str(size);
                  } else {
                    size = '';
                  }
                  if (component instanceof JRadioButton) {
                    classID = 'RadioButton' + $J.str(size);
                  } else if (component instanceof JCheckBox) {
                    classID = 'CheckBox' + $J.str(size);
                  } else {
                    classID = 'ToggleButton' + $J.str(size);
                  }
                } else {
                  classID = '';
                }
                break;
              case ComponentWrapper.TYPE_COMBO_BOX:
                if (PlatformDefaults.getPlatform() === PlatformDefaults.MAC_OSX) {
                  if ((component).isEditable()) {
                    let isSquare = component.getClientProperty('JComboBox.isSquare');
                    if (isSquare != null && $J.equals($J.str(isSquare), 'true')) {
                      classID = 'ComboBox.editable.isSquare';
                    } else {
                      classID = 'ComboBox.editable';
                    }
                  } else {
                    let isSquare = component.getClientProperty('JComboBox.isSquare');
                    let isPopDown = component.getClientProperty('JComboBox.isPopDown');
                    if (isSquare != null && $J.equals($J.str(isSquare), 'true')) {
                      classID = 'ComboBox.isSquare';
                    } else if (isPopDown != null && $J.equals($J.str(isPopDown), 'true')) {
                      classID = 'ComboBox.isPopDown';
                    } else {
                      classID = 'ComboBox';
                    }
                  }
                } else {
                  classID = 'ComboBox';
                }
                break;
              case ComponentWrapper.TYPE_CONTAINER:
                classID = 'Container';
                break;
              case ComponentWrapper.TYPE_IMAGE:
                classID = 'Image';
                break;
              case ComponentWrapper.TYPE_LABEL:
                classID = 'Label';
                break;
              case ComponentWrapper.TYPE_LIST:
                classID = 'List';
                break;
              case ComponentWrapper.TYPE_PANEL:
                classID = 'Panel';
                break;
              case ComponentWrapper.TYPE_PROGRESS_BAR:
                classID = 'ProgressBar';
                break;
              case ComponentWrapper.TYPE_SCROLL_BAR:
                classID = 'ScrollBar';
                break;
              case ComponentWrapper.TYPE_SCROLL_PANE:
                classID = 'ScrollPane';
                break;
              case ComponentWrapper.TYPE_SEPARATOR:
                classID = 'Separator';
                break;
              case ComponentWrapper.TYPE_SLIDER:
                classID = 'Slider';
                break;
              case ComponentWrapper.TYPE_SPINNER:
                classID = 'Spinner';
                break;
              case ComponentWrapper.TYPE_TABLE:
                classID = 'Table';
                break;
              case ComponentWrapper.TYPE_TABBED_PANE:
                classID = 'TabbedPane';
                break;
              case ComponentWrapper.TYPE_TEXT_AREA:
                classID = 'TextArea';
                break;
              case ComponentWrapper.TYPE_TEXT_FIELD:
                border = component.getBorder();
                if (!component.isOpaque() && border != null && $J.equals(border.getClass().getSimpleName(), 'AquaTextFieldBorder')) {
                  classID = 'TextField';
                } else {
                  classID = '';
                }
                break;
              case ComponentWrapper.TYPE_TREE:
                classID = 'Tree';
                break;
              case ComponentWrapper.TYPE_UNKNOWN:
                classID = 'Other';
                break;
              case ComponentWrapper.TYPE_UNSET:
              default:
                classID = '';
                break;
            }
          }
          padValue = PlatformDefaults.getDefaultVisualPadding(classID + '.' + SwingComponentWrapper.VISUAL_PADDING_PROPERTY);
          if (Array.isArray(padValue)) {
            padding = padValue;
          } else if (padValue instanceof Insets) {
            let padInsets = padValue;
            padding = [padInsets.top, padInsets.left, padInsets.bottom, padInsets.right];
          }
        }
      }
    }
    return padding;
  }
  /**
   * @deprecated Java 1.4 is not supported anymore
   */
  static isMaxSizeSetOn1_4(): boolean {
    return SwingComponentWrapper.maxSet;
  }
  /**
   * @deprecated Java 1.4 is not supported anymore
   */
  static setMaxSizeSetOn1_4(b: boolean): void {
    SwingComponentWrapper.maxSet = b;
  }
  static isVisualPaddingEnabled(): boolean {
    return SwingComponentWrapper.vp;
  }
  static setVisualPaddingEnabled(b: boolean): void {
    SwingComponentWrapper.vp = b;
  }
  paintDebugOutline(showVisualPadding: boolean): void {
    if (this.c.isShowing() === false) {
      return;
    }
    let g = this.c.getGraphics();
    if (g == null) {
      return;
    }
    g.setPaint(SwingComponentWrapper.DB_COMP_OUTLINE);
    g.setStroke(new BasicStroke()._BasicStroke$float$int$int$float$floatArr$float(1, BasicStroke.CAP_SQUARE, BasicStroke.JOIN_MITER, 10, [2, 4], 0));
    g.drawRect(0, 0, (this.getWidth() - 1) | 0, (this.getHeight() - 1) | 0);
    if (showVisualPadding && SwingComponentWrapper.isVisualPaddingEnabled()) {
      let padding = this.getVisualPadding();
      if (padding != null) {
        g.setColor(Color.GREEN);
        g.drawRect(padding[1], padding[0], (this.getWidth() - 1 - (padding[1] + padding[3])) | 0, (this.getHeight() - 1 - (padding[0] + padding[2])) | 0);
      }
    }
  }
  getComponentType(disregardScrollPane: boolean): number {
    if (this.compType === ComponentWrapper.TYPE_UNSET) {
      this.compType = this.checkType(disregardScrollPane);
    }
    return this.compType;
  }
  getLayoutHashCode(): number {
    let d = this.c.getMaximumSize();
    let hash = (d.width_ + (d.height_ << 5)) | 0;
    d = this.c.getPreferredSize$();
    hash = (hash + ((d.width_ << 10) + (d.height_ << 15))) | 0;
    d = this.c.getMinimumSize$();
    hash = (hash + ((d.width_ << 20) + (d.height_ << 25))) | 0;
    if (this.c.isVisible$()) {
      hash = (hash + 1324511) | 0;
    }
    let id = this.getLinkId();
    if (id != null) {
      hash = (hash + $J.hashCode(id)) | 0;
    }
    return hash;
  }
  checkType(disregardScrollPane: boolean): number {
    let c = this.c;
    if (disregardScrollPane) {
      if (c instanceof JScrollPane) {
        c = (c).getViewport().getView();
      } else if (c instanceof ScrollPane) {
        c = (c).getComponent$int(0);
      }
    }
    if (c instanceof JTextField || c instanceof TextField) {
      return ComponentWrapper.TYPE_TEXT_FIELD;
    } else if (c instanceof JLabel || c instanceof Label) {
      return ComponentWrapper.TYPE_LABEL;
    } else if (c instanceof JCheckBox || c instanceof JRadioButton || c instanceof Checkbox) {
      return ComponentWrapper.TYPE_CHECK_BOX;
    } else if (c instanceof AbstractButton || c instanceof Button) {
      return ComponentWrapper.TYPE_BUTTON;
    } else if (c instanceof JComboBox || c instanceof Choice) {
      return ComponentWrapper.TYPE_COMBO_BOX;
    } else if (c instanceof JTextComponent || c instanceof TextComponent) {
      return ComponentWrapper.TYPE_TEXT_AREA;
    } else if (c instanceof JPanel || c instanceof Canvas) {
      return ComponentWrapper.TYPE_PANEL;
    } else if (c instanceof JList || c instanceof List) {
      return ComponentWrapper.TYPE_LIST;
    } else if (c instanceof JTable) {
      return ComponentWrapper.TYPE_TABLE;
    } else if (c instanceof JSeparator) {
      return ComponentWrapper.TYPE_SEPARATOR;
    } else if (c instanceof JSpinner) {
      return ComponentWrapper.TYPE_SPINNER;
    } else if (c instanceof JTabbedPane) {
      return ComponentWrapper.TYPE_TABBED_PANE;
    } else if (c instanceof JProgressBar) {
      return ComponentWrapper.TYPE_PROGRESS_BAR;
    } else if (c instanceof JSlider) {
      return ComponentWrapper.TYPE_SLIDER;
    } else if (c instanceof JScrollPane) {
      return ComponentWrapper.TYPE_SCROLL_PANE;
    } else if (c instanceof JScrollBar || c instanceof Scrollbar) {
      return ComponentWrapper.TYPE_SCROLL_BAR;
    } else if (c instanceof Container) {
      return ComponentWrapper.TYPE_CONTAINER;
    }
    return ComponentWrapper.TYPE_UNKNOWN;
  }
  hashCode(): number {
    return $J.hashCode(this.getComponent());
  }
  equals(o: any): boolean {
    if ($J.isa(o, ComponentWrapper) === false) {
      return false;
    }
    return this.c.equals((o).getComponent());
  }
  getContentBias(): number {
    return this.c instanceof JTextArea || this.c instanceof JEditorPane || (this.c instanceof JComponent && $J.equals(true, (this.c).getClientProperty('migLayout.dynamicAspectRatio'))) ? LayoutUtil.HORIZONTAL : -1;
  }
  static $clinit() {
    SwingComponentWrapper.maxSet = false;
    SwingComponentWrapper.vp = true;
    SwingComponentWrapper.DB_COMP_OUTLINE = new Color()._Color$int$int$int(0, 0, 200);
    SwingComponentWrapper.VISUAL_PADDING_PROPERTY = PlatformDefaults.VISUAL_PADDING_PROPERTY;
    SwingComponentWrapper.FM_MAP = new IdentityHashMap(4);
    SwingComponentWrapper.SUBST_FONT = new Font()._Font$String$int$int('sansserif', Font.PLAIN, 11);
    try {
      let st = new StringTokenizer($J.system_getProperty('java.version'), '._-+');
      let majorVersion = $J.parseInt(st.nextToken());
      SwingComponentWrapper.isJava9orLater = majorVersion >= 9;
    } catch ($e5) {
      if ($J.isa($e5, Exception)) {
        let e = $J.exc($e5);
      } else {
        throw $e5;
      }
    }
  }
}

$J.define(SwingComponentWrapper, 'net.miginfocom.swing.SwingComponentWrapper', { kind: 'class', ifaces: ['net.miginfocom.layout.ComponentWrapper'], sup: 'java.lang.Object', ctors: { 'java.awt.Component': '_SwingComponentWrapper' }, clinit: true, lazy: ['maxSet', 'vp', 'DB_COMP_OUTLINE', 'VISUAL_PADDING_PROPERTY', 'FM_MAP', 'SUBST_FONT', 'isJava9orLater'] });
$J.module(() => {
  BasicStroke = $J.load('java.awt.BasicStroke');
  Button = $J.load('java.awt.Button');
  Canvas = $J.load('java.awt.Canvas');
  Checkbox = $J.load('java.awt.Checkbox');
  Choice = $J.load('java.awt.Choice');
  Color = $J.load('java.awt.Color');
  Container = $J.load('java.awt.Container');
  Font = $J.load('java.awt.Font');
  HeadlessException = $J.load('java.awt.HeadlessException');
  Insets = $J.load('java.awt.Insets');
  Label = $J.load('java.awt.Label');
  List = $J.load('java.awt.List');
  Point = $J.load('java.awt.Point');
  ScrollPane = $J.load('java.awt.ScrollPane');
  Scrollbar = $J.load('java.awt.Scrollbar');
  TextComponent = $J.load('java.awt.TextComponent');
  TextField = $J.load('java.awt.TextField');
  Point2D$Float = $J.load('java.awt.geom.Point2D$Float');
  AbstractButton = $J.load('javax.swing.AbstractButton');
  JCheckBox = $J.load('javax.swing.JCheckBox');
  JComboBox = $J.load('javax.swing.JComboBox');
  JComponent = $J.load('javax.swing.JComponent');
  JEditorPane = $J.load('javax.swing.JEditorPane');
  JLabel = $J.load('javax.swing.JLabel');
  JList = $J.load('javax.swing.JList');
  JPanel = $J.load('javax.swing.JPanel');
  JProgressBar = $J.load('javax.swing.JProgressBar');
  JRadioButton = $J.load('javax.swing.JRadioButton');
  JScrollBar = $J.load('javax.swing.JScrollBar');
  JScrollPane = $J.load('javax.swing.JScrollPane');
  JSeparator = $J.load('javax.swing.JSeparator');
  JSlider = $J.load('javax.swing.JSlider');
  JSpinner = $J.load('javax.swing.JSpinner');
  JTabbedPane = $J.load('javax.swing.JTabbedPane');
  JTable = $J.load('javax.swing.JTable');
  JTextArea = $J.load('javax.swing.JTextArea');
  JTextField = $J.load('javax.swing.JTextField');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIManager = $J.load('javax.swing.UIManager');
  BasicHTML = $J.load('javax.swing.plaf.basic.BasicHTML');
  JTextComponent = $J.load('javax.swing.text.JTextComponent');
  ComponentWrapper = $J.load('net.miginfocom.layout.ComponentWrapper');
  LayoutUtil = $J.load('net.miginfocom.layout.LayoutUtil');
  PlatformDefaults = $J.load('net.miginfocom.layout.PlatformDefaults');
  SwingContainerWrapper = $J.load('net.miginfocom.swing.SwingContainerWrapper');
});
