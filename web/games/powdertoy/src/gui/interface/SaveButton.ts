// gui/interface/SaveButton.h / SaveButton.cpp: the SaveFile (local save / stamp) parts. The SaveInfo parts (online
// saves: votes, author, history, server thumbnails) are not ported: the port has no save server.
// Thumbnails come from SaveRenderer synchronously (the original's ThumbnailRendererTask runs on a thread).
import { Component } from './Engine.ts';
import { ContextMenu, ContextMenuItem } from './ContextMenu.ts';
import { WithAlpha, type Point } from './Point.ts';
import { TextSize, TextFit, VideoBuffer } from '../../graphics/raster.ts';
import { decorationEnabled } from '../../graphics/renderer.ts';
import { RenderThumbnail } from '../SaveRenderer.ts';
import { ErrorMessage } from '../dialogues/Dialogues.ts';
import { XRES, YRES } from '../../sim/config.ts';
import { SDL_BUTTON_RIGHT } from './Keys.ts';
import type { SaveFile } from '../../game/Client.ts';

export interface SaveButtonAction {
  action?: (() => void) | null;
  altAction?: (() => void) | null;
  altAltAction?: (() => void) | null;
  selected?: (() => void) | null;
}

export class SaveButton extends Component {
  private file: SaveFile | null = null; // non-owning
  private thumbnail: VideoBuffer | null = null;
  private thumbSize: Point = { X: 0, Y: 0 };
  private name = '';
  private wantsDraw = false;
  private triedThumbnail = false;
  private isMouseInsideAuthor = false;
  private isMouseInsideHistory = false;
  private actionCallback: SaveButtonAction = {};
  protected isButtonDown = false;
  protected state = false;
  protected isMouseInside = false;
  protected selected = false;
  protected selectable = false;

  /** SaveButton(Point position, Point size, SaveFile *newFile) */
  constructor(position: Point, size: Point, newFile: SaveFile | null) {
    super(position, size);
    this.file = newFile;
    if (this.file) {
      this.name = this.file.GetDisplayName();
      if (TextSize(this.name).X - 1 > this.Size.X) {
        const it = TextFit(this.name, this.Size.X - (this.Appearance.icon ? 38 : 22));
        this.name = this.name.slice(0, it);
        this.name += '...';
      }
    }
  }

  override Tick(): void {
    if (!this.thumbnail) {
      // ThumbnailRendererTask::QueueSize() < 10: always, the port renders at once
      if (!this.triedThumbnail && this.wantsDraw) {
        const scaleFactor = Math.fround((this.Size.Y - 25) / Math.fround(YRES));
        const thumbBoxSize = { X: Math.trunc(XRES * scaleFactor), Y: Math.trunc(YRES * scaleFactor) };
        // (save: online saves, not ported)
        if (this.file && this.file.GetGameSave()) {
          this.thumbnail = RenderThumbnail(this.file.GetGameSave()!, thumbBoxSize.X, thumbBoxSize.Y, decorationEnabled, false);
          this.triedThumbnail = true;
        }
      }

      if (this.thumbnail && this.file) {
        this.thumbSize = this.thumbnail.Size();
      }
    }
    if (this.file && !this.wantsDraw) {
      this.file.LazyUnload();
    }
    this.wantsDraw = false;
  }

  override Draw(screenPos: Point): void {
    const g = this.GetGraphics();
    const scaleFactor = Math.fround((this.Size.Y - 25) / Math.fround(YRES));
    const thumbBoxSize = { X: Math.trunc(XRES * scaleFactor), Y: Math.trunc(YRES * scaleFactor) };

    this.wantsDraw = true;

    if (this.selected && this.selectable) {
      g.BlendFilledRect(screenPos.X, screenPos.Y, this.Size.X, this.Size.Y, WithAlpha(0x64AAFF, 100));
    }

    if (this.thumbnail) {
      const tex = this.thumbnail;
      const spaceX = this.Size.X, spaceY = this.Size.Y - 21;
      const ts = tex.Size();
      g.BlendImage(tex.Data(), 255, screenPos.X + (((spaceX - this.thumbSize.X) / 2) | 0), screenPos.Y + (((spaceY - this.thumbSize.Y) / 2) | 0), ts.X, ts.Y);
    } else if (this.file && !this.file.LazyGetGameSave()) {
      g.BlendText(screenPos.X + (((this.Size.X - (TextSize('Error loading save').X - 1)) / 2) | 0), screenPos.Y + (((this.Size.Y - 28) / 2) | 0),
        'Error loading save', WithAlpha(0xB4B4B4, 255));
    }
    if (this.file) {
      g.DrawRect(screenPos.X + (((this.Size.X - thumbBoxSize.X) / 2) | 0), screenPos.Y + (((this.Size.Y - thumbBoxSize.Y - 21) / 2) | 0),
        thumbBoxSize.X, thumbBoxSize.Y, this.isMouseInside ? 0xD2E6FF : 0xB4B4B4);
      if (this.thumbSize.X)
        g.XorDottedRect(screenPos.X + (((this.Size.X - this.thumbSize.X) / 2) | 0), screenPos.Y + (((this.Size.Y - this.thumbSize.Y - 21) / 2) | 0),
          this.thumbSize.X, this.thumbSize.Y);

      g.BlendText(screenPos.X + (((this.Size.X - (TextSize(this.name).X - 1)) / 2) | 0), screenPos.Y + this.Size.Y - 21, this.name,
        this.isMouseInside ? WithAlpha(0xFFFFFF, 255) : WithAlpha(0xB4B4B4, 255));
    }

    if (this.isMouseInside && this.selectable) {
      g.DrawFilledRect(screenPos.X + this.Size.X - 19, screenPos.Y + 7, 13, 13, 0x000000);
      g.DrawRect(screenPos.X + this.Size.X - 20, screenPos.Y + 6, 14, 14, 0xFFFFFF);
      if (this.selected)
        g.DrawFilledRect(screenPos.X + this.Size.X - 18, screenPos.Y + 8, 10, 10, 0xFFFFFF);
    }
  }

