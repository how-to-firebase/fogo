const httpMocks = require('node-mocks-http');
const imageOnRequest = require('./image.onRequest');
const environment = require('../utils').environmentUtil();
const { adminUtil, collectionsUtil } = require('../utils');

describe('Image onRequest', () => {
  const md5Hash = 'MjQyNjY5M2NiNTYxM2M4MTkwZmY0YjNmZDdjM2E3NzI=';
  const record = `test-${md5Hash}`;
  const recordData = require(`../../data/${record}.json`);

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
  beforeAll(done => {
    const admin = adminUtil(environment);
    const uploads = collectionsUtil(environment).get('uploads');

    doc = admin
      .firestore()
      .collection(uploads)
      .doc(record);

    doc.set(recordData).then(() => done(), done.fail);
  });

  it('should return a 404', done => {
    req.query = { record: 'not a valid record', width: 100 };
    fn(req, res)
      .then(done.fail)
      .catch(error => {
        expect(res.statusCode).toEqual(404);
        done();
      });
  });

  it('should return a 500', done => {
    req.query = { width: '1.1' };
    fn(req, res)
      .then(done.fail)
      .catch(error => {
        expect(res.statusCode).toEqual(500);
        done();
      });
  });

  describe('Versions', () => {
    it('should pipe an original file', done => {
      req.query = { record, environment: 'test' };
      fn(req, res).then(version => {
        expect(typeof version.url).toEqual('string');
        expect(res.statusCode).toEqual(200);
        done();
      });
    });

    it('should resize an image', done => {
      req.query = { record, environment: 'test', width: 100 };
      fn(req, res)
        .then(version => {
          expect(res.statusCode).toEqual(200);
          expect(typeof version.url).toEqual('string');
          done();
        })
        .catch(done.fail);
    });

    it('should refuse to resize an image to a larger width', done => {
      req.query = { record, environment: 'test', width: 500 };
      fn(req, res)
        .then(version => {
          expect(res.statusCode).toEqual(200);
          expect(typeof version.url).toEqual('string');
          done();
        })
        .catch(done.fail);
    });
  });
});
