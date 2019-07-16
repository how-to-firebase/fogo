export async function imagesQuery({ environment, cursor, images, limit = 10 }) {
  const uploads = environment.collections.uploads;
  const orderedCollection = window.firebase
    .firestore()
    .collection(uploads)
    .where('environment', '==', environment.environment)
    .orderBy('created', 'desc');
  const limitedCollection = orderedCollection.limit(+limit);
  const query = (cursor && limitedCollection.startAfter(cursor.created)) || limitedCollection;

  const snapshot = await query.get();
  const results = snapshot.docs
    .map(doc => {
      const image = {
        __id: doc.id,
        ...doc.data(),
      };
      if (image.tags) {
        image.tags = Object.keys(image.tags);
      }
      return image;
    })
    .filter(({ deleted }) => !deleted);

  return {
    results,
    imagesAllLoaded: results.length < +limit,
  };
}
