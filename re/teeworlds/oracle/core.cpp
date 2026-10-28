// The core oracle: the original game core (src/game/gamecore.cpp, collision.cpp, layers.cpp) on an official
// map loaded by the original loader (CMap, CDataFileReader), stepped as the server steps it:
//   per tick, for each character in client-id order: CCharacter::Tick: m_Core.m_Input = m_Input (with
//   CCharacter::OnPredictedInput's rule: a target of (0,0) becomes (0,-1)); m_Core.Tick(true);
//   then, for each character in the same order: CCharacter::TickDefered: m_Core.Move(); m_Core.Quantize();
//   then a character on a death tile (m_Core.m_Death) or outside the game layer + 200 tiles
//   (CEntity::GameLayerClipped) respawns at once: m_Core.Reset(); m_Core.m_Pos = its spawn point
//   (the server's would come back after a delay; the core does not care). Listed as "respawn".
// Input: a seeded generator (below), the same inputs are written to the golden, so a replay needs no
// generator of its own.
//   tw-core-oracle <map> <characters> <ticks> <seed> <out.jsonl> <libm.jsonl>
// atan2f and powf (the only libm functions the core calls; sqrtf is the SSE instruction) are wrapped
// (ld --wrap): every distinct call is written to libm.jsonl with its result, and compared with
// (float)atan2((double)y,(double)x) and (float)pow((double)a,(double)b).
#include <base/math.h>
#include <base/system.h>
#include <base/vmath.h>
#include <engine/map.h>
#include <engine/storage.h>
#include <game/collision.h>
#include <game/gamecore.h>
#include <game/layers.h>
#include <game/mapitems.h>

#include <cmath>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <set>
#include <string>
#include <vector>

extern "C" {
float __real_atan2f(float, float);
float __real_powf(float, float);
}

static std::set<std::string> s_LibmSeen;
static FILE *s_pLibm = 0;
static int s_Atan2Mismatch = 0, s_PowMismatch = 0, s_Atan2Calls = 0, s_PowCalls = 0;

static unsigned Bits(float f) { unsigned u; memcpy(&u, &f, 4); return u; }

static void LogLibm(const char *pFn, float a, float b, float r)
{
	char buf[96];
	snprintf(buf, sizeof(buf), "[\"%s\",\"%08x\",\"%08x\",\"%08x\"]", pFn, Bits(a), Bits(b), Bits(r));
	if(s_LibmSeen.size() < 200000 && s_LibmSeen.insert(buf).second && s_pLibm)
		fprintf(s_pLibm, "%s\n", buf);
}

extern "C" float __wrap_atan2f(float y, float x)
{
	float r = __real_atan2f(y, x);
	s_Atan2Calls++;
	if(Bits((float)atan2((double)y, (double)x)) != Bits(r))
		s_Atan2Mismatch++;
	LogLibm("atan2f", y, x, r);
	return r;
}

extern "C" float __wrap_powf(float a, float b)
{
	float r = __real_powf(a, b);
	s_PowCalls++;
	if(Bits((float)pow((double)a, (double)b)) != Bits(r))
		s_PowMismatch++;
	LogLibm("powf", a, b, r);
	return r;
}

static unsigned s_Seed;
static unsigned Rnd() { s_Seed ^= s_Seed << 13; s_Seed ^= s_Seed >> 17; s_Seed ^= s_Seed << 5; return s_Seed; }
static int Rnd(int n) { return (int)(Rnd() % (unsigned)n); }

