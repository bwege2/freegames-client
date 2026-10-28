// The server oracle's shared state (hook.cpp, client.cpp, oracle_main.cpp). See build.sh.
#ifndef TW_ORACLE_H
#define TW_ORACLE_H
#include <base/system.h>
#include <string>
#include <vector>

class IServer;

namespace oracle {

// the virtual clock (µs; time_freq() is 1000000)
extern int64 g_Now;
const int64 START_TIME = 1000000000LL;
const int TICK_US = 20000;

// the server (oracle_main.cpp), for its tick
extern IServer *g_pServer;
// true while scripted client code runs: its rand() and secure_random_fill() come from other streams
extern bool g_InClient;

// the network: the server is 10.0.0.254:8303 to the clients, client k is 10.0.0.(k+1):port
void MakeAddr(NETADDR *pAddr, int a, int b, int c, int d, int Port);
// the address the next net_udp_create gets (a client socket); type 0: the server's bind address
extern NETADDR g_NextBind;
extern bool g_NextBindSet;
// client index of an address (10.0.0.(k+1)), -1 if none
int ClientOfAddr(const NETADDR *pAddr);

// recording (out/<scenario>/)
std::string Hex(const void *pData, int Size);
void JsonStr(std::string &o, const char *s);
extern std::string g_OutDir;
void WriteSnapsLine(const std::string &Line);
void SummaryEvent(const std::string &Key, const std::string &Text);

// the scenario (client.cpp)
bool LoadScenario(const char *pFile, std::vector<std::string> *pServerArgs, std::string *pConfigText);
// called once per server loop iteration from net_socket_read_wait, at the clients' time
void StepClients(int Iteration);
int ScenarioDuration();
void FinishScenario();

}
#endif
