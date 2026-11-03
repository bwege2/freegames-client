// gui/filebrowser/FileBrowserActivity.h / FileBrowserActivity.cpp. The local saves are the save-<name>.cps files
// of the player's storage (Client). The original lists them on a worker thread (LoadFilesTask) and the window
// polls it; the port runs the task at once, and the result is taken in the next OnTick as in the original.
import { Label, Textbox } from '../interface/Label.ts';
import { ScrollPanel, ProgressBar } from '../interface/Controls.ts';
import type { Component } from '../interface/Engine.ts';
import { AlignLeft, AlignMiddle, style } from '../interface/Appearance.ts';
import { SaveButton } from '../interface/SaveButton.ts';
import { ConfirmPrompt, ErrorMessage, TextPrompt } from '../dialogues/Dialogues.ts';
import { WindowActivity } from '../save/LocalSaveActivity.ts';
import { Client, SaveFile, SaveFileName, SaveDisplayName, SAVE_PREFIX, SAVE_EXT } from '../../game/Client.ts';

export type OnSelected = (file: SaveFile) => void;

/** LoadFilesTask */
class LoadFilesTask {
  private directory: string;
  private search: string;
  private saveFiles: SaveFile[] = [];
  private done = false;
  private progress = 0;
  private listener: FileBrowserActivity | null = null;

  constructor(directory: string, search: string) {
    this.directory = directory;
    this.search = search;
  }
  AddTaskListener(listener: FileBrowserActivity): void { this.listener = listener; }
  GetProgress(): number { return this.progress; }

  private notifyProgress(progress: number): void {
    this.progress = progress;
    this.listener?.NotifyProgress(this);
  }

  private doWork(): boolean {
    // Platform::DirectorySearch(directory, search, { ".cps" }): the search is matched (lower case) against the
    // file name without its extension, here the save's display name
    void this.directory;
    const search = this.search.toLowerCase();
    const files = Client.Ref().DirectorySearch(SAVE_PREFIX, '', [SAVE_EXT])
      .filter((n) => !search.length || SaveDisplayName(n).toLowerCase().includes(search));
    files.sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : a.toLowerCase() > b.toLowerCase() ? 1 : 0));

    this.notifyProgress(-1);
    for (const iter of files) {
      const saveFile = new SaveFile(iter, true);
      const filename = SaveDisplayName(iter);
      saveFile.SetDisplayName(filename);
      this.saveFiles.push(saveFile);
    }
    return true;
  }

  /** Start(): the work runs at once; Poll() reports it done */
  Start(): void {
    this.doWork();
    this.done = true;
  }
  Poll(): void {
    if (this.done) {
      this.done = false;
      this.listener?.NotifyDone(this);
    }
  }

  TakeSaveFiles(): SaveFile[] {
    const s = this.saveFiles;
    this.saveFiles = [];
    return s;
  }
}

export class FileBrowserActivity extends WindowActivity {
  private loadFiles: LoadFilesTask | null = null;
  private onSelected: OnSelected | null;
  private itemList: ScrollPanel;
  private infoText: Label;
  private files: (SaveFile | null)[] = [];
  private createButtons = false;
  private components: Component[] = [];
  private componentsQueue: Component[] = [];
  private directory: string;
  private hasQueuedSearch = false;
  private queuedSearch = '';
  private progressBar: ProgressBar;
  private totalFiles = 0;
  private filesX: number;
  private filesY: number;
  private buttonPadding: number;
  private fileX: number;
  private fileY: number;
  private buttonWidth: number;
  private buttonHeight: number;
  private buttonAreaWidth: number;
  private buttonAreaHeight: number;
  private buttonXOffset: number;
  private buttonYOffset: number;

