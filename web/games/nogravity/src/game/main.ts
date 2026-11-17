// No Gravity port (GPL-3.0-or-later; translated in 2026 by the freegames project from realtech VR's
// No Gravity 2.0, GPL-2.0-or-later; LICENSE.md): the program (src/lithium.c, STUB_MainCode): loading
// the game data, the console commands, the intro pictures, then menu -> missions -> menu.
import { V3X, V3XOPTION_COLLISION, V3XOPTION_TRUECOLOR, hooks } from '../v3x/scene.ts';
import { GameAbort, STUB_TaskControl, timer_Start } from '../sys/sys.ts';
import { loadFonts, readLanguagePack, readMissionList } from './data.ts';
import { conCreate, conPrint, conBindCmd, conSetFont, conSetLimits } from './console.ts';
import { NG_AudioLoadList, NG_AudioLoadWave, NG_AudioPlaySound, NG_AudioGetByName, audio } from './sound.ts';
import { NG_FXCreate, NG_FXLoadList } from './fx.ts';
import { NG_StarfieldCreate } from './play.ts';
import { NG_GameStart, NG_GameStop, NG_GamePlay } from './start.ts';
import { NG_MainMenu, NG_MenuCredits, NG_EndLevel } from './menu.ts';
import { NG_PlayPresentsGame, NG_PlayGameOver, NG_WaitForKeyWithDelay } from './video.ts';
import { buildLights, cullObjects } from './render.ts';
import {
  G, g_SGSettings, g_SGGame, CAMERA_NEWNAV, GAMESTATE_WON, GAMESTATE_ABORT, GAMESTATE_RETRY, GAMESTATE_QUIT, GAMESTATE_FAILED,
  GODMODE, STEALTHMODE,
} from './state.ts';

/** NG_SetGameInfo and the console commands of STUB_MainCode */
export function NG_Init(): void {
  g_SGSettings.Menu = 1; g_SGSettings.RecTime = 15; g_SGSettings.DemoDelay = 30; g_SGSettings.VerticalSync = 1;
  g_SGSettings.WorldUnit = 1; g_SGSettings.showInf = 1;
  V3X.Setup.flags |= V3XOPTION_TRUECOLOR | V3XOPTION_COLLISION;
  V3X.ViewPort.minTextureVisibleRadius = 6 / 200;
  V3X.ViewPort.minVisibleRadius = 12 / 300;
  hooks.geometry = (scene) => { buildLights(scene); cullObjects(scene); };
  conCreate();
  conPrint('Welcome to No Gravity.');
  const bonus = (): void => { NG_AudioPlaySound(NG_AudioGetByName('bonus') - 1, 0); };
  conBindCmd('/cheat', () => { g_SGSettings.Cheater = 1 - g_SGSettings.Cheater; bonus(); conPrint(`cheat mode is ${g_SGSettings.Cheater ? 'on' : 'off'}`); });
  conBindCmd('/warp', () => { g_SGGame.CameraMode = CAMERA_NEWNAV; });
  conBindCmd('/lose', () => { G.g_SGObjects.FinCode = GAMESTATE_FAILED; bonus(); conPrint('Lose'); });
  conBindCmd('/win', () => { G.g_SGObjects.FinCode = GAMESTATE_WON; bonus(); conPrint('Win'); });
  conBindCmd('/ticker', () => { g_SGSettings.ticker ^= 1; conPrint(`ticker is ${g_SGSettings.ticker ? 'on' : 'off'}`); });
  conBindCmd('god', () => { if (G.g_pPlayer) { G.g_pPlayer.mode ^= GODMODE; conPrint(`god mode is ${G.g_pPlayer.mode & GODMODE ? 'on' : 'off'}`); } });
  conBindCmd('stealth', () => { if (G.g_pPlayer) { G.g_pPlayer.mode ^= STEALTHMODE; conPrint(`stealth mode is ${G.g_pPlayer.mode & STEALTHMODE ? 'on' : 'off'}`); } });
  conPrint('System:');
  conPrint('3D driver : ~OpenGL~');
  conPrint('Display driver : ~SDL~.');
  conPrint(audio.enabled ? 'Sound driver : ~SDL_mixer~.' : 'No sound.');
}

/** NG_LoadGameData */
export async function NG_LoadGameData(): Promise<void> {
  loadFonts();
  conSetFont(G.g_pFont);
  readLanguagePack();
  readMissionList();
  NG_StarfieldCreate();
  NG_FXLoadList();
  NG_AudioLoadList();
  NG_FXCreate();
  await NG_AudioLoadWave();
  audio.mixer.open(16);
}

/** STUB_MainCode after the data is loaded */
export async function NG_Run(): Promise<void> {
  conSetLimits(0, 0, 640, 240);
  try {
    await NG_PlayPresentsGame();
    let MenuChoice = 1;
    do {
      if (STUB_TaskControl()) break;
      if (g_SGSettings.Menu) MenuChoice = await NG_MainMenu();
      if (MenuChoice === 3) await NG_MenuCredits();
      else if (MenuChoice === 1) {
        let quit = false;
        do {
          await NG_GameStart();
          await NG_GamePlay(NG_WaitForKeyWithDelay);
          NG_GameStop();
          MenuChoice = 0;
          if (!g_SGSettings.DemoMode) {
            switch (G.g_SGObjects.FinCode) {
              case GAMESTATE_WON: await NG_EndLevel(); MenuChoice = 0; break;
              case GAMESTATE_ABORT: MenuChoice = 0; break;
              case GAMESTATE_RETRY: MenuChoice = 1; break;
              case GAMESTATE_QUIT: quit = true; break;
              default:
                if (!STUB_TaskControl()) { await NG_PlayGameOver(); MenuChoice = g_SGSettings.Menu; g_SGSettings.Menu = 1; }
                break;
            }
          } else {
            if (g_SGSettings.DemoMode === 2) {
              if (g_SGGame.Demo === 3) await NG_MenuCredits();
              if (g_SGGame.Demo === 0) await NG_PlayPresentsGame();
            }
            MenuChoice = 0;
          }
        } while (MenuChoice !== 0 && !quit);
        if (quit) break;
        MenuChoice = 1;
      } else MenuChoice = 0;
      timer_Start(70, 1);
    } while (MenuChoice !== 0);
  } catch (e) {
    if (!(e instanceof GameAbort)) throw e;
  }
}
