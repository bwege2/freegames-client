// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/tree/DefaultTreeSelectionModel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, ArrayList, BitSet, Hashtable, JObject, StringBuilder, Vector } from '../../../../jre/index.ts';

let DefaultListSelectionModel, EventListenerList, SwingPropertyChangeSupport, TreeSelectionEvent, TreeSelectionListener, PathPlaceHolder, TreeSelectionModel;

/**
 * Default implementation of TreeSelectionModel.  Listeners are notified
 * whenever
 * the paths in the selection change, not the rows. In order
 * to be able to track row changes you may wish to become a listener
 * for expansion events on the tree and test for changes from there.
 * <p>resetRowSelection is called from any of the methods that update
 * the selected paths. If you subclass any of these methods to
 * filter what is allowed to be selected, be sure and message
 * <code>resetRowSelection</code> if you do not message super.
 *
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the <code>java.beans</code> package.
 * Please see {@link java.beans.XMLEncoder}.
 *
 * @see javax.swing.JTree
 *
 * @author Scott Violet
 */
export class DefaultTreeSelectionModel extends JObject {
  /**
   * Property name for selectionMode.
   */
  static readonly SELECTION_MODE_PROPERTY: string = 'selectionMode';
  /**
   * Used to messaged registered listeners.
   */
  changeSupport: SwingPropertyChangeSupport = null;
  /**
   * Paths that are currently selected.  Will be null if nothing is
   * currently selected.
   */
  selection: TreePath[] = null;
  /**
   * Event listener list.
   */
  listenerList: EventListenerList = null;
  /**
   * Provides a row for a given path.
   */
  rowMapper: RowMapper = null;
  /**
   * Handles maintaining the list selection model. The RowMapper is used
   * to map from a TreePath to a row, and the value is then placed here.
   */
  listSelectionModel: DefaultListSelectionModel = null;
  /**
   * Mode for the selection, will be either SINGLE_TREE_SELECTION,
   * CONTIGUOUS_TREE_SELECTION or DISCONTIGUOUS_TREE_SELECTION.
   */
  selectionMode: number = 0;
  /**
   * Last path that was added.
   */
  leadPath: TreePath = null;
  /**
   * Index of the lead path in selection.
   */
  leadIndex: number = 0;
  /**
   * Lead row.
   */
  leadRow: number = 0;
  /**
   * Used to make sure the paths are unique, will contain all the paths
   * in <code>selection</code>.
   */
  uniquePaths: Hashtable<TreePath, boolean> = null;
  lastPaths: Hashtable<TreePath, boolean> = null;
  tempPaths: TreePath[] = null;
  /**
   * Creates a new instance of DefaultTreeSelectionModel that is
   * empty, with a selection mode of DISCONTIGUOUS_TREE_SELECTION.
   */
  _DefaultTreeSelectionModel(): this {
    this.listenerList = new EventListenerList()._EventListenerList();
    this.listSelectionModel = new DefaultListSelectionModel()._DefaultListSelectionModel();
    this.selectionMode = TreeSelectionModel.DISCONTIGUOUS_TREE_SELECTION;
    this.leadIndex = this.leadRow = -1;
    this.uniquePaths = new Hashtable();
    this.lastPaths = new Hashtable();
    this.tempPaths = $J.newArray(1, null);
    return this;
  }
  /**
   * Sets the RowMapper instance. This instance is used to determine
   * the row for a particular TreePath.
   */
  setRowMapper(newMapper: RowMapper): void {
    this.rowMapper = newMapper;
    this.resetRowSelection();
  }
  /**
   * Returns the selection mode, one of <code>SINGLE_TREE_SELECTION</code>,
   * <code>DISCONTIGUOUS_TREE_SELECTION</code> or
   * <code>CONTIGUOUS_TREE_SELECTION</code>.
   */
  getSelectionMode(): number {
    return this.selectionMode;
  }
  /**
   * Sets the selection to path. If this represents a change, then
   * the TreeSelectionListeners are notified. If <code>path</code> is
   * null, this has the same effect as invoking <code>clearSelection</code>.
   *
   * @param path new path to select
   */
  setSelectionPath(path: TreePath): void {
    if (path == null) {
      this.setSelectionPaths(null);
    } else {
      let newPaths = $J.newArray(1, null);
      newPaths[0] = path;
      this.setSelectionPaths(newPaths);
    }
  }
  /**
   * Sets the selection. Whether the supplied paths are taken as the
   * new selection depends upon the selection mode. If the supplied
   * array is {@code null}, or empty, the selection is cleared. If
   * the selection mode is {@code SINGLE_TREE_SELECTION}, only the
   * first path in {@code pPaths} is used. If the selection
   * mode is {@code CONTIGUOUS_TREE_SELECTION} and the supplied paths
   * are not contiguous, then only the first path in {@code pPaths} is
   * used. If the selection mode is
   * {@code DISCONTIGUOUS_TREE_SELECTION}, then all paths are used.
   * <p>
   * All {@code null} paths in {@code pPaths} are ignored.
   * <p>
   * If this represents a change, all registered {@code
   * TreeSelectionListener}s are notified.
   * <p>
   * The lead path is set to the last unique path.
   * <p>
   * The paths returned from {@code getSelectionPaths} are in the same
   * order as those supplied to this method.
   *
   * @param pPaths the new selection
   */
  setSelectionPaths(pPaths: TreePath[]): void {
    let newCount: number;
    let newCounter: number;
    let oldCount: number;
    let oldCounter: number;
    let paths = pPaths;
    if (paths == null) {
      newCount = 0;
    } else {
      newCount = paths.length;
    }
    if (this.selection == null) {
      oldCount = 0;
    } else {
      oldCount = this.selection.length;
    }
    if (((newCount + oldCount) | 0) !== 0) {
      if (this.selectionMode === TreeSelectionModel.SINGLE_TREE_SELECTION) {
        if (newCount > 1) {
          paths = $J.newArray(1, null);
          paths[0] = pPaths[0];
          newCount = 1;
        }
      } else if (this.selectionMode === TreeSelectionModel.CONTIGUOUS_TREE_SELECTION) {
        if (newCount > 0 && !this.arePathsContiguous(paths)) {
          paths = $J.newArray(1, null);
          paths[0] = pPaths[0];
          newCount = 1;
        }
      }
      let beginLeadPath = this.leadPath;
      let cPaths = new Vector((newCount + oldCount) | 0);
      let newSelectionAsList = new ArrayList(newCount);
      this.lastPaths.clear();
      this.leadPath = null;
      for (newCounter = 0; newCounter < newCount; newCounter++) {
        let path = paths[newCounter];
        if (path != null && this.lastPaths.get(path) == null) {
          this.lastPaths.put(path, true);
          if (this.uniquePaths.get(path) == null) {
            cPaths.addElement(new PathPlaceHolder()._PathPlaceHolder(path, true));
          }
          this.leadPath = path;
          newSelectionAsList.add(path);
        }
      }
      let newSelection = $J.toArrayInto(newSelectionAsList.toArray(), $J.newArray(newSelectionAsList.size(), null));
      for (oldCounter = 0; oldCounter < oldCount; oldCounter++) {
        if (this.selection[oldCounter] != null && this.lastPaths.get(this.selection[oldCounter]) == null) {
          cPaths.addElement(new PathPlaceHolder()._PathPlaceHolder(this.selection[oldCounter], false));
        }
      }
      this.selection = newSelection;
      let tempHT = this.uniquePaths;
      this.uniquePaths = this.lastPaths;
      this.lastPaths = tempHT;
      this.lastPaths.clear();
      this.insureUniqueness();
      this.updateLeadIndex();
      this.resetRowSelection();
      if (cPaths.size() > 0) {
        this.notifyPathChange(cPaths, beginLeadPath);
      }
    }
  }
  /**
   * Adds path to the current selection. If path is not currently
   * in the selection the TreeSelectionListeners are notified. This has
   * no effect if <code>path</code> is null.
   *
   * @param path the new path to add to the current selection
   */
  addSelectionPath(path: TreePath): void {
    if (path != null) {
      let toAdd = $J.newArray(1, null);
      toAdd[0] = path;
      this.addSelectionPaths(toAdd);
    }
  }
  /**
   * Adds paths to the current selection. If any of the paths in
   * paths are not currently in the selection the TreeSelectionListeners
   * are notified. This has
   * no effect if <code>paths</code> is null.
   * <p>The lead path is set to the last element in <code>paths</code>.
   * <p>If the selection mode is <code>CONTIGUOUS_TREE_SELECTION</code>,
   * and adding the new paths would make the selection discontiguous.
   * Then two things can result: if the TreePaths in <code>paths</code>
   * are contiguous, then the selection becomes these TreePaths,
   * otherwise the TreePaths aren't contiguous and the selection becomes
   * the first TreePath in <code>paths</code>.
   *
   * @param paths the new path to add to the current selection
   */
  addSelectionPaths(paths: TreePath[]): void {
    let newPathLength = ((paths == null) ? 0 : paths.length);
    if (newPathLength > 0) {
      if (this.selectionMode === TreeSelectionModel.SINGLE_TREE_SELECTION) {
        this.setSelectionPaths(paths);
      } else if (this.selectionMode === TreeSelectionModel.CONTIGUOUS_TREE_SELECTION && !this.canPathsBeAdded(paths)) {
        if (this.arePathsContiguous(paths)) {
          this.setSelectionPaths(paths);
        } else {
          let newPaths = $J.newArray(1, null);
          newPaths[0] = paths[0];
          this.setSelectionPaths(newPaths);
        }
      } else {
        let counter: number;
        let validCount: number;
        let oldCount: number;
        let beginLeadPath = this.leadPath;
        let cPaths = null;
        if (this.selection == null) {
          oldCount = 0;
        } else {
          oldCount = this.selection.length;
        }
        this.lastPaths.clear();
        for (counter = 0, validCount = 0; counter < newPathLength; counter++) {
          if (paths[counter] != null) {
            if (this.uniquePaths.get(paths[counter]) == null) {
              validCount++;
              if (cPaths == null) {
                cPaths = new Vector();
              }
              cPaths.addElement(new PathPlaceHolder()._PathPlaceHolder(paths[counter], true));
              this.uniquePaths.put(paths[counter], true);
              this.lastPaths.put(paths[counter], true);
            }
            this.leadPath = paths[counter];
          }
        }
        if (this.leadPath == null) {
          this.leadPath = beginLeadPath;
        }
        if (validCount > 0) {
          let newSelection = $J.newArray((oldCount + validCount) | 0, null);
          if (oldCount > 0) {
            $J.system_arraycopy(this.selection, 0, newSelection, 0, oldCount);
          }
          if (validCount !== paths.length) {
            let newPaths = this.lastPaths.keys();
            counter = oldCount;
            while (newPaths.hasMoreElements()) {
              newSelection[counter++] = newPaths.nextElement();
            }
          } else {
            $J.system_arraycopy(paths, 0, newSelection, oldCount, validCount);
          }
          this.selection = newSelection;
          this.insureUniqueness();
          this.updateLeadIndex();
          this.resetRowSelection();
          this.notifyPathChange(cPaths, beginLeadPath);
        } else {
          this.leadPath = beginLeadPath;
        }
        this.lastPaths.clear();
      }
    }
  }
  /**
   * Removes path from the selection. If path is in the selection
   * The TreeSelectionListeners are notified. This has no effect if
   * <code>path</code> is null.
   *
   * @param path the path to remove from the selection
   */
  removeSelectionPath(path: TreePath): void {
    if (path != null) {
      let rPath = $J.newArray(1, null);
      rPath[0] = path;
      this.removeSelectionPaths(rPath);
    }
  }
  /**
   * Removes paths from the selection.  If any of the paths in paths
   * are in the selection the TreeSelectionListeners are notified.
   * This has no effect if <code>paths</code> is null.
   *
   * @param paths the paths to remove from the selection
   */
  removeSelectionPaths(paths: TreePath[]): void {
    if (paths != null && this.selection != null && paths.length > 0) {
      if (!this.canPathsBeRemoved(paths)) {
        this.clearSelection();
      } else {
        let pathsToRemove = null;
        for (let removeCounter = (paths.length - 1) | 0; removeCounter >= 0; removeCounter--) {
          if (paths[removeCounter] != null) {
            if (this.uniquePaths.get(paths[removeCounter]) != null) {
              if (pathsToRemove == null) {
                pathsToRemove = new Vector(paths.length);
              }
              this.uniquePaths.remove(paths[removeCounter]);
              pathsToRemove.addElement(new PathPlaceHolder()._PathPlaceHolder(paths[removeCounter], false));
            }
          }
        }
        if (pathsToRemove != null) {
          let removeCount = pathsToRemove.size();
          let beginLeadPath = this.leadPath;
          if (removeCount === this.selection.length) {
            this.selection = null;
          } else {
            let pEnum = this.uniquePaths.keys();
            let validCount = 0;
            this.selection = $J.newArray((this.selection.length - removeCount) | 0, null);
            while (pEnum.hasMoreElements()) {
              this.selection[validCount++] = pEnum.nextElement();
            }
          }
          if (this.leadPath != null && this.uniquePaths.get(this.leadPath) == null) {
            if (this.selection != null) {
              this.leadPath = this.selection[(this.selection.length - 1) | 0];
            } else {
              this.leadPath = null;
            }
          } else if (this.selection != null) {
            this.leadPath = this.selection[(this.selection.length - 1) | 0];
          } else {
            this.leadPath = null;
          }
          this.updateLeadIndex();
          this.resetRowSelection();
          this.notifyPathChange(pathsToRemove, beginLeadPath);
        }
      }
    }
  }
  /**
   * Returns the first path in the selection. This is useful if there
   * if only one item currently selected.
   */
  getSelectionPath(): TreePath {
    if (this.selection != null && this.selection.length > 0) {
      return this.selection[0];
    }
    return null;
  }
  /**
   * Returns the selection.
   *
   * @return the selection
   */
  getSelectionPaths(): TreePath[] {
    if (this.selection != null) {
      let pathSize = this.selection.length;
      let result = $J.newArray(pathSize, null);
      $J.system_arraycopy(this.selection, 0, result, 0, pathSize);
      return result;
    }
    return $J.newArray(0, null);
  }
  /**
   * Returns the number of paths that are selected.
   */
  getSelectionCount(): number {
    return (this.selection == null) ? 0 : this.selection.length;
  }
  /**
   * Returns true if the path, <code>path</code>,
   * is in the current selection.
   */
  isPathSelected(path: TreePath): boolean {
    return (path != null) ? (this.uniquePaths.get(path) != null) : false;
  }
  /**
   * Empties the current selection.  If this represents a change in the
   * current selection, the selection listeners are notified.
   */
  clearSelection(): void {
    if (this.selection != null && this.selection.length > 0) {
      let selSize = this.selection.length;
      let newness = $J.newArray(selSize, false);
      for (let counter = 0; counter < selSize; counter++) {
        newness[counter] = false;
      }
      let event = new TreeSelectionEvent()._TreeSelectionEvent$Object$TreePathArr$booleanArr$TreePath$TreePath(this, this.selection, newness, this.leadPath, null);
      this.leadPath = null;
      this.leadIndex = this.leadRow = -1;
      this.uniquePaths.clear();
      this.selection = null;
      this.resetRowSelection();
      this.fireValueChanged(event);
    }
  }
  /**
   * Adds x to the list of listeners that are notified each time the
   * set of selected TreePaths changes.
   *
   * @param x the new listener to be added
   */
  addTreeSelectionListener(x: TreeSelectionListener): void {
    this.listenerList.add($J.cls(TreeSelectionListener), x);
  }
  /**
   * Removes x from the list of listeners that are notified each time
   * the set of selected TreePaths changes.
   *
   * @param x the listener to remove
   */
  removeTreeSelectionListener(x: TreeSelectionListener): void {
    this.listenerList.remove($J.cls(TreeSelectionListener), x);
  }
  /**
   * Notifies all listeners that are registered for
   * tree selection events on this object.
   *
   * @param e the event that characterizes the change
   *
   * @see #addTreeSelectionListener
   * @see EventListenerList
   */
  fireValueChanged(e: TreeSelectionEvent): void {
    let listeners = this.listenerList.getListenerList();
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(TreeSelectionListener)) {
        (listeners[(i + 1) | 0]).valueChanged(e);
      }
    }
  }
  /**
   * Returns the smallest value obtained from the RowMapper for the
   * current set of selected TreePaths. If nothing is selected,
   * or there is no RowMapper, this will return -1.
   */
  getMinSelectionRow(): number {
    return this.listSelectionModel.getMinSelectionIndex();
  }
  /**
   * Returns true if the row identified by <code>row</code> is selected.
   */
  isRowSelected(row: number): boolean {
    return this.listSelectionModel.isSelectedIndex(row);
  }
  /**
   * Updates this object's mapping from TreePath to rows. This should
   * be invoked when the mapping from TreePaths to integers has changed
   * (for example, a node has been expanded).
   * <p>You do not normally have to call this, JTree and its associated
   * Listeners will invoke this for you. If you are implementing your own
   * View class, then you will have to invoke this.
   * <p>This will invoke <code>insureRowContinuity</code> to make sure
   * the currently selected TreePaths are still valid based on the
   * selection mode.
   */
  resetRowSelection(): void {
    this.listSelectionModel.clearSelection();
    if (this.selection != null && this.rowMapper != null) {
      let aRow: number;
      let validCount = 0;
      let rows = this.rowMapper.getRowsForPaths(this.selection);
      for (let counter = 0, maxCounter = this.selection.length; counter < maxCounter; counter++) {
        aRow = rows[counter];
        if (aRow !== -1) {
          this.listSelectionModel.addSelectionInterval(aRow, aRow);
        }
      }
      if (this.leadIndex !== -1 && rows != null) {
        this.leadRow = rows[this.leadIndex];
      } else if (this.leadPath != null) {
        this.tempPaths[0] = this.leadPath;
        rows = this.rowMapper.getRowsForPaths(this.tempPaths);
        this.leadRow = (rows != null) ? rows[0] : -1;
      } else {
        this.leadRow = -1;
      }
      this.insureRowContinuity();
    } else {
      this.leadRow = -1;
    }
  }
  /**
   * Returns the last path that was added. This may differ from the
   * leadSelectionPath property maintained by the JTree.
   */
  getLeadSelectionPath(): TreePath {
    return this.leadPath;
  }
  /**
   * Adds a PropertyChangeListener to the listener list.
   * The listener is registered for all properties.
   * <p>
   * A PropertyChangeEvent will get fired when the selection mode
   * changes.
   *
   * @param listener  the PropertyChangeListener to be added
   */
  addPropertyChangeListener(listener: PropertyChangeListener): void {
    if (this.changeSupport == null) {
      this.changeSupport = new SwingPropertyChangeSupport()._SwingPropertyChangeSupport$Object(this);
    }
    this.changeSupport.addPropertyChangeListener$PropertyChangeListener(listener);
  }
  /**
   * Removes a PropertyChangeListener from the listener list.
   * This removes a PropertyChangeListener that was registered
   * for all properties.
   *
   * @param listener  the PropertyChangeListener to be removed
   */
  removePropertyChangeListener(listener: PropertyChangeListener): void {
    if (this.changeSupport == null) {
      return;
    }
    this.changeSupport.removePropertyChangeListener$PropertyChangeListener(listener);
  }
  /**
   * Makes sure the currently selected <code>TreePath</code>s are valid
   * for the current selection mode.
   * If the selection mode is <code>CONTIGUOUS_TREE_SELECTION</code>
   * and a <code>RowMapper</code> exists, this will make sure all
   * the rows are contiguous, that is, when sorted all the rows are
   * in order with no gaps.
   * If the selection isn't contiguous, the selection is
   * reset to contain the first set, when sorted, of contiguous rows.
   * <p>
   * If the selection mode is <code>SINGLE_TREE_SELECTION</code> and
   * more than one TreePath is selected, the selection is reset to
   * contain the first path currently selected.
   */
  insureRowContinuity(): void {
    if (this.selectionMode === TreeSelectionModel.CONTIGUOUS_TREE_SELECTION && this.selection != null && this.rowMapper != null) {
      let lModel = this.listSelectionModel;
      let min = lModel.getMinSelectionIndex();
      if (min !== -1) {
        for (let counter = min, maxCounter = lModel.getMaxSelectionIndex(); counter <= maxCounter; counter++) {
          if (!lModel.isSelectedIndex(counter)) {
            if (counter === min) {
              this.clearSelection();
            } else {
              let newSel = $J.newArray((counter - min) | 0, null);
              let selectionIndex = this.rowMapper.getRowsForPaths(this.selection);
              for (let i = 0; i < selectionIndex.length; i++) {
                if (selectionIndex[i] < counter) {
                  (newSel[(selectionIndex[i] - min) | 0]) = this.selection[i];
                }
              }
              this.setSelectionPaths(newSel);
              break;
            }
          }
        }
      }
    } else if (this.selectionMode === TreeSelectionModel.SINGLE_TREE_SELECTION && this.selection != null && this.selection.length > 1) {
      this.setSelectionPath(this.selection[0]);
    }
  }
  /**
   * Returns true if the paths are contiguous,
   * or this object has no RowMapper.
   *
   * @param paths array of paths to check
   * @return      whether the paths are contiguous, or this object has no RowMapper
   */
  arePathsContiguous(paths: TreePath[]): boolean {
    if (this.rowMapper == null || paths.length < 2) {
      return true;
    } else {
      let bitSet = new BitSet(32);
      let anIndex: number;
      let counter: number;
      let min: number;
      let pathCount = paths.length;
      let validCount = 0;
      let tempPath = $J.newArray(1, null);
      tempPath[0] = paths[0];
      min = this.rowMapper.getRowsForPaths(tempPath)[0];
      for (counter = 0; counter < pathCount; counter++) {
        if (paths[counter] != null) {
          tempPath[0] = paths[counter];
          let rows = this.rowMapper.getRowsForPaths(tempPath);
          if (rows == null) {
            return false;
          }
          anIndex = rows[0];
          if (anIndex === -1 || anIndex < ((min - pathCount) | 0) || anIndex > ((min + pathCount) | 0)) {
            return false;
          }
          if (anIndex < min) {
            min = anIndex;
          }
          if (!bitSet.get(anIndex)) {
            bitSet.set(anIndex);
            validCount++;
          }
        }
      }
      let maxCounter = (validCount + min) | 0;
      for (counter = min; counter < maxCounter; counter++) {
        if (!bitSet.get(counter)) {
          return false;
        }
      }
    }
    return true;
  }
  /**
   * Used to test if a particular set of <code>TreePath</code>s can
   * be added. This will return true if <code>paths</code> is null (or
   * empty), or this object has no RowMapper, or nothing is currently selected,
   * or the selection mode is <code>DISCONTIGUOUS_TREE_SELECTION</code>, or
   * adding the paths to the current selection still results in a
   * contiguous set of <code>TreePath</code>s.
   *
   * @param paths array of {@code TreePaths} to check
   * @return      whether the particular set of {@code TreePaths} can be added
   */
  canPathsBeAdded(paths: TreePath[]): boolean {
    if (paths == null || paths.length === 0 || this.rowMapper == null || this.selection == null || this.selectionMode === TreeSelectionModel.DISCONTIGUOUS_TREE_SELECTION) {
      return true;
    } else {
      let bitSet = new BitSet();
      let lModel = this.listSelectionModel;
      let anIndex: number;
      let counter: number;
      let min = lModel.getMinSelectionIndex();
      let max = lModel.getMaxSelectionIndex();
      let tempPath = $J.newArray(1, null);
      if (min !== -1) {
        for (counter = min; counter <= max; counter++) {
          if (lModel.isSelectedIndex(counter)) {
            bitSet.set(counter);
          }
        }
      } else {
        tempPath[0] = paths[0];
        min = max = this.rowMapper.getRowsForPaths(tempPath)[0];
      }
      for (counter = (paths.length - 1) | 0; counter >= 0; counter--) {
        if (paths[counter] != null) {
          tempPath[0] = paths[counter];
          let rows = this.rowMapper.getRowsForPaths(tempPath);
          if (rows == null) {
            return false;
          }
          anIndex = rows[0];
          min = Math.min(anIndex, min);
          max = Math.max(anIndex, max);
          if (anIndex === -1) {
            return false;
          }
          bitSet.set(anIndex);
        }
      }
      for (counter = min; counter <= max; counter++) {
        if (!bitSet.get(counter)) {
          return false;
        }
      }
    }
    return true;
  }
  /**
   * Returns true if the paths can be removed without breaking the
   * continuity of the model.
   * This is rather expensive.
   *
   * @param paths array of {@code TreePath} to check
   * @return      whether the paths can be removed without breaking the
   *              continuity of the model
   */
  canPathsBeRemoved(paths: TreePath[]): boolean {
    if (this.rowMapper == null || this.selection == null || this.selectionMode === TreeSelectionModel.DISCONTIGUOUS_TREE_SELECTION) {
      return true;
    } else {
      let bitSet = new BitSet();
      let counter: number;
      let pathCount = paths.length;
      let anIndex: number;
      let min = -1;
      let validCount = 0;
      let tempPath = $J.newArray(1, null);
      let rows: number[];
      this.lastPaths.clear();
      for (counter = 0; counter < pathCount; counter++) {
        if (paths[counter] != null) {
          this.lastPaths.put(paths[counter], true);
        }
      }
      for (counter = (this.selection.length - 1) | 0; counter >= 0; counter--) {
        if (this.lastPaths.get(this.selection[counter]) == null) {
          tempPath[0] = this.selection[counter];
          rows = this.rowMapper.getRowsForPaths(tempPath);
          if (rows != null && rows[0] !== -1 && !bitSet.get(rows[0])) {
            validCount++;
            if (min === -1) {
              min = rows[0];
            } else {
              min = Math.min(min, rows[0]);
            }
            bitSet.set(rows[0]);
          }
        }
      }
      this.lastPaths.clear();
      if (validCount > 1) {
        for (counter = (min + validCount - 1) | 0; counter >= min; counter--) {
          if (!bitSet.get(counter)) {
            return false;
          }
        }
      }
    }
    return true;
  }
  /**
   * Notifies listeners of a change in path. changePaths should contain
   * instances of PathPlaceHolder.
   *
   * @deprecated As of JDK version 1.7
   *
   * @param changedPaths      the vector of the changed paths
   * @param oldLeadSelection  the old selection path
   */
  notifyPathChange(changedPaths: Vector<any>, oldLeadSelection: TreePath): void {
    let cPathCount = changedPaths.size();
    let newness = $J.newArray(cPathCount, false);
    let paths = $J.newArray(cPathCount, null);
    let placeholder: PathPlaceHolder;
    for (let counter = 0; counter < cPathCount; counter++) {
      placeholder = changedPaths.elementAt(counter);
      newness[counter] = placeholder.isNew;
      paths[counter] = placeholder.path;
    }
    let event = new TreeSelectionEvent()._TreeSelectionEvent$Object$TreePathArr$booleanArr$TreePath$TreePath(this, paths, newness, oldLeadSelection, this.leadPath);
    this.fireValueChanged(event);
  }
  /**
   * Updates the leadIndex instance variable.
   */
  updateLeadIndex(): void {
    if (this.leadPath != null) {
      if (this.selection == null) {
        this.leadPath = null;
        this.leadIndex = this.leadRow = -1;
      } else {
        this.leadRow = this.leadIndex = -1;
        for (let counter = (this.selection.length - 1) | 0; counter >= 0; counter--) {
          if (this.selection[counter] === this.leadPath) {
            this.leadIndex = counter;
            break;
          }
        }
      }
    } else {
      this.leadIndex = -1;
    }
  }
  /**
   * This method is obsolete and its implementation is now a noop.  It's
   * still called by setSelectionPaths and addSelectionPaths, but only
   * for backwards compatibility.
   */
  insureUniqueness(): void {
  }
  /**
   * Returns a string that displays and identifies this
   * object's properties.
   *
   * @return a String representation of this object
   */
  toString(): string {
    let selCount = this.getSelectionCount();
    let sb = new StringBuilder();
    let rows: number[];
    if (this.rowMapper != null) {
      rows = this.rowMapper.getRowsForPaths(this.selection);
    } else {
      rows = null;
    }
    sb.append($J.getClass(this).getName() + ' ' + $J.hashCode(this) + ' [ ');
    for (let counter = 0; counter < selCount; counter++) {
      if (rows != null) {
        sb.append($J.str(this.selection[counter]) + '@' + rows[counter] + ' ');
      } else {
        sb.append($J.str(this.selection[counter]) + ' ');
      }
    }
    sb.append(']');
    return sb.toString();
  }
  /**
   * Returns a clone of this object with the same selection.
   * This method does not duplicate
   * selection listeners and property listeners.
   *
   * @throws CloneNotSupportedException never thrown by instances of
   *                                       this class
   */
  clone(): any {
    let clone = super.clone();
    clone.changeSupport = null;
    if (this.selection != null) {
      let selLength = this.selection.length;
      clone.selection = $J.newArray(selLength, null);
      $J.system_arraycopy(this.selection, 0, clone.selection, 0, selLength);
    }
    clone.listenerList = new EventListenerList()._EventListenerList();
    clone.listSelectionModel = this.listSelectionModel.clone();
    clone.uniquePaths = new Hashtable();
    clone.lastPaths = new Hashtable();
    clone.tempPaths = $J.newArray(1, null);
    return clone;
  }
}

$J.define(DefaultTreeSelectionModel, 'javax.swing.tree.DefaultTreeSelectionModel', { kind: 'class', ifaces: ['java.lang.Cloneable', 'java.io.Serializable', 'javax.swing.tree.TreeSelectionModel'], sup: 'java.lang.Object', ctors: { '': '_DefaultTreeSelectionModel' } });
$J.module(() => {
  DefaultListSelectionModel = $J.load('javax.swing.DefaultListSelectionModel');
  EventListenerList = $J.load('javax.swing.event.EventListenerList');
  SwingPropertyChangeSupport = $J.load('javax.swing.event.SwingPropertyChangeSupport');
  TreeSelectionEvent = $J.load('javax.swing.event.TreeSelectionEvent');
  TreeSelectionListener = $J.load('javax.swing.event.TreeSelectionListener');
  PathPlaceHolder = $J.load('javax.swing.tree.PathPlaceHolder');
  TreeSelectionModel = $J.load('javax.swing.tree.TreeSelectionModel');
});
