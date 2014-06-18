#!/bin/sh

rm -rf overlay-game-over.zip
rm -rf to-release
cp -RL ../overlay-game-over/chrome/ to-release
rm -rf to-release/prepapre.sh
zip -r overlay-game-over.zip to-release/*
