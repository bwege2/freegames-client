// @ts-nocheck
// OpenClonk 36de799: src/config/C4Config.cpp, src/config/C4Config.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n } from '../../rt/int.ts';
import { c$getenv, c$gethostname, c$memmove, c$readlink, c$strcpy, c$strlen, c$strncmp, c$strncpy } from '../../rt/libc.ts';
import { $oarr, $own, $padd, $peq, $rd, $wr, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, StdString } from '../../rt/std.ts';

export class C4ConfigGeneral {
  Name = new Int8Array(1025);
  Language = new Int8Array(1025);
  LanguageEx = new Int8Array(1025);
  Participants = new Int8Array(1025);
  AlwaysDebug = 0;
  OpenScenarioInGameMode = 0;
  RXFontName = new Int8Array(1025);
  RXFontSize = 0;
  ConfigUserPath = new Int8Array(1025);
  ScreenshotFolder = new $.StdStrBuf();
  ModsFolder = new $.StdStrBuf();
  MissionAccess = new Int8Array(1025);
  FPS = 0;
  DefRec = 0;
  MMTimer = 0;
  ScrollSmooth = 0;
  ConfigResetSafety = 0;
  ExePath = new $.StdCopyStrBuf();
  TempPath = new $.StdCopyStrBuf();
  UserDataPath = new Int8Array(1025);
  ModsDataPath = new Int8Array(1025);
  SystemDataPath = new Int8Array(1025);
  ScreenshotPath = new Int8Array(1025);
  TempUpdatePath = new Int8Array(1025);
  GamepadEnabled = false;
  FirstStart = false;
  DebugRec = 0;
  DebugRecWrite = 0;
  DebugRecExternalFile = new Int8Array(4097);
  Adopt = new C4ConfigGeneral$$anon1();

  static GetLanguageSequence(source, target) {
    let count = 0;
    const language = new Int8Array(3);
    for (let i = 0; $.SCopySegment(source, i, P(language, 0), 44, 2, true); i = i + 1 | 0) {
      if (language[0] !== 0) {
        if (target.a[target.o + 0] !== 0) {
          $.SAppendChar(44, target);
        }
        $.SAppend(P(language, 0), target);
        count = count + 1 | 0;
      }
    }
    return count;
  }

  DefaultLanguage() {
    if (this.Language[0] === 0) {
      if ($.IsGermanSystem()) {
        $.SCopy$pi8$pi8(S("DE - Deutsch"), P(this.Language, 0));
      } else {
        $.SCopy$pi8$pi8(S("US - English"), P(this.Language, 0));
      }
    }
    if (this.LanguageEx[0] === 0) {
      C4ConfigGeneral.GetLanguageSequence(P(this.Language, 0), P(this.LanguageEx, 0));
    }
  }

  CreateSaveFolder(directory, language_title) {
    if (!$.CreatePath(StdString.of(directory))) {
      return false;
    }
    const language = new Int8Array(3);
    $.SCopy$pi8$pi8$u64(P($.Config.General.Language, 0), P(language, 0), 2);
    let title_file = new $.StdStrBuf();
    title_file.Format(S("%s%c%s"), directory, 47, S("Title.txt"));
    let title_data = new $.StdStrBuf();
    title_data.Format(S("%s:%s"), P(language, 0), language_title);
    let file = new $.CStdFile().init();
    if (!$.FileExists(title_file.getData())) {
      if (!file.Create(title_file.getData()) || !file.WriteString(title_data.getData()) || !file.Close$ppStdBuf()) {
        return false;
      }
    }
    return true;
  }

  DeterminePaths() {
    this.ExePath.SetLength(1024);
    let l = c$readlink(S("/proc/self/exe"), this.ExePath.getMData(), 1024);
    if (l < -1) {
      this.ExePath.Ref$pi8(S("."));
    } else {
      this.ExePath.SetLength($u64n(l));
      $.GetParentPath$pi8$pStdStrBuf(this.ExePath.getData(), this.ExePath);
      this.ExePath.AppendBackslash();
    }
    let t = c$getenv(S("TMPDIR"));
    if (t != null) {
      this.TempPath.op_assign$pi8(t);
      this.TempPath.AppendBackslash();
    } else {
      this.TempPath.op_assign$pi8(S("/tmp/"));
    }
    $.SCopy$pi8$pi8(S("/usr/local/share/games/openclonk"), P(this.SystemDataPath, 0));
    $.AppendBackslash(P(this.SystemDataPath, 0));
    if (this.ConfigUserPath[0] !== 0) {
      $.SCopy$pi8$pi8(P(this.ConfigUserPath, 0), P(this.UserDataPath, 0));
    } else {
      $.SCopy$pi8$pi8(S("$HOME/.clonk/openclonk"), P(this.UserDataPath, 0));
    }
    C4Config.ExpandEnvironmentVariables(P(this.UserDataPath, 0), 1024);
    $.AppendBackslash(P(this.UserDataPath, 0));
    $.SCopy$pi8$pi8$u64(P(this.UserDataPath, 0), P(this.ScreenshotPath, 0), 1023);
    if (this.ScreenshotFolder.getLength() + c$strlen(P(this.ScreenshotPath, 0)) + 1 <= 1024) {
      $.SAppend(this.ScreenshotFolder.getData(), P(this.ScreenshotPath, 0));
      $.AppendBackslash(P(this.ScreenshotPath, 0));
    }
    $.SCopy$pi8$pi8$u64(P(this.UserDataPath, 0), P(this.ModsDataPath, 0), 1023);
    if (this.ModsFolder.getLength() + c$strlen(P(this.ModsDataPath, 0)) + 1 <= 1024) {
      $.SAppend(this.ModsFolder.getData(), P(this.ModsDataPath, 0));
      $.AppendBackslash(P(this.ModsDataPath, 0));
    }
    $.CreatePath(StdString.of(P(this.UserDataPath, 0)));
  }

