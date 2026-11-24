// @ts-nocheck
// OpenClonk 36de799: src/gui/C4ScriptGuiWindow.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { ScrollWindow } from './C4Gui.ts';
import { $u64n, ftoi32 } from '../../rt/int.ts';
import { c$isdigit } from '../../rt/libc.ts';
import { $oarr, $oat, $own, $rd, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $dyncast, $itcopy, $max, $min, $throw, IStringStream, StdMap, StdMultiMap, StdPair, StdString } from '../../rt/std.ts';

export class C4ScriptGuiWindowAction {
  id = 0;
  action = 0;
  nextAction = null;
  target = null;
  text = null;
  value = new $.C4Value().init$v();
  subwindowID = 0;

  init() {
    this.id = 0;
    this.action = 0;
    this.nextAction = null;
    this.target = null;
    this.text = null;
    this.value = new $.C4Value().init$i32(0);
    this.subwindowID = 0;
    return this;
  }

  $dtor() {
    if (this.text != null) {
      this.text.DecRef();
    }
    if (this.nextAction != null) {
      $delete(this.nextAction);
    }
  }

  ClearPointers(pObj) {
    let targetObj = this.target != null ? this.target.GetObject$v() : null;
    if (targetObj === pObj) {
      this.action = 0;
      this.target = null;
    }
    if (this.nextAction != null) {
      this.nextAction.ClearPointers(pObj);
    }
  }

  Init(array, index = 0) {
    if (array.GetSize() === 0) {
      return false;
    }
    if (array.GetItem(0).getArray() != null) {
      if ((index + 1 | 0) < array.GetSize()) {
        this.nextAction = new C4ScriptGuiWindowAction().init();
        this.nextAction.Init(array, index + 1 | 0);
      }
      array = array.GetItem(index).getArray();
      if (array == null) {
        return false;
      }
    }
    let newAction = array.GetItem(0).getInt();
    this.action = 0;
    if (array.GetSize() === 6) {
      this.id = array.GetItem(3).getInt();
    }
    switch (newAction) {
      case 2:
        if (array.GetSize() < 3) {
          return false;
        }
        this.target = array.GetItem(1).getPropList();
        this.text = array.GetItem(2).getStr();
        if (this.target == null || this.text == null) {
          return false;
        }
        if (array.GetSize() >= 4) {
          this.value.$assign(new $.C4Value().$copy(array.GetItem(3)));
        }
        this.text.IncRef();
        if (this.id === 0) {
          this.id = $.Game.ScriptGuiRoot.GenerateActionID();
          0;
        }
        break;
      case 1:
        if (array.GetSize() < 4) {
          return false;
        }
        this.text = array.GetItem(1).getStr();
        if (this.text == null) {
          return false;
        }
        this.text.IncRef();
        this.subwindowID = array.GetItem(2).getInt();
        this.target = array.GetItem(3).getObj();
        break;
      default:
        return false;
    }
    this.action = newAction;
    return true;
  }

  Execute(parent, player, actionType) {
    0;
    0;
    if (this.action !== 0) {
      let main = parent;
      let from = main;
      while (!from.IsRoot()) {
        main = from;
        from = from.GetParent();
      }
      switch (this.action) {
        case 2:
          {
            if (this.target == null) {
              break;
            }
            0;
            $.Game.Input.Add$i32$pC4ControlPacket(193 /*CID_MenuCommand*/, new $.C4ControlMenuCommand().init$i32$i32$i32$i32$pC4Object$i32(this.id, player, main.GetID$v(), parent.GetID$v(), parent.target, actionType));
            break;
          }
        case 1:
          {
            let window = main;
            if (this.subwindowID === 0) {
              window = parent;
            } else if (this.subwindowID > 0) {
              let targetObj = $dyncast(this.target, $.C4Object);
              window = main.GetSubWindow(this.subwindowID, targetObj);
            }
            if (window != null) {
              window.SetTag(this.text);
            }
            break;
          }
        default:
          0;
          break;
      }
    }
    if (this.nextAction != null) {
      this.nextAction.Execute(parent, player, actionType);
    }
  }

  ExecuteCommand(actionID, parent, player) {
    0;
    if (this.id === actionID && this.action !== 0) {
      0;
      let main = parent;
      let from = main;
      while (!from.IsRoot()) {
        main = from;
        from = from.GetParent();
      }
      0;
      let Pars = new $.C4AulParSet().init$rC4Value$mC4Value$mC4Value$mC4Value$mC4Value(this.value, $.C4VInt(player), $.C4VInt(main.GetID$v()), $.C4VInt(parent.GetID$v()), parent.target != null && parent.target.Status !== 0 ? $.C4VObj(parent.target) : new $.C4Value().$copy($.C4VNull));
      this.target.Call$pi8$pC4AulParSet$b(this.text.GetCStr(), Pars.op_and());
      return true;
    }
    if (this.nextAction != null) {
      return this.nextAction.ExecuteCommand(actionID, parent, player);
    }
    return false;
  }

  ToC4Value(first = true) {
    let array = new $.C4ValueArray();
    switch (this.action) {
      case 2:
        array.SetSize(4);
        array.SetItem(0, new $.C4Value().init$i32(this.action));
        array.SetItem(1, new $.C4Value().init$pC4PropList(this.target));
        array.SetItem(2, new $.C4Value().init$pC4String(this.text));
        array.SetItem(3, this.value);
        break;
      case 1:
        array.SetSize(4);
        array.SetItem(0, new $.C4Value().init$i32(this.action));
        array.SetItem(1, new $.C4Value().init$pC4String(this.text));
        array.SetItem(2, new $.C4Value().init$i32(this.subwindowID));
        array.SetItem(3, new $.C4Value().init$pC4PropList(this.target));
        break;
      case 0:
        break;
      default:
        0;
        break;
    }
    0;
    array.SetSize(6);
    array.SetItem(5, new $.C4Value().init$i32(this.id));
    if (!first || this.nextAction == null) {
      return new $.C4Value().init$pC4ValueArray(array);
    }
    let container = new $.C4ValueArray();
    let size = 1;
    container.SetSize(size);
    container.SetItem(0, new $.C4Value().init$pC4ValueArray(array));
    let next = this.nextAction;
    while (next != null) {
      let val = next.ToC4Value(false);
      size = size + 1 | 0;
      container.SetSize(size);
      container.SetItem(size - 1 | 0, val);
      next = next.nextAction;
    }
    return new $.C4Value().init$pC4ValueArray(container);
  }

  $clone() { return new C4ScriptGuiWindowAction().$assign(this); }
  $assign(o) {
    this.id = o.id;
    this.action = o.action;
    this.nextAction = o.nextAction;
    this.target = o.target;
    this.text = o.text;
    this.value.$assign(o.value);
    this.subwindowID = o.subwindowID;
    return this;
  }
}

export class C4ScriptGuiWindowProperty {
  current = null;
  currentTag = null;
  taggedProperties = new StdMap();
  type = -1;

  CleanUp(prop) {
    switch (this.type) {
      case 17:
        if (prop.deco != null) {
          $delete(prop.deco);
        }
        break;
      case 22:
      case 23:
      case 24:
      case 25:
        if (prop.action != null) {
          $delete(prop.action);
        }
        break;
      case 21:
      case 29:
      case 20:
        if (prop.strBuf != null) {
          $delete(prop.strBuf);
        }
        break;
      default:
        break;
    }
  }

  CleanUpAll() {
    for (const taggedProperty of this.taggedProperties) {
      this.CleanUp(taggedProperty.second);
      if (taggedProperty.first !== $oat($.Strings.P, 95 /*P_Std*/)) {
        taggedProperty.first.DecRef();
      }
    }
  }

  SetInt(to, tag = null) {
    if (tag == null) {
      tag = $oat($.Strings.P, 95 /*P_Std*/);
    }
    this.taggedProperties.entry(tag, () => new C4ScriptGuiWindowProperty$$anon1()).second.$assign(new C4ScriptGuiWindowProperty$$anon1());
    this.current = this.taggedProperties.entry(tag, () => new C4ScriptGuiWindowProperty$$anon1()).second;
    this.current.d = to;
  }

  SetFloat(to, tag = null) {
    if (tag == null) {
      tag = $oat($.Strings.P, 95 /*P_Std*/);
    }
    this.taggedProperties.entry(tag, () => new C4ScriptGuiWindowProperty$$anon1()).second.$assign(new C4ScriptGuiWindowProperty$$anon1());
    this.current = this.taggedProperties.entry(tag, () => new C4ScriptGuiWindowProperty$$anon1()).second;
    this.current.f = to;
  }

  SetNull(tag = null) {
    if (tag == null) {
      tag = $oat($.Strings.P, 95 /*P_Std*/);
    }
    this.taggedProperties.entry(tag, () => new C4ScriptGuiWindowProperty$$anon1()).second.$assign(new C4ScriptGuiWindowProperty$$anon1());
    this.current = this.taggedProperties.entry(tag, () => new C4ScriptGuiWindowProperty$$anon1()).second;
    this.current.data = null;
  }

  init() {
    this.current = null;
    this.currentTag = null;
    this.taggedProperties = new StdMap();
    this.type = -1;
    return this;
  }

