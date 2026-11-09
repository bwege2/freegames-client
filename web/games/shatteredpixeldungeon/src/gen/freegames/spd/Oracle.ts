// @ts-nocheck
// re/shatteredpixeldungeon/oracle/src/freegames/spd/Oracle.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
import { $J, Base64, Collections, IllegalArgumentException, JObject, JString, StringBuilder } from '../../../jre/index.ts';

let Dungeon, GamesInProgress, Actor, HeroClass, Mob, GameScene, InterlevelScene, InterlevelScene$Mode, TitleScene, ActionIndicator, GameLog, Game, Bundle, FileUtils, Random;

/**
 * The oracle's driver (re/shatteredpixeldungeon/NOTES.md, "The oracle"). It runs on the JVM against the
 * original (OracleMain) and, translated by j2ts, in node against the port (web/games/shatteredpixeldungeon/test):
 * both print the same lines for the same arguments.
 *
 * levels(seed, heroClass, depths): a new game as InterlevelScene.descend starts one (Dungeon.init with the
 * hero class chosen in HeroSelectScene), then every level of branch 0 from depth 1 on, generated in order as
 * the original's debug start does (InterlevelScene.descend, DeviceCompat.isDebug): one line per depth, the
 * level's bundle as Dungeon.saveLevel writes it ({"level": ...}).
 *
 * play(game, seed, heroClass, script): the whole game, scenes and all, frame by frame as the backend runs it
 * (play() calls game.render(); the backend gives every frame the same time step), from the title scene: a new
 * game as HeroSelectScene's start button starts it, then the script's commands, each followed by frames until
 * the hero waits for the player again. Commands (separated by spaces): kN presses and releases the key with
 * libGDX key code N through the game's InputHandler (as the keyboard does); cN taps cell N
 * (GameScene.handleCell, as a tap on the map does); fN runs N frames. One line per command with the state of
 * the hero, then the game's and the level's bundles as Dungeon.saveAll writes them.
 */
