// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/RowFilter.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2005, 2014, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject } from '../../../jre/index.ts';

/**
 * <code>RowFilter</code> is used to filter out entries from the
 * model so that they are not shown in the view.  For example, a
 * <code>RowFilter</code> associated with a <code>JTable</code> might
 * only allow rows that contain a column with a specific string. The
 * meaning of <em>entry</em> depends on the component type.
 * For example, when a filter is
 * associated with a <code>JTable</code>, an entry corresponds to a
 * row; when associated with a <code>JTree</code>, an entry corresponds
 * to a node.
 * <p>
 * Subclasses must override the <code>include</code> method to
 * indicate whether the entry should be shown in the
 * view.  The <code>Entry</code> argument can be used to obtain the values in
 * each of the columns in that entry.  The following example shows an
 * <code>include</code> method that allows only entries containing one or
 * more values starting with the string "a":
 * <pre>
 * RowFilter&lt;Object,Object&gt; startsWithAFilter = new RowFilter&lt;Object,Object&gt;() {
 *   public boolean include(Entry&lt;? extends Object, ? extends Object&gt; entry) {
 *     for (int i = entry.getValueCount() - 1; i &gt;= 0; i--) {
 *       if (entry.getStringValue(i).startsWith("a")) {
 *         // The value starts with "a", include it
 *         return true;
 *       }
 *     }
 *     // None of the columns start with "a"; return false so that this
 *     // entry is not shown
 *     return false;
 *   }
 * };
 * </pre>
 * <code>RowFilter</code> has two formal type parameters that allow
 * you to create a <code>RowFilter</code> for a specific model. For
 * example, the following assumes a specific model that is wrapping
 * objects of type <code>Person</code>.  Only <code>Person</code>s
 * with an age over 20 will be shown:
 * <pre>
 * RowFilter&lt;PersonModel,Integer&gt; ageFilter = new RowFilter&lt;PersonModel,Integer&gt;() {
 *   public boolean include(Entry&lt;? extends PersonModel, ? extends Integer&gt; entry) {
 *     PersonModel personModel = entry.getModel();
 *     Person person = personModel.getPerson(entry.getIdentifier());
 *     if (person.getAge() &gt; 20) {
 *       // Returning true indicates this row should be shown.
 *       return true;
 *     }
 *     // Age is &lt;= 20, don't show it.
 *     return false;
 *   }
 * };
 * PersonModel model = createPersonModel();
 * TableRowSorter&lt;PersonModel&gt; sorter = new TableRowSorter&lt;PersonModel&gt;(model);
 * sorter.setRowFilter(ageFilter);
 * </pre>
 *
 * @param <M> the type of the model; for example <code>PersonModel</code>
 * @param <I> the type of the identifier; when using
 *            <code>TableRowSorter</code> this will be <code>Integer</code>
 * @see javax.swing.table.TableRowSorter
 * @since 1.6
 */
export class RowFilter<M, I> extends JObject {
}

/**
 * An <code>Entry</code> object is passed to instances of
 * <code>RowFilter</code>, allowing the filter to get the value of the
 * entry's data, and thus to determine whether the entry should be shown.
 * An <code>Entry</code> object contains information about the model
 * as well as methods for getting the underlying values from the model.
 *
 * @param <M> the type of the model; for example <code>PersonModel</code>
 * @param <I> the type of the identifier; when using
 *            <code>TableRowSorter</code> this will be <code>Integer</code>
 * @see javax.swing.RowFilter
 * @see javax.swing.DefaultRowSorter#setRowFilter(javax.swing.RowFilter)
 * @since 1.6
 */
export class RowFilter$Entry<M, I> extends JObject {
  /**
   * Creates an <code>Entry</code>.
   */
  _RowFilter$Entry(): this {
    return this;
  }
}

$J.define(RowFilter, 'javax.swing.RowFilter', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_RowFilter' }, meths: { 'include(javax.swing.RowFilter$Entry)': 'include$Entry' } });
$J.define(RowFilter$Entry, 'javax.swing.RowFilter$Entry', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_RowFilter$Entry' } });
