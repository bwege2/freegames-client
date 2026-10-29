// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JLayer.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2009, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { JComponent } from './JComponent.ts';

let AWTEvent, Component, ComponentEvent, ContainerEvent, FocusEvent, HierarchyEvent, InputEvent, InputMethodEvent, KeyEvent, MouseEvent;

/**
 * {@code JLayer} is a universal decorator for Swing components
 * which enables you to implement various advanced painting effects as well as
 * receive notifications of all {@code AWTEvent}s generated within its borders.
 * <p>
 * {@code JLayer} delegates the handling of painting and input events to a
 * {@link javax.swing.plaf.LayerUI} object, which performs the actual decoration.
 * <p>
 * The custom painting implemented in the {@code LayerUI} and events notification
 * work for the JLayer itself and all its subcomponents.
 * This combination enables you to enrich existing components
 * by adding new advanced functionality such as temporary locking of a hierarchy,
 * data tips for compound components, enhanced mouse scrolling etc and so on.
 * <p>
 * {@code JLayer} is a good solution if you only need to do custom painting
 * over compound component or catch input events from its subcomponents.
 * <pre>
 * import javax.swing.*;
 * import javax.swing.plaf.LayerUI;
 * import java.awt.*;
 *
 * public class JLayerSample {
 *
 *     private static JLayer&lt;JComponent&gt; createLayer() {
 *         // This custom layerUI will fill the layer with translucent green
 *         // and print out all mouseMotion events generated within its borders
 *         LayerUI&lt;JComponent&gt; layerUI = new LayerUI&lt;JComponent&gt;() {
 *
 *             public void paint(Graphics g, JComponent c) {
 *                 // paint the layer as is
 *                 super.paint(g, c);
 *                 // fill it with the translucent green
 *                 g.setColor(new Color(0, 128, 0, 128));
 *                 g.fillRect(0, 0, c.getWidth(), c.getHeight());
 *             }
 *
 *             public void installUI(JComponent c) {
 *                 super.installUI(c);
 *                 // enable mouse motion events for the layer's subcomponents
 *                 ((JLayer) c).setLayerEventMask(AWTEvent.MOUSE_MOTION_EVENT_MASK);
 *             }
 *
 *             public void uninstallUI(JComponent c) {
 *                 super.uninstallUI(c);
 *                 // reset the layer event mask
 *                 ((JLayer) c).setLayerEventMask(0);
 *             }
 *
 *             // overridden method which catches MouseMotion events
 *             public void eventDispatched(AWTEvent e, JLayer&lt;? extends JComponent&gt; l) {
 *                 System.out.println("AWTEvent detected: " + e);
 *             }
 *         };
 *         // create a component to be decorated with the layer
 *         JPanel panel = new JPanel();
 *         panel.add(new JButton("JButton"));
 *
 *         // create the layer for the panel using our custom layerUI
 *         return new JLayer&lt;JComponent&gt;(panel, layerUI);
 *     }
 *
 *     private static void createAndShowGUI() {
 *         final JFrame frame = new JFrame();
 *         frame.setDefaultCloseOperation(WindowConstants.EXIT_ON_CLOSE);
 *
 *         // work with the layer as with any other Swing component
 *         frame.add(createLayer());
 *
 *         frame.setSize(200, 200);
 *         frame.setLocationRelativeTo(null);
 *         frame.setVisible(true);
 *     }
 *
 *     public static void main(String[] args) throws Exception {
 *         SwingUtilities.invokeAndWait(new Runnable() {
 *             public void run() {
 *                 createAndShowGUI();
 *             }
 *         });
 *     }
 * }
 * </pre>
 *
 * <b>Note:</b> {@code JLayer} doesn't support the following methods:
 * <ul>
 * <li>{@link Container#add(java.awt.Component)}</li>
 * <li>{@link Container#add(String, java.awt.Component)}</li>
 * <li>{@link Container#add(java.awt.Component, int)}</li>
 * <li>{@link Container#add(java.awt.Component, Object)}</li>
 * <li>{@link Container#add(java.awt.Component, Object, int)}</li>
 * </ul>
 * using any of them will cause {@code UnsupportedOperationException} to be thrown,
 * to add a component to {@code JLayer}
 * use {@link #setView(Component)} or {@link #setGlassPane(JPanel)}.
 *
 * @param <V> the type of {@code JLayer}'s view component
 *
 * @see #JLayer(Component)
 * @see #setView(Component)
 * @see #getView()
 * @see javax.swing.plaf.LayerUI
 * @see #JLayer(Component, LayerUI)
 * @see #setUI(javax.swing.plaf.LayerUI)
 * @see #getUI()
 * @since 1.7
 *
 * @author Alexander Potochkin
 */
export class JLayer<V> extends JComponent {
  view: V = null;
  layerUI: LayerUI<any> = null;
  glassPane: JPanel = null;
  eventMask$JLayer: number = 0;
  isPaintCalling: boolean = false;
  isPaintImmediatelyCalling: boolean = false;
  isImageUpdateCalling: boolean = false;
  static eventController: JLayer$LayerEventController = null;
}