  CompileFunc(compiler) {
    compiler.Value$StdNamingDefaultAdapt$StdStringAdapt$x$5($.mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$5($.mkStringAdaptM(this.Name), S("Name"), S("")));
    compiler.Value$StdNamingDefaultAdapt$StdStringAdapt$x$5($.mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$5($.mkStringAdaptM(this.Language), S("Language"), S(""), false, true));
    compiler.Value$StdNamingDefaultAdapt$StdStringAdapt$x$5($.mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$5($.mkStringAdaptM(this.LanguageEx), S("LanguageEx"), S(""), false, true));
    compiler.Value$StdNamingDefaultAdapt$StdStringAdapt$x$5($.mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$5($.mkStringAdaptM(this.Participants), S("Participants"), S("")));
    compiler.Value$StdNamingDefaultAdapt$StdStringAdapt$x$5($.mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$5($.mkStringAdaptM(this.ConfigUserPath), S("UserDataPath"), S(""), false, true));
    compiler.Value$StdNamingDefaultAdapt$StdStringAdapt$x$5($.mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$5($.mkStringAdaptM(this.ModsDataPath), S("ModsDataPath"), S(""), false, true));
    compiler.Value$StdNamingDefaultAdapt$StdStringAdapt$x$5($.mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$5($.mkStringAdaptM(this.Adopt.PlayerPath), S("PlayerPath"), S("")));
    compiler.Value$StdNamingDefaultAdapt$StdStringAdapt$x$5($.mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$5($.mkStringAdaptM(this.TempUpdatePath), S("TempUpdatePath"), S("")));
    compiler.Value$StdNamingDefaultAdapt$StdStringAdapt$x$5($.mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$5($.mkStringAdaptM(this.MissionAccess), S("MissionAccess"), S(""), false, true));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "FPS"), S("FPS"), 0));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "DefRec"), S("DefRec"), 0));
    compiler.Value$StdNamingDefaultAdapt$StdStrBuf$x($.mkNamingAdapt$rStdStrBuf$pi8$x$b$b(this.ScreenshotFolder, S("ScreenshotFolder"), S("Screenshots"), false, true));
    compiler.Value$StdNamingDefaultAdapt$StdStrBuf$x$3($.mkNamingAdapt$rStdStrBuf$pi8$x$b$b$3(this.ModsFolder, S("ModsFolder"), S("mods"), false, true));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "ScrollSmooth"), S("ScrollSmooth"), 4));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "AlwaysDebug"), S("DebugMode"), 0));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "OpenScenarioInGameMode"), S("OpenScenarioInGameMode"), 0));
    compiler.Value$StdNamingDefaultAdapt$StdStringAdapt$x($.mkNamingAdapt$mStdStringAdapt$pi8$x$b$b($.mkStringAdaptM(this.RXFontName), S("FontName"), S("Endeavour"), false, true));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "RXFontSize"), S("FontSize"), 14, false, true));
    compiler.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "GamepadEnabled"), S("GamepadEnabled"), true));
    compiler.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "FirstStart"), S("FirstStart"), true));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "ConfigResetSafety"), S("ConfigResetSafety"), 42));
  }

  None() {
    this.ScreenshotFolder = new $.StdStrBuf();
    this.ModsFolder = new $.StdStrBuf();
    this.ExePath = new $.StdCopyStrBuf();
    this.TempPath = new $.StdCopyStrBuf();
    this.Adopt = new C4ConfigGeneral$$anon1();
    return this;
  }

  $clone() { return new C4ConfigGeneral().$assign(this); }
  $assign(o) {
    this.Name = o.Name.slice();
    this.Language = o.Language.slice();
    this.LanguageEx = o.LanguageEx.slice();
    this.Participants = o.Participants.slice();
    this.AlwaysDebug = o.AlwaysDebug;
    this.OpenScenarioInGameMode = o.OpenScenarioInGameMode;
    this.RXFontName = o.RXFontName.slice();
    this.RXFontSize = o.RXFontSize;
    this.ConfigUserPath = o.ConfigUserPath.slice();
    this.ScreenshotFolder.$assign(o.ScreenshotFolder);
    this.ModsFolder.$assign(o.ModsFolder);
    this.MissionAccess = o.MissionAccess.slice();
    this.FPS = o.FPS;
    this.DefRec = o.DefRec;
    this.MMTimer = o.MMTimer;
    this.ScrollSmooth = o.ScrollSmooth;
    this.ConfigResetSafety = o.ConfigResetSafety;
    this.ExePath.$assign(o.ExePath);
    this.TempPath.$assign(o.TempPath);
    this.UserDataPath = o.UserDataPath.slice();
    this.ModsDataPath = o.ModsDataPath.slice();
    this.SystemDataPath = o.SystemDataPath.slice();
    this.ScreenshotPath = o.ScreenshotPath.slice();
    this.TempUpdatePath = o.TempUpdatePath.slice();
    this.GamepadEnabled = o.GamepadEnabled;
    this.FirstStart = o.FirstStart;
    this.DebugRec = o.DebugRec;
    this.DebugRecWrite = o.DebugRecWrite;
    this.DebugRecExternalFile = o.DebugRecExternalFile.slice();
    this.Adopt.$assign(o.Adopt);
    return this;
  }
}

export class C4ConfigGeneral$$anon1 {
  static $layout = [["PlayerPath", 0, "i8", 1025]];
  static $size = 1025;
  PlayerPath = new Int8Array(1025);

  $clone() { return new C4ConfigGeneral$$anon1().$assign(this); }
  $assign(o) {
    this.PlayerPath = o.PlayerPath.slice();
    return this;
  }
}

export class C4ConfigDeveloper {
  AutoFileReload = 0;
  TodoFilename = new Int8Array(1025);
  AltTodoFilename = new Int8Array(1025);
  MaxScriptMRU = 0;
  DebugShapeTextures = 0;
  ShowHelp = false;
  RecentlyEditedSzenarios = $oarr(8, () => new Int8Array(1025));

  CompileFunc(compiler) {
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "AutoFileReload"), S("AutoFileReload"), 1, false, true));
    compiler.Value$StdNamingDefaultAdapt$StdStringAdapt$x$6($.mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$6($.mkStringAdaptM(this.TodoFilename), S("TodoFilename"), S("{SCENARIO}/TODO.txt"), false, true));
    compiler.Value$StdNamingDefaultAdapt$StdStringAdapt$x$6($.mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$6($.mkStringAdaptM(this.AltTodoFilename), S("AltTodoFilename2"), S("{USERPATH}/TODO.txt"), false, true));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "MaxScriptMRU"), S("MaxScriptMRU"), 30, false, false));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "DebugShapeTextures"), S("DebugShapeTextures"), 0, false, true));
    compiler.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "ShowHelp"), S("ShowHelp"), true, false, false));
    for (let i = 0; i < 8; i = i + 1 | 0) {
      compiler.Value$StdNamingDefaultAdapt$StdStringAdapt$x$5($.mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$5($.mkStringAdaptM(this.RecentlyEditedSzenarios[i]), $.FormatString(S("EditorMRU%02d"), i).getData(), S(""), false, false));
    }
  }

  AddRecentlyEditedScenario(filename) {
    if (filename == null || filename.a[filename.o] === 0) {
      return;
    }
    let move_down_num = 0;
    for (move_down_num = 0; move_down_num < 7; move_down_num = move_down_num + 1 | 0) {
      if (!(c$strncmp(filename, P(this.RecentlyEditedSzenarios[move_down_num], 0), 1024) !== 0)) {
        break;
      }
    }
    for (let i = move_down_num; i > 0; i = i - 1 | 0) {
      c$strcpy(P(this.RecentlyEditedSzenarios[i], 0), P(this.RecentlyEditedSzenarios[i - 1 | 0], 0));
    }
    c$strncpy(P(this.RecentlyEditedSzenarios[0], 0), filename, 1024);
  }

  $clone() { return new C4ConfigDeveloper().$assign(this); }
  $assign(o) {
    this.AutoFileReload = o.AutoFileReload;
    this.TodoFilename = o.TodoFilename.slice();
    this.AltTodoFilename = o.AltTodoFilename.slice();
    this.MaxScriptMRU = o.MaxScriptMRU;
    this.DebugShapeTextures = o.DebugShapeTextures;
    this.ShowHelp = o.ShowHelp;
    this.RecentlyEditedSzenarios = $own(o.RecentlyEditedSzenarios.map(($e0) => $e0.slice()));
    return this;
  }
}

