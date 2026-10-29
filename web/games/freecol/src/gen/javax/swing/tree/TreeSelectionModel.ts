// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/tree/TreeSelectionModel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2013, Oracle and/or its affiliates. All rights reserved.
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
import { $J } from '../../../../jre/index.ts';

/**
 * This interface represents the current state of the selection for
 * the tree component.
 * For information and examples of using tree selection models,
 * see <a href="https://docs.oracle.com/javase/tutorial/uiswing/components/tree.html">How to Use Trees</a>
 * in <em>The Java Tutorial.</em>
 *
 * <p>
 * The state of the tree selection is characterized by
 * a set of TreePaths, and optionally a set of integers. The mapping
 * from TreePath to integer is done by way of an instance of RowMapper.
 * It is not necessary for a TreeSelectionModel to have a RowMapper to
 * correctly operate, but without a RowMapper <code>getSelectionRows</code>
 * will return null.
 *
 * <p>
 *
 * A TreeSelectionModel can be configured to allow only one
 * path (<code>SINGLE_TREE_SELECTION</code>) a number of
 * contiguous paths (<code>CONTIGUOUS_TREE_SELECTION</code>) or a number of
 * discontiguous paths (<code>DISCONTIGUOUS_TREE_SELECTION</code>).
 * A <code>RowMapper</code> is used to determine if TreePaths are
 * contiguous.
 * In the absence of a RowMapper <code>CONTIGUOUS_TREE_SELECTION</code> and
 * <code>DISCONTIGUOUS_TREE_SELECTION</code> behave the same, that is they
 * allow any number of paths to be contained in the TreeSelectionModel.
 *
 * <p>
 *
 * For a selection model of <code>CONTIGUOUS_TREE_SELECTION</code> any
 * time the paths are changed (<code>setSelectionPath</code>,
 * <code>addSelectionPath</code> ...) the TreePaths are again checked to
 * make they are contiguous. A check of the TreePaths can also be forced
 * by invoking <code>resetRowSelection</code>. How a set of discontiguous
 * TreePaths is mapped to a contiguous set is left to implementors of
 * this interface to enforce a particular policy.
 *
 * <p>
 *
 * Implementations should combine duplicate TreePaths that are
 * added to the selection. For example, the following code
 * <pre>
 *   TreePath[] paths = new TreePath[] { treePath, treePath };
 *   treeSelectionModel.setSelectionPaths(paths);
 * </pre>
 * should result in only one path being selected:
 * <code>treePath</code>, and
 * not two copies of <code>treePath</code>.
 *
 * <p>
 *
 * The lead TreePath is the last path that was added (or set). The lead
 * row is then the row that corresponds to the TreePath as determined
 * from the RowMapper.
 *
 * @author Scott Violet
 */
export class TreeSelectionModel {
  /**
   * Selection can only contain one path at a time.
   */
  static readonly SINGLE_TREE_SELECTION: number = 1;
  /**
   * Selection can only be contiguous. This will only be enforced if
   * a RowMapper instance is provided. That is, if no RowMapper is set
   * this behaves the same as DISCONTIGUOUS_TREE_SELECTION.
   */
  static readonly CONTIGUOUS_TREE_SELECTION: number = 2;
  /**
   * Selection can contain any number of items that are not necessarily
   * contiguous.
   */
  static readonly DISCONTIGUOUS_TREE_SELECTION: number = 4;
}

$J.define(TreeSelectionModel, 'javax.swing.tree.TreeSelectionModel', { kind: 'interface' });
