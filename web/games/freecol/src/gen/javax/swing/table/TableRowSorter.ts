// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/table/TableRowSorter.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2005, 2006, Oracle and/or its affiliates. All rights reserved.
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
import { $J, Collator, Comparable, JObject, JString } from '../../../../jre/index.ts';
import { DefaultRowSorter } from '../DefaultRowSorter.ts';
import { DefaultRowSorter$ModelWrapper } from '../DefaultRowSorter.ts';

/**
 * An implementation of <code>RowSorter</code> that provides sorting
 * and filtering using a <code>TableModel</code>.
 * The following example shows adding sorting to a <code>JTable</code>:
 * <pre>
 *   TableModel myModel = createMyTableModel();
 *   JTable table = new JTable(myModel);
 *   table.setRowSorter(new TableRowSorter(myModel));
 * </pre>
 * This will do all the wiring such that when the user does the appropriate
 * gesture, such as clicking on the column header, the table will
 * visually sort.
 * <p>
 * <code>JTable</code>'s row-based methods and <code>JTable</code>'s
 * selection model refer to the view and not the underlying
 * model. Therefore, it is necessary to convert between the two.  For
 * example, to get the selection in terms of <code>myModel</code>
 * you need to convert the indices:
 * <pre>
 *   int[] selection = table.getSelectedRows();
 *   for (int i = 0; i &lt; selection.length; i++) {
 *     selection[i] = table.convertRowIndexToModel(selection[i]);
 *   }
 * </pre>
 * Similarly to select a row in <code>JTable</code> based on
 * a coordinate from the underlying model do the inverse:
 * <pre>
 *   table.setRowSelectionInterval(table.convertRowIndexToView(row),
 *                                 table.convertRowIndexToView(row));
 * </pre>
 * <p>
 * The previous example assumes you have not enabled filtering.  If you
 * have enabled filtering <code>convertRowIndexToView</code> will return
 * -1 for locations that are not visible in the view.
 * <p>
 * <code>TableRowSorter</code> uses <code>Comparator</code>s for doing
 * comparisons. The following defines how a <code>Comparator</code> is
 * chosen for a column:
 * <ol>
 * <li>If a <code>Comparator</code> has been specified for the column by the
 *     <code>setComparator</code> method, use it.
 * <li>If the column class as returned by <code>getColumnClass</code> is
 *     <code>String</code>, use the <code>Comparator</code> returned by
 *     <code>Collator.getInstance()</code>.
 * <li>If the column class implements <code>Comparable</code>, use a
 *     <code>Comparator</code> that invokes the <code>compareTo</code>
 *     method.
 * <li>If a <code>TableStringConverter</code> has been specified, use it
 *     to convert the values to <code>String</code>s and then use the
 *     <code>Comparator</code> returned by <code>Collator.getInstance()</code>.
 * <li>Otherwise use the <code>Comparator</code> returned by
 *     <code>Collator.getInstance()</code> on the results from
 *     calling <code>toString</code> on the objects.
 * </ol>
 * <p>
 * In addition to sorting <code>TableRowSorter</code> provides the ability
 * to filter.  A filter is specified using the <code>setFilter</code>
 * method. The following example will only show rows containing the string
 * "foo":
 * <pre>
 *   TableModel myModel = createMyTableModel();
 *   TableRowSorter sorter = new TableRowSorter(myModel);
 *   sorter.setRowFilter(RowFilter.regexFilter(".*foo.*"));
 *   JTable table = new JTable(myModel);
 *   table.setRowSorter(sorter);
 * </pre>
 * <p>
 * If the underlying model structure changes (the
 * <code>modelStructureChanged</code> method is invoked) the following
 * are reset to their default values: <code>Comparator</code>s by
 * column, current sort order, and whether each column is sortable. The default
 * sort order is natural (the same as the model), and columns are
 * sortable by default.
 * <p>
 * <code>TableRowSorter</code> has one formal type parameter: the type
 * of the model.  Passing in a type that corresponds exactly to your
 * model allows you to filter based on your model without casting.
 * Refer to the documentation of <code>RowFilter</code> for an example
 * of this.
 * <p>
 * <b>WARNING:</b> <code>DefaultTableModel</code> returns a column
 * class of <code>Object</code>.  As such all comparisons will
 * be done using <code>toString</code>.  This may be unnecessarily
 * expensive.  If the column only contains one type of value, such as
 * an <code>Integer</code>, you should override <code>getColumnClass</code> and
 * return the appropriate <code>Class</code>.  This will dramatically
 * increase the performance of this class.
 *
 * @param <M> the type of the model, which must be an implementation of
 *            <code>TableModel</code>
 * @see javax.swing.JTable
 * @see javax.swing.RowFilter
 * @see javax.swing.table.DefaultTableModel
 * @see java.text.Collator
 * @see java.util.Comparator
 * @since 1.6
 */
