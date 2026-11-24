// @ts-nocheck
// OpenClonk 36de799: src/game/C4Application.cpp, src/game/C4Application.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { C4AbstractApp } from '../platform/C4App.ts';
import { CStdMultimediaTimerProc } from '../platform/StdScheduler.ts';
import { $getopt, c$atoi, c$getopt_long, c$strlen } from '../../rt/libc.ts';
import { $oat, $own, $padd, $rd, $wr, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, StdString, std_begin, std_end, std_replace } from '../../rt/std.ts';

export class C4Application extends C4AbstractApp {
  static Revision;
  restartAtEnd = false;
  SystemGroup = new $.C4Group().init();
  MusicSystem = new $.C4MusicSystem().init();
  SoundSystem = new $.C4SoundSystem().init();
  pGamePadControl = null;
  InteractiveThread = new $.C4InteractiveThread();
  IRCClient = null;
  argv0 = null;
  isEditor = 0;
  IncomingUpdate = new StdString();
  CheckForUpdates = 0;
  AppState = 0 /*C4AS_None*/;
  pGameTimer = null;
  QuitAfterGame = 0;
  IncomingKeyfile = new StdString();
  NextMission = new StdString();

  init() {
    super.init();
    this.restartAtEnd = false;
    this.SystemGroup = new $.C4Group().init();
    this.MusicSystem = new $.C4MusicSystem().init();
    this.SoundSystem = new $.C4SoundSystem().init();
    this.pGamePadControl = null;
    this.InteractiveThread = new $.C4InteractiveThread().init();
    this.isEditor = 0;
    this.IncomingUpdate = new StdString();
    this.CheckForUpdates = 0;
    this.AppState = 0 /*C4AS_None*/;
    this.pGameTimer = null;
    this.QuitAfterGame = 0;
    this.IncomingKeyfile = new StdString();
    this.NextMission = new StdString();
    this.IRCClient = $.ApplicationIRCClient$C4Application;
    return this;
  }

  $dtor() {
    if (this.pGamePadControl != null) {
      $delete(this.pGamePadControl);
    }
    $.CloseLog();
    super.$dtor();
  }

  Clear$v() {
    $.Game.Clear();
    this.NextMission.clear();
    if (this.pGameTimer != null) {
      $.StdScheduler.prototype.Remove.call(this, this.pGameTimer);
      $delete(this.pGameTimer);
      this.pGameTimer = null;
    }
    this.IRCClient.Close$v();
    this.SystemGroup.Close$v();
    if ($.Languages.HasStringTable()) {
      $.Log($.LoadResStr(S("IDS_PRC_DEINIT")));
    }
    $.Languages.Clear();
    $.Languages.ClearLanguage();
    if (this.pGamePadControl != null) {
      $delete(this.pGamePadControl);
      this.pGamePadControl = null;
    }
    this.MusicSystem.Clear();
    this.SoundSystem.Clear();
    this.RestoreVideoMode();
    $.Console.EditCursor.Clear();
    if ($.pDraw != null) {
      $delete($.pDraw);
      $.pDraw = null;
    }
    $.FullScreen.Clear();
    $.Console.Clear();
    $.CPNGFile.WaitForSaves();
    $.C4AbstractApp.prototype.Clear$v.call(this);
  }

  ClearCommandLine() {
    $wr(P($.Game.PlayerFilenames, 0), 0, 0);
  }

  *GameTick() {
    switch (this.AppState) {
      case 0:
        0;
        break;
      case 6:
        break;
      case 1:
        if (!this.PreInit()) {
          this.Quit$v();
        }
        break;
      case 2:
        this.SoundSystem.Execute();
        this.MusicSystem.Execute();
        if (this.pGamePadControl != null) {
          this.pGamePadControl.Execute();
        }
        break;
      case 3:
        $.C4Startup.CloseStartup();
        this.AppState = 4 /*C4AS_Game*/;
        if (!(yield* $.Game.Init())) {
          if (!$.UserAbort) {
            $.Game.fQuitWithError = true;
          }
          this.QuitGame();
          break;
        }
        if ($.Config.Graphics.Windowed === 2 && this.FullScreenMode()) {
          $.Application.SetVideoMode(this.GetConfigWidth(), this.GetConfigHeight(), $.Config.Graphics.RefreshRate >>> 0, $.Config.Graphics.Monitor >>> 0, true);
        }
        if (this.isEditor === 0) {
          this.pWindow.GrabMouse(true);
        }
        if (this.pGamePadControl != null) {
          this.pGamePadControl.Execute();
        }
        break;
      case 5:
        $.Game.Clear();
        if ($.Config.Graphics.Windowed === 2 && this.NextMission.empty() && this.isEditor === 0) {
          $.Application.SetVideoMode(this.GetConfigWidth(), this.GetConfigHeight(), $.Config.Graphics.RefreshRate >>> 0, $.Config.Graphics.Monitor >>> 0, false);
        }
        if (this.isEditor === 0) {
          this.pWindow.GrabMouse(false);
        }
        this.AppState = 1 /*C4AS_PreInit*/;
        if (!this.NextMission.empty()) {
          $.Game.SetScenarioFilename(this.NextMission.c_str());
          $.Game.fLobby = $.Game.NetworkActive;
          $.Game.fObserve = false;
          this.NextMission.clear();
        }
        break;
      case 4:
        if ($.Game.IsRunning) {
          $.Game.Execute();
        }
        this.SoundSystem.Execute();
        this.MusicSystem.Execute();
        if (this.pGamePadControl != null) {
          this.pGamePadControl.Execute();
        }
        break;
    }
  }

