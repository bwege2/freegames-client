// The OpenCity 0.0.6.5stable oracle's driver (see build.sh). It builds the game the way main.cpp's
// clientMode() does (map maker, height map, property manager, movement manager, City) and then reads
// a script from stdin, one command per line:
//
//   new MAPSEED GAMESEED   a new 50x50 city: MapMaker(MAPSEED) as main.cpp creates it (plain, lake, no
//                          shape, sparse trees), then srand(GAMESEED) in place of MapMaker's srand(time(NULL))
//   tool NAME W1 L1 W2 L2  City::_DoTool with the tool (OC_TOOL_<NAME>) and the selected corners
//   run MS                 MS milliseconds of play on a virtual clock: a frame every 20 ms (msPerFrame of
//                          config/opencity.xml) calls City::Run(); before each frame, every simulator
//                          step that is due runs (the body of MainSim::Main's loop), the next one after
//                          the delay Simulator::RCIDelay() asks for
//   pause | play           the status bar's speed button (City::_HandleStatusClick)
//   save FILE | load FILE  City::_Save / City::_Load
//   dump                   the city: date, fund, population, simulators, every structure, vehicles
//   heights | trees        the height map / the map maker's tree density
//   delays                 Simulator::RCIDelay() for 0..2500 structures
//
// The port's test (web/games/opencity/test) runs the same scripts and compares the output.
#include "opencity_direction.h"
#include "opencity_structure_type.h"
#include "main.h"
#include "city.h"
#include "conf.h"
#include "globalvar.h"
#include "mainsim.h"
#include "simulator.h"
#include "buildinglayer.h"
#include "structure.h"
#include "pathstructure.h"
#include "movementmanager.h"
#include "movement.h"
#include <cmath>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <iostream>
#include <sstream>
#include <string>

extern GlobalVar gVars;
extern int g_lastDelay;

static string sDataDir;

string ocDataDirPrefix(const string& s) { return sDataDir + s; }
string ocConfigDirPrefix(const string& s) { return sDataDir + s; }
string ocSaveDirPrefix(const string& s) { return s; }
string ocStrVersion() { std::ostringstream oss; oss << OC_VERSION << "." << OC_PATCHLEVEL << "." << OC_SUBLEVEL; return oss.str(); }
long ocLongVersion() { return OC_VERSION*65536 + OC_PATCHLEVEL*256 + OC_SUBLEVEL; }
void ocQuit(const int) {}
void ocRestart() {}
void ocSetNewUI(UI*) {}

static City* city = NULL;
static long long clockMs = 0;      // the virtual clock
static long long nextSim = 0;      // when the simulator thread runs its next step
static unsigned simTimes = 0;      // MainSim::Main's "times"

static void simStep()
{
	MainSim* m = city->_pMSim;
	if (m->_eSimState == Simulator::SIMULATOR_RUNNING) {
		for (uint ui = 0; ui < Simulator::OC_SIMULATOR_NUMBER; ui++)
			m->_tpSimulator[ui]->Main();
	}
	if (simTimes == 0)
		m->RefreshSimValue();
	g_lastDelay = -1;
	Simulator::RCIDelay();
	simTimes = (simTimes + 1) % 5;
	nextSim += g_lastDelay;
}

static void runMs(long long ms)
{
	long long end = clockMs + ms;
	while (clockMs < end) {
		while (nextSim <= clockMs)
			simStep();
		city->Run();
		clockMs += gVars.guiMsPerFrame;
	}
}

static const char* TOOLS[] = {
	"NONE", "DESTROY", "ZONE_RES", "ZONE_COM", "ZONE_IND", "HEIGHT_UP", "HEIGHT_DOWN", "ROAD", "ELINE",
	"EPLANT_COAL", "EPLANT_NUCLEAR", "PARK", "FLORA", "FIRE", "POLICE", "HOSPITAL", "EDUCATION",
	"AGENT_POLICE", "AGENT_DEMONSTRATOR", "AGENT_ROBBER", "TEST_BUILDING", "QUERY", NULL };

