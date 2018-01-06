export function setSearching({ selection }, searching) {
  if (searching) {
    selection = new Set();
  }
  return { searching: !!searching, search: '', selection };
}
