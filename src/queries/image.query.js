export async function imageQuery(environment, id) {
  const uploads = environment.collections.uploads;
  const ref = window.firebase
    .firestore()
    .collection(uploads)
    .doc(id);
  const doc = await ref.get();

  return {
    __id: doc.id,
    ...doc.data(),
  };
}