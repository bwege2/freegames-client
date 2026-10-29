// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicFileChooserUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2023, Oracle and/or its affiliates. All rights reserved.
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
import { $J, ArrayList, Arrays, Character, DataFlavor, File, FileNotFoundException, Hashtable, IOException, JObject, JString, Pattern, PatternSyntaxException, ShellFolder, StringBuilder, Toolkit } from '../../../../../jre/index.ts';
import { FileChooserUI } from '../FileChooserUI.ts';
import { AbstractAction } from '../../AbstractAction.ts';
import { FileFilter } from '../../filechooser/FileFilter.ts';
import { FileView } from '../../filechooser/FileView.ts';
import { TransferHandler } from '../../TransferHandler.ts';
import { BasicTransferable } from './BasicTransferable.ts';

let BorderLayout, Action, JComponent, JFileChooser, JList, JOptionPane, JPanel, JTable, LookAndFeel, SwingUtilities, UIManager, ActionMapUIResource, UIResource, BasicDirectoryModel, DefaultLookup, FilePane, SwingUtilities2, UIAction;

/**
 * Basic L&amp;F implementation of a FileChooser.
 *
 * @author Jeff Dinkins
 */
export class BasicFileChooserUI extends FileChooserUI {
  /**
   * Directory icon
   */
  directoryIcon: Icon = null;
  /**
   * File icon
   */
  fileIcon: Icon = null;
  /**
   * Computer icon
   */
  computerIcon: Icon = null;
  /**
   * Hard drive icon
   */
  hardDriveIcon: Icon = null;
  /**
   * Floppy drive icon
   */
  floppyDriveIcon: Icon = null;
  /**
   * New folder icon
   */
  newFolderIcon: Icon = null;
  /**
   * Up folder icon
   */
  upFolderIcon: Icon = null;
  /**
   * Home folder icon
   */
  homeFolderIcon: Icon = null;
  /**
   * List view icon
   */
  listViewIcon: Icon = null;
  /**
   * Details view icon
   */
  detailsViewIcon: Icon = null;
  /**
   * View menu icon
   */
  viewMenuIcon: Icon = null;
  /**
   * Save button mnemonic
   */
  saveButtonMnemonic: number = 0;
  /**
   * Open button mnemonic
   */
  openButtonMnemonic: number = 0;
  /**
   * Cancel button mnemonic
   */
  cancelButtonMnemonic: number = 0;
  /**
   * Update button mnemonic
   */
  updateButtonMnemonic: number = 0;
  /**
   * Help button mnemonic
   */
  helpButtonMnemonic: number = 0;
  /**
   * The mnemonic keycode used for the approve button when a directory
   * is selected and the current selection mode is FILES_ONLY.
   *
   * @since 1.4
   */
  directoryOpenButtonMnemonic: number = 0;
  /**
   * Save button text
   */
  saveButtonText: string = null;
  /**
   * Open button text
   */
  openButtonText: string = null;
  /**
   * Cancel button text
   */
  cancelButtonText: string = null;
  /**
   * Update button text
   */
  updateButtonText: string = null;
  /**
   * Help button text
   */
  helpButtonText: string = null;
  /**
   * The label text displayed on the approve button when a directory
   * is selected and the current selection mode is FILES_ONLY.
   *
   * @since 1.4
   */
  directoryOpenButtonText: string = null;
  /**
   * Open dialog title text
   */
  openDialogTitleText: string = null;
  /**
   * Save dialog title text
   */
  saveDialogTitleText: string = null;
  /**
   * Save button tool tip text
   */
  saveButtonToolTipText: string = null;
  /**
   * Open button tool tip text
   */
  openButtonToolTipText: string = null;
  /**
   * Cancel button tool tip text
   */
  cancelButtonToolTipText: string = null;
  /**
   * Update button tool tip text
   */
  updateButtonToolTipText: string = null;
  /**
   * Help button tool tip text
   */
  helpButtonToolTipText: string = null;
  /**
   * The tooltip text displayed on the approve button when a directory
   * is selected and the current selection mode is FILES_ONLY.
   *
   * @since 1.4
   */
  directoryOpenButtonToolTipText: string = null;
  approveSelectionAction: Action = null;
  cancelSelectionAction: Action = null;
  updateAction: Action = null;
  newFolderAction: Action = null;
  goHomeAction: Action = null;
  changeToParentDirectoryAction: Action = null;
  newFolderErrorSeparator: string = null;
  newFolderErrorText: string = null;
  newFolderParentDoesntExistTitleText: string = null;
  newFolderParentDoesntExistText: string = null;
  fileDescriptionText: string = null;
  directoryDescriptionText: string = null;
  filechooser: JFileChooser = null;
  directorySelected: boolean = false;
  directory: File = null;
  propertyChangeListener: PropertyChangeListener = null;
  acceptAllFileFilter: BasicFileChooserUI$AcceptAllFileFilter = null;
  actualFileFilter: FileFilter = null;
  globFilter: BasicFileChooserUI$GlobFilter = null;
  model: BasicDirectoryModel = null;
  fileView: BasicFileChooserUI$BasicFileView = null;
  usesSingleFilePane: boolean = false;
  readOnly: boolean = false;
  accessoryPanel: JPanel = null;
  handler: BasicFileChooserUI$Handler = null;
  static defaultTransferHandler: TransferHandler = null;
  /**
   * Constructs a {@code BasicFileChooserUI}.
   * @param b file chooser
   */
  _BasicFileChooserUI(b: JFileChooser): this {
    this._FileChooserUI();
    this.directoryIcon = null;
    this.fileIcon = null;
    this.computerIcon = null;
    this.hardDriveIcon = null;
    this.floppyDriveIcon = null;
    this.newFolderIcon = null;
    this.upFolderIcon = null;
    this.homeFolderIcon = null;
    this.listViewIcon = null;
    this.detailsViewIcon = null;
    this.viewMenuIcon = null;
    this.saveButtonMnemonic = 0;
    this.openButtonMnemonic = 0;
    this.cancelButtonMnemonic = 0;
    this.updateButtonMnemonic = 0;
    this.helpButtonMnemonic = 0;
    this.directoryOpenButtonMnemonic = 0;
    this.saveButtonText = null;
    this.openButtonText = null;
    this.cancelButtonText = null;
    this.updateButtonText = null;
    this.helpButtonText = null;
    this.directoryOpenButtonText = null;
    this.openDialogTitleText = null;
    this.saveDialogTitleText = null;
    this.saveButtonToolTipText = null;
    this.openButtonToolTipText = null;
    this.cancelButtonToolTipText = null;
    this.updateButtonToolTipText = null;
    this.helpButtonToolTipText = null;
    this.directoryOpenButtonToolTipText = null;
    this.approveSelectionAction = new BasicFileChooserUI$ApproveSelectionAction().$o(this)._BasicFileChooserUI$ApproveSelectionAction();
    this.cancelSelectionAction = new BasicFileChooserUI$CancelSelectionAction().$o(this)._BasicFileChooserUI$CancelSelectionAction();
    this.updateAction = new BasicFileChooserUI$UpdateAction().$o(this)._BasicFileChooserUI$UpdateAction();
    this.goHomeAction = new BasicFileChooserUI$GoHomeAction().$o(this)._BasicFileChooserUI$GoHomeAction();
    this.changeToParentDirectoryAction = new BasicFileChooserUI$ChangeToParentDirectoryAction().$o(this)._BasicFileChooserUI$ChangeToParentDirectoryAction();
    this.newFolderErrorSeparator = null;
    this.newFolderErrorText = null;
    this.newFolderParentDoesntExistTitleText = null;
    this.newFolderParentDoesntExistText = null;
    this.fileDescriptionText = null;
    this.directoryDescriptionText = null;
    this.filechooser = null;
    this.directorySelected = false;
    this.directory = null;
    this.propertyChangeListener = null;
    this.acceptAllFileFilter = new BasicFileChooserUI$AcceptAllFileFilter().$o(this)._BasicFileChooserUI$AcceptAllFileFilter();
    this.actualFileFilter = null;
    this.globFilter = null;
    this.model = null;
    this.fileView = new BasicFileChooserUI$BasicFileView().$o(this)._BasicFileChooserUI$BasicFileView();
    this.accessoryPanel = null;
    return this;
  }
  /**
   * Creates a {@code BasicFileChooserUI} implementation
   * for the specified component. By default
   * the {@code BasicLookAndFeel} class uses
   * {@code createUI} methods of all basic UIs classes
   * to instantiate UIs.
   *
   * @param c the {@code JFileChooser} which needs a UI
   * @return the {@code BasicFileChooserUI} object
   *
   * @see UIDefaults#getUI(JComponent)
   * @since 1.7
   */
  static createUI(c: JComponent): ComponentUI {
    return new BasicFileChooserUI()._BasicFileChooserUI(c);
  }
  /**
   * Installs the UI.
   * @param c the component
   */
  installUI(c: JComponent): void {
    this.accessoryPanel = new JPanel()._JPanel$LayoutManager(new BorderLayout()._BorderLayout$());
    this.filechooser = c;
    this.createModel();
    this.clearIconCache();
    this.installDefaults(this.filechooser);
    this.installComponents(this.filechooser);
    this.installListeners(this.filechooser);
    this.filechooser.applyComponentOrientation(this.filechooser.getComponentOrientation());
  }
  /**
   * Uninstalls the UI.
   * @param c the component
   */
  uninstallUI(c: JComponent): void {
    this.uninstallListeners(this.filechooser);
    this.uninstallComponents(this.filechooser);
    this.uninstallDefaults(this.filechooser);
    if (this.accessoryPanel != null) {
      this.accessoryPanel.removeAll();
    }
    this.accessoryPanel = null;
    this.getFileChooser().removeAll();
    this.handler = null;
  }
  /**
   * Installs the components.
   * @param fc the file chooser
   */
  installComponents(fc: JFileChooser): void {
  }
  /**
   * Uninstalls the components.
   * @param fc the file chooser
   */
  uninstallComponents(fc: JFileChooser): void {
  }
  /**
   * Installs the listeners.
   * @param fc the file chooser
   */
  installListeners(fc: JFileChooser): void {
    this.propertyChangeListener = this.createPropertyChangeListener(fc);
    if (this.propertyChangeListener != null) {
      fc.addPropertyChangeListener$PropertyChangeListener(this.propertyChangeListener);
    }
    fc.addPropertyChangeListener$PropertyChangeListener($J.fn(this.getModel(), 'propertyChange'));
    let inputMap = this.getInputMap(JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT);
    SwingUtilities.replaceUIInputMap(fc, JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT, inputMap);
    let actionMap = this.getActionMap$();
    SwingUtilities.replaceUIActionMap(fc, actionMap);
  }
  getInputMap(condition: number): InputMap {
    if (condition === JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT) {
      return DefaultLookup.get(this.getFileChooser(), this, 'FileChooser.ancestorInputMap');
    }
    return null;
  }
  getActionMap$(): ActionMap {
    return this.createActionMap$();
  }
  createActionMap$(): ActionMap {
    let map = new ActionMapUIResource()._ActionMapUIResource();
    let refreshAction = new (BasicFileChooserUI$1())().$o(this)._UIAction(FilePane.ACTION_REFRESH);
    map.put$Object$Action(FilePane.ACTION_APPROVE_SELECTION, this.getApproveSelectionAction());
    map.put$Object$Action(FilePane.ACTION_CANCEL, this.getCancelSelectionAction());
    map.put$Object$Action(FilePane.ACTION_REFRESH, refreshAction);
    map.put$Object$Action(FilePane.ACTION_CHANGE_TO_PARENT_DIRECTORY, this.getChangeToParentDirectoryAction());
    return map;
  }
  /**
   * Uninstalls the listeners.
   * @param fc the file chooser
   */
  uninstallListeners(fc: JFileChooser): void {
    if (this.propertyChangeListener != null) {
      fc.removePropertyChangeListener$PropertyChangeListener(this.propertyChangeListener);
    }
    fc.removePropertyChangeListener$PropertyChangeListener($J.fn(this.getModel(), 'propertyChange'));
    SwingUtilities.replaceUIInputMap(fc, JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT, null);
    SwingUtilities.replaceUIActionMap(fc, null);
  }
  /**
   * Installs the defaults.
   * @param fc the file chooser
   */
  installDefaults(fc: JFileChooser): void {
    this.installIcons(fc);
    this.installStrings(fc);
    this.usesSingleFilePane = UIManager.getBoolean$Object('FileChooser.usesSingleFilePane');
    this.readOnly = UIManager.getBoolean$Object('FileChooser.readOnly');
    let th = fc.getTransferHandler();
    if (th == null || $J.isa(th, UIResource)) {
      fc.setTransferHandler(BasicFileChooserUI.defaultTransferHandler);
    }
    LookAndFeel.installProperty(fc, 'opaque', false);
  }
  /**
   * Installs the icons.
   * @param fc the file chooser
   */
  installIcons(fc: JFileChooser): void {
    this.directoryIcon = UIManager.getIcon$Object('FileView.directoryIcon');
    this.fileIcon = UIManager.getIcon$Object('FileView.fileIcon');
    this.computerIcon = UIManager.getIcon$Object('FileView.computerIcon');
    this.hardDriveIcon = UIManager.getIcon$Object('FileView.hardDriveIcon');
    this.floppyDriveIcon = UIManager.getIcon$Object('FileView.floppyDriveIcon');
    this.newFolderIcon = UIManager.getIcon$Object('FileChooser.newFolderIcon');
    this.upFolderIcon = UIManager.getIcon$Object('FileChooser.upFolderIcon');
    this.homeFolderIcon = UIManager.getIcon$Object('FileChooser.homeFolderIcon');
    this.detailsViewIcon = UIManager.getIcon$Object('FileChooser.detailsViewIcon');
    this.listViewIcon = UIManager.getIcon$Object('FileChooser.listViewIcon');
    this.viewMenuIcon = UIManager.getIcon$Object('FileChooser.viewMenuIcon');
  }
  /**
   * Installs the strings.
   * @param fc the file chooser
   */
  installStrings(fc: JFileChooser): void {
    let l = fc.getLocale$();
    this.newFolderErrorText = UIManager.getString$Object$Locale('FileChooser.newFolderErrorText', l);
    this.newFolderErrorSeparator = UIManager.getString$Object$Locale('FileChooser.newFolderErrorSeparator', l);
    this.newFolderParentDoesntExistTitleText = UIManager.getString$Object$Locale('FileChooser.newFolderParentDoesntExistTitleText', l);
    this.newFolderParentDoesntExistText = UIManager.getString$Object$Locale('FileChooser.newFolderParentDoesntExistText', l);
    this.fileDescriptionText = UIManager.getString$Object$Locale('FileChooser.fileDescriptionText', l);
    this.directoryDescriptionText = UIManager.getString$Object$Locale('FileChooser.directoryDescriptionText', l);
    this.saveButtonText = UIManager.getString$Object$Locale('FileChooser.saveButtonText', l);
    this.openButtonText = UIManager.getString$Object$Locale('FileChooser.openButtonText', l);
    this.saveDialogTitleText = UIManager.getString$Object$Locale('FileChooser.saveDialogTitleText', l);
    this.openDialogTitleText = UIManager.getString$Object$Locale('FileChooser.openDialogTitleText', l);
    this.cancelButtonText = UIManager.getString$Object$Locale('FileChooser.cancelButtonText', l);
    this.updateButtonText = UIManager.getString$Object$Locale('FileChooser.updateButtonText', l);
    this.helpButtonText = UIManager.getString$Object$Locale('FileChooser.helpButtonText', l);
    this.directoryOpenButtonText = UIManager.getString$Object$Locale('FileChooser.directoryOpenButtonText', l);
    this.saveButtonMnemonic = this.getMnemonic$String$Locale$BasicFileChooserUI('FileChooser.saveButtonMnemonic', l);
    this.openButtonMnemonic = this.getMnemonic$String$Locale$BasicFileChooserUI('FileChooser.openButtonMnemonic', l);
    this.cancelButtonMnemonic = this.getMnemonic$String$Locale$BasicFileChooserUI('FileChooser.cancelButtonMnemonic', l);
    this.updateButtonMnemonic = this.getMnemonic$String$Locale$BasicFileChooserUI('FileChooser.updateButtonMnemonic', l);
    this.helpButtonMnemonic = this.getMnemonic$String$Locale$BasicFileChooserUI('FileChooser.helpButtonMnemonic', l);
    this.directoryOpenButtonMnemonic = this.getMnemonic$String$Locale$BasicFileChooserUI('FileChooser.directoryOpenButtonMnemonic', l);
    this.saveButtonToolTipText = UIManager.getString$Object$Locale('FileChooser.saveButtonToolTipText', l);
    this.openButtonToolTipText = UIManager.getString$Object$Locale('FileChooser.openButtonToolTipText', l);
    this.cancelButtonToolTipText = UIManager.getString$Object$Locale('FileChooser.cancelButtonToolTipText', l);
    this.updateButtonToolTipText = UIManager.getString$Object$Locale('FileChooser.updateButtonToolTipText', l);
    this.helpButtonToolTipText = UIManager.getString$Object$Locale('FileChooser.helpButtonToolTipText', l);
    this.directoryOpenButtonToolTipText = UIManager.getString$Object$Locale('FileChooser.directoryOpenButtonToolTipText', l);
  }
  /**
   * Uninstalls the defaults.
   * @param fc the file chooser
   */
  uninstallDefaults(fc: JFileChooser): void {
    this.uninstallIcons(fc);
    this.uninstallStrings(fc);
    if ($J.isa(fc.getTransferHandler(), UIResource)) {
      fc.setTransferHandler(null);
    }
  }
  /**
   * Uninstalls the icons.
   * @param fc the file chooser
   */
  uninstallIcons(fc: JFileChooser): void {
    this.directoryIcon = null;
    this.fileIcon = null;
    this.computerIcon = null;
    this.hardDriveIcon = null;
    this.floppyDriveIcon = null;
    this.newFolderIcon = null;
    this.upFolderIcon = null;
    this.homeFolderIcon = null;
    this.detailsViewIcon = null;
    this.listViewIcon = null;
    this.viewMenuIcon = null;
  }
  /**
   * Uninstalls the strings.
   * @param fc the file chooser
   */
  uninstallStrings(fc: JFileChooser): void {
    this.saveButtonText = null;
    this.openButtonText = null;
    this.cancelButtonText = null;
    this.updateButtonText = null;
    this.helpButtonText = null;
    this.directoryOpenButtonText = null;
    this.saveButtonToolTipText = null;
    this.openButtonToolTipText = null;
    this.cancelButtonToolTipText = null;
    this.updateButtonToolTipText = null;
    this.helpButtonToolTipText = null;
    this.directoryOpenButtonToolTipText = null;
  }
  /**
   * Creates the model.
   */
  createModel(): void {
    if (this.model != null) {
      this.model.invalidateFileCache();
    }
    this.model = new BasicDirectoryModel()._BasicDirectoryModel(this.getFileChooser());
  }
  /**
   * Returns the model.
   * @return the model
   */
  getModel(): BasicDirectoryModel {
    return this.model;
  }
  /**
   * Creates the property change listener.
   * @param fc the file chooser
   * @return the property change listener
   */
  createPropertyChangeListener(fc: JFileChooser): PropertyChangeListener {
    return null;
  }
  /**
   * Returns the file name.
   * @return the file name
   */
  getFileName(): string {
    return null;
  }
  /**
   * Returns the directory name.
   * @return the directory name
   */
  getDirectoryName(): string {
    return null;
  }
  /**
   * Sets the file name.
   * @param filename the file name
   */
  setFileName(filename: string): void {
  }
  /**
   * {@inheritDoc}
   */
  rescanCurrentDirectory(fc: JFileChooser): void {
  }
  /**
   * {@inheritDoc}
   */
  ensureFileIsVisible(fc: JFileChooser, f: File): void {
  }
  /**
   * Returns the file chooser.
   * @return the file chooser
   */
  getFileChooser(): JFileChooser {
    return this.filechooser;
  }
  /**
   * Returns the accessory panel.
   * @return the accessory panel
   */
  getAccessoryPanel(): JPanel {
    return this.accessoryPanel;
  }
  /**
   * Returns the approve button.
   * @param fc the file chooser
   * @return the approve button
   */
  getApproveButton(fc: JFileChooser): JButton {
    return null;
  }
  /**
   * {@inheritDoc}
   */
  getDefaultButton(fc: JFileChooser): JButton {
    return this.getApproveButton(fc);
  }
  /**
   * Returns the approve button tool tip.
   * @param fc the file chooser
   * @return the approve button tool tip
   */
  getApproveButtonToolTipText(fc: JFileChooser): string {
    let tooltipText = fc.getApproveButtonToolTipText();
    if (tooltipText != null) {
      return tooltipText;
    }
    if (fc.getDialogType() === JFileChooser.OPEN_DIALOG || fc.getDialogType() === JFileChooser.CUSTOM_DIALOG) {
      return this.openButtonToolTipText;
    } else if (fc.getDialogType() === JFileChooser.SAVE_DIALOG) {
      return this.saveButtonToolTipText;
    }
    return null;
  }
  /**
   * Clears the icon cache.
   */
  clearIconCache(): void {
    this.fileView.clearIconCache();
  }
  getHandler(): BasicFileChooserUI$Handler {
    if (this.handler == null) {
      this.handler = new BasicFileChooserUI$Handler().$o(this)._BasicFileChooserUI$Handler$();
    }
    return this.handler;
  }
  /**
   * Creates a double click listener.
   * @param fc the file chooser
   * @param list the list
   * @return a double click listener
   */
  createDoubleClickListener(fc: JFileChooser, list: JList<any>): MouseListener {
    return new BasicFileChooserUI$Handler().$o(this)._BasicFileChooserUI$Handler$JList(list);
  }
  /**
   * Creates a list selection listener.
   * @param fc the file chooser
   * @return a list selection listener
   */
  createListSelectionListener(fc: JFileChooser): ListSelectionListener {
    return $J.fn(this.getHandler(), 'valueChanged');
  }
  /**
   * Property to remember whether a directory is currently selected in the UI.
   *
   * @return <code>true</code> iff a directory is currently selected.
   * @since 1.4
   */
  isDirectorySelected(): boolean {
    return this.directorySelected;
  }
  /**
   * Property to remember whether a directory is currently selected in the UI.
   * This is normally called by the UI on a selection event.
   *
   * @param b iff a directory is currently selected.
   * @since 1.4
   */
  setDirectorySelected(b: boolean): void {
    this.directorySelected = b;
  }
  /**
   * Property to remember the directory that is currently selected in the UI.
   *
   * @return the value of the <code>directory</code> property
   * @see #setDirectory
   * @since 1.4
   */
  getDirectory(): File {
    return this.directory;
  }
  /**
   * Property to remember the directory that is currently selected in the UI.
   * This is normally called by the UI on a selection event.
   *
   * @param f the <code>File</code> object representing the directory that is
   *          currently selected
   * @since 1.4
   */
  setDirectory(f: File): void {
    this.directory = f;
  }
  /**
   * Returns the mnemonic for the given key.
   */
  getMnemonic$String$Locale$BasicFileChooserUI(key: string, l: Locale): number {
    return SwingUtilities2.getUIDefaultsInt$Object$Locale(key, l);
  }
  /**
   * Returns the default accept all file filter
   */
  getAcceptAllFileFilter(fc: JFileChooser): FileFilter {
    return this.acceptAllFileFilter;
  }
  getFileView(fc: JFileChooser): FileView {
    return this.fileView;
  }
  /**
   * {@inheritDoc}
   */
  getApproveButtonText(fc: JFileChooser): string {
    let buttonText = fc.getApproveButtonText();
    if (buttonText != null) {
      return buttonText;
    } else if (fc.getDialogType() === JFileChooser.OPEN_DIALOG || fc.getDialogType() === JFileChooser.CUSTOM_DIALOG) {
      return this.openButtonText;
    } else if (fc.getDialogType() === JFileChooser.SAVE_DIALOG) {
      return this.saveButtonText;
    } else {
      return null;
    }
  }
  /**
   * Returns a new folder action.
   * @return a new folder action
   */
  getNewFolderAction(): Action {
    if (this.newFolderAction == null) {
      this.newFolderAction = new BasicFileChooserUI$NewFolderAction().$o(this)._BasicFileChooserUI$NewFolderAction();
      if (this.readOnly) {
        this.newFolderAction.setEnabled(false);
      }
    }
    return this.newFolderAction;
  }
  /**
   * Returns a go home action.
   * @return a go home action
   */
  getGoHomeAction(): Action {
    return this.goHomeAction;
  }
  /**
   * Returns a change to parent directory action.
   * @return a change to parent directory action
   */
  getChangeToParentDirectoryAction(): Action {
    return this.changeToParentDirectoryAction;
  }
  /**
   * Returns an approve selection action.
   * @return an approve selection  action
   */
  getApproveSelectionAction(): Action {
    return this.approveSelectionAction;
  }
  /**
   * Returns a cancel selection action.
   * @return a cancel selection action
   */
  getCancelSelectionAction(): Action {
    return this.cancelSelectionAction;
  }
  resetGlobFilter(): void {
    if (this.actualFileFilter != null) {
      let chooser = this.getFileChooser();
      let currentFilter = chooser.getFileFilter();
      if (currentFilter != null && currentFilter.equals(this.globFilter)) {
        chooser.setFileFilter(this.actualFileFilter);
        chooser.removeChoosableFileFilter(this.globFilter);
      }
      this.actualFileFilter = null;
    }
  }
  static isGlobPattern(filename: string): boolean {
    return ((File.separatorChar === 92 /* \u005c */ && (filename.indexOf(String.fromCharCode(42 /* \u002a */)) >= 0 || filename.indexOf(String.fromCharCode(63 /* '?' */)) >= 0)) || (File.separatorChar === 47 /* \u002f */ && (filename.indexOf(String.fromCharCode(42 /* \u002a */)) >= 0 || filename.indexOf(String.fromCharCode(63 /* '?' */)) >= 0 || filename.indexOf(String.fromCharCode(91 /* '[' */)) >= 0)));
  }
  changeDirectory(dir: File): void {
    let fc = this.getFileChooser();
    if (dir != null) {
      try {
        let linkedTo = null;
        if (FilePane.usesShellFolder(fc)) {
          let shellFolder = ShellFolder.getShellFolder(dir);
          if (shellFolder.isLink()) {
            linkedTo = shellFolder.getLinkLocation();
            if (linkedTo == null) {
              dir = shellFolder;
            }
          }
        } else if (fc.getFileSystemView().isLink(dir)) {
          linkedTo = fc.getFileSystemView().getLinkLocation(dir);
        }
        if (linkedTo != null) {
          if (fc.isTraversable(linkedTo)) {
            dir = linkedTo;
          } else {
            return;
          }
        }
      } catch ($e0) {
        if ($J.isa($e0, FileNotFoundException)) {
          let ex = $J.exc($e0);
          return;
        } else {
          throw $e0;
        }
      }
    }
    fc.setCurrentDirectory(dir);
    if (fc.getFileSelectionMode() === JFileChooser.FILES_AND_DIRECTORIES && fc.getFileSystemView().isFileSystem(dir)) {
      this.setFileName(dir.getAbsolutePath());
    }
  }
  static $clinit() {
    BasicFileChooserUI.defaultTransferHandler = new BasicFileChooserUI$FileTransferHandler()._BasicFileChooserUI$FileTransferHandler();
  }
}

