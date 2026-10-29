// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JEditorPane.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2024, Oracle and/or its affiliates. All rights reserved.
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
import { $J, Exception, HTMLEditorKit, HashMap, Hashtable, IOException, IndexOutOfBoundsException, JError, JObject, JString, NullPointerException, ReflectUtil, StringBuffer, StringReader, StringWriter, Thread, Throwable } from '../../../jre/index.ts';
import { JTextComponent } from './text/JTextComponent.ts';
import { JTextComponent$AccessibleJTextComponent } from './text/JTextComponent.ts';
import { DefaultEditorKit } from './text/DefaultEditorKit.ts';
import { ParagraphView } from './text/ParagraphView.ts';
import { CompositeView } from './text/CompositeView.ts';

let Dimension, AccessibleContext, JComponent, JTextArea, JViewport, LayoutFocusTraversalPolicy, LookAndFeel, SwingUtilities, UIManager, HyperlinkListener, AbstractDocument, BadLocationException, BoxView, GlyphView, StyleConstants, StyledEditorKit, View, WrappedPlainView;

/**
 * A text component to edit various kinds of content.
 * You can find how-to information and examples of using editor panes in
 * <a href="https://docs.oracle.com/javase/tutorial/uiswing/components/text.html">Using Text Components</a>,
 * a section in <em>The Java Tutorial.</em>
 *
 * <p>
 * This component uses implementations of the
 * <code>EditorKit</code> to accomplish its behavior. It effectively
 * morphs into the proper kind of text editor for the kind
 * of content it is given.  The content type that editor is bound
 * to at any given time is determined by the <code>EditorKit</code> currently
 * installed.  If the content is set to a new URL, its type is used
 * to determine the <code>EditorKit</code> that should be used to
 * load the content.
 * <p>
 * By default, the following types of content are known:
 * <dl>
 * <dt><b>text/plain</b>
 * <dd>Plain text, which is the default the type given isn't
 * recognized.  The kit used in this case is an extension of
 * <code>DefaultEditorKit</code> that produces a wrapped plain text view.
 * <dt><b>text/html</b>
 * <dd>HTML text.  The kit used in this case is the class
 * <code>javax.swing.text.html.HTMLEditorKit</code>
 * which provides HTML 3.2 support.
 * <dt><b>text/rtf</b>
 * <dd>RTF text.  The kit used in this case is the class
 * <code>javax.swing.text.rtf.RTFEditorKit</code>
 * which provides a limited support of the Rich Text Format.
 * </dl>
 * <p>
 * There are several ways to load content into this component.
 * <ol>
 * <li>
 * The {@link #setText setText} method can be used to initialize
 * the component from a string.  In this case the current
 * <code>EditorKit</code> will be used, and the content type will be
 * expected to be of this type.
 * <li>
 * The {@link #read read} method can be used to initialize the
 * component from a <code>Reader</code>.  Note that if the content type is HTML,
 * relative references (e.g. for things like images) can't be resolved
 * unless the &lt;base&gt; tag is used or the <em>Base</em> property
 * on <code>HTMLDocument</code> is set.
 * In this case the current <code>EditorKit</code> will be used,
 * and the content type will be expected to be of this type.
 * <li>
 * The {@link #setPage setPage} method can be used to initialize
 * the component from a URL.  In this case, the content type will be
 * determined from the URL, and the registered <code>EditorKit</code>
 * for that content type will be set.
 * </ol>
 * <p>
 * Some kinds of content may provide hyperlink support by generating
 * hyperlink events.  The HTML <code>EditorKit</code> will generate
 * hyperlink events if the <code>JEditorPane</code> is <em>not editable</em>
 * (<code>JEditorPane.setEditable(false);</code> has been called).
 * If HTML frames are embedded in the document, the typical response would be
 * to change a portion of the current document.  The following code
 * fragment is a possible hyperlink listener implementation, that treats
 * HTML frame events specially, and simply displays any other activated
 * hyperlinks.
 * <pre>
 *
 * &nbsp;    class Hyperactive implements HyperlinkListener {
 * &nbsp;
 * &nbsp;        public void hyperlinkUpdate(HyperlinkEvent e) {
 * &nbsp;            if (e.getEventType() == HyperlinkEvent.EventType.ACTIVATED) {
 * &nbsp;                JEditorPane pane = (JEditorPane) e.getSource();
 * &nbsp;                if (e instanceof HTMLFrameHyperlinkEvent) {
 * &nbsp;                    HTMLFrameHyperlinkEvent  evt = (HTMLFrameHyperlinkEvent)e;
 * &nbsp;                    HTMLDocument doc = (HTMLDocument)pane.getDocument();
 * &nbsp;                    doc.processHTMLFrameHyperlinkEvent(evt);
 * &nbsp;                } else {
 * &nbsp;                    try {
 * &nbsp;                        pane.setPage(e.getURL());
 * &nbsp;                    } catch (Throwable t) {
 * &nbsp;                        t.printStackTrace();
 * &nbsp;                    }
 * &nbsp;                }
 * &nbsp;            }
 * &nbsp;        }
 * &nbsp;    }
 *
 * </pre>
 * <p>
 * For information on customizing how <b>text/html</b> is rendered please see
 * {@link #W3C_LENGTH_UNITS} and {@link #HONOR_DISPLAY_PROPERTIES}
 * <p>
 * Culturally dependent information in some documents is handled through
 * a mechanism called character encoding.  Character encoding is an
 * unambiguous mapping of the members of a character set (letters, ideographs,
 * digits, symbols, or control functions) to specific numeric code values. It
 * represents the way the file is stored. Example character encodings are
 * ISO-8859-1, ISO-8859-5, Shift-jis, Euc-jp, and UTF-8. When the file is
 * passed to an user agent (<code>JEditorPane</code>) it is converted to
 * the document character set (ISO-10646 aka Unicode).
 * <p>
 * There are multiple ways to get a character set mapping to happen
 * with <code>JEditorPane</code>.
 * <ol>
 * <li>
 * One way is to specify the character set as a parameter of the MIME
 * type.  This will be established by a call to the
 * {@link #setContentType setContentType} method.  If the content
 * is loaded by the {@link #setPage setPage} method the content
 * type will have been set according to the specification of the URL.
 * It the file is loaded directly, the content type would be expected to
 * have been set prior to loading.
 * <li>
 * Another way the character set can be specified is in the document itself.
 * This requires reading the document prior to determining the character set
 * that is desired.  To handle this, it is expected that the
 * <code>EditorKit</code>.read operation throw a
 * <code>ChangedCharSetException</code> which will
 * be caught.  The read is then restarted with a new Reader that uses
 * the character set specified in the <code>ChangedCharSetException</code>
 * (which is an <code>IOException</code>).
 * </ol>
 *
 * <dl>
 * <dt><b>Newlines</b>
 * <dd>
 * For a discussion on how newlines are handled, see
 * <a href="text/DefaultEditorKit.html">DefaultEditorKit</a>.
 * </dl>
 *
 * <p>
 * <strong>Warning:</strong> Swing is not thread safe. For more
 * information see <a
 * href="package-summary.html#threading">Swing's Threading
 * Policy</a>.
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
 * @since 1.2
 */
