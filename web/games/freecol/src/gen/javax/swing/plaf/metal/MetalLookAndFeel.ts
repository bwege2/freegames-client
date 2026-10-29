// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/metal/MetalLookAndFeel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2023, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AccessController, AppContext, GetPropertyAction, JObject, NullPointerException, ReferenceQueue, Toolkit, WeakReference } from '../../../../../jre/index.ts';
import { BasicLookAndFeel } from '../basic/BasicLookAndFeel.ts';

let Frame, Insets, ImageIcon, JTextField, SwingUtilities, UIDefaults$LazyInputMap, UIManager, BorderUIResource$LineBorderUIResource, ColorUIResource, InsetsUIResource, DefaultMetalTheme, MetalBorders, MetalBorders$DialogBorder, MetalBorders$ErrorDialogBorder, MetalBorders$FrameBorder, MetalBorders$InternalFrameBorder, MetalBorders$MenuBarBorder, MetalBorders$MenuItemBorder, MetalBorders$OptionDialogBorder, MetalBorders$PaletteBorder, MetalBorders$PopupMenuBorder, MetalBorders$QuestionDialogBorder, MetalBorders$ScrollPaneBorder, MetalBorders$TableHeaderBorder, MetalBorders$ToolBarBorder, MetalBorders$WarningDialogBorder, MetalFontDesktopProperty, MetalHighContrastTheme, MetalIconFactory, MetalIconFactory$PaletteCloseIcon, MetalTheme, MetalUtils, OceanTheme, DefaultEditorKit, OSInfo, OSInfo$OSType, SwingAccessor, SwingUtilities2;

/**
 * The Java Look and Feel, otherwise known as Metal.
 * <p>
 * Each of the {@code ComponentUI}s provided by {@code
 * MetalLookAndFeel} derives its behavior from the defaults
 * table. Unless otherwise noted each of the {@code ComponentUI}
 * implementations in this package document the set of defaults they
 * use. Unless otherwise noted the defaults are installed at the time
 * {@code installUI} is invoked, and follow the recommendations
 * outlined in {@code LookAndFeel} for installing defaults.
 * <p>
 * {@code MetalLookAndFeel} derives it's color palette and fonts from
 * {@code MetalTheme}. The default theme is {@code OceanTheme}. The theme
 * can be changed using the {@code setCurrentTheme} method, refer to it
 * for details on changing the theme. Prior to 1.5 the default
 * theme was {@code DefaultMetalTheme}. The system property
 * {@code "swing.metalTheme"} can be set to {@code "steel"} to indicate
 * the default should be {@code DefaultMetalTheme}.
 * <p>
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the <code>java.beans</code> package.
 * Please see {@link java.beans.XMLEncoder}.
 *
 * @see MetalTheme
 * @see DefaultMetalTheme
 * @see OceanTheme
 *
 * @author Steve Wilson
 */
