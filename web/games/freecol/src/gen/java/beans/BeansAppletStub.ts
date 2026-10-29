// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/beans/Beans.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1996, 2022, Oracle and/or its affiliates. All rights reserved.
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
 * Package private support class.  This provides an AppletStub
 * for beans which are applets.
 */
export class BeansAppletStub extends JObject {
  active: boolean = false;
  target: Applet = null;
  context: AppletContext = null;
  codeBase: URL = null;
  docBase: URL = null;
  _BeansAppletStub(target: Applet, context: AppletContext, codeBase: URL, docBase: URL): this {
    this.target = target;
    this.context = context;
    this.codeBase = codeBase;
    this.docBase = docBase;
    return this;
  }
  isActive(): boolean {
    return this.active;
  }
  getDocumentBase(): URL {
    return this.docBase;
  }
  getCodeBase(): URL {
    return this.codeBase;
  }
  getParameter(name: string): string {
    return null;
  }
  getAppletContext(): AppletContext {
    return this.context;
  }
  appletResize(width: number, height: number): void {
  }
}

$J.define(BeansAppletStub, 'java.beans.BeansAppletStub', { kind: 'class', ifaces: ['java.applet.AppletStub'], sup: 'java.lang.Object', ctors: { 'java.applet.Applet,java.applet.AppletContext,java.net.URL,java.net.URL': '_BeansAppletStub' } });
