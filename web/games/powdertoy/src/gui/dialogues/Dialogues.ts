// gui/dialogues/ConfirmPrompt, ErrorMessage, InformationMessage, TextPrompt (.h/.cpp). As in the original,
// constructing one shows it (`new ErrorMessage(title, message)`).
import { Window, Engine } from '../interface/Engine.ts';
import { Button } from '../interface/Button.ts';
import { Label, Textbox } from '../interface/Label.ts';
import { ScrollPanel } from '../interface/Controls.ts';
import { AlignLeft, AlignMiddle, AlignTop, AlignRight, style } from '../interface/Appearance.ts';
import { Colour } from '../interface/Point.ts';

function frame(w: Window): void {
  const g = w.GetGraphics();
  g.DrawFilledRect(w.Position.X - 1, w.Position.Y - 1, w.Size.X + 2, w.Size.Y + 2, 0x000000);
  g.DrawRect(w.Position.X, w.Position.Y, w.Size.X, w.Size.Y, 0xC8C8C8);
}

export interface ConfirmCallback {
  okay?: (() => void) | null;
  cancel?: (() => void) | null;
}

export class ConfirmPrompt extends Window {
  private callback: ConfirmCallback;
  constructor(title: string, message: string, callback_: ConfirmCallback = {}, buttonText = 'Confirm') {
    super({ X: -1, Y: -1 }, { X: 250, Y: 50 });
    this.callback = callback_;
    const titleLabel = new Label({ X: 4, Y: 5 }, { X: this.Size.X - 8, Y: 15 }, title);
    titleLabel.SetTextColour(style.Colour.WarningTitle);
    titleLabel.Appearance.HorizontalAlign = AlignLeft;
    titleLabel.Appearance.VerticalAlign = AlignMiddle;
    this.AddComponent(titleLabel);
    const messagePanel = new ScrollPanel({ X: 4, Y: 24 }, { X: this.Size.X - 8, Y: 206 });
    this.AddComponent(messagePanel);
    const messageLabel = new Label({ X: 4, Y: 0 }, { X: this.Size.X - 28, Y: -1 }, message);
    messageLabel.Appearance.HorizontalAlign = AlignLeft;
    messageLabel.Appearance.VerticalAlign = AlignTop;
    messageLabel.SetMultiline(true);
    messagePanel.AddChild(messageLabel);
    messagePanel.InnerSize = { X: messagePanel.Size.X, Y: messageLabel.Size.Y + 4 };
    if (messageLabel.Size.Y < messagePanel.Size.Y) messagePanel.Size.Y = messageLabel.Size.Y + 4;
    this.Size.Y += messagePanel.Size.Y + 12;
    this.Position.Y = ((this.GetGraphics().Size().Y - this.Size.Y) / 2) | 0;
    const cancelButton = new Button({ X: 0, Y: this.Size.Y - 16 }, { X: this.Size.X - 75, Y: 16 }, 'Cancel');
    cancelButton.Appearance.HorizontalAlign = AlignLeft;
    cancelButton.Appearance.VerticalAlign = AlignMiddle;
    cancelButton.Appearance.BorderInactive = Colour(200, 200, 200);
    cancelButton.SetActionCallback({ action: () => {
      this.CloseActiveWindow();
      if (this.callback.cancel) this.callback.cancel();
      this.SelfDestruct();
    } });
    this.AddComponent(cancelButton);
    this.SetCancelButton(cancelButton);
    const okayButton = new Button({ X: this.Size.X - 76, Y: this.Size.Y - 16 }, { X: 76, Y: 16 }, buttonText);
    okayButton.Appearance.HorizontalAlign = AlignLeft;
    okayButton.Appearance.VerticalAlign = AlignMiddle;
    okayButton.Appearance.TextInactive = style.Colour.WarningTitle;
    okayButton.SetActionCallback({ action: () => {
      this.CloseActiveWindow();
      if (this.callback.okay) this.callback.okay();
      this.SelfDestruct();
    } });
    this.AddComponent(okayButton);
    this.SetOkayButton(okayButton);
    this.MakeActiveWindow();
  }
  protected override OnDraw(): void { frame(this); }
}

