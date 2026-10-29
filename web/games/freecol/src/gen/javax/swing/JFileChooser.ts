// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JFileChooser.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2022, Oracle and/or its affiliates. All rights reserved.
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
import { $J, ArrayList, FileSystemView, IllegalArgumentException, JBoolean, JObject, Toolkit, Vector, WeakReference } from '../../../jre/index.ts';
import { JComponent } from './JComponent.ts';
import { JComponent$AccessibleJComponent } from './JComponent.ts';

let AWTEvent, EventQueue, ActionEvent, ActionListener, HierarchyEvent, InputEvent, SwingUtilities, UIManager;

/**
 * <code>JFileChooser</code> provides a simple mechanism for the user to
 * choose a file.
 * For information about using <code>JFileChooser</code>, see
 * <a
 * href="https://docs.oracle.com/javase/tutorial/uiswing/components/filechooser.html">How to Use File Choosers</a>,
 * a section in <em>The Java Tutorial</em>.
 *
 * <p>
 *
 * The following code pops up a file chooser for the user's home directory that
 * sees only .jpg and .gif images:
 * <pre>
 *    JFileChooser chooser = new JFileChooser();
 *    FileNameExtensionFilter filter = new FileNameExtensionFilter(
 *        "JPG &amp; GIF Images", "jpg", "gif");
 *    chooser.setFileFilter(filter);
 *    int returnVal = chooser.showOpenDialog(parent);
 *    if(returnVal == JFileChooser.APPROVE_OPTION) {
 *       System.out.println("You chose to open this file: " +
 *            chooser.getSelectedFile().getName());
 *    }
 * </pre>
 * <p>
 * <strong>Warning:</strong> Swing is not thread safe. For more
 * information see <a
 * href="package-summary.html#threading">Swing's Threading
 * Policy</a>.
 *
 * @author Jeff Dinkins
 * @since 1.2
 */
