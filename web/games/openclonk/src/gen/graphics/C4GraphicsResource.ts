// @ts-nocheck
// OpenClonk 36de799: src/graphics/C4GraphicsResource.cpp, src/graphics/C4GraphicsResource.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { ftoi32 } from '../../rt/int.ts';
import { P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete } from '../../rt/std.ts';

export class C4GraphicsResource {
  fInitialized = false;
  sfcControl = new $.C4Surface().init$v();
  sfcClonkSkins = new $.C4Surface().init$v();
  sfcCaption = new $.C4Surface().init$v();
  sfcButton = new $.C4Surface().init$v();
  sfcButtonD = new $.C4Surface().init$v();
  sfcScroll = new $.C4Surface().init$v();
  sfcContext = new $.C4Surface().init$v();
  idSfcCaption = 0;
  idSfcButton = 0;
  idSfcButtonD = 0;
  idSfcScroll = 0;
  idSfcContext = 0;
  idSfcClonkSkins = 0;
  idSfcControl = 0;
  idRegisteredMainGroupSetFiles = 0;
  Files = new $.C4GroupSet().init();
  ProgressStart = 0;
  ProgressIncrement = 0;
  fctPlayer = new $.C4FacetID().init();
  fctFlag = new $.C4FacetID().init();
  fctCrew = new $.C4FacetID().init();
  fctWealth = new $.C4FacetID().init();
  fctRank = new $.C4FacetID().init();
  iNumRanks = 0;
  fctFire = new $.C4FacetID().init();
  fctBackground = new $.C4FacetID().init();
  fctCaptain = new $.C4FacetID().init();
  fctMouseCursor = new $.C4FacetID().init();
  fctSelectMark = new $.C4FacetID().init();
  fctOptions = new $.C4FacetID().init();
  fctMenu = new $.C4FacetID().init();
  fctUpperBoard = new $.C4FacetID().init();
  fctLogo = new $.C4FacetID().init();
  fctConstruction = new $.C4FacetID().init();
  fctEnergy = new $.C4FacetID().init();
  fctArrow = new $.C4FacetID().init();
  fctExit = new $.C4FacetID().init();
  fctHand = new $.C4FacetID().init();
  fctGamepad = new $.C4FacetID().init();
  fctBuild = new $.C4FacetID().init();
  fctClonkSkin = new $.C4Facet().init$v();
  fctKeyboard = new $.C4Facet().init$v();
  fctMouse = new $.C4Facet().init$v();
  fctCommand = new $.C4Facet().init$v();
  fctKey = new $.C4Facet().init$v();
  fctOKCancel = new $.C4Facet().init$v();
  fctTransformKnob = new $.C4FacetID().init();
  fctCrewClr = new $.C4FacetID().init();
  fctFlagClr = new $.C4FacetID().init();
  fctPlayerClr = new $.C4FacetID().init();
  barCaption = new $.DynBarFacet().None();
  barButton = new $.DynBarFacet().None();
  barButtonD = new $.DynBarFacet().None();
  fctButtonHighlight = new $.C4FacetID().init();
  fctButtonHighlightRound = new $.C4FacetID().init();
  fctIcons = new $.C4FacetID().init();
  fctIconsEx = new $.C4FacetID().init();
  fctControllerIcons = new $.C4FacetID().init();
  fctSubmenu = new $.C4FacetID().init();
  fctCheckbox = new $.C4FacetID().init();
  fctBigArrows = new $.C4FacetID().init();
  fctProgressBar = new $.C4FacetID().init();
  sfctScroll = new $.ScrollBarFacets().None();
  fctContext = new $.C4Facet().init$v();
  CaptionFont = null;
  TitleFont = null;
  TextFont = null;
  MiniFont = null;
  TooltipFont = null;
  FontTiny = new $.CStdFont().init();
  FontRegular = new $.CStdFont().init();
  FontCaption = new $.CStdFont().init();
  FontTitle = new $.CStdFont().init();
  FontTooltip = new $.CStdFont().init();
  Achievements = new $.C4AchievementGraphics().init();

