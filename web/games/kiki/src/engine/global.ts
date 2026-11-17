// The original's global `KikiController Controller` (src/main/KikiController.cpp). One per running game
// (and one per headless test); installed by the KikiController constructor.
import type { KikiController } from './controller.ts';

export let Controller: KikiController = null as unknown as KikiController;

export function installController(c: KikiController): void {
  Controller = c;
}
