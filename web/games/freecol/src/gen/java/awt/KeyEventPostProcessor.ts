// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/KeyEventPostProcessor.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2001, 2013, Oracle and/or its affiliates. All rights reserved.
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

/**
 * A KeyEventPostProcessor cooperates with the current KeyboardFocusManager
 * in the final resolution of all unconsumed KeyEvents. KeyEventPostProcessors
 * registered with the current KeyboardFocusManager will receive KeyEvents
 * after the KeyEvents have been dispatched to and handled by their targets.
 * KeyEvents that would have been otherwise discarded because no Component in
 * the application currently owns the focus will also be forwarded to
 * registered KeyEventPostProcessors. This will allow applications to implement
 * features that require global KeyEvent post-handling, such as menu shortcuts.
 * <p>
 * Note that the KeyboardFocusManager itself implements KeyEventPostProcessor.
 * By default, the current KeyboardFocusManager will be the final
 * KeyEventPostProcessor in the chain. The current KeyboardFocusManager cannot
 * be completely deregistered as a KeyEventPostProcessor. However, if a
 * KeyEventPostProcessor reports that no further post-processing of the
 * KeyEvent should take place, the AWT will consider the event fully handled
 * and will take no additional action with regard to the event. (While it is
 * possible for client code to register the current KeyboardFocusManager as
 * a KeyEventPostProcessor one or more times, this is usually unnecessary and
 * not recommended.)
 *
 * @author David Mendenhall
 *
 * @see KeyboardFocusManager#addKeyEventPostProcessor
 * @see KeyboardFocusManager#removeKeyEventPostProcessor
 * @since 1.4
 */
export class KeyEventPostProcessor {
}

$J.define(KeyEventPostProcessor, 'java.awt.KeyEventPostProcessor', { kind: 'interface' });
