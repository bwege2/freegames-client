// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicOptionPaneUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2025, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject, JString, NumberFormatException } from '../../../../../jre/index.ts';
import { OptionPaneUI } from '../OptionPaneUI.ts';
import { JTextField } from '../../JTextField.ts';
import { UIAction } from '../../../../sun/swing/UIAction.ts';
import { JButton } from '../../JButton.ts';

let BorderLayout, Component, Dimension, GridBagConstraints, GridBagLayout, Insets, HierarchyEvent, Box, BoxLayout, Icon, JComboBox, JComponent, JLabel, JList, JOptionPane, JPanel, JScrollPane, KeyStroke, ListSelectionModel, LookAndFeel, SwingConstants, SwingUtilities, UIManager, BasicLookAndFeel, LazyActionMap, DefaultLookup;

/**
 * Provides the basic look and feel for a <code>JOptionPane</code>.
 * <code>BasicMessagePaneUI</code> provides a means to place an icon,
 * message and buttons into a <code>Container</code>.
 * Generally, the layout will look like:
 * <pre>
 *        ------------------
 *        | i | message    |
 *        | c | message    |
 *        | o | message    |
 *        | n | message    |
 *        ------------------
 *        |     buttons    |
 *        |________________|
 * </pre>
 * icon is an instance of <code>Icon</code> that is wrapped inside a
 * <code>JLabel</code>.  The message is an opaque object and is tested
 * for the following: if the message is a <code>Component</code> it is
 * added to the <code>Container</code>, if it is an <code>Icon</code>
 * it is wrapped inside a <code>JLabel</code> and added to the
 * <code>Container</code> otherwise it is wrapped inside a <code>JLabel</code>.
 * <p>
 * The above layout is used when the option pane's
 * <code>ComponentOrientation</code> property is horizontal, left-to-right.
 * The layout will be adjusted appropriately for other orientations.
 * <p>
 * The <code>Container</code>, message, icon, and buttons are all
 * determined from abstract methods.
 *
 * @author James Gosling
 * @author Scott Violet
 * @author Amy Fowler
 */
