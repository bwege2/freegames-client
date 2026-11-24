// freegames.stream website and game SDK: GPL-3.0-or-later, with an additional permission and additional terms under its section 7 (web/LICENSE.md).
// Types of build-if.mjs, for the tests.
export declare function settingValue(path: string, name: string, readFile?: (path: string) => string): boolean;
export declare function applyBuildIf(code: string, id: string, readFile?: (path: string) => string): string | null;
export declare function buildIf(): { name: string; enforce: 'pre'; transform(code: string, id: string): { code: string; map: null } | null };
