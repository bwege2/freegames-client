// Test oracle for the PokerTH port: PokerTH 1.1.2's own engine (Game, LocalHand, LocalBoard, LocalBeRo*,
// LocalPlayer with its computer opponents, CardsValue), compiled from the original sources, driven the way
// the Qt game table drives it (gametableimpl.cpp: every animation timer becomes a queued task, in the same
// order), with a deterministic random stream (tools.cpp). It prints a transcript; the port's tests
// (web/games/pokerth/test/) run the port with the same seed and compare.
//
//   pokerth-oracle game SEED PLAYERS STARTCASH SMALLBLIND EVERYHANDS MAXHANDS [MANUALBLINDS...]
//   pokerth-oracle rank SEED COUNT
//
// The human player (seat 0) is scripted from the same random stream (humanAction below; the port's test
// has the same script): it uses the game table's own action code (myCall, myCheck, myFold, mySet, myAllIn
// and the button logic of provideMyActions), so the human paths of the engine are covered too.
#include <game.h>
#include <localenginefactory.h>
#include <cardsvalue.h>
#include <tools.h>
#include <handinterface.h>
#include <boardinterface.h>
#include <playerinterface.h>
#include <berointerface.h>
#include <guiinterface.h>
#include <configfile.h>
#include <gamedata.h>
#include <playerdata.h>
#include <deque>
#include <functional>
#include <iostream>
#include <sstream>
#include <cstdlib>
#include <cstdint>

void oracle_seed(uint32_t seed);
int oracle_rand(int minValue, int maxValue);

using namespace std;

static deque<function<void()> > tasks;
static boost::shared_ptr<Game> game;
static bool gameOver = false;
static int handsPlayed = 0;
static int maxHands = 0;

static const char *actionName(int a)
{
	static const char *n[] = {"none", "fold", "check", "call", "bet", "raise", "allin"};
	return (a >= 0 && a <= 6) ? n[a] : "?";
}

class OracleGui : public GuiInterface
{
public:
	void refreshSet() const {}
	void refreshCash() const {}
	void refreshAction(int, int) const {}
	void refreshChangePlayer() const {}
	void refreshPot() const {}
	void refreshGroupbox(int, int) const {}
	void refreshAll() const {}
	void refreshPlayerName() const {}
	void refreshButton() const {}
	void refreshGameLabels(GameState) const {}
	// dealFlopCards0..6 / dealTurnCards0..2 / dealRiverCards0..2 end in handSwitchRounds()
	void dealBeRoCards(int) { tasks.push_back([] { game->getCurrentHand()->switchRounds(); }); }
	void dealHoleCards() {}
	// nextPlayerAnimationTimer -> handSwitchRounds()
	void nextPlayerAnimation() { tasks.push_back([] { game->getCurrentHand()->switchRounds(); }); }
	void beRoAnimation2(int) { tasks.push_back([] { game->getCurrentHand()->getCurrentBeRo()->nextPlayer(); }); }
	void preflopAnimation1() { run(); }
	void preflopAnimation2() {}
	void flopAnimation1() { run(); }
	void flopAnimation2() {}
	void turnAnimation1() { run(); }
	void turnAnimation2() {}
	void riverAnimation1() { run(); }
	void riverAnimation2() {}
	void postRiverAnimation1() { tasks.push_back([] { game->getCurrentHand()->getCurrentBeRo()->postRiverRun(); }); }
	void postRiverRunAnimation1() { tasks.push_back([] { endOfHand(); }); }
	void flipHolecardsAllIn();
	void nextRoundCleanGui() {}
	void meInAction() { tasks.push_back([] { humanAction(); }); }
	void logPlayerActionMsg(string name, int action, int setValue)
	{
		cout << "act " << name << " " << actionName(action) << " " << setValue << "\n";
	}
	void logNewGameHandMsg(int, int handId) { cout << "hand " << handId << "\n"; }
	void logNewBlindsSetsMsg(int sbSet, int bbSet, string sbName, string bbName)
	{
		cout << "blinds " << sbSet << " " << bbSet << " " << sbName << " / " << bbName << "\n";
	}
	void logDealBoardCardsMsg(int roundID, int c1, int c2, int c3, int c4, int c5)
	{
		cout << "deal " << roundID << " " << c1 << " " << c2 << " " << c3 << " " << c4 << " " << c5 << "\n";
	}
	void logFlipHoleCardsMsg(string name, int c1, int c2, int value, string showHas)
	{
		cout << "flip " << name << " " << c1 << " " << c2 << " " << value << " " << showHas << "\n";
		// guiLog::logFlipHoleCardsMsg writes the hand's name
		if (value != -1)
			cout << "handname " << name << " " << CardsValue::determineHandName(value, game->getCurrentHand()->getActivePlayerList()) << "\n";
	}
	void flushLogAtGame(int) {}
	void flushLogAtHand() {}

