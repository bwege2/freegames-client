// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/MapEditorTransformPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Logger, StringBuilder } from '../../../../../../../jre/index.ts';
import { FreeColPanel } from './FreeColPanel.ts';
import { MapTransform } from '../../control/MapTransform.ts';

let BorderLayout, Color, Dimension, BorderFactory, ButtonGroup, ImageIcon, JLabel, JPanel, JScrollPane, JToggleButton, ScrollPaneConstants, SwingConstants, ChoiceItem, ImageLibrary, SwingGUI$PopupPosition, WrapLayout, WrapLayout$HorizontalAlignment, WrapLayout$HorizontalGap, ChooseAreaModificationPanel, Messages, Direction, LostCityRumour, ModelMessage$MessageType, Resource, StringTemplate, TileImprovement, CollectionUtils, ServerIndianSettlement;

/**
 * A panel for choosing the current {@code MapTransform}.
 *
 * This panel is only used when running in
 * {@link net.sf.freecol.client.FreeColClient#isMapEditor() map editor mode}.
 *
 * @see MapEditorController#getMapTransform()
 * @see MapTransform
 */
export class MapEditorTransformPanel extends FreeColPanel {
  static logger: Logger = null;
  /**
   * A native nation to use for native settlement type and skill.
   */
  static nativeNation: Nation = null;
  listPanel: JPanel = null;
  settlementButton: JToggleButton = null;
  group: ButtonGroup = null;
  chooseAreaModificationPanel: ChooseAreaModificationPanel = null;
  /**
   * Creates a panel to choose a map transform.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _MapEditorTransformPanel(freeColClient: FreeColClient): this {
    this._FreeColPanel$FreeColClient$String$LayoutManager(freeColClient, null, new BorderLayout()._BorderLayout$());
    let ctlr = this.getFreeColClient().getMapEditorController();
    let areaModificationHandler = (area) => {
      ctlr.setCurrentArea(area);
      let currentMapTransform = ctlr.getMapTransform();
      if (currentMapTransform instanceof MapEditorTransformPanel$AssignAreaTransform) {
        let assignAreaTransform = currentMapTransform;
        assignAreaTransform.setArea(area);
      }
    };
    this.chooseAreaModificationPanel = new ChooseAreaModificationPanel()._ChooseAreaModificationPanel(freeColClient, areaModificationHandler);
    let terrainSize = ImageLibrary.scaleDimension(this.getImageLibrary().scale$Dimension(ImageLibrary.TILE_OVERLAY_SIZE), ImageLibrary.SMALLER_SCALE);
    this.listPanel = new JPanel()._JPanel$LayoutManager(new WrapLayout()._WrapLayout().withForceComponentSize(terrainSize).withHorizontalAlignment(WrapLayout$HorizontalAlignment.LEFT).withHorizontalGap$HorizontalGap(WrapLayout$HorizontalGap.AUTO));
    this.group = new ButtonGroup()._ButtonGroup();
    this.group.add(new JToggleButton()._JToggleButton$());
    this.buildList();
    let sl = new JScrollPane()._JScrollPane$Component$int$int(this.listPanel, ScrollPaneConstants.VERTICAL_SCROLLBAR_AS_NEEDED, ScrollPaneConstants.HORIZONTAL_SCROLLBAR_NEVER);
    sl.getViewport().setOpaque(false);
    this.listPanel.setSize$Dimension(new Dimension()._Dimension$int$int(Math.imul(terrainSize.width_, 3), 0));
    this.add$Component$Object(sl, BorderLayout.CENTER);
    this.setBorder(BorderFactory.createEmptyBorder$());
    this.revalidate();
    this.repaint$();
    return this;
  }
  getFrameTitle(): string {
    return Messages.message$String('mapEditorTransformPanel.title');
  }
  getFramePopupPosition(): SwingGUI$PopupPosition {
    return SwingGUI$PopupPosition.RIGHT;
  }
  /**
   * Get the last used native nation.
   *
   * @return A suitable {@code Nation}.
   */
  getNativeNation(): Nation {
    if (MapEditorTransformPanel.nativeNation == null) {
      MapEditorTransformPanel.nativeNation = CollectionUtils.first$Collection(this.getSpecification().getIndianNations());
    }
    return MapEditorTransformPanel.nativeNation;
  }
  /**
   * Set the native nation.
   *
   * @param newNativeNation The new native {@code Nation}.
   */
  static setNativeNation(newNativeNation: Nation): void {
    MapEditorTransformPanel.nativeNation = newNativeNation;
  }
  /**
   * Builds the buttons for all the terrains.
   */
  buildList(): void {
    let spec = this.getSpecification();
    let terrainSize = ImageLibrary.scaleDimension(this.getImageLibrary().scale$Dimension(ImageLibrary.TILE_OVERLAY_SIZE), ImageLibrary.SMALLER_SCALE);
    let riverSize = ImageLibrary.scaleDimension(this.getImageLibrary().scale$Dimension(ImageLibrary.TILE_SIZE), ImageLibrary.SMALLER_SCALE);
    for (const $it0 = spec.getTileTypeList().iterator(); $it0.hasNext(); ) {
      let type$ = $it0.next();
      let tileImage = this.getImageLibrary().getTileImageWithOverlayAndForest(type$, terrainSize);
      this.listPanel.add$Component(this.buildButton(tileImage, Messages.getName$Named(type$), new MapEditorTransformPanel$TileTypeTransform()._MapEditorTransformPanel$TileTypeTransform(type$)));
    }
    this.listPanel.add$Component(this.buildButton(this.getImageLibrary().getRiverImage('0101', riverSize), Messages.message$String('mapEditorTransformPanel.minorRiver'), new MapEditorTransformPanel$RiverTransform()._MapEditorTransformPanel$RiverTransform(TileImprovement.SMALL_RIVER)));
    this.listPanel.add$Component(this.buildButton(this.getImageLibrary().getRiverImage('0202', riverSize), Messages.message$String('mapEditorTransformPanel.majorRiver'), new MapEditorTransformPanel$RiverTransform()._MapEditorTransformPanel$RiverTransform(TileImprovement.LARGE_RIVER)));
    this.listPanel.add$Component(this.buildButton(this.getImageLibrary().getRiverImage('2022', riverSize), Messages.message$String('mapEditorTransformPanel.changeRiverConnections'), new MapEditorTransformPanel$RiverStyleTransform()._MapEditorTransformPanel$RiverStyleTransform(MapEditorTransformPanel$RiverStyleTransform.CHANGE_CONNECTIONS)));
    this.listPanel.add$Component(this.buildButton(this.getImageLibrary().getRiverImage('1022', riverSize), Messages.message$String('mapEditorTransformPanel.setRiverStyle'), new MapEditorTransformPanel$RiverStyleTransform()._MapEditorTransformPanel$RiverStyleTransform(MapEditorTransformPanel$RiverStyleTransform.SET_STYLE)));
    let rt = CollectionUtils.first$Collection(spec.getResourceTypeList());
    this.listPanel.add$Component(this.buildButton(this.getImageLibrary().getResourceTypeImage$ResourceType$Dimension$boolean(rt, riverSize, false), Messages.message$String('mapEditorTransformPanel.resource'), new MapEditorTransformPanel$ResourceTransform().$o(this)._MapEditorTransformPanel$ResourceTransform()));
    this.listPanel.add$Component(this.buildButton(this.getImageLibrary().getLCRImage(riverSize), Messages.getName$Named(ModelMessage$MessageType.LOST_CITY_RUMOUR), new MapEditorTransformPanel$LostCityRumourTransform()._MapEditorTransformPanel$LostCityRumourTransform()));
    let settlementType = this.getNativeNation().getType().getCapitalType();
    this.listPanel.add$Component(this.buildButton(this.getImageLibrary().getSettlementTypeImage$SettlementType$Dimension(settlementType, riverSize), Messages.message$String('settlement'), new MapEditorTransformPanel$SettlementTransform().$o(this)._MapEditorTransformPanel$SettlementTransform()));
    this.listPanel.add$Component(this.buildButton(this.getImageLibrary().getScaledImage('image.icon.mapEditor.selectArea'), Messages.message$String('mapEditorTransformPanel.selectArea'), new MapEditorTransformPanel$AssignAreaTransform()._MapEditorTransformPanel$AssignAreaTransform(null)));
  }
  /**
   * Builds the button for the given terrain.
   *
   * @param image an {@code Image} value
   * @param text a {@code String} value
   * @param mt a {@code MapTransform} value
   * @return A suitable button.
   */
  buildButton(image: Image, text: string, mt: MapTransform): JToggleButton {
    let ctlr = this.getFreeColClient().getMapEditorController();
    let descriptionPanel = new JPanel()._JPanel$LayoutManager(new BorderLayout()._BorderLayout$());
    descriptionPanel.add$Component$Object(new JLabel()._JLabel$Icon(new ImageIcon()._ImageIcon$Image(image)), BorderLayout.CENTER);
    descriptionPanel.add$Component$Object(new JLabel()._JLabel$String$int(text, SwingConstants.CENTER), BorderLayout.PAGE_END);
    descriptionPanel.setBackground(Color.RED);
    mt.setDescriptionPanel(descriptionPanel);
    let icon = new ImageIcon()._ImageIcon$Image(image);
    let button = new JToggleButton()._JToggleButton$Icon(icon);
    button.setToolTipText(text);
    button.setOpaque(false);
    this.group.add(button);
    button.addActionListener((ae) => {
      let newMapTransform = null;
      if (ctlr.getMapTransform() !== mt) {
        if (mt instanceof MapEditorTransformPanel$RiverStyleTransform) {
          let rst = mt;
          let all = rst.getType() !== MapEditorTransformPanel$RiverStyleTransform.CHANGE_CONNECTIONS;
          let style = this.getGUI().showRiverStyleDialog(ImageLibrary.getRiverStyleKeys(all));
          if (style != null) {
            rst.setStyle(style);
          }
        }
        if (mt instanceof MapEditorTransformPanel$AssignAreaTransform) {
          this.getGUI().showFreeColPanel(this.chooseAreaModificationPanel, true, null, true);
          newMapTransform = null;
          ctlr.setDisplayAreas(true);
        }
        newMapTransform = mt;
      }
      ctlr.setMapTransform(newMapTransform);
      if (newMapTransform == null && mt != null) {
        this.group.setSelected(this.group.getElements().nextElement().getModel(), true);
      }
    });
    button.setBorder(null);
    return button;
  }
  /**
   * Ask the user for a resource choice from a list.
   *
   * Ripped out of ResourceTransform to dodge the name clash with
   * CollectionUtils.transform which we want to use here.
   *
   * @param resources A list of {@code ResourceType}s to choose from.
   * @return The chosen {@code ResourceType}.
   */
  getResourceChoice(resources: List<ResourceType>): ResourceType {
    let mapper = (rt) => new ChoiceItem()._ChoiceItem$String$Object(Messages.getName$Named(rt), rt);
    let tmpl = StringTemplate.template$String('mapEditorTransformPanel.chooseResource');
    return this.getGUI().getChoice$StringTemplate$String$List(tmpl, 'cancel', CollectionUtils.transform$Collection$Predicate$Function(resources, CollectionUtils.alwaysTrue(), mapper));
  }
  static $clinit() {
    MapEditorTransformPanel.logger = Logger.getLogger($J.cls(MapEditorTransformPanel).getName());
  }
}

