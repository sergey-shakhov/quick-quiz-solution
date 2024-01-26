#!/bin/sh
mkdir -p ~/.docker
cat <<EOF > ~/.docker/config.json
{
  "auths": {
    "$2": {
      "auth": "$1"
    }
  }
}
EOF
docker push $2/$3:$4