  Draw$v() {
    if (this.isEditor === 0) {
      $.FullScreen.Execute();
    } else {
      $.Console.Execute();
    }
  }

  OpenSystemGroup() {
    return this.SystemGroup.IsOpen() || this.SystemGroup.Open(S("System.ocg"));
  }

  CloseSystemGroup() {
    this.SystemGroup.Close$v();
  }

  SetGameTickDelay$i32(iDelay) {
    if (this.pGameTimer == null) {
      return;
    }
    this.pGameTimer.SetGameTickDelay$u32(iDelay >>> 0);
  }

  OnResolutionChanged(iXRes, iYRes) {
    if ($.pDraw != null) {
      $.Game.OnResolutionChanged(iXRes, iYRes);
      $.pDraw.OnResolutionChanged(iXRes, iYRes);
    }
    if (this.pWindow != null) {
      if (this.pWindow.pSurface != null) {
        this.pWindow.pSurface.UpdateSize(iXRes | 0, iYRes | 0);
      }
      if (!this.FullScreenMode()) {
        let r = new $.C4Rect();
        this.pWindow.GetSize(r);
        $.Config.Graphics.WindowX = r.Wdt;
        $.Config.Graphics.WindowY = r.Hgt;
      }
    }
  }

  OnKeyboardLayoutChanged() {
    $.Game.OnKeyboardLayoutChanged();
    if (this.AppState === 2) {
      $.C4Startup.Get().OnKeyboardLayoutChanged();
    }
  }

  SetGameFont(szFontFace, iFontSize) {
    if (szFontFace == null || szFontFace.a[szFontFace.o] === 0 || iFontSize < 1 || $.SLen(szFontFace) >= 1025) {
      return false;
    }
    let TestFont = new $.CStdFont().init();
    if (!$.FontLoader.InitFont(TestFont, szFontFace, 2 /*C4FT_Main*/, iFontSize, $.GraphicsResource.Files)) {
      return false;
    }
    let sOldFont = new $.StdStrBuf();
    sOldFont.Copy$pi8(P($.Config.General.RXFontName, 0));
    let iOldFontSize = $.Config.General.RXFontSize;
    $.SCopy$pi8$pi8(szFontFace, P($.Config.General.RXFontName, 0));
    $.Config.General.RXFontSize = iFontSize;
    if (!$.GraphicsResource.InitFonts() || !$.C4Startup.Get().Graphics.InitFonts()) {
      $.SCopy$pi8$pi8(sOldFont.getData(), P($.Config.General.RXFontName, 0));
      $.Config.General.RXFontSize = iOldFontSize;
      return false;
    }
    return true;
  }

  NextTick() {
    if (this.pGameTimer == null) {
      return;
    }
    this.pGameTimer.Set$v();
  }

  Quit$v() {
    if ($.Config.ConfigLoaded) {
      $.Config.Save();
    }
    $.C4Startup.Unload();
    $.GraphicsResource.ClearFonts();
    $.C4AbstractApp.prototype.Quit$v.call(this);
    this.AppState = 6 /*C4AS_Quit*/;
  }

  OpenGame(scenario = null) {
    if (this.AppState === 2) {
      if (scenario != null) {
        $.Game.SetScenarioFilename(scenario);
      }
      this.AppState = 3 /*C4AS_StartGame*/;
    } else {
      this.SetNextMission(scenario);
      this.AppState = 5 /*C4AS_AfterGame*/;
    }
  }

  QuitGame() {
    if (this.QuitAfterGame === 0 || !this.NextMission.empty()) {
      this.AppState = 5 /*C4AS_AfterGame*/;
    } else {
      this.Quit$v();
    }
  }

  Activate() {
  }

