// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/CornerMapControls.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collectors, Logger } from '../../../../../../../jre/index.ts';
import { MapControls } from './MapControls.ts';
import { JPanel } from '../../../../../../javax/swing/JPanel.ts';

let Dimension, Point, MouseAdapter, JInternalFrame, SwingUtilities, MigLayout, ClientOptions, MiniMapFreeColPanel, Direction, ResourceManager;

/**
 * A collection of panels and buttons that are used to provide the
 * user with a more detailed view of certain elements on the map and
 * also to provide a means of input in case the user can't use the
 * keyboard.
 */
export class CornerMapControls extends MapControls {
  static logger: Logger = null;
  /**
   * The image library.
   */
  lib: ImageLibrary = null;
  /**
   * The compass rose graphic.
   */
  compassRose: JLabel = null;
  /**
   * The mini map has its own panel.
   */
  miniMapPanel: JPanel = null;
  /**
   * A skin for the mini map.
   */
  miniMapSkin: Image = null;
  miniMapPanelSkin: CornerMapControls$MiniMapPanelSkin = null;
  oldUseSkin: boolean = false;
  forceUpdate: boolean = false;
  /**
   * The basic constructor.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _CornerMapControls(freeColClient: FreeColClient): this {
    this._MapControls(freeColClient);
    this.oldUseSkin = false;
    this.forceUpdate = false;
    this.lib = freeColClient.getGUI().getFixedImageLibrary();
    this.compassRose = this.lib.getCompassRose();
    this.compassRose.setFocusable(false);
    this.compassRose.setSize$Dimension(this.compassRose.getPreferredSize$());
    this.compassRose.addMouseListener(new (CornerMapControls$1())().$o(this)._MouseAdapter());
    this.miniMapPanel = new MiniMapFreeColPanel()._MiniMapFreeColPanel(freeColClient);
    this.miniMapPanelSkin = new CornerMapControls$MiniMapPanelSkin().$o(this)._CornerMapControls$MiniMapPanelSkin();
    this.miniMapPanel.add$Component(this.miniMapToggleBorders);
    this.miniMapPanel.add$Component(this.miniMapToggleFogOfWarButton);
    this.miniMapPanel.add$Component(this.miniMapZoomInButton);
    this.miniMapPanel.add$Component(this.miniMapZoomOutButton);
    this.miniMapPanel.add$Component(this.miniMapPanelSkin);
    this.miniMapPanel.add$Component(this.miniMap);
    this.updateLayoutIfNeeded();
    return this;
  }
  /**
   * {@inheritDoc}
   */
  updateLayoutIfNeeded(): void {
    super.updateLayoutIfNeeded();
    let newMinimapSkin = this.lib.getMiniMapSkin();
    if (!this.forceUpdate && this.oldUseSkin === this.isUseSkin() && (!this.oldUseSkin || this.miniMapSkin === newMinimapSkin)) {
      return;
    } else if (!this.isUseSkin()) {
      newMinimapSkin = null;
      let layout = new MigLayout()._MigLayout$String('ins 0 0 0 0, gap 0 0');
      this.miniMapPanel.setLayout(layout);
      layout.addLayoutComponent$Component$Object(this.miniMap, 'newline, grow, shrink, span, w 100%, h 100%');
    } else {
      this.miniMapPanel.setLayout(null);
    }
    this.oldUseSkin = this.isUseSkin();
    this.miniMapSkin = newMinimapSkin;
    this.forceUpdate = false;
    let width = this.lib.scaleInt(MapControls.MINI_MAP_WIDTH);
    let height = this.lib.scaleInt(MapControls.MINI_MAP_HEIGHT);
    this.miniMap.setSize$Dimension(new Dimension()._Dimension$int$int(width, height));
    if (this.miniMapSkin != null) {
      width = this.miniMapSkin.getWidth$ImageObserver(null);
      height = this.miniMapSkin.getHeight$ImageObserver(null);
      this.miniMapPanel.setSize$int$int(width, height);
      this.miniMapPanelSkin.setLocation$int$int(0, 0);
      this.miniMapPanelSkin.setSize$int$int(width, height);
      this.miniMapPanel.setOpaque(false);
    } else {
      this.miniMapPanel.setOpaque(true);
    }
    if (this.isUseSkin()) {
      let pl = ResourceManager.getPropertyList('image.skin.MiniMap.properties');
      this.miniMap.setLocation$int$int(this.lib.scaleInt(pl.getInt$String('minimap.x')), this.lib.scaleInt(pl.getInt$String('minimap.y')));
      this.miniMap.setSize$int$int(this.lib.scaleInt(pl.getInt$String('minimap.width')), this.lib.scaleInt(pl.getInt$String('minimap.height')));
      this.centerComponentOnCoordinate(this.miniMapToggleBorders, pl, 'politicalButton');
      this.centerComponentOnCoordinate(this.miniMapToggleFogOfWarButton, pl, 'fogOfWarButton');
      this.centerComponentOnCoordinate(this.miniMapZoomInButton, pl, 'zoomInButton');
      this.centerComponentOnCoordinate(this.miniMapZoomOutButton, pl, 'zoomOutButton');
    } else {
      this.miniMapPanel.setPreferredSize(new Dimension()._Dimension$int$int(width, height));
      this.getGUI().restoreSavedSize(this.miniMapPanel, new Dimension()._Dimension$int$int(width, height));
    }
    this.miniMapPanel.revalidate();
    this.miniMapPanel.repaint$();
  }
  centerComponentOnCoordinate(component: JComponent, pl: PropertyList, key: string): void {
    let x = this.lib.scaleInt(pl.getInt$String(key + '.x'));
    let y = this.lib.scaleInt(pl.getInt$String(key + '.y'));
    component.setLocation$int$int((x - $J.idiv(component.getWidth(), 2)) | 0, (y - $J.idiv(component.getHeight(), 2)) | 0);
  }
  /**
   * {@inheritDoc}
   */
  getComponentsToAdd(newSize: Dimension): List<JComponent> {
    let ret = new ArrayList();
    if (this.getGame() == null) {
      return ret;
    }
    let cw = newSize.width_;
    let ch = newSize.height_;
    if (!this.infoPanel.isShowing() && !this.miniMapPanel.isShowing()) {
      this.forceUpdate = true;
      this.updateLayoutIfNeeded();
      if (!this.getFreeColClient().isMapEditor()) {
        this.infoPanel.setLocation$int$int((cw - this.infoPanel.getWidth()) | 0, (ch - this.infoPanel.getHeight()) | 0);
        this.miniMapPanel.setLocation$int$int(0, (ch - this.miniMapPanel.getHeight()) | 0);
      }
      this.infoPanel.refresh();
      ret.add(this.infoPanel);
      ret.add(this.miniMapPanel);
    }
    if (!this.getFreeColClient().isMapEditor()) {
      let rose = this.getClientOptions().getBoolean(ClientOptions.DISPLAY_COMPASS_ROSE);
      if (rose && !this.compassRose.isShowing()) {
        this.compassRose.setLocation$int$int((cw - this.compassRose.getWidth() - 20) | 0, 20);
        ret.add(this.compassRose);
      }
      ret.addAll(this.unitButtons_.stream().filter((b) => !b.isShowing()).collect(Collectors.toList()));
      if (!this.unitButtons_.isEmpty()) {
        let UNSCALED_SPACE_BETWEEN_BUTTONS = 5;
        let spaceBetweenButtons = this.lib.scaleInt(UNSCALED_SPACE_BETWEEN_BUTTONS);
        let buttonsDimension = CornerMapControls.calculateTotalDimension(this.unitButtons_, spaceBetweenButtons);
        let totalWidth = (buttonsDimension.width_ + this.miniMapPanel.getWidth() + this.infoPanel.getWidth()) | 0;
        if (totalWidth < newSize.width_) {
          let firstButtonPoint = this.calculateFirstPosition(newSize, this.unitButtons_, spaceBetweenButtons, buttonsDimension);
          this.layoutUnitButtons(this.unitButtons_, buttonsDimension, firstButtonPoint, spaceBetweenButtons);
        } else {
          let numberInTopRow = $J.idiv(this.unitButtons_.size(), 2);
          let bottomRowButtons = this.unitButtons_.subList(numberInTopRow, this.unitButtons_.size());
          let buttonsBottomRowDimension = CornerMapControls.calculateTotalDimension(bottomRowButtons, spaceBetweenButtons);
          let firstButtonBottomRowPoint = this.calculateFirstPosition(newSize, bottomRowButtons, spaceBetweenButtons, buttonsBottomRowDimension);
          this.layoutUnitButtons(bottomRowButtons, buttonsDimension, firstButtonBottomRowPoint, spaceBetweenButtons);
          let topRowButtons = this.unitButtons_.subList(0, numberInTopRow);
          let buttonsTopRowDimension = CornerMapControls.calculateTotalDimension(topRowButtons, spaceBetweenButtons);
          let firstButtonTopRowPoint = this.calculateFirstPosition(newSize, bottomRowButtons, spaceBetweenButtons, buttonsTopRowDimension);
          this.layoutUnitButtons(topRowButtons, buttonsDimension, new Point()._Point$int$int(firstButtonTopRowPoint.x_, (firstButtonBottomRowPoint.y_ - buttonsTopRowDimension.height_ - spaceBetweenButtons) | 0), spaceBetweenButtons);
        }
      }
    }
    return ret;
  }
  static calculateTotalDimension(unitButtons: List<UnitButton>, spaceBetweenButtons: number): Dimension {
    let width = -spaceBetweenButtons;
    let height = 0;
    for (const $it0 = unitButtons.iterator(); $it0.hasNext(); ) {
      let ub = $it0.next();
      if (ub.isShowing()) {
        continue;
      }
      height = Math.max(height, ub.getHeight());
      width = (width + (spaceBetweenButtons + ub.getWidth())) | 0;
    }
    return new Dimension()._Dimension$int$int(width, height);
  }
  calculateFirstPosition(newSize: Dimension, unitButtons: List<UnitButton>, spaceBetweenButtons: number, buttonsDimension: Dimension): Point {
    let x = (this.miniMapPanel.getWidth() + 1 + $J.idiv(((this.infoPanel.getX() - this.miniMapPanel.getWidth() - buttonsDimension.width_) | 0), 2)) | 0;
    let y = (newSize.height_ - buttonsDimension.height_ - spaceBetweenButtons) | 0;
    return new Point()._Point$int$int(x, y);
  }
  layoutUnitButtons(unitButtons: List<UnitButton>, buttonsDimension: Dimension, firstButtonPoint: Point, spaceBetweenButtons: number): void {
    let x = firstButtonPoint.x_;
    let y = firstButtonPoint.y_;
    for (const $it1 = unitButtons.iterator(); $it1.hasNext(); ) {
      let ub = $it1.next();
      if (ub.isShowing()) {
        continue;
      }
      ub.setLocation$int$int(x, y);
      x = (x + (spaceBetweenButtons + ub.getWidth())) | 0;
      ub.refreshAction();
    }
  }
  /**
   * {@inheritDoc}
   */
  getComponentsPresent(): List<JComponent> {
    let ret = new ArrayList();
    if (this.isShowingOrIconified(this.infoPanel)) {
      ret.add(this.infoPanel);
    }
    if (this.isShowingOrIconified(this.miniMapPanel)) {
      ret.add(this.miniMapPanel);
    }
    let rose = this.getClientOptions().getBoolean(ClientOptions.DISPLAY_COMPASS_ROSE);
    if (rose && this.compassRose.isShowing()) {
      ret.add(this.compassRose);
    }
    for (const $it2 = this.unitButtons_.iterator(); $it2.hasNext(); ) {
      let ub = $it2.next();
      if (ub.isShowing()) {
        ret.add(ub);
      }
    }
    return ret;
  }
  isShowingOrIconified(panel: JComponent): boolean {
    let f = SwingUtilities.getAncestorOfClass($J.cls(JInternalFrame), panel);
    if (f != null && f.isIcon()) {
      return true;
    }
    return panel.isShowing();
  }
  static $clinit() {
    CornerMapControls.logger = Logger.getLogger($J.cls(CornerMapControls).getName());
  }
}