  Set(value, tag) {
    let proplist = value.getPropList();
    let isTaggedPropList = false;
    if (proplist != null) {
      isTaggedPropList = !(proplist.GetDef$v() != null || proplist.GetObject$v() != null);
    }
    if (isTaggedPropList) {
      let properties = proplist.GetProperties();
      properties.SortStrings();
      for (let i = 0; i < properties.GetSize(); i = i + 1 | 0) {
        const entry = properties.GetItem(i);
        let key = entry.getStr();
        0;
        let property = new $.C4Value().init$v();
        proplist.GetPropertyByS(key, property);
        this.Set(property, key);
      }
      return;
    }
    if (this.taggedProperties.count(tag) !== 0) {
      this.CleanUp(this.taggedProperties.entry(tag, () => new C4ScriptGuiWindowProperty$$anon1()).second);
    } else if (tag !== $oat($.Strings.P, 95 /*P_Std*/)) {
      tag.IncRef();
    }
    this.taggedProperties.entry(tag, () => new C4ScriptGuiWindowProperty$$anon1()).second.$assign(new C4ScriptGuiWindowProperty$$anon1());
    this.current = this.taggedProperties.entry(tag, () => new C4ScriptGuiWindowProperty$$anon1()).second;
    this.currentTag = tag;
    switch (this.type) {
      case 0:
      case 2:
      case 1:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
      case 10:
      case 9:
      case 11:
      case 12:
      case 13:
      case 14:
      case 15:
        0;
        break;
      case 16:
      case 26:
      case 27:
        this.current.d = value.getInt();
        break;
      case 28:
        if (value.op_eq($.C4VNull)) {
          this.current.d = -2;
        } else {
          this.current.d = value.getInt();
        }
        break;
      case 18:
        {
          let symbol = value.getPropList();
          if (symbol != null) {
            this.current.obj = symbol.GetObject$v();
          } else {
            this.current.obj = null;
          }
          break;
        }
      case 19:
        {
          let symbol = value.getPropList();
          if (symbol != null) {
            this.current.def = symbol.GetDef$v();
          } else {
            this.current.def = null;
          }
          break;
        }
      case 17:
        {
          let def = value.getDef();
          if (def != null) {
            this.current.deco = new $.FrameDecoration().init();
            if (!this.current.deco.SetByDef$pC4Def(def)) {
              $delete(this.current.deco);
              this.current.deco = null;
            }
          }
          break;
        }
      case 21:
      case 20:
      case 29:
        {
          let string = value.getStr();
          let buf = new $.StdCopyStrBuf();
          if (string != null) {
            buf.Copy$pi8(string.GetCStr());
          } else {
            buf.Copy$pi8(S(""));
          }
          this.current.strBuf = buf;
          break;
        }
      case 22:
      case 23:
      case 24:
      case 25:
        {
          let array = value.getArray();
          if (array != null) {
            0;
            this.current.action = new C4ScriptGuiWindowAction().init();
            this.current.action.Init(array);
          }
          break;
        }
      default:
        0;
        break;
    }
  }

  GetInt() {
    return this.current.d;
  }

  GetFloat() {
    return this.current.f;
  }

  GetObject() {
    return this.current.obj;
  }

  GetDef() {
    return this.current.def;
  }

  GetFrameDecoration() {
    return this.current.deco;
  }

  GetStrBuf() {
    return this.current.strBuf;
  }

  GetAction() {
    return this.current.action;
  }

  GetAllActions() {
    let allActions = [];
    for (const taggedProperty of this.taggedProperties) {
      const p = taggedProperty.second;
      if (p.action != null) {
        allActions.push(p.action);
      }
    }
    return allActions;
  }

  SwitchTag(tag) {
    if (!(this.taggedProperties.count(tag) !== 0)) {
      return false;
    }
    if (this.current === this.taggedProperties.entry(tag, () => new C4ScriptGuiWindowProperty$$anon1()).second) {
      return false;
    }
    this.current = this.taggedProperties.entry(tag, () => new C4ScriptGuiWindowProperty$$anon1()).second;
    this.currentTag = tag;
    return true;
  }

  GetCurrentTag() {
    return this.currentTag;
  }

  ToC4Value() {
    let proplist = null;
    let onlyOneTag = this.taggedProperties.size() === 1;
    if (!onlyOneTag) {
      proplist = $.C4PropList.New$pC4PropList();
    }
    for (const taggedProperty of this.taggedProperties) {
      let tagString = taggedProperty.first;
      const prop = taggedProperty.second;
      let val = new $.C4Value().init$v();
      switch (this.type) {
        case 0:
        case 2:
        case 1:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 10:
        case 9:
        case 11:
        case 12:
        case 13:
        case 14:
        case 15:
          0;
          break;
        case 16:
        case 26:
        case 27:
        case 28:
          val.$assign(new $.C4Value().init$i32(prop.d));
          break;
        case 18:
          val.$assign(new $.C4Value().init$pC4Object(prop.obj));
          break;
        case 19:
          val.$assign(new $.C4Value().init$pC4Def(prop.def));
          break;
        case 17:
          if (prop.deco != null) {
            val.$assign(new $.C4Value().init$pC4Def(prop.deco.pSourceDef));
          }
          break;
        case 21:
        case 20:
        case 29:
          {
            if (prop.strBuf != null) {
              let s = $.Strings.FindString(prop.strBuf.getData());
              if (s == null) {
                s = $.Strings.RegString$pi8(prop.strBuf.getData());
              }
              val.$assign(new $.C4Value().init$pC4String(s));
            }
            break;
          }
        case 22:
        case 23:
        case 24:
        case 25:
          if (prop.action != null) {
            val.$assign(prop.action.ToC4Value());
          }
          break;
        default:
          0;
          break;
      }
      if (onlyOneTag) {
        return val;
      }
      0;
      proplist.SetPropertyByS(tagString, val);
    }
    return new $.C4Value().init$pC4PropList(proplist);
  }

  ClearPointers(pObj) {
    for (const taggedProperty of this.taggedProperties) {
      switch (this.type) {
        case 18:
          if (taggedProperty.second.obj === pObj) {
            taggedProperty.second.obj = null;
          }
          break;
        case 22:
        case 23:
        case 24:
        case 25:
          if (taggedProperty.second.action != null) {
            taggedProperty.second.action.ClearPointers(pObj);
          }
          break;
        default:
          return;
      }
    }
  }

  $clone() { return new C4ScriptGuiWindowProperty().$assign(this); }
  $assign(o) {
    this.current = o.current;
    this.currentTag = o.currentTag;
    this.taggedProperties = o.taggedProperties.$clone();
    this.type = o.type;
    return this;
  }
}

export class C4ScriptGuiWindowProperty$$anon1 {
  $v = null;
  get data() { const v = this.$v; return v === 0 ? null : v; }
  set data(v) { this.$v = v; }
  get f() { return this.$v; }
  set f(v) { this.$v = v; }
  get d() { const v = this.$v; return v === null ? 0 : v; }
  set d(v) { this.$v = v; }
  get obj() { const v = this.$v; return v === 0 ? null : v; }
  set obj(v) { this.$v = v; }
  get def() { const v = this.$v; return v === 0 ? null : v; }
  set def(v) { this.$v = v; }
  get deco() { const v = this.$v; return v === 0 ? null : v; }
  set deco(v) { this.$v = v; }
  get strBuf() { const v = this.$v; return v === 0 ? null : v; }
  set strBuf(v) { this.$v = v; }
  get action() { const v = this.$v; return v === 0 ? null : v; }
  set action(v) { this.$v = v; }
  $clone() { const u = new C4ScriptGuiWindowProperty$$anon1(); u.$v = this.$v; return u; }
  $assign(o) { this.$v = o.$v; return this; }
}

export class C4ScriptGuiWindow extends ScrollWindow {
  static standardWidth;
  static standardHeight;
  id = 0;
  name = null;
  isMainWindow = false;
  mainWindowNeedsLayoutUpdate = false;
  wasRemovedFromParent = false;
  wasClosed = false;
  lockRemovalForClosingCallbackCounter = 0;
  target = null;
  props = $oarr(30, () => new C4ScriptGuiWindowProperty().init());
  childrenIDMap = new StdMultiMap();
  currentMouseState = 0;

  IsRoot() {
    return this === $.Game.ScriptGuiRoot;
  }

  lockRemovalForClosingCallback() {
    this.lockRemovalForClosingCallbackCounter = this.lockRemovalForClosingCallbackCounter + 1 | 0;
    if (!this.isMainWindow) {
      this.GetParent().lockRemovalForClosingCallback();
    }
  }

  unlockRemovalForClosingCallback() {
    0;
    this.lockRemovalForClosingCallbackCounter = this.lockRemovalForClosingCallbackCounter - 1 | 0;
    if (!this.isMainWindow) {
      this.GetParent().unlockRemovalForClosingCallback();
    }
  }

  isRemovalLockedForClosingCallback() {
    return this.lockRemovalForClosingCallbackCounter > 0;
  }

  GetTarget() {
    return this.target;
  }

  Init$v() {
    this.id = 0;
    this.name = null;
    this.isMainWindow = false;
    this.mainWindowNeedsLayoutUpdate = false;
    for (let i = 0; i < 30; i = i + 1 | 0) {
      this.props[i].type = i;
    }
    this.props[0 /*left*/].SetNull();
    this.props[2 /*right*/].SetNull();
    this.props[1 /*top*/].SetNull();
    this.props[3 /*bottom*/].SetNull();
    this.props[4 /*relLeft*/].SetNull();
    this.props[6 /*relTop*/].SetNull();
    this.props[7 /*relBottom*/].SetFloat(1);
    this.props[5 /*relRight*/].SetFloat(1);
    this.props[8 /*leftMargin*/].SetNull();
    this.props[10 /*rightMargin*/].SetNull();
    this.props[9 /*topMargin*/].SetNull();
    this.props[11 /*bottomMargin*/].SetNull();
    this.props[12 /*relLeftMargin*/].SetNull();
    this.props[14 /*relTopMargin*/].SetNull();
    this.props[15 /*relBottomMargin*/].SetNull();
    this.props[13 /*relRightMargin*/].SetNull();
    this.props[16 /*backgroundColor*/].SetNull();
    this.props[17 /*frameDecoration*/].SetNull();
    this.props[18 /*symbolObject*/].SetNull();
    this.props[19 /*symbolDef*/].SetNull();
    this.props[21 /*text*/].SetNull();
    this.props[20 /*symbolGraphicsName*/].SetNull();
    this.props[29 /*tooltip*/].SetNull();
    this.props[22 /*onClickAction*/].SetNull();
    this.props[23 /*onMouseInAction*/].SetNull();
    this.props[24 /*onMouseOutAction*/].SetNull();
    this.props[25 /*onCloseAction*/].SetNull();
    this.props[26 /*style*/].SetNull();
    this.props[27 /*priority*/].SetNull();
    this.props[28 /*player*/].SetInt(-2);
    this.wasRemovedFromParent = false;
    this.wasClosed = false;
    this.currentMouseState = 0;
    this.target = null;
    this.pScrollBar.fAutoHide = true;
    this.rcBounds.x = this.rcBounds.y = 0;
    this.rcBounds.Wdt = this.rcBounds.Hgt = 0;
  }

  SetID(to) {
    this.id = to;
  }

  ChildGotID(child) {
    0;
    if (!this.isMainWindow) {
      return this.GetParent().ChildGotID(child);
    }
    this.childrenIDMap.insertPair(new StdPair(child.GetID$v(), child));
    0;
  }

