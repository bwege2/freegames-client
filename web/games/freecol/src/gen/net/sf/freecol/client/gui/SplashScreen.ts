// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/SplashScreen.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ImageIO } from '../../../../../../jre/index.ts';
import { JFrame } from '../../../../../javax/swing/JFrame.ts';

let ImageIcon, JLabel;

/**
 * Class to contain the splash screen.
 */
export class SplashScreen extends JFrame {
  /**
   * Initialize the splash screen.
   *
   * @param gd The {@code GraphicsDevice} to display on.
   * @param splashStream An {@code InputStream} to read content from.
   * @exception IOException on I/O error.
   */
  _SplashScreen(gd: GraphicsDevice, splashStream: InputStream): this {
    this._JFrame$GraphicsConfiguration(gd.getDefaultConfiguration());
    let im = ImageIO.read(splashStream);
    this.getContentPane().add$Component(new JLabel()._JLabel$Icon(new ImageIcon()._ImageIcon$Image(im)));
    this.setUndecorated(true);
    this.pack();
    let start = this.getLocation$();
    let dm = gd.getDisplayMode();
    let x = (start.x_ + $J.idiv(dm.getWidth(), 2) - $J.idiv(this.getWidth(), 2)) | 0;
    let y = (start.y_ + $J.idiv(dm.getHeight(), 2) - $J.idiv(this.getHeight(), 2)) | 0;
    this.setLocation$int$int(x, y);
    return this;
  }
}

$J.define(SplashScreen, 'net.sf.freecol.client.gui.SplashScreen', { kind: 'class', sup: 'javax.swing.JFrame', ctors: { 'java.awt.GraphicsDevice,java.io.InputStream': '_SplashScreen' } });
$J.module(() => {
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JLabel = $J.load('javax.swing.JLabel');
});