export class JFileChooser extends JComponent {
  /**
   * @see #getUIClassID
   * @see #readObject
   */
  static readonly uiClassID: string = 'FileChooserUI';
  /**
   * Type value indicating that the <code>JFileChooser</code> supports an
   * "Open" file operation.
   */
  static readonly OPEN_DIALOG: number = 0;
  /**
   * Type value indicating that the <code>JFileChooser</code> supports a
   * "Save" file operation.
   */
  static readonly SAVE_DIALOG: number = 1;
  /**
   * Type value indicating that the <code>JFileChooser</code> supports a
   * developer-specified file operation.
   */
  static readonly CUSTOM_DIALOG: number = 2;
  /**
   * Return value if cancel is chosen.
   */
  static readonly CANCEL_OPTION: number = 1;
  /**
   * Return value if approve (yes, ok) is chosen.
   */
  static readonly APPROVE_OPTION: number = 0;
  /**
   * Return value if an error occurred.
   */
  static readonly ERROR_OPTION: number = -1;
  /**
   * Instruction to display only files.
   */
  static readonly FILES_ONLY: number = 0;
  /**
   * Instruction to display only directories.
   */
  static readonly DIRECTORIES_ONLY: number = 1;
  /**
   * Instruction to display both files and directories.
   */
  static readonly FILES_AND_DIRECTORIES: number = 2;
  /**
   * Instruction to cancel the current selection.
   */
  static readonly CANCEL_SELECTION: string = 'CancelSelection';
  /**
   * Instruction to approve the current selection
   * (same as pressing yes or ok).
   */
  static readonly APPROVE_SELECTION: string = 'ApproveSelection';
  /**
   * Identifies change in the text on the approve (yes, ok) button.
   */
  static readonly APPROVE_BUTTON_TEXT_CHANGED_PROPERTY: string = 'ApproveButtonTextChangedProperty';
  /**
   * Identifies change in the tooltip text for the approve (yes, ok)
   * button.
   */
  static readonly APPROVE_BUTTON_TOOL_TIP_TEXT_CHANGED_PROPERTY: string = 'ApproveButtonToolTipTextChangedProperty';
  /**
   * Identifies change in the mnemonic for the approve (yes, ok) button.
   */
  static readonly APPROVE_BUTTON_MNEMONIC_CHANGED_PROPERTY: string = 'ApproveButtonMnemonicChangedProperty';
  /**
   * Instruction to display the control buttons.
   */
  static readonly CONTROL_BUTTONS_ARE_SHOWN_CHANGED_PROPERTY: string = 'ControlButtonsAreShownChangedProperty';
  /**
   * Identifies user's directory change.
   */
  static readonly DIRECTORY_CHANGED_PROPERTY: string = 'directoryChanged';
  /**
   * Identifies change in user's single-file selection.
   */
  static readonly SELECTED_FILE_CHANGED_PROPERTY: string = 'SelectedFileChangedProperty';
  /**
   * Identifies change in user's multiple-file selection.
   */
  static readonly SELECTED_FILES_CHANGED_PROPERTY: string = 'SelectedFilesChangedProperty';
  /**
   * Enables multiple-file selections.
   */
  static readonly MULTI_SELECTION_ENABLED_CHANGED_PROPERTY: string = 'MultiSelectionEnabledChangedProperty';
  /**
   * Says that a different object is being used to find available drives
   * on the system.
   */
  static readonly FILE_SYSTEM_VIEW_CHANGED_PROPERTY: string = 'FileSystemViewChanged';
  /**
   * Says that a different object is being used to retrieve file
   * information.
   */
  static readonly FILE_VIEW_CHANGED_PROPERTY: string = 'fileViewChanged';
  /**
   * Identifies a change in the display-hidden-files property.
   */
  static readonly FILE_HIDING_CHANGED_PROPERTY: string = 'FileHidingChanged';
  /**
   * User changed the kind of files to display.
   */
  static readonly FILE_FILTER_CHANGED_PROPERTY: string = 'fileFilterChanged';
  /**
   * Identifies a change in the kind of selection (single,
   * multiple, etc.).
   */
  static readonly FILE_SELECTION_MODE_CHANGED_PROPERTY: string = 'fileSelectionChanged';
  /**
   * Says that a different accessory component is in use
   * (for example, to preview files).
   */
  static readonly ACCESSORY_CHANGED_PROPERTY: string = 'AccessoryChangedProperty';
  /**
   * Identifies whether the AcceptAllFileFilter is used or not.
   */
  static readonly ACCEPT_ALL_FILE_FILTER_USED_CHANGED_PROPERTY: string = 'acceptAllFileFilterUsedChanged';
  /**
   * Identifies a change in the dialog title.
   */
  static readonly DIALOG_TITLE_CHANGED_PROPERTY: string = 'DialogTitleChangedProperty';
  /**
   * Identifies a change in the type of files displayed (files only,
   * directories only, or both files and directories).
   */
  static readonly DIALOG_TYPE_CHANGED_PROPERTY: string = 'DialogTypeChangedProperty';
  /**
   * Identifies a change in the list of predefined file filters
   * the user can choose from.
   */
  static readonly CHOOSABLE_FILE_FILTER_CHANGED_PROPERTY: string = 'ChoosableFileFilterChangedProperty';
  dialogTitle: string = null;
  approveButtonText: string = null;
  approveButtonToolTipText: string = null;
  approveButtonMnemonic: number = 0;
  filters: Vector<FileFilter> = null;
  dialog: JDialog = null;
  dialogType: number = 0;
  returnValue: number = 0;
  accessory: JComponent = null;
  fileView: FileView = null;
  controlsShown: boolean = false;
  useFileHiding: boolean = false;
  static readonly SHOW_HIDDEN_PROP: string = 'awt.file.showHiddenFiles';
  showFilesListener: PropertyChangeListener = null;
  fileSelectionMode: number = 0;
  multiSelectionEnabled: boolean = false;
  useAcceptAllFileFilter: boolean = false;
  dragEnabled: boolean = false;
  fileFilter: FileFilter = null;
  fileSystemView: FileSystemView = null;
  currentDirectory: File = null;
  selectedFile: File = null;
  selectedFiles: File[] = null;
  /**
   * {@code AccessibleContext} associated with this {@code JFileChooser}
   */
  accessibleContext$JFileChooser: AccessibleContext = null;
  $init_JFileChooser() {
    this.dialogTitle = null;
    this.approveButtonText = null;
    this.approveButtonToolTipText = null;
    this.approveButtonMnemonic = 0;
    this.filters = new Vector(5);
    this.dialog = null;
    this.dialogType = JFileChooser.OPEN_DIALOG;
    this.returnValue = JFileChooser.ERROR_OPTION;
    this.accessory = null;
    this.fileView = null;
    this.controlsShown = true;
    this.useFileHiding = true;
    this.showFilesListener = null;
    this.fileSelectionMode = JFileChooser.FILES_ONLY;
    this.multiSelectionEnabled = false;
    this.useAcceptAllFileFilter = true;
    this.dragEnabled = false;
    this.fileFilter = null;
    this.fileSystemView = null;
    this.currentDirectory = null;
    this.selectedFile = null;
    this.accessibleContext$JFileChooser = null;
  }
  /**
   * Constructs a <code>JFileChooser</code> using the given <code>File</code>
   * as the path. Passing in a <code>null</code> file
   * causes the file chooser to point to the user's default directory.
   * This default depends on the operating system. It is
   * typically the "Documents" folder on Windows, and the user's
   * home directory on Unix.
   *
   * @param currentDirectory  a <code>File</code> object specifying
   *                          the path to a file or directory
   */
  _JFileChooser$File(currentDirectory: File): this {
    this._JFileChooser$File$FileSystemView(currentDirectory, null);
    return this;
  }
  /**
   * Constructs a <code>JFileChooser</code> using the given current directory
   * and <code>FileSystemView</code>.
   *
   * @param currentDirectory a {@code File} object specifying the path to a
   *                         file or directory
   * @param fsv a {@code FileSystemView}
   */
  _JFileChooser$File$FileSystemView(currentDirectory: File, fsv: FileSystemView): this {
    this._JComponent();
    this.$init_JFileChooser();
    this.setup(fsv);
    this.setCurrentDirectory(currentDirectory);
    return this;
  }
  /**
   * Performs common constructor initialization and setup.
   *
   * @param view the {@code FileSystemView} used for setup
   */
  setup(view: FileSystemView): void {
    this.installShowFilesListener();
    this.installHierarchyListener();
    if (view == null) {
      view = FileSystemView.getFileSystemView();
    }
    this.setFileSystemView(view);
    this.updateUI();
    if (this.isAcceptAllFileFilterUsed()) {
      this.setFileFilter(this.getAcceptAllFileFilter());
    }
    this.enableEvents(AWTEvent.MOUSE_EVENT_MASK);
    this.putClientProperty('html.disable', true);
  }
  installHierarchyListener(): void {
    this.addHierarchyListener($J.fn(new JFileChooser$FCHierarchyListener().$o(this)._JFileChooser$FCHierarchyListener(), 'hierarchyChanged'));
  }
  installShowFilesListener(): void {
    let tk = Toolkit.getDefaultToolkit();
    let showHiddenProperty = tk.getDesktopProperty(JFileChooser.SHOW_HIDDEN_PROP);
    if ($J.isa(showHiddenProperty, JBoolean)) {
      this.useFileHiding = !(showHiddenProperty);
      this.showFilesListener = $J.fn(new JFileChooser$WeakPCL()._JFileChooser$WeakPCL(this), 'propertyChange');
      tk.addPropertyChangeListener(JFileChooser.SHOW_HIDDEN_PROP, this.showFilesListener);
    }
  }
  /**
   * Gets the value of the <code>dragEnabled</code> property.
   *
   * @return  the value of the <code>dragEnabled</code> property
   * @see #setDragEnabled
   * @since 1.4
   */
  getDragEnabled(): boolean {
    return this.dragEnabled;
  }
  /**
   * Returns the selected file. This can be set either by the
   * programmer via <code>setSelectedFile</code> or by a user action, such as
   * either typing the filename into the UI or selecting the
   * file from a list in the UI.
   *
   * @see #setSelectedFile
   * @return the selected file
   */
  getSelectedFile(): File {
    return this.selectedFile;
  }
  /**
   * Sets the selected file. If the file's parent directory is
   * not the current directory, changes the current directory
   * to be the file's parent directory.
   *
   * @see #getSelectedFile
   *
   * @param file the selected file
   */
  setSelectedFile(file: File): void {
    let oldValue = this.selectedFile;
    this.selectedFile = file;
    if (this.selectedFile != null) {
      if (file.isAbsolute() && !this.getFileSystemView().isParent(this.getCurrentDirectory(), this.selectedFile)) {
        this.setCurrentDirectory(this.selectedFile.getParentFile());
      }
      if (!this.isMultiSelectionEnabled() || this.selectedFiles == null || this.selectedFiles.length === 1) {
        this.ensureFileIsVisible(this.selectedFile);
      }
    }
    this.firePropertyChange$String$Object$Object(JFileChooser.SELECTED_FILE_CHANGED_PROPERTY, oldValue, this.selectedFile);
  }
  /**
   * Returns a list of selected files if the file chooser is
   * set to allow multiple selection.
   *
   * @return an array of selected {@code File}s
   */
  getSelectedFiles(): File[] {
    if (this.selectedFiles == null) {
      return $J.newArray(0, null);
    } else {
      return this.selectedFiles.slice();
    }
  }
  /**
   * Sets the list of selected files if the file chooser is
   * set to allow multiple selection.
   *
   * @param selectedFiles an array {@code File}s to be selected
   */
  setSelectedFiles(selectedFiles: File[]): void {
    let oldValue = this.selectedFiles;
    if (selectedFiles == null || selectedFiles.length === 0) {
      selectedFiles = null;
      this.selectedFiles = null;
      this.setSelectedFile(null);
    } else {
      this.selectedFiles = selectedFiles.slice();
      this.setSelectedFile(this.selectedFiles[0]);
    }
    this.firePropertyChange$String$Object$Object(JFileChooser.SELECTED_FILES_CHANGED_PROPERTY, oldValue, selectedFiles);
  }
  /**
   * Returns the current directory.
   *
   * @return the current directory
   * @see #setCurrentDirectory
   */
  getCurrentDirectory(): File {
    return this.currentDirectory;
  }
  /**
   * Sets the current directory. Passing in <code>null</code> sets the
   * file chooser to point to the user's default directory.
   * This default depends on the operating system. It is
   * typically the "Documents" folder on Windows, and the user's
   * home directory on Unix.
   *
   * If the file passed in as <code>currentDirectory</code> is not a
   * directory, the parent of the file will be used as the currentDirectory.
   * If the parent is not traversable, then it will walk up the parent tree
   * until it finds a traversable directory, or hits the root of the
   * file system.
   *
   * @param dir the current directory to point to
   * @see #getCurrentDirectory
   */
  setCurrentDirectory(dir: File): void {
    let oldValue = this.currentDirectory;
    if (dir != null && !dir.exists()) {
      dir = this.currentDirectory;
    }
    if (dir == null) {
      dir = this.getFileSystemView().getDefaultDirectory();
    }
    if (this.currentDirectory != null) {
      if (this.currentDirectory.equals(dir)) {
        return;
      }
    }
    let prev = null;
    while (!this.isTraversable(dir) && prev !== dir) {
      prev = dir;
      dir = this.getFileSystemView().getParentDirectory(dir);
    }
    this.currentDirectory = dir;
    this.firePropertyChange$String$Object$Object(JFileChooser.DIRECTORY_CHANGED_PROPERTY, oldValue, this.currentDirectory);
  }
  /**
   * Changes the directory to be set to the parent of the
   * current directory.
   *
   * @see #getCurrentDirectory
   */
  changeToParentDirectory(): void {
    this.selectedFile = null;
    let oldValue = this.getCurrentDirectory();
    this.setCurrentDirectory(this.getFileSystemView().getParentDirectory(oldValue));
  }
  /**
   * Tells the UI to rescan its files list from the current directory.
   */
  rescanCurrentDirectory(): void {
    this.getUI().rescanCurrentDirectory(this);
  }
  /**
   * Makes sure that the specified file is viewable, and
   * not hidden.
   *
   * @param f  a File object
   */
  ensureFileIsVisible(f: File): void {
    this.getUI().ensureFileIsVisible(this, f);
  }
  /**
   * Returns the value of the <code>controlButtonsAreShown</code>
   * property.
   *
   * @return   the value of the <code>controlButtonsAreShown</code>
   *     property
   *
   * @see #setControlButtonsAreShown
   * @since 1.3
   */
  getControlButtonsAreShown(): boolean {
    return this.controlsShown;
  }
  /**
   * Sets the property
   * that indicates whether the <i>approve</i> and <i>cancel</i>
   * buttons are shown in the file chooser.  This property
   * is <code>true</code> by default.  Look and feels
   * that always show these buttons will ignore the value
   * of this property.
   * This method fires a property-changed event,
   * using the string value of
   * <code>CONTROL_BUTTONS_ARE_SHOWN_CHANGED_PROPERTY</code>
   * as the name of the property.
   *
   * @param b <code>false</code> if control buttons should not be
   *    shown; otherwise, <code>true</code>
   *
   * @see #getControlButtonsAreShown
   * @see #CONTROL_BUTTONS_ARE_SHOWN_CHANGED_PROPERTY
   * @since 1.3
   */
  setControlButtonsAreShown(b: boolean): void {
    if (this.controlsShown === b) {
      return;
    }
    let oldValue = this.controlsShown;
    this.controlsShown = b;
    this.firePropertyChange$String$boolean$boolean(JFileChooser.CONTROL_BUTTONS_ARE_SHOWN_CHANGED_PROPERTY, oldValue, this.controlsShown);
  }
  /**
   * Returns the type of this dialog.  The default is
   * <code>JFileChooser.OPEN_DIALOG</code>.
   *
   * @return   the type of dialog to be displayed:
   * <ul>
   * <li>JFileChooser.OPEN_DIALOG
   * <li>JFileChooser.SAVE_DIALOG
   * <li>JFileChooser.CUSTOM_DIALOG
   * </ul>
   *
   * @see #setDialogType
   */
  getDialogType(): number {
    return this.dialogType;
  }
  /**
   * Sets the type of this dialog. Use <code>OPEN_DIALOG</code> when you
   * want to bring up a file chooser that the user can use to open a file.
   * Likewise, use <code>SAVE_DIALOG</code> for letting the user choose
   * a file for saving.
   * Use <code>CUSTOM_DIALOG</code> when you want to use the file
   * chooser in a context other than "Open" or "Save".
   * For instance, you might want to bring up a file chooser that allows
   * the user to choose a file to execute. Note that you normally would not
   * need to set the <code>JFileChooser</code> to use
   * <code>CUSTOM_DIALOG</code>
   * since a call to <code>setApproveButtonText</code> does this for you.
   * The default dialog type is <code>JFileChooser.OPEN_DIALOG</code>.
   *
   * @param dialogType the type of dialog to be displayed:
   * <ul>
   * <li>JFileChooser.OPEN_DIALOG
   * <li>JFileChooser.SAVE_DIALOG
   * <li>JFileChooser.CUSTOM_DIALOG
   * </ul>
   *
   * @throws IllegalArgumentException if <code>dialogType</code> is
   *                          not legal
   *
   * @see #getDialogType
   * @see #setApproveButtonText
   */
  setDialogType(dialogType: number): void {
    if (this.dialogType === dialogType) {
      return;
    }
    JFileChooser.checkDialogType(dialogType);
    let oldValue = this.dialogType;
    this.dialogType = dialogType;
    if (dialogType === JFileChooser.OPEN_DIALOG || dialogType === JFileChooser.SAVE_DIALOG) {
      this.setApproveButtonText(null);
    }
    this.firePropertyChange$String$int$int(JFileChooser.DIALOG_TYPE_CHANGED_PROPERTY, oldValue, dialogType);
  }
  static checkDialogType(dialogType: number): void {
    if (!(dialogType === JFileChooser.OPEN_DIALOG || dialogType === JFileChooser.SAVE_DIALOG || dialogType === JFileChooser.CUSTOM_DIALOG)) {
      throw new IllegalArgumentException('Incorrect Dialog Type: ' + dialogType);
    }
  }
  /**
   * Returns the tooltip text used in the <code>ApproveButton</code>.
   * If <code>null</code>, the UI object will determine the button's text.
   *
   * @return the tooltip text used for the approve button
   *
   * @see #setApproveButtonText
   * @see #setDialogType
   * @see #showDialog
   */
  getApproveButtonToolTipText(): string {
    return this.approveButtonToolTipText;
  }
  /**
   * Sets the text used in the <code>ApproveButton</code> in the
   * <code>FileChooserUI</code>.
   *
   * @param approveButtonText the text used in the <code>ApproveButton</code>
   *
   * @see #getApproveButtonText
   * @see #setDialogType
   * @see #showDialog
   */
  setApproveButtonText(approveButtonText: string): void {
    if (this.approveButtonText === approveButtonText) {
      return;
    }
    let oldValue = this.approveButtonText;
    this.approveButtonText = approveButtonText;
    this.firePropertyChange$String$Object$Object(JFileChooser.APPROVE_BUTTON_TEXT_CHANGED_PROPERTY, oldValue, approveButtonText);
  }
  /**
   * Returns the text used in the <code>ApproveButton</code> in the
   * <code>FileChooserUI</code>.
   * If <code>null</code>, the UI object will determine the button's text.
   *
   * Typically, this would be "Open" or "Save".
   *
   * @return the text used in the <code>ApproveButton</code>
   *
   * @see #setApproveButtonText
   * @see #setDialogType
   * @see #showDialog
   */
  getApproveButtonText(): string {
    return this.approveButtonText;
  }
  /**
   * Gets the list of user choosable file filters.
   *
   * @return a <code>FileFilter</code> array containing all the choosable
   *         file filters
   *
   * @see #addChoosableFileFilter
   * @see #removeChoosableFileFilter
   * @see #resetChoosableFileFilters
   */
  getChoosableFileFilters(): FileFilter[] {
    let filterArray = $J.newArray(this.filters.size(), null);
    this.filters.copyInto(filterArray);
    return filterArray;
  }
  /**
   * Adds a filter to the list of user choosable file filters.
   * For information on setting the file selection mode, see
   * {@link #setFileSelectionMode setFileSelectionMode}.
   *
   * @param filter the <code>FileFilter</code> to add to the choosable file
   *               filter list
   *
   * @see #getChoosableFileFilters
   * @see #removeChoosableFileFilter
   * @see #resetChoosableFileFilters
   * @see #setFileSelectionMode
   */
  addChoosableFileFilter(filter: FileFilter): void {
    if (filter != null && !this.filters.contains(filter)) {
      let oldValue = this.getChoosableFileFilters();
      this.filters.addElement(filter);
      this.firePropertyChange$String$Object$Object(JFileChooser.CHOOSABLE_FILE_FILTER_CHANGED_PROPERTY, oldValue, this.getChoosableFileFilters());
      if (this.fileFilter == null && this.filters.size() === 1) {
        this.setFileFilter(filter);
      }
    }
  }
  /**
   * Removes a filter from the list of user choosable file filters. Returns
   * true if the file filter was removed.
   *
   * @param f the file filter to be removed
   * @return true if the file filter was removed, false otherwise
   * @see #addChoosableFileFilter
   * @see #getChoosableFileFilters
   * @see #resetChoosableFileFilters
   */
  removeChoosableFileFilter(f: FileFilter): boolean {
    let index = this.filters.indexOf(f);
    if (index >= 0) {
      if (this.getFileFilter() === f) {
        let aaff = this.getAcceptAllFileFilter();
        if (this.isAcceptAllFileFilterUsed() && (aaff !== f)) {
          this.setFileFilter(aaff);
        } else if (index > 0) {
          this.setFileFilter(this.filters.get(0));
        } else if (this.filters.size() > 1) {
          this.setFileFilter(this.filters.get(1));
        } else {
          this.setFileFilter(null);
        }
      }
      let oldValue = this.getChoosableFileFilters();
      this.filters.removeElement(f);
      this.firePropertyChange$String$Object$Object(JFileChooser.CHOOSABLE_FILE_FILTER_CHANGED_PROPERTY, oldValue, this.getChoosableFileFilters());
      return true;
    } else {
      return false;
    }
  }
  /**
   * Returns the <code>AcceptAll</code> file filter.
   * For example, on Microsoft Windows this would be All Files (*.*).
   *
   * @return the {@code AcceptAll} file filter
   */
  getAcceptAllFileFilter(): FileFilter {
    let filter = null;
    if (this.getUI() != null) {
      filter = this.getUI().getAcceptAllFileFilter(this);
    }
    return filter;
  }
  /**
   * Returns whether the <code>AcceptAll FileFilter</code> is used.
   * @return true if the <code>AcceptAll FileFilter</code> is used
   * @see #setAcceptAllFileFilterUsed
   * @since 1.3
   */
  isAcceptAllFileFilterUsed(): boolean {
    return this.useAcceptAllFileFilter;
  }
  /**
   * Determines whether the <code>AcceptAll FileFilter</code> is used
   * as an available choice in the choosable filter list.
   * If false, the <code>AcceptAll</code> file filter is removed from
   * the list of available file filters.
   * If true, the <code>AcceptAll</code> file filter will become the
   * actively used file filter.
   *
   * @param b a {@code boolean} which determines whether the {@code AcceptAll}
   *          file filter is an available choice in the choosable filter list
   *
   * @see #isAcceptAllFileFilterUsed
   * @see #getAcceptAllFileFilter
   * @see #setFileFilter
   * @since 1.3
   */
  setAcceptAllFileFilterUsed(b: boolean): void {
    let oldValue = this.useAcceptAllFileFilter;
    this.useAcceptAllFileFilter = b;
    if (!b) {
      this.removeChoosableFileFilter(this.getAcceptAllFileFilter());
    } else {
      this.removeChoosableFileFilter(this.getAcceptAllFileFilter());
      this.addChoosableFileFilter(this.getAcceptAllFileFilter());
    }
    this.firePropertyChange$String$boolean$boolean(JFileChooser.ACCEPT_ALL_FILE_FILTER_USED_CHANGED_PROPERTY, oldValue, this.useAcceptAllFileFilter);
  }
  /**
   * Returns the accessory component.
   *
   * @return this JFileChooser's accessory component, or null
   * @see #setAccessory
   */
  getAccessory(): JComponent {
    return this.accessory;
  }
  /**
   * Sets the <code>JFileChooser</code> to allow the user to just
   * select files, just select
   * directories, or select both files and directories.  The default is
   * <code>JFilesChooser.FILES_ONLY</code>.
   *
   * @param mode the type of files to be displayed:
   * <ul>
   * <li>JFileChooser.FILES_ONLY
   * <li>JFileChooser.DIRECTORIES_ONLY
   * <li>JFileChooser.FILES_AND_DIRECTORIES
   * </ul>
   *
   * @throws IllegalArgumentException  if <code>mode</code> is an
   *                          illegal file selection mode
   *
   * @see #getFileSelectionMode
   */
  setFileSelectionMode(mode: number): void {
    if (this.fileSelectionMode === mode) {
      return;
    }
    JFileChooser.checkFileSelectionMode(mode);
    let oldValue = this.fileSelectionMode;
    this.fileSelectionMode = mode;
    this.firePropertyChange$String$int$int(JFileChooser.FILE_SELECTION_MODE_CHANGED_PROPERTY, oldValue, this.fileSelectionMode);
  }
  static checkFileSelectionMode(mode: number): void {
    if ((mode !== JFileChooser.FILES_ONLY) && (mode !== JFileChooser.DIRECTORIES_ONLY) && (mode !== JFileChooser.FILES_AND_DIRECTORIES)) {
      throw new IllegalArgumentException('Incorrect Mode for file selection: ' + mode);
    }
  }
  /**
   * Returns the current file-selection mode.  The default is
   * <code>JFilesChooser.FILES_ONLY</code>.
   *
   * @return the type of files to be displayed, one of the following:
   * <ul>
   * <li>JFileChooser.FILES_ONLY
   * <li>JFileChooser.DIRECTORIES_ONLY
   * <li>JFileChooser.FILES_AND_DIRECTORIES
   * </ul>
   * @see #setFileSelectionMode
   */
  getFileSelectionMode(): number {
    return this.fileSelectionMode;
  }
  /**
   * Convenience call that determines if files are selectable based on the
   * current file selection mode.
   *
   * @return true if files are selectable, false otherwise
   * @see #setFileSelectionMode
   * @see #getFileSelectionMode
   */
  isFileSelectionEnabled(): boolean {
    return ((this.fileSelectionMode === JFileChooser.FILES_ONLY) || (this.fileSelectionMode === JFileChooser.FILES_AND_DIRECTORIES));
  }
  /**
   * Convenience call that determines if directories are selectable based
   * on the current file selection mode.
   *
   * @return true if directories are selectable, false otherwise
   * @see #setFileSelectionMode
   * @see #getFileSelectionMode
   */
  isDirectorySelectionEnabled(): boolean {
    return ((this.fileSelectionMode === JFileChooser.DIRECTORIES_ONLY) || (this.fileSelectionMode === JFileChooser.FILES_AND_DIRECTORIES));
  }
  /**
   * Returns true if multiple files can be selected.
   * @return true if multiple files can be selected
   * @see #setMultiSelectionEnabled
   */
  isMultiSelectionEnabled(): boolean {
    return this.multiSelectionEnabled;
  }
  /**
   * Returns true if hidden files are not shown in the file chooser;
   * otherwise, returns false. The default value of this property may be
   * derived from the underlying Operating System.
   *
   * @return the status of the file hiding property
   * @see #setFileHidingEnabled
   */
  isFileHidingEnabled(): boolean {
    return this.useFileHiding;
  }
  /**
   * Sets file hiding on or off. If true, hidden files are not shown
   * in the file chooser. The job of determining which files are
   * shown is done by the <code>FileView</code>.
   *
   * @param b the boolean value that determines whether file hiding is
   *          turned on
   * @see #isFileHidingEnabled
   */
  setFileHidingEnabled(b: boolean): void {
    if (this.showFilesListener != null) {
      Toolkit.getDefaultToolkit().removePropertyChangeListener(JFileChooser.SHOW_HIDDEN_PROP, this.showFilesListener);
      this.showFilesListener = null;
    }
    let oldValue = this.useFileHiding;
    this.useFileHiding = b;
    this.firePropertyChange$String$boolean$boolean(JFileChooser.FILE_HIDING_CHANGED_PROPERTY, oldValue, this.useFileHiding);
  }
  /**
   * Sets the current file filter. The file filter is used by the
   * file chooser to filter out files from the user's view.
   *
   * @param filter the new current file filter to use
   * @see #getFileFilter
   */
  setFileFilter(filter: FileFilter): void {
    let oldValue = this.fileFilter;
    this.fileFilter = filter;
    if (filter != null) {
      if (this.isMultiSelectionEnabled() && this.selectedFiles != null && this.selectedFiles.length > 0) {
        let fList = new ArrayList();
        let failed = false;
        for (let file of this.selectedFiles) {
          if (filter.accept(file)) {
            fList.add(file);
          } else {
            failed = true;
          }
        }
        if (failed) {
          this.setSelectedFiles((fList.size() === 0) ? null : $J.toArrayInto(fList.toArray(), $J.newArray(fList.size(), null)));
        }
      } else if (this.selectedFile != null && !filter.accept(this.selectedFile)) {
        this.setSelectedFile(null);
      }
    }
    this.firePropertyChange$String$Object$Object(JFileChooser.FILE_FILTER_CHANGED_PROPERTY, oldValue, this.fileFilter);
  }
  /**
   * Returns the currently selected file filter.
   *
   * @return the current file filter
   * @see #setFileFilter
   * @see #addChoosableFileFilter
   */
  getFileFilter(): FileFilter {
    return this.fileFilter;
  }
  /**
   * Returns the current file view.
   *
   * @return the current file view
   * @see #setFileView
   */
  getFileView(): FileView {
    return this.fileView;
  }
  /**
   * Returns the filename.
   * @param f the <code>File</code>
   * @return the <code>String</code> containing the filename for
   *          <code>f</code>
   * @see FileView#getName
   */
  getName$File(f: File): string {
    let filename = null;
    if (f != null) {
      if (this.getFileView() != null) {
        filename = this.getFileView().getName(f);
      }
      let uiFileView = this.getUI().getFileView(this);
      if (filename == null && uiFileView != null) {
        filename = uiFileView.getName(f);
      }
    }
    return filename;
  }
  /**
   * Returns the icon for this file or type of file, depending
   * on the system.
   * @param f the <code>File</code>
   * @return the <code>Icon</code> for this file, or type of file
   * @see FileView#getIcon
   */
  getIcon(f: File): Icon {
    let icon = null;
    if (f != null) {
      if (this.getFileView() != null) {
        icon = this.getFileView().getIcon(f);
      }
      let uiFileView = this.getUI().getFileView(this);
      if (icon == null && uiFileView != null) {
        icon = uiFileView.getIcon(f);
      }
    }
    return icon;
  }
  /**
   * Returns true if the file (directory) can be visited.
   * Returns false if the directory cannot be traversed.
   * @param f the <code>File</code>
   * @return true if the file/directory can be traversed, otherwise false
   * @see FileView#isTraversable
   */
  isTraversable(f: File): boolean {
    let traversable = null;
    if (f != null) {
      let fileView = this.getFileView();
      if (fileView != null) {
        traversable = fileView.isTraversable(f);
      }
      let ui = this.getUI();
      if (traversable == null && ui != null) {
        let uiFileView = ui.getFileView(this);
        if (uiFileView != null) {
          traversable = uiFileView.isTraversable(f);
        }
      }
      let fileSystemView = this.getFileSystemView();
      if (traversable == null && fileSystemView != null) {
        traversable = fileSystemView.isTraversable(f);
      }
    }
    return traversable != null && traversable;
  }
  /**
   * Returns true if the file should be displayed.
   * @param f the <code>File</code>
   * @return true if the file should be displayed, otherwise false
   * @see FileFilter#accept
   */
  accept(f: File): boolean {
    let filter = this.fileFilter;
    return f == null || filter == null || filter.accept(f);
  }
  /**
   * Sets the file system view that the <code>JFileChooser</code> uses for
   * accessing and creating file system resources, such as finding
   * the floppy drive and getting a list of root drives.
   * @param fsv  the new <code>FileSystemView</code>
   *
   * @see FileSystemView
   */
  setFileSystemView(fsv: FileSystemView): void {
    let oldValue = this.fileSystemView;
    this.fileSystemView = fsv;
    this.firePropertyChange$String$Object$Object(JFileChooser.FILE_SYSTEM_VIEW_CHANGED_PROPERTY, oldValue, this.fileSystemView);
  }
  /**
   * Returns the file system view.
   * @return the <code>FileSystemView</code> object
   * @see #setFileSystemView
   */
  getFileSystemView(): FileSystemView {
    return this.fileSystemView;
  }
  /**
   * Called by the UI when the user hits the Approve button
   * (labeled "Open" or "Save", by default). This can also be
   * called by the programmer.
   * This method causes an action event to fire
   * with the command string equal to
   * <code>APPROVE_SELECTION</code>.
   *
   * @see #APPROVE_SELECTION
   */
  approveSelection(): void {
    this.returnValue = JFileChooser.APPROVE_OPTION;
    if (this.dialog != null) {
      this.dialog.setVisible(false);
    }
    this.fireActionPerformed(JFileChooser.APPROVE_SELECTION);
  }
  /**
   * Called by the UI when the user chooses the Cancel button.
   * This can also be called by the programmer.
   * This method causes an action event to fire
   * with the command string equal to
   * <code>CANCEL_SELECTION</code>.
   *
   * @see #CANCEL_SELECTION
   */
  cancelSelection(): void {
    this.returnValue = JFileChooser.CANCEL_OPTION;
    if (this.dialog != null) {
      this.dialog.setVisible(false);
    }
    this.fireActionPerformed(JFileChooser.CANCEL_SELECTION);
  }
  /**
   * Adds an <code>ActionListener</code> to the file chooser.
   *
   * @param l  the listener to be added
   *
   * @see #approveSelection
   * @see #cancelSelection
   */
  addActionListener(l: ActionListener): void {
    this.listenerList.add($J.cls(ActionListener), l);
  }
  /**
   * Notifies all listeners that have registered interest for
   * notification on this event type. The event instance
   * is lazily created using the <code>command</code> parameter.
   *
   * @param command a string that may specify a command associated with
   *                the event
   * @see EventListenerList
   */
  fireActionPerformed(command: string): void {
    let listeners = this.listenerList.getListenerList();
    let mostRecentEventTime = EventQueue.getMostRecentEventTime();
    let modifiers = 0;
    let currentEvent = EventQueue.getCurrentEvent();
    if (currentEvent instanceof InputEvent) {
      modifiers = (currentEvent).getModifiers();
    } else if (currentEvent instanceof ActionEvent) {
      modifiers = (currentEvent).getModifiers();
    }
    let e = null;
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(ActionListener)) {
        if (e == null) {
          e = new ActionEvent()._ActionEvent$Object$int$String$long$int(this, ActionEvent.ACTION_PERFORMED, command, mostRecentEventTime, modifiers);
        }
        $J.fn((listeners[(i + 1) | 0]), 'actionPerformed')(e);
      }
    }
  }
  /**
   * Resets the UI property to a value from the current look and feel.
   *
   * @see JComponent#updateUI
   */
  updateUI(): void {
    if (this.isAcceptAllFileFilterUsed()) {
      this.removeChoosableFileFilter(this.getAcceptAllFileFilter());
    }
    let ui = (UIManager.getUI(this));
    if (this.fileSystemView == null) {
      this.setFileSystemView(FileSystemView.getFileSystemView());
    }
    this.setUI$ComponentUI(ui);
    if (this.isAcceptAllFileFilterUsed()) {
      this.addChoosableFileFilter(this.getAcceptAllFileFilter());
    }
  }
  /**
   * Returns a string that specifies the name of the L&amp;F class
   * that renders this component.
   *
   * @return the string "FileChooserUI"
   * @see JComponent#getUIClassID
   * @see UIDefaults#getUI
   */
  getUIClassID(): string {
    return JFileChooser.uiClassID;
  }
  /**
   * Gets the UI object which implements the L&amp;F for this component.
   *
   * @return the FileChooserUI object that implements the FileChooserUI L&amp;F
   */
  getUI(): FileChooserUI {
    return this.ui;
  }
  /**
   * Returns a string representation of this <code>JFileChooser</code>.
   * This method
   * is intended to be used only for debugging purposes, and the
   * content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not
   * be <code>null</code>.
   *
   * @return  a string representation of this <code>JFileChooser</code>
   */
  paramString(): string {
    let approveButtonTextString = (this.approveButtonText != null ? this.approveButtonText : '');
    let dialogTitleString = (this.dialogTitle != null ? this.dialogTitle : '');
    let dialogTypeString: string;
    if (this.dialogType === JFileChooser.OPEN_DIALOG) {
      dialogTypeString = 'OPEN_DIALOG';
    } else if (this.dialogType === JFileChooser.SAVE_DIALOG) {
      dialogTypeString = 'SAVE_DIALOG';
    } else if (this.dialogType === JFileChooser.CUSTOM_DIALOG) {
      dialogTypeString = 'CUSTOM_DIALOG';
    } else {
      dialogTypeString = '';
    }
    let returnValueString: string;
    if (this.returnValue === JFileChooser.CANCEL_OPTION) {
      returnValueString = 'CANCEL_OPTION';
    } else if (this.returnValue === JFileChooser.APPROVE_OPTION) {
      returnValueString = 'APPROVE_OPTION';
    } else if (this.returnValue === JFileChooser.ERROR_OPTION) {
      returnValueString = 'ERROR_OPTION';
    } else {
      returnValueString = '';
    }
    let useFileHidingString = (this.useFileHiding ? 'true' : 'false');
    let fileSelectionModeString: string;
    if (this.fileSelectionMode === JFileChooser.FILES_ONLY) {
      fileSelectionModeString = 'FILES_ONLY';
    } else if (this.fileSelectionMode === JFileChooser.DIRECTORIES_ONLY) {
      fileSelectionModeString = 'DIRECTORIES_ONLY';
    } else if (this.fileSelectionMode === JFileChooser.FILES_AND_DIRECTORIES) {
      fileSelectionModeString = 'FILES_AND_DIRECTORIES';
    } else {
      fileSelectionModeString = '';
    }
    let currentDirectoryString = (this.currentDirectory != null ? this.currentDirectory.toString() : '');
    let selectedFileString = (this.selectedFile != null ? this.selectedFile.toString() : '');
    return super.paramString() + ',approveButtonText=' + approveButtonTextString + ',currentDirectory=' + currentDirectoryString + ',dialogTitle=' + dialogTitleString + ',dialogType=' + dialogTypeString + ',fileSelectionMode=' + fileSelectionModeString + ',returnValue=' + returnValueString + ',selectedFile=' + selectedFileString + ',useFileHiding=' + useFileHidingString;
  }
  /**
   * Gets the AccessibleContext associated with this JFileChooser.
   * For file choosers, the AccessibleContext takes the form of an
   * AccessibleJFileChooser.
   * A new AccessibleJFileChooser instance is created if necessary.
   *
   * @return an AccessibleJFileChooser that serves as the
   *         AccessibleContext of this JFileChooser
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext$JFileChooser == null) {
      this.accessibleContext$JFileChooser = new JFileChooser$AccessibleJFileChooser().$o(this)._JFileChooser$AccessibleJFileChooser();
    }
    return this.accessibleContext$JFileChooser;
  }
}

export class JFileChooser$WeakPCL extends JObject {
  jfcRef: WeakReference<JFileChooser> = null;
  _JFileChooser$WeakPCL(jfc: JFileChooser): this {
    this.jfcRef = new WeakReference(jfc);
    return this;
  }
  propertyChange(ev: PropertyChangeEvent): void {
    // assert ev.getPropertyName().equals(SHOW_HIDDEN_PROP)
    let jfc = this.jfcRef.get();
    if (jfc == null) {
      Toolkit.getDefaultToolkit().removePropertyChangeListener(JFileChooser.SHOW_HIDDEN_PROP, $J.fn(this, 'propertyChange'));
    } else {
      let oldValue = jfc.useFileHiding;
      jfc.useFileHiding = !(ev.getNewValue());
      jfc.firePropertyChange$String$boolean$boolean(JFileChooser.FILE_HIDING_CHANGED_PROPERTY, oldValue, jfc.useFileHiding);
    }
  }
}

/**
 * This class implements accessibility support for the
 * <code>JFileChooser</code> class.  It provides an implementation of the
 * Java Accessibility API appropriate to file chooser user-interface
 * elements.
 */
