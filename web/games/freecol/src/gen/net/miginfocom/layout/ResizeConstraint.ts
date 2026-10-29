// @ts-nocheck
// MigLayout 5.3 core/net/miginfocom/layout/ResizeConstraint.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * License (BSD):
 * ==============
 *
 * Copyright (c) 2004, Mikael Grev, MiG InfoCom AB. (miglayout (at) miginfocom (dot) com)
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 * Redistributions of source code must retain the above copyright notice, this list
 * of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this
 * list of conditions and the following disclaimer in the documentation and/or other
 * materials provided with the distribution.
 * Neither the name of the MiG InfoCom AB nor the names of its contributors may be
 * used to endorse or promote products derived from this software without specific
 * prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 * OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY
 * OF SUCH DAMAGE.
 *
 * @version 1.0
 * @author Mikael Grev, MiG InfoCom AB
 *         Date: 2006-sep-08
 */
import { $J, JObject } from '../../../../jre/index.ts';

let LayoutUtil;

/**
 * A parsed constraint that specifies how an entity (normally column/row or component) can shrink or
 * grow compared to other entities.
 */
export class ResizeConstraint extends JObject {
  static WEIGHT_100: number = null;
  /**
   * How flexible the entity should be, relative to other entities, when it comes to growing. <code>null</code> or
   * zero mean it will never grow. An entity that has twice the growWeight compared to another entity will get twice
   * as much of available space.
   * <p>
   * "grow" are only compared within the same "growPrio".
   */
  grow_: number = null;
  /**
   * The relative priority used for determining which entities gets the extra space first.
   */
  growPrio_: number = 0;
  shrink_: number = null;
  shrinkPrio_: number = 0;
  $init_ResizeConstraint() {
    this.grow_ = null;
    this.growPrio_ = 100;
    this.shrink_ = ResizeConstraint.WEIGHT_100;
    this.shrinkPrio_ = 100;
  }
  _ResizeConstraint$(): this {
    this.$init_ResizeConstraint();
    return this;
  }
  _ResizeConstraint$int$Float$int$Float(shrinkPrio: number, shrinkWeight: number, growPrio: number, growWeight: number): this {
    this.$init_ResizeConstraint();
    this.shrinkPrio_ = shrinkPrio;
    this.shrink_ = shrinkWeight;
    this.growPrio_ = growPrio;
    this.grow_ = growWeight;
    return this;
  }
  readResolve(): any {
    return LayoutUtil.getSerializedObject(this);
  }
  readExternal(in$: ObjectInput): void {
    LayoutUtil.setSerializedObject(this, LayoutUtil.readAsXML(in$));
  }
  writeExternal(out: ObjectOutput): void {
    if ($J.getClass(this) === $J.cls(ResizeConstraint)) {
      LayoutUtil.writeAsXML(out, this);
    }
  }
  static $clinit() {
    ResizeConstraint.WEIGHT_100 = $J.boxF(100);
  }
}

$J.define(ResizeConstraint, 'net.miginfocom.layout.ResizeConstraint', { kind: 'class', ifaces: ['java.io.Externalizable'], sup: 'java.lang.Object', ctors: { 'int,java.lang.Float,int,java.lang.Float': '_ResizeConstraint$int$Float$int$Float', '': '_ResizeConstraint$' }, clinit: true, lazy: ['WEIGHT_100'] });
$J.module(() => {
  LayoutUtil = $J.load('net.miginfocom.layout.LayoutUtil');
});