  SetNextMission(szMissionFilename) {
    if (szMissionFilename != null) {
      this.NextMission.assign(szMissionFilename);
      std_replace(std_begin(this.NextMission), std_end(this.NextMission), 92, 47);
    } else {
      this.NextMission.clear();
    }
  }

  OnCommand$pi8(szCmd) {
    if (this.AppState === 4) {
      $.MessageInput.ProcessInput(szCmd);
    } else if (this.AppState === 2) {
      this.AppState = 1 /*C4AS_PreInit*/;
      $.Game.SetScenarioFilename(szCmd);
    }
  }

  IsQuittingGame() {
    return this.AppState >= 5;
  }

  GetRevision() {
    return C4Application.Revision.c_str();
  }

  FullScreenMode() {
    if (this.isEditor !== 0) {
      return false;
    }
    if ($.Config.Graphics.Windowed === 0) {
      return true;
    }
    if ($.Config.Graphics.Windowed === 2 && $.Game.IsRunning) {
      return true;
    }
    return false;
  }

  GetConfigWidth() {
    return !this.FullScreenMode() ? $.Config.Graphics.WindowX : $.Config.Graphics.ResX;
  }

  GetConfigHeight() {
    return !this.FullScreenMode() ? $.Config.Graphics.WindowY : $.Config.Graphics.ResY;
  }

  DoInit$i32$ppi8(argc, argv) {
    0;
    let sConfigFilename = new $.StdStrBuf();
    for (let iPar = 0; iPar < argc; iPar = iPar + 1 | 0) {
      if ($.SEqual2NoCase(argv.a[argv.o + iPar], S("--config="))) {
        sConfigFilename.Copy$pi8($padd(argv.a[argv.o + iPar], 9));
      }
    }
    $.Config.Init();
    $.Config.Load(sConfigFilename.getData());
    $.Config.Save();
    if ($.Config.IsCorrupted()) {
      if (sConfigFilename.op_const_void_() != null) {
        $.Log(S("ERROR: Custom configuration corrupted - program abort!\n"));
        return false;
      } else {
        $.Log(S("Warning: Configuration corrupted - restoring default!\n"));
        $.Config.Default();
        $.Config.Save();
        $.Config.Load();
      }
    }
    $.OpenLog();
    $.Log(S("OpenClonk"));
    $.LogF(S("Version: %s %s (%s - %s)"), S("9.0-alpha unix"), S("linux-x86_64"), this.GetRevision(), S("2026-11-14 14:21:48 +0100"));
    $.LogF(S("ExePath: \"%s\""), $.Config.General.ExePath.getData());
    $.LogF(S("SystemDataPath: \"%s\""), P($.Config.General.SystemDataPath, 0));
    $.LogF(S("UserDataPath: \"%s\""), P($.Config.General.UserDataPath, 0));
    $.C4Group_SetProcessCallback(C4Application.ProcessCallback$pi8$i32);
    $.C4Group_SetTempPath($.Config.General.TempPath.getData());
    $.C4Group_SetSortList(P($.C4CFN_FLS, 0));
    $.Config.CleanupTempUpdateFolder();
    $.Reloc.Init();
    if (!$.Reloc.Open(this.SystemGroup, S("System.ocg"))) {
      let szMessage = S("Error opening system group file (System.ocg)!");
      $.Log(szMessage);
      this.MessageDialog(szMessage);
      return false;
    }
    this.ParseCommandLine(argc, argv);
    $.OpenExtraLogs();
    $.Languages.Init();
    if (!$.Languages.LoadLanguage(P($.Config.General.LanguageEx, 0))) {
      if (!$.Languages.HasStringTable()) {
        $.Log(S("WARNING: No language string table loaded!"));
      }
    }
    if ($.Config.Graphics.Windowed === 0) {
      this.ApplyResolutionConstraints();
    }
    this.Active = true;
    if (this.isEditor === 0) {
      if (!((this.pWindow = $.FullScreen.Init$pC4AbstractApp(this)) != null)) {
        this.Clear$v();
        $.ShowGfxErrorDialog();
        return false;
      }
    } else {
      if (!((this.pWindow = $.Console.Init$pC4AbstractApp(this)) != null)) {
        this.Clear$v();
        return false;
      }
    }
    $.StdScheduler.prototype.Add$pStdSchedulerProc.call(this, this.pGameTimer = new C4ApplicationGameTimer().init());
    let success = $.DDrawInit(this, this.GetConfigWidth() >>> 0, this.GetConfigHeight() >>> 0, $.Config.Graphics.Monitor >>> 0);
    if (!success) {
      $.LogFatal($.LoadResStr(S("IDS_ERR_DDRAW")));
      this.Clear$v();
      $.ShowGfxErrorDialog();
      return false;
    }
    if (this.isEditor === 0) {
      if (!this.SetVideoMode($.Application.GetConfigWidth(), $.Application.GetConfigHeight(), $.Config.Graphics.RefreshRate >>> 0, $.Config.Graphics.Monitor >>> 0, $.Config.Graphics.Windowed === 0)) {
        this.pWindow.SetSize($.Config.Graphics.WindowX >>> 0, $.Config.Graphics.WindowY >>> 0);
      }
    }
    if (this.pGamePadControl == null && $.Config.General.GamepadEnabled) {
      this.pGamePadControl = new $.C4GamePadControl().init();
    }
    this.AppState = 1 /*C4AS_PreInit*/;
    return true;
  }