export class JEditorPane extends JTextComponent {
  pageLoader: SwingWorker<URL, any> = null;
  /**
   * Current content binding of the editor.
   */
  kit: EditorKit = null;
  isUserSetEditorKit: boolean = false;
  pageProperties: Hashtable<string, any> = null;
  /**
   * Should be kept in sync with javax.swing.text.html.FormView counterpart.
   */
  static readonly PostDataProperty: string = 'javax.swing.JEditorPane.postdata';
  /**
   * Table of registered type handlers for this editor.
   */
  typeHandlers: Hashtable<string, EditorKit> = null;
  static kitRegistryKey: any = null;
  static kitTypeRegistryKey: any = null;
  static kitLoaderRegistryKey: any = null;
  /**
   * @see #getUIClassID
   * @see #readObject
   */
  static readonly uiClassID: string = 'EditorPaneUI';
  /**
   * Key for a client property used to indicate whether
   * <a href="https://www.w3.org/TR/CSS22/syndata.html#length-units">
   * w3c compliant</a> length units are used for html rendering.
   * <p>
   * By default this is not enabled; to enable
   * it set the client {@link #putClientProperty property} with this name
   * to <code>Boolean.TRUE</code>.
   *
   * @since 1.5
   */
  static readonly W3C_LENGTH_UNITS: string = 'JEditorPane.w3cLengthUnits';
  /**
   * Key for a client property used to indicate whether
   * the default font and foreground color from the component are
   * used if a font or foreground color is not specified in the styled
   * text.
   * <p>
   * The default varies based on the look and feel;
   * to enable it set the client {@link #putClientProperty property} with
   * this name to <code>Boolean.TRUE</code>.
   *
   * @since 1.5
   */
  static readonly HONOR_DISPLAY_PROPERTIES: string = 'JEditorPane.honorDisplayProperties';
  static defaultEditorKitMap: JMap<string, string> = null;
  /**
   * Creates a new <code>JEditorPane</code>.
   * The document model is set to <code>null</code>.
   */
  _JEditorPane$(): this {
    this._JTextComponent();
    this.setFocusCycleRoot(true);
    this.setFocusTraversalPolicy(new (JEditorPane$1())().$o(this)._LayoutFocusTraversalPolicy$());
    LookAndFeel.installProperty(this, 'focusTraversalKeysForward', JComponent.getManagingFocusForwardTraversalKeys());
    LookAndFeel.installProperty(this, 'focusTraversalKeysBackward', JComponent.getManagingFocusBackwardTraversalKeys());
    return this;
  }
  /**
   * Creates a <code>JEditorPane</code> that has been initialized
   * to the given text.  This is a convenience constructor that calls the
   * <code>setContentType</code> and <code>setText</code> methods.
   *
   * @param type mime type of the given text
   * @param text the text to initialize with; may be <code>null</code>
   * @throws NullPointerException if the <code>type</code> parameter
   *          is <code>null</code>
   */
  _JEditorPane$String$String(type$: string, text: string): this {
    this._JEditorPane$();
    this.setContentType(type$);
    this.setText(text);
    return this;
  }
  /**
   * Adds a hyperlink listener for notification of any changes, for example
   * when a link is selected and entered.
   *
   * @param listener the listener
   */
  addHyperlinkListener(listener: HyperlinkListener): void {
    this.listenerList.add($J.cls(HyperlinkListener), listener);
  }
  /**
   * Gets the class ID for the UI.
   *
   * @return the string "EditorPaneUI"
   * @see JComponent#getUIClassID
   * @see UIDefaults#getUI
   */
  getUIClassID(): string {
    return JEditorPane.uiClassID;
  }
  /**
   * Creates the default editor kit (<code>PlainEditorKit</code>) for when
   * the component is first created.
   *
   * @return the editor kit
   */
  createDefaultEditorKit(): EditorKit {
    return new JEditorPane$PlainEditorKit()._JEditorPane$PlainEditorKit();
  }
  /**
   * Fetches the currently installed kit for handling content.
   * <code>createDefaultEditorKit</code> is called to set up a default
   * if necessary.
   *
   * @return the editor kit
   */
  getEditorKit(): EditorKit {
    if (this.kit == null) {
      this.kit = this.createDefaultEditorKit();
      this.isUserSetEditorKit = false;
    }
    return this.kit;
  }
  /**
   * Gets the type of content that this editor
   * is currently set to deal with.  This is
   * defined to be the type associated with the
   * currently installed <code>EditorKit</code>.
   *
   * @return the content type, <code>null</code> if no editor kit set
   */
  getContentType(): string {
    return (this.kit != null) ? this.kit.getContentType$() : null;
  }
  /**
   * Sets the type of content that this editor
   * handles.  This calls <code>getEditorKitForContentType</code>,
   * and then <code>setEditorKit</code> if an editor kit can
   * be successfully located.  This is mostly convenience method
   * that can be used as an alternative to calling
   * <code>setEditorKit</code> directly.
   * <p>
   * If there is a charset definition specified as a parameter
   * of the content type specification, it will be used when
   * loading input streams using the associated <code>EditorKit</code>.
   * For example if the type is specified as
   * <code>text/html; charset=EUC-JP</code> the content
   * will be loaded using the <code>EditorKit</code> registered for
   * <code>text/html</code> and the Reader provided to
   * the <code>EditorKit</code> to load unicode into the document will
   * use the <code>EUC-JP</code> charset for translating
   * to unicode.  If the type is not recognized, the content
   * will be loaded using the <code>EditorKit</code> registered
   * for plain text, <code>text/plain</code>.
   *
   * @param type the non-<code>null</code> mime type for the content editing
   *   support
   * @see #getContentType
   * @throws NullPointerException if the <code>type</code> parameter
   *          is <code>null</code>
   */
  setContentType(type$: string): void {
    let parm = type$.indexOf(String.fromCharCode(59 /* ';' */));
    if (parm > -1) {
      let paramList = type$.substring(parm);
      type$ = JString.trim(type$.substring(0, parm));
      if (type$.toLowerCase().startsWith('text/')) {
        this.setCharsetFromContentTypeParameters(paramList);
      }
    }
    if ((this.kit == null) || (!$J.equals(type$, this.kit.getContentType$())) || !this.isUserSetEditorKit) {
      let k = this.getEditorKitForContentType(type$);
      if (k != null && k !== this.kit) {
        this.setEditorKit(k);
        this.isUserSetEditorKit = false;
      }
    }
  }
  /**
   * This method gets the charset information specified as part
   * of the content type in the http header information.
   */
  setCharsetFromContentTypeParameters(paramlist: string): void {
    let charset: string;
    try {
      let semi = paramlist.indexOf(String.fromCharCode(59 /* ';' */));
      if (semi > -1 && semi < ((paramlist.length - 1) | 0)) {
        paramlist = paramlist.substring((semi + 1) | 0);
      }
      if (paramlist.length > 0) {
        let hdrParser = new JEditorPane$HeaderParser()._JEditorPane$HeaderParser(paramlist);
        charset = hdrParser.findValue$String('charset');
        if (charset != null) {
          this.putClientProperty('charset', charset);
        }
      }
    } catch ($e0) {
      if ($J.isa($e0, IndexOutOfBoundsException) || $J.isa($e0, NullPointerException)) {
        let e = $J.exc($e0);
      } else if ($J.isa($e0, Exception)) {
        let e = $J.exc($e0);
        $J.err.println('JEditorPane.getCharsetFromContentTypeParameters failed on: ' + paramlist);
        e.printStackTrace();
      } else {
        throw $e0;
      }
    }
  }
  /**
   * Sets the currently installed kit for handling
   * content.  This is the bound property that
   * establishes the content type of the editor.
   * Any old kit is first deinstalled, then if kit is
   * non-<code>null</code>,
   * the new kit is installed, and a default document created for it.
   * A <code>PropertyChange</code> event ("editorKit") is always fired when
   * <code>setEditorKit</code> is called.
   * <p>
   * <em>NOTE: This has the side effect of changing the model,
   * because the <code>EditorKit</code> is the source of how a
   * particular type
   * of content is modeled.  This method will cause <code>setDocument</code>
   * to be called on behalf of the caller to ensure integrity
   * of the internal state.</em>
   *
   * @param kit the desired editor behavior
   * @see #getEditorKit
   */
  setEditorKit(kit: EditorKit): void {
    let old = this.kit;
    this.isUserSetEditorKit = true;
    if (old != null) {
      old.deinstall$JEditorPane(this);
    }
    this.kit = kit;
    if (this.kit != null) {
      this.kit.install$JEditorPane(this);
      this.setDocument(this.kit.createDefaultDocument$());
    }
    this.firePropertyChange$String$Object$Object('editorKit', old, kit);
  }
  /**
   * Fetches the editor kit to use for the given type
   * of content.  This is called when a type is requested
   * that doesn't match the currently installed type.
   * If the component doesn't have an <code>EditorKit</code> registered
   * for the given type, it will try to create an
   * <code>EditorKit</code> from the default <code>EditorKit</code> registry.
   * If that fails, a <code>PlainEditorKit</code> is used on the
   * assumption that all text documents can be represented
   * as plain text.
   * <p>
   * This method can be reimplemented to use some
   * other kind of type registry.  This can
   * be reimplemented to use the Java Activation
   * Framework, for example.
   *
   * @param type the non-<code>null</code> content type
   * @return the editor kit
   */
  getEditorKitForContentType(type$: string): EditorKit {
    if (this.typeHandlers == null) {
      this.typeHandlers = new Hashtable(3);
    }
    let k = this.typeHandlers.get(type$);
    if (k == null) {
      k = JEditorPane.createEditorKitForContentType(type$);
      if (k != null) {
        this.setEditorKitForContentType(type$, k);
      }
    }
    if (k == null) {
      k = this.createDefaultEditorKit();
    }
    return k;
  }
  /**
   * Directly sets the editor kit to use for the given type.  A
   * look-and-feel implementation might use this in conjunction
   * with <code>createEditorKitForContentType</code> to install handlers for
   * content types with a look-and-feel bias.
   *
   * @param type the non-<code>null</code> content type
   * @param k the editor kit to be set
   */
  setEditorKitForContentType(type$: string, k: EditorKit): void {
    if (this.typeHandlers == null) {
      this.typeHandlers = new Hashtable(3);
    }
    this.typeHandlers.put(type$, k);
  }
  /**
   * Replaces the currently selected content with new content
   * represented by the given string.  If there is no selection
   * this amounts to an insert of the given text.  If there
   * is no replacement text (i.e. the content string is empty
   * or <code>null</code>) this amounts to a removal of the
   * current selection.  The replacement text will have the
   * attributes currently defined for input.  If the component is not
   * editable, beep and return.
   *
   * @param content  the content to replace the selection with.  This
   *   value can be <code>null</code>
   */
  replaceSelection$String(content: string): void {
    if (!this.isEditable()) {
      UIManager.getLookAndFeel().provideErrorFeedback(this);
      return;
    }
    let kit = this.getEditorKit();
    if (kit instanceof StyledEditorKit) {
      try {
        let doc = this.getDocument();
        let caret = this.getCaret();
        let composedTextSaved = this.saveComposedText(caret.getDot());
        let p0 = Math.min(caret.getDot(), caret.getMark());
        let p1 = Math.max(caret.getDot(), caret.getMark());
        if (doc instanceof AbstractDocument) {
          (doc).replace(p0, (p1 - p0) | 0, content, (kit).getInputAttributes$());
        } else {
          if (p0 !== p1) {
            doc.remove(p0, (p1 - p0) | 0);
          }
          if (content != null && content.length > 0) {
            doc.insertString(p0, content, (kit).getInputAttributes$());
          }
        }
        if (composedTextSaved) {
          this.restoreComposedText();
        }
      } catch ($e1) {
        if ($J.isa($e1, BadLocationException)) {
          let e = $J.exc($e1);
          UIManager.getLookAndFeel().provideErrorFeedback(this);
        } else {
          throw $e1;
        }
      }
    } else {
      super.replaceSelection$String(content);
    }
  }
  /**
   * Creates a handler for the given type from the default registry
   * of editor kits.  The registry is created if necessary.  If the
   * registered class has not yet been loaded, an attempt
   * is made to dynamically load the prototype of the kit for the
   * given type.  If the type was registered with a <code>ClassLoader</code>,
   * that <code>ClassLoader</code> will be used to load the prototype.
   * If there was no registered <code>ClassLoader</code>,
   * <code>Class.forName</code> will be used to load the prototype.
   * <p>
   * Once a prototype <code>EditorKit</code> instance is successfully
   * located, it is cloned and the clone is returned.
   *
   * @param type the content type
   * @return the editor kit, or <code>null</code> if there is nothing
   *   registered for the given type
   */
  static createEditorKitForContentType(type$: string): EditorKit {
    let kitRegistry = JEditorPane.getKitRegisty();
    let k = kitRegistry.get(type$);
    if (k == null) {
      let classname = JEditorPane.getKitTypeRegistry().get(type$);
      let loader = JEditorPane.getKitLoaderRegistry().get(type$);
      try {
        let c: JClass<any>;
        if (loader != null) {
          ReflectUtil.checkPackageAccess(classname);
          c = loader.loadClass(classname);
        } else {
          c = SwingUtilities.loadSystemClass(classname);
        }
        k = c.newInstance();
        kitRegistry.put(type$, k);
      } catch ($e2) {
        {
          let e = $J.exc($e2);
          k = null;
        }
      }
    }
    if (k != null) {
      return k.clone();
    }
    return null;
  }
  /**
   * Establishes the default bindings of <code>type</code> to
   * <code>classname</code>.
   * The class will be dynamically loaded later when actually
   * needed, and can be safely changed before attempted uses
   * to avoid loading unwanted classes.  The prototype
   * <code>EditorKit</code> will be loaded with <code>Class.forName</code>
   * when registered with this method.
   *
   * @param type the non-<code>null</code> content type
   * @param classname the class to load later
   */
  static registerEditorKitForContentType$String$String(type$: string, classname: string): void {
    JEditorPane.registerEditorKitForContentType$String$String$ClassLoader(type$, classname, Thread.currentThread().getContextClassLoader());
  }
  /**
   * Establishes the default bindings of <code>type</code> to
   * <code>classname</code>.
   * The class will be dynamically loaded later when actually
   * needed using the given <code>ClassLoader</code>,
   * and can be safely changed
   * before attempted uses to avoid loading unwanted classes.
   *
   * @param type the non-<code>null</code> content type
   * @param classname the class to load later
   * @param loader the <code>ClassLoader</code> to use to load the name
   */
  static registerEditorKitForContentType$String$String$ClassLoader(type$: string, classname: string, loader: ClassLoader): void {
    JEditorPane.getKitTypeRegistry().put(type$, classname);
    if (loader != null) {
      JEditorPane.getKitLoaderRegistry().put(type$, loader);
    } else {
      JEditorPane.getKitLoaderRegistry().remove(type$);
    }
    JEditorPane.getKitRegisty().remove(type$);
  }
  /**
   * Returns the currently registered {@code EditorKit} class name for the
   * type {@code type}.
   *
   * @param type  the non-{@code null} content type
   * @return a {@code String} containing the {@code EditorKit} class name
   *         for {@code type}
   * @since 1.3
   */
  static getEditorKitClassNameForContentType(type$: string): string {
    return JEditorPane.getKitTypeRegistry().get(type$);
  }
  static getKitTypeRegistry(): Hashtable<string, string> {
    JEditorPane.loadDefaultKitsIfNecessary();
    let tmp = SwingUtilities.appContextGet(JEditorPane.kitTypeRegistryKey);
    return tmp;
  }
  static getKitLoaderRegistry(): Hashtable<string, ClassLoader> {
    JEditorPane.loadDefaultKitsIfNecessary();
    let tmp = SwingUtilities.appContextGet(JEditorPane.kitLoaderRegistryKey);
    return tmp;
  }
  static getKitRegisty(): Hashtable<string, EditorKit> {
    let ht = SwingUtilities.appContextGet(JEditorPane.kitRegistryKey);
    if (ht == null) {
      ht = new Hashtable(3);
      SwingUtilities.appContextPut(JEditorPane.kitRegistryKey, ht);
    }
    return ht;
  }
  /**
   * This is invoked every time the registries are accessed. Loading
   * is done this way instead of via a static as the static is only
   * called once when running in plugin resulting in the entries only
   * appearing in the first applet.
   */
  static loadDefaultKitsIfNecessary(): void {
    if (SwingUtilities.appContextGet(JEditorPane.kitTypeRegistryKey) == null) {
      {
        if (JEditorPane.defaultEditorKitMap.size() === 0) {
          JEditorPane.defaultEditorKitMap.put('text/plain', 'javax.swing.JEditorPane$PlainEditorKit');
          JEditorPane.defaultEditorKitMap.put('text/html', 'javax.swing.text.html.HTMLEditorKit');
          JEditorPane.defaultEditorKitMap.put('text/rtf', 'javax.swing.text.rtf.RTFEditorKit');
          JEditorPane.defaultEditorKitMap.put('application/rtf', 'javax.swing.text.rtf.RTFEditorKit');
        }
      }
      let ht = new Hashtable();
      SwingUtilities.appContextPut(JEditorPane.kitTypeRegistryKey, ht);
      ht = new Hashtable();
      SwingUtilities.appContextPut(JEditorPane.kitLoaderRegistryKey, ht);
      for (const $it3 = JEditorPane.defaultEditorKitMap.keySet().iterator(); $it3.hasNext(); ) {
        let key = $it3.next();
        JEditorPane.registerEditorKitForContentType$String$String(key, JEditorPane.defaultEditorKitMap.get(key));
      }
    }
  }
  /**
   * Returns the preferred size for the <code>JEditorPane</code>.
   * The preferred size for <code>JEditorPane</code> is slightly altered
   * from the preferred size of the superclass.  If the size
   * of the viewport has become smaller than the minimum size
   * of the component, the scrollable definition for tracking
   * width or height will turn to false.  The default viewport
   * layout will give the preferred size, and that is not desired
   * in the case where the scrollable is tracking.  In that case
   * the <em>normal</em> preferred size is adjusted to the
   * minimum size.  This allows things like HTML tables to
   * shrink down to their minimum size and then be laid out at
   * their minimum size, refusing to shrink any further.
   *
   * @return a <code>Dimension</code> containing the preferred size
   */
  getPreferredSize$(): Dimension {
    let d = super.getPreferredSize$();
    let parent = SwingUtilities.getUnwrappedParent(this);
    if (parent instanceof JViewport) {
      let port = parent;
      let ui = this.getUI();
      let prefWidth = d.width_;
      let prefHeight = d.height_;
      if (!this.getScrollableTracksViewportWidth()) {
        let w = port.getWidth();
        let min = ui.getMinimumSize(this);
        if (w !== 0 && w < min.width_) {
          prefWidth = min.width_;
        }
      }
      if (!this.getScrollableTracksViewportHeight()) {
        let h = port.getHeight();
        let min = ui.getMinimumSize(this);
        if (h !== 0 && h < min.height_) {
          prefHeight = min.height_;
        }
      }
      if (prefWidth !== d.width_ || prefHeight !== d.height_) {
        d = new Dimension()._Dimension$int$int(prefWidth, prefHeight);
      }
    }
    return d;
  }
  /**
   * Sets the text of this <code>TextComponent</code> to the specified
   * content,
   * which is expected to be in the format of the content type of
   * this editor.  For example, if the type is set to <code>text/html</code>
   * the string should be specified in terms of HTML.
   * <p>
   * This is implemented to remove the contents of the current document,
   * and replace them by parsing the given string using the current
   * <code>EditorKit</code>.  This gives the semantics of the
   * superclass by not changing
   * out the model, while supporting the content type currently set on
   * this component.  The assumption is that the previous content is
   * relatively
   * small, and that the previous content doesn't have side effects.
   * Both of those assumptions can be violated and cause undesirable results.
   * To avoid this, create a new document,
   * <code>getEditorKit().createDefaultDocument()</code>, and replace the
   * existing <code>Document</code> with the new one. You are then assured the
   * previous <code>Document</code> won't have any lingering state.
   * <ol>
   * <li>
   * Leaving the existing model in place means that the old view will be
   * torn down, and a new view created, where replacing the document would
   * avoid the tear down of the old view.
   * <li>
   * Some formats (such as HTML) can install things into the document that
   * can influence future contents.  HTML can have style information embedded
   * that would influence the next content installed unexpectedly.
   * </ol>
   * <p>
   * An alternative way to load this component with a string would be to
   * create a StringReader and call the read method.  In this case the model
   * would be replaced after it was initialized with the contents of the
   * string.
   *
   * @param t the new text to be set; if <code>null</code> the old
   *    text will be deleted
   * @see #getText
   */
  setText(t: string): void {
    try {
      let doc = this.getDocument();
      doc.remove(0, doc.getLength());
      if (t == null || (t.length === 0)) {
        return;
      }
      let r = new StringReader(t);
      let kit = this.getEditorKit();
      kit.read$Reader$Document$int(r, doc, 0);
    } catch ($e4) {
      if ($J.isa($e4, IOException) || $J.isa($e4, BadLocationException)) {
        let e = $J.exc($e4);
        UIManager.getLookAndFeel().provideErrorFeedback(this);
      } else {
        throw $e4;
      }
    }
  }
  /**
   * Returns the text contained in this <code>TextComponent</code>
   * in terms of the
   * content type of this editor.  If an exception is thrown while
   * attempting to retrieve the text, <code>null</code> will be returned.
   * This is implemented to call <code>JTextComponent.write</code> with
   * a <code>StringWriter</code>.
   *
   * @return the text
   * @see #setText
   */
  getText$(): string {
    let txt: string;
    try {
      let buf = new StringWriter();
      this.write(buf);
      txt = buf.toString();
    } catch ($e5) {
      if ($J.isa($e5, IOException)) {
        let ioe = $J.exc($e5);
        txt = null;
      } else {
        throw $e5;
      }
    }
    return txt;
  }
  /**
   * Returns true if a viewport should always force the width of this
   * <code>Scrollable</code> to match the width of the viewport.
   *
   * @return true if a viewport should force the Scrollables width to
   * match its own, false otherwise
   */
  getScrollableTracksViewportWidth(): boolean {
    let parent = SwingUtilities.getUnwrappedParent(this);
    if (parent instanceof JViewport) {
      let port = parent;
      let ui = this.getUI();
      let w = port.getWidth();
      let min = ui.getMinimumSize(this);
      let max = ui.getMaximumSize(this);
      if ((w >= min.width_) && (w <= max.width_)) {
        return true;
      }
    }
    return false;
  }
  /**
   * Returns true if a viewport should always force the height of this
   * <code>Scrollable</code> to match the height of the viewport.
   *
   * @return true if a viewport should force the
   *          <code>Scrollable</code>'s height to match its own,
   *          false otherwise
   */
  getScrollableTracksViewportHeight(): boolean {
    let parent = SwingUtilities.getUnwrappedParent(this);
    if (parent instanceof JViewport) {
      let port = parent;
      let ui = this.getUI();
      let h = port.getHeight();
      let min = ui.getMinimumSize(this);
      if (h >= min.height_) {
        let max = ui.getMaximumSize(this);
        if (h <= max.height_) {
          return true;
        }
      }
    }
    return false;
  }
  /**
   * Returns a string representation of this <code>JEditorPane</code>.
   * This method
   * is intended to be used only for debugging purposes, and the
   * content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not
   * be <code>null</code>.
   *
   * @return  a string representation of this <code>JEditorPane</code>
   */
  paramString(): string {
    let kitString = (this.kit != null ? this.kit.toString() : '');
    let typeHandlersString = (this.typeHandlers != null ? this.typeHandlers.toString() : '');
    return super.paramString() + ',kit=' + kitString + ',typeHandlers=' + typeHandlersString;
  }
  /**
   * Gets the AccessibleContext associated with this JEditorPane.
   * For editor panes, the AccessibleContext takes the form of an
   * AccessibleJEditorPane.
   * A new AccessibleJEditorPane instance is created if necessary.
   *
   * @return an AccessibleJEditorPane that serves as the
   *         AccessibleContext of this JEditorPane
   */
  getAccessibleContext(): AccessibleContext {
    if ($J.isa(this.getEditorKit(), HTMLEditorKit)) {
      if (this.accessibleContext == null || this.accessibleContext.getClass() !== $J.cls(JEditorPane$AccessibleJEditorPaneHTML)) {
        this.accessibleContext = new JEditorPane$AccessibleJEditorPaneHTML().$o(this)._JEditorPane$AccessibleJEditorPaneHTML();
      }
    } else if (this.accessibleContext == null || this.accessibleContext.getClass() !== $J.cls(JEditorPane$AccessibleJEditorPane)) {
      this.accessibleContext = new JEditorPane$AccessibleJEditorPane().$o(this)._JEditorPane$AccessibleJEditorPane();
    }
    return this.accessibleContext;
  }
  static $clinit() {
    JEditorPane.kitRegistryKey = new StringBuffer('JEditorPane.kitRegistry');
    JEditorPane.kitTypeRegistryKey = new StringBuffer('JEditorPane.kitTypeRegistry');
    JEditorPane.kitLoaderRegistryKey = new StringBuffer('JEditorPane.kitLoaderRegistry');
    JEditorPane.defaultEditorKitMap = new HashMap(0);
  }
}

