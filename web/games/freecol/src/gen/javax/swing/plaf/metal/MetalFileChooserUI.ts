// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/metal/MetalFileChooserUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2022, Oracle and/or its affiliates. All rights reserved.
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
import { $J, ArrayList, Arrays, FileNotFoundException, IOException, JObject, ShellFolder, StringBuilder, Vector } from '../../../../../jre/index.ts';
import { BasicFileChooserUI } from '../basic/BasicFileChooserUI.ts';
import { DefaultListCellRenderer } from '../../DefaultListCellRenderer.ts';
import { AbstractListModel } from '../../AbstractListModel.ts';
import { AbstractAction } from '../../AbstractAction.ts';
import { JLabel } from '../../JLabel.ts';

let BorderLayout, Component, Dimension, Insets, FocusAdapter, AccessibleContext, Box, BoxLayout, ButtonGroup, JButton, JComboBox, JFileChooser, JPanel, JTextField, JToggleButton, SwingUtilities, UIManager, EmptyBorder, FileFilter, ActionMapUIResource, FilePane, SwingUtilities2;

/**
 * Metal L&amp;F implementation of a FileChooser.
 *
 * @author Jeff Dinkins
 */
export class MetalFileChooserUI extends BasicFileChooserUI {
  lookInLabel: JLabel = null;
  directoryComboBox: JComboBox<any> = null;
  directoryComboBoxModel: MetalFileChooserUI$DirectoryComboBoxModel = null;
  directoryComboBoxAction: Action = null;
  filterComboBoxModel: MetalFileChooserUI$FilterComboBoxModel = null;
  fileNameTextField: JTextField = null;
  filePane: FilePane = null;
  listViewButton: JToggleButton = null;
  detailsViewButton: JToggleButton = null;
  approveButton: JButton = null;
  cancelButton: JButton = null;
  buttonPanel: JPanel = null;
  bottomPanel: JPanel = null;
  filterComboBox: JComboBox<any> = null;
  static hstrut5: Dimension = null;
  static hstrut11: Dimension = null;
  static vstrut5: Dimension = null;
  static shrinkwrap: Insets = null;
  static PREF_WIDTH: number = 0;
  static PREF_HEIGHT: number = 0;
  static PREF_SIZE: Dimension = null;
  static MIN_WIDTH: number = 0;
  static MIN_HEIGHT: number = 0;
  static LIST_PREF_WIDTH: number = 0;
  static LIST_PREF_HEIGHT: number = 0;
  static LIST_PREF_SIZE: Dimension = null;
  lookInLabelMnemonic: number = 0;
  lookInLabelText: string = null;
  saveInLabelText: string = null;
  fileNameLabelMnemonic: number = 0;
  fileNameLabelText: string = null;
  folderNameLabelMnemonic: number = 0;
  folderNameLabelText: string = null;
  filesOfTypeLabelMnemonic: number = 0;
  filesOfTypeLabelText: string = null;
  upFolderToolTipText: string = null;
  upFolderAccessibleName: string = null;
  homeFolderToolTipText: string = null;
  homeFolderAccessibleName: string = null;
  newFolderToolTipText: string = null;
  newFolderAccessibleName: string = null;
  listViewButtonToolTipText: string = null;
  listViewButtonAccessibleName: string = null;
  detailsViewButtonToolTipText: string = null;
  detailsViewButtonAccessibleName: string = null;
  fileNameLabel: MetalFileChooserUI$AlignedLabel = null;
  static readonly space: number = 10;
  /**
   * Constructs a new instance of {@code MetalFileChooserUI}.
   *
   * @param filechooser a {@code JFileChooser}
   */
  _MetalFileChooserUI(filechooser: JFileChooser): this {
    this._BasicFileChooserUI(filechooser);
    this.directoryComboBoxAction = new MetalFileChooserUI$DirectoryComboBoxAction().$o(this)._MetalFileChooserUI$DirectoryComboBoxAction();
    this.lookInLabelMnemonic = 0;
    this.lookInLabelText = null;
    this.saveInLabelText = null;
    this.fileNameLabelMnemonic = 0;
    this.fileNameLabelText = null;
    this.folderNameLabelMnemonic = 0;
    this.folderNameLabelText = null;
    this.filesOfTypeLabelMnemonic = 0;
    this.filesOfTypeLabelText = null;
    this.upFolderToolTipText = null;
    this.upFolderAccessibleName = null;
    this.homeFolderToolTipText = null;
    this.homeFolderAccessibleName = null;
    this.newFolderToolTipText = null;
    this.newFolderAccessibleName = null;
    this.listViewButtonToolTipText = null;
    this.listViewButtonAccessibleName = null;
    this.detailsViewButtonToolTipText = null;
    this.detailsViewButtonAccessibleName = null;
    return this;
  }
  populateFileNameLabel(): void {
    if (this.getFileChooser().getFileSelectionMode() === JFileChooser.DIRECTORIES_ONLY) {
      this.fileNameLabel.setText(this.folderNameLabelText);
      this.fileNameLabel.setDisplayedMnemonic$int(this.folderNameLabelMnemonic);
    } else {
      this.fileNameLabel.setText(this.fileNameLabelText);
      this.fileNameLabel.setDisplayedMnemonic$int(this.fileNameLabelMnemonic);
    }
  }
  /**
   * Constructs a new instance of {@code MetalFileChooserUI}.
   *
   * @param c a component
   * @return a new instance of {@code MetalFileChooserUI}
   */
  static createUI(c: JComponent): ComponentUI {
    return new MetalFileChooserUI()._MetalFileChooserUI(c);
  }
  installUI(c: JComponent): void {
    super.installUI(c);
  }
  uninstallComponents(fc: JFileChooser): void {
    fc.removeAll();
    this.bottomPanel = null;
    this.buttonPanel = null;
  }
  installComponents(fc: JFileChooser): void {
    let fsv = fc.getFileSystemView();
    fc.setBorder(new EmptyBorder()._EmptyBorder$int$int$int$int(12, 12, 11, 11));
    fc.setLayout(new BorderLayout()._BorderLayout$int$int(0, 11));
    this.filePane = new FilePane()._FilePane(new MetalFileChooserUI$MetalFileChooserUIAccessor().$o(this)._MetalFileChooserUI$MetalFileChooserUIAccessor());
    fc.addPropertyChangeListener$PropertyChangeListener($J.fn(this.filePane, 'propertyChange'));
    let topPanel = new JPanel()._JPanel$LayoutManager(new BorderLayout()._BorderLayout$int$int(11, 0));
    let topButtonPanel = new JPanel()._JPanel$();
    topButtonPanel.setLayout(new BoxLayout()._BoxLayout$Container$int(topButtonPanel, BoxLayout.LINE_AXIS));
    topPanel.add$Component$Object(topButtonPanel, BorderLayout.AFTER_LINE_ENDS);
    fc.add$Component$Object(topPanel, BorderLayout.NORTH);
    this.lookInLabel = new JLabel()._JLabel$String(this.lookInLabelText);
    this.lookInLabel.setDisplayedMnemonic$int(this.lookInLabelMnemonic);
    topPanel.add$Component$Object(this.lookInLabel, BorderLayout.BEFORE_LINE_BEGINS);
    let tmp1 = new (MetalFileChooserUI$1())().$o(this)._JComboBox$();
    this.directoryComboBox = tmp1;
    this.directoryComboBox.putClientProperty(AccessibleContext.ACCESSIBLE_DESCRIPTION_PROPERTY, this.lookInLabelText);
    this.directoryComboBox.putClientProperty('JComboBox.isTableCellEditor', true);
    this.lookInLabel.setLabelFor(this.directoryComboBox);
    this.directoryComboBoxModel = this.createDirectoryComboBoxModel(fc);
    this.directoryComboBox.setModel(this.directoryComboBoxModel);
    this.directoryComboBox.addActionListener($J.fn(this.directoryComboBoxAction, 'actionPerformed'));
    this.directoryComboBox.setRenderer(this.createDirectoryComboBoxRenderer(fc));
    this.directoryComboBox.setAlignmentX(Component.LEFT_ALIGNMENT);
    this.directoryComboBox.setAlignmentY(Component.TOP_ALIGNMENT);
    this.directoryComboBox.setMaximumRowCount(8);
    topPanel.add$Component$Object(this.directoryComboBox, BorderLayout.CENTER);
    let upFolderButton = new JButton()._JButton$Action(this.getChangeToParentDirectoryAction());
    upFolderButton.setText(null);
    upFolderButton.setIcon(this.upFolderIcon);
    upFolderButton.setToolTipText(this.upFolderToolTipText);
    upFolderButton.putClientProperty(AccessibleContext.ACCESSIBLE_NAME_PROPERTY, this.upFolderAccessibleName);
    upFolderButton.setAlignmentX(Component.LEFT_ALIGNMENT);
    upFolderButton.setAlignmentY(Component.CENTER_ALIGNMENT);
    upFolderButton.setMargin(MetalFileChooserUI.shrinkwrap);
    topButtonPanel.add$Component(upFolderButton);
    topButtonPanel.add$Component(Box.createRigidArea(MetalFileChooserUI.hstrut5));
    let homeDir = fsv.getHomeDirectory();
    let toolTipText = this.homeFolderToolTipText;
    let b = new JButton()._JButton$Icon(this.homeFolderIcon);
    b.setToolTipText(toolTipText);
    b.putClientProperty(AccessibleContext.ACCESSIBLE_NAME_PROPERTY, this.homeFolderAccessibleName);
    b.setAlignmentX(Component.LEFT_ALIGNMENT);
    b.setAlignmentY(Component.CENTER_ALIGNMENT);
    b.setMargin(MetalFileChooserUI.shrinkwrap);
    b.addActionListener($J.fn(this.getGoHomeAction(), 'actionPerformed'));
    topButtonPanel.add$Component(b);
    topButtonPanel.add$Component(Box.createRigidArea(MetalFileChooserUI.hstrut5));
    if (!UIManager.getBoolean$Object('FileChooser.readOnly')) {
      b = new JButton()._JButton$Action(this.filePane.getNewFolderAction());
      b.setText(null);
      b.setIcon(this.newFolderIcon);
      b.setToolTipText(this.newFolderToolTipText);
      b.putClientProperty(AccessibleContext.ACCESSIBLE_NAME_PROPERTY, this.newFolderAccessibleName);
      b.setAlignmentX(Component.LEFT_ALIGNMENT);
      b.setAlignmentY(Component.CENTER_ALIGNMENT);
      b.setMargin(MetalFileChooserUI.shrinkwrap);
    }
    topButtonPanel.add$Component(b);
    topButtonPanel.add$Component(Box.createRigidArea(MetalFileChooserUI.hstrut5));
    let viewButtonGroup = new ButtonGroup()._ButtonGroup();
    this.listViewButton = new JToggleButton()._JToggleButton$Icon(this.listViewIcon);
    this.listViewButton.setToolTipText(this.listViewButtonToolTipText);
    this.listViewButton.putClientProperty(AccessibleContext.ACCESSIBLE_NAME_PROPERTY, this.listViewButtonAccessibleName);
    this.listViewButton.setSelected(true);
    this.listViewButton.setAlignmentX(Component.LEFT_ALIGNMENT);
    this.listViewButton.setAlignmentY(Component.CENTER_ALIGNMENT);
    this.listViewButton.setMargin(MetalFileChooserUI.shrinkwrap);
    this.listViewButton.addActionListener($J.fn(this.filePane.getViewTypeAction(FilePane.VIEWTYPE_LIST), 'actionPerformed'));
    topButtonPanel.add$Component(this.listViewButton);
    viewButtonGroup.add(this.listViewButton);
    this.detailsViewButton = new JToggleButton()._JToggleButton$Icon(this.detailsViewIcon);
    this.detailsViewButton.setToolTipText(this.detailsViewButtonToolTipText);
    this.detailsViewButton.putClientProperty(AccessibleContext.ACCESSIBLE_NAME_PROPERTY, this.detailsViewButtonAccessibleName);
    this.detailsViewButton.setAlignmentX(Component.LEFT_ALIGNMENT);
    this.detailsViewButton.setAlignmentY(Component.CENTER_ALIGNMENT);
    this.detailsViewButton.setMargin(MetalFileChooserUI.shrinkwrap);
    this.detailsViewButton.addActionListener($J.fn(this.filePane.getViewTypeAction(FilePane.VIEWTYPE_DETAILS), 'actionPerformed'));
    topButtonPanel.add$Component(this.detailsViewButton);
    viewButtonGroup.add(this.detailsViewButton);
    this.filePane.addPropertyChangeListener$PropertyChangeListener((e) => {
      if ($J.equals('viewType', e.getPropertyName())) {
        let viewType = this.filePane.getViewType();
        switch (viewType) {
          case FilePane.VIEWTYPE_LIST:
            this.listViewButton.setSelected(true);
            break;
          case FilePane.VIEWTYPE_DETAILS:
            this.detailsViewButton.setSelected(true);
            break;
        }
      }
    });
    fc.add$Component$Object(this.getAccessoryPanel(), BorderLayout.AFTER_LINE_ENDS);
    let accessory = fc.getAccessory();
    if (accessory != null) {
      this.getAccessoryPanel().add$Component(accessory);
    }
    this.filePane.setPreferredSize(MetalFileChooserUI.LIST_PREF_SIZE);
    fc.add$Component$Object(this.filePane, BorderLayout.CENTER);
    let bottomPanel = this.getBottomPanel();
    bottomPanel.setLayout(new BoxLayout()._BoxLayout$Container$int(bottomPanel, BoxLayout.Y_AXIS));
    fc.add$Component$Object(bottomPanel, BorderLayout.SOUTH);
    let fileNamePanel = new JPanel()._JPanel$();
    fileNamePanel.setLayout(new BoxLayout()._BoxLayout$Container$int(fileNamePanel, BoxLayout.LINE_AXIS));
    bottomPanel.add$Component(fileNamePanel);
    bottomPanel.add$Component(Box.createRigidArea(MetalFileChooserUI.vstrut5));
    this.fileNameLabel = new MetalFileChooserUI$AlignedLabel()._MetalFileChooserUI$AlignedLabel$();
    this.populateFileNameLabel();
    fileNamePanel.add$Component(this.fileNameLabel);
    let tmp2 = new (MetalFileChooserUI$3())().$o(this)._JTextField$int(35);
    this.fileNameTextField = tmp2;
    fileNamePanel.add$Component(this.fileNameTextField);
    this.fileNameLabel.setLabelFor(this.fileNameTextField);
    this.fileNameTextField.addFocusListener(new (MetalFileChooserUI$4())().$o(this)._FocusAdapter());
    if (fc.isMultiSelectionEnabled()) {
      this.setFileName(this.fileNameString$FileArr$MetalFileChooserUI(fc.getSelectedFiles()));
    } else {
      this.setFileName(this.fileNameString$File$MetalFileChooserUI(fc.getSelectedFile()));
    }
    let filesOfTypePanel = new JPanel()._JPanel$();
    filesOfTypePanel.setLayout(new BoxLayout()._BoxLayout$Container$int(filesOfTypePanel, BoxLayout.LINE_AXIS));
    bottomPanel.add$Component(filesOfTypePanel);
    let filesOfTypeLabel = new MetalFileChooserUI$AlignedLabel()._MetalFileChooserUI$AlignedLabel$String(this.filesOfTypeLabelText);
    filesOfTypeLabel.setDisplayedMnemonic$int(this.filesOfTypeLabelMnemonic);
    filesOfTypePanel.add$Component(filesOfTypeLabel);
    this.filterComboBoxModel = this.createFilterComboBoxModel();
    fc.addPropertyChangeListener$PropertyChangeListener($J.fn(this.filterComboBoxModel, 'propertyChange'));
    this.filterComboBox = new JComboBox()._JComboBox$ComboBoxModel(this.filterComboBoxModel);
    this.filterComboBox.putClientProperty(AccessibleContext.ACCESSIBLE_DESCRIPTION_PROPERTY, this.filesOfTypeLabelText);
    filesOfTypeLabel.setLabelFor(this.filterComboBox);
    this.filterComboBox.setRenderer(this.createFilterComboBoxRenderer());
    filesOfTypePanel.add$Component(this.filterComboBox);
    this.getButtonPanel().setLayout(new MetalFileChooserUI$ButtonAreaLayout()._MetalFileChooserUI$ButtonAreaLayout());
    this.approveButton = new JButton()._JButton$String(this.getApproveButtonText(fc));
    this.approveButton.addActionListener($J.fn(this.getApproveSelectionAction(), 'actionPerformed'));
    this.approveButton.setToolTipText(this.getApproveButtonToolTipText(fc));
    this.getButtonPanel().add$Component(this.approveButton);
    this.cancelButton = new JButton()._JButton$String(this.cancelButtonText);
    this.cancelButton.setToolTipText(this.cancelButtonToolTipText);
    this.cancelButton.addActionListener($J.fn(this.getCancelSelectionAction(), 'actionPerformed'));
    this.getButtonPanel().add$Component(this.cancelButton);
    if (fc.getControlButtonsAreShown()) {
      this.addControlButtons();
    }
    MetalFileChooserUI.groupLabels([this.fileNameLabel, filesOfTypeLabel]);
  }
  /**
   * Returns the button panel.
   *
   * @return the button panel
   */
  getButtonPanel(): JPanel {
    if (this.buttonPanel == null) {
      this.buttonPanel = new JPanel()._JPanel$();
    }
    return this.buttonPanel;
  }
  /**
   * Returns the bottom panel.
   *
   * @return the bottom panel
   */
  getBottomPanel(): JPanel {
    if (this.bottomPanel == null) {
      this.bottomPanel = new JPanel()._JPanel$();
    }
    return this.bottomPanel;
  }
  installStrings(fc: JFileChooser): void {
    super.installStrings(fc);
    let l = fc.getLocale$();
    this.lookInLabelMnemonic = this.getMnemonic$String$Locale$MetalFileChooserUI('FileChooser.lookInLabelMnemonic', l);
    this.lookInLabelText = UIManager.getString$Object$Locale('FileChooser.lookInLabelText', l);
    this.saveInLabelText = UIManager.getString$Object$Locale('FileChooser.saveInLabelText', l);
    this.fileNameLabelMnemonic = this.getMnemonic$String$Locale$MetalFileChooserUI('FileChooser.fileNameLabelMnemonic', l);
    this.fileNameLabelText = UIManager.getString$Object$Locale('FileChooser.fileNameLabelText', l);
    this.folderNameLabelMnemonic = this.getMnemonic$String$Locale$MetalFileChooserUI('FileChooser.folderNameLabelMnemonic', l);
    this.folderNameLabelText = UIManager.getString$Object$Locale('FileChooser.folderNameLabelText', l);
    this.filesOfTypeLabelMnemonic = this.getMnemonic$String$Locale$MetalFileChooserUI('FileChooser.filesOfTypeLabelMnemonic', l);
    this.filesOfTypeLabelText = UIManager.getString$Object$Locale('FileChooser.filesOfTypeLabelText', l);
    this.upFolderToolTipText = UIManager.getString$Object$Locale('FileChooser.upFolderToolTipText', l);
    this.upFolderAccessibleName = UIManager.getString$Object$Locale('FileChooser.upFolderAccessibleName', l);
    this.homeFolderToolTipText = UIManager.getString$Object$Locale('FileChooser.homeFolderToolTipText', l);
    this.homeFolderAccessibleName = UIManager.getString$Object$Locale('FileChooser.homeFolderAccessibleName', l);
    this.newFolderToolTipText = UIManager.getString$Object$Locale('FileChooser.newFolderToolTipText', l);
    this.newFolderAccessibleName = UIManager.getString$Object$Locale('FileChooser.newFolderAccessibleName', l);
    this.listViewButtonToolTipText = UIManager.getString$Object$Locale('FileChooser.listViewButtonToolTipText', l);
    this.listViewButtonAccessibleName = UIManager.getString$Object$Locale('FileChooser.listViewButtonAccessibleName', l);
    this.detailsViewButtonToolTipText = UIManager.getString$Object$Locale('FileChooser.detailsViewButtonToolTipText', l);
    this.detailsViewButtonAccessibleName = UIManager.getString$Object$Locale('FileChooser.detailsViewButtonAccessibleName', l);
  }
  getMnemonic$String$Locale$MetalFileChooserUI(key: string, l: Locale): number {
    return SwingUtilities2.getUIDefaultsInt$Object$Locale(key, l);
  }
  installListeners(fc: JFileChooser): void {
    super.installListeners(fc);
    let actionMap = this.getActionMap$();
    SwingUtilities.replaceUIActionMap(fc, actionMap);
  }
  /**
   * Returns an instance of {@code ActionMap}.
   *
   * @return an instance of {@code ActionMap}
   */
  getActionMap$(): ActionMap {
    return this.createActionMap$();
  }
  /**
   * Constructs an instance of {@code ActionMap}.
   *
   * @return an instance of {@code ActionMap}
   */
  createActionMap$(): ActionMap {
    let map = new ActionMapUIResource()._ActionMapUIResource();
    FilePane.addActionsToMap(map, this.filePane.getActions());
    return map;
  }
  /**
   * Constructs a details view.
   *
   * @param fc a {@code JFileChooser}
   * @return the list
   */
  createList(fc: JFileChooser): JPanel {
    return this.filePane.createList();
  }
  /**
   * Constructs a details view.
   *
   * @param fc a {@code JFileChooser}
   * @return the details view
   */
  createDetailsView(fc: JFileChooser): JPanel {
    return this.filePane.createDetailsView();
  }
  /**
   * Creates a selection listener for the list of files and directories.
   *
   * @param fc a <code>JFileChooser</code>
   * @return a <code>ListSelectionListener</code>
   */
  createListSelectionListener(fc: JFileChooser): ListSelectionListener {
    return super.createListSelectionListener(fc);
  }
  uninstallUI(c: JComponent): void {
    c.removePropertyChangeListener$PropertyChangeListener($J.fn(this.filterComboBoxModel, 'propertyChange'));
    c.removePropertyChangeListener$PropertyChangeListener($J.fn(this.filePane, 'propertyChange'));
    this.cancelButton.removeActionListener($J.fn(this.getCancelSelectionAction(), 'actionPerformed'));
    this.approveButton.removeActionListener($J.fn(this.getApproveSelectionAction(), 'actionPerformed'));
    this.fileNameTextField.removeActionListener($J.fn(this.getApproveSelectionAction(), 'actionPerformed'));
    if (this.filePane != null) {
      this.filePane.uninstallUI();
      this.filePane = null;
    }
    super.uninstallUI(c);
  }
  /**
   * Returns the preferred size of the specified
   * <code>JFileChooser</code>.
   * The preferred size is at least as large,
   * in both height and width,
   * as the preferred size recommended
   * by the file chooser's layout manager.
   *
   * @param c  a <code>JFileChooser</code>
   * @return   a <code>Dimension</code> specifying the preferred
   *           width and height of the file chooser
   */
  getPreferredSize$JComponent(c: JComponent): Dimension {
    let prefWidth = MetalFileChooserUI.PREF_SIZE.width_;
    let d = c.getLayout().preferredLayoutSize(c);
    if (d != null) {
      return new Dimension()._Dimension$int$int(d.width_ < prefWidth ? prefWidth : d.width_, d.height_ < MetalFileChooserUI.PREF_SIZE.height_ ? MetalFileChooserUI.PREF_SIZE.height_ : d.height_);
    } else {
      return new Dimension()._Dimension$int$int(prefWidth, MetalFileChooserUI.PREF_SIZE.height_);
    }
  }
  /**
   * Returns the minimum size of the <code>JFileChooser</code>.
   *
   * @param c  a <code>JFileChooser</code>
   * @return   a <code>Dimension</code> specifying the minimum
   *           width and height of the file chooser
   */
  getMinimumSize(c: JComponent): Dimension {
    return new Dimension()._Dimension$int$int(MetalFileChooserUI.MIN_WIDTH, MetalFileChooserUI.MIN_HEIGHT);
  }
  /**
   * Returns the maximum size of the <code>JFileChooser</code>.
   *
   * @param c  a <code>JFileChooser</code>
   * @return   a <code>Dimension</code> specifying the maximum
   *           width and height of the file chooser
   */
  getMaximumSize(c: JComponent): Dimension {
    return new Dimension()._Dimension$int$int(2147483647, 2147483647);
  }
  fileNameString$File$MetalFileChooserUI(file: File): string {
    if (file == null) {
      return null;
    } else {
      let fc = this.getFileChooser();
      if ((fc.isDirectorySelectionEnabled() && !fc.isFileSelectionEnabled()) || (fc.isDirectorySelectionEnabled() && fc.isFileSelectionEnabled() && fc.getFileSystemView().isFileSystemRoot(file))) {
        return file.getPath();
      } else {
        return file.getName();
      }
    }
  }
  fileNameString$FileArr$MetalFileChooserUI(files: File[]): string {
    let sb = new StringBuilder();
    for (let i = 0; files != null && i < files.length; i++) {
      if (i > 0) {
        sb.append(' ');
      }
      if (files.length > 1) {
        sb.append('"');
      }
      sb.append(this.fileNameString$File$MetalFileChooserUI(files[i]));
      if (files.length > 1) {
        sb.append('"');
      }
    }
    return sb.toString();
  }
  doSelectedFileChanged(e: PropertyChangeEvent): void {
    let f = e.getNewValue();
    let fc = this.getFileChooser();
    if (f != null && ((fc.isFileSelectionEnabled() && !f.isDirectory()) || (f.isDirectory() && fc.isDirectorySelectionEnabled()))) {
      this.setFileName(this.fileNameString$File$MetalFileChooserUI(f));
    }
  }
  doSelectedFilesChanged(e: PropertyChangeEvent): void {
    let files = e.getNewValue();
    let fc = this.getFileChooser();
    if (files != null && files.length > 0 && (files.length > 1 || fc.isDirectorySelectionEnabled() || !files[0].isDirectory())) {
      this.setFileName(this.fileNameString$FileArr$MetalFileChooserUI(files));
    }
  }
  doDirectoryChanged(e: PropertyChangeEvent): void {
    let fc = this.getFileChooser();
    let fsv = fc.getFileSystemView();
    this.clearIconCache();
    let currentDirectory = fc.getCurrentDirectory();
    if (currentDirectory != null) {
      this.directoryComboBoxModel.addItem(currentDirectory);
      if (fc.isDirectorySelectionEnabled() && !fc.isFileSelectionEnabled()) {
        if (fsv.isFileSystem(currentDirectory)) {
          this.setFileName(currentDirectory.getPath());
        } else {
          this.setFileName(null);
        }
      }
    }
  }
  doFilterChanged(e: PropertyChangeEvent): void {
    this.clearIconCache();
  }
  doFileSelectionModeChanged(e: PropertyChangeEvent): void {
    if (this.fileNameLabel != null) {
      this.populateFileNameLabel();
    }
    this.clearIconCache();
    let fc = this.getFileChooser();
    let currentDirectory = fc.getCurrentDirectory();
    if (currentDirectory != null && fc.isDirectorySelectionEnabled() && !fc.isFileSelectionEnabled() && fc.getFileSystemView().isFileSystem(currentDirectory)) {
      this.setFileName(currentDirectory.getPath());
    } else {
      this.setFileName(null);
    }
  }
  doAccessoryChanged(e: PropertyChangeEvent): void {
    if (this.getAccessoryPanel() != null) {
      if (e.getOldValue() != null) {
        this.getAccessoryPanel().remove$Component(e.getOldValue());
      }
      let accessory = e.getNewValue();
      if (accessory != null) {
        this.getAccessoryPanel().add$Component$Object(accessory, BorderLayout.CENTER);
      }
    }
  }
  doApproveButtonTextChanged(e: PropertyChangeEvent): void {
    let chooser = this.getFileChooser();
    this.approveButton.setText(this.getApproveButtonText(chooser));
    this.approveButton.setToolTipText(this.getApproveButtonToolTipText(chooser));
  }
  doDialogTypeChanged(e: PropertyChangeEvent): void {
    let chooser = this.getFileChooser();
    this.approveButton.setText(this.getApproveButtonText(chooser));
    this.approveButton.setToolTipText(this.getApproveButtonToolTipText(chooser));
    if (chooser.getDialogType() === JFileChooser.SAVE_DIALOG) {
      this.lookInLabel.setText(this.saveInLabelText);
    } else {
      this.lookInLabel.setText(this.lookInLabelText);
    }
  }
  doApproveButtonMnemonicChanged(e: PropertyChangeEvent): void {
  }
  doControlButtonsChanged(e: PropertyChangeEvent): void {
    if (this.getFileChooser().getControlButtonsAreShown()) {
      this.addControlButtons();
    } else {
      this.removeControlButtons();
    }
  }
  createPropertyChangeListener(fc: JFileChooser): PropertyChangeListener {
    return (e) => {
      let s = e.getPropertyName();
      if ($J.equals(s, JFileChooser.SELECTED_FILE_CHANGED_PROPERTY)) {
        this.doSelectedFileChanged(e);
      } else if ($J.equals(s, JFileChooser.SELECTED_FILES_CHANGED_PROPERTY)) {
        this.doSelectedFilesChanged(e);
      } else if ($J.equals(s, JFileChooser.DIRECTORY_CHANGED_PROPERTY)) {
        this.doDirectoryChanged(e);
      } else if ($J.equals(s, JFileChooser.FILE_FILTER_CHANGED_PROPERTY)) {
        this.doFilterChanged(e);
      } else if ($J.equals(s, JFileChooser.FILE_SELECTION_MODE_CHANGED_PROPERTY)) {
        this.doFileSelectionModeChanged(e);
      } else if ($J.equals(s, JFileChooser.ACCESSORY_CHANGED_PROPERTY)) {
        this.doAccessoryChanged(e);
      } else if ($J.equals(s, JFileChooser.APPROVE_BUTTON_TEXT_CHANGED_PROPERTY) || $J.equals(s, JFileChooser.APPROVE_BUTTON_TOOL_TIP_TEXT_CHANGED_PROPERTY)) {
        this.doApproveButtonTextChanged(e);
      } else if ($J.equals(s, JFileChooser.DIALOG_TYPE_CHANGED_PROPERTY)) {
        this.doDialogTypeChanged(e);
      } else if ($J.equals(s, JFileChooser.APPROVE_BUTTON_MNEMONIC_CHANGED_PROPERTY)) {
        this.doApproveButtonMnemonicChanged(e);
      } else if ($J.equals(s, JFileChooser.CONTROL_BUTTONS_ARE_SHOWN_CHANGED_PROPERTY)) {
        this.doControlButtonsChanged(e);
      } else if ($J.equals(s, 'componentOrientation')) {
        let o = e.getNewValue();
        let cc = e.getSource();
        if (o !== e.getOldValue()) {
          cc.applyComponentOrientation(o);
        }
      } else if (s === 'FileChooser.useShellFolder') {
        this.doDirectoryChanged(e);
      } else if ($J.equals(s, 'ancestor')) {
        if (e.getOldValue() == null && e.getNewValue() != null) {
          this.fileNameTextField.selectAll();
          this.fileNameTextField.requestFocus$();
        }
      }
    };
  }
  /**
   * Removes control buttons from bottom panel.
   */
  removeControlButtons(): void {
    this.getBottomPanel().remove$Component(this.getButtonPanel());
  }
  /**
   * Adds control buttons to bottom panel.
   */
  addControlButtons(): void {
    this.getBottomPanel().add$Component(this.getButtonPanel());
  }
  ensureFileIsVisible(fc: JFileChooser, f: File): void {
    this.filePane.ensureFileIsVisible(fc, f);
  }
  rescanCurrentDirectory(fc: JFileChooser): void {
    this.filePane.rescanCurrentDirectory();
  }
  getFileName(): string {
    if (this.fileNameTextField != null) {
      return this.fileNameTextField.getText$();
    } else {
      return null;
    }
  }
  setFileName(filename: string): void {
    if (this.fileNameTextField != null) {
      this.fileNameTextField.setText(filename);
    }
  }
  /**
   * Property to remember whether a directory is currently selected in the UI.
   * This is normally called by the UI on a selection event.
   *
   * @param directorySelected if a directory is currently selected.
   * @since 1.4
   */
  setDirectorySelected(directorySelected: boolean): void {
    super.setDirectorySelected(directorySelected);
    let chooser = this.getFileChooser();
    if (directorySelected) {
      if (this.approveButton != null) {
        this.approveButton.setText(this.directoryOpenButtonText);
        this.approveButton.setToolTipText(this.directoryOpenButtonToolTipText);
      }
    } else {
      if (this.approveButton != null) {
        this.approveButton.setText(this.getApproveButtonText(chooser));
        this.approveButton.setToolTipText(this.getApproveButtonToolTipText(chooser));
      }
    }
  }
  /**
   * Returns the directory name.
   *
   * @return the directory name
   */
  getDirectoryName(): string {
    return null;
  }
  /**
   * Constructs a new instance of {@code DirectoryComboBoxRenderer}.
   *
   * @param fc a {@code JFileChooser}
   * @return a new instance of {@code DirectoryComboBoxRenderer}
   */
  createDirectoryComboBoxRenderer(fc: JFileChooser): DefaultListCellRenderer {
    return new MetalFileChooserUI$DirectoryComboBoxRenderer().$o(this)._MetalFileChooserUI$DirectoryComboBoxRenderer();
  }
  /**
   * Constructs a new instance of {@code DataModel} for {@code DirectoryComboBox}.
   *
   * @param fc a {@code JFileChooser}
   * @return a new instance of {@code DataModel} for {@code DirectoryComboBox}
   */
  createDirectoryComboBoxModel(fc: JFileChooser): MetalFileChooserUI$DirectoryComboBoxModel {
    return new MetalFileChooserUI$DirectoryComboBoxModel().$o(this)._MetalFileChooserUI$DirectoryComboBoxModel();
  }
  /**
   * Constructs a {@code Renderer} for types {@code ComboBox}.
   *
   * @return a {@code Renderer} for types {@code ComboBox}
   */
  createFilterComboBoxRenderer(): MetalFileChooserUI$FilterComboBoxRenderer {
    return new MetalFileChooserUI$FilterComboBoxRenderer().$o(this)._MetalFileChooserUI$FilterComboBoxRenderer();
  }
  /**
   * Constructs a {@code DataModel} for types {@code ComboBox}.
   *
   * @return a {@code DataModel} for types {@code ComboBox}
   */
  createFilterComboBoxModel(): MetalFileChooserUI$FilterComboBoxModel {
    return new MetalFileChooserUI$FilterComboBoxModel().$o(this)._MetalFileChooserUI$FilterComboBoxModel();
  }
  getApproveButton(fc: JFileChooser): JButton {
    return this.approveButton;
  }
  static groupLabels(group: MetalFileChooserUI$AlignedLabel[]): void {
    for (let i = 0; i < group.length; i++) {
      group[i].group = group;
    }
  }
  static $clinit() {
    MetalFileChooserUI.hstrut5 = new Dimension()._Dimension$int$int(5, 1);
    MetalFileChooserUI.hstrut11 = new Dimension()._Dimension$int$int(11, 1);
    MetalFileChooserUI.vstrut5 = new Dimension()._Dimension$int$int(1, 5);
    MetalFileChooserUI.shrinkwrap = new Insets()._Insets(0, 0, 0, 0);
    MetalFileChooserUI.PREF_WIDTH = 500;
    MetalFileChooserUI.PREF_HEIGHT = 326;
    MetalFileChooserUI.PREF_SIZE = new Dimension()._Dimension$int$int(MetalFileChooserUI.PREF_WIDTH, MetalFileChooserUI.PREF_HEIGHT);
    MetalFileChooserUI.MIN_WIDTH = 500;
    MetalFileChooserUI.MIN_HEIGHT = 326;
    MetalFileChooserUI.LIST_PREF_WIDTH = 405;
    MetalFileChooserUI.LIST_PREF_HEIGHT = 135;
    MetalFileChooserUI.LIST_PREF_SIZE = new Dimension()._Dimension$int$int(MetalFileChooserUI.LIST_PREF_WIDTH, MetalFileChooserUI.LIST_PREF_HEIGHT);
  }
}

