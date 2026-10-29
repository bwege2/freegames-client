// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicCheckBoxMenuItemUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2018, Oracle and/or its affiliates. All rights reserved.
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
import { $J } from '../../../../../jre/index.ts';
import { BasicMenuItemUI } from './BasicMenuItemUI.ts';

/**
 * BasicCheckboxMenuItem implementation
 *
 * @author Georges Saab
 * @author David Karlton
 * @author Arnaud Weber
 */
export class BasicCheckBoxMenuItemUI extends BasicMenuItemUI {
  /**
   * Constructs a {@code BasicCheckBoxMenuItemUI}.
   */
  _BasicCheckBoxMenuItemUI(): this {
    this._BasicMenuItemUI();
    return this;
  }
  /**
   * Constructs a new instance of {@code BasicCheckBoxMenuItemUI}.
   *
   * @param c a component
   * @return a new instance of {@code BasicCheckBoxMenuItemUI}
   */
  static createUI(c: JComponent): ComponentUI {
    return new BasicCheckBoxMenuItemUI()._BasicCheckBoxMenuItemUI();
  }
  getPropertyPrefix(): string {
    return 'CheckBoxMenuItem';
  }
}

$J.define(BasicCheckBoxMenuItemUI, 'javax.swing.plaf.basic.BasicCheckBoxMenuItemUI', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicMenuItemUI', ctors: { '': '_BasicCheckBoxMenuItemUI' } });