/**
 * This class implements accessibility support for the
 * <code>JEditorPane</code> class.  It provides an implementation of the
 * Java Accessibility API appropriate to editor pane user-interface
 * elements.
 * <p>
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the <code>java.beans</code> package.
 * Please see {@link java.beans.XMLEncoder}.
 */
export class JEditorPane$AccessibleJEditorPane extends JTextComponent$AccessibleJTextComponent {
  /**
   * Constructs an {@code AccessibleJEditorPane}.
   */
  _JEditorPane$AccessibleJEditorPane(): this {
    this._JTextComponent$AccessibleJTextComponent();
    return this;
  }
  /**
   * Gets the accessibleDescription property of this object.  If this
   * property isn't set, returns the content type of this
   * <code>JEditorPane</code> instead (e.g. "plain/text", "html/text").
   *
   * @return the localized description of the object; <code>null</code>
   *      if this object does not have a description
   *
   * @see #setAccessibleName
   */
  getAccessibleDescription(): string {
    let description = this.accessibleDescription;
    if (description == null) {
      description = this.$outer.getClientProperty(AccessibleContext.ACCESSIBLE_DESCRIPTION_PROPERTY);
    }
    if (description == null) {
      description = this.$outer.getContentType();
    }
    return description;
  }
}

/**
 * This class provides support for <code>AccessibleHypertext</code>,
 * and is used in instances where the <code>EditorKit</code>
 * installed in this <code>JEditorPane</code> is an instance of
 * <code>HTMLEditorKit</code>.
 * <p>
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the <code>java.beans</code> package.
 * Please see {@link java.beans.XMLEncoder}.
 */
