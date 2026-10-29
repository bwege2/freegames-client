// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/swing/FilePane.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2003, 2022, Oracle and/or its affiliates. All rights reserved.
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
import { $J, ArrayList, Arrays, DateFormat, File, FileNotFoundException, FileSystemView, IllegalArgumentException, JDate, JNumber, JObject, JString, Long, MessageFormat, NumberFormat, SecurityException, ShellFolder, StringBuilder } from '../../../jre/index.ts';
import { JPanel } from '../../javax/swing/JPanel.ts';
import { AbstractAction } from '../../javax/swing/AbstractAction.ts';
import { AbstractListModel } from '../../javax/swing/AbstractListModel.ts';
import { AbstractTableModel } from '../../javax/swing/table/AbstractTableModel.ts';
import { TableRowSorter } from '../../javax/swing/table/TableRowSorter.ts';
import { DefaultRowSorter$ModelWrapper } from '../../javax/swing/DefaultRowSorter.ts';
import { DefaultCellEditor } from '../../javax/swing/DefaultCellEditor.ts';
import { DefaultTableCellRenderer } from '../../javax/swing/table/DefaultTableCellRenderer.ts';
import { DefaultListCellRenderer } from '../../javax/swing/DefaultListCellRenderer.ts';

let BorderLayout, Container, Cursor, Dimension, KeyboardFocusManager, ComponentAdapter, FocusAdapter, KeyAdapter, KeyEvent, MouseAdapter, MouseEvent, AccessibleContext, Action, ButtonGroup, DefaultListSelectionModel, JComponent, JFileChooser, JLabel, JList, JMenu, JOptionPane, JPopupMenu, JRadioButtonMenuItem, JScrollPane, JTable, JTextField, KeyStroke, ListSelectionModel, LookAndFeel, SwingConstants, SwingUtilities, UIManager, TableModelEvent, DefaultTableColumnModel, TableColumn, Position$Bias, AWTAccessor, SwingUtilities2;

/**
 * <b>WARNING:</b> This class is an implementation detail and is only
 * public so that it can be used by two packages. You should NOT consider
 * this public API.
 * <p>
 * This component is intended to be used in a subclass of
 * javax.swing.plaf.basic.BasicFileChooserUI. It realies heavily on the
 * implementation of BasicFileChooserUI, and is intended to be API compatible
 * with earlier implementations of MetalFileChooserUI and WindowsFileChooserUI.
 *
 * @author Leif Samuelsson
 */
