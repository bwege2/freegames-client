// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/dialog/ConfirmDeclarationDialog.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, HashMap, JString, Logger } from '../../../../../../../jre/index.ts';
import { FreeColDialog } from './FreeColDialog.ts';
import { JButton } from '../../../../../../javax/swing/JButton.ts';
import { FreeColComboBoxRenderer } from '../plaf/FreeColComboBoxRenderer.ts';

let Color, ImageIcon, JColorChooser, JComboBox, JLabel, JTextField, SwingConstants, MigLayout, ChoiceItem, Flag, Flag$Background, Flag$Decoration, Flag$UnionPosition, Flag$UnionShape, FreeColDialog$DialogType, MigPanel, Utility, Messages, StringTemplate;

/**
 * A dialog used to confirm the declaration of independence.
 */
export class ConfirmDeclarationDialog extends FreeColDialog {
  static logger: Logger = null;
  static SPANISH_FLAG: Flag = null;
  static PORTUGUESE_FLAG: Flag = null;
  static ENGLISH_FLAG: Flag = null;
  static FRENCH_FLAG: Flag = null;
  static DUTCH_FLAG: Flag = null;
  static SWEDISH_FLAG: Flag = null;
  static DANISH_FLAG: Flag = null;
  static RUSSIAN_FLAG: Flag = null;
  /**
   * A map of default nation flags.
   */
  static defaultFlags: JMap<string, Flag> = null;
  /**
   * Independent country name.
   */
  countryField: JTextField = null;
  /**
   * Independent nation name.
   */
  nationField: JTextField = null;
  /**
   * Label with the icon of the flag.
   */
  label: JLabel = null;
  /**
   * The flag to use for the new nation.
   */
  flag: Flag = null;
  /**
   * A box to select the flag background from.
   */
  background$ConfirmDeclarationDialog: JComboBox<Flag$Background> = null;
  /**
   * A box to select the flag decoration from.
   */
  decoration: JComboBox<Flag$Decoration> = null;
  /**
   * A box to select the union position with.
   */
  unionPosition: JComboBox<Flag$UnionPosition> = null;
  /**
   * A box to select the union shap with.
   */
  unionShape: JComboBox<Flag$UnionShape> = null;
  /**
   * A box to select the number of stars with.
   */
  stars: JComboBox<string> = null;
  /**
   * A box to select the number of stripes with.
   */
  stripes: JComboBox<string> = null;
  /**
   * The selected decoration colour.
   */
  decorationColor: ConfirmDeclarationDialog$ColorButton = null;
  /**
   * The selected union colour.
   */
  unionColor: ConfirmDeclarationDialog$ColorButton = null;
  /**
   * The selected star colour.
   */
  starColor: ConfirmDeclarationDialog$ColorButton = null;
  /**
   * The selected background colours.
   */
  backgroundColors: ConfirmDeclarationDialog$ColorButton[] = null;
  /**
   * The constructor that will add the items to this panel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param frame The owner frame.
   */
  _ConfirmDeclarationDialog(freeColClient: FreeColClient, frame: JFrame): this {
    this._FreeColDialog$FreeColClient$JFrame(freeColClient, frame);
    this.background$ConfirmDeclarationDialog = new JComboBox()._JComboBox$ObjectArr(Flag$Background.values());
    this.decoration = new JComboBox()._JComboBox$ObjectArr(Flag$Decoration.values());
    this.unionPosition = new JComboBox()._JComboBox$ObjectArr(Flag$UnionPosition.values());
    this.unionShape = new JComboBox()._JComboBox$ObjectArr(Flag$UnionShape.values());
    this.stars = new JComboBox()._JComboBox$ObjectArr(this.getNumbers(50));
    this.stripes = new JComboBox()._JComboBox$ObjectArr(this.getNumbers(13));
    this.decorationColor = new ConfirmDeclarationDialog$ColorButton()._ConfirmDeclarationDialog$ColorButton(Color.WHITE);
    this.unionColor = new ConfirmDeclarationDialog$ColorButton()._ConfirmDeclarationDialog$ColorButton(Color.BLUE);
    this.starColor = new ConfirmDeclarationDialog$ColorButton()._ConfirmDeclarationDialog$ColorButton(Color.WHITE);
    this.backgroundColors = [new ConfirmDeclarationDialog$ColorButton()._ConfirmDeclarationDialog$ColorButton(null), new ConfirmDeclarationDialog$ColorButton()._ConfirmDeclarationDialog$ColorButton(null), new ConfirmDeclarationDialog$ColorButton()._ConfirmDeclarationDialog$ColorButton(null), new ConfirmDeclarationDialog$ColorButton()._ConfirmDeclarationDialog$ColorButton(null), new ConfirmDeclarationDialog$ColorButton()._ConfirmDeclarationDialog$ColorButton(null), new ConfirmDeclarationDialog$ColorButton()._ConfirmDeclarationDialog$ColorButton(null)];
    let player = freeColClient.getMyPlayer();
    this.flag = ConfirmDeclarationDialog.defaultFlags.get(player.getNationId());
    if (this.flag == null) {
      this.flag = ConfirmDeclarationDialog.ENGLISH_FLAG;
    }
    let sure = StringTemplate.template$String('confirmDeclarationDialog.areYouSure.text').addNamed$String$Named('%monarch%', player.getMonarch());
    let country = StringTemplate.template$String('confirmDeclarationDialog.defaultCountry').addStringTemplate$String$StringTemplate('%nation%', player.getNationLabel());
    this.countryField = new JTextField()._JTextField$String$int(Messages.message$StringTemplate(country), 20);
    let nation = StringTemplate.template$String('confirmDeclarationDialog.defaultNation').addStringTemplate$String$StringTemplate('%nation%', player.getNationLabel());
    this.nationField = new JTextField()._JTextField$String$int(Messages.message$StringTemplate(nation), 20);
    this.label = new JLabel()._JLabel$();
    this.label.setIcon(new ImageIcon()._ImageIcon$Image(this.flag.getImage()));
    this.label.setHorizontalAlignment(SwingConstants.CENTER);
    this.label.setVerticalAlignment(SwingConstants.CENTER);
    let panel = new MigPanel()._MigPanel$LayoutManager(new MigLayout()._MigLayout$String$String$String('wrap 1', '[][fill]', '[fill]'));
    panel.add$Component(Utility.localizedTextArea$StringTemplate(sure));
    panel.add$Component(Utility.localizedTextArea$String('confirmDeclarationDialog.enterCountry'));
    panel.add$Component(this.countryField);
    panel.add$Component(Utility.localizedTextArea$String('confirmDeclarationDialog.enterNation'));
    panel.add$Component(this.nationField);
    panel.add$Component(Utility.localizedTextArea$String('confirmDeclarationDialog.createFlag'));
    panel.add$Component$Object(this.label, 'skip, width 100%, height 100%');
    let flagPanel = new MigPanel()._MigPanel$LayoutManager(new MigLayout()._MigLayout$String$String$String('wrap 2', '[][fill]', '[fill]'));
    this.addComboBox(flagPanel, this.background$ConfirmDeclarationDialog, 'flag.background.', this.flag.getBackground());
    this.addComboBox(flagPanel, this.decoration, 'flag.decoration.', this.flag.getDecoration());
    this.addComboBox(flagPanel, this.unionPosition, 'flag.unionPosition.', this.flag.getUnionPosition());
    this.addComboBox(flagPanel, this.unionShape, 'flag.unionShape.', this.flag.getUnionShape());
    this.stars.setSelectedIndex((this.flag.getStars() - 1) | 0);
    this.stars.addItemListener($J.fn(this, 'itemStateChanged'));
    flagPanel.add$Component(Utility.localizedLabel$String('flag.stars.label'));
    flagPanel.add$Component(this.stars);
    this.stripes.setSelectedIndex((this.flag.getStripes() - 1) | 0);
    this.stripes.addItemListener($J.fn(this, 'itemStateChanged'));
    flagPanel.add$Component(Utility.localizedLabel$String('flag.stripes.label'));
    flagPanel.add$Component(this.stripes);
    this.unionColor.setColor(this.flag.getUnionColor());
    this.unionColor.addActionListener($J.fn(this, 'actionPerformed'));
    flagPanel.add$Component(Utility.localizedLabel$String('flag.unionColor.label'));
    flagPanel.add$Component$Object(this.unionColor, 'sg colorButton');
    this.decorationColor.setColor(this.flag.getDecorationColor());
    this.decorationColor.addActionListener($J.fn(this, 'actionPerformed'));
    flagPanel.add$Component(Utility.localizedLabel$String('flag.decorationColor.label'));
    flagPanel.add$Component(this.decorationColor);
    this.starColor.setColor(this.flag.getStarColor());
    this.starColor.addActionListener($J.fn(this, 'actionPerformed'));
    flagPanel.add$Component(Utility.localizedLabel$String('flag.starColor.label'));
    flagPanel.add$Component(this.starColor);
    let flagColors = this.flag.getBackgroundColors();
    let colors = flagColors.size();
    flagPanel.add$Component(Utility.localizedLabel$String('flag.backgroundColors.label'));
    for (let index = 0; index < this.backgroundColors.length; index++) {
      let button = this.backgroundColors[index];
      if (index < colors) {
        button.setColor(flagColors.get(index));
      }
      button.addActionListener($J.fn(this, 'actionPerformed'));
      if (index === 0) {
        flagPanel.add$Component$Object(button, 'split 3, sg colorButton');
      } else if (index % 3 === 0) {
        flagPanel.add$Component$Object(button, 'skip, split 3, sg colorButton');
      } else {
        flagPanel.add$Component$Object(button, 'sg colorButton');
      }
    }
    panel.add$Component$Object(flagPanel, 'cell 1 0, spany');
    let icon = new ImageIcon()._ImageIcon$Image(this.getImageLibrary().getSmallNationImage(player.getNation()));
    let c = FreeColDialog.choices();
    c.add(new ChoiceItem()._ChoiceItem$String$Object(Messages.message$String('confirmDeclarationDialog.areYouSure.yes'), null).okOption());
    c.add(new ChoiceItem()._ChoiceItem$String$Object(Messages.message$String('confirmDeclarationDialog.areYouSure.no'), null).cancelOption().defaultOption());
    this.initializeDialog(frame, FreeColDialog$DialogType.QUESTION, true, panel, icon, c);
    return this;
  }
  addComboBox<T>(panel: JPanel, box: JComboBox<T>, prefix: string, value: T): void {
    box.setRenderer(new ConfirmDeclarationDialog$EnumRenderer()._ConfirmDeclarationDialog$EnumRenderer(prefix));
    box.setSelectedItem(value);
    box.addItemListener($J.fn(this, 'itemStateChanged'));
    panel.add$Component(Utility.localizedLabel$String(prefix + 'label'));
    panel.add$Component(box);
  }
  setColors(): void {
    this.flag.setUnionColor(this.unionColor.getColor());
    this.flag.setStarColor(this.starColor.getColor());
    this.flag.setDecorationColor(this.decorationColor.getColor());
    let colors = new ArrayList();
    for (let button of this.backgroundColors) {
      let color = button.getColor();
      if (color != null) {
        colors.add(color);
      }
      this.flag.setBackgroundColors$List(colors);
    }
  }
  getNumbers(count: number): string[] {
    let result = $J.newArray(count, null);
    for (let index = 0; index < count; index++) {
      result[index] = String((index + 1) | 0);
    }
    return result;
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    let button = ae.getSource();
    let color = JColorChooser.showDialog$Component$String$Color(this, this.label.getText(), button.getBackground());
    button.setColor(color);
    this.setColors();
    this.label.setIcon(new ImageIcon()._ImageIcon$Image(this.flag.getImage()));
  }
  /**
   * {@inheritDoc}
   */
  itemStateChanged(e: ItemEvent): void {
    let newBackground = this.background$ConfirmDeclarationDialog.getSelectedItem();
    let newDecoration = this.decoration.getSelectedItem();
    let newPosition = this.unionPosition.getSelectedItem();
    let newShape = this.unionShape.getSelectedItem();
    this.flag = new Flag()._Flag$Background$Decoration$UnionPosition$UnionShape(newBackground, newDecoration, newPosition, newShape);
    this.flag.setStars((this.stars.getSelectedIndex() + 1) | 0);
    this.flag.setStripes((this.stripes.getSelectedIndex() + 1) | 0);
    this.setColors();
    this.label.setIcon(new ImageIcon()._ImageIcon$Image(this.flag.getImage()));
  }
  /**
   * {@inheritDoc}
   */
  getResponse(): List<string> {
    let value = this.getValue();
    if (!this.options.get(0).equals(value)) {
      return null;
    }
    let result = new ArrayList();
    result.add(JString.replaceAll(this.nationField.getText$(), '[^\\s\\w]', ''));
    result.add(this.countryField.getText$());
    return result;
  }
  static $clinit() {
    ConfirmDeclarationDialog.logger = Logger.getLogger($J.cls(ConfirmDeclarationDialog).getName());
    ConfirmDeclarationDialog.SPANISH_FLAG = new Flag()._Flag$Background$Decoration$UnionPosition(Flag$Background.FESSES, Flag$Decoration.NONE, Flag$UnionPosition.MIDDLE).setStripes(3).setUnionColor(null).setBackgroundColors$ColorArr([new Color()._Color$int$int$int(207, 20, 43), new Color()._Color$int$int$int(0, 36, 125), new Color()._Color$int$int$int(255, 204, 0)]);
    ConfirmDeclarationDialog.PORTUGUESE_FLAG = new Flag()._Flag$Background$Decoration$UnionPosition(Flag$Background.FESSES, Flag$Decoration.NONE, Flag$UnionPosition.CANTON).setUnionColor(new Color()._Color$int$int$int(62, 64, 149)).setBackgroundColors$ColorArr([new Color()._Color$int$int$int(0, 168, 89), new Color()._Color$int$int$int(255, 204, 41)]);
    ConfirmDeclarationDialog.ENGLISH_FLAG = new Flag()._Flag$Background$Decoration$UnionPosition(Flag$Background.FESSES, Flag$Decoration.NONE, Flag$UnionPosition.CANTON).setUnionColor(new Color()._Color$float$float$float(Math.fround(0.234), Math.fround(0.233), Math.fround(0.43))).setBackgroundColors$ColorArr([new Color()._Color$float$float$float(Math.fround(0.698), Math.fround(0.132), Math.fround(0.203)), Color.WHITE]);
    ConfirmDeclarationDialog.FRENCH_FLAG = new Flag()._Flag$Background$Decoration$UnionPosition(Flag$Background.PALES, Flag$Decoration.NONE, Flag$UnionPosition.LEFT).setStripes(3).setUnionColor(null).setBackgroundColors$ColorArr([new Color()._Color$int$int$int(0, 35, 149), Color.WHITE, new Color()._Color$int$int$int(237, 41, 57)]);
    ConfirmDeclarationDialog.DUTCH_FLAG = new Flag()._Flag$Background$Decoration$UnionPosition(Flag$Background.FESSES, Flag$Decoration.NONE, Flag$UnionPosition.TOP).setStripes(3).setUnionColor(null).setBackgroundColors$ColorArr([new Color()._Color$int$int$int(174, 28, 40), Color.WHITE, new Color()._Color$int$int$int(33, 70, 107)]);
    ConfirmDeclarationDialog.SWEDISH_FLAG = new Flag()._Flag$Background$Decoration$UnionPosition(Flag$Background.QUARTERLY, Flag$Decoration.SCANDINAVIAN_CROSS, Flag$UnionPosition.CANTON).setUnionColor(null).setDecorationColor(new Color()._Color$int$int$int(254, 203, 0)).setBackgroundColors$ColorArr([new Color()._Color$int$int$int(0, 82, 147)]);
    ConfirmDeclarationDialog.DANISH_FLAG = new Flag()._Flag$Background$Decoration$UnionPosition(Flag$Background.QUARTERLY, Flag$Decoration.SCANDINAVIAN_CROSS, Flag$UnionPosition.CANTON).setUnionColor(null).setDecorationColor(Color.WHITE).setBackgroundColors$ColorArr([new Color()._Color$int$int$int(198, 12, 48)]);
    ConfirmDeclarationDialog.RUSSIAN_FLAG = new Flag()._Flag$Background$Decoration$UnionPosition(Flag$Background.FESSES, Flag$Decoration.NONE, Flag$UnionPosition.MIDDLE).setStripes(3).setUnionColor(null).setBackgroundColors$ColorArr([Color.WHITE, new Color()._Color$int$int$int(0, 57, 166), new Color()._Color$int$int$int(213, 43, 30)]);
    ConfirmDeclarationDialog.defaultFlags = new HashMap();
    ConfirmDeclarationDialog.defaultFlags.put('model.nation.dutch', ConfirmDeclarationDialog.DUTCH_FLAG);
    ConfirmDeclarationDialog.defaultFlags.put('model.nation.english', ConfirmDeclarationDialog.ENGLISH_FLAG);
    ConfirmDeclarationDialog.defaultFlags.put('model.nation.french', ConfirmDeclarationDialog.FRENCH_FLAG);
    ConfirmDeclarationDialog.defaultFlags.put('model.nation.spanish', ConfirmDeclarationDialog.SPANISH_FLAG);
    ConfirmDeclarationDialog.defaultFlags.put('model.nation.danish', ConfirmDeclarationDialog.DANISH_FLAG);
    ConfirmDeclarationDialog.defaultFlags.put('model.nation.portuguese', ConfirmDeclarationDialog.PORTUGUESE_FLAG);
    ConfirmDeclarationDialog.defaultFlags.put('model.nation.russian', ConfirmDeclarationDialog.RUSSIAN_FLAG);
    ConfirmDeclarationDialog.defaultFlags.put('model.nation.swedish', ConfirmDeclarationDialog.SWEDISH_FLAG);
  }
}