export class MetalFileChooserUI$MetalFileChooserUIAccessor extends JObject {
  _MetalFileChooserUI$MetalFileChooserUIAccessor(): this {
    return this;
  }
  getFileChooser(): JFileChooser {
    return this.$outer.getFileChooser();
  }
  getModel(): BasicDirectoryModel {
    return this.$outer.getModel();
  }
  createList(): JPanel {
    return this.$outer.createList(this.getFileChooser());
  }
  createDetailsView(): JPanel {
    return this.$outer.createDetailsView(this.getFileChooser());
  }
  isDirectorySelected(): boolean {
    return this.$outer.isDirectorySelected();
  }
  getDirectory(): File {
    return this.$outer.getDirectory();
  }
  getChangeToParentDirectoryAction(): Action {
    return this.$outer.getChangeToParentDirectoryAction();
  }
  getApproveSelectionAction(): Action {
    return this.$outer.getApproveSelectionAction();
  }
  getNewFolderAction(): Action {
    return this.$outer.getNewFolderAction();
  }
  createDoubleClickListener(list: JList<any>): MouseListener {
    return this.$outer.createDoubleClickListener(this.getFileChooser(), list);
  }
  createListSelectionListener(): ListSelectionListener {
    return this.$outer.createListSelectionListener(this.getFileChooser());
  }
}