export class FilePane extends JPanel {
  static readonly ACTION_APPROVE_SELECTION: string = 'approveSelection';
  static readonly ACTION_CANCEL: string = 'cancelSelection';
  static readonly ACTION_EDIT_FILE_NAME: string = 'editFileName';
  static readonly ACTION_REFRESH: string = 'refresh';
  static readonly ACTION_CHANGE_TO_PARENT_DIRECTORY: string = 'Go Up';
  static readonly ACTION_NEW_FOLDER: string = 'New Folder';
  static readonly ACTION_VIEW_LIST: string = 'viewTypeList';
  static readonly ACTION_VIEW_DETAILS: string = 'viewTypeDetails';
  actions: Action[] = null;
  static readonly VIEWTYPE_LIST: number = 0;
  static readonly VIEWTYPE_DETAILS: number = 1;
  static readonly VIEWTYPE_COUNT: number = 2;
  viewType: number = 0;
  viewPanels: JPanel[] = null;
  currentViewPanel: JPanel = null;
  viewTypeActionNames: string[] = null;
  filesListAccessibleName: string = null;
  filesDetailsAccessibleName: string = null;
  contextMenu: JPopupMenu = null;
  viewMenu: JMenu = null;
  viewMenuLabelText: string = null;
  refreshActionLabelText: string = null;
  newFolderActionLabelText: string = null;
  kiloByteString: string = null;
  megaByteString: string = null;
  gigaByteString: string = null;
  renameErrorTitleText: string = null;
  renameErrorText: string = null;
  renameErrorFileExistsText: string = null;
  static waitCursor: Cursor = null;
  detailsKeyListener: KeyListener = null;
  editorFocusListener: FocusListener = null;
  static repaintListener: FocusListener = null;
  smallIconsView: boolean = false;
  listViewBorder: Border = null;
  listViewBackground: Color = null;
  listViewWindowsStyle: boolean = false;
  readOnly: boolean = false;
  fullRowSelection: boolean = false;
  listSelectionModel: ListSelectionModel = null;
  list: JList<any> = null;
  detailsTable: JTable = null;
  static readonly COLUMN_FILENAME: number = 0;
  newFolderFile: File = null;
  fileChooserUIAccessor: FilePane$FileChooserUIAccessor = null;
  detailsTableModel: FilePane$DetailsTableModel = null;
  rowSorter: FilePane$DetailsTableRowSorter = null;
  tableCellEditor: FilePane$DetailsTableCellEditor = null;
  lastIndex: number = 0;
  editFile: File = null;
  editCell: JTextField = null;
  newFolderAction: Action = null;
  handler: FilePane$Handler = null;
  _FilePane(fileChooserUIAccessor: FilePane$FileChooserUIAccessor): this {
    this._JPanel$LayoutManager(new BorderLayout()._BorderLayout$());
    this.viewType = -1;
    this.viewPanels = $J.newArray(FilePane.VIEWTYPE_COUNT, null);
    this.filesListAccessibleName = null;
    this.filesDetailsAccessibleName = null;
    this.detailsKeyListener = new (FilePane$1())().$o(this)._KeyAdapter().$init_anon();
    this.editorFocusListener = new (FilePane$2())().$o(this)._FocusAdapter();
    this.smallIconsView = false;
    this.fullRowSelection = false;
    this.lastIndex = -1;
    this.editFile = null;
    this.editCell = null;
    this.fileChooserUIAccessor = fileChooserUIAccessor;
    this.installDefaults();
    this.createActionMap();
    return this;
  }
  uninstallUI(): void {
    if (this.getModel() != null) {
      this.getModel().removePropertyChangeListener($J.fn(this, 'propertyChange'));
    }
  }
  getFileChooser(): JFileChooser {
    return this.fileChooserUIAccessor.getFileChooser();
  }
  getModel(): BasicDirectoryModel {
    return this.fileChooserUIAccessor.getModel();
  }
  getViewType(): number {
    return this.viewType;
  }
  setViewType(viewType: number): void {
    if (viewType === this.viewType) {
      return;
    }
    let oldValue = this.viewType;
    this.viewType = viewType;
    let createdViewPanel = null;
    let newFocusOwner = null;
    switch (viewType) {
      case FilePane.VIEWTYPE_LIST:
        if (this.viewPanels[viewType] == null) {
          createdViewPanel = this.fileChooserUIAccessor.createList();
          if (createdViewPanel == null) {
            createdViewPanel = this.createList();
          }
          this.list = this.findChildComponent(createdViewPanel, $J.cls(JList));
          if (this.listSelectionModel == null) {
            this.listSelectionModel = this.list.getSelectionModel();
            if (this.detailsTable != null) {
              this.detailsTable.setSelectionModel(this.listSelectionModel);
            }
          } else {
            this.list.setSelectionModel(this.listSelectionModel);
          }
        }
        this.list.setLayoutOrientation(JList.VERTICAL_WRAP);
        newFocusOwner = this.list;
        break;
      case FilePane.VIEWTYPE_DETAILS:
        if (this.viewPanels[viewType] == null) {
          createdViewPanel = this.fileChooserUIAccessor.createDetailsView();
          if (createdViewPanel == null) {
            createdViewPanel = this.createDetailsView();
          }
          this.detailsTable = this.findChildComponent(createdViewPanel, $J.cls(JTable));
          this.detailsTable.setRowHeight$int(Math.max((this.detailsTable.getFont().getSize() + 4) | 0, (16 + 1) | 0));
          if (this.listSelectionModel != null) {
            this.detailsTable.setSelectionModel(this.listSelectionModel);
          }
        }
        newFocusOwner = this.detailsTable;
        break;
    }
    if (createdViewPanel != null) {
      this.viewPanels[viewType] = createdViewPanel;
      FilePane.recursivelySetInheritsPopupMenu(createdViewPanel, true);
    }
    let isFocusOwner = false;
    if (this.currentViewPanel != null) {
      let owner = KeyboardFocusManager.getCurrentKeyboardFocusManager$().getPermanentFocusOwner();
      isFocusOwner = owner === this.detailsTable || owner === this.list;
      this.remove$Component(this.currentViewPanel);
    }
    this.currentViewPanel = this.viewPanels[viewType];
    this.add$Component$Object(this.currentViewPanel, BorderLayout.CENTER);
    if (isFocusOwner && newFocusOwner != null) {
      newFocusOwner.requestFocusInWindow$();
    }
    this.revalidate();
    this.repaint$();
    this.updateViewMenu();
    this.firePropertyChange$String$int$int('viewType', oldValue, viewType);
  }
  getViewTypeAction(viewType: number): Action {
    return new FilePane$ViewTypeAction().$o(this)._FilePane$ViewTypeAction(viewType);
  }
  static recursivelySetInheritsPopupMenu(container: Container, b: boolean): void {
    if (container instanceof JComponent) {
      (container).setInheritsPopupMenu(b);
    }
    let n = container.getComponentCount();
    for (let i = 0; i < n; i++) {
      FilePane.recursivelySetInheritsPopupMenu(container.getComponent$int(i), b);
    }
  }
  installDefaults(): void {
    let l = this.getFileChooser().getLocale$();
    this.listViewBorder = UIManager.getBorder$Object('FileChooser.listViewBorder');
    this.listViewBackground = UIManager.getColor$Object('FileChooser.listViewBackground');
    this.listViewWindowsStyle = UIManager.getBoolean$Object('FileChooser.listViewWindowsStyle');
    this.readOnly = UIManager.getBoolean$Object('FileChooser.readOnly');
    this.viewMenuLabelText = UIManager.getString$Object$Locale('FileChooser.viewMenuLabelText', l);
    this.refreshActionLabelText = UIManager.getString$Object$Locale('FileChooser.refreshActionLabelText', l);
    this.newFolderActionLabelText = UIManager.getString$Object$Locale('FileChooser.newFolderActionLabelText', l);
    this.viewTypeActionNames = $J.newArray(FilePane.VIEWTYPE_COUNT, null);
    this.viewTypeActionNames[FilePane.VIEWTYPE_LIST] = UIManager.getString$Object$Locale('FileChooser.listViewActionLabelText', l);
    this.viewTypeActionNames[FilePane.VIEWTYPE_DETAILS] = UIManager.getString$Object$Locale('FileChooser.detailsViewActionLabelText', l);
    this.kiloByteString = UIManager.getString$Object$Locale('FileChooser.fileSizeKiloBytes', l);
    this.megaByteString = UIManager.getString$Object$Locale('FileChooser.fileSizeMegaBytes', l);
    this.gigaByteString = UIManager.getString$Object$Locale('FileChooser.fileSizeGigaBytes', l);
    this.fullRowSelection = UIManager.getBoolean$Object('FileView.fullRowSelection');
    this.filesListAccessibleName = UIManager.getString$Object$Locale('FileChooser.filesListAccessibleName', l);
    this.filesDetailsAccessibleName = UIManager.getString$Object$Locale('FileChooser.filesDetailsAccessibleName', l);
    this.renameErrorTitleText = UIManager.getString$Object$Locale('FileChooser.renameErrorTitleText', l);
    this.renameErrorText = UIManager.getString$Object$Locale('FileChooser.renameErrorText', l);
    this.renameErrorFileExistsText = UIManager.getString$Object$Locale('FileChooser.renameErrorFileExistsText', l);
  }
  /**
   * Fetches the command list for the FilePane. These commands
   * are useful for binding to events, such as in a keymap.
   *
   * @return the command list
   */
  getActions(): Action[] {
    if (this.actions == null) {
      // class FilePaneAction: FilePane$1FilePaneAction(), below
      let actionList = new ArrayList(8);
      let action: Action;
      actionList.add(new (FilePane$1FilePaneAction())().$o(this)._FilePaneAction$String(FilePane.ACTION_CANCEL));
      actionList.add(new (FilePane$1FilePaneAction())().$o(this)._FilePaneAction$String(FilePane.ACTION_EDIT_FILE_NAME));
      actionList.add(new (FilePane$1FilePaneAction())().$o(this)._FilePaneAction$String$String(this.refreshActionLabelText, FilePane.ACTION_REFRESH));
      action = this.fileChooserUIAccessor.getApproveSelectionAction();
      if (action != null) {
        actionList.add(action);
      }
      action = this.fileChooserUIAccessor.getChangeToParentDirectoryAction();
      if (action != null) {
        actionList.add(action);
      }
      action = this.getNewFolderAction();
      if (action != null) {
        actionList.add(action);
      }
      action = this.getViewTypeAction(FilePane.VIEWTYPE_LIST);
      if (action != null) {
        actionList.add(action);
      }
      action = this.getViewTypeAction(FilePane.VIEWTYPE_DETAILS);
      if (action != null) {
        actionList.add(action);
      }
      this.actions = $J.toArrayInto(actionList.toArray(), $J.newArray(actionList.size(), null));
    }
    return Arrays.copyOf(this.actions, this.actions.length);
  }
  createActionMap(): void {
    FilePane.addActionsToMap(super.getActionMap$(), this.getActions());
  }
  static addActionsToMap(map: ActionMap, actions: Action[]): void {
    if (map != null && actions != null) {
      for (let a of actions) {
        let cmd = a.getValue$String(Action.ACTION_COMMAND_KEY);
        if (cmd == null) {
          cmd = a.getValue$String(Action.NAME);
        }
        map.put$Object$Action(cmd, a);
      }
    }
  }
  updateListRowCount(list: JList<any>): void {
    if (this.smallIconsView) {
      list.setVisibleRowCount($J.idiv(this.getModel().getSize(), 3));
    } else {
      list.setVisibleRowCount(-1);
    }
  }
  createList(): JPanel {
    let p = new JPanel()._JPanel$LayoutManager(new BorderLayout()._BorderLayout$());
    let fileChooser = this.getFileChooser();
    let list = new (FilePane$4())().$o(this).$c(fileChooser)._JList$();
    list.setCellRenderer(new FilePane$FileRenderer().$o(this)._FilePane$FileRenderer());
    list.setLayoutOrientation(JList.VERTICAL_WRAP);
    list.putClientProperty('List.isFileList', true);
    if (this.listViewWindowsStyle) {
      list.addFocusListener(FilePane.repaintListener);
    }
    this.updateListRowCount(list);
    this.getModel().addListDataListener(new (FilePane$5())().$o(this).$c(list));
    this.getModel().addPropertyChangeListener($J.fn(this, 'propertyChange'));
    if (fileChooser.isMultiSelectionEnabled()) {
      list.setSelectionMode(ListSelectionModel.MULTIPLE_INTERVAL_SELECTION);
    } else {
      list.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
    }
    list.setModel(new FilePane$SortableListModel().$o(this)._FilePane$SortableListModel());
    list.addListSelectionListener(this.createListSelectionListener());
    list.addMouseListener(this.getMouseHandler());
    let scrollpane = new JScrollPane()._JScrollPane$Component(list);
    if (this.listViewBackground != null) {
      list.setBackground(this.listViewBackground);
    }
    if (this.listViewBorder != null) {
      scrollpane.setBorder(this.listViewBorder);
    }
    list.putClientProperty(AccessibleContext.ACCESSIBLE_NAME_PROPERTY, this.filesListAccessibleName);
    p.add$Component$Object(scrollpane, BorderLayout.CENTER);
    return p;
  }
  getDetailsTableModel(): FilePane$DetailsTableModel {
    if (this.detailsTableModel == null) {
      this.detailsTableModel = new FilePane$DetailsTableModel().$o(this)._FilePane$DetailsTableModel(this.getFileChooser());
    }
    return this.detailsTableModel;
  }
  updateDetailsColumnModel(table: JTable): void {
    if (table != null) {
      let columns = this.detailsTableModel.getColumns();
      let columnModel = new DefaultTableColumnModel()._DefaultTableColumnModel();
      for (let i = 0; i < columns.length; i++) {
        let dataItem = columns[i];
        let column = new TableColumn()._TableColumn$int(i);
        let title = dataItem.getTitle();
        if (title != null && title.startsWith('FileChooser.') && title.endsWith('HeaderText')) {
          let uiTitle = UIManager.getString$Object$Locale(title, table.getLocale$());
          if (uiTitle != null) {
            title = uiTitle;
          }
        }
        column.setHeaderValue(title);
        let width = dataItem.getWidth();
        if (width != null) {
          column.setPreferredWidth(width);
        }
        columnModel.addColumn(column);
      }
      if (!this.readOnly && columnModel.getColumnCount() > FilePane.COLUMN_FILENAME) {
        columnModel.getColumn(FilePane.COLUMN_FILENAME).setCellEditor(this.getDetailsTableCellEditor());
      }
      table.setColumnModel(columnModel);
    }
  }
  getRowSorter(): FilePane$DetailsTableRowSorter {
    if (this.rowSorter == null) {
      this.rowSorter = new FilePane$DetailsTableRowSorter().$o(this)._FilePane$DetailsTableRowSorter();
    }
    return this.rowSorter;
  }
  getDetailsTableCellEditor(): FilePane$DetailsTableCellEditor {
    if (this.tableCellEditor == null) {
      this.tableCellEditor = new FilePane$DetailsTableCellEditor().$o(this)._FilePane$DetailsTableCellEditor(new JTextField()._JTextField$());
    }
    return this.tableCellEditor;
  }
  createDetailsView(): JPanel {
    let chooser = this.getFileChooser();
    let p = new JPanel()._JPanel$LayoutManager(new BorderLayout()._BorderLayout$());
    let detailsTable = new (FilePane$6())().$o(this).$c(chooser)._JTable$TableModel(this.getDetailsTableModel());
    detailsTable.setRowSorter(this.getRowSorter());
    detailsTable.setAutoCreateColumnsFromModel(false);
    detailsTable.setComponentOrientation(chooser.getComponentOrientation());
    detailsTable.setAutoResizeMode(JTable.AUTO_RESIZE_OFF);
    detailsTable.setShowGrid(false);
    detailsTable.putClientProperty('JTable.autoStartsEdit', false);
    detailsTable.addKeyListener(this.detailsKeyListener);
    let font = this.list.getFont();
    detailsTable.setFont(font);
    detailsTable.setIntercellSpacing(new Dimension()._Dimension$int$int(0, 0));
    let headerRenderer = new FilePane$AlignableTableHeaderRenderer().$o(this)._FilePane$AlignableTableHeaderRenderer(detailsTable.getTableHeader().getDefaultRenderer());
    detailsTable.getTableHeader().setDefaultRenderer(headerRenderer);
    let cellRenderer = new FilePane$DetailsTableCellRenderer().$o(this)._FilePane$DetailsTableCellRenderer(chooser);
    detailsTable.setDefaultRenderer($J.cls(JObject), cellRenderer);
    detailsTable.getColumnModel().getSelectionModel().setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
    detailsTable.addMouseListener(this.getMouseHandler());
    detailsTable.putClientProperty('Table.isFileList', true);
    if (this.listViewWindowsStyle) {
      detailsTable.addFocusListener(FilePane.repaintListener);
    }
    detailsTable.setFocusTraversalKeys(KeyboardFocusManager.FORWARD_TRAVERSAL_KEYS, null);
    detailsTable.setFocusTraversalKeys(KeyboardFocusManager.BACKWARD_TRAVERSAL_KEYS, null);
    let scrollpane = new JScrollPane()._JScrollPane$Component(detailsTable);
    scrollpane.setComponentOrientation(chooser.getComponentOrientation());
    LookAndFeel.installColors(scrollpane.getViewport(), 'Table.background', 'Table.foreground');
    scrollpane.addComponentListener(new (FilePane$7())().$o(this)._ComponentAdapter());
    scrollpane.addMouseListener(new (FilePane$8())().$o(this)._MouseAdapter());
    detailsTable.setForeground(this.list.getForeground());
    detailsTable.setBackground(this.list.getBackground());
    if (this.listViewBorder != null) {
      scrollpane.setBorder(this.listViewBorder);
    }
    p.add$Component$Object(scrollpane, BorderLayout.CENTER);
    this.detailsTableModel.fireTableStructureChanged();
    detailsTable.putClientProperty(AccessibleContext.ACCESSIBLE_NAME_PROPERTY, this.filesDetailsAccessibleName);
    return p;
  }
  fixNameColumnWidth(viewWidth: number): void {
    let nameCol = this.detailsTable.getColumnModel().getColumn(FilePane.COLUMN_FILENAME);
    let tableWidth = this.detailsTable.getPreferredSize$().width_;
    if (tableWidth < viewWidth) {
      nameCol.setPreferredWidth((nameCol.getPreferredWidth() + viewWidth - tableWidth) | 0);
    }
  }
  /**
   * Creates a selection listener for the list of files and directories.
   *
   * @return a <code>ListSelectionListener</code>
   */
  createListSelectionListener(): ListSelectionListener {
    return this.fileChooserUIAccessor.createListSelectionListener();
  }
  getEditIndex(): number {
    return this.lastIndex;
  }
  setEditIndex(i: number): void {
    this.lastIndex = i;
  }
  resetEditIndex(): void {
    this.lastIndex = -1;
  }
  cancelEdit(): void {
    if (this.editFile != null) {
      this.editFile = null;
      this.list.remove$Component(this.editCell);
      this.repaint$();
    } else if (this.detailsTable != null && this.detailsTable.isEditing()) {
      this.detailsTable.getCellEditor$().cancelCellEditing();
    }
  }
  /**
   * @param index visual index of the file to be edited
   */
  editFileName(index: number): void {
    let chooser = this.getFileChooser();
    let currentDirectory = chooser.getCurrentDirectory();
    if (this.readOnly || !this.canWrite(currentDirectory)) {
      return;
    }
    this.ensureIndexIsVisible(index);
    {
      let r: Rectangle, orientation: ComponentOrientation, icon: Icon, editX: number;
      switch (this.viewType) {
        case FilePane.VIEWTYPE_LIST:
          this.editFile = this.getModel().getElementAt(this.getRowSorter().convertRowIndexToModel(index));
          r = this.list.getCellBounds(index, index);
          if (this.editCell == null) {
            this.editCell = new JTextField()._JTextField$();
            this.editCell.setName('Tree.cellEditor');
            this.editCell.addActionListener($J.fn(new FilePane$EditActionListener().$o(this)._FilePane$EditActionListener(), 'actionPerformed'));
            this.editCell.addFocusListener(this.editorFocusListener);
            this.editCell.setNextFocusableComponent(this.list);
          }
          this.list.add$Component(this.editCell);
          this.editCell.setText(chooser.getName$File(this.editFile));
          orientation = this.list.getComponentOrientation();
          this.editCell.setComponentOrientation(orientation);
          icon = chooser.getIcon(this.editFile);
          editX = icon == null ? 20 : (icon.getIconWidth() + 4) | 0;
          if (orientation.isLeftToRight()) {
            this.editCell.setBounds$int$int$int$int((editX + r.x_) | 0, r.y_, (r.width_ - editX) | 0, r.height_);
          } else {
            this.editCell.setBounds$int$int$int$int(r.x_, r.y_, (r.width_ - editX) | 0, r.height_);
          }
          this.editCell.requestFocus$();
          this.editCell.selectAll();
          break;
        case FilePane.VIEWTYPE_DETAILS:
          this.detailsTable.editCellAt$int$int(index, FilePane.COLUMN_FILENAME);
          break;
      }
    }
  }
  applyEdit(): void {
    if (this.editFile != null && this.editFile.exists()) {
      let chooser = this.getFileChooser();
      let oldDisplayName = chooser.getName$File(this.editFile);
      let oldFileName = this.editFile.getName();
      let newDisplayName = JString.trim(this.editCell.getText$());
      let newFileName: string;
      if (!$J.equals(newDisplayName, oldDisplayName)) {
        newFileName = newDisplayName;
        let i1 = oldFileName.length;
        let i2 = oldDisplayName.length;
        if (i1 > i2 && oldFileName.charCodeAt(i2) === 46 /* '.' */) {
          newFileName = newDisplayName + oldFileName.substring(i2);
        }
        let fsv = chooser.getFileSystemView();
        let f2 = fsv.createFileObject(this.editFile.getParentFile(), newFileName);
        if (f2.exists()) {
          JOptionPane.showMessageDialog$Component$Object$String$int(chooser, MessageFormat.format(this.renameErrorFileExistsText, oldFileName), this.renameErrorTitleText, JOptionPane.ERROR_MESSAGE);
        } else {
          if (this.getModel().renameFile(this.editFile, f2)) {
            if (fsv.isParent(chooser.getCurrentDirectory(), f2)) {
              if (chooser.isMultiSelectionEnabled()) {
                chooser.setSelectedFiles([f2]);
              } else {
                chooser.setSelectedFile(f2);
              }
            } else {
            }
          } else {
            JOptionPane.showMessageDialog$Component$Object$String$int(chooser, MessageFormat.format(this.renameErrorText, oldFileName), this.renameErrorTitleText, JOptionPane.ERROR_MESSAGE);
          }
        }
      }
    }
    if (this.detailsTable != null && this.detailsTable.isEditing()) {
      this.detailsTable.getCellEditor$().stopCellEditing();
    }
    this.cancelEdit();
  }
  getNewFolderAction(): Action {
    if (!this.readOnly && this.newFolderAction == null) {
      this.newFolderAction = new (FilePane$9())().$o(this)._AbstractAction$String(this.newFolderActionLabelText).$init_anon();
    }
    return this.newFolderAction;
  }
  setFileSelected(): void {
    if (this.getFileChooser().isMultiSelectionEnabled() && !this.isDirectorySelected()) {
      let files = this.getFileChooser().getSelectedFiles();
      let selectedObjects = this.list.getSelectedValues();
      this.listSelectionModel.setValueIsAdjusting(true);
      try {
        let lead = this.listSelectionModel.getLeadSelectionIndex();
        let anchor = this.listSelectionModel.getAnchorSelectionIndex();
        Arrays.sort(files);
        Arrays.sort(selectedObjects);
        let shouldIndex = 0;
        let actuallyIndex = 0;
        while (shouldIndex < files.length && actuallyIndex < selectedObjects.length) {
          let comparison = files[shouldIndex].compareTo(selectedObjects[actuallyIndex]);
          if (comparison < 0) {
            this.doSelectFile(files[shouldIndex++]);
          } else if (comparison > 0) {
            this.doDeselectFile(selectedObjects[actuallyIndex++]);
          } else {
            shouldIndex++;
            actuallyIndex++;
          }
        }
        while (shouldIndex < files.length) {
          this.doSelectFile(files[shouldIndex++]);
        }
        while (actuallyIndex < selectedObjects.length) {
          this.doDeselectFile(selectedObjects[actuallyIndex++]);
        }
        if (this.listSelectionModel instanceof DefaultListSelectionModel) {
          (this.listSelectionModel).moveLeadSelectionIndex(lead);
          this.listSelectionModel.setAnchorSelectionIndex(anchor);
        }
      } finally {
        this.listSelectionModel.setValueIsAdjusting(false);
      }
    } else {
      let chooser = this.getFileChooser();
      let f: File;
      if (this.isDirectorySelected()) {
        f = this.getDirectory();
      } else {
        f = chooser.getSelectedFile();
      }
      let i: number;
      if (f != null && (i = this.getModel().indexOf(f)) >= 0) {
        let viewIndex = this.getRowSorter().convertRowIndexToView(i);
        this.listSelectionModel.setSelectionInterval(viewIndex, viewIndex);
        this.ensureIndexIsVisible(viewIndex);
      } else {
        this.clearSelection();
      }
    }
  }
  doSelectFile(fileToSelect: File): void {
    let index = this.getModel().indexOf(fileToSelect);
    if (index >= 0) {
      index = this.getRowSorter().convertRowIndexToView(index);
      this.listSelectionModel.addSelectionInterval(index, index);
    }
  }
  doDeselectFile(fileToDeselect: any): void {
    let index = this.getRowSorter().convertRowIndexToView(this.getModel().indexOf(fileToDeselect));
    this.listSelectionModel.removeSelectionInterval(index, index);
  }
  doSelectedFileChanged(e: PropertyChangeEvent): void {
    this.applyEdit();
    let f = e.getNewValue();
    let fc = this.getFileChooser();
    if (f != null && ((fc.isFileSelectionEnabled() && !f.isDirectory()) || (f.isDirectory() && fc.isDirectorySelectionEnabled()))) {
      this.setFileSelected();
    }
  }
  doSelectedFilesChanged(e: PropertyChangeEvent): void {
    this.applyEdit();
    let files = e.getNewValue();
    let fc = this.getFileChooser();
    if (files != null && files.length > 0 && (files.length > 1 || fc.isDirectorySelectionEnabled() || !files[0].isDirectory())) {
      this.setFileSelected();
    }
  }
  doDirectoryChanged(e: PropertyChangeEvent): void {
    this.getDetailsTableModel().updateColumnInfo();
    let fc = this.getFileChooser();
    let fsv = fc.getFileSystemView();
    this.applyEdit();
    this.resetEditIndex();
    this.ensureIndexIsVisible(0);
    let currentDirectory = fc.getCurrentDirectory();
    if (currentDirectory != null) {
      if (!this.readOnly) {
        this.getNewFolderAction().setEnabled(this.canWrite(currentDirectory));
      }
      this.fileChooserUIAccessor.getChangeToParentDirectoryAction().setEnabled(!fsv.isRoot(currentDirectory));
    }
    if (this.list != null) {
      this.list.clearSelection();
    }
  }
  doFilterChanged(e: PropertyChangeEvent): void {
    this.applyEdit();
    this.resetEditIndex();
    this.clearSelection();
  }
  doFileSelectionModeChanged(e: PropertyChangeEvent): void {
    this.applyEdit();
    this.resetEditIndex();
    this.clearSelection();
  }
  doMultiSelectionChanged(e: PropertyChangeEvent): void {
    this.clearSelection();
    if (this.getFileChooser().isMultiSelectionEnabled()) {
      this.listSelectionModel.setSelectionMode(ListSelectionModel.MULTIPLE_INTERVAL_SELECTION);
      this.getFileChooser().setSelectedFile(null);
    } else {
      this.listSelectionModel.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
      this.getFileChooser().setSelectedFiles(null);
    }
  }
  propertyChange(e: PropertyChangeEvent): void {
    if (this.viewType === -1) {
      this.setViewType(FilePane.VIEWTYPE_LIST);
    }
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
    } else if ($J.equals(s, JFileChooser.MULTI_SELECTION_ENABLED_CHANGED_PROPERTY)) {
      this.doMultiSelectionChanged(e);
    } else if ($J.equals(s, JFileChooser.CANCEL_SELECTION)) {
      this.applyEdit();
    } else if ($J.equals(s, 'busy')) {
      this.setCursor$Cursor(e.getNewValue() ? FilePane.waitCursor : null);
    } else if ($J.equals(s, 'componentOrientation')) {
      let o = e.getNewValue();
      let cc = e.getSource();
      if (o !== e.getOldValue()) {
        cc.applyComponentOrientation(o);
      }
      if (this.detailsTable != null) {
        this.detailsTable.setComponentOrientation(o);
        this.detailsTable.getParent().getParent().setComponentOrientation(o);
      }
    }
  }
  ensureIndexIsVisible(i: number): void {
    if (i >= 0) {
      if (this.list != null) {
        this.list.ensureIndexIsVisible(i);
      }
      if (this.detailsTable != null) {
        this.detailsTable.scrollRectToVisible(this.detailsTable.getCellRect(i, FilePane.COLUMN_FILENAME, true));
      }
    }
  }
  ensureFileIsVisible(fc: JFileChooser, f: File): void {
    let modelIndex = this.getModel().indexOf(f);
    if (modelIndex >= 0) {
      this.ensureIndexIsVisible(this.getRowSorter().convertRowIndexToView(modelIndex));
    }
  }
  rescanCurrentDirectory(): void {
    this.getModel().validateFileCache();
  }
  clearSelection(): void {
    if (this.listSelectionModel != null) {
      this.listSelectionModel.clearSelection();
      if (this.listSelectionModel instanceof DefaultListSelectionModel) {
        (this.listSelectionModel).moveLeadSelectionIndex(-1);
        this.listSelectionModel.setAnchorSelectionIndex(-1);
      }
    }
  }
  getViewMenu(): JMenu {
    if (this.viewMenu == null) {
      this.viewMenu = new JMenu()._JMenu$String(this.viewMenuLabelText);
      let viewButtonGroup = new ButtonGroup()._ButtonGroup();
      for (let i = 0; i < FilePane.VIEWTYPE_COUNT; i++) {
        let mi = new JRadioButtonMenuItem()._JRadioButtonMenuItem$Action(new FilePane$ViewTypeAction().$o(this)._FilePane$ViewTypeAction(i));
        viewButtonGroup.add(mi);
        this.viewMenu.add$JMenuItem(mi);
      }
      this.updateViewMenu();
    }
    return this.viewMenu;
  }
  updateViewMenu(): void {
    if (this.viewMenu != null) {
      let comps = this.viewMenu.getMenuComponents();
      for (let comp of comps) {
        if (comp instanceof JRadioButtonMenuItem) {
          let mi = comp;
          if ((mi.getAction()).viewType === this.viewType) {
            mi.setSelected(true);
          }
        }
      }
    }
  }
  getComponentPopupMenu(): JPopupMenu {
    let popupMenu = this.getFileChooser().getComponentPopupMenu();
    if (popupMenu != null) {
      return popupMenu;
    }
    let viewMenu = this.getViewMenu();
    if (this.contextMenu == null) {
      this.contextMenu = new JPopupMenu()._JPopupMenu$();
      if (viewMenu != null) {
        this.contextMenu.add$JMenuItem(viewMenu);
        if (this.listViewWindowsStyle) {
          this.contextMenu.addSeparator();
        }
      }
      let actionMap = this.getActionMap$();
      let refreshAction = actionMap.get(FilePane.ACTION_REFRESH);
      let newFolderAction = actionMap.get(FilePane.ACTION_NEW_FOLDER);
      if (refreshAction != null) {
        this.contextMenu.add$Action(refreshAction);
        if (this.listViewWindowsStyle && newFolderAction != null) {
          this.contextMenu.addSeparator();
        }
      }
      if (newFolderAction != null) {
        this.contextMenu.add$Action(newFolderAction);
      }
    }
    if (viewMenu != null) {
      viewMenu.getPopupMenu().setInvoker(viewMenu);
    }
    return this.contextMenu;
  }
  getMouseHandler(): FilePane$Handler {
    if (this.handler == null) {
      this.handler = new FilePane$Handler().$o(this)._FilePane$Handler();
    }
    return this.handler;
  }
  /**
   * Property to remember whether a directory is currently selected in the UI.
   *
   * @return <code>true</code> iff a directory is currently selected.
   */
  isDirectorySelected(): boolean {
    return this.fileChooserUIAccessor.isDirectorySelected();
  }
  /**
   * Property to remember the directory that is currently selected in the UI.
   *
   * @return the value of the <code>directory</code> property
   * @see javax.swing.plaf.basic.BasicFileChooserUI#setDirectory
   */
  getDirectory(): File {
    return this.fileChooserUIAccessor.getDirectory();
  }
  findChildComponent<T>(container: Container, cls: JClass<T>): T {
    let n = container.getComponentCount();
    for (let i = 0; i < n; i++) {
      let comp = container.getComponent$int(i);
      if (cls.isInstance(comp)) {
        return cls.cast(comp);
      } else if (comp instanceof Container) {
        let c = this.findChildComponent(comp, cls);
        if (c != null) {
          return c;
        }
      }
    }
    return null;
  }
  canWrite(f: File): boolean {
    if (!f.exists()) {
      return false;
    }
    try {
      if ($J.isa(f, ShellFolder)) {
        return f.canWrite();
      } else {
        if (FilePane.usesShellFolder(this.getFileChooser())) {
          try {
            return ShellFolder.getShellFolder(f).canWrite();
          } catch ($e0) {
            if ($J.isa($e0, FileNotFoundException)) {
              let ex = $J.exc($e0);
              return false;
            } else {
              throw $e0;
            }
          }
        } else {
          return f.canWrite();
        }
      }
    } catch ($e1) {
      if ($J.isa($e1, SecurityException)) {
        let e = $J.exc($e1);
        return false;
      } else {
        throw $e1;
      }
    }
  }
  /**
   * Returns true if specified FileChooser should use ShellFolder
   */
  static usesShellFolder(chooser: JFileChooser): boolean {
    let prop = chooser.getClientProperty('FileChooser.useShellFolder');
    return prop == null ? $J.equals(chooser.getFileSystemView(), FileSystemView.getFileSystemView()) : prop;
  }
  static $clinit() {
    FilePane.waitCursor = Cursor.getPredefinedCursor(Cursor.WAIT_CURSOR);
    FilePane.repaintListener = new (FilePane$3())();
  }
}

