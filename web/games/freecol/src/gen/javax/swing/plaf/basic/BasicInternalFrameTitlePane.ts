// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicInternalFrameTitlePane.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JBoolean, JObject, JString, NumberFormatException } from '../../../../../jre/index.ts';
import { JComponent } from '../../JComponent.ts';
import { AbstractAction } from '../../AbstractAction.ts';
import { JMenuBar } from '../../JMenuBar.ts';
import { JButton } from '../../JButton.ts';

let Dimension, Image, Insets, Rectangle, RenderingHints, PropertyVetoException, ImageIcon, JInternalFrame, JMenu, JSeparator, UIManager, ActionMapUIResource, BasicGraphicsUtils, DefaultLookup, SwingUtilities2;

/**
 * The class that manages a basic title bar
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
 * @author David Kloba
 * @author Steve Wilson
 */
export class BasicInternalFrameTitlePane extends JComponent {
  /**
   * The instance of {@code JMenuBar}.
   */
  menuBar: JMenuBar = null;
  /**
   * The iconify button.
   */
  iconButton: JButton = null;
  /**
   * The maximize button.
   */
  maxButton: JButton = null;
  /**
   * The close button.
   */
  closeButton: JButton = null;
  /**
   * The instance of {@code JMenu}.
   */
  windowMenu: JMenu = null;
  /**
   * The instance of {@code JInternalFrame}.
   */
  frame: JInternalFrame = null;
  /**
   * The color of a selected title.
   */
  selectedTitleColor: Color = null;
  /**
   * The color of a selected text.
   */
  selectedTextColor: Color = null;
  /**
   * The color of a not selected title.
   */
  notSelectedTitleColor: Color = null;
  /**
   * The color of a not selected text.
   */
  notSelectedTextColor: Color = null;
  /**
   * The maximize icon.
   */
  maxIcon: Icon = null;
  /**
   * The minimize icon.
   */
  minIcon: Icon = null;
  /**
   * The iconify icon.
   */
  iconIcon: Icon = null;
  /**
   * The close icon.
   */
  closeIcon: Icon = null;
  /**
   * The instance of a {@code PropertyChangeListener}.
   */
  propertyChangeListener: PropertyChangeListener = null;
  /**
   * The instance of a {@code CloseAction}.
   */
  closeAction: Action = null;
  /**
   * The instance of a {@code MaximizeAction}.
   */
  maximizeAction: Action = null;
  /**
   * The instance of an {@code IconifyAction}.
   */
  iconifyAction: Action = null;
  /**
   * The instance of a {@code RestoreAction}.
   */
  restoreAction: Action = null;
  /**
   * The instance of a {@code MoveAction}.
   */
  moveAction: Action = null;
  /**
   * The instance of a {@code SizeAction}.
   */
  sizeAction: Action = null;
  /**
   * The close button text property.
   */
  static CLOSE_CMD: string = null;
  /**
   * The minimize button text property.
   */
  static ICONIFY_CMD: string = null;
  /**
   * The restore button text property.
   */
  static RESTORE_CMD: string = null;
  /**
   * The maximize button text property.
   */
  static MAXIMIZE_CMD: string = null;
  /**
   * The move button text property.
   */
  static MOVE_CMD: string = null;
  /**
   * The size button text property.
   */
  static SIZE_CMD: string = null;
  closeButtonToolTip: string = null;
  iconButtonToolTip: string = null;
  restoreButtonToolTip: string = null;
  maxButtonToolTip: string = null;
  handler: BasicInternalFrameTitlePane$Handler = null;
  /**
   * Constructs a new instance of {@code BasicInternalFrameTitlePane}.
   *
   * @param f an instance of {@code JInternalFrame}
   */
  _BasicInternalFrameTitlePane(f: JInternalFrame): this {
    this._JComponent();
    this.frame = f;
    this.installTitlePane();
    return this;
  }
  /**
   * Installs the title pane.
   */
  installTitlePane(): void {
    this.installDefaults();
    this.installListeners();
    this.createActions();
    this.enableActions();
    this.createActionMap();
    this.setLayout(this.createLayout());
    this.assembleSystemMenu();
    this.createButtons();
    this.addSubComponents();
    this.updateProperties();
  }
  updateProperties(): void {
    this.putClientProperty(RenderingHints.KEY_TEXT_ANTIALIASING, this.frame.getClientProperty(RenderingHints.KEY_TEXT_ANTIALIASING));
    this.putClientProperty(RenderingHints.KEY_TEXT_LCD_CONTRAST, this.frame.getClientProperty(RenderingHints.KEY_TEXT_LCD_CONTRAST));
  }
  /**
   * Adds subcomponents.
   */
  addSubComponents(): void {
    this.add$Component(this.menuBar);
    this.add$Component(this.iconButton);
    this.add$Component(this.maxButton);
    this.add$Component(this.closeButton);
  }
  /**
   * Creates actions.
   */
  createActions(): void {
    this.maximizeAction = new BasicInternalFrameTitlePane$MaximizeAction().$o(this)._BasicInternalFrameTitlePane$MaximizeAction();
    this.iconifyAction = new BasicInternalFrameTitlePane$IconifyAction().$o(this)._BasicInternalFrameTitlePane$IconifyAction();
    this.closeAction = new BasicInternalFrameTitlePane$CloseAction().$o(this)._BasicInternalFrameTitlePane$CloseAction();
    this.restoreAction = new BasicInternalFrameTitlePane$RestoreAction().$o(this)._BasicInternalFrameTitlePane$RestoreAction();
    this.moveAction = new BasicInternalFrameTitlePane$MoveAction().$o(this)._BasicInternalFrameTitlePane$MoveAction();
    this.sizeAction = new BasicInternalFrameTitlePane$SizeAction().$o(this)._BasicInternalFrameTitlePane$SizeAction();
  }
  createActionMap(): ActionMap {
    let map = new ActionMapUIResource()._ActionMapUIResource();
    map.put$Object$Action('showSystemMenu', new BasicInternalFrameTitlePane$ShowSystemMenuAction().$o(this)._BasicInternalFrameTitlePane$ShowSystemMenuAction(true));
    map.put$Object$Action('hideSystemMenu', new BasicInternalFrameTitlePane$ShowSystemMenuAction().$o(this)._BasicInternalFrameTitlePane$ShowSystemMenuAction(false));
    return map;
  }
  /**
   * Registers listeners.
   */
  installListeners(): void {
    if (this.propertyChangeListener == null) {
      this.propertyChangeListener = this.createPropertyChangeListener();
    }
    this.frame.addPropertyChangeListener$PropertyChangeListener(this.propertyChangeListener);
  }
  /**
   * Unregisters listeners.
   */
  uninstallListeners(): void {
    this.frame.removePropertyChangeListener$PropertyChangeListener(this.propertyChangeListener);
    this.handler = null;
  }
  /**
   * Installs default properties.
   */
  installDefaults(): void {
    this.maxIcon = UIManager.getIcon$Object('InternalFrame.maximizeIcon');
    this.minIcon = UIManager.getIcon$Object('InternalFrame.minimizeIcon');
    this.iconIcon = UIManager.getIcon$Object('InternalFrame.iconifyIcon');
    this.closeIcon = UIManager.getIcon$Object('InternalFrame.closeIcon');
    this.selectedTitleColor = UIManager.getColor$Object('InternalFrame.activeTitleBackground');
    this.selectedTextColor = UIManager.getColor$Object('InternalFrame.activeTitleForeground');
    this.notSelectedTitleColor = UIManager.getColor$Object('InternalFrame.inactiveTitleBackground');
    this.notSelectedTextColor = UIManager.getColor$Object('InternalFrame.inactiveTitleForeground');
    this.setFont(UIManager.getFont$Object('InternalFrame.titleFont'));
    this.closeButtonToolTip = UIManager.getString$Object('InternalFrame.closeButtonToolTip');
    this.iconButtonToolTip = UIManager.getString$Object('InternalFrame.iconButtonToolTip');
    this.restoreButtonToolTip = UIManager.getString$Object('InternalFrame.restoreButtonToolTip');
    this.maxButtonToolTip = UIManager.getString$Object('InternalFrame.maxButtonToolTip');
  }
  /**
   * Uninstalls default properties.
   */
  uninstallDefaults(): void {
  }
  /**
   * Creates buttons.
   */
  createButtons(): void {
    this.iconButton = new BasicInternalFrameTitlePane$NoFocusButton()._BasicInternalFrameTitlePane$NoFocusButton('InternalFrameTitlePane.iconifyButtonAccessibleName', 'InternalFrameTitlePane.iconifyButtonOpacity');
    this.iconButton.addActionListener($J.fn(this.iconifyAction, 'actionPerformed'));
    if (this.iconButtonToolTip != null && this.iconButtonToolTip.length !== 0) {
      this.iconButton.setToolTipText(this.iconButtonToolTip);
    }
    this.maxButton = new BasicInternalFrameTitlePane$NoFocusButton()._BasicInternalFrameTitlePane$NoFocusButton('InternalFrameTitlePane.maximizeButtonAccessibleName', 'InternalFrameTitlePane.maximizeButtonOpacity');
    this.maxButton.addActionListener($J.fn(this.maximizeAction, 'actionPerformed'));
    this.closeButton = new BasicInternalFrameTitlePane$NoFocusButton()._BasicInternalFrameTitlePane$NoFocusButton('InternalFrameTitlePane.closeButtonAccessibleName', 'InternalFrameTitlePane.closeButtonOpacity');
    this.closeButton.addActionListener($J.fn(this.closeAction, 'actionPerformed'));
    if (this.closeButtonToolTip != null && this.closeButtonToolTip.length !== 0) {
      this.closeButton.setToolTipText(this.closeButtonToolTip);
    }
    this.setButtonIcons();
  }
  /**
   * Sets the button icons.
   */
  setButtonIcons(): void {
    if (this.frame.isIcon()) {
      if (this.minIcon != null) {
        this.iconButton.setIcon(this.minIcon);
      }
      if (this.restoreButtonToolTip != null && this.restoreButtonToolTip.length !== 0) {
        this.iconButton.setToolTipText(this.restoreButtonToolTip);
      }
      if (this.maxIcon != null) {
        this.maxButton.setIcon(this.maxIcon);
      }
      if (this.maxButtonToolTip != null && this.maxButtonToolTip.length !== 0) {
        this.maxButton.setToolTipText(this.maxButtonToolTip);
      }
    } else if (this.frame.isMaximum()) {
      if (this.iconIcon != null) {
        this.iconButton.setIcon(this.iconIcon);
      }
      if (this.iconButtonToolTip != null && this.iconButtonToolTip.length !== 0) {
        this.iconButton.setToolTipText(this.iconButtonToolTip);
      }
      if (this.minIcon != null) {
        this.maxButton.setIcon(this.minIcon);
      }
      if (this.restoreButtonToolTip != null && this.restoreButtonToolTip.length !== 0) {
        this.maxButton.setToolTipText(this.restoreButtonToolTip);
      }
    } else {
      if (this.iconIcon != null) {
        this.iconButton.setIcon(this.iconIcon);
      }
      if (this.iconButtonToolTip != null && this.iconButtonToolTip.length !== 0) {
        this.iconButton.setToolTipText(this.iconButtonToolTip);
      }
      if (this.maxIcon != null) {
        this.maxButton.setIcon(this.maxIcon);
      }
      if (this.maxButtonToolTip != null && this.maxButtonToolTip.length !== 0) {
        this.maxButton.setToolTipText(this.maxButtonToolTip);
      }
    }
    if (this.closeIcon != null) {
      this.closeButton.setIcon(this.closeIcon);
    }
  }
  /**
   * Assembles system menu.
   */
  assembleSystemMenu(): void {
    this.menuBar = this.createSystemMenuBar();
    this.windowMenu = this.createSystemMenu();
    this.menuBar.add$JMenu(this.windowMenu);
    this.addSystemMenuItems(this.windowMenu);
    this.enableActions();
  }
  /**
   * Adds system menu items to {@code systemMenu}.
   *
   * @param systemMenu an instance of {@code JMenu}
   */
  addSystemMenuItems(systemMenu: JMenu): void {
    let mi = systemMenu.add$Action(this.restoreAction);
    mi.setMnemonic$int(BasicInternalFrameTitlePane.getButtonMnemonic('restore'));
    mi = systemMenu.add$Action(this.moveAction);
    mi.setMnemonic$int(BasicInternalFrameTitlePane.getButtonMnemonic('move'));
    mi = systemMenu.add$Action(this.sizeAction);
    mi.setMnemonic$int(BasicInternalFrameTitlePane.getButtonMnemonic('size'));
    mi = systemMenu.add$Action(this.iconifyAction);
    mi.setMnemonic$int(BasicInternalFrameTitlePane.getButtonMnemonic('minimize'));
    mi = systemMenu.add$Action(this.maximizeAction);
    mi.setMnemonic$int(BasicInternalFrameTitlePane.getButtonMnemonic('maximize'));
    systemMenu.add$Component(new JSeparator()._JSeparator$());
    mi = systemMenu.add$Action(this.closeAction);
    mi.setMnemonic$int(BasicInternalFrameTitlePane.getButtonMnemonic('close'));
  }
  static getButtonMnemonic(button: string): number {
    try {
      return $J.parseInt(UIManager.getString$Object('InternalFrameTitlePane.' + button + 'Button.mnemonic'));
    } catch ($e0) {
      if ($J.isa($e0, NumberFormatException)) {
        let e = $J.exc($e0);
        return -1;
      } else {
        throw $e0;
      }
    }
  }
  /**
   * Returns a new instance of {@code JMenu}.
   *
   * @return a new instance of {@code JMenu}
   */
  createSystemMenu(): JMenu {
    return new JMenu()._JMenu$String('    ');
  }
  /**
   * Returns a new instance of {@code JMenuBar}.
   *
   * @return a new instance of {@code JMenuBar}
   */
  createSystemMenuBar(): JMenuBar {
    this.menuBar = new BasicInternalFrameTitlePane$SystemMenuBar().$o(this)._BasicInternalFrameTitlePane$SystemMenuBar();
    this.menuBar.setBorderPainted(false);
    return this.menuBar;
  }
  /**
   * Shows system menu.
   */
  showSystemMenu(): void {
    this.windowMenu.doClick$();
  }
  paintComponent(g: Graphics): void {
    this.paintTitleBackground(g);
    if (this.frame.getTitle() != null) {
      let isSelected = this.frame.isSelected();
      let f = g.getFont();
      g.setFont(this.getFont());
      if (isSelected) {
        g.setColor(this.selectedTextColor);
      } else {
        g.setColor(this.notSelectedTextColor);
      }
      let fm = SwingUtilities2.getFontMetrics$JComponent$Graphics(this.frame, g);
      let baseline = $J.idiv(((this.getHeight() + fm.getAscent() - fm.getLeading() - fm.getDescent()) | 0), 2);
      let titleX: number;
      let r = new Rectangle()._Rectangle$int$int$int$int(0, 0, 0, 0);
      if (this.frame.isIconifiable()) {
        r = this.iconButton.getBounds$();
      } else if (this.frame.isMaximizable()) {
        r = this.maxButton.getBounds$();
      } else if (this.frame.isClosable()) {
        r = this.closeButton.getBounds$();
      }
      let titleW: number;
      let title = this.frame.getTitle();
      if (BasicGraphicsUtils.isLeftToRight(this.frame)) {
        if (r.x_ === 0) {
          r.x_ = (this.frame.getWidth() - this.frame.getInsets$().right) | 0;
        }
        titleX = (this.menuBar.getX() + this.menuBar.getWidth() + 2) | 0;
        titleW = (r.x_ - titleX - 3) | 0;
        title = this.getTitle(this.frame.getTitle(), fm, titleW);
      } else {
        titleX = (this.menuBar.getX() - 2 - SwingUtilities2.stringWidth$JComponent$FontMetrics$String(this.frame, fm, title)) | 0;
      }
      SwingUtilities2.drawString$JComponent$Graphics$String$int$int(this.frame, g, title, titleX, baseline);
      g.setFont(f);
    }
  }
  /**
   * Invoked from paintComponent.
   * Paints the background of the titlepane.  All text and icons will
   * then be rendered on top of this background.
   * @param g the graphics to use to render the background
   * @since 1.4
   */
  paintTitleBackground(g: Graphics): void {
    let isSelected = this.frame.isSelected();
    if (isSelected) {
      g.setColor(this.selectedTitleColor);
    } else {
      g.setColor(this.notSelectedTitleColor);
    }
    g.fillRect(0, 0, this.getWidth(), this.getHeight());
  }
  /**
   * Returns the title.
   *
   * @param text a text
   * @param fm an instance of {@code FontMetrics}
   * @param availTextWidth an available text width
   * @return the title.
   */
  getTitle(text: string, fm: FontMetrics, availTextWidth: number): string {
    return SwingUtilities2.clipStringIfNecessary(this.frame, fm, text, availTextWidth);
  }
  /**
   * Enables actions.
   */
  enableActions(): void {
    this.restoreAction.setEnabled(this.frame.isMaximum() || this.frame.isIcon());
    this.maximizeAction.setEnabled((this.frame.isMaximizable() && !this.frame.isMaximum() && !this.frame.isIcon()) || (this.frame.isMaximizable() && this.frame.isIcon()));
    this.iconifyAction.setEnabled(this.frame.isIconifiable() && !this.frame.isIcon());
    this.closeAction.setEnabled(this.frame.isClosable());
    this.sizeAction.setEnabled(false);
    this.moveAction.setEnabled(false);
  }
  getHandler(): BasicInternalFrameTitlePane$Handler {
    if (this.handler == null) {
      this.handler = new BasicInternalFrameTitlePane$Handler().$o(this)._BasicInternalFrameTitlePane$Handler();
    }
    return this.handler;
  }
  /**
   * Returns an instance of {@code PropertyChangeListener}.
   *
   * @return an instance of {@code PropertyChangeListener}
   */
  createPropertyChangeListener(): PropertyChangeListener {
    return $J.fn(this.getHandler(), 'propertyChange');
  }
  /**
   * Returns a layout manager.
   *
   * @return a layout manager
   */
  createLayout(): LayoutManager {
    return this.getHandler();
  }
  static $clinit() {
    BasicInternalFrameTitlePane.CLOSE_CMD = UIManager.getString$Object('InternalFrameTitlePane.closeButtonText');
    BasicInternalFrameTitlePane.ICONIFY_CMD = UIManager.getString$Object('InternalFrameTitlePane.minimizeButtonText');
    BasicInternalFrameTitlePane.RESTORE_CMD = UIManager.getString$Object('InternalFrameTitlePane.restoreButtonText');
    BasicInternalFrameTitlePane.MAXIMIZE_CMD = UIManager.getString$Object('InternalFrameTitlePane.maximizeButtonText');
    BasicInternalFrameTitlePane.MOVE_CMD = UIManager.getString$Object('InternalFrameTitlePane.moveButtonText');
    BasicInternalFrameTitlePane.SIZE_CMD = UIManager.getString$Object('InternalFrameTitlePane.sizeButtonText');
  }
}

