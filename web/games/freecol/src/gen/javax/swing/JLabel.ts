// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JLabel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2022, Oracle and/or its affiliates. All rights reserved.
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
import { $J, IllegalArgumentException, JString } from '../../../jre/index.ts';
import { JComponent } from './JComponent.ts';
import { JComponent$AccessibleJComponent } from './JComponent.ts';

let Component, Accessible, AccessibleContext, AccessibleRelation, SwingConstants, SwingUtilities, UIManager;

/**
 * A display area for a short text string or an image,
 * or both.
 * A label does not react to input events.
 * As a result, it cannot get the keyboard focus.
 * A label can, however, display a keyboard alternative
 * as a convenience for a nearby component
 * that has a keyboard alternative but can't display it.
 * <p>
 * A <code>JLabel</code> object can display
 * either text, an image, or both.
 * You can specify where in the label's display area
 * the label's contents are aligned
 * by setting the vertical and horizontal alignment.
 * By default, labels are vertically centered
 * in their display area.
 * Text-only labels are leading edge aligned, by default;
 * image-only labels are horizontally centered, by default.
 * <p>
 * You can also specify the position of the text
 * relative to the image.
 * By default, text is on the trailing edge of the image,
 * with the text and image vertically aligned.
 * <p>
 * A label's leading and trailing edge are determined from the value of its
 * {@link java.awt.ComponentOrientation} property.  At present, the default
 * ComponentOrientation setting maps the leading edge to left and the trailing
 * edge to right.
 *
 * <p>
 * Finally, you can use the <code>setIconTextGap</code> method
 * to specify how many pixels
 * should appear between the text and the image.
 * The default is 4 pixels.
 * <p>
 * See <a href="https://docs.oracle.com/javase/tutorial/uiswing/components/label.html">How to Use Labels</a>
 * in <em>The Java Tutorial</em>
 * for further documentation.
 * <p>
 * <strong>Warning:</strong> Swing is not thread safe. For more
 * information see <a
 * href="package-summary.html#threading">Swing's Threading
 * Policy</a>.
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
 * @author Hans Muller
 * @since 1.2
 */
