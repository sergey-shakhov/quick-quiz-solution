#/bin/sh
cat <<EOF > docker-compose.yml
version: "3.7"
services:

  backend:
    container_name: qq-backend
    image: $1/qq-backend:$2
    ports:
      - "8080:8080"
    volumes:
      - ./qq.config.yaml:/qq-backend/etc/qq.config.yaml
    restart: always
EOF
