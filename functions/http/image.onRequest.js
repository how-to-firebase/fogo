const fs = require('fs');
const path = require('path');
const request = require('request');
const { exec } = require('child_process');
const { adminUtil, collectionsUtil } = require('../utils');

module.exports = ({ environment }) => (req, res) => {
  const error = getError(req, res);
  if (error) {
    return handleError(res, 500, error);
  } else {
    const { record, width } = req.query;
    const { admin, uploads } = getEnvironmentDependencies(environment);
    const doc = getDoc(admin, uploads, record);

    return doc
      .get()
      .catch(error => handleError(res, 500, error))
      .then(doc => {
        if (!doc.exists) {
          return handleError(res, 404, 'Not Found');
        } else {
          const version = getVersion(doc);
          const admin = adminUtil(environment);

          return (
            version ||
            createNewVersion(admin, doc, width).catch(error => handleError(res, 500, error))
          );
        }
      })
      .then(version => {
        res.status(200);
        res.send(version.url);
        return version;
      });
  }
};

function getError(req) {
  const { width } = req.query;
  const widthInt = parseInt(width);
  let error;

  if (width && String(widthInt) != width) {
    error = `Width must be an integer: ${width}`;
  }
  return error;
}

function handleError(res, type, error) {
  res.status(type);
  res.send(error);
  return Promise.reject(error);
}

function getEnvironmentDependencies(environment) {
  const admin = adminUtil(environment);
  const uploads = collectionsUtil(environment).get('uploads');

  return { admin, uploads };
}

function getDoc(admin, uploads, record) {
  return admin
    .firestore()
    .collection(uploads)
    .doc(record);
}

function getVersion(doc) {
  const data = doc.data();
  const versions = data.versions || {};
  const versionName = getVersionName(doc);
  return versions && versions[versionName];
}

function createNewVersion(admin, doc, width) {
  const versionName = getVersionName(width);
  const filename = getFilename(doc);
  const file = getFile(admin, filename);

  return Promise.resolve()
    .then(() => {
      if (versionName == 'original') {
        return file;
      } else {
        return convertFile(admin, file, width);
      }
    })
    .then(file => getSignedUrl(file).then(url => ({url, name: file.name})))
    .then(version => saveDoc(doc, versionName, version));
}

function getVersionName(width) {
  return width || 'original';
}

function getFilename(doc) {
  const { name } = doc.data();
  return name;
}

function convertFile(admin, file, width) {
  const filename = file.name;
  const localFilename = getLocalFilename(filename);

  return file
    .download({ destination: localFilename })
    .then(() => convertLocalFile(localFilename, width))
    .then(() => {
      const destination = getDestination(filename, width);
      const newFile = getFile(admin, destination);

      return newFile.bucket
        .upload(localFilename, { destination })
        .then(() => unlinkPromise(localFilename))
        .then(() => newFile);
    });
}

function getLocalFilename(filename) {
  return `/tmp/${path.parse(filename).base}`;
}

function convertLocalFile(localFilename, width) {
  const cmd = getCmd(localFilename, width);
  return execPromise(cmd);
}

function getCmd(localFilename, width) {
  const widthInt = parseInt(width);
  return `convert ${localFilename} -resize ${widthInt}\\> ${localFilename}`;
}

function execPromise(cmd) {
  return new Promise((resolve, reject) =>
    exec(cmd, (error, stdout) => (error ? reject(error) : resolve(stdout)))
  );
}

function getDestination(filename, width) {
  const filenameParts = filename.split('/');
  filenameParts[filenameParts.length - 2] = width;
  return filenameParts.join('/');
}

function getFile(admin, filename) {
  return admin
    .storage()
    .bucket()
    .file(filename);
}

function unlinkPromise(localFilename) {
  return new Promise(
    (resolve, reject) => fs.unlink(localFilename, err => err && reject(err)) || resolve()
  );
}

function getSignedUrl(file) {
  return file
    .getSignedUrl({ action: 'read', expires: `01-01-${new Date().getFullYear() + 20}` })
    .then(([url]) => url);
}

function saveDoc(doc, versionName, version) {
  let { versions } = doc.data();
  if (!versions) {
    versions = {};
  }
  versions[versionName] = version;
  return doc.ref.update({ versions }).then(() => version);
}
