// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/beans/ThreadGroupContext.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2011, 2019, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject, Thread } from '../../../jre/index.ts';

let GraphicsEnvironment, WeakIdentityMap;

/**
 * The {@code ThreadGroupContext} is an application-dependent
 * context referenced by the specific {@link ThreadGroup}.
 * This is a replacement for the {@link sun.awt.AppContext}.
 *
 * @author  Sergey Malenkov
 */
export class ThreadGroupContext extends JObject {
  static contexts: WeakIdentityMap<ThreadGroupContext> = null;
  isDesignTime_: boolean = false;
  isGuiAvailable_: boolean = null;
  beanInfoCache: JMap<JClass<any>, BeanInfo> = null;
  beanInfoFinder: BeanInfoFinder = null;
  propertyEditorFinder: PropertyEditorFinder = null;
  _ThreadGroupContext(): this {
    return this;
  }
  /**
   * Returns the appropriate {@code ThreadGroupContext} for the caller,
   * as determined by its {@code ThreadGroup}.
   *
   * @return  the application-dependent context
   */
  static getContext(): ThreadGroupContext {
    return ThreadGroupContext.contexts.get(Thread.currentThread().getThreadGroup());
  }
  isDesignTime(): boolean {
    return this.isDesignTime_;
  }
  setDesignTime(isDesignTime: boolean): void {
    this.isDesignTime_ = isDesignTime;
  }
  isGuiAvailable(): boolean {
    let isGuiAvailable = this.isGuiAvailable_;
    return (isGuiAvailable != null) ? isGuiAvailable : !GraphicsEnvironment.isHeadless();
  }
  setGuiAvailable(isGuiAvailable: boolean): void {
    this.isGuiAvailable_ = isGuiAvailable;
  }
  static $clinit() {
    ThreadGroupContext.contexts = new (ThreadGroupContext$1())()._WeakIdentityMap();
  }
}

let $ThreadGroupContext$1: any = null;
/** An anonymous class (ThreadGroupContext.java:44). */
function ThreadGroupContext$1(): any {
  return $ThreadGroupContext$1 ??= $J.local(class extends WeakIdentityMap {
    create(key: any): ThreadGroupContext {
      return new ThreadGroupContext()._ThreadGroupContext();
    }
  }, 'java.beans.ThreadGroupContext$1', []);
}

$J.define(ThreadGroupContext, 'java.beans.ThreadGroupContext', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_ThreadGroupContext' }, clinit: true, lazy: ['contexts'] });
$J.module(() => {
  GraphicsEnvironment = $J.load('java.awt.GraphicsEnvironment');
  WeakIdentityMap = $J.load('java.beans.WeakIdentityMap');
});