	static void run() { tasks.push_back([] { game->getCurrentHand()->getCurrentBeRo()->run(); }); }
	static void humanAction();
	static void endOfHand();
	bool flipDone = false;
};

static OracleGui *gui;
static void printHand();

// gameTableImpl::showHoleCards: only the log line (setMyCardsFlip) matters to the engine.
static void showHoleCards(boost::shared_ptr<HandInterface> hand, unsigned playerId, bool allIn)
{
	PlayerList apl = hand->getActivePlayerList();
	for (PlayerListConstIterator it = apl->begin(); it != apl->end(); ++it) {
		if ((*it)->getMyUniqueID() == playerId) {
			if (hand->getCurrentRound() < GAME_STATE_RIVER || allIn) (*it)->setMyCardsFlip(1, 2);
			else (*it)->setMyCardsFlip(1, 1);
		}
	}
}

// gameTableImpl::flipHolecardsAllIn
void OracleGui::flipHolecardsAllIn()
{
	boost::shared_ptr<HandInterface> hand = game->getCurrentHand();
	if (!flipDone && hand->getCurrentRound() < GAME_STATE_RIVER) {
		int nonfold = 0;
		PlayerList apl = hand->getActivePlayerList();
		for (PlayerListConstIterator it = apl->begin(); it != apl->end(); ++it)
			if ((*it)->getMyAction() != PLAYER_ACTION_FOLD) nonfold++;
		if (nonfold != 1)
			for (PlayerListConstIterator it = apl->begin(); it != apl->end(); ++it)
				if ((*it)->getMyAction() != PLAYER_ACTION_FOLD) showHoleCards(hand, (*it)->getMyUniqueID(), false);
		flipDone = true;
	}
}

// ---- the human player's actions: gameTableImpl::myFold/myCheck/myCall/mySet/myAllIn/myActionDone
static boost::shared_ptr<PlayerInterface> human() { return game->getCurrentHand()->getSeatsList()->front(); }

