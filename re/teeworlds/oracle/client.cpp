// The server oracle's scripted clients and scenarios. Each client speaks the original protocol through the
// original engine classes (CNetClient: tokens, connection, chunks, resends; CMsgPacker/CUnpacker;
// CSnapshotDelta and CSnapshotStorage for the snapshots; the generated CNetObjHandler and CNetMsg_*),
// following src/engine/client/client.cpp (connect, NETMSG_INFO, the map download, READY, ENTERGAME,
// snapshot reassembly, delta, crc, ack, NETMSG_INPUT as SendInput packs it) and
// src/game/client/gameclient.cpp (Cl_StartInfo on CON_READY, EnterGame on Sv_ReadyToEnter, the game
// messages). What a client does is the scenario's: scripted commands at given iterations, and a bot that
// plays (random, hunting the nearest enemy, or capturing the flag) with the map it downloaded (the
// original CMap, CLayers, CCollision).
//
// Scenario file (scenarios/*.scn), one command per line, # comments:
//   duration <iterations>                      how many server loop iterations to run
//   server <console line>                      one argument of the server's command line
//   client <k> [name=..] [clan=..] [country=..] [seed=..] [mode=idle|random|hunt|flag|armor] [body=..] [marking=..]
//              [decoration=..] [hands=..] [feet=..] [eyes=..] [color=<6 hex colours, comma separated>]
//   at <iteration> <k> <command> [args]        connect | disconnect [reason] | silent | say all|team <text>
//              | emote <n> | team <-1|0|1> | spec <mode> <id> | kill | ready | vote <1|-1> | callvote <type> <value> [reason]
//              | mode <m> | skin <body> <marking> | weapon <1..6> | hold <iterations> (no input changes)
#include "oracle.h"

#include <base/math.h>
#include <base/vmath.h>
#include <engine/map.h>
#include <engine/message.h>
#include <engine/storage.h>
#include <engine/shared/compression.h>
#include <engine/shared/config.h>
#include <engine/shared/network.h>
#include <engine/shared/packer.h>
#include <engine/shared/protocol.h>
#include <engine/shared/snapshot.h>
#include <game/collision.h>
#include <game/layers.h>
#include <game/version.h>
#include <generated/protocol.h>

#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <map>
#include <set>
#include <sstream>
#include <string>
#include <vector>

void MsgDump(std::string &o, int Type, const void *pRaw);
namespace oracle { extern IStorage *g_pStorage; }

using namespace oracle;

namespace {

enum { MODE_IDLE, MODE_RANDOM, MODE_HUNT, MODE_FLAG, MODE_ARMOR };
enum { ST_OFFLINE, ST_CONNECTING, ST_LOADING, ST_ONLINE };
const int MAP_CHUNK_SIZE = NET_MAX_PAYLOAD - NET_MAX_CHUNKHEADERSIZE - 4;

struct CCommand
{
	int m_At;
	int m_Client;
	std::vector<std::string> m_Args;
	std::string m_Rest; // the text after the command word
};

int s_Duration = 1000;
std::vector<CCommand> s_aCommands;
FILE *s_pSnaps = 0;
std::map<std::string, std::string> s_Events; // key -> text (dedup across clients)
std::vector<std::string> s_EventOrder;
CConfig *s_pConfig = 0;
CNetObjHandler s_NetObjHandler;

int ModeOf(const std::string &s)
{
	if(s == "random") return MODE_RANDOM;
	if(s == "hunt") return MODE_HUNT;
	if(s == "flag") return MODE_FLAG;
	if(s == "armor") return MODE_ARMOR;
	return MODE_IDLE;
}

class CBot
{
public:
	int m_K;
	std::string m_Name, m_Clan;
	int m_Country;
	std::string m_aParts[6];
	int m_aUseCustom[6];
	int m_aColors[6];
	unsigned m_Seed;
	int m_Mode;
	bool m_Defend;
	vec2 m_Roam;
	int m_RoamTicks;

	CNetClient *m_pNet;
	int m_Conns;
	int m_State;
	bool m_Silent;
	int m_Iter;

	// map download
	std::string m_MapName;
	int m_MapCrc, m_MapSize, m_ChunkNum, m_ChunkSize, m_Chunk, m_Amount;
	bool m_Downloading;
	std::vector<unsigned char> m_MapData;
	IEngineMap *m_pMap;
	CLayers m_Layers;
	CCollision m_Collision;
	bool m_HasCollision;

	// snapshots (client.cpp)
	CSnapshotStorage m_Storage;
	CSnapshotDelta *m_pDelta;
	unsigned char m_aIncoming[CSnapshot::MAX_SIZE];
	int m_CurrentRecvTick, m_SnapParts, m_AckGameTick, m_ReceivedSnapshots, m_SnapCrcErrors;
	std::vector<unsigned char> m_Latest; // the latest decoded snapshot
	int m_LatestTick;
	int m_LastStateFlags;
	int m_ItersSinceSnap;
	bool m_Entered;

	// game
	int m_LocalID;
	int m_aTeam[MAX_CLIENTS];
	bool m_aActive[MAX_CLIENTS];
	CNetObj_PlayerInput m_Input, m_LastInput;
	int64 m_LastSendTime;
	int m_Hold;
	int m_WantedWeapon;
	int m_HookTicks, m_StuckTicks, m_WanderTicks, m_WanderDir;
	vec2 m_LastPos;
	vec2 m_aFlagStand[2];
	bool m_aFlagStandKnown[2];

	CBot(int K) : m_K(K)
	{
		m_Name = "bot" + std::to_string(K);
		m_Country = -1;
		const char *apDef[6] = {"standard", "", "", "standard", "standard", "standard"};
		const int aCol[6] = {0x1B6F74, (int)0xFF0000FF, 0x1B6F74, 0x1B759E, 0x1C873E, 0x0000FF};
		for(int p = 0; p < 6; p++) { m_aParts[p] = apDef[p]; m_aUseCustom[p] = 1; m_aColors[p] = aCol[p]; }
		m_Seed = 1 + K;
		m_Mode = MODE_IDLE;
		m_Defend = false;
		m_pNet = 0;
		m_Conns = 0;
		m_State = ST_OFFLINE;
		m_Silent = false;
		m_pDelta = new CSnapshotDelta();
		for(int i = 0; i < NUM_NETOBJTYPES; i++)
			m_pDelta->SetStaticsize(i, s_NetObjHandler.GetObjSize(i));
		m_pMap = CreateEngineMap();
		m_HasCollision = false;
		m_Storage.Init();
		ResetGame();
	}