  ParseCommandLine(argc, argv) {
    let $t1;
    this.argv0 = argv.a[argv.o + 0];
    let CmdLine = new $.StdStrBuf().init$pi8$b(S("Command line:"));
    for (let i = 0; i < argc; i = i + 1 | 0) {
      CmdLine.Append$pi8(S(" "));
      CmdLine.Append$pi8(argv.a[argv.o + i]);
    }
    $.Log(CmdLine.getData());
    this.ClearCommandLine();
    $.Game.NetworkActive = false;
    this.isEditor = 2;
    let c = 0;
    while (true) {
      if (!('C4Application$ParseCommandLine$long_options' in $)) $.C4Application$ParseCommandLine$long_options = $own([
  { name: S("editor"), has_arg: 0, flag: P(this, "isEditor"), val: 1 },
  { name: S("fullscreen"), has_arg: 0, flag: P(this, "isEditor"), val: 0 },
  { name: S("debugwait"), has_arg: 0, flag: P($.Game, "DebugWait"), val: 1 },
  { name: S("update"), has_arg: 0, flag: P(this, "CheckForUpdates"), val: 1 },
  { name: S("noruntimejoin"), has_arg: 0, flag: P($.Config.Network, "NoRuntimeJoin"), val: 1 },
  { name: S("runtimejoin"), has_arg: 0, flag: P($.Config.Network, "NoRuntimeJoin"), val: 0 },
  { name: S("noleague"), has_arg: 0, flag: P($.Config.Network, "LeagueServerSignUp"), val: 0 },
  { name: S("league"), has_arg: 0, flag: P($.Config.Network, "LeagueServerSignUp"), val: 1 },
  { name: S("nosignup"), has_arg: 0, flag: P($.Config.Network, "MasterServerSignUp"), val: 0 },
  { name: S("signup"), has_arg: 0, flag: P($.Config.Network, "MasterServerSignUp"), val: 1 },
  { name: S("debugrecread"), has_arg: 1, flag: null, val: 75 },
  { name: S("debugrecwrite"), has_arg: 1, flag: null, val: 119 },
  { name: S("client"), has_arg: 1, flag: null, val: 99 },
  { name: S("host"), has_arg: 0, flag: null, val: 104 },
  { name: S("debughost"), has_arg: 1, flag: null, val: 72 },
  { name: S("debugpass"), has_arg: 1, flag: null, val: 80 },
  { name: S("debug"), has_arg: 1, flag: null, val: 68 },
  { name: S("data"), has_arg: 1, flag: null, val: 100 },
  { name: S("startup"), has_arg: 1, flag: null, val: 115 },
  { name: S("stream"), has_arg: 1, flag: null, val: 101 },
  { name: S("recdump"), has_arg: 1, flag: null, val: 82 },
  { name: S("comment"), has_arg: 1, flag: null, val: 109 },
  { name: S("pass"), has_arg: 1, flag: null, val: 112 },
  { name: S("udpport"), has_arg: 1, flag: null, val: 117 },
  { name: S("tcpport"), has_arg: 1, flag: null, val: 116 },
  { name: S("join"), has_arg: 1, flag: null, val: 106 },
  { name: S("language"), has_arg: 1, flag: null, val: 76 },
  { name: S("scenpar"), has_arg: 1, flag: null, val: 83 },
  { name: S("observe"), has_arg: 0, flag: null, val: 111 },
  { name: S("nonetwork"), has_arg: 0, flag: null, val: 78 },
  { name: S("network"), has_arg: 0, flag: null, val: 110 },
  { name: S("record"), has_arg: 0, flag: null, val: 114 },
  { name: S("lobby"), has_arg: 2, flag: null, val: 108 },
  { name: S("debug-opengl"), has_arg: 0, flag: P($.Config.Graphics, "DebugOpenGL"), val: 1 },
  { name: S("config"), has_arg: 1, flag: null, val: 0 },
  { name: S("show-licenses"), has_arg: 0, flag: null, val: 0 },
  { name: null, has_arg: 0, flag: null, val: 0 },
]);
      const option_index = [0];
      c = c$getopt_long(argc, argv, S("abc:d:f:"), $oat($.C4Application$ParseCommandLine$long_options, 0), P(option_index, 0));
      if (c === -1) {
        break;
      }
      switch (c) {
        case 0:
          if ($.SEqualNoCase($.C4Application$ParseCommandLine$long_options[option_index[0]].name, S("signup"))) {
            $.Game.NetworkActive = true;
          }
          if ($.SEqualNoCase($.C4Application$ParseCommandLine$long_options[option_index[0]].name, S("league"))) {
            $.Game.NetworkActive = true;
            $.Config.Network.MasterServerSignUp = 1;
          }
          if ($.SEqualNoCase($.C4Application$ParseCommandLine$long_options[option_index[0]].name, S("show-licenses"))) {
            let sep = StdString.of(S("\n=================================\n"));
            for (const license of $.OCLicenses) {
              $.Log(sep.plus(license.path).plus(S(": ")).plus(license.name).plus(sep).plus(license.content).plus(S("\n")).c_str());
            }
            this.Quit$v();
          }
          break;
        case 108:
          $.Game.fLobby = true;
          if ($getopt.optarg != null) {
            $.Game.iLobbyTimeout = c$atoi($getopt.optarg);
            if ($.Game.iLobbyTimeout < 0) {
              $.Game.iLobbyTimeout = 0;
            }
          }
          break;
        case 111:
          $.Game.fObserve = true;
          break;
        case 106:
          $.Game.NetworkActive = true;
          $.SCopy$pi8$pi8$u64($getopt.optarg, P($.Game.DirectJoinAddress, 0), 4096);
          break;
        case 75:
          if ($getopt.optarg != null && $getopt.optarg.a[$getopt.optarg.o + 0] !== 0) {
            $.LogF(S("Reading from DebugRec file '%s'"), $getopt.optarg);
            $.SCopy$pi8$pi8$u64($getopt.optarg, P($.Config.General.DebugRecExternalFile, 0), 4096);
          } else {
            $.Log(S("Reading DebugRec from CtrlRec file in scenario record"));
          }
          $.Config.General.DebugRec = 1;
          $.Config.General.DebugRecWrite = 0;
          break;
        case 119:
          if ($getopt.optarg != null && $getopt.optarg.a[$getopt.optarg.o + 0] !== 0) {
            $.LogF(S("Writing to DebugRec file '%s'"), $getopt.optarg);
            $.SCopy$pi8$pi8$u64($getopt.optarg, P($.Config.General.DebugRecExternalFile, 0), 4096);
          } else {
            $.Log(S("Writing DebugRec to CtrlRec file in scenario record"));
          }
          $.Config.General.DebugRec = 1;
          $.Config.General.DebugRecWrite = 1;
          break;
        case 114:
          $.Game.Record = true;
          break;
        case 110:
          $.Game.NetworkActive = true;
          break;
        case 78:
          $.Game.NetworkActive = false;
          break;
        case 76:
          $.SCopy$pi8$pi8$u64($getopt.optarg, P($.Config.General.LanguageEx, 0), 1024);
          break;
        case 116:
          $.Config.Network.PortTCP = c$atoi($getopt.optarg);
          break;
        case 117:
          $.Config.Network.PortUDP = c$atoi($getopt.optarg);
          break;
        case 112:
          $.Network.SetPassword($getopt.optarg);
          break;
        case 109:
          $.Config.Network.Comment.CopyValidated$pi8($getopt.optarg);
          break;
        case 82:
          $.Game.RecordDumpFile.Copy$pi8($getopt.optarg);
          break;
        case 101:
          $.Game.RecordStream.Copy$pi8($getopt.optarg);
          break;
        case 115:
          $.C4Startup.SetStartScreen($getopt.optarg);
          break;
        case 100:
          $.Reloc.AddPath($getopt.optarg);
          break;
        case 68:
          $.Game.DebugPort = c$atoi($getopt.optarg) & 0xffff;
          break;
        case 80:
          $.StdStrBuf.prototype.op_assign$pi8.call($.Game.DebugPassword, $getopt.optarg);
          break;
        case 72:
          $.StdStrBuf.prototype.op_assign$pi8.call($.Game.DebugHost, $getopt.optarg);
          break;
        case 83:
          {
            let sopt = new $.StdStrBuf();
            let soptval = new $.StdStrBuf();
            sopt.Copy$pi8($getopt.optarg);
            let val = 1;
            if (sopt.SplitAtChar(61, soptval)) {
              val = c$atoi(soptval.getData());
            }
            $.Game.StartupScenarioParameters.SetValue(sopt.getData(), val, false);
          }
          break;
        case 104:
          $.Game.NetworkActive = true;
          $.Game.fLobby = true;
          $.Config.Network.PortTCP = 11112;
          $.Config.Network.PortUDP = 11113;
          $.Config.Network.MasterServerSignUp = $.Config.Network.LeagueServerSignUp = 0;
          break;
        case 99:
          $.Game.NetworkActive = true;
          $.SCopy$pi8$pi8$u64(S("localhost"), P($.Game.DirectJoinAddress, 0), 4096);
          $.Game.fLobby = true;
          $.Config.Network.PortTCP = 11112 + Math.imul(2, c$atoi($getopt.optarg) + 1 | 0) | 0;
          $.Config.Network.PortUDP = 11113 + Math.imul(2, c$atoi($getopt.optarg) + 1 | 0) | 0;
          break;
        case 63:
          break;
        default:
          0;
      }
    }
    if ($.Config.Network.MasterServerSignUp === 0) {
      $.Config.Network.LeagueServerSignUp = 0;
    }
    if ($.Game.fObserve || $.Game.fLobby) {
      $.Game.NetworkActive = true;
    }
    while ($getopt.optind < argc) {
      let szParameter = argv.a[argv.o + ($t1 = $getopt.optind, $getopt.optind = $getopt.optind + 1 | 0, $t1)];
      {
        let iLen = $.SLen(szParameter) | 0;
        if (iLen > 5 && szParameter.a[szParameter.o + (iLen - 1 | 0)] === 47 && szParameter.a[szParameter.o + (iLen - 5 | 0)] === 46 && szParameter.a[szParameter.o + (iLen - 4 | 0)] === 111 && szParameter.a[szParameter.o + (iLen - 3 | 0)] === 99) {
          szParameter.a[szParameter.o + (iLen - 1 | 0)] = 0;
        }
      }
      if ($.SEqualNoCase($.GetExtension$2(szParameter), S("ocs"))) {
        if ($.IsGlobalPath(szParameter)) {
          $.Game.SetScenarioFilename(szParameter);
        } else {
          $.Game.SetScenarioFilename(StdString.of($.GetWorkingDirectory()).plus(S("/")).plus(szParameter).c_str());
        }
        continue;
      }
      if ($.SEqualNoCase($.GetFilename$2(szParameter), S("scenario.txt"))) {
        $.Game.SetScenarioFilename(szParameter);
        continue;
      }
      if ($.SEqualNoCase($.GetExtension$2(szParameter), S("ocp"))) {
        if ($.IsGlobalPath(szParameter)) {
          $.SAddModule(P($.Game.PlayerFilenames, 0), szParameter);
        } else {
          $.SAddModule(P($.Game.PlayerFilenames, 0), StdString.of($.GetWorkingDirectory()).plus(S("/")).plus(szParameter).c_str());
        }
        continue;
      }
      if ($.SEqualNoCase($.GetExtension$2(szParameter), S("ocd"))) {
        $.SAddModule(P($.Game.DefinitionFilenames, 0), szParameter);
        continue;
      }
      if ($.SEqualNoCase($.GetExtension$2(szParameter), S("c4k"))) {
        $.Application.IncomingKeyfile.assign(szParameter);
        continue;
      }
      if ($.SEqualNoCase($.GetExtension$2(szParameter), S("ocu"))) {
        $.Application.IncomingUpdate.assign(szParameter);
        continue;
      }
      if ($.SEqualNoCase($.GetExtension$2(szParameter), S("c4r"))) {
        $.Game.RecordStream.Copy$pi8(szParameter);
      }
      if ($.SEqual2NoCase(szParameter, S("clonk:")) || $.SEqual2NoCase(szParameter, S("openclonk:"))) {
        $.SCopy$pi8$pi8$u64($.SAdvancePast(szParameter, 58), P($.Game.DirectJoinAddress, 0), 4096);
        $.SClearFrontBack(P($.Game.DirectJoinAddress, 0), 47);
        if ($.SEqualNoCase(P($.Game.DirectJoinAddress, 0), S("update"))) {
          $.Application.CheckForUpdates = 1;
          $.Game.DirectJoinAddress[0] = 0;
          continue;
        }
        let install_mod_command = S("installmod");
        let install_mod_command_length = c$strlen(install_mod_command);
        if ($.SEqualNoCase(P($.Game.DirectJoinAddress, 0), install_mod_command, install_mod_command_length | 0)) {
          let id = $padd(P($.Game.DirectJoinAddress, 0), install_mod_command_length);
          if ($.SLen(id) > 1) {
            id = id.add(1);
            $.C4Startup.SetStartScreen(S("mods"), id);
          }
          $.Game.DirectJoinAddress[0] = 0;
          continue;
        }
        $.Game.NetworkActive = true;
        continue;
      }
    }
    if (this.isEditor === 2) {
      this.isEditor = !!($rd(P($.Game.ScenarioFilename, 0)) !== 0) && $.Config.General.OpenScenarioInGameMode === 0 ? 1 : 0;
    }
    $.Game.Record = $.Game.Record || $.Config.Network.LeagueServerSignUp !== 0 && $.Game.NetworkActive;
    this.QuitAfterGame = this.isEditor === 0 && $.Game.HasScenario() ? 1 : 0;
  }