export class MapEditorTransformPanel$RiverTransform extends MapTransform {
  magnitude: number = 0;
  _MapEditorTransformPanel$RiverTransform(magnitude: number): this {
    this._MapTransform();
    this.magnitude = magnitude;
    return this;
  }
  /**
   * {@inheritDoc}
   */
  transform(tile: Tile): void {
    let riverType = tile.getSpecification().getTileImprovementType('model.improvement.river');
    if (!riverType.isTileTypeAllowed(tile.getType())) {
      return;
    }
    if (tile.hasRiver()) {
      tile.removeRiver();
    } else {
      let sb = new StringBuilder(64);
      for (const $it1 = Direction.longSides.iterator(); $it1.hasNext(); ) {
        let direction = $it1.next();
        let t = tile.getNeighbourOrNull(direction);
        let otherRiver = (t == null) ? null : t.getRiver();
        if (t == null || (t.isLand() && otherRiver == null)) {
          sb.append(String.fromCharCode(48 /* '0' */));
        } else {
          sb.append(String(this.magnitude));
        }
      }
      tile.addRiver(this.magnitude, sb.toString());
    }
  }
}

export class MapEditorTransformPanel$RiverStyleTransform extends MapTransform {
  static readonly CHANGE_CONNECTIONS: number = 0;
  static readonly SET_STYLE: number = 1;
  style: string = null;
  type: number = 0;
  _MapEditorTransformPanel$RiverStyleTransform(type$: number): this {
    this._MapTransform();
    this.style = null;
    this.type = type$;
    return this;
  }
  setStyle(style: string): void {
    this.style = style;
  }
  getType(): number {
    return this.type;
  }
  /**
   * {@inheritDoc}
   */
  transform(tile: Tile): void {
    let river = tile.getRiver();
    if (river != null) {
      if (this.type === MapEditorTransformPanel$RiverStyleTransform.CHANGE_CONNECTIONS) {
        river.updateRiverConnections(this.style);
      } else {
        river.setRiverStyle(this.style);
      }
    }
  }
}

