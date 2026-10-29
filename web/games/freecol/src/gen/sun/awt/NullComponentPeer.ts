// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/awt/NullComponentPeer.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2000, 2020, Oracle and/or its affiliates. All rights reserved.
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
import { $J, IllegalStateException, JObject, UnsupportedOperationException } from '../../../jre/index.ts';

let AWTException, Dimension, Insets, Point;

/**
 * Implements the LightweightPeer interface for use in lightweight components
 * that have no native window associated with them.  This gets created by
 * default in Component so that Component and Container can be directly
 * extended to create useful components written entirely in java.  These
 * components must be hosted somewhere higher up in the component tree by a
 * native container (such as a Frame).
 *
 * This implementation provides no useful semantics and serves only as a
 * marker.  One could provide alternative implementations in java that do
 * something useful for some of the other peer interfaces to minimize the
 * native code.
 *
 * This was renamed from java.awt.LightweightPeer (a horrible and confusing
 * name) and moved from java.awt.Toolkit into sun.awt as a public class in
 * its own file.
 *
 * @author Timothy Prinzing
 * @author Michael Martak
 */
export class NullComponentPeer extends JObject {
  _NullComponentPeer(): this {
    return this;
  }
  isObscured(): boolean {
    return false;
  }
  canDetermineObscurity(): boolean {
    return false;
  }
  isFocusable(): boolean {
    return false;
  }
  setVisible(b: boolean): void {
  }
  setEnabled(b: boolean): void {
  }
  paint(g: Graphics): void {
  }
  print(g: Graphics): void {
  }
  setBounds(x: number, y: number, width: number, height: number, op: number): void {
  }
  coalescePaintEvent(e: PaintEvent): void {
  }
  handleEvent(arg0: AWTEvent): void {
  }
  getPreferredSize(): Dimension {
    return new Dimension()._Dimension$int$int(1, 1);
  }
  getMinimumSize(): Dimension {
    return new Dimension()._Dimension$int$int(1, 1);
  }
  getColorModel(): ColorModel {
    return null;
  }
  getGraphics(): Graphics {
    return null;
  }
  getGraphicsConfiguration(): GraphicsConfiguration {
    return null;
  }
  getFontMetrics(font: Font): FontMetrics {
    return null;
  }
  dispose(): void {
  }
  setForeground(c: Color): void {
  }
  setBackground(c: Color): void {
  }
  setFont(f: Font): void {
  }
  updateCursorImmediately(): void {
  }
  requestFocus(lightweightChild: Component, temporary: boolean, focusedWindowChangeAllowed: boolean, time: number, cause: FocusEvent$Cause): boolean {
    return false;
  }
  createImage(width: number, height: number): Image {
    return null;
  }
  getLocationOnScreen(): Point {
    return new Point()._Point$int$int(0, 0);
  }
  getInsets(): Insets {
    return this.insets();
  }
  beginValidate(): void {
  }
  endValidate(): void {
  }
  insets(): Insets {
    return new Insets()._Insets(0, 0, 0, 0);
  }
  handlesWheelScrolling(): boolean {
    return false;
  }
  createVolatileImage(width: number, height: number): VolatileImage {
    return null;
  }
  beginLayout(): void {
  }
  endLayout(): void {
  }
  createBuffers(numBuffers: number, caps: BufferCapabilities): void {
    throw new AWTException()._AWTException('Page-flipping is not allowed on a lightweight component');
  }
  getBackBuffer(): Image {
    throw new IllegalStateException('Page-flipping is not allowed on a lightweight component');
  }
  flip(x1: number, y1: number, x2: number, y2: number, flipAction: BufferCapabilities$FlipContents): void {
    throw new IllegalStateException('Page-flipping is not allowed on a lightweight component');
  }
  destroyBuffers(): void {
  }
  /**
   * @see java.awt.peer.ComponentPeer#isReparentSupported
   */
  isReparentSupported(): boolean {
    return false;
  }
  /**
   * @see java.awt.peer.ComponentPeer#reparent
   */
  reparent(newNativeParent: ContainerPeer): void {
    throw new UnsupportedOperationException();
  }
  layout(): void {
  }
  /**
   * Applies the shape to the native component window.
   * @since 1.7
   */
  applyShape(shape: Region): void {
  }
  /**
   * Lowers this component at the bottom of the above HW peer. If the above parameter
   * is null then the method places this component at the top of the Z-order.
   */
  setZOrder(above: ComponentPeer): void {
  }
  updateGraphicsData(gc: GraphicsConfiguration): boolean {
    return false;
  }
  getAppropriateGraphicsConfiguration(gc: GraphicsConfiguration): GraphicsConfiguration {
    return gc;
  }
}

$J.define(NullComponentPeer, 'sun.awt.NullComponentPeer', { kind: 'class', ifaces: ['java.awt.peer.LightweightPeer', 'java.awt.peer.CanvasPeer', 'java.awt.peer.PanelPeer'], sup: 'java.lang.Object', ctors: { '': '_NullComponentPeer' }, meths: { 'handleEvent(java.awt.Event)': 'handleEvent$Event' } });
$J.module(() => {
  AWTException = $J.load('java.awt.AWTException');
  Dimension = $J.load('java.awt.Dimension');
  Insets = $J.load('java.awt.Insets');
  Point = $J.load('java.awt.Point');
});
