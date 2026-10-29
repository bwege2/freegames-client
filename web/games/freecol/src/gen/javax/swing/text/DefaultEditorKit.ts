// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/text/DefaultEditorKit.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2017, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JString, SunToolkit, Toolkit } from '../../../../jre/index.ts';
import { EditorKit } from './EditorKit.ts';
import { TextAction } from './TextAction.ts';

let ComponentOrientation, Point, Rectangle, Action, SwingConstants, UIManager, AbstractDocument, BadLocationException, DefaultCaret, PlainDocument, Position$Bias, Segment, Utilities;

/**
 * This is the set of things needed by a text component
 * to be a reasonably functioning editor for some <em>type</em>
 * of text document.  This implementation provides a default
 * implementation which treats text as plain text and
 * provides a minimal set of actions for a simple editor.
 *
 * <dl>
 * <dt><b>Newlines</b>
 * <dd>
 * There are two properties which deal with newlines.  The
 * system property, <code>line.separator</code>, is defined to be
 * platform-dependent, either "\n", "\r", or "\r\n".  There is also
 * a property defined in <code>DefaultEditorKit</code>, called
 * <a href=#EndOfLineStringProperty><code>EndOfLineStringProperty</code></a>,
 * which is defined automatically when a document is loaded, to be
 * the first occurrence of any of the newline characters.
 * When a document is loaded, <code>EndOfLineStringProperty</code>
 * is set appropriately, and when the document is written back out, the
 * <code>EndOfLineStringProperty</code> is used.  But while the document
 * is in memory, the "\n" character is used to define a
 * newline, regardless of how the newline is defined when
 * the document is on disk.  Therefore, for searching purposes,
 * "\n" should always be used.  When a new document is created,
 * and the <code>EndOfLineStringProperty</code> has not been defined,
 * it will use the System property when writing out the
 * document.
 * <p>Note that <code>EndOfLineStringProperty</code> is set
 * on the <code>Document</code> using the <code>get/putProperty</code>
 * methods.  Subclasses may override this behavior.
 *
 * </dl>
 *
 * @author  Timothy Prinzing
 */
