export function removeSelection({ selection, selecting }, id) {
  selection.delete(id);
  if (!selection.size) {
    selecting = false;
  }
  return { selection: new Set(selection), selecting };
}
