// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/event/DocumentEvent.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../jre/index.ts';

/**
 * Interface for document change notifications.  This provides
 * detailed information to Document observers about how the
 * Document changed.  It provides high level information such
 * as type of change and where it occurred, as well as the more
 * detailed structural changes (What Elements were inserted and
 * removed).
 *
 * @author  Timothy Prinzing
 * @see javax.swing.text.Document
 * @see DocumentListener
 */
export class DocumentEvent {
}

/**
 * Enumeration for document event types
 */
export class DocumentEvent$EventType extends JObject {
  /**
   * Insert type.
   */
  static INSERT: DocumentEvent$EventType = null;
  /**
   * Remove type.
   */
  static REMOVE: DocumentEvent$EventType = null;
  /**
   * Change type.
   */
  static CHANGE: DocumentEvent$EventType = null;
  typeString: string = null;
  _DocumentEvent$EventType(s: string): this {
    this.typeString = s;
    return this;
  }
  /**
   * Converts the type to a string.
   *
   * @return the string
   */
  toString(): string {
    return this.typeString;
  }
  static $clinit() {
    DocumentEvent$EventType.INSERT = new DocumentEvent$EventType()._DocumentEvent$EventType('INSERT');
    DocumentEvent$EventType.REMOVE = new DocumentEvent$EventType()._DocumentEvent$EventType('REMOVE');
    DocumentEvent$EventType.CHANGE = new DocumentEvent$EventType()._DocumentEvent$EventType('CHANGE');
  }
}

/**
 * Describes changes made to a specific element.
 */
export class DocumentEvent$ElementChange {
}

$J.define(DocumentEvent, 'javax.swing.event.DocumentEvent', { kind: 'interface' });
$J.define(DocumentEvent$EventType, 'javax.swing.event.DocumentEvent$EventType', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.lang.String': '_DocumentEvent$EventType' }, clinit: true, lazy: ['INSERT', 'REMOVE', 'CHANGE'] });
$J.define(DocumentEvent$ElementChange, 'javax.swing.event.DocumentEvent$ElementChange', { kind: 'interface' });
