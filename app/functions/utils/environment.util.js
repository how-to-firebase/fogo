const path = require('path');
const admin = require('firebase-admin');
const config = require('../config.json');
const serviceAccountPath = `../${config.firebase.serviceAccount}`;
const { clean } = require('@quiver/firebase-utilities');

module.exports = functions => {
  if (!functions) {
    functions = require('firebase-functions');
  }
  if (!process.env.FIREBASE_CONFIG) {
    const serviceAccount = require(serviceAccountPath);
    const credential = admin.credential.cert(serviceAccount);
    process.env.FIREBASE_CONFIG = JSON.stringify(config.firebase);
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
  const nativeConfig = functions.config();
  const firebaseConfig = Object.keys(nativeConfig).length ? nativeConfig : config.firebase;

  return Object.assign(config, firebaseConfig, { env, nodeEnv });
};
