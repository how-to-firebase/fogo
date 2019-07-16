# App

All app code lives in `/app`.

You can run all of the code without Docker... but it's so nice and clean to use Docker. So [install Docker](https://docs.docker.com/install/) and love your life just a little bit more.

### Environment Variables

You'll need `FIREBASE_TOKEN` in your environment variables. Run `yarn ci:login` to generate the token. Then add it to `dev/workspace/env.list`. Look to `dev/workspace/env.list.dist` for the format.

See the later section on _Vault_ to use the included [HashiCorp Vault](https://www.vaultproject.io/) implementation to secure your secrets.

# VSCode

This app is configured to run using [VSCode Containers](https://code.visualstudio.com/docs/remote/containers).

Install [VSCode's Remote Development Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack)

The type `cmd + shift + p` and search for `Remote-Containers: Reopen Folder in Container`. This will open the project in a _Dockerized_ development environment.

### Like Docker but not VSCode?

Try running `yarn dev` to boot up the _Dockerized_ workspace from the command line.

# Vault

This project is run using `docker-compose` to orchestrate the Docker containers.

Vault is a fantastic way to secure secrets. It's massive overkill for this particular app... but it's a nice example of an enterprise-grade secrets implementation for front-end development.

### Service Account

- Log into the [GCP IAM console](https://console.cloud.google.com/iam-admin/serviceaccounts?authuser=2&cloudshell=true&project=chris-esplin)
- Create a service account with the `roles/storage.objectAdmin`, a.k.a. _Storage Object Admin_ permissions
- Create a `json` key and download it.
- Copy your `*.json` key to `./dev/vault/service-account.json`

### Environment Variables

Copy `dev/vault/env.list.dist` and get rid of the `.dist` suffix. Fill in the values with whatever you generated from the vault.

If you used more than one key, add them to `env.list` and edit `dev/vault/bin/unseal.sh` to provide the keys to the `vault operator unseal` function.

### GCP Back End

Edit `./dev/vault/vault.config.json` and change the `gcs` bucket to a bucket that you own and that is controlled by your `service-account.json`.

# Docker Compose

### Run All Servers

- Run all servers with `docker-compose up`.
- Run in daemon mode with `docker-compose up -d`.
- Bring daemons down out with `docker-compose down`.
- List running daemons with `docker-compose ps`.

### Run Vault

- Connect to a running `vault` daemon with `docker exec -it vault sh`.
- Watch daemon logs with `docker-compose logs -f vault`.
- Get shell access to the `vault` container with `sh bin/interactive-vault.sh`.
- Run just Vault with `sh ./bin/run-vault.sh`.

### Extract Secrets

Run `sh bin/vault/copy-vault-keys.sh` or `powershell bin/vault/copy-vault-keys.ps1` to extract vault keys and expand secrets to separate files within `./app/vault/`.

Do with these secrets files as you may.

# Deploy

You'll need to sort out your [Cloud Build triggers](https://console.cloud.google.com/cloud-build/builds).

See below for a nice example trigger configuration. It's set up to look for pushes to a `prod` branch.

Push to your `master` branch to `prod` with `git push origin master:prod`.

![Cloud Build trigger example](https://content.screencast.com/users/ChrisEsplin/folders/Snagit/media/954f0a09-f88f-4b96-8d3d-216349bdfedc/07.13.2019-08.58.png)