export class CornerMapControls$MiniMapPanelSkin extends JPanel {
  _CornerMapControls$MiniMapPanelSkin(): this {
    this._JPanel$();
    this.setOpaque(false);
    return this;
  }
  paintComponent(graphics: Graphics): void {
    super.paintComponent(graphics);
    if (this.$outer.miniMapSkin != null) {
      graphics.drawImage$Image$int$int$ImageObserver(this.$outer.miniMapSkin, 0, 0, null);
    }
  }
}

let $CornerMapControls$1: any = null;
/** An anonymous class (CornerMapControls.java:106). */
function CornerMapControls$1(): any {
  return $CornerMapControls$1 ??= $J.local(class extends MouseAdapter {
    /**
     * {@inheritDoc}
     */
    mouseClicked(e: MouseEvent): void {
      let unit = this.$outer.getGUI().getActiveUnit();
      if (unit == null) {
        return;
      }
      let x = (e.getX() - $J.idiv(this.$outer.compassRose.getWidth(), 2)) | 0;
      let y = (e.getY() - $J.idiv(this.$outer.compassRose.getHeight(), 2)) | 0;
      let theta = Math.atan2(y, x) + 3.141592653589793 / 2 + 3.141592653589793 / 8;
      if (theta < 0) {
        theta += 2 * 3.141592653589793;
      }
      this.$outer.igc().moveUnit(unit, Direction.angleToDirection(theta));
    }
  }, 'net.sf.freecol.client.gui.panel.CornerMapControls$1', []);
}

$J.define(CornerMapControls, 'net.sf.freecol.client.gui.panel.CornerMapControls', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.MapControls', ctors: { 'net.sf.freecol.client.FreeColClient': '_CornerMapControls' }, returns: { 'getComponentsPresent': 'java.util.List' }, clinit: true, lazy: ['logger'] });
$J.define(CornerMapControls$MiniMapPanelSkin, 'net.sf.freecol.client.gui.panel.CornerMapControls$MiniMapPanelSkin', { kind: 'class', sup: 'javax.swing.JPanel', ctors: { '': '_CornerMapControls$MiniMapPanelSkin' }, inner: true });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  Point = $J.load('java.awt.Point');
  MouseAdapter = $J.load('java.awt.event.MouseAdapter');
  JInternalFrame = $J.load('javax.swing.JInternalFrame');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  ClientOptions = $J.load('net.sf.freecol.client.ClientOptions');
  MiniMapFreeColPanel = $J.load('net.sf.freecol.client.gui.panel.MiniMapFreeColPanel');
  Direction = $J.load('net.sf.freecol.common.model.Direction');
  ResourceManager = $J.load('net.sf.freecol.common.resources.ResourceManager');
});