/**
 * static AWTEventListener to be shared with all AbstractLayerUIs
 */
export class JLayer$LayerEventController extends JObject {
  layerMaskList: ArrayList<number> = null;
  currentEventMask: number = 0;
  static readonly ACCEPTED_EVENTS: number = 231487;
  eventDispatched(event: AWTEvent): void {
    let source = event.getSource();
    if (source instanceof Component) {
      let component = source;
      while (component != null) {
        if (component instanceof JLayer) {
          let l = component;
          let ui = l.getUI();
          if (ui != null && this.isEventEnabled(l.getLayerEventMask(), event.getID()) && (!(event instanceof InputEvent) || !(event).isConsumed())) {
            ui.eventDispatched(event, l);
          }
        }
        component = component.getParent();
      }
    }
  }
  isEventEnabled(eventMask: number, id: number): boolean {
    return ((($J.land(eventMask, AWTEvent.COMPONENT_EVENT_MASK)) !== 0 && id >= ComponentEvent.COMPONENT_FIRST && id <= ComponentEvent.COMPONENT_LAST) || (($J.land(eventMask, AWTEvent.CONTAINER_EVENT_MASK)) !== 0 && id >= ContainerEvent.CONTAINER_FIRST && id <= ContainerEvent.CONTAINER_LAST) || (($J.land(eventMask, AWTEvent.FOCUS_EVENT_MASK)) !== 0 && id >= FocusEvent.FOCUS_FIRST && id <= FocusEvent.FOCUS_LAST) || (($J.land(eventMask, AWTEvent.KEY_EVENT_MASK)) !== 0 && id >= KeyEvent.KEY_FIRST && id <= KeyEvent.KEY_LAST) || (($J.land(eventMask, AWTEvent.MOUSE_WHEEL_EVENT_MASK)) !== 0 && id === MouseEvent.MOUSE_WHEEL) || (($J.land(eventMask, AWTEvent.MOUSE_MOTION_EVENT_MASK)) !== 0 && (id === MouseEvent.MOUSE_MOVED || id === MouseEvent.MOUSE_DRAGGED)) || (($J.land(eventMask, AWTEvent.MOUSE_EVENT_MASK)) !== 0 && id !== MouseEvent.MOUSE_MOVED && id !== MouseEvent.MOUSE_DRAGGED && id !== MouseEvent.MOUSE_WHEEL && id >= MouseEvent.MOUSE_FIRST && id <= MouseEvent.MOUSE_LAST) || (($J.land(eventMask, AWTEvent.INPUT_METHOD_EVENT_MASK)) !== 0 && id >= InputMethodEvent.INPUT_METHOD_FIRST && id <= InputMethodEvent.INPUT_METHOD_LAST) || (($J.land(eventMask, AWTEvent.HIERARCHY_EVENT_MASK)) !== 0 && id === HierarchyEvent.HIERARCHY_CHANGED) || (($J.land(eventMask, AWTEvent.HIERARCHY_BOUNDS_EVENT_MASK)) !== 0 && (id === HierarchyEvent.ANCESTOR_MOVED || id === HierarchyEvent.ANCESTOR_RESIZED)));
  }
}

$J.define(JLayer, 'javax.swing.JLayer', { kind: 'class', ifaces: ['javax.swing.Scrollable', 'java.beans.PropertyChangeListener', 'javax.accessibility.Accessible'], sup: 'javax.swing.JComponent', ctors: { 'java.awt.Component,javax.swing.plaf.LayerUI': '_JLayer$Component$LayerUI', 'java.awt.Component': '_JLayer$Component', '': '_JLayer$' }, meths: { 'readObject(java.io.ObjectInputStream)': 'readObject$ObjectInputStream$JLayer', 'paintImmediately(int,int,int,int)': 'paintImmediately$int$int$int$int', 'remove(java.awt.Component)': 'remove$Component', 'setUI(javax.swing.plaf.LayerUI)': 'setUI$LayerUI' } });
$J.define(JLayer$LayerEventController, 'javax.swing.JLayer$LayerEventController', { kind: 'class', ifaces: ['java.awt.event.AWTEventListener'], sup: 'java.lang.Object', ctors: { '': '_JLayer$LayerEventController' } });
$J.module(() => {
  AWTEvent = $J.load('java.awt.AWTEvent');
  Component = $J.load('java.awt.Component');
  ComponentEvent = $J.load('java.awt.event.ComponentEvent');
  ContainerEvent = $J.load('java.awt.event.ContainerEvent');
  FocusEvent = $J.load('java.awt.event.FocusEvent');
  HierarchyEvent = $J.load('java.awt.event.HierarchyEvent');
  InputEvent = $J.load('java.awt.event.InputEvent');
  InputMethodEvent = $J.load('java.awt.event.InputMethodEvent');
  KeyEvent = $J.load('java.awt.event.KeyEvent');
  MouseEvent = $J.load('java.awt.event.MouseEvent');
});
