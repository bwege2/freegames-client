// @ts-nocheck
// OpenClonk 36de799: src/game/C4Game.cpp, src/game/C4Game.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { C4ApplicationSec1Timer } from '../platform/StdScheduler.ts';
import { $u64n, ftoi32, u64 } from '../../rt/int.ts';
import { c$memset, c$strlen, c$strncpy, c$time } from '../../rt/libc.ts';
import { FixedRandom, Random } from '../../rt/native.ts';
import { $bytesView, $cs, $oarr, $oat, $oidx, $own, $padd, $peq, $rd, $ta, $wr, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $fill_list, $max, $min, $throw, $vpush, HashMap, StdPair, StdString } from '../../rt/std.ts';

export class C4Game {
  static DirectJoinFilePrefix;
  Parameters = null;
  StartupScenarioParameters = null;
  Clients = null;
  Teams = null;
  PlayerInfos = null;
  RestorePlayerInfos = null;
  RoundResults = null;
  C4S = new $.C4Scenario().init();
  ScenarioParameterDefs = null;
  Info = new $.C4ComponentHost().init();
  Title = new $.C4ComponentHost().init();
  Names = new $.C4ComponentHost().init();
  GameText = new $.C4ComponentHost().init();
  MainSysLangStringTable = new $.C4LangStringTable().init();
  ScenarioLangStringTable = new $.C4LangStringTable().init();
  PlayerNames = new $.StdStrBuf();
  Input = null;
  PathFinder = new $.C4PathFinder().init();
  TransferZones = new $.C4TransferZones().init();
  ScenarioFile = new $.C4Group().init();
  GroupSet = new $.C4GroupSet().init();
  pParentGroup = null;
  Extra = new $.C4Extra().init();
  pScenarioObjectsScript = null;
  pScenarioSections = null;
  pCurrentScenarioSection = null;
  PlayerControlDefs = new $.C4PlayerControlDefs().init();
  PlayerControlUserAssignmentSets = new $.C4PlayerControlAssignmentSets().init();
  PlayerControlDefaultAssignmentSets = new $.C4PlayerControlAssignmentSets().init();
  Scoreboard = new $.C4Scoreboard();
  pNetworkStatistics = null;
  KeyboardInput = null;
  pFileMonitor = null;
  pSec1Timer = null;
  GlobalSoundModifier = null;
  CurrentScenarioSection = new Int8Array(31);
  ScenarioFilename = new Int8Array(4097);
  ScenarioTitle = new $.StdCopyStrBuf();
  PlayerFilenames = new Int8Array(81921);
  DefinitionFilenames = new Int8Array(81921);
  DirectJoinAddress = new Int8Array(4097);
  DirectJoinTempFilename = new Int8Array(4097);
  pJoinReference = null;
  StartupPlayerCount = 0;
  StartupTeamCount = 0;
  FPS = 0;
  cFPS = 0;
  HaltCount = 0;
  InitialPlayersJoined = false;
  GameOver = false;
  EvaluateOnAbort = false;
  Evaluated = false;
  GameOverDlgShown = false;
  fScriptCreatedObjects = false;
  fLobby = false;
  iLobbyTimeout = 0;
  fObserve = false;
  fReferenceDefinitionOverride = false;
  NetworkActive = false;
  Record = false;
  RecordDumpFile = new $.StdStrBuf();
  RecordStream = new $.StdStrBuf();
  TempScenarioFile = new $.StdStrBuf();
  fPreinited = false;
  FrameCounter = 0;
  iTick2 = 0;
  iTick3 = 0;
  iTick5 = 0;
  iTick10 = 0;
  iTick35 = 0;
  iTick255 = 0;
  iTick1000 = 0;
  TimeGo = false;
  Time = 0;
  StartTime = 0;
  InitProgress = 0;
  LastInitProgress = 0;
  LastInitProgressShowTime = 0;
  RandomSeed = 0;
  GameGo = false;
  FullSpeed = false;
  FrameSkip = 0;
  DoSkipFrame = false;
  fResortAnyObject = false;
  IsRunning = false;
  PointersDenumerated = false;
  StartupLogPos = 0;
  QuitLogPos = 0;
  fQuitWithError = false;
  DebugMode = false;
  NextMission = new $.StdCopyStrBuf();
  NextMissionText = new $.StdCopyStrBuf();
  NextMissionDesc = new $.StdCopyStrBuf();
  DebugPort = 0;
  DebugPassword = new $.StdStrBuf();
  DebugHost = new $.StdStrBuf();
  DebugWait = 0;
  ScriptGuiRoot = null;

  init() {
    this.C4S = new $.C4Scenario().init();
    this.Info = new $.C4ComponentHost().init();
    this.Title = new $.C4ComponentHost().init();
    this.Names = new $.C4ComponentHost().init();
    this.GameText = new $.C4ComponentHost().init();
    this.MainSysLangStringTable = new $.C4LangStringTable().init();
    this.ScenarioLangStringTable = new $.C4LangStringTable().init();
    this.PlayerNames = new $.StdStrBuf();
    this.PathFinder = new $.C4PathFinder().init();
    this.TransferZones = new $.C4TransferZones().init();
    this.ScenarioFile = new $.C4Group().init();
    this.GroupSet = new $.C4GroupSet().init();
    this.Extra = new $.C4Extra().init();
    this.PlayerControlDefs = new $.C4PlayerControlDefs().init();
    this.PlayerControlUserAssignmentSets = new $.C4PlayerControlAssignmentSets().init();
    this.PlayerControlDefaultAssignmentSets = new $.C4PlayerControlAssignmentSets().init();
    this.Scoreboard = new $.C4Scoreboard();
    this.pNetworkStatistics = null;
    this.pFileMonitor = null;
    this.pSec1Timer = new C4GameSec1Timer().init();
    this.ScenarioTitle = new $.StdCopyStrBuf();
    this.pJoinReference = null;
    this.RecordDumpFile = new $.StdStrBuf();
    this.RecordStream = new $.StdStrBuf();
    this.TempScenarioFile = new $.StdStrBuf();
    this.fPreinited = false;
    this.StartupLogPos = 0;
    this.QuitLogPos = 0;
    this.fQuitWithError = false;
    this.NextMission = new $.StdCopyStrBuf();
    this.NextMissionText = new $.StdCopyStrBuf();
    this.NextMissionDesc = new $.StdCopyStrBuf();
    this.DebugPassword = new $.StdStrBuf();
    this.DebugHost = new $.StdStrBuf();
    this.ScriptGuiRoot = null;
    this.Parameters = $.GameParameters$C4Game;
    this.StartupScenarioParameters = $.GameStartupScenarioParameters$C4Game;
    this.Clients = this.Parameters.Clients;
    this.Teams = this.Parameters.Teams;
    this.PlayerInfos = this.Parameters.PlayerInfos;
    this.RestorePlayerInfos = this.Parameters.RestorePlayerInfos;
    this.RoundResults = $.GameRoundResults$C4Game;
    this.ScenarioParameterDefs = $.GameScenarioParameterDefs$C4Game;
    this.Input = $.Control$2.Input;
    this.KeyboardInput = $.C4KeyboardInput_Init();
    this.GlobalSoundModifier = $.GameGlobalSoundModifier$C4Game;
    C4Game.prototype.Default.call(this);
    return this;
  }

  $dtor() {
    $.C4Startup.Unload();
  }

  Clear() {
    this.pFileMonitor = null;
    $.Application.MusicSystem.FadeOut(2000);
    this.IsRunning = false;
    this.PointersDenumerated = false;
    if (this.GameOver) {
      if (!this.Evaluated) {
        this.Evaluate();
      }
    }
    this.pNetworkStatistics = null;
    $.C4AulProfiler.Abort();
    this.NextMission.Clear();
    this.NextMissionText.Clear();
    this.NextMissionDesc.Clear();
    $.Network.Clear$v();
    $.Control$2.Clear();
    $.MouseControl.Clear();
    this.KeyboardInput.Clear();
    this.PlayerControlUserAssignmentSets.Clear();
    this.PlayerControlDefaultAssignmentSets.Clear();
    this.PlayerControlDefs.Clear();
    this.Scoreboard.Clear();
    $.Players.Clear();
    this.Parameters.Clear();
    this.RoundResults.Clear();
    this.C4S.Clear();
    this.ScenarioParameterDefs.Clear();
    this.StartupScenarioParameters.Clear();
    $.C4ComponentHost.prototype.Clear.call(this.Info);
    $.C4ComponentHost.prototype.Clear.call(this.Title);
    $.C4ComponentHost.prototype.Clear.call(this.Names);
    $.C4ComponentHost.prototype.Clear.call(this.GameText);
    this.RecordDumpFile.Clear();
    this.RecordStream.Clear();
    $.Console.CloseGame();
    $.Particles.Clear();
    this.ScriptGuiRoot = null;
    this.DeleteObjects(true);
    $.pGUI.Clear$v();
    $.Weather.Clear();
    $.Landscape.Clear();
    $.PXS.Clear();
    $.MaterialMap.Clear();
    $.TextureMap.Clear();
    this.PathFinder.Clear();
    this.TransferZones.Clear();
    $.Messages.Clear();
    $.MessageInput.Clear();
    this.SetGlobalSoundModifier(null);
    $.Application.SoundSystem.Modifiers.Clear();
    $.MapScript.Clear();
    $.Definitions.Clear();
    $.GameScript.Clear();
    $.C4PropListNumbered.ClearShelve();
    $.ScriptEngine.Clear();
    this.pScenarioObjectsScript = null;
    $.C4PropListNumbered.ClearNumberedPropLists();
    $.C4PropListScript.ClearScriptPropLists();
    $.C4ComponentHost.prototype.Clear.call(this.MainSysLangStringTable);
    $.C4ComponentHost.prototype.Clear.call(this.ScenarioLangStringTable);
    this.CloseScenario();
    this.GroupSet.Clear();
    $.Application.MusicSystem.ClearGame();
    $.Application.SoundSystem.Clear();
    $.FontLoader.Clear();
    $.MeshMaterialManager.Clear();
    $.GraphicsSystem.Clear();
    $.FullScreen.CloseMenu();
    if ($.Languages.HasStringTable()) {
      $.Log($.LoadResStr(S("IDS_CNS_GAMECLOSED")));
    }
    $wr(P(this.DefinitionFilenames, 0), 0, $wr(P(this.DirectJoinAddress, 0), 0, $wr(P(this.ScenarioFilename, 0), 0, $wr(P(this.PlayerFilenames, 0), 0, 0))));
    this.pJoinReference = null;
    this.QuitLogPos = $.GetLogPos();
    this.fPreinited = false;
    $.C4PropListNumbered.ResetEnumerationIndex();
    this.Default();
  }

  Abort(approval_given = false) {
    if ($.Network.isEnabled() && this.Parameters.isLeague() && !approval_given) {
      if ($.Control$2.isCtrlHost() && !$.Game.GameOver) {
        $.Network.Vote(0 /*VT_Cancel*/);
        return;
      }
      if (!$.Control$2.isCtrlHost() && !$.Game.GameOver && $.Players.GetLocalByIndex(0) != null) {
        $.Network.Vote(1 /*VT_Kick*/, true, $.Control$2.ClientID());
        return;
      }
    }
    if (this.EvaluateOnAbort) {
      this.Evaluate();
    }
    $.Players.RemoveLocal(true, true);
    $.Players.RemoveAtRemoteClient(true, true);
    $.Application.QuitGame();
  }

  Evaluate() {
    let is_league = $.Network.isEnabled() && $.Network.isHost() && this.Parameters.isLeague();
    let RecordName = new $.StdStrBuf();
    const RecordSHA = new Uint8Array(20);
    if ($.Control$2.isRecord()) {
      $.Control$2.StopRecord(RecordName, is_league ? P(RecordSHA, 0) : null);
    }
    if (is_league) {
      $.Network.LeagueGameEvaluate(RecordName.getData(), P(RecordSHA, 0));
    }
    $.Players.Evaluate();
    $.Players.Save$b(true);
    this.RoundResults.EvaluateGame();
    $.Log($.LoadResStr(S("IDS_PRC_EVALUATED")));
    this.Evaluated = true;
  }

  ShowGameOverDlg() {
    if (this.GameOverDlgShown) {
      return;
    }
    this.GameOverDlgShown = true;
    if ($.Application.isEditor === 0) {
      let dialog = new $.C4GameOverDlg().init();
      dialog.SetDelOnClose();
      if (!dialog.Show($.pGUI, true)) {
        $delete(dialog);
        $.Application.QuitGame();
      }
    }
  }

  DoKeyboardInput$u64$i32$b$b$b$b$pDialog$b$i32(vk_code, event_type, alt, ctrl, shift, repeated, for_dialog = null, fPlrCtrlOnly = false, strength = -1) {
    let Key = new $.C4KeyCodeEx().init(vk_code, ((Math.imul(alt ? 1 : 0, 1) + Math.imul(ctrl ? 1 : 0, 2) | 0) + Math.imul(shift ? 1 : 0, 4) | 0) >>> 0, repeated);
    return this.DoKeyboardInput$C4KeyCodeEx$i32$pDialog$b$i32(Key.$clone(), event_type, for_dialog, fPlrCtrlOnly, strength);
  }

  DoKeyboardInput$C4KeyCodeEx$i32$pDialog$b$i32(key, event_type, for_dialog = null, fPlrCtrlOnly = false, strength = -1) {
    key.FixShiftKeys();
    let InScope = 0;
    if (fPlrCtrlOnly) {
      InScope = 1;
    } else {
      if (this.IsRunning) {
        InScope = 16;
      }
      if ($.pGUI.HasKeyboardFocus() || for_dialog != null) {
        InScope = (InScope | 2) >>> 0;
        if (for_dialog != null) {
          $.pGUI.ActivateDialog(for_dialog);
        }
        $.pGUI.KeyAny();
      } else {
        if ($.Application.isEditor === 0) {
          if ($.FullScreen.MainMenu != null && $.FullScreen.MainMenu.IsActive$v()) {
            InScope = (InScope | 32) >>> 0;
          } else if ($.Game.C4S.Head.Replay && this.C4S.Head.Film !== 0) {
            InScope = (InScope | 64) >>> 0;
          } else if ($.Viewports.GetViewport(-1) != null) {
            InScope = (InScope | 128) >>> 0;
          } else {
            InScope = (InScope | 256) >>> 0;
            if (!$.C4GameOverDlg.IsShown()) {
              InScope = (InScope | 1) >>> 0;
            }
          }
        } else {
          InScope = (InScope | 1) >>> 0;
        }
      }
      if (this.IsRunning) {
        if ($.FullScreen.Active) {
          InScope = (InScope | 4) >>> 0;
        }
        if ($.Console.Active) {
          InScope = (InScope | 8) >>> 0;
        }
      }
    }
    if (this.KeyboardInput.DoInput(key, event_type, InScope, strength)) {
      return true;
    }
    return false;
  }

  DrawCrewOverheadText(cgo, player_nr) {
    let $t1, $t2, $t3;
    let r = new $.ZoomData();
    $.pDraw.GetZoom(r);
    let zoom = r.Zoom;
    r.Zoom = Math.fround(1);
    $.pDraw.SetZoom$ZoomData(r);
    let fixedOffsetX = Math.fround(Math.fround(-cgo.X * cgo.Zoom) + cgo.X);
    let fixedOffsetY = Math.fround(Math.fround(Math.fround(-cgo.Y - 10) * cgo.Zoom) + cgo.Y);
    const fctCursor = $.GraphicsResource.fctMouseCursor;
    for (let player = $.Players.First; player != null; player = player.Next) {
      let drawCursorInfo = (player.Number === player_nr || player_nr === -1) && (player.CursorFlash !== 0 && player.Cursor.op_C4Object_() != null);
      let drawPlayerAndCursorNames = player.Number !== player_nr && ($.Config.Graphics.ShowCrewNames !== 0 || $.Config.Graphics.ShowCrewCNames !== 0) && !($.Hostile(player_nr, player.Number) !== 0) && !player.IsInvisible();
      if (!drawPlayerAndCursorNames && !drawCursorInfo) {
        continue;
      }
      const drawX = [0];
      const drawY = [0];
      const drawZoom = [0];
      let calculateObjectTextPosition = ((obj) => {
  obj.GetDrawPosition$C4TargetFacet$f32$f32$f32$rf32$rf32$rf32(cgo, $.fixtof(obj.fix_x), $.fixtof(obj.fix_y), Math.fround(1), P(drawX, 0), P(drawY, 0), P(drawZoom, 0));
  drawX[0] = Math.fround(Math.fround(drawX[0] * cgo.Zoom) + fixedOffsetX);
  drawY[0] = Math.fround(Math.fround(drawY[0] * cgo.Zoom) - Math.fround(obj.Def.Shape.Hgt) / 2 + fixedOffsetY);
});
      if (drawPlayerAndCursorNames) {
        $t1 = player.Crew;
        $t2 = $t1.begin();
        $t3 = $t1.end();
        try {
          for (; $t2.op_ne($t3); $t2.op_inc$v()) {
            const crew = $t2.op_mul();
            if (crew.Status === 0 || crew.Def == null) {
              continue;
            }
            if (crew.Contained.op_C4Object_() != null) {
              continue;
            }
            if ((crew.OCF & 524288) >>> 0 === 0) {
              continue;
            }
            if (!crew.IsVisible(player_nr, false)) {
              continue;
            }
            calculateObjectTextPosition(crew);
            drawY[0] = Math.fround(drawY[0] - 5);
            const text = new Int8Array(257);
            if ($.Config.Graphics.ShowCrewNames !== 0) {
              if ($.Config.Graphics.ShowCrewCNames !== 0) {
                $.ssprintf$11(text, S("%s (%s)"), crew.GetName(), player.GetName());
              } else {
                $.SCopy$pi8$pi8(player.GetName(), P(text, 0));
              }
            } else {
              $.SCopy$pi8$pi8(crew.GetName(), P(text, 0));
            }
            const char_width = [0];
            const dummy = [0];
            $.GraphicsResource.FontRegular.GetTextExtent(S("m"), P(char_width, 0), P(dummy, 0), false);
            let iMaxLine = $max(ftoi32(Math.fround(cgo.Wdt / Math.fround($max(1, char_width[0])))), 20);
            $.SWordWrap(P(text, 0), 32, 124, iMaxLine);
            const textWidth = [0];
            const textHeight = [0];
            $.GraphicsResource.FontRegular.GetTextExtent(P(text, 0), P(textWidth, 0), P(textHeight, 0), true);
            $.pDraw.TextOut(P(text, 0), $.GraphicsResource.FontRegular, Math.fround(1), cgo.Surface, drawX[0], Math.fround(drawY[0] - Math.fround(textHeight[0]) / 2), (player.ColorDw | 0x7f000000) >>> 0, 1);
          }
        } finally { $t2.$dtor(); $t3.$dtor(); }
      } else if (drawCursorInfo) {
        let cursor = player.Cursor.op_C4Object_();
        calculateObjectTextPosition(cursor);
        drawY[0] = Math.fround(drawY[0] + -fctCursor.Hgt);
        fctCursor.Draw$pC4Surface$f32$f32$i32$i32(cgo.Surface, Math.fround(drawX[0] - fctCursor.Wdt / 2), drawY[0], 4);
        if (cursor.Info != null) {
          let texthgt = $.GraphicsResource.FontRegular.GetLineHeight();
          let str = new $.StdStrBuf();
          if (cursor.Info.Rank > 0) {
            str.Format(S("%s|%s"), cursor.Info.sRankName.getData(), cursor.GetName());
            texthgt = texthgt + texthgt | 0;
          } else {
            $.StdStrBuf.prototype.op_assign$pi8.call(str, cursor.GetName());
          }
          $.pDraw.TextOut(str.getData(), $.GraphicsResource.FontRegular, Math.fround(1), cgo.Surface, drawX[0], Math.fround(drawY[0] - Math.fround(texthgt) / 2), 0xffff0000, 1);
        }
      }
    }
    r.Zoom = zoom;
    $.pDraw.SetZoom$ZoomData(r);
  }

  FixRandom(seed) {
    FixedRandom(seed);
  }

