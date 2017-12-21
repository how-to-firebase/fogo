export function removeSelection({ selection }, id) {
  selection.delete(id);
  return { selection: new Set(selection) };
}
