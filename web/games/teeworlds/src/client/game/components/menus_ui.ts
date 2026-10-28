// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: the parts of game/client/components/menus.h, menus_scrollregion.cpp and menus_listbox.cpp of
// Teeworlds 0.7.5 that every page of the menu uses (in TypeScript): the scroll region, the list box, the scrollbar
// scales, the button container, the page and popup numbers.
import { vec2, str_find_nocase, Localize, v4, clamp, round_to_int } from './common.ts';
import * as K from '../../engine/keys.ts';
import { CUIRect, CORNER_ALL, CORNER_B, CORNER_T, ALIGN_CENTER, type UIID } from '../ui.ts';
import type { CMenus } from './menus.ts';

export const ms_ButtonHeight = 25, ms_ListheaderHeight = 17, ms_FontmodHeight = 0.8;

/** a char buffer the widgets edit */
export interface CStrRef { v: string }
/** a float the widgets keep (the scroll offsets of the edit boxes) */
export interface CNumRef { v: number }

/** the config variable Name as a CStrRef */
export function CfgStr<T extends object>(Obj: T, Name: keyof T): CStrRef {
  return {
    get v() { return Obj[Name] as unknown as string; },
    set v(s: string) { (Obj as Record<keyof T, unknown>)[Name] = s; },
  };
}

export interface IScrollbarScale {
  ToRelative(AbsoluteValue: number, Min: number, Max: number): number;
  ToAbsolute(RelativeValue: number, Min: number, Max: number): number;
}
export const LinearScrollbarScale: IScrollbarScale = {
  ToRelative: (AbsoluteValue, Min, Max) => (AbsoluteValue - Min) / (Max - Min),
  ToAbsolute: (RelativeValue, Min, Max) => round_to_int(RelativeValue * (Max - Min) + Min + 0.1),
};
class CLogarithmicScrollbarScale implements IScrollbarScale {
  private m_MinAdjustment: number;
  constructor(MinAdjustment: number) { this.m_MinAdjustment = Math.max(MinAdjustment, 1); } // must be at least 1 to support Min == 0 with logarithm
  ToRelative(AbsoluteValue: number, Min: number, Max: number): number {
    if (Min < this.m_MinAdjustment) {
      AbsoluteValue += this.m_MinAdjustment;
      Min += this.m_MinAdjustment;
      Max += this.m_MinAdjustment;
    }
    return (Math.log(AbsoluteValue) - Math.log(Min)) / (Math.log(Max) - Math.log(Min));
  }
  ToAbsolute(RelativeValue: number, Min: number, Max: number): number {
    let ResultAdjustment = 0;
    if (Min < this.m_MinAdjustment) {
      Min += this.m_MinAdjustment;
      Max += this.m_MinAdjustment;
      ResultAdjustment = -this.m_MinAdjustment;
    }
    return round_to_int(Math.exp(RelativeValue * (Math.log(Max) - Math.log(Min)) + Math.log(Min))) + ResultAdjustment;
  }
}
export const LogarithmicScrollbarScale = new CLogarithmicScrollbarScale(25);

export class CButtonContainer {
  m_FadeStartTime = 0;
  GetID(): UIID { return this; }
}

export const POPUP_NONE = 0, POPUP_FIRST_LAUNCH = 1, POPUP_CONNECTING = 2, POPUP_MESSAGE = 3, POPUP_DISCONNECTED = 4, POPUP_PURE = 5,
  POPUP_LANGUAGE = 6, POPUP_COUNTRY = 7, POPUP_DELETE_DEMO = 8, POPUP_RENAME_DEMO = 9, POPUP_REMOVE_FRIEND = 10, POPUP_REMOVE_FILTER = 11,
  POPUP_SAVE_SKIN = 12, POPUP_DELETE_SKIN = 13, POPUP_SOUNDERROR = 14, POPUP_PASSWORD = 15, POPUP_QUIT = 16;
export const PAGE_NEWS = 0, PAGE_GAME = 1, PAGE_PLAYERS = 2, PAGE_SERVER_INFO = 3, PAGE_CALLVOTE = 4, PAGE_INTERNET = 5, PAGE_LAN = 6,
  PAGE_DEMOS = 7, PAGE_SETTINGS = 8, PAGE_SYSTEM = 9, PAGE_START = 10;
export const SETTINGS_GENERAL = 0, SETTINGS_PLAYER = 1, SETTINGS_TEE = 2, SETTINGS_CONTROLS = 3, SETTINGS_GRAPHICS = 4, SETTINGS_SOUND = 5;

