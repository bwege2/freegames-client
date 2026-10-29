// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicLookAndFeel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2023, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AccessController, AppContext, AudioSystem, BufferedInputStream, ByteArrayInputStream, Clip, DataLine_Info, Exception, HashSet, IOException, JObject, LineEvent_Type, Locale, SunToolkit, Toolkit } from '../../../../../jre/index.ts';
import { LookAndFeel } from '../../LookAndFeel.ts';
import { AbstractAction } from '../../AbstractAction.ts';

let AWTEvent, Color, Component, Dimension, Font, Window, ActionEvent, MouseEvent, PropertyVetoException, Action, DefaultListCellRenderer$UIResource, JComponent, JInternalFrame, JTextField, MenuSelectionManager, SwingConstants, SwingUtilities, UIDefaults, UIDefaults$LazyInputMap, UIManager, BevelBorder, ActionMapUIResource, BorderUIResource, BorderUIResource$BevelBorderUIResource, BorderUIResource$EmptyBorderUIResource, BorderUIResource$LineBorderUIResource, ColorUIResource, DimensionUIResource, FontUIResource, InsetsUIResource, BasicBorders, BasicBorders$MarginBorder, BasicIconFactory, BasicPopupMenuUI, BasicSplitPaneDivider, DefaultEditorKit, SwingAccessor, SwingUtilities2, SortArrowIcon;

/**
 * A base class to use in creating a look and feel for Swing.
 * <p>
 * Each of the {@code ComponentUI}s provided by {@code
 * BasicLookAndFeel} derives its behavior from the defaults
 * table. Unless otherwise noted each of the {@code ComponentUI}
 * implementations in this package document the set of defaults they
 * use. Unless otherwise noted the defaults are installed at the time
 * {@code installUI} is invoked, and follow the recommendations
 * outlined in {@code LookAndFeel} for installing defaults.
 * <p>
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the <code>java.beans</code> package.
 * Please see {@link java.beans.XMLEncoder}.
 */
