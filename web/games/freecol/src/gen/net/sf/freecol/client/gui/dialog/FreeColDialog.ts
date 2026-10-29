// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/dialog/FreeColDialog.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Exception, JEnum, Level, Logger } from '../../../../../../../jre/index.ts';
import { JDialog } from '../../../../../../javax/swing/JDialog.ts';

let ComponentAdapter, MouseAdapter, WindowAdapter, JLabel, JOptionPane, JPanel, JTextArea, SwingUtilities, Utility, FreeColOptionPaneUI, CollectionUtils;

/**
 * Superclass for all dialogs in FreeCol.
 */
export class FreeColDialog<T> extends JDialog {
  static logger: Logger = null;
  /**
   * The enclosing client.
   */
  freeColClient: FreeColClient = null;
  /**
   * Is this dialog modal?
   */
  modal$FreeColDialog: boolean = false;
  /**
   * The options to choose from.
   */
  options: List<ChoiceItem<T>> = null;
  /**
   * The JOptionPane to embed in this dialog.
   */
  pane: JOptionPane = null;
  /**
   * Protected constructor for the subclass panels.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param frame The owner frame.
   */
  _FreeColDialog$FreeColClient$JFrame(freeColClient: FreeColClient, frame: JFrame): this {
    this._JDialog$Frame(frame);
    this.freeColClient = freeColClient;
    return this;
  }
  /**
   * Full constructor to build a dialog in one hit (supplying the
   * getResponse() implementation).
   *
   * Much of this was extracted from the source for
   * JOptionPane.createDialog.  We needed a way to control modality.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param frame The owner frame.
   * @param type The {@code DialogType} to create.
   * @param modal Should this dialog be modal?
   * @param tmpl A {@code StringTemplate} to explains the choice.
   * @param icon An optional icon to display.
   * @param options A list of options to choose from.
   */
  _FreeColDialog$FreeColClient$JFrame$DialogType$boolean$StringTemplate$ImageIcon$List(freeColClient: FreeColClient, frame: JFrame, type$: FreeColDialog$DialogType, modal: boolean, tmpl: StringTemplate, icon: ImageIcon, options: List<ChoiceItem<T>>): this {
    this._FreeColDialog$FreeColClient$JFrame(freeColClient, frame);
    this.initializeDialog(frame, type$, modal, Utility.localizedTextArea$StringTemplate(tmpl), icon, options);
    return this;
  }
  /**
   * Select the default option from the supplied options.
   *
   * @param options A list of options to choose from.
   * @return The option to select initially.
   */
  selectDefault(options: List<ChoiceItem<T>>): number {
    let def = -1;
    let can = -1;
    let ok = -1;
    let i = 0;
    for (const $it0 = options.iterator(); $it0.hasNext(); ) {
      let ci = $it0.next();
      if (ci.isDefault()) {
        def = i;
      } else if (ci.isCancel()) {
        can = i;
      } else if (ci.isOK()) {
        ok = i;
      }
      i++;
    }
    return (def >= 0) ? def : (can >= 0) ? can : (ok >= 0) ? ok : (options.size() - 1) | 0;
  }
  /**
   * Collect the enabled options and return as an array so as to be able
   * to pass to the JOptionPane constructor.
   *
   * @return An array of enabled options.
   */
  selectOptions(): any[] {
    return (CollectionUtils.transform$Collection$Predicate(this.options, ($p0) => $p0.isEnabled())).toArray();
  }
  /**
   * Complete the initialization.  Useful for subclasses that need
   * to construct a non-trivial object to display in the JOptionPane.
   *
   * @param frame The owner frame.
   * @param type The {@code DialogType} to create.
   * @param modal Should this dialog be modal?
   * @param jc The main object that explains the choice for the user.
   * @param icon An optional icon to display.
   * @param options A list of options to choose from.
   */
  initializeDialog(frame: JFrame, type$: FreeColDialog$DialogType, modal: boolean, jc: JComponent, icon: ImageIcon, options: List<ChoiceItem<T>>): void {
    this.modal$FreeColDialog = modal;
    this.options = options;
    let paneType = JOptionPane.QUESTION_MESSAGE;
    switch (type$) {
      case FreeColDialog$DialogType.PLAIN:
        paneType = JOptionPane.PLAIN_MESSAGE;
        break;
      case FreeColDialog$DialogType.QUESTION:
        paneType = JOptionPane.QUESTION_MESSAGE;
        break;
    }
    let def = this.selectDefault(options);
    let ci = (def >= 0) ? options.get(def) : null;
    this.pane = new JOptionPane()._JOptionPane$Object$int$int$Icon$ObjectArr$Object(jc, paneType, JOptionPane.DEFAULT_OPTION, icon, this.selectOptions(), ci);
    this.pane.setBorder(Utility.getDialogBorder());
    this.pane.setOpaque(false);
    this.pane.setName('FreeColDialog');
    this.pane.setValue(JOptionPane.UNINITIALIZED_VALUE);
    this.pane.addPropertyChangeListener$PropertyChangeListener($J.fn(this, 'propertyChange'));
    this.pane.setSize$Dimension(this.pane.getPreferredSize$());
    this.setComponentOrientation(this.pane.getComponentOrientation());
    let contentPane = this.getContentPane();
    contentPane.add$Component(this.pane);
    this.setSize$Dimension(this.getPreferredSize$());
    this.setResizable(false);
    this.setUndecorated(true);
    this.setModal(modal);
    FreeColDialog.setSubcomponentsNotOpaque(this.pane);
    try {
      this.pack();
    } catch ($e1) {
      if ($J.isa($e1, Exception)) {
        let e = $J.exc($e1);
        FreeColDialog.logger.log(Level.WARNING, 'Packing failure', e);
      } else {
        throw $e1;
      }
    }
    this.setLocationRelativeTo(frame);
    let adapter = new (FreeColDialog$1())().$o(this)._WindowAdapter().$init_anon();
    this.addWindowListener(adapter);
    this.addWindowFocusListener(adapter);
    this.addComponentListener(new (FreeColDialog$2())().$o(this)._ComponentAdapter());
    this.addMouseListener(new (FreeColDialog$3())().$o(this)._MouseAdapter());
  }
  static setSubcomponentsNotOpaque(j: JComponent): void {
    {
      FreeColDialog.iterateOverOpaqueLayersComponents(j);
    }
  }
  static iterateOverOpaqueLayersComponents(j: JComponent): void {
    if (j instanceof JPanel || j instanceof JOptionPane) {
      let componentes = j.getComponents();
      for (let componente of componentes) {
        FreeColDialog.setOpaqueLayerRecursive(componente);
      }
    }
  }
  static setOpaqueLayerRecursive(opaqueComponent: Component): void {
    if (opaqueComponent instanceof JTextArea || opaqueComponent instanceof JLabel) {
      if (opaqueComponent.isOpaque()) {
        (opaqueComponent).setOpaque(false);
      }
    } else if (opaqueComponent instanceof JPanel) {
      let panel = opaqueComponent;
      if (panel.isOpaque()) {
        panel.setOpaque(false);
      }
      FreeColDialog.iterateOverOpaqueLayersComponents(panel);
    }
  }
  /**
   * Get the FreeColClient.
   *
   * @return The {@code FreeColClient}.
   */
  getFreeColClient(): FreeColClient {
    return this.freeColClient;
  }
  /**
   * Get the GUI.
   *
   * @return The {@code GUI}.
   */
  getGUI(): GUI {
    return this.freeColClient.getGUI();
  }
  /**
   * Get the client controller.
   *
   * @return The client {@code InGameController}.
   */
  igc(): InGameController {
    return this.freeColClient.getInGameController();
  }
  /**
   * Get the Image library.
   *
   * @return The {@code ImageLibrary}.
   */
  getImageLibrary(): ImageLibrary {
    return this.getGUI().getFixedImageLibrary();
  }
  /**
   * Get the game.
   *
   * @return The {@code Game}.
   */
  getGame(): Game {
    return this.freeColClient.getGame();
  }
  /**
   * Gets the specification.
   *
   * @return The specification from the game.
   */
  getSpecification(): Specification {
    let game = this.getGame();
    return (game == null) ? null : game.getSpecification();
  }
  /**
   * Get the player.
   *
   * @return The current {@code Player}.
   */
  getMyPlayer(): Player {
    return this.freeColClient.getMyPlayer();
  }
  /**
   * Get the response that was set by {@link JOptionPane#setValue} and
   * clean up the dialog.  Used by implementors of getResponse().
   *
   * @return The pane value.
   */
  getValue(): any {
    let value = this.pane.getValue();
    this.dispose();
    return value;
  }
  /**
   * Set the value of this dialog.
   *
   * @param value The new value.
   */
  setValue(value: any): void {
    this.pane.setValue(value);
  }
  /**
   * Has this dialog been given a response.
   *
   * @return True if the dialog has a response.
   */
  responded(): boolean {
    return this.pane != null && this.pane.getValue() !== JOptionPane.UNINITIALIZED_VALUE;
  }
  /**
   * Get the response from this dialog.
   *
   * @return The response from this dialog.
   */
  getResponse(): T {
    if (this.responded()) {
      let value = this.getValue();
      for (const $it2 = this.options.iterator(); $it2.hasNext(); ) {
        let ci = $it2.next();
        if (ci.equals(value)) {
          return ci.getObject();
        }
      }
    }
    return null;
  }
  /**
   * Is this a modal dialog?
   *
   * @return True if this is a modal dialog.
   */
  isModal(): boolean {
    return this.modal$FreeColDialog;
  }
  /**
   * Create a list of choices.
   *
   * @param <T> The choice type.
   * @return An empty list of choices.
   */
  static choices<T>(): List<ChoiceItem<T>> {
    return new ArrayList();
  }
  /**
   * Helper to get a small single abstract unit image.
   *
   * @param au The {@code AbstractUnit} to examine.
   * @return A suitable {@code BufferedImage}.
   */
  getSmallAbstractUnitImage(au: AbstractUnit): BufferedImage {
    let spec = this.getSpecification();
    return this.getImageLibrary().getSmallUnitTypeImage$UnitType$String$boolean(au.getType(spec), au.getRoleId(), false);
  }
  /**
   * {@inheritDoc}
   */
  propertyChange(e: PropertyChangeEvent): void {
    if (this.isVisible$() && e.getSource() === this.pane && ($J.equals(JOptionPane.VALUE_PROPERTY, e.getPropertyName()) || $J.equals(JOptionPane.INPUT_VALUE_PROPERTY, e.getPropertyName())) && e.getNewValue() != null && e.getNewValue() !== JOptionPane.UNINITIALIZED_VALUE) {
      this.setVisible(false);
    }
  }
  /**
   * {@inheritDoc}
   */
  setVisible(val: boolean): void {
    if (val) {
      this.pane.selectInitialValue();
    }
    super.setVisible(val);
  }
  /**
   * {@inheritDoc}
   */
  removeNotify(): void {
    super.removeNotify();
    this.getGUI().removeDialog(this);
    this.removeAll();
    if (this.pane != null) {
      this.pane.removePropertyChangeListener$PropertyChangeListener($J.fn(this, 'propertyChange'));
      this.pane = null;
    }
    for (let listener of this.getMouseListeners()) {
      this.removeMouseListener(listener);
    }
  }
  /**
   * {@inheritDoc}
   */
  requestFocus$(): void {
    if (this.pane != null && this.pane.getUI() instanceof FreeColOptionPaneUI) {
      this.pane.getUI().selectInitialValue(null);
    }
  }
  static $clinit() {
    FreeColDialog.logger = Logger.getLogger($J.cls(FreeColDialog).getName());
  }
}

