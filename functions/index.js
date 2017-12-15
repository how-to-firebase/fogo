const functions = require('firebase-functions');
const { environmentUtil } = require('./utils');
const environment = environmentUtil(functions);
const { uploadsOnChange } = require('./storage');

exports.uploadsOnChange = functions.storage.object().onChange(uploadsOnChange({ environment }));
