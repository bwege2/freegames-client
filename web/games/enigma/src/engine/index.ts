// The engine's entry: registers all object kinds and loads the object declarations and display models.
import { ObjectValidator } from './validator.ts';
import { setValidator, display } from './core.ts';
import { loadModels, type ModelFiles } from './models.ts';
import { setDataFiles } from './level.ts';
import './objects/floors.ts';
import './objects/stones1.ts';
import './objects/stones2.ts';
import './objects/stones3.ts';
import './objects/items1.ts';
import './objects/balls.ts';
import './objects/oxyd.ts';
import './objects/laser.ts';
import './objects/rotors.ts';
import './objects/misc.ts';
import './objects/puzzle.ts';
import './objects/others.ts';
import './objects/items2.ts';
import './objects/stones4.ts';
import './objects/items3.ts';
import './objects/stones5.ts';
import './objects/floors2.ts';
import './objects/blocker.ts';
import './objects/stones6.ts';
import './objects/misc2.ts';
import './objects/items4.ts';
import './objects/items5.ts';
import './objects/horse.ts';
import './objects/window.ts';

export interface EngineFiles extends ModelFiles {
  /** a data file's text as UTF-8 (objects.xml) */
  text(name: string): string;
}

let initialized = false;
export function initEngine(files: EngineFiles): string[] {
  if (initialized) return [];
  initialized = true;
  setValidator(new ObjectValidator(files.text('objects.xml')));
  setDataFiles((n) => files.lua(n));
  return loadModels(display, files);
}
