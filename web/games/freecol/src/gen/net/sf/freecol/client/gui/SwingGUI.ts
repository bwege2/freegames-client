// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/SwingGUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collectors, Exception, JEnum, JObject, JString, Level, List, RuntimeException } from '../../../../../../jre/index.ts';
import { GUI } from './GUI.ts';

let Point, SwingUtilities, PlatformDefaults, UnitValue, FreeCol, ClientOptions, Canvas, FontLibrary, GUI$ViewMode, ImageLibrary, TilePopup, Widgets, Animations, ClientOptionsDialog, GUIMessage, MapViewer, TileViewer, ColonyPanel, CornerMapControls, FreeColImageBorder, InformationPanel, MapEditorToolboxPanel, MapEditorTransformPanel, PurchasePanel, RecruitPanel, StartGamePanel, StatusPanel, TradeRouteInputPanel, TrainPanel, Utility, FreeColLookAndFeel, FreeColToolTipUI, FreeColException, MemoryManager, DebugUtils, FreeColDebugger, Messages, FreeColDataFile, Colony, Direction, Europe, IndianSettlement, Location, StringTemplate, Tile, Unit, WorkLocation, LanguageOption, ImageCache, ImageResource, ResourceManager, CollectionUtils, Introspector, StringUtils, Utils;

/**
 * A wrapper providing functionality for the overall GUI using Java Swing.
 */