export class C4ConfigGraphics {
  static $layout = [["SplitscreenDividers", 0, "i32", 0], ["ShowStartupMessages", 4, "i32", 0], ["VerboseObjectLoading", 8, "i32", 0], ["MenuTransparency", 12, "i32", 0], ["UpperBoard", 16, "i32", 0], ["ShowClock", 20, "i32", 0], ["ResX", 24, "i32", 0], ["ResY", 28, "i32", 0], ["WindowX", 32, "i32", 0], ["WindowY", 36, "i32", 0], ["RefreshRate", 40, "i32", 0], ["Windowed", 44, "i32", 0], ["ShowCrewNames", 48, "i32", 0], ["ShowCrewCNames", 52, "i32", 0], ["PXSGfx", 56, "i32", 0], ["Gamma", 60, "i32", 0], ["Monitor", 64, "i32", 0], ["MaxRefreshDelay", 68, "i32", 0], ["NoOffscreenBlits", 72, "i32", 0], ["MultiSampling", 76, "i32", 0], ["AutoFrameSkip", 80, "i32", 0], ["DebugOpenGL", 84, "i32", 0], ["MouseCursorSize", 88, "i32", 0]];
  static $size = 92;
  SplitscreenDividers = 0;
  ShowStartupMessages = 0;
  VerboseObjectLoading = 0;
  MenuTransparency = 0;
  UpperBoard = 0;
  ShowClock = 0;
  ResX = 0;
  ResY = 0;
  WindowX = 0;
  WindowY = 0;
  RefreshRate = 0;
  Windowed = 0;
  ShowCrewNames = 0;
  ShowCrewCNames = 0;
  PXSGfx = 0;
  Gamma = 0;
  Monitor = 0;
  MaxRefreshDelay = 0;
  NoOffscreenBlits = 0;
  MultiSampling = 0;
  AutoFrameSkip = 0;
  DebugOpenGL = 0;
  MouseCursorSize = 0;

  CompileFunc(compiler) {
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "ResX"), S("ResolutionX"), -1, false, true));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "ResY"), S("ResolutionY"), -1, false, true));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "WindowX"), S("WindowX"), 800, false, true));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "WindowY"), S("WindowY"), 600, false, true));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "RefreshRate"), S("RefreshRate"), 0));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "SplitscreenDividers"), S("SplitscreenDividers"), 1));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "ShowStartupMessages"), S("ShowStartupMessages"), 1, false, true));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "VerboseObjectLoading"), S("VerboseObjectLoading"), 0));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "MenuTransparency"), S("MenuTransparency"), 1, false, true));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "UpperBoard"), S("UpperBoard"), 1, false, true));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "ShowClock"), S("ShowClock"), 0, false, true));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "ShowCrewNames"), S("ShowCrewNames"), 1, false, true));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "ShowCrewCNames"), S("ShowCrewCNames"), 0, false, true));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Windowed"), S("Windowed"), 0, false, true));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "PXSGfx"), S("PXSGfx"), 1));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Gamma"), S("Gamma"), 100));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Monitor"), S("Monitor"), 0));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "MaxRefreshDelay"), S("MaxRefreshDelay"), 30));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "NoOffscreenBlits"), S("NoOffscreenBlits"), 1));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "MultiSampling"), S("MultiSampling"), 4));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "AutoFrameSkip"), S("AutoFrameSkip"), 1));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "MouseCursorSize"), S("MouseCursorSize"), 50));
  }

  $clone() { return new C4ConfigGraphics().$assign(this); }
  $assign(o) {
    this.SplitscreenDividers = o.SplitscreenDividers;
    this.ShowStartupMessages = o.ShowStartupMessages;
    this.VerboseObjectLoading = o.VerboseObjectLoading;
    this.MenuTransparency = o.MenuTransparency;
    this.UpperBoard = o.UpperBoard;
    this.ShowClock = o.ShowClock;
    this.ResX = o.ResX;
    this.ResY = o.ResY;
    this.WindowX = o.WindowX;
    this.WindowY = o.WindowY;
    this.RefreshRate = o.RefreshRate;
    this.Windowed = o.Windowed;
    this.ShowCrewNames = o.ShowCrewNames;
    this.ShowCrewCNames = o.ShowCrewCNames;
    this.PXSGfx = o.PXSGfx;
    this.Gamma = o.Gamma;
    this.Monitor = o.Monitor;
    this.MaxRefreshDelay = o.MaxRefreshDelay;
    this.NoOffscreenBlits = o.NoOffscreenBlits;
    this.MultiSampling = o.MultiSampling;
    this.AutoFrameSkip = o.AutoFrameSkip;
    this.DebugOpenGL = o.DebugOpenGL;
    this.MouseCursorSize = o.MouseCursorSize;
    return this;
  }
}

export class C4ConfigSound {
  static $layout = [["RXSound", 0, "i32", 0], ["RXMusic", 4, "i32", 0], ["FEMusic", 8, "i32", 0], ["FESamples", 12, "i32", 0], ["Verbose", 16, "i32", 0], ["MusicVolume", 20, "i32", 0], ["SoundVolume", 24, "i32", 0]];
  static $size = 28;
  RXSound = 0;
  RXMusic = 0;
  FEMusic = 0;
  FESamples = 0;
  Verbose = 0;
  MusicVolume = 0;
  SoundVolume = 0;

  CompileFunc(compiler) {
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "RXSound"), S("Sound"), 1, false, true));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "RXMusic"), S("Music"), 1, false, true));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "FEMusic"), S("MenuMusic"), 1, false, true));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "FESamples"), S("MenuSound"), 1, false, true));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Verbose"), S("Verbose"), 0));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "MusicVolume"), S("MusicVolume2"), 40, false, true));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "SoundVolume"), S("SoundVolume"), 100, false, true));
  }

  $clone() { return new C4ConfigSound().$assign(this); }
  $assign(o) {
    this.RXSound = o.RXSound;
    this.RXMusic = o.RXMusic;
    this.FEMusic = o.FEMusic;
    this.FESamples = o.FESamples;
    this.Verbose = o.Verbose;
    this.MusicVolume = o.MusicVolume;
    this.SoundVolume = o.SoundVolume;
    return this;
  }
}

export class C4ConfigNetwork {
  ControlRate = 0;
  ControlPreSend = 0;
  Lobby = 0;
  NoRuntimeJoin = 0;
  NoReferenceRequest = 0;
  MaxResSearchRecursion = 0;
  WorkPath = new Int8Array(1025);
  Comment = new $.ValidatedStdCopyStrBuf$10().init$v();
  MasterServerSignUp = 0;
  MasterServerActive = 0;
  MasterKeepPeriod = 0;
  MasterReferencePeriod = 0;
  LeagueServerSignUp = 0;
  UseAlternateServer = 0;
  PortTCP = 0;
  PortUDP = 0;
  PortDiscovery = 0;
  PortRefServer = 0;
  EnableUPnP = 0;
  ControlMode = 0;
  Nick = new $.ValidatedStdCopyStrBuf$3().init$v();
  MaxLoadFileSize = 0;
  LastPassword = new Int8Array(1025);
  AlternateServerAddress = new Int8Array(1025);
  PuncherAddress = new Int8Array(1025);
  LastLeagueServer = new $.StdCopyStrBuf();
  LastLeaguePlayerName = new $.StdCopyStrBuf();
  LastLeagueAccount = new $.StdCopyStrBuf();
  LastLeagueLoginToken = new $.StdCopyStrBuf();
  UseAlternateModDatabaseServer = 0;
  AlternateModDatabaseServerAddress = new Int8Array(1025);
  AsyncMaxWait = 0;
  PacketLogging = 0;

