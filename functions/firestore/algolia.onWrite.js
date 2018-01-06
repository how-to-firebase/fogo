const { algoliaUtil } = require('../utils');

module.exports = ({ environment }) => event => {
  const client = algoliaUtil(environment);
  const index = client.initIndex(environment.indexes.uploads);
  const id = event.data.id;
  const data = (event.data.exists && event.data.data()) || null;

  let promise;

  if (!data) {
    promise = index.deleteObject(id);
  } else {
    const { search } = data;
    const record = Object.assign({ objectID: id }, { search });
    promise = index.addObject(record);
  }

  return promise;
};
