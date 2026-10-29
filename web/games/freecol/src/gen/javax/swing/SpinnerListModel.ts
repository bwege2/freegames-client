// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/SpinnerListModel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2000, 2014, Oracle and/or its affiliates. All rights reserved.
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
import { AbstractSpinnerModel } from './AbstractSpinnerModel.ts';

/**
 * A simple implementation of <code>SpinnerModel</code> whose
 * values are defined by an array or a <code>List</code>.
 * For example to create a model defined by
 * an array of the names of the days of the week:
 * <pre>
 * String[] days = new DateFormatSymbols().getWeekdays();
 * SpinnerModel model = new SpinnerListModel(Arrays.asList(days).subList(1, 8));
 * </pre>
 * This class only stores a reference to the array or <code>List</code>
 * so if an element of the underlying sequence changes, it's up
 * to the application to notify the <code>ChangeListeners</code> by calling
 * <code>fireStateChanged</code>.
 * <p>
 * This model inherits a <code>ChangeListener</code>.
 * The <code>ChangeListener</code>s are notified whenever the
 * model's <code>value</code> or <code>list</code> properties changes.
 *
 * @see JSpinner
 * @see SpinnerModel
 * @see AbstractSpinnerModel
 * @see SpinnerNumberModel
 * @see SpinnerDateModel
 *
 * @author Hans Muller
 * @since 1.4
 */
export class SpinnerListModel extends AbstractSpinnerModel {
  list: List<any> = null;
  index_: number = 0;
}

$J.define(SpinnerListModel, 'javax.swing.SpinnerListModel', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'javax.swing.AbstractSpinnerModel', ctors: { '': '_SpinnerListModel$', 'java.lang.Object[]': '_SpinnerListModel$ObjectArr', 'java.util.List': '_SpinnerListModel$List' } });
