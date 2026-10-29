// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/text/Caret.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2013, Oracle and/or its affiliates. All rights reserved.
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

/**
 * A place within a document view that represents where
 * things can be inserted into the document model.  A caret
 * has a position in the document referred to as a dot.
 * The dot is where the caret is currently located in the
 * model.  There is
 * a second position maintained by the caret that represents
 * the other end of a selection called mark.  If there is
 * no selection the dot and mark will be equal.  If a selection
 * exists, the two values will be different.
 * <p>
 * The dot can be placed by either calling
 * <code>setDot</code> or <code>moveDot</code>.  Setting
 * the dot has the effect of removing any selection that may
 * have previously existed.  The dot and mark will be equal.
 * Moving the dot has the effect of creating a selection as
 * the mark is left at whatever position it previously had.
 *
 * @author  Timothy Prinzing
 */
export class Caret {
}

$J.define(Caret, 'javax.swing.text.Caret', { kind: 'interface', meths: { 'moveDot(int)': 'moveDot$int', 'setDot(int)': 'setDot$int' } });
