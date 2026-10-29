// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/DefaultRowSorter.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2005, 2016, Oracle and/or its affiliates. All rights reserved.
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
import { $J, ArrayList, Arrays, Collator, Collections, IllegalArgumentException, IndexOutOfBoundsException, JObject } from '../../../jre/index.ts';
import { RowSorter } from './RowSorter.ts';
import { RowFilter$Entry } from './RowFilter.ts';

let RowSorter$SortKey, SortOrder;

/**
 * An implementation of <code>RowSorter</code> that provides sorting and
 * filtering around a grid-based data model.
 * Beyond creating and installing a <code>RowSorter</code>, you very rarely
 * need to interact with one directly.  Refer to
 * {@link javax.swing.table.TableRowSorter TableRowSorter} for a concrete
 * implementation of <code>RowSorter</code> for <code>JTable</code>.
 * <p>
 * Sorting is done based on the current <code>SortKey</code>s, in order.
 * If two objects are equal (the <code>Comparator</code> for the
 * column returns 0) the next <code>SortKey</code> is used.  If no
 * <code>SortKey</code>s remain or the order is <code>UNSORTED</code>, then
 * the order of the rows in the model is used.
 * <p>
 * Sorting of each column is done by way of a <code>Comparator</code>
 * that you can specify using the <code>setComparator</code> method.
 * If a <code>Comparator</code> has not been specified, the
 * <code>Comparator</code> returned by
 * <code>Collator.getInstance()</code> is used on the results of
 * calling <code>toString</code> on the underlying objects.  The
 * <code>Comparator</code> is never passed <code>null</code>.  A
 * <code>null</code> value is treated as occurring before a
 * non-<code>null</code> value, and two <code>null</code> values are
 * considered equal.
 * <p>
 * If you specify a <code>Comparator</code> that casts its argument to
 * a type other than that provided by the model, a
 * <code>ClassCastException</code> will be thrown when the data is sorted.
 * <p>
 * In addition to sorting, <code>DefaultRowSorter</code> provides the
 * ability to filter rows.  Filtering is done by way of a
 * <code>RowFilter</code> that is specified using the
 * <code>setRowFilter</code> method.  If no filter has been specified all
 * rows are included.
 * <p>
 * By default, rows are in unsorted order (the same as the model) and
 * every column is sortable. The default <code>Comparator</code>s are
 * documented in the subclasses (for example, {@link
 * javax.swing.table.TableRowSorter TableRowSorter}).
 * <p>
 * If the underlying model structure changes (the
 * <code>modelStructureChanged</code> method is invoked) the following
 * are reset to their default values: <code>Comparator</code>s by
 * column, current sort order, and whether each column is sortable. To
 * find the default <code>Comparator</code>s, see the concrete
 * implementation (for example, {@link
 * javax.swing.table.TableRowSorter TableRowSorter}).  The default
 * sort order is unsorted (the same as the model), and columns are
 * sortable by default.
 * <p>
 * <code>DefaultRowSorter</code> is an abstract class.  Concrete
 * subclasses must provide access to the underlying data by invoking
 * {@code setModelWrapper}. The {@code setModelWrapper} method
 * <b>must</b> be invoked soon after the constructor is
 * called, ideally from within the subclass's constructor.
 * Undefined behavior will result if you use a {@code
 * DefaultRowSorter} without specifying a {@code ModelWrapper}.
 * <p>
 * <code>DefaultRowSorter</code> has two formal type parameters.  The
 * first type parameter corresponds to the class of the model, for example
 * <code>DefaultTableModel</code>.  The second type parameter
 * corresponds to the class of the identifier passed to the
 * <code>RowFilter</code>.  Refer to <code>TableRowSorter</code> and
 * <code>RowFilter</code> for more details on the type parameters.
 *
 * @param <M> the type of the model
 * @param <I> the type of the identifier passed to the <code>RowFilter</code>
 * @see javax.swing.table.TableRowSorter
 * @see javax.swing.table.DefaultTableModel
 * @see java.text.Collator
 * @since 1.6
 */
