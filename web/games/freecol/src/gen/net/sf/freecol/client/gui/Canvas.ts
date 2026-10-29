// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/Canvas.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, ClassCastException, Exception, JObject, JString, Level, Logger } from '../../../../../../jre/index.ts';
import { JDesktopPane } from '../../../../../javax/swing/JDesktopPane.ts';
import { JInternalFrame } from '../../../../../javax/swing/JInternalFrame.ts';

let Dimension, Point, Rectangle, PropertyVetoException, JComponent, JInternalFrame$JDesktopIcon, JLayeredPane, JRootPane, SwingUtilities, Timer, UIManager, EmptyBorder, InternalFrameAdapter, BasicInternalFrameUI, ClientOptions, CanvasMapEditorMouseListener, CanvasMouseListener, CanvasMouseMotionListener, FrameMotionListener, FreeColFrame, GrayLayer, ImageLibrary, Scrolling, SwingGUI$PopupPosition, CanvasMapViewer, InGameMenuBar, MapEditorMenuBar, MenuMouseMotionListener, FreeColPanel, InfoPanel, MainPanel, MapEditorToolboxPanel, MapEditorTransformPanel, MiniMapFreeColPanel, Utility, VideoComponent, Messages, IntegerOption, CollectionUtils;

/**
 * The main container for the other GUI components in FreeCol.
 * This is where lower level graphics coordination occurs.
 * Specific panels and dialogs are over in Widgets
 * (TODO) with a few exceptions.
 */
