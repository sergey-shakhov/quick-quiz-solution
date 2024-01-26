#!/bin/sh

cd qq/qq-backend

export API_KEY=`cat scripts/create_backend_API_KEY`
export DB_PASSWORD=`cat scripts/create_backend_DB_PASSWORD`
export HOST=`cat scripts/create_backend_HOST`
export BRANCH=`cat scripts/create_backend_BRANCH`
export DOCKER_REGISTRY=`cat scripts/create_backend_DOCKER_REGISTRY`

scripts/create_backend_config.sh $API_KEY $DB_PASSWORD $HOST

scripts/create_backend_compose_file.sh $DOCKER_REGISTRY $BRANCH

docker-compose pull
docker-compose up -d
DANGLINGS=$(docker images -f 'dangling=true' | grep qq-back | awk '{print $3}');
if [ -n "${DANGLINGS}" ]; then
  echo DANGLINGS: $DANGLINGS;
  docker rmi $DANGLINGS;
fi