export class BasicOptionPaneUI extends OptionPaneUI {
  /**
   * The minimum width of {@code JOptionPane}.
   */
  static readonly MinimumWidth: number = 262;
  /**
   * The minimum height of {@code JOptionPane}.
   */
  static readonly MinimumHeight: number = 90;
  static newline: string = null;
  static recursionCount: number = 0;
  /**
   * {@code JOptionPane} that the receiver is providing the
   * look and feel for.
   */
  optionPane: JOptionPane = null;
  /**
   * The size of {@code JOptionPane}.
   */
  minimumSize_: Dimension = null;
  /**
   * JComponent provide for input if optionPane.getWantsInput() returns
   * true.
   */
  inputComponent: JComponent = null;
  /**
   * Component to receive focus when messaged with selectInitialValue.
   */
  initialFocusComponent: Component = null;
  /**
   * This is set to true in validateComponent if a Component is contained
   * in either the message or the buttons.
   */
  hasCustomComponents: boolean = false;
  /**
   * The instance of {@code PropertyChangeListener}.
   */
  propertyChangeListener: PropertyChangeListener = null;
  handler: BasicOptionPaneUI$Handler = null;
  /**
   * Constructs a {@code BasicOptionPaneUI}.
   */
  _BasicOptionPaneUI(): this {
    this._OptionPaneUI();
    return this;
  }
  static loadActionMap(map: LazyActionMap): void {
    map.put$Action(new BasicOptionPaneUI$Actions()._BasicOptionPaneUI$Actions(BasicOptionPaneUI$Actions.CLOSE));
    BasicLookAndFeel.installAudioActionMap(map);
  }
  /**
   * Creates a new {@code BasicOptionPaneUI} instance.
   * @param x the component
   * @return a new {@code BasicOptionPaneUI} instance
   */
  static createUI(x: JComponent): ComponentUI {
    return new BasicOptionPaneUI()._BasicOptionPaneUI();
  }
  /**
   * Installs the receiver as the L&amp;F for the passed in
   * <code>JOptionPane</code>.
   */
  installUI(c: JComponent): void {
    this.optionPane = c;
    this.installDefaults();
    this.optionPane.setLayout(this.createLayoutManager());
    this.installComponents();
    this.installListeners();
    this.installKeyboardActions();
  }
  /**
   * Removes the receiver from the L&amp;F controller of the passed in split
   * pane.
   */
  uninstallUI(c: JComponent): void {
    this.uninstallComponents();
    this.optionPane.setLayout(null);
    this.uninstallKeyboardActions();
    this.uninstallListeners();
    this.uninstallDefaults();
    this.optionPane = null;
  }
  /**
   * Installs default properties.
   */
  installDefaults(): void {
    LookAndFeel.installColorsAndFont(this.optionPane, 'OptionPane.background', 'OptionPane.foreground', 'OptionPane.font');
    LookAndFeel.installBorder(this.optionPane, 'OptionPane.border');
    this.minimumSize_ = UIManager.getDimension$Object('OptionPane.minimumSize');
    LookAndFeel.installProperty(this.optionPane, 'opaque', true);
  }
  /**
   * Uninstalls default properties.
   */
  uninstallDefaults(): void {
    LookAndFeel.uninstallBorder(this.optionPane);
  }
  /**
   * Registers components.
   */
  installComponents(): void {
    this.optionPane.add$Component(this.createMessageArea());
    let separator = this.createSeparator();
    if (separator != null) {
      this.optionPane.add$Component(separator);
    }
    this.optionPane.add$Component(this.createButtonArea());
    this.optionPane.applyComponentOrientation(this.optionPane.getComponentOrientation());
  }
  /**
   * Unregisters components.
   */
  uninstallComponents(): void {
    this.hasCustomComponents = false;
    this.inputComponent = null;
    this.initialFocusComponent = null;
    this.optionPane.removeAll();
  }
  /**
   * Returns a layout manager.
   *
   * @return a layout manager
   */
  createLayoutManager(): LayoutManager {
    return new BoxLayout()._BoxLayout$Container$int(this.optionPane, BoxLayout.Y_AXIS);
  }
  /**
   * Registers listeners.
   */
  installListeners(): void {
    if ((this.propertyChangeListener = this.createPropertyChangeListener()) != null) {
      this.optionPane.addPropertyChangeListener$PropertyChangeListener(this.propertyChangeListener);
    }
  }
  /**
   * Unregisters listeners.
   */
  uninstallListeners(): void {
    if (this.propertyChangeListener != null) {
      this.optionPane.removePropertyChangeListener$PropertyChangeListener(this.propertyChangeListener);
      this.propertyChangeListener = null;
    }
    this.handler = null;
  }
  /**
   * Returns an instance of {@code PropertyChangeListener}.
   *
   * @return an instance of {@code PropertyChangeListener}
   */
  createPropertyChangeListener(): PropertyChangeListener {
    return $J.fn(this.getHandler(), 'propertyChange');
  }
  getHandler(): BasicOptionPaneUI$Handler {
    if (this.handler == null) {
      this.handler = new BasicOptionPaneUI$Handler().$o(this)._BasicOptionPaneUI$Handler();
    }
    return this.handler;
  }
  /**
   * Registers keyboard actions.
   */
  installKeyboardActions(): void {
    let map = this.getInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW);
    SwingUtilities.replaceUIInputMap(this.optionPane, JComponent.WHEN_IN_FOCUSED_WINDOW, map);
    LazyActionMap.installLazyActionMap(this.optionPane, $J.cls(BasicOptionPaneUI), 'OptionPane.actionMap');
  }
  /**
   * Unregisters keyboard actions.
   */
  uninstallKeyboardActions(): void {
    SwingUtilities.replaceUIInputMap(this.optionPane, JComponent.WHEN_IN_FOCUSED_WINDOW, null);
    SwingUtilities.replaceUIActionMap(this.optionPane, null);
  }
  getInputMap(condition: number): InputMap {
    if (condition === JComponent.WHEN_IN_FOCUSED_WINDOW) {
      let bindings = DefaultLookup.get(this.optionPane, this, 'OptionPane.windowBindings');
      if (bindings != null) {
        return LookAndFeel.makeComponentInputMap(this.optionPane, bindings);
      }
    }
    return null;
  }
  /**
   * Returns the minimum size the option pane should be. Primarily
   * provided for subclassers wishing to offer a different minimum size.
   *
   * @return the minimum size of the option pane
   */
  getMinimumOptionPaneSize(): Dimension {
    if (this.minimumSize_ == null) {
      return new Dimension()._Dimension$int$int(BasicOptionPaneUI.MinimumWidth, BasicOptionPaneUI.MinimumHeight);
    }
    return new Dimension()._Dimension$int$int(this.minimumSize_.width_, this.minimumSize_.height_);
  }
  /**
   * If <code>c</code> is the <code>JOptionPane</code> the receiver
   * is contained in, the preferred
   * size that is returned is the maximum of the preferred size of
   * the <code>LayoutManager</code> for the <code>JOptionPane</code>, and
   * <code>getMinimumOptionPaneSize</code>.
   */
  getPreferredSize$JComponent(c: JComponent): Dimension {
    if (c === this.optionPane) {
      let ourMin = this.getMinimumOptionPaneSize();
      let lm = c.getLayout();
      if (lm != null) {
        let lmSize = lm.preferredLayoutSize(c);
        if (ourMin != null) {
          return new Dimension()._Dimension$int$int(Math.max(lmSize.width_, ourMin.width_), Math.max(lmSize.height_, ourMin.height_));
        }
        return lmSize;
      }
      return ourMin;
    }
    return null;
  }
  /**
   * Messaged from {@code installComponents} to create a {@code Container}
   * containing the body of the message. The icon is the created
   * by calling {@code addIcon}.
   *
   * @return a instance of {@code Container}
   */
  createMessageArea(): Container {
    let top = new JPanel()._JPanel$();
    let topBorder = DefaultLookup.get(this.optionPane, this, 'OptionPane.messageAreaBorder');
    if (topBorder != null) {
      top.setBorder(topBorder);
    }
    top.setLayout(new BorderLayout()._BorderLayout$());
    let body = new JPanel()._JPanel$LayoutManager(new GridBagLayout()._GridBagLayout());
    let realBody = new JPanel()._JPanel$LayoutManager(new BorderLayout()._BorderLayout$());
    body.setName('OptionPane.body');
    realBody.setName('OptionPane.realBody');
    if (this.getIcon() != null) {
      let sep = new JPanel()._JPanel$();
      sep.setName('OptionPane.separator');
      sep.setPreferredSize(new Dimension()._Dimension$int$int(15, 1));
      realBody.add$Component$Object(sep, BorderLayout.BEFORE_LINE_BEGINS);
    }
    realBody.add$Component$Object(body, BorderLayout.CENTER);
    let cons = new GridBagConstraints()._GridBagConstraints$();
    cons.gridx = cons.gridy = 0;
    cons.gridwidth = GridBagConstraints.REMAINDER;
    cons.gridheight = 1;
    cons.anchor = DefaultLookup.getInt$JComponent$ComponentUI$String$int(this.optionPane, this, 'OptionPane.messageAnchor', GridBagConstraints.CENTER);
    cons.insets_ = new Insets()._Insets(0, 0, 3, 0);
    BasicOptionPaneUI.recursionCount = 0;
    this.addMessageComponents(body, cons, this.getMessage(), this.getMaxCharactersPerLineCount(), false);
    top.add$Component$Object(realBody, BorderLayout.CENTER);
    this.addIcon(top);
    return top;
  }
  /**
   * Creates the appropriate object to represent {@code msg} and places it
   * into {@code container}. If {@code msg} is an instance of
   * {@code Component}, it is added directly; if it is an {@code Icon}, a
   * {@code JLabel} is created to represent it; otherwise, a {@code JLabel}
   * is created for the string. If {@code msg} is an Object[], this method
   * will be recursively invoked for the children. {@code internallyCreated}
   * is {@code true} if {@code msg} is an instance of {@code Component} and
   * was created internally by this method (this is used to correctly set
   * {@code hasCustomComponents} only if {@code internallyCreated} is
   * {@code false}).
   *
   * @param container a container
   * @param cons an instance of {@code GridBagConstraints}
   * @param msg a message
   * @param maxll a maximum length
   * @param internallyCreated {@code true} if the component was internally created
   */
  addMessageComponents(container: Container, cons: GridBagConstraints, msg: any, maxll: number, internallyCreated: boolean): void {
    if (msg == null) {
      return;
    }
    if (msg instanceof Component) {
      if (msg instanceof JScrollPane || msg instanceof JPanel) {
        cons.fill_ = GridBagConstraints.BOTH;
        cons.weighty = 1;
      } else {
        cons.fill_ = GridBagConstraints.HORIZONTAL;
      }
      cons.weightx = 1;
      container.add$Component$Object(msg, cons);
      cons.weightx = 0;
      cons.weighty = 0;
      cons.fill_ = GridBagConstraints.NONE;
      cons.gridy++;
      if (!internallyCreated) {
        this.hasCustomComponents = true;
      }
    } else if (Array.isArray(msg)) {
      let msgs = msg;
      for (let o of msgs) {
        this.addMessageComponents(container, cons, o, maxll, false);
      }
    } else if ($J.isa(msg, Icon)) {
      let label = new JLabel()._JLabel$Icon$int(msg, SwingConstants.CENTER);
      this.configureMessageLabel(label);
      this.addMessageComponents(container, cons, label, maxll, true);
    } else {
      let s = $J.str(msg);
      let len = s.length;
      if (len <= 0) {
        return;
      }
      let nl: number;
      let nll = 0;
      if ((nl = s.indexOf(BasicOptionPaneUI.newline)) >= 0) {
        nll = BasicOptionPaneUI.newline.length;
      } else if ((nl = s.indexOf('\r\n')) >= 0) {
        nll = 2;
      } else if ((nl = s.indexOf(String.fromCharCode(10 /* \u000a */))) >= 0) {
        nll = 1;
      }
      if (nl >= 0) {
        if (nl === 0) {
          let breakPanel = new (BasicOptionPaneUI$1())().$o(this)._JPanel$();
          breakPanel.setName('OptionPane.break');
          this.addMessageComponents(container, cons, breakPanel, maxll, true);
        } else {
          this.addMessageComponents(container, cons, s.substring(0, nl), maxll, false);
        }
        if (BasicOptionPaneUI.recursionCount++ > 200) {
          BasicOptionPaneUI.recursionCount = 0;
          this.addMessageComponents(container, cons, JString.newString('...'), maxll, false);
          return;
        }
        this.addMessageComponents(container, cons, s.substring((nl + nll) | 0), maxll, false);
      } else if (len > maxll) {
        let c = Box.createVerticalBox();
        c.setName('OptionPane.verticalBox');
        this.burstStringInto(c, s, maxll);
        this.addMessageComponents(container, cons, c, maxll, true);
      } else {
        let label = new JLabel()._JLabel$();
        if ($J.equals(true, this.optionPane.getClientProperty('html.disable'))) {
          label.putClientProperty('html.disable', true);
        }
        label.setText(s);
        label.setName('OptionPane.label');
        this.configureMessageLabel(label);
        this.addMessageComponents(container, cons, label, maxll, true);
      }
    }
  }
  /**
   * Returns the message to display from the {@code JOptionPane} the receiver is
   * providing the look and feel for.
   *
   * @return the message to display
   */
  getMessage(): any {
    this.inputComponent = null;
    if (this.optionPane != null) {
      if (this.optionPane.getWantsInput()) {
        let message = this.optionPane.getMessage();
        let sValues = this.optionPane.getSelectionValues();
        let inputValue = this.optionPane.getInitialSelectionValue();
        let toAdd: JComponent;
        if (sValues != null) {
          if (sValues.length < 20) {
            let cBox = new JComboBox()._JComboBox$();
            cBox.setName('OptionPane.comboBox');
            for (let counter = 0, maxCounter = sValues.length; counter < maxCounter; counter++) {
              cBox.addItem(sValues[counter]);
            }
            if (inputValue != null) {
              cBox.setSelectedItem(inputValue);
            }
            this.inputComponent = cBox;
            toAdd = cBox;
          } else {
            let list = new JList()._JList$ObjectArr(sValues);
            let sp = new JScrollPane()._JScrollPane$Component(list);
            sp.setName('OptionPane.scrollPane');
            list.setName('OptionPane.list');
            list.setVisibleRowCount(10);
            list.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
            if (inputValue != null) {
              list.setSelectedValue(inputValue, true);
            }
            list.addMouseListener(this.getHandler());
            toAdd = sp;
            this.inputComponent = list;
          }
        } else {
          let tf = new BasicOptionPaneUI$MultiplexingTextField()._BasicOptionPaneUI$MultiplexingTextField(20);
          tf.setName('OptionPane.textField');
          tf.setKeyStrokes([KeyStroke.getKeyStroke$String('ENTER')]);
          if (inputValue != null) {
            let inputString = $J.str(inputValue);
            tf.setText(inputString);
            tf.setSelectionStart(0);
            tf.setSelectionEnd(inputString.length);
          }
          tf.addActionListener($J.fn(this.getHandler(), 'actionPerformed'));
          toAdd = this.inputComponent = tf;
        }
        let newMessage: any[];
        if (message == null) {
          newMessage = $J.newArray(1, null);
          newMessage[0] = toAdd;
        } else {
          newMessage = $J.newArray(2, null);
          newMessage[0] = message;
          newMessage[1] = toAdd;
        }
        return newMessage;
      }
      return this.optionPane.getMessage();
    }
    return null;
  }
  /**
   * Creates and adds a JLabel representing the icon returned from
   * {@code getIcon} to {@code top}. This is messaged from
   * {@code createMessageArea}.
   *
   * @param top a container
   */
  addIcon(top: Container): void {
    let sideIcon = this.getIcon();
    if (sideIcon != null) {
      let iconLabel = new JLabel()._JLabel$Icon(sideIcon);
      iconLabel.setName('OptionPane.iconLabel');
      iconLabel.setVerticalAlignment(SwingConstants.TOP);
      top.add$Component$Object(iconLabel, BorderLayout.BEFORE_LINE_BEGINS);
    }
  }
  /**
   * Returns the icon from the {@code JOptionPane} the receiver is providing
   * the look and feel for, or the default icon as returned from
   * {@code getDefaultIcon}.
   *
   * @return the icon
   */
  getIcon(): Icon {
    let mIcon = (this.optionPane == null ? null : this.optionPane.getIcon());
    if (mIcon == null && this.optionPane != null) {
      mIcon = this.getIconForType(this.optionPane.getMessageType());
    }
    return mIcon;
  }
  /**
   * Returns the icon to use for the passed in type.
   *
   * @param messageType a type of message
   * @return the icon to use for the passed in type
   */
  getIconForType(messageType: number): Icon {
    if (messageType < 0 || messageType > 3) {
      return null;
    }
    let propertyName = null;
    switch (messageType) {
      case 0:
        propertyName = 'OptionPane.errorIcon';
        break;
      case 1:
        propertyName = 'OptionPane.informationIcon';
        break;
      case 2:
        propertyName = 'OptionPane.warningIcon';
        break;
      case 3:
        propertyName = 'OptionPane.questionIcon';
        break;
    }
    if (propertyName != null) {
      return DefaultLookup.get(this.optionPane, this, propertyName);
    }
    return null;
  }
  /**
   * Returns the maximum number of characters to place on a line.
   *
   * @return the maximum number of characters to place on a line
   */
  getMaxCharactersPerLineCount(): number {
    return this.optionPane.getMaxCharactersPerLineCount();
  }
  /**
   * Recursively creates new {@code JLabel} instances to represent {@code d}.
   * Each {@code JLabel} instance is added to {@code c}.
   *
   * @param c a container
   * @param d a text
   * @param maxll a maximum length of a text
   */
  burstStringInto(c: Container, d: string, maxll: number): void {
    let len = d.length;
    if (len <= 0) {
      return;
    }
    if (len > maxll) {
      let p = d.lastIndexOf(String.fromCharCode(32 /* ' ' */), maxll);
      if (p <= 0) {
        p = d.indexOf(String.fromCharCode(32 /* ' ' */), maxll);
      }
      if (p > 0 && p < len) {
        this.burstStringInto(c, d.substring(0, p), maxll);
        this.burstStringInto(c, d.substring((p + 1) | 0), maxll);
        return;
      }
    }
    let label = new JLabel()._JLabel$String$int(d, SwingConstants.LEFT);
    label.setName('OptionPane.label');
    this.configureMessageLabel(label);
    c.add$Component(label);
  }
  /**
   * Returns a separator.
   *
   * @return a separator
   */
  createSeparator(): Container {
    return null;
  }
  /**
   * Creates and returns a {@code Container} containing the buttons.
   * The buttons are created by calling {@code getButtons}.
   *
   * @return a {@code Container} containing the buttons
   */
  createButtonArea(): Container {
    let bottom = new JPanel()._JPanel$();
    let border = DefaultLookup.get(this.optionPane, this, 'OptionPane.buttonAreaBorder');
    bottom.setName('OptionPane.buttonArea');
    if (border != null) {
      bottom.setBorder(border);
    }
    bottom.setLayout(new BasicOptionPaneUI$ButtonAreaLayout()._BasicOptionPaneUI$ButtonAreaLayout$boolean$int$int$boolean(DefaultLookup.getBoolean$JComponent$ComponentUI$String$boolean(this.optionPane, this, 'OptionPane.sameSizeButtons', true), DefaultLookup.getInt$JComponent$ComponentUI$String$int(this.optionPane, this, 'OptionPane.buttonPadding', 6), DefaultLookup.getInt$JComponent$ComponentUI$String$int(this.optionPane, this, 'OptionPane.buttonOrientation', SwingConstants.CENTER), DefaultLookup.getBoolean$JComponent$ComponentUI$String$boolean(this.optionPane, this, 'OptionPane.isYesLast', false)));
    this.addButtonComponents(bottom, this.getButtons(), this.getInitialValueIndex());
    return bottom;
  }
  /**
   * Creates the appropriate object to represent each of the objects in
   * {@code buttons} and adds it to {@code container}. This
   * differs from addMessageComponents in that it will recurse on
   * {@code buttons} and that if button is not a Component
   * it will create an instance of JButton.
   *
   * @param container a container
   * @param buttons an array of buttons
   * @param initialIndex an initial index
   */
  addButtonComponents(container: Container, buttons: any[], initialIndex: number): void {
    if (buttons != null && buttons.length > 0) {
      let sizeButtonsToSame = this.getSizeButtonsToSameWidth();
      let createdAll = true;
      let numButtons = buttons.length;
      let createdButtons = null;
      let maxWidth = 0;
      if (sizeButtonsToSame) {
        createdButtons = $J.newArray(numButtons, null);
      }
      for (let counter = 0; counter < numButtons; counter++) {
        let button = buttons[counter];
        let newComponent: Component;
        if (button instanceof Component) {
          createdAll = false;
          newComponent = button;
          container.add$Component(newComponent);
          this.hasCustomComponents = true;
        } else {
          let aButton: JButton;
          if (button instanceof BasicOptionPaneUI$ButtonFactory) {
            aButton = (button).createButton();
          } else if ($J.isa(button, Icon)) {
            aButton = new JButton()._JButton$Icon(button);
          } else {
            aButton = new JButton()._JButton$String($J.str(button));
          }
          aButton.setName('OptionPane.button');
          aButton.setMultiClickThreshhold(DefaultLookup.getInt$JComponent$ComponentUI$String$int(this.optionPane, this, 'OptionPane.buttonClickThreshhold', 0));
          this.configureButton(aButton);
          container.add$Component(aButton);
          let buttonListener = this.createButtonActionListener(counter);
          if (buttonListener != null) {
            aButton.addActionListener(buttonListener);
          }
          newComponent = aButton;
        }
        if (sizeButtonsToSame && createdAll && (newComponent instanceof JButton)) {
          createdButtons[counter] = newComponent;
          maxWidth = Math.max(maxWidth, newComponent.getMinimumSize$().width_);
        }
        if (counter === initialIndex) {
          this.initialFocusComponent = newComponent;
          if (this.initialFocusComponent instanceof JButton) {
            let defaultB = this.initialFocusComponent;
            defaultB.addHierarchyListener((e) => {
              if (($J.land(e.getChangeFlags(), HierarchyEvent.PARENT_CHANGED)) !== 0) {
                let defaultButton = e.getComponent();
                let root = SwingUtilities.getRootPane(defaultButton);
                if (root != null) {
                  root.setDefaultButton(defaultButton);
                }
              }
            });
          }
        }
      }
      (container.getLayout()).setSyncAllWidths((sizeButtonsToSame && createdAll));
      if (DefaultLookup.getBoolean$JComponent$ComponentUI$String$boolean(this.optionPane, this, 'OptionPane.setButtonMargin', true) && sizeButtonsToSame && createdAll) {
        let aButton: JButton;
        let padSize: number;
        padSize = (numButtons <= 2 ? 8 : 4);
        for (let counter = 0; counter < numButtons; counter++) {
          aButton = createdButtons[counter];
          aButton.setMargin(new Insets()._Insets(2, padSize, 2, padSize));
        }
      }
    }
  }
  /**
   * Constructs a new instance of a {@code ButtonActionListener}.
   *
   * @param buttonIndex an index of the button
   * @return a new instance of a {@code ButtonActionListener}
   */
  createButtonActionListener(buttonIndex: number): ActionListener {
    return $J.fn(new BasicOptionPaneUI$ButtonActionListener().$o(this)._BasicOptionPaneUI$ButtonActionListener(buttonIndex), 'actionPerformed');
  }
  /**
   * Returns the buttons to display from the {@code JOptionPane} the receiver is
   * providing the look and feel for. If the {@code JOptionPane} has options
   * set, they will be provided, otherwise if the optionType is
   * {@code YES_NO_OPTION}, {@code yesNoOptions} is returned, if the type is
   * {@code YES_NO_CANCEL_OPTION} {@code yesNoCancelOptions} is returned, otherwise
   * {@code defaultButtons} are returned.
   *
   * @return the buttons to display from the JOptionPane
   */
  getButtons(): any[] {
    if (this.optionPane != null) {
      let suppliedOptions = this.optionPane.getOptions();
      if (suppliedOptions == null) {
        let defaultOptions: any[];
        let type$ = this.optionPane.getOptionType();
        let l = this.optionPane.getLocale$();
        let minimumWidth = DefaultLookup.getInt$JComponent$ComponentUI$String$int(this.optionPane, this, 'OptionPane.buttonMinimumWidth', -1);
        if (type$ === JOptionPane.YES_NO_OPTION) {
          defaultOptions = $J.newArray(2, null);
          defaultOptions[0] = new BasicOptionPaneUI$ButtonFactory()._BasicOptionPaneUI$ButtonFactory(UIManager.getString$Object$Locale('OptionPane.yesButtonText', l), this.getMnemonic('OptionPane.yesButtonMnemonic', l), DefaultLookup.get(this.optionPane, this, 'OptionPane.yesIcon'), minimumWidth);
          defaultOptions[1] = new BasicOptionPaneUI$ButtonFactory()._BasicOptionPaneUI$ButtonFactory(UIManager.getString$Object$Locale('OptionPane.noButtonText', l), this.getMnemonic('OptionPane.noButtonMnemonic', l), DefaultLookup.get(this.optionPane, this, 'OptionPane.noIcon'), minimumWidth);
        } else if (type$ === JOptionPane.YES_NO_CANCEL_OPTION) {
          defaultOptions = $J.newArray(3, null);
          defaultOptions[0] = new BasicOptionPaneUI$ButtonFactory()._BasicOptionPaneUI$ButtonFactory(UIManager.getString$Object$Locale('OptionPane.yesButtonText', l), this.getMnemonic('OptionPane.yesButtonMnemonic', l), DefaultLookup.get(this.optionPane, this, 'OptionPane.yesIcon'), minimumWidth);
          defaultOptions[1] = new BasicOptionPaneUI$ButtonFactory()._BasicOptionPaneUI$ButtonFactory(UIManager.getString$Object$Locale('OptionPane.noButtonText', l), this.getMnemonic('OptionPane.noButtonMnemonic', l), DefaultLookup.get(this.optionPane, this, 'OptionPane.noIcon'), minimumWidth);
          defaultOptions[2] = new BasicOptionPaneUI$ButtonFactory()._BasicOptionPaneUI$ButtonFactory(UIManager.getString$Object$Locale('OptionPane.cancelButtonText', l), this.getMnemonic('OptionPane.cancelButtonMnemonic', l), DefaultLookup.get(this.optionPane, this, 'OptionPane.cancelIcon'), minimumWidth);
        } else if (type$ === JOptionPane.OK_CANCEL_OPTION) {
          defaultOptions = $J.newArray(2, null);
          defaultOptions[0] = new BasicOptionPaneUI$ButtonFactory()._BasicOptionPaneUI$ButtonFactory(UIManager.getString$Object$Locale('OptionPane.okButtonText', l), this.getMnemonic('OptionPane.okButtonMnemonic', l), DefaultLookup.get(this.optionPane, this, 'OptionPane.okIcon'), minimumWidth);
          defaultOptions[1] = new BasicOptionPaneUI$ButtonFactory()._BasicOptionPaneUI$ButtonFactory(UIManager.getString$Object$Locale('OptionPane.cancelButtonText', l), this.getMnemonic('OptionPane.cancelButtonMnemonic', l), DefaultLookup.get(this.optionPane, this, 'OptionPane.cancelIcon'), minimumWidth);
        } else {
          defaultOptions = $J.newArray(1, null);
          defaultOptions[0] = new BasicOptionPaneUI$ButtonFactory()._BasicOptionPaneUI$ButtonFactory(UIManager.getString$Object$Locale('OptionPane.okButtonText', l), this.getMnemonic('OptionPane.okButtonMnemonic', l), DefaultLookup.get(this.optionPane, this, 'OptionPane.okIcon'), minimumWidth);
        }
        return defaultOptions;
      }
      return suppliedOptions;
    }
    return null;
  }
  getMnemonic(key: string, l: Locale): number {
    let value = UIManager.get$Object$Locale(key, l);
    if (value == null) {
      return 0;
    }
    try {
      return $J.parseInt(value);
    } catch ($e0) {
      if ($J.isa($e0, NumberFormatException)) {
        let nfe = $J.exc($e0);
      } else {
        throw $e0;
      }
    }
    return 0;
  }
  /**
   * Returns {@code true}, basic L&amp;F wants all the buttons to have the same
   * width.
   *
   * @return {@code true} if all the buttons should have the same width
   */
  getSizeButtonsToSameWidth(): boolean {
    return true;
  }
  /**
   * Returns the initial index into the buttons to select. The index
   * is calculated from the initial value from the JOptionPane and
   * options of the JOptionPane or 0.
   *
   * @return the initial index into the buttons to select
   */
  getInitialValueIndex(): number {
    if (this.optionPane != null) {
      let iv = this.optionPane.getInitialValue();
      let options = this.optionPane.getOptions();
      if (options == null) {
        return 0;
      } else if (iv != null) {
        for (let counter = (options.length - 1) | 0; counter >= 0; counter--) {
          if ($J.equals(options[counter], iv)) {
            return counter;
          }
        }
      }
    }
    return -1;
  }
  /**
   * Sets the input value in the option pane the receiver is providing
   * the look and feel for based on the value in the inputComponent.
   */
  resetInputValue(): void {
    var textField, comboBox;
    if ((textField = this.inputComponent) instanceof JTextField) {
      this.optionPane.setInputValue(textField.getText$());
    } else if ((comboBox = this.inputComponent) instanceof JComboBox) {
      this.optionPane.setInputValue(comboBox.getSelectedItem());
    } else if (this.inputComponent != null) {
      this.optionPane.setInputValue((this.inputComponent).getSelectedValue());
    }
  }
  /**
   * If inputComponent is non-null, the focus is requested on that,
   * otherwise request focus on the default value
   */
  selectInitialValue(op: JOptionPane): void {
    if (this.inputComponent != null) {
      this.inputComponent.requestFocus$();
    } else {
      if (this.initialFocusComponent != null) {
        this.initialFocusComponent.requestFocus$();
      }
      if (this.initialFocusComponent instanceof JButton) {
        let root = SwingUtilities.getRootPane(this.initialFocusComponent);
        if (root != null) {
          root.setDefaultButton(this.initialFocusComponent);
        }
      }
    }
  }
  /**
   * Configures any necessary colors/fonts for the specified label
   * used representing the message.
   */
  configureMessageLabel(label: JLabel): void {
    let color = DefaultLookup.get(this.optionPane, this, 'OptionPane.messageForeground');
    if (color != null) {
      label.setForeground(color);
    }
    let messageFont = DefaultLookup.get(this.optionPane, this, 'OptionPane.messageFont');
    if (messageFont != null) {
      label.setFont(messageFont);
    }
  }
  /**
   * Configures any necessary colors/fonts for the specified button
   * used representing the button portion of the optionpane.
   */
  configureButton(button: JButton): void {
    let buttonFont = DefaultLookup.get(this.optionPane, this, 'OptionPane.buttonFont');
    if (buttonFont != null) {
      button.setFont(buttonFont);
    }
  }
  static $clinit() {
    BasicOptionPaneUI.newline = $J.system_lineSeparator();
    if (BasicOptionPaneUI.newline == null) {
      BasicOptionPaneUI.newline = '\n';
    }
  }
}