export class MetalFileChooserUI$DirectoryComboBoxRenderer extends DefaultListCellRenderer {
  ii: MetalFileChooserUI$IndentIcon = null;
  _MetalFileChooserUI$DirectoryComboBoxRenderer(): this {
    this._DefaultListCellRenderer();
    this.ii = new MetalFileChooserUI$IndentIcon()._MetalFileChooserUI$IndentIcon();
    return this;
  }
  getListCellRendererComponent(list: JList<any>, value: any, index: number, isSelected: boolean, cellHasFocus: boolean): Component {
    super.getListCellRendererComponent(list, value, index, isSelected, cellHasFocus);
    if (value == null) {
      this.setText('');
      return this;
    }
    let directory = value;
    this.setText(this.$outer.getFileChooser().getName$File(directory));
    let icon = this.$outer.getFileChooser().getIcon(directory);
    this.ii.icon = icon;
    this.ii.depth_ = this.$outer.directoryComboBoxModel.getDepth(index);
    this.setIcon(this.ii);
    this.putClientProperty('html.disable', this.$outer.getFileChooser().getClientProperty('html.disable'));
    return this;
  }
}

export class MetalFileChooserUI$IndentIcon extends JObject {
  icon: Icon = null;
  depth_: number = 0;
  _MetalFileChooserUI$IndentIcon(): this {
    this.icon = null;
    this.depth_ = 0;
    return this;
  }
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
    if (c.getComponentOrientation().isLeftToRight()) {
      this.icon.paintIcon(c, g, (x + Math.imul(this.depth_, MetalFileChooserUI.space)) | 0, y);
    } else {
      this.icon.paintIcon(c, g, x, y);
    }
  }
  getIconWidth(): number {
    return (this.icon.getIconWidth() + Math.imul(this.depth_, MetalFileChooserUI.space)) | 0;
  }
  getIconHeight(): number {
    return this.icon.getIconHeight();
  }
}

