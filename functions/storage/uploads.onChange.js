module.exports = ({ environment }) => event => {
  const { md5Hash, name } = event.data;
  const path = name.split('/');
  const filename = path.pop();

  if (!path.includes('uploads')) {
    return Promise.resolve({ skipped: true });
  } else {
    const { adminUtil, collectionsUtil } = require('../utils');
    const admin = adminUtil(environment);
    const uploads = collectionsUtil(environment).get('uploads');
    const doc = admin
      .firestore()
      .collection(uploads)
      .doc(md5Hash);
    const payload = Object.assign(event.data, environment.env);
    return doc.set(payload).then(() => payload);
  }
};
