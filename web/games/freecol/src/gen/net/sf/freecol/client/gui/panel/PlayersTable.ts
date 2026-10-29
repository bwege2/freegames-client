// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/PlayersTable.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, HashMap, JObject, JString } from '../../../../../../../jre/index.ts';
import { JTable } from '../../../../../../javax/swing/JTable.ts';
import { DefaultCellEditor } from '../../../../../../javax/swing/DefaultCellEditor.ts';
import { JLabel } from '../../../../../../javax/swing/JLabel.ts';
import { AbstractCellEditor } from '../../../../../../javax/swing/AbstractCellEditor.ts';
import { MouseAdapter } from '../../../../../../java/awt/event/MouseAdapter.ts';
import { AbstractTableModel } from '../../../../../../javax/swing/table/AbstractTableModel.ts';

let Color, ImageIcon, JButton, JComboBox, SwingConstants, DefaultTableCellRenderer, FontLibrary, ColopediaAction$PanelType, ColorCellEditor, ColorCellRenderer, Utility, FreeColComboBoxRenderer, Messages, EuropeanNationType, Nation, NationOptions$Advantages, NationOptions$NationState, NationType, Player, StringTemplate, CollectionUtils;

/**
 * The table of players.
 */
export class PlayersTable extends JTable {
  static readonly NATION_COLUMN: number = 0;
  static readonly AVAILABILITY_COLUMN: number = 1;
  static readonly ADVANTAGE_COLUMN: number = 2;
  static readonly COLOR_COLUMN: number = 3;
  static readonly PLAYER_COLUMN: number = 4;
  static columnNames: string[] = null;
  /**
   * A link to the gui.
   */
  gui: GUI = null;
  /**
   * Creates a players table.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param nationOptions The {@code NationOptions} for this game.
   * @param myPlayer The client {@code Player}.
   */
  _PlayersTable(freeColClient: FreeColClient, nationOptions: NationOptions, myPlayer: Player): this {
    this._JTable$();
    this.gui = freeColClient.getGUI();
    let spec = freeColClient.getGame().getSpecification();
    this.setModel(new PlayersTable$PlayersTableModel()._PlayersTable$PlayersTableModel(freeColClient.getPreGameController(), nationOptions, myPlayer));
    this.setRowHeight$int($J.d2i((Math.fround(FontLibrary.getFontScaling() * 47))));
    this.getTableHeader().setReorderingAllowed(false);
    let nationButton = Utility.localizedButton$String('nation');
    nationButton.addActionListener((ae) => {
      this.gui.showColopediaPanel(ColopediaAction$PanelType.NATIONS.getKey());
    });
    let availabilityLabel = Utility.localizedLabel$String('playersTable.availability');
    let advantageButton = Utility.localizedButton$String('playersTable.advantage');
    advantageButton.addActionListener((ae) => {
      this.gui.showColopediaPanel(ColopediaAction$PanelType.NATION_TYPES.getKey());
    });
    let colorLabel = Utility.localizedLabel$String('color');
    let playerLabel = Utility.localizedLabel$String('player');
    let dtcr = new DefaultTableCellRenderer()._DefaultTableCellRenderer();
    dtcr.setOpaque(false);
    let renderer = new PlayersTable$HeaderRenderer()._PlayersTable$HeaderRenderer([nationButton, availabilityLabel, advantageButton, colorLabel, playerLabel]);
    let header = this.getTableHeader();
    header.addMouseListener(new PlayersTable$HeaderListener()._PlayersTable$HeaderListener(header, renderer));
    let tcm = this.getColumnModel();
    let nationColumn = tcm.getColumn(PlayersTable.NATION_COLUMN);
    nationColumn.setCellRenderer(new PlayersTable$NationCellRenderer().$o(this)._PlayersTable$NationCellRenderer());
    nationColumn.setHeaderRenderer(renderer);
    nationColumn.setPreferredWidth($J.idiv(Math.imul(2, tcm.getTotalColumnWidth()), tcm.getColumnCount()));
    let availableColumn = tcm.getColumn(PlayersTable.AVAILABILITY_COLUMN);
    availableColumn.setCellRenderer(new PlayersTable$AvailableCellRenderer()._PlayersTable$AvailableCellRenderer());
    availableColumn.setCellEditor(new PlayersTable$AvailableCellEditor().$o(this)._PlayersTable$AvailableCellEditor());
    let advantagesColumn = tcm.getColumn(PlayersTable.ADVANTAGE_COLUMN);
    switch (nationOptions.getNationalAdvantages()) {
      case NationOptions$Advantages.SELECTABLE:
        advantagesColumn.setCellEditor(new PlayersTable$AdvantageCellEditor()._PlayersTable$AdvantageCellEditor$List(spec.getVisibleEuropeanNationTypes()));
        break;
      case NationOptions$Advantages.FIXED:
        break;
      case NationOptions$Advantages.NONE:
        spec.clearEuropeanNationalAdvantages();
        break;
      default:
        break;
    }
    advantagesColumn.setCellRenderer(new PlayersTable$AdvantageCellRenderer()._PlayersTable$AdvantageCellRenderer(nationOptions.getNationalAdvantages()));
    advantagesColumn.setHeaderRenderer(renderer);
    let colorsColumn = tcm.getColumn(PlayersTable.COLOR_COLUMN);
    colorsColumn.setCellRenderer(new ColorCellRenderer()._ColorCellRenderer(true));
    colorsColumn.setCellEditor(new ColorCellEditor()._ColorCellEditor(freeColClient));
    let playerColumn = tcm.getColumn(PlayersTable.PLAYER_COLUMN);
    playerColumn.setCellEditor(new PlayersTable$PlayerCellEditor()._PlayersTable$PlayerCellEditor());
    playerColumn.setCellRenderer(new PlayersTable$PlayerCellRenderer()._PlayersTable$PlayerCellRenderer());
    return this;
  }
  update$(): void {
    (this.getModel()).update();
  }
  static $clinit() {
    PlayersTable.columnNames = [Messages.message$String('nation'), Messages.message$String('playersTable.availability'), Messages.message$String('playersTable.advantage'), Messages.message$String('color'), Messages.message$String('player')];
  }
}