export class SwingGUI extends GUI {
  /**
   * European subpanel classes.
   */
  static EUROPE_CLASSES: List<JClass<FreeColPanel>> = null;
  /**
   * Number of pixels that must be moved before a goto is enabled.
   */
  static readonly DRAG_THRESHOLD: number = 16;
  /**
   * The graphics device to display to.
   */
  graphicsDevice: GraphicsDevice = null;
  /**
   * A persistent image cache.
   */
  imageCache: ImageCache = null;
  /**
   * The fixed/unscaled image library used by panels et al.
   */
  fixedImageLibrary: ImageLibrary = null;
  /**
   * The scaled image library used by the map.
   */
  scaledImageLibrary: ImageLibrary = null;
  /**
   * This is the TileViewer instance used for tiles in panels.
   * It uses the fixed ImageLibrary.
   */
  tileViewer: TileViewer = null;
  /**
   * The MapViewer instance used by canvas to paint the main map.
   * This does need to be scaled.
   */
  mapViewer: MapViewer = null;
  /**
   * The various sorts of map controls.
   */
  mapControls: MapControls = null;
  /**
   * The canvas that implements much of the functionality.
   */
  canvas: Canvas = null;
  /**
   * The widgets wrapper that handles specific panels and dialogs.
   */
  widgets: Widgets = null;
  /**
   * Where the map was drag-clicked.
   */
  dragPoint: Point = null;
  /**
   * Has a goto operation started?
   */
  gotoStarted: boolean = false;
  /**
   * Create the GUI.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _SwingGUI(freeColClient: FreeColClient): this {
    this._GUI(freeColClient);
    this.gotoStarted = false;
    this.graphicsDevice = Utils.getGoodGraphicsDevice();
    if (this.graphicsDevice == null) {
      FreeCol.fatal$Logger$String(GUI.logger, 'Could not find a GraphicsDevice!');
    }
    let scaleFactor = this.determineScaleFactorUsingClientOptions(Utils.determineDpi(this.graphicsDevice));
    this.imageCache = new ImageCache()._ImageCache();
    this.scaledImageLibrary = new ImageLibrary()._ImageLibrary$float$ImageCache(this.constrainToMaxMapScale(scaleFactor), this.imageCache);
    this.fixedImageLibrary = new ImageLibrary()._ImageLibrary$float$ImageCache(scaleFactor, this.imageCache);
    this.tileViewer = new TileViewer()._TileViewer(freeColClient, this.fixedImageLibrary);
    this.mapViewer = null;
    this.mapControls = null;
    this.canvas = null;
    this.widgets = null;
    this.dragPoint = null;
    this.configureMigLayout(scaleFactor);
    GUI.logger.info('GUI constructed using scale factor ' + $J.fstr(scaleFactor));
    return this;
  }
  configureMigLayout(scaleFactor: number): void {
    PlatformDefaults.setPlatform(PlatformDefaults.GNOME);
    PlatformDefaults.setHorizontalScaleFactor($J.boxF(scaleFactor));
    PlatformDefaults.setVerticalScaleFactor($J.boxF(scaleFactor));
    PlatformDefaults.setMinimumButtonWidth(new UnitValue()._UnitValue$float$int$String(48, UnitValue.LPX, null));
  }
  /**
   * Perform a single animation.
   *
   * @param a The {@code Animation} to perform.
   * @param unitLabel The unit label to animate.
   */
  animate(a: Animation, unitLabel: JLabel): void {
    let tiles = a.getTiles();
    let bounds = null;
    for (const $it0 = tiles.iterator(); $it0.hasNext(); ) {
      let t = $it0.next();
      let r = this.mapViewer.getMapViewerBounds().calculateDrawnTileBounds(t);
      bounds = (bounds == null) ? r : bounds.union(r);
    }
    let can = this.canvas;
    let aBounds = bounds;
    let painter = new (SwingGUI$1())().$o(this).$c(can, aBounds);
    a.executeWithLabel(unitLabel, painter);
  }
  /**
   * Perform some animations.
   *
   * @param animations The {@code Animation}s to perform.
   */
  animations(animations: List<Animation>): void {
    if (animations.isEmpty()) {
      return;
    }
    let center = this.getClientOptions().getBoolean(ClientOptions.ALWAYS_CENTER);
    let first = animations.get(0).getTiles().get(0);
    if (center && first !== this.getFocus()) {
      this.mapViewer.getMapViewerBounds().setFocus(first);
    }
    this.invokeNowOrWait(() => {
      let originalFocus = this.mapViewer.getMapViewerState().getActiveUnit() != null ? this.mapViewer.getMapViewerBounds().getFocus() : null;
      let allTiles = animations.stream().map((a) => a.getTiles()).flatMap(($p0) => $p0.stream()).collect(Collectors.toList());
      for (const $it1 = allTiles.iterator(); $it1.hasNext(); ) {
        let t = $it1.next();
        if (!this.mapViewer.getMapViewerBounds().onScreen(t)) {
          this.mapViewer.getMapViewerBounds().setFocus(t);
          break;
        }
      }
      let animatedUnitLabels = new ArrayList();
      try {
        animatedUnitLabels.addAll(this.prepareUnitLabelsForAnimation(animations));
        this.mapViewer.getMapViewerRepaintManager().markAsDirty$();
        this.paintImmediately();
        for (let i = 0; i < animations.size(); i++) {
          this.animate(animations.get(i), animatedUnitLabels.get(i));
        }
      } finally {
        if (originalFocus != null && this.mapViewer.getMapViewerBounds().setFocus(originalFocus)) {
          this.repaint();
        }
        for (let i = 0; i < animations.size(); i++) {
          let unit = animations.get(i).getUnit();
          let unitLabel = animatedUnitLabels.get(i);
          this.releaseUnitOutForAnimation(unit, unitLabel);
        }
      }
    });
  }
  releaseUnitOutForAnimation(unit: Unit, unitLabel: JLabel): void {
    this.mapViewer.getMapViewerState().getUnitAnimator().releaseUnitOutForAnimation(unit);
    if (!this.mapViewer.getMapViewerState().getUnitAnimator().isOutForAnimation(unit)) {
      this.canvas.animationLabel(unitLabel, false);
      this.mapViewer.getMapViewerRepaintManager().markAsDirty$();
      this.repaint();
    }
  }
  prepareUnitLabelsForAnimation(animations: List<Animation>): List<JLabel> {
    let animatedUnitLabels = new ArrayList();
    for (const $it2 = animations.iterator(); $it2.hasNext(); ) {
      let a = $it2.next();
      let unit = a.getUnit();
      let newLabel = !this.mapViewer.getMapViewerState().getUnitAnimator().isOutForAnimation(unit);
      let unitLabel = this.mapViewer.getMapViewerState().getUnitAnimator().enterUnitOutForAnimation(unit);
      animatedUnitLabels.add(unitLabel);
      let points = CollectionUtils.transform$Collection$Predicate$Function(a.getTiles(), CollectionUtils.alwaysTrue(), (t) => this.mapViewer.getMapViewerState().getUnitAnimator().getAnimationPosition(unitLabel, t));
      a.setPoints(points);
      unitLabel.setLocation$Point(points.get(0));
      if (newLabel) {
        this.canvas.animationLabel(unitLabel, true);
      }
    }
    return animatedUnitLabels;
  }
  /**
   * Gets the point at which the map was clicked for a drag.
   *
   * @return The Point where the mouse was initially clicked.
   */
  getDragPoint(): Point {
    return this.dragPoint;
  }
  /**
   * Sets the point at which the map was clicked for a drag.
   *
   * @param x The mouse x position.
   * @param y The mouse y position.
   */
  setDragPoint(x: number, y: number): void {
    this.dragPoint = new Point()._Point$int$int(x, y);
  }
  clearDrag(): void {
    this.dragPoint = null;
  }
  /**
   * Is mouse movement differnce above the drag threshold?
   *
   * @param x The new mouse x position.
   * @param y The new mouse y position.
   * @return True if the mouse has been dragged.
   */
  isDrag(x: number, y: number): boolean {
    let drag = this.getDragPoint();
    if (drag == null) {
      return false;
    }
    let deltaX = Math.abs((x - drag.x_) | 0);
    let deltaY = Math.abs((y - drag.y_) | 0);
    return deltaX >= SwingGUI.DRAG_THRESHOLD || deltaY >= SwingGUI.DRAG_THRESHOLD;
  }
  /**
   * Change the view mode.
   *
   * Always stop the blinking cursor if leaving MOVE_UNITS mode,
   * but leave turning it on to changeActiveUnit, as there is no
   * point enabling it if the active unit is null.     
   *
   * @param newViewMode The new {@code ViewMode}.
   * @return True if the view mode changed.
   */
  changeViewMode(newViewMode: GUI$ViewMode): boolean {
    let oldViewMode = this.getViewMode();
    if (newViewMode === oldViewMode) {
      return false;
    }
    this.mapViewer.getMapViewerState().setViewMode(newViewMode);
    return true;
  }
  /**
   * Change the active unit.
   *
   * If the unit changes, cancel any current gotos.
   *
   * @param newUnit The new active {@code Unit}.
   * @return True if the active unit changed.
   */
  changeActiveUnit(newUnit: Unit): boolean {
    let oldUnit = this.getActiveUnit();
    if (newUnit != null && newUnit.hasTile() && !this.mapViewer.getMapViewerBounds().onScreen(newUnit.getTile$())) {
      this.mapViewer.getMapViewerBounds().setFocus(newUnit.getTile$());
      this.mapViewer.getMapViewerRepaintManager().markAsDirty$Tile(newUnit.getTile$());
      if (this.mapControls != null) {
        this.mapControls.updateMinimap();
      }
      this.repaint();
    }
    if (newUnit === oldUnit) {
      return false;
    }
    this.mapViewer.getMapViewerState().setActiveUnit(newUnit);
    this.clearGotoPath();
    return true;
  }
  /**
   * {@inheritDoc}
   */
  setRangedAttackMode(rangedAttackMode: boolean): void {
    let mvs = this.mapViewer.getMapViewerState();
    if (mvs.isRangedAttackMode() === rangedAttackMode) {
      return;
    }
    mvs.setRangedAttackMode(rangedAttackMode);
    this.refresh();
  }
  /**
   * {@inheritDoc}
   */
  toggleRangedAttackMode(): void {
    this.setRangedAttackMode(!this.mapViewer.getMapViewerState().isRangedAttackMode());
  }
  /**
   * Change the selected tile.
   *
   * Also moves the focus tile to the selected tile if it differs
   * and either is not on screen, or with the focus override.
   *
   * When the selected tile moves, the cursor needs to be redrawn, so
   * a refresh of the old (if any) and new (if any) tile occurs.
   *
   * @param newTile The new {@code Tile} to select.
   * @param refocus If true force a refocus on all tile changes.
   * @return True if the tile was changed.
   */
  changeSelectedTile(newTile: Tile, refocus: boolean): boolean {
    let oldTile = this.getSelectedTile();
    let oldFocus = this.getFocus();
    refocus = newTile != null && newTile !== oldFocus && (oldFocus == null || refocus || !this.mapViewer.getMapViewerBounds().onScreen(newTile));
    if (refocus) {
      this.setFocus(newTile);
    }
    if (newTile === oldTile) {
      return false;
    }
    this.mapViewer.getMapViewerState().setSelectedTile(newTile);
    if (oldTile != null) {
      this.refreshTile(oldTile);
    }
    if (newTile != null) {
      this.refreshTile(newTile);
    }
    return true;
  }
  /**
   * Finish a view mode change.
   *
   * @param update Update the map controls if true.
   */
  changeDone(update: boolean): void {
    let cursorShouldBlink = this.getViewMode() === GUI$ViewMode.MOVE_UNITS && this.getActiveUnit() != null;
    this.mapViewer.getMapViewerState().setCursorBlinking(cursorShouldBlink);
    if (update) {
      this.updateMapControls();
      let activeUnit = this.getActiveUnit();
      if (activeUnit != null) {
        this.refreshTile(activeUnit.getTile$());
      }
    }
    this.updateMenuBar();
  }
  /**
   * Get the map scale.
   *
   * Used by:
   *
   * @return The scale for the (rescalable) map.
   */
  getMapScale(): number {
    let lib = this.scaledImageLibrary;
    return (lib == null) ? 1 : lib.getScaleFactor();
  }
  /**
   * Get a rough position to place a dialog given a tile which we wish
   * to remain visible.
   *
   * @param tile The {@code Tile} to expose.
   * @return A suitable {@code PopupPosition}.
   */
  getPopupPosition(tile: Tile): SwingGUI$PopupPosition {
    if (tile == null) {
      return SwingGUI$PopupPosition.CENTERED;
    }
    let where = this.mapViewer.getMapViewerBounds().setOffsetFocus(tile);
    this.repaint();
    return (where > 0) ? SwingGUI$PopupPosition.CENTERED_LEFT : (where < 0) ? SwingGUI$PopupPosition.CENTERED_RIGHT : SwingGUI$PopupPosition.CENTERED;
  }
  /**
   * Update the path for the active unit.
   */
  updateUnitPath(): void {
    let active = this.getActiveUnit();
    if (active == null) {
      this.setUnitPath(null);
      return;
    }
    let destination = active.getDestination();
    let path = null;
    if (destination != null && !(destination).isDisposed() && !active.isAtLocation(destination)) {
      try {
        path = active.findPath$Location(destination);
      } catch ($e3) {
        if ($J.isa($e3, Exception)) {
          let e = $J.exc($e3);
          GUI.logger.log(Level.WARNING, 'Path fail', e);
          active.setDestination(null);
        } else {
          throw $e3;
        }
      }
    }
    this.setUnitPath(path);
  }
  /**
   * Starts a goto operation.
   */
  startGoto(): void {
    this.gotoStarted = true;
    this.canvas.setCursor$Cursor(Canvas.GO_CURSOR);
    if (this.mapViewer.getMapViewerState().changeGotoPath(null)) {
      this.repaint();
    }
  }
  /**
   * Stops any ongoing goto operation.
   *
   * @return The old goto path if any.
   */
  stopGoto(): PathNode {
    let ret = (this.gotoStarted) ? this.mapViewer.getMapViewerState().getGotoPath() : null;
    this.gotoStarted = false;
    this.canvas.setCursor$Cursor(null);
    if (this.mapViewer.getMapViewerState().changeGotoPath(null)) {
      this.repaint();
    }
    return ret;
  }
  /**
   * Update the current goto to a given tile.
   *
   * @param tile The new goto {@code Tile}.
   */
  updateGotoTile(tile: Tile): void {
    let unit = this.getActiveUnit();
    if (tile == null || unit == null) {
      this.clearGotoPath();
    } else if (this.isGotoStarted()) {
      let oldPath = this.mapViewer.getMapViewerState().getGotoPath();
      let lastTile = (oldPath == null) ? null : oldPath.getLastNode().getTile();
      if (lastTile === tile) {
        return;
      }
      let newPath = (unit.getTile$() === tile || !tile.isExplored() || !unit.getSimpleMoveType$Tile(tile).isLegal()) ? null : unit.findPath$Location(tile);
      if (this.mapViewer.getMapViewerState().changeGotoPath(newPath)) {
        this.repaint();
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  paintImmediately(): void {
    this.canvas.paintImmediately$Rectangle(this.canvas.getBounds$());
  }
  /**
   * {@inheritDoc}
   */
  useMapAsyncPainter(): MapAsyncPainter {
    this.canvas.updateRepaintTimer(true);
    return this.mapViewer.useMapAsyncPainter();
  }
  /**
   * {@inheritDoc}
   */
  stopMapAsyncPainter(): void {
    this.canvas.updateRepaintTimer(false);
    this.mapViewer.stopMapAsyncPainter();
  }
  /**
   * Schedule a tile to be repainted.
   *
   * @param tile The {@code tile} to paint.
   */
  refreshTile(tile: Tile): void {
    if (tile != null) {
      this.mapViewer.getMapViewerRepaintManager().markAsDirty$Tile(tile);
      if (tile.hasSettlement()) {
        this.mapViewer.getMapViewerRepaintManager().markAsDirty$Collection(tile.getSurroundingTiles$int$int(1, 1));
      }
      if (this.mapControls != null) {
        this.mapControls.updateMinimap();
      }
      this.canvas.repaint$();
    }
  }
  /**
   * Reset the map zoom and refresh the canvas.
   */
  resetMapZoom(): void {
    if (this.scaledImageLibrary.getScaleFactor() !== this.constrainToMaxMapScale(this.fixedImageLibrary.getScaleFactor())) {
      this.changeMapScale(this.fixedImageLibrary.getScaleFactor());
    }
  }
  /**
   * {@inheritDoc}
   */
  getFixedImageLibrary(): ImageLibrary {
    return this.fixedImageLibrary;
  }
  /**
   * {@inheritDoc}
   */
  getScaledImageLibrary(): ImageLibrary {
    return this.scaledImageLibrary;
  }
  /**
   * {@inheritDoc}
   */
  isWindowed(): boolean {
    return this.canvas.isWindowed();
  }
  /**
   * {@inheritDoc}
   */
  invokeNowOrLater(runnable: Runnable): void {
    if (SwingUtilities.isEventDispatchThread()) {
      runnable();
    } else {
      SwingUtilities.invokeLater(runnable);
    }
  }
  /**
   * {@inheritDoc}
   */
  invokeNowOrWait(runnable: Runnable): void {
    if (SwingUtilities.isEventDispatchThread()) {
      runnable();
    } else {
      try {
        SwingUtilities.invokeAndWait(runnable);
      } catch ($e4) {
        if ($J.isa($e4, Exception)) {
          let ex = $J.exc($e4);
          GUI.logger.log(Level.WARNING, 'Client GUI interaction', ex);
        } else {
          throw $e4;
        }
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  changeWindowedMode(): void {
    this.canvas.toggleFrame();
  }
  /**
   * {@inheritDoc}
   */
  installLookAndFeel(fontName: string): void {
    let dpi = Utils.determineDpi(this.graphicsDevice);
    let fontSize = this.determineMainFontSizeUsingClientOptions(dpi);
    FontLibrary.setMainFontSize(Math.fround(fontSize));
    FreeColImageBorder.setScaleFactor(this.fixedImageLibrary.getScaleFactor());
    FreeColToolTipUI.setFontScaling(FontLibrary.getFontScaling());
    let fclaf = new FreeColLookAndFeel()._FreeColLookAndFeel();
    FreeColLookAndFeel.install(fclaf);
    let font = FontLibrary.createMainFont(fontName);
    if (font == null) {
      throw new FreeColException()._FreeColException$String('Unable to create main font: ' + fontName);
    }
    FreeColLookAndFeel.setScaleFactor(this.fixedImageLibrary.getScaleFactor());
    FreeColLookAndFeel.installFont(font);
    Utility.initStyleContext(font);
  }
  /**
   * {@inheritDoc}
   */
  quitGUI(): void {
    if (this.canvas != null) {
      this.canvas.quit();
    }
  }
  /**
   * {@inheritDoc}
   */
  reconnectGUI(active: Unit, tile: Tile): void {
    this.canvas.requestFocusInWindow$();
    this.canvas.initializeInGame();
    this.closeMenus();
    this.clearGotoPath();
    this.canvas.resetMenuBar();
    this.resetMapZoom();
    if (active != null) {
      this.changeView$Unit$boolean(active, false);
      if (active.hasTile()) {
        tile = active.getTile$();
      } else if (active.getOwner().getFallbackTile() != null) {
        tile = active.getOwner().getFallbackTile();
        this.changeView$Tile(tile);
      }
    } else if (tile != null) {
      this.changeView$Tile(tile);
    } else {
      this.changeView$Unit$boolean(null, false);
    }
    this.mapViewer.getMapViewerBounds().setFocus(tile);
    this.enableMapControls(false);
    this.enableMapControls(this.getGame() != null && this.getGame().getMap() != null && this.getClientOptions().getBoolean(ClientOptions.DISPLAY_MAP_CONTROLS));
    this.refresh();
  }
  /**
   * {@inheritDoc}
   */
  removeInGameComponents(): void {
    this.changeActiveUnit(null);
    this.changeSelectedTile(null, false);
    this.canvas.removeInGameComponents();
  }
  /**
   * {@inheritDoc}
   */
  showOpeningVideo(userMsg: string, callback: Runnable): void {
    let play = this.getFreeColClient().getSoundController().canPlaySound();
    this.canvas.playVideo('video.opening', !play, callback);
  }
  /**
   * {@inheritDoc}
   */
  startGUI(desiredWindowSize: Dimension): void {
    let fcc = this.getFreeColClient();
    let opts = this.getClientOptions();
    this.mapControls = new CornerMapControls()._CornerMapControls(fcc);
    let al = (ae) => {
      let tile = this.mapViewer.getMapViewerState().getCursorTile();
      if (tile != null) {
      }
    };
    this.mapViewer = new MapViewer()._MapViewer(fcc, this.scaledImageLibrary, al);
    this.canvas = new Canvas()._Canvas(this.getFreeColClient(), this.graphicsDevice, desiredWindowSize, this.mapViewer, this.mapControls);
    this.widgets = new Widgets()._Widgets(fcc, this.canvas);
    opts.getOption$String$Class(ClientOptions.LANGUAGE, $J.cls(LanguageOption)).addPropertyChangeListener$PropertyChangeListener((e) => {
      let language = e.getNewValue();
      GUI.logger.info('Set language to: ' + $J.str(language));
      if (JString.equalsIgnoreCase(Messages.AUTOMATIC, language.getKey())) {
        this.showInformationPanel$String('info.autodetectLanguageSelected');
      } else {
        let l = language.getLocale();
        Messages.loadMessageBundle(l);
        Messages.loadModMessageBundle(l);
        this.showInformationPanel$StringTemplate(StringTemplate.template$String('info.newLanguageSelected').addName$String$String('%language%', l.getDisplayName()));
      }
    });
    this.mapViewer.getMapViewerState().setCursorBlinking(true);
    GUI.logger.info('GUI started.');
  }
  getMapViewDimension(): Dimension {
    return this.canvas.getSize$();
  }
  /**
   * {@inheritDoc}
   */
  startMapEditorGUI(): void {
    this.resetMapZoom();
    this.mapViewer.getMapViewerState().setActiveUnit(null);
    this.canvas.startMapEditorGUI();
    this.enableEditorToolboxPanel(this.getGame() != null && this.getGame().getMap() != null);
    this.enableEditorTransformPanel(this.getGame() != null && this.getGame().getMap() != null);
    this.enableMapControls(this.getGame() != null && this.getGame().getMap() != null && this.getClientOptions().getBoolean(ClientOptions.DISPLAY_MAP_CONTROLS));
    this.updateMenuBar();
  }
  /**
   * {@inheritDoc}
   */
  enableEditorToolboxPanel(shouldDisplayPanel: boolean): void {
    let panel = this.canvas.getExistingFreeColPanel($J.cls(MapEditorToolboxPanel));
    if (shouldDisplayPanel && panel == null) {
      this.canvas.showMapEditorToolboxPanel();
    } else if (!shouldDisplayPanel && panel != null) {
      this.canvas.removeFromCanvas(panel);
    }
  }
  /**
   * {@inheritDoc}
   */
  isShowingMapEditorToolboxPanel(): boolean {
    return this.canvas.isAddedAsPanelFrameOrIcon$Class($J.cls(MapEditorToolboxPanel));
  }
  /**
   * {@inheritDoc}
   */
  enableEditorTransformPanel(shouldDisplayPanel: boolean): void {
    let panel = this.canvas.getExistingFreeColPanel($J.cls(MapEditorTransformPanel));
    if (shouldDisplayPanel && panel == null) {
      this.canvas.showMapEditorTransformPanel();
    } else if (!shouldDisplayPanel && panel != null) {
      this.canvas.removeFromCanvas(panel);
    }
  }
  /**
   * {@inheritDoc}
   */
  isShowingMapEditorTransformPanel(): boolean {
    return this.canvas.isAddedAsPanelFrameOrIcon$Class($J.cls(MapEditorTransformPanel));
  }
  /**
   * {@inheritDoc}
   */
  animateUnitAttack(attacker: Unit, defender: Unit, attackerTile: Tile, defenderTile: Tile, success: boolean): void {
    this.animations(Animations.unitAttack(this.getFreeColClient(), attacker, defender, attackerTile, defenderTile, success, this.getMapScale()));
    this.refreshTilesForUnit(attacker, attackerTile, defenderTile);
  }
  /**
   * {@inheritDoc}
   */
  animateUnitMove(unit: Unit, srcTile: Tile, dstTile: Tile): void {
    this.animations(Animations.unitMove(this.getFreeColClient(), unit, srcTile, dstTile, this.getMapScale()));
    this.refreshTilesForUnit(unit, srcTile, dstTile);
  }
  /**
   * Refreshes and repaints the unit and tiles.
   *
   * @param unit The {@code Unit} that may have moved, and which we should
   *      use the line-of-sight for invalidating tiles.
   * @param srcTile The source for the unit.
   * @param dstTile The destination tile for the unit.
   */
  refreshTilesForUnit(unit: Unit, srcTile: Tile, dstTile: Tile): void {
    if (unit != null && srcTile != null) {
      let possibleDirtyTiles = srcTile.getSurroundingTiles$int$int(0, unit.getLineOfSight());
      this.mapViewer.getMapViewerRepaintManager().markAsDirty$Collection(possibleDirtyTiles);
    }
    if (unit != null && dstTile != null) {
      let possibleDirtyTiles = dstTile.getSurroundingTiles$int$int(0, unit.getLineOfSight());
      this.mapViewer.getMapViewerRepaintManager().markAsDirty$Collection(possibleDirtyTiles);
    }
    if (this.mapControls != null) {
      this.mapControls.updateMinimap();
    }
    this.repaint();
  }
  /**
   * {@inheritDoc}
   */
  confirm$Tile$StringTemplate$ImageIcon$String$String(tile: Tile, tmpl: StringTemplate, icon: ImageIcon, okKey: string, cancelKey: string): boolean {
    return this.widgets.confirm(tmpl, icon, okKey, cancelKey, this.getPopupPosition(tile));
  }
  /**
   * {@inheritDoc}
   */
  getChoice$Tile$StringTemplate$ImageIcon$String$List<T>(tile: Tile, tmpl: StringTemplate, icon: ImageIcon, cancelKey: string, choices: List<ChoiceItem<T>>): T {
    return this.widgets.getChoice(tmpl, icon, cancelKey, choices, this.getPopupPosition(tile));
  }
  /**
   * {@inheritDoc}
   */
  getInput(tile: Tile, tmpl: StringTemplate, defaultValue: string, okKey: string, cancelKey: string): string {
    return this.widgets.getInput(tmpl, defaultValue, okKey, cancelKey, this.getPopupPosition(tile));
  }
  /**
   * {@inheritDoc}
   */
  getFocus(): Tile {
    return this.mapViewer.getMapViewerBounds().getFocus();
  }
  /**
   * {@inheritDoc}
   */
  getFocusMapPoint(): Point {
    return this.mapViewer.getMapViewerBounds().getFocusMapPoint();
  }
  /**
   * {@inheritDoc}
   */
  setFocus(tileToFocus: Tile): void {
    this.mapViewer.getMapViewerBounds().setFocus(tileToFocus);
    this.repaint();
  }
  /**
   * {@inheritDoc}
   */
  setFocusMapPoint(pointToFocus: Point): void {
    this.mapViewer.getMapViewerBounds().setFocusMapPoint(pointToFocus);
    this.repaint();
  }
  /**
   * {@inheritDoc}
   */
  canZoomInMapControls(): boolean {
    if (this.mapControls == null) {
      return false;
    }
    return this.mapControls.canZoomInMapControls();
  }
  /**
   * {@inheritDoc}
   */
  canZoomOutMapControls(): boolean {
    if (this.mapControls == null) {
      return false;
    }
    return this.mapControls.canZoomOutMapControls();
  }
  /**
   * {@inheritDoc}
   */
  enableMapControls(enable: boolean): void {
    if (this.mapControls == null) {
      return;
    }
    if (enable) {
      this.updateMapControls();
      this.canvas.addMapControls();
    } else {
      this.canvas.removeMapControls();
    }
  }
  /**
   * {@inheritDoc}
   */
  miniMapToggleViewControls(): void {
    if (this.mapControls == null) {
      return;
    }
    this.getFreeColClient().toggleClientOption(ClientOptions.MINIMAP_TOGGLE_BORDERS);
    this.mapControls.updateMinimap();
  }
  /**
   * {@inheritDoc}
   */
  miniMapToggleFogOfWarControls(): void {
    if (this.mapControls == null) {
      return;
    }
    this.getFreeColClient().toggleClientOption(ClientOptions.MINIMAP_TOGGLE_FOG_OF_WAR);
    this.mapControls.updateMinimap();
  }
  /**
   * {@inheritDoc}
   */
  updateMapControls(): void {
    if (this.mapControls == null) {
      return;
    }
    this.mapControls.update(this.getViewMode(), this.getActiveUnit(), this.getSelectedTile());
  }
  /**
   * {@inheritDoc}
   */
  zoomInMapControls(): void {
    if (this.mapControls == null) {
      return;
    }
    this.mapControls.zoomIn();
  }
  /**
   * {@inheritDoc}
   */
  zoomOutMapControls(): void {
    if (this.mapControls == null) {
      return;
    }
    this.mapControls.zoomOut();
  }
  /**
   * {@inheritDoc}
   */
  closeMenus(): void {
    this.canvas.closeMenus();
  }
  /**
   * {@inheritDoc}
   */
  resetMenuBar(): void {
    this.canvas.resetMenuBar();
  }
  /**
   * {@inheritDoc}
   */
  updateMenuBar(): void {
    this.canvas.updateMenuBar();
  }
  /**
   * {@inheritDoc}
   */
  showPopupMenu(menu: JPopupMenu, x: number, y: number): void {
    menu.show$Component$int$int(this.canvas, x, y);
  }
  /**
   * {@inheritDoc}
   */
  setUnitPath(path: PathNode): void {
    this.mapViewer.getMapViewerState().setUnitPath(path);
  }
  /**
   * {@inheritDoc}
   */
  activateGotoPath(): void {
    let unit = this.getActiveUnit();
    if (unit == null) {
      return;
    }
    if (this.isGotoStarted()) {
      this.clearGotoPath();
    } else {
      this.startGoto();
      let pt = this.canvas.getMousePosition$();
      this.updateGotoTile((pt == null) ? null : this.tileAt(pt.x_, pt.y_));
    }
  }
  /**
   * {@inheritDoc}
   */
  clearGotoPath(): void {
    this.stopGoto();
    this.updateUnitPath();
    this.repaint();
  }
  /**
   * {@inheritDoc}
   */
  isGotoStarted(): boolean {
    return this.gotoStarted;
  }
  /**
   * {@inheritDoc}
   */
  performGoto$Tile(tile: Tile): void {
    if (this.isGotoStarted()) {
      this.stopGoto();
    }
    let active = this.getActiveUnit();
    if (active != null) {
      if (tile != null && active.getTile$() !== tile) {
        this.startGoto();
        this.updateGotoTile(tile);
        this.traverseGotoPath();
      }
    }
    this.updateUnitPath();
    this.repaint();
  }
  /**
   * {@inheritDoc}
   */
  performGoto$int$int(x: number, y: number): void {
    this.performGoto$Tile(this.tileAt(x, y));
  }
  /**
   * {@inheritDoc}
   */
  traverseGotoPath(): void {
    let unit = this.getActiveUnit();
    if (unit == null || !this.isGotoStarted()) {
      return;
    }
    this.setUnitPath(null);
    let path = this.stopGoto();
    if (path == null) {
      this.igc().clearGotoOrders(unit);
    } else {
      this.igc().goToTile(unit, path);
      this.refresh();
    }
    this.updateUnitPath();
    this.repaint();
  }
  /**
   * {@inheritDoc}
   */
  updateGoto(x: number, y: number, start: boolean): void {
    if (!this.isGotoStarted() && start && this.isDrag(x, y)) {
      this.startGoto();
    }
    if (this.isGotoStarted()) {
      this.updateGotoTile(this.tileAt(x, y));
    }
  }
  /**
   * {@inheritDoc}
   */
  prepareDrag(x: number, y: number): void {
    if (this.isGotoStarted()) {
      this.stopGoto();
      this.repaint();
    }
    let tile = this.tileAt(x, y);
    let dragUnit = this.mapViewer.getMapViewerState().findUnitInFront(tile);
    if (dragUnit == null || !this.getMyPlayer().owns(dragUnit)) {
      this.clearDrag();
      return;
    }
    this.mapViewer.getMapViewerState().setActiveUnit(dragUnit);
    this.updateMapControls();
    this.setDragPoint(x, y);
    this.canvas.requestFocus$();
  }
  /**
   * {@inheritDoc}
   */
  scrollMap(direction: Direction, performRepaints: boolean): boolean {
    if (!performRepaints || this.mapViewer.getMapViewerRepaintManager().isAllDirty() || !this.getClientOptions().isTerrainAnimationsEnabled()) {
      return this.mapViewer.getMapViewerBounds().scrollMap(direction);
    }
    let scrolled = false;
    if (Direction.longSides.contains(direction)) {
      let directions = SwingGUI.toNonDiagonalDirections(direction);
      scrolled = !!(scrolled | this.mapViewer.getMapViewerBounds().scrollMap(directions.get(0)));
      if (scrolled) {
        this.mapViewer.paintImmediatelyToBuffersOnly();
      }
      scrolled = !!(scrolled | this.mapViewer.getMapViewerBounds().scrollMap(directions.get(1)));
    } else {
      scrolled = !!(scrolled | this.mapViewer.getMapViewerBounds().scrollMap(direction));
    }
    if (scrolled) {
      this.paintImmediately();
    }
    return scrolled;
  }
  /**
   * {@inheritDoc}
   */
  resetScrollSpeed(): void {
    this.mapViewer.getMapViewerBounds().resetScrollSpeed();
  }
  static toNonDiagonalDirections(d: Direction): List<Direction> {
    switch (d) {
      case Direction.NE:
        return List.of(Direction.N, Direction.E);
      case Direction.SE:
        return List.of(Direction.S, Direction.E);
      case Direction.NW:
        return List.of(Direction.N, Direction.W);
      case Direction.SW:
        return List.of(Direction.S, Direction.W);
      default:
        return List.of(d);
    }
  }
  /**
   * {@inheritDoc}
   */
  createTileImageWithBeachBorderAndItems(tile: Tile): BufferedImage {
    return this.tileViewer.createTileImageWithBeachBorderAndItems(tile);
  }
  /**
   * {@inheritDoc}
   */
  createTileImage(tile: Tile, player: Player): BufferedImage {
    return this.tileViewer.createTileImage(tile, player);
  }
  /**
   * {@inheritDoc}
   */
  createColonyTileImage(tile: Tile, colony: Colony): BufferedImage {
    return this.tileViewer.createColonyTileImage(tile, colony);
  }
  /**
   * {@inheritDoc}
   */
  displayColonyTiles(g2d: Graphics2D, tiles: Tile[][], colony: Colony): void {
    this.tileViewer.displayColonyTiles(g2d, tiles, colony);
  }
  /**
   * {@inheritDoc}
   */
  getViewMode(): GUI$ViewMode {
    return this.mapViewer.getMapViewerState().getViewMode();
  }
  /**
   * {@inheritDoc}
   */
  getActiveUnit(): Unit {
    return this.mapViewer.getMapViewerState().getActiveUnit();
  }
  /**
   * {@inheritDoc}
   */
  getSelectedTile(): Tile {
    return this.mapViewer.getMapViewerState().getSelectedTile();
  }
  /**
   * {@inheritDoc}
   */
  changeView$Tile(tile: Tile): void {
    let change = this.changeViewMode(GUI$ViewMode.TERRAIN);
    change = !!(change | this.changeSelectedTile(tile, this.getClientOptions().getBoolean(ClientOptions.ALWAYS_CENTER)));
    this.changeDone(change);
  }
  /**
   * {@inheritDoc}
   */
  changeView$Unit$boolean(unit: Unit, force: boolean): void {
    let change = this.changeViewMode(GUI$ViewMode.MOVE_UNITS);
    change = !!(change | this.changeActiveUnit(unit));
    if (unit != null && unit.hasTile() && !force) {
      change = !!(change | this.changeSelectedTile(unit.getTile$(), true));
    }
    this.changeDone(change || force);
  }
  /**
   * {@inheritDoc}
   */
  changeView$MapTransform(mt: MapTransform): void {
    let change = this.changeViewMode(GUI$ViewMode.MAP_TRANSFORM);
    this.changeDone(change);
  }
  /**
   * {@inheritDoc}
   */
  changeView$(): void {
    let change = this.changeViewMode(GUI$ViewMode.END_TURN);
    change = !!(change | this.changeActiveUnit(null));
    change = !!(change | this.changeSelectedTile(null, false));
    this.changeDone(change);
  }
  /**
   * {@inheritDoc}
   */
  canZoomInMap(): boolean {
    return this.scaledImageLibrary.getScaleFactor() < this.getMaxScale();
  }
  /**
   * {@inheritDoc}
   */
  canZoomOutMap(): boolean {
    return this.scaledImageLibrary.getScaleFactor() > ImageLibrary.MIN_SCALE;
  }
  getMaxScale(): number {
    return MemoryManager.isHighQualityGraphicsEnabled() ? ImageLibrary.MAX_SCALE : ImageLibrary.NORMAL_SCALE;
  }
  /**
   * {@inheritDoc}
   */
  zoomInMap(): void {
    let scale = this.scaledImageLibrary.getScaleFactor();
    let newScale = Math.fround(scale + ImageLibrary.SCALE_STEP);
    if (scale < newScale && newScale <= this.getMaxScale()) {
      this.changeMapScale(newScale);
    }
  }
  /**
   * {@inheritDoc}
   */
  zoomOutMap(): void {
    let scale = this.scaledImageLibrary.getScaleFactor();
    let newScale = Math.fround(scale - ImageLibrary.SCALE_STEP);
    if (ImageLibrary.MIN_SCALE <= newScale && newScale < scale) {
      this.changeMapScale(newScale);
    }
  }
  changeMapScale(newScale: number): void {
    newScale = this.constrainToMaxMapScale(newScale);
    this.imageCache.clear();
    if (this.mapViewer != null) {
      this.mapViewer.changeScale(newScale);
    }
    if (this.mapControls != null) {
      this.mapControls.updateMinimap();
    }
    if (this.canvas != null) {
      this.refresh();
    }
  }
  constrainToMaxMapScale(newScale: number): number {
    if (newScale > this.getMaxScale()) {
      newScale = this.getMaxScale();
    }
    return newScale;
  }
  /**
   * {@inheritDoc}
   */
  reloadResources(): void {
    ResourceManager.reload();
    this.imageCache.clear();
    this.refresh();
  }
  prepareResources(): void {
    ResourceManager.prepare();
    this.imageCache.clear();
    this.refresh();
  }
  /**
   * {@inheritDoc}
   */
  emergencyPurge(): void {
    this.imageCache.clear();
    let sc = this.getFreeColClient().getSoundController();
    sc.setDefaultPlaylist(List.of());
    sc.playMusic(null);
  }
  /**
   * {@inheritDoc}
   */
  clickAt(count: number, x: number, y: number): void {
    if (this.mapViewer.getMapViewerState().isRangedAttackMode()) {
      let tile = this.tileAt(x, y);
      let activeUnit = this.mapViewer.getMapViewerState().getActiveUnit();
      if (activeUnit == null || !activeUnit.isOffensiveUnit() || !activeUnit.canAttackRanged(tile) || activeUnit.getMovesLeft() <= 0 || !this.getFreeColClient().currentPlayerIsMyPlayer()) {
        return;
      }
      this.igc().attackRanged(activeUnit, tile);
      return;
    }
    if (count === 1 && this.isDrag(x, y)) {
      return;
    }
    let tile = this.tileAt(x, y);
    if (tile == null) {
      return;
    }
    let other = null;
    if (!tile.isExplored()) {
      this.setFocus(tile);
    } else if (tile.hasSettlement()) {
      let settlement = tile.getSettlement();
      if (settlement instanceof Colony) {
        if (this.getMyPlayer().owns(settlement)) {
          this.showColonyPanel(settlement, null);
        } else {
          DebugUtils.showForeignColony(this.getFreeColClient(), settlement);
        }
      } else if (settlement instanceof IndianSettlement) {
        this.showIndianSettlementPanel(settlement);
      }
    } else if ((other = this.mapViewer.getMapViewerState().findUnitInFront(tile)) != null) {
      if (this.getMyPlayer().owns(other)) {
        let active = this.getActiveUnit();
        if (active != null && active.getTile$() === tile) {
          if (this.getViewMode() !== GUI$ViewMode.MOVE_UNITS) {
            other = active;
          } else {
            let units = tile.getUnitList();
            while (!units.isEmpty()) {
              let u = units.removeAt(0);
              if (u === active) {
                if (!units.isEmpty()) {
                  other = units.removeAt(0);
                }
                break;
              }
            }
          }
        }
        this.changeView$Unit$boolean(other, false);
      } else {
        this.setFocus(tile);
      }
    } else {
      if (count > 1) {
        this.changeView$Tile(tile);
      } else {
        this.setFocus(tile);
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  closePanel(panel: string): void {
    this.canvas.closePanel(panel);
  }
  /**
   * {@inheritDoc}
   */
  closeMainPanel(): void {
    this.canvas.closeMainPanel();
  }
  /**
   * {@inheritDoc}
   */
  closeStatusPanel(): void {
    let panel = this.canvas.getExistingFreeColPanel($J.cls(StatusPanel));
    if (panel != null) {
      this.canvas.removeFromCanvas(panel);
      this.canvas.requestFocusInWindow$();
    }
  }
  /**
   * {@inheritDoc}
   */
  displayChat(sender: string, message: string, color: Color, privateChat: boolean): void {
    this.mapViewer.getMapViewerState().displayChat(new GUIMessage()._GUIMessage(sender + ': ' + message, color));
    this.repaint();
  }
  /**
   * {@inheritDoc}
   */
  displayObject(fco: FreeColObject): void {
    if (fco instanceof Colony) {
      this.showColonyPanel(fco, null);
    } else if (fco instanceof Europe) {
      this.showEuropePanel();
    } else if (fco instanceof IndianSettlement) {
      this.showIndianSettlementPanel(fco);
    } else if (fco instanceof Tile) {
      this.setFocus(fco);
    } else if (fco instanceof Unit) {
      let loc = (fco).up();
      if (loc instanceof Colony) {
        this.showColonyPanel(loc, fco);
      } else {
        this.displayObject(loc);
      }
    } else if (fco instanceof WorkLocation) {
      this.showColonyPanel((fco).getColony(), null);
    }
  }
  /**
   * {@inheritDoc}
   */
  displayStartChat(sender: string, message: string, privateChat: boolean): void {
    let panel = this.canvas.getExistingFreeColPanel($J.cls(StartGamePanel));
    if (panel != null) {
      panel.displayChat(sender, message, privateChat);
    }
  }
  /**
   * {@inheritDoc}
   */
  isClientOptionsDialogShowing(): boolean {
    return this.canvas.getExistingFreeColDialog($J.cls(ClientOptionsDialog)) != null;
  }
  /**
   * {@inheritDoc}
   */
  isPanelShowing(): boolean {
    return this.canvas != null && this.canvas.getShowingPanel() != null;
  }
  /**
   * {@inheritDoc}
   */
  refresh(): void {
    if (this.mapViewer != null) {
      this.mapViewer.getMapViewerRepaintManager().markAsDirty$();
    }
    if (this.mapControls != null) {
      this.mapControls.updateMinimap();
    }
    if (this.canvas != null) {
      this.canvas.repaint$int$int$int$int(0, 0, this.canvas.getWidth(), this.canvas.getHeight());
    }
  }
  /**
   * {@inheritDoc}
   */
  repaint(): void {
    this.canvas.repaint$int$int$int$int(0, 0, this.canvas.getWidth(), this.canvas.getHeight());
  }
  /**
   * {@inheritDoc}
   */
  refreshPlayersTable(): void {
    let panel = this.canvas.getExistingFreeColPanel($J.cls(StartGamePanel));
    if (panel != null) {
      panel.refreshPlayersTable();
    }
  }
  /**
   * {@inheritDoc}
   */
  removeComponent(component: Component): void {
    this.canvas.remove$Component(component);
    if (!this.isPanelShowing()) {
      this.canvas.requestFocusInWindow$();
    }
  }
  /**
   * {@inheritDoc}
   */
  removeDialog(fcd: FreeColDialog<any>): void {
    this.canvas.dialogRemove(fcd);
  }
  /**
   * {@inheritDoc}
   */
  removeTradeRoutePanel(panel: FreeColPanel): void {
    this.canvas.remove$Component(panel);
    let tripPanel = this.canvas.getExistingFreeColPanel($J.cls(TradeRouteInputPanel));
    if (tripPanel != null) {
      tripPanel.cancelTradeRoute();
    }
  }
  /**
   * {@inheritDoc}
   */
  restoreSavedSize(comp: Component, size: Dimension): void {
    this.canvas.restoreSavedSize(comp, size);
  }
  /**
   * {@inheritDoc}
   */
  showTilePopup(tile: Tile): void {
    if (tile == null || !tile.isExplored()) {
      return;
    }
    let tp = new TilePopup()._TilePopup(this.getFreeColClient(), tile);
    if (tp.hasItem()) {
      let point = this.mapViewer.getMapViewerBounds().calculateTilePosition(tile, true);
      tp.show$Component$int$int(this.canvas, point.x_, point.y_);
      tp.repaint$();
    }
  }
  /**
   * {@inheritDoc}
   */
  tileAt(x: number, y: number): Tile {
    return this.mapViewer.convertToMapTile(x, y);
  }
  /**
   * {@inheritDoc}
   */
  updateEuropeanSubpanels(): void {
    for (const $it5 = SwingGUI.EUROPE_CLASSES.iterator(); $it5.hasNext(); ) {
      let c = $it5.next();
      let p = this.canvas.getExistingFreeColPanel(c);
      if (p != null) {
        try {
          Introspector.invokeVoidMethod(p, 'update');
        } catch ($e6) {
          if ($J.isa($e6, Exception)) {
            let e = $J.exc($e6);
          } else {
            throw $e6;
          }
        }
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  showAboutPanel(): FreeColPanel {
    return this.widgets.showAboutPanel();
  }
  /**
   * {@inheritDoc}
   */
  showBuildQueuePanel(colony: Colony): FreeColPanel {
    return this.widgets.showBuildQueuePanel(colony);
  }
  /**
   * {@inheritDoc}
   */
  showCaptureGoodsDialog(unit: Unit, gl: List<Goods>, handler: DialogHandler<List<Goods>>): void {
    this.widgets.showCaptureGoodsDialog(unit, gl, handler);
  }
  /**
   * {@inheritDoc}
   */
  showChatPanel(): FreeColPanel {
    return (this.getFreeColClient().getSinglePlayer()) ? null : this.widgets.showChatPanel();
  }
  /**
   * {@inheritDoc}
   */
  showChooseFoundingFatherDialog(ffs: List<FoundingFather>, handler: DialogHandler<FoundingFather>): void {
    this.widgets.showChooseFoundingFatherDialog(ffs, handler);
  }
  /**
   * {@inheritDoc}
   */
  showClientOptionsDialog(): void {
    let fcc = this.getFreeColClient();
    let dialog = new ClientOptionsDialog()._ClientOptionsDialog(fcc, this.canvas.getParentFrame(), true);
    dialog.setDialogHandler((group) => {
      if (group != null) {
        this.refreshGuiUsingClientOptions();
        this.canvas.mainTitleIfMainPanelIsAlreadyShowing();
      }
    });
    this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(dialog, SwingGUI$PopupPosition.CENTERED, true);
  }
  /**
   * {@inheritDoc}
   */
  refreshGuiUsingClientOptions(): void {
    let dpi = Utils.determineDpi(this.graphicsDevice);
    let scaleFactor = this.determineScaleFactorUsingClientOptions(dpi);
    this.fixedImageLibrary.changeScaleFactor(scaleFactor);
    this.resetMapZoom();
    if (this.tileViewer != null) {
      this.tileViewer.updateScaledVariables();
    }
    this.configureMigLayout(scaleFactor);
    FreeColImageBorder.setScaleFactor(scaleFactor);
    ResourceManager.setMods(this.getClientOptions().getActiveMods());
    if (this.getClientOptions().getRange(ClientOptions.GRAPHICS_QUALITY) === ClientOptions.GRAPHICS_QUALITY_LOWEST) {
      ImageResource.forceLowestQuality(true);
      this.reloadResources();
    } else if (ImageResource.isForceLowestQuality()) {
      ImageResource.forceLowestQuality(false);
      this.reloadResources();
    } else {
      this.prepareResources();
    }
    let fontSize = this.determineMainFontSizeUsingClientOptions(dpi);
    FontLibrary.setMainFontSize(Math.fround(fontSize));
    let font = FontLibrary.getMainFont();
    FreeColLookAndFeel.setScaleFactor(scaleFactor);
    FreeColLookAndFeel.installFont(font);
    FreeColToolTipUI.setFontScaling(FontLibrary.getFontScaling());
    Utility.initStyleContext(font);
    if (this.getFreeColClient().getActionManager() != null) {
      this.getFreeColClient().getActionManager().refreshResources();
    }
    if (this.mapControls != null) {
      this.mapControls.updateLayoutIfNeeded();
    }
    if (this.canvas != null) {
      this.canvas.resetMenuBar();
      this.resetMapControls();
    }
    this.canvas.refreshAllFrames();
    this.refresh();
  }
  /**
   * {@inheritDoc}
   */
  resetMapControls(): void {
    if (this.canvas.removeMapControls()) {
      this.updateMapControls();
      this.canvas.addMapControls();
    }
  }
  determineMainFontSizeUsingClientOptions(dpi: number): number {
    let DEFAULT_DPI = 72;
    if (this.getClientOptions().getBoolean(ClientOptions.MANUAL_MAIN_FONT_SIZE)) {
      let fontSize = this.getClientOptions().getInteger(ClientOptions.MAIN_FONT_SIZE);
      GUI.logger.info('Manual font size: ' + fontSize + ' (reported DPI: ' + dpi + ')');
      return fontSize;
    }
    let displayScaling = this.getClientOptions().getInteger(ClientOptions.DISPLAY_SCALING);
    let scaleFactor = this.determineScaleFactorUsingClientOptions(dpi);
    let fontSizeUsingScaling = $J.d2i((Math.fround(FontLibrary.DEFAULT_UNSCALED_MAIN_FONT_SIZE * scaleFactor)));
    if (displayScaling !== 0) {
      GUI.logger.info('Font size based on manual display scaling: ' + fontSizeUsingScaling + ' (reported DPI: ' + dpi + ')');
      return fontSizeUsingScaling;
    }
    let fontSizeUsingDpi = $J.d2i((Math.fround((Math.fround(FontLibrary.DEFAULT_UNSCALED_MAIN_FONT_SIZE * dpi)) / DEFAULT_DPI)));
    let screenHeight = this.graphicsDevice.getDisplayMode().getHeight();
    if (screenHeight < 900) {
      fontSizeUsingDpi = Math.min(14, fontSizeUsingDpi);
    } else if (screenHeight < 1050) {
      fontSizeUsingDpi = Math.min(18, fontSizeUsingDpi);
    }
    if (Math.fround(fontSizeUsingDpi) >= Math.fround(fontSizeUsingScaling * 0.25)) {
      return fontSizeUsingScaling;
    }
    GUI.logger.info('Automatic font size: ' + fontSizeUsingDpi + ' (reported DPI: ' + dpi + ', screen height: ' + screenHeight + ')');
    return fontSizeUsingDpi;
  }
  determineScaleFactorUsingClientOptions(dpi: number): number {
    let DEFAULT_DPI = 72;
    let displayScaling = this.getClientOptions().getInteger(ClientOptions.DISPLAY_SCALING);
    let scaleFactor: number;
    if (displayScaling === 0) {
      scaleFactor = Math.fround($J.roundf(Math.fround((Math.fround(dpi * 4)) / DEFAULT_DPI)) / 4);
      if (scaleFactor < Math.fround(1)) {
        scaleFactor = 1;
      }
      if (scaleFactor > Math.fround(2)) {
        scaleFactor = 2;
      }
      let screenHeight: number;
      if (FreeColDebugger.isAutomaticRescalingOnWindowResize()) {
        screenHeight = (this.canvas != null && this.canvas.getParentFrame() != null) ? this.canvas.getParentFrame().getHeight() : this.graphicsDevice.getDisplayMode().getHeight();
      } else {
        screenHeight = this.graphicsDevice.getDisplayMode().getHeight();
      }
      if (screenHeight < 720) {
        scaleFactor = 0.75;
      } else if (screenHeight < 900) {
        scaleFactor = 1;
      } else if (screenHeight < 1050) {
        scaleFactor = Math.min(1.25, scaleFactor);
      } else if (screenHeight < 1200) {
        scaleFactor = Math.min(1.5, scaleFactor);
      } else if (screenHeight < 1400) {
        scaleFactor = Math.min(1.75, scaleFactor);
      }
      GUI.logger.info('Automatic scale factor: ' + $J.fstr(scaleFactor) + ' (reported DPI: ' + dpi + ', screen height: ' + screenHeight + ')');
    } else {
      scaleFactor = Math.fround(displayScaling / 100);
      GUI.logger.info('Manual scale factor: ' + $J.fstr(scaleFactor) + ' (reported DPI: ' + dpi + ')');
    }
    return scaleFactor;
  }
  /**
   * {@inheritDoc}
   */
  showColonyPanel(colony: Colony, unit: Unit): FreeColPanel {
    if (colony == null) {
      return null;
    }
    let pred = (c) => (c instanceof ColonyPanel && (c).getColony() === colony);
    let panel = this.canvas.getMatchingComponent(pred);
    if (panel == null) {
      try {
        panel = new ColonyPanel()._ColonyPanel(this.getFreeColClient(), colony);
      } catch ($e7) {
        if ($J.isa($e7, Exception)) {
          let e = $J.exc($e7);
          GUI.logger.log(Level.WARNING, 'Exception in ColonyPanel for ' + colony.getId(), e);
          return null;
        } else {
          throw $e7;
        }
      }
      this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, this.getPopupPosition(colony.getTile$()), true);
    } else {
      panel.requestFocus$();
    }
    if (unit != null) {
      panel.setSelectedUnit(unit);
    }
    return panel;
  }
  /**
   * {@inheritDoc}
   */
  showFreeColPanel(panel: FreeColPanel, toolBox: boolean, popupPosition: SwingGUI$PopupPosition, resizable: boolean): void {
    if (this.canvas.isAddedAsPanelFrameOrIcon$Component(panel)) {
      panel.requestFocus$();
    } else {
      this.canvas.showFreeColPanel$FreeColPanel$boolean$PopupPosition$boolean(panel, toolBox, popupPosition, resizable);
    }
  }
  /**
   * {@inheritDoc}
   */
  showColopediaPanel(nodeId: string): FreeColPanel {
    return this.widgets.showColopediaPanel(nodeId);
  }
  /**
   * {@inheritDoc}
   */
  showColorChooserPanel(al: ActionListener): FreeColPanel {
    return this.widgets.showColorChooserPanel(al);
  }
  /**
   * {@inheritDoc}
   */
  showCompactLabourReport$(): FreeColPanel {
    return this.widgets.showCompactLabourReport$();
  }
  /**
   * {@inheritDoc}
   */
  showCompactLabourReport$UnitData(unitData: LabourData$UnitData): FreeColPanel {
    return this.widgets.showCompactLabourReport$UnitData(unitData);
  }
  /**
   * {@inheritDoc}
   */
  showConfirmDeclarationDialog(): List<string> {
    return this.widgets.showConfirmDeclarationDialog();
  }
  /**
   * {@inheritDoc}
   */
  showDeclarationPanel(afterClosing: Runnable): void {
    this.mapViewer.getMapViewerRepaintManager().setRepaintsBlocked(true);
    try {
      this.widgets.showDeclarationPanel(() => {
        this.mapViewer.getMapViewerRepaintManager().setRepaintsBlocked(false);
        this.refresh();
        afterClosing();
      });
    } catch ($e8) {
      if ($J.isa($e8, RuntimeException)) {
        let e = $J.exc($e8);
        this.mapViewer.getMapViewerRepaintManager().setRepaintsBlocked(false);
        throw e;
      } else {
        throw $e8;
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  showDifficultyDialog$Specification$OptionGroup$boolean$DialogHandler(spec: Specification, group: OptionGroup, editable: boolean, dialogHandler: DialogHandler<OptionGroup>): void {
    this.widgets.showDifficultyDialog(spec, group, editable, dialogHandler);
  }
  /**
   * {@inheritDoc}
   */
  showDumpCargoDialog(unit: Unit, handler: DialogHandler<List<Goods>>): void {
    this.widgets.showDumpCargoDialog(unit, this.getPopupPosition(unit.getTile$()), handler);
  }
  /**
   * {@inheritDoc}
   */
  showEditOptionDialog(option: Option): boolean {
    return this.widgets.showEditOptionDialog(option);
  }
  /**
   * {@inheritDoc}
   */
  showEditSettlementDialog(is$: IndianSettlement): IndianSettlement {
    return this.widgets.showEditSettlementDialog(is$);
  }
  /**
   * {@inheritDoc}
   */
  showEmigrationDialog(player: Player, fountainOfYouth: boolean, handler: DialogHandler<number>): void {
    this.widgets.showEmigrationDialog(player, fountainOfYouth, handler);
  }
  /**
   * {@inheritDoc}
   */
  showEndTurnDialog(units: List<Unit>, handler: DialogHandler<boolean>): void {
    this.widgets.showEndTurnDialog(units, handler);
  }
  /**
   * {@inheritDoc}
   */
  showErrorPanel$String$Runnable(message: string, callback: Runnable): FreeColPanel {
    return this.widgets.showErrorPanel(message).addClosingCallback(callback);
  }
  /**
   * {@inheritDoc}
   */
  showEuropePanel(): FreeColPanel {
    return this.widgets.showEuropePanel(() => {
      for (const $it9 = SwingGUI.EUROPE_CLASSES.iterator(); $it9.hasNext(); ) {
        let c = $it9.next();
        let p = this.canvas.getExistingFreeColPanel(c);
        if (p != null) {
          this.canvas.remove$Component(p);
        }
      }
    });
  }
  /**
   * {@inheritDoc}
   */
  showEventPanel(header: string, image: string, footer: string): FreeColPanel {
    return this.widgets.showEventPanel(header, image, footer);
  }
  /**
   * {@inheritDoc}
   */
  showFindSettlementPanel(): FreeColPanel {
    return this.widgets.showFindSettlementPanel();
  }
  /**
   * {@inheritDoc}
   */
  showFirstContactDialog(player: Player, other: Player, tile: Tile, settlementCount: number, handler: DialogHandler<boolean>): void {
    this.widgets.showFirstContactDialog(player, other, tile, settlementCount, this.getPopupPosition(tile), handler);
  }
  /**
   * {@inheritDoc}
   */
  showGameOptionsDialog(editable: boolean, dialogHandler: DialogHandler<OptionGroup>): void {
    this.widgets.showGameOptionsDialog(editable, dialogHandler);
  }
  /**
   * {@inheritDoc}
   */
  showHighScoresPanel(messageId: string, scores: List<HighScore>): FreeColPanel {
    return this.widgets.showHighScoresPanel(messageId, scores);
  }
  /**
   * {@inheritDoc}
   */
  showIndianSettlementPanel(is$: IndianSettlement): FreeColPanel {
    return this.widgets.showIndianSettlementPanel(is$, this.getPopupPosition(is$.getTile$()));
  }
  /**
   * {@inheritDoc}
   */
  showInformationPanel$FreeColObject$StringTemplate(displayObject: FreeColObject, template: StringTemplate): FreeColPanel {
    let icon = null;
    let tile = null;
    if (displayObject != null) {
      icon = this.fixedImageLibrary.getObjectImageIcon(displayObject);
      tile = ($J.isa(displayObject, Location)) ? (displayObject).getTile$() : null;
    }
    if (this.getClientOptions().getBoolean(ClientOptions.AUDIO_ALERTS)) {
      this.playSound('sound.event.alertSound');
    }
    return this.widgets.showInformationPanel(displayObject, this.getPopupPosition(tile), icon, template);
  }
  /**
   * {@inheritDoc}
   */
  showLoadDialog(directory: File, extension: string[]): File {
    let filters = $J.newArray(extension.length, null);
    for (let i = 0; i < extension.length; i++) {
      filters[i] = FreeColDataFile.getFileFilter(extension[i]);
    }
    let file = null;
    for (; ; ) {
      file = this.widgets.showLoadDialog(directory, filters);
      if (file == null || file.isFile()) {
        break;
      }
      let err = Messages.message$StringTemplate(FreeCol.badFile('error.noSuchFile', file));
      this.showErrorPanel$String$Runnable(err, null);
    }
    return file;
  }
  /**
   * {@inheritDoc}
   */
  showLoadingSavegameDialog(publicServer: boolean, singlePlayer: boolean): LoadingSavegameInfo {
    return this.widgets.showLoadingSavegameDialog(publicServer, singlePlayer);
  }
  /**
   * {@inheritDoc}
   */
  showLogFilePanel(): FreeColPanel {
    return this.widgets.showLogFilePanel();
  }
  /**
   * {@inheritDoc}
   */
  showMainPanel(userMsg: string): FreeColPanel {
    let panel = this.canvas.showMainPanel();
    if (userMsg != null) {
      this.showInformationPanel$String(userMsg);
    }
    return panel;
  }
  /**
   * {@inheritDoc}
   */
  showMainTitle(): void {
    this.canvas.mainTitle();
    this.playSound('sound.intro.general');
  }
  /**
   * {@inheritDoc}
   */
  showMapGeneratorOptionsDialog(editable: boolean, dialogHandler: DialogHandler<OptionGroup>): void {
    this.widgets.showMapGeneratorOptionsDialog(editable, dialogHandler);
  }
  /**
   * {@inheritDoc}
   */
  showMapSizeDialog(): Dimension {
    return this.widgets.showMapSizeDialog();
  }
  /**
   * {@inheritDoc}
   */
  showModelMessages(modelMessages: List<ModelMessage>): FreeColPanel {
    if (modelMessages.isEmpty()) {
      return null;
    }
    let game = this.getGame();
    let n = modelMessages.size();
    let texts = $J.newArray(n, null);
    let fcos = $J.newArray(n, null);
    let icons = $J.newArray(n, null);
    let tile = null;
    for (let i = 0; i < n; i++) {
      let m = modelMessages.get(i);
      texts[i] = Messages.message$StringTemplate(m);
      fcos[i] = game.getMessageSource(m);
      icons[i] = this.fixedImageLibrary.getObjectImageIcon(game.getMessageDisplay(m));
      if (tile == null && $J.isa(fcos[i], Location)) {
        tile = (fcos[i]).getTile$();
      }
    }
    let panel = new InformationPanel()._InformationPanel(this.getFreeColClient(), texts, fcos, icons);
    return this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, this.getPopupPosition(tile), false);
  }
  /**
   * {@inheritDoc}
   */
  showMonarchDialog(action: Monarch$MonarchAction, template: StringTemplate, monarchKey: string, handler: DialogHandler<boolean>): void {
    this.widgets.showMonarchDialog(action, template, monarchKey, handler);
  }
  /**
   * {@inheritDoc}
   */
  showNamingDialog(template: StringTemplate, defaultName: string, unit: Unit, handler: DialogHandler<string>): void {
    this.widgets.showNamingDialog(template, defaultName, this.getPopupPosition(unit.getTile$()), handler);
  }
  /**
   * {@inheritDoc}
   */
  showNativeDemandDialog(unit: Unit, colony: Colony, type$: GoodsType, amount: number, handler: DialogHandler<boolean>): void {
    this.widgets.showNativeDemandDialog(unit, colony, type$, amount, this.getPopupPosition(unit.getTile$()), handler);
  }
  /**
   * {@inheritDoc}
   */
  showNegotiationDialog(our: FreeColGameObject, other: FreeColGameObject, agreement: DiplomaticTrade, comment: StringTemplate): DiplomaticTrade {
    if ((!(our instanceof Unit) && !(our instanceof Colony)) || (!(other instanceof Unit) && !(other instanceof Colony)) || (our instanceof Colony && other instanceof Colony)) {
      throw new RuntimeException('Bad DTD args: ' + $J.str(our) + ', ' + $J.str(other));
    }
    return this.widgets.showNegotiationDialog(our, other, agreement, comment, this.getPopupPosition((our).getTile$()));
  }
  /**
   * {@inheritDoc}
   */
  showNewPanel$Specification(spec: Specification): FreeColPanel {
    try {
      return this.widgets.showNewPanel(spec);
    } catch ($e10) {
      if ($J.isa($e10, RuntimeException)) {
        let e = $J.exc($e10);
        GUI.logger.log(Level.WARNING, 'Exception while showing new game panel', e);
        this.showErrorPanel$Exception$StringTemplate(e, StringTemplate.key$String('error.unspecified'));
        return null;
      } else {
        throw $e10;
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  showParametersDialog(): Parameters {
    return this.widgets.showParametersDialog();
  }
  /**
   * {@inheritDoc}
   */
  showPreCombatDialog(attacker: Unit, defender: FreeColGameObject, tile: Tile): boolean {
    return this.widgets.showPreCombatDialog(attacker, defender, this.getPopupPosition(tile));
  }
  /**
   * {@inheritDoc}
   */
  showPurchasePanel(): FreeColPanel {
    return this.widgets.showPurchasePanel();
  }
  /**
   * {@inheritDoc}
   */
  showRecruitPanel(): FreeColPanel {
    return this.widgets.showRecruitPanel();
  }
  /**
   * {@inheritDoc}
   */
  showReportCargoPanel(): FreeColPanel {
    return this.widgets.showReportCargoPanel();
  }
  /**
   * {@inheritDoc}
   */
  showReportColonyPanel(): FreeColPanel {
    let compact: boolean;
    try {
      compact = this.getFreeColClient().getClientOptions().getInteger(ClientOptions.COLONY_REPORT) === ClientOptions.COLONY_REPORT_COMPACT;
    } catch ($e11) {
      if ($J.isa($e11, Exception)) {
        let e = $J.exc($e11);
        compact = false;
      } else {
        throw $e11;
      }
    }
    return this.widgets.showReportColonyPanel(compact);
  }
  /**
   * {@inheritDoc}
   */
  showReportContinentalCongressPanel(): FreeColPanel {
    return this.widgets.showReportContinentalCongressPanel();
  }
  /**
   * {@inheritDoc}
   */
  showReportEducationPanel(): FreeColPanel {
    return this.widgets.showReportEducationPanel();
  }
  /**
   * {@inheritDoc}
   */
  showReportExplorationPanel(): FreeColPanel {
    return this.widgets.showReportExplorationPanel();
  }
  /**
   * {@inheritDoc}
   */
  showReportForeignAffairPanel(): FreeColPanel {
    return this.widgets.showReportForeignAffairPanel();
  }
  /**
   * {@inheritDoc}
   */
  showReportHistoryPanel(): FreeColPanel {
    return this.widgets.showReportHistoryPanel();
  }
  /**
   * {@inheritDoc}
   */
  showReportIndianPanel(): FreeColPanel {
    return this.widgets.showReportIndianPanel();
  }
  /**
   * {@inheritDoc}
   */
  showReportLabourPanel(): FreeColPanel {
    return this.widgets.showReportLabourPanel();
  }
  /**
   * {@inheritDoc}
   */
  showReportLabourDetailPanel(unitType: UnitType, data: JMap<UnitType, JMap<Location, number>>, unitCount: TypeCountMap<UnitType>, colonies: List<Colony>): FreeColPanel {
    return this.widgets.showReportLabourDetailPanel(unitType, data, unitCount, colonies);
  }
  /**
   * {@inheritDoc}
   */
  showReportMilitaryPanel(): FreeColPanel {
    return this.widgets.showReportMilitaryPanel();
  }
  /**
   * {@inheritDoc}
   */
  showReportNavalPanel(): FreeColPanel {
    return this.widgets.showReportNavalPanel();
  }
  /**
   * {@inheritDoc}
   */
  showReportProductionPanel(): FreeColPanel {
    return this.widgets.showReportProductionPanel();
  }
  /**
   * {@inheritDoc}
   */
  showReportReligiousPanel(): FreeColPanel {
    return this.widgets.showReportReligiousPanel();
  }
  /**
   * {@inheritDoc}
   */
  showReportRequirementsPanel(): FreeColPanel {
    return this.widgets.showReportRequirementsPanel();
  }
  /**
   * {@inheritDoc}
   */
  showReportTradePanel(): FreeColPanel {
    return this.widgets.showReportTradePanel();
  }
  /**
   * {@inheritDoc}
   */
  showReportTurnPanel(messages: List<ModelMessage>): FreeColPanel {
    return this.widgets.showReportTurnPanel(messages);
  }
  /**
   * {@inheritDoc}
   */
  showRiverStyleDialog(styles: List<string>): string {
    return this.widgets.showRiverStyleDialog(styles);
  }
  /**
   * {@inheritDoc}
   */
  showSaveDialog(directory: File, defaultName: string): File {
    let extension = StringUtils.lastPart(defaultName, '.');
    let filters = [FreeColDataFile.getFileFilter(extension), FreeColDataFile.getFileFilter('*')];
    return this.widgets.showSaveDialog(directory, filters, defaultName);
  }
  /**
   * {@inheritDoc}
   */
  showScaleMapSizeDialog(): Dimension {
    return this.widgets.showScaleMapSizeDialog();
  }
  /**
   * {@inheritDoc}
   */
  showSelectAmountDialog(goodsType: GoodsType, available: number, defaultAmount: number, needToPay: boolean): number {
    return this.widgets.showSelectAmountDialog(goodsType, available, defaultAmount, needToPay);
  }
  /**
   * {@inheritDoc}
   */
  showSelectDestinationDialog(unit: Unit): Location {
    return this.widgets.showSelectDestinationDialog(unit, this.getPopupPosition(unit.getTile$()));
  }
  /**
   * {@inheritDoc}
   */
  showSelectTributeAmountDialog(question: StringTemplate, maximum: number): number {
    return this.widgets.showSelectTributeAmountDialog(question, maximum);
  }
  /**
   * {@inheritDoc}
   */
  showServerListPanel(serverList: List<ServerInfo>): FreeColPanel {
    this.canvas.closeMenus();
    return this.widgets.showServerListPanel(serverList);
  }
  /**
   * {@inheritDoc}
   */
  showStartGamePanel(game: Game, player: Player, singlePlayerMode: boolean): FreeColPanel {
    if (game == null) {
      GUI.logger.warning('StartGamePanel requires game != null.');
    } else if (player == null) {
      GUI.logger.warning('StartGamePanel requires player != null.');
    } else {
      this.canvas.closeMenus();
      let panel = this.canvas.getExistingFreeColPanel($J.cls(StartGamePanel));
      if (panel == null) {
        panel = new StartGamePanel()._StartGamePanel(this.getFreeColClient());
      }
      panel.initialize(singlePlayerMode);
      return this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, SwingGUI$PopupPosition.CENTERED, true);
    }
    return null;
  }
  /**
   * {@inheritDoc}
   */
  showStatisticsPanel(serverStats: JMap<string, string>, clientStats: JMap<string, string>): FreeColPanel {
    return this.widgets.showStatisticsPanel(serverStats, clientStats);
  }
  /**
   * {@inheritDoc}
   */
  showStatusPanel(message: string): FreeColPanel {
    let panel = this.canvas.getExistingFreeColPanel($J.cls(StatusPanel));
    if (panel == null) {
      panel = new StatusPanel()._StatusPanel(this.getFreeColClient());
    } else {
      this.canvas.removeFromCanvas(panel);
    }
    panel.setStatusMessage(message);
    return this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, SwingGUI$PopupPosition.CENTERED, true);
  }
  /**
   * {@inheritDoc}
   */
  showTilePanel(tile: Tile): FreeColPanel {
    return this.widgets.showTilePanel(tile);
  }
  /**
   * {@inheritDoc}
   */
  showTradeRouteInputPanel(newRoute: TradeRoute): FreeColPanel {
    return this.widgets.showTradeRouteInputPanel(newRoute);
  }
  /**
   * {@inheritDoc}
   */
  showTradeRoutePanel(unit: Unit): FreeColPanel {
    return this.widgets.showTradeRoutePanel(unit, this.getPopupPosition((unit == null) ? null : unit.getTile$()));
  }
  /**
   * {@inheritDoc}
   */
  showTrainPanel(): FreeColPanel {
    return this.widgets.showTrainPanel();
  }
  /**
   * {@inheritDoc}
   */
  showVictoryDialog(handler: DialogHandler<boolean>): void {
    this.widgets.showVictoryDialog(handler);
  }
  /**
   * {@inheritDoc}
   */
  showWarehouseDialog(colony: Colony, handler: DialogHandler<boolean>): void {
    this.widgets.showWarehouseDialog(colony, handler);
  }
  /**
   * {@inheritDoc}
   */
  showWorkProductionPanel(unit: Unit): FreeColPanel {
    return this.widgets.showWorkProductionPanel(unit);
  }
  /**
   * {@inheritDoc}
   */
  prepareShowingMainMenu(): void {
    this.canvas.prepareShowingMainMenu();
  }
  /**
   * {@inheritDoc}
   */
  canGameChangingModsBeAdded(): boolean {
    return this.getFreeColClient().getGame() == null;
  }
  refreshScaleFactorIfNecessary(): void {
    if (!FreeColDebugger.isAutomaticRescalingOnWindowResize()) {
      return;
    }
    let dpi = Utils.determineDpi(this.graphicsDevice);
    let scaleFactor = this.determineScaleFactorUsingClientOptions(dpi);
    if (Math.fround(Math.abs(Math.fround(this.getFixedImageLibrary().getScaleFactor() - scaleFactor))) <= 0.1) {
      return;
    }
    this.refreshGuiUsingClientOptions();
  }
  static $clinit() {
    SwingGUI.EUROPE_CLASSES = CollectionUtils.makeUnmodifiableList([$J.cls(RecruitPanel), $J.cls(PurchasePanel), $J.cls(TrainPanel)]);
  }
}

/**
 * A rough position to place dialogs and panels on the canvas.
 */
export class SwingGUI$PopupPosition extends JEnum {
  static ORIGIN: SwingGUI$PopupPosition = null;
  static CENTERED: SwingGUI$PopupPosition = null;
  static CENTERED_LEFT: SwingGUI$PopupPosition = null;
  static CENTERED_RIGHT: SwingGUI$PopupPosition = null;
  static LOWER_LEFT: SwingGUI$PopupPosition = null;
  static LOWER_RIGHT: SwingGUI$PopupPosition = null;
  static UPPER_LEFT: SwingGUI$PopupPosition = null;
  static UPPER_RIGHT: SwingGUI$PopupPosition = null;
  static LEFT: SwingGUI$PopupPosition = null;
  static RIGHT: SwingGUI$PopupPosition = null;
  static CENTERED_FORCED: SwingGUI$PopupPosition = null;
  static $VALUES: SwingGUI$PopupPosition[] = null;
  _SwingGUI$PopupPosition($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): SwingGUI$PopupPosition[] { return SwingGUI$PopupPosition.$VALUES.slice(); }
  static valueOf(name: string): SwingGUI$PopupPosition { return $J.enumValueOf(SwingGUI$PopupPosition, name); }
  static $clinit() {
    SwingGUI$PopupPosition.ORIGIN = new SwingGUI$PopupPosition()._SwingGUI$PopupPosition('ORIGIN', 0);
    SwingGUI$PopupPosition.CENTERED = new SwingGUI$PopupPosition()._SwingGUI$PopupPosition('CENTERED', 1);
    SwingGUI$PopupPosition.CENTERED_LEFT = new SwingGUI$PopupPosition()._SwingGUI$PopupPosition('CENTERED_LEFT', 2);
    SwingGUI$PopupPosition.CENTERED_RIGHT = new SwingGUI$PopupPosition()._SwingGUI$PopupPosition('CENTERED_RIGHT', 3);
    SwingGUI$PopupPosition.LOWER_LEFT = new SwingGUI$PopupPosition()._SwingGUI$PopupPosition('LOWER_LEFT', 4);
    SwingGUI$PopupPosition.LOWER_RIGHT = new SwingGUI$PopupPosition()._SwingGUI$PopupPosition('LOWER_RIGHT', 5);
    SwingGUI$PopupPosition.UPPER_LEFT = new SwingGUI$PopupPosition()._SwingGUI$PopupPosition('UPPER_LEFT', 6);
    SwingGUI$PopupPosition.UPPER_RIGHT = new SwingGUI$PopupPosition()._SwingGUI$PopupPosition('UPPER_RIGHT', 7);
    SwingGUI$PopupPosition.LEFT = new SwingGUI$PopupPosition()._SwingGUI$PopupPosition('LEFT', 8);
    SwingGUI$PopupPosition.RIGHT = new SwingGUI$PopupPosition()._SwingGUI$PopupPosition('RIGHT', 9);
    SwingGUI$PopupPosition.CENTERED_FORCED = new SwingGUI$PopupPosition()._SwingGUI$PopupPosition('CENTERED_FORCED', 10);
    SwingGUI$PopupPosition.$VALUES = [SwingGUI$PopupPosition.ORIGIN, SwingGUI$PopupPosition.CENTERED, SwingGUI$PopupPosition.CENTERED_LEFT, SwingGUI$PopupPosition.CENTERED_RIGHT, SwingGUI$PopupPosition.LOWER_LEFT, SwingGUI$PopupPosition.LOWER_RIGHT, SwingGUI$PopupPosition.UPPER_LEFT, SwingGUI$PopupPosition.UPPER_RIGHT, SwingGUI$PopupPosition.LEFT, SwingGUI$PopupPosition.RIGHT, SwingGUI$PopupPosition.CENTERED_FORCED];
  }
}

let $SwingGUI$1: any = null;
/** An anonymous class (SwingGUI.java:281). */
function SwingGUI$1(): any {
  return $SwingGUI$1 ??= $J.local(class extends JObject {
    execute(): void {
      this.$cv_can.paintImmediately$Rectangle(this.$cv_aBounds);
    }
    $c($can, $aBounds): this {
      this.$cv_can = $can; this.$cv_aBounds = $aBounds;
      return this;
    }
  }, 'net.sf.freecol.client.gui.SwingGUI$1', ['net.sf.freecol.client.gui.animation.Animations$Procedure']);
}

$J.define(SwingGUI, 'net.sf.freecol.client.gui.SwingGUI', { kind: 'class', sup: 'net.sf.freecol.client.gui.GUI', ctors: { 'net.sf.freecol.client.FreeColClient': '_SwingGUI' }, returns: { 'isPanelShowing': 'boolean', 'isClientOptionsDialogShowing': 'boolean', 'getMaxScale': 'float', 'getSelectedTile': 'net.sf.freecol.common.model.Tile', 'getActiveUnit': 'net.sf.freecol.common.model.Unit', 'getViewMode': 'net.sf.freecol.client.gui.GUI$ViewMode', 'isGotoStarted': 'boolean', 'getFocusMapPoint': 'java.awt.Point', 'getFocus': 'net.sf.freecol.common.model.Tile', 'isShowingMapEditorTransformPanel': 'boolean', 'isShowingMapEditorToolboxPanel': 'boolean', 'getMapViewDimension': 'java.awt.Dimension', 'isWindowed': 'boolean', 'getScaledImageLibrary': 'net.sf.freecol.client.gui.ImageLibrary', 'getFixedImageLibrary': 'net.sf.freecol.client.gui.ImageLibrary', 'getMapScale': 'float', 'getDragPoint': 'java.awt.Point' }, meths: { 'showNewPanel(net.sf.freecol.common.model.Specification)': 'showNewPanel$Specification', 'showInformationPanel(net.sf.freecol.common.model.FreeColObject,net.sf.freecol.common.model.StringTemplate)': 'showInformationPanel$FreeColObject$StringTemplate', 'showErrorPanel(java.lang.String,java.lang.Runnable)': 'showErrorPanel$String$Runnable', 'showDifficultyDialog(net.sf.freecol.common.model.Specification,net.sf.freecol.common.option.OptionGroup,boolean,net.sf.freecol.client.gui.DialogHandler)': 'showDifficultyDialog$Specification$OptionGroup$boolean$DialogHandler', 'showCompactLabourReport(net.sf.freecol.client.gui.panel.report.LabourData$UnitData)': 'showCompactLabourReport$UnitData', 'showCompactLabourReport()': 'showCompactLabourReport$', 'changeView()': 'changeView$', 'changeView(net.sf.freecol.client.control.MapTransform)': 'changeView$MapTransform', 'changeView(net.sf.freecol.common.model.Unit,boolean)': 'changeView$Unit$boolean', 'changeView(net.sf.freecol.common.model.Tile)': 'changeView$Tile', 'performGoto(int,int)': 'performGoto$int$int', 'performGoto(net.sf.freecol.common.model.Tile)': 'performGoto$Tile', 'getChoice(net.sf.freecol.common.model.Tile,net.sf.freecol.common.model.StringTemplate,javax.swing.ImageIcon,java.lang.String,java.util.List)': 'getChoice$Tile$StringTemplate$ImageIcon$String$List', 'confirm(net.sf.freecol.common.model.Tile,net.sf.freecol.common.model.StringTemplate,javax.swing.ImageIcon,java.lang.String,java.lang.String)': 'confirm$Tile$StringTemplate$ImageIcon$String$String' }, clinit: true, lazy: ['EUROPE_CLASSES'] });
$J.define(SwingGUI$PopupPosition, 'net.sf.freecol.client.gui.SwingGUI$PopupPosition', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_SwingGUI$PopupPosition' }, clinit: true, lazy: ['$VALUES', 'ORIGIN', 'CENTERED', 'CENTERED_LEFT', 'CENTERED_RIGHT', 'LOWER_LEFT', 'LOWER_RIGHT', 'UPPER_LEFT', 'UPPER_RIGHT', 'LEFT', 'RIGHT', 'CENTERED_FORCED'] });
$J.module(() => {
  Point = $J.load('java.awt.Point');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  PlatformDefaults = $J.load('net.miginfocom.layout.PlatformDefaults');
  UnitValue = $J.load('net.miginfocom.layout.UnitValue');
  FreeCol = $J.load('net.sf.freecol.FreeCol');
  ClientOptions = $J.load('net.sf.freecol.client.ClientOptions');
  Canvas = $J.load('net.sf.freecol.client.gui.Canvas');
  FontLibrary = $J.load('net.sf.freecol.client.gui.FontLibrary');
  GUI$ViewMode = $J.load('net.sf.freecol.client.gui.GUI$ViewMode');
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  TilePopup = $J.load('net.sf.freecol.client.gui.TilePopup');
  Widgets = $J.load('net.sf.freecol.client.gui.Widgets');
  Animations = $J.load('net.sf.freecol.client.gui.animation.Animations');
  ClientOptionsDialog = $J.load('net.sf.freecol.client.gui.dialog.ClientOptionsDialog');
  GUIMessage = $J.load('net.sf.freecol.client.gui.mapviewer.GUIMessage');
  MapViewer = $J.load('net.sf.freecol.client.gui.mapviewer.MapViewer');
  TileViewer = $J.load('net.sf.freecol.client.gui.mapviewer.TileViewer');
  ColonyPanel = $J.load('net.sf.freecol.client.gui.panel.ColonyPanel');
  CornerMapControls = $J.load('net.sf.freecol.client.gui.panel.CornerMapControls');
  FreeColImageBorder = $J.load('net.sf.freecol.client.gui.panel.FreeColImageBorder');
  InformationPanel = $J.load('net.sf.freecol.client.gui.panel.InformationPanel');
  MapEditorToolboxPanel = $J.load('net.sf.freecol.client.gui.panel.MapEditorToolboxPanel');
  MapEditorTransformPanel = $J.load('net.sf.freecol.client.gui.panel.MapEditorTransformPanel');
  PurchasePanel = $J.load('net.sf.freecol.client.gui.panel.PurchasePanel');
  RecruitPanel = $J.load('net.sf.freecol.client.gui.panel.RecruitPanel');
  StartGamePanel = $J.load('net.sf.freecol.client.gui.panel.StartGamePanel');
  StatusPanel = $J.load('net.sf.freecol.client.gui.panel.StatusPanel');
  TradeRouteInputPanel = $J.load('net.sf.freecol.client.gui.panel.TradeRouteInputPanel');
  TrainPanel = $J.load('net.sf.freecol.client.gui.panel.TrainPanel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  FreeColLookAndFeel = $J.load('net.sf.freecol.client.gui.plaf.FreeColLookAndFeel');
  FreeColToolTipUI = $J.load('net.sf.freecol.client.gui.plaf.FreeColToolTipUI');
  FreeColException = $J.load('net.sf.freecol.common.FreeColException');
  MemoryManager = $J.load('net.sf.freecol.common.MemoryManager');
  DebugUtils = $J.load('net.sf.freecol.common.debug.DebugUtils');
  FreeColDebugger = $J.load('net.sf.freecol.common.debug.FreeColDebugger');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  FreeColDataFile = $J.load('net.sf.freecol.common.io.FreeColDataFile');
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  Direction = $J.load('net.sf.freecol.common.model.Direction');
  Europe = $J.load('net.sf.freecol.common.model.Europe');
  IndianSettlement = $J.load('net.sf.freecol.common.model.IndianSettlement');
  Location = $J.load('net.sf.freecol.common.model.Location');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  Tile = $J.load('net.sf.freecol.common.model.Tile');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  WorkLocation = $J.load('net.sf.freecol.common.model.WorkLocation');
  LanguageOption = $J.load('net.sf.freecol.common.option.LanguageOption');
  ImageCache = $J.load('net.sf.freecol.common.resources.ImageCache');
  ImageResource = $J.load('net.sf.freecol.common.resources.ImageResource');
  ResourceManager = $J.load('net.sf.freecol.common.resources.ResourceManager');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  Introspector = $J.load('net.sf.freecol.common.util.Introspector');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
});