  constructor(directory: string, onSelected_: OnSelected | null = null) {
    super({ X: -1, Y: -1 }, { X: 500, Y: 350 });
    this.onSelected = onSelected_;
    this.directory = directory;

    const titleLabel = new Label({ X: 4, Y: 5 }, { X: this.Size.X - 8, Y: 18 }, 'Save Browser');
    titleLabel.SetTextColour(style.Colour.WarningTitle);
    titleLabel.Appearance.HorizontalAlign = AlignLeft;
    titleLabel.Appearance.VerticalAlign = AlignMiddle;
    this.AddComponent(titleLabel);

    const textField = new Textbox({ X: 8, Y: 25 }, { X: this.Size.X - 16, Y: 16 }, '', '[search]');
    textField.Appearance.VerticalAlign = AlignMiddle;
    textField.Appearance.HorizontalAlign = AlignLeft;
    textField.SetActionCallback({ change: () => { this.DoSearch(textField.GetText()); } });
    this.AddComponent(textField);
    this.FocusComponent(textField);

    this.itemList = new ScrollPanel({ X: 4, Y: 45 }, { X: this.Size.X - 8, Y: this.Size.Y - 53 });
    this.itemList.Visible = false;
    this.AddComponent(this.itemList);

    this.progressBar = new ProgressBar({ X: ((this.Size.X - 200) / 2) | 0, Y: 45 + (((this.Size.Y - 66) / 2) | 0) }, { X: 200, Y: 17 }, 0, '');
    this.AddComponent(this.progressBar);

    this.infoText = new Label({ X: ((this.Size.X - 200) / 2) | 0, Y: 45 + (((this.Size.Y - 66) / 2) | 0) }, { X: 200, Y: 17 }, 'No saves found');
    this.AddComponent(this.infoText);

    this.filesX = 4;
    this.filesY = 3;
    this.buttonPadding = 2;
    this.fileX = 0;
    this.fileY = 0;

    this.buttonXOffset = 0;
    this.buttonYOffset = 0;
    this.buttonAreaWidth = this.itemList.Size.X - 5;
    this.buttonAreaHeight = this.itemList.Size.Y;// - buttonYOffset - 18;
    this.buttonWidth = ((this.buttonAreaWidth / this.filesX) | 0) - this.buttonPadding * 2;
    this.buttonHeight = ((this.buttonAreaHeight / this.filesY) | 0) - this.buttonPadding * 2;

    this.loadDirectory(directory, '');
  }

  DoSearch(search: string): void {
    if (this.loadFiles) {
      this.hasQueuedSearch = true;
      this.queuedSearch = search;
    } else {
      this.loadDirectory(this.directory, search);
    }
  }

  SelectSave(index: number): void {
    if (this.onSelected) {
      const file = this.files[index]!;
      this.files[index] = null;
      this.files = [];
      this.onSelected(file);
    }
    this.Exit();
  }

  DeleteSave(index: number): void {
    const deleteMessage = 'Are you sure you want to delete ' + this.files[index]!.GetDisplayName() + '.cps?';
    new ConfirmPrompt('Delete Save', deleteMessage, { okay: () => {
      const file = this.files[index]!;
      Client.Ref().RemoveFile(file.GetName());
      this.loadDirectory(this.directory, '');
    } });
  }

  RenameSave(index: number): void {
    new TextPrompt('Rename', 'Change save name', this.files[index]!.GetDisplayName(), '', false, { text: (input: string) => {
      const file = this.files[index]!;
      let newName: string | null = input;
      if (newName.length) {
        // ByteString::Build(directory, PATH_SEP_CHAR, newName, ".cps") -> save-<newName>.cps
        newName = SaveFileName(newName);
        if (newName === null || !Client.Ref().RenameFile(file.GetName(), newName)) {
          new ErrorMessage('Error', 'Could not rename file');
        } else {
          this.loadDirectory(this.directory, '');
        }
      } else {
        new ErrorMessage('Error', 'No save name given');
      }
    } });
  }

  private cleanup(): void {
    this.componentsQueue = [];
    this.files = [];
  }

