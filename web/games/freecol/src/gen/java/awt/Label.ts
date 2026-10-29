// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/Label.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
 * A {@code Label} object is a component for placing text in a
 * container. A label displays a single line of read-only text.
 * The text can be changed by the application, but a user cannot edit it
 * directly.
 * <p>
 * For example, the code&nbsp;.&nbsp;.&nbsp;.
 *
 * <hr><blockquote><pre>
 * setLayout(new FlowLayout(FlowLayout.CENTER, 10, 10));
 * add(new Label("Hi There!"));
 * add(new Label("Another Label"));
 * </pre></blockquote><hr>
 * <p>
 * produces the following labels:
 * <p>
 * <img src="doc-files/Label-1.gif" alt="Two labels: 'Hi There!' and
 * 'Another label'" style="margin: 7px 10px;">
 *
 * @author      Sami Shaio
 * @since       1.0
 */
export class Label extends Component {
  /**
   * Indicates that the label should be left justified.
   */
  static readonly LEFT: number = 0;
  /**
   * Indicates that the label should be centered.
   */
  static readonly CENTER: number = 1;
  /**
   * Indicates that the label should be right justified.
   */
  static readonly RIGHT: number = 2;
  /**
   * The text of this label.
   * This text can be modified by the program
   * but never by the user.
   *
   * @serial
   * @see #getText()
   * @see #setText(String)
   */
  text_: string = null;
  /**
   * The label's alignment.  The default alignment is set
   * to be left justified.
   *
   * @serial
   * @see #getAlignment()
   * @see #setAlignment(int)
   */
  alignment: number = 0;
  static readonly base: string = 'label';
  static nameCounter: number = 0;
  $init_Label() {
    this.alignment = Label.LEFT;
  }
}

$J.define(Label, 'java.awt.Label', { kind: 'class', ifaces: ['javax.accessibility.Accessible'], sup: 'java.awt.Component', ctors: { 'java.lang.String,int': '_Label$String$int', 'java.lang.String': '_Label$String', '': '_Label$' }, meths: { 'readObject(java.io.ObjectInputStream)': 'readObject$ObjectInputStream$Label' } });
