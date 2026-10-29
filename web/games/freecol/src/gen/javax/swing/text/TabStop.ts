// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/text/TabStop.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2021, Oracle and/or its affiliates. All rights reserved.
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
 * This class encapsulates a single tab stop (basically as tab stops
 * are thought of by RTF). A tab stop is at a specified distance from the
 * left margin, aligns text in a specified way, and has a specified leader.
 * TabStops are immutable, and usually contained in TabSets.
 * <p>
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the <code>java.beans</code> package.
 * Please see {@link java.beans.XMLEncoder}.
 */
export class TabStop extends JObject {
  /**
   * Character following tab is positioned at location.
   */
  static readonly ALIGN_LEFT: number = 0;
  /**
   * Characters following tab are positioned such that all following
   * characters up to next tab/newline end at location.
   */
  static readonly ALIGN_RIGHT: number = 1;
  /**
   * Characters following tab are positioned such that all following
   * characters up to next tab/newline are centered around the tabs
   * location.
   */
  static readonly ALIGN_CENTER: number = 2;
  /**
   * Characters following tab are aligned such that next
   * decimal/tab/newline is at the tab location, very similar to
   * RIGHT_TAB, just includes decimal as additional character to look for.
   */
  static readonly ALIGN_DECIMAL: number = 4;
  /**
   * Align bar
   */
  static readonly ALIGN_BAR: number = 5;
  /**
   * Lead none
   */
  static readonly LEAD_NONE: number = 0;
  /**
   * Lead dots
   */
  static readonly LEAD_DOTS: number = 1;
  /**
   * Lead hyphens
   */
  static readonly LEAD_HYPHENS: number = 2;
  /**
   * Lead underline
   */
  static readonly LEAD_UNDERLINE: number = 3;
  /**
   * Lead thickline
   */
  static readonly LEAD_THICKLINE: number = 4;
  /**
   * Lead equals
   */
  static readonly LEAD_EQUALS: number = 5;
  /**
   * Tab type.
   */
  alignment: number = 0;
  /**
   * Location, from the left margin, that tab is at.
   */
  position: number = 0;
  leader: number = 0;
}

$J.define(TabStop, 'javax.swing.text.TabStop', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'float,int,int': '_TabStop$float$int$int', 'float': '_TabStop$float' } });