export class BasicLookAndFeel extends LookAndFeel {
  /**
   * Whether or not the developer has created a JPopupMenu.
   */
  static needsEventHelper: boolean = false;
  /**
   * Lock used when manipulating clipPlaying.
   */
  audioLock: any = null;
  /**
   * The Clip that is currently playing (set in AudioAction).
   */
  clipPlaying: Clip = null;
  invocator: BasicLookAndFeel$AWTEventHelper = null;
  disposer: PropertyChangeListener = null;
  /**
   * Constructor for subclasses to call.
   */
  _BasicLookAndFeel(): this {
    this._LookAndFeel();
    this.audioLock = new JObject();
    this.invocator = null;
    this.disposer = null;
    return this;
  }
  /**
   * Returns the look and feel defaults. The returned {@code UIDefaults}
   * is populated by invoking, in order, {@code initClassDefaults},
   * {@code initSystemColorDefaults} and {@code initComponentDefaults}.
   * <p>
   * While this method is public, it should only be invoked by the
   * {@code UIManager} when the look and feel is set as the current
   * look and feel and after {@code initialize} has been invoked.
   *
   * @return the look and feel defaults
   *
   * @see #initClassDefaults
   * @see #initSystemColorDefaults
   * @see #initComponentDefaults
   */
  getDefaults(): UIDefaults {
    let table = new UIDefaults()._UIDefaults$int$float(610, 0.75);
    this.initClassDefaults(table);
    this.initSystemColorDefaults(table);
    this.initComponentDefaults(table);
    return table;
  }
  /**
   * {@inheritDoc}
   */
  initialize(): void {
    if (BasicLookAndFeel.needsEventHelper) {
      this.installAWTEventListener();
    }
  }
  installAWTEventListener(): void {
    if (this.invocator == null) {
      this.invocator = new BasicLookAndFeel$AWTEventHelper().$o(this)._BasicLookAndFeel$AWTEventHelper();
      BasicLookAndFeel.needsEventHelper = true;
      this.disposer = (prpChg) => {
        this.uninitialize();
      };
      AppContext.getAppContext().addPropertyChangeListener('guidisposed', this.disposer);
    }
  }
  /**
   * {@inheritDoc}
   */
  uninitialize(): void {
    let context = AppContext.getAppContext();
    {
      let grabber = context.get(BasicPopupMenuUI.MOUSE_GRABBER_KEY);
      if (grabber != null) {
        (grabber).uninstall();
      }
    }
    {
      let helper = context.get(BasicPopupMenuUI.MENU_KEYBOARD_HELPER_KEY);
      if (helper != null) {
        (helper).uninstall();
      }
    }
    if (this.invocator != null) {
      AccessController.doPrivileged(this.invocator);
      this.invocator = null;
    }
    if (this.disposer != null) {
      context.removePropertyChangeListener('guidisposed', this.disposer);
      this.disposer = null;
    }
  }
  /**
   * Populates {@code table} with mappings from {@code uiClassID} to the
   * fully qualified name of the ui class. The value for a
   * particular {@code uiClassID} is {@code
   * "javax.swing.plaf.basic.Basic + uiClassID"}. For example, the
   * value for the {@code uiClassID} {@code TreeUI} is {@code
   * "javax.swing.plaf.basic.BasicTreeUI"}.
   *
   * @param table the {@code UIDefaults} instance the entries are
   *        added to
   * @throws NullPointerException if {@code table} is {@code null}
   *
   * @see javax.swing.LookAndFeel
   * @see #getDefaults
   */
  initClassDefaults(table: UIDefaults): void {
    let basicPackageName = 'javax.swing.plaf.basic.';
    let uiDefaults = ['ButtonUI', basicPackageName + 'BasicButtonUI', 'CheckBoxUI', basicPackageName + 'BasicCheckBoxUI', 'ColorChooserUI', basicPackageName + 'BasicColorChooserUI', 'FormattedTextFieldUI', basicPackageName + 'BasicFormattedTextFieldUI', 'MenuBarUI', basicPackageName + 'BasicMenuBarUI', 'MenuUI', basicPackageName + 'BasicMenuUI', 'MenuItemUI', basicPackageName + 'BasicMenuItemUI', 'CheckBoxMenuItemUI', basicPackageName + 'BasicCheckBoxMenuItemUI', 'RadioButtonMenuItemUI', basicPackageName + 'BasicRadioButtonMenuItemUI', 'RadioButtonUI', basicPackageName + 'BasicRadioButtonUI', 'ToggleButtonUI', basicPackageName + 'BasicToggleButtonUI', 'PopupMenuUI', basicPackageName + 'BasicPopupMenuUI', 'ProgressBarUI', basicPackageName + 'BasicProgressBarUI', 'ScrollBarUI', basicPackageName + 'BasicScrollBarUI', 'ScrollPaneUI', basicPackageName + 'BasicScrollPaneUI', 'SplitPaneUI', basicPackageName + 'BasicSplitPaneUI', 'SliderUI', basicPackageName + 'BasicSliderUI', 'SeparatorUI', basicPackageName + 'BasicSeparatorUI', 'SpinnerUI', basicPackageName + 'BasicSpinnerUI', 'ToolBarSeparatorUI', basicPackageName + 'BasicToolBarSeparatorUI', 'PopupMenuSeparatorUI', basicPackageName + 'BasicPopupMenuSeparatorUI', 'TabbedPaneUI', basicPackageName + 'BasicTabbedPaneUI', 'TextAreaUI', basicPackageName + 'BasicTextAreaUI', 'TextFieldUI', basicPackageName + 'BasicTextFieldUI', 'PasswordFieldUI', basicPackageName + 'BasicPasswordFieldUI', 'TextPaneUI', basicPackageName + 'BasicTextPaneUI', 'EditorPaneUI', basicPackageName + 'BasicEditorPaneUI', 'TreeUI', basicPackageName + 'BasicTreeUI', 'LabelUI', basicPackageName + 'BasicLabelUI', 'ListUI', basicPackageName + 'BasicListUI', 'ToolBarUI', basicPackageName + 'BasicToolBarUI', 'ToolTipUI', basicPackageName + 'BasicToolTipUI', 'ComboBoxUI', basicPackageName + 'BasicComboBoxUI', 'TableUI', basicPackageName + 'BasicTableUI', 'TableHeaderUI', basicPackageName + 'BasicTableHeaderUI', 'InternalFrameUI', basicPackageName + 'BasicInternalFrameUI', 'DesktopPaneUI', basicPackageName + 'BasicDesktopPaneUI', 'DesktopIconUI', basicPackageName + 'BasicDesktopIconUI', 'FileChooserUI', basicPackageName + 'BasicFileChooserUI', 'OptionPaneUI', basicPackageName + 'BasicOptionPaneUI', 'PanelUI', basicPackageName + 'BasicPanelUI', 'ViewportUI', basicPackageName + 'BasicViewportUI', 'RootPaneUI', basicPackageName + 'BasicRootPaneUI'];
    table.putDefaults(uiDefaults);
  }
  /**
   * Initialize the defaults table with the name of the ResourceBundle
   * used for getting localized defaults.  Also initialize the default
   * locale used when no locale is passed into UIDefaults.get().  The
   * default locale should generally not be relied upon. It is here for
   * compatibility with releases prior to 1.4.
   */
  initResourceBundle$UIDefaults$BasicLookAndFeel(table: UIDefaults): void {
    table.setDefaultLocale(Locale.getDefault());
    $J.fn(SwingAccessor.getUIDefaultsAccessor(), 'addInternalBundle')(table, 'com.sun.swing.internal.plaf.basic.resources.basic');
  }
  /**
   * Populates {@code table} with the defaults for the basic look and
   * feel.
   *
   * @param table the {@code UIDefaults} to add the values to
   * @throws NullPointerException if {@code table} is {@code null}
   */
  initComponentDefaults(table: UIDefaults): void {
    this.initResourceBundle$UIDefaults$BasicLookAndFeel(table);
    let fiveHundred = 500;
    let oneThousand = 1000;
    let dialogPlain12 = (t) => new FontUIResource()._FontUIResource$String$int$int(Font.DIALOG, Font.PLAIN, 12);
    let serifPlain12 = (t) => new FontUIResource()._FontUIResource$String$int$int(Font.SERIF, Font.PLAIN, 12);
    let sansSerifPlain12 = (t) => new FontUIResource()._FontUIResource$String$int$int(Font.SANS_SERIF, Font.PLAIN, 12);
    let monospacedPlain12 = (t) => new FontUIResource()._FontUIResource$String$int$int(Font.MONOSPACED, Font.PLAIN, 12);
    let dialogBold12 = (t) => new FontUIResource()._FontUIResource$String$int$int(Font.DIALOG, Font.BOLD, 12);
    let red = new ColorUIResource()._ColorUIResource$Color(Color.red);
    let black = new ColorUIResource()._ColorUIResource$Color(Color.black);
    let white = new ColorUIResource()._ColorUIResource$Color(Color.white);
    let yellow = new ColorUIResource()._ColorUIResource$Color(Color.yellow);
    let gray = new ColorUIResource()._ColorUIResource$Color(Color.gray);
    let lightGray = new ColorUIResource()._ColorUIResource$Color(Color.lightGray);
    let darkGray = new ColorUIResource()._ColorUIResource$Color(Color.darkGray);
    let scrollBarTrack = new ColorUIResource()._ColorUIResource$int$int$int(224, 224, 224);
    let control = table.getColor$Object('control');
    let controlDkShadow = table.getColor$Object('controlDkShadow');
    let controlHighlight = table.getColor$Object('controlHighlight');
    let controlLtHighlight = table.getColor$Object('controlLtHighlight');
    let controlShadow = table.getColor$Object('controlShadow');
    let controlText = table.getColor$Object('controlText');
    let menu = table.getColor$Object('menu');
    let menuText = table.getColor$Object('menuText');
    let textHighlight = table.getColor$Object('textHighlight');
    let textHighlightText = table.getColor$Object('textHighlightText');
    let textInactiveText = table.getColor$Object('textInactiveText');
    let textText = table.getColor$Object('textText');
    let window = table.getColor$Object('window');
    let zeroInsets = new InsetsUIResource()._InsetsUIResource(0, 0, 0, 0);
    let twoInsets = new InsetsUIResource()._InsetsUIResource(2, 2, 2, 2);
    let threeInsets = new InsetsUIResource()._InsetsUIResource(3, 3, 3, 3);
    let marginBorder = (t) => new BasicBorders$MarginBorder()._BasicBorders$MarginBorder();
    let etchedBorder = (t) => BorderUIResource.getEtchedBorderUIResource();
    let loweredBevelBorder = (t) => BorderUIResource.getLoweredBevelBorderUIResource();
    let popupMenuBorder = (t) => BasicBorders.getInternalFrameBorder();
    let blackLineBorder = (t) => BorderUIResource.getBlackLineBorderUIResource();
    let focusCellHighlightBorder = (t) => new BorderUIResource$LineBorderUIResource()._BorderUIResource$LineBorderUIResource$Color(yellow);
    let noFocusBorder = new BorderUIResource$EmptyBorderUIResource()._BorderUIResource$EmptyBorderUIResource$int$int$int$int(1, 1, 1, 1);
    let tableHeaderBorder = (t) => new BorderUIResource$BevelBorderUIResource()._BorderUIResource$BevelBorderUIResource$int$Color$Color$Color$Color(BevelBorder.RAISED, controlLtHighlight, control, controlDkShadow, controlShadow);
    let buttonBorder = (t) => BasicBorders.getButtonBorder();
    let buttonToggleBorder = (t) => BasicBorders.getToggleButtonBorder();
    let radioButtonBorder = (t) => BasicBorders.getRadioButtonBorder();
    let newFolderIcon = SwingUtilities2.makeIcon$Class$Class$String($J.getClass(this), $J.cls(BasicLookAndFeel), 'icons/NewFolder.gif');
    let upFolderIcon = SwingUtilities2.makeIcon$Class$Class$String($J.getClass(this), $J.cls(BasicLookAndFeel), 'icons/UpFolder.gif');
    let homeFolderIcon = SwingUtilities2.makeIcon$Class$Class$String($J.getClass(this), $J.cls(BasicLookAndFeel), 'icons/HomeFolder.gif');
    let detailsViewIcon = SwingUtilities2.makeIcon$Class$Class$String($J.getClass(this), $J.cls(BasicLookAndFeel), 'icons/DetailsView.gif');
    let listViewIcon = SwingUtilities2.makeIcon$Class$Class$String($J.getClass(this), $J.cls(BasicLookAndFeel), 'icons/ListView.gif');
    let directoryIcon = SwingUtilities2.makeIcon$Class$Class$String($J.getClass(this), $J.cls(BasicLookAndFeel), 'icons/Directory.gif');
    let fileIcon = SwingUtilities2.makeIcon$Class$Class$String($J.getClass(this), $J.cls(BasicLookAndFeel), 'icons/File.gif');
    let computerIcon = SwingUtilities2.makeIcon$Class$Class$String($J.getClass(this), $J.cls(BasicLookAndFeel), 'icons/Computer.gif');
    let hardDriveIcon = SwingUtilities2.makeIcon$Class$Class$String($J.getClass(this), $J.cls(BasicLookAndFeel), 'icons/HardDrive.gif');
    let floppyDriveIcon = SwingUtilities2.makeIcon$Class$Class$String($J.getClass(this), $J.cls(BasicLookAndFeel), 'icons/FloppyDrive.gif');
    let internalFrameBorder = (t) => BasicBorders.getInternalFrameBorder();
    let listCellRendererActiveValue = new (BasicLookAndFeel$2())().$o(this);
    let menuBarBorder = (t) => BasicBorders.getMenuBarBorder();
    let menuItemCheckIcon = (t) => BasicIconFactory.getMenuItemCheckIcon();
    let menuItemArrowIcon = (t) => BasicIconFactory.getMenuItemArrowIcon();
    let menuArrowIcon = (t) => BasicIconFactory.getMenuArrowIcon();
    let checkBoxIcon = (t) => BasicIconFactory.getCheckBoxIcon();
    let radioButtonIcon = (t) => BasicIconFactory.getRadioButtonIcon();
    let checkBoxMenuItemIcon = (t) => BasicIconFactory.getCheckBoxMenuItemIcon();
    let radioButtonMenuItemIcon = (t) => BasicIconFactory.getRadioButtonMenuItemIcon();
    let menuItemAcceleratorDelimiter = '+';
    let optionPaneMinimumSize = new DimensionUIResource()._DimensionUIResource(262, 90);
    let zero = 0;
    let zeroBorder = (t) => new BorderUIResource$EmptyBorderUIResource()._BorderUIResource$EmptyBorderUIResource$int$int$int$int(zero, zero, zero, zero);
    let ten = 10;
    let optionPaneBorder = (t) => new BorderUIResource$EmptyBorderUIResource()._BorderUIResource$EmptyBorderUIResource$int$int$int$int(ten, ten, 12, ten);
    let optionPaneButtonAreaBorder = (t) => new BorderUIResource$EmptyBorderUIResource()._BorderUIResource$EmptyBorderUIResource$int$int$int$int(6, zero, zero, zero);
    let progressBarBorder = (t) => BasicBorders.getProgressBarBorder();
    let minimumThumbSize = new DimensionUIResource()._DimensionUIResource(8, 8);
    let maximumThumbSize = new DimensionUIResource()._DimensionUIResource(4096, 4096);
    let sliderFocusInsets = twoInsets;
    let toolBarSeparatorSize = new DimensionUIResource()._DimensionUIResource(10, 10);
    let splitPaneBorder = (t) => BasicBorders.getSplitPaneBorder();
    let splitPaneDividerBorder = (t) => BasicBorders.getSplitPaneDividerBorder();
    let tabbedPaneTabInsets = new InsetsUIResource()._InsetsUIResource(0, 4, 1, 4);
    let tabbedPaneTabPadInsets = new InsetsUIResource()._InsetsUIResource(2, 2, 2, 1);
    let tabbedPaneTabAreaInsets = new InsetsUIResource()._InsetsUIResource(3, 2, 0, 2);
    let tabbedPaneContentBorderInsets = new InsetsUIResource()._InsetsUIResource(2, 2, 3, 3);
    let textFieldBorder = (t) => BasicBorders.getTextFieldBorder();
    let editorMargin = threeInsets;
    let caretBlinkRate = fiveHundred;
    let allAuditoryCues = ['CheckBoxMenuItem.commandSound', 'InternalFrame.closeSound', 'InternalFrame.maximizeSound', 'InternalFrame.minimizeSound', 'InternalFrame.restoreDownSound', 'InternalFrame.restoreUpSound', 'MenuItem.commandSound', 'OptionPane.errorSound', 'OptionPane.informationSound', 'OptionPane.questionSound', 'OptionPane.warningSound', 'PopupMenu.popupSound', 'RadioButtonMenuItem.commandSound'];
    let noAuditoryCues = ['mute'];
    let defaults = ['AuditoryCues.cueList', allAuditoryCues, 'AuditoryCues.allAuditoryCues', allAuditoryCues, 'AuditoryCues.noAuditoryCues', noAuditoryCues, 'AuditoryCues.playList', null, 'Button.defaultButtonFollowsFocus', true, 'Button.font', dialogPlain12, 'Button.background', control, 'Button.foreground', controlText, 'Button.shadow', controlShadow, 'Button.darkShadow', controlDkShadow, 'Button.light', controlHighlight, 'Button.highlight', controlLtHighlight, 'Button.border', buttonBorder, 'Button.margin', new InsetsUIResource()._InsetsUIResource(2, 14, 2, 14), 'Button.textIconGap', 4, 'Button.textShiftOffset', zero, 'Button.focusInputMap', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['SPACE', 'pressed', 'released SPACE', 'released', 'ENTER', 'pressed', 'released ENTER', 'released']), 'ToggleButton.font', dialogPlain12, 'ToggleButton.background', control, 'ToggleButton.foreground', controlText, 'ToggleButton.shadow', controlShadow, 'ToggleButton.darkShadow', controlDkShadow, 'ToggleButton.light', controlHighlight, 'ToggleButton.highlight', controlLtHighlight, 'ToggleButton.border', buttonToggleBorder, 'ToggleButton.margin', new InsetsUIResource()._InsetsUIResource(2, 14, 2, 14), 'ToggleButton.textIconGap', 4, 'ToggleButton.textShiftOffset', zero, 'ToggleButton.focusInputMap', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['SPACE', 'pressed', 'released SPACE', 'released']), 'RadioButton.font', dialogPlain12, 'RadioButton.background', control, 'RadioButton.foreground', controlText, 'RadioButton.shadow', controlShadow, 'RadioButton.darkShadow', controlDkShadow, 'RadioButton.light', controlHighlight, 'RadioButton.highlight', controlLtHighlight, 'RadioButton.border', radioButtonBorder, 'RadioButton.margin', twoInsets, 'RadioButton.textIconGap', 4, 'RadioButton.textShiftOffset', zero, 'RadioButton.icon', radioButtonIcon, 'RadioButton.focusInputMap', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['SPACE', 'pressed', 'released SPACE', 'released', 'RETURN', 'pressed']), 'CheckBox.font', dialogPlain12, 'CheckBox.background', control, 'CheckBox.foreground', controlText, 'CheckBox.border', radioButtonBorder, 'CheckBox.margin', twoInsets, 'CheckBox.textIconGap', 4, 'CheckBox.textShiftOffset', zero, 'CheckBox.icon', checkBoxIcon, 'CheckBox.focusInputMap', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['SPACE', 'pressed', 'released SPACE', 'released']), 'FileChooser.useSystemExtensionHiding', false, 'ColorChooser.font', dialogPlain12, 'ColorChooser.background', control, 'ColorChooser.foreground', controlText, 'ColorChooser.swatchesSwatchSize', new Dimension()._Dimension$int$int(10, 10), 'ColorChooser.swatchesRecentSwatchSize', new Dimension()._Dimension$int$int(10, 10), 'ColorChooser.swatchesDefaultRecentColor', control, 'ComboBox.font', sansSerifPlain12, 'ComboBox.background', window, 'ComboBox.foreground', textText, 'ComboBox.buttonBackground', control, 'ComboBox.buttonShadow', controlShadow, 'ComboBox.buttonDarkShadow', controlDkShadow, 'ComboBox.buttonHighlight', controlLtHighlight, 'ComboBox.selectionBackground', textHighlight, 'ComboBox.selectionForeground', textHighlightText, 'ComboBox.disabledBackground', control, 'ComboBox.disabledForeground', textInactiveText, 'ComboBox.timeFactor', oneThousand, 'ComboBox.isEnterSelectablePopup', false, 'ComboBox.ancestorInputMap', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['ESCAPE', 'hidePopup', 'PAGE_UP', 'pageUpPassThrough', 'PAGE_DOWN', 'pageDownPassThrough', 'HOME', 'homePassThrough', 'END', 'endPassThrough', 'ENTER', 'enterPressed']), 'ComboBox.noActionOnKeyNavigation', false, 'FileChooser.newFolderIcon', newFolderIcon, 'FileChooser.upFolderIcon', upFolderIcon, 'FileChooser.homeFolderIcon', homeFolderIcon, 'FileChooser.detailsViewIcon', detailsViewIcon, 'FileChooser.listViewIcon', listViewIcon, 'FileChooser.readOnly', false, 'FileChooser.usesSingleFilePane', false, 'FileChooser.ancestorInputMap', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['ESCAPE', 'cancelSelection', 'F5', 'refresh']), 'FileView.directoryIcon', directoryIcon, 'FileView.fileIcon', fileIcon, 'FileView.computerIcon', computerIcon, 'FileView.hardDriveIcon', hardDriveIcon, 'FileView.floppyDriveIcon', floppyDriveIcon, 'InternalFrame.titleFont', dialogBold12, 'InternalFrame.borderColor', control, 'InternalFrame.borderShadow', controlShadow, 'InternalFrame.borderDarkShadow', controlDkShadow, 'InternalFrame.borderHighlight', controlLtHighlight, 'InternalFrame.borderLight', controlHighlight, 'InternalFrame.border', internalFrameBorder, 'InternalFrame.icon', SwingUtilities2.makeIcon$Class$Class$String($J.getClass(this), $J.cls(BasicLookAndFeel), 'icons/JavaCup16.png'), 'InternalFrame.maximizeIcon', (t) => BasicIconFactory.createEmptyFrameIcon(), 'InternalFrame.minimizeIcon', (t) => BasicIconFactory.createEmptyFrameIcon(), 'InternalFrame.iconifyIcon', (t) => BasicIconFactory.createEmptyFrameIcon(), 'InternalFrame.closeIcon', (t) => BasicIconFactory.createEmptyFrameIcon(), 'InternalFrame.closeSound', null, 'InternalFrame.maximizeSound', null, 'InternalFrame.minimizeSound', null, 'InternalFrame.restoreDownSound', null, 'InternalFrame.restoreUpSound', null, 'InternalFrame.activeTitleBackground', table.get('activeCaption'), 'InternalFrame.activeTitleForeground', table.get('activeCaptionText'), 'InternalFrame.inactiveTitleBackground', table.get('inactiveCaption'), 'InternalFrame.inactiveTitleForeground', table.get('inactiveCaptionText'), 'InternalFrame.windowBindings', ['shift ESCAPE', 'showSystemMenu', 'ctrl SPACE', 'showSystemMenu', 'ESCAPE', 'hideSystemMenu'], 'InternalFrameTitlePane.iconifyButtonOpacity', true, 'InternalFrameTitlePane.maximizeButtonOpacity', true, 'InternalFrameTitlePane.closeButtonOpacity', true, 'DesktopIcon.border', internalFrameBorder, 'Desktop.minOnScreenInsets', threeInsets, 'Desktop.background', table.get('desktop'), 'Desktop.ancestorInputMap', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['ctrl F5', 'restore', 'ctrl F4', 'close', 'ctrl F7', 'move', 'ctrl F8', 'resize', 'RIGHT', 'right', 'KP_RIGHT', 'right', 'shift RIGHT', 'shrinkRight', 'shift KP_RIGHT', 'shrinkRight', 'LEFT', 'left', 'KP_LEFT', 'left', 'shift LEFT', 'shrinkLeft', 'shift KP_LEFT', 'shrinkLeft', 'UP', 'up', 'KP_UP', 'up', 'shift UP', 'shrinkUp', 'shift KP_UP', 'shrinkUp', 'DOWN', 'down', 'KP_DOWN', 'down', 'shift DOWN', 'shrinkDown', 'shift KP_DOWN', 'shrinkDown', 'ESCAPE', 'escape', 'ctrl F9', 'minimize', 'ctrl F10', 'maximize', 'ctrl F6', 'selectNextFrame', 'ctrl TAB', 'selectNextFrame', 'ctrl alt F6', 'selectNextFrame', 'shift ctrl alt F6', 'selectPreviousFrame', 'ctrl F12', 'navigateNext', 'shift ctrl F12', 'navigatePrevious']), 'Label.font', dialogPlain12, 'Label.background', control, 'Label.foreground', controlText, 'Label.disabledForeground', white, 'Label.disabledShadow', controlShadow, 'Label.border', null, 'List.font', dialogPlain12, 'List.background', window, 'List.foreground', textText, 'List.selectionBackground', textHighlight, 'List.selectionForeground', textHighlightText, 'List.noFocusBorder', noFocusBorder, 'List.focusCellHighlightBorder', focusCellHighlightBorder, 'List.dropLineColor', controlShadow, 'List.border', null, 'List.cellRenderer', listCellRendererActiveValue, 'List.timeFactor', oneThousand, 'List.focusInputMap', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['ctrl C', 'copy', 'ctrl V', 'paste', 'ctrl X', 'cut', 'COPY', 'copy', 'PASTE', 'paste', 'CUT', 'cut', 'control INSERT', 'copy', 'shift INSERT', 'paste', 'shift DELETE', 'cut', 'UP', 'selectPreviousRow', 'KP_UP', 'selectPreviousRow', 'shift UP', 'selectPreviousRowExtendSelection', 'shift KP_UP', 'selectPreviousRowExtendSelection', 'ctrl shift UP', 'selectPreviousRowExtendSelection', 'ctrl shift KP_UP', 'selectPreviousRowExtendSelection', 'ctrl UP', 'selectPreviousRowChangeLead', 'ctrl KP_UP', 'selectPreviousRowChangeLead', 'DOWN', 'selectNextRow', 'KP_DOWN', 'selectNextRow', 'shift DOWN', 'selectNextRowExtendSelection', 'shift KP_DOWN', 'selectNextRowExtendSelection', 'ctrl shift DOWN', 'selectNextRowExtendSelection', 'ctrl shift KP_DOWN', 'selectNextRowExtendSelection', 'ctrl DOWN', 'selectNextRowChangeLead', 'ctrl KP_DOWN', 'selectNextRowChangeLead', 'LEFT', 'selectPreviousColumn', 'KP_LEFT', 'selectPreviousColumn', 'shift LEFT', 'selectPreviousColumnExtendSelection', 'shift KP_LEFT', 'selectPreviousColumnExtendSelection', 'ctrl shift LEFT', 'selectPreviousColumnExtendSelection', 'ctrl shift KP_LEFT', 'selectPreviousColumnExtendSelection', 'ctrl LEFT', 'selectPreviousColumnChangeLead', 'ctrl KP_LEFT', 'selectPreviousColumnChangeLead', 'RIGHT', 'selectNextColumn', 'KP_RIGHT', 'selectNextColumn', 'shift RIGHT', 'selectNextColumnExtendSelection', 'shift KP_RIGHT', 'selectNextColumnExtendSelection', 'ctrl shift RIGHT', 'selectNextColumnExtendSelection', 'ctrl shift KP_RIGHT', 'selectNextColumnExtendSelection', 'ctrl RIGHT', 'selectNextColumnChangeLead', 'ctrl KP_RIGHT', 'selectNextColumnChangeLead', 'HOME', 'selectFirstRow', 'shift HOME', 'selectFirstRowExtendSelection', 'ctrl shift HOME', 'selectFirstRowExtendSelection', 'ctrl HOME', 'selectFirstRowChangeLead', 'END', 'selectLastRow', 'shift END', 'selectLastRowExtendSelection', 'ctrl shift END', 'selectLastRowExtendSelection', 'ctrl END', 'selectLastRowChangeLead', 'PAGE_UP', 'scrollUp', 'shift PAGE_UP', 'scrollUpExtendSelection', 'ctrl shift PAGE_UP', 'scrollUpExtendSelection', 'ctrl PAGE_UP', 'scrollUpChangeLead', 'PAGE_DOWN', 'scrollDown', 'shift PAGE_DOWN', 'scrollDownExtendSelection', 'ctrl shift PAGE_DOWN', 'scrollDownExtendSelection', 'ctrl PAGE_DOWN', 'scrollDownChangeLead', 'ctrl A', 'selectAll', 'ctrl SLASH', 'selectAll', 'ctrl BACK_SLASH', 'clearSelection', 'SPACE', 'addToSelection', 'ctrl SPACE', 'toggleAndAnchor', 'shift SPACE', 'extendTo', 'ctrl shift SPACE', 'moveSelectionTo']), 'List.focusInputMap.RightToLeft', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['LEFT', 'selectNextColumn', 'KP_LEFT', 'selectNextColumn', 'shift LEFT', 'selectNextColumnExtendSelection', 'shift KP_LEFT', 'selectNextColumnExtendSelection', 'ctrl shift LEFT', 'selectNextColumnExtendSelection', 'ctrl shift KP_LEFT', 'selectNextColumnExtendSelection', 'ctrl LEFT', 'selectNextColumnChangeLead', 'ctrl KP_LEFT', 'selectNextColumnChangeLead', 'RIGHT', 'selectPreviousColumn', 'KP_RIGHT', 'selectPreviousColumn', 'shift RIGHT', 'selectPreviousColumnExtendSelection', 'shift KP_RIGHT', 'selectPreviousColumnExtendSelection', 'ctrl shift RIGHT', 'selectPreviousColumnExtendSelection', 'ctrl shift KP_RIGHT', 'selectPreviousColumnExtendSelection', 'ctrl RIGHT', 'selectPreviousColumnChangeLead', 'ctrl KP_RIGHT', 'selectPreviousColumnChangeLead']), 'MenuBar.font', dialogPlain12, 'MenuBar.background', menu, 'MenuBar.foreground', menuText, 'MenuBar.shadow', controlShadow, 'MenuBar.highlight', controlLtHighlight, 'MenuBar.border', menuBarBorder, 'MenuBar.windowBindings', ['F10', 'takeFocus'], 'MenuItem.font', dialogPlain12, 'MenuItem.acceleratorFont', dialogPlain12, 'MenuItem.background', menu, 'MenuItem.foreground', menuText, 'MenuItem.selectionForeground', textHighlightText, 'MenuItem.selectionBackground', textHighlight, 'MenuItem.disabledForeground', null, 'MenuItem.acceleratorForeground', menuText, 'MenuItem.acceleratorSelectionForeground', textHighlightText, 'MenuItem.acceleratorDelimiter', menuItemAcceleratorDelimiter, 'MenuItem.border', marginBorder, 'MenuItem.borderPainted', false, 'MenuItem.margin', twoInsets, 'MenuItem.checkIcon', menuItemCheckIcon, 'MenuItem.arrowIcon', menuItemArrowIcon, 'MenuItem.commandSound', null, 'RadioButtonMenuItem.font', dialogPlain12, 'RadioButtonMenuItem.acceleratorFont', dialogPlain12, 'RadioButtonMenuItem.background', menu, 'RadioButtonMenuItem.foreground', menuText, 'RadioButtonMenuItem.selectionForeground', textHighlightText, 'RadioButtonMenuItem.selectionBackground', textHighlight, 'RadioButtonMenuItem.disabledForeground', null, 'RadioButtonMenuItem.acceleratorForeground', menuText, 'RadioButtonMenuItem.acceleratorSelectionForeground', textHighlightText, 'RadioButtonMenuItem.border', marginBorder, 'RadioButtonMenuItem.borderPainted', false, 'RadioButtonMenuItem.margin', twoInsets, 'RadioButtonMenuItem.checkIcon', radioButtonMenuItemIcon, 'RadioButtonMenuItem.arrowIcon', menuItemArrowIcon, 'RadioButtonMenuItem.commandSound', null, 'CheckBoxMenuItem.font', dialogPlain12, 'CheckBoxMenuItem.acceleratorFont', dialogPlain12, 'CheckBoxMenuItem.background', menu, 'CheckBoxMenuItem.foreground', menuText, 'CheckBoxMenuItem.selectionForeground', textHighlightText, 'CheckBoxMenuItem.selectionBackground', textHighlight, 'CheckBoxMenuItem.disabledForeground', null, 'CheckBoxMenuItem.acceleratorForeground', menuText, 'CheckBoxMenuItem.acceleratorSelectionForeground', textHighlightText, 'CheckBoxMenuItem.border', marginBorder, 'CheckBoxMenuItem.borderPainted', false, 'CheckBoxMenuItem.margin', twoInsets, 'CheckBoxMenuItem.checkIcon', checkBoxMenuItemIcon, 'CheckBoxMenuItem.arrowIcon', menuItemArrowIcon, 'CheckBoxMenuItem.commandSound', null, 'Menu.font', dialogPlain12, 'Menu.acceleratorFont', dialogPlain12, 'Menu.background', menu, 'Menu.foreground', menuText, 'Menu.selectionForeground', textHighlightText, 'Menu.selectionBackground', textHighlight, 'Menu.disabledForeground', null, 'Menu.acceleratorForeground', menuText, 'Menu.acceleratorSelectionForeground', textHighlightText, 'Menu.border', marginBorder, 'Menu.borderPainted', false, 'Menu.margin', twoInsets, 'Menu.checkIcon', menuItemCheckIcon, 'Menu.arrowIcon', menuArrowIcon, 'Menu.menuPopupOffsetX', 0, 'Menu.menuPopupOffsetY', 0, 'Menu.submenuPopupOffsetX', 0, 'Menu.submenuPopupOffsetY', 0, 'Menu.shortcutKeys', [SwingUtilities2.getSystemMnemonicKeyMask(), SwingUtilities2.setAltGraphMask(SwingUtilities2.getSystemMnemonicKeyMask())], 'Menu.crossMenuMnemonic', true, 'Menu.cancelMode', 'hideLastSubmenu', 'Menu.preserveTopLevelSelection', false, 'PopupMenu.font', dialogPlain12, 'PopupMenu.background', menu, 'PopupMenu.foreground', menuText, 'PopupMenu.border', popupMenuBorder, 'PopupMenu.popupSound', null, 'PopupMenu.selectedWindowInputMapBindings', ['ESCAPE', 'cancel', 'DOWN', 'selectNext', 'KP_DOWN', 'selectNext', 'UP', 'selectPrevious', 'KP_UP', 'selectPrevious', 'LEFT', 'selectParent', 'KP_LEFT', 'selectParent', 'RIGHT', 'selectChild', 'KP_RIGHT', 'selectChild', 'ENTER', 'return', 'ctrl ENTER', 'return', 'SPACE', 'return'], 'PopupMenu.selectedWindowInputMapBindings.RightToLeft', ['LEFT', 'selectChild', 'KP_LEFT', 'selectChild', 'RIGHT', 'selectParent', 'KP_RIGHT', 'selectParent'], 'PopupMenu.consumeEventOnClose', false, 'OptionPane.font', dialogPlain12, 'OptionPane.background', control, 'OptionPane.foreground', controlText, 'OptionPane.messageForeground', controlText, 'OptionPane.border', optionPaneBorder, 'OptionPane.messageAreaBorder', zeroBorder, 'OptionPane.buttonAreaBorder', optionPaneButtonAreaBorder, 'OptionPane.minimumSize', optionPaneMinimumSize, 'OptionPane.errorIcon', SwingUtilities2.makeIcon$Class$Class$String($J.getClass(this), $J.cls(BasicLookAndFeel), 'icons/Error.gif'), 'OptionPane.informationIcon', SwingUtilities2.makeIcon$Class$Class$String($J.getClass(this), $J.cls(BasicLookAndFeel), 'icons/Inform.gif'), 'OptionPane.warningIcon', SwingUtilities2.makeIcon$Class$Class$String($J.getClass(this), $J.cls(BasicLookAndFeel), 'icons/Warn.gif'), 'OptionPane.questionIcon', SwingUtilities2.makeIcon$Class$Class$String($J.getClass(this), $J.cls(BasicLookAndFeel), 'icons/Question.gif'), 'OptionPane.windowBindings', ['ESCAPE', 'close'], 'OptionPane.errorSound', null, 'OptionPane.informationSound', null, 'OptionPane.questionSound', null, 'OptionPane.warningSound', null, 'OptionPane.buttonClickThreshhold', fiveHundred, 'Panel.font', dialogPlain12, 'Panel.background', control, 'Panel.foreground', textText, 'ProgressBar.font', dialogPlain12, 'ProgressBar.foreground', textHighlight, 'ProgressBar.background', control, 'ProgressBar.selectionForeground', control, 'ProgressBar.selectionBackground', textHighlight, 'ProgressBar.border', progressBarBorder, 'ProgressBar.cellLength', 1, 'ProgressBar.cellSpacing', zero, 'ProgressBar.repaintInterval', 50, 'ProgressBar.cycleTime', 3000, 'ProgressBar.horizontalSize', new DimensionUIResource()._DimensionUIResource(146, 12), 'ProgressBar.verticalSize', new DimensionUIResource()._DimensionUIResource(12, 146), 'Separator.shadow', controlShadow, 'Separator.highlight', controlLtHighlight, 'Separator.background', controlLtHighlight, 'Separator.foreground', controlShadow, 'ScrollBar.background', scrollBarTrack, 'ScrollBar.foreground', control, 'ScrollBar.track', table.get('scrollbar'), 'ScrollBar.trackHighlight', controlDkShadow, 'ScrollBar.thumb', control, 'ScrollBar.thumbHighlight', controlLtHighlight, 'ScrollBar.thumbDarkShadow', controlDkShadow, 'ScrollBar.thumbShadow', controlShadow, 'ScrollBar.border', null, 'ScrollBar.minimumThumbSize', minimumThumbSize, 'ScrollBar.maximumThumbSize', maximumThumbSize, 'ScrollBar.ancestorInputMap', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['RIGHT', 'positiveUnitIncrement', 'KP_RIGHT', 'positiveUnitIncrement', 'DOWN', 'positiveUnitIncrement', 'KP_DOWN', 'positiveUnitIncrement', 'PAGE_DOWN', 'positiveBlockIncrement', 'LEFT', 'negativeUnitIncrement', 'KP_LEFT', 'negativeUnitIncrement', 'UP', 'negativeUnitIncrement', 'KP_UP', 'negativeUnitIncrement', 'PAGE_UP', 'negativeBlockIncrement', 'HOME', 'minScroll', 'END', 'maxScroll']), 'ScrollBar.ancestorInputMap.RightToLeft', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['RIGHT', 'negativeUnitIncrement', 'KP_RIGHT', 'negativeUnitIncrement', 'LEFT', 'positiveUnitIncrement', 'KP_LEFT', 'positiveUnitIncrement']), 'ScrollBar.width', 16, 'ScrollPane.font', dialogPlain12, 'ScrollPane.background', control, 'ScrollPane.foreground', controlText, 'ScrollPane.border', textFieldBorder, 'ScrollPane.viewportBorder', null, 'ScrollPane.ancestorInputMap', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['RIGHT', 'unitScrollRight', 'KP_RIGHT', 'unitScrollRight', 'DOWN', 'unitScrollDown', 'KP_DOWN', 'unitScrollDown', 'LEFT', 'unitScrollLeft', 'KP_LEFT', 'unitScrollLeft', 'UP', 'unitScrollUp', 'KP_UP', 'unitScrollUp', 'PAGE_UP', 'scrollUp', 'PAGE_DOWN', 'scrollDown', 'ctrl PAGE_UP', 'scrollLeft', 'ctrl PAGE_DOWN', 'scrollRight', 'ctrl HOME', 'scrollHome', 'ctrl END', 'scrollEnd']), 'ScrollPane.ancestorInputMap.RightToLeft', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['ctrl PAGE_UP', 'scrollRight', 'ctrl PAGE_DOWN', 'scrollLeft']), 'Viewport.font', dialogPlain12, 'Viewport.background', control, 'Viewport.foreground', textText, 'Slider.font', dialogPlain12, 'Slider.foreground', control, 'Slider.background', control, 'Slider.highlight', controlLtHighlight, 'Slider.tickColor', Color.black, 'Slider.shadow', controlShadow, 'Slider.focus', controlDkShadow, 'Slider.border', null, 'Slider.horizontalSize', new Dimension()._Dimension$int$int(200, 21), 'Slider.verticalSize', new Dimension()._Dimension$int$int(21, 200), 'Slider.minimumHorizontalSize', new Dimension()._Dimension$int$int(36, 21), 'Slider.minimumVerticalSize', new Dimension()._Dimension$int$int(21, 36), 'Slider.focusInsets', sliderFocusInsets, 'Slider.focusInputMap', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['RIGHT', 'positiveUnitIncrement', 'KP_RIGHT', 'positiveUnitIncrement', 'DOWN', 'negativeUnitIncrement', 'KP_DOWN', 'negativeUnitIncrement', 'PAGE_DOWN', 'negativeBlockIncrement', 'LEFT', 'negativeUnitIncrement', 'KP_LEFT', 'negativeUnitIncrement', 'UP', 'positiveUnitIncrement', 'KP_UP', 'positiveUnitIncrement', 'PAGE_UP', 'positiveBlockIncrement', 'HOME', 'minScroll', 'END', 'maxScroll']), 'Slider.focusInputMap.RightToLeft', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['RIGHT', 'negativeUnitIncrement', 'KP_RIGHT', 'negativeUnitIncrement', 'LEFT', 'positiveUnitIncrement', 'KP_LEFT', 'positiveUnitIncrement']), 'Slider.onlyLeftMouseButtonDrag', true, 'Spinner.font', monospacedPlain12, 'Spinner.background', control, 'Spinner.foreground', control, 'Spinner.border', textFieldBorder, 'Spinner.arrowButtonBorder', null, 'Spinner.arrowButtonInsets', null, 'Spinner.arrowButtonSize', new Dimension()._Dimension$int$int(16, 5), 'Spinner.ancestorInputMap', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['UP', 'increment', 'KP_UP', 'increment', 'DOWN', 'decrement', 'KP_DOWN', 'decrement']), 'Spinner.editorBorderPainted', false, 'Spinner.editorAlignment', SwingConstants.TRAILING, 'SplitPane.background', control, 'SplitPane.highlight', controlLtHighlight, 'SplitPane.shadow', controlShadow, 'SplitPane.darkShadow', controlDkShadow, 'SplitPane.border', splitPaneBorder, 'SplitPane.dividerSize', 7, 'SplitPaneDivider.border', splitPaneDividerBorder, 'SplitPaneDivider.draggingColor', darkGray, 'SplitPane.ancestorInputMap', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['UP', 'negativeIncrement', 'DOWN', 'positiveIncrement', 'LEFT', 'negativeIncrement', 'RIGHT', 'positiveIncrement', 'KP_UP', 'negativeIncrement', 'KP_DOWN', 'positiveIncrement', 'KP_LEFT', 'negativeIncrement', 'KP_RIGHT', 'positiveIncrement', 'HOME', 'selectMin', 'END', 'selectMax', 'F8', 'startResize', 'F6', 'toggleFocus', 'ctrl TAB', 'focusOutForward', 'ctrl shift TAB', 'focusOutBackward']), 'TabbedPane.font', dialogPlain12, 'TabbedPane.background', control, 'TabbedPane.foreground', controlText, 'TabbedPane.highlight', controlLtHighlight, 'TabbedPane.light', controlHighlight, 'TabbedPane.shadow', controlShadow, 'TabbedPane.darkShadow', controlDkShadow, 'TabbedPane.selected', null, 'TabbedPane.focus', controlText, 'TabbedPane.textIconGap', 4, 'TabbedPane.tabsOverlapBorder', false, 'TabbedPane.selectionFollowsFocus', true, 'TabbedPane.labelShift', 1, 'TabbedPane.selectedLabelShift', -1, 'TabbedPane.tabInsets', tabbedPaneTabInsets, 'TabbedPane.selectedTabPadInsets', tabbedPaneTabPadInsets, 'TabbedPane.tabAreaInsets', tabbedPaneTabAreaInsets, 'TabbedPane.contentBorderInsets', tabbedPaneContentBorderInsets, 'TabbedPane.tabRunOverlay', 2, 'TabbedPane.tabsOpaque', true, 'TabbedPane.contentOpaque', true, 'TabbedPane.focusInputMap', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['RIGHT', 'navigateRight', 'KP_RIGHT', 'navigateRight', 'LEFT', 'navigateLeft', 'KP_LEFT', 'navigateLeft', 'UP', 'navigateUp', 'KP_UP', 'navigateUp', 'DOWN', 'navigateDown', 'KP_DOWN', 'navigateDown', 'ctrl DOWN', 'requestFocusForVisibleComponent', 'ctrl KP_DOWN', 'requestFocusForVisibleComponent']), 'TabbedPane.ancestorInputMap', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['ctrl PAGE_DOWN', 'navigatePageDown', 'ctrl PAGE_UP', 'navigatePageUp', 'ctrl UP', 'requestFocus', 'ctrl KP_UP', 'requestFocus']), 'Table.font', dialogPlain12, 'Table.foreground', controlText, 'Table.background', window, 'Table.selectionForeground', textHighlightText, 'Table.selectionBackground', textHighlight, 'Table.dropLineColor', controlShadow, 'Table.dropLineShortColor', black, 'Table.gridColor', gray, 'Table.focusCellBackground', window, 'Table.focusCellForeground', controlText, 'Table.focusCellHighlightBorder', focusCellHighlightBorder, 'Table.scrollPaneBorder', loweredBevelBorder, 'Table.ancestorInputMap', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['ctrl C', 'copy', 'ctrl V', 'paste', 'ctrl X', 'cut', 'COPY', 'copy', 'PASTE', 'paste', 'CUT', 'cut', 'control INSERT', 'copy', 'shift INSERT', 'paste', 'shift DELETE', 'cut', 'RIGHT', 'selectNextColumn', 'KP_RIGHT', 'selectNextColumn', 'shift RIGHT', 'selectNextColumnExtendSelection', 'shift KP_RIGHT', 'selectNextColumnExtendSelection', 'ctrl shift RIGHT', 'selectNextColumnExtendSelection', 'ctrl shift KP_RIGHT', 'selectNextColumnExtendSelection', 'ctrl RIGHT', 'selectNextColumnChangeLead', 'ctrl KP_RIGHT', 'selectNextColumnChangeLead', 'LEFT', 'selectPreviousColumn', 'KP_LEFT', 'selectPreviousColumn', 'shift LEFT', 'selectPreviousColumnExtendSelection', 'shift KP_LEFT', 'selectPreviousColumnExtendSelection', 'ctrl shift LEFT', 'selectPreviousColumnExtendSelection', 'ctrl shift KP_LEFT', 'selectPreviousColumnExtendSelection', 'ctrl LEFT', 'selectPreviousColumnChangeLead', 'ctrl KP_LEFT', 'selectPreviousColumnChangeLead', 'DOWN', 'selectNextRow', 'KP_DOWN', 'selectNextRow', 'shift DOWN', 'selectNextRowExtendSelection', 'shift KP_DOWN', 'selectNextRowExtendSelection', 'ctrl shift DOWN', 'selectNextRowExtendSelection', 'ctrl shift KP_DOWN', 'selectNextRowExtendSelection', 'ctrl DOWN', 'selectNextRowChangeLead', 'ctrl KP_DOWN', 'selectNextRowChangeLead', 'UP', 'selectPreviousRow', 'KP_UP', 'selectPreviousRow', 'shift UP', 'selectPreviousRowExtendSelection', 'shift KP_UP', 'selectPreviousRowExtendSelection', 'ctrl shift UP', 'selectPreviousRowExtendSelection', 'ctrl shift KP_UP', 'selectPreviousRowExtendSelection', 'ctrl UP', 'selectPreviousRowChangeLead', 'ctrl KP_UP', 'selectPreviousRowChangeLead', 'HOME', 'selectFirstColumn', 'shift HOME', 'selectFirstColumnExtendSelection', 'ctrl shift HOME', 'selectFirstRowExtendSelection', 'ctrl HOME', 'selectFirstRow', 'END', 'selectLastColumn', 'shift END', 'selectLastColumnExtendSelection', 'ctrl shift END', 'selectLastRowExtendSelection', 'ctrl END', 'selectLastRow', 'PAGE_UP', 'scrollUpChangeSelection', 'shift PAGE_UP', 'scrollUpExtendSelection', 'ctrl shift PAGE_UP', 'scrollLeftExtendSelection', 'ctrl PAGE_UP', 'scrollLeftChangeSelection', 'PAGE_DOWN', 'scrollDownChangeSelection', 'shift PAGE_DOWN', 'scrollDownExtendSelection', 'ctrl shift PAGE_DOWN', 'scrollRightExtendSelection', 'ctrl PAGE_DOWN', 'scrollRightChangeSelection', 'TAB', 'selectNextColumnCell', 'shift TAB', 'selectPreviousColumnCell', 'ENTER', 'selectNextRowCell', 'shift ENTER', 'selectPreviousRowCell', 'ctrl A', 'selectAll', 'ctrl SLASH', 'selectAll', 'ctrl BACK_SLASH', 'clearSelection', 'ESCAPE', 'cancel', 'F2', 'startEditing', 'SPACE', 'addToSelection', 'ctrl SPACE', 'toggleAndAnchor', 'shift SPACE', 'extendTo', 'ctrl shift SPACE', 'moveSelectionTo', 'F8', 'focusHeader']), 'Table.ancestorInputMap.RightToLeft', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['RIGHT', 'selectPreviousColumn', 'KP_RIGHT', 'selectPreviousColumn', 'shift RIGHT', 'selectPreviousColumnExtendSelection', 'shift KP_RIGHT', 'selectPreviousColumnExtendSelection', 'ctrl shift RIGHT', 'selectPreviousColumnExtendSelection', 'ctrl shift KP_RIGHT', 'selectPreviousColumnExtendSelection', 'ctrl RIGHT', 'selectPreviousColumnChangeLead', 'ctrl KP_RIGHT', 'selectPreviousColumnChangeLead', 'LEFT', 'selectNextColumn', 'KP_LEFT', 'selectNextColumn', 'shift LEFT', 'selectNextColumnExtendSelection', 'shift KP_LEFT', 'selectNextColumnExtendSelection', 'ctrl shift LEFT', 'selectNextColumnExtendSelection', 'ctrl shift KP_LEFT', 'selectNextColumnExtendSelection', 'ctrl LEFT', 'selectNextColumnChangeLead', 'ctrl KP_LEFT', 'selectNextColumnChangeLead', 'ctrl PAGE_UP', 'scrollRightChangeSelection', 'ctrl PAGE_DOWN', 'scrollLeftChangeSelection', 'ctrl shift PAGE_UP', 'scrollRightExtendSelection', 'ctrl shift PAGE_DOWN', 'scrollLeftExtendSelection']), 'Table.ascendingSortIcon', (t) => new SortArrowIcon()._SortArrowIcon$boolean$String(true, 'Table.sortIconColor'), 'Table.descendingSortIcon', (t) => new SortArrowIcon()._SortArrowIcon$boolean$String(false, 'Table.sortIconColor'), 'Table.sortIconColor', controlShadow, 'TableHeader.font', dialogPlain12, 'TableHeader.foreground', controlText, 'TableHeader.background', control, 'TableHeader.cellBorder', tableHeaderBorder, 'TableHeader.focusCellBackground', table.getColor$Object('text'), 'TableHeader.focusCellForeground', null, 'TableHeader.focusCellBorder', null, 'TableHeader.ancestorInputMap', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['SPACE', 'toggleSortOrder', 'LEFT', 'selectColumnToLeft', 'KP_LEFT', 'selectColumnToLeft', 'RIGHT', 'selectColumnToRight', 'KP_RIGHT', 'selectColumnToRight', 'alt LEFT', 'moveColumnLeft', 'alt KP_LEFT', 'moveColumnLeft', 'alt RIGHT', 'moveColumnRight', 'alt KP_RIGHT', 'moveColumnRight', 'alt shift LEFT', 'resizeLeft', 'alt shift KP_LEFT', 'resizeLeft', 'alt shift RIGHT', 'resizeRight', 'alt shift KP_RIGHT', 'resizeRight', 'ESCAPE', 'focusTable']), 'TextField.font', sansSerifPlain12, 'TextField.background', window, 'TextField.foreground', textText, 'TextField.shadow', controlShadow, 'TextField.darkShadow', controlDkShadow, 'TextField.light', controlHighlight, 'TextField.highlight', controlLtHighlight, 'TextField.inactiveForeground', textInactiveText, 'TextField.inactiveBackground', control, 'TextField.selectionBackground', textHighlight, 'TextField.selectionForeground', textHighlightText, 'TextField.caretForeground', textText, 'TextField.caretBlinkRate', caretBlinkRate, 'TextField.border', textFieldBorder, 'TextField.margin', zeroInsets, 'FormattedTextField.font', sansSerifPlain12, 'FormattedTextField.background', window, 'FormattedTextField.foreground', textText, 'FormattedTextField.inactiveForeground', textInactiveText, 'FormattedTextField.inactiveBackground', control, 'FormattedTextField.selectionBackground', textHighlight, 'FormattedTextField.selectionForeground', textHighlightText, 'FormattedTextField.caretForeground', textText, 'FormattedTextField.caretBlinkRate', caretBlinkRate, 'FormattedTextField.border', textFieldBorder, 'FormattedTextField.margin', zeroInsets, 'FormattedTextField.focusInputMap', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['ctrl C', DefaultEditorKit.copyAction, 'ctrl V', DefaultEditorKit.pasteAction, 'ctrl X', DefaultEditorKit.cutAction, 'COPY', DefaultEditorKit.copyAction, 'PASTE', DefaultEditorKit.pasteAction, 'CUT', DefaultEditorKit.cutAction, 'control INSERT', DefaultEditorKit.copyAction, 'shift INSERT', DefaultEditorKit.pasteAction, 'shift DELETE', DefaultEditorKit.cutAction, 'shift LEFT', DefaultEditorKit.selectionBackwardAction, 'shift KP_LEFT', DefaultEditorKit.selectionBackwardAction, 'shift RIGHT', DefaultEditorKit.selectionForwardAction, 'shift KP_RIGHT', DefaultEditorKit.selectionForwardAction, 'ctrl LEFT', DefaultEditorKit.previousWordAction, 'ctrl KP_LEFT', DefaultEditorKit.previousWordAction, 'ctrl RIGHT', DefaultEditorKit.nextWordAction, 'ctrl KP_RIGHT', DefaultEditorKit.nextWordAction, 'ctrl shift LEFT', DefaultEditorKit.selectionPreviousWordAction, 'ctrl shift KP_LEFT', DefaultEditorKit.selectionPreviousWordAction, 'ctrl shift RIGHT', DefaultEditorKit.selectionNextWordAction, 'ctrl shift KP_RIGHT', DefaultEditorKit.selectionNextWordAction, 'ctrl A', DefaultEditorKit.selectAllAction, 'HOME', DefaultEditorKit.beginLineAction, 'END', DefaultEditorKit.endLineAction, 'shift HOME', DefaultEditorKit.selectionBeginLineAction, 'shift END', DefaultEditorKit.selectionEndLineAction, 'BACK_SPACE', DefaultEditorKit.deletePrevCharAction, 'shift BACK_SPACE', DefaultEditorKit.deletePrevCharAction, 'ctrl H', DefaultEditorKit.deletePrevCharAction, 'DELETE', DefaultEditorKit.deleteNextCharAction, 'ctrl DELETE', DefaultEditorKit.deleteNextWordAction, 'ctrl BACK_SPACE', DefaultEditorKit.deletePrevWordAction, 'RIGHT', DefaultEditorKit.forwardAction, 'LEFT', DefaultEditorKit.backwardAction, 'KP_RIGHT', DefaultEditorKit.forwardAction, 'KP_LEFT', DefaultEditorKit.backwardAction, 'ENTER', JTextField.notifyAction, 'ctrl BACK_SLASH', 'unselect', 'control shift O', 'toggle-componentOrientation', 'ESCAPE', 'reset-field-edit', 'UP', 'increment', 'KP_UP', 'increment', 'DOWN', 'decrement', 'KP_DOWN', 'decrement']), 'PasswordField.font', monospacedPlain12, 'PasswordField.background', window, 'PasswordField.foreground', textText, 'PasswordField.inactiveForeground', textInactiveText, 'PasswordField.inactiveBackground', control, 'PasswordField.selectionBackground', textHighlight, 'PasswordField.selectionForeground', textHighlightText, 'PasswordField.caretForeground', textText, 'PasswordField.caretBlinkRate', caretBlinkRate, 'PasswordField.border', textFieldBorder, 'PasswordField.margin', zeroInsets, 'PasswordField.echoChar', 42 /* \u002a */, 'TextArea.font', monospacedPlain12, 'TextArea.background', window, 'TextArea.foreground', textText, 'TextArea.inactiveForeground', textInactiveText, 'TextArea.selectionBackground', textHighlight, 'TextArea.selectionForeground', textHighlightText, 'TextArea.caretForeground', textText, 'TextArea.caretBlinkRate', caretBlinkRate, 'TextArea.border', marginBorder, 'TextArea.margin', zeroInsets, 'TextPane.font', serifPlain12, 'TextPane.background', white, 'TextPane.foreground', textText, 'TextPane.selectionBackground', textHighlight, 'TextPane.selectionForeground', textHighlightText, 'TextPane.caretForeground', textText, 'TextPane.caretBlinkRate', caretBlinkRate, 'TextPane.inactiveForeground', textInactiveText, 'TextPane.border', marginBorder, 'TextPane.margin', editorMargin, 'EditorPane.font', serifPlain12, 'EditorPane.background', white, 'EditorPane.foreground', textText, 'EditorPane.selectionBackground', textHighlight, 'EditorPane.selectionForeground', textHighlightText, 'EditorPane.caretForeground', textText, 'EditorPane.caretBlinkRate', caretBlinkRate, 'EditorPane.inactiveForeground', textInactiveText, 'EditorPane.border', marginBorder, 'EditorPane.margin', editorMargin, 'html.pendingImage', SwingUtilities2.makeIcon$Class$Class$String($J.getClass(this), $J.cls(BasicLookAndFeel), 'icons/image-delayed.png'), 'html.missingImage', SwingUtilities2.makeIcon$Class$Class$String($J.getClass(this), $J.cls(BasicLookAndFeel), 'icons/image-failed.png'), 'TitledBorder.font', dialogPlain12, 'TitledBorder.titleColor', controlText, 'TitledBorder.border', etchedBorder, 'ToolBar.font', dialogPlain12, 'ToolBar.background', control, 'ToolBar.foreground', controlText, 'ToolBar.shadow', controlShadow, 'ToolBar.darkShadow', controlDkShadow, 'ToolBar.light', controlHighlight, 'ToolBar.highlight', controlLtHighlight, 'ToolBar.dockingBackground', control, 'ToolBar.dockingForeground', red, 'ToolBar.floatingBackground', control, 'ToolBar.floatingForeground', darkGray, 'ToolBar.border', etchedBorder, 'ToolBar.separatorSize', toolBarSeparatorSize, 'ToolBar.ancestorInputMap', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['UP', 'navigateUp', 'KP_UP', 'navigateUp', 'DOWN', 'navigateDown', 'KP_DOWN', 'navigateDown', 'LEFT', 'navigateLeft', 'KP_LEFT', 'navigateLeft', 'RIGHT', 'navigateRight', 'KP_RIGHT', 'navigateRight']), 'ToolTip.font', sansSerifPlain12, 'ToolTip.background', table.get('info'), 'ToolTip.foreground', table.get('infoText'), 'ToolTip.border', blackLineBorder, 'ToolTipManager.enableToolTipMode', 'allWindows', 'Tree.paintLines', true, 'Tree.lineTypeDashed', false, 'Tree.font', dialogPlain12, 'Tree.background', window, 'Tree.foreground', textText, 'Tree.hash', gray, 'Tree.textForeground', textText, 'Tree.textBackground', table.get('text'), 'Tree.selectionForeground', textHighlightText, 'Tree.selectionBackground', textHighlight, 'Tree.selectionBorderColor', black, 'Tree.dropLineColor', controlShadow, 'Tree.editorBorder', blackLineBorder, 'Tree.leftChildIndent', 7, 'Tree.rightChildIndent', 13, 'Tree.rowHeight', 16, 'Tree.scrollsOnExpand', true, 'Tree.openIcon', SwingUtilities2.makeIcon$Class$Class$String($J.getClass(this), $J.cls(BasicLookAndFeel), 'icons/TreeOpen.gif'), 'Tree.closedIcon', SwingUtilities2.makeIcon$Class$Class$String($J.getClass(this), $J.cls(BasicLookAndFeel), 'icons/TreeClosed.gif'), 'Tree.leafIcon', SwingUtilities2.makeIcon$Class$Class$String($J.getClass(this), $J.cls(BasicLookAndFeel), 'icons/TreeLeaf.gif'), 'Tree.expandedIcon', null, 'Tree.collapsedIcon', null, 'Tree.changeSelectionWithFocus', true, 'Tree.drawsFocusBorderAroundIcon', false, 'Tree.timeFactor', oneThousand, 'Tree.focusInputMap', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['ctrl C', 'copy', 'ctrl V', 'paste', 'ctrl X', 'cut', 'COPY', 'copy', 'PASTE', 'paste', 'CUT', 'cut', 'control INSERT', 'copy', 'shift INSERT', 'paste', 'shift DELETE', 'cut', 'UP', 'selectPrevious', 'KP_UP', 'selectPrevious', 'shift UP', 'selectPreviousExtendSelection', 'shift KP_UP', 'selectPreviousExtendSelection', 'ctrl shift UP', 'selectPreviousExtendSelection', 'ctrl shift KP_UP', 'selectPreviousExtendSelection', 'ctrl UP', 'selectPreviousChangeLead', 'ctrl KP_UP', 'selectPreviousChangeLead', 'DOWN', 'selectNext', 'KP_DOWN', 'selectNext', 'shift DOWN', 'selectNextExtendSelection', 'shift KP_DOWN', 'selectNextExtendSelection', 'ctrl shift DOWN', 'selectNextExtendSelection', 'ctrl shift KP_DOWN', 'selectNextExtendSelection', 'ctrl DOWN', 'selectNextChangeLead', 'ctrl KP_DOWN', 'selectNextChangeLead', 'RIGHT', 'selectChild', 'KP_RIGHT', 'selectChild', 'LEFT', 'selectParent', 'KP_LEFT', 'selectParent', 'PAGE_UP', 'scrollUpChangeSelection', 'shift PAGE_UP', 'scrollUpExtendSelection', 'ctrl shift PAGE_UP', 'scrollUpExtendSelection', 'ctrl PAGE_UP', 'scrollUpChangeLead', 'PAGE_DOWN', 'scrollDownChangeSelection', 'shift PAGE_DOWN', 'scrollDownExtendSelection', 'ctrl shift PAGE_DOWN', 'scrollDownExtendSelection', 'ctrl PAGE_DOWN', 'scrollDownChangeLead', 'HOME', 'selectFirst', 'shift HOME', 'selectFirstExtendSelection', 'ctrl shift HOME', 'selectFirstExtendSelection', 'ctrl HOME', 'selectFirstChangeLead', 'END', 'selectLast', 'shift END', 'selectLastExtendSelection', 'ctrl shift END', 'selectLastExtendSelection', 'ctrl END', 'selectLastChangeLead', 'F2', 'startEditing', 'ctrl A', 'selectAll', 'ctrl SLASH', 'selectAll', 'ctrl BACK_SLASH', 'clearSelection', 'ctrl LEFT', 'scrollLeft', 'ctrl KP_LEFT', 'scrollLeft', 'ctrl RIGHT', 'scrollRight', 'ctrl KP_RIGHT', 'scrollRight', 'SPACE', 'addToSelection', 'ctrl SPACE', 'toggleAndAnchor', 'shift SPACE', 'extendTo', 'ctrl shift SPACE', 'moveSelectionTo']), 'Tree.focusInputMap.RightToLeft', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['RIGHT', 'selectParent', 'KP_RIGHT', 'selectParent', 'LEFT', 'selectChild', 'KP_LEFT', 'selectChild']), 'Tree.ancestorInputMap', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['ESCAPE', 'cancel']), 'RootPane.ancestorInputMap', new UIDefaults$LazyInputMap()._UIDefaults$LazyInputMap(['shift F10', 'postPopup', 'CONTEXT_MENU', 'postPopup']), 'RootPane.defaultButtonWindowKeyBindings', ['ENTER', 'press', 'released ENTER', 'release', 'ctrl ENTER', 'press', 'ctrl released ENTER', 'release']];
    table.putDefaults(defaults);
  }
  static getFocusAcceleratorKeyMask(): number {
    let tk = Toolkit.getDefaultToolkit();
    if ($J.isa(tk, SunToolkit)) {
      return (tk).getFocusAcceleratorKeyMask();
    }
    return ActionEvent.ALT_MASK;
  }
  /**
   * Returns the ui that is of type <code>klass</code>, or null if
   * one can not be found.
   */
  static getUIOfType(ui: ComponentUI, klass: JClass<any>): any {
    if (klass.isInstance(ui)) {
      return ui;
    }
    return null;
  }
  /**
   * Returns an <code>ActionMap</code> containing the audio actions
   * for this look and feel.
   * <P>
   * The returned <code>ActionMap</code> contains <code>Actions</code> that
   * embody the ability to render an auditory cue. These auditory
   * cues map onto user and system activities that may be useful
   * for an end user to know about (such as a dialog box appearing).
   * <P>
   * At the appropriate time,
   * the {@code ComponentUI} is responsible for obtaining an
   * <code>Action</code> out of the <code>ActionMap</code> and passing
   * it to <code>playSound</code>.
   * <P>
   * This method first looks up the {@code ActionMap} from the
   * defaults using the key {@code "AuditoryCues.actionMap"}.
   * <p>
   * If the value is {@code non-null}, it is returned. If the value
   * of the default {@code "AuditoryCues.actionMap"} is {@code null}
   * and the value of the default {@code "AuditoryCues.cueList"} is
   * {@code non-null}, an {@code ActionMapUIResource} is created and
   * populated. Population is done by iterating over each of the
   * elements of the {@code "AuditoryCues.cueList"} array, and
   * invoking {@code createAudioAction()} to create an {@code
   * Action} for each element.  The resulting {@code Action} is
   * placed in the {@code ActionMapUIResource}, using the array
   * element as the key.  For example, if the {@code
   * "AuditoryCues.cueList"} array contains a single-element, {@code
   * "audioKey"}, the {@code ActionMapUIResource} is created, then
   * populated by way of {@code actionMap.put(cueList[0],
   * createAudioAction(cueList[0]))}.
   * <p>
   * If the value of the default {@code "AuditoryCues.actionMap"} is
   * {@code null} and the value of the default
   * {@code "AuditoryCues.cueList"} is {@code null}, an empty
   * {@code ActionMapUIResource} is created.
   *
   *
   * @return      an ActionMap containing {@code Actions}
   *              responsible for playing auditory cues
   * @throws ClassCastException if the value of the
   *         default {@code "AuditoryCues.actionMap"} is not an
   *         {@code ActionMap}, or the value of the default
   *         {@code "AuditoryCues.cueList"} is not an {@code Object[]}
   * @see #createAudioAction
   * @see #playSound(Action)
   * @since 1.4
   */
  getAudioActionMap(): ActionMap {
    let audioActionMap = UIManager.get$Object('AuditoryCues.actionMap');
    if (audioActionMap == null) {
      let acList = UIManager.get$Object('AuditoryCues.cueList');
      if (acList != null) {
        audioActionMap = new ActionMapUIResource()._ActionMapUIResource();
        for (let counter = (acList.length - 1) | 0; counter >= 0; counter--) {
          audioActionMap.put$Object$Action(acList[counter], this.createAudioAction(acList[counter]));
        }
      }
      UIManager.getLookAndFeelDefaults().put('AuditoryCues.actionMap', audioActionMap);
    }
    return audioActionMap;
  }
  /**
   * Creates and returns an {@code Action} used to play a sound.
   * <p>
   * If {@code key} is {@code non-null}, an {@code Action} is created
   * using the value from the defaults with key {@code key}. The value
   * identifies the sound resource to load when
   * {@code actionPerformed} is invoked on the {@code Action}. The
   * sound resource is loaded into a {@code byte[]} by way of
   * {@code getClass().getResourceAsStream()}.
   *
   * @param key the key identifying the audio action
   * @return      an {@code Action} used to play the source, or {@code null}
   *              if {@code key} is {@code null}
   * @see #playSound(Action)
   * @since 1.4
   */
  createAudioAction(key: any): Action {
    if (key != null) {
      let audioKey = key;
      let audioValue = UIManager.get$Object(key);
      return new BasicLookAndFeel$AudioAction().$o(this)._BasicLookAndFeel$AudioAction(audioKey, audioValue);
    } else {
      return null;
    }
  }
  /**
   * Utility method that loads audio bits for the specified
   * <code>soundFile</code> filename. If this method is unable to
   * build a viable path name from the <code>baseClass</code> and
   * <code>soundFile</code> passed into this method, it will
   * return <code>null</code>.
   *
   * @param soundFile    the name of the audio file to be retrieved
   *                     from disk
   * @return             A byte[] with audio data or null
   * @since 1.4
   */
  loadAudioData(soundFile: string): number[] {
    if (soundFile == null) {
      return null;
    }
    let buffer = AccessController.doPrivileged(new (BasicLookAndFeel$3())().$o(this).$c(soundFile));
    if (buffer == null) {
      $J.err.println($J.getClass(this).getName() + '/' + soundFile + ' not found.');
      return null;
    }
    if (buffer.length === 0) {
      $J.err.println('warning: ' + soundFile + ' is zero-length');
      return null;
    }
    return buffer;
  }
  /**
   * If necessary, invokes {@code actionPerformed} on
   * {@code audioAction} to play a sound.
   * The {@code actionPerformed} method is invoked if the value of
   * the {@code "AuditoryCues.playList"} default is a {@code
   * non-null} {@code Object[]} containing a {@code String} entry
   * equal to the name of the {@code audioAction}.
   *
   * @param audioAction an Action that knows how to render the audio
   *                    associated with the system or user activity
   *                    that is occurring; a value of {@code null}, is
   *                    ignored
   * @throws ClassCastException if {@code audioAction} is {@code non-null}
   *         and the value of the default {@code "AuditoryCues.playList"}
   *         is not an {@code Object[]}
   * @since 1.4
   */
  playSound(audioAction: Action): void {
    if (audioAction != null) {
      let audioStrings = UIManager.get$Object('AuditoryCues.playList');
      if (audioStrings != null) {
        let audioCues = new HashSet();
        for (let audioString of audioStrings) {
          audioCues.add(audioString);
        }
        let actionName = audioAction.getValue$String(Action.NAME);
        if (audioCues.contains(actionName)) {
          audioAction.actionPerformed(new ActionEvent()._ActionEvent$Object$int$String(this, ActionEvent.ACTION_PERFORMED, actionName));
        }
      }
    }
  }
  /**
   * Sets the parent of the passed in ActionMap to be the audio action
   * map.
   */
  static installAudioActionMap(map: ActionMap): void {
    let laf = UIManager.getLookAndFeel();
    if (laf instanceof BasicLookAndFeel) {
      map.setParent((laf).getAudioActionMap());
    }
  }
  /**
   * Helper method to play a named sound.
   *
   * @param c JComponent to play the sound for.
   * @param actionKey Key for the sound.
   */
  static playSound(c: JComponent, actionKey: any): void {
    let laf = UIManager.getLookAndFeel();
    if (laf instanceof BasicLookAndFeel) {
      let map = c.getActionMap$();
      if (map != null) {
        let audioAction = map.get(actionKey);
        if (audioAction != null) {
          (laf).playSound(audioAction);
        }
      }
    }
  }
}

