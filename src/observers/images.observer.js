import { Observable } from 'rxjs/Observable';

export function imagesObserver({ environment }) {
  return Observable.create(observer => {
    const uploads = environment.collections.uploads;
    const collection = window.firebase
      .firestore()
      .collection(uploads)
      .where('environment', '==', environment.environment)
      .orderBy('created', 'desc')
      .limit(1);

    return collection.onSnapshot(docs =>
      docs.forEach(doc => observer.next({ __id: doc.id, ...doc.data() }))
    );
  });
}
