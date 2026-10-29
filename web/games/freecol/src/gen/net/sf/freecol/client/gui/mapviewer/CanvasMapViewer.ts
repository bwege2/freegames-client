// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/mapviewer/CanvasMapViewer.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
import { $J, Logger, TextLayout } from '../../../../../../../jre/index.ts';
import { JComponent } from '../../../../../../javax/swing/JComponent.ts';

let Color, Font, RenderingHints, FreeCol, ImageLibrary, FreeColDebugger;

/**
 * A component using {@code MapViewer} to display the map, or to display
 * various background images when the map is unavailable.
 */
export class CanvasMapViewer extends JComponent {
  static logger: Logger = null;
  freeColClient: FreeColClient = null;
  mapViewer: MapViewer = null;
  averageFullMapRenderTimeInMillis: number = 0;
  fullMapRenderNumber: number = 0;
  lastFullMapRenderTimeInMillis: number = 0;
  _CanvasMapViewer(freeColClient: FreeColClient, mapViewer: MapViewer): this {
    this._JComponent();
    this.averageFullMapRenderTimeInMillis = 0;
    this.fullMapRenderNumber = 0;
    this.lastFullMapRenderTimeInMillis = 0;
    this.freeColClient = freeColClient;
    this.mapViewer = mapViewer;
    this.setLayout(null);
    return this;
  }
  /**
   * Change the displayed map size.
   *
   * @param size The new map size.
   */
  changeSize(size: Dimension): void {
    this.setSize$Dimension(size);
    this.mapViewer.changeSize(size);
  }
  paintImmediately$(): void {
    if (!this.isMapAvailable()) {
      return;
    }
    this.paintImmediately$int$int$int$int(0, 0, this.getWidth(), this.getHeight());
  }
  paintComponent(g: Graphics): void {
    let startTime = $J.system_currentTimeMillis();
    super.paintComponent(g);
    let size = this.getSize$();
    let g2d = g;
    let fullMapRenderedWithoutUsingBackBuffer = false;
    if (this.isMapAvailable()) {
      fullMapRenderedWithoutUsingBackBuffer = this.mapViewer.displayMap(g2d, size);
    } else if (this.freeColClient.isMapEditor()) {
      this.paintBlackBackground(g2d, size);
    } else {
      this.paintMainMenuBackground(g2d, size);
    }
    if (FreeColDebugger.debugRendering()) {
      this.drawRenderingTimeStrings(g, startTime, fullMapRenderedWithoutUsingBackBuffer);
    }
  }
  isMapAvailable(): boolean {
    return this.freeColClient != null && this.freeColClient.getGame() != null && this.freeColClient.getGame().getMap() != null;
  }
  paintMainMenuBackground(g2d: Graphics2D, size: Dimension): void {
    let bgImage = ImageLibrary.getCanvasBackgroundImage();
    if (bgImage != null) {
      g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
      g2d.drawImage$Image$int$int$int$int$ImageObserver(bgImage, 0, 0, size.width_, size.height_, this);
      let versionStr = 'v. ' + FreeCol.getVersion();
      let oldFont = g2d.getFont();
      let oldColor = g2d.getColor();
      let newFont = oldFont.deriveFont$int(Font.BOLD);
      let layout = new TextLayout(versionStr, newFont, g2d.getFontRenderContext());
      let bounds = layout.getBounds();
      let x = Math.fround(Math.fround(size.width_ - Math.fround(bounds.getWidth())) - 5);
      let y = Math.fround(size.height_ - Math.fround(bounds.getHeight()));
      g2d.setColor(Color.white);
      layout.draw(g2d, x, y);
      g2d.setFont(oldFont);
      g2d.setColor(oldColor);
    } else {
      g2d.setColor(Color.WHITE);
      g2d.fillRect(0, 0, size.width_, size.height_);
      CanvasMapViewer.logger.warning('Unable to load the canvas background');
    }
  }
  paintBlackBackground(g2d: Graphics2D, size: Dimension): void {
    g2d.setColor(Color.BLACK);
    g2d.fillRect(0, 0, size.width_, size.height_);
  }
  drawRenderingTimeStrings(g: Graphics, startTime: number, fullMapRenderedWithoutUsingBackBuffer: boolean): void {
    g.setColor(Color.white);
    let renderTime = $J.system_currentTimeMillis() - startTime;
    if (fullMapRenderedWithoutUsingBackBuffer) {
      this.lastFullMapRenderTimeInMillis = renderTime;
      this.fullMapRenderNumber++;
      this.averageFullMapRenderTimeInMillis = (this.averageFullMapRenderTimeInMillis * (this.fullMapRenderNumber - 1) + renderTime) / this.fullMapRenderNumber;
    }
    let art = $J.d2i(this.averageFullMapRenderTimeInMillis);
    g.drawString$String$int$int('Full map (average): ' + art + 'ms ==> ' + ($J.idiv(1000, ((art + 1) | 0))) + 'fps', 50, 50);
    g.drawString$String$int$int('Full map (last): ' + this.lastFullMapRenderTimeInMillis + 'ms ==> ' + ($J.ldiv(1000, (this.lastFullMapRenderTimeInMillis + 1))) + 'fps', 50, 70);
    g.drawString$String$int$int('Last render: ' + renderTime + 'ms ==> ' + ($J.ldiv(1000, (renderTime + 1))) + 'fps', 50, 90);
  }
  static $clinit() {
    CanvasMapViewer.logger = Logger.getLogger($J.cls(CanvasMapViewer).getName());
  }
}

$J.define(CanvasMapViewer, 'net.sf.freecol.client.gui.mapviewer.CanvasMapViewer', { kind: 'class', sup: 'javax.swing.JComponent', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.client.gui.mapviewer.MapViewer': '_CanvasMapViewer' }, returns: { 'isMapAvailable': 'boolean' }, meths: { 'paintImmediately()': 'paintImmediately$' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  Font = $J.load('java.awt.Font');
  RenderingHints = $J.load('java.awt.RenderingHints');
  FreeCol = $J.load('net.sf.freecol.FreeCol');
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  FreeColDebugger = $J.load('net.sf.freecol.common.debug.FreeColDebugger');
});