export class DefaultRowSorter<M, I> extends RowSorter {
  /**
   * Whether or not we resort on TableModelEvent.UPDATEs.
   */
  sortsOnUpdates: boolean = false;
  /**
   * View (JTable) -> model.
   */
  viewToModel_: DefaultRowSorter$Row[] = null;
  /**
   * model -> view (JTable)
   */
  modelToView_: number[] = null;
  /**
   * Comparators specified by column.
   */
  comparators: Comparator<any>[] = null;
  /**
   * Whether or not the specified column is sortable, by column.
   */
  isSortable_: boolean[] = null;
  /**
   * Cached SortKeys for the current sort.
   */
  cachedSortKeys: RowSorter$SortKey[] = null;
  /**
   * Cached comparators for the current sort
   */
  sortComparators: Comparator<any>[] = null;
  /**
   * Developer supplied Filter.
   */
  filter_: RowFilter<any, any> = null;
  /**
   * Value passed to the filter.  The same instance is passed to the
   * filter for different rows.
   */
  filterEntry: DefaultRowSorter$FilterEntry = null;
  /**
   * The sort keys.
   */
  sortKeys: List<RowSorter$SortKey> = null;
  /**
   * Whether or not to use getStringValueAt.  This is indexed by column.
   */
  useToString_: boolean[] = null;
  /**
   * Indicates the contents are sorted.  This is used if
   * getSortsOnUpdates is false and an update event is received.
   */
  sorted: boolean = false;
  /**
   * Maximum number of sort keys.
   */
  maxSortKeys: number = 0;
  /**
   * Provides access to the data we're sorting/filtering.
   */
  modelWrapper: DefaultRowSorter$ModelWrapper<M, I> = null;
  /**
   * Size of the model. This is used to enforce error checking within
   * the table changed notification methods (such as rowsInserted).
   */
  modelRowCount: number = 0;
  static warning8160087: boolean = false;
  /**
   * Creates an empty <code>DefaultRowSorter</code>.
   */
  _DefaultRowSorter(): this {
    this._RowSorter();
    this.sortKeys = Collections.emptyList();
    this.maxSortKeys = 3;
    return this;
  }
  /**
   * Sets the model wrapper providing the data that is being sorted and
   * filtered.
   *
   * @param modelWrapper the model wrapper responsible for providing the
   *         data that gets sorted and filtered
   * @throws IllegalArgumentException if {@code modelWrapper} is
   *         {@code null}
   */
  setModelWrapper(modelWrapper: DefaultRowSorter$ModelWrapper<M, I>): void {
    if (modelWrapper == null) {
      throw new IllegalArgumentException('modelWrapper most be non-null');
    }
    let last = this.modelWrapper;
    this.modelWrapper = modelWrapper;
    if (last != null) {
      this.modelStructureChanged();
    } else {
      this.modelRowCount = this.getModelWrapper().getRowCount();
    }
  }
  /**
   * Returns the model wrapper providing the data that is being sorted and
   * filtered.
   *
   * @return the model wrapper responsible for providing the data that
   *         gets sorted and filtered
   */
  getModelWrapper(): DefaultRowSorter$ModelWrapper<M, I> {
    return this.modelWrapper;
  }
  /**
   * Returns the underlying model.
   *
   * @return the underlying model
   */
  getModel(): M {
    return this.getModelWrapper().getModel();
  }
  /**
   * Returns true if the specified column is sortable; otherwise, false.
   *
   * @param column the column to check sorting for, in terms of the
   *        underlying model
   * @return true if the column is sortable
   * @throws IndexOutOfBoundsException if column is outside
   *         the range of the underlying model
   */
  isSortable(column: number): boolean {
    this.checkColumn(column);
    return (this.isSortable_ == null) ? true : this.isSortable_[column];
  }
  /**
   * Sets the sort keys. This creates a copy of the supplied
   * {@code List}; subsequent changes to the supplied
   * {@code List} do not effect this {@code DefaultRowSorter}.
   * If the sort keys have changed this triggers a sort.
   *
   * @param sortKeys the new <code>SortKeys</code>; <code>null</code>
   *        is a shorthand for specifying an empty list,
   *        indicating that the view should be unsorted
   * @throws IllegalArgumentException if any of the values in
   *         <code>sortKeys</code> are null or have a column index outside
   *         the range of the model
   */
  setSortKeys(sortKeys: List<RowSorter$SortKey>): void {
    let old = this.sortKeys;
    if (sortKeys != null && sortKeys.size() > 0) {
      let max = this.getModelWrapper().getColumnCount();
      for (const $it0 = sortKeys.iterator(); $it0.hasNext(); ) {
        let key = $it0.next();
        if (key == null || key.getColumn() < 0 || key.getColumn() >= max) {
          throw new IllegalArgumentException('Invalid SortKey');
        }
      }
      this.sortKeys = Collections.unmodifiableList(new ArrayList(sortKeys));
    } else {
      this.sortKeys = Collections.emptyList();
    }
    if (!this.sortKeys.equals(old)) {
      this.fireSortOrderChanged();
      if (this.viewToModel_ == null) {
        this.sort();
      } else {
        this.sortExistingData();
      }
    }
  }
  /**
   * Returns the current sort keys.  This returns an unmodifiable
   * {@code non-null List}. If you need to change the sort keys,
   * make a copy of the returned {@code List}, mutate the copy
   * and invoke {@code setSortKeys} with the new list.
   *
   * @return the current sort order
   */
  getSortKeys(): List<RowSorter$SortKey> {
    return this.sortKeys;
  }
  /**
   * Returns the maximum number of sort keys.
   *
   * @return the maximum number of sort keys
   */
  getMaxSortKeys(): number {
    return this.maxSortKeys;
  }
  /**
   * Returns true if  a sort should happen when the underlying
   * model is updated; otherwise, returns false.
   *
   * @return whether or not to sort when the model is updated
   */
  getSortsOnUpdates(): boolean {
    return this.sortsOnUpdates;
  }
  /**
   * Returns the filter that determines which rows, if any, should
   * be hidden from view.
   *
   * @return the filter
   */
  getRowFilter(): RowFilter<any, any> {
    return this.filter_;
  }
  /**
   * Reverses the sort order from ascending to descending (or
   * descending to ascending) if the specified column is already the
   * primary sorted column; otherwise, makes the specified column
   * the primary sorted column, with an ascending sort order.  If
   * the specified column is not sortable, this method has no
   * effect.
   *
   * @param column index of the column to make the primary sorted column,
   *        in terms of the underlying model
   * @throws IndexOutOfBoundsException {@inheritDoc}
   * @see #setSortable(int,boolean)
   * @see #setMaxSortKeys(int)
   */
  toggleSortOrder(column: number): void {
    this.checkColumn(column);
    if (this.isSortable(column)) {
      let keys = new ArrayList(this.getSortKeys());
      let sortKey: RowSorter$SortKey;
      let sortIndex: number;
      for (sortIndex = (keys.size() - 1) | 0; sortIndex >= 0; sortIndex--) {
        if (keys.get(sortIndex).getColumn() === column) {
          break;
        }
      }
      if (sortIndex === -1) {
        sortKey = new RowSorter$SortKey()._RowSorter$SortKey(column, SortOrder.ASCENDING);
        keys.add(0, sortKey);
      } else if (sortIndex === 0) {
        keys.set(0, this.toggle(keys.get(0)));
      } else {
        keys.removeAt(sortIndex);
        keys.add(0, new RowSorter$SortKey()._RowSorter$SortKey(column, SortOrder.ASCENDING));
      }
      if (keys.size() > this.getMaxSortKeys()) {
        keys = keys.subList(0, this.getMaxSortKeys());
      }
      this.setSortKeys(keys);
    }
  }
  toggle(key: RowSorter$SortKey): RowSorter$SortKey {
    if (key.getSortOrder() === SortOrder.ASCENDING) {
      return new RowSorter$SortKey()._RowSorter$SortKey(key.getColumn(), SortOrder.DESCENDING);
    }
    return new RowSorter$SortKey()._RowSorter$SortKey(key.getColumn(), SortOrder.ASCENDING);
  }
  /**
   * {@inheritDoc}
   *
   * @throws IndexOutOfBoundsException {@inheritDoc}
   */
  convertRowIndexToView(index: number): number {
    if (this.modelToView_ == null) {
      return this.convertUnsortedUnfiltered(index);
    }
    return this.modelToView_[index];
  }
  /**
   * {@inheritDoc}
   *
   * @throws IndexOutOfBoundsException {@inheritDoc}
   */
  convertRowIndexToModel(index: number): number {
    if (this.viewToModel_ == null) {
      return this.convertUnsortedUnfiltered(index);
    }
    return this.viewToModel_[index].modelIndex;
  }
  convertUnsortedUnfiltered(index: number): number {
    if (index < 0 || index >= this.modelRowCount) {
      if (index >= this.modelRowCount && index < this.getModelWrapper().getRowCount()) {
        if (DefaultRowSorter.warning8160087) {
          DefaultRowSorter.warning8160087 = false;
          $J.err.println('WARNING: row index is bigger than sorter\'s row count. Most likely this is a wrong sorter usage.');
        }
      } else {
        throw new IndexOutOfBoundsException('Invalid index');
      }
    }
    return index;
  }
  isUnsorted(): boolean {
    let keys = this.getSortKeys();
    let keySize = keys.size();
    return (keySize === 0 || keys.get(0).getSortOrder() === SortOrder.UNSORTED);
  }
  /**
   * Sorts the existing filtered data.  This should only be used if
   * the filter hasn't changed.
   */
  sortExistingData(): void {
    let lastViewToModel = this.getViewToModelAsInts(this.viewToModel_);
    this.updateUseToString();
    this.cacheSortKeys(this.getSortKeys());
    if (this.isUnsorted()) {
      if (this.getRowFilter() == null) {
        this.viewToModel_ = null;
        this.modelToView_ = null;
      } else {
        let included = 0;
        for (let i = 0; i < this.modelToView_.length; i++) {
          if (this.modelToView_[i] !== -1) {
            this.viewToModel_[included].modelIndex = i;
            this.modelToView_[i] = included++;
          }
        }
      }
    } else {
      Arrays.sort(this.viewToModel_);
      this.setModelToViewFromViewToModel(false);
    }
    this.fireRowSorterChanged$intArr(lastViewToModel);
  }
  /**
   * Sorts and filters the rows in the view based on the sort keys
   * of the columns currently being sorted and the filter, if any,
   * associated with this sorter.  An empty <code>sortKeys</code> list
   * indicates that the view should unsorted, the same as the model.
   *
   * @see #setRowFilter
   * @see #setSortKeys
   */
  sort(): void {
    this.sorted = true;
    let lastViewToModel = this.getViewToModelAsInts(this.viewToModel_);
    this.updateUseToString();
    if (this.isUnsorted()) {
      this.cachedSortKeys = $J.newArray(0, null);
      if (this.getRowFilter() == null) {
        if (this.viewToModel_ != null) {
          this.viewToModel_ = null;
          this.modelToView_ = null;
        } else {
          return;
        }
      } else {
        this.initializeFilteredMapping();
      }
    } else {
      this.cacheSortKeys(this.getSortKeys());
      if (this.getRowFilter() != null) {
        this.initializeFilteredMapping();
      } else {
        this.createModelToView(this.getModelWrapper().getRowCount());
        this.createViewToModel(this.getModelWrapper().getRowCount());
      }
      Arrays.sort(this.viewToModel_);
      this.setModelToViewFromViewToModel(false);
    }
    this.fireRowSorterChanged$intArr(lastViewToModel);
  }
  /**
   * Updates the useToString mapping before a sort.
   */
  updateUseToString(): void {
    let i = this.getModelWrapper().getColumnCount();
    if (this.useToString_ == null || this.useToString_.length !== i) {
      this.useToString_ = $J.newArray(i, false);
    }
    for (--i; i >= 0; i--) {
      this.useToString_[i] = this.useToString(i);
    }
  }
  /**
   * Resets the viewToModel and modelToView mappings based on
   * the current Filter.
   */
  initializeFilteredMapping(): void {
    let rowCount = this.getModelWrapper().getRowCount();
    let i: number;
    let j: number;
    let excludedCount = 0;
    this.createModelToView(rowCount);
    for (i = 0; i < rowCount; i++) {
      if (this.include(i)) {
        this.modelToView_[i] = (i - excludedCount) | 0;
      } else {
        this.modelToView_[i] = -1;
        excludedCount++;
      }
    }
    this.createViewToModel((rowCount - excludedCount) | 0);
    for (i = 0, j = 0; i < rowCount; i++) {
      if (this.modelToView_[i] !== -1) {
        this.viewToModel_[j++].modelIndex = i;
      }
    }
  }
  /**
   * Makes sure the modelToView array is of size rowCount.
   */
  createModelToView(rowCount: number): void {
    if (this.modelToView_ == null || this.modelToView_.length !== rowCount) {
      this.modelToView_ = $J.newArray(rowCount, 0);
    }
  }
  /**
   * Resets the viewToModel array to be of size rowCount.
   */
  createViewToModel(rowCount: number): void {
    let recreateFrom = 0;
    if (this.viewToModel_ != null) {
      recreateFrom = Math.min(rowCount, this.viewToModel_.length);
      if (this.viewToModel_.length !== rowCount) {
        let oldViewToModel = this.viewToModel_;
        this.viewToModel_ = $J.newArray(rowCount, null);
        $J.system_arraycopy(oldViewToModel, 0, this.viewToModel_, 0, recreateFrom);
      }
    } else {
      this.viewToModel_ = $J.newArray(rowCount, null);
    }
    let i: number;
    for (i = 0; i < recreateFrom; i++) {
      this.viewToModel_[i].modelIndex = i;
    }
    for (i = recreateFrom; i < rowCount; i++) {
      this.viewToModel_[i] = new DefaultRowSorter$Row()._DefaultRowSorter$Row(this, i);
    }
  }
  /**
   * Caches the sort keys before a sort.
   */
  cacheSortKeys(keys: List<RowSorter$SortKey>): void {
    let keySize = keys.size();
    this.sortComparators = $J.newArray(keySize, null);
    for (let i = 0; i < keySize; i++) {
      this.sortComparators[i] = this.getComparator0(keys.get(i).getColumn());
    }
    this.cachedSortKeys = $J.toArrayInto(keys.toArray(), $J.newArray(keySize, null));
  }
  /**
   * Refreshes the modelToView mapping from that of viewToModel.
   * If <code>unsetFirst</code> is true, all indices in modelToView are
   * first set to -1.
   */
  setModelToViewFromViewToModel(unsetFirst: boolean): void {
    let i: number;
    if (unsetFirst) {
      for (i = (this.modelToView_.length - 1) | 0; i >= 0; i--) {
        this.modelToView_[i] = -1;
      }
    }
    for (i = (this.viewToModel_.length - 1) | 0; i >= 0; i--) {
      this.modelToView_[this.viewToModel_[i].modelIndex] = i;
    }
  }
  getViewToModelAsInts(viewToModel: DefaultRowSorter$Row[]): number[] {
    if (viewToModel != null) {
      let viewToModelI = $J.newArray(viewToModel.length, 0);
      for (let i = (viewToModel.length - 1) | 0; i >= 0; i--) {
        viewToModelI[i] = viewToModel[i].modelIndex;
      }
      return viewToModelI;
    }
    return $J.newArray(0, 0);
  }
  /**
   * Sets the <code>Comparator</code> to use when sorting the specified
   * column.  This does not trigger a sort.  If you want to sort after
   * setting the comparator you need to explicitly invoke <code>sort</code>.
   *
   * @param column the index of the column the <code>Comparator</code> is
   *        to be used for, in terms of the underlying model
   * @param comparator the <code>Comparator</code> to use
   * @throws IndexOutOfBoundsException if <code>column</code> is outside
   *         the range of the underlying model
   */
  setComparator(column: number, comparator: Comparator<any>): void {
    this.checkColumn(column);
    if (this.comparators == null) {
      this.comparators = $J.newArray(this.getModelWrapper().getColumnCount(), null);
    }
    this.comparators[column] = comparator;
  }
  /**
   * Returns the <code>Comparator</code> for the specified
   * column.  This will return <code>null</code> if a <code>Comparator</code>
   * has not been specified for the column.
   *
   * @param column the column to fetch the <code>Comparator</code> for, in
   *        terms of the underlying model
   * @return the <code>Comparator</code> for the specified column
   * @throws IndexOutOfBoundsException if column is outside
   *         the range of the underlying model
   */
  getComparator(column: number): Comparator<any> {
    this.checkColumn(column);
    if (this.comparators != null) {
      return this.comparators[column];
    }
    return null;
  }
  getComparator0(column: number): Comparator<any> {
    let comparator = this.getComparator(column);
    if (comparator != null) {
      return comparator;
    }
    return $J.fn(Collator.getInstance(), 'compare');
  }
  getFilterEntry(modelIndex: number): RowFilter$Entry<M, I> {
    if (this.filterEntry == null) {
      this.filterEntry = new DefaultRowSorter$FilterEntry().$o(this)._DefaultRowSorter$FilterEntry();
    }
    this.filterEntry.modelIndex = modelIndex;
    return this.filterEntry;
  }
  /**
   * {@inheritDoc}
   */
  getViewRowCount(): number {
    if (this.viewToModel_ != null) {
      return this.viewToModel_.length;
    }
    return Math.max(this.getModelWrapper().getRowCount(), this.modelRowCount);
  }
  allChanged(): void {
    this.modelToView_ = null;
    this.viewToModel_ = null;
    this.comparators = null;
    this.isSortable_ = null;
    if (this.isUnsorted()) {
      this.sort();
    } else {
      this.setSortKeys(null);
    }
  }
  /**
   * {@inheritDoc}
   */
  modelStructureChanged(): void {
    this.allChanged();
    this.modelRowCount = this.getModelWrapper().getRowCount();
  }
  /**
   * {@inheritDoc}
   */
  allRowsChanged(): void {
    this.modelRowCount = this.getModelWrapper().getRowCount();
    this.sort();
  }
  /**
   * {@inheritDoc}
   *
   * @throws IndexOutOfBoundsException {@inheritDoc}
   */
  rowsInserted(firstRow: number, endRow: number): void {
    this.checkAgainstModel(firstRow, endRow);
    let newModelRowCount = this.getModelWrapper().getRowCount();
    if (endRow >= newModelRowCount) {
      throw new IndexOutOfBoundsException('Invalid range');
    }
    this.modelRowCount = newModelRowCount;
    if (this.shouldOptimizeChange(firstRow, endRow)) {
      this.rowsInserted0(firstRow, endRow);
    }
  }
  /**
   * {@inheritDoc}
   *
   * @throws IndexOutOfBoundsException {@inheritDoc}
   */
  rowsDeleted(firstRow: number, endRow: number): void {
    this.checkAgainstModel(firstRow, endRow);
    if (firstRow >= this.modelRowCount || endRow >= this.modelRowCount) {
      throw new IndexOutOfBoundsException('Invalid range');
    }
    this.modelRowCount = this.getModelWrapper().getRowCount();
    if (this.shouldOptimizeChange(firstRow, endRow)) {
      this.rowsDeleted0(firstRow, endRow);
    }
  }
  /**
   * {@inheritDoc}
   *
   * @throws IndexOutOfBoundsException {@inheritDoc}
   */
  rowsUpdated$int$int(firstRow: number, endRow: number): void {
    this.checkAgainstModel(firstRow, endRow);
    if (firstRow >= this.modelRowCount || endRow >= this.modelRowCount) {
      throw new IndexOutOfBoundsException('Invalid range');
    }
    if (this.getSortsOnUpdates()) {
      if (this.shouldOptimizeChange(firstRow, endRow)) {
        this.rowsUpdated0(firstRow, endRow);
      }
    } else {
      this.sorted = false;
    }
  }
  /**
   * {@inheritDoc}
   *
   * @throws IndexOutOfBoundsException {@inheritDoc}
   */
  rowsUpdated$int$int$int(firstRow: number, endRow: number, column: number): void {
    this.checkColumn(column);
    this.rowsUpdated$int$int(firstRow, endRow);
  }
  checkAgainstModel(firstRow: number, endRow: number): void {
    if (firstRow > endRow || firstRow < 0 || endRow < 0 || firstRow > this.modelRowCount) {
      throw new IndexOutOfBoundsException('Invalid range');
    }
  }
  /**
   * Returns true if the specified row should be included.
   */
  include(row: number): boolean {
    let filter = this.getRowFilter();
    if (filter != null) {
      return filter.include$Entry(this.getFilterEntry(row));
    }
    return true;
  }
  compare(model1: number, model2: number): number {
    let column: number;
    let sortOrder: SortOrder;
    let v1: any;
    let v2: any;
    let result: number;
    for (let counter = 0; counter < this.cachedSortKeys.length; counter++) {
      column = this.cachedSortKeys[counter].getColumn();
      sortOrder = this.cachedSortKeys[counter].getSortOrder();
      if (sortOrder === SortOrder.UNSORTED) {
        result = (model1 - model2) | 0;
      } else {
        if (this.useToString_[column]) {
          v1 = this.getModelWrapper().getStringValueAt(model1, column);
          v2 = this.getModelWrapper().getStringValueAt(model2, column);
        } else {
          v1 = this.getModelWrapper().getValueAt(model1, column);
          v2 = this.getModelWrapper().getValueAt(model2, column);
        }
        if (v1 == null) {
          if (v2 == null) {
            result = 0;
          } else {
            result = -1;
          }
        } else if (v2 == null) {
          result = 1;
        } else {
          let c = this.sortComparators[counter];
          result = c(v1, v2);
        }
        if (sortOrder === SortOrder.DESCENDING) {
          result = Math.imul(result, -1);
        }
      }
      if (result !== 0) {
        return result;
      }
    }
    return (model1 - model2) | 0;
  }
  /**
   * Whether not we are filtering/sorting.
   */
  isTransformed(): boolean {
    return (this.viewToModel_ != null);
  }
  /**
   * Insets new set of entries.
   *
   * @param toAdd the Rows to add, sorted
   * @param current the array to insert the items into
   */
  insertInOrder(toAdd: List<DefaultRowSorter$Row>, current: DefaultRowSorter$Row[]): void {
    let last = 0;
    let index: number;
    let max = toAdd.size();
    for (let i = 0; i < max; i++) {
      index = Arrays.binarySearch(current, toAdd.get(i));
      if (index < 0) {
        index = (-1 - index) | 0;
      }
      $J.system_arraycopy(current, last, this.viewToModel_, (last + i) | 0, (index - last) | 0);
      (this.viewToModel_[(index + i) | 0]) = toAdd.get(i);
      last = index;
    }
    $J.system_arraycopy(current, last, this.viewToModel_, (last + max) | 0, (current.length - last) | 0);
  }
  /**
   * Returns true if we should try and optimize the processing of the
   * <code>TableModelEvent</code>.  If this returns false, assume the
   * event was dealt with and no further processing needs to happen.
   */
  shouldOptimizeChange(firstRow: number, lastRow: number): boolean {
    if (!this.isTransformed()) {
      return false;
    }
    if (!this.sorted || this.viewToModel_.length === 0 || ((lastRow - firstRow) | 0) > $J.idiv(this.viewToModel_.length, 10)) {
      this.sort();
      return false;
    }
    return true;
  }
  rowsInserted0(firstRow: number, lastRow: number): void {
    let oldViewToModel = this.getViewToModelAsInts(this.viewToModel_);
    let i: number;
    let delta = (lastRow - firstRow + 1) | 0;
    let added = new ArrayList(delta);
    for (i = firstRow; i <= lastRow; i++) {
      if (this.include(i)) {
        added.add(new DefaultRowSorter$Row()._DefaultRowSorter$Row(this, i));
      }
    }
    let viewIndex: number;
    for (i = (this.modelToView_.length - 1) | 0; i >= firstRow; i--) {
      viewIndex = this.modelToView_[i];
      if (viewIndex !== -1) {
        this.viewToModel_[viewIndex].modelIndex = (this.viewToModel_[viewIndex].modelIndex + delta) | 0;
      }
    }
    if (added.size() > 0) {
      Collections.sort(added);
      let lastViewToModel = this.viewToModel_;
      this.viewToModel_ = $J.newArray((this.viewToModel_.length + added.size()) | 0, null);
      this.insertInOrder(added, lastViewToModel);
    }
    this.createModelToView(this.getModelWrapper().getRowCount());
    this.setModelToViewFromViewToModel(true);
    this.fireRowSorterChanged$intArr(oldViewToModel);
  }
  rowsDeleted0(firstRow: number, lastRow: number): void {
    let oldViewToModel = this.getViewToModelAsInts(this.viewToModel_);
    let removedFromView = 0;
    let i: number;
    let viewIndex: number;
    for (i = firstRow; i <= lastRow; i++) {
      viewIndex = this.modelToView_[i];
      if (viewIndex !== -1) {
        removedFromView++;
        this.viewToModel_[viewIndex] = null;
      }
    }
    let delta = (lastRow - firstRow + 1) | 0;
    for (i = (this.modelToView_.length - 1) | 0; i > lastRow; i--) {
      viewIndex = this.modelToView_[i];
      if (viewIndex !== -1) {
        this.viewToModel_[viewIndex].modelIndex = (this.viewToModel_[viewIndex].modelIndex - delta) | 0;
      }
    }
    if (removedFromView > 0) {
      let newViewToModel = $J.newArray((this.viewToModel_.length - removedFromView) | 0, null);
      let newIndex = 0;
      let last = 0;
      for (i = 0; i < this.viewToModel_.length; i++) {
        if (this.viewToModel_[i] == null) {
          $J.system_arraycopy(this.viewToModel_, last, newViewToModel, newIndex, (i - last) | 0);
          newIndex = (newIndex + (i - last)) | 0;
          last = (i + 1) | 0;
        }
      }
      $J.system_arraycopy(this.viewToModel_, last, newViewToModel, newIndex, (this.viewToModel_.length - last) | 0);
      this.viewToModel_ = newViewToModel;
    }
    this.createModelToView(this.getModelWrapper().getRowCount());
    this.setModelToViewFromViewToModel(true);
    this.fireRowSorterChanged$intArr(oldViewToModel);
  }
  rowsUpdated0(firstRow: number, lastRow: number): void {
    let oldViewToModel = this.getViewToModelAsInts(this.viewToModel_);
    let i: number;
    let j: number;
    let delta = (lastRow - firstRow + 1) | 0;
    let modelIndex: number;
    let last: number;
    let index: number;
    if (this.getRowFilter() == null) {
      let updated = $J.newArray(delta, null);
      for (j = 0, i = firstRow; i <= lastRow; i++, j++) {
        updated[j] = this.viewToModel_[this.modelToView_[i]];
      }
      Arrays.sort(updated);
      let intermediary = $J.newArray((this.viewToModel_.length - delta) | 0, null);
      for (i = 0, j = 0; i < this.viewToModel_.length; i++) {
        modelIndex = this.viewToModel_[i].modelIndex;
        if (modelIndex < firstRow || modelIndex > lastRow) {
          intermediary[j++] = this.viewToModel_[i];
        }
      }
      this.insertInOrder(Arrays.asList(...updated), intermediary);
      this.setModelToViewFromViewToModel(false);
    } else {
      let updated = new ArrayList(delta);
      let newlyVisible = 0;
      let newlyHidden = 0;
      let effected = 0;
      for (i = firstRow; i <= lastRow; i++) {
        if (this.modelToView_[i] === -1) {
          if (this.include(i)) {
            updated.add(new DefaultRowSorter$Row()._DefaultRowSorter$Row(this, i));
            newlyVisible++;
          }
        } else {
          if (!this.include(i)) {
            newlyHidden++;
          } else {
            updated.add(this.viewToModel_[this.modelToView_[i]]);
          }
          this.modelToView_[i] = -2;
          effected++;
        }
      }
      Collections.sort(updated);
      let intermediary = $J.newArray((this.viewToModel_.length - effected) | 0, null);
      for (i = 0, j = 0; i < this.viewToModel_.length; i++) {
        modelIndex = this.viewToModel_[i].modelIndex;
        if (this.modelToView_[modelIndex] !== -2) {
          intermediary[j++] = this.viewToModel_[i];
        }
      }
      if (newlyVisible !== newlyHidden) {
        this.viewToModel_ = $J.newArray((this.viewToModel_.length + newlyVisible - newlyHidden) | 0, null);
      }
      this.insertInOrder(updated, intermediary);
      this.setModelToViewFromViewToModel(true);
    }
    this.fireRowSorterChanged$intArr(oldViewToModel);
  }
  checkColumn(column: number): void {
    if (column < 0 || column >= this.getModelWrapper().getColumnCount()) {
      throw new IndexOutOfBoundsException('column beyond range of TableModel');
    }
  }
  static $clinit() {
    DefaultRowSorter.warning8160087 = true;
  }
}

