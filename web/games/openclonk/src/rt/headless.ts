// @ts-nocheck
// OpenClonk headless: the presentation/network shells that C4Game still calls during init.
// Loading a scenario and ticking it does not need a window, a renderer or a network.
//
// Two kinds of pieces are here, and only the first may stay:
// 1. presentation, GUI, sound and network no-ops (message board, fonts, script GUI windows, mouse, network): not
//    part of the synchronized game state.
// 2. STAND-INS for parts of the synchronized simulation, from the earlier attempt; each makes the game differ from
//    the original and goes in milestone 1 (re/openclonk/NOTES.md) when the real module is translated:
//    C4TextureMap (landscape/C4Texture), the C4Fixed division by zero.
// C4Surface below is of the first kind: the simulation sees what the original's surfaces report (loaded or not,
// size, scale), but no pixels are decoded.
import { $ } from './registry.ts';
import { $cs, $oarr, $oat, $oidx, $str, P, S } from './ptr.ts';
import { StdMap, StdPair, StdSet, StdString } from './std.ts';
import { decodePng } from './png.ts';
import { c$strcasecmp, c$strncasecmp } from './libc.ts';
import { GuiWindow } from './scriptgui.ts';

/** the width and height of a PNG or JPEG image (BMP: from its header), or null */
function imageSize(d: Uint8Array): { w: number; h: number } | null {
  if (d.length >= 24 && d[0] === 0x89 && d[1] === 0x50) {
    const dv = new DataView(d.buffer, d.byteOffset, d.byteLength);
    return { w: dv.getUint32(16), h: dv.getUint32(20) };
  }
  if (d.length >= 4 && d[0] === 0xff && d[1] === 0xd8) {
    for (let o = 2; o + 4 <= d.length;) {
      if (d[o] !== 0xff) { o++; continue; }
      const m = d[o + 1];
      if (m === 0xd8 || m === 0x01 || (m >= 0xd0 && m <= 0xd7)) { o += 2; continue; }
      const len = (d[o + 2] << 8) | d[o + 3];
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc && o + 9 <= d.length) {
        return { h: (d[o + 5] << 8) | d[o + 6], w: (d[o + 7] << 8) | d[o + 8] };
      }
      o += 2 + len;
    }
  }
  if (d.length >= 26 && d[0] === 0x42 && d[1] === 0x4d) {
    const dv = new DataView(d.buffer, d.byteOffset, d.byteLength);
    return { w: dv.getInt32(18, true), h: Math.abs(dv.getInt32(22, true)) };
  }
  return null;
}