  *Init() {
    let numbers = new $.C4ValueNumbers().init();
    this.IsRunning = false;
    this.InitProgress = 0;
    this.LastInitProgress = 0;
    this.SetInitProgress(Math.fround(0));
    if (!this.InitKeyboard()) {
      $.LogFatal($.LoadResStr(S("IDS_ERR_NOKEYBOARD")));
    }
    this.StartupLogPos = $.GetLogPos();
    this.fQuitWithError = false;
    $.UserAbort = false;
    this.StartTime = c$time(null) | 0;
    if (!($rd(P(this.PlayerFilenames, 0)) !== 0)) {
      $.SCopy$pi8$pi8$u64(P($.Config.General.Participants, 0), P(this.PlayerFilenames, 0), $min(81921, 1025) - 1);
    }
    if (this.pJoinReference != null || $rd(P(this.DirectJoinAddress, 0)) !== 0) {
      if ($.GraphicsSystem.pLoaderScreen == null) {
        $.Log($.LoadResStr(S("IDS_PRC_INITEXTRA")));
        if (!this.Extra.Init()) {
          $.LogFatal($.LoadResStr(S("IDS_PRC_ERREXTRA")));
          return false;
        }
        if ($.Application.isEditor === 0 && !$.GraphicsSystem.InitLoaderScreen(this.C4S.Head.Loader.c_str())) {
          $.LogFatal($.LoadResStr(S("IDS_PRC_ERRLOADER")));
          return false;
        }
      }
      this.SetInitProgress(Math.fround(5));
      if (this.pJoinReference != null) {
        let success = this.InitNetworkFromReference(this.pJoinReference);
        this.pJoinReference = null;
        if (!success) {
          return false;
        }
      } else if ($.SEqual2(P(this.DirectJoinAddress, 0), C4Game.DirectJoinFilePrefix)) {
        if (!this.InitNetworkFromReferenceFile($padd(P(this.DirectJoinAddress, 0), c$strlen(C4Game.DirectJoinFilePrefix)))) {
          return false;
        }
      } else {
        if (!this.InitNetworkFromAddress(P(this.DirectJoinAddress, 0))) {
          return false;
        }
      }
      if ($.Application.isEditor !== 0 && !this.Parameters.AllowDebug) {
        $.LogFatal($.LoadResStr(S("IDS_TEXT_JOININCONSOLEMODENOTALLOW")));
        return false;
      }
      if ($.Network.isLobbyActive()) {
        if (!$.Network.DoLobby()) {
          return false;
        }
      }
      const scenario_filename = new Int8Array(4097);
      this.SetInitProgress(Math.fround(6));
      if (!$.Network.RetrieveScenario(P(scenario_filename, 0))) {
        return false;
      }
      $.SCopy$pi8$pi8$u64(P(scenario_filename, 0), P(this.ScenarioFilename, 0), 4096);
      if (!this.OpenScenario()) {
        return false;
      }
      this.TempScenarioFile.Copy$pi8(P(this.ScenarioFilename, 0));
      if (!this.Parameters.GameRes.RetrieveFiles()) {
        return false;
      }
      if (!this.C4S.Head.NetworkGame) {
        $.LogFatal($.LoadResStr(S("IDS_NET_NONETGAME")));
        return false;
      }
      this.SetInitProgress(Math.fround(7));
    } else {
      if (!this.OpenScenario()) {
        $.LogFatal($.LoadResStr(S("IDS_PRC_FAIL")));
        return false;
      }
      $.Log($.LoadResStr(S("IDS_PRC_INITEXTRA")));
      if (!this.Extra.Init()) {
        $.LogFatal($.LoadResStr(S("IDS_PRC_ERREXTRA")));
        return false;
      }
      if ($.Application.isEditor === 0 && !$.GraphicsSystem.InitLoaderScreen(this.C4S.Head.Loader.c_str())) {
        $.LogFatal($.LoadResStr(S("IDS_PRC_ERRLOADER")));
        return false;
      }
      if (!this.InitNetworkHost()) {
        return false;
      }
      this.SetInitProgress(Math.fround(7));
    }
    $.C4Startup.Unload();
    this.DebugMode = !($.Application.isEditor === 0);
    if ($.Config.General.AlwaysDebug !== 0) {
      this.DebugMode = true;
    }
    if (!this.Parameters.AllowDebug) {
      this.DebugMode = false;
    }
    if (!this.InitGame(this.ScenarioFile, 0 /*IM_Normal*/, true, numbers)) {
      return false;
    }
    if ($.Network.isEnabled()) {
      if (!$.Network.FinalInit()) {
        return false;
      }
    } else {
      let DBGRECOFF = new $.C4DebugRecOff().init$b(!!this.C4S.Head.SaveGame);
      try {
        this.SyncClearance();
        this.Synchronize(false);
      } finally { DBGRECOFF && DBGRECOFF.$dtor(); }
    }
    if (!(yield* this.InitPlayers(numbers))) {
      return false;
    }
    this.SetInitProgress(Math.fround(98));
    if (!this.InitGameFinal(0 /*IM_Normal*/)) {
      return false;
    }
    this.SetInitProgress(Math.fround(99));
    if (this.GlobalSoundModifier.op_const_void_() != null) {
      this.SetGlobalSoundModifier(this.GlobalSoundModifier._getPropList());
    }
    if ($.Application.isEditor === 0) {
      this.InitFullscreenComponents(true);
    }
    $.FullScreen.CloseMenu();
    this.pNetworkStatistics = new $.C4Network2Stats().init();
    if ($.GraphicsSystem.pLoaderScreen != null) {
      $delete($.GraphicsSystem.pLoaderScreen);
      $.GraphicsSystem.pLoaderScreen = null;
    }
    this.IsRunning = true;
    $.Log($.LoadResStr(this.C4S.Head.NetworkGame ? S("IDS_PRC_JOIN") : this.C4S.Head.SaveGame ? S("IDS_PRC_RESUME") : S("IDS_PRC_START")));
    $.pGUI.SetExclusive(false);
    this.Scoreboard.DoDlgShow(0, false);
    this.SetInitProgress(Math.fround(100));
    $.GraphicsSystem.InvalidateBg();
    $.Console.InitGame();
    return true;
  }

  PreInit() {
    this.Extra.InitGroup();
    this.RandomSeed = c$time(null) | 0;
    this.FixRandom(u64(BigInt(this.RandomSeed)));
    this.GameGo = false;
    $.MessageInput.Init();
    $.Game.SetInitProgress(31);
    if (!this.InitKeyboard()) {
      $.LogFatal($.LoadResStr(S("IDS_ERR_NOKEYBOARD")));
      return false;
    }
    this.UpdateLanguage();
    if (!this.InitPlayerControlSettings()) {
      return false;
    }
    $.Game.SetInitProgress(32);
    $.DefaultRanks.Init($.Config.GetSubkeyPath(S("ClonkRanks")), $.LoadResStr(S("IDS_GAME_DEFRANKS")), 1000);
    $.Game.SetInitProgress(33);
    if (!$.GraphicsSystem.Init()) {
      $.LogFatal($.LoadResStr(S("IDS_ERR_NOGFXSYS")));
      return false;
    }
    let r = new $.C4Rect();
    if ($.Application.isEditor !== 0) {
      $.Console.GetSize(r);
    } else {
      $.FullScreen.GetSize(r);
    }
    $.pGUI.Init$i32$i32$i32$i32(0, 0, r.Wdt, r.Hgt);
    this.fPreinited = true;
    return true;
  }

  SetScenarioFilename(scenario_filename) {
    $.SCopy$pi8$pi8$u64(scenario_filename, P(this.ScenarioFilename, 0), 4096);
    if ($.SEqualNoCase($.GetFilename(scenario_filename), S("scenario.txt"))) {
      if (!$peq($.GetFilename$2(P(this.ScenarioFilename, 0)), P(this.ScenarioFilename, 0))) {
        $wr($padd($.GetFilename$2(P(this.ScenarioFilename, 0)), -1), 0, 0);
      }
    }
  }

  HasScenario() {
    return $rd(P(this.DirectJoinAddress, 0)) !== 0 || $rd(P(this.ScenarioFilename, 0)) !== 0 || this.RecordStream.getSize() !== 0;
  }

  Execute() {
    this.GameGo = true;
    $.Network.Execute$v();
    let control_prepared = false;
    {
      control_prepared = $.Control$2.Prepare();
    }
    if (!control_prepared) {
      return false;
    }
    if (this.HaltCount !== 0) {
      return false;
    }
    if ($.Config.General.DebugRec !== 0) {
      $.Landscape.DoRelights();
    }
    $.Control$2.Execute();
    if (!this.IsRunning) {
      return false;
    }
    {
      if ($.Config.General.DebugRec !== 0) {
        $.AddDbgRec(130 /*RCT_Block*/, S("Ticks"), 6);
      }
      this.Ticks();
    }
    if ($.Config.General.DebugRec !== 0) {
      $.AddDbgRec(129 /*RCT_DbgFrame*/, P(this, "FrameCounter"), 4);
    }
    $.Particles.CalculateNextStep();
    {
      this.ExecObjects();
    }
    {
      if ($.Config.General.DebugRec !== 0) {
        $.AddDbgRec(130 /*RCT_Block*/, S("GEEx\u0000"), 6);
      }
      {
        $.C4Effect.Execute$ppC4Effect(P($.ScriptEngine, "pGlobalEffects"));
        $.C4Effect.Execute$ppC4Effect(P($.GameScript, "pScenarioEffects"));
      }
    }
    ;
    {
      if ($.Config.General.DebugRec !== 0) {
        $.AddDbgRec(130 /*RCT_Block*/, S("PXSEx"), 6);
      }
      {
        $.PXS.Execute();
      }
    }
    {
      if ($.Config.General.DebugRec !== 0) {
        $.AddDbgRec(130 /*RCT_Block*/, S("MMvEx"), 6);
      }
      {
        $.MassMover.Execute();
      }
    }
    {
      if ($.Config.General.DebugRec !== 0) {
        $.AddDbgRec(130 /*RCT_Block*/, S("WtrEx"), 6);
      }
      {
        $.Weather.Execute();
      }
    }
    {
      if ($.Config.General.DebugRec !== 0) {
        $.AddDbgRec(130 /*RCT_Block*/, S("LdsEx"), 6);
      }
      {
        $.Landscape.Execute();
      }
    }
    {
      if ($.Config.General.DebugRec !== 0) {
        $.AddDbgRec(130 /*RCT_Block*/, S("PlrEx"), 6);
      }
      {
        $.Players.Execute();
      }
    }
    {
      if ($.Config.General.DebugRec !== 0) {
        $.AddDbgRec(130 /*RCT_Block*/, S("MsgEx"), 6);
      }
      {
        $.Messages.Execute();
      }
    }
    {
      if ($.Config.General.DebugRec !== 0) {
        $.AddDbgRec(130 /*RCT_Block*/, S("Input"), 6);
      }
      $.MouseControl.Execute();
    }
    {
      if ($.Config.General.DebugRec !== 0) {
        $.AddDbgRec(130 /*RCT_Block*/, S("Misc\u0000"), 6);
      }
      this.GameOverCheck();
    }
    $.Control$2.DoSyncCheck();
    if (this.GameOver) {
      if (!this.Evaluated) {
        this.Evaluate();
      }
      if (!this.GameOverDlgShown) {
        this.ShowGameOverDlg();
      }
    }
    if (this.FrameCounter % 1000 === 0) {
    }
    if ($.Config.General.DebugRec !== 0) {
      $.AddDbgRec(130 /*RCT_Block*/, S("eGame"), 6);
      $.Landscape.DoRelights();
    }
    return true;
  }

  JoinPlayer(filename, at_client, at_client_name, info) {
    0;
    let player = null;
    if (!((player = $.Players.Join(filename, true, at_client, at_client_name, info, null)) != null)) {
      return null;
    }
    player.FinalInit(true);
    if (player.LocalControl) {
      $.Viewports.CreateViewport(player.Number);
    }
    $.FullScreen.ViewportCheck();
    $.Console.UpdateMenus();
    if (!$.SIsModule(this.PlayerNames.getData(), player.GetName())) {
      if (this.PlayerNames.op_const_void_() != null) {
        this.PlayerNames.op_addAssign$pi8(S(";"));
      }
      this.PlayerNames.op_addAssign$pi8(player.GetName());
    }
    return player;
  }

  OnPlayerJoinFinished() {
    if (!this.InitialPlayersJoined && !(this.PlayerInfos.GetJoinPendingPlayerCount() !== 0) && !$.Players.HasPlayerInTeamSelection() && $.Players.GetCount$i32(1 /*C4PT_User*/) > 0) {
      this.InitialPlayersJoined = true;
      this.GRBroadcast(S("~InitializePlayers"));
    }
  }

  DoGameOver() {
    if (this.GameOver) {
      return false;
    }
    this.GameOver = true;
    $.Log($.LoadResStr(S("IDS_PRC_GAMEOVER")));
    this.GRBroadcast(S("~OnGameOver"));
    for (let pPlayer = $.Players.First; pPlayer != null; pPlayer = pPlayer.Next) {
      if (pPlayer.Eliminated === 0) {
        pPlayer.EvaluateLeague(false, true);
      }
    }
    $.Config.Save();
    return true;
  }

  CanQuickSave() {
    if ($.Network.isEnabled() && !$.Network.isHost()) {
      $.Log($.LoadResStr(S("IDS_GAME_NOCLIENTSAVE")));
      return false;
    }
    return true;
  }

  QuickSave(filename, title, force_save = false) {
    if (!force_save) {
      if (!this.CanQuickSave()) {
        return false;
      }
    }
    if (!$.Config.General.CreateSaveFolder($.Config.AtUserDataPath(S("Savegames.ocf")), $.LoadResStr(S("IDS_GAME_SAVEGAMESTITLE")))) {
      $.Log($.LoadResStr(S("IDS_GAME_FAILSAVEGAME")));
      return false;
    }
    const save_folder = new Int8Array(4097);
    for (let i = 0; i < $.SCharCount(47, filename); i = i + 1 >>> 0) {
      $.SCopy$pi8$pi8($.Config.AtUserDataPath(S("Savegames.ocf")), P(save_folder, 0));
      $.AppendBackslash(P(save_folder, 0));
      $.SCopyUntil$pi8$pi8$i8$i32$i32(filename, $padd(P(save_folder, 0), $.SLen(P(save_folder, 0))), 47, 4096, i | 0);
      if (!$.Config.General.CreateSaveFolder(P(save_folder, 0), title)) {
        $.Log($.LoadResStr(S("IDS_GAME_FAILSAVEGAME")));
        return false;
      }
    }
    let save_path = new $.StdStrBuf();
    save_path.Format(S("%s%c%s"), $.Config.AtUserDataPath(S("Savegames.ocf")), 47, filename);
    if ($.ItemIdentical(P(this.ScenarioFilename, 0), save_path.getData())) {
      $.StartSoundEffect(S("UI::Error"));
      $.GraphicsSystem.FlashMessage($.LoadResStr(S("IDS_GAME_NOSAVEONCURR")));
      $.Log($.LoadResStr(S("IDS_GAME_FAILSAVEGAME")));
      return false;
    }
    $.Log($.LoadResStr(S("IDS_HOLD_SAVINGGAME")));
    $.GraphicsSystem.MessageBoard.EnsureLastMessage();
    let game_save = null;
    game_save = new $.C4GameSaveSavegame().init();
    if (!game_save.Save$pi8(save_path.getData())) {
      $.Log($.LoadResStr(S("IDS_GAME_FAILSAVEGAME")));
      $delete(game_save);
      return false;
    }
    $delete(game_save);
    $.Log($.LoadResStr(S("IDS_CNS_GAMESAVED")));
    return true;
  }

  SetInitProgress(to_progress) {
    this.InitProgress = ftoi32(to_progress);
    if (this.InitProgress > this.LastInitProgress) {
      this.LastInitProgress = this.InitProgress;
      $.GraphicsSystem.MessageBoard.LogNotify();
    }
    if (!this.IsRunning) {
      $.Application.FlushMessages();
    }
  }

  OnResolutionChanged(res_x, res_y) {
    $.pGUI.SetBounds(new $.C4Rect().init$i32$i32$i32$i32(0, 0, res_x | 0, res_y | 0));
    if ($.FullScreen.Active) {
      this.InitFullscreenComponents(!!this.IsRunning);
    }
    $.GraphicsResource.ReloadResolutionDependantFiles();
    $.Viewports.RecalculateViewports();
  }

  OnKeyboardLayoutChanged() {
    this.PlayerControlDefaultAssignmentSets.ResolveRefs(this.PlayerControlDefs);
    this.PlayerControlUserAssignmentSets.ResolveRefs(this.PlayerControlDefs);
  }

  InitFullscreenComponents(is_running) {
    if (!$.GraphicsResource.IsInitialized()) {
      return;
    }
    let cgo = new $.C4Facet().init$v();
    cgo.Set$pC4Surface$f32$f32$f32$f32($.FullScreen.pSurface, Math.fround(0), Math.fround(0), Math.fround($.GetScreenWdt()), Math.fround($.GetScreenHgt()));
    $.GraphicsSystem.MessageBoard.Init(cgo, !is_running);
    if (is_running) {
      let cgo2 = new $.C4Facet().init$v();
      cgo2.Set$pC4Surface$f32$f32$f32$f32($.FullScreen.pSurface, Math.fround(0), Math.fround(0), Math.fround($.GetScreenWdt()), Math.fround(50));
      $.GraphicsSystem.UpperBoard.Init(cgo2);
      $.Viewports.RecalculateViewports();
    }
  }

  ToggleChat() {
    return $.C4ChatDlg.ToggleChat();
  }

  TogglePause() {
    if ($.C4GameOverDlg.IsShown()) {
      return false;
    }
    if (this.IsPaused()) {
      return this.Unpause();
    } else {
      return this.Pause();
    }
  }

  Pause() {
    if (this.IsPaused()) {
      return false;
    }
    if ($.Network.isEnabled()) {
      if (this.Parameters.isLeague() && !$.Game.Evaluated) {
        $.Network.Vote(2 /*VT_Pause*/, true, 1);
        return false;
      }
      if (!$.Network.isHost()) {
        return true;
      }
      $.Network.Pause();
    } else {
      $.Game.HaltCount = 1;
    }
    $.Console.UpdateHaltCtrls(this.IsPaused());
    return true;
  }

  Unpause() {
    if (!this.IsPaused()) {
      return false;
    }
    if ($.Network.isEnabled()) {
      if (this.Parameters.isLeague() && !$.Game.Evaluated) {
        $.Network.Vote(2 /*VT_Pause*/, true, 0);
        return false;
      }
      if (!$.Network.isHost()) {
        return true;
      }
      $.Network.Start$v();
    } else {
      $.Game.HaltCount = 0;
    }
    $.Console.UpdateHaltCtrls(this.IsPaused());
    return true;
  }

  IsPaused() {
    if ($.Network.isEnabled()) {
      return !$.Network.isRunning();
    }
    return !(this.HaltCount === 0);
  }

  Synchronize(save_player_files) {
    $.LogSilentF(S("Network: Synchronization (Frame %i) [PlrSave: %d]"), this.FrameCounter, save_player_files ? 1 : 0);
    $.Control$2.OnGameSynchronizing();
    this.FixRandom(u64(BigInt(this.RandomSeed)));
    $.Definitions.Synchronize();
    $.Landscape.Synchronize();
    $.MassMover.Synchronize();
    $.Objects.Synchronize();
    if (save_player_files && !$.Control$2.isReplay()) {
      $.Players.SynchronizeLocalFiles();
    }
    if ($.Network.isEnabled()) {
      $.Network.OnGameSynchronized();
    }
    this.TransferZones.Synchronize();
  }

  SyncClearance() {
    $.Objects.SyncClearance();
  }

  DropFile(filename, x, y) {
    let id = new $.C4ID().init$v();
    let def = null;
    if ($.SEqualNoCase($.GetExtension(filename), S("ocd"))) {
      if (id.$assign(DefFileGetID(filename)).op_unsigned_long_C4ID_() != null) {
        if ((def = $.C4Id2Def(id.$clone())) != null || $.Definitions.Load$pi8$u32$pi8$pC4SoundSystem$b$i32$i32(filename, 966, P($.Config.General.LanguageEx, 0), $.Application.SoundSystem) !== 0 && (def = $.C4Id2Def(id.$clone())) != null) {
          return this.DropDef(id.$clone(), x, y);
        }
      }
      $.Console.Out($.FormatString($.LoadResStr(S("IDS_CNS_DROPNODEF")), $.GetFilename(filename)).getData());
      return false;
    }
    return false;
  }

  DropDef(id, x, y) {
    let def = null;
    if ((def = $.C4Id2Def(id.$clone())) != null) {
      $.Control$2.DoInput(176 /*CID_EMMoveObj*/, $.C4ControlEMMoveObject.CreateObject(id, $.ftofix(x), $.ftofix(y), null), 4 /*CDT_Decide*/);
      return true;
    } else {
      $.Console.Out($.FormatString($.LoadResStr(S("IDS_CNS_DROPNODEF")), id.ToString()).getData());
    }
    return false;
  }

  ReloadFile(filepath) {
    if ($.Network.isEnabled()) {
      return false;
    }
    let relative_path = $.Config.AtRelativePath(filepath);
    let def = null;
    if ((def = $.Definitions.GetByPath(relative_path)) != null) {
      return this.ReloadDef(def.id.$clone());
    }
    if ($.ScriptEngine.ReloadScript(relative_path, P($.Config.General.LanguageEx, 0))) {
      this.ReLinkScriptEngine();
    }
    return true;
  }

