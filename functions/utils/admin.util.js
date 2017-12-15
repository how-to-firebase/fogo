const admin = require('firebase-admin');

module.exports = ({ firebase }) => {
  admin.initializeApp(firebase);
  return admin;
};