  init() {
    this.sfcControl = new $.C4Surface().init$v();
    this.sfcClonkSkins = new $.C4Surface().init$v();
    this.sfcCaption = new $.C4Surface().init$v();
    this.sfcButton = new $.C4Surface().init$v();
    this.sfcButtonD = new $.C4Surface().init$v();
    this.sfcScroll = new $.C4Surface().init$v();
    this.sfcContext = new $.C4Surface().init$v();
    this.idSfcCaption = 0;
    this.idSfcButton = 0;
    this.idSfcButtonD = 0;
    this.idSfcScroll = 0;
    this.idSfcContext = 0;
    this.Files = new $.C4GroupSet().init();
    this.fctPlayer = new $.C4FacetID().init();
    this.fctFlag = new $.C4FacetID().init();
    this.fctCrew = new $.C4FacetID().init();
    this.fctWealth = new $.C4FacetID().init();
    this.fctRank = new $.C4FacetID().init();
    this.fctFire = new $.C4FacetID().init();
    this.fctBackground = new $.C4FacetID().init();
    this.fctCaptain = new $.C4FacetID().init();
    this.fctMouseCursor = new $.C4FacetID().init();
    this.fctSelectMark = new $.C4FacetID().init();
    this.fctOptions = new $.C4FacetID().init();
    this.fctMenu = new $.C4FacetID().init();
    this.fctUpperBoard = new $.C4FacetID().init();
    this.fctLogo = new $.C4FacetID().init();
    this.fctConstruction = new $.C4FacetID().init();
    this.fctEnergy = new $.C4FacetID().init();
    this.fctArrow = new $.C4FacetID().init();
    this.fctExit = new $.C4FacetID().init();
    this.fctHand = new $.C4FacetID().init();
    this.fctGamepad = new $.C4FacetID().init();
    this.fctBuild = new $.C4FacetID().init();
    this.fctClonkSkin = new $.C4Facet().init$v();
    this.fctKeyboard = new $.C4Facet().init$v();
    this.fctMouse = new $.C4Facet().init$v();
    this.fctCommand = new $.C4Facet().init$v();
    this.fctKey = new $.C4Facet().init$v();
    this.fctOKCancel = new $.C4Facet().init$v();
    this.fctTransformKnob = new $.C4FacetID().init();
    this.fctCrewClr = new $.C4FacetID().init();
    this.fctFlagClr = new $.C4FacetID().init();
    this.fctPlayerClr = new $.C4FacetID().init();
    this.barCaption = new $.DynBarFacet().None();
    this.barButton = new $.DynBarFacet().None();
    this.barButtonD = new $.DynBarFacet().None();
    this.fctButtonHighlight = new $.C4FacetID().init();
    this.fctButtonHighlightRound = new $.C4FacetID().init();
    this.fctIcons = new $.C4FacetID().init();
    this.fctIconsEx = new $.C4FacetID().init();
    this.fctControllerIcons = new $.C4FacetID().init();
    this.fctSubmenu = new $.C4FacetID().init();
    this.fctCheckbox = new $.C4FacetID().init();
    this.fctBigArrows = new $.C4FacetID().init();
    this.fctProgressBar = new $.C4FacetID().init();
    this.sfctScroll = new $.ScrollBarFacets().None();
    this.fctContext = new $.C4Facet().init$v();
    this.FontTiny = new $.CStdFont().init();
    this.FontRegular = new $.CStdFont().init();
    this.FontCaption = new $.CStdFont().init();
    this.FontTitle = new $.CStdFont().init();
    this.FontTooltip = new $.CStdFont().init();
    this.Achievements = new $.C4AchievementGraphics().init();
    this.CaptionFont = this.FontCaption;
    this.TitleFont = this.FontTitle;
    this.TextFont = this.FontRegular;
    this.MiniFont = this.FontTiny;
    this.TooltipFont = this.FontTooltip;
    C4GraphicsResource.prototype.Default.call(this);
    return this;
  }

  $dtor() {
    C4GraphicsResource.prototype.Clear.call(this);
  }

  GetFontByHeight(iHgt, pfZoom = null) {
    let pUseFont = null;
    if (iHgt <= this.MiniFont.GetLineHeight()) {
      pUseFont = this.MiniFont;
    } else if (iHgt <= this.TextFont.GetLineHeight()) {
      pUseFont = this.TextFont;
    } else if (iHgt <= this.CaptionFont.GetLineHeight()) {
      pUseFont = this.CaptionFont;
    } else {
      pUseFont = this.TitleFont;
    }
    if (pfZoom != null) {
      let iLineHgt = pUseFont.GetLineHeight();
      if (iLineHgt !== 0) {
        pfZoom.a[pfZoom.o] = Math.fround(Math.fround(iHgt) / Math.fround(iLineHgt));
      } else {
        pfZoom.a[pfZoom.o] = 1;
      }
    }
    return pUseFont;
  }

