const functions = require('firebase-functions');
const { environmentUtil } = require('./utils');
const environment = environmentUtil(functions);

// Storage
const { uploadsOnChange } = require('./storage');
exports.uploadsOnChange = functions.storage.object().onChange(uploadsOnChange({ environment }));

// Https
const cors = require('cors');
const corsFn = cors();
// https://mhaligowski.github.io/blog/2017/03/10/cors-in-cloud-functions.html
const corsMiddleware = fn => (req, res) => corsFn(req, res, () => fn(req, res));

const { imageOnRequest } = require('./http');
exports.image = functions.https.onRequest(corsMiddleware(imageOnRequest({ environment })));