export class JEditorPane$AccessibleJEditorPaneHTML extends JEditorPane$AccessibleJEditorPane {
  accessibleContext: AccessibleContext = null;
  /**
   * Constructs an {@code AccessibleJEditorPaneHTML}.
   */
  _JEditorPane$AccessibleJEditorPaneHTML(): this {
    this._JEditorPane$AccessibleJEditorPane();
    let kit = this.$outer.getEditorKit();
    this.accessibleContext = kit.getAccessibleContext();
    return this;
  }
  /**
   * Returns the number of accessible children of the object.
   *
   * @return the number of accessible children of the object.
   */
  getAccessibleChildrenCount(): number {
    if (this.accessibleContext != null) {
      return this.accessibleContext.getAccessibleChildrenCount();
    } else {
      return 0;
    }
  }
  /**
   * Returns the specified Accessible child of the object.  The Accessible
   * children of an Accessible object are zero-based, so the first child
   * of an Accessible child is at index 0, the second child is at index 1,
   * and so on.
   *
   * @param i zero-based index of child
   * @return the Accessible child of the object
   * @see #getAccessibleChildrenCount
   */
  getAccessibleChild(i: number): Accessible {
    if (this.accessibleContext != null) {
      return this.accessibleContext.getAccessibleChild(i);
    } else {
      return null;
    }
  }
}

