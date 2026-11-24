// @ts-nocheck
// OpenClonk 36de799: src/C4Globals.cpp, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $ } from '../rt/registry.ts';












export function $init(): void {
  $.Strings = new $.C4StringTable(); $.Strings.init();
  $.ScriptEngine = new $.C4AulScriptEngine(); $.ScriptEngine.init();
  $.Application = new $.C4Application(); $.Application.init();
  $.Console = new $.C4Console(); $.Console.init();
  $.FullScreen = new $.C4FullScreen(); $.FullScreen.init();
  $.MouseControl = new $.C4MouseControl(); $.MouseControl.init();
  $.Objects = new $.C4GameObjects(); $.Objects.init();
  $.Definitions = new $.C4DefList(); $.Definitions.init();
  $.GraphicsSystem = new $.C4GraphicsSystem(); $.GraphicsSystem.init();
  $.Game = new $.C4Game(); $.Game.init();
  $.Network = new $.C4Network2(); $.Network.init();
}