  CompileFunc(compiler) {
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "ControlRate"), S("ControlRate"), 3, false, true));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "ControlPreSend"), S("ControlPreSend"), -1));
    compiler.Value$StdNamingDefaultAdapt$StdStringAdapt$x$13($.mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$13($.mkStringAdaptM(this.WorkPath), S("WorkPath"), S("Network"), false, true));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Lobby"), S("Lobby"), 0));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "NoRuntimeJoin"), S("NoRuntimeJoin"), 1, false, true));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "NoReferenceRequest"), S("NoReferenceRequest"), 0));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "MaxResSearchRecursion"), S("MaxResSearchRecursion"), 1, false, true));
    compiler.Value$StdNamingDefaultAdapt$ValidatedStdCopyStrBuf$10$x($.mkNamingAdapt$rValidatedStdCopyStrBuf$10$pi8$x$b$b(this.Comment, S("Comment"), S(""), false, true));
    compiler.Value$StdNamingDefaultAdapt$i32$i16($.mkNamingAdapt$ri32$pi8$i16$b$b(P(this, "PortTCP"), S("PortTCP"), $.C4NetStdPortTCP$C4Network2, false, true));
    compiler.Value$StdNamingDefaultAdapt$i32$i16($.mkNamingAdapt$ri32$pi8$i16$b$b(P(this, "PortUDP"), S("PortUDP"), $.C4NetStdPortUDP$C4Network2, false, true));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "EnableUPnP"), S("EnableUPnP"), 1, false, true));
    compiler.Value$StdNamingDefaultAdapt$i32$i16($.mkNamingAdapt$ri32$pi8$i16$b$b(P(this, "PortDiscovery"), S("PortDiscovery"), $.C4NetStdPortDiscovery$C4Network2, false, true));
    compiler.Value$StdNamingDefaultAdapt$i32$i16($.mkNamingAdapt$ri32$pi8$i16$b$b(P(this, "PortRefServer"), S("PortRefServer"), $.C4NetStdPortRefServer$C4Network2, false, true));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "ControlMode"), S("ControlMode"), 0));
    compiler.Value$StdNamingDefaultAdapt$ValidatedStdCopyStrBuf$3$x($.mkNamingAdapt$rValidatedStdCopyStrBuf$3$pi8$x$b$b(this.Nick, S("Nick"), S(""), false, true));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "MaxLoadFileSize"), S("MaxLoadFileSize"), 0x500000, false, true));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "MasterServerSignUp"), S("MasterServerSignUp"), 1));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "MasterServerActive"), S("MasterServerActive"), 0));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "MasterKeepPeriod"), S("MasterKeepPeriod"), 60));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "MasterReferencePeriod"), S("MasterReferencePeriod"), 120));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "LeagueServerSignUp"), S("LeagueServerSignUp"), 0));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "UseAlternateServer"), S("UseAlternateServer"), 0));
    compiler.Value$StdNamingDefaultAdapt$StdStringAdapt$x$10($.mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$10($.mkStringAdaptM(this.AlternateServerAddress), S("AlternateServerAddress"), S("https://league.openclonk.org/league.php")));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "UseAlternateModDatabaseServer"), S("UseAlternateModDatabaseServer"), 0));
    compiler.Value$StdNamingDefaultAdapt$StdStringAdapt$x$9($.mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$9($.mkStringAdaptM(this.AlternateModDatabaseServerAddress), S("AlternateModDatabaseServerAddress"), S("https://mods.openclonk.org/api/")));
    compiler.Value$StdNamingDefaultAdapt$StdStringAdapt$x$11($.mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$11($.mkStringAdaptM(this.LastPassword), S("LastPassword"), S("Wipf")));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "AsyncMaxWait"), S("AsyncMaxWait"), 2));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "PacketLogging"), S("PacketLogging"), 0));
    compiler.Value$StdNamingDefaultAdapt$StdStringAdapt$x$8($.mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$8($.mkStringAdaptM(this.PuncherAddress), S("PuncherAddress"), S("netpuncher.openclonk.org:11115")));
    compiler.Value$StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x$2($.mkNamingAdapt$mStdParameterAdapt$StdCopyStrBuf$i32$pi8$x$b$b$2($.mkParAdapt$rStdCopyStrBuf$mi32(this.LastLeagueServer, 1 /*RCT_All*/), S("LastLeagueServer"), S("")));
    compiler.Value$StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x$2($.mkNamingAdapt$mStdParameterAdapt$StdCopyStrBuf$i32$pi8$x$b$b$2($.mkParAdapt$rStdCopyStrBuf$mi32(this.LastLeaguePlayerName, 1 /*RCT_All*/), S("LastLeaguePlayerName"), S("")));
    compiler.Value$StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x$2($.mkNamingAdapt$mStdParameterAdapt$StdCopyStrBuf$i32$pi8$x$b$b$2($.mkParAdapt$rStdCopyStrBuf$mi32(this.LastLeagueAccount, 1 /*RCT_All*/), S("LastLeagueAccount"), S("")));
    compiler.Value$StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x$2($.mkNamingAdapt$mStdParameterAdapt$StdCopyStrBuf$i32$pi8$x$b$b$2($.mkParAdapt$rStdCopyStrBuf$mi32(this.LastLeagueLoginToken, 1 /*RCT_All*/), S("LastLeagueLoginToken"), S("")));
  }

  GetLeagueServerAddress() {
    if (this.UseAlternateServer !== 0) {
      return P(this.AlternateServerAddress, 0);
    } else {
      return S("https://league.openclonk.org/league.php");
    }
  }

  GetModDatabaseServerAddress() {
    if (this.UseAlternateModDatabaseServer !== 0) {
      return P(this.AlternateModDatabaseServerAddress, 0);
    } else {
      return S("https://mods.openclonk.org/api/");
    }
  }

  CheckPortsForCollisions() {
    if (this.PortTCP !== -1 && this.PortTCP === this.PortRefServer) {
      $.LogSilentF(S("Network: TCP Port collision, setting defaults"));
      this.PortTCP = 11112;
      this.PortRefServer = 11111;
    }
    if (this.PortUDP !== -1 && this.PortUDP === this.PortDiscovery) {
      $.LogSilentF(S("Network: UDP Port collision, setting defaults"));
      this.PortUDP = 11113;
      this.PortDiscovery = 11114;
    }
  }

  SetLeagueLoginData(server_name, player_name, account, login_token) {
    this.LastLeagueServer.Copy$pi8(server_name);
    this.LastLeaguePlayerName.Copy$pi8(player_name);
    this.LastLeagueAccount.Copy$pi8(account);
    this.LastLeagueLoginToken.Copy$pi8(login_token);
  }

  GetLeagueLoginData(server_name, player_name, account, login_token) {
    if (this.LastLeagueServer.op_eq$pi8(server_name) && this.LastLeaguePlayerName.op_eq$pi8(player_name)) {
      account.Copy$StdStrBuf(this.LastLeagueAccount);
      login_token.Copy$StdStrBuf(this.LastLeagueLoginToken);
      return true;
    }
    return false;
  }

  None() {
    this.Comment = new $.ValidatedStdCopyStrBuf$10().init$v();
    this.Nick = new $.ValidatedStdCopyStrBuf$3().init$v();
    this.LastLeagueServer = new $.StdCopyStrBuf();
    this.LastLeaguePlayerName = new $.StdCopyStrBuf();
    this.LastLeagueAccount = new $.StdCopyStrBuf();
    this.LastLeagueLoginToken = new $.StdCopyStrBuf();
    return this;
  }

  $clone() { return new C4ConfigNetwork().$assign(this); }
  $assign(o) {
    this.ControlRate = o.ControlRate;
    this.ControlPreSend = o.ControlPreSend;
    this.Lobby = o.Lobby;
    this.NoRuntimeJoin = o.NoRuntimeJoin;
    this.NoReferenceRequest = o.NoReferenceRequest;
    this.MaxResSearchRecursion = o.MaxResSearchRecursion;
    this.WorkPath = o.WorkPath.slice();
    this.Comment.$assign(o.Comment);
    this.MasterServerSignUp = o.MasterServerSignUp;
    this.MasterServerActive = o.MasterServerActive;
    this.MasterKeepPeriod = o.MasterKeepPeriod;
    this.MasterReferencePeriod = o.MasterReferencePeriod;
    this.LeagueServerSignUp = o.LeagueServerSignUp;
    this.UseAlternateServer = o.UseAlternateServer;
    this.PortTCP = o.PortTCP;
    this.PortUDP = o.PortUDP;
    this.PortDiscovery = o.PortDiscovery;
    this.PortRefServer = o.PortRefServer;
    this.EnableUPnP = o.EnableUPnP;
    this.ControlMode = o.ControlMode;
    this.Nick.$assign(o.Nick);
    this.MaxLoadFileSize = o.MaxLoadFileSize;
    this.LastPassword = o.LastPassword.slice();
    this.AlternateServerAddress = o.AlternateServerAddress.slice();
    this.PuncherAddress = o.PuncherAddress.slice();
    this.LastLeagueServer.$assign(o.LastLeagueServer);
    this.LastLeaguePlayerName.$assign(o.LastLeaguePlayerName);
    this.LastLeagueAccount.$assign(o.LastLeagueAccount);
    this.LastLeagueLoginToken.$assign(o.LastLeagueLoginToken);
    this.UseAlternateModDatabaseServer = o.UseAlternateModDatabaseServer;
    this.AlternateModDatabaseServerAddress = o.AlternateModDatabaseServerAddress.slice();
    this.AsyncMaxWait = o.AsyncMaxWait;
    this.PacketLogging = o.PacketLogging;
    return this;
  }
}

