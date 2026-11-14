// Oracle shim for PokerTH's core/loghelper.h: errors go to stderr.
#ifndef LOGHELPER_H
#define LOGHELPER_H
#include <iostream>
#include <sstream>
#define LOG_ERROR(_e) do { std::ostringstream o_; o_ << _e; std::cerr << "LOG_ERROR " << o_.str() << std::endl; } while(false)
#define LOG_MSG(_e) do {} while(false)
#define LOG_VERBOSE(_e) do {} while(false)
#endif
