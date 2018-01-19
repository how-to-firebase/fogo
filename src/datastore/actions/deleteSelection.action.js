import { deleteImageQuery } from '../../queries/deleteImage.query';

export async function deleteSelection({ environment, selection, images }) {
  const ref = window.firebase.storage().ref();
  const records = Array.from(selection)
    .map(id => images.find(image => image.__id == id))
    .map(image => ({
      id: image.__id,
      ref: ref.child(image.name),
    }));
  const filteredImages = images.filter(image => !selection.has(image.__id));

  try {
    await Promise.all(
      records.map(async ({ id, ref }) => {
        await deleteImageQuery({ environment, id });
        return ref.delete();
      })
    );
  } catch (e) {
    console.log('e', e);
    console.error('Image deletion failed', records.map(({ id }) => id).join());
  }

  return {
    images: filteredImages,
    selection: new Set(),
    selecting: false,
  };
}
