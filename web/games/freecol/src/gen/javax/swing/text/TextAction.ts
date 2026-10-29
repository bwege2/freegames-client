// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/text/TextAction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2013, Oracle and/or its affiliates. All rights reserved.
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
import { $J, Hashtable } from '../../../../jre/index.ts';
import { AbstractAction } from '../AbstractAction.ts';

let Action, JTextComponent;

/**
 * An Action implementation useful for key bindings that are
 * shared across a number of different text components.  Because
 * the action is shared, it must have a way of getting it's
 * target to act upon.  This class provides support to try and
 * find a text component to operate on.  The preferred way of
 * getting the component to act upon is through the ActionEvent
 * that is received.  If the Object returned by getSource can
 * be narrowed to a text component, it will be used.  If the
 * action event is null or can't be narrowed, the last focused
 * text component is tried.  This is determined by being
 * used in conjunction with a JTextController which
 * arranges to share that information with a TextAction.
 * <p>
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the <code>java.beans</code> package.
 * Please see {@link java.beans.XMLEncoder}.
 *
 * @author  Timothy Prinzing
 */
export class TextAction extends AbstractAction {
  /**
   * Creates a new JTextAction object.
   *
   * @param name the name of the action
   */
  _TextAction(name: string): this {
    this._AbstractAction$String(name);
    return this;
  }
  /**
   * Determines the component to use for the action.
   * This if fetched from the source of the ActionEvent
   * if it's not null and can be narrowed.  Otherwise,
   * the last focused component is used.
   *
   * @param e the ActionEvent
   * @return the component
   */
  getTextComponent(e: ActionEvent): JTextComponent {
    if (e != null) {
      let o = e.getSource();
      if (o instanceof JTextComponent) {
        return o;
      }
    }
    return this.getFocusedComponent();
  }
  /**
   * Takes one list of
   * commands and augments it with another list
   * of commands.  The second list takes precedence
   * over the first list; that is, when both lists
   * contain a command with the same name, the command
   * from the second list is used.
   *
   * @param list1 the first list, may be empty but not
   *              <code>null</code>
   * @param list2 the second list, may be empty but not
   *              <code>null</code>
   * @return the augmented list
   */
  static augmentList(list1: Action[], list2: Action[]): Action[] {
    let h = new Hashtable();
    for (let a of list1) {
      let value = a.getValue$String(Action.NAME);
      h.put((value != null ? value : ''), a);
    }
    for (let a of list2) {
      let value = a.getValue$String(Action.NAME);
      h.put((value != null ? value : ''), a);
    }
    let actions = $J.newArray(h.size(), null);
    let index = 0;
    for (let e = h.elements(); e.hasMoreElements(); ) {
      actions[index++] = e.nextElement();
    }
    return actions;
  }
  /**
   * Fetches the text component that currently has focus.
   * This allows actions to be shared across text components
   * which is useful for key-bindings where a large set of
   * actions are defined, but generally used the same way
   * across many different components.
   *
   * @return the component
   */
  getFocusedComponent(): JTextComponent {
    return JTextComponent.getFocusedComponent();
  }
}

$J.define(TextAction, 'javax.swing.text.TextAction', { kind: 'class', sup: 'javax.swing.AbstractAction', ctors: { 'java.lang.String': '_TextAction' } });
$J.module(() => {
  Action = $J.load('javax.swing.Action');
  JTextComponent = $J.load('javax.swing.text.JTextComponent');
});