int main(int argc, const char **argv)
{
	if(argc < 7)
	{
		fprintf(stderr, "usage: tw-core-oracle <map> <chars> <ticks> <seed> <out.jsonl> <libm.jsonl>\n");
		return 2;
	}
	const char *pMapName = argv[1];
	int N = atoi(argv[2]), Ticks = atoi(argv[3]);
	s_Seed = (unsigned)atoi(argv[4]) * 2654435761u + 1;
	FILE *pOut = fopen(argv[5], "w");
	s_pLibm = fopen(argv[6], "w");

	IStorage *pStorage = CreateStorage("Teeworlds", IStorage::STORAGETYPE_BASIC, argc, argv);
	IEngineMap *pMap = CreateEngineMap();
	char aPath[128];
	str_format(aPath, sizeof(aPath), "maps/%s.map", pMapName);
	if(!pMap->Load(aPath, pStorage))
	{
		fprintf(stderr, "cannot load %s\n", aPath);
		return 1;
	}
	CLayers Layers;
	Layers.Init(0, pMap);
	CCollision Collision;
	Collision.Init(&Layers);

	// spawn points (CGameContext::OnInit, IGameController::OnEntity): every spawn tile, any team
	std::vector<vec2> Spawns;
	{
		CMapItemLayerTilemap *pTileMap = Layers.GameLayer();
		CTile *pTiles = (CTile *)pMap->GetData(pTileMap->m_Data);
		for(int y = 0; y < pTileMap->m_Height; y++)
			for(int x = 0; x < pTileMap->m_Width; x++)
			{
				int Index = pTiles[y*pTileMap->m_Width+x].m_Index;
				if(Index >= ENTITY_OFFSET)
				{
					int e = Index - ENTITY_OFFSET;
					if(e >= ENTITY_SPAWN && e <= ENTITY_SPAWN_BLUE)
						Spawns.push_back(vec2(x*32.0f+16.0f, y*32.0f+16.0f));
				}
			}
	}
	if(Spawns.empty())
	{
		fprintf(stderr, "no spawns\n");
		return 1;
	}

	CWorldCore World;
	std::vector<CCharacterCore> Cores(N);
	std::vector<vec2> MySpawn(N);
	std::vector<CNetObj_PlayerInput> Inputs(N);
	for(int i = 0; i < N; i++)
	{
		Cores[i].Reset();
		Cores[i].Init(&World, &Collision);
		MySpawn[i] = Spawns[(i * 3) % Spawns.size()];
		Cores[i].m_Pos = MySpawn[i];
		World.m_apCharacters[i] = &Cores[i];
		mem_zero(&Inputs[i], sizeof(Inputs[i]));
		Inputs[i].m_TargetX = 100;
	}

	{
		std::string h = "{\"map\":\"";
		h += pMapName;
		char b[128];
		snprintf(b, sizeof(b), "\",\"chars\":%d,\"ticks\":%d,\"seed\":%s,\"tuning\":[", N, Ticks, argv[4]);
		h += b;
		const int *pTune = (const int *)&World.m_Tuning;
		for(int i = 0; i < CTuningParams::Num(); i++)
		{
			snprintf(b, sizeof(b), "%s%d", i ? "," : "", pTune[i]);
			h += b;
		}
		h += "],\"spawns\":[";
		for(int i = 0; i < N; i++)
		{
			snprintf(b, sizeof(b), "%s[\"%08x\",\"%08x\"]", i ? "," : "", Bits(MySpawn[i].x), Bits(MySpawn[i].y));
			h += b;
		}
		h += "]}";
		fprintf(pOut, "%s\n", h.c_str());
	}

	std::vector<int> HookFor(N, 0);
	for(int t = 0; t < Ticks; t++)
	{
		// the inputs of this tick
		for(int i = 0; i < N; i++)
		{
			CNetObj_PlayerInput &In = Inputs[i];
			if(Rnd(25) == 0) In.m_Direction = Rnd(3) - 1;
			if(In.m_Jump) In.m_Jump = Rnd(3) != 0; else In.m_Jump = Rnd(14) == 0;
			if(Rnd(12) == 0)
			{
				float a = Rnd(6283) / 1000.0f;
				int l = Rnd(8) == 0 ? 0 : 20 + Rnd(400);
				In.m_TargetX = (int)(cosf(a) * l);
				In.m_TargetY = (int)(sinf(a) * l);
			}
			if(HookFor[i] > 0)
			{
				if(--HookFor[i] == 0) In.m_Hook = 0;
			}
			else if(Rnd(16) == 0)
			{
				In.m_Hook = 1;
				HookFor[i] = 3 + Rnd(60);
				if(N > 1 && Rnd(2) == 0)
				{
					int j = Rnd(N);
					if(j != i)
					{
						In.m_TargetX = (int)(Cores[j].m_Pos.x - Cores[i].m_Pos.x);
						In.m_TargetY = (int)(Cores[j].m_Pos.y - Cores[i].m_Pos.y);
					}
				}
				else if(Rnd(2) == 0)
				{
					In.m_TargetX = Rnd(400) - 200;
					In.m_TargetY = -100 - Rnd(300);
				}
			}
			if(Rnd(10) == 0) In.m_Fire = (In.m_Fire + 1) & 0x3f;
			if(Rnd(50) == 0) In.m_WantedWeapon = Rnd(6);
		}

		// CCharacter::Tick for each, then CCharacter::TickDefered for each (CGameWorld::Tick)
		for(int i = 0; i < N; i++)
		{
			CNetObj_PlayerInput In = Inputs[i];
			if(In.m_TargetX == 0 && In.m_TargetY == 0)
				In.m_TargetY = -1;
			Cores[i].m_Input = In;
			Cores[i].Tick(true);
		}
		for(int i = 0; i < N; i++)
		{
			Cores[i].Move();
			Cores[i].Quantize();
		}
		std::string Respawn;
		for(int i = 0; i < N; i++)
		{
			int rx = round_to_int(Cores[i].m_Pos.x) / 32, ry = round_to_int(Cores[i].m_Pos.y) / 32;
			bool Clipped = rx < -200 || rx >= Collision.GetWidth()+200 || ry < -200 || ry >= Collision.GetHeight()+200;
			if(Cores[i].m_Death || Clipped)
			{
				char b[64];
				snprintf(b, sizeof(b), "%s[%d,%d]", Respawn.empty() ? "" : ",", i, Clipped ? 1 : 0);
				Respawn += b;
				Cores[i].Reset();
				Cores[i].m_Pos = MySpawn[i];
			}
		}

		std::string o;
		char b[256];
		snprintf(b, sizeof(b), "{\"t\":%d,\"in\":[", t);
		o = b;
		for(int i = 0; i < N; i++)
		{
			const int *p = (const int *)&Inputs[i];
			o += i ? ",[" : "[";
			for(int k = 0; k < (int)(sizeof(CNetObj_PlayerInput)/4); k++)
			{
				snprintf(b, sizeof(b), "%s%d", k ? "," : "", p[k]);
				o += b;
			}
			o += "]";
		}
		o += "],\"c\":[";
		for(int i = 0; i < N; i++)
		{
			const CCharacterCore &c = Cores[i];
			snprintf(b, sizeof(b), "%s[\"%08x\",\"%08x\",\"%08x\",\"%08x\",\"%08x\",\"%08x\",\"%08x\",\"%08x\",%d,%d,%d,%d,%d,%d,%d,%d]",
				i ? "," : "", Bits(c.m_Pos.x), Bits(c.m_Pos.y), Bits(c.m_Vel.x), Bits(c.m_Vel.y), Bits(c.m_HookPos.x), Bits(c.m_HookPos.y),
				Bits(c.m_HookDir.x), Bits(c.m_HookDir.y), c.m_HookTick, c.m_HookState, c.m_HookedPlayer, c.m_Jumped, c.m_Direction,
				c.m_Angle, c.m_Death ? 1 : 0, c.m_TriggeredEvents);
			o += b;
		}
		o += "],\"respawn\":[" + Respawn + "]}";
		fprintf(pOut, "%s\n", o.c_str());
	}
	fclose(pOut);
	fclose(s_pLibm);
	printf("atan2f calls %d, differing from (float)atan2(double): %d; powf calls %d, differing from (float)pow(double): %d\n",
		s_Atan2Calls, s_Atan2Mismatch, s_PowCalls, s_PowMismatch);
	return 0;
}
