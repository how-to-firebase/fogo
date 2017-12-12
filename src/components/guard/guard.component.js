import { connect } from 'unistore';
import { store, actions } from '../../datastore';
import { route } from 'preact-router';
import Match from 'preact-router/match';

function evaluatePath({ path, laggedPath, currentUser }) {
  const needsToLogIn = !currentUser;
  const isOAuthRedirect = !laggedPath && currentUser && path == '/login';

  if (needsToLogIn && path != '/login') {
    route('/login');
  } else if (isOAuthRedirect) {
    route(laggedPath || '/');
  }
}

export default connect('laggedPath,currentUser', actions)(({ laggedPath, currentUser }) => {
  return (
    <Match>{({ matches, path, url }) => evaluatePath({ path, laggedPath, currentUser })}</Match>
  );
});