export class FilePane$ViewTypeAction extends AbstractAction {
  viewType: number = 0;
  _FilePane$ViewTypeAction(viewType: number): this {
    this._AbstractAction$String(this.$outer.viewTypeActionNames[viewType]);
    this.viewType = viewType;
    let cmd: string;
    switch (viewType) {
      case FilePane.VIEWTYPE_LIST:
        cmd = FilePane.ACTION_VIEW_LIST;
        break;
      case FilePane.VIEWTYPE_DETAILS:
        cmd = FilePane.ACTION_VIEW_DETAILS;
        break;
      default:
        cmd = this.getValue$String(Action.NAME);
    }
    this.putValue(Action.ACTION_COMMAND_KEY, cmd);
    return this;
  }
  actionPerformed(e: ActionEvent): void {
    this.$outer.setViewType(this.viewType);
  }
}

/**
 * This model allows for sorting JList
 */
export class FilePane$SortableListModel extends AbstractListModel {
  _FilePane$SortableListModel(): this {
    this._AbstractListModel();
    this.$outer.getDetailsTableModel().addTableModelListener(this);
    this.$outer.getRowSorter().addRowSorterListener(this);
    return this;
  }
  getSize(): number {
    return this.$outer.getModel().getSize();
  }
  getElementAt(index: number): any {
    return this.$outer.getModel().getElementAt(this.$outer.getRowSorter().convertRowIndexToModel(index));
  }
  tableChanged(e: TableModelEvent): void {
    this.fireContentsChanged$Object$int$int(this, 0, this.getSize());
  }
  sorterChanged(e: RowSorterEvent): void {
    this.fireContentsChanged$Object$int$int(this, 0, this.getSize());
  }
}

