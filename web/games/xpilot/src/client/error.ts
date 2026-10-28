// common/error.c: warn(), error(), fatal(), xpprintf(): lines for the platform's log.
import { sys } from './sys.ts';

export function warn(msg: string): void {
  if (sys) sys.log(msg);
}

export function error(msg: string): void {
  if (sys) sys.log(msg);
}

export function xpprintf(msg: string): void {
  if (sys) sys.log(msg);
}

export function fatal(msg: string): never {
  if (sys) sys.log(msg);
  throw new Error(msg);
}
