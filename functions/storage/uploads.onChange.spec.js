const uploadsOnChange = require('./uploads.onChange');
const { adminUtil, collectionsUtil, environmentUtil } = require('../utils');
const environment = environmentUtil();
const admin = adminUtil(environment);
const uploads = collectionsUtil(environment).get('uploads');
const db = admin.firestore();
const collection = db.collection(uploads);

describe('uploadsOnChange', () => {
  let fn;
  beforeEach(() => {
    fn = uploadsOnChange({ environment });
  });

  // afterAll(done => {
  //   collection
  //     .where('isTest', '==', true)
  //     .get()
  //     .then(snapshot => {
  //       const batch = db.batch();
  //       snapshot.docs.forEach(doc => batch.delete(doc.ref));
  //       return batch.commit();
  //     });
  // });

  it('should ignore files outside an "upload" directory', done => {
    fn({ name: 'not-uploads/test.gif', md5Hash: 'not-a-hash/but-with-a-slash' }).then(
      ({ skipped }) => {
        expect(skipped).toEqual(true);
        done();
      }
    );
  });

  it('should process an upload', done => {
    const name = 'test-bypass/uploads/exif.jpg';
    fn({ name, resourceState: 'exists', md5Hash: 'not-a-hash/but-with-a-slash' }).then(result => {
      expect(result.name).toEqual(name);
      expect(result.isTest).toEqual(true);
      expect(result.environment).toEqual('test-bypass');
      done();
    });
  });
});