export class DefaultEditorKit extends EditorKit {
  /**
   * When reading a document if a CRLF is encountered a property
   * with this name is added and the value will be "\r\n".
   */
  static readonly EndOfLineStringProperty: string = '__EndOfLine__';
  /**
   * Name of the action to place content into the associated
   * document.  If there is a selection, it is removed before
   * the new content is added.
   * @see #getActions
   */
  static readonly insertContentAction: string = 'insert-content';
  /**
   * Name of the action to place a line/paragraph break into
   * the document.  If there is a selection, it is removed before
   * the break is added.
   * @see #getActions
   */
  static readonly insertBreakAction: string = 'insert-break';
  /**
   * Name of the action to place a tab character into
   * the document.  If there is a selection, it is removed before
   * the tab is added.
   * @see #getActions
   */
  static readonly insertTabAction: string = 'insert-tab';
  /**
   * Name of the action to delete the character of content that
   * precedes the current caret position.
   * @see #getActions
   */
  static readonly deletePrevCharAction: string = 'delete-previous';
  /**
   * Name of the action to delete the character of content that
   * follows the current caret position.
   * @see #getActions
   */
  static readonly deleteNextCharAction: string = 'delete-next';
  /**
   * Name of the action to delete the word that
   * follows the beginning of the selection.
   * @see #getActions
   * @see JTextComponent#getSelectionStart
   * @since 1.6
   */
  static readonly deleteNextWordAction: string = 'delete-next-word';
  /**
   * Name of the action to delete the word that
   * precedes the beginning of the selection.
   * @see #getActions
   * @see JTextComponent#getSelectionStart
   * @since 1.6
   */
  static readonly deletePrevWordAction: string = 'delete-previous-word';
  /**
   * Name of the action to set the editor into read-only
   * mode.
   * @see #getActions
   */
  static readonly readOnlyAction: string = 'set-read-only';
  /**
   * Name of the action to set the editor into writeable
   * mode.
   * @see #getActions
   */
  static readonly writableAction: string = 'set-writable';
  /**
   * Name of the action to cut the selected region
   * and place the contents into the system clipboard.
   * @see JTextComponent#cut
   * @see #getActions
   */
  static readonly cutAction: string = 'cut-to-clipboard';
  /**
   * Name of the action to copy the selected region
   * and place the contents into the system clipboard.
   * @see JTextComponent#copy
   * @see #getActions
   */
  static readonly copyAction: string = 'copy-to-clipboard';
  /**
   * Name of the action to paste the contents of the
   * system clipboard into the selected region, or before the
   * caret if nothing is selected.
   * @see JTextComponent#paste
   * @see #getActions
   */
  static readonly pasteAction: string = 'paste-from-clipboard';
  /**
   * Name of the action to create a beep.
   * @see #getActions
   */
  static readonly beepAction: string = 'beep';
  /**
   * Name of the action to page up vertically.
   * @see #getActions
   */
  static readonly pageUpAction: string = 'page-up';
  /**
   * Name of the action to page down vertically.
   * @see #getActions
   */
  static readonly pageDownAction: string = 'page-down';
  /**
   * Name of the action to page up vertically, and move the
   * selection.
   * @see #getActions
   */
  static readonly selectionPageUpAction: string = 'selection-page-up';
  /**
   * Name of the action to page down vertically, and move the
   * selection.
   * @see #getActions
   */
  static readonly selectionPageDownAction: string = 'selection-page-down';
  /**
   * Name of the action to page left horizontally, and move the
   * selection.
   * @see #getActions
   */
  static readonly selectionPageLeftAction: string = 'selection-page-left';
  /**
   * Name of the action to page right horizontally, and move the
   * selection.
   * @see #getActions
   */
  static readonly selectionPageRightAction: string = 'selection-page-right';
  /**
   * Name of the Action for moving the caret
   * logically forward one position.
   * @see #getActions
   */
  static readonly forwardAction: string = 'caret-forward';
  /**
   * Name of the Action for moving the caret
   * logically backward one position.
   * @see #getActions
   */
  static readonly backwardAction: string = 'caret-backward';
  /**
   * Name of the Action for extending the selection
   * by moving the caret logically forward one position.
   * @see #getActions
   */
  static readonly selectionForwardAction: string = 'selection-forward';
  /**
   * Name of the Action for extending the selection
   * by moving the caret logically backward one position.
   * @see #getActions
   */
  static readonly selectionBackwardAction: string = 'selection-backward';
  /**
   * Name of the Action for moving the caret
   * logically upward one position.
   * @see #getActions
   */
  static readonly upAction: string = 'caret-up';
  /**
   * Name of the Action for moving the caret
   * logically downward one position.
   * @see #getActions
   */
  static readonly downAction: string = 'caret-down';
  /**
   * Name of the Action for moving the caret
   * logically upward one position, extending the selection.
   * @see #getActions
   */
  static readonly selectionUpAction: string = 'selection-up';
  /**
   * Name of the Action for moving the caret
   * logically downward one position, extending the selection.
   * @see #getActions
   */
  static readonly selectionDownAction: string = 'selection-down';
  /**
   * Name of the <code>Action</code> for moving the caret
   * to the beginning of a word.
   * @see #getActions
   */
  static readonly beginWordAction: string = 'caret-begin-word';
  /**
   * Name of the Action for moving the caret
   * to the end of a word.
   * @see #getActions
   */
  static readonly endWordAction: string = 'caret-end-word';
  /**
   * Name of the <code>Action</code> for moving the caret
   * to the beginning of a word, extending the selection.
   * @see #getActions
   */
  static readonly selectionBeginWordAction: string = 'selection-begin-word';
  /**
   * Name of the Action for moving the caret
   * to the end of a word, extending the selection.
   * @see #getActions
   */
  static readonly selectionEndWordAction: string = 'selection-end-word';
  /**
   * Name of the <code>Action</code> for moving the caret to the
   * beginning of the previous word.
   * @see #getActions
   */
  static readonly previousWordAction: string = 'caret-previous-word';
  /**
   * Name of the <code>Action</code> for moving the caret to the
   * beginning of the next word.
   * @see #getActions
   */
  static readonly nextWordAction: string = 'caret-next-word';
  /**
   * Name of the <code>Action</code> for moving the selection to the
   * beginning of the previous word, extending the selection.
   * @see #getActions
   */
  static readonly selectionPreviousWordAction: string = 'selection-previous-word';
  /**
   * Name of the <code>Action</code> for moving the selection to the
   * beginning of the next word, extending the selection.
   * @see #getActions
   */
  static readonly selectionNextWordAction: string = 'selection-next-word';
  /**
   * Name of the <code>Action</code> for moving the caret
   * to the beginning of a line.
   * @see #getActions
   */
  static readonly beginLineAction: string = 'caret-begin-line';
  /**
   * Name of the <code>Action</code> for moving the caret
   * to the end of a line.
   * @see #getActions
   */
  static readonly endLineAction: string = 'caret-end-line';
  /**
   * Name of the {@code Action} for moving the caret
   * to the beginning of the current line or up to the
   * beginning of the previous line if the caret is
   * already at the beginning of the line.
   * @see #getActions
   */
  static readonly beginLineUpAction: string = 'caret-begin-line-and-up';
  /**
   * Name of the {@code Action} for moving the caret
   * to the end of the current line or down to the
   * end of the next line if the caret is already
   * at the end of the line.
   * @see #getActions
   */
  static readonly endLineDownAction: string = 'caret-end-line-and-down';
  /**
   * Name of the <code>Action</code> for moving the caret
   * to the beginning of a line, extending the selection.
   * @see #getActions
   */
  static readonly selectionBeginLineAction: string = 'selection-begin-line';
  /**
   * Name of the <code>Action</code> for moving the caret
   * to the end of a line, extending the selection.
   * @see #getActions
   */
  static readonly selectionEndLineAction: string = 'selection-end-line';
  /**
   * Name of the <code>Action</code> for moving the caret
   * to the beginning of a paragraph.
   * @see #getActions
   */
  static readonly beginParagraphAction: string = 'caret-begin-paragraph';
  /**
   * Name of the <code>Action</code> for moving the caret
   * to the end of a paragraph.
   * @see #getActions
   */
  static readonly endParagraphAction: string = 'caret-end-paragraph';
  /**
   * Name of the <code>Action</code> for moving the caret
   * to the beginning of a paragraph, extending the selection.
   * @see #getActions
   */
  static readonly selectionBeginParagraphAction: string = 'selection-begin-paragraph';
  /**
   * Name of the <code>Action</code> for moving the caret
   * to the end of a paragraph, extending the selection.
   * @see #getActions
   */
  static readonly selectionEndParagraphAction: string = 'selection-end-paragraph';
  /**
   * Name of the <code>Action</code> for moving the caret
   * to the beginning of the document.
   * @see #getActions
   */
  static readonly beginAction: string = 'caret-begin';
  /**
   * Name of the <code>Action</code> for moving the caret
   * to the end of the document.
   * @see #getActions
   */
  static readonly endAction: string = 'caret-end';
  /**
   * Name of the <code>Action</code> for moving the caret
   * to the beginning of the document.
   * @see #getActions
   */
  static readonly selectionBeginAction: string = 'selection-begin';
  /**
   * Name of the Action for moving the caret
   * to the end of the document.
   * @see #getActions
   */
  static readonly selectionEndAction: string = 'selection-end';
  /**
   * Name of the Action for selecting a word around the caret.
   * @see #getActions
   */
  static readonly selectWordAction: string = 'select-word';
  /**
   * Name of the Action for selecting a line around the caret.
   * @see #getActions
   */
  static readonly selectLineAction: string = 'select-line';
  /**
   * Name of the Action for selecting a paragraph around the caret.
   * @see #getActions
   */
  static readonly selectParagraphAction: string = 'select-paragraph';
  /**
   * Name of the Action for selecting the entire document
   * @see #getActions
   */
  static readonly selectAllAction: string = 'select-all';
  /**
   * Name of the Action for removing selection
   * @see #getActions
   */
  static readonly unselectAction: string = 'unselect';
  /**
   * Name of the Action for toggling the component's orientation.
   * @see #getActions
   */
  static readonly toggleComponentOrientationAction: string = 'toggle-componentOrientation';
  /**
   * Name of the action that is executed by default if
   * a <em>key typed event</em> is received and there
   * is no keymap entry.
   * @see #getActions
   */
  static readonly defaultKeyTypedAction: string = 'default-typed';
  static defaultActions: Action[] = null;
  /**
   * default constructor for DefaultEditorKit
   */
  _DefaultEditorKit(): this {
    this._EditorKit();
    return this;
  }
  /**
   * Gets the MIME type of the data that this
   * kit represents support for.  The default
   * is <code>text/plain</code>.
   *
   * @return the type
   */
  getContentType$(): string {
    return 'text/plain';
  }
  /**
   * Fetches a factory that is suitable for producing
   * views of any models that are produced by this
   * kit.  The default is to have the UI produce the
   * factory, so this method has no implementation.
   *
   * @return the view factory
   */
  getViewFactory(): ViewFactory {
    return null;
  }
  /**
   * Fetches the set of commands that can be used
   * on a text component that is using a model and
   * view produced by this kit.
   *
   * @return the command list
   */
  getActions$(): Action[] {
    return DefaultEditorKit.defaultActions.slice();
  }
  /**
   * Creates an uninitialized text storage model (PlainDocument)
   * that is appropriate for this type of editor.
   *
   * @return the model
   */
  createDefaultDocument$(): Document {
    return new PlainDocument()._PlainDocument$();
  }
  /**
   * Gets the input attributes for the pane. This method exists for
   * the benefit of StyledEditorKit so that the read method will
   * pick up the correct attributes to apply to inserted text.
   * This class's implementation simply returns null.
   *
   * @return null
   */
  getInputAttributes$(): MutableAttributeSet {
    return null;
  }
  /**
   * Inserts content from the given stream, which will be
   * treated as plain text.
   *
   * @param in  The stream to read from
   * @param doc The destination for the insertion.
   * @param pos The location in the document to place the
   *   content &gt;=0.
   * @throws IOException on any I/O error
   * @throws BadLocationException if pos represents an invalid
   *   location within the document.
   */
  read$Reader$Document$int(in$: Reader, doc: Document, pos: number): void {
    let buff = $J.newArray(4096, 0);
    let nch: number;
    let lastWasCR = false;
    let isCRLF = false;
    let isCR = false;
    let last: number;
    let wasEmpty = (doc.getLength() === 0);
    let attr = this.getInputAttributes$();
    while ((nch = in$.read(buff, 0, buff.length)) !== -1) {
      last = 0;
      for (let counter = 0; counter < nch; counter++) {
        switch (buff[counter]) {
          case 13 /* \u000d */:
            if (lastWasCR) {
              isCR = true;
              if (counter === 0) {
                doc.insertString(pos, '\n', attr);
                pos++;
              } else {
                (buff[(counter - 1) | 0]) = 10 /* \u000a */;
              }
            } else {
              lastWasCR = true;
            }
            break;
          case 10 /* \u000a */:
            if (lastWasCR) {
              if (counter > ((last + 1) | 0)) {
                doc.insertString(pos, JString.newString(buff, last, (counter - last - 1) | 0), attr);
                pos = (pos + (counter - last - 1)) | 0;
              }
              lastWasCR = false;
              last = counter;
              isCRLF = true;
            }
            break;
          default:
            if (lastWasCR) {
              isCR = true;
              if (counter === 0) {
                doc.insertString(pos, '\n', attr);
                pos++;
              } else {
                (buff[(counter - 1) | 0]) = 10 /* \u000a */;
              }
              lastWasCR = false;
            }
            break;
        }
      }
      if (last < nch) {
        if (lastWasCR) {
          if (last < ((nch - 1) | 0)) {
            doc.insertString(pos, JString.newString(buff, last, (nch - last - 1) | 0), attr);
            pos = (pos + (nch - last - 1)) | 0;
          }
        } else {
          doc.insertString(pos, JString.newString(buff, last, (nch - last) | 0), attr);
          pos = (pos + (nch - last)) | 0;
        }
      }
    }
    if (lastWasCR) {
      doc.insertString(pos, '\n', attr);
      isCR = true;
    }
    if (wasEmpty) {
      if (isCRLF) {
        doc.putProperty(DefaultEditorKit.EndOfLineStringProperty, '\r\n');
      } else if (isCR) {
        doc.putProperty(DefaultEditorKit.EndOfLineStringProperty, '\r');
      } else {
        doc.putProperty(DefaultEditorKit.EndOfLineStringProperty, '\n');
      }
    }
  }
  /**
   * Writes content from a document to the given stream
   * as plain text.
   *
   * @param out  The stream to write to
   * @param doc The source for the write.
   * @param pos The location in the document to fetch the
   *   content from &gt;=0.
   * @param len The amount to write out &gt;=0.
   * @throws IOException on any I/O error
   * @throws BadLocationException if pos is not within 0 and
   *   the length of the document.
   */
  write$Writer$Document$int$int(out: Writer, doc: Document, pos: number, len: number): void {
    if ((pos < 0) || (((pos + len) | 0) > doc.getLength())) {
      throw new BadLocationException()._BadLocationException('DefaultEditorKit.write', pos);
    }
    let data = new Segment()._Segment$();
    let nleft = len;
    let offs = pos;
    let endOfLineProperty = doc.getProperty(DefaultEditorKit.EndOfLineStringProperty);
    if (endOfLineProperty == null) {
      endOfLineProperty = $J.system_lineSeparator();
    }
    let endOfLine: string;
    if ($J.isa(endOfLineProperty, JString)) {
      endOfLine = endOfLineProperty;
    } else {
      endOfLine = null;
    }
    if (endOfLineProperty != null && !$J.equals(endOfLine, '\n')) {
      while (nleft > 0) {
        let n = Math.min(nleft, 4096);
        doc.getText$int$int$Segment(offs, n, data);
        let last = data.offset;
        let array = data.array;
        let maxCounter = (last + data.count_) | 0;
        for (let counter = last; counter < maxCounter; counter++) {
          if (array[counter] === 10 /* \u000a */) {
            if (counter > last) {
              out.write(array, last, (counter - last) | 0);
            }
            out.write(endOfLine);
            last = (counter + 1) | 0;
          }
        }
        if (maxCounter > last) {
          out.write(array, last, (maxCounter - last) | 0);
        }
        offs = (offs + n) | 0;
        nleft = (nleft - n) | 0;
      }
    } else {
      while (nleft > 0) {
        let n = Math.min(nleft, 4096);
        doc.getText$int$int$Segment(offs, n, data);
        out.write(data.array, data.offset, data.count_);
        offs = (offs + n) | 0;
        nleft = (nleft - n) | 0;
      }
    }
    out.flush();
  }
  static $clinit() {
    DefaultEditorKit.defaultActions = [new DefaultEditorKit$InsertContentAction()._DefaultEditorKit$InsertContentAction(), new DefaultEditorKit$DeletePrevCharAction()._DefaultEditorKit$DeletePrevCharAction(), new DefaultEditorKit$DeleteNextCharAction()._DefaultEditorKit$DeleteNextCharAction(), new DefaultEditorKit$ReadOnlyAction()._DefaultEditorKit$ReadOnlyAction(), new DefaultEditorKit$DeleteWordAction()._DefaultEditorKit$DeleteWordAction(DefaultEditorKit.deletePrevWordAction), new DefaultEditorKit$DeleteWordAction()._DefaultEditorKit$DeleteWordAction(DefaultEditorKit.deleteNextWordAction), new DefaultEditorKit$WritableAction()._DefaultEditorKit$WritableAction(), new DefaultEditorKit$CutAction()._DefaultEditorKit$CutAction(), new DefaultEditorKit$CopyAction()._DefaultEditorKit$CopyAction(), new DefaultEditorKit$PasteAction()._DefaultEditorKit$PasteAction(), new DefaultEditorKit$VerticalPageAction()._DefaultEditorKit$VerticalPageAction(DefaultEditorKit.pageUpAction, -1, false), new DefaultEditorKit$VerticalPageAction()._DefaultEditorKit$VerticalPageAction(DefaultEditorKit.pageDownAction, 1, false), new DefaultEditorKit$VerticalPageAction()._DefaultEditorKit$VerticalPageAction(DefaultEditorKit.selectionPageUpAction, -1, true), new DefaultEditorKit$VerticalPageAction()._DefaultEditorKit$VerticalPageAction(DefaultEditorKit.selectionPageDownAction, 1, true), new DefaultEditorKit$PageAction()._DefaultEditorKit$PageAction(DefaultEditorKit.selectionPageLeftAction, true, true), new DefaultEditorKit$PageAction()._DefaultEditorKit$PageAction(DefaultEditorKit.selectionPageRightAction, false, true), new DefaultEditorKit$InsertBreakAction()._DefaultEditorKit$InsertBreakAction(), new DefaultEditorKit$BeepAction()._DefaultEditorKit$BeepAction(), new DefaultEditorKit$NextVisualPositionAction()._DefaultEditorKit$NextVisualPositionAction(DefaultEditorKit.forwardAction, false, SwingConstants.EAST), new DefaultEditorKit$NextVisualPositionAction()._DefaultEditorKit$NextVisualPositionAction(DefaultEditorKit.backwardAction, false, SwingConstants.WEST), new DefaultEditorKit$NextVisualPositionAction()._DefaultEditorKit$NextVisualPositionAction(DefaultEditorKit.selectionForwardAction, true, SwingConstants.EAST), new DefaultEditorKit$NextVisualPositionAction()._DefaultEditorKit$NextVisualPositionAction(DefaultEditorKit.selectionBackwardAction, true, SwingConstants.WEST), new DefaultEditorKit$NextVisualPositionAction()._DefaultEditorKit$NextVisualPositionAction(DefaultEditorKit.upAction, false, SwingConstants.NORTH), new DefaultEditorKit$NextVisualPositionAction()._DefaultEditorKit$NextVisualPositionAction(DefaultEditorKit.downAction, false, SwingConstants.SOUTH), new DefaultEditorKit$NextVisualPositionAction()._DefaultEditorKit$NextVisualPositionAction(DefaultEditorKit.selectionUpAction, true, SwingConstants.NORTH), new DefaultEditorKit$NextVisualPositionAction()._DefaultEditorKit$NextVisualPositionAction(DefaultEditorKit.selectionDownAction, true, SwingConstants.SOUTH), new DefaultEditorKit$BeginWordAction()._DefaultEditorKit$BeginWordAction(DefaultEditorKit.beginWordAction, false), new DefaultEditorKit$EndWordAction()._DefaultEditorKit$EndWordAction(DefaultEditorKit.endWordAction, false), new DefaultEditorKit$BeginWordAction()._DefaultEditorKit$BeginWordAction(DefaultEditorKit.selectionBeginWordAction, true), new DefaultEditorKit$EndWordAction()._DefaultEditorKit$EndWordAction(DefaultEditorKit.selectionEndWordAction, true), new DefaultEditorKit$PreviousWordAction()._DefaultEditorKit$PreviousWordAction(DefaultEditorKit.previousWordAction, false), new DefaultEditorKit$NextWordAction()._DefaultEditorKit$NextWordAction(DefaultEditorKit.nextWordAction, false), new DefaultEditorKit$PreviousWordAction()._DefaultEditorKit$PreviousWordAction(DefaultEditorKit.selectionPreviousWordAction, true), new DefaultEditorKit$NextWordAction()._DefaultEditorKit$NextWordAction(DefaultEditorKit.selectionNextWordAction, true), new DefaultEditorKit$BeginLineAction()._DefaultEditorKit$BeginLineAction(DefaultEditorKit.beginLineAction, false), new DefaultEditorKit$BeginLineUpAction()._DefaultEditorKit$BeginLineUpAction(DefaultEditorKit.beginLineUpAction, false, SwingConstants.NORTH), new DefaultEditorKit$EndLineAction()._DefaultEditorKit$EndLineAction(DefaultEditorKit.endLineAction, false), new DefaultEditorKit$EndLineDownAction()._DefaultEditorKit$EndLineDownAction(DefaultEditorKit.endLineDownAction, false, SwingConstants.SOUTH), new DefaultEditorKit$BeginLineAction()._DefaultEditorKit$BeginLineAction(DefaultEditorKit.selectionBeginLineAction, true), new DefaultEditorKit$EndLineAction()._DefaultEditorKit$EndLineAction(DefaultEditorKit.selectionEndLineAction, true), new DefaultEditorKit$BeginParagraphAction()._DefaultEditorKit$BeginParagraphAction(DefaultEditorKit.beginParagraphAction, false), new DefaultEditorKit$EndParagraphAction()._DefaultEditorKit$EndParagraphAction(DefaultEditorKit.endParagraphAction, false), new DefaultEditorKit$BeginParagraphAction()._DefaultEditorKit$BeginParagraphAction(DefaultEditorKit.selectionBeginParagraphAction, true), new DefaultEditorKit$EndParagraphAction()._DefaultEditorKit$EndParagraphAction(DefaultEditorKit.selectionEndParagraphAction, true), new DefaultEditorKit$BeginAction()._DefaultEditorKit$BeginAction(DefaultEditorKit.beginAction, false), new DefaultEditorKit$EndAction()._DefaultEditorKit$EndAction(DefaultEditorKit.endAction, false), new DefaultEditorKit$BeginAction()._DefaultEditorKit$BeginAction(DefaultEditorKit.selectionBeginAction, true), new DefaultEditorKit$EndAction()._DefaultEditorKit$EndAction(DefaultEditorKit.selectionEndAction, true), new DefaultEditorKit$DefaultKeyTypedAction()._DefaultEditorKit$DefaultKeyTypedAction(), new DefaultEditorKit$InsertTabAction()._DefaultEditorKit$InsertTabAction(), new DefaultEditorKit$SelectWordAction()._DefaultEditorKit$SelectWordAction(), new DefaultEditorKit$SelectLineAction()._DefaultEditorKit$SelectLineAction(), new DefaultEditorKit$SelectParagraphAction()._DefaultEditorKit$SelectParagraphAction(), new DefaultEditorKit$SelectAllAction()._DefaultEditorKit$SelectAllAction(), new DefaultEditorKit$UnselectAction()._DefaultEditorKit$UnselectAction(), new DefaultEditorKit$ToggleComponentOrientationAction()._DefaultEditorKit$ToggleComponentOrientationAction(), new DefaultEditorKit$DumpModelAction()._DefaultEditorKit$DumpModelAction()];
  }
}

