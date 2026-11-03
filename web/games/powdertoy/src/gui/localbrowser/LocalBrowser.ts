// gui/localbrowser/LocalBrowserController.cpp/.h, LocalBrowserModel.cpp/.h, LocalBrowserView.cpp/.h: the stamp
// browser (K). Stamps come from Client (the player's storage).
import { Window } from '../interface/Engine.ts';
import { Button } from '../interface/Button.ts';
import { Label, Textbox, ValidInput } from '../interface/Label.ts';
import { AlignLeft, AlignMiddle, AlignRight } from '../interface/Appearance.ts';
import { SaveButton } from '../interface/SaveButton.ts';
import { GetTicks, SDLK_ESCAPE, SDLK_AC_BACK, SDLK_LCTRL, SDLK_RCTRL } from '../interface/Keys.ts';
import { ConfirmPrompt, ErrorMessage, TextPrompt } from '../dialogues/Dialogues.ts';
import { ToNumberInt } from '../Format.ts';
import { TextSize } from '../../graphics/raster.ts';
import { WINDOWW, WINDOWH } from '../../sim/config.ts';
import { Client, type SaveFile } from '../../game/Client.ts';

const pageSize = 20;

// ---------------------------------------------------------------------------------------------------------------
// LocalBrowserModel

export class LocalBrowserModel {
  private selected: string[] = [];
  private stamp: SaveFile | null = null;
  private stampIDs: string[] = [];
  private savesList: SaveFile[] = [];
  private observers: LocalBrowserView[] = [];
  private currentPage = 0;
  private currentQuery = '';
  private stampToFront = true;

  constructor() {
    this.stampIDs = Client.Ref().GetStamps().slice();
  }

  GetSavesList(): SaveFile[] { // non-owning
    return this.savesList.slice();
  }

  AddObserver(observer: LocalBrowserView): void {
    this.observers.push(observer);
    observer.NotifySavesListChanged(this);
    observer.NotifyPageChanged(this);
  }

  private notifySavesListChanged(): void {
    for (let i = 0; i < this.observers.length; i++) {
      this.observers[i].NotifySavesListChanged(this);
      this.observers[i].NotifyPageChanged(this);
    }
  }

  private notifyPageChanged(): void {
    for (let i = 0; i < this.observers.length; i++) {
      this.observers[i].NotifyPageChanged(this);
    }
  }

  GetSave(): SaveFile | null {
    return this.stamp;
  }

  TakeSave(): SaveFile | null {
    const s = this.stamp;
    this.stamp = null;
    return s;
  }

  OpenSave(index: number): void {
    this.stamp = this.savesList[index];
    this.savesList = [];
    this.notifyPageChanged();
    this.notifySavesListChanged();
  }

  GetMoveToFront(): boolean {
    return this.stampToFront;
  }

  SetMoveToFront(move: boolean): void {
    this.stampToFront = move;
  }

  UpdateSavesList(query: string, pageNumber: number): void {
    this.ClearSelected();
    this.savesList = [];
    this.currentQuery = query;
    this.currentPage = pageNumber;

    this.stampIDs = Client.Ref().GetStamps().slice();
    let found = 0;
    for (const id of this.stampIDs) {
      if (!(!query.length || id.includes(query))) {
        continue;
      }
      if (found >= this.currentPage * pageSize && found < (this.currentPage + 1) * pageSize) {
        const tempSave = Client.Ref().GetStamp(id);
        if (tempSave) {
          this.savesList.push(tempSave);
        }
      }
      found += 1;
    }
    this.notifyPageChanged();
    this.notifySavesListChanged();
  }

  RescanStamps(): void {
    Client.Ref().RescanStamps();
  }

  GetPageCount(): number {
    const size = this.stampIDs.length;
    const count = ((size / pageSize) | 0) + ((size % pageSize) ? 1 : 0);
    return count ? count : 1; // there is always at least one page; there may not be anything on it though
  }
  GetPageNum(): number { return this.currentPage; }
  GetQuery(): string { return this.currentQuery; }
  GetSelected(): string[] { return this.selected.slice(); }
  ClearSelected(): void { this.selected = []; this.notifySelectedChanged(); }

  SelectSave(stampID: string): void {
    if (this.selected.includes(stampID)) {
      return;
    }
    this.selected.push(stampID);
    this.notifySelectedChanged();
  }

  DeselectSave(stampID: string): void {
    const remaining = this.selected.filter((s) => s !== stampID);
    if (remaining.length !== this.selected.length) {
      this.selected = remaining;
      this.notifySelectedChanged();
    }
  }

  private notifySelectedChanged(): void {
    for (let i = 0; i < this.observers.length; i++) {
      const cObserver = this.observers[i];
      cObserver.NotifySelectedChanged(this);
    }
  }
}

