// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/plaf/FreeColComboBoxRenderer.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, InetAddress, Integer, JObject, JString, Logger } from '../../../../../../../jre/index.ts';
import { JLabel } from '../../../../../../javax/swing/JLabel.ts';

let AlphaComposite, Color, ObjectWithId, Messages, Nameable, Named, AudioMixerOption$MixerWrapper, LanguageOption$Language;

/**
 * A {@code ListCellRenderer} to be used by
 * {@code FreeColListUI} and {@code JComboBox}es that
 * display {@code ObjectWithId} values.
 */
export class FreeColComboBoxRenderer<T> extends JObject {
  static logger: Logger = null;
  SELECTED_COMPONENT: FreeColComboBoxRenderer$SelectedComponent = null;
  NORMAL_COMPONENT: FreeColComboBoxRenderer$NormalComponent = null;
  prefix: string = null;
  localize: boolean = false;
  $init_FreeColComboBoxRenderer() {
    this.SELECTED_COMPONENT = new FreeColComboBoxRenderer$SelectedComponent()._FreeColComboBoxRenderer$SelectedComponent();
    this.NORMAL_COMPONENT = new FreeColComboBoxRenderer$NormalComponent()._FreeColComboBoxRenderer$NormalComponent();
    this.localize = true;
  }
  /**
   * Creates a new {@code FreeColComboBoxRenderer} instance
   * with an empty prefix.
   */
  _FreeColComboBoxRenderer$(): this {
    this._FreeColComboBoxRenderer$String('');
    return this;
  }
  /**
   * Creates a new {@code FreeColComboBoxRenderer} instance
   * with a given prefix.
   *
   * @param prefix a {@code String} value
   */
  _FreeColComboBoxRenderer$String(prefix: string): this {
    this._FreeColComboBoxRenderer$String$boolean(prefix, true);
    return this;
  }
  /**
   * Creates a new {@code FreeColComboBoxRenderer} instance
   * with a given prefix.
   *
   * @param prefix a {@code String} value
   * @param localize a {@code boolean} value
   */
  _FreeColComboBoxRenderer$String$boolean(prefix: string, localize: boolean): this {
    this.$init_FreeColComboBoxRenderer();
    this.prefix = prefix;
    this.localize = localize;
    return this;
  }
  /**
   * Returns a {@code ListCellRenderer} for the given
   * {@code JList}.
   *
   * @param list The {@code JList}.
   * @param value The list cell.
   * @param index The index in the list.
   * @param isSelected {@code true} if the given list cell is selected.
   * @param hasFocus {@code false} if the given list cell has the focus.
   * @return The {@code ListCellRenderer}
   */
  getListCellRendererComponent(list: JList<T>, value: T, index: number, isSelected: boolean, hasFocus: boolean): Component {
    let c = isSelected ? this.SELECTED_COMPONENT : this.NORMAL_COMPONENT;
    c.setForeground(list.getForeground());
    c.setFont(list.getFont());
    this.setLabelValues(c, value);
    return c;
  }
  /**
   * Set the text to place in a label.
   *
   * @param c The {@code JLabel} to assign.
   * @param value The object to derive a text value from.
   */
  setLabelValues(c: JLabel, value: T): void {
    if (value == null) {
      c.setText(null);
    } else if ($J.isa(value, Integer)) {
      c.setText($J.str(value));
    } else if (value instanceof LanguageOption$Language) {
      c.setText($J.str(value));
    } else if ($J.isa(value, JString)) {
      let string$ = value;
      if (this.localize) {
        let nd = Messages.getBestNameAndDescription$String(string$);
        c.setText(nd[0]);
        if (nd[1] != null) {
          c.setToolTipText(nd[1]);
        }
      } else {
        c.setText(string$);
      }
    } else if ($J.isa(value, Named)) {
      let named = value;
      let nad = Messages.getBestNameAndDescription$Named(named);
      c.setText(nad[0]);
      if (nad[1] != null) {
        c.setToolTipText(nad[1]);
      }
    } else if ($J.isa(value, ObjectWithId)) {
      let id = ((this.prefix == null) ? '' : this.prefix) + (value).getId();
      let nd = Messages.getBestNameAndDescription$String(id);
      if ($J.isa(value, Nameable)) {
        let realname = (value).getName();
        if (realname != null) {
          nd[0] = realname;
        }
      }
      c.setText(nd[0]);
      if (nd[1] != null) {
        c.setToolTipText(nd[1]);
      }
    } else if ($J.isa(value, InetAddress)) {
      let address = value;
      c.setText(address.getHostAddress());
    } else if (value instanceof AudioMixerOption$MixerWrapper) {
      let mw = value;
      c.setText(mw.getKey());
    } else {
      FreeColComboBoxRenderer.logger.warning('What is this?: ' + $J.str(value) + ' (' + $J.str($J.getClass(value)) + ')');
    }
  }
  static $clinit() {
    FreeColComboBoxRenderer.logger = Logger.getLogger($J.cls(FreeColComboBoxRenderer).getName());
  }
}

