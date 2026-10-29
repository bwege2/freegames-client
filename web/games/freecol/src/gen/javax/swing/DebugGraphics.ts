// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/DebugGraphics.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2021, Oracle and/or its affiliates. All rights reserved.
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
 *
 * This code is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License version 2 only, as
 * published by the Free Software Foundation.  Oracle designates this
 * particular file as subject to the "Classpath" exception as provided
 * by Oracle in the LICENSE file that accompanied this code.
 *
 * This code is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
 * version 2 for more details (a copy is included in the LICENSE file that
 * accompanied this code).
 *
 * You should have received a copy of the GNU General Public License version
 * 2 along with this work; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * Please contact Oracle, 500 Oracle Parkway, Redwood Shores, CA 94065 USA
 * or visit www.oracle.com if you need additional information or have any
 * questions.
 */
import { $J, AccessController, BufferedImage, Exception, JObject, StackWalker, StackWalker_Option, Thread, Toolkit } from '../../../jre/index.ts';
import { Graphics } from '../../java/awt/Graphics.ts';

let Point, Rectangle, FilteredImageSource, DebugGraphicsFilter, DebugGraphicsInfo, DebugGraphicsObserver, ImageIcon, JComponent, JFrame, SwingUtilities;

/**
 * Graphics subclass supporting graphics debugging. Overrides most methods
 * from Graphics.  DebugGraphics objects are rarely created by hand.  They
 * are most frequently created automatically when a JComponent's
 * debugGraphicsOptions are changed using the setDebugGraphicsOptions()
 * method.
 * <p>
 * NOTE: You must turn off double buffering to use DebugGraphics:
 *       RepaintManager repaintManager = RepaintManager.currentManager(component);
 *       repaintManager.setDoubleBufferingEnabled(false);
 *
 * @see JComponent#setDebugGraphicsOptions
 * @see RepaintManager#currentManager
 * @see RepaintManager#setDoubleBufferingEnabled
 *
 * @author Dave Karlton
 * @since 1.2
 */