/**
 * Data model for a type-face selection combo-box.
 */
export class MetalFileChooserUI$DirectoryComboBoxModel extends AbstractListModel {
  directories: Vector<File> = null;
  depths: number[] = null;
  selectedDirectory: File = null;
  chooser: JFileChooser = null;
  fsv: FileSystemView = null;
  /**
   * Constructs an instance of {@code DirectoryComboBoxModel}.
   */
  _MetalFileChooserUI$DirectoryComboBoxModel(): this {
    this._AbstractListModel();
    this.directories = new Vector();
    this.depths = null;
    this.selectedDirectory = null;
    this.chooser = this.$outer.getFileChooser();
    this.fsv = this.chooser.getFileSystemView();
    let dir = this.$outer.getFileChooser().getCurrentDirectory();
    if (dir != null) {
      this.addItem(dir);
    }
    return this;
  }
  /**
   * Adds the directory to the model and sets it to be selected,
   * additionally clears out the previous selected directory and
   * the paths leading up to it, if any.
   */
  addItem(directory: File): void {
    if (directory == null) {
      return;
    }
    let useShellFolder = FilePane.usesShellFolder(this.chooser);
    this.directories.clear();
    let baseFolders = (useShellFolder) ? ShellFolder.get('fileChooserComboBoxFolders') : this.fsv.getRoots();
    this.directories.addAll(Arrays.asList(...baseFolders));
    let canonical: File;
    try {
      canonical = ShellFolder.getNormalizedFile(directory);
    } catch ($e0) {
      if ($J.isa($e0, IOException)) {
        let e = $J.exc($e0);
        canonical = directory;
      } else {
        throw $e0;
      }
    }
    try {
      let sf = useShellFolder ? ShellFolder.getShellFolder(canonical) : canonical;
      let f = sf;
      let path = new ArrayList(10);
      do {
        path.add(f);
      } while ((f = f.getParentFile()) != null);
      let pathCount = path.size();
      for (let i = 0; i < pathCount; i++) {
        f = path.get(i);
        if (this.directories.contains(f)) {
          let topIndex = this.directories.indexOf(f);
          for (let j = (i - 1) | 0; j >= 0; j--) {
            this.directories.insertElementAt(path.get(j), (topIndex + i - j) | 0);
          }
          break;
        }
      }
      this.calculateDepths();
      this.setSelectedItem(sf);
    } catch ($e1) {
      if ($J.isa($e1, FileNotFoundException)) {
        let ex = $J.exc($e1);
        this.calculateDepths();
      } else {
        throw $e1;
      }
    }
  }
  calculateDepths(): void {
    this.depths = $J.newArray(this.directories.size(), 0);
    for (let i = 0; i < this.depths.length; i++) {
      let dir = this.directories.get(i);
      let parent = dir.getParentFile();
      this.depths[i] = 0;
      if (parent != null) {
        for (let j = (i - 1) | 0; j >= 0; j--) {
          if (parent.equals(this.directories.get(j))) {
            this.depths[i] = (this.depths[j] + 1) | 0;
            break;
          }
        }
      }
    }
  }
  /**
   * Returns the depth of {@code i}-th file.
   *
   * @param i an index
   * @return the depth of {@code i}-th file
   */
  getDepth(i: number): number {
    return (this.depths != null && i >= 0 && i < this.depths.length) ? this.depths[i] : 0;
  }
  setSelectedItem(selectedDirectory: any): void {
    this.selectedDirectory = selectedDirectory;
    this.fireContentsChanged$Object$int$int(this, -1, -1);
  }
  getSelectedItem(): any {
    return this.selectedDirectory;
  }
  getSize(): number {
    return this.directories.size();
  }
  getElementAt(index: number): any {
    return this.directories.elementAt(index);
  }
}