	void ResetGame()
	{
		m_Downloading = false;
		m_CurrentRecvTick = 0;
		m_SnapParts = 0;
		m_AckGameTick = -1;
		m_ReceivedSnapshots = 0;
		m_SnapCrcErrors = 0;
		m_Latest.clear();
		m_LatestTick = -1;
		m_LastStateFlags = -1;
		m_ItersSinceSnap = 0;
		m_Entered = false;
		m_LocalID = -1;
		for(int i = 0; i < MAX_CLIENTS; i++) { m_aTeam[i] = 0; m_aActive[i] = false; }
		mem_zero(&m_Input, sizeof(m_Input));
		mem_zero(&m_LastInput, sizeof(m_LastInput));
		m_LastSendTime = 0;
		m_Hold = 0;
		m_WantedWeapon = 0;
		m_HookTicks = m_StuckTicks = m_WanderTicks = 0;
		m_WanderDir = 1;
		m_LastPos = vec2(0, 0);
		m_Path.clear();
		m_PathAge = 0;
		m_Roam = vec2(0, 0);
		m_RoamTicks = 0;
		m_aFlagStandKnown[0] = m_aFlagStandKnown[1] = false;
	}

	unsigned Rnd()
	{
		m_Seed ^= m_Seed << 13; m_Seed ^= m_Seed >> 17; m_Seed ^= m_Seed << 5;
		return m_Seed;
	}
	int Rnd(int n) { return (int)(Rnd() % (unsigned)n); }

	void Log(const char *pFmt, const char *pA = "")
	{
		char b[512];
		snprintf(b, sizeof(b), pFmt, pA);
		printf("[oracle] it=%d c%d: %s\n", m_Iter, m_K, b);
	}

	// ---------------------------------------------------------------- sending (CClient::SendMsg)
	void SendMsg(CMsgPacker *pMsg, int Flags)
	{
		if(!m_pNet || m_State == ST_OFFLINE)
			return;
		CNetChunk Packet;
		mem_zero(&Packet, sizeof(CNetChunk));
		Packet.m_ClientID = 0;
		Packet.m_pData = pMsg->Data();
		Packet.m_DataSize = pMsg->Size();
		if(Flags&MSGFLAG_VITAL)
			Packet.m_Flags |= NETSENDFLAG_VITAL;
		if(Flags&MSGFLAG_FLUSH)
			Packet.m_Flags |= NETSENDFLAG_FLUSH;
		m_pNet->Send(&Packet);
	}

	template<class T> void SendPackMsg(T *pMsg, int Flags)
	{
		CMsgPacker Packer(pMsg->MsgID(), false);
		if(pMsg->Pack(&Packer))
			return;
		SendMsg(&Packer, Flags);
	}

	void SendInfo()
	{
		CMsgPacker Msg(NETMSG_INFO, true);
		Msg.AddString(GAME_NETVERSION, 128);
		Msg.AddString("", 128);
		Msg.AddInt(CLIENT_VERSION);
		SendMsg(&Msg, MSGFLAG_VITAL|MSGFLAG_FLUSH);
	}

	void SendStartInfo()
	{
		CNetMsg_Cl_StartInfo Msg;
		Msg.m_pName = m_Name.c_str();
		Msg.m_pClan = m_Clan.c_str();
		Msg.m_Country = m_Country;
		for(int p = 0; p < NUM_SKINPARTS; p++)
		{
			Msg.m_apSkinPartNames[p] = m_aParts[p].c_str();
			Msg.m_aUseCustomColors[p] = m_aUseCustom[p];
			Msg.m_aSkinPartColors[p] = m_aColors[p];
		}
		SendPackMsg(&Msg, MSGFLAG_VITAL|MSGFLAG_FLUSH);
	}

	void Connect()
	{
		if(m_pNet)
		{
			m_pNet->Close();
			delete m_pNet;
		}
		ResetGame();
		m_Silent = false;
		m_pNet = new CNetClient();
		MakeAddr(&g_NextBind, 10, 0, 0, m_K + 1, 40000 + m_Conns++);
		g_NextBindSet = true;
		NETADDR Bind;
		mem_zero(&Bind, sizeof(Bind));
		Bind.type = NETTYPE_ALL;
		m_pNet->Open(Bind, s_pConfig, 0, 0, NETCREATE_FLAG_RANDOMPORT);
		NETADDR Server;
		MakeAddr(&Server, 10, 0, 0, 254, 8303);
		m_pNet->Connect(&Server);
		m_State = ST_CONNECTING;
		Log("connect");
	}

	void Disconnect(const char *pReason)
	{
		if(!m_pNet)
			return;
		m_pNet->Disconnect(pReason);
		m_pNet->Close();
		delete m_pNet;
		m_pNet = 0;
		m_State = ST_OFFLINE;
		Log("disconnect '%s'", pReason ? pReason : "");
	}

	// ---------------------------------------------------------------- receiving (CClient::ProcessServerPacket)
	void Record(const std::string &Body)
	{
		char b[64];
		snprintf(b, sizeof(b), "{\"c\":%d,\"it\":%d,", m_K, m_Iter);
		WriteSnapsLine(b + Body + "}");
	}

	void LoadDownloadedMap()
	{
		char aFile[128];
		snprintf(aFile, sizeof(aFile), "dl_%d_%s.map", m_K, m_MapName.c_str());
		FILE *f = fopen(aFile, "wb");
		fwrite(m_MapData.data(), 1, m_MapData.size(), f);
		fclose(f);
		m_pMap->Unload();
		m_HasCollision = false;
		if(m_pMap->Load(aFile, g_pStorage) && (int)m_pMap->Crc() == m_MapCrc)
		{
			m_Layers.Init(0, m_pMap);
			m_Collision.Init(&m_Layers);
			m_HasCollision = true;
		}
		else
			Log("map %s did not load", m_MapName.c_str());
	}