export class JEditorPane$PlainEditorKit extends DefaultEditorKit {
  _JEditorPane$PlainEditorKit(): this {
    this._DefaultEditorKit();
    return this;
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
    return this;
  }
  /**
   * Creates a view from the given structural element of a
   * document.
   *
   * @param elem  the piece of the document to build a view of
   * @return the view
   * @see View
   */
  create(elem: Element): View {
    let doc = elem.getDocument();
    let i18nFlag = doc.getProperty('i18n');
    if ((i18nFlag != null) && $J.equals(i18nFlag, true)) {
      return this.createI18N(elem);
    } else {
      return new WrappedPlainView()._WrappedPlainView$Element(elem);
    }
  }
  createI18N(elem: Element): View {
    let kind = elem.getName();
    if (kind != null) {
      if ($J.equals(kind, AbstractDocument.ContentElementName)) {
        return new JEditorPane$PlainEditorKit$PlainParagraph()._JEditorPane$PlainEditorKit$PlainParagraph(elem);
      } else if ($J.equals(kind, AbstractDocument.ParagraphElementName)) {
        return new BoxView()._BoxView(elem, View.Y_AXIS);
      }
    }
    return null;
  }
}

/**
 * Paragraph for representing plain-text lines that support
 * bidirectional text.
 */
