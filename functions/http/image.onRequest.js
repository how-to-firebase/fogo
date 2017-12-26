const fs = require('fs');
const path = require('path');
const request = require('request');
const { exec } = require('child_process');
const GoogleUrl = require('google-url');
const { adminUtil, collectionsUtil } = require('../utils');

module.exports = ({ environment }) => (req, res) => {
  const error = getError(req, res);
  if (error) {
    return handleError(res, 500, error);
  } else {
    const googleUrl = new GoogleUrl({ key: environment.apiKeys.googleUrlShortener });
    const shorten = promisify(googleUrl.shorten.bind(googleUrl));
    const { record, width, height } = req.query;
    const { admin, uploads } = getEnvironmentDependencies(environment);
    const doc = getDoc(admin, uploads, record);

    return doc
      .get()
      .catch(error => handleError(res, 500, error))
      .then(doc => {
        if (!doc.exists) {
          return handleError(res, 404, 'Not Found');
        } else {
          const version = getVersion(doc, { width, height });
          const admin = adminUtil(environment);

          return (
            version ||
            createNewVersion(admin, shorten, doc, { width, height }).catch(error =>
              handleError(res, 500, error)
            )
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

function promisify(fn) {
  return arg =>
    new Promise((resolve, reject) => fn(arg, (err, res) => (err ? reject(err) : resolve(res))));
}

function getError(req) {
  const { width, height } = req.query;
  let error;

  if ((width && !isInt(width)) || (height && !isInt(height))) {
    error = `width or height must be an integer: ${JSON.stringify({ width, height })}`;
  }
  return error;
}

function isInt(s) {
  const int = parseInt(s);
  return s && String(int) == s;
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

function getVersion(doc, { width, height }) {
  const data = doc.data();
  const versions = data.versions || {};
  const versionName = getVersionName({ width, height });
  return versions && versions[versionName];
}

function createNewVersion(admin, shorten, doc, { width, height }) {
  const versionName = getVersionName({ width, height });
  const filename = getFilename(doc);
  const file = getFile(admin, filename);

  return Promise.resolve()
    .then(() => {
      if (versionName == 'original') {
        return file;
      } else {
        return convertFile(admin, file, versionName);
      }
    })
    .then(file => getSignedUrl(file).then(url => ({ url, name: file.name })))
    .then(({ url, name }) => {
      return shorten(url).then(shortUrl => ({
        url,
        name,
        shortUrl,
      }));
    })
    .then(version => saveDoc(doc, versionName, version));
}

function getVersionName({ width, height }) {
  return width || (height && `x${height}`) || 'original';
}

function getFilename(doc) {
  const { name } = doc.data();
  return name;
}

function convertFile(admin, file, versionName) {
  const filename = file.name;
  const localFilename = getLocalFilename(filename);

  return file
    .download({ destination: localFilename })
    .then(() => convertLocalFile(localFilename, versionName))
    .then(() => {
      const destination = getDestination(filename, versionName);
      const newFile = getFile(admin, destination);

      return newFile.bucket
        .upload(localFilename, {
          destination,
          metadata: {
            cacheControl: 'public, max-age=31536000',
          },
        })
        .then(() => unlinkPromise(localFilename))
        .then(() => newFile);
    });
}

function getLocalFilename(filename) {
  return `/tmp/${path.parse(filename).base}`;
}

function convertLocalFile(localFilename, versionName) {
  const cmd = getCmd(localFilename, versionName);
  return execPromise(cmd);
}

function getCmd(localFilename, versionName) {
  return `convert ${localFilename} -resize ${versionName}\\> ${localFilename}`;
}

function execPromise(cmd) {
  return new Promise((resolve, reject) =>
    exec(cmd, (error, stdout) => (error ? reject(error) : resolve(stdout)))
  );
}

function getDestination(filename, versionName) {
  const filenameParts = filename.split('/');
  filenameParts[filenameParts.length - 2] = versionName;
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