export class FreeColComboBoxRenderer$SelectedComponent extends JLabel {
  _FreeColComboBoxRenderer$SelectedComponent(): this {
    this._JLabel$();
    this.setOpaque(false);
    return this;
  }
  paintComponent(g: Graphics): void {
    let g2d = g;
    let oldComposite = g2d.getComposite();
    let oldColor = g2d.getColor();
    g2d.setComposite(AlphaComposite.getInstance$int$float(AlphaComposite.SRC_OVER, Math.fround(0.1)));
    g2d.setColor(Color.BLACK);
    g2d.fillRect(0, 0, this.getWidth(), this.getHeight());
    g2d.setComposite(oldComposite);
    g2d.setColor(oldColor);
    super.paintComponent(g);
  }
}

export class FreeColComboBoxRenderer$NormalComponent extends JLabel {
  _FreeColComboBoxRenderer$NormalComponent(): this {
    this._JLabel$();
    this.setOpaque(false);
    return this;
  }
}

$J.define(FreeColComboBoxRenderer, 'net.sf.freecol.client.gui.plaf.FreeColComboBoxRenderer', { kind: 'class', ifaces: ['javax.swing.ListCellRenderer', 'javax.swing.plaf.UIResource'], sup: 'java.lang.Object', ctors: { 'java.lang.String,boolean': '_FreeColComboBoxRenderer$String$boolean', 'java.lang.String': '_FreeColComboBoxRenderer$String', '': '_FreeColComboBoxRenderer$' }, clinit: true, lazy: ['logger'] });
$J.define(FreeColComboBoxRenderer$SelectedComponent, 'net.sf.freecol.client.gui.plaf.FreeColComboBoxRenderer$SelectedComponent', { kind: 'class', sup: 'javax.swing.JLabel', ctors: { '': '_FreeColComboBoxRenderer$SelectedComponent' } });
$J.define(FreeColComboBoxRenderer$NormalComponent, 'net.sf.freecol.client.gui.plaf.FreeColComboBoxRenderer$NormalComponent', { kind: 'class', sup: 'javax.swing.JLabel', ctors: { '': '_FreeColComboBoxRenderer$NormalComponent' } });
$J.module(() => {
  AlphaComposite = $J.load('java.awt.AlphaComposite');
  Color = $J.load('java.awt.Color');
  ObjectWithId = $J.load('net.sf.freecol.common.ObjectWithId');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Nameable = $J.load('net.sf.freecol.common.model.Nameable');
  Named = $J.load('net.sf.freecol.common.model.Named');
  AudioMixerOption$MixerWrapper = $J.load('net.sf.freecol.common.option.AudioMixerOption$MixerWrapper');
  LanguageOption$Language = $J.load('net.sf.freecol.common.option.LanguageOption$Language');
});