export class FilePane$DetailsTableModel extends AbstractTableModel {
  chooser: JFileChooser = null;
  directoryModel: BasicDirectoryModel = null;
  columns: ShellFolderColumnInfo[] = null;
  columnMap: number[] = null;
  _FilePane$DetailsTableModel(fc: JFileChooser): this {
    this._AbstractTableModel();
    this.chooser = fc;
    this.directoryModel = this.$outer.getModel();
    this.directoryModel.addListDataListener(this);
    this.updateColumnInfo();
    return this;
  }
  updateColumnInfo(): void {
    let dir = this.chooser.getCurrentDirectory();
    if (dir != null && FilePane.usesShellFolder(this.chooser)) {
      try {
        dir = ShellFolder.getShellFolder(dir);
      } catch ($e2) {
        if ($J.isa($e2, FileNotFoundException)) {
          let e = $J.exc($e2);
        } else {
          throw $e2;
        }
      }
    }
    let allColumns = ShellFolder.getFolderColumns(dir);
    let visibleColumns = new ArrayList();
    this.columnMap = $J.newArray(allColumns.length, 0);
    for (let i = 0; i < allColumns.length; i++) {
      let column = allColumns[i];
      if (column.isVisible()) {
        this.columnMap[visibleColumns.size()] = i;
        visibleColumns.add(column);
      }
    }
    this.columns = $J.newArray(visibleColumns.size(), null);
    $J.toArrayInto(visibleColumns.toArray(), this.columns);
    this.columnMap = Arrays.copyOf(this.columnMap, this.columns.length);
    let sortKeys = (this.$outer.rowSorter == null) ? null : this.$outer.rowSorter.getSortKeys();
    this.fireTableStructureChanged();
    this.restoreSortKeys(sortKeys);
  }
  restoreSortKeys(sortKeys: List<RowSorter$SortKey>): void {
    if (sortKeys != null) {
      for (let i = 0; i < sortKeys.size(); i++) {
        let sortKey = sortKeys.get(i);
        if (sortKey.getColumn() >= this.columns.length) {
          sortKeys = null;
          break;
        }
      }
      if (sortKeys != null) {
        this.$outer.rowSorter.setSortKeys(sortKeys);
      }
    }
  }
  getRowCount(): number {
    return this.directoryModel.getSize();
  }
  getColumnCount(): number {
    return this.columns.length;
  }
  getValueAt(row: number, col: number): any {
    return this.getFileColumnValue(this.directoryModel.getElementAt(row), col);
  }
  getFileColumnValue(f: File, col: number): any {
    return (col === FilePane.COLUMN_FILENAME) ? f : ShellFolder.getFolderColumnValue(f, this.columnMap[col]);
  }
  setValueAt(value: any, row: number, col: number): void {
    if (col === FilePane.COLUMN_FILENAME) {
      let chooser = this.$outer.getFileChooser();
      let f = this.getValueAt(row, col);
      if (f != null) {
        let oldDisplayName = chooser.getName$File(f);
        let oldFileName = f.getName();
        let newDisplayName = JString.trim((value));
        let newFileName: string;
        if (!$J.equals(newDisplayName, oldDisplayName)) {
          newFileName = newDisplayName;
          let i1 = oldFileName.length;
          let i2 = oldDisplayName.length;
          if (i1 > i2 && oldFileName.charCodeAt(i2) === 46 /* '.' */) {
            newFileName = newDisplayName + oldFileName.substring(i2);
          }
          let fsv = chooser.getFileSystemView();
          let f2 = fsv.createFileObject(f.getParentFile(), newFileName);
          if (f2.exists()) {
            JOptionPane.showMessageDialog$Component$Object$String$int(chooser, MessageFormat.format(this.$outer.renameErrorFileExistsText, oldFileName), this.$outer.renameErrorTitleText, JOptionPane.ERROR_MESSAGE);
          } else {
            if (this.directoryModel.renameFile(f, f2)) {
              if (fsv.isParent(chooser.getCurrentDirectory(), f2)) {
                SwingUtilities.invokeLater(() => {
                  if (chooser.isMultiSelectionEnabled()) {
                    chooser.setSelectedFiles([f2]);
                  } else {
                    chooser.setSelectedFile(f2);
                  }
                });
              } else {
              }
            } else {
              JOptionPane.showMessageDialog$Component$Object$String$int(chooser, MessageFormat.format(this.$outer.renameErrorText, oldFileName), this.$outer.renameErrorTitleText, JOptionPane.ERROR_MESSAGE);
            }
          }
        }
      }
    }
  }
  isCellEditable(row: number, column: number): boolean {
    let currentDirectory = this.$outer.getFileChooser().getCurrentDirectory();
    return (!this.$outer.readOnly && column === FilePane.COLUMN_FILENAME && this.$outer.canWrite(currentDirectory));
  }
  contentsChanged(e: ListDataEvent): void {
    new FilePane$DelayedSelectionUpdater().$o(this.$outer)._FilePane$DelayedSelectionUpdater$();
    this.fireTableDataChanged();
  }
  intervalAdded(e: ListDataEvent): void {
    let i0 = e.getIndex0();
    let i1 = e.getIndex1();
    if (i0 === i1) {
      let file = this.directoryModel.getElementAt(i0);
      if (file.equals(this.$outer.newFolderFile)) {
        new FilePane$DelayedSelectionUpdater().$o(this.$outer)._FilePane$DelayedSelectionUpdater$File(file);
        this.$outer.newFolderFile = null;
      }
    }
    this.fireTableRowsInserted(e.getIndex0(), e.getIndex1());
  }
  intervalRemoved(e: ListDataEvent): void {
    this.fireTableRowsDeleted(e.getIndex0(), e.getIndex1());
  }
  getColumns(): ShellFolderColumnInfo[] {
    return this.columns;
  }
}

