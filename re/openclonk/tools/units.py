"""python3 -I tools/units.py [--aul|--sim]: the unit list (units.txt, units-aul.txt or units-sim.txt) with its globs expanded"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cpp2ts.config import UNIT_LIST  # noqa: E402

print('\n'.join(UNIT_LIST))
