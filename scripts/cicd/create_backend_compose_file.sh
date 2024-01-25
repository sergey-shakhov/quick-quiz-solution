#/bin/sh
cat <<EOF > docker-compose.yml
version: "3.7"
services:

  backend:
    container_name: qq-backend
    image: docker.gnivc.ru/qq-backend:$1
    ports:
      - "8080:8080"
    volumes:
      - ./qq.config.yaml:/qq-backend/etc/qq.config.yaml
    restart: always
EOF