/** install the no-op presentation/network pieces after initGlobals() */
export function prepareHeadless(): void {
  const gs: any = $.GraphicsSystem;
  gs.pLoaderScreen ??= null;
  gs.MessageBoard ??= { LogNotify() {}, EnsureLastMessage() {}, Init() {} };
  gs.UpperBoard ??= { Init() {} };
  gs.InitLoaderScreen ??= () => true;
  gs.InvalidateBg ??= () => {};
  gs.FlashMessage ??= () => {};
  gs.FlashMessageOnOff ??= () => {};
  gs.DeactivateDebugOutput ??= () => {};

  ($ as any).GraphicsResource ??= {
    Init: () => true, Clear: () => {}, ClearFonts: () => {}, CloseFiles: () => {}, ReloadResolutionDependantFiles: () => {},
    FontRegular: { GetLineHeight: () => 10 }, FontTiny: { GetLineHeight: () => 8 },
  };

  ($ as any).GameScenarioParameterDefs$C4Game.RegisterScriptConstants ??= () => {
    const plist = new $.C4PropList();
    $.ScriptEngine.RegisterGlobalConstant(S('SCENPAR'), $.C4VPropList(plist));
  };
  ($ as any).GameScenarioParameterDefs$C4Game.Load ??= () => true;
  if (($ as any).Config?.Developer) ($ as any).Config.Developer.DebugShapeTextures ??= 0;
  if (($ as any).Config) ($ as any).Config.Save ??= () => {};

  // C4Fixed division by zero would trap (SIGFPE) in the original; the browser must not crash.
  // The original never reaches it in valid states, so 0 is a safe fallback.
  const fixed: any = ($ as any).C4Fixed?.prototype;
  if (fixed && fixed.op_divAssign$C4Fixed) {
    const div = fixed.op_divAssign$C4Fixed;
    fixed.op_divAssign$C4Fixed = function (v: any) {
      if (v == null || v.val === 0) { this.val = 0; return this; }
      return div.call(this, v);
    };
  }

  // network addresses (network/C4NetIO, not translated): C4PacketBase::pack's default argument is an empty address,
  // which a copy of a control packet (C4IDPacket's copy constructor: unpack(pack())) creates; it stays empty
  for (const n of ['C4NetIO$HostAddress', 'C4NetIO$EndpointAddress']) {
    const p = ($ as any)[n]?.prototype;
    if (p) p.Clear ??= function () {};
  }

  // network/C4NetIO's C4NetIOPacket (C4NetIO.cpp, not translated): a StdCopyBuf with an address. A copy of a control
  // packet goes through one (C4IDPacket's copy constructor: unpack(pack())), so the record's copy of the control
  const StdCopyBuf: any = ($ as any).StdCopyBuf;
  if (StdCopyBuf && !($ as any).C4NetIOPacket?.prototype?.init$StdBuf$addr_t) {
    ($ as any).C4NetIOPacket = class extends StdCopyBuf {
      addr: any = null;
      init$v() { return this; }
      init$StdBuf$addr_t(buf: any, addr: any) { super.init$StdBuf$b(buf, true); this.addr = addr; return this; }
      getStatus() { const d = this.getMData(); return this.getSize() && d ? (d.a[d.o] << 24) >> 24 : 0; }
      getPBuf() { return this.getSize() ? this.getPart(1, this.getSize() - 1) : this.getRef(); }
    };
  }

  const network: any = ($ as any).Network;
  if (network) {
    network.Execute$v ??= () => {};
    network.Clear$v ??= () => {};
    network.Start$v ??= () => true;
    // a record's network stream (C4GameControl::StopRecord): no network game here
    network.FinishStreaming ??= () => {};
  }

  // the script GUI's synchronized part (rt/scriptgui.ts) in place of the empty translated class
  ($ as any).C4ScriptGuiWindow = GuiWindow;
  const scriptGui: any = ($ as any).C4ScriptGuiWindow?.prototype;
  if (scriptGui) {
    scriptGui.ClearPointers ??= () => {};
    scriptGui.Clear ??= () => {};
    scriptGui.Execute ??= () => {};
    scriptGui.Draw ??= () => {};
  }

  // the GUI screen (gui/C4Gui.cpp's pGUI, always a valid screen in the original, also headless): no dialog is
  // exclusive, and a dialog it is to show (the scoreboard's, C4Scoreboard::DoDlgShow) cannot be shown here, so
  // ShowRemoveDlg deletes it, whose destructor (~C4ScoreboardDlg) clears the scoreboard's pointer to it
  ($ as any).pGUI ??= {
    IsExclusive: () => false,
    ShowRemoveDlg: (dlg: any) => {
      const board = ($ as any).Game?.Scoreboard;
      if (board && board.pDlg === dlg) board.pDlg = null;
      return false;
    },
  };
  // the game-over dialog is never shown headless (C4Scoreboard::DoDlgShow, C4GameControl::ChangeToLocal ask)
  if (($ as any).C4GameOverDlg) ($ as any).C4GameOverDlg.IsShown ??= () => false;

  const mouse: any = ($ as any).MouseControl;
  if (mouse) {
    mouse.DoMoveInput ??= () => {};
    mouse.Execute ??= () => {};
    mouse.Clear ??= () => {};
    mouse.ClearPointers ??= () => {};
    mouse.Default ??= () => {};
    mouse.Init ??= () => {};
    mouse.GetPlayer ??= () => null;
  }

  // C4Surface (graphics/C4Surface.cpp, C4SurfaceLoaders.cpp) is presentation: the headless simulation keeps no
  // pixels. What the simulation sees of a surface is the original's, though: whether loading succeeds, the size
  // (from the image's header), the scale of scaled images (Graphics.2.png) and the texture object that mesh
  // materials refer to. GetPixDw is never called by the simulation; it fails if it is.
  const sfc: any = ($ as any).C4Surface?.prototype;
  if (sfc) {
    Object.assign(sfc, { Wdt: 0, Hgt: 0, Scale: 1, texture: null, pMainSfc: null, pNormalSfc: null });
    sfc.Default = function () { this.Wdt = this.Hgt = 0; this.Scale = 1; this.texture = null; this.pMainSfc = this.pNormalSfc = null; };
    sfc.Clear = function () { this.texture = null; };
    sfc.Create = function (w: number, h: number) {
      this.Clear(); this.Default();
      if (!w || !h) return false;
      this.Wdt = w; this.Hgt = h;
      this.texture = { Wdt: w, Hgt: h };
      return true;
    };
    sfc.Read = function (hGroup: any, extension: any) {
      const ext = extension && extension.a ? $str(extension).toLowerCase() : String(extension ?? '').toLowerCase();
      if (ext !== 'png' && ext !== 'jpeg' && ext !== 'jpg' && ext !== 'bmp') return false;
      const n = hGroup.AccessedEntrySize();
      const data = new Uint8Array(n);
      hGroup.Read$px$u64(P(data, 0), n);
      const dim = imageSize(data);
      return !!dim && this.Create(dim.w, dim.h);
    };
    sfc.Load = function (hGroup: any, szFilename: any, _: any, _fNoErrIfNotFound: any) {
      // C4Surface::Load: a name with a scale (Graphics.2.png) is that scale; otherwise the largest scaled image there is
      let filename = $str(szFilename);
      let scaleToSet = 1;
      const base = filename.replace(/\.[^./\\]*$/, '');
      const dot = base.lastIndexOf('.');
      const scaleOf = (t: string) => { const m = /^\s*([+-]?\d+)/.exec(t); return m ? parseInt(m[1], 10) : null; };
      if (dot > -1 && scaleOf(base.slice(dot + 1)) !== null) {
        scaleToSet = scaleOf(base.slice(dot + 1))!;
      } else {
        const ext = filename.lastIndexOf('.') > -1 ? filename.slice(filename.lastIndexOf('.') + 1) : '';
        if (ext) {
          const wildcard = S(`${base}.*.${ext}`);
          const name = new Int8Array(4097);
          let max = -1;
          if (hGroup.FindEntry$pi8$pi8(wildcard, P(name, 0))) {
            do {
              const scaled = $str(P(name, 0));
              const scale = scaleOf(scaled.slice(base.length + 1));
              if (scale !== null && scale > max) { max = scale; scaleToSet = scale; filename = scaled; }
            } while (hGroup.FindNextEntry$pi8$pi8$pu64$b(wildcard, P(name, 0)));
          }
        }
      }
      if (!hGroup.AccessEntry(S(filename))) return false;
      const ok = this.Read(hGroup, S(filename.lastIndexOf('.') > -1 ? filename.slice(filename.lastIndexOf('.') + 1) : ''));
      this.Scale = scaleToSet;
      return ok;
    };
    sfc.CreateColorByOwner = function (by: any) {
      if (!by || !by.texture) return false;
      if (!this.Create(by.Wdt, by.Hgt)) return false;
      this.Scale = by.Scale;
      this.pMainSfc = by;
      return true;
    };
    sfc.SetAsClrByOwnerOf = function (of: any) {
      if (!of || this.Wdt !== of.Wdt || this.Hgt !== of.Hgt) return false;
      this.pMainSfc = of;
      return true;
    };
    sfc.SetClr = function (c: number) { this.ClrByOwnerClr = c >>> 0; };
    sfc.GetPixDw = () => { throw new Error('C4Surface::GetPixDw: the headless simulation has no pixels'); };
  }

  if (!($ as any).TextureMap) {
    // C4TextureMap (landscape/C4Texture.cpp) is a presentation/opaque module in the sim, but the
    // material-texture table is simulation data: the landscape is drawn from it (TexOZoom). This is
    // the original table with its Order list, plus the texture images it needs for material shapes.
    const maxTex = () => 255; // C4M_MaxTexIndex (config/C4Constants.h)
    const strOf = (p: any) => (p ? StdString.of(p).str() : '');
    const cstr = (a: Uint8Array, o = 0) => {
      let e = o;
      while (e < a.length && a[e] !== 0) e++;
      return new TextDecoder().decode(a.subarray(o, e));
    };
    const bufBytes = (buf: any) => {
      const p = buf.getMData();
      if (!p) return new Uint8Array(0);
      return new Uint8Array(p.a.buffer, p.a.byteOffset + p.o, buf.getSize());
    };
    class HeadlessTexture {
      Name = '';
      Wdt = 0;
      Hgt = 0;
      AvgColor = 0;
      materialShape = null;
      GetMaterialShape() { return this.materialShape; }
      SetMaterialShape(s: any) { this.materialShape = s; }
      GetAverageColor() { return this.AvgColor; }
      SetAverageColor(c: number) { this.AvgColor = c >>> 0; }
    }
    class HeadlessTexEntry {
      Material = '';
      Texture = '';
      iMaterialIndex = -1;
      GetMaterialIndex() {
        if (this.iMaterialIndex < 0) this.iMaterialIndex = $.MaterialMap.Get(S(this.Material));
        return this.iMaterialIndex;
      }
      GetMaterialName() { return S(this.Material); }
      GetTextureName() { return S(this.Texture); }
      GetMaterial() {
        const i = this.GetMaterialIndex();
        return i >= 0 && i < $.MaterialMap.Num ? $oidx($.MaterialMap.Map, i) : null;
      }
      GetPattern() { return { PatternClr: () => 0 }; }
      isNull() { return this.Material === ''; }
      Clear() { this.Material = ''; this.Texture = ''; this.iMaterialIndex = -1; }
    }
    class HeadlessTextureMap {
      Entry = new Array(maxTex()).fill(null);
      Order = [];
      Textures = [];
      fEntriesAdded = false;
      fInitialized = false;
      Clear() {
        this.Entry = new Array(maxTex()).fill(null);
        this.Order = [];
        this.Textures = [];
        this.fInitialized = false;
        this.fEntriesAdded = false;
      }
      Init() {
        let removed = 0;
        for (let i = 0; i < maxTex(); i++) {
          const e = this.Entry[i];
          if (!e || e.isNull()) continue;
          const mat = $.MaterialMap.Get(S(e.Material));
          e.iMaterialIndex = mat;
          const firstTex = e.Texture.split('-')[0];
          if (mat < 0 || mat >= $.MaterialMap.Num || !this.GetTexture$pi8(S(firstTex))) {
            e.Clear();
            removed++;
          }
        }
        this.fInitialized = true;
        return removed;
      }
      LoadTextures(hGroup: any, OverloadFile: any = null) {
        let num = 0;
        if (OverloadFile) num += this.LoadTextures(OverloadFile);
        const name = new Int8Array(257);
        const size = [0];
        hGroup.ResetSearch();
        while (hGroup.AccessNextEntry(S('*'), P(size, 0), P(name, 0))) {
          const filename = cstr(name);
          const leaf = filename.replace(/^.*[\\/]/, '');
          if (/_Shape\.png$/i.test(leaf)) continue;
          const texName = leaf.slice(0, leaf.indexOf('.') < 0 ? leaf.length : leaf.indexOf('.'));
          if (this.GetTexture$pi8(S(texName))) continue;
          const buf = new $.StdBuf();
          if (!hGroup.LoadEntry$pi8$pStdBuf(S(filename), buf)) continue;
          const dim = imageSize(bufBytes(buf));
          if (!dim || dim.w <= 0 || dim.h <= 0) continue;
          const tex = new HeadlessTexture();
          tex.Name = texName;
          tex.Wdt = dim.w;
          tex.Hgt = dim.h;
          this.Textures.push(tex);
          num++;
        }
        hGroup.ResetSearch();
        while (hGroup.AccessNextEntry(S('*_Shape.png'), P(size, 0), P(name, 0))) {
          const filename = cstr(name);
          const leaf = filename.replace(/^.*[\\/]/, '');
          const baseName = leaf.slice(0, leaf.length - '_Shape.png'.length);
          const base = this.GetTexture$pi8(S(baseName));
          if (!base) continue;
          const shape = new $.C4TextureShape();
          if (!shape.Load(hGroup, S(filename), base.Wdt / 4 | 0, base.Hgt / 4 | 0)) {
            $.LogF(S('Error loading texture shape %s.'), S(filename));
            continue;
          }
          base.SetMaterialShape(shape);
        }
        return num;
      }
      GetTexture$pi8(szTexture: any) {
        const name = strOf(szTexture);
        for (const t of this.Textures) if (t.Name.toLowerCase() === name.toLowerCase()) return t;
        return null;
      }
      GetTexture(i: number) {
        return this.Textures[i] ? S(this.Textures[i].Name) : null;
      }
      GetTexture$i32(i: number) { return this.GetTexture(i); }
      GetTextureIndex(name: string) {
        const n = name.toLowerCase();
        for (let i = 0; i < this.Textures.length; i++) if (this.Textures[i].Name.toLowerCase() === n) return i;
        return -1;
      }
      CheckTexture(name: string) { return this.GetTexture$pi8(S(name)) != null; }
      HasTextures(hGroup: any) {
        return !!(hGroup.EntryCount(S('*.png')) || hGroup.EntryCount(S('*.bmp')));
      }
      AddEntry(i: number, material: any, texture: any) {
        if (i <= 0 || i >= maxTex()) return false;
        const e = new HeadlessTexEntry();
        e.Material = strOf(material);
        e.Texture = strOf(texture);
        this.Entry[i] = e;
        if (this.fInitialized) {
          const mat = $.MaterialMap.Get(S(e.Material));
          e.iMaterialIndex = mat;
          if (mat < 0 || mat >= $.MaterialMap.Num || !this.GetTexture$pi8(S(e.Texture.split('-')[0]))) {
            e.Clear();
            return false;
          }
        }
        this.Order.push(i);
        return true;
      }
      LoadMap(hGroup: any, entryName: any, pOverMat: any, pOverTex: any) {
        const buf = new $.StdStrBuf();
        if (!hGroup.LoadEntryString$pi8$pStdStrBuf(entryName, buf)) {
          if (!hGroup.LoadEntryString$pi8$pStdStrBuf(S('TEXMAP.TXT'), buf)) return 0;
        }
        const text = StdString.of(buf.getData()).str();
        let count = 0;
        for (const line of text.split(/\r?\n/)) {
          if (line === 'OverloadMaterials') { if (pOverMat) pOverMat.a[pOverMat.o] = true; continue; }
          if (line === 'OverloadTextures') { if (pOverTex) pOverTex.a[pOverTex.o] = true; continue; }
          if (!line || line[0] === '#' || /^\s*$/.test(line)) continue;
          const m = /^\s*(\d+)(.*)$/.exec(line);
          if (!m) continue;
          const index = Number(m[1]);
          if (index >= maxTex()) continue;
          const value = m[2].slice(1);
          const sep = value.indexOf('-');
          if (sep < 0) continue;
          if (this.AddEntry(index, value.slice(0, sep), value.slice(sep + 1))) count++;
        }
        this.fEntriesAdded = false;
        return count;
      }
      GetEntry(i: number) {
        return i >= 0 && i < maxTex() ? (this.Entry[i] ?? null) : null;
      }
      /** C4TextureMap::DefaultBkgMatTex: a semisolid foreground becomes the tunnel texture, everything else stays */
      DefaultBkgMatTex(fg: number) {
        const tex = fg & 0xff;
        if (!tex) return fg;
        const e = this.GetEntry(tex);
        const mat = e && !e.isNull() ? e.GetMaterial() : null;
        if (!mat) return fg;
        if ($.DensitySemiSolid(mat.Density)) return $.Mat2PixColDefault($.MTunnel);
        return fg;
      }
      GetIndex(material: any, texture: any = null, fAddIfNotExist = true) {
        const mat = strOf(material).toLowerCase();
        const tex = texture == null ? null : strOf(texture).toLowerCase();
        for (let i = 1; i < maxTex(); i++) {
          const e = this.Entry[i];
          if (e && !e.isNull() && e.Material.toLowerCase() === mat && (tex == null || e.Texture.toLowerCase() === tex)) return i;
        }
        if (fAddIfNotExist) {
          for (let i = 1; i < maxTex(); i++) {
            if (!this.Entry[i] || this.Entry[i].isNull()) {
              if (this.AddEntry(i, S(strOf(material)), texture == null ? S('') : S(strOf(texture)))) {
                this.fEntriesAdded = true;
                return i;
              }
              return 0;
            }
          }
        }
        return 0;
      }
      GetIndexMatTex(materialTexture: any, defaultTexture: any = null, fAddIfNotExist = true) {
        const s = strOf(materialTexture);
        const sep = s.indexOf('-');
        const material = sep < 0 ? s : s.slice(0, sep);
        const texture = sep < 0 ? null : s.slice(sep + 1);
        let i = 0;
        if (texture != null && (i = this.GetIndex(S(material), S(texture), fAddIfNotExist))) return i;
        if (defaultTexture != null && (i = this.GetIndex(S(material), defaultTexture, fAddIfNotExist))) return i;
        const mat = $.MaterialMap.Get(S(material));
        return mat >= 0 && mat < $.MaterialMap.Num ? $oidx($.MaterialMap.Map, mat).DefaultMatTex : 0;
      }
      RemoveEntry(i: number) {
        if (i > 0 && i < maxTex()) {
          this.Entry[i] = null;
          this.Order = this.Order.filter((x: number) => x !== i);
        }
      }
      MoveIndex(oldIndex: number, newIndex: number) {
        if (newIndex === oldIndex) return;
        this.Entry[newIndex] = this.Entry[oldIndex];
        this.Entry[oldIndex] = null;
        const at = this.Order.indexOf(oldIndex);
        if (at >= 0) this.Order[at] = newIndex;
        this.fEntriesAdded = true;
      }
      StoreMapPalette() {}
      SaveMap() { return false; }
    }
    ($ as any).TextureMap = new HeadlessTextureMap();
    if (($ as any).C4TextureMap) ($ as any).C4TextureMap.LoadFlags = () => true;
  }

  ($ as any).ObjectListChangeListener ??= {
    OnObjectAdded() {}, OnObjectRemove() {}, OnObjectRename() {}, OnObjectContainerChanged() {},
  };

  // gui/C4GameMessage is a presentation module; the port keeps the messages for the page to draw (view.ts)
  interface PortMessage { text: string; color: number; time: number }
  const shown: PortMessage[] = (($ as any).GameMessages ??= [] as PortMessage[]);
  const pushMessage = (text: any, color = 0xffffff) => {
    let s = '';
    try { s = typeof text === 'string' ? text : text && text.getData ? $str(text.getData()) : $str(text); } catch { s = ''; }
    s = s.replace(/\$[0-9a-zA-Z]+/g, '').trim();
    if (!s) return false;
    shown.push({ text: s, color: color >>> 0, time: Date.now() });
    if (shown.length > 12) shown.shift();
    return true;
  };
  const messages: any = (($ as any).Messages ??= {});
  messages.Default ??= () => {};
  messages.Clear ??= () => { shown.length = 0; };
  messages.ClearPointers ??= () => {};
  messages.Execute ??= () => {};
  messages.UpdateDef ??= () => {};
  messages.Append ??= (_type: any, text: any, _obj: any, _plr: any, _x: any, _y: any, clr: any) => { pushMessage(text, (clr >>> 0) & 0xffffff); };
  messages.New ??= (_type: any, text: any) => pushMessage(text);
  messages.New$i32$StdStrBuf$pC4Object$i32$i32$i32$u32$C4ID$pC4PropList$u32$i32 ??= (_t: any, text: any, _o: any, _p: any, _x: any, _y: any, clr: any) => pushMessage(text, (clr >>> 0) & 0xffffff);
  // the engine's message helpers (gui/C4GameMessage.cpp) are script-visible: keep their text
  ($ as any).GameMsgObject ??= (text: any) => pushMessage(text);
  ($ as any).GameMsgObjectDw ??= (text: any, _obj: any, clr: any) => pushMessage(text, (clr >>> 0) & 0xffffff);
  ($ as any).GameMsgObjectPlayer ??= (text: any) => pushMessage(text);
  ($ as any).GameMsgObjectError ??= (text: any) => pushMessage(text, 0xff4040);

  // the sound system's modifier table: audio is not ported, the player still registers its modifiers
  {
    const app: any = ($ as any).Application;
    if (app) {
      app.SoundSystem ??= {};
      app.SoundSystem.Modifiers ??= {};
      const m: any = app.SoundSystem.Modifiers;
      m.SetGlobalModifier ??= (v: any) => { m.Global = v; };
      m.Get ??= () => null;
      m.Set ??= () => {};
      m.Remove ??= () => {};
      m.GetGlobalModifier ??= () => m.Global ?? 100;
      m.SetPlayerModifier ??= () => {};
      m.RemovePlayerModifier ??= () => {};
      m.Clear ??= () => {};
    }
  }

  // C4Menu/C4MainMenu are GUI shells, but a player owns one and the simulation calls this much of it
  for (const name of ['C4Menu', 'C4MainMenu']) {
    const menu: any = ($ as any)[name];
    if (!menu) continue;
    menu.prototype.ClearPointers ??= function () { return this; };
    menu.prototype.IsActive$v ??= function () { return false; };
    menu.prototype.GetIdentification ??= function () { return 0; };
    menu.prototype.TryClose ??= function () { return true; };
    menu.prototype.Close ??= function () { return true; };
    menu.prototype.Execute ??= function () {};
    menu.prototype.Execute$v ??= function () {};
    menu.prototype.Init ??= function () { return this; };
    menu.prototype.Clear ??= function () {};
    menu.prototype.Clear$v ??= function () {};
    menu.prototype.IsActive ??= function () { return false; };
    menu.prototype.Close$v ??= function () { return true; };
  }

  // the key-callback classes are opaque shells (their OnKeyEvent takes a C++ member function pointer); the
  // keyboard code refcounts and executes them, so they need that much of C4KeyboardCallbackInterface
  for (const name of ['C4KeyCB$C4Console', 'C4KeyCB$C4EditCursor', 'C4KeyCB$C4FullScreen', 'C4KeyCB$C4Game',
    'C4KeyCB$C4GraphicsSystem', 'C4KeyCB$C4MusicSystem', 'C4KeyCB$C4Network2', 'C4KeyCB$C4Scoreboard',
    'C4KeyCB$C4ToolsDlg', 'C4KeyCB$C4ViewportList', 'C4KeyCBEx$C4FullScreen$u8', 'C4KeyCBEx$C4GameControl$i32',
    'C4KeyCBEx$C4GraphicsSystem$b', 'C4KeyCBEx$C4MessageInput$b', 'C4KeyCBEx$C4ToolsDlg$i32',
    'C4KeyCBEx$C4ViewportList$C4Vec2D', 'C4KeyCBExPassKey$C4PlayerControl$C4KeyCodeEx']) {
    const cls: any = ($ as any)[name];
    if (!cls) continue;
    const proto: any = cls.prototype;
    proto.Ref ??= function () { return this; };
    proto.UnRef ??= function () { return this; };
    proto.Execute ??= function () { return false; };
    proto.GetTarget ??= function () { return null; };
    proto.IsOriginalKey ??= function () { return false; };
    proto.Deref ??= function () { return this; };
    proto.GetCallback ??= function () { return null; };
  }

  // C4ID's safe-bool operator (operator safe_bool_type) is translated to a function returning null on both
  // branches; the engine uses it as `if (id)` and `while (... != null)`, so a valid ID must be non-null
  {
    const id: any = ($ as any).C4ID;
    if (id) {
      id.prototype.op_unsigned_long_C4ID_ = function () { return this.v === id.None.v ? null : true; };
    }
  }

  // C4Player::HostilitySet derives from std::set<const C4Player*>; the translator emits the class without that
  // base (the template argument is a const pointer), so give it the set interface here.
  const hostility: any = ($ as any).C4Player$HostilitySet;
  if (hostility && !hostility.prototype.clear) {
    const sets = new WeakMap<object, StdSet>();
    const setOf = (o: object): StdSet => {
      let s = sets.get(o);
      if (!s) { s = new StdSet(); sets.set(o, s); }
      return s;
    };
    for (const m of ['clear', 'size', 'empty', 'count', 'find', 'insert', 'emplace', 'erase', 'begin', 'end',
                     'lower_bound', 'upper_bound', 'rbegin', 'rend'] as const) {
      (hostility.prototype as any)[m] = function (this: object, ...a: any[]) { return (setOf(this) as any)[m](...a); };
    }
  }

  // C4Group::Save (packing a directory into a group file) is not usable in the browser yet: MemScramble takes
  // a C4GroupHeader struct by cast pointer, which the translator passes as the object. A join packs the local
  // player's crew directory into a temporary group only for network clients and continues when that fails, so
  // report the failure instead of throwing.
  const packDirectoryTo = ($ as any).C4Group_PackDirectoryTo;
  if (packDirectoryTo) {
    ($ as any).C4Group_PackDirectoryTo = (...a: any[]) => {
      try { return packDirectoryTo(...a); } catch { return false; }
    };
  }

  // stricmp/strnicmp are the Windows spellings of strcasecmp/strncasecmp (C4KeyboardInput uses them)
  ($ as any).stricmp ??= c$strcasecmp;
  ($ as any).strnicmp ??= (a: any, b: any, n: any) => c$strncasecmp(a, b, n);

  // C4KeyCodeEx::KeyCode2String: the original asks SDL for a key's name (KeycodeToString); the port uses the
  // engine's own key code table instead (the one PlayerControls.txt is parsed with).
  const keyCode: any = ($ as any).C4KeyCodeEx;
  if (keyCode && !keyCode.KeyCode2String) {
    keyCode.KeyCode2String = (wCode: any, _human: any, fShort: any) => {
      const map = ($ as any).KeyCodeMap$C4KeyboardInput as any[] | null;
      if (map) {
        for (const e of map) {
          if (e.szName == null) break;
          if ((e.wCode >>> 0) === (wCode >>> 0)) {
            const name = fShort && e.szShortName != null ? $str(e.szShortName) : $str(e.szName);
            return new $.StdStrBuf().init$pi8$b(S(name), true);
          }
        }
      }
      return new $.StdStrBuf().init$pi8$b(S('\\x' + (wCode >>> 0).toString(16)), true);
    };
  }

  const application: any = ($ as any).Application;
  if (application) {
    application.SoundSystem ??= {};
    application.SoundSystem.ClearPointers ??= () => {};
    application.SoundSystem.Clear ??= () => {};
    application.SoundSystem.Execute ??= () => {};
  }
  for (const name of ['MessageInput', 'Console']) {
    const gui: any = (($ as any)[name] ??= {});
    gui.ClearPointers ??= () => {};
    gui.Clear ??= () => {};
    gui.Execute ??= () => {};
    gui.UpdateMenus ??= () => {};
    gui.Active ??= false;
    gui.Message ??= () => {};
    gui.Warn ??= () => {};
    gui.ShowMenu ??= () => {};
    gui.CloseMenu ??= () => {};
  }
  // C4MessageInput's message-board commands (gui/C4MessageInput.cpp AddCommand, GetCommand): the scripts register
  // them (AddMsgBoardCmd, the Parkour goal), and a C4ControlMsgBoardCmd runs one, so they are game state although
  // they live in a GUI class. The list as the original keeps it: newest first, the name cut to C4MaxName (30)
  // characters, the script to _MAX_FNAME + 30 (NAME_MAX 255).
  const input: any = ($ as any).MessageInput;
  if (!input.AddCommand) {
    input.pCommands = null;
    input.GetCommand = function (strName: any) {
      for (let cmd = this.pCommands; cmd; cmd = cmd.Next) if ($.SEqual(P(cmd.Name, 0), strName)) return cmd;
      return null;
    };
    input.AddCommand = function (strCommand: any, strScript: any) {
      if (this.GetCommand(strCommand)) return;
      const cmd = { Name: new Int8Array(31), Script: new Int8Array(256 + 30), Next: this.pCommands };
      $.SCopy$pi8$pi8$u64(strCommand, P(cmd.Name, 0), 30);
      $.SCopy$pi8$pi8$u64(strScript, P(cmd.Script, 0), 255 + 30);
      this.pCommands = cmd;
    };
  }

  ($ as any).GetSoundInstance ??= () => null;
  ($ as any).StopSoundEffect ??= () => {};
  ($ as any).StartSoundEffect ??= () => {};
  ($ as any).SoundSystem ??= { Execute() {}, Clear() {}, Play() {} };

  const viewports: any = (($ as any).Viewports ??= {});
  viewports.GetAudibility ??= () => 100;
  viewports.GetViewport ??= () => null;
  viewports.RecheckViewport ??= () => {};
  viewports.Clear ??= () => {};
  viewports.ClearPointers ??= () => {};
  viewports.Init ??= () => {};
  viewports.CreateViewport ??= () => null;
  viewports.CloseViewport ??= () => {};
  viewports.CloseViewport$i32$b ??= () => {};
  viewports.GetViewport ??= () => null;
  viewports.GetFirstViewport ??= () => null;
  viewports.SetPlayerAtViewport ??= () => {};
  viewports.RemovePlayer ??= () => {};
  viewports.RemoveViewport ??= () => {};
  viewports.GetViewportCount ??= () => 0;
  viewports.SetViewportPlayer ??= () => {};
  viewports.GetPlayerViewport ??= () => null;
  viewports.DrawAll ??= () => {};
  viewports.Execute ??= () => {};
  viewports.Draw ??= () => {};

  // the sky (gui/../landscape/C4Sky) is a presentation module: scenarios set its modulation and colours
  {
    const sky: any = ($ as any).C4Sky;
    if (sky) {
      const proto: any = sky.prototype;
      for (const n of ['SetModulation', 'SetBackColor', 'SetSkyAdjust', 'SetFog', 'SetPosition', 'SetParallax',
                       'Init', 'Clear', 'Execute', 'SetColor', 'SetBrightness', 'SetDef', 'Set']) {
        if (!(n in proto)) proto[n] = function () { return this; };
      }
    }
    // every landscape has a sky object; the port's is a shell that takes the setters
    const skyStub = () => ({
      SetModulation() { return this; }, SetBackColor() { return this; }, SetSkyAdjust() { return this; },
      SetFog() { return this; }, SetPosition() { return this; }, SetParallax() { return this; },
      SetColor() { return this; }, SetBrightness() { return this; }, SetDef() { return this; },
      Init() { return this; }, Clear() { return this; }, Execute() { return this; },
    });
    const landscape: any = ($ as any).C4Landscape;
    if (landscape && !landscape.prototype.GetSky) {
      landscape.prototype.GetSky = function (this: any) {
        if (!this.$sky) this.$sky = skyStub();
        return this.$sky;
      };
    }
  }

  if (($ as any).C4FullScreen) {
    const fs: any = ($ as any).C4FullScreen.prototype;
    fs.ViewportCheck = () => {};
    fs.CloseMenu = () => {};
    fs.ActivateMenuMain = () => {};
    fs.TogglePause = () => {};
  }

  if (($ as any).C4ValueArray) {
    const va: any = ($ as any).C4ValueArray.prototype;
    const origSort = va.Sort$rC4SortObject;
    va.Sort$rC4SortObject = function (rSort: any) {
      if (!rSort.PrepareCache(this)) return origSort.call(this, rSort);
      const n = this.iSize;
      const idx = Array.from({ length: n }, (_, i) => i);
      const cmp = new $.C4SortObjectSTLCache().init(rSort, this.pData);
      idx.sort((a: number, b: number) => cmp.op_call(a, b) ? -1 : cmp.op_call(b, a) ? 1 : 0);
      const objs = idx.map((i: number) => $oidx(this.pData, i)._getObj());
      for (let i = 0; i < n; i++) $oidx(this.pData, i).SetPropList(objs[i] ?? null);
    };
  }

  if (($ as any).C4Value) {
    const cv: any = ($ as any).C4Value.prototype;
    const origSetPropList = cv.SetPropList;
    cv.SetPropList = function (p: any) { return origSetPropList.call(this, p ?? null); };
  }

  if (($ as any).C4DefList) {
    const dl: any = ($ as any).C4DefList.prototype;
    const origBuild = dl.BuildTable;
    dl.BuildTable = function () {
      this.table.comp = (a: any, b: any) => a.op_lt(b);
      return origBuild.call(this);
    };
  }

  if (($ as any).C4Game) {
    const game: any = ($ as any).C4Game.prototype;
    const origLink = game.LinkScriptEngine;
    game.LinkScriptEngine = function () {
      // definitions loaded in several groups can leave the C4ID table stale; rebuild it
      // after all groups are loaded and before the append/include resolution
      $.Definitions.BuildTable();
      return origLink.call(this);
    };
  }

  if (($ as any).C4ID) {
    const id: any = ($ as any).C4ID;
    const lookup = new StdMap((a: any, b: any) => a.lt(b));
    for (let i = 0; i < id.names.length; i++) lookup.insertPair(new StdPair(id.names[i], i));
    id.lookup = lookup;
  }

  if (($ as any).C4Landscape) {
    const sky: any = {
      xdir: { $assign() {}, op_assign() { return this; } },
      ydir: { $assign() {}, op_assign() { return this; } },
      ScrollMode: 0, ParallaxMode: 0,
    };
    for (const n of ['SetModulation', 'SetBackColor', 'SetSkyAdjust', 'SetFog', 'SetPosition', 'SetParallax',
                     'SetColor', 'SetBrightness', 'SetDef', 'Init', 'Clear', 'Execute', 'Set']) {
      sky[n] = function () { return this; };
    }
    for (const n of ['GetModulation', 'GetBackColor', 'GetSkyAdjust', 'GetFog', 'GetPosition', 'GetParallax',
                     'GetColor', 'GetBrightness']) {
      sky[n] = function () { return 0; };
    }
    ($ as any).C4Landscape.prototype.GetSky = () => sky;
  }

  if (($ as any).C4ScriptGuiWindow) {
    const sgw: any = ($ as any).C4ScriptGuiWindow.prototype;
    sgw.Denumerate = () => {};
    sgw.Clear = () => {};
    sgw.Close = () => {};
  }

  if (($ as any).CPNGFile) {
    const png: any = ($ as any).CPNGFile.prototype;
    png.Load = function (pFile: any, iSize: number) {
      if (!pFile || !pFile.a) return false;
      const src = new Uint8Array(pFile.a.buffer, pFile.a.byteOffset + (pFile.o | 0), iSize);
      const img = decodePng(src);
      if (!img) return false;
      this.iWdt = img.width;
      this.iHgt = img.height;
      this.iRowSize = img.width * 4;
      this.pImageData = img.rgba;
      return true;
    };
    png.GetPix = function (x: number, y: number) {
      const d = this.pImageData;
      const o = ((y | 0) * (this.iWdt | 0) + (x | 0)) * 4;
      return ((d[o + 3] << 24) | (d[o] << 16) | (d[o + 1] << 8) | d[o + 2]) >>> 0;
    };
  }

  if (($ as any).C4FoW) {
    const fow: any = ($ as any).C4FoW.prototype;
    fow.Ambient = {
      Brightness: 0, Color: 0,
      CreateFromLandscape() {}, UpdateFromLandscape() {},
      SetBrightness(v: any) { this.Brightness = v; return this; }, GetBrightness() { return this.Brightness; },
      SetColor() { return this; }, GetColor() { return 0; }, SetFade() { return this; }, GetFade() { return 0; },
      Set() { return this; }, Default() { return this; }, Clear() { return this; },
    };
    fow.GetAmbient = function () { return this.Ambient; };
    fow.GetBrightness = () => 0;
    fow.SetMode = () => {};
    fow.GetMode = () => 0;
    fow.IsEnabled = () => false;
    fow.SetEnabled = () => {};
    fow.AddLight = () => null;
    fow.RemoveLight = () => {};
    fow.Execute = () => {};
    fow.Invalidate = () => {};
    fow.Add = () => {};
    fow.Remove = () => {};
    fow.Clear = () => {};
    fow.SetBrightness = () => {};
    fow.SetFogOfWar = () => {};
    fow.UpdateFoW = () => {};
  }

  ($ as any).pDraw ??= {
    NoPrimaryClipper() {}, SetPrimaryClipper() {}, Blit() {}, DrawBoxDw() {},
    SetColor() {}, DrawLine() {}, DrawCircle() {}, GetPrimaryClipper() { return null; },
  };

  const sfc8: any = ($ as any).CSurface8?.prototype;
  if (sfc8) {
    sfc8.Read = function (hGroup: any) {
      const size = hGroup.AccessedEntrySize();
      if (size < 54) return false;
      const data = new Uint8Array(size);
      if (!hGroup.Read$px$u64(P(data, 0), size)) return false;
      const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
      if (data[0] !== 0x42 || data[1] !== 0x4d) return false;
      const off = dv.getUint32(10, true);
      const w = dv.getInt32(18, true);
      const h0 = dv.getInt32(22, true);
      const h = Math.abs(h0), topDown = h0 < 0;
      const bpp = dv.getUint16(28, true);
      if (!this.Create(w, h)) return false;
      const rowSize = ((w * bpp + 31) >> 5) << 2;
      for (let y = 0; y < h; y++) {
        const src = off + (topDown ? y : h - 1 - y) * rowSize;
        for (let x = 0; x < w; x++) {
          let col;
          if (bpp === 8) col = data[src + x];
          else if (bpp === 24) {
            const s = src + x * 3;
            col = (data[s] & 0xff) | ((data[s + 1] & 0xff) << 8) | ((data[s + 2] & 0xff) << 16);
          } else return false;
          this.Bits.a[y * this.Pitch + x] = col & 0xff;
        }
      }
      if (bpp === 8 && this.pPal) {
        const pal = 14 + dv.getUint32(14, true);
        for (let i = 0; i < 256 && pal + i * 4 + 3 < data.length; i++) {
          const s = pal + i * 4;
          this.pPal.Colors[i] = 0xff000000 | ((data[s + 2] & 0xff) << 16) | ((data[s + 1] & 0xff) << 8) | (data[s] & 0xff);
        }
      }
      return true;
    };
  }

  const app: any = $.Application;
  app.FlushMessages ??= () => true;
  app.GetRevision ??= () => S('36de799');
  app.SoundSystem.LoadEffects ??= () => true;
  app.SoundSystem.LoadSounds ??= () => true;
  app.MusicSystem.LoadEffects ??= () => true;
  app.MusicSystem.FadeOut ??= () => {};
  app.MusicSystem.Play ??= () => {};
  app.MusicSystem.Load ??= () => true;
  app.MusicSystem.InitForScenario ??= () => {};
  app.MusicSystem.Stop ??= () => {};
  app.MusicSystem.UpdateVolume ??= () => {};
  app.MusicSystem.Play$pi8$b$i32$f64$b ??= () => {};
  app.MusicSystem.SetPlayList ??= () => 0;
  app.MusicSystem.SetMusic ??= () => 0;
  app.MusicSystem.GetPlayList ??= () => null;
  app.MusicSystem.IsPlaying ??= () => false;
  app.MusicSystem.ToggleOff ??= () => {};
  app.MusicSystem.ToggleOn ??= () => {};
  app.SoundSystem.InitForScenario ??= () => {};
  app.SystemGroup ??= new $.C4Group().init();
  app.OpenSystemGroup ??= () => {
    app.SystemGroup = new $.C4Group().init();
    return $.Reloc.Open(app.SystemGroup, S('System.ocg'));
  };
  app.CloseSystemGroup ??= () => app.SystemGroup.Close$v();
  ($ as any).Console.EnsureDefinitionListInitialized ??= () => {};
  ($ as any).Console.UpdateHaltCtrls ??= () => {};
  ($ as any).Console.InitGame ??= () => {};
  ($ as any).Console.Out ??= () => {};
  ($ as any).C4AulDebug.GetDebugger ??= () => null;

  const cfg: any = $.Config;
  cfg.GetRegistrationData ??= () => S('');
  cfg.General.Participants ??= $cs(S(''), 1025);
  cfg.Controls ??= {};
  cfg.Controls.GamepadGuiControl ??= 0;
  cfg.Controls.MouseAutoScroll ??= 0;
  cfg.Controls.UserSets ??= new $.C4PlayerControlAssignmentSets().init();
  cfg.Network ??= {};
  cfg.Network.Nick ??= new $.StdCopyStrBuf().init$pi8$b(S('Player'), true);
  cfg.Network.Comment ??= new $.StdCopyStrBuf().init$pi8$b(S(''), true);

  const net: any = $.Network;
  net.isEnabled ??= () => false;
  net.isHost ??= () => false;
  net.isLobbyActive ??= () => false;
  net.DoLobby ??= () => true;
  net.RetrieveScenario ??= () => false;
  net.FinalInit ??= () => true;
}

/** a C4Group for a path, opened through the in-memory file system */
export function openGroup(path: string): any {
  const g = new $.C4Group().init();
  if (!g.Open(S(path))) throw new Error(`cannot open group ${path}`);
  return g;
}

export { P };
