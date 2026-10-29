// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/text/DefaultHighlighter.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject, Vector } from '../../../../jre/index.ts';
import { LayeredHighlighter } from './LayeredHighlighter.ts';
import { LayeredHighlighter$LayerPainter } from './LayeredHighlighter.ts';

let Rectangle, SwingUtilities, BadLocationException, Position$Bias;

/**
 * Implements the Highlighter interfaces.  Implements a simple highlight
 * painter that renders in a solid color.
 *
 * @author  Timothy Prinzing
 * @see     Highlighter
 */
export class DefaultHighlighter extends LayeredHighlighter {
  static noHighlights: Highlighter$Highlight[] = null;
  highlights: Vector<DefaultHighlighter$HighlightInfo> = null;
  component: JTextComponent = null;
  drawsLayeredHighlights: boolean = false;
  safeDamager: DefaultHighlighter$SafeDamager = null;
  /**
   * Default implementation of LayeredHighlighter.LayerPainter that can
   * be used for painting highlights.
   * <p>
   * As of 1.4 this field is final.
   */
  static DefaultPainter: LayeredHighlighter$LayerPainter = null;
  /**
   * Creates a new DefaultHighlighter object.
   */
  _DefaultHighlighter(): this {
    this._LayeredHighlighter();
    this.highlights = new Vector();
    this.safeDamager = new DefaultHighlighter$SafeDamager().$o(this)._DefaultHighlighter$SafeDamager();
    this.drawsLayeredHighlights = true;
    return this;
  }
  /**
   * Renders the highlights.
   *
   * @param g the graphics context
   */
  paint(g: Graphics): void {
    let len = this.highlights.size();
    for (let i = 0; i < len; i++) {
      let info = this.highlights.elementAt(i);
      if (!(info instanceof DefaultHighlighter$LayeredHighlightInfo)) {
        let a = this.component.getBounds$();
        let insets = this.component.getInsets$();
        a.x_ = insets.left;
        a.y_ = insets.top;
        a.width_ = (a.width_ - (insets.left + insets.right)) | 0;
        a.height_ = (a.height_ - (insets.top + insets.bottom)) | 0;
        for (; i < len; i++) {
          info = this.highlights.elementAt(i);
          if (!(info instanceof DefaultHighlighter$LayeredHighlightInfo)) {
            let p = info.getPainter();
            p.paint(g, info.getStartOffset(), info.getEndOffset(), a, this.component);
          }
        }
      }
    }
  }
  /**
   * Called when the UI is being installed into the
   * interface of a JTextComponent.  Installs the editor, and
   * removes any existing highlights.
   *
   * @param c the editor component
   * @see Highlighter#install
   */
  install(c: JTextComponent): void {
    this.component = c;
    this.removeAllHighlights();
  }
  /**
   * Called when the UI is being removed from the interface of
   * a JTextComponent.
   *
   * @param c the component
   * @see Highlighter#deinstall
   */
  deinstall(c: JTextComponent): void {
    this.component = null;
  }
  /**
   * Adds a highlight to the view.  Returns a tag that can be used
   * to refer to the highlight.
   *
   * @param p0   the start offset of the range to highlight &gt;= 0
   * @param p1   the end offset of the range to highlight &gt;= p0
   * @param p    the painter to use to actually render the highlight
   * @return     an object that can be used as a tag
   *   to refer to the highlight
   * @throws BadLocationException if the specified location is invalid
   */
  addHighlight(p0: number, p1: number, p: Highlighter$HighlightPainter): any {
    if (p0 < 0) {
      throw new BadLocationException()._BadLocationException('Invalid start offset', p0);
    }
    if (p1 < p0) {
      throw new BadLocationException()._BadLocationException('Invalid end offset', p1);
    }
    let doc = this.component.getDocument();
    let i = (this.getDrawsLayeredHighlights() && (p instanceof LayeredHighlighter$LayerPainter)) ? new DefaultHighlighter$LayeredHighlightInfo()._DefaultHighlighter$LayeredHighlightInfo() : new DefaultHighlighter$HighlightInfo()._DefaultHighlighter$HighlightInfo();
    i.painter = p;
    i.p0 = doc.createPosition(p0);
    i.p1 = doc.createPosition(p1);
    this.highlights.addElement(i);
    this.safeDamageRange$int$int$DefaultHighlighter(p0, p1);
    return i;
  }
  /**
   * Removes a highlight from the view.
   *
   * @param tag the reference to the highlight
   */
  removeHighlight(tag: any): void {
    if (tag instanceof DefaultHighlighter$LayeredHighlightInfo) {
      let lhi = tag;
      if (lhi.width_ > 0 && lhi.height_ > 0) {
        this.component.repaint$int$int$int$int(lhi.x_, lhi.y_, lhi.width_, lhi.height_);
      }
    } else {
      let info = tag;
      this.safeDamageRange$Position$Position$DefaultHighlighter(info.p0, info.p1);
    }
    this.highlights.removeElement(tag);
  }
  /**
   * Removes all highlights.
   */
  removeAllHighlights(): void {
    let mapper = this.component.getUI();
    if (this.getDrawsLayeredHighlights()) {
      let len = this.highlights.size();
      if (len !== 0) {
        let minX = 0;
        let minY = 0;
        let maxX = 0;
        let maxY = 0;
        let p0 = -1;
        let p1 = -1;
        for (let i = 0; i < len; i++) {
          let hi = this.highlights.elementAt(i);
          if (hi instanceof DefaultHighlighter$LayeredHighlightInfo) {
            let info = hi;
            minX = Math.min(minX, info.x_);
            minY = Math.min(minY, info.y_);
            maxX = Math.max(maxX, (info.x_ + info.width_) | 0);
            maxY = Math.max(maxY, (info.y_ + info.height_) | 0);
          } else {
            if (p0 === -1) {
              p0 = hi.p0.getOffset();
              p1 = hi.p1.getOffset();
            } else {
              p0 = Math.min(p0, hi.p0.getOffset());
              p1 = Math.max(p1, hi.p1.getOffset());
            }
          }
        }
        if (minX !== maxX && minY !== maxY) {
          this.component.repaint$int$int$int$int(minX, minY, (maxX - minX) | 0, (maxY - minY) | 0);
        }
        if (p0 !== -1) {
          try {
            this.safeDamageRange$int$int$DefaultHighlighter(p0, p1);
          } catch ($e0) {
            if ($J.isa($e0, BadLocationException)) {
              let e = $J.exc($e0);
            } else {
              throw $e0;
            }
          }
        }
        this.highlights.removeAllElements();
      }
    } else if (mapper != null) {
      let len = this.highlights.size();
      if (len !== 0) {
        let p0 = 2147483647;
        let p1 = 0;
        for (let i = 0; i < len; i++) {
          let info = this.highlights.elementAt(i);
          p0 = Math.min(p0, info.p0.getOffset());
          p1 = Math.max(p1, info.p1.getOffset());
        }
        try {
          this.safeDamageRange$int$int$DefaultHighlighter(p0, p1);
        } catch ($e1) {
          if ($J.isa($e1, BadLocationException)) {
            let e = $J.exc($e1);
          } else {
            throw $e1;
          }
        }
        this.highlights.removeAllElements();
      }
    }
  }
  /**
   * Changes a highlight.
   *
   * @param tag the highlight tag
   * @param p0 the beginning of the range &gt;= 0
   * @param p1 the end of the range &gt;= p0
   * @throws BadLocationException if the specified location is invalid
   */
  changeHighlight(tag: any, p0: number, p1: number): void {
    if (p0 < 0) {
      throw new BadLocationException()._BadLocationException('Invalid beginning of the range', p0);
    }
    if (p1 < p0) {
      throw new BadLocationException()._BadLocationException('Invalid end of the range', p1);
    }
    let doc = this.component.getDocument();
    if (tag instanceof DefaultHighlighter$LayeredHighlightInfo) {
      let lhi = tag;
      if (lhi.width_ > 0 && lhi.height_ > 0) {
        this.component.repaint$int$int$int$int(lhi.x_, lhi.y_, lhi.width_, lhi.height_);
      }
      lhi.width_ = lhi.height_ = 0;
      lhi.p0 = doc.createPosition(p0);
      lhi.p1 = doc.createPosition(p1);
      this.safeDamageRange$int$int$DefaultHighlighter(p0, p1);
    } else {
      let info = tag;
      let oldP0 = info.p0.getOffset();
      let oldP1 = info.p1.getOffset();
      if (p0 === oldP0) {
        this.safeDamageRange$int$int$DefaultHighlighter(Math.min(oldP1, p1), Math.max(oldP1, p1));
      } else if (p1 === oldP1) {
        this.safeDamageRange$int$int$DefaultHighlighter(Math.min(p0, oldP0), Math.max(p0, oldP0));
      } else {
        this.safeDamageRange$int$int$DefaultHighlighter(oldP0, oldP1);
        this.safeDamageRange$int$int$DefaultHighlighter(p0, p1);
      }
      info.p0 = doc.createPosition(p0);
      info.p1 = doc.createPosition(p1);
    }
  }
  /**
   * Makes a copy of the highlights.  Does not actually clone each highlight,
   * but only makes references to them.
   *
   * @return the copy
   * @see Highlighter#getHighlights
   */
  getHighlights(): Highlighter$Highlight[] {
    let size = this.highlights.size();
    if (size === 0) {
      return DefaultHighlighter.noHighlights;
    }
    let h = $J.newArray(size, null);
    this.highlights.copyInto(h);
    return h;
  }
  /**
   * When leaf Views (such as LabelView) are rendering they should
   * call into this method. If a highlight is in the given region it will
   * be drawn immediately.
   *
   * @param g Graphics used to draw
   * @param p0 starting offset of view
   * @param p1 ending offset of view
   * @param viewBounds Bounds of View
   * @param editor JTextComponent
   * @param view View instance being rendered
   */
  paintLayeredHighlights(g: Graphics, p0: number, p1: number, viewBounds: Shape, editor: JTextComponent, view: View): void {
    for (let counter = (this.highlights.size() - 1) | 0; counter >= 0; counter--) {
      let tag = this.highlights.elementAt(counter);
      if (tag instanceof DefaultHighlighter$LayeredHighlightInfo) {
        let lhi = tag;
        let start = lhi.getStartOffset();
        let end = lhi.getEndOffset();
        if ((p0 < start && p1 > start) || (p0 >= start && p0 < end)) {
          lhi.paintLayeredHighlights(g, p0, p1, viewBounds, editor, view);
        }
      }
    }
  }
  /**
   * Queues damageRange() call into event dispatch thread
   * to be sure that views are in consistent state.
   */
  safeDamageRange$Position$Position$DefaultHighlighter(p0: Position, p1: Position): void {
    this.safeDamager.damageRange(p0, p1);
  }
  /**
   * Queues damageRange() call into event dispatch thread
   * to be sure that views are in consistent state.
   */
  safeDamageRange$int$int$DefaultHighlighter(a0: number, a1: number): void {
    let doc = this.component.getDocument();
    this.safeDamageRange$Position$Position$DefaultHighlighter(doc.createPosition(a0), doc.createPosition(a1));
  }
  /**
   * Return the draw layered highlights.
   * @return the draw layered highlights
   */
  getDrawsLayeredHighlights(): boolean {
    return this.drawsLayeredHighlights;
  }
  static $clinit() {
    DefaultHighlighter.noHighlights = $J.newArray(0, null);
    DefaultHighlighter.DefaultPainter = new DefaultHighlighter$DefaultHighlightPainter()._DefaultHighlighter$DefaultHighlightPainter(null);
  }
}