export class FreeColDialog$DialogType extends JEnum {
  static PLAIN: FreeColDialog$DialogType = null;
  static QUESTION: FreeColDialog$DialogType = null;
  static $VALUES: FreeColDialog$DialogType[] = null;
  _FreeColDialog$DialogType($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): FreeColDialog$DialogType[] { return FreeColDialog$DialogType.$VALUES.slice(); }
  static valueOf(name: string): FreeColDialog$DialogType { return $J.enumValueOf(FreeColDialog$DialogType, name); }
  static $clinit() {
    FreeColDialog$DialogType.PLAIN = new FreeColDialog$DialogType()._FreeColDialog$DialogType('PLAIN', 0);
    FreeColDialog$DialogType.QUESTION = new FreeColDialog$DialogType()._FreeColDialog$DialogType('QUESTION', 1);
    FreeColDialog$DialogType.$VALUES = [FreeColDialog$DialogType.PLAIN, FreeColDialog$DialogType.QUESTION];
  }
}

let $FreeColDialog$1: any = null;
/** An anonymous class (FreeColDialog.java:204). */
function FreeColDialog$1(): any {
  return $FreeColDialog$1 ??= $J.local(class extends WindowAdapter {
    gotFocus_: boolean = false;
    $init_anon() {
      this.gotFocus_ = false;
      return this;
    }
    windowClosing(we: WindowEvent): void {
      if (!this.$outer.responded()) {
        this.$outer.setValue(null);
      }
    }
    windowGainedFocus(we: WindowEvent): void {
      if (!this.gotFocus_) {
        this.$outer.pane.selectInitialValue();
        this.gotFocus_ = true;
      }
    }
  }, 'net.sf.freecol.client.gui.dialog.FreeColDialog$1', []);
}