export class BasicInternalFrameTitlePane$Handler extends JObject {
  _BasicInternalFrameTitlePane$Handler(): this {
    return this;
  }
  propertyChange(evt: PropertyChangeEvent): void {
    let prop = evt.getPropertyName();
    if (prop === JInternalFrame.IS_SELECTED_PROPERTY) {
      this.$outer.repaint$();
      return;
    }
    if (prop === JInternalFrame.IS_ICON_PROPERTY || prop === JInternalFrame.IS_MAXIMUM_PROPERTY) {
      this.$outer.setButtonIcons();
      this.$outer.enableActions();
      return;
    }
    if ('closable' === prop) {
      if (evt.getNewValue() === true) {
        this.$outer.add$Component(this.$outer.closeButton);
      } else {
        this.$outer.remove$Component(this.$outer.closeButton);
      }
    } else if ('maximizable' === prop) {
      if (evt.getNewValue() === true) {
        this.$outer.add$Component(this.$outer.maxButton);
      } else {
        this.$outer.remove$Component(this.$outer.maxButton);
      }
    } else if ('iconable' === prop) {
      if (evt.getNewValue() === true) {
        this.$outer.add$Component(this.$outer.iconButton);
      } else {
        this.$outer.remove$Component(this.$outer.iconButton);
      }
    }
    this.$outer.enableActions();
    this.$outer.revalidate();
    this.$outer.repaint$();
  }
  addLayoutComponent$String$Component(name: string, c: Component): void {
  }
  removeLayoutComponent(c: Component): void {
  }
  preferredLayoutSize(c: Container): Dimension {
    return this.minimumLayoutSize(c);
  }
  minimumLayoutSize(c: Container): Dimension {
    let width = 22;
    if (this.$outer.frame.isClosable()) {
      width = (width + 19) | 0;
    }
    if (this.$outer.frame.isMaximizable()) {
      width = (width + 19) | 0;
    }
    if (this.$outer.frame.isIconifiable()) {
      width = (width + 19) | 0;
    }
    let fm = this.$outer.frame.getFontMetrics(this.$outer.getFont());
    let frameTitle = this.$outer.frame.getTitle();
    let title_w = frameTitle != null ? SwingUtilities2.stringWidth$JComponent$FontMetrics$String(this.$outer.frame, fm, frameTitle) : 0;
    let title_length = frameTitle != null ? frameTitle.length : 0;
    if (title_length > 3) {
      let subtitle_w = SwingUtilities2.stringWidth$JComponent$FontMetrics$String(this.$outer.frame, fm, frameTitle.substring(0, 3) + '...');
      width = (width + ((title_w < subtitle_w) ? title_w : subtitle_w)) | 0;
    } else {
      width = (width + title_w) | 0;
    }
    let icon = this.$outer.frame.getFrameIcon();
    let fontHeight = fm.getHeight();
    fontHeight = (fontHeight + 2) | 0;
    let iconHeight = 0;
    if (icon != null) {
      iconHeight = Math.min(icon.getIconHeight(), 16);
    }
    iconHeight = (iconHeight + 2) | 0;
    let height = Math.max(fontHeight, iconHeight);
    let dim = new Dimension()._Dimension$int$int(width, height);
    if (this.$outer.getBorder() != null) {
      let insets = this.$outer.getBorder().getBorderInsets$Component(c);
      dim.height_ = (dim.height_ + (insets.top + insets.bottom)) | 0;
      dim.width_ = (dim.width_ + (insets.left + insets.right)) | 0;
    }
    return dim;
  }
  layoutContainer$Container(c: Container): void {
    let leftToRight = BasicGraphicsUtils.isLeftToRight(this.$outer.frame);
    let w = this.$outer.getWidth();
    let h = this.$outer.getHeight();
    let x: number;
    let buttonHeight = this.$outer.closeButton.getIcon().getIconHeight();
    let icon = this.$outer.frame.getFrameIcon();
    let iconHeight = 0;
    if (icon != null) {
      iconHeight = icon.getIconHeight();
    }
    x = (leftToRight) ? 2 : (w - 16 - 2) | 0;
    this.$outer.menuBar.setBounds$int$int$int$int(x, $J.idiv(((h - iconHeight) | 0), 2), 16, 16);
    x = (leftToRight) ? (w - 16 - 2) | 0 : 2;
    if (this.$outer.frame.isClosable()) {
      this.$outer.closeButton.setBounds$int$int$int$int(x, $J.idiv(((h - buttonHeight) | 0), 2), 16, 14);
      x = (x + ((leftToRight) ? -((16 + 2) | 0) : (16 + 2) | 0)) | 0;
    }
    if (this.$outer.frame.isMaximizable()) {
      this.$outer.maxButton.setBounds$int$int$int$int(x, $J.idiv(((h - buttonHeight) | 0), 2), 16, 14);
      x = (x + ((leftToRight) ? -((16 + 2) | 0) : (16 + 2) | 0)) | 0;
    }
    if (this.$outer.frame.isIconifiable()) {
      this.$outer.iconButton.setBounds$int$int$int$int(x, $J.idiv(((h - buttonHeight) | 0), 2), 16, 14);
    }
  }
}

