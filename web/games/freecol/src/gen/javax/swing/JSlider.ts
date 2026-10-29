// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JSlider.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Hashtable, IllegalArgumentException, JObject, NullPointerException } from '../../../jre/index.ts';
import { JComponent } from './JComponent.ts';
import { JComponent$AccessibleJComponent } from './JComponent.ts';

let PropertyChangeListener, AccessibleContext, AccessibleState, DefaultBoundedRangeModel, JSlider$1SmartHashtable$LabelUIResource, SwingConstants, UIManager, ChangeEvent, ChangeListener;

/**
 * A component that lets the user graphically select a value by sliding
 * a knob within a bounded interval. The knob is always positioned
 * at the points that match integer values within the specified interval.
 * <p>
 * The slider can show both
 * major tick marks, and minor tick marks between the major ones.  The number of
 * values between the tick marks is controlled with
 * <code>setMajorTickSpacing</code> and <code>setMinorTickSpacing</code>.
 * Painting of tick marks is controlled by {@code setPaintTicks}.
 * <p>
 * Sliders can also print text labels at regular intervals (or at
 * arbitrary locations) along the slider track.  Painting of labels is
 * controlled by {@code setLabelTable} and {@code setPaintLabels}.
 * <p>
 * For further information and examples see
 * <a
 * href="https://docs.oracle.com/javase/tutorial/uiswing/components/slider.html">How to Use Sliders</a>,
 * a section in <em>The Java Tutorial.</em>
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
 * @author David Kloba
 * @since 1.2
 */