  loadDirectory(directory: string, search: string): void {
    for (let i = 0; i < this.components.length; i++) {
      this.RemoveComponent(this.components[i]);
      this.itemList.RemoveChild(this.components[i]);
    }

    this.cleanup();

    this.infoText.Visible = false;
    this.itemList.Visible = false;
    this.progressBar.Visible = true;
    this.progressBar.SetProgress(-1);
    this.progressBar.SetStatus('Loading files');
    this.loadFiles = new LoadFilesTask(directory, search);
    this.loadFiles.AddTaskListener(this);
    this.loadFiles.Start();
  }

  NotifyDone(task: LoadFilesTask): void {
    this.fileX = 0;
    this.fileY = 0;
    this.files = task.TakeSaveFiles();
    this.createButtons = true;
    this.totalFiles = this.files.length;
    this.loadFiles = null;
    if (!this.files.length) {
      this.progressBar.Visible = false;
      this.infoText.Visible = true;
    } else
      this.itemList.Visible = true;
    this.components = [];

    if (this.hasQueuedSearch) {
      this.hasQueuedSearch = false;
      this.loadDirectory(this.directory, this.queuedSearch);
    }
  }

  protected override OnMouseDown(x: number, y: number, _button: number): void {
    if (!(x > this.Position.X && y > this.Position.Y && y < this.Position.Y + this.Size.Y && x < this.Position.X + this.Size.X)) //Clicked outside window
      this.Exit();
  }

  protected override OnTryExit(_method: number): void {
    this.Exit();
  }

  NotifyError(_task: LoadFilesTask): void {
  }

  NotifyProgress(task: LoadFilesTask): void {
    this.progressBar.SetProgress(task.GetProgress());
  }

  NotifyStatus(_task: LoadFilesTask): void {
  }

  protected override OnTick(): void {
    if (this.loadFiles)
      this.loadFiles.Poll();

    if (this.createButtons) {
      this.createButtons = false;
      for (let i = 0; i < this.files.length; ++i) {
        const saveFile = this.files[i];
        if (this.fileX === this.filesX) {
          this.fileX = 0;
          this.fileY++;
        }
        const saveButton = new SaveButton(
          {
            X: this.buttonXOffset + this.buttonPadding + this.fileX * (this.buttonWidth + this.buttonPadding * 2),
            Y: this.buttonYOffset + this.buttonPadding + this.fileY * (this.buttonHeight + this.buttonPadding * 2),
          },
          { X: this.buttonWidth, Y: this.buttonHeight },
          saveFile);
        saveButton.AddContextMenu(1);
        saveButton.Tick();
        saveButton.SetActionCallback({
          action: () => { this.SelectSave(i); },
          altAction: () => { this.RenameSave(i); },
          altAltAction: () => { this.DeleteSave(i); },
        });

        this.progressBar.SetStatus('Rendering thumbnails');
        this.progressBar.SetProgress(this.totalFiles ? (((this.totalFiles - this.files.length) * 100 / this.totalFiles) | 0) : 0);
        this.componentsQueue.push(saveButton);
        this.fileX++;
      }
    }
    if (this.componentsQueue.length) {
      for (const iter of this.componentsQueue) {
        this.components.push(iter);
        this.itemList.AddChild(iter);
      }
      this.componentsQueue = [];
      this.itemList.InnerSize.Y = (this.buttonHeight + (this.buttonPadding * 2)) * (this.fileY + 1);
      if (!this.componentsQueue.length)
        this.progressBar.Visible = false;
    }
  }

  protected override OnDraw(): void {
    const g = this.GetGraphics();

    //Window Background+Outline
    g.DrawFilledRect(this.Position.X - 1, this.Position.Y - 1, this.Size.X + 2, this.Size.Y + 2, 0x000000);
    g.DrawRect(this.Position.X, this.Position.Y, this.Size.X, this.Size.Y, 0xFFFFFF);
  }

  protected override Destroy(): void {
    this.cleanup();
  }
}
