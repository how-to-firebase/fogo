# fogo

A live, working demo app to showcase Firebase's web features

## Install Node.js

Use the [official Node.js install instructions](https://nodejs.org/en/download/) to get your
Node on your system. Once you can run `node --version` in your command line, you're good to go.

I recommend the latest LTS version of Node.js. Even-numbered version of Node are the long-term
support (LTS) versions. The Odd-numbered versions are the bleeding edge. I'm using v8.9.1 as of
this writing. I'll stay on the 8.x branch until the 10.x branch ships.

I use [nvs](https://github.com/jasongin/nvs) and `.node-version` files to manage Node versions.
This matters because the tests run in `/functions` need to be run in the version of Node that
Cloud Functions uses, and that version has historically lagged the most recent LTS version.
See `/functions/.node-version`.

## Install your package manager of choice

You can use either [Yarn](https://yarnpkg.com/lang/en/docs/install/) or
[NPM](https://www.npmjs.com/get-npm). They should both work; however, I'm using yarn as of this
writing, because I'm a hipster like that.

> Run a quick check to make sure you have everything before moving on.

```bash
yarn --version #should read out a version number
```

## Clone the repo

Open your command line and `cd` to your favorite development directory. Then clone the repo:

```bash
git clone https://github.com/how-to-firebase/fogo.git
cd fogo
```

## Install dependencies

Node.js packages install their dependencies into `/node_modules`. This can be done with
Yarn or NPM.

```bash
# Using Yarn
yarn
```

```bash
# Using NPM
npm install
```

## Edit environment files

There are two "dist" environment files, `/src/environment.js.dist` and
`/functions/config.json.dist`.

Make sure to copy each dist file without the `.dist` at the end, and edit it to match your
development and deploy environments. For instance, you'll need to modify the Firebase details to
point to your own target Firebase instance. You'll also need an Algolia.com account with the
appropriate API keys, or you won't get any search.

Notice that `/src/environment.js.dist` has a `howtofirebase` environment. This is because I like to
host multiple sites on a single Firebase instance. I built this app to run dynamically in different
"environments" based on `location.hostname`. So you can make up as many environments as you like in
`/src/environment.js` and assign them to hostnames as necessary. Mix and match. It's fun!

## Serve it up locally

This project uses package scripts from `/package.json`.

[Read the docs](https://yarnpkg.com/lang/en/docs/cli/run/) if you're fuzzy on package scripts.

Run `yarn start` and you should see something like this:

```
Compiled successfully!

You can view the application in browser.

Local:            http://localhost:8080
On Your Network:  http://192.168.1.25:8080
```

Now open the application up in your browser and you're live!

## Deploy

You can deploy to your own Firebase project by installing the Firebase CLI
with `yarn global add firebase-tools` and running `firebase init`. Once Firebase is initialized to
your own project you'll notice a new file--`/.firebaserc`--that should point to your project.

Run `yarn deploy` to deploy the whole app, or see the scripts listed in `/package.json` for more
options.

## Questions? Bugs?

This app needs to be immaculate. Bulletproof. Perfect.

Please file issues for questions, bug reports... anything.

If in doubt, file an issue and I'll get right on it!