export class MetalLookAndFeel extends BasicLookAndFeel {
  static METAL_LOOK_AND_FEEL_INITED: boolean = false;
  /**
   * True if checked for windows yet.
   */
  static checkedWindows: boolean = false;
  /**
   * True if running on Windows.
   */
  static isWindows_: boolean = false;
  /**
   * Set to true first time we've checked swing.useSystemFontSettings.
   */
  static checkedSystemFontSettings: boolean = false;
  /**
   * True indicates we should use system fonts, unless the developer has
   * specified otherwise with Application.useSystemFontSettings.
   */
  static useSystemFonts_: boolean = false;
  static queue: ReferenceQueue<LookAndFeel> = null;
  /**
   * Constructs a {@code MetalLookAndFeel}.
   */
  _MetalLookAndFeel(): this {
    this._BasicLookAndFeel();
    return this;
  }
  /**
   * Returns true if running on Windows.
   */
  static isWindows(): boolean {
    if (!MetalLookAndFeel.checkedWindows) {
      if (OSInfo.getOSType() === OSInfo$OSType.WINDOWS) {
        MetalLookAndFeel.isWindows_ = true;
        let systemFonts = AccessController.doPrivileged(new GetPropertyAction('swing.useSystemFontSettings'));
        MetalLookAndFeel.useSystemFonts_ = $J.parseBoolean(systemFonts);
      }
      MetalLookAndFeel.checkedWindows = true;
    }
    return MetalLookAndFeel.isWindows_;
  }
  /**
   * Returns true if system fonts should be used, this is only useful
   * for windows.
   */
  static useSystemFonts(): boolean {
    if (MetalLookAndFeel.isWindows() && MetalLookAndFeel.useSystemFonts_) {
      if (MetalLookAndFeel.METAL_LOOK_AND_FEEL_INITED) {
        let value = UIManager.get$Object('Application.useSystemFontSettings');
        return (value == null || $J.equals(true, value));
      }
      return true;
    }
    return false;
  }
  /**
   * Returns true if the high contrast theme should be used as the default
   * theme.
   */
  static useHighContrastTheme(): boolean {
    if (MetalLookAndFeel.isWindows() && MetalLookAndFeel.useSystemFonts()) {
      let highContrast = Toolkit.getDefaultToolkit().getDesktopProperty('win.highContrast.on');
      return (highContrast == null) ? false : highContrast;
    }
    return false;
  }
  /**
   * Returns true if we're using the Ocean Theme.
   */
  static usingOcean(): boolean {
    return (MetalLookAndFeel.getCurrentTheme() instanceof OceanTheme);
  }
  /**
   * Returns a short description of this look and feel. This returns
   * {@code "The Java(tm) Look and Feel"}.
   *
   * @return a short description for the look and feel
   */
  getDescription(): string {
    return 'The Java(tm) Look and Feel';
  }
  /**
   * Returns {@code true}; {@code MetalLookAndFeel} can be run on
   * any platform.
   *
   * @return {@code true}
   */
  isSupportedLookAndFeel(): boolean {
    return true;
  }
  /**
   * Returns {@code true}; metal can provide {@code Window}
   * decorations.
   *
   * @return {@code true}
   *
   * @see JDialog#setDefaultLookAndFeelDecorated
   * @see JFrame#setDefaultLookAndFeelDecorated
   * @see JRootPane#setWindowDecorationStyle
   * @since 1.4
   */
  getSupportsWindowDecorations(): boolean {
    return true;
  }
  /**
   * Populates {@code table} with mappings from {@code uiClassID} to
   * the fully qualified name of the ui class. {@code
   * MetalLookAndFeel} registers an entry for each of the classes in
   * the package {@code javax.swing.plaf.metal} that are named
   * MetalXXXUI. The string {@code XXX} is one of Swing's uiClassIDs. For
   * the {@code uiClassIDs} that do not have a class in metal, the
   * corresponding class in {@code javax.swing.plaf.basic} is
   * used. For example, metal does not have a class named {@code
   * "MetalColorChooserUI"}, as such, {@code
   * javax.swing.plaf.basic.BasicColorChooserUI} is used.
   *
   * @param table the {@code UIDefaults} instance the entries are
   *        added to
   * @throws NullPointerException if {@code table} is {@code null}
   *
   * @see javax.swing.plaf.basic.BasicLookAndFeel#initClassDefaults
   */
  initClassDefaults(table: UIDefaults): void {
    super.initClassDefaults(table);
    let metalPackageName = 'javax.swing.plaf.metal.';
    let uiDefaults = ['ButtonUI', metalPackageName + 'MetalButtonUI', 'CheckBoxUI', metalPackageName + 'MetalCheckBoxUI', 'ComboBoxUI', metalPackageName + 'MetalComboBoxUI', 'DesktopIconUI', metalPackageName + 'MetalDesktopIconUI', 'FileChooserUI', metalPackageName + 'MetalFileChooserUI', 'InternalFrameUI', metalPackageName + 'MetalInternalFrameUI', 'LabelUI', metalPackageName + 'MetalLabelUI', 'MenuBarUI', metalPackageName + 'MetalMenuBarUI', 'PopupMenuSeparatorUI', metalPackageName + 'MetalPopupMenuSeparatorUI', 'ProgressBarUI', metalPackageName + 'MetalProgressBarUI', 'RadioButtonUI', metalPackageName + 'MetalRadioButtonUI', 'ScrollBarUI', metalPackageName + 'MetalScrollBarUI', 'ScrollPaneUI', metalPackageName + 'MetalScrollPaneUI', 'SeparatorUI', metalPackageName + 'MetalSeparatorUI', 'SliderUI', metalPackageName + 'MetalSliderUI', 'SplitPaneUI', metalPackageName + 'MetalSplitPaneUI', 'TabbedPaneUI', metalPackageName + 'MetalTabbedPaneUI', 'TextFieldUI', metalPackageName + 'MetalTextFieldUI', 'ToggleButtonUI', metalPackageName + 'MetalToggleButtonUI', 'ToolBarUI', metalPackageName + 'MetalToolBarUI', 'ToolTipUI', metalPackageName + 'MetalToolTipUI', 'TreeUI', metalPackageName + 'MetalTreeUI', 'RootPaneUI', metalPackageName + 'MetalRootPaneUI'];
    table.putDefaults(uiDefaults);
  }
  /**
   * Populates {@code table} with system colors. The following values are
   * added to {@code table}:
   *
   * <table class="striped">
   * <caption>Metal's system color mapping</caption>
   * <thead>
   *  <tr>
   *    <th scope="col">Key
   *    <th scope="col">Value
   * </thead>
   * <tbody>
   *  <tr>
   *    <th scope="row">"desktop"
   *    <td>{@code theme.getDesktopColor()}
   *  <tr>
   *    <th scope="row">"activeCaption"
   *    <td>{@code theme.getWindowTitleBackground()}
   *  <tr>
   *    <th scope="row">"activeCaptionText"
   *    <td>{@code theme.getWindowTitleForeground()}
   *  <tr>
   *    <th scope="row">"activeCaptionBorder"
   *    <td>{@code theme.getPrimaryControlShadow()}
   *  <tr>
   *    <th scope="row">"inactiveCaption"
   *    <td>{@code theme.getWindowTitleInactiveBackground()}
   *  <tr>
   *    <th scope="row">"inactiveCaptionText"
   *    <td>{@code theme.getWindowTitleInactiveForeground()}
   *  <tr>
   *    <th scope="row">"inactiveCaptionBorder"
   *    <td>{@code theme.getControlShadow()}
   *  <tr>
   *    <th scope="row">"window"
   *    <td>{@code theme.getWindowBackground()}
   *  <tr>
   *    <th scope="row">"windowBorder"
   *    <td>{@code theme.getControl()}
   *  <tr>
   *    <th scope="row">"windowText"
   *    <td>{@code theme.getUserTextColor()}
   *  <tr>
   *    <th scope="row">"menu"
   *    <td>{@code theme.getMenuBackground()}
   *  <tr>
   *    <th scope="row">"menuText"
   *    <td>{@code theme.getMenuForeground()}
   *  <tr>
   *    <th scope="row">"text"
   *    <td>{@code theme.getWindowBackground()}
   *  <tr>
   *    <th scope="row">"textText"
   *    <td>{@code theme.getUserTextColor()}
   *  <tr>
   *    <th scope="row">"textHighlight"
   *    <td>{@code theme.getTextHighlightColor()}
   *  <tr>
   *    <th scope="row">"textHighlightText"
   *    <td>{@code theme.getHighlightedTextColor()}
   *  <tr>
   *    <th scope="row">"textInactiveText"
   *    <td>{@code theme.getInactiveSystemTextColor()}
   *  <tr>
   *    <th scope="row">"control"
   *    <td>{@code theme.getControl()}
   *  <tr>
   *    <th scope="row">"controlText"
   *    <td>{@code theme.getControlTextColor()}
   *  <tr>
   *    <th scope="row">"controlHighlight"
   *    <td>{@code theme.getControlHighlight()}
   *  <tr>
   *    <th scope="row">"controlLtHighlight"
   *    <td>{@code theme.getControlHighlight()}
   *  <tr>
   *    <th scope="row">"controlShadow"
   *    <td>{@code theme.getControlShadow()}
   *  <tr>
   *    <th scope="row">"controlDkShadow"
   *    <td>{@code theme.getControlDarkShadow()}
   *  <tr>
   *    <th scope="row">"scrollbar"
   *    <td>{@code theme.getControl()}
   *  <tr>
   *    <th scope="row">"info"
   *    <td>{@code theme.getPrimaryControl()}
   *  <tr>
   *    <th scope="row">"infoText"
   *    <td>{@code theme.getPrimaryControlInfo()}
   * </tbody>
   * </table>
   * The value {@code theme} corresponds to the current {@code MetalTheme}.
   *
   * @param table the {@code UIDefaults} object the values are added to
   * @throws NullPointerException if {@code table} is {@code null}
   */
  initSystemColorDefaults(table: UIDefaults): void {
    let theme = MetalLookAndFeel.getCurrentTheme();
    let control = theme.getControl();
    let systemColors = ['desktop', theme.getDesktopColor(), 'activeCaption', theme.getWindowTitleBackground(), 'activeCaptionText', theme.getWindowTitleForeground(), 'activeCaptionBorder', theme.getPrimaryControlShadow(), 'inactiveCaption', theme.getWindowTitleInactiveBackground(), 'inactiveCaptionText', theme.getWindowTitleInactiveForeground(), 'inactiveCaptionBorder', theme.getControlShadow(), 'window', theme.getWindowBackground(), 'windowBorder', control, 'windowText', theme.getUserTextColor(), 'menu', theme.getMenuBackground(), 'menuText', theme.getMenuForeground(), 'text', theme.getWindowBackground(), 'textText', theme.getUserTextColor(), 'textHighlight', theme.getTextHighlightColor(), 'textHighlightText', theme.getHighlightedTextColor(), 'textInactiveText', theme.getInactiveSystemTextColor(), 'control', control, 'controlText', theme.getControlTextColor(), 'controlHighlight', theme.getControlHighlight(), 'controlLtHighlight', theme.getControlHighlight(), 'controlShadow', theme.getControlShadow(), 'controlDkShadow', theme.getControlDarkShadow(), 'scrollbar', control, 'info', theme.getPrimaryControl(), 'infoText', theme.getPrimaryControlInfo()];
    table.putDefaults(systemColors);
  }
  /**
   * Initialize the defaults table with the name of the ResourceBundle
   * used for getting localized defaults.
   */
  initResourceBundle$UIDefaults$MetalLookAndFeel(table: UIDefaults): void {
    $J.fn(SwingAccessor.getUIDefaultsAccessor(), 'addInternalBundle')(table, 'com.sun.swing.internal.plaf.metal.resources.metal');
  }
  /**
   * Populates {@code table} with the defaults for metal.
   *
   * @param table the {@code UIDefaults} to add the values to
   * @throws NullPointerException if {@code table} is {@code null}
   */
  initComponentDefaults(table: UIDefaults): void {
    super.initComponentDefaults(table);
    this.initResourceBundle$UIDefaults$MetalLookAndFeel(table);
    let acceleratorForeground = MetalLookAndFeel.getAcceleratorForeground();
    let acceleratorSelectedForeground = MetalLookAndFeel.getAcceleratorSelectedForeground();
    let control = MetalLookAndFeel.getControl();
    let controlHighlight = MetalLookAndFeel.getControlHighlight();
    let controlShadow = MetalLookAndFeel.getControlShadow();
    let controlDarkShadow = MetalLookAndFeel.getControlDarkShadow();
    let controlTextColor = MetalLookAndFeel.getControlTextColor();
    let focusColor = MetalLookAndFeel.getFocusColor();
    let inactiveControlTextColor = MetalLookAndFeel.getInactiveControlTextColor();
    let menuBackground = MetalLookAndFeel.getMenuBackground();
    let menuSelectedBackground = MetalLookAndFeel.getMenuSelectedBackground();
    let menuDisabledForeground = MetalLookAndFeel.getMenuDisabledForeground();
    let menuSelectedForeground = MetalLookAndFeel.getMenuSelectedForeground();
    let primaryControl = MetalLookAndFeel.getPrimaryControl();
    let primaryControlDarkShadow = MetalLookAndFeel.getPrimaryControlDarkShadow();
    let primaryControlShadow = MetalLookAndFeel.getPrimaryControlShadow();
    let systemTextColor = MetalLookAndFeel.getSystemTextColor();
    let zeroInsets = new InsetsUIResource()._InsetsUIResource(0, 0, 0, 0);
    let zero = 0;
    let textFieldBorder = (t) => MetalBorders.getTextFieldBorder();
    let dialogBorder = (t) => new MetalBorders$DialogBorder()._MetalBorders$DialogBorder();
    let questionDialogBorder = (t) => new MetalBorders$QuestionDialogBorder()._MetalBorders$QuestionDialogBorder();
    let fieldInputMap = new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['ctrl C', DefaultEditorKit.copyAction, 'ctrl V', DefaultEditorKit.pasteAction, 'ctrl X', DefaultEditorKit.cutAction, 'COPY', DefaultEditorKit.copyAction, 'PASTE', DefaultEditorKit.pasteAction, 'CUT', DefaultEditorKit.cutAction, 'control INSERT', DefaultEditorKit.copyAction, 'shift INSERT', DefaultEditorKit.pasteAction, 'shift DELETE', DefaultEditorKit.cutAction, 'shift LEFT', DefaultEditorKit.selectionBackwardAction, 'shift KP_LEFT', DefaultEditorKit.selectionBackwardAction, 'shift RIGHT', DefaultEditorKit.selectionForwardAction, 'shift KP_RIGHT', DefaultEditorKit.selectionForwardAction, 'ctrl LEFT', DefaultEditorKit.previousWordAction, 'ctrl KP_LEFT', DefaultEditorKit.previousWordAction, 'ctrl RIGHT', DefaultEditorKit.nextWordAction, 'ctrl KP_RIGHT', DefaultEditorKit.nextWordAction, 'ctrl shift LEFT', DefaultEditorKit.selectionPreviousWordAction, 'ctrl shift KP_LEFT', DefaultEditorKit.selectionPreviousWordAction, 'ctrl shift RIGHT', DefaultEditorKit.selectionNextWordAction, 'ctrl shift KP_RIGHT', DefaultEditorKit.selectionNextWordAction, 'ctrl A', DefaultEditorKit.selectAllAction, 'HOME', DefaultEditorKit.beginLineAction, 'END', DefaultEditorKit.endLineAction, 'shift HOME', DefaultEditorKit.selectionBeginLineAction, 'shift END', DefaultEditorKit.selectionEndLineAction, 'BACK_SPACE', DefaultEditorKit.deletePrevCharAction, 'shift BACK_SPACE', DefaultEditorKit.deletePrevCharAction, 'ctrl H', DefaultEditorKit.deletePrevCharAction, 'DELETE', DefaultEditorKit.deleteNextCharAction, 'ctrl DELETE', DefaultEditorKit.deleteNextWordAction, 'ctrl BACK_SPACE', DefaultEditorKit.deletePrevWordAction, 'RIGHT', DefaultEditorKit.forwardAction, 'LEFT', DefaultEditorKit.backwardAction, 'KP_RIGHT', DefaultEditorKit.forwardAction, 'KP_LEFT', DefaultEditorKit.backwardAction, 'ENTER', JTextField.notifyAction, 'ctrl BACK_SLASH', 'unselect', 'control shift O', 'toggle-componentOrientation']);
    let passwordInputMap = new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['ctrl C', DefaultEditorKit.copyAction, 'ctrl V', DefaultEditorKit.pasteAction, 'ctrl X', DefaultEditorKit.cutAction, 'COPY', DefaultEditorKit.copyAction, 'PASTE', DefaultEditorKit.pasteAction, 'CUT', DefaultEditorKit.cutAction, 'control INSERT', DefaultEditorKit.copyAction, 'shift INSERT', DefaultEditorKit.pasteAction, 'shift DELETE', DefaultEditorKit.cutAction, 'shift LEFT', DefaultEditorKit.selectionBackwardAction, 'shift KP_LEFT', DefaultEditorKit.selectionBackwardAction, 'shift RIGHT', DefaultEditorKit.selectionForwardAction, 'shift KP_RIGHT', DefaultEditorKit.selectionForwardAction, 'ctrl LEFT', DefaultEditorKit.beginLineAction, 'ctrl KP_LEFT', DefaultEditorKit.beginLineAction, 'ctrl RIGHT', DefaultEditorKit.endLineAction, 'ctrl KP_RIGHT', DefaultEditorKit.endLineAction, 'ctrl shift LEFT', DefaultEditorKit.selectionBeginLineAction, 'ctrl shift KP_LEFT', DefaultEditorKit.selectionBeginLineAction, 'ctrl shift RIGHT', DefaultEditorKit.selectionEndLineAction, 'ctrl shift KP_RIGHT', DefaultEditorKit.selectionEndLineAction, 'ctrl A', DefaultEditorKit.selectAllAction, 'HOME', DefaultEditorKit.beginLineAction, 'END', DefaultEditorKit.endLineAction, 'shift HOME', DefaultEditorKit.selectionBeginLineAction, 'shift END', DefaultEditorKit.selectionEndLineAction, 'BACK_SPACE', DefaultEditorKit.deletePrevCharAction, 'shift BACK_SPACE', DefaultEditorKit.deletePrevCharAction, 'ctrl H', DefaultEditorKit.deletePrevCharAction, 'DELETE', DefaultEditorKit.deleteNextCharAction, 'RIGHT', DefaultEditorKit.forwardAction, 'LEFT', DefaultEditorKit.backwardAction, 'KP_RIGHT', DefaultEditorKit.forwardAction, 'KP_LEFT', DefaultEditorKit.backwardAction, 'ENTER', JTextField.notifyAction, 'ctrl BACK_SLASH', 'unselect', 'control shift O', 'toggle-componentOrientation']);
    let multilineInputMap = new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['ctrl C', DefaultEditorKit.copyAction, 'ctrl V', DefaultEditorKit.pasteAction, 'ctrl X', DefaultEditorKit.cutAction, 'COPY', DefaultEditorKit.copyAction, 'PASTE', DefaultEditorKit.pasteAction, 'CUT', DefaultEditorKit.cutAction, 'control INSERT', DefaultEditorKit.copyAction, 'shift INSERT', DefaultEditorKit.pasteAction, 'shift DELETE', DefaultEditorKit.cutAction, 'shift LEFT', DefaultEditorKit.selectionBackwardAction, 'shift KP_LEFT', DefaultEditorKit.selectionBackwardAction, 'shift RIGHT', DefaultEditorKit.selectionForwardAction, 'shift KP_RIGHT', DefaultEditorKit.selectionForwardAction, 'ctrl LEFT', DefaultEditorKit.previousWordAction, 'ctrl KP_LEFT', DefaultEditorKit.previousWordAction, 'ctrl RIGHT', DefaultEditorKit.nextWordAction, 'ctrl KP_RIGHT', DefaultEditorKit.nextWordAction, 'ctrl shift LEFT', DefaultEditorKit.selectionPreviousWordAction, 'ctrl shift KP_LEFT', DefaultEditorKit.selectionPreviousWordAction, 'ctrl shift RIGHT', DefaultEditorKit.selectionNextWordAction, 'ctrl shift KP_RIGHT', DefaultEditorKit.selectionNextWordAction, 'ctrl A', DefaultEditorKit.selectAllAction, 'HOME', DefaultEditorKit.beginLineAction, 'END', DefaultEditorKit.endLineAction, 'shift HOME', DefaultEditorKit.selectionBeginLineAction, 'shift END', DefaultEditorKit.selectionEndLineAction, 'UP', DefaultEditorKit.upAction, 'KP_UP', DefaultEditorKit.upAction, 'DOWN', DefaultEditorKit.downAction, 'KP_DOWN', DefaultEditorKit.downAction, 'PAGE_UP', DefaultEditorKit.pageUpAction, 'PAGE_DOWN', DefaultEditorKit.pageDownAction, 'shift PAGE_UP', 'selection-page-up', 'shift PAGE_DOWN', 'selection-page-down', 'ctrl shift PAGE_UP', 'selection-page-left', 'ctrl shift PAGE_DOWN', 'selection-page-right', 'shift UP', DefaultEditorKit.selectionUpAction, 'shift KP_UP', DefaultEditorKit.selectionUpAction, 'shift DOWN', DefaultEditorKit.selectionDownAction, 'shift KP_DOWN', DefaultEditorKit.selectionDownAction, 'ENTER', DefaultEditorKit.insertBreakAction, 'BACK_SPACE', DefaultEditorKit.deletePrevCharAction, 'shift BACK_SPACE', DefaultEditorKit.deletePrevCharAction, 'ctrl H', DefaultEditorKit.deletePrevCharAction, 'DELETE', DefaultEditorKit.deleteNextCharAction, 'ctrl DELETE', DefaultEditorKit.deleteNextWordAction, 'ctrl BACK_SPACE', DefaultEditorKit.deletePrevWordAction, 'RIGHT', DefaultEditorKit.forwardAction, 'LEFT', DefaultEditorKit.backwardAction, 'KP_RIGHT', DefaultEditorKit.forwardAction, 'KP_LEFT', DefaultEditorKit.backwardAction, 'TAB', DefaultEditorKit.insertTabAction, 'ctrl BACK_SLASH', 'unselect', 'ctrl HOME', DefaultEditorKit.beginAction, 'ctrl END', DefaultEditorKit.endAction, 'ctrl shift HOME', DefaultEditorKit.selectionBeginAction, 'ctrl shift END', DefaultEditorKit.selectionEndAction, 'ctrl T', 'next-link-action', 'ctrl shift T', 'previous-link-action', 'ctrl SPACE', 'activate-link-action', 'control shift O', 'toggle-componentOrientation']);
    let scrollPaneBorder = (t) => new MetalBorders$ScrollPaneBorder()._MetalBorders$ScrollPaneBorder();
    let buttonBorder = (t) => MetalBorders.getButtonBorder();
    let toggleButtonBorder = (t) => MetalBorders.getToggleButtonBorder();
    let titledBorderBorder = (t) => new BorderUIResource$LineBorderUIResource()._BorderUIResource$LineBorderUIResource$Color(controlShadow);
    let desktopIconBorder = (t) => MetalBorders.getDesktopIconBorder();
    let menuBarBorder = (t) => new MetalBorders$MenuBarBorder()._MetalBorders$MenuBarBorder();
    let popupMenuBorder = (t) => new MetalBorders$PopupMenuBorder()._MetalBorders$PopupMenuBorder();
    let menuItemBorder = (t) => new MetalBorders$MenuItemBorder()._MetalBorders$MenuItemBorder();
    let menuItemAcceleratorDelimiter = '-';
    let toolBarBorder = (t) => new MetalBorders$ToolBarBorder()._MetalBorders$ToolBarBorder();
    let progressBarBorder = (t) => new BorderUIResource$LineBorderUIResource()._BorderUIResource$LineBorderUIResource$Color$int(controlDarkShadow, 1);
    let toolTipBorder = (t) => new BorderUIResource$LineBorderUIResource()._BorderUIResource$LineBorderUIResource$Color(primaryControlDarkShadow);
    let toolTipBorderInactive = (t) => new BorderUIResource$LineBorderUIResource()._BorderUIResource$LineBorderUIResource$Color(controlDarkShadow);
    let focusCellHighlightBorder = (t) => new BorderUIResource$LineBorderUIResource()._BorderUIResource$LineBorderUIResource$Color(focusColor);
    let tabbedPaneTabAreaInsets = new InsetsUIResource()._InsetsUIResource(4, 2, 0, 6);
    let tabbedPaneTabInsets = new InsetsUIResource()._InsetsUIResource(0, 9, 1, 9);
    let internalFrameIconSize = 16;
    let defaultCueList = ['OptionPane.errorSound', 'OptionPane.informationSound', 'OptionPane.questionSound', 'OptionPane.warningSound'];
    let theme = MetalLookAndFeel.getCurrentTheme();
    let menuTextValue = new MetalLookAndFeel$FontActiveValue()._MetalLookAndFeel$FontActiveValue(theme, MetalTheme.MENU_TEXT_FONT);
    let controlTextValue = new MetalLookAndFeel$FontActiveValue()._MetalLookAndFeel$FontActiveValue(theme, MetalTheme.CONTROL_TEXT_FONT);
    let userTextValue = new MetalLookAndFeel$FontActiveValue()._MetalLookAndFeel$FontActiveValue(theme, MetalTheme.USER_TEXT_FONT);
    let windowTitleValue = new MetalLookAndFeel$FontActiveValue()._MetalLookAndFeel$FontActiveValue(theme, MetalTheme.WINDOW_TITLE_FONT);
    let subTextValue = new MetalLookAndFeel$FontActiveValue()._MetalLookAndFeel$FontActiveValue(theme, MetalTheme.SUB_TEXT_FONT);
    let systemTextValue = new MetalLookAndFeel$FontActiveValue()._MetalLookAndFeel$FontActiveValue(theme, MetalTheme.SYSTEM_TEXT_FONT);
    let defaults = ['AuditoryCues.defaultCueList', defaultCueList, 'AuditoryCues.playList', null, 'TextField.border', textFieldBorder, 'TextField.font', userTextValue, 'PasswordField.border', textFieldBorder, 'PasswordField.font', userTextValue, 'PasswordField.echoChar', (8226) & 0xffff, 'TextArea.font', userTextValue, 'TextPane.background', table.get('window'), 'TextPane.font', userTextValue, 'EditorPane.background', table.get('window'), 'EditorPane.font', userTextValue, 'TextField.focusInputMap', fieldInputMap, 'PasswordField.focusInputMap', passwordInputMap, 'TextArea.focusInputMap', multilineInputMap, 'TextPane.focusInputMap', multilineInputMap, 'EditorPane.focusInputMap', multilineInputMap, 'FormattedTextField.border', textFieldBorder, 'FormattedTextField.font', userTextValue, 'FormattedTextField.focusInputMap', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['ctrl C', DefaultEditorKit.copyAction, 'ctrl V', DefaultEditorKit.pasteAction, 'ctrl X', DefaultEditorKit.cutAction, 'COPY', DefaultEditorKit.copyAction, 'PASTE', DefaultEditorKit.pasteAction, 'CUT', DefaultEditorKit.cutAction, 'control INSERT', DefaultEditorKit.copyAction, 'shift INSERT', DefaultEditorKit.pasteAction, 'shift DELETE', DefaultEditorKit.cutAction, 'shift LEFT', DefaultEditorKit.selectionBackwardAction, 'shift KP_LEFT', DefaultEditorKit.selectionBackwardAction, 'shift RIGHT', DefaultEditorKit.selectionForwardAction, 'shift KP_RIGHT', DefaultEditorKit.selectionForwardAction, 'ctrl LEFT', DefaultEditorKit.previousWordAction, 'ctrl KP_LEFT', DefaultEditorKit.previousWordAction, 'ctrl RIGHT', DefaultEditorKit.nextWordAction, 'ctrl KP_RIGHT', DefaultEditorKit.nextWordAction, 'ctrl shift LEFT', DefaultEditorKit.selectionPreviousWordAction, 'ctrl shift KP_LEFT', DefaultEditorKit.selectionPreviousWordAction, 'ctrl shift RIGHT', DefaultEditorKit.selectionNextWordAction, 'ctrl shift KP_RIGHT', DefaultEditorKit.selectionNextWordAction, 'ctrl A', DefaultEditorKit.selectAllAction, 'HOME', DefaultEditorKit.beginLineAction, 'END', DefaultEditorKit.endLineAction, 'shift HOME', DefaultEditorKit.selectionBeginLineAction, 'shift END', DefaultEditorKit.selectionEndLineAction, 'BACK_SPACE', DefaultEditorKit.deletePrevCharAction, 'shift BACK_SPACE', DefaultEditorKit.deletePrevCharAction, 'ctrl H', DefaultEditorKit.deletePrevCharAction, 'DELETE', DefaultEditorKit.deleteNextCharAction, 'ctrl DELETE', DefaultEditorKit.deleteNextWordAction, 'ctrl BACK_SPACE', DefaultEditorKit.deletePrevWordAction, 'RIGHT', DefaultEditorKit.forwardAction, 'LEFT', DefaultEditorKit.backwardAction, 'KP_RIGHT', DefaultEditorKit.forwardAction, 'KP_LEFT', DefaultEditorKit.backwardAction, 'ENTER', JTextField.notifyAction, 'ctrl BACK_SLASH', 'unselect', 'control shift O', 'toggle-componentOrientation', 'ESCAPE', 'reset-field-edit', 'UP', 'increment', 'KP_UP', 'increment', 'DOWN', 'decrement', 'KP_DOWN', 'decrement']), 'Button.defaultButtonFollowsFocus', false, 'Button.disabledText', inactiveControlTextColor, 'Button.select', controlShadow, 'Button.border', buttonBorder, 'Button.font', controlTextValue, 'Button.focus', focusColor, 'Button.focusInputMap', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['SPACE', 'pressed', 'released SPACE', 'released']), 'CheckBox.disabledText', inactiveControlTextColor, 'Checkbox.select', controlShadow, 'CheckBox.font', controlTextValue, 'CheckBox.focus', focusColor, 'CheckBox.icon', (t) => MetalIconFactory.getCheckBoxIcon(), 'CheckBox.focusInputMap', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['SPACE', 'pressed', 'released SPACE', 'released']), 'CheckBox.totalInsets', new Insets()._Insets(4, 4, 4, 4), 'RadioButton.disabledText', inactiveControlTextColor, 'RadioButton.select', controlShadow, 'RadioButton.icon', (t) => MetalIconFactory.getRadioButtonIcon(), 'RadioButton.font', controlTextValue, 'RadioButton.focus', focusColor, 'RadioButton.focusInputMap', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['SPACE', 'pressed', 'released SPACE', 'released']), 'RadioButton.totalInsets', new Insets()._Insets(4, 4, 4, 4), 'ToggleButton.select', controlShadow, 'ToggleButton.disabledText', inactiveControlTextColor, 'ToggleButton.focus', focusColor, 'ToggleButton.border', toggleButtonBorder, 'ToggleButton.font', controlTextValue, 'ToggleButton.focusInputMap', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['SPACE', 'pressed', 'released SPACE', 'released']), 'FileView.directoryIcon', (t) => MetalIconFactory.getTreeFolderIcon(), 'FileView.fileIcon', (t) => MetalIconFactory.getTreeLeafIcon(), 'FileView.computerIcon', (t) => MetalIconFactory.getTreeComputerIcon(), 'FileView.hardDriveIcon', (t) => MetalIconFactory.getTreeHardDriveIcon(), 'FileView.floppyDriveIcon', (t) => MetalIconFactory.getTreeFloppyDriveIcon(), 'FileChooser.detailsViewIcon', (t) => MetalIconFactory.getFileChooserDetailViewIcon(), 'FileChooser.homeFolderIcon', (t) => MetalIconFactory.getFileChooserHomeFolderIcon(), 'FileChooser.listViewIcon', (t) => MetalIconFactory.getFileChooserListViewIcon(), 'FileChooser.newFolderIcon', (t) => MetalIconFactory.getFileChooserNewFolderIcon(), 'FileChooser.upFolderIcon', (t) => MetalIconFactory.getFileChooserUpFolderIcon(), 'FileChooser.usesSingleFilePane', true, 'FileChooser.ancestorInputMap', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['ESCAPE', 'cancelSelection', 'F2', 'editFileName', 'F5', 'refresh', 'BACK_SPACE', 'Go Up']), 'ToolTip.font', systemTextValue, 'ToolTip.border', toolTipBorder, 'ToolTip.borderInactive', toolTipBorderInactive, 'ToolTip.backgroundInactive', control, 'ToolTip.foregroundInactive', controlDarkShadow, 'ToolTip.hideAccelerator', false, 'ToolTipManager.enableToolTipMode', 'activeApplication', 'Slider.font', controlTextValue, 'Slider.border', null, 'Slider.foreground', primaryControlShadow, 'Slider.focus', focusColor, 'Slider.focusInsets', zeroInsets, 'Slider.trackWidth', 7, 'Slider.majorTickLength', 6, 'Slider.horizontalThumbIcon', (t) => MetalIconFactory.getHorizontalSliderThumbIcon(), 'Slider.verticalThumbIcon', (t) => MetalIconFactory.getVerticalSliderThumbIcon(), 'Slider.focusInputMap', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['RIGHT', 'positiveUnitIncrement', 'KP_RIGHT', 'positiveUnitIncrement', 'DOWN', 'negativeUnitIncrement', 'KP_DOWN', 'negativeUnitIncrement', 'PAGE_DOWN', 'negativeBlockIncrement', 'ctrl PAGE_DOWN', 'negativeBlockIncrement', 'LEFT', 'negativeUnitIncrement', 'KP_LEFT', 'negativeUnitIncrement', 'UP', 'positiveUnitIncrement', 'KP_UP', 'positiveUnitIncrement', 'PAGE_UP', 'positiveBlockIncrement', 'ctrl PAGE_UP', 'positiveBlockIncrement', 'HOME', 'minScroll', 'END', 'maxScroll']), 'ProgressBar.font', controlTextValue, 'ProgressBar.foreground', primaryControlShadow, 'ProgressBar.selectionBackground', primaryControlDarkShadow, 'ProgressBar.border', progressBarBorder, 'ProgressBar.cellSpacing', zero, 'ProgressBar.cellLength', 1, 'ComboBox.background', control, 'ComboBox.foreground', controlTextColor, 'ComboBox.selectionBackground', primaryControlShadow, 'ComboBox.selectionForeground', controlTextColor, 'ComboBox.font', controlTextValue, 'ComboBox.ancestorInputMap', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['ESCAPE', 'hidePopup', 'PAGE_UP', 'pageUpPassThrough', 'PAGE_DOWN', 'pageDownPassThrough', 'HOME', 'homePassThrough', 'END', 'endPassThrough', 'DOWN', 'selectNext', 'KP_DOWN', 'selectNext', 'alt DOWN', 'togglePopup', 'alt KP_DOWN', 'togglePopup', 'alt UP', 'togglePopup', 'alt KP_UP', 'togglePopup', 'SPACE', 'spacePopup', 'ENTER', 'enterPressed', 'UP', 'selectPrevious', 'KP_UP', 'selectPrevious']), 'InternalFrame.icon', (t) => MetalIconFactory.getInternalFrameDefaultMenuIcon(), 'InternalFrame.border', (t) => new MetalBorders$InternalFrameBorder()._MetalBorders$InternalFrameBorder(), 'InternalFrame.optionDialogBorder', (t) => new MetalBorders$OptionDialogBorder()._MetalBorders$OptionDialogBorder(), 'InternalFrame.paletteBorder', (t) => new MetalBorders$PaletteBorder()._MetalBorders$PaletteBorder(), 'InternalFrame.paletteTitleHeight', 11, 'InternalFrame.paletteCloseIcon', (t) => new MetalIconFactory$PaletteCloseIcon()._MetalIconFactory$PaletteCloseIcon(), 'InternalFrame.closeIcon', (t) => MetalIconFactory.getInternalFrameCloseIcon(internalFrameIconSize), 'InternalFrame.maximizeIcon', (t) => MetalIconFactory.getInternalFrameMaximizeIcon(internalFrameIconSize), 'InternalFrame.iconifyIcon', (t) => MetalIconFactory.getInternalFrameMinimizeIcon(internalFrameIconSize), 'InternalFrame.minimizeIcon', (t) => MetalIconFactory.getInternalFrameAltMaximizeIcon(internalFrameIconSize), 'InternalFrame.titleFont', windowTitleValue, 'InternalFrame.windowBindings', null, 'InternalFrame.closeSound', 'sounds/FrameClose.wav', 'InternalFrame.maximizeSound', 'sounds/FrameMaximize.wav', 'InternalFrame.minimizeSound', 'sounds/FrameMinimize.wav', 'InternalFrame.restoreDownSound', 'sounds/FrameRestoreDown.wav', 'InternalFrame.restoreUpSound', 'sounds/FrameRestoreUp.wav', 'DesktopIcon.border', desktopIconBorder, 'DesktopIcon.font', controlTextValue, 'DesktopIcon.foreground', controlTextColor, 'DesktopIcon.background', control, 'DesktopIcon.width', 160, 'Desktop.ancestorInputMap', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['ctrl F5', 'restore', 'ctrl F4', 'close', 'ctrl F7', 'move', 'ctrl F8', 'resize', 'RIGHT', 'right', 'KP_RIGHT', 'right', 'shift RIGHT', 'shrinkRight', 'shift KP_RIGHT', 'shrinkRight', 'LEFT', 'left', 'KP_LEFT', 'left', 'shift LEFT', 'shrinkLeft', 'shift KP_LEFT', 'shrinkLeft', 'UP', 'up', 'KP_UP', 'up', 'shift UP', 'shrinkUp', 'shift KP_UP', 'shrinkUp', 'DOWN', 'down', 'KP_DOWN', 'down', 'shift DOWN', 'shrinkDown', 'shift KP_DOWN', 'shrinkDown', 'ESCAPE', 'escape', 'ctrl F9', 'minimize', 'ctrl F10', 'maximize', 'ctrl F6', 'selectNextFrame', 'ctrl TAB', 'selectNextFrame', 'ctrl alt F6', 'selectNextFrame', 'shift ctrl alt F6', 'selectPreviousFrame', 'ctrl F12', 'navigateNext', 'shift ctrl F12', 'navigatePrevious']), 'TitledBorder.font', controlTextValue, 'TitledBorder.titleColor', systemTextColor, 'TitledBorder.border', titledBorderBorder, 'Label.font', controlTextValue, 'Label.foreground', systemTextColor, 'Label.disabledForeground', MetalLookAndFeel.getInactiveSystemTextColor(), 'List.font', controlTextValue, 'List.focusCellHighlightBorder', focusCellHighlightBorder, 'List.focusInputMap', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['ctrl C', 'copy', 'ctrl V', 'paste', 'ctrl X', 'cut', 'COPY', 'copy', 'PASTE', 'paste', 'CUT', 'cut', 'control INSERT', 'copy', 'shift INSERT', 'paste', 'shift DELETE', 'cut', 'UP', 'selectPreviousRow', 'KP_UP', 'selectPreviousRow', 'shift UP', 'selectPreviousRowExtendSelection', 'shift KP_UP', 'selectPreviousRowExtendSelection', 'ctrl shift UP', 'selectPreviousRowExtendSelection', 'ctrl shift KP_UP', 'selectPreviousRowExtendSelection', 'ctrl UP', 'selectPreviousRowChangeLead', 'ctrl KP_UP', 'selectPreviousRowChangeLead', 'DOWN', 'selectNextRow', 'KP_DOWN', 'selectNextRow', 'shift DOWN', 'selectNextRowExtendSelection', 'shift KP_DOWN', 'selectNextRowExtendSelection', 'ctrl shift DOWN', 'selectNextRowExtendSelection', 'ctrl shift KP_DOWN', 'selectNextRowExtendSelection', 'ctrl DOWN', 'selectNextRowChangeLead', 'ctrl KP_DOWN', 'selectNextRowChangeLead', 'LEFT', 'selectPreviousColumn', 'KP_LEFT', 'selectPreviousColumn', 'shift LEFT', 'selectPreviousColumnExtendSelection', 'shift KP_LEFT', 'selectPreviousColumnExtendSelection', 'ctrl shift LEFT', 'selectPreviousColumnExtendSelection', 'ctrl shift KP_LEFT', 'selectPreviousColumnExtendSelection', 'ctrl LEFT', 'selectPreviousColumnChangeLead', 'ctrl KP_LEFT', 'selectPreviousColumnChangeLead', 'RIGHT', 'selectNextColumn', 'KP_RIGHT', 'selectNextColumn', 'shift RIGHT', 'selectNextColumnExtendSelection', 'shift KP_RIGHT', 'selectNextColumnExtendSelection', 'ctrl shift RIGHT', 'selectNextColumnExtendSelection', 'ctrl shift KP_RIGHT', 'selectNextColumnExtendSelection', 'ctrl RIGHT', 'selectNextColumnChangeLead', 'ctrl KP_RIGHT', 'selectNextColumnChangeLead', 'HOME', 'selectFirstRow', 'shift HOME', 'selectFirstRowExtendSelection', 'ctrl shift HOME', 'selectFirstRowExtendSelection', 'ctrl HOME', 'selectFirstRowChangeLead', 'END', 'selectLastRow', 'shift END', 'selectLastRowExtendSelection', 'ctrl shift END', 'selectLastRowExtendSelection', 'ctrl END', 'selectLastRowChangeLead', 'PAGE_UP', 'scrollUp', 'shift PAGE_UP', 'scrollUpExtendSelection', 'ctrl shift PAGE_UP', 'scrollUpExtendSelection', 'ctrl PAGE_UP', 'scrollUpChangeLead', 'PAGE_DOWN', 'scrollDown', 'shift PAGE_DOWN', 'scrollDownExtendSelection', 'ctrl shift PAGE_DOWN', 'scrollDownExtendSelection', 'ctrl PAGE_DOWN', 'scrollDownChangeLead', 'ctrl A', 'selectAll', 'ctrl SLASH', 'selectAll', 'ctrl BACK_SLASH', 'clearSelection', 'SPACE', 'addToSelection', 'ctrl SPACE', 'toggleAndAnchor', 'shift SPACE', 'extendTo', 'ctrl shift SPACE', 'moveSelectionTo']), 'ScrollBar.background', control, 'ScrollBar.highlight', controlHighlight, 'ScrollBar.shadow', controlShadow, 'ScrollBar.darkShadow', controlDarkShadow, 'ScrollBar.thumb', primaryControlShadow, 'ScrollBar.thumbShadow', primaryControlDarkShadow, 'ScrollBar.thumbHighlight', primaryControl, 'ScrollBar.width', 17, 'ScrollBar.allowsAbsolutePositioning', true, 'ScrollBar.ancestorInputMap', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['RIGHT', 'positiveUnitIncrement', 'KP_RIGHT', 'positiveUnitIncrement', 'DOWN', 'positiveUnitIncrement', 'KP_DOWN', 'positiveUnitIncrement', 'PAGE_DOWN', 'positiveBlockIncrement', 'LEFT', 'negativeUnitIncrement', 'KP_LEFT', 'negativeUnitIncrement', 'UP', 'negativeUnitIncrement', 'KP_UP', 'negativeUnitIncrement', 'PAGE_UP', 'negativeBlockIncrement', 'HOME', 'minScroll', 'END', 'maxScroll']), 'ScrollPane.border', scrollPaneBorder, 'ScrollPane.ancestorInputMap', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['RIGHT', 'unitScrollRight', 'KP_RIGHT', 'unitScrollRight', 'DOWN', 'unitScrollDown', 'KP_DOWN', 'unitScrollDown', 'LEFT', 'unitScrollLeft', 'KP_LEFT', 'unitScrollLeft', 'UP', 'unitScrollUp', 'KP_UP', 'unitScrollUp', 'PAGE_UP', 'scrollUp', 'PAGE_DOWN', 'scrollDown', 'ctrl PAGE_UP', 'scrollLeft', 'ctrl PAGE_DOWN', 'scrollRight', 'ctrl HOME', 'scrollHome', 'ctrl END', 'scrollEnd']), 'TabbedPane.font', controlTextValue, 'TabbedPane.tabAreaBackground', control, 'TabbedPane.background', controlShadow, 'TabbedPane.light', control, 'TabbedPane.focus', primaryControlDarkShadow, 'TabbedPane.selected', control, 'TabbedPane.selectHighlight', controlHighlight, 'TabbedPane.tabAreaInsets', tabbedPaneTabAreaInsets, 'TabbedPane.tabInsets', tabbedPaneTabInsets, 'TabbedPane.focusInputMap', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['RIGHT', 'navigateRight', 'KP_RIGHT', 'navigateRight', 'LEFT', 'navigateLeft', 'KP_LEFT', 'navigateLeft', 'UP', 'navigateUp', 'KP_UP', 'navigateUp', 'DOWN', 'navigateDown', 'KP_DOWN', 'navigateDown', 'ctrl DOWN', 'requestFocusForVisibleComponent', 'ctrl KP_DOWN', 'requestFocusForVisibleComponent']), 'TabbedPane.ancestorInputMap', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['ctrl PAGE_DOWN', 'navigatePageDown', 'ctrl PAGE_UP', 'navigatePageUp', 'ctrl UP', 'requestFocus', 'ctrl KP_UP', 'requestFocus']), 'Table.font', userTextValue, 'Table.focusCellHighlightBorder', focusCellHighlightBorder, 'Table.scrollPaneBorder', scrollPaneBorder, 'Table.dropLineColor', focusColor, 'Table.dropLineShortColor', primaryControlDarkShadow, 'Table.gridColor', controlShadow, 'Table.ancestorInputMap', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['ctrl C', 'copy', 'ctrl V', 'paste', 'ctrl X', 'cut', 'COPY', 'copy', 'PASTE', 'paste', 'CUT', 'cut', 'control INSERT', 'copy', 'shift INSERT', 'paste', 'shift DELETE', 'cut', 'RIGHT', 'selectNextColumn', 'KP_RIGHT', 'selectNextColumn', 'shift RIGHT', 'selectNextColumnExtendSelection', 'shift KP_RIGHT', 'selectNextColumnExtendSelection', 'ctrl shift RIGHT', 'selectNextColumnExtendSelection', 'ctrl shift KP_RIGHT', 'selectNextColumnExtendSelection', 'ctrl RIGHT', 'selectNextColumnChangeLead', 'ctrl KP_RIGHT', 'selectNextColumnChangeLead', 'LEFT', 'selectPreviousColumn', 'KP_LEFT', 'selectPreviousColumn', 'shift LEFT', 'selectPreviousColumnExtendSelection', 'shift KP_LEFT', 'selectPreviousColumnExtendSelection', 'ctrl shift LEFT', 'selectPreviousColumnExtendSelection', 'ctrl shift KP_LEFT', 'selectPreviousColumnExtendSelection', 'ctrl LEFT', 'selectPreviousColumnChangeLead', 'ctrl KP_LEFT', 'selectPreviousColumnChangeLead', 'DOWN', 'selectNextRow', 'KP_DOWN', 'selectNextRow', 'shift DOWN', 'selectNextRowExtendSelection', 'shift KP_DOWN', 'selectNextRowExtendSelection', 'ctrl shift DOWN', 'selectNextRowExtendSelection', 'ctrl shift KP_DOWN', 'selectNextRowExtendSelection', 'ctrl DOWN', 'selectNextRowChangeLead', 'ctrl KP_DOWN', 'selectNextRowChangeLead', 'UP', 'selectPreviousRow', 'KP_UP', 'selectPreviousRow', 'shift UP', 'selectPreviousRowExtendSelection', 'shift KP_UP', 'selectPreviousRowExtendSelection', 'ctrl shift UP', 'selectPreviousRowExtendSelection', 'ctrl shift KP_UP', 'selectPreviousRowExtendSelection', 'ctrl UP', 'selectPreviousRowChangeLead', 'ctrl KP_UP', 'selectPreviousRowChangeLead', 'HOME', 'selectFirstColumn', 'shift HOME', 'selectFirstColumnExtendSelection', 'ctrl shift HOME', 'selectFirstRowExtendSelection', 'ctrl HOME', 'selectFirstRow', 'END', 'selectLastColumn', 'shift END', 'selectLastColumnExtendSelection', 'ctrl shift END', 'selectLastRowExtendSelection', 'ctrl END', 'selectLastRow', 'PAGE_UP', 'scrollUpChangeSelection', 'shift PAGE_UP', 'scrollUpExtendSelection', 'ctrl shift PAGE_UP', 'scrollLeftExtendSelection', 'ctrl PAGE_UP', 'scrollLeftChangeSelection', 'PAGE_DOWN', 'scrollDownChangeSelection', 'shift PAGE_DOWN', 'scrollDownExtendSelection', 'ctrl shift PAGE_DOWN', 'scrollRightExtendSelection', 'ctrl PAGE_DOWN', 'scrollRightChangeSelection', 'TAB', 'selectNextColumnCell', 'shift TAB', 'selectPreviousColumnCell', 'ENTER', 'selectNextRowCell', 'shift ENTER', 'selectPreviousRowCell', 'ctrl A', 'selectAll', 'ctrl SLASH', 'selectAll', 'ctrl BACK_SLASH', 'clearSelection', 'ESCAPE', 'cancel', 'F2', 'startEditing', 'SPACE', 'addToSelection', 'ctrl SPACE', 'toggleAndAnchor', 'shift SPACE', 'extendTo', 'ctrl shift SPACE', 'moveSelectionTo', 'F8', 'focusHeader']), 'Table.ascendingSortIcon', SwingUtilities2.makeIcon$Class$Class$String($J.getClass(this), $J.cls(MetalLookAndFeel), 'icons/sortUp.png'), 'Table.descendingSortIcon', SwingUtilities2.makeIcon$Class$Class$String($J.getClass(this), $J.cls(MetalLookAndFeel), 'icons/sortDown.png'), 'TableHeader.font', userTextValue, 'TableHeader.cellBorder', (t) => new MetalBorders$TableHeaderBorder()._MetalBorders$TableHeaderBorder(), 'MenuBar.border', menuBarBorder, 'MenuBar.font', menuTextValue, 'MenuBar.windowBindings', ['F10', 'takeFocus'], 'Menu.border', menuItemBorder, 'Menu.borderPainted', true, 'Menu.menuPopupOffsetX', zero, 'Menu.menuPopupOffsetY', zero, 'Menu.submenuPopupOffsetX', -4, 'Menu.submenuPopupOffsetY', -3, 'Menu.font', menuTextValue, 'Menu.selectionForeground', menuSelectedForeground, 'Menu.selectionBackground', menuSelectedBackground, 'Menu.disabledForeground', menuDisabledForeground, 'Menu.acceleratorFont', subTextValue, 'Menu.acceleratorForeground', acceleratorForeground, 'Menu.acceleratorSelectionForeground', acceleratorSelectedForeground, 'Menu.checkIcon', (t) => MetalIconFactory.getMenuItemCheckIcon(), 'Menu.arrowIcon', (t) => MetalIconFactory.getMenuArrowIcon(), 'MenuItem.border', menuItemBorder, 'MenuItem.borderPainted', true, 'MenuItem.font', menuTextValue, 'MenuItem.selectionForeground', menuSelectedForeground, 'MenuItem.selectionBackground', menuSelectedBackground, 'MenuItem.disabledForeground', menuDisabledForeground, 'MenuItem.acceleratorFont', subTextValue, 'MenuItem.acceleratorForeground', acceleratorForeground, 'MenuItem.acceleratorSelectionForeground', acceleratorSelectedForeground, 'MenuItem.acceleratorDelimiter', menuItemAcceleratorDelimiter, 'MenuItem.checkIcon', (t) => MetalIconFactory.getMenuItemCheckIcon(), 'MenuItem.arrowIcon', (t) => MetalIconFactory.getMenuItemArrowIcon(), 'MenuItem.commandSound', 'sounds/MenuItemCommand.wav', 'OptionPane.windowBindings', ['ESCAPE', 'close'], 'OptionPane.informationSound', 'sounds/OptionPaneInformation.wav', 'OptionPane.warningSound', 'sounds/OptionPaneWarning.wav', 'OptionPane.errorSound', 'sounds/OptionPaneError.wav', 'OptionPane.questionSound', 'sounds/OptionPaneQuestion.wav', 'OptionPane.errorDialog.border.background', new ColorUIResource()._ColorUIResource$int$int$int(153, 51, 51), 'OptionPane.errorDialog.titlePane.foreground', new ColorUIResource()._ColorUIResource$int$int$int(51, 0, 0), 'OptionPane.errorDialog.titlePane.background', new ColorUIResource()._ColorUIResource$int$int$int(255, 153, 153), 'OptionPane.errorDialog.titlePane.shadow', new ColorUIResource()._ColorUIResource$int$int$int(204, 102, 102), 'OptionPane.questionDialog.border.background', new ColorUIResource()._ColorUIResource$int$int$int(51, 102, 51), 'OptionPane.questionDialog.titlePane.foreground', new ColorUIResource()._ColorUIResource$int$int$int(0, 51, 0), 'OptionPane.questionDialog.titlePane.background', new ColorUIResource()._ColorUIResource$int$int$int(153, 204, 153), 'OptionPane.questionDialog.titlePane.shadow', new ColorUIResource()._ColorUIResource$int$int$int(102, 153, 102), 'OptionPane.warningDialog.border.background', new ColorUIResource()._ColorUIResource$int$int$int(153, 102, 51), 'OptionPane.warningDialog.titlePane.foreground', new ColorUIResource()._ColorUIResource$int$int$int(102, 51, 0), 'OptionPane.warningDialog.titlePane.background', new ColorUIResource()._ColorUIResource$int$int$int(255, 204, 153), 'OptionPane.warningDialog.titlePane.shadow', new ColorUIResource()._ColorUIResource$int$int$int(204, 153, 102), 'Separator.background', MetalLookAndFeel.getSeparatorBackground(), 'Separator.foreground', MetalLookAndFeel.getSeparatorForeground(), 'PopupMenu.border', popupMenuBorder, 'PopupMenu.popupSound', 'sounds/PopupMenuPopup.wav', 'PopupMenu.font', menuTextValue, 'CheckBoxMenuItem.border', menuItemBorder, 'CheckBoxMenuItem.borderPainted', true, 'CheckBoxMenuItem.font', menuTextValue, 'CheckBoxMenuItem.selectionForeground', menuSelectedForeground, 'CheckBoxMenuItem.selectionBackground', menuSelectedBackground, 'CheckBoxMenuItem.disabledForeground', menuDisabledForeground, 'CheckBoxMenuItem.acceleratorFont', subTextValue, 'CheckBoxMenuItem.acceleratorForeground', acceleratorForeground, 'CheckBoxMenuItem.acceleratorSelectionForeground', acceleratorSelectedForeground, 'CheckBoxMenuItem.checkIcon', (t) => MetalIconFactory.getCheckBoxMenuItemIcon(), 'CheckBoxMenuItem.arrowIcon', (t) => MetalIconFactory.getMenuItemArrowIcon(), 'CheckBoxMenuItem.commandSound', 'sounds/MenuItemCommand.wav', 'RadioButtonMenuItem.border', menuItemBorder, 'RadioButtonMenuItem.borderPainted', true, 'RadioButtonMenuItem.font', menuTextValue, 'RadioButtonMenuItem.selectionForeground', menuSelectedForeground, 'RadioButtonMenuItem.selectionBackground', menuSelectedBackground, 'RadioButtonMenuItem.disabledForeground', menuDisabledForeground, 'RadioButtonMenuItem.acceleratorFont', subTextValue, 'RadioButtonMenuItem.acceleratorForeground', acceleratorForeground, 'RadioButtonMenuItem.acceleratorSelectionForeground', acceleratorSelectedForeground, 'RadioButtonMenuItem.checkIcon', (t) => MetalIconFactory.getRadioButtonMenuItemIcon(), 'RadioButtonMenuItem.arrowIcon', (t) => MetalIconFactory.getMenuItemArrowIcon(), 'RadioButtonMenuItem.commandSound', 'sounds/MenuItemCommand.wav', 'Spinner.ancestorInputMap', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['UP', 'increment', 'KP_UP', 'increment', 'DOWN', 'decrement', 'KP_DOWN', 'decrement']), 'Spinner.arrowButtonInsets', zeroInsets, 'Spinner.border', textFieldBorder, 'Spinner.arrowButtonBorder', buttonBorder, 'Spinner.font', controlTextValue, 'SplitPane.dividerSize', 10, 'SplitPane.ancestorInputMap', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['UP', 'negativeIncrement', 'DOWN', 'positiveIncrement', 'LEFT', 'negativeIncrement', 'RIGHT', 'positiveIncrement', 'KP_UP', 'negativeIncrement', 'KP_DOWN', 'positiveIncrement', 'KP_LEFT', 'negativeIncrement', 'KP_RIGHT', 'positiveIncrement', 'HOME', 'selectMin', 'END', 'selectMax', 'F8', 'startResize', 'F6', 'toggleFocus', 'ctrl TAB', 'focusOutForward', 'ctrl shift TAB', 'focusOutBackward']), 'SplitPane.centerOneTouchButtons', false, 'SplitPane.dividerFocusColor', primaryControl, 'Tree.font', userTextValue, 'Tree.textBackground', MetalLookAndFeel.getWindowBackground(), 'Tree.selectionBorderColor', focusColor, 'Tree.openIcon', (t) => MetalIconFactory.getTreeFolderIcon(), 'Tree.closedIcon', (t) => MetalIconFactory.getTreeFolderIcon(), 'Tree.leafIcon', (t) => MetalIconFactory.getTreeLeafIcon(), 'Tree.expandedIcon', (t) => MetalIconFactory.getTreeControlIcon(MetalIconFactory.DARK), 'Tree.collapsedIcon', (t) => MetalIconFactory.getTreeControlIcon(MetalIconFactory.LIGHT), 'Tree.line', primaryControl, 'Tree.hash', primaryControl, 'Tree.rowHeight', zero, 'Tree.focusInputMap', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['ADD', 'expand', 'SUBTRACT', 'collapse', 'ctrl C', 'copy', 'ctrl V', 'paste', 'ctrl X', 'cut', 'COPY', 'copy', 'PASTE', 'paste', 'CUT', 'cut', 'control INSERT', 'copy', 'shift INSERT', 'paste', 'shift DELETE', 'cut', 'UP', 'selectPrevious', 'KP_UP', 'selectPrevious', 'shift UP', 'selectPreviousExtendSelection', 'shift KP_UP', 'selectPreviousExtendSelection', 'ctrl shift UP', 'selectPreviousExtendSelection', 'ctrl shift KP_UP', 'selectPreviousExtendSelection', 'ctrl UP', 'selectPreviousChangeLead', 'ctrl KP_UP', 'selectPreviousChangeLead', 'DOWN', 'selectNext', 'KP_DOWN', 'selectNext', 'shift DOWN', 'selectNextExtendSelection', 'shift KP_DOWN', 'selectNextExtendSelection', 'ctrl shift DOWN', 'selectNextExtendSelection', 'ctrl shift KP_DOWN', 'selectNextExtendSelection', 'ctrl DOWN', 'selectNextChangeLead', 'ctrl KP_DOWN', 'selectNextChangeLead', 'RIGHT', 'selectChild', 'KP_RIGHT', 'selectChild', 'LEFT', 'selectParent', 'KP_LEFT', 'selectParent', 'PAGE_UP', 'scrollUpChangeSelection', 'shift PAGE_UP', 'scrollUpExtendSelection', 'ctrl shift PAGE_UP', 'scrollUpExtendSelection', 'ctrl PAGE_UP', 'scrollUpChangeLead', 'PAGE_DOWN', 'scrollDownChangeSelection', 'shift PAGE_DOWN', 'scrollDownExtendSelection', 'ctrl shift PAGE_DOWN', 'scrollDownExtendSelection', 'ctrl PAGE_DOWN', 'scrollDownChangeLead', 'HOME', 'selectFirst', 'shift HOME', 'selectFirstExtendSelection', 'ctrl shift HOME', 'selectFirstExtendSelection', 'ctrl HOME', 'selectFirstChangeLead', 'END', 'selectLast', 'shift END', 'selectLastExtendSelection', 'ctrl shift END', 'selectLastExtendSelection', 'ctrl END', 'selectLastChangeLead', 'F2', 'startEditing', 'ctrl A', 'selectAll', 'ctrl SLASH', 'selectAll', 'ctrl BACK_SLASH', 'clearSelection', 'ctrl LEFT', 'scrollLeft', 'ctrl KP_LEFT', 'scrollLeft', 'ctrl RIGHT', 'scrollRight', 'ctrl KP_RIGHT', 'scrollRight', 'SPACE', 'addToSelection', 'ctrl SPACE', 'toggleAndAnchor', 'shift SPACE', 'extendTo', 'ctrl shift SPACE', 'moveSelectionTo']), 'Tree.ancestorInputMap', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['ESCAPE', 'cancel']), 'ToolBar.border', toolBarBorder, 'ToolBar.background', menuBackground, 'ToolBar.foreground', MetalLookAndFeel.getMenuForeground(), 'ToolBar.font', menuTextValue, 'ToolBar.dockingBackground', menuBackground, 'ToolBar.floatingBackground', menuBackground, 'ToolBar.dockingForeground', primaryControlDarkShadow, 'ToolBar.floatingForeground', primaryControl, 'ToolBar.rolloverBorder', (t) => MetalBorders.getToolBarRolloverBorder(), 'ToolBar.nonrolloverBorder', (t) => MetalBorders.getToolBarNonrolloverBorder(), 'ToolBar.ancestorInputMap', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['UP', 'navigateUp', 'KP_UP', 'navigateUp', 'DOWN', 'navigateDown', 'KP_DOWN', 'navigateDown', 'LEFT', 'navigateLeft', 'KP_LEFT', 'navigateLeft', 'RIGHT', 'navigateRight', 'KP_RIGHT', 'navigateRight']), 'RootPane.frameBorder', (t) => new MetalBorders$FrameBorder()._MetalBorders$FrameBorder(), 'RootPane.plainDialogBorder', dialogBorder, 'RootPane.informationDialogBorder', dialogBorder, 'RootPane.errorDialogBorder', (t) => new MetalBorders$ErrorDialogBorder()._MetalBorders$ErrorDialogBorder(), 'RootPane.colorChooserDialogBorder', questionDialogBorder, 'RootPane.fileChooserDialogBorder', questionDialogBorder, 'RootPane.questionDialogBorder', questionDialogBorder, 'RootPane.warningDialogBorder', (t) => new MetalBorders$WarningDialogBorder()._MetalBorders$WarningDialogBorder(), 'RootPane.defaultButtonWindowKeyBindings', ['ENTER', 'press', 'released ENTER', 'release', 'ctrl ENTER', 'press', 'ctrl released ENTER', 'release']];
    table.putDefaults(defaults);
    if (MetalLookAndFeel.isWindows() && MetalLookAndFeel.useSystemFonts() && theme.isSystemTheme()) {
      let messageFont = new MetalFontDesktopProperty()._MetalFontDesktopProperty$String$int('win.messagebox.font.height', MetalTheme.CONTROL_TEXT_FONT);
      defaults = ['OptionPane.messageFont', messageFont, 'OptionPane.buttonFont', messageFont];
      table.putDefaults(defaults);
    }
    MetalLookAndFeel.flushUnreferenced();
    let lafCond = SwingUtilities2.isLocalDisplay();
    SwingUtilities2.putAATextInfo(lafCond, table);
    new MetalLookAndFeel$AATextListener()._MetalLookAndFeel$AATextListener(this);
  }
  /**
   * Ensures the current {@code MetalTheme} is {@code non-null}. This is
   * a cover method for {@code getCurrentTheme}.
   *
   * @see #getCurrentTheme
   */
  createDefaultTheme(): void {
    MetalLookAndFeel.getCurrentTheme();
  }
  /**
   * Returns the look and feel defaults. This invokes, in order,
   * {@code createDefaultTheme()}, {@code super.getDefaults()} and
   * {@code getCurrentTheme().addCustomEntriesToTable(table)}.
   * <p>
   * While this method is public, it should only be invoked by the
   * {@code UIManager} when the look and feel is set as the current
   * look and feel and after {@code initialize} has been invoked.
   *
   * @return the look and feel defaults
   *
   * @see #createDefaultTheme
   * @see javax.swing.plaf.basic.BasicLookAndFeel#getDefaults()
   * @see MetalTheme#addCustomEntriesToTable(UIDefaults)
   */
  getDefaults(): UIDefaults {
    MetalLookAndFeel.METAL_LOOK_AND_FEEL_INITED = true;
    this.createDefaultTheme();
    let table = super.getDefaults();
    let currentTheme = MetalLookAndFeel.getCurrentTheme();
    currentTheme.addCustomEntriesToTable(table);
    currentTheme.install();
    return table;
  }
  /**
   * {@inheritDoc}
   *
   * @since 1.4
   */
  provideErrorFeedback(component: Component): void {
    super.provideErrorFeedback(component);
  }
  /**
   * Set the theme used by <code>MetalLookAndFeel</code>.
   * <p>
   * After the theme is set, {@code MetalLookAndFeel} needs to be
   * re-installed and the uis need to be recreated. The following
   * shows how to do this:
   * <pre>
   *   MetalLookAndFeel.setCurrentTheme(theme);
   *
   *   // re-install the Metal Look and Feel
   *   UIManager.setLookAndFeel(new MetalLookAndFeel());
   *
   *   // Update the ComponentUIs for all Components. This
   *   // needs to be invoked for all windows.
   *   SwingUtilities.updateComponentTreeUI(rootComponent);
   * </pre>
   * If this is not done the results are undefined.
   *
   * @param theme the theme to use
   * @throws NullPointerException if {@code theme} is {@code null}
   * @see #getCurrentTheme
   */
  static setCurrentTheme(theme: MetalTheme): void {
    if (theme == null) {
      throw new NullPointerException('Can\'t have null theme');
    }
    AppContext.getAppContext().put('currentMetalTheme', theme);
  }
  /**
   * Return the theme currently being used by <code>MetalLookAndFeel</code>.
   * If the current theme is {@code null}, the default theme is created.
   *
   * @return the current theme
   * @see #setCurrentTheme
   * @since 1.5
   */
  static getCurrentTheme(): MetalTheme {
    let currentTheme: MetalTheme;
    let context = AppContext.getAppContext();
    currentTheme = context.get('currentMetalTheme');
    if (currentTheme == null) {
      if (MetalLookAndFeel.useHighContrastTheme()) {
        currentTheme = new MetalHighContrastTheme()._MetalHighContrastTheme();
      } else {
        let theme = AccessController.doPrivileged(new GetPropertyAction('swing.metalTheme'));
        if ($J.equals('steel', theme)) {
          currentTheme = new DefaultMetalTheme()._DefaultMetalTheme();
        } else {
          currentTheme = new OceanTheme()._OceanTheme();
        }
      }
      MetalLookAndFeel.setCurrentTheme(currentTheme);
    }
    return currentTheme;
  }
  /**
   * Returns an <code>Icon</code> with a disabled appearance.
   * This method is used to generate a disabled <code>Icon</code> when
   * one has not been specified.  For example, if you create a
   * <code>JButton</code> and only specify an <code>Icon</code> via
   * <code>setIcon</code> this method will be called to generate the
   * disabled <code>Icon</code>. If null is passed as <code>icon</code>
   * this method returns null.
   * <p>
   * Some look and feels might not render the disabled Icon, in which
   * case they will ignore this.
   *
   * @param component JComponent that will display the Icon, may be null
   * @param icon Icon to generate disable icon from.
   * @return Disabled icon, or null if a suitable Icon can not be
   *         generated.
   * @since 1.5
   */
  getDisabledIcon(component: JComponent, icon: Icon): Icon {
    if ((icon instanceof ImageIcon) && MetalLookAndFeel.usingOcean()) {
      return MetalUtils.getOceanDisabledButtonIcon((icon).getImage());
    }
    return super.getDisabledIcon(component, icon);
  }
  /**
   * Returns an <code>Icon</code> for use by disabled
   * components that are also selected. This method is used to generate an
   * <code>Icon</code> for components that are in both the disabled and
   * selected states but do not have a specific <code>Icon</code> for this
   * state.  For example, if you create a <code>JButton</code> and only
   * specify an <code>Icon</code> via <code>setIcon</code> this method
   * will be called to generate the disabled and selected
   * <code>Icon</code>. If null is passed as <code>icon</code> this method
   * returns null.
   * <p>
   * Some look and feels might not render the disabled and selected Icon,
   * in which case they will ignore this.
   *
   * @param component JComponent that will display the Icon, may be null
   * @param icon Icon to generate disabled and selected icon from.
   * @return Disabled and Selected icon, or null if a suitable Icon can not
   *         be generated.
   * @since 1.5
   */
  getDisabledSelectedIcon(component: JComponent, icon: Icon): Icon {
    if ((icon instanceof ImageIcon) && MetalLookAndFeel.usingOcean()) {
      return MetalUtils.getOceanDisabledButtonIcon((icon).getImage());
    }
    return super.getDisabledSelectedIcon(component, icon);
  }
  /**
   * Returns the control text font of the current theme. This is a
   * cover method for {@code getCurrentTheme().getControlTextColor()}.
   *
   * @return the control text font
   *
   * @see MetalTheme
   */
  static getControlTextFont(): FontUIResource {
    return MetalLookAndFeel.getCurrentTheme().getControlTextFont();
  }
  /**
   * Returns the system text font of the current theme. This is a
   * cover method for {@code getCurrentTheme().getSystemTextFont()}.
   *
   * @return the system text font
   *
   * @see MetalTheme
   */
  static getSystemTextFont(): FontUIResource {
    return MetalLookAndFeel.getCurrentTheme().getSystemTextFont();
  }
  /**
   * Returns the user text font of the current theme. This is a
   * cover method for {@code getCurrentTheme().getUserTextFont()}.
   *
   * @return the user text font
   *
   * @see MetalTheme
   */
  static getUserTextFont(): FontUIResource {
    return MetalLookAndFeel.getCurrentTheme().getUserTextFont();
  }
  /**
   * Returns the menu text font of the current theme. This is a
   * cover method for {@code getCurrentTheme().getMenuTextFont()}.
   *
   * @return the menu text font
   *
   * @see MetalTheme
   */
  static getMenuTextFont(): FontUIResource {
    return MetalLookAndFeel.getCurrentTheme().getMenuTextFont();
  }
  /**
   * Returns the window title font of the current theme. This is a
   * cover method for {@code getCurrentTheme().getWindowTitleFont()}.
   *
   * @return the window title font
   *
   * @see MetalTheme
   */
  static getWindowTitleFont(): FontUIResource {
    return MetalLookAndFeel.getCurrentTheme().getWindowTitleFont();
  }
  /**
   * Returns the sub-text font of the current theme. This is a
   * cover method for {@code getCurrentTheme().getSubTextFont()}.
   *
   * @return the sub-text font
   *
   * @see MetalTheme
   */
  static getSubTextFont(): FontUIResource {
    return MetalLookAndFeel.getCurrentTheme().getSubTextFont();
  }
  /**
   * Returns the desktop color of the current theme. This is a
   * cover method for {@code getCurrentTheme().getDesktopColor()}.
   *
   * @return the desktop color
   *
   * @see MetalTheme
   */
  static getDesktopColor(): ColorUIResource {
    return MetalLookAndFeel.getCurrentTheme().getDesktopColor();
  }
  /**
   * Returns the focus color of the current theme. This is a
   * cover method for {@code getCurrentTheme().getFocusColor()}.
   *
   * @return the focus color
   *
   * @see MetalTheme
   */
  static getFocusColor(): ColorUIResource {
    return MetalLookAndFeel.getCurrentTheme().getFocusColor();
  }
  /**
   * Returns the white color of the current theme. This is a
   * cover method for {@code getCurrentTheme().getWhite()}.
   *
   * @return the white color
   *
   * @see MetalTheme
   */
  static getWhite(): ColorUIResource {
    return MetalLookAndFeel.getCurrentTheme().getWhite();
  }
  /**
   * Returns the black color of the current theme. This is a
   * cover method for {@code getCurrentTheme().getBlack()}.
   *
   * @return the black color
   *
   * @see MetalTheme
   */
  static getBlack(): ColorUIResource {
    return MetalLookAndFeel.getCurrentTheme().getBlack();
  }
  /**
   * Returns the control color of the current theme. This is a
   * cover method for {@code getCurrentTheme().getControl()}.
   *
   * @return the control color
   *
   * @see MetalTheme
   */
  static getControl(): ColorUIResource {
    return MetalLookAndFeel.getCurrentTheme().getControl();
  }
  /**
   * Returns the control shadow color of the current theme. This is a
   * cover method for {@code getCurrentTheme().getControlShadow()}.
   *
   * @return the control shadow color
   *
   * @see MetalTheme
   */
  static getControlShadow(): ColorUIResource {
    return MetalLookAndFeel.getCurrentTheme().getControlShadow();
  }
  /**
   * Returns the control dark shadow color of the current theme. This is a
   * cover method for {@code getCurrentTheme().getControlDarkShadow()}.
   *
   * @return the control dark shadow color
   *
   * @see MetalTheme
   */
  static getControlDarkShadow(): ColorUIResource {
    return MetalLookAndFeel.getCurrentTheme().getControlDarkShadow();
  }
  /**
   * Returns the control info color of the current theme. This is a
   * cover method for {@code getCurrentTheme().getControlInfo()}.
   *
   * @return the control info color
   *
   * @see MetalTheme
   */
  static getControlInfo(): ColorUIResource {
    return MetalLookAndFeel.getCurrentTheme().getControlInfo();
  }
  /**
   * Returns the control highlight color of the current theme. This is a
   * cover method for {@code getCurrentTheme().getControlHighlight()}.
   *
   * @return the control highlight color
   *
   * @see MetalTheme
   */
  static getControlHighlight(): ColorUIResource {
    return MetalLookAndFeel.getCurrentTheme().getControlHighlight();
  }
  /**
   * Returns the control disabled color of the current theme. This is a
   * cover method for {@code getCurrentTheme().getControlDisabled()}.
   *
   * @return the control disabled color
   *
   * @see MetalTheme
   */
  static getControlDisabled(): ColorUIResource {
    return MetalLookAndFeel.getCurrentTheme().getControlDisabled();
  }
  /**
   * Returns the primary control color of the current theme. This is a
   * cover method for {@code getCurrentTheme().getPrimaryControl()}.
   *
   * @return the primary control color
   *
   * @see MetalTheme
   */
  static getPrimaryControl(): ColorUIResource {
    return MetalLookAndFeel.getCurrentTheme().getPrimaryControl();
  }
  /**
   * Returns the primary control shadow color of the current theme. This is a
   * cover method for {@code getCurrentTheme().getPrimaryControlShadow()}.
   *
   * @return the primary control shadow color
   *
   * @see MetalTheme
   */
  static getPrimaryControlShadow(): ColorUIResource {
    return MetalLookAndFeel.getCurrentTheme().getPrimaryControlShadow();
  }
  /**
   * Returns the primary control dark shadow color of the current
   * theme. This is a cover method for {@code
   * getCurrentTheme().getPrimaryControlDarkShadow()}.
   *
   * @return the primary control dark shadow color
   *
   * @see MetalTheme
   */
  static getPrimaryControlDarkShadow(): ColorUIResource {
    return MetalLookAndFeel.getCurrentTheme().getPrimaryControlDarkShadow();
  }
  /**
   * Returns the primary control info color of the current theme. This is a
   * cover method for {@code getCurrentTheme().getPrimaryControlInfo()}.
   *
   * @return the primary control info color
   *
   * @see MetalTheme
   */
  static getPrimaryControlInfo(): ColorUIResource {
    return MetalLookAndFeel.getCurrentTheme().getPrimaryControlInfo();
  }
  /**
   * Returns the primary control highlight color of the current
   * theme. This is a cover method for {@code
   * getCurrentTheme().getPrimaryControlHighlight()}.
   *
   * @return the primary control highlight color
   *
   * @see MetalTheme
   */
  static getPrimaryControlHighlight(): ColorUIResource {
    return MetalLookAndFeel.getCurrentTheme().getPrimaryControlHighlight();
  }
  /**
   * Returns the system text color of the current theme. This is a
   * cover method for {@code getCurrentTheme().getSystemTextColor()}.
   *
   * @return the system text color
   *
   * @see MetalTheme
   */
  static getSystemTextColor(): ColorUIResource {
    return MetalLookAndFeel.getCurrentTheme().getSystemTextColor();
  }
  /**
   * Returns the control text color of the current theme. This is a
   * cover method for {@code getCurrentTheme().getControlTextColor()}.
   *
   * @return the control text color
   *
   * @see MetalTheme
   */
  static getControlTextColor(): ColorUIResource {
    return MetalLookAndFeel.getCurrentTheme().getControlTextColor();
  }
  /**
   * Returns the inactive control text color of the current theme. This is a
   * cover method for {@code
   * getCurrentTheme().getInactiveControlTextColor()}.
   *
   * @return the inactive control text color
   *
   * @see MetalTheme
   */
  static getInactiveControlTextColor(): ColorUIResource {
    return MetalLookAndFeel.getCurrentTheme().getInactiveControlTextColor();
  }
  /**
   * Returns the inactive system text color of the current theme. This is a
   * cover method for {@code
   * getCurrentTheme().getInactiveSystemTextColor()}.
   *
   * @return the inactive system text color
   *
   * @see MetalTheme
   */
  static getInactiveSystemTextColor(): ColorUIResource {
    return MetalLookAndFeel.getCurrentTheme().getInactiveSystemTextColor();
  }
  /**
   * Returns the user text color of the current theme. This is a
   * cover method for {@code getCurrentTheme().getUserTextColor()}.
   *
   * @return the user text color
   *
   * @see MetalTheme
   */
  static getUserTextColor(): ColorUIResource {
    return MetalLookAndFeel.getCurrentTheme().getUserTextColor();
  }
  /**
   * Returns the text highlight color of the current theme. This is a
   * cover method for {@code getCurrentTheme().getTextHighlightColor()}.
   *
   * @return the text highlight color
   *
   * @see MetalTheme
   */
  static getTextHighlightColor(): ColorUIResource {
    return MetalLookAndFeel.getCurrentTheme().getTextHighlightColor();
  }
  /**
   * Returns the highlighted text color of the current theme. This is a
   * cover method for {@code getCurrentTheme().getHighlightedTextColor()}.
   *
   * @return the highlighted text color
   *
   * @see MetalTheme
   */
  static getHighlightedTextColor(): ColorUIResource {
    return MetalLookAndFeel.getCurrentTheme().getHighlightedTextColor();
  }
  /**
   * Returns the window background color of the current theme. This is a
   * cover method for {@code getCurrentTheme().getWindowBackground()}.
   *
   * @return the window background color
   *
   * @see MetalTheme
   */
  static getWindowBackground(): ColorUIResource {
    return MetalLookAndFeel.getCurrentTheme().getWindowBackground();
  }
  /**
   * Returns the window title background color of the current
   * theme. This is a cover method for {@code
   * getCurrentTheme().getWindowTitleBackground()}.
   *
   * @return the window title background color
   *
   * @see MetalTheme
   */
  static getWindowTitleBackground(): ColorUIResource {
    return MetalLookAndFeel.getCurrentTheme().getWindowTitleBackground();
  }
  /**
   * Returns the window title foreground color of the current
   * theme. This is a cover method for {@code
   * getCurrentTheme().getWindowTitleForeground()}.
   *
   * @return the window title foreground color
   *
   * @see MetalTheme
   */
  static getWindowTitleForeground(): ColorUIResource {
    return MetalLookAndFeel.getCurrentTheme().getWindowTitleForeground();
  }
  /**
   * Returns the window title inactive background color of the current
   * theme. This is a cover method for {@code
   * getCurrentTheme().getWindowTitleInactiveBackground()}.
   *
   * @return the window title inactive background color
   *
   * @see MetalTheme
   */
  static getWindowTitleInactiveBackground(): ColorUIResource {
    return MetalLookAndFeel.getCurrentTheme().getWindowTitleInactiveBackground();
  }
  /**
   * Returns the window title inactive foreground color of the current
   * theme. This is a cover method for {@code
   * getCurrentTheme().getWindowTitleInactiveForeground()}.
   *
   * @return the window title inactive foreground color
   *
   * @see MetalTheme
   */
  static getWindowTitleInactiveForeground(): ColorUIResource {
    return MetalLookAndFeel.getCurrentTheme().getWindowTitleInactiveForeground();
  }
  /**
   * Returns the menu background color of the current theme. This is
   * a cover method for {@code getCurrentTheme().getMenuBackground()}.
   *
   * @return the menu background color
   *
   * @see MetalTheme
   */
  static getMenuBackground(): ColorUIResource {
    return MetalLookAndFeel.getCurrentTheme().getMenuBackground();
  }
  /**
   * Returns the menu foreground color of the current theme. This is
   * a cover method for {@code getCurrentTheme().getMenuForeground()}.
   *
   * @return the menu foreground color
   *
   * @see MetalTheme
   */
  static getMenuForeground(): ColorUIResource {
    return MetalLookAndFeel.getCurrentTheme().getMenuForeground();
  }
  /**
   * Returns the menu selected background color of the current theme. This is
   * a cover method for
   * {@code getCurrentTheme().getMenuSelectedBackground()}.
   *
   * @return the menu selected background color
   *
   * @see MetalTheme
   */
  static getMenuSelectedBackground(): ColorUIResource {
    return MetalLookAndFeel.getCurrentTheme().getMenuSelectedBackground();
  }
  /**
   * Returns the menu selected foreground color of the current theme. This is
   * a cover method for
   * {@code getCurrentTheme().getMenuSelectedForeground()}.
   *
   * @return the menu selected foreground color
   *
   * @see MetalTheme
   */
  static getMenuSelectedForeground(): ColorUIResource {
    return MetalLookAndFeel.getCurrentTheme().getMenuSelectedForeground();
  }
  /**
   * Returns the menu disabled foreground color of the current theme. This is
   * a cover method for
   * {@code getCurrentTheme().getMenuDisabledForeground()}.
   *
   * @return the menu disabled foreground color
   *
   * @see MetalTheme
   */
  static getMenuDisabledForeground(): ColorUIResource {
    return MetalLookAndFeel.getCurrentTheme().getMenuDisabledForeground();
  }
  /**
   * Returns the separator background color of the current theme. This is
   * a cover method for {@code getCurrentTheme().getSeparatorBackground()}.
   *
   * @return the separator background color
   *
   * @see MetalTheme
   */
  static getSeparatorBackground(): ColorUIResource {
    return MetalLookAndFeel.getCurrentTheme().getSeparatorBackground();
  }
  /**
   * Returns the separator foreground color of the current theme. This is
   * a cover method for {@code getCurrentTheme().getSeparatorForeground()}.
   *
   * @return the separator foreground color
   *
   * @see MetalTheme
   */
  static getSeparatorForeground(): ColorUIResource {
    return MetalLookAndFeel.getCurrentTheme().getSeparatorForeground();
  }
  /**
   * Returns the accelerator foreground color of the current theme. This is
   * a cover method for {@code getCurrentTheme().getAcceleratorForeground()}.
   *
   * @return the separator accelerator foreground color
   *
   * @see MetalTheme
   */
  static getAcceleratorForeground(): ColorUIResource {
    return MetalLookAndFeel.getCurrentTheme().getAcceleratorForeground();
  }
  /**
   * Returns the accelerator selected foreground color of the
   * current theme. This is a cover method for {@code
   * getCurrentTheme().getAcceleratorSelectedForeground()}.
   *
   * @return the accelerator selected foreground color
   *
   * @see MetalTheme
   */
  static getAcceleratorSelectedForeground(): ColorUIResource {
    return MetalLookAndFeel.getCurrentTheme().getAcceleratorSelectedForeground();
  }
  static flushUnreferenced(): void {
    let aatl: MetalLookAndFeel$AATextListener;
    while ((aatl = MetalLookAndFeel.queue.poll()) != null) {
      aatl.dispose();
    }
  }
  static $clinit() {
    MetalLookAndFeel.METAL_LOOK_AND_FEEL_INITED = false;
    MetalLookAndFeel.queue = new ReferenceQueue();
  }
}