/**
 * The action that is executed by default if
 * a <em>key typed event</em> is received and there
 * is no keymap entry.  There is a variation across
 * different VM's in what gets sent as a <em>key typed</em>
 * event, and this action tries to filter out the undesired
 * events.  This filters the control characters and those
 * with the ALT modifier.  It allows Control-Alt sequences
 * through as these form legitimate unicode characters on
 * some PC keyboards.
 * <p>
 * If the event doesn't get filtered, it will try to insert
 * content into the text editor.  The content is fetched
 * from the command string of the ActionEvent.  The text
 * entry is done through the <code>replaceSelection</code>
 * method on the target text component.  This is the
 * action that will be fired for most text entry tasks.
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
 * @see DefaultEditorKit#defaultKeyTypedAction
 * @see DefaultEditorKit#getActions
 * @see Keymap#setDefaultAction
 * @see Keymap#getDefaultAction
 */
export class DefaultEditorKit$DefaultKeyTypedAction extends TextAction {
  /**
   * Creates this object with the appropriate identifier.
   */
  _DefaultEditorKit$DefaultKeyTypedAction(): this {
    this._TextAction(DefaultEditorKit.defaultKeyTypedAction);
    return this;
  }
  /**
   * The operation to perform when this action is triggered.
   *
   * @param e the action event
   */
  actionPerformed(e: ActionEvent): void {
    let target = this.getTextComponent(e);
    if ((target != null) && (e != null)) {
      if ((!target.isEditable()) || (!target.isEnabled())) {
        return;
      }
      let content = e.getActionCommand();
      let mod = e.getModifiers();
      if ((content != null) && (content.length > 0)) {
        let isPrintableMask = true;
        let tk = Toolkit.getDefaultToolkit();
        if ($J.isa(tk, SunToolkit)) {
          isPrintableMask = (tk).isPrintableCharacterModifiersMask(mod);
        }
        let c = content.charCodeAt(0);
        if ((isPrintableMask && (c >= 32) && (c !== 127)) || (!isPrintableMask && (c >= 8204) && (c <= 8205))) {
          target.replaceSelection$String(content);
        }
      }
    }
  }
}

/**
 * Places content into the associated document.
 * If there is a selection, it is removed before
 * the new content is added.
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
 * @see DefaultEditorKit#insertContentAction
 * @see DefaultEditorKit#getActions
 */
export class DefaultEditorKit$InsertContentAction extends TextAction {
  /**
   * Creates this object with the appropriate identifier.
   */
  _DefaultEditorKit$InsertContentAction(): this {
    this._TextAction(DefaultEditorKit.insertContentAction);
    return this;
  }
  /**
   * The operation to perform when this action is triggered.
   *
   * @param e the action event
   */
  actionPerformed(e: ActionEvent): void {
    let target = this.getTextComponent(e);
    if ((target != null) && (e != null)) {
      if ((!target.isEditable()) || (!target.isEnabled())) {
        UIManager.getLookAndFeel().provideErrorFeedback(target);
        return;
      }
      let content = e.getActionCommand();
      if (content != null) {
        target.replaceSelection$String(content);
      } else {
        UIManager.getLookAndFeel().provideErrorFeedback(target);
      }
    }
  }
}

/**
 * Places a line/paragraph break into the document.
 * If there is a selection, it is removed before
 * the break is added.
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
 * @see DefaultEditorKit#insertBreakAction
 * @see DefaultEditorKit#getActions
 */
export class DefaultEditorKit$InsertBreakAction extends TextAction {
  /**
   * Creates this object with the appropriate identifier.
   */
  _DefaultEditorKit$InsertBreakAction(): this {
    this._TextAction(DefaultEditorKit.insertBreakAction);
    return this;
  }
  /**
   * The operation to perform when this action is triggered.
   *
   * @param e the action event
   */
  actionPerformed(e: ActionEvent): void {
    let target = this.getTextComponent(e);
    if (target != null) {
      if ((!target.isEditable()) || (!target.isEnabled())) {
        UIManager.getLookAndFeel().provideErrorFeedback(target);
        return;
      }
      target.replaceSelection$String('\n');
    }
  }
}

/**
 * Places a tab character into the document. If there
 * is a selection, it is removed before the tab is added.
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
 * @see DefaultEditorKit#insertTabAction
 * @see DefaultEditorKit#getActions
 */