/**
 * <code>ButtonAreaLayout</code> behaves in a similar manner to
 * <code>FlowLayout</code>. It lays out all components from left to
 * right. If <code>syncAllWidths</code> is true, the widths of each
 * component will be set to the largest preferred size width.
 *
 * This class should be treated as a &quot;protected&quot; inner class.
 * Instantiate it only within subclasses of {@code BasicOptionPaneUI}.
 */
export class BasicOptionPaneUI$ButtonAreaLayout extends JObject {
  /**
   * The value represents if the width of children should be synchronized.
   */
  syncAllWidths: boolean = false;
  /**
   * The padding value.
   */
  padding: number = 0;
  /**
   * If true, children are lumped together in parent.
   */
  centersChildren: boolean = false;
  orientation: number = 0;
  reverseButtons: boolean = false;
  /**
   * Indicates whether or not centersChildren should be used vs
   * the orientation. This is done for backward compatibility
   * for subclassers.
   */
  useOrientation: boolean = false;
  /**
   * Constructs a new instance of {@code ButtonAreaLayout}.
   *
   * @param syncAllWidths if the width of children should be synchronized
   * @param padding the padding value
   */
  _BasicOptionPaneUI$ButtonAreaLayout$boolean$int(syncAllWidths: boolean, padding: number): this {
    this.syncAllWidths = syncAllWidths;
    this.padding = padding;
    this.centersChildren = true;
    this.useOrientation = false;
    return this;
  }
  _BasicOptionPaneUI$ButtonAreaLayout$boolean$int$int$boolean(syncAllSizes: boolean, padding: number, orientation: number, reverseButtons: boolean): this {
    this._BasicOptionPaneUI$ButtonAreaLayout$boolean$int(syncAllSizes, padding);
    this.useOrientation = true;
    this.orientation = orientation;
    this.reverseButtons = reverseButtons;
    return this;
  }
  /**
   * Sets if the width of children should be synchronized.
   *
   * @param newValue if the width of children should be synchronized
   */
  setSyncAllWidths(newValue: boolean): void {
    this.syncAllWidths = newValue;
  }
  /**
   * Returns if the width of children should be synchronized.
   *
   * @return if the width of children should be synchronized
   */
  getSyncAllWidths(): boolean {
    return this.syncAllWidths;
  }
  /**
   * Returns whether or not center children should be used.
   *
   * @return whether or not center children should be used
   */
  getCentersChildren(): boolean {
    return this.centersChildren;
  }
  getOrientation(container: Container): number {
    if (!this.useOrientation) {
      return SwingConstants.CENTER;
    }
    if (container.getComponentOrientation().isLeftToRight()) {
      return this.orientation;
    }
    switch (this.orientation) {
      case SwingConstants.LEFT:
        return SwingConstants.RIGHT;
      case SwingConstants.RIGHT:
        return SwingConstants.LEFT;
      case SwingConstants.CENTER:
        return SwingConstants.CENTER;
    }
    return SwingConstants.LEFT;
  }
  addLayoutComponent$String$Component(string$: string, comp: Component): void {
  }
  layoutContainer$Container(container: Container): void {
    let children = container.getComponents();
    if (children != null && children.length > 0) {
      let numChildren = children.length;
      let insets = container.getInsets$();
      let maxWidth = 0;
      let maxHeight = 0;
      let totalButtonWidth = 0;
      let x = 0;
      let xOffset = 0;
      let ltr = container.getComponentOrientation().isLeftToRight();
      let reverse = (ltr) ? this.reverseButtons : !this.reverseButtons;
      for (let counter = 0; counter < numChildren; counter++) {
        let pref = children[counter].getPreferredSize$();
        maxWidth = Math.max(maxWidth, pref.width_);
        maxHeight = Math.max(maxHeight, pref.height_);
        totalButtonWidth = (totalButtonWidth + pref.width_) | 0;
      }
      if (this.getSyncAllWidths()) {
        totalButtonWidth = Math.imul(maxWidth, numChildren);
      }
      totalButtonWidth = (totalButtonWidth + Math.imul(((numChildren - 1) | 0), this.padding)) | 0;
      switch (this.getOrientation(container)) {
        case SwingConstants.LEFT:
          x = insets.left;
          break;
        case SwingConstants.RIGHT:
          x = (container.getWidth() - insets.right - totalButtonWidth) | 0;
          break;
        case SwingConstants.CENTER:
          if (this.getCentersChildren() || numChildren < 2) {
            x = $J.idiv(((container.getWidth() - totalButtonWidth) | 0), 2);
          } else {
            x = insets.left;
            if (this.getSyncAllWidths()) {
              xOffset = ($J.idiv(((container.getWidth() - insets.left - insets.right - totalButtonWidth) | 0), ((numChildren - 1) | 0)) + maxWidth) | 0;
            } else {
              xOffset = $J.idiv(((container.getWidth() - insets.left - insets.right - totalButtonWidth) | 0), ((numChildren - 1) | 0));
            }
          }
          break;
      }
      for (let counter = 0; counter < numChildren; counter++) {
        let index = (reverse) ? (numChildren - counter - 1) | 0 : counter;
        let pref = children[index].getPreferredSize$();
        if (this.getSyncAllWidths()) {
          children[index].setBounds$int$int$int$int(x, insets.top, maxWidth, maxHeight);
        } else {
          children[index].setBounds$int$int$int$int(x, insets.top, pref.width_, pref.height_);
        }
        if (xOffset !== 0) {
          x = (x + xOffset) | 0;
        } else {
          x = (x + (children[index].getWidth() + this.padding)) | 0;
        }
      }
    }
  }
  minimumLayoutSize(c: Container): Dimension {
    if (c != null) {
      let children = c.getComponents();
      if (children != null && children.length > 0) {
        let aSize: Dimension;
        let numChildren = children.length;
        let height = 0;
        let cInsets = c.getInsets$();
        let extraHeight = (cInsets.top + cInsets.bottom) | 0;
        let extraWidth = (cInsets.left + cInsets.right) | 0;
        if (this.syncAllWidths) {
          let maxWidth = 0;
          for (let counter = 0; counter < numChildren; counter++) {
            aSize = children[counter].getPreferredSize$();
            height = Math.max(height, aSize.height_);
            maxWidth = Math.max(maxWidth, aSize.width_);
          }
          return new Dimension()._Dimension$int$int((extraWidth + (Math.imul(maxWidth, numChildren)) + Math.imul(((numChildren - 1) | 0), this.padding)) | 0, (extraHeight + height) | 0);
        } else {
          let totalWidth = 0;
          for (let counter = 0; counter < numChildren; counter++) {
            aSize = children[counter].getPreferredSize$();
            height = Math.max(height, aSize.height_);
            totalWidth = (totalWidth + aSize.width_) | 0;
          }
          totalWidth = (totalWidth + (Math.imul(((numChildren - 1) | 0), this.padding))) | 0;
          return new Dimension()._Dimension$int$int((extraWidth + totalWidth) | 0, (extraHeight + height) | 0);
        }
      }
    }
    return new Dimension()._Dimension$int$int(0, 0);
  }
  preferredLayoutSize(c: Container): Dimension {
    return this.minimumLayoutSize(c);
  }
  removeLayoutComponent(c: Component): void {
  }
}

