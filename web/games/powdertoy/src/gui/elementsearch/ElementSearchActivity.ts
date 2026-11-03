// gui/elementsearch/ElementSearchActivity.h / ElementSearchActivity.cpp (and Activity.h's WindowActivity, whose
// Show/Hide/Exit are written out here: the constructor shows the window, Exit() closes and destroys it).
import { Window } from '../interface/Engine.ts';
import { Button } from '../interface/Button.ts';
import { Label, Textbox } from '../interface/Label.ts';
import { ScrollPanel } from '../interface/Controls.ts';
import { Fade } from '../interface/Fade.ts';
import { AlignLeft, style } from '../interface/Appearance.ts';
import { WithAlpha, add, type Point } from '../interface/Point.ts';
import {
  SDLK_KP_ENTER, SDLK_RETURN, SDLK_ESCAPE, SDLK_AC_BACK, SDLK_LSHIFT, SDLK_RSHIFT, SDLK_LCTRL, SDLK_RCTRL,
  SDLK_LALT, SDLK_RALT,
} from '../interface/Keys.ts';
import { Favorite, GetTexture } from '../game/Menu.ts';
import { ToolButton } from '../game/ToolButton.ts';
import type { Tool } from '../../sim/tools.ts';
import type { GameController } from '../game/GameController.ts';

interface Match {
  toolIndex: number; // relevance by position of tool in tools vector
  haystackOrigin: number; // relevance by origin of haystack
  needlePosition: number; // relevance by position of needle in haystack
}

/** Match::operator <: std::tie(haystackOrigin, needlePosition, toolIndex) */
function matchLess(a: Match, b: Match): boolean {
  if (a.haystackOrigin !== b.haystackOrigin) return a.haystackOrigin < b.haystackOrigin;
  if (a.needlePosition !== b.needlePosition) return a.needlePosition < b.needlePosition;
  return a.toolIndex < b.toolIndex;
}

export class ElementSearchActivity extends Window {
  private firstResult: Tool | null = null;
  private gameController: GameController;
  private tools: Tool[];
  private searchField: Textbox;
  private toolButtons: ToolButton[] = [];
  private scrollPanel: ScrollPanel | null = null;
  private toolTip = '';
  private toolTipPresence = new Fade(Fade.LinearProfile(120, 60), 0, 0);
  private shiftPressed = false;
  private ctrlPressed = false;
  private altPressed = false;
  private isToolTipFadingIn = false;
  exit = false;

  GetFirstResult(): Tool | null { return this.firstResult; }

  constructor(gameController: GameController, tools: Tool[]) {
    super({ X: -1, Y: -1 }, { X: 236, Y: 302 });
    this.Show();
    this.gameController = gameController;
    this.tools = tools.slice();

    const title = new Label({ X: 4, Y: 5 }, { X: this.Size.X - 8, Y: 15 }, 'Element Search');
    title.SetTextColour(style.Colour.InformationTitle);
    title.Appearance.HorizontalAlign = AlignLeft;
    this.AddComponent(title);

    this.searchField = new Textbox({ X: 8, Y: 23 }, { X: this.Size.X - 16, Y: 17 }, '');
    this.searchField.SetActionCallback({ change: () => { this.searchTools(this.searchField.GetText()); } });
    this.searchField.Appearance.HorizontalAlign = AlignLeft;
    this.AddComponent(this.searchField);
    this.FocusComponent(this.searchField);

    const closeButton = new Button({ X: 0, Y: this.Size.Y - 15 }, { X: ((this.Size.X / 2) | 0) + 1, Y: 15 }, 'Close');
    closeButton.SetActionCallback({ action: () => { this.exit = true; } });
    const okButton = new Button({ X: (this.Size.X / 2) | 0, Y: this.Size.Y - 15 }, { X: (this.Size.X / 2) | 0, Y: 15 }, 'OK');
    okButton.SetActionCallback({ action: () => {
      if (this.GetFirstResult())
        this.SetActiveTool(0, this.GetFirstResult()!);
    } });

    this.AddComponent(okButton);
    this.AddComponent(closeButton);

    const sf = this.searchField;
    this.scrollPanel = new ScrollPanel(add(sf.Position, { X: 1, Y: sf.Size.Y + 9 }),
      { X: sf.Size.X - 2, Y: this.Size.Y - (sf.Position.Y + sf.Size.Y + 6) - 23 });
    this.AddComponent(this.scrollPanel);

    this.searchTools('');
  }

