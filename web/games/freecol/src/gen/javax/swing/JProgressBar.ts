// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JProgressBar.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../jre/index.ts';
import { JComponent } from './JComponent.ts';

/**
 * A component that visually displays the progress of some task.  As the task
 * progresses towards completion, the progress bar displays the
 * task's percentage of completion.
 * This percentage is typically represented visually by a rectangle which
 * starts out empty and gradually becomes filled in as the task progresses.
 * In addition, the progress bar can display a textual representation of this
 * percentage.
 * <p>
 * {@code JProgressBar} uses a {@code BoundedRangeModel} as its data model,
 * with the {@code value} property representing the "current" state of the task,
 * and the {@code minimum} and {@code maximum} properties representing the
 * beginning and end points, respectively.
 * <p>
 * To indicate that a task of unknown length is executing,
 * you can put a progress bar into indeterminate mode.
 * While the bar is in indeterminate mode,
 * it animates constantly to show that work is occurring.
 * As soon as you can determine the task's length and amount of progress,
 * you should update the progress bar's value
 * and switch it back to determinate mode.
 *
 * <p>
 *
 * Here is an example of creating a progress bar,
 * where <code>task</code> is an object (representing some piece of work)
 * which returns information about the progress of the task:
 *
 * <pre>
 * progressBar = new JProgressBar(0, task.getLengthOfTask());
 * progressBar.setValue(0);
 * progressBar.setStringPainted(true);
 * </pre>
 *
 * Here is an example of querying the current state of the task, and using
 * the returned value to update the progress bar:
 *
 * <pre>
 * progressBar.setValue(task.getCurrent());
 * </pre>
 *
 * Here is an example of putting a progress bar into
 * indeterminate mode,
 * and then switching back to determinate mode
 * once the length of the task is known:
 *
 * <pre>
 * progressBar = new JProgressBar();
 * <em>...//when the task of (initially) unknown length begins:</em>
 * progressBar.setIndeterminate(true);
 * <em>...//do some work; get length of task...</em>
 * progressBar.setMaximum(newLength);
 * progressBar.setValue(newValue);
 * progressBar.setIndeterminate(false);
 * </pre>
 *
 * <p>
 *
 * For complete examples and further documentation see
 * <a href="https://docs.oracle.com/javase/tutorial/uiswing/components/progress.html" target="_top">How to Monitor Progress</a>,
 * a section in <em>The Java Tutorial.</em>
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
 * @see javax.swing.plaf.basic.BasicProgressBarUI
 * @see javax.swing.BoundedRangeModel
 * @see javax.swing.SwingWorker
 *
 * @author Michael C. Albers
 * @author Kathy Walrath
 * @since 1.2
 */
export class JProgressBar extends JComponent {
  /**
   * @see #getUIClassID
   */
  static readonly uiClassID: string = 'ProgressBarUI';
  /**
   * Whether the progress bar is horizontal or vertical.
   * The default is <code>HORIZONTAL</code>.
   *
   * @see #setOrientation
   */
  orientation: number = 0;
  /**
   * Whether to display a border around the progress bar.
   * The default is <code>true</code>.
   *
   * @see #setBorderPainted
   */
  paintBorder_: boolean = false;
  /**
   * The object that holds the data for the progress bar.
   *
   * @see #setModel
   */
  model: BoundedRangeModel = null;
  /**
   * An optional string that can be displayed on the progress bar.
   * The default is <code>null</code>. Setting this to a non-<code>null</code>
   * value does not imply that the string will be displayed.
   * To display the string, {@code paintString} must be {@code true}.
   *
   * @see #setString
   * @see #setStringPainted
   */
  progressString: string = null;
  /**
   * Whether to display a string of text on the progress bar.
   * The default is <code>false</code>.
   * Setting this to <code>true</code> causes a textual
   * display of the progress to be rendered on the progress bar. If
   * the <code>progressString</code> is <code>null</code>,
   * the percentage of completion is displayed on the progress bar.
   * Otherwise, the <code>progressString</code> is
   * rendered on the progress bar.
   *
   * @see #setStringPainted
   * @see #setString
   */
  paintString: boolean = false;
  /**
   * The default minimum for a progress bar is 0.
   */
  static readonly defaultMinimum: number = 0;
  /**
   * The default maximum for a progress bar is 100.
   */
  static readonly defaultMaximum: number = 100;
  /**
   * The default orientation for a progress bar is <code>HORIZONTAL</code>.
   */
  static readonly defaultOrientation: number = 0;
  /**
   * Only one <code>ChangeEvent</code> is needed per instance since the
   * event's only interesting property is the immutable source, which
   * is the progress bar.
   * The event is lazily created the first time that an
   * event notification is fired.
   *
   * @see #fireStateChanged
   */
  changeEvent: ChangeEvent = null;
  /**
   * Listens for change events sent by the progress bar's model,
   * redispatching them
   * to change-event listeners registered upon
   * this progress bar.
   *
   * @see #createChangeListener
   */
  changeListener: ChangeListener = null;
  /**
   * Format used when displaying percent complete.
   */
  format_: Format = null;
  /**
   * Whether the progress bar is indeterminate (<code>true</code>) or
   * normal (<code>false</code>); the default is <code>false</code>.
   *
   * @see #setIndeterminate
   * @since 1.4
   */
  indeterminate: boolean = false;
  $init_JProgressBar() {
    this.changeEvent = null;
    this.changeListener = null;
  }
}

$J.define(JProgressBar, 'javax.swing.JProgressBar', { kind: 'class', ifaces: ['javax.swing.SwingConstants', 'javax.accessibility.Accessible'], sup: 'javax.swing.JComponent', ctors: { 'javax.swing.BoundedRangeModel': '_JProgressBar$BoundedRangeModel', 'int,int,int': '_JProgressBar$int$int$int', 'int,int': '_JProgressBar$int$int', 'int': '_JProgressBar$int', '': '_JProgressBar$' }, meths: { 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$JProgressBar', 'setUI(javax.swing.plaf.ProgressBarUI)': 'setUI$ProgressBarUI' } });
