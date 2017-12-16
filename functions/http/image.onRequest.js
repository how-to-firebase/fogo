const request = require('request');

module.exports = ({ environment }) => (req, res) => {
  const { md5Hash, width } = req.query;
  const { adminUtil, collectionsUtil } = require('../utils');
  const uploads = collectionsUtil(environment).get('uploads');
  const doc = admin
    .firestore()
    .collection(uploads)
    .doc(md5Hash);

  doc.get(doc => {
    const data = doc.data();
    if (!data) {
      res.send(404);
    } else {
      const versions = data.versions || {};
      const version = versions[width || 'original']
      if (version) {
        request(version).pipe(res);
      } else {
        // get link to original if missing
        // create a size if it doesn't exist
        // pipe it out
      }
    }
  });
};
