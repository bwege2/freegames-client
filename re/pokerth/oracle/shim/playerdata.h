// Oracle shim for PokerTH's playerdata.h: the part Game's constructor reads (no crypto, no database).
#ifndef PLAYERDATA_H
#define PLAYERDATA_H
#include <boost/shared_ptr.hpp>
#include <string>
#include <list>
#include <third_party/boost/timers.hpp>
enum PlayerType { PLAYER_TYPE_COMPUTER, PLAYER_TYPE_HUMAN };
enum PlayerRights { PLAYER_RIGHTS_GUEST = 1, PLAYER_RIGHTS_NORMAL, PLAYER_RIGHTS_ADMIN };
class PlayerData {
public:
	PlayerData(unsigned uniqueId, int number, PlayerType type, PlayerRights, bool) : m_uniqueId(uniqueId), m_number(number), m_type(type) {}
	std::string GetName() const { return m_name; }
	void SetName(const std::string &n) { m_name = n; }
	std::string GetAvatarFile() const { return ""; }
	PlayerType GetType() const { return m_type; }
	unsigned GetUniqueId() const { return m_uniqueId; }
	std::string GetGuid() const { return ""; }
	int GetStartCash() const { return -1; }
private:
	unsigned m_uniqueId; int m_number; PlayerType m_type; std::string m_name;
};
typedef std::list<boost::shared_ptr<PlayerData> > PlayerDataList;
#endif
