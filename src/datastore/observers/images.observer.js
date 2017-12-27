export function imagesObserver({environment, limit}) {
  const uploads = environment.collections.uploads;
  const collection = window.firebase
    .firestore()
    .collection(uploads)
    .orderBy('CreateDate')
    .limit(limit);
  const query = cursor
}