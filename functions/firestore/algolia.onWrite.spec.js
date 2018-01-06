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
    search: { filename: 'fake filename' },
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
      const record = Object.assign({ objectID: id }, search);
      expect(addObject).toHaveBeenCalledWith(record);
      done();
    });
  });

  it('should call setSettings exactly once', done => {
    Promise.all([fn(event), fn(event)]).then(() => {
      expect(setSettings.mock.calls.length).toEqual(1);
      expect(setSettings).toHaveBeenCalledWith(environment.algolia.settings);
      done();
    });
  });
});