/**
 * A button for a colour.  Public for FlagTest.
 */
export class ConfirmDeclarationDialog$ColorButton extends JButton {
  color: Color = null;
  _ConfirmDeclarationDialog$ColorButton(color: Color): this {
    this._JButton$();
    this.color = null;
    this.setColor(color);
    return this;
  }
  getColor(): Color {
    return this.color;
  }
  setColor(color: Color): void {
    this.color = color;
    this.setBackground(color);
    this.setText(color == null ? 'X' : null);
  }
  /**
   * {@inheritDoc}
   */
  getUIClassID(): string {
    return 'ColorButtonUI';
  }
}

/**
 * Simple renderer for Messages with a prefix.
 */
export class ConfirmDeclarationDialog$EnumRenderer<T> extends FreeColComboBoxRenderer {
  prefix$ConfirmDeclarationDialog_EnumRenderer: string = null;
  _ConfirmDeclarationDialog$EnumRenderer(prefix: string): this {
    this._FreeColComboBoxRenderer$();
    this.prefix$ConfirmDeclarationDialog_EnumRenderer = prefix;
    return this;
  }
  /**
   * {@inheritDoc}
   */
  setLabelValues(c: JLabel, value: T): void {
    c.setText(Messages.message$String(this.prefix$ConfirmDeclarationDialog_EnumRenderer + $J.str(value)));
  }
}

