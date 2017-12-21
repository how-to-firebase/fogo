export function addSelection({ selection }, id) {
  selection.add(id);
  return { selection: new Set(selection) };
}
