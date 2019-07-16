export async function imageQuery(environment, id) {
  const uploads = environment.collections.uploads;
  const ref = window.firebase
    .firestore()
    .collection(uploads)
    .doc(id);
  const doc = await ref.get();
  const image = {
    __id: doc.id,
    ...doc.data(),
  };

  if (image.tags) {
    image.tags = Object.keys(image.tags);
  }

  return image;
}
