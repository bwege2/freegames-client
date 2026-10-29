// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/dialog/CaptureGoodsDialog.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Logger } from '../../../../../../../jre/index.ts';
import { FreeColDialog } from './FreeColDialog.ts';
import { JCheckBox } from '../../../../../../javax/swing/JCheckBox.ts';

let MouseAdapter, ImageIcon, JList, MigLayout, ChoiceItem, FreeColDialog$DialogType, MigPanel, Utility, Messages, StringTemplate;

/**
 * Panel for choosing the goods to capture.
 * <p>
 * Panel Layout:
 * <p style="display: block; font-family: monospace; white-space: pre; margin: 1em 0;">
 * | ----------------------------|
 * |   captureGoodsDialog.title  |
 * | ----------------------------|
 * |    allButton | noneButton   |
 * | ----------------------------|
 * |        [] goodsList         |
 * | ----------------------------|
 * |                    okButton |
 * | ----------------------------|
 * <p>
 * Each member of goodsList is a {@code GoodsItem} as a
 *      checkbox and text combination, repeated as
 *      needed.
 */
export class CaptureGoodsDialog extends FreeColDialog {
  static logger: Logger = null;
  /**
   * The maximum number of items to loot.
   */
  maxCargo: number = 0;
  /**
   * The button to select all items.
   */
  allButton: JButton = null;
  /**
   * The button to select no items.
   */
  noneButton: JButton = null;
  /**
   * The list of goods to display.
   */
  goodsList: JList<CaptureGoodsDialog$GoodsItem> = null;
  /**
   * Creates a new CaptureGoodsDialog.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param frame The owner frame.
   * @param winner The {@code Unit} that is looting.
   * @param loot The {@code Goods} to loot.
   */
  _CaptureGoodsDialog(freeColClient: FreeColClient, frame: JFrame, winner: Unit, loot: List<Goods>): this {
    this._FreeColDialog$FreeColClient$JFrame(freeColClient, frame);
    this.maxCargo = winner.getSpaceLeft();
    let goods = $J.newArray(loot.size(), null);
    for (let i = 0; i < loot.size(); i++) {
      goods[i] = new CaptureGoodsDialog$GoodsItem()._CaptureGoodsDialog$GoodsItem(loot.get(i));
    }
    this.goodsList = new JList()._JList$();
    this.goodsList.setListData$ObjectArr(goods);
    this.allButton = Utility.localizedButton$String('all');
    this.allButton.addActionListener((ae) => {
      let gl = this.goodsList;
      let siz = gl.getModel().getSize();
      for (let i = 0; i < siz && i < this.maxCargo; i++) {
        let gi = gl.getModel().getElementAt(i);
        gi.setSelected(true);
        this.updateComponents();
      }
    });
    this.allButton.setMnemonic$char(97 /* 'a' */);
    this.allButton.setActionCommand(this.allButton.getText());
    this.noneButton = Utility.localizedButton$String('none');
    this.noneButton.addActionListener((ae) => {
      let gl = this.goodsList;
      for (let i = 0; i < gl.getModel().getSize(); i++) {
        let gi = gl.getModel().getElementAt(i);
        gi.setSelected(false);
        this.updateComponents();
      }
    });
    this.noneButton.setMnemonic$char(110 /* 'n' */);
    this.noneButton.setActionCommand(this.noneButton.getText());
    this.goodsList.setCellRenderer(new CaptureGoodsDialog$CheckBoxRenderer()._CaptureGoodsDialog$CheckBoxRenderer$Market(winner.getOwner().getMarket()));
    this.goodsList.addMouseListener(new (CaptureGoodsDialog$1())().$o(this)._MouseAdapter());
    let panel = new MigPanel()._MigPanel$LayoutManager(new MigLayout()._MigLayout$String$String$String('wrap 1', '[center]', '[]20[]20[]'));
    panel.add$Component(Utility.localizedHeader('captureGoodsDialog.title', Utility.FONTSPEC_SUBTITLE));
    panel.add$Component$Object(this.allButton, 'split 2');
    panel.add$Component(this.noneButton);
    panel.add$Component(this.goodsList);
    panel.setSize$Dimension(panel.getPreferredSize$());
    let c = FreeColDialog.choices();
    c.add(new ChoiceItem()._ChoiceItem$String$Object(Messages.message$String('ok'), null).okOption().defaultOption());
    this.initializeDialog(frame, FreeColDialog$DialogType.QUESTION, false, panel, new ImageIcon()._ImageIcon$Image(this.getImageLibrary().getScaledUnitImage$Unit(winner)), c);
    return this;
  }
  /**
   * Update the components of the {@code goodsList}.
   */
  updateComponents(): void {
    let selectedCount = 0;
    for (let i = 0; i < this.goodsList.getModel().getSize(); i++) {
      let gi = this.goodsList.getModel().getElementAt(i);
      if (gi.isSelected()) {
        selectedCount++;
      }
    }
    if (selectedCount >= this.maxCargo) {
      this.allButton.setEnabled(false);
      for (let i = 0; i < this.goodsList.getModel().getSize(); i++) {
        let gi = this.goodsList.getModel().getElementAt(i);
        if (!gi.isSelected()) {
          gi.setEnabled(false);
        }
      }
    } else {
      this.allButton.setEnabled(true);
      for (let i = 0; i < this.goodsList.getModel().getSize(); i++) {
        let gi = this.goodsList.getModel().getElementAt(i);
        if (!gi.isSelected()) {
          gi.setEnabled(true);
        }
      }
    }
    this.goodsList.repaint$();
  }
  /**
   * {@inheritDoc}
   */
  getResponse(): List<Goods> {
    let value = this.getValue();
    let gl = new ArrayList();
    if (this.options.get(0).equals(value)) {
      for (let i = 0; i < this.goodsList.getModel().getSize(); i++) {
        let gi = this.goodsList.getModel().getElementAt(i);
        if (gi.isSelected()) {
          gl.add(gi.getGoods());
        }
      }
    }
    return gl;
  }
  static $clinit() {
    CaptureGoodsDialog.logger = Logger.getLogger($J.cls(CaptureGoodsDialog).getName());
  }
}