export class FilePane$DetailsTableRowSorter extends TableRowSorter {
  _FilePane$DetailsTableRowSorter(): this {
    this._TableRowSorter$();
    let modelWrapper = new FilePane$DetailsTableRowSorter$SorterModelWrapper().$o(this)._FilePane$DetailsTableRowSorter$SorterModelWrapper();
    this.setModelWrapper(modelWrapper);
    modelWrapper.getModel().addTableModelListener(new (FilePane$DetailsTableRowSorter$1())().$o(this));
    return this;
  }
  updateComparators(columns: ShellFolderColumnInfo[]): void {
    for (let i = 0; i < columns.length; i++) {
      let c = columns[i].getComparator();
      if (c != null) {
        c = $J.fn(new FilePane$DirectoriesFirstComparatorWrapper().$o(this.$outer)._FilePane$DirectoriesFirstComparatorWrapper(i, c), 'compare');
      }
      this.setComparator(i, c);
    }
  }
  sort(): void {
    ShellFolder.invoke(() => {
      super.sort();
      return null;
    });
  }
  modelStructureChanged(): void {
    super.modelStructureChanged();
    this.updateComparators(this.$outer.detailsTableModel.getColumns());
  }
}

export class FilePane$DetailsTableRowSorter$SorterModelWrapper extends DefaultRowSorter$ModelWrapper {
  _FilePane$DetailsTableRowSorter$SorterModelWrapper(): this {
    this._DefaultRowSorter$ModelWrapper();
    return this;
  }
  getModel(): TableModel {
    return this.$outer.$outer.getDetailsTableModel();
  }
  getColumnCount(): number {
    return this.$outer.$outer.getDetailsTableModel().getColumnCount();
  }
  getRowCount(): number {
    return this.$outer.$outer.getDetailsTableModel().getRowCount();
  }
  getValueAt(row: number, column: number): any {
    return this.$outer.$outer.getModel().getElementAt(row);
  }
}

/**
 * This class sorts directories before files, comparing directory to
 * directory and file to file using the wrapped comparator.
 */
export class FilePane$DirectoriesFirstComparatorWrapper extends JObject {
  comparator: Comparator<any> = null;
  column: number = 0;
  _FilePane$DirectoriesFirstComparatorWrapper(column: number, comparator: Comparator<any>): this {
    this.column = column;
    this.comparator = comparator;
    return this;
  }
  compare(f1: File, f2: File): number {
    if (f1 != null && f2 != null) {
      let traversable1 = this.$outer.getFileChooser().isTraversable(f1);
      let traversable2 = this.$outer.getFileChooser().isTraversable(f2);
      if (traversable1 && !traversable2) {
        return -1;
      }
      if (!traversable1 && traversable2) {
        return 1;
      }
    }
    if (this.$outer.detailsTableModel.getColumns()[this.column].isCompareByColumn()) {
      return this.comparator(this.$outer.getDetailsTableModel().getFileColumnValue(f1, this.column), this.$outer.getDetailsTableModel().getFileColumnValue(f2, this.column));
    }
    return this.comparator(f1, f2);
  }
}

export class FilePane$DetailsTableCellEditor extends DefaultCellEditor {
  tf: JTextField = null;
  _FilePane$DetailsTableCellEditor(tf: JTextField): this {
    this._DefaultCellEditor$JTextField(tf);
    this.tf = tf;
    tf.setName('Table.editor');
    tf.addFocusListener(this.$outer.editorFocusListener);
    return this;
  }
  getTableCellEditorComponent(table: JTable, value: any, isSelected: boolean, row: number, column: number): Component {
    let comp = super.getTableCellEditorComponent(table, value, isSelected, row, column);
    if ($J.isa(value, File)) {
      this.tf.setText(this.$outer.getFileChooser().getName$File(value));
      this.tf.selectAll();
    }
    return comp;
  }
}