  ReloadDef(id) {
    let $t1, $t2, $t3, $t4, $t5, $t6;
    if ($.Network.isEnabled()) {
      return false;
    }
    this.Synchronize(false);
    $.C4SolidMask.RemoveSolidMasks();
    let def = $.Definitions.ID2Def(id.$clone());
    if (def == null) {
      return false;
    }
    if (!$.GraphicsResource.RegisterGlobalGraphics()) {
      return false;
    }
    if (!$.GraphicsResource.RegisterMainGroups()) {
      return false;
    }
    $.LogF(S("Reloading %s from %s"), def.id.ToString(), $.GetFilename$2(P(def.Filename, 0)));
    let reload_succeeded = false;
    if ($.Definitions.Reload(def, 966, P($.Config.General.LanguageEx, 0), $.Application.SoundSystem)) {
      this.ReLinkScriptEngine();
      $t1 = $.Objects;
      $t2 = $t1.begin();
      $t3 = $t1.end();
      try {
        for (; $t2.op_ne($t3); $t2.op_inc$v()) {
          const obj = $t2.op_mul();
          if (obj.id.op_eq(id)) {
            obj.UpdateFace(true);
          }
        }
      } finally { $t2.$dtor(); $t3.$dtor(); }
      reload_succeeded = true;
    } else {
      $t4 = $.Objects;
      $t5 = $t4.begin();
      $t6 = $t4.end();
      try {
        for (; $t5.op_ne($t6); $t5.op_inc$v()) {
          const obj = $t5.op_mul();
          if (obj.id.op_eq(id)) {
            obj.AssignRemoval();
          }
        }
      } finally { $t5.$dtor(); $t6.$dtor(); }
      $.C4AulProfiler.Abort();
      $.Definitions.Remove$pC4Def(def);
      $.Log(S("Reloading failure. All objects of this type removed."));
      reload_succeeded = false;
    }
    $.GraphicsResource.CloseFiles();
    $.Messages.UpdateDef(id.$clone());
    $.C4SolidMask.PutSolidMasks();
    return reload_succeeded;
  }

  ReloadParticle(name) {
    if ($.Network.isEnabled()) {
      return false;
    }
    if (name == null) {
      return false;
    }
    let def = $.Particles.definitions.GetDef(name);
    if (def == null) {
      return false;
    }
    $.LogF(S("Reloading particle %s from %s"), def.Name.getData(), $.GetFilename(def.Filename.getData()));
    if (!def.Reload()) {
      $.Particles.ClearAllParticles();
      $delete(def);
      $.LogF(S("Reloading failure. All particles removed."));
      return false;
    }
    return true;
  }

  ClearPointers(obj) {
    $.AulExec.ClearPointers(obj);
    $.Objects.ForeObjects.ClearPointers(obj);
    $.Messages.ClearPointers(obj);
    this.ClearObjectPtrs(obj);
    $.Application.SoundSystem.ClearPointers(obj);
    $.Players.ClearPointers(obj);
    $.Viewports.ClearPointers(obj);
    $.MessageInput.ClearPointers(obj);
    $.Console.ClearPointers(obj);
    $.MouseControl.ClearPointers(obj);
    if (this.ScriptGuiRoot != null) {
      this.ScriptGuiRoot.ClearPointers(obj);
    }
    this.TransferZones.ClearPointers(obj);
    if ($.ScriptEngine.pGlobalEffects != null) {
      $.ScriptEngine.pGlobalEffects.ClearPointers$pC4PropList(obj);
    }
    if ($.GameScript.pScenarioEffects != null) {
      $.GameScript.pScenarioEffects.ClearPointers$pC4PropList(obj);
    }
    $.Landscape.ClearPointers(obj);
  }

  CreateObject$pC4PropList$pC4Object$i32$i32$i32$i32$b$C4Fixed$C4Fixed$C4Fixed$i32(proplist, creator, owner = -1, x = 50, y = 50, r = 0, grow_from_center = false, xdir = $.Fix0$C4Real.$clone(), ydir = $.Fix0$C4Real.$clone(), rdir = $.Fix0$C4Real.$clone(), controller = -1) {
    if (proplist == null || !(proplist.GetDef$v() != null)) {
      return null;
    }
    return this.NewObject(proplist, creator, owner, null, x, y, r, xdir.$clone(), ydir.$clone(), rdir.$clone(), 100000, controller, grow_from_center);
  }

  CreateObject$C4ID$pC4Object$i32$i32$i32$i32$b$C4Fixed$C4Fixed$C4Fixed$i32(id, creator, owner = -1, x = 50, y = 50, r = 0, grow_from_center = false, xdir = $.Fix0$C4Real.$clone(), ydir = $.Fix0$C4Real.$clone(), rdir = $.Fix0$C4Real.$clone(), controller = -1) {
    let def = null;
    if (!((def = $.C4Id2Def(id.$clone())) != null)) {
      return null;
    }
    return this.NewObject(def, creator, owner, null, x, y, r, xdir.$clone(), ydir.$clone(), rdir.$clone(), 100000, controller, grow_from_center);
  }

  CreateObjectConstruction(proplist, creator, owner, center_x = 0, bottom_y = 0, con = 1, adjust_terrain = false) {
    if (proplist == null) {
      return null;
    }
    let def = null;
    if (!((def = proplist.GetDef$v()) != null)) {
      return null;
    }
    let wdt = def.Shape.Wdt;
    let hgt = def.Shape.Hgt;
    let x = center_x - (wdt / 2 | 0) | 0;
    let y = bottom_y - hgt | 0;
    if (adjust_terrain) {
      if (Math.imul(wdt, hgt) < 12000) {
        $.Landscape.DigFreeRect(x, y, wdt, hgt);
      }
      $.Landscape.RaiseTerrain(x, y + hgt | 0, wdt);
    }
    let obj = null;
    if (!((obj = this.NewObject(proplist, creator, owner, null, center_x, bottom_y, 0, $.Fix0$C4Real.$clone(), $.Fix0$C4Real.$clone(), $.Fix0$C4Real.$clone(), con, creator != null ? creator.Controller : $.NO_OWNER$C4Constants, false)) != null)) {
      return null;
    }
    return obj;
  }

  CreateInfoObject(info, owner, x = 50, y = 50) {
    let def = null;
    if (info == null) {
      return null;
    }
    if (!((def = $.C4Id2Def(info.id.$clone())) != null)) {
      return null;
    }
    return this.NewObject(def, null, owner, info, x, y, 0, $.Fix0$C4Real.$clone(), $.Fix0$C4Real.$clone(), $.Fix0$C4Real.$clone(), 100000, -1, false);
  }

  FindConstuctionSiteBlock(x, y, wdt, hgt) {
    let $t1, $t2, $t3;
    let search_area = new $.C4Rect();
    search_area.x = x;
    search_area.y = y;
    search_area.Wdt = wdt;
    search_area.Hgt = hgt;
    let Area = new $.C4LArea().init$pC4LSectors$i32$i32$i32$i32($.Objects.Sectors, x, y, wdt, hgt);
    const sector = [null];
    for (let objects = Area.FirstObjectShapes(P(sector, 0)); sector[0] != null; objects = Area.NextObjectShapes(objects, P(sector, 0))) {
      $t1 = objects;
      $t2 = $t1.begin();
      $t3 = $t1.end();
      try {
        for (; $t2.op_ne($t3); $t2.op_inc$v()) {
          const obj = $t2.op_mul();
          if (obj.Status !== 0 && obj.Contained.op_not()) {
            if ((obj.OCF & 1024) >>> 0 !== 0) {
              let blocking_area = obj.Shape.$clone();
              blocking_area.x = blocking_area.x + obj.GetX() | 0;
              blocking_area.y = blocking_area.y + obj.GetY() | 0;
              if (search_area.Overlap(blocking_area)) {
                return obj;
              }
            }
          }
        }
      } finally { $t2.$dtor(); $t3.$dtor(); }
    }
    return null;
  }

  FindObject(def, x = 0, y = 0, wdt = 0, hgt = 0, ocf = 0xffffffff, find_next = null) {
    let $t1, $t2, $t3;
    let closest_obj = null;
    let closest_distance = 0;
    let min_distance = -1;
    let find_next_copy = find_next;
    if (def != null && def.Count === 0) {
      return null;
    }
    if (find_next != null && wdt === -1 && hgt === -1) {
      let dx = find_next.GetX() - x | 0;
      let dy = find_next.GetY() - y | 0;
      min_distance = Math.imul(dx, dx) + Math.imul(dy, dy) | 0;
      find_next = null;
    }
    $t1 = $.Objects;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    try {
      for (; $t2.op_ne($t3); $t2.op_inc$v()) {
        const obj = $t2.op_mul();
        if (find_next == null) {
          if (obj.Status !== 0) {
            if (def == null || obj.Def === def) {
              if ((obj.OCF & ocf) >>> 0 !== 0) {
                if (wdt === 0 && hgt === 0) {
                  if ($.Inside$i32$i32$i32$3(x - (obj.GetX() + obj.Shape.x | 0) | 0, 0, obj.Shape.Wdt - 1 | 0)) {
                    if ($.Inside$i32$i32$i32$3(y - (obj.GetY() + obj.Shape.y | 0) | 0, 0, obj.Shape.Hgt - 1 | 0)) {
                      return obj;
                    }
                  }
                  continue;
                }
                if (wdt === -1 && hgt === -1) {
                  let dx = obj.GetX() - x | 0;
                  let dy = obj.GetY() - y | 0;
                  let distance = Math.imul(dx, dy) + Math.imul(dy, dy) | 0;
                  if (distance === min_distance && find_next_copy == null) {
                    return obj;
                  }
                  if (closest_obj == null || distance < closest_distance) {
                    if (distance > min_distance) {
                      closest_obj = obj;
                      closest_distance = distance;
                    }
                  }
                } else if ($.Inside$i32$i32$i32$3(obj.GetX() - x | 0, 0, wdt - 1 | 0) && $.Inside$i32$i32$i32$3(obj.GetY() - y | 0, 0, hgt - 1 | 0)) {
                  return obj;
                }
              }
            }
          }
        }
        if (obj === find_next_copy) {
          find_next = find_next_copy = null;
        }
      }
    } finally { $t2.$dtor(); $t3.$dtor(); }
    return closest_obj;
  }

