export function addSelection({ selection }, ids) {
  if (typeof ids == 'string') {
    ids = [ids];
  }
  
  ids.forEach(id => selection.add(id));
  return { selection: new Set(selection), selecting: true };
}