export class CScrollRegionParams {
  m_ScrollbarWidth = 20;
  m_ScrollbarMargin = 5;
  m_SliderMinHeight = 25;
  m_ScrollSpeed = 5;
  m_ClipBgColor = v4(0, 0, 0, 0.25);
  m_ScrollbarBgColor = v4(0, 0, 0, 0.25);
  m_RailBgColor = v4(1, 1, 1, 0.25);
  m_SliderColor = v4(0.8, 0.8, 0.8, 1);
  m_SliderColorHover = v4(1, 1, 1, 1);
  m_SliderColorGrabbed = v4(0.9, 0.9, 0.9, 1);
  m_Flags = 0;
  static readonly FLAG_CONTENT_STATIC_WIDTH = 0x1;
}

export const SCROLLHERE_KEEP_IN_VIEW = 0, SCROLLHERE_TOP = 1, SCROLLHERE_BOTTOM = 2;

// Instances of CScrollRegion must be static, as member addresses are used as UI item IDs
export class CScrollRegion {
  private m_pMenus: CMenus;
  private m_ScrollY = 0;
  private m_ContentH = 0;
  private m_RequestScrollY = -1; // [0, ContentHeight]
  private m_ClipRect = new CUIRect();
  private m_RailRect = new CUIRect();
  private m_LastAddedRect = new CUIRect(); // saved for ScrollHere()
  private m_MouseGrabStartY = 0;
  private m_ContentScrollOff = new vec2(0, 0);
  private m_Params = new CScrollRegionParams();
  private readonly m_ID = {};
  constructor(pMenus: CMenus) { this.m_pMenus = pMenus; }

  /** Begin: pClipRect loses the scroll bar when it shows; returns the content offset (pOutOffset) */
  Begin(pClipRect: CUIRect, pParams: CScrollRegionParams | null = null): vec2 {
    const RT = this.m_pMenus.RenderTools();
    if (pParams) this.m_Params = pParams;
    const ContentOverflows = this.m_ContentH > pClipRect.h;
    const ForceShowScrollbar = this.m_Params.m_Flags & CScrollRegionParams.FLAG_CONTENT_STATIC_WIDTH;
    const ScrollBarBg = new CUIRect();
    pClipRect.VSplitRight(this.m_Params.m_ScrollbarWidth, ContentOverflows || ForceShowScrollbar ? pClipRect : null, ScrollBarBg);
    ScrollBarBg.Margin(this.m_Params.m_ScrollbarMargin, this.m_RailRect);
    // only show scrollbar if required
    if (ContentOverflows || ForceShowScrollbar) {
      if (this.m_Params.m_ScrollbarBgColor.a > 0) RT.DrawRoundRect(ScrollBarBg, this.m_Params.m_ScrollbarBgColor, 4);
      if (this.m_Params.m_RailBgColor.a > 0) RT.DrawRoundRect(this.m_RailRect, this.m_Params.m_RailBgColor, this.m_RailRect.w / 2);
    }
    if (!ContentOverflows) this.m_ContentScrollOff = new vec2(this.m_ContentScrollOff.x, 0);
    if (this.m_Params.m_ClipBgColor.a > 0) RT.DrawRoundRect(pClipRect, this.m_Params.m_ClipBgColor, 4);
    this.m_pMenus.UI().ClipEnable(pClipRect);
    this.m_ClipRect = pClipRect.copy();
    this.m_ContentH = 0;
    return this.m_ContentScrollOff;
  }

