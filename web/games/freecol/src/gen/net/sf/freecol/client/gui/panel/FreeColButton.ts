// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/FreeColButton.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/**
 *  Copyright (C) 2002-2022   The FreeCol Team
 *
 *  This file is part of FreeCol.
 *
 *  FreeCol is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  FreeCol is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with FreeCol.  If not, see <http://www.gnu.org/licenses/>.
 */
import { $J, JEnum } from '../../../../../../../jre/index.ts';
import { JButton } from '../../../../../../javax/swing/JButton.ts';

export class FreeColButton extends JButton {
  static BUTTON_STYLE_PROPERTY_NAME: string = null;
  buttonStyle: FreeColButton$ButtonStyle = null;
  _FreeColButton$(): this {
    this._JButton$();
    return this;
  }
  _FreeColButton$Action(a: Action): this {
    this._JButton$Action(a);
    return this;
  }
  _FreeColButton$ButtonStyle$Action(buttonStyle: FreeColButton$ButtonStyle, a: Action): this {
    this._JButton$Action(a);
    this.buttonStyle = buttonStyle;
    this.updateUI();
    return this;
  }
  _FreeColButton$Icon(icon: Icon): this {
    this._JButton$Icon(icon);
    return this;
  }
  _FreeColButton$String$Icon(text: string, icon: Icon): this {
    this._JButton$String$Icon(text, icon);
    return this;
  }
  _FreeColButton$String(text: string): this {
    this._JButton$String(text);
    return this;
  }
  withButtonStyle(buttonStyle: FreeColButton$ButtonStyle): FreeColButton {
    let oldStyle = this.buttonStyle;
    this.buttonStyle = buttonStyle;
    this.firePropertyChange$String$Object$Object(FreeColButton.BUTTON_STYLE_PROPERTY_NAME, oldStyle, buttonStyle);
    return this;
  }
  getButtonStyle(): FreeColButton$ButtonStyle {
    return this.buttonStyle;
  }
  static $clinit() {
    FreeColButton.BUTTON_STYLE_PROPERTY_NAME = 'buttonStyle';
  }
}

export class FreeColButton$ButtonStyle extends JEnum {
  static IMPORTANT: FreeColButton$ButtonStyle = null;
  static SIMPLE: FreeColButton$ButtonStyle = null;
  static TRANSPARENT: FreeColButton$ButtonStyle = null;
  static $VALUES: FreeColButton$ButtonStyle[] = null;
  _FreeColButton$ButtonStyle($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): FreeColButton$ButtonStyle[] { return FreeColButton$ButtonStyle.$VALUES.slice(); }
  static valueOf(name: string): FreeColButton$ButtonStyle { return $J.enumValueOf(FreeColButton$ButtonStyle, name); }
  static $clinit() {
    FreeColButton$ButtonStyle.IMPORTANT = new FreeColButton$ButtonStyle()._FreeColButton$ButtonStyle('IMPORTANT', 0);
    FreeColButton$ButtonStyle.SIMPLE = new FreeColButton$ButtonStyle()._FreeColButton$ButtonStyle('SIMPLE', 1);
    FreeColButton$ButtonStyle.TRANSPARENT = new FreeColButton$ButtonStyle()._FreeColButton$ButtonStyle('TRANSPARENT', 2);
    FreeColButton$ButtonStyle.$VALUES = [FreeColButton$ButtonStyle.IMPORTANT, FreeColButton$ButtonStyle.SIMPLE, FreeColButton$ButtonStyle.TRANSPARENT];
  }
}

$J.define(FreeColButton, 'net.sf.freecol.client.gui.panel.FreeColButton', { kind: 'class', sup: 'javax.swing.JButton', ctors: { 'java.lang.String': '_FreeColButton$String', 'java.lang.String,javax.swing.Icon': '_FreeColButton$String$Icon', 'javax.swing.Icon': '_FreeColButton$Icon', 'net.sf.freecol.client.gui.panel.FreeColButton$ButtonStyle,javax.swing.Action': '_FreeColButton$ButtonStyle$Action', 'javax.swing.Action': '_FreeColButton$Action', '': '_FreeColButton$' }, returns: { 'getButtonStyle': 'net.sf.freecol.client.gui.panel.FreeColButton$ButtonStyle' }, clinit: true, lazy: ['BUTTON_STYLE_PROPERTY_NAME'] });
$J.define(FreeColButton$ButtonStyle, 'net.sf.freecol.client.gui.panel.FreeColButton$ButtonStyle', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_FreeColButton$ButtonStyle' }, clinit: true, lazy: ['$VALUES', 'IMPORTANT', 'SIMPLE', 'TRANSPARENT'] });
