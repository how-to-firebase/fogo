export async function loadImages({ images, imagesAllLoaded, environment }, limit = 10) {
  const uploads = environment.collections.uploads;
  const orderedCollection = window.firebase
    .firestore()
    .collection(uploads)
    .where('isProduction', '==', true)
    .orderBy('CreateDate');
  const limitedCollection = orderedCollection.limit(+limit);
  const lastImage = images[images.length - 1] || {};
  const createDate = lastImage.CreateDate;
  const query = (createDate && limitedCollection.startAfter(createDate)) || limitedCollection;

  return query
    .get()
    .then(docs => {
      const results = [];

      docs.forEach(doc => {
        results.push({
          __id: doc.id,
          ...doc.data(),
        });
      });

      return results;
    })
    .then(results => {
      imagesAllLoaded = results.length < +limit;

      return (
        (imagesAllLoaded && { results, imagesAllLoaded }) ||
        orderedCollection
          .startAfter(results[results.length - 1])
          .limit(1)
          .get()
          .then(docs => ({ results, imagesAllLoaded: !docs.size }))
      );
    })
    .then(({ results, imagesAllLoaded }) => {
      return { images: images.concat(results), imagesAllLoaded };
    });
}
