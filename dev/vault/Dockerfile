FROM vault

ENV GOOGLE_APPLICATION_CREDENTIALS="/dev/vault/service-account.json"
ENV VAULT_ADDR='http://0.0.0.0:8200'

CMD ["vault", "server", "-config", "/dev/vault/vault.config.json"]