  ChildWithIDRemoved(child) {
    if (this.IsRoot()) {
      return;
    }
    if (!this.isMainWindow) {
      return this.GetParent().ChildWithIDRemoved(child);
    }
    let range = new StdPair(null, null);
    range.$assign(this.childrenIDMap.equal_range(child.GetID$v()));
    for (let iter = $itcopy(range.first); !iter.eq(range.second); iter.inc()) {
      if (iter.v.second !== child) {
        continue;
      }
      this.childrenIDMap.erase($itcopy(iter));
      0;
      return;
    }
  }

  ChildChangedPriority(child) {
    let $t1, $t2, $t3;
    let prio = child.props[27 /*priority*/].GetInt();
    let insertBefore = null;
    $t1 = this;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    for (; $t2.op_ne($t3); $t2.op_inc$v()) {
      const element = $t2.op_mul();
      let otherChild = element;
      if (otherChild.props[27 /*priority*/].GetInt() <= prio) {
        continue;
      }
      insertBefore = element;
      break;
    }
    0;
    $.Container.prototype.InsertElement$pElement$pElement.call(this, child, insertBefore);
  }

  SetPositionStringProperties(property, relative, absolute, tag) {
    if (property.GetType() === 3) {
      let proplist = property.getPropList();
      for (let iter = proplist.begin(); iter.op_ne(proplist.end()); iter.op_inc$v()) {
        this.SetPositionStringProperties(iter.op_arrow().Value, relative, absolute, iter.op_arrow().Key);
      }
      return;
    }
    if (property.GetType() !== 4) {
      if (property.GetType() !== 0) {
        $.LogF(S("Warning: Got %s instead of expected menu format string."), property.GetTypeName());
      }
      return;
    }
    let relativeValue = Math.fround(0);
    let absoluteValue = Math.fround(0);
    let c_locale = null;
    let reader = new IStringStream(StdString.of(property.getStr().GetCStr()));
    void 0;
    if (!reader.good()) {
      return;
    }
    while (!reader.eof()) {
      reader.ws();
      const value = [0];
      let floatss = new IStringStream('');
      void 0;
      if (reader.peek() === 43 || reader.peek() === 45) {
        floatss.put(reader.get() << 24 >> 24);
      }
      reader.ws();
      while (c$isdigit(reader.peek()) !== 0 || reader.peek() === 46) {
        floatss.put(reader.get() << 24 >> 24);
      }
      floatss.read(P(value, 0), "f32");
      reader.ws();
      if (reader.peek() === 37) {
        relativeValue = Math.fround(relativeValue + value[0]);
        reader.get();
      } else if (reader.get() === 101 && reader.get() === 109) {
        absoluteValue = Math.fround(absoluteValue + value[0]);
      } else {
        $.LogF(S("Warning: Could not parse menu format string \"%s\"!"), property.getStr().GetCStr());
        return;
      }
      reader.peek();
    }
    this.props[relative].SetFloat(Math.fround(relativeValue / 100), tag);
    this.props[absolute].SetFloat(absoluteValue, tag);
  }

  PositionToC4Value(relativeName, absoluteName) {
    const relative = this.props[relativeName];
    const absolute = this.props[absoluteName];
    let proplist = null;
    let onlyStdTag = relative.taggedProperties.size() === 1;
    for (const taggedProperty of relative.taggedProperties) {
      let tag = taggedProperty.first;
      let buf = new $.StdStrBuf();
      buf.Format(S("%f%%%+fem"), Math.fround(100 * taggedProperty.second.f), absolute.taggedProperties.entry(tag, () => new C4ScriptGuiWindowProperty$$anon1()).second.f);
      let propString = $.Strings.RegString$StdStrBuf(new $.StdStrBuf().init$rStdStrBuf$b(buf));
      if (onlyStdTag) {
        return new $.C4Value().init$pC4String(propString);
      } else {
        if (proplist == null) {
          proplist = $.C4PropList.New$pC4PropList();
        }
        proplist.SetPropertyByS(tag, new $.C4Value().init$pC4String(propString));
      }
    }
    return new $.C4Value().init$pC4PropList(proplist);
  }

  SetMarginProperties(property, tag) {
    if (property.GetType() === 3) {
      let proplist = property.getPropList();
      for (let iter = proplist.begin(); iter.op_ne(proplist.end()); iter.op_inc$v()) {
        this.SetMarginProperties(iter.op_arrow().Value, iter.op_arrow().Key);
      }
      return;
    }
    if (property.GetType() === 5 && property.getArray().GetSize() === 0) {
      return;
    }
    for (let i = 0; i < 4; i = i + 1 | 0) {
      let relative = 0;
      let absolute = 0;
      switch (i) {
        case 0:
          absolute = 8 /*leftMargin*/;
          relative = 12 /*relLeftMargin*/;
          break;
        case 1:
          absolute = 9 /*topMargin*/;
          relative = 14 /*relTopMargin*/;
          break;
        case 2:
          absolute = 10 /*rightMargin*/;
          relative = 13 /*relRightMargin*/;
          break;
        case 3:
          absolute = 11 /*bottomMargin*/;
          relative = 15 /*relBottomMargin*/;
          break;
        default:
          0;
      }
      if (property.GetType() === 5) {
        let array = property.getArray();
        let realIndex = i % array.GetSize();
        this.SetPositionStringProperties(array.GetItem(realIndex), relative, absolute, tag);
      } else {
        this.SetPositionStringProperties(property, relative, absolute, tag);
      }
    }
  }

  MarginsToC4Value() {
    let array = new $.C4ValueArray();
    array.SetSize(4);
    array.SetItem(0, this.PositionToC4Value(12 /*relLeftMargin*/, 8 /*leftMargin*/));
    array.SetItem(1, this.PositionToC4Value(14 /*relTopMargin*/, 9 /*topMargin*/));
    array.SetItem(2, this.PositionToC4Value(13 /*relRightMargin*/, 10 /*rightMargin*/));
    array.SetItem(3, this.PositionToC4Value(15 /*relBottomMargin*/, 11 /*bottomMargin*/));
    return new $.C4Value().init$pC4ValueArray(array);
  }

  GenerateMenuID() {
    return (this.id = this.id + 1 | 0);
  }

  GenerateActionID() {
    return (this.id = this.id + 1 | 0);
  }

  EnableScrollBar(enable = true, childrenHeight = 0) {
    let $t1;
    const style = this.props[26 /*style*/].GetInt();
    if ((style & 64) !== 0) {
      let height = Math.fround(Math.fround(Math.fround(this.rcBounds.Hgt) - C4ScriptGuiWindow.Em2Pix(this.props[9 /*topMargin*/].GetFloat())) - C4ScriptGuiWindow.Em2Pix(this.props[11 /*bottomMargin*/].GetFloat()));
      let adjustment = Math.fround(childrenHeight - height);
      ($t1 = P(this.props[3 /*bottom*/].current, "f"), $t1.a[$t1.o] = Math.fround($t1.a[$t1.o] + C4ScriptGuiWindow.Pix2Em(adjustment)));
      0;
      this.rcBounds.Hgt = ftoi32(Math.fround(Math.fround(this.rcBounds.Hgt) + adjustment));
      if (adjustment !== 0) {
        this.RequestLayoutUpdate();
      }
      return;
    }
    if ((style & 512) !== 0) {
      return;
    }
    $.ScrollWindow.prototype.SetScrollBarEnabled.call(this, enable, true);
  }

  SetTag(tag) {
    let $t1, $t2, $t3;
    for (let i = 0; i < 30; i = i + 1 >>> 0) {
      if (this.props[i].SwitchTag(tag)) {
        if (i <= 7 || i === 21 || i === 26 || i === 27) {
          this.RequestLayoutUpdate();
        }
      }
    }
    $t1 = this;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    for (; $t2.op_ne($t3); $t2.op_inc$v()) {
      const element = $t2.op_mul();
      element.SetTag(tag);
    }
  }

  init() {
    super.init(this);
    this.wasRemovedFromParent = false;
    this.wasClosed = false;
    this.lockRemovalForClosingCallbackCounter = 0;
    this.props = $oarr(30, () => new C4ScriptGuiWindowProperty().init());
    this.childrenIDMap = new StdMultiMap();
    this.$dyn = C4ScriptGuiWindow;
    C4ScriptGuiWindow.prototype.Init$v.call(this);
    return this;
  }

  $dtor() {
    C4ScriptGuiWindow.prototype.ClearChildren$b.call(this, false);
    for (const prop of this.props) {
      prop.CleanUpAll();
    }
    if (this.pScrollBar != null) {
      $delete(this.pScrollBar);
    }
    if (this.name != null) {
      this.name.DecRef();
    }
    super.$dtor();
  }

  GetID$v() {
    return this.id;
  }

  GetChildByID(childID) {
    let $t1, $t2, $t3;
    $t1 = this;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    for (; $t2.op_ne($t3); $t2.op_inc$v()) {
      const element = $t2.op_mul();
      let child = element;
      if (child.id !== childID) {
        continue;
      }
      return child;
    }
    return null;
  }

  GetChildByName(childName) {
    let $t1, $t2, $t3;
    if (childName == null) {
      return null;
    }
    $t1 = this;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    for (; $t2.op_ne($t3); $t2.op_inc$v()) {
      const element = $t2.op_mul();
      let child = element;
      if (child.name !== childName) {
        continue;
      }
      return child;
    }
    return null;
  }

  GetSubWindow(childID, childTarget) {
    let range = new StdPair(null, null);
    range.$assign(this.childrenIDMap.equal_range(childID));
    for (let iter = $itcopy(range.first); !iter.eq(range.second); iter.inc()) {
      let subwindow = iter.v.second;
      if (subwindow.GetTarget() !== childTarget) {
        continue;
      }
      return subwindow;
    }
    return null;
  }