	void ProcessPacket(CNetChunk *pPacket)
	{
		CUnpacker Unpacker;
		Unpacker.Reset(pPacket->m_pData, pPacket->m_DataSize);
		int Msg = Unpacker.GetInt();
		int Sys = Msg&1;
		Msg >>= 1;
		if(Unpacker.Error())
			return;
		bool Vital = (pPacket->m_Flags&NET_CHUNKFLAG_VITAL) != 0;
		if(Sys)
		{
			if(Vital && Msg == NETMSG_MAP_CHANGE)
			{
				const char *pMap = Unpacker.GetString(CUnpacker::SANITIZE_CC|CUnpacker::SKIP_START_WHITESPACES);
				int MapCrc = Unpacker.GetInt();
				int MapSize = Unpacker.GetInt();
				int MapChunkNum = Unpacker.GetInt();
				int MapChunkSize = Unpacker.GetInt();
				if(Unpacker.Error())
					return;
				const unsigned char *pSha = Unpacker.GetRaw(32);
				char b[256];
				snprintf(b, sizeof(b), "\"sys\":\"map_change\",\"map\":\"%s\",\"crc\":%d,\"size\":%d,\"chunks\":%d,\"chunksize\":%d,\"sha256\":\"%s\"",
					pMap, MapCrc, MapSize, MapChunkNum, MapChunkSize, pSha ? Hex(pSha, 32).c_str() : "");
				Record(b);
				if(m_Entered || m_State == ST_ONLINE)
					SummaryEvent(std::string("map_change ") + pMap + " " + std::to_string(m_Iter), std::string("map change to ") + pMap);
				else
					SummaryEvent(std::string("download ") + std::to_string(m_K) + pMap + " " + std::to_string(m_Iter),
						"client " + std::to_string(m_K) + " connects and downloads " + pMap);
				// the client has no maps: it downloads every one (the original's download path)
				ResetGame();
				m_State = ST_LOADING;
				m_MapName = pMap;
				m_MapCrc = MapCrc;
				m_MapSize = MapSize;
				m_ChunkNum = MapChunkNum;
				m_ChunkSize = MapChunkSize;
				m_Chunk = 0;
				m_Amount = 0;
				m_MapData.clear();
				m_Downloading = true;
				CMsgPacker Req(NETMSG_REQUEST_MAP_DATA, true);
				SendMsg(&Req, MSGFLAG_VITAL|MSGFLAG_FLUSH);
			}
			else if(Vital && Msg == NETMSG_MAP_DATA)
			{
				if(!m_Downloading)
					return;
				int Size = min(m_ChunkSize, m_MapSize - m_Amount);
				const unsigned char *pData = Unpacker.GetRaw(Size);
				if(Unpacker.Error())
					return;
				m_MapData.insert(m_MapData.end(), pData, pData + Size);
				++m_Chunk;
				m_Amount += Size;
				if(m_Amount == m_MapSize)
				{
					m_Downloading = false;
					LoadDownloadedMap();
					Record("\"sys\":\"map_done\",\"bytes\":" + std::to_string(m_Amount));
					m_ReceivedSnapshots = 0;
					CMsgPacker Ready(NETMSG_READY, true);
					SendMsg(&Ready, MSGFLAG_VITAL|MSGFLAG_FLUSH);
				}
				else if(m_Chunk % m_ChunkNum == 0)
				{
					CMsgPacker Req(NETMSG_REQUEST_MAP_DATA, true);
					SendMsg(&Req, MSGFLAG_VITAL|MSGFLAG_FLUSH);
				}
			}
			else if(Vital && Msg == NETMSG_SERVERINFO)
			{
				Record("\"sys\":\"serverinfo\",\"raw\":\"" + Hex(pPacket->m_pData, pPacket->m_DataSize) + "\"");
			}
			else if(Vital && Msg == NETMSG_CON_READY)
			{
				Record("\"sys\":\"con_ready\"");
				SendStartInfo();
			}
			else if(Msg == NETMSG_PING)
			{
				CMsgPacker Reply(NETMSG_PING_REPLY, true);
				SendMsg(&Reply, 0);
			}
			else if(Msg == NETMSG_INPUTTIMING)
			{
				int PredTick = Unpacker.GetInt();
				int TimeLeft = Unpacker.GetInt();
				char b[96];
				snprintf(b, sizeof(b), "\"sys\":\"inputtiming\",\"tick\":%d,\"left\":%d", PredTick, TimeLeft);
				Record(b);
			}
			else if(Msg == NETMSG_SNAP || Msg == NETMSG_SNAPSINGLE || Msg == NETMSG_SNAPEMPTY)
				ProcessSnap(Msg, &Unpacker);
			else
				Record("\"sys\":" + std::to_string(Msg) + ",\"raw\":\"" + Hex(pPacket->m_pData, pPacket->m_DataSize) + "\"");
		}
		else if(Vital)
			ProcessGameMessage(Msg, &Unpacker, pPacket);
	}

	void ProcessSnap(int Msg, CUnpacker *pUnpacker)
	{
		int NumParts = 1, Part = 0;
		int GameTick = pUnpacker->GetInt();
		int DeltaTick = GameTick - pUnpacker->GetInt();
		int PartSize = 0, Crc = 0;
		if(m_State < ST_LOADING)
			return;
		if(Msg == NETMSG_SNAP)
		{
			NumParts = pUnpacker->GetInt();
			Part = pUnpacker->GetInt();
		}
		if(Msg != NETMSG_SNAPEMPTY)
		{
			Crc = pUnpacker->GetInt();
			PartSize = pUnpacker->GetInt();
		}
		const char *pData = (const char *)pUnpacker->GetRaw(PartSize);
		if(pUnpacker->Error() || NumParts < 1 || NumParts > CSnapshot::MAX_PARTS || Part < 0 || Part >= NumParts || PartSize < 0 || PartSize > MAX_SNAPSHOT_PACKSIZE)
			return;
		if(GameTick < m_CurrentRecvTick)
			return;
		if(GameTick != m_CurrentRecvTick)
		{
			m_SnapParts = 0;
			m_CurrentRecvTick = GameTick;
		}
		mem_copy((char *)m_aIncoming + Part*MAX_SNAPSHOT_PACKSIZE, pData, PartSize);
		m_SnapParts |= 1<<Part;
		if(m_SnapParts != (unsigned)((1<<NumParts)-1))
			return;

		static CSnapshot Emptysnap;
		CSnapshot *pDeltaShot = &Emptysnap;
		static unsigned char aTmpBuffer2[CSnapshot::MAX_SIZE];
		static unsigned char aTmpBuffer3[CSnapshot::MAX_SIZE];
		CSnapshot *pTmpBuffer3 = (CSnapshot *)aTmpBuffer3;
		int CompleteSize = (NumParts-1) * MAX_SNAPSHOT_PACKSIZE + PartSize;
		m_SnapParts = 0;
		Emptysnap.Clear();
		if(DeltaTick >= 0)
		{
			int DeltashotSize = m_Storage.Get(DeltaTick, 0, &pDeltaShot, 0);
			if(DeltashotSize < 0)
			{
				m_AckGameTick = -1;
				Record("\"snaperr\":\"no delta\",\"tick\":" + std::to_string(GameTick));
				return;
			}
		}
		void *pDeltaData = m_pDelta->EmptyDelta();
		int DeltaSize = sizeof(int)*3;
		if(CompleteSize)
		{
			int IntSize = CVariableInt::Decompress(m_aIncoming, CompleteSize, aTmpBuffer2, sizeof(aTmpBuffer2));
			if(IntSize < 0)
				return;
			pDeltaData = aTmpBuffer2;
			DeltaSize = IntSize;
		}
		int SnapSize = m_pDelta->UnpackDelta(pDeltaShot, pTmpBuffer3, pDeltaData, DeltaSize);
		if(SnapSize < 0)
			return;
		if(Msg != NETMSG_SNAPEMPTY && pTmpBuffer3->Crc() != Crc)
		{
			Record("\"snaperr\":\"crc\",\"tick\":" + std::to_string(GameTick));
			m_SnapCrcErrors++;
			if(m_SnapCrcErrors > 10)
			{
				m_AckGameTick = -1;
				m_SnapCrcErrors = 0;
			}
			return;
		}
		else if(m_SnapCrcErrors)
			m_SnapCrcErrors--;

		// purge old snapshots (client.cpp keeps the previous and current ones; this client keeps the latest)
		int PurgeTick = DeltaTick;
		if(m_LatestTick >= 0 && m_LatestTick < PurgeTick)
			PurgeTick = m_LatestTick;
		m_Storage.PurgeUntil(PurgeTick);
		m_Storage.Add(GameTick, time_get(), SnapSize, pTmpBuffer3, 1);
		m_ReceivedSnapshots++;
		m_CurrentRecvTick = GameTick;
		m_AckGameTick = GameTick;
		m_Latest.assign(aTmpBuffer3, aTmpBuffer3 + SnapSize);
		m_LatestTick = GameTick;
		m_ItersSinceSnap = 0;
		if(m_ReceivedSnapshots >= 2)
			m_State = ST_ONLINE;

		// the game state, for the summary (CNetObj_GameData)
		{
			const CSnapshot *pS = (const CSnapshot *)m_Latest.data();
			for(int i = 0; i < pS->NumItems(); i++)
				if(pS->GetItem(i)->Type() == NETOBJTYPE_GAMEDATA)
				{
					const CNetObj_GameData *pGD = (const CNetObj_GameData *)pS->GetItem(i)->Data();
					if(pGD->m_GameStateFlags != m_LastStateFlags)
					{
						m_LastStateFlags = pGD->m_GameStateFlags;
						char t[128];
						snprintf(t, sizeof(t), "game state flags %d (warmup 1, suddendeath 2, roundover 4, gameover 8, paused 16, countdown 32)", pGD->m_GameStateFlags);
						SummaryEvent("state " + std::to_string(pGD->m_GameStateFlags) + " " + std::to_string(GameTick), t);
					}
				}
		}
		// the record: every item of the snapshot
		std::string o;
		char b[96];
		snprintf(b, sizeof(b), "\"snap\":%d,\"delta\":%d,\"crc\":%d,\"items\":[", GameTick, DeltaTick, pTmpBuffer3->Crc());
		o = b;
		for(int i = 0; i < pTmpBuffer3->NumItems(); i++)
		{
			const CSnapshotItem *pItem = pTmpBuffer3->GetItem(i);
			int Size = pTmpBuffer3->GetItemSize(i) / 4;
			snprintf(b, sizeof(b), "%s[%d,%d,[", i ? "," : "", pItem->Type(), pItem->ID());
			o += b;
			for(int j = 0; j < Size; j++)
			{
				snprintf(b, sizeof(b), "%s%d", j ? "," : "", pItem->Data()[j]);
				o += b;
			}
			o += "]]";
		}
		o += "]";
		Record(o);
	}