/**
 * FontActiveValue redirects to the appropriate metal theme method.
 */
export class MetalLookAndFeel$FontActiveValue extends JObject {
  type: number = 0;
  theme: MetalTheme = null;
  _MetalLookAndFeel$FontActiveValue(theme: MetalTheme, type$: number): this {
    this.theme = theme;
    this.type = type$;
    return this;
  }
  createValue(table: UIDefaults): any {
    let value = null;
    switch (this.type) {
      case MetalTheme.CONTROL_TEXT_FONT:
        value = this.theme.getControlTextFont();
        break;
      case MetalTheme.SYSTEM_TEXT_FONT:
        value = this.theme.getSystemTextFont();
        break;
      case MetalTheme.USER_TEXT_FONT:
        value = this.theme.getUserTextFont();
        break;
      case MetalTheme.MENU_TEXT_FONT:
        value = this.theme.getMenuTextFont();
        break;
      case MetalTheme.WINDOW_TITLE_FONT:
        value = this.theme.getWindowTitleFont();
        break;
      case MetalTheme.SUB_TEXT_FONT:
        value = this.theme.getSubTextFont();
        break;
    }
    return value;
  }
}

export class MetalLookAndFeel$AATextListener extends WeakReference {
  key: string = null;
  /**
   * Indicates if an updateUI call is pending.
   */
  static updatePending: boolean = false;
  _MetalLookAndFeel$AATextListener(laf: LookAndFeel): this {
    this._WeakReference(laf, MetalLookAndFeel.queue);
    this.key = 'awt.font.desktophints';
    let tk = Toolkit.getDefaultToolkit();
    tk.addPropertyChangeListener(this.key, $J.fn(this, 'propertyChange'));
    return this;
  }
  propertyChange(pce: PropertyChangeEvent): void {
    let laf = this.get();
    if (laf == null || laf !== UIManager.getLookAndFeel()) {
      this.dispose();
      return;
    }
    let defaults = UIManager.getLookAndFeelDefaults();
    let lafCond = SwingUtilities2.isLocalDisplay();
    SwingUtilities2.putAATextInfo(lafCond, defaults);
    this.updateUI();
  }
  dispose(): void {
    let tk = Toolkit.getDefaultToolkit();
    tk.removePropertyChangeListener(this.key, $J.fn(this, 'propertyChange'));
  }
  /**
   * Updates the UI of the passed in window and all its children.
   */
  static updateWindowUI(window: Window): void {
    SwingUtilities.updateComponentTreeUI(window);
    let ownedWins = window.getOwnedWindows();
    for (let w of ownedWins) {
      MetalLookAndFeel$AATextListener.updateWindowUI(w);
    }
  }
  /**
   * Updates the UIs of all the known Frames.
   */
  static updateAllUIs(): void {
    let appFrames = Frame.getFrames();
    for (let frame of appFrames) {
      MetalLookAndFeel$AATextListener.updateWindowUI(frame);
    }
  }
  /**
   * Sets whether or not an updateUI call is pending.
   */
  static setUpdatePending(update: boolean): void {
    MetalLookAndFeel$AATextListener.updatePending = update;
  }
  /**
   * Returns true if a UI update is pending.
   */
  static isUpdatePending(): boolean {
    return MetalLookAndFeel$AATextListener.updatePending;
  }
  updateUI(): void {
    if (!MetalLookAndFeel$AATextListener.isUpdatePending()) {
      MetalLookAndFeel$AATextListener.setUpdatePending(true);
      let uiUpdater = () => {
        MetalLookAndFeel$AATextListener.updateAllUIs();
        MetalLookAndFeel$AATextListener.setUpdatePending(false);
      };
      SwingUtilities.invokeLater(uiUpdater);
    }
  }
}