/**
 * Render different type sizes and styles.
 */
export class MetalFileChooserUI$FilterComboBoxRenderer extends DefaultListCellRenderer {
  /**
   * Constructs a {@code FilterComboBoxRenderer}.
   */
  _MetalFileChooserUI$FilterComboBoxRenderer(): this {
    this._DefaultListCellRenderer();
    return this;
  }
  getListCellRendererComponent(list: JList<any>, value: any, index: number, isSelected: boolean, cellHasFocus: boolean): Component {
    super.getListCellRendererComponent(list, value, index, isSelected, cellHasFocus);
    var fileFilter;
    if ((fileFilter = value) instanceof FileFilter) {
      this.setText(fileFilter.getDescription());
    }
    return this;
  }
}

/**
 * Data model for a type-face selection combo-box.
 */
export class MetalFileChooserUI$FilterComboBoxModel extends AbstractListModel {
  /**
   * An array of file filters.
   */
  filters: FileFilter[] = null;
  /**
   * Constructs an instance of {@code FilterComboBoxModel}.
   */
  _MetalFileChooserUI$FilterComboBoxModel(): this {
    this._AbstractListModel();
    this.filters = this.$outer.getFileChooser().getChoosableFileFilters();
    return this;
  }
  propertyChange(e: PropertyChangeEvent): void {
    let prop = e.getPropertyName();
    if (prop === JFileChooser.CHOOSABLE_FILE_FILTER_CHANGED_PROPERTY) {
      this.filters = e.getNewValue();
      this.fireContentsChanged$Object$int$int(this, -1, -1);
    } else if (prop === JFileChooser.FILE_FILTER_CHANGED_PROPERTY) {
      this.fireContentsChanged$Object$int$int(this, -1, -1);
    }
  }
  setSelectedItem(filter: any): void {
    if (filter != null) {
      this.$outer.getFileChooser().setFileFilter(filter);
      this.fireContentsChanged$Object$int$int(this, -1, -1);
    }
  }
  getSelectedItem(): any {
    let currentFilter = this.$outer.getFileChooser().getFileFilter();
    let found = false;
    if (currentFilter != null) {
      for (let filter of this.filters) {
        if (filter === currentFilter) {
          found = true;
        }
      }
      if (found === false) {
        this.$outer.getFileChooser().addChoosableFileFilter(currentFilter);
      }
    }
    return this.$outer.getFileChooser().getFileFilter();
  }
  getSize(): number {
    if (this.filters != null) {
      return this.filters.length;
    } else {
      return 0;
    }
  }
  getElementAt(index: number): any {
    if (index > ((this.getSize() - 1) | 0)) {
      return this.$outer.getFileChooser().getFileFilter();
    }
    if (this.filters != null) {
      return this.filters[index];
    } else {
      return null;
    }
  }
}