  FindVisObject(x, y, player_nr, viewport_game, viewport_gui, game_x, game_y, category, gui_x, gui_y) {
    let $t1, $t2, $t3;
    let layer_object = null;
    let player = $.Players.Get(player_nr);
    if (player != null && player.Cursor.op_C4Object_() != null) {
      layer_object = player.Cursor.op_arrow().Layer.op_C4Object_();
    }
    let obj_list = $.Objects.ForeObjects;
    while (obj_list != null) {
      $t1 = obj_list;
      $t2 = $t1.begin();
      $t3 = $t1.end();
      try {
        for (; $t2.op_ne($t3); $t2.op_inc$v()) {
          const obj = $t2.op_mul();
          if (obj.Status === 1) {
            if (obj_list !== $.Objects || (~obj.Category & 32768) !== 0) {
              if ((~obj.Category & 65536) !== 0) {
                if ((obj.Category >>> 0 & category) >>> 0 !== 0) {
                  if (obj.Contained.op_not()) {
                    if (obj.IsVisible(player_nr, false)) {
                      if (obj.Layer.op_ne$pC4Object(layer_object)) {
                        if (obj_list !== $.Objects.ForeObjects) {
                          continue;
                        }
                      }
                      const obj_x = [0];
                      const obj_y = [0];
                      let check_x = 0;
                      let check_y = 0;
                      if (obj_list === $.Objects.ForeObjects) {
                        check_x = gui_x;
                        check_y = gui_y;
                        obj.GetViewPos(P(obj_x, 0), P(obj_y, 0), -viewport_gui.X, -viewport_gui.Y, viewport_gui);
                      } else {
                        check_x = game_x;
                        check_y = game_y;
                        obj.GetViewPos(P(obj_x, 0), P(obj_y, 0), x, y, viewport_game);
                      }
                      if ($.Inside$f32$i32$f32(Math.fround(check_x - Math.fround(obj_x[0] + Math.fround(obj.Shape.x))), 0, Math.fround(Math.fround(obj.Shape.Wdt) - Math.fround(1)))) {
                        if ($.Inside$f32$i32$f32(Math.fround(check_y - Math.fround(Math.fround(obj_y[0] + Math.fround(obj.Shape.y)) - Math.fround(obj.addtop()))), 0, Math.fround((obj.Shape.Hgt + obj.addtop() | 0) - 1 | 0))) {
                          return obj;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      } finally { $t2.$dtor(); $t3.$dtor(); }
      if (obj_list === $.Objects.ForeObjects) {
        obj_list = $.Objects;
      } else {
        obj_list = null;
      }
    }
    return null;
  }

  ObjectCount(id) {
    let $t1, $t2, $t3;
    let def = null;
    if (id.op_ne($.C4ID.None)) {
      if (!((def = $.C4Id2Def(id.$clone())) != null)) {
        return 0;
      }
      return def.Count;
    }
    let count = 0;
    $t1 = $.Objects;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    try {
      for (; $t2.op_ne($t3); $t2.op_inc$v()) {
        const obj = $t2.op_mul();
        if (obj.Status !== 0) {
          count = count + 1 | 0;
        }
      }
    } finally { $t2.$dtor(); $t3.$dtor(); }
    return count;
  }

  CastObjects(id, creator, amount, level, x, y, owner = -1, controller = -1, out_objects = null) {
    let out_obj_size = 0;
    if (out_objects != null) {
      out_obj_size = out_objects.GetSize();
      out_objects.SetSize(out_obj_size + amount | 0);
    }
    for (let count = 0; count < amount; count = count + 1 | 0) {
      let angle = Random(360) | 0;
      let xdir = $.C4REAL10(Random((Math.imul(2, level) + 1 | 0) >>> 0) - (level >>> 0) >>> 0 | 0);
      let ydir = $.C4REAL10(Random((Math.imul(2, level) + 1 | 0) >>> 0) - (level >>> 0) >>> 0 | 0);
      let rdir = $.itofix$i32(Random(3) + 1 >>> 0 | 0);
      let obj = this.CreateObject$C4ID$pC4Object$i32$i32$i32$i32$b$C4Fixed$C4Fixed$C4Fixed$i32(id.$clone(), creator, owner, x, y, angle, false, xdir.$clone(), ydir.$clone(), rdir.$clone(), controller);
      if (obj != null && obj.Status !== 0 && out_objects != null) {
        out_objects.op_index$i32(out_obj_size + count | 0).$assign($.C4VObj(obj));
      }
    }
  }

  PlaceVegetation(PropList, x, y, wdt, hgt, growth, shape_proplist, out_pos_proplist) {
    let cnt = 0;
    const iTx = [0];
    const iTy = [0];
    let iMaterial = 0;
    let pDef = null;
    if (PropList == null || !((pDef = PropList.GetDef$v()) != null)) {
      return null;
    }
    if (growth <= 0) {
      growth = 100000;
    }
    switch (PropList.GetPropertyInt(83 /*P_Placement*/)) {
      case 0:
        for (cnt = 0; cnt < 20; cnt = cnt + 1 | 0) {
          if (!PlaceVegetation_GetRandomPoint(x, y, wdt, hgt, shape_proplist, out_pos_proplist, P(iTx, 0), P(iTy, 0))) {
            break;
          }
          while (iTy[0] > 0 && $.Landscape.GetBackPix(iTx[0], iTy[0]) === 0) {
            iTy[0] = iTy[0] - 1 | 0;
          }
          if (!$.AboveSemiSolid(P(iTx, 0), P(iTy, 0)) || !$.Inside$i32$i32$i32$3(iTy[0], 50, $.Landscape.GetHeight() - 50 | 0)) {
            continue;
          }
          if (!PlaceVegetation_IsPosInBounds(iTx[0], iTy[0], x, y, wdt, hgt, shape_proplist)) {
            continue;
          }
          if ($.GBackSemiSolid(iTx[0], iTy[0] - pDef.Shape.Hgt | 0) || $.GBackSemiSolid(iTx[0], iTy[0] - (pDef.Shape.Hgt / 2 | 0) | 0)) {
            continue;
          }
          if ($.GBackSemiSolid(iTx[0] - (pDef.Shape.Wdt / 2 | 0) | 0, iTy[0] - (Math.imul(pDef.Shape.Hgt, 2) / 3 | 0) | 0) || $.GBackSemiSolid(iTx[0] + (pDef.Shape.Wdt / 2 | 0) | 0, iTy[0] - (Math.imul(pDef.Shape.Hgt, 2) / 3 | 0) | 0)) {
            continue;
          }
          iTy[0] = iTy[0] + 3 | 0;
          iMaterial = $.GBackMat(iTx[0], iTy[0]);
          if (iMaterial !== -1) {
            if ($oidx($.MaterialMap.Map, iMaterial).Soil !== 0) {
              iTy[0] = iTy[0] + 5 | 0;
              return this.CreateObjectConstruction(PropList, null, -1, iTx[0], iTy[0], growth);
            }
          }
        }
        break;
      case 1:
        if (!PlaceVegetation_GetRandomPoint(x, y, wdt, hgt, shape_proplist, out_pos_proplist, P(iTx, 0), P(iTy, 0))) {
          return null;
        }
        if (!$.FindSurfaceLiquid(P(iTx, 0), P(iTy, 0), pDef.Shape.Wdt, pDef.Shape.Hgt)) {
          if (!$.FindLiquid(P(iTx, 0), P(iTy, 0), pDef.Shape.Wdt, pDef.Shape.Hgt)) {
            return null;
          }
        }
        if (!$.SemiAboveSolid(P(iTx, 0), P(iTy, 0))) {
          return null;
        }
        iTy[0] = iTy[0] + 3 | 0;
        if (!PlaceVegetation_IsPosInBounds(iTx[0], iTy[0], x, y, wdt, hgt, shape_proplist)) {
          return null;
        }
        return this.CreateObjectConstruction(PropList, null, -1, iTx[0], iTy[0], growth);
        break;
      case 3:
        for (cnt = 0; cnt < 5; cnt = cnt + 1 | 0) {
          if (!PlaceVegetation_GetRandomPoint(x, y, wdt, hgt, shape_proplist, out_pos_proplist, P(iTx, 0), P(iTy, 0))) {
            break;
          }
          if (!$.FindTunnel(P(iTx, 0), P(iTy, 0), pDef.Shape.Wdt, pDef.Shape.Hgt)) {
            continue;
          }
          if (!$.AboveSemiSolid(P(iTx, 0), P(iTy, 0))) {
            continue;
          }
          if (!PlaceVegetation_IsPosInBounds(iTx[0], iTy[0], x, y, wdt, hgt, shape_proplist)) {
            continue;
          }
          iTy[0] = iTy[0] + 3 | 0;
          iMaterial = $.GBackMat(iTx[0], iTy[0]);
          if (iMaterial !== -1) {
            if ($oidx($.MaterialMap.Map, iMaterial).Soil !== 0) {
              iTy[0] = iTy[0] + 5 | 0;
              return this.CreateObjectConstruction(PropList, null, -1, iTx[0], iTy[0], growth);
            }
          }
        }
      case 4:
        for (cnt = 0; cnt < 20; cnt = cnt + 1 | 0) {
          if (!PlaceVegetation_GetRandomPoint(x, y, wdt, hgt, shape_proplist, out_pos_proplist, P(iTx, 0), P(iTy, 0))) {
            break;
          }
          if (!$.AboveSemiSolid(P(iTx, 0), P(iTy, 0)) || !$.Inside$i32$i32$i32$3(iTy[0], 50, $.Landscape.GetHeight() - 50 | 0)) {
            continue;
          }
          if ($.GBackSemiSolid(iTx[0], iTy[0] - pDef.Shape.Hgt | 0) || $.GBackSemiSolid(iTx[0], iTy[0] - (pDef.Shape.Hgt / 2 | 0) | 0)) {
            continue;
          }
          if (!PlaceVegetation_IsPosInBounds(iTx[0], iTy[0], x, y, wdt, hgt, shape_proplist)) {
            continue;
          }
          if ($.GBackSemiSolid(iTx[0] - (pDef.Shape.Wdt / 2 | 0) | 0, iTy[0] - (Math.imul(pDef.Shape.Hgt, 2) / 3 | 0) | 0) || $.GBackSemiSolid(iTx[0] + (pDef.Shape.Wdt / 2 | 0) | 0, iTy[0] - (Math.imul(pDef.Shape.Hgt, 2) / 3 | 0) | 0)) {
            continue;
          }
          iTy[0] = iTy[0] + 3 | 0;
          iMaterial = $.GBackMat(iTx[0], iTy[0]);
          if (iMaterial !== -1) {
            if ($oidx($.MaterialMap.Map, iMaterial).Soil !== 0) {
              iTy[0] = iTy[0] + 5 | 0;
              return this.CreateObjectConstruction(PropList, null, -1, iTx[0], iTy[0], growth);
            }
          }
        }
    }
    return null;
  }

  PlaceAnimal(PropList) {
    let pDef = null;
    if (PropList == null || !((pDef = PropList.GetDef$v()) != null)) {
      return null;
    }
    const iX = [0];
    const iY = [0];
    switch (PropList.GetPropertyInt(83 /*P_Placement*/)) {
      case 0:
        iX[0] = Random($.Landscape.GetWidth() >>> 0) | 0;
        iY[0] = Random($.Landscape.GetHeight() >>> 0) | 0;
        if (!$.FindSolidGround(P(iX, 0), P(iY, 0), pDef.Shape.Wdt)) {
          return null;
        }
        break;
      case 1:
        iX[0] = Random($.Landscape.GetWidth() >>> 0) | 0;
        iY[0] = Random($.Landscape.GetHeight() >>> 0) | 0;
        if (!$.FindSurfaceLiquid(P(iX, 0), P(iY, 0), pDef.Shape.Wdt, pDef.Shape.Hgt)) {
          if (!$.FindLiquid(P(iX, 0), P(iY, 0), pDef.Shape.Wdt, pDef.Shape.Hgt)) {
            return null;
          }
        }
        iY[0] = iY[0] + (pDef.Shape.Hgt / 2 | 0) | 0;
        break;
      case 2:
        iX[0] = Random($.Landscape.GetWidth() >>> 0) | 0;
        for (iY[0] = 0; iY[0] < $.Landscape.GetHeight() && !$.GBackSemiSolid(iX[0], iY[0]); iY[0] = iY[0] + 1 | 0) {
        }
        if (iY[0] <= 0) {
          return null;
        }
        iY[0] = Random(iY[0] >>> 0) | 0;
        break;
      default:
        return null;
    }
    return this.CreateObject$pC4PropList$pC4Object$i32$i32$i32$i32$b$C4Fixed$C4Fixed$C4Fixed$i32(PropList, null, -1, iX[0], iY[0]);
  }

  GRBroadcast(function_, pars = null, pass_error = false, reject_test = false) {
    let func = StdString.of(function_);
    if (func.d[0] !== 126) {
      func.insert(0, 1, 126);
    }
    let result = $.Objects.GRBroadcast(func.c_str(), pars, pass_error, reject_test);
    if (reject_test && !result.op_not()) {
      return result;
    }
    return $.GameScript.Call(func.c_str(), pars, pass_error);
  }

  LoadScenarioSection(section_name, flags) {
    let $t1, $t2, $t3, $t4, $t5, $t6;
    let group = new $.C4Group().init();
    let section_group = null;
    if (this.pCurrentScenarioSection == null) {
      if (!($rd(P(this.CurrentScenarioSection, 0)) !== 0)) {
        $.SCopy$pi8$pi8$u64($.C4ScenSect_Main, P(this.CurrentScenarioSection, 0), 30);
      }
      this.pCurrentScenarioSection = new $.C4ScenarioSection().init(P(this.CurrentScenarioSection, 0));
      this.pCurrentScenarioSection.pObjectScripts = $.Game.pScenarioObjectsScript;
    }
    let section_to_load = this.pScenarioSections;
    while (section_to_load != null) {
      if ($.SEqualNoCase(section_to_load.name.getData(), section_name)) {
        break;
      } else {
        section_to_load = section_to_load.pNext;
      }
    }
    if (section_to_load == null) {
      $.DebugLogF(S("LoadScenarioSection: scenario section %s not found!"), section_name);
      return false;
    }
    if (section_to_load !== this.pCurrentScenarioSection && (flags & 3) >>> 0 !== 0) {
      if (!this.pCurrentScenarioSection.EnsureTempStore(!((flags & 1) >>> 0 !== 0), !((flags & 2) >>> 0 !== 0))) {
        $.DebugLogF(S("LoadScenarioSection(%s): could not extract section files of current section %s"), section_name, this.pCurrentScenarioSection.name.getData());
        return false;
      }
      if (!((section_group = this.pCurrentScenarioSection.GetGroupfile(group)) != null)) {
        $.DebugLog(S("LoadScenarioSection: error opening current group file"));
        return false;
      }
      if ((flags & 1) >>> 0 !== 0) {
        let scenario = this.C4S.$clone();
        scenario.SetExactLandscape();
        if (!scenario.Save(section_group, true)) {
          $.DebugLog(S("LoadScenarioSection: Error saving C4S"));
          return false;
        }
        {
          let DBGRECOFF = new $.C4DebugRecOff().init$v();
          try {
            if (!$.Landscape.Save(section_group)) {
              $.DebugLog(S("LoadScenarioSection: Error saving Landscape"));
              return false;
            }
          } finally { DBGRECOFF && DBGRECOFF.$dtor(); }
        }
        if (!$.PXS.Save(section_group)) {
          $.DebugLog(S("LoadScenarioSection: Error saving PXS"));
          return false;
        }
        let MassMoverSet = new $.C4MassMoverSet().init();
        MassMoverSet.Copy($.MassMover);
        if (!MassMoverSet.Save(section_group)) {
          $.DebugLog(S("LoadScenarioSection: Error saving MassMover"));
          return false;
        }
      }
      if ((flags & 2) >>> 0 !== 0) {
        let numbers = new $.C4ValueNumbers().init();
        if (!this.SaveData(section_group, true, false, false, numbers)) {
          $.DebugLog(S("LoadScenarioSection: Error saving objects"));
          return false;
        }
      }
      if (group.IsOpen()) {
        group.Close$v();
      }
      this.pCurrentScenarioSection.fModified = true;
    }
    if (!((section_group = section_to_load.GetGroupfile(group)) != null)) {
      $.DebugLog(S("LoadScenarioSection: error opening group file"));
      return false;
    }
    $t1 = $.Objects;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    try {
      for (; $t2.op_ne($t3); $t2.op_inc$v()) {
        const obj = $t2.op_mul();
        obj.AssignRemoval();
      }
    } finally { $t2.$dtor(); $t3.$dtor(); }
    $t4 = $.Objects;
    $t5 = $t4.begin();
    $t6 = $t4.end();
    try {
      for (; $t5.op_ne($t6); $t5.op_inc$v()) {
        const obj = $t5.op_mul();
        if (obj.Status !== 0) {
          $.DebugLogF(S("LoadScenarioSection: WARNING: Object %d created in destruction process!"), obj.Number);
          this.ClearPointers(obj);
        }
      }
    } finally { $t5.$dtor(); $t6.$dtor(); }
    this.DeleteObjects(!!((flags & 8) >>> 0 !== 0));
    if ($.ScriptEngine.pGlobalEffects != null && !((flags & 4) >>> 0 !== 0)) {
      $.ScriptEngine.pGlobalEffects.ClearAll(3);
    }
    if ($.GameScript.pScenarioEffects != null && !((flags & 4) >>> 0 !== 0)) {
      $.GameScript.pScenarioEffects.ClearAll(3);
    }
    $.Particles.ClearAllParticles();
    this.TransferZones.Clear();
    let old_sky = new StdString();
    old_sky.assign(this.C4S.Landscape.SkyDef);
    let is_main_section = $.SEqualNoCase(section_to_load.name.getData(), $.C4ScenSect_Main);
    this.C4S.Load(section_group, true, is_main_section);
    let should_load_new_sky = !$.SEqualNoCase(old_sky.c_str(), this.C4S.Landscape.SkyDef.c_str()) || section_group.FindEntry$pi8$pStdStrBuf$pu64(S("Sky.*"));
    $.Game.pScenarioObjectsScript = section_to_load.pObjectScripts;
    $.Viewports.DisableFoW();
    this.RandomSeed = Random(0x7fffffff) | 0;
    this.FixRandom(u64(BigInt(this.RandomSeed)));
    let numbers = new $.C4ValueNumbers().init();
    if (!this.InitGame(section_group, (flags & 8) >>> 0 !== 0 ? 2 /*IM_ReInit*/ : 1 /*IM_Section*/, should_load_new_sky, numbers)) {
      $.DebugLog(S("LoadScenarioSection: Error reiniting game"));
      $.Viewports.EnableFoW();
      return false;
    }
    $.C4PropListNumbered.UnshelveNumberedPropLists();
    this.pCurrentScenarioSection = section_to_load;
    $.SCopy$pi8$pi8(this.pCurrentScenarioSection.name.getData(), P(this.CurrentScenarioSection, 0));
    if ((flags & 8) >>> 0 !== 0) {
      this.InitGameFinal(2 /*IM_ReInit*/);
      if ($.Game.InitialPlayersJoined && $.Players.GetCount$v() !== 0) {
        $.Game.GRBroadcast(S("~InitializePlayers"));
      }
    }
    $.Viewports.RecalculateViewports();
    $.Viewports.EnableFoW();
    return true;
  }

  CreateSectionFromTempFile(section_name, temp_filename) {
    let existing_section = this.pScenarioSections;
    let prev = null;
    while (existing_section != null) {
      if ($.SEqualNoCase(existing_section.name.getData(), section_name)) {
        break;
      } else {
        existing_section = (prev = existing_section).pNext;
      }
    }
    let deleted_current_section = false;
    if (existing_section != null) {
      deleted_current_section = existing_section === this.pCurrentScenarioSection;
      if (deleted_current_section) {
        this.pCurrentScenarioSection = null;
        this.pScenarioObjectsScript = null;
      }
      if (existing_section.pObjectScripts != null) {
        $delete(existing_section.pObjectScripts);
      }
      if (prev != null) {
        prev.pNext = existing_section.pNext;
      } else {
        this.pScenarioSections = existing_section.pNext;
      }
      existing_section.pNext = null;
      $delete(existing_section);
    }
    let new_section = new $.C4ScenarioSection().init(section_name);
    if (!new_section.ScenarioLoad(temp_filename, true)) {
      this.pScenarioSections = new_section.pNext;
      new_section.pNext = null;
      $delete(new_section);
      return false;
    }
    if (deleted_current_section) {
      this.pCurrentScenarioSection = new_section;
      this.pScenarioObjectsScript = new_section.pObjectScripts;
    }
    this.ReLinkScriptEngine();
    return !(new_section == null);
  }

  DrawTextSpecImage(target, spec, transform, color = 255) {
    0;
    if (spec == null) {
      return false;
    }
    let source = new $.C4Facet().init$v();
    if (GetTextSpecFacet(spec, source)) {
      source.DrawXT(target.Surface, target.X, target.Y, ftoi32(target.Wdt), ftoi32(target.Hgt), 0, 0, transform);
      return true;
    } else {
      let def = $.C4Id2Def(new $.C4ID().init$string(StdString.of(spec)));
      if (def == null) {
        return false;
      }
      def.Draw$rC4Facet$b$u32$pC4Object$i32$i32$pC4DrawTransform$pi8(target, false, color, null, 0, 0, transform);
      return true;
    }
  }

  GetTextSpecImageAspect(spec) {
    0;
    if (spec == null) {
      return -1;
    }
    let source = new $.C4Facet().init$v();
    if (GetTextSpecFacet(spec, source)) {
      return Math.fround(source.Wdt / source.Hgt);
    } else {
      let def = $.C4Id2Def(new $.C4ID().init$string(StdString.of(spec)));
      if (def == null) {
        return -1;
      }
      let gfx = def.Graphics;
      if (gfx.Type === 1) {
        return Math.fround(Math.fround(def.PictureRect.Wdt) / Math.fround(def.PictureRect.Hgt));
      } else if (gfx.Type === 2) {
        const mesh = gfx.$u1.Mesh;
        const box = mesh.GetBoundingBox();
        return Math.fround(Math.fround(box.x2 - box.x1) / Math.fround(box.y2 - box.y1));
      }
      return -1;
    }
  }

  DrawPropListSpecImage(target, spec) {
    0;
    if (spec == null) {
      return false;
    }
    let source_def_proplist = spec.GetPropertyPropList(140 /*P_Source*/);
    if (source_def_proplist == null) {
      return false;
    }
    let source_def = source_def_proplist.GetDef$v();
    if (source_def == null) {
      return false;
    }
    let color = spec.GetPropertyInt(141 /*P_Color*/) >>> 0;
    let source_name = spec.GetPropertyStr(1 /*P_Name*/);
    if (source_name == null) {
      source_def.Draw$rC4Facet$b$u32$pC4Object$i32$i32$pC4DrawTransform$pi8(target, false, color);
    } else {
      let source_graphics = source_def.Graphics.Get(source_name.GetCStr());
      if (source_graphics == null) {
        return false;
      }
      source_graphics.Draw(target, color, null, 0, 0, null);
    }
    return true;
  }

  SpeedUp() {
    this.FrameSkip = $.Clamp$i32$i32$i32(this.FrameSkip + 1 | 0, 1, 50);
    this.FullSpeed = true;
    $.GraphicsSystem.FlashMessage($.FormatString($.LoadResStr(S("IDS_MSG_SPEED")), this.FrameSkip).getData());
    return true;
  }

  SlowDown() {
    this.FrameSkip = $.Clamp$i32$i32$i32(this.FrameSkip - 1 | 0, 1, 50);
    if (this.FrameSkip === 1) {
      this.FullSpeed = false;
    }
    $.GraphicsSystem.FlashMessage($.FormatString($.LoadResStr(S("IDS_MSG_SPEED")), this.FrameSkip).getData());
    return true;
  }

  InitKeyboard() {
    let Keys = [];
    this.KeyboardInput.Clear();
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(61), S("MusicToggle"), 18, new $.C4KeyCB$C4MusicSystem().init($.Application.MusicSystem, "ToggleOnOff")));
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(67), S("Screenshot"), 6, new $.C4KeyCBEx$C4GraphicsSystem$b().init($.GraphicsSystem, false, "SaveScreenshotKey")));
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(67, 2), S("ScreenshotEx"), 4 /*KEYSCOPE_Fullscreen*/, new $.C4KeyCBEx$C4GraphicsSystem$b().init($.GraphicsSystem, true, "SaveScreenshotKey")));
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(46, 1), S("ToggleChat"), 18, new $.C4KeyCB$C4Game().init(this, "ToggleChat")));
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(59), S("ToggleShowHelp"), 16 /*KEYSCOPE_Generic*/, new $.C4KeyCB$C4GraphicsSystem().init($.GraphicsSystem, "ToggleShowHelp")));
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(62), S("NetClientListDlgToggle"), 16 /*KEYSCOPE_Generic*/, new $.C4KeyCB$C4Network2().init($.Network, "ToggleClientListDlg")));
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(63), S("ZoomIn"), 16 /*KEYSCOPE_Generic*/, new $.C4KeyCB$C4ViewportList().init($.Viewports, "ViewportZoomIn")));
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(64), S("ZoomOut"), 16 /*KEYSCOPE_Generic*/, new $.C4KeyCB$C4ViewportList().init($.Viewports, "ViewportZoomOut")));
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(63, 2), S("DbgModeToggle"), 16 /*KEYSCOPE_Generic*/, new $.C4KeyCB$C4Game().init(this, "ToggleDebugMode")));
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(64, 2), S("DbgShowVtxToggle"), 16 /*KEYSCOPE_Generic*/, new $.C4KeyCB$C4GraphicsSystem().init($.GraphicsSystem, "ToggleShowVertices")));
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(65, 2), S("DbgShowActionToggle"), 16 /*KEYSCOPE_Generic*/, new $.C4KeyCB$C4GraphicsSystem().init($.GraphicsSystem, "ToggleShowAction")));
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(66, 2), S("DbgShow8BitSurface"), 16 /*KEYSCOPE_Generic*/, new $.C4KeyCB$C4GraphicsSystem().init($.GraphicsSystem, "ToggleShow8BitSurface")));
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(78, 4), S("GameSpeedUp"), 16 /*KEYSCOPE_Generic*/, new $.C4KeyCB$C4Game().init(this, "SpeedUp")));
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(74, 4), S("GameSlowDown"), 16 /*KEYSCOPE_Generic*/, new $.C4KeyCB$C4Game().init(this, "SlowDown")));
    Keys.length = 0;
    $vpush(Keys, new $.C4KeyCodeEx().init(105));
    if ($.Config.Controls.GamepadGuiControl !== 0) {
      $.Left(Keys);
    }
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$vector$pi8$i32$pC4KeyboardCallbackInterface$u32(Keys.slice(), S("FullscreenMenuLeft"), 32 /*KEYSCOPE_FullSMenu*/, new $.C4KeyCBEx$C4FullScreen$u8().init($.FullScreen, $.COM_MenuLeft$C4Constants, "MenuKeyControl")));
    Keys.length = 0;
    $vpush(Keys, new $.C4KeyCodeEx().init(106));
    if ($.Config.Controls.GamepadGuiControl !== 0) {
      $.Right(Keys);
    }
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$vector$pi8$i32$pC4KeyboardCallbackInterface$u32(Keys.slice(), S("FullscreenMenuRight"), 32 /*KEYSCOPE_FullSMenu*/, new $.C4KeyCBEx$C4FullScreen$u8().init($.FullScreen, $.COM_MenuRight$C4Constants, "MenuKeyControl")));
    Keys.length = 0;
    $vpush(Keys, new $.C4KeyCodeEx().init(103));
    if ($.Config.Controls.GamepadGuiControl !== 0) {
      $.Up(Keys);
    }
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$vector$pi8$i32$pC4KeyboardCallbackInterface$u32(Keys.slice(), S("FullscreenMenuUp"), 32 /*KEYSCOPE_FullSMenu*/, new $.C4KeyCBEx$C4FullScreen$u8().init($.FullScreen, $.COM_MenuUp$C4Constants, "MenuKeyControl")));
    Keys.length = 0;
    $vpush(Keys, new $.C4KeyCodeEx().init(108));
    if ($.Config.Controls.GamepadGuiControl !== 0) {
      $.Down(Keys);
    }
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$vector$pi8$i32$pC4KeyboardCallbackInterface$u32(Keys.slice(), S("FullscreenMenuDown"), 32 /*KEYSCOPE_FullSMenu*/, new $.C4KeyCBEx$C4FullScreen$u8().init($.FullScreen, $.COM_MenuDown$C4Constants, "MenuKeyControl")));
    Keys.length = 0;
    $vpush(Keys, new $.C4KeyCodeEx().init(57));
    $vpush(Keys, new $.C4KeyCodeEx().init(28));
    if ($.Config.Controls.GamepadGuiControl !== 0) {
      $.Ok(Keys);
    }
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$vector$pi8$i32$pC4KeyboardCallbackInterface$u32(Keys.slice(), S("FullscreenMenuOK"), 32 /*KEYSCOPE_FullSMenu*/, new $.C4KeyCBEx$C4FullScreen$u8().init($.FullScreen, $.COM_MenuEnter$C4Constants, "MenuKeyControl")));
    Keys.length = 0;
    $vpush(Keys, new $.C4KeyCodeEx().init(1));
    if ($.Config.Controls.GamepadGuiControl !== 0) {
      $.Cancel(Keys);
    }
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$vector$pi8$i32$pC4KeyboardCallbackInterface$u32(Keys.slice(), S("FullscreenMenuCancel"), 32 /*KEYSCOPE_FullSMenu*/, new $.C4KeyCBEx$C4FullScreen$u8().init($.FullScreen, $.COM_MenuClose$C4Constants, "MenuKeyControl")));
    Keys.length = 0;
    $vpush(Keys, new $.C4KeyCodeEx().init(57));
    if ($.Config.Controls.GamepadGuiControl !== 0) {
      $.Any(Keys);
    }
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$vector$pi8$i32$pC4KeyboardCallbackInterface$u32(Keys.slice(), S("FullscreenMenuOpen"), 128 /*KEYSCOPE_FreeView*/, new $.C4KeyCB$C4FullScreen().init($.FullScreen, "ActivateMenuMain")));
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(106), S("FilmNextPlayer"), 64 /*KEYSCOPE_FilmView*/, new $.C4KeyCB$C4ViewportList().init($.Viewports, "ViewportNextPlayer")));
    Keys.length = 0;
    $vpush(Keys, new $.C4KeyCodeEx().init(28));
    $vpush(Keys, new $.C4KeyCodeEx().init(60));
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$vector$pi8$i32$pC4KeyboardCallbackInterface$u32(Keys.slice(), S("ChatOpen"), 16 /*KEYSCOPE_Generic*/, new $.C4KeyCBEx$C4MessageInput$b().init($.MessageInput, false, "KeyStartTypeIn")));
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(28, 4), S("ChatOpen2Allies"), 16 /*KEYSCOPE_Generic*/, new $.C4KeyCBEx$C4MessageInput$b().init($.MessageInput, true, "KeyStartTypeIn")));
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(105), S("FreeViewScrollLeft"), 128 /*KEYSCOPE_FreeView*/, new $.C4KeyCBEx$C4ViewportList$C4Vec2D().init($.Viewports, new $.C4Vec2D().init(-5, 0), "FreeScroll")));
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(106), S("FreeViewScrollRight"), 128 /*KEYSCOPE_FreeView*/, new $.C4KeyCBEx$C4ViewportList$C4Vec2D().init($.Viewports, new $.C4Vec2D().init(5, 0), "FreeScroll")));
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(103), S("FreeViewScrollUp"), 128 /*KEYSCOPE_FreeView*/, new $.C4KeyCBEx$C4ViewportList$C4Vec2D().init($.Viewports, new $.C4Vec2D().init(0, -5), "FreeScroll")));
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(108), S("FreeViewScrollDown"), 128 /*KEYSCOPE_FreeView*/, new $.C4KeyCBEx$C4ViewportList$C4Vec2D().init($.Viewports, new $.C4Vec2D().init(0, 5), "FreeScroll")));
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(15), S("ScoreboardToggle"), 16 /*KEYSCOPE_Generic*/, new $.C4KeyCB$C4Scoreboard().init(this.Scoreboard, "KeyUserShow")));
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(1), S("GameAbort"), 4 /*KEYSCOPE_Fullscreen*/, new $.C4KeyCB$C4FullScreen().init($.FullScreen, "ShowAbortDlg")));
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(119), S("FullscreenPauseToggle"), 4 /*KEYSCOPE_Fullscreen*/, new $.C4KeyCB$C4Game().init($.Game, "TogglePause")));
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(119), S("ConsolePauseToggle"), 8 /*KEYSCOPE_Console*/, new $.C4KeyCB$C4Console().init($.Console, "TogglePause")));
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(78), S("ToolsDlgGradeUp"), 8 /*KEYSCOPE_Console*/, new $.C4KeyCBEx$C4ToolsDlg$i32().init($.Console.ToolsDlg, 5, "ChangeGrade")));
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(74), S("ToolsDlgGradeDown"), 8 /*KEYSCOPE_Console*/, new $.C4KeyCBEx$C4ToolsDlg$i32().init($.Console.ToolsDlg, -5, "ChangeGrade")));
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(50, 2), S("ToolsDlgPopMaterial"), 8 /*KEYSCOPE_Console*/, new $.C4KeyCB$C4ToolsDlg().init($.Console.ToolsDlg, "PopMaterial")));
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(20, 2), S("ToolsDlgPopTextures"), 8 /*KEYSCOPE_Console*/, new $.C4KeyCB$C4ToolsDlg().init($.Console.ToolsDlg, "PopTextures")));
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(23, 2), S("ToolsDlgIFTToggle"), 8 /*KEYSCOPE_Console*/, new $.C4KeyCB$C4ToolsDlg().init($.Console.ToolsDlg, "ToggleIFT")));
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(17, 2), S("ToolsDlgToolToggle"), 8 /*KEYSCOPE_Console*/, new $.C4KeyCB$C4ToolsDlg().init($.Console.ToolsDlg, "ToggleTool")));
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(111), S("EditCursorDelete"), 8 /*KEYSCOPE_Console*/, new $.C4KeyCB$C4EditCursor().init($.Console.EditCursor, "Delete")));
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(0), S("EditCursorModeToggle"), 8 /*KEYSCOPE_Console*/, new $.C4KeyCB$C4EditCursor().init($.Console.EditCursor, "ToggleMode")));
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(0), S("ChartToggle"), 18, new $.C4KeyCB$C4Game().init(this, "ToggleChart")));
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(0), S("NetObsNextPlayer"), 128 /*KEYSCOPE_FreeView*/, new $.C4KeyCB$C4ViewportList().init($.Viewports, "ViewportNextPlayer")));
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(0), S("CtrlRateDown"), 16 /*KEYSCOPE_Generic*/, new $.C4KeyCBEx$C4GameControl$i32().init($.Control$2, -1, "KeyAdjustControlRate")));
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(0), S("CtrlRateUp"), 16 /*KEYSCOPE_Generic*/, new $.C4KeyCBEx$C4GameControl$i32().init($.Control$2, 1, "KeyAdjustControlRate")));
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(0), S("NetAllowJoinToggle"), 16 /*KEYSCOPE_Generic*/, new $.C4KeyCB$C4Network2().init($.Network, "ToggleAllowJoin")));
    this.KeyboardInput.RegisterKey(new $.C4CustomKey().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(0), S("NetStatsToggle"), 16 /*KEYSCOPE_Generic*/, new $.C4KeyCB$C4GraphicsSystem().init($.GraphicsSystem, "ToggleShowNetStatus")));
    this.KeyboardInput.LoadCustomConfig();
    return true;
  }

  UpdateLanguage() {
    $.C4Language.LoadComponentHost(this.MainSysLangStringTable, $.Application.SystemGroup, S("StringTbl.txt|StringTbl%s.txt"), P($.Config.General.LanguageEx, 0));
  }

  InitPlayerControlSettings() {
    let PlayerControlFile = new $.C4PlayerControlFile().None();
    if (!PlayerControlFile.Load($.Application.SystemGroup, S("PlayerControls.txt"), this.MainSysLangStringTable)) {
      $.LogFatal(S("[!]Error loading player controls"));
      return false;
    }
    this.PlayerControlDefs.$assign(PlayerControlFile.GetControlDefs());
    this.PlayerControlDefaultAssignmentSets.Clear();
    this.PlayerControlDefaultAssignmentSets.MergeFrom(PlayerControlFile.GetAssignmentSets(), 0 /*MM_Normal*/);
    this.PlayerControlDefaultAssignmentSets.ResolveRefs(this.PlayerControlDefs);
    if (!this.InitPlayerControlUserSettings()) {
      return false;
    }
    return true;
  }

  InitPlayerControlUserSettings() {
    this.PlayerControlUserAssignmentSets.Clear();
    this.PlayerControlUserAssignmentSets.MergeFrom(this.PlayerControlDefaultAssignmentSets, 2 /*MM_Inherit*/);
    this.PlayerControlUserAssignmentSets.MergeFrom($.Config.Controls.UserSets, 3 /*MM_ConfigOverload*/);
    this.PlayerControlUserAssignmentSets.ResolveRefs(this.PlayerControlDefs);
    return true;
  }

  SetDefaultGamma() {
    if ($.pDraw == null) {
      return;
    }
    $.pDraw.ResetGamma();
    $.pDraw.SetGamma(Math.fround(Math.fround($.Config.Graphics.Gamma) / 100), Math.fround(Math.fround($.Config.Graphics.Gamma) / 100), Math.fround(Math.fround($.Config.Graphics.Gamma) / 100), 8);
  }

  Default() {
    this.PointersDenumerated = false;
    this.IsRunning = false;
    this.FrameCounter = 0;
    this.GameOver = this.GameOverDlgShown = this.InitialPlayersJoined = false;
    this.ScenarioFilename[0] = 0;
    this.PlayerFilenames[0] = 0;
    this.DefinitionFilenames[0] = 0;
    this.DirectJoinAddress[0] = 0;
    this.pJoinReference = null;
    this.StartupPlayerCount = 0;
    this.StartupTeamCount = 0;
    this.ScenarioTitle.Ref$pi8(S(""));
    this.HaltCount = 0;
    this.fReferenceDefinitionOverride = false;
    this.Evaluated = false;
    this.EvaluateOnAbort = false;
    this.TimeGo = false;
    this.Time = 0;
    this.StartTime = 0;
    this.InitProgress = 0;
    this.LastInitProgress = 0;
    this.FPS = this.cFPS = 0;
    this.fScriptCreatedObjects = false;
    this.fLobby = this.fObserve = false;
    this.iLobbyTimeout = 0;
    this.iTick2 = this.iTick3 = this.iTick5 = this.iTick10 = this.iTick35 = this.iTick255 = this.iTick1000 = 0;
    this.FullSpeed = false;
    this.FrameSkip = 1;
    this.DoSkipFrame = false;
    $.Definitions.Default();
    $.MaterialMap.Default();
    $.Objects.Default();
    $.Players.Default();
    $.Weather.Default();
    $.Landscape.Default();
    $.DefaultRanks.Default();
    $.MassMover.Default();
    $.PXS.Default();
    $.GraphicsSystem.Default();
    this.C4S.Default();
    $.Messages.Default();
    $.MessageInput.Default();
    $.MouseControl.Default();
    this.PathFinder.Default();
    this.TransferZones.Default();
    this.GroupSet.Default();
    this.pParentGroup = null;
    this.pScenarioSections = this.pCurrentScenarioSection = null;
    $wr(P(this.CurrentScenarioSection, 0), 0, 0);
    this.fResortAnyObject = false;
    this.pNetworkStatistics = null;
    $.Application.MusicSystem.ClearGame();
    this.DebugPort = 0;
    this.DebugPassword.Clear();
    this.DebugHost.Clear();
    this.DebugWait = 0;
    0;
    this.ScriptGuiRoot = null;
  }

  InitInEarth() {
    let maxvid = 100;
    let cnt = 0;
    let vidnum = 0;
    const vidlist = $oarr(100, () => new $.C4ID().init$v());
    let amt = Math.imul(Math.imul($.Landscape.GetWidth(), $.Landscape.GetHeight()) / 5000 | 0, this.C4S.Landscape.InEarthLevel.Evaluate()) / 100 | 0;
    vidnum = ListExpandValids(this.C4S.Landscape.InEarth, $oat(vidlist, 0), 100);
    if (vidnum > 0) {
      for (cnt = 0; cnt < amt; cnt = cnt + 1 | 0) {
        this.PlaceInEarth(vidlist[Random(vidnum >>> 0)].$clone());
      }
    }
  }

  InitVegetation() {
    let maxvid = 100;
    let cnt = 0;
    let vidnum = 0;
    const vidlist = $oarr(100, () => new $.C4ID().init$v());
    let amt = Math.imul($.Landscape.GetWidth() / 50 | 0, this.C4S.Landscape.VegLevel.Evaluate()) / 100 | 0;
    vidnum = ListExpandValids(this.C4S.Landscape.Vegetation, $oat(vidlist, 0), 100);
    if (vidnum > 0) {
      for (cnt = 0; cnt < amt; cnt = cnt + 1 | 0) {
        this.PlaceVegetation($.C4Id2Def(vidlist[Random(vidnum >>> 0)].$clone()), 0, 0, $.Landscape.GetWidth(), $.Landscape.GetHeight(), -1, null, null);
      }
    }
  }

  InitAnimals() {
    let cnt = 0;
    let cnt2 = 0;
    let idAnimal = new $.C4ID().init$v();
    const iCount = [0];
    for (cnt = 0; idAnimal.$assign(this.C4S.Animals.FreeLife.GetID$u64$pi32($u64n(cnt), P(iCount, 0))).op_unsigned_long_C4ID_() != null; cnt = cnt + 1 | 0) {
      for (cnt2 = 0; cnt2 < iCount[0]; cnt2 = cnt2 + 1 | 0) {
        this.PlaceAnimal($.C4Id2Def(idAnimal.$clone()));
      }
    }
    for (cnt = 0; idAnimal.$assign(this.C4S.Animals.EarthNest.GetID$u64$pi32($u64n(cnt), P(iCount, 0))).op_unsigned_long_C4ID_() != null; cnt = cnt + 1 | 0) {
      for (cnt2 = 0; cnt2 < iCount[0]; cnt2 = cnt2 + 1 | 0) {
        this.PlaceInEarth(idAnimal.$clone());
      }
    }
  }

  InitGoals() {
    let id = new $.C4ID().init$v();
    const amount = [0];
    for (let index = 0; id.$assign(this.Parameters.Goals.GetID$u64$pi32($u64n(index), P(amount, 0))).op_unsigned_long_C4ID_() != null; index = index + 1 | 0) {
      for (let placed = 0; placed < amount[0]; placed = placed + 1 | 0) {
        this.CreateObject$C4ID$pC4Object$i32$i32$i32$i32$b$C4Fixed$C4Fixed$C4Fixed$i32(id.$clone(), null);
      }
    }
  }

  InitRules() {
    let id = new $.C4ID().init$v();
    const amount = [0];
    for (let index = 0; id.$assign(this.Parameters.Rules.GetID$u64$pi32($u64n(index), P(amount, 0))).op_unsigned_long_C4ID_() != null; index = index + 1 | 0) {
      for (let placed = 0; placed < $max(amount[0], 1); placed = placed + 1 | 0) {
        this.CreateObject$C4ID$pC4Object$i32$i32$i32$i32$b$C4Fixed$C4Fixed$C4Fixed$i32(id.$clone(), null);
      }
    }
  }

  InitValueOverloads() {
    let overload_id = new $.C4ID().init$v();
    let def = null;
    for (let i = 0; overload_id.$assign(this.C4S.Game.Realism.ValueOverloads.GetID$u64$pi32($u64n(i))).op_unsigned_long_C4ID_() != null; i = i + 1 | 0) {
      if ((def = $.Definitions.ID2Def(overload_id.$clone())) != null) {
        def.Value = this.C4S.Game.Realism.ValueOverloads.GetIDCount(overload_id.$clone());
      }
    }
  }

  InitEnvironment() {
    let id = new $.C4ID().init$v();
    const amount = [0];
    for (let index = 0; id.$assign(this.C4S.Environment.Objects.GetID$u64$pi32($u64n(index), P(amount, 0))).op_unsigned_long_C4ID_() != null; index = index + 1 | 0) {
      for (let placed = 0; placed < amount[0]; placed = placed + 1 | 0) {
        this.CreateObject$C4ID$pC4Object$i32$i32$i32$i32$b$C4Fixed$C4Fixed$C4Fixed$i32(id.$clone(), null);
      }
    }
  }

  CloseScenario() {
    this.ScenarioFile.Close$v();
    this.GroupSet.CloseFolders();
    this.pParentGroup = null;
    if (this.TempScenarioFile.op_const_void_() != null) {
      $.EraseItem(this.TempScenarioFile.getData());
      this.TempScenarioFile.Clear();
    }
    if (this.pScenarioSections != null) {
      $delete(this.pScenarioSections);
      this.pScenarioSections = this.pCurrentScenarioSection = null;
    }
  }

  DeleteObjects(delete_inactive) {
    $.Objects.DeleteObjects$b(delete_inactive);
    this.fResortAnyObject = false;
  }

  ExecObjects() {
    let $t1, $t2, $t3;
    if ($.Config.General.DebugRec !== 0) {
      $.AddDbgRec(130 /*RCT_Block*/, S("ObjEx"), 6);
    }
    $t1 = $.Objects.reverse();
    $t2 = $t1.begin();
    $t3 = $t1.end();
    try {
      for (; $t2.op_ne($t3); $t2.op_inc$v()) {
        const obj = $t2.op_mul();
        if (obj != null) {
          if (obj.Status !== 0) {
            obj.Execute$v();
          } else if (obj.RemovalDelay > 0) {
            obj.RemovalDelay = obj.RemovalDelay - 1 | 0;
          }
        }
      }
    } finally { $t2.$dtor(); $t3.$dtor(); }
    if ($.Config.General.DebugRec !== 0) {
      $.AddDbgRec(130 /*RCT_Block*/, S("ObjCC"), 6);
    }
    $.Objects.CrossCheck();
    if ($.Config.General.DebugRec !== 0) {
      $.AddDbgRec(130 /*RCT_Block*/, S("ObjRs"), 6);
    }
    if (this.fResortAnyObject) {
      this.fResortAnyObject = false;
      $.Objects.ResortUnsorted();
    }
    if ($.Config.General.DebugRec !== 0) {
      $.AddDbgRec(130 /*RCT_Block*/, S("ObjRm"), 6);
    }
    if ($.Game.iTick255 === 0) {
      this.ObjectRemovalCheck();
    }
  }

  Ticks() {
    this.FrameCounter = this.FrameCounter + 1 | 0;
    this.GameGo = this.FullSpeed;
    if ((this.iTick2 = this.iTick2 + 1 | 0) === 2) {
      this.iTick2 = 0;
    }
    if ((this.iTick3 = this.iTick3 + 1 | 0) === 3) {
      this.iTick3 = 0;
    }
    if ((this.iTick5 = this.iTick5 + 1 | 0) === 5) {
      this.iTick5 = 0;
    }
    if ((this.iTick10 = this.iTick10 + 1 | 0) === 10) {
      this.iTick10 = 0;
    }
    if ((this.iTick35 = this.iTick35 + 1 | 0) === 35) {
      this.iTick35 = 0;
    }
    if ((this.iTick255 = this.iTick255 + 1 | 0) === 255) {
      this.iTick255 = 0;
    }
    if ((this.iTick1000 = this.iTick1000 + 1 | 0) === 1000) {
      this.iTick1000 = 0;
    }
    this.cFPS = this.cFPS + 1 | 0;
    this.TimeGo = true;
    if (this.FrameCounter % this.FrameSkip !== 0) {
      this.DoSkipFrame = true;
    }
    $.Control$2.Ticks();
    if (this.GameGo) {
      $.Application.NextTick();
    }
    if (this.pNetworkStatistics != null) {
      this.pNetworkStatistics.ExecuteFrame();
    }
  }

  CheckObjectEnumeration() {
    let $t1, $t2, $t3, $t4, $t5, $t6;
    let check = new Check();
    $t1 = $.Objects;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    try {
      for (; $t2.op_ne($t3); $t2.op_inc$v()) {
        const obj = $t2.op_mul();
        if (!check.that(obj)) {
          return false;
        }
      }
    } finally { $t2.$dtor(); $t3.$dtor(); }
    $t4 = $.Objects.InactiveObjects;
    $t5 = $t4.begin();
    $t6 = $t4.end();
    try {
      for (; $t5.op_ne($t6); $t5.op_inc$v()) {
        const obj = $t5.op_mul();
        if (!check.that(obj)) {
          return false;
        }
      }
    } finally { $t5.$dtor(); $t6.$dtor(); }
    $.C4PropListNumbered.SetEnumerationIndex(check.maxNumber);
    return true;
  }

  LoadScenarioComponents() {
    this.Info.Load$rC4Group$pi8$pi8(this.ScenarioFile, S("Info.txt"));
    if (this.ScenarioFile.EntryCount(S("Names.txt")) !== 0) {
      this.Names.Load$rC4Group$pi8$pi8(this.ScenarioFile, S("Names.txt"));
    }
    const filename = $ta(Int8Array, 256, [0]);
    this.ScenarioFile.ResetSearch();
    $wr(P(filename, 0), 0, 0);
    while (this.ScenarioFile.FindNextEntry$pi8$pi8$pu64$b(S("Sect*.ocg"), P(filename, 0), null, !!($rd(P(filename, 0)) !== 0))) {
      const section_name = new Int8Array(256);
      let wildcard_pos = $.SCharPos(42, S("Sect*.ocg"));
      $.SCopy$pi8$pi8$u64($padd(P(filename, 0), wildcard_pos), P(section_name, 0), 255);
      $.RemoveExtension$pi8(P(section_name, 0));
      if (c$strlen(P(section_name, 0)) > 30 || !($rd(P(section_name, 0)) !== 0)) {
        $.DebugLog(S("invalid section name"));
        $.LogFatal($.FormatString($.LoadResStr(S("IDS_ERR_SCENSECTION")), P(filename, 0)).getData());
        return false;
      }
      let pSection = new $.C4ScenarioSection().init(P(section_name, 0));
      if (!pSection.ScenarioLoad(P(filename, 0), false)) {
        $.LogFatal($.FormatString($.LoadResStr(S("IDS_ERR_SCENSECTION")), P(filename, 0)).getData());
        return false;
      }
    }
    return true;
  }

  LoadAdditionalSystemGroup(parent_group) {
    let SysGroup = new $.C4Group().init();
    const filename = $ta(Int8Array, 256, [0]);
    if (SysGroup.OpenAsChild(parent_group, S("System.ocg"))) {
      let local_strings = new $.C4LangStringTable().init();
      $.C4Language.LoadComponentHost(local_strings, SysGroup, S("StringTbl.txt|StringTbl%s.txt"), P($.Config.General.LanguageEx, 0));
      if (SysGroup.FindEntry$pi8$pStdStrBuf$pu64(S("PlayerControls.txt"))) {
        $.Log($.LoadResStr(S("IDS_PRC_LOADSCEPLRCTRL")));
        let PlayerControlFile = new $.C4PlayerControlFile().None();
        if (!PlayerControlFile.Load(SysGroup, S("PlayerControls.txt"), local_strings)) {
          $.Log($.LoadResStr(S("IDS_PRC_LOADSCEPLRCTRLFAIL")));
        } else {
          this.PlayerControlDefs.MergeFrom(PlayerControlFile.GetControlDefs());
          this.PlayerControlDefaultAssignmentSets.MergeFrom(PlayerControlFile.GetAssignmentSets(), 1 /*MM_LowPrio*/);
          this.PlayerControlDefaultAssignmentSets.ResolveRefs(this.PlayerControlDefs);
        }
      }
      SysGroup.ResetSearch();
      while (SysGroup.FindNextEntry$pi8$pi8$pu64$b(S("*.c"), P(filename, 0), null, !(filename[0] === 0))) {
        let script_host = new $.C4ExtraScriptHost().init();
        script_host.Reg2List($.ScriptEngine);
        script_host.Load$rC4Group$pi8$pi8$pC4LangStringTable(SysGroup, P(filename, 0), P($.Config.General.LanguageEx, 0), local_strings);
      }
      if (!SysGroup.IsPacked() && $.Game.pFileMonitor != null) {
        $.Game.pFileMonitor.AddDirectory(SysGroup.GetFullName().getData());
      }
      SysGroup.Close$v();
      local_strings.DelRef();
    }
    return true;
  }

  SaveGameTitle(group) {
    if (this.FrameCounter === 0) {
      const bytes = [null];
      const size = [0];
      let real_filename = new $.StdStrBuf();
      if (this.ScenarioFile.FindEntry$pi8$pStdStrBuf$pu64($.FormatString(S("%s.*"), S("Title")).getData(), real_filename, P(size, 0))) {
        if (this.ScenarioFile.LoadEntry$pi8$ppi8$pu64$i32(real_filename.getData(), P(bytes, 0), P(size, 0))) {
          group.Add$pi8$px$i32$b$b$b(real_filename.getData(), bytes[0], size[0] | 0, false, true);
        }
      }
    } else if ($.Application.isEditor === 0 && $.Application.Active) {
      let sfcPic = null;
      let iSfcWdt = 200;
      let iSfcHgt = 150;
      if (!((sfcPic = new $.C4Surface().init$i32$i32$i32(iSfcWdt, iSfcHgt, 0)) != null)) {
        return false;
      }
      $.pDraw.Blit($.FullScreen.pSurface, 0, 0, Math.fround($.GetScreenWdt()), Math.fround($.GetScreenHgt() - $.GraphicsResource.FontRegular.GetLineHeight() | 0), sfcPic, Math.fround(0), Math.fround(0), Math.fround(iSfcWdt), Math.fround(iSfcHgt));
      let fOkay = true;
      fOkay = sfcPic.SavePNG$pi8$b$b$b($.Config.AtTempPath(S("~Title.tmp")), false, false, false);
      let destFilename = $.FormatString(S("%s.png"), S("Title"));
      $delete(sfcPic);
      if (!fOkay) {
        return false;
      }
      if (!group.Move($.Config.AtTempPath(S("~Title.tmp")), destFilename.getData())) {
        return false;
      }
    }
    return true;
  }

  InitGame(group, init_mode, load_sky, numbers) {
    if (this.DebugPort !== 0) {
      if (this.Parameters.isLeague()) {
        $.Log(S("Debugger disabled. Not allowed in league."));
      } else if (!$.C4AulDebug.InitDebug(this.DebugPassword.getData(), this.DebugHost.getData())) {
        return false;
      }
    }
    if (init_mode === 0) {
      if ($.Config.Developer.AutoFileReload !== 0 && $.Application.isEditor !== 0 && this.pFileMonitor == null) {
        this.pFileMonitor = new $.C4FileMonitor().init(FileMonitorCallback);
      }
      if (!this.InitScriptEngine()) {
        $.LogFatal($.LoadResStr(S("IDS_PRC_FAIL")));
        return false;
      }
      this.SetInitProgress(Math.fround(8));
      if (!this.LoadScenarioComponents()) {
        $.LogFatal($.LoadResStr(S("IDS_PRC_FAIL")));
        return false;
      }
      this.SetInitProgress(Math.fround(9));
      if (!$.Network.isEnabled()) {
        if (!this.PlayerInfos.InitLocal()) {
          $.LogFatal($.LoadResStr(S("IDS_PRC_FAIL")));
          return false;
        }
      }
      if (this.C4S.Head.Replay) {
        this.PlayerInfos.RecheckAutoGeneratedTeams();
        this.Teams.RecheckPlayers();
      }
      if (!this.InitControl()) {
        return false;
      }
      $.Log($.LoadResStr(S("IDS_PRC_GFXRES")));
      if (!$.GraphicsResource.Init()) {
        $.LogFatal($.LoadResStr(S("IDS_PRC_FAIL")));
        return false;
      }
      this.SetInitProgress(Math.fround(25));
      if (!this.InitDefs()) {
        return false;
      }
      this.SetInitProgress(Math.fround(55));
      $.GameScript.Load$rC4Group$pi8$pi8$pC4LangStringTable(this.ScenarioFile, S("Script.c|Script%s.c|C4Script%s.c"), P($.Config.General.LanguageEx, 0), this.ScenarioLangStringTable);
      $.MapScript.Load$rC4Group$pi8$pi8$pC4LangStringTable(this.ScenarioFile, S("Map.c"), P($.Config.General.LanguageEx, 0), this.ScenarioLangStringTable);
      this.pScenarioObjectsScript.Load$rC4Group$pi8$pi8$pC4LangStringTable(this.ScenarioFile, S("Objects.c"), P($.Config.General.LanguageEx, 0), this.ScenarioLangStringTable);
      if (!this.LoadAdditionalSystemGroup(this.ScenarioFile)) {
        $.LogFatal($.LoadResStr(S("IDS_PRC_FAIL")));
        return false;
      }
      this.SetInitProgress(Math.fround(57));
      this.PlayerControlDefs.FinalInit();
      this.ScenarioParameterDefs.RegisterScriptConstants(this.Parameters.ScenarioParameters);
      if (!this.InitPlayerControlUserSettings()) {
        return false;
      }
      this.PlayerControlUserAssignmentSets.SortAssignments();
      if (!this.LinkScriptEngine()) {
        return false;
      }
      this.SetInitProgress(Math.fround(58));
      if (!this.InitMaterialTexture()) {
        $.LogFatal($.LoadResStr(S("IDS_PRC_MATERROR")));
        return false;
      }
      this.SetInitProgress(Math.fround(60));
      0;
      this.ScriptGuiRoot = new $.C4ScriptGuiWindow().init();
    } else if (load_sky) {
      if (!$.GraphicsResource.Init()) {
        $.LogFatal($.LoadResStr(S("IDS_PRC_FAIL")));
        return false;
      }
    }
    $.Application.SoundSystem.LoadEffects(group, null, true);
    if (this.FrameCounter === 0) {
      this.StartupPlayerCount = this.PlayerInfos.GetStartupCount();
      this.StartupTeamCount = this.Teams.GetStartupTeamCount(this.StartupPlayerCount);
    }
    if (init_mode === 0) {
      $.Application.MusicSystem.FadeOut(2000);
    }
    $.Log($.LoadResStr(S("IDS_PRC_LANDSCAPE")));
    const landscape_loaded = [false];
    if (!$.Landscape.Init(group, init_mode !== 0, load_sky, P(landscape_loaded, 0), !!this.C4S.Head.SaveGame)) {
      $.LogFatal($.LoadResStr(S("IDS_ERR_GBACK")));
      return false;
    }
    this.SetInitProgress(Math.fround(88));
    if (landscape_loaded[0] && (!this.C4S.Head.SaveGame || init_mode === 1)) {
      $.Landscape.ScenarioInit();
    }
    if (init_mode !== 0 && landscape_loaded[0]) {
      $.PXS.Clear();
      $.MassMover.Clear();
    }
    this.SetInitProgress(Math.fround(89));
    $.Objects.Init($.Landscape.GetWidth(), $.Landscape.GetHeight());
    if (init_mode === 0) {
      this.PathFinder.Init(LandscapeFree, this.TransferZones);
    }
    this.SetInitProgress(Math.fround(90));
    if (group.FindEntry$pi8$pStdStrBuf$pu64(S("PXS.ocb"))) {
      if (!$.PXS.Load(group)) {
        $.LogFatal($.LoadResStr(S("IDS_ERR_PXS")));
        return false;
      }
    }
    this.SetInitProgress(Math.fround(91));
    if (group.FindEntry$pi8$pStdStrBuf$pu64(S("MassMover.ocb"))) {
      if (!$.MassMover.Load(group)) {
        $.LogFatal($.LoadResStr(S("IDS_ERR_MOVER")));
        return false;
      }
    }
    this.SetInitProgress(Math.fround(92));
    if (init_mode === 0) {
      this.InitValueOverloads();
    }
    if (!this.CompileRuntimeData(group, init_mode, this.C4S.Head.SaveGame, this.C4S.Head.NetworkGame, numbers)) {
      $.LogFatal($.LoadResStr(S("IDS_PRC_FAIL")));
      return false;
    }
    this.SetInitProgress(Math.fround(93));
    if (init_mode === 0) {
      if (group.FindEntry$pi8$pStdStrBuf$pu64(S("RoundResults.txt"))) {
        if (!this.RoundResults.Load(group, S("RoundResults.txt"))) {
          $.LogFatal($.LoadResStr(S("IDS_ERR_ERRORLOADINGROUNDRESULTS")));
          return false;
        }
      } else {
        this.RoundResults.Init();
      }
      this.EvaluateOnAbort = this.C4S.Game.EvaluateOnAbort;
    }
    if (init_mode === 0) {
      $.ScriptEngine.Denumerate(numbers);
    }
    if (init_mode === 0) {
      this.GlobalSoundModifier.Denumerate(numbers);
    }
    numbers.Denumerate();
    if (init_mode === 0) {
      this.ScriptGuiRoot.Denumerate(numbers);
    }
    $.Objects.PostLoad(init_mode === 1, numbers);
    if (!this.CheckObjectEnumeration()) {
      return false;
    }
    this.PointersDenumerated = true;
    if (!(this.GameText.GetData() != null) && this.pScenarioObjectsScript != null && this.pScenarioObjectsScript.GetPropList$v() != null) {
      this.pScenarioObjectsScript.GetPropList$v().Call$pi8$pC4AulParSet$b(S("~InitializeObjects"));
    }
    if (!this.C4S.Head.NoInitialize && landscape_loaded[0]) {
      $.Log($.LoadResStr(S("IDS_PRC_ENVIRONMENT")));
      this.InitVegetation();
      this.InitInEarth();
      this.InitAnimals();
      this.InitEnvironment();
      this.InitRules();
      this.InitGoals();
      $.Landscape.PostInitMap();
    }
    this.SetInitProgress(Math.fround(94));
    if (landscape_loaded[0]) {
      $.Weather.Init(!this.C4S.Head.SaveGame);
    }
    this.SetInitProgress(Math.fround(96));
    $.GraphicsResource.CloseFiles();
    if (init_mode === 0) {
      $.Application.MusicSystem.InitForScenario(this.ScenarioFile);
      $.Application.MusicSystem.UpdateVolume();
      if ($.Config.Sound.RXMusic !== 0) {
        $.Application.MusicSystem.Play$pi8$b$i32$f64$b();
      } else {
        $.Application.MusicSystem.Stop();
      }
      this.SetInitProgress(Math.fround(97));
    }
    return true;
  }

  InitGameFinal(init_mode) {
    $.Objects.ValidateOwners();
    $.Objects.AssignInfo();
    $.Objects.AssignLightRange();
    if (!this.C4S.Head.SaveGame) {
      $.GameScript.Call(S("~InitializeAmbience"));
    }
    let object_count = $.Objects.ObjectCount();
    if (!this.C4S.Head.SaveGame) {
      $.GameScript.Call(S("~Initialize"));
    }
    if ($.Objects.ObjectCount() !== object_count) {
      this.fScriptCreatedObjects = true;
    }
    let player = null;
    for (player = $.Players.First; player != null; player = player.Next) {
      if (init_mode === 2) {
        player.ScenarioInit();
      }
      player.FinalInit(!this.C4S.Head.SaveGame);
    }
    if (init_mode === 0) {
      for (player = $.Players.First; player != null; player = player.Next) {
        if (player.LocalControl) {
          $.Viewports.CreateViewport(player.Number);
        }
      }
      $.FullScreen.ViewportCheck();
      $.Console.UpdateHaltCtrls(!(this.HaltCount === 0));
      if ($.Network.isEnabled() && $.Network.isHost()) {
        for (let cnt = 0; cnt < $.Players.GetCount$v(); cnt = cnt + 1 | 0) {
          if ($.Players.GetByIndex$i32(cnt).AtClient < 0) {
            $.Players.Remove$pC4Player$b$b($.Players.GetByIndex$i32(cnt), true, false);
          }
        }
      }
      if (this.pFileMonitor != null) {
        this.pFileMonitor.StartMonitoring();
      }
    }
    return true;
  }

  InitNetworkFromAddress(address) {
    let strRefQueryFailed = new $.StdCopyStrBuf().init$pi8$b($.LoadResStr(S("IDS_NET_REFQUERY_FAILED")));
    let RefClient = new $.C4Network2RefClient().init();
    if (!RefClient.Init$v() || !RefClient.SetServer(address) || !RefClient.QueryReferences()) {
      $.LogFatal($.FormatString(strRefQueryFailed.getData(), RefClient.GetError$v$c()).getData());
      return false;
    }
    let message = $.FormatString($.LoadResStr(S("IDS_NET_REFQUERY_QUERYMSG")), address);
    $.Log(message.getData());
    let dialog = null;
    if ($.Application.isEditor === 0) {
      dialog = new $.MessageDialog().init(message.getData(), $.LoadResStr(S("IDS_NET_REFQUERY_QUERYTITLE")), 2, 3 /*Ico_NetWait*/, 360 /*dsMedium*/);
      if (dialog == null || !dialog.Show($.pGUI, true)) {
        return false;
      }
    }
    while (RefClient.isBusy()) {
      if (!$.Application.ScheduleProcs(100) || dialog != null && dialog.IsAborted()) {
        $delete(dialog);
        return false;
      }
    }
    $delete(dialog);
    if (!RefClient.isSuccess()) {
      $.LogFatal($.FormatString(strRefQueryFailed.getData(), RefClient.GetError$v$c()).getData());
      return false;
    }
    const refs = [null];
    const ref_count = [0];
    if (!RefClient.GetReferences(P(refs, 0), P(ref_count, 0)) || ref_count[0] <= 0) {
      $.LogFatal($.FormatString(strRefQueryFailed.getData(), $.LoadResStr(S("IDS_NET_REFQUERY_NOREF"))).getData());
      return false;
    }
    let connected = this.InitNetworkFromReference(refs[0].a[refs[0].o + 0]);
    for (let i = 0; i < ref_count[0]; i = i + 1 | 0) {
      $delete(refs[0].a[refs[0].o + i]);
    }
    $delete(refs[0]);
    return connected;
  }

  InitNetworkFromReferenceFile(temp_filename) {
    let winsock = new $.WinSockHolder().init();
    let success = false;
    let ref = new $.C4Network2Reference().init();
    let join_data = new $.StdStrBuf();
    if (join_data.LoadFromFile(temp_filename)) {
      $.CompileFromBuf$mStdNamingAdapt$C4Network2Reference$x($.mkNamingAdapt$rC4Network2Reference$pi8(ref, S("Reference")), join_data);
      success = true;
    }
    $.EraseFile(temp_filename);
    if (!success) {
      return false;
    }
    return this.InitNetworkFromReference(ref);
  }

  InitNetworkFromReference(reference) {
    let host_data = reference.Parameters.Clients.getClientByID(0);
    if (host_data == null) {
      $.LogFatal($.LoadResStr(S("IDS_NET_INVALIDREF")));
      return false;
    }
    this.ScenarioTitle.op_assign$pi8(reference.getTitle());
    $.LogF($.LoadResStr(S("IDS_NET_JOINGAMEBY")), host_data.getName());
    if (!this.Clients.Init()) {
      return false;
    }
    if ($.Network.InitClient$C4Network2Reference$b(reference, false) !== 0) {
      $.LogFatal($.FormatString($.LoadResStr(S("IDS_NET_NOHOSTCON")), host_data.getName()).getData());
      return false;
    }
    if (!$.Control$2.InitNetwork(this.Clients.getLocal())) {
      return false;
    }
    $.Network.Players.Init();
    return true;
  }

  InitNetworkHost() {
    if (!this.NetworkActive) {
      if (!this.C4S.Head.Replay) {
        this.Clients.Init();
      }
      return true;
    }
    if (this.C4S.Head.NetworkGame) {
      $.LogFatal($.LoadResStr(S("IDS_NET_NODIRECTSTART")));
      return this.Clients.Init();
    }
    if (this.C4S.Head.Replay) {
      $.LogFatal($.LoadResStr(S("IDS_PRC_NONETREPLAY")));
      return true;
    }
    if (!this.Clients.Init()) {
      return false;
    }
    if (!$.Network.InitHost(this.fLobby)) {
      return false;
    }
    if (!$.Control$2.InitNetwork(this.Clients.getLocal())) {
      return false;
    }
    $.Network.Players.Init();
    $.Network.AllowJoin(true);
    if (this.fLobby) {
      if (!$.Network.DoLobby()) {
        return false;
      }
    } else {
      if (!$.Network.Start$v()) {
        return false;
      }
    }
    return true;
  }

  InitControl() {
    if (this.C4S.Head.NetworkGame || this.C4S.Head.Replay) {
      this.RandomSeed = this.C4S.Head.RandomSeed;
    }
    this.FixRandom(u64(BigInt(this.RandomSeed)));
    if (this.C4S.Head.Replay) {
      this.PlayerFilenames[0] = 0;
      if (!$.Control$2.InitReplay(this.ScenarioFile)) {
        return false;
      }
      this.Record = false;
    } else if ($.Network.isEnabled()) {
      if (!$.Control$2.InitNetwork(this.Clients.getLocal())) {
        return false;
      }
      if (this.Parameters.isLeague()) {
        this.Record = true;
      }
    } else {
      if (!$.Control$2.InitLocal(this.Clients.getLocal())) {
        return false;
      }
    }
    if (this.Record) {
      if (!$.Control$2.StartRecord(true, this.Parameters.doStreaming())) {
        if ($.Network.isEnabled() && $.Network.isHost() && this.Parameters.isLeague()) {
          $.LogFatal($.LoadResStr(S("IDS_ERR_NORECORD")));
          return false;
        } else {
          $.Log($.LoadResStr(S("IDS_ERR_NORECORD")));
        }
      }
    }
    return true;
  }

  InitScriptEngine() {
    $.InitCoreFunctionMap($.ScriptEngine);
    $.InitObjectFunctionMap($.ScriptEngine);
    $.InitGameFunctionMap($.ScriptEngine);
    $.MapScript.InitFunctionMap($.ScriptEngine);
    if (!$.Application.OpenSystemGroup()) {
      $.LogFatal($.LoadResStr(S("IDS_ERR_INVALIDSYSGRP")));
      return false;
    }
    const File = $.Application.SystemGroup;
    const filename = $ta(Int8Array, 256, [0]);
    File.ResetSearch();
    while (File.FindNextEntry$pi8$pi8$pu64$b(S("*.c"), P(filename, 0), null, !(filename[0] === 0))) {
      let script_host = new $.C4ExtraScriptHost().init();
      script_host.Reg2List($.ScriptEngine);
      script_host.Load$rC4Group$pi8$pi8$pC4LangStringTable(File, P(filename, 0), P($.Config.General.LanguageEx, 0), this.MainSysLangStringTable);
    }
    if (!File.IsPacked() && $.Game.pFileMonitor != null) {
      $.Game.pFileMonitor.AddDirectory(File.GetFullName().getData());
    }
    this.pScenarioObjectsScript = new $.C4ScenarioObjectsScriptHost().init();
    this.pScenarioObjectsScript.Reg2List($.ScriptEngine);
    let scen_obj_script_val = new $.C4Value().init$v();
    scen_obj_script_val.SetPropList(this.pScenarioObjectsScript.GetPropList$v());
    $.ScriptEngine.RegisterGlobalConstant(S("ScenarioObjects"), scen_obj_script_val);
    this.Names.Load$rC4Group$pi8$pi8(File, S("Names.txt"));
    return true;
  }

  LinkScriptEngine() {
    $.ScriptEngine.Link($.Definitions);
    $.LogF(S("C4AulScriptEngine linked - %d line%s, %d warning%s, %d error%s"), $.ScriptEngine.lineCnt, $.ScriptEngine.lineCnt !== 1 ? S("s") : S(""), $.ScriptEngine.warnCnt, $.ScriptEngine.warnCnt !== 1 ? S("s") : S(""), $.ScriptEngine.errCnt, $.ScriptEngine.errCnt !== 1 ? S("s") : S(""));
    $.MaterialMap.UpdateScriptPointers();
    {
      let pDebug = $.C4AulDebug.GetDebugger();
      if (pDebug != null) {
        if (!pDebug.Listen$u16$b(this.DebugPort, !(this.DebugWait === 0))) {
          return false;
        }
      }
    }
    return true;
  }

  ReLinkScriptEngine() {
    $.ScriptEngine.ReLink($.Definitions);
    $.Objects.UpdateScriptPointers();
    $.MaterialMap.UpdateScriptPointers();
    return true;
  }

  *InitPlayers(numbers) {
    let player_count = 0;
    if (this.C4S.Head.NetworkRuntimeJoin) {
      let LocalRestorePlayerInfos = new $.C4PlayerInfoList();
      LocalRestorePlayerInfos.Load(this.ScenarioFile, S("SavePlayerInfos.txt"), this.ScenarioLangStringTable);
      if (!LocalRestorePlayerInfos.RecreatePlayerFiles()) {
        $.LogFatal($.LoadResStr(S("IDS_ERR_NOPLRFILERECR")));
        return false;
      }
      if (!LocalRestorePlayerInfos.RecreatePlayers(numbers)) {
        $.LogFatal($.LoadResStr(S("IDS_ERR_NOPLRNETRECR")));
        return false;
      }
    } else if (this.RestorePlayerInfos.GetActivePlayerCount(true) !== 0) {
      if (!(yield* this.PlayerInfos.RestoreSavegameInfos(this.RestorePlayerInfos))) {
        $.LogFatal($.LoadResStr(S("IDS_ERR_NOPLRSAVEINFORECR")));
        return false;
      }
      this.RestorePlayerInfos.Clear();
      if (!this.PlayerInfos.RecreatePlayerFiles()) {
        $.LogFatal($.LoadResStr(S("IDS_ERR_NOPLRFILERECR")));
        return false;
      }
      if (!this.PlayerInfos.RecreatePlayers(numbers)) {
        $.LogFatal($.LoadResStr(S("IDS_ERR_NOPLRSAVERECR")));
        return false;
      }
    }
    if (!$.Network.isEnabled() && !$.Control$2.NoInput()) {
      if (!this.PlayerInfos.LocalJoinUnjoinedPlayersInQueue()) {
      }
    }
    player_count = this.PlayerInfos.GetJoinIssuedPlayerCount();
    if (!$.Network.isEnabled() || $.Network.isHost() && !this.fLobby) {
      if (player_count === 0) {
        if ($.Application.isEditor === 0 && !$.Control$2.NoInput()) {
          $.LogFatal($.LoadResStr(S("IDS_CNS_NOFULLSCREENPLRS")));
          return false;
        }
      }
      if (player_count > $.Game.Parameters.MaxPlayers) {
        if ($.Application.isEditor === 0) {
          $.LogFatal($.FormatString($.LoadResStr(S("IDS_PRC_TOOMANYPLRS")), $.Game.Parameters.MaxPlayers).getData());
          return false;
        } else {
          $.Console.Message($.FormatString($.LoadResStr(S("IDS_PRC_TOOMANYPLRS")), $.Game.Parameters.MaxPlayers).getData());
        }
      }
    }
    if ($.Console.Active) {
      if (!this.fLobby) {
        if (!((this.PlayerInfos.GetActivePlayerCount(false) - this.PlayerInfos.GetActiveScriptPlayerCount(true, false) | 0) !== 0)) {
          this.HaltCount = this.HaltCount + 1 | 0;
        }
      }
    }
    return true;
  }

  OpenScenario() {
    if (this.RecordStream.getSize() !== 0) {
      let RecordFile = new $.StdStrBuf();
      if (!$.C4Playback.StreamToRecord(this.RecordStream.getData(), RecordFile)) {
        $.LogFatal(S("[!] Could not process record stream data!"));
        return false;
      }
      $.SCopy$pi8$pi8$u64(RecordFile.getData(), P(this.ScenarioFilename, 0), 4096);
    }
    if (this.ScenarioFilename[0] === 0) {
      $.LogFatal($.LoadResStr(S("IDS_PRC_NOC4S")));
      return false;
    }
    $.LogF($.LoadResStr(S("IDS_PRC_LOADC4S")), P(this.ScenarioFilename, 0));
    this.pParentGroup = this.GroupSet.RegisterParentFolders(P(this.ScenarioFilename, 0));
    if (this.pParentGroup != null) {
      if (!this.ScenarioFile.OpenAsChild(this.pParentGroup, $.GetFilename$2(P(this.ScenarioFilename, 0)))) {
        $.LogF(S("%s: %s"), $.LoadResStr(S("IDS_PRC_FILENOTFOUND")), P(this.ScenarioFilename, 0));
        return false;
      }
    } else {
      if (!$.Reloc.Open(this.ScenarioFile, P(this.ScenarioFilename, 0))) {
        $.LogF(S("%s: %s"), $.LoadResStr(S("IDS_PRC_FILENOTFOUND")), P(this.ScenarioFilename, 0));
        return false;
      }
    }
    $.SCopy$pi8$pi8$u64(this.ScenarioFile.GetFullName().getData(), P(this.ScenarioFilename, 0), 4096);
    this.GroupSet.RegisterGroup(this.ScenarioFile, false, 200, 47);
    if (!this.C4S.Load(this.ScenarioFile)) {
      $.LogFatal($.LoadResStr(S("IDS_PRC_FILEINVALID")));
      return false;
    }
    if ($.CompareVersion(this.C4S.Head.C4XVer[0], this.C4S.Head.C4XVer[1]) > 0) {
      $.LogFatal($.FormatString($.LoadResStr(S("IDS_PRC_NOREQC4X")), this.C4S.Head.C4XVer[0], this.C4S.Head.C4XVer[1]).getData());
      return false;
    }
    if (this.C4S.Head.Origin.getLength() !== 0 && !$.ItemIdentical(this.C4S.Head.Origin.getData(), P(this.ScenarioFilename, 0))) {
      this.GroupSet.RegisterParentFolders(this.C4S.Head.Origin.getData());
    }
    let sDefinitionFilenames = new $.StdStrBuf();
    if (!this.C4S.Definitions.AllowUserChange && this.C4S.Definitions.GetModules(sDefinitionFilenames)) {
      $.SCopy$pi8$pi8$u64(sDefinitionFilenames.getData(), P(this.DefinitionFilenames, 0), 81920);
      if (this.DefinitionFilenames[0] !== 0) {
        $.Log($.LoadResStr(S("IDS_PRC_SCEOWNDEFS")));
      } else {
        $.Log($.LoadResStr(S("IDS_PRC_LOCALONLY")));
      }
    }
    if (this.C4S.Head.MissionAccess.d[0] !== 0 && $.Application.isEditor === 0 && !$.SIsModule(P($.Config.General.MissionAccess, 0), this.C4S.Head.MissionAccess.c_str())) {
      $.LogFatal($.LoadResStr(S("IDS_PRC_NOMISSIONACCESS")));
      return false;
    }
    $.C4Language.LoadComponentHost(this.Title, this.ScenarioFile, S("Title%s.txt|Title.txt"), P($.Config.General.LanguageEx, 0));
    if (!this.Title.GetLanguageString(P($.Config.General.LanguageEx, 0), this.ScenarioTitle)) {
      this.ScenarioTitle.op_assign$string(this.C4S.Head.Title);
    }
    $.C4Language.LoadComponentHost(this.ScenarioLangStringTable, this.ScenarioFile, S("StringTbl.txt|StringTbl%s.txt"), P($.Config.General.LanguageEx, 0));
    this.ScenarioParameterDefs.Load(this.ScenarioFile, this.ScenarioLangStringTable);
    if (!$.Network.isEnabled() || $.Network.isHost()) {
      if (!this.Parameters.Load(this.ScenarioFile, this.C4S, this.GameText.GetData(), this.ScenarioLangStringTable, P(this.DefinitionFilenames, 0), this.StartupScenarioParameters)) {
        return false;
      }
    }
    this.SetInitProgress(Math.fround(4));
    if (!this.ScenarioFile.IsPacked() && this.pFileMonitor != null) {
      $.Game.pFileMonitor.AddDirectory(this.ScenarioFile.GetFullName().getData());
    }
    return true;
  }

  InitDefs() {
    let def_count = 0;
    $.Log($.LoadResStr(S("IDS_PRC_INITDEFS")));
    let def_res_count = 0;
    let def = null;
    for (def = this.Parameters.GameRes.iterRes(null, 4 /*NRT_Definitions*/); def != null; def = this.Parameters.GameRes.iterRes(def, 4 /*NRT_Definitions*/)) {
      def_res_count = def_res_count + 1 | 0;
    }
    let i = 0;
    for (def = this.Parameters.GameRes.iterRes(null, 4 /*NRT_Definitions*/); def != null; def = this.Parameters.GameRes.iterRes(def, 4 /*NRT_Definitions*/)) {
      let min_progress = 25 + (Math.imul(25, i) / def_res_count | 0) | 0;
      let max_progress = 25 + (Math.imul(25, i + 1 | 0) / def_res_count | 0) | 0;
      i = i + 1 | 0;
      def_count = def_count + $.Definitions.Load$pi8$u32$pi8$pC4SoundSystem$b$i32$i32(def.getFile(), 966, P($.Config.General.LanguageEx, 0), $.Application.SoundSystem, true, min_progress, max_progress) | 0;
      if ($.Definitions.LoadFailure) {
        return false;
      }
    }
    def_count = def_count + $.Definitions.Load$rC4Group$u32$pi8$pC4SoundSystem$b$b$i32$i32$b(this.ScenarioFile, 966, P($.Config.General.LanguageEx, 0), $.Application.SoundSystem, true, true, 35, 40, false) | 0;
    if (def_count === 0) {
      $.LogFatal($.LoadResStr(S("IDS_PRC_NODEFS")));
      return false;
    }
    def_count = $.Definitions.CheckEngineVersion(9, 0);
    if (def_count > 0) {
      $.LogF($.LoadResStr(S("IDS_PRC_DEFSINVC4X")), def_count);
    }
    $.Definitions.CheckRequireDef();
    $.Definitions.BuildTable();
    $.Definitions.AppendAndIncludeSkeletons();
    return true;
  }

  InitMaterialTexture() {
    $.TextureMap.Clear();
    $.MaterialMap.Clear();
    let has_local_materials = $.Game.ScenarioFile.FindEntry$pi8$pStdStrBuf$pu64(S("Material.ocg"));
    let material_resource = null;
    let first = true;
    let overload_materials = true;
    let overload_textures = true;
    let tex_count = 0;
    let mat_count = 0;
    while (overload_materials || overload_textures) {
      let materials = new $.C4Group().init();
      if (has_local_materials) {
        if (!materials.OpenAsChild($.Game.ScenarioFile, S("Material.ocg"))) {
          return false;
        }
        has_local_materials = false;
      } else {
        material_resource = $.Game.Parameters.GameRes.iterRes(material_resource, 6 /*NRT_Material*/);
        if (material_resource == null) {
          break;
        }
        if (!$.Reloc.Open(materials, material_resource.getFile())) {
          return false;
        }
      }
      materials.PreCacheEntries(S("TexMap.txt"));
      materials.PreCacheEntries(S("*.ocm"), true);
      const continue_overload_materials = [false];
      const continue_overload_textures = [false];
      if (first) {
        let tme_count = $.TextureMap.LoadMap(materials, S("TexMap.txt"), P(continue_overload_materials, 0), P(continue_overload_textures, 0));
        $.LogF($.LoadResStr(S("IDS_PRC_TEXMAPENTRIES")), tme_count);
        first = false;
      } else {
        if (!$.C4TextureMap.LoadFlags(materials, S("TexMap.txt"), P(continue_overload_materials, 0), P(continue_overload_textures, 0))) {
          overload_materials = overload_textures = false;
        }
      }
      if (overload_textures) {
        let local_text_count = $.TextureMap.LoadTextures(materials);
        if (local_text_count === 0) {
          continue_overload_textures[0] = true;
        }
        tex_count = tex_count + local_text_count;
      }
      if (overload_materials) {
        let local_mat_count = $.MaterialMap.Load(materials);
        if (local_mat_count === 0) {
          continue_overload_materials[0] = true;
        }
        mat_count = mat_count + local_mat_count;
      }
      overload_textures = continue_overload_textures[0];
      overload_materials = continue_overload_materials[0];
    }
    $.LogF($.LoadResStr(S("IDS_PRC_TEXTURES")), tex_count);
    $.LogF($.LoadResStr(S("IDS_PRC_MATERIALS")), mat_count);
    if (!$.MaterialMap.LoadEnumeration(this.ScenarioFile)) {
      $.LogFatal($.LoadResStr(S("IDS_PRC_NOMATENUM")));
      return false;
    }
    $.TextureMap.Init();
    if (!$.MaterialMap.CrossMapMaterials(this.C4S.Landscape.Material.c_str())) {
      return false;
    }
    $.MaterialMap.UpdateScriptPointers();
    return true;
  }

  GameOverCheck() {
    if ($.Game.iTick35 !== 0) {
      return false;
    }
    if ($.Control$2.isReplay()) {
      return false;
    }
    let all_players_eliminated = false;
    if (!($.Players.GetCountNotEliminated() !== 0)) {
      all_players_eliminated = true;
    }
    if (all_players_eliminated) {
      this.DoGameOver();
    }
    return this.GameOver;
  }

  PlaceInEarth(id) {
    let cnt = 0;
    let tx = 0;
    let ty = 0;
    for (cnt = 0; cnt < 35; cnt = cnt + 1 | 0) {
      tx = Random($.Landscape.GetWidth() >>> 0) | 0;
      ty = Random($.Landscape.GetHeight() >>> 0) | 0;
      if ($.GBackMat(tx, ty) === $.MEarth) {
        if (this.CreateObject$C4ID$pC4Object$i32$i32$i32$i32$b$C4Fixed$C4Fixed$C4Fixed$i32(id.$clone(), null, -1, tx, ty, Random(360) | 0) != null) {
          return true;
        }
      }
    }
    return false;
  }

  CompileFunc(compiler, settings, numbers$) {
    const numbers = [numbers$];
    if (settings.init_mode === 0 && settings.fExact) {
      compiler.Name(S("Game"));
      compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Time"), S("Time"), 0));
      compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "FrameCounter"), S("Frame"), 0));
      if (settings.fSync) {
        compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P($.Control$2, "ControlTick"), S("ControlTick"), 0));
        compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P($.Control$2, "SyncRate"), S("SyncRate"), $.C4SyncCheckRate$C4GameControl));
      }
      compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iTick2"), S("Tick2"), 0));
      compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iTick3"), S("Tick3"), 0));
      compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iTick5"), S("Tick5"), 0));
      compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iTick10"), S("Tick10"), 0));
      compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iTick35"), S("Tick35"), 0));
      compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iTick255"), S("Tick255"), 0));
      compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iTick1000"), S("Tick1000"), 0));
      compiler.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "InitialPlayersJoined"), S("InitialPlayersJoined"), false));
      compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "StartupPlayerCount"), S("StartupPlayerCount"), 0));
      compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "StartupTeamCount"), S("StartupTeamCount"), 0));
      compiler.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P($.C4PropListNumbered, "EnumerationIndex"), S("ObjectEnumerationIndex"), 0));
      compiler.Value$StdNamingDefaultAdapt$StdStringAdapt$x$5($.mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$5($.mkStringAdaptMA$3(this.CurrentScenarioSection), S("CurrentScenarioSection"), S("")));
      compiler.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "fResortAnyObject"), S("ResortAnyObj"), false));
      compiler.Value$StdNamingDefaultAdapt$StdParameterAdapt$C4Value$pC4ValueNumbers$C4Value($.mkNamingAdapt$mStdParameterAdapt$C4Value$pC4ValueNumbers$pi8$C4Value$b$b($.mkParAdapt$rC4Value$rpC4ValueNumbers(this.GlobalSoundModifier, P(numbers, 0)), S("GlobalSoundModifier"), new $.C4Value().init$v()));
      compiler.Value$StdNamingDefaultAdapt$StdCopyStrBuf$StdCopyStrBuf($.mkNamingAdapt$rStdCopyStrBuf$pi8$StdCopyStrBuf$b$b(this.NextMission, S("NextMission"), new $.StdCopyStrBuf()));
      compiler.Value$StdNamingDefaultAdapt$StdCopyStrBuf$StdCopyStrBuf($.mkNamingAdapt$rStdCopyStrBuf$pi8$StdCopyStrBuf$b$b(this.NextMissionText, S("NextMissionText"), new $.StdCopyStrBuf()));
      compiler.Value$StdNamingDefaultAdapt$StdCopyStrBuf$StdCopyStrBuf($.mkNamingAdapt$rStdCopyStrBuf$pi8$StdCopyStrBuf$b$b(this.NextMissionDesc, S("NextMissionDesc"), new $.StdCopyStrBuf()));
      compiler.NameEnd();
      compiler.Value$StdNamingAdapt$C4MusicSystem($.mkNamingAdapt$rC4MusicSystem$pi8($.Application.MusicSystem, S("Music")));
      compiler.Value$StdNamingAdapt$C4Scoreboard($.mkNamingAdapt$rC4Scoreboard$pi8(this.Scoreboard, S("Scoreboard")));
    }
    if (settings.fExact) {
      compiler.Value$StdNamingAdapt$C4Weather($.mkNamingAdapt$rC4Weather$pi8($.Weather, S("Weather")));
      compiler.Value$StdNamingAdapt$C4Landscape($.mkNamingAdapt$rC4Landscape$pi8($.Landscape, S("Landscape")));
      compiler.Value$StdNamingAdapt$C4Sky($.mkNamingAdapt$rC4Sky$pi8($.Landscape.GetSky(), S("Sky")));
      if (settings.init_mode === 0) {
        compiler.Name(S("GUI"));
        if (compiler.isDeserializer()) {
          let val = new $.C4Value().init$v();
          compiler.Value$StdNamingDefaultAdapt$StdParameterAdapt$C4Value$pC4ValueNumbers$C4Value($.mkNamingAdapt$mStdParameterAdapt$C4Value$pC4ValueNumbers$pi8$C4Value$b$b($.mkParAdapt$rC4Value$rpC4ValueNumbers(val, P(numbers, 0)), S("ScriptGUIs"), $.C4VNull));
          0;
          if (val.GetType() === 8) {
            let enumID = val._getInt();
            this.ScriptGuiRoot.SetEnumeratedID(enumID);
          }
        } else {
          let val = this.ScriptGuiRoot.ToC4Value();
          compiler.Value$StdNamingDefaultAdapt$StdParameterAdapt$C4Value$pC4ValueNumbers$C4Value($.mkNamingAdapt$mStdParameterAdapt$C4Value$pC4ValueNumbers$pi8$C4Value$b$b($.mkParAdapt$rC4Value$rpC4ValueNumbers(val, P(numbers, 0)), S("ScriptGUIs"), $.C4VNull));
        }
        compiler.NameEnd();
      }
    }
    if (settings.fPlayers) {
      0;
      for (let pPlr = $.Players.First; pPlr != null; pPlr = pPlr.Next) {
        compiler.Value$StdNamingAdapt$StdParameterAdapt$C4Player$pC4ValueNumbers$2($.mkNamingAdapt$mStdParameterAdapt$C4Player$pC4ValueNumbers$pi8$2($.mkParAdapt$rC4Player$rpC4ValueNumbers(pPlr, P(numbers, 0)), $.FormatString(S("Player%d"), pPlr.ID).getData()));
      }
    }
    if (settings.init_mode === 1) {
      $.C4PropListNumbered.ShelveNumberedPropLists();
    }
    compiler.Value$StdParameter2Adapt$C4GameObjects$b$pC4ValueNumbers($.mkParAdapt$rC4GameObjects$mb$rpC4ValueNumbers($.Objects, !settings.fExact, P(numbers, 0)));
    compiler.Value$StdNamingAdapt$StdParameter2Adapt$C4AulScriptEngine$b$pC4ValueNumbers($.mkNamingAdapt$mStdParameter2Adapt$C4AulScriptEngine$b$pC4ValueNumbers$pi8($.mkParAdapt$rC4AulScriptEngine$mb$rpC4ValueNumbers($.ScriptEngine, settings.init_mode === 1, P(numbers, 0)), S("Script")));
  }

  SaveData(group, save_section, save_exact, save_sync, numbers$) {
    const numbers = [numbers$];
    if (save_exact) {
      let Buf = new $.StdStrBuf();
      $.DecompileToBuf_Log$mStdParameter2Adapt$C4Game$CompileSettings$pC4ValueNumbers$px$pi8($.mkParAdapt$rC4Game$mC4Game$CompileSettings$rpC4ValueNumbers(this, new C4Game$CompileSettings().init(save_section ? 1 /*IM_Section*/ : 0 /*IM_Normal*/, !save_section && save_exact, save_exact, save_sync), P(numbers, 0)), Buf, S("Game"));
      if (!(Buf.getLength() !== 0)) {
        Buf.Copy$pi8(S(" "));
      }
      return group.Add$pi8$rStdStrBuf$b$b$b(S("Game.txt"), Buf, false, true);
    } else {
      group.Delete(S("Game.txt"));
      const objects_file_handle = [$.ScriptEngine.CreateUserFile()];
      let pars = new $.C4AulParSet().init$ri32(P(objects_file_handle, 0));
      let result_c4v = $.ScriptEngine.GetPropList().Call$pi8$pC4AulParSet$b(S("~SaveScenarioObjects"), pars.op_and());
      let result = !result_c4v.op_not();
      if (result_c4v.GetType() === 0) {
        $.LogF(S("ERROR: No valid result from global func ~SaveScenarioObjects. Saving objects failed."));
      } else {
        let file = $.ScriptEngine.GetUserFile(objects_file_handle[0]);
        if (!result || file == null || !(file.GetFileLength() !== 0)) {
          group.Delete(S("Objects.c"));
          result = true;
        } else {
          let data = file.GrabFileContents();
          result = group.Add$pi8$rStdStrBuf$b$b$b(S("Objects.c"), data, false, true);
        }
      }
      $.ScriptEngine.CloseUserFile(objects_file_handle[0]);
      return result;
    }
  }

  CompileRuntimeData(group, init_mode, exact, sync, numbers$) {
    const numbers = [numbers$];
    $.Objects.Clear$b(init_mode !== 1);
    this.GameText.Load$rC4Group$pi8$pi8(group, S("Game.txt"));
    let Settings = new C4Game$CompileSettings().init(init_mode, false, exact, sync);
    if (this.GameText.GetData() != null) {
      if (!$.CompileFromBuf_LogWarn$mStdParameter2Adapt$C4Game$CompileSettings$pC4ValueNumbers$x$pi8($.mkParAdapt$rC4Game$rC4Game$CompileSettings$rpC4ValueNumbers(this, Settings, P(numbers, 0)), this.GameText.GetDataBuf(), S("Game.txt"))) {
        return false;
      }
      let object_count = $.Objects.ObjectCount();
      if (object_count !== 0) {
        $.LogF($.LoadResStr(S("IDS_PRC_OBJECTSLOADED")), object_count);
      }
    }
    return true;
  }

  NewObject(def, creator$, owner, info, x, y, r, xdir, ydir, rdir, con, controller, grow_from_center) {
    const creator = [creator$];
    if (def == null) {
      return null;
    }
    if ($.Config.General.DebugRec !== 0) {
      let rect = new $.C4RCCreateObj();
      c$memset($bytesView(rect, [["oei", 0, "i32", 0], ["id", 4, "i8", 33], ["x", 37, "i32", 0], ["y", 41, "i32", 0], ["ownr", 45, "i32", 0]], 49), 0, 49);
      c$strncpy(P(rect.id, 0), def.GetName(), 33);
      rect.oei = $.C4PropListNumbered.GetEnumerationIndex() + 1 | 0;
      rect.x = x;
      rect.y = y;
      rect.ownr = owner;
      $.AddDbgRec(137 /*RCT_CrObj*/, $bytesView(rect, [["oei", 0, "i32", 0], ["id", 4, "i8", 33], ["x", 37, "i32", 0], ["y", 41, "i32", 0], ["ownr", 45, "i32", 0]], 49), 49);
    }
    let obj = null;
    if (!((obj = new $.C4Object().init()) != null)) {
      return null;
    }
    obj.Init$pC4PropList$pC4Object$i32$pC4ObjectInfo$i32$i32$i32$C4Fixed$C4Fixed$C4Fixed$i32(def, creator[0], owner, info, x, y, r, xdir.$clone(), ydir.$clone(), rdir.$clone(), controller);
    if (!$.Objects.Add$pC4Object(obj)) {
      $delete(obj);
      return null;
    }
    let pars = new $.C4AulParSet().init$rpC4Object(P(creator, 0));
    obj.Call$pi8$pC4AulParSet$b(S("~Construction"), pars.op_and());
    if (obj.Status === 0) {
      return null;
    }
    obj.DoCon(con, grow_from_center);
    if (obj.Status === 0) {
      return null;
    }
    return obj;
  }

  ClearObjectPtrs(to_obj) {
    let $t1, $t2, $t3, $t4, $t5, $t6;
    $t1 = $.Objects;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    try {
      for (; $t2.op_ne($t3); $t2.op_inc$v()) {
        const obj = $t2.op_mul();
        obj.ClearPointers$pC4Object(to_obj);
      }
    } finally { $t2.$dtor(); $t3.$dtor(); }
    $t4 = $.Objects.InactiveObjects;
    $t5 = $t4.begin();
    $t6 = $t4.end();
    try {
      for (; $t5.op_ne($t6); $t5.op_inc$v()) {
        const obj = $t5.op_mul();
        obj.ClearPointers$pC4Object(to_obj);
      }
    } finally { $t5.$dtor(); $t6.$dtor(); }
  }

  ObjectRemovalCheck() {
    let $t1, $t2, $t3;
    $t1 = $.Objects;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    try {
      for (; $t2.op_ne($t3); $t2.op_inc$v()) {
        const obj = $t2.op_mul();
        if (obj.Status === 0 && obj.RemovalDelay === 0) {
          $.Objects.Remove(obj);
          $delete(obj);
        }
      }
    } finally { $t2.$dtor(); $t3.$dtor(); }
  }

  ToggleDebugMode() {
    if (!this.Parameters.AllowDebug && !this.DebugMode) {
      $.GraphicsSystem.FlashMessage($.LoadResStr(S("IDS_MSG_DEBUGMODENOTALLOWED")));
      return false;
    }
    this.DebugMode = !this.DebugMode;
    if (!this.DebugMode) {
      $.GraphicsSystem.DeactivateDebugOutput();
    }
    $.GraphicsSystem.FlashMessageOnOff($.LoadResStr(S("IDS_CTL_DEBUGMODE")), this.DebugMode);
    return true;
  }

  ActivateMenu(command) {
    if ($.C4GameOverDlg.IsShown()) {
      return false;
    }
    let player = $.Players.GetLocalByIndex(0);
    if (player == null) {
      return false;
    }
    player.Menu.ActivateCommand(player.Number, command);
    return true;
  }

  ToggleChart() {
    $.C4ChartDialog.Toggle();
    return true;
  }

  SetGlobalSoundModifier(new_modifier) {
    let mod = null;
    if (new_modifier != null) {
      this.GlobalSoundModifier.SetPropList(new_modifier);
      mod = $.Application.SoundSystem.Modifiers.Get(new_modifier, true);
    } else {
      this.GlobalSoundModifier.Set0();
      mod = null;
    }
    $.Application.SoundSystem.Modifiers.SetGlobalModifier(mod, -1);
  }

  GetTranslatedString(input_string, selected_language, fail_silently) {
    if (input_string.GetType() === 0) {
      return null;
    }
    if (input_string.GetType() === 4) {
      return input_string._getStr();
    }
    let proplist = input_string._getPropList();
    if (proplist == null || proplist.GetPropertyStr(233 /*P_Function*/) !== $oat($.Strings.P, 234 /*P_Translate*/)) {
      if (fail_silently) {
        return null;
      } else {
        $throw(new $.C4AulExecError().init($.FormatString(S("Invalid value for translation: %s"), input_string.GetDataString().getData()).getData()));
      }
    }
    const lang_code = $cs(S(""), 3);
    for (let lang_index = 0; $.SCopySegment(P($.Config.General.LanguageEx, 0), lang_index, P(lang_code, 0), 44, 2); lang_index = lang_index + 1 | 0) {
      let lang_string = $.Strings.FindString(P(lang_code, 0));
      if (lang_string != null) {
        let localized_string_val = new $.C4Value().init$v();
        if (proplist.GetPropertyByS(lang_string, localized_string_val)) {
          let localized_string = localized_string_val.getStr();
          if (localized_string != null) {
            if (selected_language != null) {
              selected_language.SetString(lang_string);
            }
            return localized_string;
          }
        }
      }
    }
    for (const lang_string of proplist.GetSortedLocalProperties$b(false)) {
      let localized_string_val = new $.C4Value().init$v();
      if (proplist.GetPropertyByS(lang_string, localized_string_val)) {
        let localized_string = localized_string_val.getStr();
        if (localized_string != null) {
          if (selected_language != null) {
            selected_language.SetString(lang_string);
          }
          return localized_string;
        }
      }
    }
    return null;
  }

  AllocateTranslatedString() {
    let value_proplist = new $.C4PropListScript().init();
    value_proplist.SetProperty(233 /*P_Function*/, $.C4VString$pC4String($oat($.Strings.P, 234 /*P_Translate*/)));
    return value_proplist;
  }

  $clone() { return new C4Game().$assign(this); }
  $assign(o) {
    this.Parameters = o.Parameters;
    this.StartupScenarioParameters = o.StartupScenarioParameters;
    this.Clients = o.Clients;
    this.Teams = o.Teams;
    this.PlayerInfos = o.PlayerInfos;
    this.RestorePlayerInfos = o.RestorePlayerInfos;
    this.RoundResults = o.RoundResults;
    this.C4S.$assign(o.C4S);
    this.ScenarioParameterDefs = o.ScenarioParameterDefs;
    this.Info.$assign(o.Info);
    this.Title.$assign(o.Title);
    this.Names.$assign(o.Names);
    this.GameText.$assign(o.GameText);
    this.MainSysLangStringTable.$assign(o.MainSysLangStringTable);
    this.ScenarioLangStringTable.$assign(o.ScenarioLangStringTable);
    this.PlayerNames.$assign(o.PlayerNames);
    this.Input = o.Input;
    this.PathFinder.$assign(o.PathFinder);
    this.TransferZones.$assign(o.TransferZones);
    this.ScenarioFile.$assign(o.ScenarioFile);
    this.GroupSet.$assign(o.GroupSet);
    this.pParentGroup = o.pParentGroup;
    this.Extra.$assign(o.Extra);
    this.pScenarioObjectsScript = o.pScenarioObjectsScript;
    this.pScenarioSections = o.pScenarioSections;
    this.pCurrentScenarioSection = o.pCurrentScenarioSection;
    this.PlayerControlDefs.$assign(o.PlayerControlDefs);
    this.PlayerControlUserAssignmentSets.$assign(o.PlayerControlUserAssignmentSets);
    this.PlayerControlDefaultAssignmentSets.$assign(o.PlayerControlDefaultAssignmentSets);
    this.Scoreboard.$assign(o.Scoreboard);
    this.pNetworkStatistics = o.pNetworkStatistics;
    this.KeyboardInput = o.KeyboardInput;
    this.pFileMonitor = o.pFileMonitor;
    this.pSec1Timer = o.pSec1Timer;
    this.GlobalSoundModifier = o.GlobalSoundModifier;
    this.CurrentScenarioSection = o.CurrentScenarioSection.slice();
    this.ScenarioFilename = o.ScenarioFilename.slice();
    this.ScenarioTitle.$assign(o.ScenarioTitle);
    this.PlayerFilenames = o.PlayerFilenames.slice();
    this.DefinitionFilenames = o.DefinitionFilenames.slice();
    this.DirectJoinAddress = o.DirectJoinAddress.slice();
    this.DirectJoinTempFilename = o.DirectJoinTempFilename.slice();
    this.pJoinReference = o.pJoinReference;
    this.StartupPlayerCount = o.StartupPlayerCount;
    this.StartupTeamCount = o.StartupTeamCount;
    this.FPS = o.FPS;
    this.cFPS = o.cFPS;
    this.HaltCount = o.HaltCount;
    this.InitialPlayersJoined = o.InitialPlayersJoined;
    this.GameOver = o.GameOver;
    this.EvaluateOnAbort = o.EvaluateOnAbort;
    this.Evaluated = o.Evaluated;
    this.GameOverDlgShown = o.GameOverDlgShown;
    this.fScriptCreatedObjects = o.fScriptCreatedObjects;
    this.fLobby = o.fLobby;
    this.iLobbyTimeout = o.iLobbyTimeout;
    this.fObserve = o.fObserve;
    this.fReferenceDefinitionOverride = o.fReferenceDefinitionOverride;
    this.NetworkActive = o.NetworkActive;
    this.Record = o.Record;
    this.RecordDumpFile.$assign(o.RecordDumpFile);
    this.RecordStream.$assign(o.RecordStream);
    this.TempScenarioFile.$assign(o.TempScenarioFile);
    this.fPreinited = o.fPreinited;
    this.FrameCounter = o.FrameCounter;
    this.iTick2 = o.iTick2;
    this.iTick3 = o.iTick3;
    this.iTick5 = o.iTick5;
    this.iTick10 = o.iTick10;
    this.iTick35 = o.iTick35;
    this.iTick255 = o.iTick255;
    this.iTick1000 = o.iTick1000;
    this.TimeGo = o.TimeGo;
    this.Time = o.Time;
    this.StartTime = o.StartTime;
    this.InitProgress = o.InitProgress;
    this.LastInitProgress = o.LastInitProgress;
    this.LastInitProgressShowTime = o.LastInitProgressShowTime;
    this.RandomSeed = o.RandomSeed;
    this.GameGo = o.GameGo;
    this.FullSpeed = o.FullSpeed;
    this.FrameSkip = o.FrameSkip;
    this.DoSkipFrame = o.DoSkipFrame;
    this.fResortAnyObject = o.fResortAnyObject;
    this.IsRunning = o.IsRunning;
    this.PointersDenumerated = o.PointersDenumerated;
    this.StartupLogPos = o.StartupLogPos;
    this.QuitLogPos = o.QuitLogPos;
    this.fQuitWithError = o.fQuitWithError;
    this.DebugMode = o.DebugMode;
    this.NextMission.$assign(o.NextMission);
    this.NextMissionText.$assign(o.NextMissionText);
    this.NextMissionDesc.$assign(o.NextMissionDesc);
    this.DebugPort = o.DebugPort;
    this.DebugPassword.$assign(o.DebugPassword);
    this.DebugHost.$assign(o.DebugHost);
    this.DebugWait = o.DebugWait;
    this.ScriptGuiRoot = o.ScriptGuiRoot;
    return this;
  }
}

