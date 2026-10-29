// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/FreeColFrame.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Logger, Toolkit } from '../../../../../../jre/index.ts';
import { JFrame } from '../../../../../javax/swing/JFrame.ts';

let Dimension, Rectangle, WindowConstants, FreeCol, FullScreenFrameListener, ImageLibrary, WindowedFrameListener;

/**
 * The base frame for FreeCol.
 */
export class FreeColFrame extends JFrame {
  static logger: Logger = null;
  /**
   * The FreeCol client controlling the frame.
   */
  freeColClient: FreeColClient = null;
  /**
   * Create a new main frame.
   *
   * @param freeColClient The enclosing {@code FreeColClient}.
   * @param gd The {@code GraphicsDevice} to use.
   * @param menuBar The menu bar to add to the frame.
   * @param windowed If the frame should be windowed.
   * @param bounds The optional size of the windowed frame.
   */
  _FreeColFrame(freeColClient: FreeColClient, gd: GraphicsDevice, menuBar: JMenuBar, windowed: boolean, bounds: Rectangle): this {
    this._JFrame$String$GraphicsConfiguration(FreeColFrame.getFrameName(), gd.getDefaultConfiguration());
    this.freeColClient = freeColClient;
    this.setDefaultCloseOperation(WindowConstants.DO_NOTHING_ON_CLOSE);
    if (windowed) {
      this.setResizable(true);
    } else {
      this.setUndecorated(true);
      gd.setFullScreenWindow(this);
    }
    this.setJMenuBar(menuBar);
    this.addWindowListener(windowed ? new WindowedFrameListener()._WindowedFrameListener(freeColClient) : new FullScreenFrameListener()._FullScreenFrameListener(freeColClient, this));
    this.setIconImage(ImageLibrary.getUnscaledImage('image.miscicon.FrameIcon'));
    this.pack();
    let insets = this.getInsets$();
    this.setMinimumSize(new Dimension()._Dimension$int$int((656 + insets.left + insets.right) | 0, (480 + insets.top + insets.bottom) | 0));
    if (!windowed || bounds == null || bounds.width_ <= 0 || bounds.height_ <= 0) {
      bounds = gd.getDefaultConfiguration().getBounds();
      if (windowed) {
        let screenInsets = Toolkit.getDefaultToolkit().getScreenInsets(gd.getDefaultConfiguration());
        bounds = new Rectangle()._Rectangle$int$int$int$int((bounds.x_ + screenInsets.left) | 0, (bounds.y_ + screenInsets.top) | 0, (bounds.width_ - screenInsets.right) | 0, (bounds.height_ - screenInsets.bottom) | 0);
      }
    }
    this.setBounds$Rectangle(bounds);
    FreeColFrame.logger.info(((windowed) ? 'Windowed' : 'Full screen') + ' frame created with size ' + bounds.width_ + 'x' + bounds.height_);
    return this;
  }
  exitFullScreen(): void {
    let GraphicsConf = this.getGraphicsConfiguration();
    let gd = GraphicsConf.getDevice();
    gd.setFullScreenWindow(null);
  }
  setMenuBar$FreeColMenuBar(bar: FreeColMenuBar): void {
    this.setJMenuBar(bar);
    this.validate();
  }
  removeMenuBar(): void {
    this.setJMenuBar(null);
    this.validate();
  }
  resetMenuBar(): void {
    let menuBar = this.getJMenuBar();
    if (menuBar != null) {
      (menuBar).reset();
    }
  }
  updateMenuBar(): void {
    let menuBar = this.getJMenuBar();
    if (menuBar != null) {
      (menuBar).update$();
    }
  }
  /**
   * Get the standard name for the main frame.
   *
   * @return The standard frame name.
   */
  static getFrameName(): string {
    return 'FreeCol ' + FreeCol.getVersion();
  }
  static $clinit() {
    FreeColFrame.logger = Logger.getLogger($J.cls(FreeColFrame).getName());
  }
}

$J.define(FreeColFrame, 'net.sf.freecol.client.gui.FreeColFrame', { kind: 'class', sup: 'javax.swing.JFrame', ctors: { 'net.sf.freecol.client.FreeColClient,java.awt.GraphicsDevice,javax.swing.JMenuBar,boolean,java.awt.Rectangle': '_FreeColFrame' }, meths: { 'setMenuBar(net.sf.freecol.client.gui.menu.FreeColMenuBar)': 'setMenuBar$FreeColMenuBar' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  Rectangle = $J.load('java.awt.Rectangle');
  WindowConstants = $J.load('javax.swing.WindowConstants');
  FreeCol = $J.load('net.sf.freecol.FreeCol');
  FullScreenFrameListener = $J.load('net.sf.freecol.client.gui.FullScreenFrameListener');
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  WindowedFrameListener = $J.load('net.sf.freecol.client.gui.WindowedFrameListener');
});
