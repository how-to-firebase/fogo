export async function deleteImageQuery({ environment, id }) {
  const uploads = environment.collections.uploads;
  const doc = window.firebase
    .firestore()
    .collection(uploads)
    .doc(id);

  await doc.update({ deleted: true });
}
