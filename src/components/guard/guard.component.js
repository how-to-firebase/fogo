import { connect } from 'unistore';
import { store, actions } from '../../datastore';
import { route } from 'preact-router';
import Match from 'preact-router/match';

function evaluatePath({ path, laggedPath, currentUser }) {
  const parts = new Set(path.split('/'));
  const needsToLogIn = !currentUser && !parts.has('gallery');
  const isOAuthRedirect = !laggedPath && currentUser && path == '/login';

  if (needsToLogIn && path != '/login') {
    location.pathname = '/login';
  } else if (isOAuthRedirect) {
    route(laggedPath || '/');
  } else if (path == '/') {
    route('/images');
  }
}

export default connect('laggedPath,currentUser', actions)(({ laggedPath, currentUser }) => {
  return (
    <Match>{({ matches, path, url }) => evaluatePath({ path, laggedPath, currentUser })}</Match>
  );
});
