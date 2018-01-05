const functions = require('firebase-functions');
const { collectionsUtil, environmentUtil } = require('./utils');
const environment = environmentUtil(functions);
const uploads = collectionsUtil(environment).get('uploads');

// Admin
const { customClaimOnCreate } = require('./auth');
exports.customClaimOnCreate = functions.auth.user().onCreate(customClaimOnCreate({ environment }));

// Firestore
const { algoliaOnWrite } = require('./firestore');
exports.algoliaUploadsOnWrite = functions.firestore
  .document(`${uploads}/{id}`)
  .onWrite(algoliaOnWrite({ environment }));

// Https
const cors = require('cors');
const corsFn = cors();
// https://mhaligowski.github.io/blog/2017/03/10/cors-in-cloud-functions.html
const corsMiddleware = fn => (req, res) => corsFn(req, res, () => fn(req, res));

const { imageOnRequest } = require('./http');
exports.image = functions.https.onRequest(corsMiddleware(imageOnRequest({ environment })));

// Storage
const { uploadsOnChange } = require('./storage');
exports.uploadsOnChange = functions.storage.object().onChange(uploadsOnChange({ environment }));