export class TableRowSorter<M> extends DefaultRowSorter {
  /**
   * Comparator that uses compareTo on the contents.
   */
  static COMPARABLE_COMPARATOR: Comparator<any> = null;
  /**
   * Underlying model.
   */
  tableModel: M = null;
  /**
   * For toString conversions.
   */
  stringConverter: TableStringConverter = null;
  /**
   * Creates a <code>TableRowSorter</code> with an empty model.
   */
  _TableRowSorter$(): this {
    this._TableRowSorter$TableModel(null);
    return this;
  }
  /**
   * Creates a <code>TableRowSorter</code> using <code>model</code>
   * as the underlying <code>TableModel</code>.
   *
   * @param model the underlying <code>TableModel</code> to use,
   *        <code>null</code> is treated as an empty model
   */
  _TableRowSorter$TableModel(model: M): this {
    this._DefaultRowSorter();
    this.setModel(model);
    return this;
  }
  /**
   * Sets the <code>TableModel</code> to use as the underlying model
   * for this <code>TableRowSorter</code>.  A value of <code>null</code>
   * can be used to set an empty model.
   *
   * @param model the underlying model to use, or <code>null</code>
   */
  setModel(model: M): void {
    this.tableModel = model;
    this.setModelWrapper(new TableRowSorter$TableRowSorterModelWrapper().$o(this)._TableRowSorter$TableRowSorterModelWrapper());
  }
  /**
   * Returns the object responsible for converting values from the
   * model to strings.
   *
   * @return object responsible for converting values to strings.
   */
  getStringConverter(): TableStringConverter {
    return this.stringConverter;
  }
  /**
   * Returns the <code>Comparator</code> for the specified
   * column.  If a <code>Comparator</code> has not been specified using
   * the <code>setComparator</code> method a <code>Comparator</code>
   * will be returned based on the column class
   * (<code>TableModel.getColumnClass</code>) of the specified column.
   * If the column class is <code>String</code>,
   * <code>Collator.getInstance</code> is returned.  If the
   * column class implements <code>Comparable</code> a private
   * <code>Comparator</code> is returned that invokes the
   * <code>compareTo</code> method.  Otherwise
   * <code>Collator.getInstance</code> is returned.
   *
   * @throws IndexOutOfBoundsException {@inheritDoc}
   */
  getComparator(column: number): Comparator<any> {
    let comparator = super.getComparator(column);
    if (comparator != null) {
      return comparator;
    }
    let columnClass = this.getModel().getColumnClass(column);
    if (columnClass === $J.cls(JString)) {
      return $J.fn(Collator.getInstance(), 'compare');
    }
    if ($J.cls(Comparable).isAssignableFrom(columnClass)) {
      return TableRowSorter.COMPARABLE_COMPARATOR;
    }
    return $J.fn(Collator.getInstance(), 'compare');
  }
  /**
   * {@inheritDoc}
   *
   * @throws IndexOutOfBoundsException {@inheritDoc}
   */
  useToString(column: number): boolean {
    let comparator = super.getComparator(column);
    if (comparator != null) {
      return false;
    }
    let columnClass = this.getModel().getColumnClass(column);
    if (columnClass === $J.cls(JString)) {
      return false;
    }
    if ($J.cls(Comparable).isAssignableFrom(columnClass)) {
      return false;
    }
    return true;
  }
  static $clinit() {
    TableRowSorter.COMPARABLE_COMPARATOR = $J.fn(new TableRowSorter$ComparableComparator()._TableRowSorter$ComparableComparator(), 'compare');
  }
}

/**
 * Implementation of DefaultRowSorter.ModelWrapper that delegates to a
 * TableModel.
 */
export class TableRowSorter$TableRowSorterModelWrapper extends DefaultRowSorter$ModelWrapper {
  _TableRowSorter$TableRowSorterModelWrapper(): this {
    this._DefaultRowSorter$ModelWrapper();
    return this;
  }
  getModel(): M {
    return this.$outer.tableModel;
  }
  getColumnCount(): number {
    return (this.$outer.tableModel == null) ? 0 : this.$outer.tableModel.getColumnCount();
  }
  getRowCount(): number {
    return (this.$outer.tableModel == null) ? 0 : this.$outer.tableModel.getRowCount();
  }
  getValueAt(row: number, column: number): any {
    return this.$outer.tableModel.getValueAt(row, column);
  }
  getStringValueAt(row: number, column: number): string {
    let converter = this.$outer.getStringConverter();
    if (converter != null) {
      let value = converter.toString$TableModel$int$int(this.$outer.tableModel, row, column);
      if (value != null) {
        return value;
      }
      return '';
    }
    let o = this.getValueAt(row, column);
    if (o == null) {
      return '';
    }
    let string$ = $J.str(o);
    if (string$ == null) {
      return '';
    }
    return string$;
  }
}

export class TableRowSorter$ComparableComparator extends JObject {
  _TableRowSorter$ComparableComparator(): this {
    return this;
  }
  compare(o1: any, o2: any): number {
    return $J.compareTo((o1), o2);
  }
}

$J.define(TableRowSorter, 'javax.swing.table.TableRowSorter', { kind: 'class', sup: 'javax.swing.DefaultRowSorter', ctors: { 'javax.swing.table.TableModel': '_TableRowSorter$TableModel', '': '_TableRowSorter$' }, clinit: true, lazy: ['COMPARABLE_COMPARATOR'] });
$J.define(TableRowSorter$TableRowSorterModelWrapper, 'javax.swing.table.TableRowSorter$TableRowSorterModelWrapper', { kind: 'class', sup: 'javax.swing.DefaultRowSorter$ModelWrapper', ctors: { '': '_TableRowSorter$TableRowSorterModelWrapper' }, inner: true });
$J.define(TableRowSorter$ComparableComparator, 'javax.swing.table.TableRowSorter$ComparableComparator', { kind: 'class', ifaces: ['java.util.Comparator'], sup: 'java.lang.Object', ctors: { '': '_TableRowSorter$ComparableComparator' } });