/**
 * Simple highlight painter that fills a highlighted area with
 * a solid color.
 */
export class DefaultHighlighter$DefaultHighlightPainter extends LayeredHighlighter$LayerPainter {
  color: Color = null;
  /**
   * Constructs a new highlight painter. If <code>c</code> is null,
   * the JTextComponent will be queried for its selection color.
   *
   * @param c the color for the highlight
   */
  _DefaultHighlighter$DefaultHighlightPainter(c: Color): this {
    this._LayeredHighlighter$LayerPainter();
    this.color = c;
    return this;
  }
  /**
   * Returns the color of the highlight.
   *
   * @return the color
   */
  getColor(): Color {
    return this.color;
  }
  /**
   * Paints a highlight.
   *
   * @param g the graphics context
   * @param offs0 the starting model offset &gt;= 0
   * @param offs1 the ending model offset &gt;= offs1
   * @param bounds the bounding box for the highlight
   * @param c the editor
   */
  paint(g: Graphics, offs0: number, offs1: number, bounds: Shape, c: JTextComponent): void {
    let alloc = bounds.getBounds();
    try {
      let mapper = c.getUI();
      let p0 = mapper.modelToView$JTextComponent$int(c, offs0);
      let p1 = mapper.modelToView$JTextComponent$int(c, offs1);
      let color = this.getColor();
      if (color == null) {
        g.setColor(c.getSelectionColor());
      } else {
        g.setColor(color);
      }
      if (p0.y_ === p1.y_) {
        let r = p0.union(p1);
        g.fillRect(r.x_, r.y_, r.width_, r.height_);
      } else {
        let p0ToMarginWidth = (alloc.x_ + alloc.width_ - p0.x_) | 0;
        g.fillRect(p0.x_, p0.y_, p0ToMarginWidth, p0.height_);
        if (((p0.y_ + p0.height_) | 0) !== p1.y_) {
          g.fillRect(alloc.x_, (p0.y_ + p0.height_) | 0, alloc.width_, (p1.y_ - (p0.y_ + p0.height_)) | 0);
        }
        g.fillRect(alloc.x_, p1.y_, ((p1.x_ - alloc.x_) | 0), p1.height_);
      }
    } catch ($e2) {
      if ($J.isa($e2, BadLocationException)) {
        let e = $J.exc($e2);
      } else {
        throw $e2;
      }
    }
  }
  /**
   * Paints a portion of a highlight.
   *
   * @param g the graphics context
   * @param offs0 the starting model offset &gt;= 0
   * @param offs1 the ending model offset &gt;= offs1
   * @param bounds the bounding box of the view, which is not
   *        necessarily the region to paint.
   * @param c the editor
   * @param view View painting for
   * @return region drawing occurred in
   */
  paintLayer(g: Graphics, offs0: number, offs1: number, bounds: Shape, c: JTextComponent, view: View): Shape {
    let color = this.getColor();
    if (color == null) {
      g.setColor(c.getSelectionColor());
    } else {
      g.setColor(color);
    }
    let r: Rectangle;
    if (offs0 === view.getStartOffset() && offs1 === view.getEndOffset()) {
      if (bounds instanceof Rectangle) {
        r = bounds;
      } else {
        r = bounds.getBounds();
      }
    } else {
      try {
        let shape = view.modelToView$int$Bias$int$Bias$Shape(offs0, Position$Bias.Forward, offs1, Position$Bias.Backward, bounds);
        r = (shape instanceof Rectangle) ? shape : shape.getBounds();
      } catch ($e3) {
        if ($J.isa($e3, BadLocationException)) {
          let e = $J.exc($e3);
          r = null;
        } else {
          throw $e3;
        }
      }
    }
    if (r != null) {
      r.width_ = Math.max(r.width_, 1);
      g.fillRect(r.x_, r.y_, r.width_, r.height_);
    }
    return r;
  }
}