/**
 * This class should be treated as a &quot;protected&quot; inner class.
 * Instantiate it only within subclasses of <code>Foo</code>.
 */
export class BasicInternalFrameTitlePane$PropertyChangeHandler extends JObject {
  /**
   * Constructs a {@code PropertyChangeHandler}.
   */
  _BasicInternalFrameTitlePane$PropertyChangeHandler(): this {
    return this;
  }
  propertyChange(evt: PropertyChangeEvent): void {
    this.$outer.getHandler().propertyChange(evt);
  }
}

/**
 * This class should be treated as a &quot;protected&quot; inner class.
 * Instantiate it only within subclasses of <code>Foo</code>.
 */
export class BasicInternalFrameTitlePane$TitlePaneLayout extends JObject {
  /**
   * Constructs a {@code TitlePaneLayout}.
   */
  _BasicInternalFrameTitlePane$TitlePaneLayout(): this {
    return this;
  }
}

/**
 * This class should be treated as a &quot;protected&quot; inner class.
 * Instantiate it only within subclasses of <code>Foo</code>.
 */
export class BasicInternalFrameTitlePane$CloseAction extends AbstractAction {
  /**
   * Constructs a new instance of a {@code CloseAction}.
   */
  _BasicInternalFrameTitlePane$CloseAction(): this {
    this._AbstractAction$String(UIManager.getString$Object('InternalFrameTitlePane.closeButtonText'));
    return this;
  }
  actionPerformed(e: ActionEvent): void {
    if (this.$outer.frame.isClosable()) {
      this.$outer.frame.doDefaultCloseAction();
    }
  }
}

