// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicDirectoryModel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2024, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AtomicInteger, JObject, ShellFolder, Thread, Vector } from '../../../../../jre/index.ts';
import { AbstractListModel } from '../../AbstractListModel.ts';

let PropertyChangeSupport, JFileChooser, SwingUtilities, BasicFileChooserUI;

/**
 * Basic implementation of a file list.
 *
 * @author Jeff Dinkins
 */
export class BasicDirectoryModel extends AbstractListModel {
  filechooser: JFileChooser = null;
  fileCache: Vector<File> = null;
  filesLoader: BasicDirectoryModel$FilesLoader = null;
  files: Vector<File> = null;
  directories: Vector<File> = null;
  fetchID: AtomicInteger = null;
  changeSupport: PropertyChangeSupport = null;
  busy: boolean = false;
  /**
   * Constructs a new instance of {@code BasicDirectoryModel}.
   *
   * @param filechooser an instance of {JFileChooser}
   */
  _BasicDirectoryModel(filechooser: JFileChooser): this {
    this._AbstractListModel();
    this.fileCache = new Vector(50);
    this.filesLoader = null;
    this.files = null;
    this.directories = null;
    this.fetchID = new AtomicInteger();
    this.busy = false;
    this.filechooser = filechooser;
    this.validateFileCache();
    return this;
  }
  propertyChange(e: PropertyChangeEvent): void {
    let prop = e.getPropertyName();
    if (prop === JFileChooser.DIRECTORY_CHANGED_PROPERTY || prop === JFileChooser.FILE_VIEW_CHANGED_PROPERTY || prop === JFileChooser.FILE_FILTER_CHANGED_PROPERTY || prop === JFileChooser.FILE_HIDING_CHANGED_PROPERTY || prop === JFileChooser.FILE_SELECTION_MODE_CHANGED_PROPERTY) {
      this.validateFileCache();
    } else if ($J.equals('UI', prop)) {
      let old = e.getOldValue();
      if (old instanceof BasicFileChooserUI) {
        let ui = old;
        let model = ui.getModel();
        if (model != null) {
          model.invalidateFileCache();
        }
      }
    } else if ($J.equals('JFileChooserDialogIsClosingProperty', prop)) {
      this.invalidateFileCache();
    }
  }
  /**
   * This method is used to interrupt file loading thread.
   */
  invalidateFileCache(): void {
    {
      if (this.filesLoader != null) {
        this.filesLoader.loadThread.interrupt();
        this.filesLoader = null;
        this.fetchID.incrementAndGet();
      }
    }
  }
  /**
   * Validates content of file cache.
   */
  validateFileCache(): void {
    let currentDirectory = this.filechooser.getCurrentDirectory();
    if (currentDirectory == null) {
      return;
    }
    {
      if (this.filesLoader != null) {
        this.filesLoader.loadThread.interrupt();
      }
      let fid = this.fetchID.incrementAndGet();
      this.setBusy(true, fid);
      this.filesLoader = new BasicDirectoryModel$FilesLoader().$o(this)._BasicDirectoryModel$FilesLoader(currentDirectory, fid);
    }
  }
  /**
   * Renames a file in the underlying file system.
   *
   * @param oldFile a <code>File</code> object representing
   *        the existing file
   * @param newFile a <code>File</code> object representing
   *        the desired new file name
   * @return <code>true</code> if rename succeeded,
   *        otherwise <code>false</code>
   * @since 1.4
   */
  renameFile(oldFile: File, newFile: File): boolean {
    {
      if (oldFile.renameTo(newFile)) {
        this.validateFileCache();
        return true;
      }
      return false;
    }
  }
  /**
   * Invoked when a content is changed.
   */
  fireContentsChanged$(): void {
    this.fireContentsChanged$Object$int$int(this, 0, (this.getSize() - 1) | 0);
  }
  getSize(): number {
    return this.fileCache.size();
  }
  /**
   * Returns an index of element {@code o} in file cache.
   *
   * @param o an element
   * @return an index of element {@code o} in file cache
   */
  indexOf(o: any): number {
    return this.fileCache.indexOf(o);
  }
  getElementAt(index: number): any {
    return this.fileCache.get(index);
  }
  /**
   * Sorts a list of files.
   *
   * @param v a list of files
   */
  sort(v: Vector<File>): void {
    ShellFolder.sort(v);
  }
  /**
   * Adds a PropertyChangeListener to the listener list. The listener is
   * registered for all bound properties of this class.
   * <p>
   * If <code>listener</code> is <code>null</code>,
   * no exception is thrown and no action is performed.
   *
   * @param    listener  the property change listener to be added
   *
   * @see #removePropertyChangeListener
   * @see #getPropertyChangeListeners
   *
   * @since 1.6
   */
  addPropertyChangeListener(listener: PropertyChangeListener): void {
    if (this.changeSupport == null) {
      this.changeSupport = new PropertyChangeSupport()._PropertyChangeSupport(this);
    }
    this.changeSupport.addPropertyChangeListener$PropertyChangeListener(listener);
  }
  /**
   * Removes a PropertyChangeListener from the listener list.
   * <p>
   * If listener is null, no exception is thrown and no action is performed.
   *
   * @param listener the PropertyChangeListener to be removed
   *
   * @see #addPropertyChangeListener
   * @see #getPropertyChangeListeners
   *
   * @since 1.6
   */
  removePropertyChangeListener(listener: PropertyChangeListener): void {
    if (this.changeSupport != null) {
      this.changeSupport.removePropertyChangeListener$PropertyChangeListener(listener);
    }
  }
  /**
   * Support for reporting bound property changes for boolean properties.
   * This method can be called when a bound property has changed and it will
   * send the appropriate PropertyChangeEvent to any registered
   * PropertyChangeListeners.
   *
   * @param propertyName the property whose value has changed
   * @param oldValue the property's previous value
   * @param newValue the property's new value
   *
   * @since 1.6
   */
  firePropertyChange(propertyName: string, oldValue: any, newValue: any): void {
    if (this.changeSupport != null) {
      this.changeSupport.firePropertyChange$String$Object$Object(propertyName, oldValue, newValue);
    }
  }
  /**
   * Set the busy state for the model. The model is considered
   * busy when it is running a separate (interruptible)
   * thread in order to load the contents of a directory.
   */
  setBusy(busy: boolean, fid: number): void {
    if (fid === this.fetchID.get()) {
      let oldValue = this.busy;
      this.busy = busy;
      if (this.changeSupport != null && busy !== oldValue) {
        SwingUtilities.invokeLater(() => {
          this.firePropertyChange('busy', !busy, busy);
        });
      }
    }
  }
}