export class DefaultEditorKit$InsertTabAction extends TextAction {
  /**
   * Creates this object with the appropriate identifier.
   */
  _DefaultEditorKit$InsertTabAction(): this {
    this._TextAction(DefaultEditorKit.insertTabAction);
    return this;
  }
  /**
   * The operation to perform when this action is triggered.
   *
   * @param e the action event
   */
  actionPerformed(e: ActionEvent): void {
    let target = this.getTextComponent(e);
    if (target != null) {
      if ((!target.isEditable()) || (!target.isEnabled())) {
        UIManager.getLookAndFeel().provideErrorFeedback(target);
        return;
      }
      target.replaceSelection$String('\t');
    }
  }
}

export class DefaultEditorKit$DeletePrevCharAction extends TextAction {
  /**
   * Creates this object with the appropriate identifier.
   */
  _DefaultEditorKit$DeletePrevCharAction(): this {
    this._TextAction(DefaultEditorKit.deletePrevCharAction);
    return this;
  }
  /**
   * The operation to perform when this action is triggered.
   *
   * @param e the action event
   */
  actionPerformed(e: ActionEvent): void {
    let target = this.getTextComponent(e);
    let beep = true;
    if ((target != null) && (target.isEditable())) {
      try {
        let doc = target.getDocument();
        let caret = target.getCaret();
        let dot = caret.getDot();
        let mark = caret.getMark();
        if (dot !== mark) {
          doc.remove(Math.min(dot, mark), Math.abs((dot - mark) | 0));
          beep = false;
        } else if (dot > 0) {
          let delChars = 1;
          if (dot > 1) {
            let dotChars = doc.getText$int$int((dot - 2) | 0, 2);
            let c0 = dotChars.charCodeAt(0);
            let c1 = dotChars.charCodeAt(1);
            if (c0 >= 55296 /* \ud800 */ && c0 <= 56319 /* \udbff */ && c1 >= 56320 /* \udc00 */ && c1 <= 57343 /* \udfff */) {
              delChars = 2;
            }
          }
          doc.remove((dot - delChars) | 0, delChars);
          beep = false;
        }
      } catch ($e0) {
        if ($J.isa($e0, BadLocationException)) {
          let bl = $J.exc($e0);
        } else {
          throw $e0;
        }
      }
    }
    if (beep) {
      UIManager.getLookAndFeel().provideErrorFeedback(target);
    }
  }
}

export class DefaultEditorKit$DeleteNextCharAction extends TextAction {
  _DefaultEditorKit$DeleteNextCharAction(): this {
    this._TextAction(DefaultEditorKit.deleteNextCharAction);
    return this;
  }
  /**
   * The operation to perform when this action is triggered.
   */
  actionPerformed(e: ActionEvent): void {
    let target = this.getTextComponent(e);
    let beep = true;
    if ((target != null) && (target.isEditable())) {
      try {
        let doc = target.getDocument();
        let caret = target.getCaret();
        let dot = caret.getDot();
        let mark = caret.getMark();
        if (dot !== mark) {
          doc.remove(Math.min(dot, mark), Math.abs((dot - mark) | 0));
          beep = false;
        } else if (dot < doc.getLength()) {
          let delChars = 1;
          if (dot < ((doc.getLength() - 1) | 0)) {
            let dotChars = doc.getText$int$int(dot, 2);
            let c0 = dotChars.charCodeAt(0);
            let c1 = dotChars.charCodeAt(1);
            if (c0 >= 55296 /* \ud800 */ && c0 <= 56319 /* \udbff */ && c1 >= 56320 /* \udc00 */ && c1 <= 57343 /* \udfff */) {
              delChars = 2;
            }
          }
          doc.remove(dot, delChars);
          beep = false;
        }
      } catch ($e1) {
        if ($J.isa($e1, BadLocationException)) {
          let bl = $J.exc($e1);
        } else {
          throw $e1;
        }
      }
    }
    if (beep) {
      UIManager.getLookAndFeel().provideErrorFeedback(target);
    }
  }
}

export class DefaultEditorKit$DeleteWordAction extends TextAction {
  _DefaultEditorKit$DeleteWordAction(name: string): this {
    this._TextAction(name);
    // assert (name == deletePrevWordAction) || (name == deleteNextWordAction)
    return this;
  }
  /**
   * The operation to perform when this action is triggered.
   *
   * @param e the action event
   */
  actionPerformed(e: ActionEvent): void {
    let target = this.getTextComponent(e);
    if ((target != null) && (e != null)) {
      if ((!target.isEditable()) || (!target.isEnabled())) {
        UIManager.getLookAndFeel().provideErrorFeedback(target);
        return;
      }
      let beep = true;
      try {
        let start = target.getSelectionStart();
        let line = Utilities.getParagraphElement(target, start);
        let end: number;
        if (DefaultEditorKit.deleteNextWordAction === this.getValue$String(Action.NAME)) {
          end = Utilities.getNextWordInParagraph(target, line, start, false);
          if (end === -1) {
            let endOfLine = line.getEndOffset();
            if (start === ((endOfLine - 1) | 0)) {
              end = endOfLine;
            } else {
              end = (endOfLine - 1) | 0;
            }
          }
        } else {
          end = Utilities.getPrevWordInParagraph(target, line, start);
          if (end === -1) {
            let startOfLine = line.getStartOffset();
            if (start === startOfLine) {
              end = (startOfLine - 1) | 0;
            } else {
              end = startOfLine;
            }
          }
        }
        let offs = Math.min(start, end);
        let len = Math.abs((end - start) | 0);
        if (offs >= 0) {
          target.getDocument().remove(offs, len);
          beep = false;
        }
      } catch ($e2) {
        if ($J.isa($e2, BadLocationException)) {
          let ignore = $J.exc($e2);
        } else {
          throw $e2;
        }
      }
      if (beep) {
        UIManager.getLookAndFeel().provideErrorFeedback(target);
      }
    }
  }
}

export class DefaultEditorKit$ReadOnlyAction extends TextAction {
  _DefaultEditorKit$ReadOnlyAction(): this {
    this._TextAction(DefaultEditorKit.readOnlyAction);
    return this;
  }
  /**
   * The operation to perform when this action is triggered.
   *
   * @param e the action event
   */
  actionPerformed(e: ActionEvent): void {
    let target = this.getTextComponent(e);
    if (target != null) {
      target.setEditable(false);
    }
  }
}

export class DefaultEditorKit$WritableAction extends TextAction {
  _DefaultEditorKit$WritableAction(): this {
    this._TextAction(DefaultEditorKit.writableAction);
    return this;
  }
  /**
   * The operation to perform when this action is triggered.
   *
   * @param e the action event
   */
  actionPerformed(e: ActionEvent): void {
    let target = this.getTextComponent(e);
    if (target != null) {
      target.setEditable(true);
    }
  }
}

/**
 * Cuts the selected region and place its contents
 * into the system clipboard.
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
 * @see DefaultEditorKit#cutAction
 * @see DefaultEditorKit#getActions
 */
export class DefaultEditorKit$CutAction extends TextAction {
  /**
   * Create this object with the appropriate identifier.
   */
  _DefaultEditorKit$CutAction(): this {
    this._TextAction(DefaultEditorKit.cutAction);
    return this;
  }
  /**
   * The operation to perform when this action is triggered.
   *
   * @param e the action event
   */
  actionPerformed(e: ActionEvent): void {
    let target = this.getTextComponent(e);
    if (target != null) {
      target.cut();
    }
  }
}

/**
 * Copies the selected region and place its contents
 * into the system clipboard.
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
 * @see DefaultEditorKit#copyAction
 * @see DefaultEditorKit#getActions
 */
export class DefaultEditorKit$CopyAction extends TextAction {
  /**
   * Create this object with the appropriate identifier.
   */
  _DefaultEditorKit$CopyAction(): this {
    this._TextAction(DefaultEditorKit.copyAction);
    return this;
  }
  /**
   * The operation to perform when this action is triggered.
   *
   * @param e the action event
   */
  actionPerformed(e: ActionEvent): void {
    let target = this.getTextComponent(e);
    if (target != null) {
      target.copy();
    }
  }
}

/**
 * Pastes the contents of the system clipboard into the
 * selected region, or before the caret if nothing is
 * selected.
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
 * @see DefaultEditorKit#pasteAction
 * @see DefaultEditorKit#getActions
 */
export class DefaultEditorKit$PasteAction extends TextAction {
  /**
   * Create this object with the appropriate identifier.
   */
  _DefaultEditorKit$PasteAction(): this {
    this._TextAction(DefaultEditorKit.pasteAction);
    return this;
  }
  /**
   * The operation to perform when this action is triggered.
   *
   * @param e the action event
   */
  actionPerformed(e: ActionEvent): void {
    let target = this.getTextComponent(e);
    if (target != null) {
      target.paste();
    }
  }
}

/**
 * Creates a beep.
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
 * @see DefaultEditorKit#beepAction
 * @see DefaultEditorKit#getActions
 */
export class DefaultEditorKit$BeepAction extends TextAction {
  /**
   * Create this object with the appropriate identifier.
   */
  _DefaultEditorKit$BeepAction(): this {
    this._TextAction(DefaultEditorKit.beepAction);
    return this;
  }
  /**
   * The operation to perform when this action is triggered.
   *
   * @param e the action event
   */
  actionPerformed(e: ActionEvent): void {
    let target = this.getTextComponent(e);
    UIManager.getLookAndFeel().provideErrorFeedback(target);
  }
}

/**
 * Scrolls up/down vertically.  The select version of this action extends
 * the selection, instead of simply moving the caret.
 *
 * @see DefaultEditorKit#pageUpAction
 * @see DefaultEditorKit#pageDownAction
 * @see DefaultEditorKit#getActions
 */