/**
 * This class should be treated as a &quot;protected&quot; inner class.
 * Instantiate it only within subclasses of <code>Foo</code>.
 */
export class BasicInternalFrameTitlePane$MaximizeAction extends AbstractAction {
  /**
   * Constructs a new instance of a {@code MaximizeAction}.
   */
  _BasicInternalFrameTitlePane$MaximizeAction(): this {
    this._AbstractAction$String(UIManager.getString$Object('InternalFrameTitlePane.maximizeButtonText'));
    return this;
  }
  actionPerformed(evt: ActionEvent): void {
    if (this.$outer.frame.isMaximizable()) {
      if (this.$outer.frame.isMaximum() && this.$outer.frame.isIcon()) {
        try {
          this.$outer.frame.setIcon(false);
        } catch ($e1) {
          if ($J.isa($e1, PropertyVetoException)) {
            let e = $J.exc($e1);
          } else {
            throw $e1;
          }
        }
      } else if (!this.$outer.frame.isMaximum()) {
        try {
          this.$outer.frame.setMaximum(true);
        } catch ($e2) {
          if ($J.isa($e2, PropertyVetoException)) {
            let e = $J.exc($e2);
          } else {
            throw $e2;
          }
        }
      } else {
        try {
          this.$outer.frame.setMaximum(false);
        } catch ($e3) {
          if ($J.isa($e3, PropertyVetoException)) {
            let e = $J.exc($e3);
          } else {
            throw $e3;
          }
        }
      }
    }
  }
}