  PreInit() {
    let fUseStartupDialog = !$.Game.HasScenario();
    $.Game.SetInitProgress(0);
    $.Log($.LoadResStr(S("IDS_PRC_GFXRES")));
    if (!$.GraphicsResource.Init()) {
      return false;
    }
    $.Game.SetInitProgress(fUseStartupDialog ? 10 : 1);
    if (this.isEditor === 0) {
      if ($.Config.Graphics.ShowStartupMessages !== 0 || $.Game.NetworkActive) {
        let cgo = new $.C4Facet().init$v();
        cgo.Set$pC4Surface$f32$f32$f32$f32($.FullScreen.pSurface, Math.fround(0), Math.fround(0), Math.fround($.GetScreenWdt()), Math.fround($.GetScreenHgt()));
        $.GraphicsSystem.MessageBoard.Init(cgo, true);
      }
    }
    if (fUseStartupDialog && this.isEditor === 0) {
      if (!$.GraphicsSystem.InitLoaderScreen(S("StartupMainMenuBG"))) {
        $.LogFatal($.LoadResStr(S("IDS_PRC_ERRLOADER")));
        return false;
      }
    }
    $.Game.SetInitProgress(fUseStartupDialog ? 20 : 2);
    if (!$.Game.PreInit()) {
      return false;
    }
    if (!this.MusicSystem.Init(S("frontend"))) {
      $.Log($.LoadResStr(S("IDS_PRC_NOMUSIC")));
    }
    $.Game.SetInitProgress(fUseStartupDialog ? 34 : 2);
    if (!this.SoundSystem.Init()) {
      $.Log($.LoadResStr(S("IDS_PRC_NOSND")));
    }
    if (fUseStartupDialog && this.isEditor === 0 && $.Config.Sound.FEMusic !== 0) {
      this.MusicSystem.Play$pi8$b$i32$f64$b();
    }
    $.Game.SetInitProgress(fUseStartupDialog ? 35 : 3);
    if (fUseStartupDialog) {
      this.AppState = 2 /*C4AS_Startup*/;
      $.Game.Record = $.Game.Record || $.Config.General.DefRec !== 0;
      if (this.isEditor === 0) {
        $.C4Startup.InitStartup();
      }
    } else {
      this.AppState = 3 /*C4AS_StartGame*/;
    }
    return true;
  }