export class JFileChooser$AccessibleJFileChooser extends JComponent$AccessibleJComponent {
  /**
   * Constructs an {@code AccessibleJFileChooser}.
   */
  _JFileChooser$AccessibleJFileChooser(): this {
    this._JComponent$AccessibleJComponent();
    return this;
  }
}

export class JFileChooser$FCHierarchyListener extends JObject {
  _JFileChooser$FCHierarchyListener(): this {
    return this;
  }
  hierarchyChanged(e: HierarchyEvent): void {
    if (($J.land(e.getChangeFlags(), HierarchyEvent.PARENT_CHANGED)) === HierarchyEvent.PARENT_CHANGED) {
      let fc = this.$outer;
      let rootPane = SwingUtilities.getRootPane(fc);
      if (rootPane != null) {
        rootPane.setDefaultButton(fc.getUI().getDefaultButton(fc));
      }
    }
  }
}

$J.define(JFileChooser, 'javax.swing.JFileChooser', { kind: 'class', ifaces: ['javax.accessibility.Accessible'], sup: 'javax.swing.JComponent', ctors: { 'java.lang.String,javax.swing.filechooser.FileSystemView': '_JFileChooser$String$FileSystemView', 'java.io.File,javax.swing.filechooser.FileSystemView': '_JFileChooser$File$FileSystemView', 'javax.swing.filechooser.FileSystemView': '_JFileChooser$FileSystemView', 'java.io.File': '_JFileChooser$File', 'java.lang.String': '_JFileChooser$String', '': '_JFileChooser$' }, meths: { 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$JFileChooser', 'readObject(java.io.ObjectInputStream)': 'readObject$ObjectInputStream$JFileChooser', 'getName(java.io.File)': 'getName$File', 'setApproveButtonMnemonic(char)': 'setApproveButtonMnemonic$char', 'setApproveButtonMnemonic(int)': 'setApproveButtonMnemonic$int' } });
$J.define(JFileChooser$WeakPCL, 'javax.swing.JFileChooser$WeakPCL', { kind: 'class', ifaces: ['java.beans.PropertyChangeListener'], sup: 'java.lang.Object', ctors: { 'javax.swing.JFileChooser': '_JFileChooser$WeakPCL' } });
$J.define(JFileChooser$AccessibleJFileChooser, 'javax.swing.JFileChooser$AccessibleJFileChooser', { kind: 'class', sup: 'javax.swing.JComponent$AccessibleJComponent', ctors: { '': '_JFileChooser$AccessibleJFileChooser' }, meths: { 'getAccessibleRole()': 'getAccessibleRole$' }, inner: true });
$J.define(JFileChooser$FCHierarchyListener, 'javax.swing.JFileChooser$FCHierarchyListener', { kind: 'class', ifaces: ['java.awt.event.HierarchyListener', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_JFileChooser$FCHierarchyListener' }, inner: true });
$J.module(() => {
  AWTEvent = $J.load('java.awt.AWTEvent');
  EventQueue = $J.load('java.awt.EventQueue');
  ActionEvent = $J.load('java.awt.event.ActionEvent');
  ActionListener = $J.load('java.awt.event.ActionListener');
  HierarchyEvent = $J.load('java.awt.event.HierarchyEvent');
  InputEvent = $J.load('java.awt.event.InputEvent');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIManager = $J.load('javax.swing.UIManager');
});