  override OnMouseClick(x: number, y: number, button: number): void {
    if (button !== 1) {
      return; //left click only!
    }

    if (x >= this.Size.X - 20 && y >= 6 && y <= 20 && x <= this.Size.X - 6 && this.selectable) {
      this.selected = !this.selected;
      this.DoSelection();
      return;
    }

    if (this.file && !this.file.LazyGetGameSave()) {
      new ErrorMessage('Error loading save', this.file.GetError());
      return;
    }

    if (this.isButtonDown) {
      this.isButtonDown = false;
      if (this.isMouseInsideHistory)
        this.DoAltAction();
      else if (this.isMouseInsideAuthor)
        this.DoAltAction2();
      else
        this.DoAction();
    }
  }

  AddContextMenu(menuType: number): void {
    if (menuType === 0) { //Save browser
      // online save browser: not ported
    } else if (menuType === 1) { //Local save browser
      const menu = new ContextMenu(this);
      this.menu = menu;
      menu.AddItem(new ContextMenuItem('Open', 0, true));
      menu.AddItem(new ContextMenuItem('Rename', 2, true));
      menu.AddItem(new ContextMenuItem('Delete', 3, true));
    }
  }

  override OnContextMenuAction(item: number): void {
    switch (item) {
      case 0:
        this.DoAction();
        break;
      case 1:
        this.selected = !this.selected;
        this.DoSelection();
        break;
      case 2:
        this.DoAltAction();
        break;
      case 3:
        this.DoAltAction2();
        break;
    }
  }

  override OnMouseDown(x: number, y: number, button: number): void {
    if (this.MouseDownInside) {
      if (button === SDL_BUTTON_RIGHT) {
        if (this.menu) {
          const c = this.GetContainerPos();
          this.menu.Show({ X: c.X + x, Y: c.Y + y });
        }
      } else {
        this.isButtonDown = true;
        if (button !== 1 && this.selectable) {
          this.selected = !this.selected;
          this.DoSelection();
        }
      }
    }
  }

  override OnMouseMoved(x: number, y: number): void {
    this.isMouseInsideAuthor = false;
    this.isMouseInsideHistory = false;
    if (this.MouseInside) {
      // (as in the original, also for SaveFile buttons: a left click there calls the alt actions)
      if (y > this.Size.Y - 11)
        this.isMouseInsideAuthor = true;

      if (y > this.Size.Y - 29 && y < this.Size.Y - 18 && x > 0 && x < 9)
        this.isMouseInsideHistory = true;
    }
  }

  override OnMouseEnter(_x: number, _y: number): void {
    this.isMouseInside = true;
  }

  override OnMouseLeave(_x: number, _y: number): void {
    this.isMouseInside = false;
    this.isMouseInsideAuthor = false;
    this.isMouseInsideHistory = false;
  }

  DoAltAction(): void {
    if (this.actionCallback.altAction)
      this.actionCallback.altAction();
  }

  DoAltAction2(): void {
    if (this.actionCallback.altAltAction)
      this.actionCallback.altAltAction();
  }

  DoAction(): void {
    if (this.actionCallback.action)
      this.actionCallback.action();
  }

  DoSelection(): void {
    if (this.menu) {
      if (this.selected)
        this.menu.SetItem(1, 'Deselect');
      else
        this.menu.SetItem(1, 'Select');
    }
    if (this.selectable && this.actionCallback.selected)
      this.actionCallback.selected();
  }

  SetSelected(selected_: boolean): void { this.selected = selected_; }
  GetSelected(): boolean { return this.selected; }
  SetSelectable(selectable_: boolean): void { this.selectable = selectable_; }
  GetSelectable(): boolean { return this.selectable; }
  /** SetShowVotes: votes belong to online saves (not ported) */
  SetShowVotes(_showVotes: boolean): void { }
  GetSaveFile(): SaveFile | null { return this.file; }
  GetState(): boolean { return this.state; }
  SetActionCallback(action: SaveButtonAction): void { this.actionCallback = action; }

  CloneThumbnail(): VideoBuffer | null {
    if (this.thumbnail) {
      const s = this.thumbnail.Size();
      return new VideoBuffer(s.X, s.Y, this.thumbnail.Data());
    }
    return null;
  }
}
