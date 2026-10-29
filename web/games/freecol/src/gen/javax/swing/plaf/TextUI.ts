// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/TextUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../../jre/index.ts';
import { ComponentUI } from './ComponentUI.ts';

/**
 * Text editor user interface
 *
 * @author  Timothy Prinzing
 */
export class TextUI extends ComponentUI {
  /**
   * Constructor for subclasses to call.
   */
  _TextUI(): this {
    this._ComponentUI();
    return this;
  }
}

$J.define(TextUI, 'javax.swing.plaf.TextUI', { kind: 'class', sup: 'javax.swing.plaf.ComponentUI', ctors: { '': '_TextUI' }, meths: { 'damageRange(javax.swing.text.JTextComponent,int,int,javax.swing.text.Position$Bias,javax.swing.text.Position$Bias)': 'damageRange$JTextComponent$int$int$Bias$Bias', 'damageRange(javax.swing.text.JTextComponent,int,int)': 'damageRange$JTextComponent$int$int', 'viewToModel(javax.swing.text.JTextComponent,java.awt.Point,javax.swing.text.Position.Bias[])': 'viewToModel$JTextComponent$Point$BiasArr', 'viewToModel(javax.swing.text.JTextComponent,java.awt.Point)': 'viewToModel$JTextComponent$Point', 'modelToView(javax.swing.text.JTextComponent,int,javax.swing.text.Position$Bias)': 'modelToView$JTextComponent$int$Bias', 'modelToView(javax.swing.text.JTextComponent,int)': 'modelToView$JTextComponent$int' } });