export class JEditorPane$PlainEditorKit$PlainParagraph extends ParagraphView {
  _JEditorPane$PlainEditorKit$PlainParagraph(elem: Element): this {
    this._ParagraphView(elem);
    this.layoutPool = new JEditorPane$PlainEditorKit$PlainParagraph$LogicalView()._JEditorPane$PlainEditorKit$PlainParagraph$LogicalView(elem);
    this.layoutPool.setParent(this);
    return this;
  }
  setPropertiesFromAttributes(): void {
    let c = this.getContainer();
    if ((c != null) && (!c.getComponentOrientation().isLeftToRight())) {
      this.setJustification(StyleConstants.ALIGN_RIGHT);
    } else {
      this.setJustification(StyleConstants.ALIGN_LEFT);
    }
  }
  /**
   * Fetch the constraining span to flow against for
   * the given child index.
   */
  getFlowSpan(index: number): number {
    let c = this.getContainer();
    if (c instanceof JTextArea) {
      let area = c;
      if (!area.getLineWrap()) {
        return 2147483647;
      }
    }
    return super.getFlowSpan(index);
  }
  calculateMinorAxisRequirements(axis: number, r: SizeRequirements): SizeRequirements {
    let req = super.calculateMinorAxisRequirements(axis, r);
    let c = this.getContainer();
    if (c instanceof JTextArea) {
      let area = c;
      if (!area.getLineWrap()) {
        req.minimum = req.preferred_;
      }
    }
    return req;
  }
}