export class JSlider extends JComponent {
  /**
   * @see #getUIClassID
   * @see #readObject
   */
  static readonly uiClassID: string = 'SliderUI';
  paintTicks_: boolean = false;
  paintTrack_: boolean = false;
  paintLabels_: boolean = false;
  isInverted: boolean = false;
  /**
   * The data model that handles the numeric maximum value,
   * minimum value, and current-position value for the slider.
   */
  sliderModel: BoundedRangeModel = null;
  /**
   * The number of values between the major tick marks -- the
   * larger marks that break up the minor tick marks.
   */
  majorTickSpacing: number = 0;
  /**
   * The number of values between the minor tick marks -- the
   * smaller marks that occur between the major tick marks.
   * @see #setMinorTickSpacing
   */
  minorTickSpacing: number = 0;
  /**
   * If true, the knob (and the data value it represents)
   * resolve to the closest tick mark next to where the user
   * positioned the knob.  The default is false.
   * @see #setSnapToTicks
   */
  snapToTicks: boolean = false;
  /**
   * If true, the knob (and the data value it represents)
   * resolve to the closest slider value next to where the user
   * positioned the knob.
   */
  snapToValue: boolean = false;
  /**
   * Whether the slider is horizontal or vertical
   * The default is horizontal.
   *
   * @see #setOrientation
   */
  orientation: number = 0;
  /**
   * {@code Dictionary} of what labels to draw at which values
   */
  labelTable: Dictionary = null;
  /**
   * The changeListener (no suffix) is the listener we add to the
   * slider's model.  This listener is initialized to the
   * {@code ChangeListener} returned from {@code createChangeListener},
   * which by default just forwards events
   * to {@code ChangeListener}s (if any) added directly to the slider.
   *
   * @see #addChangeListener
   * @see #createChangeListener
   */
  changeListener: ChangeListener = null;
  /**
   * Only one <code>ChangeEvent</code> is needed per slider instance since the
   * event's only (read-only) state is the source property.  The source
   * of events generated here is always "this". The event is lazily
   * created the first time that an event notification is fired.
   *
   * @see #fireStateChanged
   */
  changeEvent: ChangeEvent = null;
  $init_JSlider() {
    this.paintTicks_ = false;
    this.paintTrack_ = true;
    this.paintLabels_ = false;
    this.isInverted = false;
    this.snapToTicks = false;
    this.snapToValue = true;
    this.changeListener = this.createChangeListener();
    this.changeEvent = null;
  }
  /**
   * Creates a horizontal slider with the range 0 to 100 and
   * an initial value of 50.
   */
  _JSlider$(): this {
    this._JSlider$int$int$int$int(SwingConstants.HORIZONTAL, 0, 100, 50);
    return this;
  }
  /**
   * Creates a slider with the specified orientation and the
   * specified minimum, maximum, and initial values.
   * The orientation can be
   * either <code>SwingConstants.VERTICAL</code> or
   * <code>SwingConstants.HORIZONTAL</code>.
   * <p>
   * The <code>BoundedRangeModel</code> that holds the slider's data
   * handles any issues that may arise from improperly setting the
   * minimum, initial, and maximum values on the slider.  See the
   * {@code BoundedRangeModel} documentation for details.
   *
   * @param orientation  the orientation of the slider
   * @param min  the minimum value of the slider
   * @param max  the maximum value of the slider
   * @param value  the initial value of the slider
   *
   * @throws IllegalArgumentException if orientation is not one of {@code VERTICAL}, {@code HORIZONTAL}
   *
   * @see BoundedRangeModel
   * @see #setOrientation
   * @see #setMinimum
   * @see #setMaximum
   * @see #setValue
   */
  _JSlider$int$int$int$int(orientation: number, min: number, max: number, value: number): this {
    this._JComponent();
    this.$init_JSlider();
    this.checkOrientation(orientation);
    this.orientation = orientation;
    this.setModel(new DefaultBoundedRangeModel()._DefaultBoundedRangeModel$int$int$int$int(value, 0, min, max));
    this.updateUI();
    return this;
  }
  checkOrientation(orientation: number): void {
    switch (orientation) {
      case SwingConstants.VERTICAL:
      case SwingConstants.HORIZONTAL:
        break;
      default:
        throw new IllegalArgumentException('orientation must be one of: VERTICAL, HORIZONTAL');
    }
  }
  /**
   * Gets the UI object which implements the L&amp;F for this component.
   *
   * @return the SliderUI object that implements the Slider L&amp;F
   */
  getUI(): SliderUI {
    return this.ui;
  }
  /**
   * Sets the UI object which implements the L&amp;F for this component.
   *
   * @param ui the SliderUI L&amp;F object
   * @see UIDefaults#getUI
   */
  setUI$SliderUI(ui: SliderUI): void {
    super.setUI$ComponentUI(ui);
  }
  /**
   * Resets the UI property to a value from the current look and feel.
   *
   * @see JComponent#updateUI
   */
  updateUI(): void {
    this.setUI$SliderUI(UIManager.getUI(this));
    this.updateLabelUIs();
  }
  /**
   * Returns the name of the L&amp;F class that renders this component.
   *
   * @return the string "SliderUI"
   * @see JComponent#getUIClassID
   * @see UIDefaults#getUI
   */
  getUIClassID(): string {
    return JSlider.uiClassID;
  }
  /**
   * Subclasses that want to handle {@code ChangeEvent}s
   * from the model differently
   * can override this to return
   * an instance of a custom <code>ChangeListener</code> implementation.
   * The default {@code ChangeListener} simply calls the
   * {@code fireStateChanged} method to forward {@code ChangeEvent}s
   * to the {@code ChangeListener}s that have been added directly to the
   * slider.
   *
   * @return a instance of new {@code ChangeListener}
   * @see #changeListener
   * @see #fireStateChanged
   * @see javax.swing.event.ChangeListener
   * @see javax.swing.BoundedRangeModel
   */
  createChangeListener(): ChangeListener {
    return $J.fn(new JSlider$ModelListener().$o(this)._JSlider$ModelListener(), 'stateChanged');
  }
  /**
   * Adds a ChangeListener to the slider.
   *
   * @param l the ChangeListener to add
   * @see #fireStateChanged
   * @see #removeChangeListener
   */
  addChangeListener(l: ChangeListener): void {
    this.listenerList.add($J.cls(ChangeListener), l);
  }
  /**
   * Send a {@code ChangeEvent}, whose source is this {@code JSlider}, to
   * all {@code ChangeListener}s that have registered interest in
   * {@code ChangeEvent}s.
   * This method is called each time a {@code ChangeEvent} is received from
   * the model.
   * <p>
   * The event instance is created if necessary, and stored in
   * {@code changeEvent}.
   *
   * @see #addChangeListener
   * @see EventListenerList
   */
  fireStateChanged(): void {
    let listeners = this.listenerList.getListenerList();
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(ChangeListener)) {
        if (this.changeEvent == null) {
          this.changeEvent = new ChangeEvent()._ChangeEvent(this);
        }
        $J.fn((listeners[(i + 1) | 0]), 'stateChanged')(this.changeEvent);
      }
    }
  }
  /**
   * Returns the {@code BoundedRangeModel} that handles the slider's three
   * fundamental properties: minimum, maximum, value.
   *
   * @return the data model for this component
   * @see #setModel
   * @see    BoundedRangeModel
   */
  getModel(): BoundedRangeModel {
    return this.sliderModel;
  }
  /**
   * Sets the {@code BoundedRangeModel} that handles the slider's three
   * fundamental properties: minimum, maximum, value.
   * <p>
   * Attempts to pass a {@code null} model to this method result in
   * undefined behavior, and, most likely, exceptions.
   *
   * @param  newModel the new, {@code non-null} <code>BoundedRangeModel</code> to use
   *
   * @see #getModel
   * @see    BoundedRangeModel
   */
  setModel(newModel: BoundedRangeModel): void {
    let oldModel = this.getModel();
    if (oldModel != null) {
      oldModel.removeChangeListener(this.changeListener);
    }
    this.sliderModel = newModel;
    if (newModel != null) {
      newModel.addChangeListener(this.changeListener);
    }
    if (this.accessibleContext != null) {
      this.accessibleContext.firePropertyChange(AccessibleContext.ACCESSIBLE_VALUE_PROPERTY, (oldModel == null ? null : oldModel.getValue()), (newModel == null ? null : newModel.getValue()));
    }
    this.firePropertyChange$String$Object$Object('model', oldModel, this.sliderModel);
  }
  /**
   * Returns the slider's current value
   * from the {@code BoundedRangeModel}.
   *
   * @return  the current value of the slider
   * @see     #setValue
   * @see     BoundedRangeModel#getValue
   */
  getValue(): number {
    return this.getModel().getValue();
  }
  /**
   * Sets the slider's current value to {@code n}.  This method
   * forwards the new value to the model.
   * <p>
   * The data model (an instance of {@code BoundedRangeModel})
   * handles any mathematical
   * issues arising from assigning faulty values.  See the
   * {@code BoundedRangeModel} documentation for details.
   * <p>
   * If the new value is different from the previous value,
   * all change listeners are notified.
   *
   * @param   n       the new value
   * @see     #getValue
   * @see     #addChangeListener
   * @see     BoundedRangeModel#setValue
   */
  setValue(n: number): void {
    let m = this.getModel();
    let oldValue = m.getValue();
    if (oldValue === n) {
      return;
    }
    m.setValue(n);
  }
  /**
   * Returns the minimum value supported by the slider
   * from the <code>BoundedRangeModel</code>.
   *
   * @return the value of the model's minimum property
   * @see #setMinimum
   * @see     BoundedRangeModel#getMinimum
   */
  getMinimum(): number {
    return this.getModel().getMinimum();
  }
  /**
   * Sets the slider's minimum value to {@code minimum}.  This method
   * forwards the new minimum value to the model.
   * <p>
   * The data model (an instance of {@code BoundedRangeModel})
   * handles any mathematical
   * issues arising from assigning faulty values.  See the
   * {@code BoundedRangeModel} documentation for details.
   * <p>
   * If the new minimum value is different from the previous minimum value,
   * all change listeners are notified.
   *
   * @param minimum  the new minimum
   * @see #getMinimum
   * @see    #addChangeListener
   * @see BoundedRangeModel#setMinimum
   */
  setMinimum(minimum: number): void {
    let oldMin = this.getModel().getMinimum();
    this.getModel().setMinimum(minimum);
    this.firePropertyChange$String$Object$Object('minimum', oldMin, minimum);
  }
  /**
   * Returns the maximum value supported by the slider
   * from the <code>BoundedRangeModel</code>.
   *
   * @return the value of the model's maximum property
   * @see #setMaximum
   * @see BoundedRangeModel#getMaximum
   */
  getMaximum(): number {
    return this.getModel().getMaximum();
  }
  /**
   * Sets the slider's maximum value to {@code maximum}.  This method
   * forwards the new maximum value to the model.
   * <p>
   * The data model (an instance of {@code BoundedRangeModel})
   * handles any mathematical
   * issues arising from assigning faulty values.  See the
   * {@code BoundedRangeModel} documentation for details.
   * <p>
   * If the new maximum value is different from the previous maximum value,
   * all change listeners are notified.
   *
   * @param maximum  the new maximum
   * @see #getMaximum
   * @see #addChangeListener
   * @see BoundedRangeModel#setMaximum
   */
  setMaximum(maximum: number): void {
    let oldMax = this.getModel().getMaximum();
    this.getModel().setMaximum(maximum);
    this.firePropertyChange$String$Object$Object('maximum', oldMax, maximum);
  }
  /**
   * Sets the model's {@code valueIsAdjusting} property.  Slider look and
   * feel implementations should set this property to {@code true} when
   * a knob drag begins, and to {@code false} when the drag ends.
   *
   * @param b the new value for the {@code valueIsAdjusting} property
   * @see   #getValueIsAdjusting
   * @see   BoundedRangeModel#setValueIsAdjusting
   */
  setValueIsAdjusting(b: boolean): void {
    let m = this.getModel();
    let oldValue = m.getValueIsAdjusting();
    m.setValueIsAdjusting(b);
    if ((oldValue !== b) && (this.accessibleContext != null)) {
      this.accessibleContext.firePropertyChange(AccessibleContext.ACCESSIBLE_STATE_PROPERTY, ((oldValue) ? AccessibleState.BUSY : null), ((b) ? AccessibleState.BUSY : null));
    }
  }
  /**
   * Returns the "extent" from the <code>BoundedRangeModel</code>.
   * This represents the range of values "covered" by the knob.
   *
   * @return an int representing the extent
   * @see #setExtent
   * @see BoundedRangeModel#getExtent
   */
  getExtent(): number {
    return this.getModel().getExtent();
  }
  /**
   * Sets the size of the range "covered" by the knob.  Most look
   * and feel implementations will change the value by this amount
   * if the user clicks on either side of the knob.  This method just
   * forwards the new extent value to the model.
   * <p>
   * The data model (an instance of {@code BoundedRangeModel})
   * handles any mathematical
   * issues arising from assigning faulty values.  See the
   * {@code BoundedRangeModel} documentation for details.
   * <p>
   * If the new extent value is different from the previous extent value,
   * all change listeners are notified.
   *
   * @param extent the new extent
   * @see   #getExtent
   * @see   BoundedRangeModel#setExtent
   */
  setExtent(extent: number): void {
    this.getModel().setExtent(extent);
  }
  /**
   * Return this slider's vertical or horizontal orientation.
   * @return {@code SwingConstants.VERTICAL} or
   *  {@code SwingConstants.HORIZONTAL}
   * @see #setOrientation
   */
  getOrientation(): number {
    return this.orientation;
  }
  /**
   * Set the slider's orientation to either {@code SwingConstants.VERTICAL} or
   * {@code SwingConstants.HORIZONTAL}.
   *
   * @param orientation {@code HORIZONTAL} or {@code VERTICAL}
   * @throws IllegalArgumentException if orientation is not one of {@code VERTICAL}, {@code HORIZONTAL}
   * @see #getOrientation
   */
  setOrientation(orientation: number): void {
    this.checkOrientation(orientation);
    let oldValue = this.orientation;
    this.orientation = orientation;
    this.firePropertyChange$String$int$int('orientation', oldValue, orientation);
    if ((oldValue !== orientation) && (this.accessibleContext != null)) {
      this.accessibleContext.firePropertyChange(AccessibleContext.ACCESSIBLE_STATE_PROPERTY, ((oldValue === SwingConstants.VERTICAL) ? AccessibleState.VERTICAL : AccessibleState.HORIZONTAL), ((orientation === SwingConstants.VERTICAL) ? AccessibleState.VERTICAL : AccessibleState.HORIZONTAL));
    }
    if (orientation !== oldValue) {
      this.revalidate();
    }
  }
  /**
   * {@inheritDoc}
   *
   * @since 1.6
   */
  setFont(font: Font): void {
    super.setFont(font);
    this.updateLabelSizes();
  }
  /**
   * Returns the dictionary of what labels to draw at which values.
   *
   * @return the <code>Dictionary</code> containing labels and
   *    where to draw them
   */
  getLabelTable(): Dictionary {
    return this.labelTable;
  }
  /**
   * Used to specify what label will be drawn at any given value.
   * The key-value pairs are of this format:
   * <code>{ Integer value, java.swing.JComponent label }</code>.
   * <p>
   * An easy way to generate a standard table of value labels is by using the
   * {@code createStandardLabels} method.
   * <p>
   * Once the labels have been set, this method calls {@link #updateLabelUIs}.
   * Note that the labels are only painted if the {@code paintLabels}
   * property is {@code true}.
   *
   * @param labels new {@code Dictionary} of labels, or {@code null} to
   *        remove all labels
   * @see #createStandardLabels(int)
   * @see #getLabelTable
   * @see #setPaintLabels
   */
  setLabelTable(labels: Dictionary): void {
    let oldTable = this.labelTable;
    this.labelTable = labels;
    this.updateLabelUIs();
    this.firePropertyChange$String$Object$Object('labelTable', oldTable, this.labelTable);
    if (labels !== oldTable) {
      this.revalidate();
      this.repaint$();
    }
  }
  /**
   * Updates the UIs for the labels in the label table by calling
   * {@code updateUI} on each label.  The UIs are updated from
   * the current look and feel.  The labels are also set to their
   * preferred size.
   *
   * @see #setLabelTable
   * @see JComponent#updateUI
   */
  updateLabelUIs(): void {
    let labelTable = this.getLabelTable();
    if (labelTable == null) {
      return;
    }
    let labels = labelTable.keys();
    while (labels.hasMoreElements()) {
      let component = labelTable.get(labels.nextElement());
      component.updateUI();
      component.setSize$Dimension(component.getPreferredSize$());
    }
  }
  updateLabelSizes(): void {
    let labelTable = this.getLabelTable();
    if (labelTable != null) {
      let labels = labelTable.elements();
      while (labels.hasMoreElements()) {
        let component = labels.nextElement();
        component.setSize$Dimension(component.getPreferredSize$());
      }
    }
  }
  /**
   * Creates a {@code Hashtable} of numerical text labels, starting at the
   * slider minimum, and using the increment specified.
   * For example, if you call <code>createStandardLabels( 10 )</code>
   * and the slider minimum is zero,
   * then labels will be created for the values 0, 10, 20, 30, and so on.
   * <p>
   * For the labels to be drawn on the slider, the returned {@code Hashtable}
   * must be passed into {@code setLabelTable}, and {@code setPaintLabels}
   * must be set to {@code true}.
   * <p>
   * For further details on the makeup of the returned {@code Hashtable}, see
   * the {@code setLabelTable} documentation.
   *
   * @param  increment  distance between labels in the generated hashtable
   * @return a new {@code Hashtable} of labels
   * @see #setLabelTable
   * @see #setPaintLabels
   * @throws IllegalArgumentException if {@code increment} is less than or
   *          equal to zero
   */
  createStandardLabels$int(increment: number): Hashtable<number, JComponent> {
    return this.createStandardLabels$int$int(increment, this.getMinimum());
  }
  /**
   * Creates a {@code Hashtable} of numerical text labels, starting at the
   * starting point specified, and using the increment specified.
   * For example, if you call
   * <code>createStandardLabels( 10, 2 )</code>,
   * then labels will be created for the values 2, 12, 22, 32, and so on.
   * <p>
   * For the labels to be drawn on the slider, the returned {@code Hashtable}
   * must be passed into {@code setLabelTable}, and {@code setPaintLabels}
   * must be set to {@code true}.
   * <p>
   * For further details on the makeup of the returned {@code Hashtable}, see
   * the {@code setLabelTable} documentation.
   *
   * @param  increment  distance between labels in the generated hashtable
   * @param  start      value at which the labels will begin
   * @return a new {@code Hashtable} of labels
   * @see #setLabelTable
   * @see #setPaintLabels
   * @throws IllegalArgumentException if {@code start} is
   *          out of range, or if {@code increment} is less than or equal
   *          to zero
   */
  createStandardLabels$int$int(increment: number, start: number): Hashtable<number, JComponent> {
    if (start > this.getMaximum() || start < this.getMinimum()) {
      throw new IllegalArgumentException('Slider label start point out of range.');
    }
    if (increment <= 0) {
      throw new IllegalArgumentException('Label incremement must be > 0');
    }
    // class SmartHashtable: JSlider$1SmartHashtable(), below
    let table = new (JSlider$1SmartHashtable())().$o(this)._SmartHashtable(increment, start);
    let labelTable = this.getLabelTable();
    var listener;
    if ($J.isa((listener = labelTable), PropertyChangeListener)) {
      this.removePropertyChangeListener$PropertyChangeListener(listener);
    }
    this.addPropertyChangeListener$PropertyChangeListener($J.fn(table, 'propertyChange'));
    return table;
  }
  /**
   * Returns true if the value-range shown for the slider is reversed,
   *
   * @return true if the slider values are reversed from their normal order
   * @see #setInverted
   */
  getInverted(): boolean {
    return this.isInverted;
  }
  /**
   * This method returns the major tick spacing.  The number that is returned
   * represents the distance, measured in values, between each major tick mark.
   * If you have a slider with a range from 0 to 50 and the major tick spacing
   * is set to 10, you will get major ticks next to the following values:
   * 0, 10, 20, 30, 40, 50.
   *
   * @return the number of values between major ticks
   * @see #setMajorTickSpacing
   */
  getMajorTickSpacing(): number {
    return this.majorTickSpacing;
  }
  /**
   * This method sets the major tick spacing.  The number that is passed in
   * represents the distance, measured in values, between each major tick mark.
   * If you have a slider with a range from 0 to 50 and the major tick spacing
   * is set to 10, you will get major ticks next to the following values:
   * 0, 10, 20, 30, 40, 50.
   * <p>
   * In order for major ticks to be painted, {@code setPaintTicks} must be
   * set to {@code true}.
   * <p>
   * This method will also set up a label table for you.
   * If there is not already a label table, and the major tick spacing is
   * {@code > 0}, and {@code getPaintLabels} returns
   * {@code true}, a standard label table will be generated (by calling
   * {@code createStandardLabels}) with labels at the major tick marks.
   * For the example above, you would get text labels: "0",
   * "10", "20", "30", "40", "50".
   * The label table is then set on the slider by calling
   * {@code setLabelTable}.
   *
   * @param  n  new value for the {@code majorTickSpacing} property
   * @see #getMajorTickSpacing
   * @see #setPaintTicks
   * @see #setLabelTable
   * @see #createStandardLabels(int)
   */
  setMajorTickSpacing(n: number): void {
    let oldValue = this.majorTickSpacing;
    this.majorTickSpacing = n;
    if (this.labelTable == null && this.getMajorTickSpacing() > 0 && this.getPaintLabels()) {
      this.setLabelTable(this.createStandardLabels$int(this.getMajorTickSpacing()));
    }
    this.firePropertyChange$String$int$int('majorTickSpacing', oldValue, this.majorTickSpacing);
    if (this.majorTickSpacing !== oldValue && this.getPaintTicks()) {
      this.repaint$();
    }
  }
  /**
   * This method returns the minor tick spacing.  The number that is returned
   * represents the distance, measured in values, between each minor tick mark.
   * If you have a slider with a range from 0 to 50 and the minor tick spacing
   * is set to 10, you will get minor ticks next to the following values:
   * 0, 10, 20, 30, 40, 50.
   *
   * @return the number of values between minor ticks
   * @see #getMinorTickSpacing
   */
  getMinorTickSpacing(): number {
    return this.minorTickSpacing;
  }
  /**
   * Returns true if the knob (and the data value it represents)
   * resolve to the closest tick mark next to where the user
   * positioned the knob.
   *
   * @return true if the value snaps to the nearest tick mark, else false
   * @see #setSnapToTicks
   */
  getSnapToTicks(): boolean {
    return this.snapToTicks;
  }
  /**
   * Specifying true makes the knob (and the data value it represents)
   * resolve to the closest tick mark next to where the user
   * positioned the knob.
   * By default, this property is {@code false}.
   *
   * @param b  true to snap the knob to the nearest tick mark
   * @see #getSnapToTicks
   */
  setSnapToTicks(b: boolean): void {
    let oldValue = this.snapToTicks;
    this.snapToTicks = b;
    this.firePropertyChange$String$boolean$boolean('snapToTicks', oldValue, this.snapToTicks);
  }
  /**
   * Tells if tick marks are to be painted.
   * @return true if tick marks are painted, else false
   * @see #setPaintTicks
   */
  getPaintTicks(): boolean {
    return this.paintTicks_;
  }
  /**
   * Determines whether tick marks are painted on the slider.
   * By default, this property is {@code false}.
   *
   * @param  b  whether or not tick marks should be painted
   * @see #getPaintTicks
   */
  setPaintTicks(b: boolean): void {
    let oldValue = this.paintTicks_;
    this.paintTicks_ = b;
    this.firePropertyChange$String$boolean$boolean('paintTicks', oldValue, this.paintTicks_);
    if (this.paintTicks_ !== oldValue) {
      this.revalidate();
      this.repaint$();
    }
  }
  /**
   * Tells if the track (area the slider slides in) is to be painted.
   * @return true if track is painted, else false
   * @see #setPaintTrack
   */
  getPaintTrack(): boolean {
    return this.paintTrack_;
  }
  /**
   * Tells if labels are to be painted.
   * @return true if labels are painted, else false
   * @see #setPaintLabels
   */
  getPaintLabels(): boolean {
    return this.paintLabels_;
  }
  /**
   * Determines whether labels are painted on the slider.
   * <p>
   * This method will also set up a label table for you.
   * If there is not already a label table, and the major tick spacing is
   * {@code > 0},
   * a standard label table will be generated (by calling
   * {@code createStandardLabels}) with labels at the major tick marks.
   * The label table is then set on the slider by calling
   * {@code setLabelTable}.
   * <p>
   * By default, this property is {@code false}.
   *
   * @param  b  whether or not to paint labels
   * @see #getPaintLabels
   * @see #getLabelTable
   * @see #createStandardLabels(int)
   */
  setPaintLabels(b: boolean): void {
    let oldValue = this.paintLabels_;
    this.paintLabels_ = b;
    if (this.labelTable == null && this.getMajorTickSpacing() > 0) {
      this.setLabelTable(this.createStandardLabels$int(this.getMajorTickSpacing()));
    }
    this.firePropertyChange$String$boolean$boolean('paintLabels', oldValue, this.paintLabels_);
    if (this.paintLabels_ !== oldValue) {
      this.revalidate();
      this.repaint$();
    }
  }
  /**
   * Returns a string representation of this JSlider. This method
   * is intended to be used only for debugging purposes, and the
   * content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not
   * be <code>null</code>.
   *
   * @return  a string representation of this JSlider.
   */
  paramString(): string {
    let paintTicksString = (this.paintTicks_ ? 'true' : 'false');
    let paintTrackString = (this.paintTrack_ ? 'true' : 'false');
    let paintLabelsString = (this.paintLabels_ ? 'true' : 'false');
    let isInvertedString = (this.isInverted ? 'true' : 'false');
    let snapToTicksString = (this.snapToTicks ? 'true' : 'false');
    let snapToValueString = (this.snapToValue ? 'true' : 'false');
    let orientationString = (this.orientation === SwingConstants.HORIZONTAL ? 'HORIZONTAL' : 'VERTICAL');
    return super.paramString() + ',isInverted=' + isInvertedString + ',majorTickSpacing=' + this.majorTickSpacing + ',minorTickSpacing=' + this.minorTickSpacing + ',orientation=' + orientationString + ',paintLabels=' + paintLabelsString + ',paintTicks=' + paintTicksString + ',paintTrack=' + paintTrackString + ',snapToTicks=' + snapToTicksString + ',snapToValue=' + snapToValueString;
  }
  /**
   * Gets the AccessibleContext associated with this JSlider.
   * For sliders, the AccessibleContext takes the form of an
   * AccessibleJSlider.
   * A new AccessibleJSlider instance is created if necessary.
   *
   * @return an AccessibleJSlider that serves as the
   *         AccessibleContext of this JSlider
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext == null) {
      this.accessibleContext = new JSlider$AccessibleJSlider().$o(this)._JSlider$AccessibleJSlider();
    }
    return this.accessibleContext;
  }
}

/**
 * We pass Change events along to the listeners with the
 * the slider (instead of the model itself) as the event source.
 */