export class FilePane$DetailsTableCellRenderer extends DefaultTableCellRenderer {
  chooser: JFileChooser = null;
  df: DateFormat = null;
  mf: MessageFormat = null;
  nf: NumberFormat = null;
  static readonly baseFileSize: number = 1000;
  _FilePane$DetailsTableCellRenderer(chooser: JFileChooser): this {
    this._DefaultTableCellRenderer();
    this.mf = new MessageFormat('');
    this.nf = NumberFormat.getNumberInstance();
    this.chooser = chooser;
    this.df = DateFormat.getDateTimeInstance(3, 3, chooser.getLocale$());
    this.nf.setMinimumFractionDigits(1);
    return this;
  }
  setBounds$int$int$int$int(x: number, y: number, width: number, height: number): void {
    if (this.getHorizontalAlignment() === SwingConstants.LEADING && !this.$outer.fullRowSelection) {
      width = Math.min(width, (this.getPreferredSize$().width_ + 4) | 0);
    } else {
      x = (x - 4) | 0;
    }
    super.setBounds$int$int$int$int(x, y, width, height);
  }
  getInsets$Insets(i: Insets): Insets {
    i = super.getInsets$Insets(i);
    i.left = (i.left + 4) | 0;
    i.right = (i.right + 4) | 0;
    return i;
  }
  getTableCellRendererComponent(table: JTable, value: any, isSelected: boolean, hasFocus: boolean, row: number, column: number): Component {
    if ((table.convertColumnIndexToModel(column) !== FilePane.COLUMN_FILENAME || (this.$outer.listViewWindowsStyle && !table.isFocusOwner())) && !this.$outer.fullRowSelection) {
      isSelected = false;
    }
    super.getTableCellRendererComponent(table, value, isSelected, hasFocus, row, column);
    this.setIcon(null);
    let modelColumn = table.convertColumnIndexToModel(column);
    let columnInfo = this.$outer.detailsTableModel.getColumns()[modelColumn];
    let alignment = columnInfo.getAlignment();
    if (alignment == null) {
      alignment = ($J.isa(value, JNumber)) ? SwingConstants.RIGHT : SwingConstants.LEADING;
    }
    this.setHorizontalAlignment(alignment);
    let text: string;
    var len;
    if (value == null) {
      text = '';
    } else if ($J.isa(value, File)) {
      let file = value;
      text = this.chooser.getName$File(file);
      let icon = this.chooser.getIcon(file);
      this.setIcon(icon);
    } else if ($J.isa((len = value), Long)) {
      let displayedFileSize = $J.newArray(1, null);
      if (this.$outer.listViewWindowsStyle) {
        this.updateMessageFormatPattern(this.$outer.kiloByteString);
        displayedFileSize[0] = $J.boxD(FilePane$DetailsTableCellRenderer.roundToOneDecimalPlace(len));
      } else {
        let kbVal = FilePane$DetailsTableCellRenderer.roundToOneDecimalPlace(len);
        if (kbVal < FilePane$DetailsTableCellRenderer.baseFileSize) {
          this.updateMessageFormatPattern(this.$outer.kiloByteString);
          displayedFileSize[0] = $J.boxD(kbVal);
        } else {
          let mbVal = FilePane$DetailsTableCellRenderer.roundToOneDecimalPlace(Math.ceil(kbVal));
          if (mbVal < FilePane$DetailsTableCellRenderer.baseFileSize) {
            this.updateMessageFormatPattern(this.$outer.megaByteString);
            displayedFileSize[0] = $J.boxD(mbVal);
          } else {
            this.updateMessageFormatPattern(this.$outer.gigaByteString);
            displayedFileSize[0] = $J.boxD(FilePane$DetailsTableCellRenderer.roundToOneDecimalPlace(Math.ceil(mbVal)));
          }
        }
      }
      text = this.mf.format(displayedFileSize);
    } else if ($J.isa(value, JDate)) {
      text = this.df.format(value);
    } else {
      text = $J.str(value);
    }
    this.setText(text);
    this.putClientProperty('html.disable', this.$outer.getFileChooser().getClientProperty('html.disable'));
    return this;
  }
  updateMessageFormatPattern(pattern: string): void {
    this.mf.applyPattern(pattern);
    this.mf.setFormat(0, this.nf);
  }
  /**
   * Rounds a value to one decimal place. It's used to format
   * file size similar to how it's formatted in file managers on Linux.
   * For example, the file size of 1200 bytes is rounded to 1.2 KB.
   *
   * @param fileSize the file size to round to one decimal place
   * @return file size rounded to one decimal place
   */
  static roundToOneDecimalPlace(fileSize: number): number {
    return Math.ceil(fileSize / 100) / 10;
  }
}

export class FilePane$AlignableTableHeaderRenderer extends JObject {
  wrappedRenderer: TableCellRenderer = null;
  _FilePane$AlignableTableHeaderRenderer(wrappedRenderer: TableCellRenderer): this {
    this.wrappedRenderer = wrappedRenderer;
    return this;
  }
  getTableCellRendererComponent(table: JTable, value: any, isSelected: boolean, hasFocus: boolean, row: number, column: number): Component {
    let c = this.wrappedRenderer.getTableCellRendererComponent(table, value, isSelected, hasFocus, row, column);
    let modelColumn = table.convertColumnIndexToModel(column);
    let columnInfo = this.$outer.detailsTableModel.getColumns()[modelColumn];
    let alignment = columnInfo.getAlignment();
    if (alignment == null) {
      alignment = SwingConstants.CENTER;
    }
    if (c instanceof JLabel) {
      (c).setHorizontalAlignment(alignment);
    }
    return c;
  }
}

export class FilePane$DelayedSelectionUpdater extends JObject {
  editFile: File = null;
  _FilePane$DelayedSelectionUpdater$(): this {
    this._FilePane$DelayedSelectionUpdater$File(null);
    return this;
  }
  _FilePane$DelayedSelectionUpdater$File(editFile: File): this {
    this.editFile = editFile;
    if (this.$outer.isShowing()) {
      SwingUtilities.invokeLater($J.fn(this, 'run'));
    }
    return this;
  }
  run(): void {
    this.$outer.setFileSelected();
    if (this.editFile != null) {
      this.$outer.editFileName(this.$outer.getRowSorter().convertRowIndexToView(this.$outer.getModel().indexOf(this.editFile)));
      this.editFile = null;
    }
  }
}

export class FilePane$EditActionListener extends JObject {
  _FilePane$EditActionListener(): this {
    return this;
  }
  actionPerformed(e: ActionEvent): void {
    this.$outer.applyEdit();
  }
}

export class FilePane$FileRenderer extends DefaultListCellRenderer {
  _FilePane$FileRenderer(): this {
    this._DefaultListCellRenderer();
    return this;
  }
  getListCellRendererComponent(list: JList<any>, value: any, index: number, isSelected: boolean, cellHasFocus: boolean): Component {
    if (this.$outer.listViewWindowsStyle && !list.isFocusOwner()) {
      isSelected = false;
    }
    super.getListCellRendererComponent(list, value, index, isSelected, cellHasFocus);
    let file = value;
    let fileName = this.$outer.getFileChooser().getName$File(file);
    this.setText(fileName);
    this.setFont(list.getFont());
    let icon = this.$outer.getFileChooser().getIcon(file);
    if (icon != null) {
      this.setIcon(icon);
    } else {
      if (this.$outer.getFileChooser().getFileSystemView().isTraversable(file)) {
        this.setText(fileName + File.separator);
      }
    }
    this.putClientProperty('html.disable', this.$outer.getFileChooser().getClientProperty('html.disable'));
    return this;
  }
}

export class FilePane$Handler extends JObject {
  doubleClickListener: MouseListener = null;
  _FilePane$Handler(): this {
    return this;
  }
  mouseClicked(evt: MouseEvent): void {
    let source = evt.getSource();
    let index: number;
    if (source instanceof JList) {
      index = SwingUtilities2.loc2IndexFileList(this.$outer.list, evt.getPoint());
    } else if (source instanceof JTable) {
      let table = source;
      let p = evt.getPoint();
      index = table.rowAtPoint(p);
      let pointOutsidePrefSize = SwingUtilities2.pointOutsidePrefSize(table, index, table.columnAtPoint(p), p);
      if (pointOutsidePrefSize && !this.$outer.fullRowSelection) {
        return;
      }
      if (index >= 0 && this.$outer.list != null && this.$outer.listSelectionModel.isSelectedIndex(index)) {
        let r = this.$outer.list.getCellBounds(index, index);
        let newEvent = new MouseEvent()._MouseEvent$Component$int$long$int$int$int$int$int$int$boolean$int(this.$outer.list, evt.getID(), evt.getWhen(), evt.getModifiers(), (r.x_ + 1) | 0, (r.y_ + $J.idiv(r.height_, 2)) | 0, evt.getXOnScreen(), evt.getYOnScreen(), evt.getClickCount(), evt.isPopupTrigger(), evt.getButton());
        let meAccessor = AWTAccessor.getMouseEventAccessor();
        meAccessor.setCausedByTouchEvent(newEvent, meAccessor.isCausedByTouchEvent(evt));
        evt = newEvent;
      }
    } else {
      return;
    }
    if (index >= 0 && SwingUtilities.isLeftMouseButton(evt)) {
      let fc = this.$outer.getFileChooser();
      if (evt.getClickCount() === 1 && source instanceof JList) {
        if ((!fc.isMultiSelectionEnabled() || fc.getSelectedFiles().length <= 1) && index >= 0 && this.$outer.listSelectionModel.isSelectedIndex(index) && this.$outer.getEditIndex() === index && this.$outer.editFile == null) {
          this.$outer.editFileName(index);
        } else {
          if (index >= 0) {
            this.$outer.setEditIndex(index);
          } else {
            this.$outer.resetEditIndex();
          }
        }
      } else if (evt.getClickCount() === 2) {
        this.$outer.resetEditIndex();
      }
    }
    if (this.getDoubleClickListener() != null) {
      this.getDoubleClickListener().mouseClicked(evt);
    }
  }
  mouseEntered(evt: MouseEvent): void {
    let source = evt.getSource();
    if (source instanceof JTable) {
      let table = evt.getSource();
      let th1 = this.$outer.getFileChooser().getTransferHandler();
      let th2 = table.getTransferHandler();
      if (th1 !== th2) {
        table.setTransferHandler(th1);
      }
      let dragEnabled = this.$outer.getFileChooser().getDragEnabled();
      if (dragEnabled !== table.getDragEnabled()) {
        table.setDragEnabled(dragEnabled);
      }
    } else if (source instanceof JList) {
      if (this.getDoubleClickListener() != null) {
        this.getDoubleClickListener().mouseEntered(evt);
      }
    }
  }
  mouseExited(evt: MouseEvent): void {
    if (evt.getSource() instanceof JList) {
      if (this.getDoubleClickListener() != null) {
        this.getDoubleClickListener().mouseExited(evt);
      }
    }
  }
  mousePressed(evt: MouseEvent): void {
    if (evt.getSource() instanceof JList) {
      if (this.getDoubleClickListener() != null) {
        this.getDoubleClickListener().mousePressed(evt);
      }
    }
  }
  mouseReleased(evt: MouseEvent): void {
    if (evt.getSource() instanceof JList) {
      if (this.getDoubleClickListener() != null) {
        this.getDoubleClickListener().mouseReleased(evt);
      }
    }
  }
  getDoubleClickListener(): MouseListener {
    if (this.doubleClickListener == null && this.$outer.list != null) {
      this.doubleClickListener = this.$outer.fileChooserUIAccessor.createDoubleClickListener(this.$outer.list);
    }
    return this.doubleClickListener;
  }
}

