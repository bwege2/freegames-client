// @ts-nocheck
// The native bottom of the translated AWT and Swing, written for the browser (re/freecol/NOTES.md, "The
// client"): what the JDK does in C or through the operating system. This file: the file system as the
// file chooser sees it (javax.swing.filechooser.FileSystemView, backed by ShellFolder in the JDK).
import { $J, JObject, defineLib, str, IOException } from './lang.ts';
import { File } from './io.ts';
import { JDate } from './util.ts';

/** FileSystemView as the JDK's UnixFileSystemView behaves, on the virtual file system. */
export class FileSystemView extends JObject {
  static view: FileSystemView = null;
  static getFileSystemView() {
    return FileSystemView.view ??= new FileSystemView();
  }
  _FileSystemView() {
    return this;
  }
  isRoot(f: any) {
    return f != null && f.isAbsolute() && f.getAbsolutePath() === '/';
  }
  isTraversable(f: any) {
    return f.isDirectory();
  }
  getSystemDisplayName(f: any) {
    if (f == null) return null;
    const n = f.getName();
    return n === '' || this.isRoot(f) ? f.getPath() : n;
  }
  getSystemTypeDescription(_f: any) {
    return null;
  }
  getSystemIcon(f: any, ..._size: any[]) {
    if (f == null) return null;
    const UIManager = $J.load('javax.swing.UIManager');
    return UIManager.getIcon(f.isDirectory() ? 'FileView.directoryIcon' : 'FileView.fileIcon');
  }
  isParent(folder: any, file: any) {
    if (folder == null || file == null) return false;
    return folder.equals(file.getParentFile());
  }
  getChild(parent: any, name: string) {
    return this.createFileObject(parent, name);
  }
  isFileSystem(_f: any) {
    return true;
  }
  createNewFolder(dir: any) {
    if (dir == null) throw new IOException('Containing directory is null:');
    let f = this.createFileObject(dir, 'NewFolder');
    for (let i = 1; f.exists() && i < 100; i++) f = this.createFileObject(dir, 'NewFolder.' + i);
    if (f.exists()) throw new IOException('Directory already exists:' + f.getAbsolutePath());
    f.mkdirs();
    return f;
  }
  isHiddenFile(f: any) {
    return f.isHidden();
  }
  isFileSystemRoot(dir: any) {
    return this.isRoot(dir);
  }
  isDrive(_d: any) {
    return false;
  }
  isFloppyDrive(_d: any) {
    return false;
  }
  isComputerNode(_d: any) {
    return false;
  }
  isLink(_f: any) {
    return false;
  }
  getLinkLocation(_f: any) {
    return null;
  }
  getRoots() {
    return [new File('/')];
  }
  getHomeDirectory() {
    return this.createFileObject($J.system_getProperty('user.home'));
  }
  getDefaultDirectory() {
    return this.getHomeDirectory();
  }
  createFileObject(a: any, b?: string) {
    return b === undefined ? new File(str(a)) : a == null ? new File(b) : new File(a, b);
  }
  createFileSystemRoot(f: any) {
    return f;
  }
  getFiles(dir: any, useFileHiding: boolean) {
    const fs = dir.listFiles() ?? [];
    return useFileHiding ? fs.filter((f: any) => !this.isHiddenFile(f)) : fs;
  }
  getParentDirectory(dir: any) {
    return dir == null ? null : dir.getParentFile();
  }
  getChooserComboBoxFiles() {
    return this.getRoots();
  }
  getChooserShortcutPanelFiles() {
    return [];
  }
  isAbsolute(f: any) {
    return f.isAbsolute();
  }
}
defineLib(FileSystemView, 'javax.swing.filechooser.FileSystemView');

/** sun.awt.shell.ShellFolderColumnInfo: a column of the file chooser's details view. */
export class ShellFolderColumnInfo extends JObject {
  title: string;
  width: number;
  alignment: number;
  visible: boolean;
  comparator: any;
  compareByColumn: boolean;
  constructor(title: string, width: number, alignment: number, visible: boolean, comparator: any, compareByColumn = false) {
    super();
    this.title = title;
    this.width = width;
    this.alignment = alignment;
    this.visible = visible;
    this.comparator = comparator;
    this.compareByColumn = compareByColumn;
  }
  getTitle() { return this.title; }
  getWidth() { return this.width; }
  getAlignment() { return this.alignment; }
  isVisible() { return this.visible; }
  getComparator() { return this.comparator; }
  isCompareByColumn() { return this.compareByColumn; }
}
defineLib(ShellFolderColumnInfo, 'sun.awt.shell.ShellFolderColumnInfo');

/**
 * sun.awt.shell.ShellFolder as the JDK uses it on Unix without a desktop shell: plain files, the default
 * columns (name, size, date) and their values.
 */
export class ShellFolder extends JObject {
  static getFolderColumns(_dir: any) {
    const byValue = (a: any, b: any) => (a == null ? (b == null ? 0 : -1) : b == null ? 1 : $J.compareTo(a, b));
    return [
      new ShellFolderColumnInfo('FileChooser.fileNameHeaderText', 150, 10, true, (a: any, b: any) => $J.compareTo(a.getName(), b.getName())),
      new ShellFolderColumnInfo('FileChooser.fileSizeHeaderText', 75, 4, true, byValue, true),
      new ShellFolderColumnInfo('FileChooser.fileDateHeaderText', 130, 10, true, byValue, true),
    ];
  }
  static getFolderColumnValue(file: any, column: number) {
    if (column === 0) return file;
    if (file.isDirectory()) return null;
    if (column === 1) return file.length();
    if (column === 2) return new JDate(file.lastModified());
    return null;
  }
  static getNormalizedFile(f: any) {
    return new File(f.getCanonicalPath());
  }
  /** A file as a shell folder: the file itself (no links on the virtual file system). */
  static getShellFolder(f: any) {
    return f;
  }
  static sort(files: any) {
    files.sort((a: any, b: any) => $J.compareTo(a, b));
  }
  static invoke(task: any) {
    return typeof task === 'function' ? task() : task.call();
  }
  /** ShellFolderManager's values on Unix: the roots, the user's home as the default folder. */
  static get(key: string) {
    const fsv = FileSystemView.getFileSystemView();
    if (key === 'fileChooserComboBoxFolders' || key === 'roots') return fsv.getRoots();
    if (key === 'fileChooserDefaultFolder') return fsv.getHomeDirectory();
    return null;
  }
}
defineLib(ShellFolder, 'sun.awt.shell.ShellFolder');
// a File is its own shell folder: ShellFolder's questions about links have plain answers
Object.assign(File.prototype, {
  isLink() { return false; },
  getLinkLocation() { return null; },
  isFileSystem() { return true; },
});
