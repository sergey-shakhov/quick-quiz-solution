#!/bin/sh

cd qq/qq-frontend

export HOST=`cat scripts/create_frontend_HOST`
export BRANCH=`cat scripts/create_frontend_BRANCH`
export DOCKER_REGISTRY=`cat scripts/create_frontend_DOCKER_REGISTRY`

scripts/create_frontend_env.sh $HOST

scripts/create_frontend_compose_file.sh $DOCKER_REGISTRY $BRANCH

docker-compose pull
docker-compose up -d
DANGLINGS=$(docker images -f 'dangling=true' | grep qq-front | awk '{print $3}');
if [ -n "${DANGLINGS}" ]; then
  echo DANGLINGS: $DANGLINGS;
  docker rmi $DANGLINGS;
fi