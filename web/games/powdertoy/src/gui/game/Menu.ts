// gui/game/Menu.h/.cpp, MenuButton.h, Notification.h, Favorite.h/.cpp, QuickOption.h, QuickOptions.h/.cpp,
// and Tool::GetTexture (a tool's menu icon as a VideoBuffer).
import { Button } from '../interface/Button.ts';
import type { Tool } from '../../sim/tools.ts';
import { VideoBuffer } from '../../graphics/raster.ts';
import { GlobalPrefs } from '../../game/Client.ts';
import type { GameModel } from './GameModel.ts';
import type { GameController } from './GameController.ts';

export class Menu {
  private icon: number;
  private description: string;
  private tools: Tool[] = [];
  private visible: boolean;

  constructor(icon_: number, description_: string, visible_: number | boolean) {
    this.icon = icon_;
    this.description = description_;
    this.visible = !!visible_;
  }
  GetToolList(): Tool[] { return this.tools.slice(); }
  GetIcon(): number { return this.icon; }
  GetDescription(): string { return this.description; }
  GetVisible(): boolean { return this.visible; }
  AddTool(tool_: Tool): void {
    // std::ranges::upper_bound on MenuSort
    let it = this.tools.length;
    for (let i = 0; i < this.tools.length; i++) {
      if (tool_.MenuSort < this.tools[i].MenuSort) {
        it = i;
        break;
      }
    }
    this.tools.splice(it, 0, tool_);
  }
  ClearTools(): void { this.tools = []; }
}

export class MenuButton extends Button {
  menuID = 0;
  needsClick = false;
}

export class Notification {
  Message: string;
  constructor(message: string) {
    this.Message = message;
  }
  Action(): void {}
}

/** Favorite (ExplicitSingleton): the favorite tools, kept in powder.pref as "Favorites" */
export class Favorite {
  private static instance: Favorite | null = null;
  static Ref(): Favorite {
    if (!Favorite.instance) Favorite.instance = new Favorite();
    return Favorite.instance;
  }
  private favoritesList: string[] = [];
  GetFavoritesList(): string[] { return this.favoritesList.slice(); }
  IsFavorite(identifier: string): boolean { return this.favoritesList.includes(identifier); }
  AnyFavorites(): boolean { return this.favoritesList.length !== 0; }
  AddFavorite(identifier: string): void {
    if (!this.IsFavorite(identifier)) {
      this.favoritesList.push(identifier);
      this.SaveFavoritesToPrefs();
    }
  }
  RemoveFavorite(identifier: string): void {
    this.favoritesList = this.favoritesList.filter((f) => f !== identifier);
    this.SaveFavoritesToPrefs();
  }
  SaveFavoritesToPrefs(): void {
    GlobalPrefs().Set('Favorites', this.favoritesList.slice());
  }
  LoadFavoritesFromPrefs(): void {
    this.favoritesList = GlobalPrefs().Get('Favorites', [] as string[]).filter((s) => typeof s === 'string');
  }
}

/**
 * Tool::GetTexture(Vec2 size): the tool's textureGen. In the port a textureGen returns a VideoBuffer
 * (Renderer.WallIcon, the GUI's own generators) or an ImageData (element IconGenerator); both become a
 * VideoBuffer of 0x00RRGGBB pixels.
 */
export function GetTexture(tool: Tool, w: number, h: number): VideoBuffer | null {
  const gen = tool.textureGen as unknown as ((id: number, w: number, h: number) => VideoBuffer | ImageData | null) | null;
  if (!gen) return null;
  const t = gen(tool.ToolID, w, h);
  if (!t) return null;
  if (t instanceof VideoBuffer) return t;
  const img = t as ImageData;
  const vb = new VideoBuffer(img.width, img.height);
  const d = img.data;
  const v = vb.Data();
  for (let i = 0; i < img.width * img.height; i++) v[i] = (d[i * 4] << 16) | (d[i * 4 + 1] << 8) | d[i * 4 + 2];
  return vb;
}

// ---------------------------------------------------------------------------------------------------------------
// QuickOption.h / QuickOptions.cpp

export const QuickOption_Toggle = 0, QuickOption_Multi = 1;

export interface QuickOptionListener {
  OnValueChanged(sender: QuickOption): void;
}

export class QuickOption {
  protected listeners: QuickOptionListener[] = [];
  protected m: GameModel;
  protected type: number;
  protected icon: string;
  protected description: string;
  constructor(icon: string, description: string, m: GameModel, type: number) {
    this.m = m;
    this.type = type;
    this.icon = icon;
    this.description = description;
  }
  protected perform(): void {}
  GetListeners(): QuickOptionListener[] { return this.listeners; }
  AddListener(listener: QuickOptionListener): void { this.listeners.push(listener); }
  GetType(): number { return this.type; }
  GetToggle(): boolean { return true; }
  GetMutli(): number { return 0; }
  GetMultiCount(): number { return 0; }
  GetIcon(): string { return this.icon; }
  SetIcon(icon: string): void { this.icon = icon; }
  GetDescription(): string { return this.description; }
  SetDescription(description: string): void { this.description = description; }
  Perform(): void {
    this.perform();
    for (const l of this.listeners) l.OnValueChanged(this);
  }
  Update(): void {
    for (const l of this.listeners) l.OnValueChanged(this);
  }
}

export class SandEffectOption extends QuickOption {
  constructor(m: GameModel) { super('P', 'Sand effect', m, QuickOption_Toggle); }
  override GetToggle(): boolean { return !!this.m.GetSimulation().pretty_powder; }
  protected override perform(): void {
    const sim = this.m.GetSimulation();
    sim.pretty_powder = sim.pretty_powder ? 0 : 1;
  }
}
export class DrawGravOption extends QuickOption {
  constructor(m: GameModel) { super('G', 'Draw gravity field \bg(ctrl+g)', m, QuickOption_Toggle); }
  override GetToggle(): boolean { return this.m.GetGravityGrid(); }
  protected override perform(): void { this.m.ShowGravityGrid(!this.m.GetGravityGrid()); }
}
export class DecorationsOption extends QuickOption {
  constructor(m: GameModel) { super('D', 'Draw decorations \bg(ctrl+b)', m, QuickOption_Toggle); }
  override GetToggle(): boolean { return this.m.GetDecoration(); }
  protected override perform(): void { this.m.SetDecoration(!this.m.GetDecoration()); }
}
export class NGravityOption extends QuickOption {
  constructor(m: GameModel) { super('N', 'Newtonian Gravity \bg(n)', m, QuickOption_Toggle); }
  override GetToggle(): boolean { return this.m.GetNewtonianGrvity(); }
  protected override perform(): void { this.m.SetNewtonianGravity(!this.m.GetNewtonianGrvity()); }
}
export class AHeatOption extends QuickOption {
  constructor(m: GameModel) { super('A', 'Ambient heat \bg(u)', m, QuickOption_Toggle); }
  override GetToggle(): boolean { return this.m.GetAHeatEnable(); }
  protected override perform(): void { this.m.SetAHeatEnable(!this.m.GetAHeatEnable()); }
}
export class ConsoleShowOption extends QuickOption {
  private c: GameController;
  constructor(m: GameModel, c_: GameController) {
    super('C', 'Show Console \bg(~)', m, QuickOption_Toggle);
    this.c = c_;
  }
  override GetToggle(): boolean { return false; }
  protected override perform(): void { this.c.ShowConsole(); }
}