/**
 * This class can be used to represent a logical view for
 * a flow.  It keeps the children updated to reflect the state
 * of the model, gives the logical child views access to the
 * view hierarchy, and calculates a preferred span.  It doesn't
 * do any rendering, layout, or model/view translation.
 */
export class JEditorPane$PlainEditorKit$PlainParagraph$LogicalView extends CompositeView {
  _JEditorPane$PlainEditorKit$PlainParagraph$LogicalView(elem: Element): this {
    this._CompositeView(elem);
    return this;
  }
  getViewIndexAtPosition(pos: number): number {
    let elem = this.getElement();
    if (elem.getElementCount() > 0) {
      return elem.getElementIndex(pos);
    }
    return 0;
  }
  updateChildren$ElementChange$DocumentEvent$ViewFactory(ec: DocumentEvent$ElementChange, e: DocumentEvent, f: ViewFactory): boolean {
    return false;
  }
  loadChildren(f: ViewFactory): void {
    let elem = this.getElement();
    if (elem.getElementCount() > 0) {
      super.loadChildren(f);
    } else {
      let v = new GlyphView()._GlyphView(elem);
      this.append(v);
    }
  }
  getPreferredSpan(axis: number): number {
    if (this.getViewCount() !== 1) {
      throw new JError('One child view is assumed.');
    }
    let v = this.getView(0);
    return v.getPreferredSpan(axis);
  }
  /**
   * Forward the DocumentEvent to the given child view.  This
   * is implemented to reparent the child to the logical view
   * (the children may have been parented by a row in the flow
   * if they fit without breaking) and then execute the
   * superclass behavior.
   *
   * @param v the child view to forward the event to.
   * @param e the change information from the associated document
   * @param a the current allocation of the view
   * @param f the factory to use to rebuild if the view has
   *          children
   * @see #forwardUpdate
   * @since 1.3
   */
  forwardUpdateToView(v: View, e: DocumentEvent, a: Shape, f: ViewFactory): void {
    v.setParent(this);
    super.forwardUpdateToView(v, e, a, f);
  }
  paint(g: Graphics, allocation: Shape): void {
  }
  isBefore(x: number, y: number, alloc: Rectangle): boolean {
    return false;
  }
  isAfter(x: number, y: number, alloc: Rectangle): boolean {
    return false;
  }
  getViewAtPoint(x: number, y: number, alloc: Rectangle): View {
    return null;
  }
  childAllocation(index: number, a: Rectangle): void {
  }
}

export class JEditorPane$HeaderParser extends JObject {
  raw: string = null;
  tab: string[][] = null;
  _JEditorPane$HeaderParser(raw: string): this {
    this.raw = raw;
    this.tab = $J.newArrayN([10, 2], null);
    this.parse();
    return this;
  }
  parse(): void {
    if (this.raw != null) {
      this.raw = JString.trim(this.raw);
      let ca = JString.toCharArray(this.raw);
      let beg = 0;
      let end = 0;
      let i = 0;
      let inKey = true;
      let inQuote = false;
      let len = ca.length;
      while (end < len) {
        let c = ca[end];
        if (c === 61 /* '=' */) {
          this.tab[i][0] = JString.newString(ca, beg, (end - beg) | 0).toLowerCase();
          inKey = false;
          end++;
          beg = end;
        } else if (c === 34 /* '"' */) {
          if (inQuote) {
            this.tab[i++][1] = JString.newString(ca, beg, (end - beg) | 0);
            inQuote = false;
            do {
              end++;
            } while (end < len && (ca[end] === 32 /* ' ' */ || ca[end] === 44 /* ',' */));
            inKey = true;
            beg = end;
          } else {
            inQuote = true;
            end++;
            beg = end;
          }
        } else if (c === 32 /* ' ' */ || c === 44 /* ',' */) {
          if (inQuote) {
            end++;
            continue;
          } else if (inKey) {
            this.tab[i++][0] = (JString.newString(ca, beg, (end - beg) | 0)).toLowerCase();
          } else {
            this.tab[i++][1] = (JString.newString(ca, beg, (end - beg) | 0));
          }
          while (end < len && (ca[end] === 32 /* ' ' */ || ca[end] === 44 /* ',' */)) {
            end++;
          }
          inKey = true;
          beg = end;
        } else {
          end++;
        }
      }
      if (--end > beg) {
        if (!inKey) {
          if (ca[end] === 34 /* '"' */) {
            this.tab[i++][1] = (JString.newString(ca, beg, (end - beg) | 0));
          } else {
            this.tab[i++][1] = (JString.newString(ca, beg, (end - beg + 1) | 0));
          }
        } else {
          this.tab[i][0] = (JString.newString(ca, beg, (end - beg + 1) | 0)).toLowerCase();
        }
      } else if (end === beg) {
        if (!inKey) {
          if (ca[end] === 34 /* '"' */) {
            this.tab[i++][1] = String.fromCharCode(ca[(end - 1) | 0]);
          } else {
            this.tab[i++][1] = String.fromCharCode(ca[end]);
          }
        } else {
          this.tab[i][0] = String.fromCharCode(ca[end]).toLowerCase();
        }
      }
    }
  }
  findValue$String(key: string): string {
    return this.findValue$String$String(key, null);
  }
  findValue$String$String(k: string, Default: string): string {
    if (k == null) {
      return Default;
    }
    k = k.toLowerCase();
    for (let i = 0; i < 10; ++i) {
      if (this.tab[i][0] == null) {
        return Default;
      } else if ($J.equals(k, this.tab[i][0])) {
        return this.tab[i][1];
      }
    }
    return Default;
  }
}