$J.define(MetalLookAndFeel, 'javax.swing.plaf.metal.MetalLookAndFeel', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicLookAndFeel', ctors: { '': '_MetalLookAndFeel' }, meths: { 'initResourceBundle(javax.swing.UIDefaults)': 'initResourceBundle$UIDefaults$MetalLookAndFeel' }, clinit: true, lazy: ['METAL_LOOK_AND_FEEL_INITED', 'checkedWindows', 'isWindows_', 'checkedSystemFontSettings', 'useSystemFonts_', 'queue'] });
$J.define(MetalLookAndFeel$FontActiveValue, 'javax.swing.plaf.metal.MetalLookAndFeel$FontActiveValue', { kind: 'class', ifaces: ['javax.swing.UIDefaults$ActiveValue'], sup: 'java.lang.Object', ctors: { 'javax.swing.plaf.metal.MetalTheme,int': '_MetalLookAndFeel$FontActiveValue' } });
$J.define(MetalLookAndFeel$AATextListener, 'javax.swing.plaf.metal.MetalLookAndFeel$AATextListener', { kind: 'class', ifaces: ['java.beans.PropertyChangeListener'], sup: 'java.lang.ref.WeakReference', ctors: { 'javax.swing.LookAndFeel': '_MetalLookAndFeel$AATextListener' } });
$J.module(() => {
  Frame = $J.load('java.awt.Frame');
  Insets = $J.load('java.awt.Insets');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JTextField = $J.load('javax.swing.JTextField');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIDefaults$LazyInputMap = $J.load('javax.swing.UIDefaults$LazyInputMap');
  UIManager = $J.load('javax.swing.UIManager');
  BorderUIResource$LineBorderUIResource = $J.load('javax.swing.plaf.BorderUIResource$LineBorderUIResource');
  ColorUIResource = $J.load('javax.swing.plaf.ColorUIResource');
  InsetsUIResource = $J.load('javax.swing.plaf.InsetsUIResource');
  DefaultMetalTheme = $J.load('javax.swing.plaf.metal.DefaultMetalTheme');
  MetalBorders = $J.load('javax.swing.plaf.metal.MetalBorders');
  MetalBorders$DialogBorder = $J.load('javax.swing.plaf.metal.MetalBorders$DialogBorder');
  MetalBorders$ErrorDialogBorder = $J.load('javax.swing.plaf.metal.MetalBorders$ErrorDialogBorder');
  MetalBorders$FrameBorder = $J.load('javax.swing.plaf.metal.MetalBorders$FrameBorder');
  MetalBorders$InternalFrameBorder = $J.load('javax.swing.plaf.metal.MetalBorders$InternalFrameBorder');
  MetalBorders$MenuBarBorder = $J.load('javax.swing.plaf.metal.MetalBorders$MenuBarBorder');
  MetalBorders$MenuItemBorder = $J.load('javax.swing.plaf.metal.MetalBorders$MenuItemBorder');
  MetalBorders$OptionDialogBorder = $J.load('javax.swing.plaf.metal.MetalBorders$OptionDialogBorder');
  MetalBorders$PaletteBorder = $J.load('javax.swing.plaf.metal.MetalBorders$PaletteBorder');
  MetalBorders$PopupMenuBorder = $J.load('javax.swing.plaf.metal.MetalBorders$PopupMenuBorder');
  MetalBorders$QuestionDialogBorder = $J.load('javax.swing.plaf.metal.MetalBorders$QuestionDialogBorder');
  MetalBorders$ScrollPaneBorder = $J.load('javax.swing.plaf.metal.MetalBorders$ScrollPaneBorder');
  MetalBorders$TableHeaderBorder = $J.load('javax.swing.plaf.metal.MetalBorders$TableHeaderBorder');
  MetalBorders$ToolBarBorder = $J.load('javax.swing.plaf.metal.MetalBorders$ToolBarBorder');
  MetalBorders$WarningDialogBorder = $J.load('javax.swing.plaf.metal.MetalBorders$WarningDialogBorder');
  MetalFontDesktopProperty = $J.load('javax.swing.plaf.metal.MetalFontDesktopProperty');
  MetalHighContrastTheme = $J.load('javax.swing.plaf.metal.MetalHighContrastTheme');
  MetalIconFactory = $J.load('javax.swing.plaf.metal.MetalIconFactory');
  MetalIconFactory$PaletteCloseIcon = $J.load('javax.swing.plaf.metal.MetalIconFactory$PaletteCloseIcon');
  MetalTheme = $J.load('javax.swing.plaf.metal.MetalTheme');
  MetalUtils = $J.load('javax.swing.plaf.metal.MetalUtils');
  OceanTheme = $J.load('javax.swing.plaf.metal.OceanTheme');
  DefaultEditorKit = $J.load('javax.swing.text.DefaultEditorKit');
  OSInfo = $J.load('sun.awt.OSInfo');
  OSInfo$OSType = $J.load('sun.awt.OSInfo$OSType');
  SwingAccessor = $J.load('sun.swing.SwingAccessor');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