static void myActionDone()
{
	// sendClientPlayerAction() does nothing in a local game; disableMyButtons(); nextPlayerAnimation()
	gui->nextPlayerAnimation();
}
static void myFold()
{
	boost::shared_ptr<HandInterface> hand = game->getCurrentHand();
	human()->setMyAction(PLAYER_ACTION_FOLD, true);
	human()->setMyTurn(0);
	hand->setPreviousPlayerID(0);
	myActionDone();
}
static void myCheck()
{
	boost::shared_ptr<HandInterface> hand = game->getCurrentHand();
	human()->setMyTurn(0);
	human()->setMyAction(PLAYER_ACTION_CHECK, true);
	hand->setPreviousPlayerID(0);
	myActionDone();
}
static void myCall()
{
	boost::shared_ptr<HandInterface> hand = game->getCurrentHand();
	boost::shared_ptr<PlayerInterface> h = human();
	int hs = hand->getCurrentBeRo()->getHighestSet();
	if (h->getMyCash() + h->getMySet() <= hs) {
		h->setMySet(h->getMyCash());
		h->setMyCash(0);
		h->setMyAction(PLAYER_ACTION_ALLIN, true);
	} else {
		h->setMySet(hs - h->getMySet());
		h->setMyAction(PLAYER_ACTION_CALL, true);
	}
	h->setMyTurn(0);
	hand->getBoard()->collectSets();
	hand->setPreviousPlayerID(0);
	myActionDone();
}
static void mySet(int value, bool isRaise, bool isBet)
{
	boost::shared_ptr<HandInterface> hand = game->getCurrentHand();
	boost::shared_ptr<PlayerInterface> h = human();
	int tempCash = h->getMyCash();
	h->setMySet(value);
	if (value >= tempCash) {
		h->setMySet(h->getMyCash());
		h->setMyCash(0);
		h->setMyAction(PLAYER_ACTION_ALLIN, true);
		if (hand->getCurrentBeRo()->getHighestSet() + hand->getCurrentBeRo()->getMinimumRaise() > h->getMySet())
			hand->getCurrentBeRo()->setFullBetRule(true);
	}
	if (isRaise) {
		if (h->getMyAction() != 6) h->setMyAction(PLAYER_ACTION_RAISE, true);
		hand->getCurrentBeRo()->setMinimumRaise(h->getMySet() - hand->getCurrentBeRo()->getHighestSet());
	}
	if (isBet) {
		if (h->getMyAction() != 6) h->setMyAction(PLAYER_ACTION_BET, true);
		hand->getCurrentBeRo()->setMinimumRaise(h->getMySet());
	}
	hand->getCurrentBeRo()->setHighestSet(h->getMySet());
	h->setMyTurn(0);
	hand->getBoard()->collectSets();
	hand->setPreviousPlayerID(0);
	hand->setLastActionPlayerID(h->getMyUniqueID());
	myActionDone();
}
static void myAllIn()
{
	boost::shared_ptr<HandInterface> hand = game->getCurrentHand();
	boost::shared_ptr<PlayerInterface> h = human();
	h->setMySet(h->getMyCash());
	h->setMyCash(0);
	h->setMyAction(PLAYER_ACTION_ALLIN, true);
	if (hand->getCurrentBeRo()->getHighestSet() + hand->getCurrentBeRo()->getMinimumRaise() > h->getMySet())
		hand->getCurrentBeRo()->setFullBetRule(true);
	if (h->getMySet() > hand->getCurrentBeRo()->getHighestSet()) {
		hand->getCurrentBeRo()->setMinimumRaise(h->getMySet() - hand->getCurrentBeRo()->getHighestSet());
		hand->getCurrentBeRo()->setHighestSet(h->getMySet());
		hand->setLastActionPlayerID(h->getMyUniqueID());
	}
	h->setMyTurn(0);
	hand->getBoard()->collectSets();
	hand->setPreviousPlayerID(0);
	myActionDone();
}

// The script: which buttons provideMyActions() offers, then one of them by the random stream.
void OracleGui::humanAction()
{
	boost::shared_ptr<HandInterface> hand = game->getCurrentHand();
	boost::shared_ptr<PlayerInterface> h = human();
	boost::shared_ptr<BeRoInterface> bero = hand->getCurrentBeRo();
	int hs = bero->getHighestSet();
	bool full = bero->getFullBetRule();
	// 0 none, 1 check, 2 call
	int callCheck = 0;
	// 0 none, 1 bet, 2 raise
	int betRaise = 0;
	if (hand->getCurrentRound() == 0) {
		if (h->getMyCash() + h->getMySet() > hs && !full) betRaise = 2;
		callCheck = (h->getMySet() == hs && h->getMyButton() == 3) ? 1 : 2;
	} else {
		if (hs == 0) { callCheck = 1; betRaise = 1; }
		if (hs > 0 && hs > h->getMySet()) {
			callCheck = 2;
			if (h->getMyCash() + h->getMySet() > hs && !full) betRaise = 2;
		}
	}
	bool allIn = !full;
	int r = oracle_rand(1, 100);
	if (r <= 10) { myFold(); return; }
	if (r > 70 && r <= 92 && betRaise) {
		// getMyBetAmount(): below the minimum the button shows min(minimum, cash)
		int minimum = hs - h->getMySet() + bero->getMinimumRaise();
		if (betRaise == 1 && minimum < 2 * hand->getSmallBlind()) minimum = 2 * hand->getSmallBlind();
		int value = minimum >= h->getMyCash() ? h->getMyCash() : oracle_rand(minimum, h->getMyCash());
		mySet(value, betRaise == 2, betRaise == 1);
		return;
	}
	if (r > 92 && allIn) { myAllIn(); return; }
	if (callCheck == 2) { myCall(); return; }
	if (callCheck == 1) { myCheck(); return; }
	myFold();
}

