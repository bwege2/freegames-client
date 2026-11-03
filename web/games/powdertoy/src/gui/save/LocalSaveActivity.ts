// gui/save/LocalSaveActivity.h / LocalSaveActivity.cpp, and gui/Activity.h (WindowActivity, exported from here
// for the other activities). Saves go to the player's storage through Client: "Saves/<name>.cps" is the storage
// file save-<name>.cps (Client.SaveFileName).
import { Window } from '../interface/Engine.ts';
import { Button } from '../interface/Button.ts';
import { Label, Textbox } from '../interface/Label.ts';
import { AlignLeft, AlignMiddle, style } from '../interface/Appearance.ts';
import { Colour, type Point } from '../interface/Point.ts';
import { ConfirmPrompt, ErrorMessage } from '../dialogues/Dialogues.ts';
import { Client, SaveFileName, LOCAL_SAVE_DIR, SAVE_EXT, type SaveFile } from '../../game/Client.ts';
import type { JsonValue } from '../../save/gameSave.ts';
import { decorationEnabled } from '../../graphics/renderer.ts';
import type { VideoBuffer } from '../../graphics/raster.ts';
import { RenderThumbnail } from '../SaveRenderer.ts';

/** gui/Activity.h WindowActivity: a window that shows itself when constructed */
export class WindowActivity extends Window {
  constructor(position: Point, size: Point) {
    super(position, size);
    this.Show();
  }
  Exit(): void {
    this.Hide();
    this.SelfDestruct();
  }
  Show(): void {
    this.MakeActiveWindow();
  }
  Hide(): void {
    this.CloseActiveWindow();
  }
}

export type OnSaved = (file: SaveFile) => void;

export class LocalSaveActivity extends WindowActivity {
  // saveToDiskImage (save_local.png, drawn at 0,0 behind the window): the resource is not ported
  private save: SaveFile | null;
  private thumbnail: VideoBuffer | null = null;
  private filenameField: Textbox;
  private onSaved: OnSaved | null;

  constructor(newSave: SaveFile, onSaved_: OnSaved | null = null) {
    super({ X: -1, Y: -1 }, { X: 220, Y: 200 });
    this.save = newSave;
    this.onSaved = onSaved_;

    const titleLabel = new Label({ X: 4, Y: 5 }, { X: this.Size.X - 8, Y: 16 }, 'Save to computer:');
    titleLabel.SetTextColour(style.Colour.InformationTitle);
    titleLabel.Appearance.HorizontalAlign = AlignLeft;
    titleLabel.Appearance.VerticalAlign = AlignMiddle;
    this.AddComponent(titleLabel);

    this.filenameField = new Textbox({ X: 8, Y: 25 }, { X: this.Size.X - 16, Y: 16 }, this.save.GetDisplayName(), '[filename]');
    this.filenameField.Appearance.VerticalAlign = AlignMiddle;
    this.filenameField.Appearance.HorizontalAlign = AlignLeft;
    this.AddComponent(this.filenameField);
    this.FocusComponent(this.filenameField);

    const cancelButton = new Button({ X: 0, Y: this.Size.Y - 16 }, { X: this.Size.X - 75, Y: 16 }, 'Cancel');
    cancelButton.Appearance.HorizontalAlign = AlignLeft;
    cancelButton.Appearance.VerticalAlign = AlignMiddle;
    cancelButton.Appearance.BorderInactive = Colour(200, 200, 200);
    cancelButton.SetActionCallback({ action: () => {
      this.Exit();
    } });
    this.AddComponent(cancelButton);
    this.SetCancelButton(cancelButton);

    const okayButton = new Button({ X: this.Size.X - 76, Y: this.Size.Y - 16 }, { X: 76, Y: 16 }, 'Save');
    okayButton.Appearance.HorizontalAlign = AlignLeft;
    okayButton.Appearance.VerticalAlign = AlignMiddle;
    okayButton.Appearance.TextInactive = style.Colour.InformationTitle;
    okayButton.SetActionCallback({ action: () => {
      this.Save();
    } });
    this.AddComponent(okayButton);
    this.SetOkayButton(okayButton);

    if (this.save.GetGameSave()) {
      // ThumbnailRendererTask(*save->GetGameSave(), Size - Vec2(16, 16), decorationEnabled, false), polled in OnTick:
      // rendered at once here
      this.thumbnail = RenderThumbnail(this.save.GetGameSave()!, this.Size.X - 16, this.Size.Y - 16, decorationEnabled, false);
    }
  }