/**
 * Adds, removes or cycles through the available resources for
 * this Tile.  Cycles through the ResourceTypeList and picks the
 * next valid, or removes if end of list.
 */
export class MapEditorTransformPanel$ResourceTransform extends MapTransform {
  _MapEditorTransformPanel$ResourceTransform(): this {
    this._MapTransform();
    return this;
  }
  /**
   * {@inheritDoc}
   */
  transform(t: Tile): void {
    let resource = null;
    if (t.getTileItemContainer() != null) {
      resource = t.getTileItemContainer().getResource();
    }
    if (resource != null) {
      t.getTileItemContainer().removeTileItem(resource);
    } else {
      let resList = t.getType().getResourceTypeValues();
      {
        let resourceType: ResourceType, choice: ResourceType;
        switch (resList.size()) {
          case 0:
            return;
          case 1:
            resourceType = CollectionUtils.first$Collection(resList);
            t.addResource(new Resource()._Resource$Game$Tile$ResourceType$int(t.getGame(), t, resourceType, resourceType.getMaxValue()));
            return;
          default:
            choice = this.$outer.getResourceChoice(resList);
            if (choice != null) {
              t.addResource(new Resource()._Resource$Game$Tile$ResourceType$int(t.getGame(), t, choice, choice.getMaxValue()));
            }
        }
      }
    }
  }
}