export class Oracle extends JObject {
  /**
   * At most this many frames per command (a command that does not end is reported, not waited for).
   */
  static readonly MAX_FRAMES: number = 1200;
  static frames: number = 0;
  _Oracle(): this {
    return this;
  }
  static levels(seed: bigint, heroClass: number, depths: number): string {
    let out = new StringBuilder();
    Random.oracle = true;
    Random.oracleNext = seed;
    Random.resetGenerators();
    GamesInProgress.selectedClass = HeroClass.values()[heroClass];
    GamesInProgress.curSlot = 1;
    Dungeon.seed = seed;
    Dungeon.daily = Dungeon.dailyReplay = false;
    Dungeon.customSeedText = '';
    Mob.clearHeldAllies();
    Dungeon.init();
    GameLog.wipe();
    for (let d = 1; d <= depths; d++) {
      Dungeon.depth = d;
      Dungeon.branch = 0;
      let level = Dungeon.newLevel();
      Dungeon.level = level;
      let b = new Bundle()._Bundle$();
      b.put$String$Bundlable('level', level);
      out.append('depth ').append(String(d)).append(String.fromCharCode(32 /* ' ' */)).append(b.toString()).append(String.fromCharCode(10 /* \u000a */));
    }
    return out.toString();
  }
  static frame(game: Game): void {
    game.render();
    Oracle.frames++;
  }
  /**
   * Frames until the game waits for the player: the hero is ready, or a window is open (or MAX_FRAMES).
   */
  static settle(game: Game, max: number): boolean {
    for (let i = 0; i < max; i++) {
      if (Game.scene() instanceof GameScene && !Game.switchingScene() && Dungeon.hero != null && (Dungeon.hero.ready_ || GameScene.showingWindow()) && !Actor.resumable()) {
        return true;
      }
      Oracle.frame(game);
    }
    return false;
  }
  static state(cmd: string, settled: boolean): string {
    let h = Dungeon.hero;
    let s = new StringBuilder();
    s.append(cmd).append(' frame=').append(String(Oracle.frames)).append(settled ? '' : ' NOT-SETTLED');
    if (h != null) {
      s.append(' depth=').append(String(Dungeon.depth)).append(' pos=').append(String(h.pos)).append(' hp=').append(String(h.HP)).append(String.fromCharCode(47 /* \u002f */)).append(String(h.HT)).append(' lvl=').append(String(h.lvl)).append(' exp=').append(String(h.exp)).append(' gold=').append(String(Dungeon.gold)).append(' now=').append($J.fstr(Actor.now())).append(' alive=').append(String(h.isAlive())).append(' ready=').append(String(h.ready_));
    }
    s.append(' scene=').append(Game.scene() == null ? '-' : Game.scene().getClass().getSimpleName());
    if (GameScene.showingWindow()) {
      s.append(' window');
    }
    return s.append(String.fromCharCode(10 /* \u000a */)).toString();
  }
  /**
   * The title's "Continue" of slot 1 (windows/WndGameInProgress, the continue button).
   */
  static continueGame(): void {
    GamesInProgress.curSlot = 1;
    Dungeon.hero = null;
    Dungeon.daily = Dungeon.dailyReplay = false;
    ActionIndicator.clearAction$();
    InterlevelScene.mode = InterlevelScene$Mode.CONTINUE;
    Game.switchScene$Class($J.cls(InterlevelScene));
  }
  /**
   * Saves as the game menu's "Main menu" does (windows/WndGame: Dungeon.saveAll) and prints the saved game's
   * files as "file NAME BASE64" lines.
   */
  static saveFiles(): string {
    Dungeon.saveAll();
    let out = new StringBuilder();
    let dir = GamesInProgress.gameFolder(1);
    let names = FileUtils.filesInDir(dir);
    Collections.sort(names);
    for (const $it0 = names.iterator(); $it0.hasNext(); ) {
      let name = $it0.next();
      let path = dir + '/' + name;
      out.append('file ').append(path).append(String.fromCharCode(32 /* ' ' */)).append(Base64.getEncoder().encodeToString(FileUtils.getFileHandle$String(path).readBytes())).append(String.fromCharCode(10 /* \u000a */));
    }
    return out.toString();
  }
  static play(game: Game, seed: bigint, heroClass: number, script: string): string {
    let out = new StringBuilder();
    Random.oracle = true;
    Random.oracleNext = seed;
    Random.resetGenerators();
    Oracle.frames = 0;
    let commands = new StringBuilder();
    for (let line of JString.split(script, '\n')) {
      if (line.startsWith('file ')) {
        let f = JString.split(JString.trim(line), ' ');
        FileUtils.getFileHandle$String(f[1]).writeBytes(Base64.getDecoder().decode(f[2]), false);
      } else {
        commands.append(line).append(String.fromCharCode(10 /* \u000a */));
      }
    }
    script = JString.trim(commands.toString());
    for (let i = 0; i < 10; i++) {
      Oracle.frame(game);
    }
    if (script.startsWith('C')) {
      Oracle.continueGame();
      script = script.substring(1);
    } else {
      GamesInProgress.selectedClass = HeroClass.values()[heroClass];
      GamesInProgress.curSlot = 1;
      Dungeon.hero = null;
      Dungeon.daily = Dungeon.dailyReplay = false;
      Dungeon.seed = seed;
      Dungeon.customSeedText = '';
      ActionIndicator.clearAction$();
      InterlevelScene.mode = InterlevelScene$Mode.DESCEND;
      Game.switchScene$Class($J.cls(InterlevelScene));
    }
    out.append(Oracle.state('start', Oracle.settle(game, 300)));
    for (let cmd of JString.split(JString.trim(script), '\\s+')) {
      if ((cmd.length === 0)) {
        continue;
      }
      let n = cmd.length > 1 ? $J.parseInt(cmd.substring(1)) : 0;
      if (cmd.charCodeAt(0) === 113 /* 'q' */) {
        out.append(Oracle.saveFiles());
        return out.toString();
      }
      switch (cmd.charCodeAt(0)) {
        case 107 /* 'k' */:
          Game.inputHandler.keyDown(n);
          Oracle.frame(game);
          Game.inputHandler.keyUp(n);
          Oracle.frame(game);
          break;
        case 99 /* 'c' */:
          GameScene.handleCell(n);
          Oracle.frame(game);
          break;
        case 102 /* 'f' */:
          for (let i = 0; i < n; i++) {
            Oracle.frame(game);
          }
          break;
        case 114 /* 'r' */:
          Dungeon.saveAll();
          Game.switchScene$Class($J.cls(TitleScene));
          for (let i = 0; i < n; i++) {
            Oracle.frame(game);
          }
          Oracle.continueGame();
          break;
        default:
          throw new IllegalArgumentException('unknown command ' + cmd);
      }
      out.append(Oracle.state(cmd, Oracle.settle(game, Oracle.MAX_FRAMES)));
      if (Dungeon.hero == null || !Dungeon.hero.isAlive()) {
        break;
      }
    }
    if (Dungeon.hero != null && Dungeon.hero.isAlive()) {
      Dungeon.saveAll();
      out.append('game ').append(FileUtils.bundleFromFile(GamesInProgress.gameFile(1)).toString()).append(String.fromCharCode(10 /* \u000a */));
      out.append('level ').append(FileUtils.bundleFromFile(GamesInProgress.depthFile(1, Dungeon.depth, Dungeon.branch)).toString()).append(String.fromCharCode(10 /* \u000a */));
    }
    return out.toString();
  }
}

$J.define(Oracle, 'freegames.spd.Oracle', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Oracle' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  GamesInProgress = $J.load('com.shatteredpixel.shatteredpixeldungeon.GamesInProgress');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  HeroClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  InterlevelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene');
  InterlevelScene$Mode = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene$Mode');
  TitleScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.TitleScene');
  ActionIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ActionIndicator');
  GameLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.GameLog');
  Game = $J.load('com.watabou.noosa.Game');
  Bundle = $J.load('com.watabou.utils.Bundle');
  FileUtils = $J.load('com.watabou.utils.FileUtils');
  Random = $J.load('com.watabou.utils.Random');
});
