// lw/message.ts: src/message.c: messages in the battle's bottom right corner, each shown for a second
// after the one before it.

import { font, text_height, text_length, textout_ex } from '../al/font.ts';
import { sys } from '../al/sys.ts';
import { VP } from './viewport.ts';

const MESSAGE_MAX = 12;
const MESSAGE_SIZE = 64;
let MESSAGE_NB = 0;
const MESSAGE: string[] = new Array(MESSAGE_MAX).fill('');
const MESSAGE_TICKER = new Int32Array(MESSAGE_MAX);
const MESSAGE_DISPLAYED = new Int32Array(MESSAGE_MAX);
const MESSAGE_DELAY = 1000;

export function clear_message(): void {
  MESSAGE_NB = 0;
}

export function display_message(): void {
  const new_ticker = sys.ticker();
  for (let i = 0; i < MESSAGE_NB; ++i) {
    if (!MESSAGE_DISPLAYED[i]) {
      MESSAGE_DISPLAYED[i] = 1;
      MESSAGE_TICKER[i] = new_ticker + MESSAGE_DELAY * (i + 1);
    }
  }
  while (MESSAGE_NB > 0 && MESSAGE_DISPLAYED[0] && new_ticker > MESSAGE_TICKER[0]!) {
    for (let i = 0; i < MESSAGE_NB - 1; ++i) {
      MESSAGE[i] = MESSAGE[i + 1]!;
      MESSAGE_TICKER[i] = MESSAGE_TICKER[i + 1]!;
    }
    MESSAGE_NB--;
  }
  const ns = VP.NEXT_SCREEN!;
  const h = text_height(font);
  for (let i = 0; i < MESSAGE_NB; ++i) {
    textout_ex(ns, font, MESSAGE[i]!, ns.w - text_length(font, MESSAGE[i]!), ns.h - (MESSAGE_NB - i) * h, -1, -1);
  }
}

export function message_str(str: string): void {
  while (MESSAGE_NB >= MESSAGE_MAX) {
    for (let i = 0; i < MESSAGE_NB - 1; ++i) {
      MESSAGE[i] = MESSAGE[i + 1]!;
      MESSAGE_TICKER[i] = MESSAGE_TICKER[i + 1]! - MESSAGE_DELAY;
    }
    MESSAGE_NB--;
  }
  MESSAGE_DISPLAYED[MESSAGE_NB] = 0;
  MESSAGE[MESSAGE_NB] = str.slice(0, MESSAGE_SIZE);
  MESSAGE_NB++;
}

export function message_str_int(str: string, val: number): void {
  message_str(`${str}${val}`);
}
