const functions = require('firebase-functions');
const environmentUtil = require('./environment.util');

describe('environmentUtil', () => {
  it('should read development environment', () => {
    const environment = environmentUtil(functions);
    expect(typeof environment.firebase).toEqual('object');
  });
});
