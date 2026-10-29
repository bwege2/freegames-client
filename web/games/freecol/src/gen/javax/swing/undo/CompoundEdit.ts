// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/undo/CompoundEdit.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2015, Oracle and/or its affiliates. All rights reserved.
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
import { $J, Vector } from '../../../../jre/index.ts';
import { AbstractUndoableEdit } from './AbstractUndoableEdit.ts';

/**
 * A concrete subclass of AbstractUndoableEdit, used to assemble little
 * UndoableEdits into great big ones.
 *
 * @author Ray Ryan
 */
export class CompoundEdit extends AbstractUndoableEdit {
  /**
   * True if this edit has never received <code>end</code>.
   */
  inProgress: boolean = false;
  /**
   * The collection of <code>UndoableEdit</code>s
   * undone/redone en masse by this <code>CompoundEdit</code>.
   */
  edits: Vector<UndoableEdit> = null;
  /**
   * Constructs a {@code CompoundEdit}.
   */
  _CompoundEdit(): this {
    this._AbstractUndoableEdit();
    this.inProgress = true;
    this.edits = new Vector();
    return this;
  }
  /**
   * Returns the last <code>UndoableEdit</code> in
   * <code>edits</code>, or <code>null</code>
   * if <code>edits</code> is empty.
   *
   * @return the last {@code UndoableEdit} in {@code edits},
   *         or {@code null} if {@code edits} is empty.
   */
  lastEdit(): UndoableEdit {
    let count = this.edits.size();
    if (count > 0) {
      return this.edits.elementAt((count - 1) | 0);
    } else {
      return null;
    }
  }
  /**
   * If this edit is <code>inProgress</code>,
   * accepts <code>anEdit</code> and returns true.
   *
   * <p>The last edit added to this <code>CompoundEdit</code>
   * is given a chance to <code>addEdit(anEdit)</code>.
   * If it refuses (returns false), <code>anEdit</code> is
   * given a chance to <code>replaceEdit</code> the last edit.
   * If <code>anEdit</code> returns false here,
   * it is added to <code>edits</code>.
   *
   * @param anEdit the edit to be added
   * @return true if the edit is <code>inProgress</code>;
   *  otherwise returns false
   */
  addEdit(anEdit: UndoableEdit): boolean {
    if (!this.inProgress) {
      return false;
    } else {
      let last = this.lastEdit();
      if (last == null) {
        this.edits.addElement(anEdit);
      } else if (!last.addEdit(anEdit)) {
        if (anEdit.replaceEdit(last)) {
          this.edits.removeElementAt((this.edits.size() - 1) | 0);
        }
        this.edits.addElement(anEdit);
      }
      return true;
    }
  }
  /**
   * Sets <code>inProgress</code> to false.
   *
   * @see #canUndo
   * @see #canRedo
   */
  end(): void {
    this.inProgress = false;
  }
}

$J.define(CompoundEdit, 'javax.swing.undo.CompoundEdit', { kind: 'class', sup: 'javax.swing.undo.AbstractUndoableEdit', ctors: { '': '_CompoundEdit' } });
