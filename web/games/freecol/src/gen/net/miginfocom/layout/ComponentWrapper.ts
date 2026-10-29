// @ts-nocheck
// MigLayout 5.3 core/net/miginfocom/layout/ComponentWrapper.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../../jre/index.ts';

/**
 * A class that wraps the important parts of a Component.
 * <p>
 * <b>NOTE!</b>.equals() and .hashcode() should be forwarded to the wrapped component. E.g.
 * <pre>
 * 	public int hashCode()
 * 	{
 * 		return getComponent().hashCode();
 * 	}
 *
 * 	public final boolean equals(Object o)
 * 	{
 * 		 if (o instanceof ComponentWrapper == false)
 * 			 return false;
 *
 * 		 return getComponent().equals(((ComponentWrapper) o).getComponent());
 * 	}
 * </pre>
 */
export class ComponentWrapper {
  static readonly TYPE_UNSET: number = -1;
  static readonly TYPE_UNKNOWN: number = 0;
  static readonly TYPE_CONTAINER: number = 1;
  static readonly TYPE_LABEL: number = 2;
  static readonly TYPE_TEXT_FIELD: number = 3;
  static readonly TYPE_TEXT_AREA: number = 4;
  static readonly TYPE_BUTTON: number = 5;
  static readonly TYPE_LIST: number = 6;
  static readonly TYPE_TABLE: number = 7;
  static readonly TYPE_SCROLL_PANE: number = 8;
  static readonly TYPE_IMAGE: number = 9;
  static readonly TYPE_PANEL: number = 10;
  static readonly TYPE_COMBO_BOX: number = 11;
  static readonly TYPE_SLIDER: number = 12;
  static readonly TYPE_SPINNER: number = 13;
  static readonly TYPE_PROGRESS_BAR: number = 14;
  static readonly TYPE_TREE: number = 15;
  static readonly TYPE_CHECK_BOX: number = 16;
  static readonly TYPE_SCROLL_BAR: number = 17;
  static readonly TYPE_SEPARATOR: number = 18;
  static readonly TYPE_TABBED_PANE: number = 19;
}

$J.define(ComponentWrapper, 'net.miginfocom.layout.ComponentWrapper', { kind: 'interface' });