export class FilePane$FileChooserUIAccessor {
}

let $FilePane$1: any = null;
/** An anonymous class (FilePane.java:186). */
function FilePane$1(): any {
  return $FilePane$1 ??= $J.local(class extends KeyAdapter {
    timeFactor: number = 0;
    typedString: StringBuilder = null;
    lastTime: number = 0;
    $init_anon() {
      this.typedString = new StringBuilder();
      this.lastTime = 1000;
      let l = UIManager.get$Object('Table.timeFactor');
      this.timeFactor = (l != null) ? l : 1000;
      return this;
    }
    /**
     * Moves the keyboard focus to the first element whose prefix matches
     * the sequence of alphanumeric keys pressed by the user with delay
     * less than value of <code>timeFactor</code>. Subsequent same key
     * presses move the keyboard focus to the next object that starts with
     * the same letter until another key is pressed, then it is treated
     * as the prefix with appropriate number of the same letters followed
     * by first typed another letter.
     */
    keyTyped(e: KeyEvent): void {
      let model = this.$outer.getModel();
      let rowCount = model.getSize();
      if (this.$outer.detailsTable == null || rowCount === 0 || e.isAltDown() || e.isControlDown() || e.isMetaDown()) {
        return;
      }
      let inputMap = this.$outer.detailsTable.getInputMap$int(JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT);
      let key = KeyStroke.getKeyStrokeForEvent(e);
      if (inputMap != null && inputMap.get(key) != null) {
        return;
      }
      let startIndex = this.$outer.detailsTable.getSelectionModel().getLeadSelectionIndex();
      if (startIndex < 0) {
        startIndex = 0;
      }
      if (startIndex >= rowCount) {
        startIndex = (rowCount - 1) | 0;
      }
      let c = e.getKeyChar();
      let time = e.getWhen();
      if (time - this.lastTime < this.timeFactor) {
        if (this.typedString.length() === 1 && this.typedString.charAt(0) === c) {
          startIndex++;
        } else {
          this.typedString.append(String.fromCharCode(c));
        }
      } else {
        startIndex++;
        this.typedString.setLength(0);
        this.typedString.append(String.fromCharCode(c));
      }
      this.lastTime = time;
      if (startIndex >= rowCount) {
        startIndex = 0;
      }
      let index = this.getNextMatch(startIndex, (rowCount - 1) | 0);
      if (index < 0 && startIndex > 0) {
        index = this.getNextMatch(0, (startIndex - 1) | 0);
      }
      if (index >= 0) {
        this.$outer.detailsTable.getSelectionModel().setSelectionInterval(index, index);
        let cellRect = this.$outer.detailsTable.getCellRect(index, this.$outer.detailsTable.convertColumnIndexToView(FilePane.COLUMN_FILENAME), false);
        this.$outer.detailsTable.scrollRectToVisible(cellRect);
      }
    }
    getNextMatch(startIndex: number, finishIndex: number): number {
      let model = this.$outer.getModel();
      let fileChooser = this.$outer.getFileChooser();
      let rowSorter = this.$outer.getRowSorter();
      let prefix = this.typedString.toString().toLowerCase();
      for (let index = startIndex; index <= finishIndex; index++) {
        let file = model.getElementAt(rowSorter.convertRowIndexToModel(index));
        let fileName = fileChooser.getName$File(file).toLowerCase();
        if (fileName.startsWith(prefix)) {
          return index;
        }
      }
      return -1;
    }
  }, 'sun.swing.FilePane$1', []);
}

let $FilePane$2: any = null;
/** An anonymous class (FilePane.java:296). */
function FilePane$2(): any {
  return $FilePane$2 ??= $J.local(class extends FocusAdapter {
    focusLost(e: FocusEvent): void {
      if (!e.isTemporary()) {
        this.$outer.applyEdit();
      }
    }
  }, 'sun.swing.FilePane$2', []);
}

let $FilePane$1FilePaneAction: any = null;
/** The local class FilePaneAction (FilePane.java:554). */
function FilePane$1FilePaneAction(): any {
  return $FilePane$1FilePaneAction ??= $J.local(class extends AbstractAction {
    _FilePaneAction$String(name: string): this {
      this._FilePaneAction$String$String(name, name);
      return this;
    }
    _FilePaneAction$String$String(name: string, cmd: string): this {
      this._AbstractAction$String(name);
      this.putValue(Action.ACTION_COMMAND_KEY, cmd);
      return this;
    }
    actionPerformed(e: ActionEvent): void {
      let cmd = this.getValue$String(Action.ACTION_COMMAND_KEY);
      if (cmd === FilePane.ACTION_CANCEL) {
        if (this.$outer.editFile != null) {
          this.$outer.cancelEdit();
        } else {
          this.$outer.getFileChooser().cancelSelection();
        }
      } else if (cmd === FilePane.ACTION_EDIT_FILE_NAME) {
        let fc = this.$outer.getFileChooser();
        let index = this.$outer.listSelectionModel.getMinSelectionIndex();
        if (index >= 0 && this.$outer.editFile == null && (!fc.isMultiSelectionEnabled() || fc.getSelectedFiles().length <= 1)) {
          this.$outer.editFileName(index);
        }
      } else if (cmd === FilePane.ACTION_REFRESH) {
        this.$outer.getFileChooser().rescanCurrentDirectory();
      }
    }
    isEnabled(): boolean {
      let cmd = this.getValue$String(Action.ACTION_COMMAND_KEY);
      if (cmd === FilePane.ACTION_CANCEL) {
        return this.$outer.getFileChooser().isEnabled();
      } else if (cmd === FilePane.ACTION_EDIT_FILE_NAME) {
        return !this.$outer.readOnly && this.$outer.getFileChooser().isEnabled();
      } else {
        return true;
      }
    }
  }, 'sun.swing.FilePane$1FilePaneAction', []);
}

let $FilePane$4: any = null;
/** An anonymous class (FilePane.java:663). */
function FilePane$4(): any {
  return $FilePane$4 ??= $J.local(class extends JList {
    getNextMatch(prefix: string, startIndex: number, bias: Position$Bias): number {
      let model = this.getModel();
      let max = model.getSize();
      if (prefix == null || startIndex < 0 || startIndex >= max) {
        throw new IllegalArgumentException();
      }
      let backwards = (bias === Position$Bias.Backward);
      for (let i = startIndex; backwards ? i >= 0 : i < max; i = (i + (backwards ? -1 : 1)) | 0) {
        let filename = this.$cv_fileChooser.getName$File(model.getElementAt(i));
        if (JString.regionMatches(filename, true, 0, prefix, 0, prefix.length)) {
          return i;
        }
      }
      return -1;
    }
    $c($fileChooser): this {
      this.$cv_fileChooser = $fileChooser;
      return this;
    }
  }, 'sun.swing.FilePane$4', []);
}

let $FilePane$5: any = null;
/** An anonymous class (FilePane.java:693). */
function FilePane$5(): any {
  return $FilePane$5 ??= $J.local(class extends JObject {
    intervalAdded(e: ListDataEvent): void {
      this.$outer.updateListRowCount(this.$cv_list);
    }
    intervalRemoved(e: ListDataEvent): void {
      this.$outer.updateListRowCount(this.$cv_list);
    }
    contentsChanged(e: ListDataEvent): void {
      if (this.$outer.isShowing()) {
        this.$outer.clearSelection();
      }
      this.$outer.updateListRowCount(this.$cv_list);
    }
    $c($list): this {
      this.$cv_list = $list;
      return this;
    }
  }, 'sun.swing.FilePane$5', ['javax.swing.event.ListDataListener']);
}

let $FilePane$6: any = null;
/** An anonymous class (FilePane.java:1268). */
function FilePane$6(): any {
  return $FilePane$6 ??= $J.local(class extends JTable {
    processKeyBinding(ks: KeyStroke, e: KeyEvent, condition: number, pressed: boolean): boolean {
      if (e.getKeyCode() === KeyEvent.VK_ESCAPE && this.getCellEditor$() == null) {
        this.$cv_chooser.dispatchEvent(e);
        return true;
      }
      return super.processKeyBinding(ks, e, condition, pressed);
    }
    tableChanged(e: TableModelEvent): void {
      super.tableChanged(e);
      if (e.getFirstRow() === TableModelEvent.HEADER_ROW) {
        this.$outer.updateDetailsColumnModel(this);
      }
    }
    $c($chooser): this {
      this.$cv_chooser = $chooser;
      return this;
    }
  }, 'sun.swing.FilePane$6', []);
}

let $FilePane$7: any = null;
/** An anonymous class (FilePane.java:1333). */
function FilePane$7(): any {
  return $FilePane$7 ??= $J.local(class extends ComponentAdapter {
    componentResized(e: ComponentEvent): void {
      let sp = e.getComponent();
      this.$outer.fixNameColumnWidth(sp.getViewport().getSize$().width_);
      sp.removeComponentListener(this);
    }
  }, 'sun.swing.FilePane$7', []);
}

let $FilePane$8: any = null;
/** An anonymous class (FilePane.java:1345). */
function FilePane$8(): any {
  return $FilePane$8 ??= $J.local(class extends MouseAdapter {
    mousePressed(e: MouseEvent): void {
      let jsp = (e.getComponent());
      let table = jsp.getViewport().getView();
      if (!e.isShiftDown() || table.getSelectionModel().getSelectionMode() === ListSelectionModel.SINGLE_SELECTION) {
        this.$outer.clearSelection();
        let tce = table.getCellEditor$();
        if (tce != null) {
          tce.stopCellEditing();
        }
      }
    }
  }, 'sun.swing.FilePane$8', []);
}

