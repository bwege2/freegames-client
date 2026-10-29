// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/beans/DesignMode.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2011, Oracle and/or its affiliates. All rights reserved.
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
 * <p>
 * This interface is intended to be implemented by, or delegated from, instances
 * of java.beans.beancontext.BeanContext, in order to propagate to its nested hierarchy
 * of java.beans.beancontext.BeanContextChild instances, the current "designTime" property.
 * <p>
 * The JavaBeans specification defines the notion of design time as is a
 * mode in which JavaBeans instances should function during their composition
 * and customization in a interactive design, composition or construction tool,
 * as opposed to runtime when the JavaBean is part of an applet, application,
 * or other live Java executable abstraction.
 *
 * @author Laurence P. G. Cable
 * @since 1.2
 *
 * @see java.beans.beancontext.BeanContext
 * @see java.beans.beancontext.BeanContextChild
 * @see java.beans.beancontext.BeanContextMembershipListener
 * @see java.beans.PropertyChangeEvent
 */
export class DesignMode {
  /**
   * The standard value of the propertyName as fired from a BeanContext or
   * other source of PropertyChangeEvents.
   */
  static readonly PROPERTYNAME: string = 'designTime';
}

$J.define(DesignMode, 'java.beans.DesignMode', { kind: 'interface' });
