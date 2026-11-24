// @ts-nocheck
// OpenClonk 36de799: src/gui/C4StartupAboutDlg.cpp, src/gui/C4StartupAboutDlg.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { C4StartupDlg } from './C4Startup.ts';
import { $own, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $filled, $min, IStringStream, StdString } from '../../rt/std.ts';

export class PersonList {

  $clone() { return new PersonList().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class PersonList$Entry {
  name = null;
  nick = null;

  $clone() { return new PersonList$Entry().$assign(this); }
  $assign(o) {
    this.name = o.name;
    this.nick = o.nick;
    return this;
  }
}

export class DeveloperList extends PersonList {
  developers = [];

  init(l) {
    this.developers = $filled(l, () => new PersonList$Entry());
    return this;
  }

  WriteTo(textbox, font) {
    for (const p of this.developers) {
      textbox.AddTextLine$pi8$pCStdFont$u32$b$b$pCStdFont($.FormatString(S("%s <c f7f76f>(%s)</c>"), p.name, p.nick).getData(), font, 0xffffffff, false, true);
    }
  }

  ToString() {
    let out = new IStringStream('');
    for (const p of this.developers) {
      out.write(p.name).write(S(" (")).write(p.nick).write(S(")\n"));
    }
    return out.str();
  }

  $clone() { return new DeveloperList().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.developers = o.developers.slice();
    return this;
  }
}

export class ContributorList extends PersonList {
  static contributorsThisRelease;
  static contributors;
  static packageMaintainers;

  ConcatNames(names, with_color) {
    let opening_tag = with_color ? S("<c f7f76f>") : S("");
    let closing_tag = with_color ? S("</c>") : S("");
    let result = new IStringStream('');
    let first = true;
    for (const p of names) {
      if (!first) {
        result.write(S(", "));
      }
      first = false;
      if (p.nick != null) {
        result.write(p.name).write(S(" ")).write(opening_tag).write(S("(")).write(p.nick).write(S(")")).write(closing_tag);
      } else {
        result.write(p.name);
      }
    }
    return result.str();
  }

  WriteLines(f, with_color) {
    let opening_tag = with_color ? S("<c ff0000>") : S("");
    let closing_tag = with_color ? S("</c>") : S("");
    let text = new IStringStream('');
    text.write(opening_tag).write(S("Contributors for OpenClonk 8.0:")).write(closing_tag).write(S(" "));
    text.write(this.ConcatNames(ContributorList.contributorsThisRelease, with_color));
    f(text);
    text.write(opening_tag).write(S("Previous contributors:")).write(closing_tag).write(S(" "));
    text.write(this.ConcatNames(ContributorList.contributors, with_color));
    f(text);
    text.write(opening_tag).write(S("Also thanks to our Linux package maintainers")).write(closing_tag).write(S(" "));
    text.write(this.ConcatNames(ContributorList.packageMaintainers, with_color));
    text.write(S(", and more"));
    f(text);
    text.write(S("Finally, a big thanks to Matthes Bender and all those who contributed to previous Clonk titles for the passion they put into the game and for agreeing to make Clonk open source."));
    f(text);
    return text.str();
  }

  WriteLines$2(f, with_color) {
    let opening_tag = with_color ? S("<c ff0000>") : S("");
    let closing_tag = with_color ? S("</c>") : S("");
    let text = new IStringStream('');
    text.write(opening_tag).write(S("Contributors for OpenClonk 8.0:")).write(closing_tag).write(S(" "));
    text.write(this.ConcatNames(ContributorList.contributorsThisRelease, with_color));
    f(text);
    text.write(opening_tag).write(S("Previous contributors:")).write(closing_tag).write(S(" "));
    text.write(this.ConcatNames(ContributorList.contributors, with_color));
    f(text);
    text.write(opening_tag).write(S("Also thanks to our Linux package maintainers")).write(closing_tag).write(S(" "));
    text.write(this.ConcatNames(ContributorList.packageMaintainers, with_color));
    text.write(S(", and more"));
    f(text);
    text.write(S("Finally, a big thanks to Matthes Bender and all those who contributed to previous Clonk titles for the passion they put into the game and for agreeing to make Clonk open source."));
    f(text);
    return text.str();
  }

  WriteTo(textbox, font) {
    this.WriteLines(((text) => {
  textbox.AddTextLine$pi8$pCStdFont$u32$b$b$pCStdFont(text.str().c_str(), font, 0xffffffff, false, true);
  text.str(StdString.of(S("")));
}), true);
  }

  ToString() {
    return this.WriteLines$2(((text) => {
  text.write(S("\n"));
}), false);
  }

  $clone() { return new ContributorList().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class C4StartupAboutDlg extends C4StartupDlg {
  keySaveCredits = null;

  init() {
    super.init($.LoadResStr(S("IDS_DLG_ABOUT")));
    this.keySaveCredits = null;
    this.$dyn = C4StartupAboutDlg;
    this.UpdateSize();
    const rUseFont = $.GraphicsResource.TextFont;
    let rcClient = this.GetContainedClientRect();
    let caMain = new $.ComponentAligner().init(rcClient, 0, 0, true);
    let caButtons = new $.ComponentAligner().init(caMain.GetFromBottom$i32$i32(Math.imul(caMain.GetHeight(), 1) / 8 | 0), 0, 0, false);
    let btn = null;
    let iButtonWidth = caButtons.GetInnerWidth() / 4 | 0;
    $.Container.prototype.AddElement$pElement.call(this, btn = new $.CallbackButton$C4StartupAboutDlg$Button().init$pi8$rC4Rect$x$pC4StartupAboutDlg($.LoadResStr(S("IDS_BTN_BACK")), caButtons.GetGridCell(0, 3, 0, 1, iButtonWidth, 32, true), "OnBackBtn"));
    btn.SetToolTip($.LoadResStr(S("IDS_DLGTIP_BACKMAIN")));
    $.Container.prototype.AddElement$pElement.call(this, btn = new $.CallbackButton$C4StartupAboutDlg$Button().init$pi8$rC4Rect$x$pC4StartupAboutDlg($.LoadResStr(S("IDS_DLG_DISPLAYLEGALNOTICE")), caButtons.GetGridCell(1, 3, 0, 1, iButtonWidth, 32, true), "OnLegalBtn"));
    btn.SetToolTip($.LoadResStr(S("IDS_DLGTIP_DISPLAYLEGALNOTICE")));
    $.Container.prototype.AddElement$pElement.call(this, new $.Label().init$pi8$C4Rect$i32$u32$pCStdFont$b$b$b(S("'Clonk' is a registered trademark of Matthes Bender."), caButtons.GetFromBottom$i32$i32(rUseFont.GetLineHeight())));
    let caDevelopers = new $.ComponentAligner().init(caMain.GetFromTop$i32$i32(Math.imul(caMain.GetHeight(), 1) / 2 | 0), 0, 0, false);
    let caContributors = new $.ComponentAligner().init(caMain.GetFromTop$i32$i32(caMain.GetHeight()), 0, 0, false);
    C4StartupAboutDlg.prototype.DrawPersonList.call(this, 0, $.engineAndTools$C4StartupAboutDlg, caDevelopers.GetFromLeft$i32$i32(Math.imul(caMain.GetWidth(), 1) / 3 | 0));
    let caDevelopersCol2 = new $.ComponentAligner().init(caDevelopers.GetFromLeft$i32$i32(Math.imul(caMain.GetWidth(), 1) / 3 | 0), 0, 0, false);
    C4StartupAboutDlg.prototype.DrawPersonList.call(this, 1, $.scriptingAndContent$C4StartupAboutDlg, caDevelopersCol2.GetFromTop$i32$i32(Math.imul(caDevelopers.GetHeight(), 2) / 3 | 0));
    C4StartupAboutDlg.prototype.DrawPersonList.call(this, 2, $.administration$C4StartupAboutDlg, caDevelopersCol2.GetFromTop$i32$i32(Math.imul(caDevelopers.GetHeight(), 1) / 3 | 0));
    let caDevelopersCol3 = new $.ComponentAligner().init(caDevelopers.GetFromLeft$i32$i32(Math.imul(caMain.GetWidth(), 1) / 3 | 0), 0, 0, false);
    C4StartupAboutDlg.prototype.DrawPersonList.call(this, 3, $.artAndContent$C4StartupAboutDlg, caDevelopersCol3.GetFromTop$i32$i32(Math.imul(caDevelopers.GetHeight(), 2) / 3 | 0));
    C4StartupAboutDlg.prototype.DrawPersonList.call(this, 4, $.musicAndSound$C4StartupAboutDlg, caDevelopersCol3.GetFromTop$i32$i32(Math.imul(caDevelopers.GetHeight(), 1) / 3 | 0));
    C4StartupAboutDlg.prototype.DrawPersonList.call(this, 5, $.contributors$C4StartupAboutDlg, caContributors.GetFromTop$i32$i32(caContributors.GetHeight()));
    this.keySaveCredits = new $.C4KeyBinding().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(31, 2), S("StartupAboutSaveCredits"), 2 /*KEYSCOPE_Gui*/, new $.DlgKeyCB$C4StartupAboutDlg().init(this, "SaveCredits"), 4 /*PRIO_CtrlOverride*/);
    return this;
  }

  $dtor() {
    super.$dtor();
  }

  OnEnter() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupAboutDlg && C4StartupAboutDlg.prototype instanceof $c) return $c.prototype.OnEnter.apply(this, arguments); }
    this.DoBack$v();
    return true;
  }