  Default() {
    this.fInitialized = false;
    this.sfcControl.Default();
    this.idSfcControl = 0;
    this.sfcClonkSkins.Default();
    this.idSfcClonkSkins = 0;
    this.fctPlayer.Default();
    this.fctFlag.Default();
    $.C4Facet.prototype.Default.call(this.fctClonkSkin);
    this.fctCrew.Default();
    this.fctWealth.Default();
    this.fctRank.Default();
    this.fctFire.Default();
    this.fctBackground.Default();
    this.fctCaptain.Default();
    this.fctMouseCursor.Default();
    this.fctSelectMark.Default();
    this.fctMenu.Default();
    this.fctUpperBoard.Default();
    this.fctLogo.Default();
    this.fctConstruction.Default();
    this.fctEnergy.Default();
    this.fctArrow.Default();
    this.fctExit.Default();
    this.fctHand.Default();
    this.fctGamepad.Default();
    this.fctBuild.Default();
    this.fctCrewClr.Default();
    this.fctFlagClr.Default();
    this.fctPlayerClr.Default();
    $.C4Facet.prototype.Default.call(this.fctKeyboard);
    this.fctGamepad.Default();
    $.C4Facet.prototype.Default.call(this.fctCommand);
    $.C4Facet.prototype.Default.call(this.fctKey);
    $.C4Facet.prototype.Default.call(this.fctOKCancel);
    $.C4Facet.prototype.Default.call(this.fctMouse);
    this.fctTransformKnob.Default();
    this.iNumRanks = 1;
    this.idRegisteredMainGroupSetFiles = -1;
  }

  Clear() {
    this.fInitialized = false;
    this.sfcControl.Clear();
    this.idSfcControl = 0;
    this.sfcClonkSkins.Clear();
    this.idSfcClonkSkins = 0;
    this.fctCrewClr.Clear();
    this.fctFlagClr.Clear();
    this.fctPlayerClr.Clear();
    this.fctPlayer.Clear();
    this.fctFlag.Clear();
    this.fctCrew.Clear();
    this.fctWealth.Clear();
    this.fctRank.Clear();
    this.fctFire.Clear();
    this.fctBackground.Clear();
    this.fctCaptain.Clear();
    this.fctMouseCursor.Clear();
    this.fctSelectMark.Clear();
    this.fctMenu.Clear();
    this.fctUpperBoard.Clear();
    this.fctLogo.Clear();
    this.fctConstruction.Clear();
    this.fctEnergy.Clear();
    this.fctOptions.Clear();
    this.fctArrow.Clear();
    this.fctExit.Clear();
    this.fctHand.Clear();
    this.fctGamepad.Clear();
    this.fctBuild.Clear();
    this.fctTransformKnob.Clear();
    this.sfcCaption.Clear();
    this.sfcButton.Clear();
    this.sfcButtonD.Clear();
    this.sfcScroll.Clear();
    this.sfcContext.Clear();
    this.idSfcCaption = this.idSfcButton = this.idSfcButtonD = this.idSfcScroll = this.idSfcContext = 0;
    this.barCaption.Clear();
    this.barButton.Clear();
    this.barButtonD.Clear();
    this.fctButtonHighlight.Clear();
    this.fctIcons.Clear();
    this.fctIconsEx.Clear();
    this.fctControllerIcons.Clear();
    this.fctButtonHighlightRound.Clear();
    this.fctSubmenu.Clear();
    this.fctCheckbox.Clear();
    this.fctBigArrows.Clear();
    this.fctProgressBar.Clear();
    $.C4Facet.prototype.Default.call(this.fctContext);
    this.FontRegular.SetCustomImages(null);
    this.Achievements.Clear();
    this.CloseFiles();
  }

  InitFonts() {
    let szFont = null;
    if (!$.Game.C4S.Head.Font.empty()) {
      szFont = $.Game.C4S.Head.Font.c_str();
    } else {
      szFont = P($.Config.General.RXFontName, 0);
    }
    if (!$.FontLoader.InitFont(this.FontRegular, szFont, 2 /*C4FT_Main*/, $.Config.General.RXFontSize, this.Files)) {
      return false;
    }
    $.Game.SetInitProgress(this.ProgressStart);
    this.ProgressStart = Math.fround(this.ProgressStart + this.ProgressIncrement);
    if (!$.FontLoader.InitFont(this.FontTiny, szFont, 0 /*C4FT_Log*/, $.Config.General.RXFontSize, this.Files)) {
      return false;
    }
    $.Game.SetInitProgress(this.ProgressStart);
    this.ProgressStart = Math.fround(this.ProgressStart + this.ProgressIncrement);
    if (!$.FontLoader.InitFont(this.FontTitle, szFont, 4 /*C4FT_Title*/, $.Config.General.RXFontSize, this.Files)) {
      return false;
    }
    $.Game.SetInitProgress(this.ProgressStart);
    this.ProgressStart = Math.fround(this.ProgressStart + this.ProgressIncrement);
    if (!$.FontLoader.InitFont(this.FontCaption, szFont, 3 /*C4FT_Caption*/, $.Config.General.RXFontSize, this.Files)) {
      return false;
    }
    $.Game.SetInitProgress(this.ProgressStart);
    this.ProgressStart = Math.fround(this.ProgressStart + this.ProgressIncrement);
    if (!$.FontLoader.InitFont(this.FontTooltip, szFont, 2 /*C4FT_Main*/, $.Config.General.RXFontSize, this.Files, false)) {
      return false;
    }
    $.Game.SetInitProgress(this.ProgressStart);
    this.ProgressStart = Math.fround(this.ProgressStart + this.ProgressIncrement);
    this.FontRegular.SetCustomImages($.Definitions);
    return true;
  }

