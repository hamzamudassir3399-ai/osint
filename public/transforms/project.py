#!/usr/bin/env python3
"""
Maltego Local Transform Server - OSINT Tweet & URL Analysis
============================================================
Entry point for the local transform server.
Run with: python project.py local
"""

import sys
import transforms

from maltego_trx.server import app, application
from maltego_trx.handler import handle_run
from maltego_trx.registry import register_transform_classes

# Auto-discover all transform classes in the transforms/ package
register_transform_classes(transforms)

# Start the transform server
handle_run(__name__, sys.argv, app)
