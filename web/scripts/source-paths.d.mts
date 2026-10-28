// freegames.stream website and game SDK: GPL-3.0-or-later, with an additional permission and additional terms under its section 7 (web/LICENSE.md).
// Types of source-paths.mjs, for the tests.
export declare const SOURCE_REPO: string;
export declare const SOURCE_REMOTE: string;
export declare const SOURCE_URL: string;
export declare const SOURCE_PATHS: string[];
export declare const NEVER: RegExp[];
export declare function sourceFiles(git: (...args: string[]) => string, commit: string): string[];