export class C4ConfigStartup {
  static $layout = [["HideMsgGfxEngineChange", 0, "i32", 0], ["HideMsgGfxBitDepthChange", 4, "i32", 0], ["HideMsgMMTimerChange", 8, "i32", 0], ["HideMsgStartDedicated", 12, "i32", 0], ["HideMsgPlrTakeOver", 16, "i32", 0], ["HideMsgPlrNoTakeOver", 20, "i32", 0], ["HideMsgNoOfficialLeague", 24, "i32", 0], ["HideMsgIRCDangerous", 28, "i32", 0], ["AlphabeticalSorting", 32, "i32", 0], ["LastPortraitFolderIdx", 36, "i32", 0]];
  static $size = 40;
  HideMsgGfxEngineChange = 0;
  HideMsgGfxBitDepthChange = 0;
  HideMsgMMTimerChange = 0;
  HideMsgStartDedicated = 0;
  HideMsgPlrTakeOver = 0;
  HideMsgPlrNoTakeOver = 0;
  HideMsgNoOfficialLeague = 0;
  HideMsgIRCDangerous = 0;
  AlphabeticalSorting = 0;
  LastPortraitFolderIdx = 0;

  CompileFunc(compiler) {
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "HideMsgGfxEngineChange"), S("HideMsgGfxEngineChange"), 0));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "HideMsgGfxBitDepthChange"), S("HideMsgGfxBitDepthChange"), 0));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "HideMsgMMTimerChange"), S("HideMsgMMTimerChange"), 0));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "HideMsgStartDedicated"), S("HideMsgStartDedicated"), 0));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "HideMsgPlrTakeOver"), S("HideMsgPlrTakeOver"), 0));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "HideMsgPlrNoTakeOver"), S("HideMsgPlrNoTakeOver"), 0));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "HideMsgNoOfficialLeague"), S("HideMsgNoOfficialLeague"), 0));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "HideMsgIRCDangerous"), S("HideMsgIRCDangerous"), 0));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "AlphabeticalSorting"), S("AlphabeticalSorting"), 0));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "LastPortraitFolderIdx"), S("LastPortraitFolderIdx"), 0));
  }

  $clone() { return new C4ConfigStartup().$assign(this); }
  $assign(o) {
    this.HideMsgGfxEngineChange = o.HideMsgGfxEngineChange;
    this.HideMsgGfxBitDepthChange = o.HideMsgGfxBitDepthChange;
    this.HideMsgMMTimerChange = o.HideMsgMMTimerChange;
    this.HideMsgStartDedicated = o.HideMsgStartDedicated;
    this.HideMsgPlrTakeOver = o.HideMsgPlrTakeOver;
    this.HideMsgPlrNoTakeOver = o.HideMsgPlrNoTakeOver;
    this.HideMsgNoOfficialLeague = o.HideMsgNoOfficialLeague;
    this.HideMsgIRCDangerous = o.HideMsgIRCDangerous;
    this.AlphabeticalSorting = o.AlphabeticalSorting;
    this.LastPortraitFolderIdx = o.LastPortraitFolderIdx;
    return this;
  }
}

export class C4ConfigLobby {
  static $layout = [["CountdownTime", 0, "i32", 0], ["AllowPlayerSave", 4, "i32", 0]];
  static $size = 8;
  CountdownTime = 0;
  AllowPlayerSave = 0;

  CompileFunc(compiler) {
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "AllowPlayerSave"), S("AllowPlayerSave"), 0, false, false));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "CountdownTime"), S("CountdownTime"), 5, false, false));
  }

  $clone() { return new C4ConfigLobby().$assign(this); }
  $assign(o) {
    this.CountdownTime = o.CountdownTime;
    this.AllowPlayerSave = o.AllowPlayerSave;
    return this;
  }
}