  protected override OnTick(): void {
    // the thumbnail renderer is polled here in the original; the port rendered it in the constructor
  }

  Save(): void {
    const text = this.filenameField.GetText();
    if (text.includes('/') || text.startsWith('.')) {
      new ErrorMessage('Error', 'Invalid filename.');
    } else if (text.length) {
      // ByteString::Build(LOCAL_SAVE_DIR, PATH_SEP_CHAR, name, ".cps") -> the storage name save-<name>.cps
      const finalFilename = SaveFileName(text);
      if (finalFilename === null) {
        // (the storage allows file names of up to 64 characters)
        new ErrorMessage('Error', 'Invalid filename.');
        return;
      }
      const displayPath = LOCAL_SAVE_DIR + '/' + text + SAVE_EXT;
      this.save!.SetDisplayName(text);
      this.save!.SetFileName(finalFilename);
      if (Client.Ref().FileExists(finalFilename)) {
        new ConfirmPrompt('Overwrite file', 'Are you sure you wish to overwrite\n' + displayPath, { okay: () => {
          this.saveWrite(finalFilename, displayPath);
        } });
      } else {
        this.saveWrite(finalFilename, displayPath);
      }
    } else {
      new ErrorMessage('Error', 'You must specify a filename.');
    }
  }

  /** saveWrite(ByteString finalFilename); displayPath is the original's file name, stored as the title */
  saveWrite(finalFilename: string, displayPath: string): void {
    // Platform::MakeDirectory(LOCAL_SAVE_DIR): the storage has no folders
    const localSaveInfo: Record<string, JsonValue> = {};
    localSaveInfo['type'] = 'localsave';
    const user = Client.Ref().GetAuthUser();
    localSaveInfo['username'] = user ? user.Username : '';
    localSaveInfo['title'] = displayPath;
    localSaveInfo['date'] = Math.floor(Date.now() / 1000);
    Client.Ref().SaveAuthorInfo(localSaveInfo);
    {
      const gameSave = this.save!.TakeGameSave()!;
      gameSave.authors = localSaveInfo;
      this.save!.SetGameSave(gameSave);
    }
    let saveData: Uint8Array;
    try {
      [, saveData] = this.save!.GetGameSave()!.Serialise();
    } catch {
      // (the original lets a BuildException escape; here it counts as an empty result)
      saveData = new Uint8Array(0);
    }
    if (saveData.length === 0)
      new ErrorMessage('Error', 'Unable to serialize game data.');
    else if (!Client.Ref().WriteFile(finalFilename, saveData))
      new ErrorMessage('Error', 'Unable to write save file.');
    else {
      if (this.onSaved) {
        const save = this.save!;
        this.save = null;
        this.onSaved(save);
      }
      this.Exit();
    }
  }

  protected override OnDraw(): void {
    const g = this.GetGraphics();
    // g->BlendRGBAImage(saveToDiskImage...): not ported (see above)
    g.DrawFilledRect(this.Position.X - 1, this.Position.Y - 1, this.Size.X + 2, this.Size.Y + 2, 0x000000);
    g.DrawRect(this.Position.X, this.Position.Y, this.Size.X, this.Size.Y, 0xFFFFFF);

    if (this.thumbnail) {
      const ts = this.thumbnail.Size();
      const rx = this.Position.X + (((this.Size.X - ts.X) / 2) | 0), ry = this.Position.Y + 45;
      g.BlendImage(this.thumbnail.Data(), 0xFF, rx, ry, ts.X, ts.Y);
      g.DrawRect(rx, ry, ts.X, ts.Y, 0xB4B4B4);
    }
  }
}
