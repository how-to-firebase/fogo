const algoliaOnWrite = require('./algolia.onWrite');
const { adminUtil, collectionsUtil, environmentUtil } = require('../utils');
const environment = environmentUtil();
const admin = adminUtil(environment);
const uploads = collectionsUtil(environment).get('uploads');
const db = admin.firestore();
const collection = db.collection(uploads);

describe('algoliaOnWrite', () => {
  const id = 'fake-id';
  const data = {
    test: 1,
  };

  let fn;
  beforeEach(() => {
    fn = algoliaOnWrite({ environment });
  });

  let event;
  beforeEach(() => {
    event = { data: {id, data: () => data} };
  });

  it('should return an id and data', done => {
    fn(event).then(result => {
      expect(result.id).toEqual(id);
      expect(result.data).toEqual(data);
      done();
    });
  });
});