export class C4ConfigIRC {
  static $layout = [["Server", 0, "i8", 1025], ["Nick", 1025, "i8", 1025], ["RealName", 2050, "i8", 1025], ["Channel", 3075, "i8", 1025], ["AllowAllChannels", 4100, "i32", 0]];
  static $size = 4104;
  Server = new Int8Array(1025);
  Nick = new Int8Array(1025);
  RealName = new Int8Array(1025);
  Channel = new Int8Array(1025);
  AllowAllChannels = 0;

  CompileFunc(compiler) {
    compiler.Value$StdNamingDefaultAdapt$StdStringAdapt$x$4($.mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$4($.mkStringAdaptM(this.Server), S("Server"), S("irc.euirc.net"), false, true));
    compiler.Value$StdNamingDefaultAdapt$StdStringAdapt$x$5($.mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$5($.mkStringAdaptM(this.Nick), S("Nick"), S(""), false, true));
    compiler.Value$StdNamingDefaultAdapt$StdStringAdapt$x$5($.mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$5($.mkStringAdaptM(this.RealName), S("RealName"), S(""), false, true));
    compiler.Value$StdNamingDefaultAdapt$StdStringAdapt$x$2($.mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$2($.mkStringAdaptM(this.Channel), S("Channel"), S("#openclonk"), false, true));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "AllowAllChannels"), S("AllowAllChannels"), 0, false, true));
  }

  $clone() { return new C4ConfigIRC().$assign(this); }
  $assign(o) {
    this.Server = o.Server.slice();
    this.Nick = o.Nick.slice();
    this.RealName = o.RealName.slice();
    this.Channel = o.Channel.slice();
    this.AllowAllChannels = o.AllowAllChannels;
    return this;
  }
}

export class C4ConfigGamepad {
  static $layout = [["Button", 0, "i32", 12], ["AxisMin", 48, "u32", 6], ["AxisMax", 72, "u32", 6], ["AxisCalibrated", 96, "u8", 6]];
  static $size = 104;
  Button = new Int32Array(12);
  AxisMin = new Uint32Array(6);
  AxisMax = new Uint32Array(6);
  AxisCalibrated = new Array(6).fill(false);

  CompileFunc(compiler, buttons_only = false) {
    if (!buttons_only) {
      for (let i = 0; i < 6; i = i + 1 | 0) {
        compiler.Value$StdNamingDefaultAdapt$u32$u32($.mkNamingAdapt$ru32$pi8$u32$b$b(P(this.AxisMin, i), $.FormatString(S("Axis%dMin"), i).getData(), 0));
        compiler.Value$StdNamingDefaultAdapt$u32$u32($.mkNamingAdapt$ru32$pi8$u32$b$b(P(this.AxisMax, i), $.FormatString(S("Axis%dMax"), i).getData(), 0));
        compiler.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this.AxisCalibrated, i), $.FormatString(S("Axis%dCalibrated"), i).getData(), false));
      }
    }
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this.Button, 0), S("Button1"), -1));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this.Button, 1), S("Button2"), -1));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this.Button, 2), S("Button3"), -1));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this.Button, 3), S("Button4"), -1));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this.Button, 4), S("Button5"), -1));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this.Button, 5), S("Button6"), -1));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this.Button, 6), S("Button7"), -1));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this.Button, 7), S("Button8"), -1));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this.Button, 8), S("Button9"), -1));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this.Button, 9), S("Button10"), -1));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this.Button, 10), S("Button11"), -1));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this.Button, 11), S("Button12"), -1));
  }

  ResetButtons() {
    let Comp = new $.StdCompilerNull();
    Comp.Compile$mStdParameterAdapt$C4ConfigGamepad$b($.mkParAdapt$rC4ConfigGamepad$mb(this, true));
  }

  Reset() {
    let Comp = new $.StdCompilerNull();
    Comp.Compile$mStdParameterAdapt$C4ConfigGamepad$b($.mkParAdapt$rC4ConfigGamepad$mb(this, false));
  }

  $clone() { return new C4ConfigGamepad().$assign(this); }
  $assign(o) {
    this.Button = o.Button.slice();
    this.AxisMin = o.AxisMin.slice();
    this.AxisMax = o.AxisMax.slice();
    this.AxisCalibrated = o.AxisCalibrated.slice();
    return this;
  }
}

export class C4ConfigControls {
  GamepadGuiControl = 0;
  MouseAutoScroll = 0;
  UserSets = new $.C4PlayerControlAssignmentSets().init();

  CompileFunc(compiler) {
    if (compiler.isSerializer()) {
      compiler.Default(S("UserSets"));
    }
    compiler.Value$StdNamingDefaultAdapt$C4PlayerControlAssignmentSets$C4PlayerControlAssignmentSets($.mkNamingAdapt$rC4PlayerControlAssignmentSets$pi8$C4PlayerControlAssignmentSets$b$b(this.UserSets, S("UserSets"), new $.C4PlayerControlAssignmentSets().init()));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "MouseAutoScroll"), S("MouseAutoScroll"), 0));
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "GamepadGuiControl"), S("GamepadGuiControl"), 0, false, true));
  }

  ResetKeys() {
    this.UserSets.Clear();
  }

  None() {
    this.UserSets = new $.C4PlayerControlAssignmentSets().init();
    return this;
  }

  $clone() { return new C4ConfigControls().$assign(this); }
  $assign(o) {
    this.GamepadGuiControl = o.GamepadGuiControl;
    this.MouseAutoScroll = o.MouseAutoScroll;
    this.UserSets.$assign(o.UserSets);
    return this;
  }
}

export class C4ConfigSecurity {
  static $layout = [["KeyPath", 0, "i8", 1025], ["WasRegistered", 1028, "i32", 0]];
  static $size = 1032;
  KeyPath = new Int8Array(1025);
  WasRegistered = 0;

  CompileFunc(compiler) {
    compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "WasRegistered"), S("WasRegistered"), 0));
    compiler.Value$StdNamingDefaultAdapt$StdStringAdapt$x$7($.mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$7($.mkStringAdaptM(this.KeyPath), S("KeyPath"), S("$HOME/.clonk/openclonk"), false, true));
  }

  $clone() { return new C4ConfigSecurity().$assign(this); }
  $assign(o) {
    this.KeyPath = o.KeyPath.slice();
    this.WasRegistered = o.WasRegistered;
    return this;
  }
}

export class C4Config {
  General = new C4ConfigGeneral().None();
  Developer = new C4ConfigDeveloper();
  Graphics = new C4ConfigGraphics();
  Sound = new C4ConfigSound();
  Network = new C4ConfigNetwork().None();
  Lobby = new C4ConfigLobby();
  IRC = new C4ConfigIRC();
  Gamepads = $oarr(4, () => new C4ConfigGamepad());
  Controls = new C4ConfigControls().None();
  Startup = new C4ConfigStartup();
  Security = new C4ConfigSecurity();
  ConfigLoaded = false;
  ConfigFilename = new $.StdStrBuf();