	void ProcessGameMessage(int MsgID, CUnpacker *pUnpacker, CNetChunk *pPacket)
	{
		void *pRaw = s_NetObjHandler.SecureUnpackMsg(MsgID, pUnpacker);
		std::string o = "\"msg\":";
		if(!pRaw)
		{
			o += "{\"t\":" + std::to_string(MsgID) + ",\"failed\":";
			JsonStr(o, s_NetObjHandler.FailedMsgOn());
			o += "}";
		}
		else
			MsgDump(o, MsgID, pRaw);
		if(MsgID == NETMSGTYPE_SV_GAMEMSG && pRaw)
		{
			int Id = pUnpacker->GetInt();
			o += ",\"gamemsg\":" + std::to_string(Id) + ",\"params\":[";
			for(int i = 0; i < 3; i++)
			{
				int v = pUnpacker->GetInt();
				if(pUnpacker->Error())
					break;
				o += (i ? "," : "") + std::to_string(v);
			}
			o += "]";
			if(Id == GAMEMSG_CTF_CAPTURE || Id == GAMEMSG_CTF_GRAB || Id == GAMEMSG_CTF_DROP || Id == GAMEMSG_CTF_RETURN)
				SummaryEvent("gamemsg " + std::to_string(Id) + " " + std::to_string(m_Iter), "game message " + std::to_string(Id) + " (" +
					(Id == GAMEMSG_CTF_CAPTURE ? "capture" : Id == GAMEMSG_CTF_GRAB ? "flag grab" : Id == GAMEMSG_CTF_DROP ? "flag drop" : "flag return") + ")");
		}
		o += ",\"raw\":\"" + Hex(pPacket->m_pData, pPacket->m_DataSize) + "\"";
		Record(o);
		if(!pRaw)
			return;

		if(MsgID == NETMSGTYPE_SV_READYTOENTER)
		{
			// CClient::EnterGame
			CMsgPacker Msg(NETMSG_ENTERGAME, true);
			SendMsg(&Msg, MSGFLAG_VITAL|MSGFLAG_FLUSH);
			m_Storage.PurgeAll();
			m_ReceivedSnapshots = 0;
			m_SnapParts = 0;
			m_CurrentRecvTick = 0;
			m_LatestTick = -1;
			m_Latest.clear();
			m_Entered = true;
		}
		else if(MsgID == NETMSGTYPE_SV_CLIENTINFO)
		{
			CNetMsg_Sv_ClientInfo *p = (CNetMsg_Sv_ClientInfo *)pRaw;
			m_aActive[p->m_ClientID] = true;
			m_aTeam[p->m_ClientID] = p->m_Team;
			if(p->m_Local)
				m_LocalID = p->m_ClientID;
		}
		else if(MsgID == NETMSGTYPE_SV_CLIENTDROP)
		{
			CNetMsg_Sv_ClientDrop *p = (CNetMsg_Sv_ClientDrop *)pRaw;
			m_aActive[p->m_ClientID] = false;
		}
		else if(MsgID == NETMSGTYPE_SV_TEAM)
		{
			CNetMsg_Sv_Team *p = (CNetMsg_Sv_Team *)pRaw;
			if(p->m_ClientID >= 0)
				m_aTeam[p->m_ClientID] = p->m_Team;
		}
		else if(MsgID == NETMSGTYPE_SV_KILLMSG)
		{
			CNetMsg_Sv_KillMsg *p = (CNetMsg_Sv_KillMsg *)pRaw;
			char b[128];
			snprintf(b, sizeof(b), "kill %d %d %d %d", m_Iter, p->m_Killer, p->m_Victim, p->m_Weapon);
			char t[128];
			snprintf(t, sizeof(t), "kill: %d killed %d (weapon %d)", p->m_Killer, p->m_Victim, p->m_Weapon);
			SummaryEvent(b, t);
		}
		else if(MsgID == NETMSGTYPE_SV_CHAT)
		{
			CNetMsg_Sv_Chat *p = (CNetMsg_Sv_Chat *)pRaw;
			SummaryEvent("chat " + std::to_string(p->m_ClientID) + " " + p->m_pMessage, "chat " + std::to_string(p->m_ClientID) + ": " + p->m_pMessage);
		}
		else if(MsgID == NETMSGTYPE_SV_VOTESET)
		{
			CNetMsg_Sv_VoteSet *p = (CNetMsg_Sv_VoteSet *)pRaw;
			SummaryEvent("vote " + std::to_string(p->m_Type) + " " + p->m_pDescription + std::to_string(m_Iter),
				"vote set type " + std::to_string(p->m_Type) + " '" + p->m_pDescription + "'");
		}
	}

