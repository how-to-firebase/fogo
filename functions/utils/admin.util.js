const admin = require('firebase-admin');
let singleton;

module.exports = ({ firebase }) => {
  if (!singleton) {
    singleton = admin.initializeApp(firebase)
  }
  return singleton;
};
