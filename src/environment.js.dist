// Environment Variables
const defaults = {
  collections: {
    uploads: 'uploads',
  },
  urls: {
    image: 'https://us-central1-quiver-four.cloudfunctions.net/image'
  }
};
const production = {
  ...defaults,
  symbol: Symbol('production'),
};
const test = {
  ...defaults,
  symbol: Symbol('test'),
};
const development = {
  ...defaults,
  symbol: Symbol('development'),
  storage: { path: 'development/uploads' },
};

// Lookup Maps
const environments = new Map([
  [production.symbol, production],
  [test.symbol, test],
  [development.symbol, development],
]);
const hosts = new Map([
  ['quiver-four.firebaseapp.com', production.symbol],
  ['localhost', development.symbol],
]);

// Lookup by location.hostname
export default environments.get(hosts.get(location.hostname));
