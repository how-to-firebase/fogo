export async function imagesQuery({ environment, cursor, limit = 10 }) {
  const uploads = environment.collections.uploads;
  const orderedCollection = window.firebase
    .firestore()
    .collection(uploads)
    .where('isProduction', '==', true)
    .orderBy('created', 'desc');
  const limitedCollection = orderedCollection.limit(+limit);
  const query = (cursor && limitedCollection.startAfter(cursor.created)) || limitedCollection;

  const snapshot = await query.get();
  const results = snapshot.docs.map(doc => ({
    __id: doc.id,
    ...doc.data(),
  }));

  return {
    results,
    imagesAllLoaded: results.length < +limit,
  };
}
