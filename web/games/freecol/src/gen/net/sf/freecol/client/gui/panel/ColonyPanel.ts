// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/ColonyPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Collections, Collectors, Comparator, Exception, HashMap, IllegalStateException, JObject, JString, Level, Logger, Random, RuntimeException, StringBuilder } from '../../../../../../../jre/index.ts';
import { PortPanel } from './PortPanel.ts';
import { CargoPanel } from './CargoPanel.ts';
import { MigPanel } from './MigPanel.ts';
import { UnitPanel } from './UnitPanel.ts';
import { InPortPanel } from './InPortPanel.ts';
import { BuildingPanel } from './BuildingPanel.ts';
import { JPanel } from '../../../../../../javax/swing/JPanel.ts';

let BasicStroke, BorderLayout, Color, Dimension, FlowLayout, GridLayout, RenderingHints, ComponentAdapter, KeyEvent, MouseAdapter, AbstractAction, BorderFactory, ComponentInputMap, ImageIcon, JComboBox, JComponent, JLabel, JMenuItem, JPopupMenu, JPopupMenu$Separator, JScrollPane, KeyStroke, ScrollPaneConstants, SwingUtilities, MigLayout, ClientOptions, FontLibrary, ImageLibrary, GoodsLabel, ProductionLabel, UnitLabel, BuildingsLayoutManager, ConstructionPanel, DefaultTransferHandler, DragListener, DropListener, FreeColButton, FreeColButton$ButtonStyle, FreeColImageBorder, FreeColPanel, QuickActionMenu, Utility, WrapLayout, WrapLayout$HorizontalGap, WrapLayout$LayoutStyle, RebelToolTip, DebugUtils, FreeColDebugger, FreeColDebugger$DebugMode, Messages, Ability, AbstractGoods, Colony, Colony$ColonyChangeEvent, Direction, Goods, Player$NoClaimReason, StringTemplate, Tile, Unit, Unit$UnitLabelType, UnitLocation$NoAddReason, CollectionUtils, ImageUtils;

/**
 * This is a panel for the Colony display.  It shows the units that
 * are working in the colony, the buildings and much more.
 * <p>
 * Beware that in debug mode, this might be a server-side version of
 * the colony which is why we need to call getColony().getSpecification()
 * to get the spec that corresponds to the good types in this colony.
 * <p>
 */