  CreateFromPropList(proplist, resetStdTag = false, isUpdate = false, isLoading = false) {
    if (proplist == null) {
      return false;
    }
    let parent = this.GetParent();
    0;
    let layoutUpdateRequired = false;
    let properties = proplist.GetProperties();
    properties.SortStrings();
    let stdTag = $oat($.Strings.P, 95 /*P_Std*/);
    let propertySize = properties.GetSize();
    for (let i = 0; i < propertySize; i = i + 1 | 0) {
      const entry = properties.GetItem(i);
      let key = entry.getStr();
      0;
      0;
      let property = new $.C4Value().init$v();
      proplist.GetPropertyByS(key, property);
      if ($oat($.Strings.P, 118 /*P_Left*/) === key) {
        this.SetPositionStringProperties(property, 4 /*relLeft*/, 0 /*left*/, stdTag);
        layoutUpdateRequired = true;
      } else if ($oat($.Strings.P, 119 /*P_Top*/) === key) {
        this.SetPositionStringProperties(property, 6 /*relTop*/, 1 /*top*/, stdTag);
        layoutUpdateRequired = true;
      } else if ($oat($.Strings.P, 120 /*P_Right*/) === key) {
        this.SetPositionStringProperties(property, 5 /*relRight*/, 2 /*right*/, stdTag);
        layoutUpdateRequired = true;
      } else if ($oat($.Strings.P, 121 /*P_Bottom*/) === key) {
        this.SetPositionStringProperties(property, 7 /*relBottom*/, 3 /*bottom*/, stdTag);
        layoutUpdateRequired = true;
      } else if ($oat($.Strings.P, 105 /*P_Margin*/) === key) {
        this.SetMarginProperties(property, stdTag);
        layoutUpdateRequired = true;
      } else if ($oat($.Strings.P, 91 /*P_BackgroundColor*/) === key) {
        this.props[16 /*backgroundColor*/].Set(property, stdTag);
      } else if ($oat($.Strings.P, 94 /*P_Target*/) === key) {
        this.target = property.getObj();
      } else if ($oat($.Strings.P, 93 /*P_Symbol*/) === key) {
        this.props[19 /*symbolDef*/].Set(property, stdTag);
        this.props[18 /*symbolObject*/].Set(property, stdTag);
      } else if ($oat($.Strings.P, 92 /*P_Decoration*/) === key) {
        this.props[17 /*frameDecoration*/].Set(property, stdTag);
      } else if ($oat($.Strings.P, 96 /*P_Text*/) === key) {
        this.props[21 /*text*/].Set(property, stdTag);
        layoutUpdateRequired = true;
      } else if ($oat($.Strings.P, 97 /*P_GraphicsName*/) === key) {
        this.props[20 /*symbolGraphicsName*/].Set(property, stdTag);
      } else if ($oat($.Strings.P, 82 /*P_Tooltip*/) === key) {
        this.props[29 /*tooltip*/].Set(property, stdTag);
      } else if ($oat($.Strings.P, 0 /*P_Prototype*/) === key) {
        ;
      } else if ($oat($.Strings.P, 74 /*P_Mode*/) === key) {
        if (isLoading) {
          this.currentMouseState = property.getInt();
        }
      } else if ($oat($.Strings.P, 98 /*P_ID*/) === key) {
        if (parent != null && !this.isMainWindow) {
          if (this.id !== 0) {
            parent.ChildWithIDRemoved(this);
          }
          this.id = property.getInt();
          if (this.id !== 0) {
            parent.ChildGotID(this);
          }
        } else if (isLoading) {
          this.id = property.getInt();
        }
      } else if ($oat($.Strings.P, 99 /*P_OnClick*/) === key) {
        0;
        this.props[22 /*onClickAction*/].Set(property, stdTag);
      } else if ($oat($.Strings.P, 100 /*P_OnMouseIn*/) === key) {
        this.props[23 /*onMouseInAction*/].Set(property, stdTag);
      } else if ($oat($.Strings.P, 101 /*P_OnMouseOut*/) === key) {
        this.props[24 /*onMouseOutAction*/].Set(property, stdTag);
      } else if ($oat($.Strings.P, 102 /*P_OnClose*/) === key) {
        this.props[25 /*onCloseAction*/].Set(property, stdTag);
      } else if ($oat($.Strings.P, 103 /*P_Style*/) === key) {
        this.props[26 /*style*/].Set(property, stdTag);
        layoutUpdateRequired = true;
      } else if ($oat($.Strings.P, 2 /*P_Priority*/) === key) {
        this.props[27 /*priority*/].Set(property, stdTag);
        layoutUpdateRequired = true;
        if (parent != null) {
          parent.ChildChangedPriority(this);
        }
      } else if ($oat($.Strings.P, 104 /*P_Player*/) === key) {
        this.props[28 /*player*/].Set(property, stdTag);
      } else {
        let subwindow = property.getPropList();
        if (subwindow != null) {
          let childName = null;
          if ($rd(key.GetCStr(), 0) !== 95) {
            childName = key;
          }
          let child = this.GetChildByName(childName);
          let freshlyAdded = false;
          if (child == null) {
            child = new C4ScriptGuiWindow().init();
            if (childName != null) {
              child.name = childName;
              child.name.IncRef();
            }
            this.AddChild$pC4ScriptGuiWindow(child);
            freshlyAdded = true;
          }
          if (!child.CreateFromPropList(subwindow, (isUpdate ? 1 : 0) === 1, false, isLoading)) {
            if (freshlyAdded) {
              this.RemoveChild(child, false);
            }
          } else {
            layoutUpdateRequired = true;
          }
        }
      }
    }
    if (!isLoading && layoutUpdateRequired) {
      this.RequestLayoutUpdate();
    }
    if (resetStdTag || isLoading) {
      this.SetTag(stdTag);
    }
    return true;
  }

  ToC4Value() {
    let $t1, $t2, $t3;
    let proplist = $.C4PropList.New$pC4PropList();
    const toSave = new Int32Array([
  118, 119, 120, 121, 105, 91, 92, 93, 94, 96, 98, 99, 100, 101, 102, 103,
  74, 2, 104, 82,
]);
    for (const prop of toSave) {
      let val = new $.C4Value().init$v();
      switch (prop) {
        case 118:
        case 119:
        case 120:
        case 121:
          {
            if (prop === 118) {
              val.$assign(this.PositionToC4Value(4 /*relLeft*/, 0 /*left*/));
            }
            ;
            if (prop === 119) {
              val.$assign(this.PositionToC4Value(6 /*relTop*/, 1 /*top*/));
            }
            ;
            if (prop === 120) {
              val.$assign(this.PositionToC4Value(5 /*relRight*/, 2 /*right*/));
            }
            ;
            if (prop === 121) {
              val.$assign(this.PositionToC4Value(7 /*relBottom*/, 3 /*bottom*/));
            }
            ;
            break;
          }
        case 105:
          val.$assign(this.MarginsToC4Value());
          break;
        case 91:
          val.$assign(this.props[16 /*backgroundColor*/].ToC4Value());
          break;
        case 92:
          val.$assign(this.props[17 /*frameDecoration*/].ToC4Value());
          break;
        case 93:
          val.$assign(this.props[18 /*symbolObject*/].ToC4Value());
          if (val.op_eq(new $.C4Value().init$v())) {
            val.$assign(this.props[19 /*symbolDef*/].ToC4Value());
          }
          break;
        case 94:
          val.$assign(new $.C4Value().init$pC4Object(this.target));
          break;
        case 96:
          val.$assign(this.props[21 /*text*/].ToC4Value());
          break;
        case 97:
          val.$assign(this.props[20 /*symbolGraphicsName*/].ToC4Value());
          break;
        case 82:
          val.$assign(this.props[29 /*tooltip*/].ToC4Value());
          break;
        case 98:
          val.$assign(new $.C4Value().init$i32(this.id));
          break;
        case 99:
          val.$assign(this.props[22 /*onClickAction*/].ToC4Value());
          break;
        case 100:
          val.$assign(this.props[23 /*onMouseInAction*/].ToC4Value());
          break;
        case 101:
          val.$assign(this.props[24 /*onMouseOutAction*/].ToC4Value());
          break;
        case 102:
          val.$assign(this.props[25 /*onCloseAction*/].ToC4Value());
          break;
        case 103:
          val.$assign(this.props[26 /*style*/].ToC4Value());
          break;
        case 74:
          val.$assign(new $.C4Value().init$i32(this.currentMouseState));
          break;
        case 2:
          val.$assign(this.props[27 /*priority*/].ToC4Value());
          break;
        case 104:
          val.$assign(this.props[28 /*player*/].ToC4Value());
          break;
        default:
          0;
          break;
      }
      if (val.op_eq(new $.C4Value().init$v())) {
        continue;
      }
      proplist.SetProperty(prop, val);
    }
    let childIndex = 0;
    $t1 = this;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    for (; $t2.op_ne($t3); $t2.op_inc$v()) {
      const element = $t2.op_mul();
      let child = element;
      let val = child.ToC4Value();
      let childName = child.name;
      if (childName == null) {
        let childNameBuf = new $.StdStrBuf();
        childNameBuf.Format(S("_child_%03d"), (childIndex = childIndex + 1 | 0));
        childName = $.Strings.RegString$StdStrBuf(new $.StdStrBuf().init$rStdStrBuf$b(childNameBuf));
      }
      proplist.SetPropertyByS(childName, val);
    }
    return new $.C4Value().init$pC4PropList(proplist);
  }

  SetEnumeratedID(enumID) {
    this.id = enumID;
  }

  Denumerate(numbers) {
    let $t1, $t2, $t3;
    0;
    if (this.id === 0) {
      return;
    }
    let value = new $.C4Value().$copy(numbers.GetValue(this.id >>> 0));
    this.id = 0;
    this.CreateFromPropList(value.getPropList(), false, false, true);
    $t1 = this;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    for (; $t2.op_ne($t3); $t2.op_inc$v()) {
      const element = $t2.op_mul();
      let mainWindow = element;
      mainWindow.RequestLayoutUpdate();
    }
  }

  AddChild$pC4ScriptGuiWindow(child) {
    if (this.IsRoot()) {
      child.SetID(this.GenerateMenuID());
      child.isMainWindow = true;
      this.mainWindowNeedsLayoutUpdate = true;
    }
    this.ChildChangedPriority(child);
    return child;
  }

  AddChild$v() {
    return this.AddChild$pC4ScriptGuiWindow(new C4ScriptGuiWindow().init());
  }

  ClearChildren$b(close = true) {
    this.RemoveChild(null, close, true);
  }

