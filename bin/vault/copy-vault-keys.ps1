docker-compose exec vault sh /dev/vault/bin/unseal.sh
docker-compose exec vault sh /dev/vault/bin/copy.sh
docker-compose exec vault sh /dev/vault/bin/seal.sh

node "$PWD\bin\vault\expand-secrets.js"