// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/TilePanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JString, Logger } from '../../../../../../../jre/index.ts';
import { FreeColPanel } from './FreeColPanel.ts';

let AbstractAction, ImageIcon, JLabel, SwingConstants, MigLayout, Utility, DebugUtils, FreeColDebugger, Messages, Player$ColonyValueCategory, StringTemplate, CollectionUtils;

/**
 * This panel is used to show information about a tile.
 */
export class TilePanel extends FreeColPanel {
  static logger: Logger = null;
  static readonly COLOPEDIA: string = 'COLOPEDIA';
  /**
   * Creates a panel describing a tile.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param tile The {@code Tile} to describe.
   */
  _TilePanel(freeColClient: FreeColClient, tile: Tile): this {
    this._FreeColPanel$FreeColClient$String$LayoutManager(freeColClient, 'TilePanelUI', new MigLayout()._MigLayout$String$String('wrap 2, insets 20 30 10 30', '[right, sg][left, sg]'));
    let player = freeColClient.getMyPlayer();
    let tileType = tile.getType();
    let colopediaButton = Utility.localizedButton$String('colopedia');
    colopediaButton.setActionCommand(tile.getType().getId());
    colopediaButton.addActionListener($J.fn(this, 'actionPerformed'));
    let template = StringTemplate.template$String('tilePanel.label').addStringTemplate$String$StringTemplate('%label%', tile.getLabel()).addAmount('%x%', tile.getX()).addAmount('%y%', tile.getY());
    this.add$Component$Object(Utility.localizedLabel$StringTemplate(template), 'span, center');
    let lib = this.getImageLibrary();
    let image = this.getGUI().createTileImage(tile, player);
    this.add$Component$Object(new JLabel()._JLabel$Icon(new ImageIcon()._ImageIcon$Image(image)), 'span, center');
    if (tile.getRegion() != null) {
      this.add$Component(Utility.localizedLabel$String('tilePanel.region'));
      this.add$Component(Utility.localizedLabel$StringTemplate(tile.getRegion().getLabel()));
    }
    if (tile.getOwner() != null) {
      let ownerName = tile.getOwner().getNationLabel();
      if (ownerName != null) {
        this.add$Component(Utility.localizedLabel$String('tilePanel.owner'));
        this.add$Component(Utility.localizedLabel$StringTemplate(ownerName));
      }
    }
    if (tile.getOwningSettlement() != null) {
      let settlementName = tile.getOwningSettlement().getLocationLabelFor(player);
      if (settlementName != null) {
        this.add$Component(Utility.localizedLabel$String('tilePanel.settlement'));
        this.add$Component(Utility.localizedLabel$StringTemplate(settlementName));
      }
    }
    let defenceBonus = tile.getDefenceBonusPercentage();
    if (defenceBonus !== 0) {
      this.add$Component(Utility.localizedLabel$String('tilePanel.defenseBonus'));
      this.add$Component(new JLabel()._JLabel$String(String(defenceBonus) + '%'));
    }
    let movementCost = $J.idiv(tile.getType().getBasicMoveCost(), 3);
    this.add$Component(Utility.localizedLabel$String('tilePanel.movementCost'));
    this.add$Component(new JLabel()._JLabel$String(String(movementCost)));
    if (tileType != null) {
      let spec = this.getSpecification();
      let colonist = spec.getDefaultUnitType$();
      let label = null;
      let first = true;
      for (const $it0 = (CollectionUtils.iterable(CollectionUtils.flatten$Collection$Function(tileType.getAvailableProductionTypes$boolean(false), ($p0) => $p0.getOutputs()))).iterator(); $it0.hasNext(); ) {
        let output = $it0.next();
        let gt = output.getType();
        let amount = output.getAmount();
        if (tile.getTileItemContainer() != null) {
          amount = tile.getTileItemContainer().getTotalBonusPotential(gt, colonist, amount, true);
        }
        let expertPotential = amount;
        let expert = spec.getExpertForProducing(gt);
        if (expert != null) {
          expertPotential = $J.d2i(expert.apply$float$Turn$String(Math.fround(amount), this.getGame().getTurn(), gt.getId()));
        }
        if (amount > 0) {
          label = new JLabel()._JLabel$String$Icon$int(String(amount), new ImageIcon()._ImageIcon$Image(lib.getScaledGoodsTypeImage(gt)), SwingConstants.CENTER);
          if (first) {
            this.add$Component$Object(label, 'span, split, center');
            first = false;
          } else {
            this.add$Component(label);
          }
        }
        if (expertPotential > amount) {
          if (label == null) {
            label = new JLabel()._JLabel$String$Icon$int(String(expertPotential), new ImageIcon()._ImageIcon$Image(lib.getScaledGoodsTypeImage(gt)), SwingConstants.CENTER);
            label.setToolTipText(Messages.getName$Named(expert));
            if (first) {
              this.add$Component$Object(label, 'span, split');
              first = false;
            } else {
              this.add$Component(new JLabel()._JLabel$String('/'));
              this.add$Component(label);
            }
          } else {
            label.setText(String(amount) + '/' + String(expertPotential));
            label.setToolTipText(Messages.getName$Named(colonist) + '/' + Messages.getName$Named(expert));
          }
        }
      }
    }
    let debugPlayer = FreeColDebugger.debugDisplayColonyValuePlayer();
    if (debugPlayer != null) {
      let values = debugPlayer.getAllColonyValues(tile);
      let result = debugPlayer.getColonyValue(tile);
      if (result < 0) {
        this.add$Component$Object(new JLabel()._JLabel$String(DebugUtils.getColonyValue(tile)), 'newline 5, span, align center');
      } else {
        for (let c of Player$ColonyValueCategory.values()) {
          let cat = c.toString();
          this.add$Component$Object(new JLabel()._JLabel$String(cat + $J.str($J.boxD(values.get(c.ordinal())))), 'newline 5, span, align center');
        }
        for (let a = Player$ColonyValueCategory.A_GOODS.ordinal(); a < values.size(); a++) {
          this.add$Component$Object(new JLabel()._JLabel$String('... ' + $J.str($J.boxD(values.get(a)))), 'newline 5, span, align center');
        }
        this.add$Component$Object(new JLabel()._JLabel$String('Result ' + result), 'newline 5, span, align center');
      }
    }
    this.add$Component$Object(this.okButton, 'newline 30, span, split 2, align center, tag ok');
    this.add$Component$Object(colopediaButton, 'tag help');
    this.setEscapeAction(new (TilePanel$1())().$o(this)._AbstractAction$());
    this.setSize$Dimension(this.getPreferredSize$());
    return this;
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    let command = ae.getActionCommand();
    if ($J.equals(FreeColPanel.OK, command)) {
      this.getGUI().removeComponent(this);
    } else {
      this.getGUI().showColopediaPanel(command);
    }
  }
  static $clinit() {
    TilePanel.logger = Logger.getLogger($J.cls(TilePanel).getName());
  }
}

let $TilePanel$1: any = null;
/** An anonymous class (TilePanel.java:210). */
function TilePanel$1(): any {
  return $TilePanel$1 ??= $J.local(class extends AbstractAction {
    actionPerformed(ae: ActionEvent): void {
      this.$outer.okButton.doClick$();
    }
  }, 'net.sf.freecol.client.gui.panel.TilePanel$1', []);
}

$J.define(TilePanel, 'net.sf.freecol.client.gui.panel.TilePanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.FreeColPanel', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.common.model.Tile': '_TilePanel' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  AbstractAction = $J.load('javax.swing.AbstractAction');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JLabel = $J.load('javax.swing.JLabel');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  DebugUtils = $J.load('net.sf.freecol.common.debug.DebugUtils');
  FreeColDebugger = $J.load('net.sf.freecol.common.debug.FreeColDebugger');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Player$ColonyValueCategory = $J.load('net.sf.freecol.common.model.Player$ColonyValueCategory');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
