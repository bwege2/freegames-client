// @ts-nocheck
// Sets every global and static variable to its initial value, as a new process starts.
// Written by re/brogue/tools/c2ts (do not edit).
import { $init as init_Architect } from './Architect.ts';
import { $init as init_Buttons } from './Buttons.ts';
import { $init as init_Combat } from './Combat.ts';
import { $init as init_Dijkstra } from './Dijkstra.ts';
import { $init as init_GlobalsBase } from './GlobalsBase.ts';
import { $init as init_Globals } from './Globals.ts';
import { $init as init_GlobalsBrogue } from './GlobalsBrogue.ts';
import { $init as init_GlobalsBulletBrogue } from './GlobalsBulletBrogue.ts';
import { $init as init_GlobalsRapidBrogue } from './GlobalsRapidBrogue.ts';
import { $init as init_Grid } from './Grid.ts';
import { $init as init_IO } from './IO.ts';
import { $init as init_Items } from './Items.ts';
import { $init as init_Light } from './Light.ts';
import { $init as init_MainMenu } from './MainMenu.ts';
import { $init as init_Math } from './Math.ts';
import { $init as init_Monsters } from './Monsters.ts';
import { $init as init_Movement } from './Movement.ts';
import { $init as init_PowerTables } from './PowerTables.ts';
import { $init as init_Recordings } from './Recordings.ts';
import { $init as init_RogueMain } from './RogueMain.ts';
import { $init as init_SeedCatalog } from './SeedCatalog.ts';
import { $init as init_Time } from './Time.ts';
import { $init as init_Utilities } from './Utilities.ts';
import { $init as init_Wizard } from './Wizard.ts';
import { $init as init_main } from './main.ts';
import { $init as init_platformdependent } from './platformdependent.ts';

export function initGlobals(): void {
  init_Architect();
  init_Buttons();
  init_Combat();
  init_Dijkstra();
  init_GlobalsBase();
  init_Globals();
  init_GlobalsBrogue();
  init_GlobalsBulletBrogue();
  init_GlobalsRapidBrogue();
  init_Grid();
  init_IO();
  init_Items();
  init_Light();
  init_MainMenu();
  init_Math();
  init_Monsters();
  init_Movement();
  init_PowerTables();
  init_Recordings();
  init_RogueMain();
  init_SeedCatalog();
  init_Time();
  init_Utilities();
  init_Wizard();
  init_main();
  init_platformdependent();
}
