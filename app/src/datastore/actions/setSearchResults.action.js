export function setSearchResults({ selecting }, searchResults) {
  if (searchResults) {
    selecting = true;
  }
  return { searchResults, selecting };
}
