#!/bin/bash

rm -rf bin/ dist/

mkdir -p bin
mkdir -p dist

./node_modules/.bin/tsc

cp ./package.json ./dist/

pkg --output ./bin/qq-backend -t node16-linux ./dist/index.js --options max_old_space_size=8192
