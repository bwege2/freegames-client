// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/text/AttributeSet.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../../jre/index.ts';

/**
 * A collection of unique attributes.  This is a read-only,
 * immutable interface.  An attribute is basically a key and
 * a value assigned to the key.  The collection may represent
 * something like a style run, a logical style, etc.  These
 * are generally used to describe features that will contribute
 * to some graphical representation such as a font.  The
 * set of possible keys is unbounded and can be anything.
 * Typically View implementations will respond to attribute
 * definitions and render something to represent the attributes.
 * <p>
 * Attributes can potentially resolve in a hierarchy.  If a
 * key doesn't resolve locally, and a resolving parent
 * exists, the key will be resolved through the parent.
 *
 * @author  Timothy Prinzing
 * @see MutableAttributeSet
 */
export class AttributeSet {
  /**
   * Attribute name used to name the collection of
   * attributes.
   */
  static NameAttribute: any = null;
  /**
   * Attribute name used to identify the resolving parent
   * set of attributes, if one is defined.
   */
  static ResolveAttribute: any = null;
}

/**
 * This interface is the type signature that is expected
 * to be present on any attribute key that contributes to
 * the determination of what font to use to render some
 * text.  This is not considered to be a closed set, the
 * definition can change across version of the platform and can
 * be amended by additional user added entries that
 * correspond to logical settings that are specific to
 * some type of content.
 */
export class AttributeSet$FontAttribute {
}

/**
 * This interface is the type signature that is expected
 * to be present on any attribute key that contributes to
 * presentation of color.
 */
export class AttributeSet$ColorAttribute {
}

/**
 * This interface is the type signature that is expected
 * to be present on any attribute key that contributes to
 * character level presentation.  This would be any attribute
 * that applies to a so-called <i>run</i> of
 * style.
 */
export class AttributeSet$CharacterAttribute {
}

/**
 * This interface is the type signature that is expected
 * to be present on any attribute key that contributes to
 * the paragraph level presentation.
 */
export class AttributeSet$ParagraphAttribute {
}

$J.define(AttributeSet, 'javax.swing.text.AttributeSet', { kind: 'interface' });
$J.define(AttributeSet$FontAttribute, 'javax.swing.text.AttributeSet$FontAttribute', { kind: 'interface' });
$J.define(AttributeSet$ColorAttribute, 'javax.swing.text.AttributeSet$ColorAttribute', { kind: 'interface' });
$J.define(AttributeSet$CharacterAttribute, 'javax.swing.text.AttributeSet$CharacterAttribute', { kind: 'interface' });
$J.define(AttributeSet$ParagraphAttribute, 'javax.swing.text.AttributeSet$ParagraphAttribute', { kind: 'interface' });