  OnEscape() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupAboutDlg && C4StartupAboutDlg.prototype instanceof $c) return $c.prototype.OnEscape.apply(this, arguments); }
    this.DoBack$v();
    return true;
  }

  DrawElement(_cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupAboutDlg && C4StartupAboutDlg.prototype instanceof $c) return $c.prototype.DrawElement.apply(this, arguments); }
  }

  KeyBack() {
    this.DoBack$v();
    return true;
  }

  OnBackBtn(_btn) {
    this.DoBack$v();
  }

  OnLegalBtn(_btn) {
    $.C4Startup.Get().SwitchDialog(6 /*SDID_Legal*/);
  }

  DrawPersonList(title, persons, rect) {
    const rUseFont = $.GraphicsResource.TextFont;
    let image = $.C4Startup.Get().Graphics.fctAboutTitles.GetPhase(0, title);
    let height = Math.imul(2, rUseFont.GetFontHeight());
    let width = $min(image.GetWidthByHeight(height), rect.Wdt);
    let picture = new $.Picture().init(new $.C4Rect().init$i32$i32$i32$i32(rect.x, rect.y, width, height), true);
    $.Container.prototype.AddElement$pElement.call(this, picture);
    picture.SetFacet$C4Facet(image);
    rect.y = rect.y + height | 0;
    rect.Hgt = rect.Hgt - height | 0;
    let textbox = new $.TextWindow().init(rect, 0, 0, 0, 100, 4096, S(""), true, null, 0, true);
    $.Container.prototype.AddElement$pElement.call(this, textbox);
    textbox.SetDecoration$b$b$pScrollBarFacets$b(false, false, null, true);
    persons.WriteTo(textbox, rUseFont);
    textbox.UpdateHeight();
  }

  SaveCredits() { /* not translated: Ctrl+S in the about screen writes the credits to Credits.txt in the working directory (std::ofstream), a developer's export; the page has no working directory to write to */ }

  DoBack$v() {
    $.C4Startup.Get().SwitchDialog(0 /*SDID_Main*/);
  }

  $clone() { return new C4StartupAboutDlg().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.keySaveCredits = o.keySaveCredits;
    return this;
  }
}







