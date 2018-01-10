export async function imagesByTagQuery({ environment, tag }) {
  const uploads = environment.collections.uploads;
  const query = window.firebase
    .firestore()
    .collection(uploads)
    .where(`tags.${tag}`, '==', true);

  // Don't use an orderBy here because it requires a new index for every tag... which is insane!

  const snapshot = await query.get();
  const results = snapshot.docs
    .map(doc => ({
      __id: doc.id,
      ...doc.data(),
    }))
    .sort((a, b) => {
      return a.filename > b.filename ? 1 : -1;
    });

  return results;
}
