const functions = require('firebase-functions');
const environmentUtil = require('./environment.util');

describe('environmentUtil', () => {
  const firebaseProject = process.env.FIREBASE_PROJECT;
  afterEach(() => {
    process.env.FIREBASE_PROJECT = firebaseProject;
  });

  it('should allow functions.config() to override config', () => {
    process.env.FIREBASE_PROJECT = JSON.stringify({ overridden: true });
    const environment = environmentUtil(functions);
    expect(environment.firebase.overridden).toEqual(true);
  });

  it('should read development environment', () => {
    const environment = environmentUtil(functions);
    expect(typeof environment.firebase).toEqual('object');
  });
});
