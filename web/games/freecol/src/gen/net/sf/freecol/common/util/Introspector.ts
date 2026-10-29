// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/util/Introspector.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/**
 *  Copyright (C) 2002-2022   The FreeCol Team
 *
 *  This file is part of FreeCol.
 *
 *  FreeCol is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  FreeCol is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with FreeCol.  If not, see <http://www.gnu.org/licenses/>.
 */
import { $J, Character, ClassNotFoundException, Collectors, Double, Exception, Float, IllegalAccessException, IllegalArgumentException, InstantiationException, Integer, InvocationTargetException, JBoolean, JClass, JEnum, JObject, JString, Modifier, NoSuchMethodException, ReflectiveOperationException, RuntimeException, SecurityException, StringBuilder } from '../../../../../../jre/index.ts';

let CollectionUtils, StringUtils;

/**
 * A class to allow access to the methods "fooType getFoo()" and
 * "void setFoo(fooType)" conventionally seen in objects.
 * Useful when Foo arrives as a run-time String, such as is the
 * case in serialization to/from XML representations.
 */
export class Introspector extends JObject {
  /**
   * The class whose field we are to operate on.
   */
  theClass: JClass<any> = null;
  /**
   * The field whose get/set methods we wish to invoke.
   */
  field: string = null;
  /**
   * Build a new Introspector for the specified class and field name.
   *
   * @param theClass The {@code Class} of interest.
   * @param field The field name within the class of interest.
   */
  _Introspector(theClass: JClass<any>, field: string): this {
    if (field == null || (field.length === 0)) {
      throw new RuntimeException('Field may not be empty: ' + $J.str(this));
    }
    this.theClass = theClass;
    this.field = field;
    return this;
  }
  /**
   * Get a get-method for this Introspector.
   *
   * @return A {@code Method} representing getField().
   * @exception IntrospectorException if the get-method is not available.
   */
  getGetMethod(): Method {
    let methodName = 'get' + Introspector.fromSnakeCase(this.field);
    try {
      return this.theClass.getMethod(methodName);
    } catch ($e0) {
      if ($J.isa($e0, NoSuchMethodException) || $J.isa($e0, SecurityException)) {
        let ex = $J.exc($e0);
        throw new Introspector$IntrospectorException()._Introspector$IntrospectorException$String$Throwable(this.theClass.getName() + '.' + methodName, ex);
      } else {
        throw $e0;
      }
    }
  }
  /**
   * Get a set-method for this Introspector.
   *
   * @param argType A {@code Class} that is the argument to
   *        the set-method
   * @return A {@code Method} representing setField().
   * @exception IntrospectorException if the set-method is not available.
   */
  getSetMethod(argType: JClass<any>): Method {
    let methodName = 'set' + Introspector.fromSnakeCase(this.field);
    try {
      return this.theClass.getMethod(methodName, argType);
    } catch ($e1) {
      if ($J.isa($e1, NoSuchMethodException) || $J.isa($e1, SecurityException)) {
        let e = $J.exc($e1);
        throw new Introspector$IntrospectorException()._Introspector$IntrospectorException$String$Throwable(this.theClass.getName() + '.' + methodName, e);
      } else {
        throw $e1;
      }
    }
  }
  static fromSnakeCase(nameInSnakeCase: string): string {
    let sb = new StringBuilder();
    for (let s of JString.split(nameInSnakeCase, '-')) {
      sb.append(StringUtils.capitalize$String(s));
    }
    return sb.toString();
  }
  /**
   * Get the return type from a {@code Method}.
   *
   * @param method The {@code Method} to examine.
   * @return The method return type, or null on error.
   * @exception IntrospectorException if the return type is not available.
   */
  getMethodReturnType(method: Method): JClass<any> {
    let ret: JClass<any>;
    try {
      ret = method.getReturnType();
    } catch ($e2) {
      if ($J.isa($e2, Exception)) {
        let e = $J.exc($e2);
        throw new Introspector$IntrospectorException()._Introspector$IntrospectorException$String$Throwable(this.theClass.getName() + '.' + method.getName() + ' return type.', e);
      } else {
        throw $e2;
      }
    }
    return ret;
  }
  /**
   * Get a function that converts to String from a given class.
   * We use Enum.name() for enums, and String.valueOf(argType) for the rest.
   *
   * @param argType A {@code Class} to find a converter for.
   * @return A conversion function, or null on error.
   * @exception NoSuchMethodException if no converter is found.
   */
  getToStringConverter(argType: JClass<any>): Method {
    return (argType.isEnum()) ? argType.getMethod('name') : $J.cls(JString).getMethod('valueOf', argType);
  }
  /**
   * Get a function that converts from String to a given class.
   * We use Enum.valueOf(Class, String) for enums, and
   * argType.valueOf(String) for the rest, having first dodged
   * the primitive types.
   *
   * @param argType A {@code Class} to find a converter for.
   * @return A conversion function, or null on error.
   */
  getFromStringConverter(argType: JClass<any>): Method {
    let method: Method;
    if (argType.isEnum()) {
      try {
        method = $J.cls(JEnum).getMethod('valueOf', $J.cls(JClass), $J.cls(JString));
      } catch ($e3) {
        if ($J.isa($e3, NoSuchMethodException) || $J.isa($e3, SecurityException)) {
          let e = $J.exc($e3);
          throw new RuntimeException('Enum.getMethod(valueOf(Class, String)): ' + $J.str(argType), e);
        } else {
          throw $e3;
        }
      }
    } else {
      if (argType.isPrimitive()) {
        if (argType === $J.cls('int')) {
          argType = $J.cls(Integer);
        } else if (argType === $J.cls('boolean')) {
          argType = $J.cls(JBoolean);
        } else if (argType === $J.cls('float')) {
          argType = $J.cls(Float);
        } else if (argType === $J.cls('double')) {
          argType = $J.cls(Double);
        } else if (argType === $J.cls('char')) {
          argType = $J.cls(Character);
        } else {
          throw new IllegalArgumentException('Need compatible class for primitive ' + argType.getName());
        }
      }
      try {
        method = argType.getMethod('valueOf', $J.cls(JString));
      } catch ($e4) {
        if ($J.isa($e4, NoSuchMethodException) || $J.isa($e4, SecurityException)) {
          let e = $J.exc($e4);
          throw new IllegalArgumentException(argType.getName() + '.getMethod(valueOf(String))', e);
        } else {
          throw $e4;
        }
      }
    }
    return method;
  }
  /**
   * Invoke the get-method for this Introspector.
   *
   * @param obj An {@code Object} (really of type theClass)
   *        whose get-method is to be invoked.
   * @return A {@code String} containing the result of invoking
   *         the get-method.
   * @exception IntrospectorException encompasses many failures.
   */
  getter(obj: any): string {
    let getMethod = this.getGetMethod();
    let fieldType = this.getMethodReturnType(getMethod);
    if (fieldType === $J.cls(JString)) {
      try {
        return getMethod.invoke(obj);
      } catch ($e5) {
        if ($J.isa($e5, IllegalAccessException) || $J.isa($e5, IllegalArgumentException) || $J.isa($e5, InvocationTargetException)) {
          let e = $J.exc($e5);
          throw new Introspector$IntrospectorException()._Introspector$IntrospectorException$String$Throwable(getMethod.getName() + '(obj)', e);
        } else {
          throw $e5;
        }
      }
    } else {
      let result = null;
      try {
        result = getMethod.invoke(obj);
      } catch ($e6) {
        if ($J.isa($e6, IllegalAccessException) || $J.isa($e6, IllegalArgumentException) || $J.isa($e6, InvocationTargetException)) {
          let e = $J.exc($e6);
          throw new Introspector$IntrospectorException()._Introspector$IntrospectorException$String$Throwable(getMethod.getName() + '(obj)', e);
        } else {
          throw $e6;
        }
      }
      let convertMethod: Method;
      try {
        convertMethod = this.getToStringConverter(fieldType);
      } catch ($e7) {
        if ($J.isa($e7, NoSuchMethodException)) {
          let nsme = $J.exc($e7);
          throw new Introspector$IntrospectorException()._Introspector$IntrospectorException$String$Throwable('No String converter found for ' + $J.str(fieldType), nsme);
        } else {
          throw $e7;
        }
      }
      if (Modifier.isStatic(convertMethod.getModifiers())) {
        try {
          return convertMethod.invoke(null, result);
        } catch ($e8) {
          if ($J.isa($e8, IllegalAccessException) || $J.isa($e8, IllegalArgumentException) || $J.isa($e8, InvocationTargetException)) {
            let e = $J.exc($e8);
            throw new Introspector$IntrospectorException()._Introspector$IntrospectorException$String$Throwable(convertMethod.getName() + '(null, result)', e);
          } else {
            throw $e8;
          }
        }
      } else {
        try {
          return convertMethod.invoke(result);
        } catch ($e9) {
          if ($J.isa($e9, IllegalAccessException) || $J.isa($e9, IllegalArgumentException) || $J.isa($e9, InvocationTargetException)) {
            let e = $J.exc($e9);
            throw new Introspector$IntrospectorException()._Introspector$IntrospectorException$String$Throwable(convertMethod.getName() + '(result)', e);
          } else {
            throw $e9;
          }
        }
      }
    }
  }
  /**
   * Invoke the set-method provided by this Introspector.
   *
   * @param obj An {@code Object} (really of type theClass)
   *        whose set-method is to be invoked.
   * @param value A {@code String} containing the value to be set.
   * @exception IntrospectorException encompasses many failures.
   */
  setter(obj: any, value: string): void {
    let getMethod = this.getGetMethod();
    let fieldType = this.getMethodReturnType(getMethod);
    let setMethod = this.getSetMethod(fieldType);
    if (fieldType === $J.cls(JString)) {
      try {
        setMethod.invoke(obj, value);
      } catch ($e10) {
        if ($J.isa($e10, IllegalAccessException) || $J.isa($e10, IllegalArgumentException) || $J.isa($e10, InvocationTargetException)) {
          let e = $J.exc($e10);
          throw new Introspector$IntrospectorException()._Introspector$IntrospectorException$String$Throwable(setMethod.getName() + '(obj, ' + value + ')', e);
        } else {
          throw $e10;
        }
      }
    } else {
      let convertMethod = this.getFromStringConverter(fieldType);
      let result = null;
      if (fieldType.isEnum()) {
        try {
          result = convertMethod.invoke(null, fieldType, value);
        } catch ($e11) {
          if ($J.isa($e11, IllegalAccessException) || $J.isa($e11, IllegalArgumentException) || $J.isa($e11, InvocationTargetException)) {
            let e = $J.exc($e11);
            throw new Introspector$IntrospectorException()._Introspector$IntrospectorException$String$Throwable(convertMethod.getName() + '(null, ' + fieldType.getName() + ', ' + value + ')', e);
          } else {
            throw $e11;
          }
        }
      } else {
        try {
          result = convertMethod.invoke(null, value);
        } catch ($e12) {
          if ($J.isa($e12, IllegalAccessException) || $J.isa($e12, IllegalArgumentException) || $J.isa($e12, InvocationTargetException)) {
            let e = $J.exc($e12);
            throw new Introspector$IntrospectorException()._Introspector$IntrospectorException$String$Throwable(convertMethod.getName() + '(null, ' + value + ')', e);
          } else {
            throw $e12;
          }
        }
      }
      try {
        setMethod.invoke(obj, result);
      } catch ($e13) {
        if ($J.isa($e13, IllegalAccessException) || $J.isa($e13, IllegalArgumentException) || $J.isa($e13, InvocationTargetException)) {
          let e = $J.exc($e13);
          throw new Introspector$IntrospectorException()._Introspector$IntrospectorException$String$Throwable(setMethod.getName() + '(result)', e);
        } else {
          throw $e13;
        }
      }
    }
  }
  /**
   * Get a class by name.
   *
   * @param name The class name to look for.
   * @return The class found, or null if none available.
   */
  static getClassByName(name: string): JClass<any> {
    let messageClass: JClass<any>;
    try {
      return JClass.forName(name);
    } catch ($e14) {
      if ($J.isa($e14, ClassNotFoundException)) {
        let ex = $J.exc($e14);
        return null;
      } else {
        throw $e14;
      }
    }
  }
  /**
   * Get a constructor for a given class and arguments.
   *
   * @param <T> The type to construct.
   * @param cl The base class.
   * @param types The types of the constructor arguments.
   * @return The constructor found, or null on error.
   */
  static getConstructor<T>(cl: JClass<T>, types: JClass[]): Constructor<T> {
    let constructor$: Constructor<T>;
    try {
      constructor$ = cl.getDeclaredConstructor(...types);
    } catch ($e15) {
      if ($J.isa($e15, NoSuchMethodException) || $J.isa($e15, SecurityException)) {
        let ex = $J.exc($e15);
        constructor$ = null;
      } else {
        throw $e15;
      }
    }
    return constructor$;
  }
  /**
   * Construct a new instance.
   *
   * @param <T> The type to construct.
   * @param constructor The {@code Constructor} to use.
   * @param params The constructor parameters.
   * @return The instance created, or null on error.
   * @exception IntrospectorException if there is a FreeCol failure.
   */
  static construct<T>(constructor$: Constructor<T>, params: any[]): T {
    let instance: T;
    try {
      instance = constructor$.newInstance(...params);
    } catch ($e16) {
      if ($J.isa($e16, InvocationTargetException)) {
        let ite = $J.exc($e16);
        throw new Introspector$IntrospectorException()._Introspector$IntrospectorException$Throwable(ite);
      } else if ($J.isa($e16, IllegalAccessException) || $J.isa($e16, InstantiationException)) {
        let ex = $J.exc($e16);
        instance = null;
      } else {
        throw $e16;
      }
    }
    return instance;
  }
  /**
   * Constructs a new instance of an object of a class specified by name,
   * with supplied parameters.
   *
   * @param tag The name of the class to instantiate.
   * @param types The argument types of the constructor to call.
   * @param params The parameters to call the constructor with.
   * @return The new object instance.
   * @exception IntrospectorException wraps all exceptional conditions.
   */
  static instantiate$String$ClassArr$ObjectArr(tag: string, types: JClass[], params: any[]): any {
    let messageClass: JClass<any>;
    try {
      messageClass = JClass.forName(tag);
    } catch ($e17) {
      if ($J.isa($e17, ClassNotFoundException)) {
        let ex = $J.exc($e17);
        throw new Introspector$IntrospectorException()._Introspector$IntrospectorException$String$Throwable('Unable to find class ' + tag, ex);
      } else {
        throw $e17;
      }
    }
    return Introspector.instantiate$Class$ClassArr$ObjectArr(messageClass, types, params);
  }
  /**
   * Constructs a new instance of an object of a class specified by name,
   * with supplied parameters.
   *
   * @param <T> The actual return type.
   * @param messageClass The class to instantiate.
   * @param types The argument types of the constructor to call.
   * @param params The parameters to call the constructor with.
   * @return The new instance.
   * @exception IntrospectorException wraps all exceptional conditions.
   */
  static instantiate$Class$ClassArr$ObjectArr<T>(messageClass: JClass<T>, types: JClass[], params: any[]): T {
    let tag = messageClass.getName();
    let constructor$: Constructor<T>;
    try {
      constructor$ = messageClass.getDeclaredConstructor(...types);
    } catch ($e18) {
      if ($J.isa($e18, NoSuchMethodException) || $J.isa($e18, SecurityException)) {
        let ex = $J.exc($e18);
        throw new Introspector$IntrospectorException()._Introspector$IntrospectorException$String$Throwable('Unable to find constructor ' + StringUtils.lastPart(tag, '.') + '(' + CollectionUtils.transform$ObjectArr$Predicate$Function$Collector(types, CollectionUtils.alwaysTrue(), ($p0) => $p0.getName(), Collectors.joining(',')) + ')', ex);
      } else {
        throw $e18;
      }
    }
    let instance: T;
    try {
      instance = constructor$.newInstance(...params);
    } catch ($e19) {
      if ($J.isa($e19, IllegalAccessException) || $J.isa($e19, InstantiationException) || $J.isa($e19, InvocationTargetException)) {
        let ex = $J.exc($e19);
        throw new Introspector$IntrospectorException()._Introspector$IntrospectorException$String$Throwable('Failed to construct ' + StringUtils.lastPart(tag, '.'), ex);
      } else {
        throw $e19;
      }
    }
    return instance;
  }
  /**
   * Invoke an object method by name.
   *
   * @param <T> The actual return type.
   * @param object The base object.
   * @param methodName The name of the method to invoke.
   * @param returnClass The expected class to return.
   * @return The result of invoking the method.
   * @exception IllegalAccessException if the method exists but is hidden.
   * @exception InvocationTargetException if the target can not be invoked.
   * @exception NoSuchMethodException if the invocation fails.
   */
  static invokeMethod<T>(object$: any, methodName: string, returnClass: JClass<T>): T {
    return returnClass.cast($J.getClass(object$).getMethod(methodName).invoke(object$));
  }
  /**
   * Invoke an object void method by name.
   *
   * @param object The base object.
   * @param methodName The name of the method to invoke.
   * @exception IllegalAccessException if the method exists but is hidden.
   * @exception InvocationTargetException if the target can not be invoked.
   * @exception NoSuchMethodException if the invocation fails.
   */
  static invokeVoidMethod(object$: any, methodName: string): void {
    $J.getClass(object$).getMethod(methodName).invoke(object$);
  }
}

