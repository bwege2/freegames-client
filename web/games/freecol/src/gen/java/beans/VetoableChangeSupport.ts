// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/beans/VetoableChangeSupport.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1996, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject } from '../../../jre/index.ts';

/**
 * This is a utility class that can be used by beans that support constrained
 * properties.  It manages a list of listeners and dispatches
 * {@link PropertyChangeEvent}s to them.  You can use an instance of this class
 * as a member field of your bean and delegate these types of work to it.
 * The {@link VetoableChangeListener} can be registered for all properties
 * or for a property specified by name.
 * <p>
 * Here is an example of {@code VetoableChangeSupport} usage that follows
 * the rules and recommendations laid out in the JavaBeans specification:
 * <pre>{@code
 * public class MyBean {
 *     private final VetoableChangeSupport vcs = new VetoableChangeSupport(this);
 *
 *     public void addVetoableChangeListener(VetoableChangeListener listener) {
 *         this.vcs.addVetoableChangeListener(listener);
 *     }
 *
 *     public void removeVetoableChangeListener(VetoableChangeListener listener) {
 *         this.vcs.removeVetoableChangeListener(listener);
 *     }
 *
 *     private String value;
 *
 *     public String getValue() {
 *         return this.value;
 *     }
 *
 *     public void setValue(String newValue) throws PropertyVetoException {
 *         String oldValue = this.value;
 *         this.vcs.fireVetoableChange("value", oldValue, newValue);
 *         this.value = newValue;
 *     }
 *
 *     [...]
 * }
 * }</pre>
 * <p>
 * A {@code VetoableChangeSupport} instance is thread-safe.
 * <p>
 * This class is serializable.  When it is serialized it will save
 * (and restore) any listeners that are themselves serializable.  Any
 * non-serializable listeners will be skipped during serialization.
 *
 * @see PropertyChangeSupport
 * @since 1.1
 */
export class VetoableChangeSupport extends JObject {
  map_: VetoableChangeSupport$VetoableChangeListenerMap = null;
  /**
   * The object to be provided as the "source" for any generated events.
   */
  source: any = null;
}

$J.define(VetoableChangeSupport, 'java.beans.VetoableChangeSupport', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'java.lang.Object': '_VetoableChangeSupport' }, meths: { 'fireVetoableChange(java.beans.PropertyChangeEvent)': 'fireVetoableChange$PropertyChangeEvent', 'fireVetoableChange(java.lang.String,boolean,boolean)': 'fireVetoableChange$String$boolean$boolean', 'fireVetoableChange(java.lang.String,int,int)': 'fireVetoableChange$String$int$int', 'fireVetoableChange(java.lang.String,java.lang.Object,java.lang.Object)': 'fireVetoableChange$String$Object$Object', 'getVetoableChangeListeners(java.lang.String)': 'getVetoableChangeListeners$String', 'removeVetoableChangeListener(java.lang.String,java.beans.VetoableChangeListener)': 'removeVetoableChangeListener$String$VetoableChangeListener', 'addVetoableChangeListener(java.lang.String,java.beans.VetoableChangeListener)': 'addVetoableChangeListener$String$VetoableChangeListener', 'getVetoableChangeListeners()': 'getVetoableChangeListeners$', 'removeVetoableChangeListener(java.beans.VetoableChangeListener)': 'removeVetoableChangeListener$VetoableChangeListener', 'addVetoableChangeListener(java.beans.VetoableChangeListener)': 'addVetoableChangeListener$VetoableChangeListener' } });