  static ProcessCallback$pi8$i32(szMessage, _iProcess) {
    $.Console.Out(szMessage);
    return true;
  }

  ApplyResolutionConstraints() {
    if ($.Config.Graphics.ResX === -1 && $.Config.Graphics.ResY === -1) {
      return;
    }
    let idx = -1;
    const iXRes = [0];
    const iYRes = [0];
    const iBitDepth = [0];
    const iRefreshRate = [0];
    let best_match = -1;
    let best_delta = 0xffffffff;
    while (this.GetIndexedDisplayMode((idx = idx + 1 | 0), P(iXRes, 0), P(iYRes, 0), P(iBitDepth, 0), P(iRefreshRate, 0), $.Config.Graphics.Monitor >>> 0)) {
      if (iBitDepth[0] !== 32) {
        continue;
      }
      let delta = (Math.abs(Math.imul($.Config.Graphics.ResX, $.Config.Graphics.ResY) - Math.imul(iXRes[0], iYRes[0]) | 0) | 0) >>> 0;
      if (delta === 0 && iBitDepth[0] === 32 && iRefreshRate[0] === $.Config.Graphics.RefreshRate) {
        return;
      }
      if (delta < best_delta) {
        best_match = idx;
        best_delta = delta;
      }
    }
    if (best_match !== -1) {
      this.GetIndexedDisplayMode(best_match, P(iXRes, 0), P(iYRes, 0), P(iBitDepth, 0), P(iRefreshRate, 0), $.Config.Graphics.Monitor >>> 0);
      if (iXRes[0] !== $.Config.Graphics.ResX || iYRes[0] !== $.Config.Graphics.ResY) {
        $.LogF(S("Warning: The selected resolution %dx%d is not available and has been changed to %dx%d."), $.Config.Graphics.ResX, $.Config.Graphics.ResY, iXRes[0], iYRes[0]);
      }
      $.Config.Graphics.ResX = iXRes[0];
      $.Config.Graphics.ResY = iYRes[0];
      $.Config.Graphics.RefreshRate = iRefreshRate[0];
    }
  }

