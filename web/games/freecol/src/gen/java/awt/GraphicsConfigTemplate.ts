// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/GraphicsConfigTemplate.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject } from '../../../jre/index.ts';

/**
 * The {@code GraphicsConfigTemplate} class is used to obtain a valid
 * {@link GraphicsConfiguration}.  A user instantiates one of these
 * objects and then sets all non-default attributes as desired.  The
 * {@link GraphicsDevice#getBestConfiguration} method found in the
 * {@link GraphicsDevice} class is then called with this
 * {@code GraphicsConfigTemplate}.  A valid
 * {@code GraphicsConfiguration} is returned that meets or exceeds
 * what was requested in the {@code GraphicsConfigTemplate}.
 * @see GraphicsDevice
 * @see GraphicsConfiguration
 *
 * @since       1.2
 */
export class GraphicsConfigTemplate extends JObject {
  /**
   * Value used for "Enum" (Integer) type.  States that this
   * feature is required for the {@code GraphicsConfiguration}
   * object.  If this feature is not available, do not select the
   * {@code GraphicsConfiguration} object.
   */
  static readonly REQUIRED: number = 1;
  /**
   * Value used for "Enum" (Integer) type.  States that this
   * feature is desired for the {@code GraphicsConfiguration}
   * object.  A selection with this feature is preferred over a
   * selection that does not include this feature, although both
   * selections can be considered valid matches.
   */
  static readonly PREFERRED: number = 2;
  /**
   * Value used for "Enum" (Integer) type.  States that this
   * feature is not necessary for the selection of the
   * {@code GraphicsConfiguration} object.  A selection
   * without this feature is preferred over a selection that
   * includes this feature since it is not used.
   */
  static readonly UNNECESSARY: number = 3;
}

$J.define(GraphicsConfigTemplate, 'java.awt.GraphicsConfigTemplate', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_GraphicsConfigTemplate' } });
