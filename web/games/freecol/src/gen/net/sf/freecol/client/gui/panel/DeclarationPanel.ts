// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/DeclarationPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, JString, Logger } from '../../../../../../../jre/index.ts';
import { FreeColPanel } from './FreeColPanel.ts';
import { JPanel } from '../../../../../../javax/swing/JPanel.ts';

let Color, ActionEvent, KeyAdapter, MouseAdapter, Timer, ResourceManager, ImageUtils, StringUtils;

/**
 * This panel displays the signing of the Declaration of Independence.
 */
export class DeclarationPanel extends FreeColPanel {
  static logger: Logger = null;
  SIGNATURE_Y: number = 0;
  ANIMATION_STOPPED: string = null;
  START_DELAY: number = 0;
  ANIMATION_DELAY: number = 0;
  FINISH_DELAY: number = 0;
  afterClosing: Runnable = null;
  closed: boolean = false;
  image: Image = null;
  /**
   * Creates a DeclarationPanel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param afterClosing A callback that is executed after the panel closes.
   */
  _DeclarationPanel(freeColClient: FreeColClient, afterClosing: Runnable): this {
    this._FreeColPanel$FreeColClient(freeColClient);
    this.SIGNATURE_Y = 450;
    this.ANIMATION_STOPPED = 'AnimationStopped';
    this.START_DELAY = 2000;
    this.ANIMATION_DELAY = 15;
    this.FINISH_DELAY = 5000;
    this.closed = false;
    this.afterClosing = afterClosing;
    this.setLayout(null);
    this.image = this.getImageLibrary().getScaledImage('image.flavor.Declaration');
    this.setSize$int$int(this.image.getWidth$ImageObserver(null), this.image.getHeight$ImageObserver(null));
    this.setOpaque(false);
    this.setBorder(null);
    this.addKeyListener(new (DeclarationPanel$1())().$o(this)._KeyAdapter());
    this.addMouseListener(new (DeclarationPanel$2())().$o(this)._MouseAdapter());
    let scaledSignatureY = $J.d2i((Math.fround(this.SIGNATURE_Y * this.getImageLibrary().getScaleFactor())));
    let signaturePanel = new DeclarationPanel$SignaturePanel().$o(this)._DeclarationPanel$SignaturePanel();
    signaturePanel.initialize(this.getMyPlayer().getName());
    signaturePanel.setLocation$int$int($J.idiv(((this.getWidth() - signaturePanel.getWidth()) | 0), 2), ($J.idiv(((this.getHeight() + scaledSignatureY - signaturePanel.getHeight()) | 0), 2) - 15) | 0);
    signaturePanel.addActionListener($J.fn(this, 'actionPerformed'));
    this.add$Component(signaturePanel);
    let t = new Timer()._Timer(this.START_DELAY, (ae) => {
      signaturePanel.startAnimation();
    });
    t.setRepeats(false);
    t.start();
    return this;
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    let command = ae.getActionCommand();
    if ($J.equals(this.ANIMATION_STOPPED, command)) {
      let t = new Timer()._Timer(this.FINISH_DELAY, (x) => {
        this.closePanel();
      });
      t.setRepeats(false);
      t.start();
    } else {
      super.actionPerformed(ae);
    }
  }
  closePanel(): void {
    let oldClosed = this.closed;
    this.closed = true;
    if (!oldClosed) {
      this.getGUI().removeComponent(this);
      this.afterClosing();
    }
  }
  /**
   * {@inheritDoc}
   */
  paintComponent(g: Graphics): void {
    g.drawImage$Image$int$int$ImageObserver(this.image, 0, 0, null);
  }
  static $clinit() {
    DeclarationPanel.logger = Logger.getLogger($J.cls(DeclarationPanel).getName());
  }
}

/**
 * A panel for displaying an animated signature.
 *
 * The panel should be {@link #initialize(String) initialized} with a name
 * before the animation is {@link #startAnimation() started}.
 */
