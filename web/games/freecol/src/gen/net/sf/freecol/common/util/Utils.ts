// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/util/Utils.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/**
 *  Copyright (C) 2002-2022   The FreeCol Team
 *
 *  This file is part of FreeCol.
 *
 *  FreeCol is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  FreeCol is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with FreeCol.  If not, see <http://www.gnu.org/licenses/>.
 */
import { $J, Arrays, ByteArrayInputStream, ByteArrayOutputStream, CharBuffer, ClassNotFoundException, File, Files, IOException, InputStreamReader, InterruptedException, JObject, JString, Level, Logger, ObjectInputStream, ObjectOutputStream, OutputStreamWriter, SecurityException, StandardCharsets, StandardOpenOption, StringBuilder, Thread, TimeUnit, Toolkit, TransformerException, TransformerFactory } from '../../../../../../jre/index.ts';

let GraphicsEnvironment, HeadlessException, MouseInfo;

/**
 * Collection of small static helper methods.
 */
export class Utils extends JObject {
  static logger: Logger = null;
  /**
   * Hex constant digits for get/restoreRandomState.
   */
  static readonly HEX_DIGITS: string = '0123456789ABCDEF';
  _Utils(): this {
    return this;
  }
  /**
   * Check if two objects are equal but also checks for null.
   *
   * @param <T> The object type.
   * @param one First object to compare
   * @param two Second object to compare
   * @return True if the arguments are either both null or equal in the
   *     sense of their equals() method.
   */
  static equals<T>(one: T, two: T): boolean {
    return (one == null) ? (two == null) : $J.equals(one, two);
  }
  /**
   * Get a hash code for an object, even null.
   *
   * @param object The {@code Object} to use.
   * @return A hash code.
   */
  static hashCode(object$: any): number {
    return (object$ == null) ? 31 : $J.hashCode(object$);
  }
  /**
   * Get the internal state of a random number generator as a
   * string.  It would have been more convenient to simply return
   * the current seed, but unfortunately it is private.
   *
   * @param random A pseudo-random number source.
   * @return A {@code String} encapsulating the object state.
   * @exception IOException is the byte stream output breaks.
   */
  static getRandomState(random: Random): string {
    let bos = new ByteArrayOutputStream();
    {
      const oos = new ObjectOutputStream(bos);
      try {
        oos.writeObject(random);
        oos.flush();
      } finally {
        if (oos != null) oos.close();
      }
    }
    let bytes = bos.toByteArray();
    let sb = new StringBuilder(Math.imul(bytes.length, 2));
    for (let b of bytes) {
      sb.append(String.fromCharCode(Utils.HEX_DIGITS.charCodeAt((b >> 4) & 15)));
      sb.append(String.fromCharCode(Utils.HEX_DIGITS.charCodeAt(b & 15)));
    }
    return sb.toString();
  }
  /**
   * Restore a previously saved state.
   *
   * @param state The saved state (@see #getRandomState()).
   * @return The restored {@code Random}.
   */
  static restoreRandomState(state: string): Random {
    if (state == null || (state.length === 0)) {
      return null;
    }
    let bytes = $J.newArray($J.idiv(state.length, 2), 0);
    let pos = 0;
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = ((Utils.HEX_DIGITS.indexOf(String.fromCharCode(state.charCodeAt(pos++)))) << 24) >> 24;
      bytes[i] = ((bytes[i] << 4) << 24) >> 24;
      bytes[i] = ((bytes[i] | ((Utils.HEX_DIGITS.indexOf(String.fromCharCode(state.charCodeAt(pos++)))) << 24) >> 24) << 24) >> 24;
    }
    let bis = new ByteArrayInputStream(bytes);
    try {
      let ois = new ObjectInputStream(bis);
      return ois.readObject();
    } catch ($e0) {
      if ($J.isa($e0, IOException) || $J.isa($e0, ClassNotFoundException)) {
        let e = $J.exc($e0);
        Utils.logger.log(Level.WARNING, 'Unable to restore random state.', e);
      } else {
        throw $e0;
      }
    }
    return null;
  }
  /**
   * Create a new file reader that uses UTF-8.
   *
   * @param file A {@code File} to read from.
   * @return A {@code Reader} for this file.
   */
  static getFileUTF8Reader(file: File): Reader {
    try {
      let fis = Files.newInputStream(file.toPath());
      return new InputStreamReader(fis, StandardCharsets.UTF_8);
    } catch ($e1) {
      if ($J.isa($e1, IOException)) {
        let ioe = $J.exc($e1);
        Utils.logger.log(Level.WARNING, 'No input stream for ' + file.getPath(), ioe);
      } else {
        throw $e1;
      }
    }
    return null;
  }
  /**
   * Get the UTF-8 encoded contents of a file.
   *
   * @param file The {@code File} to query.
   * @return The contents string, or null on error.
   */
  static getUTF8Contents(file: File): string {
    let ret = null;
    let reader = Utils.getFileUTF8Reader(file);
    if (reader != null) {
      let cb = CharBuffer.allocate((file.length()) | 0);
      try {
        reader.read(cb);
      } catch ($e2) {
        if ($J.isa($e2, IOException)) {
          let ioe = $J.exc($e2);
          Utils.logger.log(Level.WARNING, 'Read failed for ' + file.getPath(), ioe);
        } else {
          throw $e2;
        }
      }
      cb.flip();
      ret = cb.toString();
      try {
        reader.close();
      } catch ($e3) {
        if ($J.isa($e3, IOException)) {
          let ioe = $J.exc($e3);
          Utils.logger.log(Level.WARNING, 'Failed to close', ioe);
        } else {
          throw $e3;
        }
      }
    }
    return ret;
  }
  /**
   * Create a new file writer that uses UTF-8.
   *
   * @param os An {@code OutputStream} to write to.
   * @return A {@code Writer} for this file.
   */
  static getUTF8Writer(os: OutputStream): Writer {
    return new OutputStreamWriter(os, StandardCharsets.UTF_8);
  }
  /**
   * Create a new file writer that uses UTF-8.
   *
   * @param file A {@code File} to write to.
   * @param append If true, append to the file.
   * @return A {@code Writer} for this file.
   */
  static getF8W(file: File, append: boolean): Writer {
    try {
      let fos = (append) ? Files.newOutputStream(file.toPath(), StandardOpenOption.CREATE, StandardOpenOption.APPEND) : Files.newOutputStream(file.toPath());
      return Utils.getUTF8Writer(fos);
    } catch ($e4) {
      if ($J.isa($e4, IOException)) {
        let ioe = $J.exc($e4);
        Utils.logger.log(Level.WARNING, 'No output stream for ' + file.getName(), ioe);
      } else {
        throw $e4;
      }
    }
    return null;
  }
  /**
   * Create a new file writer that uses UTF-8.
   *
   * @param file A {@code File} to write to.
   * @return A {@code Writer} for this file.
   */
  static getFileUTF8Writer(file: File): Writer {
    return Utils.getF8W(file, false);
  }
  /**
   * Create a new appending file writer that uses UTF-8.
   *
   * @param file A {@code File} to append to.
   * @return A {@code Writer} for this file.
   */
  static getFileUTF8AppendWriter(file: File): Writer {
    return Utils.getF8W(file, true);
  }
  /**
   * Helper to make an XML Transformer.
   *
   * @param declaration If true, include the XML declaration.
   * @param indent If true, set up the transformer to indent.
   * @return A suitable {@code Transformer}.
   */
  static makeTransformer(declaration: boolean, indent: boolean): Transformer {
    let tf = null;
    try {
      let factory = TransformerFactory.newInstance();
      factory.setAttribute('http://javax.xml.XMLConstants/property/accessExternalDTD', '');
      factory.setAttribute('http://javax.xml.XMLConstants/property/accessExternalStylesheet', '');
      factory.setAttribute('indent-number', 2);
      tf = factory.newTransformer();
      tf.setOutputProperty('encoding', 'UTF-8');
      tf.setOutputProperty('method', 'xml');
      if (!declaration) {
        tf.setOutputProperty('omit-xml-declaration', 'yes');
      }
      if (indent) {
        tf.setOutputProperty('indent', 'yes');
        tf.setOutputProperty('{http://xml.apache.org/xslt}indent-amount', '2');
      }
    } catch ($e5) {
      if ($J.isa($e5, TransformerException)) {
        let e = $J.exc($e5);
        Utils.logger.log(Level.WARNING, 'Failed to install transformer!', e);
      } else {
        throw $e5;
      }
    }
    return tf;
  }
  /**
   * Delete a file.
   *
   * @param file The {@code File} to delete.
   */
  static deleteFile(file: File): void {
    try {
      if (!file.delete()) {
        Utils.logger.warning('Failed to delete: ' + file.getPath());
      }
    } catch ($e6) {
      if ($J.isa($e6, SecurityException)) {
        let ex = $J.exc($e6);
        Utils.logger.log(Level.WARNING, 'Exception deleting: ' + file.getPath(), ex);
      } else {
        throw $e6;
      }
    }
  }
  /**
   * Delete a list of files.
   *
   * @param files The list of {@code File}s to delete.
   */
  static deleteFiles(files: List<File>): void {
    for (const $it7 = files.iterator(); $it7.hasNext(); ) {
      let f = $it7.next();
      Utils.deleteFile(f);
    }
  }
  /**
   * Does a readable file have a matching suffix?
   *
   * @param file The {@code File} to check.
   * @param suffixes Suffixes to test.
   * @return True if any suffix matches.
   */
  static fileAnySuffix(file: File, suffixes: string[]): boolean {
    if (file == null || !file.isFile() || !file.canRead()) {
      return false;
    }
    let name = file.getName();
    for (let s of suffixes) {
      if (name.endsWith(s)) {
        return true;
      }
    }
    return false;
  }
  /**
   * Does a directory contain the given file/s?
   *
   * @param dir The directory {@code File} to check.
   * @param names The name of the files to find therein.
   * @return True if the file is present and readable.
   */
  static directoryAllPresent(dir: File, names: string[]): boolean {
    if (dir == null || !dir.isDirectory() || !dir.canRead()) {
      return false;
    }
    for (let n of names) {
      if (!new File(dir, n).canRead()) {
        return false;
      }
    }
    return true;
  }
  /**
   * Delay by a number of milliseconds.
   *
   * @param ms The number of milliseconds to delay.
   * @param warning If non-null, log this warning message on interrupt,
   *     otherwise propagate the interrupt.
   */
  static delay(ms: number, warning: string): void {
    try {
      TimeUnit.MILLISECONDS.sleep(ms);
    } catch ($e8) {
      if ($J.isa($e8, InterruptedException)) {
        let ie = $J.exc($e8);
        if (warning == null) {
          Thread.currentThread().interrupt();
        } else {
          Utils.logger.log(Level.WARNING, warning, ie);
        }
      } else {
        throw $e8;
      }
    }
  }
  /**
   * Current time since epoch in milliseconds.
   *
   * @return Time since epoch.
   */
  static now(): number {
    return $J.system_currentTimeMillis();
  }
  /**
   * Run the garbage collector.
   *
   * Route all gc calls here, so we can disable the findbugs warning.
   */
  static garbageCollect(): void {
    $J.system_gc();
  }
  /**
   * Are we in headless mode?
   *
   * @return True if in headless mode.
   */
  static isHeadless(): boolean {
    return $J.equals('true', $J.system_getProperty('java.awt.headless', 'false'));
  }
  /**
   * Get a good screen device for starting FreeCol.
   *
   * @return A screen device, or null if none available
   *     (as in headless mode).
   */
  static getGoodGraphicsDevice(): GraphicsDevice {
    try {
      return MouseInfo.getPointerInfo().getDevice();
    } catch ($e9) {
      if ($J.isa($e9, HeadlessException)) {
        let he = $J.exc($e9);
      } else {
        throw $e9;
      }
    }
    try {
      let lge = GraphicsEnvironment.getLocalGraphicsEnvironment();
      return lge.getDefaultScreenDevice();
    } catch ($e10) {
      if ($J.isa($e10, HeadlessException)) {
        let he = $J.exc($e10);
      } else {
        throw $e10;
      }
    }
    return null;
  }
  /**
   * Tries to determine the DPI of the given {@code GraphicsDevice}.
   *
   * @param gd The {@code GraphicsDevice} to determine the DPI for.
   * @return The calculated DPI.
   */
  static determineDpi(gd: GraphicsDevice): number {
    let candidateDpi = Toolkit.getDefaultToolkit().getScreenResolution();
    let displayModes = gd.getDisplayModes();
    if (displayModes.length <= 1) {
      return candidateDpi;
    }
    let highestScreenSize = Arrays.stream(displayModes).map((dm) => dm.getHeight()).max(($p0, $p1) => $J.icmp($p0, $p1)).get();
    let currentScreenSize = gd.getDisplayMode().getHeight();
    let actualDpi = $J.idiv((Math.imul(candidateDpi, currentScreenSize)), highestScreenSize);
    return actualDpi;
  }
  static $clinit() {
    Utils.logger = Logger.getLogger($J.cls(Utils).getName());
  }
}

$J.define(Utils, 'net.sf.freecol.common.util.Utils', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Utils' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  GraphicsEnvironment = $J.load('java.awt.GraphicsEnvironment');
  HeadlessException = $J.load('java.awt.HeadlessException');
  MouseInfo = $J.load('java.awt.MouseInfo');
});
