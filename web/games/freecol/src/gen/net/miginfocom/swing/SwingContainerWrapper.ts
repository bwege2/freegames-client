// @ts-nocheck
// MigLayout 5.3 swing/net/miginfocom/swing/SwingContainerWrapper.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * License (BSD):
 * ==============
 *
 * Copyright (c) 2004, Mikael Grev, MiG InfoCom AB. (miglayout (at) miginfocom (dot) com)
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 * Redistributions of source code must retain the above copyright notice, this list
 * of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this
 * list of conditions and the following disclaimer in the documentation and/or other
 * materials provided with the distribution.
 * Neither the name of the MiG InfoCom AB nor the names of its contributors may be
 * used to endorse or promote products derived from this software without specific
 * prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 * OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY
 * OF SUCH DAMAGE.
 *
 * @version 1.0
 * @author Mikael Grev, MiG InfoCom AB
 *         Date: 2006-sep-08
 */
import { $J } from '../../../../jre/index.ts';
import { SwingComponentWrapper } from './SwingComponentWrapper.ts';

let BasicStroke, Color, ComponentWrapper;

export class SwingContainerWrapper extends SwingComponentWrapper {
  /**
   * Debug color for cell outline.
   */
  static DB_CELL_OUTLINE: Color = null;
  _SwingContainerWrapper(c: Container): this {
    this._SwingComponentWrapper(c);
    return this;
  }
  getComponents(): ComponentWrapper[] {
    let c = this.getComponent();
    let cws = $J.newArray(c.getComponentCount(), null);
    for (let i = 0; i < cws.length; i++) {
      cws[i] = new SwingComponentWrapper()._SwingComponentWrapper(c.getComponent$int(i));
    }
    return cws;
  }
  getComponentCount(): number {
    return (this.getComponent()).getComponentCount();
  }
  getLayout(): any {
    return (this.getComponent()).getLayout();
  }
  isLeftToRight(): boolean {
    return (this.getComponent()).getComponentOrientation().isLeftToRight();
  }
  paintDebugCell(x: number, y: number, width: number, height: number): void {
    let c = this.getComponent();
    if (c.isShowing() === false) {
      return;
    }
    let g = c.getGraphics();
    if (g == null) {
      return;
    }
    g.setStroke(new BasicStroke()._BasicStroke$float$int$int$float$floatArr$float(1, BasicStroke.CAP_SQUARE, BasicStroke.JOIN_MITER, 10, [2, 3], 0));
    g.setPaint(SwingContainerWrapper.DB_CELL_OUTLINE);
    g.drawRect(x, y, (width - 1) | 0, (height - 1) | 0);
  }
  getComponentType(disregardScrollPane: boolean): number {
    return ComponentWrapper.TYPE_CONTAINER;
  }
  getLayoutHashCode(): number {
    let n = $J.system_nanoTime();
    let h = super.getLayoutHashCode();
    if (this.isLeftToRight()) {
      h = (h + 416343) | 0;
    }
    return 0;
  }
  static $clinit() {
    SwingContainerWrapper.DB_CELL_OUTLINE = new Color()._Color$int$int$int(255, 0, 0);
  }
}

$J.define(SwingContainerWrapper, 'net.miginfocom.swing.SwingContainerWrapper', { kind: 'class', ifaces: ['net.miginfocom.layout.ContainerWrapper'], sup: 'net.miginfocom.swing.SwingComponentWrapper', ctors: { 'java.awt.Container': '_SwingContainerWrapper' }, clinit: true, lazy: ['DB_CELL_OUTLINE'] });
$J.module(() => {
  BasicStroke = $J.load('java.awt.BasicStroke');
  Color = $J.load('java.awt.Color');
  ComponentWrapper = $J.load('net.miginfocom.layout.ComponentWrapper');
});