export class CaptureGoodsDialog$GoodsItem extends JCheckBox {
  goods: Goods = null;
  _CaptureGoodsDialog$GoodsItem(goods: Goods): this {
    this._JCheckBox$();
    this.goods = goods;
    return this;
  }
  getGoods(): Goods {
    return this.goods;
  }
  pricePerGood(lookup: Market): string {
    let total = 0;
    if (lookup != null && this.goods != null) {
      total = lookup.getBidPrice(this.goods.getType(), this.goods.getAmount());
    }
    let template = StringTemplate.template$String('captureGoodsDialog.europeanValue').addStringTemplate$String$StringTemplate('%gold%', StringTemplate.template$String('goldAmount').addAmount('%amount%', total));
    return Messages.message$StringTemplate(template);
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    return Messages.message$StringTemplate(this.goods.getLabel$());
  }
}

export class CaptureGoodsDialog$CheckBoxRenderer extends JCheckBox {
  market: Market = null;
  _CaptureGoodsDialog$CheckBoxRenderer$(): this {
    this._JCheckBox$();
    return this;
  }
  /**
   * Overload constructor for market lookups on good pricing for display
   *
   * @param forPriceLookup A {@code Market} to add extra price
   *     information from.
   */
  _CaptureGoodsDialog$CheckBoxRenderer$Market(forPriceLookup: Market): this {
    this._JCheckBox$();
    this.market = forPriceLookup;
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getListCellRendererComponent(list: JList<CaptureGoodsDialog$GoodsItem>, value: CaptureGoodsDialog$GoodsItem, index: number, isSelected: boolean, hasFocus: boolean): Component {
    if (this.market != null) {
      this.setText(value.toString() + ' ' + value.pricePerGood(this.market));
    } else {
      this.setText(value.toString());
    }
    this.setSelected(value.isSelected());
    this.setEnabled(value.isEnabled());
    return this;
  }
}

let $CaptureGoodsDialog$1: any = null;
/** An anonymous class (CaptureGoodsDialog.java:214). */
function CaptureGoodsDialog$1(): any {
  return $CaptureGoodsDialog$1 ??= $J.local(class extends MouseAdapter {
    mouseClicked(me: MouseEvent): void {
      let gl = this.$outer.goodsList;
      let index = gl.locationToIndex(me.getPoint());
      if (index < 0) {
        return;
      }
      let item = gl.getModel().getElementAt(index);
      if (item.isEnabled()) {
        item.setSelected(!item.isSelected());
      }
      this.$outer.updateComponents();
    }
  }, 'net.sf.freecol.client.gui.dialog.CaptureGoodsDialog$1', []);
}

$J.define(CaptureGoodsDialog, 'net.sf.freecol.client.gui.dialog.CaptureGoodsDialog', { kind: 'class', sup: 'net.sf.freecol.client.gui.dialog.FreeColDialog', ctors: { 'net.sf.freecol.client.FreeColClient,javax.swing.JFrame,net.sf.freecol.common.model.Unit,java.util.List': '_CaptureGoodsDialog' }, returns: { 'getResponse': 'java.util.List' }, clinit: true, lazy: ['logger'] });
$J.define(CaptureGoodsDialog$GoodsItem, 'net.sf.freecol.client.gui.dialog.CaptureGoodsDialog$GoodsItem', { kind: 'class', sup: 'javax.swing.JCheckBox', ctors: { 'net.sf.freecol.common.model.Goods': '_CaptureGoodsDialog$GoodsItem' }, returns: { 'getGoods': 'net.sf.freecol.common.model.Goods' } });
$J.define(CaptureGoodsDialog$CheckBoxRenderer, 'net.sf.freecol.client.gui.dialog.CaptureGoodsDialog$CheckBoxRenderer', { kind: 'class', ifaces: ['javax.swing.ListCellRenderer'], sup: 'javax.swing.JCheckBox', ctors: { 'net.sf.freecol.common.model.Market': '_CaptureGoodsDialog$CheckBoxRenderer$Market', '': '_CaptureGoodsDialog$CheckBoxRenderer$' } });
$J.module(() => {
  MouseAdapter = $J.load('java.awt.event.MouseAdapter');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JList = $J.load('javax.swing.JList');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  ChoiceItem = $J.load('net.sf.freecol.client.gui.ChoiceItem');
  FreeColDialog$DialogType = $J.load('net.sf.freecol.client.gui.dialog.FreeColDialog$DialogType');
  MigPanel = $J.load('net.sf.freecol.client.gui.panel.MigPanel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
});
