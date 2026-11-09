// @ts-nocheck
// re/shatteredpixeldungeon/oracle/src/freegames/spd/WebLauncher.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
import { $J, Files_FileType, JObject } from '../../../jre/index.ts';

let ShatteredPixelDungeon, Game, FileUtils, WebPlatformSupport;

/**
 * What the original's DesktopLauncher (desktop/.../DesktopLauncher.java) sets up before it starts the game,
 * for the browser: the version (build.gradle: appVersionName 4.0.2, appVersionCode 922), the place of the
 * game's files (saves, rankings, badges: the backend's local files, kept in the site's storage), and the game
 * itself with the port's platform support. The settings are the backend's preferences "settings.xml"
 * (GameSettings.DEFAULT_PREFS_FILE). The backend (src/gdx) runs the returned listener.
 */
export class WebLauncher extends JObject {
  _WebLauncher(): this {
    return this;
  }
  static create(): ShatteredPixelDungeon {
    Game.version = '4.0.2';
    Game.versionCode = 922;
    FileUtils.setDefaultFileProperties(Files_FileType.Local, '');
    return new ShatteredPixelDungeon()._ShatteredPixelDungeon(new WebPlatformSupport()._WebPlatformSupport());
  }
}

$J.define(WebLauncher, 'freegames.spd.WebLauncher', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_WebLauncher' } });
$J.module(() => {
  ShatteredPixelDungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ShatteredPixelDungeon');
  Game = $J.load('com.watabou.noosa.Game');
  FileUtils = $J.load('com.watabou.utils.FileUtils');
  WebPlatformSupport = $J.load('freegames.spd.WebPlatformSupport');
});
