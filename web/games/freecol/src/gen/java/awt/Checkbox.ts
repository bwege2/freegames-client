// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/Checkbox.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1995, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { Component } from './Component.ts';

/**
 * A check box is a graphical component that can be in either an
 * "on" ({@code true}) or "off" ({@code false}) state.
 * Clicking on a check box changes its state from
 * "on" to "off," or from "off" to "on."
 * <p>
 * The following code example creates a set of check boxes in
 * a grid layout:
 *
 * <hr><blockquote><pre>
 * setLayout(new GridLayout(3, 1));
 * add(new Checkbox("one", null, true));
 * add(new Checkbox("two"));
 * add(new Checkbox("three"));
 * </pre></blockquote><hr>
 * <p>
 * This image depicts the check boxes and grid layout
 * created by this code example:
 * <p>
 * <img src="doc-files/Checkbox-1.gif" alt="The following context describes the
 * graphic." style="margin: 7px 10px;">
 * <p>
 * The button labeled {@code one} is in the "on" state, and the
 * other two are in the "off" state. In this example, which uses the
 * {@code GridLayout} class, the states of the three check
 * boxes are set independently.
 * <p>
 * Alternatively, several check boxes can be grouped together under
 * the control of a single object, using the
 * {@code CheckboxGroup} class.
 * In a check box group, at most one button can be in the "on"
 * state at any given time. Clicking on a check box to turn it on
 * forces any other check box in the same group that is on
 * into the "off" state.
 *
 * @author      Sami Shaio
 * @see         java.awt.GridLayout
 * @see         java.awt.CheckboxGroup
 * @since       1.0
 */
export class Checkbox extends Component {
  /**
   * The label of the Checkbox.
   * This field can be null.
   * @serial
   * @see #getLabel()
   * @see #setLabel(String)
   */
  label: string = null;
  /**
   * The state of the {@code Checkbox}.
   * @serial
   * @see #getState()
   * @see #setState(boolean)
   */
  state: boolean = false;
  /**
   * The check box group.
   * This field can be null indicating that the checkbox
   * is not a group checkbox.
   * @serial
   * @see #getCheckboxGroup()
   * @see #setCheckboxGroup(CheckboxGroup)
   */
  group: CheckboxGroup = null;
  itemListener: ItemListener = null;
  static readonly base: string = 'checkbox';
  static nameCounter: number = 0;
  /**
   * Serialized data version.
   * @serial
   */
  checkboxSerializedDataVersion: number = 0;
  $init_Checkbox() {
    this.checkboxSerializedDataVersion = 1;
  }
}

$J.define(Checkbox, 'java.awt.Checkbox', { kind: 'class', ifaces: ['java.awt.ItemSelectable', 'javax.accessibility.Accessible'], sup: 'java.awt.Component', ctors: { 'java.lang.String,java.awt.CheckboxGroup,boolean': '_Checkbox$String$CheckboxGroup$boolean', 'java.lang.String,boolean,java.awt.CheckboxGroup': '_Checkbox$String$boolean$CheckboxGroup', 'java.lang.String,boolean': '_Checkbox$String$boolean', 'java.lang.String': '_Checkbox$String', '': '_Checkbox$' }, meths: { 'readObject(java.io.ObjectInputStream)': 'readObject$ObjectInputStream$Checkbox', 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$Checkbox' } });