/**
 * This class should be treated as a &quot;protected&quot; inner class.
 * Instantiate it only within subclasses of {@code BasicOptionPaneUI}.
 */
export class BasicOptionPaneUI$ButtonActionListener extends JObject {
  /**
   * The index of the button.
   */
  buttonIndex: number = 0;
  /**
   * Constructs a new instance of {@code ButtonActionListener}.
   *
   * @param buttonIndex an index of the button
   */
  _BasicOptionPaneUI$ButtonActionListener(buttonIndex: number): this {
    this.buttonIndex = buttonIndex;
    return this;
  }
  actionPerformed(e: ActionEvent): void {
    if (this.$outer.optionPane != null) {
      let optionType = this.$outer.optionPane.getOptionType();
      let options = this.$outer.optionPane.getOptions();
      if (this.$outer.inputComponent != null) {
        if (options != null || optionType === JOptionPane.DEFAULT_OPTION || ((optionType === JOptionPane.YES_NO_OPTION || optionType === JOptionPane.YES_NO_CANCEL_OPTION || optionType === JOptionPane.OK_CANCEL_OPTION) && this.buttonIndex === 0)) {
          this.$outer.resetInputValue();
        }
      }
      if (options == null) {
        if (optionType === JOptionPane.OK_CANCEL_OPTION && this.buttonIndex === 1) {
          this.$outer.optionPane.setValue(2);
        } else {
          this.$outer.optionPane.setValue(this.buttonIndex);
        }
      } else {
        this.$outer.optionPane.setValue(options[this.buttonIndex]);
      }
    }
  }
}