  RemoveChild(child, close = true, all = false) {
    let $t1, $t2, $t3;
    if (this.isRemovalLockedForClosingCallback()) {
      $throw(new $.C4AulExecError().init(S("Trying to remove script GUI window (or window target) from within window closing callback.")));
    }
    if (!all && !this.IsRoot()) {
      this.RequestLayoutUpdate();
    }
    if (child != null) {
      child.wasRemovedFromParent = true;
      if (close) {
        child.Close$v();
      }
      if (child.GetID$v() !== 0) {
        this.ChildWithIDRemoved(child);
      }
      this.RemoveElement(child);
      0;
      $delete(child);
    } else if (close) {
      0;
      $t1 = this;
      $t2 = $t1.begin();
      $t3 = $t1.end();
      for (; $t2.op_ne($t3); $t2.op_inc$v()) {
        const element = $t2.op_mul();
        let child$2 = element;
        0;
        0;
        child$2.wasRemovedFromParent = true;
        child$2.Close$v();
        if (child$2.GetID$v() !== 0) {
          this.ChildWithIDRemoved(child$2);
        }
      }
    }
    if (all) {
      $.Container.prototype.ClearChildren$v.call(this);
    }
  }

  Close$v() {
    if (this.wasClosed) {
      return;
    }
    this.wasClosed = true;
    this.ClearChildren$b(true);
    let action = this.props[25 /*onCloseAction*/].GetAction();
    if (action != null && action.action === 2) {
      this.lockRemovalForClosingCallback();
      action.ExecuteCommand(action.id, this, -1);
      this.unlockRemovalForClosingCallback();
    }
    this.target = null;
    if (!this.wasRemovedFromParent) {
      0;
      this.GetParent().RemoveChild(this);
    }
  }

  ClearPointers(pObj) {
    if (this.wasRemovedFromParent) {
      return;
    }
    this.props[18 /*symbolObject*/].ClearPointers(pObj);
    this.props[22 /*onClickAction*/].ClearPointers(pObj);
    this.props[23 /*onMouseInAction*/].ClearPointers(pObj);
    this.props[24 /*onMouseOutAction*/].ClearPointers(pObj);
    this.props[25 /*onCloseAction*/].ClearPointers(pObj);
    for (let iter = this.begin(); iter.op_ne(this.end()); ) {
      let child = iter.op_mul();
      iter.op_inc$v();
      child.ClearPointers(pObj);
    }
    if (this.target === pObj) {
      0;
      this.Close$v();
    }
  }

  CalculateRelativeSize(parentWidthOrHeight, absoluteProperty, relativeProperty) {
    let widthOrHeight = Math.fround(C4ScriptGuiWindow.Em2Pix(this.props[absoluteProperty].GetFloat()) + Math.fround(parentWidthOrHeight * this.props[relativeProperty].GetFloat()));
    return widthOrHeight;
  }

  RequestLayoutUpdate() {
    if (!(this.GetParent() != null)) {
      this.mainWindowNeedsLayoutUpdate = true;
      return;
    }
    if (this.isMainWindow) {
      const style = this.props[26 /*style*/].GetInt();
      if (!((style & 128) !== 0)) {
        this.mainWindowNeedsLayoutUpdate = true;
        return;
      } else {
      }
    }
    this.GetParent().RequestLayoutUpdate();
  }

  UpdateLayout$rC4TargetFacet(cgo) {
    let $t1, $t2, $t3, $t4, $t5, $t6;
    0;
    let fullWidth = Math.fround(Math.fround(cgo.Wdt * cgo.Zoom) - cgo.X);
    let fullHeight = Math.fround(Math.fround(cgo.Hgt * cgo.Zoom) - cgo.Y);
    const targetWidthEm = C4ScriptGuiWindow.standardWidth;
    const targetHeightEm = C4ScriptGuiWindow.standardHeight;
    let minMarginPx = 50;
    let targetWidthPx = $min(C4ScriptGuiWindow.Em2Pix(targetWidthEm), Math.fround(fullWidth - Math.fround(2 * minMarginPx)));
    let targetHeightPx = $min(C4ScriptGuiWindow.Em2Pix(targetHeightEm), Math.fround(fullHeight - Math.fround(2 * minMarginPx)));
    let marginLeftRight = Math.fround(Math.fround(fullWidth - targetWidthPx) / 2);
    let marginTopBottom = Math.fround(Math.fround(fullHeight - targetHeightPx) / 2);
    const left = marginLeftRight;
    let right = -marginLeftRight;
    const top = marginTopBottom;
    let bottom = -marginTopBottom;
    let wdt = Math.fround(Math.fround(fullWidth - left) + right);
    let hgt = Math.fround(Math.fround(fullHeight - top) + bottom);
    let needUpdate = this.mainWindowNeedsLayoutUpdate || this.rcBounds.Wdt !== ftoi32(wdt) || this.rcBounds.Hgt !== ftoi32(hgt);
    if (needUpdate) {
      this.mainWindowNeedsLayoutUpdate = false;
      this.rcBounds.x = ftoi32(left);
      this.rcBounds.y = ftoi32(top);
      this.rcBounds.Wdt = ftoi32(wdt);
      this.rcBounds.Hgt = ftoi32(hgt);
      $t1 = this;
      $t2 = $t1.begin();
      $t3 = $t1.end();
      for (; $t2.op_ne($t3); $t2.op_inc$v()) {
        const element = $t2.op_mul();
        let child = element;
        const style = child.props[26 /*style*/].GetInt();
        if (!((style & 128) !== 0)) {
          continue;
        }
        child.UpdateLayout$rC4TargetFacet$f32$f32(cgo, fullWidth, fullHeight);
      }
      $t4 = this;
      $t5 = $t4.begin();
      $t6 = $t4.end();
      for (; $t5.op_ne($t6); $t5.op_inc$v()) {
        const element = $t5.op_mul();
        let child = element;
        const style = child.props[26 /*style*/].GetInt();
        if ((style & 128) !== 0) {
          continue;
        }
        child.UpdateLayout$rC4TargetFacet$f32$f32(cgo, wdt, hgt);
      }
      this.pScrollBar.SetVisibility(false);
    }
    return true;
  }

  UpdateLayout$rC4TargetFacet$f32$f32(cgo, parentWidth, parentHeight) {
    let $t1, $t2, $t3;
    const style = this.props[26 /*style*/].GetInt();
    const left = this.props[0 /*left*/].GetFloat();
    const right = this.props[2 /*right*/].GetFloat();
    const top = this.props[1 /*top*/].GetFloat();
    const bottom = this.props[3 /*bottom*/].GetFloat();
    const relLeft = this.props[4 /*relLeft*/].GetFloat();
    const relRight = this.props[5 /*relRight*/].GetFloat();
    const relTop = this.props[6 /*relTop*/].GetFloat();
    const relBottom = this.props[7 /*relBottom*/].GetFloat();
    const leftMargin = this.props[8 /*leftMargin*/].GetFloat();
    const rightMargin = this.props[10 /*rightMargin*/].GetFloat();
    const topMargin = this.props[9 /*topMargin*/].GetFloat();
    const bottomMargin = this.props[11 /*bottomMargin*/].GetFloat();
    const relLeftMargin = this.props[12 /*relLeftMargin*/].GetFloat();
    const relRightMargin = this.props[13 /*relRightMargin*/].GetFloat();
    const relTopMargin = this.props[14 /*relTopMargin*/].GetFloat();
    const relBottomMargin = this.props[15 /*relBottomMargin*/].GetFloat();
    let leftDrawX = Math.fround(Math.fround(Math.fround(relLeft * parentWidth) + C4ScriptGuiWindow.Em2Pix(left)) + Math.fround(C4ScriptGuiWindow.Em2Pix(leftMargin) + Math.fround(relLeftMargin * parentWidth)));
    let rightDrawX = Math.fround(Math.fround(Math.fround(relRight * parentWidth) + C4ScriptGuiWindow.Em2Pix(right)) - Math.fround(C4ScriptGuiWindow.Em2Pix(rightMargin) + Math.fround(relRightMargin * parentWidth)));
    let topDrawY = Math.fround(Math.fround(Math.fround(relTop * parentHeight) + C4ScriptGuiWindow.Em2Pix(top)) + Math.fround(C4ScriptGuiWindow.Em2Pix(topMargin) + Math.fround(relTopMargin * parentHeight)));
    let bottomDrawY = Math.fround(Math.fround(Math.fround(relBottom * parentHeight) + C4ScriptGuiWindow.Em2Pix(bottom)) - Math.fround(C4ScriptGuiWindow.Em2Pix(bottomMargin) + Math.fround(relBottomMargin * parentHeight)));
    let width = Math.fround(rightDrawX - leftDrawX);
    let height = Math.fround(bottomDrawY - topDrawY);
    this.rcBounds.x = ftoi32(leftDrawX);
    this.rcBounds.y = ftoi32(topDrawY);
    this.rcBounds.Wdt = ftoi32(width);
    this.rcBounds.Hgt = ftoi32(height);
    let strBuf = this.props[21 /*text*/].GetStrBuf();
    let minRequiredTextHeight = 0;
    if (strBuf != null && !((style & 512) !== 0)) {
      let sText = new $.StdStrBuf();
      let rawTextHeight = $.GraphicsResource.FontRegular.BreakMessage$pi8$i32$pStdStrBuf$b$f32(strBuf.getData(), this.rcBounds.Wdt, sText, true);
      if ((rawTextHeight - 1 | 0) > this.rcBounds.Hgt) {
        let actualTextHeight = $.GraphicsResource.FontRegular.BreakMessage$pi8$i32$pStdStrBuf$b$f32(strBuf.getData(), this.rcBounds.Wdt - this.pScrollBar.rcBounds.Wdt | 0, sText, true);
        minRequiredTextHeight = actualTextHeight;
      } else {
        minRequiredTextHeight = rawTextHeight;
      }
    }
    this.UpdateChildLayout(cgo, width, height);
    if ((style & 1) !== 0) {
      this.UpdateLayoutGrid();
    } else if ((style & 1024) !== 0) {
      this.UpdateLayoutTightGrid();
    } else if ((style & 2) !== 0) {
      this.UpdateLayoutVertical();
    }
    let topMostChild = 0;
    let bottomMostChild = minRequiredTextHeight;
    $t1 = this;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    for (; $t2.op_ne($t3); $t2.op_inc$v()) {
      const element = $t2.op_mul();
      let child = element;
      const childTop = child.rcBounds.y;
      let childBottom = childTop + child.rcBounds.Hgt | 0;
      if (childTop < topMostChild) {
        topMostChild = childTop;
      }
      if (childBottom > bottomMostChild) {
        bottomMostChild = childBottom;
      }
    }
    if ((style & 64) !== 0) {
      this.rcBounds.Hgt = bottomMostChild;
    }
    bottomMostChild = $max(bottomMostChild, this.rcBounds.Hgt);
    this.iClientHeight = (bottomMostChild - topMostChild | 0) - 1 | 0;
    $.ScrollWindow.prototype.Update$v.call(this);
    this.pScrollBar.rcBounds.Wdt = 16;
    this.pScrollBar.rcBounds.x = this.rcBounds.Wdt - this.pScrollBar.rcBounds.Wdt | 0;
    this.pScrollBar.rcBounds.y = 0;
    this.pScrollBar.rcBounds.Hgt = this.rcBounds.Hgt;
    this.pScrollBar.Update$v();
    if ((style & 512) !== 0 || !$.ScrollWindow.prototype.IsScrollingNecessary.call(this)) {
      this.pScrollBar.SetVisibility(false);
    }
    this.mainWindowNeedsLayoutUpdate = false;
    return true;
  }

