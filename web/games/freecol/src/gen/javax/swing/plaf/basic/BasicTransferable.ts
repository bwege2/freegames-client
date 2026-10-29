// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicTransferable.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2000, 2002, Oracle and/or its affiliates. All rights reserved.
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
import { $J, ByteArrayInputStream, ClassNotFoundException, DataFlavor, DataFlavorUtil, InputStream, JObject, JString, Reader, StringReader, UnsupportedFlavorException } from '../../../../../jre/index.ts';

/**
 * A transferable implementation for the default data transfer of some Swing
 * components.
 *
 * @author  Timothy Prinzing
 */
export class BasicTransferable extends JObject {
  plainData: string = null;
  htmlData: string = null;
  static htmlFlavors: DataFlavor[] = null;
  static stringFlavors: DataFlavor[] = null;
  static plainFlavors: DataFlavor[] = null;
  _BasicTransferable(plainData: string, htmlData: string): this {
    this.plainData = plainData;
    this.htmlData = htmlData;
    return this;
  }
  /**
   * Returns an array of DataFlavor objects indicating the flavors the data
   * can be provided in.  The array should be ordered according to preference
   * for providing the data (from most richly descriptive to least descriptive).
   * @return an array of data flavors in which this data can be transferred
   */
  getTransferDataFlavors(): DataFlavor[] {
    let richerFlavors = this.getRicherFlavors();
    let nRicher = (richerFlavors != null) ? richerFlavors.length : 0;
    let nHTML = (this.isHTMLSupported()) ? BasicTransferable.htmlFlavors.length : 0;
    let nPlain = (this.isPlainSupported()) ? BasicTransferable.plainFlavors.length : 0;
    let nString = (this.isPlainSupported()) ? BasicTransferable.stringFlavors.length : 0;
    let nFlavors = (nRicher + nHTML + nPlain + nString) | 0;
    let flavors = $J.newArray(nFlavors, null);
    let nDone = 0;
    if (nRicher > 0) {
      $J.system_arraycopy(richerFlavors, 0, flavors, nDone, nRicher);
      nDone = (nDone + nRicher) | 0;
    }
    if (nHTML > 0) {
      $J.system_arraycopy(BasicTransferable.htmlFlavors, 0, flavors, nDone, nHTML);
      nDone = (nDone + nHTML) | 0;
    }
    if (nPlain > 0) {
      $J.system_arraycopy(BasicTransferable.plainFlavors, 0, flavors, nDone, nPlain);
      nDone = (nDone + nPlain) | 0;
    }
    if (nString > 0) {
      $J.system_arraycopy(BasicTransferable.stringFlavors, 0, flavors, nDone, nString);
      nDone = (nDone + nString) | 0;
    }
    return flavors;
  }
  /**
   * Returns whether or not the specified data flavor is supported for
   * this object.
   * @param flavor the requested flavor for the data
   * @return boolean indicating whether or not the data flavor is supported
   */
  isDataFlavorSupported(flavor: DataFlavor): boolean {
    let flavors = this.getTransferDataFlavors();
    for (let i = 0; i < flavors.length; i++) {
      if (flavors[i].equals(flavor)) {
        return true;
      }
    }
    return false;
  }
  /**
   * Returns an object which represents the data to be transferred.  The class
   * of the object returned is defined by the representation class of the flavor.
   *
   * @param flavor the requested flavor for the data
   * @see DataFlavor#getRepresentationClass
   * @throws IOException                if the data is no longer available
   *              in the requested flavor.
   * @throws UnsupportedFlavorException if the requested data flavor is
   *              not supported.
   */
  getTransferData(flavor: DataFlavor): any {
    let richerFlavors = this.getRicherFlavors();
    if (this.isRicherFlavor(flavor)) {
      return this.getRicherData(flavor);
    } else if (this.isHTMLFlavor(flavor)) {
      let data = this.getHTMLData();
      data = (data == null) ? '' : data;
      if ($J.equals($J.cls(JString), flavor.getRepresentationClass())) {
        return data;
      } else if ($J.equals($J.cls(Reader), flavor.getRepresentationClass())) {
        return new StringReader(data);
      } else if ($J.equals($J.cls(InputStream), flavor.getRepresentationClass())) {
        return this.createInputStream(flavor, data);
      }
    } else if (this.isPlainFlavor(flavor)) {
      let data = this.getPlainData();
      data = (data == null) ? '' : data;
      if ($J.equals($J.cls(JString), flavor.getRepresentationClass())) {
        return data;
      } else if ($J.equals($J.cls(Reader), flavor.getRepresentationClass())) {
        return new StringReader(data);
      } else if ($J.equals($J.cls(InputStream), flavor.getRepresentationClass())) {
        return this.createInputStream(flavor, data);
      }
    } else if (this.isStringFlavor(flavor)) {
      let data = this.getPlainData();
      data = (data == null) ? '' : data;
      return data;
    }
    throw new UnsupportedFlavorException(flavor);
  }
  createInputStream(flavor: DataFlavor, data: string): InputStream {
    let cs = DataFlavorUtil.getTextCharset(flavor);
    if (cs == null) {
      throw new UnsupportedFlavorException(flavor);
    }
    return new ByteArrayInputStream(JString.getBytes(data, cs));
  }
  isRicherFlavor(flavor: DataFlavor): boolean {
    let richerFlavors = this.getRicherFlavors();
    let nFlavors = (richerFlavors != null) ? richerFlavors.length : 0;
    for (let i = 0; i < nFlavors; i++) {
      if (richerFlavors[i].equals(flavor)) {
        return true;
      }
    }
    return false;
  }
  /**
   * Some subclasses will have flavors that are more descriptive than HTML
   * or plain text.  If this method returns a non-null value, it will be
   * placed at the start of the array of supported flavors.
   */
  getRicherFlavors(): DataFlavor[] {
    return null;
  }
  getRicherData(flavor: DataFlavor): any {
    return null;
  }
  /**
   * Returns whether or not the specified data flavor is an HTML flavor that
   * is supported.
   * @param flavor the requested flavor for the data
   * @return boolean indicating whether or not the data flavor is supported
   */
  isHTMLFlavor(flavor: DataFlavor): boolean {
    let flavors = BasicTransferable.htmlFlavors;
    for (let i = 0; i < flavors.length; i++) {
      if (flavors[i].equals(flavor)) {
        return true;
      }
    }
    return false;
  }
  /**
   * Should the HTML flavors be offered?  If so, the method
   * getHTMLData should be implemented to provide something reasonable.
   */
  isHTMLSupported(): boolean {
    return this.htmlData != null;
  }
  /**
   * Fetch the data in a text/html format
   */
  getHTMLData(): string {
    return this.htmlData;
  }
  /**
   * Returns whether or not the specified data flavor is an plain flavor that
   * is supported.
   * @param flavor the requested flavor for the data
   * @return boolean indicating whether or not the data flavor is supported
   */
  isPlainFlavor(flavor: DataFlavor): boolean {
    let flavors = BasicTransferable.plainFlavors;
    for (let i = 0; i < flavors.length; i++) {
      if (flavors[i].equals(flavor)) {
        return true;
      }
    }
    return false;
  }
  /**
   * Should the plain text flavors be offered?  If so, the method
   * getPlainData should be implemented to provide something reasonable.
   */
  isPlainSupported(): boolean {
    return this.plainData != null;
  }
  /**
   * Fetch the data in a text/plain format.
   */
  getPlainData(): string {
    return this.plainData;
  }
  /**
   * Returns whether or not the specified data flavor is a String flavor that
   * is supported.
   * @param flavor the requested flavor for the data
   * @return boolean indicating whether or not the data flavor is supported
   */
  isStringFlavor(flavor: DataFlavor): boolean {
    let flavors = BasicTransferable.stringFlavors;
    for (let i = 0; i < flavors.length; i++) {
      if (flavors[i].equals(flavor)) {
        return true;
      }
    }
    return false;
  }
  static $clinit() {
    try {
      BasicTransferable.htmlFlavors = $J.newArray(3, null);
      BasicTransferable.htmlFlavors[0] = new DataFlavor('text/html;class=java.lang.String');
      BasicTransferable.htmlFlavors[1] = new DataFlavor('text/html;class=java.io.Reader');
      BasicTransferable.htmlFlavors[2] = new DataFlavor('text/html;charset=unicode;class=java.io.InputStream');
      BasicTransferable.plainFlavors = $J.newArray(3, null);
      BasicTransferable.plainFlavors[0] = new DataFlavor('text/plain;class=java.lang.String');
      BasicTransferable.plainFlavors[1] = new DataFlavor('text/plain;class=java.io.Reader');
      BasicTransferable.plainFlavors[2] = new DataFlavor('text/plain;charset=unicode;class=java.io.InputStream');
      BasicTransferable.stringFlavors = $J.newArray(2, null);
      BasicTransferable.stringFlavors[0] = new DataFlavor('application/x-java-jvm-local-objectref' + ';class=java.lang.String');
      BasicTransferable.stringFlavors[1] = DataFlavor.stringFlavor;
    } catch ($e0) {
      if ($J.isa($e0, ClassNotFoundException)) {
        let cle = $J.exc($e0);
        $J.err.println('error initializing javax.swing.plaf.basic.BasicTranserable');
      } else {
        throw $e0;
      }
    }
  }
}

$J.define(BasicTransferable, 'javax.swing.plaf.basic.BasicTransferable', { kind: 'class', ifaces: ['java.awt.datatransfer.Transferable', 'javax.swing.plaf.UIResource'], sup: 'java.lang.Object', ctors: { 'java.lang.String,java.lang.String': '_BasicTransferable' }, clinit: true, lazy: ['htmlFlavors', 'stringFlavors', 'plainFlavors'] });
