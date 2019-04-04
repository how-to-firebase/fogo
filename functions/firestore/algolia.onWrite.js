const { algoliaUtil } = require('../utils');

let hasSetSettings = false;

module.exports = ({ environment }) => (change, { params }) => {
  const client = algoliaUtil(environment);
  const index = client.initIndex(environment.indexes.uploads);
  const id = params.id;
  const data = change.after.data();

  let promise = Promise.resolve();

  if (!data) {
    promise = index.deleteObject(id);
  } else if (!data.isTest) {
    const { environment, filename, tags, versions } = data;
    const tagsArray = Object.keys(tags || {});
    const record = { objectID: id, environment, filename, versions };

    if (tagsArray.length) {
      record.tags = tagsArray;
    }

    promise = index.addObject(record);
  }

  return promise.then(() => {
    let promise = true;
    if (!hasSetSettings) {
      const { settings } = environment.algolia;
      hasSetSettings = true;
      promise = index.setSettings(settings);
    }
    return true;
  });
};
