export function setSearching({ searchResults, selection, selecting }, searching) {
  if (searching) {
    selection = new Set();

    if (searchResults) {
      selecting = true;
    }
  } else {
    searchResults = null
  }
  return { searching: !!searching, search: '', searchResults, selection, selecting };
}
