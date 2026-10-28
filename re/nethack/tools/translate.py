"""Runs the translator (the package c2ts next to this file): python3 -I translate.py [args]"""
import os
import runpy
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
runpy.run_module('c2ts', run_name='__main__', alter_sys=True)