export class ColonyPanel extends PortPanel {
  static logger: Logger = null;
  /**
   * The height of the area in whichcomponentRe autoscrolling should happen.
   */
  static readonly SCROLL_AREA_HEIGHT: number = 40;
  /**
   * The speed of the scrolling.
   */
  static readonly SCROLL_SPEED: number = 40;
  cachedDefensiveBuildingImage: JMap<BuildingType, BufferedImage> = null;
  unloadButton: JButton = null;
  fillButton: JButton = null;
  warehouseButton: JButton = null;
  buildQueueButton: JButton = null;
  colonyUnitsButton: JButton = null;
  setGoodsButton: JButton = null;
  traceWorkButton: JButton = null;
  /**
   * The {@code Colony} this panel is displaying.
   */
  colony: Colony = null;
  releaseListener: MouseListener = null;
  nameBox: JComboBox<Colony> = null;
  netProductionPanel: JPanel = null;
  buildingsScroll: JScrollPane = null;
  buildingsPanel: ColonyPanel$BuildingsPanel = null;
  cargoScroll: JScrollPane = null;
  constructionPanel: ConstructionPanel = null;
  inPortScroll: JScrollPane = null;
  outsideColonyScroll: JScrollPane = null;
  outsideColonyPanel: ColonyPanel$OutsideColonyPanel = null;
  populationPanel: ColonyPanel$PopulationPanel = null;
  tilesPanel: ColonyPanel$TilesPanel = null;
  warehouseScroll: JScrollPane = null;
  warehousePanel: ColonyPanel$WarehousePanel = null;
  upperRightPanel: JPanel = null;
  colonyTitleImage: BufferedImage = null;
  fullscreen: boolean = false;
  unloadCmd: ActionListener = null;
  warehouseCmd: ActionListener = null;
  buildQueueCmd: ActionListener = null;
  fillCmd: ActionListener = null;
  colonyUnitsCmd: ActionListener = null;
  setGoodsCmd: ActionListener = null;
  occupationCmd: ActionListener = null;
  frameMoveDispatchListener: MouseAdapter = null;
  /**
   * The constructor for the panel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param colony The {@code Colony} to display in this panel.
   */
  _ColonyPanel(freeColClient: FreeColClient, colony: Colony): this {
    this._PortPanel(freeColClient, new MigLayout()._MigLayout$());
    this.cachedDefensiveBuildingImage = new HashMap();
    this.unloadButton = Utility.localizedButton$String('unload');
    this.fillButton = Utility.localizedButton$String('load');
    this.warehouseButton = new FreeColButton()._FreeColButton$String(Messages.message$String('colonyPanel.warehouse')).withButtonStyle(FreeColButton$ButtonStyle.SIMPLE);
    this.buildQueueButton = new FreeColButton()._FreeColButton$String(Messages.message$String('colonyPanel.buildQueue')).withButtonStyle(FreeColButton$ButtonStyle.SIMPLE);
    this.colonyUnitsButton = new FreeColButton()._FreeColButton$String(Messages.message$String('colonyPanel.colonyUnits')).withButtonStyle(FreeColButton$ButtonStyle.SIMPLE);
    this.setGoodsButton = null;
    this.traceWorkButton = null;
    this.releaseListener = null;
    this.nameBox = new JComboBox()._JComboBox$();
    this.netProductionPanel = null;
    this.buildingsScroll = null;
    this.buildingsPanel = null;
    this.cargoScroll = null;
    this.constructionPanel = null;
    this.inPortScroll = null;
    this.outsideColonyScroll = null;
    this.outsideColonyPanel = null;
    this.populationPanel = null;
    this.tilesPanel = null;
    this.warehouseScroll = null;
    this.warehousePanel = null;
    this.upperRightPanel = null;
    this.colonyTitleImage = null;
    this.fullscreen = false;
    this.unloadCmd = (ae) => {
      let unit = this.getSelectedUnit();
      if (unit == null || !unit.isCarrier()) {
        return;
      }
      for (const $it0 = unit.getGoodsList().iterator(); $it0.hasNext(); ) {
        let goods = $it0.next();
        this.igc().unloadCargo(goods, false);
      }
      for (const $it1 = unit.getUnitList().iterator(); $it1.hasNext(); ) {
        let u = $it1.next();
        this.igc().leaveShip(u);
      }
      this.cargoPanel.update$();
      this.updateOutsideColonyPanel();
      this.unloadButton.setEnabled(false);
      this.fillButton.setEnabled(false);
    };
    this.warehouseCmd = (ae) => {
      this.getGUI().showWarehouseDialog(this.getColony(), (updated) => {
        if (updated) {
          this.updateWarehousePanel();
        }
      });
    };
    this.buildQueueCmd = (ae) => {
      this.getGUI().showBuildQueuePanel(this.getColony());
      this.updateConstructionPanel();
    };
    this.fillCmd = (ae) => {
      let unit = this.getSelectedUnit();
      if (unit == null || !unit.isCarrier()) {
        return;
      }
      let colony = this.getColony();
      for (const $it2 = unit.getCompactGoodsList().iterator(); $it2.hasNext(); ) {
        let goods = $it2.next();
        let type$ = goods.getType();
        let space = unit.getLoadableAmount(type$);
        let count = colony.getGoodsCount(type$);
        if (space > 0 && count > 0) {
          let n = Math.min(space, count);
          this.igc().loadCargo(new Goods()._Goods$Game$Location$GoodsType$int(goods.getGame(), colony, type$, n), unit);
        }
      }
    };
    this.colonyUnitsCmd = (ae) => this.generateColonyUnitsMenu();
    this.setGoodsCmd = (ae) => {
      DebugUtils.setColonyGoods(this.getFreeColClient(), this.colony);
      this.updateWarehousePanel();
      this.updateProduction();
    };
    this.occupationCmd = (ae) => this.colony.setOccupationTrace(!this.colony.getOccupationTrace());
    this.frameMoveDispatchListener = new (ColonyPanel$6())().$o(this)._MouseAdapter();
    this.getMigLayout().setLayoutConstraints('fill, wrap 2, insets 0, gap 0 0');
    this.getMigLayout().setColumnConstraints('[fill][474!]');
    this.getMigLayout().setRowConstraints('[]0[]0[][growprio 150,shrinkprio 50][][]');
    let player = this.getMyPlayer();
    this.editable = $J.equals(colony.getOwner().getId(), player.getId());
    if (this.editable && FreeColDebugger.isInDebugMode$DebugMode(FreeColDebugger$DebugMode.MENUS)) {
      this.setGoodsButton = Utility.localizedButton$String('colonyPanel.setGoods');
      this.traceWorkButton = Utility.localizedButton$String('colonyPanel.traceWork');
    }
    let closeIM = new ComponentInputMap()._ComponentInputMap(this.okButton);
    closeIM.put(KeyStroke.getKeyStroke$int$int$boolean(KeyEvent.VK_ESCAPE, 0, false), 'pressed');
    closeIM.put(KeyStroke.getKeyStroke$int$int$boolean(KeyEvent.VK_ESCAPE, 0, true), 'released');
    SwingUtilities.replaceUIInputMap(this.okButton, JComponent.WHEN_IN_FOCUSED_WINDOW, closeIM);
    this.okButton.setText(Messages.message$String('close'));
    let unloadIM = new ComponentInputMap()._ComponentInputMap(this.unloadButton);
    unloadIM.put(KeyStroke.getKeyStroke$int$int$boolean(KeyEvent.VK_U, 0, false), 'pressed');
    unloadIM.put(KeyStroke.getKeyStroke$int$int$boolean(KeyEvent.VK_U, 0, true), 'released');
    SwingUtilities.replaceUIInputMap(this.unloadButton, JComponent.WHEN_IN_FOCUSED_WINDOW, unloadIM);
    let fillIM = new ComponentInputMap()._ComponentInputMap(this.fillButton);
    fillIM.put(KeyStroke.getKeyStroke$int$int$boolean(KeyEvent.VK_L, 0, false), 'pressed');
    fillIM.put(KeyStroke.getKeyStroke$int$int$boolean(KeyEvent.VK_L, 0, true), 'released');
    SwingUtilities.replaceUIInputMap(this.fillButton, JComponent.WHEN_IN_FOCUSED_WINDOW, fillIM);
    let warehouseIM = new ComponentInputMap()._ComponentInputMap(this.warehouseButton);
    warehouseIM.put(KeyStroke.getKeyStroke$int$int$boolean(KeyEvent.VK_W, 0, false), 'pressed');
    warehouseIM.put(KeyStroke.getKeyStroke$int$int$boolean(KeyEvent.VK_W, 0, true), 'released');
    SwingUtilities.replaceUIInputMap(this.warehouseButton, JComponent.WHEN_IN_FOCUSED_WINDOW, warehouseIM);
    let buildQueueIM = new ComponentInputMap()._ComponentInputMap(this.buildQueueButton);
    buildQueueIM.put(KeyStroke.getKeyStroke$int$int$boolean(KeyEvent.VK_B, 0, false), 'pressed');
    buildQueueIM.put(KeyStroke.getKeyStroke$int$int$boolean(KeyEvent.VK_B, 0, true), 'released');
    SwingUtilities.replaceUIInputMap(this.buildQueueButton, JComponent.WHEN_IN_FOCUSED_WINDOW, buildQueueIM);
    let colonyUnitsIM = new ComponentInputMap()._ComponentInputMap(this.colonyUnitsButton);
    colonyUnitsIM.put(KeyStroke.getKeyStroke$int$int$boolean(KeyEvent.VK_C, 0, false), 'pressed');
    colonyUnitsIM.put(KeyStroke.getKeyStroke$int$int$boolean(KeyEvent.VK_C, 0, true), 'released');
    SwingUtilities.replaceUIInputMap(this.colonyUnitsButton, JComponent.WHEN_IN_FOCUSED_WINDOW, colonyUnitsIM);
    this.defaultTransferHandler = new DefaultTransferHandler()._DefaultTransferHandler(freeColClient, this);
    this.pressListener = new DragListener()._DragListener(freeColClient, this);
    this.releaseListener = new DropListener()._DropListener();
    this.selectedUnitLabel = null;
    let sb = new StringBuilder(32);
    let compat = colony.getName();
    if (this.editable) {
      for (const $it3 = player.getColonyList().iterator(); $it3.hasNext(); ) {
        let c = $it3.next();
        this.nameBox.addItem(c);
        sb.append(c.getName());
      }
    } else {
      this.nameBox.addItem(colony);
      sb.append(colony.getName());
    }
    let nameBoxFont = FontLibrary.getScaledFont$String$String('header-plain-big', compat);
    this.nameBox.setFont(nameBoxFont);
    this.nameBox.setBorder(BorderFactory.createEmptyBorder$());
    this.nameBox.setSelectedItem(colony);
    this.nameBox.getInputMap$().put(KeyStroke.getKeyStroke$String('LEFT'), 'selectPrevious2');
    this.nameBox.getInputMap$().put(KeyStroke.getKeyStroke$String('RIGHT'), 'selectNext2');
    this.netProductionPanel = new JPanel()._JPanel$LayoutManager(new WrapLayout()._WrapLayout().withLayoutStyle(WrapLayout$LayoutStyle.PREFER_BOTTOM).withHorizontalGap$HorizontalGap$int$int(WrapLayout$HorizontalGap.AUTO_BOTTOM, 0, this.getImageLibrary().scaleInt(5)));
    this.netProductionPanel.setOpaque(false);
    this.buildingsPanel = new ColonyPanel$BuildingsPanel().$o(this)._ColonyPanel$BuildingsPanel();
    this.buildingsPanel.setOpaque(false);
    this.buildingsScroll = new (ColonyPanel$1())().$o(this)._JScrollPane$Component$int$int(this.buildingsPanel, ScrollPaneConstants.VERTICAL_SCROLLBAR_NEVER, ScrollPaneConstants.HORIZONTAL_SCROLLBAR_NEVER);
    this.buildingsScroll.addComponentListener(new (ColonyPanel$2())().$o(this)._ComponentAdapter());
    this.buildingsScroll.getVerticalScrollBar().setUnitIncrement(16);
    this.buildingsScroll.getViewport().setOpaque(false);
    this.buildingsScroll.setBorder(null);
    this.buildingsScroll.getViewport().addMouseListener(this.frameMoveDispatchListener);
    this.buildingsScroll.getViewport().addMouseMotionListener(this.frameMoveDispatchListener);
    this.cargoPanel = new ColonyPanel$ColonyCargoPanel().$o(this)._ColonyPanel$ColonyCargoPanel(freeColClient);
    this.cargoScroll = new JScrollPane()._JScrollPane$Component$int$int(this.cargoPanel, ScrollPaneConstants.VERTICAL_SCROLLBAR_AS_NEEDED, ScrollPaneConstants.HORIZONTAL_SCROLLBAR_NEVER);
    this.cargoScroll.setBorder(null);
    this.cargoPanel.addMouseListener(this.frameMoveDispatchListener);
    this.cargoPanel.addMouseMotionListener(this.frameMoveDispatchListener);
    this.constructionPanel = new ConstructionPanel()._ConstructionPanel(freeColClient, colony, true);
    this.constructionPanel.setForeground(Color.WHITE);
    this.inPortPanel = new ColonyPanel$ColonyInPortPanel().$o(this)._ColonyPanel$ColonyInPortPanel();
    this.inPortScroll = new JScrollPane()._JScrollPane$Component$int$int(this.inPortPanel, ScrollPaneConstants.VERTICAL_SCROLLBAR_NEVER, ScrollPaneConstants.HORIZONTAL_SCROLLBAR_AS_NEEDED);
    this.inPortScroll.getVerticalScrollBar().setUnitIncrement(16);
    this.inPortScroll.setBorder(null);
    this.inPortScroll.setOpaque(false);
    this.inPortScroll.getViewport().setOpaque(false);
    this.inPortPanel.addMouseListener(this.frameMoveDispatchListener);
    this.inPortPanel.addMouseMotionListener(this.frameMoveDispatchListener);
    this.outsideColonyPanel = new ColonyPanel$OutsideColonyPanel().$o(this)._ColonyPanel$OutsideColonyPanel();
    this.outsideColonyScroll = new JScrollPane()._JScrollPane$Component$int$int(this.outsideColonyPanel, ScrollPaneConstants.VERTICAL_SCROLLBAR_NEVER, ScrollPaneConstants.HORIZONTAL_SCROLLBAR_AS_NEEDED);
    this.outsideColonyScroll.getVerticalScrollBar().setUnitIncrement(16);
    this.outsideColonyScroll.setBorder(null);
    this.outsideColonyScroll.setOpaque(false);
    this.outsideColonyScroll.getViewport().setOpaque(false);
    this.outsideColonyPanel.addMouseListener(this.frameMoveDispatchListener);
    this.outsideColonyPanel.addMouseMotionListener(this.frameMoveDispatchListener);
    this.populationPanel = new ColonyPanel$PopulationPanel().$o(this)._ColonyPanel$PopulationPanel();
    this.tilesPanel = new ColonyPanel$TilesPanel().$o(this)._ColonyPanel$TilesPanel();
    this.warehousePanel = new ColonyPanel$WarehousePanel().$o(this)._ColonyPanel$WarehousePanel();
    this.warehouseScroll = new JScrollPane()._JScrollPane$Component$int$int(this.warehousePanel, ScrollPaneConstants.VERTICAL_SCROLLBAR_NEVER, ScrollPaneConstants.HORIZONTAL_SCROLLBAR_AS_NEEDED);
    this.warehouseScroll.setBorder(FreeColImageBorder.colonyWarehouseBorder);
    this.warehousePanel.addMouseListener(this.frameMoveDispatchListener);
    this.warehousePanel.addMouseMotionListener(this.frameMoveDispatchListener);
    let nameIM = new ComponentInputMap()._ComponentInputMap(this.nameBox);
    nameIM.put(KeyStroke.getKeyStroke$String('LEFT'), 'selectPrevious2');
    nameIM.put(KeyStroke.getKeyStroke$String('RIGHT'), 'selectNext2');
    SwingUtilities.replaceUIInputMap(this.nameBox, JComponent.WHEN_IN_FOCUSED_WINDOW, nameIM);
    if (this.getGUI().getMapViewDimension().height_ < this.getImageLibrary().scaleInt(850)) {
      this.fullscreen = true;
      this.setBorder(BorderFactory.createEmptyBorder$());
    } else {
      this.setBorder(FreeColImageBorder.innerColonyPanelBorder);
    }
    this.setColony(colony);
    this.initialize();
    if (!this.fullscreen) {
      let startingSize = this.getFreeColClient().getGUI().getFixedImageLibrary().scale$Dimension(new Dimension()._Dimension$int$int(1280, 700));
      this.getGUI().restoreSavedSize(this, startingSize);
    }
    this.setEscapeAction(new (ColonyPanel$3())().$o(this)._AbstractAction$());
    return this;
  }
  /**
   * {@inheritDoc}
   */
  refreshLayout(): void {
    let theColony = this.colony;
    this.closeColonyPanel();
    this.getGUI().showColonyPanel(theColony, null);
  }
  /**
   * Paints parts of the background/skins for the ColonyPanel. In the future
   * we will probably want to generalize this approach in order to allow
   * mods to define complex skins.
   */
  paintComponent(g: Graphics): void {
    super.paintComponent(g);
    let g2d = g;
    g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
    g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
    let size = this.getSize$();
    let colonyDocksBackground = this.getImageLibrary().getColonyDocksBackground();
    if (colonyDocksBackground != null) {
      let docksBottomLeftX = this.inPortScroll.getX();
      let docksBottomLeftY = (this.inPortScroll.getY() + this.inPortScroll.getHeight()) | 0;
      let y = (docksBottomLeftY - colonyDocksBackground.getHeight()) | 0;
      g.drawImage$Image$int$int$ImageObserver(colonyDocksBackground, docksBottomLeftX, y, null);
      let colonyDocksSkyBackground = this.getImageLibrary().getColonyDocksSkyBackground();
      if (colonyDocksSkyBackground != null) {
        while (y > 0) {
          y = (y - colonyDocksSkyBackground.getHeight()) | 0;
          g.drawImage$Image$int$int$ImageObserver(colonyDocksSkyBackground, docksBottomLeftX, y, null);
        }
      }
    }
    let docksBuilding = this.colony.getBuildings().stream().filter((b) => b.hasAbility$String(Ability.PRODUCE_IN_WATER)).sorted(Comparator.comparing(($p0) => $p0.getId())).findFirst().orElse(null);
    let docks = this.getImageLibrary().getScaledBuildingImage(docksBuilding);
    if (docks != null) {
      let docksBottomLeftX = this.inPortScroll.getX();
      let docksBottomLeftY = (this.inPortScroll.getY() + this.inPortScroll.getHeight()) | 0;
      let y = (docksBottomLeftY - docks.getHeight()) | 0;
      g.drawImage$Image$int$int$ImageObserver(docks, docksBottomLeftX, y, null);
    }
    let defensiveBuildings = this.colony.getBuildings().stream().filter((b) => b.getType().isDefenceType()).sorted(Comparator.comparing(($p0) => $p0.getId())).collect(Collectors.toList());
    if (defensiveBuildings.isEmpty()) {
      this.paintOutsideColonyBackground(g2d, null);
    }
    for (const $it4 = defensiveBuildings.iterator(); $it4.hasNext(); ) {
      let defensiveBuilding = $it4.next();
      this.paintOutsideColonyBackground(g2d, defensiveBuilding.getType());
    }
    let unavailable = this.getImageLibrary().getScaledCargoHold(false);
    if (unavailable != null) {
      let cargoHoldTopRightX = (this.cargoScroll.getX() + this.cargoScroll.getWidth()) | 0;
      let cargoHoldTopRightY = this.cargoScroll.getY();
      g.drawImage$Image$int$int$ImageObserver(unavailable, cargoHoldTopRightX, cargoHoldTopRightY, null);
    }
    let upperRightBackground = this.getImageLibrary().getColonyUpperRightBackground();
    if (upperRightBackground != null) {
      let insets = this.getInsets$();
      let x = (size.width_ - upperRightBackground.getWidth() - insets.right) | 0;
      let y = insets.top;
      g.drawImage$Image$int$int$ImageObserver(upperRightBackground, x, y, null);
      let numberFont = FontLibrary.getUnscaledFont$String$String(Utility.FONTSPEC_TITLE, '1').deriveFont$float(Math.fround(this.getImageLibrary().scaleInt(32)));
      let origFont = g.getFont();
      g.setFont(numberFont);
      let fm = g2d.getFontMetrics$();
      let colonySize = '' + this.colony.getUnitCount();
      let centerY = $J.idiv(((fm.getAscent() - fm.getDescent() - fm.getLeading()) | 0), 2);
      let colonySizeX = this.getImageLibrary().scaleInt(100);
      let colonySizeY = this.getImageLibrary().scaleInt(40);
      let colonySizeCenterX = -fm.getStringBounds$String$Graphics(colonySize, g2d).getWidth() / 2;
      g.drawString$String$int$int(colonySize, $J.d2i((x + colonySizeCenterX + colonySizeX)), $J.d2i((y + centerY + colonySizeY)));
      let bonus: string;
      let grow = this.colony.getPreferredSizeChange();
      if (grow > 9) {
        bonus = '>9';
      } else if (grow >= 0) {
        bonus = '+' + grow;
      } else {
        bonus = '' + grow;
      }
      let colonyBonusX = this.getImageLibrary().scaleInt(404);
      let colonyBonusCenterX = -fm.getStringBounds$String$Graphics(bonus, g2d).getWidth() / 2;
      g.drawString$String$int$int(bonus, $J.d2i((x + colonyBonusCenterX + colonyBonusX)), $J.d2i((y + centerY + colonySizeY)));
      numberFont = numberFont.deriveFont$float(Math.fround(this.getImageLibrary().scaleInt(18)));
      g.setFont(numberFont);
      fm = g2d.getFontMetrics$();
      centerY = $J.idiv(((fm.getAscent() - fm.getDescent() - fm.getLeading()) | 0), 2);
      let rebelPercentage = this.colony.getSonsOfLiberty() + '%';
      let rebelPercentageX = this.getImageLibrary().scaleInt(101);
      let rebelPercentageY = this.getImageLibrary().scaleInt(193);
      let rebelPercentageCenterX = -fm.getStringBounds$String$Graphics(rebelPercentage, g2d).getWidth() / 2;
      g.drawString$String$int$int(rebelPercentage, $J.d2i((x + rebelPercentageCenterX + rebelPercentageX)), $J.d2i((y + centerY + rebelPercentageY)));
      let royalistPercentage = ((100 - this.colony.getSonsOfLiberty()) | 0) + '%';
      let royalistPercentageX = this.getImageLibrary().scaleInt(407);
      let royalistPercentageCenterX = -fm.getStringBounds$String$Graphics(royalistPercentage, g2d).getWidth() / 2;
      g.drawString$String$int$int(royalistPercentage, $J.d2i((x + royalistPercentageCenterX + royalistPercentageX)), $J.d2i((y + centerY + rebelPercentageY)));
      g.setFont(origFont);
    }
    let nwBorder = this.getImageLibrary().getScaledImage('image.border.wooden.nw');
    let wBorder = this.getImageLibrary().getScaledImage('image.border.wooden.w');
    if (nwBorder != null && wBorder != null) {
      let x = (this.okButton.getX() + this.okButton.getWidth()) | 0;
      let y = this.okButton.getY();
      g.drawImage$Image$int$int$ImageObserver(nwBorder, x, y, null);
      y = (y + nwBorder.getHeight()) | 0;
      while (y < size.height_) {
        g.drawImage$Image$int$int$ImageObserver(wBorder, x, y, null);
        y = (y + wBorder.getHeight()) | 0;
      }
    }
    let sBorder = this.getImageLibrary().getScaledImage('image.border.wooden.s');
    if (sBorder != null) {
      let x = 0;
      let y = (this.warehouseScroll.getY() + this.warehouseScroll.getHeight()) | 0;
      while (x < size.width_) {
        g.drawImage$Image$int$int$ImageObserver(sBorder, x, y, null);
        x = (x + sBorder.getWidth()) | 0;
      }
    }
    if (nwBorder != null && wBorder != null) {
      let x = (this.warehouseScroll.getX() - nwBorder.getWidth()) | 0;
      let y = this.warehouseScroll.getY();
      g.drawImage$Image$int$int$ImageObserver(nwBorder, x, y, null);
      y = (y + nwBorder.getHeight()) | 0;
      while (y < size.height_) {
        g.drawImage$Image$int$int$ImageObserver(wBorder, x, y, null);
        y = (y + wBorder.getHeight()) | 0;
      }
    }
    if (this.fullscreen) {
      if (this.colonyTitleImage == null) {
        this.colonyTitleImage = this.getImageLibrary().createColonyTitleImage((g), this.colony.getName(), this.getColony().getOwner(), false);
      }
      let x = (this.upperRightPanel.getX() + $J.idiv(((this.upperRightPanel.getWidth() - this.colonyTitleImage.getWidth()) | 0), 2)) | 0;
      let y = (this.inPortScroll.getY() - this.colonyTitleImage.getHeight()) | 0;
      g.drawImage$Image$int$int$ImageObserver(this.colonyTitleImage, x, y, null);
    }
  }
  paintOutsideColonyBackground(g2d: Graphics2D, buildingType: BuildingType): void {
    let outsideColonySize = this.outsideColonyScroll.getSize$();
    let outsideColonyImage = this.cachedDefensiveBuildingImage.get(buildingType);
    if (outsideColonyImage == null || outsideColonyImage.getWidth() !== outsideColonySize.width_ || outsideColonyImage.getHeight() !== outsideColonySize.height_) {
      outsideColonyImage = ImageLibrary.getUncachedOutsideColonyBackground(buildingType, this.getColony().getOwner().getNationResourceKey(), outsideColonySize);
      this.cachedDefensiveBuildingImage.put(buildingType, outsideColonyImage);
    }
    if (outsideColonyImage == null) {
      return;
    }
    let x = this.outsideColonyScroll.getX();
    let y = this.outsideColonyScroll.getY();
    g2d.drawImage$Image$int$int$ImageObserver(outsideColonyImage, x, y, null);
  }
  /**
   * {@inheritDoc}
   */
  getFrameBorder(): Border {
    if (this.fullscreen) {
      return BorderFactory.createEmptyBorder$();
    }
    let normalBorder = FreeColImageBorder.outerColonyPanelBorder;
    let titleBorder = new (ColonyPanel$4())().$o(this).$c(normalBorder);
    return titleBorder;
  }
  isFullscreen(): boolean {
    return this.fullscreen;
  }
  /**
   * Set the current colony.
   *
   * @param colony The new colony value.
   */
  setColony(colony: Colony): void {
    this.colony = colony;
  }
  getTilesPanelGuiScaledDimension(): Dimension {
    let tilesPanelWidth = Math.imul(3, this.getImageLibrary().getTileSize().width_);
    let tilesPanelHeight = Math.imul(3, this.getImageLibrary().getTileSize().height_);
    let size = this.getImageLibrary().getTileSize();
    let extraHeight = this.tilesPanelTopOffset(size);
    return new Dimension()._Dimension$int$int(tilesPanelWidth, (tilesPanelHeight + extraHeight) | 0);
  }
  /**
   * Initialize the entire panel.
   */
  initialize(): void {
    this.cleanup();
    this.addPropertyChangeListeners();
    this.addMouseListeners();
    this.setTransferHandlers(this.isEditable());
    this.unloadButton.addActionListener(this.unloadCmd);
    this.fillButton.addActionListener(this.fillCmd);
    this.warehouseButton.addActionListener(this.warehouseCmd);
    this.buildQueueButton.addActionListener(this.buildQueueCmd);
    this.colonyUnitsButton.addActionListener(this.colonyUnitsCmd);
    if (this.setGoodsButton != null) {
      this.setGoodsButton.addActionListener(this.setGoodsCmd);
    }
    if (this.traceWorkButton != null) {
      this.traceWorkButton.addActionListener(this.occupationCmd);
    }
    this.unloadButton.setEnabled(this.isEditable());
    this.fillButton.setEnabled(this.isEditable());
    this.warehouseButton.setEnabled(this.isEditable());
    this.buildQueueButton.setEnabled(this.isEditable());
    this.colonyUnitsButton.setEnabled(this.isEditable());
    if (this.setGoodsButton != null) {
      this.setGoodsButton.setEnabled(this.isEditable());
    }
    if (this.traceWorkButton != null) {
      this.traceWorkButton.setEnabled(this.isEditable());
    }
    let gui = this.getGUI();
    this.nameBox.setEnabled(this.isEditable());
    this.nameBox.addActionListener((ae) => {
      let newColony = this.nameBox.getSelectedItem();
      this.closeColonyPanel();
      gui.showColonyPanel(newColony, null);
    });
    this.updateNetProductionPanel();
    this.buildingsPanel.initialize();
    this.cargoPanel.initialize();
    this.constructionPanel.initialize();
    this.inPortPanel.initialize();
    this.outsideColonyPanel.initialize();
    this.populationPanel.initialize();
    this.tilesPanel.initialize();
    this.warehousePanel.initialize();
    let tilesScrollDimension = this.getTilesPanelGuiScaledDimension();
    this.add$Component$Object(this.buildingsScroll, 'span 1 4, grow');
    this.upperRightPanel = new (ColonyPanel$5())().$o(this)._JPanel$LayoutManager(new MigLayout()._MigLayout$String$String('wrap 1, ins 7 7 7 7, gap 0 0', '[center]')).$init_anon();
    this.upperRightPanel.setOpaque(false);
    this.upperRightPanel.add$Component$Object(this.tilesPanel, 'width ' + tilesScrollDimension.width_ + 'px!, height ' + tilesScrollDimension.height_ + 'px!, top, center');
    let border = FreeColImageBorder.innerColonyPanelBorder;
    let borderInsets = border.getBorderInsets$Component(this);
    this.upperRightPanel.add$Component$Object(this.netProductionPanel, 'grow, wmax 384, height 68!');
    this.upperRightPanel.add$Component$Object(this.constructionPanel, 'grow, top, wmax 367, height 90');
    this.add$Component$Object(this.upperRightPanel, 'span 1 3, growy, gapbefore 53, width 400!, wmax 400');
    this.add$Component$Object(this.inPortScroll, 'span, grow, height 96!, gaptop push');
    this.add$Component$Object(this.outsideColonyScroll, 'grow, height 96!');
    this.add$Component$Object(this.cargoScroll, 'grow, height 100!');
    this.add$Component$Object(this.warehouseScroll, 'span, split, height 48!, growx');
    this.add$Component$Object(this.wrapWithBorder(this.warehouseButton), 'height 48!, gap 0 0 0 0');
    if (this.setGoodsButton != null) {
      this.add$Component$Object(this.wrapWithBorder(this.setGoodsButton), 'height 48!, gap 0 0 0 0');
    }
    if (this.traceWorkButton != null) {
      this.add$Component$Object(this.wrapWithBorder(this.traceWorkButton), 'height 48!, gap 0 0 0 0');
    }
    this.add$Component$Object(this.unloadButton, 'wmax 0, height 0, gap 0 0 0 0');
    this.add$Component$Object(this.fillButton, 'wmax 0, height 0, gap 0 0 0 0');
    this.add$Component$Object(this.okButton, 'gapbefore push, height 48!');
    this.update$();
  }
  wrapWithBorder(c: JComponent): JPanel {
    let panel = new JPanel()._JPanel$LayoutManager(new BorderLayout()._BorderLayout$());
    panel.setBorder(FreeColImageBorder.woodenPanelBorder);
    panel.add$Component(c);
    return panel;
  }
  /**
   * Clean up this colony panel.
   */
  cleanup(): void {
    this.unloadButton.removeActionListener(this.unloadCmd);
    this.fillButton.removeActionListener(this.fillCmd);
    this.warehouseButton.removeActionListener(this.warehouseCmd);
    this.buildQueueButton.removeActionListener(this.buildQueueCmd);
    this.colonyUnitsButton.removeActionListener(this.colonyUnitsCmd);
    if (this.setGoodsButton != null) {
      this.setGoodsButton.removeActionListener(this.setGoodsCmd);
    }
    if (this.traceWorkButton != null) {
      this.traceWorkButton.removeActionListener(this.occupationCmd);
    }
    this.removePropertyChangeListeners();
    if (this.getSelectedUnit() != null) {
      this.getSelectedUnit().removePropertyChangeListener$PropertyChangeListener($J.fn(this, 'propertyChange'));
    }
    this.removeMouseListeners();
    for (let listener of this.getMouseListeners()) {
      this.removeMouseListener(listener);
    }
    this.setTransferHandlers(false);
    this.buildingsPanel.cleanup();
    this.cargoPanel.cleanup();
    this.constructionPanel.cleanup();
    this.inPortPanel.cleanup();
    this.outsideColonyPanel.cleanup();
    this.populationPanel.cleanup();
    this.tilesPanel.cleanup();
    this.warehousePanel.cleanup();
    this.removeAll();
  }
  addMouseListeners(): void {
    if (this.isEditable()) {
      this.cargoPanel.addMouseListener(this.releaseListener);
      this.inPortPanel.addMouseListener(this.releaseListener);
      this.outsideColonyPanel.addMouseListener(this.releaseListener);
      this.warehousePanel.addMouseListener(this.releaseListener);
    }
  }
  removeMouseListeners(): void {
    this.cargoPanel.removeMouseListener(this.releaseListener);
    this.inPortPanel.removeMouseListener(this.releaseListener);
    this.outsideColonyPanel.removeMouseListener(this.releaseListener);
    this.warehousePanel.removeMouseListener(this.releaseListener);
  }
  setTransferHandlers(enable: boolean): void {
    let dth = (enable) ? this.defaultTransferHandler : null;
    this.cargoPanel.setTransferHandler(dth);
    this.inPortPanel.setTransferHandler(dth);
    this.outsideColonyPanel.setTransferHandler(dth);
    this.warehousePanel.setTransferHandler(dth);
  }
  /**
   * Add property change listeners needed by this ColonyPanel.
   */
  addPropertyChangeListeners(): void {
    let colony = this.getColony();
    if (colony != null) {
      colony.addPropertyChangeListener$PropertyChangeListener($J.fn(this, 'propertyChange'));
      colony.getGoodsContainer().addPropertyChangeListener$PropertyChangeListener($J.fn(this, 'propertyChange'));
      colony.getTile$().addPropertyChangeListener$PropertyChangeListener($J.fn(this, 'propertyChange'));
    }
  }
  /**
   * Remove the property change listeners of ColonyPanel.
   */
  removePropertyChangeListeners(): void {
    let colony = this.getColony();
    if (colony != null) {
      colony.removePropertyChangeListener$PropertyChangeListener($J.fn(this, 'propertyChange'));
      colony.getGoodsContainer().removePropertyChangeListener$PropertyChangeListener($J.fn(this, 'propertyChange'));
      colony.getTile$().removePropertyChangeListener$PropertyChangeListener($J.fn(this, 'propertyChange'));
    }
  }
  /**
   * Update all the production-related panels.
   *
   * This has to be very broad as a change at one work location can
   * have a secondary effect on another, and especially if the
   * population hits a bonus boundary.  A simple example is that
   * adding extra lumber production may improve the production of the
   * lumber mill.  These changes can then flow on to production and
   * construction displays.
   */
  updateProduction(): void {
    let colony = this.getColony();
    if (colony == null) {
      return;
    }
    for (const $it5 = colony.getCurrentWorkLocationsList().iterator(); $it5.hasNext(); ) {
      let wl = $it5.next();
      let change = false;
      let check = wl.getProductionType() == null;
      for (const $it6 = (CollectionUtils.transform$Stream$Predicate(wl.getUnits(), (u) => (check || !wl.produces(u.getWorkType())))).iterator(); $it6.hasNext(); ) {
        let unit = $it6.next();
        let workType = wl.getWorkFor(unit);
        if (workType != null && workType !== unit.getWorkType()) {
          change = !!(change | this.igc().changeWorkType(unit, workType));
        }
      }
      if (change) {
        wl.updateProductionType();
      }
    }
    this.updateTilesPanel();
    this.updateBuildingsPanel();
    this.updateNetProductionPanel();
    this.updateConstructionPanel();
  }
  /**
   * Update the entire colony panel.
   */
  update$(): void {
    this.buildingsPanel.update$();
    this.constructionPanel.update$();
    this.inPortPanel.update$();
    this.updateNetProductionPanel();
    this.outsideColonyPanel.update$();
    this.populationPanel.update$();
    this.tilesPanel.update$();
    this.warehousePanel.update$();
  }
  /**
   * Enables the unload and fill buttons if the currently selected unit is a
   * carrier with some cargo.
   */
  updateCarrierButtons(): void {
    let colony = this.getColony();
    this.unloadButton.setEnabled(false);
    this.fillButton.setEnabled(false);
    if (this.selectedUnitLabel != null && this.isEditable()) {
      let unit = this.selectedUnitLabel.getUnit();
      if (unit != null && unit.isCarrier() && unit.hasCargo()) {
        this.unloadButton.setEnabled(true);
        for (const $it7 = unit.getCompactGoodsList().iterator(); $it7.hasNext(); ) {
          let goods = $it7.next();
          if (colony.getGoodsCount(goods.getType()) > 0) {
            this.fillButton.setEnabled(true);
            break;
          }
        }
      }
    }
  }
  /**
   * Generates a menu containing the units currently accessible
   * from the Colony Panel allowing keyboard access to said units.
   */
  generateColonyUnitsMenu(): void {
    let freeColClient = this.getFreeColClient();
    let lib = this.getImageLibrary();
    let colony = this.getColony();
    let colonyUnitsMenu = new JPopupMenu()._JPopupMenu$String(Messages.message$String('colonyPanel.colonyUnits'));
    let unitIcon = null;
    let unitMenu = new QuickActionMenu()._QuickActionMenu(freeColClient, this);
    let colonyTile = colony.getTile$();
    let unitNumber = 0;
    let subMenu = null;
    for (const $it8 = colony.getUnitList().iterator(); $it8.hasNext(); ) {
      let unit = $it8.next();
      let wl = unit.getWorkLocation();
      let goodsType = unit.getWorkType();
      let student = unit.getStudent();
      unitIcon = new ImageIcon()._ImageIcon$Image(lib.getSmallerUnitImage(unit));
      let sb = new StringBuilder(64);
      let prodLabel = Messages.message$String('colonyPanel.producing');
      if (student != null) {
        sb.append(unit.getDescription$()).append(String.fromCharCode(32 /* ' ' */)).append(prodLabel).append(String.fromCharCode(32 /* ' ' */)).append(Messages.getName$Named(unit.getType().getSkillTaught())).append(String.fromCharCode(32 /* ' ' */)).append(String(unit.getTurnsOfTraining())).append(String.fromCharCode(47 /* \u002f */)).append(String(unit.getNeededTurnsOfTraining()));
      } else if (wl != null && goodsType != null) {
        let producing = wl.getProductionOf(unit, goodsType);
        sb.append(unit.getDescription$()).append(String.fromCharCode(32 /* ' ' */)).append(prodLabel).append(String.fromCharCode(32 /* ' ' */)).append(String(producing)).append(String.fromCharCode(32 /* ' ' */)).append(Messages.message$StringTemplate(StringTemplate.template$Named(goodsType).addAmount('%amount%', producing)));
      } else {
        sb.append(unit.getDescription$()).append(String.fromCharCode(32 /* ' ' */)).append(prodLabel).append(String.fromCharCode(32 /* ' ' */)).append(Messages.message$String('nothing'));
      }
      let menuTitle = sb.toString();
      subMenu = new JMenuItem()._JMenuItem$String$Icon(menuTitle, unitIcon);
      subMenu.addActionListener((ae) => {
        unitMenu.addMenuItems(new UnitLabel()._UnitLabel$FreeColClient$Unit(freeColClient, unit));
        this.getGUI().showPopupMenu(unitMenu, 0, 0);
      });
      unitNumber++;
      colonyUnitsMenu.add$JMenuItem(subMenu);
    }
    colonyUnitsMenu.addSeparator();
    for (const $it9 = colonyTile.getUnitList().iterator(); $it9.hasNext(); ) {
      let unit = $it9.next();
      if (unit.isCarrier()) {
        unitIcon = new ImageIcon()._ImageIcon$Image(lib.getSmallerUnitImage(unit));
        let menuTitle = unit.getDescription$() + ' ' + Messages.message$String('colonyPanel.inPort');
        subMenu = new JMenuItem()._JMenuItem$String$Icon(menuTitle, unitIcon);
        subMenu.addActionListener((ae) => {
          unitMenu.addMenuItems(new UnitLabel()._UnitLabel$FreeColClient$Unit(freeColClient, unit));
          this.getGUI().showPopupMenu(unitMenu, 0, 0);
        });
        unitNumber++;
        colonyUnitsMenu.add$JMenuItem(subMenu);
        for (const $it10 = unit.getUnitList().iterator(); $it10.hasNext(); ) {
          let innerUnit = $it10.next();
          unitIcon = new ImageIcon()._ImageIcon$Image(lib.getSmallerUnitImage(innerUnit));
          menuTitle = innerUnit.getDescription$() + ' ' + Messages.message$String('cargoOnCarrier') + ' ' + unit.getDescription$();
          subMenu = new JMenuItem()._JMenuItem$String$Icon(menuTitle, unitIcon);
          subMenu.addActionListener((ae) => {
            unitMenu.addMenuItems(new UnitLabel()._UnitLabel$FreeColClient$Unit(freeColClient, innerUnit));
            this.getGUI().showPopupMenu(unitMenu, 0, 0);
          });
          unitNumber++;
          colonyUnitsMenu.add$JMenuItem(subMenu);
        }
      } else if (!unit.isOnCarrier()) {
        unitIcon = new ImageIcon()._ImageIcon$Image(lib.getSmallerUnitImage(unit));
        let menuTitle = unit.getDescription$() + ' ' + Messages.message$String('colonyPanel.outsideColony');
        subMenu = new JMenuItem()._JMenuItem$String$Icon(menuTitle, unitIcon);
        subMenu.addActionListener((ae) => {
          unitMenu.addMenuItems(new UnitLabel()._UnitLabel$FreeColClient$Unit(freeColClient, unit));
          this.getGUI().showPopupMenu(unitMenu, 0, 0);
        });
        unitNumber++;
        colonyUnitsMenu.add$JMenuItem(subMenu);
      }
    }
    colonyUnitsMenu.addSeparator();
    let elements = colonyUnitsMenu.getSubElements().length;
    if (elements > 0) {
      let lastIndex = (colonyUnitsMenu.getComponentCount() - 1) | 0;
      if (colonyUnitsMenu.getComponent$int(lastIndex) instanceof JPopupMenu$Separator) {
        colonyUnitsMenu.remove$int(lastIndex);
      }
    }
    this.getGUI().showPopupMenu(colonyUnitsMenu, 0, 0);
  }
  /**
   * Try to assign a unit to work in a colony work location.
   *
   * @param unit The {@code Unit} that is to work.
   * @param wl The {@code WorkLocation} to work in.
   * @return True if the unit is now in the work location.
   */
  tryWork(unit: Unit, wl: WorkLocation): boolean {
    let workType = wl.getWorkFor(unit);
    this.igc().work(unit, wl);
    if (unit.getLocation() !== wl) {
      return false;
    }
    if (workType != null && workType !== unit.getWorkType()) {
      this.igc().changeWorkType(unit, workType);
    }
    return true;
  }
  /**
   * Gets the {@code Colony} in use.
   *
   * Try to use this at the top of all the routines that need the colony,
   * to get a stable value.  There have been nasty races when the colony
   * changes out from underneath us, and more may be lurking.
   *
   * @return The {@code Colony}.
   */
  getColony(): Colony {
    return this.colony;
  }
  /**
   * Gets the {@code TilesPanel}-object in use.
   *
   * @return The {@code TilesPanel}.
   */
  getTilesPanel(): ColonyPanel$TilesPanel {
    return this.tilesPanel;
  }
  /**
   * Gets the {@code WarehousePanel}-object in use.
   *
   * @return The {@code WarehousePanel}.
   */
  getWarehousePanel(): ColonyPanel$WarehousePanel {
    return this.warehousePanel;
  }
  /**
   * {@inheritDoc}
   */
  setSelectedUnitLabel(unitLabel: UnitLabel): void {
    if (this.selectedUnitLabel !== unitLabel) {
      this.inPortPanel.removePropertyChangeListeners();
      if (this.selectedUnitLabel != null) {
        this.selectedUnitLabel.setSelected(false);
        this.selectedUnitLabel.getUnit().removePropertyChangeListener$PropertyChangeListener($J.fn(this, 'propertyChange'));
      }
      super.setSelectedUnitLabel(unitLabel);
      if (unitLabel == null) {
        this.cargoPanel.setCarrier(null);
      } else {
        this.cargoPanel.setCarrier(unitLabel.getUnit());
        unitLabel.setSelected(true);
        unitLabel.getUnit().addPropertyChangeListener$PropertyChangeListener($J.fn(this, 'propertyChange'));
      }
      this.inPortPanel.addPropertyChangeListeners();
    }
    this.updateCarrierButtons();
    this.inPortPanel.revalidate();
    this.inPortPanel.repaint$();
  }
  /**
   * {@inheritDoc}
   */
  setSelectedUnit(unit: Unit): boolean {
    return ((unit.isCarrier()) ? this.inPortPanel.setSelectedUnit(unit) : super.setSelectedUnit(unit));
  }
  updateBuildingsPanel(): void {
    this.colony.invalidateCache();
    this.buildingsPanel.update$();
  }
  updateConstructionPanel(): void {
    this.constructionPanel.update$();
  }
  updateInPortPanel(): void {
    this.inPortPanel.update$();
  }
  updateNetProductionPanel(): void {
    let freeColClient = this.getFreeColClient();
    let colony = this.getColony();
    let spec = colony.getSpecification();
    colony.invalidateCache();
    this.netProductionPanel.removeAll();
    for (const $it11 = spec.getGoodsTypeList().iterator(); $it11.hasNext(); ) {
      let goodsType = $it11.next();
      let amount = colony.getAdjustedNetProductionOf(goodsType);
      if (amount !== 0) {
        let ag = new AbstractGoods()._AbstractGoods$GoodsType$int(goodsType, amount);
        this.netProductionPanel.add$Component(new ProductionLabel()._ProductionLabel$FreeColClient$AbstractGoods(freeColClient, ag));
      }
    }
    this.netProductionPanel.revalidate();
    this.netProductionPanel.repaint$();
  }
  updateOutsideColonyPanel(): void {
    this.outsideColonyPanel.update$();
  }
  updatePopulationPanel(): void {
    this.populationPanel.update$();
  }
  updateTilesPanel(): void {
    this.tilesPanel.update$();
  }
  updateWarehousePanel(): void {
    this.warehousePanel.update$();
  }
  /**
   * Close this {@code ColonyPanel}.
   */
  closeColonyPanel(): void {
    let colony = this.getColony();
    let player = this.getMyPlayer();
    let abandon = false;
    let buildable: BuildableType;
    if (player.owns(colony)) {
      if (colony.getUnitCount() === 0) {
        let key = (player.isRebel() && player.getNumberOfPorts() === 1 && colony.isConnectedPort()) ? 'abandonColony.lastPort.text' : 'abandonColony.text';
        if (!this.getGUI().confirm$Tile$StringTemplate$Settlement$String$String(null, StringTemplate.key$String(key), colony, 'abandonColony.yes', 'abandonColony.no')) {
          return;
        }
        abandon = true;
      } else if ((buildable = colony.getCurrentlyBuilding()) != null) {
        let required = buildable.getRequiredPopulation();
        if (required > colony.getUnitCount() && !this.getGUI().confirm$Tile$StringTemplate$Settlement$String$String(null, StringTemplate.template$String('colonyPanel.reducePopulation').addName$String$String('%colony%', colony.getName()).addAmount('%number%', required).addNamed$String$Named('%buildable%', buildable), colony, 'ok', 'cancel')) {
          return;
        }
      }
    }
    this.cleanup();
    this.getGUI().removeComponent(this);
    this.igc().closeColony(colony, abandon);
  }
  /**
   * Gets the list of units on the colony tile.
   * Note, does not include the units *inside* the colony.
   *
   * @return A sorted list of units on the colony tile.
   */
  getUnitList(): List<Unit> {
    return CollectionUtils.sort$Stream(this.colony.getTile$().getUnits());
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    if ($J.equals(FreeColPanel.OK, ae.getActionCommand())) {
      this.closeColonyPanel();
    } else {
      super.actionPerformed(ae);
    }
  }
  /**
   * {@inheritDoc}
   */
  propertyChange(event: PropertyChangeEvent): void {
    let colony = this.getColony();
    if (!this.isShowing() || colony == null) {
      return;
    }
    let property = event.getPropertyName();
    ColonyPanel.logger.finest(colony.getName() + ' change ' + property + ': ' + $J.str(event.getOldValue()) + ' -> ' + $J.str(event.getNewValue()));
    if (property == null) {
      ColonyPanel.logger.warning('Null property change');
    } else if ($J.equals(Unit.CARGO_CHANGE, property)) {
      this.cargoPanel.update$();
      this.updateInPortPanel();
    } else if ($J.equals(Colony$ColonyChangeEvent.POPULATION_CHANGE.toString(), property)) {
      this.updatePopulationPanel();
      this.updateNetProductionPanel();
    } else if ($J.equals(Colony$ColonyChangeEvent.BONUS_CHANGE.toString(), property)) {
      if (colony.getUnitCount() > 0) {
        let msg = colony.checkForGovMgtChangeMessage();
        if (msg != null) {
          this.getGUI().showInformationPanel$FreeColObject$StringTemplate(colony, msg);
        }
      }
      this.updatePopulationPanel();
    } else if ($J.equals(Colony$ColonyChangeEvent.BUILD_QUEUE_CHANGE.toString(), property)) {
      this.updateProduction();
    } else if ($J.equals(Colony$ColonyChangeEvent.UNIT_TYPE_CHANGE.toString(), property)) {
      let object$ = event.getSource();
      let oldType = event.getOldValue();
      let newType = event.getNewValue();
      this.getGUI().showInformationPanel$FreeColObject$StringTemplate(object$, StringTemplate.template$String('colonyPanel.unitChange').addName$String$String('%colony%', colony.getName()).addNamed$String$Named('%oldType%', oldType).addNamed$String$Named('%newType%', newType));
      this.updateTilesPanel();
      this.updateBuildingsPanel();
      this.updateProduction();
    } else if (property.startsWith('model.goods.')) {
      this.updateWarehousePanel();
      this.updateProduction();
    } else if ($J.equals(Tile.UNIT_CHANGE, property)) {
      this.updateOutsideColonyPanel();
      this.updateInPortPanel();
      this.updatePopulationPanel();
      this.updateWarehousePanel();
    } else if ($J.equals(Unit.MOVE_CHANGE, property)) {
      this.updateOutsideColonyPanel();
    } else {
      ColonyPanel.logger.warning('Unknown property change event: ' + event.getPropertyName());
    }
  }
  /**
   * {@inheritDoc}
   */
  removeNotify(): void {
    if (this.colony == null) {
      return;
    }
    this.colony.setOccupationTrace(false);
    this.colony = null;
    super.removeNotify();
    this.unloadButton = null;
    this.fillButton = null;
    this.warehouseButton = null;
    this.buildQueueButton = null;
    this.colonyUnitsButton = null;
    this.setGoodsButton = null;
    this.traceWorkButton = null;
    this.netProductionPanel = null;
    this.buildingsPanel = null;
    this.buildingsScroll = null;
    this.cargoScroll = null;
    this.constructionPanel = null;
    this.inPortScroll = null;
    this.outsideColonyPanel = null;
    this.outsideColonyScroll = null;
    this.populationPanel = null;
    this.tilesPanel = null;
    this.warehousePanel = null;
    this.warehouseScroll = null;
    this.releaseListener = null;
  }
  tilesPanelTopOffset(tileSize: Dimension): number {
    let topOffset = $J.idiv(tileSize.height_, 4);
    return topOffset;
  }
  static $clinit() {
    ColonyPanel.logger = Logger.getLogger($J.cls(ColonyPanel).getName());
  }
}

