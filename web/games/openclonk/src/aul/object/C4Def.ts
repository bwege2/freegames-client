// @ts-nocheck
// OpenClonk 36de799: src/object/C4Def.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $ } from '../../rt/registry.ts';










export function $init(): void {
  $.C4D_StaticBack$C4Def = 1;
  $.C4D_Structure$C4Def = 2;
  $.C4D_Vehicle$C4Def = 4;
  $.C4D_Living$C4Def = 8;
  $.C4D_Object$C4Def = 16;
  $.C4D_Background$C4Def = 4096;
  $.C4D_Foreground$C4Def = 32768;
  $.C4D_SortLimit$C4Def = $.C4D_StaticBack$C4Def | $.C4D_Structure$C4Def | $.C4D_Vehicle$C4Def | $.C4D_Living$C4Def | $.C4D_Object$C4Def | $.C4D_Background$C4Def | $.C4D_Foreground$C4Def;
  $.C4Plane_Structure$C4Def = 200;
}
