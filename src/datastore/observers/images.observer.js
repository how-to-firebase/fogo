import { Observer } from 'rx';

export function imagesObserver({ environment }) {
  return Observer.create(observe => {
    const uploads = environment.collections.uploads;
    const collection = window.firebase
      .firestore()
      .collection(uploads)
      .orderBy('CreateDate')
      .limit(1);

    collection.onSnapshot(docs => {
      console.log('docs', docs);
      docs.forEach(doc => {
        console.log('doc.id', doc.id);
        console.log('doc.data()', doc.data());
      })
    })
  });
}
