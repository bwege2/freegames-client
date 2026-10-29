// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/colorchooser/AbstractColorChooserPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2015, Oracle and/or its affiliates. All rights reserved.
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
import { $J, Integer, JBoolean, JString, NumberFormatException, RuntimeException } from '../../../../jre/index.ts';
import { JPanel } from '../JPanel.ts';

let UIManager;

/**
 * This is the abstract superclass for color choosers.  If you want to add
 * a new color chooser panel into a <code>JColorChooser</code>, subclass
 * this class.
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
 * @author Tom Santos
 * @author Steve Wilson
 */
export class AbstractColorChooserPanel extends JPanel {
  /**
   * Identifies that the transparency of the color (alpha value) can be
   * selected
   */
  static readonly TRANSPARENCY_ENABLED_PROPERTY: string = 'TransparencyEnabled';
  enabledListener: PropertyChangeListener = null;
  chooser: JColorChooser = null;
  /**
   * Constructor for subclasses to call.
   */
  _AbstractColorChooserPanel(): this {
    this._JPanel$();
    this.enabledListener = (event) => {
      let value = event.getNewValue();
      if ($J.isa(value, JBoolean)) {
        this.setEnabled(value);
      }
    };
    return this;
  }
  /**
   * Invoked when the panel is added to the chooser.
   * If you override this, be sure to call <code>super</code>.
   *
   * @param enclosingChooser the chooser to which the panel is to be added
   * @throws RuntimeException  if the chooser panel has already been
   *                          installed
   */
  installChooserPanel(enclosingChooser: JColorChooser): void {
    if (this.chooser != null) {
      throw new RuntimeException('This chooser panel is already installed');
    }
    this.chooser = enclosingChooser;
    this.chooser.addPropertyChangeListener$String$PropertyChangeListener('enabled', this.enabledListener);
    this.setEnabled(this.chooser.isEnabled());
    this.buildChooser();
    this.updateChooser();
  }
  /**
   * Invoked when the panel is removed from the chooser.
   * If override this, be sure to call <code>super</code>.
   *
   * @param enclosingChooser the chooser from which the panel is to be removed
   */
  uninstallChooserPanel(enclosingChooser: JColorChooser): void {
    this.chooser.removePropertyChangeListener$String$PropertyChangeListener('enabled', this.enabledListener);
    this.chooser = null;
  }
  /**
   * Returns the model that the chooser panel is editing.
   * @return the <code>ColorSelectionModel</code> model this panel
   *         is editing
   */
  getColorSelectionModel(): ColorSelectionModel {
    return (this.chooser != null) ? this.chooser.getSelectionModel() : null;
  }
  /**
   * Returns the color that is currently selected.
   * @return the <code>Color</code> that is selected
   */
  getColorFromModel(): Color {
    let model = this.getColorSelectionModel();
    return (model != null) ? model.getSelectedColor() : null;
  }
  setSelectedColor(color: Color): void {
    let model = this.getColorSelectionModel();
    if (model != null) {
      model.setSelectedColor(color);
    }
  }
  /**
   * Sets whether color chooser panel allows to select the transparency
   * (alpha value) of a color.
   * This method fires a property-changed event, using the string value of
   * {@code TRANSPARENCY_ENABLED_PROPERTY} as the name
   * of the property.
   *
   * <p>The value is a hint and may not be applicable to all types of chooser
   * panel.
   *
   * <p>The default value is {@code true}.
   *
   * @param b true if the transparency of a color can be selected
   * @see #isColorTransparencySelectionEnabled()
   * @since 9
   */
  setColorTransparencySelectionEnabled(b: boolean): void {
  }
  /**
   * Draws the panel.
   * @param g  the <code>Graphics</code> object
   */
  paint(g: Graphics): void {
    super.paint(g);
  }
  /**
   * Returns an integer from the defaults table. If <code>key</code> does
   * not map to a valid <code>Integer</code>, <code>default</code> is
   * returned.
   *
   * @param key  an <code>Object</code> specifying the int
   * @param defaultValue Returned value if <code>key</code> is not available,
   *                     or is not an Integer
   * @return the int
   */
  getInt(key: any, defaultValue: number): number {
    let value = UIManager.get$Object$Locale(key, this.getLocale$());
    if ($J.isa(value, Integer)) {
      return (+(value));
    }
    if ($J.isa(value, JString)) {
      try {
        return $J.parseInt(value);
      } catch ($e0) {
        if ($J.isa($e0, NumberFormatException)) {
          let nfe = $J.exc($e0);
        } else {
          throw $e0;
        }
      }
    }
    return defaultValue;
  }
}

$J.define(AbstractColorChooserPanel, 'javax.swing.colorchooser.AbstractColorChooserPanel', { kind: 'class', sup: 'javax.swing.JPanel', ctors: { '': '_AbstractColorChooserPanel' } });
$J.module(() => {
  UIManager = $J.load('javax.swing.UIManager');
});
