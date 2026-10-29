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
import { $J, Applet, ClassFinder, ClassLoader, ClassNotFoundException, Exception, IOException, Introspector, JObject, JString, Modifier, ObjectInputStream, SecurityException, URL } from '../../../jre/index.ts';

let BeansAppletContext, BeansAppletStub, ObjectInputStreamWithLoader, ThreadGroupContext;

/**
 * This class provides some general purpose beans control methods.
 *
 * @since 1.1
 */
export class Beans extends JObject {
  /**
   * Constructs a {@code Beans}.
   */
  _Beans(): this {
    return this;
  }
  /**
   * <p>
   * Instantiate a JavaBean.
   * </p>
   * @return a JavaBean
   * @param     cls         the class-loader from which we should create
   *                        the bean.  If this is null, then the system
   *                        class-loader is used.
   * @param     beanName    the name of the bean within the class-loader.
   *                        For example "sun.beanbox.foobah"
   *
   * @throws ClassNotFoundException if the class of a serialized
   *              object could not be found.
   * @throws IOException if an I/O error occurs.
   */
  static instantiate$ClassLoader$String(cls: ClassLoader, beanName: string): any {
    return Beans.instantiate$ClassLoader$String$BeanContext$AppletInitializer(cls, beanName, null, null);
  }
  /**
   * <p>
   * Instantiate a JavaBean.
   * </p>
   * @return a JavaBean
   *
   * @param     cls         the class-loader from which we should create
   *                        the bean.  If this is null, then the system
   *                        class-loader is used.
   * @param     beanName    the name of the bean within the class-loader.
   *                        For example "sun.beanbox.foobah"
   * @param     beanContext The BeanContext in which to nest the new bean
   *
   * @throws ClassNotFoundException if the class of a serialized
   *              object could not be found.
   * @throws IOException if an I/O error occurs.
   * @since 1.2
   */
  static instantiate$ClassLoader$String$BeanContext(cls: ClassLoader, beanName: string, beanContext: BeanContext): any {
    return Beans.instantiate$ClassLoader$String$BeanContext$AppletInitializer(cls, beanName, beanContext, null);
  }
  /**
   * Instantiate a bean.
   * <p>
   * The bean is created based on a name relative to a class-loader.
   * This name should be a dot-separated name such as "a.b.c".
   * <p>
   * In Beans 1.0 the given name can indicate either a serialized object
   * or a class.  Other mechanisms may be added in the future.  In
   * beans 1.0 we first try to treat the beanName as a serialized object
   * name then as a class name.
   * <p>
   * When using the beanName as a serialized object name we convert the
   * given beanName to a resource pathname and add a trailing ".ser" suffix.
   * We then try to load a serialized object from that resource.
   * <p>
   * For example, given a beanName of "x.y", Beans.instantiate would first
   * try to read a serialized object from the resource "x/y.ser" and if
   * that failed it would try to load the class "x.y" and create an
   * instance of that class.
   * <p>
   * If the bean is a subtype of java.applet.Applet, then it is given
   * some special initialization.  First, it is supplied with a default
   * AppletStub and AppletContext.  Second, if it was instantiated from
   * a classname the applet's "init" method is called.  (If the bean was
   * deserialized this step is skipped.)
   * <p>
   * Note that for beans which are applets, it is the caller's responsibility
   * to call "start" on the applet.  For correct behaviour, this should be done
   * after the applet has been added into a visible AWT container.
   * <p>
   * Note that applets created via beans.instantiate run in a slightly
   * different environment than applets running inside browsers.  In
   * particular, bean applets have no access to "parameters", so they may
   * wish to provide property get/set methods to set parameter values.  We
   * advise bean-applet developers to test their bean-applets against both
   * the JDK appletviewer (for a reference browser environment) and the
   * BDK BeanBox (for a reference bean container).
   *
   * @return a JavaBean
   * @param     cls         the class-loader from which we should create
   *                        the bean.  If this is null, then the system
   *                        class-loader is used.
   * @param     beanName    the name of the bean within the class-loader.
   *                        For example "sun.beanbox.foobah"
   * @param     beanContext The BeanContext in which to nest the new bean
   * @param     initializer The AppletInitializer for the new bean
   *
   * @throws ClassNotFoundException if the class of a serialized
   *              object could not be found.
   * @throws IOException if an I/O error occurs.
   * @since 1.2
   *
   * @deprecated It is recommended to use
   * {@link #instantiate(ClassLoader, String, BeanContext)},
   * because the Applet API is deprecated. See the
   * <a href="../../java/applet/package-summary.html"> java.applet package
   * documentation</a> for further information.
   */
  static instantiate$ClassLoader$String$BeanContext$AppletInitializer(cls: ClassLoader, beanName: string, beanContext: BeanContext, initializer: AppletInitializer): any {
    let ins: InputStream;
    let oins = null;
    let result = null;
    let serialized = false;
    let serex = null;
    if (cls == null) {
      try {
        cls = ClassLoader.getSystemClassLoader();
      } catch ($e0) {
        if ($J.isa($e0, SecurityException)) {
          let ex = $J.exc($e0);
        } else {
          throw $e0;
        }
      }
    }
    let serName = (JString.replaceChar(beanName, 46 /* '.' */, 47 /* \u002f */) + '.ser');
    if (cls == null) {
      ins = ClassLoader.getSystemResourceAsStream(serName);
    } else {
      ins = cls.getResourceAsStream(serName);
    }
    if (ins != null) {
      {
        try {
          const $res1 = ins;
          try {
            if (cls == null) {
              oins = new ObjectInputStream(ins);
            } else {
              oins = new ObjectInputStreamWithLoader()._ObjectInputStreamWithLoader(ins, cls);
            }
            result = oins.readObject();
            serialized = true;
            oins.close();
          } finally {
            if ($res1 != null) $res1.close();
          }
        } catch ($e2) {
          if ($J.isa($e2, IOException)) {
            let ex = $J.exc($e2);
            serex = ex;
          } else {
            throw $e2;
          }
        }
      }
    }
    if (result == null) {
      let cl: JClass<any>;
      try {
        cl = ClassFinder.findClass(beanName, cls);
      } catch ($e3) {
        if ($J.isa($e3, ClassNotFoundException)) {
          let ex = $J.exc($e3);
          if (serex != null) {
            throw serex;
          }
          throw ex;
        } else {
          throw $e3;
        }
      }
      if (!Modifier.isPublic(cl.getModifiers())) {
        throw new ClassNotFoundException('' + $J.str(cl) + ' : no public access');
      }
      try {
        result = cl.newInstance();
      } catch ($e4) {
        if ($J.isa($e4, Exception)) {
          let ex = $J.exc($e4);
          throw new ClassNotFoundException('' + $J.str(cl) + ' : ' + $J.str(ex), ex);
        } else {
          throw $e4;
        }
      }
    }
    if (result != null) {
      let stub = null;
      if ($J.isa(result, Applet)) {
        let applet = result;
        let needDummies = initializer == null;
        if (needDummies) {
          let resourceName: string;
          if (serialized) {
            resourceName = (JString.replaceChar(beanName, 46 /* '.' */, 47 /* \u002f */) + '.ser');
          } else {
            resourceName = (JString.replaceChar(beanName, 46 /* '.' */, 47 /* \u002f */) + '.class');
          }
          let objectUrl = null;
          let codeBase = null;
          let docBase = null;
          if (cls == null) {
            objectUrl = ClassLoader.getSystemResource(resourceName);
          } else {
            objectUrl = cls.getResource(resourceName);
          }
          if (objectUrl != null) {
            let s = objectUrl.toExternalForm();
            if (s.endsWith(resourceName)) {
              let ix = (s.length - resourceName.length) | 0;
              codeBase = Beans.newURL(s.substring(0, ix));
              docBase = codeBase;
              ix = s.lastIndexOf(String.fromCharCode(47 /* \u002f */));
              if (ix >= 0) {
                docBase = Beans.newURL(s.substring(0, (ix + 1) | 0));
              }
            }
          }
          let context = new BeansAppletContext()._BeansAppletContext(applet);
          stub = new BeansAppletStub()._BeansAppletStub(applet, context, codeBase, docBase);
          applet.setStub(stub);
        } else {
          initializer.initialize(applet, beanContext);
        }
        if (beanContext != null) {
          Beans.unsafeBeanContextAdd(beanContext, result);
        }
        if (!serialized) {
          applet.setSize$int$int(100, 100);
          applet.init();
        }
        if (needDummies) {
          (stub).active = true;
        } else {
          initializer.activate(applet);
        }
      } else if (beanContext != null) {
        Beans.unsafeBeanContextAdd(beanContext, result);
      }
    }
    return result;
  }
  static unsafeBeanContextAdd(beanContext: BeanContext, res: any): void {
    beanContext.add(res);
  }
  static newURL(spec: string): URL {
    return new URL(spec);
  }
  /**
   * From a given bean, obtain an object representing a specified
   * type view of that source object.
   * <p>
   * The result may be the same object or a different object.  If
   * the requested target view isn't available then the given
   * bean is returned.
   * <p>
   * This method is provided in Beans 1.0 as a hook to allow the
   * addition of more flexible bean behaviour in the future.
   *
   * @return an object representing a specified type view of the
   * source object
   * @param bean        Object from which we want to obtain a view.
   * @param targetType  The type of view we'd like to get.
   */
  static getInstanceOf(bean: any, targetType: JClass<any>): any {
    return bean;
  }
  /**
   * Check if a bean can be viewed as a given target type.
   * The result will be true if the Beans.getInstanceof method
   * can be used on the given bean to obtain an object that
   * represents the specified targetType type view.
   *
   * @param bean  Bean from which we want to obtain a view.
   * @param targetType  The type of view we'd like to get.
   * @return "true" if the given bean supports the given targetType.
   */
  static isInstanceOf(bean: any, targetType: JClass<any>): boolean {
    return Introspector.isSubclass($J.getClass(bean), targetType);
  }
  /**
   * Test if we are in design-mode.
   *
   * @return  True if we are running in an application construction
   *          environment.
   *
   * @see DesignMode
   */
  static isDesignTime(): boolean {
    return ThreadGroupContext.getContext().isDesignTime();
  }
  /**
   * Determines whether beans can assume a GUI is available.
   *
   * @return  True if we are running in an environment where beans
   *     can assume that an interactive GUI is available, so they
   *     can pop up dialog boxes, etc.  This will normally return
   *     true in a windowing environment, and will normally return
   *     false in a server environment or if an application is
   *     running as part of a batch job.
   *
   * @see Visibility
   */
  static isGuiAvailable(): boolean {
    return ThreadGroupContext.getContext().isGuiAvailable();
  }
  /**
   * Used to indicate whether of not we are running in an application
   * builder environment.
   *
   * <p>Note that this method is security checked
   * and is not available to (for example) untrusted applets.
   * More specifically, if there is a security manager,
   * its {@code checkPropertiesAccess}
   * method is called. This could result in a SecurityException.
   *
   * @param isDesignTime  True if we're in an application builder tool.
   * @throws  SecurityException  if a security manager exists and its
   *             {@code checkPropertiesAccess} method doesn't allow setting
   *              of system properties.
   * @see SecurityManager#checkPropertiesAccess
   */
  static setDesignTime(isDesignTime: boolean): void {
    let sm = $J.system_getSecurityManager();
    if (sm != null) {
      sm.checkPropertiesAccess();
    }
    ThreadGroupContext.getContext().setDesignTime(isDesignTime);
  }
  /**
   * Used to indicate whether of not we are running in an environment
   * where GUI interaction is available.
   *
   * <p>Note that this method is security checked
   * and is not available to (for example) untrusted applets.
   * More specifically, if there is a security manager,
   * its {@code checkPropertiesAccess}
   * method is called. This could result in a SecurityException.
   *
   * @param isGuiAvailable  True if GUI interaction is available.
   * @throws  SecurityException  if a security manager exists and its
   *             {@code checkPropertiesAccess} method doesn't allow setting
   *              of system properties.
   * @see SecurityManager#checkPropertiesAccess
   */
  static setGuiAvailable(isGuiAvailable: boolean): void {
    let sm = $J.system_getSecurityManager();
    if (sm != null) {
      sm.checkPropertiesAccess();
    }
    ThreadGroupContext.getContext().setGuiAvailable(isGuiAvailable);
  }
}

$J.define(Beans, 'java.beans.Beans', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Beans' }, meths: { 'instantiate(java.lang.ClassLoader,java.lang.String,java.beans.beancontext.BeanContext,java.beans.AppletInitializer)': 'instantiate$ClassLoader$String$BeanContext$AppletInitializer', 'instantiate(java.lang.ClassLoader,java.lang.String,java.beans.beancontext.BeanContext)': 'instantiate$ClassLoader$String$BeanContext', 'instantiate(java.lang.ClassLoader,java.lang.String)': 'instantiate$ClassLoader$String' } });
$J.module(() => {
  BeansAppletContext = $J.load('java.beans.BeansAppletContext');
  BeansAppletStub = $J.load('java.beans.BeansAppletStub');
  ObjectInputStreamWithLoader = $J.load('java.beans.ObjectInputStreamWithLoader');
  ThreadGroupContext = $J.load('java.beans.ThreadGroupContext');
});
