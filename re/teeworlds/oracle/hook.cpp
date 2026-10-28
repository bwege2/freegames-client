// The server oracle's outside world, linked into the original server with ld --wrap (build.sh):
//
// * time_get: the virtual clock. It is constant within one iteration of CServer::Run's loop and moves
//   only in net_socket_read_wait (the m_NetServer.Wait(5) at the end of every iteration): iteration k of
//   the loop runs at START_TIME + 20000*k + 1 (k >= 1; iteration 0 at START_TIME), so every iteration
//   runs exactly one game tick (CServer::Run ticks while t > m_GameStartTime + 20000*tick). After a map
//   reload (m_GameStartTime = the reload's iteration time, tick 0) the next iteration runs no tick and
//   each one after it one tick again.
// * net_udp_*: an in-memory UDP network. The server's socket is 10.0.0.254:8303 to the clients; client k
//   is 10.0.0.(k+1), port 40000 + its connection number. A datagram is delivered to the socket bound to
//   its destination (exactly as sent, in order); datagrams to nobody are lost. NETADDRs are zeroed
//   before they are filled (the two bytes of padding after `port` are 0: the server's tokens are an md5
//   over the whole 24-byte NETADDR with port 0, see network_token.cpp).
// * net_socket_read_wait: ends the iteration: the iteration's record is written, the scripted clients
//   run (at the iteration's time + 10 ms: they read what the server sent, answer, send their input),
//   the clock moves on.
// * secure_random_init/fill: deterministic bytes (splitmix64), every call of the server recorded.
// * rand/srand: the server's glibc stream is the real one (srand(time_get()) in CEngine: the seed is
//   recorded); scripted client code (g_InClient) draws from a stream of its own.
#include "oracle.h"

#include <engine/server.h>

#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <deque>
#include <string>
#include <vector>
#include <unistd.h>

extern "C" {
int __real_rand(void);
void __real_srand(unsigned int);
}

namespace oracle {
int64 g_Now = START_TIME;
IServer *g_pServer = 0;
bool g_InClient = false;
NETADDR g_NextBind;
bool g_NextBindSet = false;
std::string g_OutDir;

void MakeAddr(NETADDR *pAddr, int a, int b, int c, int d, int Port)
{
	memset(pAddr, 0, sizeof(*pAddr));
	pAddr->type = NETTYPE_IPV4;
	pAddr->ip[0] = a; pAddr->ip[1] = b; pAddr->ip[2] = c; pAddr->ip[3] = d;
	pAddr->port = Port;
}

int ClientOfAddr(const NETADDR *pAddr)
{
	if(pAddr->ip[0] == 10 && pAddr->ip[1] == 0 && pAddr->ip[2] == 0 && pAddr->ip[3] >= 1 && pAddr->ip[3] < 254)
		return pAddr->ip[3] - 1;
	return -1;
}

std::string Hex(const void *pData, int Size)
{
	static const char *d = "0123456789abcdef";
	std::string s;
	s.reserve(Size * 2);
	for(int i = 0; i < Size; i++)
	{
		unsigned char c = ((const unsigned char *)pData)[i];
		s += d[c >> 4];
		s += d[c & 15];
	}
	return s;
}

void JsonStr(std::string &o, const char *s)
{
	char b[8];
	o += '"';
	for(const unsigned char *p = (const unsigned char *)s; *p; p++)
	{
		if(*p == '"' || *p == '\\') { o += '\\'; o += (char)*p; }
		else if(*p < 0x20) { snprintf(b, sizeof(b), "\\u%04x", *p); o += b; }
		else o += (char)*p;
	}
	o += '"';
}
}

// JsonStr for msgdump.cpp (global namespace)
void JsonStr(std::string &o, const char *s) { oracle::JsonStr(o, s); }

using namespace oracle;

namespace {
struct CDatagram
{
	NETADDR m_From;
	std::vector<unsigned char> m_Data;
};

struct CSock
{
	bool m_Open;
	bool m_Server;
	NETADDR m_Addr;
	std::deque<CDatagram> m_Queue;
};

std::vector<CSock> s_aSocks;
int s_ServerSock = -1;

// the record of the current iteration
std::string s_C2S, s_S2C, s_Rnd;
int s_RandCalls = 0;
std::string s_HeaderRnd;
unsigned s_SrandSeed = 0;
bool s_Srand = false;
int s_Iteration = 0;
FILE *s_pPackets = 0;

unsigned long long s_RngServer = 0x7465657730372e35ULL; // "teew07.5"
unsigned long long s_RngClient = 0x636c69656e742e2eULL;
unsigned s_ClientRand = 12345;

unsigned long long SplitMix(unsigned long long *pState)
{
	unsigned long long z = (*pState += 0x9e3779b97f4a7c15ULL);
	z = (z ^ (z >> 30)) * 0xbf58476d1ce4e5b9ULL;
	z = (z ^ (z >> 27)) * 0x94d049bb133111ebULL;
	return z ^ (z >> 31);
}

bool Same(const NETADDR *a, const NETADDR *b)
{
	return a->ip[0] == b->ip[0] && a->ip[1] == b->ip[1] && a->ip[2] == b->ip[2] && a->ip[3] == b->ip[3] && a->port == b->port;
}

NETADDR ServerAddr()
{
	NETADDR a;
	MakeAddr(&a, 10, 0, 0, 254, 8303);
	return a;
}

void Append(std::string &List, int Client, const void *pData, int Size)
{
	char b[32];
	if(!List.empty())
		List += ',';
	snprintf(b, sizeof(b), "[%d,\"", Client);
	List += b;
	List += Hex(pData, Size);
	List += "\"]";
}

void WriteIteration()
{
	if(!s_pPackets)
	{
		s_pPackets = fopen((g_OutDir + "/packets.jsonl").c_str(), "w");
		std::string h = "{\"header\":1,\"start\":";
		char b[64];
		snprintf(b, sizeof(b), "%lld,\"tickUs\":%d,\"srand\":%u", (long long)START_TIME, TICK_US, s_SrandSeed);
		h += b;
		h += ",\"server\":\"10.0.0.254:8303\",\"rnd\":[" + s_HeaderRnd + "]}\n";
		fputs(h.c_str(), s_pPackets);
	}
	char b[128];
	snprintf(b, sizeof(b), "{\"it\":%d,\"tick\":%d,\"t\":%lld,\"rand\":%d,\"c2s\":[", s_Iteration, g_pServer ? g_pServer->Tick() : -1,
		(long long)g_Now, s_RandCalls);
	std::string l = b;
	l += s_C2S + "],\"s2c\":[" + s_S2C + "],\"rnd\":[" + s_Rnd + "]}\n";
	fputs(l.c_str(), s_pPackets);
	s_C2S.clear(); s_S2C.clear(); s_Rnd.clear(); s_RandCalls = 0;
}
}

