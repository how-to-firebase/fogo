# fogo

A live, working demo app to showcase Firebase's web features

## Install Node.js

Use the [official Node.js install instructions](https://nodejs.org/en/download/) to get your
Node on your system. Once you can run ```node --version``` in your command line, you're good to go.

I recommend the latest LTS version of Node.js. Even-numbered version of Node are the long-term 
support (LTS) versions. The Odd-numbered versions are the bleeding edge. I'm using v8.9.1 as of 
this writing. I'll stay on the 8.x branch until the 10.x branch ships.

## Install Yarn

You can use either [Yarn](https://yarnpkg.com/lang/en/docs/install/) or 
[NPM](https://www.npmjs.com/get-npm). They should both work; however, I'm using yarn as of this 
writing, because I'm a hipster like that.

> Run a quick check to make sure you have everything before moving on.

```bash
yarn --version #should read out a version number
```


## Clone the repo

Open your command line and ```cd``` to your favorite development directory. Then clone the repo:

```bash
git clone https://github.com/how-to-firebase/fogo.git
cd fogo
```


## Install dependencies

Node.js packages install their dependencies into ```/node_modules```. This can be done with 
Yarn or NPM.

```bash
# Using Yarn
yarn
```

```bash
# Using NPM
npm install
```

## Serve it up locally

This project uses packages scripts from ```/package.json```. 

[Read the docs](https://yarnpkg.com/lang/en/docs/cli/run/) if you're fuzzy on package scripts.

Run ```yarn start``` and you should see something like this:

```
Compiled successfully!

You can view the application in browser.

Local:            http://localhost:8080
On Your Network:  http://192.168.1.25:8080

```

Now open the application up in your browser and we're done!