export class BasicOptionPaneUI$Handler extends JObject {
  _BasicOptionPaneUI$Handler(): this {
    return this;
  }
  actionPerformed(e: ActionEvent): void {
    this.$outer.optionPane.setInputValue((e.getSource()).getText$());
  }
  mouseClicked(e: MouseEvent): void {
  }
  mouseReleased(e: MouseEvent): void {
  }
  mouseEntered(e: MouseEvent): void {
  }
  mouseExited(e: MouseEvent): void {
  }
  mousePressed(e: MouseEvent): void {
    if (e.getClickCount() === 2) {
      let list = e.getSource();
      let index = list.locationToIndex(e.getPoint());
      this.$outer.optionPane.setInputValue(list.getModel().getElementAt(index));
      this.$outer.optionPane.setValue(JOptionPane.OK_OPTION);
    }
  }
  propertyChange(e: PropertyChangeEvent): void {
    if (e.getSource() === this.$outer.optionPane) {
      if ('ancestor' === e.getPropertyName()) {
        let op = e.getSource();
        let isComingUp: boolean;
        if (e.getOldValue() == null) {
          isComingUp = true;
        } else {
          isComingUp = false;
        }
        switch (op.getMessageType()) {
          case JOptionPane.PLAIN_MESSAGE:
            if (isComingUp) {
              BasicLookAndFeel.playSound(this.$outer.optionPane, 'OptionPane.informationSound');
            }
            break;
          case JOptionPane.QUESTION_MESSAGE:
            if (isComingUp) {
              BasicLookAndFeel.playSound(this.$outer.optionPane, 'OptionPane.questionSound');
            }
            break;
          case JOptionPane.INFORMATION_MESSAGE:
            if (isComingUp) {
              BasicLookAndFeel.playSound(this.$outer.optionPane, 'OptionPane.informationSound');
            }
            break;
          case JOptionPane.WARNING_MESSAGE:
            if (isComingUp) {
              BasicLookAndFeel.playSound(this.$outer.optionPane, 'OptionPane.warningSound');
            }
            break;
          case JOptionPane.ERROR_MESSAGE:
            if (isComingUp) {
              BasicLookAndFeel.playSound(this.$outer.optionPane, 'OptionPane.errorSound');
            }
            break;
          default:
            $J.err.println('Undefined JOptionPane type: ' + op.getMessageType());
            break;
        }
      }
      let changeName = e.getPropertyName();
      if (changeName === JOptionPane.OPTIONS_PROPERTY || changeName === JOptionPane.INITIAL_VALUE_PROPERTY || changeName === JOptionPane.ICON_PROPERTY || changeName === JOptionPane.MESSAGE_TYPE_PROPERTY || changeName === JOptionPane.OPTION_TYPE_PROPERTY || changeName === JOptionPane.MESSAGE_PROPERTY || changeName === JOptionPane.SELECTION_VALUES_PROPERTY || changeName === JOptionPane.INITIAL_SELECTION_VALUE_PROPERTY || changeName === JOptionPane.WANTS_INPUT_PROPERTY) {
        this.$outer.uninstallComponents();
        this.$outer.installComponents();
        this.$outer.optionPane.validate();
      } else if (changeName === 'componentOrientation') {
        let o = e.getNewValue();
        let op = e.getSource();
        if (o !== e.getOldValue()) {
          op.applyComponentOrientation(o);
        }
      }
    }
  }
}

