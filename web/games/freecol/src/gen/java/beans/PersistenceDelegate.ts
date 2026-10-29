// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/beans/PersistenceDelegate.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2000, 2020, Oracle and/or its affiliates. All rights reserved.
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
 * The PersistenceDelegate class takes the responsibility
 * for expressing the state of an instance of a given class
 * in terms of the methods in the class's public API. Instead
 * of associating the responsibility of persistence with
 * the class itself as is done, for example, by the
 * {@code readObject} and {@code writeObject}
 * methods used by the {@code ObjectOutputStream}, streams like
 * the {@code XMLEncoder} which
 * use this delegation model can have their behavior controlled
 * independently of the classes themselves. Normally, the class
 * is the best place to put such information and conventions
 * can easily be expressed in this delegation scheme to do just that.
 * Sometimes however, it is the case that a minor problem
 * in a single class prevents an entire object graph from
 * being written and this can leave the application
 * developer with no recourse but to attempt to shadow
 * the problematic classes locally or use alternative
 * persistence techniques. In situations like these, the
 * delegation model gives a relatively clean mechanism for
 * the application developer to intervene in all parts of the
 * serialization process without requiring that modifications
 * be made to the implementation of classes which are not part
 * of the application itself.
 * <p>
 * In addition to using a delegation model, this persistence
 * scheme differs from traditional serialization schemes
 * in requiring an analog of the {@code writeObject}
 * method without a corresponding {@code readObject}
 * method. The {@code writeObject} analog encodes each
 * instance in terms of its public API and there is no need to
 * define a {@code readObject} analog
 * since the procedure for reading the serialized form
 * is defined by the semantics of method invocation as laid
 * out in the Java Language Specification.
 * Breaking the dependency between {@code writeObject}
 * and {@code readObject} implementations, which may
 * change from version to version, is the key factor
 * in making the archives produced by this technique immune
 * to changes in the private implementations of the classes
 * to which they refer.
 * <p>
 * A persistence delegate, may take control of all
 * aspects of the persistence of an object including:
 * <ul>
 * <li>
 * Deciding whether or not an instance can be mutated
 * into another instance of the same class.
 * <li>
 * Instantiating the object, either by calling a
 * public constructor or a public factory method.
 * <li>
 * Performing the initialization of the object.
 * </ul>
 * @see XMLEncoder
 *
 * @since 1.4
 *
 * @author Philip Milne
 */
export class PersistenceDelegate extends JObject {
  /**
   * Constructs a {@code PersistenceDelegate}.
   */
  _PersistenceDelegate(): this {
    return this;
  }
}

$J.define(PersistenceDelegate, 'java.beans.PersistenceDelegate', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_PersistenceDelegate' } });
