module.exports = environment => {
  return new Map(Object.keys(environment.collections).map(key => [
    key,
    environment.collections[key],
  ]));
};
