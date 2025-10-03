#!/bin/bash
cd /home/kavia/workspace/code-generation/memory-match-game-146967-146976/react_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