  init() {
    this.General = new C4ConfigGeneral().None();
    this.Developer = new C4ConfigDeveloper();
    this.Graphics = new C4ConfigGraphics();
    this.Sound = new C4ConfigSound();
    this.Network = new C4ConfigNetwork().None();
    this.Lobby = new C4ConfigLobby();
    this.IRC = new C4ConfigIRC();
    this.Gamepads = $oarr(4, () => new C4ConfigGamepad());
    this.Controls = new C4ConfigControls().None();
    this.Startup = new C4ConfigStartup();
    this.Security = new C4ConfigSecurity();
    this.ConfigFilename = new $.StdStrBuf();
    C4Config.prototype.Default.call(this);
    return this;
  }

  $dtor() {
    this.ConfigLoaded = false;
  }

  GetSubkeyPath(subkey) {
    if (!('C4Config$GetSubkeyPath$key' in $)) $.C4Config$GetSubkeyPath$key = new Int8Array(1025);
    $.ssprintf$3($.C4Config$GetSubkeyPath$key, S("%s"), subkey);
    return P($.C4Config$GetSubkeyPath$key, 0);
  }

  Default() {
    let Comp = new $.StdCompilerNull();
    Comp.Compile$rC4Config(this);
    this.ConfigLoaded = false;
  }