// postRiverRunAnimation2..6 and startNewHand
void OracleGui::endOfHand()
{
	boost::shared_ptr<HandInterface> hand = game->getCurrentHand();
	PlayerList apl = hand->getActivePlayerList();
	int nonfold = 0;
	for (PlayerListConstIterator it = apl->begin(); it != apl->end(); ++it)
		if ((*it)->getMyAction() != PLAYER_ACTION_FOLD) nonfold++;
	if (nonfold != 1) {
		if (!gui->flipDone) {
			for (PlayerListConstIterator it = apl->begin(); it != apl->end(); ++it)
				if ((*it)->getMyAction() != PLAYER_ACTION_FOLD && (*it)->checkIfINeedToShowCards())
					showHoleCards(hand, (*it)->getMyUniqueID(), false);
			gui->flipDone = true;
		} else {
			for (PlayerListConstIterator it = apl->begin(); it != apl->end(); ++it)
				if ((*it)->getMyAction() != PLAYER_ACTION_FOLD) (*it)->setMyCardsFlip(1, 3);
		}
	}
	cout << "highest " << hand->getCurrentBeRo()->getHighestCardsValue() << "\n";
	list<unsigned> show = hand->getBoard()->getPlayerNeedToShowCards();
	cout << "show";
	for (list<unsigned>::iterator i = show.begin(); i != show.end(); ++i) cout << " " << *i;
	cout << "\nwinners";
	list<unsigned> winners = hand->getBoard()->getWinners();
	for (list<unsigned>::iterator i = winners.begin(); i != winners.end(); ++i) cout << " " << *i;
	cout << "\ncash";
	PlayerList seats = hand->getSeatsList();
	for (PlayerListConstIterator it = seats->begin(); it != seats->end(); ++it)
		cout << " " << (*it)->getMyCash() << "/" << (*it)->getLastMoneyWon();
	cout << "\n";
	handsPlayed++;
	int positive = 0;
	for (PlayerListConstIterator it = apl->begin(); it != apl->end(); ++it)
		if ((*it)->getMyCash() > 0) positive++;
	if (positive == 1) {
		for (PlayerListConstIterator it = apl->begin(); it != apl->end(); ++it)
			if ((*it)->getMyCash() > 0) cout << "gamewinner " << (*it)->getMyName() << "\n";
		gameOver = true;
		return;
	}
	if (handsPlayed >= maxHands) { gameOver = true; return; }
	// startNewHand()
	gui->flipDone = false;
	game->initHand();
	printHand();
	game->startHand();
}

static void printHand()
{
	boost::shared_ptr<HandInterface> hand = game->getCurrentHand();
	int b[5];
	hand->getBoard()->getMyCards(b);
	cout << "board " << b[0] << " " << b[1] << " " << b[2] << " " << b[3] << " " << b[4] << " sb " << hand->getSmallBlind()
	     << " dealer " << hand->getDealerPosition() << "\n";
	PlayerList seats = hand->getSeatsList();
	for (PlayerListConstIterator it = seats->begin(); it != seats->end(); ++it) {
		if (!(*it)->getMyActiveStatus()) continue;
		int c[2], pos[5];
		(*it)->getMyCards(c);
		(*it)->getMyBestHandPosition(pos);
		cout << "seat " << (*it)->getMyID() << " " << (*it)->getMyName() << " button " << (*it)->getMyButton() << " cash " << (*it)->getMyCash()
		     << " set " << (*it)->getMySet() << " cards " << c[0] << " " << c[1] << " value " << (*it)->getMyCardsValueInt()
		     << " best " << pos[0] << pos[1] << pos[2] << pos[3] << pos[4] << " dude " << (*it)->getMyDude() << "/" << (*it)->getMyDude4()
		     << " bluff " << (*it)->getSBluff() << "\n";
	}
}