export class BasicFileChooserUI$Handler extends JObject {
  list: JList<any> = null;
  _BasicFileChooserUI$Handler$(): this {
    return this;
  }
  _BasicFileChooserUI$Handler$JList(list: JList<any>): this {
    this.list = list;
    return this;
  }
  mouseClicked(evt: MouseEvent): void {
    if (this.list != null && SwingUtilities.isLeftMouseButton(evt) && (evt.getClickCount() % 2 === 0)) {
      let index = SwingUtilities2.loc2IndexFileList(this.list, evt.getPoint());
      if (index >= 0) {
        let f = this.list.getModel().getElementAt(index);
        try {
          f = ShellFolder.getNormalizedFile(f);
        } catch ($e1) {
          if ($J.isa($e1, IOException)) {
            let ex = $J.exc($e1);
          } else {
            throw $e1;
          }
        }
        if (this.$outer.getFileChooser().isTraversable(f)) {
          this.list.clearSelection();
          this.$outer.changeDirectory(f);
        } else {
          this.$outer.getFileChooser().approveSelection();
        }
      }
    }
  }
  mouseEntered(evt: MouseEvent): void {
    if (this.list != null) {
      let th1 = this.$outer.getFileChooser().getTransferHandler();
      let th2 = this.list.getTransferHandler();
      if (th1 !== th2) {
        this.list.setTransferHandler(th1);
      }
      if (this.$outer.getFileChooser().getDragEnabled() !== this.list.getDragEnabled()) {
        this.list.setDragEnabled(this.$outer.getFileChooser().getDragEnabled());
      }
    }
  }
  mouseExited(evt: MouseEvent): void {
  }
  mousePressed(evt: MouseEvent): void {
  }
  mouseReleased(evt: MouseEvent): void {
  }
  valueChanged(evt: ListSelectionEvent): void {
    if (!evt.getValueIsAdjusting()) {
      let chooser = this.$outer.getFileChooser();
      let fsv = chooser.getFileSystemView();
      let list = evt.getSource();
      let fsm = chooser.getFileSelectionMode();
      let useSetDirectory = this.$outer.usesSingleFilePane && (fsm === JFileChooser.FILES_ONLY);
      if (chooser.isMultiSelectionEnabled()) {
        let files = null;
        let objects = list.getSelectedValues();
        if (objects != null) {
          if (objects.length === 1 && (objects[0]).isDirectory() && chooser.isTraversable((objects[0])) && (useSetDirectory || (!fsv.isFileSystem(objects[0])))) {
            this.$outer.setDirectorySelected(true);
            this.$outer.setDirectory((objects[0]));
          } else {
            let fList = new ArrayList(objects.length);
            for (let object$ of objects) {
              let f = object$;
              let isDir = f.isDirectory();
              if ((chooser.isFileSelectionEnabled() && !isDir) || (chooser.isDirectorySelectionEnabled() && fsv.isFileSystem(f) && isDir)) {
                fList.add(f);
              }
            }
            if (fList.size() > 0) {
              files = $J.toArrayInto(fList.toArray(), $J.newArray(fList.size(), null));
            }
            this.$outer.setDirectorySelected(false);
          }
        }
        chooser.setSelectedFiles(files);
      } else {
        let file = list.getSelectedValue();
        if (file != null && file.isDirectory() && chooser.isTraversable(file) && (useSetDirectory || !fsv.isFileSystem(file))) {
          this.$outer.setDirectorySelected(true);
          this.$outer.setDirectory(file);
          if (this.$outer.usesSingleFilePane) {
            chooser.setSelectedFile(null);
          }
        } else {
          this.$outer.setDirectorySelected(false);
          if (file != null) {
            chooser.setSelectedFile(file);
          }
        }
      }
    }
  }
}