/**
 * This class should be treated as a &quot;protected&quot; inner class.
 * Instantiate it only within subclasses of <code>Foo</code>.
 */
export class BasicInternalFrameTitlePane$IconifyAction extends AbstractAction {
  /**
   * Constructs a new instance of an {@code IconifyAction}.
   */
  _BasicInternalFrameTitlePane$IconifyAction(): this {
    this._AbstractAction$String(UIManager.getString$Object('InternalFrameTitlePane.minimizeButtonText'));
    return this;
  }
  actionPerformed(e: ActionEvent): void {
    if (this.$outer.frame.isIconifiable()) {
      if (!this.$outer.frame.isIcon()) {
        try {
          this.$outer.frame.setIcon(true);
        } catch ($e4) {
          if ($J.isa($e4, PropertyVetoException)) {
            let e1 = $J.exc($e4);
          } else {
            throw $e4;
          }
        }
      } else {
        try {
          this.$outer.frame.setIcon(false);
        } catch ($e5) {
          if ($J.isa($e5, PropertyVetoException)) {
            let e1 = $J.exc($e5);
          } else {
            throw $e5;
          }
        }
      }
    }
  }
}

/**
 * This class should be treated as a &quot;protected&quot; inner class.
 * Instantiate it only within subclasses of <code>Foo</code>.
 */
