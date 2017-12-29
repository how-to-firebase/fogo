const { adminUtil, collectionsUtil } = require('../utils');
const exifParser = require('exif-parser');

module.exports = ({ environment }) => event => {
  const { md5Hash, name, resourceState } = event.data;
  const path = name.split('/');

  if (shouldSkip(path)) {
    return Promise.resolve({ skipped: true });
  } else {
    const admin = adminUtil(environment);
    const { doc, ref } = getDocAndRef(admin, environment, md5Hash);
    const file = getFile(admin, name);

    return resourceState == 'not_exists'
      ? deleteFile(admin, doc, ref)
      : getExif(file)
          .then(exif => getPayload(event.data, environment.env, exif, path))
          .then(payload =>
            doc
              .set(payload, { merge: true })
              .then(() => ref.set(Date.now()))
              .then(() => payload)
          );
  }
};

function getDocAndRef(admin, environment, md5Hash) {
  const uploads = collectionsUtil(environment).get('uploads');
  const { nodeEnv } = environment;
  const doc = admin
    .firestore()
    .collection(uploads)
    .doc(`${nodeEnv}-${md5Hash}`);
  const ref = admin
    .database()
    .ref(nodeEnv)
    .child(uploads)
    .child(md5Hash);
  return { doc, ref };
}

function getFile(admin, name) {
  return admin
    .storage()
    .bucket()
    .file(name);
}

function shouldSkip(path) {
  return path.includes('test') || !path.includes('uploads');
}

function getExif(file) {
  return file.download({ start: 0, end: 1024 }).then(([buffer]) => {
    let exif = {};
    try {
      exif = exifParser.create(buffer).parse();
    } catch (e) {
      console.log('exif parsing error', e);
    }
    return exif;
  });
}
function getPayload(data, env, exif, path) {
  const payload = Object.assign(data, env, { environment: path[0], created: Date.now() });
  return mergeExif(payload, exif);
}

function mergeExif(payload, exif) {
  const { tags } = exif;
  let merged = payload;

  if (tags && tags.CreateDate) {
    merged = Object.assign({ CreateDate: tags.CreateDate || Date.now(), tags }, payload);
  }
  return merged;
}

function deleteFile(admin, doc, ref) {
  return doc
    .get()
    .then(doc => {
      const { versions } = doc.data();
      return Promise.all(
        Object.keys(versions || {})
          .map(key => versions[key])
          .map(version => {
            return admin
              .storage()
              .bucket()
              .file(version.name)
              .delete();
          })
      );
    })
    .catch(error => {
      console.error(error);
      return true;
    })
    .then(() => Promise.all([doc.delete(), ref.remove()]));
}
