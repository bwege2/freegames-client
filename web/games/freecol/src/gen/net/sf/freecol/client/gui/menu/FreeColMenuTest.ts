// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/menu/FreeColMenuTest.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject, JString } from '../../../../../../../jre/index.ts';

let BorderLayout, Dimension, GraphicsEnvironment, ItemEvent, ImageIcon, JPanel, JScrollPane, JTextArea, SwingUtilities, WindowConstants, FreeCol, FreeColFrame, InGameMenuBar;

/**
 * Test the menus.
 */
export class FreeColMenuTest extends JObject {
  output_: JTextArea = null;
  scrollPane: JScrollPane = null;
  newline: string = null;
  _FreeColMenuTest(): this {
    this.newline = '\n';
    return this;
  }
  createMenuBar(): JMenuBar {
    let menuBar = null;
    let client = FreeCol.startTestClient(null);
    menuBar = new InGameMenuBar()._InGameMenuBar(client, null);
    client.updateActions();
    (menuBar).update$();
    return menuBar;
  }
  createContentPane(): Container {
    let contentPane = new JPanel()._JPanel$LayoutManager(new BorderLayout()._BorderLayout$());
    contentPane.setOpaque(true);
    this.output_ = new JTextArea()._JTextArea$int$int(5, 30);
    this.output_.setEditable(false);
    this.scrollPane = new JScrollPane()._JScrollPane$Component(this.output_);
    contentPane.add$Component$Object(this.scrollPane, BorderLayout.CENTER);
    return contentPane;
  }
  actionPerformed(ae: ActionEvent): void {
    let source = ae.getSource();
    let s = 'Action event detected.' + this.newline + '    Event source: ' + source.getText() + ' (an instance of ' + this.getClassName(source) + ')';
    this.output_.append(s + this.newline);
    this.output_.setCaretPosition(this.output_.getDocument().getLength());
  }
  itemStateChanged(e: ItemEvent): void {
    let source = (e.getSource());
    let s = 'Item event detected.' + this.newline + '    Event source: ' + source.getText() + ' (an instance of ' + this.getClassName(source) + ')' + this.newline + '    New state: ' + ((e.getStateChange() === ItemEvent.SELECTED) ? 'selected' : 'unselected');
    this.output_.append(s + this.newline);
    this.output_.setCaretPosition(this.output_.getDocument().getLength());
  }
  getClassName(o: any): string {
    let classString = $J.getClass(o).getName();
    let dotIndex = classString.lastIndexOf(String.fromCharCode(46 /* '.' */));
    return classString.substring((dotIndex + 1) | 0);
  }
  /**
   * Returns an ImageIcon, or null if the path was invalid.
   *
   * @param path String
   * @return {@code ImageIcon}
   */
  static createImageIcon(path: string): ImageIcon {
    let imgURL = $J.cls(FreeColMenuTest).getResource(path);
    if (imgURL != null) {
      return new ImageIcon()._ImageIcon$URL(imgURL);
    } else {
      $J.err.println('Couldn\'t find file: ' + path);
      return null;
    }
  }
  /**
   * Create the GUI and show it.  For thread safety,
   * this method should be invoked from the
   * event-dispatching thread.
   */
  static createAndShowGUI(): void {
    let client = FreeCol.startTestClient(null);
    let frame = new FreeColFrame()._FreeColFrame(client, GraphicsEnvironment.getLocalGraphicsEnvironment().getDefaultScreenDevice(), null, true, null);
    frame.setDefaultCloseOperation(WindowConstants.DO_NOTHING_ON_CLOSE);
    let demo = new FreeColMenuTest()._FreeColMenuTest();
    frame.setJMenuBar(demo.createMenuBar());
    frame.setContentPane(demo.createContentPane());
    frame.setPreferredSize(new Dimension()._Dimension$int$int(450, 260));
    frame.setVisible(true);
  }
  static main(args: string[]): void {
    SwingUtilities.invokeLater(() => {
      FreeColMenuTest.createAndShowGUI();
    });
  }
}

$J.define(FreeColMenuTest, 'net.sf.freecol.client.gui.menu.FreeColMenuTest', { kind: 'class', ifaces: ['java.awt.event.ActionListener', 'java.awt.event.ItemListener'], sup: 'java.lang.Object', ctors: { '': '_FreeColMenuTest' } });
$J.module(() => {
  BorderLayout = $J.load('java.awt.BorderLayout');
  Dimension = $J.load('java.awt.Dimension');
  GraphicsEnvironment = $J.load('java.awt.GraphicsEnvironment');
  ItemEvent = $J.load('java.awt.event.ItemEvent');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JPanel = $J.load('javax.swing.JPanel');
  JScrollPane = $J.load('javax.swing.JScrollPane');
  JTextArea = $J.load('javax.swing.JTextArea');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  WindowConstants = $J.load('javax.swing.WindowConstants');
  FreeCol = $J.load('net.sf.freecol.FreeCol');
  FreeColFrame = $J.load('net.sf.freecol.client.gui.FreeColFrame');
  InGameMenuBar = $J.load('net.sf.freecol.client.gui.menu.InGameMenuBar');
});
