// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/event/HyperlinkEvent.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2014, Oracle and/or its affiliates. All rights reserved.
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
import { $J, EventObject, JObject } from '../../../../jre/index.ts';

/**
 * HyperlinkEvent is used to notify interested parties that
 * something has happened with respect to a hypertext link.
 * <p>
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the <code>java.beans</code> package.
 * Please see {@link java.beans.XMLEncoder}.
 *
 * @author  Timothy Prinzing
 */
export class HyperlinkEvent extends EventObject {
  type: HyperlinkEvent$EventType = null;
  u: URL = null;
  desc: string = null;
  sourceElement: Element = null;
  inputEvent: InputEvent = null;
}

/**
 * Defines the ENTERED, EXITED, and ACTIVATED event types, along
 * with their string representations, returned by toString().
 */
export class HyperlinkEvent$EventType extends JObject {
  /**
   * Entered type.
   */
  static ENTERED: HyperlinkEvent$EventType = null;
  /**
   * Exited type.
   */
  static EXITED: HyperlinkEvent$EventType = null;
  /**
   * Activated type.
   */
  static ACTIVATED: HyperlinkEvent$EventType = null;
  typeString: string = null;
  _HyperlinkEvent$EventType(s: string): this {
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
    HyperlinkEvent$EventType.ENTERED = new HyperlinkEvent$EventType()._HyperlinkEvent$EventType('ENTERED');
    HyperlinkEvent$EventType.EXITED = new HyperlinkEvent$EventType()._HyperlinkEvent$EventType('EXITED');
    HyperlinkEvent$EventType.ACTIVATED = new HyperlinkEvent$EventType()._HyperlinkEvent$EventType('ACTIVATED');
  }
}

$J.define(HyperlinkEvent, 'javax.swing.event.HyperlinkEvent', { kind: 'class', sup: 'java.util.EventObject', ctors: { 'java.lang.Object,javax.swing.event.HyperlinkEvent$EventType,java.net.URL,java.lang.String,javax.swing.text.Element,java.awt.event.InputEvent': '_HyperlinkEvent$Object$EventType$URL$String$Element$InputEvent', 'java.lang.Object,javax.swing.event.HyperlinkEvent$EventType,java.net.URL,java.lang.String,javax.swing.text.Element': '_HyperlinkEvent$Object$EventType$URL$String$Element', 'java.lang.Object,javax.swing.event.HyperlinkEvent$EventType,java.net.URL,java.lang.String': '_HyperlinkEvent$Object$EventType$URL$String', 'java.lang.Object,javax.swing.event.HyperlinkEvent$EventType,java.net.URL': '_HyperlinkEvent$Object$EventType$URL' } });
$J.define(HyperlinkEvent$EventType, 'javax.swing.event.HyperlinkEvent$EventType', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.lang.String': '_HyperlinkEvent$EventType' }, clinit: true, lazy: ['ENTERED', 'EXITED', 'ACTIVATED'] });
