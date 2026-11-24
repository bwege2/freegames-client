// @ts-nocheck
// OpenClonk port: the synchronized part of the script GUI (gui/C4ScriptGuiWindow.cpp), until the GUI is translated
// (milestone 2). gui/C4ScriptGuiWindow is a C4GUI::ScrollWindow, and the C4GUI element tree, layout and drawing are
// not translated (src/sim's C4ScriptGuiWindow is an empty class). What the game state depends on is here, as the
// original does it: GuiOpen's ID (the root's counter, which C4ScriptGuiWindowAction::Init also counts for every Call
// action), the windows' order by priority, sub-windows by name and by ID (a main window's childrenIDMap), Target,
// the OnClose call when a window closes (GuiClose, its target object removed: ClearPointers), the removal lock of a
// closing callback. Positions, texts, symbols, styles and the other properties are presentation and not kept; the
// tags only as far as they select the current action and priority. rt/headless.ts installs it as C4ScriptGuiWindow.
import { $ } from './registry.ts';
import { $str, S } from './ptr.ts';
import { $throw } from './std.ts';

const NO_OWNER = -1;
const CALL = 1, SET_TAG = 2; // C4ScriptGuiWindowActionID
const ACTION_PROPS = new Set(['OnClick', 'OnMouseIn', 'OnMouseOut', 'OnClose']);
/** the keys CreateFromPropList takes as properties; any other key with a proplist value is a sub-window */
const KNOWN = new Set(['Left', 'Top', 'Right', 'Bottom', 'Margin', 'BackgroundColor', 'Target', 'Symbol', 'Decoration',
  'Text', 'GraphicsName', 'Tooltip', 'Prototype', 'Mode', 'ID', 'OnClick', 'OnMouseIn', 'OnMouseOut', 'OnClose', 'Style',
  'Priority', 'Player']);

const text = (s: any): string => (s ? $str(s.GetCStr()) : '');

/** the sorted keys of a proplist (C4PropList::GetProperties, C4ValueArray::SortStrings) with their values */
function sortedProps(pl: any): [any, any][] {
  const keys = pl.GetProperties();
  keys.SortStrings();
  const out: [any, any][] = [];
  for (let i = 0; i < keys.GetSize(); i++) {
    const key = keys.GetItem(i).getStr();
    const v = new $.C4Value().init$v();
    pl.GetPropertyByS(key, v);
    out.push([key, v]);
  }
  return out;
}

/** C4ScriptGuiWindowAction: a chain of actions, Init as the original (the chain's tail first) */
class GuiAction {
  action = 0; id = 0; target: any = null; text: any = null; value: any = null; next: GuiAction | null = null;
  init(array: any, index = 0): boolean {
    if (array.GetSize() === 0) return false;
    if (array.GetItem(0).getArray()) {
      if (index + 1 < array.GetSize()) { this.next = new GuiAction(); this.next.init(array, index + 1); }
      array = array.GetItem(index).getArray();
      if (!array) return false;
    }
    const newAction = array.GetItem(0).getInt();
    this.action = 0;
    if (array.GetSize() === 6) this.id = array.GetItem(3).getInt();
    switch (newAction) {
      case CALL:
        if (array.GetSize() < 3) return false;
        this.target = array.GetItem(1).getPropList();
        this.text = array.GetItem(2).getStr();
        if (!this.target || !this.text) return false;
        if (array.GetSize() >= 4) this.value = new $.C4Value().init$v(), this.value.Set$C4Value(array.GetItem(3));
        if (!this.id) this.id = $.Game.ScriptGuiRoot.GenerateActionID();
        break;
      case SET_TAG:
        if (array.GetSize() < 4) return false;
        this.text = array.GetItem(1).getStr();
        if (!this.text) return false;
        this.target = array.GetItem(3).getObj();
        break;
      default:
        return false;
    }
    this.action = newAction;
    return true;
  }
  clearPointers(obj: any): void {
    const t = this.target ? this.target.GetObject$v() : null;
    if (t === obj) { this.action = 0; this.target = null; }
    this.next?.clearPointers(obj);
  }
  /** ExecuteCommand: the Call with this ID, from `parent`'s window */
  executeCommand(actionID: number, parent: GuiWindow, player: number): boolean {
    if (this.id === actionID && this.action) {
      let main = parent, from = parent;
      while (!from.IsRoot()) { main = from; from = from.parent; }
      const pars = new $.C4AulParSet().init$v();
      if (this.value) pars.Par[0].Set$C4Value(this.value);
      pars.Par[1].SetInt(player);
      pars.Par[2].SetInt(main.GetID());
      pars.Par[3].SetInt(parent.GetID());
      if (parent.target && parent.target.Status) pars.Par[4].Set$C4Value($.C4VObj(parent.target));
      this.target.Call$pi8$pC4AulParSet$b(this.text.GetCStr(), pars, false);
      return true;
    }
    return this.next ? this.next.executeCommand(actionID, parent, player) : false;
  }
}

