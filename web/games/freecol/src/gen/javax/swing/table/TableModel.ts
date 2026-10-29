// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/table/TableModel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
 * The <code>TableModel</code> interface specifies the methods the
 *  <code>JTable</code> will use to interrogate a tabular data model. <p>
 *
 *  The <code>JTable</code> can be set up to display any data
 *  model which implements the
 *  <code>TableModel</code> interface with a couple of lines of code:
 *  <pre>
 *      TableModel myData = new MyTableModel();
 *      JTable table = new JTable(myData);
 *  </pre><p>
 *
 * For further documentation, see <a href="https://docs.oracle.com/javase/tutorial/uiswing/components/table.html#data">Creating a Table Model</a>
 * in <em>The Java Tutorial</em>.
 *
 * @author Philip Milne
 * @see JTable
 */
export class TableModel {
}

$J.define(TableModel, 'javax.swing.table.TableModel', { kind: 'interface' });
