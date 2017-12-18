const path = require('path');
const request = require('request');
const { exec } = require('child_process');

function getError(req, res) {
  const { width } = req.query;
  const widthInt = parseInt(width);
  let error;

  if (String(widthInt) != width) {
    error = `Width must be an integer: ${width}`;
    res.status(500);
    res.send(error);
  }
  return error;
}

function getSignedUrl(file) {
  return file
    .getSignedUrl({ action: 'read', expires: `01-01-${new Date().getFullYear() + 20}` })
    .then(([url]) => url);
}

module.exports = ({ environment }) => (req, res) => {
  const error = getError(req, res);
  if (error) {
    return Promise.reject(error);
  } else {
    const { md5Hash, width } = req.query;
    const { adminUtil, collectionsUtil } = require('../utils');
    const admin = adminUtil(environment);
    const uploads = collectionsUtil(environment).get('uploads');
    const doc = admin
      .firestore()
      .collection(uploads)
      .doc(md5Hash);

    return doc.get().then(doc => {
      if (!doc.exists) {
        res.sendStatus(404);
      } else {
        const data = doc.data();
        const filename = data.name;
        const versions = data.versions || {};
        const versionName = width || 'original';
        const version = versions && versions[versionName];

        if (version) {
          return version;
        } else {
          const bucket = admin.storage().bucket();
          const file = bucket.file(filename);

          if (versionName == 'original') {
            return getSignedUrl(file).then(url => {
              versions.original = url;
              return doc.ref.update({ versions }).then(() => url);
            });
          } else {
            const widthInt = parseInt(width);
            const destination = `tmp/${path.parse(file.name).base}`;
            const cmd = `convert ${destination} -resize ${widthInt}\> ${destination}`;

            file
              .download({ destination })
              .catch(error => {
                console.error('Failed to download file', error);
                res.status(500);
              })
              .then(() => {
                
                return new Promise((resolve, reject) => {
                  exec(cmd, (error, stdout) => (error ? reject(error) : resolve(stdout)));
                });
              })
              .then(() => {
                const filenameParts = filename.split('/');
                filenameParts.splice(filenameParts.length - 1, 0, width);
                const resizedFilename = filenameParts.join('/');
                const file = bucket.file(resizedFilename);
                return file.upload(destination).then(() => file);
              })
              .then(file => getSignedUrl(file))
              .then(url => {
                versions.original = url;
                return doc.ref.update({ versions }).then(() => url);
              });
          }

          // get link to original if missing
          // create a size if it doesn't exist
          // pipe it out
        }
      }
    });
  }
};