/** C4ScriptGuiWindowProperty for the kept properties: tagged values, the current tag's */
class GuiProp {
  tagged = new Map<string, any>();
  current: any = undefined;
  type: string;
  constructor(type: string) { this.type = type; }
  set(value: any, tag: string): void {
    const pl = value.getPropList();
    if (pl && !(pl.GetDef$v() || pl.GetObject$v())) {
      for (const [key, v] of sortedProps(pl)) this.set(v, text(key));
      return;
    }
    let entry: any = null;
    if (ACTION_PROPS.has(this.type)) {
      const array = value.getArray();
      if (array) { entry = new GuiAction(); entry.init(array); }
    } else {
      entry = value.getInt();
    }
    this.tagged.set(tag, entry);
    this.current = entry;
  }
  switchTag(tag: string): boolean {
    if (!this.tagged.has(tag)) return false;
    if (this.current === this.tagged.get(tag) && this.tagged.get(tag) !== undefined) return false;
    this.current = this.tagged.get(tag);
    return true;
  }
  clearPointers(obj: any): void {
    if (ACTION_PROPS.has(this.type)) for (const a of this.tagged.values()) a?.clearPointers(obj);
  }
}

export class GuiWindow {
  id = 0;
  name: any = null;
  target: any = null;
  parent: GuiWindow | null = null;
  children: GuiWindow[] = [];
  childrenIDMap: [number, GuiWindow][] = [];
  isMainWindow = false;
  wasClosed = false;
  wasRemovedFromParent = false;
  lock = 0;
  props: Record<string, GuiProp> = { OnClick: new GuiProp('OnClick'), OnMouseIn: new GuiProp('OnMouseIn'),
    OnMouseOut: new GuiProp('OnMouseOut'), OnClose: new GuiProp('OnClose'), Priority: new GuiProp('Priority') };

  init(): this { return this; }
  init$v(): this { return this; }
  IsRoot(): boolean { return this === $.Game.ScriptGuiRoot; }
  GetID(): number { return this.id; }
  GenerateMenuID(): number { return ++this.id; }
  GenerateActionID(): number { return ++this.id; }
  priority(): number { return typeof this.props.Priority.current === 'number' ? this.props.Priority.current : 0; }

  AddChild$pC4ScriptGuiWindow(child: GuiWindow): GuiWindow {
    if (this.IsRoot()) { child.id = this.GenerateMenuID(); child.isMainWindow = true; }
    this.ChildChangedPriority(child);
    return child;
  }
  AddChild(child: GuiWindow): GuiWindow { return this.AddChild$pC4ScriptGuiWindow(child); }

  /** C4GUI::Container::InsertElement: (re)inserted before the first child of a higher priority */
  ChildChangedPriority(child: GuiWindow): void {
    const prio = child.priority();
    const at = this.children.indexOf(child);
    if (at >= 0) this.children.splice(at, 1);
    let i = this.children.findIndex((c) => c.priority() > prio);
    if (i < 0) i = this.children.length;
    this.children.splice(i, 0, child);
    child.parent = this;
  }
  ChildWithIDRemoved(child: GuiWindow): void {
    if (this.IsRoot()) return;
    if (!this.isMainWindow) return this.parent!.ChildWithIDRemoved(child);
    const i = this.childrenIDMap.findIndex(([k, w]) => k === child.id && w === child);
    if (i >= 0) this.childrenIDMap.splice(i, 1);
  }
  ChildGotID(child: GuiWindow): void {
    if (!this.isMainWindow) return this.parent!.ChildGotID(child);
    // std::multimap: after the entries of the same key
    let i = this.childrenIDMap.length;
    while (i > 0 && this.childrenIDMap[i - 1][0] > child.id) i--;
    this.childrenIDMap.splice(i, 0, [child.id, child]);
  }
  GetChildByID(childID: number): GuiWindow | null { return this.children.find((c) => c.id === childID) ?? null; }
  GetChildByName(name: any): GuiWindow | null {
    if (name == null) return null;
    return this.children.find((c) => c.name === name) ?? null;
  }
  GetSubWindow(childID: number, target: any): GuiWindow | null {
    for (const [k, w] of this.childrenIDMap) if (k === childID && w.target === (target ?? null)) return w;
    return null;
  }