  End(): void {
    const UI = this.m_pMenus.UI(), In = this.m_pMenus.Input();
    UI.ClipDisable();
    // only show scrollbar if content overflows
    if (this.m_ContentH <= this.m_ClipRect.h) return;
    // scroll wheel
    const RegionRect = this.m_ClipRect.copy();
    RegionRect.w += this.m_Params.m_ScrollbarWidth;
    if (UI.MouseInside(RegionRect)) {
      if (In.KeyPress(K.KEY_MOUSE_WHEEL_UP)) this.m_ScrollY -= this.m_Params.m_ScrollSpeed;
      else if (In.KeyPress(K.KEY_MOUSE_WHEEL_DOWN)) this.m_ScrollY += this.m_Params.m_ScrollSpeed;
    }
    const SliderHeight = Math.max(this.m_Params.m_SliderMinHeight, (this.m_ClipRect.h / this.m_ContentH) * this.m_RailRect.h);
    const Slider = this.m_RailRect.copy();
    Slider.h = SliderHeight;
    const MaxScroll = this.m_RailRect.h - SliderHeight;
    if (this.m_RequestScrollY >= 0) {
      this.m_ScrollY = (this.m_RequestScrollY / (this.m_ContentH - this.m_ClipRect.h)) * MaxScroll;
      this.m_RequestScrollY = -1;
    }
    this.m_ScrollY = clamp(this.m_ScrollY, 0, MaxScroll);
    Slider.y += this.m_ScrollY;
    let Hovered = false, Grabbed = false;
    const pID = this.m_ID;
    const InsideSlider = UI.MouseInside(Slider);
    const InsideRail = UI.MouseInside(this.m_RailRect);
    if (InsideSlider) {
      UI.SetHotItem(pID);
      if (!UI.CheckActiveItem(pID) && UI.MouseButtonClicked(0)) {
        UI.SetActiveItem(pID);
        this.m_MouseGrabStartY = UI.MouseY();
      }
      Hovered = true;
    } else if (InsideRail && UI.MouseButton(0)) {
      const SliderDistance = UI.MouseY() - (Slider.y + Slider.h / 2);
      this.m_ScrollY += (SliderDistance < 0 ? -1 : 1) * Math.log(Math.abs(SliderDistance)); // slow down to reasonable scroll speed; keep sign with logarithm
      Hovered = true;
    }
    if (UI.CheckActiveItem(pID) && !UI.MouseButton(0)) UI.SetActiveItem(null);
    // move slider
    if (UI.CheckActiveItem(pID) && UI.MouseButton(0)) {
      const my = UI.MouseY();
      this.m_ScrollY += my - this.m_MouseGrabStartY;
      this.m_MouseGrabStartY = my;
      Grabbed = true;
    }
    this.m_ScrollY = clamp(this.m_ScrollY, 0, MaxScroll);
    this.m_ContentScrollOff = new vec2(this.m_ContentScrollOff.x, (-this.m_ScrollY / MaxScroll) * (this.m_ContentH - this.m_ClipRect.h));
    let SliderColor = this.m_Params.m_SliderColor;
    if (Grabbed) SliderColor = this.m_Params.m_SliderColorGrabbed;
    else if (Hovered) SliderColor = this.m_Params.m_SliderColorHover;
    this.m_pMenus.RenderTools().DrawRoundRect(Slider, SliderColor, Slider.w / 2);
  }

  AddRect(Rect: CUIRect): void {
    const ContentPosY = this.m_ClipRect.y + this.m_ContentScrollOff.y;
    this.m_LastAddedRect = Rect.copy();
    this.m_ContentH = Math.max(Rect.y + Rect.h - ContentPosY, this.m_ContentH);
  }

  ScrollHere(Option = SCROLLHERE_KEEP_IN_VIEW): void {
    const MinHeight = Math.min(this.m_ClipRect.h, this.m_LastAddedRect.h);
    const TopScroll = this.m_LastAddedRect.y - (this.m_ClipRect.y + this.m_ContentScrollOff.y);
    switch (Option) {
      case SCROLLHERE_TOP:
        this.m_RequestScrollY = TopScroll;
        break;
      case SCROLLHERE_BOTTOM:
        this.m_RequestScrollY = TopScroll - (this.m_ClipRect.h - MinHeight);
        break;
      default: {
        const dy = this.m_LastAddedRect.y - this.m_ClipRect.y;
        if (dy < 0) this.m_RequestScrollY = TopScroll;
        else if (dy > this.m_ClipRect.h - MinHeight) this.m_RequestScrollY = TopScroll - (this.m_ClipRect.h - MinHeight);
      }
    }
  }

  IsRectClipped(Rect: CUIRect): boolean {
    const c = this.m_ClipRect;
    return c.x > Rect.x + Rect.w || c.x + c.w < Rect.x || c.y > Rect.y + Rect.h || c.y + c.h < Rect.y;
  }
  IsScrollbarShown(): boolean { return this.m_ContentH > this.m_ClipRect.h; }
}

export interface CListboxItem { m_Visible: boolean; m_Selected: boolean; m_Rect: CUIRect }

