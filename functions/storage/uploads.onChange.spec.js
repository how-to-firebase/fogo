const environment = require('../utils').environmentUtil();
const uploadsOnChange = require('./uploads.onChange');

describe('uploadsOnChange', () => {
  let fn;
  beforeEach(() => {
    fn = uploadsOnChange({ environment });
  });

  it('should ignore files outside an "upload" directory', done => {
    fn({ data: { name: 'not-uploads/test.gif' } }).then(({ skipped }) => {
      expect(skipped).toEqual(true);
      done();
    });
  });

  it('should process an upload', done => {
    const name = 'some-env/uploads/test.gif';
    fn({ data: { name } }).then(result => {
      expect(result.name).toEqual(name);
      expect(result.isTest).toEqual(true);
      done();
    });
  });
});