export class MapEditorTransformPanel$LostCityRumourTransform extends MapTransform {
  _MapEditorTransformPanel$LostCityRumourTransform(): this {
    this._MapTransform();
    return this;
  }
  /**
   * {@inheritDoc}
   */
  transform(t: Tile): void {
    if (t.isLand()) {
      let rumour = t.getLostCityRumour();
      if (rumour == null) {
        t.addLostCityRumour(new LostCityRumour()._LostCityRumour$Game$Tile(t.getGame(), t));
      } else {
        t.removeLostCityRumour();
      }
    }
  }
}

export class MapEditorTransformPanel$SettlementTransform extends MapTransform {
  _MapEditorTransformPanel$SettlementTransform(): this {
    this._MapTransform();
    return this;
  }
  /**
   * {@inheritDoc}
   */
  transform(t: Tile): void {
    if (!t.isLand() || t.hasSettlement()) {
      return;
    }
    let skill = CollectionUtils.first$Collection((this.$outer.getNativeNation().getType()).getSkills()).getObject();
    let nativePlayer = this.$outer.getGame().getPlayerByNation(this.$outer.getNativeNation());
    if (nativePlayer == null) {
      return;
    }
    let name = nativePlayer.getSettlementName(null);
    let sis = new ServerIndianSettlement()._ServerIndianSettlement$Game$Player$String$Tile$boolean$UnitType$Unit(t.getGame(), nativePlayer, name, t, false, skill, null);
    nativePlayer.addSettlement(sis);
    sis.placeSettlement(true);
    sis.addUnits$Random(null);
    MapEditorTransformPanel.logger.info('Add settlement ' + sis.getName() + ' to tile ' + $J.str(t));
  }
}

export class MapEditorTransformPanel$TileTypeTransform extends MapTransform {
  tileType: TileType = null;
  _MapEditorTransformPanel$TileTypeTransform(tileType: TileType): this {
    this._MapTransform();
    this.tileType = tileType;
    return this;
  }
  getTileType(): TileType {
    return this.tileType;
  }
  /**
   * {@inheritDoc}
   */
  transform(t: Tile): void {
    t.changeType(this.tileType);
    t.removeLostCityRumour();
  }
}

export class MapEditorTransformPanel$AssignAreaTransform extends MapTransform {
  area: Area = null;
  _MapEditorTransformPanel$AssignAreaTransform(area: Area): this {
    this._MapTransform();
    this.area = area;
    return this;
  }
  getArea(): Area {
    return this.area;
  }
  setArea(area: Area): void {
    this.area = area;
  }
  /**
   * {@inheritDoc}
   */
  transform(t: Tile): void {
    if (this.area == null) {
      return;
    }
    if (this.area.containsTile(t)) {
      this.area.removeTile(t);
    } else {
      this.area.addTile(t);
    }
  }
}