void oracle_close_packets()
{
	if(s_pPackets)
		fclose(s_pPackets);
	s_pPackets = 0;
}

extern "C" {

int64 __wrap_time_get() { return g_Now; }

NETSOCKET __wrap_net_udp_create(NETADDR BindAddr, int UseRandomPort)
{
	CSock s;
	s.m_Open = true;
	s.m_Server = !g_NextBindSet;
	s.m_Addr = g_NextBindSet ? g_NextBind : ServerAddr();
	g_NextBindSet = false;
	s_aSocks.push_back(s);
	int id = (int)s_aSocks.size() - 1;
	if(s.m_Server)
		s_ServerSock = id;
	NETSOCKET r;
	r.type = NETTYPE_IPV4;
	r.ipv4sock = id;
	r.ipv6sock = -1;
	return r;
}

int __wrap_net_udp_close(NETSOCKET Sock)
{
	if(Sock.ipv4sock >= 0 && Sock.ipv4sock < (int)s_aSocks.size())
	{
		s_aSocks[Sock.ipv4sock].m_Open = false;
		s_aSocks[Sock.ipv4sock].m_Queue.clear();
	}
	return 0;
}

int __wrap_net_udp_send(NETSOCKET Sock, const NETADDR *pAddr, const void *pData, int Size)
{
	if(Sock.ipv4sock < 0 || Sock.ipv4sock >= (int)s_aSocks.size())
		return -1;
	CSock &From = s_aSocks[Sock.ipv4sock];
	if(From.m_Server)
		Append(s_S2C, ClientOfAddr(pAddr), pData, Size);
	for(size_t i = 0; i < s_aSocks.size(); i++)
	{
		CSock &To = s_aSocks[i];
		if(!To.m_Open || !Same(&To.m_Addr, pAddr))
			continue;
		CDatagram d;
		d.m_From = From.m_Addr;
		d.m_Data.assign((const unsigned char *)pData, (const unsigned char *)pData + Size);
		To.m_Queue.push_back(d);
		break;
	}
	return Size;
}

int __wrap_net_udp_recv(NETSOCKET Sock, NETADDR *pAddr, void *pData, int MaxSize)
{
	if(Sock.ipv4sock < 0 || Sock.ipv4sock >= (int)s_aSocks.size())
		return -1;
	CSock &s = s_aSocks[Sock.ipv4sock];
	if(s.m_Queue.empty())
		return 0;
	CDatagram d = s.m_Queue.front();
	s.m_Queue.pop_front();
	int n = (int)d.m_Data.size();
	if(n > MaxSize)
		n = MaxSize;
	memcpy(pData, d.m_Data.data(), n);
	memset(pAddr, 0, sizeof(*pAddr));
	*pAddr = d.m_From;
	if(s.m_Server)
		Append(s_C2S, ClientOfAddr(&d.m_From), pData, n);
	return n;
}

int __wrap_net_socket_read_wait(NETSOCKET Sock, int Time)
{
	if(Sock.ipv4sock != s_ServerSock)
		return 0;
	WriteIteration();
	int64 IterTime = g_Now;
	g_Now = IterTime + 10000;
	StepClients(s_Iteration);
	s_Iteration++;
	g_Now = START_TIME + (int64)TICK_US * s_Iteration + 1;
	if(s_Iteration > ScenarioDuration())
	{
		FinishScenario();
		oracle_close_packets();
		fflush(stdout);
		fflush(stderr);
		_exit(0);
	}
	return 0;
}

int __wrap_secure_random_init() { return 0; }

void __wrap_secure_random_fill(void *pBytes, unsigned Length)
{
	unsigned long long *pState = g_InClient ? &s_RngClient : &s_RngServer;
	unsigned char *p = (unsigned char *)pBytes;
	for(unsigned i = 0; i < Length; i += 8)
	{
		unsigned long long v = SplitMix(pState);
		for(unsigned j = 0; j < 8 && i + j < Length; j++)
			p[i + j] = (unsigned char)(v >> (8 * j));
	}
	if(g_InClient)
		return;
	std::string &List = s_pPackets ? s_Rnd : s_HeaderRnd;
	if(!List.empty())
		List += ',';
	List += "\"" + Hex(pBytes, Length) + "\"";
}

int __wrap_rand(void)
{
	if(g_InClient)
	{
		s_ClientRand = s_ClientRand * 1103515245u + 12345u;
		return (int)((s_ClientRand >> 1) & 0x7fffffff);
	}
	s_RandCalls++;
	return __real_rand();
}

void __wrap_srand(unsigned int Seed)
{
	s_SrandSeed = Seed;
	s_Srand = true;
	__real_srand(Seed);
}

}