  CreateFromPropList(proplist: any, resetStdTag = false, isUpdate = false, isLoading = false): boolean {
    if (!proplist) return false;
    const parent = this.parent;
    for (const [key, property] of sortedProps(proplist)) {
      const k = text(key);
      if (k === 'Target') this.target = property.getObj();
      else if (k === 'ID') {
        if (parent && !this.isMainWindow) {
          if (this.id) parent.ChildWithIDRemoved(this);
          this.id = property.getInt();
          if (this.id !== 0) parent.ChildGotID(this);
        } else if (isLoading) this.id = property.getInt();
      } else if (ACTION_PROPS.has(k)) this.props[k].set(property, 'Std');
      else if (k === 'Priority') {
        this.props.Priority.set(property, 'Std');
        if (parent) parent.ChildChangedPriority(this);
      } else if (!KNOWN.has(k)) {
        const sub = property.getPropList();
        if (sub) {
          const childName = k[0] !== '_' ? key : null;
          let child = this.GetChildByName(childName);
          let fresh = false;
          if (!child) {
            child = new GuiWindow();
            if (childName != null) child.name = childName;
            this.AddChild$pC4ScriptGuiWindow(child);
            fresh = true;
          }
          if (!child.CreateFromPropList(sub, isUpdate === true, false, isLoading) && fresh) this.RemoveChild(child, false);
        }
      }
    }
    if (resetStdTag || isLoading) this.SetTag(S('Std'));
    return true;
  }

  SetTag(tag: any): void {
    const t = typeof tag === 'string' ? tag : tag?.GetCStr ? text(tag) : $str(tag);
    for (const p of Object.values(this.props)) p.switchTag(t);
    for (const c of this.children) c.SetTag(tag);
  }

  RemoveChild(child: GuiWindow | null, close = true, all = false): void {
    if (this.lock > 0) {
      $throw(new $.C4AulExecError().init(S('Trying to remove script GUI window (or window target) from within window closing callback.')));
    }
    if (child) {
      child.wasRemovedFromParent = true;
      if (close) child.Close$v();
      if (child.id !== 0) this.ChildWithIDRemoved(child);
      const i = this.children.indexOf(child);
      if (i >= 0) this.children.splice(i, 1);
    } else if (close) {
      for (const c of [...this.children]) {
        c.wasRemovedFromParent = true;
        c.Close$v();
        if (c.id !== 0) this.ChildWithIDRemoved(c);
      }
    }
    if (all) this.children = [];
  }
  ClearChildren(close = true): void { this.RemoveChild(null, close, true); }

  lockRemoval(d: number): void {
    this.lock += d;
    if (!this.isMainWindow && this.parent) this.parent.lockRemoval(d);
  }
  Close$v(): void {
    if (this.wasClosed) return;
    this.wasClosed = true;
    this.ClearChildren(true);
    const action = this.props.OnClose.current;
    if (action && action.action === CALL) {
      this.lockRemoval(1);
      try { action.executeCommand(action.id, this, NO_OWNER); } finally { this.lockRemoval(-1); }
    }
    this.target = null;
    if (!this.wasRemovedFromParent) this.parent!.RemoveChild(this);
  }
  Close(): void { this.Close$v(); }

  ClearPointers(obj: any): void {
    if (this.wasRemovedFromParent) return;
    for (const k of ['OnClick', 'OnMouseIn', 'OnMouseOut', 'OnClose']) this.props[k].clearPointers(obj);
    for (const c of [...this.children]) c.ClearPointers(obj);
    if (this.target === obj) this.Close$v();
  }

  // presentation and savegames: nothing to keep headless
  Clear(): void { this.ClearChildren(false); }
  Execute(): void {}
  Draw(): void {}
  ClearPointers$v(): void {}
}
