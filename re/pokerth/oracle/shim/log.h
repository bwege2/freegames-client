// Oracle shim for PokerTH's engine/log.h (the SQLite hand log): the oracle passes no Log, so every call is
// behind `if(myLog)`; the methods only need to exist.
#ifndef LOG_H
#define LOG_H
#include <string>
#include <list>
#include "engine_defs.h"
#include "game_defs.h"
class ConfigFile;
class Log {
public:
	void logNewGameMsg(int, int, int, unsigned, PlayerList) {}
	void logNewHandMsg(int, unsigned, int, unsigned, int, unsigned, PlayerList) {}
	void logPlayerAction(std::string, PlayerActionLog, int = 0) {}
	PlayerActionLog transformPlayerActionLog(PlayerAction) { return LOG_ACTION_NONE; }
	void logBoardCards(int[5]) {}
	void logHoleCardsHandName(PlayerList) {}
	void logHandWinner(PlayerList, int, std::list<unsigned>) {}
	void logGameWinner(PlayerList) {}
	void logPlayerSitsOut(PlayerList) {}
	void logAfterHand() {}
	void setCurrentRound(GameState) {}
};
#endif