  $clone() { return new C4Application().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.restartAtEnd = o.restartAtEnd;
    this.SystemGroup.$assign(o.SystemGroup);
    this.MusicSystem.$assign(o.MusicSystem);
    this.SoundSystem.$assign(o.SoundSystem);
    this.pGamePadControl = o.pGamePadControl;
    this.InteractiveThread.$assign(o.InteractiveThread);
    this.IRCClient = o.IRCClient;
    this.argv0 = o.argv0;
    this.isEditor = o.isEditor;
    this.IncomingUpdate = o.IncomingUpdate.$clone();
    this.CheckForUpdates = o.CheckForUpdates;
    this.AppState = o.AppState;
    this.pGameTimer = o.pGameTimer;
    this.QuitAfterGame = o.QuitAfterGame;
    this.IncomingKeyfile = o.IncomingKeyfile.$clone();
    this.NextMission = o.NextMission.$clone();
    return this;
  }
}

export class C4ApplicationGameTimer extends CStdMultimediaTimerProc {
  tLastGameTick = new $.C4TimeMilliseconds();
  iGameTickDelay = 28;
  iExtraGameTickDelay = 0;

  init() {
    super.init(26);
    this.tLastGameTick = new $.C4TimeMilliseconds().init$i32(-1 /*NegativeInfinity*/);
    this.iGameTickDelay = 28;
    this.iExtraGameTickDelay = 0;
    return this;
  }