/**
 * Acts when DirectoryComboBox has changed the selected item.
 */
export class MetalFileChooserUI$DirectoryComboBoxAction extends AbstractAction {
  /**
   * Constructs a new instance of {@code DirectoryComboBoxAction}.
   */
  _MetalFileChooserUI$DirectoryComboBoxAction(): this {
    this._AbstractAction$String('DirectoryComboBoxAction');
    return this;
  }
  actionPerformed(e: ActionEvent): void {
    this.$outer.directoryComboBox.hidePopup();
    let f = this.$outer.directoryComboBox.getSelectedItem();
    this.$outer.getFileChooser().setCurrentDirectory(f);
  }
}

/**
 * <code>ButtonAreaLayout</code> behaves in a similar manner to
 * <code>FlowLayout</code>. It lays out all components from left to
 * right, flushed right. The widths of all components will be set
 * to the largest preferred size width.
 */
export class MetalFileChooserUI$ButtonAreaLayout extends JObject {
  hGap: number = 0;
  topMargin: number = 0;
  _MetalFileChooserUI$ButtonAreaLayout(): this {
    this.hGap = 5;
    this.topMargin = 17;
    return this;
  }
  addLayoutComponent$String$Component(string$: string, comp: Component): void {
  }
  layoutContainer$Container(container: Container): void {
    let children = container.getComponents();
    if (children != null && children.length > 0) {
      let numChildren = children.length;
      let sizes = $J.newArray(numChildren, null);
      let insets = container.getInsets$();
      let yLocation = (insets.top + this.topMargin) | 0;
      let maxWidth = 0;
      for (let counter = 0; counter < numChildren; counter++) {
        sizes[counter] = children[counter].getPreferredSize$();
        maxWidth = Math.max(maxWidth, sizes[counter].width_);
      }
      let xLocation: number;
      let xOffset: number;
      if (container.getComponentOrientation().isLeftToRight()) {
        xLocation = (container.getSize$().width_ - insets.left - maxWidth) | 0;
        xOffset = (this.hGap + maxWidth) | 0;
      } else {
        xLocation = insets.left;
        xOffset = -((this.hGap + maxWidth) | 0);
      }
      for (let counter = (numChildren - 1) | 0; counter >= 0; counter--) {
        children[counter].setBounds$int$int$int$int(xLocation, yLocation, maxWidth, sizes[counter].height_);
        xLocation = (xLocation - xOffset) | 0;
      }
    }
  }
  minimumLayoutSize(c: Container): Dimension {
    if (c != null) {
      let children = c.getComponents();
      if (children != null && children.length > 0) {
        let numChildren = children.length;
        let height = 0;
        let cInsets = c.getInsets$();
        let extraHeight = (this.topMargin + cInsets.top + cInsets.bottom) | 0;
        let extraWidth = (cInsets.left + cInsets.right) | 0;
        let maxWidth = 0;
        for (let counter = 0; counter < numChildren; counter++) {
          let aSize = children[counter].getPreferredSize$();
          height = Math.max(height, aSize.height_);
          maxWidth = Math.max(maxWidth, aSize.width_);
        }
        return new Dimension()._Dimension$int$int((extraWidth + Math.imul(numChildren, maxWidth) + Math.imul(((numChildren - 1) | 0), this.hGap)) | 0, (extraHeight + height) | 0);
      }
    }
    return new Dimension()._Dimension$int$int(0, 0);
  }
  preferredLayoutSize(c: Container): Dimension {
    return this.minimumLayoutSize(c);
  }
  removeLayoutComponent(c: Component): void {
  }
}