export class C4Game$CompileSettings {
  static $layout = [["init_mode", 0, "i32", 0], ["fPlayers", 4, "u8", 0], ["fExact", 5, "u8", 0], ["fSync", 6, "u8", 0]];
  static $size = 8;
  init_mode = 0;
  fPlayers = false;
  fExact = false;
  fSync = false;

  init(init_mode, fPlayers, fExact, fSync) {
    this.init_mode = init_mode;
    this.fPlayers = fPlayers;
    this.fExact = fExact;
    this.fSync = fSync;
    return this;
  }

  $clone() { return new C4Game$CompileSettings().$assign(this); }
  $assign(o) {
    this.init_mode = o.init_mode;
    this.fPlayers = o.fPlayers;
    this.fExact = o.fExact;
    this.fSync = o.fSync;
    return this;
  }
}

export class Check {
  static $layout = [["maxNumber", 0, "i32", 0]];
  static $size = 4;
  maxNumber = 0;

  that(obj) {
    let $t1, $t2, $t3, $t4, $t5, $t6;
    if (obj.Number < 1) {
      $.LogFatal($.FormatString(S("Invalid object enumeration number (%d) of object %s (x=%d)"), obj.Number, obj.id.ToString(), obj.GetX()).getData());
      return false;
    }
    if (obj.Number > this.maxNumber) {
      this.maxNumber = obj.Number;
    }
    $t1 = $.Objects;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    try {
      for (; $t2.op_ne($t3); $t2.op_inc$v()) {
        const other = $t2.op_mul();
        if (other !== obj) {
          if (obj.Number === other.Number) {
            $.LogFatal($.FormatString(S("Duplicate object enumeration number %d (%s and %s)"), other.Number, obj.GetName(), other.GetName()).getData());
            return false;
          }
        }
      }
    } finally { $t2.$dtor(); $t3.$dtor(); }
    $t4 = $.Objects.InactiveObjects;
    $t5 = $t4.begin();
    $t6 = $t4.end();
    try {
      for (; $t5.op_ne($t6); $t5.op_inc$v()) {
        const inactive = $t5.op_mul();
        if (inactive !== obj) {
          if (obj.Number === inactive.Number) {
            $.LogFatal($.FormatString(S("Duplicate object enumeration number %d (%s and %s(i))"), inactive.Number, obj.GetName(), inactive.GetName()).getData());
            return false;
          }
        }
      }
    } finally { $t5.$dtor(); $t6.$dtor(); }
    return true;
  }