  ClearFonts() {
    this.FontRegular.Clear();
    this.FontTitle.Clear();
    this.FontCaption.Clear();
    this.FontTiny.Clear();
    this.FontTooltip.Clear();
  }

  Init() {
    if (!this.RegisterGlobalGraphics()) {
      return false;
    }
    if (!this.RegisterMainGroups()) {
      $.LogFatal($.LoadResStr(S("IDS_ERR_GFX_REGISTERMAIN")));
      return false;
    }
    this.Files.PreCacheEntries(S("*.glsl"));
    if (!$.pGL.InitShaders(this.Files)) {
      $.LogFatal($.LoadResStr(S("IDS_ERR_GFX_INITSHADERS")));
      return false;
    }
    $.Game.SetInitProgress(11);
    this.ProgressStart = 12;
    this.ProgressIncrement = Math.fround(0.349999994);
    if (!this.LoadFile$rC4FacetID$pi8$rC4GroupSet$i32$i32$b$i32(this.fctProgressBar, S("GUIProgress"), this.Files, -1, -1, false, 0)) {
      return false;
    }
    this.fctProgressBar.Set$pC4Surface$i32$i32$i32$i32(this.fctProgressBar.Surface, 1, 0, ftoi32(Math.fround(this.fctProgressBar.Wdt - Math.fround(2))), ftoi32(this.fctProgressBar.Hgt));
    if (!this.InitFonts()) {
      return false;
    }
    if (!this.LoadFile$rC4Surface$pi8$rC4GroupSet$ri32$i32(this.sfcCaption, S("GUICaption"), this.Files, P(this, "idSfcCaption"), 0)) {
      return false;
    }
    this.barCaption.SetHorizontal$rC4Surface$i32$i32(this.sfcCaption, this.sfcCaption.Hgt, 32);
    if (!this.LoadFile$rC4Surface$pi8$rC4GroupSet$ri32$i32(this.sfcButton, S("GUIButton"), this.Files, P(this, "idSfcButton"), 0)) {
      return false;
    }
    this.barButton.SetHorizontal$rC4Surface$i32$i32(this.sfcButton);
    if (!this.LoadFile$rC4Surface$pi8$rC4GroupSet$ri32$i32(this.sfcButtonD, S("GUIButtonDown"), this.Files, P(this, "idSfcButtonD"), 0)) {
      return false;
    }
    this.barButtonD.SetHorizontal$rC4Surface$i32$i32(this.sfcButtonD);
    if (!this.LoadFile$rC4FacetID$pi8$rC4GroupSet$i32$i32$b$i32(this.fctButtonHighlight, S("GUIButtonHighlight"), this.Files, -1, -1, false, 0)) {
      return false;
    }
    if (!this.LoadFile$rC4FacetID$pi8$rC4GroupSet$i32$i32$b$i32(this.fctButtonHighlightRound, S("GUIButtonHighlightRound"), this.Files, -1, -1, false, 0)) {
      return false;
    }
    if (!this.LoadFile$rC4FacetID$pi8$rC4GroupSet$i32$i32$b$i32(this.fctIcons, S("GUIIcons"), this.Files, -1, -1, false, 0)) {
      return false;
    }
    this.fctIcons.Set$pC4Surface$i32$i32$i32$i32(this.fctIcons.Surface, 0, 0, 40, 40);
    if (!this.LoadFile$rC4FacetID$pi8$rC4GroupSet$i32$i32$b$i32(this.fctIconsEx, S("GUIIcons2"), this.Files, -1, -1, false, 0)) {
      return false;
    }
    this.fctIconsEx.Set$pC4Surface$i32$i32$i32$i32(this.fctIconsEx.Surface, 0, 0, 64, 64);
    if (!this.LoadFile$rC4FacetID$pi8$rC4GroupSet$i32$i32$b$i32(this.fctControllerIcons, S("ControllerIcons"), this.Files, -1, -1, false, 0)) {
      return false;
    }
    this.fctControllerIcons.Set$pC4Surface$i32$i32$i32$i32(this.fctControllerIcons.Surface, 0, 0, 100, 100);
    if (!this.LoadFile$rC4Surface$pi8$rC4GroupSet$ri32$i32(this.sfcScroll, S("GUIScroll"), this.Files, P(this, "idSfcScroll"), 0)) {
      return false;
    }
    this.sfctScroll.Set(new $.C4Facet().init$pC4Surface$f32$f32$f32$f32(this.sfcScroll, Math.fround(0), Math.fround(0), Math.fround(32), Math.fround(32)));
    if (!this.LoadFile$rC4Surface$pi8$rC4GroupSet$ri32$i32(this.sfcContext, S("GUIContext"), this.Files, P(this, "idSfcContext"), 0)) {
      return false;
    }
    this.fctContext.Set$pC4Surface$f32$f32$f32$f32(this.sfcContext, Math.fround(0), Math.fround(0), Math.fround(16), Math.fround(16));
    if (!this.LoadFile$rC4FacetID$pi8$rC4GroupSet$i32$i32$b$i32(this.fctSubmenu, S("GUISubmenu"), this.Files, -1, -1, false, 0)) {
      return false;
    }
    if (!this.LoadFile$rC4FacetID$pi8$rC4GroupSet$i32$i32$b$i32(this.fctCheckbox, S("GUICheckbox"), this.Files, -1, -1, false, 0)) {
      return false;
    }
    this.fctCheckbox.Set$pC4Surface$i32$i32$i32$i32(this.fctCheckbox.Surface, 0, 0, ftoi32(this.fctCheckbox.Hgt), ftoi32(this.fctCheckbox.Hgt));
    if (!this.LoadFile$rC4FacetID$pi8$rC4GroupSet$i32$i32$b$i32(this.fctBigArrows, S("GUIBigArrows"), this.Files, -1, -1, false, 0)) {
      return false;
    }
    this.fctBigArrows.Set$pC4Surface$i32$i32$i32$i32(this.fctBigArrows.Surface, 0, 0, ftoi32(Math.fround(this.fctBigArrows.Wdt / Math.fround(4))), ftoi32(this.fctBigArrows.Hgt));
    if (!this.LoadFile$rC4Surface$pi8$rC4GroupSet$ri32$i32(this.sfcControl, S("Control"), this.Files, P(this, "idSfcControl"), 0)) {
      return false;
    }
    this.fctKeyboard.Set$pC4Surface$f32$f32$f32$f32(this.sfcControl, Math.fround(0), Math.fround(0), Math.fround(80), Math.fround(36));
    this.fctCommand.Set$pC4Surface$f32$f32$f32$f32(this.sfcControl, Math.fround(0), Math.fround(36), Math.fround(32), Math.fround(32));
    this.fctKey.Set$pC4Surface$f32$f32$f32$f32(this.sfcControl, Math.fround(0), Math.fround(100), Math.fround(64), Math.fround(64));
    this.fctOKCancel.Set$pC4Surface$f32$f32$f32$f32(this.sfcControl, Math.fround(128), Math.fround(100), Math.fround(32), Math.fround(32));
    this.fctMouse.Set$pC4Surface$f32$f32$f32$f32(this.sfcControl, Math.fround(198), Math.fround(100), Math.fround(32), Math.fround(32));
    if (!this.LoadFile$rC4Surface$pi8$rC4GroupSet$ri32$i32(this.sfcClonkSkins, S("ClonkSkins"), this.Files, P(this, "idSfcClonkSkins"), 0)) {
      return false;
    }
    this.fctClonkSkin.Set$pC4Surface$f32$f32$f32$f32(this.sfcClonkSkins, Math.fround(0), Math.fround(0), Math.fround(64), Math.fround(64));
    if (!this.LoadFile$rC4FacetID$pi8$rC4GroupSet$i32$i32$b$i32(this.fctFire, S("Fire"), this.Files, -2, -1, false, 0)) {
      return false;
    }
    if (!this.LoadFile$rC4FacetID$pi8$rC4GroupSet$i32$i32$b$i32(this.fctBackground, S("Background"), this.Files, -1, -1, false, 1)) {
      return false;
    }
    if (!this.LoadFile$rC4FacetID$pi8$rC4GroupSet$i32$i32$b$i32(this.fctFlag, S("Flag"), this.Files, -1, -1, false, 0)) {
      return false;
    }
    if (!this.LoadFile$rC4FacetID$pi8$rC4GroupSet$i32$i32$b$i32(this.fctCrew, S("Crew"), this.Files, -1, -1, false, 0)) {
      return false;
    }
    if (!this.LoadFile$rC4FacetID$pi8$rC4GroupSet$i32$i32$b$i32(this.fctWealth, S("Wealth"), this.Files, -1, -1, false, 0)) {
      return false;
    }
    if (!this.LoadFile$rC4FacetID$pi8$rC4GroupSet$i32$i32$b$i32(this.fctPlayer, S("Player"), this.Files, -1, -1, false, 0)) {
      return false;
    }
    if (!this.LoadFile$rC4FacetID$pi8$rC4GroupSet$i32$i32$b$i32(this.fctRank, S("Rank"), this.Files, -2, -1, false, 0)) {
      return false;
    }
    if (!this.LoadFile$rC4FacetID$pi8$rC4GroupSet$i32$i32$b$i32(this.fctCaptain, S("Captain"), this.Files, -1, -1, false, 0)) {
      return false;
    }
    if (!this.LoadCursorGfx()) {
      return false;
    }
    if (!this.LoadFile$rC4FacetID$pi8$rC4GroupSet$i32$i32$b$i32(this.fctSelectMark, S("SelectMark"), this.Files, -2, -1, false, 0)) {
      return false;
    }
    if (!this.LoadFile$rC4FacetID$pi8$rC4GroupSet$i32$i32$b$i32(this.fctMenu, S("Menu"), this.Files, 35, 35, false, 0)) {
      return false;
    }
    if (!this.LoadFile$rC4FacetID$pi8$rC4GroupSet$i32$i32$b$i32(this.fctLogo, S("Logo"), this.Files, -1, -1, false, 0)) {
      return false;
    }
    if (!this.LoadFile$rC4FacetID$pi8$rC4GroupSet$i32$i32$b$i32(this.fctConstruction, S("Construction"), this.Files, -1, -1, false, 0)) {
      return false;
    }
    if (!this.LoadFile$rC4FacetID$pi8$rC4GroupSet$i32$i32$b$i32(this.fctEnergy, S("Energy"), this.Files, -1, -1, false, 0)) {
      return false;
    }
    if (!this.LoadFile$rC4FacetID$pi8$rC4GroupSet$i32$i32$b$i32(this.fctOptions, S("Options"), this.Files, -2, -1, false, 0)) {
      return false;
    }
    if (!this.LoadFile$rC4FacetID$pi8$rC4GroupSet$i32$i32$b$i32(this.fctUpperBoard, S("UpperBoard"), this.Files, -1, -1, false, 1)) {
      return false;
    }
    if (!this.LoadFile$rC4FacetID$pi8$rC4GroupSet$i32$i32$b$i32(this.fctArrow, S("Arrow"), this.Files, -2, -1, false, 0)) {
      return false;
    }
    if (!this.LoadFile$rC4FacetID$pi8$rC4GroupSet$i32$i32$b$i32(this.fctExit, S("Exit"), this.Files, -1, -1, false, 0)) {
      return false;
    }
    if (!this.LoadFile$rC4FacetID$pi8$rC4GroupSet$i32$i32$b$i32(this.fctHand, S("Hand"), this.Files, -2, -1, false, 0)) {
      return false;
    }
    if (!this.LoadFile$rC4FacetID$pi8$rC4GroupSet$i32$i32$b$i32(this.fctGamepad, S("Gamepad"), this.Files, 80, -1, false, 0)) {
      return false;
    }
    if (!this.LoadFile$rC4FacetID$pi8$rC4GroupSet$i32$i32$b$i32(this.fctBuild, S("Build"), this.Files, -1, -1, false, 0)) {
      return false;
    }
    if (!this.LoadFile$rC4FacetID$pi8$rC4GroupSet$i32$i32$b$i32(this.fctTransformKnob, S("TransformKnob"), this.Files, -1, -1, false, 0)) {
      return false;
    }
    if (!this.Achievements.Init$rC4GroupSet(this.Files)) {
      return false;
    }
    if (this.fctCrew.idSourceGroup !== this.fctCrewClr.idSourceGroup) {
      if (!this.fctCrewClr.CreateClrByOwner(this.fctCrew.Surface)) {
        $.LogFatal(S("ClrByOwner error! (1)"));
        return false;
      }
      this.fctCrewClr.Wdt = this.fctCrew.Wdt;
      this.fctCrewClr.Hgt = this.fctCrew.Hgt;
      this.fctCrewClr.idSourceGroup = this.fctCrew.idSourceGroup;
    }
    if (this.fctFlag.idSourceGroup !== this.fctFlagClr.idSourceGroup) {
      if (!this.fctFlagClr.CreateClrByOwner(this.fctFlag.Surface)) {
        $.LogFatal(S("ClrByOwner error! (1)"));
        return false;
      }
      this.fctFlagClr.Wdt = this.fctFlag.Wdt;
      this.fctFlagClr.Hgt = this.fctFlag.Hgt;
      this.fctFlagClr.idSourceGroup = this.fctFlag.idSourceGroup;
    }
    if (this.fctPlayer.idSourceGroup !== this.fctPlayerClr.idSourceGroup) {
      if (!this.fctPlayerClr.CreateClrByOwner(this.fctPlayer.Surface)) {
        $.LogFatal(S("ClrByOwner error! (1)"));
        return false;
      }
      this.fctPlayerClr.Wdt = this.fctPlayer.Wdt;
      this.fctPlayerClr.Hgt = this.fctPlayer.Hgt;
      this.fctPlayerClr.idSourceGroup = this.fctPlayer.idSourceGroup;
    }
    const Q = [0];
    this.fctRank.GetPhaseNum(P(this, "iNumRanks"), P(Q, 0));
    if (this.iNumRanks === 0) {
      this.iNumRanks = 1;
    }
    this.fInitialized = true;
    return true;
  }