export class BasicDirectoryModel$FilesLoader extends JObject {
  fileSystemView: FileSystemView = null;
  useFileHiding: boolean = false;
  fileSelectionEnabled: boolean = false;
  fid: number = 0;
  currentDirectory: File = null;
  loadThread: Thread = null;
  _BasicDirectoryModel$FilesLoader(currentDirectory: File, fid: number): this {
    this.currentDirectory = currentDirectory;
    this.fid = fid;
    this.fileSystemView = this.$outer.filechooser.getFileSystemView();
    this.useFileHiding = this.$outer.filechooser.isFileHidingEnabled();
    this.fileSelectionEnabled = this.$outer.filechooser.isFileSelectionEnabled();
    let name = 'Basic L&F File Loading Thread';
    this.loadThread = new Thread(null, $J.fn(this, 'run'), name, 0, false);
    this.loadThread.start();
    return this;
  }
  run(): void {
    this.run0();
    this.$outer.setBusy(false, this.fid);
  }
  run0(): void {
    if (this.loadThread.isInterrupted()) {
      return;
    }
    let list = this.fileSystemView.getFiles(this.currentDirectory, this.useFileHiding);
    if (this.loadThread.isInterrupted()) {
      return;
    }
    let newFileCache = new Vector();
    let newFiles = new Vector();
    for (let file of list) {
      if (this.$outer.filechooser.accept(file)) {
        let isTraversable = this.$outer.filechooser.isTraversable(file);
        if (isTraversable) {
          newFileCache.addElement(file);
        } else if (this.fileSelectionEnabled) {
          newFiles.addElement(file);
        }
        if (this.loadThread.isInterrupted()) {
          return;
        }
      }
    }
    this.$outer.sort(newFileCache);
    this.$outer.sort(newFiles);
    newFileCache.addAll(newFiles);
    let runnable = ShellFolder.invoke(() => {
      {
        let newSize = newFileCache.size();
        let oldSize = this.$outer.fileCache.size();
        if (newSize > oldSize) {
          let start = oldSize;
          let end = newSize;
          for (let i = 0; i < oldSize; i++) {
            if (!newFileCache.get(i).equals(this.$outer.fileCache.get(i))) {
              start = i;
              for (let j = i; j < newSize; j++) {
                if (newFileCache.get(j).equals(this.$outer.fileCache.get(i))) {
                  end = j;
                  break;
                }
              }
              break;
            }
          }
          if (start >= 0 && end > start && newFileCache.subList(end, newSize).equals(this.$outer.fileCache.subList(start, oldSize))) {
            if (this.loadThread.isInterrupted()) {
              return null;
            }
            return new BasicDirectoryModel$DoChangeContents().$o(this.$outer)._BasicDirectoryModel$DoChangeContents(newFileCache.subList(start, end), start, null, 0, this.fid);
          }
        } else if (newSize < oldSize) {
          let start = -1;
          let end = -1;
          for (let i = 0; i < newSize; i++) {
            if (!newFileCache.get(i).equals(this.$outer.fileCache.get(i))) {
              start = i;
              end = (i + oldSize - newSize) | 0;
              break;
            }
          }
          if (start >= 0 && end > start && this.$outer.fileCache.subList(end, oldSize).equals(newFileCache.subList(start, newSize))) {
            if (this.loadThread.isInterrupted()) {
              return null;
            }
            return new BasicDirectoryModel$DoChangeContents().$o(this.$outer)._BasicDirectoryModel$DoChangeContents(null, 0, new Vector(this.$outer.fileCache.subList(start, end)), start, this.fid);
          }
        }
        if (!this.$outer.fileCache.equals(newFileCache)) {
          if (this.loadThread.isInterrupted()) {
            return null;
          }
          return new BasicDirectoryModel$DoChangeContents().$o(this.$outer)._BasicDirectoryModel$DoChangeContents(newFileCache, 0, this.$outer.fileCache, 0, this.fid);
        }
        return null;
      }
    });
    if (runnable != null && !this.loadThread.isInterrupted()) {
      SwingUtilities.invokeLater($J.fn(runnable, 'run'));
    }
  }
}

