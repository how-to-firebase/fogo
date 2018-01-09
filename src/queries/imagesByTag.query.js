export async function imagesByTagQuery({ environment, tag }) {
  const uploads = environment.collections.uploads;
  const query = window.firebase
    .firestore()
    .collection(uploads)
    .where(`tags.${tag}`, '==', true)
    .orderBy('created');

  const snapshot = await query.get();
  const results = snapshot.docs.map(doc => ({
    __id: doc.id,
    ...doc.data(),
  }));

  return results;
}
