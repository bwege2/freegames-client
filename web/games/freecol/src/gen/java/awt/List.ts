// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/List.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1995, 2022, Oracle and/or its affiliates. All rights reserved.
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
import { $J, Vector } from '../../../jre/index.ts';
import { Component } from './Component.ts';

/**
 * The {@code List} component presents the user with a
 * scrolling list of text items. The list can be set up so that
 * the user can choose either one item or multiple items.
 * <p>
 * For example, the code&nbsp;.&nbsp;.&nbsp;.
 *
 * <hr><blockquote><pre>
 * List lst = new List(4, false);
 * lst.add("Mercury");
 * lst.add("Venus");
 * lst.add("Earth");
 * lst.add("JavaSoft");
 * lst.add("Mars");
 * lst.add("Jupiter");
 * lst.add("Saturn");
 * lst.add("Uranus");
 * lst.add("Neptune");
 * lst.add("Pluto");
 * cnt.add(lst);
 * </pre></blockquote><hr>
 * <p>
 * where {@code cnt} is a container, produces the following
 * scrolling list:
 * <p>
 * <img src="doc-files/List-1.gif"
 * alt="Shows a list containing: Venus, Earth, JavaSoft, and Mars. Javasoft is
 * selected." style="margin: 7px 10px;">
 * <p>
 * If the List allows multiple selections, then clicking on
 * an item that is already selected deselects it. In the preceding
 * example, only one item from the scrolling list can be selected
 * at a time, since the second argument when creating the new scrolling
 * list is {@code false}. If the List does not allow multiple
 * selections, selecting an item causes any other selected item
 * to be deselected.
 * <p>
 * Note that the list in the example shown was created with four visible
 * rows.  Once the list has been created, the number of visible rows
 * cannot be changed.  A default {@code List} is created with
 * four rows, so that {@code lst = new List()} is equivalent to
 * {@code list = new List(4, false)}.
 * <p>
 * Beginning with Java&nbsp;1.1, the Abstract Window Toolkit
 * sends the {@code List} object all mouse, keyboard, and focus events
 * that occur over it. (The old AWT event model is being maintained
 * only for backwards compatibility, and its use is discouraged.)
 * <p>
 * When an item is selected or deselected by the user, AWT sends an instance
 * of {@code ItemEvent} to the list.
 * When the user double-clicks on an item in a scrolling list,
 * AWT sends an instance of {@code ActionEvent} to the
 * list following the item event. AWT also generates an action event
 * when the user presses the return key while an item in the
 * list is selected.
 * <p>
 * If an application wants to perform some action based on an item
 * in this list being selected or activated by the user, it should implement
 * {@code ItemListener} or {@code ActionListener}
 * as appropriate and register the new listener to receive
 * events from this list.
 * <p>
 * For multiple-selection scrolling lists, it is considered a better
 * user interface to use an external gesture (such as clicking on a
 * button) to trigger the action.
 * @author      Sami Shaio
 * @see         java.awt.event.ItemEvent
 * @see         java.awt.event.ItemListener
 * @see         java.awt.event.ActionEvent
 * @see         java.awt.event.ActionListener
 * @since       1.0
 */
export class List extends Component {
  /**
   * A vector created to contain items which will become
   * part of the List Component.
   *
   * @serial
   * @see #addItem(String)
   * @see #getItem(int)
   */
  items: Vector<string> = null;
  /**
   * This field will represent the number of visible rows in the
   * {@code List} Component.  It is specified only once, and
   * that is when the list component is actually
   * created.  It will never change.
   *
   * @serial
   * @see #getRows()
   */
  rows: number = 0;
  /**
   * {@code multipleMode} is a variable that will
   * be set to {@code true} if a list component is to be set to
   * multiple selection mode, that is where the user can
   * select more than one item in a list at one time.
   * {@code multipleMode} will be set to false if the
   * list component is set to single selection, that is where
   * the user can only select one item on the list at any
   * one time.
   *
   * @serial
   * @see #isMultipleMode()
   * @see #setMultipleMode(boolean)
   */
  multipleMode: boolean = false;
  /**
   * {@code selected} is an array that will contain
   * the indices of items that have been selected.
   *
   * @serial
   * @see #getSelectedIndexes()
   * @see #getSelectedIndex()
   */
  selected: number[] = null;
  /**
   * This variable contains the value that will be used
   * when trying to make a particular list item visible.
   *
   * @serial
   * @see #makeVisible(int)
   */
  visibleIndex: number = 0;
  actionListener: ActionListener = null;
  itemListener: ItemListener = null;
  static readonly base: string = 'list';
  static nameCounter: number = 0;
  /**
   * The default number of visible rows is 4.  A list with
   * zero rows is unusable and unsightly.
   */
  static readonly DEFAULT_VISIBLE_ROWS: number = 4;
  /**
   * The {@code List} component's
   * Serialized Data Version.
   *
   * @serial
   */
  listSerializedDataVersion: number = 0;
  $init_List() {
    this.items = new Vector();
    this.rows = 0;
    this.multipleMode = false;
    this.selected = $J.newArray(0, 0);
    this.visibleIndex = -1;
    this.listSerializedDataVersion = 1;
  }
}

$J.define(List, 'java.awt.List', { kind: 'class', ifaces: ['java.awt.ItemSelectable', 'javax.accessibility.Accessible'], sup: 'java.awt.Component', ctors: { 'int,boolean': '_List$int$boolean', 'int': '_List$int', '': '_List$' }, meths: { 'readObject(java.io.ObjectInputStream)': 'readObject$ObjectInputStream$List', 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$List', 'minimumSize()': 'minimumSize$', 'getMinimumSize()': 'getMinimumSize$', 'minimumSize(int)': 'minimumSize$int', 'getMinimumSize(int)': 'getMinimumSize$int', 'preferredSize()': 'preferredSize$', 'getPreferredSize()': 'getPreferredSize$', 'preferredSize(int)': 'preferredSize$int', 'getPreferredSize(int)': 'getPreferredSize$int', 'remove(int)': 'remove$int', 'remove(java.lang.String)': 'remove$String', 'addItem(java.lang.String,int)': 'addItem$String$int', 'add(java.lang.String,int)': 'add$String$int', 'addItem(java.lang.String)': 'addItem$String', 'add(java.lang.String)': 'add$String' } });