static int runGame(int argc, char **argv)
{
	if (argc < 8) { cerr << "usage: game SEED PLAYERS STARTCASH SMALLBLIND EVERYHANDS MAXHANDS [MANUALBLINDS...]\n"; return 2; }
	oracle_seed((uint32_t)strtoul(argv[2], 0, 10));
	int players = atoi(argv[3]);
	GameData gd;
	gd.maxNumberOfPlayers = players;
	gd.startMoney = atoi(argv[4]);
	gd.firstSmallBlind = atoi(argv[5]);
	gd.raiseIntervalMode = RAISE_ON_HANDNUMBER;
	gd.raiseSmallBlindEveryHandsValue = atoi(argv[6]);
	maxHands = atoi(argv[7]);
	if (argc > 8) {
		gd.raiseMode = MANUAL_BLINDS_ORDER;
		for (int i = 8; i < argc; i++) gd.manualBlindsList.push_back(atoi(argv[i]));
		gd.afterManualBlindsMode = AFTERMB_DOUBLE_BLINDS;
	} else {
		gd.raiseMode = DOUBLE_BLINDS;
	}
	// startWindowImpl::startNewLocalGame: the dealer is random
	StartData sd;
	sd.numberOfPlayers = players;
	int dealer = 0;
	Tools::GetRand(0, players - 1, 1, &dealer);
	sd.startDealerPlayerId = (unsigned)dealer;
	// Session::startLocalGame: seat 0 is the human player, the others the computer
	PlayerDataList pdl;
	for (int i = 0; i < players; i++) {
		boost::shared_ptr<PlayerData> pd(new PlayerData(i, i, i == 0 ? PLAYER_TYPE_HUMAN : PLAYER_TYPE_COMPUTER, PLAYER_RIGHTS_NORMAL, i == 0));
		ostringstream n;
		if (i == 0) n << "Human_Player";
		else n << "Player_" << i;
		pd->SetName(n.str());
		pdl.push_back(pd);
	}
	static ConfigFile config;
	gui = new OracleGui;
	boost::shared_ptr<EngineFactory> factory(new LocalEngineFactory(&config));
	game.reset(new Game(gui, factory, pdl, gd, sd, 1, 0));
	cout << "game players " << players << " cash " << gd.startMoney << " sb " << gd.firstSmallBlind << " dealer " << dealer << "\n";
	PlayerList seats = game->getSeatsList();
	for (PlayerListConstIterator it = seats->begin(); it != seats->end(); ++it)
		cout << "player " << (*it)->getMyID() << " dude " << (*it)->getMyDude() << "/" << (*it)->getMyDude4() << "\n";
	game->initHand();
	printHand();
	game->startHand();
	long steps = 0;
	while (!tasks.empty() && !gameOver) {
		function<void()> t = tasks.front();
		tasks.pop_front();
		t();
		if (++steps > 10000000) { cerr << "too many steps\n"; return 1; }
	}
	cout << "end " << handsPlayed << "\n";
	return 0;
}

// rank SEED COUNT: CardsValue::cardsValue of random 7-card hands (2 hole cards + 5 board cards)
static int runRank(int argc, char **argv)
{
	if (argc < 4) return 2;
	oracle_seed((uint32_t)strtoul(argv[2], 0, 10));
	int count = atoi(argv[3]);
	for (int n = 0; n < count; n++) {
		int deck[52];
		for (int i = 0; i < 52; i++) deck[i] = i;
		Tools::ShuffleArrayNonDeterministic(deck, 52);
		int cards[7], pos[5] = {-1, -1, -1, -1, -1};
		for (int i = 0; i < 7; i++) cards[i] = deck[i];
		int v = CardsValue::cardsValue(cards, pos);
		cout << cards[0] << " " << cards[1] << " " << cards[2] << " " << cards[3] << " " << cards[4] << " " << cards[5] << " " << cards[6]
		     << " " << v << " " << pos[0] << pos[1] << pos[2] << pos[3] << pos[4] << "\n";
	}
	return 0;
}

int main(int argc, char **argv)
{
	if (argc > 1 && string(argv[1]) == "game") return runGame(argc, argv);
	if (argc > 1 && string(argv[1]) == "rank") return runRank(argc, argv);
	cerr << "usage: pokerth-oracle game|rank ...\n";
	return 2;
}
