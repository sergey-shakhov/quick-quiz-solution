#/bin/sh
cat <<EOF > docker-compose.yml
version: "3.7"
services:

  frontend:
    container_name: qq-frontend
    image: $1/qq-frontend:$2
    env_file: .env
    ports:
      - "3000:3000"
    restart: always
EOF
