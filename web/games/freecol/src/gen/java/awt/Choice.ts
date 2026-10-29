// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/Choice.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1995, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J } from '../../../jre/index.ts';
import { Component } from './Component.ts';

/**
 * The {@code Choice} class presents a pop-up menu of choices.
 * The current choice is displayed as the title of the menu.
 * <p>
 * The following code example produces a pop-up menu:
 *
 * <hr><blockquote><pre>
 * Choice ColorChooser = new Choice();
 * ColorChooser.add("Green");
 * ColorChooser.add("Red");
 * ColorChooser.add("Blue");
 * </pre></blockquote><hr>
 * <p>
 * After this choice menu has been added to a panel,
 * it appears as follows in its normal state:
 * <p>
 * <img src="doc-files/Choice-1.gif" alt="The following text describes the
 * graphic" style="margin: 7px 10px;">
 * <p>
 * In the picture, {@code "Green"} is the current choice.
 * Pushing the mouse button down on the object causes a menu to
 * appear with the current choice highlighted.
 * <p>
 * Some native platforms do not support arbitrary resizing of
 * {@code Choice} components and the behavior of
 * {@code setSize()/getSize()} is bound by
 * such limitations.
 * Native GUI {@code Choice} components' size are often bound by such
 * attributes as font size and length of items contained within
 * the {@code Choice}.
 *
 * @author      Sami Shaio
 * @author      Arthur van Hoff
 * @since       1.0
 */
export class Choice extends Component {
  /**
   * The items for the {@code Choice}.
   * This can be a {@code null} value.
   * @serial
   * @see #add(String)
   * @see #addItem(String)
   * @see #getItem(int)
   * @see #getItemCount()
   * @see #insert(String, int)
   * @see #remove(String)
   */
  pItems: Vector<string> = null;
  /**
   * The index of the current choice for this {@code Choice}
   * or -1 if nothing is selected.
   * @serial
   * @see #getSelectedItem()
   * @see #select(int)
   */
  selectedIndex: number = 0;
  itemListener: ItemListener = null;
  static readonly base: string = 'choice';
  static nameCounter: number = 0;
  /**
   * Serialized data version.
   * @serial
   */
  choiceSerializedDataVersion: number = 0;
}

$J.define(Choice, 'java.awt.Choice', { kind: 'class', ifaces: ['java.awt.ItemSelectable', 'javax.accessibility.Accessible'], sup: 'java.awt.Component', ctors: { '': '_Choice' }, meths: { 'readObject(java.io.ObjectInputStream)': 'readObject$ObjectInputStream$Choice', 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$Choice', 'select(java.lang.String)': 'select$String', 'select(int)': 'select$int', 'remove(int)': 'remove$int', 'remove(java.lang.String)': 'remove$String', 'add(java.lang.String)': 'add$String' } });
