export function setSearching({ searchResults, selection, selecting }, searching) {
  if (searching) {
    selection = new Set();

    if (searchResults) {
      selecting = true;
    }
  }
  return { searching: !!searching, search: '', selection, selecting };
}
