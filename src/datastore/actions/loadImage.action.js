export async function loadImage({ images, imageIds, environment }, id) {
  const uploads = environment.collections.uploads;
  const ref = window.firebase
    .firestore()
    .collection(uploads)
    .doc(id);

  return ref.get().then(doc => {
    const result = {
      __id: doc.id,
      ...doc.data(),
    };
  });

  return query
    .get()
    .then(snapshot => {
      return snapshot.docs.map(doc => ({
        __id: doc.id,
        ...doc.data(),
      }));
    })
    .then(results => {
      imagesAllLoaded = results.length < +limit;
      return { images: images.concat(results), imagesAllLoaded };
    });
}