/**
 * A JTextField that allows you to specify an array of KeyStrokes that
 * that will have their bindings processed regardless of whether or
 * not they are registered on the JTextField. This is used as we really
 * want the ActionListener to be notified so that we can push the
 * change to the JOptionPane, but we also want additional bindings
 * (those of the JRootPane) to be processed as well.
 */
export class BasicOptionPaneUI$MultiplexingTextField extends JTextField {
  strokes: KeyStroke[] = null;
  _BasicOptionPaneUI$MultiplexingTextField(cols: number): this {
    this._JTextField$int(cols);
    return this;
  }
  /**
   * Sets the KeyStrokes that will be additional processed for
   * ancestor bindings.
   */
  setKeyStrokes(strokes: KeyStroke[]): void {
    this.strokes = strokes;
  }
  processKeyBinding(ks: KeyStroke, e: KeyEvent, condition: number, pressed: boolean): boolean {
    let processed = super.processKeyBinding(ks, e, condition, pressed);
    if (processed && condition !== JComponent.WHEN_IN_FOCUSED_WINDOW) {
      for (let counter = (this.strokes.length - 1) | 0; counter >= 0; counter--) {
        if (this.strokes[counter].equals(ks)) {
          return false;
        }
      }
    }
    return processed;
  }
}

/**
 * Registered in the ActionMap. Sets the value of the option pane
 * to <code>JOptionPane.CLOSED_OPTION</code>.
 */