export class DeclarationPanel$SignaturePanel extends JPanel {
  faFile: FAFile = null;
  actionListeners: ArrayList<ActionListener> = null;
  points: Point[] = null;
  counter: number = 0;
  imageBuffer: BufferedImage = null;
  _DeclarationPanel$SignaturePanel(): this {
    this._JPanel$();
    this.actionListeners = new ArrayList();
    this.points = null;
    this.counter = 0;
    this.faFile = ResourceManager.getFAFile('animatedfont.signature');
    this.setOpaque(false);
    return this;
  }
  /**
   * Gets an abbreviated version of the given name.
   *
   * @param name The name to be abbreviated
   * @return The abbreviated version of the given name.  The name
   *     is made small enough to fit within the bounds the
   *     {@code DeclarationPanel}.
   */
  getAbbreviatedName(name: string): string {
    if (!this.isTooLarge(name)) {
      return name;
    }
    let partNames = JString.split(name, ' ');
    for (let i = 1; i < ((partNames.length - 1) | 0) && this.isTooLarge(StringUtils.join$String$StringArr(' ', partNames)); i++) {
      partNames[i] = String.fromCharCode(partNames[i].charCodeAt(0)) + '.';
    }
    while (partNames.length > 2 && this.isTooLarge(StringUtils.join$String$StringArr(' ', partNames))) {
      let newPartNames = $J.newArray((partNames.length - 1) | 0, null);
      newPartNames[0] = partNames[0];
      for (let i = 1; i < newPartNames.length; i++) {
        newPartNames[i] = partNames[(i + 1) | 0];
      }
      partNames = newPartNames;
    }
    let first = partNames[0];
    let second = partNames[1];
    let s = StringUtils.join$String$StringArr(' ', partNames);
    if (!this.isTooLarge(s)) {
      return s;
    }
    s = String.fromCharCode(first.charCodeAt(0)) + '. ' + second;
    if (!this.isTooLarge(s)) {
      return s;
    }
    s = first + ' ' + String.fromCharCode(second.charCodeAt(0)) + '.';
    if (!this.isTooLarge(s)) {
      return s;
    }
    return String.fromCharCode(first.charCodeAt(0)) + '. ' + String.fromCharCode(second.charCodeAt(0)) + '.';
  }
  /**
   * Checks if the given string is to large to be displayed within this
   * panel.
   *
   * @param name The string to be tested.
   * @return {@code true} if the given string was to large to be
   *     fully displayed.
   */
  isTooLarge(name: string): boolean {
    let d = this.faFile.getDimension(name);
    let scaledMargin = $J.d2i((Math.fround(10 * this.$outer.getImageLibrary().getScaleFactor())));
    let scaledSignatureWidth = $J.d2i((Math.fround(d.width_ * this.$outer.getImageLibrary().getScaleFactor())));
    return (scaledSignatureWidth > ((this.$outer.getWidth() - scaledMargin) | 0));
  }
  /**
   * Initializes this panel with the given name.
   *
   * @param name The name to be used when making the signature.
   */
  initialize(name: string): void {
    name = this.faFile.onlyValidCharacters(name);
    name = this.getAbbreviatedName(name);
    this.points = this.faFile.getPoints(name);
    this.counter = 0;
    let originalSize = this.faFile.getDimension(name);
    let size = this.$outer.getImageLibrary().scale$Dimension(originalSize);
    this.imageBuffer = ImageUtils.createBufferedImage$int$int(size.width_, size.height_);
    this.setSize$Dimension(size);
  }
  /**
   * Adds an {@code ActionListener} to this
   * {@code SignaturePanel}.  An event gets fired when the
   * animation is stopped.
   *
   * @param al The {@code ActionListener}.
   * @see #startAnimation()
   */
  addActionListener(al: ActionListener): void {
    if (!this.actionListeners.contains(al)) {
      this.actionListeners.add(al);
    }
  }
  notifyStopped(): void {
    for (const $it0 = this.actionListeners.iterator(); $it0.hasNext(); ) {
      let actionListener = $it0.next();
      $J.fn(actionListener, 'actionPerformed')(new ActionEvent()._ActionEvent$Object$int$String(this, ActionEvent.ACTION_PERFORMED, this.$outer.ANIMATION_STOPPED));
    }
  }
  /**
   * Starts the animation of the signature.  An
   * {@code ActionEvent} gets sent to the registered
   * listeners when the animation has stopped.
   *
   * @see #addActionListener(ActionListener)
   */
  startAnimation(): void {
    let taskPerformer = (ae) => {
      if (this.counter >= ((this.points.length - 1) | 0)) {
        (ae.getSource()).stop();
        this.notifyStopped();
      }
      let fromIndex = this.counter;
      this.counter = (this.counter + 3) | 0;
      if (this.counter > this.points.length) {
        this.counter = this.points.length;
        (ae.getSource()).stop();
        this.notifyStopped();
      }
      let scaleFactor = this.$outer.getImageLibrary().getScaleFactor();
      let g2d = this.imageBuffer.createGraphics();
      g2d.setColor(Color.BLACK);
      let brushSize = (scaleFactor <= Math.fround(1) ? 1 : 2);
      for (let i = fromIndex; i < this.counter; i++) {
        let p = this.points[i];
        g2d.fillRect(this.scaleToInt(p.getX(), scaleFactor), this.scaleToInt(p.getY(), scaleFactor), brushSize, brushSize);
        g2d.fillRect((this.scaleToInt(p.getX(), scaleFactor) - 1) | 0, (this.scaleToInt(p.getY(), scaleFactor) + 1) | 0, brushSize, brushSize);
      }
      g2d.dispose();
      this.validate();
      this.repaint$();
    };
    new Timer()._Timer(this.$outer.ANIMATION_DELAY, taskPerformer).start();
  }
  /**
   * {@inheritDoc}
   */
  paintComponent(g: Graphics): void {
    if (this.points == null || this.points.length === 0) {
      return;
    }
    if (this.isOpaque()) {
      super.paintComponent(g);
    }
    let g2d = g;
    g2d.drawImage$Image$int$int$ImageObserver(this.imageBuffer, 0, 0, null);
  }
  scaleToInt(d: number, scaleFactor: number): number {
    return $J.d2i((d * scaleFactor));
  }
}

