const { adminUtil } = require('../utils');

module.exports = ({ environment }) => event => {
  const { admin } = adminUtil(environment);
  const { md5Hash, name, resourceState } = event.data;
  const { nodeEnv } = environment;
  const path = name.split('/');
  const filename = path.pop();

  if (path.includes('test') || !path.includes('uploads')) {
    return Promise.resolve({ skipped: true });
  } else {
    const { adminUtil, collectionsUtil } = require('../utils');
    const admin = adminUtil(environment);
    const uploads = collectionsUtil(environment).get('uploads');
    const doc = admin
      .firestore()
      .collection(uploads)
      .doc(`${nodeEnv}-${md5Hash}`);
    const file = admin.storage().bucket().file(name);

    if (resourceState == 'exists') {
      const payload = Object.assign(event.data, environment.env);
      return file.download().then(data => {
        console.log('data', data);
        return doc.set(payload, { merge: true }).then(() => payload);
      });      
    } else if (resourceState == 'not_exists') {
      return doc
        .get()
        .then(doc => {
          const { versions } = doc.data();
          return Promise.all(
            Object.keys(versions).map(key => {
              const { name } = versions[key];
              return admin
                .storage()
                .bucket()
                .file(name)
                .delete();
            })
          );
        })
        .then(() => doc.delete());
    }
  }
};

function getFirst512Bytes(params) {
  
}