	// ---------------------------------------------------------------- the snapshot, for the bot
	const void *FindItem(int Type, int ID, int *pSize = 0)
	{
		if(m_Latest.empty())
			return 0;
		const CSnapshot *pSnap = (const CSnapshot *)m_Latest.data();
		for(int i = 0; i < pSnap->NumItems(); i++)
		{
			const CSnapshotItem *pItem = pSnap->GetItem(i);
			if(pItem->Type() == Type && (ID < 0 || pItem->ID() == ID))
			{
				if(pSize) *pSize = pSnap->GetItemSize(i);
				return pItem->Data();
			}
		}
		return 0;
	}

	std::vector<std::pair<int, const CNetObj_Character *> > Characters()
	{
		std::vector<std::pair<int, const CNetObj_Character *> > v;
		if(m_Latest.empty())
			return v;
		const CSnapshot *pSnap = (const CSnapshot *)m_Latest.data();
		for(int i = 0; i < pSnap->NumItems(); i++)
		{
			const CSnapshotItem *pItem = pSnap->GetItem(i);
			if(pItem->Type() == NETOBJTYPE_CHARACTER)
				v.push_back(std::make_pair(pItem->ID(), (const CNetObj_Character *)pItem->Data()));
		}
		return v;
	}

	bool Solid(float x, float y) { return m_HasCollision && m_Collision.CheckPoint(x, y); }

	// ---------------------------------------------------------------- the bot
	void Press(int *pButton) { if(!(*pButton & 1)) (*pButton)++; }
	void Release(int *pButton) { if(*pButton & 1) (*pButton)++; }

	// a path over the free tiles of the game layer (breadth first, 8 neighbours), as a guide: the
	// bot steers towards a tile a few steps along it
	std::vector<int> m_Path;
	int m_PathAge;

	bool FreeTile(int x, int y)
	{
		if(x < 0 || y < 0 || x >= m_Collision.GetWidth() || y >= m_Collision.GetHeight())
			return false;
		return !m_Collision.CheckPoint(x*32.0f+16, y*32.0f+16);
	}

	vec2 Waypoint(vec2 Pos, vec2 Target)
	{
		if(!m_HasCollision)
			return Target;
		int W = m_Collision.GetWidth(), H = m_Collision.GetHeight();
		int sx = clamp((int)(Pos.x/32), 0, W-1), sy = clamp((int)(Pos.y/32), 0, H-1);
		int tx = clamp((int)(Target.x/32), 0, W-1), ty = clamp((int)(Target.y/32), 0, H-1);
		if(m_Path.empty() || ++m_PathAge > 10 || m_Path.back() != ty*W+tx)
		{
			m_PathAge = 0;
			m_Path.clear();
			std::vector<int> Prev(W*H, -1);
			std::vector<int> Queue;
			Queue.push_back(sy*W+sx);
			Prev[sy*W+sx] = sy*W+sx;
			for(size_t q = 0; q < Queue.size(); q++)
			{
				int c = Queue[q], cx = c%W, cy = c/W;
				if(c == ty*W+tx)
					break;
				for(int d = 0; d < 8; d++)
				{
					static const int adx[8] = {1, -1, 0, 0, 1, 1, -1, -1}, ady[8] = {0, 0, 1, -1, 1, -1, 1, -1};
					int nx = cx+adx[d], ny = cy+ady[d];
					if(!FreeTile(nx, ny) || Prev[ny*W+nx] != -1)
						continue;
					if(d >= 4 && (!FreeTile(cx+adx[d], cy) || !FreeTile(cx, cy+ady[d])))
						continue;
					Prev[ny*W+nx] = c;
					Queue.push_back(ny*W+nx);
				}
			}
			if(Prev[ty*W+tx] == -1)
				return Target;
			for(int c = ty*W+tx; c != sy*W+sx; c = Prev[c])
				m_Path.insert(m_Path.begin(), c);
		}
		// the first path tile 4 steps ahead of the nearest one
		int Best = 0;
		float BestD = 1e9f;
		for(size_t i = 0; i < m_Path.size(); i++)
		{
			vec2 p(m_Path[i]%W*32.0f+16, m_Path[i]/W*32.0f+16);
			float d = distance(p, Pos);
			if(d < BestD) { BestD = d; Best = (int)i; }
		}
		if(m_Path.empty())
			return Target;
		int i = min(Best + 4, (int)m_Path.size() - 1);
		return vec2(m_Path[i]%W*32.0f+16, m_Path[i]/W*32.0f+16);
	}

	void SteerTo(vec2 Pos, vec2 Vel, vec2 FinalTarget)
	{
		vec2 Target = Waypoint(Pos, FinalTarget);
		float dx = Target.x - Pos.x, dy = Target.y - Pos.y;
		int Dir = dx > 24 ? 1 : dx < -24 ? -1 : 0;
		if(m_WanderTicks > 0)
		{
			m_WanderTicks--;
			Dir = m_WanderDir;
		}
		m_Input.m_Direction = Dir;
		bool Grounded = Solid(Pos.x + 14, Pos.y + 14 + 5) || Solid(Pos.x - 14, Pos.y + 14 + 5);
		bool Wall = Dir != 0 && (Solid(Pos.x + Dir*32, Pos.y) || Solid(Pos.x + Dir*32, Pos.y - 24));
		bool WantJump = (Grounded && (dy < -64 || Wall)) || (!Grounded && Vel.y > 2 && dy < -120) || (m_WanderTicks > 0 && Rnd(8) == 0);
		if(m_LastInput.m_Jump)
			m_Input.m_Jump = 0;
		else
			m_Input.m_Jump = WantJump ? 1 : 0;

		// hook: up towards the target, if there is ground to grab
		if(m_HookTicks > 0)
		{
			m_HookTicks--;
			m_Input.m_Hook = m_HookTicks > 0;
		}
		else if(dy < -40 || Wall || (absolute(dx) > 200 && !Grounded && Rnd(4) == 0))
		{
			// the direction towards the waypoint, turned up a little, then the first angle that grabs ground
			float Base = angle(vec2(dx, dy - 64.0f));
			for(int k = 0; k < 9; k++)
			{
				float a = Base + ((k+1)/2) * 0.2f * ((k&1) ? 1 : -1);
				vec2 Aim = direction(a);
				vec2 Out;
				if(Aim.y < 0.3f && m_HasCollision && m_Collision.IntersectLine(Pos, Pos + Aim*360.0f, &Out, 0) == CCollision::COLFLAG_SOLID
					&& distance(Out, Target) < distance(Pos, Target) + 64.0f)
				{
					m_Input.m_TargetX = (int)(Aim.x * 200);
					m_Input.m_TargetY = (int)(Aim.y * 200);
					m_Input.m_Hook = 1;
					m_HookTicks = 8 + Rnd(20);
					break;
				}
			}
		}
		// stuck: wander for a while
		if(distance(Pos, m_LastPos) < 1.5f)
		{
			if(++m_StuckTicks > 40)
			{
				m_StuckTicks = 0;
				m_WanderTicks = 30 + Rnd(40);
				m_WanderDir = Rnd(2) ? 1 : -1;
			}
		}
		else
			m_StuckTicks = 0;
		m_LastPos = Pos;
	}