export class BasicInternalFrameTitlePane$RestoreAction extends AbstractAction {
  /**
   * Constructs a new instance of a {@code RestoreAction}.
   */
  _BasicInternalFrameTitlePane$RestoreAction(): this {
    this._AbstractAction$String(UIManager.getString$Object('InternalFrameTitlePane.restoreButtonText'));
    return this;
  }
  actionPerformed(evt: ActionEvent): void {
    if (this.$outer.frame.isMaximizable() && this.$outer.frame.isMaximum() && this.$outer.frame.isIcon()) {
      try {
        this.$outer.frame.setIcon(false);
      } catch ($e6) {
        if ($J.isa($e6, PropertyVetoException)) {
          let e = $J.exc($e6);
        } else {
          throw $e6;
        }
      }
    } else if (this.$outer.frame.isMaximizable() && this.$outer.frame.isMaximum()) {
      try {
        this.$outer.frame.setMaximum(false);
      } catch ($e7) {
        if ($J.isa($e7, PropertyVetoException)) {
          let e = $J.exc($e7);
        } else {
          throw $e7;
        }
      }
    } else if (this.$outer.frame.isIconifiable() && this.$outer.frame.isIcon()) {
      try {
        this.$outer.frame.setIcon(false);
      } catch ($e8) {
        if ($J.isa($e8, PropertyVetoException)) {
          let e = $J.exc($e8);
        } else {
          throw $e8;
        }
      }
    }
  }
}

