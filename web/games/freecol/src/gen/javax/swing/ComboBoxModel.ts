// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/ComboBoxModel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../jre/index.ts';

/**
 * A data model for a combo box. This interface extends <code>ListModel</code>
 * and adds the concept of a <i>selected item</i>. The selected item is generally
 * the item which is visible in the combo box display area.
 * <p>
 * The selected item may not necessarily be managed by the underlying
 * <code>ListModel</code>. This disjoint behavior allows for the temporary
 * storage and retrieval of a selected item in the model.
 *
 * @param <E> the type of the elements of this model
 *
 * @author Arnaud Weber
 * @since 1.2
 */
export class ComboBoxModel<E> {
}

$J.define(ComboBoxModel, 'javax.swing.ComboBoxModel', { kind: 'interface', ifaces: ['javax.swing.ListModel'] });