export class Introspector$IntrospectorException extends ReflectiveOperationException {
  _Introspector$IntrospectorException$Throwable(cause: Throwable): this {
    this._ReflectiveOperationException(cause);
    return this;
  }
  _Introspector$IntrospectorException$String$Throwable(err: string, cause: Throwable): this {
    this._ReflectiveOperationException(err, cause);
    return this;
  }
}

$J.define(Introspector, 'net.sf.freecol.common.util.Introspector', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.lang.Class,java.lang.String': '_Introspector' }, returns: { 'getGetMethod': 'java.lang.reflect.Method' }, meths: { 'instantiate(java.lang.Class,java.lang.Class[],java.lang.Object[])': 'instantiate$Class$ClassArr$ObjectArr', 'instantiate(java.lang.String,java.lang.Class[],java.lang.Object[])': 'instantiate$String$ClassArr$ObjectArr' } });
$J.define(Introspector$IntrospectorException, 'net.sf.freecol.common.util.Introspector$IntrospectorException', { kind: 'class', sup: 'java.lang.ReflectiveOperationException', ctors: { 'java.lang.String,java.lang.Throwable': '_Introspector$IntrospectorException$String$Throwable', 'java.lang.Throwable': '_Introspector$IntrospectorException$Throwable' } });
$J.module(() => {
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
});