export class JSlider$ModelListener extends JObject {
  _JSlider$ModelListener(): this {
    return this;
  }
  stateChanged(e: ChangeEvent): void {
    this.$outer.fireStateChanged();
  }
}

/**
 * This class implements accessibility support for the
 * <code>JSlider</code> class.  It provides an implementation of the
 * Java Accessibility API appropriate to slider user-interface elements.
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
export class JSlider$AccessibleJSlider extends JComponent$AccessibleJComponent {
  oldModelValue: number = 0;
  /**
   * constructs an AccessibleJSlider
   */
  _JSlider$AccessibleJSlider(): this {
    this._JComponent$AccessibleJComponent();
    this.oldModelValue = this.$outer.getModel().getValue();
    this.$outer.addChangeListener($J.fn(this, 'stateChanged'));
    return this;
  }
  /**
   * Invoked when the target of the listener has changed its state.
   *
   * @param e  a {@code ChangeEvent} object. Must not be {@code null}
   * @throws NullPointerException if the parameter is {@code null}
   */
  stateChanged(e: ChangeEvent): void {
    if (e == null) {
      throw new NullPointerException();
    }
    let newModelValue = this.$outer.getModel().getValue();
    this.firePropertyChange(AccessibleContext.ACCESSIBLE_VALUE_PROPERTY, this.oldModelValue, newModelValue);
    this.oldModelValue = newModelValue;
  }
}