/**
 * Pass the name String to the super constructor. This is used
 * later to identify the Action and decide whether to play it or
 * not. Store the resource String. I is used to get the audio
 * resource. In this case, the resource is an audio file.
 *
 * @since 1.4
 */
export class BasicLookAndFeel$AudioAction extends AbstractAction {
  audioResource: string = null;
  audioBuffer: number[] = null;
  /**
   * The String is the name of the Action and
   * points to the audio resource.
   * The byte[] is a buffer of the audio bits.
   */
  _BasicLookAndFeel$AudioAction(name: string, resource: string): this {
    this._AbstractAction$String(name);
    this.audioResource = resource;
    return this;
  }
  actionPerformed(e: ActionEvent): void {
    if (this.audioBuffer == null) {
      this.audioBuffer = this.$outer.loadAudioData(this.audioResource);
    }
    if (this.audioBuffer != null) {
      this.cancelCurrentSound(null);
      try {
        let soundStream = AudioSystem.getAudioInputStream(new ByteArrayInputStream(this.audioBuffer));
        let info = new DataLine_Info($J.cls(Clip), soundStream.getFormat());
        let clip = AudioSystem.getLine(info);
        clip.open(soundStream);
        clip.addLineListener(this);
        {
          this.$outer.clipPlaying = clip;
        }
        clip.start();
      } catch ($e1) {
        if ($J.isa($e1, Exception)) {
          let ex = $J.exc($e1);
        } else {
          throw $e1;
        }
      }
    }
  }
  update(event: LineEvent): void {
    if (event.getType() === LineEvent_Type.STOP) {
      this.cancelCurrentSound(event.getLine());
    }
  }
  /**
   * If the parameter is null, or equal to the currently
   * playing sound, then cancel the currently playing sound.
   */
  cancelCurrentSound(clip: Clip): void {
    let lastClip = null;
    {
      if (clip == null || clip === this.$outer.clipPlaying) {
        lastClip = this.$outer.clipPlaying;
        this.$outer.clipPlaying = null;
      }
    }
    if (lastClip != null) {
      lastClip.removeLineListener(this);
      lastClip.close();
    }
  }
}