export class DefaultEditorKit$VerticalPageAction extends TextAction {
  /**
   * Adjusts the Rectangle to contain the bounds of the character at
   * <code>index</code> in response to a page up.
   */
  select_: boolean = false;
  /**
   * Direction to scroll, 1 is down, -1 is up.
   */
  direction: number = 0;
  /**
   * Create this object with the appropriate identifier.
   */
  _DefaultEditorKit$VerticalPageAction(nm: string, direction: number, select: boolean): this {
    this._TextAction(nm);
    this.select_ = select;
    this.direction = direction;
    return this;
  }
  /**
   * The operation to perform when this action is triggered.
   */
  actionPerformed(e: ActionEvent): void {
    let target = this.getTextComponent(e);
    if (target != null) {
      let visible = target.getVisibleRect();
      let newVis = new Rectangle()._Rectangle$Rectangle(visible);
      let selectedIndex = target.getCaretPosition();
      let scrollAmount = Math.imul(this.direction, target.getScrollableBlockIncrement(visible, SwingConstants.VERTICAL, this.direction));
      let initialY = visible.y_;
      let caret = target.getCaret();
      let magicPosition = caret.getMagicCaretPosition();
      if (selectedIndex !== -1) {
        try {
          let dotBounds = target.modelToView(selectedIndex);
          let x = (magicPosition != null) ? magicPosition.x_ : dotBounds.x_;
          let h = dotBounds.height_;
          if (h > 0) {
            scrollAmount = Math.imul($J.idiv(scrollAmount, h), h);
          }
          newVis.y_ = this.constrainY(target, (initialY + scrollAmount) | 0, visible.height_);
          let newIndex: number;
          if (visible.contains$int$int(dotBounds.x_, dotBounds.y_)) {
            newIndex = target.viewToModel(new Point()._Point$int$int(x, this.constrainY(target, (dotBounds.y_ + scrollAmount) | 0, 0)));
          } else {
            if (this.direction === -1) {
              newIndex = target.viewToModel(new Point()._Point$int$int(x, newVis.y_));
            } else {
              newIndex = target.viewToModel(new Point()._Point$int$int(x, (newVis.y_ + visible.height_) | 0));
            }
          }
          newIndex = this.constrainOffset(target, newIndex);
          if (newIndex !== selectedIndex) {
            let newY = this.getAdjustedY(target, newVis, newIndex);
            if (this.direction === -1 && newY <= initialY || this.direction === 1 && newY >= initialY) {
              newVis.y_ = newY;
              if (this.select_) {
                target.moveCaretPosition(newIndex);
              } else {
                target.setCaretPosition(newIndex);
              }
            }
          } else {
            if (this.direction === -1 && newVis.y_ <= initialY || this.direction === 1 && newVis.y_ >= initialY) {
              newVis.y_ = initialY;
            }
          }
        } catch ($e3) {
          if ($J.isa($e3, BadLocationException)) {
            let ble = $J.exc($e3);
          } else {
            throw $e3;
          }
        }
      } else {
        newVis.y_ = this.constrainY(target, (initialY + scrollAmount) | 0, visible.height_);
      }
      if (magicPosition != null) {
        caret.setMagicCaretPosition(magicPosition);
      }
      target.scrollRectToVisible(newVis);
    }
  }
  /**
   * Makes sure <code>y</code> is a valid location in
   * <code>target</code>.
   */
  constrainY(target: JTextComponent, y: number, vis: number): number {
    if (y < 0) {
      y = 0;
    } else if (((y + vis) | 0) > target.getHeight()) {
      y = Math.max(0, (target.getHeight() - vis) | 0);
    }
    return y;
  }
  /**
   * Ensures that <code>offset</code> is a valid offset into the
   * model for <code>text</code>.
   */
  constrainOffset(text: JTextComponent, offset: number): number {
    let doc = text.getDocument();
    if ((offset !== 0) && (offset > doc.getLength())) {
      offset = doc.getLength();
    }
    if (offset < 0) {
      offset = 0;
    }
    return offset;
  }
  /**
   * Returns adjustsed {@code y} position that indicates the location to scroll to
   * after selecting <code>index</code>.
   */
  getAdjustedY(text: JTextComponent, visible: Rectangle, index: number): number {
    let result = visible.y_;
    try {
      let dotBounds = text.modelToView(index);
      if (dotBounds.y_ < visible.y_) {
        result = dotBounds.y_;
      } else {
        if ((dotBounds.y_ > ((visible.y_ + visible.height_) | 0)) || (((dotBounds.y_ + dotBounds.height_) | 0) > ((visible.y_ + visible.height_) | 0))) {
          result = (dotBounds.y_ + dotBounds.height_ - visible.height_) | 0;
        }
      }
    } catch ($e4) {
      if ($J.isa($e4, BadLocationException)) {
        let ble = $J.exc($e4);
      } else {
        throw $e4;
      }
    }
    return result;
  }
}

/**
 * Pages one view to the left or right.
 */
export class DefaultEditorKit$PageAction extends TextAction {
  select_: boolean = false;
  left: boolean = false;
  /**
   * Create this object with the appropriate identifier.
   */
  _DefaultEditorKit$PageAction(nm: string, left: boolean, select: boolean): this {
    this._TextAction(nm);
    this.select_ = select;
    this.left = left;
    return this;
  }
  /**
   * The operation to perform when this action is triggered.
   */
  actionPerformed(e: ActionEvent): void {
    let target = this.getTextComponent(e);
    if (target != null) {
      let selectedIndex: number;
      let visible = new Rectangle()._Rectangle$();
      target.computeVisibleRect(visible);
      if (this.left) {
        visible.x_ = Math.max(0, (visible.x_ - visible.width_) | 0);
      } else {
        visible.x_ = (visible.x_ + visible.width_) | 0;
      }
      selectedIndex = target.getCaretPosition();
      if (selectedIndex !== -1) {
        if (this.left) {
          selectedIndex = target.viewToModel(new Point()._Point$int$int(visible.x_, visible.y_));
        } else {
          selectedIndex = target.viewToModel(new Point()._Point$int$int((visible.x_ + visible.width_ - 1) | 0, (visible.y_ + visible.height_ - 1) | 0));
        }
        let doc = target.getDocument();
        if ((selectedIndex !== 0) && (selectedIndex > ((doc.getLength() - 1) | 0))) {
          selectedIndex = (doc.getLength() - 1) | 0;
        } else if (selectedIndex < 0) {
          selectedIndex = 0;
        }
        if (this.select_) {
          target.moveCaretPosition(selectedIndex);
        } else {
          target.setCaretPosition(selectedIndex);
        }
      }
    }
  }
}

export class DefaultEditorKit$DumpModelAction extends TextAction {
  _DefaultEditorKit$DumpModelAction(): this {
    this._TextAction('dump-model');
    return this;
  }
  actionPerformed(e: ActionEvent): void {
    let target = this.getTextComponent(e);
    if (target != null) {
      let d = target.getDocument();
      if (d instanceof AbstractDocument) {
        (d).dump($J.err);
      }
    }
  }
}

export class DefaultEditorKit$NextVisualPositionAction extends TextAction {
  select_: boolean = false;
  direction: number = 0;
  /**
   * Create this action with the appropriate identifier.
   * @param nm  the name of the action, Action.NAME.
   * @param select whether to extend the selection when
   *  changing the caret position.
   */
  _DefaultEditorKit$NextVisualPositionAction(nm: string, select: boolean, direction: number): this {
    this._TextAction(nm);
    this.select_ = select;
    this.direction = direction;
    return this;
  }
  /**
   * The operation to perform when this action is triggered.
   */
  actionPerformed(e: ActionEvent): void {
    let target = this.getTextComponent(e);
    if (target != null) {
      let caret = target.getCaret();
      let bidiCaret = (caret instanceof DefaultCaret) ? caret : null;
      let dot = caret.getDot();
      let bias = $J.newArray(1, null);
      let magicPosition = caret.getMagicCaretPosition();
      try {
        if (magicPosition == null && (this.direction === SwingConstants.NORTH || this.direction === SwingConstants.SOUTH)) {
          let r = (bidiCaret != null) ? target.getUI().modelToView$JTextComponent$int$Bias(target, dot, bidiCaret.getDotBias()) : target.modelToView(dot);
          magicPosition = new Point()._Point$int$int(r.x_, r.y_);
        }
        let filter = target.getNavigationFilter();
        if (filter != null) {
          dot = filter.getNextVisualPositionFrom(target, dot, (bidiCaret != null) ? bidiCaret.getDotBias() : Position$Bias.Forward, this.direction, bias);
        } else {
          dot = target.getUI().getNextVisualPositionFrom(target, dot, (bidiCaret != null) ? bidiCaret.getDotBias() : Position$Bias.Forward, this.direction, bias);
        }
        if (bias[0] == null) {
          bias[0] = Position$Bias.Forward;
        }
        if (bidiCaret != null) {
          if (this.select_) {
            bidiCaret.moveDot$int$Bias(dot, bias[0]);
          } else {
            bidiCaret.setDot$int$Bias(dot, bias[0]);
          }
        } else {
          if (this.select_) {
            caret.moveDot$int(dot);
          } else {
            caret.setDot$int(dot);
          }
        }
        if (magicPosition != null && (this.direction === SwingConstants.NORTH || this.direction === SwingConstants.SOUTH)) {
          target.getCaret().setMagicCaretPosition(magicPosition);
        }
      } catch ($e5) {
        if ($J.isa($e5, BadLocationException)) {
          let ex = $J.exc($e5);
        } else {
          throw $e5;
        }
      }
    }
  }
}

export class DefaultEditorKit$BeginWordAction extends TextAction {
  select_: boolean = false;
  /**
   * Create this action with the appropriate identifier.
   * @param nm  the name of the action, Action.NAME.
   * @param select whether to extend the selection when
   *  changing the caret position.
   */
  _DefaultEditorKit$BeginWordAction(nm: string, select: boolean): this {
    this._TextAction(nm);
    this.select_ = select;
    return this;
  }
  /**
   * The operation to perform when this action is triggered.
   */
  actionPerformed(e: ActionEvent): void {
    let target = this.getTextComponent(e);
    if (target != null) {
      try {
        let offs = target.getCaretPosition();
        let begOffs = Utilities.getWordStart(target, offs);
        if (this.select_) {
          target.moveCaretPosition(begOffs);
        } else {
          target.setCaretPosition(begOffs);
        }
      } catch ($e6) {
        if ($J.isa($e6, BadLocationException)) {
          let bl = $J.exc($e6);
          UIManager.getLookAndFeel().provideErrorFeedback(target);
        } else {
          throw $e6;
        }
      }
    }
  }
}

