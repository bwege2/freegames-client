// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/text/EditorKit.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2014, Oracle and/or its affiliates. All rights reserved.
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
import { $J, CloneNotSupportedException, JObject } from '../../../../jre/index.ts';

/**
 * Establishes the set of things needed by a text component
 * to be a reasonably functioning editor for some <em>type</em>
 * of text content.  The EditorKit acts as a factory for some
 * kind of policy.  For example, an implementation
 * of html and rtf can be provided that is replaceable
 * with other implementations.
 * <p>
 * A kit can safely store editing state as an instance
 * of the kit will be dedicated to a text component.
 * New kits will normally be created by cloning a
 * prototype kit.  The kit will have its
 * <code>setComponent</code> method called to establish
 * its relationship with a JTextComponent.
 *
 * @author  Timothy Prinzing
 */
export class EditorKit extends JObject {
  /**
   * Construct an EditorKit.
   */
  _EditorKit(): this {
    return this;
  }
  /**
   * Creates a copy of the editor kit.  This is implemented
   * to use <code>Object.clone()</code>.  If the kit cannot be cloned,
   * null is returned.
   *
   * @return the copy
   */
  clone(): any {
    let o: any;
    try {
      o = super.clone();
    } catch ($e0) {
      if ($J.isa($e0, CloneNotSupportedException)) {
        let cnse = $J.exc($e0);
        o = null;
      } else {
        throw $e0;
      }
    }
    return o;
  }
  /**
   * Called when the kit is being installed into the
   * a JEditorPane.
   *
   * @param c the JEditorPane
   */
  install$JEditorPane(c: JEditorPane): void {
  }
  /**
   * Called when the kit is being removed from the
   * JEditorPane.  This is used to unregister any
   * listeners that were attached.
   *
   * @param c the JEditorPane
   */
  deinstall$JEditorPane(c: JEditorPane): void {
  }
}

$J.define(EditorKit, 'javax.swing.text.EditorKit', { kind: 'class', ifaces: ['java.lang.Cloneable', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_EditorKit' }, meths: { 'write(java.io.Writer,javax.swing.text.Document,int,int)': 'write$Writer$Document$int$int', 'read(java.io.Reader,javax.swing.text.Document,int)': 'read$Reader$Document$int', 'write(java.io.OutputStream,javax.swing.text.Document,int,int)': 'write$OutputStream$Document$int$int', 'read(java.io.InputStream,javax.swing.text.Document,int)': 'read$InputStream$Document$int', 'createDefaultDocument()': 'createDefaultDocument$', 'getActions()': 'getActions$', 'getContentType()': 'getContentType$', 'deinstall(javax.swing.JEditorPane)': 'deinstall$JEditorPane', 'install(javax.swing.JEditorPane)': 'install$JEditorPane' } });
