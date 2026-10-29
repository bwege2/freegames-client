// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/event/TreeSelectionEvent.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, EventObject } from '../../../../jre/index.ts';

/**
 * An event that characterizes a change in the current
 * selection.  The change is based on any number of paths.
 * TreeSelectionListeners will generally query the source of
 * the event for the new selected status of each potentially
 * changed row.
 * <p>
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the <code>java.beans</code> package.
 * Please see {@link java.beans.XMLEncoder}.
 *
 * @see TreeSelectionListener
 * @see javax.swing.tree.TreeSelectionModel
 *
 * @author Scott Violet
 */
export class TreeSelectionEvent extends EventObject {
  /**
   * Paths this event represents.
   */
  paths: TreePath[] = null;
  /**
   * For each path identifies if that path is in fact new.
   */
  areNew: boolean[] = null;
  /**
   * leadSelectionPath before the paths changed, may be null.
   */
  oldLeadSelectionPath: TreePath = null;
  /**
   * leadSelectionPath after the paths changed, may be null.
   */
  newLeadSelectionPath: TreePath = null;
  /**
   * Represents a change in the selection of a {@code TreeSelectionModel}.
   * {@code paths} identifies the paths that have been either added or
   * removed from the selection.
   *
   * @param source source of event
   * @param paths the paths that have changed in the selection
   * @param areNew a {@code boolean} array indicating whether the paths in
   *               {@code paths} are new to the selection
   * @param oldLeadSelectionPath the previous lead selection path
   * @param newLeadSelectionPath the new lead selection path
   */
  _TreeSelectionEvent$Object$TreePathArr$booleanArr$TreePath$TreePath(source: any, paths: TreePath[], areNew: boolean[], oldLeadSelectionPath: TreePath, newLeadSelectionPath: TreePath): this {
    this._EventObject(source);
    this.paths = paths;
    this.areNew = areNew;
    this.oldLeadSelectionPath = oldLeadSelectionPath;
    this.newLeadSelectionPath = newLeadSelectionPath;
    return this;
  }
  /**
   * Returns the paths that have been added or removed from the selection.
   *
   * @return copy of the array of {@code TreePath} obects for this event.
   */
  getPaths(): TreePath[] {
    let numPaths: number;
    let retPaths: TreePath[];
    numPaths = this.paths.length;
    retPaths = $J.newArray(numPaths, null);
    $J.system_arraycopy(this.paths, 0, retPaths, 0, numPaths);
    return retPaths;
  }
  /**
   * Returns the first path element.
   *
   * @return the first {@code TreePath} element represented by this event
   */
  getPath(): TreePath {
    return this.paths[0];
  }
  /**
   * Returns a copy of the receiver, but with the source being newSource.
   *
   * @param newSource source of event
   * @return an {@code Object} which is a copy of this event with the source
   *         being the {@code newSource} provided
   */
  cloneWithSource(newSource: any): any {
    return new TreeSelectionEvent()._TreeSelectionEvent$Object$TreePathArr$booleanArr$TreePath$TreePath(newSource, this.paths, this.areNew, this.oldLeadSelectionPath, this.newLeadSelectionPath);
  }
}

$J.define(TreeSelectionEvent, 'javax.swing.event.TreeSelectionEvent', { kind: 'class', sup: 'java.util.EventObject', ctors: { 'java.lang.Object,javax.swing.tree.TreePath,boolean,javax.swing.tree.TreePath,javax.swing.tree.TreePath': '_TreeSelectionEvent$Object$TreePath$boolean$TreePath$TreePath', 'java.lang.Object,javax.swing.tree.TreePath[],boolean[],javax.swing.tree.TreePath,javax.swing.tree.TreePath': '_TreeSelectionEvent$Object$TreePathArr$booleanArr$TreePath$TreePath' }, meths: { 'isAddedPath(int)': 'isAddedPath$int', 'isAddedPath(javax.swing.tree.TreePath)': 'isAddedPath$TreePath', 'isAddedPath()': 'isAddedPath$' } });
