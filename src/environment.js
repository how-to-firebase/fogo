// Environment Variables
const production = {
  symbol: Symbol('production'),
};
const test = {
  symbol: Symbol('test'),
};
const development = {
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
