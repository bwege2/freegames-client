// imlib/sprite.cpp: a picture drawn over the screen with the background kept (the mouse cursor)
import { linked_node } from './linked.ts';
import { image } from './image.ts';
import { G } from '../globals.ts';

export class sprite extends linked_node {
  visual: image;
  screen: image;
  save: image;
  x: number;
  y: number;

  constructor(Screen: image, Visual: image, X: number, Y: number) {
    super();
    this.x = X;
    this.y = Y;
    this.visual = Visual;
    this.screen = Screen;
    this.save = new image(Visual.w, Visual.h);
    this.get_background();
  }

  restore_background(): void {
    if (this.x + this.save.w >= 0 && this.y + this.save.h >= 0 && this.x <= G.xres && this.y <= G.yres)
      this.save.put_image(this.screen, this.x, this.y);
  }

  get_background(): void {
    if (this.x + this.visual.w >= 0 && this.y + this.visual.h >= 0 && this.x <= G.xres && this.y <= G.yres)
      this.screen.put_part(this.save, 0, 0, this.x, this.y, this.x + this.save.w - 1, this.y + this.save.h - 1);
  }

  draw(): void {
    if (this.x + this.visual.w >= 0 && this.y + this.visual.h >= 0 && this.x <= G.xres && this.y <= G.yres)
      this.visual.put_image(this.screen, this.x, this.y, 1);
  }

  change_visual(Visual: image): void {
    this.visual = Visual;
    if (this.save.w !== Visual.w || this.save.h !== Visual.h) this.save = new image(Visual.w, Visual.h);
    this.get_background();
  }
}
