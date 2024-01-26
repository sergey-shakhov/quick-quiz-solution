#!/bin/sh
cd $1
echo $2 > .npmrc
echo "always-auth = true" >> .npmrc
echo $3 >> .npmrc
rm -f yarn.lock; yarn;
cd ..