	void AimAndFire(vec2 Pos, vec2 Target, bool Fire)
	{
		vec2 d = Target - Pos;
		if(m_Input.m_Hook && m_HookTicks > 0)
			return; // the aim holds the hook
		m_Input.m_TargetX = (int)d.x;
		m_Input.m_TargetY = (int)d.y;
		if(!m_Input.m_TargetX && !m_Input.m_TargetY)
			m_Input.m_TargetX = 1;
		if(Fire)
		{
			// click (press, release), or hold for a while
			if(m_Input.m_Fire & 1) { if(Rnd(3) == 0) Release(&m_Input.m_Fire); }
			else Press(&m_Input.m_Fire);
		}
		else
			Release(&m_Input.m_Fire);
	}

	void Think()
	{
		m_Input.m_PlayerFlags = 0;
		if(m_Hold > 0)
		{
			m_Hold--;
			return;
		}
		if(m_Mode == MODE_IDLE)
			return;
		const CNetObj_Character *pMe = m_LocalID >= 0 ? (const CNetObj_Character *)FindItem(NETOBJTYPE_CHARACTER, m_LocalID) : 0;
		if(!pMe)
		{
			// dead or spectating: fire respawns (CPlayer::OnDirectInput)
			m_Input.m_Direction = 0;
			m_Input.m_Hook = 0;
			m_Input.m_Jump = 0;
			if(m_Input.m_Fire & 1) Release(&m_Input.m_Fire); else if(Rnd(4) == 0) Press(&m_Input.m_Fire);
			return;
		}
		vec2 Pos(pMe->m_X, pMe->m_Y), Vel(pMe->m_VelX/256.0f, pMe->m_VelY/256.0f);
		if(Rnd(120) == 0)
			m_WantedWeapon = 1 + Rnd(5);
		// armor mode wants the heavy weapons (grenade, laser): hits for more than the armor holds
		if(m_Mode == MODE_ARMOR && m_WantedWeapon >= 2 && m_WantedWeapon <= 3)
			m_WantedWeapon = 4;
		m_Input.m_WantedWeapon = m_WantedWeapon;

		if(m_Mode == MODE_RANDOM)
		{
			if(Rnd(30) == 0) m_Input.m_Direction = Rnd(3) - 1;
			m_Input.m_Jump = Rnd(12) == 0;
			if(Rnd(20) == 0) m_Input.m_Hook = !m_Input.m_Hook;
			if(Rnd(10) == 0)
			{
				float a = Rnd(628) / 100.0f;
				m_Input.m_TargetX = (int)(cosf(a) * (50 + Rnd(300)));
				m_Input.m_TargetY = (int)(sinf(a) * (50 + Rnd(300)));
			}
			if(Rnd(6) == 0) m_Input.m_Fire = (m_Input.m_Fire + 1) & INPUT_STATE_MASK;
			return;
		}

		// the nearest enemy
		int MyTeam = m_aTeam[m_LocalID];
		bool Teams = false;
		if(const CNetObj_GameData *pGD = (const CNetObj_GameData *)FindItem(NETOBJTYPE_GAMEDATA, -1)) { (void)pGD; }
		for(int i = 0; i < MAX_CLIENTS; i++)
			if(m_aActive[i] && m_aTeam[i] == TEAM_BLUE) Teams = true;
		vec2 Enemy;
		float Best = 1e9f;
		std::vector<std::pair<int, const CNetObj_Character *> > Chars = Characters();
		for(size_t i = 0; i < Chars.size(); i++)
		{
			int Id = Chars[i].first;
			if(Id == m_LocalID || (Teams && m_aTeam[Id] == MyTeam))
				continue;
			vec2 P(Chars[i].second->m_X, Chars[i].second->m_Y);
			float d = distance(Pos, P);
			if(d < Best) { Best = d; Enemy = P; }
		}
		bool Visible = Best < 650.0f && m_HasCollision && !m_Collision.IntersectLine(Pos, Enemy, 0, 0);

		// nobody in sight: roam to a random free spot of the map
		if(Best >= 1e9f && m_HasCollision)
		{
			if(m_RoamTicks <= 0 || distance(Pos, m_Roam) < 64)
			{
				for(int k = 0; k < 50; k++)
				{
					int x = Rnd(m_Collision.GetWidth()), y = Rnd(m_Collision.GetHeight());
					if(FreeTile(x, y) && !FreeTile(x, y+1)) { m_Roam = vec2(x*32.0f+16, y*32.0f+16); break; }
				}
				m_RoamTicks = 400;
			}
			m_RoamTicks--;
		}
		vec2 Target = Best < 1e9f ? Enemy : m_Roam;
		if(m_Mode == MODE_ARMOR && pMe->m_Armor < 10 && !m_Latest.empty())
		{
			// hunt, but first fetch the nearest shield in view while the armor is not full
			const CSnapshot *pSnap = (const CSnapshot *)m_Latest.data();
			float BestPickup = 1e9f;
			for(int i = 0; i < pSnap->NumItems(); i++)
			{
				const CSnapshotItem *pItem = pSnap->GetItem(i);
				if(pItem->Type() != NETOBJTYPE_PICKUP)
					continue;
				const CNetObj_Pickup *pP = (const CNetObj_Pickup *)pItem->Data();
				if(pP->m_Type != PICKUP_ARMOR)
					continue;
				float d = distance(Pos, vec2(pP->m_X, pP->m_Y));
				if(d < BestPickup) { BestPickup = d; Target = vec2(pP->m_X, pP->m_Y); }
			}
		}
		if(m_Mode == MODE_FLAG)
		{
			int Mine = MyTeam == TEAM_BLUE ? TEAM_BLUE : TEAM_RED, Theirs = Mine ^ 1;
			const CNetObj_GameDataFlag *pGDF = (const CNetObj_GameDataFlag *)FindItem(NETOBJTYPE_GAMEDATAFLAG, -1);
			vec2 aFlag[2];
			bool aSeen[2] = {false, false};
			if(!m_Latest.empty())
			{
				const CSnapshot *pSnap = (const CSnapshot *)m_Latest.data();
				for(int i = 0; i < pSnap->NumItems(); i++)
				{
					const CSnapshotItem *pItem = pSnap->GetItem(i);
					if(pItem->Type() != NETOBJTYPE_FLAG)
						continue;
					const CNetObj_Flag *pF = (const CNetObj_Flag *)pItem->Data();
					if(pF->m_Team < 0 || pF->m_Team > 1)
						continue;
					aFlag[pF->m_Team] = vec2(pF->m_X, pF->m_Y);
					aSeen[pF->m_Team] = true;
				}
			}
			if(pGDF)
			{
				int aCarrier[2] = {pGDF->m_FlagCarrierRed, pGDF->m_FlagCarrierBlue};
				for(int t = 0; t < 2; t++)
					if(aCarrier[t] == FLAG_ATSTAND && aSeen[t] && !m_aFlagStandKnown[t]) { m_aFlagStand[t] = aFlag[t]; m_aFlagStandKnown[t] = true; }
				if(aCarrier[Theirs] == m_LocalID)
					Target = m_aFlagStandKnown[Mine] ? m_aFlagStand[Mine] : (aSeen[Mine] ? aFlag[Mine] : Target);
				else if(m_Defend)
				{
					// a defender gets our flag back, or hunts
					if(aCarrier[Mine] != FLAG_ATSTAND && aSeen[Mine])
						Target = aFlag[Mine];
				}
				else if(aSeen[Theirs])
					Target = aFlag[Theirs];
			}
		}
		SteerTo(Pos, Vel, Target);
		AimAndFire(Pos, Best < 1e9f ? Enemy : Pos + vec2(m_Input.m_Direction * 100.0f, 0), Visible);
		if(Visible && Best < 300 && !m_Input.m_Hook && Rnd(25) == 0)
		{
			m_Input.m_Hook = 1;
			m_HookTicks = 8 + Rnd(10);
		}
	}

