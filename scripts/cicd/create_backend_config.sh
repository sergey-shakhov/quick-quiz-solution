#/bin/sh
cat <<EOF > qq.config.yaml
service:
  apiKey: $1
  # templateDirectory: ./templates

database:
  connectionUrl: postgres://qq_user:$2@$3:5432/qq_db

notifications:
  smtp:
    from: qq-no-reply@your-organization.online
    organizerEmail: admin@your-organization.online
    host: smtp.yourserver.address
    port: 25
    username: 'your-smtp-user-name'
    password: 'your-smtp-password'
    secure: false
    tlsRejectUnauthorized: false
EOF