static void dump()
{
	BuildingLayer* bl = (BuildingLayer*)city->_apLayer[OC_LAYER_BUILDING];
	MainSim* m = city->_pMSim;
	printf("date %u/%u/%u fund %ld pop %u income %u\n", city->_uiDay, city->_uiMonth, city->_uiYear,
		(long)city->_liCityFund, city->_uiPopulation, city->_uiIncome);
	printf("sim r %d c %d i %d e %d t %d emax %d structures %u\n",
		m->GetValue(Simulator::OC_RESIDENTIAL), m->GetValue(Simulator::OC_COMMERCIAL),
		m->GetValue(Simulator::OC_INDUSTRIAL), m->GetValue(Simulator::OC_ELECTRIC),
		m->GetValue(Simulator::OC_TRAFFIC), m->GetMaxValue(Simulator::OC_ELECTRIC), Structure::GetNumber());
	uint W = city->_uiWidth, L = city->_uiLength;
	for (uint i = 0; i < W * L; i++) {
		Structure* p = bl->GetLinearStructure(i);
		if (p == NULL) continue;
		printf("%u,%u %d %d %d %u %u", i % W, i / W, (int)p->GetCode(), (int)p->GetGraphicCode(), (int)p->GetType(),
			p->_uiStatus, p->GetLevel());
		if (p->GetMain() != NULL) {
			for (uint j = 0; j < W * L; j++)
				if (bl->GetLinearStructure(j) == p->GetMain()) { printf(" main %u,%u", j % W, j / W); break; }
		}
		if (p->GetCode() == OC_STRUCTURE_ROAD || p->GetCode() == OC_STRUCTURE_ELINE) {
			PathStructure* ps = (PathStructure*)p;
			printf(" n %u t %u", (uint)ps->ubNumberNeighbour, (uint)ps->ubTraffic);
		}
		printf("\n");
	}
	MovementManager* mm = gVars.gpMoveMgr;
	printf("vehicles %u\n", mm->_uiCount);
	for (uint i = 0; i < OC_MOVEMENT_MAX; i++) {
		Movement* v = mm->tabmvt[i];
		if (v == NULL) continue;
		// the float positions as their bit patterns, so that both sides print them exactly
		uint bw, bl, bh;
		memcpy(&bw, &v->_fCurrentW, 4); memcpy(&bl, &v->_fCurrentL, 4); memcpy(&bh, &v->_fCurrentH, 4);
		printf("v%u %d %08x %08x %08x\n", i, (int)v->GetGraphicCode(), bw, bl, bh);
	}
	printf("end\n");
}

static void printMap(int* a, uint w, uint h)
{
	for (uint y = 0; y < h; y++) {
		for (uint x = 0; x < w; x++) printf(x ? " %d" : "%d", a[y * w + x]);
		printf("\n");
	}
	printf("end\n");
}

static void newCity(uint mapSeed, uint gameSeed)
{
	if (city != NULL) {
		gVars.gpMoveMgr->Remove();
		delete city;
		delete gVars.gpMapMgr;
		delete gVars.gpMapMaker;
	}
	gVars.guiGeneratorSeed = mapSeed;
	gVars.gpMapMaker = new MapGen::MapMaker(
		gVars.guiCityWidth, gVars.guiCityLength, gVars.gsGeneratorHeightMap,
		gVars.guiGeneratorMapType, gVars.guiGeneratorWaterType,
		gVars.guiGeneratorMapShapeType, gVars.guiGeneratorTreeDensityType,
		gVars.guiGeneratorSeed);
	srand(gameSeed);
	gVars.gpMapMgr = new Map(gVars.guiCityWidth, gVars.guiCityLength);
	city = new City(gVars.guiCityWidth, gVars.guiCityLength);
	// the new simulator thread starts at once; MainSim::Main's static counter and City::Run's static frame
	// counter go on from the last city, as in the original after "New"
	nextSim = clockMs;
}