export class BasicOptionPaneUI$Actions extends UIAction {
  static readonly CLOSE: string = 'close';
  _BasicOptionPaneUI$Actions(key: string): this {
    this._UIAction(key);
    return this;
  }
  actionPerformed(e: ActionEvent): void {
    if (this.getName() === BasicOptionPaneUI$Actions.CLOSE) {
      let optionPane = e.getSource();
      optionPane.setValue(JOptionPane.CLOSED_OPTION);
    }
  }
}

/**
 * This class is used to create the default buttons. This indirection is
 * used so that addButtonComponents can tell which Buttons were created
 * by us vs subclassers or from the JOptionPane itself.
 */
export class BasicOptionPaneUI$ButtonFactory extends JObject {
  text_: string = null;
  mnemonic: number = 0;
  icon: Icon = null;
  minimumWidth: number = 0;
  _BasicOptionPaneUI$ButtonFactory(text: string, mnemonic: number, icon: Icon, minimumWidth: number): this {
    this.minimumWidth = -1;
    this.text_ = text;
    this.mnemonic = mnemonic;
    this.icon = icon;
    this.minimumWidth = minimumWidth;
    return this;
  }
  createButton(): JButton {
    let button: JButton;
    if (this.minimumWidth > 0) {
      button = new BasicOptionPaneUI$ButtonFactory$ConstrainedButton()._BasicOptionPaneUI$ButtonFactory$ConstrainedButton(this.text_, this.minimumWidth);
    } else {
      button = new JButton()._JButton$String(this.text_);
    }
    if (this.icon != null) {
      button.setIcon(this.icon);
    }
    if (this.mnemonic !== 0) {
      button.setMnemonic$int(this.mnemonic);
    }
    return button;
  }
}