$J.define(ConfirmDeclarationDialog, 'net.sf.freecol.client.gui.dialog.ConfirmDeclarationDialog', { kind: 'class', ifaces: ['java.awt.event.ActionListener', 'java.awt.event.ItemListener'], sup: 'net.sf.freecol.client.gui.dialog.FreeColDialog', ctors: { 'net.sf.freecol.client.FreeColClient,javax.swing.JFrame': '_ConfirmDeclarationDialog' }, returns: { 'getResponse': 'java.util.List' }, clinit: true, lazy: ['logger', 'SPANISH_FLAG', 'PORTUGUESE_FLAG', 'ENGLISH_FLAG', 'FRENCH_FLAG', 'DUTCH_FLAG', 'SWEDISH_FLAG', 'DANISH_FLAG', 'RUSSIAN_FLAG', 'defaultFlags'] });
$J.define(ConfirmDeclarationDialog$ColorButton, 'net.sf.freecol.client.gui.dialog.ConfirmDeclarationDialog$ColorButton', { kind: 'class', sup: 'javax.swing.JButton', ctors: { 'java.awt.Color': '_ConfirmDeclarationDialog$ColorButton' }, returns: { 'getUIClassID': 'java.lang.String', 'getColor': 'java.awt.Color' } });
$J.define(ConfirmDeclarationDialog$EnumRenderer, 'net.sf.freecol.client.gui.dialog.ConfirmDeclarationDialog$EnumRenderer', { kind: 'class', sup: 'net.sf.freecol.client.gui.plaf.FreeColComboBoxRenderer', ctors: { 'java.lang.String': '_ConfirmDeclarationDialog$EnumRenderer' } });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JColorChooser = $J.load('javax.swing.JColorChooser');
  JComboBox = $J.load('javax.swing.JComboBox');
  JLabel = $J.load('javax.swing.JLabel');
  JTextField = $J.load('javax.swing.JTextField');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  ChoiceItem = $J.load('net.sf.freecol.client.gui.ChoiceItem');
  Flag = $J.load('net.sf.freecol.client.gui.dialog.Flag');
  Flag$Background = $J.load('net.sf.freecol.client.gui.dialog.Flag$Background');
  Flag$Decoration = $J.load('net.sf.freecol.client.gui.dialog.Flag$Decoration');
  Flag$UnionPosition = $J.load('net.sf.freecol.client.gui.dialog.Flag$UnionPosition');
  Flag$UnionShape = $J.load('net.sf.freecol.client.gui.dialog.Flag$UnionShape');
  FreeColDialog$DialogType = $J.load('net.sf.freecol.client.gui.dialog.FreeColDialog$DialogType');
  MigPanel = $J.load('net.sf.freecol.client.gui.panel.MigPanel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
});
