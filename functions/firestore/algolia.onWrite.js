module.exports = ({ environment }) => event => {
  const id = event.data.id;
  const data = (event.data.exists && event.data.data()) || null;
  console.log('Firestore data', id, data);

  return Promise.resolve({ id, data });
};
