// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/PopupMenu.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1996, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { Menu } from './Menu.ts';

/**
 * A class that implements a menu which can be dynamically popped up
 * at a specified position within a component.
 * <p>
 * As the inheritance hierarchy implies, a {@code PopupMenu}
 *  can be used anywhere a {@code Menu} can be used.
 * However, if you use a {@code PopupMenu} like a {@code Menu}
 * (e.g., you add it to a {@code MenuBar}), then you <b>cannot</b>
 * call {@code show} on that {@code PopupMenu}.
 *
 * @author      Amy Fowler
 */
export class PopupMenu extends Menu {
  static readonly base: string = 'popup';
  static nameCounter: number = 0;
  isTrayIconPopup_: boolean = false;
}

$J.define(PopupMenu, 'java.awt.PopupMenu', { kind: 'class', sup: 'java.awt.Menu', ctors: { 'java.lang.String': '_PopupMenu$String', '': '_PopupMenu$' } });