  // ---- WindowActivity ----
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

  private searchTools(query: string): void {
    const scrollPanel = this.scrollPanel!;
    this.firstResult = null;
    for (const toolButton of this.toolButtons) {
      scrollPanel.RemoveChild(toolButton);
    }
    this.toolButtons = [];

    const viewPosition: Point = { X: 1, Y: 1 };
    const current: Point = { X: 0, Y: 0 };

    const queryLower = query.toLowerCase();

    const indexToMatch = new Map<number, Match>();
    const push = (match: Match) => {
      const it = indexToMatch.get(match.toolIndex);
      if (it === undefined) {
        indexToMatch.set(match.toolIndex, match);
      } else if (matchLess(match, it)) {
        indexToMatch.set(match.toolIndex, match);
      }
    };

    const pushIfMatches = (infoLower: string, toolIndex: number, haystackRelevance: number) => {
      if (infoLower === queryLower) {
        push({ toolIndex, haystackOrigin: haystackRelevance, needlePosition: 0 });
      }
      if (infoLower.startsWith(queryLower)) {
        push({ toolIndex, haystackOrigin: haystackRelevance, needlePosition: 1 });
      }
      if (infoLower.includes(queryLower)) {
        push({ toolIndex, haystackOrigin: haystackRelevance, needlePosition: 2 });
      }
    };

    const menudescriptionLower = new Map<Tool, string>();
    for (const menu of this.gameController.GetMenuList()) {
      for (const tool of menu.GetToolList()) {
        // std::map::insert keeps the first
        if (!menudescriptionLower.has(tool)) menudescriptionLower.set(tool, menu.GetDescription().toLowerCase());
      }
    }

    for (let toolIndex = 0; toolIndex < this.tools.length; ++toolIndex) {
      pushIfMatches(this.tools[toolIndex].Name.toLowerCase(), toolIndex, 0);
      pushIfMatches(this.tools[toolIndex].Description.toLowerCase(), toolIndex, 1);
      const it = menudescriptionLower.get(this.tools[toolIndex]);
      if (it !== undefined) {
        pushIfMatches(it, toolIndex, 2);
      }
    }

    // std::map iterates in key order; the sort below is total anyway
    const matches: Match[] = [...indexToMatch.keys()].sort((a, b) => a - b).map((k) => indexToMatch.get(k)!);
    matches.sort((a, b) => (matchLess(a, b) ? -1 : matchLess(b, a) ? 1 : 0));
    for (const match of matches) {
      const tool = this.tools[match.toolIndex];

      if (!this.firstResult)
        this.firstResult = tool;

      const tempTexture = GetTexture(tool, 26, 14);
      let tempButton: ToolButton;

      if (tempTexture)
        tempButton = new ToolButton(add(current, viewPosition), { X: 30, Y: 18 }, '', tool.Identifier, tool.Description);
      else
        tempButton = new ToolButton(add(current, viewPosition), { X: 30, Y: 18 }, tool.Name, tool.Identifier, tool.Description);

      tempButton.Appearance.SetTexture(tempTexture);
      tempButton.Appearance.BackgroundInactive = WithAlpha(tool.Colour, 0xFF);
      const button = tempButton;
      tempButton.SetActionCallback({ action: () => {
        if (button.GetSelectionState() >= 0 && button.GetSelectionState() <= 2)
          this.SetActiveTool(button.GetSelectionState(), tool);
      } });

      if (this.gameController.GetActiveTool(0) === tool) {
        tempButton.SetSelectionState(0);	//Primary
      } else if (this.gameController.GetActiveTool(1) === tool) {
        tempButton.SetSelectionState(1);	//Secondary
      } else if (this.gameController.GetActiveTool(2) === tool) {
        tempButton.SetSelectionState(2);	//Tertiary
      }

      this.toolButtons.push(tempButton);
      scrollPanel.AddChild(tempButton);

      current.X += 31;

      if (current.X + 30 > this.searchField.Size.X) {
        current.X = 0;
        current.Y += 19;
      }
    }

    if (current.X === 0) {
      current.Y -= 19;
    }
    scrollPanel.InnerSize = { X: scrollPanel.Size.X, Y: current.Y + 20 };
  }