/**
 * Creates a new folder.
 */
export class BasicFileChooserUI$NewFolderAction extends AbstractAction {
  /**
   * Constructs a {@code NewFolderAction}.
   */
  _BasicFileChooserUI$NewFolderAction(): this {
    this._AbstractAction$String(FilePane.ACTION_NEW_FOLDER);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(e: ActionEvent): void {
    if (this.$outer.readOnly) {
      return;
    }
    let fc = this.$outer.getFileChooser();
    let currentDirectory = fc.getCurrentDirectory();
    if (!currentDirectory.exists()) {
      JOptionPane.showMessageDialog$Component$Object$String$int(fc, this.$outer.newFolderParentDoesntExistText, this.$outer.newFolderParentDoesntExistTitleText, JOptionPane.WARNING_MESSAGE);
      return;
    }
    let newFolder: File;
    try {
      newFolder = fc.getFileSystemView().createNewFolder(currentDirectory);
      if (fc.isMultiSelectionEnabled()) {
        fc.setSelectedFiles([newFolder]);
      } else {
        fc.setSelectedFile(newFolder);
      }
    } catch ($e2) {
      if ($J.isa($e2, IOException)) {
        let exc = $J.exc($e2);
        JOptionPane.showMessageDialog$Component$Object$String$int(fc, this.$outer.newFolderErrorText + this.$outer.newFolderErrorSeparator + $J.str(exc), this.$outer.newFolderErrorText, JOptionPane.ERROR_MESSAGE);
        return;
      } else {
        throw $e2;
      }
    }
    fc.rescanCurrentDirectory();
  }
}

/**
 * Acts on the "home" key event or equivalent event.
 */
export class BasicFileChooserUI$GoHomeAction extends AbstractAction {
  /**
   * Constructs a {@code GoHomeAction}.
   */
  _BasicFileChooserUI$GoHomeAction(): this {
    this._AbstractAction$String('Go Home');
    return this;
  }
  actionPerformed(e: ActionEvent): void {
    let fc = this.$outer.getFileChooser();
    this.$outer.changeDirectory(fc.getFileSystemView().getHomeDirectory());
  }
}

/**
 * Change to parent directory action.
 */
export class BasicFileChooserUI$ChangeToParentDirectoryAction extends AbstractAction {
  /**
   * Constructs a {@code ChangeToParentDirectoryAction}.
   */
  _BasicFileChooserUI$ChangeToParentDirectoryAction(): this {
    this._AbstractAction$String('Go Up');
    this.putValue(Action.ACTION_COMMAND_KEY, FilePane.ACTION_CHANGE_TO_PARENT_DIRECTORY);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(e: ActionEvent): void {
    this.$outer.getFileChooser().changeToParentDirectory();
  }
}

/**
 * Responds to an Open or Save request
 */
export class BasicFileChooserUI$ApproveSelectionAction extends AbstractAction {
  /**
   * Constructs an {@code ApproveSelectionAction}.
   */
  _BasicFileChooserUI$ApproveSelectionAction(): this {
    this._AbstractAction$String(FilePane.ACTION_APPROVE_SELECTION);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(e: ActionEvent): void {
    if (this.$outer.isDirectorySelected()) {
      let dir = this.$outer.getDirectory();
      if (dir != null) {
        try {
          dir = ShellFolder.getNormalizedFile(dir);
        } catch ($e3) {
          if ($J.isa($e3, IOException)) {
            let ex = $J.exc($e3);
          } else {
            throw $e3;
          }
        }
        this.$outer.changeDirectory(dir);
        return;
      }
    }
    let chooser = this.$outer.getFileChooser();
    let filename = this.$outer.getFileName();
    let fs = chooser.getFileSystemView();
    let dir = chooser.getCurrentDirectory();
    if (filename == null || filename.length === 0) {
      this.$outer.resetGlobFilter();
      return;
    }
    let selectedFile = null;
    let selectedFiles = null;
    if (File.separatorChar === 47 /* \u002f */) {
      if (filename.startsWith('~/')) {
        filename = $J.system_getProperty('user.home') + filename.substring(1);
      } else if ($J.equals(filename, '~')) {
        filename = $J.system_getProperty('user.home');
      }
    }
    if (chooser.isMultiSelectionEnabled() && filename.length > 1 && filename.charCodeAt(0) === 34 /* '"' */ && filename.charCodeAt((filename.length - 1) | 0) === 34 /* '"' */) {
      let fList = new ArrayList();
      let files = JString.split(filename.substring(1, (filename.length - 1) | 0), '" "');
      Arrays.sort(files);
      let children = null;
      let childIndex = 0;
      for (let str of files) {
        let file = fs.createFileObject(str);
        if (!file.isAbsolute()) {
          if (children == null) {
            children = fs.getFiles(dir, false);
            Arrays.sort(children);
          }
          for (let k = 0; k < children.length; k++) {
            let l = ((childIndex + k) | 0) % children.length;
            if ($J.equals(children[l].getName(), str)) {
              file = children[l];
              childIndex = (l + 1) | 0;
              break;
            }
          }
        }
        fList.add(file);
      }
      if (!fList.isEmpty()) {
        selectedFiles = $J.toArrayInto(fList.toArray(), $J.newArray(fList.size(), null));
      }
      this.$outer.resetGlobFilter();
    } else {
      selectedFile = fs.createFileObject(filename);
      if (!selectedFile.isAbsolute()) {
        selectedFile = fs.getChild(dir, filename);
      }
      let currentFilter = chooser.getFileFilter();
      if (!selectedFile.exists() && BasicFileChooserUI.isGlobPattern(filename)) {
        this.$outer.changeDirectory(selectedFile.getParentFile());
        if (this.$outer.globFilter == null) {
          this.$outer.globFilter = new BasicFileChooserUI$GlobFilter()._BasicFileChooserUI$GlobFilter();
        }
        try {
          this.$outer.globFilter.setPattern(selectedFile.getName());
          if (!(currentFilter instanceof BasicFileChooserUI$GlobFilter)) {
            this.$outer.actualFileFilter = currentFilter;
          }
          chooser.setFileFilter(null);
          chooser.setFileFilter(this.$outer.globFilter);
          return;
        } catch ($e4) {
          if ($J.isa($e4, PatternSyntaxException)) {
            let pse = $J.exc($e4);
          } else {
            throw $e4;
          }
        }
      }
      this.$outer.resetGlobFilter();
      let isDir = (selectedFile != null && selectedFile.isDirectory());
      let isTrav = (selectedFile != null && chooser.isTraversable(selectedFile));
      let isDirSelEnabled = chooser.isDirectorySelectionEnabled();
      let isFileSelEnabled = chooser.isFileSelectionEnabled();
      let isCtrl = (e != null && (e.getModifiers() & Toolkit.getDefaultToolkit().getMenuShortcutKeyMask()) !== 0);
      if (isDir && isTrav && (isCtrl || !isDirSelEnabled)) {
        this.$outer.changeDirectory(selectedFile);
        return;
      } else if ((isDir || !isFileSelEnabled) && (!isDir || !isDirSelEnabled) && (!isDirSelEnabled || selectedFile.exists())) {
        selectedFile = null;
      }
    }
    if (selectedFiles != null || selectedFile != null) {
      if (selectedFiles != null || chooser.isMultiSelectionEnabled()) {
        if (selectedFiles == null) {
          selectedFiles = [selectedFile];
        }
        chooser.setSelectedFiles(selectedFiles);
        chooser.setSelectedFiles(selectedFiles);
      } else {
        chooser.setSelectedFile(selectedFile);
      }
      chooser.approveSelection();
    } else {
      if (chooser.isMultiSelectionEnabled()) {
        chooser.setSelectedFiles(null);
      } else {
        chooser.setSelectedFile(null);
      }
      chooser.cancelSelection();
    }
  }
}

export class BasicFileChooserUI$GlobFilter extends FileFilter {
  pattern: Pattern = null;
  globPattern: string = null;
  _BasicFileChooserUI$GlobFilter(): this {
    this._FileFilter();
    return this;
  }
  setPattern(globPattern: string): void {
    let gPat = JString.toCharArray(globPattern);
    let rPat = $J.newArray(Math.imul(gPat.length, 2), 0);
    let isWin32 = (File.separatorChar === 92 /* \u005c */);
    let inBrackets = false;
    let j = 0;
    this.globPattern = globPattern;
    if (isWin32) {
      let len = gPat.length;
      if (globPattern.endsWith('*.*')) {
        len = (len - 2) | 0;
      }
      for (let i = 0; i < len; i++) {
        switch (gPat[i]) {
          case 42 /* \u002a */:
            rPat[j++] = 46 /* '.' */;
            rPat[j++] = 42 /* \u002a */;
            break;
          case 63 /* '?' */:
            rPat[j++] = 46 /* '.' */;
            break;
          case 92 /* \u005c */:
            rPat[j++] = 92 /* \u005c */;
            rPat[j++] = 92 /* \u005c */;
            break;
          default:
            if ('+()^$.{}[]'.indexOf(String.fromCharCode(gPat[i])) >= 0) {
              rPat[j++] = 92 /* \u005c */;
            }
            rPat[j++] = gPat[i];
            break;
        }
      }
    } else {
      for (let i = 0; i < gPat.length; i++) {
        switch (gPat[i]) {
          case 42 /* \u002a */:
            if (!inBrackets) {
              rPat[j++] = 46 /* '.' */;
            }
            rPat[j++] = 42 /* \u002a */;
            break;
          case 63 /* '?' */:
            rPat[j++] = inBrackets ? 63 /* '?' */ : 46 /* '.' */;
            break;
          case 91 /* '[' */:
            inBrackets = true;
            rPat[j++] = gPat[i];
            if (i < ((gPat.length - 1) | 0)) {
              switch (gPat[(i + 1) | 0]) {
                case 33 /* '!' */:
                case 94 /* '^' */:
                  rPat[j++] = 94 /* '^' */;
                  i++;
                  break;
                case 93 /* ']' */:
                  rPat[j++] = gPat[++i];
                  break;
              }
            }
            break;
          case 93 /* ']' */:
            rPat[j++] = gPat[i];
            inBrackets = false;
            break;
          case 92 /* \u005c */:
            if (i === 0 && gPat.length > 1 && gPat[1] === 126 /* '~' */) {
              rPat[j++] = gPat[++i];
            } else {
              rPat[j++] = 92 /* \u005c */;
              if (i < ((gPat.length - 1) | 0) && '*?[]'.indexOf(String.fromCharCode(gPat[(i + 1) | 0])) >= 0) {
                rPat[j++] = gPat[++i];
              } else {
                rPat[j++] = 92 /* \u005c */;
              }
            }
            break;
          default:
            if (!Character.isLetterOrDigit(gPat[i])) {
              rPat[j++] = 92 /* \u005c */;
            }
            rPat[j++] = gPat[i];
            break;
        }
      }
    }
    this.pattern = Pattern.compile(JString.newString(rPat, 0, j), 2);
  }
  accept(f: File): boolean {
    if (f == null) {
      return false;
    }
    if (f.isDirectory()) {
      return true;
    }
    return this.pattern.matcher(f.getName()).matches();
  }
  getDescription(): string {
    return this.globPattern;
  }
}

/**
 * Responds to a cancel request.
 */
export class BasicFileChooserUI$CancelSelectionAction extends AbstractAction {
  /**
   * Constructs a {@code CancelSelectionAction}.
   */
  _BasicFileChooserUI$CancelSelectionAction(): this {
    this._AbstractAction$();
    return this;
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(e: ActionEvent): void {
    this.$outer.getFileChooser().cancelSelection();
  }
}

/**
 * Rescans the files in the current directory
 */
export class BasicFileChooserUI$UpdateAction extends AbstractAction {
  /**
   * Constructs an {@code UpdateAction}.
   */
  _BasicFileChooserUI$UpdateAction(): this {
    this._AbstractAction$();
    return this;
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(e: ActionEvent): void {
    let fc = this.$outer.getFileChooser();
    fc.setCurrentDirectory(fc.getFileSystemView().createFileObject(this.$outer.getDirectoryName()));
    fc.rescanCurrentDirectory();
  }
}

/**
 * Accept all file filter.
 */
export class BasicFileChooserUI$AcceptAllFileFilter extends FileFilter {
  /**
   * Constructs an {@code AcceptAllFileFilter}.
   */
  _BasicFileChooserUI$AcceptAllFileFilter(): this {
    this._FileFilter();
    return this;
  }
  /**
   * Returns true.
   * @param f the file
   * @return true
   */
  accept(f: File): boolean {
    return true;
  }
  /**
   * {@inheritDoc}
   */
  getDescription(): string {
    return UIManager.getString$Object('FileChooser.acceptAllFileFilterText');
  }
}

/**
 * A basic file view.
 */
export class BasicFileChooserUI$BasicFileView extends FileView {
  /**
   * The icon cache
   */
  iconCache: Hashtable<File, Icon> = null;
  /**
   * Constructs a {@code BasicFileView}.
   */
  _BasicFileChooserUI$BasicFileView(): this {
    this._FileView();
    this.iconCache = new Hashtable();
    return this;
  }
  /**
   * Clears the icon cache.
   */
  clearIconCache(): void {
    this.iconCache = new Hashtable();
  }
  /**
   * {@inheritDoc}
   */
  getName(f: File): string {
    let fileName = null;
    if (f != null) {
      fileName = this.$outer.getFileChooser().getFileSystemView().getSystemDisplayName(f);
    }
    return fileName;
  }
  /**
   * Returns the cached icon for the file.
   * @param f the file
   * @return the cached icon for the file
   */
  getCachedIcon(f: File): Icon {
    return this.iconCache.get(f);
  }
  /**
   * Caches an icon for a file.
   * @param f the file
   * @param i the icon
   */
  cacheIcon(f: File, i: Icon): void {
    if (f == null || i == null) {
      return;
    }
    this.iconCache.put(f, i);
  }
  /**
   * {@inheritDoc}
   */
  getIcon(f: File): Icon {
    let icon = this.getCachedIcon(f);
    if (icon != null) {
      return icon;
    }
    icon = this.$outer.fileIcon;
    if (f != null) {
      let fsv = this.$outer.getFileChooser().getFileSystemView();
      if (fsv.isFloppyDrive(f)) {
        icon = this.$outer.floppyDriveIcon;
      } else if (fsv.isDrive(f)) {
        icon = this.$outer.hardDriveIcon;
      } else if (fsv.isComputerNode(f)) {
        icon = this.$outer.computerIcon;
      } else if (f.isDirectory()) {
        icon = this.$outer.directoryIcon;
      }
    }
    this.cacheIcon(f, icon);
    return icon;
  }
}

/**
 * Data transfer support for the file chooser.  Since files are currently presented
 * as a list, the list support is reused with the added flavor of DataFlavor.javaFileListFlavor
 */
export class BasicFileChooserUI$FileTransferHandler extends TransferHandler {
  _BasicFileChooserUI$FileTransferHandler(): this {
    this._TransferHandler$();
    return this;
  }
  /**
   * Create a Transferable to use as the source for a data transfer.
   *
   * @param c  The component holding the data to be transferred.  This
   *  argument is provided to enable sharing of TransferHandlers by
   *  multiple components.
   * @return  The representation of the data to be transferred.
   */
  createTransferable(c: JComponent): Transferable {
    let values = null;
    if (c instanceof JList) {
      values = (c).getSelectedValues();
    } else if (c instanceof JTable) {
      let table = c;
      let rows = table.getSelectedRows();
      if (rows != null) {
        values = $J.newArray(rows.length, null);
        for (let i = 0; i < rows.length; i++) {
          values[i] = table.getValueAt(rows[i], 0);
        }
      }
    }
    if (values == null || values.length === 0) {
      return null;
    }
    let plainBuf = new StringBuilder();
    let htmlBuf = new StringBuilder();
    htmlBuf.append('<html>\n<body>\n<ul>\n');
    for (let obj of values) {
      let val = ((obj == null) ? '' : $J.str(obj));
      plainBuf.append(val).append(String.fromCharCode(10 /* \u000a */));
      htmlBuf.append('  <li>').append(val).append(String.fromCharCode(10 /* \u000a */));
    }
    plainBuf.deleteCharAt((plainBuf.length() - 1) | 0);
    htmlBuf.append('</ul>\n</body>\n</html>');
    return new BasicFileChooserUI$FileTransferHandler$FileTransferable()._BasicFileChooserUI$FileTransferHandler$FileTransferable(plainBuf.toString(), htmlBuf.toString(), values);
  }
  getSourceActions(c: JComponent): number {
    return TransferHandler.COPY;
  }
}

export class BasicFileChooserUI$FileTransferHandler$FileTransferable extends BasicTransferable {
  fileData: any[] = null;
  _BasicFileChooserUI$FileTransferHandler$FileTransferable(plainData: string, htmlData: string, fileData: any[]): this {
    this._BasicTransferable(plainData, htmlData);
    this.fileData = fileData;
    return this;
  }
  /**
   * Best format of the file chooser is DataFlavor.javaFileListFlavor.
   */
  getRicherFlavors(): DataFlavor[] {
    let flavors = $J.newArray(1, null);
    flavors[0] = DataFlavor.javaFileListFlavor;
    return flavors;
  }
  /**
   * The only richer format supported is the file list flavor
   */
  getRicherData(flavor: DataFlavor): any {
    if (DataFlavor.javaFileListFlavor.equals(flavor)) {
      let files = new ArrayList();
      for (let file of this.fileData) {
        files.add(file);
      }
      return files;
    }
    return null;
  }
}

let $BasicFileChooserUI$1: any = null;
/** An anonymous class (BasicFileChooserUI.java:317). */
function BasicFileChooserUI$1(): any {
  return $BasicFileChooserUI$1 ??= $J.local(class extends UIAction {
    actionPerformed(evt: ActionEvent): void {
      this.$outer.getFileChooser().rescanCurrentDirectory();
    }
  }, 'javax.swing.plaf.basic.BasicFileChooserUI$1', []);
}

$J.define(BasicFileChooserUI, 'javax.swing.plaf.basic.BasicFileChooserUI', { kind: 'class', sup: 'javax.swing.plaf.FileChooserUI', ctors: { 'javax.swing.JFileChooser': '_BasicFileChooserUI' }, meths: { 'getMnemonic(java.lang.String,java.util.Locale)': 'getMnemonic$String$Locale$BasicFileChooserUI', 'createActionMap()': 'createActionMap$', 'getActionMap()': 'getActionMap$' }, clinit: true, lazy: ['defaultTransferHandler'] });
$J.define(BasicFileChooserUI$Handler, 'javax.swing.plaf.basic.BasicFileChooserUI$Handler', { kind: 'class', ifaces: ['java.awt.event.MouseListener', 'javax.swing.event.ListSelectionListener'], sup: 'java.lang.Object', ctors: { 'javax.swing.JList': '_BasicFileChooserUI$Handler$JList', '': '_BasicFileChooserUI$Handler$' }, inner: true });
$J.define(BasicFileChooserUI$NewFolderAction, 'javax.swing.plaf.basic.BasicFileChooserUI$NewFolderAction', { kind: 'class', sup: 'javax.swing.AbstractAction', ctors: { '': '_BasicFileChooserUI$NewFolderAction' }, inner: true });
$J.define(BasicFileChooserUI$GoHomeAction, 'javax.swing.plaf.basic.BasicFileChooserUI$GoHomeAction', { kind: 'class', sup: 'javax.swing.AbstractAction', ctors: { '': '_BasicFileChooserUI$GoHomeAction' }, inner: true });
$J.define(BasicFileChooserUI$ChangeToParentDirectoryAction, 'javax.swing.plaf.basic.BasicFileChooserUI$ChangeToParentDirectoryAction', { kind: 'class', sup: 'javax.swing.AbstractAction', ctors: { '': '_BasicFileChooserUI$ChangeToParentDirectoryAction' }, inner: true });
$J.define(BasicFileChooserUI$ApproveSelectionAction, 'javax.swing.plaf.basic.BasicFileChooserUI$ApproveSelectionAction', { kind: 'class', sup: 'javax.swing.AbstractAction', ctors: { '': '_BasicFileChooserUI$ApproveSelectionAction' }, inner: true });
$J.define(BasicFileChooserUI$GlobFilter, 'javax.swing.plaf.basic.BasicFileChooserUI$GlobFilter', { kind: 'class', sup: 'javax.swing.filechooser.FileFilter', ctors: { '': '_BasicFileChooserUI$GlobFilter' } });
$J.define(BasicFileChooserUI$CancelSelectionAction, 'javax.swing.plaf.basic.BasicFileChooserUI$CancelSelectionAction', { kind: 'class', sup: 'javax.swing.AbstractAction', ctors: { '': '_BasicFileChooserUI$CancelSelectionAction' }, inner: true });
$J.define(BasicFileChooserUI$UpdateAction, 'javax.swing.plaf.basic.BasicFileChooserUI$UpdateAction', { kind: 'class', sup: 'javax.swing.AbstractAction', ctors: { '': '_BasicFileChooserUI$UpdateAction' }, inner: true });
$J.define(BasicFileChooserUI$AcceptAllFileFilter, 'javax.swing.plaf.basic.BasicFileChooserUI$AcceptAllFileFilter', { kind: 'class', sup: 'javax.swing.filechooser.FileFilter', ctors: { '': '_BasicFileChooserUI$AcceptAllFileFilter' }, inner: true });
$J.define(BasicFileChooserUI$BasicFileView, 'javax.swing.plaf.basic.BasicFileChooserUI$BasicFileView', { kind: 'class', sup: 'javax.swing.filechooser.FileView', ctors: { '': '_BasicFileChooserUI$BasicFileView' }, inner: true });
$J.define(BasicFileChooserUI$FileTransferHandler, 'javax.swing.plaf.basic.BasicFileChooserUI$FileTransferHandler', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.TransferHandler', ctors: { '': '_BasicFileChooserUI$FileTransferHandler' } });
$J.define(BasicFileChooserUI$FileTransferHandler$FileTransferable, 'javax.swing.plaf.basic.BasicFileChooserUI$FileTransferHandler$FileTransferable', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicTransferable', ctors: { 'java.lang.String,java.lang.String,java.lang.Object[]': '_BasicFileChooserUI$FileTransferHandler$FileTransferable' } });
$J.module(() => {
  BorderLayout = $J.load('java.awt.BorderLayout');
  Action = $J.load('javax.swing.Action');
  JComponent = $J.load('javax.swing.JComponent');
  JFileChooser = $J.load('javax.swing.JFileChooser');
  JList = $J.load('javax.swing.JList');
  JOptionPane = $J.load('javax.swing.JOptionPane');
  JPanel = $J.load('javax.swing.JPanel');
  JTable = $J.load('javax.swing.JTable');
  LookAndFeel = $J.load('javax.swing.LookAndFeel');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIManager = $J.load('javax.swing.UIManager');
  ActionMapUIResource = $J.load('javax.swing.plaf.ActionMapUIResource');
  UIResource = $J.load('javax.swing.plaf.UIResource');
  BasicDirectoryModel = $J.load('javax.swing.plaf.basic.BasicDirectoryModel');
  DefaultLookup = $J.load('sun.swing.DefaultLookup');
  FilePane = $J.load('sun.swing.FilePane');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
  UIAction = $J.load('sun.swing.UIAction');
});