export class JLabel extends JComponent {
  /**
   * @see #getUIClassID
   * @see #readObject
   */
  static readonly uiClassID: string = 'LabelUI';
  mnemonic: number = 0;
  mnemonicIndex: number = 0;
  text_: string = null;
  defaultIcon: Icon = null;
  disabledIcon: Icon = null;
  disabledIconSet: boolean = false;
  verticalAlignment: number = 0;
  horizontalAlignment: number = 0;
  verticalTextPosition: number = 0;
  horizontalTextPosition: number = 0;
  iconTextGap: number = 0;
  /**
   * The Component this label is for; null if the label
   * is not the label for a component
   */
  labelFor: Component = null;
  /**
   * Client property key used to determine what label is labeling the
   * component.  This is generally not used by labels, but is instead
   * used by components such as text areas that are being labeled by
   * labels.  When the labelFor property of a label is set, it will
   * automatically set the LABELED_BY_PROPERTY of the component being
   * labelled.
   *
   * @see #setLabelFor
   */
  static readonly LABELED_BY_PROPERTY: string = 'labeledBy';
  $init_JLabel() {
    this.mnemonic = 0 /* \u0000 */;
    this.mnemonicIndex = -1;
    this.text_ = '';
    this.defaultIcon = null;
    this.disabledIcon = null;
    this.disabledIconSet = false;
    this.verticalAlignment = SwingConstants.CENTER;
    this.horizontalAlignment = SwingConstants.LEADING;
    this.verticalTextPosition = SwingConstants.CENTER;
    this.horizontalTextPosition = SwingConstants.TRAILING;
    this.iconTextGap = 4;
    this.labelFor = null;
  }
  /**
   * Creates a <code>JLabel</code> instance with the specified
   * text, image, and horizontal alignment.
   * The label is centered vertically in its display area.
   * The text is on the trailing edge of the image.
   *
   * @param text  The text to be displayed by the label.
   * @param icon  The image to be displayed by the label.
   * @param horizontalAlignment  One of the following constants
   *           defined in <code>SwingConstants</code>:
   *           <code>LEFT</code>,
   *           <code>CENTER</code>,
   *           <code>RIGHT</code>,
   *           <code>LEADING</code> or
   *           <code>TRAILING</code>.
   */
  _JLabel$String$Icon$int(text: string, icon: Icon, horizontalAlignment: number): this {
    this._JComponent();
    this.$init_JLabel();
    this.setText(text);
    this.setIcon(icon);
    this.setHorizontalAlignment(horizontalAlignment);
    this.updateUI();
    this.setAlignmentX(Component.LEFT_ALIGNMENT);
    return this;
  }
  /**
   * Creates a <code>JLabel</code> instance with the specified
   * text and horizontal alignment.
   * The label is centered vertically in its display area.
   *
   * @param text  The text to be displayed by the label.
   * @param horizontalAlignment  One of the following constants
   *           defined in <code>SwingConstants</code>:
   *           <code>LEFT</code>,
   *           <code>CENTER</code>,
   *           <code>RIGHT</code>,
   *           <code>LEADING</code> or
   *           <code>TRAILING</code>.
   */
  _JLabel$String$int(text: string, horizontalAlignment: number): this {
    this._JLabel$String$Icon$int(text, null, horizontalAlignment);
    return this;
  }
  /**
   * Creates a <code>JLabel</code> instance with the specified text.
   * The label is aligned against the leading edge of its display area,
   * and centered vertically.
   *
   * @param text  The text to be displayed by the label.
   */
  _JLabel$String(text: string): this {
    this._JLabel$String$Icon$int(text, null, SwingConstants.LEADING);
    return this;
  }
  /**
   * Creates a <code>JLabel</code> instance with the specified
   * image and horizontal alignment.
   * The label is centered vertically in its display area.
   *
   * @param image  The image to be displayed by the label.
   * @param horizontalAlignment  One of the following constants
   *           defined in <code>SwingConstants</code>:
   *           <code>LEFT</code>,
   *           <code>CENTER</code>,
   *           <code>RIGHT</code>,
   *           <code>LEADING</code> or
   *           <code>TRAILING</code>.
   */
  _JLabel$Icon$int(image: Icon, horizontalAlignment: number): this {
    this._JLabel$String$Icon$int(null, image, horizontalAlignment);
    return this;
  }
  /**
   * Creates a <code>JLabel</code> instance with the specified image.
   * The label is centered vertically and horizontally
   * in its display area.
   *
   * @param image  The image to be displayed by the label.
   */
  _JLabel$Icon(image: Icon): this {
    this._JLabel$String$Icon$int(null, image, SwingConstants.CENTER);
    return this;
  }
  /**
   * Creates a <code>JLabel</code> instance with
   * no image and with an empty string for the title.
   * The label is centered vertically
   * in its display area.
   * The label's contents, once set, will be displayed on the leading edge
   * of the label's display area.
   */
  _JLabel$(): this {
    this._JLabel$String$Icon$int('', null, SwingConstants.LEADING);
    return this;
  }
  /**
   * Sets the L&amp;F object that renders this component.
   *
   * @param ui  the LabelUI L&amp;F object
   * @see UIDefaults#getUI
   */
  setUI$LabelUI(ui: LabelUI): void {
    super.setUI$ComponentUI(ui);
    if (!this.disabledIconSet && this.disabledIcon != null) {
      this.setDisabledIcon(null);
    }
  }
  /**
   * Resets the UI property to a value from the current look and feel.
   *
   * @see JComponent#updateUI
   */
  updateUI(): void {
    this.setUI$LabelUI(UIManager.getUI(this));
  }
  /**
   * Returns a string that specifies the name of the l&amp;f class
   * that renders this component.
   *
   * @return the string "LabelUI"
   * @see JComponent#getUIClassID
   * @see UIDefaults#getUI
   */
  getUIClassID(): string {
    return JLabel.uiClassID;
  }
  /**
   * Returns the text string that the label displays.
   *
   * @return a String
   * @see #setText
   */
  getText(): string {
    return this.text_;
  }
  /**
   * Defines the single line of text this component will display.  If
   * the value of text is null or empty string, nothing is displayed.
   * <p>
   * The default value of this property is null.
   * <p>
   * This is a JavaBeans bound property.
   *
   * @param text  the single line of text this component will display
   * @see #setVerticalTextPosition
   * @see #setHorizontalTextPosition
   * @see #setIcon
   */
  setText(text: string): void {
    let oldAccessibleName = null;
    if (this.accessibleContext != null) {
      oldAccessibleName = this.accessibleContext.getAccessibleName();
    }
    let oldValue = this.text_;
    this.text_ = text;
    this.firePropertyChange$String$Object$Object('text', oldValue, text);
    this.setDisplayedMnemonicIndex(SwingUtilities.findDisplayedMnemonicIndex(text, this.getDisplayedMnemonic()));
    if ((this.accessibleContext != null) && (this.accessibleContext.getAccessibleName() !== oldAccessibleName)) {
      this.accessibleContext.firePropertyChange(AccessibleContext.ACCESSIBLE_VISIBLE_DATA_PROPERTY, oldAccessibleName, this.accessibleContext.getAccessibleName());
    }
    if (text == null || oldValue == null || !$J.equals(text, oldValue)) {
      this.revalidate();
      this.repaint$();
    }
  }
  /**
   * Returns the graphic image (glyph, icon) that the label displays.
   *
   * @return an Icon
   * @see #setIcon
   */
  getIcon(): Icon {
    return this.defaultIcon;
  }
  /**
   * Defines the icon this component will display.  If
   * the value of icon is null, nothing is displayed.
   * <p>
   * The default value of this property is null.
   * <p>
   * This is a JavaBeans bound property.
   *
   * @param icon  the default icon this component will display
   * @see #setVerticalTextPosition
   * @see #setHorizontalTextPosition
   * @see #getIcon
   */
  setIcon(icon: Icon): void {
    let oldValue = this.defaultIcon;
    this.defaultIcon = icon;
    if ((this.defaultIcon !== oldValue) && !this.disabledIconSet) {
      this.disabledIcon = null;
    }
    this.firePropertyChange$String$Object$Object('icon', oldValue, this.defaultIcon);
    if ((this.accessibleContext != null) && (oldValue !== this.defaultIcon)) {
      this.accessibleContext.firePropertyChange(AccessibleContext.ACCESSIBLE_VISIBLE_DATA_PROPERTY, oldValue, this.defaultIcon);
    }
    if (this.defaultIcon !== oldValue) {
      if ((this.defaultIcon == null) || (oldValue == null) || (this.defaultIcon.getIconWidth() !== oldValue.getIconWidth()) || (this.defaultIcon.getIconHeight() !== oldValue.getIconHeight())) {
        this.revalidate();
      }
      this.repaint$();
    }
  }
  /**
   * Returns the icon used by the label when it's disabled.
   * If no disabled icon has been set this will forward the call to
   * the look and feel to construct an appropriate disabled Icon.
   * <p>
   * Some look and feels might not render the disabled Icon, in which
   * case they will ignore this.
   *
   * @return the <code>disabledIcon</code> property
   * @see #setDisabledIcon
   * @see javax.swing.LookAndFeel#getDisabledIcon
   * @see ImageIcon
   */
  getDisabledIcon(): Icon {
    if (!this.disabledIconSet && this.disabledIcon == null && this.defaultIcon != null) {
      this.disabledIcon = UIManager.getLookAndFeel().getDisabledIcon(this, this.defaultIcon);
      if (this.disabledIcon != null) {
        this.firePropertyChange$String$Object$Object('disabledIcon', null, this.disabledIcon);
      }
    }
    return this.disabledIcon;
  }
  /**
   * Set the icon to be displayed if this JLabel is "disabled"
   * (JLabel.setEnabled(false)).
   * <p>
   * The default value of this property is null.
   *
   * @param disabledIcon the Icon to display when the component is disabled
   * @see #getDisabledIcon
   * @see #setEnabled
   */
  setDisabledIcon(disabledIcon: Icon): void {
    let oldValue = this.disabledIcon;
    this.disabledIcon = disabledIcon;
    this.disabledIconSet = (disabledIcon != null);
    this.firePropertyChange$String$Object$Object('disabledIcon', oldValue, disabledIcon);
    if (disabledIcon !== oldValue) {
      if (disabledIcon == null || oldValue == null || disabledIcon.getIconWidth() !== oldValue.getIconWidth() || disabledIcon.getIconHeight() !== oldValue.getIconHeight()) {
        this.revalidate();
      }
      if (!this.isEnabled()) {
        this.repaint$();
      }
    }
  }
  /**
   * Specify a keycode that indicates a mnemonic key.
   * This property is used when the label is part of a larger component.
   * If the labelFor property of the label is not null, the label will
   * call the requestFocus method of the component specified by the
   * labelFor property when the mnemonic is activated.
   *
   * @param key  a keycode that indicates a mnemonic key
   * @see #getLabelFor
   * @see #setLabelFor
   */
  setDisplayedMnemonic$int(key: number): void {
    let oldKey = this.mnemonic;
    this.mnemonic = key;
    this.firePropertyChange$String$int$int('displayedMnemonic', oldKey, this.mnemonic);
    this.setDisplayedMnemonicIndex(SwingUtilities.findDisplayedMnemonicIndex(this.getText(), this.mnemonic));
    if (key !== oldKey) {
      this.revalidate();
      this.repaint$();
    }
  }
  /**
   * Return the keycode that indicates a mnemonic key.
   * This property is used when the label is part of a larger component.
   * If the labelFor property of the label is not null, the label will
   * call the requestFocus method of the component specified by the
   * labelFor property when the mnemonic is activated.
   *
   * @return int value for the mnemonic key
   *
   * @see #getLabelFor
   * @see #setLabelFor
   */
  getDisplayedMnemonic(): number {
    return this.mnemonic;
  }
  /**
   * Provides a hint to the look and feel as to which character in the
   * text should be decorated to represent the mnemonic. Not all look and
   * feels may support this. A value of -1 indicates either there is no
   * mnemonic, the mnemonic character is not contained in the string, or
   * the developer does not wish the mnemonic to be displayed.
   * <p>
   * The value of this is updated as the properties relating to the
   * mnemonic change (such as the mnemonic itself, the text...).
   * You should only ever have to call this if
   * you do not wish the default character to be underlined. For example, if
   * the text was 'Save As', with a mnemonic of 'a', and you wanted the 'A'
   * to be decorated, as 'Save <u>A</u>s', you would have to invoke
   * <code>setDisplayedMnemonicIndex(5)</code> after invoking
   * <code>setDisplayedMnemonic(KeyEvent.VK_A)</code>.
   *
   * @since 1.4
   * @param index Index into the String to underline
   * @throws IllegalArgumentException will be thrown if <code>index</code>
   *            is &gt;= length of the text, or &lt; -1
   */
  setDisplayedMnemonicIndex(index: number): void {
    let oldValue = this.mnemonicIndex;
    if (index === -1) {
      this.mnemonicIndex = -1;
    } else {
      let text = this.getText();
      let textLength = (text == null) ? 0 : text.length;
      if (index < -1 || index >= textLength) {
        throw new IllegalArgumentException('index == ' + index);
      }
    }
    this.mnemonicIndex = index;
    this.firePropertyChange$String$int$int('displayedMnemonicIndex', oldValue, index);
    if (index !== oldValue) {
      this.revalidate();
      this.repaint$();
    }
  }
  /**
   * Returns the character, as an index, that the look and feel should
   * provide decoration for as representing the mnemonic character.
   *
   * @since 1.4
   * @return index representing mnemonic character
   * @see #setDisplayedMnemonicIndex
   */
  getDisplayedMnemonicIndex(): number {
    return this.mnemonicIndex;
  }
  /**
   * Verify that key is a legal value for the horizontalAlignment properties.
   *
   * @param key the property value to check
   * @param message the IllegalArgumentException detail message
   * @return the key value if {@code key} is a legal value for the
   *         horizontalAlignment properties
   * @throws IllegalArgumentException if key isn't LEFT, CENTER, RIGHT,
   * LEADING or TRAILING.
   * @see #setHorizontalTextPosition
   * @see #setHorizontalAlignment
   */
  checkHorizontalKey(key: number, message: string): number {
    if ((key === SwingConstants.LEFT) || (key === SwingConstants.CENTER) || (key === SwingConstants.RIGHT) || (key === SwingConstants.LEADING) || (key === SwingConstants.TRAILING)) {
      return key;
    } else {
      throw new IllegalArgumentException(message);
    }
  }
  /**
   * Verify that key is a legal value for the
   * verticalAlignment or verticalTextPosition properties.
   *
   * @param key the property value to check
   * @param message the IllegalArgumentException detail message
   * @return the key value if {@code key} is a legal value for the
   *         verticalAlignment or verticalTextPosition properties
   * @throws IllegalArgumentException if key isn't TOP, CENTER, or BOTTOM.
   * @see #setVerticalAlignment
   * @see #setVerticalTextPosition
   */
  checkVerticalKey(key: number, message: string): number {
    if ((key === SwingConstants.TOP) || (key === SwingConstants.CENTER) || (key === SwingConstants.BOTTOM)) {
      return key;
    } else {
      throw new IllegalArgumentException(message);
    }
  }
  /**
   * Returns the amount of space between the text and the icon
   * displayed in this label.
   *
   * @return an int equal to the number of pixels between the text
   *         and the icon.
   * @see #setIconTextGap
   */
  getIconTextGap(): number {
    return this.iconTextGap;
  }
  /**
   * If both the icon and text properties are set, this property
   * defines the space between them.
   * <p>
   * The default value of this property is 4 pixels.
   * <p>
   * This is a JavaBeans bound property.
   *
   * @param iconTextGap  the space between the icon and text properties
   * @see #getIconTextGap
   */
  setIconTextGap(iconTextGap: number): void {
    let oldValue = this.iconTextGap;
    this.iconTextGap = iconTextGap;
    this.firePropertyChange$String$int$int('iconTextGap', oldValue, iconTextGap);
    if (iconTextGap !== oldValue) {
      this.revalidate();
      this.repaint$();
    }
  }
  /**
   * Returns the alignment of the label's contents along the Y axis.
   *
   * @return   The value of the verticalAlignment property, one of the
   *           following constants defined in <code>SwingConstants</code>:
   *           <code>TOP</code>,
   *           <code>CENTER</code>, or
   *           <code>BOTTOM</code>.
   *
   * @see SwingConstants
   * @see #setVerticalAlignment
   */
  getVerticalAlignment(): number {
    return this.verticalAlignment;
  }
  /**
   * Sets the alignment of the label's contents along the Y axis.
   * <p>
   * The default value of this property is CENTER.
   *
   * @param alignment One of the following constants
   *           defined in <code>SwingConstants</code>:
   *           <code>TOP</code>,
   *           <code>CENTER</code> (the default), or
   *           <code>BOTTOM</code>.
   *
   * @see SwingConstants
   * @see #getVerticalAlignment
   */
  setVerticalAlignment(alignment: number): void {
    if (alignment === this.verticalAlignment) {
      return;
    }
    let oldValue = this.verticalAlignment;
    this.verticalAlignment = this.checkVerticalKey(alignment, 'verticalAlignment');
    this.firePropertyChange$String$int$int('verticalAlignment', oldValue, this.verticalAlignment);
    this.repaint$();
  }
  /**
   * Returns the alignment of the label's contents along the X axis.
   *
   * @return   The value of the horizontalAlignment property, one of the
   *           following constants defined in <code>SwingConstants</code>:
   *           <code>LEFT</code>,
   *           <code>CENTER</code>,
   *           <code>RIGHT</code>,
   *           <code>LEADING</code> or
   *           <code>TRAILING</code>.
   *
   * @see #setHorizontalAlignment
   * @see SwingConstants
   */
  getHorizontalAlignment(): number {
    return this.horizontalAlignment;
  }
  /**
   * Sets the alignment of the label's contents along the X axis.
   * <p>
   * This is a JavaBeans bound property.
   *
   * @param alignment  One of the following constants
   *           defined in <code>SwingConstants</code>:
   *           <code>LEFT</code>,
   *           <code>CENTER</code> (the default for image-only labels),
   *           <code>RIGHT</code>,
   *           <code>LEADING</code> (the default for text-only labels) or
   *           <code>TRAILING</code>.
   *
   * @see SwingConstants
   * @see #getHorizontalAlignment
   */
  setHorizontalAlignment(alignment: number): void {
    if (alignment === this.horizontalAlignment) {
      return;
    }
    let oldValue = this.horizontalAlignment;
    this.horizontalAlignment = this.checkHorizontalKey(alignment, 'horizontalAlignment');
    this.firePropertyChange$String$int$int('horizontalAlignment', oldValue, this.horizontalAlignment);
    this.repaint$();
  }
  /**
   * Returns the vertical position of the label's text,
   * relative to its image.
   *
   * @return   One of the following constants
   *           defined in <code>SwingConstants</code>:
   *           <code>TOP</code>,
   *           <code>CENTER</code>, or
   *           <code>BOTTOM</code>.
   *
   * @see #setVerticalTextPosition
   * @see SwingConstants
   */
  getVerticalTextPosition(): number {
    return this.verticalTextPosition;
  }
  /**
   * Sets the vertical position of the label's text,
   * relative to its image.
   * <p>
   * The default value of this property is CENTER.
   * <p>
   * This is a JavaBeans bound property.
   *
   * @param textPosition  One of the following constants
   *           defined in <code>SwingConstants</code>:
   *           <code>TOP</code>,
   *           <code>CENTER</code> (the default), or
   *           <code>BOTTOM</code>.
   *
   * @see SwingConstants
   * @see #getVerticalTextPosition
   */
  setVerticalTextPosition(textPosition: number): void {
    if (textPosition === this.verticalTextPosition) {
      return;
    }
    let old = this.verticalTextPosition;
    this.verticalTextPosition = this.checkVerticalKey(textPosition, 'verticalTextPosition');
    this.firePropertyChange$String$int$int('verticalTextPosition', old, this.verticalTextPosition);
    this.revalidate();
    this.repaint$();
  }
  /**
   * Returns the horizontal position of the label's text,
   * relative to its image.
   *
   * @return   One of the following constants
   *           defined in <code>SwingConstants</code>:
   *           <code>LEFT</code>,
   *           <code>CENTER</code>,
   *           <code>RIGHT</code>,
   *           <code>LEADING</code> or
   *           <code>TRAILING</code>.
   *
   * @see SwingConstants
   */
  getHorizontalTextPosition(): number {
    return this.horizontalTextPosition;
  }
  /**
   * Sets the horizontal position of the label's text,
   * relative to its image.
   *
   * @param textPosition  One of the following constants
   *           defined in <code>SwingConstants</code>:
   *           <code>LEFT</code>,
   *           <code>CENTER</code>,
   *           <code>RIGHT</code>,
   *           <code>LEADING</code>, or
   *           <code>TRAILING</code> (the default).
   *
   * @see SwingConstants
   */
  setHorizontalTextPosition(textPosition: number): void {
    let old = this.horizontalTextPosition;
    this.horizontalTextPosition = this.checkHorizontalKey(textPosition, 'horizontalTextPosition');
    this.firePropertyChange$String$int$int('horizontalTextPosition', old, this.horizontalTextPosition);
    this.revalidate();
    this.repaint$();
  }
  /**
   * Returns a string representation of this JLabel. This method
   * is intended to be used only for debugging purposes, and the
   * content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not
   * be <code>null</code>.
   *
   * @return  a string representation of this JLabel.
   */
  paramString(): string {
    let textString = (this.text_ != null ? this.text_ : '');
    let defaultIconString = ((this.defaultIcon != null) && (this.defaultIcon !== this) ? this.defaultIcon.toString() : '');
    let disabledIconString = ((this.disabledIcon != null) && (this.disabledIcon !== this) ? this.disabledIcon.toString() : '');
    let labelForString = (this.labelFor != null ? this.labelFor.toString() : '');
    let verticalAlignmentString: string;
    if (this.verticalAlignment === SwingConstants.TOP) {
      verticalAlignmentString = 'TOP';
    } else if (this.verticalAlignment === SwingConstants.CENTER) {
      verticalAlignmentString = 'CENTER';
    } else if (this.verticalAlignment === SwingConstants.BOTTOM) {
      verticalAlignmentString = 'BOTTOM';
    } else {
      verticalAlignmentString = '';
    }
    let horizontalAlignmentString: string;
    if (this.horizontalAlignment === SwingConstants.LEFT) {
      horizontalAlignmentString = 'LEFT';
    } else if (this.horizontalAlignment === SwingConstants.CENTER) {
      horizontalAlignmentString = 'CENTER';
    } else if (this.horizontalAlignment === SwingConstants.RIGHT) {
      horizontalAlignmentString = 'RIGHT';
    } else if (this.horizontalAlignment === SwingConstants.LEADING) {
      horizontalAlignmentString = 'LEADING';
    } else if (this.horizontalAlignment === SwingConstants.TRAILING) {
      horizontalAlignmentString = 'TRAILING';
    } else {
      horizontalAlignmentString = '';
    }
    let verticalTextPositionString: string;
    if (this.verticalTextPosition === SwingConstants.TOP) {
      verticalTextPositionString = 'TOP';
    } else if (this.verticalTextPosition === SwingConstants.CENTER) {
      verticalTextPositionString = 'CENTER';
    } else if (this.verticalTextPosition === SwingConstants.BOTTOM) {
      verticalTextPositionString = 'BOTTOM';
    } else {
      verticalTextPositionString = '';
    }
    let horizontalTextPositionString: string;
    if (this.horizontalTextPosition === SwingConstants.LEFT) {
      horizontalTextPositionString = 'LEFT';
    } else if (this.horizontalTextPosition === SwingConstants.CENTER) {
      horizontalTextPositionString = 'CENTER';
    } else if (this.horizontalTextPosition === SwingConstants.RIGHT) {
      horizontalTextPositionString = 'RIGHT';
    } else if (this.horizontalTextPosition === SwingConstants.LEADING) {
      horizontalTextPositionString = 'LEADING';
    } else if (this.horizontalTextPosition === SwingConstants.TRAILING) {
      horizontalTextPositionString = 'TRAILING';
    } else {
      horizontalTextPositionString = '';
    }
    return super.paramString() + ',defaultIcon=' + defaultIconString + ',disabledIcon=' + disabledIconString + ',horizontalAlignment=' + horizontalAlignmentString + ',horizontalTextPosition=' + horizontalTextPositionString + ',iconTextGap=' + this.iconTextGap + ',labelFor=' + labelForString + ',text=' + textString + ',verticalAlignment=' + verticalAlignmentString + ',verticalTextPosition=' + verticalTextPositionString;
  }
  /**
   * Get the component this is labelling.
   *
   * @return the Component this is labelling.  Can be null if this
   * does not label a Component.  If the displayedMnemonic
   * property is set and the labelFor property is also set, the label
   * will call the requestFocus method of the component specified by the
   * labelFor property when the mnemonic is activated.
   *
   * @see #getDisplayedMnemonic
   * @see #setDisplayedMnemonic
   */
  getLabelFor(): Component {
    return this.labelFor;
  }
  /**
   * Set the component this is labelling.  Can be null if this does not
   * label a Component.  If the displayedMnemonic property is set
   * and the labelFor property is also set, the label will
   * call the requestFocus method of the component specified by the
   * labelFor property when the mnemonic is activated.
   *
   * @param c  the Component this label is for, or null if the label is
   *           not the label for a component
   *
   * @see #getDisplayedMnemonic
   * @see #setDisplayedMnemonic
   */
  setLabelFor(c: Component): void {
    let oldC = this.labelFor;
    this.labelFor = c;
    this.firePropertyChange$String$Object$Object('labelFor', oldC, c);
    if (oldC instanceof JComponent) {
      (oldC).putClientProperty(JLabel.LABELED_BY_PROPERTY, null);
    }
    if (c instanceof JComponent) {
      (c).putClientProperty(JLabel.LABELED_BY_PROPERTY, this);
    }
  }
  /**
   * Get the AccessibleContext of this object
   *
   * @return the AccessibleContext of this object
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext == null) {
      this.accessibleContext = new JLabel$AccessibleJLabel().$o(this)._JLabel$AccessibleJLabel();
    }
    return this.accessibleContext;
  }
}

/**
 * The class used to obtain the accessible role for this object.
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
export class JLabel$AccessibleJLabel extends JComponent$AccessibleJComponent {
  /**
   * Constructs an {@code AccessibleJLabel}.
   */
  _JLabel$AccessibleJLabel(): this {
    this._JComponent$AccessibleJComponent();
    return this;
  }
  /**
   * Get the accessible name of this object.
   *
   * @return the localized name of the object -- can be null if this
   * object does not have a name
   * @see AccessibleContext#setAccessibleName
   */
  getAccessibleName(): string {
    return this.getAccessibleNameCheckIcon(this.getAccessibleNameImpl());
  }
  getAccessibleNameImpl(): string {
    let name = this.accessibleName;
    if (name == null) {
      name = this.$outer.getClientProperty(AccessibleContext.ACCESSIBLE_NAME_PROPERTY);
    }
    if (name == null) {
      name = this.$outer.getText();
    }
    if (name == null) {
      name = super.getAccessibleName();
    }
    return name;
  }
  getAccessibleNameCheckIcon(name: string): string {
    if (((name == null) || (name.length === 0)) && (this.$outer.getIcon() != null)) {
      if ($J.isa(this.$outer.getIcon(), Accessible)) {
        let ac = (this.$outer.getIcon()).getAccessibleContext();
        if (ac != null) {
          name = ac.getAccessibleName();
        }
      }
    }
    return name;
  }
  /**
   * Get the AccessibleRelationSet associated with this object if one
   * exists.  Otherwise return null.
   * @see AccessibleRelation
   * @since 1.3
   */
  getAccessibleRelationSet(): AccessibleRelationSet {
    let relationSet = super.getAccessibleRelationSet();
    if (!relationSet.contains(AccessibleRelation.LABEL_FOR)) {
      let c = this.$outer.getLabelFor();
      if (c != null) {
        let relation = new AccessibleRelation()._AccessibleRelation$String(AccessibleRelation.LABEL_FOR);
        relation.setTarget$Object(c);
        relationSet.add(relation);
      }
    }
    return relationSet;
  }
  /**
   * Returns the tool tip text
   *
   * @return the tool tip text, if supported, of the object;
   * otherwise, null
   * @since 1.4
   */
  getToolTipText(): string {
    return this.$outer.getToolTipText$();
  }
}