// Instances of CListBox must be static, as member addresses are used as UI item IDs
export class CListBox {
  private m_pMenus: CMenus;
  private m_ListBoxView = new CUIRect();
  private m_ListBoxRowHeight = 0;
  private m_ListBoxItemIndex = 0;
  private m_ListBoxSelectedIndex = 0;
  private m_ListBoxNewSelected = 0;
  private m_ListBoxNewSelOffset = 0;
  private m_ListBoxUpdateScroll = false;
  private m_ListBoxDoneEvents = 0;
  private m_ListBoxNumItems = 0;
  private m_ListBoxItemsPerRow = 1;
  private m_ListBoxItemActivated = false;
  private m_pBottomText: string | null = null;
  private m_FooterHeight = 0;
  private m_ScrollRegion: CScrollRegion;
  private m_aFilterString: CStrRef = { v: '' };
  private m_OffsetFilter: CNumRef = { v: 0 };
  private static s_RowView = new CUIRect();
  private static s_ItemClicked = false;
  constructor(pMenus: CMenus) {
    this.m_pMenus = pMenus;
    this.m_ScrollRegion = new CScrollRegion(pMenus);
  }

  DoHeader(pRect: CUIRect, pTitle: string, HeaderHeight = 20, Spacing = 2): void {
    const Header = new CUIRect(), View = pRect.copy();
    // background
    View.HSplitTop(HeaderHeight + Spacing, Header, null);
    this.m_pMenus.RenderTools().DrawUIRect(Header, v4(0, 0, 0, 0.25), CORNER_T, 5);
    // draw header
    View.HSplitTop(HeaderHeight, Header, View);
    Header.y += 2;
    this.m_pMenus.UI().DoLabel(Header, pTitle, Header.h * ms_FontmodHeight * 0.8, ALIGN_CENTER);
    View.HSplitTop(Spacing, Header, View);
    // setup the variables
    this.m_ListBoxView = View;
  }

  DoFilter(FilterHeight = 20, Spacing = 2): boolean {
    const Filter = new CUIRect(), View = this.m_ListBoxView.copy();
    // background
    View.HSplitTop(FilterHeight + Spacing, Filter, null);
    this.m_pMenus.RenderTools().DrawUIRect(Filter, v4(0, 0, 0, 0.25), 0, 5);
    // draw filter
    View.HSplitTop(FilterHeight, Filter, View);
    Filter.Margin(Spacing, Filter);
    const FontSize = Filter.h * ms_FontmodHeight * 0.8;
    const Label = new CUIRect(), EditBox = new CUIRect();
    Filter.VSplitLeft(Filter.w / 5, Label, EditBox);
    Label.y += Spacing;
    this.m_pMenus.UI().DoLabel(Label, Localize('Search:'), FontSize, ALIGN_CENTER);
    const Changed = this.m_pMenus.DoEditBox(this.m_aFilterString, EditBox, this.m_aFilterString, 64, FontSize, this.m_OffsetFilter);
    View.HSplitTop(Spacing, Filter, View);
    this.m_ListBoxView = View;
    return Changed;
  }

  DoFooter(pBottomText: string | null, FooterHeight = 20): void { // call before DoStart to create a footer
    this.m_pBottomText = pBottomText;
    this.m_FooterHeight = FooterHeight;
  }

  DoStart(RowHeight: number, NumItems: number, ItemsPerRow: number, SelectedIndex: number, pRect: CUIRect | null = null, Background = true, pActive: { v: boolean } | null = null): void {
    const View = pRect ? pRect.copy() : this.m_ListBoxView.copy();
    // background
    if (Background) this.m_pMenus.RenderTools().DrawUIRect(View, v4(0, 0, 0, 0.25), CORNER_B, 5);
    // draw footers
    if (this.m_pBottomText) {
      const Footer = new CUIRect();
      View.HSplitBottom(this.m_FooterHeight, View, Footer);
      Footer.VSplitLeft(10, null, Footer);
      Footer.y += 2;
      this.m_pMenus.UI().DoLabel(Footer, this.m_pBottomText, Footer.h * ms_FontmodHeight * 0.8, ALIGN_CENTER);
    }
    // setup the variables
    this.m_ListBoxView = View;
    this.m_ListBoxSelectedIndex = SelectedIndex;
    this.m_ListBoxNewSelected = SelectedIndex;
    this.m_ListBoxNewSelOffset = 0;
    this.m_ListBoxItemIndex = 0;
    this.m_ListBoxRowHeight = RowHeight;
    this.m_ListBoxNumItems = NumItems;
    this.m_ListBoxItemsPerRow = ItemsPerRow;
    this.m_ListBoxDoneEvents = 0;
    this.m_ListBoxItemActivated = false;
    // handle input
    if (!pActive || pActive.v) {
      if (this.m_pMenus.m_DownArrowPressed) this.m_ListBoxNewSelOffset += 1;
      if (this.m_pMenus.m_UpArrowPressed) this.m_ListBoxNewSelOffset -= 1;
    }
    // setup the scrollbar
    const ScrollOffset = this.m_ScrollRegion.Begin(this.m_ListBoxView);
    this.m_ListBoxView.y += ScrollOffset.y;
  }