  IsInitialized() {
    return this.fInitialized;
  }

  RegisterGlobalGraphics() {
    let pMainGfxGrp = new $.C4Group().init();
    if (!$.Reloc.Open(pMainGfxGrp, S("Graphics.ocg")) || !this.Files.RegisterGroup(pMainGfxGrp, true, 0, 1, true)) {
      $.LogFatal($.FormatString($.LoadResStr(S("IDS_PRC_NOGFXFILE")), S("Graphics.ocg"), pMainGfxGrp.GetError()).getData());
      $delete(pMainGfxGrp);
      return false;
    }
    return true;
  }

  RegisterMainGroups() {
    this.Files.RegisterGroups($.Game.GroupSet, 1, S("Graphics.ocg"), this.idRegisteredMainGroupSetFiles);
    this.idRegisteredMainGroupSetFiles = $.Game.GroupSet.GetLastID();
    return true;
  }

  CloseFiles() {
    this.Files.Clear();
    this.idRegisteredMainGroupSetFiles = -1;
  }

  ReloadResolutionDependantFiles() {
    if (!this.fInitialized) {
      return false;
    }
    let hadGroupsRegistered = this.idRegisteredMainGroupSetFiles !== -1;
    if (!hadGroupsRegistered) {
      this.RegisterGlobalGraphics();
      this.RegisterMainGroups();
    }
    this.fctMouseCursor.idSourceGroup = 0;
    let result = true;
    if (!hadGroupsRegistered) {
      this.CloseFiles();
    }
    return true;
  }