/**
 * This panel shows the content of a carrier in the colony
 */
export class ColonyPanel$ColonyCargoPanel extends CargoPanel {
  /**
   * Create this colony cargo panel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _ColonyPanel$ColonyCargoPanel(freeColClient: FreeColClient): this {
    this._CargoPanel(freeColClient, false, true);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  update$(): void {
    super.update$();
    this.$outer.updateCarrierButtons();
    this.$outer.updatePopulationPanel();
  }
}

/**
 * The panel to display the population breakdown for this colony.
 */
export class ColonyPanel$PopulationPanel extends MigPanel {
  rebelShield: JLabel = null;
  rebelLabel: JLabel = null;
  bonusLabel: JLabel = null;
  royalistLabel: JLabel = null;
  royalistShield: JLabel = null;
  rebelMemberLabel: JLabel = null;
  popLabel: JLabel = null;
  royalistMemberLabel: JLabel = null;
  /**
   * Create a new population panel.
   */
  _ColonyPanel$PopulationPanel(): this {
    this._MigPanel$String$LayoutManager('PopulationPanelUI', new MigLayout()._MigLayout$String$String('wrap 5, fill, insets 0', '[][]:push[center]:push[right][]'));
    this.rebelShield = new JLabel()._JLabel$();
    this.rebelLabel = new JLabel()._JLabel$();
    this.bonusLabel = new JLabel()._JLabel$();
    this.royalistLabel = new JLabel()._JLabel$();
    this.royalistShield = new JLabel()._JLabel$();
    this.rebelMemberLabel = new JLabel()._JLabel$();
    this.popLabel = new JLabel()._JLabel$();
    this.royalistMemberLabel = new JLabel()._JLabel$();
    this.setOpaque(false);
    this.setToolTipText(' ');
    return this;
  }
  /**
   * Initialize this population panel.
   */
  initialize(): void {
    this.cleanup();
    this.update$();
  }
  /**
   * Clean up this population panel.
   */
  cleanup(): void {
  }
  /**
   * Update this population panel.
   */
  update$(): void {
    let colony = this.$outer.getColony();
    if (colony == null) {
      return;
    }
    let lib = this.$outer.getImageLibrary();
    let font = FontLibrary.getScaledFont$String$String('normal-plain-smaller', null);
    let uc = colony.getUnitCount();
    let solPercent = colony.getSonsOfLiberty();
    let rebelCount = Colony.calculateRebelCount(uc, solPercent);
    let nation = colony.getOwner().getNation();
    let grow = colony.getPreferredSizeChange();
    let bonus = colony.getProductionBonus();
    let t: StringTemplate;
    this.removeAll();
    this.rebelShield.setIcon(new ImageIcon()._ImageIcon$Image(lib.getSmallerNationImage(nation)));
    this.add$Component$Object(this.rebelShield, 'bottom');
    t = StringTemplate.template$String('colonyPanel.rebelLabel').addAmount('%number%', rebelCount);
    this.rebelLabel.setText(Messages.message$StringTemplate(t));
    this.rebelLabel.setFont(font);
    this.add$Component$Object(this.rebelLabel, 'split 2, flowy');
    this.rebelMemberLabel.setText(solPercent + '%');
    this.rebelMemberLabel.setFont(font);
    this.add$Component(this.rebelMemberLabel);
    t = StringTemplate.template$String('colonyPanel.populationLabel').addAmount('%number%', uc);
    this.popLabel.setText(Messages.message$StringTemplate(t));
    this.popLabel.setFont(font);
    this.add$Component$Object(this.popLabel, 'split 2, flowy');
    let growth = (grow === 0) ? '' : String.fromCharCode(40 /* '(' */) + ((grow >= Colony.CHANGE_UPPER_BOUND) ? Messages.message$String('many') : String(grow)) + String.fromCharCode(41 /* ')' */);
    t = StringTemplate.template$String('colonyPanel.bonusLabel').addAmount('%number%', bonus).addName$String$String('%extra%', growth);
    this.bonusLabel.setText(Messages.message$StringTemplate(t));
    this.bonusLabel.setFont(font);
    this.add$Component(this.bonusLabel);
    t = StringTemplate.template$String('colonyPanel.royalistLabel').addAmount('%number%', (uc - rebelCount) | 0);
    this.royalistLabel.setText(Messages.message$StringTemplate(t));
    this.royalistLabel.setFont(font);
    this.add$Component$Object(this.royalistLabel, 'split 2, flowy');
    this.royalistMemberLabel.setText(((100 - solPercent) | 0) + '%');
    this.royalistMemberLabel.setFont(font);
    this.add$Component(this.royalistMemberLabel);
    let other = (colony.getOwner().isREF()) ? nation.getRebelNation() : nation.getREFNation();
    try {
      this.royalistShield.setIcon(new ImageIcon()._ImageIcon$Image(lib.getSmallerNationImage(other)));
      this.add$Component$Object(this.royalistShield, 'bottom');
    } catch ($e12) {
      if ($J.isa($e12, Exception)) {
        let e = $J.exc($e12);
        ColonyPanel.logger.log(Level.WARNING, 'Shield: ' + $J.str(nation) + '/' + $J.str(other), e);
      } else {
        throw $e12;
      }
    }
    this.revalidate();
    this.repaint$();
  }
  /**
   * Generates the {@code JToolTip} with the colony's
   * detailed population information.
   *
   * @return The JToolTip created.
   */
  createToolTip(): JToolTip {
    let toolTip = new RebelToolTip()._RebelToolTip(this.$outer.getFreeColClient(), this.$outer.getColony());
    return toolTip;
  }
  /**
   * {@inheritDoc}
   */
  removeNotify(): void {
    super.removeNotify();
    this.removeAll();
    this.setLayout(null);
  }
}

/**
 * A panel that holds UnitLabels that represent Units that are standing in
 * front of a colony.
 */
export class ColonyPanel$OutsideColonyPanel extends UnitPanel {
  /**
   * Create this OutsideColonyPanel.
   */
  _ColonyPanel$OutsideColonyPanel(): this {
    this._UnitPanel('OutsideColonyPanelUI', new MigLayout()._MigLayout$String$String$String('ins 0, gapy 0, align center bottom', '', '[bottom]'), this.$outer, null, this.$outer.isEditable());
    this.setOpaque(false);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  initialize(): void {
    super.initialize();
    let colony = this.$outer.getColony();
    if (colony != null) {
      this.setName(colony.getName() + ' - ' + Messages.message$String('port'));
    }
  }
  /**
   * {@inheritDoc}
   */
  cleanup(): void {
    super.cleanup();
    this.removeAll();
  }
  /**
   * {@inheritDoc}
   */
  addPropertyChangeListeners(): void {
    let colony = this.$outer.getColony();
    if (colony != null) {
      colony.getTile$().addPropertyChangeListener$String$PropertyChangeListener(Tile.UNIT_CHANGE, $J.fn(this, 'propertyChange'));
    }
  }
  /**
   * {@inheritDoc}
   */
  removePropertyChangeListeners(): void {
    let colony = this.$outer.getColony();
    if (colony != null) {
      colony.getTile$().removePropertyChangeListener$String$PropertyChangeListener(Tile.UNIT_CHANGE, $J.fn(this, 'propertyChange'));
    }
  }
  /**
   * {@inheritDoc}
   */
  accepts$Goods(goods: Goods): boolean {
    return false;
  }
  /**
   * {@inheritDoc}
   */
  accepts$GoodsType(goodsType: GoodsType): boolean {
    return false;
  }
  /**
   * {@inheritDoc}
   */
  accepts$Unit(unit: Unit): boolean {
    return !unit.isCarrier();
  }
  /**
   * {@inheritDoc}
   */
  selectLabel(): void {
  }
  /**
   * {@inheritDoc}
   */
  add$Component$boolean(comp: Component, editState: boolean): Component {
    let oldParent = comp.getParent();
    if (editState) {
      if (comp instanceof UnitLabel) {
        let unitLabel = comp;
        let unit = unitLabel.getUnit();
        if (!unit.isOnCarrier()) {
          this.$outer.igc().putOutsideColony(unit);
        }
        if (unit.getColony() == null) {
          this.$outer.closeColonyPanel();
          return null;
        } else if (!unit.isOnTile() && !unit.isOnCarrier()) {
          return null;
        }
        oldParent.remove$Component(comp);
        this.initialize();
        return comp;
      } else {
        ColonyPanel.logger.warning('Invalid component: ' + $J.str(comp));
        return null;
      }
    } else {
      (comp).setSmall(false);
      return this.add$Component(comp);
    }
  }
  /**
   * {@inheritDoc}
   */
  suggested(type$: GoodsType): number {
    return -1;
  }
}

/**
 * A panel that holds UnitLabels that represent naval Units that are
 * waiting in the port of the colony.
 */
export class ColonyPanel$ColonyInPortPanel extends InPortPanel {
  /**
   * Creates this ColonyInPortPanel.
   */
  _ColonyPanel$ColonyInPortPanel(): this {
    this._InPortPanel(new MigLayout()._MigLayout$String$String$String('ins 0, gapy 0, align center bottom', '', '[bottom]'), this.$outer, null, this.$outer.isEditable());
    this.setOpaque(false);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  initialize(): void {
    super.initialize();
    let colony = this.$outer.getColony();
    if (colony != null) {
      this.setName(colony.getName() + ' - ' + Messages.message$String('port'));
    }
  }
  /**
   * {@inheritDoc}
   */
  addPropertyChangeListeners(): void {
    let selected = this.$outer.getSelectedUnit();
    if (selected != null) {
      selected.addPropertyChangeListener$String$PropertyChangeListener(Unit.CARGO_CHANGE, $J.fn(this, 'propertyChange'));
    }
  }
  /**
   * {@inheritDoc}
   */
  removePropertyChangeListeners(): void {
    let selected = this.$outer.getSelectedUnit();
    if (selected != null) {
      selected.removePropertyChangeListener$String$PropertyChangeListener(Unit.CARGO_CHANGE, $J.fn(this, 'propertyChange'));
    }
  }
  /**
   * {@inheritDoc}
   */
  accepts$Unit(unit: Unit): boolean {
    return unit.isCarrier();
  }
  /**
   * {@inheritDoc}
   */
  selectLabel(): void {
    this.removePropertyChangeListeners();
    super.selectLabel();
    this.addPropertyChangeListeners();
  }
  paintComponent(g: Graphics): void {
    super.paintComponent(g);
    let g2d = g;
    if (this.$outer.selectedUnitLabel != null) {
      let oldColor = g.getColor();
      let oldStroke = g2d.getStroke();
      g2d.setColor(ImageLibrary.getColor$String('color.carrier.selected'));
      let bounds = this.$outer.selectedUnitLabel.getBounds$();
      let scaledLine = this.$outer.getImageLibrary().scaleInt(2);
      g2d.setStroke(new BasicStroke()._BasicStroke$float(Math.fround(scaledLine)));
      g2d.drawRect((bounds.x_ - scaledLine) | 0, (bounds.y_ - scaledLine) | 0, (bounds.width_ + Math.imul(scaledLine, 2)) | 0, (bounds.height_ + Math.imul(scaledLine, 2)) | 0);
      g2d.setColor(oldColor);
      g2d.setStroke(oldStroke);
    }
  }
}

/**
 * A panel that holds goods that represent cargo that is inside
 * the Colony.
 */
export class ColonyPanel$WarehousePanel extends MigPanel {
  /**
   * Creates a WarehousePanel.
   */
  _ColonyPanel$WarehousePanel(): this {
    this._MigPanel$String$LayoutManager('WarehousePanelUI', new MigLayout()._MigLayout$String('fill, gap push, insets 0'));
    return this;
  }
  /**
   * Initialize this WarehousePanel.
   */
  initialize(): void {
    this.cleanup();
    this.addPropertyChangeListeners();
    this.update$();
  }
  /**
   * Clean up this WarehousePanel.
   */
  cleanup(): void {
    this.removePropertyChangeListeners();
    this.removeAll();
  }
  /**
   * Add the property change listeners to this panel.
   */
  addPropertyChangeListeners(): void {
    let colony = this.$outer.getColony();
    if (colony != null) {
      colony.getGoodsContainer().addPropertyChangeListener$PropertyChangeListener($J.fn(this, 'propertyChange'));
    }
  }
  /**
   * Remove the property change listeners from this panel.
   */
  removePropertyChangeListeners(): void {
    let colony = this.$outer.getColony();
    if (colony != null) {
      colony.getGoodsContainer().removePropertyChangeListener$PropertyChangeListener($J.fn(this, 'propertyChange'));
    }
  }
  /**
   * Update this WarehousePanel.
   */
  update$(): void {
    let colony = this.$outer.getColony();
    if (colony == null) {
      return;
    }
    this.removeAll();
    let options = this.$outer.getClientOptions();
    let threshold = (FreeColDebugger.isInDebugMode$DebugMode(FreeColDebugger$DebugMode.MENUS)) ? 1 : options.getInteger(ClientOptions.MIN_NUMBER_FOR_DISPLAYING_GOODS);
    let game = colony.getGame();
    let spec = colony.getSpecification();
    for (const $it13 = spec.getStorableGoodsTypeList().iterator(); $it13.hasNext(); ) {
      let goodsType = $it13.next();
      let count = colony.getGoodsCount(goodsType);
      if (count >= threshold) {
        let goods = new Goods()._Goods$Game$Location$GoodsType$int(game, colony, goodsType, count);
        let goodsLabel = new GoodsLabel()._GoodsLabel$FreeColClient$Goods$boolean(this.$outer.getFreeColClient(), goods, true);
        if (this.$outer.isEditable()) {
          goodsLabel.setTransferHandler(this.$outer.defaultTransferHandler);
          goodsLabel.addMouseListener(this.$outer.pressListener);
        }
        this.add$Component$Object(goodsLabel, 'alignx center');
      }
    }
    this.$outer.updateProduction();
    this.revalidate();
    this.repaint$();
  }
  /**
   * {@inheritDoc}
   */
  accepts$Goods(goods: Goods): boolean {
    return true;
  }
  /**
   * {@inheritDoc}
   */
  accepts$GoodsType(goodsType: GoodsType): boolean {
    return false;
  }
  /**
   * {@inheritDoc}
   */
  accepts$Unit(unit: Unit): boolean {
    return false;
  }
  /**
   * {@inheritDoc}
   */
  add$Component$boolean(comp: Component, editState: boolean): Component {
    if (editState) {
      if (!(comp instanceof GoodsLabel)) {
        ColonyPanel.logger.warning('Invalid component: ' + $J.str(comp));
        return null;
      }
      comp.getParent().remove$Component(comp);
      return comp;
    }
    return this.add$Component(comp);
  }
  /**
   * {@inheritDoc}
   */
  suggested(type$: GoodsType): number {
    let colony = this.$outer.getColony();
    return (colony.getWarehouseCapacity() - colony.getGoodsCount(type$)) | 0;
  }
  /**
   * {@inheritDoc}
   */
  propertyChange(event: PropertyChangeEvent): void {
    let colony = this.$outer.getColony();
    if (colony != null && event != null) {
      ColonyPanel.logger.finest(colony.getName() + '-warehouse change ' + event.getPropertyName() + ': ' + $J.str(event.getOldValue()) + ' -> ' + $J.str(event.getNewValue()));
    }
    this.update$();
  }
  /**
   * {@inheritDoc}
   */
  removeNotify(): void {
    super.removeNotify();
    this.removeAll();
    this.setLayout(null);
  }
  paintComponent(g: Graphics): void {
    super.paintComponent(g);
    let colonyWarehouseBackground = this.$outer.getImageLibrary().getColonyWarehouseBackground();
    ImageUtils.drawTiledImage(colonyWarehouseBackground, g, this, this.getInsets$());
  }
}

/**
 * This panel is a list of the colony's buildings.
 */
export class ColonyPanel$BuildingsPanel extends MigPanel {
  /**
   * Always pop up the build queue when clicking on a building.
   */
  buildQueueListener: MouseAdapter = null;
  /**
   * Creates this BuildingsPanel.
   */
  _ColonyPanel$BuildingsPanel(): this {
    this._MigPanel$String$LayoutManager('BuildingsPanelUI', new BuildingsLayoutManager()._BuildingsLayoutManager$());
    this.buildQueueListener = new (ColonyPanel$BuildingsPanel$1())().$o(this)._MouseAdapter();
    return this;
  }
  /**
   * Initializes the game data in this buildings panel.
   */
  initialize(): void {
    let colony = this.$outer.getColony();
    if (colony == null) {
      return;
    }
    this.cleanup();
    let allBuildableTypes = this.$outer.getSpecification().getBuildingTypeList().stream().filter((bt) => bt.getUpgradesFrom() == null).collect(Collectors.toList());
    let random = new Random((Math.imul(13, this.$outer.getColony().getTile$().getX()) + Math.imul(23, this.$outer.getColony().getTile$().getY())) | 0);
    Collections.shuffle(allBuildableTypes, random);
    let constructedBuildings = colony.getBuildings().stream().collect(Collectors.groupingBy((g) => g.getType().getFirstLevel()));
    for (const $it14 = allBuildableTypes.iterator(); $it14.hasNext(); ) {
      let bt = $it14.next();
      if (bt.isDefenceType()) {
        continue;
      }
      if (bt.hasAbility$String(Ability.PRODUCE_IN_WATER)) {
        continue;
      }
      let btBuildings = constructedBuildings.get(bt);
      if (btBuildings == null) {
        let emptyPlot = new ColonyPanel$BuildingsPanel$EmptyBuildingSite().$o(this)._ColonyPanel$BuildingsPanel$EmptyBuildingSite();
        let size = this.$outer.getImageLibrary().determineMaxSizeUsingSizeFromAllLevels(bt, colony.getOwner());
        emptyPlot.setMinimumSize(size);
        emptyPlot.setPreferredSize(size);
        emptyPlot.setSize$Dimension(size);
        this.add$Component(emptyPlot);
      } else {
        if (btBuildings.size() !== 1) {
          throw new IllegalStateException('Expected at most one building of each type.');
        }
        let aSBP = new ColonyPanel$BuildingsPanel$ASingleBuildingPanel().$o(this)._ColonyPanel$BuildingsPanel$ASingleBuildingPanel(btBuildings.get(0));
        aSBP.initialize();
        this.add$Component(aSBP);
      }
    }
    this.update$();
  }
  /**
   * Clean up this buildings panel.
   */
  cleanup(): void {
    for (let component of this.getComponents()) {
      if (component instanceof ColonyPanel$BuildingsPanel$ASingleBuildingPanel) {
        (component).cleanup();
      }
    }
    this.removeAll();
  }
  /**
   * Update this buildings panel.
   */
  update$(): void {
    for (let component of this.getComponents()) {
      if (component instanceof ColonyPanel$BuildingsPanel$ASingleBuildingPanel) {
        (component).update$();
      }
    }
    this.repaint$();
  }
  /**
   * {@inheritDoc}
   */
  removeNotify(): void {
    super.removeNotify();
    this.removeAll();
    this.setLayout(null);
  }
}

/**
 * This panel is a single line (one building) in the
 * {@code BuildingsPanel}.
 */
export class ColonyPanel$BuildingsPanel$ASingleBuildingPanel extends BuildingPanel {
  /**
   * Creates this ASingleBuildingPanel.
   *
   * @param building The {@code Building} to display
   *     information from.
   */
  _ColonyPanel$BuildingsPanel$ASingleBuildingPanel(building: Building): this {
    this._BuildingPanel(this.$outer.$outer.getFreeColClient(), building);
    this.setOpaque(false);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  initialize(): void {
    if (this.$outer.$outer.isEditable()) {
      super.initialize();
      this.addMouseListener(this.$outer.$outer.releaseListener);
      if (this.getBuilding().hasAbility$String(Ability.BUILD)) {
        this.addMouseListener(this.$outer.buildQueueListener);
      } else {
        this.addMouseListener(this.$outer.$outer.frameMoveDispatchListener);
        this.addMouseMotionListener(this.$outer.$outer.frameMoveDispatchListener);
      }
      this.setTransferHandler(this.$outer.$outer.defaultTransferHandler);
    }
  }
  /**
   * {@inheritDoc}
   */
  cleanup(): void {
    super.cleanup();
    this.removeMouseListener(this.$outer.$outer.releaseListener);
    this.removeMouseListener(this.$outer.buildQueueListener);
    this.removeMouseListener(this.$outer.$outer.frameMoveDispatchListener);
    this.removeMouseMotionListener(this.$outer.$outer.frameMoveDispatchListener);
    this.setTransferHandler(null);
    this.removeAll();
  }
  /**
   * {@inheritDoc}
   */
  update$(): void {
    super.update$();
    if (this.$outer.$outer.isEditable()) {
      for (const $it15 = this.getUnitLabels().iterator(); $it15.hasNext(); ) {
        let unitLabel = $it15.next();
        unitLabel.setTransferHandler(this.$outer.$outer.defaultTransferHandler);
        unitLabel.addMouseListener(this.$outer.$outer.pressListener);
      }
    }
  }
  /**
   * Try to assign a unit to work this building.
   *
   * @param unit The {@code Unit} to try.
   * @return True if the work begins.
   */
  tryWork(unit: Unit): boolean {
    let building = this.getBuilding();
    let reason = building.getNoAddReason(unit);
    if (reason !== UnitLocation$NoAddReason.NONE) {
      this.$outer.$outer.getGUI().showInformationPanel$FreeColObject$String(building, reason.getDescriptionKey());
      return false;
    }
    return this.$outer.$outer.tryWork(unit, building);
  }
  /**
   * {@inheritDoc}
   */
  accepts$Goods(goods: Goods): boolean {
    return false;
  }
  /**
   * {@inheritDoc}
   */
  accepts$GoodsType(goodsType: GoodsType): boolean {
    return false;
  }
  /**
   * {@inheritDoc}
   */
  accepts$Unit(unit: Unit): boolean {
    return unit.isPerson();
  }
  /**
   * {@inheritDoc}
   */
  add$Component$boolean(comp: Component, editState: boolean): Component {
    if (editState) {
      if (comp instanceof UnitLabel) {
        if (!this.tryWork((comp).getUnit())) {
          return null;
        }
      } else {
        ColonyPanel.logger.warning('An invalid component was dropped on this ASingleBuildingPanel.');
        return null;
      }
      this.update$();
    }
    return null;
  }
  /**
   * {@inheritDoc}
   */
  suggested(type$: GoodsType): number {
    return -1;
  }
  /**
   * {@inheritDoc}
   */
  propertyChange(event: PropertyChangeEvent): void {
    super.propertyChange(event);
    this.$outer.$outer.updateProduction();
  }
}

export class ColonyPanel$BuildingsPanel$EmptyBuildingSite extends JPanel {
  _ColonyPanel$BuildingsPanel$EmptyBuildingSite(): this {
    this._JPanel$();
    this.setOpaque(false);
    return this;
  }
  paintComponent(g: Graphics): void {
    super.paintComponent(g);
    let lib = this.$outer.$outer.getImageLibrary();
    let image = lib.getScaledBuildingEmptyLandImage();
    let size = this.getSize$();
    g.drawImage$Image$int$int$ImageObserver(image, $J.idiv(((size.width_ - image.getWidth()) | 0), 2), (size.height_ - image.getHeight()) | 0, this);
  }
}

/**
 * A panel that displays the tiles in the immediate area around the colony.
 * TilesPanel class must use the ImageLibrary inside SwingGUI.tileMapViewer
 * for everything.
 */
export class ColonyPanel$TilesPanel extends JPanel {
  /**
   * The tiles around the colony.
   */
  tiles: Tile[][] = null;
  /**
   * A currently displayed production message.
   */
  cachedPanel: FreeColPanel = null;
  /**
   * The work location that would be better to produce with.
   */
  bestLocation: WorkLocation = null;
  /**
   * Creates a TilesPanel.
   */
  _ColonyPanel$TilesPanel(): this {
    this._JPanel$();
    this.tiles = $J.newArrayN([3, 3], null);
    this.cachedPanel = null;
    this.bestLocation = null;
    this.setBackground(Color.BLACK);
    this.setBorder(null);
    this.setLayout(null);
    this.setOpaque(false);
    return this;
  }
  /**
   * Initialize the game data in this tiles panel.
   */
  initialize(): void {
    let colony = this.$outer.getColony();
    if (colony == null) {
      return;
    }
    this.cleanup();
    let tile = colony.getTile$();
    this.tiles[0][0] = tile.getNeighbourOrNull(Direction.N);
    this.tiles[0][1] = tile.getNeighbourOrNull(Direction.NE);
    this.tiles[0][2] = tile.getNeighbourOrNull(Direction.E);
    this.tiles[1][0] = tile.getNeighbourOrNull(Direction.NW);
    this.tiles[1][1] = tile;
    this.tiles[1][2] = tile.getNeighbourOrNull(Direction.SE);
    this.tiles[2][0] = tile.getNeighbourOrNull(Direction.W);
    this.tiles[2][1] = tile.getNeighbourOrNull(Direction.SW);
    this.tiles[2][2] = tile.getNeighbourOrNull(Direction.S);
    let layer = 2;
    for (let x = 0; x < this.tiles.length; x++) {
      for (let y = 0; y < this.tiles[x].length; y++) {
        if (this.tiles[x][y] == null) {
          ColonyPanel.logger.warning('Null tile for ' + $J.str(this.$outer.getColony()) + ' at ' + x + ',' + y);
          continue;
        }
        let colonyTile = colony.getColonyTile(this.tiles[x][y]);
        if (colonyTile == null) {
          ColonyPanel.logger.warning('Null colony tile for ' + $J.str(this.$outer.getColony()) + ' on ' + $J.str(this.tiles[x][y]) + ' at ' + x + ',' + y);
          CollectionUtils.dump$String$Collection('TILES', colony.getColonyTiles());
          continue;
        }
        let aSTP = new ColonyPanel$TilesPanel$ASingleTilePanel().$o(this)._ColonyPanel$TilesPanel$ASingleTilePanel(colonyTile, x, y);
        aSTP.initialize();
        this.add$Component$Object(aSTP, layer++);
      }
    }
    this.update$();
  }
  /**
   * Clean up this tiles panel.
   */
  cleanup(): void {
    for (let component of this.getComponents()) {
      if (component instanceof ColonyPanel$TilesPanel$ASingleTilePanel) {
        (component).cleanup();
      }
    }
    this.removeAll();
  }
  /**
   * Update this tiles panel.
   */
  update$(): void {
    for (let component of this.getComponents()) {
      if (component instanceof ColonyPanel$TilesPanel$ASingleTilePanel) {
        (component).update$();
      }
    }
    this.repaint$();
  }
  /**
   * Display the poor production message.
   *
   * @param best The better work location.
   * @param template The {@code StringTemplate} with the message.
   */
  showPoorProduction(best: WorkLocation, template: StringTemplate): void {
    if (this.bestLocation === best) {
      return;
    }
    if (this.cachedPanel != null) {
      this.$outer.getGUI().removeComponent(this.cachedPanel);
    }
    this.cachedPanel = this.$outer.getGUI().showInformationPanel$FreeColObject$StringTemplate(best, template);
    this.bestLocation = best;
  }
  /**
   * {@inheritDoc}
   */
  paintComponent(g: Graphics): void {
    let colony = this.$outer.getColony();
    if (colony != null) {
      let size = this.$outer.getImageLibrary().getTileSize();
      let topOffset = this.$outer.tilesPanelTopOffset(size);
      g.translate$int$int(0, topOffset);
      this.$outer.getGUI().displayColonyTiles(g, this.tiles, colony);
      g.translate$int$int(0, -topOffset);
    }
  }
}

/**
 * Panel for visualizing a {@code ColonyTile}.  The
 * component itself is not visible, however the content of the
 * component is (i.e. the people working and the production)
 */
export class ColonyPanel$TilesPanel$ASingleTilePanel extends JPanel {
  /**
   * The colony tile to monitor.
   */
  colonyTile: ColonyTile = null;
  /**
   * Create a new single tile panel.
   *
   * @param colonyTile The {@code ColonyTile} to monitor.
   * @param x The x offset.
   * @param y The y offset.
   */
  _ColonyPanel$TilesPanel$ASingleTilePanel(colonyTile: ColonyTile, x: number, y: number): this {
    this._JPanel$();
    this.colonyTile = colonyTile;
    this.setLayout(new FlowLayout()._FlowLayout$int$int$int(FlowLayout.CENTER, 0, 0));
    this.setOpaque(false);
    let size = this.$outer.$outer.getImageLibrary().getTileSize();
    let topOffset = this.$outer.$outer.tilesPanelTopOffset(size);
    this.setSize$Dimension(size);
    this.setLocation$int$int($J.idiv(Math.imul(((2 - x + y) | 0), size.width_), 2), ($J.idiv(Math.imul(((x + y) | 0), size.height_), 2) + topOffset) | 0);
    return this;
  }
  /**
   * Initialize this single tile panel.
   */
  initialize(): void {
    if (this.$outer.$outer.isEditable()) {
      this.cleanup();
      this.addMouseListener(this.$outer.$outer.pressListener);
      this.addMouseListener(this.$outer.$outer.releaseListener);
      this.setTransferHandler(this.$outer.$outer.defaultTransferHandler);
      this.addPropertyChangeListeners();
    }
  }
  /**
   * Clean up this single tile panel.
   */
  cleanup(): void {
    this.removeMouseListener(this.$outer.$outer.pressListener);
    this.removeMouseListener(this.$outer.$outer.releaseListener);
    this.setTransferHandler(null);
    this.removePropertyChangeListeners();
    this.removeAll();
  }
  /**
   * Adds PropertyChangeListeners
   */
  addPropertyChangeListeners(): void {
    if (this.colonyTile != null) {
      this.colonyTile.addPropertyChangeListener$PropertyChangeListener($J.fn(this, 'propertyChange'));
    }
  }
  /**
   * Removes PropertyChangeListeners
   */
  removePropertyChangeListeners(): void {
    if (this.colonyTile != null) {
      this.colonyTile.removePropertyChangeListener$PropertyChangeListener($J.fn(this, 'propertyChange'));
    }
  }
  /**
   * Update this single tile panel.
   */
  update$(): void {
    this.removeAll();
    if (this.colonyTile == null) {
      ColonyPanel.logger.warning('Update of ' + $J.str(this.$outer.$outer.getColony()) + ' null colony tile.');
      return;
    }
    let fcc = this.$outer.$outer.getFreeColClient();
    let label = null;
    for (const $it16 = this.colonyTile.getUnitList().iterator(); $it16.hasNext(); ) {
      let unit = $it16.next();
      label = new UnitLabel()._UnitLabel$FreeColClient$Unit$boolean$boolean(fcc, unit, false, false);
      if (this.$outer.$outer.isEditable()) {
        label.setTransferHandler(this.$outer.$outer.defaultTransferHandler);
        label.addMouseListener(this.$outer.$outer.pressListener);
      }
      super.add$Component(label);
    }
    this.updateDescriptionLabel(label);
    if (this.colonyTile.isColonyCenterTile()) {
      this.setLayout(new GridLayout()._GridLayout$int$int(2, 1));
      let info = this.$outer.$outer.colony.getProductionInfo(this.colonyTile);
      if (info != null) {
        for (const $it17 = info.getProduction().iterator(); $it17.hasNext(); ) {
          let ag = $it17.next();
          let productionLabel = new ProductionLabel()._ProductionLabel$FreeColClient$AbstractGoods(fcc, ag);
          productionLabel.addMouseListener(this.$outer.$outer.pressListener);
          this.add$Component(productionLabel);
        }
      }
    }
  }
  /**
   * Gets the colony tile this panel is handling.
   *
   * @return The colony tile.
   */
  getColonyTile(): ColonyTile {
    return this.colonyTile;
  }
  /**
   * Updates the description label, which is a tooltip with
   * the terrain type, road and plow indicator, if any.
   *
   * If a unit is on it update the tooltip of it instead.
   *
   * @param unitLabel The {@code UnitLabel} to update.
   */
  updateDescriptionLabel(unitLabel: UnitLabel): void {
    let tileMsg = Messages.message$StringTemplate(this.colonyTile.getLabel());
    if (unitLabel == null) {
      this.setToolTipText(tileMsg);
    } else {
      let unit = unitLabel.getUnit();
      unitLabel.setDescriptionLabel(tileMsg + ' [' + unit.getDescription$UnitLabelType(Unit$UnitLabelType.NATIONAL) + ']');
    }
  }
  /**
   * Try to work this tile with a specified unit.
   *
   * @param unit The {@code Unit} to work the tile.
   * @return True if the unit succeeds.
   */
  tryWork(unit: Unit): boolean {
    let colony = this.$outer.$outer.getColony();
    let tile = this.colonyTile.getWorkTile();
    let player = unit.getOwner();
    if (tile.getOwningSettlement() !== colony) {
      let claim = player.canClaimForSettlementReason(tile);
      switch (claim) {
        case Player$NoClaimReason.NONE:
        case Player$NoClaimReason.NATIVES:
          if (this.$outer.$outer.igc().claimTile(tile, colony) && tile.getOwningSettlement() === colony) {
            ColonyPanel.logger.info('Colony ' + colony.getName() + ' claims tile ' + $J.str(tile) + ' with unit ' + unit.getId());
          } else {
            ColonyPanel.logger.warning('Colony ' + colony.getName() + ' did not claim ' + $J.str(tile) + ' with unit ' + unit.getId());
            return false;
          }
          break;
        default:
          this.$outer.$outer.getGUI().showInformationPanel$FreeColObject$String(tile, claim.getDescriptionKey());
          return false;
      }
      if (tile.getOwningSettlement() !== colony) {
        throw new RuntimeException('Claim failed: ' + $J.str(claim));
      }
    }
    let reason = this.colonyTile.getNoAddReason(unit);
    if (reason !== UnitLocation$NoAddReason.NONE) {
      this.$outer.$outer.getGUI().showInformationPanel$FreeColObject$StringTemplate(this.colonyTile, StringTemplate.template$String(reason.getDescriptionKey()));
      return false;
    }
    if (!this.$outer.$outer.tryWork(unit, this.colonyTile)) {
      return false;
    }
    let workType = unit.getWorkType();
    if (workType != null && this.$outer.$outer.getClientOptions().getBoolean(ClientOptions.SHOW_NOT_BEST_TILE)) {
      let best = colony.getWorkLocationFor$Unit$GoodsType(unit, workType);
      if (best != null && this.colonyTile !== best && (this.colonyTile.getPotentialProduction(workType, unit.getType()) < best.getPotentialProduction(workType, unit.getType()))) {
        let template = StringTemplate.template$String('colonyPanel.notBestTile').addStringTemplate$String$StringTemplate('%unit%', unit.getLabel$UnitLabelType(Unit$UnitLabelType.NATIONAL)).addNamed$String$Named('%goods%', workType).addStringTemplate$String$StringTemplate('%tile%', best.getLabel());
        this.$outer.showPoorProduction(best, template);
      }
    }
    return true;
  }
  /**
   * {@inheritDoc}
   */
  accepts$Unit(unit: Unit): boolean {
    return unit.isPerson();
  }
  /**
   * {@inheritDoc}
   */
  add$Component$boolean(comp: Component, editState: boolean): Component {
    if (editState) {
      if (comp instanceof UnitLabel) {
        let label = comp;
        if (!this.tryWork(label.getUnit())) {
          return null;
        }
        label.setSmall(false);
      } else {
        ColonyPanel.logger.warning('An invalid component was dropped on this ASingleTilePanel.');
        return null;
      }
    }
    this.update$();
    return comp;
  }
  /**
   * {@inheritDoc}
   *
   * Updates the production value via {@link #updateProduction()}
   */
  propertyChange(event: PropertyChangeEvent): void {
    let property = event.getPropertyName();
    ColonyPanel.logger.finest(this.colonyTile.getId() + ' change ' + property + ': ' + $J.str(event.getOldValue()) + ' -> ' + $J.str(event.getNewValue()));
    this.$outer.$outer.updateProduction();
  }
  /**
   * Checks if this {@code JComponent} contains the given
   * coordinate.
   *
   * @param px The x coordinate to check.
   * @param py The y coordinate to check.
   * @return true if the coordinate is inside.
   */
  contains$int$int(px: number, py: number): boolean {
    let w = this.getWidth();
    let h = this.getHeight();
    let dx = Math.abs(($J.idiv(w, 2) - px) | 0);
    let dy = Math.abs(($J.idiv(h, 2) - py) | 0);
    return ((dx + $J.idiv(Math.imul(w, dy), h)) | 0) <= $J.idiv(w, 2);
  }
}

let $ColonyPanel$6: any = null;
/** An anonymous class (ColonyPanel.java:2796). */
function ColonyPanel$6(): any {
  return $ColonyPanel$6 ??= $J.local(class extends MouseAdapter {
    mouseClicked(e: MouseEvent): void {
      this.dispatchTo(e, this.$outer);
    }
    mousePressed(e: MouseEvent): void {
      this.dispatchTo(e, this.$outer);
    }
    mouseReleased(e: MouseEvent): void {
      this.dispatchTo(e, this.$outer);
    }
    mouseEntered(e: MouseEvent): void {
      this.dispatchTo(e, this.$outer);
    }
    mouseExited(e: MouseEvent): void {
      this.dispatchTo(e, this.$outer);
    }
    mouseWheelMoved(e: MouseWheelEvent): void {
      this.dispatchTo(e, this.$outer);
    }
    mouseDragged(e: MouseEvent): void {
      this.dispatchTo(e, this.$outer);
    }
    mouseMoved(e: MouseEvent): void {
      this.dispatchTo(e, this.$outer);
    }
    dispatchTo(e: MouseEvent, target: Component): void {
      let source = e.getSource();
      let targetEvent = SwingUtilities.convertMouseEvent(source, e, target);
      target.dispatchEvent(targetEvent);
    }
  }, 'net.sf.freecol.client.gui.panel.ColonyPanel$6', []);
}

let $ColonyPanel$1: any = null;
/** An anonymous class (ColonyPanel.java:380). */
function ColonyPanel$1(): any {
  return $ColonyPanel$1 ??= $J.local(class extends JScrollPane {
    getPreferredSize$(): Dimension {
      return new Dimension()._Dimension$int$int(1, 1);
    }
  }, 'net.sf.freecol.client.gui.panel.ColonyPanel$1', []);
}

let $ColonyPanel$2: any = null;
/** An anonymous class (ColonyPanel.java:393). */
function ColonyPanel$2(): any {
  return $ColonyPanel$2 ??= $J.local(class extends ComponentAdapter {
    componentResized(e: ComponentEvent): void {
      let preferredSize = this.$outer.buildingsPanel.getLayout().preferredLayoutSize(this.$outer.buildingsPanel);
      let viewportSize = this.$outer.buildingsScroll.getViewport().getSize$();
      if (!preferredSize.equals(this.$outer.buildingsPanel.getSize$())) {
        this.$outer.buildingsPanel.setSize$Dimension(preferredSize);
        this.$outer.buildingsScroll.validate();
      }
      if (preferredSize.width_ <= viewportSize.width_ && preferredSize.height_ <= viewportSize.height_) {
        this.$outer.buildingsScroll.setVerticalScrollBarPolicy(ScrollPaneConstants.VERTICAL_SCROLLBAR_NEVER);
      } else {
        this.$outer.buildingsScroll.setVerticalScrollBarPolicy(ScrollPaneConstants.VERTICAL_SCROLLBAR_AS_NEEDED);
      }
    }
  }, 'net.sf.freecol.client.gui.panel.ColonyPanel$2', []);
}

let $ColonyPanel$3: any = null;
/** An anonymous class (ColonyPanel.java:485). */
function ColonyPanel$3(): any {
  return $ColonyPanel$3 ??= $J.local(class extends AbstractAction {
    actionPerformed(ae: ActionEvent): void {
      this.$outer.okButton.doClick$();
    }
  }, 'net.sf.freecol.client.gui.panel.ColonyPanel$3', []);
}

let $ColonyPanel$4: any = null;
/** An anonymous class (ColonyPanel.java:729). */
function ColonyPanel$4(): any {
  return $ColonyPanel$4 ??= $J.local(class extends JObject {
    getOpenSpace(c: Component): List<Rectangle> {
      return this.$cv_normalBorder.getOpenSpace(c);
    }
    paintBorder(c: Component, g: Graphics, x: number, y: number, width: number, height: number): void {
      if (this.$outer.colonyTitleImage == null) {
        this.$outer.colonyTitleImage = this.$outer.getImageLibrary().createColonyTitleImage((g), this.$outer.colony.getName(), this.$outer.getColony().getOwner(), true);
      }
      let borderOverlapY = this.$outer.getImageLibrary().scaleInt(6);
      let imageY = (this.$cv_normalBorder.getTopLeftCornerInsetY() - this.$outer.colonyTitleImage.getHeight() + borderOverlapY) | 0;
      let paddingX = this.$outer.getImageLibrary().scaleInt(23);
      g.drawImage$Image$int$int$ImageObserver(this.$outer.colonyTitleImage, paddingX, imageY, null);
      this.$cv_normalBorder.paintBorder(c, g, x, y, width, height);
    }
    getBorderInsets$Component(c: Component): Insets {
      return this.$cv_normalBorder.getBorderInsets$Component(c);
    }
    isBorderOpaque(): boolean {
      return this.$cv_normalBorder.isBorderOpaque();
    }
    $c($normalBorder): this {
      this.$cv_normalBorder = $normalBorder;
      return this;
    }
  }, 'net.sf.freecol.client.gui.panel.ColonyPanel$4', ['net.sf.freecol.client.gui.panel.FreeColBorder']);
}

let $ColonyPanel$5: any = null;
/** An anonymous class (ColonyPanel.java:843). */
function ColonyPanel$5(): any {
  return $ColonyPanel$5 ??= $J.local(class extends JPanel {
    $init_anon() {
      this.setToolTipText(' ');
      return this;
    }
    createToolTip(): JToolTip {
      let toolTip = new RebelToolTip()._RebelToolTip(this.$outer.getFreeColClient(), this.$outer.getColony());
      return toolTip;
    }
  }, 'net.sf.freecol.client.gui.panel.ColonyPanel$5', []);
}

let $ColonyPanel$BuildingsPanel$1: any = null;
/** An anonymous class (ColonyPanel.java:2103). */
function ColonyPanel$BuildingsPanel$1(): any {
  return $ColonyPanel$BuildingsPanel$1 ??= $J.local(class extends MouseAdapter {
    mousePressed(e: MouseEvent): void {
      this.$outer.$outer.getGUI().showBuildQueuePanel(this.$outer.$outer.getColony());
    }
  }, 'net.sf.freecol.client.gui.panel.ColonyPanel$BuildingsPanel$1', []);
}

$J.define(ColonyPanel, 'net.sf.freecol.client.gui.panel.ColonyPanel', { kind: 'class', ifaces: ['java.beans.PropertyChangeListener'], sup: 'net.sf.freecol.client.gui.panel.PortPanel', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.common.model.Colony': '_ColonyPanel' }, returns: { 'getUnitList': 'java.util.List', 'getWarehousePanel': 'net.sf.freecol.client.gui.panel.ColonyPanel$WarehousePanel', 'getTilesPanel': 'net.sf.freecol.client.gui.panel.ColonyPanel$TilesPanel', 'getColony': 'net.sf.freecol.common.model.Colony', 'getTilesPanelGuiScaledDimension': 'java.awt.Dimension', 'isFullscreen': 'boolean', 'getFrameBorder': 'javax.swing.border.Border' }, meths: { 'update()': 'update$' }, clinit: true, lazy: ['logger'] });
$J.define(ColonyPanel$ColonyCargoPanel, 'net.sf.freecol.client.gui.panel.ColonyPanel$ColonyCargoPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.CargoPanel', ctors: { 'net.sf.freecol.client.FreeColClient': '_ColonyPanel$ColonyCargoPanel' }, meths: { 'update()': 'update$' }, inner: true });
$J.define(ColonyPanel$PopulationPanel, 'net.sf.freecol.client.gui.panel.ColonyPanel$PopulationPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.MigPanel', ctors: { '': '_ColonyPanel$PopulationPanel' }, meths: { 'update()': 'update$' }, inner: true });
$J.define(ColonyPanel$OutsideColonyPanel, 'net.sf.freecol.client.gui.panel.ColonyPanel$OutsideColonyPanel', { kind: 'class', ifaces: ['net.sf.freecol.client.gui.panel.DropTarget'], sup: 'net.sf.freecol.client.gui.panel.UnitPanel', ctors: { '': '_ColonyPanel$OutsideColonyPanel' }, meths: { 'add(java.awt.Component,boolean)': 'add$Component$boolean', 'accepts(net.sf.freecol.common.model.Unit)': 'accepts$Unit', 'accepts(net.sf.freecol.common.model.GoodsType)': 'accepts$GoodsType', 'accepts(net.sf.freecol.common.model.Goods)': 'accepts$Goods' }, inner: true });
$J.define(ColonyPanel$ColonyInPortPanel, 'net.sf.freecol.client.gui.panel.ColonyPanel$ColonyInPortPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.InPortPanel', ctors: { '': '_ColonyPanel$ColonyInPortPanel' }, meths: { 'accepts(net.sf.freecol.common.model.Unit)': 'accepts$Unit' }, inner: true });
$J.define(ColonyPanel$WarehousePanel, 'net.sf.freecol.client.gui.panel.ColonyPanel$WarehousePanel', { kind: 'class', ifaces: ['net.sf.freecol.client.gui.panel.DropTarget', 'java.beans.PropertyChangeListener'], sup: 'net.sf.freecol.client.gui.panel.MigPanel', ctors: { '': '_ColonyPanel$WarehousePanel' }, meths: { 'add(java.awt.Component,boolean)': 'add$Component$boolean', 'accepts(net.sf.freecol.common.model.Unit)': 'accepts$Unit', 'accepts(net.sf.freecol.common.model.GoodsType)': 'accepts$GoodsType', 'accepts(net.sf.freecol.common.model.Goods)': 'accepts$Goods', 'update()': 'update$' }, inner: true });
$J.define(ColonyPanel$BuildingsPanel, 'net.sf.freecol.client.gui.panel.ColonyPanel$BuildingsPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.MigPanel', ctors: { '': '_ColonyPanel$BuildingsPanel' }, meths: { 'update()': 'update$' }, inner: true });
$J.define(ColonyPanel$BuildingsPanel$ASingleBuildingPanel, 'net.sf.freecol.client.gui.panel.ColonyPanel$BuildingsPanel$ASingleBuildingPanel', { kind: 'class', ifaces: ['net.sf.freecol.client.gui.panel.DropTarget'], sup: 'net.sf.freecol.client.gui.panel.BuildingPanel', ctors: { 'net.sf.freecol.common.model.Building': '_ColonyPanel$BuildingsPanel$ASingleBuildingPanel' }, meths: { 'add(java.awt.Component,boolean)': 'add$Component$boolean', 'accepts(net.sf.freecol.common.model.Unit)': 'accepts$Unit', 'accepts(net.sf.freecol.common.model.GoodsType)': 'accepts$GoodsType', 'accepts(net.sf.freecol.common.model.Goods)': 'accepts$Goods', 'update()': 'update$' }, inner: true });
$J.define(ColonyPanel$BuildingsPanel$EmptyBuildingSite, 'net.sf.freecol.client.gui.panel.ColonyPanel$BuildingsPanel$EmptyBuildingSite', { kind: 'class', sup: 'javax.swing.JPanel', ctors: { '': '_ColonyPanel$BuildingsPanel$EmptyBuildingSite' }, inner: true });
$J.define(ColonyPanel$TilesPanel, 'net.sf.freecol.client.gui.panel.ColonyPanel$TilesPanel', { kind: 'class', sup: 'javax.swing.JPanel', ctors: { '': '_ColonyPanel$TilesPanel' }, meths: { 'update()': 'update$' }, inner: true });
$J.define(ColonyPanel$TilesPanel$ASingleTilePanel, 'net.sf.freecol.client.gui.panel.ColonyPanel$TilesPanel$ASingleTilePanel', { kind: 'class', ifaces: ['net.sf.freecol.client.gui.panel.DropTarget', 'java.beans.PropertyChangeListener'], sup: 'javax.swing.JPanel', ctors: { 'net.sf.freecol.common.model.ColonyTile,int,int': '_ColonyPanel$TilesPanel$ASingleTilePanel' }, returns: { 'getColonyTile': 'net.sf.freecol.common.model.ColonyTile' }, meths: { 'contains(int,int)': 'contains$int$int', 'add(java.awt.Component,boolean)': 'add$Component$boolean', 'accepts(net.sf.freecol.common.model.Unit)': 'accepts$Unit', 'update()': 'update$' }, inner: true });
$J.module(() => {
  BasicStroke = $J.load('java.awt.BasicStroke');
  BorderLayout = $J.load('java.awt.BorderLayout');
  Color = $J.load('java.awt.Color');
  Dimension = $J.load('java.awt.Dimension');
  FlowLayout = $J.load('java.awt.FlowLayout');
  GridLayout = $J.load('java.awt.GridLayout');
  RenderingHints = $J.load('java.awt.RenderingHints');
  ComponentAdapter = $J.load('java.awt.event.ComponentAdapter');
  KeyEvent = $J.load('java.awt.event.KeyEvent');
  MouseAdapter = $J.load('java.awt.event.MouseAdapter');
  AbstractAction = $J.load('javax.swing.AbstractAction');
  BorderFactory = $J.load('javax.swing.BorderFactory');
  ComponentInputMap = $J.load('javax.swing.ComponentInputMap');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JComboBox = $J.load('javax.swing.JComboBox');
  JComponent = $J.load('javax.swing.JComponent');
  JLabel = $J.load('javax.swing.JLabel');
  JMenuItem = $J.load('javax.swing.JMenuItem');
  JPopupMenu = $J.load('javax.swing.JPopupMenu');
  JPopupMenu$Separator = $J.load('javax.swing.JPopupMenu$Separator');
  JScrollPane = $J.load('javax.swing.JScrollPane');
  KeyStroke = $J.load('javax.swing.KeyStroke');
  ScrollPaneConstants = $J.load('javax.swing.ScrollPaneConstants');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  ClientOptions = $J.load('net.sf.freecol.client.ClientOptions');
  FontLibrary = $J.load('net.sf.freecol.client.gui.FontLibrary');
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  GoodsLabel = $J.load('net.sf.freecol.client.gui.label.GoodsLabel');
  ProductionLabel = $J.load('net.sf.freecol.client.gui.label.ProductionLabel');
  UnitLabel = $J.load('net.sf.freecol.client.gui.label.UnitLabel');
  BuildingsLayoutManager = $J.load('net.sf.freecol.client.gui.panel.BuildingsLayoutManager');
  ConstructionPanel = $J.load('net.sf.freecol.client.gui.panel.ConstructionPanel');
  DefaultTransferHandler = $J.load('net.sf.freecol.client.gui.panel.DefaultTransferHandler');
  DragListener = $J.load('net.sf.freecol.client.gui.panel.DragListener');
  DropListener = $J.load('net.sf.freecol.client.gui.panel.DropListener');
  FreeColButton = $J.load('net.sf.freecol.client.gui.panel.FreeColButton');
  FreeColButton$ButtonStyle = $J.load('net.sf.freecol.client.gui.panel.FreeColButton$ButtonStyle');
  FreeColImageBorder = $J.load('net.sf.freecol.client.gui.panel.FreeColImageBorder');
  FreeColPanel = $J.load('net.sf.freecol.client.gui.panel.FreeColPanel');
  QuickActionMenu = $J.load('net.sf.freecol.client.gui.panel.QuickActionMenu');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  WrapLayout = $J.load('net.sf.freecol.client.gui.panel.WrapLayout');
  WrapLayout$HorizontalGap = $J.load('net.sf.freecol.client.gui.panel.WrapLayout$HorizontalGap');
  WrapLayout$LayoutStyle = $J.load('net.sf.freecol.client.gui.panel.WrapLayout$LayoutStyle');
  RebelToolTip = $J.load('net.sf.freecol.client.gui.tooltip.RebelToolTip');
  DebugUtils = $J.load('net.sf.freecol.common.debug.DebugUtils');
  FreeColDebugger = $J.load('net.sf.freecol.common.debug.FreeColDebugger');
  FreeColDebugger$DebugMode = $J.load('net.sf.freecol.common.debug.FreeColDebugger$DebugMode');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  AbstractGoods = $J.load('net.sf.freecol.common.model.AbstractGoods');
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  Colony$ColonyChangeEvent = $J.load('net.sf.freecol.common.model.Colony$ColonyChangeEvent');
  Direction = $J.load('net.sf.freecol.common.model.Direction');
  Goods = $J.load('net.sf.freecol.common.model.Goods');
  Player$NoClaimReason = $J.load('net.sf.freecol.common.model.Player$NoClaimReason');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  Tile = $J.load('net.sf.freecol.common.model.Tile');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Unit$UnitLabelType = $J.load('net.sf.freecol.common.model.Unit$UnitLabelType');
  UnitLocation$NoAddReason = $J.load('net.sf.freecol.common.model.UnitLocation$NoAddReason');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  ImageUtils = $J.load('net.sf.freecol.common.util.ImageUtils');
});
