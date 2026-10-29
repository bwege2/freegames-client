// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/beans/PropertyDescriptor.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../jre/index.ts';
import { FeatureDescriptor } from './FeatureDescriptor.ts';

let MethodRef;

/**
 * A PropertyDescriptor describes one property that a Java Bean
 * exports via a pair of accessor methods.
 * @since 1.1
 */
export class PropertyDescriptor extends FeatureDescriptor {
  propertyTypeRef: Reference<JClass<any>> = null;
  readMethodRef: MethodRef = null;
  writeMethodRef: MethodRef = null;
  propertyEditorClassRef: Reference<JClass<any>> = null;
  bound_: boolean = false;
  constrained: boolean = false;
  baseName: string = null;
  writeMethodName: string = null;
  readMethodName: string = null;
  $init_PropertyDescriptor() {
    this.readMethodRef = new MethodRef()._MethodRef();
    this.writeMethodRef = new MethodRef()._MethodRef();
  }
}

$J.define(PropertyDescriptor, 'java.beans.PropertyDescriptor', { kind: 'class', sup: 'java.beans.FeatureDescriptor', ctors: { 'java.beans.PropertyDescriptor': '_PropertyDescriptor$PropertyDescriptor', 'java.beans.PropertyDescriptor,java.beans.PropertyDescriptor': '_PropertyDescriptor$PropertyDescriptor$PropertyDescriptor', 'java.util.Map$Entry,boolean': '_PropertyDescriptor$Entry$boolean', 'java.lang.String,java.lang.reflect.Method,java.lang.reflect.Method': '_PropertyDescriptor$String$Method$Method', 'java.lang.String,java.lang.Class,java.lang.String,java.lang.String': '_PropertyDescriptor$String$Class$String$String', 'java.lang.String,java.lang.Class': '_PropertyDescriptor$String$Class' } });
$J.module(() => {
  MethodRef = $J.load('java.beans.MethodRef');
});
