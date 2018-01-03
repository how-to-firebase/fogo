const { adminUtil, collectionsUtil } = require('../utils');

module.exports = ({ environment }) => event => {
  const user = event.data;
  const admin = adminUtil(environment);
  const idTokenRefreshPath = environment.refs.idTokenRefresh.replace(/\{uid\}/, user.uid);
  const idTokenRefreshRef = admin.database().ref(idTokenRefreshPath);
  const collection = admin.firestore().collection(environment.collections.users);
  const query = collection.where('isAdmin', '==', true);

  return query
    .get()
    .then(snapshot => {
      const emails = new Set(snapshot.docs.map(doc => doc.data().email));
      return (
        emails.has(user.email) &&
        admin
          .auth()
          .setCustomUserClaims(user.uid, { admin: true })
          .then(() => true)
      );
    })
    .then(isAdmin => idTokenRefreshRef.set(Date.now()).then(() => isAdmin));
};
