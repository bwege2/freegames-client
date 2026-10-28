// The server oracle's main(): the original main() of src/engine/server/server.cpp (0.7.5), unchanged but
// for three things outside the game: the command line comes from the scenario file (its `server` lines,
// one console line each, as the original takes them from argv), the server object is kept for the hook
// (its tick), and the storage is kept for the scripted clients (they load the maps they download).
//   tw-server-oracle <scenario.scn> <outdir>
#include "oracle.h"

#include <base/system.h>

#include <engine/config.h>
#include <engine/console.h>
#include <engine/engine.h>
#include <engine/map.h>
#include <engine/masterserver.h>
#include <engine/server.h>
#include <engine/storage.h>
#include <engine/shared/compression.h>
#include <engine/shared/config.h>
#include <engine/shared/datafile.h>
#include <engine/shared/demo.h>
#include <engine/shared/econ.h>
#include <engine/shared/filecollection.h>
#include <engine/shared/mapchecker.h>
#include <engine/shared/netban.h>
#include <engine/shared/network.h>
#include <engine/shared/packer.h>
#include <engine/shared/protocol.h>
#include <engine/shared/snapshot.h>
#include <mastersrv/mastersrv.h>

#include <engine/server/register.h>
#include <engine/server/server.h>

#include <cstdio>
#include <string>
#include <vector>

namespace oracle { IStorage *g_pStorage = 0; }

int main(int argc, const char **argv)
{
	if(argc < 3)
	{
		fprintf(stderr, "usage: tw-server-oracle <scenario.scn> <outdir>\n");
		return 2;
	}
	oracle::g_OutDir = argv[2];
	std::vector<std::string> Lines;
	std::string ConfigText;
	if(!oracle::LoadScenario(argv[1], &Lines, &ConfigText))
		return 2;
	{
		FILE *f = fopen((oracle::g_OutDir + "/config.txt").c_str(), "w");
		fputs(ConfigText.c_str(), f);
		fclose(f);
	}
	std::vector<const char *> Args;
	Args.push_back("teeworlds_srv");
	for(size_t i = 0; i < Lines.size(); i++)
		Args.push_back(Lines[i].c_str());
	int ArgC = (int)Args.size();
	const char **ArgV = Args.data();

	bool UseDefaultConfig = false;

	if(secure_random_init() != 0)
	{
		dbg_msg("secure", "could not initialize secure RNG");
		return -1;
	}

	CServer *pServer = new CServer();
	oracle::g_pServer = pServer;
	IKernel *pKernel = IKernel::Create();

	// create the components
	int FlagMask = CFGFLAG_SERVER|CFGFLAG_ECON;
	IEngine *pEngine = CreateEngine("Teeworlds_Server");
	IEngineMap *pEngineMap = CreateEngineMap();
	IGameServer *pGameServer = CreateGameServer();
	IConsole *pConsole = CreateConsole(CFGFLAG_SERVER|CFGFLAG_ECON);
	IEngineMasterServer *pEngineMasterServer = CreateEngineMasterServer();
	IStorage *pStorage = CreateStorage("Teeworlds", IStorage::STORAGETYPE_SERVER, ArgC, ArgV);
	IConfigManager *pConfigManager = CreateConfigManager();
	oracle::g_pStorage = pStorage;

	pServer->InitRegister(&pServer->m_NetServer, pEngineMasterServer, pConfigManager->Values(), pConsole);

	{
		bool RegisterFail = false;

		RegisterFail = RegisterFail || !pKernel->RegisterInterface(pServer); // register as both
		RegisterFail = RegisterFail || !pKernel->RegisterInterface(pEngine);
		RegisterFail = RegisterFail || !pKernel->RegisterInterface(static_cast<IEngineMap*>(pEngineMap)); // register as both
		RegisterFail = RegisterFail || !pKernel->RegisterInterface(static_cast<IMap*>(pEngineMap));
		RegisterFail = RegisterFail || !pKernel->RegisterInterface(pGameServer);
		RegisterFail = RegisterFail || !pKernel->RegisterInterface(pConsole);
		RegisterFail = RegisterFail || !pKernel->RegisterInterface(pStorage);
		RegisterFail = RegisterFail || !pKernel->RegisterInterface(pConfigManager);
		RegisterFail = RegisterFail || !pKernel->RegisterInterface(static_cast<IEngineMasterServer*>(pEngineMasterServer)); // register as both
		RegisterFail = RegisterFail || !pKernel->RegisterInterface(static_cast<IMasterServer*>(pEngineMasterServer));

		if(RegisterFail)
			return -1;
	}

	pEngine->Init();
	pConfigManager->Init(FlagMask);
	pConsole->Init();
	pEngineMasterServer->Init();
	pEngineMasterServer->Load();

	pServer->InitInterfaces(pConfigManager->Values(), pConsole, pGameServer, pEngineMap, pStorage);
	if(!UseDefaultConfig)
	{
		// register all console commands
		pServer->RegisterCommands();

		// execute autoexec file
		pConsole->ExecuteFile("autoexec.cfg");

		// parse the command line arguments
		if(ArgC > 1)
			pConsole->ParseArguments(ArgC-1, &ArgV[1]);
	}

	// restore empty config strings to their defaults
	pConfigManager->RestoreStrings();

	pEngine->InitLogfile();

	pServer->InitRconPasswordIfUnset();

	// run the server
	dbg_msg("server", "starting...");
	int Ret = pServer->Run();
	return Ret;
}