/**
 * This class contains listener that watches for all the mouse
 * events that can possibly invoke popup on the component
 */
export class BasicLookAndFeel$AWTEventHelper extends JObject {
  _BasicLookAndFeel$AWTEventHelper(): this {
    AccessController.doPrivileged(this);
    return this;
  }
  run(): any {
    let tk = Toolkit.getDefaultToolkit();
    if (this.$outer.invocator == null) {
      tk.addAWTEventListener(this, AWTEvent.MOUSE_EVENT_MASK);
    } else {
      tk.removeAWTEventListener(this.$outer.invocator);
    }
    return null;
  }
  eventDispatched(ev: AWTEvent): void {
    let eventID = ev.getID();
    if (($J.land(eventID, AWTEvent.MOUSE_EVENT_MASK)) !== 0) {
      let me = ev;
      if (me.isPopupTrigger()) {
        let elems = MenuSelectionManager.defaultManager().getSelectedPath();
        if (elems != null && elems.length !== 0) {
          return;
        }
        let c = me.getSource();
        let src = null;
        if (c instanceof JComponent) {
          src = c;
        } else if (c instanceof BasicSplitPaneDivider) {
          src = (c).getParent();
        }
        if (src != null) {
          let componentPopupMenu = src.getComponentPopupMenu();
          if (componentPopupMenu != null) {
            let pt = src.getPopupLocation$MouseEvent(me);
            if (pt == null) {
              pt = me.getPoint();
              pt = SwingUtilities.convertPoint$Component$Point$Component(c, pt, src);
            }
            componentPopupMenu.show$Component$int$int(src, pt.x_, pt.y_);
            me.consume();
          }
        }
      }
    }
    var parent, internalFrame;
    if (eventID === MouseEvent.MOUSE_PRESSED && (parent = ev.getSource()) instanceof Component) {
      var internalFrame;
      while (parent != null && !(parent instanceof Window)) {
        var internalFrame;
        if ((internalFrame = parent) instanceof JInternalFrame) {
          try {
            internalFrame.setSelected(true);
          } catch ($e2) {
            if ($J.isa($e2, PropertyVetoException)) {
              let ignored = $J.exc($e2);
            } else {
              throw $e2;
            }
          }
        }
        parent = parent.getParent();
      }
    }
  }
}