export class DefaultEditorKit$EndWordAction extends TextAction {
  select_: boolean = false;
  /**
   * Create this action with the appropriate identifier.
   * @param nm  the name of the action, Action.NAME.
   * @param select whether to extend the selection when
   *  changing the caret position.
   */
  _DefaultEditorKit$EndWordAction(nm: string, select: boolean): this {
    this._TextAction(nm);
    this.select_ = select;
    return this;
  }
  /**
   * The operation to perform when this action is triggered.
   */
  actionPerformed(e: ActionEvent): void {
    let target = this.getTextComponent(e);
    if (target != null) {
      try {
        let offs = target.getCaretPosition();
        let endOffs = Utilities.getWordEnd(target, offs);
        if (this.select_) {
          target.moveCaretPosition(endOffs);
        } else {
          target.setCaretPosition(endOffs);
        }
      } catch ($e7) {
        if ($J.isa($e7, BadLocationException)) {
          let bl = $J.exc($e7);
          UIManager.getLookAndFeel().provideErrorFeedback(target);
        } else {
          throw $e7;
        }
      }
    }
  }
}

export class DefaultEditorKit$PreviousWordAction extends TextAction {
  select_: boolean = false;
  /**
   * Create this action with the appropriate identifier.
   * @param nm  the name of the action, Action.NAME.
   * @param select whether to extend the selection when
   *  changing the caret position.
   */
  _DefaultEditorKit$PreviousWordAction(nm: string, select: boolean): this {
    this._TextAction(nm);
    this.select_ = select;
    return this;
  }
  /**
   * The operation to perform when this action is triggered.
   */
  actionPerformed(e: ActionEvent): void {
    let target = this.getTextComponent(e);
    if (target != null) {
      let offs = target.getCaretPosition();
      let failed = false;
      try {
        let curPara = Utilities.getParagraphElement(target, offs);
        offs = Utilities.getPreviousWord(target, offs);
        if (offs < curPara.getStartOffset()) {
          offs = (Utilities.getParagraphElement(target, offs).getEndOffset() - 1) | 0;
        }
      } catch ($e8) {
        if ($J.isa($e8, BadLocationException)) {
          let bl = $J.exc($e8);
          if (offs !== 0) {
            offs = 0;
          } else {
            failed = true;
          }
        } else {
          throw $e8;
        }
      }
      if (!failed) {
        if (this.select_) {
          target.moveCaretPosition(offs);
        } else {
          target.setCaretPosition(offs);
        }
      } else {
        UIManager.getLookAndFeel().provideErrorFeedback(target);
      }
    }
  }
}

export class DefaultEditorKit$NextWordAction extends TextAction {
  select_: boolean = false;
  /**
   * Create this action with the appropriate identifier.
   * @param nm  the name of the action, Action.NAME.
   * @param select whether to extend the selection when
   *  changing the caret position.
   */
  _DefaultEditorKit$NextWordAction(nm: string, select: boolean): this {
    this._TextAction(nm);
    this.select_ = select;
    return this;
  }
  /**
   * The operation to perform when this action is triggered.
   */
  actionPerformed(e: ActionEvent): void {
    let target = this.getTextComponent(e);
    if (target != null) {
      let offs = target.getCaretPosition();
      let failed = false;
      let oldOffs = offs;
      let curPara = Utilities.getParagraphElement(target, offs);
      try {
        offs = Utilities.getNextWord(target, offs);
        if (offs >= curPara.getEndOffset() && oldOffs !== ((curPara.getEndOffset() - 1) | 0)) {
          offs = (curPara.getEndOffset() - 1) | 0;
        }
      } catch ($e9) {
        if ($J.isa($e9, BadLocationException)) {
          let bl = $J.exc($e9);
          let end = target.getDocument().getLength();
          if (offs !== end) {
            if (oldOffs !== ((curPara.getEndOffset() - 1) | 0)) {
              offs = (curPara.getEndOffset() - 1) | 0;
            } else {
              offs = end;
            }
          } else {
            failed = true;
          }
        } else {
          throw $e9;
        }
      }
      if (!failed) {
        if (this.select_) {
          target.moveCaretPosition(offs);
        } else {
          target.setCaretPosition(offs);
        }
      } else {
        UIManager.getLookAndFeel().provideErrorFeedback(target);
      }
    }
  }
}

export class DefaultEditorKit$BeginLineAction extends TextAction {
  select_: boolean = false;
  /**
   * Create this action with the appropriate identifier.
   * @param nm  the name of the action, Action.NAME.
   * @param select whether to extend the selection when
   *  changing the caret position.
   */
  _DefaultEditorKit$BeginLineAction(nm: string, select: boolean): this {
    this._TextAction(nm);
    this.select_ = select;
    return this;
  }
  /**
   * The operation to perform when this action is triggered.
   */
  actionPerformed(e: ActionEvent): void {
    let target = this.getTextComponent(e);
    if (target != null) {
      try {
        let offs = target.getCaretPosition();
        let begOffs = Utilities.getRowStart(target, offs);
        if (this.select_) {
          target.moveCaretPosition(begOffs);
        } else {
          target.setCaretPosition(begOffs);
        }
      } catch ($e10) {
        if ($J.isa($e10, BadLocationException)) {
          let bl = $J.exc($e10);
          UIManager.getLookAndFeel().provideErrorFeedback(target);
        } else {
          throw $e10;
        }
      }
    }
  }
}

export class DefaultEditorKit$EndLineAction extends TextAction {
  select_: boolean = false;
  /**
   * Create this action with the appropriate identifier.
   * @param nm  the name of the action, Action.NAME.
   * @param select whether to extend the selection when
   *  changing the caret position.
   */
  _DefaultEditorKit$EndLineAction(nm: string, select: boolean): this {
    this._TextAction(nm);
    this.select_ = select;
    return this;
  }
  /**
   * The operation to perform when this action is triggered.
   */
  actionPerformed(e: ActionEvent): void {
    let target = this.getTextComponent(e);
    if (target != null) {
      try {
        let offs = target.getCaretPosition();
        let endOffs = Utilities.getRowEnd(target, offs);
        if (this.select_) {
          target.moveCaretPosition(endOffs);
        } else {
          target.setCaretPosition(endOffs);
        }
      } catch ($e11) {
        if ($J.isa($e11, BadLocationException)) {
          let bl = $J.exc($e11);
          UIManager.getLookAndFeel().provideErrorFeedback(target);
        } else {
          throw $e11;
        }
      }
    }
  }
}

export class DefaultEditorKit$EndLineDownAction extends TextAction {
  select_: boolean = false;
  direction: number = 0;
  firstTime: boolean = false;
  /**
   * Create this action with the appropriate identifier.
   * @param nm  the name of the action, Action.NAME.
   * @param select whether to extend the selection when
   *               changing the caret position.
   * @param direction  the direction to move the caret
   */
  _DefaultEditorKit$EndLineDownAction(nm: string, select: boolean, direction: number): this {
    this._TextAction(nm);
    this.select_ = select;
    this.direction = direction;
    this.firstTime = true;
    return this;
  }
  /**
   * The operation to perform when this action is triggered.
   */
  actionPerformed(e: ActionEvent): void {
    let target = this.getTextComponent(e);
    if (target != null) {
      try {
        let offs = target.getCaretPosition();
        let endOffs = Utilities.getRowEnd(target, offs);
        if (offs !== endOffs) {
          if (this.select_) {
            target.moveCaretPosition(endOffs);
          } else {
            target.setCaretPosition(endOffs);
          }
        } else {
          let caret = target.getCaret();
          let bidiCaret = (caret instanceof DefaultCaret) ? caret : null;
          let dot = caret.getDot();
          let bias = $J.newArray(1, null);
          let magicPosition = caret.getMagicCaretPosition();
          if (magicPosition == null && (this.direction === SwingConstants.NORTH || this.direction === SwingConstants.SOUTH)) {
            let r = (bidiCaret != null) ? target.getUI().modelToView$JTextComponent$int$Bias(target, dot, bidiCaret.getDotBias()) : target.modelToView(dot);
            magicPosition = new Point()._Point$int$int(r.x_, r.y_);
          }
          let filter = target.getNavigationFilter();
          if (filter != null) {
            dot = filter.getNextVisualPositionFrom(target, dot, (bidiCaret != null) ? bidiCaret.getDotBias() : Position$Bias.Forward, this.direction, bias);
          } else {
            dot = target.getUI().getNextVisualPositionFrom(target, dot, (bidiCaret != null) ? bidiCaret.getDotBias() : Position$Bias.Forward, this.direction, bias);
          }
          if (bias[0] == null) {
            bias[0] = Position$Bias.Forward;
          }
          if (bidiCaret != null) {
            if (this.select_) {
              bidiCaret.moveDot$int$Bias(dot, bias[0]);
            } else {
              bidiCaret.setDot$int$Bias(dot, bias[0]);
            }
          } else {
            if (this.select_) {
              caret.moveDot$int(dot);
            } else {
              caret.setDot$int(dot);
            }
          }
          if (magicPosition != null && (this.direction === SwingConstants.NORTH || this.direction === SwingConstants.SOUTH)) {
            target.getCaret().setMagicCaretPosition(magicPosition);
          }
          offs = target.getCaretPosition();
          endOffs = Utilities.getRowEnd(target, offs);
          if (this.select_) {
            target.moveCaretPosition(endOffs);
          } else {
            target.setCaretPosition(endOffs);
          }
        }
      } catch ($e12) {
        if ($J.isa($e12, BadLocationException)) {
          let ex = $J.exc($e12);
        } else {
          throw $e12;
        }
      }
    }
  }
}

