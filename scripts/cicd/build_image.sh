#!/bin/sh
cd $1
docker build -t docker.gnivc.ru/$2:$3 .;
docker images
cd ..
