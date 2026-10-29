// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/plaf/FreeColSpinnerUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
import { $J } from '../../../../../../../jre/index.ts';
import { BasicSpinnerUI } from '../../../../../../javax/swing/plaf/basic/BasicSpinnerUI.ts';

let JSpinner$DefaultEditor;

export class FreeColSpinnerUI extends BasicSpinnerUI {
  _FreeColSpinnerUI(): this {
    this._BasicSpinnerUI();
    return this;
  }
  static createUI(c: JComponent): ComponentUI {
    return new FreeColSpinnerUI()._FreeColSpinnerUI();
  }
  installUI(c: JComponent): void {
    super.installUI(c);
    let spinner = c;
    let spinnerOpaque = spinner.isOpaque();
    spinner.getEditor().setOpaque(spinnerOpaque);
    if (spinner.getEditor() instanceof JSpinner$DefaultEditor) {
      (spinner.getEditor()).getTextField().setOpaque(spinnerOpaque);
    }
  }
}

$J.define(FreeColSpinnerUI, 'net.sf.freecol.client.gui.plaf.FreeColSpinnerUI', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicSpinnerUI', ctors: { '': '_FreeColSpinnerUI' } });
$J.module(() => {
  JSpinner$DefaultEditor = $J.load('javax.swing.JSpinner$DefaultEditor');
});
