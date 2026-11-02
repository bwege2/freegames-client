// The original's English translate() (lib/translate.js): the source strings are the English text,
// and {0}, {1}, ... are replaced with the arguments. Translations are not part of this port.
export function translate(text: string, ...args: unknown[]): string {
  if (!args.length) return text;
  return text.replace(/\{([^}]+)\}/g, (_match, index) => String(args[Number(index)]));
}