  Save() {
    try {
      {
        let filename = new $.StdStrBuf();
        this.GetConfigFileName(filename, this.ConfigFilename.getLength() !== 0 ? this.ConfigFilename.getData() : null);
        let IniWrite = new $.StdCompilerINIWrite().None();
        IniWrite.Decompile$C4Config(this);
        IniWrite.getOutput().SaveToFile(filename.getData());
      }
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$Exception) {
        const exception = $e1;
        $.LogF($.LoadResStr(S("IDS_ERR_CONFSAVE")), exception.Msg.getData());
        $delete(exception);
        return false;
      } else {
        throw $e1;
      }
    }
    return true;
  }

  Load(config_file = null) {
    try {
      {
        let filename = new $.StdStrBuf();
        this.GetConfigFileName(filename, config_file);
        let buf = new $.StdStrBuf();
        buf.LoadFromFile(filename.getData());
        if (buf.isNull()) {
          if (config_file == null) {
            let filename$2 = new $.StdStrBuf().init$pi8$b(c$getenv(S("HOME")));
            if (filename$2.op_const_void_() != null) {
              filename$2.op_addAssign$pi8(S("/"));
            }
            filename$2.op_addAssign$pi8(S(".clonk/openclonk"));
            $.CreatePath(StdString.of(filename$2.getData()));
          }
          buf.Ref$pi8(S(" "));
        }
        let IniRead = new $.StdCompilerINIRead().init();
        IniRead.setInput$InT(buf);
        IniRead.Compile$rC4Config(this);
      }
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$Exception) {
        const pExc = $e1;
        $.LogF(S("Error loading configuration: %s"), pExc.Msg.getData());
        $delete(pExc);
        return false;
      } else {
        throw $e1;
      }
    }
    this.General.DeterminePaths();
    if ($.SEqual(this.Network.Nick.getData(), S("Unknown"))) {
      const LocalName = new Int8Array(26);
      $wr(P(LocalName, 0), 0, 0);
      c$gethostname(P(LocalName, 0), 25);
      if ($rd(P(LocalName, 0)) !== 0) {
        this.Network.Nick.Copy$pi8(P(LocalName, 0));
      }
    }
    this.General.DefaultLanguage();
    if ($.Config.Network.PortTCP > 0 && $.Config.Network.PortTCP === $.Config.Network.PortRefServer) {
      $.Log(S("Warning: Network TCP port and reference server port both set to same value - increasing reference server port!"));
      $.Config.Network.PortRefServer = $.Config.Network.PortRefServer + 1 | 0;
      if ($.Config.Network.PortRefServer >= 65536) {
        $.Config.Network.PortRefServer = 11111;
      }
    }
    if ($.Config.Network.PortUDP > 0 && $.Config.Network.PortUDP === $.Config.Network.PortDiscovery) {
      $.Log(S("Warning: Network UDP port and LAN game discovery port both set to same value - increasing discovery port!"));
      $.Config.Network.PortDiscovery = $.Config.Network.PortDiscovery + 1 | 0;
      if ($.Config.Network.PortDiscovery >= 65536) {
        $.Config.Network.PortDiscovery = 11114;
      }
    }
    this.ConfigLoaded = true;
    if (config_file != null) {
      this.ConfigFilename.Copy$pi8(config_file);
    } else {
      this.ConfigFilename.Clear();
    }
    return true;
  }

  Init() {
    return true;
  }

  Registered() {
    return true;
  }

  AtExePath(filename) {
    $.SCopy$pi8$pi8$u64(this.General.ExePath.getData(), P($.AtPathFilename$C4Config, 0), 4096);
    $.SAppend(filename, P($.AtPathFilename$C4Config, 0), 4096);
    return P($.AtPathFilename$C4Config, 0);
  }

  AtTempPath(filename) {
    $.SCopy$pi8$pi8$u64(this.General.TempPath.getData(), P($.AtPathFilename$C4Config, 0), 4096);
    $.SAppend(filename, P($.AtPathFilename$C4Config, 0), 4096);
    return P($.AtPathFilename$C4Config, 0);
  }

  AtTempUpdatePath(filename) {
    $.SCopy$pi8$pi8$u64(P(this.General.TempUpdatePath, 0), P($.AtPathFilename$C4Config, 0), 4095);
    $.AppendBackslash(P($.AtPathFilename$C4Config, 0));
    $.SAppend(filename, P($.AtPathFilename$C4Config, 0), 4096);
    return P($.AtPathFilename$C4Config, 0);
  }

  AtNetworkPath(filename) {
    $.SCopy$pi8$pi8$u64(P(this.General.UserDataPath, 0), P($.AtPathFilename$C4Config, 0), 4096);
    $.SAppend(P(this.Network.WorkPath, 0), P($.AtPathFilename$C4Config, 0), 4096);
    $.SAppend(filename, P($.AtPathFilename$C4Config, 0), 4096);
    return P($.AtPathFilename$C4Config, 0);
  }

  AtScreenshotPath(filename) {
    let len = 0;
    $.SCopy$pi8$pi8$u64(P(this.General.ScreenshotPath, 0), P($.AtPathFilename$C4Config, 0), 4096);
    if ((len = $.SLen(P($.AtPathFilename$C4Config, 0)) | 0) !== 0) {
      if ($.AtPathFilename$C4Config[len - 1 | 0] === 47) {
        $.AtPathFilename$C4Config[len - 1 | 0] = 0;
      }
    }
    if (!$.CreatePath(StdString.of(P($.AtPathFilename$C4Config, 0)))) {
      $.SCopy$pi8$pi8$u64(P(this.General.UserDataPath, 0), P($.AtPathFilename$C4Config, 0), 4096);
    }
    $.AppendBackslash(P($.AtPathFilename$C4Config, 0));
    $.SAppend(filename, P($.AtPathFilename$C4Config, 0), 4096);
    return P($.AtPathFilename$C4Config, 0);
  }

  AtUserDataPath(filename) {
    $.SCopy$pi8$pi8$u64(P(this.General.UserDataPath, 0), P($.AtPathFilename$C4Config, 0), 4096);
    $.SAppend(filename, P($.AtPathFilename$C4Config, 0), 4096);
    return P($.AtPathFilename$C4Config, 0);
  }

  AtUserDataRelativePath(filename) {
    return $.GetRelativePathS(filename, P(this.General.UserDataPath, 0));
  }

  AtSystemDataPath(filename) {
    $.SCopy$pi8$pi8$u64(P(this.General.SystemDataPath, 0), P($.AtPathFilename$C4Config, 0), 4096);
    $.SAppend(filename, P($.AtPathFilename$C4Config, 0), 4096);
    return P($.AtPathFilename$C4Config, 0);
  }

  AtSystemDataRelativePath(filename) {
    return $.GetRelativePathS(filename, P(this.General.SystemDataPath, 0));
  }

  AtRelativePath(filename) {
    let path = $.GetRelativePathS(filename, P(this.General.UserDataPath, 0));
    if ($peq(path, filename)) {
      return $.GetRelativePathS(filename, P(this.General.SystemDataPath, 0));
    }
    return path;
  }

  GetRegistrationData(_field) {
    return S("");
  }

  ForceRelativePath(filename) {
    0;
    let relative = $.GetRelativePathS(filename.getData(), P(this.General.SystemDataPath, 0));
    if (!$peq(relative, filename.getData())) {
      let temp = new $.StdStrBuf();
      temp.Copy$pi8(relative);
      filename.Take$mStdStrBuf(temp);
    } else {
      if ($.IsGlobalPath(filename.getData())) {
        let temp = new $.StdStrBuf();
        temp.Copy$pi8($.GetC4Filename(filename.getData()));
        filename.Take$mStdStrBuf(temp);
      }
    }
  }

  CompileFunc(compiler) {
    compiler.Value$StdNamingAdapt$C4ConfigGeneral($.mkNamingAdapt$rC4ConfigGeneral$pi8(this.General, S("General")));
    compiler.Value$StdNamingAdapt$C4ConfigControls($.mkNamingAdapt$rC4ConfigControls$pi8(this.Controls, S("Controls")));
    for (let i = 0; i < 4; i = i + 1 | 0) {
      compiler.Value$StdNamingAdapt$C4ConfigGamepad($.mkNamingAdapt$rC4ConfigGamepad$pi8(this.Gamepads[i], $.FormatString(S("Gamepad%d"), i).getData()));
    }
    compiler.Value$StdNamingAdapt$C4ConfigGraphics($.mkNamingAdapt$rC4ConfigGraphics$pi8(this.Graphics, S("Graphics")));
    compiler.Value$StdNamingAdapt$C4ConfigSound($.mkNamingAdapt$rC4ConfigSound$pi8(this.Sound, S("Sound")));
    compiler.Value$StdNamingAdapt$C4ConfigNetwork($.mkNamingAdapt$rC4ConfigNetwork$pi8(this.Network, S("Network")));
    compiler.Value$StdNamingAdapt$C4ConfigLobby($.mkNamingAdapt$rC4ConfigLobby$pi8(this.Lobby, S("Lobby")));
    compiler.Value$StdNamingAdapt$C4ConfigIRC($.mkNamingAdapt$rC4ConfigIRC$pi8(this.IRC, S("IRC")));
    compiler.Value$StdNamingAdapt$C4ConfigDeveloper($.mkNamingAdapt$rC4ConfigDeveloper$pi8(this.Developer, S("Developer")));
    compiler.Value$StdNamingAdapt$C4ConfigStartup($.mkNamingAdapt$rC4ConfigStartup$pi8(this.Startup, S("Startup")));
    compiler.Value$StdNamingAdapt$C4ConfigSecurity($.mkNamingAdapt$rC4ConfigSecurity$pi8(this.Security, S("Security")));
  }

  IsCorrupted() {
    return this.General.ConfigResetSafety !== 42 || this.Graphics.ResX === 0;
  }

  RemoveModule(path, modules) {
    return $.SRemoveModule(modules, path);
  }

  IsModule(path, modules) {
    return $.SIsModule(modules, path);
  }

  AddModule(path, modules) {
    return $.SAddModule(modules, path);
  }

  GetConfigFileName(filename, config_file) {
    if (config_file != null) {
      filename.Ref$pi8(config_file);
    } else {
      let home = new $.StdStrBuf().init$pi8$b(c$getenv(S("HOME")));
      if (home.op_const_void_() != null) {
        home.op_addAssign$pi8(S("/"));
      }
      filename.Copy$StdStrBuf(home);
      filename.op_addAssign$pi8(S(".clonk/openclonk/config"));
    }
  }

  CleanupTempUpdateFolder() {
    if ($rd(P(this.General.TempUpdatePath, 0)) !== 0) {
      $.EraseItem(P(this.General.TempUpdatePath, 0));
      $wr(P(this.General.TempUpdatePath, 0), 0, 0);
    }
  }

  MakeTempUpdateFolder() {
    let temp_name = new $.StdStrBuf();
    temp_name.Copy$pi8(this.AtTempPath(S("update")));
    $.MakeTempFilename$pStdStrBuf(temp_name);
    $.SCopy$pi8$pi8(temp_name.getData(), P(this.General.TempUpdatePath, 0));
    $.CreatePath(StdString.of(P(this.General.TempUpdatePath, 0)));
    return P(this.General.TempUpdatePath, 0);
  }

  static ExpandEnvironmentVariables(path, max_length) {
    let home = new $.StdStrBuf().init$pi8$b(c$getenv(S("HOME")));
    let rest = null;
    if (home.op_const_void_() != null && (rest = $.SSearch(path, S("$HOME"))) != null && c$strlen(path) - 5 + home.getLength() <= max_length) {
      c$memmove($padd($padd(rest, home.getLength()), -$.SLen(S("$HOME"))), rest, $.SLen(rest) + 1);
      c$strncpy($padd(rest, -$.SLen(S("$HOME"))), home.getData(), home.getLength());
    }
  }

  $clone() { return new C4Config().$assign(this); }
  $assign(o) {
    this.General.$assign(o.General);
    this.Developer.$assign(o.Developer);
    this.Graphics.$assign(o.Graphics);
    this.Sound.$assign(o.Sound);
    this.Network.$assign(o.Network);
    this.Lobby.$assign(o.Lobby);
    this.IRC.$assign(o.IRC);
    this.Gamepads = $own(o.Gamepads.map(($e0) => $e0.$clone()));
    this.Controls.$assign(o.Controls);
    this.Startup.$assign(o.Startup);
    this.Security.$assign(o.Security);
    this.ConfigLoaded = o.ConfigLoaded;
    this.ConfigFilename.$assign(o.ConfigFilename);
    return this;
  }
}




export function $init(): void {
  $.C4ConfigMaxGamepads$C4Config = 4;
  $.AtPathFilename$C4Config = new Int8Array(4097);
  $.Config = new C4Config(); $.Config.init();
}

Object.assign($, { C4Config, C4ConfigControls, C4ConfigDeveloper, C4ConfigGamepad, C4ConfigGeneral, C4ConfigGeneral$$anon1, C4ConfigGraphics, C4ConfigIRC, C4ConfigLobby, C4ConfigNetwork, C4ConfigSecurity, C4ConfigSound, C4ConfigStartup });
