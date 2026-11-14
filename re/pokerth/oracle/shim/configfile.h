// Oracle shim for PokerTH's ConfigFile: readConfigInt of a missing key is 0 like the original
// (configfile.cpp: readConfigInt parses an empty string), and "EngineVersion" is not in 1.1.2's config list.
#ifndef CONFIGFILE_H
#define CONFIGFILE_H
#include <string>
class ConfigFile {
public:
	int readConfigInt(std::string) const { return 0; }
	std::string readConfigString(std::string) const { return ""; }
};
#endif
