const functions = require('firebase-functions');
const { environmentUtil } = require('./utils');
const environment = environmentUtil(functions);

// Storage
const { uploadsOnChange } = require('./storage');
exports.uploadsOnChange = functions.storage.object().onChange(uploadsOnChange({ environment }));

// Https
const { imageOnRequest } = require('./http');
exports.image = functions.https.onRequest(imageOnRequest({ environment }));