export class DefaultHighlighter$HighlightInfo extends JObject {
  p0: Position = null;
  p1: Position = null;
  painter: Highlighter$HighlightPainter = null;
  _DefaultHighlighter$HighlightInfo(): this {
    return this;
  }
  getStartOffset(): number {
    return this.p0.getOffset();
  }
  getEndOffset(): number {
    return this.p1.getOffset();
  }
  getPainter(): Highlighter$HighlightPainter {
    return this.painter;
  }
}

/**
 * LayeredHighlightPainter is used when a drawsLayeredHighlights is
 * true. It maintains a rectangle of the region to paint.
 */
export class DefaultHighlighter$LayeredHighlightInfo extends DefaultHighlighter$HighlightInfo {
  x_: number = 0;
  y_: number = 0;
  width_: number = 0;
  height_: number = 0;
  _DefaultHighlighter$LayeredHighlightInfo(): this {
    this._DefaultHighlighter$HighlightInfo();
    return this;
  }
  union(bounds: Shape): void {
    if (bounds == null) {
      return;
    }
    let alloc: Rectangle;
    if (bounds instanceof Rectangle) {
      alloc = bounds;
    } else {
      alloc = bounds.getBounds();
    }
    if (this.width_ === 0 || this.height_ === 0) {
      this.x_ = alloc.x_;
      this.y_ = alloc.y_;
      this.width_ = alloc.width_;
      this.height_ = alloc.height_;
    } else {
      this.width_ = Math.max((this.x_ + this.width_) | 0, (alloc.x_ + alloc.width_) | 0);
      this.height_ = Math.max((this.y_ + this.height_) | 0, (alloc.y_ + alloc.height_) | 0);
      this.x_ = Math.min(this.x_, alloc.x_);
      this.width_ = (this.width_ - this.x_) | 0;
      this.y_ = Math.min(this.y_, alloc.y_);
      this.height_ = (this.height_ - this.y_) | 0;
    }
  }
  /**
   * Restricts the region based on the receivers offsets and messages
   * the painter to paint the region.
   */
  paintLayeredHighlights(g: Graphics, p0: number, p1: number, viewBounds: Shape, editor: JTextComponent, view: View): void {
    let start = this.getStartOffset();
    let end = this.getEndOffset();
    p0 = Math.max(start, p0);
    p1 = Math.min(end, p1);
    this.union((this.painter).paintLayer(g, p0, p1, viewBounds, editor, view));
  }
}