// ---------------------------------------------------------------------------------------------------------------
// LocalBrowserView

export class LocalBrowserView extends Window {
  private c!: LocalBrowserController;
  private stampButtons: SaveButton[] = [];
  private undeleteButton: Button;
  private previousButton: Button;
  private nextButton: Button;
  private pageLabel: Label;
  private pageCountLabel: Label;
  private pageTextbox: Textbox;
  private searchTextbox: Textbox;
  private removeSelected: Button;
  private renameSelected: Button;
  private changed = false;
  private lastChanged = 0;
  private pageCount = 0;

  constructor() {
    super({ X: 0, Y: 0 }, { X: WINDOWW, Y: WINDOWH });
    this.nextButton = new Button({ X: WINDOWW - 52, Y: WINDOWH - 18 }, { X: 50, Y: 16 }, 'Next ' + String.fromCharCode(0xE015));
    this.previousButton = new Button({ X: 2, Y: WINDOWH - 18 }, { X: 50, Y: 16 }, String.fromCharCode(0xE016) + ' Prev');
    this.undeleteButton = new Button({ X: WINDOWW - 122, Y: WINDOWH - 18 }, { X: 60, Y: 16 }, 'Rescan');
    this.AddComponent(this.nextButton);
    this.AddComponent(this.previousButton);
    this.AddComponent(this.undeleteButton);

    this.searchTextbox = new Textbox({ X: 30, Y: 25 }, { X: this.Size.X - 60, Y: 16 }, '', '[search]');
    this.searchTextbox.Appearance.VerticalAlign = AlignMiddle;
    this.searchTextbox.Appearance.HorizontalAlign = AlignLeft;
    this.searchTextbox.SetActionCallback({ change: () => { this.searchChanged(); } });
    this.AddComponent(this.searchTextbox);
    this.FocusComponent(this.searchTextbox);

    this.pageTextbox = new Textbox({ X: 283, Y: WINDOWH - 18 }, { X: 41, Y: 16 }, '');
    this.pageTextbox.SetActionCallback({ change: () => { this.pageChanged(); } });
    this.pageTextbox.SetInputType(ValidInput.Number);
    this.pageLabel = new Label({ X: 0, Y: WINDOWH - 18 }, { X: 30, Y: 16 }, 'Page'); //page [TEXTBOX] of y
    this.pageLabel.Appearance.HorizontalAlign = AlignRight;
    this.pageCountLabel = new Label({ X: ((WINDOWW / 2) | 0) + 6, Y: WINDOWH - 18 }, { X: 50, Y: 16 }, '');
    this.pageCountLabel.Appearance.HorizontalAlign = AlignLeft;
    this.AddComponent(this.pageLabel);
    this.AddComponent(this.pageCountLabel);
    this.AddComponent(this.pageTextbox);

    this.nextButton.SetActionCallback({ action: () => { this.c.SetPageRelative(1); } });
    this.nextButton.Appearance.HorizontalAlign = AlignRight;
    this.nextButton.Appearance.VerticalAlign = AlignMiddle;

    this.previousButton.SetActionCallback({ action: () => { this.c.SetPageRelative(-1); } });
    this.previousButton.Appearance.HorizontalAlign = AlignLeft;
    this.previousButton.Appearance.VerticalAlign = AlignMiddle;

    this.undeleteButton.SetActionCallback({ action: () => { this.c.RescanStamps(); } });

    this.removeSelected = new Button({ X: ((WINDOWW - 100) / 2) | 0, Y: WINDOWH - 18 }, { X: 100, Y: 16 }, 'Delete');
    this.removeSelected.Visible = false;
    this.removeSelected.SetActionCallback({ action: () => { this.c.RemoveSelected(); } });

    this.renameSelected = new Button({ X: (((WINDOWW - 100) / 2) | 0) + 52, Y: WINDOWH - 18 }, { X: 100, Y: 16 }, 'Rename');
    this.renameSelected.Visible = false;
    this.renameSelected.SetActionCallback({ action: () => { this.c.RenameSelected(); } });

    this.AddComponent(this.removeSelected);
    this.AddComponent(this.renameSelected);
  }

  AttachController(c_: LocalBrowserController): void { this.c = c_; }

  private searchChanged(): void {
    this.pageTextbox.SetText('1');
    this.changed = true;
    this.lastChanged = GetTicks() + 600;
  }

  private pageChanged(): void {
    const num = ToNumberInt(this.pageTextbox.GetText(), true);
    if (num < 0) //0 is allowed so that you can backspace the 1
      this.pageTextbox.SetText('1');
    else if (num > this.pageCount)
      this.pageTextbox.SetText(String(this.pageCount));
    this.changed = true;
    this.lastChanged = GetTicks() + 600;
  }

