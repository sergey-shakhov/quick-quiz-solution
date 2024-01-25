#/bin/sh
cat <<EOF > .env
REACT_APP_BASE_API_URL=http://$1:8080
EOF