/**
 * A table cell editor that can be used to select a nation.
 */
export class PlayersTable$AdvantageCellEditor extends DefaultCellEditor {
  box: JComboBox<EuropeanNationType> = null;
  /**
   * Internal constructor.
   *
   * @param box The {@code JComboBox} to edit.
   */
  _PlayersTable$AdvantageCellEditor$JComboBox(box: JComboBox<EuropeanNationType>): this {
    this._DefaultCellEditor$JComboBox(box);
    this.box = box;
    return this;
  }
  /**
   * A standard constructor.
   *
   * @param nationTypes The list of {@code EuropeanNationType}s.
   */
  _PlayersTable$AdvantageCellEditor$List(nationTypes: List<EuropeanNationType>): this {
    this._PlayersTable$AdvantageCellEditor$JComboBox(new JComboBox()._JComboBox$ObjectArr($J.toArrayInto(nationTypes.toArray(), $J.newArray(0, null))));
    this.box.setRenderer(new FreeColComboBoxRenderer()._FreeColComboBoxRenderer$());
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getCellEditorValue(): any {
    return (this.getComponent()).getSelectedItem();
  }
}

export class PlayersTable$AdvantageCellRenderer extends JLabel {
  /**
   * The national advantages type.
   */
  advantages: NationOptions$Advantages = null;
  /**
   * The default constructor.
   *
   * @param advantages The type of national {@code Advantages}.
   */
  _PlayersTable$AdvantageCellRenderer(advantages: NationOptions$Advantages): this {
    this._JLabel$();
    this.advantages = advantages;
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getTableCellRendererComponent(table: JTable, value: any, isSelected: boolean, hasFocus: boolean, row: number, column: number): Component {
    let player = table.getValueAt(row, PlayersTable.PLAYER_COLUMN);
    let nationType = (table.getValueAt(row, PlayersTable.NATION_COLUMN)).getType();
    let label: JLabel;
    switch (this.advantages) {
      case NationOptions$Advantages.SELECTABLE:
        label = Utility.localizedLabel$String(Messages.nameKey$ObjectWithId((player == null) ? nationType : player.getNationType()));
        break;
      case NationOptions$Advantages.FIXED:
        label = Utility.localizedLabel$String(Messages.nameKey$ObjectWithId(nationType));
        break;
      case NationOptions$Advantages.NONE:
      default:
        label = Utility.localizedLabel$String('none');
        break;
    }
    label.setForeground((player != null && player.isReady()) ? Color.GRAY : table.getForeground());
    label.setBackground(table.getBackground());
    Utility.localizeToolTip$JComponent$StringTemplate(this, StringTemplate.key$String(this.advantages.getShortDescriptionKey()));
    return label;
  }
}

export class PlayersTable$AvailableCellRenderer extends JLabel {
  box: JComboBox<NationOptions$NationState> = null;
  /**
   * The default constructor.
   */
  _PlayersTable$AvailableCellRenderer(): this {
    this._JLabel$();
    this.box = new JComboBox()._JComboBox$ObjectArr(NationOptions$NationState.values());
    this.box.setRenderer(new PlayersTable$NationStateRenderer()._PlayersTable$NationStateRenderer());
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getTableCellRendererComponent(table: JTable, value: any, isSelected: boolean, hasFocus: boolean, row: number, column: number): Component {
    if (value != null) {
      this.box.setSelectedItem(value);
      let nationState = value;
      Utility.localizeToolTip$JComponent$StringTemplate(this.box, StringTemplate.key$String(nationState.getShortDescriptionKey()));
    }
    return this.box;
  }
}

export class PlayersTable$AvailableCellEditor extends AbstractCellEditor {
  aiStateBox: JComboBox<NationOptions$NationState> = null;
  allStateBox: JComboBox<NationOptions$NationState> = null;
  activeBox: JComboBox<NationOptions$NationState> = null;
  _PlayersTable$AvailableCellEditor(): this {
    this._AbstractCellEditor();
    this.aiStateBox = new JComboBox()._JComboBox$ObjectArr([NationOptions$NationState.AI_ONLY, NationOptions$NationState.NOT_AVAILABLE]);
    this.allStateBox = new JComboBox()._JComboBox$ObjectArr(NationOptions$NationState.values());
    this.activeBox = null;
    let listener = (ae) => {
      this.stopCellEditing();
    };
    this.aiStateBox.setRenderer(new PlayersTable$NationStateRenderer()._PlayersTable$NationStateRenderer());
    this.aiStateBox.addActionListener(listener);
    this.allStateBox.setRenderer(new PlayersTable$NationStateRenderer()._PlayersTable$NationStateRenderer());
    this.allStateBox.addActionListener(listener);
    return this;
  }
  getActiveBox(row: number): JComboBox<NationOptions$NationState> {
    let nationType = (this.$outer.getValueAt(row, PlayersTable.NATION_COLUMN)).getType();
    this.activeBox = (nationType instanceof EuropeanNationType) ? this.allStateBox : this.aiStateBox;
    return this.activeBox;
  }
  /**
   * {@inheritDoc}
   */
  getTableCellEditorComponent(table: JTable, value: any, isSelected: boolean, row: number, column: number): Component {
    return this.getActiveBox(row);
  }
  /**
   * {@inheritDoc}
   */
  getCellEditorValue(): any {
    return (this.activeBox == null) ? null : this.activeBox.getSelectedItem();
  }
}

export class PlayersTable$HeaderListener extends MouseAdapter {
  header: JTableHeader = null;
  renderer: PlayersTable$HeaderRenderer = null;
  _PlayersTable$HeaderListener(header: JTableHeader, renderer: PlayersTable$HeaderRenderer): this {
    this._MouseAdapter();
    this.header = header;
    this.renderer = renderer;
    return this;
  }
  mousePressed(e: MouseEvent): void {
    let col = this.header.columnAtPoint(e.getPoint());
    this.renderer.setPressedColumn(col);
    this.header.repaint$();
  }
  mouseReleased(e: MouseEvent): void {
    this.renderer.setPressedColumn(PlayersTable$HeaderRenderer.NO_COLUMN);
    this.header.repaint$();
  }
}

export class PlayersTable$HeaderRenderer extends JObject {
  static readonly NO_COLUMN: number = -1;
  pressedColumn: number = 0;
  components: Component[] = null;
  _PlayersTable$HeaderRenderer(components: Component[]): this {
    this.pressedColumn = PlayersTable$HeaderRenderer.NO_COLUMN;
    this.components = components;
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getTableCellRendererComponent(table: JTable, value: any, isSelected: boolean, hasFocus: boolean, row: number, column: number): Component {
    if (this.components[column] instanceof JButton) {
      let isPressed = (column === this.pressedColumn);
      (this.components[column]).getModel().setPressed(isPressed);
      (this.components[column]).getModel().setArmed(isPressed);
    }
    return this.components[column];
  }
  setPressedColumn(column: number): void {
    this.pressedColumn = column;
  }
}

export class PlayersTable$NationCellRenderer extends JLabel {
  _PlayersTable$NationCellRenderer(): this {
    this._JLabel$();
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getTableCellRendererComponent(table: JTable, value: any, isSelected: boolean, hasFocus: boolean, row: number, column: number): Component {
    let nation = value;
    this.setText(Messages.message$StringTemplate(StringTemplate.template$String('countryName').add$String$String('%nation%', Messages.nameKey$String(nation.getId()))));
    this.setIcon(new ImageIcon()._ImageIcon$Image(this.$outer.gui.getFixedImageLibrary().getUnscaledSmallerNationImage(nation)));
    return this;
  }
}

export class PlayersTable$NationStateRenderer extends JLabel {
  _PlayersTable$NationStateRenderer(): this {
    this._JLabel$();
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getListCellRendererComponent(list: JList<NationOptions$NationState>, value: NationOptions$NationState, index: number, isSelected: boolean, cellHasFocus: boolean): Component {
    this.setText(Messages.getName$Named(value));
    return this;
  }
}

export class PlayersTable$PlayerCellRenderer extends JObject {
  label: JLabel = null;
  button: JButton = null;
  _PlayersTable$PlayerCellRenderer(): this {
    this.label = new JLabel()._JLabel$();
    this.button = Utility.localizedButton$String('select');
    this.label.setHorizontalAlignment(SwingConstants.CENTER);
    Utility.padBorder(this.button, 5, 10, 5, 10);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getTableCellRendererComponent(table: JTable, value: any, isSelected: boolean, hasFocus: boolean, row: number, column: number): Component {
    let player = value;
    if (player == null) {
      let nationType = table.getValueAt(row, PlayersTable.ADVANTAGE_COLUMN);
      if (nationType instanceof EuropeanNationType) {
        let nationState = table.getValueAt(row, PlayersTable.AVAILABILITY_COLUMN);
        if (nationState === NationOptions$NationState.AVAILABLE) {
          return this.button;
        }
      }
      let nation = table.getValueAt(row, PlayersTable.NATION_COLUMN);
      this.label.setText(nation.getRulerName());
    } else {
      this.label.setText(player.getName());
    }
    return this.label;
  }
}

export class PlayersTable$PlayerCellEditor extends AbstractCellEditor {
  button: JButton = null;
  _PlayersTable$PlayerCellEditor(): this {
    this._AbstractCellEditor();
    this.button = Utility.localizedButton$String('select');
    this.button.addActionListener((ae) => {
      this.fireEditingStopped();
    });
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getTableCellEditorComponent(table: JTable, value: any, isSelected: boolean, row: number, column: number): Component {
    return this.button;
  }
  getCellEditorValue(): any {
    return true;
  }
}

/**
 * The TableModel for the players table.
 */
export class PlayersTable$PlayersTableModel extends AbstractTableModel {
  preGameController: PreGameController = null;
  nationOptions: NationOptions = null;
  thisPlayer: Player = null;
  nations: List<Nation> = null;
  nationMap: JMap<Nation, Player> = null;
  /**
   * Create a new PlayersTableModel.
   *
   * @param preGameController The {@code PreGameController}
   *     to use notify of updates.
   * @param nationOptions The current {@code NationOptions}.
   * @param thisPlayer The {@code Player} that owns the client.
   */
  _PlayersTable$PlayersTableModel(preGameController: PreGameController, nationOptions: NationOptions, thisPlayer: Player): this {
    this._AbstractTableModel();
    let spec = thisPlayer.getSpecification();
    this.preGameController = preGameController;
    this.nationOptions = nationOptions;
    this.thisPlayer = thisPlayer;
    let nationPred = (n) => !n.isUnknownEnemy() && nationOptions.getNations().get(n) != null;
    this.nations = CollectionUtils.transform$Collection$Predicate(spec.getNations(), nationPred);
    this.nationMap = new HashMap(this.nations.size());
    for (const $it0 = this.nations.iterator(); $it0.hasNext(); ) {
      let n = $it0.next();
      this.nationMap.put(n, null);
    }
    this.nationMap.put(thisPlayer.getNation(), thisPlayer);
    return this;
  }
  /**
   * Update the nation map following any change.
   */
  update(): void {
    for (const $it1 = this.nations.iterator(); $it1.hasNext(); ) {
      let n = $it1.next();
      this.nationMap.put(n, null);
    }
    for (const $it2 = this.thisPlayer.getGame().getLivePlayerList([]).iterator(); $it2.hasNext(); ) {
      let p = $it2.next();
      this.nationMap.put(p.getNation(), p);
    }
    this.fireTableDataChanged();
  }
  /**
   * Gets the class of the objects in the given column.
   *
   * @param column The column to return the class of.
   * @return The {@code Class} of the objects in the given column.
   */
  getColumnClass(column: number): JClass<any> {
    switch (column) {
      case PlayersTable.NATION_COLUMN:
        return $J.cls(Nation);
      case PlayersTable.AVAILABILITY_COLUMN:
        return $J.cls(NationOptions$NationState);
      case PlayersTable.ADVANTAGE_COLUMN:
        return $J.cls(NationType);
      case PlayersTable.COLOR_COLUMN:
        return $J.cls(Color);
      case PlayersTable.PLAYER_COLUMN:
        return $J.cls(Player);
    }
    return $J.cls(JString);
  }
  /**
   * Get the number of columns in this table.
   *
   * @return The number of columns.
   */
  getColumnCount(): number {
    return PlayersTable.columnNames.length;
  }
  /**
   * Get the name of a column.
   *
   * @param column The column number to look up.
   * @return The name of the specified column.
   */
  getColumnName(column: number): string {
    return PlayersTable.columnNames[column];
  }
  /**
   * Get the number of rows in this table.
   *
   * @return The number of rows.
   */
  getRowCount(): number {
    return this.nations.size();
  }
  /**
   * Get the value at the requested location.
   *
   * @param row The requested row.
   * @param column The requested column.
   * @return The value at the requested location.
   */
  getValueAt(row: number, column: number): any {
    if (row >= 0 && row < this.getRowCount() && column >= 0 && column < this.getColumnCount()) {
      let nation = this.nations.get(row);
      switch (column) {
        case PlayersTable.NATION_COLUMN:
          return nation;
        case PlayersTable.AVAILABILITY_COLUMN:
          return this.nationOptions.getNationState(nation);
        case PlayersTable.ADVANTAGE_COLUMN:
          return (this.nationMap.get(nation) == null) ? nation.getType() : this.nationMap.get(nation).getNationType();
        case PlayersTable.COLOR_COLUMN:
          return nation.getColor();
        case PlayersTable.PLAYER_COLUMN:
          return this.nationMap.get(nation);
      }
    }
    return null;
  }
  /**
   * Is a cell editable?
   *
   * @param row The specified row.
   * @param column The specified column.
   * @return True if the specified cell is editable.
   */
  isCellEditable(row: number, column: number): boolean {
    if (row >= 0 && row < this.getRowCount()) {
      let nation = this.nations.get(row);
      let ownRow = this.thisPlayer === this.nationMap.get(nation) && !this.thisPlayer.isReady();
      switch (column) {
        case PlayersTable.AVAILABILITY_COLUMN:
          return !ownRow && this.thisPlayer.isAdmin();
        case PlayersTable.ADVANTAGE_COLUMN:
          return nation.getType() instanceof EuropeanNationType && ownRow;
        case PlayersTable.COLOR_COLUMN:
          return nation.getType() instanceof EuropeanNationType;
        case PlayersTable.PLAYER_COLUMN:
          return nation.getType() instanceof EuropeanNationType && this.nationMap.get(nation) == null;
      }
    }
    return false;
  }
  /**
   * Sets the value at the specified location.
   *
   * @param value The new value.
   * @param row The specified row.
   * @param column The specified column.
   */
  setValueAt(value: any, row: number, column: number): void {
    if (row >= 0 && row < this.getRowCount() && column > 0 && column < this.getColumnCount()) {
      let nation = this.nations.get(row);
      switch (column) {
        case PlayersTable.ADVANTAGE_COLUMN:
          this.preGameController.setNationType(value);
          this.update();
          break;
        case PlayersTable.AVAILABILITY_COLUMN:
          this.preGameController.setAvailable(this.nations.get(row), value);
          this.update();
          break;
        case PlayersTable.COLOR_COLUMN:
          this.preGameController.setColor(nation, value);
          this.update();
          break;
        case PlayersTable.PLAYER_COLUMN:
          if (this.nationOptions.getNationState(nation) === NationOptions$NationState.AVAILABLE) {
            this.preGameController.setNation(nation);
            this.preGameController.setNationType(nation.getType());
            this.update();
          }
          break;
        default:
          break;
      }
      this.fireTableCellUpdated(row, column);
    }
  }
}

$J.define(PlayersTable, 'net.sf.freecol.client.gui.panel.PlayersTable', { kind: 'class', sup: 'javax.swing.JTable', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.common.model.NationOptions,net.sf.freecol.common.model.Player': '_PlayersTable' }, meths: { 'update()': 'update$' }, clinit: true, lazy: ['columnNames'] });
$J.define(PlayersTable$AdvantageCellEditor, 'net.sf.freecol.client.gui.panel.PlayersTable$AdvantageCellEditor', { kind: 'class', sup: 'javax.swing.DefaultCellEditor', ctors: { 'java.util.List': '_PlayersTable$AdvantageCellEditor$List', 'javax.swing.JComboBox': '_PlayersTable$AdvantageCellEditor$JComboBox' } });
$J.define(PlayersTable$AdvantageCellRenderer, 'net.sf.freecol.client.gui.panel.PlayersTable$AdvantageCellRenderer', { kind: 'class', ifaces: ['javax.swing.table.TableCellRenderer'], sup: 'javax.swing.JLabel', ctors: { 'net.sf.freecol.common.model.NationOptions$Advantages': '_PlayersTable$AdvantageCellRenderer' } });
$J.define(PlayersTable$AvailableCellRenderer, 'net.sf.freecol.client.gui.panel.PlayersTable$AvailableCellRenderer', { kind: 'class', ifaces: ['javax.swing.table.TableCellRenderer'], sup: 'javax.swing.JLabel', ctors: { '': '_PlayersTable$AvailableCellRenderer' } });
$J.define(PlayersTable$AvailableCellEditor, 'net.sf.freecol.client.gui.panel.PlayersTable$AvailableCellEditor', { kind: 'class', ifaces: ['javax.swing.table.TableCellEditor'], sup: 'javax.swing.AbstractCellEditor', ctors: { '': '_PlayersTable$AvailableCellEditor' }, inner: true });
$J.define(PlayersTable$HeaderListener, 'net.sf.freecol.client.gui.panel.PlayersTable$HeaderListener', { kind: 'class', sup: 'java.awt.event.MouseAdapter', ctors: { 'javax.swing.table.JTableHeader,net.sf.freecol.client.gui.panel.PlayersTable$HeaderRenderer': '_PlayersTable$HeaderListener' } });
$J.define(PlayersTable$HeaderRenderer, 'net.sf.freecol.client.gui.panel.PlayersTable$HeaderRenderer', { kind: 'class', ifaces: ['javax.swing.table.TableCellRenderer'], sup: 'java.lang.Object', ctors: { 'java.awt.Component[]': '_PlayersTable$HeaderRenderer' } });
$J.define(PlayersTable$NationCellRenderer, 'net.sf.freecol.client.gui.panel.PlayersTable$NationCellRenderer', { kind: 'class', ifaces: ['javax.swing.table.TableCellRenderer'], sup: 'javax.swing.JLabel', ctors: { '': '_PlayersTable$NationCellRenderer' }, inner: true });
$J.define(PlayersTable$NationStateRenderer, 'net.sf.freecol.client.gui.panel.PlayersTable$NationStateRenderer', { kind: 'class', ifaces: ['javax.swing.ListCellRenderer'], sup: 'javax.swing.JLabel', ctors: { '': '_PlayersTable$NationStateRenderer' } });
$J.define(PlayersTable$PlayerCellRenderer, 'net.sf.freecol.client.gui.panel.PlayersTable$PlayerCellRenderer', { kind: 'class', ifaces: ['javax.swing.table.TableCellRenderer'], sup: 'java.lang.Object', ctors: { '': '_PlayersTable$PlayerCellRenderer' } });
$J.define(PlayersTable$PlayerCellEditor, 'net.sf.freecol.client.gui.panel.PlayersTable$PlayerCellEditor', { kind: 'class', ifaces: ['javax.swing.table.TableCellEditor'], sup: 'javax.swing.AbstractCellEditor', ctors: { '': '_PlayersTable$PlayerCellEditor' } });
$J.define(PlayersTable$PlayersTableModel, 'net.sf.freecol.client.gui.panel.PlayersTable$PlayersTableModel', { kind: 'class', sup: 'javax.swing.table.AbstractTableModel', ctors: { 'net.sf.freecol.client.control.PreGameController,net.sf.freecol.common.model.NationOptions,net.sf.freecol.common.model.Player': '_PlayersTable$PlayersTableModel' }, returns: { 'getRowCount': 'int', 'getColumnCount': 'int' } });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JButton = $J.load('javax.swing.JButton');
  JComboBox = $J.load('javax.swing.JComboBox');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  DefaultTableCellRenderer = $J.load('javax.swing.table.DefaultTableCellRenderer');
  FontLibrary = $J.load('net.sf.freecol.client.gui.FontLibrary');
  ColopediaAction$PanelType = $J.load('net.sf.freecol.client.gui.action.ColopediaAction$PanelType');
  ColorCellEditor = $J.load('net.sf.freecol.client.gui.panel.ColorCellEditor');
  ColorCellRenderer = $J.load('net.sf.freecol.client.gui.panel.ColorCellRenderer');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  FreeColComboBoxRenderer = $J.load('net.sf.freecol.client.gui.plaf.FreeColComboBoxRenderer');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  EuropeanNationType = $J.load('net.sf.freecol.common.model.EuropeanNationType');
  Nation = $J.load('net.sf.freecol.common.model.Nation');
  NationOptions$Advantages = $J.load('net.sf.freecol.common.model.NationOptions$Advantages');
  NationOptions$NationState = $J.load('net.sf.freecol.common.model.NationOptions$NationState');
  NationType = $J.load('net.sf.freecol.common.model.NationType');
  Player = $J.load('net.sf.freecol.common.model.Player');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
