"""python3 -I re/openclonk/tools/translate.py [--out DIR]: runs the translator (cpp2ts/) on work/ast/."""
import os
import runpy
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
runpy.run_module('cpp2ts', run_name='__main__')