$J.define(JLabel, 'javax.swing.JLabel', { kind: 'class', ifaces: ['javax.swing.SwingConstants', 'javax.accessibility.Accessible'], sup: 'javax.swing.JComponent', ctors: { '': '_JLabel$', 'javax.swing.Icon': '_JLabel$Icon', 'javax.swing.Icon,int': '_JLabel$Icon$int', 'java.lang.String': '_JLabel$String', 'java.lang.String,int': '_JLabel$String$int', 'java.lang.String,javax.swing.Icon,int': '_JLabel$String$Icon$int' }, meths: { 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$JLabel', 'setDisplayedMnemonic(char)': 'setDisplayedMnemonic$char', 'setDisplayedMnemonic(int)': 'setDisplayedMnemonic$int', 'setUI(javax.swing.plaf.LabelUI)': 'setUI$LabelUI' } });
$J.define(JLabel$AccessibleJLabel, 'javax.swing.JLabel$AccessibleJLabel', { kind: 'class', ifaces: ['javax.accessibility.AccessibleText', 'javax.accessibility.AccessibleExtendedComponent'], sup: 'javax.swing.JComponent$AccessibleJComponent', ctors: { '': '_JLabel$AccessibleJLabel' }, meths: { 'getAtIndex(int,int)': 'getAtIndex$int$int', 'getAccessibleRole()': 'getAccessibleRole$' }, inner: true });
$J.module(() => {
  Component = $J.load('java.awt.Component');
  Accessible = $J.load('javax.accessibility.Accessible');
  AccessibleContext = $J.load('javax.accessibility.AccessibleContext');
  AccessibleRelation = $J.load('javax.accessibility.AccessibleRelation');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIManager = $J.load('javax.swing.UIManager');
});