export class MetalFileChooserUI$AlignedLabel extends JLabel {
  group: MetalFileChooserUI$AlignedLabel[] = null;
  maxWidth_: number = 0;
  $init_MetalFileChooserUI_AlignedLabel() {
    this.maxWidth_ = 0;
  }
  _MetalFileChooserUI$AlignedLabel$(): this {
    this._JLabel$();
    this.$init_MetalFileChooserUI_AlignedLabel();
    this.setAlignmentX(Component.LEFT_ALIGNMENT);
    return this;
  }
  _MetalFileChooserUI$AlignedLabel$String(text: string): this {
    this._JLabel$String(text);
    this.$init_MetalFileChooserUI_AlignedLabel();
    this.setAlignmentX(Component.LEFT_ALIGNMENT);
    return this;
  }
  getPreferredSize$(): Dimension {
    let d = super.getPreferredSize$();
    return new Dimension()._Dimension$int$int((this.getMaxWidth() + 11) | 0, d.height_);
  }
  getMaxWidth(): number {
    if (this.maxWidth_ === 0 && this.group != null) {
      let max = 0;
      for (let i = 0; i < this.group.length; i++) {
        max = Math.max(this.group[i].getSuperPreferredWidth(), max);
      }
      for (let i = 0; i < this.group.length; i++) {
        this.group[i].maxWidth_ = max;
      }
    }
    return this.maxWidth_;
  }
  getSuperPreferredWidth(): number {
    return super.getPreferredSize$().width_;
  }
}

