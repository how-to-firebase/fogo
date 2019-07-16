export function setToken(state, token) {
  return { token, isAdmin: token.admin };
}
