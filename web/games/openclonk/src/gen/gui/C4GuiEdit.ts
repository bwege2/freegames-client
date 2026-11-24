// @ts-nocheck
// OpenClonk 36de799: src/gui/C4GuiEdit.cpp, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $ } from '../../rt/registry.ts';

export function IsUtf8ContinuationByte(c) {
  return (c & 192) === 128;
}

export function IsUtf8StartByte(c) {
  return (c & 192) === 192;
}

export function IsWholeWordSpacer(c) {
  return !$.Inside$i8$i8$i8(c << 24 >> 24, 65, 90) && !$.Inside$i8$i8$i8(c << 24 >> 24, 97, 122) && !$.Inside$i8$i8$i8(c << 24 >> 24, 48, 57) && c !== 95 && c < 127;
}

export function $init(): void {
}

Object.assign($, { IsUtf8ContinuationByte, IsUtf8StartByte, IsWholeWordSpacer });
