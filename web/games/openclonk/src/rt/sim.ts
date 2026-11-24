// OpenClonk headless bootstrap: the C++ globals (Config, Game, Application) are set up by C4Globals.cpp
// after the translated modules' static initializers. A few constructors already read them, so give them
// the minimal browser values first; C4Globals replaces them when its turn comes.
import { $ } from './registry.ts';
import { P, S } from './ptr.ts';
import { StdString } from './std.ts';

export function bootstrap(): void {
  // constants of C4Client.h used as values (C4ClientIDUnknown = -1) before any module's $init reads them
  ($ as any)['C4ClientIDUnknown$C4Client'] ??= -1;
  ($ as any)['C4ClientIDAll$C4Client'] ??= -1;
  if (!$.Config) {
    $.Config = {
      Network: { ControlRate: 2, MaxLoad: 0, MaxPacketSize: 0 },
      General: {
        LanguageEx: new Int8Array(1), Language: new Int8Array(1), DebugRec: 0, DebugRecWrite: 0, FPS: 0,
        // C4ConfigGeneral: no external debug-record file (C4Playback::Open, Clear); src/rt/debugrec.ts takes the chunks
        DebugRecExternalFile: new Int8Array(4097),
      },
      Graphics: {}, Sound: {}, Game: {}, Developer: { AutoFileReload: 0 },
    };
  }
  const cfg = $.Config as any;
  if (!cfg.AtPathFilename) {
    // C4Config is opaque in the headless profile; its path helpers are simple and the
    // language/scenario loaders ask for them.
    const pathBuf = new Int8Array(4097);
    const at = (base: any, filename: any) => {
      // the paths are char arrays (boot.ts sets them), as C4ConfigGeneral's
      $.SCopy$pi8$pi8$u64(ArrayBuffer.isView(base) ? P(base, 0) : base, P(pathBuf, 0), 4096);
      if (filename) $.SAppend(filename, P(pathBuf, 0), 4096);
      return P(pathBuf, 0);
    };
    cfg.AtPathFilename = pathBuf;
    cfg.AtExePath = (f: any) => at(cfg.General.ExePath?.getData?.() ?? cfg.General.ExePath, f);
    cfg.AtSystemDataPath = (f: any) => at(cfg.General.SystemDataPath, f);
    cfg.AtUserDataPath = (f: any) => at(cfg.General.UserDataPath, f);
    cfg.AtTempPath = (f: any) => at(cfg.General.TempPath, f);
    cfg.AtNetworkPath = (f: any) => at(cfg.General.UserDataPath, f);
    cfg.AtRelativePath = (filename: any) => {
      const rel = $.GetRelativePathS(filename, P(cfg.General.UserDataPath, 0));
      if (rel && rel.a === filename.a && rel.o === filename.o) {
        return $.GetRelativePathS(filename, P(cfg.General.SystemDataPath, 0));
      }
      return rel;
    };
    cfg.AtUserDataRelativePath = (f: any) => cfg.AtUserDataPath(f);
    cfg.ForceRelativePath = (buf: any) => {
      const rel = $.GetRelativePathS(buf.getData(), P(cfg.General.SystemDataPath, 0));
      if (rel && !(rel.a === buf.getData().a && rel.o === buf.getData().o)) {
        buf.Copy$pi8(rel);
      }
    };
    cfg.GetSubkeyPath = (subkey: any) => subkey;
  }
  if (!cfg.General.CreateSaveFolder) {
    // C4ConfigGeneral::CreateSaveFolder (C4Config.cpp): the folder, and its title component "<language>:<title>"
    // when there is none yet (C4Record::Start creates Records.ocf with it)
    cfg.General.CreateSaveFolder = (directory: any, languageTitle: any) => {
      if (!$.CreatePath(StdString.of(directory))) return false;
      const language = new Int8Array(3);
      $.SCopy$pi8$pi8$u64(P(cfg.General.Language, 0), P(language, 0), 2);
      const titleFile = new $.StdStrBuf();
      titleFile.Format(S('%s%c%s'), directory, 47, S('Title.txt'));
      const titleData = new $.StdStrBuf();
      titleData.Format(S('%s:%s'), P(language, 0), languageTitle);
      if (!$.FileExists(titleFile.getData())) {
        const file = new $.CStdFile();
        if (!file.Create(titleFile.getData()) || !file.WriteString(titleData.getData()) || !file.Close$ppStdBuf()) return false;
      }
      return true;
    };
  }
  if (!$.Application) {
    $.Application = {
      SoundSystem: { Clear() {}, ClearGame() {}, Stop() {}, Fade() {} },
      MusicSystem: {
        Clear() {}, ClearGame() {}, Stop() {}, Play() {}, Execute() {},
        InitForScenario() {}, UpdateVolume() {}, Fade() {},
        SetPlayList: () => 0, SetMusic: () => 0, GetPlayList: () => null, IsPlaying: () => false,
        ToggleOff() {}, ToggleOn() {},
      },
      Quit: () => {}, DoFullscreen: () => {},
    };
  }
  // GUI/input initializers are opaque in the headless profile; the game object still asks for
  // the keyboard handler during init.
  ($ as any).C4KeyboardInput_Init ??= () => ({
    $clone() { return this; }, $assign() { return this; },
    Clear() {}, Init() {}, DoInput() {}, LoadCustomConfig() {},
    RegisterKey() { return true; }, GetKeyCodeNameByKeyName() { return null; },
  });
  ($ as any).C4KeyboardInput_Default ??= () => {};
  for (const n of ['Messages', 'MessageInput', 'DefaultRanks', 'MassMover', 'PXS']) {
    if (!(n in $)) ($ as any)[n] = { Default() {}, Clear() {}, init() { return this; } };
  }
  if (!$.Game) {
    $.Game = {
      Parameters: { ControlRate: 2, MaxPlayers: 12, Lives: 3, Teams: false, Timelimit: 0 },
      Clients: { getLocal: () => null, RemoveRemote: () => {} },
      PlayerInfos: { FixIDCounter: () => {} },
      Time: 0, TimeGo: false, FPS: 0, cFPS: 0,
    };
  }
}