  private DoNextRow(): CListboxItem {
    const s_RowView = CListBox.s_RowView;
    const Item: CListboxItem = { m_Visible: false, m_Selected: false, m_Rect: new CUIRect() };
    if (this.m_ListBoxItemIndex % this.m_ListBoxItemsPerRow === 0) this.m_ListBoxView.HSplitTop(this.m_ListBoxRowHeight, s_RowView, this.m_ListBoxView);
    this.m_ScrollRegion.AddRect(s_RowView);
    if (this.m_ListBoxUpdateScroll && this.m_ListBoxSelectedIndex === this.m_ListBoxItemIndex) {
      this.m_ScrollRegion.ScrollHere(SCROLLHERE_KEEP_IN_VIEW);
      this.m_ListBoxUpdateScroll = false;
    }
    s_RowView.VSplitLeft(s_RowView.w / (this.m_ListBoxItemsPerRow - (this.m_ListBoxItemIndex % this.m_ListBoxItemsPerRow)), Item.m_Rect, s_RowView);
    Item.m_Selected = this.m_ListBoxSelectedIndex === this.m_ListBoxItemIndex;
    Item.m_Visible = !this.m_ScrollRegion.IsRectClipped(Item.m_Rect);
    this.m_ListBoxItemIndex++;
    return Item;
  }

  DoNextItem(pId: UIID, Selected = false, pActive: { v: boolean } | null = null): CListboxItem {
    const UI = this.m_pMenus.UI(), RT = this.m_pMenus.RenderTools();
    const ThisItemIndex = this.m_ListBoxItemIndex;
    if (Selected) {
      if (this.m_ListBoxSelectedIndex === this.m_ListBoxNewSelected) this.m_ListBoxNewSelected = ThisItemIndex;
      this.m_ListBoxSelectedIndex = ThisItemIndex;
    }
    const Item = this.DoNextRow();
    if (Item.m_Visible && UI.DoButtonLogic(pId, Item.m_Rect)) {
      CListBox.s_ItemClicked = true;
      this.m_ListBoxNewSelected = ThisItemIndex;
      if (pActive) pActive.v = true;
    } else CListBox.s_ItemClicked = false;
    const ProcessInput = !pActive || pActive.v;
    // process input, regard selected index
    if (this.m_ListBoxSelectedIndex === ThisItemIndex) {
      if (ProcessInput && !this.m_ListBoxDoneEvents) {
        this.m_ListBoxDoneEvents = 1;
        if (this.m_pMenus.m_EnterPressed || (CListBox.s_ItemClicked && this.m_pMenus.Input().MouseDoubleClick())) {
          this.m_ListBoxItemActivated = true;
          UI.SetActiveItem(null);
        }
      }
      RT.DrawUIRect(Item.m_Rect.copy(), v4(1, 1, 1, ProcessInput ? 0.5 : 0.33), CORNER_ALL, 5);
    }
    if (UI.HotItem() === pId) RT.DrawUIRect(Item.m_Rect.copy(), v4(1, 1, 1, 0.33), CORNER_ALL, 5);
    return Item;
  }

  DoEnd(): number {
    this.m_ScrollRegion.End();
    if (this.m_ListBoxNewSelOffset !== 0 && this.m_ListBoxSelectedIndex !== -1 && this.m_ListBoxSelectedIndex === this.m_ListBoxNewSelected) {
      this.m_ListBoxNewSelected = clamp(this.m_ListBoxNewSelected + this.m_ListBoxNewSelOffset, 0, this.m_ListBoxNumItems - 1);
      this.m_ListBoxUpdateScroll = true;
    }
    return this.m_ListBoxNewSelected;
  }

  FilterMatches(pNeedle: string): boolean { return !this.m_aFilterString.v || str_find_nocase(pNeedle, this.m_aFilterString.v) >= 0; }
  WasItemActivated(): boolean { return this.m_ListBoxItemActivated; }
}