let $BasicLookAndFeel$2: any = null;
/** An anonymous class (BasicLookAndFeel.java:595). */
function BasicLookAndFeel$2(): any {
  return $BasicLookAndFeel$2 ??= $J.local(class extends JObject {
    createValue(table: UIDefaults): any {
      return new DefaultListCellRenderer$UIResource()._DefaultListCellRenderer$UIResource();
    }
  }, 'javax.swing.plaf.basic.BasicLookAndFeel$2', ['javax.swing.UIDefaults$ActiveValue']);
}

let $BasicLookAndFeel$3: any = null;
/** An anonymous class (BasicLookAndFeel.java:2085). */
function BasicLookAndFeel$3(): any {
  return $BasicLookAndFeel$3 ??= $J.local(class extends JObject {
    run(): number[] {
      try {
        let resource = this.$outer.getClass().getResourceAsStream(this.$cv_soundFile);
        if (resource == null) {
          return null;
        }
        {
          const in$ = new BufferedInputStream(resource);
          try {
            return in$.readAllBytes();
          } finally {
            if (in$ != null) in$.close();
          }
        }
      } catch ($e0) {
        if ($J.isa($e0, IOException)) {
          let ioe = $J.exc($e0);
          $J.err.println(ioe.toString());
          return null;
        } else {
          throw $e0;
        }
      }
    }
    $c($soundFile): this {
      this.$cv_soundFile = $soundFile;
      return this;
    }
  }, 'javax.swing.plaf.basic.BasicLookAndFeel$3', ['java.security.PrivilegedAction']);
}

