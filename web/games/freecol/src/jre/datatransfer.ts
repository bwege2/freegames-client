// @ts-nocheck
// java.awt.datatransfer as Swing's drag and drop and text components use it: flavours, a clipboard inside
// the game (the page's clipboard is not reached synchronously), string selections.
import { $J, JObject, defineLib, exc, str, Exception, NullPointerException } from './lang.ts';
import { StringReader } from './io.ts';

export const UnsupportedFlavorException = exc('UnsupportedFlavorException', Exception, 'java.awt.datatransfer.UnsupportedFlavorException');

export class DataFlavor extends JObject {
  static javaJVMLocalObjectMimeType = 'application/x-java-jvm-local-objectref';
  static javaSerializedObjectMimeType = 'application/x-java-serialized-object';
  static javaRemoteObjectMimeType = 'application/x-java-remote-object';
  static stringFlavor: DataFlavor;
  static javaFileListFlavor: DataFlavor;
  static plainTextFlavor: DataFlavor;
  static imageFlavor: DataFlavor;
  mime: string;
  name: string;
  cls: any;
  constructor(a?: any, b?: string, _c?: any) {
    super();
    if (a === undefined) return;
    if (typeof a === 'string') {
      this.mime = a;
      const m = /class=([\w.$]+)/.exec(a);
      this.cls = m ? m[1] : 'java.io.InputStream';
    } else {
      this.cls = a.getName ? a.getName() : str(a);
      this.mime = DataFlavor.javaSerializedObjectMimeType + ';class=' + this.cls;
    }
    this.name = b ?? this.mime;
  }
  _DataFlavor(a?: any, b?: string, c?: any) {
    Object.assign(this, new DataFlavor(a, b, c));
    return this;
  }
  getMimeType() {
    return this.mime;
  }
  getPrimaryType() {
    return this.mime.split('/')[0];
  }
  getSubType() {
    return (this.mime.split('/')[1] ?? '').split(';')[0];
  }
  getHumanPresentableName() {
    return this.name;
  }
  getRepresentationClass() {
    try {
      return $J.load('java.lang.Class').forName(this.cls);
    } catch {
      return null;
    }
  }
  getParameter(p: string) {
    const m = new RegExp(p + '=([^;]+)').exec(this.mime);
    return m ? m[1] : null;
  }
  isFlavorTextType() {
    return this.getPrimaryType() === 'text' || this === DataFlavor.stringFlavor;
  }
  isFlavorJavaFileListType() {
    return this === DataFlavor.javaFileListFlavor;
  }
  isMimeTypeEqual(o: any) {
    const m = typeof o === 'string' ? o : o.getMimeType();
    return this.mime.split(';')[0] === m.split(';')[0];
  }
  getReaderForText(t: any) {
    return new StringReader(str(t.getTransferData(this)));
  }
  equals(o: any) {
    return o instanceof DataFlavor && o.mime === this.mime && o.cls === this.cls;
  }
  hashCode() {
    return $J.hashCode(this.mime);
  }
  toString() {
    return 'java.awt.datatransfer.DataFlavor[mimetype=' + this.mime.split(';')[0] + ';representationclass=' + this.cls + ']';
  }
}
DataFlavor.stringFlavor = new DataFlavor('application/x-java-serialized-object;class=java.lang.String', 'Unicode String');
DataFlavor.javaFileListFlavor = new DataFlavor('application/x-java-file-list;class=java.util.List', null);
DataFlavor.plainTextFlavor = new DataFlavor('text/plain; charset=unicode; class=java.io.InputStream', 'Plain Text');
DataFlavor.imageFlavor = new DataFlavor('image/x-java-image; class=java.awt.Image', 'Image');
defineLib(DataFlavor, 'java.awt.datatransfer.DataFlavor');

export class StringSelection extends JObject {
  s: string;
  constructor(s?: string) {
    super();
    this.s = s;
  }
  getTransferDataFlavors() {
    return [DataFlavor.stringFlavor, DataFlavor.plainTextFlavor];
  }
  isDataFlavorSupported(f: any) {
    return f.equals(DataFlavor.stringFlavor) || f.equals(DataFlavor.plainTextFlavor);
  }
  getTransferData(f: any) {
    if (f.equals(DataFlavor.stringFlavor)) return this.s;
    if (f.equals(DataFlavor.plainTextFlavor)) return new StringReader(this.s ?? '');
    throw new UnsupportedFlavorException(f);
  }
  lostOwnership(_c: any, _t: any) {}
}
defineLib(StringSelection, 'java.awt.datatransfer.StringSelection', { ifaces: ['java.awt.datatransfer.Transferable', 'java.awt.datatransfer.ClipboardOwner'] });

export class Clipboard extends JObject {
  name: string;
  contents: any = null;
  owner: any = null;
  constructor(name = 'System') {
    super();
    this.name = name;
  }
  getName() {
    return this.name;
  }
  getContents(_requestor: any) {
    return this.contents;
  }
  setContents(t: any, owner: any) {
    if (t == null) throw new NullPointerException();
    const old = this.owner, oldT = this.contents;
    this.contents = t;
    this.owner = owner;
    if (old != null && old !== owner) old.lostOwnership(this, oldT);
  }
  isDataFlavorAvailable(f: any) {
    return this.contents != null && this.contents.isDataFlavorSupported(f);
  }
  getData(f: any) {
    if (!this.contents) throw new UnsupportedFlavorException(f);
    return this.contents.getTransferData(f);
  }
  getAvailableDataFlavors() {
    return this.contents ? this.contents.getTransferDataFlavors() : [];
  }
}
defineLib(Clipboard, 'java.awt.datatransfer.Clipboard');

export const SystemFlavorMap: any = {
  getDefaultFlavorMap: () => ({ getFlavorsForNative: () => [], getNativesForFlavor: () => [], getFlavorsForNatives: () => new ($J.load('java.util.HashMap'))(), getNativesForFlavors: () => new ($J.load('java.util.HashMap'))() }),
};
defineLib(SystemFlavorMap, 'java.awt.datatransfer.SystemFlavorMap');
export const DataFlavorUtil: any = { getTextCharset: (_f: any) => 'UTF-16' };
defineLib(DataFlavorUtil, 'sun.datatransfer.DataFlavorUtil');