/**
 * This class should be treated as a &quot;protected&quot; inner class.
 * Instantiate it only within subclasses of <code>Foo</code>.
 */
export class BasicInternalFrameTitlePane$MoveAction extends AbstractAction {
  /**
   * Constructs a new instance of a {@code MoveAction}.
   */
  _BasicInternalFrameTitlePane$MoveAction(): this {
    this._AbstractAction$String(UIManager.getString$Object('InternalFrameTitlePane.moveButtonText'));
    return this;
  }
  actionPerformed(e: ActionEvent): void {
  }
}

export class BasicInternalFrameTitlePane$ShowSystemMenuAction extends AbstractAction {
  show_: boolean = false;
  _BasicInternalFrameTitlePane$ShowSystemMenuAction(show: boolean): this {
    this._AbstractAction$();
    this.show_ = show;
    return this;
  }
  actionPerformed(e: ActionEvent): void {
    if (this.show_) {
      this.$outer.windowMenu.doClick$();
    } else {
      this.$outer.windowMenu.setVisible(false);
    }
  }
}

/**
 * This class should be treated as a &quot;protected&quot; inner class.
 * Instantiate it only within subclasses of <code>Foo</code>.
 */
export class BasicInternalFrameTitlePane$SizeAction extends AbstractAction {
  /**
   * Constructs a new instance of a {@code SizeAction}.
   */
  _BasicInternalFrameTitlePane$SizeAction(): this {
    this._AbstractAction$String(UIManager.getString$Object('InternalFrameTitlePane.sizeButtonText'));
    return this;
  }
  actionPerformed(e: ActionEvent): void {
  }
}

/**
 * This class should be treated as a &quot;protected&quot; inner class.
 * Instantiate it only within subclasses of <code>Foo</code>.
 */
export class BasicInternalFrameTitlePane$SystemMenuBar extends JMenuBar {
  /**
   * Constructs a {@code SystemMenuBar}.
   */
  _BasicInternalFrameTitlePane$SystemMenuBar(): this {
    this._JMenuBar();
    return this;
  }
  isFocusTraversable(): boolean {
    return false;
  }
  requestFocus$(): void {
  }
  paint(g: Graphics): void {
    let icon = this.$outer.frame.getFrameIcon();
    if (icon == null) {
      icon = DefaultLookup.get(this.$outer.frame, this.$outer.frame.getUI(), 'InternalFrame.icon');
    }
    if (icon != null) {
      if (icon instanceof ImageIcon && (icon.getIconWidth() > 16 || icon.getIconHeight() > 16)) {
        let img = (icon).getImage();
        (icon).setImage(img.getScaledInstance(16, 16, Image.SCALE_SMOOTH));
      }
      icon.paintIcon(this, g, 0, 0);
    }
  }
  isOpaque(): boolean {
    return true;
  }
}

export class BasicInternalFrameTitlePane$NoFocusButton extends JButton {
  uiKey: string = null;
  _BasicInternalFrameTitlePane$NoFocusButton(uiKey: string, opacityKey: string): this {
    this._JButton$();
    this.setFocusPainted(false);
    this.setMargin(new Insets()._Insets(0, 0, 0, 0));
    this.uiKey = uiKey;
    let opacity = UIManager.get$Object(opacityKey);
    if ($J.isa(opacity, JBoolean)) {
      this.setOpaque((opacity));
    }
    return this;
  }
  isFocusTraversable(): boolean {
    return false;
  }
  requestFocus$(): void {
  }
  getAccessibleContext(): AccessibleContext {
    let ac = super.getAccessibleContext();
    if (this.uiKey != null) {
      ac.setAccessibleName(UIManager.getString$Object(this.uiKey));
      this.uiKey = null;
    }
    return ac;
  }
}