export class DefaultEditorKit$BeginLineUpAction extends TextAction {
  select_: boolean = false;
  direction: number = 0;
  firstLine: boolean = false;
  /**
   * Create this action with the appropriate identifier.
   * @param nm  the name of the action, Action.NAME.
   * @param select whether to extend the selection when
   *               changing the caret position.
   * @param direction  the direction to move the caret
   */
  _DefaultEditorKit$BeginLineUpAction(nm: string, select: boolean, direction: number): this {
    this._TextAction(nm);
    this.select_ = select;
    this.direction = direction;
    return this;
  }
  /**
   * The operation to perform when this action is triggered.
   */
  actionPerformed(e: ActionEvent): void {
    let target = this.getTextComponent(e);
    if (target != null) {
      try {
        let offs = target.getCaretPosition();
        let begOffs = Utilities.getRowStart(target, offs);
        if (offs !== begOffs) {
          if (this.select_) {
            target.moveCaretPosition(begOffs);
          } else {
            target.setCaretPosition(begOffs);
          }
        } else {
          if (this.select_) {
            target.moveCaretPosition(begOffs);
          } else {
            target.setCaretPosition(begOffs);
          }
          let caret = target.getCaret();
          let bidiCaret = (caret instanceof DefaultCaret) ? caret : null;
          let dot = caret.getDot();
          let bias = $J.newArray(1, null);
          let magicPosition = caret.getMagicCaretPosition();
          if (magicPosition == null && (this.direction === SwingConstants.NORTH || this.direction === SwingConstants.SOUTH)) {
            let r = (bidiCaret != null) ? target.getUI().modelToView$JTextComponent$int$Bias(target, dot, bidiCaret.getDotBias()) : target.modelToView(dot);
            magicPosition = new Point()._Point$int$int(r.x_, r.y_);
          }
          let filter = target.getNavigationFilter();
          if (filter != null) {
            dot = filter.getNextVisualPositionFrom(target, dot, (bidiCaret != null) ? bidiCaret.getDotBias() : Position$Bias.Forward, this.direction, bias);
          } else {
            dot = target.getUI().getNextVisualPositionFrom(target, dot, (bidiCaret != null) ? bidiCaret.getDotBias() : Position$Bias.Forward, this.direction, bias);
          }
          if (bias[0] == null) {
            bias[0] = Position$Bias.Forward;
          }
          if (bidiCaret != null) {
            if (this.select_) {
              bidiCaret.moveDot$int$Bias(dot, bias[0]);
            } else {
              bidiCaret.setDot$int$Bias(dot, bias[0]);
            }
          } else {
            if (this.select_) {
              caret.moveDot$int(dot);
            } else {
              caret.setDot$int(dot);
            }
          }
          if (magicPosition != null && (this.direction === SwingConstants.NORTH || this.direction === SwingConstants.SOUTH)) {
            target.getCaret().setMagicCaretPosition(magicPosition);
          }
        }
      } catch ($e13) {
        if ($J.isa($e13, BadLocationException)) {
          let ex = $J.exc($e13);
        } else {
          throw $e13;
        }
      }
    }
  }
}

export class DefaultEditorKit$BeginParagraphAction extends TextAction {
  select_: boolean = false;
  /**
   * Create this action with the appropriate identifier.
   * @param nm  the name of the action, Action.NAME.
   * @param select whether to extend the selection when
   *  changing the caret position.
   */
  _DefaultEditorKit$BeginParagraphAction(nm: string, select: boolean): this {
    this._TextAction(nm);
    this.select_ = select;
    return this;
  }
  /**
   * The operation to perform when this action is triggered.
   */
  actionPerformed(e: ActionEvent): void {
    let target = this.getTextComponent(e);
    if (target != null) {
      let offs = target.getCaretPosition();
      let elem = Utilities.getParagraphElement(target, offs);
      offs = elem.getStartOffset();
      if (this.select_) {
        target.moveCaretPosition(offs);
      } else {
        target.setCaretPosition(offs);
      }
    }
  }
}

export class DefaultEditorKit$EndParagraphAction extends TextAction {
  select_: boolean = false;
  /**
   * Create this action with the appropriate identifier.
   * @param nm  the name of the action, Action.NAME.
   * @param select whether to extend the selection when
   *  changing the caret position.
   */
  _DefaultEditorKit$EndParagraphAction(nm: string, select: boolean): this {
    this._TextAction(nm);
    this.select_ = select;
    return this;
  }
  /**
   * The operation to perform when this action is triggered.
   */
  actionPerformed(e: ActionEvent): void {
    let target = this.getTextComponent(e);
    if (target != null) {
      let offs = target.getCaretPosition();
      let elem = Utilities.getParagraphElement(target, offs);
      offs = Math.min(target.getDocument().getLength(), elem.getEndOffset());
      if (this.select_) {
        target.moveCaretPosition(offs);
      } else {
        target.setCaretPosition(offs);
      }
    }
  }
}

export class DefaultEditorKit$BeginAction extends TextAction {
  select_: boolean = false;
  _DefaultEditorKit$BeginAction(nm: string, select: boolean): this {
    this._TextAction(nm);
    this.select_ = select;
    return this;
  }
  /**
   * The operation to perform when this action is triggered.
   */
  actionPerformed(e: ActionEvent): void {
    let target = this.getTextComponent(e);
    if (target != null) {
      if (this.select_) {
        target.moveCaretPosition(0);
      } else {
        target.setCaretPosition(0);
      }
    }
  }
}

export class DefaultEditorKit$EndAction extends TextAction {
  select_: boolean = false;
  _DefaultEditorKit$EndAction(nm: string, select: boolean): this {
    this._TextAction(nm);
    this.select_ = select;
    return this;
  }
  /**
   * The operation to perform when this action is triggered.
   */
  actionPerformed(e: ActionEvent): void {
    let target = this.getTextComponent(e);
    if (target != null) {
      let doc = target.getDocument();
      let dot = doc.getLength();
      if (this.select_) {
        target.moveCaretPosition(dot);
      } else {
        target.setCaretPosition(dot);
      }
    }
  }
}

export class DefaultEditorKit$SelectWordAction extends TextAction {
  start_: Action = null;
  end_: Action = null;
  /**
   * Create this action with the appropriate identifier.
   */
  _DefaultEditorKit$SelectWordAction(): this {
    this._TextAction(DefaultEditorKit.selectWordAction);
    this.start_ = new DefaultEditorKit$BeginWordAction()._DefaultEditorKit$BeginWordAction('pigdog', false);
    this.end_ = new DefaultEditorKit$EndWordAction()._DefaultEditorKit$EndWordAction('pigdog', true);
    return this;
  }
  /**
   * The operation to perform when this action is triggered.
   */
  actionPerformed(e: ActionEvent): void {
    this.start_.actionPerformed(e);
    this.end_.actionPerformed(e);
  }
}

export class DefaultEditorKit$SelectLineAction extends TextAction {
  start_: Action = null;
  end_: Action = null;
  /**
   * Create this action with the appropriate identifier.
   */
  _DefaultEditorKit$SelectLineAction(): this {
    this._TextAction(DefaultEditorKit.selectLineAction);
    this.start_ = new DefaultEditorKit$BeginLineAction()._DefaultEditorKit$BeginLineAction('pigdog', false);
    this.end_ = new DefaultEditorKit$EndLineAction()._DefaultEditorKit$EndLineAction('pigdog', true);
    return this;
  }
  /**
   * The operation to perform when this action is triggered.
   */
  actionPerformed(e: ActionEvent): void {
    this.start_.actionPerformed(e);
    this.end_.actionPerformed(e);
  }
}

export class DefaultEditorKit$SelectParagraphAction extends TextAction {
  start_: Action = null;
  end_: Action = null;
  /**
   * Create this action with the appropriate identifier.
   */
  _DefaultEditorKit$SelectParagraphAction(): this {
    this._TextAction(DefaultEditorKit.selectParagraphAction);
    this.start_ = new DefaultEditorKit$BeginParagraphAction()._DefaultEditorKit$BeginParagraphAction('pigdog', false);
    this.end_ = new DefaultEditorKit$EndParagraphAction()._DefaultEditorKit$EndParagraphAction('pigdog', true);
    return this;
  }
  /**
   * The operation to perform when this action is triggered.
   */
  actionPerformed(e: ActionEvent): void {
    this.start_.actionPerformed(e);
    this.end_.actionPerformed(e);
  }
}

export class DefaultEditorKit$SelectAllAction extends TextAction {
  /**
   * Create this action with the appropriate identifier.
   */
  _DefaultEditorKit$SelectAllAction(): this {
    this._TextAction(DefaultEditorKit.selectAllAction);
    return this;
  }
  /**
   * The operation to perform when this action is triggered.
   */
  actionPerformed(e: ActionEvent): void {
    let target = this.getTextComponent(e);
    if (target != null) {
      let doc = target.getDocument();
      target.setCaretPosition(0);
      target.moveCaretPosition(doc.getLength());
    }
  }
}

export class DefaultEditorKit$UnselectAction extends TextAction {
  /**
   * Create this action with the appropriate identifier.
   */
  _DefaultEditorKit$UnselectAction(): this {
    this._TextAction(DefaultEditorKit.unselectAction);
    return this;
  }
  /**
   * The operation to perform when this action is triggered.
   */
  actionPerformed(e: ActionEvent): void {
    let target = this.getTextComponent(e);
    if (target != null) {
      target.setCaretPosition(target.getCaretPosition());
    }
  }
}

export class DefaultEditorKit$ToggleComponentOrientationAction extends TextAction {
  /**
   * Create this action with the appropriate identifier.
   */
  _DefaultEditorKit$ToggleComponentOrientationAction(): this {
    this._TextAction(DefaultEditorKit.toggleComponentOrientationAction);
    return this;
  }
  /**
   * The operation to perform when this action is triggered.
   */
  actionPerformed(e: ActionEvent): void {
    let target = this.getTextComponent(e);
    if (target != null) {
      let last = target.getComponentOrientation();
      let next: ComponentOrientation;
      if (last === ComponentOrientation.RIGHT_TO_LEFT) {
        next = ComponentOrientation.LEFT_TO_RIGHT;
      } else {
        next = ComponentOrientation.RIGHT_TO_LEFT;
      }
      target.setComponentOrientation(next);
      target.repaint$();
    }
  }
}

