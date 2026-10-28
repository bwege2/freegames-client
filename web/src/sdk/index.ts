// freegames.stream website and game SDK: GPL-3.0-or-later, with an additional permission and additional terms under its section 7 (web/LICENSE.md).
// The SDK for game ports (docs/GAME-INTEGRATION.md). Import from here: `import type { StartGame } from '../../../src/sdk/index.ts'`.
export type { GameManifest, GameContext, GameInstance, StartGame } from './game.ts';
export { GameClient, ServerError, playerName, setPlayerName, type NetStatus, type ClientOptions } from './net/client.ts';
export { Rooms, SERVER_SEAT, type RoomState, type RoundStart, type SeatInfo, type GameMessage, type SendTo } from './rooms.ts';
export { Storage, type FileInfo } from './storage.ts';
export { Scores, type ScoreEntry } from './scores.ts';
export { openLobby, joinableRooms, type LobbyOptions } from './lobby.ts';
export { packGame, unpackGame, setData, bytes } from './net/codec.ts';
export { Teletype, TextScreen, TeletypeBuffer, TextGrid, LineEditor, keyInput, REVERSE, BOLD, UNDERLINE, CURSOR, type KeyInput, type TerminalOptions } from './terminal.ts';
export { PixelScreen, fitScale, type PixelScreenOptions } from './screen.ts';