let $DeclarationPanel$1: any = null;
/** An anonymous class (DeclarationPanel.java:86). */
function DeclarationPanel$1(): any {
  return $DeclarationPanel$1 ??= $J.local(class extends KeyAdapter {
    keyPressed(k: KeyEvent): void {
      this.$outer.closePanel();
    }
  }, 'net.sf.freecol.client.gui.panel.DeclarationPanel$1', []);
}

let $DeclarationPanel$2: any = null;
/** An anonymous class (DeclarationPanel.java:92). */
function DeclarationPanel$2(): any {
  return $DeclarationPanel$2 ??= $J.local(class extends MouseAdapter {
    mouseClicked(e: MouseEvent): void {
      this.$outer.closePanel();
    }
  }, 'net.sf.freecol.client.gui.panel.DeclarationPanel$2', []);
}

$J.define(DeclarationPanel, 'net.sf.freecol.client.gui.panel.DeclarationPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.FreeColPanel', ctors: { 'net.sf.freecol.client.FreeColClient,java.lang.Runnable': '_DeclarationPanel' }, clinit: true, lazy: ['logger'] });
$J.define(DeclarationPanel$SignaturePanel, 'net.sf.freecol.client.gui.panel.DeclarationPanel$SignaturePanel', { kind: 'class', sup: 'javax.swing.JPanel', ctors: { '': '_DeclarationPanel$SignaturePanel' }, inner: true });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  ActionEvent = $J.load('java.awt.event.ActionEvent');
  KeyAdapter = $J.load('java.awt.event.KeyAdapter');
  MouseAdapter = $J.load('java.awt.event.MouseAdapter');
  Timer = $J.load('javax.swing.Timer');
  ResourceManager = $J.load('net.sf.freecol.common.resources.ResourceManager');
  ImageUtils = $J.load('net.sf.freecol.common.util.ImageUtils');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
});