export function $init(): void {
  ContributorList.contributorsThisRelease = $own([
  ((($o) => ($o.name = S("George Tokmaji"), $o.nick = S("Fulgen"), $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Martin Adam"), $o.nick = S("Win"), $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Merten Ehmig"), $o.nick = S("pluto"), $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Florian Graier"), $o.nick = S("Nachtfalter"), $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Philip Holzmann"), $o.nick = S("Foaly"), $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Dominik Bayerl"), $o.nick = S("Kanibal"), $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Linus Heckemann"), $o.nick = S("sphalerite"), $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Pyrit"), $o.nick = null, $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Armin Schäfer"), $o.nick = null, $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Tushar Maheshwari"), $o.nick = null, $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("jok"), $o.nick = null, $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Tarte"), $o.nick = null, $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Philip Kern"), $o.nick = S("pkern"), $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Arne Schauf"), $o.nick = S("NativeException"), $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Matthias Mailänder"), $o.nick = null, $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("marsmoon"), $o.nick = null, $o))(new PersonList$Entry())),
]);
  ContributorList.contributors = $own([
  ((($o) => ($o.name = S("Tim Blume"), $o.nick = null, $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Sven-Hendrik Haase"), $o.nick = null, $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Carl-Philip Hänsch"), $o.nick = S("Carli"), $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Jan Heberer"), $o.nick = null, $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Benjamin Herr"), $o.nick = S("Loriel"), $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Lauri Niskanen"), $o.nick = S("Ape"), $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Johannes Nixdorf"), $o.nick = S("mixi"), $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Misty de Meo"), $o.nick = null, $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Fabian Pietsch"), $o.nick = null, $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Manuel Rieke"), $o.nick = S("MrBeast"), $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Felix Riese"), $o.nick = S("Fungiform"), $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Sebastian Rühl"), $o.nick = null, $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Oliver Schneider"), $o.nick = S("ker"), $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Lorenz Schwittmann"), $o.nick = null, $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Alexander Semeniuk"), $o.nick = S("AlteredARMOR"), $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Daniel Theuke"), $o.nick = S("ST-DDT"), $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Andriel"), $o.nick = null, $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Apfelclonk"), $o.nick = null, $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Asmageddon"), $o.nick = null, $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Checkmaty"), $o.nick = null, $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Clonkine"), $o.nick = null, $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("dylanstrategie"), $o.nick = null, $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Faby"), $o.nick = null, $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("grgecko"), $o.nick = null, $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Gurkenglas"), $o.nick = null, $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("hasufell"), $o.nick = null, $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Koronis"), $o.nick = null, $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("mizipzor"), $o.nick = null, $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Peewee"), $o.nick = null, $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Russell"), $o.nick = null, $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Stan"), $o.nick = null, $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("TomyLobo"), $o.nick = null, $o))(new PersonList$Entry())),
]);
  ContributorList.packageMaintainers = $own([
  ((($o) => ($o.name = S("Benedict Etzel"), $o.nick = S("B_E"), $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Linus Heckemann"), $o.nick = S("sphalerite"), $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Philip Kern"), $o.nick = S("pkern"), $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Matthias Mailänder"), $o.nick = null, $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Julian Ospald"), $o.nick = S("hasufell"), $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Kevin Zheng"), $o.nick = null, $o))(new PersonList$Entry())),
]);
  $.engineAndTools$C4StartupAboutDlg = new DeveloperList().init($own([
  ((($o) => ($o.name = S("Sven Eberhardt"), $o.nick = S("Sven2"), $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Günther Brammer"), $o.nick = S("Günther"), $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Nicolas Hake"), $o.nick = S("Isilkor"), $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Armin Burgmeier"), $o.nick = S("Clonk-Karl"), $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Lukas Werling"), $o.nick = S("Luchs"), $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Martin Plicht"), $o.nick = S("Mortimer"), $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Julius Michaelis"), $o.nick = S("JCaesar"), $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Peter Wortmann"), $o.nick = S("PeterW"), $o))(new PersonList$Entry())),
]));
  $.scriptingAndContent$C4StartupAboutDlg = new DeveloperList().init($own([
  ((($o) => ($o.name = S("Maikel de Vries"), $o.nick = S("Maikel"), $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("David Dormagen"), $o.nick = S("Zapper"), $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Mark Haßelbusch"), $o.nick = S("Marky"), $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Felix Wagner"), $o.nick = S("Clonkonaut"), $o))(new PersonList$Entry())),
  ((($o) => ($o.name = S("Bernhard Bonigl"), $o.nick = S("Boni"), $o))(new PersonList$Entry())),
]));
  $.administration$C4StartupAboutDlg = new DeveloperList(); $.administration$C4StartupAboutDlg.init($own([((($o) => ($o.name = S("Tobias Zwick"), $o.nick = S("Newton"), $o))(new PersonList$Entry()))]));
  $.artAndContent$C4StartupAboutDlg = new DeveloperList(); $.artAndContent$C4StartupAboutDlg.init($own([((($o) => ($o.name = S("Charles Spurrill"), $o.nick = S("Ringwaul"), $o))(new PersonList$Entry())), ((($o) => ($o.name = S("Richard Gerum"), $o.nick = S("Randrian"), $o))(new PersonList$Entry())), ((($o) => ($o.name = S("Timo Stabbert"), $o.nick = S("Mimmo"), $o))(new PersonList$Entry())), ((($o) => ($o.name = S("Matthias Rottländer"), $o.nick = S("Matthi"), $o))(new PersonList$Entry()))]));
  $.musicAndSound$C4StartupAboutDlg = new DeveloperList(); $.musicAndSound$C4StartupAboutDlg.init($own([((($o) => ($o.name = S("David Oerther"), $o.nick = S("ala"), $o))(new PersonList$Entry())), ((($o) => ($o.name = S("Martin Strohmeier"), $o.nick = S("K-Pone"), $o))(new PersonList$Entry()))]));
  $.contributors$C4StartupAboutDlg = new ContributorList();
}

Object.assign($, { C4StartupAboutDlg, ContributorList, DeveloperList, PersonList, PersonList$Entry });
