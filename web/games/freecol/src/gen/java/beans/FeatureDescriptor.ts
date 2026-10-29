// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/beans/FeatureDescriptor.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1996, 2011, Oracle and/or its affiliates. All rights reserved.
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
 * The FeatureDescriptor class is the common baseclass for PropertyDescriptor,
 * EventSetDescriptor, and MethodDescriptor, etc.
 * <p>
 * It supports some common information that can be set and retrieved for
 * any of the introspection descriptors.
 * <p>
 * In addition it provides an extension mechanism so that arbitrary
 * attribute/value pairs can be associated with a design feature.
 *
 * @since 1.1
 */
export class FeatureDescriptor extends JObject {
  static readonly TRANSIENT: string = 'transient';
  classRef: Reference<JClass<any>> = null;
  expert_: boolean = false;
  hidden_: boolean = false;
  preferred_: boolean = false;
  shortDescription: string = null;
  name: string = null;
  displayName: string = null;
  table: Hashtable<string, any> = null;
}

$J.define(FeatureDescriptor, 'java.beans.FeatureDescriptor', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.beans.FeatureDescriptor': '_FeatureDescriptor$FeatureDescriptor', 'java.beans.FeatureDescriptor,java.beans.FeatureDescriptor': '_FeatureDescriptor$FeatureDescriptor$FeatureDescriptor', '': '_FeatureDescriptor$' }, meths: { 'appendTo(java.lang.StringBuilder,java.lang.String,boolean)': 'appendTo$StringBuilder$String$boolean', 'appendTo(java.lang.StringBuilder,java.lang.String,java.lang.Object)': 'appendTo$StringBuilder$String$Object', 'appendTo(java.lang.StringBuilder,java.lang.String,java.lang.ref.Reference)': 'appendTo$StringBuilder$String$Reference' } });
