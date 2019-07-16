const algoliasearch = require('algoliasearch');
let singleton;

module.exports = ({ algolia }) => {
  if (!singleton) {
    const { applicationId, apiKey } = algolia;
    singleton = algoliasearch(applicationId, apiKey);
  }
  return singleton;
};
