// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/beans/beancontext/BeanContextChild.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
 * <p>
 * JavaBeans wishing to be nested within, and obtain a reference to their
 * execution environment, or context, as defined by the BeanContext
 * sub-interface shall implement this interface.
 * </p>
 * <p>
 * Conformant BeanContexts shall as a side effect of adding a BeanContextChild
 * object shall pass a reference to itself via the setBeanContext() method of
 * this interface.
 * </p>
 * <p>
 * Note that a BeanContextChild may refuse a change in state by throwing
 * PropertyVetoedException in response.
 * </p>
 * <p>
 * In order for persistence mechanisms to function properly on BeanContextChild
 * instances across a broad variety of scenarios, implementing classes of this
 * interface are required to define as transient, any or all fields, or
 * instance variables, that may contain, or represent, references to the
 * nesting BeanContext instance or other resources obtained
 * from the BeanContext via any unspecified mechanisms.
 * </p>
 *
 * @author      Laurence P. G. Cable
 * @since       1.2
 *
 * @see java.beans.beancontext.BeanContext
 * @see java.beans.PropertyChangeEvent
 * @see java.beans.PropertyChangeListener
 * @see java.beans.PropertyVetoException
 * @see java.beans.VetoableChangeListener
 */
export class BeanContextChild {
}

$J.define(BeanContextChild, 'java.beans.beancontext.BeanContextChild', { kind: 'interface' });
