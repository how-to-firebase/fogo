const path = require('path');
const admin = require('firebase-admin');
const config = require('../config.json');
const serviceAccount = require('../service-account.json');
console.log(require('../utils'));
const { clean } = require('../utils').firebaseUtil;

module.exports = functions => {
  if (!functions) {
    functions = require('firebase-functions');
  }
  if (!process.env.FIREBASE_PROJECT) {
    const credential = admin.credential.cert(serviceAccount);
    process.env.FIREBASE_PROJECT = JSON.stringify(config.firebase);
  }
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(__dirname, '../service-account.json');
  }

  const nodeEnv = process.env.NODE_ENV;
  const env = clean({
    isProduction: nodeEnv == 'production' || undefined,
    isTest: nodeEnv == 'test' || undefined,
    isDevelopment: nodeEnv == 'development' || undefined,
  });

  return { ...config, ...functions.config(), env, nodeEnv };
};
