// @ts-nocheck
// OpenClonk 36de799: src/gui/C4StartupLegalDlg.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { C4StartupDlg } from './C4Startup.ts';
import { S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';

export class C4StartupLegalDlg extends C4StartupDlg {

  init() {
    super.init($.LoadResStr(S("IDS_DLG_DISPLAYLEGALNOTICE")));
    this.$dyn = C4StartupLegalDlg;
    this.UpdateSize();
    let rcClient = this.GetContainedClientRect();
    let caMain = new $.ComponentAligner().init(rcClient, 0, 0, true);
    let caButtons = new $.ComponentAligner().init(caMain.GetFromBottom$i32$i32(Math.imul(caMain.GetHeight(), 1) / 8 | 0), 0, 0, false);
    let btn = null;
    let iButtonWidth = caButtons.GetInnerWidth() / 4 | 0;
    $.Container.prototype.AddElement$pElement.call(this, btn = new $.CallbackButton$C4StartupLegalDlg$Button().init$pi8$rC4Rect$x$pC4StartupLegalDlg($.LoadResStr(S("IDS_BTN_BACK")), caButtons.GetGridCell(0, 3, 0, 1, iButtonWidth, 32, true), "OnBackBtn"));
    btn.SetToolTip($.LoadResStr(S("IDS_DLGTIP_BACKMAIN")));
    let rect = caMain.GetFromTop$i32$i32(caMain.GetHeight()).$clone();
    let textbox = new $.TextWindow().init(rect, 0, 0, 0, 100, 4096, S(""), true, null, 0, true);
    $.Container.prototype.AddElement$pElement.call(this, textbox);
    textbox.SetDecoration$b$b$pScrollBarFacets$b(false, false, null, true);
    for (const license of $.OCLicenses) {
      textbox.AddTextLine$pi8$pCStdFont$u32$b$b$pCStdFont(license.name.c_str(), $.GraphicsResource.TitleFont, 0xffff0000, false, true);
      textbox.AddTextLine$pi8$pCStdFont$u32$b$b$pCStdFont(license.content.c_str(), $.GraphicsResource.TextFont, 0xffffffff, false, true);
      textbox.AddTextLine$pi8$pCStdFont$u32$b$b$pCStdFont(S(" "), $.GraphicsResource.TitleFont, 0xffffffff, false, true);
    }
    textbox.UpdateHeight();
    return this;
  }

  $dtor() {
    super.$dtor();
  }

  OnEnter() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupLegalDlg && C4StartupLegalDlg.prototype instanceof $c) return $c.prototype.OnEnter.apply(this, arguments); }
    this.DoBack$v();
    return true;
  }

  OnEscape() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupLegalDlg && C4StartupLegalDlg.prototype instanceof $c) return $c.prototype.OnEscape.apply(this, arguments); }
    this.DoBack$v();
    return true;
  }

  DrawElement(_0) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupLegalDlg && C4StartupLegalDlg.prototype instanceof $c) return $c.prototype.DrawElement.apply(this, arguments); }
  }

  KeyBack() {
    this.DoBack$v();
    return true;
  }

  OnBackBtn(_0) {
    this.DoBack$v();
  }

  DoBack$v() {
    $.C4Startup.Get().SwitchDialog(5 /*SDID_About*/);
  }

  $clone() { return new C4StartupLegalDlg().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4StartupLegalDlg });