let $MetalFileChooserUI$1: any = null;
/** An anonymous class (MetalFileChooserUI.java:242). */
function MetalFileChooserUI$1(): any {
  return $MetalFileChooserUI$1 ??= $J.local(class extends JComboBox {
    getPreferredSize$(): Dimension {
      let d = super.getPreferredSize$();
      d.width_ = 150;
      return d;
    }
  }, 'javax.swing.plaf.metal.MetalFileChooserUI$1', []);
}

let $MetalFileChooserUI$3: any = null;
/** An anonymous class (MetalFileChooserUI.java:385). */
function MetalFileChooserUI$3(): any {
  return $MetalFileChooserUI$3 ??= $J.local(class extends JTextField {
    getMaximumSize(): Dimension {
      return new Dimension()._Dimension$int$int(32767, super.getPreferredSize$().height_);
    }
  }, 'javax.swing.plaf.metal.MetalFileChooserUI$3', []);
}

let $MetalFileChooserUI$4: any = null;
/** An anonymous class (MetalFileChooserUI.java:394). */
function MetalFileChooserUI$4(): any {
  return $MetalFileChooserUI$4 ??= $J.local(class extends FocusAdapter {
    focusGained(e: FocusEvent): void {
      if (!this.$outer.getFileChooser().isMultiSelectionEnabled()) {
        this.$outer.filePane.clearSelection();
      }
    }
  }, 'javax.swing.plaf.metal.MetalFileChooserUI$4', []);
}

$J.define(MetalFileChooserUI, 'javax.swing.plaf.metal.MetalFileChooserUI', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicFileChooserUI', ctors: { 'javax.swing.JFileChooser': '_MetalFileChooserUI' }, meths: { 'fileNameString(java.io.File[])': 'fileNameString$FileArr$MetalFileChooserUI', 'fileNameString(java.io.File)': 'fileNameString$File$MetalFileChooserUI', 'getPreferredSize(javax.swing.JComponent)': 'getPreferredSize$JComponent', 'createActionMap()': 'createActionMap$', 'getActionMap()': 'getActionMap$', 'getMnemonic(java.lang.String,java.util.Locale)': 'getMnemonic$String$Locale$MetalFileChooserUI' }, clinit: true, lazy: ['hstrut5', 'hstrut11', 'vstrut5', 'shrinkwrap', 'PREF_WIDTH', 'PREF_HEIGHT', 'PREF_SIZE', 'MIN_WIDTH', 'MIN_HEIGHT', 'LIST_PREF_WIDTH', 'LIST_PREF_HEIGHT', 'LIST_PREF_SIZE'] });
$J.define(MetalFileChooserUI$MetalFileChooserUIAccessor, 'javax.swing.plaf.metal.MetalFileChooserUI$MetalFileChooserUIAccessor', { kind: 'class', ifaces: ['sun.swing.FilePane$FileChooserUIAccessor'], sup: 'java.lang.Object', ctors: { '': '_MetalFileChooserUI$MetalFileChooserUIAccessor' }, inner: true });
$J.define(MetalFileChooserUI$DirectoryComboBoxRenderer, 'javax.swing.plaf.metal.MetalFileChooserUI$DirectoryComboBoxRenderer', { kind: 'class', sup: 'javax.swing.DefaultListCellRenderer', ctors: { '': '_MetalFileChooserUI$DirectoryComboBoxRenderer' }, inner: true });
$J.define(MetalFileChooserUI$IndentIcon, 'javax.swing.plaf.metal.MetalFileChooserUI$IndentIcon', { kind: 'class', ifaces: ['javax.swing.Icon'], sup: 'java.lang.Object', ctors: { '': '_MetalFileChooserUI$IndentIcon' } });
$J.define(MetalFileChooserUI$DirectoryComboBoxModel, 'javax.swing.plaf.metal.MetalFileChooserUI$DirectoryComboBoxModel', { kind: 'class', ifaces: ['javax.swing.ComboBoxModel'], sup: 'javax.swing.AbstractListModel', ctors: { '': '_MetalFileChooserUI$DirectoryComboBoxModel' }, inner: true });
$J.define(MetalFileChooserUI$FilterComboBoxRenderer, 'javax.swing.plaf.metal.MetalFileChooserUI$FilterComboBoxRenderer', { kind: 'class', sup: 'javax.swing.DefaultListCellRenderer', ctors: { '': '_MetalFileChooserUI$FilterComboBoxRenderer' }, inner: true });
$J.define(MetalFileChooserUI$FilterComboBoxModel, 'javax.swing.plaf.metal.MetalFileChooserUI$FilterComboBoxModel', { kind: 'class', ifaces: ['javax.swing.ComboBoxModel', 'java.beans.PropertyChangeListener'], sup: 'javax.swing.AbstractListModel', ctors: { '': '_MetalFileChooserUI$FilterComboBoxModel' }, inner: true });
$J.define(MetalFileChooserUI$DirectoryComboBoxAction, 'javax.swing.plaf.metal.MetalFileChooserUI$DirectoryComboBoxAction', { kind: 'class', sup: 'javax.swing.AbstractAction', ctors: { '': '_MetalFileChooserUI$DirectoryComboBoxAction' }, inner: true });
$J.define(MetalFileChooserUI$ButtonAreaLayout, 'javax.swing.plaf.metal.MetalFileChooserUI$ButtonAreaLayout', { kind: 'class', ifaces: ['java.awt.LayoutManager'], sup: 'java.lang.Object', ctors: { '': '_MetalFileChooserUI$ButtonAreaLayout' }, meths: { 'layoutContainer(java.awt.Container)': 'layoutContainer$Container', 'addLayoutComponent(java.lang.String,java.awt.Component)': 'addLayoutComponent$String$Component' } });
$J.define(MetalFileChooserUI$AlignedLabel, 'javax.swing.plaf.metal.MetalFileChooserUI$AlignedLabel', { kind: 'class', sup: 'javax.swing.JLabel', ctors: { 'java.lang.String': '_MetalFileChooserUI$AlignedLabel$String', '': '_MetalFileChooserUI$AlignedLabel$' }, meths: { 'getPreferredSize()': 'getPreferredSize$' } });
$J.module(() => {
  BorderLayout = $J.load('java.awt.BorderLayout');
  Component = $J.load('java.awt.Component');
  Dimension = $J.load('java.awt.Dimension');
  Insets = $J.load('java.awt.Insets');
  FocusAdapter = $J.load('java.awt.event.FocusAdapter');
  AccessibleContext = $J.load('javax.accessibility.AccessibleContext');
  Box = $J.load('javax.swing.Box');
  BoxLayout = $J.load('javax.swing.BoxLayout');
  ButtonGroup = $J.load('javax.swing.ButtonGroup');
  JButton = $J.load('javax.swing.JButton');
  JComboBox = $J.load('javax.swing.JComboBox');
  JFileChooser = $J.load('javax.swing.JFileChooser');
  JPanel = $J.load('javax.swing.JPanel');
  JTextField = $J.load('javax.swing.JTextField');
  JToggleButton = $J.load('javax.swing.JToggleButton');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIManager = $J.load('javax.swing.UIManager');
  EmptyBorder = $J.load('javax.swing.border.EmptyBorder');
  FileFilter = $J.load('javax.swing.filechooser.FileFilter');
  ActionMapUIResource = $J.load('javax.swing.plaf.ActionMapUIResource');
  FilePane = $J.load('sun.swing.FilePane');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