  SetGameTickDelay$u32(iDelay) {
    this.iGameTickDelay = iDelay;
    if (iDelay < $.Config.Graphics.MaxRefreshDelay >>> 0) {
      this.SetDelay(iDelay);
      this.iExtraGameTickDelay = 0;
    } else {
      this.SetDelay($.Config.Graphics.MaxRefreshDelay >>> 0);
      this.iExtraGameTickDelay = iDelay;
    }
  }

  *Execute$i32$ppollfd(_iTimeout, _1) {
    if (!this.CheckAndReset()) {
      return true;
    }
    let tNow = $.C4TimeMilliseconds.Now();
    if ($.op_ge(tNow, $.op_add$C4TimeMilliseconds$u32(this.tLastGameTick.$clone(), this.iExtraGameTickDelay)) || $.Game.GameGo) {
      if (this.iGameTickDelay !== 0) {
        this.tLastGameTick.op_addAssign(this.iGameTickDelay);
      } else {
        this.tLastGameTick.$assign(tNow);
      }
      if ($.op_gt(tNow, $.op_add$C4TimeMilliseconds$u32(this.tLastGameTick.$clone(), this.iGameTickDelay))) {
        this.tLastGameTick.op_addAssign(($.op_sub$C4TimeMilliseconds$C4TimeMilliseconds(tNow, this.tLastGameTick) / 2 | 0) >>> 0);
      }
      (yield* $.Application.GameTick());
    }
    if (!$.Game.DoSkipFrame) {
      let tPreGfxTime = $.C4TimeMilliseconds.Now();
      $.Application.Draw$v();
      $.Game.DoSkipFrame = $.Game.Parameters.AutoFrameSkip && $.op_lt($.op_add$C4TimeMilliseconds$u32(tPreGfxTime.$clone(), this.iGameTickDelay), $.C4TimeMilliseconds.Now());
    } else {
      $.Game.DoSkipFrame = false;
    }
    return true;
  }

  IsLowPriority() {
    return true;
  }

  $clone() { return new C4ApplicationGameTimer().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.tLastGameTick.$assign(o.tLastGameTick);
    this.iGameTickDelay = o.iGameTickDelay;
    this.iExtraGameTickDelay = o.iExtraGameTickDelay;
    return this;
  }
}


export function $init(): void {
  C4Application.Revision = StdString.of(S("03ccc8a1b088"));
  $.ApplicationIRCClient$C4Application = new $.C4Network2IRCClient(); $.ApplicationIRCClient$C4Application.init();
}

Object.assign($, { C4Application, C4ApplicationGameTimer });
