export async function deleteSelection({ selection, images }) {
  const ref = window.firebase.storage().ref();
  const names = Array.from(selection)
    .map(id => images.find(image => image.__id == id))
    .map(image => image.name);
  const refs = names.map(name => ref.child(name));
  const filteredImages = images.filter(image => !selection.has(image.__id));

  await Promise.all(refs.map(ref => ref.delete()));

  return {
    images: filteredImages,
    selection: new Set(),
    selecting: false,
  };
}
