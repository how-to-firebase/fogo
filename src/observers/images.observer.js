import { Observable } from 'rxjs/Observable';

export function imagesObserver({ environment }) {
  return Observable.create(observer => {
    const { functionsEnvironment, collections } = environment;
    const ref = window.firebase
      .database()
      .ref(functionsEnvironment)
      .child(collections.uploads)
      .orderByValue()
      .limitToLast(1);

    const handler = ref.on('child_added', snapshot =>
      observer.next({ __id: `${functionsEnvironment}-${snapshot.key}`, value: snapshot.val() })
    );

    return () => ref.off('child_added', handler);
  });
}