let $FreeColDialog$2: any = null;
/** An anonymous class (FreeColDialog.java:224). */
function FreeColDialog$2(): any {
  return $FreeColDialog$2 ??= $J.local(class extends ComponentAdapter {
    componentShown(ce: ComponentEvent): void {
      this.$outer.pane.setValue(JOptionPane.UNINITIALIZED_VALUE);
    }
  }, 'net.sf.freecol.client.gui.dialog.FreeColDialog$2', []);
}

let $FreeColDialog$3: any = null;
/** An anonymous class (FreeColDialog.java:233). */
function FreeColDialog$3(): any {
  return $FreeColDialog$3 ??= $J.local(class extends MouseAdapter {
    loc: Point = null;
    mousePressed(e: MouseEvent): void {
      this.loc = SwingUtilities.convertPoint$Component$int$int$Component(e.getSource(), e.getX(), e.getY(), null);
    }
    mouseReleased(e: MouseEvent): void {
      if (this.loc == null) {
        return;
      }
      let now = SwingUtilities.convertPoint$Component$int$int$Component(e.getSource(), e.getX(), e.getY(), null);
      let dx = (now.x_ - this.loc.x_) | 0;
      let dy = (now.y_ - this.loc.y_) | 0;
      let p = this.$outer.getLocation$();
      this.$outer.setLocation$int$int((p.x_ + dx) | 0, (p.y_ + dy) | 0);
      this.loc = null;
    }
  }, 'net.sf.freecol.client.gui.dialog.FreeColDialog$3', []);
}

