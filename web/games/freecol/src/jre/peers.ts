// @ts-nocheck
// java.awt.peer: the interfaces between AWT components and the platform. The client's platform layer
// (src/port/client/peers.ts) implements them for the browser.
import { defineLib } from './lang.ts';

function iface(name: string, javaName: string, supers: string[] = []): any {
  const C = { [name]: class {} }[name];
  defineLib(C, javaName, { kind: 'interface', ifaces: supers });
  return C;
}

export const ComponentPeer = iface('ComponentPeer', 'java.awt.peer.ComponentPeer');
Object.assign(ComponentPeer, { SET_LOCATION: 1, SET_SIZE: 2, SET_BOUNDS: 3, SET_CLIENT_SIZE: 4, RESET_OPERATION: 5, NO_EMBEDDED_CHECK: 16384, DEFAULT_OPERATION: 3 });
export const ContainerPeer = iface('ContainerPeer', 'java.awt.peer.ContainerPeer', ['java.awt.peer.ComponentPeer']);
export const LightweightPeer = iface('LightweightPeer', 'java.awt.peer.LightweightPeer', ['java.awt.peer.ComponentPeer']);
export const CanvasPeer = iface('CanvasPeer', 'java.awt.peer.CanvasPeer', ['java.awt.peer.ComponentPeer']);
export const PanelPeer = iface('PanelPeer', 'java.awt.peer.PanelPeer', ['java.awt.peer.ContainerPeer']);
export const WindowPeer = iface('WindowPeer', 'java.awt.peer.WindowPeer', ['java.awt.peer.ContainerPeer']);
export const FramePeer = iface('FramePeer', 'java.awt.peer.FramePeer', ['java.awt.peer.WindowPeer']);
export const DialogPeer = iface('DialogPeer', 'java.awt.peer.DialogPeer', ['java.awt.peer.WindowPeer']);
export const KeyboardFocusManagerPeer = iface('KeyboardFocusManagerPeer', 'java.awt.peer.KeyboardFocusManagerPeer');
export const MouseInfoPeer = iface('MouseInfoPeer', 'java.awt.peer.MouseInfoPeer');
export const DesktopPeer = iface('DesktopPeer', 'java.awt.peer.DesktopPeer');
export const FontPeer = iface('FontPeer', 'java.awt.peer.FontPeer');
export const MenuComponentPeer = iface('MenuComponentPeer', 'java.awt.peer.MenuComponentPeer');
export const RobotPeer = iface('RobotPeer', 'java.awt.peer.RobotPeer');