  SetActiveTool(selectionState: number, tool: Tool): void {
    if (this.ctrlPressed && this.shiftPressed && !this.altPressed) {
      Favorite.Ref().AddFavorite(tool.Identifier);
      this.gameController.RebuildFavoritesMenu();
    } else if (this.ctrlPressed && this.altPressed && !this.shiftPressed &&
      tool.Identifier.startsWith('DEFAULT_PT_')) {
      this.gameController.SetActiveTool(3, tool);
    } else
      this.gameController.SetActiveTool(selectionState, tool);
    this.exit = true;
  }

  protected override OnDraw(): void {
    const g = this.GetGraphics();
    const scrollPanel = this.scrollPanel!;
    g.DrawFilledRect(this.Position.X - 1, this.Position.Y - 1, this.Size.X + 2, this.Size.Y + 2, 0x000000);
    g.DrawRect(this.Position.X, this.Position.Y, this.Size.X, this.Size.Y, 0xFFFFFF);

    g.BlendRect(this.Position.X + scrollPanel.Position.X - 1, this.Position.Y + scrollPanel.Position.Y - 1,
      scrollPanel.Size.X + 2, scrollPanel.Size.Y + 2, WithAlpha(0xFFFFFF, 180));
    const presence = this.toolTipPresence.Int();
    if (presence && this.toolTip.length) {
      g.BlendText(10, this.Size.Y + 70, this.toolTip, WithAlpha(0xFFFFFF, presence > 51 ? 255 : presence * 5));
    }
  }

  protected override OnTick(): void {
    if (this.exit)
      this.Exit();

    if (this.isToolTipFadingIn) {
      this.isToolTipFadingIn = false;
      this.toolTipPresence.SetTarget(120);
    } else {
      this.toolTipPresence.SetTarget(0);
    }
  }

  protected override OnKeyPress(key: number, _scan: number, repeat: boolean, _shift: boolean, _ctrl: boolean, _alt: boolean): void {
    if (repeat)
      return;
    switch (key) {
      case SDLK_KP_ENTER:
      case SDLK_RETURN:
        if (this.firstResult)
          this.gameController.SetActiveTool(0, this.firstResult);
      // fallthrough
      case SDLK_ESCAPE:
      case SDLK_AC_BACK:
        this.exit = true;
        break;
      case SDLK_LSHIFT:
      case SDLK_RSHIFT:
        this.shiftPressed = true;
        break;
      case SDLK_LCTRL:
      case SDLK_RCTRL:
        this.ctrlPressed = true;
        break;
      case SDLK_LALT:
      case SDLK_RALT:
        this.altPressed = true;
        break;
    }
  }

  protected override OnKeyRelease(key: number, _scan: number, repeat: boolean, _shift: boolean, _ctrl: boolean, _alt: boolean): void {
    if (repeat)
      return;
    switch (key) {
      case SDLK_LSHIFT:
      case SDLK_RSHIFT:
        this.shiftPressed = false;
        break;
      case SDLK_LCTRL:
      case SDLK_RCTRL:
        this.ctrlPressed = false;
        break;
      case SDLK_LALT:
      case SDLK_RALT:
        this.altPressed = false;
        break;
    }
  }

  override ToolTip(_senderPosition: Point, toolTip: string): void {
    this.toolTip = toolTip;
    this.isToolTipFadingIn = true;
  }
}
