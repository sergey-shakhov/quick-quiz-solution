#!/bin/sh
mkdir -p ~/.docker
cat <<EOF > ~/.docker/config.json
{
  "auths": {
    "docker.gnivc.ru": {
      "auth": "$1"
    }
  }
}
EOF
docker push docker.gnivc.ru/$2:$3
