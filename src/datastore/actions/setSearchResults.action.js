export function setSearchResults({ selecting }, searchResults) {
  if (searchResults && searchResults.hits.length) {
    selecting = true;
  }
  return { searchResults, selecting };
}