  UpdateChildLayout(cgo, parentWidth, parentHeight) {
    let $t1, $t2, $t3;
    $t1 = this;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    for (; $t2.op_ne($t3); $t2.op_inc$v()) {
      const element = $t2.op_mul();
      let window = element;
      window.UpdateLayout$rC4TargetFacet$f32$f32(cgo, parentWidth, parentHeight);
    }
    return true;
  }

  UpdateLayoutGrid() {
    let $t1, $t2, $t3;
    const width = this.rcBounds.Wdt;
    const height = this.rcBounds.Hgt;
    let borderX = 0;
    let borderY = 0;
    let currentX = 0;
    let currentY = 0;
    let lowestChildRelY = 0;
    let maxChildHeight = 0;
    $t1 = this;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    for (; $t2.op_ne($t3); $t2.op_inc$v()) {
      const element = $t2.op_mul();
      let child = element;
      let childLeftMargin = child.CalculateRelativeSize(Math.fround(width), 8 /*leftMargin*/, 12 /*relLeftMargin*/);
      let childTopMargin = child.CalculateRelativeSize(Math.fround(height), 9 /*topMargin*/, 14 /*relTopMargin*/);
      let childRightMargin = child.CalculateRelativeSize(Math.fround(width), 10 /*rightMargin*/, 13 /*relRightMargin*/);
      let childBottomMargin = child.CalculateRelativeSize(Math.fround(height), 11 /*bottomMargin*/, 15 /*relBottomMargin*/);
      let childWdtF = Math.fround(Math.fround(Math.fround(child.rcBounds.Wdt) + childLeftMargin) + childRightMargin);
      let childHgtF = Math.fround(Math.fround(Math.fround(child.rcBounds.Hgt) + childTopMargin) + childBottomMargin);
      let doLineBreak = (() => {
  currentX = 0;
  currentY = currentY + (maxChildHeight + 0 | 0) | 0;
  maxChildHeight = 0;
});
      let childWdt = ftoi32(Math.fround(childWdtF + 0.5));
      let childHgt = ftoi32(Math.fround(childHgtF + 0.5));
      let fitsInRow = (width - currentX | 0) >= childWdt;
      if (!fitsInRow) {
        doLineBreak();
      }
      if (maxChildHeight === 0 || childHgt > maxChildHeight) {
        maxChildHeight = childHgt;
        lowestChildRelY = currentY + childHgt | 0;
      }
      child.rcBounds.x = currentX + ftoi32(childLeftMargin) | 0;
      child.rcBounds.y = currentY + ftoi32(childTopMargin) | 0;
      currentX = currentX + (childWdt + 0 | 0) | 0;
    }
    this.EnableScrollBar(lowestChildRelY > height, Math.fround(lowestChildRelY));
  }

  UpdateLayoutTightGrid() {
    let $t1, $t2, $t3, $t4;
    const width = this.rcBounds.Wdt;
    const height = this.rcBounds.Hgt;
    let borderX = 0;
    let borderY = 0;
    let lowestChildRelY = 0;
    let alreadyPlacedChildren = [];
    $t1 = this;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    for (; $t2.op_ne($t3); $t2.op_inc$v()) {
      const element = $t2.op_mul();
      let child = element;
      let childLeftMargin = child.CalculateRelativeSize(Math.fround(width), 8 /*leftMargin*/, 12 /*relLeftMargin*/);
      let childTopMargin = child.CalculateRelativeSize(Math.fround(height), 9 /*topMargin*/, 14 /*relTopMargin*/);
      let childRightMargin = child.CalculateRelativeSize(Math.fround(width), 10 /*rightMargin*/, 13 /*relRightMargin*/);
      let childBottomMargin = child.CalculateRelativeSize(Math.fround(height), 11 /*bottomMargin*/, 15 /*relBottomMargin*/);
      let childWdtF = Math.fround(Math.fround(Math.fround(child.rcBounds.Wdt) + childLeftMargin) + childRightMargin);
      let childHgtF = Math.fround(Math.fround(Math.fround(child.rcBounds.Hgt) + childTopMargin) + childBottomMargin);
      let childWdt = ftoi32(Math.fround(childWdtF + 0.5));
      let childHgt = ftoi32(Math.fround(childHgtF + 0.5));
      let currentX = 0;
      let currentY = 0;
      let hadOverlap = false;
      let overlapRepeats = 0;
      do {
        let overlapsWithOther = ((other) => {
  if ((currentX + childWdt | 0) <= other.rcBounds.x) {
    return false;
  }
  if ((currentY + childHgt | 0) <= other.rcBounds.y) {
    return false;
  }
  if (currentX >= other.rcBounds.GetRight()) {
    return false;
  }
  if (currentY >= other.rcBounds.GetBottom$v$c()) {
    return false;
  }
  return true;
});
        let currentMinY = 0;
        hadOverlap = false;
        $t4 = alreadyPlacedChildren;
        for (let $i3 = 0; $i3 < $t4.length; $i3++) {
          const other$2 = P($t4, $i3);
          if (other$2.a[other$2.o].rcBounds.GetBottom$v$c() > currentY && other$2.a[other$2.o].rcBounds.Hgt > 0) {
            if (currentMinY === 0 || other$2.a[other$2.o].rcBounds.GetBottom$v$c() < currentMinY) {
              currentMinY = other$2.a[other$2.o].rcBounds.GetBottom$v$c();
            }
          }
          if (overlapsWithOther(other$2.a[other$2.o])) {
            hadOverlap = true;
            currentX = other$2.a[other$2.o].rcBounds.GetRight();
            if ((currentX + childWdt | 0) > width) {
              currentX = 0;
              let forcedMinimalChange = $u64n(overlapRepeats) > alreadyPlacedChildren.length ? 1 : 0;
              currentY = $max(currentY + forcedMinimalChange | 0, currentMinY);
            }
          }
        }
        overlapRepeats = overlapRepeats + 1 | 0;
      } while (hadOverlap);
      alreadyPlacedChildren.push(child);
      lowestChildRelY = $max(lowestChildRelY, currentY + childHgt | 0);
      child.rcBounds.x = currentX + ftoi32(childLeftMargin) | 0;
      child.rcBounds.y = currentY + ftoi32(childTopMargin) | 0;
    }
    this.EnableScrollBar(lowestChildRelY > height, Math.fround(lowestChildRelY));
  }

  UpdateLayoutVertical() {
    let $t1, $t2, $t3;
    let borderY = 0;
    let currentY = 0;
    $t1 = this;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    for (; $t2.op_ne($t3); $t2.op_inc$v()) {
      const element = $t2.op_mul();
      let child = element;
      let childTopMargin = child.CalculateRelativeSize(Math.fround(this.rcBounds.Hgt), 9 /*topMargin*/, 14 /*relTopMargin*/);
      let childBottomMargin = child.CalculateRelativeSize(Math.fround(this.rcBounds.Hgt), 11 /*bottomMargin*/, 15 /*relBottomMargin*/);
      let childHgtF = Math.fround(Math.fround(Math.fround(child.rcBounds.Hgt) + childTopMargin) + childBottomMargin);
      let childHgt = ftoi32(Math.fround(childHgtF + 0.5));
      child.rcBounds.y = ftoi32(Math.fround(Math.fround(currentY) + childTopMargin));
      currentY = currentY + (childHgt + 0 | 0) | 0;
    }
    this.EnableScrollBar(currentY > this.rcBounds.Hgt, Math.fround(currentY));
  }