let $JSlider$1SmartHashtable: any = null;
/** The local class SmartHashtable (JSlider.java:936). */
function JSlider$1SmartHashtable(): any {
  return $JSlider$1SmartHashtable ??= $J.local(class extends Hashtable {
    increment_: number = 0;
    start_: number = 0;
    startAtMin: boolean = false;
    _SmartHashtable(increment: number, start: number): this {
      this._Hashtable();
      this.increment_ = 0;
      this.start_ = 0;
      this.startAtMin = false;
      this.increment_ = increment;
      this.start_ = start;
      this.startAtMin = start === this.$outer.getMinimum();
      this.createLabels();
      return this;
    }
    propertyChange(e: PropertyChangeEvent): void {
      if ($J.equals(e.getPropertyName(), 'minimum') && this.startAtMin) {
        this.start_ = this.$outer.getMinimum();
      }
      if ($J.equals(e.getPropertyName(), 'minimum') || $J.equals(e.getPropertyName(), 'maximum')) {
        let keys = this.$outer.getLabelTable().keys();
        let hashtable = new Hashtable();
        while (keys.hasMoreElements()) {
          let key = keys.nextElement();
          let value = this.$outer.labelTable.get(key);
          if (!(value instanceof JSlider$1SmartHashtable$LabelUIResource)) {
            hashtable.put(key, value);
          }
        }
        this.clear();
        this.createLabels();
        keys = hashtable.keys();
        while (keys.hasMoreElements()) {
          let key = keys.nextElement();
          this.put(key, hashtable.get(key));
        }
        (e.getSource()).setLabelTable(this);
      }
    }
    createLabels(): void {
      for (let labelIndex = this.start_; labelIndex <= this.$outer.getMaximum(); labelIndex = (labelIndex + this.increment_) | 0) {
        this.put(labelIndex, new JSlider$1SmartHashtable$LabelUIResource().$o(this)._JSlider$1SmartHashtable$LabelUIResource('' + labelIndex, SwingConstants.CENTER));
      }
    }
  }, 'javax.swing.JSlider$1SmartHashtable', ['java.beans.PropertyChangeListener']);
}

