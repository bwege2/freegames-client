// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/ModalEventFilter.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2005, Oracle and/or its affiliates. All rights reserved.
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

let Component, Dialog$ModalExclusionType, Dialog$ModalityType, EventFilter$FilterAction, Window, ActionEvent, MouseEvent, WindowEvent, ModalExclude;

export class ModalEventFilter extends JObject {
  modalDialog: Dialog = null;
  disabled: boolean = false;
  _ModalEventFilter(modalDialog: Dialog): this {
    this.modalDialog = modalDialog;
    this.disabled = false;
    return this;
  }
  getModalDialog(): Dialog {
    return this.modalDialog;
  }
  acceptEvent(event: AWTEvent): EventFilter$FilterAction {
    if (this.disabled || !this.modalDialog.isVisible$()) {
      return EventFilter$FilterAction.ACCEPT;
    }
    let eventID = event.getID();
    if ((eventID >= MouseEvent.MOUSE_FIRST && eventID <= MouseEvent.MOUSE_LAST) || (eventID >= ActionEvent.ACTION_FIRST && eventID <= ActionEvent.ACTION_LAST) || eventID === WindowEvent.WINDOW_CLOSING) {
      let o = event.getSource();
      if ($J.isa(o, ModalExclude)) {
      } else if (o instanceof Component) {
        let c = o;
        while ((c != null) && !(c instanceof Window)) {
          c = c.getParent_NoClientCode();
        }
        if (c != null) {
          return this.acceptWindow(c);
        }
      }
    }
    return EventFilter$FilterAction.ACCEPT;
  }
  disable(): void {
    this.disabled = true;
  }
  compareTo(another: ModalEventFilter): number {
    let anotherDialog = another.getModalDialog();
    let c = this.modalDialog;
    while (c != null) {
      if (c === anotherDialog) {
        return 1;
      }
      c = c.getParent_NoClientCode();
    }
    c = anotherDialog;
    while (c != null) {
      if (c === this.modalDialog) {
        return -1;
      }
      c = c.getParent_NoClientCode();
    }
    let blocker = this.modalDialog.getModalBlocker();
    while (blocker != null) {
      if (blocker === anotherDialog) {
        return -1;
      }
      blocker = blocker.getModalBlocker();
    }
    blocker = anotherDialog.getModalBlocker();
    while (blocker != null) {
      if (blocker === this.modalDialog) {
        return 1;
      }
      blocker = blocker.getModalBlocker();
    }
    return this.modalDialog.getModalityType().compareTo(anotherDialog.getModalityType());
  }
  static createFilterForDialog(modalDialog: Dialog): ModalEventFilter {
    switch (modalDialog.getModalityType()) {
      case Dialog$ModalityType.DOCUMENT_MODAL:
        return new ModalEventFilter$DocumentModalEventFilter()._ModalEventFilter$DocumentModalEventFilter(modalDialog);
      case Dialog$ModalityType.APPLICATION_MODAL:
        return new ModalEventFilter$ApplicationModalEventFilter()._ModalEventFilter$ApplicationModalEventFilter(modalDialog);
      case Dialog$ModalityType.TOOLKIT_MODAL:
        return new ModalEventFilter$ToolkitModalEventFilter()._ModalEventFilter$ToolkitModalEventFilter(modalDialog);
    }
    return null;
  }
}

export class ModalEventFilter$ToolkitModalEventFilter extends ModalEventFilter {
  appContext: AppContext = null;
  _ModalEventFilter$ToolkitModalEventFilter(modalDialog: Dialog): this {
    this._ModalEventFilter(modalDialog);
    this.appContext = modalDialog.appContext;
    return this;
  }
  acceptWindow(w: Window): EventFilter$FilterAction {
    if (w.isModalExcluded(Dialog$ModalExclusionType.TOOLKIT_EXCLUDE)) {
      return EventFilter$FilterAction.ACCEPT;
    }
    if (w.appContext !== this.appContext) {
      return EventFilter$FilterAction.REJECT;
    }
    while (w != null) {
      if (w === this.modalDialog) {
        return EventFilter$FilterAction.ACCEPT_IMMEDIATELY;
      }
      w = w.getOwner();
    }
    return EventFilter$FilterAction.REJECT;
  }
}

