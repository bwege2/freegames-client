/* State dumps of the running original: the screen (pixmap) and the game state.
 * The port writes the same layout (web/games/lincity/test/dump.ts). */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "lcconfig.h"
#include "common.h"
#include "lctypes.h"
#include "lin-city.h"
#include "cliglobs.h"
#include "engglobs.h"
#include "pixmap.h"
#include "stats.h"
#include "pbar.h"
#include "power.h"
#include "mouse.h"
#include "module_buttons.h"
#include "mps.h"
#include "screen.h"

extern long real_time;
extern int grid_num, grid_inc;

static FILE *out;
static void w32 (int v) { fwrite (&v, 4, 1, out); }
static void wf (float f) { fwrite (&f, 4, 1, out); }
static void warr (int *a, int n) { int i; for (i = 0; i < n; i++) w32 (a[i]); }

void oracle_dump (const char *name)
{
    char fn[512];
    int i;
    const char *dir = getenv ("ORACLE_OUT");
    snprintf (fn, sizeof fn, "%s/%s.bin", dir ? dir : ".", name);
    out = fopen (fn, "wb");
    if (!out) { perror (fn); exit (3); }
    fwrite ("LCD1", 4, 1, out);
    w32 (pixmap_width); w32 (pixmap_height);
    fwrite (pixmap, 1, pixmap_width * pixmap_height, out);
    fwrite (&map, 1, sizeof (map), out);
    /* engine globals */
    w32 (total_time); w32 (total_money); w32 (people_pool); w32 (housed_population);
    w32 (population); w32 (starving_population); w32 (unemployed_population);
    w32 (tech_level); w32 (highest_tech_level); w32 (unnat_deaths);
    w32 (numof_shanties); w32 (numof_communes); w32 (numof_substations); w32 (numof_markets);
    w32 (numof_health_centres); w32 (max_pop_ever); w32 (total_evacuated); w32 (total_births);
    w32 (income_tax_rate); w32 (coal_tax_rate); w32 (dole_rate); w32 (transport_cost_rate);
    w32 (goods_tax_rate); w32 (export_tax_rate); w32 (import_cost_rate);
    w32 (total_pollution_deaths); w32 (total_starve_deaths); w32 (total_unemployed_days);
    w32 (total_unemployed_years);
    wf (pollution_deaths_history); wf (starve_deaths_history); wf (unemployed_history);
    w32 (university_intake_rate); w32 (power_made); w32 (power_used); w32 (coal_made); w32 (coal_used);
    w32 (goods_made); w32 (goods_used); w32 (ore_made); w32 (ore_used);
    w32 (rockets_launched); w32 (rockets_launched_success); w32 (coal_survey_done);
    w32 (last_built_x); w32 (last_built_y);
    w32 (sust_dig_ore_coal_tip_flag); w32 (sust_port_flag); w32 (sustain_flag);
    w32 (sust_dig_ore_coal_count); w32 (sust_port_count); w32 (sust_old_money);
    w32 (sust_old_money_count); w32 (sust_old_population); w32 (sust_old_population_count);
    w32 (sust_old_tech); w32 (sust_old_tech_count); w32 (sust_fire_count);
    warr (substationx, MAX_NUMOF_SUBSTATIONS); warr (substationy, MAX_NUMOF_SUBSTATIONS);
    warr (marketx, MAX_NUMOF_MARKETS); warr (markety, MAX_NUMOF_MARKETS);
    warr (mappoint_array_x, WORLD_SIDE_LEN); warr (mappoint_array_y, WORLD_SIDE_LEN);
    /* stats */
    w32 (tpopulation); w32 (tstarving_population); w32 (tunemployed_population);
    w32 (income_tax); w32 (coal_tax); w32 (goods_tax); w32 (export_tax); w32 (import_cost);
    w32 (unemployment_cost); w32 (transport_cost); w32 (windmill_cost); w32 (university_cost);
    w32 (recycle_cost); w32 (deaths_cost); w32 (health_cost); w32 (rocket_pad_cost);
    w32 (school_cost); w32 (fire_cost); w32 (cricket_cost); w32 (other_cost);
    w32 (ly_income_tax); w32 (ly_coal_tax); w32 (ly_goods_tax); w32 (ly_export_tax);
    w32 (ly_import_cost); w32 (ly_other_cost); w32 (ly_unemployment_cost); w32 (ly_transport_cost);
    w32 (ly_fire_cost); w32 (ly_university_cost); w32 (ly_recycle_cost); w32 (ly_school_cost);
    w32 (ly_deaths_cost); w32 (ly_health_cost); w32 (ly_rocket_pad_cost); w32 (ly_interest);
    w32 (ly_windmill_cost); w32 (ly_cricket_cost);
    w32 (food_in_markets); w32 (jobs_in_markets); w32 (coal_in_markets); w32 (goods_in_markets);
    w32 (ore_in_markets); w32 (steel_in_markets); w32 (waste_in_markets);
    w32 (tfood_in_markets); w32 (tjobs_in_markets); w32 (tcoal_in_markets); w32 (tgoods_in_markets);
    w32 (tore_in_markets); w32 (tsteel_in_markets); w32 (twaste_in_markets);
    for (i = 0; i < NUM_PBARS; i++) {
        w32 (pbars[i].oldtot); w32 (pbars[i].tot); w32 (pbars[i].diff); w32 (pbars[i].data_size);
        warr (pbars[i].data, PBAR_DATA_SIZE);
    }
    w32 (monthgraph_size);
    warr (monthgraph_pop, monthgraph_size); warr (monthgraph_starve, monthgraph_size);
    warr (monthgraph_nojobs, monthgraph_size); warr (monthgraph_ppool, monthgraph_size);
    /* power grids */
    w32 (grid_num); w32 (grid_inc);
    for (i = 1; i <= grid_num; i++) {
        w32 (grid[i]->power_lines); w32 ((int) grid[i]->total_power); w32 ((int) grid[i]->avail_power);
        w32 ((int) grid[i]->max_power); w32 ((int) grid[i]->demand); w32 (grid[i]->powered);
    }
    /* client state */
    w32 ((int) real_time); w32 (main_screen_originx); w32 (main_screen_originy);
    w32 (selected_module); w32 (selected_module_type); w32 (selected_module_group); w32 (selected_module_cost);
    w32 (cs_mouse_x); w32 (cs_mouse_y); w32 (mouse_type); w32 (mouse_hide_count);
    w32 (help_flag); w32 (prefs_flag); w32 (market_cb_flag); w32 (port_cb_flag); w32 (db_flag); w32 (db_okflag);
    w32 (pause_flag); w32 (slow_flag); w32 (med_flag); w32 (fast_flag); w32 (cheat_flag);
    w32 (mini_screen_flags); w32 (main_screen_flag); w32 (mps_global_style); w32 (monthgraph_style);
    w32 (overwrite_transport_flag); w32 (suppress_popups); w32 (time_multiplex_stats); w32 (confine_flag);
    warr (module_help_flag, NUMOF_MODULES);
    { extern const unsigned char *oracle_palette (void); fwrite (oracle_palette (), 1, 768, out); }
    fwrite ("END!", 4, 1, out);
    fclose (out);
}
