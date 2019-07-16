export function setCurrentUser({ currentUser: laggedCurrentUser }, currentUser) {
  return { laggedCurrentUser, currentUser };
}