	// CClient::SendInput with CControls::SnapInput's rule for when to send
	void SendInput()
	{
		if(m_State != ST_ONLINE || m_LatestTick < 0)
			return;
		int64 Now = time_get();
		bool Send = mem_comp(&m_Input, &m_LastInput, sizeof(m_Input)) != 0 || Now > m_LastSendTime + time_freq()/25;
		m_LastInput = m_Input;
		if(!Send)
			return;
		m_LastSendTime = Now;
		int PredTick = m_LatestTick + m_ItersSinceSnap + 2;
		CMsgPacker Msg(NETMSG_INPUT, true);
		Msg.AddInt(m_AckGameTick);
		Msg.AddInt(PredTick);
		Msg.AddInt(sizeof(m_Input));
		const int *pData = (const int *)&m_Input;
		for(unsigned i = 0; i < sizeof(m_Input)/4; i++)
			Msg.AddInt(pData[i]);
		int PingCorrection = 0;
		int64 TagTime;
		if(m_Storage.Get(m_AckGameTick, &TagTime, 0, 0) >= 0)
			PingCorrection = (int)(((Now-TagTime)*1000)/time_freq());
		Msg.AddInt(PingCorrection);
		SendMsg(&Msg, MSGFLAG_FLUSH);
	}

	// ---------------------------------------------------------------- scripted commands
	void Execute(const CCommand &c)
	{
		const std::vector<std::string> &a = c.m_Args;
		const std::string &Cmd = a[0];
		Log("command %s", c.m_Rest.c_str());
		if(Cmd == "connect") Connect();
		else if(Cmd == "disconnect") Disconnect(a.size() > 1 ? c.m_Rest.substr(c.m_Rest.find(' ') + 1).c_str() : 0);
		else if(Cmd == "silent") m_Silent = true;
		else if(Cmd == "mode") m_Mode = ModeOf(a[1]);
		else if(Cmd == "hold") m_Hold = atoi(a[1].c_str());
		else if(Cmd == "weapon") m_WantedWeapon = atoi(a[1].c_str());
		else if(Cmd == "say")
		{
			CNetMsg_Cl_Say Msg;
			Msg.m_Mode = a[1] == "team" ? CHAT_TEAM : CHAT_ALL;
			Msg.m_Target = -1;
			std::string Text = c.m_Rest.substr(c.m_Rest.find(a[1]) + a[1].size() + 1);
			Msg.m_pMessage = Text.c_str();
			SendPackMsg(&Msg, MSGFLAG_VITAL);
		}
		else if(Cmd == "emote")
		{
			CNetMsg_Cl_Emoticon Msg;
			Msg.m_Emoticon = atoi(a[1].c_str());
			SendPackMsg(&Msg, MSGFLAG_VITAL);
		}
		else if(Cmd == "team")
		{
			CNetMsg_Cl_SetTeam Msg;
			Msg.m_Team = atoi(a[1].c_str());
			SendPackMsg(&Msg, MSGFLAG_VITAL);
		}
		else if(Cmd == "spec")
		{
			CNetMsg_Cl_SetSpectatorMode Msg;
			Msg.m_SpecMode = atoi(a[1].c_str());
			Msg.m_SpectatorID = atoi(a[2].c_str());
			SendPackMsg(&Msg, MSGFLAG_VITAL);
		}
		else if(Cmd == "kill") { CNetMsg_Cl_Kill Msg; SendPackMsg(&Msg, MSGFLAG_VITAL); }
		else if(Cmd == "ready") { CNetMsg_Cl_ReadyChange Msg; SendPackMsg(&Msg, MSGFLAG_VITAL); }
		else if(Cmd == "vote")
		{
			CNetMsg_Cl_Vote Msg;
			Msg.m_Vote = atoi(a[1].c_str());
			SendPackMsg(&Msg, MSGFLAG_VITAL);
		}
		else if(Cmd == "callvote")
		{
			// gameclient's voting.cpp Callvote: type, value, reason, force 0
			CNetMsg_Cl_CallVote Msg;
			Msg.m_Type = a[1].c_str();
			std::string Value = a[2];
			for(size_t i = 0; i < Value.size(); i++) if(Value[i] == '_') Value[i] = ' ';
			Msg.m_Value = Value.c_str();
			std::string Reason = a.size() > 3 ? a[3] : "";
			Msg.m_Reason = Reason.c_str();
			Msg.m_Force = 0;
			SendPackMsg(&Msg, MSGFLAG_VITAL);
		}
		else if(Cmd == "skin")
		{
			m_aParts[0] = a[1];
			m_aParts[1] = a.size() > 2 ? a[2] : "";
			CNetMsg_Cl_SkinChange Msg;
			for(int p = 0; p < NUM_SKINPARTS; p++)
			{
				Msg.m_apSkinPartNames[p] = m_aParts[p].c_str();
				Msg.m_aUseCustomColors[p] = m_aUseCustom[p];
				Msg.m_aSkinPartColors[p] = m_aColors[p];
			}
			SendPackMsg(&Msg, MSGFLAG_VITAL|MSGFLAG_FLUSH);
		}
		else
			Log("unknown command %s", Cmd.c_str());
	}