$J.define(DefaultEditorKit, 'javax.swing.text.DefaultEditorKit', { kind: 'class', sup: 'javax.swing.text.EditorKit', ctors: { '': '_DefaultEditorKit' }, meths: { 'write(java.io.Writer,javax.swing.text.Document,int,int)': 'write$Writer$Document$int$int', 'read(java.io.Reader,javax.swing.text.Document,int)': 'read$Reader$Document$int', 'getInputAttributes()': 'getInputAttributes$', 'write(java.io.OutputStream,javax.swing.text.Document,int,int)': 'write$OutputStream$Document$int$int', 'read(java.io.InputStream,javax.swing.text.Document,int)': 'read$InputStream$Document$int', 'createDefaultDocument()': 'createDefaultDocument$', 'getActions()': 'getActions$', 'getContentType()': 'getContentType$' }, clinit: true, lazy: ['defaultActions'] });
$J.define(DefaultEditorKit$DefaultKeyTypedAction, 'javax.swing.text.DefaultEditorKit$DefaultKeyTypedAction', { kind: 'class', sup: 'javax.swing.text.TextAction', ctors: { '': '_DefaultEditorKit$DefaultKeyTypedAction' } });
$J.define(DefaultEditorKit$InsertContentAction, 'javax.swing.text.DefaultEditorKit$InsertContentAction', { kind: 'class', sup: 'javax.swing.text.TextAction', ctors: { '': '_DefaultEditorKit$InsertContentAction' } });
$J.define(DefaultEditorKit$InsertBreakAction, 'javax.swing.text.DefaultEditorKit$InsertBreakAction', { kind: 'class', sup: 'javax.swing.text.TextAction', ctors: { '': '_DefaultEditorKit$InsertBreakAction' } });
$J.define(DefaultEditorKit$InsertTabAction, 'javax.swing.text.DefaultEditorKit$InsertTabAction', { kind: 'class', sup: 'javax.swing.text.TextAction', ctors: { '': '_DefaultEditorKit$InsertTabAction' } });
$J.define(DefaultEditorKit$DeletePrevCharAction, 'javax.swing.text.DefaultEditorKit$DeletePrevCharAction', { kind: 'class', sup: 'javax.swing.text.TextAction', ctors: { '': '_DefaultEditorKit$DeletePrevCharAction' } });
$J.define(DefaultEditorKit$DeleteNextCharAction, 'javax.swing.text.DefaultEditorKit$DeleteNextCharAction', { kind: 'class', sup: 'javax.swing.text.TextAction', ctors: { '': '_DefaultEditorKit$DeleteNextCharAction' } });
$J.define(DefaultEditorKit$DeleteWordAction, 'javax.swing.text.DefaultEditorKit$DeleteWordAction', { kind: 'class', sup: 'javax.swing.text.TextAction', ctors: { 'java.lang.String': '_DefaultEditorKit$DeleteWordAction' } });
$J.define(DefaultEditorKit$ReadOnlyAction, 'javax.swing.text.DefaultEditorKit$ReadOnlyAction', { kind: 'class', sup: 'javax.swing.text.TextAction', ctors: { '': '_DefaultEditorKit$ReadOnlyAction' } });
$J.define(DefaultEditorKit$WritableAction, 'javax.swing.text.DefaultEditorKit$WritableAction', { kind: 'class', sup: 'javax.swing.text.TextAction', ctors: { '': '_DefaultEditorKit$WritableAction' } });
$J.define(DefaultEditorKit$CutAction, 'javax.swing.text.DefaultEditorKit$CutAction', { kind: 'class', sup: 'javax.swing.text.TextAction', ctors: { '': '_DefaultEditorKit$CutAction' } });
$J.define(DefaultEditorKit$CopyAction, 'javax.swing.text.DefaultEditorKit$CopyAction', { kind: 'class', sup: 'javax.swing.text.TextAction', ctors: { '': '_DefaultEditorKit$CopyAction' } });
$J.define(DefaultEditorKit$PasteAction, 'javax.swing.text.DefaultEditorKit$PasteAction', { kind: 'class', sup: 'javax.swing.text.TextAction', ctors: { '': '_DefaultEditorKit$PasteAction' } });
$J.define(DefaultEditorKit$BeepAction, 'javax.swing.text.DefaultEditorKit$BeepAction', { kind: 'class', sup: 'javax.swing.text.TextAction', ctors: { '': '_DefaultEditorKit$BeepAction' } });
$J.define(DefaultEditorKit$VerticalPageAction, 'javax.swing.text.DefaultEditorKit$VerticalPageAction', { kind: 'class', sup: 'javax.swing.text.TextAction', ctors: { 'java.lang.String,int,boolean': '_DefaultEditorKit$VerticalPageAction' } });
$J.define(DefaultEditorKit$PageAction, 'javax.swing.text.DefaultEditorKit$PageAction', { kind: 'class', sup: 'javax.swing.text.TextAction', ctors: { 'java.lang.String,boolean,boolean': '_DefaultEditorKit$PageAction' } });
$J.define(DefaultEditorKit$DumpModelAction, 'javax.swing.text.DefaultEditorKit$DumpModelAction', { kind: 'class', sup: 'javax.swing.text.TextAction', ctors: { '': '_DefaultEditorKit$DumpModelAction' } });
$J.define(DefaultEditorKit$NextVisualPositionAction, 'javax.swing.text.DefaultEditorKit$NextVisualPositionAction', { kind: 'class', sup: 'javax.swing.text.TextAction', ctors: { 'java.lang.String,boolean,int': '_DefaultEditorKit$NextVisualPositionAction' } });
$J.define(DefaultEditorKit$BeginWordAction, 'javax.swing.text.DefaultEditorKit$BeginWordAction', { kind: 'class', sup: 'javax.swing.text.TextAction', ctors: { 'java.lang.String,boolean': '_DefaultEditorKit$BeginWordAction' } });
$J.define(DefaultEditorKit$EndWordAction, 'javax.swing.text.DefaultEditorKit$EndWordAction', { kind: 'class', sup: 'javax.swing.text.TextAction', ctors: { 'java.lang.String,boolean': '_DefaultEditorKit$EndWordAction' } });
$J.define(DefaultEditorKit$PreviousWordAction, 'javax.swing.text.DefaultEditorKit$PreviousWordAction', { kind: 'class', sup: 'javax.swing.text.TextAction', ctors: { 'java.lang.String,boolean': '_DefaultEditorKit$PreviousWordAction' } });
$J.define(DefaultEditorKit$NextWordAction, 'javax.swing.text.DefaultEditorKit$NextWordAction', { kind: 'class', sup: 'javax.swing.text.TextAction', ctors: { 'java.lang.String,boolean': '_DefaultEditorKit$NextWordAction' } });
$J.define(DefaultEditorKit$BeginLineAction, 'javax.swing.text.DefaultEditorKit$BeginLineAction', { kind: 'class', sup: 'javax.swing.text.TextAction', ctors: { 'java.lang.String,boolean': '_DefaultEditorKit$BeginLineAction' } });
$J.define(DefaultEditorKit$EndLineAction, 'javax.swing.text.DefaultEditorKit$EndLineAction', { kind: 'class', sup: 'javax.swing.text.TextAction', ctors: { 'java.lang.String,boolean': '_DefaultEditorKit$EndLineAction' } });
$J.define(DefaultEditorKit$EndLineDownAction, 'javax.swing.text.DefaultEditorKit$EndLineDownAction', { kind: 'class', sup: 'javax.swing.text.TextAction', ctors: { 'java.lang.String,boolean,int': '_DefaultEditorKit$EndLineDownAction' } });
$J.define(DefaultEditorKit$BeginLineUpAction, 'javax.swing.text.DefaultEditorKit$BeginLineUpAction', { kind: 'class', sup: 'javax.swing.text.TextAction', ctors: { 'java.lang.String,boolean,int': '_DefaultEditorKit$BeginLineUpAction' } });
$J.define(DefaultEditorKit$BeginParagraphAction, 'javax.swing.text.DefaultEditorKit$BeginParagraphAction', { kind: 'class', sup: 'javax.swing.text.TextAction', ctors: { 'java.lang.String,boolean': '_DefaultEditorKit$BeginParagraphAction' } });
$J.define(DefaultEditorKit$EndParagraphAction, 'javax.swing.text.DefaultEditorKit$EndParagraphAction', { kind: 'class', sup: 'javax.swing.text.TextAction', ctors: { 'java.lang.String,boolean': '_DefaultEditorKit$EndParagraphAction' } });
$J.define(DefaultEditorKit$BeginAction, 'javax.swing.text.DefaultEditorKit$BeginAction', { kind: 'class', sup: 'javax.swing.text.TextAction', ctors: { 'java.lang.String,boolean': '_DefaultEditorKit$BeginAction' } });
$J.define(DefaultEditorKit$EndAction, 'javax.swing.text.DefaultEditorKit$EndAction', { kind: 'class', sup: 'javax.swing.text.TextAction', ctors: { 'java.lang.String,boolean': '_DefaultEditorKit$EndAction' } });
$J.define(DefaultEditorKit$SelectWordAction, 'javax.swing.text.DefaultEditorKit$SelectWordAction', { kind: 'class', sup: 'javax.swing.text.TextAction', ctors: { '': '_DefaultEditorKit$SelectWordAction' } });
$J.define(DefaultEditorKit$SelectLineAction, 'javax.swing.text.DefaultEditorKit$SelectLineAction', { kind: 'class', sup: 'javax.swing.text.TextAction', ctors: { '': '_DefaultEditorKit$SelectLineAction' } });
$J.define(DefaultEditorKit$SelectParagraphAction, 'javax.swing.text.DefaultEditorKit$SelectParagraphAction', { kind: 'class', sup: 'javax.swing.text.TextAction', ctors: { '': '_DefaultEditorKit$SelectParagraphAction' } });
$J.define(DefaultEditorKit$SelectAllAction, 'javax.swing.text.DefaultEditorKit$SelectAllAction', { kind: 'class', sup: 'javax.swing.text.TextAction', ctors: { '': '_DefaultEditorKit$SelectAllAction' } });
$J.define(DefaultEditorKit$UnselectAction, 'javax.swing.text.DefaultEditorKit$UnselectAction', { kind: 'class', sup: 'javax.swing.text.TextAction', ctors: { '': '_DefaultEditorKit$UnselectAction' } });
$J.define(DefaultEditorKit$ToggleComponentOrientationAction, 'javax.swing.text.DefaultEditorKit$ToggleComponentOrientationAction', { kind: 'class', sup: 'javax.swing.text.TextAction', ctors: { '': '_DefaultEditorKit$ToggleComponentOrientationAction' } });
$J.module(() => {
  ComponentOrientation = $J.load('java.awt.ComponentOrientation');
  Point = $J.load('java.awt.Point');
  Rectangle = $J.load('java.awt.Rectangle');
  Action = $J.load('javax.swing.Action');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  UIManager = $J.load('javax.swing.UIManager');
  AbstractDocument = $J.load('javax.swing.text.AbstractDocument');
  BadLocationException = $J.load('javax.swing.text.BadLocationException');
  DefaultCaret = $J.load('javax.swing.text.DefaultCaret');
  PlainDocument = $J.load('javax.swing.text.PlainDocument');
  Position$Bias = $J.load('javax.swing.text.Position$Bias');
  Segment = $J.load('javax.swing.text.Segment');
  Utilities = $J.load('javax.swing.text.Utilities');
});