let $FilePane$9: any = null;
/** An anonymous class (FilePane.java:1583). */
function FilePane$9(): any {
  return $FilePane$9 ??= $J.local(class extends AbstractAction {
    basicNewFolderAction: Action = null;
    $init_anon() {
      this.putValue(Action.ACTION_COMMAND_KEY, FilePane.ACTION_NEW_FOLDER);
      let currentDirectory = this.$outer.getFileChooser().getCurrentDirectory();
      if (currentDirectory != null) {
        this.setEnabled(this.$outer.canWrite(currentDirectory));
      }
      return this;
    }
    actionPerformed(ev: ActionEvent): void {
      if (this.basicNewFolderAction == null) {
        this.basicNewFolderAction = this.$outer.fileChooserUIAccessor.getNewFolderAction();
      }
      let fc = this.$outer.getFileChooser();
      let oldFile = fc.getSelectedFile();
      this.basicNewFolderAction.actionPerformed(ev);
      let newFile = fc.getSelectedFile();
      if (newFile != null && !newFile.equals(oldFile) && newFile.isDirectory()) {
        this.$outer.newFolderFile = newFile;
      }
    }
  }, 'sun.swing.FilePane$9', []);
}

let $FilePane$3: any = null;
/** An anonymous class (FilePane.java:304). */
function FilePane$3(): any {
  return $FilePane$3 ??= $J.local(class extends JObject {
    focusGained(fe: FocusEvent): void {
      this.repaintSelection(fe.getSource());
    }
    focusLost(fe: FocusEvent): void {
      this.repaintSelection(fe.getSource());
    }
    repaintSelection(source: any): void {
      if (source instanceof JList) {
        this.repaintListSelection(source);
      } else if (source instanceof JTable) {
        this.repaintTableSelection(source);
      }
    }
    repaintListSelection(list: JList<any>): void {
      let indices = list.getSelectedIndices();
      for (let i of indices) {
        let bounds = list.getCellBounds(i, i);
        list.repaint$Rectangle(bounds);
      }
    }
    repaintTableSelection(table: JTable): void {
      let minRow = table.getSelectionModel().getMinSelectionIndex();
      let maxRow = table.getSelectionModel().getMaxSelectionIndex();
      if (minRow === -1 || maxRow === -1) {
        return;
      }
      let col0 = table.convertColumnIndexToView(FilePane.COLUMN_FILENAME);
      let first = table.getCellRect(minRow, col0, false);
      let last = table.getCellRect(maxRow, col0, false);
      let dirty = first.union(last);
      table.repaint$Rectangle(dirty);
    }
  }, 'sun.swing.FilePane$3', ['java.awt.event.FocusListener']);
}

let $FilePane$DetailsTableRowSorter$1: any = null;
/** An anonymous class (FilePane.java:997). */
function FilePane$DetailsTableRowSorter$1(): any {
  return $FilePane$DetailsTableRowSorter$1 ??= $J.local(class extends JObject {
    tableChanged(e: TableModelEvent): void {
      this.$outer.modelStructureChanged();
    }
  }, 'sun.swing.FilePane$DetailsTableRowSorter$1', ['javax.swing.event.TableModelListener']);
}

$J.define(FilePane, 'sun.swing.FilePane', { kind: 'class', ifaces: ['java.beans.PropertyChangeListener'], sup: 'javax.swing.JPanel', ctors: { 'sun.swing.FilePane$FileChooserUIAccessor': '_FilePane' }, clinit: true, lazy: ['waitCursor', 'repaintListener'] });
$J.define(FilePane$ViewTypeAction, 'sun.swing.FilePane$ViewTypeAction', { kind: 'class', sup: 'javax.swing.AbstractAction', ctors: { 'int': '_FilePane$ViewTypeAction' }, inner: true });
$J.define(FilePane$SortableListModel, 'sun.swing.FilePane$SortableListModel', { kind: 'class', ifaces: ['javax.swing.event.TableModelListener', 'javax.swing.event.RowSorterListener'], sup: 'javax.swing.AbstractListModel', ctors: { '': '_FilePane$SortableListModel' }, inner: true });
$J.define(FilePane$DetailsTableModel, 'sun.swing.FilePane$DetailsTableModel', { kind: 'class', ifaces: ['javax.swing.event.ListDataListener'], sup: 'javax.swing.table.AbstractTableModel', ctors: { 'javax.swing.JFileChooser': '_FilePane$DetailsTableModel' }, inner: true });
$J.define(FilePane$DetailsTableRowSorter, 'sun.swing.FilePane$DetailsTableRowSorter', { kind: 'class', sup: 'javax.swing.table.TableRowSorter', ctors: { '': '_FilePane$DetailsTableRowSorter' }, inner: true });
$J.define(FilePane$DetailsTableRowSorter$SorterModelWrapper, 'sun.swing.FilePane$DetailsTableRowSorter$SorterModelWrapper', { kind: 'class', sup: 'javax.swing.DefaultRowSorter$ModelWrapper', ctors: { '': '_FilePane$DetailsTableRowSorter$SorterModelWrapper' }, inner: true });
$J.define(FilePane$DirectoriesFirstComparatorWrapper, 'sun.swing.FilePane$DirectoriesFirstComparatorWrapper', { kind: 'class', ifaces: ['java.util.Comparator'], sup: 'java.lang.Object', ctors: { 'int,java.util.Comparator': '_FilePane$DirectoriesFirstComparatorWrapper' }, inner: true });
$J.define(FilePane$DetailsTableCellEditor, 'sun.swing.FilePane$DetailsTableCellEditor', { kind: 'class', sup: 'javax.swing.DefaultCellEditor', ctors: { 'javax.swing.JTextField': '_FilePane$DetailsTableCellEditor' }, inner: true });
$J.define(FilePane$DetailsTableCellRenderer, 'sun.swing.FilePane$DetailsTableCellRenderer', { kind: 'class', sup: 'javax.swing.table.DefaultTableCellRenderer', ctors: { 'javax.swing.JFileChooser': '_FilePane$DetailsTableCellRenderer' }, meths: { 'getInsets(java.awt.Insets)': 'getInsets$Insets', 'setBounds(int,int,int,int)': 'setBounds$int$int$int$int' }, inner: true });
$J.define(FilePane$AlignableTableHeaderRenderer, 'sun.swing.FilePane$AlignableTableHeaderRenderer', { kind: 'class', ifaces: ['javax.swing.table.TableCellRenderer'], sup: 'java.lang.Object', ctors: { 'javax.swing.table.TableCellRenderer': '_FilePane$AlignableTableHeaderRenderer' }, inner: true });
$J.define(FilePane$DelayedSelectionUpdater, 'sun.swing.FilePane$DelayedSelectionUpdater', { kind: 'class', ifaces: ['java.lang.Runnable'], sup: 'java.lang.Object', ctors: { 'java.io.File': '_FilePane$DelayedSelectionUpdater$File', '': '_FilePane$DelayedSelectionUpdater$' }, inner: true });
$J.define(FilePane$EditActionListener, 'sun.swing.FilePane$EditActionListener', { kind: 'class', ifaces: ['java.awt.event.ActionListener'], sup: 'java.lang.Object', ctors: { '': '_FilePane$EditActionListener' }, inner: true });
$J.define(FilePane$FileRenderer, 'sun.swing.FilePane$FileRenderer', { kind: 'class', sup: 'javax.swing.DefaultListCellRenderer', ctors: { '': '_FilePane$FileRenderer' }, inner: true });
$J.define(FilePane$Handler, 'sun.swing.FilePane$Handler', { kind: 'class', ifaces: ['java.awt.event.MouseListener'], sup: 'java.lang.Object', ctors: { '': '_FilePane$Handler' }, inner: true });
$J.define(FilePane$FileChooserUIAccessor, 'sun.swing.FilePane$FileChooserUIAccessor', { kind: 'interface' });
$J.module(() => {
  BorderLayout = $J.load('java.awt.BorderLayout');
  Container = $J.load('java.awt.Container');
  Cursor = $J.load('java.awt.Cursor');
  Dimension = $J.load('java.awt.Dimension');
  KeyboardFocusManager = $J.load('java.awt.KeyboardFocusManager');
  ComponentAdapter = $J.load('java.awt.event.ComponentAdapter');
  FocusAdapter = $J.load('java.awt.event.FocusAdapter');
  KeyAdapter = $J.load('java.awt.event.KeyAdapter');
  KeyEvent = $J.load('java.awt.event.KeyEvent');
  MouseAdapter = $J.load('java.awt.event.MouseAdapter');
  MouseEvent = $J.load('java.awt.event.MouseEvent');
  AccessibleContext = $J.load('javax.accessibility.AccessibleContext');
  Action = $J.load('javax.swing.Action');
  ButtonGroup = $J.load('javax.swing.ButtonGroup');
  DefaultListSelectionModel = $J.load('javax.swing.DefaultListSelectionModel');
  JComponent = $J.load('javax.swing.JComponent');
  JFileChooser = $J.load('javax.swing.JFileChooser');
  JLabel = $J.load('javax.swing.JLabel');
  JList = $J.load('javax.swing.JList');
  JMenu = $J.load('javax.swing.JMenu');
  JOptionPane = $J.load('javax.swing.JOptionPane');
  JPopupMenu = $J.load('javax.swing.JPopupMenu');
  JRadioButtonMenuItem = $J.load('javax.swing.JRadioButtonMenuItem');
  JScrollPane = $J.load('javax.swing.JScrollPane');
  JTable = $J.load('javax.swing.JTable');
  JTextField = $J.load('javax.swing.JTextField');
  KeyStroke = $J.load('javax.swing.KeyStroke');
  ListSelectionModel = $J.load('javax.swing.ListSelectionModel');
  LookAndFeel = $J.load('javax.swing.LookAndFeel');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIManager = $J.load('javax.swing.UIManager');
  TableModelEvent = $J.load('javax.swing.event.TableModelEvent');
  DefaultTableColumnModel = $J.load('javax.swing.table.DefaultTableColumnModel');
  TableColumn = $J.load('javax.swing.table.TableColumn');
  Position$Bias = $J.load('javax.swing.text.Position$Bias');
  AWTAccessor = $J.load('sun.awt.AWTAccessor');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