/**
 * <code>DefaultRowSorter.ModelWrapper</code> is responsible for providing
 * the data that gets sorted by <code>DefaultRowSorter</code>.  You
 * normally do not interact directly with <code>ModelWrapper</code>.
 * Subclasses of <code>DefaultRowSorter</code> provide an
 * implementation of <code>ModelWrapper</code> wrapping another model.
 * For example,
 * <code>TableRowSorter</code> provides a <code>ModelWrapper</code> that
 * wraps a <code>TableModel</code>.
 * <p>
 * <code>ModelWrapper</code> makes a distinction between values as
 * <code>Object</code>s and <code>String</code>s.  This allows
 * implementations to provide a custom string
 * converter to be used instead of invoking <code>toString</code> on the
 * object.
 *
 * @param <M> the type of the underlying model
 * @param <I> the identifier supplied to the filter
 * @since 1.6
 * @see RowFilter
 * @see RowFilter.Entry
 */
export class DefaultRowSorter$ModelWrapper<M, I> extends JObject {
  /**
   * Creates a new <code>ModelWrapper</code>.
   */
  _DefaultRowSorter$ModelWrapper(): this {
    return this;
  }
  /**
   * Returns the value as a <code>String</code> at the specified
   * index.  This implementation uses <code>toString</code> on
   * the result from <code>getValueAt</code> (making sure
   * to return an empty string for null values).  Subclasses that
   * override this method should never return null.
   *
   * @param row the row index
   * @param column the column index
   * @return the value at the specified index as a <code>String</code>
   * @throws IndexOutOfBoundsException if the indices are outside
   *         the range of the model
   */
  getStringValueAt(row: number, column: number): string {
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

/**
 * RowFilter.Entry implementation that delegates to the ModelWrapper.
 * getFilterEntry(int) creates the single instance of this that is
 * passed to the Filter.  Only call getFilterEntry(int) to get
 * the instance.
 */
export class DefaultRowSorter$FilterEntry extends RowFilter$Entry {
  /**
   * The index into the model, set in getFilterEntry
   */
  modelIndex: number = 0;
  _DefaultRowSorter$FilterEntry(): this {
    this._RowFilter$Entry();
    return this;
  }
}

/**
 * Row is used to handle the actual sorting by way of Comparable.  It
 * will use the sortKeys to do the actual comparison.
 */
export class DefaultRowSorter$Row extends JObject {
  sorter: DefaultRowSorter<any, any> = null;
  modelIndex: number = 0;
  _DefaultRowSorter$Row(sorter: DefaultRowSorter<any, any>, index: number): this {
    this.sorter = sorter;
    this.modelIndex = index;
    return this;
  }
  compareTo(o: DefaultRowSorter$Row): number {
    return this.sorter.compare(this.modelIndex, o.modelIndex);
  }
}

$J.define(DefaultRowSorter, 'javax.swing.DefaultRowSorter', { kind: 'class', sup: 'javax.swing.RowSorter', ctors: { '': '_DefaultRowSorter' }, meths: { 'rowsUpdated(int,int,int)': 'rowsUpdated$int$int$int', 'rowsUpdated(int,int)': 'rowsUpdated$int$int' }, clinit: true, lazy: ['warning8160087'] });
$J.define(DefaultRowSorter$ModelWrapper, 'javax.swing.DefaultRowSorter$ModelWrapper', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_DefaultRowSorter$ModelWrapper' } });
$J.define(DefaultRowSorter$FilterEntry, 'javax.swing.DefaultRowSorter$FilterEntry', { kind: 'class', sup: 'javax.swing.RowFilter$Entry', ctors: { '': '_DefaultRowSorter$FilterEntry' }, inner: true });
$J.define(DefaultRowSorter$Row, 'javax.swing.DefaultRowSorter$Row', { kind: 'class', ifaces: ['java.lang.Comparable'], sup: 'java.lang.Object', ctors: { 'javax.swing.DefaultRowSorter,int': '_DefaultRowSorter$Row' } });
$J.module(() => {
  RowSorter$SortKey = $J.load('javax.swing.RowSorter$SortKey');
  SortOrder = $J.load('javax.swing.SortOrder');
});