export class Canvas extends JDesktopPane {
  static readonly PROPERTY_RESIZABLE: string = 'Canvas.resizable';
  static readonly PROPERTY_POPUP_POSITION: string = 'Canvas.popupPosition';
  static logger: Logger = null;
  /**
   * Number of tries to find a clear spot on the canvas.
   */
  static readonly MAXTRY: number = 3;
  /**
   * The cursor to show for goto operations.
   */
  static GO_CURSOR: Cursor = null;
  /**
   * The game client.
   */
  freeColClient: FreeColClient = null;
  /**
   * The graphics device to display to.
   */
  graphicsDevice: GraphicsDevice = null;
  /**
   * Is the canvas in windowed mode?
   */
  windowed: boolean = false;
  /**
   * The parent frame, either a window or the full screen.
   */
  parentFrame: FreeColFrame = null;
  /**
   * Remember the current size (from getSize()), check for changes.
   */
  oldSize: Dimension = null;
  /**
   * The component that displays the map.
   * Ideally this would be completely separate, but the displayMap
   * (and possibly changeSize) call/s means we must retain a reference
   * to the map viewer.
   * We also use it for the Cursor, which remains in MapViewer so
   * that displayMap can draw it when active needed.
   */
  mapViewer: MapViewer = null;
  /**
   * The various sorts of map controls.
   */
  mapControls: MapControls = null;
  /**
   * The special overlay used when it is not the player turn.
   */
  greyLayer: GrayLayer = null;
  /**
   * The dialogs in view.
   */
  dialogs: List<FreeColDialog<any>> = null;
  /**
   * The main panel.  Remember this because getExistingFreeColPanel
   * gets confused across switches between the game and the map editor
   * which makes it hard to remove.
   */
  mainPanel: MainPanel = null;
  scrolling: Scrolling = null;
  /**
   * The panel used for displaying the map and drawing the background of this class.
   */
  canvasMapViewer: CanvasMapViewer = null;
  /**
   * A timer triggering repaints in order to display animations on the {@link CanvasMapViewer}.
   */
  animationTimer: Timer = null;
  /**
   * The constructor to use.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param graphicsDevice The {@code GraphicsDevice} to display on.
   * @param desiredSize The desired size of the parent frame.
   * @param mapViewer The object responsible of drawing the map.
   * @param mapControls The controls on the map.
   */
  _Canvas(freeColClient: FreeColClient, graphicsDevice: GraphicsDevice, desiredSize: Dimension, mapViewer: MapViewer, mapControls: MapControls): this {
    this._JDesktopPane();
    this.dialogs = new ArrayList();
    // assert SwingUtilities.isEventDispatchThread()
    this.freeColClient = freeColClient;
    this.graphicsDevice = graphicsDevice;
    this.canvasMapViewer = new CanvasMapViewer()._CanvasMapViewer(freeColClient, mapViewer);
    this.scrolling = new Scrolling()._Scrolling(freeColClient, this);
    this.windowed = Canvas.checkWindowed(graphicsDevice, desiredSize);
    let windowBounds = null;
    if (this.windowed && desiredSize != null && desiredSize.width_ > 0 && desiredSize.height_ > 0) {
      windowBounds = new Rectangle()._Rectangle$Dimension(desiredSize);
    }
    this.parentFrame = this.createFrame(null, windowBounds);
    this.oldSize = this.getSize$();
    this.add$Component$Object(this.canvasMapViewer, JLayeredPane.FRAME_CONTENT_LAYER);
    this.canvasMapViewer.setSize$Dimension(this.oldSize);
    this.canvasMapViewer.setLocation$int$int(0, 0);
    this.addComponentListener(new (Canvas$1())().$o(this));
    this.mapViewer = mapViewer;
    this.mapControls = mapControls;
    this.greyLayer = new GrayLayer()._GrayLayer(freeColClient);
    this.setDoubleBuffered(true);
    this.setOpaque(true);
    this.setLayout(null);
    this.setFocusable(true);
    this.setFocusTraversalKeysEnabled(false);
    for (const $it0 = freeColClient.getActionManager().getOptions().iterator(); $it0.hasNext(); ) {
      let option = $it0.next();
      let action = option;
      this.getInputMap$().put(action.getAccelerator(), action.getId());
      this.getActionMap$().put$Object$Action(action.getId(), action);
    }
    this.parentFrame.setVisible(true);
    this.updateSize();
    this.revalidate();
    this.repaint$();
    this.animationTimer = new Timer()._Timer(125, (event) => {
      this.paintJustTheMapImmediately();
    });
    this.updateRepaintTimer(false);
    this.animationTimer.start();
    Canvas.logger.info('Canvas created with bounds: ' + $J.str(windowBounds));
    return this;
  }
  /**
   * Updates the timing for repaints.
   *
   * @param fastRendering If {@code true}, the repaints should happen as often
   *      as possible. This is used for smooth scrolling.
   */
  updateRepaintTimer(fastRendering: boolean): void {
    if (fastRendering) {
      this.animationTimer.setDelay(4);
    } else {
      this.animationTimer.setDelay(125);
    }
  }
  updateSize(): void {
    this.freeColClient.getGUI().refreshScaleFactorIfNecessary();
    let size = this.getSize$();
    if (this.oldSize.width_ !== size.width_ || this.oldSize.height_ !== size.height_) {
      Canvas.logger.info('Canvas resize from ' + $J.str(this.oldSize) + ' to ' + $J.str(size));
      this.oldSize = size;
      this.canvasMapViewer.changeSize(size);
      if (this.removeMapControls()) {
        this.freeColClient.getGUI().updateMapControls();
        this.addMapControls();
      }
      if (this.mapControls != null) {
        this.mapControls.updateMinimap();
      }
      this.updateFrameSizesAndPositions(size);
      this.revalidate();
      this.repaint$();
    }
  }
  refreshAllFrames(): void {
    let components = this.getComponents();
    for (let c of components) {
      if (!(c instanceof JInternalFrame)) {
        continue;
      }
      let f = c;
      let panel = this.getFreeColPanel(f);
      if (panel != null) {
        panel.refreshLayout();
      }
    }
    this.updateFrameSizesAndPositions(this.getSize$());
  }
  updateFrameSizesAndPositions(canvasSize: Dimension): void {
    for (let c of this.getComponents()) {
      if (!(c instanceof JInternalFrame)) {
        continue;
      }
      let f = c;
      let panel = this.getFreeColPanel(f);
      if (panel != null && panel.isFullscreen()) {
        f.setSize$Dimension(canvasSize);
        f.setLocation$int$int(0, 0);
        continue;
      }
      let resizeable = f.getClientProperty(Canvas.PROPERTY_RESIZABLE);
      let newSize: Dimension;
      if (resizeable != null && resizeable) {
        newSize = this.capSizeToMaximum(f, canvasSize);
        f.setSize$Dimension(newSize);
      } else {
        newSize = f.getSize$();
      }
      let loc = f.getLocation$();
      let newX = (((loc.x_ + newSize.width_) | 0) > canvasSize.width_) ? (canvasSize.width_ - newSize.width_) | 0 : loc.x_;
      let newY = (((loc.y_ + newSize.height_) | 0) > canvasSize.height_) ? (canvasSize.height_ - newSize.height_) | 0 : loc.y_;
      f.setLocation$Point(new Point()._Point$int$int(Math.max(0, newX), Math.max(0, newY)));
      let popupPosition = f.getClientProperty(Canvas.PROPERTY_POPUP_POSITION);
      if (popupPosition == null) {
        continue;
      }
      let p = this.chooseLocation(f, f.getWidth(), f.getHeight(), popupPosition);
      f.setLocation$Point(p);
    }
  }
  getFreeColPanel(f: JInternalFrame): FreeColPanel {
    if (f.getContentPane() == null) {
      return null;
    }
    if (f.getContentPane().getComponentCount() <= 0) {
      return null;
    }
    if (!(f.getContentPane().getComponent$int(0) instanceof FreeColPanel)) {
      return null;
    }
    return f.getContentPane().getComponent$int(0);
  }
  capSizeToMaximum(f: JInternalFrame, maxSize: Dimension): Dimension {
    let width = Math.max(f.getMinimumSize$().width_, Math.min(f.getWidth(), maxSize.width_));
    let height = Math.max(f.getMinimumSize$().height_, Math.min(f.getHeight(), maxSize.height_));
    return new Dimension()._Dimension$int$int(width, height);
  }
  /**
   * Toggle windowed flag.
   */
  toggleWindowed(): void {
    this.windowed = !this.windowed;
  }
  /**
   * Create a new frame with a given menu bar and bounds.
   *
   * @param menuBar The new frames {@code JMenuBar}.
   * @param windowBounds The new frame bounding {@code Rectangle}.
   * @return The new {@code FreeColFrame}.
   */
  createFrame(menuBar: JMenuBar, windowBounds: Rectangle): FreeColFrame {
    let fcf = new FreeColFrame()._FreeColFrame(this.freeColClient, this.graphicsDevice, menuBar, this.isWindowed(), windowBounds);
    fcf.getContentPane().add$Component(this);
    return fcf;
  }
  /**
   * Destroy the current frame.
   */
  destroyFrame(): void {
    if (this.parentFrame != null) {
      this.parentFrame.setVisible(false);
      if (!this.isWindowed()) {
        this.parentFrame.exitFullScreen();
      }
      this.parentFrame.dispose();
      this.parentFrame = null;
    }
  }
  /**
   * Determine whether to use full screen or windowed mode.
   *
   * @param gd The {@code GraphicsDevice} to display to.
   * @param desiredSize An optional window {@code Dimension}.
   * @return True if windowed mode is to be used, false for full screen.
   */
  static checkWindowed(gd: GraphicsDevice, desiredSize: Dimension): boolean {
    let ret: boolean;
    if (desiredSize == null) {
      if (gd.isFullScreenSupported()) {
        Canvas.logger.info('Full screen mode used.');
        ret = false;
      } else {
        Canvas.logger.warning('Full screen mode not supported.');
        $J.err.println(Messages.message$String('client.fullScreen'));
        ret = true;
      }
    } else {
      Canvas.logger.info('Windowed mode used.');
      ret = true;
    }
    return ret;
  }
  /**
   * Adds a component on this Canvas inside a frame.
   *
   * @param comp The component to add to the canvas.
   * @param toolBox Should be set to true if the resulting frame is
   *     used as a toolbox (that is: it should not be counted as a
   *     frame).
   * @param popupPosition A preferred {@code PopupPosition}.
   * @param resizable Whether this component can be resized.
   * @return The {@code JInternalFrame} that was created and added.
   */
  addAsFrame(comp: JComponent, toolBox: boolean, popupPosition: SwingGUI$PopupPosition, resizable: boolean): JInternalFrame {
    let f = (toolBox) ? new Canvas$ToolBoxFrame()._Canvas$ToolBoxFrame() : new (Canvas$2())().$o(this).$c(comp)._JInternalFrame$();
    let fullscreenPanel: boolean;
    if (comp instanceof FreeColPanel) {
      let freeColPanel = comp;
      fullscreenPanel = freeColPanel.isFullscreen();
      if (popupPosition == null) {
        popupPosition = freeColPanel.getFramePopupPosition();
      }
    } else {
      fullscreenPanel = false;
    }
    if (fullscreenPanel) {
      resizable = false;
    }
    let con = f.getContentPane();
    if (con instanceof JComponent) {
      let c = con;
      c.setOpaque(false);
      c.setBorder(null);
    }
    if (!toolBox) {
      if (comp instanceof FreeColPanel && (comp).getFrameBorder() != null) {
        f.setBorder((comp).getFrameBorder());
      } else if (comp.getBorder() != null) {
        if (comp.getBorder() instanceof EmptyBorder) {
          f.setBorder(Utility.blankBorder(10, 10, 10, 10));
        } else {
          f.setBorder(comp.getBorder());
          comp.setBorder(Utility.blankBorder(5, 5, 5, 5));
        }
      } else {
        f.setBorder(null);
      }
    }
    if (comp instanceof FreeColPanel) {
      let panel = comp;
      let title = panel.getFrameTitle();
      if (title != null) {
        f.setTitle(panel.getFrameTitle());
      }
    }
    if (!fullscreenPanel) {
      let fml = new FrameMotionListener()._FrameMotionListener(f);
      comp.addMouseMotionListener(fml);
      comp.addMouseListener(fml);
    }
    if (!toolBox && f.getUI() instanceof BasicInternalFrameUI) {
      f.getRootPane().setWindowDecorationStyle(JRootPane.NONE);
      let biu = f.getUI();
      biu.setNorthPane(null);
      biu.setSouthPane(null);
      biu.setWestPane(null);
      biu.setEastPane(null);
    } else {
      f.setMaximizable(true);
      f.setClosable(true);
      f.setIconifiable(true);
    }
    f.addInternalFrameListener(new (Canvas$3())().$o(this).$c(comp, f)._InternalFrameAdapter());
    f.getContentPane().add$Component(comp);
    f.setOpaque(false);
    f.pack();
    let size: Dimension;
    if (fullscreenPanel) {
      size = this.getSize$();
    } else {
      size = this.capSizeToMaximum(f, this.getSize$());
    }
    f.setSize$Dimension(size);
    if (fullscreenPanel) {
      f.setLocation$int$int(0, 0);
    } else {
      let p = this.chooseLocation(comp, size.width_, size.height_, popupPosition);
      let adjustedP = this.adjustLocationForClearSpace(p, size.width_, size.height_);
      if (popupPosition === SwingGUI$PopupPosition.CENTERED_FORCED || p.equals(adjustedP)) {
        f.setLocation$Point(p);
        f.putClientProperty(Canvas.PROPERTY_POPUP_POSITION, popupPosition);
        f.putClientProperty(Canvas.PROPERTY_RESIZABLE, resizable);
      } else {
        f.setLocation$Point(adjustedP);
      }
    }
    let layer = JLayeredPane.MODAL_LAYER;
    this.addToCanvas(f, layer);
    f.setName(comp.getClass().getSimpleName());
    f.setFrameIcon(null);
    f.setVisible(true);
    f.setResizable(resizable);
    try {
      f.setSelected(true);
    } catch ($e1) {
      if ($J.isa($e1, PropertyVetoException)) {
        let e = $J.exc($e1);
      } else {
        throw $e1;
      }
    }
    return f;
  }
  /**
   * Adds a component centered on this Canvas.
   *
   * @param comp The {@code Component} to add to this canvas.
   * @param layer The layer to add the component to (see JLayeredPane).
   */
  addCentered(comp: Component, layer: number): void {
    comp.setLocation$int$int($J.idiv(((this.oldSize.width_ - comp.getWidth()) | 0), 2), $J.idiv(((this.oldSize.height_ - comp.getHeight()) | 0), 2));
    this.addToLayer(comp, layer);
  }
  /**
   * Adds a component to this Canvas.
   *
   * @param comp The {@code Component} to add to this canvas.
   * @param layer The layer to add the component to (see JLayeredPane).
   */
  addToLayer(comp: Component, layer: number): void {
    this.addToCanvas(comp, layer);
    this.updateMenuBar();
  }
  /**
   * Adds a component to this Canvas updating the menus.
   *
   * @param comp The {@code Component} to add to this canvas.
   * @param layer The layer to add the component to (see JLayeredPane).
   */
  addToCanvas(comp: Component, layer: number): void {
    try {
      this.remove$Component(comp);
      this.add$Component$Object(comp, layer);
    } catch ($e2) {
      if ($J.isa($e2, Exception)) {
        let e = $J.exc($e2);
        Canvas.logger.log(Level.WARNING, 'addToCanvas(' + comp.getClass().getSimpleName() + ' at ' + comp.getX() + ',' + comp.getY() + ' on layer ' + layer + ') failed.', e);
      } else {
        throw $e2;
      }
    }
  }
  /**
   * Gets the internal frame for the given component.
   *
   * @param c The {@code Component}.
   * @return The given component if this is an internal frame or the
   *     first parent that is an internal frame.  Returns
   *     {@code null} if no internal frame is found.
   */
  getInternalFrame(c: Component): JInternalFrame {
    let temp = c;
    while (temp != null && !(temp instanceof JInternalFrame)) {
      temp = temp.getParent();
    }
    return temp;
  }
  /**
   * Is nothing showing?
   *
   * @return True if no dialog or panel is being shown.
   */
  nothingShowing(): boolean {
    return this.dialogs.isEmpty() && this.getShowingPanel() == null;
  }
  /**
   * Choose a location for a component.
   *
   * @param comp The {@code Component} to place.
   * @param width The component width to use.
   * @param height The component height to use.
   * @param popupPosition An optional {@code PopupPosition} hint.
   * @return A suitable {@code Point} to place the component.
   */
  chooseLocation(comp: Component, width: number, height: number, popupPosition: SwingGUI$PopupPosition): Point {
    let p = null;
    if ((comp instanceof FreeColPanel) && (p = this.getSavedPosition(comp)) != null) {
      if (p.getX() < 0 || p.getX() >= ((this.getWidth() - width) | 0) || p.getY() < 0 || p.getY() >= ((this.getHeight() - height) | 0)) {
        p = null;
      }
    }
    let x = 0;
    let y = 0;
    if (p != null) {
      x = $J.d2i(p.getX());
      y = $J.d2i(p.getY());
    } else if (popupPosition != null) {
      switch (popupPosition) {
        case SwingGUI$PopupPosition.CENTERED:
        case SwingGUI$PopupPosition.CENTERED_FORCED:
          x = $J.idiv(((this.getWidth() - width) | 0), 2);
          y = $J.idiv(((this.getHeight() - height) | 0), 2);
          break;
        case SwingGUI$PopupPosition.CENTERED_LEFT:
          x = $J.idiv(((this.getWidth() - width) | 0), 4);
          y = $J.idiv(((this.getHeight() - height) | 0), 2);
          break;
        case SwingGUI$PopupPosition.CENTERED_RIGHT:
          x = $J.idiv((Math.imul(((this.getWidth() - width) | 0), 3)), 4);
          y = $J.idiv(((this.getHeight() - height) | 0), 2);
          break;
        case SwingGUI$PopupPosition.LEFT:
          x = 0;
          y = $J.idiv(((this.getHeight() - height) | 0), 2);
          break;
        case SwingGUI$PopupPosition.LOWER_LEFT:
          x = 0;
          y = (this.getHeight() - height) | 0;
          break;
        case SwingGUI$PopupPosition.LOWER_RIGHT:
          x = (this.getWidth() - width) | 0;
          y = (this.getHeight() - height) | 0;
          break;
        case SwingGUI$PopupPosition.UPPER_RIGHT:
          x = (this.getWidth() - width) | 0;
          y = 0;
          break;
        case SwingGUI$PopupPosition.RIGHT:
          x = (this.getWidth() - width) | 0;
          y = $J.idiv(((this.getHeight() - height) | 0), 2);
          break;
        case SwingGUI$PopupPosition.UPPER_LEFT:
        case SwingGUI$PopupPosition.ORIGIN:
          x = y = 0;
          break;
      }
    }
    return new Point()._Point$int$int(x, y);
  }
  adjustLocationForClearSpace(location: Point, width: number, height: number): Point {
    let p: Point;
    let x = location.x_;
    let y = location.y_;
    if ((p = this.getClearSpace(x, y, width, height, Canvas.MAXTRY)) != null && p.x_ >= 0 && p.x_ < this.getWidth() && p.y_ >= 0 && p.y_ < this.getHeight()) {
      x = p.x_;
      y = p.y_;
    }
    return new Point()._Point$int$int(x, y);
  }
  /**
   * Try to find some free space on the canvas for a component,
   * starting at x,y.
   *
   * @param x A starting x coordinate.
   * @param y A starting y coordinate.
   * @param w The component width to use.
   * @param h The component height to use.
   * @param tries The number of attempts to find a clear space.
   * @return A {@code Point} to place the component at or null
   *     on failure.
   */
  getClearSpace(x: number, y: number, w: number, h: number, tries: number): Point {
    let bounds = this.getBounds$();
    if (!bounds.contains$int$int(x, y)) {
      return null;
    }
    tries = (Math.imul(3, tries) + 1) | 0;
    let todo = new ArrayList();
    let p = new Point()._Point$int$int(x, y);
    todo.add(p);
    let allComponents = CollectionUtils.transform$ObjectArr$Predicate(this.getComponents(), (c) => !(c instanceof GrayLayer) && c.isValid());
    allComponents.addAll(this.dialogs);
    let bestScore = 2147483647;
    let best = p;
    while (!todo.isEmpty()) {
      p = todo.removeAt(0);
      let r = new Rectangle()._Rectangle$int$int$int$int(p.x_, p.y_, w, h);
      if (!bounds.contains$Rectangle(r)) {
        continue;
      }
      let foundScore = 0;
      let found = null;
      for (const $it3 = allComponents.iterator(); $it3.hasNext(); ) {
        let c = $it3.next();
        let rb = c.getBounds$();
        if (rb.intersects$Rectangle(r)) {
          let rr = rb.intersection(r);
          let score = ($J.round(rr.getWidth() * rr.getHeight())) | 0;
          if (foundScore < score) {
            foundScore = score;
            found = c;
          }
        }
      }
      if (found == null) {
        return p;
      }
      if (bestScore > foundScore) {
        bestScore = foundScore;
        best = p;
      }
      if (--tries <= 0) {
        break;
      }
      let n = todo.size();
      let x0 = (found.getX() + found.getWidth() + 1) | 0;
      let y0 = (found.getY() + found.getHeight() + 1) | 0;
      let x1 = (bounds.x_ + bounds.width_ - w - 1) | 0;
      let y1 = (bounds.y_ + bounds.height_ - h - 1) | 0;
      let x2 = bounds.x_;
      let y2 = bounds.y_;
      let x0ok = bounds.contains$int$int((x0 + w) | 0, y);
      let y0ok = bounds.contains$int$int(x, (y0 + h) | 0);
      let x1ok = bounds.contains$int$int(x1, y);
      let y1ok = bounds.contains$int$int(x, y1);
      todo.add(n, new Point()._Point$int$int((x0ok) ? x0 : (x1ok) ? x1 : x2, (y0ok) ? y0 : (y1ok) ? y1 : y2));
      todo.add(n, new Point()._Point$int$int(x, (y0ok) ? y0 : (y1ok) ? y1 : y2));
      todo.add(n, new Point()._Point$int$int((x0ok) ? x0 : (x1ok) ? x1 : x2, y));
    }
    return best;
  }
  /**
   * Gets the saved position of a component.
   *
   * @param comp The {@code Component} to use.
   * @return The saved position as a {@code Point}, or null if no
   *     saved position is found.
   */
  getSavedPosition(comp: Component): Point {
    let co = this.freeColClient.getClientOptions();
    if (co == null) {
      return null;
    }
    try {
      if (!co.getBoolean(ClientOptions.REMEMBER_PANEL_POSITIONS)) {
        return null;
      }
    } catch ($e4) {
      if ($J.isa($e4, Exception)) {
        let e = $J.exc($e4);
      } else {
        throw $e4;
      }
    }
    return co.getPanelPosition(comp.getClass().getName());
  }
  /**
   * Get the saved size of a component.
   *
   * @param comp The {@code Component} to use.
   * @return A {@code Dimension} for the component or null if
   *     no saved size is found.
   */
  getSavedSize(comp: Component): Dimension {
    let co = this.freeColClient.getClientOptions();
    if (co == null) {
      return null;
    }
    try {
      if (!co.getBoolean(ClientOptions.REMEMBER_PANEL_SIZES)) {
        return null;
      }
    } catch ($e5) {
      if ($J.isa($e5, Exception)) {
        let e = $J.exc($e5);
      } else {
        throw $e5;
      }
    }
    return co.getPanelSize(comp.getClass().getName());
  }
  /**
   * Save an {@code int} value to the saved ClientOptions,
   * using the name of the components class plus the given key as
   * and identifier.
   *
   * @param className The class name for the component.
   * @param key The key to save.
   * @param value The value to save.
   */
  saveInteger(className: string, key: string, value: number): void {
    if (this.freeColClient == null) {
      return;
    }
    let co = this.freeColClient.getClientOptions();
    if (co == null) {
      return;
    }
    let etc = co.getOptionGroup(ClientOptions.ETC);
    if (etc == null) {
      return;
    }
    if (!etc.hasOption(className + key, $J.cls(IntegerOption))) {
      let specification = (this.freeColClient.getGame() == null) ? null : this.freeColClient.getGame().getSpecification();
      etc.add(new IntegerOption()._IntegerOption$String$Specification(className + key, specification));
    }
    etc.setInteger(className + key, value);
  }
  /**
   * Save the position of a component.
   *
   * @param comp The {@code Component} to use.
   * @param position The position to save.
   */
  savePosition(comp: Component, position: Point): void {
    try {
      if (!this.freeColClient.getClientOptions().getBoolean(ClientOptions.REMEMBER_PANEL_POSITIONS)) {
        return;
      }
    } catch ($e6) {
      if ($J.isa($e6, Exception)) {
        let e = $J.exc($e6);
      } else {
        throw $e6;
      }
    }
    let className = comp.getClass().getName();
    this.saveInteger(className, '.x', position.x_);
    this.saveInteger(className, '.y', position.y_);
  }
  /**
   * Save the size of a component.
   *
   * @param comp The {@code Component} to use.
   * @param size The {@code Dimension} to save.
   */
  saveSize(comp: Component, size: Dimension): void {
    try {
      if (!this.freeColClient.getClientOptions().getBoolean(ClientOptions.REMEMBER_PANEL_SIZES)) {
        return;
      }
    } catch ($e7) {
      if ($J.isa($e7, Exception)) {
        let e = $J.exc($e7);
      } else {
        throw $e7;
      }
    }
    let className = comp.getClass().getName();
    this.saveInteger(className, '.w', size.width_);
    this.saveInteger(className, '.h', size.height_);
  }
  /**
   * A component is closing.  Some components need position and size
   * to be saved.
   *
   * @param c The closing {@code Component}.
   * @param jif The enclosing {@code JInternalFrame}.
   */
  notifyClose(c: Component, jif: JInternalFrame): void {
    if (c instanceof FreeColPanel) {
      let fcp = c;
      fcp.firePropertyChange$String$boolean$boolean('closing', false, true);
      if (this.nothingShowing() && !(c instanceof InfoPanel) && !(c instanceof MiniMapFreeColPanel)) {
        this.updateMenuBar();
      }
    }
  }
  savePositionAndSize(c: Component, jif: JInternalFrame): void {
    if (c instanceof FreeColPanel) {
      let fcp = c;
      if (fcp.isFullscreen()) {
        return;
      }
      this.savePosition(fcp, jif.getLocation$());
      this.saveSize(fcp, fcp.getSize$());
    }
  }
  /**
   * Removes components that is only used when in game.
   */
  removeInGameComponents(): void {
    this.removeKeyAndMouseListeners();
    for (let f of this.getAllFrames()) {
      let fcp = this.getFreeColPanel(f);
      if (fcp != null) {
        this.removeFromCanvas(fcp);
      } else {
        this.removeFromCanvas(f);
      }
    }
    for (let c of this.getComponents()) {
      if (c instanceof CanvasMapViewer) {
        continue;
      }
      this.removeFromCanvas(c);
    }
  }
  removeKeyAndMouseListeners(): void {
    let keyListeners = this.getKeyListeners();
    for (let keyListener of keyListeners) {
      this.removeKeyListener(keyListener);
    }
    let mouseListeners = this.getMouseListeners();
    for (let mouseListener of mouseListeners) {
      this.removeMouseListener(mouseListener);
    }
    let mouseMotionListeners = this.getMouseMotionListeners();
    for (let mouseMotionListener of mouseMotionListeners) {
      this.removeMouseMotionListener(mouseMotionListener);
    }
  }
  /**
   * Map editor initialization.
   */
  startMapEditorGUI(): void {
    this.removeKeyAndMouseListeners();
    this.freeColClient.updateActions();
    this.parentFrame.setMenuBar$FreeColMenuBar(new MapEditorMenuBar()._MapEditorMenuBar(this.freeColClient, new MenuMouseMotionListener()._MenuMouseMotionListener(this.scrolling)));
    let listener = new CanvasMapEditorMouseListener()._CanvasMapEditorMouseListener(this.freeColClient, this.scrolling);
    this.addMouseListener(listener);
    this.addMouseMotionListener(listener);
  }
  /**
   * In game initializations.
   */
  initializeInGame(): void {
    this.removeKeyAndMouseListeners();
    this.parentFrame.setMenuBar$FreeColMenuBar(new InGameMenuBar()._InGameMenuBar(this.freeColClient, new MenuMouseMotionListener()._MenuMouseMotionListener(this.scrolling)));
    this.addMouseListener(new CanvasMouseListener()._CanvasMouseListener(this.freeColClient));
    this.addMouseMotionListener(new CanvasMouseMotionListener()._CanvasMouseMotionListener(this.freeColClient, this.scrolling));
  }
  /**
   * Quit the canvas.
   */
  quit(): void {
    this.destroyFrame();
  }
  /**
   * Set preferred size to saved size, or to the given
   * {@code Dimension} if no saved size was found. Call this
   * method in the constructor of a FreeColPanel in order to
   * remember its size and position.
   *
   * @param comp The {@code Component} to use.
   * @param d The {@code Dimension} to use as default.
   */
  restoreSavedSize(comp: Component, d: Dimension): void {
    if (comp instanceof FreeColPanel && (comp).isFullscreen()) {
      return;
    }
    let pref = comp.getPreferredSize$();
    let sugg = (d == null) ? pref : d;
    let save = false;
    let size = this.getSavedSize(comp);
    if (size == null) {
      size = new Dimension()._Dimension$Dimension(pref);
      save = true;
    }
    if (size.width_ < sugg.width_) {
      size.width_ = sugg.width_;
      save = true;
    }
    if (size.height_ < sugg.height_) {
      size.height_ = sugg.height_;
      save = true;
    }
    if (size.width_ < pref.width_) {
      size.width_ = pref.width_;
      save = true;
    }
    if (size.height_ < pref.height_) {
      size.height_ = pref.height_;
      save = true;
    }
    if (save) {
      this.saveSize(comp, size);
    }
    if (!pref.equals(size)) {
      comp.setPreferredSize(size);
    }
  }
  /**
   * Add and remove animation labels.
   *
   * @param label A {@code JLabel} for an animation.
   * @param add If true, add the label, else remove it.
   */
  animationLabel(label: JLabel, add: boolean): void {
    if (add) {
      this.addToCanvas(label, JLayeredPane.DEFAULT_LAYER);
    } else {
      this.removeFromCanvas(label);
    }
  }
  /**
   * Close a panel by class name.
   *
   * @param panel The panel to close.
   */
  closePanel(panel: string): void {
    if (panel.endsWith('Panel')) {
      for (let c1 of this.getComponents()) {
        if (c1 instanceof JInternalFrame) {
          let jif = c1;
          for (let c2 of jif.getContentPane().getComponents()) {
            if ($J.equals(panel, c2.getClass().getName())) {
              this.savePositionAndSize(c2, jif);
              this.notifyClose(c2, jif);
              return;
            }
          }
        }
      }
    } else if (panel.endsWith('Dialog')) {
      for (const $it8 = new ArrayList(this.dialogs).iterator(); $it8.hasNext(); ) {
        let fcd = $it8.next();
        if ($J.equals(panel, fcd.getClass().getName())) {
          this.dialogs.remove(fcd);
          fcd.dispose();
          return;
        }
      }
    }
  }
  /**
   * Add a dialog to the current dialog list.
   *
   * @param fcd The dialog to add.
   */
  dialogAdd(fcd: FreeColDialog<any>): void {
    if (fcd.isModal()) {
      this.mapViewer.getMapViewerState().setCursorBlinking(false);
    }
    this.dialogs.add(fcd);
  }
  /**
   * Remove a dialog from the current dialog list.
   *
   * @param fcd The dialog to remove.
   */
  dialogRemove(fcd: FreeColDialog<any>): void {
    this.dialogs.remove(fcd);
    if (fcd.isModal() && (CollectionUtils.none$Collection$Predicate(this.dialogs, ($p0) => $p0.isModal()))) {
      this.mapViewer.getMapViewerState().setCursorBlinking(true);
    }
    if (this.nothingShowing()) {
      this.updateMenuBar();
    }
  }
  /**
   * Get a currentlydisplayed FreeColDialog of a given type.
   *
   * @param type The class of dialog to look for.
   * @return The {@code FreeColDialog} found, or null if none present.
   */
  getExistingFreeColDialog(type$: JClass<any>): FreeColDialog<any> {
    for (const $it9 = this.dialogs.iterator(); $it9.hasNext(); ) {
      let d = $it9.next();
      if (d.getClass() === type$) {
        return d;
      }
    }
    return null;
  }
  /**
   * Gets a currently displayed FreeColPanel of a given type.
   *
   * @param <T> The actual panel type.
   * @param type The type of {@code FreeColPanel} to look for.
   * @return A currently displayed {@code FreeColPanel} of the
   *     requested type, or null if none found.
   */
  getExistingFreeColPanel<T>(type$: JClass<T>): T {
    for (let f of this.getAllFrames()) {
      for (let c2 of f.getContentPane().getComponents()) {
        if (type$.isAssignableFrom(c2.getClass())) {
          return type$.cast(c2);
        }
      }
    }
    for (let c1 of this.getComponents()) {
      if (c1 instanceof JInternalFrame) {
        for (let c2 of (c1).getContentPane().getComponents()) {
          try {
            let ret = type$.cast(c2);
            if (ret != null) {
              let jif = c1;
              SwingUtilities.invokeLater(() => {
                jif.toFront();
                jif.repaint$();
              });
              return ret;
            }
          } catch ($e10) {
            if ($J.isa($e10, ClassCastException)) {
              let cce = $J.exc($e10);
            } else {
              throw $e10;
            }
          }
        }
      }
    }
    return null;
  }
  isAddedAsPanelFrameOrIcon$Class(clazz: JClass<any>): boolean {
    for (let f of this.getAllFrames()) {
      for (let c2 of f.getContentPane().getComponents()) {
        if (clazz.isAssignableFrom(c2.getClass())) {
          return true;
        }
      }
    }
    for (let c1 of this.getComponents()) {
      if (clazz.isAssignableFrom(c1.getClass())) {
        return true;
      }
    }
    return false;
  }
  isAddedAsPanelFrameOrIcon$Component(component: Component): boolean {
    for (let f of this.getAllFrames()) {
      for (let c2 of f.getContentPane().getComponents()) {
        if (component === c2) {
          return true;
        }
      }
    }
    for (let c1 of this.getComponents()) {
      if (component === c1) {
        return true;
      }
    }
    return false;
  }
  /**
   * Gets any currently displayed component matching a predicate.
   *
   * @param pred The predicate to apply.
   * @return The first match for the predicate, or null if none found.
   */
  getMatchingComponent(pred: Predicate<Component>): Component {
    for (let c1 of this.getComponents()) {
      if (c1 instanceof JInternalFrame) {
        for (let c2 of (c1).getContentPane().getComponents()) {
          if (pred(c2)) {
            return c2;
          }
        }
      }
    }
    return null;
  }
  /**
   * Get any panel this {@code Canvas} is displaying.
   *
   * @return A {@code Component} the {@code Canvas} is
   *     displaying, or null if none found.
   */
  getShowingPanel(): Component {
    for (let c of this.getComponents()) {
      if (c instanceof Canvas$ToolBoxFrame) {
        continue;
      }
      if (c instanceof JInternalFrame) {
        return c;
      } else if (c instanceof JInternalFrame$JDesktopIcon) {
        return c;
      }
    }
    return null;
  }
  /**
   * Removes the given component from this canvas without
   * updating the menu bar.
   *
   * @param comp The {@code Component} to remove.
   */
  removeFromCanvas(comp: Component): void {
    if (comp == null) {
      return;
    }
    let updateBounds = comp.getBounds$();
    let jif = this.getInternalFrame(comp);
    if (jif != null) {
      this.savePositionAndSize(comp, jif);
    }
    if (jif != null && jif !== comp) {
      jif.dispose();
    } else {
      try {
        super.remove$Component(comp);
      } catch ($e11) {
        if ($J.isa($e11, Exception)) {
          let e = $J.exc($e11);
          Canvas.logger.log(Level.WARNING, 'Java crash', e);
        } else {
          throw $e11;
        }
      }
    }
    if (jif != null) {
      this.notifyClose(comp, jif);
    }
    this.repaint$int$int$int$int(updateBounds.x_, updateBounds.y_, updateBounds.width_, updateBounds.height_);
  }
  /**
   * Displays the given dialog, optionally making sure a tile is visible.
   *
   * @param <T> The type to be returned from the dialog.
   * @param dialog The {@code FreeColDialog} to be displayed
   * @param pos A {@code PopupPosition} for the dialog.
   * @return The {@link FreeColDialog#getResponse reponse} returned by
   *     the dialog.
   */
  showFreeColDialog<T>(dialog: FreeColDialog<T>, pos: SwingGUI$PopupPosition): T {
    this.viewFreeColDialog(dialog, pos);
    let response = dialog.getResponse();
    this.remove$Component(dialog);
    this.dialogRemove(dialog);
    return response;
  }
  /**
   * Displays a {@code FreeColPanel} at a generalized position.
   *
   * @param panel {@code FreeColPanel}, panel to show
   * @param popupPosition {@code PopupPosition} The generalized
   *     position to place the panel.
   * @param resizable Should the panel be resizable?
   * @return The panel.
   */
  showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel: FreeColPanel, popupPosition: SwingGUI$PopupPosition, resizable: boolean): FreeColPanel {
    return this.showFreeColPanel$FreeColPanel$boolean$PopupPosition$boolean(panel, false, popupPosition, resizable);
  }
  /**
   * Displays a {@code FreeColPanel} at a generalized position.
   *
   * @param panel {@code FreeColPanel}, panel to show
   * @param toolBox Should be set to true if the resulting frame is
   *     used as a toolbox (that is: it should not be counted as a
   *     frame).
   * @param popupPosition {@code PopupPosition} The generalized
   *     position to place the panel.
   * @param resizable Should the panel be resizable?
   * @return The panel.
   */
  showFreeColPanel$FreeColPanel$boolean$PopupPosition$boolean(panel: FreeColPanel, toolBox: boolean, popupPosition: SwingGUI$PopupPosition, resizable: boolean): FreeColPanel {
    this.repaint$();
    this.addAsFrame(panel, toolBox, popupPosition, resizable);
    panel.requestFocus$();
    this.freeColClient.getActionManager().update();
    return panel;
  }
  /**
   * Displays the given dialog, optionally making sure a tile is visible.
   *
   * @param <T> The type to be returned from the dialog.
   * @param freeColDialog The dialog to be displayed
   * @param pos A {@code PopupPosition} for the dialog.
   */
  viewFreeColDialog<T>(freeColDialog: FreeColDialog<T>, pos: SwingGUI$PopupPosition): void {
    if (!freeColDialog.isModal()) {
      let canvasWidth = this.getWidth();
      let dialogWidth = freeColDialog.getWidth();
      if (Math.imul(dialogWidth, 2) <= canvasWidth) {
        let location = freeColDialog.getLocation$();
        if (pos === SwingGUI$PopupPosition.CENTERED_LEFT) {
          freeColDialog.setLocation$int$int((location.x_ - $J.idiv(canvasWidth, 4)) | 0, location.y_);
        } else if (pos === SwingGUI$PopupPosition.CENTERED_RIGHT) {
          freeColDialog.setLocation$int$int((location.x_ + $J.idiv(canvasWidth, 4)) | 0, location.y_);
        }
      }
    }
    this.dialogAdd(freeColDialog);
    freeColDialog.requestFocus$();
    freeColDialog.setVisible(true);
  }
  /**
   * Are we in windowed mode?
   *
   * @return True if in windowed mode.
   */
  isWindowed(): boolean {
    return this.windowed;
  }
  /**
   * Get the parent frame.
   *
   * Do not use this except inside Widgets (which is really just an
   * extension of Canvas).
   *
   * @return The parent {@code FreeColFrame}.
   */
  getParentFrame(): FreeColFrame {
    return this.parentFrame;
  }
  /**
   * Toggle the frame between windowed and non-windowed modes.
   */
  toggleFrame(): void {
    let menuBar = null;
    let windowBounds = null;
    if (this.parentFrame != null) {
      menuBar = this.parentFrame.getJMenuBar();
      windowBounds = this.parentFrame.getBounds$();
    }
    this.destroyFrame();
    this.toggleWindowed();
    this.parentFrame = this.createFrame(menuBar, windowBounds);
    this.parentFrame.setVisible(true);
  }
  /**
   * Add the map controls.
   *
   * @return True if any were added.
   */
  addMapControls(): boolean {
    if (this.mapControls == null) {
      return false;
    }
    let components = this.mapControls.getComponentsToAdd(this.oldSize);
    if (this.hasAtLeastOneMapControlFrom(components)) {
      return false;
    }
    for (const $it12 = components.iterator(); $it12.hasNext(); ) {
      let c = $it12.next();
      if (this.freeColClient.isMapEditor()) {
        this.addAsFrame(c, true, null, true);
      } else {
        this.addToCanvas(c, JLayeredPane.MODAL_LAYER);
      }
    }
    return !components.isEmpty();
  }
  hasAtLeastOneMapControlFrom(components: List<JComponent>): boolean {
    for (const $it13 = components.iterator(); $it13.hasNext(); ) {
      let c = $it13.next();
      if (this.isAddedAsPanelFrameOrIcon$Component(c)) {
        return true;
      }
    }
    return false;
  }
  /**
   * Remove the map controls.
   *
   * @return True if any were removed.
   */
  removeMapControls(): boolean {
    if (this.mapControls == null) {
      return false;
    }
    let components = this.mapControls.getComponentsPresent();
    let ret = false;
    for (const $it14 = components.iterator(); $it14.hasNext(); ) {
      let c = $it14.next();
      this.removeFromCanvas(c);
      ret = true;
    }
    this.mapControls.clear();
    return ret;
  }
  /**
   * Closes all the menus that are currently open.
   */
  closeMenus(): void {
    for (let jif of this.getAllFrames()) {
      for (let c of jif.getContentPane().getComponents()) {
        this.savePositionAndSize(c, jif);
        this.notifyClose(c, jif);
      }
      jif.dispose();
    }
    while (!this.dialogs.isEmpty()) {
      let dialog = this.dialogs.removeAt(0);
      dialog.dispose();
    }
  }
  /**
   * Reset the menu bar.
   */
  resetMenuBar(): void {
    this.freeColClient.updateActions();
    this.parentFrame.resetMenuBar();
  }
  /**
   * Update the menu bar.
   */
  updateMenuBar(): void {
    this.freeColClient.updateActions();
    this.parentFrame.updateMenuBar();
  }
  /**
   * Play the opening video.
   *
   * @param videoId An identifier for the video content.
   * @param muteAudio Mute if true.
   * @param runnable A {@code Runnable} to run on completion.
   */
  playVideo(videoId: string, muteAudio: boolean, runnable: Runnable): void {
    let video = ImageLibrary.getVideo(videoId);
    if (video == null) {
      runnable();
      return;
    }
    let originalVendor = $J.system_getProperty('java.vendor');
    if (originalVendor.indexOf(' ') === -1) {
      $J.system_setProperty('java.vendor', originalVendor + ' cortadoBugFix');
    }
    let vc = new VideoComponent()._VideoComponent(video, muteAudio, this.getSize$());
    // class AbortListener: Canvas$1AbortListener(), below
    this.closeMenus();
    let l = new (Canvas$1AbortListener())().$o(this).$c(vc, originalVendor, runnable)._AbortListener();
    this.addMouseListener(l);
    this.addKeyListener(l);
    vc.addMouseListener(l);
    vc.addKeyListener(l);
    l.startTimer(80000);
    this.addCentered(vc, JLayeredPane.PALETTE_LAYER);
    vc.play();
  }
  /**
   * Closes the {@link MainPanel}.
   */
  closeMainPanel(): void {
    if (this.mainPanel != null) {
      this.remove$Component(this.mainPanel);
      this.mainPanel = null;
    }
  }
  /**
   * Closes all panels, changes the background and shows the main menu.
   */
  mainTitle(): void {
    this.showMainPanel();
    this.revalidate();
    this.repaint$();
  }
  mainTitleIfMainPanelIsAlreadyShowing(): void {
    if (this.mainPanel != null && this.mainPanel.isShowing()) {
      this.mainTitle();
    }
  }
  /**
   * Shows the {@code MainPanel}.
   *
   * @return The main panel.
   */
  showMainPanel(): FreeColPanel {
    this.prepareShowingMainMenu();
    this.mainPanel = new MainPanel()._MainPanel(this.freeColClient);
    this.addAsFrame(this.mainPanel, false, SwingGUI$PopupPosition.CENTERED_FORCED, false);
    this.mainPanel.requestFocus$();
    return this.mainPanel;
  }
  prepareShowingMainMenu(): void {
    this.removeInGameComponents();
    this.closeMenus();
    this.closeMainPanel();
    this.parentFrame.removeMenuBar();
  }
  /**
   * Display the map editor transform panel.
   */
  showMapEditorTransformPanel(): void {
    let panel = new MapEditorTransformPanel()._MapEditorTransformPanel(this.freeColClient);
    this.addAsFrame(panel, true, null, true);
    this.repaint$();
  }
  /**
   * Display the map editor toolbox panel.
   */
  showMapEditorToolboxPanel(): void {
    let panel = new MapEditorToolboxPanel()._MapEditorToolboxPanel(this.freeColClient);
    this.addAsFrame(panel, true, null, true);
    this.repaint$();
  }
  paintJustTheMapImmediately(): void {
    if (this.freeColClient == null || this.freeColClient.getGame() == null || this.freeColClient.getGame().getMap() == null) {
      return;
    }
    this.canvasMapViewer.paintImmediately$();
  }
  /**
   * {@inheritDoc}
   */
  paintComponent(g: Graphics): void {
    super.paintComponent(g);
    if (!this.freeColClient.isInGame()) {
      return;
    }
    let hasMap = this.freeColClient != null && this.freeColClient.getGame() != null && this.freeColClient.getGame().getMap() != null;
    if (hasMap) {
      let size = this.getSize$();
      if (this.freeColClient.currentPlayerIsMyPlayer()) {
        if (this.greyLayer.getParent() != null) {
          this.removeFromCanvas(this.greyLayer);
        }
      } else {
        this.greyLayer.setBounds$int$int$int$int(0, 0, size.width_, size.height_);
        this.greyLayer.setPlayer(this.freeColClient.getGame().getCurrentPlayer());
        if (this.greyLayer.getParent() == null) {
          this.addToCanvas(this.greyLayer, JLayeredPane.DRAG_LAYER);
        }
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  remove$Component(comp: Component): void {
    this.removeFromCanvas(comp);
  }
  static $clinit() {
    Canvas.logger = Logger.getLogger($J.cls(Canvas).getName());
    Canvas.GO_CURSOR = UIManager.get$Object('cursor.go');
  }
}

/**
 * A class for frames being used as tool boxes.
 */
export class Canvas$ToolBoxFrame extends JInternalFrame {
  _Canvas$ToolBoxFrame(): this {
    this._JInternalFrame$();
    return this;
  }
}

let $Canvas$1: any = null;
/** An anonymous class (Canvas.java:205). */
function Canvas$1(): any {
  return $Canvas$1 ??= $J.local(class extends JObject {
    componentResized(e: ComponentEvent): void {
      this.$outer.updateSize();
    }
    componentMoved(e: ComponentEvent): void {
      this.$outer.updateSize();
    }
    componentShown(e: ComponentEvent): void {
      this.$outer.updateSize();
    }
    componentHidden(e: ComponentEvent): void {
      this.$outer.updateSize();
    }
  }, 'net.sf.freecol.client.gui.Canvas$1', ['java.awt.event.ComponentListener']);
}

let $Canvas$2: any = null;
/** An anonymous class (Canvas.java:466). */
function Canvas$2(): any {
  return $Canvas$2 ??= $J.local(class extends JInternalFrame {
    getMinimumSize$(): Dimension {
      let innerDimension = this.$cv_comp.getMinimumSize$();
      let insets = this.getInsets$();
      return new Dimension()._Dimension$int$int((innerDimension.width_ + insets.left + insets.right) | 0, (innerDimension.height_ + insets.top + insets.bottom) | 0);
    }
    $c($comp): this {
      this.$cv_comp = $comp;
      return this;
    }
  }, 'net.sf.freecol.client.gui.Canvas$2', []);
}

let $Canvas$3: any = null;
/** An anonymous class (Canvas.java:540). */
function Canvas$3(): any {
  return $Canvas$3 ??= $J.local(class extends InternalFrameAdapter {
    internalFrameClosing(e: InternalFrameEvent): void {
      this.$outer.savePositionAndSize(this.$cv_comp, this.$cv_f);
      if (this.$cv_comp instanceof FreeColPanel) {
        (this.$cv_comp).onFrameClosing();
      }
    }
    $c($comp, $f): this {
      this.$cv_comp = $comp; this.$cv_f = $f;
      return this;
    }
  }, 'net.sf.freecol.client.gui.Canvas$3', []);
}

let $Canvas$1AbortListener: any = null;
/** The local class AbortListener (Canvas.java:1559). */
function Canvas$1AbortListener(): any {
  return $Canvas$1AbortListener ??= $J.local(class extends JObject {
    t: Timer = null;
    _AbortListener(): this {
      this.t = null;
      return this;
    }
    keyPressed(e: KeyEvent): void {
    }
    keyReleased(e1: KeyEvent): void {
      this.execute();
    }
    keyTyped(e2: KeyEvent): void {
    }
    mouseClicked(e3: MouseEvent): void {
      this.execute();
    }
    mouseEntered(e4: MouseEvent): void {
    }
    mouseExited(e5: MouseEvent): void {
    }
    mousePressed(e6: MouseEvent): void {
    }
    mouseReleased(e7: MouseEvent): void {
    }
    stopped(): void {
      this.execute();
    }
    actionPerformed(ae: ActionEvent): void {
      this.execute();
    }
    startTimer(tim: number): void {
      this.t = new Timer()._Timer(tim, $J.fn(this, 'actionPerformed'));
      this.t.setRepeats(false);
      this.t.start();
    }
    execute(): void {
      this.$outer.removeKeyListener(this);
      this.$outer.removeMouseListener(this);
      this.$cv_vc.removeMouseListener(this);
      this.$cv_vc.stop();
      this.$outer.remove$Component(this.$cv_vc);
      if (this.t != null) {
        this.t.stop();
      }
      $J.system_setProperty('java.vendor', this.$cv_originalVendor);
      this.$cv_runnable();
    }
    $c($vc, $originalVendor, $runnable): this {
      this.$cv_vc = $vc; this.$cv_originalVendor = $originalVendor; this.$cv_runnable = $runnable;
      return this;
    }
  }, 'net.sf.freecol.client.gui.Canvas$1AbortListener', ['java.awt.event.ActionListener', 'java.awt.event.KeyListener', 'java.awt.event.MouseListener', 'net.sf.freecol.client.gui.video.VideoListener']);
}

$J.define(Canvas, 'net.sf.freecol.client.gui.Canvas', { kind: 'class', sup: 'javax.swing.JDesktopPane', ctors: { 'net.sf.freecol.client.FreeColClient,java.awt.GraphicsDevice,java.awt.Dimension,net.sf.freecol.client.gui.mapviewer.MapViewer,net.sf.freecol.client.gui.panel.MapControls': '_Canvas' }, returns: { 'getParentFrame': 'net.sf.freecol.client.gui.FreeColFrame', 'isWindowed': 'boolean', 'getShowingPanel': 'java.awt.Component' }, meths: { 'remove(java.awt.Component)': 'remove$Component', 'showFreeColPanel(net.sf.freecol.client.gui.panel.FreeColPanel,boolean,net.sf.freecol.client.gui.SwingGUI$PopupPosition,boolean)': 'showFreeColPanel$FreeColPanel$boolean$PopupPosition$boolean', 'showFreeColPanel(net.sf.freecol.client.gui.panel.FreeColPanel,net.sf.freecol.client.gui.SwingGUI$PopupPosition,boolean)': 'showFreeColPanel$FreeColPanel$PopupPosition$boolean', 'isAddedAsPanelFrameOrIcon(java.awt.Component)': 'isAddedAsPanelFrameOrIcon$Component', 'isAddedAsPanelFrameOrIcon(java.lang.Class)': 'isAddedAsPanelFrameOrIcon$Class' }, clinit: true, lazy: ['logger', 'GO_CURSOR'] });
$J.define(Canvas$ToolBoxFrame, 'net.sf.freecol.client.gui.Canvas$ToolBoxFrame', { kind: 'class', sup: 'javax.swing.JInternalFrame', ctors: { '': '_Canvas$ToolBoxFrame' } });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  Point = $J.load('java.awt.Point');
  Rectangle = $J.load('java.awt.Rectangle');
  PropertyVetoException = $J.load('java.beans.PropertyVetoException');
  JComponent = $J.load('javax.swing.JComponent');
  JInternalFrame$JDesktopIcon = $J.load('javax.swing.JInternalFrame$JDesktopIcon');
  JLayeredPane = $J.load('javax.swing.JLayeredPane');
  JRootPane = $J.load('javax.swing.JRootPane');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  Timer = $J.load('javax.swing.Timer');
  UIManager = $J.load('javax.swing.UIManager');
  EmptyBorder = $J.load('javax.swing.border.EmptyBorder');
  InternalFrameAdapter = $J.load('javax.swing.event.InternalFrameAdapter');
  BasicInternalFrameUI = $J.load('javax.swing.plaf.basic.BasicInternalFrameUI');
  ClientOptions = $J.load('net.sf.freecol.client.ClientOptions');
  CanvasMapEditorMouseListener = $J.load('net.sf.freecol.client.gui.CanvasMapEditorMouseListener');
  CanvasMouseListener = $J.load('net.sf.freecol.client.gui.CanvasMouseListener');
  CanvasMouseMotionListener = $J.load('net.sf.freecol.client.gui.CanvasMouseMotionListener');
  FrameMotionListener = $J.load('net.sf.freecol.client.gui.FrameMotionListener');
  FreeColFrame = $J.load('net.sf.freecol.client.gui.FreeColFrame');
  GrayLayer = $J.load('net.sf.freecol.client.gui.GrayLayer');
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  Scrolling = $J.load('net.sf.freecol.client.gui.Scrolling');
  SwingGUI$PopupPosition = $J.load('net.sf.freecol.client.gui.SwingGUI$PopupPosition');
  CanvasMapViewer = $J.load('net.sf.freecol.client.gui.mapviewer.CanvasMapViewer');
  InGameMenuBar = $J.load('net.sf.freecol.client.gui.menu.InGameMenuBar');
  MapEditorMenuBar = $J.load('net.sf.freecol.client.gui.menu.MapEditorMenuBar');
  MenuMouseMotionListener = $J.load('net.sf.freecol.client.gui.menu.MenuMouseMotionListener');
  FreeColPanel = $J.load('net.sf.freecol.client.gui.panel.FreeColPanel');
  InfoPanel = $J.load('net.sf.freecol.client.gui.panel.InfoPanel');
  MainPanel = $J.load('net.sf.freecol.client.gui.panel.MainPanel');
  MapEditorToolboxPanel = $J.load('net.sf.freecol.client.gui.panel.MapEditorToolboxPanel');
  MapEditorTransformPanel = $J.load('net.sf.freecol.client.gui.panel.MapEditorTransformPanel');
  MiniMapFreeColPanel = $J.load('net.sf.freecol.client.gui.panel.MiniMapFreeColPanel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  VideoComponent = $J.load('net.sf.freecol.client.gui.video.VideoComponent');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  IntegerOption = $J.load('net.sf.freecol.common.option.IntegerOption');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