export class ErrorMessage extends Window {
  private callback: { dismiss?: (() => void) | null };
  constructor(title: string, message: string, callback_: { dismiss?: (() => void) | null } = {}) {
    super({ X: -1, Y: -1 }, { X: 200, Y: 35 });
    this.callback = callback_;
    const titleLabel = new Label({ X: 4, Y: 5 }, { X: this.Size.X - 8, Y: 16 }, title);
    titleLabel.SetTextColour(style.Colour.ErrorTitle);
    titleLabel.Appearance.HorizontalAlign = AlignLeft;
    titleLabel.Appearance.VerticalAlign = AlignMiddle;
    this.AddComponent(titleLabel);
    const messageLabel = new Label({ X: 4, Y: 24 }, { X: this.Size.X - 8, Y: -1 }, message);
    messageLabel.SetMultiline(true);
    messageLabel.Appearance.HorizontalAlign = AlignLeft;
    messageLabel.Appearance.VerticalAlign = AlignTop;
    this.AddComponent(messageLabel);
    this.Size.Y += messageLabel.Size.Y + 12;
    this.Position.Y = ((this.GetGraphics().Size().Y - this.Size.Y) / 2) | 0;
    const okayButton = new Button({ X: 0, Y: this.Size.Y - 16 }, { X: this.Size.X, Y: 16 }, 'Dismiss');
    okayButton.Appearance.HorizontalAlign = AlignLeft;
    okayButton.Appearance.VerticalAlign = AlignMiddle;
    okayButton.Appearance.BorderInactive = Colour(200, 200, 200);
    okayButton.SetActionCallback({ action: () => {
      this.CloseActiveWindow();
      if (this.callback.dismiss) this.callback.dismiss();
      this.SelfDestruct();
    } });
    this.AddComponent(okayButton);
    this.SetOkayButton(okayButton);
    this.SetCancelButton(okayButton);
    this.MakeActiveWindow();
  }
  protected override OnDraw(): void { frame(this); }
}

export class InformationMessage extends Window {
  private callback: { dismiss?: (() => void) | null };
  constructor(title: string, message: string, large: boolean, callback_: { dismiss?: (() => void) | null } = {}) {
    super({ X: -1, Y: -1 }, { X: 200, Y: 35 });
    this.callback = callback_;
    if (large) {
      this.Size.X += 200;
      this.Size.Y += 215;
    }
    if (large) {
      const messagePanel = new ScrollPanel({ X: 4, Y: 24 }, { X: this.Size.X - 8, Y: 206 });
      this.AddComponent(messagePanel);
      const messageLabel = new Label({ X: 4, Y: 0 }, { X: this.Size.X - 28, Y: -1 }, message);
      messageLabel.Appearance.HorizontalAlign = AlignLeft;
      messageLabel.Appearance.VerticalAlign = AlignTop;
      messageLabel.SetMultiline(true);
      messagePanel.AddChild(messageLabel);
      messagePanel.InnerSize = { X: messagePanel.Size.X, Y: messageLabel.Size.Y + 4 };
    } else {
      const messagePanel = new ScrollPanel({ X: 4, Y: 24 }, { X: this.Size.X - 8, Y: 206 });
      this.AddComponent(messagePanel);
      const messageLabel = new Label({ X: 4, Y: 0 }, { X: this.Size.X - 8, Y: -1 }, message);
      messageLabel.Appearance.HorizontalAlign = AlignLeft;
      messageLabel.Appearance.VerticalAlign = AlignTop;
      messageLabel.SetMultiline(true);
      messagePanel.AddChild(messageLabel);
      messagePanel.InnerSize = { X: messagePanel.Size.X, Y: messageLabel.Size.Y + 4 };
      if (messageLabel.Size.Y < messagePanel.Size.Y) messagePanel.Size.Y = messageLabel.Size.Y + 4;
      this.Size.Y += messagePanel.Size.Y + 12;
      this.Position.Y = ((this.GetGraphics().Size().Y - this.Size.Y) / 2) | 0;
    }
    const titleLabel = new Label({ X: 4, Y: 5 }, { X: this.Size.X - 8, Y: 16 }, title);
    titleLabel.SetTextColour(style.Colour.InformationTitle);
    titleLabel.Appearance.HorizontalAlign = AlignLeft;
    titleLabel.Appearance.VerticalAlign = AlignMiddle;
    this.AddComponent(titleLabel);
    const okayButton = new Button({ X: 0, Y: this.Size.Y - 16 }, { X: this.Size.X, Y: 16 }, 'Dismiss');
    okayButton.Appearance.HorizontalAlign = AlignLeft;
    okayButton.Appearance.VerticalAlign = AlignMiddle;
    okayButton.Appearance.BorderInactive = Colour(200, 200, 200);
    okayButton.SetActionCallback({ action: () => {
      this.CloseActiveWindow();
      if (this.callback.dismiss) this.callback.dismiss();
      this.SelfDestruct();
    } });
    this.AddComponent(okayButton);
    this.SetOkayButton(okayButton);
    this.SetCancelButton(okayButton);
    this.MakeActiveWindow();
  }
  protected override OnDraw(): void { frame(this); }
}

