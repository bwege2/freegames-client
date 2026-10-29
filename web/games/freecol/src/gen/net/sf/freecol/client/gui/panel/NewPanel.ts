// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/NewPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JEnum, JString, Logger, NumberFormatException, RuntimeException } from '../../../../../../../jre/index.ts';
import { FreeColPanel } from './FreeColPanel.ts';

let Color, AbstractAction, ButtonGroup, JCheckBox, JComboBox, JRadioButton, JSeparator, JTextField, SwingConstants, MigLayout, FreeCol, ClientOptions, Utility, FreeColComboBoxRenderer, Messages, FreeColRules, MetaServerUtils, NationOptions$Advantages, StringTemplate;

/**
 * This dialog allows the user to start a single player or multiplayer
 * game, to join a running game, and to fetch a list of games from the
 * meta-server.
 */
export class NewPanel extends FreeColPanel {
  static logger: Logger = null;
  /**
   * A particular specification to use for the new game.  If not
   * null, the specification box just contains this spec, but if
   * null the user chooses from available specs using the
   * specification box.
   */
  fixedSpecification: Specification = null;
  /**
   * The current specification, driven by the contents of the TC box.
   */
  specification: Specification = null;
  /**
   * A current difficulty level, driven by the contents of the
   * difficulty box..  Difficulty levels are relative to the rules,
   * so this can be invalidated by a change to the current
   * specification.
   */
  difficulty: OptionGroup = null;
  /**
   * Field to input the player name.
   */
  nameBox: JTextField = null;
  /**
   * A button group for the main choices.
   */
  buttonGroup: ButtonGroup = null;
  /**
   * The label for the national advantages.
   */
  advantagesLabel: JLabel = null;
  /**
   * A box to choose the national advantages setting.
   */
  advantagesBox: JComboBox<NationOptions$Advantages> = null;
  /**
   * Start server name label.
   */
  serverPortLabel: JLabel = null;
  /**
   * Start server port number label and field to input through.
   */
  serverPortField: JTextField = null;
  serverAddressBox: JComboBox<InetAddress> = null;
  /**
   * The label for the rules selection.
   */
  rulesLabel: JLabel = null;
  /**
   * A box to choose the rules from.
   */
  rulesBox: JComboBox<FreeColModFile> = null;
  /**
   * The check box to select a public server with.
   */
  publicServer: JCheckBox = null;
  /**
   * A label for the difficulty level selection.
   */
  difficultyLabel: JLabel = null;
  /**
   * A box to choose the difficulty from.
   */
  difficultyBox: JComboBox<OptionGroup> = null;
  /**
   * A button to show/edit difficulty level.
   */
  difficultyButton: JButton = null;
  /**
   * Join multiplayer server name label.
   */
  joinNameLabel: JLabel = null;
  /**
   * Join multiplayer server name selection.
   */
  joinNameField: JTextField = null;
  /**
   * Join multiplayer server port label.
   */
  joinPortLabel: JLabel = null;
  /**
   * Join multiplayer server port selection.
   */
  joinPortField: JTextField = null;
  /**
   * Container for the components to enable when Join is selected.
   */
  joinComponents: Component[] = null;
  /**
   * Container for components to enable if server parameters can be set.
   */
  serverComponents: Component[] = null;
  /**
   * Container for components to enable when choosing game parameters.
   */
  gameComponents: Component[] = null;
  $init_NewPanel() {
    this.specification = null;
    this.difficulty = null;
  }
  /**
   * Creates a new game panel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _NewPanel$FreeColClient(freeColClient: FreeColClient): this {
    this._NewPanel$FreeColClient$Specification(freeColClient, null);
    return this;
  }
  /**
   * Creates a new game panel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param specification An optional {@code Specification} value for
   *     the new game.
   */
  _NewPanel$FreeColClient$Specification(freeColClient: FreeColClient, specification: Specification): this {
    this._FreeColPanel$FreeColClient$String$LayoutManager(freeColClient, null, new MigLayout()._MigLayout$String$String$String('wrap 6', '[15]', ''));
    this.$init_NewPanel();
    this.fixedSpecification = specification;
    this.buttonGroup = new ButtonGroup()._ButtonGroup();
    let single = new JRadioButton()._JRadioButton$String$boolean(Messages.message$String('newPanel.singlePlayerGame'), true);
    let join = new JRadioButton()._JRadioButton$String$boolean(Messages.message$String('newPanel.joinMultiPlayerGame'), false);
    let start = new JRadioButton()._JRadioButton$String$boolean(Messages.message$String('newPanel.startMultiplayerGame'), false);
    let meta = new JRadioButton()._JRadioButton$String$boolean(Messages.message$String('newPanel.getServerList') + ' (' + FreeCol.getMetaServerAddress() + ')', false);
    this.buttonGroup.add(single);
    single.setActionCommand($J.str(NewPanel$NewPanelAction.SINGLE));
    single.addActionListener((ae) => this.enableComponents$$NewPanel());
    this.buttonGroup.add(start);
    start.setActionCommand($J.str(NewPanel$NewPanelAction.START));
    start.addActionListener((ae) => this.enableComponents$$NewPanel());
    this.buttonGroup.add(meta);
    meta.setActionCommand($J.str(NewPanel$NewPanelAction.META_SERVER));
    meta.addActionListener((ae) => this.enableComponents$$NewPanel());
    this.buttonGroup.add(join);
    join.setActionCommand($J.str(NewPanel$NewPanelAction.JOIN));
    join.addActionListener((ae) => this.enableComponents$$NewPanel());
    single.setSelected(true);
    let name = this.getClientOptions().getText(ClientOptions.NAME);
    if (name == null || (name.length === 0)) {
      name = FreeCol.getName();
    }
    this.nameBox = new JTextField()._JTextField$String$int(name, 20);
    this.advantagesLabel = Utility.localizedLabel$String('newPanel.nationalAdvantages');
    this.advantagesBox = new JComboBox()._JComboBox$ObjectArr([NationOptions$Advantages.SELECTABLE, NationOptions$Advantages.FIXED, NationOptions$Advantages.NONE]);
    this.advantagesBox.setRenderer(new FreeColComboBoxRenderer()._FreeColComboBoxRenderer$());
    this.serverPortLabel = Utility.localizedLabel$String('newPanel.startServerOnPort');
    this.serverPortField = new JTextField()._JTextField$String(String(FreeCol.getServerPort()));
    this.serverPortField.addActionListener((ae) => {
      this.getSelectedPort(this.serverPortField);
    });
    this.serverAddressBox = Utility.createServerInetAddressBox();
    this.rulesLabel = Utility.localizedLabel$String('rules');
    this.rulesBox = new JComboBox()._JComboBox$();
    let selectRules: string;
    if (this.fixedSpecification == null) {
      selectRules = FreeCol.getRules();
      for (const $it0 = FreeColRules.getRulesList().iterator(); $it0.hasNext(); ) {
        let tc = $it0.next();
        this.rulesBox.addItem(tc);
        if ($J.equals(selectRules, tc.getId())) {
          this.rulesBox.setSelectedItem(tc);
        }
      }
    } else {
      selectRules = this.fixedSpecification.getId();
      for (const $it1 = FreeColRules.getRulesList().iterator(); $it1.hasNext(); ) {
        let tc = $it1.next();
        if ($J.equals(selectRules, tc.getId())) {
          this.rulesBox.addItem(tc);
          this.rulesBox.setSelectedItem(tc);
        }
      }
    }
    if (this.rulesBox.getSelectedItem() == null) {
      this.rulesBox.setSelectedItem((this.rulesBox.getItemCount() - 1) | 0);
      NewPanel.logger.warning('No TC found for: ' + selectRules + ', failling back to ' + $J.str(this.rulesBox.getSelectedItem()));
    }
    this.rulesBox.setRenderer(new FreeColComboBoxRenderer()._FreeColComboBoxRenderer$String('mod.'));
    this.rulesBox.addItemListener($J.fn(this, 'itemStateChanged'));
    this.publicServer = new JCheckBox()._JCheckBox$String(Messages.message$String('newPanel.publicServer'));
    this.serverAddressBox.addActionListener((event) => {
      let address = this.serverAddressBox.getSelectedItem();
      this.publicServer.setEnabled(!address.isLoopbackAddress());
    });
    let address = this.serverAddressBox.getSelectedItem();
    this.publicServer.setEnabled(!address.isLoopbackAddress());
    this.difficultyLabel = Utility.localizedLabel$String('difficulty');
    this.difficultyBox = new JComboBox()._JComboBox$();
    this.difficultyBox.setRenderer(new FreeColComboBoxRenderer()._FreeColComboBoxRenderer$());
    this.difficultyBox.addItemListener($J.fn(this, 'itemStateChanged'));
    this.difficultyButton = Utility.localizedButton$String('newPanel.showDifficulty');
    this.difficultyButton.addActionListener((ae) => {
      this.getGUI().showDifficultyDialog$Specification$OptionGroup$boolean$DialogHandler(this.specification, this.difficulty, this.difficulty.isEditable(), (group) => {
        if (group != null) {
          this.update$boolean$NewPanel(true);
        }
      });
    });
    this.joinNameLabel = Utility.localizedLabel$String('host');
    this.joinNameField = new JTextField()._JTextField$String(FreeCol.getServerHost());
    this.joinPortLabel = Utility.localizedLabel$String('port');
    this.joinPortField = new JTextField()._JTextField$String(String(FreeCol.getServerPort()));
    this.joinPortField.addActionListener((ae) => {
      this.getSelectedPort(this.joinPortField);
    });
    this.okButton.setActionCommand($J.str(NewPanel$NewPanelAction.OK));
    let cancel = Utility.localizedButton$String('cancel');
    cancel.setActionCommand($J.str(NewPanel$NewPanelAction.CANCEL));
    cancel.addActionListener((ae) => {
      let gui = this.getGUI();
      gui.removeComponent(this);
      if (this.getFreeColClient().isMapEditor()) {
        gui.startMapEditorGUI();
      } else {
        gui.showMainPanel(null);
      }
    });
    this.setEscapeAction(new (NewPanel$1())().$o(this).$c(cancel)._AbstractAction$());
    this.add$Component$Object(Utility.localizedHeader('newPanel.newGamePanel', Utility.FONTSPEC_TITLE), 'span 6, center');
    this.add$Component$Object(single, 'newline, span 3');
    this.add$Component$Object(new JSeparator()._JSeparator$int(SwingConstants.VERTICAL), 'spany 7, grow');
    this.add$Component$Object(Utility.localizedLabel$String('name'), FreeColPanel.SPAN_SPLIT_2);
    this.add$Component$Object(this.nameBox, 'growx');
    this.add$Component$Object(start, 'newline, span 3');
    this.add$Component(this.advantagesLabel);
    this.add$Component$Object(this.advantagesBox, 'growx');
    this.add$Component$Object(this.serverAddressBox, 'newline, skip');
    this.add$Component$Object(this.serverPortLabel, 'newline, skip');
    this.add$Component$Object(this.serverPortField, 'width 60:');
    this.add$Component(this.rulesLabel);
    this.add$Component$Object(this.rulesBox, 'growx');
    this.add$Component$Object(this.publicServer, 'newline, skip, span 2');
    this.add$Component(this.difficultyLabel);
    this.add$Component$Object(this.difficultyBox, 'growx');
    this.add$Component$Object(meta, 'newline, span 3');
    this.add$Component$Object(this.difficultyButton, 'skip 2, growx');
    this.add$Component$Object(join, 'newline, span 3');
    this.add$Component$Object(this.joinNameLabel, 'newline, skip, split 2');
    this.add$Component$Object(this.joinNameField, 'width 80:');
    this.add$Component$Object(this.joinPortLabel, 'split 2');
    this.add$Component$Object(this.joinPortField, 'width 60:');
    this.add$Component$Object(this.okButton, 'newline, span, split 2, tag ok');
    this.add$Component$Object(cancel, 'tag cancel');
    this.joinComponents = [this.joinNameLabel, this.joinNameField, this.joinPortLabel, this.joinPortField];
    this.serverComponents = [this.serverAddressBox, this.serverPortLabel, this.serverPortField, this.publicServer];
    this.gameComponents = [this.advantagesLabel, this.advantagesBox, this.rulesLabel, this.rulesBox, this.difficultyLabel, this.difficultyBox, this.difficultyButton];
    this.specification = this.getSpecification();
    if (this.specification == null) {
      throw new RuntimeException('No specification found for: ' + $J.str(this));
    }
    this.difficulty = this.specification.getDifficultyOptionGroup$String(FreeCol.getDifficulty());
    this.updateDifficultyBox();
    if (this.difficulty == null) {
      let index = $J.idiv(this.difficultyBox.getItemCount(), 2);
      this.difficultyBox.setSelectedItem(index);
      this.difficulty = this.getSelectedDifficulty();
    }
    if (this.difficulty == null) {
      throw new RuntimeException('No difficulty found for: ' + $J.str(this));
    }
    NewPanel.logger.info('NewPanel initialized with ' + this.specification.getId() + '/' + this.difficulty.getId());
    this.enableComponents$$NewPanel();
    this.setSize$Dimension(this.getPreferredSize$());
    return this;
  }
  /**
   * Update specification and difficulty as needed.
   *
   * @param changed If true force an update.
   */
  update$boolean$NewPanel(changed: boolean): void {
    if (!changed) {
      return;
    }
    if (this.difficulty.isEditable()) {
      this.specification.prepare$Advantages$OptionGroup(null, this.difficulty);
    } else {
      let oldId = this.difficulty.getId();
      this.difficulty = this.specification.getDifficultyOptionGroup$String(oldId);
    }
    this.updateDifficultyBox();
  }
  /**
   * Check if the TC changed.
   *
   * @return True if the TC changed.
   */
  checkTC(): boolean {
    if ($J.equals(this.specification.getId(), this.getSelectedRules().getId())) {
      return false;
    }
    this.specification = this.getSpecification();
    return true;
  }
  /**
   * Check if the difficulty box changed.
   *
   * @return True if the difficulty changed.
   */
  checkDifficulty(): boolean {
    let difficulty = this.getSelectedDifficulty();
    if ($J.equals(this.difficulty.getId(), difficulty.getId())) {
      return false;
    }
    this.difficulty = difficulty;
    return true;
  }
  /**
   * Update just the difficulty box state.
   */
  updateDifficultyBox(): void {
    this.difficultyBox.removeItemListener($J.fn(this, 'itemStateChanged'));
    this.difficultyBox.removeAllItems();
    for (const $it2 = this.specification.getDifficultyLevels().iterator(); $it2.hasNext(); ) {
      let og = $it2.next();
      this.difficultyBox.addItem(og);
    }
    if (this.difficulty != null) {
      this.difficultyBox.setSelectedItem(this.difficulty);
    }
    this.difficultyButton.setEnabled(this.difficulty != null);
    let text = (this.difficulty != null && this.difficulty.isEditable()) ? 'newPanel.editDifficulty' : 'newPanel.showDifficulty';
    this.difficultyButton.setText(Messages.message$String(text));
    this.difficultyBox.addItemListener($J.fn(this, 'itemStateChanged'));
  }
  /**
   * Get the selected player name from the nameBox.
   *
   * @return The selected player name.
   */
  getSelectedName(): string {
    return this.nameBox.getText$();
  }
  /**
   * Gets the currently selected Advantages type from the nationalAdvantages
   * box.
   *
   * @return The selected advantages type.
   */
  getSelectedAdvantages(): NationOptions$Advantages {
    return this.advantagesBox.getSelectedItem();
  }
  /**
   * Gets the currently selected total-conversion from the rulesBox.
   *
   * @return The selected TC.
   */
  getSelectedRules(): FreeColModFile {
    return this.rulesBox.getSelectedItem();
  }
  /**
   * Gets the currently selected difficulty from the difficultyBox.
   *
   * @return The difficulty {@code OptionGroup}.
   */
  getSelectedDifficulty(): OptionGroup {
    return this.difficultyBox.getSelectedItem();
  }
  /**
   * Get the value of a port field.
   *
   * @param field The field to read.
   * @return The port number in the field, or negative on error.
   */
  getSelectedPort(field: JTextField): number {
    let port: number;
    try {
      port = $J.parseInt(field.getText$());
    } catch ($e3) {
      if ($J.isa($e3, NumberFormatException)) {
        let e = $J.exc($e3);
        port = -1;
      } else {
        throw $e3;
      }
    }
    if (0 < port && port < 65536) {
      return port;
    }
    field.setForeground(Color.red);
    return -1;
  }
  /**
   * Enable components according to the selected button.
   */
  enableComponents$$NewPanel(): void {
    let action = $J.enumValueOf($J.cls(NewPanel$NewPanelAction), this.buttonGroup.getSelection().getActionCommand());
    switch (action) {
      case NewPanel$NewPanelAction.SINGLE:
        this.enableComponents$ComponentArr$boolean$NewPanel(this.joinComponents, false);
        this.enableComponents$ComponentArr$boolean$NewPanel(this.serverComponents, false);
        this.enableComponents$ComponentArr$boolean$NewPanel(this.gameComponents, true);
        this.rulesBox.setEnabled(true);
        break;
      case NewPanel$NewPanelAction.JOIN:
        this.enableComponents$ComponentArr$boolean$NewPanel(this.joinComponents, true);
        this.enableComponents$ComponentArr$boolean$NewPanel(this.serverComponents, false);
        this.enableComponents$ComponentArr$boolean$NewPanel(this.gameComponents, false);
        this.rulesBox.setEnabled(false);
        break;
      case NewPanel$NewPanelAction.START:
        this.enableComponents$ComponentArr$boolean$NewPanel(this.joinComponents, false);
        this.enableComponents$ComponentArr$boolean$NewPanel(this.serverComponents, true);
        this.enableComponents$ComponentArr$boolean$NewPanel(this.gameComponents, true);
        this.rulesBox.setEnabled(true);
        break;
      case NewPanel$NewPanelAction.META_SERVER:
        this.enableComponents$ComponentArr$boolean$NewPanel(this.joinComponents, false);
        this.enableComponents$ComponentArr$boolean$NewPanel(this.serverComponents, false);
        this.enableComponents$ComponentArr$boolean$NewPanel(this.gameComponents, false);
        this.rulesBox.setEnabled(false);
        break;
      default:
        break;
    }
  }
  /**
   * Dis/Enable a group of components.
   *
   * @param components The {@code Component}s to set.
   * @param enable Enable if true.
   */
  enableComponents$ComponentArr$boolean$NewPanel(components: Component[], enable: boolean): void {
    for (let c of components) {
      c.setEnabled(enable);
    }
  }
  /**
   * Get the specification.  Either the one set for this panel, or the
   * one implied by the currently selected TC.
   *
   * @return The current {@code Specification}.
   */
  getSpecification(): Specification {
    if (this.fixedSpecification != null) {
      return this.fixedSpecification;
    }
    return FreeCol.loadSpecification(this.getSelectedRules(), null, null);
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    let cc = this.getFreeColClient().getConnectController();
    let gui = this.getGUI();
    let command = ae.getActionCommand();
    try {
      {
        let action: NewPanel$NewPanelAction;
        switch ($J.enumValueOf($J.cls(NewPanel$NewPanelAction), command)) {
          case NewPanel$NewPanelAction.OK:
            FreeCol.setName(this.getSelectedName());
            FreeCol.setAdvantages(this.getSelectedAdvantages());
            FreeCol.setRules(this.getSelectedRules().getId());
            action = $J.enumValueOf($J.cls(NewPanel$NewPanelAction), this.buttonGroup.getSelection().getActionCommand());
            {
              let joinPort: number, serverPort: number, serverAddress: InetAddress, publicServerValue: boolean, servers: List<ServerInfo>;
              switch (action) {
                case NewPanel$NewPanelAction.SINGLE:
                  this.specification.prepare$Advantages$OptionGroup(this.getSelectedAdvantages(), this.difficulty);
                  if (cc.startSinglePlayerGame(this.specification)) {
                    return;
                  }
                  break;
                case NewPanel$NewPanelAction.JOIN:
                  joinPort = this.getSelectedPort(this.joinPortField);
                  if (joinPort < 0) {
                    break;
                  }
                  if (cc.joinMultiplayerGame(this.joinNameField.getText$(), joinPort)) {
                    return;
                  }
                  break;
                case NewPanel$NewPanelAction.START:
                  serverPort = this.getSelectedPort(this.serverPortField);
                  if (serverPort < 0) {
                    break;
                  }
                  this.specification.prepare$Advantages$OptionGroup(this.getSelectedAdvantages(), this.difficulty);
                  serverAddress = this.serverAddressBox.getSelectedItem();
                  publicServerValue = this.publicServer.isSelected() && !serverAddress.isLoopbackAddress();
                  if (cc.startMultiplayerGame(this.specification, publicServerValue, serverAddress, serverPort)) {
                    return;
                  }
                  break;
                case NewPanel$NewPanelAction.META_SERVER:
                  servers = MetaServerUtils.getServerList();
                  if (servers != null) {
                    gui.showServerListPanel(servers);
                  }
                  break;
                default:
                  break;
              }
            }
            break;
          default:
            super.actionPerformed(ae);
            break;
        }
      }
    } catch ($e4) {
      if ($J.isa($e4, RuntimeException)) {
        let e = $J.exc($e4);
        gui.showErrorPanel$Exception$StringTemplate(e, StringTemplate.key$String('error.unspecified'));
      } else {
        throw $e4;
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  itemStateChanged(e: ItemEvent): void {
    this.update$boolean$NewPanel(this.checkTC() || this.checkDifficulty());
  }
  static $clinit() {
    NewPanel.logger = Logger.getLogger($J.cls(NewPanel).getName());
  }
}

/**
 * The actions for this panel.
 */
export class NewPanel$NewPanelAction extends JEnum {
  static OK: NewPanel$NewPanelAction = null;
  static CANCEL: NewPanel$NewPanelAction = null;
  static SINGLE: NewPanel$NewPanelAction = null;
  static JOIN: NewPanel$NewPanelAction = null;
  static START: NewPanel$NewPanelAction = null;
  static META_SERVER: NewPanel$NewPanelAction = null;
  static SHOW_DIFFICULTY: NewPanel$NewPanelAction = null;
  static $VALUES: NewPanel$NewPanelAction[] = null;
  _NewPanel$NewPanelAction($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): NewPanel$NewPanelAction[] { return NewPanel$NewPanelAction.$VALUES.slice(); }
  static valueOf(name: string): NewPanel$NewPanelAction { return $J.enumValueOf(NewPanel$NewPanelAction, name); }
  static $clinit() {
    NewPanel$NewPanelAction.OK = new NewPanel$NewPanelAction()._NewPanel$NewPanelAction('OK', 0);
    NewPanel$NewPanelAction.CANCEL = new NewPanel$NewPanelAction()._NewPanel$NewPanelAction('CANCEL', 1);
    NewPanel$NewPanelAction.SINGLE = new NewPanel$NewPanelAction()._NewPanel$NewPanelAction('SINGLE', 2);
    NewPanel$NewPanelAction.JOIN = new NewPanel$NewPanelAction()._NewPanel$NewPanelAction('JOIN', 3);
    NewPanel$NewPanelAction.START = new NewPanel$NewPanelAction()._NewPanel$NewPanelAction('START', 4);
    NewPanel$NewPanelAction.META_SERVER = new NewPanel$NewPanelAction()._NewPanel$NewPanelAction('META_SERVER', 5);
    NewPanel$NewPanelAction.SHOW_DIFFICULTY = new NewPanel$NewPanelAction()._NewPanel$NewPanelAction('SHOW_DIFFICULTY', 6);
    NewPanel$NewPanelAction.$VALUES = [NewPanel$NewPanelAction.OK, NewPanel$NewPanelAction.CANCEL, NewPanel$NewPanelAction.SINGLE, NewPanel$NewPanelAction.JOIN, NewPanel$NewPanelAction.START, NewPanel$NewPanelAction.META_SERVER, NewPanel$NewPanelAction.SHOW_DIFFICULTY];
  }
}

let $NewPanel$1: any = null;
/** An anonymous class (NewPanel.java:304). */
function NewPanel$1(): any {
  return $NewPanel$1 ??= $J.local(class extends AbstractAction {
    actionPerformed(ae: ActionEvent): void {
      this.$cv_cancel.doClick$();
    }
    $c($cancel): this {
      this.$cv_cancel = $cancel;
      return this;
    }
  }, 'net.sf.freecol.client.gui.panel.NewPanel$1', []);
}

$J.define(NewPanel, 'net.sf.freecol.client.gui.panel.NewPanel', { kind: 'class', ifaces: ['java.awt.event.ItemListener'], sup: 'net.sf.freecol.client.gui.panel.FreeColPanel', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.common.model.Specification': '_NewPanel$FreeColClient$Specification', 'net.sf.freecol.client.FreeColClient': '_NewPanel$FreeColClient' }, returns: { 'getSpecification': 'net.sf.freecol.common.model.Specification', 'getSelectedDifficulty': 'net.sf.freecol.common.option.OptionGroup', 'getSelectedRules': 'net.sf.freecol.common.io.FreeColModFile', 'getSelectedAdvantages': 'net.sf.freecol.common.model.NationOptions$Advantages', 'getSelectedName': 'java.lang.String' }, meths: { 'enableComponents(java.awt.Component[],boolean)': 'enableComponents$ComponentArr$boolean$NewPanel', 'enableComponents()': 'enableComponents$$NewPanel', 'update(boolean)': 'update$boolean$NewPanel' }, clinit: true, lazy: ['logger'] });
$J.define(NewPanel$NewPanelAction, 'net.sf.freecol.client.gui.panel.NewPanel$NewPanelAction', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_NewPanel$NewPanelAction' }, clinit: true, lazy: ['$VALUES', 'OK', 'CANCEL', 'SINGLE', 'JOIN', 'START', 'META_SERVER', 'SHOW_DIFFICULTY'] });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  AbstractAction = $J.load('javax.swing.AbstractAction');
  ButtonGroup = $J.load('javax.swing.ButtonGroup');
  JCheckBox = $J.load('javax.swing.JCheckBox');
  JComboBox = $J.load('javax.swing.JComboBox');
  JRadioButton = $J.load('javax.swing.JRadioButton');
  JSeparator = $J.load('javax.swing.JSeparator');
  JTextField = $J.load('javax.swing.JTextField');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  FreeCol = $J.load('net.sf.freecol.FreeCol');
  ClientOptions = $J.load('net.sf.freecol.client.ClientOptions');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  FreeColComboBoxRenderer = $J.load('net.sf.freecol.client.gui.plaf.FreeColComboBoxRenderer');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  FreeColRules = $J.load('net.sf.freecol.common.io.FreeColRules');
  MetaServerUtils = $J.load('net.sf.freecol.common.metaserver.MetaServerUtils');
  NationOptions$Advantages = $J.load('net.sf.freecol.common.model.NationOptions$Advantages');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
});