/**
 * This class invokes <code>mapper.damageRange</code> in
 * EventDispatchThread. The only one instance per Highlighter
 * is created. When a number of ranges should be damaged
 * it collects them into queue and damages
 * them in consecutive order in <code>run</code>
 * call.
 */
export class DefaultHighlighter$SafeDamager extends JObject {
  p0: Vector<Position> = null;
  p1: Vector<Position> = null;
  lastDoc: Document = null;
  _DefaultHighlighter$SafeDamager(): this {
    this.p0 = new Vector(10);
    this.p1 = new Vector(10);
    this.lastDoc = null;
    return this;
  }
  /**
   * Executes range(s) damage and cleans range queue.
   */
  run(): void {
    if (this.$outer.component != null) {
      let mapper = this.$outer.component.getUI();
      if (mapper != null && this.lastDoc === this.$outer.component.getDocument()) {
        let len = this.p0.size();
        for (let i = 0; i < len; i++) {
          mapper.damageRange$JTextComponent$int$int(this.$outer.component, this.p0.get(i).getOffset(), this.p1.get(i).getOffset());
        }
      }
    }
    this.p0.clear();
    this.p1.clear();
    this.lastDoc = null;
  }
  /**
   * Adds the range to be damaged into the range queue. If the
   * range queue is empty (the first call or run() was already
   * invoked) then adds this class instance into EventDispatch
   * queue.
   *
   * The method also tracks if the current document changed or
   * component is null. In this case it removes all ranges added
   * before from range queue.
   */
  damageRange(pos0: Position, pos1: Position): void {
    if (this.$outer.component == null) {
      this.p0.clear();
      this.lastDoc = null;
      return;
    }
    let addToQueue = this.p0.isEmpty();
    let curDoc = this.$outer.component.getDocument();
    if (curDoc !== this.lastDoc) {
      if (!this.p0.isEmpty()) {
        this.p0.clear();
        this.p1.clear();
      }
      this.lastDoc = curDoc;
    }
    this.p0.add(pos0);
    this.p1.add(pos1);
    if (addToQueue) {
      SwingUtilities.invokeLater($J.fn(this, 'run'));
    }
  }
}