  $clone() { return new Check().$assign(this); }
  $assign(o) {
    this.maxNumber = o.maxNumber;
    return this;
  }
}

export class C4GameSec1Timer extends C4ApplicationSec1Timer {

  init() {
    super.init();
    $.StdScheduler.prototype.Add$pStdSchedulerProc.call($.Application, this);
    return this;
  }

  $dtor() {
    $.StdScheduler.prototype.Remove.call($.Application, this);
    super.$dtor();
  }

  OnSec1Timer() {
    if ($.Game.TimeGo) {
      $.Game.Time = $.Game.Time + 1 | 0;
      $.Game.TimeGo = false;
    }
    $.Game.FPS = $.Game.cFPS;
    $.Game.cFPS = 0;
  }

  $clone() { return new C4GameSec1Timer().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}






export function GetKeyboardInputName(key_name, abbreviated = false, index = 0) {
  return $.Game.KeyboardInput.GetKeyCodeNameByKeyName(key_name, abbreviated, index);
}

export function DefFileGetID(filename) {
  let group = new $.C4Group().init();
  if (!group.Open(filename)) {
    return $.C4ID.None.$clone();
  }
  let DefCore = new $.C4Def().init();
  if (!DefCore.LoadDefCore(group)) {
    group.Close$v();
    return $.C4ID.None.$clone();
  }
  group.Close$v();
  return DefCore.id.$clone();
}

export function LandscapeFree(x, y) {
  if (!$.Inside$i32$i32$i32$3(x, 0, $.Landscape.GetWidth() - 1 | 0) || !$.Inside$i32$i32$i32$3(y, 0, $.Landscape.GetHeight() - 1 | 0)) {
    return false;
  }
  return !$.DensitySolid($.GBackDensity(x, y));
}

function FileMonitorCallback(file, _extrafile) {
  $.Game.ReloadFile(file);
}

export function ListExpandValids(rlist, idlist, maxidlist) {
  let cnt = 0;
  let cnt2 = 0;
  const ccount = [0];
  let cpos = 0;
  for (cpos = 0, cnt = 0; rlist.GetID$u64$pi32($u64n(cnt)).op_unsigned_long_C4ID_() != null; cnt = cnt + 1 | 0) {
    if ($.C4Id2Def(rlist.GetID$u64$pi32($u64n(cnt), P(ccount, 0))) != null) {
      for (cnt2 = 0; cnt2 < ccount[0]; cnt2 = cnt2 + 1 | 0) {
        if (cpos < maxidlist) {
          $oidx(idlist, cpos).$assign(rlist.GetID$u64$pi32($u64n(cnt)));
          cpos = cpos + 1 | 0;
        }
      }
    }
  }
  return cpos;
}

function PlaceVegetation_GetRandomPoint(iX, iY, iWdt, iHgt, shape_proplist, out_pos_proplist, piTx, piTy) {
  if (shape_proplist != null && out_pos_proplist != null) {
    let pars = new $.C4AulParSet().init$mC4Value($.C4VPropList(out_pos_proplist));
    if (shape_proplist.Call$i32$pC4AulParSet$b(144 /*P_GetRandomPoint*/, pars.op_and()).op_not()) {
      return false;
    }
    piTx.a[piTx.o] = out_pos_proplist.GetPropertyInt(33 /*P_x*/);
    piTy.a[piTy.o] = out_pos_proplist.GetPropertyInt(34 /*P_y*/);
  } else {
    piTx.a[piTx.o] = (iX >>> 0) + Random(iWdt >>> 0) >>> 0 | 0;
    piTy.a[piTy.o] = (iY >>> 0) + Random(iHgt >>> 0) >>> 0 | 0;
  }
  return true;
}

function PlaceVegetation_IsPosInBounds(iTx, iTy, _iX, iY, _iWdt, _iHgt, shape_proplist) {
  if (shape_proplist != null) {
    let pars = new $.C4AulParSet().init$mC4Value$mC4Value($.C4VInt(iTx), $.C4VInt(iTy));
    if (shape_proplist.Call$i32$pC4AulParSet$b(143 /*P_IsPointContained*/, pars.op_and()).op_not()) {
      return false;
    }
  } else {
    if (iTy < iY) {
      return false;
    }
  }
  return true;
}


export function GetTextSpecFacet(spec, facet) {
  0;
  if (spec == null) {
    return false;
  }
  if ($.SEqual2(spec, S("@Ico:"))) {
    spec = spec.add(5);
    let it = $.str_to_icon$C4Game.find(StdString.of(spec));
    if (!it.eq($.str_to_icon$C4Game.end())) {
      facet.$assign($.Icon.GetIconFacet$i32(it.v.second));
      return true;
    }
  }
  return false;
}

export function $init(): void {
  C4Game.DirectJoinFilePrefix = S("file:");
  $.GameParameters$C4Game = new $.C4GameParameters(); $.GameParameters$C4Game.init();
  $.GameScenarioParameterDefs$C4Game = new $.C4ScenarioParameterDefs(); $.GameScenarioParameterDefs$C4Game.init();
  $.GameStartupScenarioParameters$C4Game = new $.C4ScenarioParameters(); $.GameStartupScenarioParameters$C4Game.init();
  $.GameRoundResults$C4Game = new $.C4RoundResults(); $.GameRoundResults$C4Game.init();
  $.GameGlobalSoundModifier$C4Game = new $.C4Value(); $.GameGlobalSoundModifier$C4Game.init$v();
  $.str_to_icon$C4Game = $fill_list(new HashMap(), $own([
  new StdPair(StdString.of(S("Locked")), 269 /*Ico_Ex_LockedFrontal*/),
  new StdPair(StdString.of(S("League")), 264 /*Ico_Ex_League*/),
  new StdPair(StdString.of(S("GameRunning")), 30 /*Ico_GameRunning*/),
  new StdPair(StdString.of(S("Lobby")), 31 /*Ico_Lobby*/),
  new StdPair(StdString.of(S("RuntimeJoin")), 32 /*Ico_RuntimeJoin*/),
  new StdPair(StdString.of(S("A")), 512 /*Ico_Controller_A*/),
  new StdPair(StdString.of(S("B")), 515 /*Ico_Controller_B*/),
  new StdPair(StdString.of(S("X")), 529 /*Ico_Controller_X*/),
  new StdPair(StdString.of(S("Y")), 530 /*Ico_Controller_Y*/),
  new StdPair(StdString.of(S("Back")), 513 /*Ico_Controller_Back*/),
  new StdPair(StdString.of(S("Start")), 528 /*Ico_Controller_Start*/),
  new StdPair(StdString.of(S("Dpad")), 518 /*Ico_Controller_Dpad*/),
  new StdPair(StdString.of(S("DpadLeft")), 517 /*Ico_Controller_DpadLeft*/),
  new StdPair(StdString.of(S("DpadRight")), 519 /*Ico_Controller_DpadRight*/),
  new StdPair(StdString.of(S("DpadDown")), 516 /*Ico_Controller_DpadDown*/),
  new StdPair(StdString.of(S("DpadUp")), 520 /*Ico_Controller_DpadUp*/),
  new StdPair(StdString.of(S("LeftShoulder")), 521 /*Ico_Controller_LeftShoulder*/),
  new StdPair(StdString.of(S("RightShoulder")), 524 /*Ico_Controller_RightShoulder*/),
  new StdPair(StdString.of(S("LeftTrigger")), 523 /*Ico_Controller_LeftTrigger*/),
  new StdPair(StdString.of(S("RightTrigger")), 526 /*Ico_Controller_RightTrigger*/),
  new StdPair(StdString.of(S("LeftStick")), 522 /*Ico_Controller_LeftStick*/),
  new StdPair(StdString.of(S("RightStick")), 525 /*Ico_Controller_RightStick*/),
]));
}

Object.assign($, { C4Game, C4Game$CompileSettings, C4GameSec1Timer, Check, DefFileGetID, FileMonitorCallback, GetKeyboardInputName, GetTextSpecFacet, LandscapeFree, ListExpandValids, PlaceVegetation_GetRandomPoint, PlaceVegetation_IsPosInBounds });
