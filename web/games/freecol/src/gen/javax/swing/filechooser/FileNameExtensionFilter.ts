// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/filechooser/FileNameExtensionFilter.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2006, Oracle and/or its affiliates. All rights reserved.
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
import { $J, Arrays, IllegalArgumentException, JString, Locale } from '../../../../jre/index.ts';
import { FileFilter } from './FileFilter.ts';

/**
 * An implementation of {@code FileFilter} that filters using a
 * specified set of extensions. The extension for a file is the
 * portion of the file name after the last ".". Files whose name does
 * not contain a "." have no file name extension. File name extension
 * comparisons are case insensitive.
 * <p>
 * The following example creates a
 * {@code FileNameExtensionFilter} that will show {@code jpg} files:
 * <pre>
 * FileFilter filter = new FileNameExtensionFilter("JPEG file", "jpg", "jpeg");
 * JFileChooser fileChooser = ...;
 * fileChooser.addChoosableFileFilter(filter);
 * </pre>
 *
 * @see FileFilter
 * @see javax.swing.JFileChooser#setFileFilter
 * @see javax.swing.JFileChooser#addChoosableFileFilter
 * @see javax.swing.JFileChooser#getFileFilter
 *
 * @since 1.6
 */
export class FileNameExtensionFilter extends FileFilter {
  description_: string = null;
  extensions: string[] = null;
  lowerCaseExtensions: string[] = null;
  /**
   * Creates a {@code FileNameExtensionFilter} with the specified
   * description and file name extensions. The returned {@code
   * FileNameExtensionFilter} will accept all directories and any
   * file with a file name extension contained in {@code extensions}.
   *
   * @param description textual description for the filter, may be
   *                    {@code null}
   * @param extensions the accepted file name extensions
   * @throws IllegalArgumentException if extensions is {@code null}, empty,
   *         contains {@code null}, or contains an empty string
   * @see #accept
   */
  _FileNameExtensionFilter(description: string, extensions: string[]): this {
    this._FileFilter();
    if (extensions == null || extensions.length === 0) {
      throw new IllegalArgumentException('Extensions must be non-null and not empty');
    }
    this.description_ = description;
    this.extensions = $J.newArray(extensions.length, null);
    this.lowerCaseExtensions = $J.newArray(extensions.length, null);
    for (let i = 0; i < extensions.length; i++) {
      if (extensions[i] == null || extensions[i].length === 0) {
        throw new IllegalArgumentException('Each extension must be non-null and not empty');
      }
      this.extensions[i] = extensions[i];
      this.lowerCaseExtensions[i] = extensions[i].toLowerCase();
    }
    return this;
  }
  /**
   * Tests the specified file, returning true if the file is
   * accepted, false otherwise. True is returned if the extension
   * matches one of the file name extensions of this {@code
   * FileFilter}, or the file is a directory.
   *
   * @param f the {@code File} to test
   * @return true if the file is to be accepted, false otherwise
   */
  accept(f: File): boolean {
    if (f != null) {
      if (f.isDirectory()) {
        return true;
      }
      let fileName = f.getName();
      let i = fileName.lastIndexOf(String.fromCharCode(46 /* '.' */));
      if (i > 0 && i < ((fileName.length - 1) | 0)) {
        let desiredExtension = fileName.substring((i + 1) | 0).toLowerCase();
        for (let extension of this.lowerCaseExtensions) {
          if ($J.equals(desiredExtension, extension)) {
            return true;
          }
        }
      }
    }
    return false;
  }
  /**
   * The description of this filter. For example: "JPG and GIF Images."
   *
   * @return the description of this filter
   */
  getDescription(): string {
    return this.description_;
  }
  /**
   * Returns the set of file name extensions files are tested against.
   *
   * @return the set of file name extensions files are tested against
   */
  getExtensions(): string[] {
    let result = $J.newArray(this.extensions.length, null);
    $J.system_arraycopy(this.extensions, 0, result, 0, this.extensions.length);
    return result;
  }
  /**
   * Returns a string representation of the {@code FileNameExtensionFilter}.
   * This method is intended to be used for debugging purposes,
   * and the content and format of the returned string may vary
   * between implementations.
   *
   * @return a string representation of this {@code FileNameExtensionFilter}
   */
  toString(): string {
    return super.toString() + '[description=' + this.getDescription() + ' extensions=' + $J.str(Arrays.asList(...this.getExtensions())) + ']';
  }
}

$J.define(FileNameExtensionFilter, 'javax.swing.filechooser.FileNameExtensionFilter', { kind: 'class', sup: 'javax.swing.filechooser.FileFilter', ctors: { 'java.lang.String,java.lang.String[]': '_FileNameExtensionFilter' } });
