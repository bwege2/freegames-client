// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/TextComponent.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
 * The {@code TextComponent} class is the superclass of
 * any component that allows the editing of some text.
 * <p>
 * A text component embodies a string of text.  The
 * {@code TextComponent} class defines a set of methods
 * that determine whether or not this text is editable. If the
 * component is editable, it defines another set of methods
 * that supports a text insertion caret.
 * <p>
 * In addition, the class defines methods that are used
 * to maintain a current <em>selection</em> from the text.
 * The text selection, a substring of the component's text,
 * is the target of editing operations. It is also referred
 * to as the <em>selected text</em>.
 *
 * @author      Sami Shaio
 * @author      Arthur van Hoff
 * @since       1.0
 * @sealedGraph
 */
export class TextComponent extends Component {
  /**
   * The value of the text.
   * A {@code null} value is the same as "".
   *
   * @serial
   * @see #setText(String)
   * @see #getText()
   */
  text_: string = null;
  /**
   * A boolean indicating whether or not this
   * {@code TextComponent} is editable.
   * It will be {@code true} if the text component
   * is editable and {@code false} if not.
   *
   * @serial
   * @see #isEditable()
   */
  editable: boolean = false;
  /**
   * The selection refers to the selected text, and the
   * {@code selectionStart} is the start position
   * of the selected text.
   *
   * @serial
   * @see #getSelectionStart()
   * @see #setSelectionStart(int)
   */
  selectionStart: number = 0;
  /**
   * The selection refers to the selected text, and the
   * {@code selectionEnd}
   * is the end position of the selected text.
   *
   * @serial
   * @see #getSelectionEnd()
   * @see #setSelectionEnd(int)
   */
  selectionEnd: number = 0;
  /**
   * A flag used to tell whether the background has been set by
   * developer code (as opposed to AWT code).  Used to determine
   * the background color of non-editable TextComponents.
   */
  backgroundSetByClientCode: boolean = false;
  /**
   * A list of listeners that will receive events from this object.
   */
  textListener: TextListener = null;
  /**
   * The textComponent SerializedDataVersion.
   *
   * @serial
   */
  textComponentSerializedDataVersion: number = 0;
  /**
   * Whether support of input methods should be checked or not.
   */
  checkForEnableIM: boolean = false;
}

$J.define(TextComponent, 'java.awt.TextComponent', { kind: 'class', ifaces: ['javax.accessibility.Accessible'], sup: 'java.awt.Component', ctors: { 'java.lang.String': '_TextComponent' }, meths: { 'readObject(java.io.ObjectInputStream)': 'readObject$ObjectInputStream$TextComponent', 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$TextComponent' } });