$J.define(MapEditorTransformPanel, 'net.sf.freecol.client.gui.panel.MapEditorTransformPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.FreeColPanel', ctors: { 'net.sf.freecol.client.FreeColClient': '_MapEditorTransformPanel' }, returns: { 'getNativeNation': 'net.sf.freecol.common.model.Nation', 'getFramePopupPosition': 'net.sf.freecol.client.gui.SwingGUI$PopupPosition', 'getFrameTitle': 'java.lang.String' }, clinit: true, lazy: ['logger', 'nativeNation'] });
$J.define(MapEditorTransformPanel$RiverTransform, 'net.sf.freecol.client.gui.panel.MapEditorTransformPanel$RiverTransform', { kind: 'class', sup: 'net.sf.freecol.client.control.MapTransform', ctors: { 'int': '_MapEditorTransformPanel$RiverTransform' } });
$J.define(MapEditorTransformPanel$RiverStyleTransform, 'net.sf.freecol.client.gui.panel.MapEditorTransformPanel$RiverStyleTransform', { kind: 'class', sup: 'net.sf.freecol.client.control.MapTransform', ctors: { 'int': '_MapEditorTransformPanel$RiverStyleTransform' }, returns: { 'getType': 'int' } });
$J.define(MapEditorTransformPanel$ResourceTransform, 'net.sf.freecol.client.gui.panel.MapEditorTransformPanel$ResourceTransform', { kind: 'class', sup: 'net.sf.freecol.client.control.MapTransform', ctors: { '': '_MapEditorTransformPanel$ResourceTransform' }, inner: true });
$J.define(MapEditorTransformPanel$LostCityRumourTransform, 'net.sf.freecol.client.gui.panel.MapEditorTransformPanel$LostCityRumourTransform', { kind: 'class', sup: 'net.sf.freecol.client.control.MapTransform', ctors: { '': '_MapEditorTransformPanel$LostCityRumourTransform' } });
$J.define(MapEditorTransformPanel$SettlementTransform, 'net.sf.freecol.client.gui.panel.MapEditorTransformPanel$SettlementTransform', { kind: 'class', sup: 'net.sf.freecol.client.control.MapTransform', ctors: { '': '_MapEditorTransformPanel$SettlementTransform' }, inner: true });
$J.define(MapEditorTransformPanel$TileTypeTransform, 'net.sf.freecol.client.gui.panel.MapEditorTransformPanel$TileTypeTransform', { kind: 'class', sup: 'net.sf.freecol.client.control.MapTransform', ctors: { 'net.sf.freecol.common.model.TileType': '_MapEditorTransformPanel$TileTypeTransform' }, returns: { 'getTileType': 'net.sf.freecol.common.model.TileType' } });
$J.define(MapEditorTransformPanel$AssignAreaTransform, 'net.sf.freecol.client.gui.panel.MapEditorTransformPanel$AssignAreaTransform', { kind: 'class', sup: 'net.sf.freecol.client.control.MapTransform', ctors: { 'net.sf.freecol.common.model.Area': '_MapEditorTransformPanel$AssignAreaTransform' }, returns: { 'getArea': 'net.sf.freecol.common.model.Area' } });
$J.module(() => {
  BorderLayout = $J.load('java.awt.BorderLayout');
  Color = $J.load('java.awt.Color');
  Dimension = $J.load('java.awt.Dimension');
  BorderFactory = $J.load('javax.swing.BorderFactory');
  ButtonGroup = $J.load('javax.swing.ButtonGroup');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JLabel = $J.load('javax.swing.JLabel');
  JPanel = $J.load('javax.swing.JPanel');
  JScrollPane = $J.load('javax.swing.JScrollPane');
  JToggleButton = $J.load('javax.swing.JToggleButton');
  ScrollPaneConstants = $J.load('javax.swing.ScrollPaneConstants');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  ChoiceItem = $J.load('net.sf.freecol.client.gui.ChoiceItem');
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  SwingGUI$PopupPosition = $J.load('net.sf.freecol.client.gui.SwingGUI$PopupPosition');
  WrapLayout = $J.load('net.sf.freecol.client.gui.panel.WrapLayout');
  WrapLayout$HorizontalAlignment = $J.load('net.sf.freecol.client.gui.panel.WrapLayout$HorizontalAlignment');
  WrapLayout$HorizontalGap = $J.load('net.sf.freecol.client.gui.panel.WrapLayout$HorizontalGap');
  ChooseAreaModificationPanel = $J.load('net.sf.freecol.client.gui.panel.mapeditor.ChooseAreaModificationPanel');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Direction = $J.load('net.sf.freecol.common.model.Direction');
  LostCityRumour = $J.load('net.sf.freecol.common.model.LostCityRumour');
  ModelMessage$MessageType = $J.load('net.sf.freecol.common.model.ModelMessage$MessageType');
  Resource = $J.load('net.sf.freecol.common.model.Resource');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  TileImprovement = $J.load('net.sf.freecol.common.model.TileImprovement');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  ServerIndianSettlement = $J.load('net.sf.freecol.server.model.ServerIndianSettlement');
});