export class DebugGraphics extends Graphics {
  graphics: Graphics = null;
  buffer: Image = null;
  debugOptions: number = 0;
  graphicsID: number = 0;
  xOffset: number = 0;
  yOffset: number = 0;
  static graphicsCount: number = 0;
  static imageLoadingIcon: ImageIcon = null;
  /**
   * Log graphics operations.
   */
  static readonly LOG_OPTION: number = 1;
  /**
   * Flash graphics operations.
   */
  static readonly FLASH_OPTION: number = 2;
  /**
   * Show buffered operations in a separate <code>Frame</code>.
   */
  static readonly BUFFERED_OPTION: number = 4;
  /**
   * Don't debug graphics operations.
   */
  static readonly NONE_OPTION: number = -1;
  static debugGraphicsInfoKey: JClass<DebugGraphicsInfo> = null;
  $init_DebugGraphics() {
    this.graphicsID = DebugGraphics.graphicsCount++;
  }
  /**
   * Constructs a new debug graphics context that supports slowed
   * down drawing.
   * <p>
   * NOTE: This constructor should not be called by
   * applications, it is for internal use only. When called directly
   * it will create an un-usable instance.
   */
  _DebugGraphics$(): this {
    this._Graphics();
    this.$init_DebugGraphics();
    this.buffer = null;
    this.xOffset = this.yOffset = 0;
    if (this.graphics == null) {
      let walker = AccessController.doPrivileged(new (DebugGraphics$1())().$o(this));
      if (walker.getCallerClass() !== this.getClass()) {
        let bi = new BufferedImage(1, 1, 1);
        this.graphics = bi.createGraphics();
      }
    }
    return this;
  }
  /**
   * Constructs a debug graphics context from an existing graphics
   * context that slows down drawing for the specified component.
   *
   * @param graphics  the Graphics context to slow down
   * @param component the JComponent to draw slowly
   */
  _DebugGraphics$Graphics$JComponent(graphics: Graphics, component: JComponent): this {
    this._DebugGraphics$Graphics(graphics);
    this.setDebugOptions(component.shouldDebugGraphics());
    return this;
  }
  /**
   * Constructs a debug graphics context from an existing graphics
   * context that supports slowed down drawing.
   *
   * @param graphics  the Graphics context to slow down
   */
  _DebugGraphics$Graphics(graphics: Graphics): this {
    this._DebugGraphics$();
    this.graphics = graphics;
    return this;
  }
  /**
   * Overrides <code>Graphics.create</code> to return a DebugGraphics object.
   */
  create$(): Graphics {
    let debugGraphics: DebugGraphics;
    debugGraphics = new DebugGraphics()._DebugGraphics$();
    debugGraphics.graphics = this.graphics.create$();
    debugGraphics.debugOptions = this.debugOptions;
    debugGraphics.buffer = this.buffer;
    return debugGraphics;
  }
  /**
   * Overrides <code>Graphics.create</code> to return a DebugGraphics object.
   */
  create$int$int$int$int(x: number, y: number, width: number, height: number): Graphics {
    let debugGraphics: DebugGraphics;
    debugGraphics = new DebugGraphics()._DebugGraphics$();
    debugGraphics.graphics = this.graphics.create$int$int$int$int(x, y, width, height);
    debugGraphics.debugOptions = this.debugOptions;
    debugGraphics.buffer = this.buffer;
    debugGraphics.xOffset = (this.xOffset + x) | 0;
    debugGraphics.yOffset = (this.yOffset + y) | 0;
    return debugGraphics;
  }
  /**
   * Sets the Font used for text drawing operations.
   */
  setFont(aFont: Font): void {
    if (this.debugLog()) {
      DebugGraphics.info().log(this.toShortString() + ' Setting font: ' + $J.str(aFont));
    }
    this.graphics.setFont(aFont);
  }
  /**
   * Returns the Font used for text drawing operations.
   * @see #setFont
   */
  getFont(): Font {
    return this.graphics.getFont();
  }
  /**
   * Sets the color to be used for drawing and filling lines and shapes.
   */
  setColor(aColor: Color): void {
    if (this.debugLog()) {
      DebugGraphics.info().log(this.toShortString() + ' Setting color: ' + $J.str(aColor));
    }
    this.graphics.setColor(aColor);
  }
  /**
   * Returns the Color used for text drawing operations.
   * @see #setColor
   */
  getColor(): Color {
    return this.graphics.getColor();
  }
  /**
   * Overrides <code>Graphics.getFontMetrics</code>.
   */
  getFontMetrics$(): FontMetrics {
    return this.graphics.getFontMetrics$();
  }
  /**
   * Overrides <code>Graphics.getFontMetrics</code>.
   */
  getFontMetrics$Font(f: Font): FontMetrics {
    return this.graphics.getFontMetrics$Font(f);
  }
  /**
   * Overrides <code>Graphics.translate</code>.
   */
  translate$int$int(x: number, y: number): void {
    if (this.debugLog()) {
      DebugGraphics.info().log(this.toShortString() + ' Translating by: ' + $J.str(new Point()._Point$int$int(x, y)));
    }
    this.xOffset = (this.xOffset + x) | 0;
    this.yOffset = (this.yOffset + y) | 0;
    this.graphics.translate$int$int(x, y);
  }
  /**
   * Overrides <code>Graphics.setPaintMode</code>.
   */
  setPaintMode(): void {
    if (this.debugLog()) {
      DebugGraphics.info().log(this.toShortString() + ' Setting paint mode');
    }
    this.graphics.setPaintMode();
  }
  /**
   * Overrides <code>Graphics.setXORMode</code>.
   */
  setXORMode(aColor: Color): void {
    if (this.debugLog()) {
      DebugGraphics.info().log(this.toShortString() + ' Setting XOR mode: ' + $J.str(aColor));
    }
    this.graphics.setXORMode(aColor);
  }
  /**
   * Overrides <code>Graphics.getClipBounds</code>.
   */
  getClipBounds$(): Rectangle {
    return this.graphics.getClipBounds$();
  }
  /**
   * Overrides <code>Graphics.clipRect</code>.
   */
  clipRect(x: number, y: number, width: number, height: number): void {
    this.graphics.clipRect(x, y, width, height);
    if (this.debugLog()) {
      DebugGraphics.info().log(this.toShortString() + ' Setting clipRect: ' + $J.str((new Rectangle()._Rectangle$int$int$int$int(x, y, width, height))) + ' New clipRect: ' + $J.str(this.graphics.getClip()));
    }
  }
  /**
   * Overrides <code>Graphics.setClip</code>.
   */
  setClip$int$int$int$int(x: number, y: number, width: number, height: number): void {
    this.graphics.setClip$int$int$int$int(x, y, width, height);
    if (this.debugLog()) {
      DebugGraphics.info().log(this.toShortString() + ' Setting new clipRect: ' + $J.str(this.graphics.getClip()));
    }
  }
  /**
   * Overrides <code>Graphics.getClip</code>.
   */
  getClip(): Shape {
    return this.graphics.getClip();
  }
  /**
   * Overrides <code>Graphics.setClip</code>.
   */
  setClip$Shape(clip: Shape): void {
    this.graphics.setClip$Shape(clip);
    if (this.debugLog()) {
      DebugGraphics.info().log(this.toShortString() + ' Setting new clipRect: ' + $J.str(this.graphics.getClip()));
    }
  }
  /**
   * Overrides <code>Graphics.drawRect</code>.
   */
  drawRect(x: number, y: number, width: number, height: number): void {
    let info = DebugGraphics.info();
    if (this.debugLog()) {
      DebugGraphics.info().log(this.toShortString() + ' Drawing rect: ' + $J.str(new Rectangle()._Rectangle$int$int$int$int(x, y, width, height)));
    }
    if (this.isDrawingBuffer()) {
      if (this.debugBuffered()) {
        let debugGraphics = this.debugGraphics();
        debugGraphics.drawRect(x, y, width, height);
        debugGraphics.dispose();
      }
    } else if (this.debugFlash()) {
      let oldColor = this.getColor();
      let i: number;
      let count = ((Math.imul(info.flashCount, 2)) - 1) | 0;
      for (i = 0; i < count; i++) {
        this.graphics.setColor((i % 2) === 0 ? info.flashColor : oldColor);
        this.graphics.drawRect(x, y, width, height);
        Toolkit.getDefaultToolkit().sync();
        this.sleep(info.flashTime);
      }
      this.graphics.setColor(oldColor);
    }
    this.graphics.drawRect(x, y, width, height);
  }
  /**
   * Overrides <code>Graphics.fillRect</code>.
   */
  fillRect(x: number, y: number, width: number, height: number): void {
    let info = DebugGraphics.info();
    if (this.debugLog()) {
      DebugGraphics.info().log(this.toShortString() + ' Filling rect: ' + $J.str(new Rectangle()._Rectangle$int$int$int$int(x, y, width, height)));
    }
    if (this.isDrawingBuffer()) {
      if (this.debugBuffered()) {
        let debugGraphics = this.debugGraphics();
        debugGraphics.fillRect(x, y, width, height);
        debugGraphics.dispose();
      }
    } else if (this.debugFlash()) {
      let oldColor = this.getColor();
      let i: number;
      let count = ((Math.imul(info.flashCount, 2)) - 1) | 0;
      for (i = 0; i < count; i++) {
        this.graphics.setColor((i % 2) === 0 ? info.flashColor : oldColor);
        this.graphics.fillRect(x, y, width, height);
        Toolkit.getDefaultToolkit().sync();
        this.sleep(info.flashTime);
      }
      this.graphics.setColor(oldColor);
    }
    this.graphics.fillRect(x, y, width, height);
  }
  /**
   * Overrides <code>Graphics.clearRect</code>.
   */
  clearRect(x: number, y: number, width: number, height: number): void {
    let info = DebugGraphics.info();
    if (this.debugLog()) {
      DebugGraphics.info().log(this.toShortString() + ' Clearing rect: ' + $J.str(new Rectangle()._Rectangle$int$int$int$int(x, y, width, height)));
    }
    if (this.isDrawingBuffer()) {
      if (this.debugBuffered()) {
        let debugGraphics = this.debugGraphics();
        debugGraphics.clearRect(x, y, width, height);
        debugGraphics.dispose();
      }
    } else if (this.debugFlash()) {
      let oldColor = this.getColor();
      let i: number;
      let count = ((Math.imul(info.flashCount, 2)) - 1) | 0;
      for (i = 0; i < count; i++) {
        this.graphics.setColor((i % 2) === 0 ? info.flashColor : oldColor);
        this.graphics.clearRect(x, y, width, height);
        Toolkit.getDefaultToolkit().sync();
        this.sleep(info.flashTime);
      }
      this.graphics.setColor(oldColor);
    }
    this.graphics.clearRect(x, y, width, height);
  }
  /**
   * Overrides <code>Graphics.drawLine</code>.
   */
  drawLine(x1: number, y1: number, x2: number, y2: number): void {
    let info = DebugGraphics.info();
    if (this.debugLog()) {
      DebugGraphics.info().log(this.toShortString() + ' Drawing line: from ' + this.pointToString(x1, y1) + ' to ' + this.pointToString(x2, y2));
    }
    if (this.isDrawingBuffer()) {
      if (this.debugBuffered()) {
        let debugGraphics = this.debugGraphics();
        debugGraphics.drawLine(x1, y1, x2, y2);
        debugGraphics.dispose();
      }
    } else if (this.debugFlash()) {
      let oldColor = this.getColor();
      let i: number;
      let count = ((Math.imul(info.flashCount, 2)) - 1) | 0;
      for (i = 0; i < count; i++) {
        this.graphics.setColor((i % 2) === 0 ? info.flashColor : oldColor);
        this.graphics.drawLine(x1, y1, x2, y2);
        Toolkit.getDefaultToolkit().sync();
        this.sleep(info.flashTime);
      }
      this.graphics.setColor(oldColor);
    }
    this.graphics.drawLine(x1, y1, x2, y2);
  }
  /**
   * Overrides <code>Graphics.drawOval</code>.
   */
  drawOval(x: number, y: number, width: number, height: number): void {
    let info = DebugGraphics.info();
    if (this.debugLog()) {
      DebugGraphics.info().log(this.toShortString() + ' Drawing oval: ' + $J.str(new Rectangle()._Rectangle$int$int$int$int(x, y, width, height)));
    }
    if (this.isDrawingBuffer()) {
      if (this.debugBuffered()) {
        let debugGraphics = this.debugGraphics();
        debugGraphics.drawOval(x, y, width, height);
        debugGraphics.dispose();
      }
    } else if (this.debugFlash()) {
      let oldColor = this.getColor();
      let i: number;
      let count = ((Math.imul(info.flashCount, 2)) - 1) | 0;
      for (i = 0; i < count; i++) {
        this.graphics.setColor((i % 2) === 0 ? info.flashColor : oldColor);
        this.graphics.drawOval(x, y, width, height);
        Toolkit.getDefaultToolkit().sync();
        this.sleep(info.flashTime);
      }
      this.graphics.setColor(oldColor);
    }
    this.graphics.drawOval(x, y, width, height);
  }
  /**
   * Overrides <code>Graphics.fillOval</code>.
   */
  fillOval(x: number, y: number, width: number, height: number): void {
    let info = DebugGraphics.info();
    if (this.debugLog()) {
      DebugGraphics.info().log(this.toShortString() + ' Filling oval: ' + $J.str(new Rectangle()._Rectangle$int$int$int$int(x, y, width, height)));
    }
    if (this.isDrawingBuffer()) {
      if (this.debugBuffered()) {
        let debugGraphics = this.debugGraphics();
        debugGraphics.fillOval(x, y, width, height);
        debugGraphics.dispose();
      }
    } else if (this.debugFlash()) {
      let oldColor = this.getColor();
      let i: number;
      let count = ((Math.imul(info.flashCount, 2)) - 1) | 0;
      for (i = 0; i < count; i++) {
        this.graphics.setColor((i % 2) === 0 ? info.flashColor : oldColor);
        this.graphics.fillOval(x, y, width, height);
        Toolkit.getDefaultToolkit().sync();
        this.sleep(info.flashTime);
      }
      this.graphics.setColor(oldColor);
    }
    this.graphics.fillOval(x, y, width, height);
  }
  /**
   * Overrides <code>Graphics.drawArc</code>.
   */
  drawArc(x: number, y: number, width: number, height: number, startAngle: number, arcAngle: number): void {
    let info = DebugGraphics.info();
    if (this.debugLog()) {
      DebugGraphics.info().log(this.toShortString() + ' Drawing arc: ' + $J.str(new Rectangle()._Rectangle$int$int$int$int(x, y, width, height)) + ' startAngle: ' + startAngle + ' arcAngle: ' + arcAngle);
    }
    if (this.isDrawingBuffer()) {
      if (this.debugBuffered()) {
        let debugGraphics = this.debugGraphics();
        debugGraphics.drawArc(x, y, width, height, startAngle, arcAngle);
        debugGraphics.dispose();
      }
    } else if (this.debugFlash()) {
      let oldColor = this.getColor();
      let i: number;
      let count = ((Math.imul(info.flashCount, 2)) - 1) | 0;
      for (i = 0; i < count; i++) {
        this.graphics.setColor((i % 2) === 0 ? info.flashColor : oldColor);
        this.graphics.drawArc(x, y, width, height, startAngle, arcAngle);
        Toolkit.getDefaultToolkit().sync();
        this.sleep(info.flashTime);
      }
      this.graphics.setColor(oldColor);
    }
    this.graphics.drawArc(x, y, width, height, startAngle, arcAngle);
  }
  /**
   * Overrides <code>Graphics.drawPolygon</code>.
   */
  drawPolygon$intArr$intArr$int(xPoints: number[], yPoints: number[], nPoints: number): void {
    let info = DebugGraphics.info();
    if (this.debugLog()) {
      DebugGraphics.info().log(this.toShortString() + ' Drawing polygon:  nPoints: ' + nPoints + ' X\'s: ' + $J.str(xPoints) + ' Y\'s: ' + $J.str(yPoints));
    }
    if (this.isDrawingBuffer()) {
      if (this.debugBuffered()) {
        let debugGraphics = this.debugGraphics();
        debugGraphics.drawPolygon$intArr$intArr$int(xPoints, yPoints, nPoints);
        debugGraphics.dispose();
      }
    } else if (this.debugFlash()) {
      let oldColor = this.getColor();
      let i: number;
      let count = ((Math.imul(info.flashCount, 2)) - 1) | 0;
      for (i = 0; i < count; i++) {
        this.graphics.setColor((i % 2) === 0 ? info.flashColor : oldColor);
        this.graphics.drawPolygon$intArr$intArr$int(xPoints, yPoints, nPoints);
        Toolkit.getDefaultToolkit().sync();
        this.sleep(info.flashTime);
      }
      this.graphics.setColor(oldColor);
    }
    this.graphics.drawPolygon$intArr$intArr$int(xPoints, yPoints, nPoints);
  }
  /**
   * Overrides <code>Graphics.fillPolygon</code>.
   */
  fillPolygon$intArr$intArr$int(xPoints: number[], yPoints: number[], nPoints: number): void {
    let info = DebugGraphics.info();
    if (this.debugLog()) {
      DebugGraphics.info().log(this.toShortString() + ' Filling polygon:  nPoints: ' + nPoints + ' X\'s: ' + $J.str(xPoints) + ' Y\'s: ' + $J.str(yPoints));
    }
    if (this.isDrawingBuffer()) {
      if (this.debugBuffered()) {
        let debugGraphics = this.debugGraphics();
        debugGraphics.fillPolygon$intArr$intArr$int(xPoints, yPoints, nPoints);
        debugGraphics.dispose();
      }
    } else if (this.debugFlash()) {
      let oldColor = this.getColor();
      let i: number;
      let count = ((Math.imul(info.flashCount, 2)) - 1) | 0;
      for (i = 0; i < count; i++) {
        this.graphics.setColor((i % 2) === 0 ? info.flashColor : oldColor);
        this.graphics.fillPolygon$intArr$intArr$int(xPoints, yPoints, nPoints);
        Toolkit.getDefaultToolkit().sync();
        this.sleep(info.flashTime);
      }
      this.graphics.setColor(oldColor);
    }
    this.graphics.fillPolygon$intArr$intArr$int(xPoints, yPoints, nPoints);
  }
  /**
   * Overrides <code>Graphics.drawString</code>.
   */
  drawString$String$int$int(aString: string, x: number, y: number): void {
    let info = DebugGraphics.info();
    if (this.debugLog()) {
      DebugGraphics.info().log(this.toShortString() + ' Drawing string: "' + aString + '" at: ' + $J.str(new Point()._Point$int$int(x, y)));
    }
    if (this.isDrawingBuffer()) {
      if (this.debugBuffered()) {
        let debugGraphics = this.debugGraphics();
        debugGraphics.drawString$String$int$int(aString, x, y);
        debugGraphics.dispose();
      }
    } else if (this.debugFlash()) {
      let oldColor = this.getColor();
      let i: number;
      let count = ((Math.imul(info.flashCount, 2)) - 1) | 0;
      for (i = 0; i < count; i++) {
        this.graphics.setColor((i % 2) === 0 ? info.flashColor : oldColor);
        this.graphics.drawString$String$int$int(aString, x, y);
        Toolkit.getDefaultToolkit().sync();
        this.sleep(info.flashTime);
      }
      this.graphics.setColor(oldColor);
    }
    this.graphics.drawString$String$int$int(aString, x, y);
  }
  /**
   * Overrides <code>Graphics.drawString</code>.
   */
  drawString$AttributedCharacterIterator$int$int(iterator: AttributedCharacterIterator, x: number, y: number): void {
    let info = DebugGraphics.info();
    if (this.debugLog()) {
      DebugGraphics.info().log(this.toShortString() + ' Drawing text: "' + $J.str(iterator) + '" at: ' + $J.str(new Point()._Point$int$int(x, y)));
    }
    if (this.isDrawingBuffer()) {
      if (this.debugBuffered()) {
        let debugGraphics = this.debugGraphics();
        debugGraphics.drawString$AttributedCharacterIterator$int$int(iterator, x, y);
        debugGraphics.dispose();
      }
    } else if (this.debugFlash()) {
      let oldColor = this.getColor();
      let i: number;
      let count = ((Math.imul(info.flashCount, 2)) - 1) | 0;
      for (i = 0; i < count; i++) {
        this.graphics.setColor((i % 2) === 0 ? info.flashColor : oldColor);
        this.graphics.drawString$AttributedCharacterIterator$int$int(iterator, x, y);
        Toolkit.getDefaultToolkit().sync();
        this.sleep(info.flashTime);
      }
      this.graphics.setColor(oldColor);
    }
    this.graphics.drawString$AttributedCharacterIterator$int$int(iterator, x, y);
  }
  /**
   * Overrides <code>Graphics.drawChars</code>.
   */
  drawChars(data: number[], offset: number, length: number, x: number, y: number): void {
    let info = DebugGraphics.info();
    let font = this.graphics.getFont();
    if (this.debugLog()) {
      DebugGraphics.info().log(this.toShortString() + ' Drawing chars at ' + $J.str(new Point()._Point$int$int(x, y)));
    }
    if (this.isDrawingBuffer()) {
      if (this.debugBuffered()) {
        let debugGraphics = this.debugGraphics();
        debugGraphics.drawChars(data, offset, length, x, y);
        debugGraphics.dispose();
      }
    } else if (this.debugFlash()) {
      let oldColor = this.getColor();
      let i: number;
      let count = ((Math.imul(info.flashCount, 2)) - 1) | 0;
      for (i = 0; i < count; i++) {
        this.graphics.setColor((i % 2) === 0 ? info.flashColor : oldColor);
        this.graphics.drawChars(data, offset, length, x, y);
        Toolkit.getDefaultToolkit().sync();
        this.sleep(info.flashTime);
      }
      this.graphics.setColor(oldColor);
    }
    this.graphics.drawChars(data, offset, length, x, y);
  }
  /**
   * Overrides <code>Graphics.drawImage</code>.
   */
  drawImage$Image$int$int$ImageObserver(img: Image, x: number, y: number, observer: ImageObserver): boolean {
    let info = DebugGraphics.info();
    if (this.debugLog()) {
      info.log(this.toShortString() + ' Drawing image: ' + $J.str(img) + ' at: ' + $J.str(new Point()._Point$int$int(x, y)));
    }
    if (this.isDrawingBuffer()) {
      if (this.debugBuffered()) {
        let debugGraphics = this.debugGraphics();
        debugGraphics.drawImage$Image$int$int$ImageObserver(img, x, y, observer);
        debugGraphics.dispose();
      }
    } else if (this.debugFlash()) {
      let i: number;
      let count = ((Math.imul(info.flashCount, 2)) - 1) | 0;
      let oldProducer = img.getSource();
      let newProducer = new FilteredImageSource()._FilteredImageSource(oldProducer, new DebugGraphicsFilter()._DebugGraphicsFilter(info.flashColor));
      let newImage = Toolkit.getDefaultToolkit().createImage(newProducer);
      let imageObserver = new DebugGraphicsObserver()._DebugGraphicsObserver();
      let imageToDraw: Image;
      for (i = 0; i < count; i++) {
        imageToDraw = (i % 2) === 0 ? newImage : img;
        DebugGraphics.loadImage(imageToDraw);
        this.graphics.drawImage$Image$int$int$ImageObserver(imageToDraw, x, y, imageObserver);
        Toolkit.getDefaultToolkit().sync();
        this.sleep(info.flashTime);
      }
    }
    return this.graphics.drawImage$Image$int$int$ImageObserver(img, x, y, observer);
  }
  /**
   * Overrides <code>Graphics.drawImage</code>.
   */
  drawImage$Image$int$int$int$int$ImageObserver(img: Image, x: number, y: number, width: number, height: number, observer: ImageObserver): boolean {
    let info = DebugGraphics.info();
    if (this.debugLog()) {
      info.log(this.toShortString() + ' Drawing image: ' + $J.str(img) + ' at: ' + $J.str(new Rectangle()._Rectangle$int$int$int$int(x, y, width, height)));
    }
    if (this.isDrawingBuffer()) {
      if (this.debugBuffered()) {
        let debugGraphics = this.debugGraphics();
        debugGraphics.drawImage$Image$int$int$int$int$ImageObserver(img, x, y, width, height, observer);
        debugGraphics.dispose();
      }
    } else if (this.debugFlash()) {
      let i: number;
      let count = ((Math.imul(info.flashCount, 2)) - 1) | 0;
      let oldProducer = img.getSource();
      let newProducer = new FilteredImageSource()._FilteredImageSource(oldProducer, new DebugGraphicsFilter()._DebugGraphicsFilter(info.flashColor));
      let newImage = Toolkit.getDefaultToolkit().createImage(newProducer);
      let imageObserver = new DebugGraphicsObserver()._DebugGraphicsObserver();
      let imageToDraw: Image;
      for (i = 0; i < count; i++) {
        imageToDraw = (i % 2) === 0 ? newImage : img;
        DebugGraphics.loadImage(imageToDraw);
        this.graphics.drawImage$Image$int$int$int$int$ImageObserver(imageToDraw, x, y, width, height, imageObserver);
        Toolkit.getDefaultToolkit().sync();
        this.sleep(info.flashTime);
      }
    }
    return this.graphics.drawImage$Image$int$int$int$int$ImageObserver(img, x, y, width, height, observer);
  }
  /**
   * Overrides <code>Graphics.drawImage</code>.
   */
  drawImage$Image$int$int$int$int$int$int$int$int$ImageObserver(img: Image, dx1: number, dy1: number, dx2: number, dy2: number, sx1: number, sy1: number, sx2: number, sy2: number, observer: ImageObserver): boolean {
    let info = DebugGraphics.info();
    if (this.debugLog()) {
      info.log(this.toShortString() + ' Drawing image: ' + $J.str(img) + ' destination: ' + $J.str(new Rectangle()._Rectangle$int$int$int$int(dx1, dy1, dx2, dy2)) + ' source: ' + $J.str(new Rectangle()._Rectangle$int$int$int$int(sx1, sy1, sx2, sy2)));
    }
    if (this.isDrawingBuffer()) {
      if (this.debugBuffered()) {
        let debugGraphics = this.debugGraphics();
        debugGraphics.drawImage$Image$int$int$int$int$int$int$int$int$ImageObserver(img, dx1, dy1, dx2, dy2, sx1, sy1, sx2, sy2, observer);
        debugGraphics.dispose();
      }
    } else if (this.debugFlash()) {
      let i: number;
      let count = ((Math.imul(info.flashCount, 2)) - 1) | 0;
      let oldProducer = img.getSource();
      let newProducer = new FilteredImageSource()._FilteredImageSource(oldProducer, new DebugGraphicsFilter()._DebugGraphicsFilter(info.flashColor));
      let newImage = Toolkit.getDefaultToolkit().createImage(newProducer);
      let imageObserver = new DebugGraphicsObserver()._DebugGraphicsObserver();
      let imageToDraw: Image;
      for (i = 0; i < count; i++) {
        imageToDraw = (i % 2) === 0 ? newImage : img;
        DebugGraphics.loadImage(imageToDraw);
        this.graphics.drawImage$Image$int$int$int$int$int$int$int$int$ImageObserver(imageToDraw, dx1, dy1, dx2, dy2, sx1, sy1, sx2, sy2, imageObserver);
        Toolkit.getDefaultToolkit().sync();
        this.sleep(info.flashTime);
      }
    }
    return this.graphics.drawImage$Image$int$int$int$int$int$int$int$int$ImageObserver(img, dx1, dy1, dx2, dy2, sx1, sy1, sx2, sy2, observer);
  }
  static loadImage(img: Image): void {
    DebugGraphics.imageLoadingIcon.loadImage(img);
  }
  /**
   * Overrides <code>Graphics.copyArea</code>.
   */
  copyArea(x: number, y: number, width: number, height: number, destX: number, destY: number): void {
    if (this.debugLog()) {
      DebugGraphics.info().log(this.toShortString() + ' Copying area from: ' + $J.str(new Rectangle()._Rectangle$int$int$int$int(x, y, width, height)) + ' to: ' + $J.str(new Point()._Point$int$int(destX, destY)));
    }
    this.graphics.copyArea(x, y, width, height, destX, destY);
  }
  sleep(mSecs: number): void {
    try {
      Thread.sleep(mSecs);
    } catch ($e0) {
      if ($J.isa($e0, Exception)) {
        let e = $J.exc($e0);
      } else {
        throw $e0;
      }
    }
  }
  /**
   * Overrides <code>Graphics.dispose</code>.
   */
  dispose(): void {
    this.graphics.dispose();
    this.graphics = null;
  }
  /**
   * Returns the drawingBuffer value.
   *
   * @return true if this object is drawing from a Buffer
   */
  isDrawingBuffer(): boolean {
    return this.buffer != null;
  }
  toShortString(): string {
    return 'Graphics' + (this.isDrawingBuffer() ? '<B>' : '') + '(' + this.graphicsID + '-' + this.debugOptions + ')';
  }
  pointToString(x: number, y: number): string {
    return '(' + x + ', ' + y + ')';
  }
  /**
   * Enables/disables diagnostic information about every graphics
   * operation. The value of <b>options</b> indicates how this information
   * should be displayed. LOG_OPTION causes a text message to be printed.
   * FLASH_OPTION causes the drawing to flash several times. BUFFERED_OPTION
   * creates a new Frame that shows each operation on an
   * offscreen buffer. The value of <b>options</b> is bitwise OR'd into
   * the current value. To disable debugging use NONE_OPTION.
   *
   * @param options indicates how diagnostic information should be displayed
   */
  setDebugOptions(options: number): void {
    if (options !== 0) {
      if (options === DebugGraphics.NONE_OPTION) {
        if (this.debugOptions !== 0) {
          $J.err.println(this.toShortString() + ' Disabling debug');
          this.debugOptions = 0;
        }
      } else {
        if (this.debugOptions !== options) {
          this.debugOptions |= options;
          if (this.debugLog()) {
            $J.err.println(this.toShortString() + ' Enabling debug');
          }
        }
      }
    }
  }
  /**
   * Returns non-zero if <b>component</b> should display with DebugGraphics,
   * zero otherwise. Walks the JComponent's parent tree to determine if
   * any debugging options have been set.
   */
  static shouldComponentDebug(component: JComponent): number {
    let info = DebugGraphics.info();
    var jc;
    if (info == null) {
      return 0;
    } else {
      let container = component;
      let debugOptions = 0;
      var jc;
      while ((jc = container) instanceof JComponent) {
        debugOptions |= info.getDebugOptions(jc);
        container = container.getParent();
      }
      return debugOptions;
    }
  }
  /**
   * Returns the number of JComponents that have debugging options turned
   * on.
   */
  static debugComponentCount(): number {
    let debugGraphicsInfo = DebugGraphics.info();
    if (debugGraphicsInfo != null && debugGraphicsInfo.componentToDebug != null) {
      return debugGraphicsInfo.componentToDebug.size();
    } else {
      return 0;
    }
  }
  debugLog(): boolean {
    return (this.debugOptions & DebugGraphics.LOG_OPTION) === DebugGraphics.LOG_OPTION;
  }
  debugFlash(): boolean {
    return (this.debugOptions & DebugGraphics.FLASH_OPTION) === DebugGraphics.FLASH_OPTION;
  }
  debugBuffered(): boolean {
    return (this.debugOptions & DebugGraphics.BUFFERED_OPTION) === DebugGraphics.BUFFERED_OPTION;
  }
  /**
   * Returns a DebugGraphics for use in buffering window.
   */
  debugGraphics(): Graphics {
    let debugGraphics: DebugGraphics;
    let info = DebugGraphics.info();
    let debugFrame: JFrame;
    if (info.debugFrame == null) {
      info.debugFrame = new JFrame()._JFrame$();
      info.debugFrame.setSize$int$int(500, 500);
    }
    debugFrame = info.debugFrame;
    debugFrame.show$();
    debugGraphics = new DebugGraphics()._DebugGraphics$Graphics(debugFrame.getGraphics());
    debugGraphics.setFont(this.getFont());
    debugGraphics.setColor(this.getColor());
    debugGraphics.translate$int$int(this.xOffset, this.yOffset);
    debugGraphics.setClip$Shape(this.getClipBounds$());
    if (this.debugFlash()) {
      debugGraphics.setDebugOptions(DebugGraphics.FLASH_OPTION);
    }
    return debugGraphics;
  }
  /**
   * Returns DebugGraphicsInfo, or creates one if none exists.
   */
  static info(): DebugGraphicsInfo {
    let debugGraphicsInfo = SwingUtilities.appContextGet(DebugGraphics.debugGraphicsInfoKey);
    if (debugGraphicsInfo == null) {
      debugGraphicsInfo = new DebugGraphicsInfo()._DebugGraphicsInfo();
      SwingUtilities.appContextPut(DebugGraphics.debugGraphicsInfoKey, debugGraphicsInfo);
    }
    return debugGraphicsInfo;
  }
  static $clinit() {
    DebugGraphics.graphicsCount = 0;
    DebugGraphics.imageLoadingIcon = new ImageIcon()._ImageIcon$();
    JComponent.DEBUG_GRAPHICS_LOADED = true;
    DebugGraphics.debugGraphicsInfoKey = $J.cls(DebugGraphicsInfo);
  }
}

