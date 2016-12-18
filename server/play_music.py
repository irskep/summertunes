# -*- coding: utf-8 -*-
# This file is part of beets.
# Copyright 2016, David Hamp-Gonsalves
#
# Permission is hereby granted, free of charge, to any person obtaining
# a copy of this software and associated documentation files (the
# "Software"), to deal in the Software without restriction, including
# without limitation the rights to use, copy, modify, merge, publish,
# distribute, sublicense, and/or sell copies of the Software, and to
# permit persons to whom the Software is furnished to do so, subject to
# the following conditions:
#
# The above copyright notice and this permission notice shall be
# included in all copies or substantial portions of the Software.

"""Send the results of a query to the configured music player as a playlist.
"""
from __future__ import division, absolute_import, print_function
import logging
from tempfile import NamedTemporaryFile
from subprocess import Popen

log = logging.getLogger(__name__)

# Indicate where arguments should be inserted into the command string.
# If this is missing, they're placed at the end.
ARGS_MARKER = '$args'


DEFAULT_CONFIG = {
    'command': 'mpv --playlist',
    'raw': False,
}

def _create_tmp_playlist(paths_list):
    """Create a temporary .m3u file. Return the filename.
    """
    m3u = NamedTemporaryFile('wb', suffix='.m3u', delete=False)
    for item in paths_list:
        m3u.write(item + b'\n')
    m3u.close()
    return m3u.name

def play_music(lib, config, paths):
    command = ['mpv', '--quiet', '--audio-display=no', '--playlist', _create_tmp_playlist(paths)]
    print(command)
    return Popen(command)