export class BasicDirectoryModel$DoChangeContents extends JObject {
  addFiles: List<File> = null;
  remFiles: List<File> = null;
  fid: number = 0;
  addStart: number = 0;
  remStart: number = 0;
  _BasicDirectoryModel$DoChangeContents(addFiles: List<File>, addStart: number, remFiles: List<File>, remStart: number, fid: number): this {
    this.addFiles = addFiles;
    this.addStart = addStart;
    this.remFiles = remFiles;
    this.remStart = remStart;
    this.fid = fid;
    return this;
  }
  run(): void {
    if (this.$outer.fetchID.get() !== this.fid) {
      return;
    }
    let remSize = (this.remFiles == null) ? 0 : this.remFiles.size();
    let addSize = (this.addFiles == null) ? 0 : this.addFiles.size();
    let cacheSize: number;
    {
      if (remSize > 0) {
        this.$outer.fileCache.removeAll(this.remFiles);
      }
      if (addSize > 0) {
        this.$outer.fileCache.addAll(this.addStart, this.addFiles);
      }
      this.$outer.files = null;
      this.$outer.directories = null;
      cacheSize = this.$outer.fileCache.size();
    }
    if (remSize > 0 && addSize === 0) {
      this.$outer.fireIntervalRemoved(this.$outer, this.remStart, (this.remStart + remSize - 1) | 0);
    } else if (addSize > 0 && remSize === 0 && ((this.addStart + addSize) | 0) <= cacheSize) {
      this.$outer.fireIntervalAdded(this.$outer, this.addStart, (this.addStart + addSize - 1) | 0);
    } else {
      this.$outer.fireContentsChanged$();
    }
  }
}

$J.define(BasicDirectoryModel, 'javax.swing.plaf.basic.BasicDirectoryModel', { kind: 'class', ifaces: ['java.beans.PropertyChangeListener'], sup: 'javax.swing.AbstractListModel', ctors: { 'javax.swing.JFileChooser': '_BasicDirectoryModel' }, meths: { 'fireContentsChanged()': 'fireContentsChanged$' } });
$J.define(BasicDirectoryModel$FilesLoader, 'javax.swing.plaf.basic.BasicDirectoryModel$FilesLoader', { kind: 'class', ifaces: ['java.lang.Runnable'], sup: 'java.lang.Object', ctors: { 'java.io.File,int': '_BasicDirectoryModel$FilesLoader' }, inner: true });
$J.define(BasicDirectoryModel$DoChangeContents, 'javax.swing.plaf.basic.BasicDirectoryModel$DoChangeContents', { kind: 'class', ifaces: ['java.lang.Runnable'], sup: 'java.lang.Object', ctors: { 'java.util.List,int,java.util.List,int,int': '_BasicDirectoryModel$DoChangeContents' }, inner: true });
$J.module(() => {
  PropertyChangeSupport = $J.load('java.beans.PropertyChangeSupport');
  JFileChooser = $J.load('javax.swing.JFileChooser');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  BasicFileChooserUI = $J.load('javax.swing.plaf.basic.BasicFileChooserUI');
});
