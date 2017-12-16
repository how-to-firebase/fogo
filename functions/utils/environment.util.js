const path = require('path');
const admin = require('firebase-admin');
const config = require('../config.json');
const serviceAccountPath = `../${config.firebase.serviceAccount}`;
const { clean } = require('@quiver/firebase-utilities');

module.exports = functions => {
  if (!functions) {
    functions = require('firebase-functions');
  }
  if (!process.env.FIREBASE_PROJECT) {
    const serviceAccount = require(serviceAccountPath);
    const credential = admin.credential.cert(serviceAccount);
    process.env.FIREBASE_PROJECT = JSON.stringify(config.firebase);
  }
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(__dirname, serviceAccountPath);
  }

  const nodeEnv = process.env.NODE_ENV;
  const env = clean({
    isProduction: nodeEnv == 'production' || undefined,
    isTest: nodeEnv == 'test' || undefined,
    isDevelopment: nodeEnv == 'development' || undefined,
  });

  return Object.assign(config, functions.config(), {env, nodeEnv});
};