let $JEditorPane$1: any = null;
/** An anonymous class (JEditorPane.java:257). */
function JEditorPane$1(): any {
  return $JEditorPane$1 ??= $J.local(class extends LayoutFocusTraversalPolicy {
    getComponentAfter(focusCycleRoot: Container, aComponent: Component): Component {
      if (focusCycleRoot !== this.$outer || (!this.$outer.isEditable() && this.$outer.getComponentCount() > 0)) {
        return super.getComponentAfter(focusCycleRoot, aComponent);
      } else {
        let rootAncestor = this.$outer.getFocusCycleRootAncestor();
        return (rootAncestor != null) ? rootAncestor.getFocusTraversalPolicy().getComponentAfter(rootAncestor, this.$outer) : null;
      }
    }
    getComponentBefore(focusCycleRoot: Container, aComponent: Component): Component {
      if (focusCycleRoot !== this.$outer || (!this.$outer.isEditable() && this.$outer.getComponentCount() > 0)) {
        return super.getComponentBefore(focusCycleRoot, aComponent);
      } else {
        let rootAncestor = this.$outer.getFocusCycleRootAncestor();
        return (rootAncestor != null) ? rootAncestor.getFocusTraversalPolicy().getComponentBefore(rootAncestor, this.$outer) : null;
      }
    }
    getDefaultComponent(focusCycleRoot: Container): Component {
      return (focusCycleRoot !== this.$outer || (!this.$outer.isEditable() && this.$outer.getComponentCount() > 0)) ? super.getDefaultComponent(focusCycleRoot) : null;
    }
    accept(aComponent: Component): boolean {
      return (aComponent !== this.$outer) ? super.accept(aComponent) : false;
    }
  }, 'javax.swing.JEditorPane$1', []);
}

$J.define(JEditorPane, 'javax.swing.JEditorPane', { kind: 'class', sup: 'javax.swing.text.JTextComponent', ctors: { 'java.lang.String,java.lang.String': '_JEditorPane$String$String', 'java.lang.String': '_JEditorPane$String', 'java.net.URL': '_JEditorPane$URL', '': '_JEditorPane$' }, meths: { 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$JEditorPane', 'getText()': 'getText$', 'getPreferredSize()': 'getPreferredSize$', 'registerEditorKitForContentType(java.lang.String,java.lang.String,java.lang.ClassLoader)': 'registerEditorKitForContentType$String$String$ClassLoader', 'registerEditorKitForContentType(java.lang.String,java.lang.String)': 'registerEditorKitForContentType$String$String', 'replaceSelection(java.lang.String)': 'replaceSelection$String', 'setPage(java.lang.String)': 'setPage$String', 'read(java.io.InputStream,javax.swing.text.Document)': 'read$InputStream$Document', 'read(java.io.InputStream,java.lang.Object)': 'read$InputStream$Object', 'setPage(java.net.URL)': 'setPage$URL' }, clinit: true, lazy: ['kitRegistryKey', 'kitTypeRegistryKey', 'kitLoaderRegistryKey', 'defaultEditorKitMap'] });
$J.define(JEditorPane$AccessibleJEditorPane, 'javax.swing.JEditorPane$AccessibleJEditorPane', { kind: 'class', sup: 'javax.swing.text.JTextComponent$AccessibleJTextComponent', ctors: { '': '_JEditorPane$AccessibleJEditorPane' }, meths: { 'getAccessibleStateSet()': 'getAccessibleStateSet$' }, inner: true });
$J.define(JEditorPane$AccessibleJEditorPaneHTML, 'javax.swing.JEditorPane$AccessibleJEditorPaneHTML', { kind: 'class', sup: 'javax.swing.JEditorPane$AccessibleJEditorPane', ctors: { '': '_JEditorPane$AccessibleJEditorPaneHTML' }, meths: { 'getAccessibleAt(java.awt.Point)': 'getAccessibleAt$Point' }, inner: true });
$J.define(JEditorPane$PlainEditorKit, 'javax.swing.JEditorPane$PlainEditorKit', { kind: 'class', ifaces: ['javax.swing.text.ViewFactory'], sup: 'javax.swing.text.DefaultEditorKit', ctors: { '': '_JEditorPane$PlainEditorKit' } });
$J.define(JEditorPane$PlainEditorKit$PlainParagraph, 'javax.swing.JEditorPane$PlainEditorKit$PlainParagraph', { kind: 'class', sup: 'javax.swing.text.ParagraphView', ctors: { 'javax.swing.text.Element': '_JEditorPane$PlainEditorKit$PlainParagraph' } });
$J.define(JEditorPane$PlainEditorKit$PlainParagraph$LogicalView, 'javax.swing.JEditorPane$PlainEditorKit$PlainParagraph$LogicalView', { kind: 'class', sup: 'javax.swing.text.CompositeView', ctors: { 'javax.swing.text.Element': '_JEditorPane$PlainEditorKit$PlainParagraph$LogicalView' }, meths: { 'updateChildren(javax.swing.event.DocumentEvent$ElementChange,javax.swing.event.DocumentEvent,javax.swing.text.ViewFactory)': 'updateChildren$ElementChange$DocumentEvent$ViewFactory' } });
$J.define(JEditorPane$HeaderParser, 'javax.swing.JEditorPane$HeaderParser', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.lang.String': '_JEditorPane$HeaderParser' }, meths: { 'findValue(java.lang.String,java.lang.String)': 'findValue$String$String', 'findValue(java.lang.String)': 'findValue$String', 'findValue(int)': 'findValue$int' } });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  AccessibleContext = $J.load('javax.accessibility.AccessibleContext');
  JComponent = $J.load('javax.swing.JComponent');
  JTextArea = $J.load('javax.swing.JTextArea');
  JViewport = $J.load('javax.swing.JViewport');
  LayoutFocusTraversalPolicy = $J.load('javax.swing.LayoutFocusTraversalPolicy');
  LookAndFeel = $J.load('javax.swing.LookAndFeel');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIManager = $J.load('javax.swing.UIManager');
  HyperlinkListener = $J.load('javax.swing.event.HyperlinkListener');
  AbstractDocument = $J.load('javax.swing.text.AbstractDocument');
  BadLocationException = $J.load('javax.swing.text.BadLocationException');
  BoxView = $J.load('javax.swing.text.BoxView');
  GlyphView = $J.load('javax.swing.text.GlyphView');
  StyleConstants = $J.load('javax.swing.text.StyleConstants');
  StyledEditorKit = $J.load('javax.swing.text.StyledEditorKit');
  View = $J.load('javax.swing.text.View');
  WrappedPlainView = $J.load('javax.swing.text.WrappedPlainView');
});