int main(int argc, char** argv)
{
	if (argc < 2) {
		fprintf(stderr, "usage: opencity-oracle DATADIR/ < script\n");
		return 2;
	}
	sDataDir = argv[1];
	if (sDataDir.size() && sDataDir[sDataDir.size() - 1] != '/') sDataDir += "/";
	// main.cpp: initGlobalVar() then config/opencity.xml (city 50x50, msPerFrame 20)
	gVars.gboolUseAudio = false;
	gVars.guiCityWidth = 50;
	gVars.guiCityLength = 50;
	gVars.guiMsPerFrame = 20;
	gVars.guiScreenWidth = 750;
	gVars.guiScreenHeight = 560;
	gVars.gsGeneratorHeightMap = "";
	gVars.guiGeneratorMapType = MapGen::MapMaker::PLAIN;
	gVars.guiGeneratorWaterType = MapGen::MapMaker::LAKE;
	gVars.guiGeneratorMapShapeType = MapGen::MapMaker::NONE;
	gVars.guiGeneratorTreeDensityType = MapGen::MapMaker::SPARSE;
	gVars.gboolActive = true;
	gVars.gpKernel = NULL;
	gVars.gpEnvironment = NULL;
	gVars.gpVideoSrf = NULL;
	// main.cpp:1251
	gVars.gfMsSimDelayMax = log10((OC_FLOAT)gVars.guiCityWidth*gVars.guiCityLength + 1) * OC_MS_GLOBAL_LOG_FACTOR;
	gVars.gpmutexSim = SDL_CreateMutex();
	gVars.gpRenderer = new Renderer(gVars.guiCityWidth, gVars.guiCityLength);
	gVars.gpAudioMgr = new AudioManager();
	gVars.gpGraphicMgr = NULL;
	gVars.gpPropertyMgr = new PropertyManager();
	gVars.gpNetworking = NULL;
	gVars.gpMoveMgr = new MovementManager(NULL, NULL);

	string line;
	while (std::getline(std::cin, line)) {
		std::istringstream in(line);
		string cmd;
		in >> cmd;
		if (cmd == "new") {
			uint a, b; in >> a >> b; newCity(a, b);
		} else if (cmd == "tool") {
			string name; uint w1, l1, w2, l2; in >> name >> w1 >> l1 >> w2 >> l2;
			int t = -1;
			for (int i = 0; TOOLS[i]; i++) if (name == TOOLS[i]) t = i;
			if (t < 0) { fprintf(stderr, "unknown tool %s\n", name.c_str()); return 1; }
			city->_eCurrentTool = (OPENCITY_TOOL_CODE)t;
			city->_uiMapW1 = w1; city->_uiMapL1 = l1; city->_uiMapW2 = w2; city->_uiMapL2 = l2;
			SDL_MouseButtonEvent ev; memset(&ev, 0, sizeof ev);
			if (t == OC_TOOL_QUERY) continue;   // opens a GUI container only
			city->_DoTool(ev);
		} else if (cmd == "run") {
			long long ms; in >> ms; runMs(ms);
		} else if (cmd == "pause") {
			city->_eSpeed = OC_SPEED_PAUSE; city->_pMSim->Stop();
		} else if (cmd == "play") {
			city->_eSpeed = OC_SPEED_NORMAL; city->_pMSim->Run();
		} else if (cmd == "save") {
			string f; in >> f; printf("save %d\n", city->_Save(f) ? 1 : 0);
		} else if (cmd == "load") {
			string f; in >> f; printf("load %d\n", city->_Load(f) ? 1 : 0);
		} else if (cmd == "dump") {
			dump();
		} else if (cmd == "delays") {
			// Simulator::RCIDelay() for every number of structures 0..2500
			uint saved = Structure::GetNumber();
			for (uint n = 0; n <= 2500; n++) {
				Structure::SetNumber(n);
				Simulator::RCIDelay();
				printf(n % 20 == 19 ? "%d\n" : "%d ", g_lastDelay);
			}
			printf("\nend\n");
			Structure::SetNumber(saved);
		} else if (cmd == "heights") {
			int* a = gVars.gpMapMaker->getMap(); printMap(a, gVars.guiCityWidth + 1, gVars.guiCityLength + 1); delete [] a;
		} else if (cmd == "trees") {
			int* a = gVars.gpMapMaker->getTreeDensity(); printMap(a, gVars.guiCityWidth, gVars.guiCityLength); delete [] a;
		} else if (cmd.size() && cmd[0] != '#') {
			fprintf(stderr, "unknown command %s\n", cmd.c_str());
			return 1;
		}
		fflush(stdout);
	}
	return 0;
}