  LoadFile$rC4FacetID$pi8$rC4GroupSet$i32$i32$b$i32(fct, szName, rGfxSet, iWdt, iHgt, fNoWarnIfNotFound, iFlags) {
    const FileName = new Int8Array(255);
    const ID = [0];
    let pGrp = FindSuitableFile(szName, rGfxSet, P(FileName, 0), P(ID, 0));
    if (pGrp == null) {
      if (!fNoWarnIfNotFound) {
        $.LogF($.LoadResStr(S("IDS_PRC_NOGFXFILE")), szName, $.LoadResStr(S("IDS_PRC_FILENOTFOUND")));
      }
      return false;
    }
    if (fct.idSourceGroup === ID[0]) {
      return true;
    }
    if (!fct.Load(pGrp, P(FileName, 0), iWdt, iHgt, false, iFlags)) {
      $.LogF($.LoadResStr(S("IDS_PRC_NOGFXFILE")), P(FileName, 0), $.LoadResStr(S("IDS_ERR_NOFILE")));
      return false;
    }
    fct.idSourceGroup = ID[0];
    $.Game.SetInitProgress(this.ProgressStart);
    this.ProgressStart = Math.fround(this.ProgressStart + this.ProgressIncrement);
    return true;
  }

  LoadFile$rC4Surface$pi8$rC4GroupSet$ri32$i32(sfc, szName, rGfxSet, ridCurrSfc, iFlags) {
    const FileName = new Int8Array(255);
    const ID = [0];
    let pGrp = FindSuitableFile(szName, rGfxSet, P(FileName, 0), P(ID, 0));
    if (pGrp == null) {
      $.LogF($.LoadResStr(S("IDS_PRC_NOGFXFILE")), szName, $.LoadResStr(S("IDS_PRC_FILENOTFOUND")));
      return false;
    }
    if (ID[0] === ridCurrSfc.a[ridCurrSfc.o]) {
      return true;
    }
    if (!sfc.Load(pGrp, P(FileName, 0), false, false, iFlags)) {
      $.LogF($.LoadResStr(S("IDS_PRC_NOGFXFILE")), P(FileName, 0), $.LoadResStr(S("IDS_ERR_NOFILE")));
      return false;
    }
    ridCurrSfc.a[ridCurrSfc.o] = ID[0];
    $.Game.SetInitProgress(this.ProgressStart);
    this.ProgressStart = Math.fround(this.ProgressStart + this.ProgressIncrement);
    return true;
  }

