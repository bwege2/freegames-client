// Chromium B.S.U. port (GPL-3.0-or-later; translated in 2026 by the freegames project from the original by Mark B. Allan, Clarified Artistic License; LICENSE.md): src/ScreenItem.cpp.
export const ItemHero = 0, ItemEnemy = 1, ItemPowerUp = 2;

export class ScreenItem {
  pos = new Float32Array(3);
  vel = new Float32Array(3);
  age = 0;
  readonly itemType: number;

  constructor(t: number) {
    this.itemType = t;
    this.initItem();
  }

  /** ScreenItem::init() */
  initItem(): void {
    this.pos[0] = 0.0; this.pos[1] = 0.0; this.pos[2] = 0.0;
    this.age = 0;
  }

  getPos(): Float32Array {
    return this.pos;
  }
}