$J.define(BasicInternalFrameTitlePane, 'javax.swing.plaf.basic.BasicInternalFrameTitlePane', { kind: 'class', sup: 'javax.swing.JComponent', ctors: { 'javax.swing.JInternalFrame': '_BasicInternalFrameTitlePane' }, clinit: true, lazy: ['CLOSE_CMD', 'ICONIFY_CMD', 'RESTORE_CMD', 'MAXIMIZE_CMD', 'MOVE_CMD', 'SIZE_CMD'] });
$J.define(BasicInternalFrameTitlePane$Handler, 'javax.swing.plaf.basic.BasicInternalFrameTitlePane$Handler', { kind: 'class', ifaces: ['java.awt.LayoutManager', 'java.beans.PropertyChangeListener'], sup: 'java.lang.Object', ctors: { '': '_BasicInternalFrameTitlePane$Handler' }, meths: { 'layoutContainer(java.awt.Container)': 'layoutContainer$Container', 'addLayoutComponent(java.lang.String,java.awt.Component)': 'addLayoutComponent$String$Component' }, inner: true });
$J.define(BasicInternalFrameTitlePane$PropertyChangeHandler, 'javax.swing.plaf.basic.BasicInternalFrameTitlePane$PropertyChangeHandler', { kind: 'class', ifaces: ['java.beans.PropertyChangeListener'], sup: 'java.lang.Object', ctors: { '': '_BasicInternalFrameTitlePane$PropertyChangeHandler' }, inner: true });
$J.define(BasicInternalFrameTitlePane$TitlePaneLayout, 'javax.swing.plaf.basic.BasicInternalFrameTitlePane$TitlePaneLayout', { kind: 'class', ifaces: ['java.awt.LayoutManager'], sup: 'java.lang.Object', ctors: { '': '_BasicInternalFrameTitlePane$TitlePaneLayout' }, meths: { 'layoutContainer(java.awt.Container)': 'layoutContainer$Container', 'addLayoutComponent(java.lang.String,java.awt.Component)': 'addLayoutComponent$String$Component' }, inner: true });
$J.define(BasicInternalFrameTitlePane$CloseAction, 'javax.swing.plaf.basic.BasicInternalFrameTitlePane$CloseAction', { kind: 'class', sup: 'javax.swing.AbstractAction', ctors: { '': '_BasicInternalFrameTitlePane$CloseAction' }, inner: true });
$J.define(BasicInternalFrameTitlePane$MaximizeAction, 'javax.swing.plaf.basic.BasicInternalFrameTitlePane$MaximizeAction', { kind: 'class', sup: 'javax.swing.AbstractAction', ctors: { '': '_BasicInternalFrameTitlePane$MaximizeAction' }, inner: true });
$J.define(BasicInternalFrameTitlePane$IconifyAction, 'javax.swing.plaf.basic.BasicInternalFrameTitlePane$IconifyAction', { kind: 'class', sup: 'javax.swing.AbstractAction', ctors: { '': '_BasicInternalFrameTitlePane$IconifyAction' }, inner: true });
$J.define(BasicInternalFrameTitlePane$RestoreAction, 'javax.swing.plaf.basic.BasicInternalFrameTitlePane$RestoreAction', { kind: 'class', sup: 'javax.swing.AbstractAction', ctors: { '': '_BasicInternalFrameTitlePane$RestoreAction' }, inner: true });
$J.define(BasicInternalFrameTitlePane$MoveAction, 'javax.swing.plaf.basic.BasicInternalFrameTitlePane$MoveAction', { kind: 'class', sup: 'javax.swing.AbstractAction', ctors: { '': '_BasicInternalFrameTitlePane$MoveAction' }, inner: true });
$J.define(BasicInternalFrameTitlePane$ShowSystemMenuAction, 'javax.swing.plaf.basic.BasicInternalFrameTitlePane$ShowSystemMenuAction', { kind: 'class', sup: 'javax.swing.AbstractAction', ctors: { 'boolean': '_BasicInternalFrameTitlePane$ShowSystemMenuAction' }, inner: true });
$J.define(BasicInternalFrameTitlePane$SizeAction, 'javax.swing.plaf.basic.BasicInternalFrameTitlePane$SizeAction', { kind: 'class', sup: 'javax.swing.AbstractAction', ctors: { '': '_BasicInternalFrameTitlePane$SizeAction' }, inner: true });
$J.define(BasicInternalFrameTitlePane$SystemMenuBar, 'javax.swing.plaf.basic.BasicInternalFrameTitlePane$SystemMenuBar', { kind: 'class', sup: 'javax.swing.JMenuBar', ctors: { '': '_BasicInternalFrameTitlePane$SystemMenuBar' }, meths: { 'requestFocus()': 'requestFocus$' }, inner: true });
$J.define(BasicInternalFrameTitlePane$NoFocusButton, 'javax.swing.plaf.basic.BasicInternalFrameTitlePane$NoFocusButton', { kind: 'class', sup: 'javax.swing.JButton', ctors: { 'java.lang.String,java.lang.String': '_BasicInternalFrameTitlePane$NoFocusButton' }, meths: { 'requestFocus()': 'requestFocus$' } });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  Image = $J.load('java.awt.Image');
  Insets = $J.load('java.awt.Insets');
  Rectangle = $J.load('java.awt.Rectangle');
  RenderingHints = $J.load('java.awt.RenderingHints');
  PropertyVetoException = $J.load('java.beans.PropertyVetoException');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JInternalFrame = $J.load('javax.swing.JInternalFrame');
  JMenu = $J.load('javax.swing.JMenu');
  JSeparator = $J.load('javax.swing.JSeparator');
  UIManager = $J.load('javax.swing.UIManager');
  ActionMapUIResource = $J.load('javax.swing.plaf.ActionMapUIResource');
  BasicGraphicsUtils = $J.load('javax.swing.plaf.basic.BasicGraphicsUtils');
  DefaultLookup = $J.load('sun.swing.DefaultLookup');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