  LoadCursorGfx() {
    let szCursorFilename = null;
    szCursorFilename = S("Cursor");
    if (!this.LoadFile$rC4FacetID$pi8$rC4GroupSet$i32$i32$b$i32(this.fctMouseCursor, szCursorFilename, this.Files, -2, -1, false, 0)) {
      return false;
    }
    return true;
  }

  $clone() { return new C4GraphicsResource().$assign(this); }
  $assign(o) {
    this.fInitialized = o.fInitialized;
    this.sfcControl.$assign(o.sfcControl);
    this.sfcClonkSkins.$assign(o.sfcClonkSkins);
    this.sfcCaption.$assign(o.sfcCaption);
    this.sfcButton.$assign(o.sfcButton);
    this.sfcButtonD.$assign(o.sfcButtonD);
    this.sfcScroll.$assign(o.sfcScroll);
    this.sfcContext.$assign(o.sfcContext);
    this.idSfcCaption = o.idSfcCaption;
    this.idSfcButton = o.idSfcButton;
    this.idSfcButtonD = o.idSfcButtonD;
    this.idSfcScroll = o.idSfcScroll;
    this.idSfcContext = o.idSfcContext;
    this.idSfcClonkSkins = o.idSfcClonkSkins;
    this.idSfcControl = o.idSfcControl;
    this.idRegisteredMainGroupSetFiles = o.idRegisteredMainGroupSetFiles;
    this.Files.$assign(o.Files);
    this.ProgressStart = o.ProgressStart;
    this.ProgressIncrement = o.ProgressIncrement;
    this.fctPlayer.$assign(o.fctPlayer);
    this.fctFlag.$assign(o.fctFlag);
    this.fctCrew.$assign(o.fctCrew);
    this.fctWealth.$assign(o.fctWealth);
    this.fctRank.$assign(o.fctRank);
    this.iNumRanks = o.iNumRanks;
    this.fctFire.$assign(o.fctFire);
    this.fctBackground.$assign(o.fctBackground);
    this.fctCaptain.$assign(o.fctCaptain);
    this.fctMouseCursor.$assign(o.fctMouseCursor);
    this.fctSelectMark.$assign(o.fctSelectMark);
    this.fctOptions.$assign(o.fctOptions);
    this.fctMenu.$assign(o.fctMenu);
    this.fctUpperBoard.$assign(o.fctUpperBoard);
    this.fctLogo.$assign(o.fctLogo);
    this.fctConstruction.$assign(o.fctConstruction);
    this.fctEnergy.$assign(o.fctEnergy);
    this.fctArrow.$assign(o.fctArrow);
    this.fctExit.$assign(o.fctExit);
    this.fctHand.$assign(o.fctHand);
    this.fctGamepad.$assign(o.fctGamepad);
    this.fctBuild.$assign(o.fctBuild);
    this.fctClonkSkin.$assign(o.fctClonkSkin);
    this.fctKeyboard.$assign(o.fctKeyboard);
    this.fctMouse.$assign(o.fctMouse);
    this.fctCommand.$assign(o.fctCommand);
    this.fctKey.$assign(o.fctKey);
    this.fctOKCancel.$assign(o.fctOKCancel);
    this.fctTransformKnob.$assign(o.fctTransformKnob);
    this.fctCrewClr.$assign(o.fctCrewClr);
    this.fctFlagClr.$assign(o.fctFlagClr);
    this.fctPlayerClr.$assign(o.fctPlayerClr);
    this.barCaption.$assign(o.barCaption);
    this.barButton.$assign(o.barButton);
    this.barButtonD.$assign(o.barButtonD);
    this.fctButtonHighlight.$assign(o.fctButtonHighlight);
    this.fctButtonHighlightRound.$assign(o.fctButtonHighlightRound);
    this.fctIcons.$assign(o.fctIcons);
    this.fctIconsEx.$assign(o.fctIconsEx);
    this.fctControllerIcons.$assign(o.fctControllerIcons);
    this.fctSubmenu.$assign(o.fctSubmenu);
    this.fctCheckbox.$assign(o.fctCheckbox);
    this.fctBigArrows.$assign(o.fctBigArrows);
    this.fctProgressBar.$assign(o.fctProgressBar);
    this.sfctScroll.$assign(o.sfctScroll);
    this.fctContext.$assign(o.fctContext);
    this.CaptionFont = o.CaptionFont;
    this.TitleFont = o.TitleFont;
    this.TextFont = o.TextFont;
    this.MiniFont = o.MiniFont;
    this.TooltipFont = o.TooltipFont;
    this.FontTiny.$assign(o.FontTiny);
    this.FontRegular.$assign(o.FontRegular);
    this.FontCaption.$assign(o.FontCaption);
    this.FontTitle.$assign(o.FontTitle);
    this.FontTooltip.$assign(o.FontTooltip);
    this.Achievements.$assign(o.Achievements);
    return this;
  }
}

function FindSuitableFile(szName, rGfxSet, szFileName, pID) {
  const extensions = [
  S("bmp"),
  S("jpeg"),
  S("jpg"),
  S("png"),
  null,
];
  return rGfxSet.FindSuitableFile(szName, P(extensions, 0), szFileName, pID);
}


export function $init(): void {
  $.GraphicsResource = new C4GraphicsResource(); $.GraphicsResource.init();
}

Object.assign($, { C4GraphicsResource, FindSuitableFile });
