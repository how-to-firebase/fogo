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
const environments = new Map([
  [production.symbol, production],
  [test.symbol, test],
  [development.symbol, development],
]);
const hosts = new Map([
  ['quiver-four.firebaseapp.com', production.symbol],
  ['localhost', development.symbol],
]);
export default environments.get(hosts.get(location.hostname));
