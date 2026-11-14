// Oracle replacement for PokerTH's engine/local_engine/tools.cpp. The original draws from
// boost::random_device (non-deterministic): GetRand is boost::uniform_int over [min, max], the shuffle is
// std::random_shuffle. The oracle and the port (web/games/pokerth/src/engine/rng.ts) both use this
// deterministic stream instead, so that the same seed gives the same game in both:
//   xorshift32 (13, 17, 5); GetRand(min, max) = min + next() % (max - min + 1);
//   shuffle = Fisher-Yates from the top, j = next() % (i + 1).
#include "tools.h"
#include <cstdint>

static uint32_t g_state = 1;

void oracle_seed(uint32_t seed) { g_state = seed ? seed : 1; }

static uint32_t next_u32()
{
	uint32_t x = g_state;
	x ^= x << 13;
	x ^= x >> 17;
	x ^= x << 5;
	g_state = x;
	return x;
}

int oracle_rand(int minValue, int maxValue)
{
	return minValue + (int)(next_u32() % (uint32_t)(maxValue - minValue + 1));
}

void Tools::ShuffleArrayNonDeterministic(int *inout, unsigned count)
{
	for (unsigned i = count - 1; i > 0; i--) {
		unsigned j = next_u32() % (i + 1);
		int t = inout[i];
		inout[i] = inout[j];
		inout[j] = t;
	}
}

void Tools::GetRand(int minValue, int maxValue, unsigned count, int *out)
{
	for (unsigned i = 0; i < count; i++) out[i] = oracle_rand(minValue, maxValue);
}
