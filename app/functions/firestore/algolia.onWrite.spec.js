const algoliaOnWrite = require('./algolia.onWrite');
const { adminUtil, algoliaUtil, collectionsUtil, environmentUtil } = require('../utils');
const environment = environmentUtil();
const admin = adminUtil(environment);
const uploads = collectionsUtil(environment).get('uploads');
const db = admin.firestore();
const collection = db.collection(uploads);

describe('algoliaOnWrite', () => {
  const setSettings = jest.fn(() => Promise.resolve());
  let client, initObject, addObject, deleteObject;
  beforeEach(() => {
    client = algoliaUtil(environment);
    addObject = jest.fn(() => Promise.resolve());
    deleteObject = jest.fn(() => Promise.resolve());
    addObject = jest.fn(() => Promise.resolve());

    jest
      .spyOn(client, 'initIndex')
      .mockImplementation(() => ({ addObject, deleteObject, setSettings }));
  });

  let fn;
  beforeEach(() => {
    fn = algoliaOnWrite({ environment });
  });

  const id = 'fake-id';
  const data = {
    environment: 'test env',
    filename: 'fake filename',
    versions: 'fake versions',
  };
  let params = { id };
  let change;
  beforeEach(() => {
    change = { after: { data: () => data } };
  });

  afterEach(() => client.initIndex.mockRestore());

  it('should call deleteObject', done => {
    fn({ after: { data: () => null } }, { params }).then(result => {
      expect(deleteObject).toHaveBeenCalledWith(id);
      done();
    });
  });

  it('should call addObject', done => {
    fn(change, { params }).then(result => {
      const record = Object.assign({ objectID: id }, data);
      expect(addObject).toHaveBeenCalledWith(record);
      done();
    });
  });

  it('should call setSettings exactly once', done => {
    Promise.all([fn(change, { params }), fn(change, { params })]).then(() => {
      expect(setSettings.mock.calls.length).toEqual(1);
      expect(setSettings).toHaveBeenCalledWith(environment.algolia.settings);
      done();
    });
  });
});
