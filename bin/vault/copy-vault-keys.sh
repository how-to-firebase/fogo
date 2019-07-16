CURRENT_PATH="`dirname \"$0\"`"
CURRENT_PATH="`( cd \"$CURRENT_PATH\" && pwd )`"
if [ -z "$CURRENT_PATH" ] ; then
  exit 1
fi

docker-compose exec vault sh /dev/vault/bin/unseal.sh
docker-compose exec vault sh /dev/vault/bin/copy.sh
docker-compose exec vault sh /dev/vault/bin/seal.sh
node $CURRENT_PATH/expand-secrets.js