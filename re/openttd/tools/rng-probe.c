/* OpenTTD 15.3's Randomizer, transcribed from src/core/random_func.cpp for the
 * test fixtures. This is not a second implementation of the game: it only
 * gives the port's tests the exact 32-bit sequence of the pinned source.
 * Build and run: gcc -O2 -o /tmp/rng rng-probe.c && /tmp/rng
 */
#include <stdint.h>
#include <stdio.h>

typedef struct { uint32_t state[2]; } Randomizer;

static uint32_t rotr32(uint32_t v, unsigned n) { return (v >> n) | (v << (32 - n)); }

static uint32_t next(Randomizer *r)
{
	const uint32_t s = r->state[0];
	const uint32_t t = r->state[1];
	r->state[0] = s + rotr32(t ^ 0x1234567F, 7) + 1;
	return r->state[1] = rotr32(s, 3) - 1;
}

static void set_seed(Randomizer *r, uint32_t seed) { r->state[0] = seed; r->state[1] = seed; }

static uint32_t range(Randomizer *r, uint32_t limit)
{
	return (uint32_t)(((uint64_t)next(r) * (uint64_t)limit) >> 32);
}

int main(void)
{
	const uint32_t seeds[] = {0, 1, 12345, 0xDEADBEEF};
	for (unsigned i = 0; i < sizeof(seeds) / sizeof(seeds[0]); i++) {
		Randomizer r;
		set_seed(&r, seeds[i]);
		printf("seed %u:", seeds[i]);
		for (int j = 0; j < 8; j++) printf(" %u", next(&r));
		printf(" | range 0..100:");
		set_seed(&r, seeds[i]);
		for (int j = 0; j < 8; j++) printf(" %u", range(&r, 100));
		printf("\n");
	}
	return 0;
}
