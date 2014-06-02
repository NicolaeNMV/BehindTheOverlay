#!/bin/sh

cp -r ../overlay-game-over to-release
rm -rf to-release/.git
rm -rf to-release/test
rm -rf to-release/.DS_Store
rm -rf to-release/.gitignore
zip -r overlay-game-over.zip to-release/* 