	void Step(int Iter)
	{
		m_Iter = Iter;
		if(!m_pNet || m_Silent)
			return;
		m_pNet->Update();
		if(m_State != ST_OFFLINE && m_pNet->State() == NETSTATE_OFFLINE)
		{
			Log("offline error='%s'", m_pNet->ErrorString());
			Record(std::string("\"sys\":\"offline\",\"error\":\"") + m_pNet->ErrorString() + "\"");
			m_State = ST_OFFLINE;
			return;
		}
		if(m_State == ST_CONNECTING && m_pNet->State() == NETSTATE_ONLINE)
		{
			m_State = ST_LOADING;
			SendInfo();
		}
		CNetChunk Packet;
		while(m_pNet && m_pNet->Recv(&Packet))
		{
			if(!(Packet.m_Flags&NETSENDFLAG_CONNLESS))
				ProcessPacket(&Packet);
		}
		m_ItersSinceSnap++;
	}

	void Play()
	{
		if(!m_pNet || m_Silent || m_State != ST_ONLINE)
			return;
		Think();
		SendInput();
	}
};

std::vector<CBot *> s_apBots;

CBot *Bot(int k)
{
	while((int)s_apBots.size() <= k)
		s_apBots.push_back(new CBot((int)s_apBots.size()));
	return s_apBots[k];
}

std::vector<std::string> Split(const std::string &s)
{
	std::vector<std::string> v;
	std::istringstream in(s);
	std::string w;
	while(in >> w)
		v.push_back(w);
	return v;
}
}

namespace oracle {

void WriteSnapsLine(const std::string &Line)
{
	if(!s_pSnaps)
		s_pSnaps = fopen((g_OutDir + "/snaps.jsonl").c_str(), "w");
	fputs(Line.c_str(), s_pSnaps);
	fputc('\n', s_pSnaps);
}

void SummaryEvent(const std::string &Key, const std::string &Text)
{
	if(s_Events.count(Key))
		return;
	s_Events[Key] = Text;
	s_EventOrder.push_back(Text);
}

bool LoadScenario(const char *pFile, std::vector<std::string> *pServerArgs, std::string *pConfigText)
{
	FILE *f = fopen(pFile, "r");
	if(!f)
	{
		fprintf(stderr, "no scenario %s\n", pFile);
		return false;
	}
	static CConfig Config;
	mem_zero(&Config, sizeof(Config));
	s_pConfig = &Config;
	char aLine[1024];
	while(fgets(aLine, sizeof(aLine), f))
	{
		std::string Line = aLine;
		while(!Line.empty() && (Line.back() == '\n' || Line.back() == '\r'))
			Line.pop_back();
		size_t h = Line.find('#');
		if(h != std::string::npos && Line.compare(0, 6, "server") != 0)
			Line = Line.substr(0, h);
		std::vector<std::string> w = Split(Line);
		if(w.empty())
			continue;
		if(w[0] == "duration")
			s_Duration = atoi(w[1].c_str());
		else if(w[0] == "server")
		{
			std::string Arg = Line.substr(Line.find("server") + 7);
			pServerArgs->push_back(Arg);
			*pConfigText += Arg + "\n";
		}
		else if(w[0] == "client")
		{
			CBot *b = Bot(atoi(w[1].c_str()));
			for(size_t i = 2; i < w.size(); i++)
			{
				size_t e = w[i].find('=');
				std::string k = w[i].substr(0, e), v = e == std::string::npos ? "" : w[i].substr(e + 1);
				for(size_t j = 0; j < v.size(); j++) if(v[j] == '_') v[j] = ' ';
				if(k == "name") b->m_Name = v;
				else if(k == "clan") b->m_Clan = v;
				else if(k == "country") b->m_Country = atoi(v.c_str());
				else if(k == "seed") b->m_Seed = (unsigned)strtoul(v.c_str(), 0, 10);
				else if(k == "mode") b->m_Mode = ModeOf(v);
				else if(k == "role") b->m_Defend = v == "defend";
				else if(k == "body") b->m_aParts[0] = v;
				else if(k == "marking") b->m_aParts[1] = v;
				else if(k == "decoration") b->m_aParts[2] = v;
				else if(k == "hands") b->m_aParts[3] = v;
				else if(k == "feet") b->m_aParts[4] = v;
				else if(k == "eyes") b->m_aParts[5] = v;
				else if(k == "color")
				{
					std::istringstream in(v);
					std::string c;
					for(int p = 0; p < 6 && std::getline(in, c, ','); p++)
						b->m_aColors[p] = (int)strtoul(c.c_str(), 0, 16);
				}
			}
		}
		else if(w[0] == "at")
		{
			CCommand c;
			c.m_At = atoi(w[1].c_str());
			c.m_Client = atoi(w[2].c_str());
			c.m_Args.assign(w.begin() + 3, w.end());
			size_t p = Line.find(w[3], Line.find(w[2], Line.find(w[1]) + w[1].size()) + w[2].size());
			c.m_Rest = Line.substr(p);
			Bot(c.m_Client);
			s_aCommands.push_back(c);
		}
		else
		{
			fprintf(stderr, "scenario: unknown line '%s'\n", Line.c_str());
			return false;
		}
	}
	fclose(f);
	char b[64];
	snprintf(b, sizeof(b), "# duration %d iterations\n", s_Duration);
	*pConfigText += b;
	return true;
}

int ScenarioDuration() { return s_Duration; }

// once per server loop iteration (hook.cpp): every client reads what the server sent, the scripted
// commands of this iteration run, every client plays and sends its input, in client order
void StepClients(int Iteration)
{
	g_InClient = true;
	for(size_t i = 0; i < s_apBots.size(); i++)
		s_apBots[i]->Step(Iteration);
	for(size_t c = 0; c < s_aCommands.size(); c++)
		if(s_aCommands[c].m_At == Iteration)
			s_apBots[s_aCommands[c].m_Client]->Execute(s_aCommands[c]);
	for(size_t i = 0; i < s_apBots.size(); i++)
		s_apBots[i]->Play();
	g_InClient = false;
}

void FinishScenario()
{
	if(s_pSnaps)
		fclose(s_pSnaps);
	s_pSnaps = 0;
	FILE *f = fopen((g_OutDir + "/summary.txt").c_str(), "w");
	int Kills = 0, Caps = 0, Grabs = 0, Maps = 0;
	for(size_t i = 0; i < s_EventOrder.size(); i++)
	{
		const std::string &e = s_EventOrder[i];
		if(e.compare(0, 5, "kill:") == 0) Kills++;
		if(e.find("(capture)") != std::string::npos) Caps++;
		if(e.find("(flag grab)") != std::string::npos) Grabs++;
		if(e.compare(0, 10, "map change") == 0) Maps++;
	}
	fprintf(f, "%d iterations; kills %d, flag grabs %d, captures %d, map changes %d\n", s_Duration, Kills, Grabs, Caps, Maps);
	for(size_t i = 0; i < s_EventOrder.size(); i++)
		fprintf(f, "%s\n", s_EventOrder[i].c_str());
	fclose(f);
}

}