$J.define(DefaultHighlighter, 'javax.swing.text.DefaultHighlighter', { kind: 'class', sup: 'javax.swing.text.LayeredHighlighter', ctors: { '': '_DefaultHighlighter' }, meths: { 'safeDamageRange(int,int)': 'safeDamageRange$int$int$DefaultHighlighter', 'safeDamageRange(javax.swing.text.Position,javax.swing.text.Position)': 'safeDamageRange$Position$Position$DefaultHighlighter' }, clinit: true, lazy: ['noHighlights', 'DefaultPainter'] });
$J.define(DefaultHighlighter$DefaultHighlightPainter, 'javax.swing.text.DefaultHighlighter$DefaultHighlightPainter', { kind: 'class', sup: 'javax.swing.text.LayeredHighlighter$LayerPainter', ctors: { 'java.awt.Color': '_DefaultHighlighter$DefaultHighlightPainter' } });
$J.define(DefaultHighlighter$HighlightInfo, 'javax.swing.text.DefaultHighlighter$HighlightInfo', { kind: 'class', ifaces: ['javax.swing.text.Highlighter$Highlight'], sup: 'java.lang.Object', ctors: { '': '_DefaultHighlighter$HighlightInfo' } });
$J.define(DefaultHighlighter$LayeredHighlightInfo, 'javax.swing.text.DefaultHighlighter$LayeredHighlightInfo', { kind: 'class', sup: 'javax.swing.text.DefaultHighlighter$HighlightInfo', ctors: { '': '_DefaultHighlighter$LayeredHighlightInfo' } });
$J.define(DefaultHighlighter$SafeDamager, 'javax.swing.text.DefaultHighlighter$SafeDamager', { kind: 'class', ifaces: ['java.lang.Runnable'], sup: 'java.lang.Object', ctors: { '': '_DefaultHighlighter$SafeDamager' }, inner: true });
$J.module(() => {
  Rectangle = $J.load('java.awt.Rectangle');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  BadLocationException = $J.load('javax.swing.text.BadLocationException');
  Position$Bias = $J.load('javax.swing.text.Position$Bias');
});
