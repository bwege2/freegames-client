// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/undo/AbstractUndoableEdit.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../jre/index.ts';

/**
 * An abstract implementation of <code>UndoableEdit</code>,
 * implementing simple responses to all boolean methods in
 * that interface.
 *
 * @author Ray Ryan
 */
export class AbstractUndoableEdit extends JObject {
  /**
   * String returned by <code>getUndoPresentationName</code>;
   * as of Java 2 platform v1.3.1 this field is no longer used. This value
   * is now localized and comes from the defaults table with key
   * <code>AbstractUndoableEdit.undoText</code>.
   *
   * @see javax.swing.UIDefaults
   */
  static readonly UndoName: string = 'Undo';
  /**
   * String returned by <code>getRedoPresentationName</code>;
   * as of Java 2 platform v1.3.1 this field is no longer used. This value
   * is now localized and comes from the defaults table with key
   * <code>AbstractUndoableEdit.redoText</code>.
   *
   * @see javax.swing.UIDefaults
   */
  static readonly RedoName: string = 'Redo';
  /**
   * Defaults to true; becomes false if this edit is undone, true
   * again if it is redone.
   */
  hasBeenDone: boolean = false;
  /**
   * True if this edit has not received <code>die</code>; defaults
   * to <code>true</code>.
   */
  alive: boolean = false;
  /**
   * Creates an <code>AbstractUndoableEdit</code> which defaults
   * <code>hasBeenDone</code> and <code>alive</code> to <code>true</code>.
   */
  _AbstractUndoableEdit(): this {
    this.hasBeenDone = true;
    this.alive = true;
    return this;
  }
  /**
   * This default implementation returns false.
   *
   * @param anEdit the edit to be added
   * @return false
   *
   * @see UndoableEdit#addEdit
   */
  addEdit(anEdit: UndoableEdit): boolean {
    return false;
  }
  /**
   * This default implementation returns false.
   *
   * @param anEdit the edit to replace
   * @return false
   *
   * @see UndoableEdit#replaceEdit
   */
  replaceEdit(anEdit: UndoableEdit): boolean {
    return false;
  }
  /**
   * Returns a string that displays and identifies this
   * object's properties.
   *
   * @return a String representation of this object
   */
  toString(): string {
    return super.toString() + ' hasBeenDone: ' + this.hasBeenDone + ' alive: ' + this.alive;
  }
}

$J.define(AbstractUndoableEdit, 'javax.swing.undo.AbstractUndoableEdit', { kind: 'class', ifaces: ['javax.swing.undo.UndoableEdit', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_AbstractUndoableEdit' } });
