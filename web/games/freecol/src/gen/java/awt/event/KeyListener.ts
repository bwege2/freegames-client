// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/event/KeyListener.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1996, 2014, Oracle and/or its affiliates. All rights reserved.
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
import { $J } from '../../../../jre/index.ts';

/**
 * The listener interface for receiving keyboard events (keystrokes).
 * The class that is interested in processing a keyboard event
 * either implements this interface (and all the methods it
 * contains) or extends the abstract {@code KeyAdapter} class
 * (overriding only the methods of interest).
 * <P>
 * The listener object created from that class is then registered with a
 * component using the component's {@code addKeyListener}
 * method. A keyboard event is generated when a key is pressed, released,
 * or typed. The relevant method in the listener
 * object is then invoked, and the {@code KeyEvent} is passed to it.
 *
 * @author Carl Quinn
 *
 * @see KeyAdapter
 * @see KeyEvent
 * @see <a href="https://docs.oracle.com/javase/tutorial/uiswing/events/keylistener.html">Tutorial: Writing a Key Listener</a>
 *
 * @since 1.1
 */
export class KeyListener {
}

$J.define(KeyListener, 'java.awt.event.KeyListener', { kind: 'interface', ifaces: ['java.util.EventListener'] });
