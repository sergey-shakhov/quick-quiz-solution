#!/bin/sh
cd $1
docker build -t $2/$3:$4 .;
docker images
cd ..
