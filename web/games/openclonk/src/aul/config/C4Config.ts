// @ts-nocheck
// OpenClonk 36de799: src/config/C4Config.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $oarr } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';

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

  $clone() { return new C4ConfigDeveloper().$assign(this); }
  $assign(o) {
    this.AutoFileReload = o.AutoFileReload;
    this.TodoFilename = o.TodoFilename.slice();
    this.AltTodoFilename = o.AltTodoFilename.slice();
    this.MaxScriptMRU = o.MaxScriptMRU;
    this.DebugShapeTextures = o.DebugShapeTextures;
    this.ShowHelp = o.ShowHelp;
    this.RecentlyEditedSzenarios = o.RecentlyEditedSzenarios.slice();
    return this;
  }
}

export class C4ConfigGraphics {
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
  RXSound = 0;
  RXMusic = 0;
  FEMusic = 0;
  FESamples = 0;
  Verbose = 0;
  MusicVolume = 0;
  SoundVolume = 0;

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
  CountdownTime = 0;
  AllowPlayerSave = 0;

  $clone() { return new C4ConfigLobby().$assign(this); }
  $assign(o) {
    this.CountdownTime = o.CountdownTime;
    this.AllowPlayerSave = o.AllowPlayerSave;
    return this;
  }
}

export class C4ConfigIRC {
  Server = new Int8Array(1025);
  Nick = new Int8Array(1025);
  RealName = new Int8Array(1025);
  Channel = new Int8Array(1025);
  AllowAllChannels = 0;

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
  Button = new Int32Array(12);
  AxisMin = new Uint32Array(6);
  AxisMax = new Uint32Array(6);
  AxisCalibrated = new Array(6).fill(false);

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
  KeyPath = new Int8Array(1025);
  WasRegistered = 0;

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
    return this;
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
    this.Gamepads = o.Gamepads.slice();
    this.Controls.$assign(o.Controls);
    this.Startup.$assign(o.Startup);
    this.Security.$assign(o.Security);
    this.ConfigLoaded = o.ConfigLoaded;
    this.ConfigFilename.$assign(o.ConfigFilename);
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4Config, C4ConfigControls, C4ConfigDeveloper, C4ConfigGamepad, C4ConfigGeneral, C4ConfigGeneral$$anon1, C4ConfigGraphics, C4ConfigIRC, C4ConfigLobby, C4ConfigNetwork, C4ConfigSecurity, C4ConfigSound, C4ConfigStartup });