export class ModalEventFilter$ApplicationModalEventFilter extends ModalEventFilter {
  appContext: AppContext = null;
  _ModalEventFilter$ApplicationModalEventFilter(modalDialog: Dialog): this {
    this._ModalEventFilter(modalDialog);
    this.appContext = modalDialog.appContext;
    return this;
  }
  acceptWindow(w: Window): EventFilter$FilterAction {
    if (w.isModalExcluded(Dialog$ModalExclusionType.APPLICATION_EXCLUDE)) {
      return EventFilter$FilterAction.ACCEPT;
    }
    if (w.appContext === this.appContext) {
      while (w != null) {
        if (w === this.modalDialog) {
          return EventFilter$FilterAction.ACCEPT_IMMEDIATELY;
        }
        w = w.getOwner();
      }
      return EventFilter$FilterAction.REJECT;
    }
    return EventFilter$FilterAction.ACCEPT;
  }
}

export class ModalEventFilter$DocumentModalEventFilter extends ModalEventFilter {
  documentRoot: Window = null;
  _ModalEventFilter$DocumentModalEventFilter(modalDialog: Dialog): this {
    this._ModalEventFilter(modalDialog);
    this.documentRoot = modalDialog.getDocumentRoot();
    return this;
  }
  acceptWindow(w: Window): EventFilter$FilterAction {
    if (w.isModalExcluded(Dialog$ModalExclusionType.APPLICATION_EXCLUDE)) {
      let w1 = this.modalDialog.getOwner();
      while (w1 != null) {
        if (w1 === w) {
          return EventFilter$FilterAction.REJECT;
        }
        w1 = w1.getOwner();
      }
      return EventFilter$FilterAction.ACCEPT;
    }
    while (w != null) {
      if (w === this.modalDialog) {
        return EventFilter$FilterAction.ACCEPT_IMMEDIATELY;
      }
      if (w === this.documentRoot) {
        return EventFilter$FilterAction.REJECT;
      }
      w = w.getOwner();
    }
    return EventFilter$FilterAction.ACCEPT;
  }
}

$J.define(ModalEventFilter, 'java.awt.ModalEventFilter', { kind: 'class', ifaces: ['java.awt.EventFilter'], sup: 'java.lang.Object', ctors: { 'java.awt.Dialog': '_ModalEventFilter' } });
$J.define(ModalEventFilter$ToolkitModalEventFilter, 'java.awt.ModalEventFilter$ToolkitModalEventFilter', { kind: 'class', sup: 'java.awt.ModalEventFilter', ctors: { 'java.awt.Dialog': '_ModalEventFilter$ToolkitModalEventFilter' } });
$J.define(ModalEventFilter$ApplicationModalEventFilter, 'java.awt.ModalEventFilter$ApplicationModalEventFilter', { kind: 'class', sup: 'java.awt.ModalEventFilter', ctors: { 'java.awt.Dialog': '_ModalEventFilter$ApplicationModalEventFilter' } });
$J.define(ModalEventFilter$DocumentModalEventFilter, 'java.awt.ModalEventFilter$DocumentModalEventFilter', { kind: 'class', sup: 'java.awt.ModalEventFilter', ctors: { 'java.awt.Dialog': '_ModalEventFilter$DocumentModalEventFilter' } });
$J.module(() => {
  Component = $J.load('java.awt.Component');
  Dialog$ModalExclusionType = $J.load('java.awt.Dialog$ModalExclusionType');
  Dialog$ModalityType = $J.load('java.awt.Dialog$ModalityType');
  EventFilter$FilterAction = $J.load('java.awt.EventFilter$FilterAction');
  Window = $J.load('java.awt.Window');
  ActionEvent = $J.load('java.awt.event.ActionEvent');
  MouseEvent = $J.load('java.awt.event.MouseEvent');
  WindowEvent = $J.load('java.awt.event.WindowEvent');
  ModalExclude = $J.load('sun.awt.ModalExclude');
});
