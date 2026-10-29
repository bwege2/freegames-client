// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/text/DocumentFilter.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2000, 2013, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject } from '../../../../jre/index.ts';

/**
 * <code>DocumentFilter</code>, as the name implies, is a filter for the
 * <code>Document</code> mutation methods. When a <code>Document</code>
 * containing a <code>DocumentFilter</code> is modified (either through
 * <code>insert</code> or <code>remove</code>), it forwards the appropriate
 * method invocation to the <code>DocumentFilter</code>. The
 * default implementation allows the modification to
 * occur. Subclasses can filter the modifications by conditionally invoking
 * methods on the superclass, or invoking the necessary methods on
 * the passed in <code>FilterBypass</code>. Subclasses should NOT call back
 * into the Document for the modification
 * instead call into the superclass or the <code>FilterBypass</code>.
 * <p>
 * When <code>remove</code> or <code>insertString</code> is invoked
 * on the <code>DocumentFilter</code>, the <code>DocumentFilter</code>
 * may callback into the
 * <code>FilterBypass</code> multiple times, or for different regions, but
 * it should not callback into the <code>FilterBypass</code> after returning
 * from the <code>remove</code> or <code>insertString</code> method.
 * <p>
 * By default, text related document mutation methods such as
 * <code>insertString</code>, <code>replace</code> and <code>remove</code>
 * in <code>AbstractDocument</code> use <code>DocumentFilter</code> when
 * available, and <code>Element</code> related mutation methods such as
 * <code>create</code>, <code>insert</code> and <code>removeElement</code> in
 * <code>DefaultStyledDocument</code> do not use <code>DocumentFilter</code>.
 * If a method doesn't follow these defaults, this must be explicitly stated
 * in the method documentation.
 *
 * @see javax.swing.text.Document
 * @see javax.swing.text.AbstractDocument
 * @see javax.swing.text.DefaultStyledDocument
 *
 * @since 1.4
 */
export class DocumentFilter extends JObject {
  /**
   * Constructs a {@code DocumentFilter}.
   */
  _DocumentFilter(): this {
    return this;
  }
  /**
   * Invoked prior to removal of the specified region in the
   * specified Document. Subclasses that want to conditionally allow
   * removal should override this and only call supers implementation as
   * necessary, or call directly into the <code>FilterBypass</code> as
   * necessary.
   *
   * @param fb FilterBypass that can be used to mutate Document
   * @param offset the offset from the beginning &gt;= 0
   * @param length the number of characters to remove &gt;= 0
   * @throws BadLocationException  some portion of the removal range
   *   was not a valid part of the document.  The location in the exception
   *   is the first bad position encountered.
   */
  remove(fb: DocumentFilter$FilterBypass, offset: number, length: number): void {
    fb.remove(offset, length);
  }
  /**
   * Invoked prior to replacing a region of text in the
   * specified Document. Subclasses that want to conditionally allow
   * replace should override this and only call supers implementation as
   * necessary, or call directly into the FilterBypass.
   *
   * @param fb FilterBypass that can be used to mutate Document
   * @param offset Location in Document
   * @param length Length of text to delete
   * @param text Text to insert, null indicates no text to insert
   * @param attrs AttributeSet indicating attributes of inserted text,
   *              null is legal.
   * @throws BadLocationException  the given insert position is not a
   *   valid position within the document
   */
  replace(fb: DocumentFilter$FilterBypass, offset: number, length: number, text: string, attrs: AttributeSet): void {
    fb.replace(offset, length, text, attrs);
  }
}

/**
 * Used as a way to circumvent calling back into the Document to
 * change it. Document implementations that wish to support
 * a DocumentFilter must provide an implementation that will
 * not callback into the DocumentFilter when the following methods
 * are invoked from the DocumentFilter.
 * @since 1.4
 */
export class DocumentFilter$FilterBypass extends JObject {
  /**
   * Constructor for subclasses to call.
   */
  _DocumentFilter$FilterBypass(): this {
    return this;
  }
}

$J.define(DocumentFilter, 'javax.swing.text.DocumentFilter', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_DocumentFilter' } });
$J.define(DocumentFilter$FilterBypass, 'javax.swing.text.DocumentFilter$FilterBypass', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_DocumentFilter$FilterBypass' } });