export class BasicOptionPaneUI$ButtonFactory$ConstrainedButton extends JButton {
  minimumWidth: number = 0;
  _BasicOptionPaneUI$ButtonFactory$ConstrainedButton(text: string, minimumWidth: number): this {
    this._JButton$String(text);
    this.minimumWidth = minimumWidth;
    return this;
  }
  getMinimumSize$(): Dimension {
    let min = super.getMinimumSize$();
    min.width_ = Math.max(min.width_, this.minimumWidth);
    return min;
  }
  getPreferredSize$(): Dimension {
    let pref = super.getPreferredSize$();
    pref.width_ = Math.max(pref.width_, this.minimumWidth);
    return pref;
  }
}

let $BasicOptionPaneUI$1: any = null;
/** An anonymous class (BasicOptionPaneUI.java:462). */
function BasicOptionPaneUI$1(): any {
  return $BasicOptionPaneUI$1 ??= $J.local(class extends JPanel {
    getPreferredSize$(): Dimension {
      let f = this.getFont();
      if (f != null) {
        return new Dimension()._Dimension$int$int(1, (f.getSize() + 2) | 0);
      }
      return new Dimension()._Dimension$int$int(0, 0);
    }
  }, 'javax.swing.plaf.basic.BasicOptionPaneUI$1', []);
}

$J.define(BasicOptionPaneUI, 'javax.swing.plaf.basic.BasicOptionPaneUI', { kind: 'class', sup: 'javax.swing.plaf.OptionPaneUI', ctors: { '': '_BasicOptionPaneUI' }, meths: { 'getPreferredSize(javax.swing.JComponent)': 'getPreferredSize$JComponent' }, clinit: true, lazy: ['newline', 'recursionCount'] });
$J.define(BasicOptionPaneUI$ButtonAreaLayout, 'javax.swing.plaf.basic.BasicOptionPaneUI$ButtonAreaLayout', { kind: 'class', ifaces: ['java.awt.LayoutManager'], sup: 'java.lang.Object', ctors: { 'boolean,int,int,boolean': '_BasicOptionPaneUI$ButtonAreaLayout$boolean$int$int$boolean', 'boolean,int': '_BasicOptionPaneUI$ButtonAreaLayout$boolean$int' }, meths: { 'layoutContainer(java.awt.Container)': 'layoutContainer$Container', 'addLayoutComponent(java.lang.String,java.awt.Component)': 'addLayoutComponent$String$Component' } });
$J.define(BasicOptionPaneUI$ButtonActionListener, 'javax.swing.plaf.basic.BasicOptionPaneUI$ButtonActionListener', { kind: 'class', ifaces: ['java.awt.event.ActionListener'], sup: 'java.lang.Object', ctors: { 'int': '_BasicOptionPaneUI$ButtonActionListener' }, inner: true });
$J.define(BasicOptionPaneUI$Handler, 'javax.swing.plaf.basic.BasicOptionPaneUI$Handler', { kind: 'class', ifaces: ['java.awt.event.ActionListener', 'java.awt.event.MouseListener', 'java.beans.PropertyChangeListener'], sup: 'java.lang.Object', ctors: { '': '_BasicOptionPaneUI$Handler' }, inner: true });
$J.define(BasicOptionPaneUI$MultiplexingTextField, 'javax.swing.plaf.basic.BasicOptionPaneUI$MultiplexingTextField', { kind: 'class', sup: 'javax.swing.JTextField', ctors: { 'int': '_BasicOptionPaneUI$MultiplexingTextField' } });
$J.define(BasicOptionPaneUI$Actions, 'javax.swing.plaf.basic.BasicOptionPaneUI$Actions', { kind: 'class', sup: 'sun.swing.UIAction', ctors: { 'java.lang.String': '_BasicOptionPaneUI$Actions' } });
$J.define(BasicOptionPaneUI$ButtonFactory, 'javax.swing.plaf.basic.BasicOptionPaneUI$ButtonFactory', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.lang.String,int,javax.swing.Icon,int': '_BasicOptionPaneUI$ButtonFactory' } });
$J.define(BasicOptionPaneUI$ButtonFactory$ConstrainedButton, 'javax.swing.plaf.basic.BasicOptionPaneUI$ButtonFactory$ConstrainedButton', { kind: 'class', sup: 'javax.swing.JButton', ctors: { 'java.lang.String,int': '_BasicOptionPaneUI$ButtonFactory$ConstrainedButton' }, meths: { 'getPreferredSize()': 'getPreferredSize$', 'getMinimumSize()': 'getMinimumSize$' } });
$J.module(() => {
  BorderLayout = $J.load('java.awt.BorderLayout');
  Component = $J.load('java.awt.Component');
  Dimension = $J.load('java.awt.Dimension');
  GridBagConstraints = $J.load('java.awt.GridBagConstraints');
  GridBagLayout = $J.load('java.awt.GridBagLayout');
  Insets = $J.load('java.awt.Insets');
  HierarchyEvent = $J.load('java.awt.event.HierarchyEvent');
  Box = $J.load('javax.swing.Box');
  BoxLayout = $J.load('javax.swing.BoxLayout');
  Icon = $J.load('javax.swing.Icon');
  JComboBox = $J.load('javax.swing.JComboBox');
  JComponent = $J.load('javax.swing.JComponent');
  JLabel = $J.load('javax.swing.JLabel');
  JList = $J.load('javax.swing.JList');
  JOptionPane = $J.load('javax.swing.JOptionPane');
  JPanel = $J.load('javax.swing.JPanel');
  JScrollPane = $J.load('javax.swing.JScrollPane');
  KeyStroke = $J.load('javax.swing.KeyStroke');
  ListSelectionModel = $J.load('javax.swing.ListSelectionModel');
  LookAndFeel = $J.load('javax.swing.LookAndFeel');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIManager = $J.load('javax.swing.UIManager');
  BasicLookAndFeel = $J.load('javax.swing.plaf.basic.BasicLookAndFeel');
  LazyActionMap = $J.load('javax.swing.plaf.basic.LazyActionMap');
  DefaultLookup = $J.load('sun.swing.DefaultLookup');
});
