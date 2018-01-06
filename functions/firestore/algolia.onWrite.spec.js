const algoliaOnWrite = require('./algolia.onWrite');
const { adminUtil, algoliaUtil, collectionsUtil, environmentUtil } = require('../utils');
const environment = environmentUtil();
const admin = adminUtil(environment);
const uploads = collectionsUtil(environment).get('uploads');
const db = admin.firestore();
const collection = db.collection(uploads);

describe('algoliaOnWrite', () => {
  let client, initObject, deleteObject, addObject;
  beforeEach(() => {
    client = algoliaUtil(environment);
    deleteObject = jest.fn(() => Promise.resolve());
    addObject = jest.fn(() => Promise.resolve());
    jest.spyOn(client, 'initIndex').mockImplementation(() => ({ deleteObject, addObject }));
  });

  let fn;
  beforeEach(() => {
    fn = algoliaOnWrite({ environment });
  });

  const id = 'fake-id';
  const data = {
    search: 'fake search',
  };
  let event;
  beforeEach(() => {
    event = { data: { id, exists: true, data: () => data } };
  });

  afterEach(() => client.initIndex.mockRestore());

  it('should call deleteObject', done => {
    event.data.exists = false;
    fn(event).then(result => {
      expect(deleteObject).toHaveBeenCalledWith(id);
      done();
    });
  });

  it('should call addObject', done => {
    fn(event).then(result => {
      const { search } = data;
      const record = { objectID: id, search };
      expect(addObject).toHaveBeenCalledWith(record);
      done();
    });
  });
});
