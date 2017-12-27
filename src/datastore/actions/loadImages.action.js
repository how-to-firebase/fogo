export async function loadImages({ images, imagesAllLoaded, environment }, limit = 10) {
  const uploads = environment.collections.uploads;
  const collection = window.firebase
    .firestore()
    .collection(uploads)
    .orderBy('CreateDate')
    .limit(limit);
  const lastImage = images[images.length - 1] || {};
  const createDate = lastImage.CreateDate;
  const query = (createDate && collection.startAfter(createDate)) || collection;

  return query.get().then(docs => {
    const results = [];

    docs.forEach(doc => {
      results.push({
        __id: doc.id,
        ...doc.data(),
      });
    });

    imagesAllLoaded = !docs.size;

    return { images: images.concat(results), imagesAllLoaded };
  });
}