export interface TextDialogueCallback {
  text?: ((text: string) => void) | null;
  cancel?: (() => void) | null;
}

export class TextPrompt extends Window {
  private callback: TextDialogueCallback;
  private textField: Textbox;
  constructor(title: string, message: string, text: string, placeholder: string, multiline: boolean, callback_: TextDialogueCallback = {}) {
    super({ X: -1, Y: -1 }, { X: 200, Y: 65 });
    this.callback = callback_;
    if (multiline) this.Size.X += 100;
    const titleLabel = new Label({ X: 4, Y: 5 }, { X: this.Size.X - 8, Y: 18 }, title);
    titleLabel.SetTextColour(style.Colour.WarningTitle);
    titleLabel.Appearance.HorizontalAlign = AlignLeft;
    titleLabel.Appearance.VerticalAlign = AlignMiddle;
    this.AddComponent(titleLabel);
    const messageLabel = new Label({ X: 4, Y: 25 }, { X: this.Size.X - 8, Y: -1 }, message);
    messageLabel.SetMultiline(true);
    messageLabel.Appearance.HorizontalAlign = AlignLeft;
    messageLabel.Appearance.VerticalAlign = AlignTop;
    this.AddComponent(messageLabel);
    this.Size.Y += messageLabel.Size.Y + 4;
    this.textField = new Textbox({ X: 4, Y: messageLabel.Position.Y + messageLabel.Size.Y + 7 }, { X: this.Size.X - 8, Y: 16 }, text, placeholder);
    if (multiline) {
      this.textField.SetMultiline(true);
      this.textField.Size.Y = 60;
      this.Size.Y += 45;
      this.textField.Appearance.VerticalAlign = AlignTop;
    } else {
      this.textField.Appearance.VerticalAlign = AlignMiddle;
    }
    this.textField.Appearance.HorizontalAlign = AlignLeft;
    this.AddComponent(this.textField);
    this.FocusComponent(this.textField);
    const cancelButton = new Button({ X: 0, Y: this.Size.Y - 16 }, { X: ((this.Size.X / 2) | 0) + 1, Y: 16 }, 'Cancel');
    cancelButton.Appearance.HorizontalAlign = AlignLeft;
    cancelButton.Appearance.VerticalAlign = AlignMiddle;
    cancelButton.Appearance.BorderInactive = Colour(200, 200, 200);
    cancelButton.SetActionCallback({ action: () => {
      this.CloseActiveWindow();
      if (this.callback.cancel) this.callback.cancel();
      this.SelfDestruct();
    } });
    this.AddComponent(cancelButton);
    this.SetCancelButton(cancelButton);
    const okayButton = new Button({ X: (this.Size.X / 2) | 0, Y: this.Size.Y - 16 }, { X: (this.Size.X / 2) | 0, Y: 16 }, 'Okay');
    okayButton.Appearance.HorizontalAlign = AlignRight;
    okayButton.Appearance.VerticalAlign = AlignMiddle;
    okayButton.Appearance.TextInactive = style.Colour.WarningTitle;
    okayButton.SetActionCallback({ action: () => {
      this.CloseActiveWindow();
      if (this.callback.text) this.callback.text(this.textField.GetText());
      this.SelfDestruct();
    } });
    this.AddComponent(okayButton);
    this.SetOkayButton(okayButton);
    this.MakeActiveWindow();
  }
  protected override OnDraw(): void { frame(this); }
}

// Engine::ConfirmExit shows a ConfirmPrompt
Engine.confirmPrompt = (title, message, okay, cancel) => {
  new ConfirmPrompt(title, message, { okay, cancel });
};