  protected override OnTick(): void {
    this.c.Update();
    if (this.changed && this.lastChanged < GetTicks()) {
      this.changed = false;
      this.c.SetSearch(this.searchTextbox.GetText(), Math.max(ToNumberInt(this.pageTextbox.GetText(), true) - 1, 0));
    }
  }

  NotifyPageChanged(sender: LocalBrowserModel): void {
    this.pageCount = sender.GetPageCount();
    if (!sender.GetSavesList().length) { //no saves
      this.pageLabel.Visible = this.pageCountLabel.Visible = this.pageTextbox.Visible = false;
    } else {
      const pageInfo = 'of ' + this.pageCount;
      this.pageCountLabel.SetText(pageInfo);
      const width = TextSize(pageInfo).X - 1;

      this.pageLabel.Position.X = ((WINDOWW / 2) | 0) - width - 20;
      this.pageTextbox.Position.X = ((WINDOWW / 2) | 0) - width + 11;
      this.pageTextbox.Size.X = width - 4;
      //pageCountLabel->Position.X = WINDOWW/2+6;
      this.pageLabel.Visible = this.pageCountLabel.Visible = this.pageTextbox.Visible = true;

      this.pageTextbox.SetText(String(sender.GetPageNum() + 1));
    }

    if (sender.GetPageNum() === 0) {
      this.previousButton.Visible = false;
    } else {
      this.previousButton.Visible = true;
    }
    if (sender.GetPageNum() === sender.GetPageCount() - 1) {
      this.nextButton.Visible = false;
    } else {
      this.nextButton.Visible = true;
    }
  }

  NotifySavesListChanged(sender: LocalBrowserModel): void {
    let saveX = 0, saveY = 0;
    const savesX = 5, savesY = 4, buttonPadding = 2;

    const saves = sender.GetSavesList(); // non-owning
    for (let i = 0; i < this.stampButtons.length; i++) {
      this.RemoveComponent(this.stampButtons[i]);
    }
    this.stampButtons = [];
    const buttonXOffset = 0;
    const buttonYOffset = 50;
    const buttonAreaWidth = this.Size.X;
    const buttonAreaHeight = this.Size.Y - buttonYOffset - 18;
    const buttonWidth = ((buttonAreaWidth / savesX) | 0) - buttonPadding * 2;
    const buttonHeight = ((buttonAreaHeight / savesY) | 0) - buttonPadding * 2;
    for (let i = 0; i < saves.length; i++) {
      if (saveX === savesX) {
        if (saveY === savesY - 1)
          break;
        saveX = 0;
        saveY++;
      }
      const saveButton = new SaveButton(
        {
          X: buttonXOffset + buttonPadding + saveX * (buttonWidth + buttonPadding * 2),
          Y: buttonYOffset + buttonPadding + saveY * (buttonHeight + buttonPadding * 2),
        },
        { X: buttonWidth, Y: buttonHeight },
        saves[i]);
      saveButton.SetSelectable(true);
      saveButton.SetActionCallback({
        action: () => {
          if (saveButton.GetSaveFile())
            this.c.OpenSave(i);
        },
        altAction: null,
        altAltAction: null,
        selected: () => {
          if (saveButton.GetSaveFile())
            this.c.Selected(saveButton.GetSaveFile()!.GetDisplayName(), saveButton.GetSelected());
        },
      });
      this.stampButtons.push(saveButton);
      this.AddComponent(saveButton);
      saveX++;
    }
  }

  NotifySelectedChanged(sender: LocalBrowserModel): void {
    const selected = sender.GetSelected();
    for (let j = 0; j < this.stampButtons.length; j++) {
      this.stampButtons[j].SetSelected(false);
      for (let i = 0; i < selected.length; i++) {
        if (this.stampButtons[j].GetSaveFile()!.GetDisplayName() === selected[i])
          this.stampButtons[j].SetSelected(true);
      }
    }

    this.removeSelected.Visible = selected.length > 0;
    this.renameSelected.Visible = selected.length === 1;
    this.removeSelected.Position.X = ((WINDOWW - 100) / 2) | 0;
    if (this.renameSelected.Visible) {
      this.removeSelected.Position.X -= 52;
    }

    const showPagination = !this.removeSelected.Visible;
    this.pageLabel.Visible = showPagination;
    this.pageCountLabel.Visible = showPagination;
    this.pageTextbox.Visible = showPagination;
  }

  protected override OnMouseWheel(_x: number, _y: number, d: number): void {
    if (d)
      this.c.SetPageRelative(-d);
  }