$J.define(FreeColDialog, 'net.sf.freecol.client.gui.dialog.FreeColDialog', { kind: 'class', ifaces: ['java.beans.PropertyChangeListener'], sup: 'javax.swing.JDialog', ctors: { 'net.sf.freecol.client.FreeColClient,javax.swing.JFrame,net.sf.freecol.client.gui.dialog.FreeColDialog$DialogType,boolean,net.sf.freecol.common.model.StringTemplate,javax.swing.ImageIcon,java.util.List': '_FreeColDialog$FreeColClient$JFrame$DialogType$boolean$StringTemplate$ImageIcon$List', 'net.sf.freecol.client.FreeColClient,javax.swing.JFrame': '_FreeColDialog$FreeColClient$JFrame' }, returns: { 'isModal': 'boolean', 'getMyPlayer': 'net.sf.freecol.common.model.Player', 'getSpecification': 'net.sf.freecol.common.model.Specification', 'getGame': 'net.sf.freecol.common.model.Game', 'getImageLibrary': 'net.sf.freecol.client.gui.ImageLibrary', 'getGUI': 'net.sf.freecol.client.gui.GUI', 'getFreeColClient': 'net.sf.freecol.client.FreeColClient' }, meths: { 'requestFocus()': 'requestFocus$' }, clinit: true, lazy: ['logger'] });
$J.define(FreeColDialog$DialogType, 'net.sf.freecol.client.gui.dialog.FreeColDialog$DialogType', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_FreeColDialog$DialogType' }, clinit: true, lazy: ['$VALUES', 'PLAIN', 'QUESTION'] });
$J.module(() => {
  ComponentAdapter = $J.load('java.awt.event.ComponentAdapter');
  MouseAdapter = $J.load('java.awt.event.MouseAdapter');
  WindowAdapter = $J.load('java.awt.event.WindowAdapter');
  JLabel = $J.load('javax.swing.JLabel');
  JOptionPane = $J.load('javax.swing.JOptionPane');
  JPanel = $J.load('javax.swing.JPanel');
  JTextArea = $J.load('javax.swing.JTextArea');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  FreeColOptionPaneUI = $J.load('net.sf.freecol.client.gui.plaf.FreeColOptionPaneUI');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
