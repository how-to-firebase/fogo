const { adminUtil, environmentUtil } = require('../utils');
const environment = environmentUtil();
const customClaimOnCreate = require('./customClaim.onCreate');

describe('Custom Claim onCreate', () => {
  const uid = 'fake-uid';
  const user = {
    isTest: true,
    email: 'user@chrisesplin.com',
  };
  const adminUser = {
    isTest: true,
    isAdmin: true,
    email: 'admin@chrisesplin.com',
  };
  const admin = adminUtil(environment);
  const db = admin.firestore();
  const collection = db.collection(environment.collections.users);
  const query = collection.where('isTest', '==', true);
  const idTokenRefreshPath = environment.refs.idTokenRefresh.replace(/\{uid\}/, uid);
  const idTokenRefreshRef = admin.database().ref(idTokenRefreshPath);
  beforeAll(done => {
    deleteTestUsers()
      .then(() => collection.add(user))
      .then(() => collection.add(adminUser))
      .then(() => done(), done.fail);
  });

  afterAll(done => deleteTestUsers().then(() => done(), done.fail));

  function deleteTestUsers() {
    return query
      .get()
      .then(snapshot => {
        const batch = db.batch();
        snapshot.forEach(doc => batch.delete(doc.ref));
        return batch.commit();
      })
      .then(() => idTokenRefreshRef.remove());
  }

  const setCustomUserClaims = jest.fn(() => Promise.resolve(true));
  beforeAll(() => {
    // This works because adminUtil returns a singleton
    jest.spyOn(admin, 'auth').mockImplementation(() => ({ setCustomUserClaims }));
  });

  afterAll(() => admin.auth.mockRestore());

  let fn;
  beforeEach(() => {
    fn = customClaimOnCreate({ environment });
  });

  it('Initial state', done => {
    query.get().then(snapshot => {
      expect(snapshot.size).toEqual(2);
      done();
    });
  });

  describe('handles users based on isAdmin flag', () => {
    it('should reject a non-admin user', done => {
      fn({ data: { uid, email: 'user@chrisesplin.com' } }).then(result => {
        expect(result).toEqual(false);
        done();
      });
    });

    it('should set the admin claim for an admin user', done => {
      fn({ data: { uid, email: 'admin@chrisesplin.com' } }).then(result => {
        expect(result).toEqual(true);
        expect(setCustomUserClaims).toHaveBeenCalledWith(uid, { admin: true });
        done();
      });
    });

    it('should update idTokenRefresh timestamp', done => {
      const now = Date.now();
      fn({ data: { uid } })
        .then(() => idTokenRefreshRef.once('value'))
        .then(snapshot => {
          const value = snapshot.val();
          expect(value > now).toEqual(true);
          done();
        });
    });
  });
});