  protected override OnKeyPress(key: number, _scan: number, repeat: boolean, _shift: boolean, _ctrl: boolean, _alt: boolean): void {
    if (repeat)
      return;
    if (key === SDLK_ESCAPE || key === SDLK_AC_BACK)
      this.c.Exit();
    else if (key === SDLK_LCTRL || key === SDLK_RCTRL)
      this.c.SetMoveToFront(false);
  }

  protected override OnKeyRelease(key: number, _scan: number, repeat: boolean, _shift: boolean, _ctrl: boolean, _alt: boolean): void {
    if (repeat)
      return;
    if (key === SDLK_LCTRL || key === SDLK_RCTRL)
      this.c.SetMoveToFront(true);
  }
}

// ---------------------------------------------------------------------------------------------------------------
// LocalBrowserController

export class LocalBrowserController {
  private browserView: LocalBrowserView;
  private browserModel: LocalBrowserModel;
  private onDone: (() => void) | null;
  HasDone: boolean;

  constructor(onDone_: (() => void) | null = null) {
    this.HasDone = false;
    this.browserModel = new LocalBrowserModel();
    this.browserView = new LocalBrowserView();
    this.browserView.AttachController(this);
    this.browserModel.AddObserver(this.browserView);

    this.onDone = onDone_;

    this.browserModel.UpdateSavesList('', 0);
  }

  GetView(): LocalBrowserView { return this.browserView; }

  OpenSave(index: number): void {
    this.browserModel.OpenSave(index);
  }

  TakeSave(): SaveFile | null {
    return this.browserModel.TakeSave();
  }

  RemoveSelected(): void {
    let desc = 'Are you sure you want to delete ' + this.browserModel.GetSelected().length + ' stamp';
    if (this.browserModel.GetSelected().length > 1)
      desc += 's';
    desc += '?';
    new ConfirmPrompt('Delete stamps', desc, { okay: () => { this.removeSelectedC(); } });
  }

  removeSelectedC(): void {
    // RemoveSavesTask in a TaskWindow("Removing stamps"): the deletions are immediate here, so the task runs at
    // once without the progress window
    const saves = this.browserModel.GetSelected();
    for (let i = 0; i < saves.length; i++) {
      Client.Ref().DeleteStamp(saves[i]);
    }
    // after()
    this.RefreshSavesList();
  }

  RenameSelected(): void {
    const save = this.browserModel.GetSelected()[0];

    new TextPrompt('Rename stamp', 'Enter a new name for the stamp:', '', '[new name]', false, { text: (newName: string) => {
      if (newName.length === 0) {
        new ErrorMessage('Error renaming stamp', 'You have to specify the filename.');
        return;
      }

      // Client::RenameStamp shows its own error messages; Client.ts returns them
      const error = Client.Ref().RenameStamp(save, newName);
      if (error.length)
        new ErrorMessage('Error renaming stamp', error);

      this.RefreshSavesList();
    } });
  }

  RescanStamps(): void {
    this.browserModel.RescanStamps();
    this.browserModel.UpdateSavesList(this.browserModel.GetQuery(), this.browserModel.GetPageNum());
  }

  RefreshSavesList(): void {
    this.ClearSelection();
    this.browserModel.UpdateSavesList(this.browserModel.GetQuery(), this.browserModel.GetPageNum());
  }

  ClearSelection(): void {
    this.browserModel.ClearSelected();
  }

  SetSearch(query: string, page: number): void {
    if ((query !== this.browserModel.GetQuery() || page !== this.browserModel.GetPageNum()) && page >= 0 && page < this.browserModel.GetPageCount())
      this.browserModel.UpdateSavesList(query, page);
  }

  SetPageRelative(offset: number): void {
    const page = Math.max(Math.min(this.browserModel.GetPageNum() + offset, this.browserModel.GetPageCount() - 1), 0);
    if (page !== this.browserModel.GetPageNum())
      this.browserModel.UpdateSavesList(this.browserModel.GetQuery(), page);
  }

  Update(): void {
    if (this.browserModel.GetSave()) {
      this.Exit();
    }
  }

  Selected(saveName: string, selected: boolean): void {
    if (selected)
      this.browserModel.SelectSave(saveName);
    else
      this.browserModel.DeselectSave(saveName);
  }

  GetMoveToFront(): boolean {
    return this.browserModel.GetMoveToFront();
  }

  SetMoveToFront(move: boolean): void {
    this.browserModel.SetMoveToFront(move);
  }

  Exit(): void {
    this.browserView.CloseActiveWindow();
    if (this.onDone)
      this.onDone();
    this.HasDone = true;
  }

  /** ~LocalBrowserController */
  Destroy(): void {
    this.browserView.CloseActiveWindow();
  }
}

export { LocalBrowserController as LocalBrowser };
