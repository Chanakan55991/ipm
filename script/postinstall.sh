#!/bin/bash

set -e

echo ">> Downloading bundled Node"
node script/download-node.js

echo
echo ">> Rebuilding ipm dependencies with bundled Node $(./bin/node -p "process.version + ' ' + process.arch")"
./bin/npm rebuild