  Draw$rC4TargetFacet(_cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4ScriptGuiWindow && C4ScriptGuiWindow.prototype instanceof $c) return $c.prototype.Draw$rC4TargetFacet.apply(this, arguments); }
  }

  DrawAll(cgo, player) {
    0;
    if (!this.IsVisible()) {
      return false;
    }
    let oldTargetX = ftoi32(cgo.TargetX);
    let oldTargetY = ftoi32(cgo.TargetY);
    cgo.TargetX = Math.fround(cgo.TargetX + cgo.X);
    cgo.TargetY = Math.fround(cgo.TargetY + cgo.Y);
    this.UpdateLayout$rC4TargetFacet(cgo);
    this.DrawChildren(cgo, player, 1);
    this.DrawChildren(cgo, player, 0);
    cgo.TargetX = Math.fround(oldTargetX);
    cgo.TargetY = Math.fround(oldTargetY);
    return true;
  }

  Draw$rC4TargetFacet$i32$pC4Rect(cgo, player, currentClippingRect) {
    0;
    if (!this.IsVisibleTo(player)) {
      return false;
    }
    const style = this.props[26 /*style*/].GetInt();
    if (this.mainWindowNeedsLayoutUpdate) {
      0;
      0;
      0;
      let parent = this.GetParent();
      this.UpdateLayout$rC4TargetFacet$f32$f32(cgo, Math.fround(parent.rcBounds.Wdt), Math.fround(parent.rcBounds.Hgt));
      0;
    }
    let outDrawX = ftoi32(Math.fround(Math.fround(cgo.X + cgo.TargetX) + Math.fround(this.rcBounds.x)));
    let outDrawY = ftoi32(Math.fround(Math.fround(cgo.Y + cgo.TargetY) + Math.fround(this.rcBounds.y)));
    let outDrawWdt = this.rcBounds.Wdt;
    let outDrawHgt = this.rcBounds.Hgt;
    let outDrawRight = outDrawX + this.rcBounds.Wdt | 0;
    let outDrawBottom = outDrawY + this.rcBounds.Hgt | 0;
    let cgoOut = new $.C4Facet().init$pC4Surface$f32$f32$f32$f32(cgo.Surface, Math.fround(outDrawX), Math.fround(outDrawY), Math.fround(outDrawWdt), Math.fround(outDrawHgt));
    const backgroundColor = this.props[16 /*backgroundColor*/].GetInt();
    if (backgroundColor !== 0) {
      $.pDraw.DrawBoxDw(cgo.Surface, outDrawX, outDrawY, ftoi32(Math.fround(Math.fround(outDrawRight) - 1)), ftoi32(Math.fround(Math.fround(outDrawBottom) - 1)), backgroundColor >>> 0);
    }
    let frameDecoration = this.props[17 /*frameDecoration*/].GetFrameDecoration();
    if (frameDecoration != null) {
      let rect = new $.C4Rect().init$i32$i32$i32$i32(ftoi32(Math.fround(Math.fround(outDrawX - frameDecoration.iBorderLeft | 0) - cgo.TargetX)), ftoi32(Math.fround(Math.fround(outDrawY - frameDecoration.iBorderTop | 0) - cgo.TargetY)), (outDrawWdt + frameDecoration.iBorderRight | 0) + frameDecoration.iBorderLeft | 0, (outDrawHgt + frameDecoration.iBorderBottom | 0) + frameDecoration.iBorderTop | 0);
      frameDecoration.Draw(cgo, rect);
    }
    let symbolObject = this.props[18 /*symbolObject*/].GetObject();
    if (symbolObject != null) {
      symbolObject.DrawPicture(cgoOut, false, null);
    } else {
      let symbolDef = this.props[19 /*symbolDef*/].GetDef();
      let graphicsName = this.props[20 /*symbolGraphicsName*/].GetStrBuf();
      if (symbolDef != null) {
        symbolDef.Draw$rC4Facet$b$u32$pC4Object$i32$i32$pC4DrawTransform$pi8(cgoOut, false, 0, null, 0, 0, null, graphicsName != null ? graphicsName.getData() : null);
      }
    }
    let strBuf = this.props[21 /*text*/].GetStrBuf();
    if (strBuf != null) {
      let sText = new $.StdStrBuf();
      let alignment = 0;
      let scrollbarXOffset = this.pScrollBar.IsVisible() ? this.pScrollBar.rcBounds.Wdt : 0;
      let scrollbarScroll = this.pScrollBar.IsVisible() ? this.GetScrollY() : 0;
      let actualDrawingWidth = outDrawWdt - scrollbarXOffset | 0;
      let allowedTextWidth = actualDrawingWidth;
      if ((style & 512) !== 0) {
        allowedTextWidth = 0x7fffffff;
      }
      let textHgt = $.GraphicsResource.FontRegular.BreakMessage$pi8$i32$pStdStrBuf$b$f32(strBuf.getData(), allowedTextWidth, sText, true);
      let textYOffset = Math.fround(-scrollbarScroll | 0);
      let textXOffset = 0;
      if ((style & 4) !== 0) {
        textYOffset = Math.fround(Math.fround(Math.fround(outDrawHgt) / 2) - Math.fround(Math.fround(textHgt) / 2));
      } else if ((style & 32) !== 0) {
        textYOffset = Math.fround(Math.fround(outDrawHgt) - Math.fround(textHgt));
      }
      if ((style & 8) !== 0) {
        const wdt = [0];
        const hgt = [0];
        $.GraphicsResource.FontRegular.GetTextExtent(sText.getData(), P(wdt, 0), P(hgt, 0), true);
        textXOffset = Math.fround(Math.fround(actualDrawingWidth) / 2);
        alignment = 1;
      } else if ((style & 16) !== 0) {
        alignment = 2;
        const wdt = [0];
        const hgt = [0];
        $.GraphicsResource.FontRegular.GetTextExtent(sText.getData(), P(wdt, 0), P(hgt, 0), true);
        textXOffset = Math.fround(actualDrawingWidth);
      }
      $.pDraw.TextOut(sText.getData(), $.GraphicsResource.FontRegular, Math.fround(1), cgo.Surface, Math.fround(Math.fround(outDrawX) + textXOffset), Math.fround(Math.fround(outDrawY) + textYOffset), 0xffffffff, alignment & 0xff);
    }
    if ($.GraphicsSystem.ShowMenuInfo) {
      let frameColor = 0xff649664;
      if ((this.currentMouseState & 1) !== 0) {
        frameColor = 0xff00ff00;
      }
      $.pDraw.DrawFrameDw(cgo.Surface, outDrawX, outDrawY, outDrawRight, outDrawBottom, frameColor);
      if (this.target != null || this.id !== 0) {
        let buf = $.FormatString(S("%s(%d)"), this.target != null ? this.target.GetName() : S(""), this.id);
        $.pDraw.TextOut(buf.getData(), $.GraphicsResource.FontCaption, Math.fround(1), cgo.Surface, Math.fround(cgo.X + Math.fround(outDrawRight)), Math.fround(Math.fround(cgo.Y + Math.fround(outDrawBottom)) - Math.fround($.GraphicsResource.FontCaption.GetLineHeight())), 0xffff00ff, 2);
      }
    }
    this.DrawChildren(cgo, player, -1, currentClippingRect);
    return true;
  }

  GetClippingRect(left, top, right, bottom) {
    const style = this.props[26 /*style*/].GetInt();
    if (this.IsRoot() || (style & 512) !== 0) {
      return false;
    }
    left.a[left.o] = this.rcBounds.x;
    top.a[top.o] = this.rcBounds.y;
    right.a[right.o] = this.rcBounds.Wdt + left.a[left.o] | 0;
    bottom.a[bottom.o] = this.rcBounds.Hgt + top.a[top.o] | 0;
    return true;
  }

  DrawChildren(cgo, player, withMultipleFlag = -1, currentClippingRect = null) {
    let $t1, $t2, $t3;
    let oldTargetX = cgo.TargetX;
    let oldTargetY = cgo.TargetY;
    let myClippingRect = new $.C4Rect();
    if (this.IsRoot()) {
      cgo.TargetX = Math.fround(0);
      cgo.TargetY = Math.fround(0);
      $.pDraw.StorePrimaryClipper();
      myClippingRect.$assign(new $.C4Rect().init$i32$i32$i32$i32(0, 0, ftoi32(Math.fround(cgo.Wdt * cgo.Zoom)), ftoi32(Math.fround(cgo.Hgt * cgo.Zoom))));
      currentClippingRect = myClippingRect;
    }
    const clipX1 = [0];
    const clipX2 = [0];
    const clipY1 = [0];
    const clipY2 = [0];
    let clipping = this.GetClippingRect(P(clipX1, 0), P(clipY1, 0), P(clipX2, 0), P(clipY2, 0));
    let targetClipX1 = ftoi32(Math.fround(Math.fround(cgo.X + cgo.TargetX) + Math.fround(clipX1[0])));
    let targetClipY1 = ftoi32(Math.fround(Math.fround(cgo.Y + cgo.TargetY) + Math.fround(clipY1[0])));
    let targetClipX2 = ftoi32(Math.fround(Math.fround(cgo.X + cgo.TargetX) + Math.fround(clipX2[0])));
    let targetClipY2 = ftoi32(Math.fround(Math.fround(cgo.Y + cgo.TargetY) + Math.fround(clipY2[0])));
    if (clipping) {
      myClippingRect.$assign(new $.C4Rect().init$i32$i32$i32$i32($max(currentClippingRect.x, targetClipX1), $max(currentClippingRect.y, targetClipY1), $min(currentClippingRect.Wdt, targetClipX2), $min(currentClippingRect.Hgt, targetClipY2)));
      currentClippingRect = myClippingRect;
    }
    if (withMultipleFlag !== 1) {
      cgo.TargetX = Math.fround(cgo.TargetX + Math.fround(this.rcBounds.x));
      cgo.TargetY = Math.fround(cgo.TargetY + Math.fround(this.rcBounds.y - this.iScrollY | 0));
    } else {
      0;
      0;
    }
    let oneDrawn = false;
    $t1 = this;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    for (; $t2.op_ne($t3); $t2.op_inc$v()) {
      const element = $t2.op_mul();
      let child = element;
      if (withMultipleFlag !== -1) {
        const style = child.props[26 /*style*/].GetInt();
        if (withMultipleFlag === 0 && (style & 128) !== 0) {
          continue;
        }
        if (withMultipleFlag === 1 && !((style & 128) !== 0)) {
          continue;
        }
      }
      $.pDraw.SetPrimaryClipper(currentClippingRect.x, currentClippingRect.y, currentClippingRect.Wdt, currentClippingRect.Hgt);
      if (child.Draw$rC4TargetFacet$i32$pC4Rect(cgo, player, currentClippingRect)) {
        oneDrawn = true;
      }
      if (oneDrawn && withMultipleFlag === 0) {
        break;
      }
    }
    cgo.TargetY = Math.fround(cgo.TargetY + Math.fround(this.iScrollY));
    cgo.TargetX = Math.fround(cgo.TargetX + cgo.X);
    cgo.TargetY = Math.fround(cgo.TargetY + cgo.Y);
    if (this.pScrollBar.IsVisible()) {
      this.pScrollBar.DrawElement(cgo);
    }
    if (this.IsRoot()) {
      $.pDraw.RestorePrimaryClipper();
    }
    cgo.TargetX = oldTargetX;
    cgo.TargetY = oldTargetY;
    return oneDrawn;
  }

  ExecuteCommand(actionID, player, subwindowID, actionType, target) {
    let $t1, $t2, $t3;
    if (this.isMainWindow && subwindowID !== 0) {
      0;
      0;
      0;
      0;
      let range = new StdPair(null, null);
      range.$assign(this.childrenIDMap.equal_range(subwindowID));
      for (let iter = $itcopy(range.first); !iter.eq(range.second); iter.inc()) {
        if (iter.v.second.ExecuteCommand(actionID, player, subwindowID, actionType, target)) {
          0;
          return true;
        }
      }
      0;
    }
    if (this.id === subwindowID && this.target === target) {
      0;
      0;
      0;
      let allActions = this.props[actionType].GetAllActions();
      for (const action of allActions) {
        0;
        if (action.ExecuteCommand(actionID, this, player)) {
          0;
          return true;
        }
      }
    }
    if (this.isMainWindow && subwindowID !== 0) {
      0;
      return false;
    }
    $t1 = this;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    for (; $t2.op_ne($t3); $t2.op_inc$v()) {
      const element = $t2.op_mul();
      let child = element;
      if (child.ExecuteCommand(actionID, player, subwindowID, actionType, target)) {
        0;
        return true;
      }
    }
    return false;
  }

  MouseInput$i32$i32$i32$u32(button, mouseX, mouseY, dwKeyParam) {
    0;
    const player = $.MouseControl.GetPlayer();
    0;
    let oneActionAlreadyExecuted = false;
    for (let withMultipleFlag = 0; withMultipleFlag <= 1; withMultipleFlag = withMultipleFlag + 1 | 0) {
      for (let iter = this.rbegin(); iter.op_ne(this.rend()); iter.op_inc$v()) {
        let child = iter.op_mul();
        const style = child.props[26 /*style*/].GetInt();
        if (withMultipleFlag === 0 && (style & 128) !== 0) {
          continue;
        }
        if (withMultipleFlag === 1 && !((style & 128) !== 0)) {
          continue;
        }
        if (!child.IsVisibleTo(player)) {
          continue;
        }
        let adjustedMouseX = 0;
        let adjustedMouseY = mouseY;
        let offsetX = 0;
        let offsetY = 0;
        if (withMultipleFlag === 0) {
          offsetX = -this.rcBounds.x | 0;
          offsetY = -this.rcBounds.y | 0;
        }
        adjustedMouseX = mouseX + offsetX | 0;
        adjustedMouseY = mouseY + offsetY | 0;
        let childLeft = child.rcBounds.x;
        let childRight = child.rcBounds.x + child.rcBounds.Wdt | 0;
        let childTop = child.rcBounds.y;
        let childBottom = child.rcBounds.y + child.rcBounds.Hgt | 0;
        let inArea = true;
        if (adjustedMouseX < childLeft || adjustedMouseX > childRight) {
          inArea = false;
        } else if (adjustedMouseY < childTop || adjustedMouseY > childBottom) {
          inArea = false;
        }
        if (!inArea) {
          if (child.HasMouseFocus()) {
            child.OnMouseOut(player);
          }
          continue;
        }
        if (oneActionAlreadyExecuted) {
          continue;
        }
        if (child.ProcessMouseInput(button, adjustedMouseX - childLeft | 0, (adjustedMouseY - childTop | 0) - this.iScrollY | 0, dwKeyParam, childLeft - offsetX | 0, (childTop + this.iScrollY | 0) - offsetY | 0)) {
          oneActionAlreadyExecuted = true;
        }
      }
    }
    return oneActionAlreadyExecuted;
  }

  ProcessMouseInput(button, mouseX, mouseY, dwKeyParam, parentOffsetX, parentOffsetY) {
    const player = $.MouseControl.GetPlayer();
    0;
    const style = this.props[26 /*style*/].GetInt();
    if ((style & 256) !== 0) {
      return false;
    }
    if (!this.HasMouseFocus()) {
      this.OnMouseIn(player, parentOffsetX, parentOffsetY);
    }
    if (button === 2) {
      if (!((this.currentMouseState & 2) !== 0)) {
        return false;
      }
    }
    let oneActionAlreadyExecuted = false;
    let scrollAdjustedMouseY = mouseY + this.iScrollY | 0;
    let overChild = false;
    for (let iter = this.rbegin(); iter.op_ne(this.rend()); iter.op_inc$v()) {
      let child = iter.op_mul();
      if (!child.IsVisibleTo(player)) {
        continue;
      }
      let childLeft = child.rcBounds.x;
      let childRight = child.rcBounds.x + child.rcBounds.Wdt | 0;
      let childTop = child.rcBounds.y;
      let childBottom = child.rcBounds.y + child.rcBounds.Hgt | 0;
      let inArea = true;
      if (mouseX <= childLeft || mouseX > childRight) {
        inArea = false;
      } else if (scrollAdjustedMouseY <= childTop || scrollAdjustedMouseY > childBottom) {
        inArea = false;
      }
      if (!inArea) {
        if (child.HasMouseFocus()) {
          child.OnMouseOut(player);
        }
        continue;
      }
      if (oneActionAlreadyExecuted) {
        continue;
      }
      overChild = true;
      if (child.ProcessMouseInput(button, mouseX - childLeft | 0, scrollAdjustedMouseY - childTop | 0, dwKeyParam, parentOffsetX + this.rcBounds.x | 0, (parentOffsetY + this.rcBounds.y | 0) - this.iScrollY | 0)) {
        oneActionAlreadyExecuted = true;
      }
    }
    if (oneActionAlreadyExecuted) {
      return true;
    }
    if (button === 1 || button === 5) {
      this.currentMouseState |= 2;
    }
    if (button === 2) {
      this.currentMouseState = this.currentMouseState & -3;
      let action = this.props[22 /*onClickAction*/].GetAction();
      if (action != null) {
        action.Execute(this, player, 22);
        return true;
      }
    }
    if (this.pScrollBar.IsVisible() && button === 7) {
      let delta = (dwKeyParam >>> 16) << 16 >> 16;
      this.ScrollBy(-delta | 0);
      return true;
    }
    if (this.pScrollBar.IsVisible()) {
      if (mouseX > this.pScrollBar.rcBounds.x && mouseX < (this.pScrollBar.rcBounds.x + this.pScrollBar.rcBounds.Wdt | 0) && (mouseY > this.pScrollBar.rcBounds.y && mouseY < (this.pScrollBar.rcBounds.y + this.pScrollBar.rcBounds.Hgt | 0))) {
        let mouse = new $.CMouse().init(mouseX, mouseY);
        if ($.MouseControl.IsLeftDown()) {
          mouse.LDown = true;
        }
        this.pScrollBar.MouseInput$rCMouse$i32$i32$i32$u32(mouse, button, mouseX - this.pScrollBar.rcBounds.x | 0, mouseY - this.pScrollBar.rcBounds.y | 0, dwKeyParam);
      }
    }
    if (this.isMainWindow) {
      return overChild;
    }
    return false;
  }

  MouseEnter(_0) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4ScriptGuiWindow && C4ScriptGuiWindow.prototype instanceof $c) return $c.prototype.MouseEnter.apply(this, arguments); }
    0;
  }

  MouseLeave(_0) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4ScriptGuiWindow && C4ScriptGuiWindow.prototype instanceof $c) return $c.prototype.MouseLeave.apply(this, arguments); }
    0;
  }

  OnMouseOut(player) {
    let $t1, $t2, $t3;
    0;
    this.currentMouseState = 0;
    $t1 = this;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    for (; $t2.op_ne($t3); $t2.op_inc$v()) {
      const iter = $t2.op_mul();
      let child = iter;
      if (child.HasMouseFocus()) {
        child.OnMouseOut(player);
      }
    }
    let actionType = 24;
    let action = this.props[actionType].GetAction();
    if (action == null) {
      return;
    }
    action.Execute(this, player, actionType);
  }

  OnMouseIn(player, parentOffsetX, parentOffsetY) {
    0;
    this.currentMouseState = 1;
    let strBuf = this.props[29 /*tooltip*/].GetStrBuf();
    if (strBuf != null) {
      let viewport = $.Viewports.GetViewport(player);
      if (viewport != null) {
        let guiZoom = viewport.GetGUIZoom();
        let x = ftoi32(Math.fround(Math.fround(parentOffsetX + this.rcBounds.x | 0) / guiZoom));
        let y = ftoi32(Math.fround(Math.fround(parentOffsetY + this.rcBounds.y | 0) / guiZoom));
        let wdt = ftoi32(Math.fround(Math.fround(this.rcBounds.Wdt) / guiZoom));
        let hgt = ftoi32(Math.fround(Math.fround(this.rcBounds.Hgt) / guiZoom));
        $.MouseControl.SetTooltipRectangle(new $.C4Rect().init$i32$i32$i32$i32(x, y, wdt, hgt));
        $.MouseControl.SetTooltipText(strBuf);
      }
    }
    let actionType = 23;
    let action = this.props[actionType].GetAction();
    if (action == null) {
      return;
    }
    action.Execute(this, player, actionType);
  }

  HasMouseFocus() {
    return (this.currentMouseState & 1) !== 0;
  }

  IsVisibleTo(player) {
    if (!this.IsVisible()) {
      return false;
    }
    const myPlayer = this.props[28 /*player*/].GetInt();
    if (myPlayer !== -2 && player !== myPlayer) {
      return false;
    }
    if (this.target != null && !this.target.IsVisible(player, false)) {
      return false;
    }
    return true;
  }

  static Em2Pix(em) {
    return Math.fround(Math.fround($.GraphicsResource.FontRegular.GetFontHeight()) * em);
  }

  static Pix2Em(pix) {
    return Math.fround(pix / Math.fround($max(1, $.GraphicsResource.FontRegular.GetFontHeight())));
  }

  $clone() { return new C4ScriptGuiWindow().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.id = o.id;
    this.name = o.name;
    this.isMainWindow = o.isMainWindow;
    this.mainWindowNeedsLayoutUpdate = o.mainWindowNeedsLayoutUpdate;
    this.wasRemovedFromParent = o.wasRemovedFromParent;
    this.wasClosed = o.wasClosed;
    this.lockRemovalForClosingCallbackCounter = o.lockRemovalForClosingCallbackCounter;
    this.target = o.target;
    this.props = $own(o.props.map(($e0) => $e0.$clone()));
    this.childrenIDMap = o.childrenIDMap.$clone();
    this.currentMouseState = o.currentMouseState;
    return this;
  }
}

export function $init(): void {
  C4ScriptGuiWindow.standardWidth = 50;
  C4ScriptGuiWindow.standardHeight = 31;
}

Object.assign($, { C4ScriptGuiWindow, C4ScriptGuiWindowAction, C4ScriptGuiWindowProperty, C4ScriptGuiWindowProperty$$anon1 });
