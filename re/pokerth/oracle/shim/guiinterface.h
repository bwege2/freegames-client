// Oracle shim for PokerTH's gui/guiinterface.h: the engine's half of the interface (the same virtual methods,
// without the network, server and IRC callbacks the real interface also inherits).
#ifndef GUIINTERFACE_H
#define GUIINTERFACE_H
#include <game_defs.h>
#include <string>
#include <boost/shared_ptr.hpp>

class GuiInterface
{
public:
	virtual ~GuiInterface() {}
	virtual void refreshSet() const=0;
	virtual void refreshCash() const=0;
	virtual void refreshAction(int =-1, int =-1) const=0;
	virtual void refreshChangePlayer() const=0;
	virtual void refreshPot() const=0;
	virtual void refreshGroupbox(int =-1, int =-1) const=0;
	virtual void refreshAll() const=0;
	virtual void refreshPlayerName() const=0;
	virtual void refreshButton() const =0;
	virtual void refreshGameLabels(GameState state) const=0;
	virtual void dealBeRoCards(int) =0;
	virtual void dealHoleCards()=0;
	virtual void nextPlayerAnimation()=0;
	virtual void beRoAnimation2(int)=0;
	virtual void preflopAnimation1()=0;
	virtual void preflopAnimation2()=0;
	virtual void flopAnimation1()=0;
	virtual void flopAnimation2()=0;
	virtual void turnAnimation1()=0;
	virtual void turnAnimation2()=0;
	virtual void riverAnimation1()=0;
	virtual void riverAnimation2()=0;
	virtual void postRiverAnimation1()=0;
	virtual void postRiverRunAnimation1()=0;
	virtual void flipHolecardsAllIn()=0;
	virtual void nextRoundCleanGui()=0;
	virtual void meInAction()=0;
	virtual void logPlayerActionMsg(std::string playName, int action, int setValue) =0;
	virtual void logNewGameHandMsg(int gameID, int HandID) =0;
	virtual void logNewBlindsSetsMsg(int sbSet, int bbSet, std::string sbName, std::string bbName) =0;
	virtual void logDealBoardCardsMsg(int roundID, int card1, int card2, int card3, int card4 = -1, int card5 = -1) = 0;
	virtual void logFlipHoleCardsMsg(std::string playerName, int card1, int card2, int cardsValueInt = -1, std::string showHas = "shows") = 0;
	virtual void flushLogAtGame(int gameID) =0;
	virtual void flushLogAtHand() =0;
};
#endif