$J.define(BasicLookAndFeel, 'javax.swing.plaf.basic.BasicLookAndFeel', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'javax.swing.LookAndFeel', ctors: { '': '_BasicLookAndFeel' }, meths: { 'initResourceBundle(javax.swing.UIDefaults)': 'initResourceBundle$UIDefaults$BasicLookAndFeel' } });
$J.define(BasicLookAndFeel$AudioAction, 'javax.swing.plaf.basic.BasicLookAndFeel$AudioAction', { kind: 'class', ifaces: ['javax.sound.sampled.LineListener'], sup: 'javax.swing.AbstractAction', ctors: { 'java.lang.String,java.lang.String': '_BasicLookAndFeel$AudioAction' }, inner: true });
$J.define(BasicLookAndFeel$AWTEventHelper, 'javax.swing.plaf.basic.BasicLookAndFeel$AWTEventHelper', { kind: 'class', ifaces: ['java.awt.event.AWTEventListener', 'java.security.PrivilegedAction'], sup: 'java.lang.Object', ctors: { '': '_BasicLookAndFeel$AWTEventHelper' }, inner: true });
$J.module(() => {
  AWTEvent = $J.load('java.awt.AWTEvent');
  Color = $J.load('java.awt.Color');
  Component = $J.load('java.awt.Component');
  Dimension = $J.load('java.awt.Dimension');
  Font = $J.load('java.awt.Font');
  Window = $J.load('java.awt.Window');
  ActionEvent = $J.load('java.awt.event.ActionEvent');
  MouseEvent = $J.load('java.awt.event.MouseEvent');
  PropertyVetoException = $J.load('java.beans.PropertyVetoException');
  Action = $J.load('javax.swing.Action');
  DefaultListCellRenderer$UIResource = $J.load('javax.swing.DefaultListCellRenderer$UIResource');
  JComponent = $J.load('javax.swing.JComponent');
  JInternalFrame = $J.load('javax.swing.JInternalFrame');
  JTextField = $J.load('javax.swing.JTextField');
  MenuSelectionManager = $J.load('javax.swing.MenuSelectionManager');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIDefaults = $J.load('javax.swing.UIDefaults');
  UIDefaults$LazyInputMap = $J.load('javax.swing.UIDefaults$LazyInputMap');
  UIManager = $J.load('javax.swing.UIManager');
  BevelBorder = $J.load('javax.swing.border.BevelBorder');
  ActionMapUIResource = $J.load('javax.swing.plaf.ActionMapUIResource');
  BorderUIResource = $J.load('javax.swing.plaf.BorderUIResource');
  BorderUIResource$BevelBorderUIResource = $J.load('javax.swing.plaf.BorderUIResource$BevelBorderUIResource');
  BorderUIResource$EmptyBorderUIResource = $J.load('javax.swing.plaf.BorderUIResource$EmptyBorderUIResource');
  BorderUIResource$LineBorderUIResource = $J.load('javax.swing.plaf.BorderUIResource$LineBorderUIResource');
  ColorUIResource = $J.load('javax.swing.plaf.ColorUIResource');
  DimensionUIResource = $J.load('javax.swing.plaf.DimensionUIResource');
  FontUIResource = $J.load('javax.swing.plaf.FontUIResource');
  InsetsUIResource = $J.load('javax.swing.plaf.InsetsUIResource');
  BasicBorders = $J.load('javax.swing.plaf.basic.BasicBorders');
  BasicBorders$MarginBorder = $J.load('javax.swing.plaf.basic.BasicBorders$MarginBorder');
  BasicIconFactory = $J.load('javax.swing.plaf.basic.BasicIconFactory');
  BasicPopupMenuUI = $J.load('javax.swing.plaf.basic.BasicPopupMenuUI');
  BasicSplitPaneDivider = $J.load('javax.swing.plaf.basic.BasicSplitPaneDivider');
  DefaultEditorKit = $J.load('javax.swing.text.DefaultEditorKit');
  SwingAccessor = $J.load('sun.swing.SwingAccessor');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
  SortArrowIcon = $J.load('sun.swing.icon.SortArrowIcon');
});
