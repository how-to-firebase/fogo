export async function loadImages({ images, imagesAllLoaded, environment }) {
  const uploads = environment.collections.uploads;
  const collection = window.firebase
    .firestore()
    .collection(uploads)
    .orderBy('name')
    .limit(3);
  const lastImage = images[images.length - 1] || {};
  const lastName = lastImage.name;
  const query = (lastName && collection.startAfter(lastName)) || collection;

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