$J.define(JSlider, 'javax.swing.JSlider', { kind: 'class', ifaces: ['javax.swing.SwingConstants', 'javax.accessibility.Accessible'], sup: 'javax.swing.JComponent', ctors: { 'javax.swing.BoundedRangeModel': '_JSlider$BoundedRangeModel', 'int,int,int,int': '_JSlider$int$int$int$int', 'int,int,int': '_JSlider$int$int$int', 'int,int': '_JSlider$int$int', 'int': '_JSlider$int', '': '_JSlider$' }, meths: { 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$JSlider', 'createStandardLabels(int,int)': 'createStandardLabels$int$int', 'createStandardLabels(int)': 'createStandardLabels$int', 'setUI(javax.swing.plaf.SliderUI)': 'setUI$SliderUI' } });
$J.define(JSlider$ModelListener, 'javax.swing.JSlider$ModelListener', { kind: 'class', ifaces: ['javax.swing.event.ChangeListener', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_JSlider$ModelListener' }, inner: true });
$J.define(JSlider$AccessibleJSlider, 'javax.swing.JSlider$AccessibleJSlider', { kind: 'class', ifaces: ['javax.accessibility.AccessibleValue', 'javax.swing.event.ChangeListener', 'javax.accessibility.AccessibleAction'], sup: 'javax.swing.JComponent$AccessibleJComponent', ctors: { '': '_JSlider$AccessibleJSlider' }, meths: { 'getAccessibleRole()': 'getAccessibleRole$', 'getAccessibleStateSet()': 'getAccessibleStateSet$' }, inner: true });
$J.module(() => {
  PropertyChangeListener = $J.load('java.beans.PropertyChangeListener');
  AccessibleContext = $J.load('javax.accessibility.AccessibleContext');
  AccessibleState = $J.load('javax.accessibility.AccessibleState');
  DefaultBoundedRangeModel = $J.load('javax.swing.DefaultBoundedRangeModel');
  JSlider$1SmartHashtable$LabelUIResource = $J.load('javax.swing.JSlider$1SmartHashtable$LabelUIResource');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  UIManager = $J.load('javax.swing.UIManager');
  ChangeEvent = $J.load('javax.swing.event.ChangeEvent');
  ChangeListener = $J.load('javax.swing.event.ChangeListener');
});
