// @ts-nocheck
// MigLayout 5.3 core/net/miginfocom/layout/AnimSpec.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
 */
import { $J, JObject } from '../../../../jre/index.ts';

let LayoutUtil;

/**
 * @author Mikael Grev, MiG InfoCom AB
 *         Date: 14-09-24
 *         Time: 17:05
 */
export class AnimSpec extends JObject {
  static DEF: AnimSpec = null;
  prio: number = 0;
  durMillis: number = 0;
  easeIn: number = 0;
  easeOut: number = 0;
  /**
   * @param prio The animation priority. When added with the general animation priority of the layout the animation will
   * be done if the resulting value is &gt; 0.
   * @param durMillis Duration in milliseconds. &lt;=0 means default value should be used and &gt; 0 is the number of millis
   * @param easeIn 0 is linear (no ease). 1 is max ease. Always clamped between these values.
   * @param easeOut 0 is linear (no ease). 1 is max ease. Always clamped between these values.
   */
  _AnimSpec(prio: number, durMillis: number, easeIn: number, easeOut: number): this {
    this.prio = prio;
    this.durMillis = durMillis;
    this.easeIn = LayoutUtil.clamp$float$float$float(easeIn, 0, 1);
    this.easeOut = LayoutUtil.clamp$float$float$float(easeOut, 0, 1);
    return this;
  }
  /**
   * @return The animation priority. When added with the general animation priority of the layout the animation will
   * be done if the resulting value is &gt; 0.
   */
  getPriority(): number {
    return this.prio;
  }
  /**
   * @param defMillis Default used if the millis in the spec is set to "default".
   * @return Duration in milliseconds. &lt;=0 means default value should be used and &gt; 0 is the number of millis
   */
  getDurationMillis$int(defMillis: number): number {
    return this.durMillis > 0 ? this.durMillis : defMillis;
  }
  /**
   * @return Duration in milliseconds. &lt;= 0 means default value should be used and &gt; 0 is the number of millis
   */
  getDurationMillis$(): number {
    return this.durMillis;
  }
  /**
   * @return A value between 0 and 1 where 0 is no ease in and 1 is maximum ease in.
   */
  getEaseIn(): number {
    return this.easeIn;
  }
  /**
   * @return A value between 0 and 1 where 0 is no ease out and 1 is maximum ease out.
   */
  getEaseOut(): number {
    return this.easeOut;
  }
  static $clinit() {
    AnimSpec.DEF = new AnimSpec()._AnimSpec(0, 0, Math.fround(0.2), Math.fround(0.2));
  }
}

$J.define(AnimSpec, 'net.miginfocom.layout.AnimSpec', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'int,int,float,float': '_AnimSpec' }, meths: { 'getDurationMillis()': 'getDurationMillis$', 'getDurationMillis(int)': 'getDurationMillis$int' }, clinit: true, lazy: ['DEF'] });
$J.module(() => {
  LayoutUtil = $J.load('net.miginfocom.layout.LayoutUtil');
});