let $DebugGraphics$1: any = null;
/** An anonymous class (DebugGraphics.java:90). */
function DebugGraphics$1(): any {
  return $DebugGraphics$1 ??= $J.local(class extends JObject {
    run(): StackWalker {
      let stackwalker = StackWalker.getInstance(StackWalker_Option.RETAIN_CLASS_REFERENCE);
      return stackwalker;
    }
  }, 'javax.swing.DebugGraphics$1', ['java.security.PrivilegedAction']);
}

$J.define(DebugGraphics, 'javax.swing.DebugGraphics', { kind: 'class', sup: 'java.awt.Graphics', ctors: { 'java.awt.Graphics': '_DebugGraphics$Graphics', 'java.awt.Graphics,javax.swing.JComponent': '_DebugGraphics$Graphics$JComponent', '': '_DebugGraphics$' }, meths: { 'drawImage(java.awt.Image,int,int,int,int,int,int,int,int,java.awt.Color,java.awt.image.ImageObserver)': 'drawImage$Image$int$int$int$int$int$int$int$int$Color$ImageObserver', 'drawImage(java.awt.Image,int,int,int,int,int,int,int,int,java.awt.image.ImageObserver)': 'drawImage$Image$int$int$int$int$int$int$int$int$ImageObserver', 'drawImage(java.awt.Image,int,int,int,int,java.awt.Color,java.awt.image.ImageObserver)': 'drawImage$Image$int$int$int$int$Color$ImageObserver', 'drawImage(java.awt.Image,int,int,java.awt.Color,java.awt.image.ImageObserver)': 'drawImage$Image$int$int$Color$ImageObserver', 'drawImage(java.awt.Image,int,int,int,int,java.awt.image.ImageObserver)': 'drawImage$Image$int$int$int$int$ImageObserver', 'drawImage(java.awt.Image,int,int,java.awt.image.ImageObserver)': 'drawImage$Image$int$int$ImageObserver', 'drawString(java.text.AttributedCharacterIterator,int,int)': 'drawString$AttributedCharacterIterator$int$int', 'drawString(java.lang.String,int,int)': 'drawString$String$int$int', 'fillPolygon(int[],int[],int)': 'fillPolygon$intArr$intArr$int', 'drawPolygon(int[],int[],int)': 'drawPolygon$intArr$intArr$int', 'setClip(java.awt.Shape)': 'setClip$Shape', 'setClip(int,int,int,int)': 'setClip$int$int$int$int', 'getClipBounds()': 'getClipBounds$', 'translate(int,int)': 'translate$int$int', 'getFontMetrics(java.awt.Font)': 'getFontMetrics$Font', 'getFontMetrics()': 'getFontMetrics$', 'create(int,int,int,int)': 'create$int$int$int$int', 'create()': 'create$' }, clinit: true, lazy: ['graphicsCount', 'imageLoadingIcon', 'debugGraphicsInfoKey'] });
$J.module(() => {
  Point = $J.load('java.awt.Point');
  Rectangle = $J.load('java.awt.Rectangle');
  FilteredImageSource = $J.load('java.awt.image.FilteredImageSource');
  DebugGraphicsFilter = $J.load('javax.swing.DebugGraphicsFilter');
  DebugGraphicsInfo = $J.load('javax.swing.DebugGraphicsInfo');
  DebugGraphicsObserver = $J.load('javax.swing.DebugGraphicsObserver');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JComponent = $J.load('javax.swing.JComponent');
  JFrame = $J.load('javax.swing.JFrame');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
});
