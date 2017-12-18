const httpMocks = require('node-mocks-http');
const imageOnRequest = require('./image.onRequest');
const environment = require('../utils').environmentUtil();
const { adminUtil, collectionsUtil } = require('../utils');
const FieldValue = require('firebase-admin').firestore.FieldValue;

describe('Image onRequest', () => {
  const md5Hash = 'MjQyNjY5M2NiNTYxM2M4MTkwZmY0YjNmZDdjM2E3NzI=';

  let fn;
  beforeEach(() => {
    fn = imageOnRequest({ environment });
  });

  let req;
  let res;
  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
  });

  let doc;
  beforeEach(() => {
    const admin = adminUtil(environment);
    const uploads = collectionsUtil(environment).get('uploads');

    doc = admin
      .firestore()
      .collection(uploads)
      .doc(md5Hash);
  });

  it('should return a 404', done => {
    req.query = { md5Hash: 'not a valid hash', width: 100 };
    fn(req, res).then(() => {
      expect(res.statusCode).toEqual(404);
      done();
    });
  });

  it('should return a 500', done => {
    req.query = { width: '1.1' };
    fn(req, res).then(done.fail)
    .catch(error => {
      expect(res.statusCode).toEqual(500);
      done();
    });
  });

  describe('Versions', () => {
    beforeEach(done => {
      doc.update({ versions: FieldValue.delete() }).then(() => done(), done.fail);
    });

    it('should resize an image', done => {
      req.query = { md5Hash: md5Hash, width: 100 };
      fn(req, res).then(url => {
        console.log('url', url);
        expect(res.statusCode).toEqual(200);
        done();
      });
    });
  });
});
